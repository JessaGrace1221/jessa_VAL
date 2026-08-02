const test=require('node:test');
const assert=require('node:assert/strict');

const {
  MIN_ALIGNMENT_CONFIDENCE,
  assessAlignmentAdmission
}=require('../services/valAlignmentAdmission');

const evidence=[{
  source_type:'relationship_profile',
  source_id:'rel_bridget',
  quote_or_summary:'Sent email appears to need a response and no later reply was found.',
  confidence:0.42
}];

test('Alignment rejects structurally complete but generic Chief language',()=>{
  const result=assessAlignmentAdmission({
    actionText:'Inspect the evidence for "Bridget Biermann (3 of 3)" and choose the next move.',
    objectText:'Review "Bridget Biermann (3 of 3)" before choosing an action.',
    exactSourceQuote:evidence[0].quote_or_summary,
    sourceRefs:evidence,
    confidence:0.9
  });
  assert.equal(result.passed,false);
  assert.equal(result.reason,'generic_chief_language');
});

test('Alignment keeps low-confidence observations with the Board',()=>{
  const result=assessAlignmentAdmission({
    actionText:'Decide whether to follow up with Bridget Biermann or close the open response loop.',
    objectText:'Bridget Biermann response loop',
    exactSourceQuote:evidence[0].quote_or_summary,
    sourceRefs:evidence,
    confidence:MIN_ALIGNMENT_CONFIDENCE-0.01
  });
  assert.equal(result.passed,false);
  assert.equal(result.reason,'confidence_below_alignment_floor');
});

test('Alignment admits a concrete source-backed executive action',()=>{
  const result=assessAlignmentAdmission({
    actionText:'Send Ashley the revised HopeMakers scope before Friday.',
    objectText:'Revised HopeMakers scope for Ashley',
    exactSourceQuote:'Ashley: Please send the revised HopeMakers scope before our Friday review.',
    sourceRefs:[{source_type:'email',source_id:'email_1',quote_or_summary:'Ashley: Please send the revised HopeMakers scope before our Friday review.',confidence:0.94}],
    confidence:0.91
  });
  assert.equal(result.passed,true);
  assert.equal(result.reason,'grounded_executive_action');
});
