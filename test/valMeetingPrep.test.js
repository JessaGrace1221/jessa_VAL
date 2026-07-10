const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {VAL_MEETING_PREP_SQL}=require('../services/valMeetingPrepSchema');
const {createValMeetingPrepService,qualityGate,inferAttendees,externalMeetingAttendees,isMeetingEvent}=require('../services/valMeetingPrep');
const {createValReadyForYouService}=require('../services/valReadyForYou');

const root=path.join(__dirname,'..');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
const routes=fs.readFileSync(path.join(root,'services','valMeetingPrepRoutes.js'),'utf8');

test('meeting prep schema creates durable backend tables',()=>{
  for(const table of ['meeting_prep_briefs','attendee_intelligence','external_research_results']){
    assert.match(VAL_MEETING_PREP_SQL,new RegExp(`create table if not exists ${table}`));
  }
  for(const field of ['source_confidence_label','meeting_stakes_json','first_five_minutes_json','post_meeting_capture_prompt','ready_for_you_handoff_json']){
    assert.match(VAL_MEETING_PREP_SQL,new RegExp(field));
  }
});

test('meeting prep routes are backend-only and mounted',()=>{
  assert.match(server,/registerValMeetingPrepRoutes/);
  assert.match(server,/ensureValMeetingPrepTables/);
  assert.match(routes,/\/api\/val\/calendar\/meeting-prep/);
  assert.match(routes,/\/api\/val\/calendar\/meeting-prep\/:eventId/);
  assert.match(routes,/\/api\/val\/calendar\/post-meeting-capture/);
  assert.match(server,/app\.post\('\/api\/val\/contacts\/create'/);
  assert.match(server,/relationshipDossier=contactId\?buildRelationshipDossier/);
  assert.match(server,/Use this contactId as the canonical relationship key going forward/);
});

test('quality gate distinguishes usable meeting context',()=>{
  const event={id:'cal_1',title:'Intro with Fred',startTime:'2026-07-03T14:00:00Z',attendees:[{name:'Fred',email:'fred@example.com'}]};
  assert.equal(qualityGate(event).quality,'high');
  assert.equal(inferAttendees(event).length,1);
  assert.equal(qualityGate({title:'Untimed'}).is_usable,false);
  assert.equal(isMeetingEvent({title:'CEO thinking day',startTime:'2026-07-10T20:00:00Z',attendees:[]}),false);
  assert.equal(isMeetingEvent({title:'Solo focus',startTime:'2026-07-10T20:00:00Z',attendees:[{name:'Jessa Grace',email:'jessa@jessagrace.com',self:true}]}),false);
  assert.equal(isMeetingEvent({title:'Call with Fred',startTime:'2026-07-10T20:00:00Z',attendees:[{name:'Fred',email:'fred@example.com',organizer:true}]}),true);
  assert.equal(externalMeetingAttendees(event).length,1);
});

test('private calendar blocks do not produce meeting prep briefs',async()=>{
  let store={};
  const service=createValMeetingPrepService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    tenantId:()=>'tenant',
    userId:()=>'user',
    resolveMeetingContext:async()=>({meeting:{id:'cal_thinking',title:'CEO thinking day',startTime:'2026-07-10T20:00:00Z',attendees:[]},openLoops:[],transcripts:[],tasks:[],sourcesChecked:[]})
  });
  const result=await service.buildMeetingPrep({eventId:'cal_thinking'});
  assert.equal(result.ok,false);
  assert.equal(result.code,'not_a_meeting');
  assert.match(result.error,/private calendar block/);
  assert.equal(store.meetingPrepBriefs?.length||0,0);
});

test('builds meeting prep with source labels, attendee resolution, project links, and enrichment stubs',async()=>{
  let store={};
  const savedProjectLinks=[];
  const event={id:'cal_aric_fred',source:'google',title:'Intro: Aric and Fred',projectId:'frisson-partner-path',projectName:'Frisson Partner Path',startTime:'2026-07-03T15:00:00Z',endTime:'2026-07-03T15:30:00Z',attendees:[{name:'Aric Soyring',email:'aric@example.com'},{name:'Fred Founder',email:'fred@example.com'}]};
  const service=createValMeetingPrepService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    uuid:prefix=>`${prefix}_test_${Math.random().toString(36).slice(2,6)}`,
    tenantId:()=>'tenant',
    userId:()=>'user',
    loadContextCalendarEvents:async()=>({events:[event],errors:[]}),
    resolveContactFromContext:async(input)=>input.email==='aric@example.com'
      ? {status:'matched',confidence:0.91,contact:{id:'crm_aric',contactId:'crm_aric',name:'Aric Soyring',email:'aric@example.com',company:'Frisson'},reason:'exact email'}
      : {status:'not_found',confidence:0,contact:null,reason:'No match'},
    resolveMeetingContext:async()=>({
      meeting:event,
      contactResolution:{},
      relationshipContext:{},
      transcripts:[{id:'tr_1',title:'Frisson partner chat',summary:'Aric introduced Fred as a possible partner.'}],
      tasks:[{id:'task_1',title:'Prepare Fred intro question',completed:false}],
      openLoops:[{text:'Follow up with Aric after the introduction.',source:'task'}],
      sourcesChecked:['Calendar events (1)','Tasks (1)'],
      errors:[]
    }),
    saveCalendarProjectLink:async(link)=>{savedProjectLinks.push(link);return {id:'ev_project_link',...link};}
  });
  const result=await service.buildMeetingPrep({eventId:'cal_aric_fred'});
  assert.equal(result.ok,true);
  assert.equal(result.no_external_action,true);
  assert.equal(result.brief.calendarEventId,'cal_aric_fred');
  assert.equal(result.brief.meetingContextJson.source_confidence_label,'internal_evidence');
  assert.ok(result.brief.attendeeIntelligenceJson.some(a=>a.crm_contact_id==='crm_aric'));
  const aricIntel=result.brief.attendeeIntelligenceJson.find(a=>a.crm_contact_id==='crm_aric');
  assert.equal(aricIntel.relationship_dossier.relationshipCardVersion,'VAL_PHASE_13C_RELATIONSHIP_DOSSIER_V1');
  assert.equal(aricIntel.relationship_dossier.identity.name,'Aric Soyring');
  assert.equal(aricIntel.relationship_dossier.identity.crmContactId,'crm_aric');
  assert.equal(aricIntel.relationship_dossier.identityResolution.status,'resolved');
  assert.match(aricIntel.relationship_dossier.wisdom.oneThingToRemember,/Follow up|relationship|invisible/i);
  const fredIntel=result.brief.attendeeIntelligenceJson.find(a=>a.email==='fred@example.com');
  assert.equal(fredIntel.crm_contact_id,'');
  assert.equal(fredIntel.relationship_dossier,null);
  assert.equal(fredIntel.unresolved_relationship_context.reason,'No canonical Relationship Dossier was attached because this attendee has not resolved to a CRM/GHL contact ID.');
  assert.equal(fredIntel.unresolved_relationship_context.recommended_action,'create_crm_contact_candidate');
  assert.equal(fredIntel.unresolved_relationship_context.contact_creation_candidate.endpoint,'/api/val/contacts/create');
  assert.equal(fredIntel.unresolved_relationship_context.contact_creation_candidate.requiresApproval,true);
  assert.equal(fredIntel.unresolved_relationship_context.contact_creation_candidate.payload.email,'fred@example.com');
  assert.match(fredIntel.unresolved_relationship_context.contact_creation_candidate.onSuccess,/canonical ID/);
  assert.ok(fredIntel.unknowns.includes('crm_contact_id_unresolved'));
  assert.ok(result.brief.attendeeIntelligenceJson.every(a=>['internal_evidence','api_enriched','public_source','val_inference','unknown'].includes(a.source_confidence_label)));
  assert.equal(result.brief.readyForYouHandoffJson.ready_for_you_candidate,true);
  assert.equal(result.brief.readyForYouHandoffJson.meeting_overview_approval.status,'approval_required');
  assert.equal(result.brief.meetingContextJson.meeting_overview_approval.no_external_action,true);
  assert.match(result.brief.meetingContextJson.meeting_overview_approval.summary,/wait for human approval/i);
  assert.equal(result.brief.internalContextJson.project_context_links[0].project_id,'frisson-partner-path');
  assert.equal(result.brief.internalContextJson.project_context_links[0].review_required,true);
  assert.equal(savedProjectLinks[0].calendarEventId,'cal_aric_fred');
  assert.equal(savedProjectLinks[0].projectId,'frisson-partner-path');
  assert.equal(savedProjectLinks[0].source,'meeting_prep');
  assert.match(result.brief.firstFiveMinutesJson.what_not_to_lead_with[0],/scraped facts/);
  assert.equal(store.externalResearchResults.length,2);
  assert.ok(store.externalResearchResults.every(r=>r.status==='planned'));
});

test('post-meeting capture updates the brief without external action',async()=>{
  let store={};
  const service=createValMeetingPrepService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    tenantId:()=>'tenant',
    userId:()=>'user',
    loadContextCalendarEvents:async()=>({events:[{id:'cal_capture',title:'Capture Meeting',startTime:'2026-07-03T15:00:00Z',attendees:[{name:'Pat',email:'pat@example.com'}]}]}),
    resolveContactFromContext:async()=>({status:'not_found',confidence:0}),
    resolveMeetingContext:async()=>({meeting:{id:'cal_capture',title:'Capture Meeting',startTime:'2026-07-03T15:00:00Z',attendees:[{name:'Pat',email:'pat@example.com'}]},openLoops:[],transcripts:[],tasks:[],sourcesChecked:[]})
  });
  await service.buildMeetingPrep({eventId:'cal_capture'});
  const capture=await service.postMeetingCapture({eventId:'cal_capture',whatChanged:'Pat wants the proposal by Monday.',followUpNeeded:true});
  assert.equal(capture.ok,true);
  assert.equal(capture.no_external_action,true);
  assert.match(capture.brief.postMeetingCaptureJson.what_changed,/proposal by Monday/);
});

test('meeting prep candidates feed Ready For You only as judgment-required work',async()=>{
  let meetingStore={};
  const meetingPrep=createValMeetingPrepService({
    hasPg:()=>false,
    getStore:()=>meetingStore,
    saveStore:s=>{meetingStore=s;},
    tenantId:()=>'tenant',
    userId:()=>'user',
    loadContextCalendarEvents:async()=>({events:[{id:'cal_ready',title:'Partner Prep',startTime:'2026-07-03T15:00:00Z',attendees:[{name:'Aric',email:'aric@example.com'}]}]}),
    resolveContactFromContext:async()=>({status:'matched',confidence:0.8,contact:{id:'crm_aric',contactId:'crm_aric',name:'Aric',email:'aric@example.com'}}),
    resolveMeetingContext:async()=>({meeting:{id:'cal_ready',title:'Partner Prep',startTime:'2026-07-03T15:00:00Z',attendees:[{name:'Aric',email:'aric@example.com'}]},openLoops:[],transcripts:[],tasks:[],sourcesChecked:[]})
  });
  await meetingPrep.buildMeetingPrep({eventId:'cal_ready'});
  let readyStore={readyForYouItems:[]};
  const ready=createValReadyForYouService({
    hasPg:()=>false,
    getStore:()=>readyStore,
    saveStore:s=>{readyStore=s;},
    tenantId:()=>'tenant',
    userId:()=>'user',
    executiveInboxService:{reviewDrafts:async()=>({drafts:[]}),listReadyForYouDraftCandidates:async()=>[]},
    meetingPrepService:meetingPrep,
    listDrafts:async()=>[]
  });
  const built=await ready.buildQueue();
  assert.equal(built.state,'has_items');
  assert.equal(built.items[0].itemType,'meeting_prep_brief');
  assert.equal(built.items[0].metadataJson.noCalendarInviteSent,true);
});
