const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const contract=fs.readFileSync(path.join(root,'docs','VAL_OBSERVER_AGENT_RUNTIME_CONTRACT.md'),'utf8');
const hearthHtml=fs.readFileSync(path.join(root,'hearth-prototype.html'),'utf8');
const hearthJs=fs.readFileSync(path.join(root,'hearth-prototype.js'),'utf8');

test('Observer agent runtime contract requires bounded, durable, inspectable execution',()=>{
  assert.match(contract,/a bounded responsibility/);
  assert.match(contract,/durable context scoped to its lens/);
  assert.match(contract,/inspectable source evidence/);
  assert.match(contract,/queued[\s\S]*context_loaded[\s\S]*reviewed[\s\S]*observed \| no_meaningful_signal[\s\S]*validated[\s\S]*persisted[\s\S]*available_to_chief/);
  assert.match(contract,/retryable_failure/);
  assert.match(contract,/failed or incomplete Observer run is never silently treated as[\s\S]*no_meaningful_signal/);
});

test('Chief of Staff is a coordinating agent with an ordered durable queue',()=>{
  assert.match(contract,/coordinates completed Observer receipts/);
  assert.match(contract,/rank grounded candidates in order/);
  assert.match(contract,/keep the next eligible recommendation ready/);
  assert.match(contract,/does not[\s\S]*produce atmospheric or unexplained language/);
});

test('Home exposes VAL Studio while Teach VAL remains a reviewed action inside it',()=>{
  assert.match(hearthHtml,/<button class="teach-pen"[^>]*>[\s\S]*<span>VAL Studio<\/span>/);
  assert.doesNotMatch(hearthHtml,/<button class="teach-pen"[^>]*>[\s\S]*<span>Teach VAL<\/span>/);
  assert.match(hearthJs,/lens: 'VAL Studio'/);
  assert.match(hearthJs,/label: 'Teach VAL a correction'/);
  assert.match(hearthJs,/Every durable learning candidate still requires review/);
});
