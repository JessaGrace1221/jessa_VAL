'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
const hearth=fs.readFileSync(path.join(root,'hearth-prototype.js'),'utf8');

test('Grace Fit Engine exposes review-first preview and import routes',()=>{
  assert.match(server,/\/api\/grace\/fit-engine\/discover-preview/);
  assert.match(server,/\/api\/grace\/fit-engine\/import-approved/);
  assert.match(server,/\/api\/grace\/fit-engine\/custom-fields\/status/);
  assert.match(server,/function discoverGraceFitLeads/);
  assert.match(server,/function importApprovedGraceLeads/);
});

test('Grace Fit Engine reuses lead discovery enrichment providers and does not create opportunities',()=>{
  assert.match(server,/discoverOutscraperProspects\(\{[\s\S]*leadProfile:'grace'/);
  assert.match(server,/enrichProspect\(lead,\{rocketReachMode:plan\.rocketReachMode/);
  assert.match(server,/approved Grace Fit Engine prospect/);
  assert.match(server,/Pipeline: handled by Grace Intelligence team/);
  const upsertStart=server.indexOf('async function upsertGhlGraceLead');
  const upsertEnd=server.indexOf('async function importApprovedGraceLeads');
  assert.ok(upsertStart>0);
  assert.ok(upsertEnd>upsertStart);
  const graceUpsert=server.slice(upsertStart,upsertEnd);
  assert.doesNotMatch(graceUpsert,/createGhlOpportunity/);
});

test('Grace Fit Engine generates witnessed outreach packet fields',()=>{
  for(const key of [
    'gi_witness_insight',
    'gi_prospect_packet',
    'gi_mirror_email',
    'gi_24_hour_followup',
    'gi_36_hour_followup',
    'gi_5_day_followup',
    'gi_internal_handoff_notes',
    'gi_approved_to_contact'
  ]){
    assert.match(server,new RegExp(`${key}:`));
  }
  assert.match(server,/Imagine if every lead coming through your forms/);
  assert.match(server,/review-before-contact/);
});

test('Hearth scraper UI includes Grace Fit Engine endpoints',()=>{
  assert.match(hearth,/scraperId: 'grace_fit_engine'/);
  assert.match(hearth,/\/api\/grace\/fit-engine\/discover-preview/);
  assert.match(hearth,/\/api\/grace\/fit-engine\/import-approved/);
  assert.match(hearth,/Mirror email, 24-hour follow-up, 36-hour follow-up/);
});
