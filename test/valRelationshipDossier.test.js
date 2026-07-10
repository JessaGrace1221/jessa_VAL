const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {buildRelationshipDossier,relationshipDossierPromptContext,relationshipDossierActions,relationshipDossierSectionActions,relationshipBriefFromDossier,buildRelationshipUnderstanding}=require('../services/valRelationshipDossier');

const root=path.join(__dirname,'..');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
const commandCenter=fs.readFileSync(path.join(root,'command-center.js'),'utf8');

test('relationship dossier preserves the VAL Insight Pyramid contract',()=>{
  const dossier=buildRelationshipDossier({
    contact:{id:'crm_aric',contactId:'crm_aric',name:'Aric Soyring',email:'aric@example.com',company:'Acme Ventures'},
    openLoops:['Proposal review is waiting.'],
    opportunities:['Aric can open two partner paths.'],
    risks:['Do not make the follow-up feel urgent.'],
    evidence:[{type:'transcript',summary:'Aric accepted the Frisson consulting direction.',confidence:'high'}],
    summary:'Aric creates momentum where the user creates systems.',
    recommendedAction:'Protect this relationship before asking for more.',
    confidence:0.88
  });
  assert.equal(dossier.relationshipCardVersion,'VAL_PHASE_13C_RELATIONSHIP_DOSSIER_V1');
  assert.equal(dossier.relationshipBrief.briefVersion,'VAL_PHASE_13C_RELATIONSHIP_BRIEF_V1');
  assert.equal(dossier.identity.name,'Aric Soyring');
  assert.equal(dossier.identity.crmContactId,'crm_aric');
  assert.equal(dossier.identity.canonicalSource,'crm_ghl_contact');
  assert.equal(dossier.identityResolution.status,'resolved');
  assert.equal(dossier.identityResolution.canonicalKey,'crm:crm_aric');
  assert.match(dossier.observation.summary,/Aric accepted|Proposal review/);
  assert.match(dossier.interpretation.pattern,/Needs care|Open loop|Growing|Opportunity|Observed/);
  assert.match(dossier.meaning.whyItMatters,/partner paths|Aric creates momentum|Do not make/);
  assert.match(dossier.wisdom.oneThingToRemember,/Protect this relationship|Do not make/);
  assert.equal(dossier.card.title,'Aric Soyring');
  assert.ok(dossier.card.wisdom);
  assert.equal(dossier.relationshipBrief.identity.crmContactId,'crm_aric');
  assert.match(dossier.relationshipBrief.currentReality.summary,/Aric accepted|Proposal review/);
  assert.ok(dossier.relationshipBrief.executiveAssessment.length);
  assert.match(dossier.relationshipBrief.strategicImportance.summary,/partner paths|Aric creates momentum|Do not make/);
  assert.match(dossier.relationshipBrief.executiveReminder,/Protect this relationship|Do not make/);
  assert.ok(dossier.relationshipBrief.observerNotes.some(note=>/Observer/.test(note.observer)));
  assert.ok(dossier.relationshipBrief.actions.communicate.some(action=>action.id==='draft_message'&&action.safe));
  assert.ok(dossier.relationshipBrief.actions.communicate.some(action=>action.id==='draft_linkedin_comment'&&action.safe));
  assert.ok(dossier.relationshipBrief.actions.communicate.some(action=>action.id==='draft_linkedin_dm'&&action.safe));
  assert.ok(dossier.relationshipBrief.actions.plan.some(action=>action.id==='create_task'&&action.safe));
  assert.ok(dossier.relationshipBrief.actions.think.some(action=>action.id==='brainstorm'||action.id==='ask_alignment'));
  assert.ok(dossier.relationshipBrief.actions.think.some(action=>action.id==='review_linkedin_activity'));
  assert.ok(dossier.relationshipBrief.actions.think.some(action=>action.id==='find_relationship_introductions'));
  assert.ok(dossier.relationshipBrief.actions.teach.some(action=>action.id==='mark_vip'||action.id==='not_important'||action.id==='snooze'));
  assert.ok(dossier.relationshipBrief.sourceReceipts.observers.some(observer=>observer.label==='CRM Contact'&&observer.status==='resolved'));
  assert.ok(dossier.relationshipBrief.sourceReceipts.observers.some(observer=>observer.label==='LinkedIn Observer'));
  assert.ok(dossier.relationshipBrief.sourceReceipts.observers.some(observer=>observer.label==='Apollo Observer'));
  assert.ok(dossier.relationshipBrief.sourceReceipts.observers.some(observer=>observer.label==='Outscraper Observer'));
  assert.ok(dossier.actions.items.some(action=>action.id==='open_full_file'&&action.type==='route'));
  assert.equal(dossier.relationshipUnderstanding.display_name,'Aric Soyring');
  assert.match(dossier.relationshipUnderstanding.thirty_second_truth,/Proposal review|partner paths|Aric/);
  assert.ok(Array.isArray(dossier.relationshipUnderstanding.what_changed));
  assert.ok(Array.isArray(dossier.relationshipUnderstanding.open_loops));
  assert.ok(dossier.relationshipUnderstanding.stewardship.responsibility);
  assert.ok(dossier.actions.items.some(action=>action.id==='draft_message'&&action.endpoint==='/api/relationships/actions'));
  assert.ok(dossier.actions.sections.evidence.some(action=>action.id==='open_evidence'));
  assert.ok(dossier.actions.sections.meaning.some(action=>action.id==='ask_why_matters'));
  assert.ok(dossier.actions.sections.wisdom.some(action=>action.id==='teach_wisdom'));
  assert.ok(dossier.actions.items.every(action=>Array.isArray(action.observerScope)&&action.observerScope.includes('hearth')&&action.observerScope.includes('meeting_prep')&&action.observerScope.includes('chat')));
});

test('relationship understanding turns evidence into actionable open-loop judgment',()=>{
  const dossier=buildRelationshipDossier({
    contact:{id:'mark',name:'Mark Biermann',email:'mark@goallprogram.com'},
    openLoops:['Connect with Mike to talk about the dashboard before the next GOALL update.'],
    evidence:[
      {type:'transcript',title:'GOALL',summary:'Mark, Jessa, and Mike discussed the dashboard path and who should own the next step.'},
      {type:'email',title:'AI Call Recap',summary:'Forwarded context about GOALL and dashboard visibility.'}
    ],
    summary:'GOALL relationship context is active.',
    confidence:0.74
  });
  const understanding=buildRelationshipUnderstanding(dossier);
  assert.match(understanding.thirty_second_truth,/Mark Biermann/);
  assert.match(understanding.thirty_second_truth,/Mike|dashboard/);
  assert.match(understanding.what_changed.join(' '),/Mike|dashboard/);
  assert.match(understanding.stewardship.responsibility,/Mike|dashboard/);
  assert.match(understanding.living_narrative,/close the named open loop/i);
  assert.doesNotMatch(understanding.thirty_second_truth,/Recent context exists/i);
  assert.doesNotMatch(understanding.who_they_are_becoming_in_the_users_world,/Open loop Momentum/i);
});

test('relationship brief contract can be rebuilt from any canonical dossier',()=>{
  const dossier=buildRelationshipDossier({
    contact:{id:'crm_greg',contactId:'crm_greg',name:'Greg Niesen',company:'Northstar'},
    openLoops:['Introduction follow-up is waiting.'],
    opportunities:['Greg may need a partner introduction.'],
    linkedinUrl:'https://linkedin.com/in/greg-demo',
    apolloStatus:'matched likely decision-maker',
    outscraperStatus:'profile activity available'
  });
  const brief=relationshipBriefFromDossier(dossier);
  assert.equal(brief.briefVersion,'VAL_PHASE_13C_RELATIONSHIP_BRIEF_V1');
  assert.equal(brief.identity.crmContactId,'crm_greg');
  assert.match(brief.currentReality.summary,/Introduction follow-up|Greg may need/);
  assert.ok(Array.isArray(brief.executiveAssessment));
  assert.ok(brief.observerNotes.some(note=>note.observer==='Opportunity Observer'));
  assert.ok(brief.sourceReceipts.observers.find(observer=>observer.label==='LinkedIn Observer').status==='available');
  assert.ok(brief.sourceReceipts.observers.find(observer=>observer.label==='Apollo Observer').status==='available');
  assert.ok(brief.sourceReceipts.observers.find(observer=>observer.label==='Outscraper Observer').status==='available');
});

test('relationship dossier actions are shared safe commands for all observers',()=>{
  const actions=relationshipDossierActions({id:'crm_aric',name:'Aric Soyring',email:'aric@example.com',recommendedAction:'Protect the relationship.'});
  for(const id of ['open_full_file','ask_alignment','draft_message','draft_linkedin_comment','draft_linkedin_dm','create_task','brainstorm','review_linkedin_activity','find_relationship_introductions','refresh_relationship_observers','mark_vip','snooze','not_important']){
    assert.ok(actions.find(action=>action.id===id), id);
  }
  assert.equal(actions.find(action=>action.id==='draft_message').willNotDo,'Nothing will be sent.');
  assert.match(actions.find(action=>action.id==='draft_linkedin_comment').willNotDo,/will not post, comment, message, scrape live data, or change CRM/);
  assert.match(actions.find(action=>action.id==='draft_linkedin_dm').willNotDo,/will not send, post, comment, message, scrape live data, or change CRM/);
  assert.match(actions.find(action=>action.id==='review_linkedin_activity').willNotDo,/will not post, comment, message, scrape live data, or change CRM/);
  assert.match(actions.find(action=>action.id==='find_relationship_introductions').willNotDo,/will not send introductions, expose contacts, create calendar events, scrape live data, or change CRM/);
  assert.match(actions.find(action=>action.id==='refresh_relationship_observers').willNotDo,/will not import, overwrite, post, message, or change CRM/);
  assert.match(actions.find(action=>action.id==='create_task').willNotDo,/will not invite anyone/);
  assert.ok(actions.every(action=>action.observerScope.includes('dashboard')));
});

test('relationship dossier section actions are scoped to the card sections',()=>{
  const sections=relationshipDossierSectionActions({id:'crm_aric',name:'Aric Soyring'});
  assert.ok(sections.identity.find(action=>action.id==='open_full_file'));
  assert.ok(sections.evidence.find(action=>action.id==='open_evidence'));
  assert.ok(sections.evidence.find(action=>action.id==='create_task_from_loop'));
  assert.ok(sections.patterns.find(action=>action.id==='ask_about_pattern'&&/Aric Soyring/.test(action.prompt)));
  assert.ok(sections.meaning.find(action=>action.id==='ask_why_matters'));
  assert.ok(sections.wisdom.find(action=>action.id==='teach_wisdom'));
  assert.ok(Object.values(sections).flat().every(action=>action.observerScope.includes('dashboard')&&action.section));
});

test('relationship dossier prompt context gives chat the same relationship card',()=>{
  const dossier=buildRelationshipDossier({
    name:'Greg Niesen',
    observation:'Greg answered the question that was holding the proposal.',
    meaning:'The proposal can now move forward without taking over the whole day.',
    wisdom:'Do not let silence become ambiguity.',
    recommendedAction:'Open the proposal.'
  });
  const context=relationshipDossierPromptContext(dossier);
  assert.match(context,/Relationship Dossier: Greg Niesen/);
  assert.match(context,/Evidence: Greg answered/);
  assert.match(context,/Meaning: The proposal can now move forward/);
  assert.match(context,/Wisdom: Do not let silence become ambiguity/);
});

test('VAL surfaces are wired to read relationship dossiers when needed',()=>{
  assert.match(server,/buildRelationshipDossier/);
  assert.match(server,/relationshipDossierPromptContext/);
  assert.match(server,/app\.get\('\/api\/relationships\/index'/);
  assert.match(server,/relationshipIndexItemFromProfile/);
  assert.match(server,/relationshipIndexState/);
  assert.match(server,/RELATIONSHIP_INDEX_TEMPERATURE_MODEL/);
  assert.match(server,/function relationshipIndexTemperatureContract/);
  assert.match(server,/function relationshipIndexTemperatureEvidence/);
  assert.match(server,/function relationshipIndexStateFromEvidence/);
  assert.match(server,/function relationshipIndexTemperatureConflict/);
  assert.match(server,/status:'review_recommended'/);
  assert.match(server,/return relationshipIndexStateFromEvidence\(relationshipIndexTemperatureEvidence\(profile\)\)/);
  assert.match(server,/temperatureMeaning:temperatureContract\.meaning/);
  assert.match(server,/temperatureObservers:temperatureContract\.observers/);
  assert.match(server,/temperatureScoreRange:temperatureContract\.scoreRange/);
  assert.match(server,/temperatureEvidence/);
  assert.match(server,/temperatureConflict/);
  assert.match(server,/state,observer,signal,weight,summary/);
  assert.match(server,/if\(!signal\|\|!summary\)return/);
  assert.match(server,/query:\{name,email,targetId:id,contactId\}/);
  assert.match(server,/profileKeyEmail/);
  assert.match(server,/profiles\.map\(relationshipIndexItemFromProfile\)/);
  assert.match(server,/app\.get\('\/api\/relationships\/dossier'/);
  assert.match(server,/function relationshipDossierInputFromQuery/);
  assert.match(server,/const targetLooksLikeProfileKey=\/@\/\.test\(targetId\)/);
  assert.match(server,/contactId:explicitContactId \|\| \(targetId && !targetLooksLikeProfileKey \? targetId : ''\)/);
  assert.match(server,/resolvedCrmContactId/);
  assert.match(server,/relationship_dossier_review_only/);
  assert.match(server,/Relationship context is review-only until the CRM identity is linked/);
  assert.match(server,/buildRelationshipContextTimeline\(reviewContact,50\)/);
  assert.match(server,/buildRelationshipContextTimeline\(contact,50\)/);
  assert.match(server,/matchingTranscriptContext\(event,3\)/);
  assert.match(server,/gmailRelationshipContextQuery/);
  assert.match(server,/from:\$\{email\} OR to:\$\{email\} OR cc:\$\{email\}/);
  assert.match(server,/function canonicalRelationshipDossierForEntity/);
  assert.match(server,/relationshipDossier:canonicalRelationshipDossierForEntity\(p\)/);
  assert.match(server,/action==='open_evidence'/);
  assert.match(server,/action==='ask_about_pattern'\|\|action==='ask_why_matters'/);
  assert.match(server,/action==='teach_wisdom'/);
  assert.match(server,/action==='review_linkedin_activity'/);
  assert.match(server,/action==='draft_linkedin_comment'/);
  assert.match(server,/action==='draft_linkedin_dm'/);
  assert.match(server,/action==='refresh_relationship_observers'/);
  assert.match(server,/action==='find_relationship_introductions'/);
  assert.match(server,/action==='draft_intro_candidate'/);
  assert.match(server,/status:'linkedin_comment_drafted'/);
  assert.match(server,/status:'linkedin_dm_drafted'/);
  assert.match(server,/status:'linkedin_activity_ready'/);
  assert.match(server,/status:'observer_refresh_preview'/);
  assert.match(server,/status:'relationship_introductions_ready'/);
  assert.match(server,/status:'introduction_draft_created'/);
  assert.match(server,/draftType:prepared\.draftType/);
  assert.match(server,/whoNeedsThisPerson/);
  assert.match(server,/whoThisPersonNeeds/);
  assert.match(server,/relationshipIntroReviewSurface/);
  assert.match(server,/reviewSurface/);
  assert.match(server,/const effectiveAction=action==='create_task_from_loop'\?'create_task':action/);
  assert.match(server,/status:'teach_val_review_required'/);
  assert.match(server,/noExternalAction:true/);
  assert.match(server,/Relationship Dossiers:\\n/);
  assert.match(commandCenter,/function relationshipDossierHtml/);
  assert.match(commandCenter,/function relationshipBriefFromDossier/);
  assert.match(commandCenter,/window\.relationshipDossierAction=function/);
  assert.match(commandCenter,/relationshipDossierActionRegistry/);
  assert.match(commandCenter,/sectionButtons\(section\)/);
  assert.match(commandCenter,/relationship-section-actions/);
  assert.match(commandCenter,/allSectionActions/);
  assert.match(commandCenter,/contactId:identity\.crmContactId\|\|identity\.id/);
  assert.match(commandCenter,/create_task_from_loop/);
  assert.match(commandCenter,/action\.id==='ask_about_pattern'\|\|action\.id==='ask_why_matters'/);
  assert.match(commandCenter,/teach_wisdom/);
  assert.match(commandCenter,/apiFetch\(\(window\.PROXY\|\|''\)\+\(action\.endpoint\|\|'\/api\/relationships\/actions'\)/);
  assert.match(commandCenter,/item\.relationshipDossier\|\|item\.relationship_dossier/);
  assert.match(commandCenter,/<h3>Relationship Brief<\/h3>/);
  assert.match(commandCenter,/<h3>Current Reality<\/h3>/);
  assert.match(commandCenter,/<h3>Executive Assessment<\/h3>/);
  assert.match(commandCenter,/<h3>Strategic Importance<\/h3>/);
  assert.match(commandCenter,/<h3>Executive Reminder<\/h3>/);
  assert.match(commandCenter,/<h3>Observer Notes<\/h3>/);
  assert.match(commandCenter,/<h3>Executive Actions<\/h3>/);
  assert.match(commandCenter,/CRM contact ID/);
  assert.match(commandCenter,/LinkedIn Signal/);
  assert.match(commandCenter,/Source Receipts/);
  assert.match(commandCenter,/Review LinkedIn activity/);
  assert.match(commandCenter,/Refresh observers/);
  assert.match(commandCenter,/review_linkedin_activity/);
  assert.match(commandCenter,/Introduction leverage ready/);
  assert.match(commandCenter,/introReviewHtml/);
  assert.match(commandCenter,/relationshipIntroCandidateRegistry/);
  assert.match(commandCenter,/candidate:introCandidate/);
  assert.match(commandCenter,/intro-review-surface/);
  assert.match(commandCenter,/Draft intro for review/);
  assert.match(commandCenter,/Who needs this person/);
  assert.match(commandCenter,/Who this person needs/);
  assert.match(commandCenter,/refresh_relationship_observers/);
  assert.match(commandCenter,/linkedInLatestPosts/);
  assert.match(commandCenter,/relationship-receipt-grid/);
  assert.match(commandCenter,/relationship-action-group/);
  assert.match(commandCenter,/Communicate/);
  assert.match(commandCenter,/Plan/);
  assert.match(commandCenter,/Think/);
  assert.match(commandCenter,/Teach/);
  assert.match(commandCenter,/LinkedIn Observer/);
  assert.match(commandCenter,/Apollo Observer/);
  assert.match(commandCenter,/Outscraper Observer/);
});
