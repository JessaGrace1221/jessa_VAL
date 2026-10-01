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
  assert.match(server,/const GRACE_SURFACE_FIT_MIN_SCORE=Number\(process\.env\.GRACE_SURFACE_FIT_MIN_SCORE\)\|\|68/);
  assert.match(server,/function graceSurfaceFitGate/);
  assert.match(server,/const GRACE_DECISION_MAKER_TITLE_RE=/);
  assert.match(server,/function graceHasDecisionMaker/);
  assert.match(server,/function graceEvidenceLedger/);
  assert.match(server,/function graceQualificationProfile/);
  assert.match(server,/qualificationStatus=holdReasons\.length\?'Research Hold':'Qualified for Import'/);
  assert.match(server,/Below \$100K plausible annual unlock threshold/);
  assert.match(server,/Needs dual-fit evidence/);
  assert.match(server,/Missing verified decision maker/);
  assert.match(server,/Missing decision-maker email address/);
  assert.match(server,/Only generic email found; missing decision-maker email/);
  assert.match(server,/hasDecisionMakerEmail/);
  assert.match(server,/contactReadiness/);
  assert.match(server,/Number\(!!b\.dualFit\)-Number\(!!a\.dualFit\)/);
  assert.match(server,/Number\(!!b\.hasDecisionMakerEmail\)-Number\(!!a\.hasDecisionMakerEmail\)/);
  assert.match(server,/surfaceGateSummary/);
  assert.match(server,/surfaceGateRejected/);
  assert.match(server,/surfaceFitScore/);
  assert.match(server,/surfaceFitPassed/);
  assert.match(server,/surfaceGateMustHaveMisses/);
  assert.match(server,/initialFitTier/);
  assert.match(server,/initialGateWhyPassed/);
  assert.match(server,/initialGateWhyCouldBeWrong/);
  assert.match(server,/mustHaveMisses\.length===0/);
  assert.match(server,/plan\.surfaceGate \? screened\.filter/);
  assert.match(server,/plan\.limit\*\(plan\.surfaceGate\?10:1\.5\)/);
  const upsertStart=server.indexOf('async function upsertGhlGraceLead');
  const upsertEnd=server.indexOf('async function importApprovedGraceLeads');
  const graceUpsert=server.slice(upsertStart,upsertEnd);
  assert.match(graceUpsert,/'GI Research Hold'/);
  assert.match(graceUpsert,/'Email Jessa - Research Hold'/);
  assert.match(graceUpsert,/'GI Dual Fit'/);
  assert.match(graceUpsert,/Evidence ledger:\\n/);
});

test('Grace Fit Engine accepts Apollo key alias used in Railway variables',()=>{
  assert.match(server,/const APOLLO_API_KEY = process\.env\.APOLLO_API_KEY \|\| process\.env\.APPOLLO_API_KEY \|\| process\.env\.APPOLO_API_KEY/);
});

test('Grace Fit Engine uses Gemini-style decision-maker research before outreach',()=>{
  assert.match(server,/const GEMINI_API_KEY = process\.env\.GEMINI_API_KEY \|\| process\.env\.GOOGLE_AI_API_KEY \|\| process\.env\.GOOGLE_GENAI_API_KEY/);
  assert.match(server,/function geminiInteractionSourceUrls/);
  assert.match(server,/async function callGeminiGroundedSearch/);
  assert.match(server,/async function researchGraceWithGeminiStages/);
  assert.match(server,/identity_and_decision_maker/);
  assert.match(server,/commercial_theory_and_evidence/);
  assert.match(server,/prospect_theory_and_outreach_strategy/);
  assert.match(server,/async function researchGraceDecisionMakerWithAi/);
  assert.match(server,/function graceAiDecisionConfidence/);
  assert.match(server,/\(medium\|moderate\|likely\|probable\)/);
  assert.match(server,/You are VAL’s Grace Intelligence Research Layer/);
  assert.match(server,/Commercial theories/);
  assert.match(server,/safe claim Grace can make/);
  assert.match(server,/async function enrichProspectWithGraceAiResearch/);
  assert.match(server,/next=await enrichProspectWithGraceAiResearch/);
  assert.match(server,/Apollo AI decision-maker verification/);
  assert.match(server,/shouldVerifyAiPerson/);
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
  assert.match(server,/review-before-contact/);
  const fitProfile=server.slice(server.indexOf('function graceFitProfile'),server.indexOf('function scoreGraceFitLead'));
  assert.match(server,/function graceProspectTheory/);
  assert.match(server,/function graceProspectTheoryText/);
  assert.match(fitProfile,/const prospectTheory=graceAiResearchProspectTheory/);
  assert.match(fitProfile,/Prospect theory:\\n/);
  assert.match(fitProfile,/A buyer-state question for/);
  assert.match(fitProfile,/That is what I would want to test at/);
  assert.match(fitProfile,/The first question would be simple/);
  assert.match(fitProfile,/aiSafeClaim/);
  assert.match(fitProfile,/aiCommercialTension/);
  assert.match(fitProfile,/qualification\.qualificationStatus!=='Qualified for Import'/);
  assert.match(fitProfile,/const hasPersonForOutbound=!!personName/);
  assert.match(fitProfile,/No prospect-facing copy generated because no decision maker was verified/);
  assert.match(fitProfile,/const mirrorEmailSubject=hasPersonForOutbound\?/);
  assert.match(fitProfile,/const mirrorEmail=hasPersonForOutbound\?/);
  assert.match(fitProfile,/The consequence is rarely dramatic at first/);
  assert.match(fitProfile,/graceDisplayCompanyName/);
  assert.match(fitProfile,/The audit is useful because it can prove the theory wrong quickly/);
  assert.match(fitProfile,/may not need another lead source as much as it needs a clearer conversion layer/);
  assert.match(fitProfile,/Evidence ledger:\\n/);
  assert.match(fitProfile,/Counterargument:/);
  assert.doesNotMatch(fitProfile,/const witnessPs=/);
  assert.doesNotMatch(fitProfile,/I am not guessing from a list/);
  assert.doesNotMatch(fitProfile,/P\.S\. What VAL found:/);
  assert.doesNotMatch(fitProfile,/On the business side, I am saying this because VAL saw/);
  assert.doesNotMatch(fitProfile,/used that read to choose the opening angle, tone, likely friction, audit path, and follow-up sequence/);
  assert.doesNotMatch(fitProfile,/shaped by what the system can actually see about the person and the business/);
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
