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
const meetingPrepServiceSource=fs.readFileSync(path.join(root,'services','valMeetingPrep.js'),'utf8');

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
  assert.match(server,/ensureRelationshipPacketFromCalendarAttendee/);
  assert.match(server,/ensureRelationshipPacketFromAttendee:ensureRelationshipPacketFromCalendarAttendee/);
  assert.match(server,/sourceType:'calendar_event_attendee'/);
  assert.match(server,/saveRelationshipTimelineEvent/);
  assert.match(routes,/\/api\/val\/calendar\/meeting-prep/);
  assert.match(routes,/\/api\/val\/calendar\/meeting-prep\/:eventId/);
  assert.match(routes,/\/api\/val\/calendar\/post-meeting-capture/);
  assert.match(meetingPrepServiceSource,/withMeetingPrepTimeout\(enrichRelationshipPublicContext/);
  assert.match(meetingPrepServiceSource,/VAL_MEETING_PREP_PUBLIC_CONTEXT_TIMEOUT_MS/);
  assert.match(server,/app\.post\('\/api\/val\/contacts\/create'/);
  assert.match(server,/relationshipDossier=contactId\?buildRelationshipDossier/);
  assert.match(server,/Use this contactId as the canonical relationship key going forward/);
});

test('meeting prep rebuild allows the OpenAI brief enough time to finish',()=>{
  assert.match(server,/const MEETING_PREP_REBUILD_OPENAI_TIMEOUT_MS = Number\(process\.env\.MEETING_PREP_REBUILD_OPENAI_TIMEOUT_MS\) \|\| 105000/);
  assert.match(server,/timeoutMs:MEETING_PREP_REBUILD_OPENAI_TIMEOUT_MS/);
  assert.match(server,/maxTokens:2600/);
  assert.doesNotMatch(server,/timeoutMs:18000/);
});

test('calendar attendees are immediately packeted as relationship contacts',async()=>{
  let store={};
  const event={id:'cal_new_attendee',source:'google',title:'Intro with Dana New',startTime:'2026-07-26T15:00:00Z',attendees:[{name:'Dana New',email:'dana@example.com'}]};
  const packetCalls=[];
  const service=createValMeetingPrepService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    tenantId:()=>'tenant',
    userId:()=>'user',
    loadContextCalendarEvents:async()=>({events:[event],errors:[]}),
    resolveContactFromContext:async()=>({status:'not_found',confidence:0,contact:null,reason:'No existing contact'}),
    resolveMeetingContext:async()=>({meeting:event,contactResolution:{},relationshipContext:{},transcripts:[],tasks:[],openLoops:[],sourcesChecked:['Calendar events (1)'],errors:[]}),
    ensureRelationshipPacketFromAttendee:async(input)=>{
      packetCalls.push(input);
      return {
        ok:true,
        profile:{id:'rel_dana',profileType:'person',profileKey:'email:dana@example.com',displayName:'Dana New',metadata:{email:'dana@example.com'}},
        contact:{id:'relationship-profile:rel_dana',relationshipProfileId:'rel_dana',source:'relationship_profile',name:'Dana New',email:'dana@example.com',raw:{relationshipProfileId:'rel_dana'}}
      };
    }
  });
  const result=await service.buildMeetingPrep({eventId:'cal_new_attendee'});
  assert.equal(result.ok,true);
  assert.equal(packetCalls.length,1);
  assert.equal(packetCalls[0].attendee.email,'dana@example.com');
  const intel=result.brief.attendeeIntelligenceJson[0];
  assert.equal(intel.crm_contact_id,'rel_dana');
  assert.equal(intel.match_status,'created_from_calendar_attendee');
  assert.equal(intel.unresolved_relationship_context,null);
  assert.ok(intel.relationship_dossier);
});

test('meeting prep resolves context from attendee transcripts without cross-attendee CRM bleed',()=>{
  assert.match(server,/function matchingTranscriptContextForAttendees/);
  assert.match(server,/transcriptMentionsAttendee\(transcript,attendee\)/);
  assert.match(server,/Attendee transcript search/);
  assert.match(server,/mergeMeetingTranscriptContexts\(eventTranscripts,attendeeTranscripts\)/);
  assert.match(server,/const targetHasIdentity=Boolean\(target\.email\|\|target\.name\)/);
  assert.match(server,/matchesTargetAttendee/);
  assert.match(server,/broadCalendarMatch=!targetHasIdentity/);
});

test('meeting prep Outscraper LinkedIn lookup uses name and organization instead of raw email only',()=>{
  assert.match(server,/const usableDomain=domain&&!\/\(gmail\|googlemail\|yahoo\|outlook\|hotmail\|icloud\|me\|mac\|aol\|protonmail\)/);
  assert.doesNotMatch(server,/const endpointLooksCompany=\/linkedin-posts\/i\.test\(OUTSCRAPER_LINKEDIN_POSTS_URL\)/);
  assert.match(server,/async function resolveLinkedInPublicPost/);
  assert.match(server,/identity\.name\?`site:linkedin\.com\/posts "\$\{identity\.name\}"`/);
  assert.match(server,/identity\.slug\?`site:linkedin\.com\/posts "\$\{identity\.slug\}"`/);
  assert.match(server,/meetingPrepLinkedInResultMatchesAttendee/);
  assert.match(server,/fetchPublicLinkedInPost\(candidate\)/);
  assert.match(server,/htmlMetaContent\(html,'og:description'\)/);
  assert.match(server,/source:'outscraper_google_discovery_and_linkedin_public_post'/);
  assert.match(server,/async function resolveMeetingPrepLinkedInPublicPost/);
  assert.match(server,/const knownProfileUrl=meetingPrepLinkedInKnownProfileUrl/);
  assert.match(server,/identitySource:'stewardship_linkedin_url'/);
  assert.match(server,/resolveLinkedInProfileByEmail\(input\)/);
  assert.match(server,/site:linkedin\.com\/in "\$\{email\}"/);
  assert.match(server,/identitySource:'calendar_email_lookup'/);
  assert.match(server,/No official LinkedIn profile exists with this attendee's email address/);
  assert.doesNotMatch(server,/cacheStatus:'deferred_to_recent_signal'/);
});

test('meeting prep uses Outscraper Google Search for exact web evidence',()=>{
  assert.match(server,/const OUTSCRAPER_GOOGLE_SEARCH_URL = process\.env\.OUTSCRAPER_GOOGLE_SEARCH_URL \|\| 'https:\/\/api\.outscraper\.com\/google-search'/);
  assert.match(server,/function meetingPrepPublicSearchQueries/);
  assert.match(server,/email \|\| ''/);
  assert.match(server,/email \? `"\$\{email\}"` : ''/);
  assert.match(server,/if\(!usableDomain&&!organization&&!website&&!linkedInProfile\)/);
  assert.match(server,/email&&name \? `"\$\{email\}" "\$\{name\}"` : ''/);
  assert.match(server,/name&&usableDomain \? `"\$\{name\}" \$\{usableDomain\}` : ''/);
  assert.match(server,/async function lookupOutscraperGoogleSearch/);
  assert.match(server,/missing\.forEach\(query=>url\.searchParams\.append\('query',query\)\)/);
  assert.match(server,/url\.searchParams\.set\('pagesPerQuery','1'\)/);
  assert.match(server,/const batchQueries=Array\.from\(new Set/);
  assert.match(server,/sourceType:'outscraper_google_search_result'/);
  assert.match(server,/function meetingPrepRejectedPublicResult/);
  assert.match(server,/truepeoplesearch\|whitepages\|beenverified\|spokeo/);
  assert.match(server,/function meetingPrepPublicEvidenceText/);
  assert.match(server,/function meetingPrepSearchResultScore/);
  assert.match(server,/linkedin\\.com\\\/in/);
  assert.match(server,/function meetingPrepLinkedInRecentQueries/);
  assert.match(server,/site:linkedin\.com\/posts/);
  assert.match(server,/site:linkedin\.com\/feed\/update/);
  assert.match(server,/linkedInSlug \? `site:linkedin\.com\/posts \$\{linkedInSlug\}` : ''/);
  assert.match(server,/email \? `"\$\{email\}" LinkedIn` : ''/);
  assert.match(server,/\$\{name\} LinkedIn \$\{organization\}/);
  assert.match(server,/\$\{name\} LinkedIn posts/);
  assert.match(server,/async function lookupMeetingPrepLinkedInRecentSignal/);
  assert.match(server,/const queries=Array\.from\(new Set\(/);
  assert.match(server,/function meetingPrepLinkedInResultMatchesAttendee/);
  assert.doesNotMatch(server,/meetingPrepSearchResultMatchesAttendee\(result,attendee,contact,profile\)\|\|\/linkedin\\\.com\\\/\(posts\|feed\\\/update\)/);
  assert.match(server,/VAL_LINKEDIN_POST_LOOKUP_TIMEOUT_MS/);
  assert.match(server,/LinkedIn post discovery for/);
  assert.match(server,/OUTSCRAPER_MEETING_PREP_POLL_TIMEOUT_MS/);
  assert.match(server,/Meeting Prep public search/);
  assert.match(server,/function outscraperRequestId/);
  assert.match(server,/function outscraperResultsLocation/);
  assert.match(server,/function outscraperStatus/);
  assert.match(server,/if\(!status && flattenOutscraperSearchResults\(data\)\.length\) return \{ok:true,data\}/);
  assert.match(server,/type:'linkedin_recent_signal'/);
  assert.match(server,/Open post:/);
  assert.match(server,/async function lookupMeetingPrepWebEvidence/);
  assert.match(server,/This is what VAL found on the web about/);
  assert.match(server,/webSearch:webEvidence/);
  assert.match(server,/const publicLookupTimeout=Number\(process\.env\.VAL_MEETING_PREP_PUBLIC_CONTEXT_TIMEOUT_MS\)\|\|60000/);
  assert.match(server,/Promise\.all\(matchedRelationships\.map\(row=>meetingPrepRebuildTimeout\(/);
  assert.match(server,/buildMeetingPrepRebuildContext\(event,\{includePublicLookup:false\}\)/);
  assert.match(server,/app\.post\('\/api\/val\/meeting-prep\/external-review'/);
  assert.match(server,/meetingPrepRebuildExternalReviewText/);
  assert.doesNotMatch(server,/meetingPrepRebuildTimeout\(\s*Promise\.all\(matchedRelationships\.map\(row=>meetingPrepRebuildPublicLookup\(row\)\)\)/);
});

test('meeting prep persists JSON and attendee rows under the saved brief id',()=>{
  assert.match(meetingPrepServiceSource,/const MEETING_PREP_JSON_FIELDS = new Set/);
  assert.match(meetingPrepServiceSource,/function pgValueForMeetingPrepColumn/);
  assert.match(meetingPrepServiceSource,/JSON\.stringify\(value/);
  assert.match(meetingPrepServiceSource,/const savedBriefId=saved\?\.id\|\|row\.id/);
  assert.match(meetingPrepServiceSource,/await saveAttendeeRows\(savedBriefId,eventId,attendeeIntel\)/);
});

test('quality gate distinguishes usable meeting context',()=>{
  const event={id:'cal_1',title:'Intro with Fred',startTime:'2026-07-03T14:00:00Z',attendees:[{name:'Fred',email:'fred@example.com'}]};
  assert.equal(qualityGate(event).quality,'high');
  assert.equal(inferAttendees(event).length,1);
  assert.equal(qualityGate({title:'Untimed'}).is_usable,false);
  assert.equal(isMeetingEvent({title:'CEO thinking day',startTime:'2026-07-10T20:00:00Z',attendees:[]}),false);
  assert.equal(isMeetingEvent({title:'Solo focus',startTime:'2026-07-10T20:00:00Z',attendees:[{name:'Jessa Grace',email:'jessa@jessagrace.com',self:true}]}),false);
  assert.equal(isMeetingEvent({title:'Call with Fred',startTime:'2026-07-10T20:00:00Z',attendees:[{name:'Fred',email:'fred@example.com',organizer:true}]}),true);
  assert.equal(isMeetingEvent({title:'Mammogram Wang Building annual screening',startTime:'2026-07-10T10:40:00Z',attendees:[{name:'Clinic',email:'clinic@example.com'}]}),false);
  assert.ok(qualityGate({id:'cal_med',title:'Mammogram Wang Building annual screening',startTime:'2026-07-10T10:40:00Z',attendees:[{name:'Clinic',email:'clinic@example.com'}]}).issues.includes('private_calendar_block'));
  assert.equal(externalMeetingAttendees(event).length,1);
});

test('meeting prep protects account owner emails from attendee enrichment',async()=>{
  let store={};
  const service=createValMeetingPrepService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    tenantId:()=>'tenant',
    userId:()=>'user',
    ownerEmails:['owner@example.com'],
    loadContextCalendarEvents:async()=>({events:[{id:'cal_owner_filter',title:'Prep with external',startTime:'2026-07-19T18:00:00Z',attendees:[{name:'Owner Person',email:'owner@example.com'},{name:'External Person',email:'external@example.com'}]}]}),
    resolveContactFromContext:async(input)=>({status:'matched',confidence:0.82,contact:{id:'crm_external',contactId:'crm_external',name:input.name,email:input.email},reason:'exact attendee'}),
    resolveMeetingContext:async()=>({meeting:{id:'cal_owner_filter',title:'Prep with external',startTime:'2026-07-19T18:00:00Z',attendees:[{name:'Owner Person',email:'owner@example.com'},{name:'External Person',email:'external@example.com'}]},openLoops:[],transcripts:[],tasks:[],sourcesChecked:[]})
  });
  const result=await service.buildMeetingPrep({eventId:'cal_owner_filter'});
  assert.equal(result.ok,true);
  assert.deepEqual(result.brief.meetingContextJson.attendees.map(a=>a.email),['external@example.com']);
  assert.deepEqual(result.brief.attendeeIntelligenceJson.map(a=>a.email),['external@example.com']);
});

test('meeting prep quarantines unverified public enrichment instead of using wrong-person facts',async()=>{
  let store={};
  const event={id:'cal_michele_public_guard',source:'google',title:'Editing session with Michele',startTime:'2026-07-22T18:00:00Z',attendees:[{name:'Michele Julian',email:'michele@gmail.com'}]};
  const service=createValMeetingPrepService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    tenantId:()=>'tenant',
    userId:()=>'user',
    loadContextCalendarEvents:async()=>({events:[event],errors:[]}),
    resolveContactFromContext:async()=>({
      status:'matched',
      confidence:0.88,
      contact:{
        id:'crm_michele',
        contactId:'crm_michele',
        name:'Michele Julian',
        email:'michele@gmail.com',
        relationshipEnrichment:{
          status:'complete',
          provider:'outscraper',
          organization:'Michele Julian MD',
          category:'Doctor',
          website:'https://example-clinic.invalid',
          summary:'Michele Julian MD is a medical doctor at Example Clinic.',
          sourceRefs:[{type:'outscraper_public_context',sourceId:'https://example-clinic.invalid',summary:'Michele Julian MD doctor profile.'}]
        }
      },
      reason:'exact attendee'
    }),
    resolveMeetingContext:async()=>({
      meeting:event,
      contactResolution:{},
      relationshipContext:{emailContext:[{subject:'Editing session',summary:'Michele and Jessa discussed book editing.'}]},
      transcripts:[{id:'tr_michele_recent',title:'Michele editing transcript',summary:'Michele and Jessa reviewed chapter edits.'}],
      tasks:[],
      openLoops:[],
      sourcesChecked:['Calendar events (1)','Linked/fuzzy transcripts (1)'],
      errors:[]
    })
  });
  const result=await service.buildMeetingPrep({eventId:'cal_michele_public_guard'});
  assert.equal(result.ok,true);
  const michele=result.brief.attendeeIntelligenceJson[0];
  assert.equal(michele.public_context_status.status,'unverified_match');
  assert.equal(michele.public_profile.summary,'');
  assert.equal(michele.public_profile.website,'');
  assert.doesNotMatch(michele.who_they_are,/doctor|clinic|md/i);
  assert.doesNotMatch(michele.why_this_person_matters,/doctor|clinic|md/i);
  assert.doesNotMatch(michele.relationship_context,/doctor|clinic|md/i);
  assert.ok(michele.unknowns.some(item=>/public_context_unverified/.test(item)));
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
      ? {status:'matched',confidence:0.91,contact:{id:'crm_aric',contactId:'crm_aric',name:'Aric Soyring',email:'aric@example.com',company:'Frisson',relationshipManualContext:{relationship:{value:'Aric is a high-trust partner for the Forever Freedom work.'},needs:{values:['A clear MOU decision.']},offers:{values:['Partnership strategy and introductions.']},evidence:{values:['Jessa confirmed this relationship context in Stewardship.']}}},reason:'exact email'}
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
  assert.equal(result.brief.meetingContextJson.meeting_type.type,'project_followup');
  assert.equal(result.brief.meetingContextJson.relationship_stage,'project_followup');
  assert.equal(result.brief.briefJson.meeting_type,'project_followup');
  assert.ok(result.brief.attendeeIntelligenceJson.some(a=>a.crm_contact_id==='crm_aric'));
  const aricIntel=result.brief.attendeeIntelligenceJson.find(a=>a.crm_contact_id==='crm_aric');
  assert.equal(aricIntel.relationship_dossier.relationshipCardVersion,'VAL_PHASE_13C_RELATIONSHIP_DOSSIER_V1');
  assert.equal(aricIntel.relationship_dossier.identity.name,'Aric Soyring');
  assert.equal(aricIntel.relationship_dossier.identity.crmContactId,'crm_aric');
  assert.match(aricIntel.why_this_person_matters,/User-confirmed relationship context/i);
  assert.match(aricIntel.relationship_context,/A clear MOU decision/i);
  assert.deepEqual(aricIntel.possible_opportunities,['Partnership strategy and introductions.']);
  assert.equal(aricIntel.user_confirmed_relationship_context.relationship,'Aric is a high-trust partner for the Forever Freedom work.');
  assert.equal(aricIntel.relationship_dossier.identityResolution.status,'resolved');
  assert.match(aricIntel.relationship_dossier.wisdom.oneThingToRemember,/Follow up|relationship|invisible/i);
  const fredIntel=result.brief.attendeeIntelligenceJson.find(a=>a.email==='fred@example.com');
  assert.equal(fredIntel.crm_contact_id,'');
  assert.equal(fredIntel.relationship_dossier,null);
  assert.equal(fredIntel.unresolved_relationship_context.reason,'No canonical Relationship Dossier was attached because this attendee has not resolved to a CRM contact ID.');
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

test('meeting prep explicitly classifies true first meetings',async()=>{
  let store={};
  const event={id:'cal_first_meeting',source:'google',title:'Intro with New Person',startTime:'2026-07-21T15:00:00Z',attendees:[{name:'New Person',email:'new@example.com'}]};
  const service=createValMeetingPrepService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    tenantId:()=>'tenant',
    userId:()=>'user',
    loadContextCalendarEvents:async()=>({events:[event],errors:[]}),
    resolveContactFromContext:async()=>({status:'not_found',confidence:0,contact:null,reason:'No prior contact'}),
    resolveMeetingContext:async()=>({meeting:event,contactResolution:{},relationshipContext:{emailContext:[]},transcripts:[],tasks:[],openLoops:[],sourcesChecked:['Calendar events (1)'],errors:[]})
  });
  const result=await service.buildMeetingPrep({eventId:'cal_first_meeting'});
  assert.equal(result.ok,true);
  assert.equal(result.brief.meetingContextJson.meeting_type.type,'first_meeting');
  assert.equal(result.brief.meetingContextJson.meeting_type.label,'First meeting prep');
  assert.match(result.brief.meetingContextJson.meeting_type.focus,/public research/i);
  assert.match(result.brief.briefJson.concise_brief,/first conversation/i);
  assert.deepEqual(result.brief.meetingContextJson.meeting_type.evidence,['no prior relationship, project, email, task, or transcript evidence found']);
});

test('meeting prep does not treat recurring meet-with known contacts as first meetings',async()=>{
  let store={};
  let enrichPayload=null;
  const event={id:'cal_weekly_greg_ed',source:'google',title:'Meet w/ Jessa | Greg Zlevor | Ed Brown',startTime:'2026-07-19T14:00:00Z',attendees:[{name:'Greg Zlevor',email:'gzlevor@westwoodintl.com'},{name:'Ed Brown',email:'coachedbrown@gmail.com'}]};
  const service=createValMeetingPrepService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    tenantId:()=>'tenant',
    userId:()=>'user',
    loadContextCalendarEvents:async()=>({events:[event],errors:[]}),
    resolveContactFromContext:async(input)=>input.email==='gzlevor@westwoodintl.com'
      ? {status:'matched',confidence:0.9,contact:{id:'relationship-profile:greg',relationshipProfileId:'rel_greg',name:'Greg Zlevor',email:input.email,company:'Westwood International Inc',relationshipEnrichment:{status:'complete',provider:'outscraper',organization:'Westwood International Inc',summary:'Saved company context without LinkedIn posts.',website:'https://westwoodintl.com'}},reason:'exact email'}
      : {status:'not_found',confidence:0,contact:null,reason:'No prior contact'},
    resolveMeetingContext:async()=>({
      meeting:event,
      contactResolution:{},
      relationshipContext:{emailContext:[{subject:'Weekly follow-up',summary:'Greg and Jessa meet weekly.'}]},
      transcripts:[{id:'tr_greg_recent',title:'Weekly Greg check-in',summary:'Greg and Jessa reviewed LinkedIn strategy and next steps.'}],
      tasks:[],
      openLoops:[{text:'Greg to continue research and share with the group.'}],
      sourcesChecked:['Calendar events (1)','Linked/fuzzy transcripts (1)'],
      errors:[]
    }),
    enrichRelationshipPublicContext:async(payload)=>{
      enrichPayload=payload;
      return {cached:false,profile:{id:'rel_greg',displayName:'Greg Zlevor',metadata:{relationshipEnrichment:{status:'complete',provider:'outscraper',organization:'Westwood International Inc',summary:'Latest LinkedIn post found by Outscraper: Greg shared a post about leadership momentum.',latestLinkedInPost:'Greg shared a post about leadership momentum.',sourceRefs:[{type:'linkedin_post',sourceId:'linkedin:greg:1',summary:'Greg shared a post about leadership momentum.'}]}}},enrichment:{status:'complete',provider:'outscraper',organization:'Westwood International Inc',summary:'Latest LinkedIn post found by Outscraper: Greg shared a post about leadership momentum.',sourceRefs:[{type:'linkedin_post',sourceId:'linkedin:greg:1',summary:'Greg shared a post about leadership momentum.'}]}};
    }
  });
  const result=await service.buildMeetingPrep({eventId:'cal_weekly_greg_ed'});
  assert.equal(result.ok,true);
  assert.notEqual(result.brief.meetingContextJson.meeting_type.type,'first_meeting');
  assert.equal(result.brief.meetingContextJson.meeting_type.type,'known_relationship');
  assert.match(result.brief.briefJson.likely_purpose,/relationship context|what changed|next useful move/i);
  assert.doesNotMatch(result.brief.briefJson.likely_purpose,/first meeting|introduction/i);
  assert.equal(enrichPayload.force,true);
  assert.match(result.brief.attendeeIntelligenceJson[0].public_profile.latest_linkedin_post,/leadership momentum/i);
  assert.equal(result.brief.briefJson.brief_packet.version,'meeting_prep_brief_packet_v1');
  assert.match(result.brief.briefJson.brief_packet.top_judgment,/not a first meeting|alignment and follow-through/i);
  assert.match(result.brief.briefJson.brief_packet.what_changed_since_last_spoke.join(' '),/reviewed LinkedIn strategy and next steps/i);
  assert.match(result.brief.briefJson.brief_packet.open_loops.join(' '),/continue research and share/i);
});

test('meeting prep refreshes external evidence even when saved public context already has LinkedIn',async()=>{
  let store={};
  let enrichPayload=null;
  const event={id:'cal_known_public_refresh',source:'google',title:'Weekly Greg check-in',startTime:'2026-07-23T14:00:00Z',attendees:[{name:'Greg Zlevor',email:'gzlevor@westwoodintl.com'}]};
  const service=createValMeetingPrepService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    tenantId:()=>'tenant',
    userId:()=>'user',
    loadContextCalendarEvents:async()=>({events:[event],errors:[]}),
    resolveContactFromContext:async(input)=>({
      status:'matched',
      confidence:0.9,
      contact:{
        id:'relationship-profile:greg',
        relationshipProfileId:'rel_greg',
        name:'Greg Zlevor',
        email:input.email,
        company:'Westwood International Inc',
        linkedinUrl:'https://www.linkedin.com/in/gregzlevor',
        relationshipEnrichment:{
          status:'complete',
          provider:'outscraper',
          organization:'Westwood International Inc',
          website:'https://westwoodintl.com',
          summary:'Saved context. Latest LinkedIn post found by Outscraper: Older post.',
          latestLinkedInPost:'Older post.',
          sourceRefs:[{type:'linkedin_post',sourceId:'linkedin:old',summary:'Older post.'}]
        }
      },
      reason:'exact email'
    }),
    resolveMeetingContext:async()=>({meeting:event,contactResolution:{},relationshipContext:{emailContext:[{subject:'Weekly',summary:'Known weekly meeting.'}]},transcripts:[{id:'tr_greg_weekly',title:'Greg weekly',summary:'Greg and Jessa reviewed implementation.'}],tasks:[],openLoops:[],sourcesChecked:['Calendar events (1)','Linked/fuzzy transcripts (1)'],errors:[]}),
    enrichRelationshipPublicContext:async(payload)=>{
      enrichPayload=payload;
      return {cached:false,profile:{id:'rel_greg',displayName:'Greg Zlevor',metadata:{relationshipEnrichment:{status:'complete',provider:'outscraper',organization:'Westwood International Inc',website:'https://westwoodintl.com',summary:'Latest LinkedIn post found by Outscraper: Fresh post about nonprofit launch.',latestLinkedInPost:'Fresh post about nonprofit launch.',latestLinkedInUrl:'https://www.linkedin.com/posts/gregzlevor_fresh',sourceRefs:[{type:'linkedin_post',sourceId:'linkedin:older-shadow',summary:'Older shadow post.'},{type:'linkedin_recent_signal',sourceId:'https://www.linkedin.com/posts/gregzlevor_fresh',summary:'Fresh post about nonprofit launch.'}]}}},enrichment:{status:'complete',provider:'outscraper',organization:'Westwood International Inc',website:'https://westwoodintl.com',summary:'Latest LinkedIn post found by Outscraper: Fresh post about nonprofit launch.',latestLinkedInPost:'Fresh post about nonprofit launch.',latestLinkedInUrl:'https://www.linkedin.com/posts/gregzlevor_fresh',sourceRefs:[{type:'linkedin_post',sourceId:'linkedin:older-shadow',summary:'Older shadow post.'},{type:'linkedin_recent_signal',sourceId:'https://www.linkedin.com/posts/gregzlevor_fresh',summary:'Fresh post about nonprofit launch.'}]}};
    }
  });
  const result=await service.buildMeetingPrep({eventId:'cal_known_public_refresh'});
  assert.equal(result.ok,true);
  assert.equal(enrichPayload.force,true);
  assert.match(result.brief.attendeeIntelligenceJson[0].public_profile.latest_linkedin_post,/Fresh post/);
  assert.equal(result.brief.attendeeIntelligenceJson[0].public_profile.latest_linkedin_url,'https://www.linkedin.com/posts/gregzlevor_fresh');
  assert.doesNotMatch(result.brief.attendeeIntelligenceJson[0].public_profile.latest_linkedin_post,/Older post/);
});

test('meeting prep reuses recent general web context while requesting fresh activity',async()=>{
  let store={};
  let enrichPayload=null;
  const event={id:'cal_cached_general_web',source:'google',title:'Weekly Greg check-in',startTime:'2026-07-24T14:00:00Z',attendees:[{name:'Greg Zlevor',email:'gzlevor@westwoodintl.com'}]};
  const completedAt=new Date().toISOString();
  const service=createValMeetingPrepService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    tenantId:()=>'tenant',
    userId:()=>'user',
    loadContextCalendarEvents:async()=>({events:[event],errors:[]}),
    resolveContactFromContext:async(input)=>({
      status:'matched',
      confidence:0.9,
      contact:{
        id:'relationship-profile:greg',
        relationshipProfileId:'rel_greg',
        name:'Greg Zlevor',
        email:input.email,
        company:'Westwood International Inc',
        relationshipEnrichment:{
          status:'complete',
          provider:'outscraper',
          organization:'Westwood International Inc',
          website:'https://westwoodintl.com',
          summary:'Saved general web context for Greg.',
          completedAt,
          sourceRefs:[{type:'web_search_result',sourceId:'https://www.linkedin.com/in/gregzlevor',summary:'Greg Zlevor - President @ Westwood International'}]
        }
      },
      reason:'exact email'
    }),
    resolveMeetingContext:async()=>({meeting:event,contactResolution:{},relationshipContext:{emailContext:[{subject:'Weekly',summary:'Known weekly meeting.'}]},transcripts:[{id:'tr_cached_web',title:'Greg weekly',summary:'Greg and Jessa reviewed implementation.'}],tasks:[],openLoops:[],sourcesChecked:['Calendar events (1)','Linked/fuzzy transcripts (1)'],errors:[]}),
    enrichRelationshipPublicContext:async(payload)=>{
      enrichPayload=payload;
      return {cached:true,enrichment:{status:'complete',provider:'outscraper',organization:'Westwood International Inc',website:'https://westwoodintl.com',summary:'Saved general web context for Greg.',completedAt,webSearch:{cacheStatus:'cached',completedAt},sourceRefs:[{type:'web_search_result',sourceId:'https://www.linkedin.com/in/gregzlevor',summary:'Greg Zlevor - President @ Westwood International'}]},profile:{id:'rel_greg',displayName:'Greg Zlevor',metadata:{relationshipEnrichment:{status:'complete',provider:'outscraper',organization:'Westwood International Inc',website:'https://westwoodintl.com',summary:'Saved general web context for Greg.',completedAt,sourceRefs:[{type:'web_search_result',sourceId:'https://www.linkedin.com/in/gregzlevor',summary:'Greg Zlevor - President @ Westwood International'}]}}}};
    }
  });
  const result=await service.buildMeetingPrep({eventId:'cal_cached_general_web'});
  assert.equal(result.ok,true);
  assert.equal(enrichPayload.force,false);
  assert.equal(enrichPayload.refreshGeneralWeb,false);
  assert.equal(enrichPayload.refreshRecentActivity,true);
  assert.equal(result.brief.attendeeIntelligenceJson[0].public_context_status.general_web_status,'cached');
  assert.equal(result.brief.attendeeIntelligenceJson[0].public_profile.general_web_status,'cached');
  assert.equal(result.brief.attendeeIntelligenceJson[0].public_context_status.recent_activity_status,'ran');
  assert.equal(result.brief.attendeeIntelligenceJson[0].public_profile.latest_linkedin_url,'https://www.linkedin.com/in/gregzlevor/recent-activity/all/');
});

test('meeting prep enriches admitted attendee context and matches saved projects',async()=>{
  let store={};
  let enrichCalls=0;
  const savedProjectLinks=[];
  const event={id:'cal_goall_doug',source:'google',title:'GOALL planning with Doug Cornfield',startTime:'2026-07-18T15:00:00Z',attendees:[{name:'Doug Cornfield',email:'doug@d3day.com'}]};
  const service=createValMeetingPrepService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    uuid:prefix=>`${prefix}_test_${Math.random().toString(36).slice(2,6)}`,
    tenantId:()=>'tenant',
    userId:()=>'user',
    loadContextCalendarEvents:async()=>({events:[event],errors:[]}),
    resolveContactFromContext:async()=>({status:'matched',confidence:0.84,contact:{id:'relationship-profile:doug',relationshipProfileId:'rel_doug',name:'Doug Cornfield',email:'doug@d3day.com',company:'D3 Day'},reason:'exact email'}),
    resolveMeetingContext:async()=>({
      meeting:event,
      contactResolution:{},
      relationshipContext:{contact:{name:'Doug Cornfield',email:'doug@d3day.com'}},
      transcripts:[{id:'tr_recent_doug',title:'GOALL check-in with Doug',summary:'Doug and Jessa reviewed GOALL website and speaker page next steps.'}],
      tasks:[],
      openLoops:[],
      sourcesChecked:['Calendar events (1)','Linked/fuzzy transcripts (1)'],
      errors:[]
    }),
    listProjectProfiles:async()=>[{id:'project_goall',profileType:'project',profileKey:'project:goall',projectId:'goall-project',displayName:'GOALL project',summary:'GOALL project work.'}],
    enrichRelationshipPublicContext:async({relationshipId})=>{
      enrichCalls+=1;
      assert.equal(relationshipId,'rel_doug');
      return {cached:false,profile:{id:'rel_doug',displayName:'Doug Cornfield',metadata:{relationshipEnrichment:{status:'complete',provider:'outscraper',organization:'D3 Day',summary:'Public context confirms D3 Day speaker and website work.',offers:['Speaking and website strategy.'],sourceRefs:[{type:'outscraper_public_context',sourceId:'d3day',summary:'D3 Day public listing.'}],completedAt:'2026-07-18T15:05:00Z'}}},enrichment:{status:'complete',provider:'outscraper',organization:'D3 Day',summary:'Public context confirms D3 Day speaker and website work.',offers:['Speaking and website strategy.'],sourceRefs:[{type:'outscraper_public_context',sourceId:'d3day',summary:'D3 Day public listing.'}],completedAt:'2026-07-18T15:05:00Z'}};
    },
    saveCalendarProjectLink:async(link)=>{savedProjectLinks.push(link);return {id:'ev_project_link',...link};}
  });
  const result=await service.buildMeetingPrep({eventId:'cal_goall_doug'});
  assert.equal(result.ok,true);
  assert.equal(enrichCalls,1);
  assert.equal(result.brief.meetingContextJson.meeting_type.type,'project_followup');
  const doug=result.brief.attendeeIntelligenceJson[0];
  assert.equal(doug.public_context_status.status,'ran');
  assert.equal(doug.saved_relationship_context.provider,'outscraper');
  assert.match(doug.relationship_context,/Public context confirms D3 Day/);
  assert.equal(doug.source_confidence_label,'internal_evidence');
  assert.equal(result.brief.internalContextJson.transcripts[0].id,'tr_recent_doug');
  assert.equal(result.brief.internalContextJson.project_context_links[0].project_id,'goall-project');
  assert.equal(result.brief.internalContextJson.project_context_links[0].source,'saved_project_profile_match');
  assert.match(result.brief.briefJson.brief_packet.project_context.join(' '),/GOALL project/i);
  assert.match(result.brief.briefJson.brief_packet.what_changed_since_last_spoke.join(' '),/GOALL website and speaker page/i);
  assert.equal(savedProjectLinks[0].projectId,'goall-project');
});

test('meeting prep replaces thin clicked calendar event with fuller attendee event',async()=>{
  let store={};
  let resolverInput=null;
  const fullEvent={id:'cal_full_attendees',source:'google',title:'Jessa Zoom Val Big Trick editing session',startTime:'2026-07-19T18:00:00Z',attendees:[{name:'Michele Julian',email:'michele@example.com'}]};
  const service=createValMeetingPrepService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    tenantId:()=>'tenant',
    userId:()=>'user',
    loadContextCalendarEvents:async()=>({events:[fullEvent],errors:[]}),
    resolveContactFromContext:async(input)=>({status:'matched',confidence:0.82,contact:{id:'crm_michele',contactId:'crm_michele',name:input.name,email:input.email},reason:'exact attendee'}),
    resolveMeetingContext:async(input)=>{resolverInput=input;return {meeting:fullEvent,openLoops:[],transcripts:[{id:'tr_michele',title:'Most recent Michele transcript',summary:'Michele and Jessa reviewed the editing session context.'}],tasks:[],sourcesChecked:['Calendar events (1)','Linked/fuzzy transcripts (1)']};}
  });
  const result=await service.buildMeetingPrep({event:{id:'cal_full_attendees',source:'google',title:'Jessa Zoom Val Big Trick editing session',start:'2026-07-19T18:00:00Z',attendees:[]}});
  assert.equal(result.ok,true);
  assert.equal(resolverInput.eventId,'cal_full_attendees');
  assert.equal(resolverInput.title,'Jessa Zoom Val Big Trick editing session');
  assert.equal(result.brief.meetingContextJson.title,'Jessa Zoom Val Big Trick editing session');
  assert.equal(result.brief.meetingContextJson.attendees[0].email,'michele@example.com');
  assert.equal(result.brief.attendeeIntelligenceJson[0].crm_contact_id,'crm_michele');
  assert.equal(result.brief.attendeeIntelligenceJson[0].public_context_status.status,'not_checked');
  assert.equal(result.brief.internalContextJson.transcripts[0].id,'tr_michele');
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
