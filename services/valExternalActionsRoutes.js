const {createValExternalActionsService} = require('./valExternalActions');
const {createValExternalActionExecutor} = require('./valExternalActionExecutor');
const {createValExecutionReceiptService} = require('./valExecutionReceipts');
const {buildExternalActionDetail,sanitizeReceipt} = require('./valExecutionVisibility');

function parseLimit(value,defaultValue=50,max=200){
  return Math.max(1,Math.min(Number(value)||defaultValue,max));
}

function registerValExternalActionsRoutes(app,deps={}){
  const service=deps.service||createValExternalActionsService(deps);
  const receiptService=deps.receiptService||createValExecutionReceiptService(deps);
  const executor=deps.executor||createValExternalActionExecutor({packetService:service,receiptService,adapters:deps.executionAdapters||{},executedBy:deps.executedBy});
  const waitForDb=typeof deps.valDbReady==='function'?deps.valDbReady:async()=>{};
  const auditLog=typeof deps.auditLog==='function'?deps.auditLog:async()=>{};
  const afterExternalActionPacket=typeof deps.afterExternalActionPacket==='function'?deps.afterExternalActionPacket:async()=>{};

  app.get('/api/val/external-actions',async(req,res)=>{
    try{
      await waitForDb();
      res.json(await service.list({limit:parseLimit(req.query.limit,50),status:req.query.status||'draft'}));
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.get('/api/val/execution-receipts',async(req,res)=>{
    try{
      await waitForDb();
      const result=await receiptService.list({limit:parseLimit(req.query.limit,50),status:req.query.status||''});
      res.json({...result,receipts:(result.receipts||[]).map(sanitizeReceipt)});
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.get('/api/val/execution-receipts/:id',async(req,res)=>{
    try{
      await waitForDb();
      const receipt=await receiptService.getReceipt(req.params.id);
      if(!receipt)return res.status(404).json({ok:false,error:'Execution receipt not found'});
      const events=await receiptService.eventsForReceipt(req.params.id);
      res.json({ok:true,receipt:sanitizeReceipt(receipt),events});
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.get('/api/val/external-actions/:id/detail',async(req,res)=>{
    try{
      await waitForDb();
      const packet=await service.get(req.params.id);
      if(!packet)return res.status(404).json({ok:false,error:'External action packet not found'});
      const receipt=await receiptService.getReceiptForPacket(req.params.id);
      const events=receipt?await receiptService.eventsForReceipt(receipt.id):[];
      const audit=service.auditForPacket?await service.auditForPacket(req.params.id,{limit:100}):[];
      res.json(buildExternalActionDetail({packet,receipt,events,audit}));
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.get('/api/val/external-actions/:id/timeline',async(req,res)=>{
    try{
      await waitForDb();
      const packet=await service.get(req.params.id);
      if(!packet)return res.status(404).json({ok:false,error:'External action packet not found'});
      const receipt=await receiptService.getReceiptForPacket(req.params.id);
      const events=receipt?await receiptService.eventsForReceipt(receipt.id):[];
      const audit=service.auditForPacket?await service.auditForPacket(req.params.id,{limit:100}):[];
      const detail=buildExternalActionDetail({packet,receipt,events,audit});
      res.json({ok:true,packet_id:req.params.id,timeline:detail.timeline,retry_eligibility:detail.retry_eligibility,provider_object_link:detail.provider_object_link});
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.post('/api/val/external-actions/build',async(req,res)=>{
    try{
      await waitForDb();
      const result=await service.build({limit:parseLimit(req.body?.limit,100)});
      await afterExternalActionPacket(result.packets||[],{req,phase:'build'}).catch(error=>{result.boardPacketWarning=error.message;});
      await auditLog({req,action:'external_action_packets_built',resourceType:'val_external_action_packets',metadata:{count:result.count,externalActionTaken:false,executionAvailable:false},success:true}).catch(()=>{});
      res.json(result);
    }catch(e){
      await auditLog({req,action:'external_action_packets_build_failed',resourceType:'val_external_action_packets',metadata:{error:e.message,externalActionTaken:false},success:false}).catch(()=>{});
      res.status(500).json({ok:false,error:e.message});
    }
  });

  app.post('/api/val/external-actions/:id/approve',async(req,res)=>{
    try{
      await waitForDb();
      const packet=await service.approve(req.params.id,{note:req.body?.note||''});
      if(!packet)return res.status(404).json({ok:false,error:'External action packet not found'});
      await afterExternalActionPacket(packet,{req,phase:'approved'}).catch(error=>{packet.boardPacketWarning=error.message;});
      await auditLog({req,action:'external_action_packet_approved_local_only',resourceType:'val_external_action_packet',resourceId:req.params.id,metadata:{actionType:packet.actionType,externalActionTaken:false,executionAvailable:false},success:true}).catch(()=>{});
      res.json({ok:true,packet,no_external_action:true,execution_available:false});
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.post('/api/val/external-actions/:id/reject',async(req,res)=>{
    try{
      await waitForDb();
      const packet=await service.reject(req.params.id,{reason:req.body?.reason||req.body?.note||''});
      if(!packet)return res.status(404).json({ok:false,error:'External action packet not found'});
      await auditLog({req,action:'external_action_packet_rejected',resourceType:'val_external_action_packet',resourceId:req.params.id,metadata:{actionType:packet.actionType,externalActionTaken:false},success:true}).catch(()=>{});
      res.json({ok:true,packet,no_external_action:true,execution_available:false});
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.post('/api/val/external-actions/:id/edit',async(req,res)=>{
    try{
      await waitForDb();
      const packet=await service.edit(req.params.id,req.body||{});
      if(!packet)return res.status(404).json({ok:false,error:'External action packet not found'});
      await auditLog({req,action:'external_action_packet_edited',resourceType:'val_external_action_packet',resourceId:req.params.id,metadata:{actionType:packet.actionType,externalActionTaken:false},success:true}).catch(()=>{});
      res.json({ok:true,packet,no_external_action:true,execution_available:false});
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.post('/api/val/external-actions/email-send-packet',async(req,res)=>{
    try{
      await waitForDb();
      if(typeof service.createEmailSendPacket!=='function')throw new Error('Email send packets are not available.');
      const packet=await service.createEmailSendPacket(req.body||{});
      await afterExternalActionPacket(packet,{req,phase:'created'}).catch(error=>{packet.boardPacketWarning=error.message;});
      await auditLog({req,action:'email_send_packet_created',resourceType:'val_external_action_packet',resourceId:packet.id,metadata:{actionType:packet.actionType,externalActionTaken:false,executionAvailable:false},success:true}).catch(()=>{});
      res.json({ok:true,packet,no_external_action:true,execution_available:false});
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.post('/api/val/external-actions/email-send-now',async(req,res)=>{
    try{
      await waitForDb();
      if(typeof service.createEmailSendPacket!=='function')throw new Error('Email send packets are not available.');
      const packet=await service.createEmailSendPacket(req.body||{});
      const approved=await service.approve(packet.id,{note:req.body?.approvalNote||'Final send approved from VAL send gate.'});
      const result=await executor.execute(approved.id,{finalConfirmation:true,executedBy:req.body?.executedBy});
      await afterExternalActionPacket(result.packet||approved,{req,phase:result.executed?'executed':'execution_not_completed'}).catch(error=>{result.boardPacketWarning=error.message;});
      await auditLog({req,action:result.executed?'email_send_gate_executed':'email_send_gate_not_completed',resourceType:'val_external_action_packet',resourceId:approved.id,metadata:{executed:!!result.executed,status:result.packet?.status,error:result.error||'',riskErrors:result.risk_check?.errors||[]},success:!!result.executed}).catch(()=>{});
      res.status(result.ok?200:409).json({...result,packet:result.packet||approved,final_confirmation:true});
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.post('/api/val/external-actions/sms-send-packet',async(req,res)=>{
    try{
      await waitForDb();
      if(typeof service.createSmsSendPacket!=='function')throw new Error('SMS send packets are not available.');
      const packet=await service.createSmsSendPacket(req.body||{});
      await afterExternalActionPacket(packet,{req,phase:'created'}).catch(error=>{packet.boardPacketWarning=error.message;});
      await auditLog({req,action:'sms_send_packet_created',resourceType:'val_external_action_packet',resourceId:packet.id,metadata:{actionType:packet.actionType,externalActionTaken:false,executionAvailable:false},success:true}).catch(()=>{});
      res.json({ok:true,packet,no_external_action:true,execution_available:false});
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.post('/api/val/external-actions/sms-send-now',async(req,res)=>{
    try{
      await waitForDb();
      if(typeof service.createSmsSendPacket!=='function')throw new Error('SMS send packets are not available.');
      const packet=await service.createSmsSendPacket(req.body||{});
      const approved=await service.approve(packet.id,{note:req.body?.approvalNote||'Final SMS approved from VAL send gate.'});
      const result=await executor.execute(approved.id,{finalConfirmation:true,executedBy:req.body?.executedBy});
      await afterExternalActionPacket(result.packet||approved,{req,phase:result.executed?'executed':'execution_not_completed'}).catch(error=>{result.boardPacketWarning=error.message;});
      await auditLog({req,action:result.executed?'sms_send_gate_executed':'sms_send_gate_not_completed',resourceType:'val_external_action_packet',resourceId:approved.id,metadata:{executed:!!result.executed,status:result.packet?.status,error:result.error||'',riskErrors:result.risk_check?.errors||[]},success:!!result.executed}).catch(()=>{});
      res.status(result.ok?200:409).json({...result,packet:result.packet||approved,final_confirmation:true});
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.post('/api/val/external-actions/:id/fresh-risk-check',async(req,res)=>{
    try{
      await waitForDb();
      const result=await executor.freshRiskCheck(req.params.id,req.body||{});
      if(!result)return res.status(404).json({ok:false,error:'External action packet not found'});
      await auditLog({req,action:'external_action_fresh_risk_check',resourceType:'val_external_action_packet',resourceId:req.params.id,metadata:{ok:result.risk_check?.ok,errors:result.risk_check?.errors||[],executionAvailable:result.execution_available},success:true}).catch(()=>{});
      res.json(result);
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.post('/api/val/external-actions/:id/execute',async(req,res)=>{
    try{
      await waitForDb();
      const result=await executor.execute(req.params.id,req.body||{});
      if(!result)return res.status(404).json({ok:false,error:'External action packet not found'});
      await afterExternalActionPacket(result.packet,{req,phase:result.executed?'executed':'execution_not_completed'}).catch(error=>{result.boardPacketWarning=error.message;});
      await auditLog({req,action:result.executed?'external_action_executed':'external_action_execution_not_completed',resourceType:'val_external_action_packet',resourceId:req.params.id,metadata:{executed:!!result.executed,actionType:result.packet?.actionType,status:result.packet?.status,error:result.error||'',riskErrors:result.risk_check?.errors||[]},success:!!result.executed}).catch(()=>{});
      res.status(result.ok?200:409).json(result);
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.post('/api/val/external-actions/:id/retry',async(req,res)=>{
    try{
      await waitForDb();
      const result=await executor.retry(req.params.id,req.body||{});
      if(!result)return res.status(404).json({ok:false,error:'External action packet not found'});
      await auditLog({req,action:result.executed?'external_action_retry_executed':'external_action_retry_not_completed',resourceType:'val_external_action_packet',resourceId:req.params.id,metadata:{executed:!!result.executed,status:result.packet?.status,error:result.error||''},success:!!result.executed}).catch(()=>{});
      res.status(result.ok?200:409).json(result);
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.post('/api/val/external-actions/:id/reconcile',async(req,res)=>{
    try{
      await waitForDb();
      const packet=await service.get(req.params.id);
      if(!packet)return res.status(404).json({ok:false,error:'External action packet not found'});
      const receiptId=req.body?.receiptId||req.body?.receipt_id||`receipt_${req.params.id}`;
      const result=await receiptService.reconcile(receiptId,{packet});
      if(!result)return res.status(404).json({ok:false,error:'Execution receipt not found'});
      await auditLog({req,action:'external_action_reconciled',resourceType:'val_execution_receipt',resourceId:receiptId,metadata:{packetId:req.params.id,status:result.receipt?.reconciliationStatus,events:result.events?.length||0},success:true}).catch(()=>{});
      res.json(result);
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  return service;
}

module.exports={registerValExternalActionsRoutes};
