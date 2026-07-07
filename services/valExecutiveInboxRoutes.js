const {createValExecutiveInboxService} = require('./valExecutiveInbox');

function registerValExecutiveInboxRoutes(app,deps={}){
  const service=deps.service||createValExecutiveInboxService(deps);
  const waitForDb=typeof deps.valDbReady==='function'?deps.valDbReady:async()=>{};
  const auditLog=typeof deps.auditLog==='function'?deps.auditLog:async()=>{};

  app.post('/api/val/executive-inbox/classify-conversation',async(req,res)=>{
    try{
      await waitForDb();
      const result=await service.classifyConversation(req.body||{});
      await auditLog({req,action:'executive_inbox_conversation_classified',resourceType:'conversation_classification',resourceId:result.classification?.id||'',metadata:{priority:result.classification?.priority_level,meaning:result.classification?.executive_meaning,conversationId:result.context?.conversationId},success:true}).catch(()=>{});
      res.json(result);
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.post('/api/val/executive-inbox/classify-batch',async(req,res)=>{
    try{
      await waitForDb();
      const result=await service.classifyBatch(req.body||{});
      await auditLog({req,action:'executive_inbox_batch_classified',resourceType:'conversation_classification',metadata:{count:result.count,classified:result.classified},success:true}).catch(()=>{});
      res.json(result);
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.post('/api/val/email/draft-readiness',async(req,res)=>{
    try{
      await waitForDb();
      const result=await service.draftReadiness(req.body||{});
      await auditLog({req,action:'email_draft_readiness_evaluated',resourceType:'email_draft_evaluation',resourceId:result.evaluation?.id||'',metadata:{status:result.readiness?.status,representationRisk:result.readiness?.representation_risk},success:true}).catch(()=>{});
      res.json(result);
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.post('/api/val/email/draft-brief',async(req,res)=>{
    try{
      await waitForDb();
      const result=await service.draftBrief(req.body||{});
      await auditLog({req,action:'email_draft_brief_built',resourceType:'email_draft_evaluation',resourceId:result.evaluation?.id||'',metadata:{status:result.readiness?.status,draftType:result.draft_brief?.draft_type},success:true}).catch(()=>{});
      res.json(result);
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.post('/api/val/email/draft-qa',async(req,res)=>{
    try{
      await waitForDb();
      const result=await service.draftQa(req.body||{});
      await auditLog({req,action:'email_draft_qa_evaluated',resourceType:'email_draft_evaluation',resourceId:result.evaluation?.id||'',metadata:{result:result.qa?.result,passes:result.qa?.passes,issues:result.qa?.issues||[]},success:true}).catch(()=>{});
      res.json(result);
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.post('/api/val/email/generate-draft',async(req,res)=>{
    try{
      await waitForDb();
      const result=await service.generateDraft(req.body||{});
      await auditLog({req,action:'email_review_only_draft_generated',resourceType:'draft',resourceId:result.draft?.id||'',metadata:{status:result.status,draftType:result.writer_output?.draft_type,source:'executive_inbox_review_only',qaResult:result.qa?.result,revisedOnce:!!result.revised_once,noExternalAction:true},success:true}).catch(()=>{});
      res.json(result);
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.post('/api/val/email/revise-draft',async(req,res)=>{
    try{
      await waitForDb();
      const result=await service.reviseDraft(req.body||{});
      await auditLog({req,action:'email_review_only_draft_revised',resourceType:'draft',resourceId:result.draft?.id||'',metadata:{status:result.status,source:'executive_inbox_review_only',qaResult:result.qa?.result,noExternalAction:true},success:true}).catch(()=>{});
      res.json(result);
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.get('/api/val/email/review-drafts',async(req,res)=>{
    try{
      await waitForDb();
      const result=await service.reviewDrafts({limit:req.query.limit,status:req.query.status||''});
      res.json(result);
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  return service;
}

module.exports={registerValExecutiveInboxRoutes};
