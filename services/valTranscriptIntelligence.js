const {extractExecutiveInstructions}=require('./valExecutiveInstructions');
const {relationshipIntroCandidates}=require('./valRelationshipActionIntelligence');
const {assessPreparedWork,validatePreparedArtifactQuality}=require('./valPreparedWorkAdmission');

function safeArray(value){return Array.isArray(value)?value:[];}
function compactText(value,limit=800){return String(value||'').replace(/\s+/g,' ').trim().slice(0,limit);}
function jsonValue(value,fallback){if(value==null)return fallback;if(typeof value==='string'){try{return JSON.parse(value);}catch(_){return fallback;}}return value;}
function toSnake(key){return key.replace(/[A-Z]/g,m=>'_'+m.toLowerCase());}
function toCamelRow(row={}){
  const out={};
  for(const [k,v] of Object.entries(row||{})){
    const camel=k.replace(/_([a-z])/g,(_,c)=>c.toUpperCase());
    out[camel]=v instanceof Date?v.toISOString():v;
  }
  for(const key of ['qualityGateJson','linkageJson','evidenceRefsJson','commitmentsJson','contextualTasksJson','relationshipSignalsJson','projectSignalsJson','capacityAndToneContextJson','courageSignalsJson','teachValCandidatesJson','readyForYouCandidatesJson','executiveInstructionsJson','chiefOfStaffSignalsJson','momentumSignalsJson','approvalPoliciesJson','unknownsJson','noActionNeededJson','finalJson','sourceRefsJson','linkTargetsJson','metadataJson']){
    if(Object.hasOwn(out,key))out[key]=jsonValue(out[key],/refs|signals|tasks|candidates|policies|unknowns|targets|commitments/i.test(key)?[]:{});
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
function sentences(text=''){
  return String(text||'').replace(/\r/g,'\n').split(/(?<=[.!?])\s+|\n+/).map(s=>s.trim()).filter(s=>s.length>12&&s.length<600);
}
function findQuote(text='',needle=''){
  const n=String(needle||'').trim();
  if(!n)return sentences(text)[0]||compactText(text,300);
  const exact=sentences(text).find(s=>s.toLowerCase().includes(n.toLowerCase().slice(0,80)));
  return exact||compactText(n,300);
}
function transcriptText(record={}){
  return String(record.rawTranscript||record.raw_transcript||record.rawText||record.raw_text||record.transcript||record.transcriptText||record.text||'').trim();
}
function transcriptTitle(record={}){
  return compactText(record.meetingTitle||record.meeting_title||record.title||record.summary||'Transcript',180);
}
function qualityGate(record={}){
  const text=transcriptText(record);
  const issues=[];
  if(!record.id&&!record.transcriptId&&!record.transcript_id)issues.push('missing_transcript_id');
  if(text.length<120)issues.push('too_short');
  if(text.length>0&&text.length<400)issues.push('thin_context');
  const speakerLines=(text.match(/^\s*[^:\n]{2,80}:\s+\S/gm)||[]).length;
  const speakerConfidence=speakerLines>=4?0.8:speakerLines>=2?0.55:0.25;
  if(speakerConfidence<0.4)issues.push('low_speaker_confidence');
  const quality=!text?'unusable':issues.includes('too_short')?'low':issues.length?'medium':'high';
  return {
    is_usable:quality!=='unusable',
    quality,
    issues,
    speaker_confidence:speakerConfidence,
    missing_context:[],
    recommended_next_step:quality==='unusable'?'request_better_transcript':(quality==='low'?'process_with_caution':'process')
  };
}
function commitmentSentences(text=''){
  return sentences(text).filter(transcriptSentenceIsActionReady).slice(0,12);
}
function transcriptSentenceIsSmallTalk(text=''){
  return /\b(laughter|haha|vacuum|litter box|screwdriver|marriage counselor|mother'?s day|shop vac|robot cat|pretty|good morning everybody|how is everyone doing|anything else anyone wants to bring up|bye\b)\b/i.test(String(text||''));
}
function transcriptSentenceIsActionReady(sentence=''){
  const s=String(sentence||'');
  if(!s||transcriptSentenceIsSmallTalk(s))return false;
  if(/\b(maybe|might|could possibly|for example|nothing needs to happen|nothing need happen|no action needed|doesn't need follow up|does not need follow up|already did|already sent|completed|finished)\b/i.test(s))return false;
  const hasCommitment=/\b(i will|i'll|we will|we'll|i can|we can|i need to|we need to|let me|i'm going to|we're going to|i'll send|i will send|please send|send me|can you|could you|make sure|i'll put|i will put|get with|let's)\b/i.test(s);
  const hasAssignedAction=/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\s+to\s+(?:research|send|share|review|schedule|build|create|add|update|confirm|check|use|connect|set up|prepare|draft|finish|complete|deliver|forward|introduce|provide|resend|nudge|choose|hold off|onboard|test|fix|map|write|call|email|text|route|change|compare|report|compile|find)\b/.test(s);
  const hasConcreteAction=/\b(research|send|share|review|schedule|build|create|add|update|confirm|check|use|connect|set up|prepare|draft|finish|complete|deliver|forward|introduce|provide|resend|nudge|choose|hold off|onboard|test|fix|map|write|call|email|text|route|change|compare|report)\b/i.test(s);
  return (hasCommitment||hasAssignedAction)&&hasConcreteAction;
}
function evidenceExtractor(record={}){
  const text=transcriptText(record),id=record.id||record.transcriptId||record.transcript_id||'';
  const keySentences=sentences(text).filter(s=>/\b(decided|agreed|will|follow up|send|introduced|blocked|waiting|important|priority|next step|proposal|partner|client|project)\b/i.test(s)).slice(0,12);
  return keySentences.map((s,i)=>normalizeSourceRef({sourceType:'transcript',sourceId:id,quoteOrSummary:s,confidence:i<5?0.78:0.65,createdAt:record.createdAt||record.created_at||new Date().toISOString()}));
}
function commitmentExtractor(record={},evidenceRefs=[]){
  const id=record.id||record.transcriptId||record.transcript_id||'',text=transcriptText(record);
  return commitmentSentences(text).map((s,i)=>({
    id:`commitment_${i+1}`,
    title:commitmentTitleFromSentence(s),
    summary:compactText(s,360),
    source_quote:findQuote(text,s),
    owner:/\byou will|you'll|can you|could you|please\b/i.test(s)?'other':(/\bi will|i'll|i can|let me|i'm going to\b/i.test(s)?'user':(/\bwe will|we'll|we can|we're going to\b/i.test(s)?'unknown':'unknown')),
    due_hint:(s.match(/\b(today|tomorrow|monday|tuesday|wednesday|thursday|friday|next week|before [^.]+)\b/i)||[])[0]||'',
    approval_policy:'approval_required',
    confidence:0.78,
    source_refs:[evidenceRefs.find(r=>r.quote_or_summary===s)||normalizeSourceRef({sourceType:'transcript',sourceId:id,quoteOrSummary:s,confidence:0.72})]
  }));
}
function commitmentTitleFromSentence(sentence=''){
  const s=compactText(sentence,180)
    .replace(/^(so|okay|all right|yeah|yes|then|and|but)[,.\s]+/i,'')
    .replace(/\b(i will|i'll|we will|we'll|i can|we can|let me|i'm going to|we're going to)\b/i,'')
    .replace(/\s+/g,' ')
    .trim();
  return compactText(s||sentence,120);
}
function taskContextBuilder(record={},commitments=[]){
  return commitments.map((c,i)=>({
    id:`task_candidate_${i+1}`,
    title:c.title,
    why:compactText(`This task exists because the transcript contains a commitment or implied follow-up: ${c.summary}`,500),
    source_quote:c.source_quote,
    commitment_id:c.id,
    context_summary:c.summary,
    due_hint:c.due_hint,
    execution_level:'level_4_human_judgment_required',
    execution_level_label:'Human Judgment Required',
    autonomous_work_possible:false,
    continuation_status:'needs_review',
    completed_by_val:[],
    remaining_context_needed:['Confirm this is a real commitment before VAL turns it into durable work.'],
    prepared_work_ids:[],
    approval_policy:'approval_required',
    requires_approval:true,
    confidence:c.confidence
  }));
}
function canonicalWorkShape(commitment={},record={},linkage={},projectSignalsList=[]){
  const title=compactText(commitment.title||commitment.summary||'',180);
  const match=title.match(/^([A-Za-z]+)\s+(.+)$/);
  const project=safeArray(linkage.linked_projects)[0]||{};
  const groundedProjectHint=projectHintFromText([
    commitment.source_quote,
    commitment.summary,
    title,
    transcriptTitle(record)
  ].filter(Boolean).join(' '),record);
  const projectHint=project.name||project.title||project.projectName||groundedProjectHint||safeArray(projectSignalsList).map(signal=>signal.project_hint).find(Boolean)||'';
  const relationship=safeArray(linkage.linked_people)[0]||{};
  return {
    sourceType:'transcript',
    sourceId:record.id||record.transcriptId||record.transcript_id||'',
    workType:'commitment',
    ownership:commitment.owner,
    ownerName:commitment.owner==='user'?'user':commitment.owner==='other'?(relationship.name||relationship.email||'other'):'',
    actionText:match?.[1]||title,
    objectText:match?.[2]||commitment.summary||title,
    outcomeText:commitment.summary||title,
    title,
    summary:commitment.summary||title,
    exactSourceQuote:commitment.source_quote,
    sourceRefs:commitment.source_refs,
    projectId:project.id||project.projectId||'',
    projectName:projectHint,
    relationshipId:relationship.contactId||relationship.crm_contact_id||'',
    relationshipName:relationship.name||relationship.email||'',
    dueAt:null,
    dueBasis:{sourceHint:commitment.due_hint||'',explicitDate:false},
    confidence:commitment.confidence,
    metadata:{transcriptCommitmentId:commitment.id,approvalPolicy:commitment.approval_policy,noExternalAction:true}
  };
}
function executionLevelForInstruction(instruction={}){
  const action=String(instruction.requested_action||'');
  if(['analyze','prepare_only'].includes(action))return {level:'level_1_inform_only',label:'Inform Only',rank:1,approval:false};
  if(['create_draft','send_email','prepare_proposal','send_proposal','prepare_invoice','send_invoice','draft_introduction','make_introduction','send_calendar_invite','create_calendar_hold'].includes(action))return {level:'level_2_autonomous_draft',label:'Autonomous Draft',rank:2,approval:true};
  if(['build_artifact','research'].includes(action))return {level:'level_3_autonomous_build',label:'Autonomous Build',rank:3,approval:true};
  if(['charge_money','delete_record','merge_contacts','change_security_privacy_billing_settings','move_crm_stage','add_or_remove_tag','create_crm_note','publish_content','send_sms'].includes(action))return {level:'level_4_human_judgment_required',label:'Human Judgment Required',rank:4,approval:true};
  if(instruction.external_action)return {level:'level_4_human_judgment_required',label:'Human Judgment Required',rank:4,approval:true};
  return {level:'level_2_autonomous_draft',label:'Autonomous Draft',rank:2,approval:true};
}
function missingContextForInstruction(instruction={},linkage={},artifactKind='prepared_work'){
  const missing=[];
  const ambiguity=safeArray(instruction.ambiguity);
  const blocking=safeArray(instruction.blocking_safety_rules);
  if(ambiguity.includes('target_identity_unresolved'))missing.push('Confirm the target person, recipient, record, or project.');
  if(ambiguity.includes('introduction_parties_unclear'))missing.push('Confirm both introduction parties.');
  if(ambiguity.includes('email_content_unclear'))missing.push('Confirm the answer, offer, or message VAL should represent.');
  if(ambiguity.includes('calendar_time_unclear'))missing.push('Confirm the date, time, duration, and attendees.');
  if(blocking.length)missing.push('Human judgment is required because this touches safety, legal, financial, destructive, public, or external consequences.');
  if(/proposal|invoice|agreement|sow|document|copy/.test(artifactKind))missing.push('Confirm scope, pricing, terms, claims, and authority before external use.');
  if(/html_page|code|build/.test(artifactKind)&&!safeArray(linkage.linked_projects).length)missing.push('Confirm the project, repository, destination path, brand/source assets, and publish target.');
  if(!safeArray(linkage.linked_people).length&&/email|introduction|proposal|calendar/.test(artifactKind))missing.push('Resolve relationship identity before this can be sent, scheduled, or attached externally.');
  return [...new Set(missing)];
}
function linkedContextForPreparedWork(record={},linkage={},instruction={},taskId=''){
  const id=record.id||record.transcriptId||record.transcript_id||'';
  const project=safeArray(linkage.linked_projects)[0]||{};
  const people=safeArray(linkage.linked_people).map(p=>({name:p.name||'',email:p.email||'',contactId:p.contactId||p.crm_contact_id||''})).filter(p=>p.name||p.email||p.contactId).slice(0,8);
  const projectHint=project.name||project.title||instruction.project_hint||instruction.target_person_or_record||transcriptTitle(record);
  return {
    transcript:{id,title:transcriptTitle(record)},
    project:project.id||project.projectId||project.name?{id:project.id||project.projectId||'',name:project.name||project.title||project.projectName||projectHint,source:project.source||'transcript_linkage'}:{id:'',name:projectHint,source:'suggested_from_transcript',needs_creation:true},
    relationships:people,
    task:{id:taskId,title:compactText(instruction.instruction||'',140),source:'transcript_execution_opportunity'}
  };
}
function preparedWorkNeedsInformationCandidate({id='',index=0,instruction={},record={},linkage={},sourceRefs=[],assessment={},task=null,projectHint=''}={}){
  const kind=assessment.brief?.workType||preparedWorkType(instruction)||'prepared_work';
  const missing=safeArray(assessment.missingInformation||assessment.brief?.missingInformation);
  const taskId=task?.id||`task_${id}_${String(kind).replace(/[^a-z0-9]+/gi,'_')}_${index+1}`;
  const linkedContext={
    ...linkedContextForPreparedWork({...record,id},linkage,instruction,taskId),
    task:{id:taskId,title:task?.title||compactText(instruction.instruction||`Finish ${kind.replace(/_/g,' ')}`,140),source:task?'transcript_commitment':'transcript_execution_opportunity'},
    source_packet:{
      transcript_id:id,
      task_id:taskId,
      source_quote:safeArray(sourceRefs)[0]?.quote_or_summary||assessment.brief?.sourceExcerpt||'',
      project_hint:projectHint||instruction.project_hint||'',
      evidence_refs:sourceRefs,
      work_brief:assessment.brief
    }
  };
  return {
    id:`needs_information_${id}_${kind}_${index+1}`,
    category:'task_candidate',
    type:'prepared_work_needs_information',
    title:task?.title||compactText(`Finish ${kind.replace(/_/g,' ')}: ${instruction.target_person_or_record||assessment.brief?.subjectPurpose||'missing context'}`,160),
    summary:`VAL recognized the intended ${kind.replace(/_/g,' ')}, but did not create a draft because required information is missing.`,
    why_user_is_seeing_this:'This is unfinished work, not approval-ready work.',
    why_now:'Resolving the missing information will let VAL prepare the work without asking you to repeat the source context.',
    what_val_did:'Classified the intended work, preserved its source packet, and stopped before generating an ungrounded draft.',
    what_only_user_can_do:`Resolve: ${missing.join('; ')}`,
    estimated_review_minutes:2,
    approval_policy:'approval_required',
    representation_risk:/proposal|email|introduction|invoice|agreement/.test(kind)?'high':'medium',
    requires_approval:true,
    execution_level:'level_4_human_judgment_required',
    execution_level_label:'Information Required',
    completion_status:'needs_information',
    completed_by_val:['Classified the intended work.','Preserved the full source packet and work brief.','Prevented incomplete work from entering Leverage.'],
    remaining_context_needed:missing,
    linked_context:linkedContext,
    continuation_task:{
      id:taskId,
      title:task?.title||compactText(`Resolve context for ${kind.replace(/_/g,' ')}`,140),
      status:'needs_information',
      project:linkedContext.project,
      relationships:linkedContext.relationships,
      transcript:linkedContext.transcript,
      completed_by_val:['Classified the intended work and preserved its source packet.'],
      remaining_context_needed:missing,
      work_brief:assessment.brief
    },
    prepared_artifact:null,
    work_brief:assessment.brief,
    source_refs:sourceRefs,
    confidence:assessment.brief?.confidence||instruction.confidence||0.62
  };
}
function projectHintFromText(text='',record={}){
  const value=String(text||'');
  if(/\bGOALL\b/i.test(value)||/\bGOAL[L]?\s+project\b/i.test(value)||/\bGOAL[L]?\s+dashboard\b/i.test(value))return 'GOALL';
  const title=transcriptTitle(record);
  if(/\bGOALL\b/i.test(title))return 'GOALL';
  const projectMatch=(value.match(/\b([A-Z][A-Za-z0-9]+(?:\s+[A-Z][A-Za-z0-9]+){0,2})\s+(?:project|dashboard|handoff|proposal)\b/)||[])[1]||'';
  return compactText(projectMatch,80);
}
function preparedWorkActionForTask(task={},record={}){
  const text=[task.title,task.summary,task.context_summary,task.why,task.source_quote,transcriptTitle(record)].filter(Boolean).join(' ').toLowerCase();
  if(!text)return null;
  if(/\b(dashboard|html|iframe|landing page|web page|site|component|app|code|css|javascript|build|implement|scaffold)\b/.test(text))return 'build_artifact';
  if(/\b(proposal|scope of work|sow)\b/.test(text))return 'prepare_proposal';
  if(/\b(invoice|payment request)\b/.test(text))return 'prepare_invoice';
  if(/\b(agreement|contract)\b/.test(text))return 'create_draft';
  if(/\b(intro|introduction|introduce|connect)\b/.test(text))return 'draft_introduction';
  if(/\b(email|reply|message|nudge|follow up)\b/.test(text)&&/\b(draft|write|send|prepare|nudge|follow up)\b/.test(text))return 'send_email';
  if(/\b(document|brief|overview|summary|handoff|agenda|plan|one[- ]pager|deck|copy)\b/.test(text)&&/\b(create|prepare|draft|write|finish|build|shape|handoff)\b/.test(text))return 'create_draft';
  return null;
}
function preparedWorkCandidatesFromTasks(record={},contextualTasks=[],linkage={},evidenceRefs=[]){
  const id=record.id||record.transcriptId||record.transcript_id||'';
  return safeArray(contextualTasks).map((task,i)=>{
    if(/\bVAL\s*,?\s+(please\s+)?(prepare|build|set|make|send|draft|write|create)\b/i.test([task.title,task.context_summary,task.source_quote].filter(Boolean).join(' ')))return null;
    const action=preparedWorkActionForTask(task,record);
    if(!action)return null;
    const quote=task.source_quote||task.context_summary||task.title||'';
    const projectHint=projectHintFromText([task.title,task.context_summary,task.source_quote,transcriptTitle(record)].join(' '),record);
    const projectLinked=projectHint&&safeArray(linkage.linked_projects).every(p=>String(p.name||p.title||p.projectName||'').toLowerCase()!==projectHint.toLowerCase())
      ? {...linkage,linked_projects:[{id:projectHint.toLowerCase().replace(/[^a-z0-9]+/g,'_'),name:projectHint,source:'transcript_task_hint'},...safeArray(linkage.linked_projects)]}
      : linkage;
    const instruction={
      instruction:compactText(task.context_summary||task.title||quote,900),
      instruction_type:'inferred_from_transcript_task',
      requested_action:action,
      target_system:action==='build_artifact'?'val_workspace':(action==='send_email'||action==='draft_introduction'?'email':'val_workspace'),
      target_person_or_record:projectHint || task.owner || '',
      project_hint:projectHint,
      external_action:action==='send_email',
      authorization:'approval_required',
      authenticated_user_spoke:false,
      speaker_confidence:0.62,
      ambiguity:[],
      conflicts:[],
      blocking_safety_rules:[],
      recommended_next_step:'prepare_only',
      source_refs:task.source_refs||[normalizeSourceRef({sourceType:'transcript',sourceId:id,quoteOrSummary:quote,confidence:task.confidence||0.68})],
      confidence:Math.min(0.84,Number(task.confidence)||0.68),
      authorization_source:'transcript_task',
      authorization_event_id:id,
      authorization_quote:quote,
      authenticated_user_confirmed:false,
      authorization_created_at:record.createdAt||record.created_at||new Date().toISOString()
    };
    const sourceRefs=instruction.source_refs.length?instruction.source_refs:evidenceRefs.slice(0,3);
    const assessment=assessPreparedWork({
      kind:preparedWorkType(instruction),
      instruction,
      record:{...record,id},
      linkage:projectLinked,
      sourceRefs,
      extraMissing:missingContextForInstruction(instruction,projectLinked,preparedWorkType(instruction))
    });
    if(!assessment.admitted)return preparedWorkNeedsInformationCandidate({id,index:i,instruction,record:{...record,id},linkage:projectLinked,sourceRefs,assessment,task,projectHint});
    const artifact=preparedArtifactForInstruction(instruction,{...record,id},projectLinked,evidenceRefs);
    if(!artifact)return null;
    const quality=validatePreparedArtifactQuality(artifact,assessment.brief);
    if(!quality.passes)return preparedWorkNeedsInformationCandidate({id,index:i,instruction,record:{...record,id},linkage:projectLinked,sourceRefs,assessment:{...assessment,admitted:false,status:'needs_information',missingInformation:quality.issues,brief:{...assessment.brief,missingInformation:quality.issues}},task,projectHint});
    const linkedContext={...(artifact.linked_context||{}),task:{id:task.id,title:task.title,source:'transcript_commitment'},source_packet:{transcript_id:id,task_id:task.id,source_quote:quote,project_hint:projectHint||'',evidence_refs:sourceRefs}};
    artifact.source='transcript_task';
    artifact.instruction=instruction.instruction;
    artifact.source_quote=quote;
    artifact.source_packet=linkedContext.source_packet;
    artifact.linked_context=linkedContext;
    artifact.continuation_task={...(artifact.continuation_task||{}),id:task.id,title:task.title,status:'ready_for_review',project:linkedContext.project,relationships:linkedContext.relationships,transcript:linkedContext.transcript,remaining_context_needed:artifact.remaining_context_needed||[]};
    return {
      id:`prepared_${id}_${artifact.kind}_task_${i+1}`,
      category:'prepared_work',
      type:artifact.kind,
      title:artifact.title,
      summary:`VAL prepared ${artifact.kind.replace(/_/g,' ')} from the task packet instead of making you restate the transcript.`,
      why_user_is_seeing_this:'A transcript-created task included enough shape for VAL to prepare reviewable work.',
      why_now:'The task is already on the executive desk, so the draft should arrive with it instead of requiring a second search.',
      what_val_did:`Turned the transcript task packet into a reviewable ${artifact.kind.replace(/_/g,' ')}. Nothing was sent, scheduled, published, or written externally.`,
      what_only_user_can_do:artifact.remaining_context_needed?.length
        ? `Review what VAL prepared and fill the missing pieces: ${artifact.remaining_context_needed.join('; ')}`
        : 'Review the prepared work, edit if needed, and approve any external step separately.',
      estimated_review_minutes:artifact.kind==='html_page_draft'?6:3,
      approval_policy:'approval_required',
      representation_risk:/proposal|email|introduction/.test(artifact.kind)?'high':'medium',
      requires_approval:true,
      execution_level:artifact.execution_level,
      execution_level_label:artifact.execution_level_label,
      completion_status:artifact.completion_status,
      completed_by_val:artifact.completed_by_val,
      remaining_context_needed:artifact.remaining_context_needed,
      linked_context:linkedContext,
      continuation_task:artifact.continuation_task,
      prepared_artifact:artifact,
      source_refs:sourceRefs,
      confidence:Math.min(0.84,Number(task.confidence)||0.68)
    };
  }).filter(Boolean).filter((candidate,index,all)=>{
    const key=[candidate.type,candidate.linked_context?.project?.name||'',candidate.linked_context?.transcript?.id||id].join('|').toLowerCase();
    return index===all.findIndex(other=>[other.type,other.linked_context?.project?.name||'',other.linked_context?.transcript?.id||id].join('|').toLowerCase()===key);
  });
}
function relationshipSignals(record={},participants=[],commitments=[]){
  const text=transcriptText(record);
  const signals=sentences(text).filter(s=>/\b(waiting|trust|appreciate|thank|concern|frustrat|excited|partner|intro|relationship|follow up|owed|sorry|important)\b/i.test(s)).slice(0,8);
  return signals.map((s,i)=>({id:`relationship_signal_${i+1}`,summary:compactText(s,360),source_quote:findQuote(text,s),participants:safeArray(participants).slice(0,5),approval_policy:'approval_required',confidence:0.66}));
}
function projectSignals(record={}){
  const text=transcriptText(record);
  const signals=sentences(text).filter(s=>/\b(project|proposal|workflow|launch|build|ship|blocked|blocker|decision|scope|Frisson|HopeMakers|HelpByShopping|client|partner)\b/i.test(s)).slice(0,8);
  return signals.map((s,i)=>({id:`project_signal_${i+1}`,summary:compactText(s,360),source_quote:findQuote(text,s),project_hint:(s.match(/\b([A-Z][A-Za-z0-9]+(?:\s+[A-Z][A-Za-z0-9]+){0,3})\b/)||[])[0]||'',approval_policy:'approval_required',confidence:0.64}));
}
function capacityAndTone(record={}){
  const text=transcriptText(record).toLowerCase();
  const signals=[];
  if(/\b(tired|exhausted|overwhelmed|too much|burned out|burnt out|stressed|anxious|hard to focus|can't focus|frustrated)\b/i.test(text))signals.push('capacity_pressure_visible');
  if(/\b(excited|energized|clear|relieved|momentum|breakthrough)\b/i.test(text))signals.push('positive_movement_visible');
  return {
    label:'capacity_and_tone_context',
    observation:signals.length?`Transcript contains non-clinical capacity/tone signals: ${signals.join(', ')}.`:'No strong capacity/tone signal was visible.',
    signals,
    confidence:signals.length?0.7:0.42,
    limitation:'This is not clinical interpretation. It only names work-context tone and capacity signals visible in the transcript.'
  };
}
function courageSignals(record={},commitments=[]){
  const text=transcriptText(record);
  const signals=sentences(text).filter(s=>/\b(avoid|avoiding|hard conversation|difficult conversation|need to talk|postpon|scared|afraid|uncertain|resistance|stuck|blocked)\b/i.test(s)).slice(0,6);
  return signals.map((s,i)=>({id:`courage_signal_${i+1}`,summary:compactText(s,360),source_quote:findQuote(text,s),confidence:0.62,approval_policy:'approval_required'}));
}
function teachValCandidates(record={}){
  const text=transcriptText(record);
  return sentences(text).filter(s=>/\b(always|never|prefer|works best|remember|important to me|I care about|I don't want|my style|my voice|protect)\b/i.test(s)).slice(0,8).map((s,i)=>({
    id:`teach_val_candidate_${i+1}`,
    title:compactText(s,100),
    summary:compactText(s,420),
    source_quote:findQuote(text,s),
    approval_policy:'approval_required',
    user_confirmation:'not_shown',
    confidence:0.6
  }));
}
function followUpCandidates(record={},commitments=[],relationshipSignals=[]){
  const id=record.id||record.transcriptId||record.transcript_id||'';
  const candidates=[];
  if(commitments.length){
    candidates.push({id:`followup_${id}_commitments`,category:'transcript_follow_up',type:'commitment_bundle',title:`Review ${commitments.length} transcript commitment${commitments.length===1?'':'s'}`,summary:'VAL extracted commitments before turning anything into tasks.',why_user_is_seeing_this:'This transcript changed what someone may be waiting on.',why_now:'Commitments lose value when they are not clarified soon after the conversation.',what_val_did:'Extracted commitments, source quotes, and task context. No task was created automatically.',what_only_user_can_do:'Confirm which commitments are real and how they should move forward.',estimated_review_minutes:Math.min(5,Math.max(2,commitments.length)),approval_policy:'approval_required',representation_risk:'medium',requires_approval:true,source_refs:commitments.flatMap(c=>c.source_refs||[]).slice(0,8),confidence:0.74});
  }
  if(relationshipSignals.length){
    candidates.push({id:`followup_${id}_relationship`,category:'relationship_update',type:'relationship_project_update_candidate',title:'Review relationship signals from transcript',summary:'VAL found relationship/project context that should not be quietly flattened into tasks.',why_user_is_seeing_this:'A relationship or project may have changed because of what was said.',why_now:'Reviewing this now prevents useful context from disappearing into raw transcript history.',what_val_did:'Prepared relationship/project signal candidates only. No CRM or memory update was committed.',what_only_user_can_do:'Confirm whether these signals should update relationship or project context.',estimated_review_minutes:3,approval_policy:'approval_required',representation_risk:'low',requires_approval:true,source_refs:relationshipSignals.map(s=>normalizeSourceRef({sourceType:'transcript',sourceId:id,quoteOrSummary:s.source_quote||s.summary,confidence:s.confidence})).slice(0,8),confidence:0.66});
  }
  return candidates;
}
function transcriptMeetingOverviewPreparedWork(record={},commitments=[],relationshipSignalsList=[],projectSignalsList=[],linkage={},evidenceRefs=[]){
  const id=record.id||record.transcriptId||record.transcript_id||'';
  const title=transcriptTitle(record);
  const meaningfulSignals=[
    ...safeArray(commitments).map((item)=>item.summary||item.title||item.source_quote),
    ...safeArray(relationshipSignalsList).map((item)=>item.summary||item.source_quote),
    ...safeArray(projectSignalsList).map((item)=>item.summary||item.source_quote),
    ...safeArray(evidenceRefs).map((item)=>item.quote_or_summary||item.quoteOrSummary)
  ].map((item)=>compactText(item,360)).filter(Boolean)
    .filter((item,index,all)=>index===all.findIndex(other=>other.toLowerCase()===item.toLowerCase()));
  if(!id||!meaningfulSignals.length)return [];
  const actionLines=safeArray(commitments).map((item)=>compactText(item.title||item.summary||'',220)).filter(Boolean)
    .filter((item,index,all)=>index===all.findIndex(other=>other.toLowerCase()===item.toLowerCase()));
  const usedLines=new Set(actionLines.concat(meaningfulSignals).map(item=>item.toLowerCase()));
  const keyPointLines=safeArray(evidenceRefs).map((item)=>compactText(item.quote_or_summary||item.quoteOrSummary||'',260)).filter(Boolean)
    .filter((item,index,all)=>!usedLines.has(item.toLowerCase())&&index===all.findIndex(other=>other.toLowerCase()===item.toLowerCase()))
    .slice(0,6);
  const people=safeArray(linkage.linked_people).map((person)=>({name:person.name||'',email:person.email||'',contactId:person.contactId||person.crm_contact_id||''})).filter((person)=>person.name||person.email||person.contactId).slice(0,8);
  const body=[
    `Meeting overview: ${title}`,
    '',
    'What changed',
    ...meaningfulSignals.slice(0,5).map((line)=>'- '+line),
    '',
    actionLines.length?'Action items':'Action items',
    ...(actionLines.length?actionLines:['No explicit action item was clean enough to turn into a task without review.']).map((line)=>'- '+line),
    '',
    keyPointLines.length?'Key points':'Key points',
    ...(keyPointLines.length?keyPointLines:['No separate key point excerpt was attached.']).map((line)=>'- '+line),
    '',
    'Review decision',
    '- Confirm what should become a task, draft, relationship update, or project packet.',
    '- Nothing has been sent, scheduled, published, or written externally.'
  ].join('\n');
  const linkedContext={
    transcript:{id,title},
    project:safeArray(linkage.linked_projects)[0]||{},
    relationships:people,
    source_packet:{transcript_id:id,source_quote:meaningfulSignals[0]||'',evidence_refs:safeArray(evidenceRefs).slice(0,8)}
  };
  const instruction={
    requested_action:'send_email',
    instruction:`Send the meeting overview for ${title}. ${meaningfulSignals.slice(0,5).join(' ')}`,
    target_person_or_record:people.length===1?(people[0].email||people[0].name):'',
    confidence:0.74,
    source_refs:safeArray(evidenceRefs).slice(0,8),
    authorization:'approval_required'
  };
  const assessment=assessPreparedWork({
    kind:'meeting_overview_email_draft',
    instruction,
    record:{...record,id},
    linkage,
    sourceRefs:evidenceRefs
  });
  if(!assessment.admitted)return [preparedWorkNeedsInformationCandidate({id,index:0,instruction,record:{...record,id},linkage,sourceRefs:safeArray(evidenceRefs).slice(0,8),assessment})];
  const artifact={
    kind:'meeting_overview_email_draft',
    source:'transcript_meeting_overview',
    transcript_id:id,
    title:`Meeting overview draft: ${title}`,
    subject:`Meeting overview: ${title}`,
    body,
    recipients:people,
    externalSend:false,
    reviewRequired:true,
    no_external_action:true,
    linked_context:linkedContext,
    completed_by_val:[
      'Extracted transcript action items and key points.',
      'Prepared a reviewable meeting overview draft.',
      'Linked the draft back to the transcript and available relationships.'
    ],
    remaining_context_needed:people.length?[]:['Choose recipients before sending this outside VAL.'],
    completion_status:people.length?'complete_for_review':'partial_needs_context',
    execution_level:'level_2_autonomous_draft',
    execution_level_label:'Autonomous Draft'
  };
  const quality=validatePreparedArtifactQuality(artifact,assessment.brief);
  if(!quality.passes)return [preparedWorkNeedsInformationCandidate({id,index:0,instruction,record:{...record,id},linkage,sourceRefs:safeArray(evidenceRefs).slice(0,8),assessment:{...assessment,admitted:false,status:'needs_information',missingInformation:quality.issues,brief:{...assessment.brief,missingInformation:quality.issues}}})];
  return [{
    id:`prepared_${id}_meeting_overview_email_draft`,
    category:'prepared_work',
    type:'meeting_overview_email_draft',
    title:artifact.title,
    summary:'VAL prepared the transcript action items and key points as a reviewable meeting overview instead of leaving them buried in the transcript.',
    why_user_is_seeing_this:'This transcript produced action items, key points, or relationship/project signals that are useful enough to review.',
    why_now:'Meeting context is easiest to use while the conversation is still fresh.',
    what_val_did:'Prepared a meeting overview draft from the transcript. Nothing was sent, scheduled, published, or written externally.',
    what_only_user_can_do:artifact.remaining_context_needed.length?'Choose recipients, edit if needed, and approve any external step separately.':'Review the overview, edit if needed, and approve any external step separately.',
    estimated_review_minutes:3,
    approval_policy:'approval_required',
    representation_risk:'medium',
    requires_approval:true,
    execution_level:artifact.execution_level,
    execution_level_label:artifact.execution_level_label,
    completion_status:artifact.completion_status,
    completed_by_val:artifact.completed_by_val,
    remaining_context_needed:artifact.remaining_context_needed,
    linked_context:linkedContext,
    continuation_task:null,
    prepared_artifact:artifact,
    source_refs:safeArray(evidenceRefs).slice(0,8),
    confidence:0.74
  }];
}
function preparedWorkType(instruction={}){
  const action=instruction.requested_action||'';
  const text=String(instruction.instruction||'').toLowerCase();
  if(action==='prepare_proposal'||action==='send_proposal')return 'proposal_draft';
  if(action==='prepare_invoice'||action==='send_invoice')return 'invoice_draft';
  if(action==='build_artifact')return 'html_page_draft';
  if(action==='send_calendar_invite'||action==='create_calendar_hold')return 'calendar_invite_draft';
  if(action==='make_introduction'||action==='draft_introduction')return 'introduction_email_draft';
  if(action==='create_draft'){
    if(/\b(agreement|statement of work|sow)\b/.test(text))return 'agreement_draft';
    if(/\b(project plan|implementation plan|technical specification|spec|documentation|report|executive summary|research brief|agenda)\b/.test(text))return 'document_draft';
    if(/\b(website copy|marketing copy|social post|social posts|copy)\b/.test(text))return 'copy_draft';
    return 'document_draft';
  }
  if(action==='send_email')return 'email_draft';
  return '';
}
function artifactEvidenceLines(instruction={},record={},evidenceRefs=[]){
  const direct=[
    instruction.instruction,
    instruction.authorization_quote,
    ...(safeArray(instruction.source_refs).map(ref=>ref.quote_or_summary||ref.quoteOrSummary||ref.summary||ref.quote)),
    ...(safeArray(evidenceRefs).map(ref=>ref.quote_or_summary||ref.quoteOrSummary||ref.summary||ref.quote))
  ].map(line=>compactText(line,360)).filter(Boolean);
  const keyTerms=String([instruction.instruction,instruction.authorization_quote].filter(Boolean).join(' ')).toLowerCase().split(/[^a-z0-9]+/).filter(term=>term.length>4).slice(0,12);
  const related=sentences(transcriptText(record))
    .filter(sentence=>keyTerms.some(term=>sentence.toLowerCase().includes(term)))
    .map(sentence=>compactText(sentence,360));
  return [...new Set([...direct,...related])].filter(Boolean).slice(0,8);
}
function artifactOpenQuestions(missing=[]){
  return safeArray(missing).length?safeArray(missing):['Confirm this still represents your intent before anything leaves VAL.'];
}
function artifactPlainBody({kind='',title='',target='',instruction={},record={},evidenceRefs=[],missing=[]}={}){
  const evidence=artifactEvidenceLines(instruction,record,evidenceRefs);
  const sourceTitle=transcriptTitle(record);
  const sourceQuote=evidence[0]||compactText(instruction.instruction||'',280);
  const bodyByKind={
    proposal_draft:[
      title,
      '',
      'Context heard in the source',
      ...evidence.slice(0,5).map(line=>'- '+line),
      '',
      'Recommended scope',
      `- Build the proposal around ${target || 'the named relationship or project'} using only the commitments, pricing, timing, and boundaries confirmed in the source.`,
      '',
      'Decision needed',
      ...artifactOpenQuestions(missing).map(line=>'- '+line)
    ],
    invoice_draft:[
      title,
      '',
      'Context heard in the source',
      ...evidence.slice(0,5).map(line=>'- '+line),
      '',
      'Invoice review',
      '- Confirm amount, recipient, terms, and timing before any financial action.',
      '',
      'Decision needed',
      ...artifactOpenQuestions(missing).map(line=>'- '+line)
    ],
    agreement_draft:[
      title,
      '',
      'Parties and context',
      ...evidence.slice(0,5).map(line=>'- '+line),
      '',
      'Draft structure',
      '- Scope',
      '- Responsibilities',
      '- Timeline',
      '- Terms requiring human or legal review',
      '',
      'Decision needed',
      ...artifactOpenQuestions(missing).map(line=>'- '+line)
    ],
    document_draft:[
      title,
      '',
      'Purpose',
      `- Turn the ${sourceTitle} context into a clean reviewable document.`,
      '',
      'Source-backed content',
      ...evidence.slice(0,6).map(line=>'- '+line),
      '',
      'Next review decision',
      ...artifactOpenQuestions(missing).map(line=>'- '+line)
    ],
    copy_draft:[
      title,
      '',
      'Audience and promise',
      `- Draft copy for ${target || 'the intended audience'} from the source context.`,
      '',
      'Source-backed points',
      ...evidence.slice(0,6).map(line=>'- '+line),
      '',
      'Review decision',
      ...artifactOpenQuestions(missing).map(line=>'- '+line)
    ],
    calendar_invite_draft:[
      title,
      '',
      'Invite context',
      ...evidence.slice(0,5).map(line=>'- '+line),
      '',
      'Invite draft',
      `Subject: ${target ? `Meeting with ${target}` : 'Follow-up meeting'}`,
      'Timing: Confirm before scheduling.',
      'Purpose: Close the loop named in the source.',
      '',
      'Decision needed',
      ...artifactOpenQuestions(missing).map(line=>'- '+line)
    ],
    introduction_email_draft:[
      title,
      '',
      `Hi ${target || 'there'},`,
      '',
      'I wanted to make this introduction because the source context suggests there may be useful alignment here.',
      '',
      evidence.slice(0,3).map(line=>`- ${line}`).join('\n'),
      '',
      'I am keeping this as a draft until Jessa confirms the relationship fit and wording.'
    ],
    email_draft:[
      title,
      '',
      `Hi ${target || 'there'},`,
      '',
      sourceQuote,
      '',
      'I wanted to close this loop clearly. Please let me know what timing or next step works best from here.'
    ]
  };
  return safeArray(bodyByKind[kind]).filter(line=>line!=null).join('\n');
}
function htmlEscape(value=''){
  return String(value||'').replace(/[&<>"']/g,(char)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
function artifactHtmlDraft({target='',instruction={},record={},evidenceRefs=[],missing=[]}={}){
  const evidence=artifactEvidenceLines(instruction,record,evidenceRefs);
  const project=projectHintFromText([target,instruction.instruction,transcriptTitle(record),evidence.join(' ')].join(' '),record)||target||'Dashboard';
  const requirements=evidence.filter(line=>/\b(show|dashboard|projection|pipeline|owner|risk|context|follow|iframe|crm|html|css|embed)\b/i.test(line)).slice(0,6);
  const title=/\bGOALL\b/i.test(project)?'GOALL Dashboard Handoff':`${project} Dashboard Handoff`;
  const cards=(requirements.length?requirements:evidence.slice(0,4)).map((line,index)=>`      <article>\n        <span>${index+1}</span>\n        <p>${htmlEscape(line)}</p>\n      </article>`).join('\n');
  const questions=artifactOpenQuestions(missing).map(line=>`      <li>${htmlEscape(line)}</li>`).join('\n');
  return [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '  <meta charset="utf-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1">',
    `  <title>${htmlEscape(title)}</title>`,
    '  <style>',
    '    :root{color-scheme:light;--sage:#6f8f72;--rose:#c98995;--ink:#243025;--line:rgba(111,143,114,.22);--glass:rgba(255,255,255,.78)}',
    '    body{margin:0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:linear-gradient(135deg,rgba(111,143,114,.12),rgba(201,137,149,.14));color:var(--ink)}',
    '    main{box-sizing:border-box;min-height:100vh;padding:28px}',
    '    .shell{max-width:1080px;margin:0 auto;border:1px solid rgba(36,48,37,.12);background:var(--glass);border-radius:18px;padding:28px;box-shadow:0 24px 80px rgba(36,48,37,.12)}',
    '    .eyebrow{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--sage);font-weight:650}',
    '    h1{font-family:Georgia,serif;font-weight:500;font-size:clamp(30px,5vw,58px);line-height:.96;margin:10px 0 18px}',
    '    .summary{font-size:16px;line-height:1.55;max-width:720px;color:rgba(36,48,37,.76)}',
    '    .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:26px}',
    '    article{border:1px solid var(--line);background:rgba(255,255,255,.58);border-radius:14px;padding:16px;display:grid;grid-template-columns:32px 1fr;gap:12px;align-items:start}',
    '    article span{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,rgba(111,143,114,.2),rgba(201,137,149,.24));color:var(--sage);font-size:12px;font-weight:700}',
    '    p{margin:0}.open{margin-top:28px;border-top:1px solid rgba(36,48,37,.12);padding-top:20px}.open h2{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--rose);margin:0 0 10px}.open li{margin:6px 0;color:rgba(36,48,37,.72)}',
    '    @media(max-width:720px){main{padding:16px}.grid{grid-template-columns:1fr}.shell{padding:20px}}',
    '  </style>',
    '</head>',
    '<body>',
    '  <main>',
    '    <section class="shell">',
    '      <div class="eyebrow">Prepared by VAL</div>',
    `      <h1>${htmlEscape(title)}</h1>`,
    `      <p class="summary">This iframe-ready draft was built from ${htmlEscape(transcriptTitle(record))}. Review the wording and destination before publishing or embedding it.</p>`,
    '      <div class="grid">',
    cards,
    '      </div>',
    '      <section class="open">',
    '        <h2>Before this leaves VAL</h2>',
    '        <ul>',
    questions,
    '        </ul>',
    '      </section>',
    '    </section>',
    '  </main>',
    '</body>',
    '</html>'
  ].join('\n');
}
function preparedArtifactForInstruction(instruction={},record={},linkage={},evidenceRefs=[]){
  const type=preparedWorkType(instruction);
  if(!type)return null;
  const id=record.id||record.transcriptId||record.transcript_id||'';
  const target=instruction.target_person_or_record||safeArray(linkage.linked_people)[0]?.name||'relationship';
  const level=executionLevelForInstruction(instruction);
  const missing=missingContextForInstruction(instruction,linkage,type);
  const completionStatus=missing.length?'partial_needs_context':'complete_for_review';
  const taskId=`task_${id}_${String(type||'prepared').replace(/[^a-z0-9]+/gi,'_')}`;
  const linkedContext=linkedContextForPreparedWork({...record,id},linkage,instruction,taskId);
  const titleByType={
    proposal_draft:`Proposal draft for ${target}`,
    invoice_draft:`Invoice draft for ${target}`,
    agreement_draft:`Agreement draft for ${target}`,
    document_draft:`Document draft for ${target}`,
    copy_draft:`Copy draft for ${target}`,
    calendar_invite_draft:`Calendar invitation draft for ${target}`,
    introduction_email_draft:`Introduction draft involving ${target}`,
    email_draft:`Email draft for ${target}`
  };
  const artifactTitle=titleByType[type]||`Prepared work for ${target}`;
  const draftBody=type==='html_page_draft'
    ? ''
    : artifactPlainBody({kind:type,title:artifactTitle,target,instruction,record:{...record,id},evidenceRefs,missing});
  const base={
    source:'transcript_instruction',
    transcript_id:id,
    requested_action:instruction.requested_action,
    instruction:instruction.instruction,
    target,
    execution_level:level.level,
    execution_level_label:level.label,
    completion_status:completionStatus,
    completed_by_val:[
      'Classified the transcript instruction.',
      'Prepared the safest reviewable artifact VAL can create from current context.',
      'Linked the work back to transcript, project, relationship, and task continuation context.'
    ],
    remaining_context_needed:missing,
    linked_context:linkedContext,
    continuation_task:{
      id:taskId,
      title:compactText(`Continue: ${instruction.instruction||type}`,140),
      status:completionStatus==='complete_for_review'?'ready_for_review':'needs_context',
      project:linkedContext.project,
      relationships:linkedContext.relationships,
      transcript:linkedContext.transcript,
      completed_by_val:[],
      remaining_context_needed:missing
    },
    external_action_requested:!!instruction.external_action,
    authorization:instruction.authorization,
    review_required:true,
	    no_external_action:true
	  };
	  if(type==='proposal_draft')return {...base,kind:type,destination:'GHL/CRM proposal draft',title:artifactTitle,body:draftBody,sections:['Context heard in transcript','Recommended scope','Implementation path','Investment or pricing placeholder','Approval questions'],externalSend:false};
	  if(type==='invoice_draft')return {...base,kind:type,destination:'Invoice draft packet',title:artifactTitle,body:draftBody,sections:['Context heard in transcript','Amount or pricing placeholder','Terms needing confirmation','Approval questions'],externalSend:false,externalFinancialAction:false};
	  if(type==='agreement_draft')return {...base,kind:type,destination:'Agreement/SOW draft',title:artifactTitle,body:draftBody,sections:['Parties','Scope','Responsibilities','Timeline','Terms requiring human/legal review','Approval questions'],externalSend:false,legalReviewRequired:true};
	  if(type==='document_draft')return {...base,kind:type,destination:'Prepared document draft',title:artifactTitle,body:draftBody,sections:['Purpose','Context from transcript','Draft content','Open questions','Next review decision'],externalPublish:false};
	  if(type==='copy_draft')return {...base,kind:type,destination:'Copy draft',title:artifactTitle,body:draftBody,sections:['Audience','Promise','Draft copy','CTA','Review questions'],externalPublish:false};
	  if(type==='html_page_draft')return {...base,kind:type,destination:'VAL workspace HTML artifact',title:`${projectHintFromText([target,instruction.instruction,transcriptTitle(record)].join(' '),record)||'HTML'} dashboard draft`,filename:`${String(target||'val-page').toLowerCase().replace(/[^a-z0-9]+/g,'-') || 'val-page'}.html`,html:artifactHtmlDraft({target,instruction,record:{...record,id},evidenceRefs,missing}),externalPublish:false};
	  if(type==='calendar_invite_draft')return {...base,kind:type,destination:'GHL/Calendar invitation draft',title:artifactTitle,body:draftBody,attendees:safeArray(linkage.linked_people).map(p=>({name:p.name,email:p.email,contactId:p.crm_contact_id||p.contactId||''})),timeHint:(instruction.instruction.match(/\b(today|tomorrow|monday|tuesday|wednesday|thursday|friday|next week|at \d[^.]+)/i)||[])[0]||'',externalCalendarWrite:false};
	  if(type==='introduction_email_draft')return {...base,kind:type,destination:'Email draft with two recipients',title:artifactTitle,body:draftBody,recipients:safeArray(linkage.linked_people).slice(0,2).map(p=>({name:p.name,email:p.email,contactId:p.crm_contact_id||p.contactId||''})),relationship_match_required:true,externalSend:false};
	  return {...base,kind:type,destination:'Email draft',title:artifactTitle,body:draftBody,externalSend:false};
}
function preparedWorkCandidates(record={},executiveInstructions=[],linkage={},evidenceRefs=[]){
  const id=record.id||record.transcriptId||record.transcript_id||'';
  return safeArray(executiveInstructions).map((instruction,i)=>{
    const kind=preparedWorkType(instruction);
    if(!kind)return null;
    const sourceRefs=instruction.source_refs||evidenceRefs.slice(0,3);
    const assessment=assessPreparedWork({
      kind,
      instruction,
      record:{...record,id},
      linkage,
      sourceRefs,
      extraMissing:missingContextForInstruction(instruction,linkage,kind)
    });
    if(!assessment.admitted)return preparedWorkNeedsInformationCandidate({id,index:i,instruction,record:{...record,id},linkage,sourceRefs,assessment});
    const artifact=preparedArtifactForInstruction(instruction,record,linkage,evidenceRefs);
    if(!artifact)return null;
    const quality=validatePreparedArtifactQuality(artifact,assessment.brief);
    if(!quality.passes)return preparedWorkNeedsInformationCandidate({id,index:i,instruction,record:{...record,id},linkage,sourceRefs,assessment:{...assessment,admitted:false,status:'needs_information',missingInformation:quality.issues,brief:{...assessment.brief,missingInformation:quality.issues}}});
    return {
      id:`prepared_${id}_${artifact.kind}_${i+1}`,
      category:'prepared_work',
      type:artifact.kind,
      title:artifact.title,
      summary:`VAL heard an instruction and prepared a ${artifact.kind.replace(/_/g,' ')} for review.`,
      why_user_is_seeing_this:'A transcript contained a direct or implied request that can become prepared work.',
      why_now:'Preparing it now preserves momentum while the conversation context is still fresh.',
      what_val_did:`Prepared a reviewable ${artifact.kind.replace(/_/g,' ')} from the transcript. Nothing was sent, scheduled, published, or written externally.`,
      what_only_user_can_do:artifact.remaining_context_needed?.length
        ? `Review the partial work and provide missing context: ${artifact.remaining_context_needed.join('; ')}`
        : 'Confirm whether this is accurate, edit it, and approve any external action separately.',
      estimated_review_minutes:artifact.kind==='html_page_draft'?6:3,
      approval_policy:instruction.authorization==='voice_authorized'?'voice_authorized':'approval_required',
      representation_risk:/proposal|email|introduction/.test(artifact.kind)?'high':'medium',
      requires_approval:true,
      execution_level:artifact.execution_level,
      execution_level_label:artifact.execution_level_label,
      completion_status:artifact.completion_status,
      completed_by_val:artifact.completed_by_val,
      remaining_context_needed:artifact.remaining_context_needed,
      linked_context:artifact.linked_context,
      continuation_task:artifact.continuation_task,
      prepared_artifact:artifact,
      source_refs:sourceRefs,
      confidence:Math.min(0.92,Number(instruction.confidence)||0.68)
    };
  }).filter(Boolean);
}
function currentContactFromLinkage(linkage={}){
  const person=safeArray(linkage.linked_people)[0]||{};
  const crm=safeArray(linkage.linked_crm_records)[0]||{};
  return {
    name:person.name||crm.name||'',
    email:person.email||crm.email||'',
    contactId:person.contactId||person.crm_contact_id||crm.crm_contact_id||crm.contactId||'',
    source:person.source||'transcript_linkage'
  };
}
function transcriptIntroNeeds(record={}){
  const text=transcriptText(record);
  const needs=[];
  for(const sentence of sentences(text)){
    const match=sentence.match(/\b(?:we|i|they|this person|the client)\s+(?:need|needs|want|wants|are looking for|is looking for)\s+([^.!?]{4,180})/i);
    if(match)needs.push(compactText(match[1].replace(/\b(and|or)\s+(?:strategic\s+)?(?:partnership|partner|connection|intro|introduction)\s+paths?\b/i,'$&'),180));
    if(/\bmission aligned organizations\b/i.test(sentence))needs.push('mission aligned organizations');
    if(/\bstrategic partnership paths?\b/i.test(sentence))needs.push('strategic partnership');
  }
  return [...new Set(needs.map(item=>item.replace(/\s+/g,' ').trim()).filter(Boolean))].slice(0,6);
}
function introCandidatesFromMatches({record={},linkage={},crmContacts=[],evidenceRefs=[]}={}){
  const id=record.id||record.transcriptId||record.transcript_id||'';
  const currentContact={...currentContactFromLinkage(linkage),summary:transcriptText(record),needs:transcriptIntroNeeds(record),evidence:evidenceRefs.map(ref=>({summary:ref.quote_or_summary||ref.quoteOrSummary||''}))};
  const intro=relationshipIntroCandidates({currentContact,crmContacts,limit:3});
  return safeArray(intro.candidates).map((candidate,i)=>{
    const recipients=[candidate.personA,candidate.personB];
    const instruction={
      requested_action:'draft_introduction',
      instruction:`Prepare an introduction between ${candidate.personA.name} and ${candidate.personB.name}. ${candidate.whyThisMayMatter||''}`,
      target_person_or_record:candidate.personB.name,
      confidence:candidate.confidence,
      source_refs:evidenceRefs,
      authorization:'approval_required'
    };
    const introLinkage={...linkage,linked_people:recipients,consentConfirmed:candidate.consentConfirmed===true};
    const assessment=assessPreparedWork({kind:'introduction_email_draft',instruction,record,linkage:introLinkage,sourceRefs:evidenceRefs});
    if(!assessment.admitted)return preparedWorkNeedsInformationCandidate({id,index:i,instruction,record,linkage:introLinkage,sourceRefs:evidenceRefs,assessment});
    return {
    id:`intro_match_${id}_${i+1}`,
    category:'prepared_work',
    type:'relationship_introduction_candidate',
    title:`Possible introduction: ${candidate.personA.name} <> ${candidate.personB.name}`,
    summary:candidate.whyThisMayMatter,
    why_user_is_seeing_this:'VAL noticed a possible useful introduction between the person from this transcript and someone already in the CRM.',
    why_now:'The relationship context is fresh, and introductions are easiest to steward while the need is visible.',
    what_val_did:candidate.whatValPrepared,
    what_only_user_can_do:'Confirm whether this introduction is appropriate, edit the email, and approve any send separately.',
    estimated_review_minutes:3,
    approval_policy:'approval_required',
    representation_risk:'high',
    requires_approval:true,
    prepared_artifact:{
      kind:'introduction_email_draft',
      source:'relationship_intro_matching',
      title:candidate.draft.subject,
      recipients:[candidate.personA,candidate.personB],
      consentConfirmed:true,
      body:candidate.draft.body,
      relationship_match_required:false,
      externalSend:false,
      no_external_action:true
    },
    source_refs:evidenceRefs.slice(0,3),
    confidence:candidate.confidence
    };
  });
}
function executiveInstructionExtractor(record={},gate={}){
  if(!gate.is_usable)return [];
  const id=record.id||record.transcriptId||record.transcript_id||'';
  const meta=record.metadata||record.metadataJson||record.metadata_json||{};
  const sourceType=meta.presenceMode||meta.channel||record.source||record.type||'transcript';
  const trusted=/^(chat|voice|voice_session|presence|presence_mode|presence_mode:|val_chat)/i.test(String(sourceType));
  return extractExecutiveInstructions({
    text:transcriptText(record),
    sourceType:/chat/i.test(sourceType)?'chat':(/voice|presence/i.test(sourceType)?'voice':'transcript'),
    sourceId:id,
    trustedAuthenticatedUser:trusted,
    authenticatedUserNames:meta.authenticatedUserNames||meta.authenticated_user_names||[],
    createdAt:record.createdAt||record.created_at||new Date().toISOString()
  }).executive_instructions;
}
function chiefSignals(commitments=[],capacity={},courage=[]){
  const out=[];
  if(commitments.length)out.push({type:'open_loop',summary:`${commitments.length} commitment${commitments.length===1?'':'s'} emerged from a transcript.`,confidence:0.72});
  if(safeArray(capacity.signals).length)out.push({type:'capacity_and_tone',summary:capacity.observation,confidence:capacity.confidence});
  if(courage.length)out.push({type:'courage',summary:'Transcript includes possible avoided or difficult action signals.',confidence:0.62});
  return out;
}
function momentumSignals(commitments=[],projectSignalsList=[],relationshipSignalsList=[]){
  const total=commitments.length+projectSignalsList.length+relationshipSignalsList.length;
  if(!total)return [];
  return [{type:'transcript_movement',direction:'changed',summary:`Transcript produced ${total} movement signal${total===1?'':'s'} across commitments, relationships, or projects.`,confidence:0.68}];
}
function noActionNeeded({commitments=[],relationshipSignalsList=[],projectSignalsList=[],teachCandidates=[]}){
  const value=!commitments.length&&!relationshipSignalsList.length&&!projectSignalsList.length&&!teachCandidates.length;
  return {value,reason:value?'No commitments, relationship/project changes, or Teach VAL candidates were visible.':'Transcript changed one or more follow-up, relationship, project, or preference contexts.'};
}

function createValTranscriptIntelligenceService({
  dbQuery,
  hasPg=()=>false,
  getStore=()=>({}),
  saveStore=()=>{},
  uuid=(prefix)=>`${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`,
  tenantId=()=>'default',
  userId=()=>'default',
  getTranscript=null,
  transcriptIndexData=null,
  resolveMeetingContext=null,
  meetingPrepService=null,
  resolveIdentity=null,
  listRelationshipContacts=null,
  createContinuationTask=null,
  recordSourceProcessing=null,
  admitCanonicalWork=null,
  logger=console
}={}){
  function store(){
    const s=getStore()||{};
    for(const key of ['transcriptIntelligenceRuns','transcriptIntelligenceItems'])if(!Array.isArray(s[key]))s[key]=[];
    return s;
  }
  async function loadTranscript(input={}){
    if(input.transcript&&typeof input.transcript==='object')return input.transcript;
    const id=String(input.transcriptId||input.id||'');
    if(getTranscript){
      const found=await getTranscript(id).catch(()=>null);
      if(found)return found;
    }
    if(transcriptIndexData){
      const data=await transcriptIndexData(id).catch(()=>({transcripts:[]}));
      const row=safeArray(data.transcripts)[0];
      if(row)return row;
    }
    return {id,title:input.title||'Transcript',rawText:input.rawText||input.transcriptText||''};
  }
  async function linkageResolver(record={}){
    const unknowns=[],id=record.id||record.transcriptId||record.transcript_id||'';
    const meta=record.metadata||record.metadataJson||record.metadata_json||{};
    const linkage={linked_calendar_event:meta.calendarEventId||record.calendarEventId||record.meetingId||'',linked_meeting_prep_brief:'',linked_people:[],linked_projects:[],linked_crm_records:[],linked_unified_conversations:[],link_confidence:0.35,unresolved_links:[]};
    if(linkage.linked_calendar_event&&meetingPrepService?.getMeetingPrep){
      const brief=await meetingPrepService.getMeetingPrep(linkage.linked_calendar_event).catch(()=>null);
      if(brief){linkage.linked_meeting_prep_brief=brief.id;linkage.link_confidence=0.75;}
    }
    if(resolveMeetingContext){
      const meeting=await resolveMeetingContext({eventId:linkage.linked_calendar_event,title:transcriptTitle(record),date:record.createdAt||record.created_at}).catch(e=>{unknowns.push({source:'meeting_context',reason:e.message});return null;});
      if(meeting?.meeting?.id&&!linkage.linked_calendar_event){linkage.linked_calendar_event=meeting.meeting.id;linkage.link_confidence=Math.max(linkage.link_confidence,0.55);}
      linkage.linked_people=safeArray(meeting?.meeting?.attendees||meeting?.relationshipContext?.attendees).map(a=>({name:a.name,email:a.email,source:'calendar_or_meeting_context'})).slice(0,20);
    }
    if(resolveIdentity){
      for(const person of linkage.linked_people.slice(0,8)){
        const resolved=await resolveIdentity({email:person.email,name:person.name}).catch(()=>null);
        if(resolved?.crm_contact_id){
          person.contactId=resolved.crm_contact_id;
          linkage.linked_crm_records.push({crm_contact_id:resolved.crm_contact_id,match_status:resolved.match_status,confidence:resolved.match_confidence});
        }
      }
    }
    if(!linkage.linked_calendar_event)linkage.unresolved_links.push('calendar_event');
    if(!linkage.linked_people.length)linkage.unresolved_links.push('people');
    return {...linkage,unknowns,transcript_id:id};
  }
  async function saveRun(row){
    const columns=['id','tenantId','userId','transcriptId','status','qualityGateJson','linkageJson','evidenceRefsJson','commitmentsJson','contextualTasksJson','relationshipSignalsJson','projectSignalsJson','capacityAndToneContextJson','courageSignalsJson','teachValCandidatesJson','readyForYouCandidatesJson','executiveInstructionsJson','chiefOfStaffSignalsJson','momentumSignalsJson','approvalPoliciesJson','unknownsJson','noActionNeededJson','finalJson','confidence','createdAt','updatedAt'];
    if(hasPg()){
      const jsonColumns=new Set(['qualityGateJson','linkageJson','evidenceRefsJson','commitmentsJson','contextualTasksJson','relationshipSignalsJson','projectSignalsJson','capacityAndToneContextJson','courageSignalsJson','teachValCandidatesJson','readyForYouCandidatesJson','executiveInstructionsJson','chiefOfStaffSignalsJson','momentumSignalsJson','approvalPoliciesJson','unknownsJson','noActionNeededJson','finalJson']);
      const values=columns.map(c=>jsonColumns.has(c)?JSON.stringify(row[c]??(/Refs|Signals|Tasks|Candidates|Instructions|Policies|Unknowns/.test(c)?[]:{})):row[c]);
      const names=columns.map(toSnake);
      const params=columns.map((_,i)=>`$${i+1}`).join(',');
      const updates=names.filter(n=>!['id','created_at'].includes(n)).map(n=>`${n}=excluded.${n}`).join(',');
      const r=await dbQuery(`insert into transcript_intelligence_runs (${names.join(',')}) values (${params}) on conflict (id) do update set ${updates} returning *`,values);
      if(!r?.rows?.[0])throw new Error('Transcript intelligence run was not saved.');
      return toCamelRow(r.rows[0]);
    }
    const s=store();const idx=s.transcriptIntelligenceRuns.findIndex(r=>r.id===row.id);
    if(idx>=0)s.transcriptIntelligenceRuns[idx]={...s.transcriptIntelligenceRuns[idx],...row,updatedAt:new Date().toISOString()};else s.transcriptIntelligenceRuns.unshift(row);
    saveStore(s);return idx>=0?s.transcriptIntelligenceRuns[idx]:row;
  }
  async function saveItem(row){
    if(hasPg()){
      const cols=['id','tenantId','userId','runId','transcriptId','category','itemType','title','summary','sourceQuote','sourceRefsJson','linkTargetsJson','approvalPolicy','requiresApproval','confidence','status','metadataJson','createdAt'];
      const jsonColumns=new Set(['sourceRefsJson','linkTargetsJson','metadataJson']);
      const values=cols.map(c=>jsonColumns.has(c)?JSON.stringify(row[c]??(c==='metadataJson'?{}:[])):row[c]);
      const names=cols.map(toSnake);
      const params=cols.map((_,i)=>`$${i+1}`).join(',');
      const r=await dbQuery(`insert into transcript_intelligence_items (${names.join(',')}) values (${params})`,values);
      if(!r?.rowCount)throw new Error('Transcript intelligence item was not saved.');
      return row;
    }
    const s=store();s.transcriptIntelligenceItems.unshift(row);saveStore(s);return row;
  }
  async function persistContinuationTasks(tasks=[],run={}){
    if(typeof createContinuationTask!=='function')return [];
    const persisted=[];
    for(const task of safeArray(tasks)){
      const linked=task.linked_context||{};
      const project=linked.project||{};
      const relationships=safeArray(linked.relationships);
      const hasPreparedWork=safeArray(task.prepared_work_ids).length>0;
      const payload={
        id:task.id||uuid('task'),
        title:task.title||'Continue transcript prepared work',
        contactName:relationships[0]?.name||relationships[0]?.email||'',
        dueDate:null,
        notes:[
          task.why||task.context_summary||(hasPreparedWork?'Continuation task created from transcript prepared work.':'Task created because the work brief is missing required information.'),
          project.name?`Project: ${project.name}${project.needs_creation?' (suggested/new project context)':''}`:'',
          task.completed_by_val?.length?'Completed by VAL:\n- '+task.completed_by_val.join('\n- '):'',
          task.remaining_context_needed?.length?'Context needed to finish:\n- '+task.remaining_context_needed.join('\n- '):'',
          'Internal VAL continuation task only. No email, CRM write, calendar write, publish, repository push, or external action happened.'
        ].filter(Boolean).join('\n\n'),
        details:[
          {text:`Created from transcript ${hasPreparedWork?'prepared work':'work brief'}: ${run.transcriptId||task.linked_context?.transcript?.id||''}`,ts:new Date().toISOString()},
          {text:`Execution level: ${task.execution_level_label||task.execution_level||'unknown'}`,ts:new Date().toISOString()},
          ...(task.prepared_work_ids||[]).map(id=>({text:`Prepared work: ${id}`,ts:new Date().toISOString()}))
        ],
        completed:false,
        createdAt:new Date().toISOString(),
        source:hasPreparedWork?'transcript_prepared_work':'transcript_work_brief_task',
        transcriptId:run.transcriptId||linked.transcript?.id||'',
        projectId:project.id||'',
        projectName:project.name||'',
        preparedWorkIds:task.prepared_work_ids||[],
        executionLevel:task.execution_level||'',
        completionStatus:task.continuation_status||'candidate',
        noExternalAction:true
      };
      const saved=await createContinuationTask(payload).catch(e=>({ok:false,error:e.message,task:payload}));
      persisted.push(saved?.task||saved||payload);
    }
    return persisted;
  }
  async function intake(input={}){
    const record=await loadTranscript(input);
    const id=String(record.id||record.transcriptId||record.transcript_id||input.transcriptId||uuid('transcript'));
    const gate=qualityGate({...record,id});
    const evidenceRefs=evidenceExtractor({...record,id});
    const linkage=await linkageResolver({...record,id});
    const unknowns=[...safeArray(linkage.unknowns)];
    if(!gate.is_usable)unknowns.push({source:'transcript_quality',reason:'Transcript was not usable enough for full intelligence extraction.'});
    const commitments=gate.is_usable?commitmentExtractor({...record,id},evidenceRefs):[];
    const contextualTasks=taskContextBuilder({...record,id},commitments);
    const relSignals=relationshipSignals({...record,id},safeArray(linkage.linked_people),commitments);
    const projSignals=projectSignals({...record,id});
    let sourceProcessingRecord=null;
    if(typeof recordSourceProcessing==='function'){
      const processed=await recordSourceProcessing({transcript:{...record,id},notify:input.notify}).catch(error=>{
        unknowns.push({source:'source_processing',reason:error.message});
        return null;
      });
      sourceProcessingRecord=processed?.sourceProcessingRecord||null;
    }
    const canonicalWorkItems=[];
    if(typeof admitCanonicalWork==='function'){
      for(const commitment of commitments){
        const admitted=await admitCanonicalWork({
          ...canonicalWorkShape(commitment,{...record,id},linkage,projSignals),
          sourceProcessingRecordId:sourceProcessingRecord?.id||'',
          notify:input.notify
        }).catch(error=>{
          unknowns.push({source:'canonical_work_admission',commitmentId:commitment.id,reason:error.message});
          return null;
        });
        if(admitted?.workItem)canonicalWorkItems.push(admitted.workItem);
      }
    }
    const capacity=capacityAndTone({...record,id});
    const courage=courageSignals({...record,id},commitments);
    const teachCandidates=teachValCandidates({...record,id});
    const executiveInstructions=executiveInstructionExtractor({...record,id},gate);
    const crmContacts=typeof listRelationshipContacts==='function'?await listRelationshipContacts({record:{...record,id},linkage,limit:80}).catch(e=>{unknowns.push({source:'relationship_contacts',reason:e.message});return [];}):[];
    const confidence=gate.quality==='high'?0.78:gate.quality==='medium'?0.62:0.45;
    const readyCandidates=followUpCandidates({...record,id},commitments,relSignals.concat(projSignals))
      .concat(transcriptMeetingOverviewPreparedWork({...record,id},commitments,relSignals,projSignals,linkage,evidenceRefs))
      .concat(preparedWorkCandidates({...record,id},executiveInstructions,linkage,evidenceRefs))
      .concat(preparedWorkCandidatesFromTasks({...record,id},contextualTasks,linkage,evidenceRefs))
      .concat(introCandidatesFromMatches({record:{...record,id},linkage,crmContacts,evidenceRefs}));
    const preparedByTaskId=new Map(readyCandidates.filter(c=>c.category==='prepared_work'&&c.continuation_task?.id).map(c=>[c.continuation_task.id,c]));
    const executionTasks=readyCandidates.filter(c=>c.continuation_task).map((candidate,i)=>({
      id:candidate.continuation_task.id||`execution_task_${i+1}`,
      title:candidate.continuation_task.title||candidate.title,
      why:compactText(candidate.category==='prepared_work'
        ? `VAL prepared work from transcript evidence and created this continuation handle: ${candidate.summary}`
        : `VAL preserved the work packet as a task because it was not complete enough for Leverage: ${candidate.summary}`,500),
      source_quote:safeArray(candidate.source_refs)[0]?.quote_or_summary||'',
      context_summary:candidate.summary,
      due_hint:'',
      execution_level:candidate.execution_level,
      execution_level_label:candidate.execution_level_label,
      autonomous_work_possible:candidate.category==='prepared_work'&&candidate.execution_level!=='level_4_human_judgment_required',
      continuation_status:candidate.completion_status==='complete_for_review'?'ready_for_review':'needs_context',
      completed_by_val:candidate.completed_by_val||[],
      remaining_context_needed:candidate.remaining_context_needed||[],
      prepared_work_ids:candidate.category==='prepared_work'?[candidate.id]:[],
      linked_context:candidate.linked_context,
      approval_policy:candidate.approval_policy||'approval_required',
      requires_approval:true,
      confidence:candidate.confidence||confidence
    }));
    for(const task of executionTasks)if(!contextualTasks.some(t=>t.id===task.id))contextualTasks.push(task);
    for(const task of contextualTasks){
      const candidate=preparedByTaskId.get(task.id);
      if(candidate)task.prepared_work_ids=[candidate.id];
    }
    const chief=chiefSignals(commitments,capacity,courage).concat(executiveInstructions.filter(i=>i.recommended_next_step==='execute_later_packet'||i.recommended_next_step==='prepare_only').slice(0,5).map(i=>({type:'executive_instruction',summary:`Authenticated user instruction: ${i.requested_action}.`,confidence:i.confidence,authorization:i.authorization})));
    const momentum=momentumSignals(commitments,projSignals,relSignals);
    const approvalPolicies=[
      ...commitments.map(c=>({target:c.id,approval_policy:c.approval_policy,reason:'Commitments must be confirmed before becoming actions.'})),
      ...executiveInstructions.map(i=>({target:i.requested_action,approval_policy:i.authorization,reason:i.authorization==='voice_authorized'?'Authenticated user directly authorized this in trusted chat/voice/transcript context.':'Instruction requires preparation, clarification, or approval before action.'})),
      ...teachCandidates.map(c=>({target:c.id,approval_policy:'approval_required',reason:'Teach VAL memory cannot be auto-committed.'})),
      ...readyCandidates.map(c=>({target:c.id,approval_policy:c.approval_policy,reason:'Prepared follow-up requires user judgment.'}))
    ];
    const noActionBase=noActionNeeded({commitments,relationshipSignalsList:relSignals,projectSignalsList:projSignals,teachCandidates});
    const noAction=executiveInstructions.length?{value:false,reason:'Transcript includes one or more explicit executive instructions.'}:noActionBase;
    const final={transcript_id:id,title:transcriptTitle(record),source_processing_record_id:sourceProcessingRecord?.id||'',canonical_work_item_ids:canonicalWorkItems.map(item=>item.id),what_changed:noAction.value?'Nothing material changed.':'Transcript produced follow-up intelligence that should be reviewed before action.',counts:{commitments:commitments.length,canonical_work_items:canonicalWorkItems.length,contextual_tasks:contextualTasks.length,relationship_signals:relSignals.length,project_signals:projSignals.length,teach_val_candidates:teachCandidates.length,ready_for_you_candidates:readyCandidates.length,executive_instructions:executiveInstructions.length,prepared_work_candidates:readyCandidates.filter(c=>c.category==='prepared_work').length,execution_continuation_tasks:executionTasks.length},no_external_action:true};
    const run=await saveRun({id:input.runId||uuid('trintel'),tenantId:tenantId(),userId:userId(),transcriptId:id,status:'completed',qualityGateJson:gate,linkageJson:linkage,evidenceRefsJson:evidenceRefs,commitmentsJson:commitments,contextualTasksJson:contextualTasks,relationshipSignalsJson:relSignals,projectSignalsJson:projSignals,capacityAndToneContextJson:capacity,courageSignalsJson:courage,teachValCandidatesJson:teachCandidates,readyForYouCandidatesJson:readyCandidates,executiveInstructionsJson:executiveInstructions,chiefOfStaffSignalsJson:chief,momentumSignalsJson:momentum,approvalPoliciesJson:approvalPolicies,unknownsJson:unknowns,noActionNeededJson:noAction,finalJson:final,confidence,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});
    const persistedContinuationTasks=await persistContinuationTasks(executionTasks,run);
    if(persistedContinuationTasks.length){
      run.finalJson={...(run.finalJson||{}),counts:{...(run.finalJson?.counts||{}),persisted_continuation_tasks:persistedContinuationTasks.length},persisted_continuation_task_ids:persistedContinuationTasks.map(t=>t.id).filter(Boolean)};
      run.contextualTasksJson=safeArray(run.contextualTasksJson).map(task=>{
        const saved=persistedContinuationTasks.find(t=>String(t.id)===String(task.id));
        return saved?{...task,persisted_task_id:saved.id,continuation_status:saved.completionStatus||task.continuation_status||'ready_for_review'}:task;
      });
      await saveRun(run);
    }
    const itemGroups=[['commitment',commitments],['contextual_task',contextualTasks],['relationship_signal',relSignals],['project_signal',projSignals],['teach_val_candidate',teachCandidates],['ready_for_you_candidate',readyCandidates],['executive_instruction',executiveInstructions],['chief_of_staff_signal',chief],['momentum_signal',momentum]];
    for(const [category,items] of itemGroups){
      for(const item of safeArray(items)){
        const linked=item.linked_context||item.prepared_artifact?.linked_context||{};
        await saveItem({id:uuid('tritem'),tenantId:tenantId(),userId:userId(),runId:run.id,transcriptId:id,category,itemType:item.type||item.instruction_type||category,title:item.title||item.requested_action||item.summary||category,summary:item.summary||item.instruction||'',sourceQuote:item.source_quote||item.authorization_quote||'',sourceRefsJson:item.source_refs||evidenceRefs.slice(0,3),linkTargetsJson:[linkage.linked_calendar_event&&{type:'calendar_event',id:linkage.linked_calendar_event},linkage.linked_meeting_prep_brief&&{type:'meeting_prep_brief',id:linkage.linked_meeting_prep_brief},linked.project&&{type:'project',id:linked.project.id||linked.project.name||'',label:linked.project.name||''},...(safeArray(linked.relationships).map(p=>({type:'relationship',id:p.contactId||p.email||p.name,label:p.name||p.email||''}))),linked.task&&{type:'task',id:linked.task.id||'',label:linked.task.title||''}].filter(Boolean),approvalPolicy:item.approval_policy||item.authorization||'approval_required',requiresApproval:item.requires_approval!==false&&item.authorization!=='voice_authorized',confidence:item.confidence||confidence,status:'candidate',metadataJson:{source:'transcript_intelligence',noExternalAction:true,executiveInstruction:category==='executive_instruction',executionLevel:item.execution_level||item.prepared_artifact?.execution_level||'',completionStatus:item.completion_status||item.prepared_artifact?.completion_status||'',preparedWorkIds:item.prepared_work_ids||[],remainingContextNeeded:item.remaining_context_needed||item.prepared_artifact?.remaining_context_needed||[],linkedContext:linked,preparedArtifact:item.prepared_artifact||null},createdAt:new Date().toISOString()});
      }
    }
    logger.log?.(`[val-transcript-intel] processed ${id}`);
    return {ok:true,run,source_processing_record:sourceProcessingRecord,canonical_work_items:canonicalWorkItems,no_action_needed:noAction,final,ready_for_you_candidates:readyCandidates,no_external_action:true};
  }
  async function getIntelligence(transcriptId){
    if(hasPg()){
      const r=await dbQuery(`select * from transcript_intelligence_runs where tenant_id=$1 and user_id=$2 and transcript_id=$3 order by created_at desc limit 1`,[tenantId(),userId(),transcriptId]);
      return r.rows[0]?toCamelRow(r.rows[0]):null;
    }
    return store().transcriptIntelligenceRuns.filter(r=>r.tenantId===tenantId()&&r.userId===userId()&&String(r.transcriptId)===String(transcriptId)).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)))[0]||null;
  }
  async function reconcileCanonicalLineage(input={}){
    const record=await loadTranscript(input);
    const id=String(record.id||record.transcriptId||record.transcript_id||input.transcriptId||'');
    if(!id)throw new Error('Transcript canonical reconciliation requires a transcript ID.');
    const existing=input.run||await getIntelligence(id);
    if(!existing)return intake({...input,transcript:{...record,id},notify:false});
    const commitments=safeArray(existing.commitmentsJson||existing.commitments_json);
    const linkage=existing.linkageJson||existing.linkage_json||{};
    const projectSignalsList=safeArray(existing.projectSignalsJson||existing.project_signals_json);
    const processed=typeof recordSourceProcessing==='function'
      ? await recordSourceProcessing({transcript:{...record,id},notify:false})
      : null;
    const canonicalWorkItems=[];
    if(typeof admitCanonicalWork==='function'){
      for(const commitment of commitments){
        const admitted=await admitCanonicalWork({
          ...canonicalWorkShape(commitment,{...record,id},linkage,projectSignalsList),
          sourceProcessingRecordId:processed?.sourceProcessingRecord?.id||'',
          notify:false
        });
        if(admitted?.workItem)canonicalWorkItems.push(admitted.workItem);
      }
    }
    return {
      ok:true,
      run:existing,
      source_processing_record:processed?.sourceProcessingRecord||null,
      canonical_work_items:canonicalWorkItems,
      reused_existing_intelligence:true,
      no_external_action:true
    };
  }
  async function prepareFollowUp(transcriptId){
    let run=await getIntelligence(transcriptId);
    if(!run){
      const result=await intake({transcriptId});
      run=result.run;
    }
    const candidates=safeArray(run.readyForYouCandidatesJson||run.ready_for_you_candidates_json);
    return {ok:true,transcriptId,ready_for_you_candidates:candidates,requires_approval:candidates.length>0,no_external_action:true};
  }
  async function listReadyForYouCandidates({limit=5}={}){
    const lim=Math.max(1,Math.min(Number(limit)||5,10));
    let rows=[];
    if(hasPg()){
      const r=await dbQuery(`select * from transcript_intelligence_runs where tenant_id=$1 and user_id=$2 and jsonb_array_length(ready_for_you_candidates_json) > 0 order by created_at desc limit $3`,[tenantId(),userId(),lim]);
      rows=(r.rows||[]).map(toCamelRow);
    }else rows=store().transcriptIntelligenceRuns.filter(r=>r.tenantId===tenantId()&&r.userId===userId()&&safeArray(r.readyForYouCandidatesJson).length).slice(0,lim);
    return rows.flatMap(run=>safeArray(run.readyForYouCandidatesJson).map(c=>({source:'transcript_intelligence',run,id:c.id,transcriptId:run.transcriptId,status:'ready_for_review',title:c.title,summary:c.summary,handoff:c,sourceRefs:c.source_refs||run.evidenceRefsJson||[],confidence:c.confidence||run.confidence||0.65,createdAt:run.createdAt}))).slice(0,lim);
  }
  return {intake,reconcileCanonicalLineage,getIntelligence,prepareFollowUp,listReadyForYouCandidates};
}

module.exports={createValTranscriptIntelligenceService,qualityGate,commitmentExtractor,taskContextBuilder,canonicalWorkShape,capacityAndTone,executiveInstructionExtractor,preparedWorkType,preparedWorkCandidates,preparedWorkCandidatesFromTasks,preparedArtifactForInstruction,preparedWorkNeedsInformationCandidate,introCandidatesFromMatches,currentContactFromLinkage};
