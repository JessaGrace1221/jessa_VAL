'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
const cleanHtml=fs.readFileSync(path.join(root,'jessa-clean-dashboard.html'),'utf8');
const cleanJs=fs.readFileSync(path.join(root,'jessa-clean-dashboard.js'),'utf8');

test('Frisson exposes separate organization and partner scraper routes',()=>{
  assert.match(server,/\/api\/frisson\/organizations\/discover-preview/);
  assert.match(server,/\/api\/frisson\/organizations\/import-approved/);
  assert.match(server,/\/api\/frisson\/partners\/discover-preview/);
  assert.match(server,/\/api\/frisson\/partners\/import-approved/);
  assert.match(server,/\/api\/frisson\/custom-fields\/status/);
});

test('Frisson CRM targets use the recovered pipeline and stage names',()=>{
  assert.match(server,/FRISSON_ORGANIZATION_PIPELINE_NAME[\s\S]*Frisson Organizations/);
  assert.match(server,/FRISSON_ORGANIZATION_STAGE_NAME[\s\S]*New Organization Lead/);
  assert.match(server,/FRISSON_PARTNER_PIPELINE_NAME[\s\S]*Frisson Partners/);
  assert.match(server,/FRISSON_PARTNER_STAGE_NAME[\s\S]*New Partner Lead/);
});

test('Frisson imports apply separated workflow trigger tags',()=>{
  assert.match(server,/function frissonWorkflowTag/);
  assert.match(server,/return frissonMode\(mode\)==='partners'\?'partner':'organization'/);
  assert.match(server,/const requestTags=Array\.isArray\(p\.tags\)\?p\.tags:\[\]/);
  assert.match(server,/\['Frisson Lead',`Frisson \$\{frissonModeLabel\(currentMode\)\}`,workflowTag,frissonModeLabel\(currentMode\),\.\.\.convergenceTags,\.\.\.requestTags\]/);
});

test('Frisson has its own field contract instead of GOALL custom-field mapping',()=>{
  for(const key of [
    'legal_company_name','number_of_nonprofits_served','mission_statement_ai_summary',
    'cause_category','population_served','accepts_online_donations',
    'monthly_giving_program','recent_activity_last_90_days','ai_fit_summary',
    'scraper_type','scrape_date','review_needed'
  ]){
    assert.match(server,new RegExp(`${key}:`));
  }
  assert.match(server,/function frissonCustomFieldsFromProspect/);
  assert.match(server,/Frisson Lead Intelligence/);
});

test('Frisson partner scraper targets nonprofit-facing Convergence prospects only',()=>{
  for(const term of [
    'nonprofit CRM SaaS platforms',
    'grants management software companies',
    'philanthropy technology platforms',
    'nonprofit managed services providers'
  ]){
    assert.match(server,new RegExp(term));
  }
  assert.match(server,/function frissonPartnerConvergenceProfile/);
  assert.match(server,/convergenceFitScore/);
  assert.match(server,/estimatedAnnualItSpend/);
  assert.match(server,/likelySavingsCategory/);
  assert.match(server,/decisionMakerAccess/);
  assert.match(server,/cloudDependency/);
  assert.match(server,/dataRevenuePotential/);
  assert.match(server,/aiGovernanceNeed/);
  assert.match(server,/convergence-fit/);
  assert.match(server,/nonprofit-facing/);
  assert.match(server,/Why Scott should care/);
  assert.match(cleanHtml,/also look right for Convergence Solutions/);
});

test('clean Jessa dashboard calls the Frisson endpoints directly',()=>{
  assert.match(cleanHtml,/Frisson Organizations/);
  assert.match(cleanHtml,/Frisson Partners/);
  assert.match(cleanJs,/\/api\/frisson\/\$\{type\}\/discover-preview/);
  assert.match(cleanJs,/\/api\/frisson\/\$\{type\}\/import-approved/);
  assert.doesNotMatch(cleanJs,/\/api\/val\/leads\/discover-preview/);
  assert.doesNotMatch(cleanJs,/\/api\/val\/partners\/discover-preview/);
});
