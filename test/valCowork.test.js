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

function emailThread(){
  return {
    provider:'gmail',
    messageId:'email_mou',
    threadId:'thread_mou',
    conversationId:'conversation_mou',
    subject:'MOU for Forever Freedom',
    messages:[{
      id:'email_mou',messageId:'email_mou',threadId:'thread_mou',provider:'gmail',direction:'inbound',
      from:{name:'Aric Soyring',email:'aric@example.com'},subject:'MOU for Forever Freedom',
      bodyText:'Please review the attached MOU and let me know what changes you need.',receivedAt:'2026-07-12T15:14:14.000Z'
    }],
    context:{
      provider:'gmail',conversationId:'conversation_mou',threadId:'thread_mou',waiting_on_user:true,
      current_message:{messageId:'email_mou',threadId:'thread_mou',provider:'gmail',subject:'MOU for Forever Freedom',from:{name:'Aric Soyring',email:'aric@example.com'},bodyText:'Please review the attached MOU and let me know what changes you need.'}
    },
    classification:{executive_meaning:'protect_opportunity',why_now:'The MOU needs a clear response.',approval_policy:'approval_required',source_refs:[{source_type:'email_message',source_id:'email_mou',quote_or_summary:'MOU for Forever Freedom',confidence:0.9}]},
    readiness:{status:'needs_context',missing_context:['commercial_or_legal_specifics'],representation_risk:'high'},
    draftBrief:{single_purpose:'Move the partnership decision forward.',must_include:[]}
  };
}

function relationships(){
  return [
    {id:'rel_jessa',displayName:'Jessa',email:'jessa@example.com',relationshipStatus:'active',summary:'Executive owner of the relationship context.'},
    {id:'rel_aric',displayName:'Aric',email:'aric@example.com',relationshipStatus:'active',summary:'Partner lead connected to the Forever Freedom MOU.',openLoops:[{content:'Confirm the final MOU changes before the partnership proceeds.'}]}
  ];
}

function documents(){
  return [
    {id:'doc_mou',title:'Forever Freedom MOU',type:'application/pdf',sourceType:'email_attachment',sourceId:'email_mou',summary:'Signed partnership memorandum.',sourceRefs:[{source_type:'email_attachment',source_id:'email_mou',quote_or_summary:'Forever Freedom MOU',confidence:0.94}]},
    {id:'doc_scope',title:'Forever Freedom launch scope',type:'google_doc',sourceType:'google_docs',sourceId:'drive_scope',summary:'Proposed launch scope.',sourceRefs:[{source_type:'google_docs',source_id:'drive_scope',quote_or_summary:'Forever Freedom launch scope',confidence:0.9}]}
  ];
}

function serviceFor({loadedProject=project(),loadedTranscript=transcript(),loadedEmailThread=emailThread(),loadedRelationships=relationships(),loadedDocuments=documents()}={}){
  let store={};
  const applied=[];
  const appliedIdentities=[];
  const appliedOnboarding=[];
  const appliedPeople=[];
  const appliedDocuments=[];
  const appliedMilestones=[];
  const appliedMonitoring=[];
  const appliedRelationshipNurture=[];
  const appliedImportance=[];
  const appliedRisks=[];
  const appliedNarratives=[];
  const appliedNeedsNext=[];
  const appliedOperatingSystems=[];
  const appliedPhases=[];
  const appliedOverviewFocuses=[];
  const appliedPreparedWork=[];
  const appliedNextMoves=[];
  const appliedRelationshipOverviews=[];
  const preparedTranscriptOverviews=[];
  const createdTranscriptActionItems=[];
  const preparedEmailThreadDrafts=[];
  const service=createValCoworkService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:value=>{store=value;},
    tenantId:()=>'tenant',
    userId:()=>'user',
    uuid:prefix=>`${prefix}_${Math.random().toString(36).slice(2,9)}`,
    loadProject:async id=>id===loadedProject?.projectId ? loadedProject : null,
    loadRelationships:async()=>loadedRelationships,
    loadDocuments:async()=>loadedDocuments,
    applyProjectIdentity:async payload=>{
      appliedIdentities.push(payload);
      return {...loadedProject,name:payload.projectName,desiredOutcome:payload.desiredOutcome,nextStepOwner:payload.owner,summary:payload.purpose};
    },
    applyProjectOnboarding:async payload=>{
      appliedOnboarding.push(payload);
      return {...loadedProject,metadataJson:{...(loadedProject.metadataJson||{}),projectOnboarding:{status:payload.stage==='prepared_work'?'complete':payload.stage + '_answered'}}};
    },
    applyProjectPeople:async payload=>{
      appliedPeople.push(payload);
      return {...loadedProject,relationships:payload.people.map((person)=>person.name),nextStepOwner:payload.ownerName};
    },
    applyProjectDocuments:async payload=>{
      appliedDocuments.push(payload);
      return {...loadedProject,projectDocuments:payload.documents};
    },
    applyProjectMilestones:async payload=>{
      appliedMilestones.push(payload);
      return {...loadedProject,milestones:payload.milestones};
    },
    applyProjectMonitoring:async payload=>{
      appliedMonitoring.push(payload);
      return {...loadedProject,monitoringRules:payload.monitoringRules};
    },
    applyProjectRelationshipNurture:async payload=>{
      appliedRelationshipNurture.push(payload);
      return {...loadedProject,relationshipNurtureRules:payload.relationshipNurtureRules};
    },
    applyProjectImportance:async payload=>{
      appliedImportance.push(payload);
      return {...loadedProject,projectImportance:payload.projectImportance};
    },
    applyProjectRisk:async payload=>{
      appliedRisks.push(payload);
      return {...loadedProject,projectRisk:payload.projectRisk};
    },
    applyProjectNarrative:async payload=>{
      appliedNarratives.push(payload);
      return {...loadedProject,projectNarrative:payload.projectNarrative,livingNarrative:payload.projectNarrative.currentReality,whatValNowKnows:payload.projectNarrative.whatValNowKnows,currentBlocker:payload.projectNarrative.whatIsBlocked};
    },
    applyProjectNeedsNext:async payload=>{
      appliedNeedsNext.push(payload);
      return {...loadedProject,projectNeedsNext:payload.projectNeedsNext,needsNextQuestion:payload.projectNeedsNext.nextQuestion};
    },
    applyProjectOperatingSystem:async payload=>{
      appliedOperatingSystems.push(payload);
      return {...loadedProject,projectOperatingSystem:payload.projectOperatingSystem,sopId:payload.projectOperatingSystem.sopId,sopName:payload.projectOperatingSystem.sopName,sopFitReason:payload.projectOperatingSystem.fitReason,sopDeviations:[payload.projectOperatingSystem.knownDeviations]};
    },
    applyProjectPhase:async payload=>{
      appliedPhases.push(payload);
      return {...loadedProject,projectPhase:payload.projectPhase.currentPhase,projectPhaseRecord:payload.projectPhase,projectPhaseEvidence:payload.projectPhase.phaseEvidence,projectPhaseExitCondition:payload.projectPhase.exitCondition,projectPhaseNextTrigger:payload.projectPhase.nextPhaseTrigger};
    },
    applyProjectOverview:async payload=>{
      appliedOverviewFocuses.push(payload);
      return {...loadedProject,projectOverviewFocus:payload.projectOverviewFocus};
    },
    applyProjectPreparedWork:async payload=>{
      appliedPreparedWork.push(payload);
      return {...loadedProject,projectPreparedWork:[payload.projectPreparedWork]};
    },
    applyProjectWorkstreams:async payload=>{
      applied.push(payload);
      return {...loadedProject,workstreams:payload.workstreams};
    },
    applyProjectNextMove:async payload=>{
      appliedNextMoves.push(payload);
      return {...loadedProject,nextMove:payload.nextMove,nextStepOwner:payload.accountableOwner,nextStepDueAt:payload.timingOrTrigger,nextMoveEvidence:payload.basis};
    },
    loadRelationship:async id=>loadedRelationships.find((relationship)=>String(relationship.id)===String(id)) || null,
    applyRelationshipOverview:async payload=>{
      appliedRelationshipOverviews.push(payload);
      const current=loadedRelationships.find((relationship)=>String(relationship.id)===String(payload.relationshipId)) || {};
      return {...current,name:current.displayName||current.name||'',relationshipCoworkFocus:payload.relationshipOverview,nextStewardshipMove:payload.relationshipOverview.nextMove};
    },
    loadTranscript:async id=>id===loadedTranscript?.id ? loadedTranscript : null,
    prepareTranscriptMeetingOverview:async payload=>{
      preparedTranscriptOverviews.push(payload);
      return {draft:{id:'draft_transcript_overview',body:loadedTranscript.sourceReceipt.body},recipientCount:2};
    },
    createTranscriptActionItem:async payload=>{
      createdTranscriptActionItems.push(payload);
      return {task:{id:'task_transcript_action',title:payload.actionItem,sourceQuote:payload.actionItem},alreadyCreated:false};
    },
    loadEmailThread:async input=>{
      const selected=String(input.messageId || input.threadId || input.conversationId || '');
      const known=[loadedEmailThread?.messageId,loadedEmailThread?.threadId,loadedEmailThread?.conversationId].map(String);
      return loadedEmailThread && known.includes(selected) ? loadedEmailThread : null;
    },
    prepareEmailThreadDraft:async payload=>{
      preparedEmailThreadDrafts.push(payload);
      return {draft:{id:'draft_email_mou',subject:'Re: MOU for Forever Freedom',body:'Hi Aric,\n\nI would like to confirm the final MOU changes so we can keep the partnership moving.\n\nBest,\nJessa',status:'ready_for_review'},noExternalAction:true};
    }
  });
  return {service,applied,appliedIdentities,appliedOnboarding,appliedPeople,appliedDocuments,appliedMilestones,appliedMonitoring,appliedRelationshipNurture,appliedImportance,appliedRisks,appliedNarratives,appliedNeedsNext,appliedOperatingSystems,appliedPhases,appliedOverviewFocuses,appliedPreparedWork,appliedNextMoves,appliedRelationshipOverviews,preparedTranscriptOverviews,createdTranscriptActionItems,preparedEmailThreadDrafts,get store(){return store;}};
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
  assert.deepEqual(Object.keys(COWORK_ENTRYPOINTS),['project.overview','project.identity','project.onboarding','project.people','project.documents','project.milestones','project.monitoring','project.relationship_nurture','project.why_it_matters','project.risk','project.narrative','project.needs_next','project.sop','project.phase','project.prepared_work','project.workstreams','project.next_move','transcript.working_brief','transcript.action_item','email.thread','relationship.overview']);
});

test('Project Interview preserves its protected question, applies only its mapped answer, and resumes at the next stage',async()=>{
  const freshProject={...project(),metadataJson:{projectOnboarding:{status:'needs_interview'}}};
  const {service,appliedOnboarding}=serviceFor({loadedProject:freshProject});
  const opened=await service.openEntry({entrypointId:'project.onboarding',scope:{entityType:'project_section',entityId:'project_forever_freedom',sectionId:'project_interview'}});
  assert.equal(opened.question.question,'What should this project be called, and what outcome should it create?');
  assert.equal(opened.question.targetField,'project_identity_packet.canonical_name + project_identity_packet.desired_outcome');
  assert.deepEqual(opened.session.workingBrief.currentStageContract.pageBoxes,['Identity','What this is','Working narrative']);
  const ready=await service.respond(opened.session.id,{answer:'Project name: Forever Freedom onboarding\nOutcome: A ready partnership launch.'});
  assert.equal(ready.workItem.status,'needs_review');
  assert.equal(ready.workItem.payload.stage,'first_question');
  assert.equal(ready.workItem.payload.answer,'Project name: Forever Freedom onboarding\nOutcome: A ready partnership launch.');
  const applied=await service.applyWorkItem(ready.workItem.id);
  assert.equal(applied.receipt.action,'apply_project_onboarding_first_question');
  assert.equal(applied.receipt.payloadJson.noExternalAction,true);
  assert.equal(appliedOnboarding.length,1);
  assert.equal(appliedOnboarding[0].stage,'first_question');

  const resumedProject={...project(),metadataJson:{projectOnboarding:{status:'answered_first_question',firstAnswer:'Project name: Forever Freedom onboarding\nOutcome: A ready partnership launch.'}}};
  const resumed=await serviceFor({loadedProject:resumedProject}).service.openEntry({entrypointId:'project.onboarding',scope:{entityType:'project_section',entityId:'project_forever_freedom',sectionId:'project_interview'}});
  assert.equal(resumed.question.question,'Who owns this project, what is the next move, and what should VAL monitor next?');
  assert.deepEqual(resumed.session.workingBrief.currentStageContract.pageBoxes,['People involved','Next move','Monitoring after launch']);
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

test('project documents links only existing receipts, records their intended use, and applies internally',async()=>{
  const {service,appliedDocuments}=serviceFor();
  const opened=await service.openEntry({entrypointId:'project.documents',scope:{entityType:'project_section',entityId:'project_forever_freedom',sectionId:'documents'}});
  assert.equal(opened.question.targetField,'document_receipt[].{document_title,intended_project_use}');
  assert.match(opened.question.question,/which existing document receipts/i);
  const ready=await service.respond(opened.session.id,{answer:[
    'Documents: Forever Freedom MOU | Defines the signed partnership terms and decision boundaries.',
    'Forever Freedom launch scope | Defines the launch work that this project must coordinate.'
  ].join('\n')});
  assert.equal(ready.workItem.status,'needs_review');
  assert.equal(ready.workItem.payload.documents.length,2);
  assert.equal(ready.workItem.payload.documents[0].intendedUse,'Defines the signed partnership terms and decision boundaries.');
  const applied=await service.applyWorkItem(ready.workItem.id);
  assert.equal(applied.receipt.action,'apply_project_documents');
  assert.equal(applied.receipt.payloadJson.noExternalAction,true);
  assert.equal(appliedDocuments[0].documents[1].sourceType,'google_docs');
});

test('milestones require existing workstreams, map each question to the Milestones packet, and apply internally',async()=>{
  const loadedProject={
    ...project(),
    workstreams:[
      {id:'crm_payments',name:'CRM and payments'},
      {id:'partner_activation',name:'Partner activation'}
    ]
  };
  const {service,appliedMilestones}=serviceFor({loadedProject});
  const opened=await service.openEntry({entrypointId:'project.milestones',scope:{entityType:'project_section',entityId:'project_forever_freedom',sectionId:'milestones'}});
  assert.equal(opened.session.scope.entityId,'project_forever_freedom');
  assert.equal(opened.question.targetField,'project_milestone_packet[].{workstream_name,checkpoint,completion_signal,timing_or_trigger}');
  assert.match(opened.question.detail,/Project Managers > Milestones/i);
  await assert.rejects(service.applyWorkItem(opened.workItem.id),/complete and reviewed/i);

  const ready=await service.respond(opened.session.id,{answer:[
    'CRM and payments | Pipeline configured | A test submission creates the correct CRM record and payment handoff | Before partner launch',
    'Partner activation | First sponsor commitment | Signed sponsor confirmation is attached to the project | Before launch approval'
  ].join('\n')});
  assert.equal(ready.workItem.status,'needs_review');
  assert.equal(ready.workItem.payload.milestones.length,2);
  assert.equal(ready.workItem.payload.milestones[0].workstreamName,'CRM and payments');
  assert.equal(ready.workItem.payload.milestones[0].completionSignal,'A test submission creates the correct CRM record and payment handoff');

  const applied=await service.applyWorkItem(ready.workItem.id);
  assert.equal(applied.receipt.action,'apply_project_milestones');
  assert.equal(applied.receipt.payloadJson.noExternalAction,true);
  assert.equal(appliedMilestones[0].milestones[1].timingOrTrigger,'Before launch approval');
});

test('Milestones does not invent workstreams when the selected project has none',async()=>{
  const {service}=serviceFor();
  const opened=await service.openEntry({entrypointId:'project.milestones',scope:{entityType:'project_section',entityId:'project_forever_freedom',sectionId:'milestones'}});
  assert.equal(opened.question.targetField,'project_sop_packet.default_workstreams');
  assert.match(opened.question.question,/need its named workstreams first/i);
  await assert.rejects(service.respond(opened.session.id,{answer:'Launch approved'}),/need the selected project workstreams first/i);
});

test('Monitoring is scoped, field-targeted, review-gated, and applies only internal quiet-watch rules',async()=>{
  const loadedProject={
    ...project(),
    workstreams:[{id:'crm_payments',name:'CRM and payments',monitoringSignal:'Failed test submissions'}]
  };
  const {service,appliedMonitoring}=serviceFor({loadedProject});
  const opened=await service.openEntry({entrypointId:'project.monitoring',scope:{entityType:'project_section',entityId:'project_forever_freedom',sectionId:'monitoring_rules'}});
  assert.equal(opened.session.scope.entityId,'project_forever_freedom');
  assert.equal(opened.question.targetField,'project_monitoring_packet[].{watch_item,cadence,escalation_trigger,executive_action}');
  assert.match(opened.question.detail,/Current workstream signals: CRM and payments: Failed test submissions/i);
  await assert.rejects(service.applyWorkItem(opened.workItem.id),/complete and reviewed/i);

  const ready=await service.respond(opened.session.id,{answer:'CRM form conversion | Daily while launch work is active | A submission fails or conversion drops below agreed baseline | Surface the failure and affected workstream for executive decision'});
  assert.equal(ready.workItem.status,'needs_review');
  assert.equal(ready.workItem.payload.monitoringRules.length,1);
  assert.equal(ready.workItem.payload.monitoringRules[0].watchItem,'CRM form conversion');
  assert.equal(ready.workItem.payload.monitoringRules[0].executiveAction,'Surface the failure and affected workstream for executive decision');

  const applied=await service.applyWorkItem(ready.workItem.id);
  assert.equal(applied.workItem.status,'applied');
  assert.equal(applied.receipt.action,'apply_project_monitoring');
  assert.equal(applied.receipt.payloadJson.noExternalAction,true);
  assert.equal(appliedMonitoring.length,1);
  assert.equal(appliedMonitoring[0].monitoringRules[0].cadence,'Daily while launch work is active');
});

test('Relationship nurture uses only existing project links and applies an internal trust-protection packet',async()=>{
  const loadedProject={
    ...project(),
    projectPeople:[{relationshipId:'rel_aric',name:'Aric',email:'aric@example.com',role:'Partner lead'}]
  };
  const {service,appliedRelationshipNurture}=serviceFor({loadedProject});
  const opened=await service.openEntry({entrypointId:'project.relationship_nurture',scope:{entityType:'project_section',entityId:'project_forever_freedom',sectionId:'relationship_nurture'}});
  assert.equal(opened.question.targetField,'project_relationship_nurture_packet[].{relationship_name,cadence,useful_touch,trust_risk,review_trigger}');
  assert.match(opened.question.detail,/Existing linked relationships: Aric/i);
  await assert.rejects(service.applyWorkItem(opened.workItem.id),/complete and reviewed/i);

  const ready=await service.respond(opened.session.id,{answer:'Aric | Monthly during onboarding | Send a concise activation update with one useful decision or win | Overloading Aric with broad asks before the partnership path is clear | An unanswered planned check-in or material change to the partner launch'});
  assert.equal(ready.workItem.status,'needs_review');
  assert.equal(ready.workItem.payload.relationshipNurtureRules[0].relationshipId,'rel_aric');
  assert.equal(ready.workItem.payload.relationshipNurtureRules[0].usefulTouch,'Send a concise activation update with one useful decision or win');

  const applied=await service.applyWorkItem(ready.workItem.id);
  assert.equal(applied.workItem.status,'applied');
  assert.equal(applied.receipt.action,'apply_project_relationship_nurture');
  assert.equal(applied.receipt.payloadJson.noExternalAction,true);
  assert.equal(appliedRelationshipNurture.length,1);
  assert.equal(appliedRelationshipNurture[0].relationshipNurtureRules[0].reviewTrigger,'An unanswered planned check-in or material change to the partner launch');
});

test('Relationship nurture refuses to invent a project relationship',async()=>{
  const {service}=serviceFor();
  const opened=await service.openEntry({entrypointId:'project.relationship_nurture',scope:{entityType:'project_section',entityId:'project_forever_freedom',sectionId:'relationship_nurture'}});
  assert.equal(opened.question.targetField,'project_relationships_packet');
  assert.match(opened.question.question,/needs an existing project-linked relationship first/i);
  await assert.rejects(service.respond(opened.session.id,{answer:'Aric | Monthly | Useful update | Trust risk | Missed check-in'}),/needs an existing project-linked relationship first/i);
});

test('Why it matters prepares a scoped strategic judgment and preserves executive judgment as its basis',async()=>{
  const {service,appliedImportance}=serviceFor();
  const opened=await service.openEntry({entrypointId:'project.why_it_matters',scope:{entityType:'project_section',entityId:'project_forever_freedom',sectionId:'why_it_matters'}});
  assert.equal(opened.session.scope.entityId,'project_forever_freedom');
  assert.equal(opened.question.targetField,'project_manager_judgment_packet.{why_it_matters,evidence_summary,confidence} + project_identity_packet.strategic_importance + project_next_action_packet.why_now');
  assert.match(opened.question.detail,/executive judgment/i);
  await assert.rejects(service.applyWorkItem(opened.workItem.id),/complete and reviewed/i);

  const ready=await service.respond(opened.session.id,{answer:'A working partnership launch would establish the first repeatable Forever Freedom partner path | The MOU is active and the launch decisions are current | Executive judgment | High'});
  assert.equal(ready.workItem.status,'needs_review');
  assert.equal(ready.workItem.payload.projectImportance.whyNow,'The MOU is active and the launch decisions are current');
  assert.equal(ready.workItem.payload.projectImportance.basis,'Executive judgment');

  const applied=await service.applyWorkItem(ready.workItem.id);
  assert.equal(applied.workItem.status,'applied');
  assert.equal(applied.receipt.action,'apply_project_importance');
  assert.equal(applied.receipt.payloadJson.noExternalAction,true);
  assert.equal(appliedImportance.length,1);
  assert.equal(appliedImportance[0].projectImportance.strategicImportance,'A working partnership launch would establish the first repeatable Forever Freedom partner path');
});

test('Risk / blocker is packet-targeted, review-gated, and assigns the risk only to an existing project relationship',async()=>{
  const loadedProject={
    ...project(),
    projectPeople:[{relationshipId:'rel_aric',name:'Aric',email:'aric@example.com',role:'Partner lead'}]
  };
  const {service,appliedRisks}=serviceFor({loadedProject});
  const opened=await service.openEntry({entrypointId:'project.risk',scope:{entityType:'project_section',entityId:'project_forever_freedom',sectionId:'risk_blocker'}});
  assert.equal(opened.session.scope.entityId,'project_forever_freedom');
  assert.equal(opened.question.targetField,'project_risk_packet.{risk_type,risk_summary,why_it_matters,if_ignored,severity,owner,mitigation_next_step,watch_condition,confidence}');
  assert.match(opened.question.detail,/Accountable people must be already linked to this project: Aric/i);
  await assert.rejects(service.applyWorkItem(opened.workItem.id),/complete and reviewed/i);

  const ready=await service.respond(opened.session.id,{answer:'Operational | CRM and payment flow may not be ready for partner launch | Launch would create a poor first partner experience | High | Aric | Run one end-to-end test before launch approval | A test submission fails or payment handoff is missing | Executive confirmed'});
  assert.equal(ready.workItem.status,'needs_review');
  assert.equal(ready.workItem.payload.projectRisk.ownerId,'rel_aric');
  assert.equal(ready.workItem.payload.projectRisk.mitigation,'Run one end-to-end test before launch approval');

  const applied=await service.applyWorkItem(ready.workItem.id);
  assert.equal(applied.workItem.status,'applied');
  assert.equal(applied.receipt.action,'apply_project_risk');
  assert.equal(applied.receipt.payloadJson.noExternalAction,true);
  assert.equal(appliedRisks.length,1);
  assert.equal(appliedRisks[0].projectRisk.watchCondition,'A test submission fails or payment handoff is missing');
});

test('Risk / blocker can record no material risk without inventing a blocker and rejects unrelated owners',async()=>{
  const {service}=serviceFor();
  const opened=await service.openEntry({entrypointId:'project.risk',scope:{entityType:'project_section',entityId:'project_forever_freedom',sectionId:'risk_blocker'}});
  const noRisk=await service.respond(opened.session.id,{answer:'No material risk | The MOU is the only current evidence and it does not prove a blocker.'});
  assert.equal(noRisk.workItem.status,'needs_review');
  assert.equal(noRisk.workItem.payload.projectRisk.assessment,'no_material_risk');
  const applied=await service.applyWorkItem(noRisk.workItem.id);
  assert.equal(applied.receipt.action,'apply_project_risk');

  const linkedProject={...project(),projectPeople:[{relationshipId:'rel_aric',name:'Aric',email:'aric@example.com',role:'Partner lead'}]};
  const {service:strictService}=serviceFor({loadedProject:linkedProject});
  const strictOpened=await strictService.openEntry({entrypointId:'project.risk',scope:{entityType:'project_section',entityId:'project_forever_freedom',sectionId:'risk_blocker'}});
  const followup=await strictService.respond(strictOpened.session.id,{answer:'Operational | CRM readiness is uncertain | Launch could disappoint the partner | High | Jessa | Run one test | Test fails | Executive confirmed'});
  assert.equal(followup.workItem.status,'needs_input');
  assert.match(followup.question.question,/existing project relationship accountable for it/i);
});

test('Working narrative is scoped to the selected project and applies only its current-state judgment packet',async()=>{
  const {service,appliedNarratives}=serviceFor();
  const opened=await service.openEntry({entrypointId:'project.narrative',scope:{entityType:'project_section',entityId:'project_forever_freedom',sectionId:'working_narrative'}});
  assert.equal(opened.session.scope.entityId,'project_forever_freedom');
  assert.equal(opened.question.targetField,'project_manager_judgment_packet.{current_reality,what_val_now_knows,what_is_blocked,evidence_summary,confidence} + Working narrative');
  assert.match(opened.question.detail,/executive judgment/i);
  await assert.rejects(service.applyWorkItem(opened.workItem.id),/complete and reviewed/i);

  const ready=await service.respond(opened.session.id,{answer:'The partnership launch is defined, but CRM and payment setup still need one readiness check | VAL now knows the MOU and launch path are active | No current blocker | Executive judgment | High'});
  assert.equal(ready.workItem.status,'needs_review');
  assert.equal(ready.workItem.payload.projectNarrative.whatIsBlocked,'No current blocker');
  assert.equal(ready.workItem.payload.projectNarrative.basis,'Executive judgment');

  const applied=await service.applyWorkItem(ready.workItem.id);
  assert.equal(applied.workItem.status,'applied');
  assert.equal(applied.receipt.action,'apply_project_narrative');
  assert.equal(applied.receipt.payloadJson.noExternalAction,true);
  assert.equal(appliedNarratives.length,1);
  assert.equal(appliedNarratives[0].projectNarrative.currentReality,'The partnership launch is defined, but CRM and payment setup still need one readiness check');
});

test('What VAL needs next prepares one typed gap and updates only the selected project interview packet',async()=>{
  const {service,appliedNeedsNext}=serviceFor();
  const opened=await service.openEntry({
    entrypointId:'project.needs_next',
    scope:{entityType:'project_section',entityId:'project_forever_freedom',sectionId:'what_val_needs_next'}
  });
  assert.equal(opened.session.scope.entityId,'project_forever_freedom');
  assert.equal(opened.question.targetField,'project_interview_packet.{current_question,question_purpose,target_packet_field,target_page_boxes,missing_fields} + typed target packet');
  assert.match(opened.question.detail,/fact targets Working narrative/i);
  await assert.rejects(service.applyWorkItem(opened.workItem.id),/complete and reviewed/i);

  const ready=await service.respond(opened.session.id,{answer:'source | The signed final MOU | VAL cannot safely confirm the partnership terms without it | Link the existing email attachment receipt | Which MOU version is the signed final agreement? | Source receipt: MOU attachment | High'});
  assert.equal(ready.workItem.status,'needs_review');
  assert.equal(ready.workItem.payload.projectNeedsNext.needType,'source');
  assert.equal(ready.workItem.payload.projectNeedsNext.targetPacketField,'project_document_receipts');
  assert.equal(ready.workItem.payload.projectNeedsNext.nextQuestion,'Which MOU version is the signed final agreement?');

  const applied=await service.applyWorkItem(ready.workItem.id);
  assert.equal(applied.workItem.status,'applied');
  assert.equal(applied.receipt.action,'apply_project_needs_next');
  assert.equal(applied.receipt.payloadJson.noExternalAction,true);
  assert.equal(appliedNeedsNext.length,1);
  assert.equal(appliedNeedsNext[0].projectNeedsNext.resolutionPath,'Link the existing email attachment receipt');
});

test('What VAL needs next preserves a partial answer and asks only for the remaining field',async()=>{
  const {service}=serviceFor();
  const opened=await service.openEntry({
    entrypointId:'project.needs_next',
    scope:{entityType:'project_section',entityId:'project_forever_freedom',sectionId:'what_val_needs_next'}
  });

  const partial=await service.respond(opened.session.id,{answer:'type: source; missing item: The signed final MOU; why needed: VAL needs confirmed partnership terms; route: Link the existing attachment receipt; next question: Which MOU version is signed?; basis: Source receipt: MOU attachment'});
  assert.equal(partial.workItem.status,'needs_input');
  assert.match(partial.question.question,/confidence/i);
  assert.doesNotMatch(partial.question.question,/missing item/i);

  const ready=await service.respond(opened.session.id,{answer:'confidence: High'});
  assert.equal(ready.workItem.status,'needs_review');
  assert.equal(ready.workItem.payload.projectNeedsNext.missingItem,'The signed final MOU');
  assert.equal(ready.workItem.payload.projectNeedsNext.confidence,'High');
});

test('Operating System accepts only current VAL patterns and applies only the selected project SOP packet',async()=>{
  const {service,appliedOperatingSystems}=serviceFor();
  const opened=await service.openEntry({
    entrypointId:'project.sop',
    scope:{entityType:'project_section',entityId:'project_forever_freedom',sectionId:'sop_fit'}
  });
  assert.equal(opened.session.scope.entityId,'project_forever_freedom');
  assert.equal(opened.question.targetField,'project_sop_packet.{sop_id,sop_name,fit_reason,known_deviations,basis,confidence} + Operating System');
  assert.match(opened.question.question,/Client Dashboard Buildout/i);
  await assert.rejects(service.applyWorkItem(opened.workItem.id),/complete and reviewed/i);

  const rejected=await service.respond(opened.session.id,{answer:'Unstructured custom process | It feels right | No material deviations | Executive judgment | High'});
  assert.equal(rejected.workItem.status,'needs_input');
  assert.match(rejected.question.question,/operating system from the available choices/i);

  const ready=await service.respond(opened.session.id,{answer:'Client Dashboard Buildout (client_dashboard_buildout) | This project needs source mapping, metrics, and dashboard handoff | No material deviations | Executive judgment | High'});
  assert.equal(ready.workItem.status,'needs_review');
  assert.equal(ready.workItem.payload.projectOperatingSystem.sopId,'client_dashboard_buildout');
  assert.equal(ready.workItem.payload.projectOperatingSystem.sopName,'Client Dashboard Buildout');

  const applied=await service.applyWorkItem(ready.workItem.id);
  assert.equal(applied.workItem.status,'applied');
  assert.equal(applied.receipt.action,'apply_project_operating_system');
  assert.equal(applied.receipt.payloadJson.noExternalAction,true);
  assert.equal(appliedOperatingSystems.length,1);
  assert.equal(appliedOperatingSystems[0].projectOperatingSystem.knownDeviations,'No material deviations');
});

test('Current Phase requires the applied operating system and accepts only its phase sequence',async()=>{
  const {service:unconfiguredService}=serviceFor();
  await assert.rejects(
    unconfiguredService.openEntry({entrypointId:'project.phase',scope:{entityType:'project_section',entityId:'project_forever_freedom',sectionId:'project_phase'}}),
    /Select and apply a Project Managers Operating System/i
  );

  const loadedProject={
    ...project(),
    sopId:'client_dashboard_buildout',
    projectOperatingSystem:{sopId:'client_dashboard_buildout',sopName:'Client Dashboard Buildout',fitReason:'The project needs a dashboard build',knownDeviations:'No material deviations',basis:'Executive judgment',confidence:'High'}
  };
  const {service,appliedPhases}=serviceFor({loadedProject});
  const opened=await service.openEntry({
    entrypointId:'project.phase',
    scope:{entityType:'project_section',entityId:'project_forever_freedom',sectionId:'project_phase'}
  });
  assert.equal(opened.question.targetField,'project_sop_packet.{current_phase,phase_evidence,phase_exit_condition,next_phase_trigger,phase_basis,phase_confidence} + Current Phase');
  assert.match(opened.question.question,/Build dashboard/i);
  await assert.rejects(service.applyWorkItem(opened.workItem.id),/complete and reviewed/i);

  const rejected=await service.respond(opened.session.id,{answer:'Launch and validate | The dashboard is in review | Review is complete | Approval is recorded | Executive judgment | High'});
  assert.equal(rejected.workItem.status,'needs_input');
  assert.match(rejected.question.question,/current phase from the selected operating-system sequence/i);

  const ready=await service.respond(opened.session.id,{answer:'Build dashboard | The dashboard skeleton is linked to the approved source map | Dashboard is ready for metric validation | The metrics brief and acceptance test are complete | Source receipt: approved source map | High'});
  assert.equal(ready.workItem.status,'needs_review');
  assert.equal(ready.workItem.payload.projectPhase.currentPhase,'Build dashboard');
  assert.equal(ready.workItem.payload.projectPhase.nextPhaseTrigger,'The metrics brief and acceptance test are complete');

  const applied=await service.applyWorkItem(ready.workItem.id);
  assert.equal(applied.workItem.status,'applied');
  assert.equal(applied.receipt.action,'apply_project_phase');
  assert.equal(applied.receipt.payloadJson.noExternalAction,true);
  assert.equal(appliedPhases.length,1);
  assert.equal(appliedPhases[0].projectPhase.exitCondition,'Dashboard is ready for metric validation');
});

test('Project overview records one bounded Round Table focus without rewriting its follow-through section',async()=>{
  const {service,appliedOverviewFocuses}=serviceFor();
  const opened=await service.openEntry({
    entrypointId:'project.overview',
    scope:{entityType:'project_section',entityId:'project_forever_freedom',sectionId:'project_overview'}
  });
  assert.equal(opened.question.targetField,'project_overview_focus_packet.{focus_type,title,focus_statement,completion_condition,target_section,basis,confidence} + Round Table focus');
  assert.match(opened.question.question,/Decision/i);
  await assert.rejects(service.applyWorkItem(opened.workItem.id),/complete and reviewed/i);

  const rejected=await service.respond(opened.session.id,{answer:'Unmapped request | Choose the sponsor revenue path | Decide which sponsor revenue path matches the MOU | One path and owner are explicit | Next move | Executive judgment: MOU has two possible sponsor paths | High'});
  assert.equal(rejected.workItem.status,'needs_input');
  assert.match(rejected.question.question,/focus type/i);

  const ready=await service.respond(opened.session.id,{answer:'Decision | Choose the sponsor revenue path | Decide which sponsor revenue path matches the MOU | One path and owner are explicit | Next move | Executive judgment: MOU has two possible sponsor paths | High'});
  assert.equal(ready.workItem.status,'needs_review');
  assert.equal(ready.workItem.payload.projectOverviewFocus.focusType,'decision');
  assert.equal(ready.workItem.payload.projectOverviewFocus.targetSection,'next_move');

  const applied=await service.applyWorkItem(ready.workItem.id);
  assert.equal(applied.workItem.status,'applied');
  assert.equal(applied.receipt.action,'apply_project_overview_focus');
  assert.equal(applied.receipt.payloadJson.noExternalAction,true);
  assert.equal(appliedOverviewFocuses.length,1);
  assert.equal(appliedOverviewFocuses[0].projectOverviewFocus.title,'Choose the sponsor revenue path');
});

test('Prepared Work accepts only existing VAL artifact types and applies one internal Ready for You proposal',async()=>{
  const {service,appliedPreparedWork}=serviceFor();
  const opened=await service.openEntry({
    entrypointId:'project.prepared_work',
    scope:{entityType:'project_section',entityId:'project_forever_freedom',sectionId:'prepared_work'}
  });
  assert.equal(opened.question.targetField,'project_prepared_work_packets[].{kind,title,audience,source_context,desired_outcome,review_boundary,basis,confidence} + Ready for You');
  assert.match(opened.question.question,/Proposal draft/i);
  await assert.rejects(service.applyWorkItem(opened.workItem.id),/complete and reviewed/i);

  const rejected=await service.respond(opened.session.id,{answer:'Made-up podcast | Forever Freedom sponsor proposal | prospective US sponsors | Forever Freedom MOU | Clarify scope and sponsorship value | Internal review before any external draft or send | Source receipt: Forever Freedom MOU | High'});
  assert.equal(rejected.workItem.status,'needs_input');
  assert.match(rejected.question.question,/artifact type/i);

  const ready=await service.respond(opened.session.id,{answer:'Proposal draft | Forever Freedom sponsor proposal | prospective US sponsors | Forever Freedom MOU | Clarify scope and sponsorship value | Internal review before any external draft or send | Source receipt: Forever Freedom MOU | High'});
  assert.equal(ready.workItem.status,'needs_review');
  assert.equal(ready.workItem.payload.projectPreparedWork.kind,'proposal_draft');
  assert.equal(ready.workItem.payload.projectPreparedWork.title,'Forever Freedom sponsor proposal');

  const applied=await service.applyWorkItem(ready.workItem.id);
  assert.equal(applied.workItem.status,'applied');
  assert.equal(applied.receipt.action,'apply_project_prepared_work');
  assert.equal(applied.receipt.payloadJson.noExternalAction,true);
  assert.equal(appliedPreparedWork.length,1);
  assert.equal(appliedPreparedWork[0].projectPreparedWork.kind,'proposal_draft');
  assert.equal(appliedPreparedWork[0].projectPreparedWork.audience,'prospective US sponsors');
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
  assert.equal(opened.question.targetField,'prepared_artifact.email_draft');
  assert.equal(opened.session.workingBrief.sourceReceipt.actionItems[0],'Anthony to send the website link to Jessa and Aric.');
  assert.equal(opened.session.workingBrief.sourceReceipt.keyPoints[0],'Purpose of the call: follow up on Forever Freedom.');
  assert.equal(opened.workItem.status,'needs_review');
  assert.equal(opened.workItem.type,'transcript_meeting_overview');
  assert.equal(opened.workItem.payload.preparedArtifact.body,opened.session.workingBrief.sourceReceipt.body);

  const applied=await service.applyWorkItem(opened.workItem.id);
  assert.equal(applied.workItem.status,'applied');
  assert.equal(applied.receipt.action,'prepare_transcript_meeting_overview');
  assert.equal(applied.receipt.payloadJson.noExternalAction,true);
  assert.equal(preparedTranscriptOverviews.length,1);
  assert.equal(preparedTranscriptOverviews[0].transcriptId,'transcript_forever_freedom');
  assert.equal(applied.draft.body,opened.session.workingBrief.sourceReceipt.body);
});

test('Transcript Action Item remains word for word, creates only one internal Commitment, and rejects an unselected line',async()=>{
  const {service,createdTranscriptActionItems}=serviceFor();
  const opened=await service.openEntry({
    entrypointId:'transcript.action_item',
    scope:{entityType:'transcript',entityId:'transcript_forever_freedom',sectionId:'action_item',actionItemIndex:0}
  });
  assert.equal(opened.session.scope.entityId,'transcript_forever_freedom');
  assert.equal(opened.session.workingBrief.actionItem,'Anthony to send the website link to Jessa and Aric.');
  assert.equal(opened.question.targetField,'commitment.source_receipt.action_item');
  assert.equal(opened.workItem.status,'needs_review');

  const applied=await service.applyWorkItem(opened.workItem.id);
  assert.equal(applied.workItem.status,'applied');
  assert.equal(applied.receipt.action,'create_transcript_action_item_task');
  assert.equal(applied.receipt.payloadJson.noExternalAction,true);
  assert.equal(createdTranscriptActionItems.length,1);
  assert.equal(createdTranscriptActionItems[0].actionItem,'Anthony to send the website link to Jessa and Aric.');

  await assert.rejects(
    service.openEntry({entrypointId:'transcript.action_item',scope:{entityType:'transcript',entityId:'transcript_forever_freedom',sectionId:'action_item',actionItemIndex:4}}),
    /exact Action Item/i
  );
});

test('a missing transcript is rejected instead of substituting another meeting',async()=>{
  const {service}=serviceFor({loadedTranscript:null});
  await assert.rejects(
    service.openEntry({entrypointId:'transcript.working_brief',scope:{entityId:'transcript_missing'}}),
    /did not substitute another meeting/i
  );
});

test('Executive Inbox Co-Work stays scoped to the selected durable thread and prepares only a private review draft',async()=>{
  const {service,preparedEmailThreadDrafts}=serviceFor();
  const opened=await service.openEntry({
    entrypointId:'email.thread',
    scope:{entityType:'email_thread',entityId:'email_mou',sectionId:'reply_draft',provider:'gmail',messageId:'email_mou',threadId:'thread_mou',conversationId:'conversation_mou'}
  });
  assert.equal(opened.session.scope.entityId,'email_mou');
  assert.equal(opened.session.workingBrief.subject,'MOU for Forever Freedom');
  assert.equal(opened.session.workingBrief.messages[0].body,'Please review the attached MOU and let me know what changes you need.');
  assert.equal(opened.question.targetField,'email_judgment_packet.reply_outcome');
  assert.equal(opened.workItem.status,'needs_input');

  const ready=await service.respond(opened.session.id,{answer:'Confirm the final MOU changes and keep the partnership moving.'});
  assert.equal(ready.workItem.type,'email_thread_draft');
  assert.equal(ready.workItem.status,'needs_review');
  assert.equal(ready.workItem.payload.preparedArtifact.subject,'Re: MOU for Forever Freedom');
  assert.equal(ready.workItem.payload.replyIntent,'Confirm the final MOU changes and keep the partnership moving.');
  assert.equal(preparedEmailThreadDrafts.length,1);
  assert.equal(preparedEmailThreadDrafts[0].messageId,'email_mou');
  assert.equal(preparedEmailThreadDrafts[0].threadId,'thread_mou');
  assert.equal(preparedEmailThreadDrafts[0].conversationId,'conversation_mou');
});

test('Executive Inbox Co-Work rejects a missing selected thread instead of borrowing inbox context',async()=>{
  const {service}=serviceFor({loadedEmailThread:null});
  await assert.rejects(
    service.openEntry({entrypointId:'email.thread',scope:{entityType:'email_thread',entityId:'email_missing',sectionId:'reply_draft'}}),
    /did not substitute another conversation/i
  );
});

test('Relationship Co-Work prepares one source-aware stewardship move and applies only the internal relationship packet',async()=>{
  const {service,appliedRelationshipOverviews}=serviceFor();
  const opened=await service.openEntry({
    entrypointId:'relationship.overview',
    scope:{entityType:'relationship',entityId:'rel_aric',sectionId:'overview'}
  });
  assert.equal(opened.session.scope.entityId,'rel_aric');
  assert.equal(opened.question.targetField,'relationship_stewardship_packet.next_move');
  assert.match(opened.question.question,/What small relationship outcome should VAL prepare next for Aric/i);
  assert.match(opened.session.workingBrief.sourceRefs[0].quote_or_summary,/Partner lead connected to the Forever Freedom MOU/i);
  await assert.rejects(service.applyWorkItem(opened.workItem.id),/must be reviewed/i);

  const ready=await service.respond(opened.session.id,{answer:'Prepare a concise MOU decision check-in that makes the remaining approval path explicit.'});
  assert.equal(ready.workItem.status,'needs_review');
  assert.equal(ready.workItem.payload.relationshipOverview.nextMove,'Prepare a concise MOU decision check-in that makes the remaining approval path explicit.');
  assert.match(ready.workItem.payload.relationshipOverview.basis,/Executive direction/i);

  const applied=await service.applyWorkItem(ready.workItem.id);
  assert.equal(applied.workItem.status,'applied');
  assert.equal(applied.receipt.action,'apply_relationship_overview_focus');
  assert.equal(applied.receipt.payloadJson.noExternalAction,true);
  assert.equal(appliedRelationshipOverviews.length,1);
  assert.equal(appliedRelationshipOverviews[0].relationshipId,'rel_aric');
  assert.equal(applied.relationship.nextStewardshipMove,'Prepare a concise MOU decision check-in that makes the remaining approval path explicit.');
});

test('Relationship Co-Work rejects a missing selected relationship instead of borrowing another profile',async()=>{
  const {service}=serviceFor({loadedRelationships:[]});
  await assert.rejects(
    service.openEntry({entrypointId:'relationship.overview',scope:{entityType:'relationship',entityId:'relationship_missing',sectionId:'overview'}}),
    /did not substitute another person or relationship/i
  );
});

test('Relationships Co-Work opens the canonical overview route instead of the legacy generic chat',()=>{
  const handler=hearth.slice(hearth.indexOf('async function handleRelationshipAction(actionId)'),hearth.indexOf('function relationshipUsefulText'));
  assert.match(handler,/await openRelationshipOverviewCowork\(profile\)/);
  assert.doesNotMatch(handler,/What should VAL help you think through/i);
  assert.match(hearth,/entrypointId:'relationship\.overview'/);
  assert.match(hearth,/data-cowork-apply-relationship-overview/);
  assert.match(server,/applyCoworkRelationshipOverview/);
  assert.match(server,/loadRelationshipForCowork/);
});

test('Project Managers canonical entries bypass generic Co-Work and use registered routes',()=>{
  assert.match(hearth,/function projectCoworkWorkstreamSuggestions/);
  assert.match(hearth,/function projectProfileForCoworkNode/);
  assert.match(hearth,/projectManagerProfile\.dataset\.projectProfileId/);
  assert.match(hearth,/async function openProjectWorkstreamsCowork/);
  assert.match(hearth,/async function openProjectOverviewCowork/);
  assert.match(hearth,/async function openProjectOnboardingCowork/);
  assert.match(hearth,/const project = projectProfileForCoworkNode\(node\)/);
  assert.match(hearth,/entrypointId:'project\.overview'/);
  assert.match(hearth,/entrypointId:'project\.workstreams'/);
  assert.match(hearth,/entrypointId:'project\.identity'/);
  assert.match(hearth,/entrypointId:'project\.onboarding'/);
  assert.match(hearth,/entrypointId:'project\.people'/);
  assert.match(hearth,/entrypointId:'project\.documents'/);
  assert.match(hearth,/entrypointId:'project\.milestones'/);
  assert.match(hearth,/entrypointId:'project\.monitoring'/);
  assert.match(hearth,/entrypointId:'project\.relationship_nurture'/);
  assert.match(hearth,/entrypointId:'project\.why_it_matters'/);
  assert.match(hearth,/entrypointId:'project\.risk'/);
  assert.match(hearth,/entrypointId:'project\.narrative'/);
  assert.match(hearth,/entrypointId:'project\.needs_next'/);
  assert.match(hearth,/entrypointId:'project\.sop'/);
  assert.match(hearth,/entrypointId:'project\.phase'/);
  assert.match(hearth,/entrypointId:'project\.prepared_work'/);
  assert.match(hearth,/entrypointId:'project\.next_move'/);
  assert.match(hearth,/\/api\/val\/cowork\/entries\/open/);
  assert.match(hearth,/\/api\/val\/cowork\/sessions\/.*\/respond/);
  assert.match(hearth,/\/api\/val\/cowork\/work-items\/.*\/apply/);
  assert.match(hearth,/if\(field === 'workstreams'\) return openProjectWorkstreamsCowork/);
  assert.match(hearth,/if\(field === 'project_overview'\) return openProjectOverviewCowork/);
  assert.match(hearth,/if\(field === 'project_interview'\) return openProjectOnboardingCowork/);
  assert.match(hearth,/if\(field === 'what_this_is'\) return openProjectIdentityCowork/);
  assert.match(hearth,/if\(field === 'people_involved'\) return openProjectPeopleCowork/);
  assert.match(hearth,/if\(field === 'documents_sources'\) return openProjectDocumentsCowork/);
  assert.match(hearth,/if\(field === 'milestones'\) return openProjectMilestonesCowork/);
  assert.match(hearth,/if\(field === 'monitoring_rules'\) return openProjectMonitoringCowork/);
  assert.match(hearth,/if\(field === 'relationship_nurture'\) return openProjectRelationshipNurtureCowork/);
  assert.match(hearth,/if\(field === 'why_it_matters'\) return openProjectImportanceCowork/);
  assert.match(hearth,/if\(field === 'risk_blocker'\) return openProjectRiskCowork/);
  assert.match(hearth,/if\(field === 'working_narrative'\) return openProjectNarrativeCowork/);
  assert.match(hearth,/if\(field === 'what_val_needs_next'\) return openProjectNeedsNextCowork/);
  assert.match(hearth,/if\(field === 'sop_fit'\) return openProjectOperatingSystemCowork/);
  assert.match(hearth,/if\(field === 'project_phase'\) return openProjectPhaseCowork/);
  assert.match(hearth,/if\(field === 'prepared_work'\) return openProjectPreparedWorkCowork/);
  assert.match(hearth,/activeProjectCoworkTarget\.mode === 'field_update'/);
  assert.match(hearth,/if\(field === 'next_move'\) return openProjectNextMoveCowork/);
  assert.match(hearth,/function projectRelationshipPacketItems/);
  assert.match(hearth,/role_in_project:projectCleanText\(matched\?\.role, 'Connected to this work'\)/);
  assert.match(hearth,/if\(await submitActiveCoworkEntry\(\)\) return;/);
  assert.match(hearth,/data-cowork-apply-workstreams/);
  assert.match(hearth,/data-cowork-apply-project-onboarding/);
  assert.match(hearth,/data-cowork-apply-project-identity/);
  assert.match(hearth,/data-cowork-apply-project-people/);
  assert.match(hearth,/data-cowork-apply-project-documents/);
  assert.match(hearth,/data-cowork-apply-project-milestones/);
  assert.match(hearth,/data-cowork-apply-project-monitoring/);
  assert.match(hearth,/data-cowork-apply-project-relationship-nurture/);
  assert.match(hearth,/data-cowork-apply-project-importance/);
  assert.match(hearth,/data-cowork-apply-project-risk/);
  assert.match(hearth,/data-cowork-apply-project-narrative/);
  assert.match(hearth,/data-cowork-apply-project-needs-next/);
  assert.match(hearth,/data-cowork-apply-project-operating-system/);
  assert.match(hearth,/data-cowork-apply-project-phase/);
  assert.match(hearth,/data-cowork-apply-project-overview/);
  assert.match(hearth,/data-cowork-apply-project-prepared-work/);
  assert.match(hearth,/data-cowork-apply-next-move/);
  assert.match(hearth,/function projectManagerMonitoringRuleList/);
  assert.match(hearth,/function projectManagerRelationshipNurtureList/);
  assert.match(hearth,/function projectImportancePacketItem/);
  assert.match(hearth,/function projectManagerRiskCard/);
  assert.match(hearth,/function projectNarrativePacketItem/);
  assert.match(hearth,/function projectNeedsNextPacketItem/);
  assert.match(hearth,/function projectOperatingSystemPacketItem/);
  assert.match(hearth,/function renderCoworkProjectPhaseItem/);
  assert.match(hearth,/function renderCoworkProjectOverviewFocusItem/);
  assert.match(server,/async function applyCoworkProjectOverview/);
  assert.match(server,/applyProjectOverview:applyCoworkProjectOverview/);
  assert.match(hearth,/function renderCoworkProjectPreparedWorkItem/);
  assert.match(server,/async function applyCoworkProjectPreparedWork/);
  assert.match(server,/applyProjectPreparedWork:applyCoworkProjectPreparedWork/);
  assert.match(hearth,/restoreProjectWindow\(projectReturnId\)/);
  assert.match(hearth,/function renderProjectManagerLoadingState/);
  assert.match(hearth,/if\(canUseApi && !projectIndexLoaded\)/);
  assert.match(hearth,/const selectedProject = selectedProjectId && projectIndexItems\(\)\.find/);
});

test('Transcript canonical Co-Work bypasses the legacy freeform chat route',()=>{
  assert.match(hearth,/async function openTranscriptWorkingBriefCowork/);
  assert.match(hearth,/entrypointId:'transcript\.working_brief'/);
  assert.match(hearth,/async function openTranscriptActionItemCowork/);
  assert.match(hearth,/entrypointId:'transcript\.action_item'/);
  assert.match(hearth,/data-transcript-cowork/);
  assert.match(hearth,/data-cowork-apply-transcript-overview/);
  assert.match(hearth,/data-cowork-apply-transcript-action-item/);
  assert.match(hearth,/returnTarget:'timeline'/);
  assert.match(hearth,/function timelineFullTranscriptText/);
  assert.doesNotMatch(hearth,/data-transcript-chat/);
  assert.doesNotMatch(hearth,/timelineTranscriptAsk/);
  assert.match(server,/async function loadTranscriptForCowork/);
  assert.match(server,/async function prepareCoworkTranscriptMeetingOverview/);
  assert.match(server,/async function createCoworkTranscriptActionItem/);
  assert.doesNotMatch(server,/app\.post\('\/api\/val\/transcripts\/:transcriptId\/actions'/);
});

test('Executive Inbox canonical Co-Work opens one selected durable thread and routes private drafts to Leverage',()=>{
  assert.match(hearth,/async function openCorrespondenceThreadCowork/);
  assert.match(hearth,/entrypointId:'email\.thread'/);
  assert.match(hearth,/data-cowork-open-email-thread-draft/);
  assert.match(hearth,/openLeverageApprovalWorkspace\(\)/);
  assert.match(hearth,/if\(action === 'cowork_correspondence'\)\{\s*await openCorrespondenceThreadCowork\(item\);/);
  assert.match(server,/async function loadEmailThreadForCowork/);
  assert.match(server,/async function prepareCoworkEmailThreadDraft/);
  assert.match(server,/loadEmailThread:loadEmailThreadForCowork/);
  assert.match(server,/prepareEmailThreadDraft:prepareCoworkEmailThreadDraft/);
});

test('project foundation application updates only the selected internal project packet',()=>{
  assert.match(server,/async function applyCoworkProjectIdentity/);
  assert.match(server,/projectOnboardingStatus:'foundation_applied'/);
  assert.match(server,/needsProjectOnboarding:false/);
  assert.match(server,/applyProjectIdentity:applyCoworkProjectIdentity/);
  assert.match(server,/async function applyCoworkProjectPeople/);
  assert.match(server,/applyProjectPeople:applyCoworkProjectPeople/);
  assert.match(server,/async function applyCoworkProjectDocuments/);
  assert.match(server,/applyProjectDocuments:applyCoworkProjectDocuments/);
  assert.match(server,/async function applyCoworkProjectMilestones/);
  assert.match(server,/applyProjectMilestones:applyCoworkProjectMilestones/);
  assert.match(server,/async function applyCoworkProjectMonitoring/);
  assert.match(server,/applyProjectMonitoring:applyCoworkProjectMonitoring/);
  assert.match(server,/async function applyCoworkProjectRelationshipNurture/);
  assert.match(server,/applyProjectRelationshipNurture:applyCoworkProjectRelationshipNurture/);
  assert.match(server,/async function applyCoworkProjectImportance/);
  assert.match(server,/applyProjectImportance:applyCoworkProjectImportance/);
  assert.match(server,/async function applyCoworkProjectRisk/);
  assert.match(server,/applyProjectRisk:applyCoworkProjectRisk/);
  assert.match(server,/async function applyCoworkProjectNarrative/);
  assert.match(server,/applyProjectNarrative:applyCoworkProjectNarrative/);
  assert.match(server,/async function applyCoworkProjectNeedsNext/);
  assert.match(server,/applyProjectNeedsNext:applyCoworkProjectNeedsNext/);
  assert.match(server,/async function applyCoworkProjectOperatingSystem/);
  assert.match(server,/applyProjectOperatingSystem:applyCoworkProjectOperatingSystem/);
  assert.match(server,/async function applyCoworkProjectPhase/);
  assert.match(server,/applyProjectPhase:applyCoworkProjectPhase/);
  assert.match(server,/projectPeople:linkedPeople\.map/);
  assert.match(server,/projectPeople:Array\.isArray\(metadata\.projectPeople\)\?metadata\.projectPeople:\[\]/);
  assert.match(server,/projectDocuments:linkedDocuments/);
  assert.match(server,/projectDocuments:Array\.isArray\(metadata\.projectDocuments\)\?metadata\.projectDocuments:\[\]/);
  assert.match(server,/milestones:Array\.isArray\(metadata\.milestones\)\?metadata\.milestones:\[\]/);
  assert.match(server,/monitoringRules:Array\.isArray\(metadata\.monitoringRules\)\?metadata\.monitoringRules:\[\]/);
  assert.match(server,/relationshipNurtureRules:Array\.isArray\(metadata\.relationshipNurtureRules\)\?metadata\.relationshipNurtureRules:\[\]/);
  assert.match(server,/projectImportance:metadata\.projectImportance/);
  assert.match(server,/projectRisk:metadata\.projectRisk/);
  assert.match(server,/const projectNarrative=metadata\.projectNarrative/);
  assert.match(server,/const projectNeedsNext=metadata\.projectNeedsNext/);
  assert.match(server,/const projectOperatingSystem=metadata\.projectOperatingSystem/);
  assert.match(server,/const projectPhaseRecord=metadata\.projectPhaseRecord/);
  assert.match(hearth,/foundation_applied/);
});
