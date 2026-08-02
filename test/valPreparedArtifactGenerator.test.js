const test=require('node:test');
const assert=require('node:assert/strict');

const {
  createPreparedArtifactGenerator,
  validateGeneratedArtifact,
  packetText
}=require('../services/valPreparedArtifactGenerator');

function workItem(){
  return {
    id:'work_goall',
    title:'Build the GOALL dashboard',
    project_name:'GOALL',
    evidence_quote:'Jessa: I will build the dashboard in HTML and CSS for the CRM iframe.',
    source_refs:[{
      source_type:'transcript',
      source_id:'transcript_goall',
      quote_or_summary:'Jessa: I will build the dashboard in HTML and CSS for the CRM iframe.'
    }],
    source_packets:[
      {
        source_title:'GOALL dashboard meeting',
        context_excerpt:[
          'Mike: Show pipeline projections, the accountable owner, and open follow-up.',
          'Jessa: I will build the dashboard in HTML and CSS for the CRM iframe.'
        ].join('\n')
      },
      {
        source_title:'GOALL follow-up email',
        context_excerpt:'Mike: Please include the weekly check-in status.'
      }
    ]
  };
}

test('prepared artifact generator receives the complete growing source packet',async()=>{
  let supplied=null;
  const generate=createPreparedArtifactGenerator({
    callModel:async input=>{
      supplied=JSON.parse(input.user);
      return {
        status:'ready_for_review',
        title:'GOALL Pipeline Dashboard',
        html:'<!doctype html><html><body><main><h1>GOALL Pipeline Dashboard</h1><p>Pipeline projections, owner, follow-up, and weekly status.</p></main></body></html>',
        used_evidence:['Jessa: I will build the dashboard in HTML and CSS for the CRM iframe.']
      };
    }
  });
  const result=await generate({
    artifact:{kind:'html_page_draft',title:'GOALL dashboard draft'},
    workItem:workItem()
  });
  assert.equal(result.ok,true);
  assert.match(supplied.canonicalSourcePacket,/pipeline projections/);
  assert.match(supplied.canonicalSourcePacket,/weekly check-in status/);
  assert.equal(result.artifact.generatedFromCanonicalPacket,true);
  assert.match(result.artifact.html,/GOALL Pipeline Dashboard/);
});

test('prepared artifact is rejected when it cannot cite its immutable source packet',()=>{
  const result=validateGeneratedArtifact({
    status:'ready_for_review',
    body:'This is a complete-looking draft with enough words to pass a superficial length check, but it does not cite its source.',
    used_evidence:['A sentence that never appeared.']
  },workItem());
  assert.equal(result.ok,false);
  assert.match(result.missingInformation[0],/exact, inspectable source citation/i);
});

test('packet text preserves every source version attached to one work item',()=>{
  const value=packetText(workItem());
  assert.match(value,/\[Source 1: GOALL dashboard meeting\]/);
  assert.match(value,/\[Source 2: GOALL follow-up email\]/);
});

test('prepared artifact generation receives only approved draft learning as style guidance',async()=>{
  let supplied=null;
  const generate=createPreparedArtifactGenerator({
    loadDraftLearning:async()=>[{
      artifactKind:'html_page_draft',
      outcome:'approved_and_sent',
      subject:'A prior approved dashboard',
      finalDraft:'A concise prior approved artifact with clear hierarchy and direct executive language.'
    }],
    callModel:async input=>{
      supplied=JSON.parse(input.user);
      return {
        status:'ready_for_review',
        title:'GOALL Pipeline Dashboard',
        html:'<!doctype html><html><body><main><h1>GOALL Pipeline Dashboard</h1><p>Pipeline projections, owner, follow-up, and weekly status.</p></main></body></html>',
        used_evidence:['Jessa: I will build the dashboard in HTML and CSS for the CRM iframe.']
      };
    }
  });
  const result=await generate({artifact:{kind:'html_page_draft'},workItem:workItem()});
  assert.equal(result.ok,true);
  assert.equal(supplied.approvedDraftLearning.length,1);
  assert.match(supplied.approvedDraftLearning[0].finalDraft,/clear hierarchy/);
});
