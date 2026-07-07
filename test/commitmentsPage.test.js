const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const dashboard=fs.readFileSync(path.join(root,'dashboard.html'),'utf8');
const commandCenter=fs.readFileSync(path.join(root,'command-center.js'),'utf8');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');

test('primary navigation treats Commitments as the accountability surface',()=>{
  assert.match(commandCenter,/\{id:'commitments',icon:'check',label:'Commitments',group:'growth'\}/);
  assert.match(commandCenter,/if\(view==='tasks'\|\|view==='task_board'\|\|view==='calendarized_tasks'\)view='commitments'/);
  assert.match(commandCenter,/commitments:'openCommitmentsPage'/);
  assert.match(commandCenter,/tasks:'openCommitmentsPage'/);
  assert.match(dashboard,/data-view="commitments"><span class="val-nav-icon">✓<\/span><span>Commitments<\/span>/);
  assert.doesNotMatch(dashboard,/data-view="tasks"><span class="val-nav-icon">✓<\/span><span>Actions<\/span>/);
});

test('dashboard Commitments page is backed by the ledger API while keeping tasks secondary',()=>{
  assert.match(dashboard,/function openCommitmentsPage\(\)/);
  assert.match(dashboard,/function loadCommitmentsPage\(\)/);
  assert.match(dashboard,/function commitmentPageAction\(id,action\)/);
  assert.match(dashboard,/\/api\/val\/commitments\?limit=120/);
  assert.match(dashboard,/Commitments are not an inbox/);
  assert.match(dashboard,/Internal Follow-Through Tasks/);
  assert.match(dashboard,/function openTaskBoard\(\)/);
  assert.match(dashboard,/title:isBookEditorMode\(\)\?'Editorial Tasks':'Task Board'/);
});

test('legacy task routes and page guide now land on Commitments',()=>{
  assert.match(dashboard,/tasks:'commitments'/);
  assert.match(dashboard,/task_board:'commitments'/);
  assert.match(dashboard,/calendarized_tasks:'commitments'/);
  assert.match(server,/href="\/dashboard\?view=commitments"><span class="icon">\$\{icon\.calendar\}<\/span><h3>Commitments<\/h3>/);
  assert.match(server,/Open Commitments/);
  assert.match(server,/Commitments By Relationship/);
  assert.doesNotMatch(server,/Calendarized Tasks/);
  assert.doesNotMatch(server,/Tasks By Relationship/);
});

test('Executive Inbox remains separate from Commitments',()=>{
  assert.match(dashboard,/Executive Inbox/);
  assert.match(dashboard,/executive_inbox:'email_intelligence'/);
  assert.match(dashboard,/function openEmailIntelligence\(\)/);
  assert.match(commandCenter,/\{id:'email_intelligence',icon:'mail',label:'Executive Inbox',group:'growth'\}/);
  assert.match(commandCenter,/email_intelligence:'openEmailIntelligence'/);
});
