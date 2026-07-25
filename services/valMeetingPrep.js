const {buildRelationshipDossier} = require('./valRelationshipDossier');

function safeArray(value){return Array.isArray(value)?value:[];}
function compactText(value,limit=800){return String(value||'').replace(/\s+/g,' ').trim().slice(0,limit);}
function meetingPrepTimeout(ms,message){
  return new Promise((_,reject)=>setTimeout(()=>reject(new Error(message)),ms));
}
async function withMeetingPrepTimeout(promise,ms,message){
  return Promise.race([promise,meetingPrepTimeout(ms,message)]);
}
function jsonValue(value,fallback){if(value==null)return fallback;if(typeof value==='string'){try{return JSON.parse(value);}catch(_){return fallback;}}return value;}
function toSnake(key){return key.replace(/[A-Z]/g,m=>'_'+m.toLowerCase());}
const MEETING_PREP_JSON_FIELDS = new Set(['qualityGateJson','meetingContextJson','attendeeIntelligenceJson','internalContextJson','meetingStakesJson','firstFiveMinutesJson','briefJson','suggestedQuestionsJson','followUpPreparationJson','readyForYouHandoffJson','postMeetingCaptureJson','sourceRefsJson','unknownsJson']);
function pgValueForMeetingPrepColumn(key,value){
  if(MEETING_PREP_JSON_FIELDS.has(key)) return JSON.stringify(value ?? (/(refs|unknowns|questions|attendee)/i.test(key) ? [] : {}));
  return value;
}
function toCamelRow(row={}){
  const out={};
  for(const [k,v] of Object.entries(row||{})){
    const camel=k.replace(/_([a-z])/g,(_,c)=>c.toUpperCase());
    out[camel]=v instanceof Date?v.toISOString():v;
  }
  for(const key of ['qualityGateJson','meetingContextJson','attendeeIntelligenceJson','internalContextJson','meetingStakesJson','firstFiveMinutesJson','briefJson','suggestedQuestionsJson','followUpPreparationJson','readyForYouHandoffJson','postMeetingCaptureJson','sourceRefsJson','unknownsJson']){
    out[key]=jsonValue(out[key],key.endsWith('Json')&&/refs|unknowns|questions|attendee/i.test(key)?[]:{});
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
function attendeeKey(attendee={}){
  const email=String(attendee.email||attendee.address||'').trim().toLowerCase();
  if(email)return `email:${email}`;
  const name=String(attendee.name||attendee.displayName||attendee.label||'unknown').trim().toLowerCase().replace(/\s+/g,' ');
  return `name:${name||'unknown'}`;
}
function eventIdOf(event={}){
  return String(event.id||event.eventId||event.calendarEventId||event.iCalUID||event.uid||'').trim();
}
function eventTitle(event={}){
  return compactText(event.title||event.summary||event.subject||event.name||'Meeting',160);
}
function eventStart(event={}){
  return event.startTime||event.start||event.startDateTime||event.start?.dateTime||event.date||'';
}
function eventEnd(event={}){
  return event.endTime||event.end||event.endDateTime||event.end?.dateTime||'';
}
function inferAttendees(event={}){
  const raw=safeArray(event.attendees||event.requiredAttendees||event.optionalAttendees||event.participants);
  const attendees=raw.map(a=>{
    const email=String(a.email||a.address||a.emailAddress?.address||a.mail||'').trim().toLowerCase();
    const name=compactText(a.name||a.displayName||a.emailAddress?.name||a.label||email.split('@')[0]||'',120);
    return {name,email,responseStatus:a.responseStatus?.response||a.status||'',self:!!a.self,organizer:!!a.organizer,raw:a};
  }).filter(a=>a.name||a.email);
  const seen=new Set();
  return attendees.filter(a=>{const key=attendeeKey(a);if(seen.has(key))return false;seen.add(key);return true;}).slice(0,30);
}
function protectedOwnerEmails(extra=[]){
  return new Set([
    process.env.ADMIN_EMAIL,
    process.env.VAL_OWNER_EMAIL,
    process.env.GMAIL_USER_EMAIL,
    process.env.OUTLOOK_USER_EMAIL,
    ...(String(process.env.VAL_OWNER_EMAILS||'').split(',')),
    ...safeArray(extra)
  ].map(email=>String(email||'').trim().toLowerCase()).filter(Boolean));
}
let SELF_CALENDAR_EMAILS=protectedOwnerEmails(['jessa@jessagrace.com','jessa@goallprogram.com','jessa@goalprogram.com','jessa.grace@gmail.com']);
function attendeeIsSelf(attendee={}){
  const email=String(attendee.email||attendee.address||attendee.emailAddress?.address||attendee.mail||'').trim().toLowerCase();
  return !!(attendee.self||(email&&SELF_CALENDAR_EMAILS.has(email)));
}
function externalMeetingAttendees(event={}){
  return inferAttendees(event).filter(a=>!attendeeIsSelf(a));
}
function privateCalendarBlockTitle(event={}){
  const text=[eventTitle(event),event.description,event.notes,event.location].filter(Boolean).join(' ').toLowerCase();
  return /\b(mammogram|screening|doctor|dentist|therapy|medical|appointment|annual physical|haircut|personal block|focus block|thinking day|ceo thinking day)\b/.test(text);
}
function isMeetingEvent(event={}){
  return externalMeetingAttendees(event).length>0&&!privateCalendarBlockTitle(event);
}
function qualityGate(event={}){
  const attendees=inferAttendees(event);
  const externalAttendees=externalMeetingAttendees(event);
  const issues=[];
  if(!eventIdOf(event))issues.push('missing_event_id');
  if(!eventTitle(event))issues.push('missing_title');
  if(!eventStart(event))issues.push('missing_start_time');
  if(!externalAttendees.length)issues.push('no_external_attendees');
  if(privateCalendarBlockTitle(event))issues.push('private_calendar_block');
  const quality=(!externalAttendees.length||privateCalendarBlockTitle(event))?'unusable':(issues.length===0?'high':issues.length<=1?'medium':issues.length<=3?'low':'unusable');
  return {
    is_usable:quality!=='unusable',
    quality,
    issues,
    attendee_count:attendees.length,
    external_attendee_count:externalAttendees.length,
    recommended_next_step:quality==='unusable'?'needs_context':(quality==='low'?'process_with_caution':'process')
  };
}
function sourceLabel(source){return ['internal_evidence','api_enriched','public_source','val_inference','unknown'].includes(source)?source:'unknown';}
function crmContactIdFromContact(contact={}){
  if(contact.contactId)return String(contact.contactId);
  if(contact.source==='ghl_contact'&&contact.id)return String(contact.id);
  if(contact.relationshipProfileId)return String(contact.relationshipProfileId);
  if(contact.raw?.relationshipProfileId)return String(contact.raw.relationshipProfileId);
  if(contact.source==='relationship_profile'&&contact.id)return String(contact.id).replace(/^relationship-profile:/,'');
  return '';
}
function savedRelationshipPublicContext(contact={}){
  const context=contact.relationshipEnrichment||contact.raw?.relationshipEnrichment||contact.raw?.relationship_enrichment||contact.raw?.metadata?.relationshipEnrichment||null;
  if(!context||context.status!=='complete')return null;
  const sourceRefs=safeArray(context.sourceRefs||context.source_refs).slice(0,6);
  const latestLinkedIn=sourceRefs.find(ref=>/linkedin_recent_signal/i.test(String(ref.type||ref.sourceType||ref.source_type||'')))
    || sourceRefs.find(ref=>/linkedin/i.test(String(ref.type||ref.sourceType||ref.source_type||'')))
    || safeArray(context.linkedin?.postsLastWeek).find(post=>post?.text)
    || null;
  return {
    provider:String(context.provider||'outscraper'),
    organization:compactText(context.organization,180),
    category:compactText(context.category,180),
    location:compactText(context.location,180),
    website:compactText(context.website,260),
    summary:compactText(context.summary,520),
    query:compactText(context.query,260),
    latestLinkedInPost:compactText(context.latestLinkedInPost||context.latest_linkedin_post||latestLinkedIn?.summary||latestLinkedIn?.text||'',520),
    latestLinkedInUrl:compactText(context.latestLinkedInUrl||context.latest_linkedin_url||latestLinkedIn?.sourceId||latestLinkedIn?.source_id||latestLinkedIn?.url||'',260),
    offers:safeArray(context.offers).map(item=>compactText(item,240)).filter(Boolean).slice(0,4),
    sourceRefs,
    completedAt:context.completedAt||context.completed_at||''
  };
}
function savedRelationshipPublicEvidence(context={}){
  return safeArray(context.sourceRefs).map(ref=>({
    type:ref.type||ref.sourceType||'outscraper_public_context',
    title:ref.title||context.organization||'Saved public relationship context',
    summary:ref.summary||context.summary||'Saved public context from Outscraper.',
    date:context.completedAt||'',
    id:ref.sourceId||ref.source_id||context.website||'',
    confidence:'public_source'
  })).slice(0,4);
}
function meetingPrepPublicContextAgeDays(context={}){
  const raw=context.completedAt||context.completed_at||'';
  const time=raw?new Date(raw).getTime():NaN;
  if(!Number.isFinite(time))return Infinity;
  return Math.max(0,(Date.now()-time)/(24*60*60*1000));
}
function meetingPrepShouldRefreshGeneralPublicContext(context=null){
  if(!context)return true;
  return meetingPrepPublicContextAgeDays(context)>30;
}
function meetingPrepEmailDomain(email=''){
  return String(email||'').trim().toLowerCase().split('@')[1]||'';
}
function meetingPrepGenericEmailDomain(domain=''){
  return /^(gmail|googlemail|yahoo|outlook|hotmail|icloud|me|mac|aol|protonmail)\./i.test(String(domain||'').trim());
}
function meetingPrepUrlDomain(value=''){
  const raw=String(value||'').trim();
  if(!raw)return '';
  try{
    return new URL(/^https?:\/\//i.test(raw)?raw:`https://${raw}`).hostname.replace(/^www\./i,'').toLowerCase();
  }catch(_){
    return raw.replace(/^https?:\/\//i,'').replace(/^www\./i,'').replace(/\/.*$/,'').toLowerCase();
  }
}
function meetingPrepKnownLinkedInUrl(attendee={},contact={}){
  const enrichmentRefs=safeArray(contact.relationshipEnrichment?.sourceRefs||contact.relationshipEnrichment?.source_refs||contact.raw?.relationshipEnrichment?.sourceRefs||contact.raw?.relationshipEnrichment?.source_refs);
  const linkedinRef=enrichmentRefs.find(ref=>/linkedin/i.test(String(ref.sourceId||ref.url||ref.source_url||ref.summary||'')));
  return compactText(
    attendee.linkedinUrl||attendee.linkedin_url||
    contact.linkedinUrl||contact.linkedin_url||
    contact.raw?.linkedinUrl||contact.raw?.linkedin_url||
    contact.raw?.metadata?.linkedinUrl||contact.raw?.metadata?.linkedin_url||
    linkedinRef?.sourceId||linkedinRef?.url||linkedinRef?.source_url||
    '',
    260
  );
}
function meetingPrepLinkedInActivityUrl(profileUrl=''){
  const clean=String(profileUrl||'').replace(/[#?].*$/,'').replace(/\/$/,'').trim();
  if(!clean)return '';
  if(/linkedin\.com\/in\//i.test(clean))return `${clean}/recent-activity/all/`;
  return clean;
}
function meetingPrepWords(value=''){
  return String(value||'').toLowerCase().replace(/[^a-z0-9@.]+/g,' ').split(/\s+/).filter(Boolean);
}
function meetingPrepPublicContextHaystack(context={}){
  const refs=safeArray(context.sourceRefs||context.source_refs).flatMap(ref=>[ref.title,ref.summary,ref.sourceId,ref.source_id,ref.url]);
  return [
    context.organization,context.category,context.location,context.website,context.summary,context.query,
    context.latestLinkedInPost,context.latest_linkedin_post,context.latestLinkedInUrl,context.latest_linkedin_url,
    ...refs
  ].filter(Boolean).join(' ').toLowerCase();
}
function meetingPrepPublicContextTrust(context=null,attendee={},contact={}){
  if(!context)return {trusted:false,reason:'no_public_context'};
  if(context.status&&context.status!=='complete')return {trusted:false,reason:`public_status_${context.status}`};
  const email=String(attendee.email||contact.email||'').trim().toLowerCase();
  const domain=meetingPrepEmailDomain(email);
  const usableDomain=domain&&!meetingPrepGenericEmailDomain(domain)?domain:'';
  const attendeeName=compactText(attendee.name||contact.name||contact.displayName||'',140).toLowerCase();
  const contactOrg=compactText(contact.company||contact.organization||contact.raw?.company||contact.raw?.organization||'',180).toLowerCase();
  const websiteDomain=meetingPrepUrlDomain(context.website||context.latestLinkedInUrl||context.latest_linkedin_url||'');
  const haystack=meetingPrepPublicContextHaystack(context);
  if(email&&haystack.includes(email))return {trusted:true,reason:'matched_attendee_email'};
  if(usableDomain&&(websiteDomain===usableDomain||websiteDomain.endsWith(`.${usableDomain}`)||haystack.includes(usableDomain)))return {trusted:true,reason:'matched_attendee_domain'};
  if(contactOrg&&contactOrg.length>=4&&haystack.includes(contactOrg))return {trusted:true,reason:'matched_known_relationship_company'};
  const linkedInUrl=String(attendee.linkedinUrl||attendee.linkedin_url||contact.linkedinUrl||contact.linkedin_url||contact.raw?.linkedinUrl||'').trim().toLowerCase();
  if(linkedInUrl&&haystack.includes(linkedInUrl.replace(/^https?:\/\//,'')))return {trusted:true,reason:'matched_known_linkedin_url'};
  const nameTokens=meetingPrepWords(attendeeName).filter(token=>token.length>2&&!['the','and','with','meet','meeting'].includes(token));
  const fullNameSeen=nameTokens.length>=2&&nameTokens.every(token=>haystack.includes(token));
  if(fullNameSeen&&(usableDomain||contactOrg))return {trusted:true,reason:'matched_name_plus_internal_anchor'};
  return {trusted:false,reason:domain&&meetingPrepGenericEmailDomain(domain)?'generic_email_requires_stronger_public_match':'public_identity_not_verified'};
}
function unverifiedPublicContextStatus(context=null,trust={}){
  return {
    status:'unverified_match',
    provider:context?.provider||'outscraper',
    result_status:context?.status||'unverified',
    query:context?.query||'',
    summary:'Public match was not verified for this attendee, so VAL did not use scraped role, company, website, or LinkedIn details.',
    website:'',
    organization:'',
    latest_linkedin_post:'',
    latest_linkedin_url:'',
    reason:trust?.reason||'public_identity_not_verified'
  };
}
function savedRelationshipManualContext(contact={}){
  const context=contact.relationshipManualContext||contact.raw?.relationshipManualContext||contact.raw?.relationship_manual_context||contact.raw?.metadata?.relationshipManualContext||null;
  if(!context||typeof context!=='object')return null;
  const values=(section)=>safeArray(context[section]?.values).map(item=>compactText(item,360)).filter(Boolean).slice(0,8);
  const relationship=compactText(context.relationship?.value||values('relationship')[0]||'',700);
  const needs=values('needs');
  const offers=values('offers');
  const evidence=values('evidence');
  if(!relationship&&!needs.length&&!offers.length&&!evidence.length)return null;
  return {relationship,needs,offers,evidence,updatedAt:context.updatedAt||context.updated_at||''};
}
function savedRelationshipManualEvidence(context={},contact={}){
  const relationshipName=compactText(contact.name||contact.displayName||'Relationship',180);
  return [
    ...safeArray(context.evidence),
    ...safeArray(context.needs),
    ...safeArray(context.offers),
    ...(context.relationship?[context.relationship]:[])
  ].map((summary,index)=>({
    type:'user_confirmed_relationship_context',
    title:`User-confirmed context for ${relationshipName}`,
    summary,
    date:context.updatedAt||'',
    id:`user_confirmed_relationship_context_${index}`,
    confidence:'internal_evidence'
  })).slice(0,12);
}
function contactCreationCandidateFromAttendee({attendee={},event={},resolution={}}={}){
  const name=compactText(attendee.name||attendee.email||'Calendar attendee',120);
  const email=String(attendee.email||'').trim().toLowerCase();
  const payload={
    name,
    email:email||undefined,
    source:'VAL calendar attendee',
    tags:['val_calendar_attendee','val_needs_relationship_review'],
    note:[
      `Created from calendar attendee after CRM lookup did not find an existing contact.`,
      eventTitle(event)?`Meeting: ${eventTitle(event)}`:'',
      eventStart(event)?`Meeting time: ${eventStart(event)}`:'',
      resolution.reason?`Resolver note: ${resolution.reason}`:''
    ].filter(Boolean).join('\n')
  };
  return {
    id:'create_crm_contact_from_calendar_attendee',
    label:'Create CRM contact',
    intent:'identity_resolution',
    requiresApproval:true,
    endpoint:'/api/val/contacts/create',
    method:'POST',
    payload,
    willDo:'Create a new CRM contact from this calendar attendee after review.',
    willNotDo:'VAL will not merge contacts, send messages, add opportunities, or create a Relationship Dossier until CRM returns a contact ID.',
    onSuccess:'Use the returned contact.id/contactId as crm_contact_id, then rebuild the Relationship Dossier with that canonical ID.'
  };
}
function classifyRole(event={},attendees=[]){
  const title=eventTitle(event).toLowerCase();
  const organizer=String(event.organizer?.email||event.organizerEmail||event.creator?.email||'').toLowerCase();
  let role='unknown',why='Role is inferred only from calendar metadata and title.';
  if(/\b(intro|introduction)\b/.test(title)){role='introduced_party';why='Title suggests an introduction.';}
  if(/\b(discovery|demo|proposal|sales|pitch)\b/.test(title)){role='seller';why='Title suggests the user may be presenting or selling.';}
  if(/\b(review|decision|approve|finalize)\b/.test(title)){role='decision_maker';why='Title suggests a decision or review meeting.';}
  if(/\b(check.?in|sync|1:1|one on one)\b/.test(title)){role='partner';why='Title suggests a relationship or collaboration sync.';}
  if(organizer){role=role==='unknown'?'host':role;why+=' Calendar organizer metadata is available.';}
  return {user_role:role,why,confidence:role==='unknown'?0.35:0.62};
}
function meetingStakes(event={},attendees=[],internal={}){
  const text=[eventTitle(event),event.description,event.notes,JSON.stringify(internal)].join(' ').toLowerCase();
  const high=/\b(proposal|contract|invoice|pricing|renewal|partner|partnership|investor|client|launch|decision|finalize|urgent|conflict|repair)\b/.test(text);
  const medium=/\b(intro|introduction|follow.?up|demo|discovery|scope|workflow|project)\b/.test(text);
  const level=high?'high':medium?'medium':attendees.length?'medium':'unknown';
  return {
    relationship_stakes:/\b(intro|relationship|partner|trust|repair|conflict)\b/.test(text)?'high':level,
    revenue_stakes:/\b(proposal|contract|invoice|pricing|revenue|client|renewal|sale)\b/.test(text)?'high':(medium?'medium':'unknown'),
    trust_stakes:/\b(waiting|owed|promise|repair|conflict|sensitive|follow.?up)\b/.test(text)?'high':(attendees.length?'medium':'unknown'),
    capacity_stakes:/\b(back.?to.?back|long|full|prep|heavy)\b/.test(text)?'medium':'unknown',
    opportunity_stakes:/\b(intro|partner|opportunity|investor|referral|launch|demo)\b/.test(text)?'high':(medium?'medium':'unknown'),
    why:high?'The meeting contains high-stakes business, relationship, or timing language.':medium?'The meeting likely has relationship or project movement potential.':'Evidence is too thin to judge stakes confidently.'
  };
}
function firstFiveMinutes({event={},role={},stakes={},attendees=[]}={}){
  const first=attendees[0]?.name||'there';
  const sensitive=['high'].includes(stakes.trust_stakes)||/repair|conflict/i.test(eventTitle(event));
  const opening=sensitive?'calm, context-first, and not performative':(role.user_role==='seller'?'clear, useful, and low-pressure':'warm, grounded, and direct');
  return {
    opening_posture:opening,
    first_sentence_option:sensitive?`Before we jump in, I want to make sure I understand what matters most from your side today.`:`${first}, I’m glad we’re connecting. I’d love to start by understanding what would make this useful for you.`,
    what_to_acknowledge:[eventTitle(event)].filter(Boolean).slice(0,1),
    what_not_to_lead_with:['Do not recite scraped facts, personal details, or recent posts unless they are natural and clearly relevant.'],
    early_question:role.user_role==='introduced_party'?'What would make this introduction most useful for you right now?':'What would make this meeting a good use of your time today?',
    confidence:0.62
  };
}
function meetingPrepEvidenceLine(value,limit=420){
  if(!value)return '';
  if(typeof value==='string')return compactText(value,limit);
  return compactText(value.summary||value.text||value.notes||value.title||value.subject||value.name||'',limit);
}
function meetingPrepBriefPacket({event={},attendees=[],attendeeIntel=[],internal={},stakes={},role={},firstFive={},questions=[],followUp={},projectLinks=[],meetingType={}}={}){
  const attendeeNames=attendees.map(a=>a.name||a.email).filter(Boolean).slice(0,6);
  const firstMeeting=meetingType.type==='first_meeting';
  const knownAttendees=attendeeIntel.filter(a=>a.crm_contact_id||a.user_confirmed_relationship_context||a.relationship_dossier||a.relationship_context);
  const transcriptChanges=safeArray(internal.transcripts)
    .map(t=>meetingPrepEvidenceLine(t.summary||t.rawText||t.title,520))
    .filter(Boolean)
    .slice(0,6);
  const emailChanges=safeArray(internal.relationshipContext?.emailContext||internal.emailContext)
    .map(item=>meetingPrepEvidenceLine(item.summary||item.subject||item.text,360))
    .filter(Boolean)
    .slice(0,4);
  const openLoops=safeArray(internal.openLoops)
    .map(item=>meetingPrepEvidenceLine(item.text||item.summary||item.title||item,360))
    .filter(Boolean)
    .slice(0,6);
  const relationshipContext=attendeeIntel
    .map(a=>meetingPrepEvidenceLine(a.relationship_context||a.why_this_person_matters||a.relationship_dossier?.summary,520))
    .filter(Boolean)
    .slice(0,8);
  const publicContext=attendeeIntel.map(a=>{
    const profile=a.public_profile||{};
    const status=a.public_context_status||{};
    const name=a.name||a.email||'Attendee';
    const pieces=[
      profile.website?`${name} website: ${profile.website}`:'',
      profile.latest_linkedin_post?`${name} latest LinkedIn signal: ${profile.latest_linkedin_post}`:'',
      profile.latest_linkedin_url&&!profile.latest_linkedin_post?`${name} LinkedIn activity: ${profile.latest_linkedin_url}`:'',
      profile.summary?`${name} public context: ${profile.summary}`:'',
      !profile.summary&&status.summary?`${name} public status: ${status.summary}`:''
    ].filter(Boolean);
    return pieces.join(' ');
  }).filter(Boolean).slice(0,8);
  const projectContext=safeArray(projectLinks)
    .map(link=>compactText([link.project_name||link.projectName||link.project_id,link.summary].filter(Boolean).join(': '),520))
    .filter(Boolean)
    .slice(0,6);
  const attendeesPacket=attendeeIntel.map(a=>{
    const profile=a.public_profile||{};
    return {
      name:compactText(a.name||a.email||'Attendee',160),
      email:compactText(a.email||'',180),
      match_status:compactText(String(a.match_status||'needs review').replace(/_/g,' '),120),
      relationship_attached:!!a.crm_contact_id,
      relationship_summary:meetingPrepEvidenceLine(a.relationship_context||a.why_this_person_matters||a.user_confirmed_relationship_context?.relationship,520),
      what_changed:transcriptChanges.filter(line=>line.toLowerCase().includes(String(a.name||a.email||'').split(' ')[0].toLowerCase())).slice(0,3),
      public_summary:meetingPrepEvidenceLine(profile.latest_linkedin_post||profile.summary||a.public_context_status?.summary,520),
      website:compactText(profile.website||'',260),
      linkedin_url:compactText(profile.latest_linkedin_url||'',260)
    };
  }).slice(0,10);
  const hasManyOpenLoops=openLoops.length>=3;
  const hasSomeHistory=transcriptChanges.length||emailChanges.length||relationshipContext.length;
  const topJudgment=hasManyOpenLoops
    ? `This meeting needs direction more than discovery. There are multiple open loops in the packet, so enter by naming ambiguity, choosing owners, and leaving with fewer unresolved threads.`
    : firstMeeting
    ? `This looks like a first meeting with ${attendeeNames.join(', ')||'the attendee'}. Lead with orientation, useful questions, and current public context, not assumptions.`
    : knownAttendees.length
      ? `This is not a first meeting. Treat it as alignment and follow-through with ${attendeeNames.join(', ')||'known attendees'}: use the relationship history, name open loops, and leave with clear ownership.`
      : hasSomeHistory
        ? `This meeting has internal context, but the relationship mapping is incomplete. Use the recent history and open questions without pretending the attendee packet is fully resolved.`
        : `This is not fully mapped yet. Use the calendar context and any recent transcripts, then ask clean questions instead of pretending the packet knows more than it does.`;
  return {
    version:'meeting_prep_brief_packet_v1',
    meeting_title:eventTitle(event),
    meeting_type:meetingType.type||'unknown',
    meeting_type_label:meetingType.label||'Meeting prep',
    meeting_type_focus:meetingType.focus||'',
    top_judgment:compactText(topJudgment,520),
    attendees:attendeesPacket,
    relationship_context:relationshipContext,
    project_context:projectContext,
    what_changed_since_last_spoke:[...transcriptChanges,...emailChanges].slice(0,8),
    open_loops:openLoops,
    public_context:publicContext,
    how_to_enter:compactText(firstFive.first_sentence_option||firstFive.early_question||'',360),
    questions:safeArray(questions).map(q=>meetingPrepEvidenceLine(q.text||q,260)).filter(Boolean).slice(0,6),
    risks:safeArray(openLoops.length?[`Open loops may need acknowledgment: ${openLoops.slice(0,2).join('; ')}`]:[]).concat(safeArray(stakes.why?[stakes.why]:[])).filter(Boolean).slice(0,5),
    likely_follow_up:safeArray(followUp.notes?[followUp.notes]:[]).concat(safeArray(followUp.possible_recipients).map(r=>`Follow up recipient: ${[r.name,r.email].filter(Boolean).join(' ')}`)).filter(Boolean).slice(0,6),
    evidence_summary:safeArray(internal.sourcesChecked).map(item=>compactText(item,180)).filter(Boolean).slice(0,8),
    source_confidence_label:'internal_evidence',
    no_external_action:true
  };
}
function buildBrief({event={},attendees=[],attendeeIntel=[],internal={},stakes={},role={}}={}){
  const title=eventTitle(event);
  const names=attendees.map(a=>a.name||a.email).filter(Boolean).slice(0,5);
  const openLoops=safeArray(internal.openLoops).map(o=>o.text||o.title||o.summary||o).filter(Boolean).slice(0,5);
  const relationshipLines=attendeeIntel.map(a=>a.relationship_context||a.why_this_person_matters).filter(Boolean).slice(0,5);
  const meetingType=internal.meeting_type||{};
  const firstMeeting=meetingType.type==='first_meeting';
  const knownMeetingPurpose=meetingType.focus || 'Review relationship context, project context, what changed, and the next useful move.';
  return {
    meeting_title:title,
    meeting_type:meetingType.type||'unknown',
    meeting_type_label:meetingType.label||'Meeting prep',
    concise_brief:compactText(firstMeeting
      ? `This looks like a first conversation with ${names.join(', ')||'the attendee'}. VAL should prioritize public context, website, LinkedIn signals, and trust-building questions before assuming relationship history.`
      : `This meeting sits inside ${names.length?'relationships with '+names.join(', '):'the user’s calendar context'}, active commitments, timing, and opportunity signals.`,500),
    likely_purpose:compactText(firstMeeting?'Learn who this person is, what matters to them, and whether there is a useful next step without over-assuming context.':knownMeetingPurpose,400),
    attendees:names,
    relationship_context:relationshipLines,
    recent_changes:safeArray(internal.transcripts).map(t=>t.summary||t.rawText||t.title).filter(Boolean).slice(0,4),
    possible_opportunities:attendeeIntel.flatMap(a=>safeArray(a.possible_opportunities)).slice(0,5),
    risks_or_sensitivities:openLoops.length?[`Open loops may need acknowledgment: ${openLoops.slice(0,2).join('; ')}`]:[],
    what_val_recommends_preparing:firstMeeting
      ? ['Review public profile and website','Check the latest LinkedIn signal','Prepare a warm first-meeting opening question']
      : ['Review attendee context','Clarify the one useful outcome','Prepare one natural opening question'],
    source_confidence_labels:['internal_evidence','val_inference','unknown']
  };
}
function suggestedQuestions({role={},stakes={}}={}){
  const questions=['What would make this meeting most useful for you?'];
  if(stakes.opportunity_stakes==='high')questions.push('Where do you see the biggest opportunity or constraint right now?');
  if(stakes.trust_stakes==='high')questions.push('Is there anything I should understand before we decide the next step?');
  if(role.user_role==='seller')questions.push('What would you need to see to know this is worth moving forward?');
  questions.push('What should happen after this conversation?');
  return questions.slice(0,5).map((text,i)=>({text,why:i===0?'Creates a grounded opening.':'Supports meeting movement without forcing it.',source_confidence_label:'val_inference'}));
}
function followUpPreparation({event={},attendees=[],internal={}}={}){
  return {
    likely_follow_up_needed:!!attendees.length,
    draft_follow_up_candidate:attendees.length,
    possible_recipients:attendees.map(a=>({name:a.name,email:a.email})).filter(a=>a.email).slice(0,8),
    expected_follow_up_type:'meeting_recap_or_next_step',
    approval_policy:'approval_required',
    representation_risk:'medium',
    no_external_action:true,
    notes:compactText(safeArray(internal.openLoops).map(o=>o.text||o.title||o.summary||o).filter(Boolean).join(' | '),700)
  };
}
function postCapturePrompt(event={}){
  return `What changed in ${eventTitle(event)} that I should not miss?`;
}

function meetingOverviewApprovalSetting(event={}){
  return {
    setting_id:'meeting_overview_approval_required',
    label:'Meeting Overview Approval',
    status:'approval_required',
    applies_to:'meeting_overview',
    default_behavior:'prepare_for_review',
    user_can_change_later:true,
    requires_approval:true,
    no_external_action:true,
    summary:`VAL may prepare the meeting overview for ${eventTitle(event)}, but it should wait for human approval before sending, posting, updating CRM, or treating the overview as final.`
  };
}

function projectContextLinks(event={},internal={}){
  const links=[];
  const add=(projectId,source,summary='',confidence=0.65,projectName='')=>{
    const id=String(projectId||'').trim();
    if(!id||links.some(link=>link.project_id===id))return;
    links.push({
      project_id:id,
      project_name:compactText(projectName||id,160),
      source,
      summary:compactText(summary||`Calendar event appears connected to project ${id}.`,500),
      confidence,
      review_required:true,
      no_external_action:true
    });
  };
  const meta=event.metadata||event.metadataJson||{};
  add(event.projectId||event.project_id||meta.projectId||meta.project_id,'calendar_event_metadata',eventTitle(event),0.78,event.projectName||event.project_name||meta.projectName||meta.project_name);
  for(const row of safeArray(internal.openLoops).concat(safeArray(internal.tasks),safeArray(internal.transcripts))){
    add(row.projectId||row.project_id||row.metadata?.projectId||row.metadataJson?.projectId,'internal_context',row.summary||row.title||row.text||'',0.7,row.projectName||row.project_name||row.metadata?.projectName||'');
  }
  return links.slice(0,8);
}

function profileWords(value=''){
  return String(value||'').toLowerCase().replace(/[^a-z0-9\s]/g,' ').split(/\s+/)
    .filter(word=>word.length>=4&&!['meeting','calendar','transcript','project','with','from','jessa','grace','google','zoom'].includes(word));
}
function projectProfileId(profile={}){
  return String(profile.projectId||profile.project_id||profile.profileKey||profile.profile_key||profile.id||'').trim();
}
function projectProfileName(profile={}){
  return compactText(profile.displayName||profile.display_name||profile.name||profile.projectName||projectProfileId(profile),160);
}
function matchSavedProjectProfiles(event={},internal={},projectProfiles=[]){
  const text=[
    eventTitle(event),
    event.description,
    event.notes,
    event.location,
    JSON.stringify(inferAttendees(event)),
    JSON.stringify(safeArray(internal.transcripts).map(t=>({title:t.title,summary:t.summary||t.rawText}))),
    JSON.stringify(safeArray(internal.tasks).map(t=>({title:t.title,summary:t.summary||t.notes}))),
    JSON.stringify(internal.relationshipContext||{})
  ].filter(Boolean).join(' ').toLowerCase();
  if(!text.trim())return [];
  return safeArray(projectProfiles).map(profile=>{
    const metadata=profile.metadata||profile.metadataJson||profile.metadata_json||{};
    const candidates=[
      projectProfileName(profile),
      projectProfileId(profile),
      profile.profileKey,
      profile.profile_key,
      metadata.projectName,
      metadata.project,
      metadata.intake?.projectName,
      metadata.intake?.projectId
    ].filter(Boolean);
    let score=0;
    const matched=[];
    for(const candidate of candidates){
      const words=profileWords(candidate);
      if(!words.length)continue;
      const hits=words.filter(word=>text.includes(word));
      if(hits.length){
        score=Math.max(score,hits.length/words.length);
        matched.push(...hits);
      }
    }
    if(score<=0)return null;
    return {
      project_id:projectProfileId(profile),
      project_name:projectProfileName(profile),
      source:'saved_project_profile_match',
      summary:`VAL matched this meeting to ${projectProfileName(profile)} from the calendar, attendee, transcript, task, or relationship context.`,
      confidence:Math.min(0.88,Math.max(0.62,Number((0.55+score*0.28).toFixed(2)))),
      review_required:true,
      no_external_action:true,
      matched_terms:Array.from(new Set(matched)).slice(0,8)
    };
  }).filter(Boolean)
    .sort((a,b)=>b.confidence-a.confidence)
    .slice(0,5);
}

function mergeProjectContextLinks(primary=[],extra=[]){
  const byId=new Map();
  for(const link of safeArray(primary).concat(safeArray(extra))){
    const id=String(link.project_id||link.projectId||'').trim();
    if(!id)continue;
    const current=byId.get(id);
    if(!current||Number(link.confidence||0)>Number(current.confidence||0))byId.set(id,link);
  }
  return Array.from(byId.values()).slice(0,8);
}

function classifyMeetingPrepType({attendees=[],attendeeIntel=[],internal={},projectLinks=[]}={}){
  const transcriptCount=safeArray(internal.transcripts).length;
  const emailContextCount=safeArray(internal.relationshipContext?.emailContext).length;
  const openLoopCount=safeArray(internal.openLoops).length;
  const taskCount=safeArray(internal.tasks).length;
  const hasProject=safeArray(projectLinks).length>0;
  const hasRelationship=attendeeIntel.some(attendee=>attendee.crm_contact_id||attendee.user_confirmed_relationship_context||attendee.saved_relationship_context||attendee.relationship_dossier||/^matched/i.test(String(attendee.match_status||'')));
  const hasPriorEvidence=transcriptCount>0||emailContextCount>0||openLoopCount>0||taskCount>0;
  const reasons=[];
  if(hasRelationship)reasons.push('relationship_attached');
  if(hasProject)reasons.push('project_linked');
  if(transcriptCount)reasons.push(`${transcriptCount} prior transcript${transcriptCount===1?'':'s'}`);
  if(emailContextCount)reasons.push(`${emailContextCount} email context item${emailContextCount===1?'':'s'}`);
  if(openLoopCount)reasons.push(`${openLoopCount} open loop${openLoopCount===1?'':'s'}`);
  if(taskCount)reasons.push(`${taskCount} task${taskCount===1?'':'s'}`);
  let type='first_meeting';
  let label='First meeting prep';
  let focus='Prioritize public research, website, LinkedIn, identity, and trust-building questions.';
  if(hasProject){
    type='project_followup';
    label='Project follow-up prep';
    focus='Prioritize project status, decisions, owners, open loops, and follow-through.';
  }else if(hasRelationship&&hasPriorEvidence){
    type='known_relationship';
    label='Known relationship prep';
    focus='Prioritize what changed, open loops, relationship context, and the next useful move.';
  }else if(hasRelationship){
    type='known_relationship_light_context';
    label='Known relationship, light context';
    focus='Use the relationship file, but ask clean questions because recent evidence is thin.';
  }else if(hasPriorEvidence){
    type='new_contact_with_light_context';
    label='New contact with light context';
    focus='Blend public research with the limited prior evidence without over-assuming familiarity.';
  }
  return {
    type,
    label,
    focus,
    confidence:type==='first_meeting'&&!safeArray(attendees).length?0.35:(hasRelationship||hasProject||hasPriorEvidence?0.78:0.66),
    evidence:reasons.length?reasons:['no prior relationship, project, email, task, or transcript evidence found'],
    no_external_action:true
  };
}

function createValMeetingPrepService({
  dbQuery,
  hasPg=()=>false,
  getStore=()=>({}),
  saveStore=()=>{},
  uuid=(prefix)=>`${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`,
  tenantId=()=>'default',
  userId=()=>'default',
  loadContextCalendarEvents=null,
  resolveContactFromContext=null,
  resolveMeetingContext=null,
  listProjectProfiles=null,
  enrichRelationshipPublicContext=null,
  ensureRelationshipPacketFromAttendee=null,
  saveCalendarProjectLink=null,
  afterPublicContextEvent=null,
  ownerEmails=[],
  logger=console
}={}){
  SELF_CALENDAR_EMAILS=protectedOwnerEmails(ownerEmails);
  function scope(){return {tenantId:tenantId(),userId:userId()};}
  function store(){
    const s=getStore()||{};
    for(const key of ['meetingPrepBriefs','attendeeIntelligence','externalResearchResults'])if(!Array.isArray(s[key]))s[key]=[];
    return s;
  }
  async function findEvent(input={}){
    const suppliedEvent=input.event&&typeof input.event==='object'?input.event:null;
    const id=String(input.eventId||input.calendarEventId||input.id||suppliedEvent?.id||suppliedEvent?.eventId||suppliedEvent?.calendarEventId||'');
    const title=input.title||suppliedEvent?.title||suppliedEvent?.summary||'';
    const date=input.date||input.startTime||input.start||suppliedEvent?.startTime||suppliedEvent?.start||suppliedEvent?.date||'';
    if(suppliedEvent&&externalMeetingAttendees(suppliedEvent).length)return suppliedEvent;
    if(resolveMeetingContext){
      const resolved=await resolveMeetingContext({eventId:id,calendarEventId:id,title,date,startTime:date}).catch(e=>({errors:[e.message]}));
      if(resolved?.meeting)return resolved.meeting;
    }
    if(loadContextCalendarEvents){
      const start=new Date(date||Date.now()-7*24*60*60*1000);
      const end=new Date(date||Date.now()+14*24*60*60*1000);
      if(date){start.setHours(0,0,0,0);end.setHours(23,59,59,999);}
      const loaded=await loadContextCalendarEvents(start,end).catch(e=>({events:[],errors:[e.message]}));
      const found=safeArray(loaded.events).find(e=>id&&(String(e.id)===id||String(e.eventId)===id));
      if(found)return found;
    }
    if(suppliedEvent)return suppliedEvent;
    return {id,title:title||'Meeting',startTime:input.startTime||input.date||'',endTime:input.endTime||'',attendees:input.attendees||[],source:input.source||'unknown'};
  }
  async function gatherInternal(event){
    if(resolveMeetingContext){
      const ctx=await resolveMeetingContext({
        event,
        eventId:eventIdOf(event),
        calendarEventId:eventIdOf(event),
        title:eventTitle(event),
        date:eventStart(event),
        startTime:eventStart(event),
        attendees:inferAttendees(event)
      }).catch(e=>({ok:false,errors:[e.message]}));
      return {
        contactResolution:ctx.contactResolution||{},
        relationshipContext:ctx.relationshipContext||{},
        transcripts:safeArray(ctx.transcripts),
        tasks:safeArray(ctx.tasks),
        openLoops:safeArray(ctx.openLoops),
        sourcesChecked:safeArray(ctx.sourcesChecked),
        errors:safeArray(ctx.errors)
      };
    }
    return {contactResolution:{},relationshipContext:{},transcripts:[],tasks:[],openLoops:[],sourcesChecked:[],errors:['resolveMeetingContext unavailable']};
  }
  async function resolveAttendees(event,internal){
    const attendees=externalMeetingAttendees(event);
    const out=[];
    for(const attendee of attendees){
      const unknowns=[];
      let resolution={status:'unknown',confidence:0,contact:null,reason:'Contact resolver unavailable.'};
      if(resolveContactFromContext){
        resolution=await resolveContactFromContext({name:attendee.name,email:attendee.email,calendarEvent:event}).catch(e=>({status:'unknown',confidence:0,contact:null,reason:e.message}));
      }else unknowns.push('Contact resolver unavailable.');
      let contact=resolution.contact||{};
      if(typeof ensureRelationshipPacketFromAttendee==='function'){
        const ensured=await ensureRelationshipPacketFromAttendee({attendee,event,contact,resolution,internal}).catch(e=>{
          unknowns.push(`calendar_attendee_packet_failed:${e.message}`);
          return null;
        });
        if(ensured?.contact){
          contact={
            ...ensured.contact,
            ...contact,
            relationshipProfileId:contact.relationshipProfileId||contact.raw?.relationshipProfileId||ensured.contact.relationshipProfileId||ensured.profile?.id||'',
            relationshipEnrichment:contact.relationshipEnrichment||ensured.contact.relationshipEnrichment||ensured.profile?.metadata?.relationshipEnrichment||null,
            raw:{...(ensured.contact.raw||{}),...(contact.raw||{}),relationshipProfileId:contact.raw?.relationshipProfileId||ensured.contact.relationshipProfileId||ensured.profile?.id||''}
          };
          if(!resolution.contact){
            resolution={...resolution,contact,status:'created_from_calendar_attendee',confidence:Math.max(Number(resolution.confidence||0),0.58),reason:'VAL created or updated the Relationship packet from the calendar attendee.'};
          }
        }
      }
      const crmContactId=crmContactIdFromContact(contact);
      let savedPublicContext=savedRelationshipPublicContext(contact);
      let publicContextTrust=meetingPrepPublicContextTrust(savedPublicContext,attendee,contact);
      if(savedPublicContext&&!publicContextTrust.trusted){
        unknowns.push(`public_context_unverified:${publicContextTrust.reason}`);
        savedPublicContext=null;
      }
      const savedPublicContextHasLinkedIn=Boolean(savedPublicContext?.latestLinkedInPost || savedPublicContext?.latestLinkedInUrl);
      const refreshGeneralPublicContext=meetingPrepShouldRefreshGeneralPublicContext(savedPublicContext);
      let publicContextStatus=savedPublicContext
        ? {status:'reused_saved',provider:savedPublicContext.provider||'outscraper',summary:savedPublicContext.summary||'Saved public relationship context was reused for this meeting prep.',website:savedPublicContext.website||'',organization:savedPublicContext.organization||'',latest_linkedin_post:savedPublicContext.latestLinkedInPost||'',latest_linkedin_url:savedPublicContext.latestLinkedInUrl||'',query:savedPublicContext.query||'',general_web_status:refreshGeneralPublicContext?'stale_refresh_requested':'cached',general_web_checked_at:savedPublicContext.completedAt||'',recent_activity_status:'refresh_requested'}
        : (publicContextTrust.reason==='no_public_context'
          ? {status:'not_checked',provider:'outscraper',summary:'Public context has not been checked yet.',general_web_status:'not_checked',recent_activity_status:'refresh_requested'}
          : unverifiedPublicContextStatus(savedRelationshipPublicContext(contact),publicContextTrust));
      if(typeof enrichRelationshipPublicContext==='function'){
        const relationshipId=contact.relationshipProfileId||contact.raw?.relationshipProfileId||contact.id||contact.contactId||attendee.email||attendee.name||'';
        if(relationshipId){
          const enriched=await withMeetingPrepTimeout(enrichRelationshipPublicContext({
            relationshipId,
            force:refreshGeneralPublicContext,
            refreshGeneralWeb:refreshGeneralPublicContext,
            refreshRecentActivity:true,
            attendee,
            event,
            contact
          }), Number(process.env.VAL_MEETING_PREP_PUBLIC_CONTEXT_TIMEOUT_MS)||60000, 'Public web and LinkedIn context is still running. VAL opened the brief with internal context first.').catch(e=>{
            unknowns.push(`public_context_enrichment_failed:${e.message}`);
            publicContextStatus=savedPublicContext
              ? {...publicContextStatus,status:'reused_saved_refresh_failed',summary:[savedPublicContext.summary, 'Fresh LinkedIn refresh failed: ' + e.message].filter(Boolean).join(' ')}
              : {status:'failed',provider:'outscraper',summary:e.message};
            return null;
          });
          if(enriched?.enrichment||enriched?.profile){
            const linkedinRefs=safeArray(enriched.enrichment?.sourceRefs||enriched.enrichment?.source_refs)
              .filter(ref=>/linkedin/i.test(String(ref.type||ref.sourceType||ref.source_type||ref.sourceId||ref.source_id||'')));
            const preferredLinkedInRef=linkedinRefs.find(ref=>/linkedin_recent_signal|linkedin_activity_fallback/i.test(String(ref.type||ref.sourceType||ref.source_type||'')))||linkedinRefs[0]||{};
            publicContextStatus={
              status:enriched.cached?'reused_saved':'ran',
              provider:enriched.enrichment?.provider||'Outscraper',
              result_status:enriched.enrichment?.status||'complete',
              query:enriched.enrichment?.query||'',
              summary:enriched.enrichment?.summary||(enriched.cached?'Saved public context was already available.':'Public context was gathered for this meeting prep.'),
              website:enriched.enrichment?.website||'',
              organization:enriched.enrichment?.organization||'',
              latest_linkedin_post:enriched.enrichment?.latestLinkedInPost||enriched.enrichment?.latest_linkedin_post||preferredLinkedInRef.summary||'',
              latest_linkedin_url:enriched.enrichment?.latestLinkedInUrl||enriched.enrichment?.latest_linkedin_url||preferredLinkedInRef.sourceId||preferredLinkedInRef.source_id||'',
              general_web_status:enriched.enrichment?.webSearch?.cacheStatus||enriched.enrichment?.generalWebStatus||(enriched.cached?'cached':'ran'),
              general_web_checked_at:enriched.enrichment?.webSearch?.completedAt||enriched.enrichment?.completedAt||savedPublicContext?.completedAt||'',
              recent_activity_status:enriched.enrichment?.linkedin?.cacheStatus||'ran'
            };
            contact={
              ...contact,
              ...(enriched.profile||{}),
              relationshipProfileId:enriched.profile?.id||contact.relationshipProfileId||contact.raw?.relationshipProfileId||'',
              relationshipEnrichment:enriched.enrichment||enriched.profile?.metadata?.relationshipEnrichment||contact.relationshipEnrichment,
              raw:{...(contact.raw||{}),relationshipEnrichment:enriched.enrichment||enriched.profile?.metadata?.relationshipEnrichment||contact.raw?.relationshipEnrichment}
            };
            savedPublicContext=savedRelationshipPublicContext(contact);
            publicContextTrust=meetingPrepPublicContextTrust(savedPublicContext,attendee,contact);
            if(savedPublicContext&&!publicContextTrust.trusted){
              unknowns.push(`public_context_unverified:${publicContextTrust.reason}`);
              publicContextStatus=unverifiedPublicContextStatus(savedPublicContext,publicContextTrust);
              savedPublicContext=null;
            }else if(savedPublicContext){
              publicContextStatus={...publicContextStatus,summary:savedPublicContext.summary||publicContextStatus.summary,website:savedPublicContext.website||publicContextStatus.website||'',organization:savedPublicContext.organization||publicContextStatus.organization||'',latest_linkedin_post:savedPublicContext.latestLinkedInPost||publicContextStatus.latest_linkedin_post||'',latest_linkedin_url:savedPublicContext.latestLinkedInUrl||publicContextStatus.latest_linkedin_url||'',query:savedPublicContext.query||publicContextStatus.query||'',verification_reason:publicContextTrust.reason};
            }
          }
        }
      }
      const savedManualContext=savedRelationshipManualContext(contact);
      const publicEvidence=savedPublicContext?savedRelationshipPublicEvidence(savedPublicContext):[];
      const manualEvidence=savedManualContext?savedRelationshipManualEvidence(savedManualContext,contact):[];
      const knownLinkedInActivityUrl=meetingPrepLinkedInActivityUrl(meetingPrepKnownLinkedInUrl(attendee,contact));
      if(knownLinkedInActivityUrl&&!publicContextStatus.latest_linkedin_url){
        publicContextStatus={...publicContextStatus,latest_linkedin_url:knownLinkedInActivityUrl,recent_activity_status:publicContextStatus.recent_activity_status||'activity_link_prepared'};
      }
      const confidence=Number(resolution.confidence||contact.confidence||0);
      const label=(crmContactId&&confidence>=0.75)||savedManualContext?'internal_evidence':(savedPublicContext?'public_source':(confidence>0?'val_inference':'unknown'));
      if(!crmContactId)unknowns.push('crm_contact_id_unresolved');
      const relationshipDossier=(crmContactId||savedPublicContext||savedManualContext)?buildRelationshipDossier({
        contactId:crmContactId||contact.relationshipProfileId||contact.raw?.relationshipProfileId||'',
        contact:{...contact,name:contact.name||attendee.name,email:contact.email||attendee.email,company:contact.company||savedPublicContext?.organization||''},
        attendee,
        openLoops:internal.openLoops,
        evidence:safeArray(internal.transcripts).map(t=>({type:'transcript',title:t.title,summary:t.summary||t.rawText,date:t.createdAt,id:t.id}))
          .concat(safeArray(internal.tasks).map(t=>({type:'task',title:t.title,summary:t.notes||t.title,date:t.createdAt||t.dueDate,id:t.id})))
          .concat(publicEvidence)
          .concat(manualEvidence),
        opportunities:[...safeArray(savedManualContext?.offers),...safeArray(savedPublicContext?.offers)],
        summary:savedManualContext?.relationship||savedPublicContext?.summary||contact.summary||resolution.reason,
        confidence:confidence||0.45,
        recommendedAction:contact.recommendedAction||''
      }):null;
      out.push({
        attendee_key:attendeeKey(attendee),
        name:attendee.name||contact.name||'',
        email:attendee.email||contact.email||'',
        crm_contact_id:crmContactId,
        match_status:resolution.status||'unknown',
        source_confidence_label:sourceLabel(label),
        confidence,
        who_they_are:compactText((contact.company||savedPublicContext?.organization)?[`${contact.name||attendee.name} at ${contact.company||savedPublicContext?.organization}`].join(''):(contact.name||attendee.name||attendee.email),220),
        public_profile:{
          organization:savedPublicContext?.organization||contact.company||contact.organization||'',
          category:savedPublicContext?.category||'',
          location:savedPublicContext?.location||'',
          website:savedPublicContext?.website||contact.website||contact.raw?.website||'',
          summary:savedPublicContext?.summary||'',
          latest_linkedin_post:savedPublicContext?.latestLinkedInPost||publicContextStatus.latest_linkedin_post||'',
          latest_linkedin_url:savedPublicContext?.latestLinkedInUrl||publicContextStatus.latest_linkedin_url||knownLinkedInActivityUrl||'',
          query:savedPublicContext?.query||publicContextStatus.query||'',
          provider:publicContextStatus.provider||savedPublicContext?.provider||'outscraper',
          status:publicContextStatus.status||'unknown',
          general_web_status:publicContextStatus.general_web_status||'unknown',
          general_web_checked_at:publicContextStatus.general_web_checked_at||savedPublicContext?.completedAt||'',
          recent_activity_status:publicContextStatus.recent_activity_status||'unknown'
        },
        why_this_person_matters:savedManualContext?.relationship?`User-confirmed relationship context: ${savedManualContext.relationship}`:(savedPublicContext?.summary?`Saved public relationship context: ${savedPublicContext.summary}`:(contact.name?'Matched against internal relationship/contact evidence.':'Attendee is present on the calendar event; no deeper internal match is confirmed.')),
        relationship_context:compactText([
          savedManualContext?.relationship||'',
          safeArray(savedManualContext?.needs).length?'Needs: ' + safeArray(savedManualContext.needs).join('; '):'',
          safeArray(savedManualContext?.offers).length?'Offers: ' + safeArray(savedManualContext.offers).join('; '):'',
          savedPublicContext?.summary||'',
          safeArray(internal.openLoops).filter(o=>JSON.stringify(o).toLowerCase().includes(String(attendee.name||attendee.email).toLowerCase())).map(o=>o.text||o.title||o.summary||o).join(' | ')
        ].filter(Boolean).join(' | '),500),
        relationship_dossier:relationshipDossier,
        saved_relationship_context:savedPublicContext,
        public_context_status:publicContextStatus,
        user_confirmed_relationship_context:savedManualContext,
        unresolved_relationship_context:crmContactId?null:{
          reason:savedPublicContext?'Saved public relationship context is available, but this attendee has not resolved to a CRM contact ID.':'No canonical Relationship Dossier was attached because this attendee has not resolved to a CRM contact ID.',
          attendee_key:attendeeKey(attendee),
          resolution_status:resolution.status||'unknown',
          resolution_confidence:confidence,
          recommended_action:'create_crm_contact_candidate',
          contact_creation_candidate:contactCreationCandidateFromAttendee({attendee,event,resolution}),
          candidates:safeArray(resolution.matches).slice(0,3).map(c=>({name:c.name,email:c.email,source:c.source,confidence:c.confidence,has_crm_contact_id:!!crmContactIdFromContact(c)}))
        },
        recent_changes:[],
        possible_opportunities:[...safeArray(savedManualContext?.offers),...safeArray(savedPublicContext?.offers)],
        source_refs:[normalizeSourceRef({sourceType:'calendar_attendee',sourceId:attendeeKey(attendee),quoteOrSummary:`${attendee.name||''} ${attendee.email||''}`.trim(),confidence:0.7})].concat(publicEvidence.map(normalizeSourceRef)).concat(manualEvidence.map(normalizeSourceRef)),
        unknowns
      });
    }
    return out;
  }
  async function saveExternalResearchPlans(attendeeIntel=[]){
    const saved=[];
    for(const a of attendeeIntel){
      const row={id:uuid('research'),tenantId:tenantId(),userId:userId(),subjectType:'attendee',subjectKey:a.attendee_key,provider:'apollo_outscraper_planned',status:'planned',planJson:{reason:'External attendee enrichment is planned but not executed in Phase 6.',allowed_future_sources:['apollo','outscraper','public_source'],anti_creep_rule:'Use only natural, relevant, relationship-appropriate facts.'},resultJson:{},sourceConfidenceLabel:'unknown',sourceRefsJson:[],errorMessage:'Not executed in Phase 6.',createdAt:new Date().toISOString()};
      if(hasPg()){
        await dbQuery(`insert into external_research_results (id,tenant_id,user_id,subject_type,subject_key,provider,status,plan_json,result_json,source_confidence_label,source_refs_json,error_message) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,[row.id,row.tenantId,row.userId,row.subjectType,row.subjectKey,row.provider,row.status,JSON.stringify(row.planJson),JSON.stringify(row.resultJson),row.sourceConfidenceLabel,JSON.stringify(row.sourceRefsJson),row.errorMessage]);
      }else{const s=store();s.externalResearchResults.unshift(row);saveStore(s);}
      saved.push(row);
    }
    return saved;
  }
  async function notifyBoardOfPublicContext(attendeeIntel=[],event={}){
    if(typeof afterPublicContextEvent!=='function')return;
    for(const attendee of safeArray(attendeeIntel)){
      const profile=attendee.public_profile||{};
      const status=attendee.public_context_status||{};
      const refs=safeArray(attendee.source_refs).filter(ref=>/public|linkedin|outscraper|web|research/i.test(String(ref.sourceType||ref.source_type||ref.type||ref.sourceId||ref.source_id||ref.quoteOrSummary||ref.quote_or_summary||'')));
      const hasPublicSignal=Boolean(
        profile.summary || profile.latest_linkedin_post || profile.latest_linkedin_url || profile.website ||
        status.summary || refs.length
      );
      if(!hasPublicSignal)continue;
      await afterPublicContextEvent({
        sourceType:profile.latest_linkedin_post||profile.latest_linkedin_url?'linkedin_visibility':'public_research',
        eventType:'meeting_prep_public_context',
        id:`meeting_prep:${eventIdOf(event)||'event'}:${attendee.attendee_key||attendee.email||attendee.name||uuid('attendee')}`,
        title:[attendee.name||attendee.email||'Attendee','public context'].filter(Boolean).join(' - '),
        summary:compactText([
          profile.summary,
          profile.latest_linkedin_post?`Latest LinkedIn signal: ${profile.latest_linkedin_post}`:'',
          profile.website?`Website: ${profile.website}`:'',
          status.summary
        ].filter(Boolean).join(' '),900),
        attendee,
        event:{id:eventIdOf(event),title:eventTitle(event),startTime:eventStart(event)},
        sourceRefs:refs.length?refs:attendee.source_refs||[],
        noExternalAction:true
      }).catch(error=>logger.warn?.('[val-meeting-prep] Board public context event failed:',error.message));
    }
  }
  async function saveAttendeeRows(briefId,eventId,attendeeIntel=[]){
    const rows=[];
    for(const a of attendeeIntel){
      const row={id:uuid('attendeeintel'),tenantId:tenantId(),userId:userId(),meetingPrepBriefId:briefId,calendarEventId:eventId,attendeeKey:a.attendee_key,name:a.name,email:a.email,crmContactId:a.crm_contact_id,matchStatus:a.match_status,sourceConfidenceLabel:a.source_confidence_label,intelligenceJson:a,sourceRefsJson:a.source_refs||[],unknownsJson:a.unknowns||[],confidence:a.confidence||0,createdAt:new Date().toISOString()};
      if(hasPg()){
        await dbQuery(`insert into attendee_intelligence (id,tenant_id,user_id,meeting_prep_brief_id,calendar_event_id,attendee_key,name,email,crm_contact_id,match_status,source_confidence_label,intelligence_json,source_refs_json,unknowns_json,confidence) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,[row.id,row.tenantId,row.userId,row.meetingPrepBriefId,row.calendarEventId,row.attendeeKey,row.name,row.email,row.crmContactId,row.matchStatus,row.sourceConfidenceLabel,JSON.stringify(row.intelligenceJson),JSON.stringify(row.sourceRefsJson),JSON.stringify(row.unknownsJson),row.confidence]);
      }else{const s=store();s.attendeeIntelligence.unshift(row);saveStore(s);}
      rows.push(row);
    }
    return rows;
  }
  async function saveBrief(row){
    const columns=['id','tenantId','userId','calendarEventId','eventSource','status','qualityGateJson','meetingContextJson','attendeeIntelligenceJson','internalContextJson','meetingStakesJson','userRole','firstFiveMinutesJson','briefJson','suggestedQuestionsJson','followUpPreparationJson','readyForYouHandoffJson','postMeetingCapturePrompt','postMeetingCaptureJson','sourceRefsJson','unknownsJson','confidence','createdAt','updatedAt'];
    if(hasPg()){
      const values=columns.map(c=>pgValueForMeetingPrepColumn(c,row[c]));
      const names=columns.map(toSnake);
      const params=columns.map((_,i)=>`$${i+1}`).join(',');
      const updates=names.filter(n=>!['id','created_at'].includes(n)).map(n=>`${n}=excluded.${n}`).join(',');
      const r=await dbQuery(`insert into meeting_prep_briefs (${names.join(',')}) values (${params}) on conflict (id) do update set ${updates} returning *`,values);
      return toCamelRow(r.rows[0]);
    }
    const s=store();const idx=s.meetingPrepBriefs.findIndex(b=>b.id===row.id);
    if(idx>=0)s.meetingPrepBriefs[idx]={...s.meetingPrepBriefs[idx],...row,updatedAt:new Date().toISOString()};else s.meetingPrepBriefs.unshift(row);
    saveStore(s);return idx>=0?s.meetingPrepBriefs[idx]:row;
  }
  async function buildMeetingPrep(input={}){
    const event=await findEvent(input);
    const eventId=eventIdOf(event)||uuid('event');
    const gate=qualityGate(event);
    const attendees=externalMeetingAttendees(event);
    const unknowns=[];
    if(!isMeetingEvent(event)){
      const privateBlock=privateCalendarBlockTitle(event);
      return {
        ok:false,
        error:privateBlock
          ? 'This calendar item looks like a private appointment or private calendar block, so VAL is keeping it out of executive meeting prep.'
          : 'This calendar item has no external attendees, so VAL is treating it as a private calendar block instead of a meeting.',
        code:'not_a_meeting',
        calendarEventId:eventId,
        qualityGate:gate,
        no_external_action:true
      };
    }
    if(!gate.is_usable)unknowns.push({source:'calendar_event',reason:'Calendar event is not usable enough for full prep.'});
    const internal=await gatherInternal(event);
    safeArray(internal.errors).forEach(reason=>unknowns.push({source:'internal_context',reason}));
    const attendeeIntel=await resolveAttendees(event,internal);
    const savedProjects=typeof listProjectProfiles==='function' ? await listProjectProfiles({limit:120}).catch(e=>{unknowns.push({source:'project_profiles',reason:e.message});return [];}) : [];
    const projectLinks=mergeProjectContextLinks(projectContextLinks(event,internal),matchSavedProjectProfiles(event,internal,savedProjects));
    const meetingType=classifyMeetingPrepType({attendees,attendeeIntel,internal,projectLinks});
    internal.meeting_type=meetingType;
    if(saveCalendarProjectLink){
      for(const link of projectLinks){
        await saveCalendarProjectLink({
          calendarEventId:eventId,
          title:eventTitle(event),
          projectId:link.project_id,
          projectName:link.project_name,
          summary:link.summary,
          confidence:link.confidence,
          attendees,
          source:'meeting_prep'
        }).catch(e=>unknowns.push({source:'calendar_project_link',reason:e.message,projectId:link.project_id}));
      }
    }
    await saveExternalResearchPlans(attendeeIntel);
    await notifyBoardOfPublicContext(attendeeIntel,event);
    const stakes=meetingStakes(event,attendees,internal);
    const role=classifyRole(event,attendees);
    const firstFive=firstFiveMinutes({event,role,stakes,attendees});
    const brief=buildBrief({event,attendees,attendeeIntel,internal,stakes,role});
    const questions=suggestedQuestions({role,stakes});
    const followUp=followUpPreparation({event,attendees,internal});
    const briefPacket=meetingPrepBriefPacket({event,attendees,attendeeIntel,internal,stakes,role,firstFive,questions,followUp,projectLinks,meetingType});
    brief.brief_packet=briefPacket;
    const capture=postCapturePrompt(event);
    const overviewApproval=meetingOverviewApprovalSetting(event);
    const needsJudgment=gate.quality!=='unusable'&&(attendees.length>0||stakes.relationship_stakes!=='unknown'||stakes.opportunity_stakes!=='unknown');
    const handoff={ready_for_you_candidate:needsJudgment,status:needsJudgment?'ready_for_review':'not_ready',category:'meeting',type:'meeting_prep_brief',why_user_is_seeing_this:'This meeting brief is ready enough that your judgment is now the bottleneck.',why_now:'Reviewing it before the meeting may improve relationship context, questions, and follow-up quality.',what_val_did:'Prepared meeting context, attendee resolution, stakes, first-five-minutes guidance, questions, and follow-up preparation. No calendar invite was sent.',what_only_user_can_do:'Decide how you want to enter the meeting and what matters most to protect.',estimated_review_minutes:3,requires_approval:true,approval_policy:'approval_required',meeting_overview_approval:overviewApproval,representation_risk:'medium'};
    const sourceRefs=[normalizeSourceRef({sourceType:'calendar_event',sourceId:eventId,quoteOrSummary:eventTitle(event),confidence:0.75}),...attendeeIntel.flatMap(a=>a.source_refs||[])].slice(0,12);
    const confidence=Math.min(0.92,Math.max(0.25,(gate.quality==='high'?0.75:gate.quality==='medium'?0.62:0.45)+(attendeeIntel.some(a=>a.crm_contact_id)?0.1:0)));
    const row={id:input.id||uuid('meetprep'),tenantId:tenantId(),userId:userId(),calendarEventId:eventId,eventSource:event.source||'unknown',status:needsJudgment?'ready_for_review':'needs_context',qualityGateJson:gate,meetingContextJson:{id:eventId,title:eventTitle(event),startTime:eventStart(event),endTime:eventEnd(event),source:event.source||'unknown',attendees,meeting_type:meetingType,relationship_stage:meetingType.type,source_confidence_label:'internal_evidence',meeting_overview_approval:overviewApproval},attendeeIntelligenceJson:attendeeIntel,internalContextJson:{...internal,project_context_links:projectLinks,brief_packet:briefPacket,source_confidence_label:'internal_evidence'},meetingStakesJson:stakes,userRole:role.user_role,firstFiveMinutesJson:firstFive,briefJson:brief,suggestedQuestionsJson:questions,followUpPreparationJson:followUp,readyForYouHandoffJson:handoff,postMeetingCapturePrompt:capture,postMeetingCaptureJson:{},sourceRefsJson:sourceRefs,unknownsJson:unknowns,confidence,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
    const saved=await saveBrief(row);
    const savedBriefId=saved?.id||row.id;
    if(!savedBriefId)throw new Error('Meeting Prep brief saved without an id; attendee intelligence was not attached.');
    await saveAttendeeRows(savedBriefId,eventId,attendeeIntel);
    logger.log?.(`[val-meeting-prep] prepared ${eventId}`);
    return {ok:true,brief:saved,ready_for_you_handoff:handoff,unknowns,source_confidence_labels:['internal_evidence','api_enriched','public_source','val_inference','unknown'],no_external_action:true};
  }
  async function getMeetingPrep(eventId){
    if(hasPg()){
      const r=await dbQuery(`select * from meeting_prep_briefs where tenant_id=$1 and user_id=$2 and calendar_event_id=$3 order by created_at desc limit 1`,[tenantId(),userId(),eventId]);
      return r.rows[0]?toCamelRow(r.rows[0]):null;
    }
    return store().meetingPrepBriefs.filter(b=>b.tenantId===tenantId()&&b.userId===userId()&&String(b.calendarEventId)===String(eventId)).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)))[0]||null;
  }
  async function postMeetingCapture(input={}){
    const eventId=String(input.eventId||input.calendarEventId||'');
    const existing=await getMeetingPrep(eventId);
    const capture={captured_at:new Date().toISOString(),what_changed:compactText(input.whatChanged||input.note||input.text||'',1500),follow_up_needed:!!input.followUpNeeded,source_confidence_label:'internal_evidence'};
    if(!existing)return {ok:false,error:'Meeting prep brief not found'};
    const updated=await saveBrief({...existing,id:existing.id,tenantId:existing.tenantId||tenantId(),userId:existing.userId||userId(),calendarEventId:existing.calendarEventId,eventSource:existing.eventSource||'unknown',status:existing.status||'ready_for_review',postMeetingCaptureJson:capture,updatedAt:new Date().toISOString()});
    return {ok:true,brief:updated,capture,no_external_action:true};
  }
  async function listReadyForYouCandidates({limit=5}={}){
    const lim=Math.max(1,Math.min(Number(limit)||5,10));
    let rows=[];
    if(hasPg()){
      const r=await dbQuery(`select * from meeting_prep_briefs where tenant_id=$1 and user_id=$2 and status in ('ready_for_review','needs_context') order by created_at desc limit $3`,[tenantId(),userId(),lim]);
      rows=(r.rows||[]).map(toCamelRow);
    }else rows=store().meetingPrepBriefs.filter(b=>b.tenantId===tenantId()&&b.userId===userId()&&['ready_for_review','needs_context'].includes(b.status)).slice(0,lim);
    return rows.filter(b=>b.readyForYouHandoffJson?.ready_for_you_candidate!==false).map(b=>({source:'meeting_prep',brief:b,id:b.id,calendarEventId:b.calendarEventId,status:b.status,title:b.briefJson?.meeting_title||b.meetingContextJson?.title||'Meeting prep ready',summary:b.briefJson?.concise_brief||'',handoff:b.readyForYouHandoffJson||{},sourceRefs:b.sourceRefsJson||[],confidence:b.confidence||0.65,createdAt:b.createdAt}));
  }
  return {buildMeetingPrep,getMeetingPrep,postMeetingCapture,listReadyForYouCandidates};
}

module.exports={createValMeetingPrepService,qualityGate,inferAttendees,externalMeetingAttendees,isMeetingEvent,meetingStakes,firstFiveMinutes,meetingOverviewApprovalSetting};
