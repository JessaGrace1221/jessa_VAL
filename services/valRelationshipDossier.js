'use strict';

function safeArray(value){return Array.isArray(value)?value:[];}
function compactText(value,limit=320){
  return String(value||'').replace(/\s+/g,' ').trim().slice(0,limit);
}
function firstText(...values){
  return values.map(value=>compactText(value)).find(Boolean)||'';
}
function itemText(item){
  if(item==null)return '';
  if(typeof item==='string')return compactText(item);
  return compactText(item.content||item.summary||item.text||item.title||item.reason||item.note||item.rawText||'');
}
function normalizeList(items,limit=5){
  return safeArray(items).map(itemText).filter(Boolean).slice(0,limit);
}
function normalizeEvidence(items,limit=6){
  return safeArray(items).map((item)=> {
    if(typeof item==='string')return {type:'evidence',summary:compactText(item,220),confidence:'unknown'};
    return {
      type:compactText(item.type||item.sourceType||item.source||'evidence',80),
      title:compactText(item.title||item.subject||'',120),
      summary:compactText(item.summary||item.content||item.text||item.reason||item.rawText||'',260),
      date:item.date||item.createdAt||item.created_at||item.lastObservedAt||'',
      confidence:item.confidence||item.source_confidence_label||item.sourceConfidenceLabel||'unknown',
      sourceId:item.sourceId||item.source_id||item.id||''
    };
  }).filter(item=>item.summary||item.title).slice(0,limit);
}
function relationshipMomentum(input={}){
  const state=String(input.state||input.relationship_status||input.relationshipStatus||input.momentum_direction||input.momentumDirection||'').toLowerCase();
  if(/risk|cool|slow|down|waiting|stuck/.test(state))return 'Needs care';
  if(/warm|growing|up|momentum|opportun|front/.test(state))return 'Growing';
  if(input.openLoops?.length)return 'Open loop';
  if(input.opportunities?.length||input.opportunitySignals?.length)return 'Opportunity';
  if(input.risks?.length||input.riskSignals?.length)return 'Needs care';
  return 'Observed';
}
function buildWisdom({name,openLoops=[],risks=[],opportunities=[],summary='',recommendedAction=''}) {
  if(risks.length)return `Protect this relationship. ${risks[0]}`;
  if(openLoops.length)return `Do not let this become invisible. ${openLoops[0]}`;
  if(opportunities.length)return `This relationship can create leverage. ${opportunities[0]}`;
  if(recommendedAction)return compactText(recommendedAction,180);
  return name?`Remember what this relationship is becoming, not only what has happened with ${name}.`:compactText(summary||'This relationship deserves context before action.',180);
}
function relationshipDossierActions({id='',name='',email='',recommendedAction=''}={}){
  const targetId=encodeURIComponent(id||email||name||'relationship');
  const contactRef={id,name,email};
  const observerScope=['hearth','executive_briefing','relationship_drawer','meeting_prep','chat','ready_for_you','dashboard'];
  return [
    {
      id:'open_full_file',
      label:'Open full file',
      intent:'inspect',
      observerScope,
      type:'route',
      route:`./dashboard.html?view=relationships&targetType=person&targetId=${targetId}`,
      contactRef,
      willDo:'Open the relationship file for inspection.',
      willNotDo:'No message, task, CRM write, or external action will happen.'
    },
    {
      id:'ask_alignment',
      label:'Ask what deserves attention',
      intent:'judgment',
      observerScope,
      type:'workspace',
      workspace:'alignment',
      contactRef,
      willDo:'Open an Alignment workspace grounded in this relationship.',
      willNotDo:'VAL will not decide for the user or take external action.'
    },
    {
      id:'draft_message',
      label:'Draft message',
      intent:'prepare',
      observerScope,
      type:'endpoint',
      endpoint:'/api/relationships/actions',
      method:'POST',
      contactRef,
      willDo:'Create an internal draft for review.',
      willNotDo:'Nothing will be sent.'
    },
    {
      id:'draft_linkedin_comment',
      label:'Draft LinkedIn comment',
      intent:'prepare',
      observerScope,
      type:'endpoint',
      endpoint:'/api/relationships/actions',
      method:'POST',
      contactRef,
      willDo:'Prepare a thoughtful LinkedIn comment draft from known relationship context.',
      willNotDo:'VAL will not post, comment, message, scrape live data, or change CRM from this click.'
    },
    {
      id:'draft_linkedin_dm',
      label:'Draft LinkedIn DM',
      intent:'prepare',
      observerScope,
      type:'endpoint',
      endpoint:'/api/relationships/actions',
      method:'POST',
      contactRef,
      willDo:'Prepare a private LinkedIn follow-up draft from known relationship context.',
      willNotDo:'VAL will not send, post, comment, message, scrape live data, or change CRM from this click.'
    },
    {
      id:'create_task',
      label:'Create task',
      intent:'commitment',
      observerScope,
      type:'endpoint',
      endpoint:'/api/relationships/actions',
      method:'POST',
      contactRef,
      defaultTitle:recommendedAction||`Follow up with ${name||'this relationship'}`,
      willDo:'Create a local VAL task connected to this relationship.',
      willNotDo:'VAL will not invite anyone, email anyone, or write to GHL from this click.'
    },
    {
      id:'brainstorm',
      label:'Brainstorm',
      intent:'think',
      observerScope,
      type:'endpoint',
      endpoint:'/api/relationships/actions',
      method:'POST',
      contactRef,
      willDo:'Generate evidence-based ways to strengthen the relationship.',
      willNotDo:'VAL will not invent facts or take action.'
    },
    {
      id:'review_linkedin_activity',
      label:'Review LinkedIn activity',
      intent:'inspect',
      observerScope,
      type:'endpoint',
      endpoint:'/api/relationships/actions',
      method:'POST',
      contactRef,
      willDo:'Show the latest known LinkedIn signal attached to this relationship.',
      willNotDo:'VAL will not post, comment, message, scrape live data, or change CRM from this click.'
    },
    {
      id:'find_relationship_introductions',
      label:'Find introductions',
      intent:'leverage',
      observerScope,
      type:'endpoint',
      endpoint:'/api/relationships/actions',
      method:'POST',
      contactRef,
      willDo:'Prepare review-only introduction candidates in both directions: who needs this person and who this person needs.',
      willNotDo:'VAL will not send introductions, expose contacts, create calendar events, scrape live data, or change CRM from this click.'
    },
    {
      id:'refresh_relationship_observers',
      label:'Refresh observers',
      intent:'observe',
      observerScope,
      type:'endpoint',
      endpoint:'/api/relationships/actions',
      method:'POST',
      contactRef,
      willDo:'Queue or preview the relationship observers that should refresh this brief.',
      willNotDo:'VAL will not import, overwrite, post, message, or change CRM from this click.'
    },
    {
      id:'mark_vip',
      label:'Mark VIP',
      intent:'teach',
      observerScope,
      type:'endpoint',
      endpoint:'/api/relationships/actions',
      method:'POST',
      contactRef,
      willDo:'Save a relationship preference in VAL memory.',
      willNotDo:'VAL will not change CRM records from this click.'
    },
    {
      id:'snooze',
      label:'Snooze',
      intent:'protect',
      observerScope,
      type:'endpoint',
      endpoint:'/api/relationships/actions',
      method:'POST',
      contactRef,
      willDo:'Temporarily reduce visibility while preserving relationship history.',
      willNotDo:'VAL will not delete, archive, or forget the relationship.'
    },
    {
      id:'not_important',
      label:'Not important',
      intent:'teach',
      observerScope,
      type:'endpoint',
      endpoint:'/api/relationships/actions',
      method:'POST',
      contactRef,
      willDo:'Teach VAL this relationship signal should not earn attention right now.',
      willNotDo:'VAL will not delete relationship evidence.'
    }
  ];
}
function relationshipDossierSectionActions({id='',name=''}={}){
  const observerScope=['hearth','executive_briefing','relationship_drawer','meeting_prep','chat','ready_for_you','dashboard'];
  return {
    identity:[
      {id:'open_full_file',label:'Open file',intent:'inspect',observerScope,section:'identity',willDo:'Open the full relationship file.',willNotDo:'No external action will happen.'}
    ],
    evidence:[
      {id:'open_evidence',label:'Open evidence',intent:'inspect',observerScope,section:'evidence',willDo:'Open source evidence connected to this relationship.',willNotDo:'VAL will not change records.'},
      {id:'create_task_from_loop',label:'Turn loop into task',intent:'commitment',observerScope,section:'evidence',willDo:'Create a local VAL task from an open loop.',willNotDo:'VAL will not invite, email, or write to GHL.'}
    ],
    patterns:[
      {id:'ask_about_pattern',label:'Ask about pattern',intent:'understand',observerScope,section:'patterns',prompt:`Explain what is changing in ${name||'this relationship'} using only the dossier evidence.`}
    ],
    meaning:[
      {id:'ask_why_matters',label:'Ask why it matters',intent:'understand',observerScope,section:'meaning',prompt:`Explain why ${name||'this relationship'} matters to executive judgment right now.`}
    ],
    wisdom:[
      {id:'teach_wisdom',label:'Teach VAL',intent:'teach',observerScope,section:'wisdom',willDo:'Open a teaching moment about the relationship wisdom.',willNotDo:'VAL will not save durable memory without review.'}
    ]
  };
}
function relationshipBriefFromDossier(dossier={}){
  const identity=dossier.identity||{};
  const observation=dossier.observation||{};
  const interpretation=dossier.interpretation||{};
  const meaning=dossier.meaning||{};
  const wisdom=dossier.wisdom||{};
  const sourceRefs=safeArray(dossier.sourceRefs||dossier.source_refs);
  const observerNotes=safeArray(dossier.observerNotes||dossier.observer_notes).map(note=>{
    if(typeof note==='string')return {observer:'Relationship Observer',note:compactText(note,180),source:'relationship_dossier'};
    return {
      observer:compactText(note.observer||note.name||note.type||'Relationship Observer',80),
      note:compactText(note.note||note.summary||note.content||note.text||'',180),
      source:compactText(note.source||note.sourceId||note.source_id||'',100)
    };
  }).filter(note=>note.note).slice(0,5);
  if(interpretation.momentum)observerNotes.push({observer:'Momentum Observer',note:compactText(`Current relationship momentum: ${interpretation.momentum}.`,180),source:'relationship_dossier'});
  if(safeArray(interpretation.risks).length)observerNotes.push({observer:'Risk Observer',note:compactText(interpretation.risks[0],180),source:'relationship_dossier'});
  if(safeArray(interpretation.opportunities).length)observerNotes.push({observer:'Opportunity Observer',note:compactText(interpretation.opportunities[0],180),source:'relationship_dossier'});
  const actionItems=safeArray(dossier.actions&&dossier.actions.items);
  const findAction=(id)=>actionItems.find(action=>action.id===id);
  const actionRef=(id,label)=> {
    const action=findAction(id);
    return action?{id:action.id,label:label||action.label,intent:action.intent,type:action.type,endpoint:action.endpoint||'',route:action.route||'',safe:true,willDo:action.willDo||'',willNotDo:action.willNotDo||''}:null;
  };
  const sourceReceipt={
    crmContactId:identity.crmContactId||'',
    canonicalSource:identity.canonicalSource||'unresolved',
    identityResolution:dossier.identityResolution||{},
    linkedInUrl:firstText(identity.linkedinUrl,identity.linkedin_url,dossier.linkedinUrl,dossier.linkedin_url),
    linkedInLatestPosts:safeArray(dossier.linkedInLatestPosts||dossier.linkedinLatestPosts||dossier.linkedin_latest_posts).slice(0,3),
    observers:[
      {id:'ghl_crm',label:'GHL/CRM Contact',status:identity.crmContactId?'resolved':'required',sourceId:identity.crmContactId||''},
      {id:'linkedin',label:'LinkedIn Observer',status:firstText(identity.linkedinUrl,identity.linkedin_url,dossier.linkedinUrl,dossier.linkedin_url)?'available':'watching',sourceId:firstText(identity.linkedinUrl,identity.linkedin_url,dossier.linkedinUrl,dossier.linkedin_url)},
      {id:'apollo',label:'Apollo Observer',status:dossier.apollo||dossier.apolloStatus?'available':'watching',sourceId:firstText(dossier.apolloStatus,dossier.apollo?.status)},
      {id:'outscraper',label:'Outscraper Observer',status:dossier.outscraper||dossier.outscraperStatus?'available':'watching',sourceId:firstText(dossier.outscraperStatus,dossier.outscraper?.status)}
    ],
    sourceRefs
  };
  return {
    briefVersion:'VAL_PHASE_13C_RELATIONSHIP_BRIEF_V1',
    identity:{
      id:identity.id||dossier.id||'',
      crmContactId:identity.crmContactId||'',
      name:identity.name||'Relationship',
      photoUrl:identity.photoUrl||identity.photo_url||'',
      company:identity.company||'',
      role:identity.role||'',
      tags:safeArray(identity.tags).slice(0,8),
      status:identity.status||'Observed',
      lastInteraction:observation.lastObservedAt||''
    },
    currentReality:{
      summary:observation.summary||'VAL is still collecting relationship evidence.',
      activeConversations:normalizeList(dossier.activeConversations||dossier.active_conversations||observation.activeConversations,4),
      waitingOn:normalizeList(dossier.waitingOn||dossier.waiting_on||observation.waitingOn,4),
      openCommitments:normalizeList(observation.openLoops||dossier.openCommitments||dossier.open_commitments,4),
      recentMeetings:normalizeList(dossier.recentMeetings||dossier.recent_meetings,4),
      recentEmails:normalizeList(dossier.recentEmails||dossier.recent_emails,4),
      timeline:normalizeEvidence(observation.evidence||dossier.timeline,5)
    },
    executiveAssessment:normalizeList([
      interpretation.pattern,
      interpretation.momentum?`Momentum is ${interpretation.momentum}.`:'',
      safeArray(interpretation.relationshipSignals)[0],
      safeArray(interpretation.risks)[0],
      safeArray(interpretation.opportunities)[0]
    ],4),
    strategicImportance:{
      summary:meaning.whyItMatters||meaning.executiveValue||'VAL has not assigned strategic importance yet.',
      executiveValue:meaning.executiveValue||meaning.whyItMatters||''
    },
    executiveReminder:wisdom.oneThingToRemember||'Nothing should be compressed into a reminder until VAL has enough evidence.',
    observerNotes:observerNotes.slice(0,5),
    actions:{
      communicate:[actionRef('draft_message','Draft Email'),actionRef('draft_linkedin_comment','Draft LinkedIn Comment'),actionRef('draft_linkedin_dm','Draft LinkedIn DM')].filter(Boolean),
      plan:[actionRef('create_task','Create Task')].filter(Boolean),
      think:[actionRef('brainstorm','Brainstorm'),actionRef('ask_alignment','Ask VAL'),actionRef('review_linkedin_activity','Review LinkedIn'),actionRef('find_relationship_introductions','Find Introductions')].filter(Boolean),
      teach:[actionRef('mark_vip','Update Relationship'),actionRef('not_important','Correct Judgment'),actionRef('snooze','Protect Attention')].filter(Boolean)
    },
    sourceReceipts:sourceReceipt
  };
}
function canonicalCrmContactId(input={},contact={},profile={}){
  return firstText(input.crmContactId,input.crm_contact_id,input.contactId,input.contact_id,contact.contactId,profile.contactId,profile.crmContactId,contact.source==='ghl_contact'?contact.id:'');
}
function buildRelationshipDossier(input={}){
  const profile=input.profile||input.relationshipProfile||{};
  const contact=input.contact||input.person||input.attendee||{};
  const name=firstText(input.name,contact.name,contact.displayName,profile.displayName,profile.name,input.title,'Relationship');
  const email=firstText(input.email,contact.email,profile.email);
  const company=firstText(input.company,contact.company,contact.companyName,profile.company);
  const role=firstText(input.role,contact.role,contact.title,profile.role,profile.profileType==='person'?'Relationship':'');
  const openLoops=normalizeList(input.openLoops||input.open_loops||profile.openLoops||contact.openLoops,5);
  const risks=normalizeList(input.risks||input.riskSignals||profile.risks||contact.riskSignals,5);
  const opportunities=normalizeList(input.opportunities||input.opportunitySignals||profile.opportunities||contact.opportunitySignals,5);
  const signals=normalizeList(input.relationshipSignals||input.topics||profile.relationshipSignals||contact.topics,5);
  const evidence=normalizeEvidence(input.evidence||profile.evidence||contact.evidence,6);
  const summary=firstText(input.summary,input.reason_shown,input.reasonShown,input.reason,input.why,profile.summary,contact.summary,contact.reason);
  const recommendedAction=firstText(input.recommendedAction,input.nextBestMove,input.next_best_move,contact.recommendedAction,profile.recommendedAction);
  const observation=firstText(
    input.observation,
    evidence[0]?.summary,
    openLoops[0],
    opportunities[0],
    risks[0],
    summary,
    `${name} is present in VAL's relationship context.`
  );
  const pattern=firstText(
    input.patterns,
    input.pattern,
    signals[0],
    relationshipMomentum(input),
    profile.relationshipType,
    contact.relationshipType
  );
  const meaning=firstText(
    input.meaning,
    input.why_this_relationship_matters,
    input.whyThisRelationshipMatters,
    input.reason_it_matters,
    input.reasonItMatters,
    opportunities[0],
    risks[0],
    summary,
    `${name} may affect trust, momentum, commitment, or opportunity.`
  );
  const wisdom=firstText(input.wisdom,input.oneThingToRemember,input.one_thing_to_remember,buildWisdom({name,openLoops,risks,opportunities,summary,recommendedAction}));
  const confidence=Number(input.confidence ?? profile.confidence ?? contact.confidence ?? 0.6);
  const crmContactId=canonicalCrmContactId(input,contact,profile);
  const id=firstText(crmContactId,input.id,contact.id,profile.personId,profile.id,profile.profileKey,email,name.toLowerCase().replace(/\s+/g,'-'));
  const actions=relationshipDossierActions({id,name,email,recommendedAction});
  const sectionActions=relationshipDossierSectionActions({id,name});
  const dossier={
    id,
    dossierType:'relationship',
    relationshipCardVersion:'VAL_PHASE_13C_RELATIONSHIP_DOSSIER_V1',
    identity:{
      id,
      crmContactId,
      canonicalSource:crmContactId?'crm_ghl_contact':'unresolved',
      name,
      email,
      company,
      role,
      linkedinUrl:firstText(input.linkedinUrl,input.linkedin_url,contact.linkedinUrl,contact.linkedin_url,profile.linkedinUrl,profile.linkedin_url),
      photoUrl:firstText(input.photoUrl,input.photo_url,contact.photoUrl,contact.photo_url,profile.photoUrl,profile.photo_url),
      status:firstText(input.status,input.relationship_status,input.relationshipStatus,input.state,profile.state,contact.priority,'Observed'),
      tags:safeArray(input.tags||contact.tags||profile.tags).map(tag=>compactText(tag,40)).filter(Boolean).slice(0,8)
    },
    identityResolution:{
      status:crmContactId?'resolved':'unresolved',
      canonicalKey:crmContactId?`crm:${crmContactId}`:(email?`email:${email}`:`name:${name.toLowerCase().replace(/\s+/g,' ')}`),
      crmContactId,
      rule:'Canonical Relationship Dossiers should be organized by CRM/GHL contact ID before transcripts, calendar, or memory are merged.'
    },
    observation:{
      summary:observation,
      evidence,
      openLoops,
      lastObservedAt:input.lastObservedAt||input.lastObserved_at||profile.lastObservedAt||contact.lastInteractionAt||contact.lastInteraction||''
    },
    interpretation:{
      pattern,
      momentum:relationshipMomentum({...input,openLoops,risks,opportunities}),
      risks,
      opportunities,
      relationshipSignals:signals
    },
    meaning:{
      whyItMatters:meaning,
      executiveValue:firstText(input.executiveValue,input.executive_value,recommendedAction,meaning)
    },
    wisdom:{
      oneThingToRemember:wisdom,
      recommendedPosture:firstText(input.recommendedPosture,input.recommended_posture,risks.length?'Careful':opportunities.length?'Open':openLoops.length?'Clear':'Present')
    },
    actions:{
      primary:recommendedAction||'Review relationship file',
      safeActions:safeArray(input.safeActions||input.actions).map(action=>typeof action==='string'?action:action?.label).filter(Boolean).slice(0,8),
      items:actions,
      sections:sectionActions
    },
    confidence:Number.isFinite(confidence)?Math.max(0,Math.min(1,confidence)):0.6,
    sourceRefs:safeArray(input.sourceRefs||input.source_refs||profile.sourceRefs||contact.sourceRefs).slice(0,10),
    linkedInLatestPosts:safeArray(input.linkedInLatestPosts||input.linkedinLatestPosts||input.linkedin_latest_posts||profile.linkedInLatestPosts||profile.linkedinLatestPosts||contact.linkedInLatestPosts||contact.linkedinLatestPosts).slice(0,3),
    apolloStatus:firstText(input.apolloStatus,input.apollo_status,profile.apolloStatus,contact.apolloStatus),
    outscraperStatus:firstText(input.outscraperStatus,input.outscraper_status,profile.outscraperStatus,contact.outscraperStatus)
  };
  dossier.card={
    title:name,
    observation:dossier.observation.summary,
    implication:dossier.meaning.whyItMatters,
    invitation:dossier.actions.primary,
    wisdom:dossier.wisdom.oneThingToRemember
  };
  dossier.relationshipBrief=relationshipBriefFromDossier(dossier);
  return dossier;
}
function relationshipDossierPromptContext(dossier={}){
  if(!dossier?.identity?.name)return '';
  const lines=[
    `Relationship Dossier: ${dossier.identity.name}`,
    dossier.identity.company?`Identity: ${[dossier.identity.role,dossier.identity.company].filter(Boolean).join(' at ')}`:'',
    dossier.observation?.summary?`Evidence: ${dossier.observation.summary}`:'',
    dossier.interpretation?.pattern?`Pattern: ${dossier.interpretation.pattern}`:'',
    dossier.meaning?.whyItMatters?`Meaning: ${dossier.meaning.whyItMatters}`:'',
    dossier.wisdom?.oneThingToRemember?`Wisdom: ${dossier.wisdom.oneThingToRemember}`:'',
    dossier.actions?.primary?`Action posture: ${dossier.actions.primary}`:''
  ].filter(Boolean);
  return lines.join('\n');
}

module.exports={buildRelationshipDossier,relationshipDossierPromptContext,relationshipDossierActions,relationshipDossierSectionActions,relationshipBriefFromDossier};
