const {createValDocumentsService}=require('./valDocuments');

function registerValDocumentsRoutes(app,deps={}){
  const service=deps.service||createValDocumentsService(deps);
  const waitForDb=typeof deps.valDbReady==='function'?deps.valDbReady:async()=>{};
  const auditLog=typeof deps.auditLog==='function'?deps.auditLog:async()=>{};
  const afterDocumentEvent=typeof deps.afterDocumentEvent==='function'?deps.afterDocumentEvent:null;

  app.get('/api/val/documents',async(req,res)=>{
    try{
      await waitForDb();
      const result=await service.list({
        q:req.query.q||req.query.query||'',
        relationship:req.query.relationship||'',
        project:req.query.project||'',
        limit:req.query.limit||120,
        includeGoogle:req.query.includeGoogle==='true'
      });
      res.json(result);
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.get('/api/val/documents/reference',async(req,res)=>{
    try{
      await waitForDb();
      const result=await service.referenceFor({
        relationship:req.query.relationship||'',
        project:req.query.project||'',
        limit:req.query.limit||12
      });
      res.json(result);
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.get('/api/val/documents/:id',async(req,res)=>{
    try{
      await waitForDb();
      const document=await service.get(req.params.id);
      if(!document)return res.status(404).json({ok:false,error:'Document not found'});
      res.json({ok:true,document,referenceRule:'VAL must use linked documents as source evidence for relationship and project judgment.'});
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.post('/api/val/documents/:id/reference-used',async(req,res)=>{
    try{
      await waitForDb();
      const document=await service.get(req.params.id);
      if(!document)return res.status(404).json({ok:false,error:'Document not found'});
      if(afterDocumentEvent){
        await afterDocumentEvent({
          id:document.id,
          eventType:'document_reference_used',
          sourceType:'document',
          sourceId:document.sourceId||document.id,
          title:document.title,
          summary:document.summary||document.bodyPreview||document.referenceUse||'Document reference was opened for context.',
          relationship:req.body?.relationship||document.relationship||'',
          projectName:req.body?.project||document.project||'',
          sourceRefs:document.sourceRefs||[],
          noExternalAction:true
        }).catch(()=>null);
      }
      await auditLog({req,action:'val_document_reference_used',resourceType:'val_document',resourceId:req.params.id,metadata:{relationship:req.body?.relationship||document.relationship||'',project:req.body?.project||document.project||'',externalActionTaken:false},success:true}).catch(()=>{});
      res.json({ok:true,document,no_external_action:true,referenceRecorded:true});
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  return service;
}

module.exports={registerValDocumentsRoutes};
