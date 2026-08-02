const {createValSourceProcessingService}=require('./valSourceProcessing');

function parseLimit(value,defaultValue=50,max=200){
  return Math.max(1,Math.min(Number(value)||defaultValue,max));
}

function registerValSourceProcessingRoutes(app,deps={}){
  const service=deps.service||createValSourceProcessingService(deps);
  const waitForDb=typeof deps.valDbReady==='function'?deps.valDbReady:async()=>{};
  const auditLog=typeof deps.auditLog==='function'?deps.auditLog:async()=>{};
  const allowRelationshipDocumentEmailPost=typeof deps.allowRelationshipDocumentEmailPost==='function'?deps.allowRelationshipDocumentEmailPost:()=>true;
  const allowKnowledgeDocumentPost=typeof deps.allowKnowledgeDocumentPost==='function'?deps.allowKnowledgeDocumentPost:allowRelationshipDocumentEmailPost;
  const afterKnowledgeDocument=typeof deps.afterKnowledgeDocument==='function'?deps.afterKnowledgeDocument:async()=>null;

  app.post('/api/val/source-processing/knowledge-document',async(req,res)=>{
    try{
      if(!allowKnowledgeDocumentPost(req)){
        return res.status(401).json({ok:false,error:'Authentication required',no_external_action:true});
      }
      await waitForDb();
      const result=await service.processKnowledgeDocument(req.body||{});
      const observerDelivery=await afterKnowledgeDocument({input:req.body||{},result}).catch(error=>({
        status:'failed',
        error:error.message
      }));
      await auditLog({req,action:'source_processing_knowledge_document',resourceType:'source_processing_record',resourceId:result.sourceProcessingRecord?.id||'',metadata:{documentRead:result.documentRead===true,witnessingContextAvailable:result.witnessingContextAvailable===true,noExternalAction:true},success:true}).catch(()=>{});
      res.json({...result,observerDelivery});
    }catch(e){
      await auditLog({req,action:'source_processing_knowledge_document_failed',resourceType:'source_processing_record',metadata:{error:e.message,noExternalAction:true},success:false}).catch(()=>{});
      res.status(400).json({ok:false,error:e.message,no_external_action:true});
    }
  });

  app.post('/api/val/source-processing/relationship-document-email',async(req,res)=>{
    try{
      if(!allowRelationshipDocumentEmailPost(req)){
        return res.status(401).json({ok:false,error:'Authentication required',no_external_action:true});
      }
      await waitForDb();
      const result=await service.processRelationshipDocumentEmail(req.body||{});
      await auditLog({req,action:'source_processing_relationship_document_email',resourceType:'source_processing_record',resourceId:result.sourceProcessingRecord?.id||'',metadata:{reviewUpdateId:result.projectSuggestion?.id||'',readyForYouItemId:result.readyForYouItem?.id||'',noExternalAction:true},success:true}).catch(()=>{});
      res.json(result);
    }catch(e){
      await auditLog({req,action:'source_processing_relationship_document_email_failed',resourceType:'source_processing_record',metadata:{error:e.message,noExternalAction:true},success:false}).catch(()=>{});
      res.status(400).json({ok:false,error:e.message,no_external_action:true});
    }
  });

  app.get('/api/val/source-processing/records',async(req,res)=>{
    try{
      await waitForDb();
      res.json(await service.listSourceRecords({limit:parseLimit(req.query.limit,50)}));
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.get('/api/val/source-processing/surface-registrations',async(req,res)=>{
    try{
      await waitForDb();
      res.json(await service.listSurfaceRegistrations({
        surface:req.query.surface||'',
        status:req.query.status||'visible',
        reviewStatus:req.query.reviewStatus||'',
        limit:parseLimit(req.query.limit,50)
      }));
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  return service;
}

module.exports={registerValSourceProcessingRoutes};
