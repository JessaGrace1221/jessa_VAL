const {createValEnvironmentsService}=require('./valEnvironments');

function registerValEnvironmentsRoutes(app,deps={}){
  const service=deps.service||createValEnvironmentsService(deps);
  const waitForDb=typeof deps.valDbReady==='function'?deps.valDbReady:async()=>{};
  const auditLog=typeof deps.auditLog==='function'?deps.auditLog:async()=>{};

  app.get('/api/val/environments',async(req,res)=>{
    try{
      await waitForDb();
      res.json(await service.list({limit:req.query.limit}));
    }catch(error){res.status(500).json({ok:false,error:error.message});}
  });
  app.get('/api/val/environments/catalog',async(req,res)=>{
    try{
      await waitForDb();
      res.json({ok:true,blockCatalog:service.blockCatalog()});
    }catch(error){res.status(500).json({ok:false,error:error.message});}
  });
  app.get('/api/val/environments/network',async(req,res)=>{
    try{
      await waitForDb();
      res.json(await service.listNetwork({limit:req.query.limit}));
    }catch(error){res.status(500).json({ok:false,error:error.message});}
  });
  app.get('/api/val/environments/:id/communications',async(req,res)=>{
    try{
      await waitForDb();
      res.json(await service.listCommunications(req.params.id,{limit:req.query.limit}));
    }catch(error){res.status(500).json({ok:false,error:error.message});}
  });
  app.get('/api/val/environments/:id/export',async(req,res)=>{
    try{
      await waitForDb();
      const result=await service.exportTemplate(req.params.id);
      const filename=String(result.share?.template?.name||'VAL Environment')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g,'-')
        .replace(/^-+|-+$/g,'')
        .slice(0,80)||'val-environment';
      res.setHeader('Content-Disposition',`attachment; filename="${filename}.val-environment.json"`);
      await auditLog({req,action:'val_environment_shared',resourceType:'val_environment',resourceId:req.params.id,metadata:{privateDataRemoved:true,noExternalAction:true},success:true}).catch(()=>{});
      res.json(result);
    }catch(error){res.status(/not found/i.test(error.message)?404:400).json({ok:false,error:error.message,no_external_action:true});}
  });
  app.post('/api/val/environments/import',async(req,res)=>{
    try{
      await waitForDb();
      const result=await service.importTemplate(req.body||{});
      await auditLog({req,action:'val_environment_imported',resourceType:'val_environment',resourceId:result.environment?.id||'',metadata:{installedAsDraft:true,noExternalAction:true},success:true}).catch(()=>{});
      res.json(result);
    }catch(error){res.status(400).json({ok:false,error:error.message,no_external_action:true});}
  });
  app.get('/api/val/environments/:id',async(req,res)=>{
    try{
      await waitForDb();
      const environment=await service.get(req.params.id);
      if(!environment)return res.status(404).json({ok:false,error:'Environment not found'});
      res.json({ok:true,environment});
    }catch(error){res.status(500).json({ok:false,error:error.message});}
  });
  app.post('/api/val/environments',async(req,res)=>{
    try{
      await waitForDb();
      const result=await service.saveDraft(req.body||{});
      await auditLog({req,action:'val_environment_draft_saved',resourceType:'val_environment',resourceId:result.environment?.id||'',metadata:{validation:result.validation,noExternalAction:true},success:true}).catch(()=>{});
      res.json(result);
    }catch(error){res.status(400).json({ok:false,error:error.message,no_external_action:true});}
  });
  app.put('/api/val/environments/:id',async(req,res)=>{
    try{
      await waitForDb();
      const result=await service.saveDraft({...req.body,id:req.params.id});
      await auditLog({req,action:'val_environment_draft_updated',resourceType:'val_environment',resourceId:req.params.id,metadata:{validation:result.validation,noExternalAction:true},success:true}).catch(()=>{});
      res.json(result);
    }catch(error){res.status(400).json({ok:false,error:error.message,no_external_action:true});}
  });
  app.post('/api/val/environments/:id/activate',async(req,res)=>{
    try{
      await waitForDb();
      const result=await service.activate(req.params.id);
      await auditLog({req,action:'val_environment_activated',resourceType:'val_environment',resourceId:req.params.id,metadata:{activeVersionId:result.environment?.activeVersionId},success:true}).catch(()=>{});
      res.json(result);
    }catch(error){res.status(400).json({ok:false,error:error.message});}
  });
  app.post('/api/val/environments/:id/pause',async(req,res)=>{
    try{
      await waitForDb();
      const result=await service.pause(req.params.id);
      await auditLog({req,action:'val_environment_paused',resourceType:'val_environment',resourceId:req.params.id,metadata:{},success:true}).catch(()=>{});
      res.json(result);
    }catch(error){res.status(400).json({ok:false,error:error.message});}
  });
  app.post('/api/val/environments/:id/test',async(req,res)=>{
    try{
      await waitForDb();
      const result=await service.runHistoricalTest(req.params.id,{transcriptId:req.body?.transcriptId});
      await auditLog({req,action:'val_environment_historical_test_completed',resourceType:'val_environment',resourceId:req.params.id,metadata:{runId:result.run?.id,noExternalAction:true},success:true}).catch(()=>{});
      res.json(result);
    }catch(error){res.status(400).json({ok:false,error:error.message,no_external_action:true});}
  });
  app.get('/api/val/environments/:id/runs',async(req,res)=>{
    try{
      await waitForDb();
      res.json(await service.listRuns(req.params.id,{limit:req.query.limit}));
    }catch(error){res.status(500).json({ok:false,error:error.message});}
  });
  return service;
}

module.exports={registerValEnvironmentsRoutes};
