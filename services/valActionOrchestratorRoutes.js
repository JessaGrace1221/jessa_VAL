const {createValActionOrchestrator}=require('./valActionOrchestrator');

function registerValActionOrchestratorRoutes(app,deps={}){
  const service=deps.service||createValActionOrchestrator(deps);
  const waitForDb=typeof deps.valDbReady==='function'?deps.valDbReady:async()=>{};
  app.get('/api/val/action-orchestrator/capabilities',async(req,res)=>{
    try{await waitForDb();res.json({ok:true,capabilities:service.capabilities()});}catch(error){res.status(500).json({ok:false,error:error.message});}
  });
  app.get('/api/val/action-orchestrator/candidates',async(req,res)=>{
    try{await waitForDb();res.json({ok:true,candidates:await service.list({limit:req.query.limit,status:req.query.status||'',sourceChannel:req.query.sourceChannel||req.query.source_channel||''})});}catch(error){res.status(500).json({ok:false,error:error.message});}
  });
  app.get('/api/val/action-orchestrator/candidates/:id',async(req,res)=>{
    try{await waitForDb();const candidate=await service.get(req.params.id);if(!candidate)return res.status(404).json({ok:false,error:'Action candidate not found'});res.json({ok:true,candidate,timeline:await service.timeline(req.params.id)});}catch(error){res.status(500).json({ok:false,error:error.message});}
  });
  app.post('/api/val/action-orchestrator/ingest',async(req,res)=>{
    try{await waitForDb();res.json(await service.ingest(req.body||{}));}catch(error){res.status(400).json({ok:false,error:error.message});}
  });
  app.post('/api/val/action-orchestrator/candidates/:id/prepare',async(req,res)=>{
    try{await waitForDb();const candidate=await service.prepare(req.params.id,req.body||{});if(!candidate)return res.status(404).json({ok:false,error:'Action candidate not found'});res.json({ok:true,candidate,no_external_action:true});}catch(error){res.status(400).json({ok:false,error:error.message});}
  });
  app.post('/api/val/action-orchestrator/candidates/:id/approve',async(req,res)=>{
    try{await waitForDb();const candidate=await service.approve(req.params.id,req.body||{});if(!candidate)return res.status(404).json({ok:false,error:'Action candidate not found'});res.json({ok:true,candidate,no_external_action:true});}catch(error){res.status(400).json({ok:false,error:error.message});}
  });
  app.post('/api/val/action-orchestrator/candidates/:id/execute',async(req,res)=>{
    try{await waitForDb();const result=await service.execute(req.params.id,req.body||{});if(!result)return res.status(404).json({ok:false,error:'Action candidate not found'});res.status(result.ok?200:409).json(result);}catch(error){res.status(400).json({ok:false,error:error.message});}
  });
  app.post('/api/val/action-orchestrator/candidates/:id/research',async(req,res)=>{
    try{await waitForDb();const result=await service.executeResearch(req.params.id,req.body||{});if(!result)return res.status(404).json({ok:false,error:'Action candidate not found'});res.status(result.ok?200:409).json(result);}catch(error){res.status(400).json({ok:false,error:error.message});}
  });
  return service;
}

module.exports={registerValActionOrchestratorRoutes};
