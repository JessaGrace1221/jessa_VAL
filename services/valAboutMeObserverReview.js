function safeArray(value){
  return Array.isArray(value)?value:[];
}

function parseJsonResponse(text,fallback={}){
  const raw=String(text||'').trim().replace(/^```json\s*/i,'').replace(/```\s*$/,'').trim();
  try{return JSON.parse(raw);}catch(_){return fallback;}
}

function documentChunks(text='',size=24000){
  const raw=String(text||'');
  if(!raw)return [];
  const chunks=[];
  for(let start=0;start<raw.length;start+=size)chunks.push(raw.slice(start,start+size));
  return chunks;
}

function exactEvidence(rawText='',values=[]){
  const raw=String(rawText||'');
  return safeArray(values)
    .map(value=>String(value||'').trim())
    .filter(value=>value.length>=8&&raw.includes(value))
    .filter((value,index,rows)=>rows.indexOf(value)===index)
    .slice(0,8);
}

function noSignalReview({observerName,document,packetId,chunks,rawText,deterministicOutput}){
  const reviewedAt=new Date().toISOString();
  const review={
    packetId,
    observerName,
    sourceType:'document',
    sourceId:String(document.id||document.sourceId||''),
    packetType:'document_packet',
    title:document.title||'About Me document',
    status:'no_signal',
    seeing:'No meaningful signal from my lens.',
    observation:'No meaningful signal from my lens.',
    evidence:[],
    confidence:0.9,
    reflectionMode:'model_backed_document_review_v1',
    reviewedAt
  };
  return {
    ...deterministicOutput,
    observation:review.observation,
    closing_statement:'I read this document and found no source-backed context that belongs to my lens.',
    evidence:[],
    confidence:0.9,
    conviction:0,
    attention_signals:[],
    unknowns:[],
    document_review:{
      sourceId:review.sourceId,
      title:review.title,
      status:'no_signal',
      sectionsRead:chunks.length,
      charactersRead:rawText.length,
      completedAt:reviewedAt
    },
    packet_reviews:[review],
    packetReviews:[review]
  };
}

function createAboutMeObserverReasoner({callModel,observerLenses={}}={}){
  if(typeof callModel!=='function')throw new Error('About Me Observer reasoning requires a model caller.');

  return async function reasonAboutMeDocumentForObserver({observerName,contextPacket,deterministicOutput}={}){
    const event=contextPacket?.event||{};
    if(event.type!=='about_me_document')return null;
    const document=event.document||{};
    const rawText=String(document.rawText||document.raw_text||'');
    if(!rawText)throw new Error('The About Me document text was not attached to the Observer review.');
    const lens=observerLenses[observerName]||{};
    const chunks=documentChunks(rawText);
    const findings=[];

    for(let index=0;index<chunks.length;index+=1){
      const result=parseJsonResponse(await callModel({
        system:[
          'You are one member of VAL’s Board of Observers.',
          `You are the ${observerName} Observer.`,
          `Your narrow lens is ${lens.lens||observerName}.`,
          `You notice ${lens.sees||'only evidence relevant to your assigned lens'}.`,
          'Read the entire supplied document section. Do not diagnose the user. Do not recommend an action.',
          'Return no_signal when this section contains nothing meaningful for your lens.',
          'Every evidence quote must be copied exactly from the supplied document section.',
          'Never invent, paraphrase, or complete a quote.'
        ].join('\n'),
        user:[
          `Document: ${document.title||'About Me document'}`,
          `Section ${index+1} of ${chunks.length}`,
          '',
          chunks[index],
          '',
          'Return JSON with: status ("observed" or "no_signal"), observation (one plain sentence), useful_context (array of short source-grounded takeaways), evidence_quotes (array of exact quotes), confidence (0 to 1).'
        ].join('\n'),
        maxTokens:900,
        temperature:0.1,
        json:true
      }),{});
      const evidenceQuotes=exactEvidence(chunks[index],result.evidence_quotes);
      if(result.status==='observed'&&evidenceQuotes.length){
        findings.push({
          observation:String(result.observation||'').trim(),
          usefulContext:safeArray(result.useful_context).map(item=>String(item||'').trim()).filter(Boolean).slice(0,5),
          evidenceQuotes,
          confidence:Math.max(0,Math.min(1,Number(result.confidence)||0.65))
        });
      }
    }

    const packetId=String(event.packetIds?.[0]||event.packetId||'');
    if(!findings.length){
      return noSignalReview({observerName,document,packetId,chunks,rawText,deterministicOutput});
    }

    const evidence=findings.flatMap(finding=>finding.evidenceQuotes.map(quote=>({
      source_type:'knowledge_document',
      source_id:String(document.id||document.sourceId||''),
      quote_or_summary:quote,
      confidence:finding.confidence,
      created_at:new Date().toISOString()
    }))).slice(0,8);
    const observations=[...new Set(findings.map(finding=>finding.observation).filter(Boolean))].slice(0,3);
    const usefulContext=[...new Set(findings.flatMap(finding=>finding.usefulContext))].slice(0,8);
    const confidence=findings.reduce((sum,finding)=>sum+finding.confidence,0)/findings.length;
    const reviewedAt=new Date().toISOString();
    const review={
      packetId,
      observerName,
      sourceType:'document',
      sourceId:String(document.id||document.sourceId||''),
      packetType:'document_packet',
      title:document.title||'About Me document',
      status:'observed',
      seeing:observations.join(' '),
      observation:observations.join(' '),
      usefulContext,
      evidence,
      confidence,
      reflectionMode:'model_backed_document_review_v1',
      reviewedAt
    };
    return {
      ...deterministicOutput,
      observation:review.observation,
      closing_statement:review.observation,
      evidence,
      confidence,
      conviction:Math.min(0.9,confidence),
      attention_signals:usefulContext,
      unknowns:[],
      document_review:{
        sourceId:review.sourceId,
        title:review.title,
        status:'observed',
        sectionsRead:chunks.length,
        charactersRead:rawText.length,
        usefulContext,
        completedAt:reviewedAt
      },
      packet_reviews:[review],
      packetReviews:[review]
    };
  };
}

module.exports={
  createAboutMeObserverReasoner,
  documentChunks,
  exactEvidence,
  parseJsonResponse
};
