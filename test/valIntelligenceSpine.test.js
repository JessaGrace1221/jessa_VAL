const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createValIntelligenceSpine,contextForPersistence,normalizeSourceRef,DEFAULT_OBSERVERS}=require('../services/valIntelligenceSpine');
const {createAboutMeObserverReasoner,documentChunks,exactEvidence}=require('../services/valAboutMeObserverReview');
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
  assert.match(routes,/\/api\/val\/observers\/evidence/);
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

test('Postgres intelligence rows expose canonical fields to Round Table and Chief readers',async()=>{
  const outputJson={observation:'Relationship observed a trust signal.',packetReviews:[]};
  const spine=createValIntelligenceSpine({
    hasPg:()=>true,
    dbQuery:async()=>({rows:[{
      id:'observer_pg',
      tenant_id:'tenant',
      user_id:'user',
      event_run_id:'event_pg',
      observer_name:'Relationship',
      status:'completed',
      output_json:outputJson,
      evidence_refs_json:[{source_type:'transcript',source_id:'tr_1',quote_or_summary:'Exact evidence.'}],
      closing_statement:'Relationship observed a trust signal.',
      unknowns_json:[],
      confidence:0.88,
      conviction:0.82,
      created_at:new Date('2026-07-25T12:00:00.000Z')
    }]}),
    tenantId:()=>'tenant',
    userId:()=>'user'
  });
  const [run]=await spine.listObserverRuns({eventRunId:'event_pg'});
  assert.equal(run.observerName,'Relationship');
  assert.equal(run.eventRunId,'event_pg');
  assert.equal(run.outputJson,outputJson);
  assert.equal(run.closingStatement,'Relationship observed a trust signal.');
  assert.equal(run.evidenceRefsJson[0].source_id,'tr_1');
  assert.equal(run.createdAt,'2026-07-25T12:00:00.000Z');
});

test('Observer audit records do not duplicate complete About Me source text',()=>{
  const stored=contextForPersistence({
    event:{
      type:'about_me_document',
      document:{id:'doc_1',title:'About Me',rawText:'Private source evidence lives once.'}
    }
  });
  assert.equal(stored.event.document.rawText,undefined);
  assert.equal(stored.event.document.characterCount,35);
  assert.equal(stored.event.document.sourceTextStoredSeparately,true);
});

test('About Me evidence keeps exact quotes and reads every document section',async()=>{
  const calls=[];
  const reasoner=createAboutMeObserverReasoner({
    observerLenses:{Capacity:{lens:'tradeoffs',sees:'capacity and decision quality'}},
    callModel:async input=>{
      calls.push(input);
      const sourceLine=input.user.includes('SECOND SECTION')
        ? 'SECOND SECTION protects unhurried thinking.'
        : 'FIRST SECTION values directness.';
      return JSON.stringify({
        status:'observed',
        observation:'The user protects decision quality.',
        useful_context:['Protect clear decisions.'],
        evidence_quotes:[sourceLine,'This sentence was invented.'],
        confidence:0.88
      });
    }
  });
  const rawText='FIRST SECTION values directness.'.padEnd(24000,' ')+'SECOND SECTION protects unhurried thinking.';
  const output=await reasoner({
    observerName:'Capacity',
    contextPacket:{
      event:{
        type:'about_me_document',
        packetIds:['packet_about_me'],
        document:{id:'doc_about_me',title:'Jessa About Me',rawText}
      }
    },
    deterministicOutput:{observer:'Capacity'}
  });
  assert.equal(documentChunks(rawText).length,2);
  assert.equal(calls.length,2);
  assert.equal(output.document_review.sectionsRead,2);
  assert.equal(output.document_review.charactersRead,rawText.length);
  assert.equal(output.packetReviews[0].status,'observed');
  assert.deepEqual(
    output.evidence.map(item=>item.quote_or_summary),
    ['FIRST SECTION values directness.','SECOND SECTION protects unhurried thinking.']
  );
  assert.deepEqual(exactEvidence(rawText,['This sentence was invented.']),[]);
});

test('About Me review stores an honest no-signal receipt when a lens finds nothing',async()=>{
  const reasoner=createAboutMeObserverReasoner({
    observerLenses:{Calendar:{lens:'timing',sees:'calendar reality'}},
    callModel:async()=>JSON.stringify({
      status:'observed',
      observation:'Invented observation.',
      evidence_quotes:['A quote not present in the document.'],
      confidence:0.91
    })
  });
  const output=await reasoner({
    observerName:'Calendar',
    contextPacket:{event:{type:'about_me_document',document:{id:'doc_1',title:'About Me',rawText:'I value candor and humane work.'}}},
    deterministicOutput:{observer:'Calendar'}
  });
  assert.equal(output.packetReviews[0].status,'no_signal');
  assert.equal(output.observation,'No meaningful signal from my lens.');
  assert.equal(output.document_review.charactersRead,31);
});

test('About Me intelligence invokes one independent reasoner for each of 14 Observers',async()=>{
  let store={tasks:[]};
  const calls=[];
  const spine=createValIntelligenceSpine({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    uuid:prefix=>`${prefix}_${Math.random().toString(36).slice(2,8)}`,
    tenantId:()=>'tenant',
    userId:()=>'user',
    logger:{log(){},warn(){}},
    observerReasoner:async({observerName,deterministicOutput})=>{
      calls.push(observerName);
      return {
        ...deterministicOutput,
        observation:`${observerName} read the document.`,
        evidence:[{source_type:'knowledge_document',source_id:'doc_about_me',quote_or_summary:'I value directness.',confidence:1}],
        document_review:{sourceId:'doc_about_me',status:'observed',sectionsRead:1,charactersRead:18},
        confidence:0.9,
        conviction:0.7
      };
    },
    loaders:{
      listBoardPackets:async()=>[],
      loadTasks:async()=>[],
      listTeachValCoreMemory:async()=>[],
      listRelationshipProfiles:async()=>[]
    }
  });
  const result=await spine.runIntelligencePass({
    event:{type:'about_me_document',sourceType:'document',sourceId:'doc_about_me',document:{id:'doc_about_me',rawText:'I value directness.'}}
  });
  assert.equal(result.observerRuns.length,14);
  assert.equal(new Set(calls).size,14);
  assert.ok(calls.includes('Delight'));
  assert.ok(calls.includes('Synchronicity'));
  assert.ok(calls.includes('Witnessing'));
  assert.ok(result.observerRuns.every(run=>run.outputJson.document_review?.sourceId==='doc_about_me'));
  assert.ok(result.observerRuns.every(run=>run.contextPacketJson.event.document.rawText===undefined));
  assert.ok(result.observerRuns.every(run=>run.contextPacketJson.sharedContextStoredIn==='event_intelligence_runs'));
  assert.ok(result.observerRuns.every(run=>Array.isArray(run.contextPacketJson.boardPacketIds)));
  assert.ok(result.observerRuns.every(run=>run.contextPacketJson.boardPackets===undefined));
});

test('failed Observer reasoning is never stored or advanced as completed',async()=>{
  let store={tasks:[]};
  const spine=createValIntelligenceSpine({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    uuid:prefix=>`${prefix}_${Math.random().toString(36).slice(2,8)}`,
    tenantId:()=>'tenant',
    userId:()=>'user',
    logger:{log(){},warn(){}},
    observerReasoner:async()=>{throw new Error('provider unavailable');},
    loaders:{
      listBoardPackets:async()=>[],
      loadTasks:async()=>[],
      listTeachValCoreMemory:async()=>[],
      listRelationshipProfiles:async()=>[]
    }
  });
  await assert.rejects(
    spine.runIntelligencePass({
      event:{type:'about_me_document',sourceType:'document',sourceId:'doc_failed',document:{id:'doc_failed',rawText:'Source text.'}}
    }),
    /14 of 14 Observer reviews did not complete/
  );
  assert.equal(store.observerRuns.length,14);
  assert.ok(store.observerRuns.every(run=>run.status==='review_failed'));
  assert.ok(store.observerRuns.every(run=>run.errorMessage==='provider unavailable'));
  assert.equal(store.roundTableRuns.length,0);
  assert.equal(store.chiefOfStaffRecommendations.length,0);
  assert.equal(store.eventIntelligenceRuns[0].status,'review_failed');
});

test('failed all-14 Board delivery is durably retried from preserved packet IDs',async()=>{
  let store={tasks:[]};
  let shouldFail=true;
  const packet={
    id:'packet_retry',
    sourceType:'transcript',
    sourceId:'transcript_retry',
    packetType:'meeting_evidence_packet',
    title:'Retryable source',
    summary:'A durable packet that must reach all Observers.',
    primaryObserversJson:['Commitment'],
    routeObserversJson:[],
    sourceRefsJson:[{source_type:'transcript',source_id:'transcript_retry',quote_or_summary:'I will send the final scope.',confidence:0.9}],
    prototype:false,
    status:'active'
  };
  const spine=createValIntelligenceSpine({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:value=>{store=value;},
    uuid:prefix=>`${prefix}_${Math.random().toString(36).slice(2,8)}`,
    tenantId:()=>'tenant',
    userId:()=>'user',
    logger:{log(){},warn(){}},
    observerReasoner:async({deterministicOutput})=>{
      if(shouldFail)throw new Error('temporary provider failure');
      return deterministicOutput;
    },
    loaders:{
      listBoardPackets:async()=>[packet],
      loadTasks:async()=>[],
      listTeachValCoreMemory:async()=>[],
      listRelationshipProfiles:async()=>[]
    }
  });
  await assert.rejects(
    spine.runIntelligencePass({event:{type:'source_received',sourceType:'transcript',sourceId:packet.sourceId,packetIds:[packet.id]}}),
    /14 of 14 Observer reviews did not complete/
  );
  shouldFail=false;
  const retry=await spine.retryFailedIntelligenceRuns({limit:10});
  assert.equal(retry.ok,true);
  assert.equal(retry.retried,1);
  const successful=store.eventIntelligenceRuns.find(run=>run.status==='completed');
  assert.ok(successful);
  assert.equal(store.eventIntelligenceRuns.find(run=>run.status==='superseded_by_retry').resultJson.retryEventRunId,successful.id);
  const successfulObserverRuns=store.observerRuns.filter(run=>run.eventRunId===successful.id);
  assert.equal(successfulObserverRuns.length,14);
  assert.ok(successfulObserverRuns.every(run=>run.status==='completed'));
});

test('failed Board delivery remains retryable after newer successful traffic',async()=>{
  let store={tasks:[]};
  const failedRun={
    id:'event_failed_old',
    tenantId:'tenant',
    userId:'user',
    eventSourceType:'transcript',
    eventSourceId:'transcript_old',
    status:'review_failed',
    contextPacketJson:{boardPackets:[{id:'packet_old'}]},
    resultJson:{},
    unknownsJson:[],
    sourceRefsJson:[],
    createdAt:'2026-01-01T00:00:00.000Z'
  };
  store.eventIntelligenceRuns=[
    ...Array.from({length:30},(_,index)=>({
      id:`event_success_${index}`,
      tenantId:'tenant',
      userId:'user',
      status:'completed',
      createdAt:`2026-02-${String(index%28+1).padStart(2,'0')}T00:00:00.000Z`
    })),
    failedRun
  ];
  const packet={
    id:'packet_old',
    sourceType:'transcript',
    sourceId:'transcript_old',
    packetType:'meeting_evidence_packet',
    title:'Old failed delivery',
    summary:'This packet must not age out of the retry queue.',
    primaryObserversJson:['Commitment'],
    routeObserversJson:[],
    sourceRefsJson:[{source_type:'transcript',source_id:'transcript_old',quote_or_summary:'I will send the final scope.',confidence:0.9}],
    prototype:false,
    status:'active'
  };
  const spine=createValIntelligenceSpine({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:value=>{store=value;},
    uuid:prefix=>`${prefix}_${Math.random().toString(36).slice(2,8)}`,
    tenantId:()=>'tenant',
    userId:()=>'user',
    logger:{log(){},warn(){}},
    observerReasoner:async({deterministicOutput})=>deterministicOutput,
    loaders:{
      listBoardPackets:async()=>[packet],
      loadTasks:async()=>[],
      listTeachValCoreMemory:async()=>[],
      listRelationshipProfiles:async()=>[]
    }
  });
  const retry=await spine.retryFailedIntelligenceRuns({limit:10});
  assert.equal(retry.ok,true);
  assert.equal(retry.retried,1);
  assert.equal(store.eventIntelligenceRuns.find(run=>run.id==='event_failed_old').status,'superseded_by_retry');
});

test('failed Board retries batch unique packets and reconcile duplicate completed runs without model work',async()=>{
  let store={tasks:[]};
  const packets=['packet_done','packet_a','packet_b'].map(id=>({
    id,
    sourceType:'transcript',
    sourceId:`source_${id}`,
    packetType:'meeting_evidence_packet',
    title:id,
    summary:`Evidence for ${id}.`,
    primaryObserversJson:['Commitment'],
    routeObserversJson:[],
    sourceRefsJson:[{source_type:'transcript',source_id:`source_${id}`,quote_or_summary:`Exact evidence for ${id}.`,confidence:0.9}],
    prototype:false,
    status:'active'
  }));
  store.eventIntelligenceRuns=[
    {
      id:'completed_existing',
      tenantId:'tenant',
      userId:'user',
      status:'completed',
      contextPacketJson:{boardPackets:[packets[0]]},
      createdAt:'2026-01-01T00:00:00.000Z'
    },
    ...[
      ['failed_done',['packet_done']],
      ['failed_a',['packet_a']],
      ['failed_a_duplicate',['packet_a']],
      ['failed_b',['packet_b']]
    ].map(([id,packetIds])=>({
      id,
      tenantId:'tenant',
      userId:'user',
      eventSourceType:'transcript',
      eventSourceId:id,
      status:'review_failed',
      contextPacketJson:{boardPackets:packets.filter(packet=>packetIds.includes(packet.id))},
      resultJson:{},
      unknownsJson:[],
      sourceRefsJson:[],
      createdAt:'2026-01-02T00:00:00.000Z'
    }))
  ];
  let reasonerCalls=0;
  const spine=createValIntelligenceSpine({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:value=>{store=value;},
    uuid:prefix=>`${prefix}_${Math.random().toString(36).slice(2,8)}`,
    tenantId:()=>'tenant',
    userId:()=>'user',
    logger:{log(){},warn(){}},
    observerReasoner:async({deterministicOutput})=>{reasonerCalls++;return deterministicOutput;},
    loaders:{
      listBoardPackets:async()=>packets,
      loadTasks:async()=>[],
      listTeachValCoreMemory:async()=>[],
      listRelationshipProfiles:async()=>[]
    }
  });
  const retry=await spine.retryFailedIntelligenceRuns({limit:10});
  assert.equal(retry.ok,true);
  assert.equal(retry.retried,3);
  assert.equal(retry.reconciled,1);
  assert.equal(retry.batches,1);
  assert.equal(reasonerCalls,14);
  assert.ok(store.eventIntelligenceRuns.filter(run=>run.id.startsWith('failed_')).every(run=>run.status==='superseded_by_retry'));
  const recovery=store.eventIntelligenceRuns.find(run=>run.status==='completed'&&run.id!=='completed_existing');
  assert.deepEqual(recovery.contextPacketJson.boardPackets.map(packet=>packet.id).sort(),['packet_a','packet_b']);
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
  assert.equal(result.readyForYouItems.length,0);
  assert.equal(store.readyForYouItems.length,0);
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

test('an intelligence pass reviews only the newly delivered packet IDs instead of reprocessing Board history',async()=>{
  const store={boardPackets:[
    {id:'packet_new',sourceType:'transcript',sourceId:'tr_new',packetType:'meeting_evidence_packet',title:'New meeting',summary:'Jessa committed to send Mike the GOALL dashboard handoff.',status:'active',routeObserversJson:[]},
    {id:'packet_old',sourceType:'email',sourceId:'email_old',packetType:'email_attention_packet',title:'Old email',summary:'A previously processed email.',status:'active',routeObserversJson:[]}
  ]};
  const service=createValIntelligenceSpine({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>Object.assign(store,s),
    uuid:prefix=>`${prefix}_${Math.random().toString(16).slice(2)}`,
    tenantId:()=>'tenant',
    userId:()=>'user',
    loaders:{listBoardPackets:async()=>store.boardPackets},
    logger:{log(){},warn(){}}
  });
  const context=await service.buildSharedContextPacket({event:{packetIds:['packet_new']}});
  assert.deepEqual(context.boardPackets.map(packet=>packet.id),['packet_new']);
  assert.equal(context.recentBoardPacketCount,2);
});

test('shared Board context uses the canonical transcript loader when available',async()=>{
  const store={boardPackets:[]};
  let calls=0;
  const service=createValIntelligenceSpine({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>Object.assign(store,s),
    uuid:prefix=>`${prefix}_transcript_loader`,
    tenantId:()=>'tenant',
    userId:()=>'user',
    loaders:{
      listBoardPackets:async()=>[],
      listRecentTranscripts:async({limit})=>{
        calls++;
        assert.equal(limit,8);
        return [{id:'tr_real',title:'Real transcript',summary:'Exact source context.'}];
      }
    },
    logger:{log(){},warn(){}}
  });
  const context=await service.buildSharedContextPacket({event:{type:'test'}});
  assert.equal(calls,1);
  assert.equal(context.recentTranscripts[0].id,'tr_real');
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
    chiefReasoner:async({packet:chosen})=>{
      assert.equal(chosen.packetId,packet.id);
      return {
        title:'Clarify the GOALL dashboard handoff',
        recommendation:'Finish the dashboard/projections handoff with Mike so GOALL has one clean next step.',
        why:'Project owns the work, Momentum wants the handoff closed, and Commitment is watching the follow-through.',
        action:'Clarify the dashboard handoff with Mike.',
        confidence:0.9,
        grounded:true
      };
    },
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
  assert.ok(result.observerRuns.every(run=>run.contextPacketJson.sharedContextStoredIn==='event_intelligence_runs'));
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

test('Chief of Staff persists canonical work order for current and next Alignment items',async()=>{
  let store={tasks:[]};
  const recorded=[];
  let rebalanceCount=0;
  const packets=[
    {
      id:'packet_rank_1',
      sourceType:'transcript',
      sourceId:'tr_rank_1',
      packetType:'task_packet',
      title:'Finish the project handoff',
      summary:'The project handoff is still open.',
      primaryObserversJson:['Project','Commitment'],
      routeObserversJson:[],
      sourceRefsJson:[{source_type:'transcript',source_id:'tr_rank_1',quote_or_summary:'I will finish the handoff.',confidence:0.9}],
      payloadJson:{canonicalWorkItemId:'work_rank_1',sourceProcessingRecordId:'source_rank_1',projectName:'GOALL'},
      prototype:false
    },
    {
      id:'packet_rank_2',
      sourceType:'email',
      sourceId:'email_rank_2',
      packetType:'task_packet',
      title:'Confirm the proposal scope',
      summary:'The proposal scope needs a decision.',
      primaryObserversJson:['Opportunity','Commitment'],
      routeObserversJson:[],
      sourceRefsJson:[{source_type:'email',source_id:'email_rank_2',quote_or_summary:'Please confirm the scope.',confidence:0.86}],
      payloadJson:{canonicalWorkItemId:'work_rank_2',sourceProcessingRecordId:'source_rank_2',projectName:'GOALL'},
      prototype:false
    }
  ];
  const spine=createValIntelligenceSpine({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    uuid:prefix=>`${prefix}_rank_${Math.random().toString(36).slice(2,7)}`,
    tenantId:()=>'test-tenant',
    userId:()=>'test-user',
    logger:{log(){},warn(){}},
    recordChiefOrdering:async(id,input)=>recorded.push({id,input}),
    rebalanceChiefQueue:async()=>{rebalanceCount+=1;return {ok:true};},
    loaders:{
      listBoardPackets:async()=>packets,
      loadTasks:async()=>[],
      listTeachValCoreMemory:async()=>[],
      listRelationshipProfiles:async()=>[]
    }
  });
  const result=await spine.runIntelligencePass({
    event:{type:'board_packet_received',sourceType:'transcript',sourceId:'tr_rank_1',packetIds:packets.map(packet=>packet.id)}
  });
  assert.equal(recorded.length,2);
  assert.deepEqual(recorded.map(row=>row.input.chiefRank),[1,2]);
  assert.ok(recorded.every(row=>row.input.chiefRecommendationId===result.recommendation.id));
  assert.ok(recorded.every(row=>row.input.roundTableRunId===result.roundTable.id));
  assert.ok(recorded.every(row=>Number(row.input.chiefScore)>0));
  assert.deepEqual(new Set(recorded.map(row=>row.id)),new Set(['work_rank_1','work_rank_2']));
  assert.equal(rebalanceCount,1);
});

test('all 14 independent Observer reviews run with bounded concurrency',async()=>{
  let store={tasks:[]};
  let active=0;
  let peak=0;
  const seen=[];
  const packet={
    id:'packet_concurrency',
    sourceType:'transcript',
    sourceId:'transcript_concurrency',
    packetType:'meeting_evidence_packet',
    title:'Shared evidence packet',
    summary:'One source is reviewed independently by every Observer.',
    primaryObserversJson:['Meaning'],
    routeObserversJson:DEFAULT_OBSERVERS.map(observer=>({observerName:observer.observerName,primary:observer.observerName==='Meaning'})),
    sourceRefsJson:[{source_type:'transcript',source_id:'transcript_concurrency',quote_or_summary:'Every Observer should inspect this exact source.',confidence:0.9}],
    prototype:false
  };
  const spine=createValIntelligenceSpine({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    uuid:prefix=>`${prefix}_concurrency_${Math.random().toString(36).slice(2,7)}`,
    tenantId:()=>'test-tenant',
    userId:()=>'test-user',
    logger:{log(){},warn(){}},
    observerReasoner:async({observerName,deterministicOutput})=>{
      active+=1;
      peak=Math.max(peak,active);
      seen.push(observerName);
      await new Promise(resolve=>setTimeout(resolve,8));
      active-=1;
      return deterministicOutput;
    },
    loaders:{
      listBoardPackets:async()=>[packet],
      loadTasks:async()=>[],
      listTeachValCoreMemory:async()=>[],
      listRelationshipProfiles:async()=>[]
    }
  });
  const result=await spine.runIntelligencePass({
    event:{type:'board_packet_received',sourceType:'transcript',sourceId:'transcript_concurrency',packetIds:[packet.id]}
  });
  assert.equal(result.observerRuns.length,14);
  assert.equal(new Set(seen).size,14);
  assert.equal(peak,4);
});
