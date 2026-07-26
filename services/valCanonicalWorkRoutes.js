const {createValCanonicalWorkService}=require('./valCanonicalWork');

function parseLimit(value,defaultValue=100,max=500){
  return Math.max(1,Math.min(Number(value)||defaultValue,max));
}

function registerValCanonicalWorkRoutes(app,deps={}){
  const service=deps.service||createValCanonicalWorkService(deps);
  const waitForDb=typeof deps.valDbReady==='function'?deps.valDbReady:async()=>{};
  const allowWrite=typeof deps.allowWrite==='function'?deps.allowWrite:()=>true;

  app.get('/api/val/work-items',async(req,res)=>{
    try{
      await waitForDb();
      res.json(await service.list({
        admissionStatus:req.query.admissionStatus||'',
        lifecycleStatus:req.query.lifecycleStatus||'',
        ownership:req.query.ownership||'',
        limit:parseLimit(req.query.limit)
      }));
    }catch(error){res.status(500).json({ok:false,error:error.message});}
  });

  app.get('/api/val/work-items/tasks',async(req,res)=>{
    try{
      await waitForDb();
      res.json(await service.taskProjection({limit:parseLimit(req.query.limit)}));
    }catch(error){res.status(500).json({ok:false,error:error.message});}
  });

  app.get('/api/val/work-items/:id/events',async(req,res)=>{
    try{
      await waitForDb();
      res.json(await service.eventsFor(req.params.id));
    }catch(error){res.status(500).json({ok:false,error:error.message});}
  });

  app.post('/api/val/work-items/:id/transition',async(req,res)=>{
    try{
      if(!allowWrite(req))return res.status(401).json({ok:false,error:'Authentication required'});
      await waitForDb();
      res.json(await service.transition(req.params.id,{
        status:req.body?.status,
        eventType:req.body?.eventType||'status_changed',
        payload:req.body?.payload||{},
        sourceRefs:req.body?.sourceRefs||[]
      }));
    }catch(error){res.status(400).json({ok:false,error:error.message});}
  });

  return service;
}

module.exports={registerValCanonicalWorkRoutes};
