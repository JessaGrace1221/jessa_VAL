const {createValCoworkService}=require('./valCowork');

function registerValCoworkRoutes(app,deps={}){
  const service=deps.service || createValCoworkService(deps);
  const waitForDb=typeof deps.valDbReady === 'function' ? deps.valDbReady : async()=>{};
  const auditLog=typeof deps.auditLog === 'function' ? deps.auditLog : async()=>{};
  const actionOrchestrator=()=>typeof deps.actionOrchestrator==='function'?deps.actionOrchestrator():deps.actionOrchestrator;

  app.post('/api/val/cowork/entries/open',async(req,res)=>{
    try{
      await waitForDb();
      const result=await service.openEntry(req.body || {});
      await auditLog({req,action:'cowork_entry_opened',resourceType:'cowork_session',resourceId:result.session?.id || '',metadata:{entrypointId:result.entrypoint?.id,scope:result.session?.scope,noExternalAction:true},success:true}).catch(()=>{});
      res.json(result);
    }catch(error){
      deps.logger?.error?.('VAL Co-Work entry could not open',{
        entrypointId:req.body?.entrypointId || '',
        entityId:req.body?.scope?.entityId || req.body?.scope?.entity_id || '',
        messageId:req.body?.scope?.messageId || req.body?.scope?.message_id || '',
        threadId:req.body?.scope?.threadId || req.body?.scope?.thread_id || '',
        conversationId:req.body?.scope?.conversationId || req.body?.scope?.conversation_id || '',
        error:error.message
      });
      res.status(400).json({ok:false,error:error.message,no_external_action:true});
    }
  });

  app.post('/api/val/cowork/sessions/:id/respond',async(req,res)=>{
    try{
      await waitForDb();
      const result=await service.respond(req.params.id,req.body || {});
      const orchestrator=actionOrchestrator();
      const userText=String(req.body?.answer||req.body?.message||req.body?.content||req.body?.text||'').trim();
      if(orchestrator&&userText){
        result.actionOrchestration=await orchestrator.ingest({
          sourceChannel:'cowork',
          sourceType:result.entrypoint?.id||'cowork_session',
          sourceId:req.params.id,
          sourceEventId:result.event?.id||result.workItem?.id||'',
          title:result.entrypoint?.label||result.entrypoint?.title||'Co-Work with VAL',
          text:userText,
          context:{entrypoint:result.entrypoint||{},scope:result.session?.scope||{},workingBrief:result.session?.workingBrief||{}},
          structuredActions:result.workItem?[result.workItem]:[],
          sourceRefs:result.workItem?.sourceRefs||result.workItem?.source_refs||[]
        }).catch(error=>({ok:false,error:error.message,candidates:[]}));
      }
      await auditLog({req,action:'cowork_entry_answered',resourceType:'cowork_session',resourceId:req.params.id,metadata:{entrypointId:result.entrypoint?.id,workItemId:result.workItem?.id,noExternalAction:true},success:true}).catch(()=>{});
      res.json(result);
    }catch(error){
      res.status(400).json({ok:false,error:error.message,no_external_action:true});
    }
  });

  app.post('/api/val/cowork/work-items/:id/apply',async(req,res)=>{
    try{
      await waitForDb();
      const result=await service.applyWorkItem(req.params.id);
      await auditLog({req,action:'cowork_work_item_applied',resourceType:'cowork_work_item',resourceId:req.params.id,metadata:{receiptId:result.receipt?.id,scope:result.session?.scope,noExternalAction:true},success:true}).catch(()=>{});
      res.json(result);
    }catch(error){
      res.status(400).json({ok:false,error:error.message,no_external_action:true});
    }
  });

  app.get('/api/val/cowork/carry-forward',async(req,res)=>{
    try{
      await waitForDb();
      await service.reconcileCarryForwardDeliveries({limit:100});
      const deliveries=await service.listCarryForwardForRecipient({
        recipientType:req.query?.recipientType || req.query?.recipient_type,
        recipientId:req.query?.recipientId || req.query?.recipient_id,
        limit:req.query?.limit
      });
      res.json({ok:true,deliveries,no_external_action:true});
    }catch(error){
      res.status(400).json({ok:false,error:error.message,no_external_action:true});
    }
  });

  Promise.resolve()
    .then(()=>waitForDb())
    .then(()=>service.reconcileCarryForwardDeliveries({limit:250}))
    .then((result)=>{
      if(result.checked) deps.logger?.log?.(`VAL Co-Work carry-forward checked ${result.checked} event(s); ${result.incomplete.length} remain incomplete.`);
    })
    .catch((error)=>deps.logger?.error?.('VAL Co-Work carry-forward reconciliation failed',error));

  return service;
}

module.exports={registerValCoworkRoutes};
