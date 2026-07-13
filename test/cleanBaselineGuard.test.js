const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');

function read(relativePath){
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

test('clean baseline preserves Project Managers, packets, Round Tables, and Chief of Staff', () => {
  const hearth = read('hearth-prototype.js');
  const projectManagers = read('docs/VAL_PROJECT_MANAGER_ROUND_TABLE_AND_PACKETS.md');
  const chiefOfStaff = read('docs/VAL_CHIEF_OF_STAFF_DECISION_MODEL.md');

  assert.match(hearth, /project_packet/);
  assert.match(hearth, /chief_of_staff_synthesis/);
  assert.match(projectManagers, /Dedicated Project Manager Rule/);
  assert.match(projectManagers, /Project Manager Round Table/);
  assert.match(chiefOfStaff, /Executive Round Table/);
  assert.match(chiefOfStaff, /Chief of Staff Synthesis/);
});

test('clean baseline preserves Witnessing and Teach VAL contracts', () => {
  const witnessing = read('docs/VAL_WITNESSING_CONSTITUTION.md');
  const fields = read('docs/VAL_WITNESSING_SESSION_FIELDS_AND_PROMPTS.md');
  const teachVal = read('docs/VAL_TEACH_VAL_PROMPTS.md');
  const server = read('server.js');

  assert.match(witnessing, /two prompt layers/i);
  assert.match(fields, /active_projects\[\]/);
  assert.match(fields, /project_outcomes\[\]/);
  assert.match(fields, /Project Dossiers/);
  assert.match(teachVal, /Teach VAL is the root context layer/i);
  assert.match(server, /\/api\/teach-val\/onboarding\/start/);
  assert.match(server, /\/api\/teach-val\/onboarding\/:id\/commit/);
});

test('clean baseline preserves all active lead scraper contracts', () => {
  const server = read('server.js');
  const gate = read('docs/VAL_PHASE_13C_SCRAPER_LAUNCH_REGRESSION_GATE.md');

  for(const route of [
    '/api/val/leads/discover-preview',
    '/api/val/leads/import-approved',
    '/api/val/partners/discover-preview',
    '/api/val/partners/import-approved',
    '/api/frisson/organizations/discover-preview',
    '/api/frisson/organizations/import-approved',
    '/api/frisson/partners/discover-preview',
    '/api/frisson/partners/import-approved'
  ]){
    assert.ok(server.includes(route), `Missing protected scraper route: ${route}`);
  }

  assert.match(server, /WESTWOOD_LEAD_PROFILE_ENABLED/);
  assert.match(gate, /Westwood \/ Limitless lead scrapers/);
  assert.match(gate, /GOALL employer scrapers/);
  assert.match(gate, /Frisson organization scrapers/);
  assert.match(gate, /Frisson partner scrapers/);
});
