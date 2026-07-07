const {createValTranscriptIntelligenceService} = require('./valTranscriptIntelligence');

function registerValTranscriptIntelligenceRoutes(app,deps={}){
  const service=deps.service||createValTranscriptIntelligenceService(deps);
  const waitForDb=typeof deps.valDbReady==='function'?deps.valDbReady:async()=>{};
  const auditLog=typeof deps.auditLog==='function'?deps.auditLog:async()=>{};

  app.post('/api/val/transcripts/intake',async(req,res)=>{
    try{
      await waitForDb();
      const result=await service.intake(req.body||{});
      await auditLog({req,action:'transcript_intelligence_intake',resourceType:'transcript_intelligence_run',resourceId:result.run?.id||'',metadata:{transcriptId:result.run?.transcriptId,readyForYouCandidates:result.ready_for_you_candidates?.length||0,noExternalAction:true},success:true}).catch(()=>{});
      res.json(result);
    }catch(e){
      await auditLog({req,action:'transcript_intelligence_intake_failed',resourceType:'transcript_intelligence_run',metadata:{error:e.message},success:false}).catch(()=>{});
      res.status(500).json({ok:false,error:e.message});
    }
  });

  app.get('/api/val/transcripts/:id/intelligence',async(req,res)=>{
    try{
      await waitForDb();
      const run=await service.getIntelligence(req.params.id);
      if(!run)return res.status(404).json({ok:false,error:'Transcript intelligence not found'});
      res.json({ok:true,intelligence:run,no_external_action:true});
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.post('/api/val/transcripts/:id/prepare-follow-up',async(req,res)=>{
    try{
      await waitForDb();
      const result=await service.prepareFollowUp(req.params.id);
      await auditLog({req,action:'transcript_follow_up_prepared',resourceType:'transcript',resourceId:req.params.id,metadata:{candidateCount:result.ready_for_you_candidates?.length||0,noExternalAction:true},success:true}).catch(()=>{});
      res.json(result);
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  return service;
}

module.exports={registerValTranscriptIntelligenceRoutes};
