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
  assert.match(server,/function graceSpecificBusinessLeadFromBody/);
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
  assert.match(server,/const GRACE_FIT_MAX_LEADS_PER_RUN = 10/);
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
  assert.match(server,/emailQuality:raw\.emailQuality\|\|classifyEmail\(raw\.email\)/);
  const gracePlan=server.slice(server.indexOf('function graceFitPlan'),server.indexOf('function graceSpecificBusinessLeadFromBody'));
  assert.match(gracePlan,/limit:Math\.min\(Math\.max\(Number\(body\.limit\)\|\|GRACE_FIT_MAX_LEADS_PER_RUN,1\),GRACE_FIT_MAX_LEADS_PER_RUN\)/);
  assert.match(server,/next\.emailQuality=isLikelyPersonEmail\(next\.email\)\?'person'/);
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
  assert.match(server,/const specificLead=graceSpecificBusinessLeadFromBody\(body\)/);
  assert.match(server,/prospectingMode:'grace_fit_engine_specific_business'/);
  assert.match(server,/specificBusinessMode:true/);
  assert.match(server,/source:'Grace Intelligence Fit Engine - Specific Business'/);
  assert.match(server,/decisionMakerName:String\(body\.decisionMakerName\|\|body\.primaryContact\|\|body\.contactName\|\|body\.fullName\|\|''\)\.trim\(\)/);
  assert.match(server,/decisionMakerTitle:String\(body\.decisionMakerTitle\|\|body\.title\|\|body\.contactTitle\|\|''\)\.trim\(\)/);
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
  assert.match(server,/function graceHumanOutboundCopy/);
  assert.match(server,/function graceNormalizeShowcaseLeadPacket/);
  assert.match(server,/function graceShowcaseLeadPacketReady/);
  assert.match(server,/graceShowcaseLeadPacketReady\(giftedPacket,\{requireEmail:true\}\)/);
  assert.match(server,/Hard requirement: the gifted lead should include at least one usable email address/);
  assert.match(server,/function enrichGraceShowcaseLeadPacket/);
  assert.match(server,/function researchGraceGiftedLeadPacketOnly/);
  assert.match(server,/function graceShowcaseOpportunities/);
  assert.match(server,/A lead packet Grace built for \$\{displayCompany\}/);
  assert.match(server,/I pointed Grace Intelligence at \$\{possessiveCompany\} market and had it build one complete lead packet/);
  assert.match(server,/This is not a lead list\. It is the beginning of a sales conversation with context already attached/);
  assert.match(server,/function gracePossessiveName/);
  assert.match(server,/I pointed Grace Intelligence at \$\{possessiveCompany\} market to see what it would find/);
  assert.match(server,/If you want, I can walk you through the actual companies and why Grace selected them/);
  assert.match(server,/https:\/\/graceintelligence\.com\/meet/);
  assert.match(server,/https:\/\/graceintelligence\.com/);
  assert.match(server,/Not another lead list/);
  assert.match(server,/different from an AI agent or a campaign automation/);
  assert.match(server,/First-touch rule: sell Grace Intelligence, not VAL/);
  assert.match(fitProfile,/aiSafeClaim/);
  assert.match(fitProfile,/aiCommercialTension/);
  assert.match(fitProfile,/qualification\.qualificationStatus!=='Qualified for Import'/);
  assert.match(fitProfile,/const hasPersonForOutbound=!!personName/);
  assert.match(fitProfile,/No prospect-facing copy generated because no decision maker was verified/);
  assert.match(fitProfile,/const humanCopy=hasPersonForOutbound/);
  assert.match(fitProfile,/const mirrorEmailSubject=humanCopy\.mirrorEmailSubject/);
  assert.match(fitProfile,/const mirrorEmail=humanCopy\.mirrorEmail/);
  assert.match(server,/const businessRows=evidenceLedger\.filter/);
  assert.match(server,/showcaseOpportunities:p\.showcaseOpportunities/);
  assert.match(server,/showcaseLeadPacket:body\.showcaseLeadPacket\|\|body\.giftedLeadPacket\|\|body\.showcase_lead_packet\|\|null/);
  assert.match(server,/stage:'gifted_lead_packet_for_prospect'/);
  assert.match(server,/next\.decisionMakerName && needsShowcaseLeadPacket/);
  assert.match(server,/researchGraceGiftedLeadPacketOnly\(next\)/);
  assert.match(server,/showcase_lead_packet/);
  assert.match(server,/showcaseLeadPacket:profile\.showcaseLeadPacket/);
  assert.match(server,/showcaseOpportunities:body\.showcaseOpportunities\|\|body\.opportunities\|\|body\.marketOpportunities\|\|\[\]/);
  assert.match(fitProfile,/graceDisplayCompanyName/);
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
  assert.doesNotMatch(fitProfile,/P\.S\./);
  assert.doesNotMatch(fitProfile,/buyer-state question/);
  assert.doesNotMatch(fitProfile,/The consequence is rarely dramatic at first/);
  assert.doesNotMatch(fitProfile,/prospect handling is equally state-specific/);
  assert.doesNotMatch(server.slice(server.indexOf('function graceHumanOutboundCopy'),server.indexOf('function graceFitProfile')),/part of VAL|VAL is built|VAL might/);
  assert.doesNotMatch(server.slice(server.indexOf('function graceHumanOutboundCopy'),server.indexOf('function graceFitProfile')),/I built a different kind of AI system called Grace Intelligence/);
  assert.ok(server.includes('a\\s+precise\\s+subject'));
  assert.ok(server.includes('connect|reference|mention|use|lead with|open with|frame|focus on|write|say|explain|describe'));
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
  assert.match(hearth,/key:'companyName',label:'Specific company name'/);
  assert.match(hearth,/key:'website',label:'Specific company website'/);
  assert.match(hearth,/key:'limit',label:'Preview count',type:'number',value:'10'/);
  assert.match(hearth,/Mirror email, 24-hour follow-up, 36-hour follow-up/);
});
