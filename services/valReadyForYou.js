function safeArray(value){ return Array.isArray(value)?value:[]; }
const {receiptForReadyItem}=require('./valExecutionVisibility');

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
function preparedWorkCount(rows=[]){
  return safeArray(rows).filter(row=>['ready','ready_for_review','needs_context'].includes(row.status||'ready_for_review')).length;
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
    sourceRefsJson:[normalizeSourceRef({sourceType:'draft',sourceId:draft.id,quoteOrSummary:title,confidence:writer.confidence||0.75})],
    confidence:Math.max(0,Math.min(1,Number(writer.confidence||qa.confidence||0.72))),
    requiresApproval:true,
    approvalPolicy,
    representationRisk,
    actionsJson:[],
    metadataJson:{source:'executive_inbox_review_only',draftId:draft.id,conversationId:source.conversationId||'',threadId:source.threadId||'',writingRules:source.writingRules||source.writing_rules||'',noExternalAction:true,noProviderDraftCreated:true},
    decisionJson:{},
    createdAt:draft.createdAt||new Date().toISOString(),
    updatedAt:new Date().toISOString(),
    reviewedAt:null,
    snoozedUntil:null
  };
  item.actionsJson=approvalActions(item);
  return item;
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
function transcriptCandidate(candidate,uuid,scope){
  const handoff=candidate.handoff||{};
  const run=candidate.run||{};
  const artifact=handoff.prepared_artifact||handoff.preparedArtifact||null;
  const artifactKind=artifact?.kind||handoff.type||'';
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
      preparedWorkCount:1
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
  listDrafts=null,
  loadTasks=null,
  logger=console
}={}){
  function scope(){ return {tenantId:tenantId(),userId:userId()}; }
  function store(){
    const s=getStore()||{};
    if(!Array.isArray(s.readyForYouItems))s.readyForYouItems=[];
    return s;
  }
  async function pgUpsert(item){
    const columns=['id','tenantId','userId','eventRunId','category','status','title','itemType','summary','whyUserIsSeeingThis','whyNow','readinessJson','whatValPrepared','whatUserNeedsToDo','whatValDid','whatOnlyUserCanDo','estimatedReviewMinutes','sourceRefsJson','confidence','requiresApproval','approvalPolicy','representationRisk','actionsJson','metadataJson','decisionJson','createdAt','updatedAt','reviewedAt','snoozedUntil'];
    const values=columns.map(c=>item[c]);
    const names=columns.map(toSnake);
    const params=columns.map((_,i)=>`$${i+1}`).join(',');
    const updates=names.filter(n=>!['id','tenant_id','user_id','created_at'].includes(n)).map(n=>`${n}=excluded.${n}`).join(',');
    const r=await dbQuery(`insert into ready_for_you_items (${names.join(',')}) values (${params}) on conflict (id) do update set ${updates} returning *`,values);
    return parseReadyRow(r.rows?.[0]||item);
  }
  async function saveItem(item){
    if(hasPg())return pgUpsert(item);
    const s=store();
    const idx=s.readyForYouItems.findIndex(r=>r.id===item.id&&r.tenantId===item.tenantId&&r.userId===item.userId);
    if(idx>=0)s.readyForYouItems[idx]={...s.readyForYouItems[idx],...item,createdAt:s.readyForYouItems[idx].createdAt||item.createdAt,updatedAt:new Date().toISOString()};
    else s.readyForYouItems.unshift(item);
    saveStore(s);
    return idx>=0?s.readyForYouItems[idx]:item;
  }
  async function listItems({limit=3,status='',includeSnoozed=false}={}){
    const lim=Math.max(1,Math.min(Number(limit)||3,5));
    const activeStatuses=status?[status]:['ready','ready_for_review','needs_context'];
    let rows=[];
    if(hasPg()){
      const params=[tenantId(),userId(),activeStatuses];
      let where='tenant_id=$1 and user_id=$2 and status = any($3)';
      if(!includeSnoozed) where+=' and (snoozed_until is null or snoozed_until <= now())';
      const r=await dbQuery(`select * from ready_for_you_items where ${where} order by requires_approval desc, confidence desc, created_at desc limit ${lim}`,params);
      rows=(r.rows||[]).map(parseReadyRow);
    }else{
      const now=Date.now();
      rows=store().readyForYouItems
        .filter(r=>r.tenantId===tenantId()&&r.userId===userId())
        .filter(r=>activeStatuses.includes(r.status))
        .filter(r=>includeSnoozed||!r.snoozedUntil||Date.parse(r.snoozedUntil)<=now)
        .sort((a,b)=>(Number(b.requiresApproval)-Number(a.requiresApproval))||(Number(b.confidence||0)-Number(a.confidence||0))||String(b.createdAt||'').localeCompare(String(a.createdAt||'')))
        .slice(0,lim);
    }
    return {ok:true,state:rows.length?'has_items':'caught_up',message:rows.length?'Ready for review.':"I'm caught up.",items:rows,visibleLimit:lim,preparedCount:preparedWorkCount(rows)};
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
  async function collectCandidates(){
    const sc=scope();
    const candidates=[];
    const unknowns=[];
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
      if(!byId.has(item.id))byId.set(item.id,item);
    }
    return {candidates:[...byId.values()],unknowns};
  }
  async function buildQueue({limit=5}={}){
    const {candidates,unknowns}=await collectCandidates();
    const actionable=candidates
      .filter(item=>item.requiresApproval||['ready_for_review','needs_context','ready'].includes(item.status))
      .sort((a,b)=>(Number(b.requiresApproval)-Number(a.requiresApproval))||(Number(b.confidence||0)-Number(a.confidence||0))||String(b.createdAt||'').localeCompare(String(a.createdAt||'')))
      .slice(0,Math.max(1,Math.min(Number(limit)||5,5)));
    const saved=[];
    for(const item of actionable) saved.push(await saveItem(item));
    return {ok:true,state:saved.length?'has_items':'caught_up',message:saved.length?'Ready for review.':"I'm caught up.",items:saved.slice(0,3),allBuilt:saved,preparedCount:preparedWorkCount(saved),unknowns,caughtUp:saved.length===0};
  }
  async function updateState(id,{status,decision={},snoozedUntil=null}={}){
    const reviewedAt=new Date().toISOString();
    if(hasPg()){
      const r=await dbQuery(`update ready_for_you_items set status=$1,decision_json=$2,reviewed_at=$3,snoozed_until=$4,updated_at=now() where id=$5 and tenant_id=$6 and user_id=$7 returning *`,[status,JSON.stringify({...decision,status,recorded_at:reviewedAt}),reviewedAt,snoozedUntil,id,tenantId(),userId()]);
      return r.rows?.[0]?parseReadyRow(r.rows[0]):null;
    }
    const s=store();
    const row=s.readyForYouItems.find(r=>r.id===id&&r.tenantId===tenantId()&&r.userId===userId());
    if(!row)return null;
    Object.assign(row,{status,decisionJson:{...decision,status,recorded_at:reviewedAt},reviewedAt,snoozedUntil,updatedAt:reviewedAt});
    saveStore(s);
    return row;
  }
  return {
    listItems,
    listItemsWithReceipts,
    buildQueue,
    saveItem,
    approve:(id,decision={})=>updateState(id,{status:'approved',decision:{...decision,external_action:false}}),
    reject:(id,decision={})=>updateState(id,{status:'rejected',decision:{...decision,external_action:false}}),
    snooze:(id,{until='',minutes=60,reason=''}={})=>{
      const target=until||new Date(Date.now()+Math.max(1,Number(minutes)||60)*60000).toISOString();
      return updateState(id,{status:'snoozed',decision:{reason,external_action:false},snoozedUntil:target});
    },
    collectCandidates
  };
}

module.exports={createValReadyForYouService,draftToCandidate,draftEvaluationToCandidate,internalDraftCandidate,meetingPrepCandidate,transcriptCandidate,parseReadyRow,preparedWorkCount};
