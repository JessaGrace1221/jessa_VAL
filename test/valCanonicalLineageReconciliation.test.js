const test=require('node:test');
const assert=require('node:assert/strict');

const {
  createValCanonicalLineageReconciliation,
  classificationContext
}=require('../services/valCanonicalLineageReconciliation');

test('historical reconciliation reuses durable evidence and batches Observer delivery',async()=>{
  const observerBatches=[];
  const service=createValCanonicalLineageReconciliation({
    listTranscripts:async()=>[{id:'tr_1'},{id:'tr_2'}],
    reconcileTranscript:async({transcript})=>({
      source_processing_record:{
        id:`source_${transcript.id}`,
        sourceType:'transcript',
        sourceId:transcript.id
      },
      canonical_work_items:[{id:`work_${transcript.id}`}]
    }),
    listEmailClassifications:async()=>[{
      id:'class_1',
      contextJson:{conversationId:'conversation_1',commitments:[{text:'Please send the scope.'}]},
      commitments:[{text:'Please send the scope.'}]
    }],
    reconcileEmailClassification:async({context,notify})=>{
      assert.equal(context.conversationId,'conversation_1');
      assert.equal(notify,false);
      return {
        sourceProcessingRecord:{id:'source_email_1',sourceType:'email',sourceId:'conversation_1'},
        canonicalWorkItems:[{id:'work_email_1'}]
      };
    },
    createSourcePacket:async record=>[
      {id:`packet_${record.id}_1`},
      {id:`packet_${record.id}_2`}
    ],
    createWorkPacket:async workItem=>({id:`packet_${workItem.id}`}),
    runObserverBatch:async packets=>observerBatches.push(packets.map(packet=>packet.id))
  });

  const result=await service.reconcile({observerBatchSize:3});
  assert.equal(result.ok,true);
  assert.equal(result.transcriptsReconciled,2);
  assert.equal(result.emailClassificationsReconciled,1);
  assert.equal(result.canonicalWorkItemsSeen,3);
  assert.equal(result.boardPacketsDelivered,9);
  assert.equal(result.observerBatches,3);
  assert.deepEqual(observerBatches.map(batch=>batch.length),[3,3,3]);
});

test('classification reconciliation restores commitments and source refs from stored columns',()=>{
  const context=classificationContext({
    contextJson:{conversationId:'conversation_1'},
    commitments:[{text:'I will send the scope.'}],
    sourceRefs:[{source_type:'email_message',source_id:'message_1',quote_or_summary:'I will send the scope.'}]
  });
  assert.deepEqual(context.commitments,[{text:'I will send the scope.'}]);
  assert.equal(context.source_refs[0].source_id,'message_1');
});

test('historical reconciliation fails closed when the Observer batch does not complete',async()=>{
  const service=createValCanonicalLineageReconciliation({
    listTranscripts:async()=>[{id:'tr_1'}],
    reconcileTranscript:async()=>({
      source_processing_record:{id:'source_1'},
      canonical_work_items:[]
    }),
    createSourcePacket:async()=>({id:'packet_1'}),
    runObserverBatch:async()=>({
      ok:false,
      eventRun:{status:'review_failed'}
    })
  });
  const result=await service.reconcile({transcriptLimit:1,emailLimit:1});
  assert.equal(result.ok,false);
  assert.equal(result.observerBatches,0);
  assert.match(result.errors[0].error,/Observer batch did not complete: review_failed/);
});
