const test=require('node:test');
const assert=require('node:assert/strict');

const {createChiefOfStaffReasoner,fallbackChiefLanguage}=require('../services/valChiefOfStaffReasoning');

function packet(){
  return {
    id:'packet_hopemakers',
    sourceType:'email',
    sourceId:'email_hopemakers',
    packetType:'task_packet',
    title:'Send the revised HopeMakers scope to Ashley',
    summary:'Ashley asked for the revised HopeMakers scope before the Friday review.',
    evidence:[{
      source_type:'email',
      source_id:'email_hopemakers',
      quote_or_summary:'Ashley: Please send the revised HopeMakers scope before our Friday review.',
      confidence:0.94
    }],
    observers:[
      {observer:'Commitment',status:'observed',finding:'Ashley is waiting for the revised scope.',confidence:0.9},
      {observer:'Calendar',status:'observed',finding:'The Friday review creates a timing boundary.',confidence:0.85}
    ]
  };
}

test('Chief language is generated from any grounded packet without project-specific code',async()=>{
  const reasoner=createChiefOfStaffReasoner({
    callModel:async()=>JSON.stringify({
      title:'Send Ashley the revised HopeMakers scope',
      recommendation:'Send Ashley the revised HopeMakers scope before Friday’s review.',
      why:'Ashley is waiting, and the Friday review is the decision boundary.',
      action:'Send the revised scope to Ashley.',
      lead_observer:'Commitment',
      evidence_quote:'Ashley: Please send the revised HopeMakers scope before our Friday review.',
      confidence:0.91
    }),
    logger:{warn(){}}
  });
  const result=await reasoner({packet:packet(),priorities:[{label:'Commitments'}]});
  assert.equal(result.grounded,true);
  assert.match(result.recommendation,/Ashley/);
  assert.equal(result.leadObserver,'Commitment');
  assert.equal(result.evidenceRef.sourceId,'email_hopemakers');
});

test('Chief rejects invented evidence and falls back to the actual packet action',async()=>{
  const reasoner=createChiefOfStaffReasoner({
    callModel:async()=>JSON.stringify({
      title:'Repair the relationship',
      recommendation:'Call Ashley because she is frustrated.',
      why:'Trust is deteriorating.',
      action:'Call Ashley.',
      lead_observer:'Relationship',
      evidence_quote:'Ashley said she was frustrated.',
      confidence:0.99
    }),
    logger:{warn(){}}
  });
  const result=await reasoner({packet:packet()});
  assert.equal(result.grounded,false);
  assert.equal(result.recommendation,'Send the revised HopeMakers scope to Ashley');
  assert.doesNotMatch(result.why,/frustrat|deteriorat/i);
});

test('fallback Chief language keeps task packets direct and actionable',()=>{
  const result=fallbackChiefLanguage(packet());
  assert.equal(result.recommendation,'Send the revised HopeMakers scope to Ashley');
  assert.match(result.why,/Ashley asked/);
  assert.equal(result.leadObserver,'Commitment');
});

test('relationship-profile evidence cannot be mislabeled as Calendar',async()=>{
  const relationshipPacket={
    ...packet(),
    sourceType:'relationship_profile',
    packetType:'relationship_packet',
    observers:[
      {observer:'Relationship',status:'observed',finding:'The sent email still appears unanswered.',confidence:0.88},
      {observer:'Calendar',status:'observed',finding:'Time has passed since the message.',confidence:0.94},
      {observer:'Commitment',status:'observed',finding:'The follow-up loop remains open.',confidence:0.82}
    ]
  };
  const reasoner=createChiefOfStaffReasoner({
    callModel:async()=>JSON.stringify({
      title:'Ashley reply loop is open',
      recommendation:'Decide whether to follow up with Ashley.',
      why:'The sent email still appears unanswered.',
      action:'Decide whether to follow up with Ashley.',
      lead_observer:'Calendar',
      evidence_quote:'Ashley: Please send the revised HopeMakers scope before our Friday review.',
      confidence:0.9
    }),
    logger:{warn(){}}
  });
  const result=await reasoner({packet:relationshipPacket});
  assert.equal(result.grounded,true);
  assert.equal(result.leadObserver,'Relationship');
});
