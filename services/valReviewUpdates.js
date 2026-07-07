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
  for(const key of ['proposedValueJson','existingValueJson','sourceRefsJson','evidenceRefsJson','metadataJson','beforeJson','afterJson']){
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
function stableKey(value=''){
  return String(value||'').toLowerCase().replace(/[^a-z0-9:_-]+/g,'_').slice(0,180);
}
function sensitivityOf(text=''){
  return /\b(therapy|trauma|medical|legal|lawsuit|divorce|abuse|diagnos|mental health|family|child|financial hardship|confidential|private)\b/i.test(String(text||''))?'sensitive':'normal';
}
function approvalPolicyFor(text='',preferred='approval_required'){
  if(sensitivityOf(text)==='sensitive')return 'never_auto';
  if(['auto_safe','approval_required','never_auto'].includes(preferred))return preferred;
  return 'approval_required';
}
function requiresEvidence(targetType){
  return /relationship|project|crm|teach_val|priority|rule/i.test(targetType);
}
function updateId(uuid,scope,source,targetType,targetKey,title){
  return stableKey(`review_${scope.tenantId}_${scope.userId}_${source}_${targetType}_${targetKey}_${title}`)||uuid('reviewupdate');
}
function transcriptItemCandidates(items=[],uuid,scope){
  const out=[];
  for(const item of safeArray(items)){
    const refs=safeArray(item.sourceRefsJson||item.source_refs_json).map(normalizeSourceRef);
    const text=[item.title,item.summary,item.sourceQuote].join(' ');
    const sensitivity=sensitivityOf(text);
    if(item.category==='relationship_signal'){
      out.push({
        id:updateId(uuid,scope,'transcript', 'relationship_profile', item.transcriptId||item.transcript_id||'unknown', item.title),
        targetType:'relationship_profile',
        targetKey:item.transcriptId||item.transcript_id||'unknown',
        updateType:'append_signal',
        title:item.title||'Relationship signal from transcript',
        summary:compactText(item.summary||item.sourceQuote||'',700),
        proposedValueJson:{signal:item.summary||item.sourceQuote||'',sourceQuote:item.sourceQuote||'',profileType:'person'},
        sourceRefsJson:refs,
        evidenceRefsJson:refs,
        approvalPolicy:approvalPolicyFor(text,item.approvalPolicy),
        sensitivity,
        confidence:item.confidence||0.6,
        metadataJson:{source:'transcript_intelligence',transcriptId:item.transcriptId||'',category:item.category,noExternalAction:true}
      });
    }
    if(item.category==='project_signal'){
      out.push({
        id:updateId(uuid,scope,'transcript','project_understanding',item.transcriptId||item.transcript_id||'unknown',item.title),
        targetType:'project_understanding',
        targetKey:item.transcriptId||item.transcript_id||'unknown',
        updateType:'append_project_signal',
        title:item.title||'Project signal from transcript',
        summary:compactText(item.summary||item.sourceQuote||'',700),
        proposedValueJson:{signal:item.summary||item.sourceQuote||'',sourceQuote:item.sourceQuote||'',profileType:'project'},
        sourceRefsJson:refs,
        evidenceRefsJson:refs,
        approvalPolicy:approvalPolicyFor(text,item.approvalPolicy),
        sensitivity,
        confidence:item.confidence||0.6,
        metadataJson:{source:'transcript_intelligence',transcriptId:item.transcriptId||'',category:item.category,noExternalAction:true}
      });
    }
    if(item.category==='teach_val_candidate'){
      out.push({
        id:updateId(uuid,scope,'transcript','teach_val_memory',item.transcriptId||item.transcript_id||'unknown',item.title),
        targetType:'teach_val_memory',
        targetKey:item.transcriptId||item.transcript_id||'unknown',
        updateType:'create_memory_candidate',
        title:item.title||'Teach VAL candidate from transcript',
        summary:compactText(item.summary||item.sourceQuote||'',700),
        proposedValueJson:{category:'transcript_learning',title:item.title,summary:item.summary,sourceQuote:item.sourceQuote,provenance:'transcript_intelligence'},
        sourceRefsJson:refs,
        evidenceRefsJson:refs,
        approvalPolicy:approvalPolicyFor(text,'approval_required'),
        sensitivity,
        confidence:item.confidence||0.58,
        metadataJson:{source:'transcript_intelligence',transcriptId:item.transcriptId||'',category:item.category,noExternalAction:true}
      });
    }
    if(item.category==='commitment'||item.category==='contextual_task'){
      out.push({
        id:updateId(uuid,scope,'transcript','crm_task_candidate',item.transcriptId||item.transcript_id||'unknown',item.title),
        targetType:'crm_task_candidate',
        targetKey:item.transcriptId||item.transcript_id||'unknown',
        updateType:'create_local_crm_task_candidate',
        title:item.title||'CRM task candidate from transcript',
        summary:compactText(item.summary||'',700),
        proposedValueJson:{taskTitle:item.title,why:item.summary,sourceQuote:item.sourceQuote,externalCrmMutation:false},
        sourceRefsJson:refs,
        evidenceRefsJson:refs,
        approvalPolicy:approvalPolicyFor(text,item.approvalPolicy),
        sensitivity,
        confidence:item.confidence||0.62,
        metadataJson:{source:'transcript_intelligence',transcriptId:item.transcriptId||'',category:item.category,noExternalAction:true}
      });
    }
  }
  return out;
}
function conversationCandidates(rows=[],uuid,scope){
  return safeArray(rows).map(row=>{
    const refs=safeArray(row.source_refs_json||row.sourceRefsJson||row.sourceRefs||row.source_refs).map(normalizeSourceRef);
    const summary=compactText([row.executive_meaning||row.executiveMeaning,row.why_now||row.whyNow,row.if_ignored||row.ifIgnored].filter(Boolean).join(' | '),700);
    return {
      id:updateId(uuid,scope,'conversation','priority_rule',row.unified_conversation_id||row.conversationId||row.id,summary||row.id),
      targetType:'priority_rule',
      targetKey:row.unified_conversation_id||row.conversationId||row.id||'conversation',
      updateType:'conversation_priority_candidate',
      title:`Priority rule candidate: ${row.priority_level||row.priorityLevel||'unknown'} conversation`,
      summary,
      proposedValueJson:{executiveMeaning:row.executive_meaning||row.executiveMeaning||'',priorityLevel:row.priority_level||row.priorityLevel||'',whyNow:row.why_now||row.whyNow||'',ifIgnored:row.if_ignored||row.ifIgnored||''},
      sourceRefsJson:refs,
      evidenceRefsJson:refs,
      approvalPolicy:approvalPolicyFor(summary,row.approval_policy||row.approvalPolicy),
      sensitivity:sensitivityOf(summary),
      confidence:row.confidence||0.6,
      metadataJson:{source:'conversation_classification',conversationId:row.unified_conversation_id||row.conversationId||'',noExternalAction:true}
    };
  }).filter(c=>c.summary);
}
function meetingCandidates(rows=[],uuid,scope){
  return safeArray(rows).map(row=>{
    const refs=safeArray(row.source_refs_json||row.sourceRefsJson).map(normalizeSourceRef);
    const brief=jsonValue(row.brief_json||row.briefJson,{});
    const summary=compactText(brief.concise_brief||row.summary||'',700);
    return {
      id:updateId(uuid,scope,'meeting','crm_note_candidate',row.calendar_event_id||row.calendarEventId||row.id,summary||row.id),
      targetType:'crm_note_candidate',
      targetKey:row.calendar_event_id||row.calendarEventId||row.id||'meeting',
      updateType:'create_local_crm_note_candidate',
      title:`CRM note candidate: ${brief.meeting_title||row.calendar_event_id||'Meeting prep'}`,
      summary,
      proposedValueJson:{note:summary,date:row.created_at||row.createdAt||new Date().toISOString(),source:'meeting_prep',externalCrmMutation:false},
      sourceRefsJson:refs,
      evidenceRefsJson:refs,
      approvalPolicy:approvalPolicyFor(summary,'approval_required'),
      sensitivity:sensitivityOf(summary),
      confidence:row.confidence||0.65,
      metadataJson:{source:'meeting_prep',calendarEventId:row.calendar_event_id||row.calendarEventId||'',noExternalAction:true}
    };
  }).filter(c=>c.summary);
}
function readyForYouCandidates(rows=[],uuid,scope){
  return safeArray(rows).filter(row=>['approved','ready_for_review','needs_context'].includes(row.status)).map(row=>{
    const refs=safeArray(row.source_refs_json||row.sourceRefsJson).map(normalizeSourceRef);
    const summary=compactText(row.summary||row.what_val_did||row.whatValDid||row.what_val_prepared||row.whatValPrepared||'',700);
    return {
      id:updateId(uuid,scope,'ready_for_you','do_not_do_rule',row.id,row.title),
      targetType:/do not|don.t|avoid/i.test(summary)?'do_not_do_rule':'teach_val_memory',
      targetKey:row.id,
      updateType:/do not|don.t|avoid/i.test(summary)?'do_not_do_candidate':'ready_for_you_learning_candidate',
      title:`Learning candidate from Ready For You: ${row.title||row.id}`,
      summary,
      proposedValueJson:{title:row.title,summary,source:'ready_for_you_decision',decision:row.decision_json||row.decisionJson||{}},
      sourceRefsJson:refs,
      evidenceRefsJson:refs,
      approvalPolicy:approvalPolicyFor(summary,'approval_required'),
      sensitivity:sensitivityOf(summary),
      confidence:row.confidence||0.55,
      metadataJson:{source:'ready_for_you',readyForYouItemId:row.id,noExternalAction:true}
    };
  }).filter(c=>c.summary);
}
function draftEvaluationCandidates(rows=[],uuid,scope){
  return safeArray(rows).map(row=>{
    const brief=jsonValue(row.draft_brief_json||row.draftBriefJson,{});
    const qa=jsonValue(row.qa_result_json||row.qaResultJson,{});
    const refs=safeArray(row.source_refs_json||row.sourceRefsJson).map(normalizeSourceRef);
    const issues=safeArray(qa.plainness_check?.issues||qa.issues);
    const summary=issues.length?`Avoid in drafts: ${issues.join(', ')}`:'Draft evaluation can inform communication style.';
    return {
      id:updateId(uuid,scope,'draft_eval','do_not_sound_like_rule',row.id,summary),
      targetType:'do_not_sound_like_rule',
      targetKey:row.unified_conversation_id||row.conversationId||row.id,
      updateType:'draft_style_learning_candidate',
      title:'Draft style learning candidate',
      summary,
      proposedValueJson:{singlePurpose:brief.single_purpose||'',issues,source:'email_draft_evaluation'},
      sourceRefsJson:refs,
      evidenceRefsJson:refs,
      approvalPolicy:'approval_required',
      sensitivity:sensitivityOf(summary),
      confidence:row.confidence||0.55,
      metadataJson:{source:'email_draft_evaluation',evaluationId:row.id,noExternalAction:true}
    };
  }).filter(c=>c.summary);
}
function evidenceObservationCandidates(rows=[],uuid,scope){
  return safeArray(rows).map(row=>{
    const refs=[normalizeSourceRef({sourceType:'evidence_observation',sourceId:row.id,quoteOrSummary:row.exact_quote||row.content,confidence:row.confidence||0.6})];
    const targetType=row.project_id?'project_understanding':(row.person_id||row.organization_id?'relationship_profile':'teach_val_memory');
    return {
      id:updateId(uuid,scope,'evidence',targetType,row.id,row.content),
      targetType,
      targetKey:row.project_id||row.person_id||row.organization_id||row.id,
      updateType:`evidence_${row.observation_type||row.observationType||'observation'}_candidate`,
      title:`Evidence update: ${row.observation_type||row.observationType||'observation'}`,
      summary:compactText(row.content||'',700),
      proposedValueJson:{content:row.content,exactQuote:row.exact_quote||'',observationType:row.observation_type||row.observationType||''},
      sourceRefsJson:refs,
      evidenceRefsJson:refs,
      approvalPolicy:approvalPolicyFor(row.content,'approval_required'),
      sensitivity:sensitivityOf(row.content),
      confidence:row.confidence||0.6,
      metadataJson:{source:'evidence_observation',observationId:row.id,evidenceItemId:row.evidence_item_id||row.evidenceItemId||'',noExternalAction:true}
    };
  }).filter(c=>c.summary);
}

function projectSourceInterpretationCandidate(input={},uuid,scope){
  const project=input.project||{};
  const projectId=compactText(project.projectId||project.id||input.projectId||input.targetKey||'',220);
  const projectName=compactText(project.projectName||project.name||input.projectName||projectId||'Project',180);
  const sourceType=compactText(input.sourceType||input.source_type||input.kind||'project_source_context',120);
  const sourceId=compactText(input.sourceId||input.source_id||input.id||`${projectId}:${sourceType}`,220);
  const sourceTitle=compactText(input.title||input.sourceTitle||input.summary||'',180);
  const sourceText=compactText(input.rawText||input.raw_text||input.text||input.summary||'',1200);
  const summary=compactText(input.summary||sourceText||sourceTitle,900);
  if(!projectId)throw new Error('Project source review requires a projectId.');
  if(!summary)throw new Error('Project source review requires source context.');
  const evidence=safeArray(input.evidenceRefs||input.sourceRefs).map(normalizeSourceRef);
  evidence.push(normalizeSourceRef({
    sourceType,
    sourceId,
    quoteOrSummary:summary,
    confidence:input.confidence||0.68
  }));
  const sensitivity=sensitivityOf([summary,sourceTitle,sourceType].join(' '));
  return {
    id:updateId(uuid,scope,'project_source','project_source_interpretation',projectId,`${sourceType}:${sourceId}:${summary}`),
    targetType:'project_source_interpretation',
    targetKey:projectId,
    updateType:'review_project_source_context',
    title:`Review project source: ${projectName}`,
    summary,
    proposedValueJson:{
      projectId,
      projectName,
      sourceType,
      sourceId,
      sourceTitle,
      interpretation:summary,
      boundary:'Approval records local project-source learning only. It does not create tasks, change project judgment, update relationships, write CRM, parse contracts into obligations, or send messages.',
      noExternalAction:true
    },
    sourceRefsJson:evidence,
    evidenceRefsJson:evidence,
    approvalPolicy:sensitivity==='sensitive'?'never_auto':'approval_required',
    sensitivity,
    confidence:Math.max(0.45,Math.min(1,Number(input.confidence||0.68))),
    metadataJson:{source:'project_source_review_gate',subtype:'project_source_interpretation',projectId,sourceType,noExternalAction:true}
  };
}

function projectSourceCandidatesFromMemory(rows=[],uuid,scope){
  return safeArray(rows).map(row=>{
    const metadata=jsonValue(row.metadata||row.metadataJson||row.metadata_json,{});
    const kind=row.kind||row.type||'';
    const source=metadata.source||metadata.uploadedVia||kind;
    const projectId=metadata.projectId||metadata.project_id||metadata.profileKey||'';
    if(!projectId)return null;
    if(!/hearth_project_source_upload|hearth_project_intake|project_chat_context|hearth_cowork/i.test([source,kind].join(' ')))return null;
    return projectSourceInterpretationCandidate({
      projectId,
      projectName:metadata.projectName||metadata.name||metadata.profileKey||projectId,
      sourceType:kind==='project_chat_context'?'project_chat_context':source,
      sourceId:row.id||metadata.transcriptId||metadata.conversationId||projectId,
      sourceTitle:row.summary||metadata.fileName||source,
      summary:row.summary||compactText(row.rawText||row.raw_text||'',700),
      rawText:row.rawText||row.raw_text||'',
      confidence:kind==='project_chat_context'?0.72:0.66
    },uuid,scope);
  }).filter(Boolean);
}

function projectSourceCandidatesFromEvidenceLinks(rows=[],uuid,scope){
  return safeArray(rows).filter(row=>row.relationship==='meeting_context_for_project').map(row=>{
    const metadata=jsonValue(row.metadata||row.metadataJson||row.metadata_json,{});
    const projectId=row.targetId||row.target_id||metadata.projectId||'';
    if(!projectId)return null;
    return projectSourceInterpretationCandidate({
      projectId,
      projectName:metadata.projectName||projectId,
      sourceType:'calendar_project_link',
      sourceId:row.sourceId||row.source_id||row.id||projectId,
      sourceTitle:row.sourceLabel||row.source_label||'Calendar meeting linked to project',
      summary:row.summary||`${row.sourceLabel||'Calendar meeting'} is context for ${metadata.projectName||projectId}.`,
      confidence:row.confidence||0.66
    },uuid,scope);
  }).filter(Boolean);
}

function relationshipTemperatureCorrectionCandidate(input={},uuid,scope){
  const relationship=input.relationship||{};
  const correction=compactText(input.correction||input.teaching||input.summary||'',1200);
  if(!correction)throw new Error('Relationship temperature correction is required.');
  const name=compactText(relationship.name||input.name||'Relationship',180);
  const targetKey=compactText(relationship.contactId||relationship.targetId||relationship.email||relationship.name||input.targetKey||name,220)||'relationship';
  const currentTemperature=compactText(input.currentTemperature||relationship.temperature||relationship.relationshipStateLabel||relationship.relationshipState||'',120);
  const proposedTemperature=compactText(input.proposedTemperature||input.proposedState||'',120);
  const conflict=input.temperatureConflict||relationship.temperatureConflict||null;
  const evidence=safeArray(input.evidenceRefs||input.temperatureEvidence||relationship.temperatureEvidence).map((item,index)=>normalizeSourceRef({
    sourceType:item.source_type||item.sourceType||item.observer||'relationship_temperature_evidence',
    sourceId:item.source_id||item.sourceId||item.id||`${targetKey}:${index}`,
    quoteOrSummary:item.quote_or_summary||item.quoteOrSummary||item.summary||item.signal||correction,
    confidence:item.confidence||Math.min(1,Math.max(0.45,Number(item.weight||0.65)))
  }));
  if(conflict){
    evidence.push(normalizeSourceRef({
      sourceType:'relationship_temperature_conflict',
      sourceId:`${targetKey}:temperature_conflict`,
      quoteOrSummary:conflict.reason||`Competing temperature evidence: ${conflict.challengerState||'another state'} while selected state is ${conflict.selectedState||currentTemperature||'unknown'}.`,
      confidence:conflict.confidence||0.7
    }));
  }
  if(!evidence.length){
    evidence.push(normalizeSourceRef({
      sourceType:'user_temperature_teaching',
      sourceId:`${targetKey}:manual_temperature_correction`,
      quoteOrSummary:correction,
      confidence:0.9
    }));
  }
  const summary=compactText([
    correction,
    currentTemperature?`Current temperature: ${currentTemperature}`:'',
    proposedTemperature?`Proposed temperature: ${proposedTemperature}`:'',
    conflict?.challengerState?`Competing state: ${conflict.challengerState}`:''
  ].filter(Boolean).join(' | '),900);
  return {
    id:updateId(uuid,scope,'relationship_temperature','relationship_profile',targetKey,correction),
    targetType:'relationship_profile',
    targetKey,
    updateType:'relationship_temperature_correction',
    title:`Relationship temperature correction: ${name}`,
    summary,
    proposedValueJson:{
      relationshipName:name,
      contactId:relationship.contactId||'',
      targetId:relationship.targetId||'',
      email:relationship.email||'',
      currentTemperature,
      proposedTemperature,
      correction,
      conflict,
      noExternalAction:true
    },
    sourceRefsJson:evidence,
    evidenceRefsJson:evidence,
    approvalPolicy:'approval_required',
    sensitivity:sensitivityOf(correction),
    confidence:Math.max(0.55,Math.min(1,Number(input.confidence||0.78))),
    metadataJson:{source:'hearth_relationship_temperature_teaching',subtype:'relationship_temperature_correction',noExternalAction:true}
  };
}

function transcriptProposalReviewCandidate(input={},uuid,scope){
  const proposalType=compactText(input.type||input.proposalType||'note',40)==='task'?'task':'note';
  const transcriptId=compactText(input.transcriptId||input.transcript_id||input.sourceId||'',220);
  const transcriptTitle=compactText(input.transcriptTitle||input.transcript_title||'Transcript source',220);
  const eventTitle=compactText(input.eventTitle||input.event_title||'',220);
  const project=compactText(input.project||input.projectName||'',180);
  const relationships=safeArray(input.relationships).map(item=>compactText(item,120)).filter(Boolean);
  const title=compactText(input.title||`${proposalType==='task'?'Task':'Note'} proposal from transcript`,220);
  const sourceExcerpt=compactText(input.sourceExcerpt||input.sourceQuote||input.quote||'',1200);
  const whyItMatters=compactText(input.whyItMatters||input.summary||input.reason||'',900);
  const acceptedMatches=safeArray(input.acceptedMatches).map(match=>({
    category:compactText(match.category||'',60),
    id:compactText(match.id||'',160),
    label:compactText(match.label||'',180),
    confidence:Math.max(0,Math.min(1,Number(match.confidence)||0)),
    reason:compactText(match.reason||'',420),
    acceptedAt:match.acceptedAt||new Date().toISOString(),
    localOnly:true
  })).filter(match=>match.category&&match.label);
  if(!transcriptId)throw new Error('Transcript proposal review requires a transcriptId.');
  if(!sourceExcerpt)throw new Error('Transcript proposal review requires a source excerpt.');
  const targetKey=compactText(input.id||`${transcriptId}:${proposalType}:${title}`,260);
  const summary=compactText([title,whyItMatters,sourceExcerpt].filter(Boolean).join(' | '),900);
  const evidence=safeArray(input.evidenceRefs||input.sourceRefs).map(normalizeSourceRef);
  evidence.push(normalizeSourceRef({
    sourceType:'transcript_proposal_source_excerpt',
    sourceId:transcriptId,
    quoteOrSummary:sourceExcerpt,
    confidence:input.confidence||0.72
  }));
  for(const match of acceptedMatches){
    evidence.push(normalizeSourceRef({
      sourceType:`timeline_local_${match.category}_match`,
      sourceId:match.id||`${targetKey}:${match.category}`,
      quoteOrSummary:`${match.label} — ${match.reason || 'Accepted as local review context only.'}`,
      confidence:match.confidence||0.5,
      createdAt:match.acceptedAt
    }));
  }
  const sensitivity=sensitivityOf([title,sourceExcerpt,whyItMatters].join(' '));
  return {
    id:updateId(uuid,scope,'transcript_proposal',proposalType==='task'?'transcript_task_proposal':'transcript_note_proposal',targetKey,summary),
    targetType:proposalType==='task'?'transcript_task_proposal':'transcript_note_proposal',
    targetKey,
    updateType:'review_transcript_note_task',
    title:`Review transcript ${proposalType}: ${title}`,
    summary,
    proposedValueJson:{
      proposalId:input.id||targetKey,
      proposalType,
      transcriptId,
      transcriptTitle,
      eventTitle,
      project,
      relationships,
      title,
      sourceExcerpt,
      whyItMatters,
      owner:compactText(input.owner||'',120),
      dueDate:compactText(input.dueDate||input.due_date||'',80),
      anchorStatus:input.anchorStatus||{},
      acceptedMatches,
      boundary:'Approval records a local transcript-review decision only. It does not create a note, create a task, write CRM, save durable memory, send a message, or take external action.',
      noExternalAction:true
    },
    sourceRefsJson:evidence,
    evidenceRefsJson:evidence,
    approvalPolicy:sensitivity==='sensitive'?'never_auto':'approval_required',
    sensitivity,
    confidence:Math.max(0.45,Math.min(1,Number(input.confidence||0.72))),
    metadataJson:{source:'timeline_transcript_review',subtype:'transcript_note_task_review',transcriptId,proposalType,acceptedMatches,noExternalAction:true}
  };
}

function createValReviewUpdatesService({
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
    for(const key of ['valReviewUpdates','valReviewUpdateAudit','relationshipProfiles','relationshipTimelineEvents','teachValMemoryItems','crmNoteCandidates','crmTaskCandidates','priorityRuleCandidates','doNotDoRules','doNotSoundLikeRules','transcriptReviewDecisions'])if(!Array.isArray(s[key]))s[key]=[];
    return s;
  }
  async function select(sql,params=[]){
    if(!hasPg())return [];
    const r=await dbQuery(sql,params).catch(()=>({rows:[]}));
    return r.rows||[];
  }
  async function collectCandidates(){
    const sc=scope();
    const [trItems,conv,meetings,ready,drafts,obs,memories,evidenceLinks]=hasPg()?await Promise.all([
      select(`select * from transcript_intelligence_items where tenant_id=$1 and user_id=$2 and status='candidate' order by created_at desc limit 80`,[tenantId(),userId()]),
      select(`select * from conversation_classifications where tenant_id=$1 and user_id=$2 order by created_at desc limit 30`,[tenantId(),userId()]),
      select(`select * from meeting_prep_briefs where tenant_id=$1 and user_id=$2 order by created_at desc limit 30`,[tenantId(),userId()]),
      select(`select * from ready_for_you_items where tenant_id=$1 and user_id=$2 order by created_at desc limit 50`,[tenantId(),userId()]),
      select(`select * from email_draft_evaluations where tenant_id=$1 and user_id=$2 order by created_at desc limit 30`,[tenantId(),userId()]),
      select(`select * from evidence_observations where tenant_id=$1 order by created_at desc limit 60`,[tenantId()]),
      select(`select * from val_memory_items where user_id=$1 and (kind in ('project_intake','project_chat_context','knowledge_document') or metadata->>'source' in ('hearth_project_intake','hearth_project_source_upload','hearth_cowork')) order by created_at desc limit 80`,[userId()]),
      select(`select * from val_evidence_links where tenant_id=$1 and user_id=$2 and relationship='meeting_context_for_project' order by created_at desc limit 80`,[tenantId(),userId()])
    ]):[
      store().transcriptIntelligenceItems,
      store().conversationClassifications,
      store().meetingPrepBriefs,
      store().readyForYouItems,
      store().emailDraftEvaluations,
      store().evidenceObservations,
      store().memoryItems,
      store().evidenceLinks
    ];
    return [
      ...transcriptItemCandidates(trItems,uuid,sc),
      ...conversationCandidates(conv,uuid,sc),
      ...meetingCandidates(meetings,uuid,sc),
      ...readyForYouCandidates(ready,uuid,sc),
      ...draftEvaluationCandidates(drafts,uuid,sc),
      ...evidenceObservationCandidates(obs,uuid,sc),
      ...projectSourceCandidatesFromMemory(memories,uuid,sc),
      ...projectSourceCandidatesFromEvidenceLinks(evidenceLinks,uuid,sc)
    ].filter(c=>{
      if(requiresEvidence(c.targetType)&&!safeArray(c.evidenceRefsJson).length)return false;
      if(c.sensitivity==='sensitive'&&c.approvalPolicy==='auto_safe')c.approvalPolicy='approval_required';
      return c.title&&c.summary;
    });
  }
  async function upsertCandidate(c){
    const row={tenantId:tenantId(),userId:userId(),status:'pending',existingValueJson:{},requiresApproval:c.approvalPolicy!=='auto_safe',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),reviewedAt:null,...c};
    if(hasPg()){
      const cols=['id','tenantId','userId','status','targetType','targetKey','updateType','title','summary','proposedValueJson','existingValueJson','sourceRefsJson','evidenceRefsJson','approvalPolicy','sensitivity','confidence','requiresApproval','appliedTargetId','metadataJson','createdAt','updatedAt','reviewedAt'];
      const values=cols.map(k=>row[k]);
      const names=cols.map(toSnake);
      const params=cols.map((_,i)=>`$${i+1}`).join(',');
      const updates=names.filter(n=>!['id','created_at'].includes(n)).map(n=>`${n}=excluded.${n}`).join(',');
      const r=await dbQuery(`insert into val_review_updates (${names.join(',')}) values (${params}) on conflict (id) do update set ${updates} returning *`,values);
      return toCamelRow(r.rows[0]);
    }
    const s=store();const idx=s.valReviewUpdates.findIndex(x=>x.id===row.id);
    if(idx>=0)s.valReviewUpdates[idx]={...s.valReviewUpdates[idx],...row,createdAt:s.valReviewUpdates[idx].createdAt||row.createdAt,updatedAt:new Date().toISOString()};else s.valReviewUpdates.unshift(row);
    saveStore(s);return idx>=0?s.valReviewUpdates[idx]:row;
  }
  async function audit(id,action,before={},after={},note=''){
    const row={id:uuid('reviewaudit'),tenantId:tenantId(),userId:userId(),reviewUpdateId:id,action,beforeJson:before,afterJson:after,note,externalActionTaken:false,createdAt:new Date().toISOString()};
    if(hasPg()){
      await dbQuery(`insert into val_review_update_audit (id,tenant_id,user_id,review_update_id,action,before_json,after_json,note,external_action_taken) values ($1,$2,$3,$4,$5,$6,$7,$8,false)`,[row.id,row.tenantId,row.userId,row.reviewUpdateId,row.action,JSON.stringify(row.beforeJson),JSON.stringify(row.afterJson),row.note]);
    }else{const s=store();s.valReviewUpdateAudit.unshift(row);saveStore(s);}
    return row;
  }
  async function build({limit=80}={}){
    const candidates=(await collectCandidates()).slice(0,Math.max(1,Math.min(Number(limit)||80,200)));
    const saved=[];
    for(const c of candidates)saved.push(await upsertCandidate(c));
    return {ok:true,count:saved.length,updates:saved,no_external_action:true};
  }
  async function createRelationshipTemperatureCorrection(input={}){
    const candidate=relationshipTemperatureCorrectionCandidate(input,uuid,scope());
    if(candidate.sensitivity==='sensitive')candidate.approvalPolicy='never_auto';
    const update=await upsertCandidate(candidate);
    return {ok:true,update,no_external_action:true};
  }
  async function createProjectSourceInterpretation(input={}){
    const candidate=projectSourceInterpretationCandidate(input,uuid,scope());
    const update=await upsertCandidate(candidate);
    return {ok:true,update,no_external_action:true};
  }
  async function createTranscriptProposalReview(input={}){
    const candidate=transcriptProposalReviewCandidate(input,uuid,scope());
    const update=await upsertCandidate(candidate);
    return {ok:true,update,no_external_action:true};
  }
  async function list({limit=50,status='pending'}={}){
    const lim=Math.max(1,Math.min(Number(limit)||50,200));
    if(hasPg()){
      const params=[tenantId(),userId()];
      let where='tenant_id=$1 and user_id=$2';
      if(status){params.push(status);where+=` and status=$${params.length}`;}
      const r=await dbQuery(`select * from val_review_updates where ${where} order by created_at desc limit ${lim}`,params);
      return {ok:true,updates:(r.rows||[]).map(toCamelRow)};
    }
    return {ok:true,updates:store().valReviewUpdates.filter(r=>r.tenantId===tenantId()&&r.userId===userId()&&(!status||r.status===status)).slice(0,lim)};
  }
  async function get(id){
    if(hasPg()){
      const r=await dbQuery(`select * from val_review_updates where tenant_id=$1 and user_id=$2 and id=$3`,[tenantId(),userId(),id]);
      return r.rows[0]?toCamelRow(r.rows[0]):null;
    }
    const rows=store().valReviewUpdates||[];
    return rows.find(r=>r.tenantId===tenantId()&&r.userId===userId()&&r.id===id)
      || rows.find(r=>r.tenantId===tenantId()&&r.id===id)
      || null;
  }
  async function updateReview(id,patch){
    if(hasPg()){
      const r=await dbQuery(`update val_review_updates set status=coalesce($1,status), title=coalesce($2,title), summary=coalesce($3,summary), proposed_value_json=coalesce($4,proposed_value_json), approval_policy=coalesce($5,approval_policy), metadata_json=metadata_json || coalesce($6,'{}'::jsonb), applied_target_id=coalesce($7,applied_target_id), updated_at=now(), reviewed_at=coalesce($8,reviewed_at) where tenant_id=$9 and user_id=$10 and id=$11 returning *`,[patch.status||null,patch.title||null,patch.summary||null,patch.proposedValueJson?JSON.stringify(patch.proposedValueJson):null,patch.approvalPolicy||null,patch.metadataJson?JSON.stringify(patch.metadataJson):null,patch.appliedTargetId||null,patch.reviewedAt||null,tenantId(),userId(),id]);
      return r.rows[0]?toCamelRow(r.rows[0]):null;
    }
    const s=store();const row=s.valReviewUpdates.find(r=>r.id===id&&r.tenantId===tenantId()&&r.userId===userId())
      || s.valReviewUpdates.find(r=>r.id===id&&r.tenantId===tenantId());
    if(!row)return null;
    const metadataJson=patch.metadataJson?{...(row.metadataJson||{}),...patch.metadataJson}:row.metadataJson;
    Object.assign(row,patch,{metadataJson,updatedAt:new Date().toISOString()});
    saveStore(s);return row;
  }
  async function applyLocal(update){
    const value=update.proposedValueJson||{};
    if(update.approvalPolicy==='never_auto')throw new Error('This update is marked never_auto and cannot be applied without a more explicit correction flow.');
    if(requiresEvidence(update.targetType)&&!safeArray(update.evidenceRefsJson).length)throw new Error('Relationship/project/CRM/Teach VAL updates require evidence refs.');
    if(update.updateType==='relationship_temperature_correction'){
      const title=value.relationshipName?`Relationship temperature correction: ${value.relationshipName}`:update.title;
      const data={...value,reviewUpdateId:update.id,provenance:update.metadataJson,sourceRefs:update.sourceRefsJson,evidenceRefs:update.evidenceRefsJson,doesNotDirectlyChangeTemperature:true};
      if(hasPg()){
        const id=uuid('tvmem');
        await dbQuery(`insert into teach_val_memory_items (id,session_id,tenant_id,user_id,category,title,summary,source,confidence,data_json) values ($1,$2,$3,$4,'relationship_temperature_correction',$5,$6,'review_update',$7,$8)`,[id,'review_updates',tenantId(),userId(),title,update.summary||value.correction||'',update.confidence||0.6,JSON.stringify(data)]);
        return id;
      }
      const s=store();const id=uuid('tvmem');
      s.teachValMemoryItems.unshift({id,sessionId:'review_updates',tenantId:tenantId(),userId:userId(),category:'relationship_temperature_correction',title,summary:update.summary||value.correction||'',source:'review_update',confidence:update.confidence||0.6,dataJson:data,createdAt:new Date().toISOString()});
      saveStore(s);return id;
    }
    if(update.updateType==='review_project_source_context'){
      const title=value.projectName?`Project source review: ${value.projectName}`:update.title;
      const data={...value,reviewUpdateId:update.id,provenance:update.metadataJson,sourceRefs:update.sourceRefsJson,evidenceRefs:update.evidenceRefsJson,doesNotChangeProjectJudgment:true,doesNotCreateTasks:true,doesNotUpdateRelationships:true,doesNotParseContractsIntoObligations:true,noExternalAction:true};
      if(hasPg()){
        const id=uuid('tvmem');
        await dbQuery(`insert into teach_val_memory_items (id,session_id,tenant_id,user_id,category,title,summary,source,confidence,data_json) values ($1,$2,$3,$4,'project_source_interpretation',$5,$6,'review_update',$7,$8)`,[id,'review_updates',tenantId(),userId(),title,update.summary||value.interpretation||'',update.confidence||0.6,JSON.stringify(data)]);
        return id;
      }
      const s=store();const id=uuid('tvmem');
      s.teachValMemoryItems.unshift({id,sessionId:'review_updates',tenantId:tenantId(),userId:userId(),category:'project_source_interpretation',title,summary:update.summary||value.interpretation||'',source:'review_update',confidence:update.confidence||0.6,dataJson:data,createdAt:new Date().toISOString()});
      saveStore(s);return id;
    }
    if(update.updateType==='review_transcript_note_task'){
      const id=`transcriptreview_${stableKey(update.id)}`;
      if(hasPg())return id;
      const s=store();
      s.transcriptReviewDecisions.unshift({
        id,
        tenantId:tenantId(),
        userId:userId(),
        status:'approved_local_review_only',
        title:update.title,
        summary:update.summary,
        proposedValue:value,
        sourceRefs:update.sourceRefsJson,
        evidenceRefs:update.evidenceRefsJson,
        doesNotCreateNote:true,
        doesNotCreateTask:true,
        doesNotWriteCrm:true,
        doesNotSaveDurableMemory:true,
        doesNotSendMessage:true,
        noExternalAction:true,
        createdAt:new Date().toISOString()
      });
      saveStore(s);return id;
    }
    if(update.targetType==='relationship_profile'||update.targetType==='project_understanding'){
      const profileType=update.targetType==='project_understanding'?'project':'person';
      const profileKey=`${profileType}:${stableKey(update.targetKey||update.title)}`;
      const display=value.displayName||update.title;
      if(hasPg()){
        const profileId=`profile_${stableKey(profileKey)}`;
        await dbQuery(`insert into relationship_profiles (id,tenant_id,profile_type,profile_key,display_name,summary,relationship_status,confidence,last_observed_at,metadata_json)
          values ($1,$2,$3,$4,$5,$6,'observed',$7,now(),$8)
          on conflict (tenant_id,profile_type,profile_key) do update set summary=trim(both E'\\n' from relationship_profiles.summary || E'\\n' || excluded.summary), confidence=greatest(relationship_profiles.confidence,excluded.confidence), last_observed_at=now(), metadata_json=relationship_profiles.metadata_json || excluded.metadata_json, updated_at=now()`,
          [profileId,tenantId(),profileType,profileKey,display,update.summary||value.signal||'',update.confidence||0.6,JSON.stringify({source:'review_update',reviewUpdateId:update.id})]);
        return profileId;
      }
      const s=store();const id=`profile_${stableKey(profileKey)}`;
      const existing=s.relationshipProfiles.find(p=>p.profileKey===profileKey&&p.tenantId===tenantId());
      if(existing){existing.summary=compactText([existing.summary,update.summary].filter(Boolean).join('\n'),4000);existing.confidence=Math.max(Number(existing.confidence||0),Number(update.confidence||0));existing.updatedAt=new Date().toISOString();saveStore(s);return existing.id;}
      s.relationshipProfiles.unshift({id,tenantId:tenantId(),profileType,profileKey,displayName:display,summary:update.summary||'',relationshipStatus:'observed',confidence:update.confidence||0.6,metadataJson:{source:'review_update',reviewUpdateId:update.id},createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});saveStore(s);return id;
    }
    if(update.targetType==='teach_val_memory'||/rule$/.test(update.targetType)){
      const category=update.targetType==='teach_val_memory'?'review_confirmed_learning':update.targetType;
      const title=value.title||update.title;
      if(hasPg()){
        const id=uuid('tvmem');
        await dbQuery(`insert into teach_val_memory_items (id,session_id,tenant_id,user_id,category,title,summary,source,confidence,data_json) values ($1,$2,$3,$4,$5,$6,$7,'review_update',$8,$9)`,[id,'review_updates',tenantId(),userId(),category,title,update.summary||value.summary||'',update.confidence||0.6,JSON.stringify({...value,reviewUpdateId:update.id,provenance:update.metadataJson})]);
        return id;
      }
      const s=store();const id=uuid('tvmem');s.teachValMemoryItems.unshift({id,sessionId:'review_updates',tenantId:tenantId(),userId:userId(),category,title,summary:update.summary||value.summary||'',source:'review_update',confidence:update.confidence||0.6,dataJson:{...value,reviewUpdateId:update.id,provenance:update.metadataJson},createdAt:new Date().toISOString()});saveStore(s);return id;
    }
    if(update.targetType==='crm_note_candidate'||update.targetType==='crm_task_candidate'){
      const key=update.targetType==='crm_note_candidate'?'crmNoteCandidates':'crmTaskCandidates';
      const s=store();const id=uuid(update.targetType==='crm_note_candidate'?'crmnote':'crmtask');
      s[key].unshift({id,tenantId:tenantId(),userId:userId(),status:'approved_local_only',title:update.title,summary:update.summary,proposedValue:value,sourceRefs:update.sourceRefsJson,evidenceRefs:update.evidenceRefsJson,externalCrmMutation:false,createdAt:new Date().toISOString()});
      saveStore(s);return id;
    }
    return '';
  }
  async function approve(id,{note=''}={}){
    const before=await get(id);if(!before)return null;
    const appliedTargetId=await applyLocal(before);
    const after=await updateReview(id,{status:'approved',appliedTargetId,reviewedAt:new Date().toISOString(),metadataJson:{approvedLocalOnly:true,externalActionTaken:false}});
    await audit(id,'approved',before,after,note);
    return after;
  }
  async function reject(id,{reason=''}={}){
    const before=await get(id);if(!before)return null;
    const after=await updateReview(id,{status:'rejected',reviewedAt:new Date().toISOString(),metadataJson:{rejectReason:reason,externalActionTaken:false}});
    await audit(id,'rejected',before,after,reason);
    return after;
  }
  async function edit(id,changes={}){
    const before=await get(id);if(!before)return null;
    const patch={title:changes.title,summary:changes.summary,proposedValueJson:changes.proposedValueJson||changes.proposed_value_json,approvalPolicy:changes.approvalPolicy||changes.approval_policy,metadataJson:{edited:true,editNote:changes.note||''}};
    const after=await updateReview(id,patch);
    await audit(id,'edited',before,after,changes.note||'');
    return after;
  }
  return {build,list,approve,reject,edit,collectCandidates,createRelationshipTemperatureCorrection,createProjectSourceInterpretation,createTranscriptProposalReview};
}

module.exports={createValReviewUpdatesService,approvalPolicyFor,sensitivityOf,relationshipTemperatureCorrectionCandidate,projectSourceInterpretationCandidate,transcriptProposalReviewCandidate};
