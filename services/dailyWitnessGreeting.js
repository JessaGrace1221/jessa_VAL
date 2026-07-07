function asArray(value){
  return Array.isArray(value)?value:[];
}

function cleanText(value){
  return String(value||'').replace(/\s+/g,' ').trim();
}

function firstName(value){
  return cleanText(value).split(/\s+/)[0]||'there';
}

function clamp01(value,fallback=0){
  const n=Number(value);
  if(!Number.isFinite(n))return fallback;
  return Math.max(0,Math.min(1,n));
}

function itemDate(value){
  const d=new Date(value||0);
  return Number.isFinite(d.getTime())?d:null;
}

function withinDays(value,days,now){
  const d=itemDate(value);
  if(!d)return false;
  return d.getTime()>=now.getTime()-days*86400000&&d.getTime()<=now.getTime()+86400000;
}

function evidenceItem(sourceType,item,summary,extra={}){
  return {
    source_type:sourceType,
    source_id:cleanText(item.id||item.source_id||item.sourceId||item.profileKey||''),
    title:cleanText(item.title||item.subject||item.displayName||item.name||sourceType),
    summary:cleanText(summary||item.summary||item.why||item.detail||''),
    occurred_at:item.createdAt||item.created_at||item.occurredAt||item.occurred_at||item.updatedAt||item.updated_at||'',
    confidence:clamp01(item.confidence,extra.confidence==null?0.68:extra.confidence),
    sensitivity:extra.sensitivity||'low',
    user_visible:extra.user_visible!==false
  };
}

function collectDailyWitnessEvidence(input={}){
  const now=input.now instanceof Date?input.now:new Date(input.now||Date.now());
  const evidence=[];
  for(const move of asArray(input.moves)){
    const summary=move.whatChanged||move.why||move.summary||move.title;
    evidence.push(evidenceItem('agency_move',move,summary,{confidence:move.confidence==null?0.72:move.confidence}));
  }
  for(const profile of asArray(input.profiles)){
    const count=Number(profile.openLoopCount||0)+Number(profile.riskCount||0)+Number(profile.opportunityCount||0);
    if(count||withinDays(profile.lastObservedAt||profile.updatedAt,7,now)){
      evidence.push(evidenceItem(profile.profileType==='project'?'project':'relationship',profile,profile.summary||profile.relationshipStatus,{confidence:profile.confidence==null?0.64:profile.confidence}));
    }
  }
  for(const draft of asArray(input.drafts)){
    const status=String(draft.status||'draft').toLowerCase();
    const summary=status==='sent'||status==='approved'?'Meaningful prepared work moved forward.':'Prepared work is waiting for review.';
    evidence.push(evidenceItem('draft',draft,summary,{confidence:0.7}));
  }
  for(const memory of asArray(input.onboardingMemory)){
    evidence.push(evidenceItem('teach_val',memory,memory.detail||memory.summary,{confidence:0.74}));
  }
  for(const item of asArray(input.evidenceItems)){
    const sourceType=String(item.sourceType||item.source_type||item.type||'evidence').toLowerCase();
    const text=[item.title,item.summary,item.rawText||item.raw_text].filter(Boolean).join(' ');
    const sensitivity=/court|custody|bereavement|medical|health|hearing|family emergency/i.test(text)?'high':'low';
    evidence.push(evidenceItem(sourceType,item,text,{confidence:item.confidence==null?0.62:item.confidence,sensitivity}));
  }
  return evidence.filter(e=>e.summary||e.title);
}

function extractDailyWitnessMeaning(input={}){
  const now=input.now instanceof Date?input.now:new Date(input.now||Date.now());
  const evidence=asArray(input.evidence);
  const recent=evidence.filter(e=>withinDays(e.occurred_at,2,now)||!e.occurred_at);
  const joined=recent.map(e=>`${e.title} ${e.summary}`).join(' ');
  const meetingCount=(joined.match(/\b(meeting|call|appointment|briefing|demo)\b/gi)||[]).length;
  const proposalCount=(joined.match(/\b(proposal|scope|memo|draft|reply|follow-up|follow up)\b/gi)||[]).length;
  const emotionalHits=(joined.match(/\b(frustrat|hard|difficult|heavy|risk|tired|fatigue|reactive|concern|blocked|custody|court|hearing)\b/gi)||[]).length;
  const completionHits=(joined.match(/\b(sent|approved|closed|completed|resolved|replied|finished|out)\b/gi)||[]).length;
  const waitingHits=(joined.match(/\b(waiting|reply|responded|response|asked|pending)\b/gi)||[]).length;
  const highSensitivity=recent.filter(e=>e.sensitivity==='high');
  const readyWork=recent.filter(e=>/draft|prepared|approval|review|proposal|reply/i.test(`${e.title} ${e.summary}`));
  const meaningCandidates=[];
  function add(meaning,confidence,sensitivity='low',ids=[]){
    meaningCandidates.push({meaning,supporting_evidence_ids:ids.filter(Boolean),confidence:clamp01(confidence),sensitivity});
  }
  if(meetingCount>=4)add('High context switching shaped the recent day.',0.78,'low',recent.slice(0,4).map(e=>e.source_id));
  if(emotionalHits>=2)add('The day likely carried extra emotional or strategic weight.',0.66,highSensitivity.length?'high':'medium',recent.slice(0,4).map(e=>e.source_id));
  if(proposalCount>=2||completionHits>=2)add('Meaningful work moved forward or closed a loop.',0.76,'low',readyWork.slice(0,4).map(e=>e.source_id));
  if(waitingHits>=1)add('At least one waiting loop may be ready for attention.',0.62,'low',recent.slice(0,3).map(e=>e.source_id));
  if(readyWork.length)add('Prepared work is available without making the user start from zero.',0.72,'low',readyWork.slice(0,4).map(e=>e.source_id));
  if(!meaningCandidates.length&&recent.length)add('There is some signal, but not enough to claim a strong story.',0.44,'low',recent.slice(0,3).map(e=>e.source_id));
  return {
    previous_day_shape:meetingCount>=4?'high_context_switching':(emotionalHits>=2?'heavy':(completionHits>=1?'completion':'quiet_or_unknown')),
    current_day_shape:readyWork.length?'prepared_work_available':'unknown',
    observed_patterns:meaningCandidates.map(m=>m.meaning),
    effort_read:meetingCount>=4?'More context switching than deep work.':(emotionalHits>=2?'Likely extra emotional effort.':'Not enough evidence to name effort strongly.'),
    outcome_read:completionHits>=1||proposalCount>=1?'Meaningful work appears to have moved.':'No major outcome signal detected.',
    capacity_read:meetingCount>=4||emotionalHits>=2?'Protect capacity.':'Capacity signal is light.',
    relationship_read:waitingHits>=1?'A relationship or reply loop may be active.':'No strong relationship loop in greeting evidence.',
    workload_read:meetingCount>=4?'Busy recent workload.':'Workload signal is light.',
    prepared_work_read:readyWork.length?'Prepared work is waiting.':'No prepared work signal.',
    meaning_candidates:meaningCandidates,
    metrics:{meetingCount,proposalCount,emotionalHits,completionHits,waitingHits,readyWorkCount:readyWork.length,highSensitivityCount:highSensitivity.length}
  };
}

function resolveDailyWitnessContradictions(input={}){
  const meaning=input.meaning||{};
  const candidates=asArray(meaning.meaning_candidates);
  const high=candidates.filter(c=>c.confidence>=0.7);
  const sensitive=candidates.filter(c=>c.sensitivity==='high');
  const hasHeavy=/heavy|context switching|emotional/i.test(candidates.map(c=>c.meaning).join(' '));
  const hasCompletion=/moved forward|closed|prepared/i.test(candidates.map(c=>c.meaning).join(' '));
  let resolution='synthesize';
  if(sensitive.length&&!high.length)resolution='choose_restraint';
  else if(!high.length)resolution='defer_to_silence';
  const dominant=hasHeavy&&hasCompletion?'A lot moved, and it likely cost attention.':(hasHeavy?'The recent day asked for more capacity than usual.':(hasCompletion?'Meaningful work moved forward.':'The day has light signal.'));
  const secondary=hasHeavy&&hasCompletion?'There is also a completion or prepared-work story.':'';
  return {
    dominant_story:dominant,
    secondary_story:secondary,
    conflicting_signals:hasHeavy&&hasCompletion?['heavy_or_context_switching','completion_or_momentum']:[],
    resolution,
    confidence:high.length?Math.min(0.88,high.reduce((sum,c)=>sum+c.confidence,0)/high.length):0.42,
    do_not_overstate:sensitive.length?['sensitive_event_details']:(resolution==='defer_to_silence'?['emotional_read','specific_story']:[])
  };
}

function selectGreetingState({meaning={},resolution={},now=new Date()}={}){
  const hour=(now instanceof Date?now:new Date(now)).getHours();
  const metrics=meaning.metrics||{};
  if(metrics.highSensitivityCount>0)return 'exceptional_event';
  if(hour>=17)return 'evening';
  if(isWeekendOrHoliday(now)&&metrics.readyWorkCount===0&&metrics.waitingHits===0&&metrics.proposalCount===0&&metrics.completionHits===0&&metrics.meetingCount<4&&metrics.emotionalHits<2)return 'weekend_holiday';
  if(hour>=11&&hour<17&&metrics.readyWorkCount>0)return 'midday';
  if(metrics.completionHits>=2||metrics.proposalCount>=2)return 'completion';
  if(metrics.emotionalHits>=2||metrics.meetingCount>=4)return 'recovery_morning';
  if(metrics.readyWorkCount>0||metrics.waitingHits>0)return 'momentum_morning';
  if(resolution.resolution==='defer_to_silence')return 'quiet_morning';
  return 'clear_morning';
}

function selectGreetingIntent({state,meaning={}}={}){
  const metrics=meaning.metrics||{};
  if(state==='exceptional_event')return {primary_intent:'ground',secondary_intent:'protect',reason:'Sensitive or exceptional evidence requires care.'};
  if(state==='evening')return {primary_intent:'encourage_rest',secondary_intent:'reassure',reason:'Evening greeting should help the user set work down.'};
  if(state==='completion')return {primary_intent:'recognize',secondary_intent:'celebrate',reason:'Meaningful work appears to have moved or closed.'};
  if(state==='weekend_holiday')return {primary_intent:'protect_rest',secondary_intent:'reassure',reason:'Weekend or holiday greetings should protect the user unless something has earned attention.'};
  if(state==='recovery_morning')return {primary_intent:'encourage_rest',secondary_intent:'protect',reason:'Recent evidence suggests load or context switching.'};
  if(state==='protective'||metrics.meetingCount>=4)return {primary_intent:'protect',secondary_intent:'refocus',reason:'Attention needs protection.'};
  if(state==='momentum_morning')return {primary_intent:'refocus',secondary_intent:'invite',reason:'Something is ready for judgment.'};
  return {primary_intent:'prepare',secondary_intent:'ground',reason:'Keep the greeting quiet and spacious.'};
}

function certaintyPrefix(confidence,phrase){
  if(confidence>=0.72)return phrase;
  if(confidence>=0.5)return `It looks like ${phrase.charAt(0).toLowerCase()}${phrase.slice(1)}`;
  return '';
}

function holidayName(value){
  const date=value instanceof Date?value:new Date(value||Date.now());
  const month=date.getMonth()+1;
  const day=date.getDate();
  if(month===1&&day===1)return 'New Year\'s Day';
  if(month===7&&day===4)return 'Independence Day';
  if(month===12&&day===25)return 'Christmas Day';
  if(month===11&&day>=22&&day<=28&&date.getDay()===4)return 'Thanksgiving';
  return '';
}

function isWeekendOrHoliday(value){
  const date=value instanceof Date?value:new Date(value||Date.now());
  const day=date.getDay();
  return day===0||day===6||!!holidayName(date);
}

function composeDailyWitnessGreeting({clientName='there',state,meaning={},resolution={},intent={},now=new Date()}={}){
  const name=firstName(clientName);
  const confidence=clamp01(resolution.confidence,0.45);
  const lines=[];
  const hour=(now instanceof Date?now:new Date(now)).getHours();
  const morning=hour<12;
  if(state==='evening'){
    lines.push('We had a meaningful day.');
    lines.push('The work can wait until tomorrow.');
    return {lines,permission:'Go make memories with your people.',witness:'The day can be set down.',cost:'Open loops do not need to come into the evening.',confidence};
  }
  if(state==='exceptional_event'){
    lines.push(morning?`Good morning, ${name}.`:'I am keeping this simple.');
    lines.push('Today deserves care, not extra noise.');
    return {lines,permission:'Only what truly earns attention should come forward.',witness:'A sensitive or exceptional event may be present.',cost:'This could carry more than ordinary work context.',confidence:Math.min(confidence,0.62)};
  }
  if(state==='completion'){
    lines.push('Something meaningful moved forward.');
    lines.push('That took more thinking than a checklist can show.');
    return {lines,permission:'One less thing to carry.',witness:'A meaningful loop appears to have closed.',cost:'The work represented carried context.',confidence};
  }
  if(state==='recovery_morning'){
    lines.push(`Good morning, ${name}.`);
    const phrase=certaintyPrefix(confidence,'Yesterday asked a lot of you.');
    lines.push(phrase||'I do not want to overstate yesterday, but I see enough to keep this morning gentle.');
    lines.push('Today should not begin with more noise.');
    return {lines,permission:'Let space do some of the work.',witness:'Recent work appears to have carried load or context switching.',cost:meaning.effort_read||'The effort was not only visible output.',confidence};
  }
  if(state==='momentum_morning'||state==='midday'){
    lines.push(morning?`Good morning, ${name}.`:"You're right where I hoped you would be.");
    lines.push('The important work is moving.');
    lines.push(state==='midday'?'Do not let small requests steal the rest of your afternoon.':'Only one thing looks ready for your judgment right now.');
    return {lines,permission:'Protect the center.',witness:'Prepared work or a waiting loop is ready for attention.',cost:'Small requests could dilute the meaningful move.',confidence};
  }
  if(state==='quiet_morning'){
    lines.push(`Good morning, ${name}.`);
    lines.push('Today feels spacious.');
    return {lines,permission:"Let's keep it that way.",witness:'There is no loud signal yet.',cost:'No summary is needed.',confidence:Math.max(confidence,0.5)};
  }
  if(state==='weekend_holiday'){
    lines.push(`Good morning, ${name}.`);
    lines.push(holidayName(now)?'Today can stay lighter than a workday.':'The weekend does not need to become another work lane.');
    return {lines,permission:'Only what truly earns attention should come forward.',witness:'No urgent signal is asking to interrupt the day.',cost:'Rest and real life are part of the operating system.',confidence:Math.max(confidence,0.5)};
  }
  lines.push(`Good morning, ${name}.`);
  lines.push('Today looks clear.');
  return {lines,permission:'Use that clarity carefully instead of filling it too quickly.',witness:'The morning appears clear.',cost:'The main value is protecting space.',confidence};
}

function applyRestraintFilter({composition={},internal={},resolution={}}={}){
  const approved=[];
  const removed=[];
  for(const line of asArray(composition.lines)){
    const text=cleanText(line);
    if(!text)continue;
    if(/crushed it|amazing|incredible|unstoppable/i.test(text)){
      removed.push({line:text,reason:'not_earned'});
      continue;
    }
    if(resolution.do_not_overstate?.includes('sensitive_event_details')&&/court|custody|bereavement|medical|hearing/i.test(text)){
      removed.push({line:text,reason:'too_sensitive'});
      continue;
    }
    approved.push(text);
  }
  const things=[...asArray(internal.things_intentionally_not_mentioned)];
  if(resolution.do_not_overstate?.includes('sensitive_event_details')){
    things.push({topic:'sensitive event details',reason:'too_sensitive',confidence:resolution.confidence||0});
  }
  if(resolution.resolution==='defer_to_silence'){
    things.push({topic:'specific emotional story',reason:'low_confidence',confidence:resolution.confidence||0});
  }
  return {approved_lines:approved,removed_lines:removed,things_intentionally_not_mentioned:things};
}

function finalGate({lines=[],confidence=0.5,restraint={}}={}){
  const failed=[];
  if(!lines.length)failed.push('useful');
  if(asArray(restraint.removed_lines).some(r=>r.reason==='not_kind'))failed.push('kind');
  if(confidence<0.35)failed.push('earned');
  const passed=!failed.length;
  return {
    passed,
    failed_checks:failed,
    revision_instruction:passed?'':'Shorten and use low-confidence fallback.',
    final_display_greeting:passed?lines.join('\n'):'Good morning.\nI do not have much new signal yet.\nI will keep this quiet until something earns your attention.',
    final_greeting_lines:passed?lines:['Good morning.','I do not have much new signal yet.','I will keep this quiet until something earns your attention.']
  };
}

function buildDailyWitnessGreeting(input={}){
  const now=input.now instanceof Date?input.now:new Date(input.now||Date.now());
  const evidence=collectDailyWitnessEvidence({...input,now});
  const meaning=extractDailyWitnessMeaning({evidence,now});
  const resolution=resolveDailyWitnessContradictions({meaning,evidence});
  const state=selectGreetingState({meaning,resolution,now});
  const intent=selectGreetingIntent({state,meaning,resolution});
  const composition=composeDailyWitnessGreeting({clientName:input.clientName,state,meaning,resolution,intent,now});
  const internalUnderstanding={
    greeting_context:resolution.dominant_story,
    current_day_state:state,
    previous_day_shape:meaning.previous_day_shape,
    observed_pattern:meaning.observed_patterns[0]||'',
    emotional_load_estimate:{level:meaning.metrics?.emotionalHits>=2?'high':(meaning.metrics?.emotionalHits?'medium':'unknown'),reason:meaning.effort_read,confidence:resolution.confidence},
    confidence:resolution.confidence,
    evidence:evidence.slice(0,12),
    prepared_work:evidence.filter(e=>/draft|prepared|approval|proposal|reply/i.test(`${e.title} ${e.summary}`)).slice(0,6),
    suggested_tone:intent.primary_intent==='encourage_rest'?'spacious':(intent.primary_intent==='protect'?'protective':(intent.primary_intent==='recognize'?'warm':'quiet')),
    greeting_intent:intent,
    meaning,
    contradictions:resolution,
    things_intentionally_not_mentioned:[]
  };
  const restraint=applyRestraintFilter({composition,internal:internalUnderstanding,resolution});
  internalUnderstanding.things_intentionally_not_mentioned=restraint.things_intentionally_not_mentioned;
  const gate=finalGate({lines:restraint.approved_lines,confidence:composition.confidence,restraint});
  const userOutput={
    display_greeting:gate.final_display_greeting,
    greeting_lines:gate.final_greeting_lines,
    permission_line:composition.permission||'',
    moment_type:state,
    what_was_witnessed:composition.witness||resolution.dominant_story,
    what_it_cost_or_represented:composition.cost||meaning.effort_read||'',
    evidence:evidence.slice(0,6),
    confidence:composition.confidence,
    voice_note:intent.primary_intent
  };
  return {
    ...userOutput,
    internalUnderstanding,
    restraint,
    finalGate:gate,
    generatedAt:now.toISOString()
  };
}

module.exports={
  buildDailyWitnessGreeting,
  collectDailyWitnessEvidence,
  extractDailyWitnessMeaning,
  resolveDailyWitnessContradictions,
  selectGreetingState,
  selectGreetingIntent,
  applyRestraintFilter,
  finalGate
};
