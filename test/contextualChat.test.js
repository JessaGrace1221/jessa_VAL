const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
const hearth=fs.readFileSync(path.join(root,'hearth-prototype.js'),'utf8');

test('Hearth Co-Work carries corrections forward in durable scoped conversations',()=>{
  assert.match(server,/This is a durable private conversation for one tenant and one user/);
  assert.match(server,/Carry forward prior corrections, decisions, and stated preferences/);
  assert.match(server,/If the user corrects you, respond relationally before operationally/);
  assert.match(server,/acknowledge what changed, then use the correction from then on/);
  assert.match(hearth,/conversationContract:\{saved:true,carriedForward:true,noExternalAction:true\}/);
});

test('Hearth Co-Work opens with conversational prompts instead of form commands',()=>{
  assert.match(hearth,/What would you like us to notice, pressure-test, or move forward\?/);
  assert.match(hearth,/What would you like to examine together\?/);
  assert.match(hearth,/Talk this through with your Chief of Staff/);
  assert.doesNotMatch(hearth,/Update VAL memory with what should be remembered from this context/);
});

test('VAL has a shared conversational contract for user-facing chat and voice',()=>{
  assert.match(server,/Deep conversational standard for every user-facing voice or chat response/);
  assert.match(server,/sound like a present, emotionally intelligent partner/);
  assert.match(server,/First show that you understood the human meaning/);
  assert.match(server,/If the user corrects you, respond relationally before operationally/);
  assert.match(server,/Avoid generic receipt language/);
});
