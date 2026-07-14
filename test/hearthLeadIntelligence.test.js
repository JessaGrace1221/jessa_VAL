const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const hearthJs = fs.readFileSync(path.join(root, 'hearth-prototype.js'), 'utf8');
const hearthHtml = fs.readFileSync(path.join(root, 'hearth-prototype.html'), 'utf8');
const hearthCss = fs.readFileSync(path.join(root, 'hearth-prototype.css'), 'utf8');
const server = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
const relationshipActionService = fs.readFileSync(path.join(root, 'services', 'valRelationshipActionIntelligence.js'), 'utf8');
const reviewRoutes = fs.readFileSync(path.join(root, 'services', 'valReviewUpdatesRoutes.js'), 'utf8');
const hearthClickContracts = fs.readFileSync(path.join(root, 'docs', 'HEARTH_CLICK_CONTRACTS.md'), 'utf8');
const hearthPacketCompleteness = fs.readFileSync(path.join(root, 'docs', 'HEARTH_PACKET_COMPLETENESS_CONTRACT.md'), 'utf8');
const hearthPacketHydrationAudit = fs.readFileSync(path.join(root, 'docs', 'HEARTH_PACKET_HYDRATION_AUDIT.md'), 'utf8');
const hearthTruthLineageMap = fs.readFileSync(path.join(root, 'docs', 'HEARTH_TRUTH_LINEAGE_MAP.md'), 'utf8');
const hearthExecutiveReasoningPipeline = fs.readFileSync(path.join(root, 'docs', 'HEARTH_EXECUTIVE_REASONING_PIPELINE.md'), 'utf8');
const valProjectManagerRoundTable = fs.readFileSync(path.join(root, 'docs', 'VAL_PROJECT_MANAGER_ROUND_TABLE_AND_PACKETS.md'), 'utf8');
const valStewardshipRoundTable = fs.readFileSync(path.join(root, 'docs', 'VAL_STEWARDSHIP_ROUND_TABLE_AND_PACKETS.md'), 'utf8');
const valExecutiveReasoningArchitecture = fs.readFileSync(path.join(root, 'docs', 'VAL_EXECUTIVE_REASONING_ARCHITECTURE.md'), 'utf8');
const valConstitution = fs.readFileSync(path.join(root, 'docs', 'VAL_CONSTITUTION.md'), 'utf8');

function extractObjectLiteral(source, marker){
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, 'Missing object marker: ' + marker);
  const brace = source.indexOf('{', start);
  assert.notEqual(brace, -1, 'Missing object brace for: ' + marker);
  let depth = 0;
  let quote = '';
  let escaped = false;
  for(let index = brace; index < source.length; index += 1){
    const char = source[index];
    if(quote){
      if(escaped){
        escaped = false;
      }else if(char === '\\'){
        escaped = true;
      }else if(char === quote){
        quote = '';
      }
      continue;
    }
    if(char === '"' || char === "'" || char === '`'){
      quote = char;
      continue;
    }
    if(char === '{') depth += 1;
    if(char === '}'){
      depth -= 1;
      if(depth === 0){
        return Function('return ' + source.slice(brace, index + 1))();
      }
    }
  }
  assert.fail('Unclosed object literal for: ' + marker);
}

test('Hearth Lead Intelligence keeps preview and import endpoints separate', () => {
  assert.match(hearthJs, /const leadScraperDefinitions = \{/);
  assert.match(hearthJs, /scraperId: 'frisson_organizations'/);
  assert.match(hearthJs, /scraperId: 'frisson_partners'/);
  assert.match(hearthJs, /routeBase: '\/api\/frisson\/organizations'/);
  assert.match(hearthJs, /routeBase: '\/api\/frisson\/partners'/);
  assert.match(hearthJs, /previewUrl:\s*'\/api\/frisson\/organizations\/discover-preview'/);
  assert.match(hearthJs, /importUrl:\s*'\/api\/frisson\/organizations\/import-approved'/);
  assert.match(hearthJs, /previewUrl:\s*'\/api\/frisson\/partners\/discover-preview'/);
  assert.match(hearthJs, /importUrl:\s*'\/api\/frisson\/partners\/import-approved'/);
  assert.match(hearthJs, /leadScraperPayloadFromDefinition/);
  assert.match(hearthJs, /saveLeadScraperCriteria/);
  assert.match(hearthJs, /function activeLeadIntelligenceSource/);
  assert.match(hearthJs, /previewCount/);
  assert.match(hearthJs, /approvedCount/);
  assert.match(hearthJs, /heldCount/);
  assert.match(hearthJs, /packet:'lead_intelligence_packet'/);
  assert.match(hearthJs, /workflowPacket === 'lead_intelligence_packet'/);
  assert.match(hearthJs, /source:activeLeadIntelligenceSource/);
  assert.match(hearthJs, /renderHearthPacketReceiptStrip\(workflowPreflight\.packet \|\| lastHearthPacketReceipt\)/);
});

test('Hearth scraper preview requires approve or hold before import', () => {
  assert.match(hearthHtml, /Lead Sourcing/);
  assert.match(hearthHtml, /Two starter scraper definitions are ready/);
  assert.match(hearthHtml, /Run organization scraper/);
  assert.match(hearthHtml, /Run partner scraper/);
  assert.match(hearthHtml, /Train this scraper/);
  assert.match(hearthJs, /lead-sourcing-board/);
  assert.match(hearthJs, /<span>Level 1<\/span><h4>Discovery<\/h4>/);
  assert.match(hearthJs, /<span>Level 2<\/span><h4>Decision Maker<\/h4>/);
  assert.match(hearthJs, /<span>Level 3<\/span><h4>Confirm \/ Dedupe<\/h4>/);
  assert.match(hearthJs, /Live preview - not imported/);
  assert.match(hearthJs, /Live scraper preview/);
  assert.match(hearthJs, /Not in CRM yet\. Duplicate check is enforced again at import\./);
  assert.match(hearthCss, /\.lead-sourcing-column \.preview-lead\{/);
  assert.match(hearthCss, /grid-template-columns:1fr/);
  assert.match(hearthJs, /data-preview-choice="approved"/);
  assert.match(hearthJs, /data-preview-choice="held"/);
  assert.match(hearthJs, /approved \+ ' approved \/ ' \+ held \+ ' held - not imported until you click Import\.'/);
  assert.match(hearthJs, /Import ' \+ approved \+ ' approved lead/);
  assert.match(hearthJs, /importAction\.disabled = approved === 0/);
  assert.match(hearthJs, /drawerImportAction\.disabled = approved === 0/);
  assert.match(hearthHtml, /data-lead-sourcing-drawer-workbench/);
  assert.match(hearthHtml, /data-lead-drawer-preview/);
  assert.match(hearthHtml, /data-lead-drawer-action="train"/);
  assert.match(hearthJs, /leadSourcingEmptyBoard\(\)/);
  assert.match(hearthJs, /await runScraperPreview\(type\)/);
  assert.match(hearthJs, /renderDrawerPacketReceiptStrip\(preflight\.packet \|\| lastHearthPacketReceipt\)/);
  assert.match(hearthJs, /renderHearthPacketReceiptStrip\(preflight\.packet \|\| lastHearthPacketReceipt\)/);
  assert.match(hearthJs, /packetReceipt: lastHearthPacketReceipt/);
  assert.match(hearthJs, /AbortController/);
  assert.match(hearthJs, /timeoutMs: 20000/);
  assert.match(hearthJs, /The preview source did not answer within 20 seconds/);
});

test('Hearth scraper QA can run without calling live endpoints', () => {
  assert.match(hearthJs, /mockScrapers/);
  assert.match(hearthJs, /const canUseApi = !mockScrapers/);
});

test('Lead Intelligence remains reachable from the office drawers', () => {
  assert.match(hearthHtml, /class="drawer-link source-drawer-link"/);
  assert.match(hearthHtml, /data-open-scraper="organizations"/);
  assert.match(hearthHtml, /data-open-scraper="partners"/);
  assert.match(hearthJs, /function scrollLeadIntelligenceActionsIntoView/);
  assert.match(hearthJs, /scrollLeadIntelligenceActionsIntoView\(\)/);
  assert.match(hearthJs, /function restoreLeadIntelligenceWindow/);
  assert.match(hearthJs, /workspaceReturnTarget === 'source'/);
  assert.match(hearthJs, /function handleLeadDrawerAction/);
  assert.match(hearthJs, /function trainLeadScraper/);
  assert.match(hearthJs, /function saveLeadScraperTraining/);
});

test('Lead Intelligence drawer opens only its own detail panel', () => {
  assert.match(hearthCss, /\.drawer-tray\.source-open #source-detail/);
  assert.doesNotMatch(hearthCss, /\.drawer-tray\.source-open \.source-detail/);
});

test('Project Managers drawer opens project dossiers from the Hearth instead of a dashboard shortcut', () => {
  assert.match(hearthHtml, /class="drawer-link project-drawer-link"/);
  assert.match(hearthHtml, /aria-controls="project-detail"/);
  assert.match(hearthHtml, /id="project-detail"/);
  assert.match(hearthHtml, /<p class="drawer-kicker">Project Managers<\/p>/);
  assert.doesNotMatch(hearthHtml, /Project Dossiers/);
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
  assert.match(hearthHtml, /data-project-suggestions/);
  assert.match(hearthHtml, /Suggested projects from relationship documents/);
  assert.match(hearthHtml, /data-project-rolodex/);
  assert.match(hearthHtml, /data-project-manager-profile/);
  assert.doesNotMatch(hearthHtml, /data-project-source-panel/);
  assert.doesNotMatch(hearthHtml, /Project Graph/);
  assert.doesNotMatch(hearthHtml, /Review Gate/);
  assert.doesNotMatch(hearthHtml, /data-project-action="open_project_file"/);
  assert.match(hearthHtml, /data-drawer-cowork-icon/);
  assert.doesNotMatch(hearthHtml, /<button type="button" data-project-action="cowork_project">Co-Work with VAL<\/button>/);
  assert.doesNotMatch(hearthHtml, /data-project-action="ask_priority"/);
  assert.doesNotMatch(hearthHtml, /data-project-action="show_alternatives"/);
  assert.doesNotMatch(hearthHtml, /data-open-room="alignment" data-project-action="ask_priority"/);
  assert.doesNotMatch(hearthHtml, /data-open-room="leverage" data-project-action="show_alternatives"/);
  assert.doesNotMatch(hearthHtml, /class="project-actions"/);
  assert.match(hearthJs, /const projectProfiles/);
  assert.match(hearthJs, /function openProjectIndex/);
  assert.match(hearthJs, /function renderProjectRolodex/);
  assert.match(hearthJs, /function renderProjectProfile/);
  assert.match(hearthJs, /function projectAdmissionPacket/);
  assert.match(hearthJs, /function projectIsDrawerAdmitted/);
  assert.match(hearthJs, /function projectManagerPacket/);
  assert.match(hearthJs, /function renderProjectManagerProfile/);
  assert.match(hearthJs, /PROJECT_ONBOARDING_FIRST_QUESTION/);
  assert.match(hearthJs, /What should this project be called, and what outcome should it create\?/);
  assert.match(hearthJs, /function projectNeedsOnboarding/);
  assert.match(hearthJs, /function projectInterviewStage/);
  assert.match(hearthJs, /PROJECT_INTERVIEW_STAGE_CONTRACTS/);
  assert.match(hearthJs, /target_page_boxes/);
  assert.match(hearthJs, /function valProjectManagerImportQuestionLines/);
  assert.match(hearthJs, /Project Manager page-ready project candidates/);
  assert.match(hearthJs, /project_candidate_action: yes_create_project, no_not_project, or unsure_ask_user/);
  assert.match(hearthJs, /Feeds Project Manager page boxes: /);
  assert.match(hearthJs, /function projectInterviewNextQuestion/);
  assert.match(hearthJs, /owner_monitoring_answered/);
  assert.match(hearthJs, /workstreams_answered/);
  assert.match(hearthJs, /milestones_answered/);
  assert.match(hearthJs, /relationship_nurture_answered/);
  assert.match(hearthJs, /async function openProjectOnboardingCowork/);
  assert.match(hearthJs, /entrypointId:'project\.onboarding'/);
  assert.match(hearthJs, /data-cowork-apply-project-onboarding/);
  assert.doesNotMatch(hearthJs, /function inferProjectInterviewOwner/);
  assert.doesNotMatch(hearthJs, /function inferProjectMonitoringRules/);
  assert.doesNotMatch(hearthJs, /function projectInterviewLooksLikeOwnerMonitoringAnswer/);
  assert.doesNotMatch(hearthJs, /function normalizeProjectInterviewCarryover/);
  assert.match(hearthJs, /function renderProjectOnboardingPanel/);
  assert.match(hearthJs, /function renderProjectRoundTableOverview/);
  assert.match(hearthJs, /needsProjectOnboarding:true/);
  assert.match(hearthJs, /hearth_project_document_assignment/);
  assert.match(hearthJs, /PROJECT_MANAGER_HEADER_COLORS/);
  assert.match(hearthJs, /function projectManagerAssignment/);
  assert.match(hearthJs, /function projectManagerHeaderColorByHex/);
  assert.match(hearthJs, /const nestedDetails = project\.sourceDetails/);
  assert.match(hearthJs, /assigned_project_manager/);
  assert.match(hearthJs, /project_manager_assignment_packet/);
  assert.match(hearthJs, /project_owner_packet/);
  assert.match(hearthJs, /function projectOwnerAssignment/);
  assert.match(hearthJs, /function renderProjectOwnerControl/);
  assert.match(hearthJs, /function assignProjectOwnerById/);
  assert.match(hearthJs, /function createProjectOwnerRelationshipFromForm/);
  assert.match(hearthJs, /data-project-owner-choice/);
  assert.match(hearthJs, /data-project-owner-create-form/);
  assert.match(hearthJs, /\/api\/projects\/link-relationship/);
  assert.match(hearthJs, /\/api\/relationships\/create/);
  assert.match(hearthJs, /assignAsOwner:true/);
  assert.match(hearthJs, /data-project-manager-family/);
  assert.match(hearthJs, /project-manager-assignee/);
  assert.match(hearthJs, /Project manager: /);
  assert.match(hearthJs, /function openProjectFieldCowork/);
  assert.match(hearthJs, /function openProjectScopedCowork/);
  assert.match(hearthJs, /function projectScopedCoworkPacket/);
  assert.match(hearthJs, /function applyProjectFieldUpdate/);
  assert.match(hearthJs, /function renderProjectRelationshipPicker/);
  assert.match(hearthJs, /function renderProjectPinControl/);
  assert.match(hearthJs, /function renderProjectEditForm/);
  assert.match(hearthJs, /function saveProjectEditFromForm/);
  assert.match(hearthJs, /function createProjectPinFromForm/);
  assert.match(hearthJs, /function hydrateAlignmentFromProjectPins/);
  assert.match(hearthJs, /function completeProjectPinFromAlignment/);
  assert.match(hearthJs, /data-project-edit-open/);
  assert.match(hearthJs, /data-project-edit-form/);
  assert.match(hearthJs, /\/api\/projects\/update/);
  assert.match(hearthJs, /\/api\/val\/project-pins/);
  assert.match(hearthJs, /\/api\/val\/project-pins\/alignment\?limit=3/);
  assert.match(hearthJs, /\/api\/val\/project-pins\/' \+ encodeURIComponent\(pinId\) \+ '\/complete/);
  assert.match(hearthJs, /Put a pin in it/);
  assert.match(hearthJs, /It will reopen in Project Managers and Alignment/);
  assert.match(hearthJs, /Mark reminder handled/);
  assert.match(hearthJs, /Only the reminder loop was cleared/);
  assert.match(hearthJs, /data-project-cowork-scope="project_overview"/);
  assert.match(hearthJs, /if\(field === 'project_overview'\) return openProjectOverviewCowork/);
  assert.match(hearthJs, /project_scoped_cowork_packet/);
  assert.match(hearthJs, /selected_action_label/);
  assert.match(hearthJs, /affected_object/);
  assert.match(hearthJs, /source_receipts/);
  assert.match(hearthJs, /lockContext:true/);
  assert.match(hearthJs, /activeCoworkContextLocked/);
  assert.match(hearthJs, /activeProjectCoworkTarget\.mode === 'field_update'/);
  assert.match(hearthJs, /if\(field === 'prepared_work'\) return openProjectPreparedWorkCowork/);
  assert.match(hearthJs, /project:cowork:/);
  assert.match(hearthJs, /packetName:'project_packet'/);
  assert.match(hearthJs, /heading:spec\.question/);
  assert.match(hearthJs, /detail:spec\.detail/);
  assert.match(hearthJs, /What consequence, opportunity, relationship, or business reason makes this project worth attention/);
  assert.match(hearthJs, /What is the next concrete move, who owns it, and when should it happen/);
  assert.match(hearthJs, /data-project-cowork-field/);
  assert.match(hearthJs, /data-project-relationship-choice/);
  assert.match(hearthJs, /data-project-relationship-create/);
  assert.match(hearthJs, /activeProjectCoworkTarget/);
  assert.match(hearthJs, /workspaceReturnTarget === 'project' && activeProjectCoworkTarget\?\.field/);
  assert.match(hearthJs, /project_manager_judgment_packet/);
  assert.match(hearthJs, /project_next_action_packet/);
  assert.match(hearthJs, /project_prepared_work_packets/);
  assert.match(hearthJs, /projectIndexItems\(\)\{[\s\S]{0,160}\.filter\(projectIsDrawerAdmitted\)/);
  assert.match(hearthJs, /function projectSource/);
  assert.match(hearthJs, /function projectProfileReceiptPacket/);
  assert.match(hearthJs, /function ensureProjectProfileReceipt/);
  assert.match(hearthJs, /ensureProjectProfileReceipt\(project\)/);
  assert.match(hearthJs, /function openProjectProfileFromDrawer/);
  assert.match(hearthJs, /source:selectedSource/);
  assert.match(hearthJs, /function handleProjectActionClick/);
  assert.match(hearthJs, /source:projectSource\(activeProjectProfile, actionId\)/);
  assert.match(hearthJs, /button\.setAttribute\('aria-pressed', String\(activeProjectProfile\?\.id === project\.id\)\)/);
  assert.match(hearthJs, /button\.dataset\.projectOpenProfile === project\.id/);
  assert.match(hearthJs, /function hydrateProjectIndex/);
  assert.match(hearthJs, /\/api\/projects\/index\?limit=80/);
  assert.match(hearthJs, /function projectProfileFromIndexItem/);
  assert.match(hearthJs, /function normalizedProjectSourceDetails/);
  assert.match(hearthJs, /function renderProjectGraphPanel/);
  assert.match(hearthJs, /function hydrateProjectGraphLinks/);
  assert.match(hearthJs, /\/api\/projects\/links\?projectId=/);
  assert.match(hearthJs, /meeting_context_for_project/);
  assert.match(hearthJs, /function renderProjectReviewPanel/);
  assert.match(hearthJs, /function renderProjectPreparedWorkPanel/);
  assert.match(hearthJs, /preparedWork/);
  assert.match(hearthJs, /function hydrateProjectReviewUpdates/);
  assert.match(hearthJs, /function hydrateProjectSuggestions/);
  assert.match(hearthJs, /function renderProjectSuggestions/);
  assert.match(hearthJs, /function projectSuggestionReceiptLine/);
  assert.match(hearthJs, /VAL handled:/);
  assert.match(hearthJs, /project-suggestion-receipt/);
  assert.match(hearthJs, /DOCUMENT_PROJECT_ASSIGNMENTS_STORAGE_KEY/);
  assert.match(hearthJs, /val_document_project_assignments_v1/);
  assert.match(hearthJs, /function projectDocumentAssignmentItems/);
  assert.match(hearthJs, /function suggestedProjectForDocument/);
  assert.match(hearthJs, /function persistDocumentProjectAssignment/);
  assert.match(hearthJs, /function decideProjectDocumentAssignment/);
  assert.match(hearthJs, /function projectReadableDocumentTitle/);
  assert.match(hearthJs, /Creating project from document/);
  assert.match(hearthJs, /document_project_assignment/);
  assert.match(hearthJs, /data-project-document-action/);
  assert.match(hearthJs, /Attach to ' \+ \(suggestedProject\.name/);
  assert.match(hearthJs, /Create new project and assign a manager/);
  assert.match(hearthJs, /projectDocument:/);
  assert.match(hearthJs, /function decideProjectSuggestion/);
  assert.match(hearthJs, /\/api\/val\/source-processing\/surface-registrations\?surface=project_managers&status=visible&reviewStatus=pending&limit=5/);
  assert.match(hearthJs, /data-project-suggestion-action/);
  assert.match(hearthJs, /Yes, create this project and assign it a manager/);
  assert.match(hearthJs, /No, this is not a project/);
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
  assert.match(hearthJs, /projectManagerPacket: packet/);
  assert.match(hearthJs, /projectContext: workspaceReturnTarget === 'project' \? activeProjectChatContext\(\) : null/);
  assert.match(hearthJs, /function createProjectFromDrawer/);
  assert.match(hearthJs, /\/api\/projects\/create/);
  assert.match(hearthJs, /function postFormData/);
  assert.match(hearthJs, /function updateProjectFileReceipt/);
  assert.match(hearthJs, /Project creation needs the local VAL server/);
  assert.match(hearthJs, /function loadProjectDossier/);
  assert.match(hearthJs, /\/api\/projects\/dossier\?/);
  assert.match(hearthJs, /function projectProfileFromDossier/);
  assert.match(hearthJs, /await openProjectProfileFromDrawer\(projectProfileButton\.dataset\.projectOpenProfile, projectProfileButton\)/);
  assert.match(hearthHtml, /data-project-title/);
  assert.doesNotMatch(hearthHtml, /data-project-field="name"/);
  assert.match(hearthJs, /function renderProjectManagerEmptyState/);
  assert.match(hearthJs, /No active projects yet\./);
  assert.doesNotMatch(hearthJs, /Project before project memory|Holding evidence quietly|Admit only when useful|No active project is admitted|project admission boundary/);
  assert.match(hearthJs, /projectIndexSourceLabel = data\.source === 'demo_project_profiles' \? 'Demo project index' : 'Canonical project index'/);
  assert.match(hearthJs, /Canonical project index is connected\. No project profiles have enough evidence to appear here yet/);
  assert.match(hearthJs, /projectOpenProfile/);
  assert.match(hearthJs, /function handleProjectAction/);
  assert.match(hearthJs, /await handleProjectActionClick\(projectAction\.dataset\.projectAction, projectAction\)/);
  assert.match(hearthJs, /if\(button\.closest\('#drawer-tray'\)\) return/);
  assert.doesNotMatch(hearthJs, /if\(action === 'ask_priority'\)\{\s*closeDrawer\(\);\s*openWorkspace\('alignment'\)/);
  assert.doesNotMatch(hearthJs, /if\(action === 'show_alternatives'\)\{\s*closeDrawer\(\);\s*openWorkspace\('leverage'\)/);
  assert.match(hearthJs, /returnTarget:'project'/);
  assert.match(hearthJs, /function restoreProjectWindow/);
  assert.match(hearthJs, /workspaceReturnTarget === 'project'/);
  assert.match(hearthJs, /if\(hearth\.dataset\.distance === 'judgment' && !event\.target\.closest\('\.desk-workspace'\)\)\{\s*closeWorkspace\(\);\s*return;\s*\}/);
  assert.match(hearthCss, /\.drawer-tray\.project-open \.project-detail/);
  assert.match(hearthCss, /\.project-create-form/);
  assert.match(hearthCss, /\.project-file-upload/);
  assert.match(hearthCss, /\.project-create-status/);
  assert.match(hearthCss, /\.project-suggestions/);
  assert.match(hearthCss, /\.project-suggestion-row/);
  assert.match(hearthCss, /\.project-suggestion-receipt/);
  assert.match(hearthCss, /\.project-suggestion-actions/);
  assert.match(hearthCss, /\.project-document-assignment-actions/);
  assert.match(hearthCss, /\.project-rolodex button\[data-project-open-profile\]/);
  assert.match(hearthCss, /\.project-rolodex button\[data-project-open-profile\]\[aria-pressed="true"\]/);
  assert.match(hearthCss, /\.project-rolodex-empty/);
  assert.match(hearthCss, /\.project-manager-dossier/);
  assert.match(hearthCss, /\.project-manager-hero/);
  assert.match(hearthCss, /--project-manager-color/);
  assert.match(hearthCss, /\.project-manager-identity-line/);
  assert.match(hearthCss, /\.project-manager-assignee/);
  assert.match(hearthCss, /\.project-owner-control/);
  assert.match(hearthCss, /\.project-owner-choices/);
  assert.match(hearthCss, /\.project-owner-create/);
  assert.match(hearthCss, /\.project-manager-judgment/);
  assert.match(hearthCss, /\.project-manager-grid/);
  assert.match(hearthCss, /\.project-manager-columns/);
  assert.match(hearthCss, /\.project-manager-story/);
  assert.match(hearthCss, /\.project-manager-clickable/);
  assert.match(hearthCss, /\.project-relationship-picker/);
  assert.match(hearthCss, /\.project-manager-hero-actions/);
  assert.match(hearthCss, /\.project-manager-cowork-chip/);
  assert.match(hearthCss, /\.project-pin-form/);
  assert.match(hearthCss, /\.project-pin-status/);
  assert.match(hearthCss, /\.project-actions/);
});

test('Project Managers drawer has a live project index source contract', () => {
  assert.match(server, /app\.get\('\/api\/projects\/index'/);
  assert.match(server, /app\.get\('\/api\/projects\/dossier'/);
  assert.match(server, /app\.post\('\/api\/projects\/update'/);
  assert.match(server, /app\.get\('\/api\/projects\/links'/);
  assert.match(server, /app\.post\('\/api\/projects\/link-relationship'/);
  assert.match(server, /app\.post\('\/api\/relationships\/create'/);
  assert.match(server, /function updateProjectOwnerMetadata/);
  assert.match(server, /assignAsOwner/);
  assert.match(server, /app\.post\('\/api\/projects\/link-calendar-event'/);
  assert.match(server, /app\.post\('\/api\/projects\/create',upload\.any\(\)/);
  assert.match(server, /ensureValProjectPinsTables/);
  assert.match(server, /registerValProjectPinsRoutes/);
  assert.match(server, /async function listProjectProfiles/);
  assert.match(server, /async function saveRelationshipProjectLink/);
  assert.match(server, /relationship:'linked_to_project'/);
  assert.match(server, /async function saveCalendarProjectLink/);
  assert.match(server, /relationship:'meeting_context_for_project'/);
  assert.match(server, /demo-link-priya-healthbridge/);
  assert.match(server, /demo-link-calendar-healthbridge/);
  assert.match(server, /No CRM update, message, task, calendar change, or external action happened/);
  assert.match(server, /function projectCreatePayload/);
  assert.match(server, /function projectUpdatePayload/);
  assert.match(server, /function projectUpdateListValue/);
  assert.match(server, /needsProjectOnboarding/);
  assert.match(server, /projectOnboarding/);
  assert.match(server, /projectOnboardingOwnerMonitoringAnswer/);
  assert.match(server, /monitoringRules:projectUpdateListValue/);
  assert.match(server, /milestones:projectUpdateListValue/);
  assert.match(server, /relationshipNurtureRules:projectUpdateListValue/);
  assert.match(server, /preparedWork:projectUpdateListValue/);
  assert.match(server, /hearth_project_document_assignment/);
  assert.match(server, /async function updateProjectProfileLocal/);
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

test('Transcripts drawer restores source-grounded transcript workbench instead of diagnostic workflow cards', () => {
  assert.match(hearthHtml, /<h3>Transcripts<\/h3>/);
  assert.match(hearthHtml, /Recent VAL transcripts, source action items, and clean meeting overviews/);
  assert.match(hearthHtml, /data-transcript-list/);
  assert.match(hearthHtml, /data-transcript-detail/);
  assert.match(hearthHtml, /data-transcript-action-index/);
  assert.doesNotMatch(hearthHtml, /Import recent VAL meetings/);
  assert.doesNotMatch(hearthHtml, /Select a transcript/);
  assert.doesNotMatch(hearthHtml, /VAL will show the .* action items and meeting overview first/);
  assert.doesNotMatch(hearthHtml, /Krisp|Crisp|Outscraper|RocketReach|GoHighLevel|\bGHL\b/);
  assert.match(hearthHtml, /Action Items/);
  assert.match(hearthHtml, /Meeting Overview/);
  assert.match(hearthHtml, /People and Projects/);
  assert.match(hearthHtml, /View full transcript/);
  assert.doesNotMatch(hearthHtml, /Transcript Review Workflow/);
  assert.doesNotMatch(hearthHtml, /Ready to Extract/);
  assert.doesNotMatch(hearthHtml, /Proposed Notes/);
  assert.match(hearthJs, /const transcriptList = document\.querySelector\('\[data-transcript-list\]'\)/);
  assert.match(hearthJs, /function renderTimelineTranscriptList/);
  assert.match(hearthJs, /function renderTimelineTranscriptDetail/);
  assert.match(hearthJs, /data-transcript-full-toggle/);
  assert.match(hearthJs, /function renderTimelineActionIndex/);
  assert.match(hearthJs, /function resetTimelineTranscriptDetailScroll/);
  assert.match(hearthCss, /\.transcript-workbench/);
  assert.match(hearthCss, /\.transcript-detail-panel/);
});

test('Hearth drawers keep the shared frost surface and packet contracts', () => {
  const drawerContracts = [
    ['Stewardship', 'relationship-drawer-link', 'relationship-open', 'relationship-detail', 'relationship_packet', 'drawer.relationships'],
    ['Project Managers', 'project-drawer-link', 'project-open', 'project-detail', 'project_packet', 'drawer.projects'],
    ['Transcripts', 'timeline-drawer-link', 'timeline-open', 'timeline-detail', 'timeline_packet', 'drawer.timeline'],
    ['Executive Inbox', 'correspondence-drawer-link', 'correspondence-open', 'correspondence-detail', 'email_packet', 'drawer.executive_inbox'],
    ['Commitments', 'commitment-drawer-link', 'commitment-open', 'commitment-detail', 'commitment_packet', 'drawer.commitments'],
    ['Documents', 'document-drawer-link', 'document-open', 'document-detail', 'document_packet', 'drawer.documents'],
    ['Lead Intelligence', 'source-drawer-link', 'source-open', 'source-detail', 'lead_intelligence_packet', 'drawer.lead_intelligence'],
    ['VAL OS', 'val-drawer-link', 'val-open', 'val-detail', 'val_os_packet', 'drawer.val_os']
  ];
  for(const [label, buttonClass, openClass, detailId, packetName, clickContract] of drawerContracts){
    assert.match(hearthHtml, new RegExp(`class="drawer-link ${buttonClass}"`), label + ' drawer button missing');
    assert.match(hearthHtml, new RegExp(`aria-controls="${detailId}"`), label + ' drawer control target missing');
    assert.match(hearthHtml, new RegExp(`id="${detailId}"`), label + ' detail panel missing');
    assert.match(hearthJs, new RegExp(openClass), label + ' open class missing from runtime');
    assert.match(hearthJs, new RegExp(`packet:'${packetName}'`), label + ' packet contract missing from registry');
    assert.match(hearthJs, new RegExp(`contract:'${clickContract}'`), label + ' click contract missing from registry');
  }
  assert.match(hearthCss, /--frost-open-surface:/);
  assert.match(hearthCss, /--frost-open-card:/);
  assert.match(hearthCss, /rgba\(255,255,255,\.92\)/);
  assert.match(hearthCss, /rgba\(255,255,255,\.82\)/);
  assert.match(hearthCss, /--frost-open-line:rgba\(91,105,79,\.16\)/);
  assert.match(hearthCss, /\.full-calendar-panel,\n\.workspace-panel,\n\.drawer-tray\{[\s\S]{0,180}background:var\(--frost-open-surface\)/);
  assert.match(hearthCss, /\.drawer-tray :is\([\s\S]*?\.correspondence-queue,[\s\S]*?\.correspondence-brief,[\s\S]*?\.correspondence-draft-preview,[\s\S]*?\.relationship-identity,[\s\S]*?\.project-identity/);
  assert.match(hearthCss, /\.drawer-tray\.correspondence-open\{[\s\S]{0,180}background:var\(--frost-open-surface\)/);
  assert.match(hearthCss, /\.correspondence-workbench\{[\s\S]{0,260}background:var\(--frost-open-card\)/);
  assert.match(hearthCss, /\.correspondence-actions button:first-child\{[\s\S]{0,180}background:rgba\(73,87,63,\.9\)/);
  assert.doesNotMatch(hearthCss, /\.drawer-tray\.correspondence-open\{[\s\S]{0,180}background:rgba\(248,248,249,\.96\)/);
  assert.doesNotMatch(hearthCss, /--frost-open-surface:[\s\S]{0,180}rgba\(235,241,226,\.34\)/);
  assert.match(hearthCss, /System-wide opened surface standard: frosted off-white, quiet sage, never heavy tan/);
});

test('Transcripts drawer opens the live transcript archive and selected transcript detail', () => {
  assert.match(hearthHtml, /class="drawer-link timeline-drawer-link"/);
  assert.match(hearthHtml, /Transcripts/);
  assert.match(hearthHtml, /Meeting evidence, notes, tasks/);
  assert.match(hearthHtml, /Recent VAL transcripts/);
  assert.match(hearthHtml, /id="timeline-detail"/);
  assert.match(hearthHtml, /data-transcript-count/);
  assert.match(hearthHtml, /data-transcript-list/);
  assert.match(hearthHtml, /data-transcript-detail/);
  assert.match(hearthHtml, /Action Items/);
  assert.match(hearthHtml, /Meeting Overview/);
  assert.match(hearthHtml, /People and Projects/);
  assert.match(hearthHtml, /View full transcript/);
  assert.doesNotMatch(hearthHtml, /Transcript Review Workflow/);
  assert.doesNotMatch(hearthHtml, /Ready to Extract/);
  assert.doesNotMatch(hearthHtml, /Proposed Notes/);
  assert.match(hearthJs, /const timelineDrawerLink/);
  assert.match(hearthJs, /function hydrateTimelineStatus/);
  assert.match(hearthJs, /function loadTimelineTranscripts/);
  assert.match(hearthJs, /\/api\/val\/transcripts\?days=3650&limit=30/);
  assert.match(hearthJs, /function openTimelineTranscript/);
  assert.match(hearthJs, /\/api\/val\/transcripts\/'\s*\+\s*encodeURIComponent\(transcriptId\)/);
  assert.match(hearthJs, /function renderTimelineTranscriptDetail/);
  assert.match(hearthJs, /function timelineNativeActionItems/);
  assert.match(hearthJs, /function timelineMeetingOverviewDraft/);
  assert.match(hearthJs, /function renderTimelineMeetingOverviewDraft/);
  assert.match(hearthJs, /function renderTimelineTranscriptSourceSections/);
  assert.match(hearthJs, /function timelineSourceReceipt/);
  assert.match(hearthJs, /function timelineKrispSections/);
  assert.match(hearthJs, /rawTranscript/);
  assert.match(hearthJs, /Key Points\|Meeting Overview\|Summary\|Overview/);
  assert.match(hearthJs, /keyPoints/);
  assert.match(hearthJs, /function timelineKrispStructuredActionItems/);
  assert.match(hearthJs, /sourcePayloadMetadata\?\.data\?\.sections/);
  assert.match(hearthJs, /Action Items\?/);
  assert.match(hearthJs, /Meeting Overview\|Summary\|Overview/);
  assert.match(hearthJs, /krispSections\.actionItems\.length/);
  assert.match(hearthJs, /krispStructured\.length/);
  assert.match(hearthJs, /Array\.isArray\(transcript\.actionItems\) \? transcript\.actionItems : \[\]/);
  assert.match(hearthJs, /if\(native\.length\) return native/);
  assert.match(hearthJs, /Prepare email draft/);
  assert.match(hearthJs, /Open email draft/);
  assert.match(hearthJs, /function resetTimelineTranscriptDetailScroll/);
  const openTimelineTranscriptBody = hearthJs.match(/async function openTimelineTranscript[\s\S]*?\n}\n\nasync function loadTimelineTranscripts/)?.[0] || '';
  assert.ok(openTimelineTranscriptBody);
  assert.doesNotMatch(openTimelineTranscriptBody, /scrollIntoView/);
  assert.match(hearthJs, /drawerTray\?\.scrollTo\?\.\(\{top:0, left:0\}\)/);
  assert.match(openTimelineTranscriptBody, /timelineTranscriptOpenRequest/);
  assert.doesNotMatch(openTimelineTranscriptBody, /renderTimelineTranscriptDetail\(\{\.\.\.cached/);
  assert.doesNotMatch(hearthJs, /VAL Action Items/);
  assert.match(hearthJs, /Action Items/);
  assert.match(hearthJs, /Co-Work on This Transcript/);
  assert.match(hearthJs, /data-transcript-open/);
  assert.match(hearthJs, /data-transcript-cowork/);
  assert.match(hearthJs, /function openTranscriptWorkingBriefCowork/);
  assert.match(hearthJs, /entrypointId:'transcript\.working_brief'/);
  assert.match(hearthJs, /data-transcript-action/);
  assert.match(hearthJs, /data-transcript-task-create/);
  assert.match(hearthJs, /data-transcript-action-index/);
  assert.doesNotMatch(hearthJs, /data-transcript-chat/);
  assert.doesNotMatch(hearthJs, /timelineTranscriptAsk/);
  assert.match(hearthJs, /function openTranscriptActionItemCowork/);
  assert.match(hearthJs, /entrypointId:'transcript\.action_item'/);
  assert.match(hearthJs, /data-cowork-apply-transcript-action-item/);
  assert.doesNotMatch(hearthJs, /\/api\/val\/transcripts\/'\s*\+\s*encodeURIComponent\(transcriptId\)\s*\+\s*'\/actions/);
  assert.doesNotMatch(hearthJs, /prepare_overview/);
  assert.doesNotMatch(hearthJs, /data-transcript-reprocess/);
  assert.match(hearthCss, /\.timeline-transcript-row/);
  assert.match(hearthCss, /\.timeline-transcript-detail/);
  assert.match(hearthCss, /\.timeline-transcript-summary-strip/);
  assert.match(hearthCss, /\.timeline-meeting-overview-ready/);
  assert.match(hearthCss, /\.timeline-transcript-cowork>button/);
  assert.doesNotMatch(hearthCss, /\.timeline-transcript-chat-input/);
  assert.doesNotMatch(hearthHtml, /data-timeline-action="cowork_timeline"/);
  assert.match(hearthJs, /mode === 'timeline'/);
  assert.match(hearthJs, /function openTimelineCoworkSession/);
  assert.match(hearthJs, /returnTarget: 'timeline'/);
  assert.match(hearthJs, /restoreTimelineWindow/);
  assert.match(hearthCss, /\.drawer-cowork-orb/);
  assert.match(hearthJs, /const timelineReviewDecisions/);
  assert.match(hearthJs, /function timelineProposalAnchorStatus/);
  assert.match(hearthJs, /const timelineMatchReviewOpen/);
  assert.match(hearthJs, /function renderTimelineMatchReview/);
  assert.match(hearthJs, /function timelineReviewSource/);
  assert.match(hearthJs, /function timelineMatchSource/);
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
  assert.match(hearthJs, /action:'timeline:match_review'/);
  assert.match(hearthJs, /action:'timeline:match_accept:'/);
  assert.match(hearthJs, /action:'timeline:review:'/);
  assert.match(hearthJs, /action:timelineAction\.dataset\.timelineAction, allowBlockedForInspection:true/);
  assert.match(hearthJs, /renderDrawerPacketReceiptStrip\(preflight\.packet \|\| lastHearthPacketReceipt\)/);
  assert.match(hearthJs, /openTimelineCoworkSession\(\);\s*renderHearthPacketReceiptStrip\(preflight\.packet \|\| lastHearthPacketReceipt\)/);
  assert.match(hearthJs, /source:timelineReviewSource/);
  assert.match(hearthJs, /source:timelineMatchSource/);
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
  const correspondenceDrawerHtml = hearthHtml.slice(
    hearthHtml.indexOf('id="correspondence-detail"'),
    hearthHtml.indexOf('id="commitment-detail"')
  );
  assert.match(hearthHtml, /class="drawer-link correspondence-drawer-link"/);
  assert.match(hearthHtml, /aria-controls="correspondence-detail"/);
  assert.match(hearthHtml, /id="correspondence-detail"/);
  assert.match(hearthHtml, /Executive Inbox/);
  assert.match(hearthHtml, /Only conversations that need judgment appear here/);
  assert.match(hearthHtml, /data-correspondence-list/);
  assert.match(hearthHtml, /data-correspondence-count/);
  assert.match(hearthHtml, /data-correspondence-draft-preview/);
  assert.match(hearthHtml, /data-correspondence-draft-body/);
  assert.match(hearthHtml, /data-correspondence-thread-body/);
  assert.match(hearthHtml, /data-correspondence-relationships/);
  assert.match(hearthHtml, /data-correspondence-projects/);
  assert.match(hearthHtml, /data-correspondence-rule-suggestions/);
  assert.match(hearthHtml, /data-correspondence-forward-to/);
  assert.match(hearthHtml, /Type New Rule Here/);
  assert.match(hearthHtml, /data-correspondence-rules-panel/);
  assert.match(hearthHtml, /role="dialog"/);
  assert.match(hearthHtml, /data-correspondence-rules-close/);
  assert.match(hearthHtml, /data-correspondence-action="show_rules"/);
  assert.match(hearthHtml, /data-correspondence-action="save_forward_rule"/);
  assert.match(hearthHtml, /data-correspondence-action="suggest_rules"/);
  assert.match(hearthHtml, /Rules VAL Suggests/);
  assert.match(hearthHtml, /data-correspondence-action="send"/);
  assert.match(hearthHtml, /data-correspondence-action="cowork_correspondence"/);
  assert.match(hearthHtml, /Discuss this thread with VAL/);
  assert.match(hearthHtml, /data-drawer-cowork-icon/);
  assert.match(hearthHtml, /onclick="runCorrespondenceActionClick\(this,event\);return false;"/);
  assert.match(hearthHtml, /data-correspondence-action="not_executive_contact"/);
  assert.match(hearthHtml, />Not executive contact</);
  assert.doesNotMatch(correspondenceDrawerHtml, /Review Boundary/);
  assert.doesNotMatch(correspondenceDrawerHtml, /Relationship Context/);
  assert.doesNotMatch(correspondenceDrawerHtml, /Prepared Judgment/);
  assert.doesNotMatch(correspondenceDrawerHtml, /class="correspondence-context"/);
  assert.doesNotMatch(correspondenceDrawerHtml, /data-correspondence-evidence/);
  assert.doesNotMatch(correspondenceDrawerHtml, /Review in Leverage/);
  assert.doesNotMatch(correspondenceDrawerHtml, /Prepare draft/);
  assert.doesNotMatch(correspondenceDrawerHtml, /Tighten draft/);
  assert.doesNotMatch(correspondenceDrawerHtml, /Drafting is internal prep work inside VAL/);
  assert.doesNotMatch(correspondenceDrawerHtml, /Sending represents Jessa externally/);
  assert.doesNotMatch(hearthHtml, /Send draft/);
  assert.doesNotMatch(hearthHtml, /<a href="\.\/inbox\.html" class="drawer-link" data-drawer-tone="blush-sage">/);
  assert.match(hearthJs, /const correspondenceDrawerLink/);
  assert.match(hearthJs, /const correspondenceDraftBody/);
  assert.match(hearthJs, /function hydrateCorrespondenceDrawer/);
  assert.match(hearthJs, /\/api\/val\/ready-for-you\/build/);
  assert.match(hearthJs, /\/api\/val\/email\/review-drafts\?limit=20/);
  assert.match(hearthJs, /\/api\/email\/intelligence\?days=30&limit=75/);
  assert.match(hearthJs, /correspondenceItemsFromEmailIntelligence\(intelligence\)/);
  assert.match(hearthJs, /const actionable = \['needs_reply','needs_attention','forward_to_team','appointment_recap_needed'\]/);
  assert.doesNotMatch(hearthJs, /\.concat\(result\.waitingOnResponse \|\| \[\]\)/);
  assert.match(hearthJs, /const ruleActions = \['show_rules', 'save_forward_rule', 'suggest_rules'\]/);
  assert.match(hearthJs, /drawerUtilityAction = \['show_rules', 'save_forward_rule', 'suggest_rules'\]\.includes\(correspondenceActionId\)/);
  assert.match(hearthJs, /drawerUtilityAction && !activeCorrespondenceItem/);
  assert.match(hearthJs, /data-correspondence-scan-status/);
  assert.match(hearthJs, /correspondenceScanInFlight/);
  assert.match(hearthJs, /Scanned the last ' \+ scanDays \+ ' days\. No unread Gmail threads crossed the Executive Inbox judgment gate\./);
  assert.match(hearthJs, /if\(String\(item\.draftBody \|\| ''\)\.trim\(\)\) actions\.unshift\('send'\)/);
  assert.match(hearthJs, /No private draft is waiting for review/);
  assert.match(hearthJs, /correspondenceDraftBody\.value = selected\?\.draftBody/);
  assert.match(hearthJs, /correspondenceDraftBody\?\.addEventListener\('input'/);
  assert.match(hearthJs, /action === 'cowork_correspondence'/);
  assert.match(hearthJs, /async function openCorrespondenceThreadCowork/);
  assert.match(hearthJs, /entrypointId:'email\.thread'/);
  assert.match(hearthJs, /data-cowork-open-email-thread-draft/);
  assert.match(hearthJs, /if\(action === 'cowork_correspondence'\)\{\s*await openCorrespondenceThreadCowork\(item\);/);
  assert.match(hearthJs, /function renderCorrespondenceThread/);
  assert.match(hearthJs, /function correspondenceAttachmentsFromSource/);
  assert.match(hearthJs, /correspondence-thread-attachments/);
  assert.match(hearthJs, /correspondenceCompactText\(body,3600\)/);
  assert.match(hearthJs, /function saveCorrespondenceForwardRule/);
  assert.match(hearthJs, /function renderCorrespondenceRulesPanel/);
  assert.match(hearthJs, /function setCorrespondenceRulesPanel/);
  assert.match(hearthJs, /data-correspondence-suggestion-accept/);
  assert.match(hearthJs, /\/api\/email\/rules/);
  assert.match(hearthJs, /\/api\/email\/rule-suggestions\/analyze/);
  assert.match(hearthJs, /function scrollCorrespondenceActionsIntoView\(\)/);
  assert.match(hearthJs, /scrollCorrespondenceActionsIntoView\(\)/);
  assert.match(hearthJs, /inspectOnlyAction = \['cowork_correspondence', 'not_executive_contact', 'show_rules', 'save_forward_rule', 'suggest_rules'\]\.includes\(correspondenceActionId\)/);
  assert.match(hearthJs, /allowBlockedForInspection:inspectOnlyAction/);
  assert.match(hearthJs, /runCorrespondenceActionClick\(button, event\)/);
  assert.match(hearthJs, /function showCorrespondenceLocalBoundary/);
  assert.match(hearthJs, /function correspondenceSuggestedActions/);
  assert.match(hearthJs, /function correspondenceSuppressionContact/);
  assert.match(hearthJs, /const senderEmail = from\.email \|\| source\.from\?\.email \|\| source\.senderEmail/);
  assert.match(hearthJs, /email: senderEmail \|\| item\.recipientEmail/);
  assert.match(hearthJs, /\/api\/val\/executive-inbox\/not-executive-contact/);
  assert.match(hearthJs, /action === 'not_executive_contact'/);
  assert.match(hearthJs, /button\.hidden = !allowed/);
  assert.match(hearthJs, /action:'email:select'/);
  assert.match(hearthJs, /allowBlockedForInspection:true, source:\{email:selected/);
  assert.match(hearthJs, /function correspondenceSendPayload/);
  assert.match(hearthJs, /\/api\/val\/external-actions\/email-send-now/);
  assert.match(hearthJs, /hearth_executive_inbox_drawer/);
  assert.match(hearthJs, /restoreCorrespondenceWindow/);
  assert.match(hearthCss, /\.drawer-tray\.correspondence-open \.correspondence-detail/);
  assert.match(hearthCss, /\.drawer-tray\.correspondence-open \.drawer-grid/);
  assert.match(hearthCss, /\.correspondence-workbench/);
  assert.match(hearthCss, /\.correspondence-rulebar/);
  assert.match(hearthCss, /\.correspondence-thread/);
  assert.match(hearthCss, /\.correspondence-thread-body\{[\s\S]{0,180}align-content:start/);
  assert.match(hearthCss, /\.correspondence-thread-message\{[\s\S]{0,180}align-content:start/);
  assert.match(hearthCss, /\.correspondence-thread-attachments/);
  assert.match(hearthCss, /\.correspondence-intelligence/);
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
  assert.doesNotMatch(hearthHtml, /data-commitment-action="cowork_commitment"/);
  assert.match(hearthJs, /mode === 'commitment'/);
  assert.match(hearthHtml, /data-commitment-action="draft_email"/);
  assert.match(hearthHtml, /data-commitment-action="create_task"/);
  assert.match(hearthHtml, /data-commitment-action="complete"/);
  assert.match(hearthHtml, /data-commitment-action="resolve_contact"/);
  assert.doesNotMatch(hearthHtml, /<a href="\.\/dashboard\.html" class="drawer-link commitment-drawer-link"/);
  assert.match(hearthJs, /const commitmentDrawerLink/);
  assert.match(hearthJs, /function hydrateCommitmentDrawer/);
  assert.match(hearthJs, /function commitmentSummaryFromItems/);
  assert.match(hearthJs, /function scrollCommitmentActionsIntoView/);
  assert.match(hearthJs, /function commitmentSuggestedActions/);
  assert.match(hearthJs, /function commitmentSource/);
  assert.match(hearthJs, /function commitmentActionNeedsLiveConfirmation/);
  assert.match(hearthJs, /suggestedActions: commitmentSuggestedActions/);
  assert.match(hearthJs, /button\.hidden = !allowed/);
  assert.match(hearthJs, /button\.classList\.toggle\('active', isActive\)/);
  assert.match(hearthJs, /\/api\/val\/commitments\?limit=120/);
  assert.match(hearthJs, /\/api\/val\/commitments\/' \+ encodeURIComponent\(item\.id\) \+ '\/draft-email/);
  assert.match(hearthJs, /function restoreCommitmentWindow/);
  assert.match(hearthJs, /workspaceReturnTarget === 'commitment'/);
  assert.match(hearthJs, /action === 'cowork_commitment'/);
  assert.match(hearthJs, /action:'commitment:' \+ action/);
  assert.match(hearthJs, /allowBlockedForInspection:true, source:commitmentSource/);
  assert.match(hearthJs, /preflight\.packet\?\.status === 'blocked' && commitmentActionNeedsLiveConfirmation/);
  assert.match(hearthJs, /updateCommitmentSummary\(commitmentSummaryFromItems\(currentCommitmentItems\)\)/);
  assert.match(hearthJs, /no draft, task, schedule change, status update, delegation, dismissal, send, CRM update, or calendar change happened/);
  assert.match(hearthJs, /renderHearthPacketReceiptStrip\(lastHearthPacketReceipt\)/);
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
  assert.match(hearthHtml, /data-document-intake-scan/);
  assert.match(hearthHtml, /data-document-list/);
  assert.match(hearthHtml, /data-document-preview/);
  assert.doesNotMatch(hearthHtml, /data-document-action="cowork_document"/);
  assert.match(hearthJs, /mode === 'document'/);
  assert.match(hearthHtml, /data-document-action="present"/);
  assert.match(hearthHtml, /data-document-action="update"/);
  assert.match(hearthHtml, /data-document-action="send"/);
  assert.match(hearthHtml, /data-document-action="link_context"/);
  assert.doesNotMatch(hearthHtml, /data-relationship-document-panel/);
  assert.doesNotMatch(hearthHtml, /data-relationship-document-count/);
  assert.match(hearthJs, /const relationshipDocumentPanel = document\.querySelector\('\[data-relationship-document-panel\]'\)/);
  assert.match(hearthHtml, /data-project-manager-profile/);
  assert.match(hearthJs, /Documents \/ sources/);
  assert.doesNotMatch(hearthHtml, /<a href="\.\/documents\.html" class="drawer-link" data-drawer-tone="rose-mist">/);
  assert.match(hearthJs, /const documentDrawerLink/);
  assert.match(hearthJs, /const localDocumentItems/);
  assert.match(hearthJs, /function localStoredDocuments/);
  assert.match(hearthJs, /val_docs_v1/);
  assert.match(hearthJs, /function documentLooksLikeCalendarInvite/);
  assert.match(hearthJs, /\.ics/);
  assert.match(hearthJs, /text\\\/calendar/);
  assert.match(hearthJs, /function documentItemsWithoutCalendarInvites/);
  assert.match(hearthJs, /documentItemsWithoutCalendarInvites\(items\)\.map\(documentWithProjectAssignment\)/);
  assert.match(hearthJs, /function documentItemsFromReady/);
  assert.match(hearthJs, /function normalizeCanonicalDocumentItem/);
  assert.match(hearthJs, /\/api\/val\/documents\?limit=120/);
  assert.match(hearthJs, /function scanDocumentIntakeFromGmail/);
  assert.match(hearthJs, /\/api\/email\/gmail\/refresh/);
  assert.match(hearthJs, /function documentIntakeStatusLine/);
  assert.match(hearthJs, /function documentItemsFromGmailScan/);
  assert.match(hearthJs, /documentLooksLikeCalendarInvite\(attachment\)/);
  assert.match(hearthJs, /persistLocalDocumentItems\(scannedDocuments\)/);
  assert.match(hearthJs, /gmail_scan_attachment/);
  assert.match(hearthJs, /documentCandidates/);
  assert.match(hearthJs, /providers\.documentAttachmentCount/);
  assert.match(hearthJs, /action:'document:scan_gmail'/);
  assert.match(hearthJs, /\/api\/val\/ready-for-you\/build/);
  assert.match(hearthJs, /function filteredDocumentItems/);
  assert.match(hearthJs, /function documentItemsWithProjectAssignments/);
  assert.match(hearthJs, /function scrollDocumentActionsIntoView/);
  assert.match(hearthJs, /function documentSuggestedActions/);
  assert.match(hearthJs, /function documentSource/);
  assert.match(hearthJs, /function documentActionNeedsLiveConfirmation/);
  assert.match(hearthJs, /suggestedActions: documentSuggestedActions/);
  assert.match(hearthJs, /if\(hasBody && hasRecipient && !isPreviewOnly\) push\('send'\)/);
  assert.match(hearthJs, /button\.hidden = !allowed/);
  assert.match(hearthJs, /button\.classList\.toggle\('active', isActive\)/);
  assert.match(hearthJs, /event\.preventDefault\(\);\n\s+event\.stopPropagation\(\);\n\s+const selected = currentDocumentItems\.find/);
  assert.match(hearthJs, /renderDocumentBrief\(selected\);\n\s+void ensureHearthClickPacket/);
  assert.match(hearthJs, /item\.relationship/);
  assert.match(hearthJs, /item\.project/);
  assert.match(hearthJs, /function openDocumentWorkspace/);
  assert.match(hearthJs, /openWorkspaceShell\(actionLabel, \{returnTarget:'document'\}\)/);
  assert.match(hearthJs, /renderHearthPacketReceiptStrip\(lastHearthPacketReceipt\)/);
  assert.match(hearthJs, /action === 'cowork_document'/);
  assert.match(hearthJs, /function documentSendPayload/);
  assert.match(hearthJs, /hearth_documents_drawer/);
  assert.match(hearthJs, /\/api\/val\/external-actions\/email-send-packet/);
  assert.match(hearthJs, /action:'document:' \+ action/);
  assert.match(hearthJs, /allowBlockedForInspection:true, source:documentSource/);
  assert.match(hearthJs, /preflight\.packet\?\.status === 'blocked' && documentActionNeedsLiveConfirmation/);
  assert.match(hearthJs, /no document, email, CRM record, Google Doc, Drive file, or external system was changed/);
  assert.match(hearthJs, /function hydrateRelationshipDocuments/);
  assert.match(hearthJs, /function hydrateProjectDocuments/);
  assert.match(hearthJs, /\/api\/val\/documents\/reference\?relationship=/);
  assert.match(hearthJs, /\/api\/val\/documents\/reference\?project=/);
  assert.match(hearthJs, /Back to Documents drawer/);
  assert.match(hearthJs, /restoreDocumentWindow/);
  assert.match(hearthCss, /\.drawer-tray\.document-open \.document-detail/);
  assert.match(hearthCss, /\.document-status-panel/);
  assert.match(hearthCss, /\.document-library-controls/);
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

test('Stewardship V1 is an introduction engine with Network discovery', () => {
  assert.match(hearthHtml, /data-relationship-search/);
  assert.match(hearthHtml, /data-relationship-index-source/);
  assert.match(hearthHtml, /stewardship-network-map/);
  assert.match(hearthHtml, /data-stewardship-view="suggested"/);
  assert.match(hearthHtml, /data-stewardship-view="create"/);
  assert.match(hearthHtml, /data-stewardship-view="network"/);
  assert.match(hearthHtml, /Suggested Introductions/);
  assert.match(hearthHtml, /Create Introduction/);
  assert.match(hearthHtml, />Network</);
  assert.match(hearthHtml, /Who should I introduce, and why/);
  assert.match(hearthHtml, /data-stewardship-suggestions/);
  assert.match(hearthHtml, /data-stewardship-person-a/);
  assert.match(hearthHtml, /data-stewardship-person-b/);
  assert.match(hearthHtml, /data-stewardship-network-detail/);
  assert.doesNotMatch(hearthHtml, /data-relationship-sort/);
  assert.doesNotMatch(hearthHtml, /data-relationship-state-filter/);
  assert.doesNotMatch(hearthHtml, /data-relationship-temperature-review/);
  assert.doesNotMatch(hearthHtml, /data-relationship-packet-audit/);
  assert.doesNotMatch(hearthHtml, /Round-table inputs VAL needs before this brief can be trusted/);
  assert.doesNotMatch(hearthHtml, /Linked Projects/);
  assert.doesNotMatch(hearthHtml, /People to watch/);
  assert.doesNotMatch(hearthHtml, /Active stewardship/);
  assert.doesNotMatch(hearthHtml, /Network Stewardship/);
  assert.doesNotMatch(hearthHtml, /class="relationship-actions"/);
  assert.doesNotMatch(hearthHtml, /<button type="button" data-relationship-action="cowork_relationship">Co-Work with VAL<\/button>/);
  assert.match(hearthJs, /mode === 'relationship'/);
  assert.doesNotMatch(hearthHtml, /data-relationship-action="teach_temperature"/);
  assert.match(hearthJs, /function relationshipIndexSourceProfiles/);
  assert.match(hearthJs, /return relationshipIndexLoaded \? relationshipIndexProfiles : \{\}/);
  assert.match(hearthJs, /function updateRelationshipIndexSourceLabel/);
  assert.match(hearthJs, /function relationshipProfileFromIndexItem/);
  assert.match(hearthJs, /\/api\/relationships\/person-packets\?limit=160&includeThin=1/);
  assert.match(hearthJs, /function relationshipProfileWithPersonPacket/);
  assert.match(hearthJs, /function stewardshipPeople/);
  assert.match(hearthJs, /function stewardshipBestMatches/);
  assert.match(hearthJs, /function stewardshipIsFallbackRow/);
  assert.match(hearthJs, /function stewardshipIsGenericClassifierRow/);
  assert.match(hearthJs, /function stewardshipActionableRows/);
  assert.match(hearthJs, /function stewardshipLooksLikePerson/);
  assert.match(hearthJs, /function stewardshipNameTokens/);
  assert.match(hearthJs, /function stewardshipIntroFit/);
  assert.match(hearthJs, /function stewardshipRelationshipEvidenceMap/);
  assert.match(hearthJs, /function stewardshipHasRecentDirectCommunication/);
  assert.match(hearthJs, /function stewardshipPairPassesFreshness/);
  assert.match(hearthJs, /recent direct communication with at least one person in the last 14 days/);
  assert.match(hearthJs, /function renderStewardshipSuggestions/);
  assert.match(hearthJs, /function renderStewardshipComparison/);
  assert.match(hearthJs, /function renderStewardshipNetworkDetail/);
  assert.match(hearthJs, /No clear \(need\|offer\) is ready yet/);
  assert.match(hearthJs, /Email may involve a document request or document follow-up/);
  assert.match(hearthJs, /Transcript-derived introduction opportunity: review the source snippet before preparing any introduction/);
  assert.match(hearthJs, /clear','ready','still','developing/);
  assert.match(hearthJs, /\^\\d\{7,\}\$/);
  assert.match(hearthJs, /meet\\s\*up\|zoom\|gmail\|google\|calendar/);
  assert.match(hearthJs, /two named people with relationship packets/);
  assert.match(hearthJs, /const aActionableNeeds = stewardshipActionableRows\(aNeeds\)/);
  assert.match(hearthJs, /const bActionableOffers = stewardshipActionableRows\(bOffers\)/);
  assert.match(hearthJs, /candidateNamedInTranscript/);
  assert.match(hearthJs, /transcript evidence says Jessa wanted to introduce/);
  assert.match(hearthJs, /explicit \? 20 : 0/);
  assert.match(relationshipActionService, /function genericStewardshipClassifierText/);
  assert.match(relationshipActionService, /genericStewardshipClassifierText\(item\)/);
  assert.match(relationshipActionService, /function relationshipEvidenceMapForContact/);
  assert.match(relationshipActionService, /relationship_evidence_map:relationshipEvidenceMap/);
  assert.match(server, /function relationshipEvidenceMapFromRows/);
  assert.match(server, /STEWARDSHIP_SUGGESTED_INTRO_RECENCY_DAYS=14/);
  assert.match(server, /freshForSuggestedIntroductions/);
  assert.match(hearthJs, /Can VAL write one clean sentence|Because /);
  assert.match(hearthJs, /I do not see a strong reason to introduce these two yet/);
  assert.match(hearthJs, /Best Matches/);
  assert.match(hearthJs, /Who Should /);
  assert.match(hearthJs, /Missing Piece \/ Constraints/);
  assert.match(hearthJs, /data-stewardship-create-with/);
  assert.match(hearthJs, /data-stewardship-review-manual/);
  assert.match(hearthJs, /data-stewardship-draft-pair/);
  assert.doesNotMatch(hearthJs, /VAL is reading this from the canonical relationship index/);
  assert.doesNotMatch(server, /VAL is reading this from the canonical relationship index/);
  assert.match(hearthJs, /email: item\.query\?\.email \|\| item\.email \|\| ''/);
  assert.match(hearthJs, /contactId: item\.query\?\.contactId \|\| item\.contactId \|\| item\.crmContactId \|\| ''/);
  assert.match(hearthJs, /function dedupeRelationshipProfiles/);
  assert.match(hearthJs, /function relationshipCanonicalKey/);
  assert.match(hearthJs, /function preferRelationshipProfile/);
  assert.doesNotMatch(hearthJs, /function relationshipPacketAuditRows/);
  assert.doesNotMatch(hearthCss, /\.relationship-packet-audit/);
  assert.match(hearthJs, /row\.className = 'relationship-rolodex-row'/);
  assert.match(hearthJs, /async function hydrateRelationshipIndex/);
  assert.match(hearthJs, /\/api\/relationships\/index\?limit=120/);
  assert.match(hearthJs, /VAL relationship index/);
  assert.match(hearthJs, /Local preview/);
  assert.match(hearthJs, /function appendRelationshipRolodexRow/);
  assert.match(hearthJs, /relationshipRolodex\.dataset\.relationshipDensity = items\.length >= 12 \? 'compact' : 'comfortable'/);
  assert.match(hearthJs, /relationshipItemMatchesSearch/);
  assert.match(hearthJs, /No Network matches this search/);
  assert.match(hearthJs, /button\.dataset\.relationshipOpenProfile = item\.id/);
  assert.match(server, /profile=>profile\.profileType==='person'/);
  assert.match(server, /relationships:profiles\.map\(relationshipIndexItemFromProfile\)/);
  assert.match(hearthCss, /\.relationship-index-source/);
  assert.match(hearthCss, /\.relationship-intro-tabs/);
  assert.match(hearthCss, /\.stewardship-suggestion-card/);
  assert.match(hearthCss, /\.stewardship-create-grid/);
  assert.match(hearthCss, /\.stewardship-network-layout/);
  assert.match(hearthCss, /\.stewardship-best-matches/);
  assert.match(hearthCss, /\.relationship-rolodex\[data-relationship-density="compact"\]/);
  assert.match(hearthCss, /\.relationship-rolodex-row/);
});

test('Hearth calendar prep is connected to the meeting prep backend contract', () => {
  const meetingPrepResultBlock = hearthJs.slice(
    hearthJs.indexOf('function renderMeetingPrepResult'),
    hearthJs.indexOf('async function runMeetingPrep')
  );
  assert.match(hearthJs, /\/api\/val\/calendar\/meeting-prep/);
  assert.match(hearthJs, /\/api\/calendar\/sidebar/);
  assert.match(hearthJs, /function hydrateCalendarPanel/);
  assert.match(hearthJs, /function renderCalendarAgenda/);
  assert.match(hearthJs, /hydrateCalendarPanel\(\);/);
  assert.match(hearthJs, /function renderMeetingPrepResult/);
  assert.match(hearthJs, /activeMeetingPrepEvent/);
  assert.doesNotMatch(hearthJs, /VAL is assembling the two-minute executive brief for this meeting/);
  assert.doesNotMatch(hearthJs, /VAL is checking attendees, relationship context, projects, transcripts, email, and public stewardship signals/);
  assert.doesNotMatch(hearthJs, /The final card will show what matters, how to enter, what to ask, and what to watch/);
  assert.match(hearthJs, /postJson\('\/api\/val\/calendar\/meeting-prep', \{event\}\)/);
  assert.match(hearthJs, /function meetingPrepQualityLine/);
  assert.match(hearthJs, /function meetingPrepStakesLine/);
  assert.match(hearthJs, /function meetingPrepSourceSummary/);
  assert.match(hearthJs, /function meetingPrepExecutiveBrief/);
  assert.match(hearthJs, /function renderMeetingPrepExecutiveBrief/);
  assert.match(hearthJs, /function openMeetingPrepCoworkSession/);
  assert.match(hearthJs, /hearth\.classList\.contains\('calendar-prep-open'\) && workspaceOpen \? 'meeting_prep'/);
  assert.match(hearthJs, /const prepPromise = openMeetingPrep\(\)/);
  assert.match(hearthJs, /if\(mode === 'meeting_prep'\)\{[\s\S]{0,140}openMeetingPrepCoworkSession\(\)/);
  assert.match(hearthJs, /function meetingPrepHasUsefulContext/);
  assert.match(hearthJs, /function calendarEventIsMeeting/);
  assert.match(hearthJs, /function calendarEventIsFutureMeeting/);
  assert.match(hearthJs, /currentMeetingEvents = visibleEvents\.filter\(calendarEventIsFutureMeeting\)/);
  assert.match(hearthJs, /Past event - open matching transcript/);
  assert.match(hearthJs, /function openCalendarTranscriptFromEvent/);
  assert.match(hearthJs, /\/api\/val\/calendar\/matching-transcripts/);
  assert.match(hearthJs, /calendarEventIsPast\(eventRecord\)/);
  assert.match(server, /app\.post\('\/api\/val\/calendar\/matching-transcripts'/);
  assert.match(hearthJs, /Solo blocks stay out of meeting prep/);
  assert.match(hearthJs, /only the calendar title and time are available/);
  assert.match(hearthJs, /Executive Readiness/);
  assert.match(hearthJs, /The Purpose/);
  assert.match(hearthJs, /Who You Are Meeting/);
  assert.match(hearthJs, /What Changed Since You Last Spoke/);
  assert.match(hearthJs, /Relationship Intelligence/);
  assert.match(hearthJs, /Suggested Opening/);
  assert.match(hearthJs, /Suggested Questions/);
  assert.match(hearthJs, /workspaceActions\.innerHTML = renderWorkspaceActionButtons\(\[\{label:'Co-Work with VAL', workflow:'meetingPrepCowork'\}\]\)/);
  assert.match(hearthJs, /if\(command === 'meetingPrepCowork'\)/);
  assert.match(hearthJs, /let activeCoworkHeldContext = ''/);
  assert.match(hearthJs, /activeCoworkHeldContext = \[initialValue, safeTitle, meaning, recommendation, helper, \.\.\.context\]\.filter\(Boolean\)\.join\('\\n'\)/);
  assert.match(hearthJs, /renderHomeCoworkPreview\(\{/);
  assert.match(hearthJs, /contextualCoworkHeading/);
  assert.match(hearthJs, /VAL is holding the relevant context privately/);
  assert.match(hearthJs, /Use this held context silently/);
  assert.match(hearthJs, /VAL is holding the Meeting Prep brief privately/);
  assert.match(hearthJs, /preserveHeldCoworkContext = \/co-work\|cowork\/i/);
  assert.doesNotMatch(hearthJs, /value: initialValue \|\| ''/);
  assert.match(hearthCss, /\.workspace-grid\[hidden\]\{display:none!important\}/);
  assert.doesNotMatch(meetingPrepResultBlock, /workflow: 'pipeline'/);
  assert.doesNotMatch(meetingPrepResultBlock, /label: 'Prepare follow-up'/);
  assert.doesNotMatch(meetingPrepResultBlock, /Open full calendar/);
  assert.doesNotMatch(meetingPrepResultBlock, /Open Transcripts/);
  assert.doesNotMatch(meetingPrepResultBlock, /Close and return to desk/);
  assert.match(hearthHtml, /data-calendar-packet-receipt/);
  assert.match(hearthJs, /function meetingPrepAttendeeIdentityLines/);
  assert.match(hearthJs, /not in CRM yet\. Create the contact before VAL attaches relationship context/);
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
  assert.match(hearthHtml, /class="hearth-brand-cluster"/);
  assert.match(hearthHtml, /class="observer-board-button val-board-logo-button"/);
  assert.match(hearthHtml, /aria-label="Meet with your Board of Observers"/);
  assert.match(hearthHtml, /data-tooltip="Meet w\/ your Board of Observers"/);
  assert.match(hearthHtml, /<img src="\.\/assets\/val-favicon\.png" alt="VAL">/);
  assert.match(hearthHtml, /class="linkedin-widget"/);
  assert.match(hearthHtml, /data-linkedin-ready-count/);
  assert.match(hearthJs, /function runCowork/);
  assert.match(hearthJs, /\/api\/val\/chat/);
  assert.match(hearthJs, /function renderHomeCoworkPreview/);
  assert.match(hearthJs, /home-cowork-chatbar/);
  assert.match(hearthJs, /home-cowork-workspace/);
  assert.match(hearthJs, /home-cowork-sidebar/);
  assert.match(hearthJs, /home-cowork-thread/);
  assert.match(hearthJs, /data-home-cowork-response/);
  assert.match(hearthJs, /<textarea data-workspace-input="cowork"/);
  assert.match(hearthJs, /function appendHomeCoworkMessage/);
  assert.match(hearthJs, /keepHomeCoworkOpen/);
  assert.match(hearthJs, /What shall we accomplish together\?/);
  assert.match(hearthJs, /activeCoworkHeldContext = ''/);
  assert.match(hearthJs, /function orientHomeCoworkFromInput/);
  assert.match(hearthJs, /VAL is finding the right context/);
  assert.match(hearthJs, /data-home-cowork-submit/);
  assert.match(hearthJs, /runCowork\('think'\)/);
  assert.match(hearthJs, /const observerBoardState/);
  assert.match(hearthJs, /function openObserverBoard/);
  assert.match(hearthJs, /title: 'Your Board of Observers'/);
  assert.match(hearthJs, /No live Board packet is loaded for this session yet/);
  assert.match(hearthJs, /Board readiness/);
  assert.match(hearthJs, /if\(workspaceGrid\) workspaceGrid\.hidden = true/);
  assert.match(hearthJs, /observer-truth-card/);
  assert.match(hearthJs, /If this view claims certainty without a packet, that is a bug/);
  assert.match(hearthJs, /if\(command === 'cancel'\)\{/);
  assert.doesNotMatch(hearthJs, /larger morning intact/);
  assert.doesNotMatch(hearthJs, /protecting the morning/);
  assert.doesNotMatch(hearthJs, /Chief of Staff view/);
  assert.match(hearthJs, /'Truth', 'Evidence', 'Tension', 'Synthesis'/);
  assert.match(hearthJs, /observerBoardButton\?\.addEventListener\('click', openObserverBoard\)/);
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
  assert.match(hearthCss, /\.observer-board-button/);
  assert.match(hearthCss, /\.observer-board-button img/);
  assert.match(hearthCss, /observer-board-pulse/);
  assert.match(hearthCss, /\.observer-board-mode \.workspace-panel/);
  assert.match(hearthCss, /\.desk-workspace\.home-cowork-mode/);
  assert.match(hearthCss, /\.home-cowork-workspace/);
  assert.match(hearthCss, /\.home-cowork-thread/);
  assert.match(hearthCss, /\.home-cowork-mark/);
  assert.match(hearthCss, /\.home-cowork-context/);
  assert.match(hearthCss, /\.home-cowork-chatbar/);
  assert.match(hearthCss, /\.home-cowork-chatbar textarea/);
  assert.match(hearthJs, /const linkedinVisibilityItems/);
  assert.match(hearthJs, /function openLinkedInEngagementWorkspace/);
  assert.match(hearthJs, /function renderLinkedInEngagementList/);
  assert.match(hearthJs, /openWorkspaceShell\('LinkedIn visibility workspace', \{returnTarget:'home'\}\)/);
  assert.match(hearthJs, /data-linkedin-copy/);
  assert.match(hearthJs, /data-linkedin-link/);
  assert.match(hearthJs, /VAL never auto-publishes LinkedIn posts, comments, or DMs/);
  assert.match(hearthCss, /\.linkedin-widget/);
  assert.match(hearthCss, /\.linkedin-engagement-list/);
  assert.match(hearthCss, /\.linkedin-engagement-actions button,\n\.linkedin-engagement-actions a/);
  assert.match(hearthJs, /No external action was taken/);
});

test('Hearth Co-Work opens immediately and above active drawers', () => {
  const homeCowork = hearthJs.match(/async function openCoworkSessionWithPacket[\s\S]*?\n}\n\nasync function openTeachValSessionWithPacket/)[0];
  const projectCowork = hearthJs.match(/async function openProjectScopedCowork[\s\S]*?\n}\n\nfunction openProjectFieldCowork/)[0];
  assert.ok(homeCowork.indexOf('openCoworkSession();') < homeCowork.indexOf('ensureHearthClickPacket'));
  assert.ok(projectCowork.indexOf('openContextualCoworkSession') < projectCowork.indexOf('ensureHearthClickPacket'));
  assert.match(homeCowork, /allowBlockedForInspection:true/);
  assert.match(projectCowork, /allowBlockedForInspection:true/);
  assert.match(hearthCss, /\.desk-workspace\.home-cowork-mode\{\n  position:fixed;\n  z-index:1800;/);
  assert.match(hearthCss, /\.hearth-shell \.desk-workspace\.home-cowork-mode\[aria-hidden="false"\]\{\n  z-index:1800;/);
  assert.match(hearthCss, /\.retrieval-system\.open\{\n  z-index:1300/);
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
  assert.match(hearthJs, /return compactSentence\(email\.subject, fallback \|\| 'Email needing attention'\)/);
  assert.match(hearthJs, /const id = email\.messageId \|\| email\.threadId \|\| metadata\.sourceId/);
  assert.match(hearthJs, /return \{type:'email', id:String\(id \|\| ''\), label:itemTitle\(item, 'Email needing attention'\)\}/);
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
  assert.doesNotMatch(hearthJs, /data-home-room-item="/);
  assert.doesNotMatch(hearthJs, /openHomeItemWorkspaceFromButton/);
  assert.match(hearthJs, /Source receipt display rule/);
  assert.match(hearthJs, /data-home-room-item-action/);
  assert.match(hearthJs, /activateHomeQueueItem\(node\.dataset\.homeRoomItemAction, node\.dataset\.homeRoomIndex\)/);
  assert.match(hearthJs, /Stored evidence is linked to this signal/);
  assert.match(hearthJs, /function suggestedHomeActionsForItem/);
  assert.match(hearthJs, /function suggestedRecommendationForHomeItem/);
  assert.match(hearthJs, /function executiveHomeBriefTitle/);
  assert.match(hearthJs, /function executiveHomeMeaning/);
  assert.match(hearthJs, /function executiveHomeUnderstanding/);
  assert.match(hearthJs, /function executiveHomeRecommendation/);
  assert.match(hearthJs, /Working memory changed: test what VAL now believes/);
  assert.match(hearthJs, /The executive shift is that future recommendations may now follow those truths/);
  assert.match(hearthJs, /function isConcreteHomeActionItem/);
  assert.match(hearthJs, /function homeAdmissionFilter/);
  assert.match(hearthJs, /const admittedLeverageItems = homeAdmissionFilter\('leverage', leverageItems\)/);
  assert.match(hearthJs, /const admittedQueueItems = homeAdmissionFilter\('leverage', queueItems\)/);
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
  assert.match(hearthJs, /Open CRM opportunity/);
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
  assert.match(hearthHtml, /hearth-prototype\.css\?v=transcript-ready-send-20260713/);
  assert.match(hearthHtml, /hearth-prototype\.js\?v=transcript-ready-send-20260713/);
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
  assert.match(hearthJs, /if\(!node\.dataset\.valVariablePacket\) node\.dataset\.valVariablePacket = entry\.packet/);
  assert.match(hearthJs, /spec\.packet \? ' data-val-variable-packet="' \+ escapeHtml\(spec\.packet\) \+ '"'/);
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

test('Stewardship drawer contract keeps round table packet and user view separated', () => {
  [
    'Round Table decides.',
    'Packet stores.',
    'Custom fields persist.',
    'Drawer displays.',
    'User approves action.',
    'Stewardship Round Table',
    'Stewardship Packet',
    'What The User Sees',
    'Your network is one of your greatest assets. Stewardship is how you care for it.',
    'Rather than simply storing contacts, VAL continuously looks for ways to create value',
    'Help me care for this relationship well.',
    'Stewardship Status',
    'Current Understanding',
    'Why It Matters Now',
    'Relationship History',
    'Ways They Create Value',
    'Opportunities to Help',
    'network cluster',
    'stewardship move packet',
    'Prepared introduction drafts feed the Home Leverage card only when the stewardship move type is introduction',
    'The user should not see:',
    'packet names',
    'source-of-source',
    'graph links',
    'confidence debug'
  ].forEach((required) => assert.ok(valStewardshipRoundTable.includes(required), 'Missing Stewardship contract: ' + required));
  assert.match(hearthPacketCompleteness, /How well is this relationship being stewarded/);
  assert.match(hearthPacketCompleteness, /What are the major relationship history chapters/);
  assert.match(hearthPacketCompleteness, /Is a network cluster or ecosystem forming/);
  assert.match(hearthPacketCompleteness, /network is one of their greatest assets/);
  assert.match(hearthPacketCompleteness, /## Stewardship \/ Relationship Packet/);
  assert.match(hearthTruthLineageMap, /user sees the clean Stewardship conclusion/);
  assert.match(hearthClickContracts, /\| Stewardship drawer \|/);
  assert.match(valConstitution, /Round Table decides\.[\s\S]*Packet stores\.[\s\S]*Custom fields persist\.[\s\S]*Drawer displays\.[\s\S]*User approves action\./);
  assert.match(valConstitution, /Your network is one of your greatest assets\. Stewardship is how you care for it\./);
});

test('VAL Constitution protects executive reasoning architecture as cognitive architecture', () => {
  [
    'Round Tables, Packets, and Prompt Layering are not implementation details. They are how VAL thinks.',
    'Reality\n  -> Witness\n  -> Executive Relevance\n  -> Round Table\n  -> Packet\n  -> Persistent Memory\n  -> Executive Surface\n  -> Prepared Work\n  -> User Approval',
    'Witness Before Judgment',
    'Executive Relevance Before Intelligence',
    'Round Tables Produce Judgment',
    'Packets Preserve Understanding',
    'Custom Fields Persist Executive Understanding',
    'Prompt Layering Is Executive Thinking',
    'The Interface Never Thinks',
    'User Approval Protects Trust',
    'Every prompt should have one responsibility.',
    'If a UI component must perform reasoning to display itself, the architecture is wrong.'
  ].forEach((required) => assert.ok(valExecutiveReasoningArchitecture.includes(required), 'Missing executive reasoning architecture: ' + required));
  assert.match(valConstitution, /VAL_EXECUTIVE_REASONING_ARCHITECTURE\.md/);
  assert.match(valConstitution, /Round Tables, Packets, and Prompt Layering are not implementation details/);
  assert.match(valStewardshipRoundTable, /VAL_EXECUTIVE_REASONING_ARCHITECTURE\.md/);
});

test('Hearth drawer openings keep index packet receipts internal before item actions', () => {
  assert.match(hearthHtml, /data-drawer-packet-receipt/);
  assert.match(hearthJs, /function drawerIndexPacketReceipt/);
  assert.match(hearthJs, /status:'index_context'/);
  assert.match(hearthJs, /renderDrawerPacketReceiptStrip\(packet\)/);
  assert.match(hearthJs, /function shouldShowPacketReceipts\(\)\{[\s\S]{0,60}return false;/);
  assert.match(hearthCss, /\.workspace-packet-receipt\{[\s\S]{0,80}display:none !important;/);
  assert.match(hearthJs, /const sourceReceipts = sourceLabel \? \[\{/);
  for(const action of [
    'drawer:relationships',
    'drawer:projects',
    'drawer:timeline',
    'drawer:executive_inbox',
    'drawer:commitments',
    'drawer:documents',
    'drawer:lead_intelligence',
    'drawer:val_os'
  ]){
    assert.match(hearthJs, new RegExp(action.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('Hearth packet hydration audit distinguishes live providers from builder gaps', () => {
  [
    'GET /api/hearth/packet-hydration-audit',
    'GET /api/hearth/truth-lineage',
    'GET /api/hearth/packet-receipts',
    'POST /api/hearth/build-packet',
    'durable receipt',
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
    /function buildHearthTruthLineageRegistry/,
    /const HEARTH_PACKET_ACTION_GATED = new Set/,
    /function buildHearthPacketContext/,
    /async function buildHearthPacket/,
    /async function saveHearthPacketReceipt/,
    /function listHearthPacketReceipts/,
    /app\.get\('\/api\/hearth\/packet-hydration-audit'/,
    /app\.get\('\/api\/hearth\/truth-lineage'/,
    /app\.get\('\/api\/hearth\/packet-receipts'/,
    /app\.post\('\/api\/hearth\/build-packet'/,
    /create table if not exists hearth_packet_receipts/,
    /receiptId=saved\.id/,
    /downstreamConsumers/,
    /sourceReceipts/,
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

test('Hearth client preflights action clicks with packet receipts before dispatch', () => {
  [
    /const hearthServerPacketNames = new Set/,
    /async function ensureHearthClickPacket/,
    /postJson\('\/api\/hearth\/build-packet'/,
    /function hearthPacketSourceFromContext/,
    /function hearthHumanContextLabel/,
    /upcoming calendar events/,
    /relationship, email, and project context for this event/,
    /allowBlockedForInspection:true/,
    /lastHearthPacketReceipt/,
    /data-workspace-packet-receipt/,
    /function renderHearthPacketReceiptStrip/,
    /node\.dataset\.valPacketReceiptId/,
    /function shouldShowPacketReceipts/,
    /function shouldShowPacketReceipts\(\)\{[\s\S]{0,60}return false;/,
    /function localHearthMetadataPacket/,
    /metadata_only/,
    /if\(hearthPacketShouldSkip\(action, resolvedPacketName\)\)\{[\s\S]{0,160}localHearthMetadataPacket\(\{packetName:resolvedPacketName, action, node, source\}\)/,
    /'linkedin'/,
    /function openMeetingPrepWithPacket/,
    /function openCalendarPanelWithPacket/,
    /function openCoworkSessionWithPacket/,
    /function openTeachValSessionWithPacket/,
    /function openLinkedInEngagementWorkspaceWithPacket/,
    /calendarPacketSourceFromEvent/,
    /function showHearthPacketBlocked/,
    /VAL needs the right context before this click/,
    /handleWorkflowAction\(action, node = null\)/,
    /handleHomeRoomAction\(action, node = null\)/,
    /handlePrimaryAction\(button\)/,
    /room\.querySelector\(/,
    /\.room-action/,
    /event\.stopPropagation\(\);[\s\S]{0,80}handlePrimaryAction\(actionButton\)/,
    /routeWorkspaceActionClick\(event\)/,
    /handleWorkflowAction\(drawerWorkflowAction\.dataset\.workflowAction, drawerWorkflowAction\)/,
    /handleHomeRoomAction\(homeActionButton\.dataset\.homeAction, homeActionButton\)/,
    /ensureHearthClickPacket\(\{node:correspondenceAction, packetName:'email_packet'/,
    /async function handleRelationshipActionClick/,
    /ensureHearthClickPacket\(\{node, packetName:'relationship_packet'/,
    /handleRelationshipActionClick\(relationshipAction\.dataset\.relationshipAction, relationshipAction\)/,
    /fallbackSourceLabel = payload\.source\.sourceLabel/,
    /source:\(error\.data \|\| \{\}\)\.source \|\| payload\.source/,
    /sourceReceipts:Array\.isArray\(\(error\.data \|\| \{\}\)\.receipt\?\.sourceReceipts\)/,
    /async function handleProjectActionClick/,
    /ensureHearthClickPacket\(\{node, packetName:'project_packet'/,
    /if\(command === 'project'\)\{[\s\S]{0,120}await handleProjectActionClick\(type, node\);/,
    /handleProjectActionClick\(projectAction\.dataset\.projectAction, projectAction\)/,
    /spec\.projectAction \? ' data-project-action="'/,
    /handleProjectActionClick\(this\.dataset\.projectAction,this\)/,
    /const projectActionButton = event\.target\.closest\('\[data-project-action\]'\);[\s\S]{0,180}await handleProjectActionClick\(projectActionButton\.dataset\.projectAction, projectActionButton\);/,
    /projectAction:'ask_priority'/,
    /projectAction:'show_alternatives'/,
    /projectAction:'open_project_file'/,
    /allowBlockedForInspection:true/
  ].forEach((pattern) => assert.match(hearthJs, pattern));
  assert.doesNotMatch(hearthJs, /workflow:'project:ask_priority'/);
  assert.doesNotMatch(hearthJs, /workflow:'project:show_alternatives'/);
  assert.doesNotMatch(hearthJs, /workflow:'project:open_project_file'/);
  assert.match(hearthJs, /document\.addEventListener\('click', async \(event\) =>/);
  assert.match(hearthJs, /event\.target\.closest\('#desk-workspace \.workspace-actions \[data-project-action\]'\)/);
  assert.match(hearthJs, /await handleProjectActionClick\(projectActionButton\.dataset\.projectAction, projectActionButton\);/);
  assert.match(server, /status:'not_supplied',source:'hearth_packet_builder',message:'Selected Home source did not include a numeric confidence score.'/);
});

test('Hearth client packet variables match server-enforced packet variables', () => {
  const clientPackets = extractObjectLiteral(hearthJs, 'const hearthPacketCompletenessRegistry = ');
  const serverPackets = extractObjectLiteral(server, 'const HEARTH_PACKET_HYDRATION_REQUIREMENTS = ');
  Object.entries(serverPackets).forEach(([packetName, serverRequirements]) => {
    assert.ok(clientPackets[packetName], 'Client registry is missing server packet ' + packetName);
    const clientVariables = new Set(clientPackets[packetName].requiredVariables || []);
    serverRequirements.map((row) => row[0]).forEach((variable) => {
      assert.ok(clientVariables.has(variable), packetName + ' client registry missing ' + variable);
    });
  });
});

test('Hearth truth lineage map traces clicks to variables and feeder sources', () => {
  [
    '# Hearth Truth Lineage Map',
    'truth source -> normalizer/provider -> packet variable -> click purpose',
    '| Click purpose | Trigger family | Variable packet feeding click | Variables in that packet | Things that feed those variables |',
    'New email arrives',
    'Teach VAL conversation',
    '`relationship_packet`',
    '`project_packet`',
    '`email_packet`',
    '`timeline_packet`',
    '`home_source_packet`',
    '`workflow_scoped_packet`',
    '`val_os_packet`',
    'Metadata-only packets until server hydration is added',
    '## Home Admission Boundary',
    'Fallback drawer routing is a navigation guard only.',
    'When we add or change a truth line'
  ].forEach((required) => assert.ok(hearthTruthLineageMap.includes(required), 'Missing truth lineage map entry: ' + required));
});

test('Hearth executive reasoning pipeline defines v1 Home admission gates', () => {
  [
    '# Hearth Executive Reasoning Pipeline',
    'Truth\n  -> Normalize\n  -> Witness\n  -> Observe\n  -> Classify\n  -> Judge\n  -> Prioritize\n  -> Prepare\n  -> Can VAL Act?\n  -> Execute\n  -> Learn\n  -> Reflect\n  -> Remember',
    '## v1 Executive Relevance Rule',
    'Velocity items that passed the Velocity Round Table',
    'Alignment items with a complete Why Now Packet',
    'Leverage items with a Prepared Work Packet and Can VAL Act status',
    'If an item lacks the required reasoning proof for its Home mode, it must stay out of Home.',
    '## Chief of Staff Test',
    '## Architecture Layer Boundary'
  ].forEach((required) => assert.ok(hearthExecutiveReasoningPipeline.includes(required), 'Missing executive reasoning pipeline entry: ' + required));
});

test('Hearth Home applies v1 admission before rendering Velocity Alignment and Leverage', () => {
  [
    /function velocityRoundTablePassed/,
    /function hasCompleteWhyNowPacket/,
    /function hasPreparedWorkPacketAndActionStatus/,
    /function homeAdmissionResult/,
    /function homeAdmissionFilter/,
    /function clearHomeRoomForAdmission/,
    /Velocity Round Table/,
    /Why Now Packet/,
    /Prepared Work Packet \+ Can VAL Act/,
    /missing_velocity_round_table_proof/,
    /missing_why_now_packet/,
    /missing_prepared_work_or_action_status/,
    /homeAdmissionFilter\('velocity', velocityItems\)/,
    /homeAdmissionFilter\('alignment', highest \? \[highest\] : \[\]\)/,
    /homeAdmissionFilter\('leverage', leverageItems\)/,
    /setHomeRoomQueue\('velocity', admittedVelocityItems\)/,
    /setHomeRoomQueue\('alignment', admittedHighest \? \[admittedHighest\] : \[\]\)/,
    /setHomeRoomQueue\('leverage', admittedLeverageItems\)/,
    /if\(!changed\) clearHomeRoomForAdmission\('velocity'\)/,
    /if\(!admittedHighest\) clearHomeRoomForAdmission\('alignment'\)/,
    /if\(!ready\) clearHomeRoomForAdmission\('leverage'\)/,
    /No meaningful movement earned Home/,
    /No priority needs your judgment first/,
    /No prepared work is waiting for approval/
  ].forEach((pattern) => assert.match(hearthJs, pattern));
  assert.doesNotMatch(hearthJs, /scopedItems\.length \? scopedItems : allItems/);
});

test('Hearth room cards use target-aware witnessed copy instead of generic dashboard copy', () => {
  assert.match(hearthJs, /function primaryPortalPhrase/);
  assert.match(hearthJs, /function roomCardObservation/);
  assert.match(hearthJs, /function roomCardImplication/);
  assert.match(hearthJs, /const homeRoomQueues/);
  assert.match(hearthJs, /function setHomeRoomQueue/);
  assert.match(hearthJs, /function homePacketDisplayFields/);
  assert.match(hearthJs, /function openVelocityAwarenessWorkspace/);
  assert.match(hearthJs, /function openAlignmentExecutionWorkspace/);
  assert.match(hearthJs, /function openLeverageApprovalWorkspace/);
  assert.ok(
    hearthJs.indexOf("if(roomName === 'velocity')") < hearthJs.indexOf("if(actionType === 'openInternal'"),
    'Home executive modes must resolve before generic internal navigation'
  );
  const primaryActionBody = hearthJs.slice(
    hearthJs.indexOf('async function handlePrimaryAction'),
    hearthJs.indexOf('function closeWorkspace')
  );
  assert.ok(
    primaryActionBody.indexOf("if(roomName === 'velocity')") < primaryActionBody.indexOf('ensureHearthClickPacket({'),
    'Home executive modes must open before server packet preflight'
  );
  assert.doesNotMatch(hearthJs, /data-home-action="cowork_card_context"/);
  assert.match(hearthJs, /mode === 'workspace'/);
  assert.match(hearthJs, /Velocity is awareness, not action/);
  assert.match(hearthJs, /How can I help with /);
  assert.match(hearthJs, /Approved and ' \+ verb/);
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

test('Hearth prototype fallback exercises Velocity Alignment and Leverage without taking over live Home', () => {
  assert.match(hearthJs, /mockBriefing/);
  assert.match(hearthJs, /function prototypeBriefing/);
  assert.doesNotMatch(hearthJs, /forceExecutiveInboxHome/);
  assert.match(hearthJs, /Greg answered the question that was holding the proposal/);
  assert.match(hearthJs, /Michele sent chapter notes/);
  assert.match(hearthJs, /Allen shared assessment notes/);
  assert.match(hearthJs, /Finish the Acme proposal before taking new meetings/);
  assert.match(hearthJs, /Frisson introduction draft/);
  assert.match(hearthJs, /D3Day page copy draft/);
  assert.match(hearthJs, /Client follow-up email/);
  assert.match(hearthJs, /hydrateGreetingFromBriefing\(briefing\)/);
  assert.match(hearthJs, /hydrateRoomsFromBriefing\(briefing\)/);
  assert.match(hearthHtml, /<h2>What changed<\/h2>/);
  assert.match(hearthHtml, /<h2>Top priority<\/h2>/);
  assert.match(hearthHtml, /<h2>Prepared drafts<\/h2>/);
  assert.doesNotMatch(hearthHtml, /<h2>Executive Inbox<\/h2>/);
  assert.doesNotMatch(hearthHtml, /<h2>Judgment only<\/h2>/);
  assert.doesNotMatch(hearthHtml, /<h2>Connected evidence<\/h2>/);
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
  assert.match(hearthJs, /What moved', 'Why it matters', 'What to do now/);
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
  assert.match(hearthJs, /Nothing enters CRM until the preview is reviewed and approved/);
  assert.match(hearthCss, /\.agency-note/);
  assert.match(hearthCss, /\.workspace-actions \.primary-action/);
});

test('Hearth workspaces enforce the VAL Clarity Standard before rendering', () => {
  assert.match(hearthJs, /function normalizeWorkspaceForClarity/);
  assert.match(hearthJs, /function claritySpecificMeaning/);
  assert.match(hearthJs, /function clarityEvidenceLines/);
  assert.match(hearthJs, /function normalizeClarityActions/);
  assert.match(hearthJs, /Co-Work with VAL/);
  assert.match(hearthJs, /workflow: 'cowork:card_context'/);
  assert.match(hearthJs, /function openCoworkFromClarityWorkspace/);
  assert.match(hearthJs, /coworkPromptFromWorkspace/);
  assert.match(hearthJs, /Help me decide what to trust, review, approve, do, or teach VAL next/);
  assert.match(hearthJs, /Show why VAL believes this/);
  assert.match(hearthJs, /Show evidence behind ' \+ title/);
  assert.match(hearthJs, /Open source behind this judgment/);
  assert.match(hearthJs, /normalizeWorkspaceForClarity\(content\.workspace\)/);
});

test('Hearth judgment receipts preserve the originating lens and source context', () => {
  assert.match(hearthJs, /function homeActionPosture/);
  assert.match(hearthJs, /priorWorkspace/);
  assert.match(hearthJs, /sourceActionLabel\(item, 'Open source behind this judgment'\)/);
  assert.match(hearthJs, /homeAction: 'open_source'/);
  assert.match(hearthJs, /function openHomeSourceView\(\)/);
  assert.match(hearthJs, /executiveHomeBriefTitle\(item, originalTitle, roomName\)/);
  assert.match(hearthJs, /executiveHomeMeaning\(item, workspace\.meaning, roomName\)/);
  const openHomeSourceViewBody = hearthJs.slice(
    hearthJs.indexOf('function openHomeSourceView()'),
    hearthJs.indexOf('function openExecutiveInboxForHomeEmail')
  );
  assert.doesNotMatch(openHomeSourceViewBody, /window\.open/);
  assert.match(hearthJs, /No external action was taken from this workspace/);
  assert.match(hearthJs, /accepted your judgment/);
  assert.match(hearthJs, /is ready to adjust/);
  assert.match(hearthJs, /kept the evidence visible/);
});

test('Hearth source openings keep the desk oriented after opening a target', () => {
  const openHomeSourceViewBody = hearthJs.slice(
    hearthJs.indexOf('function openHomeSourceView()'),
    hearthJs.indexOf('function renderHomeEvidenceBrief')
  );
  assert.match(hearthJs, /function sourceDestinationLabel/);
  assert.match(hearthJs, /function openHomeSourceDrawerDestination/);
  assert.match(openHomeSourceViewBody, /openHomeSourceDrawerDestination\(workspace\)/);
  assert.match(hearthJs, /restoreCorrespondenceWindow\(\)/);
  assert.match(hearthJs, /restoreRelationshipWindow\(\)/);
  assert.match(hearthJs, /restoreProjectWindow\(\)/);
  assert.match(hearthJs, /CRM opportunity/);
  assert.match(hearthJs, /prepared draft/);
  assert.match(hearthJs, /relationship file/);
});

test('Hearth returns from workspaces with a quiet desk-settling motion', () => {
  assert.match(hearthJs, /desk-settling/);
  assert.match(hearthJs, /setTimeout\(\(\) => hearth\.classList\.remove\('desk-settling'\), 620\)/);
  assert.match(hearthCss, /\.hearth-shell\.desk-settling \.hearth-light/);
  assert.match(hearthCss, /@keyframes desk-return-glow/);
  assert.match(hearthCss, /@keyframes desk-return-rooms/);
  assert.match(hearthCss, /\.hearth-shell \.desk-workspace\[aria-hidden="true"\]/);
  assert.match(hearthCss, /visibility:hidden/);
});

test('Hearth rooms quietly remember when a user has held their context', () => {
  assert.match(hearthJs, /function roomNameFromWorkspace/);
  assert.match(hearthJs, /function markRoomAttended/);
  assert.match(hearthJs, /room-attended/);
  assert.match(hearthJs, /room-has-been-held/);
  assert.match(hearthJs, /roomAttendedLabel/);
  assert.match(hearthJs, /markRoomAttended\(roomName, 'source'\)/);
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

test('Hearth keeps the Home greeting direct instead of adding an explainer panel', () => {
  assert.doesNotMatch(hearthHtml, /Why I am saying this today/);
  assert.doesNotMatch(hearthHtml, /class="fresh-desk-button"/);
  assert.doesNotMatch(hearthHtml, />Clear Home marks</);
  assert.match(hearthHtml, /No Home card is open/);
  assert.match(hearthJs, /const freshDeskButton/);
  assert.match(hearthJs, /function clearRoomAttendance/);
  assert.match(hearthJs, /freshDeskButton\?\.addEventListener\('click', clearRoomAttendance\)/);
  assert.match(hearthJs, /function renderWhyTodayPanel\(briefing = null, status = 'loaded'\)\{\n  return;/);
});

test('Hearth Home removes static architecture filler from the welcome area', () => {
  assert.doesNotMatch(hearthHtml, /Live briefing/);
  assert.doesNotMatch(hearthHtml, /Generic risk language should not drive Home/);
  assert.doesNotMatch(hearthHtml, /Today stands here/);
  assert.doesNotMatch(hearthHtml, /Supporting drawers stay available without owning Home/);
  assert.match(hearthHtml, /Home should update from Velocity, Alignment, and Leverage packets/);
  assert.match(hearthJs, /function hydrateGreetingFromBriefing/);
});

test('Hearth pre-drawer responsive polish keeps closed panels quiet and targets usable', () => {
  assert.match(hearthCss, /\.living-room button\{/);
  assert.match(hearthCss, /min-height:32px/);
  assert.match(hearthCss, /\.drawer-pull\{/);
  assert.match(hearthCss, /min-height:34px/);
  assert.match(hearthHtml, /class="close-all-drawers"/);
  assert.match(hearthJs, /const closeAllDrawersButton/);
  assert.match(hearthJs, /function updateCloseAllDrawersButton/);
  assert.match(hearthJs, /drawerPull\.addEventListener\('click', \(\) => \{\s*hideWorkspaceForDrawerNavigation\(\);/);
  assert.match(hearthJs, /closeAllDrawersButton\?\.addEventListener\('click', closeDrawer\)/);
  assert.match(hearthJs, /document\.addEventListener\('click', \(event\) => \{/);
  assert.match(hearthJs, /hearth\.classList\.contains\('calendar-open'\) && !event\.target\.closest\('\.full-calendar-panel'\)/);
  assert.match(hearthJs, /hearth\.dataset\.distance === 'judgment' && !event\.target\.closest\('\.desk-workspace'\)/);
  assert.match(hearthJs, /retrievalSystem\?\.classList\.contains\('open'\) && !event\.target\.closest\('\.retrieval-system'\)/);
  assert.match(hearthCss, /\.close-all-drawers/);
  assert.match(hearthCss, /\.observer-board-button\{z-index:28\}/);
  assert.doesNotMatch(hearthHtml, /Prototype states/);
  assert.doesNotMatch(hearthHtml, /data-state-option/);
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
  assert.match(hearthHtml, /data-workflow-action="valWitnessingFresh" data-val-variable-packet="val_os_packet">Begin Witnessing Session/);
  assert.match(hearthHtml, /data-workflow-action="valConnections:review" data-val-variable-packet="val_os_packet">Connect inbox\/calendar/);
  assert.match(hearthHtml, /data-workflow-action="valConnections:review" data-val-variable-packet="val_os_packet"/);
  assert.match(hearthJs, /const valDetail = document\.querySelector\('#val-detail'\)/);
  assert.match(hearthJs, /function handleValDetailWorkflowClick\(event\)/);
  assert.match(hearthJs, /document\.addEventListener\('click', \(event\) =>/);
  assert.match(hearthJs, /action === 'valConnections:review'/);
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
  assert.match(hearthJs, /For section 5, use this exact Project Manager import contract/);
  assert.match(hearthJs, /What should this project be called, and what outcome should it create\?/);
  assert.match(hearthJs, /Who owns this project, what is the next move, and what should VAL monitor\?/);
  assert.match(hearthJs, /What are the main workstreams VAL should track for this project\?/);
  assert.match(hearthJs, /What milestones prove this project is moving\?/);
  assert.match(hearthJs, /How should VAL help protect and grow the relationships connected to this project\?/);
  assert.match(hearthJs, /What should VAL prepare, organize, or ask about next for this project\?/);
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

test('Stewardship drawer opens inside the Hearth instead of a CRM link', () => {
  assert.match(hearthHtml, /class="drawer-link relationship-drawer-link"/);
  assert.match(hearthHtml, /id="relationship-detail"/);
  assert.match(hearthHtml, />Stewardship</);
  assert.match(hearthHtml, /Network value and introductions/);
  assert.match(hearthHtml, /Who should I introduce, and why/);
  assert.match(hearthHtml, /data-stewardship-view="suggested"/);
  assert.match(hearthHtml, /data-stewardship-view="create"/);
  assert.match(hearthHtml, /data-stewardship-view="network"/);
  assert.match(hearthHtml, /data-stewardship-suggestions/);
  assert.match(hearthHtml, /data-stewardship-person-a/);
  assert.match(hearthHtml, /data-stewardship-person-b/);
  assert.match(hearthHtml, /data-stewardship-network-detail/);
  assert.doesNotMatch(hearthHtml, /<span>Identity<\/span>/);
  assert.doesNotMatch(hearthHtml, /<span>Network Stewardship<\/span>/);
  assert.doesNotMatch(hearthHtml, /Who needs to meet whom, and why/);
  assert.doesNotMatch(hearthHtml, /data-relationship-field="stewardshipAbout"/);
  assert.doesNotMatch(hearthHtml, /data-relationship-list="peopleWhoNeedThem"/);
  assert.doesNotMatch(hearthHtml, /data-relationship-list="peopleTheyShouldMeet"/);
  assert.doesNotMatch(hearthHtml, /What VAL wants you to remember/);
  assert.doesNotMatch(hearthHtml, /<span>Executive Judgment<\/span>/);
  assert.doesNotMatch(hearthHtml, /<span>Collaboration<\/span>/);
  assert.doesNotMatch(hearthHtml, /<span>Story<\/span>/);
  assert.doesNotMatch(hearthHtml, /class="relationship-actions"/);
  assert.match(hearthJs, /const relationshipDrawerLink/);
  assert.match(hearthJs, /relationship-open/);
  assert.match(hearthCss, /\.relationship-layer-heading/);
  assert.match(hearthCss, /\.relationship-intro-tabs/);
  assert.match(hearthCss, /\.stewardship-network-layout/);
});

test('Stewardship drawer behaves like a V1 introduction workspace', () => {
  assert.match(hearthHtml, /class="relationship-folder-rail"/);
  assert.match(hearthHtml, /class="relationship-folder-rail" aria-label="Pinned relationships" hidden/);
  assert.doesNotMatch(hearthHtml, /data-relationship-profile="greg"/);
  assert.doesNotMatch(hearthHtml, /data-relationship-profile="lindsey"/);
  assert.doesNotMatch(hearthHtml, /data-relationship-field="stewardshipAbout"/);
  assert.match(hearthJs, /const relationshipProfiles/);
  assert.match(hearthJs, /function stewardshipIntroFit/);
  assert.match(hearthJs, /stewardshipPairPassesFreshness\(a, b\)/);
  assert.match(hearthJs, /lastDirectCommunicationAt/);
  assert.match(hearthJs, /function stewardshipBestMatches/);
  assert.match(hearthJs, /function renderStewardshipSuggestions/);
  assert.match(hearthJs, /function renderStewardshipComparison/);
  assert.match(hearthJs, /function renderStewardshipNetworkDetail/);
  assert.match(hearthJs, /function openStewardshipDraftReview/);
  assert.match(hearthJs, /data-stewardship-create-with/);
  assert.match(hearthJs, /data-stewardship-review-manual/);
  assert.match(hearthJs, /data-stewardship-draft-pair/);
  assert.match(hearthJs, /No email, invite, message, CRM write, or external action happened/);
  assert.match(hearthJs, /I do not see a strong reason to introduce these two yet/);
  assert.doesNotMatch(hearthJs, /Find Introductions/);
  assert.doesNotMatch(hearthJs, /Find introductions/);
  assert.doesNotMatch(hearthHtml, /Find Matches/);
  assert.match(hearthJs, /Best Matches/);
  assert.match(hearthJs, /Missing Piece \/ Constraints/);
  assert.match(hearthJs, /Who Should /);
  assert.match(hearthJs, /Prepared introduction draft/);
  assert.match(hearthJs, /Approve draft for review queue/);
  assert.match(hearthJs, /aria-pressed/);
  assert.match(hearthCss, /\.relationship-folder-rail/);
  assert.match(hearthCss, /\.stewardship-suggestion-card/);
  assert.match(hearthCss, /\.stewardship-comparison-card/);
  assert.match(hearthCss, /\.stewardship-network-detail/);
  assert.match(hearthCss, /\.retrieval-system\.open\{\n  z-index:1300/);
  assert.match(hearthCss, /\.drawer-tray\.relationship-open\{\n  position:absolute;\n  z-index:1301/);
  assert.match(hearthJs, /if\(hearth\.classList\.contains\('drawer-open'\)\) return;\n    handlePrimaryAction\(button\)/);
});

test('Retired relationship dossier helpers remain available behind the V1 introduction shell', () => {
  assert.match(hearthJs, /function renderRelationshipProfile/);
  assert.match(hearthJs, /function renderRelationshipDossierSections/);
  assert.match(hearthJs, /function renderRelationshipList/);
  assert.match(hearthJs, /relationshipStewardshipNetwork/);
  assert.match(hearthJs, /peopleWhoNeedThem/);
  assert.match(hearthJs, /peopleTheyShouldMeet/);
  assert.match(hearthJs, /relationship-action-group/);
  assert.match(hearthJs, /Source check/);
  assert.match(hearthJs, /function renderRelationshipPrimaryActions/);
  assert.match(hearthJs, /function relationshipActionsWithStewardshipReview/);
  assert.match(hearthJs, /relationshipReviewIntroductionsAction\(\)/);
  assert.match(hearthJs, /Check for new evidence/);
  assert.match(hearthJs, /Review prepared move/);
  assert.match(hearthJs, /linkedinSignal/);
  assert.match(hearthJs, /sourceReceipts/);
  assert.match(hearthJs, /linkedInLatestPosts/);
  assert.match(hearthJs, /review_linkedin_activity/);
  assert.match(hearthJs, /find_relationship_introductions/);
  assert.match(hearthJs, /function relationshipIntroCandidatePackets/);
  assert.match(hearthJs, /function prepareRelationshipIntroReview/);
  assert.match(hearthJs, /function normalizedIntroCandidate/);
  assert.match(hearthJs, /candidate\.personB/);
  assert.match(hearthJs, /candidate\.whyThisMayMatter/);
  assert.match(hearthJs, /crmContacts/);
  assert.match(hearthJs, /await openRelationshipIntroReview\(profile\)/);
  assert.match(hearthJs, /draft_linkedin_comment/);
  assert.match(hearthJs, /draft_linkedin_dm/);
  assert.match(hearthJs, /refresh_relationship_observers/);
  assert.match(hearthJs, /LinkedIn activity is ready to review/);
  assert.match(hearthJs, /LinkedIn comment drafted for review/);
  assert.match(hearthJs, /LinkedIn DM drafted for review/);
  assert.match(hearthJs, /Source check is ready for review/);
  assert.match(hearthJs, /Next Stewardship move is ready for review/);
  assert.match(hearthJs, /including introductions only when they are the right move/);
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
  assert.match(hearthJs, /openWorkspaceShell\('Stewardship move review', \{returnTarget:'relationship'\}\)/);
  assert.match(hearthJs, /Who needs this person/);
  assert.match(hearthJs, /Who this person needs/);
  assert.match(hearthJs, /introDraft:/);
  assert.match(hearthJs, /Introduction draft held for review/);
  assert.match(hearthJs, /Prepared introduction draft/);
  assert.match(hearthJs, /Approve draft for review queue/);
  assert.match(hearthJs, /Refine wording/);
  assert.match(hearthJs, /Not this intro/);
  assert.match(hearthJs, /Teach VAL about this relationship move/);
  assert.match(hearthJs, /Introduction draft approved for the review queue/);
  assert.match(hearthJs, /No email, LinkedIn message, calendar invite, scrape, import, or CRM write happened/);
  assert.match(hearthJs, /function relationshipRouteUrl/);
  assert.match(hearthJs, /location\.protocol === 'http:' \|\| location\.protocol === 'https:'/);
  assert.match(hearthJs, /http:\/\/127\.0\.0\.1:3199\/hearth-prototype\.html/);
  assert.match(hearthJs, /function openRelationshipFullFile/);
  assert.match(hearthJs, /Relationship full file workspace/);
  assert.match(hearthJs, /openRelationshipFullFile\(profile\)/);
  assert.match(hearthJs, /function relationshipSource/);
  assert.match(hearthJs, /async function handleRelationshipActionClick/);
  assert.match(hearthJs, /handleRelationshipActionClick\(this\.dataset\.relationshipAction,this\)/);
  assert.match(hearthJs, /await handleRelationshipAction\(actionId\)/);
  assert.match(hearthJs, /const explicitSourceLabel = packet\.source\?\.sourceLabel/);
  assert.match(hearthJs, /sourceType: 'relationship_profile'/);
  assert.match(hearthJs, /sourceReceipts: person\.sourceReceipts/);
  assert.match(hearthJs, /function relationshipSuggestedActions/);
  assert.match(hearthJs, /Source check/);
  assert.match(hearthJs, /refresh_relationship_observers/);
  assert.doesNotMatch(hearthJs, /Draft LinkedIn Comment',type:'endpoint'/);
  assert.match(hearthJs, /function openRelationshipTeachWorkspace/);
  assert.match(hearthJs, /Review what I taught VAL/);
  assert.match(hearthJs, /relationshipTeachCandidate/);
  assert.match(hearthJs, /Teaching is ready for review/);
  assert.match(hearthCss, /\.return-button\{[\s\S]{0,80}position:sticky/);
  assert.match(hearthJs, /workflow:'relationship:teach_wisdom'/);
  assert.match(hearthJs, /relationshipFolderButtons\.forEach/);
  assert.match(hearthJs, /async function openRelationshipProfileFromFolder/);
  assert.match(hearthJs, /renderRelationshipProfile\(profileId, \{\.\.\.profile, profileId\}\)/);
  assert.match(hearthJs, /function ensureRelationshipProfileReceipt/);
  assert.match(hearthJs, /function relationshipProfileReceiptPacket/);
  assert.match(hearthJs, /ensureRelationshipProfileReceipt\(profile\)/);
  assert.match(hearthJs, /if\(currentReceipt\.includes\(profile\.name\)\) return/);
  assert.match(hearthJs, /receiptMatchesSelection/);
  assert.match(hearthJs, /localHearthMetadataPacket\(\{packetName:'relationship_packet', action:'relationship:open_profile', node, source:selectedSource\}\)/);
  assert.match(hearthJs, /openRelationshipProfileFromFolder\(button\.dataset\.relationshipProfile, button\)/);
  assert.match(hearthJs, /Do not let silence become ambiguity/);
  assert.match(hearthCss, /\.stewardship-network-grid/);
  assert.match(hearthCss, /\.stewardship-network-card/);
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
  assert.match(hearthJs, /function relationshipProfileWithIdentityWarning/);
  assert.match(hearthJs, /function relationshipFallbackHasCanonicalEvidence/);
  assert.match(hearthJs, /function relationshipDossierMatchesFallback/);
  assert.match(hearthJs, /relationship dossier identity mismatch; keeping selected fallback/);
  assert.match(hearthJs, /if\(!relationshipDossierMatchesFallback\(data\.dossier, fallback\)\)/);
  assert.match(hearthJs, /relationship_identity_unresolved/);
  assert.match(hearthJs, /relationshipFallbackHasCanonicalEvidence\(fallback\)[\s\S]{0,140}relationshipProfileWithIdentityWarning\(error\.data, fallback\)/);
  assert.match(hearthJs, /unresolvedIdentityWarning: warning/);
  assert.match(hearthJs, /\.\.\.fallback/);
  assert.match(hearthJs, /Link the right person once so VAL can safely bring the full relationship into view/);
  assert.match(hearthJs, /Find matching person/);
  assert.match(hearthJs, /Review person link/);
  assert.match(hearthJs, /function handleUnresolvedRelationshipAction/);
  assert.match(hearthJs, /VAL is protecting the relationship until the identity is clean enough to merge evidence/);
  assert.match(hearthJs, /error\.data = data/);
  assert.match(hearthJs, /function renderRelationshipActions/);
  assert.match(hearthJs, /function renderRelationshipSectionActions/);
  assert.match(hearthJs, /function relationshipAllSectionActions/);
  assert.match(hearthJs, /const defaults = defaultRelationshipSectionActions\(profile\.name \|\| 'this relationship'\)/);
  assert.match(hearthJs, /const sections = \{\.\.\.defaults, \.\.\.supplied\}/);
  assert.match(hearthJs, /function defaultRelationshipSectionActions/);
  assert.match(hearthJs, /function showRelationshipSectionReceipt/);
  assert.match(hearthJs, /function relationshipUsefulText/);
  assert.match(hearthJs, /function relationshipSectionPacketCopy/);
  assert.match(hearthJs, /Do not act from this card yet/);
  assert.match(hearthJs, /Evidence VAL has/);
  assert.match(hearthJs, /Missing context/);
  assert.match(hearthJs, /Boundary: no email, CRM update, task, or memory change happened from this click/);
  assert.match(hearthJs, /function preferredRelationshipActions/);
  assert.match(hearthJs, /activeRelationshipProfile/);
  assert.match(hearthJs, /relationshipBrief/);
  assert.match(hearthJs, /relationshipEvidenceItemsFromDossier/);
  assert.match(hearthJs, /relationshipOpenLoopLines/);
  assert.match(hearthJs, /strategicImportance/);
  assert.match(hearthJs, /renderRelationshipProfile\(profileId, relationshipProfileFromDossier\(data\.dossier, fallback\)\)/);
  assert.match(hearthJs, /if\(!canUseApi\) return/);
  assert.match(hearthJs, /const packet = receiptMatchesSelection \? preflight\.packet : localHearthMetadataPacket/);
  assert.match(hearthJs, /renderDrawerPacketReceiptStrip\(packet \|\| lastHearthPacketReceipt\);[\s\S]{0,80}loadRelationshipDossier\(profileId\)/);
  assert.match(hearthJs, /const selectedSource = relationshipSource\(\{\.\.\.profile, profileId\}, 'relationship:open_profile', ''\)/);
  assert.match(hearthJs, /source:selectedSource/);
  assert.match(hearthJs, /stewardshipSelectedNetworkId = profileId/);
  assert.match(hearthJs, /renderStewardshipNetworkList\(\);[\s\S]{0,40}return/);
  assert.match(hearthJs, /await handleRelationshipActionClick\(relationshipAction\.dataset\.relationshipAction, relationshipAction\)/);
  assert.doesNotMatch(hearthHtml, /data-relationship-action="refresh_relationship_observers"/);
  assert.doesNotMatch(hearthHtml, /data-relationship-section-actions="identity"/);
  assert.doesNotMatch(hearthHtml, /data-relationship-list="peopleWhoNeedThem"/);
  assert.doesNotMatch(hearthHtml, /data-relationship-list="peopleTheyShouldMeet"/);
  assert.match(hearthHtml, /data-stewardship-network-detail/);
  assert.doesNotMatch(hearthHtml, /data-relationship-card-section=/);
  assert.doesNotMatch(hearthHtml, /data-relationship-card-action=/);
  assert.doesNotMatch(hearthHtml, /data-relationship-action="open_full_file"/);
  assert.doesNotMatch(hearthHtml, />Open full file</);
  assert.match(hearthJs, /function relationshipEvidenceItemsFromDossier/);
  assert.match(hearthJs, /relationshipVisibleSectionActions/);
  assert.match(hearthJs, /relationshipNetworkMatchList/);
  assert.match(hearthJs, /relationshipStewardshipNetwork/);
  assert.match(hearthJs, /understanding\.stewardship_network/);
  assert.match(hearthJs, /currentRelationship\.temperature/);
  assert.match(hearthJs, /understanding\.living_narrative/);
  assert.doesNotMatch(hearthJs, /Recent context exists for/);
  assert.match(hearthJs, /Open loops are present/);
  assert.match(hearthJs, /source trail below is the truth/);
  assert.match(hearthJs, /let activeRelationshipActionSection = ''/);
  assert.match(hearthJs, /node\?\.dataset\?\.relationshipSection \|\| node\?\.dataset\?\.relationshipCardSection/);
  assert.match(hearthJs, /localHearthMetadataPacket\(\{node, packetName:'relationship_packet', action:actionId, source:relationshipSource/);
  assert.match(hearthJs, /sourceSection: scopedSection/);
  assert.match(hearthJs, /requestedSection: scopedSection/);
  assert.match(hearthJs, /function handleRelationshipCardNode/);
  assert.match(hearthJs, /async function handleRelationshipDetailClickEvent/);
  assert.match(hearthJs, /event\.stopImmediatePropagation/);
  assert.doesNotMatch(hearthJs, /event\.target\.closest\('#relationship-detail \[data-relationship-card-section\]'\)/);
  assert.match(hearthJs, /relationshipSectionCurrentValue/);
  assert.match(hearthJs, /This teaching is scoped to/);
  assert.match(hearthJs, /actions: actionItems/);
  assert.match(hearthJs, /sectionActions: relationshipVisibleSectionActions/);
  assert.match(hearthJs, /defaultRelationshipSectionActions\(profile\.name/);
  assert.match(hearthCss, /\.relationship-section-actions/);
  assert.match(hearthCss, /\.drawer-tray\.relationship-open\{/);
  assert.match(hearthCss, /\.relationship-detail,[\s\S]{0,260}\.relationship-detail \.relationship-identity/);
  assert.match(hearthCss, /\.relationship-detail \.relationship-rolodex button\[data-relationship-open-profile\]/);
  assert.match(hearthCss, /rgba\(255,255,252,\.78\)/);
});

test('Relationship actions can return focus to the desk lenses', () => {
  assert.doesNotMatch(hearthHtml, /<button type="button" data-relationship-action="refresh_relationship_observers">Check for new evidence<\/button>/);
  assert.match(hearthHtml, /Create Introduction/);
  assert.match(hearthJs, /function handleRelationshipAction/);
  assert.match(hearthJs, /relationship:draft_message/);
  assert.match(hearthJs, /relationship:create_task/);
  assert.match(hearthJs, /Discuss this card/);
  assert.doesNotMatch(hearthJs, /label:'Open full file', workflow:'relationship:open_full_file'/);
  assert.match(hearthJs, /identity\.crmContactId \|\| identity\.id/);
  assert.match(hearthJs, /\/api\/relationships\/actions/);
  assert.match(hearthJs, /No email will be sent from this click/);
  assert.match(hearthJs, /packetReceipt: lastHearthPacketReceipt/);
  assert.match(hearthJs, /source:relationshipSource\(activeRelationshipProfile, actionId, activeRelationshipActionSection\)/);
  assert.match(hearthJs, /renderDrawerPacketReceiptStrip\(preflight\.packet \|\| lastHearthPacketReceipt\);[\s\S]{0,80}await handleRelationshipAction\(actionId\)/);
  assert.match(hearthJs, /await handleRelationshipActionClick\(relationshipAction\.dataset\.relationshipAction, relationshipAction\)/);
  assert.match(hearthJs, /function closeDrawer/);
  assert.match(hearthJs, /returnButton\.addEventListener\('click', \(event\) => \{[\s\S]{0,120}event\.stopPropagation\(\);[\s\S]{0,80}closeWorkspace\(\)/);
  assert.match(hearthJs, /drawerTray\.addEventListener\('click'/);
  assert.match(hearthJs, /event\.target\.closest\('#relationship-detail \[data-relationship-action\]'\)/);
  assert.match(hearthJs, /event\.target\.closest\('\[data-open-room\]'\)/);
  assert.match(hearthJs, /openWorkspace\(roomButton\.dataset\.openRoom\)/);
  assert.match(hearthJs, /'\.living-room'/);
});
