const test=require('node:test');
const assert=require('node:assert/strict');

const {createValSourceProcessingService}=require('../services/valSourceProcessing');
const {createValCanonicalWorkService}=require('../services/valCanonicalWork');
const {createValTranscriptIntelligenceService}=require('../services/valTranscriptIntelligence');
const {createValBoardPacketsService}=require('../services/valBoardPackets');
const {createValIntelligenceSpine,DEFAULT_OBSERVERS,OBSERVER_PACKET_LENSES}=require('../services/valIntelligenceSpine');
const {createEvidenceQualifiedObserverReasoner}=require('../services/valEvidenceQualifiedObserverReview');

test('transcript evidence reaches canonical work, all 14 Observers, Round Table, and Chief ordering',async()=>{
  let store={};
  let sequence=0;
  const deps={
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:value=>{store=value;},
    uuid:prefix=>`${prefix}_${++sequence}`,
    tenantId:()=>'tenant',
    userId:()=>'user',
    logger:{log(){},warn(){}}
  };
  const board=createValBoardPacketsService(deps);
  const sourceProcessing=createValSourceProcessingService(deps);
  const createdPackets=[];
  const canonicalWork=createValCanonicalWorkService({
    ...deps,
    afterWorkItemEvent:async({workItem,event})=>{
      const packet=await board.recordSourceEvent('task',{
        id:event.id,
        eventType:`canonical_work_${event.eventType}`,
        sourceType:workItem.sourceType,
        sourceId:workItem.sourceId,
        title:workItem.title,
        summary:workItem.summary,
        projectName:workItem.projectName,
        sourceProcessingRecordId:workItem.sourceProcessingRecordId,
        canonicalWorkItemId:workItem.id,
        sourceRefs:workItem.sourceRefsJson,
        noExternalAction:true
      });
      createdPackets.push(packet);
    }
  });
  const transcript={
    id:'tr_goall_lineage',
    title:'GOALL dashboard handoff',
    rawText:[
      'Jessa: I will finish the GOALL dashboard handoff for Mike.',
      'Mike: The dashboard needs to show pipeline projections before the weekly check-in.'
    ].join('\n')
  };
  const transcriptService=createValTranscriptIntelligenceService({
    ...deps,
    getTranscript:async()=>transcript,
    resolveMeetingContext:async()=>({
      meeting:{id:'cal_goall',attendees:[{name:'Mike',email:'mike@example.com'}]},
      relationshipContext:{attendees:[{name:'Mike',email:'mike@example.com'}]},
      openLoops:[],
      errors:[]
    }),
    recordSourceProcessing:input=>sourceProcessing.processTranscriptSource(input),
    admitCanonicalWork:input=>canonicalWork.admit(input)
  });
  const intake=await transcriptService.intake({transcriptId:transcript.id});

  assert.ok(intake.source_processing_record.id);
  assert.equal(intake.canonical_work_items.length,1);
  assert.equal(intake.canonical_work_items[0].ownership,'user');
  assert.equal(intake.canonical_work_items[0].admissionStatus,'admitted');
  assert.equal(intake.canonical_work_items[0].projectName,'GOALL');
  assert.equal(intake.canonical_work_items[0].dueAt,null);
  assert.equal(createdPackets.length,1);

  const exactQuote='Jessa: I will finish the GOALL dashboard handoff for Mike.';
  const reasoner=createEvidenceQualifiedObserverReasoner({
    observerLenses:OBSERVER_PACKET_LENSES,
    callModel:async({system})=>{
      const observed=/Commitment Observer|Project Observer/.test(system);
      return JSON.stringify({reviews:[{
        packetId:createdPackets[0].id,
        status:observed?'observed':'no_meaningful_signal',
        observation:observed?'Jessa made a concrete GOALL handoff commitment.':'No meaningful signal from my lens.',
        useful_context:observed?['The GOALL handoff remains open.']:[],
        evidence_quote:observed?exactQuote:'',
        confidence:0.9
      }]});
    }
  });
  const spine=createValIntelligenceSpine({
    ...deps,
    observerReasoner:reasoner,
    loaders:{
      listBoardPackets:async()=>createdPackets,
      loadTasks:async()=>[],
      listTeachValCoreMemory:async()=>[],
      listRelationshipProfiles:async()=>[]
    }
  });
  const pass=await spine.runIntelligencePass({
    event:{
      type:'canonical_work_admitted',
      sourceType:'transcript',
      sourceId:transcript.id,
      packetIds:[createdPackets[0].id]
    },
    observerSuite:DEFAULT_OBSERVERS
  });

  assert.equal(pass.observerRuns.length,14);
  assert.equal(new Set(pass.observerRuns.map(run=>run.observerName)).size,14);
  for(const run of pass.observerRuns){
    assert.equal(run.outputJson.packetReviews.length,1);
    assert.equal(run.outputJson.packetReviews[0].packetId,createdPackets[0].id);
    assert.equal(run.outputJson.packetReviews[0].reflectionMode,'model_backed_evidence_review_v1');
  }
  assert.equal(pass.observerRuns.find(run=>run.observerName==='Commitment').outputJson.packetReviews[0].status,'observed');
  assert.equal(pass.observerRuns.find(run=>run.observerName==='Relationship').outputJson.packetReviews[0].status,'no_signal');
  assert.deepEqual(pass.roundTable.outputJson.reviewed_packet_ids,[createdPackets[0].id]);
  assert.ok(pass.recommendation.id);
  assert.ok(pass.recommendation.sourceRefsJson.some(ref=>ref.source_id===transcript.id));
});
