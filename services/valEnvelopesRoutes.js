const {createValEnvelopesService} = require('./valEnvelopes');

function registerValEnvelopesRoutes(app,deps={}){
  const service=deps.service||createValEnvelopesService(deps);
  const waitForDb=typeof deps.valDbReady==='function'?deps.valDbReady:async()=>{};

  app.get('/api/val/envelopes',async(req,res)=>{
    try{
      await waitForDb();
      const envelopes=await service.list({limit:req.query.limit||80,envelopeType:req.query.envelopeType||''});
      res.json({ok:true,envelopes,count:envelopes.length});
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  return service;
}

module.exports={registerValEnvelopesRoutes};
