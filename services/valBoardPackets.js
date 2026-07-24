const BOARD_OBSERVERS = [
  'Executive Inbox',
  'Relationship',
  'Project',
  'Capacity',
  'Courage',
  'Delight',
  'Opportunity',
  'Momentum',
  'Meaning',
  'Synchronicity',
  'Commitment',
  'Calendar',
  'Environment',
  'Witnessing'
];

const PRIMARY_ROUTES = Object.freeze({
  email_attention_packet:['Courage','Relationship','Commitment','Opportunity','Executive Inbox'],
  draft_review_packet:['Courage','Relationship','Commitment','Executive Inbox'],
  reply_pressure_packet:['Courage','Relationship','Commitment','Capacity','Executive Inbox'],
  meeting_context_packet:['Capacity','Relationship','Commitment','Calendar','Environment'],
  capacity_window_packet:['Capacity','Calendar','Environment'],
  prep_timing_packet:['Capacity','Calendar','Commitment'],
  meeting_evidence_packet:['Meaning','Project','Momentum','Witnessing','Commitment'],
  decision_trace_packet:['Meaning','Courage','Project','Synchronicity'],
  task_extraction_packet:['Momentum','Commitment','Project','Executive Inbox'],
  identity_context_packet:['Meaning','Capacity','Delight','Synchronicity','Courage','Witnessing'],
  relational_context_packet:['Relationship','Delight','Meaning','Synchronicity','Witnessing'],
  operating_context_packet:['Capacity','Environment','Commitment','Momentum','Witnessing'],
  convergence_packet:['Meaning','Opportunity','Relationship','Capacity','Synchronicity'],
  timing_cluster_packet:['Opportunity','Calendar','Capacity','Synchronicity'],
  pattern_echo_packet:['Meaning','Relationship','Witnessing','Synchronicity'],
  approval_packet:['Momentum','Commitment','Executive Inbox','Meaning'],
  task_packet:['Momentum','Commitment','Project','Capacity'],
  sent_action_packet:['Executive Inbox','Relationship','Commitment','Momentum'],
  learning_packet:['Meaning','Witnessing','Synchronicity','Delight'],
  cowork_packet:['Meaning','Momentum','Commitment','Witnessing'],
  document_packet:['Meaning','Project','Commitment','Witnessing'],
  relationship_packet:['Relationship','Delight','Commitment','Meaning'],
  project_packet:['Project','Momentum','Capacity','Commitment']
});

const BOARD_SOURCE_REGISTRY = Object.freeze([
  {
    sourceType:'email',
    label:'Email sync',
    status:'live',
    hook:'valConversationIdentity.syncEmail.afterEmailSync',
    packetTypes:['email_attention_packet','reply_pressure_packet','draft_review_packet'],
    claim:'Synced Gmail/Outlook messages become Board packets.'
  },
  {
    sourceType:'transcript',
    label:'Transcripts',
    status:'live',
    hook:'processTranscriptPayload.recordTranscriptProcessed',
    packetTypes:['meeting_evidence_packet','decision_trace_packet','task_extraction_packet'],
    claim:'Processed transcripts become evidence, decision, and task packets.'
  },
  {
    sourceType:'calendar_event',
    label:'Calendar events',
    status:'live',
    hook:'saveValCalendarEvent.recordCalendarEvent',
    packetTypes:['meeting_context_packet','capacity_window_packet'],
    claim:'Saved VAL calendar events become meeting and capacity packets.'
  },
  {
    sourceType:'witnessing',
    label:'Witnessing Session',
    status:'live',
    hook:'teach-val/onboarding witnessing save/confirm/commit',
    packetTypes:['identity_context_packet','relational_context_packet','operating_context_packet'],
    claim:'Witnessing answers and committed onboarding memory become foundational Board packets.'
  },
  {
    sourceType:'cowork',
    label:'Co-Work conversations',
    status:'live',
    hook:'valCoworkRoutes.afterCoworkEvent',
    packetTypes:['cowork_packet'],
    claim:'Co-Work open, response, and apply events become Board packets.'
  },
  {
    sourceType:'external_action',
    label:'External action packets',
    status:'live',
    hook:'valExternalActionsRoutes.afterExternalActionPacket',
    packetTypes:['approval_packet','task_packet','sent_action_packet'],
    claim:'Prepared, approved, and executed external action packets become Board packets.'
  },
  {
    sourceType:'home_email_action',
    label:'Home VAL email preparation',
    status:'live',
    hook:'hearthActionPrepContent.recordExternalActionPacket',
    packetTypes:['sent_action_packet','approval_packet'],
    claim:'Home VAL email preparation becomes an approval/action packet before anything is sent.'
  },
  {
    sourceType:'sms',
    label:'SMS',
    status:'pending',
    hook:'',
    packetTypes:['sent_action_packet','relationship_packet'],
    claim:'SMS should become Board packets when the GHL/VAL SMS bridge is attached to this registry.'
  },
  {
    sourceType:'linkedin_visibility',
    label:'LinkedIn Visibility',
    status:'pending',
    hook:'',
    packetTypes:['relationship_packet','learning_packet'],
    claim:'LinkedIn drafts and support-circle activity should become Board packets once the LinkedIn function writes source records.'
  },
  {
    sourceType:'document',
    label:'Documents and uploads',
    status:'pending',
    hook:'',
    packetTypes:['document_packet','learning_packet'],
    claim:'Uploaded, linked, or generated documents should become Board packets when document save/update hooks are attached.'
  },
  {
    sourceType:'task',
    label:'Tasks and commitments',
    status:'pending',
    hook:'',
    packetTypes:['task_packet'],
    claim:'Created or completed tasks should become Board packets when task mutation hooks are attached.'
  },
  {
    sourceType:'relationship_profile',
    label:'Stewardship profiles',
    status:'pending',
    hook:'',
    packetTypes:['relationship_packet'],
    claim:'Relationship profile changes should become Board packets when Stewardship save hooks are attached.'
  },
  {
    sourceType:'project_profile',
    label:'Project profiles',
    status:'pending',
    hook:'',
    packetTypes:['project_packet'],
    claim:'Project profile changes should become Board packets when Project Managers save hooks are attached.'
  },
  {
    sourceType:'public_research',
    label:'Public research',
    status:'pending',
    hook:'',
    packetTypes:['document_packet','relationship_packet','project_packet'],
    claim:'Apollo, Outscraper, public web, and LinkedIn research should become Board packets after source receipts are persisted through this registry.'
  },
  {
    sourceType:'ghl_voice',
    label:'GHL Voice',
    status:'pending',
    hook:'',
    packetTypes:['cowork_packet','relationship_packet','sent_action_packet'],
    claim:'GHL voice turns should become Board packets after the voice webhook sends completed turn receipts back into VAL.'
  }
]);

function boardSourceByType(sourceType=''){
  return BOARD_SOURCE_REGISTRY.find(source=>source.sourceType===sourceType)||null;
}

function safeArray(value){return Array.isArray(value)?value:[];}
function compactText(value,limit=900){return String(value||'').replace(/\s+/g,' ').trim().slice(0,limit);}
function jsonValue(value,fallback){
  if(value==null)return fallback;
  if(typeof value==='string'){
    try{return JSON.parse(value);}catch(_){return fallback;}
  }
  return value;
}
function stableKey(value=''){
  return String(value||'').toLowerCase().replace(/[^a-z0-9:_-]+/g,'_').replace(/^_+|_+$/g,'').slice(0,220);
}
function toCamelRow(row={}){
  const out={};
  for(const [key,value] of Object.entries(row||{})){
    const camel=key.replace(/_([a-z])/g,(_,c)=>c.toUpperCase());
    out[camel]=value instanceof Date?value.toISOString():value;
  }
  for(const key of ['routeObserversJson','primaryObserversJson','sourceRefsJson','payloadJson']){
    if(Object.hasOwn(out,key))out[key]=jsonValue(out[key],/Observers|Refs/.test(key)?[]:{});
  }
  return out;
}
function normalizeSourceRef(ref={}){
  return {
    source_type:String(ref.source_type||ref.sourceType||ref.type||'unknown'),
    source_id:String(ref.source_id||ref.sourceId||ref.id||''),
    quote_or_summary:compactText(ref.quote_or_summary||ref.quoteOrSummary||ref.summary||ref.quote||'',900),
    confidence:Math.max(0,Math.min(1,Number(ref.confidence)||0.65)),
    created_at:ref.created_at||ref.createdAt||new Date().toISOString()
  };
}
function routeReason(observerName='',packetType='',sourceType=''){
  const observer=String(observerName||'');
  const source=String(sourceType||'source').replace(/_/g,' ');
  const reasons={
    'Executive Inbox':`This ${source} may create communication attention, reply pressure, or a future loop.`,
    Relationship:`This ${source} may change warmth, trust, repair, distance, or mutual value.`,
    Project:`This ${source} may affect project movement, blockers, dependencies, or useful work.`,
    Capacity:`This ${source} may change tradeoffs, timing, energy, or decision quality.`,
    Courage:`This ${source} may reveal avoidance, softened truth, or a decision that needs plain language.`,
    Delight:`This ${source} may protect energy, curiosity, aliveness, or connection.`,
    Opportunity:`This ${source} may reveal an opening, timing window, or emerging value.`,
    Momentum:`This ${source} may clarify whether movement is real or only activity.`,
    Meaning:`This ${source} may connect to values, story, repeated themes, or what matters.`,
    Synchronicity:`This ${source} may be part of a repeated arrival or cross-context echo.`,
    Commitment:`This ${source} may contain a promise, obligation, follow-up, or trust-protecting loop.`,
    Calendar:`This ${source} may affect schedule reality, preparation, or protected time.`,
    Environment:`This ${source} may depend on location, travel, body, interruption, or external conditions.`,
    Witnessing:`This ${source} may confirm, challenge, or refine the user's directly revealed context.`
  };
  return reasons[observer]||`This packet is visible to ${observer} for context.`;
}
function observerRoutes(packetType='',sourceType=''){
  const primary=new Set(PRIMARY_ROUTES[packetType]||[]);
  return BOARD_OBSERVERS.map(observerName=>({
    observerName,
    primary:primary.has(observerName),
    reason:routeReason(observerName,packetType,sourceType)
  }));
}
function packetId(uuid,scope,sourceType,sourceId,packetType,title){
  return stableKey(`board_${scope.tenantId}_${scope.userId}_${sourceType}_${sourceId}_${packetType}_${title}`)||uuid('boardpacket');
}
function registrySourceKey(packetSourceType=''){
  const source=String(packetSourceType||'').toLowerCase();
  if(source==='email'||source==='email_sync'||source==='gmail'||source==='outlook'||source==='unified_conversation')return 'email';
  if(source==='transcript'||source==='krisp'||source==='uploaded_transcript')return 'transcript';
  if(source==='calendar_event'||source==='calendar'||source==='google_calendar'||source==='outlook_calendar')return 'calendar_event';
  if(source==='witnessing'||source==='teach_val_onboarding')return 'witnessing';
  if(source==='cowork'||source==='co_work'||source==='observer_chat')return 'cowork';
  if(source==='external_action'||source==='home_email_action')return 'external_action';
  if(source==='sms'||source==='ghl_sms')return 'sms';
  if(source==='linkedin'||source==='linkedin_visibility')return 'linkedin_visibility';
  if(source==='document'||source==='upload'||source==='google_doc'||source==='attachment')return 'document';
  if(source==='task'||source==='commitment')return 'task';
  if(source==='relationship'||source==='relationship_profile'||source==='contact')return 'relationship_profile';
  if(source==='project'||source==='project_profile')return 'project_profile';
  if(source==='public_research'||source==='apollo'||source==='outscraper'||source==='web_research')return 'public_research';
  if(source==='ghl_voice'||source==='voice')return 'ghl_voice';
  return source;
}
function createValBoardPacketsService({
  dbQuery,
  hasPg=()=>false,
  getStore=()=>({}),
  saveStore=()=>{},
  uuid=(prefix)=>`${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`,
  tenantId=()=>'default',
  userId=()=>'default',
  logger=console
}={}){
  function scope(){return {tenantId:tenantId(),userId:userId()};}
  function store(){
    const s=getStore()||{};
    if(!Array.isArray(s.valBoardPackets))s.valBoardPackets=[];
    return s;
  }
  async function savePacket(packet){
    if(hasPg()){
      const r=await dbQuery(`
        insert into val_board_packets (
          id,tenant_id,user_id,source_type,source_id,packet_type,title,summary,status,
          route_observers_json,primary_observers_json,source_refs_json,payload_json,prototype,delivered_at,created_at,updated_at
        ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
        on conflict (id) do update set
          title=excluded.title,
          summary=excluded.summary,
          status=excluded.status,
          route_observers_json=excluded.route_observers_json,
          primary_observers_json=excluded.primary_observers_json,
          source_refs_json=excluded.source_refs_json,
          payload_json=excluded.payload_json,
          prototype=excluded.prototype,
          delivered_at=excluded.delivered_at,
          updated_at=excluded.updated_at
        returning *
      `,[
        packet.id,packet.tenantId,packet.userId,packet.sourceType,packet.sourceId,packet.packetType,
        packet.title,packet.summary,packet.status,
        JSON.stringify(packet.routeObserversJson),JSON.stringify(packet.primaryObserversJson),
        JSON.stringify(packet.sourceRefsJson),JSON.stringify(packet.payloadJson),
        !!packet.prototype,packet.deliveredAt||null,packet.createdAt,packet.updatedAt
      ]);
      return toCamelRow(r.rows[0]);
    }
    const s=store();
    const idx=s.valBoardPackets.findIndex(row=>row.id===packet.id&&row.tenantId===packet.tenantId&&row.userId===packet.userId);
    if(idx>=0)s.valBoardPackets[idx]={...s.valBoardPackets[idx],...packet,createdAt:s.valBoardPackets[idx].createdAt||packet.createdAt};
    else s.valBoardPackets.unshift(packet);
    saveStore(s);
    return packet;
  }
  async function createPacket(input={}){
    const sc=scope();
    const sourceType=String(input.sourceType||input.source_type||'manual').trim();
    const sourceId=String(input.sourceId||input.source_id||uuid('source')).trim();
    const packetType=String(input.packetType||input.packet_type||'learning_packet').trim();
    const routes=observerRoutes(packetType,sourceType);
    const primary=routes.filter(route=>route.primary).map(route=>route.observerName);
    const now=new Date().toISOString();
    const packet={
      id:String(input.id||packetId(uuid,sc,sourceType,sourceId,packetType,input.title||'packet')).trim(),
      tenantId:sc.tenantId,
      userId:sc.userId,
      sourceType,
      sourceId,
      packetType,
      title:compactText(input.title||packetType.replace(/_/g,' '),220),
      summary:compactText(input.summary||input.description||'',1400),
      status:String(input.status||'active'),
      routeObserversJson:routes,
      primaryObserversJson:primary,
      sourceRefsJson:safeArray(input.sourceRefs||input.sourceRefsJson||input.source_refs_json).map(normalizeSourceRef),
      payloadJson:input.payloadJson||input.payload||{},
      prototype:!!input.prototype,
      deliveredAt:input.deliveredAt||input.delivered_at||null,
      createdAt:input.createdAt||input.created_at||now,
      updatedAt:now
    };
    const saved=await savePacket(packet);
    logger.log?.(`[val-board] packet ${saved.id} ${saved.packetType} from ${saved.sourceType}:${saved.sourceId}`);
    return saved;
  }
  async function createPackets(inputs=[]){
    const packets=[];
    for(const input of safeArray(inputs)){
      packets.push(await createPacket(input));
    }
    return packets;
  }
  function emailPacketsFromMessage(message={}){
    const id=message.messageId||message.id||message.threadId||uuid('email');
    const subject=message.subject||'Email conversation';
    const direction=String(message.direction||'').toLowerCase();
    const body=message.bodyPreview||message.snippet||message.bodyText||'';
    const refs=[normalizeSourceRef({sourceType:'email',sourceId:id,quoteOrSummary:[subject,body].filter(Boolean).join(': '),confidence:0.8,createdAt:message.receivedAt||message.sentAt||message.createdAt})];
    const packets=[
      {sourceType:'email',sourceId:id,packetType:'email_attention_packet',title:subject,summary:body,sourceRefs:refs,payload:{provider:message.provider,threadId:message.threadId,direction}},
    ];
    if(direction==='inbound' || /\b(can you|please|need|review|confirm|send|available|thoughts)\b/i.test(body)){
      packets.push({sourceType:'email',sourceId:id,packetType:'reply_pressure_packet',title:`Reply pressure: ${subject}`,summary:body,sourceRefs:refs,payload:{provider:message.provider,threadId:message.threadId,direction}});
    }
    if(/\bdraft|reply|send|proposal|intro|introduction\b/i.test([subject,body].join(' '))){
      packets.push({sourceType:'email',sourceId:id,packetType:'draft_review_packet',title:`Draft review signal: ${subject}`,summary:body,sourceRefs:refs,payload:{provider:message.provider,threadId:message.threadId,direction}});
    }
    return packets;
  }
  async function recordEmailSync(result={}){
    const messages=safeArray(result.savedMessages||result.messages);
    return createPackets(messages.flatMap(emailPacketsFromMessage));
  }
  async function recordTranscriptProcessed({sourceId,title='',summary='',analysis={},counts={},createdDrafts=[],stagedTasks=[],createdTasks=[]}={}){
    const refs=[normalizeSourceRef({sourceType:'transcript',sourceId,quoteOrSummary:summary?.executiveSummary||summary?.summary||summary||title,confidence:0.82})];
    const packets=[
      {sourceType:'transcript',sourceId,packetType:'meeting_evidence_packet',title:title||'Transcript processed',summary:summary?.executiveSummary||summary?.summary||summary||'',sourceRefs:refs,payload:{counts,analysisSummary:analysis?.executiveSummary||''}},
      {sourceType:'transcript',sourceId,packetType:'decision_trace_packet',title:`Decision trace: ${title||sourceId}`,summary:safeArray(analysis?.keyDecisions).map(item=>typeof item==='string'?item:item?.summary||item?.decision).filter(Boolean).slice(0,5).join(' | '),sourceRefs:refs,payload:{keyDecisions:analysis?.keyDecisions||[]}},
      {sourceType:'transcript',sourceId,packetType:'task_extraction_packet',title:`Transcript tasks: ${title||sourceId}`,summary:`${safeArray(stagedTasks).length+safeArray(createdTasks).length} task signal(s), ${safeArray(createdDrafts).length} draft signal(s).`,sourceRefs:refs,payload:{stagedTasks,createdTasks,createdDrafts}}
    ];
    return createPackets(packets);
  }
  async function recordCalendarEvent(event={}){
    const id=event.id||event.eventId||event.calendarEventId||uuid('calendar');
    const title=event.title||event.summary||'Calendar event';
    const refs=[normalizeSourceRef({sourceType:'calendar_event',sourceId:id,quoteOrSummary:title,confidence:0.75,createdAt:event.startTime||event.start_time||event.createdAt})];
    return createPackets([
      {sourceType:'calendar_event',sourceId:id,packetType:'meeting_context_packet',title,summary:event.description||'',sourceRefs:refs,payload:event},
      {sourceType:'calendar_event',sourceId:id,packetType:'capacity_window_packet',title:`Capacity window: ${title}`,summary:event.startTime||event.start_time||'',sourceRefs:refs,payload:event}
    ]);
  }
  async function recordExternalActionPacket(packet={}){
    const id=packet.id||uuid('external_action');
    const action=String(packet.actionType||packet.action_type||'approval_packet');
    const packetType=/task/.test(action)?'task_packet':(/send|email|sms/.test(action)?'sent_action_packet':'approval_packet');
    return createPacket({
      sourceType:'external_action',
      sourceId:id,
      packetType,
      title:packet.title||packet.whyThisActionExists||action.replace(/_/g,' '),
      summary:packet.whatWillHappen||packet.summary||packet.whyThisActionExists||'External action packet prepared for approval.',
      sourceRefs:packet.sourceRefsJson||packet.source_refs_json||[],
      payload:{actionType:action,status:packet.status,targetSystem:packet.targetSystem,targetId:packet.targetId,noExternalAction:packet.status!=='executed'}
    });
  }
  async function recordCoworkEvent(event={}){
    return createPacket({
      sourceType:'cowork',
      sourceId:event.sessionId||event.workItemId||event.conversationId||uuid('cowork'),
      packetType:'cowork_packet',
      title:event.title||event.entrypointId||'Co-Work conversation',
      summary:event.summary||event.message||'A Co-Work conversation changed or confirmed context.',
      sourceRefs:event.sourceRefs||[],
      payload:event
    });
  }
  async function recordWitnessingAnswer(answer={}){
    const id=answer.id||answer.sessionId||answer.category||uuid('witnessing');
    const title=answer.title||String(answer.category||'Witnessing answer').replace(/_/g,' ');
    const text=answer.summary||answer.rawResponse||answer.response||answer.detail||'';
    const refs=[normalizeSourceRef({sourceType:'witnessing',sourceId:id,quoteOrSummary:text||title,confidence:0.9,createdAt:answer.createdAt})];
    return createPackets([
      {sourceType:'witnessing',sourceId:id,packetType:'identity_context_packet',title,summary:text,sourceRefs:refs,payload:answer},
      {sourceType:'witnessing',sourceId:id,packetType:'relational_context_packet',title:`Relational context: ${title}`,summary:text,sourceRefs:refs,payload:answer},
      {sourceType:'witnessing',sourceId:id,packetType:'operating_context_packet',title:`Operating context: ${title}`,summary:text,sourceRefs:refs,payload:answer}
    ]);
  }
  async function listPackets({limit=80,observerName='',sourceType='',status='active',includePrototype=false}={}){
    const lim=Math.max(1,Math.min(Number(limit)||80,300));
    let rows=[];
    if(hasPg()){
      const params=[tenantId(),userId()];
      let where='tenant_id=$1 and user_id=$2';
      if(status){params.push(status);where+=` and status=$${params.length}`;}
      if(sourceType){params.push(sourceType);where+=` and source_type=$${params.length}`;}
      if(!includePrototype)where+=' and prototype=false';
      const r=await dbQuery(`select * from val_board_packets where ${where} order by created_at desc limit ${lim}`,params);
      rows=(r.rows||[]).map(toCamelRow);
    }else{
      rows=safeArray(store().valBoardPackets)
        .filter(row=>row.tenantId===tenantId()&&row.userId===userId())
        .filter(row=>!status||row.status===status)
        .filter(row=>!sourceType||row.sourceType===sourceType)
        .filter(row=>includePrototype||!row.prototype)
        .sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')))
        .slice(0,lim);
    }
    if(observerName){
      rows=rows.filter(row=>safeArray(row.routeObserversJson).some(route=>route.observerName===observerName));
    }
    return rows;
  }
  async function boardContext({limit=80,observerName=''}={}){
    const packets=await listPackets({limit,observerName});
    const sourceReadiness=sourceReadinessFromPackets(packets);
    return {
      observers:BOARD_OBSERVERS,
      sources:sourceReadiness.sources,
      sourceSummary:sourceReadiness.summary,
      livePacketCount:packets.length,
      packets,
      byObserver:Object.fromEntries(BOARD_OBSERVERS.map(observer=>[
        observer,
        packets.filter(packet=>safeArray(packet.routeObserversJson).some(route=>route.observerName===observer))
      ]))
    };
  }
  function sourceReadinessFromPackets(packets=[]){
    const bySource=new Map();
    for(const packet of safeArray(packets)){
      const key=registrySourceKey(packet.sourceType||packet.source_type);
      const current=bySource.get(key)||{packetCount:0,lastPacketAt:'',packetTypes:new Set()};
      current.packetCount+=1;
      current.packetTypes.add(packet.packetType||packet.packet_type);
      const created=packet.createdAt||packet.created_at||'';
      if(created && String(created)>String(current.lastPacketAt||''))current.lastPacketAt=created;
      bySource.set(key,current);
    }
    const sources=BOARD_SOURCE_REGISTRY.map(source=>{
      const activity=bySource.get(source.sourceType)||{packetCount:0,lastPacketAt:'',packetTypes:new Set()};
      const packetCount=activity.packetCount||0;
      return {
        ...source,
        live:source.status==='live',
        claimSafe:source.status==='live',
        packetCount,
        lastPacketAt:activity.lastPacketAt||'',
        observedPacketTypes:[...activity.packetTypes].filter(Boolean).sort()
      };
    });
    return {
      sources,
      summary:{
        total:sources.length,
        live:sources.filter(source=>source.status==='live').length,
        pending:sources.filter(source=>source.status==='pending').length,
        activeLive:sources.filter(source=>source.status==='live'&&source.packetCount>0).length,
        claimAllSourcesSafe:sources.every(source=>source.status==='live')
      }
    };
  }
  return {
    BOARD_OBSERVERS,
    BOARD_SOURCE_REGISTRY,
    PRIMARY_ROUTES,
    boardSourceByType,
    registrySourceKey,
    normalizeSourceRef,
    observerRoutes,
    createPacket,
    createPackets,
    recordEmailSync,
    recordTranscriptProcessed,
    recordCalendarEvent,
    recordExternalActionPacket,
    recordCoworkEvent,
    recordWitnessingAnswer,
    listPackets,
    boardContext,
    sourceReadiness:async({limit=300}={})=>sourceReadinessFromPackets(await listPackets({limit}))
  };
}

module.exports={createValBoardPacketsService,BOARD_OBSERVERS,PRIMARY_ROUTES,BOARD_SOURCE_REGISTRY,boardSourceByType};
