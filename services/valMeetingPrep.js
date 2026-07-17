const {buildRelationshipDossier} = require('./valRelationshipDossier');

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
const SELF_CALENDAR_EMAILS=new Set(['jessa@jessagrace.com','jessa@goallprogram.com','jessa@goalprogram.com','jessa.grace@gmail.com']);
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
  return '';
}
function savedRelationshipPublicContext(contact={}){
  const context=contact.relationshipEnrichment||contact.raw?.relationshipEnrichment||contact.raw?.relationship_enrichment||contact.raw?.metadata?.relationshipEnrichment||null;
  if(!context||context.status!=='complete')return null;
  return {
    provider:String(context.provider||'outscraper'),
    organization:compactText(context.organization,180),
    category:compactText(context.category,180),
    location:compactText(context.location,180),
    website:compactText(context.website,260),
    summary:compactText(context.summary,520),
    offers:safeArray(context.offers).map(item=>compactText(item,240)).filter(Boolean).slice(0,4),
    sourceRefs:safeArray(context.sourceRefs||context.source_refs).slice(0,4),
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
  if(/\b(intro|introduction|meet)\b/.test(title)){role='introduced_party';why='Title suggests an introduction or first meeting.';}
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
function buildBrief({event={},attendees=[],attendeeIntel=[],internal={},stakes={},role={}}={}){
  const title=eventTitle(event);
  const names=attendees.map(a=>a.name||a.email).filter(Boolean).slice(0,5);
  const openLoops=safeArray(internal.openLoops).map(o=>o.text||o.title||o.summary||o).filter(Boolean).slice(0,5);
  const relationshipLines=attendeeIntel.map(a=>a.relationship_context||a.why_this_person_matters).filter(Boolean).slice(0,5);
  return {
    meeting_title:title,
    concise_brief:compactText(`This meeting is not isolated. It sits inside ${names.length?'relationships with '+names.join(', '):'the user’s calendar context'}, active commitments, timing, and opportunity signals.`,500),
    likely_purpose:compactText(role.why||'Clarify the purpose, relationship context, and next useful movement.',400),
    attendees:names,
    relationship_context:relationshipLines,
    recent_changes:safeArray(internal.transcripts).map(t=>t.title||t.summary).filter(Boolean).slice(0,4),
    possible_opportunities:attendeeIntel.flatMap(a=>safeArray(a.possible_opportunities)).slice(0,5),
    risks_or_sensitivities:openLoops.length?[`Open loops may need acknowledgment: ${openLoops.slice(0,2).join('; ')}`]:[],
    what_val_recommends_preparing:['Review attendee context','Clarify the one useful outcome','Prepare one natural opening question'],
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
  saveCalendarProjectLink=null,
  logger=console
}={}){
  function scope(){return {tenantId:tenantId(),userId:userId()};}
  function store(){
    const s=getStore()||{};
    for(const key of ['meetingPrepBriefs','attendeeIntelligence','externalResearchResults'])if(!Array.isArray(s[key]))s[key]=[];
    return s;
  }
  async function findEvent(input={}){
    const id=String(input.eventId||input.calendarEventId||input.id||'');
    if(input.event&&typeof input.event==='object')return input.event;
    if(resolveMeetingContext){
      const resolved=await resolveMeetingContext({eventId:id,title:input.title,date:input.date}).catch(e=>({errors:[e.message]}));
      if(resolved?.meeting)return resolved.meeting;
    }
    if(loadContextCalendarEvents){
      const start=new Date(input.date||Date.now()-7*24*60*60*1000);
      const end=new Date(input.date||Date.now()+14*24*60*60*1000);
      if(input.date){start.setHours(0,0,0,0);end.setHours(23,59,59,999);}
      const loaded=await loadContextCalendarEvents(start,end).catch(e=>({events:[],errors:[e.message]}));
      const found=safeArray(loaded.events).find(e=>id&&(String(e.id)===id||String(e.eventId)===id));
      if(found)return found;
    }
    return {id,title:input.title||'Meeting',startTime:input.startTime||input.date||'',endTime:input.endTime||'',attendees:input.attendees||[],source:input.source||'unknown'};
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
    const attendees=inferAttendees(event);
    const out=[];
    for(const attendee of attendees){
      const unknowns=[];
      let resolution={status:'unknown',confidence:0,contact:null,reason:'Contact resolver unavailable.'};
      if(resolveContactFromContext){
        resolution=await resolveContactFromContext({name:attendee.name,email:attendee.email,calendarEvent:event}).catch(e=>({status:'unknown',confidence:0,contact:null,reason:e.message}));
      }else unknowns.push('Contact resolver unavailable.');
      const contact=resolution.contact||{};
      const crmContactId=crmContactIdFromContact(contact);
      const savedPublicContext=savedRelationshipPublicContext(contact);
      const savedManualContext=savedRelationshipManualContext(contact);
      const publicEvidence=savedPublicContext?savedRelationshipPublicEvidence(savedPublicContext):[];
      const manualEvidence=savedManualContext?savedRelationshipManualEvidence(savedManualContext,contact):[];
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
      const values=columns.map(c=>row[c]);
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
    const attendees=inferAttendees(event);
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
    const projectLinks=projectContextLinks(event,internal);
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
    const stakes=meetingStakes(event,attendees,internal);
    const role=classifyRole(event,attendees);
    const firstFive=firstFiveMinutes({event,role,stakes,attendees});
    const brief=buildBrief({event,attendees,attendeeIntel,internal,stakes,role});
    const questions=suggestedQuestions({role,stakes});
    const followUp=followUpPreparation({event,attendees,internal});
    const capture=postCapturePrompt(event);
    const overviewApproval=meetingOverviewApprovalSetting(event);
    const needsJudgment=gate.quality!=='unusable'&&(attendees.length>0||stakes.relationship_stakes!=='unknown'||stakes.opportunity_stakes!=='unknown');
    const handoff={ready_for_you_candidate:needsJudgment,status:needsJudgment?'ready_for_review':'not_ready',category:'meeting',type:'meeting_prep_brief',why_user_is_seeing_this:'This meeting brief is ready enough that your judgment is now the bottleneck.',why_now:'Reviewing it before the meeting may improve relationship context, questions, and follow-up quality.',what_val_did:'Prepared meeting context, attendee resolution, stakes, first-five-minutes guidance, questions, and follow-up preparation. No calendar invite was sent.',what_only_user_can_do:'Decide how you want to enter the meeting and what matters most to protect.',estimated_review_minutes:3,requires_approval:true,approval_policy:'approval_required',meeting_overview_approval:overviewApproval,representation_risk:'medium'};
    const sourceRefs=[normalizeSourceRef({sourceType:'calendar_event',sourceId:eventId,quoteOrSummary:eventTitle(event),confidence:0.75}),...attendeeIntel.flatMap(a=>a.source_refs||[])].slice(0,12);
    const confidence=Math.min(0.92,Math.max(0.25,(gate.quality==='high'?0.75:gate.quality==='medium'?0.62:0.45)+(attendeeIntel.some(a=>a.crm_contact_id)?0.1:0)));
    const row={id:input.id||uuid('meetprep'),tenantId:tenantId(),userId:userId(),calendarEventId:eventId,eventSource:event.source||'unknown',status:needsJudgment?'ready_for_review':'needs_context',qualityGateJson:gate,meetingContextJson:{id:eventId,title:eventTitle(event),startTime:eventStart(event),endTime:eventEnd(event),source:event.source||'unknown',attendees,source_confidence_label:'internal_evidence',meeting_overview_approval:overviewApproval},attendeeIntelligenceJson:attendeeIntel,internalContextJson:{...internal,project_context_links:projectLinks,source_confidence_label:'internal_evidence'},meetingStakesJson:stakes,userRole:role.user_role,firstFiveMinutesJson:firstFive,briefJson:brief,suggestedQuestionsJson:questions,followUpPreparationJson:followUp,readyForYouHandoffJson:handoff,postMeetingCapturePrompt:capture,postMeetingCaptureJson:{},sourceRefsJson:sourceRefs,unknownsJson:unknowns,confidence,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
    const saved=await saveBrief(row);
    await saveAttendeeRows(saved.id||row.id,eventId,attendeeIntel);
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
