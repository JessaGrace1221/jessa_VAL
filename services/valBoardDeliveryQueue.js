function safeArray(value){return Array.isArray(value)?value:[];}

function createValBoardDeliveryQueue({
  deliverBatch,
  batchSize=20,
  delayMs=250,
  logger=console
}={}){
  if(typeof deliverBatch!=='function')throw new Error('Board delivery queue requires deliverBatch.');
  const pending=new Map();
  let timer=null;
  let draining=false;
  let idleResolvers=[];

  function resolveIdle(){
    if(draining||pending.size||timer)return;
    const resolvers=idleResolvers;
    idleResolvers=[];
    for(const resolve of resolvers)resolve();
  }
  function batchEvent(entries=[]){
    const events=entries.map(entry=>entry.event||{});
    const types=[...new Set(events.map(event=>event.type).filter(Boolean))];
    const sourceTypes=[...new Set(events.map(event=>event.sourceType).filter(Boolean))];
    const sourceIds=[...new Set(events.map(event=>event.sourceId).filter(Boolean))];
    return {
      type:types.length===1?types[0]:'board_packet_batch',
      sourceType:sourceTypes.length===1?sourceTypes[0]:'canonical_batch',
      sourceId:sourceIds.length===1?sourceIds[0]:`batch_${Date.now()}`,
      packetIds:entries.map(entry=>entry.packet.id)
    };
  }
  async function drain(){
    if(draining)return;
    if(timer){clearTimeout(timer);timer=null;}
    draining=true;
    try{
      while(pending.size){
        const entries=[...pending.values()].slice(0,Math.max(1,Math.min(Number(batchSize)||20,20)));
        for(const entry of entries)pending.delete(entry.packet.id);
        try{
          await deliverBatch(entries.map(entry=>entry.packet),batchEvent(entries));
        }catch(error){
          logger.warn?.('[val-board] queued Observer delivery deferred:',error.message);
        }
      }
    }finally{
      draining=false;
      resolveIdle();
    }
  }
  function enqueue(packets=[],event={}){
    for(const packet of safeArray(packets)){
      if(!packet?.id||packet.prototype||packet.status!=='active')continue;
      pending.set(packet.id,{packet,event});
    }
    if(pending.size&&!draining&&!timer){
      timer=setTimeout(()=>{timer=null;void drain();},Math.max(0,Number(delayMs)||0));
      timer.unref?.();
    }
    return {queued:pending.size};
  }
  function whenIdle(){
    if(!draining&&!pending.size&&!timer)return Promise.resolve();
    return new Promise(resolve=>idleResolvers.push(resolve));
  }
  return {enqueue,flush:drain,whenIdle,pendingCount:()=>pending.size,isDraining:()=>draining};
}

module.exports={createValBoardDeliveryQueue};
