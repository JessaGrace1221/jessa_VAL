function safeArray(value){return Array.isArray(value) ? value : [];}
function compactText(value='',limit=900){return String(value || '').replace(/\s+/g,' ').trim().slice(0,limit);}
function multilineText(value='',limit=5000){return String(value || '').replace(/\r\n?/g,'\n').trim().slice(0,limit);}
function stableKey(value=''){
  return String(value || '').toLowerCase().replace(/[^a-z0-9:_-]+/g,'_').replace(/^_+|_+$/g,'').slice(0,180) || 'cowork';
}
function jsonValue(value,fallback){
  if(value == null) return fallback;
  if(typeof value === 'string'){
    try{return JSON.parse(value);}catch(_){return fallback;}
  }
  return value;
}
function toSnake(key){return key.replace(/[A-Z]/g,(match)=>'_'+match.toLowerCase());}
function rowToCamel(row={}){
  const result={};
  for(const [key,value] of Object.entries(row || {})){
    const camel=key.replace(/_([a-z])/g,(_,letter)=>letter.toUpperCase());
    result[camel]=value instanceof Date ? value.toISOString() : value;
  }
  for(const key of ['workingBriefJson','questionPlanJson','stateJson','payloadJson','sourceRefsJson']){
    if(Object.hasOwn(result,key)) result[key]=jsonValue(result[key],key === 'questionPlanJson' || key === 'sourceRefsJson' ? [] : {});
  }
  return result;
}
function pgValueForColumn(column,value){
  if(!/Json$/.test(String(column||''))) return value;
  const fallback=/^(questionPlanJson|sourceRefsJson)$/.test(column) ? [] : {};
  return JSON.stringify(value == null ? fallback : value);
}
function sourceRef(input={}){
  return {
    source_type:compactText(input.source_type || input.sourceType || 'project_packet',100),
    source_id:compactText(input.source_id || input.sourceId || input.id || '',220),
    quote_or_summary:compactText(input.quote_or_summary || input.quoteOrSummary || input.summary || '',900),
    confidence:Math.max(0,Math.min(1,Number(input.confidence) || 0.8))
  };
}
function observerConversationReviewLine(review={}){
  const evidence=review.evidence || {};
  const title=compactText(evidence.packetTitle || evidence.packetType || review.title || review.packetType || 'Board packet',180);
  const sourceType=compactText(evidence.sourceType || review.sourceType || 'source',80).replace(/_/g,' ');
  const sourceId=compactText(evidence.sourceId || review.sourceId || '',120);
  const names=safeArray(review.people).filter(Boolean).slice(0,4);
  const projects=safeArray(review.projects).filter(Boolean).slice(0,3);
  const objects=safeArray(review.decisionObjects).filter(Boolean).slice(0,3);
  const named=[names.length?'People: '+names.join(', '):'',projects.length?'Projects: '+projects.join(', '):'',objects.length?'Work: '+objects.join(', '):''].filter(Boolean).join(' | ');
  const observation=compactText(review.lensFinding || review.observation || review.seeing || review.concern || evidence.quoteOrSummary || evidence.quote_or_summary || review.summary || '',420);
  return [named,title,sourceType + (sourceId ? ' #' + sourceId : ''),observation].filter(Boolean).join(': ');
}
const OBSERVER_ENTITY_STOPWORDS=new Set([
  'VAL','Board','Observer','Observers','Chief','Staff','Relationship','Relationships','Project','Projects','Capacity','Courage','Delight',
  'Meaning','Momentum','Commitment','Calendar','Environment','Witnessing','Executive','Inbox','Currently','Seeing','Watching','Evidence',
  'Concern','Question','Source','Trail','Home','GHL','CRM','HTML','CSS','SMS','Tone','Transcript','Calendar','The',
  'Which','Signal','Changes','Current','Project Context','Work',
  'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'
]);
function observerConversationEntityText(...values){
  return values.flat().map((value)=>typeof value === 'string' ? value : JSON.stringify(value||'')).join(' ');
}
function observerConversationNamedPeople(text=''){
  const raw=String(text||'');
  const matches=raw.match(/\b[A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,})?\b/g)||[];
  const seen=new Set();
  return matches
    .map((name)=>compactText(name,80))
    .filter((name)=>name&&!OBSERVER_ENTITY_STOPWORDS.has(name.split(/\s+/)[0])&&!OBSERVER_ENTITY_STOPWORDS.has(name))
    .filter((name)=>{
      const key=name.toLowerCase();
      if(seen.has(key))return false;
      seen.add(key);
      return true;
    })
    .slice(0,5);
}
function observerConversationProjects(text=''){
  const raw=String(text||'');
  const projects=[];
  if(/\bGOALL\b/i.test(raw))projects.push('GOALL');
  if(/\bdashboard|handoff|projection/i.test(raw))projects.push('dashboard handoff');
  if(/\bproposal|payment|pricing/i.test(raw))projects.push('proposal or payment decision');
  const seen=new Set();
  return projects.filter((item)=>{
    const key=item.toLowerCase();
    if(seen.has(key))return false;
    seen.add(key);
    return true;
  }).slice(0,4);
}
function observerConversationReviewFromCard(observer={},sourceTrail=[]){
  const text=observerConversationEntityText(
    observer.currentlySeeing,
    observer.watching,
    safeArray(observer.evidenceItems).join(' '),
    observer.evidence,
    observer.concern,
    observer.explore,
    observer.incomingObservation,
    safeArray(sourceTrail).map(item=>item.line||item.title||item.summary||'')
  );
  const line=compactText([
    observer.currentlySeeing,
    observer.concern,
    observer.explore
  ].filter(Boolean).join(' '),700);
  const evidenceLine=compactText([
    safeArray(observer.evidenceItems).join('; '),
    observer.evidence,
    safeArray(sourceTrail).map(item=>item.line||item.title||item.summary||'').filter(Boolean).join(' | ')
  ].filter(Boolean).join(' | '),900);
  if(!line&&!evidenceLine)return null;
  return {
    status:'observed',
    observerName:observer.name||'Observer',
    people:observerConversationNamedPeople(text),
    projects:observerConversationProjects(text),
    decisionObjects:observerConversationProjects(text),
    lensFinding:line||evidenceLine,
    observation:line||evidenceLine,
    evidence:{quoteOrSummary:evidenceLine||line}
  };
}
function observerConversationReviewIsGrounded(review={},observerName=''){
  if(review.status!=='observed')return false;
  const evidence=review.evidence||{};
  const sourceType=String(evidence.sourceType||review.sourceType||'').toLowerCase();
  if(!/calendar/.test(sourceType)||observerName==='Calendar')return true;
  const quote=String(evidence.quoteOrSummary||evidence.quote_or_summary||review.evidenceLine||review.line||'');
  const calendarProofPatterns={
    'Executive Inbox':/\b(reply|respond|email|message|introduction|follow[- ]?up)\b/i,
    Relationship:/\b(frustrat|tension|repair|distance|trust|warmth|tone|relationship|attendee|with\s+[A-Z])\b/i,
    Project:/\b(project|GOALL|dashboard|handoff|deliver|milestone|workstream|owner)\b/i,
    Capacity:/\b(back[- ]to[- ]back|overload|overwhelmed|capacity|recovery|competing|too many|decision load)\b/i,
    Courage:/\b(avoid|hesitat|pushback|hard choice|directness|not saying)\b/i,
    Delight:/\b(joy|delight|curiosity|relief|restore|grounding|play|alive|energized)\b/i,
    Opportunity:/\b(opportunity|revenue|proposal|pricing|sale|lead|opening|introduction)\b/i,
    Momentum:/\b(stuck|blocked|finished|completed|handoff|next step|moved forward|lost momentum)\b/i,
    Meaning:/\b(value|purpose|meaning|larger story|matters|vision|mission)\b/i,
    Synchronicity:/\b(repeated|again|echo|recurring pattern|convergence|coincidence|timing cluster)\b/i,
    Commitment:/\b(commitment|promise|follow[- ]?up|action item|owed|due|owner|open loop)\b/i,
    Environment:/\b(environment|room|travel|location|weather|physical space|interruption|external condition)\b/i,
    Witnessing:/\b(witnessing|onboarding|revealed preference|asked VAL to remember|protect this)\b/i
  };
  return Boolean(calendarProofPatterns[observerName]?.test(quote));
}
function observerConversationHumanReply({observerName='Observer',answer='',meaningful=[],sourceTrail=[]}={}){
  const text=compactText(answer,900);
  const lower=text.toLowerCase();
  const first=meaningful[0] || {};
  const people=Array.from(new Set(meaningful.flatMap(review=>safeArray(review.people)).filter(Boolean))).slice(0,4);
  const projects=Array.from(new Set(meaningful.flatMap(review=>safeArray(review.projects)).filter(Boolean))).slice(0,3);
  const objects=Array.from(new Set(meaningful.flatMap(review=>safeArray(review.decisionObjects)).filter(Boolean))).slice(0,3);
  const observation=compactText(first.lensFinding || first.observation || first.seeing || first.concern || observerConversationReviewLine(first),520);
  const evidence=compactText(first.evidenceLine || first.line || first.evidence?.quoteOrSummary || first.evidence?.quote_or_summary || sourceTrail[0] || '',520);
  const wantsRepair=observerName==='Relationship' && /\b(repair|which relationship|who|person|tone|warmth|trust|distance|friction)\b/i.test(lower);
  const observerQuestions={
    'Executive Inbox':'Does this need your judgment, or can I help you close the loop without giving it more attention?',
    Relationship:'What would repair or strengthen this relationship without making the interaction heavier than it needs to be?',
    Project:'What is the smallest project decision that would make the next move unambiguous?',
    Capacity:'What can come off your plate before we ask you to carry one more thing?',
    Courage:'What are you avoiding saying because the honest version may create friction?',
    Delight:'What would put some life back into this without reducing effectiveness?',
    Opportunity:'Is this a real opening worth pursuing now, or merely an interesting possibility?',
    Momentum:'What can move today without waiting for the entire answer?',
    Meaning:'What larger commitment is this serving, and is that still true?',
    Synchronicity:'What else has appeared recently that may be part of the same pattern?',
    Commitment:'Which promise needs to be kept, renegotiated, or released?',
    Calendar:'Does your calendar protect this priority, or quietly contradict it?',
    Environment:'What in the surrounding system is making the right action easier or harder?',
    Witnessing:'What do you notice in yourself when you read that back?'
  };
  const lead=wantsRepair
    ? (people.length ? `I would start with ${people[0]}.` : 'I do not have enough evidence to name the relationship yet.')
    : (observation || evidence || `I do not have enough signal to make a ${observerName} claim yet.`);
  const contextParts=[
    people.length>1 ? `The same signal also names ${people.slice(1).join(', ')}.` : '',
    projects.length ? `It is connected to ${projects.join(', ')}.` : '',
    objects.length ? `The work in question is ${objects.join(', ')}.` : ''
  ].filter(Boolean);
  const nextQuestion=wantsRepair
    ? 'What would make this feel clear, respectful, and no longer dragged out?'
    : (observerQuestions[observerName] || 'What changed here, and what would move this forward without adding noise?');
  return [
    lead,
    observation && observation!==lead ? observation : '',
    contextParts.length ? contextParts.join(' ') : '',
    evidence && evidence!==lead ? `I am saying that because ${evidence}` : '',
    sourceTrail.length>1 ? `I can also trace it to ${sourceTrail.slice(1,3).join(' ')}` : '',
    '',
    nextQuestion
  ].filter(Boolean).join('\n');
}
function observerConversationDirectReply({entrypointId='',workingBrief={},answer=''}={}){
  const text=compactText(answer,900).toLowerCase();
  if(!text)return '';
  const asksLoadedContext=/\b(evidence|proof|source|where.*come from|context|card|currently seeing|watching|concern|explore|why|what changed|how.*changed|tone changed|repair|which relationship|who|which person|which project)\b/i.test(text);
  if(!asksLoadedContext)return '';
  const isChief=entrypointId==='board.chief_of_staff';
  const context=workingBrief.context&&typeof workingBrief.context==='object'?workingBrief.context:{};
  const observer=context.selectedObserver || {};
  const chiefRead=context.chiefOfStaffRead || {};
  const sourceTrail=safeArray(context.sourceTrail).map(item=>compactText(item.line || item.title || item.summary || '',320)).filter(Boolean);
  const proofReviews=safeArray(context.observerProofReviews).map(review=>({
    ...review,
    status:review.status || 'observed',
    lensFinding:review.lensFinding || review.observation || review.line || '',
    observation:review.observation || review.lensFinding || review.line || '',
    evidence:{quoteOrSummary:review.evidenceLine || review.line || review.observation || review.lensFinding || ''}
  }));
  const sourceTrailReviews=safeArray(context.sourceTrail).map(item=>compactText(item.line || item.title || item.summary || '',320)).filter(Boolean);
  const cardReview=observerConversationReviewFromCard(observer,context.sourceTrail);
  const rawMeaningful=(safeArray(observer.meaningfulReviews).length ? safeArray(observer.meaningfulReviews) : proofReviews)
    .filter(review=>review.status==='observed');
  const meaningful=rawMeaningful
    .filter(review=>observerConversationReviewIsGrounded(review,compactText(observer.name || workingBrief.title || 'Observer',80).replace(/\s+Observer$/i,'')))
    .slice(0,5);
  const fallbackMeaningful=meaningful.length ? meaningful : (cardReview ? [cardReview] : []);
  const checked=(safeArray(observer.liveReviews).length ? safeArray(observer.liveReviews) : proofReviews).slice(0,6);
  if(isChief){
    const lines=[
      chiefRead.witness ? 'Chief of Staff read: ' + chiefRead.witness : '',
      chiefRead.orientation ? 'Board lens in front: ' + chiefRead.orientation : '',
      sourceTrail.length ? 'Evidence I can show:\n' + sourceTrail.map(line=>'- '+line).join('\n') : ''
    ].filter(Boolean);
    if(!lines.length)return '';
    return [
      'Here is the inspectable basis for this Chief of Staff read:',
      '',
      ...lines,
      '',
      'If the source trail is too thin, the right fix is to attach the originating packet, not ask you to trust a vague summary.'
    ].join('\n');
  }
	  const observerName=compactText(observer.name || workingBrief.title || 'this Observer',80).replace(/\s+Observer$/i,'');
  if(rawMeaningful.length&&!meaningful.length){
    return [
      `I checked ${rawMeaningful.length} ${observerName} review${rawMeaningful.length===1?'':'s'}, but the source evidence does not support the claim those reviews made.`,
      '',
      'I am not going to name a person, risk, or pattern from routing language alone.',
      'The next useful step is to wait for a source that contains the actual signal, or inspect the original source directly.'
    ].join('\n');
  }
		  if(fallbackMeaningful.length){
		    return observerConversationHumanReply({observerName,answer,meaningful:fallbackMeaningful,sourceTrail:sourceTrailReviews.length?sourceTrailReviews:sourceTrail});
		  }
  const cardLines=[
    observer.currentlySeeing ? 'Currently seeing: ' + observer.currentlySeeing : '',
    observer.watching ? 'Watching: ' + observer.watching : '',
    safeArray(observer.evidenceItems).length ? 'Evidence: ' + safeArray(observer.evidenceItems).join('; ') : (observer.evidence ? 'Evidence: ' + observer.evidence : ''),
    observer.concern ? 'Concern: ' + observer.concern : '',
    observer.explore ? 'Question: ' + observer.explore : '',
    sourceTrail.length ? 'Source trail:\n' + sourceTrail.slice(0,4).map(line=>'- '+line).join('\n') : ''
  ].filter(Boolean);
  if(!cardLines.length&&checked.length){
    return [
      observerName + ' checked the current Board packets and is not claiming a meaningful signal yet.',
      '',
      ...checked.slice(0,5).map(review=>'- '+observerConversationReviewLine(review)),
      '',
      'That is a real answer: this lens checked the packet and did not find enough signal to make a claim.'
    ].join('\n');
  }
  if(!cardLines.length){
    return [
      `${observerName} does not have a source-backed signal to claim from the currently loaded packets.`,
      '',
      'That is not a dead end. It means this lens checked the available evidence and found nothing strong enough to put in front of you.',
      'If there is a specific person, project, or source you are worried about, name it and I will stay inside this lens while we examine it.'
    ].join('\n');
  }
  return [
    observerName + ' is answering from the loaded Observer card, not a fresh search:',
    '',
    ...cardLines.map(line=>line.includes('\n')?line:'- '+line),
    '',
    sourceTrail.length ? 'If you want a sharper answer, ask me to inspect one source from that trail.' : 'The missing piece is the named source trail. I should not invent names without it.'
  ].join('\n');
}
function simpleWorkstreamName(value=''){
  return compactText(value,160).replace(/^[-*\d.\s]+/,'').replace(/\s*[\-:]+\s*(owner|first move|milestone|dependency|monitor)\s*:.*/i,'').trim();
}
function uniqueNames(values=[]){
  const seen=new Set();
  return values.map((value)=>typeof value === 'string' ? value : (value?.name || value?.title || value?.label || ''))
    .map(simpleWorkstreamName)
    .filter(Boolean)
    .filter((name)=>{
      const key=name.toLowerCase();
      if(seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}
function parseWorkstreamNames(answer=''){
  const text=String(answer || '').trim();
  if(!text) return [];
  return uniqueNames(text.split(/\n|,|;/).map((line)=>line.replace(/^\s*(?:workstreams?|lanes?)\s*:\s*/i,'')));
}
function answerAcceptsProposal(answer=''){
  return /^(yes|yep|yeah|use (?:those|them|the suggestions)|looks right|that works|go ahead)\b/i.test(String(answer || '').trim());
}
function coworkTurnLooksConversational(answer=''){
  const text=String(answer || '').trim();
  if(!text)return false;
  if(/[?]\s*$/.test(text))return true;
  return /^(?:what|why|how|who|which|where|when|can|could|would|should|do you|are you|is there|tell me|show me|help me(?: understand)?|walk me through|talk me through|point out|explain|let'?s think|i (?:do not|don't) understand|i(?:'m| am) (?:not sure|unsure)|this feels wrong|that (?:does not|doesn't) seem right|give me your (?:read|take|thoughts?))\b/i.test(text);
}
function scopedConversationFallbackReply({workingBrief={},answer='',question=null}={}){
  const text=String(answer||'').toLowerCase();
  const title=compactText(
    workingBrief.projectName || workingBrief.relationshipName ||
    workingBrief.transcriptTitle || workingBrief.subject ||
    workingBrief.title || 'this work',
    180
  );
  const sourceLines=safeArray(workingBrief.sourceRefs)
    .map((ref)=>compactText(ref?.quote_or_summary || ref?.quoteOrSummary || ref?.summary || ref,420))
    .filter(Boolean)
    .slice(0,3);
  const objective=compactText(workingBrief.objective||'',420);
  const completion=compactText(workingBrief.completionCondition||'',420);
  const nextQuestion=compactText(question?.question||'',500);
  const asksEvidence=/\b(evidence|source|proof|where.*come from|what do you know)\b/i.test(text);
  const asksWhy=/\b(why|matter|important|point)\b/i.test(text);
  const asksWhat=/\b(what|clarify|missing|first|next|see|notice|understand)\b/i.test(text);
  if(asksEvidence){
    return [
      `Here is what I can actually point to for ${title}:`,
      sourceLines.length ? sourceLines.map((line)=>'- '+line).join('\n') : '- This folder does not have a readable source receipt attached yet.',
      '',
      nextQuestion || 'Which part of that evidence do you want to examine more closely?'
    ].join('\n');
  }
  if(asksWhy){
    return [
      objective || `The point of this conversation is to make ${title} clear enough to move.`,
      completion ? `We will know it is ready when ${completion.charAt(0).toLowerCase()+completion.slice(1)}` : '',
      sourceLines[0] ? `The source I am using is: ${sourceLines[0]}` : '',
      '',
      nextQuestion || 'What feels most consequential about this to you?'
    ].filter(Boolean).join('\n');
  }
  if(asksWhat){
    return [
      `For ${title}, I would clarify this first:`,
      nextQuestion || objective || 'the one missing fact that determines the next move.',
      sourceLines[0] ? `What I already have: ${sourceLines[0]}` : '',
      sourceLines[1] ? `I also have: ${sourceLines[1]}` : ''
    ].filter(Boolean).join('\n');
  }
  return [
    `I have ${title} open and I did not change it.`,
    objective ? `The work in front of us is ${objective.charAt(0).toLowerCase()+objective.slice(1)}` : '',
    nextQuestion || 'What do you want to understand or move forward first?'
  ].filter(Boolean).join('\n');
}
function workstreamTemplate(name='',brief={}){
  return {
    id:stableKey(`workstream_${name}`),
    name:compactText(name,160),
    purpose:'',
    accountableOwner:'',
    currentState:'planned',
    firstConcreteMove:'',
    milestone:'',
    dependencies:'',
    monitoringSignal:'',
    linkedPeople:safeArray(brief.linkedPeople).map((item)=>compactText(item,140)).filter(Boolean),
    sourceRefs:safeArray(brief.sourceRefs).map(sourceRef)
  };
}
function normalizeWorkstream(value={},brief={}){
  const raw=typeof value === 'string' ? {name:value} : (value || {});
  const template=workstreamTemplate(raw.name || raw.title || raw.label || '',brief);
  return {
    ...template,
    ...raw,
    id:compactText(raw.id || template.id,220),
    name:compactText(raw.name || raw.title || raw.label || template.name,160),
    purpose:compactText(raw.purpose || raw.outcome || '',500),
    accountableOwner:compactText(raw.accountableOwner || raw.owner || '',180),
    currentState:compactText(raw.currentState || raw.status || template.currentState,160),
    firstConcreteMove:compactText(raw.firstConcreteMove || raw.firstMove || raw.nextMove || '',500),
    milestone:compactText(raw.milestone || raw.proofOfProgress || '',500),
    dependencies:compactText(raw.dependencies || raw.blocker || '',500),
    monitoringSignal:compactText(raw.monitoringSignal || raw.monitor || '',500),
    linkedPeople:uniqueNames(raw.linkedPeople || raw.people || template.linkedPeople),
    sourceRefs:safeArray(raw.sourceRefs || template.sourceRefs).map(sourceRef)
  };
}
function missingWorkstreamFields(workstream={}){
  const labels=[];
  if(!compactText(workstream.purpose)) labels.push('purpose');
  if(!compactText(workstream.accountableOwner)) labels.push('owner');
  if(!compactText(workstream.firstConcreteMove)) labels.push('first move');
  if(!compactText(workstream.milestone)) labels.push('milestone');
  if(!compactText(workstream.monitoringSignal)) labels.push('monitoring signal');
  return labels;
}
function parseLabeledWorkstreamDetails(answer='',workstreams=[]){
  const byName=new Map(safeArray(workstreams).map((item)=>[String(item.name || '').toLowerCase(),{...item}]));
  const lines=String(answer || '').split(/\n+/).map((line)=>line.trim()).filter(Boolean);
  for(const line of lines){
    const [rawName,...detailParts]=line.split(/\s+[\-\u2013\u2014]\s+/);
    const candidateName=simpleWorkstreamName(rawName);
    const target=byName.get(candidateName.toLowerCase()) || (byName.size === 1 ? [...byName.values()][0] : null);
    if(!target) continue;
    const detail=detailParts.join(' ') || line;
    const capture=(labels)=>{
      const match=detail.match(new RegExp(`(?:^|[;|])\\s*(?:${labels})\\s*:\\s*([^;|]+)`, 'i'));
      return compactText(match?.[1] || '',500);
    };
    target.purpose=capture('purpose|outcome') || target.purpose;
    target.accountableOwner=capture('owner|accountable owner') || target.accountableOwner;
    target.firstConcreteMove=capture('first move|next move|first concrete move') || target.firstConcreteMove;
    target.milestone=capture('milestone|proof') || target.milestone;
    target.dependencies=capture('dependency|dependencies|blocker') || target.dependencies;
    target.monitoringSignal=capture('monitoring signal|monitoring|monitor|signal') || target.monitoringSignal;
    byName.set(String(target.name || '').toLowerCase(),target);
  }
  return [...byName.values()];
}
function entryQuestion(state={},brief={}){
  const stage=state.stage || 'project_outcome';
  const proposed=uniqueNames(state.proposedWorkstreams || []);
  if(stage === 'project_outcome'){
    return {
      targetField:'project_identity_packet.desired_outcome',
      question:`Before I build workstreams for ${brief.projectName || 'this project'}, what outcome should the project create?`,
      detail:'The answer fills Project Managers > What this is and lets VAL judge which workstreams are actually necessary.'
    };
  }
  if(stage === 'confirm_lanes'){
    const names=proposed.length ? proposed.join(', ') : 'no lanes yet';
    return {
      targetField:'project_workstreams[].name',
      question:proposed.length
        ? `I can start with these workstreams: ${names}. Should I use them as written, or what should I add, merge, remove, or rename?`
        : `What are the 2 to 6 major lanes of work needed to achieve "${brief.desiredOutcome}"?`,
      detail:'This answer creates the named workstreams. It does not create tasks.'
    };
  }
  if(stage === 'workstream_details'){
    const incomplete=safeArray(state.draftWorkstreams).filter((item)=>missingWorkstreamFields(item).length);
    if(!incomplete.length){
      return {targetField:'project_workstreams',question:'The workstreams are ready for review.',detail:'Review the prepared set, then apply it to Project Managers.'};
    }
    const examples=incomplete.map((item)=>`${item.name} - ${missingWorkstreamFields(item).join(': ...; ')}: ...`).join('\n');
    return {
      targetField:'project_workstreams[].{purpose,accountable_owner,first_concrete_move,milestone,monitoring_signal}',
      question:`Fill only the missing details below.\n\n${examples}`,
      detail:'Use labels exactly as shown. VAL will ask again only for fields that remain blank. Dependencies are optional; write "dependency: none" when there is no known dependency.'
    };
  }
  return {targetField:'project_workstreams',question:'Review the prepared workstreams, then apply them when they are true.',detail:'No external action happens from this step.'};
}
function buildProjectWorkstreamsBrief(project={},input={}){
  const metadata=project.metadataJson || project.metadata || {};
  const sourceDetails=project.sourceDetails || metadata.sourceDetails || {};
  const linkedPeople=uniqueNames([metadata.owner?.name,project.nextStepOwner,sourceDetails.relationships,metadata.intake?.relationships,project.relationships].filter(Boolean));
  const references=[
    sourceRef({sourceType:'project_packet',sourceId:project.projectId || project.id || input.scope?.entityId || '',quoteOrSummary:project.sourceReceipts || project.reality || project.summary || 'Project packet'}),
    sourceDetails.documents && sourceRef({sourceType:'document',sourceId:project.projectId || project.id || '',quoteOrSummary:`Project documents: ${sourceDetails.documents}`}),
    sourceDetails.rawContext && sourceRef({sourceType:'project_context',sourceId:project.projectId || project.id || '',quoteOrSummary:sourceDetails.rawContext})
  ].filter(Boolean);
  const providedSuggestions=uniqueNames(input.suggestedWorkstreams || input.suggested_workstreams || []);
  const existing=uniqueNames(project.workstreams || metadata.workstreams || []);
  return {
    id:stableKey(`working_brief_project_workstreams_${project.projectId || project.id || input.scope?.entityId || project.name}`),
    entrypointId:'project.workstreams',
    entityType:'project_section',
    entityId:String(project.projectId || project.id || input.scope?.entityId || ''),
    sectionId:'workstreams',
    projectName:compactText(project.name || project.displayName || metadata.projectName || 'Project',180),
    desiredOutcome:compactText(project.desiredOutcome || project.outcome || metadata.desiredOutcome || metadata.outcome || '',500),
    currentPhase:compactText(project.projectPhase || metadata.projectPhase || project.status || '',180),
    currentReality:compactText(project.reality || project.summary || '',900),
    linkedPeople,
    sourceRefs:references,
    existingWorkstreams:safeArray(project.workstreams || metadata.workstreams).map((item)=>normalizeWorkstream(item,{})),
    suggestedWorkstreams:providedSuggestions.length ? providedSuggestions : existing,
    objective:'Build a complete, manageable set of project workstreams from the selected Project Managers section.',
    completionCondition:'Every retained workstream has a purpose, accountable owner, first concrete move, milestone, monitoring signal, linked people, and source references.',
    approvalBoundary:'Applying the workstreams changes only the internal Project Managers packet. It does not create tasks, update CRM, send a message, schedule anything, or alter a source document.'
  };
}

function milestoneWorkstreamCandidate(value='',workstreams=[]){
  const needle=compactText(value,180).toLowerCase();
  if(!needle) return null;
  return safeArray(workstreams).find((workstream)=>{
    const name=compactText(workstream?.name || workstream?.title || workstream?.label || workstream,180).toLowerCase();
    return name === needle;
  }) || null;
}
function milestoneTemplate(value={},brief={}){
  const raw=typeof value === 'string' ? {checkpoint:value} : (value || {});
  const workstreamName=compactText(raw.workstreamName || raw.workstream || raw.workstream_name || raw.lane || '',180);
  const matched=milestoneWorkstreamCandidate(workstreamName,brief.existingWorkstreams);
  const checkpoint=compactText(raw.checkpoint || raw.title || raw.name || raw.milestone || raw.proofOfProgress || '',500);
  return {
    id:compactText(raw.id || stableKey(`project_milestone_${matched?.id || workstreamName}_${checkpoint}`),220),
    workstreamId:compactText(raw.workstreamId || raw.workstream_id || matched?.id || '',220),
    workstreamName:matched?.name || workstreamName,
    checkpoint,
    completionSignal:compactText(raw.completionSignal || raw.completion_signal || raw.evidence || raw.proof || raw.doneWhen || '',500),
    timingOrTrigger:compactText(raw.timingOrTrigger || raw.timing_or_trigger || raw.timing || raw.trigger || raw.when || '',300),
    sourceRefs:safeArray(raw.sourceRefs || brief.sourceRefs).map(sourceRef)
  };
}
function normalizeProjectMilestone(value={},brief={}){
  return milestoneTemplate(value,brief);
}
function missingProjectMilestoneFields(milestone={},brief={}){
  const missing=[];
  const known=milestoneWorkstreamCandidate(milestone.workstreamName || milestone.workstreamId,brief.existingWorkstreams);
  if(!known) missing.push('existing workstream');
  if(!compactText(milestone.checkpoint)) missing.push('checkpoint');
  if(!compactText(milestone.completionSignal)) missing.push('completion signal');
  if(!compactText(milestone.timingOrTrigger)) missing.push('timing or trigger');
  return missing;
}
function milestoneValueFromLine(line='',labels=''){
  const match=String(line || '').match(new RegExp(`(?:^|[;|])\\s*(?:${labels})\\s*:\\s*([^;|]+)`, 'i'));
  return compactText(match?.[1] || '',500);
}
function projectMilestoneLine(value={},brief={}){
  const milestone=normalizeProjectMilestone(value,brief);
  return [
    milestone.workstreamName || 'Workstream',
    'checkpoint: ' + (milestone.checkpoint || '...'),
    'completion signal: ' + (milestone.completionSignal || '...'),
    'timing or trigger: ' + (milestone.timingOrTrigger || '...')
  ].join(' | ');
}
function parseProjectMilestoneLine(line='',brief={}){
  const source=String(line || '').trim();
  const parts=source.split('|').map((part)=>part.trim()).filter(Boolean);
  const known=safeArray(brief.existingWorkstreams);
  const labeledWorkstream=milestoneValueFromLine(source,'workstream|lane');
  let workstreamName=labeledWorkstream;
  let checkpoint=milestoneValueFromLine(source,'checkpoint|milestone|proof point');
  let completionSignal=milestoneValueFromLine(source,'completion signal|evidence|proof|done when');
  let timingOrTrigger=milestoneValueFromLine(source,'timing or trigger|timing|trigger|when');
  if(parts.length >= 4){
    workstreamName=workstreamName || parts[0].replace(/^\s*(?:workstream|lane)\s*:\s*/i,'');
    checkpoint=checkpoint || parts[1].replace(/^\s*(?:checkpoint|milestone|proof point)\s*:\s*/i,'');
    completionSignal=completionSignal || parts[2].replace(/^\s*(?:completion signal|evidence|proof|done when)\s*:\s*/i,'');
    timingOrTrigger=timingOrTrigger || parts[3].replace(/^\s*(?:timing or trigger|timing|trigger|when)\s*:\s*/i,'');
  }else if(!workstreamName){
    const matched=known.find((workstream)=>source.toLowerCase().startsWith(String(workstream.name || '').toLowerCase() + ' - '));
    if(matched){
      workstreamName=matched.name;
      const details=source.slice(String(matched.name).length + 3);
      checkpoint=checkpoint || milestoneValueFromLine(details,'checkpoint|milestone|proof point');
      completionSignal=completionSignal || milestoneValueFromLine(details,'completion signal|evidence|proof|done when');
      timingOrTrigger=timingOrTrigger || milestoneValueFromLine(details,'timing or trigger|timing|trigger|when');
    }
  }
  return milestoneTemplate({workstreamName,checkpoint,completionSignal,timingOrTrigger},brief);
}
function parseProjectMilestones(answer='',brief={},current=[]){
  const source=multilineText(answer,5000);
  const lines=source.split(/\n+/).map((line)=>line.replace(/^\s*(?:milestones?|checkpoints?)\s*:\s*/i,'').trim()).filter(Boolean);
  if(!lines.length) return safeArray(current).map((item)=>normalizeProjectMilestone(item,brief));
  const next=safeArray(current).map((item)=>normalizeProjectMilestone(item,brief));
  for(const line of lines){
    const candidate=parseProjectMilestoneLine(line,brief);
    const key=[candidate.workstreamName,candidate.checkpoint].map((value)=>String(value || '').toLowerCase()).join('|');
    const index=next.findIndex((item)=>[item.workstreamName,item.checkpoint].map((value)=>String(value || '').toLowerCase()).join('|')===key);
    if(index >= 0) next[index]={...next[index],...candidate,id:next[index].id || candidate.id};
    else if(next.length === 1 && missingProjectMilestoneFields(next[0],brief).length) next[0]={...next[0],...candidate,id:next[0].id || candidate.id};
    else next.push(candidate);
  }
  const seen=new Set();
  return next.filter((item)=>{
    const key=[item.workstreamName,item.checkpoint,item.completionSignal,item.timingOrTrigger].join('|').toLowerCase();
    if(seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function buildProjectMilestonesBrief(project={},input={}){
  const metadata=project.metadataJson || project.metadata || {};
  const workstreams=safeArray(project.workstreams || metadata.workstreams).map((item)=>normalizeWorkstream(item,{}));
  const references=projectIdentityReferences(project,input);
  const existingMilestones=safeArray(project.milestones || metadata.milestones).map((item)=>normalizeProjectMilestone(item,{existingWorkstreams:workstreams,sourceRefs:references}));
  return {
    id:stableKey(`working_brief_project_milestones_${project.projectId || project.id || input.scope?.entityId || project.name}`),
    entrypointId:'project.milestones',
    entityType:'project_section',
    entityId:String(project.projectId || project.id || input.scope?.entityId || ''),
    sectionId:'milestones',
    projectName:compactText(project.name || project.displayName || metadata.projectName || 'Project',180),
    existingWorkstreams:workstreams,
    existingMilestones,
    sourceRefs:references,
    objective:'Define evidence-based checkpoints for the selected project without inventing work outside its existing workstreams.',
    completionCondition:'Every milestone is attached to an existing workstream and names a checkpoint, concrete completion signal, and timing or trigger.',
    approvalBoundary:'Applying milestones changes only the internal Project Managers packet. It does not create tasks, update CRM, send a message, schedule anything, or alter a source document.'
  };
}
function projectMilestonesQuestion(state={},brief={}){
  const workstreamNames=safeArray(brief.existingWorkstreams).map((item)=>item.name).filter(Boolean);
  const milestones=safeArray(state.draftMilestones);
  if(!workstreamNames.length){
    return {
      targetField:'project_sop_packet.default_workstreams',
      question:`Milestones for ${brief.projectName || 'this project'} need its named workstreams first.`,
      detail:'Open Project Managers > Workstreams, complete that reviewed packet, then reopen Milestones. VAL will not invent lanes just to make a milestone list.'
    };
  }
  if(state.stage === 'milestones'){
    return {
      targetField:'project_milestone_packet[].{workstream_name,checkpoint,completion_signal,timing_or_trigger}',
      question:`What checkpoints prove ${brief.projectName || 'this project'} is moving? Add one line per checkpoint using an existing workstream: Workstream | checkpoint | completion signal | timing or trigger.`,
      detail:`This fills Project Managers > Milestones. Existing workstreams: ${workstreamNames.join(', ')}. A completion signal is the concrete evidence that the checkpoint is true; no task or calendar event is created.`
    };
  }
  if(state.stage === 'milestone_details'){
    const incomplete=milestones.filter((milestone)=>missingProjectMilestoneFields(milestone,brief).length);
    return {
      targetField:'project_milestone_packet[].{workstream_name,checkpoint,completion_signal,timing_or_trigger}',
      question:`Fill only the missing details below.\n\n${incomplete.map((milestone)=>projectMilestoneLine(milestone,brief)).join('\n')}`,
      detail:`Use the same one-line format. Workstream must be one of: ${workstreamNames.join(', ')}.`
    };
  }
  return {
    targetField:'project_milestone_packet',
    question:'Review the prepared milestones, then apply them to this Project Manager.',
    detail:'Applying changes only the selected internal Milestones packet. Nothing external happens.'
  };
}

function monitoringRuleTemplate(value={},brief={}){
  const raw=typeof value === 'string' ? {watchItem:value} : (value || {});
  const watchItem=compactText(raw.watchItem || raw.watch_item || raw.signal || raw.monitor || raw.name || raw.title || '',500);
  return {
    id:compactText(raw.id || stableKey(`project_monitoring_${watchItem}`),220),
    watchItem,
    cadence:compactText(raw.cadence || raw.reviewCadence || raw.review_cadence || '',180),
    escalationTrigger:compactText(raw.escalationTrigger || raw.escalation_trigger || raw.trigger || raw.threshold || raw.alertWhen || '',500),
    executiveAction:compactText(raw.executiveAction || raw.executive_action || raw.actionWhenEscalated || raw.escalationAction || raw.action || '',500),
    sourceRefs:safeArray(raw.sourceRefs || brief.sourceRefs).map(sourceRef)
  };
}
function normalizeMonitoringRule(value={},brief={}){
  return monitoringRuleTemplate(value,brief);
}
function missingMonitoringRuleFields(rule={}){
  const missing=[];
  if(!compactText(rule.watchItem)) missing.push('watch item');
  if(!compactText(rule.cadence)) missing.push('cadence');
  if(!compactText(rule.escalationTrigger)) missing.push('escalation trigger');
  if(!compactText(rule.executiveAction)) missing.push('what VAL should surface');
  return missing;
}
function monitoringValueFromLine(line='',labels=''){
  return milestoneValueFromLine(line,labels);
}
function monitoringRuleLine(value={},brief={}){
  const rule=normalizeMonitoringRule(value,brief);
  return [
    rule.watchItem || 'Watch item',
    'cadence: ' + (rule.cadence || '...'),
    'escalate when: ' + (rule.escalationTrigger || '...'),
    'surface: ' + (rule.executiveAction || '...')
  ].join(' | ');
}
function parseMonitoringRuleLine(line='',brief={}){
  const source=String(line || '').trim();
  const parts=source.split('|').map((part)=>part.trim()).filter(Boolean);
  let watchItem=monitoringValueFromLine(source,'watch item|watch|signal|monitor');
  let cadence=monitoringValueFromLine(source,'cadence|review cadence|review');
  let escalationTrigger=monitoringValueFromLine(source,'escalate when|escalation trigger|trigger|threshold|alert when');
  let executiveAction=monitoringValueFromLine(source,'surface|what val should surface|executive action|action when escalated|action');
  if(parts.length >= 4){
    watchItem=watchItem || parts[0].replace(/^\s*(?:watch item|watch|signal|monitor)\s*:\s*/i,'');
    cadence=cadence || parts[1].replace(/^\s*(?:cadence|review cadence|review)\s*:\s*/i,'');
    escalationTrigger=escalationTrigger || parts[2].replace(/^\s*(?:escalate when|escalation trigger|trigger|threshold|alert when)\s*:\s*/i,'');
    executiveAction=executiveAction || parts[3].replace(/^\s*(?:surface|what val should surface|executive action|action when escalated|action)\s*:\s*/i,'');
  }
  return normalizeMonitoringRule({watchItem,cadence,escalationTrigger,executiveAction},brief);
}
function parseMonitoringRules(answer='',brief={},current=[]){
  const lines=multilineText(answer,5000).split(/\n+/).map((line)=>line.replace(/^\s*(?:monitoring rules?|watch items?)\s*:\s*/i,'').trim()).filter(Boolean);
  if(!lines.length) return safeArray(current).map((item)=>normalizeMonitoringRule(item,brief));
  const next=safeArray(current).map((item)=>normalizeMonitoringRule(item,brief));
  for(const line of lines){
    const candidate=parseMonitoringRuleLine(line,brief);
    const key=String(candidate.watchItem || '').toLowerCase();
    const index=next.findIndex((item)=>String(item.watchItem || '').toLowerCase()===key);
    if(index >= 0) next[index]={...next[index],...candidate,id:next[index].id || candidate.id};
    else if(next.length === 1 && missingMonitoringRuleFields(next[0]).length) next[0]={...next[0],...candidate,id:next[0].id || candidate.id};
    else next.push(candidate);
  }
  const seen=new Set();
  return next.filter((item)=>{
    const key=[item.watchItem,item.cadence,item.escalationTrigger,item.executiveAction].join('|').toLowerCase();
    if(seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function buildProjectMonitoringBrief(project={},input={}){
  const metadata=project.metadataJson || project.metadata || {};
  const workstreams=safeArray(project.workstreams || metadata.workstreams).map((item)=>normalizeWorkstream(item,{}));
  const references=projectIdentityReferences(project,input);
  const existingRules=safeArray(project.monitoringRules || metadata.monitoringRules).map((item)=>normalizeMonitoringRule(item,{sourceRefs:references}));
  const workstreamSignals=workstreams.map((item)=>({workstreamName:item.name,signal:item.monitoringSignal})).filter((item)=>item.workstreamName && item.signal);
  return {
    id:stableKey(`working_brief_project_monitoring_${project.projectId || project.id || input.scope?.entityId || project.name}`),
    entrypointId:'project.monitoring',
    entityType:'project_section',
    entityId:String(project.projectId || project.id || input.scope?.entityId || ''),
    sectionId:'monitoring_rules',
    projectName:compactText(project.name || project.displayName || metadata.projectName || 'Project',180),
    currentPhase:compactText(project.projectPhase || metadata.projectPhase || project.status || '',180),
    existingRules,
    workstreamSignals,
    sourceRefs:references,
    objective:'Define the project-specific monitoring rules that let VAL watch progress quietly and escalate only when executive attention is useful.',
    completionCondition:'Every monitoring rule names a watch item, cadence, escalation trigger, and what VAL should surface for the executive.',
    approvalBoundary:'Applying monitoring rules changes only the internal Project Managers packet. It does not create tasks, alerts, messages, CRM updates, calendar changes, or alter source documents.'
  };
}
function projectMonitoringQuestion(state={},brief={}){
  const rules=safeArray(state.draftMonitoringRules);
  const signals=safeArray(brief.workstreamSignals).map((item)=>`${item.workstreamName}: ${item.signal}`).join('; ');
  if(state.stage === 'monitoring'){
    return {
      targetField:'project_monitoring_packet[].{watch_item,cadence,escalation_trigger,executive_action}',
      question:`What should VAL watch for ${brief.projectName || 'this project'}, how often, and what should make it surface the issue to you? Add one line per rule: watch item | cadence | escalate when | surface.`,
      detail:`This fills Project Managers > Monitoring after launch. ${signals ? 'Current workstream signals: ' + signals + '. ' : ''}A rule watches quietly until its stated trigger is true; it does not create an alert or task by itself.`
    };
  }
  if(state.stage === 'monitoring_details'){
    const incomplete=rules.filter((rule)=>missingMonitoringRuleFields(rule).length);
    return {
      targetField:'project_monitoring_packet[].{watch_item,cadence,escalation_trigger,executive_action}',
      question:`Fill only the missing details below.\n\n${incomplete.map((rule)=>monitoringRuleLine(rule,brief)).join('\n')}`,
      detail:'Use the same one-line format. The escalation trigger should name the observable change, not a generic feeling.'
    };
  }
  return {
    targetField:'project_monitoring_packet',
    question:'Review the prepared monitoring rules, then apply them to this Project Manager.',
    detail:'Applying changes only the selected internal monitoring packet. Nothing external happens.'
  };
}

function nurtureRelationshipCandidate(value='',candidates=[]){
  const needle=compactText(value,220).toLowerCase();
  if(!needle) return null;
  return safeArray(candidates).find((candidate)=>[candidate.id,candidate.name,candidate.email].filter(Boolean).some((item)=>String(item).toLowerCase() === needle)) || null;
}
function relationshipNurtureRuleTemplate(value={},brief={}){
  const raw=typeof value === 'string' ? {relationshipName:value} : (value || {});
  const candidate=nurtureRelationshipCandidate(raw.relationshipId || raw.relationship_id || raw.relationshipName || raw.relationship_name || raw.name || raw.relationship || '',brief.linkedRelationships);
  const relationshipName=compactText(candidate?.name || raw.relationshipName || raw.relationship_name || raw.name || raw.relationship || '',180);
  return {
    id:compactText(raw.id || stableKey(`project_relationship_nurture_${candidate?.id || relationshipName}`),220),
    relationshipId:compactText(candidate?.id || raw.relationshipId || raw.relationship_id || '',220),
    relationshipName,
    cadence:compactText(raw.cadence || raw.reviewCadence || raw.review_cadence || '',180),
    usefulTouch:compactText(raw.usefulTouch || raw.useful_touch || raw.valueToBring || raw.value_to_bring || raw.touch || '',500),
    trustRisk:compactText(raw.trustRisk || raw.trust_risk || raw.risk || raw.sensitivity || '',500),
    reviewTrigger:compactText(raw.reviewTrigger || raw.review_trigger || raw.trigger || raw.whenToReview || '',500),
    sourceRefs:safeArray(raw.sourceRefs || brief.sourceRefs).map(sourceRef)
  };
}
function normalizeRelationshipNurtureRule(value={},brief={}){
  return relationshipNurtureRuleTemplate(value,brief);
}
function missingRelationshipNurtureFields(rule={},brief={}){
  const missing=[];
  if(!nurtureRelationshipCandidate(rule.relationshipId || rule.relationshipName,brief.linkedRelationships)) missing.push('existing project relationship');
  if(!compactText(rule.cadence)) missing.push('cadence');
  if(!compactText(rule.usefulTouch)) missing.push('useful touch');
  if(!compactText(rule.trustRisk)) missing.push('trust risk');
  if(!compactText(rule.reviewTrigger)) missing.push('review trigger');
  return missing;
}
function relationshipNurtureLine(value={},brief={}){
  const rule=normalizeRelationshipNurtureRule(value,brief);
  return [
    rule.relationshipName || 'Relationship',
    'cadence: ' + (rule.cadence || '...'),
    'useful touch: ' + (rule.usefulTouch || '...'),
    'trust risk: ' + (rule.trustRisk || '...'),
    'review trigger: ' + (rule.reviewTrigger || '...')
  ].join(' | ');
}
function parseRelationshipNurtureLine(line='',brief={}){
  const source=String(line || '').trim();
  const parts=source.split('|').map((part)=>part.trim()).filter(Boolean);
  let relationshipName=monitoringValueFromLine(source,'relationship|person|name');
  let cadence=monitoringValueFromLine(source,'cadence|review cadence|review');
  let usefulTouch=monitoringValueFromLine(source,'useful touch|value to bring|value|touch');
  let trustRisk=monitoringValueFromLine(source,'trust risk|risk|sensitivity');
  let reviewTrigger=monitoringValueFromLine(source,'review trigger|trigger|when to review|review when');
  if(parts.length >= 5){
    relationshipName=relationshipName || parts[0].replace(/^\s*(?:relationship|person|name)\s*:\s*/i,'');
    cadence=cadence || parts[1].replace(/^\s*(?:cadence|review cadence|review)\s*:\s*/i,'');
    usefulTouch=usefulTouch || parts[2].replace(/^\s*(?:useful touch|value to bring|value|touch)\s*:\s*/i,'');
    trustRisk=trustRisk || parts[3].replace(/^\s*(?:trust risk|risk|sensitivity)\s*:\s*/i,'');
    reviewTrigger=reviewTrigger || parts[4].replace(/^\s*(?:review trigger|trigger|when to review|review when)\s*:\s*/i,'');
  }
  return normalizeRelationshipNurtureRule({relationshipName,cadence,usefulTouch,trustRisk,reviewTrigger},brief);
}
function parseRelationshipNurtureRules(answer='',brief={},current=[]){
  const lines=multilineText(answer,5000).split(/\n+/).map((line)=>line.replace(/^\s*(?:relationship nurture|nurture rules?)\s*:\s*/i,'').trim()).filter(Boolean);
  if(!lines.length) return safeArray(current).map((item)=>normalizeRelationshipNurtureRule(item,brief));
  const next=safeArray(current).map((item)=>normalizeRelationshipNurtureRule(item,brief));
  for(const line of lines){
    const candidate=parseRelationshipNurtureLine(line,brief);
    const key=String(candidate.relationshipId || candidate.relationshipName || '').toLowerCase();
    const index=next.findIndex((item)=>String(item.relationshipId || item.relationshipName || '').toLowerCase()===key);
    if(index >= 0) next[index]={...next[index],...candidate,id:next[index].id || candidate.id};
    else if(next.length === 1 && missingRelationshipNurtureFields(next[0],brief).length) next[0]={...next[0],...candidate,id:next[0].id || candidate.id};
    else next.push(candidate);
  }
  const seen=new Set();
  return next.filter((item)=>{
    const key=[item.relationshipId,item.relationshipName,item.cadence,item.usefulTouch,item.trustRisk,item.reviewTrigger].join('|').toLowerCase();
    if(seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function buildProjectRelationshipNurtureBrief(project={},input={}){
  const metadata=project.metadataJson || project.metadata || {};
  const recorded=safeArray(project.projectPeople || metadata.projectPeople);
  const linkedRelationships=recorded.map((person)=>relationshipCandidate({
    id:person.relationshipId || person.relationship_id || person.id,
    displayName:person.name || person.displayName,
    email:person.email,
    role:person.role
  })).filter((candidate)=>candidate.id && candidate.name);
  const references=projectIdentityReferences(project,input);
  const existingRules=safeArray(project.relationshipNurtureRules || metadata.relationshipNurtureRules).map((item)=>normalizeRelationshipNurtureRule(item,{linkedRelationships,sourceRefs:references}));
  return {
    id:stableKey(`working_brief_project_relationship_nurture_${project.projectId || project.id || input.scope?.entityId || project.name}`),
    entrypointId:'project.relationship_nurture',
    entityType:'project_section',
    entityId:String(project.projectId || project.id || input.scope?.entityId || ''),
    sectionId:'relationship_nurture',
    projectName:compactText(project.name || project.displayName || metadata.projectName || 'Project',180),
    linkedRelationships,
    existingRules,
    sourceRefs:references,
    objective:'Protect the selected project relationships with clear, useful nurture rules instead of generic follow-up.',
    completionCondition:'Each rule is attached to an existing project relationship and names a cadence, useful touch, trust risk, and review trigger.',
    approvalBoundary:'Applying nurture rules changes only the internal Project Managers packet. It does not draft or send outreach, create a task, update CRM, schedule anything, or alter source evidence.'
  };
}
function projectRelationshipNurtureQuestion(state={},brief={}){
  const rules=safeArray(state.draftRelationshipNurtureRules);
  const relationships=safeArray(brief.linkedRelationships).map((item)=>item.name).join(', ');
  if(!safeArray(brief.linkedRelationships).length){
    return {
      targetField:'project_relationships_packet',
      question:`Relationship nurture for ${brief.projectName || 'this project'} needs an existing project-linked relationship first.`,
      detail:'Open Project Managers > People involved, link the relationship and role, apply that internal packet, then reopen Relationship nurture. VAL will not invent or attach a relationship from a generic name.'
    };
  }
  if(state.stage === 'relationship_nurture'){
    return {
      targetField:'project_relationship_nurture_packet[].{relationship_name,cadence,useful_touch,trust_risk,review_trigger}',
      question:`How should VAL protect the relationships that make ${brief.projectName || 'this project'} viable? Add one line per existing project relationship: Relationship | cadence | useful touch | trust risk | review trigger.`,
      detail:`This fills Project Managers > Relationship nurture. Existing linked relationships: ${relationships}. A useful touch gives value; this does not draft or send outreach.`
    };
  }
  if(state.stage === 'relationship_nurture_details'){
    const incomplete=rules.filter((rule)=>missingRelationshipNurtureFields(rule,brief).length);
    return {
      targetField:'project_relationship_nurture_packet[].{relationship_name,cadence,useful_touch,trust_risk,review_trigger}',
      question:`Fill only the missing details below.\n\n${incomplete.map((rule)=>relationshipNurtureLine(rule,brief)).join('\n')}`,
      detail:'Use the same one-line format. Keep a useful touch distinct from the trust risk it is meant to protect.'
    };
  }
  return {
    targetField:'project_relationship_nurture_packet',
    question:'Review the prepared relationship nurture rules, then apply them to this Project Manager.',
    detail:'Applying changes only the selected internal relationship-nurture packet. Nothing external happens.'
  };
}

function projectRiskOwnerCandidate(value='',candidates=[]){
  return nurtureRelationshipCandidate(value,candidates);
}
function projectRiskTemplate(value={},brief={}){
  const raw=typeof value === 'string' ? {riskSummary:value} : (value || {});
  const assessment=compactText(raw.assessment || raw.status || raw.riskStatus || '',80).toLowerCase() === 'no_material_risk' ? 'no_material_risk' : 'material_risk';
  const ownerCandidate=projectRiskOwnerCandidate(raw.ownerId || raw.owner_id || raw.ownerName || raw.owner_name || raw.owner || raw.accountableOwner || raw.accountable_owner || '',brief.linkedRelationships);
  const impact=compactText(raw.impact || raw.whyItMatters || raw.why_it_matters || raw.ifIgnored || raw.if_ignored || '',500);
  return {
    id:compactText(raw.id || stableKey(`project_risk_${brief.entityId || brief.projectName || 'project'}_${raw.riskSummary || raw.risk_summary || raw.risk || raw.reviewBasis || raw.review_basis || ''}`),220),
    assessment,
    riskType:compactText(raw.riskType || raw.risk_type || raw.type || '',180),
    riskSummary:compactText(raw.riskSummary || raw.risk_summary || raw.risk || raw.summary || '',500),
    impact,
    severity:compactText(raw.severity || '',100),
    ownerId:compactText(ownerCandidate?.id || raw.ownerId || raw.owner_id || '',220),
    ownerName:compactText(ownerCandidate?.name || raw.ownerName || raw.owner_name || raw.owner || raw.accountableOwner || raw.accountable_owner || '',180),
    mitigation:compactText(raw.mitigation || raw.mitigationNextStep || raw.mitigation_next_step || raw.protectiveMove || raw.protective_move || '',500),
    watchCondition:compactText(raw.watchCondition || raw.watch_condition || raw.trigger || raw.whenToSurface || raw.when_to_surface || '',500),
    confidence:compactText(raw.confidence || '',120),
    reviewBasis:compactText(raw.reviewBasis || raw.review_basis || raw.basis || raw.reason || '',500),
    sourceRefs:safeArray(raw.sourceRefs || raw.source_refs || brief.sourceRefs).map(sourceRef)
  };
}
function normalizeProjectRisk(value={},brief={}){
  return projectRiskTemplate(value,brief);
}
function projectRiskHasMaterialAssessment(risk={}){
  return risk.assessment !== 'no_material_risk';
}
function missingProjectRiskFields(risk={},brief={}){
  const normalized=normalizeProjectRisk(risk,brief);
  if(!projectRiskHasMaterialAssessment(normalized)) return compactText(normalized.reviewBasis) ? [] : ['review basis'];
  const missing=[];
  if(!compactText(normalized.riskType)) missing.push('risk type');
  if(!compactText(normalized.riskSummary)) missing.push('risk');
  if(!compactText(normalized.impact)) missing.push('impact if ignored');
  if(!compactText(normalized.severity)) missing.push('severity');
  if(!projectRiskOwnerCandidate(normalized.ownerId || normalized.ownerName,brief.linkedRelationships)) missing.push('existing project relationship accountable for it');
  if(!compactText(normalized.mitigation)) missing.push('smallest mitigation');
  if(!compactText(normalized.watchCondition)) missing.push('watch condition');
  if(!compactText(normalized.confidence)) missing.push('confidence');
  return missing;
}
function projectRiskLine(value={},brief={}){
  const risk=normalizeProjectRisk(value,brief);
  if(!projectRiskHasMaterialAssessment(risk)) return 'No material risk | basis: ' + (risk.reviewBasis || '...');
  return [
    risk.riskType || 'Risk type',
    risk.riskSummary || 'Risk',
    'impact if ignored: ' + (risk.impact || '...'),
    'severity: ' + (risk.severity || '...'),
    'accountable person: ' + (risk.ownerName || '...'),
    'smallest mitigation: ' + (risk.mitigation || '...'),
    'watch condition: ' + (risk.watchCondition || '...'),
    'confidence: ' + (risk.confidence || '...')
  ].join(' | ');
}
function parseProjectRisk(answer='',brief={},current={}){
  const source=multilineText(answer,5000).trim();
  if(!source) return normalizeProjectRisk(current,brief);
  const noRisk=source.match(/^\s*(?:no\s+(?:current\s+)?material\s+risk|no\s+risk)\s*(?::|\||-)?\s*(.*)$/i);
  if(noRisk) return normalizeProjectRisk({assessment:'no_material_risk',reviewBasis:noRisk[1] || '',sourceRefs:brief.sourceRefs},brief);
  const parts=source.split('|').map((part)=>part.trim()).filter(Boolean);
  let riskType=monitoringValueFromLine(source,'risk type|type');
  let riskSummary=monitoringValueFromLine(source,'risk summary|risk|blocker');
  let impact=monitoringValueFromLine(source,'impact if ignored|impact|why it matters|if ignored');
  let severity=monitoringValueFromLine(source,'severity');
  let ownerName=monitoringValueFromLine(source,'accountable person|accountable owner|owner');
  let mitigation=monitoringValueFromLine(source,'smallest mitigation|mitigation|protective move');
  let watchCondition=monitoringValueFromLine(source,'watch condition|watch|surface when|trigger');
  let confidence=monitoringValueFromLine(source,'confidence');
  if(parts.length >= 8){
    riskType=riskType || parts[0].replace(/^\s*(?:risk type|type)\s*:\s*/i,'');
    riskSummary=riskSummary || parts[1].replace(/^\s*(?:risk summary|risk|blocker)\s*:\s*/i,'');
    impact=impact || parts[2].replace(/^\s*(?:impact if ignored|impact|why it matters|if ignored)\s*:\s*/i,'');
    severity=severity || parts[3].replace(/^\s*severity\s*:\s*/i,'');
    ownerName=ownerName || parts[4].replace(/^\s*(?:accountable person|accountable owner|owner)\s*:\s*/i,'');
    mitigation=mitigation || parts[5].replace(/^\s*(?:smallest mitigation|mitigation|protective move)\s*:\s*/i,'');
    watchCondition=watchCondition || parts[6].replace(/^\s*(?:watch condition|watch|surface when|trigger)\s*:\s*/i,'');
    confidence=confidence || parts[7].replace(/^\s*confidence\s*:\s*/i,'');
  }
  return normalizeProjectRisk({assessment:'material_risk',riskType,riskSummary,impact,severity,ownerName,mitigation,watchCondition,confidence,sourceRefs:brief.sourceRefs},brief);
}
function buildProjectRiskBrief(project={},input={}){
  const metadata=project.metadataJson || project.metadata || {};
  const recorded=safeArray(project.projectPeople || metadata.projectPeople);
  const linkedRelationships=recorded.map((person)=>relationshipCandidate({
    id:person.relationshipId || person.relationship_id || person.id,
    displayName:person.name || person.displayName,
    email:person.email,
    role:person.role
  })).filter((candidate)=>candidate.id && candidate.name);
  const references=projectIdentityReferences(project,input);
  const legacyRisk=compactText(project.risk || project.riskSummary || metadata.risk || metadata.riskSummary || '',500);
  const existingRaw=project.projectRisk || metadata.projectRisk || (legacyRisk ? {assessment:'material_risk',riskSummary:legacyRisk,ownerName:project.nextStepOwner || metadata.owner?.name || '',mitigation:project.nextMove || metadata.nextMove || ''} : {});
  const existingRisk=normalizeProjectRisk(existingRaw,{linkedRelationships,sourceRefs:references});
  return {
    id:stableKey(`working_brief_project_risk_${project.projectId || project.id || input.scope?.entityId || project.name}`),
    entrypointId:'project.risk',
    entityType:'project_section',
    entityId:String(project.projectId || project.id || input.scope?.entityId || ''),
    sectionId:'risk_blocker',
    projectName:compactText(project.name || project.displayName || metadata.projectName || 'Project',180),
    linkedRelationships,
    existingRisk,
    sourceRefs:references,
    objective:'Assess one current material project risk precisely, or record that no material risk is currently proven.',
    completionCondition:'A material risk has its type, impact, severity, accountable existing project relationship, smallest mitigation, watch condition, confidence, and evidence; or a no-material-risk assessment has its review basis.',
    approvalBoundary:'Applying the risk assessment changes only the internal Project Managers packet. It does not create a task, alert, message, CRM update, calendar change, or alter source evidence.'
  };
}
function projectRiskQuestion(state={},brief={}){
  const risk=normalizeProjectRisk(state.draftProjectRisk || brief.existingRisk || {},brief);
  const relationships=safeArray(brief.linkedRelationships).map((item)=>item.name).join(', ');
  if(state.stage === 'risk'){
    return {
      targetField:'project_risk_packet.{risk_type,risk_summary,why_it_matters,if_ignored,severity,owner,mitigation_next_step,watch_condition,confidence}',
      question:`Is a material risk currently proven for ${brief.projectName || 'this project'}? If yes, add one line: risk type | risk | impact if ignored | severity | accountable person | smallest mitigation | watch condition | confidence. If no, write: No material risk | basis.`,
      detail:`This fills Project Managers > Risk / blocker. ${relationships ? 'Accountable people must be already linked to this project: ' + relationships + '. ' : 'A material risk needs an accountable person from People involved first. '}VAL will not invent a blocker just to fill the card.`
    };
  }
  if(state.stage === 'risk_details'){
    const missing=missingProjectRiskFields(risk,brief);
    return {
      targetField:'project_risk_packet.{risk_type,risk_summary,why_it_matters,if_ignored,severity,owner,mitigation_next_step,watch_condition,confidence}',
      question:`Fill only these missing risk details: ${missing.join(', ')}.\n\n${projectRiskLine(risk,brief)}`,
      detail:'The accountable person must be one of the existing project relationships. Keep the mitigation to the smallest protective move, not a broad plan.'
    };
  }
  return {
    targetField:'project_risk_packet',
    question:'Review the prepared project risk assessment, then apply it to this Project Manager.',
    detail:'Applying changes only the selected internal risk packet. Nothing external happens.'
  };
}

function projectImportanceTemplate(value={},brief={}){
  const raw=typeof value === 'string' ? {whyItMatters:value} : (value || {});
  const whyItMatters=compactText(raw.whyItMatters || raw.why_it_matters || raw.strategicImportance || raw.strategic_importance || raw.importance || raw.consequence || raw.opportunity || '',700);
  return {
    id:compactText(raw.id || stableKey(`project_importance_${brief.entityId || brief.projectName || 'project'}`),220),
    whyItMatters,
    strategicImportance:compactText(raw.strategicImportance || raw.strategic_importance || whyItMatters,700),
    whyNow:compactText(raw.whyNow || raw.why_now || raw.timing || '',500),
    basis:compactText(raw.basis || raw.evidenceBasis || raw.evidence_basis || raw.evidence || '',700),
    confidence:compactText(raw.confidence || '',120),
    sourceRefs:safeArray(raw.sourceRefs || raw.source_refs || brief.sourceRefs).map(sourceRef)
  };
}
function normalizeProjectImportance(value={},brief={}){
  return projectImportanceTemplate(value,brief);
}
function missingProjectImportanceFields(value={},brief={}){
  const importance=normalizeProjectImportance(value,brief);
  const missing=[];
  if(!compactText(importance.whyItMatters)) missing.push('consequence or opportunity');
  if(!compactText(importance.whyNow)) missing.push('why now');
  if(!compactText(importance.basis)) missing.push('basis');
  if(!compactText(importance.confidence)) missing.push('confidence');
  return missing;
}
function projectImportanceLine(value={},brief={}){
  const importance=normalizeProjectImportance(value,brief);
  return [
    importance.whyItMatters || 'Consequence or opportunity',
    'why now: ' + (importance.whyNow || '...'),
    'basis: ' + (importance.basis || '...'),
    'confidence: ' + (importance.confidence || '...')
  ].join(' | ');
}
function parseProjectImportance(answer='',brief={},current={}){
  const source=multilineText(answer,5000).trim();
  if(!source) return normalizeProjectImportance(current,brief);
  const parts=source.split('|').map((part)=>part.trim()).filter(Boolean);
  let whyItMatters=monitoringValueFromLine(source,'consequence or opportunity|why it matters|strategic importance|importance');
  let whyNow=monitoringValueFromLine(source,'why now|timing');
  let basis=monitoringValueFromLine(source,'basis|evidence basis|evidence');
  let confidence=monitoringValueFromLine(source,'confidence');
  if(parts.length >= 4){
    whyItMatters=whyItMatters || parts[0].replace(/^\s*(?:consequence or opportunity|why it matters|strategic importance|importance)\s*:\s*/i,'');
    whyNow=whyNow || parts[1].replace(/^\s*(?:why now|timing)\s*:\s*/i,'');
    basis=basis || parts[2].replace(/^\s*(?:basis|evidence basis|evidence)\s*:\s*/i,'');
    confidence=confidence || parts[3].replace(/^\s*confidence\s*:\s*/i,'');
  }
  return normalizeProjectImportance({whyItMatters,whyNow,basis,confidence,sourceRefs:brief.sourceRefs},brief);
}
function buildProjectImportanceBrief(project={},input={}){
  const metadata=project.metadataJson || project.metadata || {};
  const references=projectIdentityReferences(project,input);
  const existingRaw=project.projectImportance || metadata.projectImportance || {
    whyItMatters:project.whyItMatters || metadata.whyItMatters || project.strategicImportance || metadata.strategicImportance || '',
    strategicImportance:project.strategicImportance || metadata.strategicImportance || '',
    whyNow:project.whyNow || metadata.whyNow || '',
    basis:project.importanceBasis || metadata.importanceBasis || '',
    confidence:project.importanceConfidence || metadata.importanceConfidence || ''
  };
  const currentImportance=normalizeProjectImportance(existingRaw,{sourceRefs:references});
  return {
    id:stableKey(`working_brief_project_importance_${project.projectId || project.id || input.scope?.entityId || project.name}`),
    entrypointId:'project.why_it_matters',
    entityType:'project_section',
    entityId:String(project.projectId || project.id || input.scope?.entityId || ''),
    sectionId:'why_it_matters',
    projectName:compactText(project.name || project.displayName || metadata.projectName || 'Project',180),
    currentImportance,
    sourceRefs:references,
    objective:'State the selected project\'s concrete consequence or opportunity, why it matters now, and whether the basis is source-backed or executive judgment.',
    completionCondition:'The consequence or opportunity, why-now, basis, confidence, and immutable source references are explicit.',
    approvalBoundary:'Applying this judgment changes only the internal Project Managers importance and judgment packet. It does not create a task, message, CRM update, calendar change, or alter source evidence.'
  };
}
function projectImportanceQuestion(state={},brief={}){
  const importance=normalizeProjectImportance(state.draftProjectImportance || brief.currentImportance || {},brief);
  const receiptLabels=safeArray(brief.sourceRefs).map((ref)=>compactText(ref.quoteOrSummary || ref.quote_or_summary || ref.sourceId || ref.source_id || '',180)).filter(Boolean).slice(0,3);
  if(state.stage === 'importance'){
    return {
      targetField:'project_manager_judgment_packet.{why_it_matters,evidence_summary,confidence} + project_identity_packet.strategic_importance + project_next_action_packet.why_now',
      question:`What concrete consequence or opportunity makes ${brief.projectName || 'this project'} matter, why now, and what is the basis? Add one line: consequence or opportunity | why now | basis (source receipt or executive judgment) | confidence.`,
      detail:`This fills Project Managers > Why it matters. ${receiptLabels.length ? 'Available source receipts: ' + receiptLabels.join('; ') + '. ' : ''}If this is your judgment rather than a source fact, say “executive judgment” in the basis.`
    };
  }
  if(state.stage === 'importance_details'){
    const missing=missingProjectImportanceFields(importance,brief);
    return {
      targetField:'project_manager_judgment_packet.{why_it_matters,evidence_summary,confidence} + project_identity_packet.strategic_importance + project_next_action_packet.why_now',
      question:`Fill only these missing importance details: ${missing.join(', ')}.\n\n${projectImportanceLine(importance,brief)}`,
      detail:'Keep source-backed facts and executive judgment clearly distinct.'
    };
  }
  return {
    targetField:'project_manager_judgment_packet.why_it_matters',
    question:'Review the prepared strategic judgment, then apply it to this Project Manager.',
    detail:'Applying changes only the selected internal importance packet. Nothing external happens.'
  };
}

function projectNarrativeTemplate(value={},brief={}){
  const raw=typeof value === 'string' ? {currentReality:value} : (value || {});
  return {
    id:compactText(raw.id || stableKey(`project_narrative_${brief.entityId || brief.projectName || 'project'}`),220),
    currentReality:compactText(raw.currentReality || raw.current_reality || raw.livingNarrative || raw.living_narrative || raw.reality || '',900),
    whatValNowKnows:compactText(raw.whatValNowKnows || raw.what_val_now_knows || raw.currentLearning || raw.current_learning || '',700),
    whatIsBlocked:compactText(raw.whatIsBlocked || raw.what_is_blocked || raw.currentBlocker || raw.current_blocker || raw.blocker || raw.blockedBy || raw.blocked_by || '',700),
    basis:compactText(raw.basis || raw.evidenceBasis || raw.evidence_basis || raw.evidence || '',700),
    confidence:compactText(raw.confidence || '',120),
    sourceRefs:safeArray(raw.sourceRefs || raw.source_refs || brief.sourceRefs).map(sourceRef)
  };
}
function normalizeProjectNarrative(value={},brief={}){
  return projectNarrativeTemplate(value,brief);
}
function missingProjectNarrativeFields(value={},brief={}){
  const narrative=normalizeProjectNarrative(value,brief);
  const missing=[];
  if(!compactText(narrative.currentReality)) missing.push('current reality');
  if(!compactText(narrative.whatValNowKnows)) missing.push('what VAL now knows');
  if(!compactText(narrative.whatIsBlocked)) missing.push('what is blocked');
  if(!compactText(narrative.basis)) missing.push('basis');
  if(!compactText(narrative.confidence)) missing.push('confidence');
  return missing;
}
function projectNarrativeLine(value={},brief={}){
  const narrative=normalizeProjectNarrative(value,brief);
  return [
    narrative.currentReality || 'Current reality',
    'what VAL now knows: ' + (narrative.whatValNowKnows || '...'),
    'what is blocked: ' + (narrative.whatIsBlocked || '...'),
    'basis: ' + (narrative.basis || '...'),
    'confidence: ' + (narrative.confidence || '...')
  ].join(' | ');
}
function parseProjectNarrative(answer='',brief={},current={}){
  const source=multilineText(answer,5000).trim();
  if(!source) return normalizeProjectNarrative(current,brief);
  const parts=source.split('|').map((part)=>part.trim()).filter(Boolean);
  let currentReality=monitoringValueFromLine(source,'current reality|reality|working narrative|narrative');
  let whatValNowKnows=monitoringValueFromLine(source,'what val now knows|what val knows|current learning');
  let whatIsBlocked=monitoringValueFromLine(source,'what is blocked|blocked|current blocker|blocker');
  let basis=monitoringValueFromLine(source,'basis|evidence basis|evidence');
  let confidence=monitoringValueFromLine(source,'confidence');
  if(parts.length >= 5){
    currentReality=currentReality || parts[0].replace(/^\s*(?:current reality|reality|working narrative|narrative)\s*:\s*/i,'');
    whatValNowKnows=whatValNowKnows || parts[1].replace(/^\s*(?:what val now knows|what val knows|current learning)\s*:\s*/i,'');
    whatIsBlocked=whatIsBlocked || parts[2].replace(/^\s*(?:what is blocked|blocked|current blocker|blocker)\s*:\s*/i,'');
    basis=basis || parts[3].replace(/^\s*(?:basis|evidence basis|evidence)\s*:\s*/i,'');
    confidence=confidence || parts[4].replace(/^\s*confidence\s*:\s*/i,'');
  }
  return normalizeProjectNarrative({currentReality,whatValNowKnows,whatIsBlocked,basis,confidence,sourceRefs:brief.sourceRefs},brief);
}
function buildProjectNarrativeBrief(project={},input={}){
  const metadata=project.metadataJson || project.metadata || {};
  const references=projectIdentityReferences(project,input);
  const existingRaw=project.projectNarrative || metadata.projectNarrative || {
    currentReality:project.livingNarrative || metadata.livingNarrative || project.reality || project.summary || '',
    whatValNowKnows:project.whatValNowKnows || metadata.whatValNowKnows || project.momentumEvidence || '',
    whatIsBlocked:project.currentBlocker || metadata.currentBlocker || project.blocker || project.blockedBy || metadata.blocker || metadata.blockedBy || '',
    basis:project.narrativeBasis || metadata.narrativeBasis || '',
    confidence:project.narrativeConfidence || metadata.narrativeConfidence || ''
  };
  const currentNarrative=normalizeProjectNarrative(existingRaw,{sourceRefs:references});
  return {
    id:stableKey(`working_brief_project_narrative_${project.projectId || project.id || input.scope?.entityId || project.name}`),
    entrypointId:'project.narrative',
    entityType:'project_section',
    entityId:String(project.projectId || project.id || input.scope?.entityId || ''),
    sectionId:'working_narrative',
    projectName:compactText(project.name || project.displayName || metadata.projectName || 'Project',180),
    currentNarrative,
    sourceRefs:references,
    objective:'Make the selected project\'s current state understandable without replacing evidence or inventing a blocked condition.',
    completionCondition:'Current reality, what VAL now knows, what is blocked or explicitly not blocked, basis, confidence, and immutable source references are explicit.',
    approvalBoundary:'Applying this narrative changes only the internal Project Managers judgment packet. It does not create a task, message, CRM update, calendar change, or alter source evidence.'
  };
}
function projectNarrativeQuestion(state={},brief={}){
  const narrative=normalizeProjectNarrative(state.draftProjectNarrative || brief.currentNarrative || {},brief);
  const receiptLabels=safeArray(brief.sourceRefs).map((ref)=>compactText(ref.quoteOrSummary || ref.quote_or_summary || ref.sourceId || ref.source_id || '',180)).filter(Boolean).slice(0,3);
  if(state.stage === 'narrative'){
    return {
      targetField:'project_manager_judgment_packet.{current_reality,what_val_now_knows,what_is_blocked,evidence_summary,confidence} + Working narrative',
      question:`What is the current reality for ${brief.projectName || 'this project'}, what does VAL now know, and what is blocked? Add one line: current reality | what VAL now knows | what is blocked (or No current blocker) | basis (source receipt or executive judgment) | confidence.`,
      detail:`This fills Project Managers > Working narrative and the Judgment round-table packet. ${receiptLabels.length ? 'Available source receipts: ' + receiptLabels.join('; ') + '. ' : ''}If the basis is your judgment rather than a source fact, say “executive judgment.”`
    };
  }
  if(state.stage === 'narrative_details'){
    const missing=missingProjectNarrativeFields(narrative,brief);
    return {
      targetField:'project_manager_judgment_packet.{current_reality,what_val_now_knows,what_is_blocked,evidence_summary,confidence} + Working narrative',
      question:`Fill only these missing narrative details: ${missing.join(', ')}.\n\n${projectNarrativeLine(narrative,brief)}`,
      detail:'State “No current blocker” when that is true. Keep source-backed facts and executive judgment clearly distinct.'
    };
  }
  return {
    targetField:'project_manager_judgment_packet.current_reality',
    question:'Review the prepared current-state narrative, then apply it to this Project Manager.',
    detail:'Applying changes only the selected internal narrative and judgment packet. Nothing external happens.'
  };
}

const PROJECT_NEEDS_NEXT_TARGETS=Object.freeze({
  fact:{targetPacketField:'project_manager_judgment_packet.what_val_now_knows',targetPageBoxes:['What VAL needs next','Working narrative']},
  decision:{targetPacketField:'project_manager_judgment_packet.user_decision_needed',targetPageBoxes:['What VAL needs next','Project Manager judgment']},
  source:{targetPacketField:'project_document_receipts',targetPageBoxes:['What VAL needs next','Documents / sources']},
  person:{targetPacketField:'project_relationships_packet',targetPageBoxes:['What VAL needs next','People involved']}
});
function projectNeedType(value=''){
  const normalized=compactText(value,80).toLowerCase().replace(/\s+/g,'_');
  if(['fact','decision','source','person'].includes(normalized)) return normalized;
  return '';
}
function projectNeedsNextTemplate(value={},brief={}){
  const raw=typeof value === 'string' ? {nextQuestion:value} : (value || {});
  const needType=projectNeedType(raw.needType || raw.need_type || raw.type || raw.missingType || raw.missing_type);
  const target=PROJECT_NEEDS_NEXT_TARGETS[needType] || {targetPacketField:'',targetPageBoxes:[]};
  return {
    id:compactText(raw.id || stableKey(`project_needs_next_${brief.entityId || brief.projectName || 'project'}`),220),
    needType,
    missingItem:compactText(raw.missingItem || raw.missing_item || raw.gap || raw.need || '',700),
    whyNeeded:compactText(raw.whyNeeded || raw.why_needed || raw.why || raw.impact || '',700),
    resolutionPath:compactText(raw.resolutionPath || raw.resolution_path || raw.acquisitionPath || raw.acquisition_path || raw.route || '',500),
    nextQuestion:compactText(raw.nextQuestion || raw.next_question || raw.question || raw.resolvingMove || raw.resolving_move || '',700),
    targetPacketField:target.targetPacketField,
    targetPageBoxes:target.targetPageBoxes,
    basis:compactText(raw.basis || raw.evidenceBasis || raw.evidence_basis || raw.evidence || '',700),
    confidence:compactText(raw.confidence || '',120),
    sourceRefs:safeArray(raw.sourceRefs || raw.source_refs || brief.sourceRefs).map(sourceRef)
  };
}
function normalizeProjectNeedsNext(value={},brief={}){
  return projectNeedsNextTemplate(value,brief);
}
function missingProjectNeedsNextFields(value={},brief={}){
  const need=normalizeProjectNeedsNext(value,brief);
  const missing=[];
  if(!need.needType) missing.push('type: fact, decision, source, or person');
  if(!compactText(need.missingItem)) missing.push('missing item');
  if(!compactText(need.whyNeeded)) missing.push('why VAL needs it');
  if(!compactText(need.resolutionPath)) missing.push('answer or internal acquisition route');
  if(!compactText(need.nextQuestion)) missing.push('next question or resolving move');
  if(!compactText(need.basis)) missing.push('basis');
  if(!compactText(need.confidence)) missing.push('confidence');
  return missing;
}
function projectNeedsNextLine(value={},brief={}){
  const need=normalizeProjectNeedsNext(value,brief);
  return [
    need.needType || 'Type: fact, decision, source, or person',
    need.missingItem || 'Missing item',
    'why VAL needs it: ' + (need.whyNeeded || '...'),
    'route: ' + (need.resolutionPath || '...'),
    'next question or move: ' + (need.nextQuestion || '...'),
    'basis: ' + (need.basis || '...'),
    'confidence: ' + (need.confidence || '...')
  ].join(' | ');
}
function parseProjectNeedsNext(answer='',brief={},current={}){
  const source=multilineText(answer,5000).trim();
  if(!source) return normalizeProjectNeedsNext(current,brief);
  const previous=normalizeProjectNeedsNext(current,brief);
  const parts=source.split('|').map((part)=>part.trim()).filter(Boolean);
  let needType=projectNeedType(monitoringValueFromLine(source,'type|need type|missing type'));
  let missingItem=monitoringValueFromLine(source,'missing item|gap|missing fact|missing decision|missing source|missing person');
  let whyNeeded=monitoringValueFromLine(source,'why val needs it|why needed|why|impact');
  let resolutionPath=monitoringValueFromLine(source,'route|resolution path|acquisition route|answer or route');
  let nextQuestion=monitoringValueFromLine(source,'next question or move|next question|resolving move|question');
  let basis=monitoringValueFromLine(source,'basis|evidence basis|evidence');
  let confidence=monitoringValueFromLine(source,'confidence');
  if(parts.length >= 7){
    needType=needType || projectNeedType(parts[0].replace(/^\s*(?:type|need type|missing type)\s*:\s*/i,''));
    missingItem=missingItem || parts[1].replace(/^\s*(?:missing item|gap|missing fact|missing decision|missing source|missing person)\s*:\s*/i,'');
    whyNeeded=whyNeeded || parts[2].replace(/^\s*(?:why val needs it|why needed|why|impact)\s*:\s*/i,'');
    resolutionPath=resolutionPath || parts[3].replace(/^\s*(?:route|resolution path|acquisition route|answer or route)\s*:\s*/i,'');
    nextQuestion=nextQuestion || parts[4].replace(/^\s*(?:next question or move|next question|resolving move|question)\s*:\s*/i,'');
    basis=basis || parts[5].replace(/^\s*(?:basis|evidence basis|evidence)\s*:\s*/i,'');
    confidence=confidence || parts[6].replace(/^\s*confidence\s*:\s*/i,'');
  }
  return normalizeProjectNeedsNext({
    ...previous,
    needType:needType || previous.needType,
    missingItem:missingItem || previous.missingItem,
    whyNeeded:whyNeeded || previous.whyNeeded,
    resolutionPath:resolutionPath || previous.resolutionPath,
    nextQuestion:nextQuestion || previous.nextQuestion,
    basis:basis || previous.basis,
    confidence:confidence || previous.confidence,
    sourceRefs:brief.sourceRefs
  },brief);
}
function buildProjectNeedsNextBrief(project={},input={}){
  const metadata=project.metadataJson || project.metadata || {};
  const references=projectIdentityReferences(project,input);
  const existingRaw=project.projectNeedsNext || metadata.projectNeedsNext || {
    needType:project.needsNextType || metadata.needsNextType || '',
    missingItem:project.needsNextMissingItem || metadata.needsNextMissingItem || '',
    whyNeeded:project.needsNextPurpose || metadata.needsNextPurpose || '',
    resolutionPath:project.needsNextResolutionPath || metadata.needsNextResolutionPath || '',
    nextQuestion:project.needsNextQuestion || metadata.needsNextQuestion || '',
    basis:project.needsNextBasis || metadata.needsNextBasis || '',
    confidence:project.needsNextConfidence || metadata.needsNextConfidence || ''
  };
  const currentNeed=normalizeProjectNeedsNext(existingRaw,{sourceRefs:references});
  return {
    id:stableKey(`working_brief_project_needs_next_${project.projectId || project.id || input.scope?.entityId || project.name}`),
    entrypointId:'project.needs_next',
    entityType:'project_section',
    entityId:String(project.projectId || project.id || input.scope?.entityId || ''),
    sectionId:'what_val_needs_next',
    projectName:compactText(project.name || project.displayName || metadata.projectName || 'Project',180),
    currentNeed,
    sourceRefs:references,
    objective:'Identify one precise missing fact, decision, source, or person before VAL takes another project-management step.',
    completionCondition:'One typed gap has a concrete missing item, why it is needed, a question or internal acquisition route, exact target packet, basis, confidence, and immutable source references.',
    approvalBoundary:'Applying this need changes only the internal Project Managers interview packet. It does not reach out, fetch a source, create a task, message anyone, update CRM, change a calendar, or alter source evidence.'
  };
}
function projectNeedsNextQuestion(state={},brief={}){
  const need=normalizeProjectNeedsNext(state.draftProjectNeedsNext || brief.currentNeed || {},brief);
  const receiptLabels=safeArray(brief.sourceRefs).map((ref)=>compactText(ref.quoteOrSummary || ref.quote_or_summary || ref.sourceId || ref.source_id || '',180)).filter(Boolean).slice(0,3);
  if(state.stage === 'needs_next'){
    return {
      targetField:'project_interview_packet.{current_question,question_purpose,target_packet_field,target_page_boxes,missing_fields} + typed target packet',
      question:`What one thing does VAL need next to manage ${brief.projectName || 'this project'} safely? Add one line: type (fact, decision, source, or person) | missing item | why VAL needs it | answer or internal acquisition route | next question or resolving move | basis (source receipt or executive judgment) | confidence.`,
      detail:`This fills Project Managers > What VAL needs next. A fact targets Working narrative, a decision targets Project Manager judgment, a source targets Documents / sources, and a person targets People involved. ${receiptLabels.length ? 'Available source receipts: ' + receiptLabels.join('; ') + '. ' : ''}Nothing is acquired or sent from this step.`
    };
  }
  if(state.stage === 'needs_next_details'){
    const missing=missingProjectNeedsNextFields(need,brief);
    return {
      targetField:'project_interview_packet.{current_question,question_purpose,target_packet_field,target_page_boxes,missing_fields} + typed target packet',
      question:`Fill only these missing need details: ${missing.join(', ')}.\n\n${projectNeedsNextLine(need,brief)}`,
      detail:'Keep this to one gap. The route is a proposed internal way to resolve it, not an action VAL has already taken.'
    };
  }
  return {
    targetField:'project_interview_packet.current_question',
    question:'Review the one next thing VAL needs, then apply it to this Project Manager.',
    detail:'Applying changes only the selected internal interview packet. Nothing external happens.'
  };
}

const PROJECT_OPERATING_SYSTEMS=Object.freeze({
  frisson_partner_onboarding:{id:'frisson_partner_onboarding',name:'Frisson Partner Onboarding',whenToUse:'Use when a new Frisson partner needs dashboard setup, automations, connections, launch metrics, and long-term partnership nurture.',phases:['Initiate partner fit','Plan dashboard and automations','Build connections','Launch and validate','Monitor activation','Nurture partnership']},
  client_dashboard_buildout:{id:'client_dashboard_buildout',name:'Client Dashboard Buildout',whenToUse:'Use when a client needs a dashboard, data sources, metrics, and handoff workflow built.',phases:['Define outcome','Map data sources','Build dashboard','Validate metrics','Handoff and train','Monitor reliability']},
  relationship_nurture_partnership:{id:'relationship_nurture_partnership',name:'Long-Term Partnership Nurture',whenToUse:'Use when the main work is protecting and expanding a strategic relationship over time.',phases:['Clarify relationship value','Set cadence','Track promises','Prepare useful touches','Monitor drift','Create expansion opportunities']},
  new_sop:{id:'new_sop',name:'Create New SOP',whenToUse:'Use when this project should teach VAL a reusable operating pattern.',phases:['Interview user','Find repeatable steps','Run project','Capture lessons','Publish SOP draft']}
});
function projectOperatingSystemId(value=''){
  const normalized=compactText(value,180).toLowerCase();
  if(!normalized) return '';
  const match=Object.values(PROJECT_OPERATING_SYSTEMS).find((option)=>{
    const id=option.id.toLowerCase();
    return normalized===id || normalized===option.name.toLowerCase() || normalized===id.replace(/_/g,' ') || normalized===`${option.name.toLowerCase()} (${id})`;
  });
  return match?.id || '';
}
function projectOperatingSystemTemplate(value={},brief={}){
  const raw=typeof value === 'string' ? {sopId:value} : (value || {});
  const sopId=projectOperatingSystemId(raw.sopId || raw.sop_id || raw.operatingSystem || raw.operating_system || raw.sop || raw.name);
  const option=PROJECT_OPERATING_SYSTEMS[sopId] || null;
  return {
    id:compactText(raw.id || stableKey(`project_operating_system_${brief.entityId || brief.projectName || 'project'}`),220),
    sopId,
    sopName:option?.name || '',
    fitReason:compactText(raw.fitReason || raw.fit_reason || raw.reason || raw.whyItFits || raw.why_it_fits || '',700),
    knownDeviations:compactText(raw.knownDeviations || raw.known_deviations || raw.deviations || '',700),
    basis:compactText(raw.basis || raw.evidenceBasis || raw.evidence_basis || raw.evidence || '',700),
    confidence:compactText(raw.confidence || '',120),
    sourceRefs:safeArray(raw.sourceRefs || raw.source_refs || brief.sourceRefs).map(sourceRef)
  };
}
function normalizeProjectOperatingSystem(value={},brief={}){
  return projectOperatingSystemTemplate(value,brief);
}
function missingProjectOperatingSystemFields(value={},brief={}){
  const operatingSystem=normalizeProjectOperatingSystem(value,brief);
  const missing=[];
  if(!operatingSystem.sopId) missing.push('operating system from the available choices');
  if(!compactText(operatingSystem.fitReason)) missing.push('fit reasoning');
  if(!compactText(operatingSystem.knownDeviations)) missing.push('material deviations or No material deviations');
  if(!compactText(operatingSystem.basis)) missing.push('basis');
  if(!compactText(operatingSystem.confidence)) missing.push('confidence');
  return missing;
}
function projectOperatingSystemLine(value={},brief={}){
  const operatingSystem=normalizeProjectOperatingSystem(value,brief);
  return [
    operatingSystem.sopName || 'Operating system: choose one available option',
    'fit reasoning: ' + (operatingSystem.fitReason || '...'),
    'deviations: ' + (operatingSystem.knownDeviations || '...'),
    'basis: ' + (operatingSystem.basis || '...'),
    'confidence: ' + (operatingSystem.confidence || '...')
  ].join(' | ');
}
function parseProjectOperatingSystem(answer='',brief={},current={}){
  const source=multilineText(answer,5000).trim();
  if(!source) return normalizeProjectOperatingSystem(current,brief);
  const previous=normalizeProjectOperatingSystem(current,brief);
  const parts=source.split('|').map((part)=>part.trim()).filter(Boolean);
  let sopId=projectOperatingSystemId(monitoringValueFromLine(source,'operating system|operating_system|sop|sop id|pattern'));
  let fitReason=monitoringValueFromLine(source,'fit reasoning|fit reason|why it fits|reason');
  let knownDeviations=monitoringValueFromLine(source,'deviations|known deviations|material deviations');
  let basis=monitoringValueFromLine(source,'basis|evidence basis|evidence');
  let confidence=monitoringValueFromLine(source,'confidence');
  if(parts.length >= 5){
    sopId=sopId || projectOperatingSystemId(parts[0].replace(/^\s*(?:operating system|operating_system|sop|sop id|pattern)\s*:\s*/i,''));
    fitReason=fitReason || parts[1].replace(/^\s*(?:fit reasoning|fit reason|why it fits|reason)\s*:\s*/i,'');
    knownDeviations=knownDeviations || parts[2].replace(/^\s*(?:deviations|known deviations|material deviations)\s*:\s*/i,'');
    basis=basis || parts[3].replace(/^\s*(?:basis|evidence basis|evidence)\s*:\s*/i,'');
    confidence=confidence || parts[4].replace(/^\s*confidence\s*:\s*/i,'');
  }
  return normalizeProjectOperatingSystem({
    ...previous,
    sopId:sopId || previous.sopId,
    fitReason:fitReason || previous.fitReason,
    knownDeviations:knownDeviations || previous.knownDeviations,
    basis:basis || previous.basis,
    confidence:confidence || previous.confidence,
    sourceRefs:brief.sourceRefs
  },brief);
}
function buildProjectOperatingSystemBrief(project={},input={}){
  const metadata=project.metadataJson || project.metadata || {};
  const references=projectIdentityReferences(project,input);
  const existingRaw=project.projectOperatingSystem || metadata.projectOperatingSystem || {
    sopId:project.sopId || metadata.sopId || metadata.intake?.sopId || '',
    fitReason:project.sopFitReason || metadata.sopFitReason || '',
    knownDeviations:project.sopDeviations || metadata.sopDeviations || '',
    basis:project.sopBasis || metadata.sopBasis || '',
    confidence:project.sopConfidence || metadata.sopConfidence || ''
  };
  const currentOperatingSystem=normalizeProjectOperatingSystem(existingRaw,{sourceRefs:references});
  return {
    id:stableKey(`working_brief_project_operating_system_${project.projectId || project.id || input.scope?.entityId || project.name}`),
    entrypointId:'project.sop',
    entityType:'project_section',
    entityId:String(project.projectId || project.id || input.scope?.entityId || ''),
    sectionId:'sop_fit',
    projectName:compactText(project.name || project.displayName || metadata.projectName || 'Project',180),
    currentOperatingSystem,
    availableOperatingSystems:Object.values(PROJECT_OPERATING_SYSTEMS),
    sourceRefs:references,
    objective:'Select the real operating pattern that should run this selected project and make any material deviations explicit.',
    completionCondition:'One current VAL operating system, its fit reasoning, material deviations or No material deviations, basis, confidence, and immutable source references are explicit.',
    approvalBoundary:'Applying this selection changes only the selected internal Project Managers SOP packet. It does not create a task, alter workstreams or phase, message anyone, update CRM, change a calendar, or alter source evidence.'
  };
}
function projectOperatingSystemQuestion(state={},brief={}){
  const operatingSystem=normalizeProjectOperatingSystem(state.draftProjectOperatingSystem || brief.currentOperatingSystem || {},brief);
  const available=safeArray(brief.availableOperatingSystems).map((option)=>`${option.name} (${option.id})`).join('; ');
  const receiptLabels=safeArray(brief.sourceRefs).map((ref)=>compactText(ref.quoteOrSummary || ref.quote_or_summary || ref.sourceId || ref.source_id || '',180)).filter(Boolean).slice(0,3);
  if(state.stage === 'operating_system'){
    return {
      targetField:'project_sop_packet.{sop_id,sop_name,fit_reason,known_deviations,basis,confidence} + Operating System',
      question:`Which current VAL operating system should run ${brief.projectName || 'this project'}? Choose one available pattern: ${available}. Add one line: operating system | fit reasoning | material deviations (or No material deviations) | basis (source receipt or executive judgment) | confidence.`,
      detail:`This fills Project Managers > Operating System only. ${brief.currentOperatingSystem?.sopName ? 'Current selection: ' + brief.currentOperatingSystem.sopName + '. ' : ''}${receiptLabels.length ? 'Available source receipts: ' + receiptLabels.join('; ') + '. ' : ''}VAL will not create a plan, task, workstream, phase change, or external action here.`
    };
  }
  if(state.stage === 'operating_system_details'){
    const missing=missingProjectOperatingSystemFields(operatingSystem,brief);
    return {
      targetField:'project_sop_packet.{sop_id,sop_name,fit_reason,known_deviations,basis,confidence} + Operating System',
      question:`Fill only these missing operating-system details: ${missing.join(', ')}.\n\n${projectOperatingSystemLine(operatingSystem,brief)}`,
      detail:'Choose only one listed VAL operating system. Record “No material deviations” when that is true.'
    };
  }
  return {
    targetField:'project_sop_packet.sop_id',
    question:'Review the prepared operating-system selection, then apply it to this Project Manager.',
    detail:'Applying changes only the selected internal SOP packet. Nothing external happens.'
  };
}

function projectPhaseName(value='',phases=[]){
  const normalized=compactText(value,220).toLowerCase().replace(/\s+/g,' ');
  if(!normalized) return '';
  return safeArray(phases).find((phase)=>compactText(phase,220).toLowerCase()===normalized) || '';
}
function projectPhaseTemplate(value={},brief={}){
  const raw=typeof value === 'string' ? {currentPhase:value} : (value || {});
  return {
    id:compactText(raw.id || stableKey(`project_phase_${brief.entityId || brief.projectName || 'project'}`),220),
    currentPhase:projectPhaseName(raw.currentPhase || raw.current_phase || raw.phase || raw.name,brief.availablePhases),
    phaseEvidence:compactText(raw.phaseEvidence || raw.phase_evidence || raw.evidence || raw.proof || '',700),
    exitCondition:compactText(raw.exitCondition || raw.exit_condition || raw.exit || '',700),
    nextPhaseTrigger:compactText(raw.nextPhaseTrigger || raw.next_phase_trigger || raw.nextTrigger || raw.next_trigger || '',700),
    basis:compactText(raw.basis || raw.evidenceBasis || raw.evidence_basis || '',700),
    confidence:compactText(raw.confidence || '',120),
    sourceRefs:safeArray(raw.sourceRefs || raw.source_refs || brief.sourceRefs).map(sourceRef)
  };
}
function normalizeProjectPhase(value={},brief={}){
  return projectPhaseTemplate(value,brief);
}
function missingProjectPhaseFields(value={},brief={}){
  const phase=normalizeProjectPhase(value,brief);
  const missing=[];
  if(!phase.currentPhase) missing.push('current phase from the selected operating-system sequence');
  if(!compactText(phase.phaseEvidence)) missing.push('phase evidence');
  if(!compactText(phase.exitCondition)) missing.push('phase exit condition');
  if(!compactText(phase.nextPhaseTrigger)) missing.push('next-phase trigger');
  if(!compactText(phase.basis)) missing.push('basis');
  if(!compactText(phase.confidence)) missing.push('confidence');
  return missing;
}
function projectPhaseLine(value={},brief={}){
  const phase=normalizeProjectPhase(value,brief);
  return [
    phase.currentPhase || 'Current phase: choose one available phase',
    'phase evidence: ' + (phase.phaseEvidence || '...'),
    'exit condition: ' + (phase.exitCondition || '...'),
    'next-phase trigger: ' + (phase.nextPhaseTrigger || '...'),
    'basis: ' + (phase.basis || '...'),
    'confidence: ' + (phase.confidence || '...')
  ].join(' | ');
}
function parseProjectPhase(answer='',brief={},current={}){
  const source=multilineText(answer,5000).trim();
  if(!source) return normalizeProjectPhase(current,brief);
  const previous=normalizeProjectPhase(current,brief);
  const parts=source.split('|').map((part)=>part.trim()).filter(Boolean);
  let currentPhase=projectPhaseName(monitoringValueFromLine(source,'current phase|phase'),brief.availablePhases);
  let phaseEvidence=monitoringValueFromLine(source,'phase evidence|evidence|proof');
  let exitCondition=monitoringValueFromLine(source,'exit condition|phase exit|exit');
  let nextPhaseTrigger=monitoringValueFromLine(source,'next-phase trigger|next phase trigger|next trigger');
  let basis=monitoringValueFromLine(source,'basis|evidence basis');
  let confidence=monitoringValueFromLine(source,'confidence');
  if(parts.length >= 6){
    currentPhase=currentPhase || projectPhaseName(parts[0].replace(/^\s*(?:current phase|phase)\s*:\s*/i,''),brief.availablePhases);
    phaseEvidence=phaseEvidence || parts[1].replace(/^\s*(?:phase evidence|evidence|proof)\s*:\s*/i,'');
    exitCondition=exitCondition || parts[2].replace(/^\s*(?:exit condition|phase exit|exit)\s*:\s*/i,'');
    nextPhaseTrigger=nextPhaseTrigger || parts[3].replace(/^\s*(?:next-phase trigger|next phase trigger|next trigger)\s*:\s*/i,'');
    basis=basis || parts[4].replace(/^\s*(?:basis|evidence basis)\s*:\s*/i,'');
    confidence=confidence || parts[5].replace(/^\s*confidence\s*:\s*/i,'');
  }
  return normalizeProjectPhase({
    ...previous,
    currentPhase:currentPhase || previous.currentPhase,
    phaseEvidence:phaseEvidence || previous.phaseEvidence,
    exitCondition:exitCondition || previous.exitCondition,
    nextPhaseTrigger:nextPhaseTrigger || previous.nextPhaseTrigger,
    basis:basis || previous.basis,
    confidence:confidence || previous.confidence,
    sourceRefs:brief.sourceRefs
  },brief);
}
function buildProjectPhaseBrief(project={},input={}){
  const metadata=project.metadataJson || project.metadata || {};
  const references=projectIdentityReferences(project,input);
  const operatingSystemRaw=project.projectOperatingSystem || metadata.projectOperatingSystem || {sopId:project.sopId || metadata.sopId || metadata.intake?.sopId || ''};
  const sopId=projectOperatingSystemId(operatingSystemRaw.sopId || operatingSystemRaw.sop_id || project.sopId || metadata.sopId || metadata.intake?.sopId || '');
  const operatingSystem=PROJECT_OPERATING_SYSTEMS[sopId] || null;
  const existingRaw=project.projectPhaseRecord || metadata.projectPhaseRecord || {
    currentPhase:project.projectPhase || metadata.projectPhase || '',
    phaseEvidence:project.projectPhaseEvidence || metadata.projectPhaseEvidence || '',
    exitCondition:project.projectPhaseExitCondition || metadata.projectPhaseExitCondition || '',
    nextPhaseTrigger:project.projectPhaseNextTrigger || metadata.projectPhaseNextTrigger || '',
    basis:project.projectPhaseBasis || metadata.projectPhaseBasis || '',
    confidence:project.projectPhaseConfidence || metadata.projectPhaseConfidence || ''
  };
  const brief={
    id:stableKey(`working_brief_project_phase_${project.projectId || project.id || input.scope?.entityId || project.name}`),
    entrypointId:'project.phase',
    entityType:'project_section',
    entityId:String(project.projectId || project.id || input.scope?.entityId || ''),
    sectionId:'project_phase',
    projectName:compactText(project.name || project.displayName || metadata.projectName || 'Project',180),
    sopId:operatingSystem?.id || '',
    sopName:operatingSystem?.name || '',
    availablePhases:operatingSystem?.phases || [],
    sourceRefs:references,
    objective:'Record the selected project’s actual place in its already-applied operating-system sequence.',
    completionCondition:'One allowed current phase, phase evidence, exit condition, next-phase trigger, basis, confidence, and immutable source references are explicit.',
    approvalBoundary:'Applying this phase changes only the selected internal Project Managers SOP packet. It does not create a task, alter workstreams or milestones, message anyone, update CRM, change a calendar, or alter source evidence.'
  };
  return {...brief,currentPhase:normalizeProjectPhase(existingRaw,brief)};
}
function projectPhaseQuestion(state={},brief={}){
  const phase=normalizeProjectPhase(state.draftProjectPhase || brief.currentPhase || {},brief);
  const available=safeArray(brief.availablePhases).join('; ');
  const receiptLabels=safeArray(brief.sourceRefs).map((ref)=>compactText(ref.quoteOrSummary || ref.quote_or_summary || ref.sourceId || ref.source_id || '',180)).filter(Boolean).slice(0,3);
  if(state.stage === 'phase'){
    return {
      targetField:'project_sop_packet.{current_phase,phase_evidence,phase_exit_condition,next_phase_trigger,phase_basis,phase_confidence} + Current Phase',
      question:`Which phase is ${brief.projectName || 'this project'} actually in within ${brief.sopName}? Choose one allowed phase: ${available}. Add one line: current phase | phase evidence | phase exit condition | next-phase trigger | basis (source receipt or executive judgment) | confidence.`,
      detail:`This fills Project Managers > Current Phase only. ${receiptLabels.length ? 'Available source receipts: ' + receiptLabels.join('; ') + '. ' : ''}VAL will not advance the phase, create work, or take an external action here.`
    };
  }
  if(state.stage === 'phase_details'){
    const missing=missingProjectPhaseFields(phase,brief);
    return {
      targetField:'project_sop_packet.{current_phase,phase_evidence,phase_exit_condition,next_phase_trigger,phase_basis,phase_confidence} + Current Phase',
      question:`Fill only these missing current-phase details: ${missing.join(', ')}.\n\n${projectPhaseLine(phase,brief)}`,
      detail:'Choose only a phase from the selected operating system. Do not state a future phase as current.'
    };
  }
  return {
    targetField:'project_sop_packet.current_phase',
    question:'Review the prepared current-phase record, then apply it to this Project Manager.',
    detail:'Applying changes only the selected internal SOP packet. Nothing external happens.'
  };
}

const PROJECT_PREPARED_ARTIFACTS=Object.freeze({
  proposal_draft:{id:'proposal_draft',name:'Proposal draft'},
  invoice_draft:{id:'invoice_draft',name:'Invoice draft'},
  agreement_draft:{id:'agreement_draft',name:'Agreement draft'},
  document_draft:{id:'document_draft',name:'Document draft'},
  copy_draft:{id:'copy_draft',name:'Copy draft'},
  html_page_draft:{id:'html_page_draft',name:'HTML page draft'},
  calendar_invite_draft:{id:'calendar_invite_draft',name:'Calendar invite draft'},
  introduction_email_draft:{id:'introduction_email_draft',name:'Introduction email draft'},
  email_draft:{id:'email_draft',name:'Email draft'}
});
function projectPreparedArtifactKind(value=''){
  const normalized=compactText(value,180).toLowerCase();
  if(!normalized) return '';
  const match=Object.values(PROJECT_PREPARED_ARTIFACTS).find((option)=>{
    const id=option.id.toLowerCase();
    return normalized===id || normalized===option.name.toLowerCase() || normalized===id.replace(/_/g,' ') || normalized===`${option.name.toLowerCase()} (${id})`;
  });
  return match?.id || '';
}
function projectPreparedWorkTemplate(value={},brief={}){
  const raw=typeof value === 'string' ? {kind:value} : (value || {});
  const kind=projectPreparedArtifactKind(raw.kind || raw.type || raw.preparedArtifactKind || raw.prepared_artifact_kind || raw.artifactType || raw.artifact_type);
  const option=PROJECT_PREPARED_ARTIFACTS[kind] || null;
  return {
    id:compactText(raw.id || stableKey(`project_prepared_work_${brief.entityId || brief.projectName || 'project'}_${kind || raw.title || ''}`),220),
    kind,
    kindName:option?.name || '',
    title:compactText(raw.title || raw.workingTitle || raw.working_title || raw.name || '',500),
    audience:compactText(raw.audience || raw.intendedAudience || raw.intended_audience || raw.recipients || '',500),
    sourceContext:compactText(raw.sourceContext || raw.source_context || raw.sourceReceipt || raw.source_receipt || raw.source || '',700),
    desiredOutcome:compactText(raw.desiredOutcome || raw.desired_outcome || raw.outcome || raw.purpose || raw.whatItShouldAccomplish || raw.what_it_should_accomplish || '',700),
    reviewBoundary:compactText(raw.reviewBoundary || raw.review_boundary || raw.approvalBoundary || raw.approval_boundary || raw.review || '',700),
    basis:compactText(raw.basis || raw.evidenceBasis || raw.evidence_basis || raw.evidence || '',700),
    confidence:compactText(raw.confidence || '',120),
    sourceRefs:safeArray(raw.sourceRefs || raw.source_refs || brief.sourceRefs).map(sourceRef)
  };
}
function normalizeProjectPreparedWork(value={},brief={}){
  return projectPreparedWorkTemplate(value,brief);
}
function missingProjectPreparedWorkFields(value={},brief={}){
  const preparedWork=normalizeProjectPreparedWork(value,brief);
  const missing=[];
  if(!preparedWork.kind) missing.push('artifact type from the available choices');
  if(!compactText(preparedWork.title)) missing.push('working title');
  if(!compactText(preparedWork.audience)) missing.push('intended audience');
  if(!compactText(preparedWork.sourceContext)) missing.push('source receipt or project evidence to use');
  if(!compactText(preparedWork.desiredOutcome)) missing.push('desired outcome');
  if(!compactText(preparedWork.reviewBoundary)) missing.push('review or approval boundary');
  if(!compactText(preparedWork.basis)) missing.push('basis');
  if(!compactText(preparedWork.confidence)) missing.push('confidence');
  return missing;
}
function projectPreparedWorkLine(value={},brief={}){
  const preparedWork=normalizeProjectPreparedWork(value,brief);
  return [
    preparedWork.kindName || 'Artifact type: choose one available type',
    'working title: ' + (preparedWork.title || '...'),
    'audience: ' + (preparedWork.audience || '...'),
    'source context: ' + (preparedWork.sourceContext || '...'),
    'desired outcome: ' + (preparedWork.desiredOutcome || '...'),
    'review boundary: ' + (preparedWork.reviewBoundary || '...'),
    'basis: ' + (preparedWork.basis || '...'),
    'confidence: ' + (preparedWork.confidence || '...')
  ].join(' | ');
}
function parseProjectPreparedWork(answer='',brief={},current={}){
  const source=multilineText(answer,5000).trim();
  if(!source) return normalizeProjectPreparedWork(current,brief);
  const previous=normalizeProjectPreparedWork(current,brief);
  const parts=source.split('|').map((part)=>part.trim()).filter(Boolean);
  let kind=projectPreparedArtifactKind(monitoringValueFromLine(source,'artifact type|artifact|prepared artifact|type|kind'));
  let title=monitoringValueFromLine(source,'working title|title');
  let audience=monitoringValueFromLine(source,'intended audience|audience|recipient');
  let sourceContext=monitoringValueFromLine(source,'source context|source receipt|source evidence|source');
  let desiredOutcome=monitoringValueFromLine(source,'desired outcome|outcome|purpose|what it should accomplish');
  let reviewBoundary=monitoringValueFromLine(source,'review boundary|approval boundary|review');
  let basis=monitoringValueFromLine(source,'basis|evidence basis|evidence');
  let confidence=monitoringValueFromLine(source,'confidence');
  if(parts.length >= 8){
    kind=kind || projectPreparedArtifactKind(parts[0].replace(/^\s*(?:artifact type|artifact|prepared artifact|type|kind)\s*:\s*/i,''));
    title=title || parts[1].replace(/^\s*(?:working title|title)\s*:\s*/i,'');
    audience=audience || parts[2].replace(/^\s*(?:intended audience|audience|recipient)\s*:\s*/i,'');
    sourceContext=sourceContext || parts[3].replace(/^\s*(?:source context|source receipt|source evidence|source)\s*:\s*/i,'');
    desiredOutcome=desiredOutcome || parts[4].replace(/^\s*(?:desired outcome|outcome|purpose|what it should accomplish)\s*:\s*/i,'');
    reviewBoundary=reviewBoundary || parts[5].replace(/^\s*(?:review boundary|approval boundary|review)\s*:\s*/i,'');
    basis=basis || parts[6].replace(/^\s*(?:basis|evidence basis|evidence)\s*:\s*/i,'');
    confidence=confidence || parts[7].replace(/^\s*confidence\s*:\s*/i,'');
  }
  return normalizeProjectPreparedWork({
    ...previous,
    kind:kind || previous.kind,
    title:title || previous.title,
    audience:audience || previous.audience,
    sourceContext:sourceContext || previous.sourceContext,
    desiredOutcome:desiredOutcome || previous.desiredOutcome,
    reviewBoundary:reviewBoundary || previous.reviewBoundary,
    basis:basis || previous.basis,
    confidence:confidence || previous.confidence,
    sourceRefs:brief.sourceRefs
  },brief);
}
function buildProjectPreparedWorkBrief(project={},input={}){
  const metadata=project.metadataJson || project.metadata || {};
  const references=projectIdentityReferences(project,input);
  const existing=safeArray(project.projectPreparedWork || metadata.projectPreparedWork || project.preparedWork || metadata.preparedWork).map((item)=>normalizeProjectPreparedWork(item,{sourceRefs:references}));
  return {
    id:stableKey(`working_brief_project_prepared_work_${project.projectId || project.id || input.scope?.entityId || project.name}`),
    entrypointId:'project.prepared_work',
    entityType:'project_section',
    entityId:String(project.projectId || project.id || input.scope?.entityId || ''),
    sectionId:'prepared_work',
    projectName:compactText(project.name || project.displayName || metadata.projectName || 'Project',180),
    availableArtifactTypes:Object.values(PROJECT_PREPARED_ARTIFACTS),
    existingPreparedWork:existing,
    sourceRefs:references,
    objective:'Decide the one reviewable artifact VAL should prepare for the selected project, with the correct evidence and approval boundary.',
    completionCondition:'One allowed artifact type, working title, audience, source context, desired outcome, review boundary, basis, confidence, and immutable source references are explicit.',
    approvalBoundary:'Applying this proposal changes only the selected project’s internal Prepared Work packet and creates one internal Ready for You review item. It does not generate content, create a provider draft, send a message, publish a page, create a calendar event, update CRM, alter source evidence, or create a task.'
  };
}
function projectPreparedWorkQuestion(state={},brief={}){
  const preparedWork=normalizeProjectPreparedWork(state.draftProjectPreparedWork || {},brief);
  const available=safeArray(brief.availableArtifactTypes).map((option)=>`${option.name} (${option.id})`).join('; ');
  const receiptLabels=safeArray(brief.sourceRefs).map((ref)=>compactText(ref.quoteOrSummary || ref.quote_or_summary || ref.sourceId || ref.source_id || '',180)).filter(Boolean).slice(0,3);
  if(state.stage === 'prepared_work'){
    return {
      targetField:'project_prepared_work_packets[].{kind,title,audience,source_context,desired_outcome,review_boundary,basis,confidence} + Ready for You',
      question:`What one reviewable artifact should VAL prepare for ${brief.projectName || 'this project'}? Choose one available type: ${available}. Add one line: artifact type | working title | intended audience | source receipt or project evidence to use | desired outcome | review or approval boundary | basis (source receipt or executive judgment) | confidence.`,
      detail:`This fills Project Managers > Prepared work and creates one internal Ready for You item after review. ${receiptLabels.length ? 'Available source receipts: ' + receiptLabels.join('; ') + '. ' : ''}VAL will not generate the content or take an external action here.`
    };
  }
  if(state.stage === 'prepared_work_details'){
    const missing=missingProjectPreparedWorkFields(preparedWork,brief);
    return {
      targetField:'project_prepared_work_packets[].{kind,title,audience,source_context,desired_outcome,review_boundary,basis,confidence} + Ready for You',
      question:`Fill only these missing Prepared Work details: ${missing.join(', ')}.\n\n${projectPreparedWorkLine(preparedWork,brief)}`,
      detail:'Choose only an existing VAL artifact type. The review boundary must make clear that no external action is authorized.'
    };
  }
  return {
    targetField:'project_prepared_work_packets',
    question:'Review the prepared artifact proposal, then apply it to this Project Manager and Ready for You.',
    detail:'Applying creates an internal proposal only. Nothing is drafted, sent, published, scheduled, or changed externally.'
  };
}

const PROJECT_OVERVIEW_FOCUS_TYPES=Object.freeze({
  decision:{id:'decision',name:'Decision'},
  plan:{id:'plan',name:'Plan'},
  comparison:{id:'comparison',name:'Comparison'},
  prepared_artifact:{id:'prepared_artifact',name:'Prepared artifact'},
  missing_input:{id:'missing_input',name:'Missing input'}
});
const PROJECT_OVERVIEW_TARGET_SECTIONS=Object.freeze({
  why_it_matters:'Why it matters',
  next_move:'Next move',
  people_involved:'People involved',
  prepared_work:'Prepared work',
  documents_sources:'Documents / sources',
  risk_blocker:'Risk / blocker',
  working_narrative:'Working narrative',
  what_val_needs_next:'What VAL needs next',
  sop_fit:'Operating System',
  project_phase:'Current Phase',
  project_interview:'Project Interview',
  workstreams:'Workstreams',
  milestones:'Milestones',
  monitoring_rules:'Monitoring after launch',
  relationship_nurture:'Relationship nurture'
});
function projectOverviewFocusType(value=''){
  const normalized=compactText(value,180).toLowerCase();
  if(!normalized) return '';
  const match=Object.values(PROJECT_OVERVIEW_FOCUS_TYPES).find((option)=>normalized===option.id || normalized===option.name.toLowerCase() || normalized===option.id.replace(/_/g,' '));
  return match?.id || '';
}
function projectOverviewTargetSection(value=''){
  const normalized=compactText(value,180).toLowerCase();
  if(!normalized) return '';
  const match=Object.entries(PROJECT_OVERVIEW_TARGET_SECTIONS).find(([id,name])=>normalized===id || normalized===name.toLowerCase() || normalized===id.replace(/_/g,' '));
  return match?.[0] || '';
}
function projectOverviewFocusTemplate(value={},brief={}){
  const raw=typeof value === 'string' ? {focusStatement:value} : (value || {});
  const focusType=projectOverviewFocusType(raw.focusType || raw.focus_type || raw.type);
  const targetSection=projectOverviewTargetSection(raw.targetSection || raw.target_section || raw.followThroughSection || raw.follow_through_section || raw.section);
  return {
    id:compactText(raw.id || stableKey(`project_overview_focus_${brief.entityId || brief.projectName || 'project'}_${focusType || raw.title || ''}`),220),
    focusType,
    focusTypeName:PROJECT_OVERVIEW_FOCUS_TYPES[focusType]?.name || '',
    title:compactText(raw.title || raw.focusTitle || raw.focus_title || '',500),
    focusStatement:compactText(raw.focusStatement || raw.focus_statement || raw.request || raw.question || raw.decision || '',900),
    completionCondition:compactText(raw.completionCondition || raw.completion_condition || raw.successCondition || raw.success_condition || '',700),
    targetSection,
    targetSectionName:PROJECT_OVERVIEW_TARGET_SECTIONS[targetSection] || '',
    basis:compactText(raw.basis || raw.evidenceBasis || raw.evidence_basis || raw.evidence || '',700),
    confidence:compactText(raw.confidence || '',120),
    sourceRefs:safeArray(raw.sourceRefs || raw.source_refs || brief.sourceRefs).map(sourceRef)
  };
}
function normalizeProjectOverviewFocus(value={},brief={}){
  return projectOverviewFocusTemplate(value,brief);
}
function missingProjectOverviewFocusFields(value={},brief={}){
  const focus=normalizeProjectOverviewFocus(value,brief);
  const missing=[];
  if(!focus.focusType) missing.push('focus type from the available choices');
  if(!compactText(focus.title)) missing.push('focus title');
  if(!compactText(focus.focusStatement)) missing.push('exact question, decision, or work to resolve');
  if(!compactText(focus.completionCondition)) missing.push('useful completion condition');
  if(!focus.targetSection) missing.push('Project Managers follow-through section');
  if(!compactText(focus.basis)) missing.push('basis');
  if(!compactText(focus.confidence)) missing.push('confidence');
  return missing;
}
function projectOverviewFocusLine(value={},brief={}){
  const focus=normalizeProjectOverviewFocus(value,brief);
  return [
    focus.focusTypeName || 'Focus type: choose one available type',
    'focus title: ' + (focus.title || '...'),
    'focus: ' + (focus.focusStatement || '...'),
    'complete when: ' + (focus.completionCondition || '...'),
    'follow-through section: ' + (focus.targetSectionName || '...'),
    'basis: ' + (focus.basis || '...'),
    'confidence: ' + (focus.confidence || '...')
  ].join(' | ');
}
function parseProjectOverviewFocus(answer='',brief={},current={}){
  const source=multilineText(answer,5000).trim();
  if(!source) return normalizeProjectOverviewFocus(current,brief);
  const previous=normalizeProjectOverviewFocus(current,brief);
  const parts=source.split('|').map((part)=>part.trim()).filter(Boolean);
  let focusType=projectOverviewFocusType(monitoringValueFromLine(source,'focus type|type'));
  let title=monitoringValueFromLine(source,'focus title|title');
  let focusStatement=monitoringValueFromLine(source,'focus|question|decision|work to resolve');
  let completionCondition=monitoringValueFromLine(source,'complete when|completion condition|success condition');
  let targetSection=projectOverviewTargetSection(monitoringValueFromLine(source,'follow-through section|target section|section'));
  let basis=monitoringValueFromLine(source,'basis|evidence basis|evidence');
  let confidence=monitoringValueFromLine(source,'confidence');
  if(parts.length >= 7){
    focusType=focusType || projectOverviewFocusType(parts[0].replace(/^\s*(?:focus type|type)\s*:\s*/i,''));
    title=title || parts[1].replace(/^\s*(?:focus title|title)\s*:\s*/i,'');
    focusStatement=focusStatement || parts[2].replace(/^\s*(?:focus|question|decision|work to resolve)\s*:\s*/i,'');
    completionCondition=completionCondition || parts[3].replace(/^\s*(?:complete when|completion condition|success condition)\s*:\s*/i,'');
    targetSection=targetSection || projectOverviewTargetSection(parts[4].replace(/^\s*(?:follow-through section|target section|section)\s*:\s*/i,''));
    basis=basis || parts[5].replace(/^\s*(?:basis|evidence basis|evidence)\s*:\s*/i,'');
    confidence=confidence || parts[6].replace(/^\s*confidence\s*:\s*/i,'');
  }
  return normalizeProjectOverviewFocus({
    ...previous,
    focusType:focusType || previous.focusType,
    title:title || previous.title,
    focusStatement:focusStatement || previous.focusStatement,
    completionCondition:completionCondition || previous.completionCondition,
    targetSection:targetSection || previous.targetSection,
    basis:basis || previous.basis,
    confidence:confidence || previous.confidence,
    sourceRefs:brief.sourceRefs
  },brief);
}
function buildProjectOverviewBrief(project={},input={}){
  const metadata=project.metadataJson || project.metadata || {};
  const references=projectIdentityReferences(project,input);
  const currentFocus=normalizeProjectOverviewFocus(project.projectOverviewFocus || metadata.projectOverviewFocus || {},{sourceRefs:references});
  return {
    id:stableKey(`working_brief_project_overview_${project.projectId || project.id || input.scope?.entityId || project.name}`),
    entrypointId:'project.overview',
    entityType:'project_section',
    entityId:String(project.projectId || project.id || input.scope?.entityId || ''),
    sectionId:'project_overview',
    projectName:compactText(project.name || project.displayName || metadata.projectName || 'Project',180),
    currentReality:compactText(project.livingNarrative || project.reality || project.summary || '',900),
    recommendedNextMove:compactText(project.nextMove || metadata.nextMove || '',500),
    availableFocusTypes:Object.values(PROJECT_OVERVIEW_FOCUS_TYPES),
    availableTargetSections:Object.entries(PROJECT_OVERVIEW_TARGET_SECTIONS).map(([id,name])=>({id,name})),
    currentFocus,
    sourceRefs:references,
    objective:'Choose the one bounded question or work item the Project Managers Round Table should focus on next.',
    completionCondition:'One allowed focus type, title, exact focus, useful completion condition, named Project Managers follow-through section, basis, confidence, and immutable source references are explicit.',
    approvalBoundary:'Applying this focus changes only the selected project’s internal Round Table focus packet. It does not rewrite the named follow-through section, create a task, generate content, send a message, update CRM, change a calendar, or alter source evidence.'
  };
}
function projectOverviewQuestion(state={},brief={}){
  const focus=normalizeProjectOverviewFocus(state.draftProjectOverviewFocus || brief.currentFocus || {},brief);
  const focusTypes=safeArray(brief.availableFocusTypes).map((option)=>`${option.name} (${option.id})`).join('; ');
  const targetSections=safeArray(brief.availableTargetSections).map((option)=>`${option.name} (${option.id})`).join('; ');
  const receiptLabels=safeArray(brief.sourceRefs).map((ref)=>compactText(ref.quoteOrSummary || ref.quote_or_summary || ref.sourceId || ref.source_id || '',180)).filter(Boolean).slice(0,3);
  if(state.stage === 'project_overview'){
    return {
      targetField:'project_overview_focus_packet.{focus_type,title,focus_statement,completion_condition,target_section,basis,confidence} + Round Table focus',
      question:`What one thing should the ${brief.projectName || 'selected project'} Round Table focus on now? Choose one type: ${focusTypes}. Add one line: focus type | focus title | exact question, decision, or work to resolve | useful completion condition | Project Managers follow-through section (${targetSections}) | basis (source receipt or executive judgment) | confidence.`,
      detail:`This creates one visible focus only; it does not rewrite the target section. ${receiptLabels.length ? 'Available source receipts: ' + receiptLabels.join('; ') + '. ' : ''}VAL will not create tasks, draft content, or take external action here.`
    };
  }
  if(state.stage === 'project_overview_details'){
    const missing=missingProjectOverviewFocusFields(focus,brief);
    return {
      targetField:'project_overview_focus_packet.{focus_type,title,focus_statement,completion_condition,target_section,basis,confidence} + Round Table focus',
      question:`Fill only these missing Round Table Focus details: ${missing.join(', ')}.\n\n${projectOverviewFocusLine(focus,brief)}`,
      detail:'Choose only a focus type and Project Managers follow-through section that already exist. This records the focus; it does not update the target section.'
    };
  }
  return {
    targetField:'project_overview_focus_packet',
    question:'Review the Round Table Focus, then apply it to this Project Manager.',
    detail:'Applying updates only this project’s internal focus packet. Nothing external happens and no other section is rewritten.'
  };
}

function answerField(answer='', labels=''){
  const source=String(answer || '');
  const match=source.match(new RegExp(`(?:^|[;\\n])\\s*(?:${labels})\\s*:\\s*([^;\\n]+)`, 'i'));
  return compactText(match?.[1] || '',500);
}
function nextMoveProposalFromAnswer(answer='', current={}){
  const source=multilineText(answer,5000);
  const hasLabels=/(?:^|[;\n])\s*(?:next move|action|move|owner|accountable owner|timing|when|due|trigger|basis|why now|reason)\s*:/i.test(source);
  const action=answerField(source,'next move|action|move') || (!hasLabels ? compactText(source,500) : '');
  return {
    nextMove:action || compactText(current.nextMove || '',500),
    accountableOwner:answerField(source,'accountable owner|owner') || compactText(current.accountableOwner || '',180),
    timingOrTrigger:answerField(source,'timing|when|due|trigger') || compactText(current.timingOrTrigger || '',300),
    basis:answerField(source,'why now|basis|reason') || compactText(current.basis || '',700)
  };
}
function missingNextMoveFields(proposal={}){
  const missing=[];
  if(!compactText(proposal.nextMove)) missing.push('next move');
  if(!compactText(proposal.accountableOwner)) missing.push('owner');
  if(!compactText(proposal.timingOrTrigger)) missing.push('timing or trigger');
  if(!compactText(proposal.basis)) missing.push('basis');
  return missing;
}
function buildProjectNextMoveBrief(project={},input={}){
  const metadata=project.metadataJson || project.metadata || {};
  const sourceDetails=project.sourceDetails || metadata.sourceDetails || {};
  const linkedPeople=uniqueNames([metadata.owner?.name,project.nextStepOwner,sourceDetails.relationships,metadata.intake?.relationships,project.relationships].filter(Boolean));
  const references=[
    sourceRef({sourceType:'project_packet',sourceId:project.projectId || project.id || input.scope?.entityId || '',quoteOrSummary:project.sourceReceipts || project.nextMoveEvidence || project.reality || project.summary || 'Project packet'}),
    sourceDetails.documents && sourceRef({sourceType:'document',sourceId:project.projectId || project.id || '',quoteOrSummary:`Project documents: ${sourceDetails.documents}`}),
    sourceDetails.rawContext && sourceRef({sourceType:'project_context',sourceId:project.projectId || project.id || '',quoteOrSummary:sourceDetails.rawContext})
  ].filter(Boolean);
  const sourceBasis=compactText(project.nextMoveEvidence || references[0]?.quote_or_summary || '',700);
  return {
    id:stableKey(`working_brief_project_next_move_${project.projectId || project.id || input.scope?.entityId || project.name}`),
    entrypointId:'project.next_move',
    entityType:'project_section',
    entityId:String(project.projectId || project.id || input.scope?.entityId || ''),
    sectionId:'next_move',
    projectName:compactText(project.name || project.displayName || metadata.projectName || 'Project',180),
    desiredOutcome:compactText(project.desiredOutcome || project.outcome || metadata.desiredOutcome || metadata.outcome || '',500),
    currentReality:compactText(project.reality || project.summary || '',900),
    linkedPeople,
    sourceRefs:references,
    currentProposal:{
      nextMove:compactText(project.nextMove || metadata.nextMove || '',500),
      accountableOwner:compactText(project.nextStepOwner || metadata.nextStepOwner || metadata.owner?.name || '',180),
      timingOrTrigger:compactText(project.nextStepDueAt || project.deadline || project.dueAt || metadata.nextStepDueAt || '',300),
      basis:sourceBasis
    },
    objective:'Commit to the smallest concrete move that advances this selected project without scattering its context.',
    completionCondition:'The next move has one concrete action, one accountable owner, a timing or trigger, and a source or decision basis.',
    approvalBoundary:'Applying the next move changes only the internal Project Managers packet. It does not create a task, send a message, update CRM, schedule anything, or alter a source document.'
  };
}
function nextMoveQuestion(state={},brief={}){
  const stage=state.stage || 'next_move';
  const current=state.draftNextMove || brief.currentProposal || {};
  if(stage === 'next_move'){
    if(compactText(current.nextMove)){
      return {
        targetField:'project_next_action_packet.next_action',
        question:`The current proposed move for ${brief.projectName || 'this project'} is "${current.nextMove}". Should that remain the next narrow move, or what should replace it?`,
        detail:'This answer fills Project Managers > Next move. It does not create a task or send anything.'
      };
    }
    return {
      targetField:'project_next_action_packet.next_action',
      question:`What is the one smallest concrete move that should advance ${brief.projectName || 'this project'} now?`,
      detail:'Name one action only. VAL will then ask only for the owner, timing or trigger, and basis that are still missing.'
    };
  }
  if(stage === 'next_move_details'){
    const missing=missingNextMoveFields(current);
    return {
      targetField:'project_next_action_packet.{next_action,owner,due_at,why_now}',
      question:`Fill only the missing details for this next move: ${missing.join(', ')}.`,
      detail:'Use: Next move: ...; Owner: ...; Timing: ...; Basis: ... . The basis can name a source receipt or an executive decision.'
    };
  }
  return {
    targetField:'project_next_action_packet',
    question:'Review the prepared next move, then apply it to this Project Manager.',
    detail:'Applying changes only the internal Project Managers packet.'
  };
}

function projectIdentityReferences(project={},input={}){
  const metadata=project.metadataJson || project.metadata || {};
  const sourceDetails=project.sourceDetails || metadata.sourceDetails || {};
  const projectId=project.projectId || project.id || input.scope?.entityId || '';
  return [
    project.sourceReceipts && sourceRef({sourceType:'project_packet',sourceId:projectId,quoteOrSummary:project.sourceReceipts}),
    sourceDetails.documents && sourceRef({sourceType:'document',sourceId:projectId,quoteOrSummary:`Project documents: ${sourceDetails.documents}`}),
    sourceDetails.rawContext && sourceRef({sourceType:'project_context',sourceId:projectId,quoteOrSummary:sourceDetails.rawContext})
  ].filter(Boolean);
}
function projectIdentityOwner(project={}){
  const metadata=project.metadataJson || project.metadata || {};
  const owner=metadata.owner && typeof metadata.owner === 'object' ? metadata.owner : {};
  return compactText(project.nextStepOwner || owner.name || owner.displayName || '',180);
}
function buildProjectIdentityBrief(project={},input={}){
  const metadata=project.metadataJson || project.metadata || {};
  const references=projectIdentityReferences(project,input);
  const projectId=String(project.projectId || project.id || input.scope?.entityId || '');
  const currentIdentity={
    canonicalName:compactText(project.name || project.displayName || metadata.projectName || '',180),
    purpose:compactText(project.purpose || metadata.purpose || metadata.projectPurpose || '',700),
    desiredOutcome:compactText(project.desiredOutcome || project.outcome || metadata.desiredOutcome || metadata.outcome || '',700),
    owner:projectIdentityOwner(project)
  };
  return {
    id:stableKey(`working_brief_project_identity_${projectId || currentIdentity.canonicalName}`),
    entrypointId:'project.identity',
    entityType:'project_section',
    entityId:projectId,
    sectionId:'identity',
    projectName:currentIdentity.canonicalName || 'Project',
    currentIdentity,
    sourceRefs:references,
    linkedPeople:uniqueNames([currentIdentity.owner,project.sourceDetails?.relationships,metadata.intake?.relationships,project.relationships].filter(Boolean)),
    objective:'Establish the selected project\'s canonical identity before VAL proposes operational work.',
    completionCondition:'The canonical name, who or what the project serves, desired outcome, and one project owner are explicit. Existing source references are preserved without copying details from another project.',
    approvalBoundary:'Applying the project foundation changes only the internal Project Managers packet. It does not create workstreams or tasks, link a relationship, update CRM, send a message, schedule anything, or alter a source document.'
  };
}
function missingProjectIdentityFields(identity={}){
  const missing=[];
  if(!compactText(identity.canonicalName)) missing.push('project name');
  if(!compactText(identity.purpose)) missing.push('who or what it serves');
  if(!compactText(identity.desiredOutcome)) missing.push('desired outcome');
  if(!compactText(identity.owner)) missing.push('project owner');
  return missing;
}
function identityAnswerHasLabels(answer=''){
  return /(?:^|[;\n])\s*(?:project name|name|called|who or what it serves|serves|beneficiary|audience|purpose|desired outcome|outcome|project owner|owner)\s*:/i.test(String(answer || ''));
}
function identityAnswerValue(answer='',labels=''){
  return answerField(answer,labels);
}
function projectIdentityFromAnswer(answer='',current={},stage='identity'){
  const source=multilineText(answer,5000);
  const next={
    canonicalName:compactText(current.canonicalName || '',180),
    purpose:compactText(current.purpose || '',700),
    desiredOutcome:compactText(current.desiredOutcome || '',700),
    owner:compactText(current.owner || '',180)
  };
  const hasLabels=identityAnswerHasLabels(source);
  const canonicalName=identityAnswerValue(source,'project name|name|called');
  const purpose=identityAnswerValue(source,'who or what it serves|serves|beneficiary|audience|purpose|what this is');
  const desiredOutcome=identityAnswerValue(source,'desired outcome|outcome');
  const owner=identityAnswerValue(source,'project owner|owner|accountable owner');
  if(canonicalName) next.canonicalName=canonicalName;
  if(purpose) next.purpose=purpose;
  if(desiredOutcome) next.desiredOutcome=desiredOutcome;
  if(owner) next.owner=owner;
  if(!hasLabels){
    const identityMissing=['canonicalName','purpose','desiredOutcome'].filter((field)=>!compactText(next[field]));
    if(stage === 'owner') next.owner=compactText(source,180) || next.owner;
    else if(identityMissing.length === 1) next[identityMissing[0]]=compactText(source,700) || next[identityMissing[0]];
  }
  return next;
}
function projectIdentityQuestion(state={},brief={}){
  const identity=state.draftIdentity || brief.currentIdentity || {};
  const stage=state.stage || 'identity';
  if(stage === 'identity'){
    return {
      targetField:'project_identity_packet.{canonical_name,purpose,desired_outcome}',
      question:`For ${brief.projectName || 'this project'}, confirm or correct its name, then name who or what it serves and the outcome it should create.`,
      detail:'Use: Project name: ...; Serves: ...; Desired outcome: ... . This fills Project Managers > Identity, What this is, and the foundation for Working narrative.'
    };
  }
  if(stage === 'identity_details'){
    const missing=missingProjectIdentityFields(identity).filter((field)=>field !== 'project owner');
    return {
      targetField:'project_identity_packet.{canonical_name,purpose,desired_outcome}',
      question:`I still need ${missing.join(', ')} for this selected project.`,
      detail:'Use only the missing labels: Project name: ...; Serves: ...; Desired outcome: ... .'
    };
  }
  if(stage === 'owner'){
    return {
      targetField:'project_owner_packet.owner',
      question:`Who is the one project owner for ${identity.canonicalName || brief.projectName || 'this project'}?`,
      detail:'Name one accountable person or relationship. This fills Project Managers > People involved and does not create or change a relationship; reassignment remains explicit there.'
    };
  }
  return {
    targetField:'project_identity_packet + project_owner_packet',
    question:'Review the prepared project foundation, then apply it to this Project Manager.',
    detail:'Applying changes only the selected internal project packet. The source references remain unchanged.'
  };
}

function projectPeopleList(value=[]){
  const raw=Array.isArray(value) ? value : String(value || '').split(/\n|,|;/);
  return raw.map((item)=>typeof item === 'string' ? item : (item?.name || item?.displayName || '')).map((item)=>compactText(item,180)).filter(Boolean);
}
function relationshipCandidate(profile={}){
  return {
    id:compactText(profile.id || profile.relationshipId || profile.profileKey || profile.personId || profile.contactId || profile.email || '',220),
    name:compactText(profile.displayName || profile.name || profile.relationshipName || '',180),
    email:compactText(profile.email || profile.metadata?.email || '',220),
    detail:compactText(profile.company || profile.role || profile.relationshipStatus || profile.summary || '',240)
  };
}
function projectPeopleCandidateMatch(value='',candidates=[]){
  const needle=compactText(value,220).toLowerCase();
  return safeArray(candidates).find((candidate)=>[candidate.id,candidate.name,candidate.email].filter(Boolean).some((item)=>String(item).toLowerCase() === needle)) || null;
}
function buildProjectPeopleBrief(project={},candidates=[],input={}){
  const metadata=project.metadataJson || project.metadata || {};
  const sourceDetails=project.sourceDetails || metadata.sourceDetails || {};
  const existingNames=uniqueNames([project.relationships,sourceDetails.relationships,metadata.intake?.relationships].filter(Boolean));
  const knownCandidates=safeArray(candidates).map(relationshipCandidate).filter((candidate)=>candidate.id && candidate.name);
  const existingPeople=existingNames.map((name)=>{
    const candidate=projectPeopleCandidateMatch(name,knownCandidates);
    return {relationshipId:candidate?.id || '',name:candidate?.name || name,email:candidate?.email || '',role:'',known:Boolean(candidate)};
  });
  const references=projectIdentityReferences(project,input);
  return {
    id:stableKey(`working_brief_project_people_${project.projectId || project.id || input.scope?.entityId || project.name}`),
    entrypointId:'project.people',
    entityType:'project_section',
    entityId:String(project.projectId || project.id || input.scope?.entityId || ''),
    sectionId:'people',
    projectName:compactText(project.name || project.displayName || metadata.projectName || 'Project',180),
    existingPeople,
    currentOwner:projectIdentityOwner(project),
    relationshipCandidates:knownCandidates.slice(0,40),
    sourceRefs:references,
    objective:'Connect the correct existing relationships to the selected project and make one project owner explicit.',
    completionCondition:'Every retained person has an existing relationship, a role in the project, and one of those people is the explicit owner.',
    approvalBoundary:'Applying links only the selected existing relationships to this internal project and records one owner. It does not create a relationship, update CRM, send a message, create a task, schedule anything, or alter source evidence.'
  };
}
function parseProjectPeople(answer='',brief={},current={}){
  const source=multilineText(answer,5000);
  const existingPeople=safeArray(Array.isArray(current) ? current : current.people);
  const existingOwnerId=compactText(Array.isArray(current) ? '' : current.ownerId || '',220);
  const labeled=/(?:^|[;\n])\s*(?:people|relationships|people involved|owner|project owner)\s*:/i.test(source);
  const peopleMatch=source.match(/(?:^|\n)\s*(?:people involved|relationships|people)\s*:\s*([\s\S]*?)(?=(?:\n|;)\s*(?:project owner|owner)\s*:|$)/i);
  const peopleText=compactText(peopleMatch?.[1] || '',5000) || (!labeled ? source : '');
  const owner=answerField(source,'project owner|owner');
  const items=peopleText.split(/\n|;/).map((item)=>item.trim()).filter(Boolean).flatMap((item)=>item.split(/,(?![^()]*\))/).map((part)=>part.trim())).filter(Boolean);
  const draft=[];
  const unresolved=[];
  for(const item of items){
    const match=item.match(/^(.+?)(?:\s+[-\u2013]\s+|\s*:\s*)(.+)$/);
    const candidateName=compactText(match?.[1] || item,180);
    const role=compactText(match?.[2] || '',240);
    const candidate=projectPeopleCandidateMatch(candidateName,brief.relationshipCandidates);
    if(!candidate){
      if(candidateName) unresolved.push(candidateName);
      continue;
    }
    if(!draft.some((person)=>person.relationshipId === candidate.id)) draft.push({relationshipId:candidate.id,name:candidate.name,email:candidate.email,role,known:true});
  }
  if(!items.length && existingPeople.length) draft.push(...existingPeople);
  for(const person of draft){
    const existing=existingPeople.find((item)=>item.relationshipId===person.relationshipId);
    if(existing?.role && !person.role) person.role=existing.role;
  }
  const ownerCandidate=projectPeopleCandidateMatch(owner,brief.relationshipCandidates) || draft.find((person)=>person.relationshipId===existingOwnerId) || draft.find((person)=>person.name.toLowerCase()===String(owner || brief.currentOwner || '').toLowerCase()) || null;
  return {people:draft,ownerId:ownerCandidate?.relationshipId || ownerCandidate?.id || '',ownerName:ownerCandidate?.name || compactText(owner || '',180),unresolved:uniqueNames(unresolved)};
}
function missingProjectPeopleFields(proposal={}){
  const missing=[];
  if(!safeArray(proposal.people).length) missing.push('relationships');
  if(safeArray(proposal.people).some((person)=>!compactText(person.role))) missing.push('roles');
  if(!compactText(proposal.ownerId) || !safeArray(proposal.people).some((person)=>person.relationshipId===proposal.ownerId)) missing.push('project owner');
  return missing;
}
function projectPeopleQuestion(state={},brief={}){
  const proposal=state.draftPeople || {people:[],ownerId:'',unresolved:[]};
  if(state.stage === 'people'){
    const choices=safeArray(brief.relationshipCandidates).slice(0,12).map((person)=>person.name).join(', ');
    return {
      targetField:'project_relationships_packet[].{relationship_name,role_in_project}',
      question:`Which existing relationships belong on ${brief.projectName || 'this project'}, and what is each person's role?`,
      detail:`Use: People: Name - role; Name - role. Available relationships: ${choices || 'none loaded yet'}. Creating a new relationship stays in People involved, then reopen this brief.`
    };
  }
  if(state.stage === 'unresolved'){
    return {
      targetField:'project_relationships_packet[].relationship_name',
      question:`I cannot link ${proposal.unresolved.join(', ')} because those relationships are not in VAL yet.`,
      detail:'Create the relationship from People involved, then reopen this brief. VAL will not silently invent or duplicate a relationship.'
    };
  }
  if(state.stage === 'roles'){
    const missing=safeArray(proposal.people).filter((person)=>!compactText(person.role)).map((person)=>person.name).join(', ');
    return {targetField:'project_relationships_packet[].role_in_project',question:`What is each missing role for ${missing}?`,detail:'Use: Name - role. This writes only the selected project relationship roles.'};
  }
  if(state.stage === 'owner'){
    return {targetField:'project_owner_packet.owner',question:`Which one of these linked people owns ${brief.projectName || 'this project'}?`,detail:'Use: Owner: Name. One owner is recorded; changing it later remains explicit in People involved.'};
  }
  return {targetField:'project_relationships_packet + project_owner_packet',question:'Review the linked people and owner, then apply them to this Project Manager.',detail:'Applying creates internal relationship links only. Nothing external happens.'};
}

function sourceDocumentCandidate(document={}){
  const refs=safeArray(document.sourceRefs || document.source_refs).map(sourceRef);
  const id=compactText(document.id || document.documentId || document.sourceId || '',220);
  const title=compactText(document.title || document.name || document.fileName || 'Untitled document',240);
  const sourceType=compactText(document.sourceType || document.source_type || document.source || 'document',120);
  const sourceId=compactText(document.sourceId || document.source_id || id,220);
  return {
    id,title,sourceType,sourceId,
    type:compactText(document.type || document.kind || 'document',120),
    relationship:compactText(document.relationship || document.relationshipName || '',180),
    sourceUrl:compactText(document.sourceUrl || document.url || '',900),
    summary:compactText(document.summary || document.bodyPreview || title,500),
    intendedUse:compactText(document.intendedUse || document.referenceUse || '',500),
    sourceRefs:refs.length ? refs : [sourceRef({sourceType,sourceId,quoteOrSummary:title})]
  };
}
function projectDocumentCandidateMatch(value='',candidates=[]){
  const needle=compactText(value,300).toLowerCase();
  return safeArray(candidates).find((candidate)=>[candidate.id,candidate.title,candidate.sourceId].filter(Boolean).some((item)=>String(item).toLowerCase()===needle)) || null;
}
function sourceRefsForDocuments(documents=[]){
  const seen=new Set();
  return safeArray(documents).flatMap((document)=>document?.source_type || document?.sourceType ? [document] : safeArray(document?.sourceRefs)).map(sourceRef).filter((ref)=>{
    const key=[ref.source_type,ref.source_id,ref.quote_or_summary].join('|').toLowerCase();
    if(seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function buildProjectDocumentsBrief(project={},documents=[],input={}){
  const metadata=project.metadataJson || project.metadata || {};
  const stored=safeArray(project.projectDocuments || metadata.projectDocuments).map(sourceDocumentCandidate).filter((document)=>document.id);
  const candidates=safeArray(documents).map(sourceDocumentCandidate).filter((document)=>document.id);
  for(const document of stored){
    if(!candidates.some((candidate)=>candidate.id===document.id)) candidates.unshift(document);
  }
  const existingDocuments=stored.map((document)=>({
    ...document,
    intendedUse:compactText(document.intendedUse || document.referenceUse || '',500),
    known:true
  }));
  return {
    id:stableKey(`working_brief_project_documents_${project.projectId || project.id || input.scope?.entityId || project.name}`),
    entrypointId:'project.documents',
    entityType:'project_section',
    entityId:String(project.projectId || project.id || input.scope?.entityId || ''),
    sectionId:'documents',
    projectName:compactText(project.name || project.displayName || metadata.projectName || 'Project',180),
    existingDocuments,
    documentCandidates:candidates.slice(0,80),
    sourceRefs:projectIdentityReferences(project,input),
    objective:'Link existing document receipts to the selected project and name how each one should inform project judgment.',
    completionCondition:'Every linked document is an existing VAL receipt and has a specific intended project use.',
    approvalBoundary:'Applying links existing document receipts to this internal Project Managers packet only. It does not upload, edit, send, share, move, delete, or alter a source document.'
  };
}
function parseProjectDocuments(answer='',brief={},current={}){
  const source=multilineText(answer,5000);
  const existing=safeArray(Array.isArray(current) ? current : current.documents);
  const labeled=/(?:^|[;\n])\s*(?:documents?|sources?)\s*:/i.test(source);
  const documentMatch=source.match(/(?:^|\n)\s*(?:documents?|sources?)\s*:\s*([\s\S]+)/i);
  const acceptsCurrent=/^(?:yes|yep|yeah|use current documents|keep current documents|use those documents)\b/i.test(source);
  const documentText=multilineText(documentMatch?.[1] || '',5000) || (!labeled && !acceptsCurrent ? source : '');
  const items=documentText.split(/\n|;/).map((item)=>item.replace(/^[-*]\s*/,'').trim()).filter(Boolean);
  const documents=[];
  const unresolved=[];
  for(const item of items){
    const [rawName,...useParts]=item.split('|');
    const documentName=compactText(rawName,300);
    const intendedUse=compactText(useParts.join('|'),500);
    const candidate=projectDocumentCandidateMatch(documentName,brief.documentCandidates);
    if(!candidate){
      if(documentName) unresolved.push(documentName);
      continue;
    }
    if(!documents.some((document)=>document.id===candidate.id)) documents.push({...candidate,intendedUse,known:true});
  }
  if((!items.length || acceptsCurrent) && existing.length) documents.push(...existing);
  for(const document of documents){
    const prior=existing.find((item)=>item.id===document.id);
    if(prior?.intendedUse && !document.intendedUse) document.intendedUse=prior.intendedUse;
  }
  return {documents,unresolved:uniqueNames(unresolved)};
}
function missingProjectDocumentFields(proposal={}){
  const missing=[];
  if(!safeArray(proposal.documents).length) missing.push('documents');
  if(safeArray(proposal.documents).some((document)=>!compactText(document.intendedUse))) missing.push('intended use');
  return missing;
}
function projectDocumentsQuestion(state={},brief={}){
  const proposal=state.draftDocuments || {documents:[],unresolved:[]};
  if(state.stage === 'documents'){
    const choices=safeArray(brief.documentCandidates).slice(0,12).map((document)=>document.title).join('; ');
    return {
      targetField:'document_receipt[].{document_title,intended_project_use}',
      question:`Which existing document receipts should inform ${brief.projectName || 'this project'}, and how should each be used?`,
      detail:choices
        ? `Use one line per document: Exact document title | intended project use. Available receipts: ${choices}`
        : 'There are no existing document receipts available yet. Add or connect the document in Documents, then reopen this Project Managers brief.'
    };
  }
  if(state.stage === 'unresolved') return {
    targetField:'document_receipt[].document_title',
    question:`I cannot link ${proposal.unresolved.join(', ')} because VAL does not have that document receipt.`,
    detail:'Add or connect the document in Documents, then reopen this brief. VAL will not invent a document or treat a filename as evidence.'
  };
  if(state.stage === 'intended_use'){
    const missing=safeArray(proposal.documents).filter((document)=>!compactText(document.intendedUse)).map((document)=>document.title).join('; ');
    return {targetField:'document_receipt[].intended_project_use',question:`How should ${missing} inform this project?`,detail:'Use: Exact document title | intended project use. This records the evidence purpose without changing the document.'};
  }
  return {targetField:'document_receipt + project_source_references',question:'Review the linked document receipts and their intended uses, then apply them to this Project Manager.',detail:'Applying links existing evidence internally. Nothing external happens.'};
}

function exactTranscriptLines(value=[]){
  return safeArray(value).map((item)=>String(item == null ? '' : item).trim()).filter(Boolean);
}
function transcriptInvitees(transcript={}){
  const buckets=[
    transcript.attendees,
    transcript.invitees,
    transcript.calendarEvent?.attendees,
    transcript.calendar_event?.attendees,
    transcript.event?.attendees,
    transcript.metadata?.attendees,
    transcript.sourcePayloadMetadata?.attendees
  ];
  const seen=new Set();
  return buckets.flatMap((bucket)=>safeArray(bucket)).map((person)=>{
    if(typeof person === 'string'){
      const email=compactText(person.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || '',220);
      return email ? {name:compactText(person.replace(email,'').replace(/[<>]/g,' '),180),email} : null;
    }
    const normalized={
      name:compactText(person?.name || person?.displayName || person?.emailAddress?.name || '',180),
      email:compactText(person?.email || person?.address || person?.emailAddress?.address || '',220)
    };
    return /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(normalized.email) ? normalized : null;
  }).filter(Boolean).filter((person)=>{
    const key=person.email.toLowerCase();
    if(seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function buildTranscriptWorkingBrief(transcript={},input={}){
  const receipt=transcript.sourceReceipt && typeof transcript.sourceReceipt === 'object' ? transcript.sourceReceipt : {};
  const actionItems=exactTranscriptLines(receipt.actionItems);
  const keyPoints=exactTranscriptLines(receipt.keyPoints);
  const sections=safeArray(receipt.sections).map((section)=>({
    kind:compactText(section?.kind || '',80),
    heading:compactText(section?.heading || '',180),
    raw:multilineText(section?.raw || '',24000),
    lines:exactTranscriptLines(section?.lines)
  }));
  const entityId=compactText(transcript.id || transcript.transcriptId || input.scope?.entityId || '',220);
  const title=compactText(transcript.title || transcript.meetingTitle || 'Transcript',240);
  const body=multilineText(receipt.body || '',50000);
  const calendarEvent=transcript.calendarEvent || transcript.calendar_event || transcript.event || {};
  const invitees=transcriptInvitees(transcript);
  const participants=uniqueNames(safeArray(transcript.participants).map((person)=>person?.matchedContactName || person?.speakerNameRaw || person?.name || person?.email || person));
  const relatedProjects=uniqueNames([
    transcript.projectName,
    transcript.relatedProject,
    transcript.metadata?.projectName,
    transcript.sourcePayloadMetadata?.projectName
  ]);
  const relatedRelationships=uniqueNames([
    transcript.contactName,
    transcript.metadata?.contactName,
    transcript.sourcePayloadMetadata?.contactName,
    ...participants
  ]);
  const references=[
    sourceRef({sourceType:'transcript_source_receipt',sourceId:entityId,quoteOrSummary:body || actionItems.concat(keyPoints).join(' ')}),
    calendarEvent?.id && sourceRef({sourceType:'calendar_event',sourceId:calendarEvent.id,quoteOrSummary:calendarEvent.title || title}),
    invitees.length && sourceRef({sourceType:'calendar_invitees',sourceId:entityId,quoteOrSummary:invitees.map((person)=>person.name || person.email).join(', ')})
  ].filter(Boolean);
  return {
    id:stableKey(`working_brief_transcript_${entityId || title}`),
    entrypointId:'transcript.working_brief',
    entityType:'transcript',
    entityId,
    sectionId:'working_brief',
    transcriptTitle:title,
    sourceReceipt:{body,sections,actionItems,keyPoints,ready:Boolean(body && sections.length)},
    calendarEvent:{id:compactText(calendarEvent?.id || transcript.calendarEventId || '',220),title:compactText(calendarEvent?.title || '',240)},
    invitees,
    linkedPeople:participants,
    relatedProjects,
    relatedRelationships,
    existingDrafts:safeArray(transcript.drafts).map((draft)=>({id:compactText(draft?.id || '',220),type:compactText(draft?.draftType || '',100),status:compactText(draft?.status || '',100)})),
    sourceRefs:references,
    objective:'Hold a useful conversation grounded in one complete selected transcript.',
    completionCondition:'VAL answers the executive\'s actual question using the selected meeting evidence and clearly separates source fact from inference.',
    approvalBoundary:'Conversation does not create or display a draft automatically. Existing prepared work remains in Leverage, and no external action occurs without explicit approval.'
  };
}
function transcriptActionItemIndex(input={}){
  const raw=input.scope?.actionItemIndex ?? input.scope?.action_item_index ?? input.actionItemIndex ?? input.action_item_index;
  const index=Number(raw);
  return Number.isInteger(index) && index >= 0 ? index : -1;
}
function buildTranscriptActionItemBrief(transcript={},input={}){
  const workingBrief=buildTranscriptWorkingBrief(transcript,input);
  const actionItemIndex=transcriptActionItemIndex(input);
  const actionItem=workingBrief.sourceReceipt.actionItems[actionItemIndex] || '';
  if(!actionItem) throw new Error('VAL could not find that exact Action Item in the selected Krisp receipt. Nothing was substituted.');
  return {
    ...workingBrief,
    id:stableKey(`working_brief_transcript_action_item_${workingBrief.entityId}_${actionItemIndex}`),
    entrypointId:'transcript.action_item',
    sectionId:'action_item',
    actionItemIndex,
    actionItem,
    sourceRefs:[
      ...workingBrief.sourceRefs,
      sourceRef({sourceType:'transcript_action_item',sourceId:`${workingBrief.entityId}:${actionItemIndex}`,quoteOrSummary:actionItem})
    ],
    objective:'Create one internal Commitment from the exact selected Krisp Action Item.',
    completionCondition:'The exact selected Action Item is visible for review and, after Apply, becomes one internal VAL Commitment without changing the source receipt.',
    approvalBoundary:'Applying creates only one internal VAL Commitment from this exact Action Item. It does not assign it to a person, send a message, create a calendar event, update CRM, or change the Krisp source receipt.'
  };
}
function transcriptWorkingBriefQuestion(state={},brief={}){
  const receipt=brief.sourceReceipt || {};
  return {
    targetField:'transcript_working_brief.conversation',
    question:`I have the complete context for ${brief.transcriptTitle || 'this transcript'} loaded (${exactTranscriptLines(receipt.actionItems).length} Action Items and ${exactTranscriptLines(receipt.keyPoints).length} Key Points). What would you like to understand, pressure-test, or create from it?`,
    detail:'This is a conversation about the selected meeting. Prepared work remains in Leverage and nothing external happens from opening chat.'
  };
}
function transcriptActionItemQuestion(brief={}){
  return {
    targetField:'commitment.source_receipt.action_item',
    question:'Review this exact Krisp Action Item, then apply it as one internal Commitment.',
    detail:'The task title and source quote remain word for word. Nothing is assigned, sent, scheduled, or changed outside VAL.'
  };
}
function emailThreadMessages(thread={}){
  const context=thread.context || thread.conversationContext || {};
  return safeArray(thread.messages || context.messages || []).map((message)=>({
    id:compactText(message?.id || message?.messageId || '',220),
    messageId:compactText(message?.messageId || message?.id || '',220),
    direction:compactText(message?.direction || '',80),
    from:compactText(message?.from?.name || message?.from?.email || message?.senderName || message?.senderEmail || '',180),
    subject:compactText(message?.subject || '',240),
    body:multilineText(message?.bodyText || message?.bodyPreview || message?.snippet || '',12000),
    receivedAt:compactText(message?.receivedAt || message?.sentAt || message?.date || '',120)
  })).filter((message)=>message.messageId || message.body || message.subject);
}
function emailThreadDraft(value={}){
  const source=value.sourceContext || value.source_context || {};
  const writer=source.writerOutput || source.writer_output || {};
  const body=multilineText(value.body || writer.body || '',12000);
  return body ? {
    id:compactText(value.id || writer.id || '',220),
    subject:compactText(value.subject || writer.subject || '',300),
    body,
    status:compactText(value.status || '',100)
  } : null;
}
function buildEmailThreadBrief(thread={},input={}){
  const context=thread.context || thread.conversationContext || {};
  const current=context.current_message || context.currentMessage || thread.currentMessage || {};
  const messages=emailThreadMessages(thread);
  const entityId=compactText(thread.messageId || current.messageId || current.id || input.scope?.messageId || input.scope?.entityId || '',220);
  const threadId=compactText(thread.threadId || context.threadId || current.threadId || input.scope?.threadId || '',220);
  const conversationId=compactText(thread.conversationId || context.conversationId || current.unifiedConversationId || input.scope?.conversationId || '',220);
  const subject=compactText(thread.subject || current.subject || messages[messages.length-1]?.subject || 'Selected email thread',300);
  const classification=thread.classification || {};
  const readiness=thread.readiness || {};
  const draftBrief=thread.draftBrief || thread.draft_brief || {};
  const linkedContexts=safeArray(thread.linkedContexts || thread.linked_contexts).map((link)=>({
    kind:String(link.targetType || link.target_type || '').includes('project') ? 'project' : 'relationship',
    name:compactText(link.metadata?.targetName || link.targetName || link.target_name || link.summary || link.targetId || link.target_id || '',220),
    summary:compactText(link.summary || '',500),
    sourceId:compactText(link.sourceId || link.source_id || '',220),
    targetId:compactText(link.targetId || link.target_id || '',220)
  })).filter((link)=>link.name || link.targetId);
  const currentText=multilineText(current.bodyText || current.bodyPreview || current.snippet || messages[messages.length-1]?.body || '',12000);
  const sourceRefs=[
    ...safeArray(classification.source_refs || classification.sourceRefs).map(sourceRef),
    ...messages.slice(-8).map((message)=>sourceRef({sourceType:'email_message',sourceId:message.messageId || message.id,quoteOrSummary:[message.subject,message.body].filter(Boolean).join(': ')})),
    ...linkedContexts.map((link)=>sourceRef({sourceType:link.kind === 'project' ? 'project_profile' : 'relationship_profile',sourceId:link.targetId,quoteOrSummary:`Attached ${link.kind}: ${link.name || link.targetId}${link.summary ? ' - ' + link.summary : ''}`,confidence:0.86}))
  ].filter((ref)=>ref.source_id || ref.quote_or_summary);
  return {
    id:stableKey(`working_brief_email_thread_${entityId || conversationId || threadId || subject}`),
    entrypointId:'email.thread',
    entityType:'email_thread',
    entityId,
    sectionId:'reply_draft',
    provider:compactText(thread.provider || context.provider || current.provider || input.scope?.provider || 'email',80),
    messageId:entityId,
    threadId,
    conversationId,
    subject,
    currentMessage:{
      from:compactText(current.from?.name || current.from?.email || '',180),
      body:currentText
    },
    messages,
    classification:{
      executiveMeaning:compactText(classification.executive_meaning || classification.executiveMeaning || '',180),
      whyNow:compactText(classification.why_now || classification.whyNow || '',700),
      approvalPolicy:compactText(classification.approval_policy || classification.approvalPolicy || '',120)
    },
    readiness:{
      status:compactText(readiness.status || '',100),
      missingContext:safeArray(readiness.missing_context || readiness.missingContext).map((item)=>compactText(item,220)).filter(Boolean),
      representationRisk:compactText(readiness.representation_risk || readiness.representationRisk || '',100)
    },
    existingDraft:emailThreadDraft(thread.existingDraft || thread.existing_draft || {}),
    linkedContexts,
    sourceRefs,
    objective:'Prepare one review-only reply from the selected Executive Inbox thread.',
    completionCondition:'The selected durable thread, one executive reply outcome, and one linked private draft are visible for Leverage review.',
    approvalBoundary:'Preparing this draft creates only an internal VAL review draft. It does not send email, create a provider draft, update CRM, create a task, alter the selected source, or change any external system.'
  };
}
function emailThreadQuestion(state={},brief={}){
  const attached=safeArray(brief.linkedContexts).map((item)=>item.name || item.targetId).filter(Boolean).slice(0,4).join(', ');
  const contextLine=attached ? ` Attached context: ${attached}.` : '';
  if(state.stage === 'ready_to_review'){
    return {
      targetField:'prepared_artifact.email_draft',
      question:'Review the private email draft in Leverage before any external approval.',
      detail:'This route prepared only an internal draft from the selected thread.' + contextLine + ' Nothing has been sent or created in the email provider.'
    };
  }
  return {
    targetField:'email_judgment_packet.reply_outcome',
    question:`What outcome should this reply to ${brief.subject || 'this thread'} create?`,
    detail:'This single direction prepares one private reply draft from the selected readable thread.' + contextLine + ' It does not send, create a provider draft, or change any external system.'
  };
}

function relationshipDisplayName(relationship={}){
  return compactText(relationship.name || relationship.displayName || relationship.identity || 'Selected relationship',180);
}
function relationshipSourceLines(relationship={}){
  const lines=[];
  const add=(label,value)=>{
    const text=compactText(typeof value === 'string' ? value : (value?.content || value?.summary || value?.text || ''),700);
    if(/^(canonical relationship profile from val relationship index|relationship evidence is pending source review|review the relationship file before acting)\.?$/i.test(text)) return;
    if(text) lines.push({label,text});
  };
  add('Current relationship summary',relationship.summary || relationship.sourceEvidence || relationship.evidence);
  add('Current signal',relationship.signal);
  safeArray(relationship.openLoops).slice(0,3).forEach((item)=>add('Open loop',item));
  safeArray(relationship.risks).slice(0,3).forEach((item)=>add('Risk',item));
  safeArray(relationship.opportunities).slice(0,3).forEach((item)=>add('Opportunity',item));
  safeArray(relationship.relationshipSignals).slice(0,3).forEach((item)=>add('Relationship signal',item));
  const seen=new Set();
  return lines.filter((line)=>{
    const key=`${line.label}:${line.text}`.toLowerCase();
    if(seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function buildRelationshipOverviewBrief(relationship={},input={}){
  const scopeInput=input.scope || {};
  const entityId=compactText(relationship.id || relationship.profileId || relationship.profileKey || scopeInput.entityId || input.relationshipId || '',220);
  const relationshipName=relationshipDisplayName(relationship);
  const sourceLines=relationshipSourceLines(relationship);
  const sourceRefs=sourceLines.map((line,index)=>sourceRef({
    sourceType:index === 0 ? 'relationship_profile' : 'relationship_packet',
    sourceId:index === 0 ? entityId : `${entityId}:source:${index}`,
    quoteOrSummary:`${line.label}: ${line.text}`,
    confidence:relationship.confidence || 0.8
  }));
  return {
    id:stableKey(`working_brief_relationship_overview_${entityId || relationshipName}`),
    entrypointId:'relationship.overview',
    entityType:'relationship',
    entityId,
    sectionId:'overview',
    relationshipName,
    relationshipStatus:compactText(relationship.relationshipStatus || relationship.trajectory || '',120),
    currentNextMove:compactText(relationship.nextStewardshipMove || relationship.nextMove || '',600),
    sourceLines,
    sourceRefs,
    objective:'Prepare one source-aware next stewardship move for the selected relationship.',
    completionCondition:'The selected relationship, executive direction, source receipt, and review-gated internal next move are visible.',
    approvalBoundary:'Applying updates only the selected internal relationship stewardship packet. It does not send outreach, create a task, change CRM, schedule time, create an introduction, or alter an external system.'
  };
}
function relationshipOverviewFocusFromAnswer(answer='',brief={}){
  const nextMove=multilineText(answer,1200);
  return {
    nextMove,
    basis:'Executive direction recorded against the selected relationship evidence.',
    sourceSummary:safeArray(brief.sourceLines).map((line)=>`${line.label}: ${line.text}`).slice(0,4).join(' | '),
    confidence:'Executive direction',
    sourceRefs:safeArray(brief.sourceRefs).map(sourceRef)
  };
}
function relationshipOverviewQuestion(state={},brief={}){
  if(state.stage === 'ready_to_apply'){
    return {
      targetField:'relationship_stewardship_packet.next_move',
      question:`Review the prepared next relationship move for ${brief.relationshipName || 'this relationship'}, then apply it internally.`,
      detail:'Applying updates only this relationship’s internal stewardship packet. No outreach, task, CRM change, introduction, calendar event, or external action happens here.'
    };
  }
  return {
    targetField:'relationship_stewardship_packet.next_move',
    question:`What small relationship outcome should VAL prepare next for ${brief.relationshipName || 'this relationship'}?`,
    detail:'Feeds Relationships > Next stewardship move. Your answer becomes one review-gated internal focus, grounded in the selected relationship evidence. Nothing external happens here.'
  };
}

const RELATIONSHIP_SECTION_CONTRACTS=Object.freeze({
  needs:{
    label:'Needs',
    targetField:'relationship_person_packet.what_this_person_needs[]',
    question:(name)=>`Tell VAL, in your own words, what ${name || 'this person'} needs right now. VAL will turn your note into clean reviewable Needs bullets before anything is saved.`,
    detail:'Feeds Stewardship > Network > Needs for this person only. VAL stores this as user-confirmed context and does not create a task, outreach, CRM change, calendar event, or external action.'
  },
  offers:{
    label:'Offers',
    targetField:'relationship_person_packet.what_this_person_offers[]',
    question:(name)=>`Tell VAL what ${name || 'this person'} reliably offers: capability, access, perspective, support, or value. Natural language is fine; VAL will prepare the clean card update for review.`,
    detail:'Feeds Stewardship > Network > Offers for this person only. VAL stores this as user-confirmed context and does not create a task, outreach, CRM change, calendar event, or external action.'
  },
  relationship:{
    label:'Relationship',
    targetField:'relationship_person_packet.relationship_context',
    question:(name)=>`Talk to VAL about the relationship with ${name || 'this person'}: history, trust, boundaries, sensitivities, or what should be remembered. VAL will summarize it into a reviewable relationship card.`,
    detail:'Feeds Stewardship > Network > Relationship for this person only. VAL stores this as user-confirmed context and does not create a task, outreach, CRM change, calendar event, or external action.'
  },
  evidence:{
    label:'Evidence',
    targetField:'relationship_person_packet.user_confirmed_evidence[]',
    question:(name)=>`What evidence do you personally want VAL to remember about ${name || 'this person'}? Say it naturally; VAL will separate it into clean reviewable evidence lines.`,
    detail:'Feeds Stewardship > Network > Evidence for this person only. VAL labels it as user-confirmed context; it does not rewrite or replace the original source evidence.'
  }
});

function relationshipSectionContract(sectionId=''){
  return RELATIONSHIP_SECTION_CONTRACTS[String(sectionId || '').trim().toLowerCase()] || null;
}

function relationshipSectionAnswerLines(answer=''){
  const clean=multilineText(answer,2400);
  return clean
    .split(/\n+/)
    .flatMap(line=>{
      const stripped=line.replace(/^\s*(?:[-*]|\d+[.)])\s*/,'').trim();
      if(!stripped)return [];
      const sentenceParts=stripped.split(/(?<=[.!?])\s+(?=[A-Z0-9"'])/).map(part=>part.trim()).filter(Boolean);
      return sentenceParts.length>1 ? sentenceParts : [stripped];
    })
    .map(line=>compactText(line,420))
    .filter(Boolean)
    .filter((line,index,rows)=>rows.findIndex(candidate=>candidate.toLowerCase()===line.toLowerCase())===index)
    .slice(0,12);
}

function relationshipSectionCurrentValues(relationship={},sectionId=''){
  const section=String(sectionId || '').trim().toLowerCase();
  if(section==='needs') return safeArray(relationship.packetNeeds || relationship.personPacket?.what_this_person_needs).map(item=>compactText(item?.need || item?.summary || item,420)).filter(Boolean).slice(0,8);
  if(section==='offers') return safeArray(relationship.packetOffers || relationship.personPacket?.what_this_person_offers).map(item=>compactText(item?.offer || item?.summary || item,420)).filter(Boolean).slice(0,8);
  if(section==='relationship') return [compactText(relationship.stewardshipAbout || relationship.summary || relationship.evidence || relationship.sourceEvidence || '',1200)].filter(Boolean);
  if(section==='evidence') return relationshipSourceLines(relationship).map(line=>compactText(`${line.label}: ${line.text}`,700)).slice(0,8);
  return [];
}

function buildRelationshipSectionBrief(relationship={},input={}){
  const scopeInput=input.scope || {};
  const sectionId=String(scopeInput.sectionId || scopeInput.section_id || input.sectionId || '').trim().toLowerCase();
  const contract=relationshipSectionContract(sectionId);
  if(!contract) throw new Error('This relationship card does not have a registered Co-Work contract.');
  const base=buildRelationshipOverviewBrief(relationship,input);
  return {
    ...base,
    id:stableKey(`working_brief_relationship_section_${base.entityId || base.relationshipName}_${sectionId}`),
    entrypointId:'relationship.section',
    sectionId,
    sectionLabel:contract.label,
    targetField:contract.targetField,
    currentValues:relationshipSectionCurrentValues(relationship,sectionId),
    objective:`Improve only ${base.relationshipName || 'this relationship'}'s ${contract.label} card with user-confirmed context.`,
    completionCondition:`A reviewable ${contract.label} update for ${base.relationshipName || 'this relationship'} is visible and can be applied to that person’s internal packet.`,
    approvalBoundary:'Applying updates only the selected relationship’s named internal card and durable person packet. It does not send outreach, create a task, update CRM, schedule time, create an introduction, or alter an external system.'
  };
}

function relationshipSectionUpdateFromAnswer(answer='',brief={}){
  const sectionId=String(brief.sectionId || '').trim().toLowerCase();
  const contract=relationshipSectionContract(sectionId);
  if(!contract) return null;
  const raw=multilineText(answer,2400);
  const values=relationshipSectionAnswerLines(raw);
  if(!raw || !values.length) return null;
  return {
    sectionId,
    sectionLabel:contract.label,
    targetField:contract.targetField,
    values:sectionId==='relationship'?[raw]:values,
    userConfirmed:true,
    sourceType:'user_confirmed_relationship_context',
    sourceSummary:`VAL interpreted the user's conversational note into reviewed ${contract.label.toLowerCase()} context for ${brief.relationshipName || 'this relationship'}.`
  };
}

function relationshipSectionQuestion(state={},brief={}){
  const contract=relationshipSectionContract(brief.sectionId);
  if(!contract) return {targetField:'relationship_person_packet',question:'This relationship card needs a registered contract before VAL can update it.',detail:'Nothing was changed.'};
  if(state.stage==='ready_to_apply'){
    return {
      targetField:contract.targetField,
      question:`Review the prepared ${contract.label} update for ${brief.relationshipName || 'this relationship'}, then apply it internally.`,
      detail:`Applying updates only Stewardship > Network > ${contract.label} for ${brief.relationshipName || 'this relationship'} and the durable person packet that other VAL surfaces use. Nothing external happens here.`
    };
  }
  return {
    targetField:contract.targetField,
    question:contract.question(brief.relationshipName),
    detail:contract.detail
  };
}

const PROJECT_ONBOARDING_STAGE_CONTRACTS=Object.freeze({
  first_question:{
    question:'What should this project be called, and what outcome should it create?',
    detail:'Feeds Identity, What this is, and Working narrative.',
    targetPacketField:'project_identity_packet.canonical_name + project_identity_packet.desired_outcome',
    pageBoxes:['Identity','What this is','Working narrative']
  },
  owner_monitoring:{
    question:'Who owns this project, what is the next move, and what should VAL monitor next?',
    detail:'Feeds People involved, Next move, and Monitoring after launch.',
    targetPacketField:'project_owner_packet + project_next_action_packet + project_monitoring_packet',
    pageBoxes:['People involved','Next move','Monitoring after launch']
  },
  workstreams:{
    question:'What are the main workstreams VAL should track for this project?',
    detail:'Feeds Workstreams.',
    targetPacketField:'project_workstreams',
    pageBoxes:['Workstreams']
  },
  milestones:{
    question:'What milestones prove this project is moving?',
    detail:'Feeds Milestones and Current phase.',
    targetPacketField:'project_milestone_packet + project_sop_packet.current_phase',
    pageBoxes:['Milestones','Current phase']
  },
  relationship_nurture:{
    question:'How should VAL help protect and grow the relationships connected to this project?',
    detail:'Feeds Relationship nurture.',
    targetPacketField:'project_relationship_nurture_packet',
    pageBoxes:['Relationship nurture']
  },
  prepared_work:{
    question:'What should VAL prepare, organize, or ask about next for this project?',
    detail:'Feeds Prepared work and What VAL needs next.',
    targetPacketField:'project_prepared_work_packets + project_interview_packet.current_question',
    pageBoxes:['Prepared work','What VAL needs next']
  },
  complete:{
    question:'What should VAL refine next on this Project Manager page?',
    detail:'Feeds the specific card you choose.',
    targetPacketField:'selected_project_manager_packet',
    pageBoxes:['Project Manager']
  }
});

const PROJECT_ONBOARDING_STAGE_ORDER=['first_question','owner_monitoring','workstreams','milestones','relationship_nurture','prepared_work'];

function projectOnboardingData(project={}){
  const metadata=project.metadataJson || project.metadata || {};
  const onboarding=metadata.projectOnboarding || metadata.project_onboarding || {};
  return onboarding && typeof onboarding==='object' && !Array.isArray(onboarding) ? onboarding : {};
}
function projectOnboardingStage(project={}){
  const onboarding=projectOnboardingData(project);
  const status=compactText(onboarding.status || '',100).toLowerCase();
  if(status==='complete' || status==='prepared_work_answered' || onboarding.preparedWorkAnswer) return 'complete';
  if(status==='relationship_nurture_answered' || onboarding.relationshipNurtureAnswer || safeArray(project.relationshipNurtureRules).length) return 'prepared_work';
  if(status==='milestones_answered' || onboarding.milestonesAnswer || safeArray(project.milestones).length) return 'relationship_nurture';
  if(status==='workstreams_answered' || status==='workstreams_applied' || onboarding.workstreamsAnswer || safeArray(project.workstreams).length) return 'milestones';
  if(status==='owner_monitoring_answered' || onboarding.ownerMonitoringAnswer || compactText(project.ownerMonitoringNotes || '',700)) return 'workstreams';
  if(status==='answered_first_question' || status==='foundation_applied' || onboarding.firstAnswer) return 'owner_monitoring';
  return 'first_question';
}
function projectOnboardingStageContract(stage='first_question'){
  return PROJECT_ONBOARDING_STAGE_CONTRACTS[stage] || PROJECT_ONBOARDING_STAGE_CONTRACTS.complete;
}
function projectOnboardingNextStage(stage='first_question'){
  const index=PROJECT_ONBOARDING_STAGE_ORDER.indexOf(stage);
  return index>=0 && index<PROJECT_ONBOARDING_STAGE_ORDER.length-1 ? PROJECT_ONBOARDING_STAGE_ORDER[index+1] : 'complete';
}
function buildProjectOnboardingBrief(project={},input={}){
  const metadata=project.metadataJson || project.metadata || {};
  const stage=projectOnboardingStage(project);
  const contract=projectOnboardingStageContract(stage);
  const projectId=String(project.projectId || project.id || input.scope?.entityId || '');
  const references=projectIdentityReferences(project,input);
  return {
    id:stableKey(`working_brief_project_onboarding_${projectId || project.name}`),
    entrypointId:'project.onboarding',
    entityType:'project_section',
    entityId:projectId,
    sectionId:'project_interview',
    projectName:compactText(project.name || project.displayName || metadata.projectName || 'Project',180),
    currentStage:stage,
    currentStageContract:contract,
    completedStages:PROJECT_ONBOARDING_STAGE_ORDER.filter((item)=>PROJECT_ONBOARDING_STAGE_ORDER.indexOf(item)<PROJECT_ONBOARDING_STAGE_ORDER.indexOf(stage)),
    sourceRefs:references,
    objective:'Complete the selected project manager through its protected onboarding sequence, one mapped section at a time.',
    completionCondition:stage==='complete' ? 'The protected onboarding sequence is complete. Open a named Project Managers section to refine it.' : `The exact ${contract.pageBoxes.join(', ')} onboarding input is recorded and ready for internal review.`,
    approvalBoundary:'Applying stores only this stage\'s answer in the selected Project Managers packet and updates only the mapped internal fields. It does not create a task, send a message, update CRM, schedule anything, or alter source evidence.'
  };
}
function projectOnboardingQuestion(state={},brief={}){
  const stage=state.stage || brief.currentStage || 'first_question';
  const contract=projectOnboardingStageContract(stage);
  if(stage==='complete') return {
    targetField:'project_onboarding_packet',
    question:contract.question,
    detail:'The protected onboarding sequence is complete. Open the Project Managers card you want to refine.'
  };
  if(state.stage==='ready_to_apply') return {
    targetField:contract.targetPacketField,
    question:`Review this answer for ${contract.pageBoxes.join(', ')}, then apply it to this Project Manager.`,
    detail:'Applying stores the answer exactly as provided. VAL does not infer or create additional project details here.'
  };
  return {
    targetField:contract.targetPacketField,
    question:contract.question,
    detail:`${contract.detail} This answer updates only: ${contract.pageBoxes.join(', ')}.`
  };
}

const COWORK_ENTRYPOINTS=Object.freeze({
  'project.overview':{
    id:'project.overview',surface:'project_managers',scopeType:'project_section',sectionId:'project_overview',
    requiredPackets:['project_packet','project_manager_judgment_packet','project_overview_focus_packet'],
    objective:'Choose the one bounded question or work item the selected Project Managers Round Table should focus on next.',
    completionCondition:'One allowed focus type, title, exact focus, useful completion condition, named Project Managers follow-through section, basis, and confidence are ready for internal review.'
  },
  'project.identity':{
    id:'project.identity',
    surface:'project_managers',
    scopeType:'project_section',
    sectionId:'identity',
    requiredPackets:['project_packet','project_identity_packet','project_owner_packet'],
    objective:'Establish the selected project foundation.',
    completionCondition:'Name, purpose, desired outcome, and one project owner are explicit and ready for internal review.'
  },
  'project.onboarding':{
    id:'project.onboarding',surface:'project_managers',scopeType:'project_section',sectionId:'project_interview',
    requiredPackets:['project_packet','project_interview_packet'],
    objective:'Advance the selected project through its protected onboarding sequence one mapped section at a time.',
    completionCondition:'The current protected onboarding answer is visible, mapped to its page boxes, and ready for internal review.'
  },
  'project.people':{
    id:'project.people',surface:'project_managers',scopeType:'project_section',sectionId:'people',
    requiredPackets:['project_packet','project_relationships_packet','project_owner_packet'],
    objective:'Connect the selected project to its people and owner.',
    completionCondition:'Each linked person has a role and one is the explicit project owner.'
  },
  'project.documents':{
    id:'project.documents',surface:'project_managers',scopeType:'project_section',sectionId:'documents',
    requiredPackets:['project_packet','document_receipt','project_source_references'],
    objective:'Link existing document receipts to the selected project and name their intended use.',
    completionCondition:'Each linked document is an existing VAL receipt with a specific project use.'
  },
  'project.milestones':{
    id:'project.milestones',surface:'project_managers',scopeType:'project_section',sectionId:'milestones',
    requiredPackets:['project_packet','project_sop_packet','project_milestone_packet','project_workstreams'],
    objective:'Define evidence-based checkpoints for the selected project.',
    completionCondition:'Each milestone is tied to an existing workstream and has a completion signal plus timing or trigger.'
  },
  'project.monitoring':{
    id:'project.monitoring',surface:'project_managers',scopeType:'project_section',sectionId:'monitoring_rules',
    requiredPackets:['project_packet','project_sop_packet','project_monitoring_packet','project_workstreams'],
    objective:'Define project-specific monitoring rules.',
    completionCondition:'Each monitoring rule has a watch item, cadence, escalation trigger, and executive surface action.'
  },
  'project.relationship_nurture':{
    id:'project.relationship_nurture',surface:'project_managers',scopeType:'project_section',sectionId:'relationship_nurture',
    requiredPackets:['project_packet','project_relationships_packet','project_relationship_nurture_packet'],
    objective:'Protect the relationships that make the selected project viable.',
    completionCondition:'Each rule has an existing project relationship, cadence, useful touch, trust risk, and review trigger.'
  },
  'project.why_it_matters':{
    id:'project.why_it_matters',surface:'project_managers',scopeType:'project_section',sectionId:'why_it_matters',
    requiredPackets:['project_packet','project_manager_judgment_packet','project_identity_packet','project_next_action_packet'],
    objective:'State the selected project\'s concrete consequence or opportunity, why it matters now, and whether the basis is source-backed or executive judgment.',
    completionCondition:'The consequence or opportunity, why-now, basis, confidence, and immutable source references are explicit.'
  },
  'project.risk':{
    id:'project.risk',surface:'project_managers',scopeType:'project_section',sectionId:'risk_blocker',
    requiredPackets:['project_packet','project_relationships_packet','project_risk_packet'],
    objective:'Assess one current material project risk precisely, or record that no material risk is currently proven.',
    completionCondition:'A material risk has its type, impact, severity, accountable existing project relationship, smallest mitigation, watch condition, confidence, and evidence; or a no-material-risk assessment has its review basis.'
  },
  'project.narrative':{
    id:'project.narrative',surface:'project_managers',scopeType:'project_section',sectionId:'working_narrative',
    requiredPackets:['project_packet','project_manager_judgment_packet'],
    objective:'Make the selected project current state understandable to the executive.',
    completionCondition:'Current reality, what VAL now knows, what is blocked or explicitly not blocked, basis, and confidence are ready for internal review.'
  },
  'project.needs_next':{
    id:'project.needs_next',surface:'project_managers',scopeType:'project_section',sectionId:'what_val_needs_next',
    requiredPackets:['project_packet','project_interview_packet','project_manager_judgment_packet','project_document_receipts','project_relationships_packet'],
    objective:'Identify one precise missing fact, decision, source, or person before VAL takes another project-management step.',
    completionCondition:'One typed gap has a missing item, why it is needed, a resolving question or internal acquisition route, exact target packet, basis, and confidence.'
  },
  'project.sop':{
    id:'project.sop',surface:'project_managers',scopeType:'project_section',sectionId:'sop_fit',
    requiredPackets:['project_packet','project_sop_packet','project_identity_packet'],
    objective:'Select the real operating pattern that should run the selected project and make material deviations explicit.',
    completionCondition:'One current VAL operating system, its fit reasoning, material deviations or No material deviations, basis, and confidence are ready for internal review.'
  },
  'project.phase':{
    id:'project.phase',surface:'project_managers',scopeType:'project_section',sectionId:'project_phase',
    requiredPackets:['project_packet','project_sop_packet'],
    objective:'Record the selected project’s actual place in its already-applied operating-system sequence.',
    completionCondition:'One allowed current phase, phase evidence, exit condition, next-phase trigger, basis, and confidence are ready for internal review.'
  },
  'project.prepared_work':{
    id:'project.prepared_work',surface:'project_managers',scopeType:'project_section',sectionId:'prepared_work',
    requiredPackets:['project_packet','project_prepared_work_packets','project_document_receipts'],
    objective:'Choose one reviewable artifact VAL should prepare for the selected project, with the correct source and review boundary.',
    completionCondition:'One allowed artifact type, title, audience, source context, desired outcome, review boundary, basis, and confidence are ready for internal review.'
  },
  'project.workstreams':{
    id:'project.workstreams',
    surface:'project_managers',
    scopeType:'project_section',
    sectionId:'workstreams',
    requiredPackets:['project_packet','project_sop_packet','project_relationships_packet','project_identity_packet'],
    objective:'Build complete project workstreams.',
    completionCondition:'Each workstream is complete enough for executive review and explicit internal application.'
  },
  'project.next_move':{
    id:'project.next_move',
    surface:'project_managers',
    scopeType:'project_section',
    sectionId:'next_move',
    requiredPackets:['project_packet','project_next_action_packet','project_owner_packet','project_identity_packet'],
    objective:'Commit to the selected project\'s next narrow move.',
    completionCondition:'The move has an action, owner, timing or trigger, and source or decision basis.'
  },
  'transcript.working_brief':{
    id:'transcript.working_brief',
    surface:'transcripts',
    scopeType:'transcript',
    sectionId:'working_brief',
    requiredPackets:['transcript_working_brief','transcript_source_receipt','calendar_event_packet'],
    objective:'Prepare reviewable work from one selected transcript without altering its Krisp receipt.',
    completionCondition:'The prepared result cites the selected source receipt and has an explicit review or apply route.'
  },
  'transcript.action_item':{
    id:'transcript.action_item',
    surface:'transcripts',
    scopeType:'transcript',
    sectionId:'action_item',
    requiredPackets:['transcript_source_receipt','commitment_packet'],
    objective:'Turn one selected exact Krisp Action Item into one internal VAL Commitment.',
    completionCondition:'The exact Action Item is visible for review and has an explicit internal Apply route.'
  },
  'email.thread':{
    id:'email.thread',
    surface:'executive_inbox',
    scopeType:'email_thread',
    sectionId:'reply_draft',
    requiredPackets:['email_packet','email_judgment_packet','prepared_artifact_packet'],
    objective:'Prepare one review-only response from one selected email thread.',
    completionCondition:'The selected durable thread, executive reply intent, and reviewable internal draft are all visible and linked.'
  },
  'relationship.overview':{
    id:'relationship.overview',
    surface:'relationships',
    scopeType:'relationship',
    sectionId:'overview',
    requiredPackets:['relationship_packet','relationship_stewardship_packet'],
    objective:'Prepare one source-aware next stewardship move for one selected relationship.',
    completionCondition:'The selected relationship, executive direction, supporting source receipt, and review-gated internal next move are visible.'
  },
  'relationship.section':{
    id:'relationship.section',
    surface:'relationships',
    scopeType:'relationship_section',
    sectionId:'section',
    requiredPackets:['relationship_packet','relationship_person_packet'],
    objective:'Improve one selected relationship card without changing any other person or card.',
    completionCondition:'The selected relationship card has one review-gated, user-confirmed internal update.'
  },
  'observer.discussion':{
    id:'observer.discussion',
    surface:'observer_board',
    scopeType:'observer',
    sectionId:'discussion',
    requiredPackets:['observer_packet'],
    objective:'Hold a durable conversation through one selected Observer lens.',
    completionCondition:'The conversation and its confirmed corrections are retained for the same user and Observer.'
  },
  'board.chief_of_staff':{
    id:'board.chief_of_staff',
    surface:'observer_board',
    scopeType:'observer_board',
    sectionId:'synthesis',
    requiredPackets:['observer_board_packet','chief_of_staff_packet'],
    objective:'Hold a durable Chief of Staff conversation using the full Board context.',
    completionCondition:'The conversation, decisions, and corrections are retained for the same user and available when the Chief of Staff is reopened.'
  }
});

function createValCoworkService({
  dbQuery,
  hasPg=()=>false,
  getStore=()=>({}),
  saveStore=()=>{},
  uuid=(prefix)=>`${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`,
  tenantId=()=>'default',
  userId=()=>'default',
  loadProject=async()=>null,
  loadRelationships=async()=>[],
  loadDocuments=async()=>[],
  applyProjectIdentity=async()=>null,
  applyProjectOnboarding=async()=>null,
  applyProjectPeople=async()=>null,
  applyProjectDocuments=async()=>null,
  applyProjectMilestones=async()=>null,
  applyProjectMonitoring=async()=>null,
  applyProjectRelationshipNurture=async()=>null,
  applyProjectImportance=async()=>null,
  applyProjectRisk=async()=>null,
  applyProjectNarrative=async()=>null,
  applyProjectNeedsNext=async()=>null,
  applyProjectOperatingSystem=async()=>null,
  applyProjectPhase=async()=>null,
  applyProjectPreparedWork=async()=>null,
  applyProjectOverview=async()=>null,
  applyProjectWorkstreams=async()=>null,
  applyProjectNextMove=async()=>null,
  loadTranscript=async()=>null,
  prepareTranscriptMeetingOverview=async()=>null,
  createTranscriptActionItem=async()=>null,
  loadEmailThread=async()=>null,
  prepareEmailThreadDraft=async()=>null,
  loadRelationship=async()=>null,
  applyRelationshipOverview=async()=>null,
  applyRelationshipSection=async()=>null,
  generateConversationReply=async()=>''
}={}){
  function scope(){return {tenantId:tenantId(),userId:userId()};}
  function store(){
    const value=getStore() || {};
    if(!Array.isArray(value.coworkSessions)) value.coworkSessions=[];
    if(!Array.isArray(value.coworkWorkItems)) value.coworkWorkItems=[];
    if(!Array.isArray(value.coworkActionReceipts)) value.coworkActionReceipts=[];
    return value;
  }
  async function pgUpsert(table,row,columns){
    const names=columns.map(toSnake);
    // node-postgres treats JavaScript arrays as Postgres arrays. These columns are jsonb,
    // so serialize every JSON payload explicitly before it crosses the database boundary.
    const values=columns.map((key)=>pgValueForColumn(key,row[key]));
    const params=columns.map((_,index)=>`$${index+1}`).join(',');
    const updates=names.filter((name)=>!['id','created_at'].includes(name)).map((name)=>`${name}=excluded.${name}`).join(',');
    const result=await dbQuery(`insert into ${table} (${names.join(',')}) values (${params}) on conflict (id) do update set ${updates} returning *`,values);
    if(!result?.rows?.[0]) throw new Error('VAL could not save this scoped Co-Work session. Nothing was changed.');
    return rowToCamel(result.rows[0]);
  }
  async function saveSession(row){
    const columns=['id','tenantId','userId','entrypointId','scopeType','scopeId','scopeSectionId','status','workingBriefJson','questionPlanJson','stateJson','createdAt','updatedAt'];
    if(hasPg()) return pgUpsert('val_cowork_sessions',row,columns);
    const value=store();
    const index=value.coworkSessions.findIndex((item)=>item.id===row.id && item.tenantId===row.tenantId && item.userId===row.userId);
    if(index >= 0) value.coworkSessions[index]={...value.coworkSessions[index],...row,createdAt:value.coworkSessions[index].createdAt || row.createdAt,updatedAt:new Date().toISOString()};
    else value.coworkSessions.unshift(row);
    saveStore(value);
    return index >= 0 ? value.coworkSessions[index] : row;
  }
  async function saveWorkItem(row){
    const columns=['id','tenantId','userId','sessionId','workType','title','status','payloadJson','sourceRefsJson','createdAt','updatedAt'];
    if(hasPg()) return pgUpsert('val_cowork_work_items',row,columns);
    const value=store();
    const index=value.coworkWorkItems.findIndex((item)=>item.id===row.id && item.tenantId===row.tenantId && item.userId===row.userId);
    if(index >= 0) value.coworkWorkItems[index]={...value.coworkWorkItems[index],...row,createdAt:value.coworkWorkItems[index].createdAt || row.createdAt,updatedAt:new Date().toISOString()};
    else value.coworkWorkItems.unshift(row);
    saveStore(value);
    return index >= 0 ? value.coworkWorkItems[index] : row;
  }
  async function saveReceipt(row){
    const columns=['id','tenantId','userId','sessionId','workItemId','action','status','summary','payloadJson','createdAt'];
    if(hasPg()) return pgUpsert('val_cowork_action_receipts',row,columns);
    const value=store();
    const index=value.coworkActionReceipts.findIndex((item)=>item.id===row.id && item.tenantId===row.tenantId && item.userId===row.userId);
    if(index >= 0) value.coworkActionReceipts[index]={...value.coworkActionReceipts[index],...row};
    else value.coworkActionReceipts.unshift(row);
    saveStore(value);
    return index >= 0 ? value.coworkActionReceipts[index] : row;
  }
  async function getSession(id){
    const sc=scope();
    if(hasPg()){
      const result=await dbQuery('select * from val_cowork_sessions where id=$1 and tenant_id=$2 and user_id=$3 limit 1',[id,sc.tenantId,sc.userId]);
      return result.rows?.[0] ? rowToCamel(result.rows[0]) : null;
    }
    return store().coworkSessions.find((item)=>item.id===id && item.tenantId===sc.tenantId && item.userId===sc.userId) || null;
  }
  async function getWorkItem(id){
    const sc=scope();
    if(hasPg()){
      const result=await dbQuery('select * from val_cowork_work_items where id=$1 and tenant_id=$2 and user_id=$3 limit 1',[id,sc.tenantId,sc.userId]);
      return result.rows?.[0] ? rowToCamel(result.rows[0]) : null;
    }
    return store().coworkWorkItems.find((item)=>item.id===id && item.tenantId===sc.tenantId && item.userId===sc.userId) || null;
  }
  async function findSessionWorkItem(sessionId){
    const sc=scope();
    if(hasPg()){
      const result=await dbQuery('select * from val_cowork_work_items where session_id=$1 and tenant_id=$2 and user_id=$3 order by updated_at desc limit 1',[sessionId,sc.tenantId,sc.userId]);
      return result.rows?.[0] ? rowToCamel(result.rows[0]) : null;
    }
    return store().coworkWorkItems.filter((item)=>item.sessionId===sessionId && item.tenantId===sc.tenantId && item.userId===sc.userId).sort((a,b)=>String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))[0] || null;
  }
  async function findLatestConversationSession(entrypointId,scopeId){
    const sc=scope();
    if(hasPg()){
      const result=await dbQuery('select * from val_cowork_sessions where tenant_id=$1 and user_id=$2 and entrypoint_id=$3 and scope_id=$4 order by updated_at desc limit 1',[sc.tenantId,sc.userId,entrypointId,scopeId]);
      return result.rows?.[0] ? rowToCamel(result.rows[0]) : null;
    }
    return store().coworkSessions
      .filter((item)=>item.tenantId===sc.tenantId && item.userId===sc.userId && item.entrypointId===entrypointId && item.scopeId===scopeId)
      .sort((a,b)=>String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))[0] || null;
  }
  function publicResult(session,workItem,message='',question=null,receipt=null){
    const state=session.stateJson || {};
    const brief=session.workingBriefJson || {};
    return {
      ok:true,
      entrypoint:COWORK_ENTRYPOINTS[session.entrypointId] || null,
      session:{
        id:session.id,
        entrypointId:session.entrypointId,
        scope:{entityType:session.scopeType,entityId:session.scopeId,sectionId:session.scopeSectionId},
        status:session.status,
        workingBrief:brief,
        state:{
          stage:state.stage || '',
          draftWorkstreams:safeArray(state.draftWorkstreams),
          draftIdentity:state.draftIdentity || null,
          draftPeople:state.draftPeople || null,
          draftDocuments:state.draftDocuments || null,
          draftMilestones:safeArray(state.draftMilestones),
          draftMonitoringRules:safeArray(state.draftMonitoringRules),
          draftRelationshipNurtureRules:safeArray(state.draftRelationshipNurtureRules),
          draftProjectImportance:state.draftProjectImportance || null,
          draftProjectRisk:state.draftProjectRisk || null,
          draftNextMove:state.draftNextMove || null,
          draftTranscriptArtifact:state.draftTranscriptArtifact || null,
          draftEmailArtifact:state.draftEmailArtifact || null,
          draftRelationshipOverview:state.draftRelationshipOverview || null,
          messages:safeArray(state.messages)
        }
      },
      workItem:workItem ? {
        id:workItem.id,
        type:workItem.workType,
        title:workItem.title,
        status:workItem.status,
        payload:workItem.payloadJson || {},
        sourceRefs:workItem.sourceRefsJson || []
      } : null,
      message,
      question,
      receipt,
      no_external_action:true
    };
  }
  async function openObserverConversation(entrypointId,input={}){
    const entry=COWORK_ENTRYPOINTS[entrypointId];
    const scopeInput=input.scope || {};
    const scopeId=compactText(scopeInput.entityId || scopeInput.entity_id || input.observerId || input.observer_id || '',180);
    if(!scopeId) throw new Error('VAL needs the selected Observer before opening this conversation.');
    const context=input.context && typeof input.context==='object' ? input.context : {};
    const title=compactText(input.title || context.title || (entrypointId==='board.chief_of_staff'?'Chief of Staff':'Observer'),180);
    const now=new Date().toISOString();
    const existing=await findLatestConversationSession(entrypointId,scopeId);
    const brief={
      ...(existing?.workingBriefJson || {}),
      title,
      observerId:scopeId,
      objective:entry.objective,
      completionCondition:entry.completionCondition,
      context,
      refreshedAt:now,
      noExternalAction:true
    };
    if(existing){
      existing.workingBriefJson=brief;
      existing.stateJson={...(existing.stateJson || {}),stage:'conversation',messages:safeArray(existing.stateJson?.messages)};
      existing.status='active';
      existing.updatedAt=now;
      const saved=await saveSession(existing);
      return {...publicResult(saved,null,'',null),resumed:true};
    }
    const sc=scope();
    const session=await saveSession({
      id:uuid('cowork'),tenantId:sc.tenantId,userId:sc.userId,entrypointId,
      scopeType:entry.scopeType,scopeId,scopeSectionId:entry.sectionId,status:'active',
      workingBriefJson:brief,questionPlanJson:[],stateJson:{stage:'conversation',messages:[]},
      createdAt:now,updatedAt:now
    });
    return {...publicResult(session,null,'',null),resumed:false};
  }
  async function respondObserverConversation(session,answer){
    const state={...(session.stateJson || {}),stage:'conversation',messages:safeArray(session.stateJson?.messages)};
    state.messages.push({role:'user',content:answer,at:new Date().toISOString()});
    let reply=observerConversationDirectReply({
      entrypointId:session.entrypointId,
      workingBrief:session.workingBriefJson || {},
      answer
    });
    try{
      if(!reply){
        reply=multilineText(await generateConversationReply({
          entrypointId:session.entrypointId,
          scopeId:session.scopeId,
          workingBrief:session.workingBriefJson || {},
          messages:state.messages
        }),6000);
      }
    }catch(error){
      reply='I have saved what you said with this conversation, but I could not finish a thoughtful response yet. Nothing was lost.';
    }
    if(!reply) reply='I have saved that with this conversation. I will carry it forward the next time we work through this lens.';
    state.messages.push({role:'assistant',content:reply,at:new Date().toISOString()});
    session.stateJson=state;
    session.status='active';
    session.updatedAt=new Date().toISOString();
    const saved=await saveSession(session);
    return publicResult(saved,null,reply,null);
  }
  async function respondScopedConversation(session,workItem,answer){
    const state={...(session.stateJson || {}),messages:safeArray(session.stateJson?.messages)};
    state.messages.push({role:'user',content:answer,at:new Date().toISOString()});
    const currentQuestion=safeArray(session.questionPlanJson).slice(-1)[0] || null;
    let reply='';
    try{
      reply=multilineText(await generateConversationReply({
        entrypointId:session.entrypointId,
        scopeId:session.scopeId,
        workingBrief:session.workingBriefJson || {},
        messages:state.messages
      }),6000);
    }catch(_){
      reply=scopedConversationFallbackReply({
        workingBrief:session.workingBriefJson || {},
        answer,
        question:currentQuestion
      });
    }
    if(!reply)reply=scopedConversationFallbackReply({
      workingBrief:session.workingBriefJson || {},
      answer,
      question:currentQuestion
    });
    state.messages.push({role:'assistant',content:reply,at:new Date().toISOString()});
    session.stateJson=state;
    session.updatedAt=new Date().toISOString();
    const saved=await saveSession(session);
    return publicResult(saved,workItem,reply,currentQuestion);
  }
  async function openProjectNextMoveEntry(input={}){
    const entry=COWORK_ENTRYPOINTS['project.next_move'];
    const scopeInput=input.scope || {};
    const entityId=compactText(scopeInput.entityId || scopeInput.entity_id || input.projectId || '',220);
    if(!entityId) throw new Error('Project Managers needs the selected project before it can decide the next move.');
    const project=await loadProject(entityId);
    if(!project) throw new Error('VAL could not load the selected project. It did not substitute another project.');
    const brief=buildProjectNextMoveBrief(project,input);
    if(!brief.entityId) throw new Error('The selected project has no durable identifier yet.');
    const state={stage:'next_move',draftNextMove:{...brief.currentProposal},answers:[]};
    const question=nextMoveQuestion(state,brief);
    const now=new Date().toISOString();
    const sc=scope();
    const session=await saveSession({
      id:uuid('cowork'),
      tenantId:sc.tenantId,
      userId:sc.userId,
      entrypointId:entry.id,
      scopeType:entry.scopeType,
      scopeId:brief.entityId,
      scopeSectionId:entry.sectionId,
      status:'needs_input',
      workingBriefJson:brief,
      questionPlanJson:[question],
      stateJson:state,
      createdAt:now,
      updatedAt:now
    });
    const workItem=await saveWorkItem({
      id:uuid('workitem'),
      tenantId:sc.tenantId,
      userId:sc.userId,
      sessionId:session.id,
      workType:'project_next_move',
      title:`Next move for ${brief.projectName}`,
      status:'needs_input',
      payloadJson:{projectId:brief.entityId,projectName:brief.projectName,objective:brief.objective,completionCondition:brief.completionCondition},
      sourceRefsJson:brief.sourceRefs,
      createdAt:now,
      updatedAt:now
    });
    return publicResult(session,workItem,question.question,question);
  }
  async function openProjectOverviewEntry(input={}){
    const entry=COWORK_ENTRYPOINTS['project.overview'];
    const scopeInput=input.scope || {};
    const entityId=compactText(scopeInput.entityId || scopeInput.entity_id || input.projectId || '',220);
    if(!entityId) throw new Error('Project Managers needs the selected project before it can set a Round Table focus.');
    const project=await loadProject(entityId);
    if(!project) throw new Error('VAL could not load the selected project. It did not substitute another project.');
    const brief=buildProjectOverviewBrief(project,input);
    if(!brief.entityId) throw new Error('The selected project has no durable identifier yet.');
    const state={stage:'project_overview',draftProjectOverviewFocus:{},answers:[]};
    const question=projectOverviewQuestion(state,brief);
    const now=new Date().toISOString(),sc=scope();
    const session=await saveSession({id:uuid('cowork'),tenantId:sc.tenantId,userId:sc.userId,entrypointId:entry.id,scopeType:entry.scopeType,scopeId:brief.entityId,scopeSectionId:entry.sectionId,status:'needs_input',workingBriefJson:brief,questionPlanJson:[question],stateJson:state,createdAt:now,updatedAt:now});
    const workItem=await saveWorkItem({id:uuid('workitem'),tenantId:sc.tenantId,userId:sc.userId,sessionId:session.id,workType:'project_overview_focus',title:`Round Table focus for ${brief.projectName}`,status:'needs_input',payloadJson:{projectId:brief.entityId,projectName:brief.projectName,projectOverviewFocus:state.draftProjectOverviewFocus,objective:brief.objective,completionCondition:brief.completionCondition},sourceRefsJson:brief.sourceRefs,createdAt:now,updatedAt:now});
    return publicResult(session,workItem,question.question,question);
  }
  async function respondProjectOverview(session,workItem,answer){
    const brief=session.workingBriefJson || {};
    const state={...(session.stateJson || {}),answers:safeArray(session.stateJson?.answers)};
    state.answers.push({text:answer,at:new Date().toISOString()});
    state.draftProjectOverviewFocus=parseProjectOverviewFocus(answer,brief,state.draftProjectOverviewFocus || {});
    const focus=normalizeProjectOverviewFocus(state.draftProjectOverviewFocus,brief);
    const missing=missingProjectOverviewFocusFields(focus,brief);
    let question,message='';
    if(!missing.length){
      state.stage='ready_to_apply';session.status='needs_review';workItem.status='needs_review';
      workItem.payloadJson={...workItem.payloadJson,projectId:brief.entityId,projectName:brief.projectName,projectOverviewFocus:focus,completionCondition:brief.completionCondition};
      question=projectOverviewQuestion(state,brief);message='VAL prepared the Round Table Focus for review. Apply it when this is true.';
    }else{
      state.stage='project_overview_details';session.status='needs_input';workItem.status='needs_input';
      question=projectOverviewQuestion(state,brief);message=question.question;
    }
    session.stateJson=state;session.questionPlanJson=[...(session.questionPlanJson || []),question];session.updatedAt=new Date().toISOString();workItem.updatedAt=new Date().toISOString();
    await saveSession(session);await saveWorkItem(workItem);return publicResult(session,workItem,message,question);
  }
  async function openProjectIdentityEntry(input={}){
    const entry=COWORK_ENTRYPOINTS['project.identity'];
    const scopeInput=input.scope || {};
    const entityId=compactText(scopeInput.entityId || scopeInput.entity_id || input.projectId || '',220);
    if(!entityId) throw new Error('Project Managers needs the selected project before it can establish its foundation.');
    const project=await loadProject(entityId);
    if(!project) throw new Error('VAL could not load the selected project. It did not substitute another project.');
    const brief=buildProjectIdentityBrief(project,input);
    if(!brief.entityId) throw new Error('The selected project has no durable identifier yet.');
    const state={stage:'identity',draftIdentity:{...brief.currentIdentity},answers:[]};
    const question=projectIdentityQuestion(state,brief);
    const now=new Date().toISOString();
    const sc=scope();
    const session=await saveSession({
      id:uuid('cowork'),tenantId:sc.tenantId,userId:sc.userId,entrypointId:entry.id,scopeType:entry.scopeType,scopeId:brief.entityId,scopeSectionId:entry.sectionId,status:'needs_input',workingBriefJson:brief,questionPlanJson:[question],stateJson:state,createdAt:now,updatedAt:now
    });
    const workItem=await saveWorkItem({
      id:uuid('workitem'),tenantId:sc.tenantId,userId:sc.userId,sessionId:session.id,workType:'project_identity',title:`Project foundation for ${brief.projectName}`,status:'needs_input',
      payloadJson:{projectId:brief.entityId,projectName:brief.projectName,identity:state.draftIdentity,objective:brief.objective,completionCondition:brief.completionCondition},sourceRefsJson:brief.sourceRefs,createdAt:now,updatedAt:now
    });
    return publicResult(session,workItem,question.question,question);
  }
  async function openProjectOnboardingEntry(input={}){
    const entry=COWORK_ENTRYPOINTS['project.onboarding'];
    const scopeInput=input.scope || {};
    const entityId=compactText(scopeInput.entityId || scopeInput.entity_id || input.projectId || '',220);
    if(!entityId) throw new Error('Project Managers needs the selected project before it can continue onboarding.');
    const project=await loadProject(entityId);
    if(!project) throw new Error('VAL could not load the selected project. It did not substitute another project.');
    const brief=buildProjectOnboardingBrief(project,input);
    if(!brief.entityId) throw new Error('The selected project has no durable identifier yet.');
    const now=new Date().toISOString();
    const sc=scope();
    const complete=brief.currentStage==='complete';
    const state={stage:brief.currentStage,draftAnswer:'',answers:[]};
    const question=projectOnboardingQuestion(state,brief);
    const session=await saveSession({
      id:uuid('cowork'),tenantId:sc.tenantId,userId:sc.userId,entrypointId:entry.id,scopeType:entry.scopeType,scopeId:brief.entityId,scopeSectionId:entry.sectionId,
      status:complete?'completed':'needs_input',workingBriefJson:brief,questionPlanJson:[question],stateJson:state,createdAt:now,updatedAt:now
    });
    const workItem=await saveWorkItem({
      id:uuid('workitem'),tenantId:sc.tenantId,userId:sc.userId,sessionId:session.id,workType:'project_onboarding_stage',title:complete?`Project onboarding complete for ${brief.projectName}`:`Project onboarding: ${brief.currentStageContract.pageBoxes.join(' and ')}`,
      status:complete?'applied':'needs_input',payloadJson:{projectId:brief.entityId,projectName:brief.projectName,stage:brief.currentStage,stageContract:brief.currentStageContract,objective:brief.objective,completionCondition:brief.completionCondition},sourceRefsJson:brief.sourceRefs,createdAt:now,updatedAt:now
    });
    return publicResult(session,workItem,question.question,question);
  }
  async function respondProjectOnboarding(session,workItem,answer){
    const brief=session.workingBriefJson || {};
    const state={...(session.stateJson || {}),answers:safeArray(session.stateJson?.answers)};
    const stage=state.stage || brief.currentStage || 'first_question';
    if(stage==='complete') throw new Error('This project onboarding sequence is complete. Open the Project Managers section you want to refine.');
    state.answers.push({text:answer,at:new Date().toISOString()});
    state.draftAnswer=answer;
    state.stage='ready_to_apply';
    session.status='needs_review';
    workItem.status='needs_review';
    const contract=projectOnboardingStageContract(stage);
    workItem.payloadJson={
      ...workItem.payloadJson,
      projectId:brief.entityId,
      projectName:brief.projectName,
      stage,
      answer,
      nextStage:projectOnboardingNextStage(stage),
      stageContract:contract,
      completionCondition:brief.completionCondition
    };
    const question=projectOnboardingQuestion(state,brief);
    session.stateJson=state;
    session.questionPlanJson=[...(session.questionPlanJson || []),question];
    session.updatedAt=new Date().toISOString();
    workItem.updatedAt=new Date().toISOString();
    await saveSession(session);
    await saveWorkItem(workItem);
    return publicResult(session,workItem,`VAL prepared this onboarding answer for ${contract.pageBoxes.join(', ')}. Apply it when this is true.`,question);
  }
  async function openProjectPeopleEntry(input={}){
    const entry=COWORK_ENTRYPOINTS['project.people'];
    const scopeInput=input.scope || {};
    const entityId=compactText(scopeInput.entityId || scopeInput.entity_id || input.projectId || '',220);
    if(!entityId) throw new Error('Project Managers needs the selected project before it can link people.');
    const project=await loadProject(entityId);
    if(!project) throw new Error('VAL could not load the selected project. It did not substitute another project.');
    const candidates=await loadRelationships({limit:100});
    const brief=buildProjectPeopleBrief(project,candidates,input);
    if(!brief.entityId) throw new Error('The selected project has no durable identifier yet.');
    const state={stage:'people',draftPeople:{people:brief.existingPeople.filter((person)=>person.known),ownerId:'',ownerName:brief.currentOwner,unresolved:[]},answers:[]};
    const question=projectPeopleQuestion(state,brief);
    const now=new Date().toISOString(),sc=scope();
    const session=await saveSession({id:uuid('cowork'),tenantId:sc.tenantId,userId:sc.userId,entrypointId:entry.id,scopeType:entry.scopeType,scopeId:brief.entityId,scopeSectionId:entry.sectionId,status:'needs_input',workingBriefJson:brief,questionPlanJson:[question],stateJson:state,createdAt:now,updatedAt:now});
    const workItem=await saveWorkItem({id:uuid('workitem'),tenantId:sc.tenantId,userId:sc.userId,sessionId:session.id,workType:'project_people',title:`People for ${brief.projectName}`,status:'needs_input',payloadJson:{projectId:brief.entityId,projectName:brief.projectName,people:state.draftPeople.people,objective:brief.objective,completionCondition:brief.completionCondition},sourceRefsJson:brief.sourceRefs,createdAt:now,updatedAt:now});
    return publicResult(session,workItem,question.question,question);
  }
  async function respondProjectPeople(session,workItem,answer){
    const brief=session.workingBriefJson || {};
    const state={...(session.stateJson || {}),answers:safeArray(session.stateJson?.answers)};
    state.answers.push({text:answer,at:new Date().toISOString()});
    const proposal=parseProjectPeople(answer,brief,state.draftPeople || {});
    state.draftPeople=proposal;
    const missing=missingProjectPeopleFields(proposal);
    if(proposal.unresolved.length) state.stage='unresolved';
    else if(missing.includes('roles')) state.stage='roles';
    else if(missing.includes('project owner')) state.stage='owner';
    let question,message='';
    if(!proposal.unresolved.length && !missing.length){
      state.stage='ready_to_apply';session.status='needs_review';workItem.status='needs_review';
      workItem.payloadJson={...workItem.payloadJson,projectId:brief.entityId,projectName:brief.projectName,people:proposal.people,ownerId:proposal.ownerId,ownerName:proposal.ownerName,completionCondition:brief.completionCondition};
      question=projectPeopleQuestion(state,brief);message='VAL prepared the linked people and project owner for review. Apply when this is true.';
    }else{question=projectPeopleQuestion(state,brief);message=question.question;session.status='needs_input';workItem.status='needs_input';}
    session.stateJson=state;session.questionPlanJson=[...(session.questionPlanJson || []),question];session.updatedAt=new Date().toISOString();workItem.updatedAt=new Date().toISOString();
    await saveSession(session);await saveWorkItem(workItem);return publicResult(session,workItem,message,question);
  }
  async function openProjectDocumentsEntry(input={}){
    const entry=COWORK_ENTRYPOINTS['project.documents'];
    const scopeInput=input.scope || {};
    const entityId=compactText(scopeInput.entityId || scopeInput.entity_id || input.projectId || '',220);
    if(!entityId) throw new Error('Project Managers needs the selected project before it can link documents.');
    const project=await loadProject(entityId);
    if(!project) throw new Error('VAL could not load the selected project. It did not substitute another project.');
    const documents=await loadDocuments({limit:120});
    const brief=buildProjectDocumentsBrief(project,documents,input);
    if(!brief.entityId) throw new Error('The selected project has no durable identifier yet.');
    const state={stage:'documents',draftDocuments:{documents:brief.existingDocuments,unresolved:[]},answers:[]};
    const question=projectDocumentsQuestion(state,brief);
    const now=new Date().toISOString(),sc=scope();
    const session=await saveSession({id:uuid('cowork'),tenantId:sc.tenantId,userId:sc.userId,entrypointId:entry.id,scopeType:entry.scopeType,scopeId:brief.entityId,scopeSectionId:entry.sectionId,status:'needs_input',workingBriefJson:brief,questionPlanJson:[question],stateJson:state,createdAt:now,updatedAt:now});
    const workItem=await saveWorkItem({id:uuid('workitem'),tenantId:sc.tenantId,userId:sc.userId,sessionId:session.id,workType:'project_documents',title:`Documents for ${brief.projectName}`,status:'needs_input',payloadJson:{projectId:brief.entityId,projectName:brief.projectName,documents:state.draftDocuments.documents,objective:brief.objective,completionCondition:brief.completionCondition},sourceRefsJson:brief.sourceRefs,createdAt:now,updatedAt:now});
    return publicResult(session,workItem,question.question,question);
  }
  async function respondProjectDocuments(session,workItem,answer){
    const brief=session.workingBriefJson || {};
    const state={...(session.stateJson || {}),answers:safeArray(session.stateJson?.answers)};
    state.answers.push({text:answer,at:new Date().toISOString()});
    const proposal=parseProjectDocuments(answer,brief,state.draftDocuments || {});
    state.draftDocuments=proposal;
    const missing=missingProjectDocumentFields(proposal);
    if(proposal.unresolved.length) state.stage='unresolved';
    else if(missing.includes('intended use')) state.stage='intended_use';
    let question,message='';
    if(!proposal.unresolved.length && !missing.length){
      state.stage='ready_to_apply';session.status='needs_review';workItem.status='needs_review';
      workItem.payloadJson={...workItem.payloadJson,projectId:brief.entityId,projectName:brief.projectName,documents:proposal.documents,completionCondition:brief.completionCondition};
      workItem.sourceRefsJson=sourceRefsForDocuments([...safeArray(brief.sourceRefs),...proposal.documents]);
      question=projectDocumentsQuestion(state,brief);message='VAL prepared the linked document receipts and intended uses for review. Apply when this is true.';
    }else{question=projectDocumentsQuestion(state,brief);message=question.question;session.status='needs_input';workItem.status='needs_input';}
    session.stateJson=state;session.questionPlanJson=[...(session.questionPlanJson || []),question];session.updatedAt=new Date().toISOString();workItem.updatedAt=new Date().toISOString();
    await saveSession(session);await saveWorkItem(workItem);return publicResult(session,workItem,message,question);
  }
  async function openProjectMilestonesEntry(input={}){
    const entry=COWORK_ENTRYPOINTS['project.milestones'];
    const scopeInput=input.scope || {};
    const entityId=compactText(scopeInput.entityId || scopeInput.entity_id || input.projectId || '',220);
    if(!entityId) throw new Error('Project Managers needs the selected project before it can define milestones.');
    const project=await loadProject(entityId);
    if(!project) throw new Error('VAL could not load the selected project. It did not substitute another project.');
    const brief=buildProjectMilestonesBrief(project,input);
    if(!brief.entityId) throw new Error('The selected project has no durable identifier yet.');
    const state={stage:brief.existingWorkstreams.length ? 'milestones' : 'needs_workstreams',draftMilestones:brief.existingMilestones,answers:[]};
    const question=projectMilestonesQuestion(state,brief);
    const now=new Date().toISOString(),sc=scope();
    const session=await saveSession({id:uuid('cowork'),tenantId:sc.tenantId,userId:sc.userId,entrypointId:entry.id,scopeType:entry.scopeType,scopeId:brief.entityId,scopeSectionId:entry.sectionId,status:'needs_input',workingBriefJson:brief,questionPlanJson:[question],stateJson:state,createdAt:now,updatedAt:now});
    const workItem=await saveWorkItem({id:uuid('workitem'),tenantId:sc.tenantId,userId:sc.userId,sessionId:session.id,workType:'project_milestones',title:`Milestones for ${brief.projectName}`,status:'needs_input',payloadJson:{projectId:brief.entityId,projectName:brief.projectName,milestones:state.draftMilestones,objective:brief.objective,completionCondition:brief.completionCondition},sourceRefsJson:brief.sourceRefs,createdAt:now,updatedAt:now});
    return publicResult(session,workItem,question.question,question);
  }
  async function respondProjectMilestones(session,workItem,answer){
    const brief=session.workingBriefJson || {};
    if(!safeArray(brief.existingWorkstreams).length) throw new Error('Milestones need the selected project workstreams first. Nothing was changed.');
    const state={...(session.stateJson || {}),answers:safeArray(session.stateJson?.answers)};
    state.answers.push({text:answer,at:new Date().toISOString()});
    state.draftMilestones=parseProjectMilestones(answer,brief,state.draftMilestones || []);
    const milestones=safeArray(state.draftMilestones);
    const incomplete=milestones.filter((milestone)=>missingProjectMilestoneFields(milestone,brief).length);
    let question,message='';
    if(milestones.length && !incomplete.length){
      state.stage='ready_to_apply';session.status='needs_review';workItem.status='needs_review';
      workItem.payloadJson={...workItem.payloadJson,projectId:brief.entityId,projectName:brief.projectName,milestones,completionCondition:brief.completionCondition};
      question=projectMilestonesQuestion(state,brief);message=`VAL prepared ${milestones.length} milestone${milestones.length === 1 ? '' : 's'} for review. Apply them when this is true.`;
    }else{
      state.stage='milestone_details';session.status='needs_input';workItem.status='needs_input';
      question=projectMilestonesQuestion(state,brief);message=question.question;
    }
    session.stateJson=state;session.questionPlanJson=[...(session.questionPlanJson || []),question];session.updatedAt=new Date().toISOString();workItem.updatedAt=new Date().toISOString();
    await saveSession(session);await saveWorkItem(workItem);return publicResult(session,workItem,message,question);
  }
  async function openProjectMonitoringEntry(input={}){
    const entry=COWORK_ENTRYPOINTS['project.monitoring'];
    const scopeInput=input.scope || {};
    const entityId=compactText(scopeInput.entityId || scopeInput.entity_id || input.projectId || '',220);
    if(!entityId) throw new Error('Project Managers needs the selected project before it can define monitoring rules.');
    const project=await loadProject(entityId);
    if(!project) throw new Error('VAL could not load the selected project. It did not substitute another project.');
    const brief=buildProjectMonitoringBrief(project,input);
    if(!brief.entityId) throw new Error('The selected project has no durable identifier yet.');
    const state={stage:'monitoring',draftMonitoringRules:brief.existingRules,answers:[]};
    const question=projectMonitoringQuestion(state,brief);
    const now=new Date().toISOString(),sc=scope();
    const session=await saveSession({id:uuid('cowork'),tenantId:sc.tenantId,userId:sc.userId,entrypointId:entry.id,scopeType:entry.scopeType,scopeId:brief.entityId,scopeSectionId:entry.sectionId,status:'needs_input',workingBriefJson:brief,questionPlanJson:[question],stateJson:state,createdAt:now,updatedAt:now});
    const workItem=await saveWorkItem({id:uuid('workitem'),tenantId:sc.tenantId,userId:sc.userId,sessionId:session.id,workType:'project_monitoring',title:`Monitoring for ${brief.projectName}`,status:'needs_input',payloadJson:{projectId:brief.entityId,projectName:brief.projectName,monitoringRules:state.draftMonitoringRules,objective:brief.objective,completionCondition:brief.completionCondition},sourceRefsJson:brief.sourceRefs,createdAt:now,updatedAt:now});
    return publicResult(session,workItem,question.question,question);
  }
  async function respondProjectMonitoring(session,workItem,answer){
    const brief=session.workingBriefJson || {};
    const state={...(session.stateJson || {}),answers:safeArray(session.stateJson?.answers)};
    state.answers.push({text:answer,at:new Date().toISOString()});
    state.draftMonitoringRules=parseMonitoringRules(answer,brief,state.draftMonitoringRules || []);
    const rules=safeArray(state.draftMonitoringRules);
    const incomplete=rules.filter((rule)=>missingMonitoringRuleFields(rule).length);
    let question,message='';
    if(rules.length && !incomplete.length){
      state.stage='ready_to_apply';session.status='needs_review';workItem.status='needs_review';
      workItem.payloadJson={...workItem.payloadJson,projectId:brief.entityId,projectName:brief.projectName,monitoringRules:rules,completionCondition:brief.completionCondition};
      question=projectMonitoringQuestion(state,brief);message=`VAL prepared ${rules.length} monitoring rule${rules.length === 1 ? '' : 's'} for review. Apply them when this is true.`;
    }else{
      state.stage='monitoring_details';session.status='needs_input';workItem.status='needs_input';
      question=projectMonitoringQuestion(state,brief);message=question.question;
    }
    session.stateJson=state;session.questionPlanJson=[...(session.questionPlanJson || []),question];session.updatedAt=new Date().toISOString();workItem.updatedAt=new Date().toISOString();
    await saveSession(session);await saveWorkItem(workItem);return publicResult(session,workItem,message,question);
  }
  async function openProjectRelationshipNurtureEntry(input={}){
    const entry=COWORK_ENTRYPOINTS['project.relationship_nurture'];
    const scopeInput=input.scope || {};
    const entityId=compactText(scopeInput.entityId || scopeInput.entity_id || input.projectId || '',220);
    if(!entityId) throw new Error('Project Managers needs the selected project before it can define relationship nurture rules.');
    const project=await loadProject(entityId);
    if(!project) throw new Error('VAL could not load the selected project. It did not substitute another project.');
    const brief=buildProjectRelationshipNurtureBrief(project,input);
    if(!brief.entityId) throw new Error('The selected project has no durable identifier yet.');
    const state={stage:brief.linkedRelationships.length ? 'relationship_nurture' : 'needs_people',draftRelationshipNurtureRules:brief.existingRules,answers:[]};
    const question=projectRelationshipNurtureQuestion(state,brief);
    const now=new Date().toISOString(),sc=scope();
    const session=await saveSession({id:uuid('cowork'),tenantId:sc.tenantId,userId:sc.userId,entrypointId:entry.id,scopeType:entry.scopeType,scopeId:brief.entityId,scopeSectionId:entry.sectionId,status:'needs_input',workingBriefJson:brief,questionPlanJson:[question],stateJson:state,createdAt:now,updatedAt:now});
    const workItem=await saveWorkItem({id:uuid('workitem'),tenantId:sc.tenantId,userId:sc.userId,sessionId:session.id,workType:'project_relationship_nurture',title:`Relationship nurture for ${brief.projectName}`,status:'needs_input',payloadJson:{projectId:brief.entityId,projectName:brief.projectName,relationshipNurtureRules:state.draftRelationshipNurtureRules,objective:brief.objective,completionCondition:brief.completionCondition},sourceRefsJson:brief.sourceRefs,createdAt:now,updatedAt:now});
    return publicResult(session,workItem,question.question,question);
  }
  async function respondProjectRelationshipNurture(session,workItem,answer){
    const brief=session.workingBriefJson || {};
    if(!safeArray(brief.linkedRelationships).length) throw new Error('Relationship nurture needs an existing project-linked relationship first. Nothing was changed.');
    const state={...(session.stateJson || {}),answers:safeArray(session.stateJson?.answers)};
    state.answers.push({text:answer,at:new Date().toISOString()});
    state.draftRelationshipNurtureRules=parseRelationshipNurtureRules(answer,brief,state.draftRelationshipNurtureRules || []);
    const rules=safeArray(state.draftRelationshipNurtureRules);
    const incomplete=rules.filter((rule)=>missingRelationshipNurtureFields(rule,brief).length);
    let question,message='';
    if(rules.length && !incomplete.length){
      state.stage='ready_to_apply';session.status='needs_review';workItem.status='needs_review';
      workItem.payloadJson={...workItem.payloadJson,projectId:brief.entityId,projectName:brief.projectName,relationshipNurtureRules:rules,completionCondition:brief.completionCondition};
      question=projectRelationshipNurtureQuestion(state,brief);message=`VAL prepared ${rules.length} relationship nurture rule${rules.length === 1 ? '' : 's'} for review. Apply them when this is true.`;
    }else{
      state.stage='relationship_nurture_details';session.status='needs_input';workItem.status='needs_input';
      question=projectRelationshipNurtureQuestion(state,brief);message=question.question;
    }
    session.stateJson=state;session.questionPlanJson=[...(session.questionPlanJson || []),question];session.updatedAt=new Date().toISOString();workItem.updatedAt=new Date().toISOString();
    await saveSession(session);await saveWorkItem(workItem);return publicResult(session,workItem,message,question);
  }
  async function openProjectImportanceEntry(input={}){
    const entry=COWORK_ENTRYPOINTS['project.why_it_matters'];
    const scopeInput=input.scope || {};
    const entityId=compactText(scopeInput.entityId || scopeInput.entity_id || input.projectId || '',220);
    if(!entityId) throw new Error('Project Managers needs the selected project before it can clarify why the work matters.');
    const project=await loadProject(entityId);
    if(!project) throw new Error('VAL could not load the selected project. It did not substitute another project.');
    const brief=buildProjectImportanceBrief(project,input);
    if(!brief.entityId) throw new Error('The selected project has no durable identifier yet.');
    const state={stage:'importance',draftProjectImportance:brief.currentImportance,answers:[]};
    const question=projectImportanceQuestion(state,brief);
    const now=new Date().toISOString(),sc=scope();
    const session=await saveSession({id:uuid('cowork'),tenantId:sc.tenantId,userId:sc.userId,entrypointId:entry.id,scopeType:entry.scopeType,scopeId:brief.entityId,scopeSectionId:entry.sectionId,status:'needs_input',workingBriefJson:brief,questionPlanJson:[question],stateJson:state,createdAt:now,updatedAt:now});
    const workItem=await saveWorkItem({id:uuid('workitem'),tenantId:sc.tenantId,userId:sc.userId,sessionId:session.id,workType:'project_importance',title:`Why ${brief.projectName} matters`,status:'needs_input',payloadJson:{projectId:brief.entityId,projectName:brief.projectName,projectImportance:state.draftProjectImportance,objective:brief.objective,completionCondition:brief.completionCondition},sourceRefsJson:brief.sourceRefs,createdAt:now,updatedAt:now});
    return publicResult(session,workItem,question.question,question);
  }
  async function respondProjectImportance(session,workItem,answer){
    const brief=session.workingBriefJson || {};
    const state={...(session.stateJson || {}),answers:safeArray(session.stateJson?.answers)};
    state.answers.push({text:answer,at:new Date().toISOString()});
    state.draftProjectImportance=parseProjectImportance(answer,brief,state.draftProjectImportance || brief.currentImportance || {});
    const importance=normalizeProjectImportance(state.draftProjectImportance,brief);
    const missing=missingProjectImportanceFields(importance,brief);
    let question,message='';
    if(!missing.length){
      state.stage='ready_to_apply';session.status='needs_review';workItem.status='needs_review';
      workItem.payloadJson={...workItem.payloadJson,projectId:brief.entityId,projectName:brief.projectName,projectImportance:importance,completionCondition:brief.completionCondition};
      question=projectImportanceQuestion(state,brief);message='VAL prepared the project\'s strategic judgment for review. Apply it when this is true.';
    }else{
      state.stage='importance_details';session.status='needs_input';workItem.status='needs_input';
      question=projectImportanceQuestion(state,brief);message=question.question;
    }
    session.stateJson=state;session.questionPlanJson=[...(session.questionPlanJson || []),question];session.updatedAt=new Date().toISOString();workItem.updatedAt=new Date().toISOString();
    await saveSession(session);await saveWorkItem(workItem);return publicResult(session,workItem,message,question);
  }
  async function openProjectNarrativeEntry(input={}){
    const entry=COWORK_ENTRYPOINTS['project.narrative'];
    const scopeInput=input.scope || {};
    const entityId=compactText(scopeInput.entityId || scopeInput.entity_id || input.projectId || '',220);
    if(!entityId) throw new Error('Project Managers needs the selected project before it can prepare a current-state narrative.');
    const project=await loadProject(entityId);
    if(!project) throw new Error('VAL could not load the selected project. It did not substitute another project.');
    const brief=buildProjectNarrativeBrief(project,input);
    if(!brief.entityId) throw new Error('The selected project has no durable identifier yet.');
    const state={stage:'narrative',draftProjectNarrative:brief.currentNarrative,answers:[]};
    const question=projectNarrativeQuestion(state,brief);
    const now=new Date().toISOString(),sc=scope();
    const session=await saveSession({id:uuid('cowork'),tenantId:sc.tenantId,userId:sc.userId,entrypointId:entry.id,scopeType:entry.scopeType,scopeId:brief.entityId,scopeSectionId:entry.sectionId,status:'needs_input',workingBriefJson:brief,questionPlanJson:[question],stateJson:state,createdAt:now,updatedAt:now});
    const workItem=await saveWorkItem({id:uuid('workitem'),tenantId:sc.tenantId,userId:sc.userId,sessionId:session.id,workType:'project_narrative',title:`Working narrative for ${brief.projectName}`,status:'needs_input',payloadJson:{projectId:brief.entityId,projectName:brief.projectName,projectNarrative:state.draftProjectNarrative,objective:brief.objective,completionCondition:brief.completionCondition},sourceRefsJson:brief.sourceRefs,createdAt:now,updatedAt:now});
    return publicResult(session,workItem,question.question,question);
  }
  async function respondProjectNarrative(session,workItem,answer){
    const brief=session.workingBriefJson || {};
    const state={...(session.stateJson || {}),answers:safeArray(session.stateJson?.answers)};
    state.answers.push({text:answer,at:new Date().toISOString()});
    state.draftProjectNarrative=parseProjectNarrative(answer,brief,state.draftProjectNarrative || brief.currentNarrative || {});
    const narrative=normalizeProjectNarrative(state.draftProjectNarrative,brief);
    const missing=missingProjectNarrativeFields(narrative,brief);
    let question,message='';
    if(!missing.length){
      state.stage='ready_to_apply';session.status='needs_review';workItem.status='needs_review';
      workItem.payloadJson={...workItem.payloadJson,projectId:brief.entityId,projectName:brief.projectName,projectNarrative:narrative,completionCondition:brief.completionCondition};
      question=projectNarrativeQuestion(state,brief);message='VAL prepared the project\'s current-state narrative for review. Apply it when this is true.';
    }else{
      state.stage='narrative_details';session.status='needs_input';workItem.status='needs_input';
      question=projectNarrativeQuestion(state,brief);message=question.question;
    }
    session.stateJson=state;session.questionPlanJson=[...(session.questionPlanJson || []),question];session.updatedAt=new Date().toISOString();workItem.updatedAt=new Date().toISOString();
    await saveSession(session);await saveWorkItem(workItem);return publicResult(session,workItem,message,question);
  }
  async function openProjectNeedsNextEntry(input={}){
    const entry=COWORK_ENTRYPOINTS['project.needs_next'];
    const scopeInput=input.scope || {};
    const entityId=compactText(scopeInput.entityId || scopeInput.entity_id || input.projectId || '',220);
    if(!entityId) throw new Error('Project Managers needs the selected project before it can name what VAL needs next.');
    const project=await loadProject(entityId);
    if(!project) throw new Error('VAL could not load the selected project. It did not substitute another project.');
    const brief=buildProjectNeedsNextBrief(project,input);
    if(!brief.entityId) throw new Error('The selected project has no durable identifier yet.');
    const state={stage:'needs_next',draftProjectNeedsNext:brief.currentNeed,answers:[]};
    const question=projectNeedsNextQuestion(state,brief);
    const now=new Date().toISOString(),sc=scope();
    const session=await saveSession({id:uuid('cowork'),tenantId:sc.tenantId,userId:sc.userId,entrypointId:entry.id,scopeType:entry.scopeType,scopeId:brief.entityId,scopeSectionId:entry.sectionId,status:'needs_input',workingBriefJson:brief,questionPlanJson:[question],stateJson:state,createdAt:now,updatedAt:now});
    const workItem=await saveWorkItem({id:uuid('workitem'),tenantId:sc.tenantId,userId:sc.userId,sessionId:session.id,workType:'project_needs_next',title:`What VAL needs next for ${brief.projectName}`,status:'needs_input',payloadJson:{projectId:brief.entityId,projectName:brief.projectName,projectNeedsNext:state.draftProjectNeedsNext,objective:brief.objective,completionCondition:brief.completionCondition},sourceRefsJson:brief.sourceRefs,createdAt:now,updatedAt:now});
    return publicResult(session,workItem,question.question,question);
  }
  async function respondProjectNeedsNext(session,workItem,answer){
    const brief=session.workingBriefJson || {};
    const state={...(session.stateJson || {}),answers:safeArray(session.stateJson?.answers)};
    state.answers.push({text:answer,at:new Date().toISOString()});
    state.draftProjectNeedsNext=parseProjectNeedsNext(answer,brief,state.draftProjectNeedsNext || brief.currentNeed || {});
    const need=normalizeProjectNeedsNext(state.draftProjectNeedsNext,brief);
    const missing=missingProjectNeedsNextFields(need,brief);
    let question,message='';
    if(!missing.length){
      state.stage='ready_to_apply';session.status='needs_review';workItem.status='needs_review';
      workItem.payloadJson={...workItem.payloadJson,projectId:brief.entityId,projectName:brief.projectName,projectNeedsNext:need,completionCondition:brief.completionCondition};
      question=projectNeedsNextQuestion(state,brief);message='VAL prepared the one precise thing it needs next for review. Apply it when this is true.';
    }else{
      state.stage='needs_next_details';session.status='needs_input';workItem.status='needs_input';
      question=projectNeedsNextQuestion(state,brief);message=question.question;
    }
    session.stateJson=state;session.questionPlanJson=[...(session.questionPlanJson || []),question];session.updatedAt=new Date().toISOString();workItem.updatedAt=new Date().toISOString();
    await saveSession(session);await saveWorkItem(workItem);return publicResult(session,workItem,message,question);
  }
  async function openProjectOperatingSystemEntry(input={}){
    const entry=COWORK_ENTRYPOINTS['project.sop'];
    const scopeInput=input.scope || {};
    const entityId=compactText(scopeInput.entityId || scopeInput.entity_id || input.projectId || '',220);
    if(!entityId) throw new Error('Project Managers needs the selected project before it can select an operating system.');
    const project=await loadProject(entityId);
    if(!project) throw new Error('VAL could not load the selected project. It did not substitute another project.');
    const brief=buildProjectOperatingSystemBrief(project,input);
    if(!brief.entityId) throw new Error('The selected project has no durable identifier yet.');
    const state={stage:'operating_system',draftProjectOperatingSystem:brief.currentOperatingSystem,answers:[]};
    const question=projectOperatingSystemQuestion(state,brief);
    const now=new Date().toISOString(),sc=scope();
    const session=await saveSession({id:uuid('cowork'),tenantId:sc.tenantId,userId:sc.userId,entrypointId:entry.id,scopeType:entry.scopeType,scopeId:brief.entityId,scopeSectionId:entry.sectionId,status:'needs_input',workingBriefJson:brief,questionPlanJson:[question],stateJson:state,createdAt:now,updatedAt:now});
    const workItem=await saveWorkItem({id:uuid('workitem'),tenantId:sc.tenantId,userId:sc.userId,sessionId:session.id,workType:'project_operating_system',title:`Operating system for ${brief.projectName}`,status:'needs_input',payloadJson:{projectId:brief.entityId,projectName:brief.projectName,projectOperatingSystem:state.draftProjectOperatingSystem,objective:brief.objective,completionCondition:brief.completionCondition},sourceRefsJson:brief.sourceRefs,createdAt:now,updatedAt:now});
    return publicResult(session,workItem,question.question,question);
  }
  async function respondProjectOperatingSystem(session,workItem,answer){
    const brief=session.workingBriefJson || {};
    const state={...(session.stateJson || {}),answers:safeArray(session.stateJson?.answers)};
    state.answers.push({text:answer,at:new Date().toISOString()});
    state.draftProjectOperatingSystem=parseProjectOperatingSystem(answer,brief,state.draftProjectOperatingSystem || brief.currentOperatingSystem || {});
    const operatingSystem=normalizeProjectOperatingSystem(state.draftProjectOperatingSystem,brief);
    const missing=missingProjectOperatingSystemFields(operatingSystem,brief);
    let question,message='';
    if(!missing.length){
      state.stage='ready_to_apply';session.status='needs_review';workItem.status='needs_review';
      workItem.payloadJson={...workItem.payloadJson,projectId:brief.entityId,projectName:brief.projectName,projectOperatingSystem:operatingSystem,completionCondition:brief.completionCondition};
      question=projectOperatingSystemQuestion(state,brief);message='VAL prepared the operating-system selection for review. Apply it when this is true.';
    }else{
      state.stage='operating_system_details';session.status='needs_input';workItem.status='needs_input';
      question=projectOperatingSystemQuestion(state,brief);message=question.question;
    }
    session.stateJson=state;session.questionPlanJson=[...(session.questionPlanJson || []),question];session.updatedAt=new Date().toISOString();workItem.updatedAt=new Date().toISOString();
    await saveSession(session);await saveWorkItem(workItem);return publicResult(session,workItem,message,question);
  }
  async function openProjectPhaseEntry(input={}){
    const entry=COWORK_ENTRYPOINTS['project.phase'];
    const scopeInput=input.scope || {};
    const entityId=compactText(scopeInput.entityId || scopeInput.entity_id || input.projectId || '',220);
    if(!entityId) throw new Error('Project Managers needs the selected project before it can record a current phase.');
    const project=await loadProject(entityId);
    if(!project) throw new Error('VAL could not load the selected project. It did not substitute another project.');
    const brief=buildProjectPhaseBrief(project,input);
    if(!brief.entityId) throw new Error('The selected project has no durable identifier yet.');
    if(!brief.sopId) throw new Error('Select and apply a Project Managers Operating System before recording Current Phase. VAL will not invent a phase sequence.');
    const state={stage:'phase',draftProjectPhase:brief.currentPhase,answers:[]};
    const question=projectPhaseQuestion(state,brief);
    const now=new Date().toISOString(),sc=scope();
    const session=await saveSession({id:uuid('cowork'),tenantId:sc.tenantId,userId:sc.userId,entrypointId:entry.id,scopeType:entry.scopeType,scopeId:brief.entityId,scopeSectionId:entry.sectionId,status:'needs_input',workingBriefJson:brief,questionPlanJson:[question],stateJson:state,createdAt:now,updatedAt:now});
    const workItem=await saveWorkItem({id:uuid('workitem'),tenantId:sc.tenantId,userId:sc.userId,sessionId:session.id,workType:'project_phase',title:`Current phase for ${brief.projectName}`,status:'needs_input',payloadJson:{projectId:brief.entityId,projectName:brief.projectName,projectPhase:state.draftProjectPhase,objective:brief.objective,completionCondition:brief.completionCondition},sourceRefsJson:brief.sourceRefs,createdAt:now,updatedAt:now});
    return publicResult(session,workItem,question.question,question);
  }
  async function respondProjectPhase(session,workItem,answer){
    const brief=session.workingBriefJson || {};
    const state={...(session.stateJson || {}),answers:safeArray(session.stateJson?.answers)};
    state.answers.push({text:answer,at:new Date().toISOString()});
    state.draftProjectPhase=parseProjectPhase(answer,brief,state.draftProjectPhase || brief.currentPhase || {});
    const phase=normalizeProjectPhase(state.draftProjectPhase,brief);
    const missing=missingProjectPhaseFields(phase,brief);
    let question,message='';
    if(!missing.length){
      state.stage='ready_to_apply';session.status='needs_review';workItem.status='needs_review';
      workItem.payloadJson={...workItem.payloadJson,projectId:brief.entityId,projectName:brief.projectName,projectPhase:phase,completionCondition:brief.completionCondition};
      question=projectPhaseQuestion(state,brief);message='VAL prepared the current-phase record for review. Apply it when this is true.';
    }else{
      state.stage='phase_details';session.status='needs_input';workItem.status='needs_input';
      question=projectPhaseQuestion(state,brief);message=question.question;
    }
    session.stateJson=state;session.questionPlanJson=[...(session.questionPlanJson || []),question];session.updatedAt=new Date().toISOString();workItem.updatedAt=new Date().toISOString();
    await saveSession(session);await saveWorkItem(workItem);return publicResult(session,workItem,message,question);
  }
  async function openProjectPreparedWorkEntry(input={}){
    const entry=COWORK_ENTRYPOINTS['project.prepared_work'];
    const scopeInput=input.scope || {};
    const entityId=compactText(scopeInput.entityId || scopeInput.entity_id || input.projectId || '',220);
    if(!entityId) throw new Error('Project Managers needs the selected project before it can prepare work.');
    const project=await loadProject(entityId);
    if(!project) throw new Error('VAL could not load the selected project. It did not substitute another project.');
    const brief=buildProjectPreparedWorkBrief(project,input);
    if(!brief.entityId) throw new Error('The selected project has no durable identifier yet.');
    const state={stage:'prepared_work',draftProjectPreparedWork:{},answers:[]};
    const question=projectPreparedWorkQuestion(state,brief);
    const now=new Date().toISOString(),sc=scope();
    const session=await saveSession({id:uuid('cowork'),tenantId:sc.tenantId,userId:sc.userId,entrypointId:entry.id,scopeType:entry.scopeType,scopeId:brief.entityId,scopeSectionId:entry.sectionId,status:'needs_input',workingBriefJson:brief,questionPlanJson:[question],stateJson:state,createdAt:now,updatedAt:now});
    const workItem=await saveWorkItem({id:uuid('workitem'),tenantId:sc.tenantId,userId:sc.userId,sessionId:session.id,workType:'project_prepared_work',title:`Prepared work for ${brief.projectName}`,status:'needs_input',payloadJson:{projectId:brief.entityId,projectName:brief.projectName,projectPreparedWork:state.draftProjectPreparedWork,objective:brief.objective,completionCondition:brief.completionCondition},sourceRefsJson:brief.sourceRefs,createdAt:now,updatedAt:now});
    return publicResult(session,workItem,question.question,question);
  }
  async function respondProjectPreparedWork(session,workItem,answer){
    const brief=session.workingBriefJson || {};
    const state={...(session.stateJson || {}),answers:safeArray(session.stateJson?.answers)};
    state.answers.push({text:answer,at:new Date().toISOString()});
    state.draftProjectPreparedWork=parseProjectPreparedWork(answer,brief,state.draftProjectPreparedWork || {});
    const preparedWork=normalizeProjectPreparedWork(state.draftProjectPreparedWork,brief);
    const missing=missingProjectPreparedWorkFields(preparedWork,brief);
    let question,message='';
    if(!missing.length){
      state.stage='ready_to_apply';session.status='needs_review';workItem.status='needs_review';
      workItem.payloadJson={...workItem.payloadJson,projectId:brief.entityId,projectName:brief.projectName,projectPreparedWork:preparedWork,completionCondition:brief.completionCondition};
      question=projectPreparedWorkQuestion(state,brief);message='VAL prepared the artifact proposal for review. Apply it when this is true.';
    }else{
      state.stage='prepared_work_details';session.status='needs_input';workItem.status='needs_input';
      question=projectPreparedWorkQuestion(state,brief);message=question.question;
    }
    session.stateJson=state;session.questionPlanJson=[...(session.questionPlanJson || []),question];session.updatedAt=new Date().toISOString();workItem.updatedAt=new Date().toISOString();
    await saveSession(session);await saveWorkItem(workItem);return publicResult(session,workItem,message,question);
  }
  async function openProjectRiskEntry(input={}){
    const entry=COWORK_ENTRYPOINTS['project.risk'];
    const scopeInput=input.scope || {};
    const entityId=compactText(scopeInput.entityId || scopeInput.entity_id || input.projectId || '',220);
    if(!entityId) throw new Error('Project Managers needs the selected project before it can assess a risk or blocker.');
    const project=await loadProject(entityId);
    if(!project) throw new Error('VAL could not load the selected project. It did not substitute another project.');
    const brief=buildProjectRiskBrief(project,input);
    if(!brief.entityId) throw new Error('The selected project has no durable identifier yet.');
    const state={stage:'risk',draftProjectRisk:brief.existingRisk,answers:[]};
    const question=projectRiskQuestion(state,brief);
    const now=new Date().toISOString(),sc=scope();
    const session=await saveSession({id:uuid('cowork'),tenantId:sc.tenantId,userId:sc.userId,entrypointId:entry.id,scopeType:entry.scopeType,scopeId:brief.entityId,scopeSectionId:entry.sectionId,status:'needs_input',workingBriefJson:brief,questionPlanJson:[question],stateJson:state,createdAt:now,updatedAt:now});
    const workItem=await saveWorkItem({id:uuid('workitem'),tenantId:sc.tenantId,userId:sc.userId,sessionId:session.id,workType:'project_risk',title:`Risk assessment for ${brief.projectName}`,status:'needs_input',payloadJson:{projectId:brief.entityId,projectName:brief.projectName,projectRisk:state.draftProjectRisk,objective:brief.objective,completionCondition:brief.completionCondition},sourceRefsJson:brief.sourceRefs,createdAt:now,updatedAt:now});
    return publicResult(session,workItem,question.question,question);
  }
  async function respondProjectRisk(session,workItem,answer){
    const brief=session.workingBriefJson || {};
    const state={...(session.stateJson || {}),answers:safeArray(session.stateJson?.answers)};
    state.answers.push({text:answer,at:new Date().toISOString()});
    state.draftProjectRisk=parseProjectRisk(answer,brief,state.draftProjectRisk || brief.existingRisk || {});
    const risk=normalizeProjectRisk(state.draftProjectRisk,brief);
    const missing=missingProjectRiskFields(risk,brief);
    let question,message='';
    if(!missing.length){
      state.stage='ready_to_apply';session.status='needs_review';workItem.status='needs_review';
      workItem.payloadJson={...workItem.payloadJson,projectId:brief.entityId,projectName:brief.projectName,projectRisk:risk,completionCondition:brief.completionCondition};
      question=projectRiskQuestion(state,brief);message=projectRiskHasMaterialAssessment(risk) ? 'VAL prepared one project risk assessment for review. Apply it when this is true.' : 'VAL prepared a no-material-risk assessment for review. Apply it when this is true.';
    }else{
      state.stage='risk_details';session.status='needs_input';workItem.status='needs_input';
      question=projectRiskQuestion(state,brief);message=question.question;
    }
    session.stateJson=state;session.questionPlanJson=[...(session.questionPlanJson || []),question];session.updatedAt=new Date().toISOString();workItem.updatedAt=new Date().toISOString();
    await saveSession(session);await saveWorkItem(workItem);return publicResult(session,workItem,message,question);
  }
  async function respondProjectIdentity(session,workItem,answer){
    const brief=session.workingBriefJson || {};
    const state={...(session.stateJson || {}),answers:safeArray(session.stateJson?.answers)};
    state.answers.push({text:answer,at:new Date().toISOString()});
    const current=state.draftIdentity || brief.currentIdentity || {};
    if(state.stage === 'identity' || state.stage === 'identity_details'){
      state.draftIdentity=projectIdentityFromAnswer(answer,current,state.stage);
      const missingIdentity=missingProjectIdentityFields(state.draftIdentity).filter((field)=>field !== 'project owner');
      state.stage=missingIdentity.length ? 'identity_details' : 'owner';
    }else if(state.stage === 'owner'){
      state.draftIdentity=projectIdentityFromAnswer(answer,current,'owner');
    }
    const missing=missingProjectIdentityFields(state.draftIdentity);
    let message='';
    let question;
    if(!missing.length){
      state.stage='ready_to_apply';
      session.status='needs_review';
      workItem.status='needs_review';
      workItem.payloadJson={
        ...workItem.payloadJson,
        projectId:brief.entityId,
        projectName:state.draftIdentity.canonicalName,
        identity:state.draftIdentity,
        completionCondition:brief.completionCondition
      };
      message='VAL prepared the selected project foundation for review. Apply it when it is true.';
      question=projectIdentityQuestion(state,brief);
    }else{
      question=projectIdentityQuestion(state,brief);
      message=question.question;
      session.status='needs_input';
      workItem.status='needs_input';
    }
    session.stateJson=state;
    session.questionPlanJson=[...(session.questionPlanJson || []),question];
    session.updatedAt=new Date().toISOString();
    workItem.updatedAt=new Date().toISOString();
    await saveSession(session);
    await saveWorkItem(workItem);
    return publicResult(session,workItem,message,question);
  }
  async function respondProjectNextMove(session,workItem,answer){
    const brief=session.workingBriefJson || {};
    const state={...(session.stateJson || {}),answers:safeArray(session.stateJson?.answers)};
    state.answers.push({text:answer,at:new Date().toISOString()});
    const current=state.draftNextMove || brief.currentProposal || {};
    if(state.stage === 'next_move'){
      const acceptsCurrent=answerAcceptsProposal(answer) && compactText(current.nextMove);
      state.draftNextMove=acceptsCurrent ? {...current} : nextMoveProposalFromAnswer(answer,current);
      if(answerAcceptsProposal(answer) && !compactText(current.nextMove)) state.draftNextMove.nextMove='';
      state.stage='next_move_details';
    }else if(state.stage === 'next_move_details'){
      state.draftNextMove=nextMoveProposalFromAnswer(answer,current);
    }
    const proposal=state.draftNextMove || {};
    const missing=missingNextMoveFields(proposal);
    let message='';
    let question;
    if(state.stage === 'next_move_details' && !missing.length){
      state.stage='ready_to_apply';
      session.status='needs_review';
      workItem.status='needs_review';
      workItem.payloadJson={
        ...workItem.payloadJson,
        projectId:brief.entityId,
        projectName:brief.projectName,
        nextMove:proposal.nextMove,
        accountableOwner:proposal.accountableOwner,
        timingOrTrigger:proposal.timingOrTrigger,
        basis:proposal.basis,
        completionCondition:brief.completionCondition
      };
      message='VAL prepared the next narrow move for review. Apply it when this is true.';
      question=nextMoveQuestion({stage:'ready_to_apply',draftNextMove:proposal},brief);
    }else{
      question=nextMoveQuestion(state,brief);
      message=question.question;
      session.status='needs_input';
      workItem.status='needs_input';
    }
    session.workingBriefJson=brief;
    session.stateJson=state;
    session.questionPlanJson=[...(session.questionPlanJson || []),question];
    session.updatedAt=new Date().toISOString();
    workItem.updatedAt=new Date().toISOString();
    await saveSession(session);
    await saveWorkItem(workItem);
    return publicResult(session,workItem,message,question);
  }
  async function openTranscriptWorkingBriefEntry(input={}){
    const entry=COWORK_ENTRYPOINTS['transcript.working_brief'];
    const scopeInput=input.scope || {};
    const entityId=compactText(scopeInput.entityId || scopeInput.entity_id || input.transcriptId || '',220);
    if(!entityId) throw new Error('Transcripts needs the selected transcript before VAL can prepare its Working Brief.');
    const transcript=await loadTranscript(entityId);
    if(!transcript) throw new Error('VAL could not load the selected transcript. It did not substitute another meeting.');
    const brief=buildTranscriptWorkingBrief(transcript,input);
    if(!brief.entityId) throw new Error('The selected transcript has no durable identifier yet.');
    if(!brief.sourceReceipt.ready) throw new Error('This transcript has no exact Krisp Action Items and Key Points receipt yet. VAL will not invent one.');
    const state={stage:'conversation',answers:[]};
    const question=transcriptWorkingBriefQuestion(state,brief);
    const now=new Date().toISOString();
    const sc=scope();
    const session=await saveSession({
      id:uuid('cowork'),tenantId:sc.tenantId,userId:sc.userId,entrypointId:entry.id,scopeType:entry.scopeType,scopeId:brief.entityId,scopeSectionId:entry.sectionId,status:'needs_input',workingBriefJson:brief,questionPlanJson:[question],stateJson:state,createdAt:now,updatedAt:now
    });
    const workItem=await saveWorkItem({
      id:uuid('workitem'),tenantId:sc.tenantId,userId:sc.userId,sessionId:session.id,workType:'transcript_conversation',title:`Conversation about ${brief.transcriptTitle}`,status:'needs_input',
      payloadJson:{transcriptId:brief.entityId,transcriptTitle:brief.transcriptTitle,sourceReceipt:brief.sourceReceipt,invitees:brief.invitees,objective:brief.objective,completionCondition:brief.completionCondition},sourceRefsJson:brief.sourceRefs,createdAt:now,updatedAt:now
    });
    return publicResult(session,workItem,question.question,question);
  }
  async function respondTranscriptWorkingBrief(session,workItem,answer){
    const brief=session.workingBriefJson || {};
    const question=transcriptWorkingBriefQuestion({stage:'ready_to_apply'},brief);
    return publicResult(session,workItem,'The exact Krisp meeting overview is already ready for review. Apply it when this is true.',question);
  }
  async function openTranscriptActionItemEntry(input={}){
    const entry=COWORK_ENTRYPOINTS['transcript.action_item'];
    const scopeInput=input.scope || {};
    const entityId=compactText(scopeInput.entityId || scopeInput.entity_id || input.transcriptId || '',220);
    if(!entityId) throw new Error('Transcripts needs the selected transcript before VAL can review an Action Item.');
    const transcript=await loadTranscript(entityId);
    if(!transcript) throw new Error('VAL could not load the selected transcript. It did not substitute another meeting.');
    const brief=buildTranscriptActionItemBrief(transcript,input);
    const question=transcriptActionItemQuestion(brief);
    const now=new Date().toISOString();
    const sc=scope();
    const session=await saveSession({
      id:uuid('cowork'),tenantId:sc.tenantId,userId:sc.userId,entrypointId:entry.id,scopeType:entry.scopeType,scopeId:brief.entityId,scopeSectionId:entry.sectionId,status:'needs_review',workingBriefJson:brief,questionPlanJson:[question],stateJson:{stage:'ready_to_apply'},createdAt:now,updatedAt:now
    });
    const workItem=await saveWorkItem({
      id:uuid('workitem'),tenantId:sc.tenantId,userId:sc.userId,sessionId:session.id,workType:'transcript_action_item',title:`Commitment from ${brief.transcriptTitle}`,status:'needs_review',
      payloadJson:{transcriptId:brief.entityId,transcriptTitle:brief.transcriptTitle,actionItemIndex:brief.actionItemIndex,actionItem:brief.actionItem,objective:brief.objective,completionCondition:brief.completionCondition},sourceRefsJson:brief.sourceRefs,createdAt:now,updatedAt:now
    });
    return publicResult(session,workItem,question.question,question);
  }
  async function respondTranscriptActionItem(session,workItem,answer){
    const question=transcriptActionItemQuestion(session.workingBriefJson || {});
    return publicResult(session,workItem,'This exact Action Item is already ready for review. VAL will not add or rewrite wording before it becomes an internal Commitment.',question);
  }
  async function openEmailThreadEntry(input={}){
    const entry=COWORK_ENTRYPOINTS['email.thread'];
    const scopeInput=input.scope || {};
    const messageId=compactText(scopeInput.messageId || scopeInput.message_id || scopeInput.entityId || input.messageId || '',220);
    const threadId=compactText(scopeInput.threadId || scopeInput.thread_id || input.threadId || '',220);
    const conversationId=compactText(scopeInput.conversationId || scopeInput.conversation_id || input.conversationId || '',220);
    if(!messageId && !threadId && !conversationId) throw new Error('Executive Inbox needs the selected email thread before VAL can prepare a reply.');
    const thread=await loadEmailThread({messageId,threadId,conversationId,provider:compactText(scopeInput.provider || input.provider || '',80)});
    if(!thread) throw new Error('VAL could not load the selected email thread. It did not substitute another conversation.');
    const brief=buildEmailThreadBrief(thread,input);
    if(!brief.entityId || !brief.messages.length) throw new Error('The selected email thread has no durable readable message receipt. VAL will not draft from a summary alone.');
    const existingDraft=brief.existingDraft;
    const state={stage:existingDraft ? 'ready_to_review' : 'reply_outcome',draftEmailArtifact:existingDraft,answers:[]};
    const question=emailThreadQuestion(state,brief);
    const now=new Date().toISOString();
    const sc=scope();
    const session=await saveSession({
      id:uuid('cowork'),tenantId:sc.tenantId,userId:sc.userId,entrypointId:entry.id,scopeType:entry.scopeType,scopeId:brief.entityId,scopeSectionId:entry.sectionId,status:existingDraft ? 'needs_review' : 'needs_input',workingBriefJson:brief,questionPlanJson:[question],stateJson:state,createdAt:now,updatedAt:now
    });
    const workItem=await saveWorkItem({
      id:uuid('workitem'),tenantId:sc.tenantId,userId:sc.userId,sessionId:session.id,workType:'email_thread_draft',title:`Reply for ${brief.subject}`,status:existingDraft ? 'needs_review' : 'needs_input',
      payloadJson:{messageId:brief.messageId,threadId:brief.threadId,conversationId:brief.conversationId,provider:brief.provider,subject:brief.subject,preparedArtifact:existingDraft,objective:brief.objective,completionCondition:brief.completionCondition},sourceRefsJson:brief.sourceRefs,createdAt:now,updatedAt:now
    });
    return publicResult(session,workItem,question.question,question);
  }
  async function respondEmailThread(session,workItem,answer){
    const brief=session.workingBriefJson || {};
    const state={...(session.stateJson || {}),answers:safeArray(session.stateJson?.answers)};
    state.answers.push({text:answer,at:new Date().toISOString()});
    const prepared=await prepareEmailThreadDraft({
      messageId:brief.messageId || session.scopeId,
      threadId:brief.threadId,
      conversationId:brief.conversationId,
      provider:brief.provider,
      replyIntent:answer,
      sessionId:session.id,
      workItemId:workItem.id
    });
    const artifact=emailThreadDraft(prepared?.draft || prepared?.preparedArtifact || {});
    if(!artifact) throw new Error('VAL could not prepare a private draft from this selected thread. Nothing was sent or changed externally.');
    state.stage='ready_to_review';
    state.draftEmailArtifact=artifact;
    session.status='needs_review';
    session.stateJson=state;
    session.questionPlanJson=[...(session.questionPlanJson || []),emailThreadQuestion(state,brief)];
    session.updatedAt=new Date().toISOString();
    workItem.status='needs_review';
    workItem.payloadJson={
      ...(workItem.payloadJson || {}),
      messageId:brief.messageId || session.scopeId,
      threadId:brief.threadId,
      conversationId:brief.conversationId,
      provider:brief.provider,
      subject:artifact.subject || brief.subject,
      replyIntent:answer,
      preparedArtifact:artifact,
      objective:brief.objective,
      completionCondition:brief.completionCondition
    };
    workItem.updatedAt=new Date().toISOString();
    await saveSession(session);
    await saveWorkItem(workItem);
    const question=emailThreadQuestion(state,brief);
    return publicResult(session,workItem,'VAL prepared one private email draft from this selected thread. Review it in Leverage before any external approval.',question);
  }
  async function openRelationshipOverviewEntry(input={}){
    const entry=COWORK_ENTRYPOINTS['relationship.overview'];
    const scopeInput=input.scope || {};
    const entityId=compactText(scopeInput.entityId || scopeInput.entity_id || input.relationshipId || '',220);
    if(!entityId) throw new Error('Relationships needs the selected relationship before VAL can prepare its next stewardship move.');
    const relationship=await loadRelationship(entityId);
    if(!relationship) throw new Error('VAL could not load the selected relationship. It did not substitute another person or relationship.');
    const brief=buildRelationshipOverviewBrief(relationship,input);
    if(!brief.entityId) throw new Error('The selected relationship has no durable identifier yet.');
    if(!brief.sourceRefs.length) throw new Error('This relationship has no readable source receipt yet. VAL will not invent relationship context.');
    const state={stage:'next_move',draftRelationshipOverview:null,answers:[]};
    const question=relationshipOverviewQuestion(state,brief);
    const now=new Date().toISOString();
    const sc=scope();
    const session=await saveSession({
      id:uuid('cowork'),tenantId:sc.tenantId,userId:sc.userId,entrypointId:entry.id,scopeType:entry.scopeType,scopeId:brief.entityId,scopeSectionId:entry.sectionId,status:'needs_input',workingBriefJson:brief,questionPlanJson:[question],stateJson:state,createdAt:now,updatedAt:now
    });
    const workItem=await saveWorkItem({
      id:uuid('workitem'),tenantId:sc.tenantId,userId:sc.userId,sessionId:session.id,workType:'relationship_overview_focus',title:`Next relationship move for ${brief.relationshipName}`,status:'needs_input',
      payloadJson:{relationshipId:brief.entityId,relationshipName:brief.relationshipName,relationshipOverview:null,objective:brief.objective,completionCondition:brief.completionCondition},sourceRefsJson:brief.sourceRefs,createdAt:now,updatedAt:now
    });
    return publicResult(session,workItem,question.question,question);
  }
  async function respondRelationshipOverview(session,workItem,answer){
    const brief=session.workingBriefJson || {};
    const state={...(session.stateJson || {}),answers:safeArray(session.stateJson?.answers)};
    const relationshipOverview=relationshipOverviewFocusFromAnswer(answer,brief);
    if(!relationshipOverview.nextMove) throw new Error('VAL needs the next relationship outcome before it can prepare this internal stewardship move.');
    state.answers.push({text:answer,at:new Date().toISOString()});
    state.stage='ready_to_apply';
    state.draftRelationshipOverview=relationshipOverview;
    session.status='needs_review';
    session.stateJson=state;
    session.questionPlanJson=[...(session.questionPlanJson || []),relationshipOverviewQuestion(state,brief)];
    session.updatedAt=new Date().toISOString();
    workItem.status='needs_review';
    workItem.payloadJson={
      ...(workItem.payloadJson || {}),
      relationshipId:brief.entityId || session.scopeId,
      relationshipName:brief.relationshipName || '',
      relationshipOverview,
      objective:brief.objective,
      completionCondition:brief.completionCondition
    };
    workItem.updatedAt=new Date().toISOString();
    await saveSession(session);
    await saveWorkItem(workItem);
    const question=relationshipOverviewQuestion(state,brief);
    return publicResult(session,workItem,`VAL prepared one internal next relationship move for ${brief.relationshipName || 'this relationship'} to review.`,question);
  }
  async function openRelationshipSectionEntry(input={}){
    const entry=COWORK_ENTRYPOINTS['relationship.section'];
    const scopeInput=input.scope || {};
    const entityId=compactText(scopeInput.entityId || scopeInput.entity_id || input.relationshipId || '',220);
    const sectionId=compactText(scopeInput.sectionId || scopeInput.section_id || input.sectionId || '',80).toLowerCase();
    const contract=relationshipSectionContract(sectionId);
    if(!entityId) throw new Error('Relationships needs the selected person before VAL can open this card.');
    if(!contract) throw new Error('This relationship card does not have a registered Co-Work contract.');
    const relationship=await loadRelationship(entityId);
    if(!relationship) throw new Error('VAL could not load the selected relationship. It did not substitute another person or relationship.');
    const brief=buildRelationshipSectionBrief(relationship,{...input,scope:{...scopeInput,entityId,sectionId}});
    if(!brief.entityId) throw new Error('The selected relationship has no durable identifier yet.');
    const state={stage:'section_update',draftRelationshipSectionUpdate:null,answers:[]};
    const question=relationshipSectionQuestion(state,brief);
    const now=new Date().toISOString();
    const sc=scope();
    const session=await saveSession({
      id:uuid('cowork'),tenantId:sc.tenantId,userId:sc.userId,entrypointId:entry.id,scopeType:entry.scopeType,scopeId:brief.entityId,scopeSectionId:sectionId,status:'needs_input',workingBriefJson:brief,questionPlanJson:[question],stateJson:state,createdAt:now,updatedAt:now
    });
    const workItem=await saveWorkItem({
      id:uuid('workitem'),tenantId:sc.tenantId,userId:sc.userId,sessionId:session.id,workType:'relationship_section_update',title:`${brief.sectionLabel} for ${brief.relationshipName}`,status:'needs_input',
      payloadJson:{relationshipId:brief.entityId,relationshipName:brief.relationshipName,sectionId,sectionLabel:brief.sectionLabel,relationshipSectionUpdate:null,objective:brief.objective,completionCondition:brief.completionCondition},sourceRefsJson:brief.sourceRefs,createdAt:now,updatedAt:now
    });
    return publicResult(session,workItem,question.question,question);
  }
  async function respondRelationshipSection(session,workItem,answer){
    const brief=session.workingBriefJson || {};
    const state={...(session.stateJson || {}),answers:safeArray(session.stateJson?.answers)};
    const relationshipSectionUpdate=relationshipSectionUpdateFromAnswer(answer,brief);
    if(!relationshipSectionUpdate) throw new Error(`VAL needs clear ${brief.sectionLabel || 'relationship'} context before it can prepare this update.`);
    state.answers.push({text:answer,at:new Date().toISOString()});
    state.stage='ready_to_apply';
    state.draftRelationshipSectionUpdate=relationshipSectionUpdate;
    session.status='needs_review';
    session.stateJson=state;
    session.questionPlanJson=[...(session.questionPlanJson || []),relationshipSectionQuestion(state,brief)];
    session.updatedAt=new Date().toISOString();
    workItem.status='needs_review';
    workItem.payloadJson={
      ...(workItem.payloadJson || {}),
      relationshipId:brief.entityId || session.scopeId,
      relationshipName:brief.relationshipName || '',
      sectionId:brief.sectionId || '',
      sectionLabel:brief.sectionLabel || '',
      relationshipSectionUpdate,
      objective:brief.objective,
      completionCondition:brief.completionCondition
    };
    workItem.updatedAt=new Date().toISOString();
    await saveSession(session);
    await saveWorkItem(workItem);
    const question=relationshipSectionQuestion(state,brief);
    return publicResult(session,workItem,`VAL prepared the ${brief.sectionLabel || 'selected'} update for ${brief.relationshipName || 'this relationship'} to review.`,question);
  }
  async function openEntry(input={}){
    const entrypointId=String(input.entrypointId || input.entrypoint_id || '').trim();
    const entry=COWORK_ENTRYPOINTS[entrypointId];
    if(!entry) throw new Error('This Co-Work entry point is not registered.');
    if(entrypointId === 'observer.discussion' || entrypointId === 'board.chief_of_staff') return openObserverConversation(entrypointId,input);
    if(entrypointId === 'project.overview') return openProjectOverviewEntry(input);
    if(entrypointId === 'project.identity') return openProjectIdentityEntry(input);
    if(entrypointId === 'project.onboarding') return openProjectOnboardingEntry(input);
    if(entrypointId === 'project.people') return openProjectPeopleEntry(input);
    if(entrypointId === 'project.documents') return openProjectDocumentsEntry(input);
    if(entrypointId === 'project.milestones') return openProjectMilestonesEntry(input);
    if(entrypointId === 'project.monitoring') return openProjectMonitoringEntry(input);
    if(entrypointId === 'project.relationship_nurture') return openProjectRelationshipNurtureEntry(input);
    if(entrypointId === 'project.why_it_matters') return openProjectImportanceEntry(input);
    if(entrypointId === 'project.risk') return openProjectRiskEntry(input);
    if(entrypointId === 'project.narrative') return openProjectNarrativeEntry(input);
    if(entrypointId === 'project.needs_next') return openProjectNeedsNextEntry(input);
    if(entrypointId === 'project.sop') return openProjectOperatingSystemEntry(input);
    if(entrypointId === 'project.phase') return openProjectPhaseEntry(input);
    if(entrypointId === 'project.prepared_work') return openProjectPreparedWorkEntry(input);
    if(entrypointId === 'project.next_move') return openProjectNextMoveEntry(input);
    if(entrypointId === 'transcript.working_brief') return openTranscriptWorkingBriefEntry(input);
    if(entrypointId === 'transcript.action_item') return openTranscriptActionItemEntry(input);
    if(entrypointId === 'email.thread') return openEmailThreadEntry(input);
    if(entrypointId === 'relationship.overview') return openRelationshipOverviewEntry(input);
    if(entrypointId === 'relationship.section') return openRelationshipSectionEntry(input);
    const scopeInput=input.scope || {};
    const entityId=compactText(scopeInput.entityId || scopeInput.entity_id || input.projectId || '',220);
    if(!entityId) throw new Error('Project Managers needs the selected project before it can build workstreams.');
    const project=await loadProject(entityId);
    if(!project) throw new Error('VAL could not load the selected project. It did not substitute another project.');
    const brief=buildProjectWorkstreamsBrief(project,input);
    if(!brief.entityId) throw new Error('The selected project has no durable identifier yet.');
    const initialWorkstreams=safeArray(brief.existingWorkstreams).map((item)=>normalizeWorkstream(item,brief));
    const proposed=uniqueNames(brief.suggestedWorkstreams || initialWorkstreams);
    const stage=brief.desiredOutcome ? 'confirm_lanes' : 'project_outcome';
    const state={stage,draftWorkstreams:initialWorkstreams,proposedWorkstreams:proposed,answers:[]};
    const question=entryQuestion(state,brief);
    const now=new Date().toISOString();
    const sc=scope();
    const session=await saveSession({
      id:uuid('cowork'),
      tenantId:sc.tenantId,
      userId:sc.userId,
      entrypointId,
      scopeType:entry.scopeType,
      scopeId:brief.entityId,
      scopeSectionId:entry.sectionId,
      status:'needs_input',
      workingBriefJson:brief,
      questionPlanJson:[question],
      stateJson:state,
      createdAt:now,
      updatedAt:now
    });
    const workItem=await saveWorkItem({
      id:uuid('workitem'),
      tenantId:sc.tenantId,
      userId:sc.userId,
      sessionId:session.id,
      workType:'project_workstreams',
      title:`Workstreams for ${brief.projectName}`,
      status:'needs_input',
      payloadJson:{projectId:brief.entityId,projectName:brief.projectName,workstreams:initialWorkstreams,objective:brief.objective,completionCondition:brief.completionCondition},
      sourceRefsJson:brief.sourceRefs,
      createdAt:now,
      updatedAt:now
    });
    return publicResult(session,workItem,question.question,question);
  }
  async function respond(sessionId,input={}){
    const answer=multilineText(input.answer || input.message || '',5000);
    if(!answer) throw new Error('VAL needs an answer before it can continue this scoped conversation.');
    const session=await getSession(sessionId);
    if(!session) throw new Error('This Co-Work session no longer exists.');
    if(session.entrypointId === 'observer.discussion' || session.entrypointId === 'board.chief_of_staff') return respondObserverConversation(session,answer);
    const workItem=await findSessionWorkItem(session.id);
    if(!workItem) throw new Error('The prepared work item is missing. Nothing was applied.');
    // A Transcript Working Brief is an active source-scoped conversation, not a
    // one-shot form. Every turn must retain the exact selected transcript.
    if(session.entrypointId === 'transcript.working_brief') return respondScopedConversation(session,workItem,answer);
    if(coworkTurnLooksConversational(answer)) return respondScopedConversation(session,workItem,answer);
    if(session.entrypointId === 'project.overview') return respondProjectOverview(session,workItem,answer);
    if(session.entrypointId === 'project.identity') return respondProjectIdentity(session,workItem,answer);
    if(session.entrypointId === 'project.onboarding') return respondProjectOnboarding(session,workItem,answer);
    if(session.entrypointId === 'project.people') return respondProjectPeople(session,workItem,answer);
    if(session.entrypointId === 'project.documents') return respondProjectDocuments(session,workItem,answer);
    if(session.entrypointId === 'project.milestones') return respondProjectMilestones(session,workItem,answer);
    if(session.entrypointId === 'project.monitoring') return respondProjectMonitoring(session,workItem,answer);
    if(session.entrypointId === 'project.relationship_nurture') return respondProjectRelationshipNurture(session,workItem,answer);
    if(session.entrypointId === 'project.why_it_matters') return respondProjectImportance(session,workItem,answer);
    if(session.entrypointId === 'project.risk') return respondProjectRisk(session,workItem,answer);
    if(session.entrypointId === 'project.narrative') return respondProjectNarrative(session,workItem,answer);
    if(session.entrypointId === 'project.needs_next') return respondProjectNeedsNext(session,workItem,answer);
    if(session.entrypointId === 'project.sop') return respondProjectOperatingSystem(session,workItem,answer);
    if(session.entrypointId === 'project.phase') return respondProjectPhase(session,workItem,answer);
    if(session.entrypointId === 'project.prepared_work') return respondProjectPreparedWork(session,workItem,answer);
    if(session.entrypointId === 'project.next_move') return respondProjectNextMove(session,workItem,answer);
    if(session.entrypointId === 'transcript.action_item') return respondTranscriptActionItem(session,workItem,answer);
    if(session.entrypointId === 'email.thread') return respondEmailThread(session,workItem,answer);
    if(session.entrypointId === 'relationship.overview') return respondRelationshipOverview(session,workItem,answer);
    if(session.entrypointId === 'relationship.section') return respondRelationshipSection(session,workItem,answer);
    if(session.entrypointId !== 'project.workstreams') throw new Error('This session does not use a registered Project Managers interview.');
    const brief=session.workingBriefJson || {};
    const state={...(session.stateJson || {}),answers:safeArray(session.stateJson?.answers)};
    state.answers.push({text:answer,at:new Date().toISOString()});
    if(state.stage === 'project_outcome'){
      brief.desiredOutcome=answer;
      state.stage='confirm_lanes';
      if(!safeArray(state.proposedWorkstreams).length) state.proposedWorkstreams=uniqueNames(brief.existingWorkstreams || []);
    }else if(state.stage === 'confirm_lanes'){
      const names=answerAcceptsProposal(answer) ? uniqueNames(state.proposedWorkstreams || []) : parseWorkstreamNames(answer);
      if(!names.length){
        const question={
          targetField:'project_workstreams[].name',
          question:'I need the names of the major workstreams before I can build them. List the lanes separated by lines, commas, or semicolons.',
          detail:'Each answer will become a named workstream in Project Managers.'
        };
        session.questionPlanJson=[...(session.questionPlanJson || []),question];
        session.stateJson=state;
        session.updatedAt=new Date().toISOString();
        await saveSession(session);
        return publicResult(session,workItem,question.question,question);
      }
      state.draftWorkstreams=names.map((name)=>{
        const existing=safeArray(state.draftWorkstreams).find((item)=>String(item.name || '').toLowerCase()===name.toLowerCase());
        return normalizeWorkstream(existing || workstreamTemplate(name,brief),brief);
      });
      state.stage='workstream_details';
    }else if(state.stage === 'workstream_details'){
      state.draftWorkstreams=parseLabeledWorkstreamDetails(answer,state.draftWorkstreams).map((item)=>normalizeWorkstream(item,brief));
    }
    const incomplete=safeArray(state.draftWorkstreams).filter((item)=>missingWorkstreamFields(item).length);
    let message='';
    let question;
    if(state.stage === 'workstream_details' && !incomplete.length){
      state.stage='ready_to_apply';
      session.status='needs_review';
      workItem.status='needs_review';
      workItem.payloadJson={
        ...workItem.payloadJson,
        projectId:brief.entityId,
        projectName:brief.projectName,
        desiredOutcome:brief.desiredOutcome,
        workstreams:state.draftWorkstreams,
        completionCondition:brief.completionCondition
      };
      message=`VAL prepared ${state.draftWorkstreams.length} workstream${state.draftWorkstreams.length === 1 ? '' : 's'} for review. Apply them when this is true.`;
      question={targetField:'project_workstreams',question:'Review the prepared workstreams, then apply them to this Project Manager.',detail:'Applying changes only the internal Project Managers packet.'};
    }else{
      question=entryQuestion(state,brief);
      message=question.question;
      session.status='needs_input';
      workItem.status='needs_input';
    }
    session.workingBriefJson=brief;
    session.stateJson=state;
    session.questionPlanJson=[...(session.questionPlanJson || []),question];
    session.updatedAt=new Date().toISOString();
    workItem.updatedAt=new Date().toISOString();
    await saveSession(session);
    await saveWorkItem(workItem);
    return publicResult(session,workItem,message,question);
  }
  async function applyWorkItem(workItemId){
    const workItem=await getWorkItem(workItemId);
    if(!workItem) throw new Error('Prepared work item not found.');
    if(workItem.workType === 'relationship_section_update'){
      if(workItem.status !== 'needs_review') throw new Error('The relationship card update must be reviewed before it can be applied.');
      const session=await getSession(workItem.sessionId);
      if(!session) throw new Error('The Co-Work session for this relationship card is missing.');
      const payload=workItem.payloadJson || {};
      const relationshipSectionUpdate=payload.relationshipSectionUpdate || {};
      const contract=relationshipSectionContract(relationshipSectionUpdate.sectionId || payload.sectionId);
      if(!contract || !safeArray(relationshipSectionUpdate.values).length) throw new Error('The relationship card update is incomplete and cannot be applied yet.');
      const relationship=await applyRelationshipSection({
        relationshipId:payload.relationshipId || session.scopeId,
        relationshipName:payload.relationshipName || session.workingBriefJson?.relationshipName || 'Relationship',
        relationshipSectionUpdate,
        sourceRefs:workItem.sourceRefsJson || [],
        sessionId:session.id,
        workItemId:workItem.id
      });
      if(!relationship) throw new Error('VAL could not save the selected card to the relationship packet.');
      const now=new Date().toISOString();
      workItem.status='applied';
      workItem.updatedAt=now;
      session.status='completed';
      session.updatedAt=now;
      session.stateJson={...(session.stateJson || {}),stage:'completed',appliedAt:now};
      const sc=scope();
      const receipt=await saveReceipt({
        id:uuid('coworkreceipt'),tenantId:sc.tenantId,userId:sc.userId,sessionId:session.id,workItemId:workItem.id,action:'apply_relationship_section_update',status:'completed',
        summary:`Applied the ${contract.label} update to ${payload.relationshipName || 'the selected relationship'}.`,
        payloadJson:{relationshipId:payload.relationshipId || session.scopeId,relationshipName:payload.relationshipName || '',sectionId:relationshipSectionUpdate.sectionId,relationshipSectionUpdate,noExternalAction:true},createdAt:now
      });
      await saveSession(session);
      await saveWorkItem(workItem);
      return {...publicResult(session,workItem,receipt.summary,null,receipt),relationship};
    }
    if(workItem.workType === 'relationship_overview_focus'){
      if(workItem.status !== 'needs_review') throw new Error('The relationship next move must be reviewed before it can be applied.');
      const session=await getSession(workItem.sessionId);
      if(!session) throw new Error('The Co-Work session for this relationship move is missing.');
      const payload=workItem.payloadJson || {};
      const relationshipOverview=payload.relationshipOverview || {};
      if(!compactText(relationshipOverview.nextMove,1200)) throw new Error('The relationship next move is incomplete and cannot be applied yet.');
      const relationship=await applyRelationshipOverview({
        relationshipId:payload.relationshipId || session.scopeId,
        relationshipName:payload.relationshipName || session.workingBriefJson?.relationshipName || 'Relationship',
        relationshipOverview,
        sourceRefs:workItem.sourceRefsJson || [],
        sessionId:session.id,
        workItemId:workItem.id
      });
      if(!relationship) throw new Error('VAL could not save the next move to the selected relationship packet.');
      const now=new Date().toISOString();
      workItem.status='applied';
      workItem.updatedAt=now;
      session.status='completed';
      session.updatedAt=now;
      session.stateJson={...(session.stateJson || {}),stage:'completed',appliedAt:now};
      const sc=scope();
      const receipt=await saveReceipt({
        id:uuid('coworkreceipt'),tenantId:sc.tenantId,userId:sc.userId,sessionId:session.id,workItemId:workItem.id,action:'apply_relationship_overview_focus',status:'completed',
        summary:`Applied the next relationship move to ${payload.relationshipName || 'the selected relationship'}.`,
        payloadJson:{relationshipId:payload.relationshipId || session.scopeId,relationshipName:payload.relationshipName || '',relationshipOverview,noExternalAction:true},createdAt:now
      });
      await saveSession(session);
      await saveWorkItem(workItem);
      return {...publicResult(session,workItem,receipt.summary,null,receipt),relationship};
    }
    if(workItem.workType === 'transcript_meeting_overview'){
      if(workItem.status !== 'needs_review') throw new Error('The meeting overview must be reviewed before it can be applied.');
      const session=await getSession(workItem.sessionId);
      if(!session) throw new Error('The Co-Work session for this prepared item is missing.');
      const payload=workItem.payloadJson || {};
      const expectedBody=multilineText(payload.preparedArtifact?.body || payload.sourceReceipt?.body || '',50000);
      if(!expectedBody) throw new Error('The exact Krisp meeting overview is missing and cannot be prepared.');
      const prepared=await prepareTranscriptMeetingOverview({transcriptId:payload.transcriptId || session.scopeId});
      const actualBody=multilineText(prepared?.draft?.body || '',50000);
      if(actualBody !== expectedBody) throw new Error('VAL stopped the draft because it would not preserve the exact Krisp receipt.');
      const now=new Date().toISOString();
      workItem.status='applied';
      workItem.updatedAt=now;
      session.status='completed';
      session.updatedAt=now;
      session.stateJson={...(session.stateJson || {}),stage:'completed',appliedAt:now,draftId:prepared.draft?.id || ''};
      const sc=scope();
      const receipt=await saveReceipt({
        id:uuid('coworkreceipt'),tenantId:sc.tenantId,userId:sc.userId,sessionId:session.id,workItemId:workItem.id,action:'prepare_transcript_meeting_overview',status:'completed',
        summary:`Prepared the exact meeting overview for ${payload.transcriptTitle || 'the selected transcript'} in Leverage. Nothing was sent.`,
        payloadJson:{transcriptId:payload.transcriptId || session.scopeId,draftId:prepared.draft?.id || '',recipientCount:Number(prepared.recipientCount || 0),sourceReceipt:payload.sourceReceipt || {},noExternalAction:true},createdAt:now
      });
      await saveSession(session);
      await saveWorkItem(workItem);
      return {...publicResult(session,workItem,receipt.summary,null,receipt),draft:prepared.draft || null,recipientCount:Number(prepared.recipientCount || 0)};
    }
    if(workItem.workType === 'transcript_action_item'){
      if(workItem.status !== 'needs_review') throw new Error('The Action Item must be reviewed before it can become a Commitment.');
      const session=await getSession(workItem.sessionId);
      if(!session) throw new Error('The Co-Work session for this Action Item is missing.');
      const payload=workItem.payloadJson || {};
      const task=await createTranscriptActionItem({
        transcriptId:payload.transcriptId || session.scopeId,
        actionItemIndex:Number(payload.actionItemIndex),
        actionItem:multilineText(payload.actionItem || '',5000),
        sourceRefs:workItem.sourceRefsJson || [],
        sessionId:session.id,
        workItemId:workItem.id
      });
      if(!task?.task) throw new Error('VAL could not create this internal Commitment from the selected Action Item.');
      const now=new Date().toISOString();
      workItem.status='applied';workItem.updatedAt=now;session.status='completed';session.updatedAt=now;session.stateJson={...(session.stateJson || {}),stage:'completed',appliedAt:now,taskId:task.task.id || ''};
      const sc=scope();
      const receipt=await saveReceipt({
        id:uuid('coworkreceipt'),tenantId:sc.tenantId,userId:sc.userId,sessionId:session.id,workItemId:workItem.id,action:'create_transcript_action_item_task',status:'completed',
        summary:task.alreadyCreated ? 'That exact Krisp Action Item is already present in Commitments.' : 'Created one internal Commitment from the exact Krisp Action Item.',
        payloadJson:{transcriptId:payload.transcriptId || session.scopeId,actionItem:payload.actionItem || '',taskId:task.task.id || '',alreadyCreated:Boolean(task.alreadyCreated),noExternalAction:true},createdAt:now
      });
      await saveSession(session);await saveWorkItem(workItem);
      return {...publicResult(session,workItem,receipt.summary,null,receipt),task:task.task,alreadyCreated:Boolean(task.alreadyCreated)};
    }
    if(workItem.workType === 'project_next_move'){
      if(workItem.status !== 'needs_review') throw new Error('The next move must be complete and reviewed before it can be applied.');
      const session=await getSession(workItem.sessionId);
      if(!session) throw new Error('The Co-Work session for this prepared item is missing.');
      const payload=workItem.payloadJson || {};
      const proposal={
        nextMove:compactText(payload.nextMove || '',500),
        accountableOwner:compactText(payload.accountableOwner || '',180),
        timingOrTrigger:compactText(payload.timingOrTrigger || '',300),
        basis:compactText(payload.basis || '',700)
      };
      if(missingNextMoveFields(proposal).length) throw new Error('The next move proposal is incomplete and cannot be applied yet.');
      const project=await applyProjectNextMove({
        projectId:payload.projectId || session.scopeId,
        projectName:payload.projectName || session.workingBriefJson?.projectName || 'Project',
        ...proposal,
        sourceRefs:workItem.sourceRefsJson || [],
        sessionId:session.id,
        workItemId:workItem.id
      });
      if(!project) throw new Error('VAL could not save the next move to the selected Project Manager.');
      const now=new Date().toISOString();
      workItem.status='applied';
      workItem.updatedAt=now;
      session.status='completed';
      session.updatedAt=now;
      session.stateJson={...(session.stateJson || {}),stage:'completed',appliedAt:now};
      const sc=scope();
      const receipt=await saveReceipt({
        id:uuid('coworkreceipt'),
        tenantId:sc.tenantId,
        userId:sc.userId,
        sessionId:session.id,
        workItemId:workItem.id,
        action:'apply_project_next_move',
        status:'completed',
        summary:`Applied the next move to ${payload.projectName || 'the selected Project Manager'}.`,
        payloadJson:{projectId:payload.projectId || session.scopeId,projectName:payload.projectName || '',...proposal,noExternalAction:true},
        createdAt:now
      });
      await saveSession(session);
      await saveWorkItem(workItem);
      return {...publicResult(session,workItem,receipt.summary,null,receipt),project};
    }
    if(workItem.workType === 'project_overview_focus'){
      if(workItem.status !== 'needs_review') throw new Error('The Round Table Focus must be complete and reviewed before it can be applied.');
      const session=await getSession(workItem.sessionId);
      if(!session) throw new Error('The Co-Work session for this prepared item is missing.');
      const payload=workItem.payloadJson || {};
      const brief=session.workingBriefJson || {};
      const projectOverviewFocus=normalizeProjectOverviewFocus(payload.projectOverviewFocus || {},brief);
      if(missingProjectOverviewFocusFields(projectOverviewFocus,brief).length) throw new Error('The Round Table Focus is incomplete and cannot be applied yet.');
      const project=await applyProjectOverview({projectId:payload.projectId || session.scopeId,projectName:payload.projectName || brief.projectName || 'Project',projectOverviewFocus,sourceRefs:workItem.sourceRefsJson || [],sessionId:session.id,workItemId:workItem.id});
      if(!project) throw new Error('VAL could not save the Round Table Focus to the selected Project Manager.');
      const now=new Date().toISOString();workItem.status='applied';workItem.updatedAt=now;session.status='completed';session.updatedAt=now;session.stateJson={...(session.stateJson || {}),stage:'completed',appliedAt:now};
      const sc=scope();const receipt=await saveReceipt({id:uuid('coworkreceipt'),tenantId:sc.tenantId,userId:sc.userId,sessionId:session.id,workItemId:workItem.id,action:'apply_project_overview_focus',status:'completed',summary:`Applied the Round Table Focus to ${payload.projectName || 'the selected Project Manager'}.`,payloadJson:{projectId:payload.projectId || session.scopeId,projectName:payload.projectName || '',projectOverviewFocus,noExternalAction:true},createdAt:now});
      await saveSession(session);await saveWorkItem(workItem);return {...publicResult(session,workItem,receipt.summary,null,receipt),project};
    }
    if(workItem.workType === 'project_identity'){
      if(workItem.status !== 'needs_review') throw new Error('The project foundation must be complete and reviewed before it can be applied.');
      const session=await getSession(workItem.sessionId);
      if(!session) throw new Error('The Co-Work session for this prepared item is missing.');
      const payload=workItem.payloadJson || {};
      const identity=projectIdentityFromAnswer('',payload.identity || {},'ready_to_apply');
      if(missingProjectIdentityFields(identity).length) throw new Error('The project foundation is incomplete and cannot be applied yet.');
      const project=await applyProjectIdentity({
        projectId:payload.projectId || session.scopeId,
        projectName:identity.canonicalName,
        purpose:identity.purpose,
        desiredOutcome:identity.desiredOutcome,
        owner:identity.owner,
        sourceRefs:workItem.sourceRefsJson || [],
        sessionId:session.id,
        workItemId:workItem.id
      });
      if(!project) throw new Error('VAL could not save the foundation to the selected Project Manager.');
      const now=new Date().toISOString();
      workItem.status='applied';
      workItem.updatedAt=now;
      session.status='completed';
      session.updatedAt=now;
      session.stateJson={...(session.stateJson || {}),stage:'completed',appliedAt:now};
      const sc=scope();
      const receipt=await saveReceipt({
        id:uuid('coworkreceipt'),tenantId:sc.tenantId,userId:sc.userId,sessionId:session.id,workItemId:workItem.id,action:'apply_project_identity',status:'completed',
        summary:`Applied the project foundation to ${identity.canonicalName}.`,
        payloadJson:{projectId:payload.projectId || session.scopeId,projectName:identity.canonicalName,identity,noExternalAction:true},createdAt:now
      });
      await saveSession(session);
      await saveWorkItem(workItem);
      return {...publicResult(session,workItem,receipt.summary,null,receipt),project};
    }
    if(workItem.workType === 'project_onboarding_stage'){
      if(workItem.status !== 'needs_review') throw new Error('The onboarding answer must be reviewed before it can be applied.');
      const session=await getSession(workItem.sessionId);
      if(!session) throw new Error('The Co-Work session for this onboarding step is missing.');
      const payload=workItem.payloadJson || {};
      const brief=session.workingBriefJson || {};
      const stage=compactText(payload.stage || brief.currentStage || '',100);
      const answer=multilineText(payload.answer || '',5000);
      if(!PROJECT_ONBOARDING_STAGE_CONTRACTS[stage] || stage==='complete' || !answer) throw new Error('The protected onboarding answer is incomplete and cannot be applied yet.');
      const project=await applyProjectOnboarding({
        projectId:payload.projectId || session.scopeId,
        projectName:payload.projectName || brief.projectName || 'Project',
        stage,
        answer,
        stageContract:payload.stageContract || projectOnboardingStageContract(stage),
        sourceRefs:workItem.sourceRefsJson || [],
        sessionId:session.id,
        workItemId:workItem.id
      });
      if(!project) throw new Error('VAL could not save this onboarding stage to the selected Project Manager.');
      const now=new Date().toISOString();
      workItem.status='applied';workItem.updatedAt=now;session.status='completed';session.updatedAt=now;session.stateJson={...(session.stateJson || {}),stage:'completed',appliedAt:now};
      const sc=scope();
      const receipt=await saveReceipt({
        id:uuid('coworkreceipt'),tenantId:sc.tenantId,userId:sc.userId,sessionId:session.id,workItemId:workItem.id,action:`apply_project_onboarding_${stage}`,status:'completed',
        summary:`Applied the ${projectOnboardingStageContract(stage).pageBoxes.join(', ')} onboarding input to ${payload.projectName || 'the selected Project Manager'}.`,
        payloadJson:{projectId:payload.projectId || session.scopeId,projectName:payload.projectName || '',stage,answer,noExternalAction:true},createdAt:now
      });
      await saveSession(session);await saveWorkItem(workItem);
      return {...publicResult(session,workItem,receipt.summary,null,receipt),project};
    }
    if(workItem.workType === 'project_people'){
      if(workItem.status !== 'needs_review') throw new Error('The project people must be complete and reviewed before they can be applied.');
      const session=await getSession(workItem.sessionId);
      if(!session) throw new Error('The Co-Work session for this prepared item is missing.');
      const payload=workItem.payloadJson || {};
      const proposal={people:safeArray(payload.people),ownerId:compactText(payload.ownerId || '',220),ownerName:compactText(payload.ownerName || '',180)};
      if(missingProjectPeopleFields(proposal).length) throw new Error('The project people proposal is incomplete and cannot be applied yet.');
      const project=await applyProjectPeople({projectId:payload.projectId || session.scopeId,projectName:payload.projectName || session.workingBriefJson?.projectName || 'Project',...proposal,sourceRefs:workItem.sourceRefsJson || [],sessionId:session.id,workItemId:workItem.id});
      if(!project) throw new Error('VAL could not save the people to the selected Project Manager.');
      const now=new Date().toISOString();workItem.status='applied';workItem.updatedAt=now;session.status='completed';session.updatedAt=now;session.stateJson={...(session.stateJson || {}),stage:'completed',appliedAt:now};
      const sc=scope();const receipt=await saveReceipt({id:uuid('coworkreceipt'),tenantId:sc.tenantId,userId:sc.userId,sessionId:session.id,workItemId:workItem.id,action:'apply_project_people',status:'completed',summary:`Applied ${proposal.people.length} linked people and the owner to ${payload.projectName || 'the selected Project Manager'}.`,payloadJson:{projectId:payload.projectId || session.scopeId,projectName:payload.projectName || '',people:proposal.people,ownerId:proposal.ownerId,noExternalAction:true},createdAt:now});
      await saveSession(session);await saveWorkItem(workItem);return {...publicResult(session,workItem,receipt.summary,null,receipt),project};
    }
    if(workItem.workType === 'project_documents'){
      if(workItem.status !== 'needs_review') throw new Error('The project documents must be complete and reviewed before they can be applied.');
      const session=await getSession(workItem.sessionId);
      if(!session) throw new Error('The Co-Work session for this prepared item is missing.');
      const payload=workItem.payloadJson || {};
      const proposal={documents:safeArray(payload.documents)};
      if(missingProjectDocumentFields(proposal).length) throw new Error('The project document proposal is incomplete and cannot be applied yet.');
      const project=await applyProjectDocuments({projectId:payload.projectId || session.scopeId,projectName:payload.projectName || session.workingBriefJson?.projectName || 'Project',documents:proposal.documents,sourceRefs:workItem.sourceRefsJson || [],sessionId:session.id,workItemId:workItem.id});
      if(!project) throw new Error('VAL could not save the documents to the selected Project Manager.');
      const now=new Date().toISOString();workItem.status='applied';workItem.updatedAt=now;session.status='completed';session.updatedAt=now;session.stateJson={...(session.stateJson || {}),stage:'completed',appliedAt:now};
      const sc=scope();const receipt=await saveReceipt({id:uuid('coworkreceipt'),tenantId:sc.tenantId,userId:sc.userId,sessionId:session.id,workItemId:workItem.id,action:'apply_project_documents',status:'completed',summary:`Applied ${proposal.documents.length} linked document receipt${proposal.documents.length === 1 ? '' : 's'} to ${payload.projectName || 'the selected Project Manager'}.`,payloadJson:{projectId:payload.projectId || session.scopeId,projectName:payload.projectName || '',documents:proposal.documents,noExternalAction:true},createdAt:now});
      await saveSession(session);await saveWorkItem(workItem);return {...publicResult(session,workItem,receipt.summary,null,receipt),project};
    }
    if(workItem.workType === 'project_milestones'){
      if(workItem.status !== 'needs_review') throw new Error('Milestones must be complete and reviewed before they can be applied.');
      const session=await getSession(workItem.sessionId);
      if(!session) throw new Error('The Co-Work session for this prepared item is missing.');
      const payload=workItem.payloadJson || {};
      const brief=session.workingBriefJson || {};
      const milestones=safeArray(payload.milestones).map((milestone)=>normalizeProjectMilestone(milestone,brief));
      if(!milestones.length || milestones.some((milestone)=>missingProjectMilestoneFields(milestone,brief).length)) throw new Error('The milestone proposal is incomplete and cannot be applied yet.');
      const project=await applyProjectMilestones({projectId:payload.projectId || session.scopeId,projectName:payload.projectName || brief.projectName || 'Project',milestones,sourceRefs:workItem.sourceRefsJson || [],sessionId:session.id,workItemId:workItem.id});
      if(!project) throw new Error('VAL could not save the milestones to the selected Project Manager.');
      const now=new Date().toISOString();workItem.status='applied';workItem.updatedAt=now;session.status='completed';session.updatedAt=now;session.stateJson={...(session.stateJson || {}),stage:'completed',appliedAt:now};
      const sc=scope();const receipt=await saveReceipt({id:uuid('coworkreceipt'),tenantId:sc.tenantId,userId:sc.userId,sessionId:session.id,workItemId:workItem.id,action:'apply_project_milestones',status:'completed',summary:`Applied ${milestones.length} milestone${milestones.length === 1 ? '' : 's'} to ${payload.projectName || 'the selected Project Manager'}.`,payloadJson:{projectId:payload.projectId || session.scopeId,projectName:payload.projectName || '',milestones,noExternalAction:true},createdAt:now});
      await saveSession(session);await saveWorkItem(workItem);return {...publicResult(session,workItem,receipt.summary,null,receipt),project};
    }
    if(workItem.workType === 'project_monitoring'){
      if(workItem.status !== 'needs_review') throw new Error('Monitoring rules must be complete and reviewed before they can be applied.');
      const session=await getSession(workItem.sessionId);
      if(!session) throw new Error('The Co-Work session for this prepared item is missing.');
      const payload=workItem.payloadJson || {};
      const brief=session.workingBriefJson || {};
      const monitoringRules=safeArray(payload.monitoringRules).map((rule)=>normalizeMonitoringRule(rule,brief));
      if(!monitoringRules.length || monitoringRules.some((rule)=>missingMonitoringRuleFields(rule).length)) throw new Error('The monitoring rule proposal is incomplete and cannot be applied yet.');
      const project=await applyProjectMonitoring({projectId:payload.projectId || session.scopeId,projectName:payload.projectName || brief.projectName || 'Project',monitoringRules,sourceRefs:workItem.sourceRefsJson || [],sessionId:session.id,workItemId:workItem.id});
      if(!project) throw new Error('VAL could not save the monitoring rules to the selected Project Manager.');
      const now=new Date().toISOString();workItem.status='applied';workItem.updatedAt=now;session.status='completed';session.updatedAt=now;session.stateJson={...(session.stateJson || {}),stage:'completed',appliedAt:now};
      const sc=scope();const receipt=await saveReceipt({id:uuid('coworkreceipt'),tenantId:sc.tenantId,userId:sc.userId,sessionId:session.id,workItemId:workItem.id,action:'apply_project_monitoring',status:'completed',summary:`Applied ${monitoringRules.length} monitoring rule${monitoringRules.length === 1 ? '' : 's'} to ${payload.projectName || 'the selected Project Manager'}.`,payloadJson:{projectId:payload.projectId || session.scopeId,projectName:payload.projectName || '',monitoringRules,noExternalAction:true},createdAt:now});
      await saveSession(session);await saveWorkItem(workItem);return {...publicResult(session,workItem,receipt.summary,null,receipt),project};
    }
    if(workItem.workType === 'project_relationship_nurture'){
      if(workItem.status !== 'needs_review') throw new Error('Relationship nurture rules must be complete and reviewed before they can be applied.');
      const session=await getSession(workItem.sessionId);
      if(!session) throw new Error('The Co-Work session for this prepared item is missing.');
      const payload=workItem.payloadJson || {};
      const brief=session.workingBriefJson || {};
      const relationshipNurtureRules=safeArray(payload.relationshipNurtureRules).map((rule)=>normalizeRelationshipNurtureRule(rule,brief));
      if(!relationshipNurtureRules.length || relationshipNurtureRules.some((rule)=>missingRelationshipNurtureFields(rule,brief).length)) throw new Error('The relationship nurture proposal is incomplete and cannot be applied yet.');
      const project=await applyProjectRelationshipNurture({projectId:payload.projectId || session.scopeId,projectName:payload.projectName || brief.projectName || 'Project',relationshipNurtureRules,sourceRefs:workItem.sourceRefsJson || [],sessionId:session.id,workItemId:workItem.id});
      if(!project) throw new Error('VAL could not save the relationship nurture rules to the selected Project Manager.');
      const now=new Date().toISOString();workItem.status='applied';workItem.updatedAt=now;session.status='completed';session.updatedAt=now;session.stateJson={...(session.stateJson || {}),stage:'completed',appliedAt:now};
      const sc=scope();const receipt=await saveReceipt({id:uuid('coworkreceipt'),tenantId:sc.tenantId,userId:sc.userId,sessionId:session.id,workItemId:workItem.id,action:'apply_project_relationship_nurture',status:'completed',summary:`Applied ${relationshipNurtureRules.length} relationship nurture rule${relationshipNurtureRules.length === 1 ? '' : 's'} to ${payload.projectName || 'the selected Project Manager'}.`,payloadJson:{projectId:payload.projectId || session.scopeId,projectName:payload.projectName || '',relationshipNurtureRules,noExternalAction:true},createdAt:now});
      await saveSession(session);await saveWorkItem(workItem);return {...publicResult(session,workItem,receipt.summary,null,receipt),project};
    }
    if(workItem.workType === 'project_importance'){
      if(workItem.status !== 'needs_review') throw new Error('The project importance judgment must be complete and reviewed before it can be applied.');
      const session=await getSession(workItem.sessionId);
      if(!session) throw new Error('The Co-Work session for this prepared item is missing.');
      const payload=workItem.payloadJson || {};
      const brief=session.workingBriefJson || {};
      const projectImportance=normalizeProjectImportance(payload.projectImportance || {},brief);
      if(missingProjectImportanceFields(projectImportance,brief).length) throw new Error('The project importance judgment is incomplete and cannot be applied yet.');
      const project=await applyProjectImportance({projectId:payload.projectId || session.scopeId,projectName:payload.projectName || brief.projectName || 'Project',projectImportance,sourceRefs:workItem.sourceRefsJson || [],sessionId:session.id,workItemId:workItem.id});
      if(!project) throw new Error('VAL could not save the importance judgment to the selected Project Manager.');
      const now=new Date().toISOString();workItem.status='applied';workItem.updatedAt=now;session.status='completed';session.updatedAt=now;session.stateJson={...(session.stateJson || {}),stage:'completed',appliedAt:now};
      const sc=scope();const receipt=await saveReceipt({id:uuid('coworkreceipt'),tenantId:sc.tenantId,userId:sc.userId,sessionId:session.id,workItemId:workItem.id,action:'apply_project_importance',status:'completed',summary:`Applied the strategic judgment to ${payload.projectName || 'the selected Project Manager'}.`,payloadJson:{projectId:payload.projectId || session.scopeId,projectName:payload.projectName || '',projectImportance,noExternalAction:true},createdAt:now});
      await saveSession(session);await saveWorkItem(workItem);return {...publicResult(session,workItem,receipt.summary,null,receipt),project};
    }
    if(workItem.workType === 'project_risk'){
      if(workItem.status !== 'needs_review') throw new Error('The project risk assessment must be complete and reviewed before it can be applied.');
      const session=await getSession(workItem.sessionId);
      if(!session) throw new Error('The Co-Work session for this prepared item is missing.');
      const payload=workItem.payloadJson || {};
      const brief=session.workingBriefJson || {};
      const projectRisk=normalizeProjectRisk(payload.projectRisk || {},brief);
      if(missingProjectRiskFields(projectRisk,brief).length) throw new Error('The project risk assessment is incomplete and cannot be applied yet.');
      const project=await applyProjectRisk({projectId:payload.projectId || session.scopeId,projectName:payload.projectName || brief.projectName || 'Project',projectRisk,sourceRefs:workItem.sourceRefsJson || [],sessionId:session.id,workItemId:workItem.id});
      if(!project) throw new Error('VAL could not save the risk assessment to the selected Project Manager.');
      const now=new Date().toISOString();workItem.status='applied';workItem.updatedAt=now;session.status='completed';session.updatedAt=now;session.stateJson={...(session.stateJson || {}),stage:'completed',appliedAt:now};
      const sc=scope();const outcome=projectRiskHasMaterialAssessment(projectRisk) ? 'project risk assessment' : 'no-material-risk assessment';const receipt=await saveReceipt({id:uuid('coworkreceipt'),tenantId:sc.tenantId,userId:sc.userId,sessionId:session.id,workItemId:workItem.id,action:'apply_project_risk',status:'completed',summary:`Applied the ${outcome} to ${payload.projectName || 'the selected Project Manager'}.`,payloadJson:{projectId:payload.projectId || session.scopeId,projectName:payload.projectName || '',projectRisk,noExternalAction:true},createdAt:now});
      await saveSession(session);await saveWorkItem(workItem);return {...publicResult(session,workItem,receipt.summary,null,receipt),project};
    }
    if(workItem.workType === 'project_narrative'){
      if(workItem.status !== 'needs_review') throw new Error('The project narrative must be complete and reviewed before it can be applied.');
      const session=await getSession(workItem.sessionId);
      if(!session) throw new Error('The Co-Work session for this prepared item is missing.');
      const payload=workItem.payloadJson || {};
      const brief=session.workingBriefJson || {};
      const projectNarrative=normalizeProjectNarrative(payload.projectNarrative || {},brief);
      if(missingProjectNarrativeFields(projectNarrative,brief).length) throw new Error('The project narrative is incomplete and cannot be applied yet.');
      const project=await applyProjectNarrative({projectId:payload.projectId || session.scopeId,projectName:payload.projectName || brief.projectName || 'Project',projectNarrative,sourceRefs:workItem.sourceRefsJson || [],sessionId:session.id,workItemId:workItem.id});
      if(!project) throw new Error('VAL could not save the narrative to the selected Project Manager.');
      const now=new Date().toISOString();workItem.status='applied';workItem.updatedAt=now;session.status='completed';session.updatedAt=now;session.stateJson={...(session.stateJson || {}),stage:'completed',appliedAt:now};
      const sc=scope();const receipt=await saveReceipt({id:uuid('coworkreceipt'),tenantId:sc.tenantId,userId:sc.userId,sessionId:session.id,workItemId:workItem.id,action:'apply_project_narrative',status:'completed',summary:`Applied the current-state narrative to ${payload.projectName || 'the selected Project Manager'}.`,payloadJson:{projectId:payload.projectId || session.scopeId,projectName:payload.projectName || '',projectNarrative,noExternalAction:true},createdAt:now});
      await saveSession(session);await saveWorkItem(workItem);return {...publicResult(session,workItem,receipt.summary,null,receipt),project};
    }
    if(workItem.workType === 'project_operating_system'){
      if(workItem.status !== 'needs_review') throw new Error('The operating-system selection must be complete and reviewed before it can be applied.');
      const session=await getSession(workItem.sessionId);
      if(!session) throw new Error('The Co-Work session for this prepared item is missing.');
      const payload=workItem.payloadJson || {};
      const brief=session.workingBriefJson || {};
      const projectOperatingSystem=normalizeProjectOperatingSystem(payload.projectOperatingSystem || {},brief);
      if(missingProjectOperatingSystemFields(projectOperatingSystem,brief).length) throw new Error('The operating-system selection is incomplete and cannot be applied yet.');
      const project=await applyProjectOperatingSystem({projectId:payload.projectId || session.scopeId,projectName:payload.projectName || brief.projectName || 'Project',projectOperatingSystem,sourceRefs:workItem.sourceRefsJson || [],sessionId:session.id,workItemId:workItem.id});
      if(!project) throw new Error('VAL could not save the operating-system selection to the selected Project Manager.');
      const now=new Date().toISOString();workItem.status='applied';workItem.updatedAt=now;session.status='completed';session.updatedAt=now;session.stateJson={...(session.stateJson || {}),stage:'completed',appliedAt:now};
      const sc=scope();const receipt=await saveReceipt({id:uuid('coworkreceipt'),tenantId:sc.tenantId,userId:sc.userId,sessionId:session.id,workItemId:workItem.id,action:'apply_project_operating_system',status:'completed',summary:`Applied ${projectOperatingSystem.sopName} to ${payload.projectName || 'the selected Project Manager'}.`,payloadJson:{projectId:payload.projectId || session.scopeId,projectName:payload.projectName || '',projectOperatingSystem,noExternalAction:true},createdAt:now});
      await saveSession(session);await saveWorkItem(workItem);return {...publicResult(session,workItem,receipt.summary,null,receipt),project};
    }
    if(workItem.workType === 'project_phase'){
      if(workItem.status !== 'needs_review') throw new Error('The current-phase record must be complete and reviewed before it can be applied.');
      const session=await getSession(workItem.sessionId);
      if(!session) throw new Error('The Co-Work session for this prepared item is missing.');
      const payload=workItem.payloadJson || {};
      const brief=session.workingBriefJson || {};
      const projectPhase=normalizeProjectPhase(payload.projectPhase || {},brief);
      if(missingProjectPhaseFields(projectPhase,brief).length) throw new Error('The current-phase record is incomplete and cannot be applied yet.');
      const project=await applyProjectPhase({projectId:payload.projectId || session.scopeId,projectName:payload.projectName || brief.projectName || 'Project',sopId:brief.sopId,projectPhase,sourceRefs:workItem.sourceRefsJson || [],sessionId:session.id,workItemId:workItem.id});
      if(!project) throw new Error('VAL could not save the current-phase record to the selected Project Manager.');
      const now=new Date().toISOString();workItem.status='applied';workItem.updatedAt=now;session.status='completed';session.updatedAt=now;session.stateJson={...(session.stateJson || {}),stage:'completed',appliedAt:now};
      const sc=scope();const receipt=await saveReceipt({id:uuid('coworkreceipt'),tenantId:sc.tenantId,userId:sc.userId,sessionId:session.id,workItemId:workItem.id,action:'apply_project_phase',status:'completed',summary:`Applied the ${projectPhase.currentPhase} phase to ${payload.projectName || 'the selected Project Manager'}.`,payloadJson:{projectId:payload.projectId || session.scopeId,projectName:payload.projectName || '',sopId:brief.sopId,projectPhase,noExternalAction:true},createdAt:now});
      await saveSession(session);await saveWorkItem(workItem);return {...publicResult(session,workItem,receipt.summary,null,receipt),project};
    }
    if(workItem.workType === 'project_prepared_work'){
      if(workItem.status !== 'needs_review') throw new Error('The prepared-work proposal must be complete and reviewed before it can be applied.');
      const session=await getSession(workItem.sessionId);
      if(!session) throw new Error('The Co-Work session for this prepared item is missing.');
      const payload=workItem.payloadJson || {};
      const brief=session.workingBriefJson || {};
      const projectPreparedWork=normalizeProjectPreparedWork(payload.projectPreparedWork || {},brief);
      if(missingProjectPreparedWorkFields(projectPreparedWork,brief).length) throw new Error('The prepared-work proposal is incomplete and cannot be applied yet.');
      const project=await applyProjectPreparedWork({projectId:payload.projectId || session.scopeId,projectName:payload.projectName || brief.projectName || 'Project',projectPreparedWork,sourceRefs:workItem.sourceRefsJson || [],sessionId:session.id,workItemId:workItem.id});
      if(!project) throw new Error('VAL could not save the prepared-work proposal to the selected Project Manager.');
      const now=new Date().toISOString();workItem.status='applied';workItem.updatedAt=now;session.status='completed';session.updatedAt=now;session.stateJson={...(session.stateJson || {}),stage:'completed',appliedAt:now};
      const sc=scope();const receipt=await saveReceipt({id:uuid('coworkreceipt'),tenantId:sc.tenantId,userId:sc.userId,sessionId:session.id,workItemId:workItem.id,action:'apply_project_prepared_work',status:'completed',summary:`Applied the ${projectPreparedWork.kindName} proposal to ${payload.projectName || 'the selected Project Manager'} and Ready for You.`,payloadJson:{projectId:payload.projectId || session.scopeId,projectName:payload.projectName || '',projectPreparedWork,noExternalAction:true},createdAt:now});
      await saveSession(session);await saveWorkItem(workItem);return {...publicResult(session,workItem,receipt.summary,null,receipt),project};
    }
    if(workItem.workType === 'project_needs_next'){
      if(workItem.status !== 'needs_review') throw new Error('What VAL needs next must be complete and reviewed before it can be applied.');
      const session=await getSession(workItem.sessionId);
      if(!session) throw new Error('The Co-Work session for this prepared item is missing.');
      const payload=workItem.payloadJson || {};
      const brief=session.workingBriefJson || {};
      const projectNeedsNext=normalizeProjectNeedsNext(payload.projectNeedsNext || {},brief);
      if(missingProjectNeedsNextFields(projectNeedsNext,brief).length) throw new Error('The next-needed project input is incomplete and cannot be applied yet.');
      const project=await applyProjectNeedsNext({projectId:payload.projectId || session.scopeId,projectName:payload.projectName || brief.projectName || 'Project',projectNeedsNext,sourceRefs:workItem.sourceRefsJson || [],sessionId:session.id,workItemId:workItem.id});
      if(!project) throw new Error('VAL could not save what it needs next to the selected Project Manager.');
      const now=new Date().toISOString();workItem.status='applied';workItem.updatedAt=now;session.status='completed';session.updatedAt=now;session.stateJson={...(session.stateJson || {}),stage:'completed',appliedAt:now};
      const sc=scope();const receipt=await saveReceipt({id:uuid('coworkreceipt'),tenantId:sc.tenantId,userId:sc.userId,sessionId:session.id,workItemId:workItem.id,action:'apply_project_needs_next',status:'completed',summary:`Applied what VAL needs next to ${payload.projectName || 'the selected Project Manager'}.`,payloadJson:{projectId:payload.projectId || session.scopeId,projectName:payload.projectName || '',projectNeedsNext,noExternalAction:true},createdAt:now});
      await saveSession(session);await saveWorkItem(workItem);return {...publicResult(session,workItem,receipt.summary,null,receipt),project};
    }
    if(workItem.workType !== 'project_workstreams') throw new Error('This work item cannot apply project workstreams.');
    if(workItem.status !== 'needs_review') throw new Error('Workstreams must be complete and reviewed before they can be applied.');
    const session=await getSession(workItem.sessionId);
    if(!session) throw new Error('The Co-Work session for this prepared item is missing.');
    const payload=workItem.payloadJson || {};
    const workstreams=safeArray(payload.workstreams).map((item)=>normalizeWorkstream(item,session.workingBriefJson || {}));
    if(!workstreams.length || workstreams.some((item)=>missingWorkstreamFields(item).length)) throw new Error('The workstream proposal is incomplete and cannot be applied yet.');
    const project=await applyProjectWorkstreams({
      projectId:payload.projectId || session.scopeId,
      projectName:payload.projectName || session.workingBriefJson?.projectName || 'Project',
      desiredOutcome:payload.desiredOutcome || session.workingBriefJson?.desiredOutcome || '',
      workstreams,
      sourceRefs:workItem.sourceRefsJson || [],
      sessionId:session.id,
      workItemId:workItem.id
    });
    if(!project) throw new Error('VAL could not save the workstreams to the selected Project Manager.');
    const now=new Date().toISOString();
    workItem.status='applied';
    workItem.updatedAt=now;
    session.status='completed';
    session.updatedAt=now;
    session.stateJson={...(session.stateJson || {}),stage:'completed',appliedAt:now};
    const sc=scope();
    const receipt=await saveReceipt({
      id:uuid('coworkreceipt'),
      tenantId:sc.tenantId,
      userId:sc.userId,
      sessionId:session.id,
      workItemId:workItem.id,
      action:'apply_project_workstreams',
      status:'completed',
      summary:`Applied ${workstreams.length} workstream${workstreams.length === 1 ? '' : 's'} to ${payload.projectName || 'the selected Project Manager'}.`,
      payloadJson:{projectId:payload.projectId || session.scopeId,projectName:payload.projectName || '',workstreams,noExternalAction:true},
      createdAt:now
    });
    await saveSession(session);
    await saveWorkItem(workItem);
    return {...publicResult(session,workItem,receipt.summary,null,receipt),project};
  }
  return {openEntry,respond,applyWorkItem,getSession,COWORK_ENTRYPOINTS};
}

module.exports={
  COWORK_ENTRYPOINTS,
  buildProjectIdentityBrief,
  buildProjectOnboardingBrief,
  buildProjectPeopleBrief,
  buildProjectDocumentsBrief,
  buildProjectMilestonesBrief,
  buildProjectMonitoringBrief,
  buildProjectRelationshipNurtureBrief,
  buildProjectImportanceBrief,
  buildProjectRiskBrief,
  buildTranscriptWorkingBrief,
  buildTranscriptActionItemBrief,
  buildEmailThreadBrief,
  buildProjectWorkstreamsBrief,
  createValCoworkService,
  entryQuestion,
  missingProjectIdentityFields,
  projectOnboardingStage,
  projectOnboardingStageContract,
  missingProjectPeopleFields,
  missingProjectDocumentFields,
  missingProjectMilestoneFields,
  projectMilestonesQuestion,
  missingMonitoringRuleFields,
  projectMonitoringQuestion,
  missingRelationshipNurtureFields,
  projectRelationshipNurtureQuestion,
  missingProjectImportanceFields,
  projectImportanceQuestion,
  missingProjectRiskFields,
  projectRiskQuestion,
  missingWorkstreamFields,
  normalizeWorkstream,
  parseLabeledWorkstreamDetails,
  parseWorkstreamNames
};
