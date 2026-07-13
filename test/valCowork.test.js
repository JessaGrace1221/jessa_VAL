const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {VAL_COWORK_SQL}=require('../services/valCoworkSchema');
const {COWORK_ENTRYPOINTS,createValCoworkService,entryQuestion}=require('../services/valCowork');

const root=path.join(__dirname,'..');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
const routes=fs.readFileSync(path.join(root,'services','valCoworkRoutes.js'),'utf8');
const hearth=fs.readFileSync(path.join(root,'hearth-prototype.js'),'utf8');

function project(){
  return {
    id:'project_forever_freedom',
    projectId:'project_forever_freedom',
    name:'Forever Freedom onboarding',
    desiredOutcome:'',
    status:'intake',
    reality:'A document-backed partnership onboarding project.',
    sourceReceipts:'MOU received from Anthony.',
    sourceDetails:{relationships:'Anthony',documents:'Forever Freedom MOU',rawContext:'The MOU proposes a partnership path.'},
    workstreams:[]
  };
}

function transcript(){
  return {
    id:'transcript_forever_freedom',
    transcriptId:'transcript_forever_freedom',
    title:'Forever Freedom follow-up',
    transcriptText:'Raw transcript text from the selected meeting.',
    attendees:[{name:'Aric Soyring',email:'aric@example.com'},{name:'Anthony',email:'anthony@example.com'}],
    sourceReceipt:{
      body:'Action Items\nAnthony to send the website link to Jessa and Aric.\n\nKey Points\nPurpose of the call: follow up on Forever Freedom.',
      sections:[
        {kind:'action_items',heading:'Action Items',raw:'Action Items\nAnthony to send the website link to Jessa and Aric.',lines:['Anthony to send the website link to Jessa and Aric.']},
        {kind:'key_points',heading:'Key Points',raw:'Key Points\nPurpose of the call: follow up on Forever Freedom.',lines:['Purpose of the call: follow up on Forever Freedom.']}
      ],
      actionItems:['Anthony to send the website link to Jessa and Aric.'],
      keyPoints:['Purpose of the call: follow up on Forever Freedom.'],
      ready:true
    }
  };
}

function relationships(){
  return [
    {id:'rel_jessa',displayName:'Jessa',email:'jessa@example.com',relationshipStatus:'active'},
    {id:'rel_aric',displayName:'Aric',email:'aric@example.com',relationshipStatus:'active'}
  ];
}

function serviceFor({loadedProject=project(),loadedTranscript=transcript(),loadedRelationships=relationships()}={}){
  let store={};
  const applied=[];
  const appliedIdentities=[];
  const appliedPeople=[];
  const appliedNextMoves=[];
  const preparedTranscriptOverviews=[];
  const service=createValCoworkService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:value=>{store=value;},
    tenantId:()=>'tenant',
    userId:()=>'user',
    uuid:prefix=>`${prefix}_${Math.random().toString(36).slice(2,9)}`,
    loadProject:async id=>id===loadedProject?.projectId ? loadedProject : null,
    loadRelationships:async()=>loadedRelationships,
    applyProjectIdentity:async payload=>{
      appliedIdentities.push(payload);
      return {...loadedProject,name:payload.projectName,desiredOutcome:payload.desiredOutcome,nextStepOwner:payload.owner,summary:payload.purpose};
    },
    applyProjectPeople:async payload=>{
      appliedPeople.push(payload);
      return {...loadedProject,relationships:payload.people.map((person)=>person.name),nextStepOwner:payload.ownerName};
    },
    applyProjectWorkstreams:async payload=>{
      applied.push(payload);
      return {...loadedProject,workstreams:payload.workstreams};
    },
    applyProjectNextMove:async payload=>{
      appliedNextMoves.push(payload);
      return {...loadedProject,nextMove:payload.nextMove,nextStepOwner:payload.accountableOwner,nextStepDueAt:payload.timingOrTrigger,nextMoveEvidence:payload.basis};
    },
    loadTranscript:async id=>id===loadedTranscript?.id ? loadedTranscript : null,
    prepareTranscriptMeetingOverview:async payload=>{
      preparedTranscriptOverviews.push(payload);
      return {draft:{id:'draft_transcript_overview',body:loadedTranscript.sourceReceipt.body},recipientCount:2};
    }
  });
  return {service,applied,appliedIdentities,appliedPeople,appliedNextMoves,preparedTranscriptOverviews,get store(){return store;}};
}

test('Co-Work schema and routes are mounted as a durable service',()=>{
  for(const table of ['val_cowork_sessions','val_cowork_work_items','val_cowork_action_receipts']){
    assert.match(VAL_COWORK_SQL,new RegExp(`create table if not exists ${table}`));
  }
  assert.match(server,/ensureValCoworkTables/);
  assert.match(server,/registerValCoworkRoutes/);
  assert.match(server,/const workstreams=Array\.isArray\(patch\.workstreams\)\?patch\.workstreams:\[\]/);
  assert.match(server,/desiredOutcome,/);
  assert.match(routes,/\/api\/val\/cowork\/entries\/open/);
  assert.match(routes,/\/api\/val\/cowork\/sessions\/:id\/respond/);
  assert.match(routes,/\/api\/val\/cowork\/work-items\/:id\/apply/);
  assert.deepEqual(Object.keys(COWORK_ENTRYPOINTS),['project.identity','project.people','project.workstreams','project.next_move','transcript.working_brief']);
});

test('project foundation onboarding is scoped, field-targeted, review-gated, and never copies another project',async()=>{
  const {service,appliedIdentities}=serviceFor();
  const opened=await service.openEntry({
    entrypointId:'project.identity',
    scope:{entityType:'project_section',entityId:'project_forever_freedom',sectionId:'identity'}
  });
  assert.equal(opened.session.scope.entityId,'project_forever_freedom');
  assert.equal(opened.question.targetField,'project_identity_packet.{canonical_name,purpose,desired_outcome}');
  assert.match(opened.question.question,/confirm or correct its name/i);
  assert.equal(opened.session.workingBrief.currentIdentity.purpose,'');
  assert.equal(opened.session.workingBrief.currentIdentity.desiredOutcome,'');
  await assert.rejects(service.applyWorkItem(opened.workItem.id),/complete and reviewed/i);

  const owner=await service.respond(opened.session.id,{answer:[
    'Project name: Forever Freedom organization onboarding',
    'Serves: Forever Freedom and its first partner launch team.',
    'Desired outcome: A clear partnership foundation that can support a CRM, payment processing, and voice-gift activation.'
  ].join('\n')});
  assert.equal(owner.question.targetField,'project_owner_packet.owner');
  assert.match(owner.question.question,/one project owner/i);

  const ready=await service.respond(opened.session.id,{answer:'Jessa'});
  assert.equal(ready.workItem.status,'needs_review');
  assert.equal(ready.workItem.payload.identity.canonicalName,'Forever Freedom organization onboarding');
  assert.equal(ready.workItem.payload.identity.owner,'Jessa');
  assert.doesNotMatch(ready.workItem.payload.identity.purpose,/Acme|Frisson/i);

  const applied=await service.applyWorkItem(ready.workItem.id);
  assert.equal(applied.workItem.status,'applied');
  assert.equal(applied.receipt.action,'apply_project_identity');
  assert.equal(applied.receipt.payloadJson.noExternalAction,true);
  assert.equal(appliedIdentities.length,1);
  assert.equal(appliedIdentities[0].projectId,'project_forever_freedom');
  assert.equal(appliedIdentities[0].owner,'Jessa');
});

test('project people links only existing relationships, records their roles, and makes one owner explicit',async()=>{
  const {service,appliedPeople}=serviceFor();
  const opened=await service.openEntry({entrypointId:'project.people',scope:{entityType:'project_section',entityId:'project_forever_freedom',sectionId:'people'}});
  assert.equal(opened.question.targetField,'project_relationships_packet[].{relationship_name,role_in_project}');
  assert.match(opened.question.question,/which existing relationships/i);
  const owner=await service.respond(opened.session.id,{answer:'People: Jessa - Executive owner; Aric - Partner lead'});
  assert.equal(owner.question.targetField,'project_owner_packet.owner');
  const ready=await service.respond(opened.session.id,{answer:'Owner: Jessa'});
  assert.equal(ready.workItem.status,'needs_review');
  assert.equal(ready.workItem.payload.people.length,2);
  assert.equal(ready.workItem.payload.ownerId,'rel_jessa');
  const applied=await service.applyWorkItem(ready.workItem.id);
  assert.equal(applied.receipt.action,'apply_project_people');
  assert.equal(applied.receipt.payloadJson.noExternalAction,true);
  assert.equal(appliedPeople[0].people[1].role,'Partner lead');
  assert.equal(appliedPeople[0].ownerId,'rel_jessa');
});

test('Workstreams interview is scoped to the selected project and asks only mapped questions',async()=>{
  const {service}=serviceFor();
  const opened=await service.openEntry({
    entrypointId:'project.workstreams',
    scope:{entityType:'project_section',entityId:'project_forever_freedom',sectionId:'workstreams'}
  });
  assert.equal(opened.session.scope.entityId,'project_forever_freedom');
  assert.equal(opened.session.workingBrief.projectName,'Forever Freedom onboarding');
  assert.equal(opened.question.targetField,'project_identity_packet.desired_outcome');
  assert.match(opened.question.question,/what outcome should the project create/i);

  const outcome=await service.respond(opened.session.id,{answer:'Create a working partnership launch with a CRM, sponsorship path, and measurable voice-gift activation.'});
  assert.equal(outcome.question.targetField,'project_workstreams[].name');
  assert.match(outcome.question.detail,/creates the named workstreams/i);

  const lanes=await service.respond(opened.session.id,{answer:'CRM and payments\nPartner activation'});
  assert.equal(lanes.session.state.stage,'workstream_details');
  assert.match(lanes.question.targetField,/project_workstreams/);
  assert.match(lanes.question.question,/purpose/i);
  assert.match(lanes.question.question,/owner/i);
  assert.match(lanes.question.question,/first move/i);
  assert.doesNotMatch(lanes.question.question,/Who owns this project/i);
});

test('incomplete workstreams cannot be applied and complete workstreams create an internal receipt',async()=>{
  const {service,applied}=serviceFor();
  const opened=await service.openEntry({entrypointId:'project.workstreams',scope:{entityId:'project_forever_freedom'}});
  await assert.rejects(service.applyWorkItem(opened.workItem.id),/complete and reviewed/i);

  await service.respond(opened.session.id,{answer:'Launch a measurable partnership program.'});
  await service.respond(opened.session.id,{answer:'CRM and payments\nPartner activation'});
  const ready=await service.respond(opened.session.id,{answer:[
    'CRM and payments - purpose: capture and process partner revenue; owner: Jessa; first move: map the pipeline and payment handoff; milestone: first payment passes through the CRM; monitor: failed payment or form submissions',
    'Partner activation - purpose: launch the first sponsor and voice-gift campaign; owner: Anthony; first move: confirm sponsor outreach list; milestone: first sponsor commitment; monitor: sponsor response cadence'
  ].join('\n')});

  assert.equal(ready.session.status,'needs_review');
  assert.equal(ready.workItem.status,'needs_review');
  assert.equal(ready.workItem.payload.workstreams.length,2);
  assert.equal(ready.workItem.payload.workstreams[0].accountableOwner,'Jessa');

  const appliedResult=await service.applyWorkItem(ready.workItem.id);
  assert.equal(appliedResult.session.status,'completed');
  assert.equal(appliedResult.workItem.status,'applied');
  assert.equal(appliedResult.receipt.action,'apply_project_workstreams');
  assert.equal(appliedResult.receipt.payloadJson.noExternalAction,true);
  assert.equal(appliedResult.project.workstreams.length,2);
  assert.equal(applied.length,1);
  assert.equal(applied[0].projectId,'project_forever_freedom');
  assert.equal(applied[0].desiredOutcome,'Launch a measurable partnership program.');
});

test('a missing project is rejected instead of substituting another project',async()=>{
  const {service}=serviceFor({loadedProject:null});
  await assert.rejects(
    service.openEntry({entrypointId:'project.workstreams',scope:{entityId:'project_missing'}}),
    /did not substitute another project/i
  );
});

test('detail questions name only the missing workstream fields',()=>{
  const question=entryQuestion({
    stage:'workstream_details',
    draftWorkstreams:[{
      name:'CRM',
      purpose:'Capture sponsor activity',
      accountableOwner:'Jessa',
      firstConcreteMove:'Map stages',
      milestone:'Pipeline live',
      monitoringSignal:''
    }]
  },{});
  assert.match(question.question,/monitoring signal/i);
  assert.doesNotMatch(question.question,/purpose: \.\.\./i);
  assert.doesNotMatch(question.question,/owner: \.\.\./i);
});

test('workstream details accept the exact monitoring signal label used in the interview',async()=>{
  const {service}=serviceFor();
  const opened=await service.openEntry({entrypointId:'project.workstreams',scope:{entityId:'project_forever_freedom'}});
  await service.respond(opened.session.id,{answer:'Launch the partnership.'});
  await service.respond(opened.session.id,{answer:'Partner launch'});
  const ready=await service.respond(opened.session.id,{answer:'Partner launch - purpose: launch the partnership; owner: Jessa; first move: confirm launch plan; milestone: launch approved; monitoring signal: partner response cadence'});
  assert.equal(ready.workItem.status,'needs_review');
  assert.equal(ready.workItem.payload.workstreams[0].monitoringSignal,'partner response cadence');
});

test('next move interview is scoped, field-targeted, review-gated, and applied with a receipt',async()=>{
  const {service,appliedNextMoves}=serviceFor();
  const opened=await service.openEntry({
    entrypointId:'project.next_move',
    scope:{entityType:'project_section',entityId:'project_forever_freedom',sectionId:'next_move'}
  });
  assert.equal(opened.session.scope.entityId,'project_forever_freedom');
  assert.equal(opened.question.targetField,'project_next_action_packet.next_action');
  await assert.rejects(service.applyWorkItem(opened.workItem.id),/complete and reviewed/i);

  const ready=await service.respond(opened.session.id,{answer:'Next move: Send the partner launch decision memo; Owner: Jessa; Timing: Before the Friday review; Basis: The MOU and partnership decision require one clear owner and decision point.'});
  assert.equal(ready.workItem.status,'needs_review');
  assert.equal(ready.workItem.payload.nextMove,'Send the partner launch decision memo');
  assert.equal(ready.workItem.payload.accountableOwner,'Jessa');
  assert.equal(ready.workItem.payload.timingOrTrigger,'Before the Friday review');
  assert.match(ready.workItem.payload.basis,/MOU/i);

  const applied=await service.applyWorkItem(ready.workItem.id);
  assert.equal(applied.workItem.status,'applied');
  assert.equal(applied.receipt.action,'apply_project_next_move');
  assert.equal(applied.receipt.payloadJson.noExternalAction,true);
  assert.equal(appliedNextMoves.length,1);
  assert.equal(appliedNextMoves[0].nextMove,'Send the partner launch decision memo');
  assert.equal(appliedNextMoves[0].timingOrTrigger,'Before the Friday review');
});

test('Transcript Working Brief remains scoped to the selected Krisp receipt and produces an exact internal draft',async()=>{
  const {service,preparedTranscriptOverviews}=serviceFor();
  const opened=await service.openEntry({
    entrypointId:'transcript.working_brief',
    scope:{entityType:'transcript',entityId:'transcript_forever_freedom',sectionId:'working_brief'}
  });
  assert.equal(opened.session.scope.entityId,'transcript_forever_freedom');
  assert.equal(opened.session.workingBrief.transcriptTitle,'Forever Freedom follow-up');
  assert.equal(opened.question.targetField,'transcript_working_brief.prepared_artifact_kind');
  assert.equal(opened.session.workingBrief.sourceReceipt.actionItems[0],'Anthony to send the website link to Jessa and Aric.');
  assert.equal(opened.session.workingBrief.sourceReceipt.keyPoints[0],'Purpose of the call: follow up on Forever Freedom.');
  await assert.rejects(service.applyWorkItem(opened.workItem.id),/must be reviewed/i);

  const ready=await service.respond(opened.session.id,{answer:'Prepare the meeting overview'});
  assert.equal(ready.workItem.status,'needs_review');
  assert.equal(ready.workItem.type,'transcript_meeting_overview');
  assert.equal(ready.workItem.payload.preparedArtifact.body,opened.session.workingBrief.sourceReceipt.body);

  const applied=await service.applyWorkItem(ready.workItem.id);
  assert.equal(applied.workItem.status,'applied');
  assert.equal(applied.receipt.action,'prepare_transcript_meeting_overview');
  assert.equal(applied.receipt.payloadJson.noExternalAction,true);
  assert.equal(preparedTranscriptOverviews.length,1);
  assert.equal(preparedTranscriptOverviews[0].transcriptId,'transcript_forever_freedom');
  assert.equal(applied.draft.body,opened.session.workingBrief.sourceReceipt.body);
});

test('a missing transcript is rejected instead of substituting another meeting',async()=>{
  const {service}=serviceFor({loadedTranscript:null});
  await assert.rejects(
    service.openEntry({entrypointId:'transcript.working_brief',scope:{entityId:'transcript_missing'}}),
    /did not substitute another meeting/i
  );
});

test('Project Managers canonical entries bypass generic Co-Work and use registered routes',()=>{
  assert.match(hearth,/function projectCoworkWorkstreamSuggestions/);
  assert.match(hearth,/function projectProfileForCoworkNode/);
  assert.match(hearth,/projectManagerProfile\.dataset\.projectProfileId/);
  assert.match(hearth,/async function openProjectWorkstreamsCowork/);
  assert.match(hearth,/const project = projectProfileForCoworkNode\(node\)/);
  assert.match(hearth,/entrypointId:'project\.workstreams'/);
  assert.match(hearth,/entrypointId:'project\.identity'/);
  assert.match(hearth,/entrypointId:'project\.people'/);
  assert.match(hearth,/entrypointId:'project\.next_move'/);
  assert.match(hearth,/\/api\/val\/cowork\/entries\/open/);
  assert.match(hearth,/\/api\/val\/cowork\/sessions\/.*\/respond/);
  assert.match(hearth,/\/api\/val\/cowork\/work-items\/.*\/apply/);
  assert.match(hearth,/if\(field === 'workstreams'\) return openProjectWorkstreamsCowork/);
  assert.match(hearth,/if\(field === 'what_this_is' \|\| field === 'project_interview'\) return openProjectIdentityCowork/);
  assert.match(hearth,/if\(field === 'people_involved'\) return openProjectPeopleCowork/);
  assert.match(hearth,/if\(field === 'next_move'\) return openProjectNextMoveCowork/);
  assert.match(hearth,/function projectRelationshipPacketItems/);
  assert.match(hearth,/role_in_project:projectCleanText\(matched\?\.role, 'Connected to this work'\)/);
  assert.match(hearth,/if\(await submitActiveCoworkEntry\(\)\) return;/);
  assert.match(hearth,/data-cowork-apply-workstreams/);
  assert.match(hearth,/data-cowork-apply-project-identity/);
  assert.match(hearth,/data-cowork-apply-project-people/);
  assert.match(hearth,/data-cowork-apply-next-move/);
  assert.match(hearth,/restoreProjectWindow\(projectReturnId\)/);
  assert.match(hearth,/function renderProjectManagerLoadingState/);
  assert.match(hearth,/if\(canUseApi && !projectIndexLoaded\)/);
  assert.match(hearth,/const selectedProject = selectedProjectId && projectIndexItems\(\)\.find/);
});

test('Transcript canonical Co-Work bypasses the legacy freeform chat route',()=>{
  assert.match(hearth,/async function openTranscriptWorkingBriefCowork/);
  assert.match(hearth,/entrypointId:'transcript\.working_brief'/);
  assert.match(hearth,/data-transcript-cowork/);
  assert.match(hearth,/data-cowork-apply-transcript-overview/);
  assert.match(hearth,/returnTarget:'timeline'/);
  assert.match(hearth,/function timelineFullTranscriptText/);
  assert.doesNotMatch(hearth,/data-transcript-chat/);
  assert.doesNotMatch(hearth,/timelineTranscriptAsk/);
  assert.match(server,/async function loadTranscriptForCowork/);
  assert.match(server,/async function prepareCoworkTranscriptMeetingOverview/);
});

test('project foundation application updates only the selected internal project packet',()=>{
  assert.match(server,/async function applyCoworkProjectIdentity/);
  assert.match(server,/projectOnboardingStatus:'foundation_applied'/);
  assert.match(server,/needsProjectOnboarding:false/);
  assert.match(server,/applyProjectIdentity:applyCoworkProjectIdentity/);
  assert.match(server,/async function applyCoworkProjectPeople/);
  assert.match(server,/applyProjectPeople:applyCoworkProjectPeople/);
  assert.match(server,/projectPeople:linkedPeople\.map/);
  assert.match(server,/projectPeople:Array\.isArray\(metadata\.projectPeople\)\?metadata\.projectPeople:\[\]/);
  assert.match(hearth,/foundation_applied/);
});
