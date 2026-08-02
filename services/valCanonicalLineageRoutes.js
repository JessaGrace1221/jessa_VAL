const {createValCanonicalLineageReconciliation}=require('./valCanonicalLineageReconciliation');

function registerValCanonicalLineageRoutes(app,deps={}){
  const service=deps.service||createValCanonicalLineageReconciliation(deps);
  const waitForDb=typeof deps.valDbReady==='function'?deps.valDbReady:async()=>{};
  const allowWrite=typeof deps.allowWrite==='function'?deps.allowWrite:()=>true;
  const auditLog=typeof deps.auditLog==='function'?deps.auditLog:async()=>{};

  app.post('/api/val/canonical-lineage/reconcile',async(req,res)=>{
    try{
      if(!allowWrite(req))return res.status(401).json({ok:false,error:'Authentication required'});
      await waitForDb();
      const result=await service.reconcile(req.body||{});
      await auditLog({
        req,
        action:'canonical_lineage_reconciled',
        resourceType:'canonical_lineage',
        metadata:result,
        success:result.ok
      }).catch(()=>{});
      res.status(result.ok?200:207).json(result);
    }catch(error){
      await auditLog({
        req,
        action:'canonical_lineage_reconciliation_failed',
        resourceType:'canonical_lineage',
        metadata:{error:error.message},
        success:false
      }).catch(()=>{});
      res.status(500).json({ok:false,error:error.message});
    }
  });

  return service;
}

module.exports={registerValCanonicalLineageRoutes};
