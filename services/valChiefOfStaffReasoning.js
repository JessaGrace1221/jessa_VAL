function safeArray(value){return Array.isArray(value)?value:[];}
function compactText(value='',limit=600){return String(value||'').replace(/\s+/g,' ').trim().slice(0,limit);}
function parseJson(value){
  if(value&&typeof value==='object')return value;
  const raw=String(value||'').trim().replace(/^```json\s*/i,'').replace(/```\s*$/,'').trim();
  try{return JSON.parse(raw);}catch{return {};}
}
function evidenceRefs(packet={}){
  return safeArray(packet.evidence||packet.sourceRefs||packet.source_refs).map(ref=>({
    sourceType:ref.sourceType||ref.source_type||packet.sourceType||'unknown',
    sourceId:ref.sourceId||ref.source_id||packet.sourceId||'',
    quote:String(ref.quoteOrSummary||ref.quote_or_summary||ref.quote||ref.summary||'').trim(),
    confidence:Number(ref.confidence||0.65)
  })).filter(ref=>ref.quote);
}
function exactEvidence(packet={},quote=''){
  const requested=String(quote||'').trim();
  if(!requested)return null;
  return evidenceRefs(packet).find(ref=>ref.quote.includes(requested))||null;
}
function fallbackChiefLanguage(packet={}){
  const title=compactText(packet.title||'Review the highest Board packet',180);
  const summary=compactText(packet.summary||'',320);
  const type=String(packet.packetType||packet.packet_type||'');
  const observed=safeArray(packet.observers).filter(observer=>observer.status!=='no_signal');
  const preferredNames=/email|reply|message|communication/.test(type)
    ? ['Executive Inbox','Relationship','Commitment']
    : (/calendar|meeting|timing|capacity/.test(type)
      ? ['Calendar','Capacity','Commitment']
      : (/task|commitment/.test(type)
        ? ['Commitment','Project','Capacity']
        : ['Project','Relationship','Capacity','Momentum']));
  const leadObserver=preferredNames.find(name=>observed.some(observer=>observer.observer===name))
    || observed.slice().sort((a,b)=>Number(b.confidence||0)-Number(a.confidence||0))[0]?.observer
    || '';
  if(type==='task_packet'){
    return {
      title,
      recommendation:title,
      why:summary||'This is the highest-ranked source-backed action in the current Board queue.',
      action:title,
      leadObserver
    };
  }
  if(/email|reply|message|communication/.test(type)){
    return {
      title,
      recommendation:`Review "${title}" and decide whether to reply, hold, or close it.`,
      why:summary||'This communication has the strongest current source-backed attention signal.',
      action:`Review "${title}".`,
      leadObserver
    };
  }
  return {
    title,
    recommendation:summary?`Decide the next move for "${title}."`:`Review "${title}" before choosing an action.`,
    why:summary||'This packet has the strongest current source-backed Observer convergence.',
    action:`Inspect the evidence for "${title}" and choose the next move.`,
    leadObserver
  };
}

function createChiefOfStaffReasoner({callModel,logger=console}={}){
  return async function reason({packet={},priorities=[]}={}){
    const fallback=fallbackChiefLanguage(packet);
    if(typeof callModel!=='function')return {...fallback,grounded:false};
    const refs=evidenceRefs(packet);
    if(!refs.length)return {...fallback,grounded:false};
    const observers=safeArray(packet.observers)
      .filter(observer=>observer.status!=='no_signal')
      .map(observer=>({
        observer:observer.observer,
        finding:compactText(observer.finding,320),
        confidence:Number(observer.confidence||0)
      }));
    try{
      const raw=await callModel({
        system:[
          'You are VAL’s Chief of Staff.',
          'Turn one already-ranked Board packet into a direct executive brief and one concrete Alignment action.',
          'Use only the supplied packet evidence and Observer findings.',
          'Do not speak like an Observer. Do not say protect the space, trust is moving, or a lens is watching.',
          'Name the real person, project, commitment, decision, or timing when the evidence names it.',
          'Do not invent tension, risk, motives, deadlines, recipients, or facts.',
          'The recommendation must be something the executive can do, decide, review, approve, or discuss.',
          'Return strict JSON only.'
        ].join('\n'),
        user:JSON.stringify({
          required:{
            title:'short executive headline',
            recommendation:'one direct plain-language action',
            why:'one concrete consequence or reason',
            action:'the same action in imperative form',
            lead_observer:'the one supplied Observer whose finding most directly supports this action',
            evidence_quote:'one exact quote copied from evidence',
            confidence:'0 to 1'
          },
          packet:{
            title:packet.title||'',
            summary:packet.summary||'',
            sourceType:packet.sourceType||'',
            packetType:packet.packetType||'',
            projectName:packet.projectName||'',
            relationshipName:packet.relationshipName||'',
            evidence:refs.map(ref=>ref.quote).slice(0,10),
            observerFindings:observers
          },
          userPriorities:safeArray(priorities).slice(0,8)
        }),
        maxTokens:900,
        temperature:0.1,
        json:true
      });
      const parsed=parseJson(raw);
      const evidence=exactEvidence(packet,parsed.evidence_quote);
      if(!evidence)throw new Error('Chief response did not cite exact packet evidence.');
      const title=compactText(parsed.title,180);
      const recommendation=compactText(parsed.recommendation,360);
      const why=compactText(parsed.why,420);
      const action=compactText(parsed.action||parsed.recommendation,360);
      const leadObserver=String(parsed.lead_observer||'').trim();
      if(!title||!recommendation||!why||!action)throw new Error('Chief response was incomplete.');
      if(!observers.some(observer=>observer.observer===leadObserver))throw new Error('Chief response did not select a supplied Observer.');
      return {
        title,
        recommendation,
        why,
        action,
        leadObserver,
        evidenceQuote:String(parsed.evidence_quote).trim(),
        evidenceRef:evidence,
        confidence:Math.max(0.2,Math.min(0.95,Number(parsed.confidence)||0.7)),
        grounded:true
      };
    }catch(error){
      logger.warn?.('[val-chief] grounded recommendation fallback:',error.message);
      return {...fallback,grounded:false};
    }
  };
}

module.exports={
  createChiefOfStaffReasoner,
  fallbackChiefLanguage,
  exactEvidence
};
