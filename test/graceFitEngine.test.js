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
  const importStart=server.indexOf('async function importApprovedGraceLeads');
  const importEnd=server.indexOf('async function graceCustomFieldStatus');
  assert.ok(importStart>0);
  assert.ok(importEnd>importStart);
  const graceImport=server.slice(importStart,importEnd);
  assert.match(graceImport,/const forceUpdateCustomFields=!!body\.forceUpdateCustomFields/);
  assert.match(graceImport,/forceUpdateCustomFields:forceUpdateCustomFields\|\|!!lead\.forceUpdateCustomFields/);
});

test('Grace Fit Engine gates live outreach by decision maker, dual fit, and $100K unlock',()=>{
  assert.match(server,/const GRACE_MINIMUM_PLAUSIBLE_ANNUAL_UNLOCK=100000/);
  assert.match(server,/const GRACE_DECISION_MAKER_TITLE_RE=/);
  assert.match(server,/function graceHasDecisionMaker/);
  assert.match(server,/function graceEvidenceLedger/);
  assert.match(server,/function graceQualificationProfile/);
  assert.match(server,/qualificationStatus=holdReasons\.length\?'Research Hold':'Qualified for Import'/);
  assert.match(server,/Below \$100K plausible annual unlock threshold/);
  assert.match(server,/Needs dual-fit evidence/);
  assert.match(server,/Missing verified decision maker/);
  assert.match(server,/Number\(!!b\.dualFit\)-Number\(!!a\.dualFit\)/);
  const upsertStart=server.indexOf('async function upsertGhlGraceLead');
  const upsertEnd=server.indexOf('async function importApprovedGraceLeads');
  const graceUpsert=server.slice(upsertStart,upsertEnd);
  assert.match(graceUpsert,/'GI Research Hold'/);
  assert.match(graceUpsert,/'Email Jessa - Research Hold'/);
  assert.match(graceUpsert,/'GI Dual Fit'/);
  assert.match(graceUpsert,/Evidence ledger:\\n/);
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
  assert.match(server,/VAL does for your leads what your best person would do/);
  assert.match(server,/review-before-contact/);
  const fitProfile=server.slice(server.indexOf('function graceFitProfile'),server.indexOf('function scoreGraceFitLead'));
  assert.match(fitProfile,/mirrorEmailSubject=`What VAL noticed about/);
  assert.match(fitProfile,/hidden profit in your current lead flow/);
  assert.match(fitProfile,/what your best person would do if they had time to read the room perfectly every time/);
  assert.match(fitProfile,/free data audit and show you where follow-up, routing, timing, or message mismatch/);
  assert.match(fitProfile,/const witnessPs=`P\.S\. What VAL found:/);
  assert.match(fitProfile,/on the person side/);
  assert.match(fitProfile,/On the business side, I am saying this because VAL saw/);
  assert.match(fitProfile,/used that read to choose the opening angle, tone, likely friction, audit path, and follow-up sequence/);
  assert.match(fitProfile,/shaped by what the system can actually see about the person and the business/);
  assert.match(fitProfile,/Evidence ledger:\\n/);
  assert.match(fitProfile,/mirrorEmail=\[[\s\S]*witnessPs[\s\S]*`Jessa`/);
  assert.match(fitProfile,/const follow24=\[[\s\S]*witnessPs[\s\S]*\]\.join/);
  assert.match(fitProfile,/const follow36=\[[\s\S]*witnessPs[\s\S]*\]\.join/);
  assert.match(fitProfile,/const follow5=\[[\s\S]*witnessPs[\s\S]*\]\.join/);
  assert.doesNotMatch(fitProfile,/fit needs review/);
  assert.doesNotMatch(fitProfile,/public surface/);
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
  assert.match(server,/const fields=graceAuditCustomFieldsFromIntake\(body\)/);
  assert.match(server,/gi_val_fit_score:String\(p\.valFitScore/);
  assert.match(server,/gi_val_fit_tier:p\.valFitTier/);
  assert.match(server,/gi_fit_confidence:p\.fitConfidence/);
  assert.match(server,/gi_audit_priority:p\.auditPriority/);
  const auditIntake=server.slice(server.indexOf('function graceAuditIntakeFromPayload'),server.indexOf('function graceAuditCustomFieldsFromIntake'));
  assert.match(auditIntake,/mirrorEmailSubject=`Free data audit for/);
  assert.doesNotMatch(auditIntake,/const mirrorEmail=\[[\s\S]{0,120}`Subject:/);
  assert.doesNotMatch(auditIntake,/followup24:`Subject:/);
  assert.doesNotMatch(auditIntake,/followup36:`Subject:/);
  assert.doesNotMatch(auditIntake,/followup5Day:`Subject:/);
  const auditUpsert=server.slice(server.indexOf('async function upsertGhlGraceAuditIntake'),server.indexOf('async function upsertGhlGraceLead'));
  assert.doesNotMatch(auditUpsert,/createGhlOpportunity/);
  assert.match(auditUpsert,/if\(customFields\.length\) updatePayload\.customFields=customFields/);
  assert.doesNotMatch(auditUpsert,/missingCustomFields/);
});

test('Hearth scraper UI includes Grace Fit Engine endpoints',()=>{
  assert.match(hearth,/scraperId: 'grace_fit_engine'/);
  assert.match(hearth,/\/api\/grace\/fit-engine\/discover-preview/);
  assert.match(hearth,/\/api\/grace\/fit-engine\/import-approved/);
  assert.match(hearth,/Mirror email, 24-hour follow-up, 36-hour follow-up/);
});
