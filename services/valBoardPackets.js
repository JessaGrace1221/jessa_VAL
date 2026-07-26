const crypto=require('node:crypto');

const BOARD_OBSERVERS = [
  'Executive Inbox',
  'Relationship',
  'Project',
  'Capacity',
  'Courage',
  'Delight',
  'Opportunity',
  'Momentum',
  'Meaning',
  'Synchronicity',
  'Commitment',
  'Calendar',
  'Environment',
  'Witnessing'
];
const OBSERVER_REVIEW_VERSION = 2;
const MODEL_OBSERVER_REVIEW_VERSION = 5;

const PRIMARY_ROUTES = Object.freeze({
  email_attention_packet:['Courage','Relationship','Commitment','Opportunity','Executive Inbox'],
  draft_review_packet:['Courage','Relationship','Commitment','Executive Inbox'],
  reply_pressure_packet:['Courage','Relationship','Commitment','Capacity','Executive Inbox'],
  meeting_context_packet:['Capacity','Relationship','Commitment','Calendar','Environment'],
  capacity_window_packet:['Capacity','Calendar','Environment'],
  prep_timing_packet:['Capacity','Calendar','Commitment'],
  meeting_evidence_packet:['Meaning','Project','Momentum','Witnessing','Commitment'],
  decision_trace_packet:['Meaning','Courage','Project','Synchronicity'],
  task_extraction_packet:['Momentum','Commitment','Project','Executive Inbox'],
  identity_context_packet:['Meaning','Capacity','Delight','Synchronicity','Courage','Witnessing'],
  relational_context_packet:['Relationship','Delight','Meaning','Synchronicity','Witnessing'],
  operating_context_packet:['Capacity','Environment','Commitment','Momentum','Witnessing'],
  convergence_packet:['Meaning','Opportunity','Relationship','Capacity','Synchronicity'],
  timing_cluster_packet:['Opportunity','Calendar','Capacity','Synchronicity'],
  pattern_echo_packet:['Meaning','Relationship','Witnessing','Synchronicity'],
  approval_packet:['Momentum','Commitment','Executive Inbox','Meaning'],
  task_packet:['Momentum','Commitment','Project','Capacity'],
  sent_action_packet:['Executive Inbox','Relationship','Commitment','Momentum'],
  learning_packet:['Meaning','Witnessing','Synchronicity','Delight'],
  cowork_packet:['Meaning','Momentum','Commitment','Witnessing'],
  document_packet:['Meaning','Project','Commitment','Witnessing'],
  relationship_packet:['Relationship','Delight','Commitment','Meaning'],
  project_packet:['Project','Momentum','Capacity','Commitment']
});

const BOARD_SOURCE_REGISTRY = Object.freeze([
  {
    sourceType:'email',
    label:'Email sync',
    status:'live',
    hook:'canonical source intake from Gmail/Outlook sync and classified attachment evidence',
    packetTypes:['email_attention_packet'],
    claim:'Every new or changed Gmail/Outlook message version receives an immutable source receipt before Board review.'
  },
  {
    sourceType:'transcript',
    label:'Transcripts',
    status:'live',
    hook:'processTranscriptPayload.processCanonicalBoardEvidence',
    packetTypes:['meeting_evidence_packet'],
    claim:'Every processed transcript version keeps its full text in one immutable source lineage before Board review.'
  },
  {
    sourceType:'calendar_event',
    label:'Calendar events',
    status:'live',
    hook:'calendar provider reads and saved VAL events through canonical source intake',
    packetTypes:['meeting_context_packet'],
    claim:'Every new or changed calendar event version receives an immutable source receipt before Board review.'
  },
  {
    sourceType:'witnessing',
    label:'Witnessing Session',
    status:'live',
    hook:'teach-val/onboarding save, confirm, and commit through canonical source intake',
    packetTypes:['identity_context_packet','relational_context_packet','operating_context_packet'],
    claim:'Witnessing answers and committed onboarding memory become foundational Board packets.'
  },
  {
    sourceType:'cowork',
    label:'Co-Work conversations',
    status:'live',
    hook:'valCoworkRoutes.afterCoworkEvent through canonical source intake',
    packetTypes:['cowork_packet'],
    claim:'Co-Work open, response, and apply events become Board packets.'
  },
  {
    sourceType:'external_action',
    label:'External action packets',
    status:'live',
    hook:'valExternalActionsRoutes.afterExternalActionPacket through canonical source intake',
    packetTypes:['approval_packet','task_packet','sent_action_packet'],
    claim:'Prepared, approved, and executed external action packets become Board packets.'
  },
  {
    sourceType:'draft',
    label:'Prepared drafts',
    status:'live',
    hook:'saveInternalDraft through canonical source intake',
    packetTypes:['draft_review_packet'],
    claim:'Every saved internal draft becomes a reviewable Board packet with its source context attached.'
  },
  {
    sourceType:'sms',
    label:'SMS',
    status:'live',
    hook:'GHL conversation sync/send plus canonical /api/val/board/events/sms ingress',
    packetTypes:['sent_action_packet','relationship_packet'],
    claim:'Every captured SMS exchange or send receipt enters canonical source processing before Board review.'
  },
  {
    sourceType:'linkedin_visibility',
    label:'LinkedIn Visibility',
    status:'live',
    hook:'LinkedIn draft and meeting-prep context plus canonical source-event ingress',
    packetTypes:['relationship_packet','learning_packet'],
    claim:'Captured LinkedIn drafts and visibility evidence enter canonical source processing before Board review.'
  },
  {
    sourceType:'document',
    label:'Documents and uploads',
    status:'live',
    hook:'immutable knowledge-document and relationship-attachment source intake',
    packetTypes:['document_packet','learning_packet'],
    claim:'Every readable document version enters one immutable source lineage. About Me documents receive an individual, source-backed review from all 14 Observers.'
  },
  {
    sourceType:'task',
    label:'Tasks and commitments',
    status:'live',
    hook:'canonical work and commitment lifecycle events',
    packetTypes:['task_packet'],
    claim:'Created or completed user commitments become Board packets automatically.'
  },
  {
    sourceType:'relationship_profile',
    label:'Stewardship profiles',
    status:'live',
    hook:'saveRelationshipProfile through canonical source intake',
    packetTypes:['relationship_packet'],
    claim:'Relationship profile changes become Board packets automatically.'
  },
  {
    sourceType:'project_profile',
    label:'Project profiles',
    status:'live',
    hook:'saveRelationshipProfile profileType=project through canonical source intake',
    packetTypes:['project_packet'],
    claim:'Project profile changes become Board packets automatically.'
  },
  {
    sourceType:'public_research',
    label:'Public research',
    status:'live',
    hook:'meeting prep, lead research, and canonical source-event ingress',
    packetTypes:['document_packet','relationship_packet','project_packet'],
    claim:'Captured Apollo, Outscraper, and public-web research enters canonical source processing before Board review.'
  },
  {
    sourceType:'ghl_voice',
    label:'GHL Voice',
    status:'live',
    hook:'POST /api/val/ghl/voice-turn recordCoworkEvent sourceType=ghl_voice',
    packetTypes:['cowork_packet','relationship_packet','sent_action_packet'],
    claim:'GHL voice turns become Board packets automatically when the voice webhook calls VAL.'
  },
  {
    sourceType:'ghl_text',
    label:'GHL Text Chat',
    status:'live',
    hook:'POST /api/val/chat channel=ghl_text',
    packetTypes:['cowork_packet','relationship_packet','sent_action_packet'],
    claim:'GHL text/chat turns become Board packets automatically when the GHL workflow calls VAL with channel=ghl_text.'
  }
]);

function boardSourceByType(sourceType=''){
  return BOARD_SOURCE_REGISTRY.find(source=>source.sourceType===sourceType)||null;
}

function safeArray(value){return Array.isArray(value)?value:[];}
function compactText(value,limit=900){return String(value||'').replace(/\s+/g,' ').trim().slice(0,limit);}
function normalizedEvidenceText(value=''){
  return String(value||'').replace(/\s+/g,' ').trim().toLowerCase();
}
function evidenceHash(value=''){
  return crypto.createHash('sha256').update(normalizedEvidenceText(value)).digest('hex').slice(0,24);
}
const INELIGIBLE_OBSERVATION_SOURCE_TYPES=new Set([
  'assistant_response','system_event','tool_error','observer_output','observer_summary','chief_of_staff_output'
]);
const UNRESOLVED_MERGE_FIELD_RE=/\{\{\s*[^{}]+\s*\}\}|\bcustom\.user_request\b|\bmessage\.body\b|\bcontact\.(?:full_name|id)\b/i;
const EXECUTION_ERROR_RE=/\b(?:connected inbox windows|only seeing the placeholder text|could not find a matching email|try a sender, subject word, or date range|VAL could not finish|VAL took longer than expected|tool (?:failed|error)|request failed|invalid url)\b/i;

function observationSourceContent(source={}){
  const refs=safeArray(source.sourceRefs||source.sourceRefsJson||source.source_refs_json);
  return compactText([
    source.summary,
    source.description,
    source.content,
    source.text,
    source.message,
    source.body,
    source.rawResponse,
    refs.map(ref=>ref.quote_or_summary||ref.quoteOrSummary||ref.summary||ref.quote||'').join(' ')
  ].filter(Boolean).join(' '),12000);
}

function validateObservationSource(source={}){
  const sourceType=registrySourceKey(source.sourceType||source.source_type||source.type||'manual');
  const sourceId=String(source.sourceId||source.source_id||source.id||'').trim();
  const cleanContent=observationSourceContent(source);
  const payload=source.payloadJson||source.payload||{};
  const generatedBy=String(source.generatedBy||source.generated_by||payload.generatedBy||payload.generated_by||'').trim();
  const isGeneratedContent=source.isGeneratedContent===true||source.is_generated_content===true||
    payload.isGeneratedContent===true||payload.is_generated_content===true||
    /^(?:observer|chief_of_staff|val_board|board_synthesis)/i.test(generatedBy);
  let rejectionReason='';
  if(INELIGIBLE_OBSERVATION_SOURCE_TYPES.has(sourceType))rejectionReason=`${sourceType} is execution history, not Observer evidence.`;
  else if(isGeneratedContent)rejectionReason='Generated Board or assistant content cannot be re-ingested as source evidence.';
  else if(UNRESOLVED_MERGE_FIELD_RE.test(cleanContent))rejectionReason='The source contains unresolved merge fields.';
  else if(EXECUTION_ERROR_RE.test(cleanContent))rejectionReason='The source is a tool or execution failure, not human evidence.';
  else if(!cleanContent)rejectionReason='The source contains no usable evidence.';
  return {
    valid:!rejectionReason,
    rejectionReason,
    cleanContent,
    sourceType,
    sourceId,
    generatedBy,
    isGeneratedContent,
    contentHash:evidenceHash(cleanContent)
  };
}
function jsonValue(value,fallback){
  if(value==null)return fallback;
  if(typeof value==='string'){
    try{return JSON.parse(value);}catch(_){return fallback;}
  }
  return value;
}
function stableKey(value=''){
  return String(value||'').toLowerCase().replace(/[^a-z0-9:_-]+/g,'_').replace(/^_+|_+$/g,'').slice(0,220);
}
function toCamelRow(row={}){
  const out={};
  for(const [key,value] of Object.entries(row||{})){
    const camel=key.replace(/_([a-z])/g,(_,c)=>c.toUpperCase());
    out[camel]=value instanceof Date?value.toISOString():value;
  }
  for(const key of ['routeObserversJson','primaryObserversJson','sourceRefsJson','payloadJson']){
    if(Object.hasOwn(out,key))out[key]=jsonValue(out[key],/Observers|Refs/.test(key)?[]:{});
  }
  return out;
}
function normalizeSourceRef(ref={}){
  return {
    source_type:String(ref.source_type||ref.sourceType||ref.type||'unknown'),
    source_id:String(ref.source_id||ref.sourceId||ref.id||''),
    quote_or_summary:compactText(ref.quote_or_summary||ref.quoteOrSummary||ref.summary||ref.quote||'',900),
    confidence:Math.max(0,Math.min(1,Number(ref.confidence)||0.65)),
    created_at:ref.created_at||ref.createdAt||new Date().toISOString(),
    source_link:String(ref.source_link||ref.sourceLink||ref.url||'')
  };
}
function routeReason(observerName='',packetType='',sourceType=''){
  const observer=String(observerName||'');
  const source=String(sourceType||'source').replace(/_/g,' ');
  const reasons={
    'Executive Inbox':`This ${source} may create communication attention, reply pressure, or a future loop.`,
    Relationship:`This ${source} may change warmth, trust, repair, distance, or mutual value.`,
    Project:`This ${source} may affect project movement, blockers, dependencies, or useful work.`,
    Capacity:`This ${source} may change tradeoffs, timing, energy, or decision quality.`,
    Courage:`This ${source} may reveal avoidance, softened truth, or a decision that needs plain language.`,
    Delight:`This ${source} may protect energy, curiosity, aliveness, or connection.`,
    Opportunity:`This ${source} may reveal an opening, timing window, or emerging value.`,
    Momentum:`This ${source} may clarify whether movement is real or only activity.`,
    Meaning:`This ${source} may connect to values, story, repeated themes, or what matters.`,
    Synchronicity:`This ${source} may be part of a repeated arrival or cross-context echo.`,
    Commitment:`This ${source} may contain a promise, obligation, follow-up, or trust-protecting loop.`,
    Calendar:`This ${source} may affect schedule reality, preparation, or protected time.`,
    Environment:`This ${source} may depend on location, travel, body, interruption, or external conditions.`,
    Witnessing:`This ${source} may confirm, challenge, or refine the user's directly revealed context.`
  };
  return reasons[observer]||`This packet is visible to ${observer} for context.`;
}
function observerRoutes(packetType='',sourceType='',packet=null){
  const primary=new Set(PRIMARY_ROUTES[packetType]||[]);
  return BOARD_OBSERVERS.map(observerName=>{
    const signal=packet?observerMeaningfulSignal(observerName,packet):null;
    return {
      observerName,
      observerId:stableKey(observerName),
      primary:primary.has(observerName),
      routingConfidence:signal?.meaningful?signal.confidence:0,
      routingReason:signal?.meaningful?signal.reason:'Delivered for review; no deterministic deduction is claimed.',
      supportingExcerpt:signal?.meaningful?signal.supportingExcerpt:'',
      sourceId:String(packet?.sourceId||''),
      reason:routeReason(observerName,packetType,sourceType)
    };
  });
}
function packetId(uuid,scope,sourceType,sourceId,packetType){
  return stableKey(`board_${scope.tenantId}_${scope.userId}_${sourceType}_${sourceId}_${packetType}`)||uuid('boardpacket');
}
function registrySourceKey(packetSourceType=''){
  const source=String(packetSourceType||'').toLowerCase();
  if(source==='email'||source==='email_sync'||source==='gmail'||source==='gmail_email'||source==='outlook'||source==='outlook_email'||source==='email_message'||source==='unified_conversation')return 'email';
  if(source==='transcript'||source==='krisp'||source==='uploaded_transcript')return 'transcript';
  if(source==='calendar_event'||source==='calendar'||source==='google_calendar'||source==='outlook_calendar')return 'calendar_event';
  if(source==='witnessing'||source==='teach_val_onboarding')return 'witnessing';
  if(source==='cowork'||source==='co_work'||source==='observer_chat')return 'cowork';
  if(source==='external_action'||source==='home_email_action')return 'external_action';
  if(source==='sms'||source==='ghl_sms')return 'sms';
  if(source==='linkedin'||source==='linkedin_visibility')return 'linkedin_visibility';
  if(source==='document'||source==='knowledge_document'||source==='upload'||source==='google_doc'||source==='attachment')return 'document';
  if(source==='task'||source==='commitment')return 'task';
  if(source==='relationship'||source==='relationship_profile'||source==='contact')return 'relationship_profile';
  if(source==='project'||source==='project_profile')return 'project_profile';
  if(source==='public_research'||source==='apollo'||source==='outscraper'||source==='web_research')return 'public_research';
  if(source==='ghl_voice'||source==='voice')return 'ghl_voice';
  if(source==='ghl_text'||source==='ghl_chat'||source==='text_chat'||source==='ghl_conversation')return 'ghl_text';
  return source;
}

const OBSERVER_SIGNAL_TERMS = Object.freeze({
  'Executive Inbox':['email','reply','inbox','message','draft','send','conversation','intro','communication','thread'],
  Relationship:['relationship','trust','warmth','repair','distance','person','people','contact','mike','michelle','aric','tone'],
  Project:['project','goall','dashboard','handoff','proposal','milestone','workstream','owner','deliverable','build'],
  Capacity:['capacity','time','calendar','energy','tradeoff','bandwidth','deadline','timing','overload','window'],
  Courage:['courage','avoid','hard','plain','challenge','risk','decision','truth','hesitation','pushback'],
  Delight:['delight','joy','curiosity','life','energy','warmth','restore','connection','play','alive'],
  Opportunity:['opportunity','opening','lead','revenue','proposal','sale','value','timing','window','introduction'],
  Momentum:['momentum','move','next','progress','stuck','blocked','finish','done','handoff','forward'],
  Meaning:['meaning','value','purpose','why','story','pattern','matters','important','alignment','vision'],
  Synchronicity:['synchronicity','pattern','echo','again','repeat','theme','timing','coincidence','signal'],
  Commitment:['commitment','promise','follow up','follow-up','task','owed','due','owner','action item','loop'],
  Calendar:['calendar','meeting','appointment','schedule','today','tomorrow','monday','friday','time','prep'],
  Environment:['environment','room','travel','location','body','interrupt','context','setting','external','conditions'],
  Witnessing:['witnessing','witness','onboarding','values','revealed','said','identity','preference','remember','protect']
});

function packetSearchText(packet={}){
  return [
    packet.title,
    packet.summary,
    packet.packetType,
    packet.sourceType,
    safeArray(packet.sourceRefsJson).map(ref=>ref.quote_or_summary||ref.quoteOrSummary||ref.summary||ref.quote).join(' '),
    JSON.stringify(packet.payloadJson||{})
  ].filter(Boolean).join(' ').toLowerCase();
}

const STOP_NAME_WORDS = new Set([
  'VAL','CRM','GHL','HTML','CSS','SMS','API','MCP','URL','PDF','CEO','COO',
  'Jessa','Grace','Please','Thanks','Thank','Sorry','Good','Morning','Afternoon','Evening',
  'Your','Receipt','Document','Invoice','Fwd','Today','Update','Question','Response',
  'Master','Edits','Voice','User','Try','Send','Check','Hot','The','Meeting',
  'Documents','Attachment','Attachments','Invoices','Receipts','Payment','Payments',
  'Google','Workspace','Google Workspace','Google Payments','Available','Account','Accounts',
  'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday',
  'Action','Items','Key','Points','Source','Transcript','Meeting','Calendar',
  'Project','Relationship','Capacity','Courage','Delight','Meaning','Momentum',
  'Commitment','Environment','Witnessing','Opportunity','Synchronicity',
  'Executive','Inbox','Chief','Staff','Board','Observer','Observers'
]);

function packetEvidenceText(packet={}){
  const refs=safeArray(packet.sourceRefsJson).map(normalizeSourceRef);
  const bestRef=refs.find(ref=>ref.quote_or_summary)||refs[0]||null;
  return compactText(bestRef?.quote_or_summary||packet.summary||packet.title||'',900);
}

function packetTextForExtraction(packet={}){
  return compactText([
    packet.title,
    packet.summary,
    packetEvidenceText(packet),
    JSON.stringify(packet.payloadJson||{})
  ].filter(Boolean).join(' '),5000);
}

function uniqueClean(values=[],limit=8){
  const seen=new Set();
  return safeArray(values)
    .map(value=>compactText(value,80).replace(/^[-:;,.]+|[-:;,.]+$/g,'').trim())
    .filter(Boolean)
    .filter(value=>!STOP_NAME_WORDS.has(value))
    .filter(value=>{
      const key=value.toLowerCase();
      if(seen.has(key))return false;
      seen.add(key);
      return true;
    })
    .slice(0,limit);
}

function collectNamedValues(value,keys=[],result=[],depth=0){
  if(depth>5||value==null)return result;
  if(Array.isArray(value)){
    value.forEach(item=>collectNamedValues(item,keys,result,depth+1));
    return result;
  }
  if(typeof value==='object'){
    for(const [key,item] of Object.entries(value)){
      if(keys.includes(key)&&typeof item==='string')result.push(item);
      collectNamedValues(item,keys,result,depth+1);
    }
  }
  return result;
}

function packetPeople(packet={}){
  const payload=packet.payloadJson||{};
  const structured=collectNamedValues(payload,[
    'name','contactName','contact_name','personName','person_name',
    'senderName','sender_name','fromName','from_name','attendeeName','attendee_name',
    'relationshipName','relationship_name','counterpartyName','counterparty_name',
    'ownerName','owner_name','assignedToName','assigned_to_name'
  ]);
  const source=registrySourceKey(packet.sourceType||packet.source_type);
  const allowsTitleNames=['email','transcript','calendar_event','cowork','ghl_voice','ghl_text','sms','relationship_profile'].includes(source);
  const capitalized=allowsTitleNames
    ? Array.from(String(packet.title||'').matchAll(/\b([A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,})?)\b/g)).map(match=>match[1])
    : [];
  return uniqueClean([...structured,...capitalized],8);
}

function packetProjects(packet={}){
  const payload=packet.payloadJson||{};
  const structured=collectNamedValues(payload,[
    'project','projectName','project_name','projectTitle','project_title',
    'canonicalProjectName','canonical_project_name'
  ]);
  const text=packetTextForExtraction(packet);
  const explicit=[];
  if(/\bGOALL\b/i.test(text))explicit.push('GOALL');
  return uniqueClean([...structured,...explicit],6);
}

function packetDecisionNouns(packet={}){
  const text=packetTextForExtraction(packet);
  const nouns=[];
  if(/\bdashboard|iframe|html|css|embed\b/i.test(text))nouns.push('dashboard handoff');
  if(/\bproposal|pricing|rate|payment|structure\b/i.test(text))nouns.push('proposal or payment decision');
  if(/\bintro|introduction|introduce\b/i.test(text))nouns.push('introduction');
  if(/\bfollow[- ]?up|reply|respond|email|sms|text\b/i.test(text))nouns.push('follow-up');
  if(/\bcalendar|meeting|appointment|schedule\b/i.test(text))nouns.push('meeting timing');
  if(/\btask|commitment|action item|promise|owed\b/i.test(text))nouns.push('commitment');
  return uniqueClean(nouns,4);
}

function observerMeaningfulSignal(observerName='',packet={}){
  const primary=safeArray(packet.primaryObserversJson).includes(observerName);
  const text=packetSearchText(packet);
  const source=registrySourceKey(packet.sourceType||packet.source_type);
  const people=packetPeople(packet);
  const projects=packetProjects(packet);
  const patterns={
    'Executive Inbox':['email','ghl_voice','ghl_text','sms'].includes(source)&&/\b(reply|respond|send|email|message|introduction|follow[- ]?up)\b/i.test(text),
    Relationship:people.length>0&&(/\b(frustrat\w*|tension|repair|distance|trust|warmth|tone|connection|relationship)\b/i.test(text)||source==='relationship_profile'),
    Project:(projects.length>0&&/\b(block|handoff|deliver|scope|owner|milestone|build|finish|project)\b/i.test(text))||source==='project_profile',
    Capacity:/\b(no bandwidth|cannot take on|can't take on|overload|overwhelmed|exhausted|fatigue|back[- ]to[- ]back|too many meetings|competing deadlines|capacity constraint|need recovery|decision load)\b/i.test(text),
    Courage:/\b(avoid|avoided|hesitat|softened truth|pushback|hard choice|needs? directness|not saying)\b/i.test(text),
    Delight:/\b(joy|delight|curiosity|relief|restore|grounding|play|alive|energized)\b/i.test(text),
    Opportunity:/\b(opportunity|revenue|proposal|pricing|sale|lead|opening|introduction|mutual value)\b/i.test(text),
    Momentum:/\b(stuck|blocked|finished|completed|handoff|next step|moved forward|lost momentum)\b/i.test(text),
    Meaning:/\b(value|purpose|meaning|larger story|matters|vision|mission)\b/i.test(text),
    Synchronicity:/\b(repeated|again|echo|recurring pattern|convergence|coincidence|timing cluster)\b/i.test(text),
    Commitment:source==='task'||/\b(commitment|promise|follow[- ]?up|action item|owed|due|owner|open loop)\b/i.test(text),
    Calendar:source==='calendar_event'||/\b(meeting|appointment|schedule|calendar|preparation window)\b/i.test(text),
    Environment:/\b(environment|room|travel|location|weather|physical space|interruption|external condition)\b/i.test(text),
    Witnessing:source==='witnessing'||/\b(witnessing|onboarding|revealed preference|asked VAL to remember|protect this)\b/i.test(text)
  };
  const meaningful=Boolean(patterns[observerName]);
  return {
    meaningful,
    matched:[],
    primary,
    confidence:meaningful?0.72:0,
    reason:meaningful?`The complete source contains a concrete ${observerName} signal.`:'No deterministic signal.',
    supportingExcerpt:meaningful?compactText(packetEvidenceText(packet),260):''
  };
}

function observerEvidence(packet={}){
  const refs=safeArray(packet.sourceRefsJson).map(normalizeSourceRef);
  const bestRef=refs.find(ref=>ref.quote_or_summary)||refs[0]||null;
  return {
    sourceType:packet.sourceType,
    sourceId:packet.sourceId,
    packetType:packet.packetType,
    packetTitle:packet.title,
    quoteOrSummary:bestRef?.quote_or_summary||packet.summary||packet.title||'Source receipt exists but no excerpt was attached.',
    confidence:bestRef?.confidence||0.65,
    sourceCreatedAt:bestRef?.created_at||packet.createdAt||'',
    sourceLink:bestRef?.source_link||bestRef?.sourceLink||packet.payloadJson?.sourceLink||''
  };
}

function observerLensFinding(observerName='',packet={},signal={}){
  const evidence=observerEvidence(packet);
  const source=String(packet.sourceType||'source').replace(/_/g,' ');
  const people=packetPeople(packet);
  const projects=packetProjects(packet);
  const nouns=packetDecisionNouns(packet);
  const personLine=people.length ? people.join(', ') : '';
  const projectLine=projects.length ? projects.join(', ') : '';
  const objectLine=nouns.length ? nouns.join(', ') : compactText(packet.title||packet.summary||'this packet',120);
  const quote=compactText(evidence.quoteOrSummary,260);
  if(!signal.meaningful){
    return `No meaningful ${observerName} signal in ${source} "${compactText(packet.title||packet.packetType,120)}".`;
  }
  const friction=/\b(frustrat|tension|conflict|repair|distance|cold|upset|concern|pushback)\b/i.test(quote);
  const templates={
    'Executive Inbox':`${personLine ? personLine+' is named in ' : 'This '}communication may need reply judgment. Source: ${quote}`,
    Relationship:`${personLine || 'This relationship'} ${friction ? 'shows a possible trust or repair signal' : 'has a relationship signal worth inspecting'}. Source: ${quote}`,
    Project:`${projectLine || 'This project'} contains work around ${objectLine}. Source: ${quote}`,
    Capacity:`This may change timing or decision load around ${objectLine}. Source: ${quote}`,
    Courage:`There may be a decision to name plainly instead of letting ${objectLine} stay vague. Evidence: ${quote}`,
    Delight:`I am checking whether energy, warmth, or curiosity is being protected around ${objectLine}. Evidence: ${quote}`,
    Opportunity:`There may be an opening around ${objectLine}${personLine ? ' with '+personLine : ''}. Evidence: ${quote}`,
    Momentum:`The movement signal is ${objectLine}. Something either needs to move, close, or be handed off. Evidence: ${quote}`,
    Meaning:`The larger meaning is attached to ${objectLine}. Evidence: ${quote}`,
    Synchronicity:`This may be part of a repeated pattern or timing cluster around ${objectLine}. Evidence: ${quote}`,
    Commitment:`This is about a promise, owner, or open loop around ${objectLine}. Evidence: ${quote}`,
    Calendar:`This changes timing, preparation, or schedule pressure around ${objectLine}. Evidence: ${quote}`,
    Environment:`This may affect the surrounding conditions for the work: space, travel, interruption, timing, or context. Evidence: ${quote}`,
    Witnessing:`This touches what the user asked VAL to remember or protect. Evidence: ${quote}`
  };
  return templates[observerName]||`${observerName} observed ${objectLine}. Evidence: ${quote}`;
}

function observerObservationText(observerName='',packet={},signal={}){
  if(!signal.meaningful)return observerLensFinding(observerName,packet,signal);
  const reason=routeReason(observerName,packet.packetType,packet.sourceType);
  return `${observerLensFinding(observerName,packet,signal)} Why this lens received it: ${reason}`;
}

function observerReviewsForPacket(packet={}){
  return BOARD_OBSERVERS.map(observerName=>{
    const signal=observerMeaningfulSignal(observerName,packet);
    const people=packetPeople(packet);
    const projects=packetProjects(packet);
    const decisionObjects=packetDecisionNouns(packet);
    const contentHash=packet.payloadJson?.contentHash||evidenceHash(packetEvidenceText(packet));
    return {
      reviewVersion:OBSERVER_REVIEW_VERSION,
      observerName,
      observerId:stableKey(observerName),
      observerFindingKey:`${packet.sourceType}:${packet.sourceId}:${contentHash}:${stableKey(observerName)}`,
      status:signal.meaningful?'observed':'no_signal',
      primary:signal.primary,
      matchedTerms:signal.matched,
      people:signal.meaningful?people:[],
      projects:signal.meaningful?projects:[],
      decisionObjects:signal.meaningful?decisionObjects:[],
      lensFinding:observerLensFinding(observerName,packet,signal),
      observation:observerObservationText(observerName,packet,signal),
      evidence:observerEvidence(packet),
      reviewedAt:packet.updatedAt||packet.createdAt||new Date().toISOString()
    };
  });
}

function withObserverReviews(packet={}){
  if(packet.status!=='active')return {
    ...packet,
    routeObserversJson:[],
    primaryObserversJson:[],
    payloadJson:{...(packet.payloadJson||{}),observerReviews:[]}
  };
  const existing=safeArray(packet.payloadJson?.observerReviews);
  const currentVersion=Number(packet.payloadJson?.observerReviewVersion||0);
  if(existing.length===BOARD_OBSERVERS.length&&currentVersion>=MODEL_OBSERVER_REVIEW_VERSION)return packet;
  const reviewed={...packet};
  reviewed.payloadJson={
    ...(packet.payloadJson||{}),
    observerReviewVersion:OBSERVER_REVIEW_VERSION,
    observerReviews:observerReviewsForPacket(packet)
  };
  return reviewed;
}
function createValBoardPacketsService({
  dbQuery,
  hasPg=()=>false,
  getStore=()=>({}),
  saveStore=()=>{},
  uuid=(prefix)=>`${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`,
  tenantId=()=>'default',
  userId=()=>'default',
  getWitnessingCompletion=async()=>({complete:false,sessionId:''}),
  envelopeService=null,
  logger=console
}={}){
  function scope(){return {tenantId:tenantId(),userId:userId()};}
  function store(){
    const s=getStore()||{};
    if(!Array.isArray(s.valBoardPackets))s.valBoardPackets=[];
    return s;
  }
  async function savePacket(packet){
    if(hasPg()){
      const r=await dbQuery(`
        insert into val_board_packets (
          id,tenant_id,user_id,source_type,source_id,packet_type,title,summary,status,
          route_observers_json,primary_observers_json,source_refs_json,payload_json,prototype,delivered_at,created_at,updated_at
        ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
        on conflict (id) do update set
          title=excluded.title,
          summary=excluded.summary,
          status=excluded.status,
          route_observers_json=excluded.route_observers_json,
          primary_observers_json=excluded.primary_observers_json,
          source_refs_json=excluded.source_refs_json,
          payload_json=excluded.payload_json,
          prototype=excluded.prototype,
          delivered_at=excluded.delivered_at,
          updated_at=excluded.updated_at
        returning *
      `,[
        packet.id,packet.tenantId,packet.userId,packet.sourceType,packet.sourceId,packet.packetType,
        packet.title,packet.summary,packet.status,
        JSON.stringify(packet.routeObserversJson),JSON.stringify(packet.primaryObserversJson),
        JSON.stringify(packet.sourceRefsJson),JSON.stringify(packet.payloadJson),
        !!packet.prototype,packet.deliveredAt||null,packet.createdAt,packet.updatedAt
      ]);
      return toCamelRow(r.rows[0]);
    }
    const s=store();
    const idx=s.valBoardPackets.findIndex(row=>row.id===packet.id&&row.tenantId===packet.tenantId&&row.userId===packet.userId);
    if(idx>=0)s.valBoardPackets[idx]={...s.valBoardPackets[idx],...packet,createdAt:s.valBoardPackets[idx].createdAt||packet.createdAt};
    else s.valBoardPackets.unshift(packet);
    saveStore(s);
    return packet;
  }
  async function loadPacket(packetId=''){
    const id=String(packetId||'').trim();
    if(!id)return null;
    if(hasPg()){
      const r=await dbQuery('select * from val_board_packets where id=$1 and tenant_id=$2 and user_id=$3 limit 1',[id,tenantId(),userId()]);
      return r.rows?.[0] ? toCamelRow(r.rows[0]) : null;
    }
    return safeArray(store().valBoardPackets).find(row=>row.id===id&&row.tenantId===tenantId()&&row.userId===userId())||null;
  }
  function packetModelEntityAllowed(value='',packet={}){
    const clean=compactText(value,120);
    if(!clean)return false;
    const hay=[
      packet.title,
      packet.summary,
      safeArray(packet.sourceRefsJson).map(ref=>ref.quoteOrSummary||ref.quote_or_summary).join(' '),
      JSON.stringify(packet.payloadJson||{})
    ].join(' ').toLowerCase();
    return hay.includes(clean.toLowerCase());
  }
  function normalizedModelObserverReview(observerName='',raw={},packet={}){
    const fallback=observerReviewsForPacket(packet).find(review=>review.observerName===observerName);
    if(!raw||String(raw.observerName||raw.observer||'').trim()!==observerName)return fallback;
    const requestedStatus=String(raw.status||'').toLowerCase()==='observed'?'observed':'no_signal';
    const finding=compactText(raw.lensFinding||raw.lens_finding||raw.observation||'',240);
    const observation=compactText(raw.observation||finding,420);
    const concern=compactText(raw.concern||'',240);
    const question=compactText(raw.question||raw.explore||'',200);
    const evidence=observerEvidence(packet);
    const observed=requestedStatus==='observed'&&finding.length>=12;
    const people=safeArray(raw.people).filter(value=>packetModelEntityAllowed(value,packet)).map(value=>compactText(value,120)).slice(0,8);
    const projects=safeArray(raw.projects).filter(value=>packetModelEntityAllowed(value,packet)).map(value=>compactText(value,120)).slice(0,6);
    const decisionObjects=safeArray(raw.decisionObjects||raw.decision_objects).filter(value=>packetModelEntityAllowed(value,packet)).map(value=>compactText(value,160)).slice(0,6);
    const noSignal=`No meaningful ${observerName} signal in ${String(packet.sourceType||'source').replace(/_/g,' ')} "${compactText(packet.title||packet.packetType,120)}".`;
    const contentHash=packet.payloadJson?.contentHash||evidenceHash(packetEvidenceText(packet));
    return {
      reviewVersion:MODEL_OBSERVER_REVIEW_VERSION,
      reviewMode:'model_backed_observer_suite_v3',
      observerName,
      observerId:stableKey(observerName),
      observerFindingKey:`${packet.sourceType}:${packet.sourceId}:${contentHash}:${stableKey(observerName)}`,
      status:observed?'observed':'no_signal',
      primary:!!fallback?.primary,
      matchedTerms:safeArray(fallback?.matchedTerms),
      people:observed?people:[],
      projects:observed?projects:[],
      decisionObjects:observed?decisionObjects:[],
      lensFinding:observed?finding:noSignal,
      observation:observed?observation:noSignal,
      concern:observed?concern:'',
      question:observed?question:'',
      evidence,
      confidence:observed?Math.max(0,Math.min(1,Number(raw.confidence)||0.58)):Math.max(0,Math.min(0.49,Number(raw.confidence)||0.2)),
      reviewedAt:new Date().toISOString()
    };
  }
  async function applyModelObserverReviews(packetId='',reviews=[]){
    const packet=await loadPacket(packetId);
    if(!packet)throw new Error('Board packet was not found for Observer review.');
    const byObserver=new Map(safeArray(reviews).map(review=>[String(review?.observerName||review?.observer||'').trim(),review]));
    const missing=BOARD_OBSERVERS.filter(observerName=>!byObserver.has(observerName));
    if(missing.length)throw new Error('Observer suite was incomplete: '+missing.join(', '));
    const normalized=BOARD_OBSERVERS.map(observerName=>normalizedModelObserverReview(observerName,byObserver.get(observerName),packet));
    const normalizedByObserver=new Map(normalized.map(review=>[review.observerName,review]));
    const reviewed={
      ...packet,
      routeObserversJson:safeArray(packet.routeObserversJson).map(route=>{
        const review=normalizedByObserver.get(route.observerName);
        return {
          ...route,
          routingConfidence:review?.status==='observed'?review.confidence:0,
          routingReason:review?.status==='observed'
            ? `The ${route.observerName} review found a source-backed signal.`
            : `The ${route.observerName} review found no meaningful signal.`,
          supportingExcerpt:review?.status==='observed'?compactText(review.evidence?.quoteOrSummary,260):'',
          sourceId:packet.sourceId
        };
      }),
      payloadJson:{
        ...(packet.payloadJson||{}),
        observerReviewVersion:MODEL_OBSERVER_REVIEW_VERSION,
        observerReviewMode:'model_backed_observer_suite_v3',
        observerReviews:normalized
      },
      updatedAt:new Date().toISOString()
    };
    return savePacket(reviewed);
  }
  async function createPacket(input={}){
    const sc=scope();
    const sourceType=String(input.sourceType||input.source_type||'manual').trim();
    const sourceId=String(input.sourceId||input.source_id||uuid('source')).trim();
    const packetType=String(input.packetType||input.packet_type||'learning_packet').trim();
    const validation=validateObservationSource({...input,sourceType,sourceId});
    const now=new Date().toISOString();
    let packet={
      id:String(input.id||packetId(uuid,sc,sourceType,sourceId,packetType)).trim(),
      tenantId:sc.tenantId,
      userId:sc.userId,
      sourceType,
      sourceId,
      packetType,
      title:compactText(input.title||packetType.replace(/_/g,' '),220),
      summary:compactText(input.summary||input.description||'',1400),
      status:validation.valid?String(input.status||'active'):'rejected_source',
      routeObserversJson:[],
      primaryObserversJson:[],
      sourceRefsJson:safeArray(input.sourceRefs||input.sourceRefsJson||input.source_refs_json).map(normalizeSourceRef),
      payloadJson:{
        ...(input.payloadJson||input.payload||{}),
        evidenceContent:validation.cleanContent,
        contentHash:validation.contentHash,
        evidenceKey:`${sourceType}:${sourceId}:${validation.contentHash}`,
        provenance:{
          sourceType,
          sourceId,
          sourceCreatedAt:input.sourceCreatedAt||input.source_created_at||input.createdAt||input.created_at||now,
          generatedBy:validation.generatedBy||'source_ingress',
          observerId:'',
          packetId:String(input.id||packetId(uuid,sc,sourceType,sourceId,packetType)).trim(),
          parentPacketId:String(input.parentPacketId||input.parent_packet_id||''),
          isGeneratedContent:validation.isGeneratedContent
        },
        sourceValidation:validation
      },
      prototype:!!input.prototype,
      deliveredAt:input.deliveredAt||input.delivered_at||null,
      createdAt:input.createdAt||input.created_at||now,
      updatedAt:now
    };
    if(validation.valid){
      packet.routeObserversJson=observerRoutes(packetType,sourceType,packet);
      packet.primaryObserversJson=packet.routeObserversJson.filter(route=>route.primary).map(route=>route.observerName);
    }
    packet=withObserverReviews(packet);
    const saved=await savePacket(packet);
    if(!validation.valid){
      logger.warn?.(`[val-board] rejected ${sourceType}:${sourceId}: ${validation.rejectionReason}`);
      return saved;
    }
    if(envelopeService&&typeof envelopeService.upsertForPacket==='function'){
      try{
        saved.envelope=await envelopeService.upsertForPacket(saved);
      }catch(error){
        saved.envelopeWarning=error.message;
        logger.warn?.('[val-envelope] packet envelope attach failed:',error.message);
      }
    }
    logger.log?.(`[val-board] packet ${saved.id} ${saved.packetType} from ${saved.sourceType}:${saved.sourceId}`);
    return saved;
  }
  async function createPackets(inputs=[]){
    const packets=[];
    for(const input of safeArray(inputs)){
      packets.push(await createPacket(input));
    }
    return packets;
  }
  function emailPacketsFromMessage(message={}){
    const id=message.messageId||message.id||message.threadId||uuid('email');
    const subject=message.subject||'Email conversation';
    const direction=String(message.direction||'').toLowerCase();
    const body=message.bodyPreview||message.snippet||message.bodyText||'';
    const refs=[normalizeSourceRef({sourceType:'email',sourceId:id,quoteOrSummary:[subject,body].filter(Boolean).join(': '),confidence:0.8,createdAt:message.receivedAt||message.sentAt||message.createdAt})];
    const packets=[
      {sourceType:'email',sourceId:id,packetType:'email_attention_packet',title:subject,summary:body,sourceRefs:refs,payload:{provider:message.provider,threadId:message.threadId,direction,senderName:message.senderName||message.fromName||'',senderEmail:message.senderEmail||message.fromEmail||message.from||'',to:message.to||message.recipients||[],cc:message.cc||[],bodyPreview:body}},
    ];
    if(direction==='inbound' || /\b(can you|please|need|review|confirm|send|available|thoughts)\b/i.test(body)){
      packets.push({sourceType:'email',sourceId:id,packetType:'reply_pressure_packet',title:`Reply pressure: ${subject}`,summary:body,sourceRefs:refs,payload:{provider:message.provider,threadId:message.threadId,direction,senderName:message.senderName||message.fromName||'',senderEmail:message.senderEmail||message.fromEmail||message.from||'',to:message.to||message.recipients||[],cc:message.cc||[],bodyPreview:body}});
    }
    if(/\bdraft|reply|send|proposal|intro|introduction\b/i.test([subject,body].join(' '))){
      packets.push({sourceType:'email',sourceId:id,packetType:'draft_review_packet',title:`Draft review signal: ${subject}`,summary:body,sourceRefs:refs,payload:{provider:message.provider,threadId:message.threadId,direction,senderName:message.senderName||message.fromName||'',senderEmail:message.senderEmail||message.fromEmail||message.from||'',to:message.to||message.recipients||[],cc:message.cc||[],bodyPreview:body}});
    }
    return packets;
  }
  async function recordEmailSync(result={}){
    const messages=safeArray(result.savedMessages||result.messages);
    return createPackets(messages.flatMap(emailPacketsFromMessage));
  }
  async function recordTranscriptProcessed({sourceId,title='',summary='',analysis={},counts={},createdDrafts=[],stagedTasks=[],createdTasks=[]}={}){
    const refs=[normalizeSourceRef({sourceType:'transcript',sourceId,quoteOrSummary:summary?.executiveSummary||summary?.summary||summary||title,confidence:0.82})];
    const packets=[
      {sourceType:'transcript',sourceId,packetType:'meeting_evidence_packet',title:title||'Transcript processed',summary:summary?.executiveSummary||summary?.summary||summary||'',sourceRefs:refs,payload:{counts,analysisSummary:analysis?.executiveSummary||'',participants:analysis?.participants||analysis?.attendees||[],relationshipUpdates:analysis?.relationshipUpdates||[],openQuestions:analysis?.openQuestions||[]}},
      {sourceType:'transcript',sourceId,packetType:'decision_trace_packet',title:`Decision trace: ${title||sourceId}`,summary:safeArray(analysis?.keyDecisions).map(item=>typeof item==='string'?item:item?.summary||item?.decision).filter(Boolean).slice(0,5).join(' | '),sourceRefs:refs,payload:{keyDecisions:analysis?.keyDecisions||[]}},
      {sourceType:'transcript',sourceId,packetType:'task_extraction_packet',title:`Transcript tasks: ${title||sourceId}`,summary:`${safeArray(stagedTasks).length+safeArray(createdTasks).length} task signal(s), ${safeArray(createdDrafts).length} draft signal(s).`,sourceRefs:refs,payload:{stagedTasks,createdTasks,createdDrafts}}
    ];
    return createPackets(packets);
  }
  async function recordCalendarEvent(event={}){
    const id=event.id||event.eventId||event.calendarEventId||uuid('calendar');
    const title=event.title||event.summary||'Calendar event';
    const refs=[normalizeSourceRef({sourceType:'calendar_event',sourceId:id,quoteOrSummary:title,confidence:0.75,createdAt:event.startTime||event.start_time||event.createdAt})];
    return createPackets([
      {sourceType:'calendar_event',sourceId:id,packetType:'meeting_context_packet',title,summary:event.description||'',sourceRefs:refs,payload:event},
      {sourceType:'calendar_event',sourceId:id,packetType:'capacity_window_packet',title:`Capacity window: ${title}`,summary:event.startTime||event.start_time||'',sourceRefs:refs,payload:event}
    ]);
  }
  async function recordExternalActionPacket(packet={}){
    const id=packet.id||uuid('external_action');
    const action=String(packet.actionType||packet.action_type||'approval_packet');
    const packetType=/task/.test(action)?'task_packet':(/send|email|sms/.test(action)?'sent_action_packet':'approval_packet');
    return createPacket({
      sourceType:'external_action',
      sourceId:id,
      packetType,
      title:packet.title||packet.whyThisActionExists||action.replace(/_/g,' '),
      summary:packet.whatWillHappen||packet.summary||packet.whyThisActionExists||'External action packet prepared for approval.',
      sourceRefs:packet.sourceRefsJson||packet.source_refs_json||[],
      payload:{actionType:action,status:packet.status,targetSystem:packet.targetSystem,targetId:packet.targetId,noExternalAction:packet.status!=='executed'}
    });
  }
  async function recordDraftEvent(draft={}){
    const id=draft.id||uuid('draft');
    const sourceContext=draft.sourceContext||draft.source_context_json||{};
    const body=compactText(draft.body||'',1400);
    const subject=compactText(draft.subject||draft.title||draft.draftType||draft.draft_type||'Prepared draft',220);
    const sourceRefs=safeArray(
      sourceContext.sourceRefs||
      sourceContext.source_refs||
      sourceContext.sourceRefsJson||
      sourceContext.source_refs_json
    );
    return createPacket({
      sourceType:'draft',
      sourceId:id,
      packetType:'draft_review_packet',
      title:subject,
      summary:body||subject,
      sourceRefs,
      payload:{
        draftType:draft.draftType||draft.draft_type||'',
        status:draft.status||'draft',
        contactId:draft.contactId||draft.contact_id||'',
        sourceContext,
        noExternalAction:true
      }
    });
  }
  async function recordCommitmentEvent(event={}){
    const commitment=event.commitment||event.result?.commitment||{};
    const id=commitment.id||event.commitmentId||event.id||uuid('commitment');
    const eventType=String(event.eventType||event.type||'commitment_updated');
    const title=commitment.title||event.title||'Commitment updated';
    const evidence=commitment.evidence_quote||commitment.evidenceSummary||commitment.description||event.summary||title;
    const refs=[normalizeSourceRef({
      sourceType:commitment.source_type||commitment.sourceType||'task',
      sourceId:commitment.source_id||commitment.sourceId||id,
      quoteOrSummary:evidence,
      confidence:commitment.confidence_score||commitment.confidenceScore||0.72,
      createdAt:commitment.updated_at||commitment.updatedAt||new Date().toISOString()
    })];
    return createPacket({
      sourceType:'task',
      sourceId:id,
      packetType:'task_packet',
      title:eventType.replace(/_/g,' ') + ': ' + title,
      summary:[
        eventType === 'status_updated' && commitment.status ? `Status is now ${commitment.status}.` : '',
        eventType === 'draft_created' && event.draft?.id ? `Prepared draft ${event.draft.id} is attached.` : '',
        eventType === 'task_created' && event.task?.id ? `Internal task ${event.task.id} is attached.` : '',
        evidence
      ].filter(Boolean).join(' '),
      sourceRefs:refs,
      payload:{
        eventType,
        commitment,
        draft:event.draft||event.result?.draft||null,
        task:event.task||event.result?.task||null,
        noExternalAction:true
      }
    });
  }
  async function recordProfileEvent(event={}){
    const profile=event.profile||event.result?.profile||event.relationshipProfile||event.projectProfile||event;
    const profileType=String(profile.profileType||profile.profile_type||event.profileType||event.profile_type||'relationship').toLowerCase();
    const isProject=profileType==='project'||profile.projectId||profile.project_id;
    const id=profile.id||profile.profileKey||profile.profile_key||profile.projectId||profile.project_id||profile.personId||profile.person_id||uuid(isProject?'project_profile':'relationship_profile');
    const name=profile.displayName||profile.display_name||profile.name||profile.projectName||profile.project_name||profile.profileKey||profile.profile_key||'Profile updated';
    const summary=profile.summary||profile.relationshipStatus||profile.relationship_status||event.summary||'Profile context changed.';
    const sourceType=isProject?'project_profile':'relationship_profile';
    const packetType=isProject?'project_packet':'relationship_packet';
    const refs=[normalizeSourceRef({
      sourceType,
      sourceId:id,
      quoteOrSummary:summary||name,
      confidence:profile.confidence||profile.confidence_score||0.74,
      createdAt:profile.updatedAt||profile.updated_at||profile.lastObservedAt||profile.last_observed_at||new Date().toISOString()
    })];
    return createPacket({
      sourceType,
      sourceId:id,
      packetType,
      title:String(event.eventType||event.type||'profile_updated').replace(/_/g,' ') + ': ' + name,
      summary,
      sourceRefs:refs,
      payload:{
        eventType:event.eventType||event.type||'profile_updated',
        profile,
        noExternalAction:true
      }
    });
  }
  async function recordSourceEvent(sourceType='',event={}){
    const source=registrySourceKey(sourceType||event.sourceType||event.source_type);
    const id=event.id||event.messageId||event.message_id||event.eventId||event.event_id||event.sourceId||event.source_id||uuid(source||'source');
    const title=event.title||event.subject||event.name||event.summary||String(source||'Source event').replace(/_/g,' ');
    const summary=event.summary||event.body||event.bodyText||event.body_text||event.message||event.text||event.description||title;
    const refs=safeArray(event.sourceRefs||event.source_refs||event.sourceRefsJson||event.source_refs_json);
    const sourceRefs=refs.length?refs:[normalizeSourceRef({
      sourceType:source,
      sourceId:id,
      quoteOrSummary:summary,
      confidence:event.confidence||0.7,
      createdAt:event.createdAt||event.created_at||event.timestamp
    })];
    const combined=[title,summary,JSON.stringify(event.payload||event)].join(' ');
    let packetType='learning_packet';
    if(source==='sms'){
      packetType=/\b(sent|outbound|send|delivered|approved)\b/i.test(combined)?'sent_action_packet':'relationship_packet';
    }else if(source==='linkedin_visibility'){
      packetType=/\b(comment|dm|reply|relationship|support|post)\b/i.test(combined)?'relationship_packet':'learning_packet';
    }else if(source==='document'){
      packetType=/\b(template|example|lesson|voice|style|learn)\b/i.test(combined)?'learning_packet':'document_packet';
    }else if(source==='public_research'){
      packetType=/\b(project|company|organization|goall|dashboard|proposal)\b/i.test(combined)?'project_packet':(/\b(person|relationship|contact|linkedin)\b/i.test(combined)?'relationship_packet':'document_packet');
    }else if(source==='ghl_voice'||source==='ghl_text'){
      packetType='cowork_packet';
    }
    return createPacket({
      sourceType:source,
      sourceId:id,
      packetType,
      title,
      summary,
      sourceRefs,
      payload:{...event,sourceType:source,eventType:event.eventType||event.type||'source_event',noExternalAction:event.noExternalAction!==false}
    });
  }
  async function recordCoworkEvent(event={}){
    return createPacket({
      sourceType:event.sourceType||event.source_type||'cowork',
      sourceId:event.sessionId||event.workItemId||event.conversationId||uuid('cowork'),
      packetType:'cowork_packet',
      title:event.title||event.entrypointId||'Co-Work conversation',
      summary:event.summary||event.message||'A Co-Work conversation changed or confirmed context.',
      sourceRefs:event.sourceRefs||[],
      payload:event
    });
  }
  async function recordWitnessingAnswer(answer={}){
    const id=answer.id||answer.sessionId||answer.category||uuid('witnessing');
    const title=answer.title||String(answer.category||'Witnessing answer').replace(/_/g,' ');
    const text=answer.summary||answer.rawResponse||answer.response||answer.detail||'';
    const refs=[normalizeSourceRef({sourceType:'witnessing',sourceId:id,quoteOrSummary:text||title,confidence:0.9,createdAt:answer.createdAt})];
    return createPackets([
      {sourceType:'witnessing',sourceId:id,packetType:'identity_context_packet',title,summary:text,sourceRefs:refs,payload:answer},
      {sourceType:'witnessing',sourceId:id,packetType:'relational_context_packet',title:`Relational context: ${title}`,summary:text,sourceRefs:refs,payload:answer},
      {sourceType:'witnessing',sourceId:id,packetType:'operating_context_packet',title:`Operating context: ${title}`,summary:text,sourceRefs:refs,payload:answer}
    ]);
  }
  async function listPackets({limit=80,observerName='',sourceType='',status='active',includePrototype=false}={}){
    const lim=Math.max(1,Math.min(Number(limit)||80,1000));
    let rows=[];
    if(hasPg()){
      const params=[tenantId(),userId()];
      let where='tenant_id=$1 and user_id=$2';
      if(status){params.push(status);where+=` and status=$${params.length}`;}
      if(sourceType){params.push(sourceType);where+=` and source_type=$${params.length}`;}
      if(!includePrototype)where+=' and prototype=false';
      const r=await dbQuery(`select * from val_board_packets where ${where} order by created_at desc limit ${lim}`,params);
      rows=(r.rows||[]).map(toCamelRow);
    }else{
      rows=safeArray(store().valBoardPackets)
        .filter(row=>row.tenantId===tenantId()&&row.userId===userId())
        .filter(row=>!status||row.status===status)
        .filter(row=>!sourceType||row.sourceType===sourceType)
        .filter(row=>includePrototype||!row.prototype)
        .sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')))
        .slice(0,lim)
        ;
    }
    const activeRows=[];
    const durablePacketKeys=new Set();
    for(const row of rows){
      const validation=validateObservationSource(row);
      if(row.status==='active'&&!validation.valid){
        await savePacket({
          ...row,
          status:'rejected_source',
          routeObserversJson:[],
          primaryObserversJson:[],
          payloadJson:{
            ...(row.payloadJson||{}),
            observerReviews:[],
            sourceValidation:validation
          },
          updatedAt:new Date().toISOString()
        });
        continue;
      }
      const durableKey=[
        row.tenantId,
        row.userId,
        registrySourceKey(row.sourceType),
        row.sourceId,
        row.packetType
      ].join(':');
      if(row.status==='active'&&durablePacketKeys.has(durableKey)){
        await savePacket({
          ...row,
          status:'superseded_duplicate',
          routeObserversJson:[],
          primaryObserversJson:[],
          payloadJson:{...(row.payloadJson||{}),observerReviews:[],supersededByEvidenceKey:durableKey},
          updatedAt:new Date().toISOString()
        });
        continue;
      }
      durablePacketKeys.add(durableKey);
      activeRows.push(withObserverReviews(row));
    }
    rows=activeRows;
    if(observerName){
      rows=rows.filter(row=>safeArray(row.routeObserversJson).some(route=>route.observerName===observerName));
    }
    return rows;
  }
  async function witnessingStatus(){
    const witnessing=await Promise.resolve(getWitnessingCompletion()).catch(error=>({
      complete:false,
      sessionId:'',
      error:error.message
    }));
    return {
      witnessingComplete:!!witnessing?.complete,
      witnessingSessionId:String(witnessing?.sessionId||''),
      witnessingStatus:witnessing?.complete?'complete':'not_complete',
      witnessingStage:String(witnessing?.stage||''),
      witnessingAnsweredCount:Math.max(0,Number(witnessing?.answeredCount)||0),
      witnessingNextStep:String(witnessing?.nextStep||''),
      witnessingError:String(witnessing?.error||'')
    };
  }
  function compactBoardPacket(packet={}){
    return {
      id:packet.id||'',
      sourceType:packet.sourceType||'',
      sourceId:packet.sourceId||'',
      packetType:packet.packetType||'',
      title:compactText(packet.title||'Packet',180),
      summary:compactText(packet.summary||'',320),
      status:packet.status||'',
      routeObserversJson:safeArray(packet.routeObserversJson).map(route=>({
        observerName:route.observerName||'',
        primary:!!route.primary
      })),
      primaryObserversJson:safeArray(packet.primaryObserversJson),
      createdAt:packet.createdAt||'',
      updatedAt:packet.updatedAt||''
    };
  }
  async function boardContext({limit=80,observerName='',compact=false}={}){
    const [packets,witnessing]=await Promise.all([
      listPackets({limit,observerName}),
      witnessingStatus()
    ]);
    const sourceReadiness=sourceReadinessFromPackets(packets);
    const visiblePackets=compact?packets.map(compactBoardPacket):packets;
    return {
      observers:BOARD_OBSERVERS,
      ...witnessing,
      sources:sourceReadiness.sources,
      sourceSummary:sourceReadiness.summary,
      livePacketCount:packets.length,
      packets:visiblePackets,
      byObserver:compact?{}:Object.fromEntries(BOARD_OBSERVERS.map(observer=>[
        observer,
        packets.filter(packet=>safeArray(packet.routeObserversJson).some(route=>route.observerName===observer))
      ])),
      reviewsByObserver:compact?{}:Object.fromEntries(BOARD_OBSERVERS.map(observer=>[
        observer,
        packets.map(packet=>safeArray(packet.payloadJson?.observerReviews).find(review=>review.observerName===observer)).filter(Boolean)
      ]))
    };
  }
  function sourceReadinessFromPackets(packets=[]){
    const bySource=new Map();
    for(const packet of safeArray(packets)){
      const key=registrySourceKey(packet.sourceType||packet.source_type);
      const current=bySource.get(key)||{packetCount:0,lastPacketAt:'',packetTypes:new Set()};
      current.packetCount+=1;
      current.packetTypes.add(packet.packetType||packet.packet_type);
      const created=packet.createdAt||packet.created_at||'';
      if(created && String(created)>String(current.lastPacketAt||''))current.lastPacketAt=created;
      bySource.set(key,current);
    }
    const sources=BOARD_SOURCE_REGISTRY.map(source=>{
      const activity=bySource.get(source.sourceType)||{packetCount:0,lastPacketAt:'',packetTypes:new Set()};
      const packetCount=activity.packetCount||0;
      const automatic=source.status==='live';
      const claimSafe=automatic || packetCount>0;
      return {
        ...source,
        live:automatic,
        automatic,
        claimSafe,
        observed:packetCount>0,
        packetCount,
        lastPacketAt:activity.lastPacketAt||'',
        observedPacketTypes:[...activity.packetTypes].filter(Boolean).sort()
      };
    });
    return {
      sources,
      summary:{
        total:sources.length,
        live:sources.filter(source=>source.status==='live').length,
        ingress:sources.filter(source=>source.status==='ingress').length,
        pending:sources.filter(source=>source.status==='pending').length,
        activeLive:sources.filter(source=>source.status==='live'&&source.packetCount>0).length,
        activeIngress:sources.filter(source=>source.status==='ingress'&&source.packetCount>0).length,
        claimAllSourcesSafe:sources.every(source=>source.claimSafe&&source.observed)
      }
    };
  }
  return {
    BOARD_OBSERVERS,
    BOARD_SOURCE_REGISTRY,
    PRIMARY_ROUTES,
    boardSourceByType,
    registrySourceKey,
    validateObservationSource,
    normalizeSourceRef,
    observerRoutes,
    observerReviewsForPacket,
    createPacket,
    createPackets,
    recordEmailSync,
    recordTranscriptProcessed,
    recordCalendarEvent,
    recordExternalActionPacket,
    recordDraftEvent,
    recordCommitmentEvent,
    recordProfileEvent,
    recordSourceEvent,
    recordCoworkEvent,
    recordWitnessingAnswer,
    applyModelObserverReviews,
    listPackets,
    boardContext,
    witnessingStatus,
    sourceReadiness:async({limit=300}={})=>sourceReadinessFromPackets(await listPackets({limit}))
  };
}

module.exports={createValBoardPacketsService,BOARD_OBSERVERS,PRIMARY_ROUTES,BOARD_SOURCE_REGISTRY,boardSourceByType,validateObservationSource};
