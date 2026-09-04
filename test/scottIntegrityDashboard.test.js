'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
const html=fs.readFileSync(path.join(root,'scott-integrity-dashboard.html'),'utf8');
const js=fs.readFileSync(path.join(root,'scott-integrity-dashboard.js'),'utf8');
const css=fs.readFileSync(path.join(root,'scott-integrity-dashboard.css'),'utf8');

test('Scott Integrity Dashboard is a standalone surface',()=>{
  assert.match(server,/\/scott-integrity-dashboard/);
  assert.match(server,/\/api\/frisson\/scott-integrity-dashboard/);
  assert.match(html,/Scott Travis Integrity Dashboard/);
  assert.match(html,/scott-integrity-dashboard\.css/);
  assert.match(html,/scott-integrity-dashboard\.js/);
  assert.doesNotMatch(html,/hearth-prototype/);
  assert.doesNotMatch(html,/jessa-clean-dashboard/);
  assert.match(css,/integrity-shell/);
});

test('Scott dashboard includes relationship transcript and positioning model',()=>{
  assert.match(server,/SCOTT_INTEGRITY_TRANSCRIPT_PATH/);
  assert.match(server,/scottIntegrityDashboardTranscript/);
  assert.match(server,/scottIntegrityDashboardPositioning/);
  assert.match(server,/Grace Intelligence positions Convergence/);
  assert.match(server,/Frisson Consulting should route nonprofit-facing/);
  assert.match(js,/data-transcript-text/);
  assert.match(js,/data-positioning="graceIntelligence"/);
});

test('Frisson Partner imports add scored leads to Scott dashboard',()=>{
  assert.match(server,/async function saveScottIntegrityDashboardLead/);
  assert.match(server,/kind:'scott_integrity_dashboard_lead'/);
  assert.match(server,/saveScottIntegrityDashboardLead\(lead,imported\)/);
  assert.match(server,/Scott Integrity Dashboard: \$\{scottDashboardLeads\.length\} lead/);
  assert.match(server,/scottDashboard:\{added:scottDashboardLeads\.length,leads:scottDashboardLeads\}/);
  assert.match(server,/customFields:frissonCustomFieldsFromProspect\(p,'partners'\)/);
});
