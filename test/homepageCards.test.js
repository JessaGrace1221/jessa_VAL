const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
const dashboard=fs.readFileSync(path.join(root,'dashboard.html'),'utf8');
const commandCenter=fs.readFileSync(path.join(root,'command-center.js'),'utf8');

test('homepage cards expose a strict six-card intelligence contract',()=>{
  assert.match(server,/function dashboardNormalizeCardItem/);
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
});
