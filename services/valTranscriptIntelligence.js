const {extractExecutiveInstructions}=require('./valExecutiveInstructions');
const {relationshipIntroCandidates}=require('./valRelationshipActionIntelligence');

function safeArray(value){return Array.isArray(value)?value:[];}
function compactText(value,limit=800){return String(value||'').replace(/\s+/g,' ').trim().slice(0,limit);}
function jsonValue(value,fallback){if(value==null)return fallback;if(typeof value==='string'){try{return JSON.parse(value);}catch(_){return fallback;}}return value;}
function toSnake(key){return key.replace(/[A-Z]/g,m=>'_'+m.toLowerCase());}
function toCamelRow(row={}){
  const out={};
  for(const [k,v] of Object.entries(row||{})){
    const camel=k.replace(/_([a-z])/g,(_,c)=>c.toUpperCase());
    out[camel]=v instanceof Date?v.toISOString():v;
  }
  for(const key of ['qualityGateJson','linkageJson','evidenceRefsJson','commitmentsJson','contextualTasksJson','relationshipSignalsJson','projectSignalsJson','capacityAndToneContextJson','courageSignalsJson','teachValCandidatesJson','readyForYouCandidatesJson','executiveInstructionsJson','chiefOfStaffSignalsJson','momentumSignalsJson','approvalPoliciesJson','unknownsJson','noActionNeededJson','finalJson','sourceRefsJson','linkTargetsJson','metadataJson']){
    if(Object.hasOwn(out,key))out[key]=jsonValue(out[key],/refs|signals|tasks|candidates|policies|unknowns|targets|commitments/i.test(key)?[]:{});
  }
  return out;
}
function normalizeSourceRef(ref={}){
  return {
    source_type:String(ref.source_type||ref.sourceType||ref.type||'unknown'),
    source_id:String(ref.source_id||ref.sourceId||ref.id||''),
    quote_or_summary:compactText(ref.quote_or_summary||ref.quoteOrSummary||ref.summary||ref.quote||'',900),
    confidence:Math.max(0,Math.min(1,Number(ref.confidence)||0)),
    created_at:ref.created_at||ref.createdAt||new Date().toISOString()
  };
}
function sentences(text=''){
  return String(text||'').replace(/\r/g,'\n').split(/(?<=[.!?])\s+|\n+/).map(s=>s.trim()).filter(s=>s.length>12&&s.length<600);
}
function findQuote(text='',needle=''){
  const n=String(needle||'').trim();
  if(!n)return sentences(text)[0]||compactText(text,300);
  const exact=sentences(text).find(s=>s.toLowerCase().includes(n.toLowerCase().slice(0,80)));
  return exact||compactText(n,300);
}
function transcriptText(record={}){
  return String(record.rawTranscript||record.raw_transcript||record.rawText||record.raw_text||record.transcript||record.transcriptText||record.text||'').trim();
}
function transcriptTitle(record={}){
  return compactText(record.meetingTitle||record.meeting_title||record.title||record.summary||'Transcript',180);
}
function qualityGate(record={}){
  const text=transcriptText(record);
  const issues=[];
  if(!record.id&&!record.transcriptId&&!record.transcript_id)issues.push('missing_transcript_id');
  if(text.length<120)issues.push('too_short');
  if(text.length>0&&text.length<400)issues.push('thin_context');
  const speakerLines=(text.match(/^\s*[^:\n]{2,80}:\s+\S/gm)||[]).length;
  const speakerConfidence=speakerLines>=4?0.8:speakerLines>=2?0.55:0.25;
  if(speakerConfidence<0.4)issues.push('low_speaker_confidence');
  const quality=!text?'unusable':issues.includes('too_short')?'low':issues.length?'medium':'high';
  return {
    is_usable:quality!=='unusable',
    quality,
    issues,
    speaker_confidence:speakerConfidence,
    missing_context:[],
    recommended_next_step:quality==='unusable'?'request_better_transcript':(quality==='low'?'process_with_caution':'process')
  };
}
function commitmentSentences(text=''){
  const markers=/\b(i will|i'll|we will|we'll|you will|you'll|need to|needs to|going to|follow up|send|share|review|schedule|introduce|connect|prepare|draft|update|circle back|by monday|by tomorrow|next week|today|before)\b/i;
  return sentences(text).filter(s=>markers.test(s)&&!/\b(maybe|might|could possibly|for example|nothing needs to happen|nothing need happen|no action needed|doesn't need follow up|does not need follow up)\b/i.test(s)).slice(0,12);
}
function evidenceExtractor(record={}){
  const text=transcriptText(record),id=record.id||record.transcriptId||record.transcript_id||'';
  const keySentences=sentences(text).filter(s=>/\b(decided|agreed|will|follow up|send|introduced|blocked|waiting|important|priority|next step|proposal|partner|client|project)\b/i.test(s)).slice(0,12);
  return keySentences.map((s,i)=>normalizeSourceRef({sourceType:'transcript',sourceId:id,quoteOrSummary:s,confidence:i<5?0.78:0.65,createdAt:record.createdAt||record.created_at||new Date().toISOString()}));
}
function commitmentExtractor(record={},evidenceRefs=[]){
  const id=record.id||record.transcriptId||record.transcript_id||'',text=transcriptText(record);
  return commitmentSentences(text).map((s,i)=>({
    id:`commitment_${i+1}`,
    title:compactText(s,120),
    summary:compactText(s,360),
    source_quote:findQuote(text,s),
    owner:/\byou will|you'll\b/i.test(s)?'other':(/\bi will|i'll|we will|we'll\b/i.test(s)?'user_or_team':'unknown'),
    due_hint:(s.match(/\b(today|tomorrow|monday|tuesday|wednesday|thursday|friday|next week|before [^.]+)\b/i)||[])[0]||'',
    approval_policy:'approval_required',
    confidence:0.72,
    source_refs:[evidenceRefs.find(r=>r.quote_or_summary===s)||normalizeSourceRef({sourceType:'transcript',sourceId:id,quoteOrSummary:s,confidence:0.72})]
  }));
}
function taskContextBuilder(record={},commitments=[]){
  return commitments.map((c,i)=>({
    id:`task_candidate_${i+1}`,
    title:c.title,
    why:compactText(`This task exists because the transcript contains a commitment or implied follow-up: ${c.summary}`,500),
    source_quote:c.source_quote,
    commitment_id:c.id,
    context_summary:c.summary,
    due_hint:c.due_hint,
    execution_level:'level_4_human_judgment_required',
    execution_level_label:'Human Judgment Required',
    autonomous_work_possible:false,
    continuation_status:'needs_review',
    completed_by_val:[],
    remaining_context_needed:['Confirm this is a real commitment before VAL turns it into durable work.'],
    prepared_work_ids:[],
    approval_policy:'approval_required',
    requires_approval:true,
    confidence:c.confidence
  }));
}
function executionLevelForInstruction(instruction={}){
  const action=String(instruction.requested_action||'');
  if(['analyze','prepare_only'].includes(action))return {level:'level_1_inform_only',label:'Inform Only',rank:1,approval:false};
  if(['create_draft','send_email','prepare_proposal','send_proposal','prepare_invoice','send_invoice','draft_introduction','make_introduction','send_calendar_invite','create_calendar_hold'].includes(action))return {level:'level_2_autonomous_draft',label:'Autonomous Draft',rank:2,approval:true};
  if(['build_artifact','research'].includes(action))return {level:'level_3_autonomous_build',label:'Autonomous Build',rank:3,approval:true};
  if(['charge_money','delete_record','merge_contacts','change_security_privacy_billing_settings','move_crm_stage','add_or_remove_tag','create_crm_note','publish_content','send_sms'].includes(action))return {level:'level_4_human_judgment_required',label:'Human Judgment Required',rank:4,approval:true};
  if(instruction.external_action)return {level:'level_4_human_judgment_required',label:'Human Judgment Required',rank:4,approval:true};
  return {level:'level_2_autonomous_draft',label:'Autonomous Draft',rank:2,approval:true};
}
function missingContextForInstruction(instruction={},linkage={},artifactKind='prepared_work'){
  const missing=[];
  const ambiguity=safeArray(instruction.ambiguity);
  const blocking=safeArray(instruction.blocking_safety_rules);
  if(ambiguity.includes('target_identity_unresolved'))missing.push('Confirm the target person, recipient, record, or project.');
  if(ambiguity.includes('introduction_parties_unclear'))missing.push('Confirm both introduction parties.');
  if(ambiguity.includes('email_content_unclear'))missing.push('Confirm the answer, offer, or message VAL should represent.');
  if(ambiguity.includes('calendar_time_unclear'))missing.push('Confirm the date, time, duration, and attendees.');
  if(blocking.length)missing.push('Human judgment is required because this touches safety, legal, financial, destructive, public, or external consequences.');
  if(/proposal|invoice|agreement|sow|document|copy/.test(artifactKind))missing.push('Confirm scope, pricing, terms, claims, and authority before external use.');
  if(/html_page|code|build/.test(artifactKind)&&!safeArray(linkage.linked_projects).length)missing.push('Confirm the project, repository, destination path, brand/source assets, and publish target.');
  if(!safeArray(linkage.linked_people).length&&/email|introduction|proposal|calendar/.test(artifactKind))missing.push('Resolve relationship identity before this can be sent, scheduled, or attached externally.');
  return [...new Set(missing)];
}
function linkedContextForPreparedWork(record={},linkage={},instruction={},taskId=''){
  const id=record.id||record.transcriptId||record.transcript_id||'';
  const project=safeArray(linkage.linked_projects)[0]||{};
  const people=safeArray(linkage.linked_people).map(p=>({name:p.name||'',email:p.email||'',contactId:p.contactId||p.crm_contact_id||''})).filter(p=>p.name||p.email||p.contactId).slice(0,8);
  const projectHint=project.name||project.title||instruction.project_hint||instruction.target_person_or_record||transcriptTitle(record);
  return {
    transcript:{id,title:transcriptTitle(record)},
    project:project.id||project.projectId||project.name?{id:project.id||project.projectId||'',name:project.name||project.title||project.projectName||projectHint,source:project.source||'transcript_linkage'}:{id:'',name:projectHint,source:'suggested_from_transcript',needs_creation:true},
    relationships:people,
    task:{id:taskId,title:compactText(instruction.instruction||'',140),source:'transcript_execution_opportunity'}
  };
}
function relationshipSignals(record={},participants=[],commitments=[]){
  const text=transcriptText(record);
  const signals=sentences(text).filter(s=>/\b(waiting|trust|appreciate|thank|concern|frustrat|excited|partner|intro|relationship|follow up|owed|sorry|important)\b/i.test(s)).slice(0,8);
  return signals.map((s,i)=>({id:`relationship_signal_${i+1}`,summary:compactText(s,360),source_quote:findQuote(text,s),participants:safeArray(participants).slice(0,5),approval_policy:'approval_required',confidence:0.66}));
}
function projectSignals(record={}){
  const text=transcriptText(record);
  const signals=sentences(text).filter(s=>/\b(project|proposal|workflow|launch|build|ship|blocked|blocker|decision|scope|Frisson|HopeMakers|HelpByShopping|client|partner)\b/i.test(s)).slice(0,8);
  return signals.map((s,i)=>({id:`project_signal_${i+1}`,summary:compactText(s,360),source_quote:findQuote(text,s),project_hint:(s.match(/\b([A-Z][A-Za-z0-9]+(?:\s+[A-Z][A-Za-z0-9]+){0,3})\b/)||[])[0]||'',approval_policy:'approval_required',confidence:0.64}));
}
function capacityAndTone(record={}){
  const text=transcriptText(record).toLowerCase();
  const signals=[];
  if(/\b(tired|exhausted|overwhelmed|too much|burned out|burnt out|stressed|anxious|hard to focus|can't focus|frustrated)\b/i.test(text))signals.push('capacity_pressure_visible');
  if(/\b(excited|energized|clear|relieved|momentum|breakthrough)\b/i.test(text))signals.push('positive_movement_visible');
  return {
    label:'capacity_and_tone_context',
    observation:signals.length?`Transcript contains non-clinical capacity/tone signals: ${signals.join(', ')}.`:'No strong capacity/tone signal was visible.',
    signals,
    confidence:signals.length?0.7:0.42,
    limitation:'This is not clinical interpretation. It only names work-context tone and capacity signals visible in the transcript.'
  };
}
function courageSignals(record={},commitments=[]){
  const text=transcriptText(record);
  const signals=sentences(text).filter(s=>/\b(avoid|avoiding|hard conversation|difficult conversation|need to talk|postpon|scared|afraid|uncertain|resistance|stuck|blocked)\b/i.test(s)).slice(0,6);
  return signals.map((s,i)=>({id:`courage_signal_${i+1}`,summary:compactText(s,360),source_quote:findQuote(text,s),confidence:0.62,approval_policy:'approval_required'}));
}
function teachValCandidates(record={}){
  const text=transcriptText(record);
  return sentences(text).filter(s=>/\b(always|never|prefer|works best|remember|important to me|I care about|I don't want|my style|my voice|protect)\b/i.test(s)).slice(0,8).map((s,i)=>({
    id:`teach_val_candidate_${i+1}`,
    title:compactText(s,100),
    summary:compactText(s,420),
    source_quote:findQuote(text,s),
    approval_policy:'approval_required',
    user_confirmation:'not_shown',
    confidence:0.6
  }));
}
function followUpCandidates(record={},commitments=[],relationshipSignals=[]){
  const id=record.id||record.transcriptId||record.transcript_id||'';
  const candidates=[];
  if(commitments.length){
    candidates.push({id:`followup_${id}_commitments`,category:'transcript_follow_up',type:'commitment_bundle',title:`Review ${commitments.length} transcript commitment${commitments.length===1?'':'s'}`,summary:'VAL extracted commitments before turning anything into tasks.',why_user_is_seeing_this:'This transcript changed what someone may be waiting on.',why_now:'Commitments lose value when they are not clarified soon after the conversation.',what_val_did:'Extracted commitments, source quotes, and task context. No task was created automatically.',what_only_user_can_do:'Confirm which commitments are real and how they should move forward.',estimated_review_minutes:Math.min(5,Math.max(2,commitments.length)),approval_policy:'approval_required',representation_risk:'medium',requires_approval:true,source_refs:commitments.flatMap(c=>c.source_refs||[]).slice(0,8),confidence:0.74});
  }
  if(relationshipSignals.length){
    candidates.push({id:`followup_${id}_relationship`,category:'relationship_update',type:'relationship_project_update_candidate',title:'Review relationship signals from transcript',summary:'VAL found relationship/project context that should not be quietly flattened into tasks.',why_user_is_seeing_this:'A relationship or project may have changed because of what was said.',why_now:'Reviewing this now prevents useful context from disappearing into raw transcript history.',what_val_did:'Prepared relationship/project signal candidates only. No CRM or memory update was committed.',what_only_user_can_do:'Confirm whether these signals should update relationship or project context.',estimated_review_minutes:3,approval_policy:'approval_required',representation_risk:'low',requires_approval:true,source_refs:relationshipSignals.map(s=>normalizeSourceRef({sourceType:'transcript',sourceId:id,quoteOrSummary:s.source_quote||s.summary,confidence:s.confidence})).slice(0,8),confidence:0.66});
  }
  return candidates;
}
function preparedWorkType(instruction={}){
  const action=instruction.requested_action||'';
  const text=String(instruction.instruction||'').toLowerCase();
  if(action==='prepare_proposal'||action==='send_proposal')return 'proposal_draft';
  if(action==='prepare_invoice'||action==='send_invoice')return 'invoice_draft';
  if(action==='build_artifact')return 'html_page_draft';
  if(action==='send_calendar_invite'||action==='create_calendar_hold')return 'calendar_invite_draft';
  if(action==='make_introduction'||action==='draft_introduction')return 'introduction_email_draft';
  if(action==='create_draft'){
    if(/\b(agreement|statement of work|sow)\b/.test(text))return 'agreement_draft';
    if(/\b(project plan|implementation plan|technical specification|spec|documentation|report|executive summary|research brief|agenda)\b/.test(text))return 'document_draft';
    if(/\b(website copy|marketing copy|social post|social posts|copy)\b/.test(text))return 'copy_draft';
    return 'document_draft';
  }
  if(action==='send_email')return 'email_draft';
  return '';
}
function preparedArtifactForInstruction(instruction={},record={},linkage={},evidenceRefs=[]){
  const type=preparedWorkType(instruction);
  if(!type)return null;
  const id=record.id||record.transcriptId||record.transcript_id||'';
  const target=instruction.target_person_or_record||safeArray(linkage.linked_people)[0]?.name||'relationship';
  const level=executionLevelForInstruction(instruction);
  const missing=missingContextForInstruction(instruction,linkage,type);
  const completionStatus=missing.length?'partial_needs_context':'complete_for_review';
  const taskId=`task_${id}_${String(type||'prepared').replace(/[^a-z0-9]+/gi,'_')}`;
  const linkedContext=linkedContextForPreparedWork({...record,id},linkage,instruction,taskId);
  const base={
    source:'transcript_instruction',
    transcript_id:id,
    requested_action:instruction.requested_action,
    instruction:instruction.instruction,
    target,
    execution_level:level.level,
    execution_level_label:level.label,
    completion_status:completionStatus,
    completed_by_val:[
      'Classified the transcript instruction.',
      'Prepared the safest reviewable artifact VAL can create from current context.',
      'Linked the work back to transcript, project, relationship, and task continuation context.'
    ],
    remaining_context_needed:missing,
    linked_context:linkedContext,
    continuation_task:{
      id:taskId,
      title:compactText(`Continue: ${instruction.instruction||type}`,140),
      status:completionStatus==='complete_for_review'?'ready_for_review':'needs_context',
      project:linkedContext.project,
      relationships:linkedContext.relationships,
      transcript:linkedContext.transcript,
      completed_by_val:[],
      remaining_context_needed:missing
    },
    external_action_requested:!!instruction.external_action,
    authorization:instruction.authorization,
    review_required:true,
    no_external_action:true
  };
  if(type==='proposal_draft')return {...base,kind:type,destination:'GHL/CRM proposal draft',title:`Proposal draft for ${target}`,sections:['Context heard in transcript','Recommended scope','Implementation path','Investment or pricing placeholder','Approval questions'],externalSend:false};
  if(type==='invoice_draft')return {...base,kind:type,destination:'Invoice draft packet',title:`Invoice draft for ${target}`,sections:['Context heard in transcript','Amount or pricing placeholder','Terms needing confirmation','Approval questions'],externalSend:false,externalFinancialAction:false};
  if(type==='agreement_draft')return {...base,kind:type,destination:'Agreement/SOW draft',title:`Agreement draft for ${target}`,sections:['Parties','Scope','Responsibilities','Timeline','Terms requiring human/legal review','Approval questions'],externalSend:false,legalReviewRequired:true};
  if(type==='document_draft')return {...base,kind:type,destination:'Prepared document draft',title:`Document draft for ${target}`,sections:['Purpose','Context from transcript','Draft content','Open questions','Next review decision'],externalPublish:false};
  if(type==='copy_draft')return {...base,kind:type,destination:'Copy draft',title:`Copy draft for ${target}`,sections:['Audience','Promise','Draft copy','CTA','Review questions'],externalPublish:false};
  if(type==='html_page_draft')return {...base,kind:type,destination:'VAL workspace HTML artifact',title:`HTML page draft from transcript request`,filename:`${String(target||'val-page').toLowerCase().replace(/[^a-z0-9]+/g,'-') || 'val-page'}.html`,html:'<!doctype html>\\n<html>\\n<head><meta charset=\"utf-8\"><title>Draft Page</title><style>body{font-family:Inter,system-ui,sans-serif;margin:0;color:#172033;background:#f7f3eb}main{max-width:920px;margin:0 auto;padding:72px 24px}section{margin-top:32px}a{color:#234f3b}</style></head>\\n<body>\\n  <main>\\n    <h1>Draft page from transcript request</h1>\\n    <p>VAL prepared this page structure from the meeting. Replace placeholders after project/repo context is confirmed.</p>\\n    <section><h2>Purpose</h2><p>Clarify the promise, audience, and next action from the transcript.</p></section>\\n    <section><h2>Next Step</h2><p>Review copy, attach assets, and confirm the publish target before release.</p></section>\\n  </main>\\n</body>\\n</html>',externalPublish:false};
  if(type==='calendar_invite_draft')return {...base,kind:type,destination:'GHL/Calendar invitation draft',title:`Calendar invitation draft for ${target}`,attendees:safeArray(linkage.linked_people).map(p=>({name:p.name,email:p.email,contactId:p.crm_contact_id||p.contactId||''})),timeHint:(instruction.instruction.match(/\b(today|tomorrow|monday|tuesday|wednesday|thursday|friday|next week|at \d[^.]+)/i)||[])[0]||'',externalCalendarWrite:false};
  if(type==='introduction_email_draft')return {...base,kind:type,destination:'Email draft with two recipients',title:`Introduction draft involving ${target}`,recipients:safeArray(linkage.linked_people).slice(0,2).map(p=>({name:p.name,email:p.email,contactId:p.crm_contact_id||p.contactId||''})),relationship_match_required:true,externalSend:false};
  return {...base,kind:type,destination:'Email draft',title:`Email draft for ${target}`,externalSend:false};
}
function preparedWorkCandidates(record={},executiveInstructions=[],linkage={},evidenceRefs=[]){
  const id=record.id||record.transcriptId||record.transcript_id||'';
  return safeArray(executiveInstructions).map((instruction,i)=>{
    const artifact=preparedArtifactForInstruction(instruction,record,linkage,evidenceRefs);
    if(!artifact)return null;
    return {
      id:`prepared_${id}_${artifact.kind}_${i+1}`,
      category:'prepared_work',
      type:artifact.kind,
      title:artifact.title,
      summary:`VAL heard an instruction and prepared a ${artifact.kind.replace(/_/g,' ')} for review.`,
      why_user_is_seeing_this:'A transcript contained a direct or implied request that can become prepared work.',
      why_now:'Preparing it now preserves momentum while the conversation context is still fresh.',
      what_val_did:`Prepared a reviewable ${artifact.kind.replace(/_/g,' ')} from the transcript. Nothing was sent, scheduled, published, or written externally.`,
      what_only_user_can_do:artifact.remaining_context_needed?.length
        ? `Review the partial work and provide missing context: ${artifact.remaining_context_needed.join('; ')}`
        : 'Confirm whether this is accurate, edit it, and approve any external action separately.',
      estimated_review_minutes:artifact.kind==='html_page_draft'?6:3,
      approval_policy:instruction.authorization==='voice_authorized'?'voice_authorized':'approval_required',
      representation_risk:/proposal|email|introduction/.test(artifact.kind)?'high':'medium',
      requires_approval:true,
      execution_level:artifact.execution_level,
      execution_level_label:artifact.execution_level_label,
      completion_status:artifact.completion_status,
      completed_by_val:artifact.completed_by_val,
      remaining_context_needed:artifact.remaining_context_needed,
      linked_context:artifact.linked_context,
      continuation_task:artifact.continuation_task,
      prepared_artifact:artifact,
      source_refs:instruction.source_refs||evidenceRefs.slice(0,3),
      confidence:Math.min(0.92,Number(instruction.confidence)||0.68)
    };
  }).filter(Boolean);
}
function currentContactFromLinkage(linkage={}){
  const person=safeArray(linkage.linked_people)[0]||{};
  const crm=safeArray(linkage.linked_crm_records)[0]||{};
  return {
    name:person.name||crm.name||'',
    email:person.email||crm.email||'',
    contactId:person.contactId||person.crm_contact_id||crm.crm_contact_id||crm.contactId||'',
    source:person.source||'transcript_linkage'
  };
}
function transcriptIntroNeeds(record={}){
  const text=transcriptText(record);
  const needs=[];
  for(const sentence of sentences(text)){
    const match=sentence.match(/\b(?:we|i|they|this person|the client)\s+(?:need|needs|want|wants|are looking for|is looking for)\s+([^.!?]{4,180})/i);
    if(match)needs.push(compactText(match[1].replace(/\b(and|or)\s+(?:strategic\s+)?(?:partnership|partner|connection|intro|introduction)\s+paths?\b/i,'$&'),180));
    if(/\bmission aligned organizations\b/i.test(sentence))needs.push('mission aligned organizations');
    if(/\bstrategic partnership paths?\b/i.test(sentence))needs.push('strategic partnership');
  }
  return [...new Set(needs.map(item=>item.replace(/\s+/g,' ').trim()).filter(Boolean))].slice(0,6);
}
function introCandidatesFromMatches({record={},linkage={},crmContacts=[],evidenceRefs=[]}={}){
  const id=record.id||record.transcriptId||record.transcript_id||'';
  const currentContact={...currentContactFromLinkage(linkage),summary:transcriptText(record),needs:transcriptIntroNeeds(record),evidence:evidenceRefs.map(ref=>({summary:ref.quote_or_summary||ref.quoteOrSummary||''}))};
  const intro=relationshipIntroCandidates({currentContact,crmContacts,limit:3});
  return safeArray(intro.candidates).map((candidate,i)=>({
    id:`intro_match_${id}_${i+1}`,
    category:'prepared_work',
    type:'relationship_introduction_candidate',
    title:`Possible introduction: ${candidate.personA.name} <> ${candidate.personB.name}`,
    summary:candidate.whyThisMayMatter,
    why_user_is_seeing_this:'VAL noticed a possible useful introduction between the person from this transcript and someone already in the CRM.',
    why_now:'The relationship context is fresh, and introductions are easiest to steward while the need is visible.',
    what_val_did:candidate.whatValPrepared,
    what_only_user_can_do:'Confirm whether this introduction is appropriate, edit the email, and approve any send separately.',
    estimated_review_minutes:3,
    approval_policy:'approval_required',
    representation_risk:'high',
    requires_approval:true,
    prepared_artifact:{
      kind:'introduction_email_draft',
      source:'relationship_intro_matching',
      title:candidate.draft.subject,
      recipients:[candidate.personA,candidate.personB],
      body:candidate.draft.body,
      relationship_match_required:false,
      externalSend:false,
      no_external_action:true
    },
    source_refs:evidenceRefs.slice(0,3),
    confidence:candidate.confidence
  }));
}
function executiveInstructionExtractor(record={},gate={}){
  if(!gate.is_usable)return [];
  const id=record.id||record.transcriptId||record.transcript_id||'';
  const meta=record.metadata||record.metadataJson||record.metadata_json||{};
  const sourceType=meta.presenceMode||meta.channel||record.source||record.type||'transcript';
  const trusted=/^(chat|voice|voice_session|presence|presence_mode|presence_mode:|val_chat)/i.test(String(sourceType));
  return extractExecutiveInstructions({
    text:transcriptText(record),
    sourceType:/chat/i.test(sourceType)?'chat':(/voice|presence/i.test(sourceType)?'voice':'transcript'),
    sourceId:id,
    trustedAuthenticatedUser:trusted,
    authenticatedUserNames:meta.authenticatedUserNames||meta.authenticated_user_names||[],
    createdAt:record.createdAt||record.created_at||new Date().toISOString()
  }).executive_instructions;
}
function chiefSignals(commitments=[],capacity={},courage=[]){
  const out=[];
  if(commitments.length)out.push({type:'open_loop',summary:`${commitments.length} commitment${commitments.length===1?'':'s'} emerged from a transcript.`,confidence:0.72});
  if(safeArray(capacity.signals).length)out.push({type:'capacity_and_tone',summary:capacity.observation,confidence:capacity.confidence});
  if(courage.length)out.push({type:'courage',summary:'Transcript includes possible avoided or difficult action signals.',confidence:0.62});
  return out;
}
function momentumSignals(commitments=[],projectSignalsList=[],relationshipSignalsList=[]){
  const total=commitments.length+projectSignalsList.length+relationshipSignalsList.length;
  if(!total)return [];
  return [{type:'transcript_movement',direction:'changed',summary:`Transcript produced ${total} movement signal${total===1?'':'s'} across commitments, relationships, or projects.`,confidence:0.68}];
}
function noActionNeeded({commitments=[],relationshipSignalsList=[],projectSignalsList=[],teachCandidates=[]}){
  const value=!commitments.length&&!relationshipSignalsList.length&&!projectSignalsList.length&&!teachCandidates.length;
  return {value,reason:value?'No commitments, relationship/project changes, or Teach VAL candidates were visible.':'Transcript changed one or more follow-up, relationship, project, or preference contexts.'};
}

function createValTranscriptIntelligenceService({
  dbQuery,
  hasPg=()=>false,
  getStore=()=>({}),
  saveStore=()=>{},
  uuid=(prefix)=>`${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`,
  tenantId=()=>'default',
  userId=()=>'default',
  getTranscript=null,
  transcriptIndexData=null,
  resolveMeetingContext=null,
  meetingPrepService=null,
  resolveIdentity=null,
  listRelationshipContacts=null,
  createContinuationTask=null,
  logger=console
}={}){
  function store(){
    const s=getStore()||{};
    for(const key of ['transcriptIntelligenceRuns','transcriptIntelligenceItems'])if(!Array.isArray(s[key]))s[key]=[];
    return s;
  }
  async function loadTranscript(input={}){
    if(input.transcript&&typeof input.transcript==='object')return input.transcript;
    const id=String(input.transcriptId||input.id||'');
    if(getTranscript){
      const found=await getTranscript(id).catch(()=>null);
      if(found)return found;
    }
    if(transcriptIndexData){
      const data=await transcriptIndexData(id).catch(()=>({transcripts:[]}));
      const row=safeArray(data.transcripts)[0];
      if(row)return row;
    }
    return {id,title:input.title||'Transcript',rawText:input.rawText||input.transcriptText||''};
  }
  async function linkageResolver(record={}){
    const unknowns=[],id=record.id||record.transcriptId||record.transcript_id||'';
    const meta=record.metadata||record.metadataJson||record.metadata_json||{};
    const linkage={linked_calendar_event:meta.calendarEventId||record.calendarEventId||record.meetingId||'',linked_meeting_prep_brief:'',linked_people:[],linked_projects:[],linked_crm_records:[],linked_unified_conversations:[],link_confidence:0.35,unresolved_links:[]};
    if(linkage.linked_calendar_event&&meetingPrepService?.getMeetingPrep){
      const brief=await meetingPrepService.getMeetingPrep(linkage.linked_calendar_event).catch(()=>null);
      if(brief){linkage.linked_meeting_prep_brief=brief.id;linkage.link_confidence=0.75;}
    }
    if(resolveMeetingContext){
      const meeting=await resolveMeetingContext({eventId:linkage.linked_calendar_event,title:transcriptTitle(record),date:record.createdAt||record.created_at}).catch(e=>{unknowns.push({source:'meeting_context',reason:e.message});return null;});
      if(meeting?.meeting?.id&&!linkage.linked_calendar_event){linkage.linked_calendar_event=meeting.meeting.id;linkage.link_confidence=Math.max(linkage.link_confidence,0.55);}
      linkage.linked_people=safeArray(meeting?.meeting?.attendees||meeting?.relationshipContext?.attendees).map(a=>({name:a.name,email:a.email,source:'calendar_or_meeting_context'})).slice(0,20);
    }
    if(resolveIdentity){
      for(const person of linkage.linked_people.slice(0,8)){
        const resolved=await resolveIdentity({email:person.email,name:person.name}).catch(()=>null);
        if(resolved?.crm_contact_id)linkage.linked_crm_records.push({crm_contact_id:resolved.crm_contact_id,match_status:resolved.match_status,confidence:resolved.match_confidence});
      }
    }
    if(!linkage.linked_calendar_event)linkage.unresolved_links.push('calendar_event');
    if(!linkage.linked_people.length)linkage.unresolved_links.push('people');
    return {...linkage,unknowns,transcript_id:id};
  }
  async function saveRun(row){
    const columns=['id','tenantId','userId','transcriptId','status','qualityGateJson','linkageJson','evidenceRefsJson','commitmentsJson','contextualTasksJson','relationshipSignalsJson','projectSignalsJson','capacityAndToneContextJson','courageSignalsJson','teachValCandidatesJson','readyForYouCandidatesJson','executiveInstructionsJson','chiefOfStaffSignalsJson','momentumSignalsJson','approvalPoliciesJson','unknownsJson','noActionNeededJson','finalJson','confidence','createdAt','updatedAt'];
    if(hasPg()){
      const values=columns.map(c=>row[c]);
      const names=columns.map(toSnake);
      const params=columns.map((_,i)=>`$${i+1}`).join(',');
      const updates=names.filter(n=>!['id','created_at'].includes(n)).map(n=>`${n}=excluded.${n}`).join(',');
      const r=await dbQuery(`insert into transcript_intelligence_runs (${names.join(',')}) values (${params}) on conflict (id) do update set ${updates} returning *`,values);
      return toCamelRow(r.rows[0]);
    }
    const s=store();const idx=s.transcriptIntelligenceRuns.findIndex(r=>r.id===row.id);
    if(idx>=0)s.transcriptIntelligenceRuns[idx]={...s.transcriptIntelligenceRuns[idx],...row,updatedAt:new Date().toISOString()};else s.transcriptIntelligenceRuns.unshift(row);
    saveStore(s);return idx>=0?s.transcriptIntelligenceRuns[idx]:row;
  }
  async function saveItem(row){
    if(hasPg()){
      const cols=['id','tenantId','userId','runId','transcriptId','category','itemType','title','summary','sourceQuote','sourceRefsJson','linkTargetsJson','approvalPolicy','requiresApproval','confidence','status','metadataJson','createdAt'];
      const values=cols.map(c=>row[c]);
      const names=cols.map(toSnake);
      const params=cols.map((_,i)=>`$${i+1}`).join(',');
      await dbQuery(`insert into transcript_intelligence_items (${names.join(',')}) values (${params})`,values);
      return row;
    }
    const s=store();s.transcriptIntelligenceItems.unshift(row);saveStore(s);return row;
  }
  async function persistContinuationTasks(tasks=[],run={}){
    if(typeof createContinuationTask!=='function')return [];
    const persisted=[];
    for(const task of safeArray(tasks)){
      const linked=task.linked_context||{};
      const project=linked.project||{};
      const relationships=safeArray(linked.relationships);
      const payload={
        id:task.id||uuid('task'),
        title:task.title||'Continue transcript prepared work',
        contactName:relationships[0]?.name||relationships[0]?.email||'',
        dueDate:null,
        notes:[
          task.why||task.context_summary||'Continuation task created from transcript prepared work.',
          project.name?`Project: ${project.name}${project.needs_creation?' (suggested/new project context)':''}`:'',
          task.completed_by_val?.length?'Completed by VAL:\n- '+task.completed_by_val.join('\n- '):'',
          task.remaining_context_needed?.length?'Context needed to finish:\n- '+task.remaining_context_needed.join('\n- '):'',
          'Internal VAL continuation task only. No email, CRM write, calendar write, publish, repository push, or external action happened.'
        ].filter(Boolean).join('\n\n'),
        details:[
          {text:`Created from transcript prepared work: ${run.transcriptId||task.linked_context?.transcript?.id||''}`,ts:new Date().toISOString()},
          {text:`Execution level: ${task.execution_level_label||task.execution_level||'unknown'}`,ts:new Date().toISOString()},
          ...(task.prepared_work_ids||[]).map(id=>({text:`Prepared work: ${id}`,ts:new Date().toISOString()}))
        ],
        completed:false,
        createdAt:new Date().toISOString(),
        source:'transcript_prepared_work',
        transcriptId:run.transcriptId||linked.transcript?.id||'',
        projectId:project.id||'',
        projectName:project.name||'',
        preparedWorkIds:task.prepared_work_ids||[],
        executionLevel:task.execution_level||'',
        completionStatus:task.continuation_status||'candidate',
        noExternalAction:true
      };
      const saved=await createContinuationTask(payload).catch(e=>({ok:false,error:e.message,task:payload}));
      persisted.push(saved?.task||saved||payload);
    }
    return persisted;
  }
  async function intake(input={}){
    const record=await loadTranscript(input);
    const id=String(record.id||record.transcriptId||record.transcript_id||input.transcriptId||uuid('transcript'));
    const gate=qualityGate({...record,id});
    const evidenceRefs=evidenceExtractor({...record,id});
    const linkage=await linkageResolver({...record,id});
    const unknowns=[...safeArray(linkage.unknowns)];
    if(!gate.is_usable)unknowns.push({source:'transcript_quality',reason:'Transcript was not usable enough for full intelligence extraction.'});
    const commitments=gate.is_usable?commitmentExtractor({...record,id},evidenceRefs):[];
    const contextualTasks=taskContextBuilder({...record,id},commitments);
    const relSignals=relationshipSignals({...record,id},safeArray(linkage.linked_people),commitments);
    const projSignals=projectSignals({...record,id});
    const capacity=capacityAndTone({...record,id});
    const courage=courageSignals({...record,id},commitments);
    const teachCandidates=teachValCandidates({...record,id});
    const executiveInstructions=executiveInstructionExtractor({...record,id},gate);
    const crmContacts=typeof listRelationshipContacts==='function'?await listRelationshipContacts({record:{...record,id},linkage,limit:80}).catch(e=>{unknowns.push({source:'relationship_contacts',reason:e.message});return [];}):[];
    const confidence=gate.quality==='high'?0.78:gate.quality==='medium'?0.62:0.45;
    const readyCandidates=followUpCandidates({...record,id},commitments,relSignals.concat(projSignals))
      .concat(preparedWorkCandidates({...record,id},executiveInstructions,linkage,evidenceRefs))
      .concat(introCandidatesFromMatches({record:{...record,id},linkage,crmContacts,evidenceRefs}));
    const preparedByTaskId=new Map(readyCandidates.filter(c=>c.continuation_task?.id).map(c=>[c.continuation_task.id,c]));
    const executionTasks=readyCandidates.filter(c=>c.continuation_task).map((candidate,i)=>({
      id:candidate.continuation_task.id||`execution_task_${i+1}`,
      title:candidate.continuation_task.title||candidate.title,
      why:compactText(`VAL prepared work from transcript evidence and created this continuation handle: ${candidate.summary}`,500),
      source_quote:safeArray(candidate.source_refs)[0]?.quote_or_summary||'',
      context_summary:candidate.summary,
      due_hint:'',
      execution_level:candidate.execution_level,
      execution_level_label:candidate.execution_level_label,
      autonomous_work_possible:candidate.execution_level!=='level_4_human_judgment_required',
      continuation_status:candidate.completion_status==='complete_for_review'?'ready_for_review':'needs_context',
      completed_by_val:candidate.completed_by_val||[],
      remaining_context_needed:candidate.remaining_context_needed||[],
      prepared_work_ids:[candidate.id],
      linked_context:candidate.linked_context,
      approval_policy:candidate.approval_policy||'approval_required',
      requires_approval:true,
      confidence:candidate.confidence||confidence
    }));
    for(const task of executionTasks)if(!contextualTasks.some(t=>t.id===task.id))contextualTasks.push(task);
    for(const task of contextualTasks){
      const candidate=preparedByTaskId.get(task.id);
      if(candidate)task.prepared_work_ids=[candidate.id];
    }
    const chief=chiefSignals(commitments,capacity,courage).concat(executiveInstructions.filter(i=>i.recommended_next_step==='execute_later_packet'||i.recommended_next_step==='prepare_only').slice(0,5).map(i=>({type:'executive_instruction',summary:`Authenticated user instruction: ${i.requested_action}.`,confidence:i.confidence,authorization:i.authorization})));
    const momentum=momentumSignals(commitments,projSignals,relSignals);
    const approvalPolicies=[
      ...commitments.map(c=>({target:c.id,approval_policy:c.approval_policy,reason:'Commitments must be confirmed before becoming actions.'})),
      ...executiveInstructions.map(i=>({target:i.requested_action,approval_policy:i.authorization,reason:i.authorization==='voice_authorized'?'Authenticated user directly authorized this in trusted chat/voice/transcript context.':'Instruction requires preparation, clarification, or approval before action.'})),
      ...teachCandidates.map(c=>({target:c.id,approval_policy:'approval_required',reason:'Teach VAL memory cannot be auto-committed.'})),
      ...readyCandidates.map(c=>({target:c.id,approval_policy:c.approval_policy,reason:'Prepared follow-up requires user judgment.'}))
    ];
    const noActionBase=noActionNeeded({commitments,relationshipSignalsList:relSignals,projectSignalsList:projSignals,teachCandidates});
    const noAction=executiveInstructions.length?{value:false,reason:'Transcript includes one or more explicit executive instructions.'}:noActionBase;
    const final={transcript_id:id,title:transcriptTitle(record),what_changed:noAction.value?'Nothing material changed.':'Transcript produced follow-up intelligence that should be reviewed before action.',counts:{commitments:commitments.length,contextual_tasks:contextualTasks.length,relationship_signals:relSignals.length,project_signals:projSignals.length,teach_val_candidates:teachCandidates.length,ready_for_you_candidates:readyCandidates.length,executive_instructions:executiveInstructions.length,prepared_work_candidates:readyCandidates.filter(c=>c.category==='prepared_work').length,execution_continuation_tasks:executionTasks.length},no_external_action:true};
    const run=await saveRun({id:input.runId||uuid('trintel'),tenantId:tenantId(),userId:userId(),transcriptId:id,status:'completed',qualityGateJson:gate,linkageJson:linkage,evidenceRefsJson:evidenceRefs,commitmentsJson:commitments,contextualTasksJson:contextualTasks,relationshipSignalsJson:relSignals,projectSignalsJson:projSignals,capacityAndToneContextJson:capacity,courageSignalsJson:courage,teachValCandidatesJson:teachCandidates,readyForYouCandidatesJson:readyCandidates,executiveInstructionsJson:executiveInstructions,chiefOfStaffSignalsJson:chief,momentumSignalsJson:momentum,approvalPoliciesJson:approvalPolicies,unknownsJson:unknowns,noActionNeededJson:noAction,finalJson:final,confidence,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});
    const persistedContinuationTasks=await persistContinuationTasks(executionTasks,run);
    if(persistedContinuationTasks.length){
      run.finalJson={...(run.finalJson||{}),counts:{...(run.finalJson?.counts||{}),persisted_continuation_tasks:persistedContinuationTasks.length},persisted_continuation_task_ids:persistedContinuationTasks.map(t=>t.id).filter(Boolean)};
      run.contextualTasksJson=safeArray(run.contextualTasksJson).map(task=>{
        const saved=persistedContinuationTasks.find(t=>String(t.id)===String(task.id));
        return saved?{...task,persisted_task_id:saved.id,continuation_status:saved.completionStatus||task.continuation_status||'ready_for_review'}:task;
      });
      await saveRun(run);
    }
    const itemGroups=[['commitment',commitments],['contextual_task',contextualTasks],['relationship_signal',relSignals],['project_signal',projSignals],['teach_val_candidate',teachCandidates],['ready_for_you_candidate',readyCandidates],['executive_instruction',executiveInstructions],['chief_of_staff_signal',chief],['momentum_signal',momentum]];
    for(const [category,items] of itemGroups){
      for(const item of safeArray(items)){
        const linked=item.linked_context||item.prepared_artifact?.linked_context||{};
        await saveItem({id:uuid('tritem'),tenantId:tenantId(),userId:userId(),runId:run.id,transcriptId:id,category,itemType:item.type||item.instruction_type||category,title:item.title||item.requested_action||item.summary||category,summary:item.summary||item.instruction||'',sourceQuote:item.source_quote||item.authorization_quote||'',sourceRefsJson:item.source_refs||evidenceRefs.slice(0,3),linkTargetsJson:[linkage.linked_calendar_event&&{type:'calendar_event',id:linkage.linked_calendar_event},linkage.linked_meeting_prep_brief&&{type:'meeting_prep_brief',id:linkage.linked_meeting_prep_brief},linked.project&&{type:'project',id:linked.project.id||linked.project.name||'',label:linked.project.name||''},...(safeArray(linked.relationships).map(p=>({type:'relationship',id:p.contactId||p.email||p.name,label:p.name||p.email||''}))),linked.task&&{type:'task',id:linked.task.id||'',label:linked.task.title||''}].filter(Boolean),approvalPolicy:item.approval_policy||item.authorization||'approval_required',requiresApproval:item.requires_approval!==false&&item.authorization!=='voice_authorized',confidence:item.confidence||confidence,status:'candidate',metadataJson:{source:'transcript_intelligence',noExternalAction:true,executiveInstruction:category==='executive_instruction',executionLevel:item.execution_level||item.prepared_artifact?.execution_level||'',completionStatus:item.completion_status||item.prepared_artifact?.completion_status||'',preparedWorkIds:item.prepared_work_ids||[],remainingContextNeeded:item.remaining_context_needed||item.prepared_artifact?.remaining_context_needed||[],linkedContext:linked,preparedArtifact:item.prepared_artifact||null},createdAt:new Date().toISOString()});
      }
    }
    logger.log?.(`[val-transcript-intel] processed ${id}`);
    return {ok:true,run,no_action_needed:noAction,final,ready_for_you_candidates:readyCandidates,no_external_action:true};
  }
  async function getIntelligence(transcriptId){
    if(hasPg()){
      const r=await dbQuery(`select * from transcript_intelligence_runs where tenant_id=$1 and user_id=$2 and transcript_id=$3 order by created_at desc limit 1`,[tenantId(),userId(),transcriptId]);
      return r.rows[0]?toCamelRow(r.rows[0]):null;
    }
    return store().transcriptIntelligenceRuns.filter(r=>r.tenantId===tenantId()&&r.userId===userId()&&String(r.transcriptId)===String(transcriptId)).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)))[0]||null;
  }
  async function prepareFollowUp(transcriptId){
    let run=await getIntelligence(transcriptId);
    if(!run){
      const result=await intake({transcriptId});
      run=result.run;
    }
    const candidates=safeArray(run.readyForYouCandidatesJson||run.ready_for_you_candidates_json);
    return {ok:true,transcriptId,ready_for_you_candidates:candidates,requires_approval:candidates.length>0,no_external_action:true};
  }
  async function listReadyForYouCandidates({limit=5}={}){
    const lim=Math.max(1,Math.min(Number(limit)||5,10));
    let rows=[];
    if(hasPg()){
      const r=await dbQuery(`select * from transcript_intelligence_runs where tenant_id=$1 and user_id=$2 and jsonb_array_length(ready_for_you_candidates_json) > 0 order by created_at desc limit $3`,[tenantId(),userId(),lim]);
      rows=(r.rows||[]).map(toCamelRow);
    }else rows=store().transcriptIntelligenceRuns.filter(r=>r.tenantId===tenantId()&&r.userId===userId()&&safeArray(r.readyForYouCandidatesJson).length).slice(0,lim);
    return rows.flatMap(run=>safeArray(run.readyForYouCandidatesJson).map(c=>({source:'transcript_intelligence',run,id:c.id,transcriptId:run.transcriptId,status:'ready_for_review',title:c.title,summary:c.summary,handoff:c,sourceRefs:c.source_refs||run.evidenceRefsJson||[],confidence:c.confidence||run.confidence||0.65,createdAt:run.createdAt}))).slice(0,lim);
  }
  return {intake,getIntelligence,prepareFollowUp,listReadyForYouCandidates};
}

module.exports={createValTranscriptIntelligenceService,qualityGate,commitmentExtractor,taskContextBuilder,capacityAndTone,executiveInstructionExtractor,preparedWorkCandidates,preparedArtifactForInstruction,introCandidatesFromMatches,currentContactFromLinkage};
