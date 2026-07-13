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

function serviceFor({loadedProject=project()}={}){
  let store={};
  const applied=[];
  const appliedNextMoves=[];
  const service=createValCoworkService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:value=>{store=value;},
    tenantId:()=>'tenant',
    userId:()=>'user',
    uuid:prefix=>`${prefix}_${Math.random().toString(36).slice(2,9)}`,
    loadProject:async id=>id===loadedProject?.projectId ? loadedProject : null,
    applyProjectWorkstreams:async payload=>{
      applied.push(payload);
      return {...loadedProject,workstreams:payload.workstreams};
    },
    applyProjectNextMove:async payload=>{
      appliedNextMoves.push(payload);
      return {...loadedProject,nextMove:payload.nextMove,nextStepOwner:payload.accountableOwner,nextStepDueAt:payload.timingOrTrigger,nextMoveEvidence:payload.basis};
    }
  });
  return {service,applied,appliedNextMoves,get store(){return store;}};
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
  assert.deepEqual(Object.keys(COWORK_ENTRYPOINTS),['project.workstreams','project.next_move']);
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

test('Project Managers canonical entries bypass generic Co-Work and use registered routes',()=>{
  assert.match(hearth,/function projectCoworkWorkstreamSuggestions/);
  assert.match(hearth,/function projectProfileForCoworkNode/);
  assert.match(hearth,/projectManagerProfile\.dataset\.projectProfileId/);
  assert.match(hearth,/async function openProjectWorkstreamsCowork/);
  assert.match(hearth,/const project = projectProfileForCoworkNode\(node\)/);
  assert.match(hearth,/entrypointId:'project\.workstreams'/);
  assert.match(hearth,/entrypointId:'project\.next_move'/);
  assert.match(hearth,/\/api\/val\/cowork\/entries\/open/);
  assert.match(hearth,/\/api\/val\/cowork\/sessions\/.*\/respond/);
  assert.match(hearth,/\/api\/val\/cowork\/work-items\/.*\/apply/);
  assert.match(hearth,/if\(field === 'workstreams'\) return openProjectWorkstreamsCowork/);
  assert.match(hearth,/if\(field === 'next_move'\) return openProjectNextMoveCowork/);
  assert.match(hearth,/if\(await submitActiveCoworkEntry\(\)\) return;/);
  assert.match(hearth,/data-cowork-apply-workstreams/);
  assert.match(hearth,/data-cowork-apply-next-move/);
  assert.match(hearth,/restoreProjectWindow\(projectReturnId\)/);
  assert.match(hearth,/function renderProjectManagerLoadingState/);
  assert.match(hearth,/if\(canUseApi && !projectIndexLoaded\)/);
  assert.match(hearth,/const selectedProject = selectedProjectId && projectIndexItems\(\)\.find/);
});
