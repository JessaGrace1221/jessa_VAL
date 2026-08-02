const test=require('node:test');
const assert=require('node:assert/strict');
const {createValSourceProcessingService}=require('../services/valSourceProcessing');
const {createValBoardPacketsService,BOARD_SOURCE_REGISTRY,BOARD_OBSERVERS}=require('../services/valBoardPackets');
const {createValIntelligenceSpine}=require('../services/valIntelligenceSpine');

const PACKET_TYPES={
  email:'email_attention_packet',
  transcript:'meeting_evidence_packet',
  calendar_event:'meeting_context_packet',
  witnessing:'identity_context_packet',
  cowork:'cowork_packet',
  external_action:'approval_packet',
  draft:'draft_review_packet',
  sms:'relationship_packet',
  linkedin_visibility:'relationship_packet',
  document:'document_packet',
  task:'task_packet',
  relationship_profile:'relationship_packet',
  project_profile:'project_packet',
  public_research:'project_packet',
  ghl_voice:'cowork_packet',
  ghl_text:'cowork_packet'
};

test('every registered live source creates an immutable receipt and 14 independent Observer receipts',async()=>{
  let store={tasks:[]};
  let counter=0;
  const uuid=prefix=>`${prefix}_${++counter}`;
  const common={
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:value=>{store=value;},
    uuid,
    tenantId:()=>'tenant',
    userId:()=>'user',
    logger:{log(){},warn(){}}
  };
  const board=createValBoardPacketsService(common);
  const spine=createValIntelligenceSpine({
    ...common,
    observerReasoner:async({deterministicOutput})=>deterministicOutput,
    loaders:{
      listBoardPackets:input=>board.listPackets({...input,includePrototype:false}),
      loadTasks:async()=>[],
      listTeachValCoreMemory:async()=>[],
      listRelationshipProfiles:async()=>[]
    }
  });
  const deliveries=[];
  const sourceProcessing=createValSourceProcessingService({
    ...common,
    afterSourceProcessed:async({record,sourceRef,sourceRefs,rawText,sourceType,sourceId,sourceTitle})=>{
      const packet=await board.createPacket({
        id:`packet_${record.id}`,
        sourceType,
        sourceId,
        packetType:PACKET_TYPES[sourceType],
        title:sourceTitle,
        summary:rawText,
        sourceRefs:[sourceRef,...sourceRefs],
        payload:{
          sourceProcessingRecordId:record.id,
          sourceVersion:record.sourceVersion,
          sourceFingerprint:record.sourceFingerprint,
          noExternalAction:true
        }
      });
      const pass=await spine.runIntelligencePass({
        event:{
          type:'canonical_source_version_processed',
          sourceType,
          sourceId,
          packetIds:[packet.id]
        }
      });
      deliveries.push({sourceType,record,packet,pass});
      return [packet];
    }
  });

  for(const source of BOARD_SOURCE_REGISTRY){
    assert.equal(source.status,'live',`${source.sourceType} is not registered live`);
    const sourceId=`${source.sourceType}_source_1`;
    const exactEvidence=`Exact ${source.sourceType} evidence for the executive source matrix.`;
    const result=await sourceProcessing.processEvidenceSource({
      sourceType:source.sourceType,
      sourceId,
      sourceTitle:`${source.label} source`,
      rawText:exactEvidence,
      sourceRefs:[{
        sourceType:source.sourceType,
        sourceId,
        quoteOrSummary:exactEvidence,
        confidence:1
      }],
      domainRoutes:['board_of_observers'],
      metadata:{source:'source_observer_matrix',noExternalAction:true}
    });
    assert.equal(result.ok,true,source.sourceType);
    assert.equal(result.sourceProcessingRecord.sourceReceiptJson.rawText,exactEvidence,source.sourceType);
    assert.equal(result.sourceProcessingRecord.sourceVersion,1,source.sourceType);
  }

  assert.equal(deliveries.length,BOARD_SOURCE_REGISTRY.length);
  for(const delivery of deliveries){
    const runs=delivery.pass.observerRuns;
    assert.equal(runs.length,BOARD_OBSERVERS.length,delivery.sourceType);
    assert.equal(new Set(runs.map(run=>run.observerName)).size,BOARD_OBSERVERS.length,delivery.sourceType);
    assert.ok(runs.every(run=>run.status==='completed'),delivery.sourceType);
    assert.ok(runs.every(run=>
      run.outputJson.packet_reviews.some(review=>review.packetId===delivery.packet.id)
    ),delivery.sourceType);
    assert.equal(delivery.pass.eventRun.status,'completed',delivery.sourceType);
    assert.ok(delivery.pass.roundTable,delivery.sourceType);
    assert.ok(delivery.pass.recommendation,delivery.sourceType);
  }
});
