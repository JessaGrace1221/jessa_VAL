const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
const dashboard=fs.readFileSync(path.join(root,'dashboard.html'),'utf8');

test('contextual chat recognizes corrections before save/update intents',()=>{
  assert.match(server,/function chatContextCorrection/);
  assert.match(server,/const correction=chatContextCorrection\(lastUser\)/);
  assert.match(server,/if\(correction\)\{/);
  assert.match(server,/I will not save anything from that message/);
  assert.match(server,/const intent=chatContextIntent\(lastUser\)/);
  assert.ok(server.indexOf('const correction=chatContextCorrection(lastUser)')<server.indexOf('const intent=chatContextIntent(lastUser)'));
});

test('contextual chat quick prompts are human-facing instead of form commands',()=>{
  assert.match(dashboard,/Tell me what is true, wrong, missing, or what you want done/);
  assert.match(dashboard,/Remember the important context from this conversation/);
  assert.doesNotMatch(dashboard,/Update VAL memory with what should be remembered from this context/);
});
