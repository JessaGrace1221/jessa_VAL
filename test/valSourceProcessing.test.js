const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const {VAL_SOURCE_PROCESSING_SQL}=require('../services/valSourceProcessingSchema');
const {createValSourceProcessingService}=require('../services/valSourceProcessing');
const {createValReviewUpdatesService}=require('../services/valReviewUpdates');
const {createValReadyForYouService}=require('../services/valReadyForYou');

const root=path.join(__dirname,'..');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
const routes=fs.readFileSync(path.join(root,'services','valSourceProcessingRoutes.js'),'utf8');

function servicesFor(store){
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
  const sourceProcessing=createValSourceProcessingService({...deps,reviewUpdatesService:reviewUpdates,readyForYouService:readyForYou,listProjectProfiles:async()=>store.relationshipProfiles?.filter(p=>p.profileType==='project')||[]});
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
  assert.match(routes,/\/api\/val\/source-processing\/records/);
  assert.match(routes,/\/api\/val\/source-processing\/surface-registrations/);
  assert.match(routes,/listSurfaceRegistrations/);
  assert.match(routes,/allowRelationshipDocumentEmailPost/);
  assert.match(routes,/Authentication required/);
  assert.match(server,/allowRelationshipDocumentEmailPost:\(\)=>!requestContext\.getStore\(\)\?\.publicHearthTest/);
});

test('live email document intake routes admitted relationship attachments through source processing',()=>{
  assert.match(server,/function extractGmailAttachments/);
  assert.match(server,/function normalizeOutlookAttachment/);
  assert.match(server,/function sourceProcessingDocumentsFromEmail/);
  assert.match(server,/function processEmailDocumentSourceProcessing/);
  assert.match(server,/sourceProcessingAttachmentLooksLikeDocument/);
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
  assert.match(emailPayload,/processEmailDocumentSourceProcessing\(emails,\{origin:'email_intelligence'\}/);
  assert.match(emailPayload,/sourceProcessing:\{projectManagers:projectManagerIntake\}/);
  assert.match(emailPayload,/projectManagerSuggestions:projectManagerIntake\.suggestions/);
  assert.match(server,/whatValDidReceipt:result\.whatValDidReceipt\|\|result\.what_val_did_receipt/);
  assert.match(server,/whatValDidReceipt:result\.whatValDidReceipt\|\|null/);
});

test('relationship-sent documents create Project Managers and Leverage review surfaces',async()=>{
  const store={relationshipProfiles:[],valReviewUpdates:[],readyForYouItems:[],sourceProcessingRecords:[],preparedArtifactRecords:[],surfaceRegistrations:[]};
  const {sourceProcessing}=servicesFor(store);
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
