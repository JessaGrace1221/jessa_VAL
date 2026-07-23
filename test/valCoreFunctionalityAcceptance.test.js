const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const hearthJs = fs.readFileSync(path.join(root, 'hearth-prototype.js'), 'utf8');
const serverJs = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
const clickContracts = fs.readFileSync(path.join(root, 'docs', 'HEARTH_CLICK_CONTRACTS.md'), 'utf8');
const coworkRegistry = fs.readFileSync(path.join(root, 'docs', 'VAL_COWORK_ENTRYPOINT_REGISTRY.md'), 'utf8');
const acceptanceGate = fs.readFileSync(path.join(root, 'docs', 'VAL_CORE_FUNCTIONALITY_ACCEPTANCE.md'), 'utf8');

test('Lead Intelligence remains a non-conversational preview and approval surface', () => {
  const leadSection = clickContracts.slice(clickContracts.indexOf('## Lead Intelligence'), clickContracts.indexOf('## VAL Drawer And Setup'));
  assert.match(coworkRegistry, /\| Lead Intelligence \| No Co-Work \|/);
  assert.match(coworkRegistry, /must not add a Co-Work route/);
  assert.doesNotMatch(leadSection, /Co-Work/);
  assert.doesNotMatch(hearthJs, /entrypointId:'lead_/);
  assert.match(hearthJs, /actions:'Run preview, approve\/hold, import approved only'/);
});

test('core acceptance gate protects source, review, return, and approval boundaries', () => {
  [
    'Transcript To Reviewable Meeting Overview',
    'Executive Email To Evidence And Private Draft',
    'Project Manager Scoped Update',
    'Stewardship Next Move',
    'Leverage Review And Return',
    'calendar `.ics` attachments must never become documents',
    'the return action returns to that project',
    'no introduction, message, CRM update, task, or calendar action executes automatically',
    'no external execution is claimed unless the provider confirms it',
    'the automated contract gate passes',
    'all five browser walkthroughs pass using real source data'
  ].forEach((required) => assert.ok(acceptanceGate.includes(required), 'Missing core acceptance requirement: ' + required));
});

test('canonical core entry points remain source-specific and review-gated', () => {
  [
    "entrypointId:'transcript.working_brief'",
    "entrypointId:'transcript.action_item'",
    "entrypointId:'email.thread'",
    "entrypointId:'relationship.overview'",
    "entrypointId:'project.onboarding'",
    "entrypointId:'project.workstreams'",
    "entrypointId:'project.next_move'",
    '/api/val/cowork/entries/open',
    '/api/val/cowork/sessions/',
    '/apply'
  ].forEach((required) => assert.ok(hearthJs.includes(required), 'Missing canonical core route: ' + required));
  assert.match(hearthJs, /Documents are now used from their linked Project Manager/);
  assert.match(hearthJs, /Commitment follow-through is now handled from its source/);
});

test('explicit linked Gmail attachment review provides one readable source to VAL', () => {
  assert.match(serverJs, /async function linkedGmailAttachmentContextForQuery/);
  assert.match(serverJs, /Linked VAL attachment source found/);
  assert.match(serverJs, /Gmail document attachment/);
  assert.match(serverJs, /extractUploadedText\(\{/);
  assert.match(serverJs, /Relevant linked VAL attachment source/);
  assert.match(serverJs, /linkedGmailAttachmentContextForQuery\(lastUser\+'\\n'\+memoryQuery,projectContext\)/);
});

test('core drawer Co-Work controls route to selected canonical entries only', () => {
  const drawerIconRoute = hearthJs.match(/async function openDrawerCoworkFromIcon[\s\S]*?\n}\n\ndrawerCoworkIcon\?\.addEventListener/)[0];
  const projectRoute = hearthJs.match(/async function openProjectScopedCowork[\s\S]*?\n}\n\nfunction openProjectFieldCowork/)[0];
  const transcriptRoute = hearthJs.match(/function openTimelineCoworkSession[\s\S]*?\n}\n\nasync function hydrateTimelineStatus/)[0];

  assert.match(drawerIconRoute, /await openRelationshipOverviewCowork\(stewardshipPersonById\(stewardshipSelectedNetworkId\) \|\| activeRelationshipProfile\);/);
  assert.match(drawerIconRoute, /await openProjectOverviewCowork\(drawerCoworkIcon\);/);
  assert.match(drawerIconRoute, /await openTimelineCoworkSession\(\);/);
  assert.match(drawerIconRoute, /await openCorrespondenceThreadCowork\(activeCorrespondenceItem\);/);
  assert.doesNotMatch(drawerIconRoute, /drawerCoworkContext/);
  assert.doesNotMatch(hearthJs, /function drawerCoworkContext/);

  assert.match(projectRoute, /return openProjectWorkstreamsCowork\(node\);/);
  assert.match(projectRoute, /not available until it has a source-specific workflow/);
  assert.doesNotMatch(projectRoute, /openContextualCoworkSession/);
  assert.doesNotMatch(hearthJs, /function projectCoworkSpec/);
  assert.doesNotMatch(hearthJs, /mode:'field_update'/);

  assert.match(transcriptRoute, /return openTranscriptWorkingBriefCowork\(transcriptId\);/);
  assert.match(transcriptRoute, /Select a transcript before opening its Working Brief/);
  assert.doesNotMatch(hearthJs, /Co-Work with VAL about Transcripts/);
});
