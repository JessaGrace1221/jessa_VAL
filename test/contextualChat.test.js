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
  assert.match(server,/Oh\. I should have known that/);
  assert.match(server,/you are still the most important person on any list/);
  assert.match(server,/const intent=chatContextIntent\(lastUser\)/);
  assert.ok(server.indexOf('const correction=chatContextCorrection(lastUser)')<server.indexOf('const intent=chatContextIntent(lastUser)'));
});

test('contextual chat quick prompts are human-facing instead of form commands',()=>{
  assert.match(dashboard,/Tell me what I should understand, what I got wrong, or what you want moved forward/);
  assert.match(dashboard,/Remember the important context from this conversation/);
  assert.doesNotMatch(dashboard,/Update VAL memory with what should be remembered from this context/);
});

test('VAL has a shared conversational contract for user-facing chat and voice',()=>{
  assert.match(server,/Deep conversational standard for every user-facing voice or chat response/);
  assert.match(server,/Sound like a present, emotionally intelligent partner/);
  assert.match(server,/First show that you understood the human meaning/);
  assert.match(server,/If the user corrects you, respond relationally before operationally/);
  assert.match(server,/Avoid generic receipt language/);
});
