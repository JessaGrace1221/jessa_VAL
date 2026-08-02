function safeArray(value){return Array.isArray(value)?value:[];}
function jsonValue(value,fallback){if(value==null)return fallback;if(typeof value==='string'){try{return JSON.parse(value);}catch(_){return fallback;}}return value;}
function compactText(value='',limit=400){return String(value||'').replace(/\s+/g,' ').trim().slice(0,limit);}
function cleanCommitmentText(value='',limit=400){return compactText(value,limit).replace(/^\s*[-•]\s*/,'').trim();}
function stableKey(value=''){return String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'').slice(0,180)||'commitment';}
function nowIso(){return new Date().toISOString();}

function parseDueHint(text='',now=new Date()){
  const raw=String(text||'').toLowerCase();
  const base=new Date(now);
  if(/\btoday\b/.test(raw))return base.toISOString();
  if(/\btomorrow\b/.test(raw)){base.setDate(base.getDate()+1);return base.toISOString();}
  if(/\bnext week\b/.test(raw)){base.setDate(base.getDate()+7);return base.toISOString();}
  const weekdays={sunday:0,monday:1,tuesday:2,wednesday:3,thursday:4,friday:5,saturday:6};
  const found=Object.keys(weekdays).find(day=>new RegExp(`\\b${day}\\b`).test(raw));
  if(found){
    const delta=(weekdays[found]-base.getDay()+7)||7;
    base.setDate(base.getDate()+delta);
    return base.toISOString();
  }
  return null;
}

function ownerFromText(text='',direction='',explicitOwner=''){
  const s=String(text||'').toLowerCase();
  const owner=String(explicitOwner||'').toLowerCase();
  if(owner==='user_or_team')return 'user';
  if(owner==='other')return 'contact';
  if(/\bjessa\s+to\s+\w+|\bjessa\s+(?:will|needs?|has)\s+to\b/.test(s))return 'user';
  if(/(?:^|\n|\s[-•]\s*)[a-z][a-z]+(?:\s+[a-z][a-z]+)?\s+to\s+(?:send|email|text|call|reach|follow|schedule|book|confirm|approve|review|finish|fix|create|draft|prepare|introduce|share|deliver|update|check|research|organize|build|scrape|handoff|go(?:\s+back)?|respond|reply|set|connect|compile|find)\b/.test(s))return 'contact';
  if(/\b(i will|i'll|we will|we'll|i can|we can|i need to|we need to)\b/.test(s))return direction==='inbound'?'contact':'user';
  if(/\b(can you|could you|please|you will|you'll|need you to)\b/.test(s))return direction==='outbound'?'contact':'user';
  return 'unknown';
}

function priorityFor(commitment={}){
  const text=[commitment.title,commitment.description,commitment.evidence_quote,commitment.due_hint].join(' ').toLowerCase();
  if(/\burgent|today|asap|before\b/.test(text))return 'urgent';
  if(/\btomorrow|friday|monday|deadline|signed|approval|proposal|contract\b/.test(text))return 'high';
  return 'normal';
}

function commitmentSeedText(seed={}){
  return compactText([
    seed.title,
    seed.summary,
    seed.description,
    seed.text,
    seed.source_quote,
    seed.sourceQuote,
    seed.evidence_quote,
    seed.evidenceQuote
  ].filter(Boolean).join(' '),1200);
}

function cleanActionItemLine(value=''){
  return compactText(String(value||'')
    .replace(/^\s*(?:action items?|key points?|meeting overview|hi everyone,?\s*here are[^:]*:?)/i,'')
    .replace(/^\s*[-•_]*\s*\[\s*\]\s*/,'')
    .replace(/^\s*(?:\d{1,2}[.)]|[-•_]+)\s*/,'')
    .replace(/^_([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)?)_\s*/,'$1 ')
    .replace(/\s+-\s+_?[A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){0,2}_?\s*-\s*Due\s*:?\s*[^-]*(?:-\s*)?$/i,'')
    .replace(/\s+-\s+_?Jessa\s+Grace_?\s*$/i,'')
    .replace(/\s+-\s+_?Jessa\s+Grace_?\s*-\s*Due\s*:?\s*[^.]*$/i,'')
    .replace(/\s+-\s+Due\s*:?\s*[^.]*$/i,'')
    .replace(/\s+/g,' ')
    .trim(),700);
}

function normalizeSourceRef(ref={},fallback={}){
  if(typeof ref==='string')return {
    source_type:fallback.source_type||fallback.sourceType||'source',
    source_id:fallback.source_id||fallback.sourceId||'',
    quote_or_summary:compactText(ref,500),
    confidence:Number(fallback.confidence||0.66)
  };
  if(!ref||typeof ref!=='object')return null;
  const quote=ref.quote_or_summary||ref.quoteOrSummary||ref.summary||ref.quote||ref.text||ref.title||fallback.quote_or_summary||fallback.quoteOrSummary||fallback.summary||'';
  return {
    source_type:ref.source_type||ref.sourceType||ref.type||fallback.source_type||fallback.sourceType||'source',
    source_id:ref.source_id||ref.sourceId||ref.id||fallback.source_id||fallback.sourceId||'',
    quote_or_summary:compactText(quote,500),
    confidence:Number(ref.confidence||fallback.confidence||0.66)
  };
}

function uniqueSourceRefs(values=[]){
  const seen=new Set();
  return safeArray(values)
    .map(ref=>normalizeSourceRef(ref))
    .filter(ref=>ref&&ref.quote_or_summary)
    .filter(ref=>{
      const key=[ref.source_type,ref.source_id,ref.quote_or_summary].join(':').toLowerCase();
      if(seen.has(key))return false;
      seen.add(key);
      return true;
    })
    .slice(0,10);
}

function projectHintFromContext(value=''){
  const text=String(value||'');
  if(/\bGOALL\b|Goal Agency|agency work|projections\/?dashboard|projections dashboard|dashboard handoff/i.test(text)){
    return {projectName:'GOALL',managerColorName:'Taffy',managerColorHex:'#ee78bf'};
  }
  const match=text.match(/\bproject\s+([A-Z][A-Za-z0-9&' -]{2,40})/i);
  if(match?.[1])return {projectName:compactText(match[1],80)};
  return {};
}

function relationshipHintFromSeed(seed={},commitment={}){
  return compactText(seed.counterpartyNameHint||seed.counterparty_name||seed.counterpartyName||commitment.counterparty_name||commitment.owner_name||'',120);
}

function workingBriefPrompt(commitment={},brief={}){
  const title=String(commitment.title||'this').toLowerCase();
  if(/\bdashboard\b/.test(title))return 'How can I help you finish this dashboard?';
  if(/\bproposal\b/.test(title))return 'How can I help you prepare this proposal?';
  if(/\bemail|reply|follow up|follow-up|nudge\b/.test(title))return 'How can I help you send this clearly?';
  if(/\bintro|introduc/.test(title))return 'How can I help you make this introduction?';
  if(brief.envelope?.envelopeType==='project')return 'How can I help you move this project forward?';
  return 'How can I help you finish this?';
}

function commitmentWorkingBrief(seed={},commitment={}){
  const contextSeed=[
    seed.projectName,
    seed.project_name,
    seed.source_title,
    seed.sourceTitle,
    seed.title,
    seed.description,
    seed.summary,
    seed.evidence_summary,
    seed.evidenceSummary,
    seed.evidence_quote,
    seed.source_quote,
    seed.sourceQuote,
    seed.transcriptSummary,
    seed.threadSummary,
    seed.contextSummary
  ].filter(Boolean).join(' ');
  const project=seed.projectName||seed.project_name
    ? {projectName:seed.projectName||seed.project_name,managerColorName:seed.managerColorName||'',managerColorHex:seed.managerColorHex||''}
    : projectHintFromContext(contextSeed);
  const relationship=relationshipHintFromSeed(seed,commitment);
  const envelope=project.projectName
    ? {envelopeType:'project',displayName:project.projectName,projectName:project.projectName,managerColorName:project.managerColorName||'',managerColorHex:project.managerColorHex||'',reason:'Project context wins before relationship context.'}
    : relationship
    ? {envelopeType:'relationship',displayName:relationship,relationshipName:relationship,reason:'No project was attached, so relationship context is the working envelope.'}
    : {envelopeType:'general',displayName:'General VAL context',reason:'No project or relationship was attached to this packet.'};
  const sourceRefs=uniqueSourceRefs([
    ...(safeArray(seed.source_refs||seed.sourceRefs||seed.sourceRefsJson||seed.source_refs_json)),
    ...(safeArray(seed.evidence_refs||seed.evidenceRefs||seed.evidenceRefsJson||seed.evidence_refs_json)),
    normalizeSourceRef({
      source_type:commitment.source_type,
      source_id:commitment.source_id,
      quote_or_summary:commitment.evidence_quote,
      confidence:commitment.confidence_score||0.64
    })
  ]);
  const sourceContext={
    sourceType:commitment.source_type,
    sourceId:commitment.source_id,
    sourceTitle:commitment.source_title,
    transcriptId:commitment.source_type==='transcript'?commitment.source_id:'',
    emailConversationId:commitment.source_type==='email'?commitment.source_id:'',
    runId:seed.runId||seed.run_id||'',
    commitmentId:commitment.id
  };
  const contextLines=[
    commitment.evidence_quote,
    seed.evidence_summary||seed.evidenceSummary,
    seed.transcriptSummary,
    seed.threadSummary,
    seed.contextSummary,
    sourceRefs.map(ref=>ref.quote_or_summary).join(' | ')
  ].map(line=>compactText(line,700)).filter(Boolean);
  const brief={
    objective:commitment.title,
    sourceSummary:commitment.evidence_summary,
    sourceQuote:commitment.evidence_quote,
    envelope,
    projectName:project.projectName||'',
    relationshipName:relationship||'',
    people:[relationship].filter(Boolean),
    sourceContext,
    sourceRefs,
    contextLines:Array.from(new Set(contextLines)).slice(0,8)
  };
  brief.suggestedPrompt=workingBriefPrompt(commitment,brief);
  return brief;
}

function actionItemLinesFromBlob(text=''){
  const value=String(text||'').replace(/\r/g,'\n').trim();
  if(!value)return [];
  const afterAction=(value.split(/\bAction Items?\b/i).pop()||value).split(/\bKey Points?\b/i)[0]||value;
  const numbered=afterAction
    .replace(/\s+[-•_]*\[\s*\]\s+/g,'\n- [ ] ')
    .replace(/\s+(\d{1,2}[.)]\s+)/g,'\n$1')
    .split(/\n+/)
    .flatMap(line=>line.split(/(?=\s*[-•_]*\[\s*\]\s+[A-Z])/g))
    .flatMap(line=>line.split(/(?=\s\d{1,2}[.)]\s+[A-Z])/g))
    .map(cleanActionItemLine)
    .filter(Boolean);
  const candidates=numbered.length>1?numbered:value.split(/\n+/).map(cleanActionItemLine).filter(Boolean);
  return candidates
    .filter(line=>line.length>=12&&line.length<=320)
    .filter(line=>!/\b(Key Points|Purpose of the meeting|Meeting overview|Hi everyone|Here are the Action Items)\b/i.test(line))
    .filter((line,index,list)=>list.findIndex(candidate=>candidate.toLowerCase()===line.toLowerCase())===index)
    .slice(0,24);
}

function commitmentSeedVariants(seed={}){
  const text=commitmentSeedText(seed);
  const shouldSplit=text.length>320||/\bAction Items?\b/i.test(text)||/\b\d{1,2}[.)]\s+[A-Z][^.]{8,}/.test(text);
  if(!shouldSplit)return [seed];
  const rawForSplit=[seed.source_quote,seed.sourceQuote,seed.evidence_quote,seed.evidenceQuote,seed.text,seed.summary,seed.description,seed.title]
    .map((value)=>String(value||'').trim())
    .find((value)=>/\bAction Items?\b/i.test(value)||/\b\d{1,2}[.)]\s+[A-Z][^.]{8,}/.test(value)) || text;
  const lines=actionItemLinesFromBlob(rawForSplit).filter(line=>hasExecutiveCommitmentShape({...seed,title:line,summary:line,source_quote:line}));
  if(!lines.length)return [];
  return lines.map((line,index)=>({
    ...seed,
    id:seed.id?`${seed.id}_${index+1}`:'',
    title:line,
    summary:line,
    description:line,
    source_quote:line,
    evidence_quote:line,
    evidence_summary:line
  }));
}

function looksLikeTranscriptNoise(text=''){
  const value=String(text||'').trim();
  if(!value)return true;
  if(value.length<12)return true;
  if(value.length>900)return true;
  if(/^\s*(?:i'?m going to|i am going to|we'?re going to|we are going to)\s*(?:\.{0,3})?\s*$/i.test(value))return true;
  return /\b(vulgar|coffee takes a deep breath|morning face|will do the things|we'?ll email you when it'?s ready|you'?ll see everything that has happened|so if they call,? nobody answers|not legal advice|recommend against you doing|stop watching everything|that was my child|sorry,? that was|i don'?t like it|unintelligible audio|recording download link)\b/i.test(value);
}

function ownerNameHintFromText(text=''){
  const cleaned=String(text||'').replace(/^\s*[-•]\s*/,'').trim();
  const match=cleaned.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+to\s+(?:send|email|text|call|reach|follow|schedule|book|confirm|approve|review|finish|fix|create|draft|prepare|introduce|share|deliver|update|check|research|organize|build|scrape|handoff|hand off|respond|reply|set|connect|compile|find)\b/);
  const name=match?.[1]||'';
  return /^Jessa\b/i.test(name)?'Jessa':name;
}

function hasExecutiveCommitmentShape(seed={}){
  const text=commitmentSeedText(seed);
  if(looksLikeTranscriptNoise(text))return false;
  const explicit=String(seed.owner||seed.owner_type||seed.ownerType||seed.assignedToName||seed.owner_name||seed.ownerName||'').trim();
  const actionVerb=/\b(send|email|text|call|reach out|follow up|schedule|book|confirm|approve|review|finish|fix|create|draft|prepare|introduce|share|deliver|update|check|research|organize|build|scrape|handoff|hand off|go back|circle back|respond|reply|set up|connect|meet with|compile|find)\b/i.test(text);
  const commitmentLanguage=/\b(i will|i'll|i need to|i have to|jessa to|jessa will|we will|we'll|we need to|we have to|val should|val needs to|[^.]{2,40}\bto\s+(?:send|email|text|call|reach out|follow up|schedule|book|confirm|approve|review|finish|fix|create|draft|prepare|introduce|share|deliver|update|check|research|organize|build|scrape|handoff|hand off|go(?:\s+back)?|respond|reply|set up|connect|meet with))\b/i.test(text);
  const hasTarget=/\b(to|with|for|about|before|by|on)\b\s+[A-Z0-9][A-Za-z0-9@._-]{2,}/.test(text)
    || /\b(send|email|text|call|reach out|follow up|schedule|book|confirm|approve|review|finish|fix|create|draft|prepare|introduce|share|deliver|update|check|research|organize|build|scrape|handoff|hand off|reply|set up)\s+[A-Z0-9][A-Za-z0-9@._-]{2,}/.test(text)
    || /\b(proposal|dashboard|handoff|email|meeting|call|draft|contract|calendar|pipeline|crm|transcript|document|introduction|follow[- ]?up|legal|chapter|feedback)\b/i.test(text);
  const concreteWorkObject=/\b(platform|dashboard|handoff|video|document|doc|deck|proposal|contract|agreement|email|text message|sms|calendar|invite|meeting|call|crm|pipeline|automation|workflow|scrape|list|report|brief|briefing|introduction|feedback|chapter)\b/i.test(text);
  const confident=Number(seed.confidence_score||seed.confidenceScore||seed.confidence||0);
  return Boolean(((explicit&&actionVerb&&(hasTarget||concreteWorkObject))||(commitmentLanguage&&actionVerb&&(hasTarget||concreteWorkObject))||(actionVerb&&hasTarget)) && (!confident || confident>=0.6));
}

function riskFor(commitment={}){
  const text=[commitment.title,commitment.description,commitment.evidence_quote].join(' ').toLowerCase();
  if(/\bcontract|legal|pricing|proposal|signed|approval|client|deadline|overdue\b/.test(text))return 'high';
  if(/\bfollow up|send|review|schedule|introduce|waiting\b/.test(text))return 'medium';
  return 'low';
}

function findContactByName(name='',contacts=[]){
  const target=String(name||'').trim().toLowerCase();
  if(!target)return null;
  return contacts.find(contact=>{
    const names=[contact.name,contact.contactName,contact.fullName,contact.email].filter(Boolean).map(v=>String(v).toLowerCase());
    return names.some(value=>value===target||value.includes(target)||target.includes(value));
  })||null;
}

function firstParticipantName(value){
  const participants=safeArray(value);
  const found=participants.find(p=>p&&typeof p==='object'&&(p.name||p.email));
  return found?.name||found?.email||'';
}

function applyOverride(commitment,override={}){
  if(!override)return commitment;
  return {
    ...commitment,
    status:override.status||commitment.status,
    owner_type:override.owner_type||commitment.owner_type,
    owner_name:override.owner_name||commitment.owner_name,
    owner_contact_id:override.owner_contact_id||commitment.owner_contact_id,
    task_id:override.task_id||commitment.task_id,
    draft_id:override.draft_id||commitment.draft_id,
    updated_at:override.updated_at||commitment.updated_at,
    last_touched_at:override.last_touched_at||commitment.last_touched_at,
    dismissal_reason:override.dismissal_reason||commitment.dismissal_reason
  };
}

function normalizeCommitment(seed={},contacts=[],overrides={}){
  const evidence=compactText(seed.evidence_quote||seed.source_quote||seed.summary||seed.description||seed.title,900);
  const dueAt=seed.due_at||seed.dueAt||parseDueHint(seed.due_hint||evidence);
  const ownerType=seed.owner_type||seed.ownerType||ownerFromText(evidence,seed.direction,seed.owner);
  const counterpartyName=seed.counterparty_name||seed.counterpartyName||seed.counterpartyNameHint||'';
  const ownerNameHint=seed.ownerNameHint||ownerNameHintFromText(evidence);
  const ownerName=seed.owner_name||seed.ownerName||(ownerType==='user'?'Jessa':ownerNameHint||(ownerType==='contact'?counterpartyName:''));
  const ownerContact=findContactByName(ownerName,contacts);
  const counterpartyContact=findContactByName(counterpartyName,contacts);
  const id=seed.id||stableKey(['commitment',seed.source_type||seed.sourceType,seed.source_id||seed.sourceId,evidence].join(':'));
	  const commitment={
    id,
    title:cleanCommitmentText(seed.title||evidence||'Commitment',120),
    description:cleanCommitmentText(seed.description||seed.summary||evidence,500),
    owner_type:ownerType,
    owner_contact_id:seed.owner_contact_id||seed.ownerContactId||ownerContact?.contactId||ownerContact?.id||'',
    owner_name:ownerName||ownerContact?.name||ownerContact?.email||'Unknown',
    counterparty_contact_id:seed.counterparty_contact_id||seed.counterpartyContactId||counterpartyContact?.contactId||counterpartyContact?.id||'',
    counterparty_name:counterpartyName||counterpartyContact?.name||counterpartyContact?.email||'',
    source_type:seed.source_type||seed.sourceType||'manual',
    source_id:seed.source_id||seed.sourceId||'',
    source_title:seed.source_title||seed.sourceTitle||'',
    evidence_quote:cleanCommitmentText(evidence,900),
    evidence_summary:cleanCommitmentText(seed.evidence_summary||seed.evidenceSummary||seed.description||evidence,500),
    status:seed.status||(!dueAt?'open':(new Date(dueAt)<new Date()?'overdue':'waiting')),
    priority:seed.priority||priorityFor(seed),
    risk_level:seed.risk_level||seed.riskLevel||riskFor(seed),
    due_at:dueAt,
    created_at:seed.created_at||seed.createdAt||nowIso(),
    updated_at:seed.updated_at||seed.updatedAt||nowIso(),
    last_touched_at:seed.last_touched_at||seed.lastTouchedAt||seed.created_at||seed.createdAt||nowIso(),
    next_action:seed.next_action||seed.nextAction||'Review commitment and decide the next accountable move.',
    suggested_action_type:seed.suggested_action_type||seed.suggestedActionType||(/send|follow up|reply/i.test(evidence)?'draft_email':'create_task'),
    draft_id:seed.draft_id||seed.draftId||'',
    task_id:seed.task_id||seed.taskId||'',
    crm_contact_id:seed.crm_contact_id||seed.crmContactId||ownerContact?.contactId||counterpartyContact?.contactId||'',
    crm_company_id:seed.crm_company_id||seed.crmCompanyId||ownerContact?.companyId||counterpartyContact?.companyId||'',
	    confidence_score:Number(seed.confidence_score||seed.confidenceScore||seed.confidence||0.64)
	  };
	  const workingBrief=commitmentWorkingBrief(seed,commitment);
	  commitment.workingBrief=workingBrief;
	  commitment.working_brief=workingBrief;
	  commitment.sourceRefs=workingBrief.sourceRefs;
	  commitment.source_refs=workingBrief.sourceRefs;
	  commitment.source_context=workingBrief.sourceContext;
	  if(commitment.owner_type==='contact'&&!commitment.owner_contact_id)commitment.status='needs_resolution';
	  return applyOverride(commitment,overrides[id]);
}

function transcriptSeeds(runs=[]){
  return safeArray(runs).flatMap(run=>{
    const commitments=jsonValue(run.commitmentsJson||run.commitments_json,[]);
    const linkage=jsonValue(run.linkageJson||run.linkage_json,{});
    const people=safeArray(linkage.linked_people||linkage.linkedPeople);
    const counterparty=firstParticipantName(people);
	    return safeArray(commitments).flatMap(commitmentSeedVariants).filter(hasExecutiveCommitmentShape).map((c,index)=>({
	      ...c,
	      id:stableKey(['commitment','transcript',run.transcriptId||run.transcript_id||run.id,c.id||index].join(':')),
	      runId:run.id||run.runId||run.run_id||'',
	      source_type:'transcript',
	      source_id:run.transcriptId||run.transcript_id||run.id,
	      source_title:run.finalJson?.title||run.final_json?.title||'Transcript',
	      evidence_quote:c.source_quote||c.summary||c.title,
	      evidence_refs:c.source_refs||c.sourceRefs||run.evidenceRefsJson||run.evidence_refs_json||run.sourceRefsJson||run.source_refs_json||[],
	      source_refs:c.source_refs||c.sourceRefs||run.sourceRefsJson||run.source_refs_json||run.evidenceRefsJson||run.evidence_refs_json||[],
	      transcriptSummary:run.finalJson?.summary||run.final_json?.summary||run.finalJson?.overview||run.final_json?.overview||run.finalJson?.title||run.final_json?.title||'',
	      projectName:c.projectName||c.project_name||linkage.linked_project?.name||linkage.linkedProject?.name||linkage.project?.name||'',
	      ownerNameHint:ownerNameHintFromText(c.source_quote||c.summary||c.title),
	      counterpartyNameHint:counterparty,
	      created_at:run.createdAt||run.created_at,
      updated_at:run.updatedAt||run.updated_at
    }));
  });
}

function emailSeeds(classifications=[]){
  return safeArray(classifications).flatMap(row=>{
    const commitments=jsonValue(row.commitmentsJson||row.commitments_json||row.commitments,[]);
    const context=jsonValue(row.contextJson||row.context_json||row.context,{});
    const latest=context.latest_inbound||context.latestInbound||context.current_message||context.currentMessage||{};
    const counterparty=latest.from?.name||latest.from?.email||'';
    return safeArray(commitments).flatMap(commitmentSeedVariants).filter(hasExecutiveCommitmentShape).map((c,index)=>({
      ...c,
      id:stableKey(['commitment','email',row.unifiedConversationId||row.unified_conversation_id||row.id,c.messageId||index,c.text||c.summary].join(':')),
      title:c.title||c.text||c.summary,
      description:c.summary||c.text,
	      source_type:'email',
	      source_id:row.unifiedConversationId||row.unified_conversation_id||row.id,
	      source_title:latest.subject||context.thread_summary||'Email thread',
	      evidence_quote:c.text||c.summary,
	      source_refs:c.source_refs||c.sourceRefs||row.sourceRefsJson||row.source_refs_json||[],
	      evidence_refs:c.source_refs||c.sourceRefs||row.sourceRefsJson||row.source_refs_json||[],
	      threadSummary:context.thread_summary||context.threadSummary||latest.snippet||latest.bodyPreview||'',
	      direction:c.direction||latest.direction||'',
      counterpartyNameHint:counterparty,
      created_at:row.createdAt||row.created_at,
      updated_at:row.updatedAt||row.updated_at
    }));
  });
}

function commitmentSummary(commitments=[]){
  const active=safeArray(commitments).filter(c=>!['complete','dismissed'].includes(c.status));
  return {
    you_owe:active.filter(c=>c.owner_type==='user').length,
    others_owe_you:active.filter(c=>c.owner_type==='contact'||c.owner_type==='company').length,
    overdue:active.filter(c=>c.status==='overdue').length,
    ready_for_approval:active.filter(c=>c.status==='drafted'||c.draft_id||c.task_id).length,
    needs_resolution:active.filter(c=>c.status==='needs_resolution'||c.owner_type==='unknown').length,
    total:active.length
  };
}

function createValCommitmentsService({
  getStore=()=>({}),
  saveStore=()=>{},
  hasPg=()=>false,
  dbQuery=null,
  uuid=(prefix)=>`${prefix}_${Date.now().toString(36)}`,
  tenantId=()=>'default',
  userId=()=>'default',
  listRelationshipContacts=async()=>[],
  saveDraft=null,
  saveTask=null
}={}){
  function store(){
    const s=getStore()||{};
    for(const key of ['valCommitmentOverrides','transcriptIntelligenceRuns','conversationClassifications'])if(!Array.isArray(s[key]))s[key]=[];
    return s;
  }
  async function loadTranscriptRuns(){
    if(hasPg()&&dbQuery){
      const r=await dbQuery(`select * from transcript_intelligence_runs where tenant_id=$1 and user_id=$2 order by created_at desc limit 120`,[tenantId(),userId()]).catch(()=>({rows:[]}));
      return r.rows||[];
    }
    return store().transcriptIntelligenceRuns.filter(r=>r.tenantId===tenantId()&&r.userId===userId()).slice(0,120);
  }
  async function loadEmailClassifications(){
    if(hasPg()&&dbQuery){
      const r=await dbQuery(`select * from conversation_classifications where tenant_id=$1 and user_id=$2 order by created_at desc limit 120`,[tenantId(),userId()]).catch(()=>({rows:[]}));
      return r.rows||[];
    }
    return store().conversationClassifications.filter(r=>r.tenantId===tenantId()&&r.userId===userId()).slice(0,120);
  }
  async function overrides(){
    if(hasPg()&&dbQuery){
      const r=await dbQuery(`select * from val_commitment_overrides where tenant_id=$1 and user_id=$2`,[tenantId(),userId()]).catch(()=>({rows:[]}));
      return Object.fromEntries((r.rows||[]).map(row=>[row.id,row]));
    }
    return Object.fromEntries(store().valCommitmentOverrides.filter(r=>r.tenantId===tenantId()&&r.userId===userId()).map(r=>[r.id,r]));
  }
  async function list({status='',ownerType='',limit=100}={}){
    const contacts=await listRelationshipContacts().catch(()=>[]);
    const over=await overrides();
    const seeds=transcriptSeeds(await loadTranscriptRuns()).concat(emailSeeds(await loadEmailClassifications()));
    const byId=new Map();
    for(const seed of seeds){
      const commitment=normalizeCommitment(seed,contacts,over);
      if(commitment.owner_type==='unknown')continue;
      if(!byId.has(commitment.id))byId.set(commitment.id,commitment);
    }
    let commitments=Array.from(byId.values()).sort((a,b)=>String(b.updated_at||'').localeCompare(String(a.updated_at||'')));
    if(status)commitments=commitments.filter(c=>c.status===status);
    if(ownerType)commitments=commitments.filter(c=>c.owner_type===ownerType);
    commitments=commitments.slice(0,Math.max(1,Math.min(Number(limit)||100,200)));
    return {ok:true,commitments,summary:commitmentSummary(commitments),empty:commitments.length===0};
  }
  async function get(id){
    return (await list({limit:200})).commitments.find(c=>c.id===id)||null;
  }
  async function saveOverride(id,patch={}){
    const row={id,tenantId:tenantId(),userId:userId(),...patch,updated_at:nowIso(),last_touched_at:nowIso()};
    if(hasPg()&&dbQuery){
      const result=await dbQuery(`
        insert into val_commitment_overrides (
          id, tenant_id, user_id, status, owner_type, owner_name, owner_contact_id,
          task_id, draft_id, dismissal_reason, last_touched_at, updated_at
        ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
        on conflict (tenant_id,user_id,id) do update set
          status=coalesce(excluded.status,val_commitment_overrides.status),
          owner_type=coalesce(excluded.owner_type,val_commitment_overrides.owner_type),
          owner_name=coalesce(excluded.owner_name,val_commitment_overrides.owner_name),
          owner_contact_id=coalesce(excluded.owner_contact_id,val_commitment_overrides.owner_contact_id),
          task_id=coalesce(excluded.task_id,val_commitment_overrides.task_id),
          draft_id=coalesce(excluded.draft_id,val_commitment_overrides.draft_id),
          dismissal_reason=coalesce(excluded.dismissal_reason,val_commitment_overrides.dismissal_reason),
          last_touched_at=excluded.last_touched_at,
          updated_at=excluded.updated_at
        returning *
      `,[
        row.id,row.tenantId,row.userId,row.status||null,row.owner_type||null,row.owner_name||null,row.owner_contact_id||null,
        row.task_id||null,row.draft_id||null,row.dismissal_reason||null,row.last_touched_at,row.updated_at
      ]);
      return result.rows?.[0]||row;
    }
    const s=store();
    const idx=s.valCommitmentOverrides.findIndex(r=>r.id===id&&r.tenantId===tenantId()&&r.userId===userId());
    if(idx>=0)s.valCommitmentOverrides[idx]={...s.valCommitmentOverrides[idx],...row};else s.valCommitmentOverrides.unshift(row);
    saveStore(s);
    return row;
  }
  async function updateStatus(id,{status,reason=''}={}){
    const allowed=['open','waiting','drafted','delegated','complete','dismissed','overdue','needs_resolution'];
    if(!allowed.includes(status))throw new Error('Unsupported commitment status');
    await saveOverride(id,{status,dismissal_reason:reason});
    return {ok:true,commitment:await get(id),no_external_action:true};
  }
  async function draftEmail(id){
    const commitment=await get(id);
    if(!commitment)throw new Error('Commitment not found');
    if(typeof saveDraft!=='function')throw new Error('Draft writer unavailable');
    const draft=await saveDraft({
      draftType:'commitment_follow_up',
      provider:'internal',
      subject:'Follow-up: '+commitment.title,
      body:[
        commitment.counterparty_name||commitment.owner_name ? `Hi ${commitment.counterparty_name||commitment.owner_name},` : 'Hi,',
        '',
        'I wanted to follow up on this:',
        commitment.evidence_quote,
        '',
        'Does this still look right as the next step?',
        '',
        'Best,'
      ].join('\n'),
      status:'draft',
      sourceContext:{source:'commitment_ledger',commitmentId:id,sourceType:commitment.source_type,sourceId:commitment.source_id,noExternalAction:true}
    });
    await saveOverride(id,{status:'drafted',draft_id:draft.id});
    return {ok:true,draft,commitment:await get(id),no_external_action:true};
  }
  async function createTask(id){
    const commitment=await get(id);
    if(!commitment)throw new Error('Commitment not found');
    if(typeof saveTask!=='function')throw new Error('Task writer unavailable');
    const task={id:uuid('task'),title:commitment.title,contactName:commitment.owner_type==='user'?commitment.counterparty_name:commitment.owner_name,contactId:commitment.crm_contact_id||commitment.owner_contact_id||commitment.counterparty_contact_id||'',dueDate:commitment.due_at,priority:commitment.priority==='urgent'?'high':commitment.priority,notes:[commitment.description,`Evidence: ${commitment.evidence_quote}`,`Source: ${commitment.source_type} ${commitment.source_title}`].filter(Boolean).join('\n\n'),details:[{text:`Created from Commitments Ledger: ${id}`,ts:nowIso()}],completed:false,createdAt:nowIso(),source:'commitments_ledger',sourceCommitmentId:id,noExternalAction:true};
    await saveTask(task);
    await saveOverride(id,{status:'waiting',task_id:task.id});
    return {ok:true,task,commitment:await get(id),no_external_action:true};
  }
  return {list,get,updateStatus,draftEmail,createTask,normalizeCommitment,commitmentSummary};
}

module.exports={createValCommitmentsService,normalizeCommitment,transcriptSeeds,emailSeeds,parseDueHint,ownerFromText,commitmentSummary,hasExecutiveCommitmentShape,commitmentSeedVariants,actionItemLinesFromBlob};
