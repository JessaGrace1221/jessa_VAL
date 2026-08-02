const test=require('node:test');
const assert=require('node:assert/strict');

const {VAL_CANONICAL_WORK_SQL}=require('../services/valCanonicalWorkSchema');
const {createValCanonicalWorkService}=require('../services/valCanonicalWork');

function harness(overrides={}){
  const store={valWorkItems:[],valWorkItemEvents:[]};
  let sequence=0;
  const boardEvents=[];
  const service=createValCanonicalWorkService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:()=>{},
    tenantId:()=>'tenant',
    userId:()=>'user',
    uuid:prefix=>`${prefix}_${++sequence}`,
    afterWorkItemEvent:async value=>boardEvents.push(value),
    ...overrides
  });
  return {store,service,boardEvents};
}

function grounded(overrides={}){
  return {
    sourceProcessingRecordId:'source_record_1',
    sourceType:'transcript',
    sourceId:'transcript_1',
    workType:'commitment',
    ownership:'user',
    ownerName:'Jessa',
    actionText:'Finish',
    objectText:'the GOALL dashboard handoff',
    outcomeText:'Mike has the completed dashboard',
    title:'Finish the GOALL dashboard handoff',
    exactSourceQuote:'Jessa will finish the GOALL dashboard handoff for Mike.',
    sourceRefs:[{sourceType:'transcript',sourceId:'transcript_1',quoteOrSummary:'Jessa will finish the GOALL dashboard handoff for Mike.',confidence:0.98}],
    projectId:'project_goall',
    projectName:'GOALL',
    confidence:0.98,
    ...overrides
  };
}

test('canonical work schema stores work lineage and append-only events',()=>{
  for(const table of ['val_work_items','val_work_item_events'])assert.match(VAL_CANONICAL_WORK_SQL,new RegExp(`create table if not exists ${table}`));
  for(const field of ['source_processing_record_id','source_fingerprint','work_fingerprint','ownership','admission_status','lifecycle_status','observer_receipts_json','chief_recommendation_id','prepared_artifact_ids_json'])assert.match(VAL_CANONICAL_WORK_SQL,new RegExp(field));
});

test('Postgres canonical work serializes JSON and never reports an unsaved row as durable',async()=>{
  const calls=[];
  const service=createValCanonicalWorkService({
    hasPg:()=>true,
    tenantId:()=>'tenant',
    userId:()=>'user',
    uuid:prefix=>`${prefix}_1`,
    dbQuery:async(sql,params=[])=>{
      calls.push({sql,params});
      if(/^select \* from val_work_items/i.test(sql))return {rows:[]};
      if(/^insert into val_work_items/i.test(sql)){
        const row=grounded();
        return {rows:[{
          id:'work_1',
          tenant_id:'tenant',
          user_id:'user',
          source_processing_record_id:row.sourceProcessingRecordId,
          source_type:row.sourceType,
          source_id:row.sourceId,
          source_fingerprint:'source_fingerprint',
          work_fingerprint:'work_fingerprint',
          work_type:row.workType,
          ownership:row.ownership,
          owner_name:row.ownerName,
          action_text:row.actionText,
          object_text:row.objectText,
          outcome_text:row.outcomeText,
          title:row.title,
          exact_source_quote:row.exactSourceQuote,
          source_refs_json:params[18],
          envelope_json:params[19],
          admission_status:'admitted',
          lifecycle_status:'open',
          due_basis_json:params[27],
          observer_receipts_json:params[30],
          prepared_artifact_ids_json:params[34],
          metadata_json:params[35],
          created_at:'2026-07-25T12:00:00.000Z',
          updated_at:'2026-07-25T12:00:00.000Z'
        }]};
      }
      if(/^insert into val_work_item_events/i.test(sql)){
        return {rows:[{
          id:'workevt_1',
          tenant_id:'tenant',
          user_id:'user',
          work_item_id:'work_1',
          event_type:'work_admitted',
          source_refs_json:params[7],
          payload_json:params[8],
          created_at:'2026-07-25T12:00:00.000Z'
        }]};
      }
      return {rows:[]};
    }
  });

  const result=await service.admit(grounded());
  const workInsert=calls.find(call=>/^insert into val_work_items/i.test(call.sql));
  const eventInsert=calls.find(call=>/^insert into val_work_item_events/i.test(call.sql));
  assert.equal(typeof workInsert.params[18],'string');
  assert.equal(typeof workInsert.params[19],'string');
  assert.equal(typeof workInsert.params[27],'string');
  assert.equal(typeof workInsert.params[30],'string');
  assert.equal(typeof workInsert.params[34],'string');
  assert.equal(typeof workInsert.params[35],'string');
  assert.equal(typeof eventInsert.params[7],'string');
  assert.equal(typeof eventInsert.params[8],'string');
  assert.equal(result.workItem.id,'work_1');
  assert.equal(result.workItem.sourceRefsJson.length,1);
});

test('Postgres canonical work throws when the database does not return the inserted row',async()=>{
  const service=createValCanonicalWorkService({
    hasPg:()=>true,
    tenantId:()=>'tenant',
    userId:()=>'user',
    uuid:prefix=>`${prefix}_1`,
    dbQuery:async sql=>/^select \* from val_work_items/i.test(sql)?{rows:[]}:{rows:[]}
  });
  await assert.rejects(service.admit(grounded()),/was not persisted/);
});

test('grounded user work is admitted with project-first envelope and no invented due date',async()=>{
  const {service}=harness();
  const result=await service.admit(grounded());
  assert.equal(result.workItem.admissionStatus,'admitted');
  assert.equal(result.workItem.lifecycleStatus,'open');
  assert.equal(result.workItem.envelopeJson.type,'project');
  assert.equal(result.workItem.projectName,'GOALL');
  assert.equal(result.workItem.relationshipName,'');
  assert.equal(result.workItem.dueAt,null);
  assert.equal(result.event.eventType,'work_admitted');
});

test('unknown owner is not admitted as a user task',async()=>{
  const {service}=harness();
  const result=await service.admit(grounded({ownership:'unknown',ownerName:''}));
  assert.equal(result.workItem.ownership,'unknown');
  assert.equal(result.workItem.admissionStatus,'needs_owner');
  assert.notEqual(result.workItem.admissionStatus,'admitted');
});

test('other-owned work waits on the other person',async()=>{
  const {service}=harness();
  const result=await service.admit(grounded({ownership:'other',ownerName:'Mike'}));
  assert.equal(result.workItem.admissionStatus,'waiting_on_other');
  assert.equal(result.workItem.lifecycleStatus,'waiting');
});

test('missing exact evidence remains needs context',async()=>{
  const {service}=harness();
  const result=await service.admit(grounded({exactSourceQuote:'',sourceRefs:[]}));
  assert.equal(result.workItem.admissionStatus,'needs_context');
});

test('reprocessing unchanged work deduplicates and appends reconfirmation event',async()=>{
  const {service,store}=harness();
  const first=await service.admit(grounded());
  const second=await service.admit(grounded({confidence:0.99}));
  assert.equal(first.workItem.id,second.workItem.id);
  assert.equal(second.deduplicated,true);
  assert.equal(store.valWorkItems.length,1);
  assert.deepEqual(store.valWorkItemEvents.map(event=>event.eventType),['work_admitted','evidence_reconfirmed']);
});

test('the same obligation across transcript and email accumulates evidence on one work item',async()=>{
  const {service,store}=harness();
  const transcript=await service.admit(grounded());
  const email=await service.admit(grounded({
    sourceProcessingRecordId:'source_record_2',
    sourceType:'email',
    sourceId:'email_1',
    exactSourceQuote:'I will finish the GOALL dashboard handoff for Mike.',
    sourceRefs:[{sourceType:'email',sourceId:'email_1',quoteOrSummary:'I will finish the GOALL dashboard handoff for Mike.',confidence:0.96}]
  }));
  assert.equal(transcript.workItem.id,email.workItem.id);
  assert.equal(store.valWorkItems.length,1);
  assert.equal(email.workItem.sourceRefsJson.length,2);
  assert.deepEqual(email.workItem.metadataJson.sourceProcessingRecordIds,['source_record_1','source_record_2']);
});

test('completion is append-only and notifies downstream Board delivery',async()=>{
  const {service,store,boardEvents}=harness();
  const admitted=await service.admit(grounded());
  const completed=await service.transition(admitted.workItem.id,{status:'complete',eventType:'user_marked_done',payload:{surface:'home_alignment'}});
  assert.equal(completed.workItem.lifecycleStatus,'complete');
  assert.ok(completed.workItem.completedAt);
  assert.equal(store.valWorkItemEvents.length,2);
  assert.equal(store.valWorkItemEvents[1].eventType,'user_marked_done');
  assert.equal(boardEvents.length,2);
  assert.equal(boardEvents[1].event.newStatus,'complete');
});

test('Tasks projects only admitted open work owned by the user',async()=>{
  const {service}=harness();
  const open=await service.admit(grounded());
  await service.admit(grounded({ownership:'other',ownerName:'Mike',actionText:'Send',objectText:'pipeline numbers',title:'Send pipeline numbers',exactSourceQuote:'Mike will send the pipeline numbers.'}));
  await service.admit(grounded({ownership:'unknown',actionText:'Review',objectText:'the scope',title:'Review the scope',exactSourceQuote:'Someone should review the scope.'}));
  const completed=await service.admit(grounded({actionText:'Confirm',objectText:'the final total',title:'Confirm the final total',exactSourceQuote:'I will confirm the final total.'}));
  await service.transition(completed.workItem.id,{status:'complete',eventType:'user_marked_done'});

  const projection=await service.taskProjection();
  assert.equal(projection.source,'canonical_work_items');
  assert.equal(projection.openCount,1);
  assert.equal(projection.tasks[0].id,open.workItem.id);
  assert.equal(projection.tasks[0].project_name,'GOALL');
  assert.equal(projection.tasks[0].due_at,null);
  assert.equal(projection.tasks[0].canonical_work_item_id,open.workItem.id);
});

test('Tasks include every open transcript Action Item even when its owner still needs confirmation',async()=>{
  const transcriptTask={
    id:'transcript_task_1',
    title:'Send the revised dashboard to Mike',
    evidence_quote:'Jessa will send the revised dashboard to Mike.',
    source_type:'transcript',
    source_id:'transcript_1',
    owner_type:'unknown',
    owner_name:'Owner to confirm',
    status:'open',
    workspace_kind:'transcript_task'
  };
  const {service}=harness({loadTranscriptTasks:async()=>[transcriptTask]});
  const result=await service.taskProjection({limit:100});
  assert.equal(result.tasks.length,1);
  assert.deepEqual(result.tasks[0],transcriptTask);
  assert.equal(result.filters.transcriptActionItems,'all_open');
});

test('Exact transcript Action Items replace conflicting canonical transcript fragments from the same source',async()=>{
  const {service}=harness({
    loadTranscriptTasks:async()=>[{
      id:'transcript_task_1',
      title:'Reach out to Mike to review the projections spreadsheet',
      evidence_quote:'Jessa to reach out to Mike to review the projections spreadsheet.',
      source_type:'transcript',
      source_id:'transcript_1',
      owner_type:'user',
      owner_name:'Jessa',
      status:'open',
      workspace_kind:'transcript_task'
    }]
  });
  await service.admit({
    sourceProcessingRecordId:'source_record_1',
    sourceType:'transcript',
    sourceId:'transcript_1',
    sourceFingerprint:'fingerprint_1',
    title:'connect with you.',
    summary:'A partial speech fragment.',
    exactSourceQuote:'I will connect with you.',
    ownership:'user'
  });
  const result=await service.taskProjection({limit:100});
  assert.equal(result.tasks.length,1);
  assert.equal(result.tasks[0].id,'transcript_task_1');
});

test('Tasks preload the immutable source packet for immediate Co-Work and prepared work',async()=>{
  const rawText=[
    'Mike: The dashboard needs pipeline projections, an owner, and open follow-up.',
    'Jessa: I will build it in HTML and CSS so it can be embedded in the CRM.',
    'Mike: Please make the handoff ready before our weekly check-in.'
  ].join('\n');
  const {service}=harness({
    loadSourceProcessingRecord:async id=>({
      id,
      sourceVersion:3,
      sourceFingerprint:'source_fingerprint_3',
      sourceReceiptJson:{rawText}
    })
  });
  const admitted=await service.admit(grounded({
    exactSourceQuote:'Jessa: I will build it in HTML and CSS so it can be embedded in the CRM.'
  }));
  const projection=await service.taskProjection();
  const task=projection.tasks.find(item=>item.id===admitted.workItem.id);
  assert.ok(task);
  assert.equal(task.working_brief.sourceContext.immutableSourceVersion,3);
  assert.match(task.working_brief.contextLines.join('\n'),/pipeline projections/);
  assert.match(task.source_packet.context_excerpt,/weekly check-in/);
  assert.equal(task.source_packet.canonical_work_item_id,admitted.workItem.id);
  assert.equal(task.source_packet.source_processing_record_id,'source_record_1');
  assert.equal(task.source_packet.source_fingerprint,'source_fingerprint_3');
});

test('a deduplicated obligation preloads every immutable source receipt as one growing packet',async()=>{
  const receipts={
    source_record_1:{
      id:'source_record_1',
      sourceType:'transcript',
      sourceId:'transcript_1',
      sourceTitle:'GOALL dashboard meeting',
      sourceVersion:1,
      sourceFingerprint:'transcript_fingerprint',
      sourceReceiptJson:{rawText:'Mike: The dashboard needs pipeline projections and a named owner.'}
    },
    source_record_2:{
      id:'source_record_2',
      sourceType:'email',
      sourceId:'email_1',
      sourceTitle:'GOALL follow-up',
      sourceVersion:2,
      sourceFingerprint:'email_fingerprint',
      sourceReceiptJson:{rawText:'Mike confirmed by email that the CRM iframe handoff is due before the weekly check-in.'}
    }
  };
  const {service}=harness({loadSourceProcessingRecord:async id=>receipts[id]||null});
  const first=await service.admit(grounded());
  await service.admit(grounded({
    sourceProcessingRecordId:'source_record_2',
    sourceType:'email',
    sourceId:'email_1',
    exactSourceQuote:'I will finish the GOALL dashboard handoff for Mike.',
    sourceRefs:[{sourceType:'email',sourceId:'email_1',quoteOrSummary:'CRM iframe handoff is due before the weekly check-in.',confidence:0.96}]
  }));

  const projection=await service.taskProjection();
  const task=projection.tasks.find(item=>item.id===first.workItem.id);
  assert.equal(task.source_packets.length,2);
  assert.deepEqual(task.working_brief.sourceContext.sourceProcessingRecordIds,['source_record_1','source_record_2']);
  assert.equal(task.working_brief.sourceContext.immutableSourceVersions.length,2);
  assert.match(task.working_brief.contextLines.join('\n'),/pipeline projections/);
  assert.match(task.working_brief.contextLines.join('\n'),/weekly check-in/);
  assert.match(task.source_packet.context_excerpt,/\[Source 1: GOALL dashboard meeting\]/);
  assert.match(task.source_packet.context_excerpt,/\[Source 2: GOALL follow-up\]/);
});

test('prepared work attaches to canonical work once and emits an auditable Board event',async()=>{
  const {service,store,boardEvents}=harness();
  const admitted=await service.admit(grounded());
  const first=await service.attachPreparedArtifact(admitted.workItem.id,{
    artifactId:'ready_work_1',
    sourceRefs:grounded().sourceRefs,
    metadata:{latestPreparedArtifactKind:'html_page_draft'}
  });
  const duplicate=await service.attachPreparedArtifact(admitted.workItem.id,{artifactId:'ready_work_1'});
  assert.equal(first.attached,true);
  assert.equal(duplicate.attached,false);
  assert.deepEqual(first.workItem.preparedArtifactIdsJson,['ready_work_1']);
  assert.equal(first.workItem.metadataJson.latestPreparedArtifactKind,'html_page_draft');
  assert.deepEqual(store.valWorkItemEvents.map(event=>event.eventType),['work_admitted','prepared_artifact_attached']);
  assert.equal(boardEvents.at(-1).event.eventType,'prepared_artifact_attached');
});

test('prepared-work decisions append idempotent canonical work events without completing the work',async()=>{
  const {service,store}=harness();
  const admitted=await service.admit(grounded());
  const input={
    eventType:'prepared_artifact_approved',
    decisionId:'ready_work_1',
    payload:{readyForYouItemId:'ready_work_1',status:'approved',decision:{note:'Looks right.',recorded_at:'2026-07-25T10:00:00.000Z'}},
    sourceRefs:grounded().sourceRefs
  };
  const first=await service.recordDecision(admitted.workItem.id,input);
  const duplicate=await service.recordDecision(admitted.workItem.id,{
    ...input,
    payload:{
      ...input.payload,
      reviewedAt:'2026-07-25T10:30:00.000Z',
      decision:{...input.payload.decision,recorded_at:'2026-07-25T10:30:00.000Z'}
    }
  });
  assert.equal(first.workItem.lifecycleStatus,'open');
  assert.equal(duplicate.workItem.lifecycleStatus,'open');
  assert.equal(first.event.id,duplicate.event.id);
  assert.equal(store.valWorkItemEvents.filter(event=>event.eventType==='prepared_artifact_approved').length,1);
  assert.equal(first.event.payloadJson.readyForYouItemId,'ready_work_1');
});

test('Chief of Staff ordering is persisted on canonical work without creating recursive Board intake',async()=>{
  const {service,store,boardEvents}=harness();
  const admitted=await service.admit(grounded());
  const ordered=await service.recordChiefOrdering(admitted.workItem.id,{
    boardPacketId:'packet_1',
    observerReceipts:[{observer:'Capacity',status:'observed',finding:'This adds load.'}],
    roundTableRunId:'round_1',
    chiefRecommendationId:'chief_1',
    chiefRank:1,
    sourceRefs:grounded().sourceRefs
  });
  const duplicate=await service.recordChiefOrdering(admitted.workItem.id,{
    boardPacketId:'packet_1',
    roundTableRunId:'round_1',
    chiefRecommendationId:'chief_1',
    chiefRank:1
  });
  assert.equal(ordered.recorded,true);
  assert.equal(duplicate.recorded,false);
  assert.equal(ordered.workItem.chiefRank,1);
  assert.equal(ordered.workItem.chiefRecommendationId,'chief_1');
  assert.equal(ordered.workItem.observerReceiptsJson[0].observer,'Capacity');
  assert.deepEqual(store.valWorkItemEvents.map(event=>event.eventType),['work_admitted','chief_ordered']);
  assert.equal(boardEvents.length,1);
});

test('Chief of Staff queue is globally rebalanced across separate intelligence events',async()=>{
  const {service}=harness();
  const first=await service.admit(grounded({
    actionText:'Finish',
    objectText:'the GOALL dashboard',
    title:'Finish the GOALL dashboard',
    exactSourceQuote:'I will finish the GOALL dashboard.'
  }));
  const second=await service.admit(grounded({
    sourceProcessingRecordId:'source_record_2',
    sourceId:'transcript_2',
    actionText:'Confirm',
    objectText:'the HopeMakers contract',
    title:'Confirm the HopeMakers contract',
    exactSourceQuote:'I will confirm the HopeMakers contract.',
    projectId:'project_hopemakers',
    projectName:'HopeMakers'
  }));
  await service.recordChiefOrdering(first.workItem.id,{
    boardPacketId:'packet_goall',
    chiefRecommendationId:'chief_old',
    chiefRank:1,
    chiefScore:7.5
  });
  await service.recordChiefOrdering(second.workItem.id,{
    boardPacketId:'packet_hopemakers',
    chiefRecommendationId:'chief_new',
    chiefRank:1,
    chiefScore:11.2
  });

  const queue=await service.rebalanceChiefQueue();
  assert.deepEqual(queue.workItems.map(item=>item.id),[second.workItem.id,first.workItem.id]);
  assert.deepEqual(queue.workItems.map(item=>item.chiefRank),[1,2]);

  const projection=await service.taskProjection();
  assert.deepEqual(projection.tasks.map(item=>item.id),[second.workItem.id,first.workItem.id]);
  assert.deepEqual(projection.tasks.map(item=>item.chief_rank),[1,2]);
  assert.deepEqual(projection.tasks.map(item=>item.chief_score),[11.2,7.5]);
});

test('completing the first global Chief item exposes the next ranked item',async()=>{
  const {service}=harness();
  const first=await service.admit(grounded());
  const second=await service.admit(grounded({
    sourceProcessingRecordId:'source_record_2',
    sourceId:'email_2',
    sourceType:'email',
    actionText:'Review',
    objectText:'the final scope',
    title:'Review the final scope',
    exactSourceQuote:'I will review the final scope.'
  }));
  await service.recordChiefOrdering(first.workItem.id,{chiefRecommendationId:'chief_1',chiefRank:1,chiefScore:10});
  await service.recordChiefOrdering(second.workItem.id,{chiefRecommendationId:'chief_2',chiefRank:1,chiefScore:8});
  await service.rebalanceChiefQueue();
  await service.transition(first.workItem.id,{status:'complete',eventType:'user_marked_done'});
  const queue=await service.rebalanceChiefQueue();
  assert.equal(queue.workItems.length,1);
  assert.equal(queue.workItems[0].id,second.workItem.id);
  assert.equal(queue.workItems[0].chiefRank,1);
});
