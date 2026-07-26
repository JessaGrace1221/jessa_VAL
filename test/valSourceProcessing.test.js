const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const {VAL_SOURCE_PROCESSING_SQL}=require('../services/valSourceProcessingSchema');
const {createValSourceProcessingService,documentsFromInput,evidenceChunks}=require('../services/valSourceProcessing');
const {createValReviewUpdatesService}=require('../services/valReviewUpdates');
const {createValReadyForYouService}=require('../services/valReadyForYou');

const root=path.join(__dirname,'..');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
const routes=fs.readFileSync(path.join(root,'services','valSourceProcessingRoutes.js'),'utf8');

function servicesFor(store,overrides={}){
  const deps={
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    tenantId:()=>'tenant',
    userId:()=>'user',
    uuid:prefix=>`${prefix}_test`
  };
  const reviewUpdates=createValReviewUpdatesService(deps);
  const readyForYou=createValReadyForYouService({...deps,executiveInboxService:{reviewDrafts:async()=>({drafts:[]}),listReadyForYouDraftCandidates:async()=>[]},listDrafts:async()=>[]});
  const sourceProcessing=createValSourceProcessingService({...deps,reviewUpdatesService:reviewUpdates,readyForYouService:readyForYou,listProjectProfiles:async()=>store.relationshipProfiles?.filter(p=>p.profileType==='project')||[],...overrides});
  return {reviewUpdates,readyForYou,sourceProcessing,getStore:()=>store};
}

test('source processing schema creates source, artifact, and surface tables',()=>{
  for(const table of ['source_processing_records','prepared_artifact_records','surface_registrations']){
    assert.match(VAL_SOURCE_PROCESSING_SQL,new RegExp(`create table if not exists ${table}`));
  }
  for(const field of ['source_receipt_json','witness_observations_json','review_updates_json','prepared_work_candidates_json','surface_target_type','ready_for_you_item_id']){
    assert.match(VAL_SOURCE_PROCESSING_SQL,new RegExp(field));
  }
});

test('source processing routes are backend-only and mounted',()=>{
  assert.match(server,/ensureValSourceProcessingTables/);
  assert.match(server,/registerValSourceProcessingRoutes/);
  assert.match(routes,/\/api\/val\/source-processing\/relationship-document-email/);
  assert.match(routes,/\/api\/val\/source-processing\/knowledge-document/);
  assert.match(routes,/\/api\/val\/source-processing\/records/);
  assert.match(routes,/\/api\/val\/source-processing\/surface-registrations/);
  assert.match(routes,/listSurfaceRegistrations/);
  assert.match(routes,/allowRelationshipDocumentEmailPost/);
  assert.match(routes,/Authentication required/);
  assert.match(server,/allowRelationshipDocumentEmailPost:\(\)=>!requestContext\.getStore\(\)\?\.publicHearthTest/);
  assert.match(server,/allowKnowledgeDocumentPost:\(\)=>!requestContext\.getStore\(\)\?\.publicHearthTest/);
  assert.match(server,/valSourceProcessing\.processKnowledgeDocument\(knowledgeDocumentInput\)/);
  assert.match(server,/sourceProcessingRecordId:processed\?\.sourceProcessingRecord\?\.id/);
  assert.match(server,/afterKnowledgeDocument:queueKnowledgeDocumentObserverDelivery/);
  assert.match(server,/processSourceEvent:input=>processCanonicalBoardEvidence\(input\)/);
});

test('knowledge documents keep their complete extracted text and Witnessing receipt',async()=>{
  const store={relationshipProfiles:[],valReviewUpdates:[],readyForYouItems:[],sourceProcessingRecords:[],preparedArtifactRecords:[],surfaceRegistrations:[]};
  const {sourceProcessing}=servicesFor(store);
  const rawText='DISC profile: Jessa moves quickly, values directness, and needs enough relational context to trust a decision.';
  const result=await sourceProcessing.processKnowledgeDocument({
    document:{
      id:'file_disc_profile',
      title:'Jessa DISC Profile.pdf',
      fileName:'Jessa DISC Profile.pdf',
      mimeType:'application/pdf',
      rawText,
      docType:'knowledge_document',
      documentCategory:'about_me',
      uploadedVia:'val_witnessing_session'
    }
  });

  assert.equal(result.ok,true);
  assert.equal(result.documentRead,true);
  assert.equal(result.witnessingContextAvailable,true);
  assert.equal(result.sourceProcessingRecord.sourceReceiptJson.rawText,rawText);
  assert.equal(result.sourceProcessingRecord.sourceReceiptJson.characterCount,rawText.length);
  assert.equal(result.sourceProcessingRecord.sourceReceiptJson.documentCategory,'about_me');
  assert.equal(result.sourceProcessingRecord.executiveRelevanceJson.document_read,true);
  assert.deepEqual(result.sourceProcessingRecord.domainRoutesJson,['documents','witnessing']);
  assert.ok(result.sourceProcessingRecord.packetUpdatesJson.some(packet=>packet.target==='witnessing_context'&&packet.status==='available'));
  assert.match(result.sourceProcessingRecord.witnessObservationsJson[0].observation,/read "Jessa DISC Profile\.pdf"/);
  assert.equal(result.sourceProcessingRecord.metadataJson.noExternalAction,true);
  assert.equal(result.sourceProcessingRecord.metadataJson.documentCategory,'about_me');
});

test('transcript source processing is versioned, immutable, and deduplicated by content',async()=>{
  const store={sourceProcessingRecords:[],preparedArtifactRecords:[],surfaceRegistrations:[]};
  const {sourceProcessing}=servicesFor(store);
  const transcript={
    id:'tr_versioned',
    title:'GOALL handoff',
    rawText:'Jessa: I will finish the GOALL dashboard handoff for Mike.'
  };
  const first=await sourceProcessing.processTranscriptSource({transcript});
  const repeated=await sourceProcessing.processTranscriptSource({transcript});
  const changed=await sourceProcessing.processTranscriptSource({transcript:{...transcript,rawText:`${transcript.rawText}\nMike: Please include pipeline projections.`}});

  assert.equal(first.deduplicated,false);
  assert.equal(repeated.deduplicated,true);
  assert.equal(first.sourceProcessingRecord.id,repeated.sourceProcessingRecord.id);
  assert.equal(changed.deduplicated,false);
  assert.notEqual(changed.sourceProcessingRecord.id,first.sourceProcessingRecord.id);
  assert.equal(first.sourceProcessingRecord.sourceVersion,1);
  assert.equal(changed.sourceProcessingRecord.sourceVersion,2);
  assert.equal(store.sourceProcessingRecords.length,2);
  assert.equal(first.sourceProcessingRecord.metadataJson.immutableSourceVersion,true);
});

test('provider calendar evidence deduplicates unchanged refreshes and emits only changed versions',async()=>{
  const store={sourceProcessingRecords:[],preparedArtifactRecords:[],surfaceRegistrations:[]};
  const deliveries=[];
  const {sourceProcessing}=servicesFor(store,{
    afterSourceProcessed:async input=>{
      deliveries.push(input);
      return [{id:`packet_${input.record.id}`,sourceType:input.sourceType}];
    }
  });
  const input={
    sourceType:'calendar_event',
    sourceId:'google:event_1',
    sourceTitle:'GOALL weekly check-in',
    rawText:'Provider: google\nTitle: GOALL weekly check-in\nStarts: 2026-07-27T11:00:00Z\nAttendees: mike@example.com',
    sourceRefs:[{sourceType:'project_profile',sourceId:'project_goall',quoteOrSummary:'This meeting belongs to GOALL.',confidence:0.9}],
    domainRoutes:['calendar','board_of_observers','meeting_prep']
  };
  const first=await sourceProcessing.processEvidenceSource(input);
  const unchanged=await sourceProcessing.processEvidenceSource(input);
  const changed=await sourceProcessing.processEvidenceSource({
    ...input,
    rawText:`${input.rawText}\nLocation: Zoom`
  });

  assert.equal(first.deduplicated,false);
  assert.equal(unchanged.deduplicated,true);
  assert.equal(changed.deduplicated,false);
  assert.equal(deliveries.length,2);
  assert.equal(first.sourceProcessingRecord.sourceVersion,1);
  assert.equal(changed.sourceProcessingRecord.sourceVersion,2);
  assert.equal(first.sourcePackets[0].sourceType,'calendar_event');
  assert.equal(first.sourceProcessingRecord.sourceReceiptJson.sourceRefs.length,2);
  assert.equal(deliveries[0].sourceRefs[1].source_id,'project_goall');
});

test('stored source receipts retry Board delivery until a packet receipt exists',async()=>{
  const store={sourceProcessingRecords:[],preparedArtifactRecords:[],surfaceRegistrations:[]};
  let providerAvailable=false;
  let attempts=0;
  const {sourceProcessing}=servicesFor(store,{
    afterSourceProcessed:async input=>{
      attempts+=1;
      if(!providerAvailable)return [];
      return [{id:`packet_${input.record.id}`,sourceType:input.sourceType}];
    }
  });
  const input={
    sourceType:'email',
    sourceId:'email_retry_1',
    sourceTitle:'A source that must not disappear',
    rawText:'Michele asked Jessa to send the final introduction by Friday.'
  };
  const first=await sourceProcessing.processEvidenceSource(input);
  assert.equal(first.sourceProcessingRecord.metadataJson.boardDelivery.status,'failed');
  assert.equal(first.sourcePackets.length,0);

  providerAvailable=true;
  const repeated=await sourceProcessing.processEvidenceSource(input);
  assert.equal(repeated.deduplicated,true);
  assert.equal(repeated.boardDeliveryRetried,true);
  assert.equal(repeated.sourceProcessingRecord.metadataJson.boardDelivery.status,'delivered');
  assert.equal(repeated.sourcePackets.length,1);

  const noRemaining=await sourceProcessing.retryUndeliveredSources({limit:20});
  assert.equal(noRemaining.attempted,0);
  assert.equal(attempts,2);
});

test('scheduled source reconciliation processes oldest undelivered receipts first',async()=>{
  const store={sourceProcessingRecords:[],preparedArtifactRecords:[],surfaceRegistrations:[]};
  const delivered=[];
  const {sourceProcessing}=servicesFor(store,{
    afterSourceProcessed:async input=>{
      delivered.push(input.record.id);
      return [{id:`packet_${input.record.id}`}];
    }
  });
  for(let index=0;index<30;index++){
    const result=await sourceProcessing.processEvidenceSource({
      sourceType:'transcript',
      sourceId:`source_${index}`,
      sourceTitle:`Source ${index}`,
      rawText:`Evidence ${index}`,
      notify:false,
      createdAt:new Date(Date.UTC(2026,0,index+1)).toISOString()
    });
    result.sourceProcessingRecord.createdAt=new Date(Date.UTC(2026,0,index+1)).toISOString();
  }
  const retry=await sourceProcessing.retryUndeliveredSources({limit:5});
  assert.equal(retry.delivered,5);
  const expected=store.sourceProcessingRecords
    .slice()
    .sort((left,right)=>new Date(left.createdAt)-new Date(right.createdAt))
    .slice(0,5)
    .map(record=>record.id);
  assert.deepEqual(delivered,expected);
});

test('long source evidence is split into ordered overlapping chunks without losing the tail',()=>{
  const rawText=Array.from({length:500},(_,index)=>`Transcript line ${index+1}: durable source evidence for the Board.`).join('\n');
  const chunks=evidenceChunks(rawText,1200,120);
  assert.ok(chunks.length>1);
  assert.match(chunks[0],/Transcript line 1:/);
  assert.match(chunks.at(-1),/Transcript line 500:/);
  assert.ok(chunks.every(chunk=>chunk.length<=1200));
});

test('live email document intake routes admitted relationship attachments through source processing',()=>{
  assert.match(server,/function extractGmailAttachments/);
  assert.match(server,/function normalizeOutlookAttachment/);
  assert.match(server,/function sourceProcessingDocumentsFromEmail/);
  assert.match(server,/function processEmailDocumentSourceProcessing/);
  assert.match(server,/sourceProcessingAttachmentLooksLikeDocument/);
  assert.match(server,/documentLooksLikeCalendarInvite\(attachment\)/);
  assert.match(server,/function sourceProcessingDriveDocumentsFromEmail/);
  assert.match(server,/function sourceProcessingDriveSharerFromEmail/);
  assert.match(server,/function sourceProcessingProjectOwnerFromProfile/);
  assert.match(server,/sourceProcessingDriveDocumentsFromEmail\(email\)/);
  assert.match(server,/sourceProcessingGoogleDriveDocumentType/);
  assert.match(server,/google_drive_share/);
  assert.match(server,/google_drive_share_notice/);
  assert.match(server,/matched_existing_project_owner/);
  assert.match(server,/const profiles=await listRelationshipProfiles\(\{limit:260\}\)/);
  assert.doesNotMatch(server,/listRelationshipProfiles\(\{limit:260\}\)\.catch\(\(\)=>\[\]\)\)\.filter\(profile=>profile\.profileType==='person'\)/);
  assert.match(server,/google_drive_sharer_not_admitted_relationship/);
  assert.match(server,/sender_not_admitted_relationship/);
  assert.doesNotMatch(server,/if\(!relationship\.admitted\)\{\s*return \{ok:true,skipped:true,reason:'sender_not_admitted_relationship'/);
  assert.match(server,/skipped:!relationship\.admitted/);
  assert.match(server,/reason:relationship\.admitted\?'':\(relationship\.relationshipAdmission\?\.reason\|\|'sender_not_admitted_relationship'\)/);
  const emailPayload=server.slice(
    server.indexOf('async function emailIntelligencePayload'),
    server.indexOf("app.get('/api/email/intelligence'")
  );
  assert.match(emailPayload,/const documentQuery=`in:anywhere has:attachment newer_than:\$\{activeDays\}d`/);
  assert.match(emailPayload,/documentGmail/);
  assert.match(emailPayload,/valConversationIdentity\?\.upsertEmailMessage/);
  assert.match(emailPayload,/processEmailDocumentSourceProcessing\(Array\.from\(sourceProcessingEmailMap\.values\(\)\),\{origin:'email_intelligence'\}/);
  assert.match(emailPayload,/documentAttachmentCount:\(documentGmail\.emails\|\|\[\]\)\.length/);
  assert.match(emailPayload,/sourceProcessing:\{projectManagers:projectManagerIntake\}/);
  assert.match(emailPayload,/projectManagerSuggestions:projectManagerIntake\.suggestions/);
  assert.match(server,/documentCandidates=candidates\.reduce/);
  assert.match(server,/whatValDidReceipt:result\.whatValDidReceipt\|\|result\.what_val_did_receipt/);
  assert.match(server,/whatValDidReceipt:result\.whatValDidReceipt\|\|null/);
  assert.match(server,/afterDocumentEvent:async\(event\)=>\{/);
  assert.match(server,/source:'derived_document_event'/);
  assert.match(server,/processCanonicalBoardEvidence\(\{/);
});

test('Google, Outlook, and GHL calendar reads use canonical versioned source intake',()=>{
  assert.match(server,/function calendarEventEvidenceText/);
  assert.match(server,/async function processCalendarEventsForBoard/);
  assert.match(server,/sourceType:'calendar_event'/);
  assert.match(server,/sourceId:`\$\{provider\}:\$\{sourceId\}`/);
  assert.match(server,/if\(label!=='val'\)void processCalendarEventsForBoard\(loaded,label\)/);
  assert.match(server,/calendar_event:'meeting_context_packet'/);
});

test('live transcript processing hands the full transcript to canonical source intake instead of the legacy summary packet lane',()=>{
  assert.match(server,/const sourceProcessing=await processCanonicalBoardEvidence\(\{\s*sourceType:'transcript',\s*sourceId,\s*sourceTitle:title,\s*rawText:transcript,/s);
  assert.match(server,/const boardPackets=sourceProcessing\?\.sourcePackets\|\|\[\];/);
  assert.doesNotMatch(server,/const boardPackets=await valBoardPackets\?\.recordTranscriptProcessed\(\{sourceId,title,summary,analysis:parsed/);
  assert.match(server,/const transcriptIntelligence=await valTranscriptIntelligence\?\.intake\(\{\s*transcript:\{\s*id:sourceId,\s*title,\s*meetingTitle:title,\s*rawText:transcript,/s);
  assert.match(server,/return \{analysis:parsed,summary,participants,observations,canonicalPipeline,transcriptIntelligence,/);
});

test('calendar invite attachments do not count as Project Managers document evidence',async()=>{
  const store={relationshipProfiles:[],valReviewUpdates:[],readyForYouItems:[],sourceProcessingRecords:[],preparedArtifactRecords:[],surfaceRegistrations:[]};
  const {sourceProcessing}=servicesFor(store);
  const source={
    sourceType:'email_message',
    sourceId:'email_calendar_invite',
    subject:'Invitation: Partner sync',
    attachments:[{id:'att_invite',filename:'invite.ics',mimeType:'text/calendar'}]
  };

  assert.deepEqual(documentsFromInput({source}),[]);
  const result=await sourceProcessing.processRelationshipDocumentEmail({
    relationship:{admitted:true,id:'rel_anthony',name:'Anthony',email:'anthony@example.com'},
    source
  });

  assert.equal(result.ok,true);
  assert.equal(result.projectSuggestion,null);
  assert.equal(result.readyForYouItem,null);
  assert.equal(store.valReviewUpdates.length,0);
  assert.equal(store.sourceProcessingRecords[0].sourceReceiptJson.documentCount,0);
  assert.match(store.sourceProcessingRecords[0].noActionReceiptJson.reason,/No document evidence/);
});

test('relationship-sent documents create Project Managers and Leverage review surfaces',async()=>{
  const store={relationshipProfiles:[],valReviewUpdates:[],readyForYouItems:[],sourceProcessingRecords:[],preparedArtifactRecords:[],surfaceRegistrations:[]};
  const sourceEvents=[];
  const {sourceProcessing}=servicesFor(store,{afterSourceProcessed:async(event)=>{sourceEvents.push(event);return [{id:`packet_${event.record.id}`}];}});
  const result=await sourceProcessing.processRelationshipDocumentEmail({
    relationship:{admitted:true,id:'rel_anthony',name:'Anthony',email:'anthony@example.com'},
    source:{sourceType:'email_message',sourceId:'email_anthony_scope',subject:'Frisson partner scope',receivedAt:'2026-07-12T10:00:00Z'},
    documents:[{id:'doc_scope',title:'Frisson Scope.pdf',type:'scope',summary:'Scope and responsibilities for the Frisson partner work.'}],
    projectName:'Frisson Partner Scope'
  });

  assert.equal(result.ok,true);
  assert.equal(result.no_external_action,true);
  assert.equal(result.sourceProcessingRecord.executiveRelevanceJson.project_suggestion_eligible,true);
  assert.equal(result.sourceProcessingRecord.whatValDidReceipt.label,'What VAL did from this email');
  assert.match(result.sourceProcessingRecord.whatValDidReceipt.summary,/Stored the source receipt/);
  assert.match(result.sourceProcessingRecord.whatValDidReceipt.summary,/Project Managers yes\/no suggestion/);
  assert.equal(result.sourceProcessingRecord.metadataJson.whatValDidReceipt.noExternalAction,true);
  assert.equal(result.projectSuggestion.targetType,'suggested_project');
  assert.equal(result.projectSuggestion.updateType,'create_project_from_relationship_documents');
  assert.deepEqual(result.projectSuggestion.proposedValueJson.reviewActions.map(a=>a.label),[
    'Yes, create this project and assign it a manager',
    'No, this is not a project'
  ]);
  assert.equal(result.projectSuggestion.proposedValueJson.documentPlacement.includes('documents_drawer'),true);
  assert.equal(result.projectSuggestion.proposedValueJson.documentPlacement.includes('project_manager_page'),true);
  assert.equal(result.readyForYouItem.itemType,'suggested_project');
  assert.equal(result.readyForYouItem.metadataJson.reviewUpdateId,result.projectSuggestion.id);
  assert.deepEqual(result.surfaceRegistrations.map(r=>r.surface).sort(),['home_leverage','project_managers']);
  const projectSurface=result.surfaceRegistrations.find(r=>r.surface==='project_managers');
  assert.equal(projectSurface.metadataJson.projectName,'Frisson Partner Scope');
  assert.equal(projectSurface.metadataJson.documentCount,1);
  assert.equal(projectSurface.metadataJson.whatValDidReceipt.summary,result.sourceProcessingRecord.whatValDidReceipt.summary);
  assert.match(result.readyForYouItem.whatValDid,/Stored the source receipt/);
  assert.equal(result.readyForYouItem.metadataJson.whatValDidReceipt.summary,result.sourceProcessingRecord.whatValDidReceipt.summary);
  assert.equal(projectSurface.metadataJson.assignedProjectManager.name,result.projectSuggestion.proposedValueJson.assignedProjectManager.name);
  assert.equal(store.relationshipProfiles.length,0);
  assert.equal(sourceEvents.length,2);
  assert.equal(sourceEvents[0].sourceType,'email_message');
  assert.equal(sourceEvents[0].sourceId,'email_anthony_scope');
  assert.match(sourceEvents[0].rawText,/Frisson Scope\.pdf/);
  assert.equal(sourceEvents[1].sourceType,'task');
  assert.equal(sourceEvents[1].record.metadataJson.boardPacketType,'project_packet');
  assert.equal(sourceEvents[1].record.metadataJson.sourceProcessingRecordId,result.sourceProcessingRecord.id);
});

test('source-only document receipts notify the Board once without creating project work',async()=>{
  const store={relationshipProfiles:[],valReviewUpdates:[],readyForYouItems:[],sourceProcessingRecords:[],preparedArtifactRecords:[],surfaceRegistrations:[]};
  const sourceEvents=[];
  const {sourceProcessing}=servicesFor(store,{afterSourceProcessed:async(event)=>{sourceEvents.push(event);return [{id:`packet_${event.record.id}`}];}});
  const result=await sourceProcessing.processRelationshipDocumentEmail({
    relationship:{admitted:false,name:'Unknown Sender',email:'unknown@example.com'},
    source:{sourceType:'gmail_email',sourceId:'msg_unknown_doc',subject:'Random attachment'},
    documents:[{id:'doc_unknown_packet',title:'Random Proposal.pdf',type:'proposal',summary:'Proposal came from an unadmitted sender.'}]
  });
  assert.equal(result.sourceProcessingRecord.status,'no_action');
  assert.equal(result.projectSuggestion,null);
  assert.equal(result.readyForYouItem,null);
  assert.equal(sourceEvents.length,1);
  assert.equal(sourceEvents[0].sourceType,'gmail_email');
  assert.match(sourceEvents[0].rawText,/Random Proposal\.pdf/);
  assert.equal(sourceEvents[0].record.metadataJson.source,'relationship_document_email');
});

test('Google Drive shares count as relationship document evidence',async()=>{
  const store={relationshipProfiles:[],valReviewUpdates:[],readyForYouItems:[],sourceProcessingRecords:[],preparedArtifactRecords:[],surfaceRegistrations:[]};
  const {sourceProcessing}=servicesFor(store);
  const result=await sourceProcessing.processRelationshipDocumentEmail({
    relationship:{admitted:true,id:'rel_jordan',name:'Jordan',email:'jordan@example.com'},
    source:{sourceType:'gmail_email',sourceId:'email_drive_share',subject:'Jordan shared "Launch Scope" with you',receivedAt:'2026-07-12T11:00:00Z'},
    documents:[{
      id:'drive_doc_launch_scope',
      title:'Launch Scope',
      type:'google_doc',
      sourceType:'google_drive_share',
      sourceUrl:'https://docs.google.com/document/d/drive_doc_launch_scope/edit',
      summary:'Google Drive document shared by Jordan.'
    }],
    projectName:'Launch Scope'
  });

  assert.equal(result.ok,true);
  assert.equal(result.projectSuggestion.updateType,'create_project_from_relationship_documents');
  assert.equal(result.projectSuggestion.proposedValueJson.documents[0].sourceType,'google_drive_share');
  assert.equal(result.projectSuggestion.proposedValueJson.documentPlacement.includes('documents_drawer'),true);
  assert.equal(result.sourceProcessingRecord.sourceReceiptJson.documentCount,1);
  assert.match(result.whatValDidReceipt.summary,/routed 1 document to Documents/);
});

test('Project Managers surface registrations list only pending visible suggestions',async()=>{
  const store={relationshipProfiles:[],valReviewUpdates:[],valReviewUpdateAudit:[],readyForYouItems:[],sourceProcessingRecords:[],preparedArtifactRecords:[],surfaceRegistrations:[]};
  const {sourceProcessing,reviewUpdates}=servicesFor(store);
  const result=await sourceProcessing.processRelationshipDocumentEmail({
    relationship:{admitted:true,id:'rel_taylor',name:'Taylor',email:'taylor@example.com'},
    source:{sourceType:'email_message',sourceId:'email_taylor_scope',subject:'Partner agreement'},
    documents:[{id:'doc_agreement',title:'Partner Agreement.pdf',type:'agreement',summary:'Agreement for a possible project.'}],
    projectName:'Partner Agreement'
  });
  let surfaces=await sourceProcessing.listSurfaceRegistrations({surface:'project_managers',status:'visible',reviewStatus:'pending'});
  assert.equal(surfaces.ok,true);
  assert.equal(surfaces.surfaceRegistrations.length,1);
  assert.equal(surfaces.surfaceRegistrations[0].reviewUpdateId,result.projectSuggestion.id);

  await reviewUpdates.approve(result.projectSuggestion.id,{note:'yes, create this project and assign it a manager'});
  surfaces=await sourceProcessing.listSurfaceRegistrations({surface:'project_managers',status:'visible',reviewStatus:'pending'});
  assert.equal(surfaces.surfaceRegistrations.length,0);
});

test('approving suggested project creates one local project with owner and color-named manager',async()=>{
  const store={relationshipProfiles:[],valReviewUpdates:[],valReviewUpdateAudit:[],readyForYouItems:[],sourceProcessingRecords:[],preparedArtifactRecords:[],surfaceRegistrations:[]};
  const {sourceProcessing,reviewUpdates}=servicesFor(store);
  const result=await sourceProcessing.processRelationshipDocumentEmail({
    relationship:{admitted:true,id:'rel_anthony',name:'Anthony',email:'anthony@example.com'},
    source:{sourceType:'email_message',sourceId:'email_anthony_deck',subject:'Westwood launch deck'},
    documents:[{id:'doc_deck',title:'Launch Deck.pdf',type:'deck',summary:'Deck for the launch project.'}],
    projectName:'Westwood Launch'
  });
  const approved=await reviewUpdates.approve(result.projectSuggestion.id,{note:'yes, create this project and assign it a manager'});

  assert.equal(approved.status,'approved');
  assert.equal(store.relationshipProfiles.length,1);
  const project=store.relationshipProfiles[0];
  assert.equal(project.profileType,'project');
  assert.equal(project.displayName,'Westwood Launch');
  assert.equal(project.metadataJson.owner.name,'Anthony');
  assert.equal(project.metadataJson.owner.reassignment_options.includes('choose_existing_relationship'),true);
  assert.equal(project.metadataJson.owner.reassignment_options.includes('create_new_relationship'),true);
  assert.ok(project.metadataJson.assignedProjectManager.name);
  assert.ok(project.metadataJson.assignedProjectManager.hex);
  assert.equal(project.metadataJson.uploadedFiles[0].fileName,'Launch Deck.pdf');
  assert.deepEqual(project.metadataJson.documentPlacement,['documents_drawer','project_manager_page']);
  assert.equal(store.valReviewUpdateAudit[0].externalActionTaken,false);
});

test('non-relationship document senders do not create project suggestions or Leverage items',async()=>{
  const store={relationshipProfiles:[],valReviewUpdates:[],readyForYouItems:[],sourceProcessingRecords:[],preparedArtifactRecords:[],surfaceRegistrations:[]};
  const {sourceProcessing}=servicesFor(store);
  const result=await sourceProcessing.processRelationshipDocumentEmail({
    relationship:{admitted:false,name:'Unknown Sender',email:'unknown@example.com'},
    source:{sourceType:'email_message',sourceId:'email_unknown_docs',subject:'Attached docs'},
    documents:[{id:'doc_unknown',title:'Random Proposal.pdf',type:'proposal'}]
  });

  assert.equal(result.ok,true);
  assert.equal(result.projectSuggestion,null);
  assert.equal(result.readyForYouItem,null);
  assert.equal(result.surfaceRegistrations.length,0);
  assert.equal(store.valReviewUpdates.length,0);
  assert.equal(store.readyForYouItems.length,0);
  assert.equal(store.sourceProcessingRecords[0].status,'no_action');
  assert.match(store.sourceProcessingRecords[0].noActionReceiptJson.reason,/not an admitted relationship/);
  assert.match(store.sourceProcessingRecords[0].whatValDidReceipt.summary,/source-only/);
  assert.equal(result.whatValDidReceipt.summary,store.sourceProcessingRecords[0].whatValDidReceipt.summary);
});
