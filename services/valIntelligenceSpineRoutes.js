const {createValIntelligenceSpine} = require('./valIntelligenceSpine');
const {buildObserverEvidenceLedger} = require('./valObserverEvidence');

function parseLimit(value,defaultValue=30,max=200){
  return Math.max(1,Math.min(Number(value)||defaultValue,max));
}

function registerValIntelligenceSpineRoutes(app,deps={}){
  const spine = deps.spine || createValIntelligenceSpine(deps);
  const waitForDb = typeof deps.valDbReady === 'function' ? deps.valDbReady : async()=>{};
  const auditLog = typeof deps.auditLog === 'function' ? deps.auditLog : async()=>{};
  const completeCanonicalWorkItem = typeof deps.completeCanonicalWorkItem === 'function' ? deps.completeCanonicalWorkItem : null;

  app.post('/api/val/events/intelligence-pass',async(req,res)=>{
    try{
      await waitForDb();
      const result=await spine.runIntelligencePass({
        event:req.body?.event||{type:req.body?.eventType||'manual',sourceType:req.body?.sourceType||'api',sourceId:req.body?.sourceId||''},
        req,
        includeExternal:!!req.body?.includeExternal
      });
      await auditLog({req,action:'val_intelligence_pass',resourceType:'event_intelligence_run',resourceId:result.eventRun?.id,metadata:{observerRuns:result.observerRuns.length,roundTableRunId:result.roundTable?.id,chiefRecommendationId:result.recommendation?.id,stubbed:result.stubbed},success:true}).catch(()=>{});
      res.json(result);
    }catch(e){
      await auditLog({req,action:'val_intelligence_pass_failed',resourceType:'event_intelligence_run',metadata:{error:e.message},success:false}).catch(()=>{});
      res.status(500).json({ok:false,error:e.message});
    }
  });

  app.get('/api/val/observers/runs',async(req,res)=>{
    try{
      await waitForDb();
      res.json({ok:true,runs:await spine.listObserverRuns({limit:parseLimit(req.query.limit,30),eventRunId:String(req.query.eventRunId||''),observerName:String(req.query.observerName||'')})});
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.get('/api/val/observers/evidence',async(req,res)=>{
    try{
      await waitForDb();
      const observerName=String(req.query.observerName||'');
      const runs=await spine.listObserverRuns({
        limit:parseLimit(req.query.limit,200),
        observerName
      });
      res.json({ok:true,...buildObserverEvidenceLedger(runs,{observerName})});
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.get('/api/val/round-table/runs',async(req,res)=>{
    try{
      await waitForDb();
      res.json({ok:true,runs:await spine.listRoundTableRuns({limit:parseLimit(req.query.limit,30),eventRunId:String(req.query.eventRunId||'')})});
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.post('/api/val/chief-of-staff/recommend',async(req,res)=>{
    try{
      await waitForDb();
      let result;
      if(req.body?.roundTableRunId||req.body?.eventRunId){
        result=await spine.recommendChiefOfStaff({roundTableRunId:String(req.body.roundTableRunId||''),eventRunId:String(req.body.eventRunId||'')});
      }else{
        const pass=await spine.runIntelligencePass({event:{type:'chief_recommendation_request',sourceType:'api'},req,includeExternal:!!req.body?.includeExternal});
        result=pass.recommendation;
      }
      await auditLog({req,action:'chief_of_staff_recommendation_created',resourceType:'chief_of_staff_recommendation',resourceId:result?.id,metadata:{roundTableRunId:result?.roundTableRunId||result?.round_table_run_id||''},success:true}).catch(()=>{});
      res.json({ok:true,recommendation:result});
    }catch(e){
      await auditLog({req,action:'chief_of_staff_recommendation_failed',resourceType:'chief_of_staff_recommendation',metadata:{error:e.message},success:false}).catch(()=>{});
      res.status(500).json({ok:false,error:e.message});
    }
  });

  app.post('/api/val/chief-of-staff/:id/complete',async(req,res)=>{
    try{
      await waitForDb();
      const canonicalWorkItemId=String(req.body?.canonicalWorkItemId||req.body?.canonical_work_item_id||req.body?.feedback?.canonicalWorkItemId||req.body?.feedback?.canonical_work_item_id||'').trim();
      let canonicalWork=null;
      if(canonicalWorkItemId&&completeCanonicalWorkItem){
        canonicalWork=await completeCanonicalWorkItem(canonicalWorkItemId,{
          status:'complete',
          eventType:'alignment_marked_done',
          payload:{
            surface:'home_alignment',
            chiefRecommendationId:req.params.id,
            chiefQueuePacketId:req.body?.feedback?.packetId||req.body?.feedback?.chiefQueuePacketId||''
          }
        });
      }
      const recommendation=await spine.completeChiefRecommendation(req.params.id,{feedback:req.body?.feedback||{},completionNote:req.body?.completionNote||req.body?.note||'',outcome:req.body?.outcome||'completed'});
      if(!recommendation)return res.status(404).json({ok:false,error:'Recommendation not found'});
      await auditLog({req,action:'chief_of_staff_recommendation_completed',resourceType:'chief_of_staff_recommendation',resourceId:req.params.id,metadata:{outcome:recommendation.status||'completed'},success:true}).catch(()=>{});
      res.json({ok:true,recommendation,canonicalWork});
    }catch(e){
      await auditLog({req,action:'chief_of_staff_recommendation_complete_failed',resourceType:'chief_of_staff_recommendation',resourceId:req.params.id,metadata:{error:e.message},success:false}).catch(()=>{});
      res.status(500).json({ok:false,error:e.message});
    }
  });

  app.post('/api/val/events/intelligence-retry',async(req,res)=>{
    try{
      await waitForDb();
      const result=await spine.retryFailedIntelligenceRuns({limit:req.body?.limit||10});
      await auditLog({req,action:'val_intelligence_delivery_retry',resourceType:'event_intelligence_run',metadata:result,success:result.ok}).catch(()=>{});
      res.status(result.ok?200:207).json(result);
    }catch(e){
      await auditLog({req,action:'val_intelligence_delivery_retry_failed',resourceType:'event_intelligence_run',metadata:{error:e.message},success:false}).catch(()=>{});
      res.status(500).json({ok:false,error:e.message});
    }
  });

  return spine;
}

module.exports = {registerValIntelligenceSpineRoutes};
