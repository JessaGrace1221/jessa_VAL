'use strict';

function safeArray(value){return Array.isArray(value)?value:[];}
function compactText(value,limit=300){return String(value||'').replace(/\s+/g,' ').trim().slice(0,limit);}
function lowerWords(value=''){
  return compactText(value,1000).toLowerCase().split(/[^a-z0-9]+/).filter(word=>word.length>2);
}
function contactId(contact={}){
  return compactText(contact.crmContactId||contact.contactId||contact.contact_id||(contact.source==='ghl_contact'?contact.id:''),120);
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
function overlapScore(a='',b=''){
  const aSet=new Set(lowerWords(a)),bSet=new Set(lowerWords(b));
  let score=0;
  for(const word of aSet)if(bSet.has(word))score+=1;
  return score;
}
function complementaryScore(current={},candidate={}){
  const currentNeeds=safeArray(current.needs).join(' ')||safeArray(current.openLoops).join(' ')||current.reason||'';
  const currentOffers=safeArray(current.offers).join(' ')||safeArray(current.opportunitySignals).join(' ')||current.summary||'';
  const candidateNeeds=safeArray(candidate.needs).join(' ')||safeArray(candidate.openLoops).join(' ')||candidate.reason||'';
  const candidateOffers=safeArray(candidate.offers).join(' ')||safeArray(candidate.opportunitySignals).join(' ')||candidate.summary||'';
  return overlapScore(currentNeeds,candidateOffers)+overlapScore(candidateNeeds,currentOffers)+overlapScore(evidenceText(current),evidenceText(candidate));
}
function introductionDirection(current={},candidate={}){
  const currentNeeds=safeArray(current.needs).join(' ')||safeArray(current.openLoops).join(' ')||current.reason||'';
  const currentOffers=safeArray(current.offers).join(' ')||safeArray(current.opportunitySignals).join(' ')||current.summary||'';
  const candidateNeeds=safeArray(candidate.needs).join(' ')||safeArray(candidate.openLoops).join(' ')||candidate.reason||'';
  const candidateOffers=safeArray(candidate.offers).join(' ')||safeArray(candidate.opportunitySignals).join(' ')||candidate.summary||'';
  const whoNeedsThisPerson=overlapScore(candidateNeeds,currentOffers);
  const whoThisPersonNeeds=overlapScore(currentNeeds,candidateOffers);
  return {
    whoNeedsThisPerson,
    whoThisPersonNeeds,
    primary:whoNeedsThisPerson>=whoThisPersonNeeds?'who_needs_this_person':'who_this_person_needs'
  };
}
function relationshipIntroCandidates({currentContact={},crmContacts=[],limit=5}={}){
  const currentId=contactId(currentContact);
  if(!currentId)return {ok:true,candidates:[],unknowns:['current_contact_id_unresolved'],noExternalAction:true};
  const currentName=compactText(currentContact.name||currentContact.email||'this person',120);
  const candidates=safeArray(crmContacts)
    .filter(contact=>contactId(contact)&&contactId(contact)!==currentId)
    .map(contact=>{
      const otherId=contactId(contact);
      const score=complementaryScore(currentContact,contact);
      const direction=introductionDirection(currentContact,contact);
      const reason=score>0
        ? `${currentName} and ${contact.name||contact.email||'this contact'} have overlapping needs, offers, opportunities, or relationship evidence.`
        : `${contact.name||contact.email||'This contact'} is identity-safe, but VAL needs stronger evidence before recommending an introduction.`;
      return {
        id:`intro_${currentId}_${otherId}`.toLowerCase().replace(/[^a-z0-9:_-]+/g,'_').slice(0,180),
        type:'relationship_introduction_candidate',
        status:score>0?'candidate':'weak_signal',
        personA:{name:currentName,contactId:currentId,email:currentContact.email||''},
        personB:{name:contact.name||contact.email||'Contact',contactId:otherId,email:contact.email||''},
        score,
        direction,
        confidence:Math.max(0.35,Math.min(0.86,0.45+(score*0.06))),
        whyThisMayMatter:reason,
        whatValPrepared:'A reviewable introduction email candidate with both CRM contact IDs attached.',
        whatWillNotHappen:'VAL will not send the introduction, create a calendar event, change CRM records, or expose either person without review.',
        requiresApproval:true,
        noExternalAction:true,
        draft:{
          subject:`Introduction: ${currentName} <> ${contact.name||contact.email||'contact'}`,
          body:[
            `Hi ${currentName} and ${contact.name||'there'},`,
            '',
            'I thought of connecting you because there may be useful overlap in what you are each building or needing right now.',
            '',
            'I will keep this brief and let you both decide whether a conversation would be useful.'
          ].join('\n')
        }
      };
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
    title:'Introduction leverage review',
    summary:`VAL looked in both directions around ${currentName}: who needs them, and who they may need.`,
    sections,
    emptyState:safeArray(candidates).length?'':'No identity-safe introduction candidate has enough evidence yet.',
    boundary:'Review first. VAL will not send an introduction, expose contact details, create a calendar event, scrape live data, import records, or change CRM from this surface.',
    requiresApproval:true,
    noExternalAction:true
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

module.exports={relationshipIntroCandidates,contactId,introductionDirection,relationshipIntroReviewSurface,relationshipIntroDraft};
