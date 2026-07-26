function safeArray(value){return Array.isArray(value)?value:[];}
function compactText(value,limit=900){return String(value||'').replace(/\s+/g,' ').trim().slice(0,limit);}
function normalizeEmail(value){const email=String(value||'').trim().toLowerCase();return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)?email:'';}
function normalizeName(value){return String(value||'').toLowerCase().replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();}
function stableKey(parts=[]){return parts.map(v=>String(v||'').trim().toLowerCase()).filter(Boolean).join(':')||'unknown';}
function iso(value){if(!value)return null;if(value instanceof Date)return value.toISOString();const d=new Date(value);return Number.isNaN(d.getTime())?null:d.toISOString();}
function personRef(value={}){
  if(typeof value==='string')return {name:'',email:normalizeEmail(value)};
  return {name:String(value.name||value.displayName||value.contactName||'').trim(),email:normalizeEmail(value.email||value.address||value.contactEmail)};
}
function messageDate(message={}){
  return iso(message.receivedAt||message.date||message.sentAt||message.internalDate||message.createdAt)||new Date().toISOString();
}
function messageDirection(message={},ownerEmails=[]){
  const from=normalizeEmail(message.from?.email||message.sender?.email);
  const owners=new Set(ownerEmails.map(normalizeEmail).filter(Boolean));
  if(from&&owners.has(from))return 'outbound';
  return 'inbound';
}
function messageConversationKey(message={}){
  return stableKey([message.provider||'email',message.threadId||message.messageId||message.subject]);
}
function normalizeMessage(message={},ownerEmails=[]){
  const provider=String(message.provider||'email').toLowerCase();
  const messageId=String(message.messageId||message.id||'');
  const threadId=String(message.threadId||message.conversationId||messageId||'');
  const receivedAt=messageDate(message);
  const sender=personRef(message.from||message.sender||{});
  const recipients=safeArray(message.to||message.recipients).map(personRef).filter(p=>p.email||p.name);
  const cc=safeArray(message.cc).map(personRef).filter(p=>p.email||p.name);
  const bodyText=compactText(message.bodyText||message.body?.content||message.text||message.bodyPreview||message.snippet,12000);
  return {
    provider,messageId,threadId,
    direction:messageDirection(message,ownerEmails),
    sender,recipients,cc,bcc:safeArray(message.bcc).map(personRef).filter(p=>p.email||p.name),
    subject:String(message.subject||'(No subject)').trim()||'(No subject)',
    bodyPreview:compactText(message.bodyPreview||message.snippet||bodyText,1200),
    bodyText,
    snippet:compactText(message.snippet||message.bodyPreview||bodyText,700),
    labels:safeArray(message.labels||message.labelIds),
    hasAttachments:!!message.hasAttachments,
    webLink:String(message.webLink||message.link||''),
    receivedAt,
    sentAt:iso(message.sentAt||message.sentDateTime)||null,
    raw:message,
    conversationKey:messageConversationKey({provider,threadId,messageId,subject:message.subject})
  };
}
function pgRow(row={}){
  const out={};
  for(const [k,v] of Object.entries(row||{}))out[k]=v instanceof Date?v.toISOString():v;
  return out;
}
function jsonValue(value,fallback){if(value==null)return fallback;if(typeof value==='string'){try{return JSON.parse(value);}catch(_){return fallback;}}return value;}
function rowToMessage(row={}){
  const raw=jsonValue(row.raw_json||row.rawJson,{});
  return {
    id:row.id,messageId:row.message_id||row.messageId,threadId:row.thread_id||row.threadId,provider:row.provider,
    unifiedConversationId:row.unified_conversation_id||row.unifiedConversationId,direction:row.direction,
    from:jsonValue(row.sender_json||row.senderJson,{}),to:jsonValue(row.recipients_json||row.recipientsJson,[]),
    cc:jsonValue(row.cc_json||row.ccJson,[]),bcc:jsonValue(row.bcc_json||row.bccJson,[]),
    subject:row.subject,bodyPreview:row.body_preview||row.bodyPreview||'',bodyText:row.body_text||row.bodyText||'',bodyHtml:raw.bodyHtml||raw.body_html||'',
    snippet:row.snippet||'',labels:jsonValue(row.labels_json||row.labelsJson,[]),hasAttachments:!!(row.has_attachments??row.hasAttachments),
    webLink:row.web_link||row.webLink||'',receivedAt:row.received_at||row.receivedAt||'',sentAt:row.sent_at||row.sentAt||'',
    raw,
    createdAt:row.created_at||row.createdAt||'',updatedAt:row.updated_at||row.updatedAt||''
  };
}
function createValConversationIdentityService({
  dbQuery,
  hasPg=()=>false,
  getStore=()=>({}),
  saveStore=()=>{},
  uuid=(prefix)=>`${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`,
  tenantId=()=>'default',
  userId=()=>'default',
  ownerEmails=[],
  fetchGmailMessages,
  fetchUnifiedOutlookEmails,
  resolveContactFromContext,
  logger=console
}={}){
  function now(){return new Date().toISOString();}
  function store(){
    const s=getStore()||{};
    for(const key of ['emailMessages','emailThreads','unifiedConversations','conversationClassifications'])if(!Array.isArray(s[key]))s[key]=[];
    return s;
  }
  async function upsertUnifiedConversationForMessage(message){
    const participants=[message.sender,...message.recipients,...message.cc].filter(p=>p.email||p.name);
    const participantKeys=[...new Set(participants.map(p=>p.email||normalizeName(p.name)).filter(Boolean))];
    const id='uc_'+Buffer.from(`${tenantId()}|${userId()}|${message.conversationKey}`).toString('base64url').slice(0,48);
    if(hasPg()){
      const r=await dbQuery(`
        insert into unified_conversations (id,tenant_id,user_id,conversation_key,primary_provider,primary_thread_id,subject,participant_keys_json,participants_json,latest_message_at,latest_inbound_at,latest_outbound_at,message_count,metadata_json,updated_at)
        values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,1,$13,now())
        on conflict (tenant_id,user_id,conversation_key) do update set
          subject=coalesce(nullif(excluded.subject,''),unified_conversations.subject),
          participants_json=excluded.participants_json,
          participant_keys_json=excluded.participant_keys_json,
          latest_message_at=greatest(coalesce(unified_conversations.latest_message_at,'epoch'),excluded.latest_message_at),
          latest_inbound_at=greatest(coalesce(unified_conversations.latest_inbound_at,'epoch'),coalesce(excluded.latest_inbound_at,'epoch')),
          latest_outbound_at=greatest(coalesce(unified_conversations.latest_outbound_at,'epoch'),coalesce(excluded.latest_outbound_at,'epoch')),
          message_count=unified_conversations.message_count+1,
          updated_at=now()
        returning *
      `,[id,tenantId(),userId(),message.conversationKey,message.provider,message.threadId,message.subject,JSON.stringify(participantKeys),JSON.stringify(participants),message.receivedAt,message.direction==='inbound'?message.receivedAt:null,message.direction==='outbound'?message.receivedAt:null,JSON.stringify({source:'email_sync'})]);
      return pgRow(r.rows[0]);
    }
    const s=store();
    let row=s.unifiedConversations.find(c=>c.tenantId===tenantId()&&c.userId===userId()&&c.conversationKey===message.conversationKey);
    if(!row){
      row={id,tenantId:tenantId(),userId:userId(),conversationKey:message.conversationKey,primaryProvider:message.provider,primaryThreadId:message.threadId,subject:message.subject,participantKeysJson:participantKeys,participantsJson:participants,latestMessageAt:message.receivedAt,latestInboundAt:null,latestOutboundAt:null,messageCount:0,state:'unknown',relationshipTemperature:'unknown',unknownsJson:[],metadataJson:{source:'email_sync'},createdAt:now(),updatedAt:now()};
      s.unifiedConversations.unshift(row);
    }
    row.subject=row.subject||message.subject;
    row.participantKeysJson=[...new Set([...(row.participantKeysJson||[]),...participantKeys])];
    row.participantsJson=participants;
    row.latestMessageAt=[row.latestMessageAt,message.receivedAt].filter(Boolean).sort().pop();
    if(message.direction==='inbound')row.latestInboundAt=[row.latestInboundAt,message.receivedAt].filter(Boolean).sort().pop();
    if(message.direction==='outbound')row.latestOutboundAt=[row.latestOutboundAt,message.receivedAt].filter(Boolean).sort().pop();
    row.messageCount=Number(row.messageCount||0)+1;row.updatedAt=now();
    saveStore(s);
    return row;
  }
  async function upsertThread(message,unifiedId){
    const id='eth_'+Buffer.from(`${tenantId()}|${userId()}|${message.provider}|${message.threadId}`).toString('base64url').slice(0,48);
    const participants=[message.sender,...message.recipients,...message.cc].filter(p=>p.email||p.name);
    if(hasPg()){
      await dbQuery(`
        insert into email_threads (id,tenant_id,user_id,provider,thread_id,unified_conversation_id,subject,participants_json,message_count,latest_message_at,updated_at)
        values ($1,$2,$3,$4,$5,$6,$7,$8,1,$9,now())
        on conflict (tenant_id,user_id,provider,thread_id) do update set
          unified_conversation_id=excluded.unified_conversation_id,
          subject=coalesce(nullif(excluded.subject,''),email_threads.subject),
          participants_json=excluded.participants_json,
          message_count=email_threads.message_count+1,
          latest_message_at=greatest(coalesce(email_threads.latest_message_at,'epoch'),excluded.latest_message_at),
          updated_at=now()
      `,[id,tenantId(),userId(),message.provider,message.threadId,unifiedId,message.subject,JSON.stringify(participants),message.receivedAt]);
    }else{
      const s=store();
      let row=s.emailThreads.find(t=>t.tenantId===tenantId()&&t.userId===userId()&&t.provider===message.provider&&t.threadId===message.threadId);
      if(!row){row={id,tenantId:tenantId(),userId:userId(),provider:message.provider,threadId:message.threadId,unifiedConversationId:unifiedId,subject:message.subject,participantsJson:participants,messageCount:0,latestMessageAt:message.receivedAt,summaryJson:{},createdAt:now(),updatedAt:now()};s.emailThreads.unshift(row);}
      row.unifiedConversationId=unifiedId;row.messageCount=Number(row.messageCount||0)+1;row.latestMessageAt=[row.latestMessageAt,message.receivedAt].filter(Boolean).sort().pop();row.updatedAt=now();saveStore(s);
    }
  }
  async function upsertEmailMessage(rawMessage){
    const message=normalizeMessage(rawMessage,ownerEmails);
    if(!message.messageId)return {saved:false,reason:'missing_message_id',message};
    const unified=await upsertUnifiedConversationForMessage(message);
    await upsertThread(message,unified.id);
    const id='em_'+Buffer.from(`${tenantId()}|${userId()}|${message.provider}|${message.messageId}`).toString('base64url').slice(0,48);
    if(hasPg()){
      const r=await dbQuery(`
        insert into email_messages (id,tenant_id,user_id,provider,message_id,thread_id,unified_conversation_id,direction,sender_json,recipients_json,cc_json,bcc_json,subject,body_preview,body_text,snippet,labels_json,has_attachments,web_link,received_at,sent_at,raw_json,updated_at)
        values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,now())
        on conflict (tenant_id,user_id,provider,message_id) do update set
          thread_id=excluded.thread_id,unified_conversation_id=excluded.unified_conversation_id,direction=excluded.direction,sender_json=excluded.sender_json,recipients_json=excluded.recipients_json,cc_json=excluded.cc_json,bcc_json=excluded.bcc_json,subject=excluded.subject,body_preview=excluded.body_preview,body_text=excluded.body_text,snippet=excluded.snippet,labels_json=excluded.labels_json,has_attachments=excluded.has_attachments,web_link=excluded.web_link,received_at=excluded.received_at,sent_at=excluded.sent_at,raw_json=excluded.raw_json,updated_at=now()
        returning *
      `,[id,tenantId(),userId(),message.provider,message.messageId,message.threadId,unified.id,message.direction,JSON.stringify(message.sender),JSON.stringify(message.recipients),JSON.stringify(message.cc),JSON.stringify(message.bcc),message.subject,message.bodyPreview,message.bodyText,message.snippet,JSON.stringify(message.labels),message.hasAttachments,message.webLink,message.receivedAt,message.sentAt,JSON.stringify(message.raw)]);
      return {saved:true,message:rowToMessage(r.rows[0]),unifiedConversation:unified};
    }
    const s=store();
    const record={id,tenantId:tenantId(),userId:userId(),provider:message.provider,messageId:message.messageId,threadId:message.threadId,unifiedConversationId:unified.id,direction:message.direction,senderJson:message.sender,recipientsJson:message.recipients,ccJson:message.cc,bccJson:message.bcc,subject:message.subject,bodyPreview:message.bodyPreview,bodyText:message.bodyText,snippet:message.snippet,labelsJson:message.labels,hasAttachments:message.hasAttachments,webLink:message.webLink,receivedAt:message.receivedAt,sentAt:message.sentAt,rawJson:message.raw,createdAt:now(),updatedAt:now()};
    const idx=s.emailMessages.findIndex(m=>m.tenantId===tenantId()&&m.userId===userId()&&m.provider===record.provider&&m.messageId===record.messageId);
    if(idx>=0)s.emailMessages[idx]={...s.emailMessages[idx],...record,createdAt:s.emailMessages[idx].createdAt}; else s.emailMessages.unshift(record);
    saveStore(s);
    return {saved:true,message:rowToMessage(record),unifiedConversation:unified};
  }
  async function syncEmail({providers=['gmail','outlook'],limit=50,query='newer_than:30d'}={}){
    const unknowns=[], results={gmail:null,outlook:null}, saved=[];
    if(providers.includes('gmail')){
      if(typeof fetchGmailMessages==='function'){
        const gmail=await fetchGmailMessages({query:`in:anywhere ${query}`,maxResults:limit,includeBody:true}).catch(e=>({emails:[],error:e.message,needsAuth:/auth|scope|token/i.test(e.message),provider:'gmail'}));
        results.gmail={provider:'gmail',fetched:(gmail.emails||[]).length,error:gmail.error||'',needsAuth:!!gmail.needsAuth,missingScopes:gmail.missingScopes||[]};
        if(gmail.error||gmail.needsAuth)unknowns.push({source:'gmail',reason:gmail.error||'Gmail unavailable or needs auth.'});
        for(const email of gmail.emails||[])saved.push(await upsertEmailMessage(email));
      }else unknowns.push({source:'gmail',reason:'Gmail fetch helper unavailable.'});
    }
    if(providers.includes('outlook')){
      if(typeof fetchUnifiedOutlookEmails==='function'){
        const outlook=await fetchUnifiedOutlookEmails(limit).catch(e=>({emails:[],error:e.message,needsAuth:/auth|token|401/i.test(e.message),provider:'outlook'}));
        results.outlook={provider:'outlook',fetched:(outlook.emails||[]).length,error:outlook.error||'',needsAuth:!!outlook.needsAuth};
        if(outlook.error||outlook.needsAuth)unknowns.push({source:'outlook',reason:outlook.error||'Outlook unavailable or needs auth.'});
        for(const email of outlook.emails||[])saved.push(await upsertEmailMessage(email));
      }else unknowns.push({source:'outlook',reason:'Outlook fetch helper unavailable.'});
    }
    return {ok:true,saved:saved.filter(r=>r.saved).length,skipped:saved.filter(r=>!r.saved).length,providers:results,unknowns,savedMessages:saved.filter(r=>r.saved).map(r=>r.message).filter(Boolean)};
  }
  async function messagesForConversation({conversationId='',provider='',threadId='',messageId='',limit=80}={}){
    const lim=Math.max(1,Math.min(Number(limit)||80,200));
    if(messageId&&!conversationId&&!threadId){
      let one=[];
      if(hasPg()){
        const r=await dbQuery('select * from email_messages where tenant_id=$1 and user_id=$2 and message_id=$3 order by coalesce(received_at,sent_at,created_at) asc limit 1',[tenantId(),userId(),messageId]);
        one=(r.rows||[]).map(rowToMessage);
      }else{
        one=store().emailMessages.filter(m=>m.tenantId===tenantId()&&m.userId===userId()&&m.messageId===messageId).slice(0,1).map(rowToMessage);
      }
      const found=one[0];
      if(found?.unifiedConversationId)return messagesForConversation({conversationId:found.unifiedConversationId,limit:lim});
      if(found?.provider&&found?.threadId)return messagesForConversation({provider:found.provider,threadId:found.threadId,limit:lim});
      return one;
    }
    if(hasPg()){
      const params=[tenantId(),userId()];let where='tenant_id=$1 and user_id=$2';
      if(conversationId){params.push(conversationId);where+=` and unified_conversation_id=$${params.length}`;}
      else if(messageId){params.push(messageId);where+=` and message_id=$${params.length}`;}
      else if(provider&&threadId){params.push(provider,threadId);where+=` and provider=$${params.length-1} and thread_id=$${params.length}`;}
      else throw new Error('conversationId, messageId, or provider+threadId is required.');
      const r=await dbQuery(`select * from email_messages where ${where} order by coalesce(received_at,sent_at,created_at) asc limit ${lim}`,params);
      return r.rows.map(rowToMessage);
    }
    const rows=store().emailMessages.filter(m=>m.tenantId===tenantId()&&m.userId===userId()&&(
      conversationId?m.unifiedConversationId===conversationId:(messageId?m.messageId===messageId:(m.provider===provider&&m.threadId===threadId))
    ));
    return rows.sort((a,b)=>String(a.receivedAt||a.sentAt||a.createdAt).localeCompare(String(b.receivedAt||b.sentAt||b.createdAt))).slice(0,lim).map(rowToMessage);
  }
  function extractQuestions(messages=[]){
    return messages.flatMap(m=>String(m.bodyText||m.bodyPreview||m.snippet||'').split(/(?<=[?])\s+/).filter(s=>s.includes('?')).map(s=>({text:compactText(s,240),messageId:m.messageId,from:m.from}))).slice(-8);
  }
  function extractCommitments(messages=[]){
    const rx=/\b(i will|i'll|we will|we'll|can you|please|need to|needs to|follow up|send|share|schedule|review|introduce|confirm)\b/i;
    return messages.flatMap(m=>String(m.bodyText||m.bodyPreview||m.snippet||'').split(/(?<=[.!?])\s+/).filter(s=>rx.test(s)).map(s=>({text:compactText(s,260),messageId:m.messageId,direction:m.direction}))).slice(-10);
  }
  function inferState(messages=[],questions=[],commitments=[]){
    const latest=messages[messages.length-1]||{};
    const waitingOnUser=latest.direction==='inbound'&&(questions.length||/\b(can you|please|need|thoughts|confirm|review|send|available|when)\b/i.test([latest.subject,latest.bodyPreview].join(' ')));
    const waitingOnOther=latest.direction==='outbound'&&(questions.length||/\b(can you|please|let me know|confirm|available|thoughts)\b/i.test(latest.bodyPreview||''));
    let state='progressing';
    if(waitingOnUser)state='waiting_on_user';
    else if(waitingOnOther)state='waiting_on_them';
    else if(/\b(thanks|sounds good|done|complete|resolved)\b/i.test(latest.bodyPreview||''))state='complete';
    else if(!messages.length)state='unknown';
    return {state,waitingOnUser:!!waitingOnUser,waitingOnOther:!!waitingOnOther};
  }
  function inferTemperature(messages=[]){
    const text=messages.slice(-4).map(m=>[m.subject,m.bodyPreview,m.bodyText].join(' ')).join(' ').toLowerCase();
    if(/\b(urgent|concern|issue|frustrated|disappointed|problem|delay|blocked|confused)\b/.test(text))return 'sensitive';
    if(/\b(excited|great|thank you|appreciate|happy|love|wonderful|congrats)\b/.test(text))return 'warm';
    if(/\b(following up|checking in|haven't heard|waiting)\b/.test(text))return 'waiting';
    return messages.length?'neutral':'unknown';
  }
  function senderMetricsFor(messages=[],current={}){
    const senderEmail=normalizeEmail(current?.from?.email||current?.sender?.email);
    if(!senderEmail)return {senderEmail:'',inboundFromSenderCount:0,outboundToSenderCount:0};
    let inboundFromSenderCount=0,outboundToSenderCount=0;
    for(const message of messages){
      const fromEmail=normalizeEmail(message.from?.email||message.sender?.email);
      const recipients=[...safeArray(message.to||message.recipients),...safeArray(message.cc),...safeArray(message.bcc)].map(personRef).map(p=>p.email).filter(Boolean);
      if(message.direction==='inbound'&&fromEmail===senderEmail)inboundFromSenderCount+=1;
      if(message.direction==='outbound'&&recipients.includes(senderEmail))outboundToSenderCount+=1;
    }
    return {senderEmail,inboundFromSenderCount,outboundToSenderCount};
  }
  async function saveClassification(context){
    const id=uuid('cclass');
    if(hasPg()){
      await dbQuery(`insert into conversation_classifications (id,tenant_id,user_id,unified_conversation_id,email_thread_id,current_message_id,conversation_state,relationship_temperature,waiting_on_user,waiting_on_other,open_questions_json,commitments_json,unknowns_json,context_json,source_refs_json,confidence)
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,[id,tenantId(),userId(),context.conversationId||'',context.threadId||'',context.currentMessage?.messageId||'',context.conversation_state,context.relationship_temperature,context.waiting_on_user,context.waiting_on_other,JSON.stringify(context.open_questions),JSON.stringify(context.commitments),JSON.stringify(context.unknowns),JSON.stringify(context),JSON.stringify(context.source_refs),context.confidence||0]);
    }else{
      const s=store();s.conversationClassifications.unshift({id,tenantId:tenantId(),userId:userId(),...context,createdAt:now()});saveStore(s);
    }
    return id;
  }
  async function buildConversationContext(input={}){
    const unknowns=[];
    let messages=[];
    try{messages=await messagesForConversation(input);}catch(e){unknowns.push({source:'email_messages',reason:e.message});}
    const current=messages.find(m=>m.messageId===input.messageId)||messages[messages.length-1]||null;
    const inbound=[...messages].reverse().find(m=>m.direction==='inbound')||null;
    const outbound=[...messages].reverse().find(m=>m.direction==='outbound')||null;
    const questions=extractQuestions(messages);
    const commitments=extractCommitments(messages);
    const state=inferState(messages,questions,commitments);
    const temp=inferTemperature(messages);
    const senderMetrics=senderMetricsFor(messages,inbound||current);
    const context={
      ok:true,
      conversationId:current?.unifiedConversationId||input.conversationId||'',
      provider:current?.provider||input.provider||'',
      threadId:current?.threadId||input.threadId||'',
      current_message:current,
      currentMessage:current,
      evidence_messages:messages.map(message=>({
        id:message.id||'',
        messageId:message.messageId||'',
        provider:message.provider||'',
        threadId:message.threadId||'',
        direction:message.direction||'',
        from:message.from||{},
        to:message.to||[],
        subject:message.subject||'',
        bodyText:message.bodyText||'',
        bodyPreview:message.bodyPreview||'',
        receivedAt:message.receivedAt||'',
        sentAt:message.sentAt||''
      })),
      thread_summary:messages.length?`${messages.length} message${messages.length===1?'':'s'} about ${current?.subject||messages[0]?.subject||'this conversation'}.`:'No durable messages found for this conversation.',
      latest_inbound:inbound,
      latest_outbound:outbound,
      sender_email:senderMetrics.senderEmail,
      sender_metrics:senderMetrics,
      waiting_on_user:state.waitingOnUser,
      waiting_on_other:state.waitingOnOther,
      open_questions:questions,
      commitments,
      conversation_state:state.state,
      relationship_temperature:temp,
      unknowns,
      confidence:messages.length?0.72:0.2,
      source_refs:messages.slice(-8).map(m=>({source_type:'email_message',source_id:m.id||m.messageId,quote_or_summary:compactText([m.subject,m.bodyPreview].join(': '),400),confidence:0.75,created_at:m.receivedAt||m.createdAt||now()}))
    };
    context.classificationId=await saveClassification(context);
    return context;
  }
  async function listRecentConversationSummaries({limit=12}={}){
    const lim=Math.max(1,Math.min(Number(limit)||12,50));
    if(hasPg()){
      const r=await dbQuery('select * from unified_conversations where tenant_id=$1 and user_id=$2 order by latest_message_at desc nulls last, updated_at desc limit $3',[tenantId(),userId(),lim]);
      return r.rows.map(row=>({id:row.id,subject:row.subject,state:row.state,relationshipTemperature:row.relationship_temperature,participants:jsonValue(row.participants_json,[]),latestMessageAt:row.latest_message_at?.toISOString?.()||row.latest_message_at||'',messageCount:Number(row.message_count||0)}));
    }
    return store().unifiedConversations.filter(c=>c.tenantId===tenantId()&&c.userId===userId()).slice(0,lim).map(c=>({id:c.id,subject:c.subject,state:c.state,relationshipTemperature:c.relationshipTemperature,participants:c.participantsJson,latestMessageAt:c.latestMessageAt,messageCount:c.messageCount}));
  }
  async function getConversation(id){
    const messages=await messagesForConversation({conversationId:id}).catch(()=>[]);
    const context=await buildConversationContext({conversationId:id}).catch(e=>({ok:false,error:e.message,unknowns:[{source:'conversation_context',reason:e.message}]}));
    return {ok:true,id,messages,context};
  }
  async function resolveIdentity(input={}){
    const unknowns=[], candidates=[];
    const email=normalizeEmail(input.email||input.from?.email||input.sender?.email||input.person?.email);
    const name=String(input.name||input.from?.name||input.sender?.name||input.person?.name||'').trim();
    const add=(candidate)=>{if(candidate&&!candidates.some(c=>c.key===candidate.key))candidates.push(candidate);};
    if(email){
      if(hasPg()){
        const local=await dbQuery(`select sender_json,recipients_json,provider,message_id from email_messages where tenant_id=$1 and user_id=$2 and (lower(sender_json->>'email')=$3 or recipients_json::text ilike $4) order by received_at desc limit 5`,[tenantId(),userId(),email,`%${email}%`]).catch(e=>{unknowns.push({source:'email_messages',reason:e.message});return {rows:[]};});
        (local.rows||[]).forEach(row=>add({key:'email_message:'+email,source:'email_messages',match_status:'matched',confidence:0.9,match_basis:['exact_email'],person:{email,name:jsonValue(row.sender_json,{}).name||name}}));
      }
      const rels=hasPg()?await dbQuery(`select * from relationship_profiles where tenant_id=$1 and (profile_key ilike $2 or summary ilike $2 or metadata_json::text ilike $2) limit 5`,[tenantId(),`%${email}%`]).catch(e=>{unknowns.push({source:'relationship_profiles',reason:e.message});return {rows:[]};}):{rows:[]};
      (rels.rows||[]).forEach(row=>add({key:'relationship:'+row.id,source:'relationship_profiles',match_status:'matched',confidence:0.82,match_basis:['email_in_profile'],person:{id:row.person_id,name:row.display_name,email}}));
      if(typeof resolveContactFromContext==='function'){
        const resolved=await resolveContactFromContext({email,name}).catch(e=>{unknowns.push({source:'crm',reason:e.message});return null;});
        if(resolved?.contact){
          add({key:'crm:'+String(resolved.contact.contactId||resolved.contact.id||email),source:resolved.contact.source||'crm_resolver',match_status:resolved.status==='matched'?'matched':'probable_match',confidence:Number(resolved.confidence||0.8),match_basis:resolved.matchReasons||resolved.matchBasis||['resolver'],person:resolved.contact});
        }else unknowns.push({source:'crm',reason:'No CRM contact match returned.'});
      }else unknowns.push({source:'crm',reason:'CRM resolver unavailable.'});
    }else if(name){
      const normalized=normalizeName(name);
      const rels=hasPg()?await dbQuery(`select * from relationship_profiles where tenant_id=$1 and lower(display_name) like $2 limit 8`,[tenantId(),`%${normalized.split(' ')[0]||normalized}%`]).catch(e=>{unknowns.push({source:'relationship_profiles',reason:e.message});return {rows:[]};}):{rows:[]};
      (rels.rows||[]).forEach(row=>{
        const score=normalizeName(row.display_name)===normalized?0.78:0.55;
        add({key:'relationship:'+row.id,source:'relationship_profiles',match_status:score>=0.75?'probable_match':'ambiguous',confidence:score,match_basis:['name_similarity'],person:{id:row.person_id,name:row.display_name}});
      });
    }else unknowns.push({source:'input',reason:'No email or name supplied for identity resolution.'});
    candidates.sort((a,b)=>b.confidence-a.confidence);
    const best=candidates[0]||null;
    let matchStatus='no_match', recommendedAction='do_not_create';
    if(best){
      matchStatus=best.confidence>=0.88&&best.match_basis?.includes('exact_email')?'matched':(candidates.length>1&&candidates[1].confidence>best.confidence-0.12?'ambiguous':'probable_match');
      recommendedAction=matchStatus==='matched'?'use_existing':(matchStatus==='probable_match'||matchStatus==='ambiguous'?'ask_user':'do_not_create');
    }
    return {ok:true,person_key:email?`email:${email}`:(name?`name:${normalizeName(name)}`:''),crm_contact_id:best?.person?.contactId||best?.person?.id||'',match_status:matchStatus,match_confidence:best?.confidence||0,match_basis:best?.match_basis||[],recommended_action:recommendedAction,candidates,unknowns};
  }
  return {normalizeMessage,upsertEmailMessage,syncEmail,buildConversationContext,listRecentConversationSummaries,getConversation,resolveIdentity};
}

module.exports={createValConversationIdentityService,normalizeEmail,normalizeMessage};
