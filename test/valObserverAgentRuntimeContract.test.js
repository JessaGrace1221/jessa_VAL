const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const contract=fs.readFileSync(path.join(root,'docs','VAL_OBSERVER_AGENT_RUNTIME_CONTRACT.md'),'utf8');
const hearthHtml=fs.readFileSync(path.join(root,'hearth-prototype.html'),'utf8');
const hearthJs=fs.readFileSync(path.join(root,'hearth-prototype.js'),'utf8');
const hearthCss=fs.readFileSync(path.join(root,'hearth-prototype.css'),'utf8');
const routes=fs.readFileSync(path.join(root,'services','valIntelligenceSpineRoutes.js'),'utf8');
const {
  VAL_OBSERVER_REGISTRY,
  DEFAULT_OBSERVERS,
  OBSERVER_PACKET_LENSES,
  publicObserverDefinitions,
  publicObserverBlockDefinitions
}=require('../services/valObserverRegistry');

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

test('all 14 Observer agents have one bounded executable definition',()=>{
  assert.equal(VAL_OBSERVER_REGISTRY.length,14);
  assert.equal(new Set(VAL_OBSERVER_REGISTRY.map(definition=>definition.observerId)).size,14);
  assert.equal(new Set(VAL_OBSERVER_REGISTRY.map(definition=>definition.observerName)).size,14);
  assert.equal(DEFAULT_OBSERVERS.length,14);
  assert.equal(Object.keys(OBSERVER_PACKET_LENSES).length,14);
  for(const definition of VAL_OBSERVER_REGISTRY){
    assert.ok(definition.version);
    assert.ok(definition.promptKey);
    assert.ok(definition.truthProtected);
    assert.ok(definition.lens);
    assert.ok(definition.question);
    assert.deepEqual(definition.reads,['board_packet','source_refs','approved_memory']);
    assert.ok(definition.doesNot.includes('recommend'));
    assert.ok(definition.doesNot.includes('draft'));
    assert.ok(definition.doesNot.includes('send'));
    assert.equal(definition.outputContract,'observer_receipt_v1');
  }
  assert.equal(publicObserverDefinitions().length,14);
});

test('all Observer agents expose one builder-safe executable block contract',()=>{
  const blocks=publicObserverBlockDefinitions();
  assert.equal(blocks.length,14);
  for(const block of blocks){
    assert.equal(block.blockType,'observer');
    assert.match(block.definitionRef,/@v1$/);
    assert.deepEqual(block.accepts,['board_packet','source_refs','approved_memory']);
    assert.deepEqual(block.emits,['observer_receipt_v1']);
    assert.deepEqual(block.handoffs,['observer','round_table','chief_of_staff']);
    assert.equal(block.externalActionPolicy,'never');
    assert.ok(block.terminalStates.includes('no_meaningful_signal'));
    assert.ok(block.terminalStates.includes('retryable_failure'));
  }
  assert.match(contract,/A connection is not considered[\s\S]*receiving block stores a receipt for the exact upstream run/);
});

test('Board cards visibly prove bounded role and completed review state',()=>{
  assert.match(routes,/definitions:publicObserverDefinitions\(\)/);
  assert.match(routes,/blockDefinitions:publicObserverBlockDefinitions\(\)/);
  assert.match(hearthJs,/observerBoardState\.definitionsByObserver/);
  assert.match(hearthJs,/function observerAgentProof/);
  assert.match(hearthJs,/>What I Protect<\/em>/);
  assert.match(hearthJs,/Observation stored/);
  assert.match(hearthJs,/Review complete · No meaningful signal/);
  assert.match(hearthJs,/Waiting for a completed review/);
  assert.match(hearthJs,/No review result is being invented/);
  assert.match(hearthJs,/data-observer-proof-status/);
  assert.match(hearthCss,/\.observer-agent-proof\{/);
  assert.match(hearthCss,/data-observer-proof-status="no-signal"/);
});

test('Home exposes VAL Studio while Teach VAL remains a reviewed action inside it',()=>{
  assert.match(hearthHtml,/<button class="teach-pen"[^>]*hidden[^>]*aria-hidden="true"[^>]*>[\s\S]*<span>VAL Studio<\/span>/);
  assert.match(hearthHtml,/<button type="button" class="drawer-link studio-drawer-link"[^>]*>[\s\S]*<span>VAL Studio<\/span>/);
  assert.doesNotMatch(hearthHtml,/<button class="teach-pen"[^>]*>[\s\S]*<span>Teach VAL<\/span>/);
  assert.match(hearthJs,/lens: 'VAL Studio'/);
  assert.match(hearthJs,/label: 'Teach VAL a correction'/);
  assert.match(hearthJs,/Every durable learning candidate still requires review/);
});
