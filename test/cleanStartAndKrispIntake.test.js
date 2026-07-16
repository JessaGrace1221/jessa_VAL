const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

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
});
