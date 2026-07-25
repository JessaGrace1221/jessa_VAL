const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createValIntelligenceSpine,normalizeSourceRef}=require('../services/valIntelligenceSpine');
const {VAL_INTELLIGENCE_SPINE_SQL}=require('../services/valIntelligenceSpineSchema');

const root=path.join(__dirname,'..');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
const routes=fs.readFileSync(path.join(root,'services','valIntelligenceSpineRoutes.js'),'utf8');

test('VAL Intelligence Spine schema creates durable reasoning tables',()=>{
  for(const table of [
    'event_intelligence_runs',
    'observer_runs',
    'round_table_runs',
    'chief_of_staff_recommendations',
    'momentum_snapshots',
    'ready_for_you_items'
  ]){
    assert.match(VAL_INTELLIGENCE_SPINE_SQL,new RegExp(`create table if not exists ${table}`));
  }
  assert.match(VAL_INTELLIGENCE_SPINE_SQL,/source_refs_json jsonb/);
  assert.match(server,/ensureValIntelligenceSpineTables/);
});

test('VAL Intelligence Spine exposes backend-only API routes',()=>{
  assert.match(server,/registerValIntelligenceSpineRoutes/);
  assert.match(routes,/\/api\/val\/events\/intelligence-pass/);
  assert.match(routes,/\/api\/val\/observers\/runs/);
  assert.match(routes,/\/api\/val\/round-table\/runs/);
  assert.match(routes,/\/api\/val\/chief-of-staff\/recommend/);
  assert.match(routes,/\/api\/val\/chief-of-staff\/:id\/complete/);
});

test('source references normalize to the shared audit structure',()=>{
  const ref=normalizeSourceRef({sourceType:'transcript',sourceId:'tr_1',quoteOrSummary:' Something happened. ',confidence:2});
  assert.equal(ref.source_type,'transcript');
  assert.equal(ref.source_id,'tr_1');
  assert.equal(ref.quote_or_summary,'Something happened.');
  assert.equal(ref.confidence,1);
  assert.ok(ref.created_at);
});

test('in-memory intelligence pass records observers, round table, recommendation, momentum, and unknowns',async()=>{
  let store={
    memoryItems:[{id:'mem_1',kind:'teach_val_project',summary:'Frisson: protect human judgment',rawText:'Frisson is about wisdom, not productivity.'}],
    transcripts:[{id:'tr_1',title:'Frisson call',summary:'Aric is waiting on partner workflow.',createdAt:new Date().toISOString()}],
    drafts:[{id:'draft_1',subject:'Reply to Greg',body:'Draft for review',status:'draft'}],
    tasks:[]
  };
  const spine=createValIntelligenceSpine({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    uuid:prefix=>`${prefix}_${Math.random().toString(36).slice(2,9)}`,
    tenantId:()=>'test-tenant',
    userId:()=>'test-user',
    logger:{log(){},warn(){}},
    loaders:{
      loadTasks:async()=>[{id:'task_1',title:'Finish partner workflow',completed:false,dueDate:new Date(Date.now()-86400000).toISOString()}],
      listTeachValCoreMemory:async()=>[{id:'teach_1',title:'Frisson',summary:'Frisson protects human judgment.'}],
      listRelationshipProfiles:async()=>[
        {id:'rel_1',profileType:'person',displayName:'Aric',summary:'Strategic partner',confidence:0.88,openLoopCount:1},
        {id:'proj_1',profileType:'project',displayName:'Frisson',summary:'Operating philosophy',confidence:0.82}
      ]
    }
  });
  const result=await spine.runIntelligencePass({event:{type:'smoke_test',sourceType:'test'}});
  assert.equal(result.ok,true);
  assert.equal(result.observerRuns.length,14);
  assert.ok(result.observerRuns.some(run=>run.observerName==='Synchronicity'));
  assert.ok(result.observerRuns.some(run=>run.observerName==='Witnessing'));
  assert.ok(result.roundTable.outputJson.synthesis.includes('14 observers'));
  assert.ok(result.roundTable.id);
  assert.ok(result.recommendation.id);
  assert.ok(result.momentumSnapshot.id);
  assert.equal(result.readyForYouItems.length,1);
  assert.ok(result.contextPacket.unknowns.some(u=>/email/i.test(u.source)));
  assert.ok(store.eventIntelligenceRuns.length);
  assert.ok(store.observerRuns.length);
  assert.ok(store.roundTableRuns.length);
  assert.ok(store.chiefOfStaffRecommendations.length);
});

test('every Board observer reviews every live packet through its own lens',async()=>{
  let store={tasks:[]};
  const packet={
    id:'board_packet_michele_email',
    sourceType:'email',
    sourceId:'email_michele_1',
    packetType:'email_attention_packet',
    title:'Michele introduction',
    summary:'Michele may need an introduction email and relationship context.',
    primaryObserversJson:['Executive Inbox','Relationship','Commitment'],
    routeObserversJson:[
      {observerName:'Executive Inbox',primary:true,reason:'Inbox judgment'},
      {observerName:'Relationship',primary:true,reason:'Relationship warmth'},
      {observerName:'Project',primary:false,reason:'Project context'},
      {observerName:'Capacity',primary:false,reason:'Capacity tradeoff'},
      {observerName:'Courage',primary:false,reason:'Courage truth'},
      {observerName:'Delight',primary:false,reason:'Delight signal'},
      {observerName:'Opportunity',primary:false,reason:'Opportunity signal'},
      {observerName:'Momentum',primary:false,reason:'Momentum signal'},
      {observerName:'Meaning',primary:false,reason:'Meaning signal'},
      {observerName:'Synchronicity',primary:false,reason:'Convergence signal'},
      {observerName:'Commitment',primary:true,reason:'Follow-through'},
      {observerName:'Calendar',primary:false,reason:'Timing reality'},
      {observerName:'Environment',primary:false,reason:'Conditions'},
      {observerName:'Witnessing',primary:false,reason:'User revealed context'}
    ],
    sourceRefsJson:[{source_type:'email',source_id:'email_michele_1',quote_or_summary:'Need to email Michele.',confidence:0.8}],
    prototype:false,
    createdAt:new Date().toISOString()
  };
  const spine=createValIntelligenceSpine({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    uuid:prefix=>`${prefix}_test_${Math.random().toString(36).slice(2,7)}`,
    tenantId:()=>'test-tenant',
    userId:()=>'test-user',
    logger:{log(){},warn(){}},
    loaders:{
      listBoardPackets:async()=>[packet],
      loadTasks:async()=>[],
      listTeachValCoreMemory:async()=>[],
      listRelationshipProfiles:async()=>[]
    }
  });
  const result=await spine.runIntelligencePass({event:{type:'board_packet_received',sourceType:'email',sourceId:'email_michele_1',packetIds:[packet.id]}});
  assert.equal(result.observerRuns.length,14);
  for(const run of result.observerRuns){
    const reviews=run.outputJson.packetReviews;
    assert.equal(reviews.length,1,`${run.observerName} should review the packet`);
    assert.equal(reviews[0].packetId,packet.id);
    assert.equal(reviews[0].triggered,true);
    assert.ok(reviews[0].lens);
    assert.ok(reviews[0].seeing.includes(run.observerName));
    assert.ok(reviews[0].question);
  }
  const inboxRun=result.observerRuns.find(run=>run.observerName==='Executive Inbox');
  const delightRun=result.observerRuns.find(run=>run.observerName==='Delight');
  assert.equal(inboxRun.outputJson.packetReviews[0].primary,true);
  assert.equal(delightRun.outputJson.packetReviews[0].primary,false);
  assert.deepEqual(result.roundTable.outputJson.reviewed_packet_ids,[packet.id]);
  assert.equal(result.roundTable.outputJson.observer_packet_review_counts.Delight,1);
});

test('Chief of Staff orders Alignment from the highest evidence packet, not an abstract signal',async()=>{
  let store={tasks:[]};
  const packet={
    id:'board_packet_goall_dashboard',
    sourceType:'transcript',
    sourceId:'tr_goall_mike',
    packetType:'meeting_evidence_packet',
    title:'GOALL dashboard handoff with Mike',
    summary:'Mike needs the GOALL dashboard/projections handoff clarified before Monday.',
    primaryObserversJson:['Project','Momentum','Commitment'],
    routeObserversJson:[],
    sourceRefsJson:[{source_type:'transcript',source_id:'tr_goall_mike',quote_or_summary:'We need the projections/dashboard handoff with Mike cleaned up before Monday.',confidence:0.9}],
    prototype:false,
    createdAt:new Date().toISOString()
  };
  const spine=createValIntelligenceSpine({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    uuid:prefix=>`${prefix}_goall_${Math.random().toString(36).slice(2,7)}`,
    tenantId:()=>'test-tenant',
    userId:()=>'test-user',
    logger:{log(){},warn(){}},
    loaders:{
      listBoardPackets:async()=>[packet],
      loadTasks:async()=>[],
      listTeachValCoreMemory:async()=>[],
      listRelationshipProfiles:async()=>[]
    }
  });
  const result=await spine.runIntelligencePass({event:{type:'board_packet_received',sourceType:'transcript',sourceId:'tr_goall_mike',packetIds:[packet.id]}});
  assert.equal(result.recommendation.title,'Clarify the GOALL dashboard handoff');
  assert.match(result.recommendation.recommendation,/Finish the dashboard\/projections handoff with Mike/);
  assert.match(result.recommendation.why,/Project owns the work/);
  assert.equal(result.recommendation.sourceRefsJson[0].source_id,'tr_goall_mike');
  assert.ok(result.recommendation.nextCandidatesJson.every(candidate=>candidate.title));
});

test('Chief of Staff applies user Witnessing optimization priorities when ordering packets',async()=>{
  let store={tasks:[]};
  const revenuePacket={
    id:'board_packet_revenue_scope',
    sourceType:'email',
    sourceId:'email_scope_1',
    packetType:'email_attention_packet',
    title:'Proposal pricing reply from Michele',
    summary:'Michele asked for the payment structure and proposal scope for the project.',
    primaryObserversJson:['Opportunity'],
    routeObserversJson:[],
    sourceRefsJson:[{source_type:'email',source_id:'email_scope_1',quote_or_summary:'Can you send the payment structure and project proposal?',confidence:0.86}],
    prototype:false,
    createdAt:new Date().toISOString()
  };
  const taskPacket={
    id:'board_packet_generic_tasks',
    sourceType:'task',
    sourceId:'task_many',
    packetType:'task_packet',
    title:'Several transcript tasks extracted',
    summary:'Multiple generic task signals were extracted from a transcript.',
    primaryObserversJson:['Project','Momentum','Commitment'],
    routeObserversJson:[],
    sourceRefsJson:[{source_type:'transcript',source_id:'tr_many',quote_or_summary:'Several action items were discussed.',confidence:0.75}],
    prototype:false,
    createdAt:new Date().toISOString()
  };
  const spine=createValIntelligenceSpine({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    uuid:prefix=>`${prefix}_priority_${Math.random().toString(36).slice(2,7)}`,
    tenantId:()=>'test-tenant',
    userId:()=>'test-user',
    logger:{log(){},warn(){}},
    loaders:{
      listBoardPackets:async()=>[taskPacket,revenuePacket],
      loadTasks:async()=>[],
      listTeachValCoreMemory:async()=>[{
        id:'teach_priority_1',
        category:'witness_chief_priorities',
        title:'Chief of Staff Priorities',
        summary:'Optimize for revenue, capacity, and values first.',
        rawText:'For me personally, optimize for revenue, capacity, and values first.'
      }],
      listRelationshipProfiles:async()=>[]
    }
  });
  const result=await spine.runIntelligencePass({event:{type:'board_packet_received',sourceType:'email',sourceId:'email_scope_1',packetIds:[revenuePacket.id,taskPacket.id]}});
  assert.equal(result.recommendation.sourceRefsJson[0].source_id,'email_scope_1');
  assert.equal(result.recommendation.nextCandidatesJson[0].packetId,taskPacket.id);
  assert.match(JSON.stringify(result.recommendation.anxietyVsMomentumJson),/Revenue/);
  assert.match(JSON.stringify(result.recommendation.anxietyVsMomentumJson),/Chief of Staff Priorities/);
});

test('Chief of Staff completion advances ordered packet queue before closing recommendation',async()=>{
  let store={tasks:[]};
  const firstPacket={
    id:'board_packet_first_priority',
    sourceType:'email',
    sourceId:'email_priority_1',
    packetType:'email_attention_packet',
    title:'Revenue reply needs one clean answer',
    summary:'A client asked for proposal terms and needs a decision.',
    primaryObserversJson:['Opportunity','Commitment'],
    routeObserversJson:[],
    sourceRefsJson:[{source_type:'email',source_id:'email_priority_1',quote_or_summary:'Can you send the proposal terms?',confidence:0.88}],
    prototype:false,
    createdAt:new Date().toISOString()
  };
  const secondPacket={
    id:'board_packet_second_priority',
    sourceType:'transcript',
    sourceId:'tr_priority_2',
    packetType:'meeting_evidence_packet',
    title:'Relationship repair should happen before Monday',
    summary:'A transcript showed tension that should be repaired before the next meeting.',
    primaryObserversJson:['Relationship','Courage'],
    routeObserversJson:[],
    sourceRefsJson:[{source_type:'transcript',source_id:'tr_priority_2',quote_or_summary:'The tone got tense before the call ended.',confidence:0.82}],
    prototype:false,
    createdAt:new Date(Date.now()-1000).toISOString()
  };
  const spine=createValIntelligenceSpine({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    uuid:prefix=>`${prefix}_queue_${Math.random().toString(36).slice(2,7)}`,
    tenantId:()=>'test-tenant',
    userId:()=>'test-user',
    logger:{log(){},warn(){}},
    loaders:{
      listBoardPackets:async()=>[firstPacket,secondPacket],
      loadTasks:async()=>[],
      listTeachValCoreMemory:async()=>[],
      listRelationshipProfiles:async()=>[]
    }
  });
  const result=await spine.runIntelligencePass({event:{type:'board_packet_received',sourceType:'email',sourceId:'email_priority_1',packetIds:[firstPacket.id,secondPacket.id]}});
  const selectedPacketId=result.recommendation.anxietyVsMomentumJson.current_packet.packetId;
  const nextPacketId=result.recommendation.nextCandidatesJson[0].packetId;
  assert.ok([firstPacket.id,secondPacket.id].includes(selectedPacketId));
  assert.ok([firstPacket.id,secondPacket.id].includes(nextPacketId));
  assert.notEqual(selectedPacketId,nextPacketId);

  const stillActive=await spine.completeChiefRecommendation(result.recommendation.id,{
    feedback:{packetId:selectedPacketId},
    completionNote:'Marked done from Home Alignment.'
  });
  assert.equal(stillActive.status,'active');
  assert.deepEqual(stillActive.userFeedbackJson.completedPacketIds,[selectedPacketId]);
  assert.deepEqual(stillActive.userFeedbackJson.remainingPacketIds,[nextPacketId]);
  assert.equal(stillActive.completedAt,null);

  const closed=await spine.completeChiefRecommendation(result.recommendation.id,{
    feedback:{packetId:nextPacketId},
    completionNote:'Marked done from Home Alignment.'
  });
  assert.equal(closed.status,'completed');
  assert.deepEqual(closed.userFeedbackJson.completedPacketIds,[selectedPacketId,nextPacketId]);
  assert.ok(closed.completedAt);
});
