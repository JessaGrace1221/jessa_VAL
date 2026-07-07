function safeArray(value){return Array.isArray(value)?value:[];}
function jsonValue(value,fallback){if(value==null)return fallback;if(typeof value==='string'){try{return JSON.parse(value);}catch(_){return fallback;}}return value;}
function compactText(value,limit=900){return String(value||'').replace(/\s+/g,' ').trim().slice(0,limit);}

function safeProviderObjectLink(url=''){
  const raw=String(url||'').trim();
  if(!raw)return '';
  try{
    const parsed=new URL(raw);
    if(!['https:','http:'].includes(parsed.protocol))return '';
    const sensitive=['access_token','refresh_token','token','code','key','api_key','secret','signature','sig','auth','authorization','password'];
    for(const key of parsed.searchParams.keys()){
      if(sensitive.some(term=>String(key||'').toLowerCase().includes(term)))return '';
    }
    if(sensitive.some(term=>parsed.hash.toLowerCase().includes(term)))return '';
    return parsed.toString();
  }catch(_){
    return '';
  }
}

function sanitizeReceipt(receipt){
  if(!receipt)return null;
  const out={...receipt};
  delete out.providerPayloadJson;
  delete out.provider_payload_json;
  out.providerObjectUrl=safeProviderObjectLink(out.providerObjectUrl||out.provider_object_url);
  if(Object.hasOwn(out,'provider_object_url'))out.provider_object_url=out.providerObjectUrl;
  return out;
}

function receiptForReadyItem(item={},receipt=null){
  const decision=jsonValue(item.decisionJson||item.decision_json,{});
  const metadata=jsonValue(item.metadataJson||item.metadata_json,{});
  const sourceReceipt=receipt||null;
  const receiptId=sourceReceipt?.id||item.executionReceiptId||decision.executionReceiptId||metadata.executionReceiptId||'';
  const providerResponseId=sourceReceipt?.providerResponseId||item.providerResponseId||decision.providerResponseId||metadata.providerResponseId||'';
  const providerObjectUrl=sourceReceipt?.providerObjectUrl||item.providerObjectUrl||decision.providerObjectUrl||metadata.providerObjectUrl||'';
  const status=sourceReceipt?.status||item.lastExternalActionStatus||decision.lastExternalActionStatus||metadata.lastExternalActionStatus||'not_executed';
  return {
    has_receipt:!!receiptId,
    receipt_id:receiptId,
    status,
    provider_response_id:providerResponseId,
    provider_object_link:safeProviderObjectLink(providerObjectUrl),
    provider_response_summary:sourceReceipt?.providerResponseSummary||'',
    reconciliation_status:sourceReceipt?.reconciliationStatus||'',
    reconciliation_summary:sourceReceipt?.reconciliationSummary||''
  };
}

function approvalState(packet={}){
  const status=packet.status||'unknown';
  const policy=packet.approvalPolicy||packet.approval_policy||'approval_required';
  const voiceAuthorized=policy==='voice_authorized';
  return {
    status,
    approval_policy:policy,
    approved:status==='approved_local_only'||status==='executed'||voiceAuthorized,
    voice_authorized:voiceAuthorized,
    reviewed_at:packet.reviewedAt||packet.reviewed_at||null,
    authorization_source:packet.authorizationSource||packet.authorization_source||'',
    authorization_event_id:packet.authorizationEventId||packet.authorization_event_id||'',
    authenticated_user_confirmed:!!(packet.authenticatedUserConfirmed||packet.authenticated_user_confirmed),
    speaker_confidence:Number(packet.speakerConfidence||packet.speaker_confidence||0)
  };
}

function retryEligibility(packet={},receipt=null){
  const status=packet.status||'unknown';
  const receiptStatus=receipt?.status||'';
  const retryAllowed=!!(receipt?.retryAllowed||receipt?.retry_allowed);
  if(status==='executed'||receiptStatus==='succeeded'){
    return {
      retry_allowed:false,
      why_retry_is_allowed:'',
      why_retry_is_blocked:'The provider already confirmed execution, so retrying would risk a duplicate external action.',
      what_user_can_do_next:'Review the receipt or create a new action packet if another action is needed.'
    };
  }
  if(packet.approvalPolicy==='never_auto'||packet.approval_policy==='never_auto'){
    return {
      retry_allowed:false,
      why_retry_is_allowed:'',
      why_retry_is_blocked:'This packet is marked never_auto.',
      what_user_can_do_next:'Edit the underlying request or create a new packet with a safer approval policy.'
    };
  }
  if(retryAllowed){
    return {
      retry_allowed:true,
      why_retry_is_allowed:'The last execution attempt failed safely and the packet has not been confirmed by the provider.',
      why_retry_is_blocked:'',
      what_user_can_do_next:'Fix the provider issue or payload issue, then retry this single packet.'
    };
  }
  if(['execution_failed','execution_blocked'].includes(status)){
    return {
      retry_allowed:false,
      why_retry_is_allowed:'',
      why_retry_is_blocked:compactText(packet.failureReason||packet.failure_reason||'The last attempt was blocked and no retry permission was recorded.'),
      what_user_can_do_next:'Edit the packet or run a fresh risk check before attempting execution again.'
    };
  }
  return {
    retry_allowed:false,
    why_retry_is_allowed:'',
    why_retry_is_blocked:'No failed execution receipt is available for retry.',
    what_user_can_do_next:'Approve or execute the packet from its current state, if appropriate.'
  };
}

function stageStatus(stage,packet={},receipt=null,events=[]){
  const packetStatus=packet.status||'';
  const receiptStatus=receipt?.status||'';
  const reconciled=receipt?.reconciliationStatus||receipt?.reconciliation_status||'';
  if(stage==='planned')return packet.id?'completed':'missing';
  if(stage==='approved'){
    if(['approved_local_only','executing','executed','execution_failed','execution_blocked'].includes(packetStatus)||packet.approvalPolicy==='voice_authorized')return 'completed';
    if(packetStatus==='rejected')return 'rejected';
    return 'pending';
  }
  if(stage==='executed'){
    if(packetStatus==='executed'||receiptStatus==='succeeded')return 'completed';
    if(['failed','partial','unknown'].includes(receiptStatus)||['execution_failed','execution_blocked'].includes(packetStatus))return 'failed';
    return 'pending';
  }
  if(stage==='reconciled'){
    if(reconciled==='reconciled')return 'completed';
    if(reconciled==='partial')return 'partial';
    if(reconciled==='skipped'||safeArray(events).some(e=>e.status==='skipped'))return 'skipped';
    if(receiptStatus==='succeeded')return 'pending';
    return 'not_ready';
  }
  return 'unknown';
}

function buildExecutionTimeline({packet={},receipt=null,events=[],audit=[]}={}){
  const auditRows=safeArray(audit);
  const reconRows=safeArray(events);
  const approvedAudit=auditRows.find(a=>['approved_local_only','approved','edited'].includes(a.action));
  const executedAudit=auditRows.find(a=>a.action==='executed')||auditRows.find(a=>a.executedAt||a.executed_at);
  const latestRecon=reconRows[0]||null;
  return [
    {
      stage:'planned',
      status:stageStatus('planned',packet,receipt,reconRows),
      at:packet.createdAt||packet.created_at||null,
      summary:'External action packet was planned for later review or execution.'
    },
    {
      stage:'approved',
      status:stageStatus('approved',packet,receipt,reconRows),
      at:packet.reviewedAt||packet.reviewed_at||packet.authorizationCreatedAt||packet.authorization_created_at||approvedAudit?.createdAt||approvedAudit?.created_at||null,
      summary:packet.approvalPolicy==='voice_authorized'||packet.approval_policy==='voice_authorized'?'Authorized by authenticated executive instruction.':'Packet was approved locally or is waiting for approval.'
    },
    {
      stage:'executed',
      status:stageStatus('executed',packet,receipt,reconRows),
      at:receipt?.executedAt||receipt?.executed_at||packet.executedAt||packet.executed_at||executedAudit?.executedAt||executedAudit?.executed_at||null,
      summary:receipt?.providerResponseSummary||receipt?.provider_response_summary||packet.providerResponseSummary||packet.provider_response_summary||packet.failureReason||packet.failure_reason||'Execution has not been confirmed by a provider.'
    },
    {
      stage:'reconciled',
      status:stageStatus('reconciled',packet,receipt,reconRows),
      at:latestRecon?.createdAt||latestRecon?.created_at||receipt?.updatedAt||receipt?.updated_at||null,
      summary:receipt?.reconciliationSummary||receipt?.reconciliation_summary||'Provider state has not been reconciled back to VAL objects yet.'
    }
  ];
}

function buildExternalActionDetail({packet={},receipt=null,events=[],audit=[]}={}){
  const sanitizedReceipt=sanitizeReceipt(receipt);
  const timeline=buildExecutionTimeline({packet,receipt:sanitizedReceipt,events,audit});
  return {
    ok:true,
    packet,
    approval_state:approvalState(packet),
    execution_receipt:sanitizedReceipt,
    reconciliation_events:safeArray(events),
    retry_eligibility:retryEligibility(packet,sanitizedReceipt),
    provider_object_link:safeProviderObjectLink(sanitizedReceipt?.providerObjectUrl||packet.providerObjectUrl||packet.provider_object_url||''),
    source_refs:safeArray(packet.sourceRefsJson||packet.source_refs_json),
    timeline
  };
}

module.exports={
  safeProviderObjectLink,
  sanitizeReceipt,
  receiptForReadyItem,
  approvalState,
  retryEligibility,
  buildExecutionTimeline,
  buildExternalActionDetail
};
