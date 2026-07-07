const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {VAL_TRANSCRIPT_INTELLIGENCE_SQL}=require('../services/valTranscriptIntelligenceSchema');
const {createValTranscriptIntelligenceService,qualityGate,commitmentExtractor,taskContextBuilder,capacityAndTone,preparedWorkCandidates,introCandidatesFromMatches}=require('../services/valTranscriptIntelligence');
const {createValReadyForYouService}=require('../services/valReadyForYou');

const root=path.join(__dirname,'..');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
const routes=fs.readFileSync(path.join(root,'services','valTranscriptIntelligenceRoutes.js'),'utf8');

test('transcript intelligence schema creates durable backend tables',()=>{
  for(const table of ['transcript_intelligence_runs','transcript_intelligence_items']){
    assert.match(VAL_TRANSCRIPT_INTELLIGENCE_SQL,new RegExp(`create table if not exists ${table}`));
  }
  for(const field of ['quality_gate_json','linkage_json','commitments_json','contextual_tasks_json','relationship_signals_json','project_signals_json','capacity_and_tone_context_json','teach_val_candidates_json','ready_for_you_candidates_json','executive_instructions_json']){
    assert.match(VAL_TRANSCRIPT_INTELLIGENCE_SQL,new RegExp(field));
  }
});

test('transcript intelligence routes are backend-only and mounted',()=>{
  assert.match(server,/registerValTranscriptIntelligenceRoutes/);
  assert.match(server,/ensureValTranscriptIntelligenceTables/);
  assert.match(server,/async function listRelationshipContactsForTranscript/);
  assert.match(server,/relationshipContactFromStoredProfile/);
  assert.match(server,/listRelationshipContacts:listRelationshipContactsForTranscript/);
  assert.match(routes,/\/api\/val\/transcripts\/intake/);
  assert.match(routes,/\/api\/val\/transcripts\/:id\/intelligence/);
  assert.match(routes,/\/api\/val\/transcripts\/:id\/prepare-follow-up/);
});

test('commitments come before contextual tasks',()=>{
  const record={id:'tr_order',rawText:'Jessa: I will send Aric the partner workflow tomorrow. Aric: Great, I will review it after that.'};
  const commitments=commitmentExtractor(record,[]);
  const tasks=taskContextBuilder(record,commitments);
  assert.ok(commitments.length>=1);
  assert.equal(tasks[0].commitment_id,commitments[0].id);
  assert.ok(tasks[0].why);
  assert.ok(tasks[0].source_quote);
});

test('capacity and tone context is non-clinical',()=>{
  const context=capacityAndTone({rawText:'I am exhausted and it is hard to focus, but I am excited about the breakthrough.'});
  assert.equal(context.label,'capacity_and_tone_context');
  assert.match(context.limitation,/not clinical/i);
});

test('intakes transcript intelligence and stores linked follow-up candidates',async()=>{
  let store={};
  const transcript={
    id:'tr_phase7',
    title:'Aric partner workflow',
    rawText:'Jessa: I will send Aric the partner workflow tomorrow. Aric: Great. I can introduce Fred after I review it. Jessa: I prefer direct language and I do not want this to sound corporate. Jessa: I am tired today but excited about Frisson.',
    metadata:{calendarEventId:'cal_aric'}
  };
  const service=createValTranscriptIntelligenceService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    uuid:prefix=>`${prefix}_test_${Math.random().toString(36).slice(2,7)}`,
    tenantId:()=>'tenant',
    userId:()=>'user',
    getTranscript:async()=>transcript,
    meetingPrepService:{getMeetingPrep:async()=>({id:'prep_aric'})},
    resolveMeetingContext:async()=>({meeting:{id:'cal_aric',attendees:[{name:'Aric',email:'aric@example.com'}]},relationshipContext:{attendees:[{name:'Aric',email:'aric@example.com'}]},openLoops:[],errors:[]}),
    resolveIdentity:async()=>({crm_contact_id:'crm_aric',match_status:'matched',match_confidence:0.92})
  });
  const result=await service.intake({transcriptId:'tr_phase7'});
  assert.equal(result.ok,true);
  assert.equal(result.no_external_action,true);
  assert.equal(result.run.transcriptId,'tr_phase7');
  assert.equal(result.run.linkageJson.linked_calendar_event,'cal_aric');
  assert.equal(result.run.linkageJson.linked_meeting_prep_brief,'prep_aric');
  assert.ok(result.run.commitmentsJson.length>=1);
  assert.equal(result.run.contextualTasksJson[0].commitment_id,result.run.commitmentsJson[0].id);
  assert.ok(result.run.relationshipSignalsJson.length>=1);
  assert.ok(result.run.projectSignalsJson.length>=1);
  assert.ok(result.run.teachValCandidatesJson.length>=1);
  assert.ok(result.run.readyForYouCandidatesJson.length>=1);
  assert.equal(result.run.approvalPoliciesJson.some(p=>/Teach VAL/.test(p.reason)||/auto-committed/.test(p.reason)),true);
  assert.equal(store.transcriptIntelligenceItems.some(i=>i.category==='contextual_task'),true);
});

test('if nothing changed, transcript intake says so',async()=>{
  let store={};
  const service=createValTranscriptIntelligenceService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    tenantId:()=>'tenant',
    userId:()=>'user',
    getTranscript:async()=>({id:'tr_none',title:'Quiet note',rawText:'Speaker: We chatted generally about the weather and said hello. Speaker: Nothing needs to happen next from this conversation.'}),
    resolveMeetingContext:async()=>({meeting:{id:'cal_none',attendees:[]},openLoops:[],errors:[]})
  });
  const result=await service.intake({transcriptId:'tr_none'});
  assert.equal(result.no_action_needed.value,true);
  assert.match(result.no_action_needed.reason,/No commitments/);
});

test('transcript follow-up candidates feed Ready For You only as review work',async()=>{
  let transcriptStore={};
  const transcriptService=createValTranscriptIntelligenceService({
    hasPg:()=>false,
    getStore:()=>transcriptStore,
    saveStore:s=>{transcriptStore=s;},
    tenantId:()=>'tenant',
    userId:()=>'user',
    getTranscript:async()=>({id:'tr_ready',title:'Ready transcript',rawText:'Jessa: I will send the proposal today. Client: Thank you, I will review it tomorrow.'}),
    resolveMeetingContext:async()=>({meeting:{id:'cal_ready',attendees:[{name:'Client',email:'client@example.com'}]},relationshipContext:{attendees:[{name:'Client',email:'client@example.com'}]},openLoops:[],errors:[]})
  });
  await transcriptService.intake({transcriptId:'tr_ready'});
  let readyStore={readyForYouItems:[]};
  const ready=createValReadyForYouService({
    hasPg:()=>false,
    getStore:()=>readyStore,
    saveStore:s=>{readyStore=s;},
    tenantId:()=>'tenant',
    userId:()=>'user',
    executiveInboxService:{reviewDrafts:async()=>({drafts:[]}),listReadyForYouDraftCandidates:async()=>[]},
    meetingPrepService:{listReadyForYouCandidates:async()=>[]},
    transcriptIntelligenceService:transcriptService,
    listDrafts:async()=>[]
  });
  const built=await ready.buildQueue();
  assert.equal(built.state,'has_items');
  assert.equal(built.items[0].metadataJson.source,'transcript_intelligence');
  assert.equal(built.items[0].metadataJson.noTaskCreated,true);
  assert.equal(built.items[0].metadataJson.noMemoryCommitted,true);
});

test('transcript intake extracts authenticated executive instructions but not attendee approval',async()=>{
  let store={};
  const service=createValTranscriptIntelligenceService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    tenantId:()=>'tenant',
    userId:()=>'user',
    getTranscript:async()=>({
      id:'tr_instruction',
      title:'Voice instruction',
      rawText:'Jessa: VAL, send email to Aric about the partner workflow.\nClient: VAL, send me the proposal today.',
      source:'voice_session',
      metadata:{authenticatedUserNames:['Jessa'],channel:'voice'}
    }),
    resolveMeetingContext:async()=>({meeting:{id:'cal_instruction',attendees:[]},openLoops:[],errors:[]})
  });
  const result=await service.intake({transcriptId:'tr_instruction'});
  const instructions=result.run.executiveInstructionsJson;
  assert.equal(instructions.length,2);
  assert.equal(instructions.find(i=>i.instruction.includes('Aric')).authorization,'voice_authorized');
  assert.equal(instructions.find(i=>i.instruction.includes('proposal')).authorization,'approval_required');
  assert.equal(store.transcriptIntelligenceItems.some(i=>i.category==='executive_instruction'&&i.approvalPolicy==='voice_authorized'),true);
});

test('transcript intelligence prepares proposals pages invites and introductions for review',async()=>{
  let store={};
  const service=createValTranscriptIntelligenceService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    tenantId:()=>'tenant',
    userId:()=>'user',
    getTranscript:async()=>({
      id:'tr_prepared_work',
      title:'Client wants VAL work prepared',
      rawText:[
        'Jessa: VAL, prepare the proposal for Acme.',
        'Jessa: VAL, build an HTML landing page for the workshop.',
        'Jessa: VAL, set that appointment with Greg next week.',
        'Jessa: VAL, make that introduction to Lindsey.'
      ].join('\n'),
      source:'voice_session',
      metadata:{authenticatedUserNames:['Jessa'],channel:'voice'}
    }),
    resolveMeetingContext:async()=>({meeting:{id:'cal_prepared',attendees:[{name:'Greg',email:'greg@example.com'},{name:'Lindsey',email:'lindsey@example.com'}]},relationshipContext:{attendees:[{name:'Greg',email:'greg@example.com'},{name:'Lindsey',email:'lindsey@example.com'}]},openLoops:[],errors:[]})
  });
  const result=await service.intake({transcriptId:'tr_prepared_work'});
  const prepared=result.run.readyForYouCandidatesJson.filter(c=>c.category==='prepared_work');
  const kinds=prepared.map(c=>c.prepared_artifact.kind).sort();
  assert.deepEqual(kinds,['calendar_invite_draft','html_page_draft','introduction_email_draft','proposal_draft']);
  assert.equal(result.run.finalJson.counts.prepared_work_candidates,4);
  assert.ok(prepared.every(c=>c.requires_approval));
  assert.ok(prepared.every(c=>c.what_val_did.includes('Nothing was sent')));
  assert.equal(prepared.find(c=>c.prepared_artifact.kind==='introduction_email_draft').prepared_artifact.relationship_match_required,true);
  assert.equal(prepared.find(c=>c.prepared_artifact.kind==='html_page_draft').prepared_artifact.externalPublish,false);
  assert.equal(prepared.find(c=>c.prepared_artifact.kind==='calendar_invite_draft').prepared_artifact.externalCalendarWrite,false);
});

test('transcript intelligence classifies autonomous execution levels and creates continuation tasks',async()=>{
  let store={};
  const savedTasks=[];
  const service=createValTranscriptIntelligenceService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    tenantId:()=>'tenant',
    userId:()=>'user',
    getTranscript:async()=>({
      id:'tr_exec_levels',
      title:'D3Day execution meeting',
      rawText:[
        'Jessa: VAL, build two HTML pages for the D3Day website.',
        'Jessa: VAL, draft the agreement for Doug.',
        'Jessa: VAL, send the final pricing to Doug.'
      ].join('\n'),
      source:'voice_session',
      metadata:{authenticatedUserNames:['Jessa'],channel:'voice'}
    }),
    resolveMeetingContext:async()=>({meeting:{id:'cal_exec',attendees:[{name:'Doug',email:'doug@example.com'}]},relationshipContext:{attendees:[{name:'Doug',email:'doug@example.com'}]},openLoops:[],errors:[]}),
    createContinuationTask:async(task)=>{savedTasks.push(task);return {ok:true,task,no_external_action:true};}
  });
  const result=await service.intake({transcriptId:'tr_exec_levels'});
  const prepared=result.run.readyForYouCandidatesJson.filter(c=>c.category==='prepared_work');
  const page=prepared.find(c=>c.prepared_artifact.kind==='html_page_draft');
  const agreement=prepared.find(c=>c.prepared_artifact.kind==='agreement_draft');
  assert.equal(page.execution_level,'level_3_autonomous_build');
  assert.equal(agreement.execution_level,'level_2_autonomous_draft');
  assert.equal(page.completion_status,'partial_needs_context');
  assert.ok(page.remaining_context_needed.some(x=>/repository|destination path|publish target/i.test(x)));
  assert.ok(page.linked_context.project.needs_creation);
  assert.ok(result.run.contextualTasksJson.some(t=>t.prepared_work_ids.includes(page.id)));
  assert.ok(result.run.contextualTasksJson.some(t=>t.linked_context?.project?.name));
  assert.equal(result.run.finalJson.counts.execution_continuation_tasks,prepared.length);
  assert.equal(result.run.finalJson.counts.persisted_continuation_tasks,prepared.length);
  assert.ok(savedTasks.some(t=>t.source==='transcript_prepared_work'&&t.noExternalAction===true));
  assert.ok(savedTasks.some(t=>/Context needed to finish/.test(t.notes)));
  const savedTaskItem=store.transcriptIntelligenceItems.find(i=>i.category==='contextual_task'&&i.metadataJson.executionLevel==='level_3_autonomous_build');
  assert.ok(savedTaskItem);
  assert.ok(savedTaskItem.linkTargetsJson.some(t=>t.type==='project'));
  assert.ok(savedTaskItem.linkTargetsJson.some(t=>t.type==='task'));
});

test('transcript intelligence suggests CRM-safe relationship introductions from transcript context',async()=>{
  let store={};
  const service=createValTranscriptIntelligenceService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    tenantId:()=>'tenant',
    userId:()=>'user',
    getTranscript:async()=>({
      id:'tr_intro_match',
      title:'Aric partner conversation',
      rawText:'Aric: We need mission aligned organizations and strategic partnership paths. Jessa: That makes sense. I am thinking about who should know you.',
      metadata:{calendarEventId:'cal_intro'}
    }),
    resolveMeetingContext:async()=>({meeting:{id:'cal_intro',attendees:[{name:'Aric Soyring',email:'aric@example.com',contactId:'crm_aric'}]},relationshipContext:{attendees:[{name:'Aric Soyring',email:'aric@example.com',contactId:'crm_aric'}]},openLoops:[],errors:[]}),
    resolveIdentity:async()=>({crm_contact_id:'crm_aric',match_status:'matched',match_confidence:0.92}),
    listRelationshipContacts:async()=>[
      {contactId:'crm_greg',name:'Greg Niesen',email:'greg@example.com',needs:['strategic partnership'],offers:['mission aligned organizations']},
      {name:'Unresolved Person',needs:['strategic partnership']}
    ]
  });
  const result=await service.intake({transcriptId:'tr_intro_match'});
  const intro=result.run.readyForYouCandidatesJson.find(c=>c.type==='relationship_introduction_candidate');
  assert.ok(intro);
  assert.equal(intro.prepared_artifact.kind,'introduction_email_draft');
  assert.equal(intro.prepared_artifact.recipients[0].contactId,'crm_aric');
  assert.equal(intro.prepared_artifact.recipients[1].contactId,'crm_greg');
  assert.equal(intro.requires_approval,true);
  assert.equal(intro.prepared_artifact.externalSend,false);
});

test('transcript introduction matching stays quiet without resolved current CRM identity',()=>{
  const candidates=introCandidatesFromMatches({
    record:{id:'tr_unresolved'},
    linkage:{linked_people:[{name:'Visitor',email:'visitor@example.com'}],linked_crm_records:[]},
    crmContacts:[{contactId:'crm_greg',name:'Greg',needs:['strategic partnership']}],
    evidenceRefs:[]
  });
  assert.deepEqual(candidates,[]);
});
