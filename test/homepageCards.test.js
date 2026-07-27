const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
const dashboard=fs.readFileSync(path.join(root,'dashboard.html'),'utf8');
const commandCenter=fs.readFileSync(path.join(root,'command-center.js'),'utf8');
const hearthHtml=fs.readFileSync(path.join(root,'hearth-prototype.html'),'utf8');
const hearthPrototype=fs.readFileSync(path.join(root,'hearth-prototype.js'),'utf8');
const hearthCss=fs.readFileSync(path.join(root,'hearth-prototype.css'),'utf8');

test('homepage cards expose a strict six-card intelligence contract',()=>{
  assert.match(server,/function dashboardNormalizeCardItem/);
  assert.match(server,/function dashboardTargetFromSignal/);
  assert.match(server,/function dashboardEvidenceTargetMeta/);
  assert.match(server,/function dashboardNormalizeCardCollection/);
  assert.match(server,/function dashboardDedupeCardItems/);
  assert.match(server,/dashboardNormalizeCardCollection\('what_changed'/);
  assert.match(server,/dashboardNormalizeCardCollection\('people'/);
  assert.match(server,/dashboardNormalizeCardCollection\('projects'/);
  assert.match(server,/dashboardNormalizeCardItem\('momentum'/);
  assert.match(server,/dashboardDedupeCardItems\(dashboardNormalizeCardCollection\('ready_for_you'/);
  assert.match(server,/highestLeverageMove:highest/);
  assert.match(server,/source_type/);
  assert.match(server,/source_id/);
  assert.match(server,/source_ids/);
  assert.match(server,/evidence_count/);
  assert.match(server,/available_actions/);
  assert.match(server,/opportunityId/);
  assert.match(server,/portalPhrases/);
  assert.match(server,/entities\.opportunityName/);
  assert.match(server,/participant\.matchedContactName/);
  assert.match(server,/return \{type:'opportunity'/);
});

test('homepage card actions are explicit and approval-safe',()=>{
  assert.match(server,/app\.post\('\/api\/homepage-cards\/action'/);
  assert.match(server,/const taskActions=\[/);
  assert.match(server,/const draftActions=\[/);
  assert.match(server,/const decisionActions=\[/);
  assert.match(server,/send_email:'approval_required'/);
  assert.match(server,/Final send approval is required\. Nothing was sent\./);
  assert.match(server,/Unsupported homepage card action/);
  [
    'create_task',
    'draft_update',
    'attach_evidence',
    'move_opportunity',
    'mark_signal_wrong',
    'summarize_project'
  ].forEach(action=>assert.match(server,new RegExp(action)));
});

test('homepage card workspaces render all six cards with scoped chat',()=>{
  [
    'whatChangedWorkspaceHtml',
    'highestWorkspaceHtml',
    'peopleWorkspaceHtml',
    'projectsWorkspaceHtml',
    'momentumWorkspaceHtml',
    'readyWorkspaceHtml'
  ].forEach(fn=>assert.match(commandCenter,new RegExp(`function ${fn}`)));
  assert.match(commandCenter,/window\.openHomepageCard=function/);
  assert.match(commandCenter,/window\.homepageCardAction=function/);
  assert.match(commandCenter,/window\.homepageCardAsk=function/);
  assert.match(commandCenter,/Card-scoped request/);
  assert.match(commandCenter,/data\.message/);
  assert.match(commandCenter,/emptyWorkspaceHtml/);
  assert.match(dashboard,/\.val-card-workspace/);
  assert.match(dashboard,/\.val-card-chat-panel/);
  assert.match(dashboard,/\.val-card-decision-strip/);
  [
    'changed-mode',
    'highest-mode',
    'people-mode',
    'project-mode',
    'momentum-mode',
    'ready-mode',
    'empty-mode'
  ].forEach(mode=>assert.match(dashboard,new RegExp(mode)));
});

test('demo homepage seed data can populate every launch card',()=>{
  assert.match(server,/const evidenceItems=\[/);
  assert.match(server,/const evidenceObservations=\[/);
  assert.match(server,/const relationshipProfiles=/);
  assert.match(server,/const agencyMoves=\[/);
  assert.match(server,/demo-agency-top/);
  assert.match(server,/demo-project-atlas/);
  assert.match(server,/demo-project-northstar/);
  assert.match(server,/demo-project-healthbridge/);
  assert.match(server,/agencyMoveSources:\[\]/);
  assert.match(server,/P\.S\. Ready to make this yours\? Sign up for VAL here:/);
  assert.match(server,/https:\/\/graceintelligence\.com\/val/);
});

test('Alignment Co-Work carries the selected packet into a project-first envelope',()=>{
  assert.match(hearthPrototype,/function homeCoworkEnvelopeHint/);
  assert.match(hearthPrototype,/function homeCoworkSourceItem/);
  assert.match(hearthPrototype,/function homeCoworkContextLines/);
  assert.match(hearthPrototype,/Project context wins before relationship context/);
  assert.match(hearthPrototype,/Relationship context is fallback only when no project is attached/);
  assert.match(hearthPrototype,/GOALL/);
  assert.match(hearthPrototype,/Taffy/);
  assert.match(hearthPrototype,/contextLines/);
  assert.match(hearthPrototype,/workingBrief/);
  assert.match(hearthPrototype,/function alignmentCoworkBriefAnswer/);
  assert.match(hearthPrototype,/selectedSourceContextFromCommitmentTask/);
  assert.match(hearthPrototype,/sourceBrief: contextLines\.join/);
  assert.match(hearthPrototype,/Private selected context JSON/);
  assert.match(hearthPrototype,/Do not ask what "this" is when cardTitle, sourceRefs, transcriptIds, evidenceIds, or envelope are present/);
  assert.match(hearthPrototype,/selectedSourceContext: activeCoworkSelectedSourceContext/);
  assert.match(hearthPrototype,/const asksForArtifact = \/\\b\(html\|css\|iframe\|embed\|code\|build\|create\|draft\|template\|page\|mockup\|wireframe\|copy\)\\b\//);
  assert.match(hearthPrototype,/Yes\. I have the packet, so I’m not going to ask what “this” is\./);
  assert.match(hearthPrototype,/Here is a clean iframe-ready first version based on the loaded context/);
  assert.match(hearthPrototype,/timeoutMs: 22000/);
  assert.doesNotMatch(hearthPrototype,/timeoutMs: 65000/);
});

test('Leverage opens only reviewable prepared work products',()=>{
  assert.match(hearthPrototype,/function leverageReviewableQueueItems/);
  assert.match(hearthPrototype,/hasPreparedWorkPacketAndActionStatus\(sourceItem\) && Boolean\(leverageDraftFromWorkspace\(\{sourceItem\}\)\)/);
  assert.match(hearthPrototype,/const reviewableItems = leverageReviewableQueueItems\(\)/);
  assert.match(hearthPrototype,/no reviewable draft body or artifact is attached yet/);
  assert.match(hearthPrototype,/No approval is requested from an empty packet/);
});

test('Home admits both editable and ready-for-review drafts into Leverage',()=>{
  assert.match(server,/function dashboardReadyDraft\(draft=\{\}\)/);
  assert.match(server,/\['draft','ready_for_review'\]\.includes\(String\(draft\.status\|\|'draft'\)\)/);
  assert.match(server,/ctx\.draftBrief\?\.recipient\?\.email/);
  assert.match(server,/ctx\.qa\?\.passes!==true/);
  assert.match(server,/draftId:draft\.id/);
  assert.match(server,/recipientEmail/);
  const briefingStart=server.indexOf('async function buildExecutiveBriefing');
  const briefingEnd=server.indexOf('\nasync function',briefingStart+20);
  const briefing=server.slice(briefingStart,briefingEnd>briefingStart?briefingEnd:briefingStart+12000);
  assert.match(briefing,/listDrafts\(''\)/);
  assert.doesNotMatch(briefing,/listDrafts\('draft'\)/);
  assert.match(server,/\[freshTranscriptPacket\?\.readyDraft,\.\.\.readyQueueItems,\.\.\.readyDrafts\]/);
  assert.doesNotMatch(server,/\[freshTranscriptPacket\?\.readyDraft,\.\.\.\(onboarding\?\.ready\|\|\[\]\)/);
  assert.match(hearthPrototype,/function mergePreparedWorkQueues/);
  assert.match(hearthPrototype,/mergePreparedWorkQueues\(queueSource\.map\(normalizeReadyForYouItem\), briefingPrepared\)/);
});

test('Leverage prepared-work buttons persist edits and use approval gates',()=>{
  assert.match(hearthPrototype,/function leveragePreparedIdentifiers/);
  assert.match(hearthPrototype,/function leveragePreparedSendPayload/);
  assert.match(hearthPrototype,/async function approvePreparedLeverageItem/);
  assert.match(hearthPrototype,/\/api\/val\/external-actions\/email-send-now/);
  assert.match(hearthPrototype,/VAL has the draft, but cannot send until the recipient is attached/);
  assert.match(hearthPrototype,/async function savePreparedLeverageEdits/);
  assert.match(hearthPrototype,/\/api\/val\/drafts\/' \+ encodeURIComponent\(ids\.draftId\)/);
  assert.match(hearthPrototype,/async function holdPreparedLeverageItem/);
  assert.match(hearthPrototype,/\/api\/val\/ready-for-you\/' \+ encodeURIComponent\(ids\.readyForYouId\) \+ '\/reject'/);
  assert.match(hearthPrototype,/await approvePreparedLeverageItem\(\)/);
  assert.match(hearthPrototype,/await savePreparedLeverageEdits\(\)/);
  assert.match(hearthPrototype,/await holdPreparedLeverageItem\(\)/);
});

test('Home Leverage is fed by canonical Ready For You prepared work',()=>{
  assert.match(server,/function buildDashboardIntelligence\(\{moves=\[\],profiles=\[\],onboarding,evidenceItems=\[\],drafts=\[\],readyForYouItems=\[\],freshTranscriptPacket=null\}=\{\}\)/);
  assert.match(server,/const readyQueueItems=dashboardNormalizeCardCollection\('ready_for_you',safeArray\(readyForYouItems\)\)/);
  assert.match(server,/valReadyForYou\?\.listItems\?valReadyForYou\.listItems\(\{limit:20\}\)/);
  assert.doesNotMatch(server,/valReadyForYou\?\.buildQueue\?valReadyForYou\.buildQueue\(\{limit:20\}\)/);
  assert.match(server,/readyForYouItems=safeArray\(readyForYouQueue\?\.preparedItems\)\.length/);
  assert.match(server,/safeArray\(readyForYouQueue\.prepared_items\)/);
  assert.match(server,/buildDashboardIntelligence\(\{moves,profiles,onboarding,evidenceItems,drafts,readyForYouItems,freshTranscriptPacket\}\)/);
  assert.match(hearthPrototype,/const leverageItems = briefingItems\(briefing\.readyForYou\);/);
  assert.doesNotMatch(hearthPrototype,/const leverageItems = briefingItems\(briefing\.readyForYou\)\.concat\(briefingItems\(briefing\.watching\)\);/);
});

test('Commitments drawer only labels concrete artifacts as prepared work',()=>{
  assert.match(hearthPrototype,/function taskWorkspaceAttachments/);
  assert.match(hearthPrototype,/\/api\/val\/ready-for-you\/build/);
  assert.match(hearthPrototype,/preparedItems/);
  assert.match(hearthPrototype,/prepared_items/);
  assert.match(hearthPrototype,/allBuilt/);
  assert.match(hearthPrototype,/filter\(\(item\) => hasPreparedWorkPacketAndActionStatus\(item\) && Boolean\(leverageDraftFromWorkspace\(\{sourceItem:item\}\)\)\)/);
  assert.match(hearthPrototype,/kind:preparedArtifactKind\(item\) \|\| 'prepared_work'/);
  const renderSource = hearthPrototype.slice(
    hearthPrototype.indexOf('function renderTaskWorkspace'),
    hearthPrototype.indexOf('async function hydrateTaskCompanionCount')
  );
  assert.match(renderSource,/Prepared by VAL/);
  assert.match(renderSource,/Review draft/);
  assert.doesNotMatch(renderSource,/taskWorkspacePreviewText\(item\.body/);
});

test('Commitments drawer keeps transcript blobs out of the executive list',()=>{
  assert.match(hearthPrototype,/function taskWorkspacePreviewText/);
  assert.match(hearthPrototype,/replace\(\s*\/\^Hi everyone/);
  assert.match(hearthPrototype,/taskWorkspaceDisplayTitle\(task\)/);
  assert.match(hearthPrototype,/taskWorkspaceDisplayNotes\(task\)/);
  assert.match(hearthPrototype,/Open source transcript/);
});

test('Home tasks shows every open transcript Action Item with source context',()=>{
  assert.match(hearthPrototype,/Open your tasks/);
  assert.match(hearthPrototype,/open tasks/);
  assert.match(hearthPrototype,/Your tasks/);
  assert.match(hearthPrototype,/Every transcript Action Item stays here until it is done/);
  assert.doesNotMatch(hearthPrototype,/lower-signal extracted item/);
  assert.match(hearthPrototype,/\/api\/val\/work-items\/tasks\?limit=500/);
  assert.doesNotMatch(hearthPrototype,/\/api\/val\/commitments\?limit=200/);
  assert.match(hearthPrototype,/__workspaceKind:transcriptTask \? 'transcript_task'/);
  assert.match(hearthPrototype,/\/api\/val\/transcript-tasks\//);
  assert.match(hearthPrototype,/relatedTaskIds:task\.relatedTaskIds/);
  assert.match(hearthPrototype,/const completedTaskIds = new Set/);
  assert.match(hearthPrototype,/currentTaskWorkspaceTasks = currentTaskWorkspaceTasks\.filter/);
  assert.match(hearthPrototype,/currentTaskWorkspaceTasks = previousTasks/);
  assert.match(hearthPrototype,/Waiting on ' \+ owner/);
  assert.match(hearthPrototype,/Owner to confirm/);
  assert.match(hearthPrototype,/eventType:'user_marked_done'/);
});

test('Home commitment drafts attach only to the exact commitment, not the whole transcript',()=>{
  const source = hearthPrototype.slice(
    hearthPrototype.indexOf('function taskWorkspaceAttachments'),
    hearthPrototype.indexOf('function taskWorkspaceDueLabel')
  );
  assert.match(source,/const directTaskIds = new Set/);
  assert.match(source,/metadata\.commitmentId/);
  assert.match(source,/sourceContext\.commitmentId/);
  assert.doesNotMatch(source,/taskTranscriptId && ids\.includes/);
  assert.doesNotMatch(source,/taskSourceId && ids\.includes/);
});

test('Alignment Done persists source commitments when available',()=>{
  assert.match(hearthPrototype,/function alignmentCompletionCommitmentId/);
  assert.match(hearthPrototype,/function alignmentCompletionChiefRecommendationId/);
  assert.match(hearthPrototype,/function alignmentCompletionCanonicalWorkItemId/);
  assert.match(hearthPrototype,/function homeCompletionKey/);
  assert.match(hearthPrototype,/function markHomeItemCompleted/);
  assert.match(hearthPrototype,/homeCompletedItemsStorageKey/);
  assert.match(hearthPrototype,/roomName === 'alignment' && homeItemCompleted\(roomName, item\)/);
  assert.match(hearthPrototype,/markHomeItemCompleted\('alignment', handledItem, 'done'\)/);
  assert.match(hearthPrototype,/Marked done from Home Alignment/);
  assert.match(hearthPrototype,/\/api\/val\/commitments\//);
  assert.match(hearthPrototype,/\/api\/val\/chief-of-staff\/' \+ encodeURIComponent\(chiefRecommendationId\) \+ '\/complete'/);
  assert.match(hearthPrototype,/canonicalWorkItemId/);
  assert.match(hearthPrototype,/void persistAlignmentDone\(handledItem\)/);
});

test('Home full context opens selected Observer Co-Work with Chief of Staff evidence',()=>{
  assert.match(hearthPrototype,/function homeBriefingEvidenceSources/);
  assert.match(hearthPrototype,/function homeChiefOfStaffSubject/);
  assert.doesNotMatch(hearthPrototype,/I would keep ' \+ subject \+ ' in view today/);
  assert.doesNotMatch(hearthPrototype,/selectedName \+ ' is watching '/);
  assert.match(hearthPrototype,/selectedName \+ ' can show the source trail behind this read\.'/);
  assert.match(hearthPrototype,/No single source-backed move has earned the room yet\./);
  assert.doesNotMatch(hearthPrototype,/has the source context behind/);
  assert.match(hearthPrototype,/function homeObserverProofReviews/);
  assert.match(hearthPrototype,/function homeObserverContextPatch/);
  assert.match(hearthPrototype,/chiefOfStaffRead/);
  assert.match(hearthPrototype,/sourceTrail:evidenceSources\.map/);
  assert.match(hearthPrototype,/observerProofReviews:homeObserverProofReviews\(observer, 8\)\.map/);
  assert.match(hearthPrototype,/What ' \+ observerName \+ ' actually observed/);
  assert.match(hearthPrototype,/async function openHomeObserverFullContext/);
  assert.match(hearthPrototype,/await Promise\.race\(\[\s*loadLiveObserverBoardContext\(\)/);
  assert.match(hearthPrototype,/openObserverCowork\(observerConversationId\(observer\.name\), 'observer'/);
  assert.match(hearthPrototype,/const preserveInitialContext = Boolean\(options\.initialMessage \|\| options\.contextPatch\?\.openingAnswer \|\| options\.contextPatch\?\.homeFullContext\)/);
  assert.match(hearthPrototype,/hydrateConversation:!userAlreadyStarted && !preserveInitialContext/);
  assert.doesNotMatch(hearthPrototype,/if\(action === 'board'\)\{\s*const observer = selectHomeObserverSignal[\s\S]{0,140}openObserverBoard\(\{selectedObserverName/);
});

test('Chief of Staff Home witness is concrete and points to inspectable proof',()=>{
  assert.match(server,/function buildChiefDailyWitness/);
  assert.match(server,/const dailyWitness=buildChiefDailyWitness\(chiefHomeItem\)/);
  assert.match(server,/chiefHeadline:dashboardShortText\(recommendation\.title/);
  assert.match(server,/\[candidate\.leadObserver\|\|candidate\.lead_observer\]/);
  assert.match(server,/\$\{observerName\} brought this forward: \$\{findingSentence\}\./);
  assert.match(server,/items\.findIndex\(candidate=>String\(candidate\.chiefQueuePacketId\|\|''\)\.trim\(\)===packetId\)===index/);
  assert.match(server,/I put the clearest next decision in Alignment\./);
  assert.match(server,/\$\{observerName\} has the source trail if you want the full context\./);
  assert.match(server,/GOALL is the thing to settle today/);
  assert.match(server,/Mike needs the dashboard\/projections handoff clarified/);
  assert.match(server,/open Full Context if you want to inspect the source before acting/);
  assert.doesNotMatch(server,/The Chief of Staff is watching the live evidence/);
});

test('Home Alignment can be fed by active Chief of Staff recommendations',()=>{
  assert.match(server,/function chiefRecommendationHomeItems/);
  assert.match(server,/valIntelligenceSpine\.listChiefRecommendations/);
  assert.match(server,/chiefRecommendations[\s\S]{0,260}\.flatMap\(chiefRecommendationHomeItems\)/);
  assert.match(server,/chiefAlignmentQueue:chiefHomeItems/);
  assert.match(hearthPrototype,/briefing\.chiefAlignmentQueue/);
  assert.match(server,/chiefQueuePacketId:packetId/);
  assert.match(hearthPrototype,/alignmentCompletionChiefQueuePacketId/);
  assert.match(server,/highest=chiefHomeItem\|\|top\[0\]/);
  assert.match(server,/chiefRecommendation:chiefHomeItem\|\|null/);
  assert.match(server,/chiefRecommendationId:recommendation\.id/);
  assert.match(server,/Project context wins before relationship context/);
});

test('Co-Work send reads the visible chatbar before any stale workspace input',()=>{
  assert.match(hearthPrototype,/function homeCoworkFormNode/);
  assert.match(hearthPrototype,/function homeCoworkTextareaNode/);
  assert.match(hearthPrototype,/function homeCoworkSubmitNode/);
  assert.match(hearthPrototype,/if\(mode === 'cowork'\)\{\s*const activeTextarea = homeCoworkTextareaNode\?\.\(\)/);
  const runCoworkSource = hearthPrototype.slice(
    hearthPrototype.indexOf('async function runCowork'),
    hearthPrototype.indexOf('async function runTeachVal')
  );
  assert.doesNotMatch(runCoworkSource,/workspaceInputPanel\.querySelector\('\[data-workspace-input="cowork"\]'\)/);
  assert.match(runCoworkSource,/const textarea = homeCoworkTextareaNode\(\)/);
  assert.match(hearthPrototype,/const observerLane = Boolean\(deskWorkspace\?\.classList\.contains\('observer-cowork-active'\)\)/);
  assert.match(hearthPrototype,/submitActiveCoworkEntry\(message\)\.then\(\(handled\) => \{\s*if\(!handled\) runCowork\('think', message\)/);
});

test('Observer chats stay in scoped Co-Work instead of falling through to generic Home chat',()=>{
  const submitSource = hearthPrototype.slice(
    hearthPrototype.indexOf('async function submitActiveCoworkEntry'),
    hearthPrototype.indexOf('function coworkScopeForEntry')
  );
  assert.match(submitSource,/const observerScopedLane = entry\.entrypointId === 'observer\.discussion' \|\| entry\.entrypointId === 'board\.chief_of_staff'/);
  assert.match(submitSource,/observerCoworkCardAnswer\(input, entry\.context \|\| \{\}\)/);
  assert.match(submitSource,/if\(observerScopedLane\)\{\s*const localAnswer = observerCoworkCardAnswer\(input, entry\.context \|\| \{\}\);/);
  assert.match(submitSource,/if\(localAnswer\)\{\s*appendHomeCoworkMessage\('val', localAnswer\);/);
  assert.doesNotMatch(submitSource,/entry\.entrypointId === 'observer\.discussion' \|\| entry\.entrypointId === 'board\.chief_of_staff'\)\{\s*return false/);
});

test('Board of Observers waits for one compact truthful hydration before rendering the graph',()=>{
  const boardSource = hearthPrototype.slice(
    hearthPrototype.indexOf('async function openObserverBoard'),
    hearthPrototype.indexOf('function orientHomeCoworkFromInput')
  );
  assert.match(boardSource,/liveContextPromise = loadLiveObserverBoardContext\(\);\s*await liveContextPromise;/);
  assert.match(boardSource,/skipLiveLoad/);
  assert.match(boardSource,/existingSelectedObserverId/);
  assert.doesNotMatch(boardSource,/Promise\.race/);
  assert.doesNotMatch(boardSource,/openObserverBoard\(\{\.\.\.options, selectedObserverId:/);
  assert.doesNotMatch(boardSource,/const chief = observerBoardState\.chiefOfStaff;\s*await loadLiveObserverBoardContext\(\);/);
});

test('Board of Observers pauses background motion while packet lights remain live',()=>{
  assert.match(hearthCss,/\.observer-live-board\.packets-active \.observer-static-signal,/);
  assert.match(hearthCss,/body:has\(\.desk-workspace\.observer-board-mode\[aria-hidden="false"\]\) \.conversation-path/);
  assert.match(hearthCss,/animation-play-state:paused!important/);
});

test('Board of Observers balances truthful packet routes without empty decorative paths',()=>{
  assert.match(hearthPrototype,/function observerBoardBalancedConnections/);
  assert.match(hearthPrototype,/if\(from === 'Chief of Staff'\)/);
  assert.match(hearthPrototype,/return observerBoardBalancedConnections\(candidates,20\)/);
  assert.match(hearthPrototype,/\['sage','rose','bridge'\]\.forEach/);
  assert.match(hearthPrototype,/observerBoardState\.observers\.map\(\(observer\) => observer\.name\)\.forEach/);
  assert.match(hearthPrototype,/routes\.forEach\(\(route, routeIndex\)/);
  assert.doesNotMatch(hearthPrototype,/return connections\.slice\(0, 24\)/);
  assert.doesNotMatch(hearthPrototype,/const baseObserverPaths = showPacketField/);
  assert.doesNotMatch(hearthPrototype,/const observerFilaments = showPacketField/);
  assert.match(hearthPrototype,/Source Packets · ' \+ allLiveConnections\.length \+ ' Visible Routes/);
  assert.match(hearthCss,/\.observer-live-packet\{\s*pointer-events:auto;/);
});

test('Witnessing First Look treats delivered and deliberately excluded candidates as resolved',()=>{
  assert.match(hearthPrototype,/function valFirstLookCandidateIsResolved/);
  assert.match(hearthPrototype,/\['delivered', 'excluded'\]\.includes/);
  assert.match(hearthPrototype,/function valFirstLookCandidateReviewIsComplete/);
  assert.match(hearthPrototype,/valFirstLookCandidateReviewIsComplete\(\)\?'<button type="button"[^>]+>Continue Witnessing<\/button>'/);
  assert.match(hearthPrototype,/if\(!valFirstLookCandidateReviewIsComplete\(\)\)/);
});

test('Function close control is an always-visible icon rather than a text button',()=>{
  assert.match(hearthHtml,/class="return-button"[^>]+aria-label="Close this function">×<\/button>/);
  assert.match(hearthCss,/\.return-button\{\s*position:fixed;/);
  assert.match(hearthCss,/z-index:5200;/);
  const returnControlSource=hearthPrototype.slice(
    hearthPrototype.indexOf('function updateWorkspaceReturnButton'),
    hearthPrototype.indexOf('function showRelationshipReceipt')
  );
  assert.match(returnControlSource,/returnButton\.textContent = '×'/);
  assert.doesNotMatch(returnControlSource,/returnButton\.textContent = label/);
  assert.doesNotMatch(returnControlSource,/returnButton\.textContent = 'Close/);
});

test('Co-Work copy controls work from the rendered chat surface',()=>{
  assert.match(hearthPrototype,/async function copyTextToClipboard/);
  assert.match(hearthPrototype,/navigator\.clipboard\?\.writeText/);
  assert.match(hearthPrototype,/document\.execCommand\('copy'\)/);
  assert.match(hearthPrototype,/deskWorkspace\.addEventListener\('click', async \(event\) => \{\s*const copyOutputButton = event\.target\.closest\('\[data-cowork-copy-output\]'\)/);
  assert.match(hearthPrototype,/await copyCoworkOutput\(copyOutputButton\)/);
});

test('Home LinkedIn visibility uses live receipts and never the retired demo people array',()=>{
  assert.match(server,/app\.get\('\/api\/val\/linkedin\/visibility'/);
  assert.match(server,/source:'live_relationship_and_draft_receipts'/);
  assert.match(hearthPrototype,/hydrateLinkedInVisibility/);
  assert.match(hearthPrototype,/\/api\/val\/linkedin\/visibility/);
  assert.match(hearthPrototype,/No demo posts are being substituted/);
  assert.doesNotMatch(hearthPrototype,/const linkedinVisibilityItems = \[/);
  assert.doesNotMatch(hearthPrototype,/Shared a reflection on sustaining creative momentum without overextending/);
});

test('Board Observer cards stay stable during hydration, scroll, and close only on outside clicks',()=>{
  assert.match(hearthPrototype,/const existingSelectedObserverId = deskWorkspace\?\.classList\.contains\('observer-board-mode'\)/);
  assert.match(hearthPrototype,/const selectedObserverId = requestedSelectedObserverId \|\| \(selectedObserverName \? observerConversationId\(selectedObserverName\) : ''\)/);
  assert.match(hearthPrototype,/function handleObserverBoardNodeActivation/);
  assert.match(hearthPrototype,/workspaceInputPanel\.querySelectorAll\('\.observer-node\[data-observer-cowork\],\.observer-chief-card\[data-observer-cowork\]'\)\.forEach/);
  assert.match(hearthPrototype,/if\(selectedObserverId\)\{\s*requestAnimationFrame\(\(\) => updateObserverSelectedCard\(selectedObserverId\)\);/);
  assert.match(hearthPrototype,/openObserverBoard\(\{afterWitnessing:true,waitForLiveContext:true\}\)/);
  assert.match(hearthPrototype,/fetchBoardResource\('\/api\/val\/board\/context\?limit=36&compact=true', 12000\)/);
  assert.doesNotMatch(hearthPrototype,/liveContextPromise\.then\(\(\) => \{[\s\S]{0,500}openObserverBoard/);
  assert.match(hearthCss,/\.observer-graph-field\.observer-card-open \.observer-card-dismiss-surface\{\s*pointer-events:auto;/);
  assert.match(hearthCss,/\.observer-signal-paths\{[\s\S]{0,220}pointer-events:auto;/);
  assert.match(hearthCss,/\.observer-live-thread\{[\s\S]{0,420}pointer-events:none;/);
  assert.match(hearthCss,/\.observer-live-packet\{[\s\S]{0,120}pointer-events:auto;/);
  assert.match(hearthCss,/\.observer-selected-card\{[\s\S]{0,180}max-height:min\(620px,calc\(100vh - 96px\)\);[\s\S]{0,120}overflow-y:auto;/);
  assert.match(hearthCss,/animation:observer-card-note-arrive \.55s ease-out \.08s both;/);
  const positionedNodeCss = hearthCss.slice(
    hearthCss.indexOf('.observer-val-node,\n.observer-node'),
    hearthCss.indexOf('.observer-val-node{')
  );
  const dismissSurfaceCss = hearthCss.slice(
    hearthCss.indexOf('.observer-card-dismiss-surface{'),
    hearthCss.indexOf('.observer-live-board.awaiting-witnessing')
  );
  assert.match(positionedNodeCss,/z-index:12;/);
  assert.match(dismissSurfaceCss,/z-index:7;/);
});

test('Observer Co-Work UI opens with loaded evidence instead of backend disclaimers',()=>{
  assert.match(hearthPrototype,/function normalizedObserverProofReviews/);
  assert.match(hearthPrototype,/proofReviews\.length \? proofReviews : observerMeaningfulLiveReviews/);
  assert.match(hearthPrototype,/hasInspectableReviews && \(asksEvidence \|\| asksRelationshipRepair \|\| asksContext\)/);
  assert.match(hearthPrototype,/is answering from packet reviews, not from a generic guess/);
  assert.match(hearthPrototype,/I do not have source-backed evidence that a specific relationship needs repair right now/);
  assert.match(hearthPrototype,/Evidence I can point to:/);
  assert.match(hearthPrototype,/This Observer is loaded with the evidence behind the card/);
  assert.match(hearthPrototype,/context\.openingAnswer/);
  assert.doesNotMatch(hearthPrototype,/Scoped observer conversation\. Nothing external happens from here\./);
});
