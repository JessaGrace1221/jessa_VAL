const {createValConversationIdentityService} = require('./valConversationIdentity');

function parseLimit(value,defaultValue=50,max=200){
  return Math.max(1,Math.min(Number(value)||defaultValue,max));
}

function registerValConversationIdentityRoutes(app,deps={}){
  const service=deps.service||createValConversationIdentityService(deps);
  const waitForDb=typeof deps.valDbReady==='function'?deps.valDbReady:async()=>{};
  const auditLog=typeof deps.auditLog==='function'?deps.auditLog:async()=>{};
  const afterEmailSync=typeof deps.afterEmailSync==='function'?deps.afterEmailSync:async()=>{};

  app.post('/api/val/email/sync',async(req,res)=>{
    try{
      await waitForDb();
      const providers=Array.isArray(req.body?.providers)?req.body.providers:String(req.body?.provider||'gmail,outlook').split(',').map(v=>v.trim()).filter(Boolean);
      const result=await service.syncEmail({providers,limit:parseLimit(req.body?.limit,50),query:req.body?.query||'newer_than:30d'});
      await afterEmailSync(result,{req,providers}).catch(error=>{result.boardPacketWarning=error.message;});
      await auditLog({req,action:'val_email_sync',resourceType:'email_messages',metadata:{saved:result.saved,providers:result.providers,unknowns:result.unknowns},success:true}).catch(()=>{});
      res.json(result);
    }catch(e){
      await auditLog({req,action:'val_email_sync_failed',resourceType:'email_messages',metadata:{error:e.message},success:false}).catch(()=>{});
      res.status(500).json({ok:false,error:e.message});
    }
  });

  app.post('/api/val/conversations/build-context',async(req,res)=>{
    try{
      await waitForDb();
      const context=await service.buildConversationContext(req.body||{});
      await auditLog({req,action:'val_conversation_context_built',resourceType:'unified_conversation',resourceId:context.conversationId||'',metadata:{state:context.conversation_state,temperature:context.relationship_temperature,unknowns:context.unknowns},success:true}).catch(()=>{});
      res.json(context);
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.post('/api/val/crm/resolve-identity',async(req,res)=>{
    try{
      await waitForDb();
      const result=await service.resolveIdentity(req.body||{});
      await auditLog({req,action:'val_crm_identity_resolved',resourceType:'crm_identity_resolution',resourceId:result.crm_contact_id||result.person_key||'',metadata:{matchStatus:result.match_status,confidence:result.match_confidence,recommendedAction:result.recommended_action},success:true}).catch(()=>{});
      res.json(result);
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.get('/api/val/conversations/:id',async(req,res,next)=>{
    if(req.params.id==='')return next();
    try{
      await waitForDb();
      res.json(await service.getConversation(req.params.id));
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  return service;
}

module.exports={registerValConversationIdentityRoutes};
