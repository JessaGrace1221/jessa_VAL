const test=require('node:test');
const assert=require('node:assert/strict');
const {createValResearchExecution,finishResearchHandoff,resultIdentityConfidence,identityQueries}=require('../services/valResearchExecution');

test('known LinkedIn URL is the strongest identity proof and drives post queries',()=>{
  const identity={person_name:'Greg Zlevor',verified_email:'gzlevor@westwoodintl.com',known_linkedin_url:'https://www.linkedin.com/in/gregzlevor/'};
  const queries=identityQueries(identity,'What changed publicly?');
  assert.ok(queries.includes('site:linkedin.com/posts "gregzlevor"'));
  const match=resultIdentityConfidence({url:'https://www.linkedin.com/posts/gregzlevor_leadership-activity-123',title:'Greg Zlevor on leadership'},identity);
  assert.equal(match.accepted,true);
  assert.equal(match.reason,'known_linkedin_url_match');
  assert.equal(match.confidence,0.99);
});

test('verified email and name-domain fallback accept only URL-backed identity matches',()=>{
  const identity={person_name:'Jessa Grace',verified_email:'jessa@jessagrace.com',verified_domain:'jessagrace.com'};
  assert.equal(resultIdentityConfidence({url:'https://example.com/profile',snippet:'Contact jessa@jessagrace.com'},identity).reason,'verified_email_match');
  assert.equal(resultIdentityConfidence({url:'https://jessagrace.com/about',title:'About Jessa Grace'},identity).reason,'verified_name_and_domain_match');
  assert.equal(resultIdentityConfidence({title:'Jessa Grace without a source URL'},identity).accepted,false);
  assert.equal(resultIdentityConfidence({url:'https://unrelated.example/person',title:'Different person'},identity).accepted,false);
});

test('research execution rejects ambiguous results and retains a human-readable no-result reason',async()=>{
  const service=createValResearchExecution({
    runSearch:async queries=>({queries,results:[
      {title:'A different Greg',url:'https://example.com/different-greg',snippet:'Unrelated profile.'},
      {title:'No URL result',snippet:'Greg Zlevor mentioned without a source URL.'}
    ]}),
    logger:{warn(){}}
  });
  const artifact=await service.execute({candidate:{id:'candidate_1',instruction:'Research Greg.'},artifact:{
    kind:'research_handoff',research_question:'What changed publicly?',identity:{person_name:'Greg Zlevor',verified_email:'gzlevor@westwoodintl.com',known_linkedin_url:'https://www.linkedin.com/in/gregzlevor/'},queries:[],source_results:[],source_refs:[]
  }});
  assert.equal(artifact.completion_status,'complete_no_verified_result');
  assert.equal(artifact.source_results.length,0);
  assert.equal(artifact.rejected_unverified_result_count,2);
  assert.match(artifact.no_result_reason,/none could be tied safely/i);
  assert.equal(artifact.downstream_action_requires_separate_approval,true);
  assert.equal(artifact.no_external_action,true);
});

test('completed handoff contains only verified source URLs and reviewable findings',()=>{
  const artifact=finishResearchHandoff({
    kind:'research_handoff',identity:{person_name:'Greg Zlevor',verified_email:'gzlevor@westwoodintl.com',verified_domain:'westwoodintl.com'},source_refs:[]
  },{
    queries:['"Greg Zlevor" westwoodintl.com'],
    results:[
      {title:'Greg Zlevor',url:'https://www.westwoodintl.com/greg-zlevor',snippet:'Leadership and organizational transformation.'},
      {title:'Wrong person',url:'https://example.org/wrong',snippet:'Not the selected person.'}
    ],
    completedAt:'2026-07-22T12:00:00.000Z'
  });
  assert.equal(artifact.completion_status,'complete_for_review');
  assert.equal(artifact.source_results.length,1);
  assert.equal(artifact.source_results[0].url,'https://www.westwoodintl.com/greg-zlevor');
  assert.match(artifact.verified_findings[0],/organizational transformation/);
  assert.equal(artifact.source_refs[0].source_id,'https://www.westwoodintl.com/greg-zlevor');
  assert.equal(artifact.rejected_unverified_result_count,1);
});
