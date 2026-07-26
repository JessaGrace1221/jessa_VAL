const test=require('node:test');
const assert=require('node:assert/strict');
const {createValBoardDeliveryQueue}=require('../services/valBoardDeliveryQueue');

function packet(id){return {id,status:'active',prototype:false};}

test('Board delivery queue batches packet bursts into one sequential intelligence pass',async()=>{
  const deliveries=[];
  const queue=createValBoardDeliveryQueue({
    delayMs:0,
    batchSize:20,
    deliverBatch:async(packets,event)=>{
      deliveries.push({ids:packets.map(item=>item.id),event});
    }
  });
  queue.enqueue([packet('p1')],{type:'task',sourceType:'task',sourceId:'w1'});
  queue.enqueue([packet('p2'),packet('p3')],{type:'task',sourceType:'task',sourceId:'w2'});
  await queue.flush();
  assert.equal(deliveries.length,1);
  assert.deepEqual(deliveries[0].ids,['p1','p2','p3']);
  assert.equal(deliveries[0].event.type,'task');
  assert.equal(deliveries[0].event.sourceType,'task');
  assert.equal(deliveries[0].event.packetIds.length,3);
});

test('Board delivery queue deduplicates packet IDs and ignores prototypes',async()=>{
  const deliveries=[];
  const queue=createValBoardDeliveryQueue({
    delayMs:0,
    deliverBatch:async packets=>deliveries.push(packets.map(item=>item.id))
  });
  queue.enqueue([packet('p1'),packet('p1'),{...packet('demo'),prototype:true}]);
  await queue.flush();
  assert.deepEqual(deliveries,[['p1']]);
});
