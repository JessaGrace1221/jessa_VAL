const {createValReviewUpdatesService} = require('./valReviewUpdates');

function parseLimit(value,defaultValue=50,max=200){
  return Math.max(1,Math.min(Number(value)||defaultValue,max));
}

function registerValReviewUpdatesRoutes(app,deps={}){
  const service=deps.service||createValReviewUpdatesService(deps);
  const waitForDb=typeof deps.valDbReady==='function'?deps.valDbReady:async()=>{};
  const auditLog=typeof deps.auditLog==='function'?deps.auditLog:async()=>{};

  app.get('/api/val/review-updates',async(req,res)=>{
    try{
      await waitForDb();
      res.json(await service.list({limit:parseLimit(req.query.limit,50),status:req.query.status||'pending'}));
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.post('/api/val/review-updates/build',async(req,res)=>{
    try{
      await waitForDb();
      const result=await service.build({limit:parseLimit(req.body?.limit,80)});
      await auditLog({req,action:'review_updates_built',resourceType:'val_review_updates',metadata:{count:result.count,noExternalAction:true},success:true}).catch(()=>{});
      res.json(result);
    }catch(e){
      await auditLog({req,action:'review_updates_build_failed',resourceType:'val_review_updates',metadata:{error:e.message},success:false}).catch(()=>{});
      res.status(500).json({ok:false,error:e.message});
    }
  });

  app.post('/api/val/review-updates/relationship-temperature',async(req,res)=>{
    try{
      await waitForDb();
      const result=await service.createRelationshipTemperatureCorrection(req.body||{});
      await auditLog({req,action:'relationship_temperature_review_update_created',resourceType:'val_review_update',resourceId:result.update?.id||'',metadata:{targetType:result.update?.targetType,updateType:result.update?.updateType,noExternalAction:true},success:true}).catch(()=>{});
      res.json(result);
    }catch(e){
      await auditLog({req,action:'relationship_temperature_review_update_failed',resourceType:'val_review_update',metadata:{error:e.message},success:false}).catch(()=>{});
      res.status(400).json({ok:false,error:e.message});
    }
  });

  app.post('/api/val/review-updates/project-source',async(req,res)=>{
    try{
      await waitForDb();
      const result=await service.createProjectSourceInterpretation(req.body||{});
      await auditLog({req,action:'project_source_review_update_created',resourceType:'val_review_update',resourceId:result.update?.id||'',metadata:{targetType:result.update?.targetType,updateType:result.update?.updateType,noExternalAction:true},success:true}).catch(()=>{});
      res.json(result);
    }catch(e){
      await auditLog({req,action:'project_source_review_update_failed',resourceType:'val_review_update',metadata:{error:e.message},success:false}).catch(()=>{});
      res.status(400).json({ok:false,error:e.message});
    }
  });

  app.post('/api/val/review-updates/transcript-proposal',async(req,res)=>{
    try{
      await waitForDb();
      const result=await service.createTranscriptProposalReview(req.body||{});
      await auditLog({req,action:'transcript_proposal_review_update_created',resourceType:'val_review_update',resourceId:result.update?.id||'',metadata:{targetType:result.update?.targetType,updateType:result.update?.updateType,noExternalAction:true},success:true}).catch(()=>{});
      res.json(result);
    }catch(e){
      await auditLog({req,action:'transcript_proposal_review_update_failed',resourceType:'val_review_update',metadata:{error:e.message},success:false}).catch(()=>{});
      res.status(400).json({ok:false,error:e.message});
    }
  });

  app.post('/api/val/review-updates/:id/approve',async(req,res)=>{
    try{
      await waitForDb();
      const update=await service.approve(req.params.id,{note:req.body?.note||''});
      if(!update)return res.status(404).json({ok:false,error:'Review update not found'});
      await auditLog({req,action:'review_update_approved',resourceType:'val_review_update',resourceId:req.params.id,metadata:{targetType:update.targetType,externalActionTaken:false},success:true}).catch(()=>{});
      res.json({ok:true,update,no_external_action:true});
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.post('/api/val/review-updates/:id/reject',async(req,res)=>{
    try{
      await waitForDb();
      const update=await service.reject(req.params.id,{reason:req.body?.reason||req.body?.note||''});
      if(!update)return res.status(404).json({ok:false,error:'Review update not found'});
      await auditLog({req,action:'review_update_rejected',resourceType:'val_review_update',resourceId:req.params.id,metadata:{targetType:update.targetType,externalActionTaken:false},success:true}).catch(()=>{});
      res.json({ok:true,update,no_external_action:true});
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.post('/api/val/review-updates/:id/edit',async(req,res)=>{
    try{
      await waitForDb();
      const update=await service.edit(req.params.id,req.body||{});
      if(!update)return res.status(404).json({ok:false,error:'Review update not found'});
      await auditLog({req,action:'review_update_edited',resourceType:'val_review_update',resourceId:req.params.id,metadata:{targetType:update.targetType,externalActionTaken:false},success:true}).catch(()=>{});
      res.json({ok:true,update,no_external_action:true});
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  return service;
}

module.exports={registerValReviewUpdatesRoutes};
