const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {extractExecutiveInstructions}=require('../services/valExecutiveInstructions');

const root=path.join(__dirname,'..');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
const routes=fs.readFileSync(path.join(root,'services','valExecutiveInstructionsRoutes.js'),'utf8');

test('executive instruction extractor authorizes authenticated trusted voice commands',()=>{
  const result=extractExecutiveInstructions({
    text:'Jessa: VAL, send email to Aric about the partner workflow.',
    sourceType:'voice',
    sourceId:'voice_1',
    authenticatedUserNames:['Jessa'],
    trustedAuthenticatedUser:true
  });
  assert.equal(result.executive_instructions.length,1);
  const instruction=result.executive_instructions[0];
  assert.equal(instruction.instruction_type,'command');
  assert.equal(instruction.requested_action,'send_email');
  assert.equal(instruction.external_action,true);
  assert.equal(instruction.authorization,'voice_authorized');
  assert.equal(instruction.authenticated_user_spoke,true);
  assert.equal(instruction.recommended_next_step,'execute_later_packet');
  assert.equal(instruction.authorization_source,'voice');
});

test('executive instruction extractor does not authorize other speakers',()=>{
  const result=extractExecutiveInstructions({
    text:'Client: VAL, send me the proposal today.',
    sourceType:'transcript',
    sourceId:'tr_client',
    authenticatedUserNames:['Jessa']
  });
  const instruction=result.executive_instructions[0];
  assert.equal(instruction.authenticated_user_spoke,false);
  assert.equal(instruction.authorization,'approval_required');
  assert.notEqual(instruction.recommended_next_step,'execute_later_packet');
});

test('executive instruction extractor blocks never-auto commands',()=>{
  const result=extractExecutiveInstructions({
    text:'Jessa: VAL, charge the card for the full invoice.',
    sourceType:'voice',
    sourceId:'voice_charge',
    authenticatedUserNames:['Jessa'],
    trustedAuthenticatedUser:true
  });
  const instruction=result.executive_instructions[0];
  assert.equal(instruction.requested_action,'charge_money');
  assert.equal(instruction.authorization,'never_auto');
  assert.equal(instruction.recommended_next_step,'block');
  assert.ok(instruction.blocking_safety_rules.includes('never_auto_action'));
});

test('executive instruction extractor recognizes relationship introduction magic words',()=>{
  const result=extractExecutiveInstructions({
    text:'Jessa: VAL, make that introduction to Greg.',
    sourceType:'voice',
    sourceId:'voice_intro',
    authenticatedUserNames:['Jessa'],
    trustedAuthenticatedUser:true
  });
  const instruction=result.executive_instructions[0];
  assert.equal(instruction.requested_action,'make_introduction');
  assert.equal(instruction.target_system,'email');
  assert.equal(instruction.external_action,true);
  assert.equal(instruction.authorization,'voice_authorized');
  assert.equal(instruction.recommended_next_step,'execute_later_packet');
});

test('executive instruction extraction route is mounted without UI changes',()=>{
  assert.match(server,/registerValExecutiveInstructionRoutes/);
  assert.match(routes,/\/api\/val\/executive-instructions\/extract/);
});
