function safeArray(value){return Array.isArray(value)?value:[];}
function compactText(value='',limit=900){return String(value||'').replace(/\s+/g,' ').trim().slice(0,limit);}
function normalizeEvidenceRef(ref={},review={}){
  return {
    sourceType:String(ref.sourceType||ref.source_type||review.sourceType||review.source_type||'unknown'),
    sourceId:String(ref.sourceId||ref.source_id||review.sourceId||review.source_id||''),
    quoteOrSummary:compactText(ref.quoteOrSummary||ref.quote_or_summary||ref.quote||ref.summary||'',1200),
    confidence:Math.max(0,Math.min(1,Number(ref.confidence)||0)),
    createdAt:ref.createdAt||ref.created_at||review.reviewedAt||review.reviewed_at||''
  };
}
function normalizedEvidenceRefs(review={}){
  const raw=Array.isArray(review.evidence)
    ? review.evidence
    : (review.evidence&&typeof review.evidence==='object'?[review.evidence]:[]);
  return raw.map(ref=>normalizeEvidenceRef(ref,review)).filter(ref=>ref.quoteOrSummary);
}
function normalizeObserverEvidenceReview(run={},review={}){
  const observerName=String(run.observerName||run.observer_name||review.observerName||review.observer_name||'').trim();
  const evidenceRefs=normalizedEvidenceRefs(review);
  const observed=String(review.status||'').toLowerCase()==='observed'&&evidenceRefs.length>0;
  const primaryEvidence=evidenceRefs[0]||null;
  return {
    reviewVersion:4,
    reviewMode:'durable_observer_run_v1',
    evidenceQualified:true,
    observerRunId:String(run.id||''),
    eventRunId:String(run.eventRunId||run.event_run_id||''),
    packetId:String(review.packetId||review.packet_id||''),
    observerName,
    sourceType:String(review.sourceType||review.source_type||primaryEvidence?.sourceType||'unknown'),
    sourceId:String(review.sourceId||review.source_id||primaryEvidence?.sourceId||''),
    packetType:String(review.packetType||review.packet_type||'learning_packet'),
    packetTitle:compactText(review.title||'Source packet',180),
    canonicalWorkItemId:String(review.canonicalWorkItemId||review.canonical_work_item_id||''),
    sourceProcessingRecordId:String(review.sourceProcessingRecordId||review.source_processing_record_id||''),
    projectId:String(review.projectId||review.project_id||''),
    projectName:String(review.projectName||review.project_name||''),
    relationshipId:String(review.relationshipId||review.relationship_id||''),
    relationshipName:String(review.relationshipName||review.relationship_name||''),
    envelope:review.envelope||null,
    status:observed?'observed':'no_signal',
    lensFinding:observed?compactText(review.observation||review.seeing||'',420):'No meaningful signal from my lens.',
    observation:observed?compactText(review.observation||review.seeing||'',420):'No meaningful signal from my lens.',
    usefulContext:safeArray(review.usefulContext||review.useful_context).map(item=>compactText(item,240)).filter(Boolean).slice(0,6),
    watching:compactText(review.watching||'',280),
    concern:compactText(review.concern||'',240),
    question:compactText(review.question||'',200),
    people:safeArray(review.people).map(item=>compactText(item,120)).filter(Boolean).slice(0,8),
    projects:safeArray(review.projects).map(item=>compactText(item,120)).filter(Boolean).slice(0,6),
    decisionObjects:safeArray(review.decisionObjects||review.decision_objects).map(item=>compactText(item,160)).filter(Boolean).slice(0,6),
    confidence:Math.max(0,Math.min(1,Number(review.confidence)||0)),
    evidenceRefs,
    evidence:primaryEvidence ? {
      sourceType:primaryEvidence.sourceType,
      sourceId:primaryEvidence.sourceId,
      quoteOrSummary:primaryEvidence.quoteOrSummary,
      confidence:primaryEvidence.confidence,
      sourceCreatedAt:primaryEvidence.createdAt,
      packetTitle:compactText(review.title||review.packetType||review.packet_type||'Source packet',180),
      packetType:String(review.packetType||review.packet_type||'learning_packet')
    } : {
      sourceType:String(review.sourceType||review.source_type||'unknown'),
      sourceId:String(review.sourceId||review.source_id||''),
      quoteOrSummary:'',
      confidence:0,
      sourceCreatedAt:'',
      packetTitle:compactText(review.title||review.packetType||review.packet_type||'Source packet',180),
      packetType:String(review.packetType||review.packet_type||'learning_packet')
    },
    reviewedAt:review.reviewedAt||review.reviewed_at||run.createdAt||run.created_at||''
  };
}
function buildObserverEvidenceLedger(runs=[],{observerName='',limitPerObserver=80}={}){
  const requested=String(observerName||'').trim();
  const byObserver={};
  const seen=new Set();
  const sorted=safeArray(runs)
    .filter(run=>String(run.status||'completed')==='completed')
    .slice()
    .sort((a,b)=>String(b.createdAt||b.created_at||'').localeCompare(String(a.createdAt||a.created_at||'')));
  for(const run of sorted){
    const name=String(run.observerName||run.observer_name||'').trim();
    if(!name||(requested&&name!==requested))continue;
    const output=run.outputJson||run.output_json||{};
    for(const review of safeArray(output.packetReviews||output.packet_reviews)){
      const normalized=normalizeObserverEvidenceReview(run,review);
      const key=[normalized.observerName,normalized.packetId,normalized.sourceType,normalized.sourceId].join('|');
      if(seen.has(key))continue;
      seen.add(key);
      if(!byObserver[name])byObserver[name]=[];
      if(byObserver[name].length<limitPerObserver)byObserver[name].push(normalized);
    }
  }
  const reviews=Object.values(byObserver).flat();
  return {
    reviewsByObserver:byObserver,
    reviews,
    receiptCount:reviews.length,
    observedCount:reviews.filter(review=>review.status==='observed').length,
    noSignalCount:reviews.filter(review=>review.status==='no_signal').length,
    observerCount:Object.keys(byObserver).length
  };
}

module.exports={
  normalizeEvidenceRef,
  normalizeObserverEvidenceReview,
  buildObserverEvidenceLedger
};
