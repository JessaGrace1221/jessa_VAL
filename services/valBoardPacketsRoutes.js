const {createValBoardPacketsService} = require('./valBoardPackets');

function parseLimit(value,defaultValue=80,max=300){
  return Math.max(1,Math.min(Number(value)||defaultValue,max));
}

function registerValBoardPacketsRoutes(app,deps={}){
  const service=deps.service||createValBoardPacketsService(deps);
  const waitForDb=typeof deps.valDbReady==='function'?deps.valDbReady:async()=>{};
  const auditLog=typeof deps.auditLog==='function'?deps.auditLog:async()=>{};
  const processSourceEvent=typeof deps.processSourceEvent==='function'?deps.processSourceEvent:null;

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
      res.json({ok:true,...await service.boardContext({
        limit:parseLimit(req.query.limit,80),
        observerName:String(req.query.observerName||''),
        compact:/^(1|true|yes)$/i.test(String(req.query.compact||''))
      })});
    }catch(e){res.status(500).json({ok:false,error:e.message});}
  });

  app.get('/api/val/board/status',async(req,res)=>{
    try{
      await waitForDb();
      res.json({ok:true,...await service.witnessingStatus()});
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
      const input=req.body||{};
      if(!input.prototype){
        if(!processSourceEvent){
          return res.status(503).json({ok:false,error:'Canonical source intake is unavailable. Live Board packets cannot bypass source processing.'});
        }
        const sourceType=String(input.sourceType||input.source_type||'');
        const sourceId=String(input.sourceId||input.source_id||'');
        const rawText=String(input.rawText||input.raw_text||input.summary||input.description||'');
        if(!sourceType||!sourceId||!rawText){
          return res.status(400).json({ok:false,error:'Live Board evidence requires sourceType, sourceId, and readable source text.'});
        }
        const result=await processSourceEvent({
          sourceType,
          sourceId,
          sourceTitle:String(input.title||input.packetType||input.packet_type||sourceType),
          rawText,
          sourceRefs:input.sourceRefs||input.source_refs||input.sourceRefsJson||input.source_refs_json||[],
          createdAt:input.createdAt||input.created_at||'',
          domainRoutes:input.domainRoutes||input.domain_routes||['board_of_observers'],
          metadata:{
            source:'board_packet_canonical_ingress',
            boardPacketType:input.packetType||input.packet_type||''
          }
        });
        const packets=result?.sourcePackets||[];
        await auditLog({req,action:'val_board_packet_canonicalized',resourceType:'source_processing_record',resourceId:result?.sourceProcessingRecord?.id||'',metadata:{sourceType,sourceId,packetIds:packets.map(packet=>packet.id)},success:true}).catch(()=>{});
        return res.json({ok:true,packet:packets[0]||null,packets,sourceProcessingRecord:result?.sourceProcessingRecord||null,deduplicated:!!result?.deduplicated});
      }
      const packet=await service.createPacket(input);
      await auditLog({req,action:'val_board_packet_created',resourceType:'val_board_packet',resourceId:packet.id,metadata:{sourceType:packet.sourceType,sourceId:packet.sourceId,packetType:packet.packetType,prototype:packet.prototype},success:true}).catch(()=>{});
      res.json({ok:packet.status==='active',packet,rejected:packet.status!=='active',rejectionReason:packet.payloadJson?.sourceValidation?.rejectionReason||''});
    }catch(e){
      await auditLog({req,action:'val_board_packet_create_failed',resourceType:'val_board_packet',metadata:{error:e.message},success:false}).catch(()=>{});
      res.status(500).json({ok:false,error:e.message});
    }
  });

  app.post('/api/val/board/events/:sourceType',async(req,res)=>{
    try{
      await waitForDb();
      if(!processSourceEvent){
        return res.status(503).json({ok:false,error:'Canonical source intake is unavailable. Live Board events cannot bypass source processing.'});
      }
      const sourceType=String(req.params.sourceType||'');
      const event=req.body||{};
      const sourceId=String(event.sourceId||event.source_id||event.id||'');
      const rawText=String(event.rawText||event.raw_text||event.summary||event.body||event.text||'');
      if(!sourceType||!sourceId||!rawText){
        return res.status(400).json({ok:false,error:'Live Board evidence requires sourceType, sourceId, and readable source text.'});
      }
      const result=await processSourceEvent({
        sourceType,
        sourceId,
        sourceTitle:String(event.title||event.subject||event.eventType||event.event_type||sourceType),
        rawText,
        sourceRefs:event.sourceRefs||event.source_refs||event.sourceRefsJson||event.source_refs_json||[],
        createdAt:event.createdAt||event.created_at||event.timestamp||'',
        domainRoutes:event.domainRoutes||event.domain_routes||['board_of_observers'],
        metadata:{
          source:'board_source_event_ingress',
          eventType:event.eventType||event.event_type||'source_event',
          boardPacketType:event.packetType||event.packet_type||''
        }
      });
      const packets=result?.sourcePackets||[];
      const packet=packets[0]||result?.sourcePacket||null;
      await auditLog({req,action:'val_board_source_event_processed',resourceType:'source_processing_record',resourceId:result?.sourceProcessingRecord?.id||'',metadata:{sourceType,sourceId,packetIds:packets.map(item=>item.id),deduplicated:!!result?.deduplicated},success:true}).catch(()=>{});
      return res.json({ok:true,packet,packets,sourceProcessingRecord:result?.sourceProcessingRecord||null,deduplicated:!!result?.deduplicated,rejected:false});
    }catch(e){
      await auditLog({req,action:'val_board_source_event_failed',resourceType:'val_board_packet',metadata:{sourceType:req.params.sourceType,error:e.message},success:false}).catch(()=>{});
      res.status(500).json({ok:false,error:e.message});
    }
  });

  return service;
}

module.exports={registerValBoardPacketsRoutes};
