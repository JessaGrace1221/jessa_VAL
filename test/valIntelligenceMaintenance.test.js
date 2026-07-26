const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const server=fs.readFileSync(path.join(__dirname,'..','server.js'),'utf8');

test('scheduled intelligence maintenance is bounded and sequential',()=>{
  const start=server.indexOf('async function runValIntelligenceMaintenance()');
  const end=server.indexOf('const HEARTH_PACKET_HYDRATION_REQUIREMENTS',start);
  assert.ok(start>=0&&end>start);
  const block=server.slice(start,end);
  assert.match(block,/retryUndeliveredSources\(\{limit:5\}\)/);
  assert.match(block,/await valBoardDeliveryQueue\.whenIdle\(\)/);
  assert.match(block,/retryFailedIntelligenceRuns\(\{limit:2\}\)/);
  assert.ok(block.indexOf('retryUndeliveredSources')<block.indexOf('whenIdle'));
  assert.ok(block.indexOf('whenIdle')<block.indexOf('retryFailedIntelligenceRuns'));
});
