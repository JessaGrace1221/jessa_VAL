'use strict';

function safeArray(value){return Array.isArray(value)?value:[];}
function compactText(value,limit=300){return String(value||'').replace(/\s+/g,' ').trim().slice(0,limit);}
function firstText(...values){return values.map(value=>compactText(value)).find(Boolean)||'';}
function lowerWords(value=''){
  return compactText(value,1000).toLowerCase().split(/[^a-z0-9]+/).filter(word=>word.length>2);
}
function contactId(contact={}){
  const raw=compactText(contact.crmContactId||contact.contactId||contact.contact_id||(contact.source==='ghl_contact'?contact.id:''),120);
  if(!raw)return '';
  if(/^(email|name|person:email):/i.test(raw))return '';
  return raw;
}
function evidenceText(contact={}){
  return [
    contact.name,
    contact.company,
    contact.role,
    contact.summary,
    contact.reason,
    contact.why,
    contact.recommendedAction,
    ...safeArray(contact.tags),
    ...safeArray(contact.openLoops),
    ...safeArray(contact.opportunitySignals),
    ...safeArray(contact.needs),
    ...safeArray(contact.offers),
    ...safeArray(contact.evidence).map(e=>e.summary||e.text||e.content||'')
  ].filter(Boolean).join(' ');
}
function sourceReceipt(item={},fallbackType='relationship_evidence'){
  if(typeof item==='string')return {source_type:fallbackType,source_id:'',summary:compactText(item,260),confidence:'unknown'};
  return {
    source_type:compactText(item.source_type||item.sourceType||item.type||item.source||fallbackType,80),
    source_id:compactText(item.source_id||item.sourceId||item.id||item.messageId||'',120),
    title:compactText(item.title||item.subject||'',140),
    summary:compactText(item.summary||item.text||item.content||item.bodyPreview||item.snippet||item.rawText||'',260),
    occurred_at:item.occurred_at||item.occurredAt||item.receivedAt||item.sentAt||item.date||item.createdAt||'',
    confidence:item.confidence||item.source_confidence_label||item.sourceConfidenceLabel||'unknown',
    supports_person_ids:safeArray(item.supports_person_ids||item.supportsPersonIds||item.personIds),
    supports_claims:safeArray(item.supports_claims||item.supportsClaims||item.claims),
    relationship_context:compactText(item.relationship_context||item.relationshipContext||'',220),
    resolution_method:compactText(item.resolution_method||item.resolutionMethod||'',80),
    review_required:!!(item.review_required||item.reviewRequired)
  };
}
function sourceReceipts(items=[],fallbackType='relationship_evidence',limit=8){
  const seen=new Set();
  return safeArray(items).map(item=>sourceReceipt(item,fallbackType)).filter(item=>{
    const key=[item.source_type,item.source_id,item.summary].join('|').toLowerCase();
    if((!item.summary&&!item.title&&!item.source_id)||seen.has(key))return false;
    seen.add(key);
    return true;
  }).slice(0,limit);
}
function textEvidenceItem(text='',type='inferred_relationship_signal'){
  const summary=compactText(text,260);
  return summary?{type,summary,confidence:'medium'}:null;
}
function genericStewardshipClassifierText(value=''){
  return /^(Email may involve a document request or document follow-up|Email contains relationship momentum or warmth|Email may contain relationship or revenue opportunity signal|Email includes scheduling or meeting language|Email asks for a response or decision|Thread appears to be waiting on a response|Transcript-derived introduction opportunity: review the source snippet before preparing any introduction|Transcript source mentions a possible introduction connected to this relationship context)\.?$/i.test(compactText(value,260));
}
function normalizedList(...sources){
  const seen=new Set();
  return sources.flatMap(source=>safeArray(source)).map(item=>{
    if(typeof item==='string')return compactText(item,220);
    return compactText(item.need||item.offer||item.summary||item.text||item.content||item.reason||item.title||'',220);
  }).filter(item=>{
    const key=item.toLowerCase();
    if(!item||seen.has(key)||genericStewardshipClassifierText(item))return false;
    seen.add(key);
    return true;
  }).slice(0,12);
}
function packetIdForContact(contact={}){
  const id=contactId(contact);
  const email=compactText(contact.email||contact.primaryEmail||'',120).toLowerCase();
  const name=compactText(contact.name||contact.displayName||'',120).toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'');
  return `person_packet:${id||email||name||'unknown'}`.slice(0,180);
}
function packetIdentity(contact={}){
  const linkedId=contactId(contact);
  return {
    person_id:compactText(contact.personId||contact.person_id||contact.id||contact.contactId||contact.crmContactId||'',120),
    name:compactText(contact.name||contact.displayName||contact.fullName||contact.email||'Relationship',140),
    email_addresses:[...new Set([contact.email,contact.primaryEmail,contact.contactEmail].map(value=>compactText(value,120).toLowerCase()).filter(Boolean))],
    role:compactText(contact.role||contact.title||contact.jobTitle||'',140),
    company_or_context:compactText(contact.company||contact.companyName||contact.context||'',160),
    crm_contact_id:linkedId,
    identity_status:linkedId?'linked':(contact.knownIdentity?'known_alias':(contact.email||contact.name?'needs_review':'unknown'))
  };
}
function contactIdentityKey(contact={},identity=packetIdentity(contact)){
  return compactText(identity.crm_contact_id||identity.person_id||contact.contactId||contact.crmContactId||contact.email||contact.primaryEmail||identity.name||'',160).toLowerCase();
}
function relationshipEmailLooksGeneric(email=''){
  const local=compactText(email,160).toLowerCase().split('@')[0]||'';
  return /^(info|support|hello|team|contact|admin|office|newsletter|marketing|receipts?|payments?|invoice|billing|orders?|sales|cs|reply|donotreply|no.?reply|notifications?|comments-noreply|drive-shares|workspace-noreply|azure-noreply)$/i.test(local);
}
function relationshipNameLooksLikeRawHandle(name='',email=''){
  const clean=compactText(name,160).toLowerCase();
  if(!clean||clean==='unknown')return true;
  if(clean.includes('@'))return true;
  if(email&&clean===String(email).split('@')[0].toLowerCase())return true;
  return /^[a-z0-9._-]+$/.test(clean)&&!/\s/.test(clean);
}
function evidenceSignalText(contact={},receipts=[]){
  return [
    contact.source,
    contact.relationshipStatus,
    contact.relationship_status,
    contact.status,
    contact.relationshipToUser,
    contact.firstMeaningfulSignal,
    contact.reason,
    contact.summary,
    contact.recommendedAction,
    ...safeArray(contact.tags),
    ...safeArray(contact.openLoops),
    ...safeArray(contact.needs),
    ...safeArray(contact.offers),
    ...safeArray(contact.opportunities),
    ...receipts.map(item=>[item.source_type,item.title,item.summary,item.relationship_context].filter(Boolean).join(' '))
  ].filter(Boolean).join(' ').toLowerCase();
}
function relationshipEvidenceMapForContact(contact={}){
  const raw=contact.relationshipEvidenceMap||contact.relationship_evidence_map||{};
  const admissionSources=safeArray(raw.admissionSources||raw.admission_sources||contact.admissionSources||contact.admission_sources);
  const directCommunicationSources=safeArray(raw.directCommunicationSources||raw.direct_communication_sources||contact.directCommunicationSources||contact.direct_communication_sources);
  const lastDirectCommunicationAt=firstText(contact.lastDirectCommunicationAt,contact.last_direct_communication_at,raw.lastDirectCommunicationAt,raw.last_direct_communication_at);
  const lastDirectCommunicationSource=firstText(contact.lastDirectCommunicationSource,contact.last_direct_communication_source,raw.lastDirectCommunicationSource,raw.last_direct_communication_source);
  return {
    version:raw.version||'stewardship_relationship_evidence_map_v1',
    admission_sources:[...new Set(admissionSources.map(value=>compactText(value,80)).filter(Boolean))],
    direct_communication_sources:[...new Set(directCommunicationSources.map(value=>compactText(value,80)).filter(Boolean))],
    source_counts:raw.sourceCounts||raw.source_counts||{},
    last_direct_communication_at:lastDirectCommunicationAt,
    last_direct_communication_source:lastDirectCommunicationSource,
    recent_direct_communication_window_days:Number(raw.recentDirectCommunicationWindowDays||raw.recent_direct_communication_window_days||14),
    fresh_for_suggested_introductions:raw.freshForSuggestedIntroductions===true||raw.fresh_for_suggested_introductions===true,
    introduction_evidence:safeArray(raw.introductionEvidence||raw.introduction_evidence).slice(0,8),
    packet_refresh_order:safeArray(raw.packetRefreshOrder||raw.packet_refresh_order),
    updated_at:firstText(raw.updatedAt,raw.updated_at)
  };
}
function relationshipAdmissionDecision(input={}){
  const contact=input.contact||input;
  const identity=input.identity||packetIdentity(contact);
  const receipts=sourceReceipts([
    ...safeArray(input.source_receipts||input.sourceReceipts),
    ...safeArray(contact.evidence),
    ...safeArray(contact.sourceReceipts||contact.source_refs||contact.sourceRefs),
    textEvidenceItem(contact.summary||contact.reason||contact.why||'','relationship_summary'),
    textEvidenceItem(contact.recommendedAction||'','relationship_recommended_action')
  ].filter(Boolean),'relationship_evidence',16);
  const email=safeArray(identity.email_addresses)[0]||compactText(contact.email||contact.primaryEmail||'',160).toLowerCase();
  const name=identity.name||contact.name||contact.displayName||'';
  const hasIdentity=!!(identity.crm_contact_id||contact.knownIdentity||contact.userConfirmed||contact.user_confirmed||contact.userTeaching||contact.user_teaching||email||(!relationshipNameLooksLikeRawHandle(name,email)&&name));
  const safeIdentity=!!(identity.crm_contact_id||contact.knownIdentity||contact.userConfirmed||contact.user_confirmed||contact.userTeaching||contact.user_teaching||(!relationshipEmailLooksGeneric(email)&&!relationshipNameLooksLikeRawHandle(name,email)&&(email||name)));
  const text=evidenceSignalText(contact,receipts);
  const relationshipSignals=[];
  const rejectionSignals=[];
  if(/\b(sent email|outbound|user sent|jessa sent|direct email|sent_email)\b/.test(text)||contact.sentAt)relationshipSignals.push('user_sent_direct_email');
  if(/\b(user replied|you replied|jessa replied|replied to|responded to|reply from user)\b/.test(text))relationshipSignals.push('user_replied');
  if(/\b(person replied|replied to user|inbound reply|waiting on response)\b/.test(text))relationshipSignals.push('person_replied');
  if(/\b(meeting|calendar|attendee|call|zoom)\b/.test(text))relationshipSignals.push('meaningful_meeting');
  if(/\b(cc'?d|copied|included on|looped in|meaningful conversation)\b/.test(text))relationshipSignals.push('cc_or_included_context');
  if(/\b(transcript|speaker|said|told|mentioned)\b/.test(text))relationshipSignals.push('transcript_context');
  if(/\b(user teaching|teach_val|user confirmed|vip|watch this person|important)\b/.test(text)||contact.userTeaching||contact.user_teaching)relationshipSignals.push('user_teaching');
  if(/\b(promised|commitment|introduced|introduce|connect|follow up|send|review|confirm|return to)\b/.test(text))relationshipSignals.push('relationship_commitment');
  if(/\b(project|document|task|opportunity|crm|ghl_contact|relationship_profile)\b/.test(text)||identity.crm_contact_id)relationshipSignals.push('linked_context');
  if(/\b(introduced by|warm intro|known relationship)\b/.test(text))relationshipSignals.push('known_introduction');
  if(/\b(newsletter|promotion|promotional|marketing sequence|cold outreach|receipt|invoice|notification|system-generated|automated|scraped|public directory)\b/.test(text))rejectionSignals.push('non_relationship_source');
  if(relationshipEmailLooksGeneric(email))rejectionSignals.push('generic_mailbox');
  if(relationshipNameLooksLikeRawHandle(name,email))rejectionSignals.push('raw_handle_identity');
  const hasMeaningfulSignal=relationshipSignals.length>0;
  const hasPacketContext=safeArray(contact.needs).length||safeArray(contact.offers).length||safeArray(contact.openLoops).length||safeArray(contact.opportunities).length||safeArray(contact.opportunitySignals).length;
  let admission_status='rejected';
  let reason='no_meaningful_relationship_signal';
  let review_required=false;
  if(hasMeaningfulSignal&&!safeIdentity){
    admission_status='blocked_by_identity';
    reason='meaningful_signal_but_identity_needs_review';
    review_required=true;
  }else if(hasMeaningfulSignal&&safeIdentity){
    admission_status='admitted';
    reason='meaningful_relationship_signal';
  }else if(identity.crm_contact_id&&(receipts.length||hasPacketContext)&&!rejectionSignals.includes('non_relationship_source')){
    admission_status='admitted';
    reason=receipts.length?'crm_identity_with_supporting_context':'crm_identity_with_packet_context';
  }else if(rejectionSignals.length){
    reason=rejectionSignals.includes('generic_mailbox')?'generic_or_automated_sender':'non_relationship_source';
  }
  return {
    admission_status,
    admitted:admission_status==='admitted',
    person_id:identity.crm_contact_id||identity.person_id||contact.personId||contact.id||'',
    reason,
    source_receipts:receipts.slice(0,8),
    identity_confidence:identity.crm_contact_id||contact.knownIdentity||contact.userConfirmed?'high':(safeIdentity?'medium':'low'),
    relationship_signals:[...new Set(relationshipSignals)],
    rejection_signals:[...new Set(rejectionSignals)],
    review_required
  };
}
function sourceToPersonEvidenceBindings({contact={},identity=packetIdentity(contact),source_receipts=[]}={}){
  const personKey=contactIdentityKey(contact,identity);
  const nameWords=new Set(lowerWords(identity.name||contact.name||contact.displayName||'').filter(word=>word.length>=4));
  return sourceReceipts(source_receipts,'relationship_evidence',16).map(receipt=>{
    const explicit=safeArray(receipt.supports_person_ids).map(value=>compactText(value,160).toLowerCase()).filter(Boolean);
    const summary=compactText([receipt.title,receipt.summary,receipt.relationship_context].join(' '),600).toLowerCase();
    const mentionedNameCount=[...nameWords].filter(word=>summary.includes(word)).length;
    const mentionsSeveralPeople=(summary.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g)||[]).length>1;
    let resolution_method=receipt.resolution_method||'inferred';
    let review_required=!!receipt.review_required;
    let supports=explicit.length?explicit:[];
    if(!supports.length&&personKey&&/email|gmail|outlook|sent/i.test(receipt.source_type)){
      supports=[personKey];
      resolution_method=/sent/i.test(receipt.source_type)?'email_match':'direct_identity';
    }else if(!supports.length&&personKey&&/crm|ghl|contact/i.test(receipt.source_type)){
      supports=[personKey];
      resolution_method='direct_identity';
    }else if(!supports.length&&personKey&&/user|teach|confirmed/i.test(receipt.source_type)){
      supports=[personKey];
      resolution_method='user_confirmed';
    }else if(!supports.length&&personKey&&/transcript/i.test(receipt.source_type)&&mentionedNameCount){
      supports=[personKey];
      resolution_method='speaker_match';
      review_required=review_required||mentionsSeveralPeople;
    }else if(!supports.length&&personKey&&mentionedNameCount&&!mentionsSeveralPeople){
      supports=[personKey];
      resolution_method='inferred';
      review_required=true;
    }
    if(!supports.length)review_required=true;
    return {
      source_id:receipt.source_id||'',
      source_type:receipt.source_type||'relationship_evidence',
      supports_person_ids:supports,
      supports_claims:safeArray(receipt.supports_claims).length?safeArray(receipt.supports_claims):[receipt.summary||receipt.title||'relationship_context'].filter(Boolean).slice(0,3),
      relationship_context:receipt.relationship_context||receipt.summary||receipt.title||'',
      resolution_method,
      review_required
    };
  });
}
function packetMaturityDecision(packet={},admissionDecision={},evidenceBindings=[]){
  const admission=admissionDecision.admission_status||'rejected';
  if(admission==='blocked_by_identity')return {maturity:'blocked_by_identity',why:'Meaningful relationship evidence exists, but identity is not safe enough to use.',supporting_receipts:admissionDecision.source_receipts||[],missing_variables:['identity_resolution'],contradictions:[],can_evaluate_moves:false};
  if(admission==='rejected')return {maturity:'thin',why:'This source is not admitted as a real Stewardship relationship.',supporting_receipts:[],missing_variables:['relationship_evidence'],contradictions:[],can_evaluate_moves:false};
  const trusted=safeArray(evidenceBindings).filter(binding=>!binding.review_required&&safeArray(binding.supports_person_ids).length);
  const sourceTypes=new Set(trusted.map(binding=>String(binding.source_type||'').toLowerCase()));
  const publicOnly=trusted.length&&[...sourceTypes].every(type=>/apollo|outscraper|linkedin|public|directory|scrape/.test(type));
  const needs=safeArray(packet.what_this_person_needs);
  const offers=safeArray(packet.what_this_person_offers);
  const openLoops=safeArray(packet.relationship_state?.open_loops);
  const missing=[
    !packet.person?.crm_contact_id&&packet.person?.identity_status!=='known_alias'?'crm_contact_id':'',
    needs.length?'':'what_this_person_needs',
    offers.length?'':'what_this_person_offers',
    trusted.length?'':'bound_source_receipts'
  ].filter(Boolean);
  if(publicOnly)return {maturity:'thin',why:'Public enrichment alone cannot mature a relationship packet.',supporting_receipts:trusted,missing_variables:missing,contradictions:[],can_evaluate_moves:false};
  if(trusted.length>=3&&sourceTypes.size>=2&&(needs.length||offers.length||openLoops.length)){
    return {maturity:'strong',why:'Identity and current relationship context are supported by multiple bound sources.',supporting_receipts:trusted.slice(0,6),missing_variables:missing,contradictions:[],can_evaluate_moves:true};
  }
  if(trusted.length&&(needs.length||offers.length||openLoops.length)){
    return {maturity:'usable',why:'The relationship is real and has enough bound context to evaluate moves.',supporting_receipts:trusted.slice(0,5),missing_variables:missing,contradictions:[],can_evaluate_moves:true};
  }
  if(trusted.length||admission==='admitted'){
    return {maturity:'developing',why:'The relationship is real, but VAL still needs clearer needs, offers, commitments, or current context.',supporting_receipts:trusted.slice(0,4),missing_variables:missing,contradictions:[],can_evaluate_moves:false};
  }
  return {maturity:'thin',why:'Not enough bound relationship context is available yet.',supporting_receipts:[],missing_variables:missing,contradictions:[],can_evaluate_moves:false};
}
function executiveVisibilityDecision({packet={},admissionDecision={},maturityDecision={}}={}){
  if(admissionDecision.admission_status==='rejected')return {visibility:'hidden',why_visible_or_hidden:'Rejected sources do not enter the active Stewardship queue.',attention_reason:'',review_required:false};
  if(admissionDecision.admission_status==='blocked_by_identity'||maturityDecision.maturity==='blocked_by_identity')return {visibility:'identity_review',why_visible_or_hidden:'Meaningful context exists, but identity must be reviewed first.',attention_reason:'Review contact identity',review_required:true};
  const hasCommitment=safeArray(packet.relationship_state?.open_loops).length||/\b(introduce|connect|follow up|send|review|confirm|promise|commitment)\b/i.test([packet.relationship_origin?.first_meaningful_signal,packet.who_this_person_is?.current_context].join(' '));
  if(maturityDecision.can_evaluate_moves&&hasCommitment)return {visibility:'active_queue',why_visible_or_hidden:'A source-backed relationship matter may deserve attention now.',attention_reason:'Review next relationship move',review_required:false};
  if(['developing','usable','strong'].includes(maturityDecision.maturity))return {visibility:'people_to_watch',why_visible_or_hidden:'Real relationship packet should accumulate meaning, but no active move is ready.',attention_reason:'Watch for new source-backed context',review_required:false};
  return {visibility:'hidden',why_visible_or_hidden:'No executive attention is needed right now.',attention_reason:'',review_required:false};
}
function personPacketFromContact(contact={},options={}){
  const evidence=sourceReceipts([
    ...safeArray(contact.evidence),
    ...safeArray(contact.sourceReceipts||contact.source_refs||contact.sourceRefs),
    textEvidenceItem(contact.summary||contact.reason||contact.why||'','relationship_summary'),
    textEvidenceItem(contact.recommendedAction||'','relationship_recommended_action')
  ].filter(Boolean),'relationship_evidence',12);
  const needs=normalizedList(contact.needs,contact.openLoops,contact.risks,contact.riskSignals);
  const offers=normalizedList(contact.offers,contact.opportunitySignals,contact.opportunities,contact.tags);
  const identity=packetIdentity(contact);
  const firstSeen=firstText(contact.firstSeenAt,contact.createdAt,contact.lastObservedAt,contact.lastInteractionAt,contact.receivedAt,contact.sentAt);
  const lastSignal=firstText(contact.lastMeaningfulSignalAt,contact.lastObservedAt,contact.lastInteractionAt,contact.updatedAt,contact.receivedAt,contact.sentAt,firstSeen);
  const relationshipEvidenceMap=relationshipEvidenceMapForContact(contact);
  const lastDirectCommunicationAt=firstText(relationshipEvidenceMap.last_direct_communication_at,contact.lastDirectCommunicationAt,contact.last_direct_communication_at);
  const shell={
    packet_type:'person_packet',
    packet_id:options.packetId||packetIdForContact(contact),
    person:identity,
    relationship_origin:{
      first_seen_at:firstSeen,
      first_meaningful_signal:firstText(contact.firstMeaningfulSignal,contact.reason,contact.summary,contact.recommendedAction),
      source_receipts:evidence.slice(0,3)
    },
    who_this_person_is:{
      summary:firstText(contact.summary,contact.reason,contact.why,[identity.role,identity.company_or_context].filter(Boolean).join(' at '),identity.name),
      relationship_to_user:firstText(contact.relationshipToUser,contact.relationship_type,contact.relationshipType,contact.source),
      current_context:firstText(contact.currentContext,contact.recommendedAction,contact.reason,contact.summary),
      source_receipts:evidence,
      confidence:evidence.length>=2?'medium':'low'
    },
    what_this_person_needs:needs.map(need=>({need,why_it_matters:need,timing:'unknown',source_receipts:evidence.slice(0,4),confidence:evidence.length?'medium':'low'})),
    what_this_person_offers:offers.map(offer=>({offer,why_it_matters:offer,source_receipts:evidence.slice(0,4),confidence:evidence.length?'medium':'low'})),
    relationship_state:{
      status:firstText(contact.relationshipStatus,contact.relationship_status,contact.status,contact.state)||'unknown',
      last_meaningful_signal_at:lastSignal,
      last_direct_communication_at:lastDirectCommunicationAt,
      last_direct_communication_source:relationshipEvidenceMap.last_direct_communication_source,
      open_loops:normalizedList(contact.openLoops),
      source_receipts:evidence.slice(0,5)
    },
    relationship_evidence_map:relationshipEvidenceMap,
    evidence:{
      email_receipts:evidence.filter(item=>/email|gmail|outlook/i.test(item.source_type)),
      sent_email_receipts:evidence.filter(item=>/sent/i.test(item.source_type)),
      cc_receipts:evidence.filter(item=>/cc/i.test(item.source_type)),
      transcript_receipts:evidence.filter(item=>/transcript/i.test(item.source_type)),
      calendar_receipts:evidence.filter(item=>/calendar|meeting/i.test(item.source_type)),
      project_receipts:evidence.filter(item=>/project/i.test(item.source_type)),
      document_receipts:evidence.filter(item=>/document|file|doc/i.test(item.source_type)),
      crm_receipts:evidence.filter(item=>/crm|ghl|contact/i.test(item.source_type)),
      user_confirmed_receipts:evidence.filter(item=>/user|confirmed|teach_val/i.test(item.source_type))
    },
    packet_state:{updated_at:options.updatedAt||new Date().toISOString()}
  };
  const admission=options.relationshipAdmission||options.admissionDecision||relationshipAdmissionDecision({contact,identity,source_receipts:evidence});
  const evidenceBindings=options.evidenceBindings||sourceToPersonEvidenceBindings({contact,identity,source_receipts:evidence});
  const maturityDecision=options.packetMaturity||packetMaturityDecision(shell,admission,evidenceBindings);
  const visibility=options.executiveVisibility||executiveVisibilityDecision({packet:shell,admissionDecision:admission,maturityDecision});
  shell.relationship_admission=admission;
  shell.evidence_bindings=evidenceBindings;
  shell.packet_maturity=maturityDecision;
  shell.executive_visibility=visibility;
  shell.packet_state={
    maturity:maturityDecision.maturity,
    needs_review:identity.identity_status!=='linked'||maturityDecision.maturity==='thin'||maturityDecision.maturity==='blocked_by_identity'||!!admission.review_required,
    missing_variables:maturityDecision.missing_variables||[
      !identity.crm_contact_id?'crm_contact_id':'',
      needs.length?'':'what_this_person_needs',
      offers.length?'':'what_this_person_offers',
      evidence.length?'':'source_receipts'
    ].filter(Boolean),
    can_evaluate_moves:!!maturityDecision.can_evaluate_moves,
    fresh_for_suggested_introductions:relationshipEvidenceMap.fresh_for_suggested_introductions===true,
    updated_at:options.updatedAt||new Date().toISOString()
  };
  return shell;
}
function personPacketText(packet={},field=''){
  const values=field==='needs'
    ? safeArray(packet.what_this_person_needs).map(item=>item.need||item.summary||'')
    : safeArray(packet.what_this_person_offers).map(item=>item.offer||item.summary||'');
  return values.filter(Boolean).join(' ');
}
function contactFromPersonPacket(packet={}){
  const person=packet.person||{};
  return {
    contactId:person.crm_contact_id||person.contactId||'',
    crmContactId:person.crm_contact_id||'',
    name:person.name||'Relationship',
    email:safeArray(person.email_addresses)[0]||'',
    company:person.company_or_context||'',
    role:person.role||'',
    needs:safeArray(packet.what_this_person_needs).map(item=>item.need).filter(Boolean),
    offers:safeArray(packet.what_this_person_offers).map(item=>item.offer).filter(Boolean),
    evidence:safeArray(packet.who_this_person_is?.source_receipts||packet.relationship_state?.source_receipts)
  };
}
function stewardshipMovePacket({currentPacket={},candidatePacket={},candidate={},direction={},score=0,stewardshipType='introduction'}={}){
  const currentContact=contactFromPersonPacket(currentPacket);
  const candidateContact=contactFromPersonPacket(candidatePacket);
  const source_receipts=sourceReceipts([...(currentPacket.relationship_origin?.source_receipts||[]),...(candidatePacket.relationship_origin?.source_receipts||[])], 'stewardship_move');
  const ready=score>0&&contactId(currentContact)&&contactId(candidateContact);
  const moveLabel=stewardshipType==='introduction'?'Review possible introduction':'Review next relationship move';
  const reason=compactText(candidate.whyThisMayMatter||`${currentContact.name||'This person'} and ${candidateContact.name||'this person'} may have useful overlap in their person packets.`,260);
  return {
    packet_type:'stewardship_move_packet',
    stewardship_type:stewardshipType,
    focus_person_packet_id:currentPacket.packet_id||'',
    compared_person_packet_ids:[candidatePacket.packet_id||''].filter(Boolean),
    candidate_contact_id:candidateContact.contactId||'',
    current_contact_id:currentContact.contactId||'',
    candidate_name:candidateContact.name||candidateContact.email||'Relationship',
    recommended_move:{
      type:stewardshipType,
      label:moveLabel,
      status:ready?'ready_for_review':'waiting_for_evidence',
      summary:ready?reason:'VAL needs stronger packet evidence before recommending a relationship move.',
      next_step:stewardshipType==='introduction'?'Draft an introduction for review only if the reason serves both people.':'Prepare the relationship move for executive review only.',
      approval_required:true
    },
    why_this_may_matter:reason,
    direction:{
      who_needs_this_person:direction.whoNeedsThisPerson||0,
      who_this_person_needs:direction.whoThisPersonNeeds||0,
      primary:direction.primary||''
    },
    packet_basis:{
      focus_needs:safeArray(currentPacket.what_this_person_needs),
      focus_offers:safeArray(currentPacket.what_this_person_offers),
      candidate_needs:safeArray(candidatePacket.what_this_person_needs),
      candidate_offers:safeArray(candidatePacket.what_this_person_offers)
    },
    source_receipts,
    review_posture:'Human review required. VAL should prepare judgment, not execute the move.',
    no_external_action:true
  };
}
function stewardshipMatchPacket({currentPacket={},candidatePacket={},candidate={},direction={},score=0}={}){
  const movePacket=stewardshipMovePacket({currentPacket,candidatePacket,candidate,direction,score,stewardshipType:candidate.stewardshipType||'introduction'});
  const currentContact=contactFromPersonPacket(currentPacket);
  const candidateContact=contactFromPersonPacket(candidatePacket);
  const source_receipts=sourceReceipts([...(currentPacket.relationship_origin?.source_receipts||[]),...(candidatePacket.relationship_origin?.source_receipts||[])], 'stewardship_match');
  return {
    packet_type:'stewardship_match_packet',
    stewardship_move_packet:movePacket,
    focus_person_packet_id:currentPacket.packet_id||'',
    compared_person_packet_ids:[candidatePacket.packet_id||''].filter(Boolean),
    candidate_contact_id:candidateContact.contactId||'',
    current_contact_id:currentContact.contactId||'',
    what_this_person_needs:safeArray(currentPacket.what_this_person_needs),
    what_this_person_offers:safeArray(currentPacket.what_this_person_offers),
    candidate_needs:safeArray(candidatePacket.what_this_person_needs),
    candidate_offers:safeArray(candidatePacket.what_this_person_offers),
    people_they_should_meet:direction.whoThisPersonNeeds>0?[{
      person:candidateContact.name,
      reason:compactText(candidate.whyThisMayMatter||`${candidateContact.name} may offer something ${currentContact.name} needs.`,240),
      need_met:personPacketText(currentPacket,'needs'),
      source_receipts,
      approval_status:'ready_for_review'
    }]:[],
    people_who_need_them:direction.whoNeedsThisPerson>0?[{
      person:candidateContact.name,
      reason:compactText(candidate.whyThisMayMatter||`${candidateContact.name} may need something ${currentContact.name} offers.`,240),
      offer_matched:personPacketText(currentPacket,'offers'),
      source_receipts,
      approval_status:'ready_for_review'
    }]:[],
    next_stewardship_move:{
      move:movePacket.recommended_move.label,
      type:movePacket.stewardship_type,
      status:movePacket.recommended_move.status,
      why:compactText(candidate.whyThisMayMatter||'',240),
      source_receipts,
      approval_required:true
    },
    no_external_action:true
  };
}
function overlapScore(a='',b=''){
  const aSet=new Set(lowerWords(a)),bSet=new Set(lowerWords(b));
  let score=0;
  for(const word of aSet)if(bSet.has(word))score+=1;
  return score;
}
function complementaryScore(current={},candidate={}){
  const currentPacket=current.packet_type==='person_packet'?current:personPacketFromContact(current);
  const candidatePacket=candidate.packet_type==='person_packet'?candidate:personPacketFromContact(candidate);
  const currentNeeds=personPacketText(currentPacket,'needs')||safeArray(current.needs).join(' ')||safeArray(current.openLoops).join(' ')||current.reason||'';
  const currentOffers=personPacketText(currentPacket,'offers')||safeArray(current.offers).join(' ')||safeArray(current.opportunitySignals).join(' ')||current.summary||'';
  const candidateNeeds=personPacketText(candidatePacket,'needs')||safeArray(candidate.needs).join(' ')||safeArray(candidate.openLoops).join(' ')||candidate.reason||'';
  const candidateOffers=personPacketText(candidatePacket,'offers')||safeArray(candidate.offers).join(' ')||safeArray(candidate.opportunitySignals).join(' ')||candidate.summary||'';
  return overlapScore(currentNeeds,candidateOffers)+overlapScore(candidateNeeds,currentOffers)+overlapScore(evidenceText(current),evidenceText(candidate));
}
function introductionDirection(current={},candidate={}){
  const currentPacket=current.packet_type==='person_packet'?current:personPacketFromContact(current);
  const candidatePacket=candidate.packet_type==='person_packet'?candidate:personPacketFromContact(candidate);
  const currentNeeds=personPacketText(currentPacket,'needs')||safeArray(current.needs).join(' ')||safeArray(current.openLoops).join(' ')||current.reason||'';
  const currentOffers=personPacketText(currentPacket,'offers')||safeArray(current.offers).join(' ')||safeArray(current.opportunitySignals).join(' ')||current.summary||'';
  const candidateNeeds=personPacketText(candidatePacket,'needs')||safeArray(candidate.needs).join(' ')||safeArray(candidate.openLoops).join(' ')||candidate.reason||'';
  const candidateOffers=personPacketText(candidatePacket,'offers')||safeArray(candidate.offers).join(' ')||safeArray(candidate.opportunitySignals).join(' ')||candidate.summary||'';
  const whoNeedsThisPerson=overlapScore(candidateNeeds,currentOffers);
  const whoThisPersonNeeds=overlapScore(currentNeeds,candidateOffers);
  return {
    whoNeedsThisPerson,
    whoThisPersonNeeds,
    primary:whoNeedsThisPerson>=whoThisPersonNeeds?'who_needs_this_person':'who_this_person_needs'
  };
}
function relationshipIntroCandidates({currentContact={},crmContacts=[],limit=5}={}){
  const currentPacket=currentContact.packet_type==='person_packet'?currentContact:personPacketFromContact(currentContact);
  const currentContactForMatch=contactFromPersonPacket(currentPacket);
  const currentId=contactId(currentContactForMatch);
  if(!currentId)return {ok:true,candidates:[],unknowns:['current_contact_id_unresolved'],noExternalAction:true};
  if(currentPacket.relationship_admission?.admission_status&&currentPacket.relationship_admission.admission_status!=='admitted')return {ok:true,candidates:[],unknowns:['current_relationship_not_admitted'],noExternalAction:true};
  if(currentPacket.packet_maturity?.maturity==='blocked_by_identity')return {ok:true,candidates:[],unknowns:['current_identity_blocked'],noExternalAction:true};
  const currentName=compactText(currentContactForMatch.name||currentContactForMatch.email||'this person',120);
  const candidates=safeArray(crmContacts)
    .map(contact=>contact.packet_type==='person_packet'?contact:personPacketFromContact(contact))
    .filter(packet=>contactId(contactFromPersonPacket(packet))&&contactId(contactFromPersonPacket(packet))!==currentId)
    .filter(packet=>(packet.relationship_admission?.admission_status||'admitted')==='admitted'&&packet.packet_maturity?.maturity!=='blocked_by_identity')
    .map(contact=>{
      const candidatePacket=contact;
      const candidateContact=contactFromPersonPacket(candidatePacket);
      const otherId=contactId(candidateContact);
      const score=complementaryScore(currentPacket,candidatePacket);
      const direction=introductionDirection(currentPacket,candidatePacket);
      const reason=score>0
        ? `${currentName} and ${candidateContact.name||candidateContact.email||'this contact'} have overlapping needs and offers from their person packets.`
        : `${candidateContact.name||candidateContact.email||'This contact'} is identity-safe, but VAL needs stronger person-packet evidence before recommending an introduction.`;
      const candidate={
        id:`intro_${currentId}_${otherId}`.toLowerCase().replace(/[^a-z0-9:_-]+/g,'_').slice(0,180),
        type:'relationship_introduction_candidate',
        stewardshipType:'introduction',
        recommendedMove:'Review possible introduction',
        status:score>0?'candidate':'weak_signal',
        personA:{name:currentName,contactId:currentId,email:currentContactForMatch.email||'',relationshipId:currentPacket.packet_id||currentId},
        personB:{name:candidateContact.name||candidateContact.email||'Contact',contactId:otherId,email:candidateContact.email||'',relationshipId:candidatePacket.packet_id||otherId},
        score,
        direction,
        confidence:Math.max(0.35,Math.min(0.86,0.45+(score*0.06))),
        whyThisMayMatter:reason,
        whatValPrepared:'A reviewable introduction email candidate grounded in person packets, with both CRM contact IDs attached.',
        whatWillNotHappen:'VAL will not send the introduction, create a calendar event, change CRM records, or expose either person without review.',
        requiresApproval:true,
        noExternalAction:true,
        personPackets:{current:currentPacket,candidate:candidatePacket},
        draft:{
          subject:`Introduction: ${currentName} <> ${candidateContact.name||candidateContact.email||'contact'}`,
          body:[
            `Hi ${currentName} and ${candidateContact.name||'there'},`,
            '',
            'I thought of connecting you because there may be useful overlap in what you are each building or needing right now.',
            '',
            'I will keep this brief and let you both decide whether a conversation would be useful.'
          ].join('\n')
        }
      };
      candidate.stewardshipMovePacket=stewardshipMovePacket({currentPacket,candidatePacket,candidate,direction,score,stewardshipType:'introduction'});
      candidate.stewardshipMatchPacket=stewardshipMatchPacket({currentPacket,candidatePacket,candidate,direction,score});
      return candidate;
    })
    .filter(item=>item.score>0)
    .sort((a,b)=>b.score-a.score||b.confidence-a.confidence)
    .slice(0,Math.max(1,Math.min(Number(limit)||5,10)));
  return {ok:true,candidates,unknowns:[],noExternalAction:true};
}

function introPersonLabel(person={}){
  return compactText([person.name,person.company].filter(Boolean).join(' · ')||person.email||'Relationship',140);
}
function relationshipIntroReviewSurface({currentContact={},whoNeedsThisPerson=[],whoThisPersonNeeds=[],candidates=[]}={}){
  const currentName=compactText(currentContact.name||currentContact.email||'this person',120);
  function card(candidate={},direction=''){
    const other=candidate.personB||{};
    return {
      id:candidate.id,
      direction,
      title:introPersonLabel(other),
      meaning:compactText(candidate.whyThisMayMatter||'Potential relationship leverage.',220),
      confidence:candidate.confidence||0,
      contactIds:{
        current:candidate.personA?.contactId||contactId(currentContact),
        other:other.contactId||''
      },
      prepared:candidate.whatValPrepared||'A reviewable introduction email candidate.',
      boundary:candidate.whatWillNotHappen||'VAL will not send, expose contacts, schedule, or change CRM without review.',
      nextActions:[
        {id:'draft_intro_candidate',label:'Draft intro for review',candidateId:candidate.id,requiresApproval:true,noExternalAction:true},
        {id:'open_other_relationship',label:'Open relationship brief',contactId:other.contactId||'',requiresApproval:false,noExternalAction:true},
        {id:'dismiss_intro_candidate',label:'Not useful',candidateId:candidate.id,requiresApproval:false,noExternalAction:true}
      ]
    };
  }
  const sections=[
    {
      id:'who_needs_this_person',
      title:`Who needs ${currentName}`,
      question:'Who in your network would be helped by this person?',
      cards:safeArray(whoNeedsThisPerson).map(candidate=>card(candidate,'who_needs_this_person'))
    },
    {
      id:'who_this_person_needs',
      title:`Who ${currentName} needs`,
      question:'Who could help this person move forward?',
      cards:safeArray(whoThisPersonNeeds).map(candidate=>card(candidate,'who_this_person_needs'))
    }
  ];
  return {
    kind:'relationship_introduction_review',
    title:'Next relationship move review',
    summary:`VAL looked in both directions around ${currentName}: who may need them, and who they may need.`,
    sections,
    emptyState:safeArray(candidates).length?'':'No identity-safe introduction candidate has enough evidence yet.',
    boundary:'Review first. VAL will not send an introduction, expose contact details, create a calendar event, scrape live data, import records, or change CRM from this surface.',
    requiresApproval:true,
    noExternalAction:true
  };
}

function relationshipStewardshipReviewSurface({currentContact={},whoNeedsThisPerson=[],whoThisPersonNeeds=[],candidates=[]}={}){
  const introSurface=relationshipIntroReviewSurface({currentContact,whoNeedsThisPerson,whoThisPersonNeeds,candidates});
  const currentName=compactText(currentContact.name||currentContact.email||'this person',120);
  return {
    ...introSurface,
    kind:'relationship_stewardship_review',
    title:'Next relationship move review',
    summary:`VAL checked the relationship packets around ${currentName} for thoughtful next moves. Introductions are only one possible move.`,
    emptyState:safeArray(candidates).length?'':'No identity-safe stewardship move has enough evidence yet.',
    boundary:'Review first. VAL will not send messages, make introductions, expose contact details, create calendar events, scrape live data, import records, or change CRM from this surface.',
    moveTypes:['introduction','follow_up','reconnection','congratulations','resource','referral','meeting','reminder','check_in','clarifying_question','wait_or_watch'],
    sections:introSurface.sections.map(section=>({
      ...section,
      question:section.id==='who_needs_this_person'
        ? 'Who might be helped by this person, and what move would serve them?'
        : 'Who or what might help this person, and what move would serve them?'
    }))
  };
}

function relationshipIntroDraft(candidate={}){
  const personA=candidate.personA||{};
  const personB=candidate.personB||{};
  const contactA=compactText(personA.contactId||'',120);
  const contactB=compactText(personB.contactId||'',120);
  if(!contactA||!contactB)return {ok:false,error:'Both CRM contact IDs are required before VAL can draft an introduction.'};
  const nameA=compactText(personA.name||personA.email||'there',120);
  const nameB=compactText(personB.name||personB.email||'there',120);
  const firstA=nameA.split(/\s+/)[0]||nameA;
  const firstB=nameB.split(/\s+/)[0]||nameB;
  const subject=compactText(candidate.draft?.subject||`Introduction: ${nameA} <> ${nameB}`,180);
  const suppliedBody=String(candidate.draft?.body||'').trim().slice(0,3000);
  const body=suppliedBody||[
    `Hi ${firstA} and ${firstB},`,
    '',
    'I wanted to introduce you because I think there may be a useful overlap in what you are each building, deciding, or carrying right now.',
    '',
    compactText(candidate.whyThisMayMatter||'VAL flagged this as a relationship connection worth reviewing before sending.',360),
    '',
    'No pressure from either side. I simply thought this might be a worthwhile conversation if it feels useful to both of you.'
  ].join('\n');
  const recipients=[
    {name:nameA,email:compactText(personA.email||'',320),contactId:contactA,relationshipId:compactText(personA.relationshipId||personA.personPacketId||contactA,220)},
    {name:nameB,email:compactText(personB.email||'',320),contactId:contactB,relationshipId:compactText(personB.relationshipId||personB.personPacketId||contactB,220)}
  ];
  const relationshipIds=[...new Set(recipients.map(item=>item.relationshipId).filter(Boolean))];
  return {
    ok:true,
    draftType:'introduction_email_draft',
    provider:'internal',
    subject,
    body,
    recipients,
    relationshipIds,
    sourceContext:{
      source:'relationship_introduction_review',
      candidateId:candidate.id||'',
      personA,
      personB,
      recipients,
      relationshipIds,
      contactIds:{personA:contactA,personB:contactB},
      direction:candidate.direction||{},
      whyThisMayMatter:candidate.whyThisMayMatter||'',
      confidence:candidate.confidence||0,
      requiresApproval:true,
      externalSend:false,
      noExternalAction:true
    }
  };
}

module.exports={relationshipIntroCandidates,contactId,introductionDirection,relationshipIntroReviewSurface,relationshipStewardshipReviewSurface,relationshipIntroDraft,personPacketFromContact,contactFromPersonPacket,stewardshipMatchPacket,stewardshipMovePacket,relationshipAdmissionDecision,sourceToPersonEvidenceBindings,packetMaturityDecision,executiveVisibilityDecision};
