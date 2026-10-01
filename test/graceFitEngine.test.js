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
  assert.match(server,/\/api\/grace\/revenue-audit/);
  assert.match(server,/function discoverGraceFitLeads/);
  assert.match(server,/function importApprovedGraceLeads/);
  assert.match(server,/function upsertGhlGraceAuditIntake/);
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
    'gi_mirror_email_subject',
    'gi_mirror_email',
    'gi_24_hour_followup_subject',
    'gi_24_hour_followup',
    'gi_36_hour_followup_subject',
    'gi_36_hour_followup',
    'gi_5_day_followup_subject',
    'gi_5_day_followup',
    'gi_internal_handoff_notes',
    'gi_approved_to_contact'
  ]){
    assert.match(server,new RegExp(`${key}:`));
  }
  assert.match(server,/Imagine if every lead coming through your forms/);
  assert.match(server,/review-before-contact/);
  const fitProfile=server.slice(server.indexOf('function graceFitProfile'),server.indexOf('function scoreGraceFitLead'));
  assert.match(fitProfile,/mirrorEmailSubject=`What VAL noticed about/);
  assert.doesNotMatch(fitProfile,/const mirrorEmail=\[[\s\S]{0,120}`Subject:/);
  assert.doesNotMatch(fitProfile,/const follow24=\[[\s\S]{0,120}`Subject:/);
  assert.doesNotMatch(fitProfile,/const follow36=\[[\s\S]{0,120}`Subject:/);
  assert.doesNotMatch(fitProfile,/const follow5=\[[\s\S]{0,120}`Subject:/);
});

test('Grace website audit intake maps form payloads into GHL review fields',()=>{
  assert.match(server,/function graceAuditIntakeFromPayload/);
  assert.match(server,/function graceAuditCustomFieldsFromIntake/);
  assert.match(server,/lead_source_system:'Grace Intelligence Website Audit'/);
  assert.match(server,/website-audit-intake/);
  assert.match(server,/gi_review_status:'Needs audit review'/);
  assert.match(server,/gi_approved_to_contact:'No'/);
  assert.match(server,/Website audit intake requires team review before outreach/);
  assert.match(server,/Grace Intelligence free data audit intake/);
  const auditIntake=server.slice(server.indexOf('function graceAuditIntakeFromPayload'),server.indexOf('function graceAuditCustomFieldsFromIntake'));
  assert.match(auditIntake,/mirrorEmailSubject=`Free data audit for/);
  assert.doesNotMatch(auditIntake,/const mirrorEmail=\[[\s\S]{0,120}`Subject:/);
  assert.doesNotMatch(auditIntake,/followup24:`Subject:/);
  assert.doesNotMatch(auditIntake,/followup36:`Subject:/);
  assert.doesNotMatch(auditIntake,/followup5Day:`Subject:/);
  assert.doesNotMatch(server.slice(server.indexOf('async function upsertGhlGraceAuditIntake'),server.indexOf('async function upsertGhlGraceLead')),/createGhlOpportunity/);
});

test('Hearth scraper UI includes Grace Fit Engine endpoints',()=>{
  assert.match(hearth,/scraperId: 'grace_fit_engine'/);
  assert.match(hearth,/\/api\/grace\/fit-engine\/discover-preview/);
  assert.match(hearth,/\/api\/grace\/fit-engine\/import-approved/);
  assert.match(hearth,/Mirror email, 24-hour follow-up, 36-hour follow-up/);
});
