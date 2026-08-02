const {createValReadyForYouService} = require('./valReadyForYou');
const {createValExecutionReceiptService} = require('./valExecutionReceipts');

function parseLimit(value,defaultValue=3,max=25){
  return Math.max(1,Math.min(Number(value)||defaultValue,max));
}

function registerValReadyForYouRoutes(app,deps={}){
  const service=deps.service||createValReadyForYouService(deps);
  const receiptService=deps.receiptService||createValExecutionReceiptService(deps);
  const waitForDb=typeof deps.valDbReady==='function'?deps.valDbReady:async()=>{};
  const auditLog=typeof deps.auditLog==='function'?deps.auditLog:async()=>{};

  app.get('/api/val/ready-for-you',async(req,res)=>{
    try{
      await waitForDb();
      const result=await service.listItems({limit:parseLimit(req.query.limit,20,25),status:req.query.status||'',includeSnoozed:req.query.includeSnoozed==='true'});
      res.json(result);
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.get('/api/val/ready-for-you/with-receipts',async(req,res)=>{
    try{
      await waitForDb();
      const result=await service.listItemsWithReceipts({limit:parseLimit(req.query.limit,20,25),status:req.query.status||'',includeSnoozed:req.query.includeSnoozed==='true',receiptService});
      res.json(result);
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.post('/api/val/ready-for-you/build',async(req,res)=>{
    try{
      await waitForDb();
      const result=await service.buildQueue({
        limit:parseLimit(req.body?.limit,20,25),
        materializeLimit:Math.max(0,Math.min(Number(req.body?.materializeLimit??0)||0,5))
      });
      await auditLog({req,action:'ready_for_you_queue_built',resourceType:'ready_for_you_items',metadata:{count:result.allBuilt?.length||0,state:result.state,generation:result.generation||{},unknowns:result.unknowns||[]},success:true}).catch(()=>{});
      res.json(result);
    }catch(e){
      await auditLog({req,action:'ready_for_you_queue_build_failed',resourceType:'ready_for_you_items',metadata:{error:e.message},success:false}).catch(()=>{});
      res.status(500).json({ok:false,error:e.message});
    }
  });

  app.patch('/api/val/ready-for-you/:id/draft',async(req,res)=>{
    try{
      await waitForDb();
      const item=await service.updatePreparedArtifact(req.params.id,req.body||{});
      if(!item)return res.status(404).json({ok:false,error:'Prepared draft not found'});
      await auditLog({req,action:'ready_for_you_draft_edited',resourceType:'ready_for_you_item',resourceId:req.params.id,metadata:{externalAction:false},success:true}).catch(()=>{});
      res.json({ok:true,item,no_external_action:true});
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.post('/api/val/ready-for-you/:id/approve',async(req,res)=>{
    try{
      await waitForDb();
      const item=await service.approve(req.params.id,req.body||{});
      if(!item)return res.status(404).json({ok:false,error:'Ready For You item not found'});
      await auditLog({req,action:'ready_for_you_item_approved',resourceType:'ready_for_you_item',resourceId:req.params.id,metadata:{externalAction:false},success:true}).catch(()=>{});
      res.json({ok:true,item,no_external_action:true});
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.post('/api/val/ready-for-you/:id/reject',async(req,res)=>{
    try{
      await waitForDb();
      const item=await service.reject(req.params.id,req.body||{});
      if(!item)return res.status(404).json({ok:false,error:'Ready For You item not found'});
      await auditLog({req,action:'ready_for_you_item_rejected',resourceType:'ready_for_you_item',resourceId:req.params.id,metadata:{externalAction:false},success:true}).catch(()=>{});
      res.json({ok:true,item,no_external_action:true});
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.post('/api/val/ready-for-you/:id/dismiss',async(req,res)=>{
    try{
      await waitForDb();
      const reason=req.body?.reason||'Dismissed as not needed.';
      const item=await service.reject(req.params.id,{...(req.body||{}),reason,disposition:'dismissed'});
      if(!item)return res.status(404).json({ok:false,error:'Ready For You item not found'});
      await auditLog({req,action:'ready_for_you_item_dismissed',resourceType:'ready_for_you_item',resourceId:req.params.id,metadata:{reason,sourceEvidencePreserved:true,externalAction:false},success:true}).catch(()=>{});
      res.json({ok:true,item,source_evidence_preserved:true,no_external_action:true});
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.post('/api/val/ready-for-you/:id/snooze',async(req,res)=>{
    try{
      await waitForDb();
      const item=await service.snooze(req.params.id,{until:req.body?.until||req.body?.snoozedUntil||'',minutes:req.body?.minutes||60,reason:req.body?.reason||''});
      if(!item)return res.status(404).json({ok:false,error:'Ready For You item not found'});
      await auditLog({req,action:'ready_for_you_item_snoozed',resourceType:'ready_for_you_item',resourceId:req.params.id,metadata:{snoozedUntil:item.snoozedUntil,externalAction:false},success:true}).catch(()=>{});
      res.json({ok:true,item,no_external_action:true});
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  return service;
}

module.exports={registerValReadyForYouRoutes};
