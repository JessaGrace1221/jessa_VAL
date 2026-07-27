function safeArray(value){return Array.isArray(value)?value:[];}
function compactText(value='',limit=900){return String(value||'').replace(/\s+/g,' ').trim().slice(0,limit);}
function parseJsonResponse(text,fallback={}){
  const raw=String(text||'').trim().replace(/^```json\s*/i,'').replace(/```\s*$/,'').trim();
  try{return JSON.parse(raw);}catch{return fallback;}
}
function packetValue(packet,key){
  return packet[key]??packet[key.replace(/[A-Z]/g,letter=>`_${letter.toLowerCase()}`)];
}
function packetEvidence(packet={}){
  const sourceType=String(packetValue(packet,'sourceType')||'unknown');
  const sourceId=String(packetValue(packet,'sourceId')||'');
  const payload=packetValue(packet,'payloadJson')||packet.payload||{};
  const evidenceContent=String(payload.evidenceContent||payload.evidence_content||'').trim();
  const refs=safeArray(packetValue(packet,'sourceRefsJson')||packet.sourceRefs).map(ref=>({
    sourceType:String(ref.sourceType||ref.source_type||packetValue(packet,'sourceType')||'unknown'),
    sourceId:String(ref.sourceId||ref.source_id||packetValue(packet,'sourceId')||''),
    quote:compactText(ref.quoteOrSummary||ref.quote_or_summary||ref.sourceQuote||ref.source_quote||'',900),
    confidence:Math.max(0,Math.min(1,Number(ref.confidence)||0.65)),
    createdAt:ref.createdAt||ref.created_at||packet.createdAt||packet.created_at||new Date().toISOString()
  })).filter(ref=>ref.quote);
  if(evidenceContent)refs.push({
    sourceType,
    sourceId,
    quote:compactText(evidenceContent,2600),
    confidence:1,
    createdAt:packet.createdAt||packet.created_at||new Date().toISOString()
  });
  return refs.filter((ref,index,all)=>all.findIndex(other=>other.sourceType===ref.sourceType&&other.sourceId===ref.sourceId&&other.quote===ref.quote)===index);
}
function packetLineage(packet={}){
  const payload=packetValue(packet,'payloadJson')||packet.payload||{};
  const projectId=String(payload.projectId||payload.project_id||packet.projectId||packet.project_id||'').trim();
  const projectName=String(payload.projectName||payload.project_name||packet.projectName||packet.project_name||'').trim();
  const relationshipId=String(payload.relationshipId||payload.relationship_id||packet.relationshipId||packet.relationship_id||'').trim();
  const relationshipName=String(payload.relationshipName||payload.relationship_name||packet.relationshipName||packet.relationship_name||payload.relationship||'').trim();
  const canonicalWorkItemId=String(payload.canonicalWorkItemId||payload.canonical_work_item_id||packet.canonicalWorkItemId||packet.canonical_work_item_id||'').trim();
  const sourceProcessingRecordId=String(payload.sourceProcessingRecordId||payload.source_processing_record_id||packet.sourceProcessingRecordId||packet.source_processing_record_id||'').trim();
  const envelope=projectId||projectName
    ? {type:'project',id:projectId,name:projectName}
    : (relationshipId||relationshipName
      ? {type:'relationship',id:relationshipId,name:relationshipName}
      : {type:'source',id:String(packetValue(packet,'sourceId')||''),name:compactText(packet.title||'',180)});
  return {
    canonicalWorkItemId,
    sourceProcessingRecordId,
    projectId,
    projectName,
    relationshipId,
    relationshipName,
    envelope
  };
}
function exactPacketEvidence(packet={},quote=''){
  const requested=String(quote||'').trim();
  if(!requested)return null;
  return packetEvidence(packet).find(ref=>ref.quote.includes(requested))||null;
}
function noSignalReview(observerName,packet={}){
  return {
    packetId:String(packet.id||packet.packetId||''),
    observerName,
    sourceType:String(packetValue(packet,'sourceType')||'unknown'),
    sourceId:String(packetValue(packet,'sourceId')||''),
    packetType:String(packetValue(packet,'packetType')||'learning_packet'),
    title:compactText(packet.title||'Source packet',180),
    ...packetLineage(packet),
    status:'no_signal',
    seeing:'No meaningful signal from my lens.',
    observation:'No meaningful signal from my lens.',
    evidence:[],
    usefulContext:[],
    watching:'',
    concern:'',
    question:'',
    confidence:0.9,
    reflectionMode:'model_backed_evidence_review_v1',
    reviewedAt:new Date().toISOString()
  };
}
function targetPackets(contextPacket={}){
  const packets=safeArray(contextPacket.boardPackets).filter(packet=>packet&&!packet.prototype);
  const packetIds=new Set(safeArray(contextPacket.event?.packetIds).map(String));
  if(packetIds.size)return packets.filter(packet=>packetIds.has(String(packet.id||packet.packetId||''))).slice(0,20);
  const sourceType=String(contextPacket.event?.sourceType||contextPacket.event?.source_type||'');
  const sourceId=String(contextPacket.event?.sourceId||contextPacket.event?.source_id||'');
  const matched=packets.filter(packet=>(!sourceType||String(packetValue(packet,'sourceType'))===sourceType)&&(!sourceId||String(packetValue(packet,'sourceId'))===sourceId));
  return (matched.length?matched:packets.slice(0,1)).slice(0,20);
}

function createEvidenceQualifiedObserverReasoner({callModel,observerLenses={},aboutMeReasoner=null}={}){
  if(typeof callModel!=='function')throw new Error('Evidence-qualified Observer reasoning requires a model caller.');
  return async function reasonForObserver({observerName,contextPacket={},deterministicOutput={}}={}){
    if(contextPacket.event?.type==='about_me_document'&&typeof aboutMeReasoner==='function'){
      return aboutMeReasoner({observerName,contextPacket,deterministicOutput});
    }
    const packets=targetPackets(contextPacket);
    if(!packets.length){
      return {
        ...deterministicOutput,
        observation:'No meaningful signal from my lens.',
        closing_statement:'No qualifying source packet was available for review.',
        evidence:[],
        confidence:0.9,
        conviction:0,
        attention_signals:[],
        unknowns:[],
        packet_reviews:[],
        packetReviews:[]
      };
    }
    const lens=observerLenses[observerName]||{};
    const packetBriefs=packets.map(packet=>({
      packetId:String(packet.id||packet.packetId||''),
      sourceType:String(packetValue(packet,'sourceType')||'unknown'),
      sourceId:String(packetValue(packet,'sourceId')||''),
      packetType:String(packetValue(packet,'packetType')||'learning_packet'),
      title:compactText(packet.title||'',180),
      summary:compactText(packet.summary||'',320),
      evidence:packetEvidence(packet).map(ref=>compactText(ref.quote,600)).slice(0,1)
    }));
    const result=parseJsonResponse(await callModel({
      system:[
        'You are one member of VAL’s Board of Observers.',
        `You are the ${observerName} Observer.`,
        `Your narrow lens is ${lens.lens||observerName}.`,
        `You notice ${lens.sees||'only evidence relevant to your assigned lens'}.`,
        'Review every supplied packet independently.',
        'For each packet return observed only when its supplied evidence materially changes your lens.',
        'Otherwise return no_meaningful_signal. This is a valid and preferred answer when the lens does not apply.',
        'Do not manufacture relevance by saying ordinary operational work "touches", "relates to", or "connects with" your lens.',
        'For Delight, an action item alone is not evidence of joy, energy, curiosity, ease, restoration, or life. Stay quiet unless the source itself supports one of those signals.',
        'An observed review must cite one evidence_quote copied exactly from that packet evidence.',
        'Do not infer names, projects, motives, urgency, or relationships that the evidence does not state.',
        'Write as this Observer in concise, natural first-person language.',
        'observation states the concrete signal you see now and why it matters through your lens, in one plain human sentence.',
        'Avoid abstract analysis phrases such as "collaborative workflow", "access channels", "indicates", "touches", or "around". Name the concrete person, promise, tension, opening, or change instead.',
        'watching states what you will continue monitoring through this lens. Include watching_evidence_quote copied exactly from the supplied packet evidence or leave both fields empty.',
        'concern states the supported risk, tension, or cost. Include concern_evidence_quote copied exactly from the supplied packet evidence or leave both fields empty.',
        'question states one useful question this Observer would explore with the user. Leave it empty when none is supported.',
        'Every useful_context item must be an object with fact and evidence_quote. Copy evidence_quote exactly from the supplied packet evidence.',
        'Do not recommend an action. Do not expose chain-of-thought.'
      ].join('\n'),
      user:[
        JSON.stringify({packets:packetBriefs}),
        '',
        'Return strict JSON: {"reviews":[{"packetId":"...","status":"observed|no_meaningful_signal","observation":"one concrete sentence","evidence_quote":"exact supplied quote or empty","watching":"one distinct sentence or empty","watching_evidence_quote":"exact supplied quote or empty","concern":"one distinct sentence or empty","concern_evidence_quote":"exact supplied quote or empty","question":"one concise question or empty","useful_context":[{"fact":"short grounded fact","evidence_quote":"exact supplied quote"}],"confidence":0.0}]}'
      ].join('\n'),
      maxTokens:Math.min(3200,600+(packets.length*180)),
      temperature:0.1,
      json:true
    }),{reviews:[]});
    const returned=new Map(safeArray(result.reviews).map(review=>[String(review.packetId||''),review]));
    const reviews=packets.map(packet=>{
      const packetId=String(packet.id||packet.packetId||'');
      const candidate=returned.get(packetId)||{};
      const evidenceRef=exactPacketEvidence(packet,candidate.evidence_quote);
      if(candidate.status!=='observed'||!evidenceRef)return noSignalReview(observerName,packet);
      const watchingEvidenceRef=exactPacketEvidence(packet,candidate.watching_evidence_quote);
      const concernEvidenceRef=exactPacketEvidence(packet,candidate.concern_evidence_quote);
      const usefulContext=safeArray(candidate.useful_context).map(item=>{
        if(!item||typeof item!=='object')return null;
        const fact=compactText(item.fact,240);
        const support=exactPacketEvidence(packet,item.evidence_quote);
        return fact&&support?{
          fact,
          evidenceQuote:String(item.evidence_quote).trim(),
          sourceType:support.sourceType,
          sourceId:support.sourceId
        }:null;
      }).filter(Boolean).slice(0,6);
      const reviewedAt=new Date().toISOString();
      const evidence=[{
        source_type:evidenceRef.sourceType,
        source_id:evidenceRef.sourceId,
        quote_or_summary:String(candidate.evidence_quote).trim(),
        confidence:evidenceRef.confidence,
        created_at:evidenceRef.createdAt
      }];
      return {
        packetId,
        observerName,
        sourceType:String(packetValue(packet,'sourceType')||'unknown'),
        sourceId:String(packetValue(packet,'sourceId')||''),
        packetType:String(packetValue(packet,'packetType')||'learning_packet'),
        title:compactText(packet.title||'Source packet',180),
        ...packetLineage(packet),
        status:'observed',
        seeing:compactText(candidate.observation,420),
        observation:compactText(candidate.observation,420),
        evidence,
        usefulContext:usefulContext.map(item=>item.fact),
        usefulContextEvidence:usefulContext,
        watching:watchingEvidenceRef?compactText(candidate.watching,280):'',
        watchingEvidence:watchingEvidenceRef?{
          quoteOrSummary:String(candidate.watching_evidence_quote).trim(),
          sourceType:watchingEvidenceRef.sourceType,
          sourceId:watchingEvidenceRef.sourceId
        }:null,
        concern:concernEvidenceRef?compactText(candidate.concern,240):'',
        concernEvidence:concernEvidenceRef?{
          quoteOrSummary:String(candidate.concern_evidence_quote).trim(),
          sourceType:concernEvidenceRef.sourceType,
          sourceId:concernEvidenceRef.sourceId
        }:null,
        question:compactText(candidate.question,200),
        confidence:Math.max(0.2,Math.min(0.95,Number(candidate.confidence)||0.65)),
        reflectionMode:'model_backed_evidence_review_v1',
        reviewedAt
      };
    });
    const observed=reviews.filter(review=>review.status==='observed');
    const evidence=observed.flatMap(review=>review.evidence).slice(0,10);
    const attentionSignals=[...new Set(observed.flatMap(review=>review.usefulContext))].slice(0,8);
    const confidence=observed.length?observed.reduce((sum,review)=>sum+review.confidence,0)/observed.length:0.9;
    const observation=observed[0]?.observation||'No meaningful signal from my lens.';
    return {
      ...deterministicOutput,
      observation,
      closing_statement:observation,
      evidence,
      confidence,
      conviction:observed.length?Math.min(0.9,confidence):0,
      attention_signals:attentionSignals,
      unknowns:[],
      packet_reviews:reviews,
      packetReviews:reviews
    };
  };
}

module.exports={
  createEvidenceQualifiedObserverReasoner,
  targetPackets,
  packetEvidence,
  exactPacketEvidence,
  packetLineage
};
