function safeArray(value){return Array.isArray(value)?value:[];}
function jsonValue(value,fallback){if(value==null)return fallback;if(typeof value==='string'){try{return JSON.parse(value);}catch(_){return fallback;}}return value;}
function compactText(value,limit=900){return String(value||'').replace(/\s+/g,' ').trim().slice(0,limit);}
function toSnake(key){return key.replace(/[A-Z]/g,m=>'_'+m.toLowerCase());}
function toCamelRow(row={}){
  const out={};
  for(const [k,v] of Object.entries(row||{})){
    const camel=k.replace(/_([a-z])/g,(_,c)=>c.toUpperCase());
    out[camel]=v instanceof Date?v.toISOString():v;
  }
  for(const key of ['sourceRefsJson','auditRefsJson','providerPayloadJson','beforeJson','afterJson']){
    if(Object.hasOwn(out,key))out[key]=jsonValue(out[key],/refs/i.test(key)?[]:{});
  }
  return out;
}
function providerObjectUrl(packet={},providerResult={}){
  return providerResult.providerObjectUrl||providerResult.webLink||providerResult.url||providerResult.raw?.webLink||providerResult.raw?.htmlLink||'';
}
function receiptStatus({executed=false,error='',packet={}}={}){
  if(executed&&packet.providerResponseId)return 'succeeded';
  if(executed)return 'unknown';
  if(error||packet.failureReason)return 'failed';
  return 'unknown';
}
function retryAllowedFor(packet={},status='unknown'){
  if(status!=='failed')return false;
  if(packet.approvalPolicy==='never_auto')return false;
  if(packet.status==='executed')return false;
  if(/already_executed|expired|never_auto|bulk|ambiguous/i.test(packet.failureReason||''))return false;
  return ['execution_failed','execution_blocked','approved_local_only'].includes(packet.status);
}
function providerReceiptSummary(packet={},providerResult={},status='unknown'){
  if(status==='failed')return packet.failureReason||'Execution failed safely.';
  const action=packet.actionType;
  if(action==='create_gmail_draft')return 'Gmail draft created.';
  if(action==='create_outlook_draft')return 'Outlook draft created.';
  if(action==='create_crm_note')return 'CRM note created.';
  if(action==='create_crm_task')return 'CRM task created.';
  if(action==='create_calendar_hold')return 'Calendar hold created.';
  return compactText(providerResult.providerResponseSummary||packet.providerResponseSummary||'Provider action completed.',900);
}
function buildReceipt({uuid,scope,packet={},providerResult={},error='',auditRefs=[]}){
  const status=receiptStatus({executed:packet.status==='executed'||!!packet.executedAt,packet,error});
  return {
    id:`receipt_${packet.id}`,
    tenantId:scope.tenantId,
    userId:scope.userId,
    packetId:packet.id,
    actionType:packet.actionType,
    targetSystem:packet.targetSystem,
    providerResponseId:packet.providerResponseId||providerResult.providerResponseId||providerResult.id||'',
    providerObjectUrl:providerObjectUrl(packet,providerResult),
    providerResponseSummary:providerReceiptSummary(packet,providerResult,status),
    executedAt:packet.executedAt||packet.executed_at||null,
    executedBy:packet.executedBy||packet.executed_by||'',
    status,
    failureReason:packet.failureReason||error||'',
    retryAllowed:retryAllowedFor(packet,status),
    sourceRefsJson:safeArray(packet.sourceRefsJson||packet.source_refs_json),
    auditRefsJson:safeArray(auditRefs),
    reconciliationStatus:'pending',
    reconciliationSummary:'',
    providerPayloadJson:providerResult.raw||providerResult||{},
    createdAt:new Date().toISOString(),
    updatedAt:new Date().toISOString()
  };
}
function contextTargets(packet={}){
  const ctx=jsonValue(packet.sourceContextJson||packet.source_context_json,{});
  const readyForYouItemId=ctx.readyForYouItemId||ctx.readyForYouId||ctx.ready_for_you_item_id||ctx.ready_for_you_id;
  return [
    readyForYouItemId&&{table:'ready_for_you_items',id:readyForYouItemId,type:'source_context'},
    ctx.reviewUpdateId&&{table:'val_review_updates',id:ctx.reviewUpdateId,type:'source_context'},
    ctx.conversationId&&{table:'conversation_classifications',id:ctx.conversationId,type:'source_context'},
    ctx.meetingPrepBriefId&&{table:'meeting_prep_briefs',id:ctx.meetingPrepBriefId,type:'source_context'},
    ctx.transcriptIntelligenceRunId&&{table:'transcript_intelligence_items',id:ctx.transcriptIntelligenceRunId,type:'source_context'},
    ctx.draftId&&{table:'drafts',id:ctx.draftId,type:'source_context'},
    {table:'val_external_action_packets',id:packet.id,type:'packet'}
  ].filter(Boolean);
}
function createValExecutionReceiptService({
  dbQuery,
  hasPg=()=>false,
  getStore=()=>({}),
  saveStore=()=>{},
  uuid=(prefix)=>`${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`,
  tenantId=()=>'default',
  userId=()=>'default'
}={}){
  function scope(){return {tenantId:tenantId(),userId:userId()};}
  function store(){
    const s=getStore()||{};
    for(const key of ['valExecutionReceipts','valExecutionReconciliationEvents','valExternalActionPackets','readyForYouItems','valReviewUpdates','drafts','meetingPrepBriefs','transcriptIntelligenceItems','conversationClassifications'])if(!Array.isArray(s[key]))s[key]=[];
    return s;
  }
  async function saveReceipt(row){
    if(hasPg()){
      const cols=['id','tenantId','userId','packetId','actionType','targetSystem','providerResponseId','providerObjectUrl','providerResponseSummary','executedAt','executedBy','status','failureReason','retryAllowed','sourceRefsJson','auditRefsJson','reconciliationStatus','reconciliationSummary','providerPayloadJson','createdAt','updatedAt'];
      const jsonColumns=new Set(['sourceRefsJson','auditRefsJson','providerPayloadJson']);
      const values=cols.map(c=>jsonColumns.has(c)
        ?JSON.stringify(row[c]??(c==='providerPayloadJson'?{}:[]))
        :(row[c]??null));
      const names=cols.map(toSnake);
      const params=cols.map((_,i)=>`$${i+1}`).join(',');
      const updates=names.filter(n=>!['id','created_at'].includes(n)).map(n=>`${n}=excluded.${n}`).join(',');
      const r=await dbQuery(`insert into val_execution_receipts (${names.join(',')}) values (${params}) on conflict (id) do update set ${updates} returning *`,values);
      if(!r?.rows?.[0])throw new Error('VAL could not save the external action receipt.');
      return toCamelRow(r.rows[0]);
    }
    const s=store();const idx=s.valExecutionReceipts.findIndex(r=>r.id===row.id);
    if(idx>=0)s.valExecutionReceipts[idx]={...s.valExecutionReceipts[idx],...row,updatedAt:new Date().toISOString()};else s.valExecutionReceipts.unshift(row);
    saveStore(s);return idx>=0?s.valExecutionReceipts[idx]:row;
  }
  async function saveEvent(row){
    if(hasPg()){
      const cols=['id','tenantId','userId','receiptId','packetId','targetTable','targetId','reconciliationType','status','summary','beforeJson','afterJson','createdAt'];
      const jsonColumns=new Set(['beforeJson','afterJson']);
      const values=cols.map(c=>jsonColumns.has(c)?JSON.stringify(row[c]??{}):(row[c]??null));
      const names=cols.map(toSnake);
      const params=cols.map((_,i)=>`$${i+1}`).join(',');
      const result=await dbQuery(`insert into val_execution_reconciliation_events (${names.join(',')}) values (${params})`,values);
      if(!result?.rowCount)throw new Error('VAL could not save the execution reconciliation event.');
      return row;
    }
    const s=store();s.valExecutionReconciliationEvents.unshift(row);saveStore(s);return row;
  }
  async function markLocalTarget(target,receipt,packet){
    const s=store();
    const keyMap={
      ready_for_you_items:'readyForYouItems',
      val_review_updates:'valReviewUpdates',
      drafts:'drafts',
      meeting_prep_briefs:'meetingPrepBriefs',
      transcript_intelligence_items:'transcriptIntelligenceItems',
      conversation_classifications:'conversationClassifications',
      val_external_action_packets:'valExternalActionPackets'
    };
    const arr=s[keyMap[target.table]]||[];
    const row=arr.find(item=>String(item.id||item.conversationId||item.unifiedConversationId)===String(target.id));
    const before=row?JSON.parse(JSON.stringify(row)):{};
    if(row){
      row.executionReceiptId=receipt.id;
      row.providerResponseId=receipt.providerResponseId;
      row.providerObjectUrl=receipt.providerObjectUrl;
      row.lastExternalActionStatus=receipt.status;
      if(['ready_for_you_items','val_review_updates','drafts','meeting_prep_briefs','transcript_intelligence_items'].includes(target.table)&&receipt.status==='succeeded')row.status=row.status==='executed'?'executed':'executed';
      row.updatedAt=new Date().toISOString();
    }
    saveStore(s);
    return {before,after:row||{}};
  }
  async function markPgTarget(target,receipt){
    const table=target.table;
    const id=target.id;
    const metadata={executionReceiptId:receipt.id,providerResponseId:receipt.providerResponseId,providerObjectUrl:receipt.providerObjectUrl,lastExternalActionStatus:receipt.status};
    if(table==='ready_for_you_items')return dbQuery(`update ready_for_you_items set status=case when $4='succeeded' then 'executed' else status end, decision_json=decision_json || $1::jsonb, updated_at=now() where tenant_id=$2 and user_id=$3 and id=$5`,[JSON.stringify(metadata),tenantId(),userId(),receipt.status,id]);
    if(table==='val_review_updates')return dbQuery(`update val_review_updates set status=case when $4='succeeded' then 'executed' else status end, metadata_json=metadata_json || $1::jsonb, updated_at=now() where tenant_id=$2 and user_id=$3 and id=$5`,[JSON.stringify(metadata),tenantId(),userId(),receipt.status,id]);
    if(table==='drafts')return dbQuery(`update drafts set status=case when $4='succeeded' then 'provider_draft_created' else status end, source_context_json=source_context_json || $1::jsonb, updated_at=now() where tenant_id=$2 and user_id=$3 and id=$5`,[JSON.stringify(metadata),tenantId(),userId(),receipt.status,id]);
    if(table==='meeting_prep_briefs')return dbQuery(`update meeting_prep_briefs set status=case when $4='succeeded' then 'executed' else status end, updated_at=now() where tenant_id=$2 and user_id=$3 and id=$5`,[JSON.stringify(metadata),tenantId(),userId(),receipt.status,id]);
    if(table==='transcript_intelligence_items')return dbQuery(`update transcript_intelligence_items set status=case when $4='succeeded' then 'executed' else status end, metadata_json=metadata_json || $1::jsonb where tenant_id=$2 and user_id=$3 and id=$5`,[JSON.stringify(metadata),tenantId(),userId(),receipt.status,id]);
    if(table==='conversation_classifications')return dbQuery(`update conversation_classifications set context_json=context_json || $1::jsonb where tenant_id=$2 and user_id=$3 and id=$5`,[JSON.stringify(metadata),tenantId(),userId(),receipt.status,id]);
    return null;
  }
  async function createReceipt({packet,providerResult={},error='',auditRefs=[]}={}){
    const receipt=await saveReceipt(buildReceipt({uuid,scope:scope(),packet,providerResult,error,auditRefs}));
    return receipt;
  }
  async function reconcile(receiptOrId,{packet=null}={}){
    const receipt=typeof receiptOrId==='string'?await getReceipt(receiptOrId):receiptOrId;
    if(!receipt)return null;
    const packetRow=packet||safeArray(store().valExternalActionPackets).find(p=>p.id===receipt.packetId)||{id:receipt.packetId,actionType:receipt.actionType,sourceContextJson:{}};
    const targets=contextTargets(packetRow);
    const events=[];
    if(receipt.status!=='succeeded'){
      const event={id:uuid('recon'),tenantId:tenantId(),userId:userId(),receiptId:receipt.id,packetId:receipt.packetId,targetTable:'none',targetId:'',reconciliationType:'receipt_recorded_only',status:'skipped',summary:'Provider did not confirm success, so no VAL object was marked complete.',beforeJson:{},afterJson:{},createdAt:new Date().toISOString()};
      events.push(await saveEvent(event));
      receipt.reconciliationStatus='skipped';
      receipt.reconciliationSummary=event.summary;
      return saveReceipt(receipt).then(r=>({ok:true,receipt:r,events}));
    }
    for(const target of targets){
      let before={},after={},status='linked',summary=`Linked ${receipt.actionType} receipt to ${target.table}.`;
      try{
        if(hasPg()){await markPgTarget(target,receipt);after={providerResponseId:receipt.providerResponseId,status:receipt.status};}
        else{const result=await markLocalTarget(target,receipt,packetRow);before=result.before;after=result.after;}
      }catch(e){status='failed';summary=e.message;}
      events.push(await saveEvent({id:uuid('recon'),tenantId:tenantId(),userId:userId(),receiptId:receipt.id,packetId:receipt.packetId,targetTable:target.table,targetId:target.id||'',reconciliationType:target.type,status,summary,beforeJson:before,afterJson:after,createdAt:new Date().toISOString()}));
    }
    receipt.reconciliationStatus=events.some(e=>e.status==='failed')?'partial':'reconciled';
    receipt.reconciliationSummary=`Reconciled ${events.filter(e=>e.status!=='failed').length} VAL object link${events.length===1?'':'s'}.`;
    const saved=await saveReceipt(receipt);
    return {ok:true,receipt:saved,events};
  }
  async function list({limit=50,status=''}={}){
    const lim=Math.max(1,Math.min(Number(limit)||50,200));
    if(hasPg()){
      const params=[tenantId(),userId()];
      let where='tenant_id=$1 and user_id=$2';
      if(status){params.push(status);where+=` and status=$${params.length}`;}
      const r=await dbQuery(`select * from val_execution_receipts where ${where} order by created_at desc limit ${lim}`,params);
      return {ok:true,receipts:(r.rows||[]).map(toCamelRow)};
    }
    return {ok:true,receipts:store().valExecutionReceipts.filter(r=>r.tenantId===tenantId()&&r.userId===userId()&&(!status||r.status===status)).slice(0,lim)};
  }
  async function getReceipt(id){
    if(hasPg()){
      const r=await dbQuery(`select * from val_execution_receipts where tenant_id=$1 and user_id=$2 and id=$3`,[tenantId(),userId(),id]);
      return r.rows[0]?toCamelRow(r.rows[0]):null;
    }
    return store().valExecutionReceipts.find(r=>r.id===id&&r.tenantId===tenantId()&&r.userId===userId())||null;
  }
  async function getReceiptForPacket(packetId){
    if(hasPg()){
      const r=await dbQuery(`select * from val_execution_receipts where tenant_id=$1 and user_id=$2 and packet_id=$3 order by created_at desc limit 1`,[tenantId(),userId(),packetId]);
      return r.rows[0]?toCamelRow(r.rows[0]):null;
    }
    return store().valExecutionReceipts
      .filter(r=>r.packetId===packetId&&r.tenantId===tenantId()&&r.userId===userId())
      .sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')))[0]||null;
  }
  async function eventsForReceipt(id){
    if(hasPg()){
      const r=await dbQuery(`select * from val_execution_reconciliation_events where tenant_id=$1 and user_id=$2 and receipt_id=$3 order by created_at desc`,[tenantId(),userId(),id]);
      return (r.rows||[]).map(toCamelRow);
    }
    return store().valExecutionReconciliationEvents.filter(e=>e.receiptId===id&&e.tenantId===tenantId()&&e.userId===userId());
  }
  return {createReceipt,reconcile,list,getReceipt,getReceiptForPacket,eventsForReceipt};
}

module.exports={createValExecutionReceiptService,buildReceipt,retryAllowedFor,providerReceiptSummary};
