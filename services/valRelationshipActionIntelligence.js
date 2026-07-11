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
    confidence:item.confidence||item.source_confidence_label||item.sourceConfidenceLabel||'unknown'
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
function normalizedList(...sources){
  const seen=new Set();
  return sources.flatMap(source=>safeArray(source)).map(item=>{
    if(typeof item==='string')return compactText(item,220);
    return compactText(item.need||item.offer||item.summary||item.text||item.content||item.reason||item.title||'',220);
  }).filter(item=>{
    const key=item.toLowerCase();
    if(!item||seen.has(key))return false;
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
  const maturity=contactId(contact)&&(needs.length||offers.length)&&evidence.length?'usable':((needs.length||offers.length||evidence.length)?'developing':'thin');
  return {
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
      open_loops:normalizedList(contact.openLoops),
      source_receipts:evidence.slice(0,5)
    },
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
    packet_state:{
      maturity,
      needs_review:identity.identity_status!=='linked'||maturity==='thin',
      missing_variables:[
        !identity.crm_contact_id?'crm_contact_id':'',
        needs.length?'':'what_this_person_needs',
        offers.length?'':'what_this_person_offers',
        evidence.length?'':'source_receipts'
      ].filter(Boolean),
      updated_at:options.updatedAt||new Date().toISOString()
    }
  };
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
  const currentName=compactText(currentContactForMatch.name||currentContactForMatch.email||'this person',120);
  const candidates=safeArray(crmContacts)
    .map(contact=>contact.packet_type==='person_packet'?contact:personPacketFromContact(contact))
    .filter(packet=>contactId(contactFromPersonPacket(packet))&&contactId(contactFromPersonPacket(packet))!==currentId)
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
        personA:{name:currentName,contactId:currentId,email:currentContactForMatch.email||''},
        personB:{name:candidateContact.name||candidateContact.email||'Contact',contactId:otherId,email:candidateContact.email||''},
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
  const body=compactText(candidate.draft?.body,3000)||[
    `Hi ${firstA} and ${firstB},`,
    '',
    'I wanted to introduce you because I think there may be a useful overlap in what you are each building, deciding, or carrying right now.',
    '',
    compactText(candidate.whyThisMayMatter||'VAL flagged this as a relationship connection worth reviewing before sending.',360),
    '',
    'No pressure from either side. I simply thought this might be a worthwhile conversation if it feels useful to both of you.'
  ].join('\n');
  return {
    ok:true,
    draftType:'introduction_email_draft',
    provider:'internal',
    subject,
    body,
    sourceContext:{
      source:'relationship_introduction_review',
      candidateId:candidate.id||'',
      personA,
      personB,
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

module.exports={relationshipIntroCandidates,contactId,introductionDirection,relationshipIntroReviewSurface,relationshipStewardshipReviewSurface,relationshipIntroDraft,personPacketFromContact,contactFromPersonPacket,stewardshipMatchPacket,stewardshipMovePacket};
