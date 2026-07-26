function safeArray(value){return Array.isArray(value)?value:[];}
function bounded(value,fallback,max){return Math.max(1,Math.min(Number(value)||fallback,max));}
function classificationContext(row={}){
  const context=row.context||row.contextJson||row.context_json||{};
  return {
    ...context,
    commitments:safeArray(context.commitments).length?context.commitments:safeArray(row.commitments),
    source_refs:safeArray(context.source_refs).length?context.source_refs:safeArray(row.sourceRefs)
  };
}
function classificationValue(row={}){
  const context=classificationContext(row);
  return {
    ...(context.classification||{}),
    ...row,
    id:row.id||context.classification?.id||'',
    identity_resolution:row.identity_resolution||context.classification?.identity_resolution||{}
  };
}

function createValCanonicalLineageReconciliation({
  listTranscripts=async()=>[],
  reconcileTranscript,
  listEmailClassifications=async()=>[],
  reconcileEmailClassification,
  createSourcePacket,
  createWorkPacket,
  runObserverBatch,
  logger=console
}={}){
  async function reconcile(input={}){
    const transcriptLimit=bounded(input.transcriptLimit,200,1000);
    const emailLimit=bounded(input.emailLimit,500,2000);
    const observerBatchSize=bounded(input.observerBatchSize,20,20);
    const packets=new Map();
    const errors=[];
    let transcriptCount=0;
    let emailCount=0;
    let workItemCount=0;
    function collectPackets(value){
      for(const packet of safeArray(value).length?safeArray(value):[value]){
        if(packet?.id)packets.set(packet.id,packet);
      }
    }

    if(typeof reconcileTranscript==='function'){
      const transcripts=safeArray(await listTranscripts({limit:transcriptLimit})).slice(0,transcriptLimit);
      for(const transcript of transcripts){
        try{
          const result=await reconcileTranscript({transcript,transcriptId:transcript.id,notify:false});
          transcriptCount+=1;
          const sourceRecord=result.source_processing_record||result.sourceProcessingRecord;
          if(sourceRecord&&typeof createSourcePacket==='function'){
            collectPackets(await createSourcePacket(sourceRecord));
          }
          for(const workItem of safeArray(result.canonical_work_items||result.canonicalWorkItems)){
            workItemCount+=1;
            if(typeof createWorkPacket==='function'){
              collectPackets(await createWorkPacket(workItem));
            }
          }
        }catch(error){
          errors.push({sourceType:'transcript',sourceId:transcript.id||'',error:error.message});
        }
      }
    }

    if(typeof reconcileEmailClassification==='function'){
      const classifications=safeArray(await listEmailClassifications({limit:emailLimit})).slice(0,emailLimit);
      for(const row of classifications){
        const context=classificationContext(row);
        const classification=classificationValue(row);
        try{
          const result=await reconcileEmailClassification({context,classification,notify:false});
          emailCount+=1;
          const sourceRecord=result.sourceProcessingRecord||result.source_processing_record;
          if(sourceRecord&&typeof createSourcePacket==='function'){
            collectPackets(await createSourcePacket(sourceRecord));
          }
          for(const workItem of safeArray(result.canonicalWorkItems||result.canonical_work_items)){
            workItemCount+=1;
            if(typeof createWorkPacket==='function'){
              collectPackets(await createWorkPacket(workItem));
            }
          }
        }catch(error){
          errors.push({sourceType:'email',sourceId:context.conversationId||context.threadId||row.id||'',error:error.message});
        }
      }
    }

    const packetList=[...packets.values()];
    let observerBatches=0;
    if(typeof runObserverBatch==='function'){
      for(let index=0;index<packetList.length;index+=observerBatchSize){
        const batch=packetList.slice(index,index+observerBatchSize);
        try{
          await runObserverBatch(batch,{
            type:'canonical_lineage_reconciliation',
            sourceType:'canonical_reconciliation',
            sourceId:`batch_${observerBatches+1}`
          });
          observerBatches+=1;
        }catch(error){
          errors.push({sourceType:'observer_batch',sourceId:`batch_${observerBatches+1}`,error:error.message});
          logger.warn?.('[val-canonical-reconcile] Observer batch failed:',error.message);
        }
      }
    }
    return {
      ok:errors.length===0,
      transcriptsReconciled:transcriptCount,
      emailClassificationsReconciled:emailCount,
      canonicalWorkItemsSeen:workItemCount,
      boardPacketsDelivered:packetList.length,
      observerBatches,
      observerBatchSize,
      errors,
      no_external_action:true
    };
  }
  return {reconcile};
}

module.exports={
  createValCanonicalLineageReconciliation,
  classificationContext,
  classificationValue
};
