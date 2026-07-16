const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const server = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
const contract = fs.readFileSync(path.join(root, 'docs/VAL_CLEAN_START_AND_SOURCE_INTAKE_CONTRACT.md'), 'utf8');

test('clean start removes VAL content without revoking source connections', () => {
  assert.match(server, /async function resetValLocalContentForCleanStart/);
  assert.match(server, /START FRESH WITH VAL/);
  assert.match(server, /connectionsPreserved:true/);
  assert.match(server, /externalSystemsUntouched:true/);
  assert.match(server, /setCleanStartSourceIntakeLocked\(true\)/);
  assert.match(server, /VAL is waiting for the new Witnessing Session to reach First Look/);
  assert.match(server, /teach_val_onboarding_sessions/);
  assert.match(server, /val_first_look_runs/);
  assert.match(server, /relationship_profiles/);
  assert.match(server, /evidence_items/);
  assert.match(server, /val_transcripts/);
  assert.match(server, /email_messages/);
  assert.match(server, /external_research_results/);
  assert.match(server, /source_processing_records/);
  assert.match(server, /round_table_runs/);
  assert.match(server, /chief_of_staff_recommendations/);
  assert.match(server, /val_cowork_sessions/);
  assert.match(server, /val_external_action_packets/);
  assert.match(server, /project_pins/);
  assert.match(server, /\/api\/val\/clean-start/);
  assert.doesNotMatch(server, /async function restoreJessaRealWitnessingSessionBackup/);
});

test('clean start blocks every normal source-repopulation path until First Look', () => {
  assert.match(server, /Email intake begins at First Look after Witnessing/);
  assert.match(server, /Relationship source intake begins at First Look after Witnessing/);
  assert.match(server, /Person packets will be prepared from your new First Look/);
  assert.match(server, /Transcript intake begins after First Look/);
  assert.match(server, /setCleanStartSourceIntakeLocked\(false\)/);
});

test('clean start contract preserves the protected VAL architecture', () => {
  assert.match(contract, /external source permissions/i);
  assert.match(contract, /Witnessing prompts, Teach VAL prompts, Round Tables, packets, Chief of Staff, and lead-scraper contracts/i);
  assert.match(contract, /must not make every Round Table reread every raw source/i);
});

test('Krisp thirty-day intake keeps Krisp source truth exact and reports coverage', () => {
  assert.match(server, /async function syncKrispTranscriptsForLastThirtyDays/);
  assert.match(server, /krispThirtyDayWindow\(days=30\)/);
  assert.match(server, /sourceTruth:'exact_krisp_receipt'/);
  assert.match(server, /preservedExactly:true/);
  assert.match(server, /packetEligibility:\['transcripts','stewardship','project_managers','chief_of_staff'\]/);
  assert.match(server, /receiptLimitReached/);
  assert.match(server, /\/api\/val\/krisp\/sync/);
  assert.match(server, /firstLookPacketCoverage/);
  assert.match(server, /syncKrispTranscriptsForLastThirtyDays\(\{days:30,onProgress\}\)/);
  assert.match(server, /krispThirtyDayWindow\(30\)/);
  assert.match(server, /This is the last 30 days of Krisp material/);
});

test('First Look treats every Witnessing answer as source evidence and blocks a partial proposed map', () => {
  assert.match(server, /function firstLookWitnessingCoverage/);
  assert.match(server, /function firstLookWitnessingRoutingRules/);
  assert.match(server, /function firstLookRoutingRuleCoverage/);
  assert.match(server, /VAL did not account for every Witnessing answer/);
  assert.match(server, /VAL did not account for every explicit First Look routing instruction/);
  assert.match(server, /VAL did not prepare review packets for every relationship or project you explicitly named/);
  assert.match(server, /routing_rule_coverage/);
  assert.match(server, /analysis\.witnessingCoverage=firstLookWitnessingCoverage/);
  assert.match(server, /analysis\.routingRuleCoverage=firstLookRoutingRuleCoverage/);
  assert.match(server, /answersAccountedFor/);
  assert.match(server, /relationship_names/);
  assert.match(server, /async function listTeachValWitnessingSourceMemory/);
  assert.match(server, /const witnessAnswers=await listTeachValWitnessingSourceMemory/);
  assert.match(contract, /Witnessing Completeness Gate/);
  assert.match(contract, /must never silently omit a user-named relationship or project/i);
});

test('First Look preserves explicit project, relationship, and protected-context routing instructions from Witnessing', () => {
  const helper = server.match(/function firstLookWitnessingRoutingRules[\s\S]*?(?=function firstLookPacketCoverage)/)?.[0] || '';
  assert.ok(helper, 'First Look routing extraction should be available for regression coverage.');
  const context = {stableKey:value => String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')};
  vm.runInNewContext(`${helper}\nresult={firstLookWitnessingRoutingRules};`, context);
  const instructions = [
    'Any emails that have @goallagency.com or @goallprogram.com are part of the GOALL project',
    'Michele Julian has multiple email addresses and is one of my most important people',
    "Anything from a school district is about my children and should be added to a 'School' project",
    'Anything from @westwoodintl.com and @hellohopemakers.com are also their own projects',
    'Anything about non-profits is most certainly a Frisson Consulting project',
    'Aric Soyring is a very important contact and has multiple emails',
    "Anything in my Google Docs relating to Heartfelt Ai, Grace Intelligence, Bespoke Ai or VAL belongs in a project called 'Goddess of Everything'",
    'Anything with the names Ellington, Langston, Winston, or Hargrove are related to my children',
    "Anything from my lawyer Valen goes in a project called 'Court'"
  ].join('\n');
  const rules = context.result.firstLookWitnessingRoutingRules([{id:'connect-1', text:instructions}]);
  assert.equal(rules.length, 9);
  assert.ok(rules.every(rule => rule.sourceSignalId === 'witness:connect-1'));
  assert.match(rules.map(rule => rule.instruction).join('\n'), /GOALL project/);
  assert.match(rules.map(rule => rule.instruction).join('\n'), /Michele Julian/);
  assert.match(rules.map(rule => rule.instruction).join('\n'), /Goddess of Everything/);
  assert.match(rules.map(rule => rule.instruction).join('\n'), /Court/);
});
