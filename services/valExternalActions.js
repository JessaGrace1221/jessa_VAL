const crypto=require('node:crypto');

function safeArray(value){return Array.isArray(value)?value:[];}
function compactText(value,limit=900){return String(value||'').replace(/\s+/g,' ').trim().slice(0,limit);}
function jsonValue(value,fallback){if(value==null)return fallback;if(typeof value==='string'){try{return JSON.parse(value);}catch(_){return fallback;}}return value;}
function toSnake(key){return key.replace(/[A-Z]/g,m=>'_'+m.toLowerCase());}
function toCamelRow(row={}){
  const out={};
  for(const [k,v] of Object.entries(row||{})){
    const camel=k.replace(/_([a-z])/g,(_,c)=>c.toUpperCase());
    out[camel]=v instanceof Date?v.toISOString():v;
  }
  for(const key of ['payloadPreviewJson','sourceRefsJson','sourceContextJson','beforeJson','afterJson']){
    if(Object.hasOwn(out,key))out[key]=jsonValue(out[key],/refs/i.test(key)?[]:{});
  }
  return out;
}
function normalizeSourceRef(ref={}){
  return {
    source_type:String(ref.source_type||ref.sourceType||ref.type||'unknown'),
    source_id:String(ref.source_id||ref.sourceId||ref.id||''),
    quote_or_summary:compactText(ref.quote_or_summary||ref.quoteOrSummary||ref.summary||ref.quote||'',900),
    confidence:Math.max(0,Math.min(1,Number(ref.confidence)||0)),
    created_at:ref.created_at||ref.createdAt||new Date().toISOString()
  };
}
function stableKey(value=''){return String(value||'').toLowerCase().replace(/[^a-z0-9:_-]+/g,'_').slice(0,180);}
function allowedAction(type){
  return ['send_email','create_gmail_draft','create_outlook_draft','send_sms','create_crm_note','create_crm_task','send_proposal','send_invoice','create_calendar_hold','send_calendar_invite','append_google_doc','move_crm_stage','add_or_remove_tag','publish_content','no_external_action'].includes(type)?type:'no_external_action';
}
function externalActionForInstruction(action=''){
  const map={
    send_email:'send_email',
    create_draft:'create_gmail_draft',
    send_sms:'send_sms',
    send_proposal:'send_proposal',
    send_invoice:'send_invoice',
    create_calendar_hold:'create_calendar_hold',
    send_calendar_invite:'send_calendar_invite',
    move_crm_stage:'move_crm_stage',
    add_or_remove_tag:'add_or_remove_tag',
    publish_content:'publish_content',
    build_artifact:'publish_content',
    make_introduction:'send_email',
    draft_introduction:'create_gmail_draft',
    create_crm_note:'create_crm_note',
    create_task:'create_crm_task'
  };
  return allowedAction(map[action]||'no_external_action');
}
function packetForPreparedArtifact(candidate={},run={},uuid,scope){
  const artifact=candidate.prepared_artifact||candidate.preparedArtifact||{};
  const refs=candidate.source_refs||candidate.sourceRefs||run.evidenceRefsJson||run.evidence_refs_json||[];
  const targetId=artifact.target||run.transcriptId||run.transcript_id||run.id;
  if(artifact.kind==='proposal_draft')return basePacket({uuid,scope,source:'transcript_prepared_work',actionType:'send_proposal',targetSystem:'CRM',targetId,title:candidate.title||artifact.title,summary:candidate.summary||candidate.what_val_did,payload:{proposalDraft:artifact,externalSend:false,reviewRequired:true},refs,approvalPolicy:candidate.approval_policy||candidate.approvalPolicy,sourceContext:{transcriptIntelligenceRunId:run.id,transcriptId:run.transcriptId||run.transcript_id,preparedWorkId:candidate.id,kind:artifact.kind}});
  if(artifact.kind==='html_page_draft')return basePacket({uuid,scope,source:'transcript_prepared_work',actionType:'publish_content',targetSystem:'VAL workspace',targetId,title:candidate.title||artifact.title,summary:candidate.summary||candidate.what_val_did,payload:{htmlDraft:artifact.html,filename:artifact.filename,externalPublish:false,reviewRequired:true},refs,approvalPolicy:candidate.approval_policy||candidate.approvalPolicy,sourceContext:{transcriptIntelligenceRunId:run.id,transcriptId:run.transcriptId||run.transcript_id,preparedWorkId:candidate.id,kind:artifact.kind}});
  if(artifact.kind==='calendar_invite_draft')return basePacket({uuid,scope,source:'transcript_prepared_work',actionType:'send_calendar_invite',targetSystem:'calendar/CRM',targetId,title:candidate.title||artifact.title,summary:candidate.summary||candidate.what_val_did,payload:{calendarInviteDraft:artifact,externalCalendarWrite:false,reviewRequired:true},refs,approvalPolicy:candidate.approval_policy||candidate.approvalPolicy,sourceContext:{transcriptIntelligenceRunId:run.id,transcriptId:run.transcriptId||run.transcript_id,preparedWorkId:candidate.id,kind:artifact.kind}});
  if(artifact.kind==='introduction_email_draft'||artifact.kind==='email_draft')return basePacket({uuid,scope,source:'transcript_prepared_work',actionType:'create_gmail_draft',targetSystem:'email',targetId,title:candidate.title||artifact.title,summary:candidate.summary||candidate.what_val_did,payload:{subject:artifact.title||candidate.title,bodyPreview:artifact.instruction||candidate.summary,recipients:artifact.recipients||[],externalDraftWrite:false,externalSend:false,reviewRequired:true},refs,approvalPolicy:candidate.approval_policy||candidate.approvalPolicy,sourceContext:{transcriptIntelligenceRunId:run.id,transcriptId:run.transcriptId||run.transcript_id,preparedWorkId:candidate.id,kind:artifact.kind}});
  return null;
}
function riskFromText(text=''){
  const raw=String(text||'');
  const financial=/\b(invoice|payment|charge|pricing|contract|legal|financial|refund)\b/i.test(raw)?'high':'low';
  const relationship=/\b(apolog|boundary|conflict|sensitive|trust|repair|client|partner|vip)\b/i.test(raw)?'high':(/\b(follow.?up|intro|introduction|meeting|relationship)\b/i.test(raw)?'medium':'low');
  const representation=/\b(send|publish|proposal|invoice|sms|email|apology|contract|legal|boundary)\b/i.test(raw)?'high':'medium';
  const riskLevel=financial==='high'||relationship==='high'||representation==='high'?'high':(relationship==='medium'?'medium':'low');
  return {riskLevel,financialOrLegalRisk:financial,relationshipRisk:relationship,representationRisk:representation};
}
function approvalFor(packet){
  if(packet.approvalPolicy==='never_auto')return 'never_auto';
  if(packet.approvalPolicy==='voice_authorized'&&packet.authenticatedUserConfirmed&&Number(packet.speakerConfidence)>=0.75&&!['send_invoice'].includes(packet.actionType)&&packet.financialOrLegalRisk!=='high')return 'voice_authorized';
  if(packet.riskLevel==='high'||packet.financialOrLegalRisk==='high'||packet.representationRisk==='high')return 'approval_required';
  return packet.approvalPolicy||'approval_required';
}
function expiresAt(days=14){return new Date(Date.now()+days*24*60*60*1000).toISOString();}
function packetId(uuid,scope,source,actionType,targetId,title){return stableKey(`ext_${scope.tenantId}_${scope.userId}_${source}_${actionType}_${targetId}_${title}`)||uuid('extpacket');}
function authFromContext(sourceContext={},fallback={}) {
  const auth=sourceContext.authorization||sourceContext.authorizationJson||sourceContext;
  return {
    authorizationSource:auth.authorization_source||auth.authorizationSource||fallback.authorizationSource||'',
    authorizationEventId:auth.authorization_event_id||auth.authorizationEventId||fallback.authorizationEventId||'',
    authorizationQuote:auth.authorization_quote||auth.authorizationQuote||fallback.authorizationQuote||'',
    authenticatedUserConfirmed:!!(auth.authenticated_user_confirmed||auth.authenticatedUserConfirmed||fallback.authenticatedUserConfirmed),
    speakerConfidence:Math.max(0,Math.min(1,Number(auth.speaker_confidence||auth.speakerConfidence||fallback.speakerConfidence)||0)),
    authorizationCreatedAt:auth.authorization_created_at||auth.authorizationCreatedAt||fallback.authorizationCreatedAt||null,
    authorizationPolicy:auth.authorization||auth.approval_policy||auth.approvalPolicy||fallback.authorizationPolicy||''
  };
}
function basePacket({uuid,scope,source,actionType,targetSystem,targetId,title,summary,payload={},refs=[],sourceContext={},riskText='',approvalPolicy=''}) {
  const risks=riskFromText([title,summary,riskText,JSON.stringify(payload)].join(' '));
  const auth=authFromContext(sourceContext);
  const packet={
    id:packetId(uuid,scope,source,actionType,targetId,title),
    tenantId:scope.tenantId,
    userId:scope.userId,
    status:'draft',
    actionType:allowedAction(actionType),
    targetSystem,
    targetId:String(targetId||''),
    payloadPreviewJson:payload,
    sourceRefsJson:safeArray(refs).map(normalizeSourceRef),
    whyThisActionExists:compactText(summary||title,900),
    whatWillHappen:'This packet will be available for future one-at-a-time execution review. Phase 9 approval does not execute it.',
    whatWillNotHappen:'No email, SMS, CRM update, calendar change, proposal, invoice, tag, stage movement, publishing, or external write will happen in Phase 9.',
    riskLevel:risks.riskLevel,
    approvalPolicy:approvalPolicy||auth.authorizationPolicy||'approval_required',
    representationRisk:risks.representationRisk,
    financialOrLegalRisk:risks.financialOrLegalRisk,
    relationshipRisk:risks.relationshipRisk,
    authorizationSource:auth.authorizationSource,
    authorizationEventId:auth.authorizationEventId,
    authorizationQuote:auth.authorizationQuote,
    authenticatedUserConfirmed:auth.authenticatedUserConfirmed,
    speakerConfidence:auth.speakerConfidence,
    authorizationCreatedAt:auth.authorizationCreatedAt,
    expiresAt:expiresAt(risks.riskLevel==='high'?7:14),
    sourceContextJson:{...sourceContext,source,noExternalExecution:true},
    createdAt:new Date().toISOString(),
    updatedAt:new Date().toISOString(),
    reviewedAt:null
  };
  packet.approvalPolicy=approvalFor(packet);
  return packet;
}
function packetsFromReviewUpdates(rows=[],uuid,scope){
  const packets=[];
  for(const row of safeArray(rows).filter(r=>r.status==='approved')){
    const value=jsonValue(row.proposed_value_json||row.proposedValueJson,{});
    const refs=safeArray(row.source_refs_json||row.sourceRefsJson).map(normalizeSourceRef);
    const targetType=row.target_type||row.targetType;
    if(targetType==='crm_note_candidate'){
      packets.push(basePacket({uuid,scope,source:'review_update',actionType:'create_crm_note',targetSystem:'CRM',targetId:row.applied_target_id||row.appliedTargetId||row.target_key||row.targetKey,title:row.title,summary:row.summary,payload:{note:compactText(value.note||row.summary,1200),sourceDate:value.date||row.created_at||row.createdAt,externalCrmMutation:false},refs,approvalPolicy:row.approval_policy||row.approvalPolicy,sourceContext:{reviewUpdateId:row.id,targetType,...jsonValue(row.metadata_json||row.metadataJson,{})}}));
    }else if(targetType==='crm_task_candidate'){
      packets.push(basePacket({uuid,scope,source:'review_update',actionType:'create_crm_task',targetSystem:'CRM',targetId:row.applied_target_id||row.appliedTargetId||row.target_key||row.targetKey,title:row.title,summary:row.summary,payload:{title:value.taskTitle||row.title,why:value.why||row.summary,externalCrmMutation:false},refs,approvalPolicy:row.approval_policy||row.approvalPolicy,sourceContext:{reviewUpdateId:row.id,targetType,...jsonValue(row.metadata_json||row.metadataJson,{})}}));
    }else if(/proposal/i.test(row.summary||row.title)){
      packets.push(basePacket({uuid,scope,source:'review_update',actionType:'send_proposal',targetSystem:'CRM',targetId:row.target_key||row.targetKey,title:row.title,summary:row.summary,payload:{proposalCandidate:value,externalSend:false},refs,approvalPolicy:row.approval_policy||row.approvalPolicy,sourceContext:{reviewUpdateId:row.id,targetType,...jsonValue(row.metadata_json||row.metadataJson,{})}}));
    }else if(/invoice/i.test(row.summary||row.title)){
      packets.push(basePacket({uuid,scope,source:'review_update',actionType:'send_invoice',targetSystem:'CRM',targetId:row.target_key||row.targetKey,title:row.title,summary:row.summary,payload:{invoiceCandidate:value,externalSend:false},refs,approvalPolicy:row.approval_policy||row.approvalPolicy,sourceContext:{reviewUpdateId:row.id,targetType,...jsonValue(row.metadata_json||row.metadataJson,{})}}));
    }
  }
  return packets;
}
function packetsFromReady(rows=[],uuid,scope){
  return safeArray(rows).filter(r=>['approved','ready_for_review'].includes(r.status)).map(row=>{
    const refs=safeArray(row.source_refs_json||row.sourceRefsJson).map(normalizeSourceRef);
    const meta=jsonValue(row.metadata_json||row.metadataJson,{});
    if(meta?.source==='meeting_prep')return basePacket({uuid,scope,source:'ready_for_you',actionType:'create_calendar_hold',targetSystem:'calendar',targetId:meta.calendarEventId||row.id,title:row.title,summary:row.summary||row.why_now||row.whyNow,payload:{calendarEventId:meta.calendarEventId||'',holdReason:row.title,externalCalendarWrite:false},refs,sourceContext:{readyForYouItemId:row.id,source:meta.source}});
    if(meta?.source==='transcript_intelligence')return basePacket({uuid,scope,source:'ready_for_you',actionType:'create_crm_task',targetSystem:'CRM',targetId:meta.transcriptId||row.id,title:row.title,summary:row.summary,payload:{title:row.title,why:row.summary,externalCrmMutation:false},refs,sourceContext:{readyForYouItemId:row.id,source:meta.source}});
    return null;
  }).filter(Boolean);
}
function packetsFromDrafts(rows=[],uuid,scope){
  return safeArray(rows).filter(d=>String(d.sourceContext?.source||d.source_context_json?.source||'')==='executive_inbox_review_only').flatMap(draft=>{
    const source=draft.sourceContext||draft.source_context_json||{};
    const refs=[normalizeSourceRef({sourceType:'draft',sourceId:draft.id,quoteOrSummary:draft.subject||'Review-only email draft',confidence:0.75})];
    const conversation=source.conversationContext||{};
    const latest=conversation.latest_inbound||conversation.latestInbound||conversation.current_message||conversation.currentMessage||{};
    const to=source.to||source.recipientEmail||latest.from?.email||latest.fromEmail||'';
    const provider=source.provider||latest.provider||conversation.provider||draft.provider||'internal';
    const threadId=source.threadId||latest.threadId||conversation.threadId||source.conversationId||'';
    const payload={subject:draft.subject||'',body:draft.body||'',bodyPreview:compactText(draft.body||'',1200),provider,to,threadId,externalDraftWrite:false,externalSend:false};
    return [
      basePacket({uuid,scope,source:'executive_inbox_review_only',actionType:'create_gmail_draft',targetSystem:'gmail',targetId:source.threadId||source.conversationId||draft.id,title:draft.subject||'Create Gmail draft',summary:'Create a provider draft from a local review-only email draft.',payload,refs,sourceContext:{draftId:draft.id,conversationId:source.conversationId||''}}),
      basePacket({uuid,scope,source:'executive_inbox_review_only',actionType:'create_outlook_draft',targetSystem:'outlook',targetId:source.threadId||source.conversationId||draft.id,title:draft.subject||'Create Outlook draft',summary:'Create a provider draft from a local review-only email draft.',payload,refs,sourceContext:{draftId:draft.id,conversationId:source.conversationId||''}}),
      basePacket({uuid,scope,source:'executive_inbox_review_only',actionType:'send_email',targetSystem:'email',targetId:source.threadId||source.conversationId||draft.id,title:draft.subject||'Send email',summary:'Send the prepared email after explicit final approval.',payload:{...payload,externalSend:true,requiresFreshApproval:true},refs,sourceContext:{draftId:draft.id,conversationId:source.conversationId||''}})
    ];
  });
}
function packetsFromLocalCrm(rows=[],uuid,scope,type='note'){
  return safeArray(rows).filter(r=>['approved_local_only','pending','candidate'].includes(r.status||'candidate')).map(row=>basePacket({
    uuid,scope,source:`local_crm_${type}_candidate`,actionType:type==='note'?'create_crm_note':'create_crm_task',targetSystem:'CRM',targetId:row.contactId||row.targetId||row.id,title:row.title||`CRM ${type} candidate`,summary:row.summary||row.why||'',payload:type==='note'?{note:compactText(row.summary||row.note||'',1200),externalCrmMutation:false}:{title:row.title,why:row.summary||row.why,externalCrmMutation:false},refs:row.sourceRefs||row.sourceRefsJson||[],sourceContext:{localCandidateId:row.id}
  }));
}
function packetsFromMeeting(rows=[],uuid,scope){
  return safeArray(rows).filter(r=>r.status==='ready_for_review').map(row=>basePacket({uuid,scope,source:'meeting_prep',actionType:'send_calendar_invite',targetSystem:'calendar',targetId:row.calendarEventId||row.calendar_event_id||row.id,title:`Calendar action candidate: ${row.briefJson?.meeting_title||row.brief_json?.meeting_title||row.id}`,summary:'Meeting prep indicates a calendar-related follow-up may be useful, but Phase 9 only plans the action packet.',payload:{calendarEventId:row.calendarEventId||row.calendar_event_id||'',externalCalendarWrite:false},refs:row.sourceRefsJson||row.source_refs_json||[],sourceContext:{meetingPrepBriefId:row.id}}));
}
function packetsFromTranscript(rows=[],uuid,scope){
  const packets=[];
  for(const run of safeArray(rows)){
    for(const c of safeArray(run.readyForYouCandidatesJson||run.ready_for_you_candidates_json)){
      if(c.category==='prepared_work'||c.prepared_artifact||c.preparedArtifact){
        const packet=packetForPreparedArtifact(c,run,uuid,scope);
        if(packet)packets.push(packet);
        continue;
      }
      packets.push(basePacket({uuid,scope,source:'transcript_intelligence',actionType:'create_crm_task',targetSystem:'CRM',targetId:run.transcriptId||run.transcript_id||run.id,title:c.title||'Transcript follow-up task',summary:c.summary||c.why_user_is_seeing_this||'',payload:{title:c.title,why:c.summary,transcriptId:run.transcriptId||run.transcript_id,externalCrmMutation:false},refs:c.source_refs||run.evidenceRefsJson||run.evidence_refs_json||[],sourceContext:{transcriptIntelligenceRunId:run.id,transcriptId:run.transcriptId||run.transcript_id}}));
    }
    for(const instruction of safeArray(run.executiveInstructionsJson||run.executive_instructions_json)){
      const actionType=externalActionForInstruction(instruction.requested_action);
      if(actionType==='no_external_action')continue;
      packets.push(basePacket({
        uuid,scope,source:'executive_instruction',actionType,targetSystem:instruction.target_system||'val',targetId:instruction.target_person_or_record||run.transcriptId||run.transcript_id||run.id,
        title:`Executive instruction: ${instruction.requested_action}`,
        summary:instruction.instruction,
        payload:{instruction:instruction.instruction,requestedAction:instruction.requested_action,target:instruction.target_person_or_record,externalAction:instruction.external_action,phase95NoExecution:true},
        refs:instruction.source_refs||[],
        approvalPolicy:instruction.authorization,
        sourceContext:{transcriptIntelligenceRunId:run.id,transcriptId:run.transcriptId||run.transcript_id,authorization:instruction}
      }));
    }
  }
  return packets;
}

function createValExternalActionsService({
  dbQuery,
  hasPg=()=>false,
  getStore=()=>({}),
  saveStore=()=>{},
  listDrafts=null,
  uuid=(prefix)=>`${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`,
  tenantId=()=>'default',
  userId=()=>'default'
}={}){
  function scope(){return {tenantId:tenantId(),userId:userId()};}
  function store(){
    const s=getStore()||{};
    for(const key of ['valExternalActionPackets','valExternalActionAudit','valReviewUpdates','readyForYouItems','crmNoteCandidates','crmTaskCandidates','meetingPrepBriefs','transcriptIntelligenceRuns'])if(!Array.isArray(s[key]))s[key]=[];
    return s;
  }
  async function select(sql,params=[]){
    if(!hasPg())return [];
    const r=await dbQuery(sql,params).catch(()=>({rows:[]}));
    return r.rows||[];
  }
  async function collectCandidates(){
    const sc=scope();
    const drafts=typeof listDrafts==='function'?await listDrafts('').catch(()=>[]):safeArray(getStore().drafts);
    const [review,ready,notes,tasks,meeting,transcript]=hasPg()?await Promise.all([
      select(`select * from val_review_updates where tenant_id=$1 and user_id=$2 and status='approved' order by updated_at desc limit 80`,[tenantId(),userId()]),
      select(`select * from ready_for_you_items where tenant_id=$1 and user_id=$2 and status in ('approved','ready_for_review') order by updated_at desc limit 80`,[tenantId(),userId()]),
      Promise.resolve([]),
      Promise.resolve([]),
      select(`select * from meeting_prep_briefs where tenant_id=$1 and user_id=$2 and status='ready_for_review' order by created_at desc limit 30`,[tenantId(),userId()]),
      select(`select * from transcript_intelligence_runs where tenant_id=$1 and user_id=$2 and (jsonb_array_length(ready_for_you_candidates_json)>0 or jsonb_array_length(executive_instructions_json)>0) order by created_at desc limit 30`,[tenantId(),userId()])
    ]):[store().valReviewUpdates,store().readyForYouItems,store().crmNoteCandidates,store().crmTaskCandidates,store().meetingPrepBriefs,store().transcriptIntelligenceRuns];
    const packets=[
      ...packetsFromReviewUpdates(review,uuid,sc),
      ...packetsFromReady(ready,uuid,sc),
      ...packetsFromDrafts(drafts,uuid,sc),
      ...packetsFromLocalCrm(notes,uuid,sc,'note'),
      ...packetsFromLocalCrm(tasks,uuid,sc,'task'),
      ...packetsFromMeeting(meeting,uuid,sc),
      ...packetsFromTranscript(transcript,uuid,sc)
    ];
    const seen=new Set();
    return packets.filter(p=>{
      const key=p.id;
      if(seen.has(key))return false;
      seen.add(key);
      if(p.actionType!=='no_external_action'&&!safeArray(p.sourceRefsJson).length)return false;
      return true;
    });
  }
  async function upsertPacket(packet){
    if(hasPg()){
      const cols=['id','tenantId','userId','status','actionType','targetSystem','targetId','payloadPreviewJson','sourceRefsJson','whyThisActionExists','whatWillHappen','whatWillNotHappen','riskLevel','approvalPolicy','representationRisk','financialOrLegalRisk','relationshipRisk','authorizationSource','authorizationEventId','authorizationQuote','authenticatedUserConfirmed','speakerConfidence','authorizationCreatedAt','attemptedAt','executedAt','providerResponseId','providerResponseSummary','failureReason','retryCount','idempotencyKey','executedBy','expiresAt','sourceContextJson','createdAt','updatedAt','reviewedAt'];
      const jsonColumns=new Set(['payloadPreviewJson','sourceRefsJson','sourceContextJson']);
      const values=cols.map(c=>{
        if(jsonColumns.has(c))return JSON.stringify(packet[c]??(c==='sourceRefsJson'?[]:{}));
        if(c==='retryCount')return Math.max(0,Number(packet[c])||0);
        return packet[c]??null;
      });
      const names=cols.map(toSnake);
      const params=cols.map((_,i)=>`$${i+1}`).join(',');
      const updates=names.filter(n=>!['id','created_at'].includes(n)).map(n=>
        `${n}=case when val_external_action_packets.status='executed' then val_external_action_packets.${n} else excluded.${n} end`
      ).join(',');
      const r=await dbQuery(`insert into val_external_action_packets (${names.join(',')}) values (${params}) on conflict (id) do update set ${updates} returning *`,values);
      if(!r?.rows?.[0])throw new Error('VAL could not save the external action packet. No external action was taken.');
      return toCamelRow(r.rows[0]);
    }
    const s=store();const idx=s.valExternalActionPackets.findIndex(p=>p.id===packet.id);
    if(idx>=0)s.valExternalActionPackets[idx]={...s.valExternalActionPackets[idx],...packet,createdAt:s.valExternalActionPackets[idx].createdAt||packet.createdAt,updatedAt:new Date().toISOString()};else s.valExternalActionPackets.unshift(packet);
    saveStore(s);return idx>=0?s.valExternalActionPackets[idx]:packet;
  }
  async function audit(id,action,before={},after={},note=''){
    const row={id:uuid('extaudit'),tenantId:tenantId(),userId:userId(),packetId:id,action,beforeJson:before,afterJson:after,note,authorizationSource:after.authorizationSource||before.authorizationSource||'',authorizationEventId:after.authorizationEventId||before.authorizationEventId||'',attemptedAt:after.attemptedAt||null,executedAt:after.executedAt||null,providerResponseId:after.providerResponseId||'',providerResponseSummary:after.providerResponseSummary||'',failureReason:after.failureReason||'',retryCount:Number(after.retryCount||0),idempotencyKey:after.idempotencyKey||before.idempotencyKey||'',executedBy:after.executedBy||'',externalActionTaken:!!after.executedAt&&action==='executed',createdAt:new Date().toISOString()};
    if(hasPg())await dbQuery(`insert into val_external_action_audit (id,tenant_id,user_id,packet_id,action,before_json,after_json,note,authorization_source,authorization_event_id,attempted_at,executed_at,provider_response_id,provider_response_summary,failure_reason,retry_count,idempotency_key,executed_by,external_action_taken) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,[row.id,row.tenantId,row.userId,row.packetId,row.action,JSON.stringify(row.beforeJson),JSON.stringify(row.afterJson),row.note,row.authorizationSource,row.authorizationEventId,row.attemptedAt,row.executedAt,row.providerResponseId,row.providerResponseSummary,row.failureReason,row.retryCount,row.idempotencyKey,row.executedBy,row.externalActionTaken]);
    else{const s=store();s.valExternalActionAudit.unshift(row);saveStore(s);}
    return row;
  }
  async function build({limit=100}={}){
    const packets=(await collectCandidates()).slice(0,Math.max(1,Math.min(Number(limit)||100,250)));
    const saved=[];
    for(const packet of packets)saved.push(await upsertPacket(packet));
    return {ok:true,count:saved.length,packets:saved,no_external_action:true,execution_available:false};
  }
  async function preparePacketFromPreparedArtifact(item={}){
    const meta=jsonValue(item.metadata_json||item.metadataJson||item.metadata||item.readinessJson,{});
    const artifact=jsonValue(item.prepared_artifact||item.preparedArtifact||meta.prepared_artifact||meta.preparedArtifact,{});
    const kind=item.prepared_artifact_kind||item.preparedArtifactKind||artifact.kind||meta.prepared_artifact_kind||meta.preparedArtifactKind;
    if(!kind)return null;
    const sourceId=item.source_id||item.sourceId||meta.transcriptId||meta.transcript_id||item.id||artifact.id||artifact.artifactId||'prepared_work';
    const refs=safeArray(item.source_refs||item.sourceRefs||item.sourceRefsJson||meta.source_refs||meta.sourceRefs);
    const candidate={
      id:item.id||artifact.id||artifact.artifactId||sourceId,
      title:item.title||artifact.title||artifact.subject||'Prepared work',
      summary:item.summary||item.reason_it_matters||item.whatValPrepared||item.what_val_prepared||'VAL prepared this for review.',
      what_val_did:item.whatValPrepared||item.what_val_prepared||item.summary||'VAL prepared this for review.',
      prepared_artifact:{...artifact,kind},
      source_refs:refs.length?refs:[normalizeSourceRef({sourceType:item.source_type||item.sourceType||'prepared_work',sourceId,quoteOrSummary:item.summary||item.title||'Prepared work surfaced for review.',confidence:item.confidence||0.75})],
      approval_policy:item.approval_policy||item.approvalPolicy||meta.approval_policy||meta.approvalPolicy
    };
    const run={
      id:meta.transcriptIntelligenceRunId||meta.transcript_intelligence_run_id||item.runId||item.id||sourceId,
      transcriptId:meta.transcriptId||meta.transcript_id||item.transcriptId||item.transcript_id||sourceId,
      evidenceRefsJson:candidate.source_refs
    };
    const packet=packetForPreparedArtifact(candidate,run,uuid,scope());
    return packet?upsertPacket(packet):null;
  }
  async function list({limit=50,status='draft'}={}){
    const lim=Math.max(1,Math.min(Number(limit)||50,200));
    if(hasPg()){
      const params=[tenantId(),userId()];
      let where='tenant_id=$1 and user_id=$2';
      if(status){params.push(status);where+=` and status=$${params.length}`;}
      const r=await dbQuery(`select * from val_external_action_packets where ${where} order by created_at desc limit ${lim}`,params);
      return {ok:true,packets:(r.rows||[]).map(toCamelRow),execution_available:false};
    }
    return {ok:true,packets:store().valExternalActionPackets.filter(p=>p.tenantId===tenantId()&&p.userId===userId()&&(!status||p.status===status)).slice(0,lim),execution_available:false};
  }
  async function get(id){
    if(hasPg()){
      const r=await dbQuery(`select * from val_external_action_packets where tenant_id=$1 and user_id=$2 and id=$3`,[tenantId(),userId(),id]);
      return r.rows[0]?toCamelRow(r.rows[0]):null;
    }
    return store().valExternalActionPackets.find(p=>p.id===id&&p.tenantId===tenantId()&&p.userId===userId())||null;
  }
  async function updatePacket(id,patch){
    if(hasPg()){
      const r=await dbQuery(`update val_external_action_packets set status=coalesce($1,status), payload_preview_json=coalesce($2,payload_preview_json), why_this_action_exists=coalesce($3,why_this_action_exists), what_will_happen=coalesce($4,what_will_happen), what_will_not_happen=coalesce($5,what_will_not_happen), approval_policy=coalesce($6,approval_policy), risk_level=coalesce($7,risk_level), attempted_at=coalesce($8,attempted_at), executed_at=coalesce($9,executed_at), provider_response_id=coalesce($10,provider_response_id), provider_response_summary=coalesce($11,provider_response_summary), failure_reason=coalesce($12,failure_reason), retry_count=coalesce($13,retry_count), idempotency_key=coalesce($14,idempotency_key), executed_by=coalesce($15,executed_by), updated_at=now(), reviewed_at=coalesce($16,reviewed_at) where tenant_id=$17 and user_id=$18 and id=$19 returning *`,[patch.status||null,patch.payloadPreviewJson?JSON.stringify(patch.payloadPreviewJson):null,patch.whyThisActionExists||null,patch.whatWillHappen||null,patch.whatWillNotHappen||null,patch.approvalPolicy||null,patch.riskLevel||null,patch.attemptedAt||null,patch.executedAt||null,patch.providerResponseId||null,patch.providerResponseSummary||null,patch.failureReason||null,Number.isFinite(Number(patch.retryCount))?Number(patch.retryCount):null,patch.idempotencyKey||null,patch.executedBy||null,patch.reviewedAt||null,tenantId(),userId(),id]);
      return r.rows[0]?toCamelRow(r.rows[0]):null;
    }
    const s=store();const row=s.valExternalActionPackets.find(p=>p.id===id&&p.tenantId===tenantId()&&p.userId===userId());
    if(!row)return null;Object.assign(row,patch,{updatedAt:new Date().toISOString()});saveStore(s);return row;
  }
  async function approve(id,{note=''}={}){
    const before=await get(id);if(!before)return null;
    if(before.status==='executed')throw new Error('Executed packets are not managed by the Phase 9 planner.');
    const after=await updatePacket(id,{status:'approved_local_only',reviewedAt:new Date().toISOString()});
    if(!after)throw new Error('VAL could not persist approval for this external action. No external action was taken.');
    await audit(id,'approved_local_only',before,after,note);
    return after;
  }
  async function reject(id,{reason=''}={}){
    const before=await get(id);if(!before)return null;
    const after=await updatePacket(id,{status:'rejected',reviewedAt:new Date().toISOString()});
    await audit(id,'rejected',before,after,reason);
    return after;
  }
  async function edit(id,changes={}){
    const before=await get(id);if(!before)return null;
    const after=await updatePacket(id,{payloadPreviewJson:changes.payloadPreviewJson||changes.payload_preview_json,whyThisActionExists:changes.whyThisActionExists||changes.why_this_action_exists,whatWillHappen:changes.whatWillHappen||changes.what_will_happen,whatWillNotHappen:changes.whatWillNotHappen||changes.what_will_not_happen,approvalPolicy:changes.approvalPolicy||changes.approval_policy,riskLevel:changes.riskLevel||changes.risk_level});
    await audit(id,'edited',before,after,changes.note||'');
    return after;
  }
  async function createEmailSendPacket(payload={}){
    const to=compactText(payload.to||payload.recipientEmail||payload.recipient||'',320);
    const subject=compactText(payload.subject||payload.title||'VAL email',320);
    const body=String(payload.body||payload.bodyText||payload.message||payload.bodyPreview||'').trim();
    const provider=String(payload.provider||payload.targetSystem||'gmail').trim().toLowerCase();
    const googleProvider=String(payload.googleProvider||payload.google_provider||'google').trim();
    const accountEmail=compactText(payload.accountEmail||payload.account_email||'',320);
    const sourceContext=jsonValue(payload.sourceContext||payload.source_context,{});
    const refs=safeArray(payload.sourceRefs||payload.source_refs||payload.sourceRefsJson||payload.source_refs_json);
    const contentKey=crypto.createHash('sha256').update([to,subject,body,provider].join('\n')).digest('hex').slice(0,20);
    const packet=basePacket({
      uuid,
      scope:scope(),
      source:'send_gate',
      actionType:'send_email',
      targetSystem:provider.includes('outlook')||provider.includes('microsoft')?'outlook':'gmail',
      targetId:payload.threadId||payload.messageId||sourceContext.draftId||payload.id||`${to}:${contentKey}`,
      title:subject,
      summary:payload.why||payload.summary||`Send email to ${to||'recipient'}.`,
      payload:{to,subject,body,bodyPreview:compactText(body,1200),provider,googleProvider,accountEmail,threadId:payload.threadId||'',messageId:payload.messageId||'',externalSend:true,requiresFreshApproval:true},
      refs:refs.length?refs:[normalizeSourceRef({sourceType:sourceContext.source||'send_gate',sourceId:sourceContext.draftId||sourceContext.docId||payload.id||'',quoteOrSummary:subject,confidence:0.9})],
      approvalPolicy:'approval_required',
      sourceContext:{...sourceContext,source:'send_gate',googleProvider,accountEmail,finalApprovalSurface:payload.finalApprovalSurface||'global_send_gate'}
    });
    packet.whatWillHappen='After final approval, VAL will send exactly this email through the connected provider and save an execution receipt.';
    packet.whatWillNotHappen='VAL will not send any other email, modify CRM, create calendar events, publish content, or change the draft contents beyond the fields shown in this send gate.';
    return upsertPacket(packet);
  }
  async function createSmsSendPacket(payload={}){
    const message=String(payload.message||payload.body||payload.text||payload.bodyPreview||'').trim();
    const contactId=compactText(payload.contactId||payload.contact_id||payload.targetId||'',240);
    const conversationId=compactText(payload.conversationId||payload.conversation_id||'',240);
    const recipient=compactText(payload.recipientName||payload.recipient||payload.to||contactId||conversationId||'recipient',320);
    const sourceContext=jsonValue(payload.sourceContext||payload.source_context,{});
    const refs=safeArray(payload.sourceRefs||payload.source_refs||payload.sourceRefsJson||payload.source_refs_json);
    const packet=basePacket({
      uuid,
      scope:scope(),
      source:'send_gate',
      actionType:'send_sms',
      targetSystem:'GHL',
      targetId:contactId||conversationId||recipient,
      title:payload.title||`Text ${recipient}`,
      summary:payload.why||payload.summary||`Send SMS to ${recipient}.`,
      payload:{
        contactId,
        conversationId,
        recipient,
        message,
        bodyPreview:compactText(message,1200),
        externalSend:true,
        requiresFreshApproval:true
      },
      refs:refs.length?refs:[normalizeSourceRef({sourceType:sourceContext.source||'send_gate',sourceId:sourceContext.contactId||contactId||conversationId||payload.id||'',quoteOrSummary:compactText(message||recipient,300),confidence:0.9})],
      approvalPolicy:'approval_required',
      sourceContext:{...sourceContext,source:'send_gate',finalApprovalSurface:payload.finalApprovalSurface||'global_send_gate'}
    });
    packet.whatWillHappen='After final approval, VAL will send exactly this SMS through GHL and save an execution receipt.';
    packet.whatWillNotHappen='VAL will not send any other SMS, email, CRM update, calendar event, tag, stage movement, publishing, or external write from this packet.';
    return upsertPacket(packet);
  }
  async function createGoogleDocAppendPacket(payload={}){
    const documentId=compactText(payload.documentId||payload.document_id||payload.targetId||'',320);
    const content=String(payload.content||payload.body||payload.bodyPreview||'').trim();
    const sourceContext=jsonValue(payload.sourceContext||payload.source_context,{});
    const refs=safeArray(payload.sourceRefs||payload.source_refs||payload.sourceRefsJson||payload.source_refs_json);
    const packet=basePacket({
      uuid,
      scope:scope(),
      source:'environment_action',
      actionType:'append_google_doc',
      targetSystem:'google_docs',
      targetId:documentId,
      title:payload.title||'Append meeting overview to Google Doc',
      summary:payload.why||payload.summary||'Append the exact meeting overview to the selected Google Doc.',
      payload:{
        documentId,
        content,
        bodyPreview:compactText(content,1200),
        mode:'append',
        externalWrite:true,
        requiresFreshApproval:true
      },
      refs:refs.length?refs:[normalizeSourceRef({
        sourceType:sourceContext.source||'environment',
        sourceId:sourceContext.sourceId||sourceContext.environmentRunId||payload.id||'',
        quoteOrSummary:compactText(payload.title||content,300),
        confidence:0.95
      })],
      approvalPolicy:'approval_required',
      sourceContext:{...sourceContext,source:'environment_action',finalApprovalSurface:payload.finalApprovalSurface||'val_environment'}
    });
    packet.whatWillHappen='After approval, VAL will append exactly this meeting overview to the selected Google Doc and save an execution receipt.';
    packet.whatWillNotHappen='VAL will not replace existing document content, resend the meeting email, or change any other connected system.';
    return upsertPacket(packet);
  }
  async function auditForPacket(id,{limit=50}={}){
    const lim=Math.max(1,Math.min(Number(limit)||50,200));
    if(hasPg()){
      const r=await dbQuery(`select * from val_external_action_audit where tenant_id=$1 and user_id=$2 and packet_id=$3 order by created_at asc limit ${lim}`,[tenantId(),userId(),id]);
      return (r.rows||[]).map(toCamelRow);
    }
    return store().valExternalActionAudit
      .filter(row=>row.packetId===id&&row.tenantId===tenantId()&&row.userId===userId())
      .sort((a,b)=>String(a.createdAt||'').localeCompare(String(b.createdAt||'')))
      .slice(0,lim);
  }
  return {build,list,get,updatePacket,audit,auditForPacket,approve,reject,edit,createEmailSendPacket,createSmsSendPacket,createGoogleDocAppendPacket,collectCandidates,preparePacketFromPreparedArtifact};
}

module.exports={createValExternalActionsService,allowedAction,riskFromText,approvalFor};
