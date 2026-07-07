const {createValCommitmentsService}=require('./valCommitments');

function registerValCommitmentsRoutes(app,deps={}){
  const service=deps.service||createValCommitmentsService(deps);
  const waitForDb=typeof deps.valDbReady==='function'?deps.valDbReady:async()=>{};
  const auditLog=typeof deps.auditLog==='function'?deps.auditLog:async()=>{};

  app.get('/api/val/commitments',async(req,res)=>{
    try{
      await waitForDb();
      res.json(await service.list({status:req.query.status||'',ownerType:req.query.ownerType||'',limit:req.query.limit||100}));
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.get('/api/val/commitments/:id',async(req,res)=>{
    try{
      await waitForDb();
      const commitment=await service.get(req.params.id);
      if(!commitment)return res.status(404).json({ok:false,error:'Commitment not found'});
      res.json({ok:true,commitment});
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.post('/api/val/commitments/:id/status',async(req,res)=>{
    try{
      await waitForDb();
      const result=await service.updateStatus(req.params.id,req.body||{});
      await auditLog({req,action:'commitment_status_updated',resourceType:'val_commitment',resourceId:req.params.id,metadata:{status:req.body?.status||'',externalActionTaken:false},success:true}).catch(()=>{});
      res.json(result);
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.post('/api/val/commitments/:id/draft-email',async(req,res)=>{
    try{
      await waitForDb();
      const result=await service.draftEmail(req.params.id,req.body||{});
      await auditLog({req,action:'commitment_draft_created',resourceType:'draft',resourceId:result.draft?.id||'',metadata:{commitmentId:req.params.id,externalActionTaken:false},success:true}).catch(()=>{});
      res.json(result);
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.post('/api/val/commitments/:id/create-task',async(req,res)=>{
    try{
      await waitForDb();
      const result=await service.createTask(req.params.id,req.body||{});
      await auditLog({req,action:'commitment_task_created',resourceType:'task',resourceId:result.task?.id||'',metadata:{commitmentId:req.params.id,externalActionTaken:false},success:true}).catch(()=>{});
      res.json(result);
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  return service;
}

module.exports={registerValCommitmentsRoutes};
