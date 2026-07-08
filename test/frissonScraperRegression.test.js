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
  assert.match(server,/\['Frisson Lead',`Frisson \$\{frissonModeLabel\(currentMode\)\}`,workflowTag,frissonModeLabel\(currentMode\)\]/);
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

test('clean Jessa dashboard calls the Frisson endpoints directly',()=>{
  assert.match(cleanHtml,/Frisson Organizations/);
  assert.match(cleanHtml,/Frisson Partners/);
  assert.match(cleanJs,/\/api\/frisson\/\$\{type\}\/discover-preview/);
  assert.match(cleanJs,/\/api\/frisson\/\$\{type\}\/import-approved/);
  assert.doesNotMatch(cleanJs,/\/api\/val\/leads\/discover-preview/);
  assert.doesNotMatch(cleanJs,/\/api\/val\/partners\/discover-preview/);
});
