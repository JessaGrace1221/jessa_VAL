const test=require('node:test');
const assert=require('node:assert/strict');
const {relationshipIntroCandidates,contactId,introductionDirection,relationshipStewardshipReviewSurface,relationshipIntroDraft,personPacketFromContact,contactFromPersonPacket,relationshipAdmissionDecision,sourceToPersonEvidenceBindings}=require('../services/valRelationshipActionIntelligence');

test('relationship action intelligence requires canonical CRM contact identity',()=>{
  assert.equal(contactId({id:'local_1',name:'Local Person'}),'');
  assert.equal(contactId({id:'crm_1',source:'ghl_contact',name:'CRM Person'}),'crm_1');
  assert.equal(contactId({contactId:'person:email:raw@example.com',name:'Raw Email Person'}),'');
  assert.equal(contactId({contactId:'email:raw@example.com',name:'Raw Email Person'}),'');
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
  assert.equal(candidate.personPackets.current.packet_type,'person_packet');
  assert.equal(candidate.personPackets.candidate.packet_type,'person_packet');
  assert.equal(candidate.stewardshipMovePacket.packet_type,'stewardship_move_packet');
  assert.equal(candidate.stewardshipMovePacket.stewardship_type,'introduction');
  assert.equal(candidate.stewardshipMovePacket.recommended_move.status,'ready_for_review');
  assert.equal(candidate.stewardshipMatchPacket.packet_type,'stewardship_match_packet');
  assert.equal(candidate.stewardshipMatchPacket.stewardship_move_packet.packet_type,'stewardship_move_packet');
  assert.equal(candidate.stewardshipMatchPacket.no_external_action,true);
  assert.equal(candidate.direction.whoNeedsThisPerson>0,true);
  assert.equal(candidate.direction.whoThisPersonNeeds>0,true);
  assert.match(candidate.whatWillNotHappen,/will not send/);
  assert.match(candidate.draft.subject,/Introduction/);
});

test('person packets preserve who they are, needs, offers, evidence, and developing state',()=>{
  const packet=personPacketFromContact({
    name:'New Relationship',
    email:'new@example.com',
    firstMeaningfulSignal:'CCd into the Frisson partner conversation.',
    evidence:[{type:'cc_email',messageId:'m_1',subject:'Partner intro',summary:'New Relationship was copied on the partner conversation.'}]
  },{updatedAt:'2026-07-11T00:00:00.000Z'});
  assert.equal(packet.packet_type,'person_packet');
  assert.equal(packet.person.identity_status,'needs_review');
  assert.equal(packet.who_this_person_is.summary,'New Relationship');
  assert.equal(packet.relationship_origin.first_meaningful_signal,'CCd into the Frisson partner conversation.');
  assert.equal(packet.evidence.cc_receipts.length,1);
  assert.equal(packet.relationship_admission.admission_status,'admitted');
  assert.equal(packet.packet_state.maturity,'developing');
  assert.equal(packet.executive_visibility.visibility,'people_to_watch');
  assert.ok(packet.packet_state.needs_review);
  assert.ok(packet.packet_state.missing_variables.includes('crm_contact_id'));
  assert.equal(packet.packet_state.can_evaluate_moves,false);
});

test('relationship matching can consume person packets directly',()=>{
  const currentPacket=personPacketFromContact({
    contactId:'crm_current',
    name:'Current Person',
    offers:['operator systems'],
    needs:['foundation access'],
    evidence:[{type:'gmail_email',messageId:'m_current',summary:'Current Person can help with operator systems.'}]
  });
  const candidatePacket=personPacketFromContact({
    contactId:'crm_candidate',
    name:'Candidate Person',
    offers:['foundation access'],
    needs:['operator systems'],
    evidence:[{type:'sent_email',messageId:'m_candidate',summary:'Candidate Person is looking for operator systems.'}]
  });
  const result=relationshipIntroCandidates({currentContact:currentPacket,crmContacts:[candidatePacket]});
  assert.equal(result.candidates.length,1);
  const candidate=result.candidates[0];
  assert.equal(candidate.personA.contactId,'crm_current');
  assert.equal(candidate.personB.contactId,'crm_candidate');
  assert.equal(candidate.stewardshipMatchPacket.focus_person_packet_id,currentPacket.packet_id);
  assert.deepEqual(candidate.stewardshipMatchPacket.compared_person_packet_ids,[candidatePacket.packet_id]);
  assert.ok(candidate.stewardshipMatchPacket.people_who_need_them.length);
  assert.ok(candidate.stewardshipMatchPacket.people_they_should_meet.length);
  const backToContact=contactFromPersonPacket(currentPacket);
  assert.equal(backToContact.contactId,'crm_current');
  assert.deepEqual(backToContact.needs,['foundation access']);
  assert.deepEqual(backToContact.offers,['operator systems']);
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

test('relationship stewardship review surface preserves two directions and approval boundary',()=>{
  const intro=relationshipIntroCandidates({
    currentContact:{contactId:'crm_aric',name:'Aric',offers:['operator systems'],needs:['foundation access']},
    crmContacts:[{contactId:'crm_foundation',name:'HopeMakers',needs:['operator systems'],offers:['foundation access']}]
  });
  const surface=relationshipStewardshipReviewSurface({
    currentContact:{contactId:'crm_aric',name:'Aric'},
    whoNeedsThisPerson:intro.candidates,
    whoThisPersonNeeds:intro.candidates,
    candidates:intro.candidates
  });
  assert.equal(surface.kind,'relationship_stewardship_review');
  assert.match(surface.summary,/Introductions are only one possible move/);
  assert.equal(surface.sections.length,2);
  assert.equal(surface.sections[0].id,'who_needs_this_person');
  assert.equal(surface.sections[1].id,'who_this_person_needs');
  assert.ok(surface.sections[0].cards[0].nextActions.some(action=>action.id==='draft_intro_candidate'&&action.requiresApproval));
  assert.match(surface.boundary,/will not send messages, make introductions/);
  assert.equal(surface.noExternalAction,true);
});

test('relationship introduction draft requires both CRM contact IDs and stays internal',()=>{
  const missing=relationshipIntroDraft({personA:{name:'Aric',contactId:'crm_aric'},personB:{name:'Greg'}});
  assert.equal(missing.ok,false);
  assert.match(missing.error,/Both CRM contact IDs are required/);
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

test('relationship admission rejects one-way cold inbound and generic senders',()=>{
  const cold=relationshipAdmissionDecision({
    name:'Sales Bot',
    email:'sales@example.com',
    evidence:[{type:'gmail_email',summary:'Cold outreach marketing sequence. We can help with SEO.'}]
  });
  assert.equal(cold.admission_status,'rejected');
  assert.ok(cold.rejection_signals.includes('non_relationship_source'));
  const generic=relationshipAdmissionDecision({
    name:'Notifications',
    email:'notifications@example.com',
    evidence:[{type:'gmail_email',summary:'System-generated notification.'}]
  });
  assert.equal(generic.admission_status,'rejected');
  assert.ok(generic.rejection_signals.includes('generic_mailbox'));
});

test('relationship admission accepts user intent before reciprocity',()=>{
  const sent=personPacketFromContact({
    contactId:'crm_new',
    name:'New Real Person',
    email:'new@example.com',
    evidence:[{type:'sent_email',summary:'Jessa sent a direct email about a partnership next step.'}]
  });
  assert.equal(sent.relationship_admission.admission_status,'admitted');
  assert.equal(sent.packet_state.maturity,'developing');
  assert.equal(sent.executive_visibility.visibility,'people_to_watch');
  const taught=personPacketFromContact({
    name:'Taught Person',
    email:'taught@example.com',
    knownIdentity:true,
    userTeaching:true,
    evidence:[{type:'user_teaching',summary:'Jessa taught VAL that this person matters for the support circle.'}]
  });
  assert.equal(taught.relationship_admission.admission_status,'admitted');
  assert.ok(taught.relationship_admission.relationship_signals.includes('user_teaching'));
});

test('meaningful evidence with unsafe identity becomes blocked and cannot match',()=>{
  const blocked=personPacketFromContact({
    name:'mike',
    evidence:[{type:'transcript',summary:'Jessa promised to introduce Mike to Kareemah, but this transcript does not safely identify which Mike.'}]
  });
  assert.equal(blocked.relationship_admission.admission_status,'blocked_by_identity');
  assert.equal(blocked.packet_maturity.maturity,'blocked_by_identity');
  assert.equal(blocked.executive_visibility.visibility,'identity_review');
  const result=relationshipIntroCandidates({
    currentContact:blocked,
    crmContacts:[{contactId:'crm_kareemah',name:'Kareemah Bass',offers:['support circle guidance'],needs:['mission aligned introductions'],evidence:[{type:'sent_email',summary:'Kareemah offers support circle guidance.'}]}]
  });
  assert.deepEqual(result.candidates,[]);
  assert.ok(result.unknowns.includes('current_relationship_not_admitted')||result.unknowns.includes('current_identity_blocked')||result.unknowns.includes('current_contact_id_unresolved'));
});

test('source-to-person evidence binding prevents cross-person inheritance',()=>{
  const michele=personPacketFromContact({
    contactId:'crm_michele',
    name:'Michele Julian',
    evidence:[{type:'transcript',summary:'Mike Nonhof should review the projection spreadsheet before Friday.'}]
  });
  assert.equal(michele.evidence_bindings[0].review_required,true);
  assert.equal(michele.packet_state.can_evaluate_moves,false);
  assert.notEqual(michele.packet_maturity.maturity,'usable');
  const mike=personPacketFromContact({
    contactId:'crm_mike',
    name:'Mike Nonhof',
    evidence:[{type:'transcript',summary:'Mike Nonhof should review the projection spreadsheet before Friday.',supportsPersonIds:['crm_mike'],supportsClaims:['Mike owns the projection spreadsheet review.'],resolutionMethod:'user_confirmed'}],
    openLoops:['Review projection spreadsheet before Friday']
  });
  assert.equal(mike.evidence_bindings[0].review_required,false);
  assert.equal(mike.packet_state.can_evaluate_moves,true);
});

test('public enrichment alone cannot mature a person packet beyond thin',()=>{
  const packet=personPacketFromContact({
    contactId:'crm_public',
    name:'Public Person',
    evidence:[{type:'apollo_public_enrichment',summary:'Public profile says this person works in real estate.',supportsPersonIds:['crm_public']}],
    offers:['real estate contacts']
  });
  assert.equal(packet.relationship_admission.admission_status,'admitted');
  assert.equal(packet.packet_maturity.maturity,'thin');
  assert.equal(packet.packet_state.can_evaluate_moves,false);
});
