const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const server=fs.readFileSync(path.join(__dirname,'..','server.js'),'utf8');

test('scheduled intelligence maintenance never retries model reasoning unless explicitly enabled',()=>{
  const start=server.indexOf('async function runValIntelligenceMaintenance()');
  const end=server.indexOf('const HEARTH_PACKET_HYDRATION_REQUIREMENTS',start);
  assert.ok(start>=0&&end>start);
  const block=server.slice(start,end);
  assert.match(block,/await valBoardDeliveryQueue\.whenIdle\(\)/);
  assert.match(block,/if\(VAL_BOARD_AUTOMATIC_RETRIES\)/);
  assert.match(block,/retryUndeliveredSources\(\{limit:2\}\)/);
  assert.match(block,/retryFailedIntelligenceRuns\(\{limit:1\}\)/);
  assert.ok(block.indexOf('if(VAL_BOARD_AUTOMATIC_RETRIES)')<block.indexOf('retryUndeliveredSources'));
});

test('Board reasoning has a daily circuit and a dedicated lower-cost model',()=>{
  assert.match(server,/const OPENAI_OBSERVER_MODEL = process\.env\.VAL_OBSERVER_MODEL \|\| 'gpt-5-mini'/);
  assert.match(server,/VAL_BOARD_DAILY_OBSERVER_CALL_LIMIT/);
  assert.match(server,/async function boardObserverDailyBudget\(\)/);
  assert.match(server,/reason:'daily_observer_call_limit'/);
  assert.match(server,/batchSize:4/);
});
