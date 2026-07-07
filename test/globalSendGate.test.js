const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const dashboard=fs.readFileSync(path.join(root,'dashboard.html'),'utf8');
const routes=fs.readFileSync(path.join(root,'services/valExternalActionsRoutes.js'),'utf8');
const service=fs.readFileSync(path.join(root,'services/valExternalActions.js'),'utf8');

test('global send gate is available from draft and inbox surfaces',()=>{
  assert.match(dashboard,/function openValSendGate\(payload,opts\)/);
  assert.match(dashboard,/function confirmValSendGate\(\)/);
  assert.match(dashboard,/\/api\/val\/external-actions\/email-send-now/);
  assert.match(dashboard,/openValSendGateFromDraft/);
  assert.match(dashboard,/openValSendGateFromEmailDraft/);
  assert.match(dashboard,/Save Provider Draft/);
  assert.match(dashboard,/Final Send Review/);
});

test('send gate uses external action packets and final confirmation',()=>{
  assert.match(service,/async function createEmailSendPacket\(payload=\{\}\)/);
  assert.match(service,/actionType:'send_email'/);
  assert.match(service,/requiresFreshApproval:true/);
  assert.match(routes,/\/api\/val\/external-actions\/email-send-packet/);
  assert.match(routes,/\/api\/val\/external-actions\/email-send-now/);
  assert.match(routes,/service\.approve\(packet\.id/);
  assert.match(routes,/executor\.execute\(approved\.id,\{finalConfirmation:true/);
});
