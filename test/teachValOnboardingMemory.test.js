'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const server=fs.readFileSync(path.join(__dirname,'..','server.js'),'utf8');
const dashboard=fs.readFileSync(path.join(__dirname,'..','dashboard.html'),'utf8');

test('Teach VAL commit promotes onboarding into core memory and evidence',()=>{
  assert.match(server,/async function promoteTeachValOnboardingToCoreMemory/);
  assert.match(server,/await saveMemoryItem\(\{/);
  assert.match(server,/kind:`teach_val_/);
  assert.match(server,/sourceType:'teach_val_onboarding'/);
  assert.match(server,/await saveEvidenceItem\(\{/);
  assert.match(server,/runObservationEngine\(evidence,\{candidates:teachValEvidenceCandidates\(included\),replace:true\}\)/);
  assert.match(server,/promotion=await promoteTeachValOnboardingToCoreMemory\(\{session,imports,items:included,payload\}\)/);
  assert.match(server,/res\.json\(\{ok:true,payload,webhook,promotion,memory/);
});

test('Teach VAL onboarding categories map into universal observation types',()=>{
  for(const type of ['relationship_signal','risk','preference','opportunity','need','idea']){
    assert.match(server,new RegExp(`'${type}'`));
  }
  assert.match(server,/function teachValObservationType/);
  assert.match(server,/function teachValEvidenceCandidates/);
  assert.match(server,/function teachValMemoryImportance/);
});

test('Teach VAL uses ChatGPT context prompts without the voice onboarding step',()=>{
  assert.match(server,/function teachValPublicCard/);
  assert.match(server,/function teachValPublicImport/);
  assert.match(server,/cards:TEACH_VAL_KNOWLEDGE_CARDS\.map\(teachValPublicCard\)/);
  assert.match(server,/stage:'current_projects'/);
  assert.match(server,/prompt:card\.prompt/);
  assert.doesNotMatch(server,/state\.stage=state\.stage==='welcome'\?'voice_interview'/);
  assert.doesNotMatch(server,/external_ai_imports:imports\.map\(i=>\(\{category:i\.category,prompt_used/);
  assert.match(dashboard,/ChatGPT Context Transfer/);
  assert.match(dashboard,/Copy Prompt/);
  assert.match(dashboard,/teachValPromptCopyStatus/);
  assert.match(dashboard,/Copied\. Paste it into ChatGPT or Claude\./);
  assert.match(dashboard,/Prompt copied\./);
  assert.match(dashboard,/Paste Response/);
  assert.match(dashboard,/teach-val-prompt-icon/);
  assert.match(dashboard,/teach-val-prompt-label/);
  assert.match(dashboard,/teach-val-prompt-btn\.active\{background:linear-gradient\(135deg,#5b21d6,#6d28d9\)!important/);
  assert.match(dashboard,/html body \.exec-workspace-modal \.teach-val-stage \.teach-val-prompt-btn\.active/);
  assert.match(dashboard,/teach-val-copy-status/);
  assert.match(dashboard,/teach-val-status-pill/);
  assert.match(dashboard,/footer:'<button class="alert-btn" onclick="closeExecutiveWorkspace/);
  assert.doesNotMatch(dashboard,/Start Voice Interview/);
  assert.doesNotMatch(dashboard,/teachValVoiceStageHtml/);
  assert.doesNotMatch(dashboard,/teach-val-voice-active/);
});

test('Jessa VAL routes GHL chat actions into editable approval packets',()=>{
  assert.match(server,/app\.post\('\/api\/val\/os\/external-action-packets\/:id\/update'/);
  assert.match(server,/app\.post\('\/api\/val\/os\/external-action-packets\/:id\/approve'/);
  assert.match(server,/function buildGhlExternalActionPacket/);
  assert.match(server,/function deterministicGhlActionFromText/);
  assert.match(server,/deterministicGhlActionFromText\(lastUser\)\|\|await inferGhlActionFromChat\(lastUser\)/);
  assert.match(server,/function updateValOsExternalActionPacket/);
  assert.match(server,/function approveValOsExternalActionPacket/);
  assert.match(server,/not\\s\+in\\s\+ghl/);
  assert.match(server,/Adding a contact note by name requires exactly one GHL contact match/);
  assert.match(server,/externalActionPacket/);
  assert.match(server,/I prepared the GHL action and need one approval/);
  assert.match(server,/external_action_packet_updated/);
  assert.match(server,/external_action_packet_executed/);
  assert.match(dashboard,/function renderExternalActionPacket/);
  assert.match(dashboard,/renderExternalActionPacket\(d\.externalActionPacket,'gchatMessages'\)/);
  assert.match(dashboard,/function renderExternalActionPacket\(packet,containerId\)/);
  assert.match(dashboard,/function saveExternalActionPacketTweaks/);
  assert.match(dashboard,/External Action Approval/);
  assert.match(dashboard,/One approval required/);
  assert.match(dashboard,/Review and tweak details before approving/);
  assert.match(dashboard,/Save Tweaks/);
  assert.match(dashboard,/Approve & Do It/);
  assert.match(dashboard,/External Action Receipt/);
});
