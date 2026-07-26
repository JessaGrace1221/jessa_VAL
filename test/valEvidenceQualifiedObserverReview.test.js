const test=require('node:test');
const assert=require('node:assert/strict');

const {createEvidenceQualifiedObserverReasoner}=require('../services/valEvidenceQualifiedObserverReview');

function packet(){
  return {
    id:'packet_goall',
    sourceType:'transcript',
    sourceId:'tr_goall',
    packetType:'meeting_evidence_packet',
    title:'GOALL dashboard handoff',
    summary:'A dashboard handoff was discussed.',
    sourceRefsJson:[{
      source_type:'transcript',
      source_id:'tr_goall',
      quote_or_summary:'Jessa will finish the GOALL dashboard handoff for Mike.',
      confidence:0.98
    }]
  };
}

test('Observer accepts a model finding only with exact packet evidence',async()=>{
  const reasoner=createEvidenceQualifiedObserverReasoner({
    observerLenses:{Commitment:{lens:'promises',sees:'promises and follow-through'}},
    callModel:async()=>JSON.stringify({reviews:[{
      packetId:'packet_goall',
      status:'observed',
      observation:'Jessa made a concrete promise to finish the handoff.',
      useful_context:['The commitment belongs to GOALL.'],
      evidence_quote:'Jessa will finish the GOALL dashboard handoff for Mike.',
      confidence:0.91
    }]})
  });
  const output=await reasoner({
    observerName:'Commitment',
    contextPacket:{event:{packetIds:['packet_goall']},boardPackets:[packet()]},
    deterministicOutput:{observer:'Commitment'}
  });
  assert.equal(output.packetReviews[0].status,'observed');
  assert.equal(output.packetReviews[0].reflectionMode,'model_backed_evidence_review_v1');
  assert.equal(output.evidence[0].quote_or_summary,'Jessa will finish the GOALL dashboard handoff for Mike.');
});

test('invented or paraphrased evidence becomes an honest no-signal receipt',async()=>{
  const reasoner=createEvidenceQualifiedObserverReasoner({
    callModel:async()=>JSON.stringify({reviews:[{
      packetId:'packet_goall',
      status:'observed',
      observation:'Mike is frustrated.',
      evidence_quote:'Mike sounded deeply frustrated.',
      confidence:0.99
    }]})
  });
  const output=await reasoner({
    observerName:'Relationship',
    contextPacket:{event:{packetIds:['packet_goall']},boardPackets:[packet()]},
    deterministicOutput:{observer:'Relationship'}
  });
  assert.equal(output.packetReviews[0].status,'no_signal');
  assert.equal(output.observation,'No meaningful signal from my lens.');
  assert.deepEqual(output.evidence,[]);
});

test('every targeted packet receives a receipt even when the model omits it',async()=>{
  const reasoner=createEvidenceQualifiedObserverReasoner({
    callModel:async()=>JSON.stringify({reviews:[]})
  });
  const second={...packet(),id:'packet_second',sourceId:'tr_second'};
  const output=await reasoner({
    observerName:'Capacity',
    contextPacket:{event:{packetIds:['packet_goall','packet_second']},boardPackets:[packet(),second]},
    deterministicOutput:{observer:'Capacity'}
  });
  assert.equal(output.packetReviews.length,2);
  assert.ok(output.packetReviews.every(review=>review.status==='no_signal'));
});

test('Observer can cite exact evidence from the complete packet chunk beyond the display excerpt',async()=>{
  const tailQuote='Mike: The final projections must be ready before the Monday check-in.';
  const fullEvidence=`${'Earlier transcript context. '.repeat(80)}${tailQuote}`;
  const sourcePacket={
    ...packet(),
    payloadJson:{evidenceContent:fullEvidence},
    sourceRefsJson:[{
      source_type:'transcript',
      source_id:'tr_goall',
      quote_or_summary:fullEvidence.slice(0,900),
      confidence:1
    }]
  };
  const reasoner=createEvidenceQualifiedObserverReasoner({
    callModel:async()=>JSON.stringify({reviews:[{
      packetId:'packet_goall',
      status:'observed',
      observation:'The Monday check-in creates a concrete timing boundary.',
      useful_context:['Projections are due before the check-in.'],
      evidence_quote:tailQuote,
      confidence:0.9
    }]})
  });
  const output=await reasoner({
    observerName:'Calendar',
    contextPacket:{event:{packetIds:['packet_goall']},boardPackets:[sourcePacket]},
    deterministicOutput:{observer:'Calendar'}
  });
  assert.equal(output.packetReviews[0].status,'observed');
  assert.equal(output.evidence[0].quote_or_summary,tailQuote);
});
