const test=require('node:test');
const assert=require('node:assert/strict');

const {
  normalizeObserverEvidenceReview,
  buildObserverEvidenceLedger
}=require('../services/valObserverEvidence');

test('durable Observer runs become one inspectable evidence receipt',()=>{
  const review=normalizeObserverEvidenceReview({
    id:'observer_run_1',
    observerName:'Relationship',
    status:'completed',
    createdAt:'2026-07-25T12:00:00Z'
  },{
    packetId:'packet_1',
    sourceType:'transcript',
    sourceId:'transcript_1',
    packetType:'meeting_evidence_packet',
    title:'Mike project handoff',
    canonicalWorkItemId:'work_1',
    sourceProcessingRecordId:'source_record_1',
    projectName:'GOALL',
    relationshipName:'Mike',
    status:'observed',
    observation:'Mike asked for a clearer handoff before the next meeting.',
    evidence:[{
      source_type:'transcript',
      source_id:'transcript_1',
      quote_or_summary:'Mike: I need the handoff to be clearer before Monday.',
      confidence:0.96
    }],
    confidence:0.88
  });
  assert.equal(review.status,'observed');
  assert.equal(review.evidenceQualified,true);
  assert.equal(review.evidence.quoteOrSummary,'Mike: I need the handoff to be clearer before Monday.');
  assert.equal(review.canonicalWorkItemId,'work_1');
  assert.equal(review.projectName,'GOALL');
  assert.equal(review.relationshipName,'Mike');
});

test('an observed claim without exact evidence is downgraded to no signal',()=>{
  const review=normalizeObserverEvidenceReview(
    {id:'observer_run_2',observerName:'Capacity',status:'completed'},
    {packetId:'packet_2',status:'observed',observation:'The executive is overloaded.',evidence:[]}
  );
  assert.equal(review.status,'no_signal');
  assert.equal(review.observation,'No meaningful signal from my lens.');
});

test('Observer evidence ledger deduplicates reruns and keeps all 14 independent receipts',()=>{
  const names=[
    'Executive Inbox','Relationship','Project','Capacity','Courage','Delight','Opportunity',
    'Momentum','Meaning','Synchronicity','Commitment','Calendar','Environment','Witnessing'
  ];
  const runs=names.map((observerName,index)=>({
    id:`run_${index}`,
    observerName,
    status:'completed',
    createdAt:'2026-07-25T12:00:00Z',
    outputJson:{
      packetReviews:[{
        packetId:'packet_shared',
        sourceType:'email',
        sourceId:'email_1',
        status:index%2===0?'observed':'no_signal',
        observation:index%2===0?`${observerName} found a grounded signal.`:'No meaningful signal from my lens.',
        evidence:index%2===0?[{source_type:'email',source_id:'email_1',quote_or_summary:'Please send the final scope.',confidence:0.9}]:[]
      }]
    }
  }));
  runs.push({...runs[0],id:'older_duplicate',createdAt:'2026-07-24T12:00:00Z'});
  const ledger=buildObserverEvidenceLedger(runs);
  assert.equal(ledger.observerCount,14);
  assert.equal(ledger.receiptCount,14);
  assert.equal(ledger.observedCount,7);
  assert.equal(ledger.noSignalCount,7);
  assert.equal(ledger.reviewsByObserver['Executive Inbox'].length,1);
});
