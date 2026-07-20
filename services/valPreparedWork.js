function compactText(value,limit=4000){
  return String(value||'').replace(/\r\n/g,'\n').trim().slice(0,limit);
}

const PREPARED_WORK_KINDS=Object.freeze({
  email_draft:{executionPath:'review_then_send_email'},
  meeting_overview_email_draft:{executionPath:'review_then_send_email'},
  introduction_email_draft:{executionPath:'review_then_send_email'},
  proposal_draft:{executionPath:'review_then_create_crm_document'},
  agreement_draft:{executionPath:'review_then_create_document'},
  document_draft:{executionPath:'review_then_create_document'},
  copy_draft:{executionPath:'review_then_create_document'},
  invoice_draft:{executionPath:'review_then_create_crm_document'},
  calendar_invite_draft:{executionPath:'review_then_write_calendar'},
  html_page_draft:{executionPath:'review_then_publish'},
  linkedin_post_draft:{executionPath:'review_then_manual_linkedin_publish'},
  linkedin_comment_draft:{executionPath:'review_then_manual_linkedin_publish'},
  social_post_draft:{executionPath:'review_then_publish'},
  social_comment_draft:{executionPath:'review_then_publish'},
  research_brief:{executionPath:'review_research_brief'},
  code_draft:{executionPath:'review_then_export_code'},
  task_plan:{executionPath:'review_then_create_tasks'}
});

const KIND_ALIASES=Object.freeze({
  email_reply:'email_draft',
  email_response:'email_draft',
  follow_up:'email_draft',
  follow_up_email:'email_draft',
  meeting_recap:'meeting_overview_email_draft',
  transcript_action_items_email:'email_draft',
  transcript_action_items_attendee_email:'email_draft',
  introduction:'introduction_email_draft',
  intro_email:'introduction_email_draft',
  calendar_invite:'calendar_invite_draft',
  appointment_invite:'calendar_invite_draft',
  proposal:'proposal_draft',
  agreement:'agreement_draft',
  invoice:'invoice_draft',
  linkedin_post:'linkedin_post_draft',
  linkedin_comment:'linkedin_comment_draft',
  research:'research_brief',
  code:'code_draft',
  tasks:'task_plan'
});

function canonicalPreparedWorkKind(value=''){
  const clean=String(value||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'');
  const kind=KIND_ALIASES[clean]||clean;
  return PREPARED_WORK_KINDS[kind]?kind:'';
}

function inferPreparedWorkKind(...values){
  for(const value of values){
    const direct=canonicalPreparedWorkKind(value);
    if(direct)return direct;
  }
  const text=values.filter(Boolean).join(' ').toLowerCase();
  if(/introduction|intro_email/.test(text))return 'introduction_email_draft';
  if(/meeting_recap|meeting_overview/.test(text))return 'meeting_overview_email_draft';
  if(/transcript_action_items|email|reply|follow.?up/.test(text))return 'email_draft';
  if(/calendar|appointment|invite/.test(text))return 'calendar_invite_draft';
  if(/proposal/.test(text))return 'proposal_draft';
  if(/agreement|contract/.test(text))return 'agreement_draft';
  if(/invoice/.test(text))return 'invoice_draft';
  if(/linkedin.*comment|comment.*linkedin/.test(text))return 'linkedin_comment_draft';
  if(/linkedin.*post|social.*post/.test(text))return 'linkedin_post_draft';
  if(/html|landing.?page|web.?page/.test(text))return 'html_page_draft';
  if(/research/.test(text))return 'research_brief';
  if(/\bcode\b|implementation/.test(text))return 'code_draft';
  if(/task_plan|task bundle/.test(text))return 'task_plan';
  if(/document|copy/.test(text))return 'document_draft';
  return '';
}

function preparedWorkProduct(artifact={},item={}){
  const value=artifact.body||artifact.content||artifact.text||artifact.html||artifact.markdown||artifact.draft||
    item.draftBody||item.body||item.content||'';
  if(compactText(value))return compactText(value);
  const structured=[artifact.keyPoints,artifact.actionItems,artifact.tasks,artifact.sections]
    .filter(Array.isArray)
    .flat()
    .map(entry=>typeof entry==='string'?entry:JSON.stringify(entry))
    .filter(Boolean)
    .join('\n');
  return compactText(structured);
}

function preparedWorkFields(item={}){
  const metadata=item.metadataJson||item.metadata_json||item.metadata||{};
  const readiness=item.readinessJson||item.readiness_json||{};
  const artifact=item.preparedArtifact||item.prepared_artifact||metadata.preparedArtifact||metadata.prepared_artifact||{};
  const kind=canonicalPreparedWorkKind(item.preparedArtifactKind||item.prepared_artifact_kind||metadata.preparedArtifactKind||metadata.prepared_artifact_kind||readiness.prepared_artifact_kind||artifact.kind);
  const packet=item.preparedWorkPacket||item.prepared_work_packet||metadata.preparedWorkPacket||metadata.prepared_work_packet||{};
  const sourceId=String(packet.trigger_source_id||item.sourceId||item.source_id||metadata.sourceId||metadata.source_id||artifact.sourceId||artifact.source_id||item.id||'').trim();
  const product=compactText(packet.work_product||preparedWorkProduct(artifact,item));
  const canValAct=String(packet.can_val_act_status||item.canValAct||item.can_val_act||item.canValActStatus||metadata.canValAct||metadata.can_val_act||metadata.canValActStatus||'').trim().toLowerCase();
  const executionPath=String(packet.execution_path||item.executionPath||item.execution_path||metadata.executionPath||metadata.execution_path||'').trim();
  return {metadata,readiness,artifact,kind,packet,sourceId,product,canValAct,executionPath};
}

function registerPreparedWork(item={},options={}){
  const current=preparedWorkFields(item);
  const artifactInput=options.artifact||{};
  const kind=canonicalPreparedWorkKind(options.kind||artifactInput.kind||current.kind)||inferPreparedWorkKind(options.kind,item.itemType,item.type,item.draftType,options.sourceType,current.metadata.source);
  if(!kind)return item;
  const sourceId=String(options.sourceId||current.sourceId||item.id||'').trim();
  const artifact={
    ...current.artifact,
    ...artifactInput,
    id:String(artifactInput.id||current.artifact.id||item.id||sourceId||''),
    kind,
    title:compactText(artifactInput.title||artifactInput.subject||current.artifact.title||current.artifact.subject||item.title||'',500),
    reviewRequired:artifactInput.reviewRequired!==false,
    externalSend:artifactInput.externalSend===true,
    externalPublish:artifactInput.externalPublish===true,
    externalCalendarWrite:artifactInput.externalCalendarWrite===true
  };
  const product=compactText(options.workProduct||preparedWorkProduct(artifact,item));
  if(!sourceId||!product)return item;
  if(!artifact.body&&!artifact.content&&!artifact.text&&!artifact.html)artifact.content=product;
  const canValAct=String(options.canValAct||current.canValAct||'approval_required').trim().toLowerCase();
  const executionPath=String(options.executionPath||current.executionPath||PREPARED_WORK_KINDS[kind].executionPath).trim();
  const state=String(options.state||item.status||'ready_for_review').trim().toLowerCase();
  const packet={
    prepared_work_type:kind,
    trigger_source_id:sourceId,
    work_product:product,
    approval_needed:options.approvalNeeded!==false,
    execution_path:executionPath,
    can_val_act_status:canValAct
  };
  const metadata={
    ...current.metadata,
    preparedArtifactKind:kind,
    preparedArtifact:artifact,
    preparedWorkPacket:packet,
    preparedWorkState:state,
    canValAct,
    executionPath,
    sourceType:options.sourceType||current.metadata.sourceType||current.metadata.source||'',
    sourceId,
    noExternalAction:true
  };
  const readiness={
    ...current.readiness,
    prepared_artifact_kind:kind,
    prepared_work_state:state,
    can_val_act_status:canValAct
  };
  return {
    ...item,
    preparedArtifactKind:kind,
    preparedArtifact:artifact,
    preparedWorkPacket:packet,
    preparedWorkState:state,
    canValAct,
    canValActStatus:canValAct,
    executionPath,
    metadataJson:metadata,
    readinessJson:readiness
  };
}

function hydratePreparedWork(item={}){
  const fields=preparedWorkFields(item);
  if(!fields.kind){
    return {
      ...item,
      preparedArtifactKind:'',
      preparedArtifact:null,
      preparedWorkPacket:null,
      preparedWorkState:'',
      canValAct:'',
      canValActStatus:'',
      executionPath:''
    };
  }
  return {
    ...item,
    preparedArtifactKind:fields.kind,
    preparedArtifact:fields.artifact,
    preparedWorkPacket:fields.packet,
    preparedWorkState:item.preparedWorkState||fields.metadata.preparedWorkState||fields.readiness.prepared_work_state||'',
    canValAct:fields.canValAct,
    canValActStatus:fields.canValAct,
    executionPath:fields.executionPath
  };
}

function isPreparedWorkItem(item={}){
  const fields=preparedWorkFields(item);
  return Boolean(fields.kind&&fields.sourceId&&fields.product&&fields.canValAct&&fields.executionPath);
}

module.exports={
  PREPARED_WORK_KINDS,
  canonicalPreparedWorkKind,
  inferPreparedWorkKind,
  preparedWorkFields,
  registerPreparedWork,
  hydratePreparedWork,
  isPreparedWorkItem
};
