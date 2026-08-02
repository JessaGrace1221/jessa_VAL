'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
const ui=fs.readFileSync(path.join(root,'command-center.js'),'utf8');
const css=fs.readFileSync(path.join(root,'command-center.css'),'utf8');
const hearthJs=fs.readFileSync(path.join(root,'hearth-prototype.js'),'utf8');
const hearthHtml=fs.readFileSync(path.join(root,'hearth-prototype.html'),'utf8');
const hearthCss=fs.readFileSync(path.join(root,'hearth-prototype.css'),'utf8');
const krispService=fs.readFileSync(path.join(root,'services/krispMcpService.js'),'utf8');
const coworkService=fs.readFileSync(path.join(root,'services/valCowork.js'),'utf8');

test('webhook accepts common transcript payload shapes and accepts note-only events',()=>{
  assert.match(server,/function normalizedTranscriptWebhookPayload/);
  assert.match(server,/function parseTranscriptWebhookRequestBody/);
  assert.match(server,/express\.raw\(\{type:'\*\/\*',limit:'50mb'\}\)/);
  assert.match(server,/return res\.status\(200\)\.json\(\{ok:true,accepted:true/);
  for(const field of ['rawText','raw_text','transcriptText','transcript_text','text','content','body','segments','sentences','utterances','speakerTurns'])assert.ok(server.includes(field));
  assert.match(server,/transcript_webhook_received_without_text/);
  assert.match(server,/needsTranscriptText/);
  assert.match(server,/\[transcripts\] webhook received/);
  assert.match(server,/\[transcripts\] saved successfully/);
  assert.match(server,/\[transcripts\] save failed/);
});

test('transcript ingress stays disabled until explicitly enabled and never exposes its callback token',()=>{
  const infoStart=server.indexOf('function transcriptWebhookInfo');
  const infoEnd=server.indexOf('function requestBaseUrl',infoStart) > infoStart
    ? server.indexOf('function requestBaseUrl',infoStart)
    : server.indexOf('function parseTranscriptWebhookRequestBody',infoStart);
  const webhookInfo=server.slice(infoStart,infoEnd);
  const statusRouteStart=server.indexOf("app.get('/api/val/transcripts/webhook'");
  const statusRouteEnd=server.indexOf("app.all('/api/val/transcripts/ping'",statusRouteStart);
  const statusRoute=server.slice(statusRouteStart,statusRouteEnd);
  const ingressStart=server.indexOf("app.post('/api/val/transcripts',express.raw");
  const ingressEnd=server.indexOf("app.post('/api/val/transcripts/tasks/:taskId/approve'",ingressStart);
  const ingressRoute=server.slice(ingressStart,ingressEnd);

  assert.match(server,/function transcriptIngressEnabled\(\)/);
  assert.match(server,/VAL_TRANSCRIPT_INGEST_ENABLED/);
  assert.match(server,/if\(!transcriptIngressEnabled\(\)\) return false/);
  assert.doesNotMatch(webhookInfo,/\?token=/);
  assert.doesNotMatch(webhookInfo,/transcriptWebhookToken\(\)/);
  assert.match(statusRoute,/requireAuth,requirePermission\('settings:manage'\)/);
  assert.match(ingressRoute,/if\(!transcriptIngressEnabled\(\)\) return res\.status\(403\)/);
});

test('webhook normalizes Krisp-style speaker turn payloads',()=>{
  assert.match(server,/krispSamplePayload/);
  assert.match(server,/function transcriptTurnsFromValue/);
  assert.match(server,/\['content','segments','sentences','utterances'/);
  assert.match(server,/raw_content/);
  assert.match(server,/raw_meeting/);
  assert.match(server,/speaker_turns/);
  assert.match(server,/utterances/);
  assert.match(server,/monologues/);
  assert.match(server,/function transcriptTurnSpeaker/);
  assert.match(server,/function transcriptTurnTime/);
  assert.match(server,/function transcriptTurnText/);
  assert.match(server,/participants:\[\{name:'Jessa'\},\{name:'Aric'/);
  assert.match(server,/krispDetected/);
});

test('transcript metadata is flattened and processing results are persisted',()=>{
  assert.match(server,/const nested=payload\.metadata&&typeof payload\.metadata===\'object\'/);
  assert.match(server,/function updateTranscriptMetadata/);
  assert.match(server,/reviewStatus:\'needs_review\'/);
  assert.match(server,/processing failed after durable save/);
  assert.match(server,/fallbackTranscriptSummary/);
  assert.match(server,/process_endpoint/);
});

test('retrieval merges dedicated transcript storage with legacy durable memory',()=>{
  assert.match(server,/function transcriptArchiveRecords/);
  assert.match(server,/Promise\.all\(\[recentTranscripts\(days\),recentMemoryItems/);
  assert.match(server,/recoveredFrom:\'val_memory_items\'/);
  assert.match(server,/legacyGroups/);
});

test('transcript retrieval excludes meeting prep prompts and chat memory',()=>{
  assert.match(server,/function isMeetingPrepMemoryText/);
  assert.match(server,/Prepare me for this upcoming meeting using attendee intelligence/);
  assert.match(server,/function isUsableTranscriptArchiveRecord/);
  assert.match(server,/String\(type\|\|''\)\.toLowerCase\(\)===\'chat_memory\'/);
  assert.match(server,/function isUsableTranscriptIndexRow/);
  assert.match(server,/filter\(isUsableTranscriptIndexRow\)/);
  assert.match(server,/saveTranscriptIndexRaw[\s\S]{0,260}isUsableTranscriptArchiveRecord/);
});

test('transcript page includes VAL conversation transcripts without calling them meetings',()=>{
  assert.match(server,/const task=text\.match\(/);
  assert.match(server,/Planning: /);
  assert.match(server,/function valConversationSummaryFromText/);
  assert.match(ui,/Co-Work on This Transcript/);
  assert.doesNotMatch(ui,/Chat About This Meeting/);
  assert.match(ui,/Choose a transcript from the left/);
});

test('transcript titles reject command labels and prefer real topics',()=>{
  assert.match(server,/function transcriptTopicTitleFromText/);
  assert.match(server,/prepare me for\|summarize this past meeting\|meeting prep/);
  assert.match(server,/speaker\|user\|time\|date\|summary\|system\|assistant/);
  assert.match(server,/const topic=transcriptTopicTitleFromText/);
});

test('transcript titles stay grounded when calendar title contradicts GOALL content',()=>{
  assert.match(server,/function transcriptKnownContentTitle/);
  assert.ok(server.includes('GOALL'));
  assert.ok(server.includes('Goal Agency'));
  assert.ok(server.includes('agency call center'));
  assert.ok(server.includes('projections dashboard'));
  assert.match(server,/function transcriptTitleConflictsWithContent/);
  assert.match(server,/mammogram\|screening\|wang building\|annual screening/);
  assert.match(server,/calendar title contradicts transcript content/);
});

test('retrieval returns required fields and accurate counters',()=>{
  for(const field of ['receivedAt','reviewStatus','openActionCount','sourcePayloadMetadata','company','contactName'])assert.ok(server.includes(field));
  assert.match(server,/\['new','unreviewed','needs_review'\]\.includes\(t\.reviewStatus\)/);
  assert.match(server,/Number\(t\.openActionCount\|\|t\.taskCount\|\|0\)>0/);
  assert.match(server,/\[transcripts\] retrieval requested/);
  assert.match(server,/\[transcripts\] retrieval failed/);
});

test('frontend distinguishes loading failure from a successful empty archive',()=>{
  assert.match(ui,/data\.ok===false\|\|!Array\.isArray\(data\.transcripts\)/);
  assert.match(ui,/Unable to load transcripts/);
  assert.match(ui,/Check the transcript retrieval endpoint or server logs/);
  assert.match(ui,/No transcripts yet/);
  assert.match(ui,/renderTranscriptLoading/);
});

test('refresh reloads the full durable archive and updates counts',()=>{
  assert.match(ui,/api\/val\/transcripts\?days=3650&limit=100&offset=/);
  assert.match(ui,/transcriptState\.pagination=data\.pagination/);
  assert.match(ui,/loadMoreTranscripts/);
  assert.match(ui,/onclick="loadTranscripts\(true\)\.catch/);
  assert.match(ui,/transcriptState\.counts=data\.counts/);
  assert.match(ui,/updateCommandCenterBadges/);
  assert.match(ui,/lastLoadedAt=new Date\(\)\.toISOString/);
});

test('pending transcript repair can reprocess stuck received rows',()=>{
  assert.match(server,/app\.post\('\/api\/val\/transcripts\/repair'/);
  assert.match(server,/processExistingTranscriptRecord/);
  assert.match(server,/processingStatus:'failed',summaryStatus:'fallback_complete'/);
  assert.match(server,/participant_matching/);
  assert.match(ui,/function transcriptHeader/);
  assert.match(ui,/Process Pending/);
  assert.match(ui,/repairTranscriptProcessing/);
  assert.match(ui,/api\/val\/transcripts\/repair/);
});

test('uploaded transcript files enter transcript intelligence instead of generic memory only',()=>{
  assert.match(server,/function isUploadedTranscriptDocType/);
  assert.match(server,/val_file_upload_transcript/);
  assert.match(server,/type:isTranscriptUpload\?'processed_transcript':'knowledge_document'/);
  assert.match(server,/processTranscriptPayload\(\{/);
  assert.match(server,/uploadedVia:req\.body\.uploadedVia\|\|'val_file_upload'/);
});

test('Teach VAL can upload old transcript files into the transcript pipeline',()=>{
  assert.match(fs.readFileSync(path.join(root,'dashboard.html'),'utf8'),/function teachValTranscriptUploadHtml/);
  assert.match(fs.readFileSync(path.join(root,'dashboard.html'),'utf8'),/Upload Existing Transcripts/);
  assert.match(fs.readFileSync(path.join(root,'dashboard.html'),'utf8'),/fd\.append\('docType','transcript'\)/);
  assert.match(fs.readFileSync(path.join(root,'dashboard.html'),'utf8'),/teach_val_transcript_upload/);
  assert.match(fs.readFileSync(path.join(root,'dashboard.html'),'utf8'),/loadTranscripts\(false\)/);
  assert.match(fs.readFileSync(path.join(root,'dashboard.html'),'utf8'),/window\.teachValUploadTranscripts=function/);
  assert.match(fs.readFileSync(path.join(root,'dashboard.html'),'utf8'),/window\.teachValTranscriptFilesChanged=function/);
  assert.match(fs.readFileSync(path.join(root,'dashboard.html'),'utf8'),/fetch\(FILES_URL,\{method:'POST',credentials:'same-origin',body:fd\}/);
  assert.match(fs.readFileSync(path.join(root,'dashboard.html'),'utf8'),/input\.click\(\)/);
  assert.match(fs.readFileSync(path.join(root,'dashboard.html'),'utf8'),/function teachValPromptStageHtml\(\)[\s\S]*teachValTranscriptUploadHtml\(\)/);
  assert.match(fs.readFileSync(path.join(root,'dashboard.html'),'utf8'),/function teachValReviewStageHtml\(\)[\s\S]*teachValTranscriptUploadHtml\(\)/);
  assert.doesNotMatch(fs.readFileSync(path.join(root,'dashboard.html'),'utf8'),/function teachValVoiceStageHtml/);
});

test('left navigation exposes live transcript, task, and draft badges',()=>{
  assert.match(ui,/function navBadge/);
  assert.match(ui,/data-badge-view/);
  assert.match(ui,/function pendingDraftCount/);
  assert.match(ui,/function openTaskCount/);
  assert.match(ui,/function transcriptAttentionCount/);
  assert.match(ui,/window\.syncCommandCenterDrafts/);
  assert.match(ui,/navBadge/);
});

test('transcript list opens detail and exposes transcript-scoped Co-Work',()=>{
  for(const label of ['Select a transcript','Co-Work on This Transcript'])assert.ok(ui.includes(label));
  assert.doesNotMatch(ui,/tasks extracted ·/);
  assert.doesNotMatch(ui,/summary '\+safe\(t\.summaryStatus/);
  assert.match(ui,/Select a transcript/);
  assert.match(server,/async function loadTranscriptForCowork/);
  assert.match(server,/async function prepareCoworkTranscriptMeetingOverview/);
  assert.match(server,/async function createCoworkTranscriptActionItem/);
  assert.doesNotMatch(server,/app\.post\('\/api\/val\/transcripts\/:transcriptId\/chat'/);
  assert.doesNotMatch(server,/app\.post\('\/api\/val\/transcripts\/:transcriptId\/actions'/);
  assert.match(server,/prepareTranscriptMeetingOverviewDraft/);
  assert.match(server,/noExternalAction:true/);
  assert.match(hearthJs,/Prepare email draft/);
  assert.match(hearthJs,/Open email draft/);
  assert.match(hearthJs,/function timelineSourceReceipt/);
  assert.match(hearthJs,/function renderTimelineTranscriptSourceSections/);
  assert.match(hearthJs,/function renderTimelineActionIndex/);
  assert.doesNotMatch(hearthJs,/data-transcript-task-create/);
  assert.match(hearthJs,/async function openTranscriptActionItemCowork/);
  assert.match(hearthJs,/entrypointId:'transcript\.action_item'/);
  assert.doesNotMatch(hearthJs,/timelineTranscriptAction/);
  assert.doesNotMatch(hearthJs,/data-transcript-reprocess/);
  assert.doesNotMatch(hearthJs,/Ready - send to invitees/);
});

test('transcript detail can map verified attendees and projects while prepared emails remain separate',()=>{
  assert.match(server,/app\.post\('\/api\/val\/transcripts\/:transcriptId\/action-items-email-draft'/);
  assert.match(server,/prepareTranscriptActionItemsAttendeeEmailDraft/);
  assert.match(server,/transcript_action_items_attendee_email/);
  assert.match(server,/exactActionItemsFromSystem:true/);
  assert.match(server,/writingRules/);
  assert.match(server,/app\.post\('\/api\/val\/transcripts\/:transcriptId\/link-relationship'/);
  assert.match(server,/app\.post\('\/api\/val\/transcripts\/:transcriptId\/link-project'/);
  assert.match(server,/transcriptWithCalendarInvitees/);
  assert.match(server,/transcriptCalendarEventForOverview\(transcript\)/);
  assert.match(server,/transcriptCalendarEventCompatible/);
  assert.match(server,/calendar invite does not match transcript title or attendees/);
  assert.match(server,/calendarInviteMismatch/);
  assert.match(server,/saveEvidenceLink\(\{/);
  assert.match(server,/attendee_in_transcript/);
  assert.match(server,/transcript_context_for_project/);
  assert.match(server,/review_then_send_email/);
  assert.match(hearthJs,/function renderTimelineTranscriptMappingControls/);
  assert.match(hearthJs,/data-transcript-action="link_relationship"/);
  assert.match(hearthJs,/data-transcript-action="create_relationship"/);
  assert.match(hearthJs,/data-transcript-action="link_transcript_relationship"/);
  assert.match(hearthJs,/data-transcript-action="create_transcript_relationship"/);
  assert.match(hearthJs,/data-transcript-action="link_project"/);
  assert.match(hearthJs,/data-transcript-action="create_project"/);
  assert.match(hearthJs,/data-transcript-project-search/);
  assert.match(hearthJs,/data-transcript-project-create-name/);
  assert.match(hearthJs,/data-transcript-relationship-search/);
  assert.match(hearthJs,/data-transcript-relationship-main-search/);
  assert.match(hearthJs,/data-transcript-relationship-create-name/);
  assert.match(hearthJs,/data-transcript-relationship-create-email/);
  assert.match(hearthJs,/correspondenceActiveDraftRuleText/);
  assert.match(hearthJs,/hydrateRelationshipIndex\(\)/);
  assert.match(hearthJs,/hydrateProjectIndex\(\)/);
  assert.match(hearthJs,/Email found: /);
  assert.match(hearthJs,/VAL matched relationship/);
  assert.match(hearthJs,/VAL matched project/);
  assert.match(hearthJs,/Verified connections/);
  assert.match(hearthJs,/Review or correct relationships and project/);
  assert.match(hearthJs,/Key Points and Action Items remain meeting evidence and can never become people/);
  assert.match(hearthJs,/calendarInviteMismatch/);
  assert.match(hearthJs,/normalizeTimelineEmail/);
  assert.match(server,/const email=normalizeContextEmail/);
  assert.match(hearthJs,/timeline-attendee-email-found/);
  assert.match(hearthJs,/timeline-link-confirmation/);
  assert.match(hearthCss,/timelineLinkConfirmPop/);
});

test('transcript attendees and titles stay source-exact instead of guessed',()=>{
  const serverInviteeSource=server.match(/function transcriptOverviewInviteesFromSource[\s\S]*?return people;\n}/)?.[0]||'';
  const clientInviteeSource=hearthJs.match(/function timelineTranscriptInviteesFromSource[\s\S]*?return people;\n}/)?.[0]||'';
  assert.ok(serverInviteeSource);
  assert.ok(clientInviteeSource);
  assert.match(serverInviteeSource,/Found in the Krisp transcript title/);
  assert.match(clientInviteeSource,/Found in the Krisp transcript title/);
  assert.match(serverInviteeSource,/nameNearEmail/);
  assert.match(clientInviteeSource,/nameNearEmail/);
  assert.match(server,/if\(isKrisp&&String\(rawPayloadTitle\|\|''\)\.trim\(\)\)return String\(rawPayloadTitle\)\.replace/);
  assert.match(server,/meetingTitle:title,calendarEventTitle:title/);
  assert.match(server,/const id=String\(record\.id\|\|record\.transcriptId/);
  assert.match(server,/transcript\.summary\?\.executiveSummary/);
});

test('transcript evidence cannot be promoted into a relationship without an email address',()=>{
  const clientInvitees=hearthJs.match(/function timelineTranscriptInvitees\(transcript = \{\}\)\{[\s\S]*?\n\}/)?.[0]||'';
  const coworkInvitees=coworkService.match(/function transcriptInvitees\(transcript=\{\}\)\{[\s\S]*?\n\}/)?.[0]||'';
  assert.ok(clientInvitees);
  assert.ok(coworkInvitees);
  assert.match(clientInvitees,/if\(!email\)\s*return null;/);
  assert.match(coworkInvitees,/return email \? \{name:[\s\S]*?\} : null;/);
  assert.match(coworkInvitees,/test\(normalized\.email\) \? normalized : null/);
  assert.match(clientInvitees,/seen\.has\(person\.key\)/);
  assert.match(coworkInvitees,/seen\.has\(key\)/);
});

test('transcript detail keeps prepared work in Leverage and offers conversation at both boundaries',()=>{
  const detail=hearthJs.match(/function renderTimelineTranscriptDetail\(transcript = \{\}\)\{[\s\S]*?\n\}/)?.[0]||'';
  assert.ok(detail);
  assert.match(detail,/timeline-chat-transcript-top/);
  assert.match(detail,/Prepared drafts remain in Leverage/);
  assert.equal((detail.match(/Chat about this transcript/g)||[]).length,3);
  assert.doesNotMatch(detail,/renderTimelineMeetingOverviewDraft/);
});

test('Krisp transcript refresh does not promote content fragments into transcripts',()=>{
  assert.match(krispService,/if\(!documents\.length\) await runMeetingSearch\('Meetings you own in Krisp'/);
  assert.match(krispService,/if\(!documents\.length\) await runMeetingSearch\('Meetings shared with you in Krisp'/);
  assert.match(krispService,/if\(!documents\.length&&found\.listActionItems\?\.name\)/);
  assert.match(krispService,/if\(!documents\.length&&found\.searchMeetingContent\?\.name\)/);
  assert.match(krispService,/if\(!documents\.length&&found\.listActivities\?\.name\)/);
  assert.match(server,/function isUsableKrispTranscriptRecord/);
  assert.match(server,/function krispReceiptHeadingTitle/);
  assert.match(server,/rawHeadingTitle/);
  assert.match(server,/const rawSectionText=/);
  assert.match(server,/const sourceText=rawSectionText\|\|structuredSourceText/);
  assert.match(server,/Download Link/);
  assert.match(server,/Recording Download Link/);
  assert.match(server,/records\.filter\(isUsableKrispTranscriptRecord\)\.map\(transcriptIndexUiRecord\)/);
  assert.match(server,/status:'not_full_transcript_receipt'/);
  assert.match(server,/alreadyPresent\+\+;/);
  assert.match(server,/updateTranscriptIndexStatus\(transcriptId,\{meetingTitle:title/);
});

test('transcripts drawer can refresh 30 or 90 days with the active frosted loading state',()=>{
  assert.match(server,/app\.post\('\/api\/val\/transcripts\/refresh'/);
  assert.match(server,/syncKrispTranscriptsForLastThirtyDays\(\{days,limit\}\)/);
  assert.match(server,/transcriptDrawerListPayload\(\{days,limit\}\)/);
  assert.match(server,/transcript_drawer_refreshed/);
  assert.match(hearthHtml,/data-transcript-refresh-window/);
  assert.match(hearthHtml,/value="30"/);
  assert.match(hearthHtml,/value="90" selected/);
  assert.match(hearthHtml,/data-transcript-refresh/);
  assert.match(hearthHtml,/data-transcript-loading-veil/);
  assert.match(hearthJs,/function transcriptSelectedRefreshDays/);
  assert.match(hearthJs,/function setTimelineTranscriptsLoading/);
  assert.match(hearthJs,/postJson\('\/api\/val\/transcripts\/refresh'/);
  assert.match(hearthJs,/getJson\('\/api\/val\/transcripts\?days='/);
  assert.match(hearthCss,/\.timeline-loading-veil/);
  assert.match(hearthCss,/backdrop-filter:blur\(18px\)/);
});

test('Hearth transcript index stays lightweight while the detail route retains the source transcript',()=>{
  assert.match(server,/function transcriptIndexUiRecord/);
  assert.match(server,/const sourceActions=/);
  assert.match(server,/summaryText=.*slice\(0,420\)/);
  assert.match(server,/\.map\(transcriptIndexUiRecord\)/);
  assert.match(server,/const \[participants,summaries,tasks,contactUpdates,actionLog\]=await Promise\.all/);
  assert.match(server,/const indexedRecords=transcriptMigrationRecordsFromIndex\(data\)/);
  assert.match(server,/const records=indexedRecords\.length\?indexedRecords:await transcriptArchiveRecords/);
  assert.match(server,/sourceReceipt:transcriptSourceReceipt\(detail\)/);
  assert.match(server,/function transcriptSourceDownloadUrl/);
  assert.match(server,/downloadUrl:sourceUrl/);
  assert.match(server,/function transcriptCleanDisplayLine/);
  assert.match(server,/replace\(\/\^\\s\*#\{1,6\}\\s\*\//);
  assert.match(server,/line\.length>900/);
  assert.match(server,/transcriptWithCalendarInvitees\(transcriptDetailFromIndex\(data,data\.transcripts\[0\]\)\)/);
  assert.match(hearthJs,/drawerTray\?\.scrollTo\?\.\(\{top:0, left:0\}\)/);
  assert.match(hearthJs,/let timelineTranscriptOpenRequest = 0/);
  assert.match(hearthJs,/function timelineTranscriptDownloadUrl/);
  assert.match(hearthJs,/class="transcript-download-link"/);
  assert.match(hearthJs,/sourceLineLooksLikeTranscript/);
  assert.doesNotMatch(hearthJs,/renderTimelineTranscriptDetail\(\{\.\.\.cached/);
  assert.doesNotMatch(hearthJs,/timelineCompactText\(sourceText/);
});

test('transcript cards and errors have readable responsive styling',()=>{
  assert.match(css,/\.val-transcript-actions\{/);
  assert.match(css,/\.val-transcript-error\{/);
  assert.match(css,/\.val-transcript-row\{[^}]*color:#17243a/);
  assert.match(css,/@media\(max-width:900px\)[\s\S]*\.val-transcript-row\{grid-template-columns:1fr\}/);
});

test('transcript detail separates source sections and rebuilds email copy from structured evidence',()=>{
  assert.match(hearthJs,/timeline-source-receipt is-' \+ sectionName/);
  assert.match(hearthJs,/FOLLOW-THROUGH/);
  assert.match(hearthJs,/MEETING INTELLIGENCE/);
  assert.match(hearthJs,/const structuredBody = sections\.map/);
  assert.match(hearthCss,/\.timeline-source-receipt\.is-action-items/);
  assert.match(hearthCss,/\.timeline-source-receipt\.is-key-points/);
});
