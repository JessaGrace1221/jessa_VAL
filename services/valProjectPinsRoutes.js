const {createValProjectPinsService}=require('./valProjectPins');

function parseLimit(value,defaultValue=50,max=200){
  return Math.max(1,Math.min(Number(value)||defaultValue,max));
}

function registerValProjectPinsRoutes(app,deps={}){
  const service=deps.service||createValProjectPinsService(deps);
  const waitForDb=typeof deps.valDbReady==='function'?deps.valDbReady:async()=>{};
  const auditLog=typeof deps.auditLog==='function'?deps.auditLog:async()=>{};

  app.post('/api/val/project-pins',async(req,res)=>{
    try{
      await waitForDb();
      const result=await service.createPin(req.body||{});
      await auditLog({req,action:'project_pin_created',resourceType:'project_pin',resourceId:result.pin?.id||'',metadata:{projectId:result.pin?.projectId,pinUntil:result.pin?.pinUntil,noExternalAction:true},success:true}).catch(()=>{});
      res.json(result);
    }catch(e){
      await auditLog({req,action:'project_pin_create_failed',resourceType:'project_pin',metadata:{error:e.message,noExternalAction:true},success:false}).catch(()=>{});
      res.status(400).json({ok:false,error:e.message,no_external_action:true});
    }
  });

  app.get('/api/val/project-pins',async(req,res)=>{
    try{
      await waitForDb();
      res.json(await service.listPins({
        projectId:req.query.projectId||'',
        status:req.query.status||'',
        dueOnly:req.query.dueOnly==='true',
        limit:parseLimit(req.query.limit,50)
      }));
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.get('/api/val/project-pins/alignment',async(req,res)=>{
    try{
      await waitForDb();
      res.json(await service.listAlignmentPins({limit:parseLimit(req.query.limit,3,20)}));
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.post('/api/val/project-pins/:id/complete',async(req,res)=>{
    try{
      await waitForDb();
      const pin=await service.completePin(req.params.id,{reason:req.body?.reason||''});
      if(!pin)return res.status(404).json({ok:false,error:'Project pin not found'});
      await auditLog({req,action:'project_pin_completed',resourceType:'project_pin',resourceId:req.params.id,metadata:{projectId:pin.projectId,noExternalAction:true},success:true}).catch(()=>{});
      res.json({ok:true,pin,no_external_action:true});
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  return service;
}

module.exports={registerValProjectPinsRoutes};
