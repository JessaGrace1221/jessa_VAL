const test=require('node:test');
const assert=require('node:assert/strict');
const {
  assessPreparedWork,
  artifactAdmissionFromStored,
  validatePreparedArtifactQuality
}=require('../services/valPreparedWorkAdmission');
const {
  preparedWorkCandidates,
  preparedWorkType
}=require('../services/valTranscriptIntelligence');

function sourceRef(text='Jessa agreed to follow up.'){
  return [{source_type:'transcript',source_id:'tr_1',quote_or_summary:text,confidence:0.86}];
}

test('fragmented contact-sharing work becomes needs_information instead of a draft',()=>{
  const instruction={
    requested_action:'send_email',
    instruction:"Jessa to send Trisa's contact information to Anna.",
    target_person_or_record:'Anna',
    confidence:0.82,
    source_refs:sourceRef("Jessa to send Trisa's contact information to Anna."),
    authorization:'approval_required'
  };
  const assessment=assessPreparedWork({
    kind:'email_draft',
    instruction,
    record:{id:'tr_1',source:'transcript'},
    linkage:{linked_people:[]},
    sourceRefs:instruction.source_refs
  });
  assert.equal(assessment.status,'needs_information');
  assert.equal(assessment.admitted,false);
  assert.ok(assessment.missingInformation.some(item=>/recipient/i.test(item)));
  assert.ok(assessment.missingInformation.some(item=>/permission/i.test(item)));
  const candidates=preparedWorkCandidates({id:'tr_1',source:'transcript'},[instruction],{linked_people:[]},instruction.source_refs);
  assert.equal(candidates.length,1);
  assert.equal(candidates[0].category,'task_candidate');
  assert.equal(candidates[0].prepared_artifact,null);
  assert.equal(candidates[0].completion_status,'needs_information');
  assert.equal(candidates[0].continuation_task.work_brief.sourceId,assessment.brief.sourceId);
  assert.equal(candidates[0].continuation_task.work_brief.workType,assessment.brief.workType);
  assert.ok(candidates[0].continuation_task.work_brief.missingInformation.some(item=>/recipient/i.test(item)));
});

test('project labels are not admitted as recipient identities',()=>{
  const instruction={
    requested_action:'send_email',
    instruction:'Send the update to Sales System.',
    target_person_or_record:'Sales System',
    confidence:0.8,
    source_refs:sourceRef('Send the update to Sales System.'),
    authorization:'approval_required'
  };
  const assessment=assessPreparedWork({
    kind:'email_draft',
    instruction,
    record:{id:'tr_1',source:'transcript'},
    linkage:{
      linked_projects:[{id:'sales_system',name:'Sales System'}],
      linked_people:[{name:'Sales System'}]
    },
    sourceRefs:instruction.source_refs
  });
  assert.equal(assessment.admitted,false);
  assert.equal(assessment.brief.recipientName,'');
  assert.ok(assessment.missingInformation.some(item=>/recipient/i.test(item)));
});

test('duplicate artifact text fails prepared-work quality',()=>{
  const brief={
    workType:'document_draft',
    intendedAction:'create_draft',
    subjectPurpose:'Prepare the handoff',
    sourceType:'transcript',
    sourceId:'tr_1',
    sourceExcerpt:'Prepare the handoff.',
    requiredContent:['Prepare the handoff.'],
    senderIdentity:'VAL user',
    recipients:[]
  };
  const quality=validatePreparedArtifactQuality({
    kind:'document_draft',
    body:'Prepare the handoff for Friday. Prepare the handoff for Friday. Prepare the handoff for Friday.'
  },brief);
  assert.equal(quality.passes,false);
  assert.ok(quality.issues.some(item=>/repeat/i.test(item)));
});

test('complete consented introduction brief is admitted and reviewable',()=>{
  const instruction={
    requested_action:'draft_introduction',
    instruction:'Anna and Trisa asked for an introduction so they can discuss the partnership.',
    target_person_or_record:'Anna',
    confidence:0.9,
    source_refs:sourceRef('Anna and Trisa asked for an introduction so they can discuss the partnership.'),
    authorization:'approval_required'
  };
  const linkage={
    consentConfirmed:true,
    linked_people:[
      {name:'Anna Smith',email:'anna@example.com',contactId:'crm_anna'},
      {name:'Trisa Jones',email:'trisa@example.com',contactId:'crm_trisa'}
    ]
  };
  const assessment=assessPreparedWork({
    kind:'introduction_email_draft',
    instruction,
    record:{id:'tr_1',source:'transcript'},
    linkage,
    sourceRefs:instruction.source_refs
  });
  assert.equal(assessment.status,'admitted');
  assert.equal(assessment.brief.recipients.length,2);
  assert.equal(assessment.brief.consentConfirmed,true);
});

test('reminder language remains a task and never becomes an email draft',()=>{
  const instruction={
    requested_action:'create_task',
    instruction:"Remind me tomorrow to send Trisa's number to Anna."
  };
  assert.equal(preparedWorkType(instruction),'');
  assert.deepEqual(preparedWorkCandidates({id:'tr_1'},[instruction],{},sourceRef()),[]);
});

test('stored outbound artifact without contact information is removed from Leverage admission',()=>{
  const admission=artifactAdmissionFromStored({
    id:'ready_1',
    title:'Email draft prepared',
    summary:'Send the update.',
    whatValPrepared:'Hi Anna, here is the update.',
    sourceRefsJson:sourceRef('Send the update to Anna.'),
    metadataJson:{
      source:'transcript_intelligence',
      transcriptId:'tr_1',
      preparedArtifactKind:'email_draft',
      preparedArtifact:{kind:'email_draft',body:'Hi Anna, here is the update.'}
    }
  });
  assert.equal(admission.admitted,false);
  assert.ok(admission.missingInformation.some(item=>/recipient/i.test(item)));
});
