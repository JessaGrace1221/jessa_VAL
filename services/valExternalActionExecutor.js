const {riskFromText}=require('./valExternalActions');

function safeArray(value){return Array.isArray(value)?value:[];}
function jsonValue(value,fallback){if(value==null)return fallback;if(typeof value==='string'){try{return JSON.parse(value);}catch(_){return fallback;}}return value;}
function compactText(value,limit=900){return String(value||'').replace(/\s+/g,' ').trim().slice(0,limit);}
function nowIso(){return new Date().toISOString();}
function idempotencyKey(packet={}){
  return ['val_ext_action',packet.id,packet.actionType,packet.targetSystem,packet.targetId].map(v=>String(v||'').toLowerCase().replace(/[^a-z0-9:_-]+/g,'_')).join(':').slice(0,240);
}
function isExpired(packet={}){
  if(!packet.expiresAt&&!packet.expires_at)return false;
  const d=new Date(packet.expiresAt||packet.expires_at);
  return !isNaN(d.getTime())&&d.getTime()<Date.now();
}
function sourceContext(packet={}){return jsonValue(packet.sourceContextJson||packet.source_context_json,{});}
function payload(packet={}){return jsonValue(packet.payloadPreviewJson||packet.payload_preview_json,{});}
function sourceAmbiguity(packet={}){
  const ctx=sourceContext(packet);
  const auth=ctx.authorization||ctx.authorizationJson||{};
  return safeArray(auth.ambiguity).concat(safeArray(ctx.ambiguity),safeArray(payload(packet).ambiguity));
}
function blockingSafety(packet={},opts={}){
  const ctx=sourceContext(packet);
  const auth=ctx.authorization||ctx.authorizationJson||{};
  const text=[packet.actionType,packet.whyThisActionExists,JSON.stringify(payload(packet)),JSON.stringify(ctx)].join(' ');
  const blocks=safeArray(auth.blocking_safety_rules).concat(safeArray(ctx.blockingSafetyRules),safeArray(payload(packet).blockingSafetyRules));
  if(/\b(bulk|all contacts|all clients|everyone|entire list)\b/i.test(text))blocks.push('bulk_external_action');
  if(packet.actionType==='send_sms'&&packet.approvalPolicy!=='voice_authorized'&&!opts.finalConfirmation&&!opts.final_confirmation)blocks.push('final_send_confirmation_required');
  if(['send_invoice','send_proposal','publish_content','move_crm_stage','add_or_remove_tag'].includes(packet.actionType)&&packet.approvalPolicy!=='voice_authorized')blocks.push('unsupported_or_requires_future_confirmation');
  if(packet.actionType==='send_email'&&packet.approvalPolicy!=='voice_authorized'&&!opts.finalConfirmation&&!opts.final_confirmation)blocks.push('final_send_confirmation_required');
  if(['charge_money','delete_record','merge_contacts'].includes(packet.actionType))blocks.push('never_auto_action');
  return [...new Set(blocks.filter(Boolean))];
}
function supportedActions(){
  return ['create_gmail_draft','create_outlook_draft','send_email','send_sms','create_crm_note','create_crm_task','create_calendar_hold','append_google_doc'];
}
function blockedActions(){
  return ['send_proposal','send_invoice','charge_money','publish_content','move_crm_stage','merge_contacts','delete_record','add_or_remove_tag','send_calendar_invite'];
}
function validatePayload(packet={}){
  const p=payload(packet);
  const missing=[];
  if(!packet.targetSystem)missing.push('target_system');
  if(!packet.actionType)missing.push('action_type');
  if(['create_gmail_draft','create_outlook_draft'].includes(packet.actionType)){
    if(!p.subject)missing.push('payload.subject');
    if(!p.body&&!p.bodyPreview)missing.push('payload.body');
  }
  if(packet.actionType==='send_email'){
    if(!p.to)missing.push('payload.to');
    if(!p.subject)missing.push('payload.subject');
    if(!p.body&&!p.bodyPreview)missing.push('payload.body');
  }
  if(packet.actionType==='send_sms'){
    if(!packet.targetId&&!p.contactId&&!p.conversationId)missing.push('target_id_or_contact_id');
    if(!p.message&&!p.body&&!p.text)missing.push('payload.message');
  }
  if(packet.actionType==='create_crm_note'){
    if(!packet.targetId)missing.push('target_id');
    if(!p.note&&!p.body&&!packet.whyThisActionExists)missing.push('payload.note');
  }
  if(packet.actionType==='create_crm_task'){
    if(!packet.targetId)missing.push('target_id');
    if(!p.title&&!packet.whyThisActionExists)missing.push('payload.title');
  }
  if(packet.actionType==='create_calendar_hold'){
    if(!p.start&&!p.scheduledStart)missing.push('payload.start');
    if(!p.end&&!p.scheduledEnd&&!p.durationMinutes)missing.push('payload.end_or_duration');
  }
  if(packet.actionType==='append_google_doc'){
    if(!packet.targetId&&!p.documentId)missing.push('target_id_or_document_id');
    if(!p.content&&!p.body&&!p.bodyPreview)missing.push('payload.content');
  }
  return missing;
}
function freshRiskCheck(packet={},opts={}){
  const p=payload(packet),ctx=sourceContext(packet);
  const risk=riskFromText([packet.actionType,packet.targetSystem,packet.whyThisActionExists,packet.authorizationQuote,JSON.stringify(p)].join(' '));
  const blocking=blockingSafety(packet,opts);
  const ambiguity=sourceAmbiguity(packet);
  const missing=validatePayload(packet);
  const expired=isExpired(packet);
  const supported=supportedActions().includes(packet.actionType);
  const blocked=blockedActions().includes(packet.actionType)||packet.approvalPolicy==='never_auto'||blocking.includes('never_auto_action');
  const approved=packet.status==='approved_local_only'||packet.approvalPolicy==='voice_authorized'||packet.approvalPolicy==='preauthorized';
  const executed=packet.status==='executed'||!!packet.executedAt||!!packet.executed_at;
  const highRisk=risk.riskLevel==='high'||packet.riskLevel==='high'||packet.financialOrLegalRisk==='high'||packet.representationRisk==='high';
  const finalConfirmationRequired=highRisk&&packet.approvalPolicy!=='voice_authorized';
  const finalConfirmed=!!opts.finalConfirmation||!!opts.final_confirmation;
  const errors=[];
  if(executed)errors.push('already_executed');
  if(!approved)errors.push('not_approved_for_execution');
  if(expired)errors.push('expired_packet');
  errors.push(...blocking);
  if(blocked)errors.push('blocked_action');
  if(!supported)errors.push('unsupported_adapter');
  if(ambiguity.length)errors.push('ambiguous_packet');
  if(missing.length)errors.push('invalid_payload');
  if(finalConfirmationRequired&&!finalConfirmed)errors.push('final_confirmation_required');
  return {
    ok:errors.length===0,
    errors,
    risk,
    risk_level:risk.riskLevel,
    blocking_safety_rules:blocking,
    ambiguity,
    missing,
    supported,
    blocked,
    expired,
    approved,
    executed,
    final_confirmation_required:finalConfirmationRequired,
    idempotency_key:idempotencyKey(packet),
    checked_at:nowIso(),
    source_context:ctx
  };
}
function providerSummary(result={}){
  return compactText(result.providerResponseSummary||result.summary||result.content||result.message||JSON.stringify(result).slice(0,800),900);
}
async function executeWithAdapter(packet,adapters={}){
  const p=payload(packet),action=packet.actionType;
  const adapter=adapters[action];
  if(typeof adapter!=='function')throw new Error(`Provider adapter unavailable for ${action}`);
  return adapter({packet,payload:p,idempotencyKey:idempotencyKey(packet)});
}
function createValExternalActionExecutor({packetService,receiptService=null,adapters={},executedBy=()=>'val_executor'}={}){
  if(!packetService)throw new Error('packetService is required');
  async function freshRiskCheckById(id,opts={}){
    const packet=await packetService.get(id);
    if(!packet)return null;
    const check=freshRiskCheck(packet,opts);
    await packetService.audit(id,'fresh_risk_check',packet,{...packet,lastRiskCheck:check},check.ok?'passed':'failed').catch(()=>{});
    return {ok:true,packet,risk_check:check,execution_available:check.ok};
  }
  async function execute(id,opts={}){
    const before=await packetService.get(id);
    if(!before)return null;
    const dependencyId=sourceContext(before).dependsOnPacketId||sourceContext(before).depends_on_packet_id||'';
    if(dependencyId){
      const dependency=await packetService.get(dependencyId);
      if(!dependency||dependency.status!=='executed'){
        const attemptedAt=nowIso();
        const failed=await packetService.updatePacket(id,{
          status:'execution_blocked',
          attemptedAt,
          failureReason:'prior_action_not_completed',
          retryCount:Number(before.retryCount||0),
          idempotencyKey:idempotencyKey(before),
          executedBy:opts.executedBy||opts.executed_by||executedBy()
        });
        await packetService.audit(id,'execution_blocked',before,failed,'prior_action_not_completed');
        return {
          ok:false,
          packet:failed,
          risk_check:{ok:false,errors:['prior_action_not_completed'],dependencyPacketId:dependencyId},
          executed:false
        };
      }
    }
    const check=freshRiskCheck(before,opts);
    const attemptedAt=nowIso(),key=check.idempotency_key,actor=opts.executedBy||opts.executed_by||executedBy();
    if(!check.ok){
      const failed=await packetService.updatePacket(id,{status:before.status==='executed'?'executed':'execution_blocked',attemptedAt,failureReason:check.errors.join(', '),retryCount:Number(before.retryCount||0),idempotencyKey:key,executedBy:actor});
      await packetService.audit(id,'execution_blocked',before,failed,check.errors.join(', '));
      const receipt=receiptService?await receiptService.createReceipt({packet:failed,error:check.errors.join(', ')}).catch(()=>null):null;
      return {ok:false,packet:failed,risk_check:check,receipt,executed:false};
    }
    const attempting=await packetService.updatePacket(id,{status:'executing',attemptedAt,failureReason:'',retryCount:Number(before.retryCount||0),idempotencyKey:key,executedBy:actor});
    await packetService.audit(id,'execution_attempted',before,attempting,'Fresh risk check passed; attempting supported adapter.');
    try{
      const result=await executeWithAdapter(attempting,adapters);
      const after=await packetService.updatePacket(id,{
        status:'executed',
        executedAt:nowIso(),
        providerResponseId:String(result.providerResponseId||result.id||result.draftId||result.eventId||result.taskId||''),
        providerResponseSummary:providerSummary(result),
        failureReason:'',
        retryCount:Number(attempting.retryCount||0),
        idempotencyKey:key,
        executedBy:actor
      });
      await packetService.audit(id,'executed',attempting,after,providerSummary(result));
      const receipt=receiptService?await receiptService.createReceipt({packet:after,providerResult:result}).catch(()=>null):null;
      const reconciliation=receipt&&receiptService?await receiptService.reconcile(receipt,{packet:after}).catch(e=>({ok:false,error:e.message})):null;
      return {ok:true,packet:after,risk_check:check,provider_result:result,receipt,reconciliation,executed:true};
    }catch(e){
      const retryCount=Number(attempting.retryCount||0)+1;
      const failed=await packetService.updatePacket(id,{status:'execution_failed',failureReason:e.message||'Execution failed',retryCount,idempotencyKey:key,executedBy:actor});
      await packetService.audit(id,'execution_failed',attempting,failed,e.message||'Execution failed');
      const receipt=receiptService?await receiptService.createReceipt({packet:failed,error:e.message||'Execution failed'}).catch(()=>null):null;
      return {ok:false,packet:failed,risk_check:check,error:e.message,receipt,executed:false};
    }
  }
  async function retry(id,opts={}){
    const packet=await packetService.get(id);
    if(!packet)return null;
    if(packet.status!=='execution_failed'&&packet.status!=='execution_blocked')return {ok:false,packet,error:'Only failed or blocked packets can be retried safely.'};
    if(/already_executed|expired|never_auto|bulk|ambiguous/i.test(packet.failureReason||''))return {ok:false,packet,error:'Retry is not allowed for this failure reason.'};
    await packetService.audit(id,'retry_requested',packet,{...packet,status:'approved_local_only'},opts.reason||'Retry requested.');
    await packetService.updatePacket(id,{status:'approved_local_only',failureReason:'',retryCount:Number(packet.retryCount||0)});
    return execute(id,{...opts,finalConfirmation:opts.finalConfirmation});
  }
  return {freshRiskCheck:freshRiskCheckById,execute,retry,supportedActions,blockedActions};
}

module.exports={createValExternalActionExecutor,freshRiskCheck,supportedActions,blockedActions,idempotencyKey};
