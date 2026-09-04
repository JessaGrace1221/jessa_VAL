'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');

test('Convergence assessment is a public Frisson intake endpoint',()=>{
  assert.match(server,/\/api\/frisson\/convergence-assessment/);
  assert.match(server,/app\.post\('\/api\/frisson\/convergence-assessment'/);
  assert.match(server,/convergenceAssessmentLeadFromBody\(req\.body\|\|\{\}\)/);
  assert.match(server,/Company and a valid work email are required/);
});

test('Convergence assessment updates GHL and Scott dashboard together',()=>{
  assert.match(server,/const scored=applyFrissonScoring\(lead,'partners'\)/);
  assert.match(server,/imported=await upsertGhlFrissonLead\(scored,'partners'\)/);
  assert.match(server,/const dashboardLead=await saveScottIntegrityDashboardLead\(scored,imported\)/);
  assert.match(server,/kind:'frisson_convergence_assessment_submission'/);
  assert.match(server,/scottDashboard:\{/);
  assert.match(server,/companyName:dashboardLead\.companyName/);
  assert.match(server,/contactId:dashboardLead\.contactId/);
});

test('Convergence form payload owns custom fields and automation tags',()=>{
  assert.match(server,/estimatedAnnualItSpend:annualSpend/);
  assert.match(server,/nonprofitFacing:nonprofitMarket/);
  assert.match(server,/missionPeopleHelpingSignal:nonprofitMarket==='Yes'\?'Yes':'Unknown'/);
  assert.match(server,/cloudDependency/);
  assert.match(server,/dataRevenuePotential/);
  assert.match(server,/aiGovernanceNeed/);
  assert.match(server,/forceUpdateCustomFields:true/);
  assert.match(server,/\.\.\.requestTags/);
  assert.match(server,/hidden-budget-assessment/);
  assert.match(server,/find-the-budget-form/);
});
