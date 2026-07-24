const {createValBoardPacketsService} = require('./valBoardPackets');

function parseLimit(value,defaultValue=80,max=300){
  return Math.max(1,Math.min(Number(value)||defaultValue,max));
}

function registerValBoardPacketsRoutes(app,deps={}){
  const service=deps.service||createValBoardPacketsService(deps);
  const waitForDb=typeof deps.valDbReady==='function'?deps.valDbReady:async()=>{};
  const auditLog=typeof deps.auditLog==='function'?deps.auditLog:async()=>{};

  app.get('/api/val/board/packets',async(req,res)=>{
    try{
      await waitForDb();
      const packets=await service.listPackets({
        limit:parseLimit(req.query.limit,80),
        observerName:String(req.query.observerName||''),
        sourceType:String(req.query.sourceType||''),
        status:String(req.query.status||'active'),
        includePrototype:/^(1|true|yes)$/i.test(String(req.query.includePrototype||''))
      });
      res.json({ok:true,packets,count:packets.length});
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.get('/api/val/board/context',async(req,res)=>{
    try{
      await waitForDb();
      res.json({ok:true,...await service.boardContext({limit:parseLimit(req.query.limit,80),observerName:String(req.query.observerName||'')})});
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.get('/api/val/board/sources',async(req,res)=>{
    try{
      await waitForDb();
      res.json({ok:true,...await service.sourceReadiness({limit:parseLimit(req.query.limit,300,1000)})});
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.post('/api/val/board/packets',async(req,res)=>{
    try{
      await waitForDb();
      const packet=await service.createPacket(req.body||{});
      await auditLog({req,action:'val_board_packet_created',resourceType:'val_board_packet',resourceId:packet.id,metadata:{sourceType:packet.sourceType,sourceId:packet.sourceId,packetType:packet.packetType,prototype:packet.prototype},success:true}).catch(()=>{});
      res.json({ok:true,packet});
    }catch(e){
      await auditLog({req,action:'val_board_packet_create_failed',resourceType:'val_board_packet',metadata:{error:e.message},success:false}).catch(()=>{});
      res.status(500).json({ok:false,error:e.message});
    }
  });

  return service;
}

module.exports={registerValBoardPacketsRoutes};
