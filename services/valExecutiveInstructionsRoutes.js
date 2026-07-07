const {extractExecutiveInstructions}=require('./valExecutiveInstructions');

function registerValExecutiveInstructionRoutes(app,deps={}){
  const waitForDb=typeof deps.valDbReady==='function'?deps.valDbReady:async()=>{};
  const auditLog=typeof deps.auditLog==='function'?deps.auditLog:async()=>{};

  app.post('/api/val/executive-instructions/extract',async(req,res)=>{
    try{
      await waitForDb();
      const sourceType=String(req.body?.sourceType||req.body?.source_type||req.body?.channel||'chat');
      const sourceId=String(req.body?.sourceId||req.body?.source_id||req.body?.eventId||'');
      const result=extractExecutiveInstructions({
        text:req.body?.text||req.body?.transcript||req.body?.message||'',
        sourceType,
        sourceId,
        authenticatedUserNames:req.body?.authenticatedUserNames||req.body?.authenticated_user_names||[],
        trustedAuthenticatedUser:req.body?.trustedAuthenticatedUser!==false,
        createdAt:req.body?.createdAt||req.body?.created_at||new Date().toISOString()
      });
      await auditLog({req,action:'executive_instructions_extracted',resourceType:'val_executive_instruction',resourceId:sourceId,metadata:{sourceType,count:result.executive_instructions.length,noExternalAction:true},success:true}).catch(()=>{});
      res.json({ok:true,...result,no_external_action:true,execution_available:false});
    }catch(e){
      await auditLog({req,action:'executive_instructions_extract_failed',resourceType:'val_executive_instruction',metadata:{error:e.message},success:false}).catch(()=>{});
      res.status(500).json({ok:false,error:e.message});
    }
  });
}

module.exports={registerValExecutiveInstructionRoutes};
