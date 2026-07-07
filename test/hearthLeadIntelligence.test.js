const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const hearthJs = fs.readFileSync(path.join(root, 'hearth-prototype.js'), 'utf8');
const hearthHtml = fs.readFileSync(path.join(root, 'hearth-prototype.html'), 'utf8');
const hearthCss = fs.readFileSync(path.join(root, 'hearth-prototype.css'), 'utf8');
const server = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
const reviewRoutes = fs.readFileSync(path.join(root, 'services', 'valReviewUpdatesRoutes.js'), 'utf8');
const hearthClickContracts = fs.readFileSync(path.join(root, 'docs', 'HEARTH_CLICK_CONTRACTS.md'), 'utf8');
const hearthPacketCompleteness = fs.readFileSync(path.join(root, 'docs', 'HEARTH_PACKET_COMPLETENESS_CONTRACT.md'), 'utf8');
const hearthPacketHydrationAudit = fs.readFileSync(path.join(root, 'docs', 'HEARTH_PACKET_HYDRATION_AUDIT.md'), 'utf8');

test('Hearth Lead Intelligence keeps preview and import endpoints separate', () => {
  assert.match(hearthJs, /previewUrl:\s*'\/api\/val\/leads\/discover-preview'/);
  assert.match(hearthJs, /importUrl:\s*'\/api\/val\/leads\/import-approved'/);
  assert.match(hearthJs, /previewUrl:\s*'\/api\/val\/partners\/discover-preview'/);
  assert.match(hearthJs, /importUrl:\s*'\/api\/val\/partners\/import-approved'/);
});

test('Hearth scraper preview requires approve or hold before import', () => {
  assert.match(hearthJs, /data-preview-choice="approved"/);
  assert.match(hearthJs, /data-preview-choice="held"/);
  assert.match(hearthJs, /approved \+ ' approved \/ ' \+ held \+ ' held'/);
  assert.match(hearthJs, /Import ' \+ approved \+ ' approved lead/);
  assert.match(hearthJs, /importAction\.disabled = approved === 0/);
});

test('Hearth scraper QA can run without calling live endpoints', () => {
  assert.match(hearthJs, /mockScrapers/);
  assert.match(hearthJs, /const canUseApi = !mockScrapers/);
});

test('Lead Intelligence remains reachable from the office drawers', () => {
  assert.match(hearthHtml, /class="drawer-link source-drawer-link"/);
  assert.match(hearthHtml, /data-open-scraper="organizations"/);
  assert.match(hearthHtml, /data-open-scraper="partners"/);
});

test('Lead Intelligence drawer opens only its own detail panel', () => {
  assert.match(hearthCss, /\.drawer-tray\.source-open #source-detail/);
  assert.doesNotMatch(hearthCss, /\.drawer-tray\.source-open \.source-detail/);
});

test('Projects drawer opens project dossiers from the Hearth instead of a dashboard shortcut', () => {
  assert.match(hearthHtml, /class="drawer-link project-drawer-link"/);
  assert.match(hearthHtml, /aria-controls="project-detail"/);
  assert.match(hearthHtml, /id="project-detail"/);
  assert.match(hearthHtml, /data-project-index-source/);
  assert.match(hearthHtml, /data-project-create-toggle/);
  assert.match(hearthHtml, /data-project-create-form/);
  assert.match(hearthHtml, /enctype="multipart\/form-data"/);
  assert.match(hearthHtml, /name="websiteSource"/);
  assert.match(hearthHtml, /type="file" name="documentsAndContracts"/);
  assert.match(hearthHtml, /multiple/);
  assert.match(hearthHtml, /data-project-file-receipt/);
  assert.match(hearthHtml, /name="documents"/);
  assert.match(hearthHtml, /name="relationships"/);
  assert.match(hearthHtml, /name="rawContext"/);
  assert.match(hearthHtml, /data-project-rolodex/);
  assert.match(hearthHtml, /data-project-field="reality"/);
  assert.match(hearthHtml, /data-project-field="momentumEvidence"/);
  assert.match(hearthHtml, /data-project-field="decisionEvidence"/);
  assert.match(hearthHtml, /data-project-field="nextMoveEvidence"/);
  assert.match(hearthHtml, /data-project-source-panel/);
  assert.match(hearthHtml, /data-project-source-count/);
  assert.match(hearthHtml, /Given to VAL/);
  assert.match(hearthHtml, /data-project-graph-panel/);
  assert.match(hearthHtml, /data-project-graph-count/);
  assert.match(hearthHtml, /Project Graph/);
  assert.match(hearthHtml, /data-project-review-panel/);
  assert.match(hearthHtml, /data-project-review-count/);
  assert.match(hearthHtml, /Review Gate/);
  assert.match(hearthHtml, /data-project-prepared-panel/);
  assert.match(hearthHtml, /data-project-prepared-count/);
  assert.match(hearthHtml, /Prepared Work/);
  assert.match(hearthHtml, /data-project-action="open_project_file"/);
  assert.match(hearthHtml, /data-project-action="cowork_project"/);
  assert.match(hearthHtml, /Co-Work with VAL/);
  assert.match(hearthHtml, /data-project-action="ask_priority"/);
  assert.match(hearthHtml, /data-project-action="show_alternatives"/);
  assert.match(hearthJs, /const projectProfiles/);
  assert.match(hearthJs, /function openProjectIndex/);
  assert.match(hearthJs, /function renderProjectRolodex/);
  assert.match(hearthJs, /function renderProjectProfile/);
  assert.match(hearthJs, /button\.setAttribute\('aria-pressed', String\(activeProjectProfile\?\.id === project\.id\)\)/);
  assert.match(hearthJs, /button\.dataset\.projectOpenProfile === project\.id/);
  assert.match(hearthJs, /function hydrateProjectIndex/);
  assert.match(hearthJs, /\/api\/projects\/index\?limit=80/);
  assert.match(hearthJs, /function projectProfileFromIndexItem/);
  assert.match(hearthJs, /function normalizedProjectSourceDetails/);
  assert.match(hearthJs, /function renderProjectSourcePanel/);
  assert.match(hearthJs, /No files uploaded for this project yet/);
  assert.match(hearthJs, /function renderProjectGraphPanel/);
  assert.match(hearthJs, /function hydrateProjectGraphLinks/);
  assert.match(hearthJs, /\/api\/projects\/links\?projectId=/);
  assert.match(hearthJs, /meeting_context_for_project/);
  assert.match(hearthJs, /function renderProjectReviewPanel/);
  assert.match(hearthJs, /function renderProjectPreparedWorkPanel/);
  assert.match(hearthJs, /preparedWork/);
  assert.match(hearthJs, /function hydrateProjectReviewUpdates/);
  assert.match(hearthJs, /function openProjectSourceReview/);
  assert.match(hearthJs, /function decideProjectSourceReview/);
  assert.match(hearthJs, /function syncProjectReviewState/);
  assert.match(hearthJs, /Review project source/);
  assert.match(hearthJs, /Project Source Review/);
  assert.match(hearthJs, /Approve project-source learning/);
  assert.match(hearthJs, /Reject project-source learning/);
  assert.match(hearthJs, /without changing project judgment directly/);
  assert.match(hearthJs, /\/api\/val\/review-updates\?status=pending&limit=80/);
  assert.match(hearthJs, /review_project_source_context/);
  assert.match(hearthJs, /No task, relationship update, project judgment, CRM write, message, or external action has happened/);
  assert.match(hearthJs, /function activeProjectChatContext/);
  assert.match(hearthJs, /function openProjectCoworkSession/);
  assert.match(hearthJs, /function openContextualCoworkSession/);
  assert.match(hearthJs, /projectContext: workspaceReturnTarget === 'project' \? activeProjectChatContext\(\) : null/);
  assert.match(hearthJs, /function createProjectFromDrawer/);
  assert.match(hearthJs, /\/api\/projects\/create/);
  assert.match(hearthJs, /function postFormData/);
  assert.match(hearthJs, /function updateProjectFileReceipt/);
  assert.match(hearthJs, /Project creation needs the local VAL server/);
  assert.match(hearthJs, /function loadProjectDossier/);
  assert.match(hearthJs, /\/api\/projects\/dossier\?/);
  assert.match(hearthJs, /function projectProfileFromDossier/);
  assert.match(hearthJs, /loadProjectDossier\(projectProfileButton\.dataset\.projectOpenProfile\)/);
  assert.match(hearthJs, /projectIndexSourceLabel = data\.source === 'demo_project_profiles' \? 'Demo project index' : 'Canonical project index'/);
  assert.match(hearthJs, /Canonical project index is connected\. No project profiles have enough evidence to appear here yet/);
  assert.match(hearthJs, /projectOpenProfile/);
  assert.match(hearthJs, /function handleProjectAction/);
  assert.match(hearthJs, /Project Judgment/);
  assert.match(hearthJs, /No task, CRM update, message, scrape, or import happened from this click/);
  assert.match(hearthJs, /priority is ready to judge/);
  assert.match(hearthJs, /alternatives are ready to compare/);
  assert.match(hearthJs, /No task, CRM update, message, scrape, import, or project status change happened from this click/);
  assert.doesNotMatch(hearthJs, /if\(action === 'ask_priority'\)\{\s*closeDrawer\(\);\s*openWorkspace\('alignment'\)/);
  assert.doesNotMatch(hearthJs, /if\(action === 'show_alternatives'\)\{\s*closeDrawer\(\);\s*openWorkspace\('leverage'\)/);
  assert.match(hearthJs, /returnTarget:'project'/);
  assert.match(hearthJs, /function restoreProjectWindow/);
  assert.match(hearthJs, /workspaceReturnTarget === 'project'/);
  assert.match(hearthCss, /\.drawer-tray\.project-open \.project-detail/);
  assert.match(hearthCss, /\.project-create-form/);
  assert.match(hearthCss, /\.project-file-upload/);
  assert.match(hearthCss, /\.project-create-status/);
  assert.match(hearthCss, /\.project-rolodex button\[data-project-open-profile\]/);
  assert.match(hearthCss, /\.project-rolodex button\[data-project-open-profile\]\[aria-pressed="true"\]/);
  assert.match(hearthCss, /\.project-rolodex-empty/);
  assert.match(hearthCss, /\.project-pyramid/);
  assert.match(hearthCss, /\.project-source-panel/);
  assert.match(hearthCss, /\.project-source-grid/);
  assert.match(hearthCss, /\.project-graph-panel/);
  assert.match(hearthCss, /\.project-graph-grid/);
  assert.match(hearthCss, /\.project-review-panel/);
  assert.match(hearthCss, /\.project-review-grid/);
  assert.match(hearthCss, /\.project-prepared-panel/);
  assert.match(hearthCss, /\.project-prepared-grid/);
  assert.match(hearthCss, /\.project-review-grid button/);
  assert.match(hearthCss, /\.project-actions/);
});

test('Projects drawer has a live project index source contract', () => {
  assert.match(server, /app\.get\('\/api\/projects\/index'/);
  assert.match(server, /app\.get\('\/api\/projects\/dossier'/);
  assert.match(server, /app\.get\('\/api\/projects\/links'/);
  assert.match(server, /app\.post\('\/api\/projects\/link-relationship'/);
  assert.match(server, /app\.post\('\/api\/projects\/link-calendar-event'/);
  assert.match(server, /app\.post\('\/api\/projects\/create',upload\.any\(\)/);
  assert.match(server, /async function listProjectProfiles/);
  assert.match(server, /async function saveRelationshipProjectLink/);
  assert.match(server, /relationship:'linked_to_project'/);
  assert.match(server, /async function saveCalendarProjectLink/);
  assert.match(server, /relationship:'meeting_context_for_project'/);
  assert.match(server, /demo-link-priya-healthbridge/);
  assert.match(server, /demo-link-calendar-healthbridge/);
  assert.match(server, /No CRM update, message, task, calendar change, or external action happened/);
  assert.match(server, /function projectCreatePayload/);
  assert.match(server, /async function saveProjectSourceFiles/);
  assert.match(server, /source:'hearth_project_source_upload'/);
  assert.match(server, /uploadedFiles/);
  assert.match(server, /uploadedFileCount\+' uploaded project files'/);
  assert.match(server, /sourceDetails=\{/);
  assert.match(server, /details:item\.sourceDetails/);
  assert.match(server, /profileType==='project'/);
  assert.match(server, /profileType:'project'/);
  assert.match(server, /source:'hearth_project_intake'/);
  assert.match(server, /No scraping, CRM update, contract parsing, task, relationship update, project judgment, message, or external action happened/);
  assert.match(server, /function projectIndexItemFromProfile/);
  assert.match(server, /function projectDossierFromProfile/);
  assert.match(server, /projectCardVersion:'VAL_PHASE_13C_PROJECT_DOSSIER_V1'/);
  assert.match(server, /async function projectPreparedWorkForDossier/);
  assert.match(server, /transcript_prepared_work/);
  assert.match(server, /dossier\.sourceReceipts\.preparedWork=preparedWork/);
  assert.match(server, /currentReality:/);
  assert.match(server, /decisionPoint:/);
  assert.match(server, /source:DEMO_MODE\?'demo_project_profiles':'relationship_profiles'/);
  assert.match(server, /projects:profiles\.map\(projectIndexItemFromProfile\)/);
  assert.match(server, /href:'\.\/dashboard\.html\?view=projects&projectId='/);
  assert.match(server, /const projectContext=req\.body\.projectContext/);
  assert.match(server, /kind:'project_chat_context'/);
  assert.match(server, /Active project context:/);
  assert.match(server, /projectId:projectContext\.projectId/);
  assert.match(server, /createProjectSourceInterpretation/);
  assert.match(server, /projectSourceReview/);
  assert.match(server, /queued project source for review/);
  assert.match(server, /No scraping, CRM update, contract parsing, task, relationship update, project judgment, message, or external action happened/);
  assert.match(server, /Calendar event linked to project locally and queued for project-source review/);
});

test('Drawer buttons use distinct rose and green tones so retrieval choices stay legible', () => {
  for(const tone of ['rose-sage', 'sage-rose', 'olive-blush', 'blush-sage', 'moss-rose', 'rose-mist', 'sage-clay', 'clay-green']){
    assert.match(hearthHtml, new RegExp(`data-drawer-tone="${tone}"`));
  }
  assert.match(hearthCss, /--drawer-rose/);
  assert.match(hearthCss, /--drawer-green/);
  assert.match(hearthCss, /\.drawer-link\[data-drawer-tone="sage-rose"\]/);
  assert.match(hearthCss, /\.drawer-link\[data-drawer-tone="rose-sage"\]/);
});

test('Timeline and Tasks drawer combines calendar transcripts and follow-through', () => {
  assert.match(hearthHtml, /class="drawer-link timeline-drawer-link"/);
  assert.match(hearthHtml, /Timeline &amp; Tasks/);
  assert.match(hearthHtml, /Calendar, transcripts, follow-through/);
  assert.match(hearthHtml, /id="timeline-detail"/);
  assert.match(hearthHtml, /data-timeline-status-panel/);
  assert.match(hearthHtml, /data-timeline-status-count/);
  assert.match(hearthHtml, /data-timeline-event-list/);
  assert.match(hearthHtml, /data-timeline-event-count/);
  assert.match(hearthHtml, /data-timeline-review-cards/);
  assert.match(hearthHtml, /data-timeline-review-count/);
  assert.match(hearthHtml, /Transcript Review Workflow/);
  assert.match(hearthHtml, /Needs Matching/);
  assert.match(hearthHtml, /Ready to Extract/);
  assert.match(hearthHtml, /Proposed Notes/);
  assert.match(hearthHtml, /Proposed Tasks/);
  assert.match(hearthHtml, /Useful Note/);
  assert.match(hearthHtml, /Useful Task/);
  assert.match(hearthHtml, /source quote/);
  assert.match(hearthJs, /const timelineDrawerLink/);
  assert.match(hearthJs, /function hydrateTimelineStatus/);
  assert.match(hearthJs, /function renderTimelineEvents/);
  assert.match(hearthJs, /\/api\/val\/context-debug\?days=30/);
  assert.match(hearthJs, /timelineEvents/);
  assert.match(hearthJs, /unmatchedTranscripts/);
  assert.match(hearthJs, /needsMatching/);
  assert.match(hearthJs, /readyToExtract/);
  assert.match(hearthJs, /proposedNotes/);
  assert.match(hearthJs, /proposedTasks/);
  assert.match(hearthJs, /function renderTimelineReviewCards/);
  assert.match(hearthHtml, /data-timeline-action="cowork_timeline"/);
  assert.match(hearthJs, /function openTimelineCoworkSession/);
  assert.match(hearthJs, /returnTarget: 'timeline'/);
  assert.match(hearthJs, /restoreTimelineWindow/);
  assert.match(hearthCss, /\.timeline-drawer-actions/);
  assert.match(hearthJs, /const timelineReviewDecisions/);
  assert.match(hearthJs, /function timelineProposalAnchorStatus/);
  assert.match(hearthJs, /const timelineMatchReviewOpen/);
  assert.match(hearthJs, /function renderTimelineMatchReview/);
  assert.match(hearthJs, /function acceptTimelineLocalMatch/);
  assert.match(hearthJs, /data-anchor-state/);
  assert.match(hearthJs, /Needs matching first/);
  assert.match(hearthJs, /data-timeline-match-review/);
  assert.match(hearthJs, /data-timeline-match-accept/);
  assert.match(hearthJs, /Use local match/);
  assert.match(hearthJs, /local_match_reviewed/);
  assert.match(hearthJs, /review\.acceptedMatches/);
  assert.match(hearthJs, /acceptedMatches: review\.acceptedMatches \|\| \[\]/);
  assert.match(hearthJs, /function renderTimelineAcceptedMatchReceipt/);
  assert.match(hearthJs, /Local match receipt/);
  assert.match(hearthJs, /Audit evidence only/);
  assert.match(hearthJs, /Match event, relationship, and project before approval/);
  assert.match(hearthJs, /function timelineProposalReviewPayload/);
  assert.match(hearthJs, /function syncTimelineReviewDecision/);
  assert.match(hearthJs, /function handleTimelineReviewAction/);
  assert.match(hearthJs, /\/api\/val\/review-updates\/transcript-proposal/);
  assert.match(hearthJs, /review_update_recorded/);
  assert.match(hearthJs, /data-timeline-review-action="approved"/);
  assert.match(hearthJs, /data-timeline-review-action="needs_edit"/);
  assert.match(hearthJs, /data-timeline-review-action="rejected"/);
  assert.match(hearthJs, /Approve locally/);
  assert.match(hearthJs, /Needs better context/);
  assert.match(hearthJs, /Sent back for better context/);
  assert.match(hearthJs, /No note, task, CRM update, message, or external action was created/);
  assert.match(hearthJs, /No memory, task, CRM update, message, or external action was created/);
  assert.match(hearthJs, /proposedTranscriptReviews/);
  assert.match(hearthJs, /Why it matters/);
  assert.match(hearthJs, /Approval boundary/);
  assert.match(hearthJs, /Note standard/);
  assert.match(hearthJs, /Task standard/);
  assert.match(hearthJs, /before creating notes, tasks, or drafts/);
  assert.match(hearthJs, /drawerTray\.classList\.toggle\('timeline-open'\)/);
  assert.match(server, /timelineEvents/);
  assert.match(server, /unmatchedTranscripts/);
  assert.match(server, /meetingTranscriptLinks/);
  assert.match(server, /reviewStage/);
  assert.match(server, /noteReadiness/);
  assert.match(server, /taskReadiness/);
  assert.match(server, /function realD3DayTranscriptReviewCandidates/);
  assert.match(server, /function timelineTranscriptIntelligenceReviews/);
  assert.match(server, /function timelineReviewFromTranscriptItem/);
  assert.match(server, /function timelineTaskReviewFields/);
  assert.match(server, /function timelineProposalAnchorStatus/);
  assert.match(server, /function timelineProposalMatchCandidates/);
  assert.match(server, /function timelineCandidateFromEvent/);
  assert.match(server, /function timelineCandidateFromProfile/);
  assert.match(server, /function dedupeTimelineCandidates/);
  assert.match(server, /The\|This\|That\|Because\|Before\|After\|Review\|Expansion\|Renewal/);
  assert.match(server, /listRelationshipProfiles\(\{limit:80\}\)/);
  assert.match(server, /listProjectProfiles\(\{limit:80\}\)/);
  assert.match(server, /function timelineNamesFromText/);
  assert.match(server, /function timelineProjectHintsFromText/);
  assert.match(server, /canApprove:eventAnchored&&relationshipAnchored&&projectAnchored/);
  assert.match(server, /function dedupeTimelineTranscriptReviews/);
  assert.match(server, /item\.transcriptId\|\|item\.transcript_id/);
  assert.match(server, /const activeUserId=currentUserId\(\)/);
  assert.match(server, /const isNote=\['relationship_signal','project_signal','teach_val_candidate'\]/);
  assert.doesNotMatch(server, /'relationship_signal','project_signal','teach_val_candidate','executive_instruction'/);
  assert.match(server, /transcript_intelligence_items/);
  assert.match(server, /timelineTranscriptIntelligenceReviews\(transcripts, calendar\.events \|\| \[\]\)/);
  assert.match(reviewRoutes, /\/api\/val\/review-updates\/transcript-proposal/);
  assert.match(server, /chat_about_d3day_event_transcript\.txt/);
  assert.match(server, /sourceExcerpt/);
  assert.match(server, /approvalBoundary/);
  assert.match(server, /No external action/);
  assert.match(server, /source excerpt/);
  assert.match(server, /Attach transcript to this event before creating notes, tasks, or drafts/);
  assert.match(hearthCss, /\.drawer-tray\.timeline-open \.timeline-detail/);
  assert.match(hearthCss, /\.timeline-status-panel/);
  assert.match(hearthCss, /\.timeline-status-grid/);
  assert.match(hearthCss, /\.timeline-quality-standard/);
  assert.match(hearthCss, /\.timeline-review-checklist/);
  assert.match(hearthCss, /\.timeline-review-panel/);
  assert.match(hearthCss, /\.timeline-review-cards article\.task-proposal/);
  assert.match(hearthCss, /\.timeline-anchor-status/);
  assert.match(hearthCss, /\.timeline-match-review/);
  assert.match(hearthCss, /\.timeline-match-row/);
  assert.match(hearthCss, /\.timeline-accepted-matches/);
  assert.match(hearthCss, /\[data-anchor-state="needs_match"\]/);
  assert.match(hearthCss, /\.timeline-proposal-actions button:disabled/);
  assert.match(hearthCss, /\.timeline-review-cards article\[data-review-decision="approved"\]/);
  assert.match(hearthCss, /\.timeline-proposal-actions/);
  assert.match(hearthCss, /\.timeline-proposal-receipt/);
  assert.match(hearthCss, /\.timeline-review-cards blockquote/);
  assert.match(hearthCss, /\.timeline-status-grid p,\n\.timeline-principles p/);
  assert.match(hearthCss, /color:rgba\(45,27,22,\.72\)/);
  assert.match(hearthCss, /\.timeline-event-list/);
  assert.match(hearthCss, /\.timeline-event-list article\.needs-review/);
  assert.match(hearthCss, /\.timeline-event-list article\.ready-review/);
  assert.match(hearthCss, /\.timeline-event-list strong/);
  assert.match(hearthCss, /color:rgba\(58,33,27,\.9\)/);
});

test('Executive Inbox drawer opens prepared replies inside the Hearth', () => {
  assert.match(hearthHtml, /class="drawer-link correspondence-drawer-link"/);
  assert.match(hearthHtml, /aria-controls="correspondence-detail"/);
  assert.match(hearthHtml, /id="correspondence-detail"/);
  assert.match(hearthHtml, /Executive Inbox/);
  assert.match(hearthHtml, /Important replies and drafts/);
  assert.match(hearthHtml, /data-correspondence-list/);
  assert.match(hearthHtml, /data-correspondence-count/);
  assert.match(hearthHtml, /data-correspondence-draft-preview/);
  assert.match(hearthHtml, /data-correspondence-evidence/);
  assert.match(hearthHtml, /data-correspondence-action="cowork_correspondence"/);
  assert.match(hearthHtml, /data-correspondence-action="review"/);
  assert.match(hearthHtml, /Prepare draft/);
  assert.match(hearthHtml, /Drafting is internal prep work inside VAL/);
  assert.match(hearthHtml, /Sending represents Jessa externally/);
  assert.match(hearthHtml, /data-correspondence-action="generate"/);
  assert.match(hearthHtml, /data-correspondence-action="revise"/);
  assert.match(hearthHtml, /data-correspondence-action="send"/);
  assert.match(hearthHtml, /Send draft/);
  assert.doesNotMatch(hearthHtml, /<a href="\.\/inbox\.html" class="drawer-link" data-drawer-tone="blush-sage">/);
  assert.match(hearthJs, /const correspondenceDrawerLink/);
  assert.match(hearthJs, /function hydrateCorrespondenceDrawer/);
  assert.match(hearthJs, /\/api\/val\/ready-for-you\/build/);
  assert.match(hearthJs, /\/api\/val\/email\/review-drafts\?limit=20/);
  assert.match(hearthJs, /\/api\/val\/email\/generate-draft/);
  assert.match(hearthJs, /\/api\/val\/email\/revise-draft/);
  assert.match(hearthJs, /function openCorrespondenceReviewWorkspace/);
  assert.match(hearthJs, /openWorkspaceShell\('Executive Inbox review workspace', \{returnTarget:'correspondence'\}\)/);
  assert.match(hearthJs, /action === 'cowork_correspondence'/);
  assert.match(hearthJs, /function showCorrespondenceLocalBoundary/);
  assert.match(hearthJs, /button\.disabled = !selected/);
  assert.match(hearthJs, /private preparation inside VAL/);
  assert.match(hearthJs, /represents Jessa externally/);
  assert.match(hearthJs, /function sendPacketForDraft/);
  assert.match(hearthJs, /function correspondenceSendPayload/);
  assert.match(hearthJs, /\/api\/val\/external-actions\/email-send-packet/);
  assert.match(hearthJs, /hearth_executive_inbox_drawer/);
  assert.match(hearthJs, /Nothing was sent; use the external-action approval gate for final confirmation/);
  assert.match(hearthJs, /live conversation id/);
  assert.match(hearthJs, /draft id/);
  assert.match(hearthJs, /Back to Executive Inbox drawer/);
  assert.match(hearthJs, /restoreCorrespondenceWindow/);
  assert.match(hearthJs, /Nothing will be sent from this click/);
  assert.match(hearthCss, /\.drawer-tray\.correspondence-open \.correspondence-detail/);
  assert.match(hearthCss, /\.correspondence-workbench/);
  assert.match(hearthCss, /\.correspondence-list/);
  assert.match(hearthCss, /\.correspondence-brief/);
});

test('Commitments drawer opens accountability ledger inside the Hearth', () => {
  assert.match(hearthHtml, /class="drawer-link commitment-drawer-link"/);
  assert.match(hearthHtml, /aria-controls="commitment-detail"/);
  assert.match(hearthHtml, /id="commitment-detail"/);
  assert.match(hearthHtml, /Accountability ledger/);
  assert.match(hearthHtml, /data-commitment-summary="you_owe"/);
  assert.match(hearthHtml, /data-commitment-summary="others_owe_you"/);
  assert.match(hearthHtml, /data-commitment-filter="overdue"/);
  assert.match(hearthHtml, /data-commitment-list/);
  assert.match(hearthHtml, /data-commitment-action="cowork_commitment"/);
  assert.match(hearthHtml, /data-commitment-action="draft_email"/);
  assert.match(hearthHtml, /data-commitment-action="create_task"/);
  assert.match(hearthHtml, /data-commitment-action="complete"/);
  assert.match(hearthHtml, /data-commitment-action="resolve_contact"/);
  assert.doesNotMatch(hearthHtml, /<a href="\.\/dashboard\.html" class="drawer-link commitment-drawer-link"/);
  assert.match(hearthJs, /const commitmentDrawerLink/);
  assert.match(hearthJs, /function hydrateCommitmentDrawer/);
  assert.match(hearthJs, /\/api\/val\/commitments\?limit=120/);
  assert.match(hearthJs, /\/api\/val\/commitments\/' \+ encodeURIComponent\(item\.id\) \+ '\/draft-email/);
  assert.match(hearthJs, /function restoreCommitmentWindow/);
  assert.match(hearthJs, /workspaceReturnTarget === 'commitment'/);
  assert.match(hearthJs, /action === 'cowork_commitment'/);
  assert.match(hearthJs, /commitment-open/);
  assert.match(hearthCss, /\.drawer-tray\.commitment-open \.commitment-detail/);
  assert.match(hearthCss, /\.commitment-summary-grid/);
  assert.match(hearthCss, /\.commitment-workbench/);
  assert.match(hearthCss, /\.commitment-list/);
  assert.match(hearthCss, /\.commitment-brief/);
});

test('Documents drawer opens a relationship and project organized reference library inside the Hearth', () => {
  assert.match(hearthHtml, /class="drawer-link document-drawer-link"/);
  assert.match(hearthHtml, /aria-controls="document-detail"/);
  assert.match(hearthHtml, /id="document-detail"/);
  assert.match(hearthHtml, /Reference library/);
  assert.match(hearthHtml, /uploaded, generated, CRM, email, or Google Docs artifact/);
  assert.match(hearthHtml, /data-document-search/);
  assert.match(hearthHtml, /data-document-relationship-filter/);
  assert.match(hearthHtml, /data-document-project-filter/);
  assert.match(hearthHtml, /data-document-list/);
  assert.match(hearthHtml, /data-document-preview/);
  assert.match(hearthHtml, /data-document-action="cowork_document"/);
  assert.match(hearthHtml, /data-document-action="present"/);
  assert.match(hearthHtml, /data-document-action="update"/);
  assert.match(hearthHtml, /data-document-action="send"/);
  assert.match(hearthHtml, /data-document-action="link_context"/);
  assert.match(hearthHtml, /data-relationship-document-panel/);
  assert.match(hearthHtml, /data-project-document-panel/);
  assert.match(hearthHtml, /data-relationship-document-count/);
  assert.match(hearthHtml, /data-project-document-count/);
  assert.doesNotMatch(hearthHtml, /<a href="\.\/documents\.html" class="drawer-link" data-drawer-tone="rose-mist">/);
  assert.match(hearthJs, /const documentDrawerLink/);
  assert.match(hearthJs, /const localDocumentItems/);
  assert.match(hearthJs, /function localStoredDocuments/);
  assert.match(hearthJs, /val_docs_v1/);
  assert.match(hearthJs, /function documentItemsFromReady/);
  assert.match(hearthJs, /function normalizeCanonicalDocumentItem/);
  assert.match(hearthJs, /\/api\/val\/documents\?limit=120/);
  assert.match(hearthJs, /\/api\/val\/ready-for-you\/build/);
  assert.match(hearthJs, /function filteredDocumentItems/);
  assert.match(hearthJs, /item\.relationship/);
  assert.match(hearthJs, /item\.project/);
  assert.match(hearthJs, /function openDocumentWorkspace/);
  assert.match(hearthJs, /openWorkspaceShell\(actionLabel, \{returnTarget:'document'\}\)/);
  assert.match(hearthJs, /action === 'cowork_document'/);
  assert.match(hearthJs, /function documentSendPayload/);
  assert.match(hearthJs, /hearth_documents_drawer/);
  assert.match(hearthJs, /\/api\/val\/external-actions\/email-send-packet/);
  assert.match(hearthJs, /function hydrateRelationshipDocuments/);
  assert.match(hearthJs, /function hydrateProjectDocuments/);
  assert.match(hearthJs, /\/api\/val\/documents\/reference\?relationship=/);
  assert.match(hearthJs, /\/api\/val\/documents\/reference\?project=/);
  assert.match(hearthJs, /Back to Documents drawer/);
  assert.match(hearthJs, /restoreDocumentWindow/);
  assert.match(hearthCss, /\.drawer-tray\.document-open \.document-detail/);
  assert.match(hearthCss, /\.document-status-panel/);
  assert.match(hearthCss, /\.document-workbench/);
  assert.match(hearthCss, /\.document-search-grid/);
  assert.match(hearthCss, /\.document-list/);
  assert.match(hearthCss, /\.document-preview/);
  assert.match(hearthCss, /\.relationship-document-panel/);
  assert.match(hearthCss, /\.project-document-panel/);
  assert.match(hearthCss, /\.relationship-document-grid/);
  assert.match(hearthCss, /\.project-document-grid/);
});

test('Hearth Leverage card shows prepared work count from Ready For You', () => {
  assert.match(hearthHtml, /data-prepared-count/);
  assert.match(hearthCss, /\.prepared-count/);
  assert.match(hearthJs, /const leveragePreparedCount/);
  assert.match(hearthJs, /function hydratePreparedWorkQueue/);
  assert.match(hearthJs, /\/api\/val\/ready-for-you\/build/);
  assert.match(hearthJs, /function hydrateLeverageFromReadyForYou/);
  assert.match(hearthJs, /preparedCount/);
  assert.match(hearthJs, /remainingContextNeeded/);
  assert.match(hearthJs, /Leverage counts prepared work without turning Home into a generic task queue/);
});

test('Relationship Rolodex can scale with search, state filters, and a canonical temperature model', () => {
  assert.match(hearthHtml, /data-relationship-search/);
  assert.match(hearthHtml, /data-relationship-sort/);
  assert.match(hearthHtml, /data-relationship-index-source/);
  assert.match(hearthHtml, /data-relationship-temperature-review/);
  assert.match(hearthHtml, /data-relationship-project-panel/);
  assert.match(hearthHtml, /data-relationship-project-count/);
  assert.match(hearthHtml, /Linked Projects/);
  assert.match(hearthHtml, /data-relationship-action="cowork_relationship"/);
  assert.match(hearthHtml, /data-relationship-action="teach_temperature"/);
  for(const sort of ['attention', 'warmest', 'changed', 'alpha']){
    assert.match(hearthHtml, new RegExp(`<option value="${sort}"`));
  }
  for(const filter of ['needs_attention', 'warm', 'strategic', 'new', 'waiting']){
    assert.match(hearthHtml, new RegExp(`data-relationship-state-filter="${filter}"`));
  }
  assert.match(hearthJs, /const relationshipTemperatureModel/);
  assert.match(hearthJs, /function filteredRelationshipIndexItems/);
  assert.match(hearthJs, /function sortRelationshipIndexItems/);
  assert.match(hearthJs, /function relationshipIndexSourceProfiles/);
  assert.match(hearthJs, /function updateRelationshipIndexSourceLabel/);
  assert.match(hearthJs, /function relationshipProfileFromIndexItem/);
  assert.match(hearthJs, /email: item\.query\?\.email \|\| item\.email \|\| ''/);
  assert.match(hearthJs, /contactId: item\.query\?\.contactId \|\| item\.contactId \|\| item\.crmContactId \|\| ''/);
  assert.match(hearthJs, /temperatureMeaning: item\.temperatureMeaning/);
  assert.match(hearthJs, /temperatureObservers: item\.temperatureObservers/);
  assert.match(hearthJs, /temperatureScoreRange: item\.temperatureScoreRange/);
  assert.match(hearthJs, /temperatureEvidence: Array\.isArray\(item\.temperatureEvidence\)/);
  assert.match(hearthJs, /temperatureConflict: item\.temperatureConflict \|\| null/);
  assert.match(hearthJs, /temperatureConflict: fallback\.temperatureConflict \|\| null/);
  assert.match(hearthJs, /rolodex-temperature-review/);
  assert.match(hearthJs, /Review temperature/);
  assert.match(hearthJs, /function renderRelationshipTemperatureReview/);
  assert.match(hearthJs, /Review before treating this temperature as durable judgment/);
  assert.match(hearthJs, /function renderRelationshipProjectPanel/);
  assert.match(hearthJs, /function hydrateRelationshipProjectLinks/);
  assert.match(hearthJs, /\/api\/projects\/links\?relationshipId=/);
  assert.match(hearthJs, /function relationshipProjectLookupId/);
  assert.match(hearthJs, /temperature:'What should VAL understand about this relationship temperature or state\?'/);
  assert.match(hearthJs, /function relationshipTemperatureTeachingContext/);
  assert.match(hearthJs, /actionId === 'cowork_relationship'/);
  assert.match(hearthJs, /Competing evidence:/);
  assert.match(hearthJs, /Evidence: ' \+ \[item\.observer, item\.summary\]/);
  assert.match(hearthJs, /function relationshipTemperatureReviewPayload/);
  assert.match(hearthJs, /function relationshipPendingTemperatureReviewFor/);
  assert.match(hearthJs, /temperatureReviewPending: relationshipPendingTemperatureReviewFor\(profile\)/);
  assert.match(hearthJs, /function syncRelationshipTemperatureReviewState/);
  assert.match(hearthJs, /const nextPending = update\?\.status === 'pending' \? update : null/);
  assert.match(hearthJs, /profile\.temperatureReviewPending = nextPending/);
  assert.match(hearthJs, /function openRelationshipTemperatureReviewQueue/);
  assert.match(hearthJs, /function decideRelationshipTemperatureReview/);
  assert.match(hearthJs, /\/api\/val\/review-updates\/relationship-temperature/);
  assert.match(hearthJs, /\/api\/val\/review-updates\?status=pending&limit=30/);
  assert.match(hearthJs, /let relationshipTeachMode = 'relationship'/);
  assert.match(hearthJs, /relationshipTeachMode = reason/);
  assert.match(hearthJs, /Temperature teaching is ready for review/);
  assert.match(hearthJs, /Correction type: relationship temperature/);
  assert.match(hearthJs, /Review update queued: relationship_temperature_correction/);
  assert.match(hearthJs, /Temperature review pending · correction waiting/);
  assert.match(hearthJs, /Open temperature correction review/);
  assert.match(hearthJs, /row\.className = 'relationship-rolodex-row'/);
  assert.match(hearthJs, /pending\.dataset\.relationshipPendingTemperatureReview = item\.id/);
  assert.match(hearthJs, /function openPendingRelationshipTemperatureReviewFromRolodex/);
  assert.match(hearthJs, /event\.target\.closest\('\[data-relationship-pending-temperature-review\]'\)/);
  assert.match(hearthJs, /await openPendingRelationshipTemperatureReviewFromRolodex\(pendingTemperatureReview\)/);
  assert.match(hearthJs, /relationshipPendingTemperatureReviewFor\(profile\) \|\| profile\.temperatureReviewPending/);
  assert.match(hearthJs, /Review temperature correction/);
  assert.match(hearthJs, /Approve temperature learning/);
  assert.match(hearthJs, /Reject temperature learning/);
  assert.match(hearthJs, /syncRelationshipTemperatureReviewState\(result\.update \|\| update\)/);
  assert.match(hearthJs, /Relationship Temperature/);
  assert.match(hearthJs, /Current read', 'Correction', 'Evidence', 'Decision/);
  assert.match(hearthJs, /Temperature context', 'Review evidence', 'Decision boundary/);
  assert.match(hearthJs, /Proposed teaching:/);
  assert.match(hearthJs, /Evidence held:/);
  assert.match(hearthJs, /Boundary: approval records local Teach VAL learning only/);
  assert.match(hearthJs, /does not directly change relationship temperature/);
  assert.match(hearthJs, /Teach temperature again/);
  assert.match(hearthJs, /actionId === 'teach_temperature'/);
  assert.match(hearthJs, /async function hydrateRelationshipIndex/);
  assert.match(hearthJs, /\/api\/relationships\/index\?limit=120/);
  assert.match(hearthJs, /Canonical relationship index/);
  assert.match(hearthJs, /Local preview/);
  assert.match(hearthJs, /function appendRelationshipSectionHeader/);
  assert.match(hearthJs, /function relationshipSectionCounts/);
  assert.match(hearthJs, /function appendRelationshipRolodexRow/);
  assert.match(hearthJs, /relationshipRolodex\.dataset\.relationshipDensity = items\.length >= 12 \? 'compact' : 'comfortable'/);
  assert.match(hearthJs, /relationshipSortSelect\?\.addEventListener\('change'/);
  assert.match(hearthJs, /relationshipItemMatchesSearch/);
  assert.match(hearthJs, /function relationshipRolodexEmptyText/);
  assert.match(hearthJs, /No relationship matches this search or filter/);
  assert.match(hearthJs, /Canonical relationship index is connected\. No relationship profiles have enough evidence to appear here yet/);
  assert.match(hearthJs, /shouldShowRelationshipSections/);
  assert.match(hearthJs, /relationshipProfiles\[profileId\] \|\| relationshipIndexProfiles\[profileId\]/);
  assert.match(hearthJs, /button\.dataset\.relationshipState = item\.state/);
  assert.match(hearthJs, /button\.dataset\.relationshipOpenProfile = item\.id/);
  assert.match(server, /profile=>profile\.profileType==='person'/);
  assert.match(server, /relationships:profiles\.map\(relationshipIndexItemFromProfile\)/);
  assert.match(hearthCss, /\.relationship-index-tools/);
  assert.match(hearthCss, /\.relationship-state-filters/);
  assert.match(hearthCss, /\.relationship-index-source/);
  assert.match(hearthCss, /\.relationship-rolodex\[data-relationship-density="compact"\]/);
  assert.match(hearthCss, /max-height:1\.7rem/);
  assert.match(hearthCss, /\.relationship-rolodex-row/);
  assert.match(hearthCss, /\.relationship-rolodex-section/);
  assert.match(hearthCss, /\.rolodex-temperature-review/);
  assert.match(hearthCss, /\.relationship-temperature-review/);
  assert.match(hearthCss, /\.relationship-temperature-review button/);
  assert.match(hearthCss, /\.relationship-project-panel/);
  assert.match(hearthCss, /\.relationship-project-grid/);
  assert.match(hearthCss, /\.rolodex-temperature-pending/);
  assert.match(hearthCss, /\.desk-workspace\[aria-label\*="temperature"\]/);
});

test('Hearth calendar prep is connected to the meeting prep backend contract', () => {
  assert.match(hearthJs, /\/api\/val\/calendar\/meeting-prep/);
  assert.match(hearthJs, /\/api\/calendar\/sidebar/);
  assert.match(hearthJs, /function hydrateCalendarPanel/);
  assert.match(hearthJs, /function renderCalendarAgenda/);
  assert.match(hearthJs, /hydrateCalendarPanel\(\);/);
  assert.match(hearthJs, /function renderMeetingPrepResult/);
  assert.match(hearthJs, /Apollo and Outscraper enrichment are planned only if they improve judgment/);
  assert.match(hearthJs, /Close and return to desk/);
  assert.match(hearthJs, /function meetingPrepAttendeeIdentityLines/);
  assert.match(hearthJs, /not in GHL yet\. Create the contact before VAL attaches relationship context/);
  assert.match(hearthJs, /Review contact candidate/);
  assert.match(hearthJs, /function handleMeetingContactCandidate/);
  assert.match(hearthJs, /function createMeetingContactCandidate/);
  assert.match(hearthJs, /function openCanonicalRelationshipFile/);
  assert.match(hearthJs, /contactOpen:/);
  assert.match(hearthJs, /targetId=' \+ encodeURIComponent\(id\)/);
  assert.match(hearthJs, /\/api\/val\/contacts\/create/);
  assert.match(hearthJs, /Canonical contact ID:/);
  assert.match(hearthCss, /\.inline-meeting-action/);
});

test('Hearth desk companions connect to safe Co-Work and Teach VAL contracts', () => {
  assert.match(hearthHtml, /class="workspace-input-panel"/);
  assert.match(hearthHtml, /class="linkedin-widget"/);
  assert.match(hearthHtml, /data-linkedin-ready-count/);
  assert.match(hearthJs, /function runCowork/);
  assert.match(hearthJs, /\/api\/val\/chat/);
  assert.match(hearthJs, /function runTeachVal/);
  assert.match(hearthJs, /\/api\/val\/executive-instructions\/extract/);
  assert.match(hearthJs, /\/api\/val\/review-updates\/build/);
  assert.match(hearthJs, /workspace-input-tools/);
  assert.match(hearthJs, /data-workspace-tool="voice"/);
  assert.match(hearthJs, /data-workspace-tool="upload"/);
  assert.match(hearthJs, /data-workspace-tool="image"/);
  assert.match(hearthJs, /function startWorkspaceVoiceInput/);
  assert.match(hearthJs, /function appendWorkspaceFiles/);
  assert.match(hearthJs, /function appendWorkspaceImageRequest/);
  assert.match(hearthCss, /\.workspace-input-tools/);
  assert.match(hearthJs, /const linkedinVisibilityItems/);
  assert.match(hearthJs, /function openLinkedInEngagementWorkspace/);
  assert.match(hearthJs, /function renderLinkedInEngagementList/);
  assert.match(hearthJs, /data-linkedin-copy/);
  assert.match(hearthJs, /data-linkedin-link/);
  assert.match(hearthJs, /VAL never auto-publishes LinkedIn posts, comments, or DMs/);
  assert.match(hearthCss, /\.linkedin-widget/);
  assert.match(hearthCss, /\.linkedin-engagement-list/);
  assert.match(hearthCss, /\.linkedin-engagement-actions button,\n\.linkedin-engagement-actions a/);
  assert.match(hearthJs, /No external action was taken/);
});

test('Hearth Home presence hydrates from executive briefing intelligence', () => {
  assert.match(hearthJs, /function hydrateHomePresence/);
  assert.match(hearthJs, /\/api\/executive-briefing/);
  assert.match(hearthJs, /function hydrateGreetingFromBriefing/);
  assert.match(hearthJs, /Good morning\|Good afternoon\|Good evening/);
  assert.match(hearthJs, /window\.executiveBriefingState/);
  assert.match(hearthJs, /function hydrateRoomsFromBriefing/);
  assert.match(hearthJs, /updateRoomFromBriefing\('velocity'/);
  assert.match(hearthJs, /updateRoomFromBriefing\('alignment'/);
  assert.match(hearthJs, /updateRoomFromBriefing\('leverage'/);
});

test('Hearth room workspaces route live judgment actions safely', () => {
  assert.match(hearthJs, /let activeHomeWorkspace = null/);
  assert.match(hearthJs, /function handleHomeRoomAction/);
  assert.match(hearthJs, /\/api\/homepage-cards\/action/);
  assert.match(hearthJs, /data-home-action/);
  assert.match(hearthJs, /homeAction: 'approve'/);
  assert.match(hearthJs, /homeAction: 'edit_before_approving'/);
  assert.match(hearthJs, /homeAction: 'review_evidence'/);
  assert.match(hearthJs, /No external action was taken from this workspace/);
});

test('Hearth keeps email-derived Home judgments in Executive Inbox action language', () => {
  assert.match(hearthJs, /function isEmailSourceItem/);
  assert.match(hearthJs, /function homeEmailPayload/);
  assert.match(hearthJs, /function homeEmailActions/);
  assert.match(hearthJs, /Draft reply/);
  assert.match(hearthJs, /Create task/);
  assert.match(hearthJs, /Open Executive Inbox/);
  assert.match(hearthJs, /\/api\/email\/inbox-command\/action/);
  assert.match(hearthJs, /if\(isEmailSourceItem\(item\)\) return 'email_intelligence'/);
  assert.match(hearthJs, /if\(isEmailSourceItem\(item\)\) return 'Open email'/);
  assert.match(hearthJs, /Email needing attention/);
  assert.match(hearthJs, /email\.subject && !\/\^Review:/);
  assert.match(hearthJs, /Nothing is sent, archived, or changed in Gmail from this click/);
  assert.match(hearthJs, /if\(profile\.key === 'email'\) return escapeHtml\(value\)/);
  assert.match(server, /if\(evidenceMeta\.email\?\.messageId\)return \{type:'email'/);
  assert.match(server, /const subject=targetMeta\.email\?\.subject\|\|profile\?\.displayName/);
  assert.match(server, /messageId:targetMeta\.email\.messageId/);
  assert.match(server, /function dashboardEvidenceLookupMap/);
  assert.match(server, /metadata\.messageId/);
  assert.match(server, /const evidenceById=dashboardEvidenceLookupMap\(evidenceItems\)/);
});

test('Hearth Home queue items preserve source identity and source-of-source context', () => {
  assert.match(hearthJs, /function sourceIdentityForItem/);
  assert.match(hearthJs, /function sourceOfSourceLines/);
  assert.match(hearthJs, /data-source-type/);
  assert.match(hearthJs, /data-source-id/);
  assert.match(hearthJs, /function homeSourceContextLines/);
  assert.match(hearthJs, /data-home-room-source/);
  assert.doesNotMatch(hearthJs, /list\.querySelectorAll\('\[data-home-room-item\]'\)\.forEach/);
  assert.match(hearthJs, /Source-of-source/);
  assert.match(hearthJs, /function suggestedHomeActionsForItem/);
  assert.match(hearthJs, /function suggestedRecommendationForHomeItem/);
  assert.match(hearthJs, /function isConcreteHomeActionItem/);
  assert.match(hearthJs, /roomName === 'leverage' \? allItems\.filter\(isConcreteHomeActionItem\)/);
  assert.match(hearthJs, /leverageItems\.find\(isConcreteHomeActionItem\)/);
  assert.match(hearthJs, /queueItems\.find\(isConcreteHomeActionItem\)/);
  assert.doesNotMatch(hearthJs, /Co-Work with VAL about ' \+ item\.title/);
});

test('Hearth source actions open the most specific executive surface available', () => {
  assert.match(hearthJs, /function sourceActionLabel/);
  assert.match(hearthJs, /function targetProfile/);
  assert.match(hearthJs, /function workspaceUnderstanding/);
  assert.match(hearthJs, /function workspaceRecommendation/);
  assert.match(hearthJs, /function portalPhraseForWorkspace/);
  assert.match(hearthJs, /function renderContextPortalText/);
  assert.match(hearthJs, /item\.portalPhrases/);
  assert.match(hearthJs, /class="context-portal"/);
  assert.match(hearthJs, /deskWorkspace\.addEventListener\('click'/);
  assert.match(hearthJs, /function sourceRouteForItem/);
  assert.match(hearthJs, /function routeViewForTarget/);
  assert.match(hearthJs, /function normalizedTargetType/);
  assert.match(hearthJs, /Open GHL opportunity/);
  assert.match(hearthJs, /Open prepared draft/);
  assert.match(hearthJs, /Open relationship file/);
  assert.match(hearthJs, /Open project dossier/);
  assert.match(hearthJs, /Open the thing needing attention/);
  assert.match(hearthJs, /pipeline record where the next decision lives/);
  assert.match(hearthJs, /prepared language is ready for human judgment/);
  assert.match(hearthJs, /relationship context explains why this person is appearing on Home/);
  assert.match(hearthJs, /project record holds the current reality/);
  assert.match(hearthJs, /source evidence shows why VAL chose this story/);
  assert.match(hearthCss, /\.context-portal/);
  assert.match(hearthCss, /border-bottom:1px solid/);
  assert.match(hearthJs, /targetType/);
  assert.match(hearthJs, /targetId/);
  assert.match(hearthJs, /sourceCard/);
  assert.match(hearthJs, /item\.opportunityId/);
  assert.match(hearthJs, /metadata\.opportunityId/);
  assert.match(hearthJs, /leads_partners/);
  assert.match(hearthJs, /leads_employers/);
  assert.match(hearthJs, /opportunities/);
});

test('Hearth text inputs offer VAL autocorrect suggestions without silently rewriting', () => {
  assert.match(hearthJs, /const valAutocorrectMap/);
  assert.match(hearthJs, /teh:'the'/);
  assert.match(hearthJs, /function valAutocorrectSuggestion/);
  assert.match(hearthJs, /function renderValAutocorrect/);
  assert.match(hearthJs, /Did you mean/);
  assert.match(hearthJs, /spellcheck="true"/);
  assert.match(hearthJs, /autocorrect="on"/);
  assert.match(hearthJs, /enableValAutocorrect\(document\)/);
  assert.match(hearthCss, /\.val-autocorrect/);
  assert.match(hearthCss, /\.val-autocorrect button/);
  assert.match(hearthHtml, /hearth-prototype\.css\?v=autocorrect-20260707/);
  assert.match(hearthHtml, /hearth-prototype\.js\?v=packet-completeness-20260707/);
});

test('Hearth click surfaces have prompt and variable packet contracts', () => {
  for(const required of [
    'surface -> trigger -> variable packet -> prompt/rule -> source-of-source -> allowed actions -> never-do -> receipt',
    'data-val-click-contract',
    'data-val-variable-packet',
    'data-val-prompt-rule',
    'data-val-allowed-actions',
    'data-val-never-do',
    'data-val-required-layers',
    'data-val-source-web',
    'data-val-graph-links',
    'data-val-required-variables',
    'home_source_packet',
    'relationship_packet',
    'project_packet',
    'email_packet',
    'commitment_packet',
    'document_packet',
    'timeline_packet',
    'lead_intelligence_packet',
    'val_os_packet',
    'cowork_packet',
    'data-open-room="velocity"',
    'data-open-room="alignment"',
    'data-open-room="leverage"',
    'data-relationship-action',
    'data-project-action',
    'data-timeline-action',
    'data-correspondence-action',
    'data-commitment-action',
    'data-document-action',
    'data-open-scraper',
    'data-val-action',
    'data-workflow-action',
    'data-home-action',
    'Autocorrect suggestion',
    'Do not send the whole registry into a click',
    'Do not combine Observe + Judge + Act in one prompt'
  ]){
    assert.ok(hearthClickContracts.includes(required), 'Missing Hearth click contract entry: ' + required);
  }
  assert.match(hearthJs, /const hearthClickContractRegistry = \[/);
  assert.match(hearthJs, /const hearthPacketCompletenessRegistry = \{/);
  assert.match(hearthJs, /\.living-room \.room-action\[data-open-room="alignment"\]/);
  assert.match(hearthJs, /nav\.close_context/);
  assert.match(hearthJs, /nav\.source_action/);
  assert.match(hearthJs, /workspace\.static_action/);
  assert.match(hearthJs, /\.workspace-actions button:not\(\[data-workflow-action\]\)/);
  assert.match(hearthJs, /\.source-action/);
  assert.match(hearthJs, /root\.matches\(entry\.selector\)/);
  assert.match(hearthJs, /\[data-relationship-search\]/);
  assert.match(hearthJs, /\[data-calendar-event-index\]/);
  assert.match(hearthJs, /function applyHearthClickContracts/);
  assert.match(hearthJs, /function observeHearthClickContracts/);
  assert.match(hearthJs, /new MutationObserver/);
  assert.match(hearthJs, /node\.dataset\.valClickContract = entry\.contract/);
  assert.match(hearthJs, /node\.dataset\.valVariablePacket = entry\.packet/);
  assert.match(hearthJs, /node\.dataset\.valPromptRule = entry\.rule/);
  assert.match(hearthJs, /node\.dataset\.valAllowedActions = entry\.actions/);
  assert.match(hearthJs, /node\.dataset\.valNeverDo = entry\.never/);
  assert.match(hearthJs, /node\.dataset\.valRequiredLayers = \(packetContract\.requiredLayers \|\| \[\]\)\.join\(','\)/);
  assert.match(hearthJs, /node\.dataset\.valSourceWeb = \(packetContract\.sourceWeb \|\| \[\]\)\.join\(','\)/);
  assert.match(hearthJs, /node\.dataset\.valGraphLinks = \(packetContract\.graphLinks \|\| \[\]\)\.join\(','\)/);
  assert.match(hearthJs, /node\.dataset\.valRequiredVariables = \(packetContract\.requiredVariables \|\| \[\]\)\.join\(','\)/);
  assert.match(hearthJs, /observeHearthClickContracts\(\)/);
  assert.doesNotMatch(hearthJs, /event\.target\.closest\('\[data-home-room-item\]'\)/);
});

test('Hearth packet contracts require the deep source web behind every click', () => {
  [
    'click -> packet name -> Witnessing root -> selected surface/entity -> source evidence -> source-of-source -> graph links -> allowed actions -> approval gates -> receipt',
    'Every meaningful packet must include the Witnessing root',
    'relationship_packet',
    'project_packet',
    'email_packet',
    'home_source_packet',
    'workflow_scoped_packet',
    'projects.linked_to_relationship',
    'relationships.linked_to_project',
    'emails.thread.current.messages',
    'calendar.relevant_events',
    'recent_transcripts.relationship_updates',
    'recent_transcripts.open_loops',
    'documents.linked_to_relationship',
    'documents.linked_to_project',
    'tasks.open',
    'source-of-source'
  ].forEach((required) => assert.ok(hearthPacketCompleteness.includes(required), 'Missing packet completeness contract: ' + required));

  [
    'relationship_packet',
    'project_packet',
    'email_packet',
    'timeline_packet',
    'home_source_packet',
    'workflow_scoped_packet',
    'val_os_packet'
  ].forEach((packetName) => {
    assert.match(hearthJs, new RegExp(packetName + ': \\{[\\s\\S]*?witnessing_root[\\s\\S]*?requiredVariables', 'm'));
  });

  [
    '{{teach_val.reviewed_memory}}',
    '{{onboarding.first_understanding}}',
    '{{relationships.current}}',
    '{{projects.current}}',
    '{{emails.thread.current.messages}}',
    '{{calendar.relevant_events}}',
    '{{recent_transcripts.relationship_updates}}',
    '{{recent_transcripts.open_loops}}',
    '{{tasks.open}}',
    '{{rules.val_os.behavior_packet}}',
    '{{val.external_action_allowed}}'
  ].forEach((variable) => assert.match(hearthJs, new RegExp(variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))));

  const packetNames = Array.from(hearthJs.matchAll(/packet:'([^']+)'/g)).map((match) => match[1]);
  packetNames.forEach((packetName) => {
    assert.match(hearthJs, new RegExp(packetName + ': \\{'), 'Missing completeness registry entry for ' + packetName);
  });
});

test('Hearth packet hydration audit distinguishes live providers from builder gaps', () => {
  [
    'GET /api/hearth/packet-hydration-audit',
    'POST /api/hearth/build-packet',
    'available',
    'partial',
    'gap',
    'unified Hearth packet builder',
    'Action-gated packets fail closed'
  ].forEach((required) => assert.ok(hearthPacketHydrationAudit.includes(required), 'Missing Hearth hydration audit doc entry: ' + required));

  [
    /const HEARTH_PACKET_HYDRATION_REQUIREMENTS = \{/,
    /relationship_packet: \[/,
    /project_packet: \[/,
    /email_packet: \[/,
    /timeline_packet: \[/,
    /home_source_packet: \[/,
    /workflow_scoped_packet: \[/,
    /function hearthHydrationProviderMap\(\)/,
    /function buildHearthPacketHydrationAudit\(\)/,
    /const HEARTH_PACKET_ACTION_GATED = new Set/,
    /function buildHearthPacketContext/,
    /async function buildHearthPacket/,
    /app\.get\('\/api\/hearth\/packet-hydration-audit'/,
    /app\.post\('\/api\/hearth\/build-packet'/,
    /liveDataWarnings/,
    /no_live_project_profiles/,
    /no_live_commitments/,
    /missingRequired/,
    /providerGaps/,
    /allowedToProceed/,
    /listRelationshipProfiles\(\{limit:120\}\)/,
    /listProjectProfiles\(\{limit:120\}\)/,
    /valCommitments\.list\(\{limit:120\}\)/,
    /valDocuments\.list\(\{limit:120\}\)/,
    /listTeachValCoreMemory\(\{limit:120\}\)/,
    /click_context:\{status:'available'/,
    /withHearthPacketTimeout/,
    /nextBuilderGap:'Wire the unified Hearth packet builder/
  ].forEach((pattern) => assert.match(server, pattern));

  [
    '{{relationships.current.current_thread_history}}',
    '{{projects.linked_to_relationship}}',
    '{{emails.thread.current.messages}}',
    '{{calendar.current_event.internal_context}}',
    '{{home.card.sourceRefs}}',
    '{{evidence.current_item}}',
    '{{rules.val_os.behavior_packet}}'
  ].forEach((variable) => assert.match(server, new RegExp(variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))));

  assert.match(server, /status==='ready'\|\|status==='partial'&&!actionGated/);
  assert.match(server, /Packet is blocked until required context is available/);
});

test('Hearth room cards use target-aware witnessed copy instead of generic dashboard copy', () => {
  assert.match(hearthJs, /function primaryPortalPhrase/);
  assert.match(hearthJs, /function roomCardObservation/);
  assert.match(hearthJs, /function roomCardImplication/);
  assert.match(hearthJs, /const homeRoomQueues/);
  assert.match(hearthJs, /function setHomeRoomQueue/);
  assert.match(hearthJs, /function openHomeItemCowork/);
  assert.match(hearthJs, /data-home-room-source/);
  assert.match(hearthJs, /Co-Work with VAL about/);
  assert.match(hearthJs, /can move now/);
  assert.match(hearthJs, /answered something that matters/);
  assert.match(hearthJs, /deserves your first decision/);
  assert.match(hearthJs, /is already shaped/);
  assert.match(hearthJs, /The next step belongs in the pipeline, not in your head/);
  assert.match(hearthJs, /See why it matters/);
  assert.match(hearthJs, /Review the decision/);
  assert.match(hearthCss, /\.room-item-list/);
  assert.match(hearthCss, /max-height:116px/);
  assert.match(hearthCss, /\.room-item-list \[data-home-room-source\]/);
});

test('Hearth prototype can visually exercise named live-card language without live data', () => {
  assert.match(hearthJs, /mockBriefing/);
  assert.match(hearthJs, /function prototypeBriefing/);
  assert.match(hearthJs, /Greg answered the question that was holding the proposal/);
  assert.match(hearthJs, /Michele sent chapter notes/);
  assert.match(hearthJs, /Allen shared assessment notes/);
  assert.match(hearthJs, /Acme proposal can move now/);
  assert.match(hearthJs, /Frisson introduction draft/);
  assert.match(hearthJs, /D3Day page copy draft/);
  assert.match(hearthJs, /Client follow-up email/);
  assert.match(hearthJs, /hydrateGreetingFromBriefing\(briefing\)/);
  assert.match(hearthJs, /hydrateRoomsFromBriefing\(briefing\)/);
});

test('Hearth Leverage names transcript-prepared artifacts as prepared capability', () => {
  assert.match(hearthJs, /function preparedArtifactKind/);
  assert.match(hearthJs, /function preparedArtifactHomeCopy/);
  assert.match(hearthJs, /Proposal draft prepared/);
  assert.match(hearthJs, /Social post draft prepared/);
  assert.match(hearthJs, /LinkedIn comment prepared/);
  assert.match(hearthJs, /VAL should never auto-publish LinkedIn content/);
  assert.match(hearthJs, /Page draft prepared/);
  assert.match(hearthJs, /Calendar invitation prepared/);
  assert.match(hearthJs, /Introduction draft prepared/);
  assert.match(hearthJs, /Review introduction/);
  assert.match(hearthJs, /artifactKind/);
  assert.match(hearthJs, /preparedArtifactKind\(ready\)/);
  assert.match(hearthJs, /Prepared artifact:/);
});

test('Hearth workspaces express each executive lens as a distinct judgment sequence', () => {
  assert.match(hearthHtml, /class="judgment-sequence"/);
  assert.match(hearthJs, /const judgmentSequence/);
  assert.match(hearthJs, /function lensSequenceLabels/);
  assert.match(hearthJs, /function renderJudgmentSequence/);
  assert.match(hearthJs, /Movement', 'Meaning', 'Evidence', 'Next step/);
  assert.match(hearthJs, /Judgment', 'Fit', 'Tradeoff', 'Choice/);
  assert.match(hearthJs, /Prepared', 'Review', 'Approve', 'Release/);
  assert.match(hearthCss, /\.judgment-sequence/);
});

test('Hearth workspace papers relabel themselves by executive lens', () => {
  assert.match(hearthJs, /meaningLabel/);
  assert.match(hearthJs, /function paperLabelsForLens/);
  assert.match(hearthJs, /function renderPaperLabels/);
  assert.match(hearthJs, /What moved', 'Why VAL noticed', 'Suggested next step/);
  assert.match(hearthJs, /Why this matters', 'What it protects', 'Alignment check/);
  assert.match(hearthJs, /What is ready', 'What is already handled', 'Review posture/);
});

test('Hearth workspace actions preserve agency while emphasizing the recommended next move', () => {
  assert.match(hearthHtml, /class="agency-note"/);
  assert.match(hearthJs, /const agencyNote/);
  assert.match(hearthJs, /primary-action/);
  assert.match(hearthJs, /teach-action/);
  assert.match(hearthJs, /quiet-action/);
  assert.match(hearthJs, /function agencyNoteForLens/);
  assert.match(hearthJs, /VAL is offering a judgment, not making the decision for you/);
  assert.match(hearthJs, /Prepared work waits here until you approve, refine, or release it/);
  assert.match(hearthJs, /Nothing enters GHL until the preview is reviewed and approved/);
  assert.match(hearthCss, /\.agency-note/);
  assert.match(hearthCss, /\.workspace-actions \.primary-action/);
});

test('Hearth judgment receipts preserve the originating lens and source context', () => {
  assert.match(hearthJs, /function homeActionPosture/);
  assert.match(hearthJs, /priorWorkspace/);
  assert.match(hearthJs, /sourceActionLabel\(item, 'Open source context'\)/);
  assert.match(hearthJs, /homeAction: 'open_source'/);
  assert.match(hearthJs, /No external action was taken from this workspace/);
  assert.match(hearthJs, /accepted your judgment/);
  assert.match(hearthJs, /is ready to adjust/);
  assert.match(hearthJs, /kept the evidence attached/);
});

test('Hearth source openings keep the desk oriented after opening a target', () => {
  assert.match(hearthJs, /function sourceDestinationLabel/);
  assert.match(hearthJs, /function renderSourceOpenReceipt/);
  assert.match(hearthJs, /VAL opened the/);
  assert.match(hearthJs, /The source opened in a new tab so the desk can stay oriented here/);
  assert.match(hearthJs, /Mock-safe mode kept you at the desk while preserving the exact source route/);
  assert.match(hearthJs, /No CRM write, send, import, or durable memory action was taken/);
  assert.match(hearthJs, /if\(!mockScrapers\)/);
  assert.match(hearthJs, /Open source again/);
  assert.match(hearthJs, /GHL opportunity/);
  assert.match(hearthJs, /prepared draft/);
  assert.match(hearthJs, /relationship file/);
});

test('Hearth returns from workspaces with a quiet desk-settling motion', () => {
  assert.match(hearthJs, /desk-settling/);
  assert.match(hearthJs, /setTimeout\(\(\) => hearth\.classList\.remove\('desk-settling'\), 620\)/);
  assert.match(hearthCss, /\.hearth-shell\.desk-settling \.hearth-light/);
  assert.match(hearthCss, /@keyframes desk-return-glow/);
  assert.match(hearthCss, /@keyframes desk-return-rooms/);
});

test('Hearth rooms quietly remember when a user has held their context', () => {
  assert.match(hearthJs, /function roomNameFromWorkspace/);
  assert.match(hearthJs, /function markRoomAttended/);
  assert.match(hearthJs, /room-attended/);
  assert.match(hearthJs, /room-has-been-held/);
  assert.match(hearthJs, /roomAttendedLabel/);
  assert.match(hearthJs, /markRoomAttended\(roomNameFromWorkspace\(workspace\), 'source'\)/);
  assert.match(hearthCss, /\.room-attended/);
  assert.match(hearthCss, /\.living-room\.room-has-been-held/);
});

test('Hearth room attention markers persist only for the current browser session', () => {
  assert.match(hearthJs, /attendedRoomsStorageKey/);
  assert.match(hearthJs, /sessionStorage\.getItem\(attendedRoomsStorageKey\)/);
  assert.match(hearthJs, /sessionStorage\.setItem\(attendedRoomsStorageKey/);
  assert.match(hearthJs, /function applyStoredRoomAttendance/);
  assert.match(hearthJs, /applyStoredRoomAttendance\(\)/);
  assert.match(hearthJs, /Session memory is a nicety/);
});

test('Hearth offers a quiet fresh-desk gesture for clearing session room marks', () => {
  assert.match(hearthHtml, /class="fresh-desk-button"/);
  assert.match(hearthJs, /const freshDeskButton/);
  assert.match(hearthJs, /function clearRoomAttendance/);
  assert.match(hearthJs, /writeAttendedRooms\(\{\}\)/);
  assert.match(hearthJs, /room-attended'\)\?\.remove\(\)/);
  assert.match(hearthJs, /freshDeskButton\.addEventListener\('click', clearRoomAttendance\)/);
  assert.match(hearthCss, /\.fresh-desk-button/);
});

test('Hearth pre-drawer responsive polish keeps closed panels quiet and targets usable', () => {
  assert.match(hearthCss, /\.hearth-evidence\.open\{opacity:1;transform:translateY\(0\);max-height:330px;padding-bottom:24px\}/);
  assert.match(hearthCss, /\.living-room button\{/);
  assert.match(hearthCss, /min-height:32px/);
  assert.match(hearthCss, /\.drawer-pull\{/);
  assert.match(hearthCss, /min-height:34px/);
  assert.match(hearthHtml, /class="close-all-drawers"/);
  assert.match(hearthJs, /const closeAllDrawersButton/);
  assert.match(hearthJs, /function updateCloseAllDrawersButton/);
  assert.match(hearthJs, /drawerPull\.addEventListener\('click', \(\) => \{\s*hideWorkspaceForDrawerNavigation\(\);/);
  assert.match(hearthJs, /closeAllDrawersButton\?\.addEventListener\('click', closeDrawer\)/);
  assert.match(hearthCss, /\.close-all-drawers/);
  assert.match(hearthCss, /\.retrieval-system\{position:fixed;left:18px;right:18px;bottom:14px;width:auto;margin:0;transform:none;z-index:24\}/);
  assert.match(hearthCss, /\.drawer-tray\{position:absolute;left:0;right:0;bottom:46px;margin-top:0;max-height:0;padding:0 18px;overflow:hidden\}/);
  assert.match(hearthCss, /\.retrieval-system\.open \.drawer-tray\{max-height:min\(70vh,640px\);padding:18px;margin-top:0;overflow:auto\}/);
});

test('VAL drawer opens the Witnessing Session before operating agreements', () => {
  assert.match(hearthHtml, /<title>VAL - Home<\/title>/);
  assert.match(hearthHtml, /VAL Home/);
  assert.doesNotMatch(hearthHtml, />The Hearth</);
  assert.match(hearthHtml, /class="drawer-link val-drawer-link"/);
  assert.match(hearthHtml, /aria-controls="val-detail"/);
  assert.match(hearthHtml, /id="val-detail"/);
  assert.match(hearthHtml, /Witnessing Session/);
  assert.match(hearthHtml, /Begin Witnessing Session/);
  assert.match(hearthHtml, /Connect inbox\/calendar/);
  assert.match(hearthHtml, /data-calendar-source-status/);
  assert.match(hearthHtml, /VAL begins with one question, not a setup checklist/);
  assert.match(hearthHtml, /Nothing leaves this session/);
  assert.match(hearthHtml, /data-val-live-status/);
  assert.match(hearthHtml, /data-val-action="start_onboarding"/);
  assert.match(hearthHtml, /data-val-action="connections"/);
  assert.doesNotMatch(hearthHtml, /val-status-panel/);
  assert.doesNotMatch(hearthHtml, /val-routing-panel/);
  assert.doesNotMatch(hearthHtml, /val-action-grid/);
  assert.doesNotMatch(hearthHtml, /<a href="\.\/dashboard\.html" class="drawer-link" data-drawer-tone="clay-green">/);
  assert.match(hearthJs, /const valDrawerLink/);
  assert.match(hearthJs, /function restoreValWindow/);
  assert.match(hearthJs, /function handleValAction/);
  assert.match(hearthJs, /function refreshGoogleConnectionStatus/);
  assert.match(hearthJs, /function refreshCalendarSourceStatus/);
  assert.match(hearthJs, /function connectGoogleOAuth/);
  assert.match(hearthJs, /window\.location\.assign\('\/auth\/google'\)/);
  assert.match(hearthJs, /fullCalendarPanel\?\.addEventListener\('click'/);
  assert.match(hearthJs, /data-google-oauth/);
  assert.match(hearthJs, /\/api\/setup-health/);
  assert.match(hearthJs, /\/auth\/google/);
  assert.match(hearthJs, /const valWitnessingCards/);
  assert.match(hearthJs, /async function openValWitnessingSession/);
  assert.match(hearthJs, /async function saveValWitnessingCard/);
  assert.match(hearthJs, /function renderValWitnessingConversation/);
  assert.match(hearthJs, /function valWitnessingOpeningLines/);
  assert.match(hearthJs, /async function confirmValWitnessingCard/);
  assert.match(hearthJs, /witness_meeting_val/);
  assert.match(hearthJs, /witness_your_story/);
  assert.match(hearthJs, /witness_your_mission/);
  assert.match(hearthJs, /witness_never_compromised/);
  assert.match(hearthJs, /witness_support_style/);
  assert.match(hearthJs, /witness_partnership_useful/);
  assert.match(hearthJs, /witness_connect_sources/);
  assert.match(hearthJs, /witness_source_review/);
  assert.match(hearthJs, /witness_key_relationships/);
  assert.match(hearthJs, /witness_documents_templates/);
  assert.match(hearthJs, /witness_import_context/);
  assert.match(hearthJs, /witness_partnership_agreement/);
  assert.match(hearthJs, /next: 'partnership_agreement'/);
  assert.match(hearthJs, /movement: 'Movement 12'/);
  assert.match(hearthJs, /Imagine we weren't beginning a software setup/);
  assert.match(hearthJs, /I'd rather know you accurately than sound intelligent/);
  assert.match(hearthJs, /const valWitnessingState/);
  assert.match(hearthJs, /function valWitnessingQuestionText/);
  assert.match(hearthJs, /questionOverride: witness\.next_question/);
  assert.match(hearthJs, /escapeHtml\(valWitnessingQuestionText\(card\)\)/);
  assert.match(hearthJs, /witnessing-cards\/' \+ encodeURIComponent\(card\.id\) \+ '\/confirm/);
  assert.match(hearthJs, /confirmationError/);
  assert.match(hearthJs, /normalizeValWitnessingPayload/);
  assert.match(hearthJs, /valWitnessingLinesTooThin/);
  assert.match(hearthJs, /const total = valWitnessingCards\.length/);
  assert.match(hearthJs, /state === 'intro'/);
  assert.match(hearthJs, /valWitnessingQuestion/);
  assert.match(hearthJs, /const confirmation = type \|\| 'yes'/);
  assert.match(hearthJs, /const category = rest\[0\] \|\| 'witness_meeting_val'/);
  assert.match(hearthJs, /Live witnessing needs the VAL API connection/);
  assert.match(hearthJs, /I will not use a canned VAL response here/);
  assert.match(hearthJs, /function valWitnessingLinesForAnswer\(rawResponse = ''\)\{\s*return \[\];\s*\}/);
  assert.match(hearthJs, /valWitnessingSkipTo/);
  assert.match(hearthJs, /Continue testing questions/);
  assert.match(hearthJs, /'paused' : 'question'/);
  assert.match(hearthJs, /if\(\/i noticed where you began\/\.test\(joined\) && \/you said\/\.test\(joined\)\) return true/);
  assert.match(hearthJs, /result\?\.witness/);
  assert.match(hearthJs, /result\?\.graph/);
  assert.match(hearthJs, /state:'thinking'/);
  assert.match(hearthJs, /Yes, exactly/);
  assert.match(hearthJs, /Mostly/);
  assert.match(hearthJs, /Let me clarify/);
  assert.match(hearthJs, /valWitnessingConfirm/);
  assert.doesNotMatch(hearthJs, /You answered by telling me who you're doing it for/);
  assert.doesNotMatch(hearthJs, /I just don't know what yet/);
  assert.doesNotMatch(hearthJs, /Did I see this correctly/);
  assert.doesNotMatch(hearthJs, /Evidence used/);
  assert.doesNotMatch(hearthJs, /Here is what I noticed so far/);
  assert.doesNotMatch(hearthJs, /val-conversation-next/);
  assert.doesNotMatch(hearthJs, /Next question/);
  assert.match(hearthJs, /witnessing-mode/);
  assert.match(hearthJs, /document\.querySelector\('\.val-witnessing-entry'\)/);
  assert.match(hearthJs, /Nothing leaves this session\. VAL will show what it notices before anything becomes memory\./);
  assert.match(hearthJs, /async function openValOnboardingWorkspace/);
  assert.match(hearthJs, /async function saveValOnboardingContext/);
  assert.match(hearthJs, /function openValConnectionsWorkspace/);
  assert.match(hearthJs, /data-openai-runtime-key/);
  assert.match(hearthJs, /data-openai-runtime-model/);
  assert.match(hearthJs, /valRuntimeOpenAI:save/);
  assert.match(hearthJs, /valRuntimeOpenAI:test/);
  assert.match(hearthJs, /\/api\/dev\/openai-runtime/);
  assert.match(hearthJs, /async function openValOsReviewWorkspace/);
  assert.match(hearthJs, /async function hydrateValDrawer/);
  assert.match(hearthJs, /getJson\('\/api\/val\/os'\)/);
  assert.match(hearthJs, /getJson\('\/api\/teach-val\/onboarding'\)/);
  assert.match(hearthJs, /postJson\('\/api\/teach-val\/onboarding\/start'/);
  assert.match(hearthJs, /'\/api\/teach-val\/onboarding\/' \+ encodeURIComponent\(sessionId\) \+ '\/imports\/' \+ encodeURIComponent\(spec\.category\)/);
  assert.match(hearthJs, /'\/api\/teach-val\/onboarding\/' \+ encodeURIComponent\(sessionId\) \+ '\/witnessing-cards\/' \+ encodeURIComponent\(card\.id\)/);
  assert.match(server, /async function teachValWitnessingSessionIsComplete/);
  assert.match(server, /witness_partnership_agreement/);
  assert.match(server, /restoreJessaRealWitnessingSessionBackup\(\) \|\| existing/);
  assert.match(server, /on conflict \(id\) do update set tenant_id=excluded\.tenant_id,user_id=excluded\.user_id,status=excluded\.status/);
  assert.match(server, /on conflict \(id\) do update set session_id=excluded\.session_id,tenant_id=excluded\.tenant_id,user_id=excluded\.user_id,category=excluded\.category/);
  assert.match(hearthJs, /valAiImportPromptCards/);
  assert.match(hearthJs, /ChatGPT \/ Claude import/);
  assert.match(hearthJs, /ai_history_import/);
  assert.match(hearthJs, /data-workspace-prompt-copy/);
  assert.match(hearthJs, /working_agreements/);
  assert.match(hearthJs, /linkedin_strategy/);
  assert.match(hearthJs, /support_circle/);
  assert.match(hearthJs, /documents_and_examples/);
  assert.match(hearthJs, /external actions locked/);
  assert.match(hearthJs, /workspaceReturnTarget === 'val'/);
  assert.match(hearthJs, /Back to VAL/);
  assert.doesNotMatch(hearthJs, /No external action, account connection, CRM write, public post, document send, or durable memory promotion happens here/);
  assert.doesNotMatch(hearthJs, /workflow:'valDashboard:/);
  assert.doesNotMatch(hearthJs, /workflow: 'valDashboard:/);
  assert.match(hearthCss, /\.drawer-tray\.val-open \.val-detail/);
  assert.match(hearthCss, /\.val-witnessing-entry/);
  assert.match(hearthCss, /\.val-entry-actions/);
  assert.doesNotMatch(hearthCss, /val-conversation-next/);
  assert.match(hearthCss, /\.desk-workspace\.witnessing-mode/);
  assert.match(hearthCss, /\.val-conversation/);
  assert.match(hearthCss, /@keyframes val-line-arrive/);
  assert.match(hearthCss, /@keyframes val-thinking-pause/);
  assert.match(hearthCss, /\.workspace-prompt-shelf/);
});

test('Relationship drawer opens a Relationship Brief instead of a CRM link', () => {
  assert.match(hearthHtml, /class="drawer-link relationship-drawer-link"/);
  assert.match(hearthHtml, /id="relationship-detail"/);
  assert.match(hearthHtml, /Relationship Brief/);
  assert.match(hearthHtml, /<span>Identity<\/span>/);
  assert.match(hearthHtml, /<span>Current Reality<\/span>/);
  assert.match(hearthHtml, /<span>Executive Assessment<\/span>/);
  assert.match(hearthHtml, /<span>Strategic Importance<\/span>/);
  assert.match(hearthHtml, /<span>Executive Reminder<\/span>/);
  assert.match(hearthHtml, /<span>Observer Notes<\/span>/);
  assert.match(hearthHtml, /<span>LinkedIn Signal<\/span>/);
  assert.match(hearthHtml, /<span>Source Receipts<\/span>/);
  assert.match(hearthHtml, /data-relationship-action="review_linkedin_activity"/);
  assert.match(hearthHtml, /data-relationship-action="refresh_relationship_observers"/);
  assert.match(hearthHtml, /class="relationship-actions"/);
  assert.match(hearthJs, /const relationshipDrawerLink/);
  assert.match(hearthJs, /relationship-open/);
  assert.match(hearthCss, /\.relationship-pyramid/);
  assert.match(hearthCss, /\.relationship-receipts/);
  assert.match(hearthCss, /\.relationship-actions/);
});

test('Relationship drawer behaves like a selectable file cabinet', () => {
  assert.match(hearthHtml, /class="relationship-folder-rail"/);
  assert.match(hearthHtml, /data-relationship-profile="aric"/);
  assert.match(hearthHtml, /data-relationship-profile="greg"/);
  assert.match(hearthHtml, /data-relationship-profile="lindsey"/);
  assert.match(hearthHtml, /data-relationship-field="wisdom"/);
  assert.match(hearthJs, /const relationshipProfiles/);
  assert.match(hearthJs, /function renderRelationshipProfile/);
  assert.match(hearthJs, /relationship-action-group/);
  assert.match(hearthJs, /Communicate/);
  assert.match(hearthJs, /Plan/);
  assert.match(hearthJs, /Think/);
  assert.match(hearthJs, /Teach/);
  assert.match(hearthJs, /Draft Email/);
  assert.match(hearthJs, /Draft LinkedIn Comment/);
  assert.match(hearthJs, /Draft LinkedIn DM/);
  assert.match(hearthJs, /Create Task/);
  assert.match(hearthJs, /Update Relationship/);
  assert.match(hearthJs, /linkedinSignal/);
  assert.match(hearthJs, /sourceReceipts/);
  assert.match(hearthJs, /linkedInLatestPosts/);
  assert.match(hearthJs, /review_linkedin_activity/);
  assert.match(hearthJs, /find_relationship_introductions/);
  assert.match(hearthJs, /Find Introductions/);
  assert.match(hearthJs, /draft_linkedin_comment/);
  assert.match(hearthJs, /draft_linkedin_dm/);
  assert.match(hearthJs, /refresh_relationship_observers/);
  assert.match(hearthJs, /LinkedIn activity is ready to review/);
  assert.match(hearthJs, /LinkedIn comment drafted for review/);
  assert.match(hearthJs, /LinkedIn DM drafted for review/);
  assert.match(hearthJs, /Observer refresh is ready for review/);
  assert.match(hearthJs, /Introduction leverage is ready for review/);
  assert.match(hearthJs, /who needs this person, and who this person needs/);
  assert.match(hearthJs, /function openRelationshipIntroReview/);
  assert.match(hearthJs, /return \['Leverage', 'Fit', 'Review', 'Approval'\]/);
  assert.match(hearthJs, /let workspaceReturnTarget = 'home'/);
  assert.match(hearthJs, /function restoreRelationshipWindow/);
  assert.match(hearthJs, /workspaceReturnTarget === 'relationship'/);
  assert.match(hearthJs, /function relationshipContextActions/);
  assert.match(hearthJs, /function relationshipBackLabel/);
  assert.match(hearthJs, /relationshipAllPeople/);
  assert.match(hearthJs, /updateWorkspaceReturnButton/);
  assert.match(hearthJs, /returnButton\.textContent = label/);
  assert.match(hearthJs, /openWorkspaceShell\('Relationship introduction review', \{returnTarget:'relationship'\}\)/);
  assert.match(hearthJs, /Who needs this person/);
  assert.match(hearthJs, /Who this person needs/);
  assert.match(hearthJs, /introDraft:/);
  assert.match(hearthJs, /Introduction draft held for review/);
  assert.match(hearthJs, /Prepared introduction draft/);
  assert.match(hearthJs, /Approve draft for review queue/);
  assert.match(hearthJs, /Refine wording/);
  assert.match(hearthJs, /Not this intro/);
  assert.match(hearthJs, /Teach VAL about this introduction/);
  assert.match(hearthJs, /Introduction draft approved for the review queue/);
  assert.match(hearthJs, /No email, LinkedIn message, calendar invite, scrape, import, or CRM write happened/);
  assert.match(hearthJs, /function relationshipRouteUrl/);
  assert.match(hearthJs, /location\.protocol === 'http:' \|\| location\.protocol === 'https:'/);
  assert.match(hearthJs, /http:\/\/127\.0\.0\.1:3199\/hearth-prototype\.html/);
  assert.match(hearthJs, /function openRelationshipFullFile/);
  assert.match(hearthJs, /Relationship full file workspace/);
  assert.match(hearthJs, /openRelationshipFullFile\(profile\)/);
  assert.match(hearthJs, /function openRelationshipTeachWorkspace/);
  assert.match(hearthJs, /Review what I taught VAL/);
  assert.match(hearthJs, /relationshipTeachCandidate/);
  assert.match(hearthJs, /Teaching is ready for review/);
  assert.match(hearthCss, /\.return-button\{[\s\S]{0,80}position:sticky/);
  assert.match(hearthJs, /workflow:'relationship:teach_wisdom'/);
  assert.match(hearthJs, /relationshipFolderButtons\.forEach/);
  assert.match(hearthJs, /aria-pressed/);
  assert.match(hearthJs, /Do not let silence become ambiguity/);
  assert.match(hearthCss, /\.relationship-folder-rail/);
  assert.match(hearthCss, /\.relationship-action-group/);
  assert.match(hearthCss, /\.relationship-actions\{[\s\S]{0,80}display:grid/);
  assert.match(hearthCss, /grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
});

test('Relationship drawer reads the canonical relationship dossier when available', () => {
  assert.match(hearthJs, /function getJson/);
  assert.match(hearthJs, /function loadRelationshipDossier/);
  assert.match(hearthJs, /\/api\/relationships\/dossier\?/);
  assert.match(hearthJs, /function relationshipProfileFromDossier/);
  assert.match(hearthJs, /function relationshipProfileFromUnresolvedIdentity/);
  assert.match(hearthJs, /relationship_identity_unresolved/);
  assert.match(hearthJs, /Create or match the contact before VAL attaches relationship context/);
  assert.match(hearthJs, /Search GHL contacts/);
  assert.match(hearthJs, /Review new contact candidate/);
  assert.match(hearthJs, /function handleUnresolvedRelationshipAction/);
  assert.match(hearthJs, /VAL cannot use this as a Relationship Dossier until a CRM\/GHL contact ID exists/);
  assert.match(hearthJs, /error\.data = data/);
  assert.match(hearthJs, /function renderRelationshipActions/);
  assert.match(hearthJs, /function renderRelationshipSectionActions/);
  assert.match(hearthJs, /function relationshipAllSectionActions/);
  assert.match(hearthJs, /function defaultRelationshipSectionActions/);
  assert.match(hearthJs, /function showRelationshipSectionReceipt/);
  assert.match(hearthJs, /function preferredRelationshipActions/);
  assert.match(hearthJs, /activeRelationshipProfile/);
  assert.match(hearthJs, /relationshipBrief/);
  assert.match(hearthJs, /executiveReminder/);
  assert.match(hearthJs, /executiveAssessment/);
  assert.match(hearthJs, /strategicImportance/);
  assert.match(hearthJs, /renderRelationshipProfile\(profileId, relationshipProfileFromDossier\(data\.dossier, fallback\)\)/);
  assert.match(hearthJs, /if\(!canUseApi\) return/);
  assert.match(hearthHtml, /data-relationship-action="open_full_file"/);
  assert.match(hearthHtml, /data-relationship-action="ask_alignment"/);
  assert.match(hearthHtml, /data-relationship-section-actions="identity"/);
  assert.match(hearthHtml, /data-relationship-section-actions="evidence"/);
  assert.match(hearthHtml, /data-relationship-section-actions="patterns"/);
  assert.match(hearthHtml, /data-relationship-section-actions="meaning"/);
  assert.match(hearthHtml, /data-relationship-section-actions="wisdom"/);
  assert.match(hearthJs, /openAction\?\.route/);
  assert.match(hearthJs, /actions: actionItems/);
  assert.match(hearthJs, /sectionActions: actions\.sections/);
  assert.match(hearthJs, /defaultRelationshipSectionActions\(profile\.name/);
  assert.match(hearthCss, /\.relationship-section-actions/);
});

test('Relationship actions can return focus to the desk lenses', () => {
  assert.match(hearthHtml, /<button type="button" data-open-room="alignment" data-relationship-action="ask_alignment">Ask what deserves attention<\/button>/);
  assert.match(hearthJs, /function handleRelationshipAction/);
  assert.match(hearthJs, /relationship:open_full_file/);
  assert.match(hearthJs, /relationship:draft_message/);
  assert.match(hearthJs, /relationship:create_task/);
  assert.match(hearthJs, /relationship:ask_alignment/);
  assert.match(hearthJs, /Teach VAL/);
  assert.match(hearthJs, /identity\.crmContactId \|\| identity\.id/);
  assert.match(hearthJs, /\/api\/relationships\/actions/);
  assert.match(hearthJs, /No email will be sent from this click/);
  assert.match(hearthJs, /function closeDrawer/);
  assert.match(hearthJs, /drawerTray\.addEventListener\('click'/);
  assert.match(hearthJs, /event\.target\.closest\('\[data-relationship-action\]'\)/);
  assert.match(hearthJs, /event\.target\.closest\('\[data-open-room\]'\)/);
  assert.match(hearthJs, /openWorkspace\(roomButton\.dataset\.openRoom\)/);
});
