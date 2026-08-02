const {createValCoworkService}=require('./valCowork');

function registerValCoworkRoutes(app,deps={}){
  const service=deps.service || createValCoworkService(deps);
  const waitForDb=typeof deps.valDbReady === 'function' ? deps.valDbReady : async()=>{};
  const auditLog=typeof deps.auditLog === 'function' ? deps.auditLog : async()=>{};
  const afterCoworkEvent=typeof deps.afterCoworkEvent === 'function' ? deps.afterCoworkEvent : async()=>{};

  app.post('/api/val/cowork/entries/open',async(req,res)=>{
    try{
      await waitForDb();
      const result=await service.openEntry(req.body || {});
      await afterCoworkEvent({phase:'opened',result,request:req.body||{}}).catch(error=>{result.boardPacketWarning=error.message;});
      await auditLog({req,action:'cowork_entry_opened',resourceType:'cowork_session',resourceId:result.session?.id || '',metadata:{entrypointId:result.entrypoint?.id,scope:result.session?.scope,noExternalAction:true},success:true}).catch(()=>{});
      res.json(result);
    }catch(error){
      res.status(400).json({ok:false,error:error.message,no_external_action:true});
    }
  });

  app.post('/api/val/cowork/sessions/:id/respond',async(req,res)=>{
    try{
      await waitForDb();
      const result=await service.respond(req.params.id,req.body || {});
      await afterCoworkEvent({phase:'responded',result,request:req.body||{}}).catch(error=>{result.boardPacketWarning=error.message;});
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
      await afterCoworkEvent({phase:'applied',result,request:{workItemId:req.params.id}}).catch(error=>{result.boardPacketWarning=error.message;});
      await auditLog({req,action:'cowork_work_item_applied',resourceType:'cowork_work_item',resourceId:req.params.id,metadata:{receiptId:result.receipt?.id,scope:result.session?.scope,noExternalAction:true},success:true}).catch(()=>{});
      res.json(result);
    }catch(error){
      res.status(400).json({ok:false,error:error.message,no_external_action:true});
    }
  });

  return service;
}

module.exports={registerValCoworkRoutes};
