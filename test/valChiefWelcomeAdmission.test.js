const test=require('node:test');
const assert=require('node:assert/strict');

const {
  assessChiefWelcome,
  genericWelcomeFinding
}=require('../services/valChiefWelcomeAdmission');

const sourceRefs=[{
  source_type:'transcript',
  source_id:'transcript_goall',
  quote_or_summary:'Jessa agreed to finish the dashboard handoff before the weekly check-in.'
}];

test('Chief Welcome admits a specific evidence-backed Observer finding',()=>{
  const result=assessChiefWelcome({
    observerName:'Capacity',
    finding:'Five GOALL commitments need closure before the weekly check-in.',
    sourceRefs,
    confidence:0.86
  });
  assert.equal(result.passed,true);
});

test('Chief Welcome rejects atmospheric language even when evidence exists',()=>{
  const result=assessChiefWelcome({
    observerName:'Calendar',
    finding:'One thread is no longer asking to be carried.',
    sourceRefs,
    confidence:0.9
  });
  assert.equal(result.passed,false);
  assert.equal(result.reason,'generic_or_raw_finding');
});

test('Chief Welcome rejects raw transcript and placeholder language',()=>{
  assert.equal(genericWelcomeFinding('Action Items - [ ] Speaker_3 to contact {{contact.full_name}}.'),true);
  const result=assessChiefWelcome({
    observerName:'Relationship',
    finding:'{{contact.full_name}} may need relational attention.',
    sourceRefs,
    confidence:0.9
  });
  assert.equal(result.passed,false);
});
