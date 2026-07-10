const {createValMeetingPrepService} = require('./valMeetingPrep');

function registerValMeetingPrepRoutes(app,deps={}){
  const service=deps.service||createValMeetingPrepService(deps);
  const waitForDb=typeof deps.valDbReady==='function'?deps.valDbReady:async()=>{};
  const auditLog=typeof deps.auditLog==='function'?deps.auditLog:async()=>{};

  app.post('/api/val/calendar/meeting-prep',async(req,res)=>{
    try{
      await waitForDb();
      const result=await service.buildMeetingPrep(req.body||{});
      if(result&&result.ok===false){
        await auditLog({req,action:'calendar_meeting_prep_skipped',resourceType:'meeting_prep_brief',resourceId:'',metadata:{calendarEventId:result.calendarEventId,code:result.code,noExternalAction:true},success:true}).catch(()=>{});
        return res.status(result.code==='not_a_meeting'?422:400).json(result);
      }
      await auditLog({req,action:'calendar_meeting_prep_built',resourceType:'meeting_prep_brief',resourceId:result.brief?.id||'',metadata:{calendarEventId:result.brief?.calendarEventId,status:result.brief?.status,noExternalAction:true},success:true}).catch(()=>{});
      res.json(result);
    }catch(e){
      await auditLog({req,action:'calendar_meeting_prep_failed',resourceType:'meeting_prep_brief',metadata:{error:e.message},success:false}).catch(()=>{});
      res.status(500).json({ok:false,error:e.message});
    }
  });

  app.get('/api/val/calendar/meeting-prep/:eventId',async(req,res)=>{
    try{
      await waitForDb();
      const brief=await service.getMeetingPrep(req.params.eventId);
      if(!brief)return res.status(404).json({ok:false,error:'Meeting prep brief not found'});
      res.json({ok:true,brief,no_external_action:true});
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.post('/api/val/calendar/post-meeting-capture',async(req,res)=>{
    try{
      await waitForDb();
      const result=await service.postMeetingCapture(req.body||{});
      if(!result.ok)return res.status(404).json(result);
      await auditLog({req,action:'calendar_post_meeting_capture_recorded',resourceType:'meeting_prep_brief',resourceId:result.brief?.id||'',metadata:{calendarEventId:result.brief?.calendarEventId,noExternalAction:true},success:true}).catch(()=>{});
      res.json(result);
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  return service;
}

module.exports={registerValMeetingPrepRoutes};
