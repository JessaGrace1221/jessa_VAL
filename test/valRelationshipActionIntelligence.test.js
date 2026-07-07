const test=require('node:test');
const assert=require('node:assert/strict');
const {relationshipIntroCandidates,contactId,introductionDirection,relationshipIntroReviewSurface,relationshipIntroDraft}=require('../services/valRelationshipActionIntelligence');

test('relationship action intelligence requires canonical CRM contact identity',()=>{
  assert.equal(contactId({id:'local_1',name:'Local Person'}),'');
  assert.equal(contactId({id:'crm_1',source:'ghl_contact',name:'GHL Person'}),'crm_1');
  const result=relationshipIntroCandidates({
    currentContact:{name:'Aric',email:'aric@example.com'},
    crmContacts:[{contactId:'crm_greg',name:'Greg',needs:['strategic partner']}]
  });
  assert.deepEqual(result.candidates,[]);
  assert.ok(result.unknowns.includes('current_contact_id_unresolved'));
  assert.equal(result.noExternalAction,true);
});

test('relationship action intelligence drafts review-only intro candidates between CRM contacts',()=>{
  const result=relationshipIntroCandidates({
    currentContact:{
      contactId:'crm_aric',
      name:'Aric Soyring',
      email:'aric@example.com',
      offers:['strategic partnership', 'turn ideas into momentum'],
      needs:['mission aligned organizations']
    },
    crmContacts:[
      {contactId:'crm_greg',name:'Greg Niesen',email:'greg@example.com',needs:['strategic partnership'],offers:['mission aligned organizations']},
      {name:'Unresolved Person',needs:['strategic partnership']}
    ]
  });
  assert.equal(result.ok,true);
  assert.equal(result.candidates.length,1);
  const candidate=result.candidates[0];
  assert.equal(candidate.personA.contactId,'crm_aric');
  assert.equal(candidate.personB.contactId,'crm_greg');
  assert.equal(candidate.requiresApproval,true);
  assert.equal(candidate.noExternalAction,true);
  assert.equal(candidate.direction.whoNeedsThisPerson>0,true);
  assert.equal(candidate.direction.whoThisPersonNeeds>0,true);
  assert.match(candidate.whatWillNotHappen,/will not send/);
  assert.match(candidate.draft.subject,/Introduction/);
});

test('relationship introduction direction separates who needs this person from who this person needs',()=>{
  const direction=introductionDirection(
    {needs:['foundation introductions'],offers:['operational systems']},
    {needs:['operational systems'],offers:['foundation introductions']}
  );
  assert.ok(direction.whoNeedsThisPerson>0);
  assert.ok(direction.whoThisPersonNeeds>0);
  assert.match(direction.primary,/who_needs_this_person|who_this_person_needs/);
});

test('relationship introduction review surface preserves two directions and approval boundary',()=>{
  const intro=relationshipIntroCandidates({
    currentContact:{contactId:'crm_aric',name:'Aric',offers:['operator systems'],needs:['foundation access']},
    crmContacts:[{contactId:'crm_foundation',name:'HopeMakers',needs:['operator systems'],offers:['foundation access']}]
  });
  const surface=relationshipIntroReviewSurface({
    currentContact:{contactId:'crm_aric',name:'Aric'},
    whoNeedsThisPerson:intro.candidates,
    whoThisPersonNeeds:intro.candidates,
    candidates:intro.candidates
  });
  assert.equal(surface.kind,'relationship_introduction_review');
  assert.equal(surface.sections.length,2);
  assert.equal(surface.sections[0].id,'who_needs_this_person');
  assert.equal(surface.sections[1].id,'who_this_person_needs');
  assert.ok(surface.sections[0].cards[0].nextActions.some(action=>action.id==='draft_intro_candidate'&&action.requiresApproval));
  assert.match(surface.boundary,/will not send an introduction/);
  assert.equal(surface.noExternalAction,true);
});

test('relationship introduction draft requires both CRM contact IDs and stays internal',()=>{
  const missing=relationshipIntroDraft({personA:{name:'Aric',contactId:'crm_aric'},personB:{name:'Greg'}});
  assert.equal(missing.ok,false);
  assert.match(missing.error,/Both CRM\/GHL contact IDs are required/);
  const draft=relationshipIntroDraft({
    id:'intro_crm_aric_crm_greg',
    personA:{name:'Aric Soyring',contactId:'crm_aric',email:'aric@example.com'},
    personB:{name:'Greg Niesen',contactId:'crm_greg',email:'greg@example.com'},
    whyThisMayMatter:'Greg can help Aric move the proposal forward with less ambiguity.',
    confidence:0.78
  });
  assert.equal(draft.ok,true);
  assert.equal(draft.draftType,'introduction_email_draft');
  assert.equal(draft.provider,'internal');
  assert.equal(draft.sourceContext.contactIds.personA,'crm_aric');
  assert.equal(draft.sourceContext.contactIds.personB,'crm_greg');
  assert.equal(draft.sourceContext.externalSend,false);
  assert.equal(draft.sourceContext.noExternalAction,true);
  assert.match(draft.body,/No pressure/);
});
