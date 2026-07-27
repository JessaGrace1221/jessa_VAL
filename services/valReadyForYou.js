function safeArray(value){ return Array.isArray(value)?value:[]; }
const {receiptForReadyItem}=require('./valExecutionVisibility');
const {preparedArtifactForInstruction,preparedWorkType}=require('./valTranscriptIntelligence');
const {assessPreparedWork,artifactAdmissionFromStored}=require('./valPreparedWorkAdmission');

function compactText(value,limit=700){
  return String(value||'').replace(/\s+/g,' ').trim().slice(0,limit);
}
function jsonValue(value,fallback){
  if(value==null)return fallback;
  if(typeof value==='string'){
    try{return JSON.parse(value);}catch(_){return fallback;}
  }
  return value;
}
function toSnake(key){ return key.replace(/[A-Z]/g,m=>'_'+m.toLowerCase()); }
function normalizeSourceRef(ref={}){
  return {
    source_type:String(ref.source_type||ref.sourceType||ref.type||'unknown'),
    source_id:String(ref.source_id||ref.sourceId||ref.id||''),
    quote_or_summary:compactText(ref.quote_or_summary||ref.quoteOrSummary||ref.summary||ref.quote||'',900),
    confidence:Math.max(0,Math.min(1,Number(ref.confidence)||0)),
    created_at:ref.created_at||ref.createdAt||new Date().toISOString()
  };
}
function parseReadyRow(row={}){
  const out={};
  for(const [k,v] of Object.entries(row||{})){
    const camel=k.replace(/_([a-z])/g,(_,c)=>c.toUpperCase());
    out[camel]=v instanceof Date?v.toISOString():v;
  }
  for(const key of ['readinessJson','sourceRefsJson','actionsJson','metadataJson','decisionJson']){
    out[key]=jsonValue(out[key],key==='metadataJson'||key==='decisionJson'?{}:[]);
  }
  out.type=out.itemType||out.type||'prepared_work';
  out.whatValDid=out.whatValDid||out.whatValPrepared||'';
  out.whatOnlyUserCanDo=out.whatOnlyUserCanDo||out.whatUserNeedsToDo||'';
  return out;
}
function sourceKey(value=''){
  return String(value||'')
    .replace(/[^a-zA-Z0-9:_-]+/g,'_')
    .slice(0,120);
}
function preparedSourceVersionKey(item={}){
  const metadata=jsonValue(item.metadataJson||item.metadata_json||item.metadata,{})||{};
  const brief=metadata.workingBrief||metadata.workBrief||item.workingBrief||item.working_brief||{};
  const sourceContext=brief.sourceContext||brief.source_context||{};
  const packets=safeArray(brief.sourcePackets||brief.source_packets||item.source_packets);
  return JSON.stringify({
    sourceProcessingRecordIds:safeArray(sourceContext.sourceProcessingRecordIds||sourceContext.source_processing_record_ids),
    immutableSourceVersions:safeArray(sourceContext.immutableSourceVersions||sourceContext.immutable_source_versions),
    packets:packets.map(packet=>[
      packet.source_processing_record_id||packet.sourceProcessingRecordId||'',
      packet.source_version||packet.sourceVersion||'',
      packet.source_fingerprint||packet.sourceFingerprint||''
    ]),
    refs:safeArray(item.sourceRefsJson||item.source_refs_json||item.source_refs).map(ref=>[
      ref.source_id||ref.sourceId||'',
      ref.quote_or_summary||ref.quoteOrSummary||''
    ])
  });
}
function stableItemId(uuid,tenantId,userId,source,id){
  return sourceKey(`ready_${tenantId}_${userId}_${source}_${id}`) || uuid('ready');
}
function estimateMinutes(text='',risk='medium'){
  const words=String(text||'').trim().split(/\s+/).filter(Boolean).length;
  const base=Math.max(1,Math.ceil(words/180));
  if(risk==='high')return Math.max(base,4);
  if(risk==='low')return Math.max(base,1);
  return Math.max(base,2);
}
function approvalActions(item){
  const actions=[
    {key:'approve',label:'Approve',external_action:false},
    {key:'reject',label:'Reject',external_action:false},
    {key:'snooze',label:'Snooze',external_action:false}
  ];
  if(item.metadataJson?.draftId||item.metadata?.draftId) actions.unshift({key:'review_draft',label:'Review draft',external_action:false});
  if(item.metadataJson?.preparedArtifactKind||item.metadata?.preparedArtifactKind) actions.unshift({key:'review_prepared_work',label:'Review prepared work',external_action:false});
  return actions;
}
function readyItemPreparedArtifact(item = {}){
  const metadata=jsonValue(item.metadataJson||item.metadata_json||item.metadata,{})||{};
  return metadata.preparedArtifact||metadata.prepared_artifact||item.preparedArtifact||item.prepared_artifact||null;
}
function readyItemPreparedArtifactKind(item = {}){
  const metadata=jsonValue(item.metadataJson||item.metadata_json||item.metadata,{})||{};
  const readiness=jsonValue(item.readinessJson||item.readiness_json||item.readiness,{})||{};
  const artifact=readyItemPreparedArtifact(item)||{};
  return compactText(artifact.kind||metadata.preparedArtifactKind||metadata.prepared_artifact_kind||readiness.prepared_artifact_kind||item.preparedArtifactKind||item.prepared_artifact_kind||'',120);
}
function readyItemHasConcretePreparedWork(item = {}){
  const artifact=readyItemPreparedArtifact(item)||{};
  const kind=readyItemPreparedArtifactKind(item);
  if(!kind)return false;
  if(/\b(commitment_bundle|transcript_follow_up|relationship_project_update_candidate|transcript_follow_up_bundle|task_context|email_draft_readiness)\b/i.test(kind))return false;
  if(!artifactAdmissionFromStored(item).admitted)return false;
  const text=[
    artifact.body,
    artifact.content,
    artifact.html,
    artifact.instruction,
    Array.isArray(artifact.sections)?artifact.sections.join('\n'):'',
    Array.isArray(artifact.recipients)&&artifact.recipients.length?JSON.stringify(artifact.recipients):'',
    Array.isArray(artifact.attendees)&&artifact.attendees.length?JSON.stringify(artifact.attendees):'',
    item.whatValPrepared,
    item.what_val_prepared
  ].map(v=>String(v||'').trim()).find(v=>v.length>=8);
  return Boolean(text);
}
function preparedWorkTaskFromReadyItem(item={},admission={}){
  const metadata=jsonValue(item.metadataJson||item.metadata_json||item.metadata,{})||{};
  const artifact=readyItemPreparedArtifact(item)||{};
  const missing=safeArray(admission.missingInformation||admission.brief?.missingInformation);
  return {
    ...item,
    category:'task',
    type:'prepared_work_needs_information',
    itemType:'prepared_work_needs_information',
    status:'needs_context',
    title:compactText(item.title||`Finish ${String(artifact.kind||'prepared work').replace(/_/g,' ')}`,180),
    summary:'VAL recognized the intended work but did not admit it to Leverage because it is incomplete.',
    readinessJson:{status:'needs_information',missing_information:missing,work_brief:admission.brief||{}},
    whatValPrepared:'VAL preserved the source packet and stopped before presenting incomplete work as a draft.',
    whatUserNeedsToDo:`Resolve: ${missing.join('; ')}`,
    whatValDid:'Classified the work and kept it as a task. No approval-ready draft or external action was created.',
    whatOnlyUserCanDo:`Resolve: ${missing.join('; ')}`,
    actionsJson:[
      {key:'answer_questions',label:'Answer the questions',external_action:false},
      {key:'open_source',label:'Open the source',external_action:false},
      {key:'dismiss',label:'Dismiss',external_action:false}
    ],
    metadataJson:{
      ...metadata,
      originalPreparedArtifactKind:readyItemPreparedArtifactKind(item),
      preparedArtifactKind:'',
      preparedArtifact:null,
      preparedWorkAdmission:'rejected',
      missingInformation:missing,
      workBrief:admission.brief||{},
      noExternalAction:true
    }
  };
}
function enforcePreparedWorkAdmission(item={}){
  const kind=readyItemPreparedArtifactKind(item);
  if(!kind)return item;
  const admission=artifactAdmissionFromStored(item);
  if(admission.excluded)return {
    ...item,
    category:'excluded',
    status:'excluded',
    requiresApproval:false,
    actionsJson:[],
    metadataJson:{
      ...(item.metadataJson||{}),
      preparedArtifactKind:'',
      preparedArtifact:null,
      preparedWorkAdmission:'excluded',
      preparedWorkExclusionReasons:safeArray(admission.exclusionReasons),
      noExternalAction:true
    }
  };
  return admission.admitted?{
    ...item,
    metadataJson:{...(item.metadataJson||{}),preparedWorkAdmission:'admitted',workBrief:admission.brief}
  }:preparedWorkTaskFromReadyItem(item,admission);
}
function preparedWorkCount(rows=[]){
  return safeArray(rows)
    .filter(row=>['ready','ready_for_review','needs_context'].includes(row.status||'ready_for_review'))
    .filter(readyItemHasConcretePreparedWork)
    .length;
}
function draftRecipient(draft={}){
  const source=draft.sourceContext||{};
  const context=source.conversationContext||{};
  const brief=source.draftBrief||{};
  const recipient=brief.recipient||context.latest_inbound?.from||context.current_message?.from||{};
  const email=String(recipient.email||source.recipientEmail||source.to||'').trim().toLowerCase();
  return {
    name:compactText(recipient.name||recipient.displayName||source.recipientName||'',120),
    email,
    contactId:String(recipient.contactId||recipient.crmContactId||draft.contactId||'').trim()
  };
}
function draftSourceRefs(draft={}){
  const source=draft.sourceContext||{};
  const context=source.conversationContext||{};
  const message=context.latest_inbound||context.current_message||{};
  const refs=safeArray(source.draftBrief?.source_refs||source.draftBrief?.sourceRefs)
    .concat(safeArray(context.source_refs||context.sourceRefs))
    .map(normalizeSourceRef)
    .filter(ref=>ref.source_id&&ref.quote_or_summary);
  if(refs.length)return refs;
  const sourceId=message.messageId||message.id||source.currentMessageId||source.messageId||source.threadId||source.conversationId||'';
  const excerpt=message.bodyText||message.bodyPreview||message.snippet||message.subject||draft.subject||'';
  return sourceId&&compactText(excerpt,900)
    ? [normalizeSourceRef({sourceType:'email_message',sourceId,quoteOrSummary:excerpt,confidence:0.82,createdAt:message.receivedAt||message.date||draft.createdAt})]
    : [];
}
function draftPreparedArtifactKind(draft={}){
  const raw=String(draft.sourceContext?.writerOutput?.draft_type||draft.draftType||'reply')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g,'_')
    .replace(/^_+|_+$/g,'');
  return /(?:^|_)email(?:_|$)/.test(raw)?raw:`email_${raw||'reply'}_draft`;
}
function draftToCandidate(draft,uuid,scope){
  const source=draft.sourceContext||{};
  const writer=source.writerOutput||{};
  const readiness=source.draftReadiness||{};
  const brief=source.draftBrief||{};
  const qa=source.qa||{};
  const representationRisk=writer.representation_risk||readiness.representation_risk||source.representationRisk||'medium';
  const approvalPolicy=writer.approval_policy||readiness.approval_policy||source.approvalPolicy||'approval_required';
  const title=draft.subject||writer.subject||brief.single_purpose||'Email draft ready for review';
  const body=draft.body||writer.body||'';
  const recipient=draftRecipient(draft);
  const refs=draftSourceRefs(draft);
  const conversationContext=source.conversationContext||{};
  const sourceMessage=conversationContext.latest_inbound||conversationContext.current_message||source.currentMessage||source.email||{};
  const preparedArtifactKind=draftPreparedArtifactKind(draft);
  const preparedArtifact={
    kind:preparedArtifactKind,
    draftType:writer.draft_type||draft.draftType||'reply',
    title,
    subject:title,
    body,
    recipientName:recipient.name,
    recipientEmail:recipient.email,
    recipientId:recipient.contactId,
    target:recipient.email||recipient.name,
    recipients:recipient.email?[recipient]:[],
    provider:draft.provider||'internal',
    threadId:source.threadId||'',
    messageId:source.currentMessageId||source.messageId||'',
    intendedAction:'send_email',
    reviewRequired:true,
    sourceEmail:{
      subject:sourceMessage.subject||source.originalSubject||draft.subject||'',
      from:sourceMessage.from||source.from||draft.from||'',
      snippet:sourceMessage.snippet||source.snippet||'',
      bodyPreview:sourceMessage.bodyPreview||sourceMessage.preview||source.bodyPreview||'',
      bodyText:sourceMessage.bodyText||sourceMessage.body||source.bodyText||'',
      headers:sourceMessage.headers||source.headers||{}
    },
    source_packet:{
      source_type:refs[0]?.source_type||'',
      source_id:refs[0]?.source_id||'',
      source_excerpt:refs[0]?.quote_or_summary||''
    }
  };
  const id=stableItemId(uuid,scope.tenantId,scope.userId,'draft',draft.id);
  const item={
    id,
    tenantId:scope.tenantId,
    userId:scope.userId,
    eventRunId:'',
    category:'communication',
    type:'email_review_only_draft',
    itemType:'email_review_only_draft',
    title,
    status:draft.status==='needs_context'?'needs_context':'ready_for_review',
    summary:compactText(writer.why_this_draft_exists||brief.single_purpose||body,500),
    whyUserIsSeeingThis:compactText(writer.why_this_draft_exists||'VAL prepared a review-only email draft and your judgment is required before any external action.',700),
    whyNow:compactText(brief.why_now||source.classification?.why_now||'This conversation is waiting on user judgment before it can move forward.',700),
    readinessJson:{...readiness,qa},
    whatValPrepared:compactText(body||'Review-only email draft prepared locally.',1200),
    whatUserNeedsToDo:readiness.status==='needs_context'?'Provide the missing context before this can be approved.':'Review whether this represents you before anything is sent.',
    whatValDid:'Prepared a local review-only email draft and ran draft QA. No provider draft was created.',
    whatOnlyUserCanDo:readiness.status==='needs_context'?'Provide the missing context or decide this should not be drafted.':'Decide whether the draft accurately represents your voice, intent, and relationship.',
    estimatedReviewMinutes:estimateMinutes(body,representationRisk),
    sourceRefsJson:refs,
    confidence:Math.max(0,Math.min(1,Number(writer.confidence||qa.confidence||0.72))),
    requiresApproval:true,
    approvalPolicy,
    representationRisk,
    actionsJson:[],
    metadataJson:{
      source:'executive_inbox_review_only',
      draftId:draft.id,
      conversationId:source.conversationId||'',
      threadId:source.threadId||'',
      messageId:source.currentMessageId||source.messageId||'',
      writingRules:source.writingRules||source.writing_rules||'',
      noExternalAction:true,
      noProviderDraftCreated:true,
      preparedArtifactKind,
      preparedArtifact,
      canValAct:'approval_required',
      executionPath:'review_then_send_email',
      recipientEmail:recipient.email,
      recipientName:recipient.name
    },
    decisionJson:{},
    createdAt:draft.createdAt||new Date().toISOString(),
    updatedAt:new Date().toISOString(),
    reviewedAt:null,
    snoozedUntil:null
  };
  item.actionsJson=approvalActions(item);
  return item;
}
function preparedWorkIdentity(item={}){
  const metadata=jsonValue(item.metadataJson||item.metadata_json||item.metadata,{})||{};
  const artifact=readyItemPreparedArtifact(item)||{};
  const kind=readyItemPreparedArtifactKind(item).toLowerCase();
  const title=compactText(artifact.subject||artifact.title||item.title||'',180).toLowerCase().replace(/[^a-z0-9]+/g,' ');
  const recipients=safeArray(artifact.recipients)
    .map(person=>String(person?.email||person?.address||person||'').trim().toLowerCase())
    .filter(Boolean)
    .sort()
    .join(',');
  const day=String(item.createdAt||item.created_at||'').slice(0,10);
  if(/meeting_(?:overview|recap)/.test(kind))return `meeting|${title}|${recipients}|${day}`;
  const sourceId=metadata.threadId||metadata.messageId||metadata.canonicalWorkItemId||metadata.commitmentId||metadata.transcriptId||metadata.draftId||item.id||'';
  return `${kind}|${String(sourceId).toLowerCase()}`;
}
function dedupePreparedWork(rows=[]){
  const seen=new Set();
  return safeArray(rows).filter(item=>{
    const key=preparedWorkIdentity(item);
    if(!key||seen.has(key))return false;
    seen.add(key);
    return true;
  });
}
function draftEvaluationToCandidate(candidate,uuid,scope){
  const readiness=candidate.draftReadiness||candidate.draft_readiness||{};
  const brief=candidate.draftBrief||candidate.draft_brief||{};
  if(candidate.generatedDraft||candidate.generated_draft)return null;
  const id=stableItemId(uuid,scope.tenantId,scope.userId,'draft_eval',candidate.id||candidate.conversationId);
  const item={
    id,
    tenantId:scope.tenantId,
    userId:scope.userId,
    eventRunId:'',
    category:'communication',
    type:'email_draft_readiness',
    itemType:'email_draft_readiness',
    title:brief.single_purpose||'Conversation needs human judgment',
    status:readiness.status||candidate.status||'needs_context',
    summary:compactText(brief.single_purpose||'VAL prepared draft context, but a human judgment step remains.',500),
    whyUserIsSeeingThis:'VAL evaluated this conversation and found that your judgment is now the bottleneck.',
    whyNow:compactText(brief.why_now||'The conversation appears to be waiting on the user.',700),
    readinessJson:readiness,
    whatValPrepared:'VAL prepared draft readiness and brief context. No email draft was created externally.',
    whatUserNeedsToDo:readiness.status==='needs_context'?'Provide the missing context before VAL drafts.':'Confirm whether VAL should generate a review-only draft.',
    whatValDid:'Classified the conversation and prepared a draft brief.',
    whatOnlyUserCanDo:readiness.status==='needs_context'?'Supply the missing answer, timing, pricing, promise, or relationship judgment.':'Decide whether drafting is appropriate.',
    estimatedReviewMinutes:2,
    sourceRefsJson:safeArray(candidate.sourceRefs||candidate.source_refs).map(normalizeSourceRef).slice(0,8),
    confidence:Math.max(0,Math.min(1,Number(readiness.confidence||candidate.confidence||0.65))),
    requiresApproval:true,
    approvalPolicy:readiness.approval_policy||'approval_required',
    representationRisk:readiness.representation_risk||candidate.representationRisk||'medium',
    actionsJson:[],
    metadataJson:{source:'executive_inbox_draft_readiness',evaluationId:candidate.id||'',conversationId:candidate.conversationId||'',noExternalAction:true},
    decisionJson:{},
    createdAt:candidate.createdAt||new Date().toISOString(),
    updatedAt:new Date().toISOString(),
    reviewedAt:null,
    snoozedUntil:null
  };
  item.actionsJson=approvalActions(item);
  return item;
}
function internalDraftCandidate(draft,uuid,scope){
  const source=draft.sourceContext||{};
  const sourceName=source.source||draft.draftType||'internal_draft';
  const category=/transcript|meeting/i.test(sourceName)?'meeting':(/proposal|crm|invoice/i.test(sourceName)?'crm':'prepared_work');
  const id=stableItemId(uuid,scope.tenantId,scope.userId,sourceName,draft.id);
  const item={
    id,
    tenantId:scope.tenantId,
    userId:scope.userId,
    eventRunId:'',
    category,
    type:draft.draftType||'internal_draft',
    itemType:draft.draftType||'internal_draft',
    title:draft.subject||source.meetingTitle||'Prepared draft ready for review',
    status:draft.status==='needs_context'?'needs_context':'ready_for_review',
    summary:compactText(draft.body||'Prepared work is ready for review.',500),
    whyUserIsSeeingThis:'VAL prepared this work and it needs human judgment before anything external happens.',
    whyNow:source.whyNow||'The prepared item is ready enough that review is now the bottleneck.',
    readinessJson:{status:draft.status||'draft'},
    whatValPrepared:compactText(draft.body||'Prepared work is available.',1200),
    whatUserNeedsToDo:'Review, edit, approve, reject, or snooze this item.',
    whatValDid:'Prepared the work locally. No external action was taken.',
    whatOnlyUserCanDo:'Decide whether this represents you and should move forward.',
    estimatedReviewMinutes:estimateMinutes(draft.body,'medium'),
    sourceRefsJson:[normalizeSourceRef({sourceType:'draft',sourceId:draft.id,quoteOrSummary:draft.subject||draft.draftType||'',confidence:0.65})],
    confidence:0.65,
    requiresApproval:true,
    approvalPolicy:'approval_required',
    representationRisk:'medium',
    actionsJson:[],
    metadataJson:{
      source:sourceName,
      draftId:draft.id,
      noExternalAction:true,
      preparedArtifactKind:source.preparedArtifactKind||source.prepared_artifact_kind||source.preparedArtifact?.kind||source.prepared_artifact?.kind||'',
      preparedArtifact:source.preparedArtifact||source.prepared_artifact||{},
      canValAct:source.canValAct||source.can_val_act||'',
      executionPath:source.executionPath||source.execution_path||'',
      recipientEmail:source.recipientEmail||source.recipient_email||'',
      transcriptId:source.transcriptId||source.transcript_id||''
    },
    decisionJson:{},
    createdAt:draft.createdAt||new Date().toISOString(),
    updatedAt:new Date().toISOString(),
    reviewedAt:null,
    snoozedUntil:null
  };
  item.actionsJson=approvalActions(item);
  return item;
}
function meetingPrepCandidate(candidate,uuid,scope){
  const brief=candidate.brief||{};
  const handoff=candidate.handoff||brief.readyForYouHandoffJson||{};
  const title=candidate.title||brief.briefJson?.meeting_title||brief.meetingContextJson?.title||'Meeting prep ready';
  const id=stableItemId(uuid,scope.tenantId,scope.userId,'meeting_prep',candidate.calendarEventId||brief.calendarEventId||candidate.id);
  const item={
    id,
    tenantId:scope.tenantId,
    userId:scope.userId,
    eventRunId:'',
    category:'meeting',
    type:'meeting_prep_brief',
    itemType:'meeting_prep_brief',
    title,
    status:candidate.status||brief.status||'ready_for_review',
    summary:compactText(candidate.summary||brief.briefJson?.concise_brief||'',500),
    whyUserIsSeeingThis:handoff.why_user_is_seeing_this||'VAL prepared a meeting brief and your judgment is now the bottleneck.',
    whyNow:handoff.why_now||'This meeting is close enough or important enough to review before it starts.',
    readinessJson:{status:candidate.status||brief.status||'ready_for_review',quality_gate:brief.qualityGateJson||{},meeting_stakes:brief.meetingStakesJson||{}},
    whatValPrepared:compactText(brief.briefJson?.concise_brief||candidate.summary||'Meeting prep brief prepared.',1200),
    whatUserNeedsToDo:handoff.what_only_user_can_do||'Review how you want to enter the meeting and what matters most.',
    whatValDid:handoff.what_val_did||'Prepared meeting context, attendee intelligence, stakes, first five minutes, questions, and follow-up preparation. No calendar invite was sent.',
    whatOnlyUserCanDo:handoff.what_only_user_can_do||'Decide how you want to enter the meeting and what should be protected.',
    estimatedReviewMinutes:Number(handoff.estimated_review_minutes||3),
    sourceRefsJson:safeArray(candidate.sourceRefs||brief.sourceRefsJson).map(normalizeSourceRef).slice(0,8),
    confidence:Math.max(0,Math.min(1,Number(candidate.confidence||brief.confidence||0.65))),
    requiresApproval:true,
    approvalPolicy:handoff.approval_policy||'approval_required',
    representationRisk:handoff.representation_risk||'medium',
    actionsJson:[],
    metadataJson:{source:'meeting_prep',briefId:brief.id||candidate.id||'',calendarEventId:candidate.calendarEventId||brief.calendarEventId||'',noExternalAction:true,noCalendarInviteSent:true},
    decisionJson:{},
    createdAt:candidate.createdAt||brief.createdAt||new Date().toISOString(),
    updatedAt:new Date().toISOString(),
    reviewedAt:null,
    snoozedUntil:null
  };
  item.actionsJson=approvalActions(item);
  return item;
}
function preparedActionForCommitment(commitment={}){
  const text=[
    commitment.title,
    commitment.description,
    commitment.evidence_quote,
    commitment.evidence_summary,
    commitment.next_action,
    ...(safeArray(commitment.workingBrief?.contextLines))
  ].filter(Boolean).join(' ').toLowerCase();
  if(!text)return null;
  if(/\b(dashboard|html|iframe|landing page|web page|site|component|app|code|css|javascript|build|implement|scaffold)\b/.test(text))return 'build_artifact';
  if(/\b(proposal|scope of work|sow)\b/.test(text))return 'prepare_proposal';
  if(/\b(invoice|payment request)\b/.test(text))return 'prepare_invoice';
  if(/\b(agreement|contract)\b/.test(text))return 'create_draft';
  if(/\b(intro|introduction|introduce|connect)\b/.test(text))return 'draft_introduction';
  if(/\b(email|reply|message|nudge|follow up|follow-up|send)\b/.test(text)&&/\b(draft|write|send|prepare|nudge|follow up|follow-up|reply|email)\b/.test(text))return 'send_email';
  if(/\b(document|brief|overview|summary|handoff|agenda|plan|one[- ]pager|deck|copy)\b/.test(text)&&/\b(create|prepare|draft|write|finish|build|shape|handoff)\b/.test(text))return 'create_draft';
  return null;
}
function commitmentLinkage(commitment={}){
  const brief=commitment.workingBrief||commitment.working_brief||{};
  const envelope=brief.envelope||commitment.envelope||{};
  const projectName=brief.projectName
    || brief.project_name
    || commitment.projectName
    || commitment.project_name
    || envelope.projectName
    || envelope.project_name
    || (envelope.type==='project'?envelope.name:'')
    || '';
  const relationshipName=brief.relationshipName
    || brief.relationship_name
    || commitment.relationshipName
    || commitment.relationship_name
    || commitment.counterparty_name
    || envelope.relationshipName
    || envelope.relationship_name
    || (envelope.type==='relationship'?envelope.name:'')
    || '';
  return {
    linked_projects:projectName?[{id:String(projectName).toLowerCase().replace(/[^a-z0-9]+/g,'_'),name:projectName,source:'commitment_packet'}]:[],
    linked_people:relationshipName?[{name:relationshipName,email:commitment.counterparty_email||commitment.owner_email||'',contactId:commitment.counterparty_contact_id||commitment.owner_contact_id||commitment.crm_contact_id||''}]:[]
  };
}
function commitmentPreparedWorkCandidate(commitment={},uuid,scope){
  if(!commitment||['complete','dismissed','drafted'].includes(String(commitment.status||'').toLowerCase()))return null;
  if(commitment.draft_id||commitment.draftId||commitment.prepared_artifact_id||commitment.preparedArtifactId)return null;
  const action=preparedActionForCommitment(commitment);
  if(!action)return null;
  const brief=commitment.workingBrief||commitment.working_brief||{};
  const sourcePacket=commitment.sourcePacket||commitment.source_packet||{};
  const canonicalWorkItemId=commitment.canonical_work_item_id||commitment.canonicalWorkItemId||commitment.id;
  const sourceProcessingRecordId=commitment.source_processing_record_id||commitment.sourceProcessingRecordId||sourcePacket.source_processing_record_id||sourcePacket.sourceProcessingRecordId||'';
  const projectName=brief.projectName||brief.project_name||commitment.projectName||commitment.project_name||'';
  const relationshipName=brief.relationshipName||brief.relationship_name||commitment.relationshipName||commitment.relationship_name||'';
  const sourceRefs=safeArray(commitment.sourceRefs||commitment.source_refs||brief.sourceRefs).map(normalizeSourceRef).slice(0,8);
  const contextLines=safeArray(brief.contextLines||brief.context_lines).filter(Boolean);
  const rawText=[
    commitment.evidence_quote,
    commitment.evidence_summary,
    commitment.description,
    sourcePacket.context_excerpt||sourcePacket.contextExcerpt,
    ...contextLines
  ].filter(Boolean).join('\n');
  const record={
    id:commitment.source_id||commitment.id,
    transcriptId:commitment.source_type==='transcript'?commitment.source_id:'',
    title:commitment.source_title||commitment.title||'Commitment source',
    rawText,
    source:commitment.source_type||'commitment',
    createdAt:commitment.created_at||commitment.createdAt
  };
  const linkage=commitmentLinkage(commitment);
  const target=projectName||relationshipName||commitment.counterparty_name||commitment.owner_name||commitment.title||'this work';
  const instruction={
    instruction:compactText(rawText||commitment.title,900),
    instruction_type:'inferred_from_commitment_packet',
    requested_action:action,
    target_system:action==='build_artifact'?'val_workspace':(action==='send_email'||action==='draft_introduction'?'email':'val_workspace'),
    target_person_or_record:target,
    project_hint:projectName,
    external_action:action==='send_email',
    authorization:'approval_required',
    authenticated_user_spoke:false,
    speaker_confidence:0.62,
    ambiguity:[],
    conflicts:[],
    blocking_safety_rules:[],
    recommended_next_step:'prepare_only',
    source_refs:sourceRefs.length?sourceRefs:[normalizeSourceRef({sourceType:commitment.source_type||'commitment',sourceId:commitment.source_id||commitment.id,quoteOrSummary:commitment.evidence_quote||commitment.title,confidence:commitment.confidence_score||0.68})],
    confidence:Math.min(0.84,Number(commitment.confidence_score||commitment.confidence||0.68)),
    authorization_source:'commitment_packet',
    authorization_event_id:commitment.id,
    authorization_quote:commitment.evidence_quote||commitment.title,
    authenticated_user_confirmed:false,
    authorization_created_at:commitment.created_at||commitment.createdAt||new Date().toISOString()
  };
  const kind=preparedWorkType(instruction);
  const admission=assessPreparedWork({kind,instruction,record,linkage,sourceRefs});
  if(!admission.admitted){
    return preparedWorkTaskFromReadyItem({
      id:stableItemId(uuid,scope.tenantId,scope.userId,'commitment_needs_information',commitment.id),
      tenantId:scope.tenantId,
      userId:scope.userId,
      eventRunId:'',
      category:'task',
      type:'prepared_work_needs_information',
      itemType:'prepared_work_needs_information',
      title:commitment.title||`Finish ${kind.replace(/_/g,' ')}`,
      status:'needs_context',
      summary:commitment.evidence_summary||commitment.description||commitment.title,
      sourceRefsJson:sourceRefs,
      confidence:Number(commitment.confidence_score||commitment.confidence||0.68),
      requiresApproval:true,
      approvalPolicy:'approval_required',
      representationRisk:/proposal|email|introduction/.test(kind)?'high':'medium',
      actionsJson:[],
      metadataJson:{
        source:'commitment_packet',
        commitmentId:commitment.id,
        canonicalWorkItemId,
        sourceProcessingRecordId,
        sourceType:commitment.source_type,
        sourceId:commitment.source_id,
        noExternalAction:true,
        preparedArtifactKind:kind,
        preparedArtifact:{kind,instruction:instruction.instruction},
        workingBrief:brief,
        sourcePacket,
        projectName,
        relationshipName
      },
      decisionJson:{},
      createdAt:commitment.updated_at||commitment.updatedAt||commitment.created_at||commitment.createdAt||new Date().toISOString(),
      updatedAt:new Date().toISOString(),
      reviewedAt:null,
      snoozedUntil:null
    },admission);
  }
  const artifact=preparedArtifactForInstruction(instruction,record,linkage,sourceRefs);
  if(!artifact)return null;
  artifact.source='commitment_packet';
  artifact.source_packet={
    ...sourcePacket,
    commitment_id:commitment.id,
    canonical_work_item_id:canonicalWorkItemId,
    source_processing_record_id:sourceProcessingRecordId,
    source_type:commitment.source_type,
    source_id:commitment.source_id,
    source_quote:commitment.evidence_quote,
    working_brief:brief
  };
  artifact.linked_context={...(artifact.linked_context||{}),task:{id:commitment.id,title:commitment.title,source:'commitment_ledger'},source_packet:artifact.source_packet};
  const id=stableItemId(uuid,scope.tenantId,scope.userId,'commitment_prepared',`${commitment.id}_${artifact.kind}`);
  const item={
    id,
    tenantId:scope.tenantId,
    userId:scope.userId,
    eventRunId:'',
    category:'prepared_work',
    type:artifact.kind,
    itemType:artifact.kind,
    title:artifact.title||commitment.title||'Prepared work ready for review',
    status:'ready_for_review',
    summary:compactText(`VAL prepared ${artifact.kind.replace(/_/g,' ')} from the commitment packet instead of making you restate the source.`,500),
    whyUserIsSeeingThis:'The task already contained enough source context for VAL to prepare something reviewable.',
    whyNow:'The work is already on the executive desk, so the draft should arrive with the decision.',
    readinessJson:{status:artifact.remaining_context_needed?.length?'needs_context':'ready_for_review',prepared_artifact_kind:artifact.kind,remaining_context_needed:artifact.remaining_context_needed||[],commitment_id:commitment.id},
    whatValPrepared:compactText(artifact.html||artifact.body||artifact.instruction||commitment.evidence_quote||commitment.title,1200),
    whatUserNeedsToDo:artifact.remaining_context_needed?.length
      ? `Review what VAL prepared and fill the missing pieces: ${artifact.remaining_context_needed.join('; ')}`
      : 'Review the prepared work, edit if needed, and approve any external step separately.',
    whatValDid:`Turned the commitment packet into a reviewable ${artifact.kind.replace(/_/g,' ')}. Nothing was sent, scheduled, published, or written externally.`,
    whatOnlyUserCanDo:'Decide whether this represents you and whether it should move forward.',
    estimatedReviewMinutes:artifact.kind==='html_page_draft'?6:3,
    sourceRefsJson:sourceRefs.length?sourceRefs:[normalizeSourceRef({sourceType:'commitment',sourceId:commitment.id,quoteOrSummary:commitment.evidence_quote||commitment.title,confidence:commitment.confidence_score||0.68})],
    confidence:Math.max(0,Math.min(1,Number(commitment.confidence_score||commitment.confidence||0.68))),
    requiresApproval:true,
    approvalPolicy:'approval_required',
    representationRisk:/proposal|email|introduction/.test(artifact.kind)?'high':'medium',
    actionsJson:[],
    metadataJson:{
      source:'commitment_packet',
      commitmentId:commitment.id,
      canonicalWorkItemId,
      sourceProcessingRecordId,
      sourceType:commitment.source_type,
      sourceId:commitment.source_id,
      noExternalAction:true,
      preparedArtifactKind:artifact.kind,
      preparedArtifact:artifact,
      workingBrief:brief,
      sourcePacket:artifact.source_packet,
      projectName,
      relationshipName
    },
    decisionJson:{},
    createdAt:commitment.updated_at||commitment.updatedAt||commitment.created_at||commitment.createdAt||new Date().toISOString(),
    updatedAt:new Date().toISOString(),
    reviewedAt:null,
    snoozedUntil:null
  };
  item.actionsJson=approvalActions(item);
  return item;
}
function transcriptCandidate(candidate,uuid,scope){
  const handoff=candidate.handoff||{};
  const run=candidate.run||{};
  const artifact=handoff.prepared_artifact||handoff.preparedArtifact||null;
  const artifactKind=artifact?.kind||'';
  const linkedContext=handoff.linked_context||artifact?.linked_context||{};
  const remainingContext=safeArray(handoff.remaining_context_needed||artifact?.remaining_context_needed);
  const completedByVal=safeArray(handoff.completed_by_val||artifact?.completed_by_val);
  const id=stableItemId(uuid,scope.tenantId,scope.userId,'transcript_intelligence',`${candidate.transcriptId||run.transcriptId||''}_${candidate.id||handoff.id||candidate.title}`);
  const item={
    id,
    tenantId:scope.tenantId,
    userId:scope.userId,
    eventRunId:'',
    category:handoff.category||'transcript_follow_up',
    type:handoff.type||artifactKind||'transcript_follow_up_bundle',
    itemType:handoff.type||artifactKind||'transcript_follow_up_bundle',
    title:candidate.title||handoff.title||'Transcript follow-up ready for review',
    status:candidate.status||'ready_for_review',
    summary:compactText(candidate.summary||handoff.summary||'',500),
    whyUserIsSeeingThis:handoff.why_user_is_seeing_this||'VAL found transcript follow-up intelligence that needs human judgment.',
    whyNow:handoff.why_now||'Transcript follow-ups are easiest to clarify while the conversation is fresh.',
    readinessJson:{status:remainingContext.length?'needs_context':'ready_for_review',transcript_id:candidate.transcriptId||run.transcriptId||'',no_action_needed:run.noActionNeededJson||{},prepared_artifact_kind:artifactKind,prepared_artifact_destination:artifact?.destination||'',execution_level:handoff.execution_level||artifact?.execution_level||'',completion_status:handoff.completion_status||artifact?.completion_status||'',remaining_context_needed:remainingContext},
    whatValPrepared:handoff.what_val_did||'VAL extracted commitments, task context, relationship/project signals, and source quotes. No action was taken.',
    whatUserNeedsToDo:handoff.what_only_user_can_do||'Confirm what should become action, memory, or follow-up.',
    whatValDid:handoff.what_val_did||'Prepared transcript intelligence candidates only.',
    whatOnlyUserCanDo:handoff.what_only_user_can_do||'Confirm the human meaning before VAL commits anything.',
    estimatedReviewMinutes:Number(handoff.estimated_review_minutes||3),
    sourceRefsJson:safeArray(candidate.sourceRefs||handoff.source_refs||run.evidenceRefsJson).map(normalizeSourceRef).slice(0,8),
    confidence:Math.max(0,Math.min(1,Number(candidate.confidence||handoff.confidence||run.confidence||0.65))),
    requiresApproval:true,
    approvalPolicy:handoff.approval_policy||'approval_required',
    representationRisk:handoff.representation_risk||'medium',
    actionsJson:[],
    metadataJson:{
      source:'transcript_intelligence',
      runId:run.id||'',
      transcriptId:candidate.transcriptId||run.transcriptId||'',
      noExternalAction:true,
      noMemoryCommitted:true,
      noTaskCreated:!(handoff.continuation_task||artifact?.continuation_task),
      taskContinuationCreated:!!(handoff.continuation_task||artifact?.continuation_task),
      noCrmMutation:true,
      preparedArtifact:artifact,
      preparedArtifactKind:artifactKind,
      noExternalSend:artifact?.externalSend===false,
      noExternalPublish:artifact?.externalPublish===false,
      noExternalCalendarWrite:artifact?.externalCalendarWrite===false,
      relationshipMatchRequired:!!artifact?.relationship_match_required,
      executionLevel:handoff.execution_level||artifact?.execution_level||'',
      executionLevelLabel:handoff.execution_level_label||artifact?.execution_level_label||'',
      completionStatus:handoff.completion_status||artifact?.completion_status||'ready_for_review',
      completedByVal,
      remainingContextNeeded:remainingContext,
      linkedContext,
      continuationTask:handoff.continuation_task||artifact?.continuation_task||null,
      projectId:linkedContext.project?.id||'',
      projectName:linkedContext.project?.name||'',
      preparedWorkCount:artifactKind?1:0
    },
    decisionJson:{},
    createdAt:candidate.createdAt||run.createdAt||new Date().toISOString(),
    updatedAt:new Date().toISOString(),
    reviewedAt:null,
    snoozedUntil:null
  };
  item.actionsJson=approvalActions(item);
  return item;
}

function createValReadyForYouService({
  dbQuery,
  hasPg=()=>false,
  getStore=()=>({}),
  saveStore=()=>{},
  uuid=(prefix)=>`${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`,
  tenantId=()=>'default',
  userId=()=>'default',
  executiveInboxService=null,
  meetingPrepService=null,
  transcriptIntelligenceService=null,
  commitmentsService=null,
  canonicalWorkService=null,
  generatePreparedArtifact=null,
  afterPreparedItem=null,
  afterDraftEdit=null,
  afterDecision=null,
  listDrafts=null,
  loadTasks=null,
  saveTask=null,
  logger=console
}={}){
  function scope(){ return {tenantId:tenantId(),userId:userId()}; }
  function store(){
    const s=getStore()||{};
    if(!Array.isArray(s.readyForYouItems))s.readyForYouItems=[];
    return s;
  }
  async function persistAdmissionTask(item={},unknowns=[]){
    if(
      item.type!=='prepared_work_needs_information'
      || typeof saveTask!=='function'
      || item.metadataJson?.commitmentId
      || item.metadataJson?.taskContinuationCreated
    )return;
    const missing=safeArray(item.metadataJson?.missingInformation);
    await saveTask({
      id:`task_${item.id}`,
      title:item.title,
      contactName:item.metadataJson?.workBrief?.recipientName||'',
      dueDate:null,
      notes:[
        item.summary,
        missing.length?`Context needed before VAL can prepare this:\n- ${missing.join('\n- ')}`:'',
        'The full source packet remains attached in Ready For You. No draft or external action was created.'
      ].filter(Boolean).join('\n\n'),
      details:[{text:`Reclassified from incomplete prepared work: ${item.metadataJson?.originalPreparedArtifactKind||'unknown'}`,ts:new Date().toISOString()}],
      completed:false,
      createdAt:item.createdAt||new Date().toISOString(),
      source:'prepared_work_admission',
      sourceId:item.metadataJson?.sourceId||item.metadataJson?.draftId||'',
      workBrief:item.metadataJson?.workBrief||{},
      noExternalAction:true
    }).catch(error=>unknowns.push({source:'prepared_work_task_persistence',reason:error.message}));
  }
  async function pgUpsert(item){
    const columns=['id','tenantId','userId','eventRunId','category','status','title','itemType','summary','whyUserIsSeeingThis','whyNow','readinessJson','whatValPrepared','whatUserNeedsToDo','whatValDid','whatOnlyUserCanDo','estimatedReviewMinutes','sourceRefsJson','confidence','requiresApproval','approvalPolicy','representationRisk','actionsJson','metadataJson','decisionJson','createdAt','updatedAt','reviewedAt','snoozedUntil'];
    const jsonColumns=new Set(['readinessJson','sourceRefsJson','actionsJson','metadataJson','decisionJson']);
    const values=columns.map(c=>{
      const value=item[c];
      if(!jsonColumns.has(c))return value;
      if(value==null)return JSON.stringify(c==='sourceRefsJson'||c==='actionsJson'?[]:{});
      if(typeof value==='string'){
        try{return JSON.stringify(JSON.parse(value));}
        catch(_){return JSON.stringify(c==='sourceRefsJson'||c==='actionsJson'?[]:{});}
      }
      return JSON.stringify(value);
    });
    const names=columns.map(toSnake);
    const params=columns.map((_,i)=>`$${i+1}`).join(',');
    const updates=names.filter(n=>!['id','tenant_id','user_id','created_at'].includes(n)).map(n=>`${n}=excluded.${n}`).join(',');
    const r=await dbQuery(`insert into ready_for_you_items (${names.join(',')}) values (${params}) on conflict (id) do update set ${updates} returning *`,values);
    return parseReadyRow(r.rows?.[0]||item);
  }
  async function saveItem(item){
    let saved;
    if(hasPg())saved=await pgUpsert(item);
    else{
      const s=store();
      const idx=s.readyForYouItems.findIndex(r=>r.id===item.id&&r.tenantId===item.tenantId&&r.userId===item.userId);
      if(idx>=0)s.readyForYouItems[idx]={...s.readyForYouItems[idx],...item,createdAt:s.readyForYouItems[idx].createdAt||item.createdAt,updatedAt:new Date().toISOString()};
      else s.readyForYouItems.unshift(item);
      saveStore(s);
      saved=idx>=0?s.readyForYouItems[idx]:item;
    }
    const canonicalWorkItemId=saved.metadataJson?.canonicalWorkItemId;
    if(
      canonicalWorkItemId
      && canonicalWorkService?.attachPreparedArtifact
      && readyItemHasConcretePreparedWork(saved)
    ){
      await canonicalWorkService.attachPreparedArtifact(canonicalWorkItemId,{
        artifactId:saved.id,
        sourceRefs:saved.sourceRefsJson,
        metadata:{
          latestPreparedArtifactKind:readyItemPreparedArtifactKind(saved),
          latestPreparedArtifactStatus:saved.status
        }
      });
    }
    if(
      typeof afterPreparedItem==='function'
      && saved.metadataJson?.generatedFromCanonicalPacket
      && readyItemHasConcretePreparedWork(saved)
      && saved.metadataJson?.preparedBoardSourceVersionKey!==(saved.metadataJson?.preparedSourceVersionKey||preparedSourceVersionKey(saved))
    ){
      const boardReceipt=await afterPreparedItem(saved);
      if(boardReceipt){
        const preparedBoardSourceVersionKey=saved.metadataJson?.preparedSourceVersionKey||preparedSourceVersionKey(saved);
        saved={
          ...saved,
          metadataJson:{
            ...saved.metadataJson,
            preparedBoardSourceVersionKey,
            preparedBoardReceiptId:boardReceipt.sourceProcessingRecord?.id||boardReceipt.id||''
          }
        };
        if(hasPg())saved=await pgUpsert(saved);
        else{
          const s=store();
          const idx=s.readyForYouItems.findIndex(row=>row.id===saved.id&&row.tenantId===saved.tenantId&&row.userId===saved.userId);
          if(idx>=0)s.readyForYouItems[idx]=saved;
          saveStore(s);
        }
      }
    }
    return saved;
  }
  async function storedItem(id){
    if(!id)return null;
    if(hasPg()){
      const result=await dbQuery(
        `select * from ready_for_you_items where id=$1 and tenant_id=$2 and user_id=$3 limit 1`,
        [id,tenantId(),userId()]
      );
      return result.rows?.[0]?parseReadyRow(result.rows[0]):null;
    }
    return store().readyForYouItems.find(item=>item.id===id&&item.tenantId===tenantId()&&item.userId===userId())||null;
  }
  async function reusableCanonicalCandidate(candidate={}){
    if(!candidate?.id)return null;
    const existing=await storedItem(candidate.id);
    const sourceVersionKey=preparedSourceVersionKey(candidate);
    if(
      existing?.metadataJson?.generatedFromCanonicalPacket
      && existing.metadataJson.preparedSourceVersionKey===sourceVersionKey
      && readyItemHasConcretePreparedWork(existing)
    )return existing;
    return null;
  }
  async function materializeCanonicalCandidate(candidate={},workItem={},options={}){
    if(!candidate||candidate.type==='prepared_work_needs_information'||typeof generatePreparedArtifact!=='function')return candidate;
    const metadata=candidate.metadataJson||{};
    const artifact=metadata.preparedArtifact||{};
    if(!artifact.kind)return candidate;
    const sourceVersionKey=preparedSourceVersionKey(candidate);
    const existing=options.existing||await reusableCanonicalCandidate(candidate);
    if(existing)return existing;
    const generated=await generatePreparedArtifact({artifact,workItem});
    if(!generated?.ok){
      return preparedWorkTaskFromReadyItem(candidate,{
        admitted:false,
        missingInformation:safeArray(generated?.missingInformation),
        brief:{
          ...(metadata.workBrief||workItem.workingBrief||{}),
          workType:artifact.kind,
          missingInformation:safeArray(generated?.missingInformation)
        }
      });
    }
    const next={
      ...candidate,
      title:generated.artifact.title||candidate.title,
      summary:compactText(generated.artifact.body||generated.artifact.html||candidate.summary,500),
      whatValPrepared:compactText(generated.artifact.body||generated.artifact.html,1200),
      readinessJson:{...(candidate.readinessJson||{}),status:'ready_for_review',prepared_artifact_kind:generated.artifact.kind},
      metadataJson:{
        ...metadata,
        preparedArtifact:generated.artifact,
        preparedArtifactKind:generated.artifact.kind,
        preparedWorkAdmission:'admitted',
        generatedFromCanonicalPacket:true,
        preparedSourceVersionKey:sourceVersionKey
      }
    };
    return enforcePreparedWorkAdmission(next);
  }
  async function updatePreparedArtifact(id,changes={}){
    const existing=await storedItem(id);
    if(!existing)return null;
    const metadata=existing.metadataJson||{};
    const artifact=metadata.preparedArtifact||{};
    if(!readyItemHasConcretePreparedWork(existing)||!artifact.kind)return null;
    const before={...artifact};
    const kind=String(artifact.kind||metadata.preparedArtifactKind||'prepared_work');
    const usesHtml=kind==='html_page_draft';
    const content=String(
      usesHtml
        ? (changes.html??changes.body??artifact.html??artifact.body??'')
        : (changes.body??changes.content??artifact.body??artifact.content??'')
    ).trim();
    if(!content)return existing;
    const nextArtifact={
      ...artifact,
      ...(changes.title?{title:String(changes.title).trim()}:{ }),
      ...(changes.subject?{subject:String(changes.subject).trim()}:{ }),
      ...(usesHtml?{html:content}:{body:content}),
      userEdited:true,
      editedAt:new Date().toISOString()
    };
    const saved=await saveItem({
      ...existing,
      title:nextArtifact.title||existing.title,
      summary:compactText(content,500),
      whatValPrepared:compactText(content,1200),
      metadataJson:{
        ...metadata,
        preparedArtifact:nextArtifact,
        preparedArtifactKind:kind,
        userEdited:true,
        editedAt:nextArtifact.editedAt
      },
      updatedAt:nextArtifact.editedAt
    });
    if(typeof afterDraftEdit==='function'){
      await afterDraftEdit({item:saved,beforeArtifact:before,afterArtifact:nextArtifact});
    }
    return saved;
  }
  async function prepareCanonicalWorkItem(workItemId){
    if(!canonicalWorkService?.taskProjection)return {ok:false,error:'Canonical work is unavailable.'};
    const result=await canonicalWorkService.taskProjection({limit:500});
    const workItem=safeArray(result.tasks).find(item=>String(item.id)===String(workItemId));
    if(!workItem)return {ok:false,error:'Canonical work item is not open or was not found.'};
    const candidate=commitmentPreparedWorkCandidate(workItem,uuid,scope());
    if(!candidate)return {ok:true,prepared:false,reason:'This work does not call for a draftable artifact.'};
    const materialized=await materializeCanonicalCandidate(candidate,workItem);
    const saved=await saveItem(materialized);
    await persistAdmissionTask(saved,[]);
    return {ok:true,prepared:readyItemHasConcretePreparedWork(saved),item:saved};
  }
  async function listItems({limit=3,status='',includeSnoozed=false}={}){
    const lim=Math.max(1,Math.min(Number(limit)||3,25));
    const activeStatuses=status?[status]:['ready','ready_for_review','needs_context'];
    let rows=[];
    if(hasPg()){
      const params=[tenantId(),userId(),activeStatuses];
      let where='tenant_id=$1 and user_id=$2 and status = any($3)';
      if(!includeSnoozed) where+=' and (snoozed_until is null or snoozed_until <= now())';
      const r=await dbQuery(`select * from ready_for_you_items where ${where} order by requires_approval desc, confidence desc, created_at desc limit 500`,params);
      rows=(r.rows||[]).map(parseReadyRow);
    }else{
      const now=Date.now();
      rows=store().readyForYouItems
        .filter(r=>r.tenantId===tenantId()&&r.userId===userId())
        .filter(r=>activeStatuses.includes(r.status))
        .filter(r=>includeSnoozed||!r.snoozedUntil||Date.parse(r.snoozedUntil)<=now)
        .sort((a,b)=>(Number(b.requiresApproval)-Number(a.requiresApproval))||(Number(b.confidence||0)-Number(a.confidence||0))||String(b.createdAt||'').localeCompare(String(a.createdAt||'')));
    }
    const sanitized=[];
    for(const row of rows){
      const admitted=enforcePreparedWorkAdmission(row);
      if(admitted.type==='prepared_work_needs_information'){
        await saveItem(admitted);
        await persistAdmissionTask(admitted);
      }
      sanitized.push(admitted);
    }
    const preparedItems=dedupePreparedWork(sanitized.filter(readyItemHasConcretePreparedWork)).slice(0,lim);
    return {
      ok:true,
      state:preparedItems.length?'has_items':'caught_up',
      message:preparedItems.length?'Prepared work is ready.':"I'm caught up.",
      items:sanitized.slice(0,lim),
      preparedItems,
      prepared_items:preparedItems,
      visibleLimit:lim,
      preparedCount:preparedItems.length
    };
  }
  async function listItemsWithReceipts({limit=3,status='',includeSnoozed=false,receiptService=null}={}){
    const result=await listItems({limit,status,includeSnoozed});
    const items=[];
    for(const item of safeArray(result.items)){
      const decision=jsonValue(item.decisionJson||item.decision_json,{});
      const metadata=jsonValue(item.metadataJson||item.metadata_json,{});
      const receiptId=item.executionReceiptId||decision.executionReceiptId||metadata.executionReceiptId||'';
      let receipt=null;
      if(receiptService&&receiptId){
        receipt=await receiptService.getReceipt(receiptId).catch(()=>null);
      }
      items.push({
        ...item,
        execution:receiptForReadyItem(item,receipt)
      });
    }
    return {...result,items,receiptAware:true,preparedCount:preparedWorkCount(items)};
  }
  async function collectCandidates({materializeLimit=2}={}){
    const sc=scope();
    const candidates=[];
    const unknowns=[];
    const generationLimit=Math.max(0,Math.min(Number(materializeLimit)||0,5));
    let materializedCount=0;
    let generationBacklog=0;
    try{
      if(executiveInboxService?.reviewDrafts){
        const result=await executiveInboxService.reviewDrafts({limit:10,status:''});
        for(const draft of safeArray(result.drafts).filter(d=>['ready_for_review','needs_context','draft'].includes(d.status||'draft'))){
          candidates.push(draftToCandidate(draft,uuid,sc));
        }
      }else unknowns.push({source:'executive_inbox_review_only_drafts',reason:'Executive Inbox draft service is unavailable.'});
    }catch(e){unknowns.push({source:'executive_inbox_review_only_drafts',reason:e.message});}
    try{
      if(executiveInboxService?.listReadyForYouDraftCandidates){
        const rows=await executiveInboxService.listReadyForYouDraftCandidates({limit:10});
        for(const row of safeArray(rows)){
          const item=draftEvaluationToCandidate(row,uuid,sc);
          if(item)candidates.push(item);
        }
      }else unknowns.push({source:'draft_qa_results',reason:'Draft QA candidate service is unavailable.'});
    }catch(e){unknowns.push({source:'draft_qa_results',reason:e.message});}
    try{
      if(meetingPrepService?.listReadyForYouCandidates){
        const rows=await meetingPrepService.listReadyForYouCandidates({limit:10});
        for(const row of safeArray(rows)){
          if(row.handoff?.ready_for_you_candidate!==false)candidates.push(meetingPrepCandidate(row,uuid,sc));
        }
      }else unknowns.push({source:'meeting_prep_candidates',reason:'Meeting prep candidate builder is unavailable.'});
    }catch(e){unknowns.push({source:'meeting_prep_candidates',reason:e.message});}
    try{
      if(transcriptIntelligenceService?.listReadyForYouCandidates){
        const rows=await transcriptIntelligenceService.listReadyForYouCandidates({limit:10});
        for(const row of safeArray(rows))candidates.push(transcriptCandidate(row,uuid,sc));
      }else unknowns.push({source:'transcript_follow_up_candidates',reason:'Transcript intelligence candidate builder is unavailable.'});
    }catch(e){unknowns.push({source:'transcript_follow_up_candidates',reason:e.message});}
    try{
      if(canonicalWorkService?.taskProjection){
        const result=await canonicalWorkService.taskProjection({limit:120});
        for(const commitment of safeArray(result.tasks)){
          const item=commitmentPreparedWorkCandidate(commitment,uuid,sc);
          if(!item)continue;
          if(item.type==='prepared_work_needs_information'||typeof generatePreparedArtifact!=='function'){
            candidates.push(item);
            continue;
          }
          const existing=await reusableCanonicalCandidate(item);
          if(existing){
            candidates.push(existing);
            continue;
          }
          if(materializedCount<generationLimit){
            candidates.push(await materializeCanonicalCandidate(item,commitment));
            materializedCount+=1;
          }else{
            generationBacklog+=1;
          }
        }
      }else if(commitmentsService?.list){
        const result=await commitmentsService.list({limit:60,ownerType:'user'});
        for(const commitment of safeArray(result.commitments)){
          const item=commitmentPreparedWorkCandidate(commitment,uuid,sc);
          if(item)candidates.push(item);
        }
        unknowns.push({source:'canonical_work_prepared_candidates',reason:'Canonical work projection was unavailable; legacy commitments were used as a compatibility fallback.'});
      }else unknowns.push({source:'canonical_work_prepared_candidates',reason:'Canonical work service is unavailable.'});
    }catch(e){unknowns.push({source:'canonical_work_prepared_candidates',reason:e.message});}
    try{
      const drafts=typeof listDrafts==='function'?await listDrafts(''):safeArray(getStore().drafts);
      for(const draft of safeArray(drafts)){
        const src=String(draft.sourceContext?.source||draft.draftType||'');
        if(src==='executive_inbox_review_only')continue;
        if(!['draft','ready_for_review','needs_context'].includes(draft.status||'draft'))continue;
        if(/meeting|transcript|recap|proposal|crm|invoice|task/i.test(`${src} ${draft.draftType||''}`)){
          candidates.push(internalDraftCandidate(draft,uuid,sc));
        }
      }
    }catch(e){unknowns.push({source:'prepared_internal_drafts',reason:e.message});}
    try{
      if(typeof loadTasks==='function'){
        const tasks=await loadTasks();
        for(const task of safeArray(tasks).filter(t=>!t.completed&&!t.done&&t.contextCandidate).slice(0,5)){
          candidates.push({
            id:stableItemId(uuid,sc.tenantId,sc.userId,'task_context',task.id||task.title),
            tenantId:sc.tenantId,userId:sc.userId,eventRunId:'',category:'task',type:'task_context',itemType:'task_context',title:task.title||task.taskTitle||'Task needs context',status:'needs_context',
            summary:compactText(task.context||task.notes||'',500),whyUserIsSeeingThis:'This task appears to need human context before VAL can move it forward.',whyNow:'The task is open and context is the bottleneck.',
            readinessJson:{status:'needs_context'},whatValPrepared:'VAL identified the task as context-dependent.',whatUserNeedsToDo:'Add the missing context or reject the candidate.',whatValDid:'Flagged a context-dependent task.',whatOnlyUserCanDo:'Clarify intent, priority, or relationship context.',estimatedReviewMinutes:2,sourceRefsJson:[normalizeSourceRef({sourceType:'task',sourceId:task.id||'',quoteOrSummary:task.title||task.taskTitle||'',confidence:0.55})],confidence:0.55,requiresApproval:true,approvalPolicy:'approval_required',representationRisk:'low',actionsJson:approvalActions({}),metadataJson:{source:'task_context',taskId:task.id||'',noExternalAction:true},decisionJson:{},createdAt:task.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString(),reviewedAt:null,snoozedUntil:null
          });
        }
      }else unknowns.push({source:'task_context_candidates',reason:'Task context loader is unavailable.'});
    }catch(e){unknowns.push({source:'task_context_candidates',reason:e.message});}
    for(const source of ['crm_proposal_candidates']){
      if(!candidates.some(c=>String(c.metadataJson?.source||'').includes(source.replace('_candidates','')))){
        unknowns.push({source,reason:'Dedicated candidate builder is not implemented yet.'});
      }
    }
    const byId=new Map();
    for(const item of candidates){
      if(!item||!item.id)continue;
      const admitted=enforcePreparedWorkAdmission(item);
      await persistAdmissionTask(admitted,unknowns);
      if(!byId.has(admitted.id))byId.set(admitted.id,admitted);
    }
    return {candidates:[...byId.values()],unknowns,materializedCount,generationBacklog};
  }
  async function buildQueue({limit=20,materializeLimit=2}={}){
    const {candidates,unknowns,materializedCount,generationBacklog}=await collectCandidates({materializeLimit});
    const cappedLimit=Math.max(1,Math.min(Number(limit)||20,25));
    const actionable=candidates
      .filter(item=>item.requiresApproval||['ready_for_review','needs_context','ready'].includes(item.status))
      .sort((a,b)=>(Number(b.requiresApproval)-Number(a.requiresApproval))||(Number(b.confidence||0)-Number(a.confidence||0))||String(b.createdAt||'').localeCompare(String(a.createdAt||'')))
      .slice(0,cappedLimit);
    const saved=[];
    for(const item of actionable) saved.push(await saveItem(item));
    const preparedItems=dedupePreparedWork(saved.filter(readyItemHasConcretePreparedWork));
    return {
      ok:true,
      state:saved.length?'has_items':'caught_up',
      message:saved.length?'Ready for review.':"I'm caught up.",
      items:saved.slice(0,3),
      allBuilt:saved,
      preparedItems,
      prepared_items:preparedItems,
      preparedCount:preparedItems.length,
      generation:{materializedCount,generationBacklog,complete:generationBacklog===0},
      unknowns,
      caughtUp:saved.length===0
    };
  }
  async function updateState(id,{status,decision={},snoozedUntil=null}={}){
    const reviewedAt=new Date().toISOString();
    let saved=null;
    if(hasPg()){
      const r=await dbQuery(`update ready_for_you_items set status=$1,decision_json=$2,reviewed_at=$3,snoozed_until=$4,updated_at=now() where id=$5 and tenant_id=$6 and user_id=$7 returning *`,[status,JSON.stringify({...decision,status,recorded_at:reviewedAt}),reviewedAt,snoozedUntil,id,tenantId(),userId()]);
      saved=r.rows?.[0]?parseReadyRow(r.rows[0]):null;
    }else{
      const s=store();
      const row=s.readyForYouItems.find(r=>r.id===id&&r.tenantId===tenantId()&&r.userId===userId());
      if(!row)return null;
      Object.assign(row,{status,decisionJson:{...decision,status,recorded_at:reviewedAt},reviewedAt,snoozedUntil,updatedAt:reviewedAt});
      saveStore(s);
      saved=row;
    }
    if(saved&&typeof afterDecision==='function'){
      await afterDecision({
        item:saved,
        status,
        decision:saved.decisionJson||saved.decision_json||{...decision,status,recorded_at:reviewedAt},
        reviewedAt,
        snoozedUntil
      });
    }
    return saved;
  }
  return {
    listItems,
    listItemsWithReceipts,
    buildQueue,
    saveItem,
    getItem:storedItem,
    updatePreparedArtifact,
    approve:(id,decision={})=>updateState(id,{status:'approved',decision:{...decision,external_action:false}}),
    reject:(id,decision={})=>updateState(id,{status:'rejected',decision:{...decision,external_action:false}}),
    snooze:(id,{until='',minutes=60,reason=''}={})=>{
      const target=until||new Date(Date.now()+Math.max(1,Number(minutes)||60)*60000).toISOString();
      return updateState(id,{status:'snoozed',decision:{reason,external_action:false},snoozedUntil:target});
    },
    collectCandidates,
    prepareCanonicalWorkItem
  };
}

module.exports={createValReadyForYouService,draftToCandidate,draftEvaluationToCandidate,internalDraftCandidate,meetingPrepCandidate,transcriptCandidate,parseReadyRow,preparedWorkCount,readyItemHasConcretePreparedWork};
