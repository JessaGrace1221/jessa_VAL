const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {VAL_REVIEW_UPDATES_SQL}=require('../services/valReviewUpdatesSchema');
const {createValReviewUpdatesService,approvalPolicyFor,sensitivityOf,relationshipTemperatureCorrectionCandidate,projectSourceInterpretationCandidate,transcriptProposalReviewCandidate}=require('../services/valReviewUpdates');

const root=path.join(__dirname,'..');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
const routes=fs.readFileSync(path.join(root,'services','valReviewUpdatesRoutes.js'),'utf8');

test('review updates schema creates queue and audit tables',()=>{
  for(const table of ['val_review_updates','val_review_update_audit']){
    assert.match(VAL_REVIEW_UPDATES_SQL,new RegExp(`create table if not exists ${table}`));
  }
  for(const field of ['approval_policy','sensitivity','source_refs_json','evidence_refs_json','external_action_taken']){
    assert.match(VAL_REVIEW_UPDATES_SQL,new RegExp(field));
  }
});

test('review update routes are backend-only and mounted',()=>{
  assert.match(server,/registerValReviewUpdatesRoutes/);
  assert.match(server,/ensureValReviewUpdatesTables/);
  assert.match(routes,/\/api\/val\/review-updates/);
  assert.match(routes,/\/api\/val\/review-updates\/build/);
  assert.match(routes,/\/api\/val\/review-updates\/relationship-temperature/);
  assert.match(routes,/\/api\/val\/review-updates\/project-source/);
  assert.match(routes,/\/api\/val\/review-updates\/transcript-proposal/);
  assert.match(routes,/\/api\/val\/review-updates\/:id\/approve/);
  assert.match(routes,/\/api\/val\/review-updates\/:id\/reject/);
  assert.match(routes,/\/api\/val\/review-updates\/:id\/edit/);
});

test('transcript proposal creates an approval-required review update without creating notes or tasks',async()=>{
  let store={};
  const service=createValReviewUpdatesService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    tenantId:()=>'tenant',
    userId:()=>'user',
    uuid:prefix=>`${prefix}_test`
  });
  const result=await service.createTranscriptProposalReview({
    id:'real-d3day-task-social-copy',
    type:'task',
    transcriptId:'chat_about_d3day_event_transcript.txt',
    transcriptTitle:'D3Day event transcript',
    eventTitle:'D3Day planning conversation',
    project:'D3Day',
    relationships:['Jessa','Doug'],
    title:'Draft social post ideas for review',
    sourceExcerpt:'I can have my AI work up some post ideas for you, and I can email them over.',
    whyItMatters:'This is a clear follow-through candidate, but it must stay review-only until approved.',
    owner:'Jessa',
    dueDate:'Needs review',
    acceptedMatches:[
      {category:'event',id:'cal_d3day',label:'D3Day planning call',confidence:0.7,reason:'Calendar title overlaps with transcript.'},
      {category:'relationships',id:'rel_doug',label:'Doug',confidence:0.74,reason:'Stored relationship profile overlaps with transcript.'},
      {category:'project',id:'project_d3day',label:'D3Day',confidence:0.69,reason:'Stored project profile overlaps with transcript.'}
    ]
  });
  assert.equal(result.ok,true);
  assert.equal(result.no_external_action,true);
  assert.equal(result.update.targetType,'transcript_task_proposal');
  assert.equal(result.update.updateType,'review_transcript_note_task');
  assert.equal(result.update.approvalPolicy,'approval_required');
  assert.equal(result.update.proposedValueJson.noExternalAction,true);
  assert.equal(result.update.proposedValueJson.acceptedMatches.length,3);
  assert.equal(result.update.metadataJson.acceptedMatches.length,3);
  assert.ok(result.update.evidenceRefsJson.some(ref=>ref.source_type==='timeline_local_event_match'));
  assert.ok(result.update.evidenceRefsJson.some(ref=>ref.source_type==='timeline_local_relationships_match'));
  assert.ok(result.update.evidenceRefsJson.some(ref=>ref.source_type==='timeline_local_project_match'));
  assert.match(result.update.proposedValueJson.boundary,/does not create a note, create a task/);
  assert.ok(result.update.evidenceRefsJson.length);
  assert.equal(store.crmTaskCandidates?.length||0,0);
  assert.equal(store.teachValMemoryItems?.length||0,0);
});

test('approving transcript proposal records only a local review decision',async()=>{
  let store={};
  const service=createValReviewUpdatesService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    tenantId:()=>'tenant',
    userId:()=>'user',
    uuid:prefix=>`${prefix}_test`
  });
  const result=await service.createTranscriptProposalReview({
    id:'real-d3day-note-positioning',
    type:'note',
    transcriptId:'chat_about_d3day_event_transcript.txt',
    transcriptTitle:'D3Day event transcript',
    eventTitle:'D3Day planning conversation',
    project:'D3Day',
    relationships:['Jessa','Doug'],
    title:'Protect D3Day positioning',
    sourceExcerpt:"So because again, we don't want the people to free wine, free food. Sure, that's not what we're looking",
    whyItMatters:'This preserves the event positioning without turning it into a generic note.'
  });
  const approved=await service.approve(result.update.id,{note:'approved from Timeline'});
  assert.equal(approved.status,'approved');
  assert.equal(approved.metadataJson.subtype,'transcript_note_task_review');
  assert.equal(approved.metadataJson.externalActionTaken,false);
  assert.equal(store.transcriptReviewDecisions.length,1);
  assert.equal(store.transcriptReviewDecisions[0].doesNotCreateNote,true);
  assert.equal(store.transcriptReviewDecisions[0].doesNotCreateTask,true);
  assert.equal(store.transcriptReviewDecisions[0].doesNotSaveDurableMemory,true);
  assert.equal(store.teachValMemoryItems.length,0);
  assert.equal(store.crmNoteCandidates.length,0);
  assert.equal(store.crmTaskCandidates.length,0);
  assert.equal(store.valReviewUpdateAudit[0].externalActionTaken,false);
});

test('transcript proposal candidates require transcript identity and source excerpt',()=>{
  assert.throws(()=>transcriptProposalReviewCandidate({sourceExcerpt:'quote'},()=>'',{tenantId:'tenant',userId:'user'}),/transcriptId/);
  assert.throws(()=>transcriptProposalReviewCandidate({transcriptId:'tr_1'},()=>'',{tenantId:'tenant',userId:'user'}),/source excerpt/);
});

test('project source context creates an approval-required interpretation review update',async()=>{
  let store={};
  const service=createValReviewUpdatesService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    tenantId:()=>'tenant',
    userId:()=>'user',
    uuid:prefix=>`${prefix}_test`
  });
  const result=await service.createProjectSourceInterpretation({
    projectId:'healthbridge-expansion',
    projectName:'HealthBridge Expansion',
    sourceType:'hearth_project_source_upload',
    sourceId:'doc_1',
    sourceTitle:'HealthBridge contract.txt',
    summary:'The contract mentions renewal support load and expansion timing.'
  });
  assert.equal(result.ok,true);
  assert.equal(result.no_external_action,true);
  assert.equal(result.update.targetType,'project_source_interpretation');
  assert.equal(result.update.updateType,'review_project_source_context');
  assert.equal(result.update.approvalPolicy,'approval_required');
  assert.equal(result.update.proposedValueJson.projectId,'healthbridge-expansion');
  assert.match(result.update.proposedValueJson.boundary,/does not create tasks/);
  assert.ok(result.update.evidenceRefsJson.length);
});

test('approving project source interpretation stores local learning without project actions',async()=>{
  let store={};
  const service=createValReviewUpdatesService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    tenantId:()=>'tenant',
    userId:()=>'user',
    uuid:prefix=>`${prefix}_test`
  });
  const result=await service.createProjectSourceInterpretation({
    projectId:'atlas-operations-pilot',
    projectName:'Atlas Operations Pilot',
    sourceType:'project_chat_context',
    sourceId:'chat_1',
    sourceTitle:'Co-Work with VAL',
    summary:'Marcus needs procurement owner clarified before the pilot moves.'
  });
  const approved=await service.approve(result.update.id,{note:'safe to learn locally'});
  assert.equal(approved.status,'approved');
  assert.equal(store.teachValMemoryItems.length,1);
  assert.equal(store.teachValMemoryItems[0].category,'project_source_interpretation');
  assert.equal(store.teachValMemoryItems[0].dataJson.doesNotChangeProjectJudgment,true);
  assert.equal(store.teachValMemoryItems[0].dataJson.doesNotCreateTasks,true);
  assert.equal(store.teachValMemoryItems[0].dataJson.doesNotUpdateRelationships,true);
  assert.equal(store.relationshipProfiles?.length||0,0);
  assert.equal(store.crmTaskCandidates?.length||0,0);
  assert.equal(store.valReviewUpdateAudit[0].externalActionTaken,false);
});

test('project source interpretation candidates require project identity and source context',()=>{
  assert.throws(()=>projectSourceInterpretationCandidate({summary:'Source without project'},()=>'',{tenantId:'tenant',userId:'user'}),/projectId/);
  assert.throws(()=>projectSourceInterpretationCandidate({projectId:'p'},()=>'',{tenantId:'tenant',userId:'user'}),/source context/);
});

test('relationship temperature teaching creates a dedicated review update subtype',async()=>{
  let store={};
  const service=createValReviewUpdatesService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    tenantId:()=>'tenant',
    userId:()=>'user',
    uuid:prefix=>`${prefix}_test`
  });
  const result=await service.createRelationshipTemperatureCorrection({
    correction:'Elena is warmer than VAL thinks because the referral thread is active and reciprocal.',
    relationship:{name:'Elena Brooks',targetId:'rel_elena',temperature:'Strategic',relationshipState:'strategic'},
    temperatureConflict:{selectedState:'strategic',challengerState:'needs_attention',reason:'Needs-attention evidence also exists.'},
    temperatureEvidence:[{observer:'crm',summary:'Referral offer is fresh.',weight:0.7}]
  });
  assert.equal(result.ok,true);
  assert.equal(result.no_external_action,true);
  assert.equal(result.update.targetType,'relationship_profile');
  assert.equal(result.update.updateType,'relationship_temperature_correction');
  assert.equal(result.update.approvalPolicy,'approval_required');
  assert.equal(result.update.metadataJson.subtype,'relationship_temperature_correction');
  assert.ok(result.update.evidenceRefsJson.length >= 2);
  assert.match(result.update.summary,/Current temperature: Strategic/);
  assert.equal(store.valReviewUpdates.length,1);
});

test('approving relationship temperature correction stores local learning without changing relationship state',async()=>{
  let store={};
  const service=createValReviewUpdatesService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    tenantId:()=>'tenant',
    userId:()=>'user',
    uuid:prefix=>`${prefix}_test`
  });
  const result=await service.createRelationshipTemperatureCorrection({
    correction:'Elena is warmer than VAL thinks because the referral thread is active and reciprocal.',
    relationship:{name:'Elena Brooks',targetId:'rel_elena',temperature:'Strategic',relationshipState:'strategic'},
    temperatureEvidence:[{observer:'crm',summary:'Referral offer is fresh.',weight:0.7}]
  });
  const approved=await service.approve(result.update.id,{note:'temperature correction is right'});
  assert.equal(approved.status,'approved');
  assert.equal(store.teachValMemoryItems.length,1);
  assert.equal(store.relationshipProfiles.length,0);
  assert.equal(store.teachValMemoryItems[0].category,'relationship_temperature_correction');
  assert.equal(store.teachValMemoryItems[0].source,'review_update');
  assert.equal(store.teachValMemoryItems[0].dataJson.doesNotDirectlyChangeTemperature,true);
  assert.equal(store.teachValMemoryItems[0].dataJson.reviewUpdateId,result.update.id);
  assert.equal(store.valReviewUpdateAudit[0].externalActionTaken,false);
});

test('rejecting relationship temperature correction leaves memory untouched and audits the decision',async()=>{
  let store={};
  const service=createValReviewUpdatesService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    tenantId:()=>'tenant',
    userId:()=>'user',
    uuid:prefix=>`${prefix}_test`
  });
  const result=await service.createRelationshipTemperatureCorrection({
    correction:'Elena is cooler than VAL thinks.',
    relationship:{name:'Elena Brooks',targetId:'rel_elena',temperature:'Strategic'},
    temperatureEvidence:[{observer:'user',summary:'Manual correction for review.',weight:0.9}]
  });
  const rejected=await service.reject(result.update.id,{reason:'not enough context'});
  assert.equal(rejected.status,'rejected');
  assert.equal(store.teachValMemoryItems.length,0);
  assert.equal(store.relationshipProfiles.length,0);
  assert.equal(store.valReviewUpdateAudit[0].action,'rejected');
  assert.equal(store.valReviewUpdateAudit[0].externalActionTaken,false);
});

test('relationship temperature correction candidates require teaching text',()=>{
  assert.throws(()=>relationshipTemperatureCorrectionCandidate({relationship:{name:'Elena'}},()=>'',{tenantId:'tenant',userId:'user'}),/correction is required/);
});

test('sensitive context cannot be auto safe',()=>{
  assert.equal(sensitivityOf('This includes trauma therapy context'),'sensitive');
  assert.equal(approvalPolicyFor('This includes trauma therapy context','auto_safe'),'never_auto');
  assert.equal(approvalPolicyFor('Normal preference','auto_safe'),'auto_safe');
});

test('builds review updates from intelligence sources with evidence refs',async()=>{
  let store={
    transcriptIntelligenceItems:[
      {
        id:'item_rel',
        tenantId:'tenant',
        userId:'user',
        transcriptId:'tr_1',
        category:'relationship_signal',
        itemType:'relationship_signal',
        title:'Aric trust signal',
        summary:'Aric is waiting on the partner workflow.',
        sourceQuote:'Aric is waiting on the partner workflow.',
        sourceRefsJson:[{source_type:'transcript',source_id:'tr_1',quote_or_summary:'Aric is waiting',confidence:0.8}],
        confidence:0.8
      },
      {
        id:'item_teach',
        tenantId:'tenant',
        userId:'user',
        transcriptId:'tr_1',
        category:'teach_val_candidate',
        itemType:'teach_val_candidate',
        title:'Direct language preference',
        summary:'Jessa prefers direct language and does not want corporate filler.',
        sourceQuote:'I prefer direct language.',
        sourceRefsJson:[{source_type:'transcript',source_id:'tr_1',quote_or_summary:'I prefer direct language',confidence:0.75}],
        confidence:0.75
      }
    ],
    conversationClassifications:[
      {id:'class_1',conversationId:'uc_1',executiveMeaning:'protect_trust',priorityLevel:'high',whyNow:'Trust is waiting.',ifIgnored:'Trust may cool.',approvalPolicy:'approval_required',sourceRefs:[{source_type:'email_thread',source_id:'uc_1',quote_or_summary:'Waiting on reply',confidence:0.7}],confidence:0.7}
    ],
    meetingPrepBriefs:[
      {id:'prep_1',calendarEventId:'cal_1',briefJson:{meeting_title:'Intro Call',concise_brief:'This meeting could create a useful introduction.'},sourceRefsJson:[{source_type:'calendar_event',source_id:'cal_1',quote_or_summary:'Intro Call',confidence:0.7}],confidence:0.68}
    ],
    readyForYouItems:[],
    emailDraftEvaluations:[],
    evidenceObservations:[],
    memoryItems:[
      {id:'mem_project',kind:'project_chat_context',summary:'Project Co-Work: HealthBridge Expansion',rawText:'Project chat context for renewal support.',metadata:{source:'hearth_cowork',projectId:'healthbridge-expansion',projectName:'HealthBridge Expansion'},createdAt:new Date().toISOString()}
    ],
    evidenceLinks:[
      {id:'link_project_meeting',sourceType:'calendar_event',sourceId:'cal_project',sourceLabel:'Renewal Review',targetType:'project_profile',targetId:'healthbridge-expansion',relationship:'meeting_context_for_project',summary:'Renewal Review is meeting context for HealthBridge Expansion.',confidence:0.66,metadata:{source:'test',projectName:'HealthBridge Expansion'}}
    ]
  };
  const service=createValReviewUpdatesService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    tenantId:()=>'tenant',
    userId:()=>'user',
    uuid:prefix=>`${prefix}_test_${Math.random().toString(36).slice(2,6)}`
  });
  const built=await service.build();
  assert.equal(built.ok,true);
  assert.ok(built.count>=4);
  assert.ok(built.updates.every(u=>u.approvalPolicy));
  assert.ok(built.updates.filter(u=>/relationship|project|crm|teach_val|priority|rule/i.test(u.targetType)).every(u=>u.evidenceRefsJson.length));
  assert.ok(built.updates.some(u=>u.updateType==='review_project_source_context'));
});

test('approved updates write only local VAL stores and audit the decision',async()=>{
  let store={
    transcriptIntelligenceItems:[
      {
        id:'item_rel',
        tenantId:'tenant',
        userId:'user',
        transcriptId:'tr_2',
        category:'relationship_signal',
        itemType:'relationship_signal',
        title:'Relationship signal',
        summary:'A relationship signal worth preserving.',
        sourceQuote:'A relationship signal worth preserving.',
        sourceRefsJson:[{source_type:'transcript',source_id:'tr_2',quote_or_summary:'signal',confidence:0.8}],
        confidence:0.8
      }
    ]
  };
  const service=createValReviewUpdatesService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    tenantId:()=>'tenant',
    userId:()=>'user',
    uuid:prefix=>`${prefix}_test_${Math.random().toString(36).slice(2,6)}`
  });
  const built=await service.build();
  const approved=await service.approve(built.updates[0].id,{note:'confirmed'});
  assert.equal(approved.status,'approved');
  assert.ok(approved.appliedTargetId);
  assert.equal(store.relationshipProfiles.length,1);
  assert.equal(store.valReviewUpdateAudit[0].action,'approved');
  assert.equal(store.valReviewUpdateAudit[0].externalActionTaken,false);
});

test('Teach VAL approval creates local memory with provenance and no overwrite',async()=>{
  let store={
    transcriptIntelligenceItems:[
      {
        id:'item_teach',
        tenantId:'tenant',
        userId:'user',
        transcriptId:'tr_3',
        category:'teach_val_candidate',
        itemType:'teach_val_candidate',
        title:'Voice preference',
        summary:'Use plain language.',
        sourceQuote:'Use plain language.',
        sourceRefsJson:[{source_type:'transcript',source_id:'tr_3',quote_or_summary:'Use plain language',confidence:0.75}],
        confidence:0.75
      }
    ]
  };
  const service=createValReviewUpdatesService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    tenantId:()=>'tenant',
    userId:()=>'user',
    uuid:prefix=>`${prefix}_test_${Math.random().toString(36).slice(2,6)}`
  });
  const built=await service.build();
  const teach=built.updates.find(u=>u.targetType==='teach_val_memory');
  const approved=await service.approve(teach.id,{note:'yes'});
  assert.equal(approved.status,'approved');
  assert.equal(store.teachValMemoryItems.length,1);
  assert.equal(store.teachValMemoryItems[0].source,'review_update');
  assert.equal(store.teachValMemoryItems[0].dataJson.reviewUpdateId,teach.id);
});

test('edit and reject update local state and audit trail only',async()=>{
  let store={valReviewUpdates:[{id:'upd_1',tenantId:'tenant',userId:'user',status:'pending',targetType:'crm_note_candidate',targetKey:'cal_1',updateType:'create_local_crm_note_candidate',title:'Old',summary:'Old summary',proposedValueJson:{note:'Old'},sourceRefsJson:[{source_type:'meeting_prep',source_id:'prep_1',quote_or_summary:'Old',confidence:0.7}],evidenceRefsJson:[{source_type:'meeting_prep',source_id:'prep_1',quote_or_summary:'Old',confidence:0.7}],approvalPolicy:'approval_required',sensitivity:'normal',confidence:0.7,requiresApproval:true,metadataJson:{},createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}]};
  const service=createValReviewUpdatesService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    tenantId:()=>'tenant',
    userId:()=>'user',
    uuid:prefix=>`${prefix}_test`
  });
  const edited=await service.edit('upd_1',{title:'New',summary:'New factual note',proposedValueJson:{note:'New factual note'},note:'tightened'});
  assert.equal(edited.title,'New');
  const rejected=await service.reject('upd_1',{reason:'not useful'});
  assert.equal(rejected.status,'rejected');
  assert.equal(store.valReviewUpdateAudit.length,2);
  assert.ok(store.valReviewUpdateAudit.every(a=>a.externalActionTaken===false));
});
