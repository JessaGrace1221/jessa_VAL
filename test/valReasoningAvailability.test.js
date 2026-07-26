const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const server=fs.readFileSync(path.join(__dirname,'..','server.js'),'utf8');

test('Board intelligence uses the canonical transcript archive loader',()=>{
  assert.match(server,/listRecentTranscripts:\(\{limit=8\}=\{\}\)=>recentTranscripts\(3650,limit\)/);
});

test('provider capacity failures open a bounded reasoning circuit instead of storming all 14 Observers',()=>{
  assert.match(server,/function valReasoningCapacityError\(error\)/);
  assert.match(server,/valReasoningUnavailableUntil=Date\.now\(\)\+2\*60\*1000/);
  assert.match(server,/VAL reasoning providers are temporarily unavailable/);
});
