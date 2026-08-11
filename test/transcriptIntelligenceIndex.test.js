const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
const ui=fs.readFileSync(path.join(root,'command-center.js'),'utf8');
const hearth=fs.readFileSync(path.join(root,'hearth-prototype.js'),'utf8');
const dashboard=fs.readFileSync(path.join(root,'dashboard.html'),'utf8');

function transcriptSourceHelpersForTest(){
  const start=server.indexOf('function transcriptSourceItemText');
  const end=server.indexOf('function transcriptOverviewItemText',start);
  assert.ok(start>=0&&end>start,'source receipt helpers must be available');
  return Function(server.slice(start,end)+'; return {transcriptSourceReceipt,dedupeTranscriptDrawerRecords};')();
}
function sourceReceiptForTest(transcript={}){
  return transcriptSourceHelpersForTest().transcriptSourceReceipt(transcript);
}

test('creates transcript intelligence staging and evidence tables',()=>{
  for(const table of ['transcripts','transcript_participants','transcript_summaries','transcript_tasks','transcript_contact_updates','transcript_action_log','evidence_items','evidence_observations','val_evidence_links']){
    assert.match(server,new RegExp(`create table if not exists ${table} \\(`));
  }
  for(const column of ['source_url','occurred_at','captured_at','participants_json','entities_json','metadata_json']){
    assert.match(server,new RegExp(`${column} `));
  }
  for(const type of ['promise','commitment','task','decision','question','need','preference','risk','opportunity','relationship_signal','emotional_context','deadline','follow_up','idea']){
    assert.match(server,new RegExp(`'${type}'`));
  }
  assert.match(server,/evidence_items_source_idx/);
  assert.match(server,/evidence_observations_type_idx/);
  assert.match(server,/val_evidence_links_source_idx/);
  assert.match(server,/val_evidence_links_target_idx/);
});

test('saves raw transcripts before legacy storage and stages tasks before promotion',()=>{
  const saveStart=server.indexOf('async function saveTranscript(payload)');
  const rawSave=server.indexOf('await saveTranscriptIndexRaw(payload,indexId)',saveStart);
  const legacySave=server.indexOf("insert into val_transcripts",saveStart);
  assert.ok(rawSave>saveStart&&rawSave<legacySave,'raw index save must happen first');
  const processStart=server.indexOf('async function processTranscriptPayload(payload)');
  const stage=server.indexOf('await saveStagedTranscriptTask(staged)',processStart);
  const promote=server.indexOf('promoteTranscriptTask(staged)',stage);
  assert.ok(stage>processStart&&promote>stage,'task must be staged before promotion');
});

test('transcript action item generation uses layered gates instead of snippet extraction',()=>{
  assert.match(server,/Use this layered transcript process internally before producing JSON/);
  assert.match(server,/function transcriptActionItemPassesGate/);
  assert.match(server,/function normalizeTranscriptActionItems/);
  assert.match(server,/function normalizeTranscriptDecisions/);
  assert.match(server,/A transcript snippet is not an action item|Do not create tasks from jokes/);
  const fallbackStart=server.indexOf('function fallbackTranscriptSummary');
  const fallbackEnd=server.indexOf('async function processTranscriptPayload',fallbackStart);
  const fallbackBody=server.slice(fallbackStart,fallbackEnd);
  assert.match(fallbackBody,/extractFallbackTranscriptActionItems/);
  assert.doesNotMatch(fallbackBody,/\\b\\(I\\|we\\)\\s\\+\\(will\\|need to\\|can\\|should\\)/);
  const processStart=server.indexOf('async function processTranscriptPayload(payload)');
  const processEnd=server.indexOf('function transcriptUiRecord',processStart);
  const processBody=server.slice(processStart,processEnd);
  assert.match(processBody,/parsed=normalizeTranscriptAnalysis\(parsed,transcript\)/);
});

test('requires evidence, confidence, review state, and action traceability',()=>{
  assert.match(server,/source_quote text not null/);
  assert.match(server,/match_confidence numeric not null/);
  assert.match(server,/needs_review boolean not null/);
  assert.match(server,/async function saveEvidenceItem/);
  assert.match(server,/async function saveEvidenceObservation/);
  assert.match(server,/async function runObservationEngine/);
  assert.match(server,/normalizeObservationCandidate/);
  assert.match(server,/saveTranscriptEvidenceObservations/);
  assert.match(server,/runObservationEngine\(evidence,\{candidates,replace:true\}\)/);
  assert.match(server,/async function saveEvidenceLink/);
  assert.match(server,/async function listEvidenceLinks/);
  assert.match(server,/async function saveRelationshipProjectLink/);
  assert.match(server,/async function saveCalendarProjectLink/);
  assert.match(server,/relationship:'extracted_task'/);
  assert.match(server,/relationship:'linked_to_project'/);
  assert.match(server,/relationship:'meeting_context_for_project'/);
  assert.match(server,/relationship:'created_task'/);
  assert.match(server,/relationship:'created_followup_draft'/);
  assert.match(server,/clearEvidenceLinksForTranscript/);
  assert.match(server,/logTranscriptAction\(sourceId,'failed_action'/);
  assert.match(server,/Ambiguous match:/);
});

test('canonical transcript pipeline preserves conversations, identities, and decisions',()=>{
  for(const table of ['identity_links','val_decisions']){
    assert.match(server,new RegExp(`create table if not exists ${table} \\(`));
  }
  for(const column of ['entity_type','entity_id','normalized_value','conversation_id','evidence_ids_json','relationship_ids_json','project_ids_json']){
    assert.match(server,new RegExp(`${column} `));
  }
  assert.match(server,/async function saveIdentityLink/);
  assert.match(server,/async function saveValDecision/);
  assert.match(server,/async function valCanonicalForTranscript/);
  assert.match(server,/async function attachCanonicalTranscriptDetail/);
  assert.match(server,/async function valDecisionReviewQueue/);
  assert.match(server,/app\.post\('\/api\/val\/decisions\/:decisionId\/review'/);
  assert.match(server,/async function saveTranscriptCanonicalPipeline/);
  assert.match(server,/canonicalType:'conversation'/);
  assert.match(server,/relationship:'captured_as_conversation'/);
  assert.match(server,/relationship:participant\.needsReview\?'candidate_identity':'matched_identity'/);
  assert.match(server,/relationship:'extracted_decision'/);
  assert.match(server,/decisionType:'draft_intent'/);
  assert.match(server,/source:'transcript_decision'/);
  assert.match(server,/decisionId:draftIntent\?\.id/);
  assert.match(server,/relationship:'prepared_draft'/);
  assert.match(server,/status:'needs_review'/);
  assert.match(server,/clearValDecisionsForSource\('transcript',transcriptId\)/);
  assert.match(server,/transcript\.canonical=await valCanonicalForTranscript\(transcript\.id\)/);
  assert.match(server,/const decisions=\(await valDecisionReviewQueue\(\)\)\.filter/);
  assert.match(ui,/Canonical structure/);
  assert.match(ui,/reviewValDecision/);
  const processStart=server.indexOf('async function processTranscriptPayload(payload)');
  const observations=server.indexOf('saveTranscriptEvidenceObservations({sourceId,title,transcript,parsed,participants,summary})',processStart);
  const canonical=server.indexOf('saveTranscriptCanonicalPipeline({sourceId,title,transcript,payload,parsed,participants,summary,observations})',processStart);
  const drafts=server.indexOf('const recapDraft=await saveMeetingRecapDraft(',processStart);
  assert.ok(observations>processStart&&canonical>observations,'canonical pipeline should run after evidence observations');
  assert.ok(drafts>canonical,'draft creation should happen after canonical conversation and decision capture');
});

test('relationship engine builds living profiles from observations without creating tasks',()=>{
  for(const table of ['relationship_profiles','relationship_timeline_events']){
    assert.match(server,new RegExp(`create table if not exists ${table} \\(`));
  }
  for(const column of ['profile_type','profile_key','last_observed_at','observation_count','open_loops_json','relationship_signals_json','risks_json','opportunities_json','preferences_json']){
    assert.match(server,new RegExp(`${column} `));
  }
  assert.match(server,/async function runRelationshipEngineForObservations/);
  assert.match(server,/async function saveRelationshipProfile/);
  assert.match(server,/async function saveRelationshipTimelineEvent/);
  assert.match(server,/function relationshipTargetsForObservation/);
  assert.match(server,/relationshipObservationIsNoise/);
  assert.match(server,/\['spam','newsletter','receipt'\]/);
  assert.match(server,/clearRelationshipTimelineForEvidence\(evidenceItem\.id\)/);
  assert.match(server,/runRelationshipEngineForObservations\(evidenceItem,observations\)/);
  assert.doesNotMatch(server,/runRelationshipEngineForObservations[\s\S]{0,1200}saveTask/);
});

test('agency engine ranks discerning moves without turning observations into tasks',()=>{
  for(const table of ['agency_moves','agency_move_sources']){
    assert.match(server,new RegExp(`create table if not exists ${table} \\(`));
  }
  for(const column of ['move_type','why','confidence','importance_score','agency_level','priority_band','what_changed','if_ignored','source_observation_ids','source_evidence_ids']){
    assert.match(server,new RegExp(`${column} `));
  }
  for(const move of ['draft_reply','send_follow_up','schedule_meeting','send_document','answer_question','review_risk','close_open_loop','wait','ignore','update_project','protect_relationship']){
    assert.match(server,new RegExp(`'${move}'`));
  }
  for(const band of ['top_recommended','also_important','quiet','watching','ignored']){
    assert.match(server,new RegExp(`'${band}'`));
  }
  assert.match(server,/async function runAgencyEngineForObservations/);
  assert.match(server,/function agencyMovePlanForObservation/);
  assert.match(server,/function agencyMoveTitleForObservation/);
  assert.match(server,/function agencyContentSubject/);
  assert.doesNotMatch(server,/title:'Review relationship or project risk'/);
  assert.match(server,/function agencyImportance/);
  assert.match(server,/function agencyPriorityBand/);
  assert.match(server,/async function saveAgencyMove/);
  assert.match(server,/async function saveAgencyMoveSource/);
  assert.match(server,/clearAgencyMovesForEvidence\(evidenceItem\.id\)/);
  assert.match(server,/runAgencyEngineForObservations\(evidenceItem,observations\)/);
  assert.match(server,/if\(topCount>3\)item\.plan\.priorityBand='also_important'/);
  assert.match(server,/moveType:'ignore'/);
  assert.match(server,/moveType:'wait'/);
  assert.doesNotMatch(server,/runAgencyEngineForObservations[\s\S]{0,2500}saveTask/);
});

test('exposes inbox, detail, and review queue UI',()=>{
  assert.match(ui,/Transcript Intelligence/);
  assert.match(ui,/Review Queue/);
  assert.match(ui,/Intake Status/);
  assert.match(ui,/only uncertain items from real transcripts appear here/);
  assert.match(ui,/No transcripts yet/);
  assert.match(ui,/Co-Work on This Transcript/);
  assert.match(ui,/Processing details/);
  assert.match(ui,/Approve & Create/);
});

test('hides planning artifacts from transcript inbox and review queue',()=>{
  assert.match(server,/function isNonTranscriptArtifact/);
  assert.match(server,/chat\|relationship/);
  assert.match(server,/Help me brainstorm and plan this task/);
  assert.match(server,/This task is really about/);
  assert.match(server,/Ask or document the current version of these steps/);
  assert.match(server,/Break it into clear steps/);
  assert.match(server,/function transcriptReviewParticipantIsUseful/);
  assert.match(server,/function transcriptReviewData/);
  assert.match(server,/validIds\.has\(String\(row\.transcriptId/);
  assert.match(server,/row\.meetingTitle\|\|row\.meeting_title/);
  assert.match(ui,/only uncertain items from real transcripts appear here/);
});

test('exposes transcript intake diagnostics for webhook and upload tracing',()=>{
  assert.match(server,/app\.get\('\/api\/val\/transcripts\/intake-status'/);
  assert.match(server,/recentTranscriptIndexRowsRaw/);
  assert.match(server,/rawCanonicalRows/);
  assert.match(server,/val_file_uploaded_transcript/);
  assert.match(server,/tokenPreview/);
  assert.match(server,/app\.all\('\/api\/val\/transcripts\/ping'/);
  assert.match(server,/headers\.authorization/);
  assert.match(server,/x-webhook-token/);
  assert.match(server,/express\.urlencoded/);
  assert.match(server,/transcriptTextFromNoteValue/);
  assert.match(server,/transcript_webhook_received_without_text/);
  assert.match(server,/needsTranscriptText/);
  assert.match(server,/webhookAcceptedWithoutTranscriptText/);
  assert.match(server,/recentNoTextWebhooks/);
  assert.match(server,/transcriptWebhookBodyPreview/);
  assert.match(ui,/renderTranscriptIntakeStatus/);
  assert.match(ui,/Raw canonical rows/);
  assert.match(ui,/Accepted webhooks without transcript text/);
  assert.match(ui,/Accepted, no transcript text/);
  assert.match(ui,/Recent intake audit/);
  assert.match(ui,/onclick="renderTranscriptIntakeStatus\(\)">Intake Status/);
  assert.match(dashboard,/function testTranscriptWebhook/);
  assert.match(dashboard,/Run Test/);
  assert.match(dashboard,/Recent webhook\/storage receipts/);
});

test('recovers transcript-shaped content from existing VAL storage',()=>{
  assert.match(server,/function storedTextLooksLikeTranscript/);
  assert.match(server,/async function storedTranscriptRecoveryCandidates/);
  assert.match(server,/function storedTranscriptCandidatePayload/);
  assert.match(server,/normalizedTranscriptWebhookPayload\(parsed\)/);
  assert.match(server,/recentTranscripts\(days\)\.catch/);
  assert.match(server,/archive\.forEach\(row=>push\(row,'val_transcripts'\)\)/);
  assert.match(server,/recentEvidenceTextRows/);
  assert.match(server,/recentConversationTextRows/);
  assert.match(server,/recentTeachValTextRows/);
  assert.match(server,/app\.post\('\/api\/val\/transcripts\/recover-existing'/);
  assert.match(server,/stored_transcript_recovery_run/);
  assert.match(server,/app\\.krisp\\.ai/);
  assert.match(server,/krispLinkedRows/);
  assert.match(server,/purgeJessaRecoveredNonKrispTranscripts/);
  assert.match(server,/jessaRequiresKrispTranscripts/);
  assert.match(ui,/Krisp-linked records/);
  assert.match(ui,/Purged recovered trash/);
  assert.match(ui,/recoverStoredTranscripts/);
  assert.match(ui,/Scanning VAL memory, evidence, conversations, uploads, and Teach VAL records/);
});

test('transcript inbox supports direct upload and clearing broken transcript archives',()=>{
  assert.match(server,/app\.delete\('\/api\/val\/transcripts\/clear-all'/);
  assert.match(server,/clearAllTranscriptDataForTenant/);
  assert.match(server,/requireJessa:true/);
  assert.match(server,/docType:inferredDocType/);
  assert.match(server,/val_file_upload_transcript/);
  assert.match(ui,/Upload Transcript/);
  assert.match(ui,/chooseTranscriptUpload/);
  assert.match(ui,/uploadTranscriptFiles/);
  assert.match(ui,/body\.append\('docType','transcript'\)/);
  assert.match(ui,/body\.append\('uploadedVia','transcript_tab_upload'\)/);
  assert.match(ui,/clearTranscriptArchive/);
  assert.match(ui,/Clear Transcript Data/);
});

test('fallback summaries are not counted as hard processing failures',()=>{
  assert.match(server,/function isHardTranscriptProcessingFailure/);
  assert.match(server,/summary==='fallback_complete'&&processing==='complete'/);
  assert.match(server,/failedProcessing:allMapped\.filter\(isHardTranscriptProcessingFailure\)\.length/);
});

test('transcript detail uses a typed transcript Working Brief instead of freeform transcript chat',()=>{
  for(const label of ['Summary','Transcript','Co-Work on This Transcript','Processing details']){
    assert.ok(ui.includes(label),`missing ${label}`);
  }
  assert.match(server,/async function loadTranscriptForCowork/);
  assert.match(server,/async function prepareCoworkTranscriptMeetingOverview/);
  assert.doesNotMatch(server,/app\.post\('\/api\/val\/transcripts\/:transcriptId\/chat'/);
  assert.match(server,/function cleanTranscriptForUi/);
  assert.match(server,/function cleanTranscriptSummaryForUi/);
  assert.match(server,/function cleanTranscriptTitleForUi/);
  assert.match(server,/transcript\.drafts=\(await listDrafts\(\)\)\.filter/);
  assert.match(server,/req\.query\.transcriptId/);
});

test('stores meeting recap templates and creates source-grounded transcript overview drafts',()=>{
  assert.match(server,/create table if not exists val_templates \(/);
  assert.match(server,/DEFAULT_MEETING_RECAP_TEMPLATE/);
  assert.match(server,/TRANSCRIPT_ACTION_ITEMS_TEMPLATE_KEY='transcript_action_items_email'/);
  assert.match(server,/DEFAULT_TRANSCRIPT_ACTION_ITEMS_TEMPLATE/);
  assert.match(server,/settings_json jsonb not null default '\{\}'/);
  assert.match(server,/alter table val_templates add column if not exists settings_json/);
  assert.match(server,/app\.get\('\/api\/val\/templates\/:templateKey'/);
  assert.match(server,/app\.put\('\/api\/val\/templates\/:templateKey'/);
  assert.match(server,/saveMeetingRecapDraft/);
  assert.match(server,/draftType:'meeting_recap'/);
  assert.match(server,/function transcriptOverviewEmailBody/);
  assert.match(server,/function renderTranscriptActionItemsEmailTemplate/);
  assert.match(server,/deliveryMode:String\(template\.settings\?\.deliveryMode/);
  assert.match(server,/async function executeTranscriptActionItemsAttendeeEmailAutoSend/);
  assert.match(server,/if\(packet\.status==='executed'\|\|packet\.executedAt\|\|packet\.executed_at\)/);
  assert.match(server,/alreadyExecuted:true/);
  assert.match(server,/autoSendScope:'all_future_transcripts'/);
  assert.match(server,/prepareTranscriptActionItemsAttendeeEmailDraft\(\{[\s\S]*id:sourceId/);
  assert.match(server,/action_items_attendee_email_auto_sent/);
  assert.match(server,/function transcriptSourceReceipt/);
  assert.match(server,/return String\(overview\.body\|\|transcriptSourceReceipt\(transcript\)\.body\|\|''\)\.trim\(\)/);
  assert.match(server,/source:'transcript_meeting_overview'/);
  assert.match(server,/executionPath:'create_provider_draft_then_human_send'/);
});

test('preserves every Krisp action item and key point word for word in the source receipt',()=>{
  const exactKrispText=[
    'Action Items',
    'Anthony to send the website link to Jessa and Aric.',
    'Speaker 2 to set up the CRM for the Forever Freedom project.',
    '',
    'Key Points',
    'Purpose of the call: follow up on the Forever Freedom project.',
    'CRM ownership was discussed; Anthony indicated he had held off assigning it.'
  ].join('\n');
  const receipt=sourceReceiptForTest({rawTranscript:exactKrispText});
  assert.equal(receipt.body,exactKrispText);
  assert.deepEqual(receipt.actionItems,[
    'Anthony to send the website link to Jessa and Aric.',
    'Speaker 2 to set up the CRM for the Forever Freedom project.'
  ]);
  assert.deepEqual(receipt.keyPoints,[
    'Purpose of the call: follow up on the Forever Freedom project.',
    'CRM ownership was discussed; Anthony indicated he had held off assigning it.'
  ]);
});

test('uses the complete structured Krisp receipt and never substitutes generated transcript analysis',()=>{
  const actionItems=Array.from({length:9},(_,index)=>({
    title:`Exact Krisp action ${index+1}`,
    assignee:{first_name:index%2?'Ed':'Jessa'},
    due_date:index===0?'2026-08-15T00:00:00.000Z':null
  }));
  const keyPoints=Array.from({length:15},(_,index)=>({
    description:`Exact Krisp key point ${index+1}: ${'source detail '.repeat(index===14?28:2).trim()}`
  }));
  const receipt=sourceReceiptForTest({
    sourcePayloadMetadata:{data:{sections:{action_items:actionItems,key_points:keyPoints}}},
    summary:{executiveSummary:'VAL generated summary that must not replace Krisp.'},
    actionItems:['VAL generated task that must not replace Krisp.']
  });
  assert.equal(receipt.native,true);
  assert.equal(receipt.ready,true);
  assert.equal(receipt.actionItems.length,9);
  assert.equal(receipt.keyPoints.length,15);
  assert.match(receipt.actionItems[0],/^Exact Krisp action 1 - Jessa Due: Aug 14$/);
  assert.equal(receipt.keyPoints[14],keyPoints[14].description);
  assert.doesNotMatch(receipt.body,/VAL generated/);

  const rawOnly=sourceReceiptForTest({
    rawTranscript:'Jessa: We should think about this later.',
    summary:{executiveSummary:'VAL generated summary.'},
    actionItems:['VAL generated task.']
  });
  assert.equal(rawOnly.native,false);
  assert.equal(rawOnly.ready,false);
  assert.deepEqual(rawOnly.actionItems,[]);
  assert.deepEqual(rawOnly.keyPoints,[]);
});

test('Transcript display never falls back to VAL-generated tasks or truncates Krisp Key Points',()=>{
  assert.match(server,/const sourceActions=sourceReceipt\.actionItems/);
  assert.doesNotMatch(hearth,/keyPoints:[^\n]*item\.length <= 260/);
  assert.match(hearth,/function timelineTranscriptTasks\(transcript = \{\}\)\{\s*return timelineNativeActionItems\(transcript\);\s*\}/);
  const nativeStart=hearth.indexOf('function timelineNativeActionItems');
  const nativeEnd=hearth.indexOf('function timelineTranscriptTasks',nativeStart);
  assert.doesNotMatch(hearth.slice(nativeStart,nativeEnd),/transcript\.actionItems|transcript\.tasks|nativeActionItems/);
});

test('transcript auto-send keys paired Krisp events by the nested native meeting id',()=>{
  const start=server.indexOf('async function executeTranscriptActionItemsAttendeeEmailAutoSend');
  const end=server.indexOf('function transcriptActionItemsHtml',start);
  const block=server.slice(start,end);
  assert.match(block,/const sourceData=metadata\.data/);
  assert.match(block,/sourceData\.meeting/);
  assert.match(block,/metadata\.sourcePayloadMetadata\?\.data\?\.meeting\?\.id/);
  assert.match(block,/singleExecutionKey=`transcript_followup:\$\{meetingIdentity\}:\$\{recipientIdentity\}`/);
});

test('shows one trustworthy Krisp receipt when the same meeting is ingested twice',()=>{
  const {dedupeTranscriptDrawerRecords}=transcriptSourceHelpersForTest();
  const rows=dedupeTranscriptDrawerRecords([
    {
      id:'full-transcript-copy',
      source:'krisp',
      title:'Monday Touch Point w/Jessa · Jul 13, 2026',
      createdAt:'2026-07-13T15:35:16.000Z',
      sourceReceipt:{body:'Action Items\\n'+Array(470).fill('Speaker line from the full transcript.').join('\\n'),actionItems:Array(470).fill('Speaker line from the full transcript.'),keyPoints:[]}
    },
    {
      id:'krisp-receipt',
      source:'krisp',
      title:'Monday Touch Point w/Jessa · Jul 13, 2026',
      createdAt:'2026-07-13T15:34:49.000Z',
      sourceReceipt:{body:'Action Items\\n- [ ] Send the follow-up.\\n\\nKey Points\\n- The follow-up is ready.',actionItems:['- [ ] Send the follow-up.'],keyPoints:['- The follow-up is ready.']}
    }
  ]);
  assert.deepEqual(rows.map(row=>row.id),['krisp-receipt']);
});

test('creates transcript tasks from the exact Krisp action line',()=>{
  assert.match(server,/async function createCoworkTranscriptActionItem/);
  assert.match(server,/taskTitle:exactActionItem/);
  assert.match(server,/sourceQuote:exactActionItem/);
  assert.match(server,/preserveSourceTitle:true/);
  assert.doesNotMatch(server,/app\.post\('\/api\/val\/transcripts\/:transcriptId\/actions'/);
});

test('Home task projection uses the canonical transcript owner and consolidates repeated Action Items',()=>{
  assert.match(server,/async function canonicalTranscriptTaskProjection/);
  assert.match(server,/\[tenantId\(\),VAL_USER_ID,bounded\]/);
  assert.match(server,/function executiveTranscriptTaskTitle/);
  assert.match(server,/function mergeTranscriptTaskProjection/);
  assert.match(server,/related_task_ids/);
  assert.match(server,/tt\.task_id=any\(\$1::text\[\]\)/);
});

test('exposes drafts and settings templates navigation',()=>{
  assert.match(ui,/\['drafts','✎','Drafts'\]/);
  assert.match(ui,/\['settings_templates','▤','Templates'\]/);
  assert.match(ui,/settings_templates:'openTemplatesPage'/);
  assert.match(ui,/drafts:'openDraftsPage'/);
  assert.match(dashboard,/function openTemplatesPage/);
  assert.match(dashboard,/function openDraftsPage/);
  assert.match(dashboard,/meetingRecapSubjectTemplate/);
  assert.match(dashboard,/api\/val\/templates\/meeting_recap/);
  assert.match(dashboard,/api\/val\/drafts/);
  assert.match(ui,/Meeting Recaps & Drafts/);
  assert.match(dashboard,/Related|Transcript:|Meeting:|Recipients:/);
});

test('Hearth transcript drawer exposes Action Items email templates and delivery mode',()=>{
  assert.match(hearth,/function renderTranscriptEmailTemplateSettings\(\)/);
  assert.match(hearth,/data-transcript-template-subject/);
  assert.match(hearth,/data-transcript-template-body/);
  assert.match(hearth,/name="transcriptDeliveryMode"/);
  assert.match(hearth,/Global transcript follow-up setting/);
  assert.match(hearth,/Applies to every transcript VAL receives/);
  assert.match(hearth,/Hold all in drafts/);
  assert.match(hearth,/Send all automatically/);
  assert.match(hearth,/data-transcript-delivery-mode/);
  assert.match(hearth,/api\/val\/templates\/transcript_action_items_email/);
  assert.match(hearth,/data-transcript-action="save_email_template"/);
  assert.match(hearth,/data-transcript-action="prepare_attendee_email"/);
  assert.match(hearth,/drawerTray\.addEventListener\('change'[\s\S]*saveTranscriptEmailTemplateSettings/);
});
