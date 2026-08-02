'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const server = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
const dashboard = fs.readFileSync(path.join(root, 'dashboard.html'), 'utf8');

test('production lead limits and dashboard defaults allow 200', () => {
  assert.match(server, /GOALL_LEAD_SEARCH_MAX[^\n]+\|\| 200;/);
  assert.match(server, /GOALL_LEAD_PER_SEARCH_MAX[^\n]+\|\|200/);
  assert.match(dashboard, /limit:200,/);
  assert.match(dashboard, /up to 200/);
});

test('early CRM dedup delegates to the final import matcher', () => {
  const start = server.indexOf('async function checkCrmDuplicate');
  const end = server.indexOf('\nasync function discoverGoallProspectsWithOutscraper', start);
  const body = server.slice(start, end);
  assert.match(body, /findExistingGhlLeadDuplicate\(lead(?:,\{maxQueries:1\})?\)/);
  assert.doesNotMatch(server, /function normalizedPhoneDigits/);
});

test('preview reports CRM filtering and Outscraper recognizes Failure', () => {
  assert.match(server, /Already in GHL CRM and filtered before enrichment/);
  assert.match(server, /status==='failure'/);
});

test('final CRM writer revalidates names and contact fields', () => {
  const start = server.indexOf('async function createGhlLeadFromProspect');
  const end = server.indexOf('\nfunction isGoallTestContactRequest', start);
  const body = server.slice(start, end);
  assert.match(body, /sanitizeDecisionMaker/);
  assert.match(body, /normalizeEmailAddress/);
  assert.match(body, /normalizePhoneNumber/);
  assert.match(body, /firstName='Unverified'/);
  assert.doesNotMatch(body, /unknown unknown/);
  assert.ok(body.indexOf('sanitizeDecisionMaker') < body.indexOf("ghlStrict('POST','/contacts'"));
});

test('GOALL GHL imports prefer Railway credentials and write decision-maker fields', () => {
  const resolverStart = server.indexOf('async function resolveIntegrationSecret');
  const resolverEnd = server.indexOf('\nasync function resolveOpenAIKey', resolverStart);
  const resolverBody = server.slice(resolverStart, resolverEnd);
  assert.match(resolverBody, /toLowerCase\(\)==='ghl' && fallback/);
  assert.ok(resolverBody.indexOf("toLowerCase()==='ghl'") < resolverBody.indexOf("getIntegrationCredential(provider,credentialType)"));
  assert.match(server, /decision_maker_first_name:\s*process\.env\.GHL_FIELD_DECISION_MAKER_FIRST_NAME/);
  assert.match(server, /decision_maker_last_name:\s*process\.env\.GHL_FIELD_DECISION_MAKER_LAST_NAME/);
  assert.match(server, /decision_maker_name:\s*process\.env\.GHL_FIELD_DECISION_MAKER_NAME/);
  assert.match(server, /decision maker s first name/);
  assert.match(server, /decision makers last name/);
  assert.match(server, /decisionMakerFirstName=.*'Unverified'/);
  assert.match(server, /'contact\.decision_maker_first_name'/);
  assert.match(server, /'contact\.decision_maker_last_name'/);
  assert.match(server, /decision_maker_name:decisionMakerName\|\|'Unverified'/);
});

test('GOALL Gemini decision-maker research falls back from owner to executive leadership', () => {
  const start = server.indexOf('async function researchGoallDecisionMakerWithGemini');
  const end = server.indexOf('\nasync function enrichProspectWithGoallGeminiDecisionMaker', start);
  const body = server.slice(start, end);
  assert.match(body, /Act as an expert B2B sales researcher/);
  assert.match(body, /Growth Only Automated Life & Legacy/);
  assert.match(body, /Leadership fallback query:/);
  assert.match(body, /CEO president executive leadership founder/);
  assert.match(body, /Executive fallback question:/);
  assert.match(body, /Decision-maker search ladder: first owner\/co-owner; then founder; then president\/CEO\/managing member/);
  assert.match(body, /Employee-owned, ESOP, trust-owned/);
  assert.match(body, /Do not set Unverified solely because ownership is diffuse, employee-owned, or held by an ESOP\/trust/);
});

test('GOALL Gemini asks for the exact scraper JSON report contract', () => {
  const start = server.indexOf('async function researchGoallDecisionMakerWithGemini');
  const end = server.indexOf('\nasync function enrichProspectWithGoallGeminiDecisionMaker', start);
  const body = server.slice(start, end);
  assert.match(body, /Return JSON with this exact shape/);
  assert.match(body, /primaryDecisionMaker/);
  assert.match(body, /secondaryDecisionMakers/);
  assert.match(body, /regionalDecisionMakers/);
  assert.match(body, /bestContactMethod/);
  assert.match(body, /businessSizeContext/);
  assert.match(body, /companyStructure/);
  assert.match(body, /customizedValueProps/);
  assert.match(body, /hiringAndTurnover/);
  assert.match(body, /businessNeedsAndPainPoints/);
  assert.match(body, /callerSnapshot/);
  assert.match(body, /callOpener/);
  assert.match(body, /emailAngle/);
  assert.match(body, /phoneType must be one of: direct_decision_maker, main_office, likely_gatekeeper, unknown/);
  assert.match(body, /emailType must be one of: decision_maker, general_inbox, unknown/);
});

test('GOALL defaults to mixed rotating industry batches', () => {
  const start = dashboard.indexOf('function defaultGoallLeadScrapePayload');
  const end = dashboard.indexOf('\nfunction nextGoallLeadBatchPayload', start);
  const body = dashboard.slice(start, end);
  assert.match(body, /organizationType:'GOALL priority industries'/);
  assert.match(body, /searchMode:'all'/);
  assert.match(body, /fastSearch:false/);
  assert.doesNotMatch(body, /GOALL_LEAD_BATCH_SEQUENCE/);
  assert.match(server, /GOALL_LEAD_INDUSTRIES_PER_RUN/);
  assert.match(server, /batchIndex\*GOALL_LEAD_INDUSTRIES_PER_RUN/);
});

test('Mark GOALL uses the exact Limitless stage and caches GHL metadata', () => {
  assert.match(server, /da4a643b-ef5c-49b8-8e07-ed739e76e3ca/);
  assert.match(server, /New Limitless Lead Added/);
  assert.match(server, /opportunityTargetCache/);
  assert.match(server, /leadFieldIdPromise/);
  const writerStart = server.indexOf('async function createGhlLeadFromProspect');
  const writerEnd = server.indexOf('\nfunction isGoallTestContactRequest', writerStart);
  assert.doesNotMatch(server.slice(writerStart, writerEnd), /assertGoallLeadScoreField/);
});

test('large mixed batches stay inside the request deadline', () => {
  assert.match(server, /GOALL_LEAD_MIXED_JOB_CONCURRENCY[^\n]+\|\|20/);
  assert.match(server, /plan\.allPriority\?GOALL_LEAD_MIXED_JOB_CONCURRENCY/);
  assert.match(server, /findExistingGhlLeadDuplicate\(lead,\{maxQueries:1\}\)/);
  assert.match(server, /const broadPreview=requested>=100/);
  assert.match(server, /broadGoallPersonLookup=broadPreview && plan\.leadProfile==='goall'/);
  assert.match(server, /enrichmentConcurrency=broadGoallPersonLookup\?20/);
  assert.match(server, /broadGoallPersonLookup[\s\S]{0,120}enrichProspectWithApollo\(prospect\)/);
  assert.match(server, /applyLeadScoring\(sanitizeDecisionMaker/);
});

test('staged GOALL runs target addable new GHL leads, not raw preview rows', () => {
  const start = server.indexOf('async function runGoallStagedLeadPipeline');
  const end = server.indexOf('\nasync function enrichGoallStagedProspect', start);
  const body = server.slice(start, end);
  assert.match(body, /GOALL_STAGED_RAW_TARGET_MULTIPLIER/);
  assert.match(body, /rawTarget/);
  assert.match(body, /checkCrmDuplicate\(next\)/);
  assert.match(body, /already_in_crm/);
  assert.match(body, /goallStagedLeadHoldReason/);
  assert.match(body, /addableCount/);
  assert.match(body, /target GHL additions/);
});

test('GOALL CSV uploads enter the same staged enrichment and GHL import path', () => {
  assert.match(server, /app\.post\('\/api\/val\/leads\/upload-csv-staged-runs',upload\.single\('file'\)/);
  assert.match(server, /function parseGoallLeadCsv/);
  assert.match(server, /function goallCsvLeadFromRow/);
  assert.match(server, /function createGoallCsvStagedLeadRun/);
  assert.match(server, /async function runGoallCsvStagedLeadPipeline/);
  assert.match(server, /await runGoallStagedResearchAndReview\(run,run\.rawLeads/);
  assert.match(server, /sourceType:'csv_upload'/);
});

test('GOALL CSV source tags are applied alongside automation tags in GHL', () => {
  assert.match(server, /function goallAdditionalImportTags/);
  assert.match(server, /source tag','import tag','list tag','campaign tag/);
  assert.match(server, /importTag:String\(sourceTag\|\|''\)\.trim\(\)/);
  assert.match(server, /goallAdditionalImportTags\(p,opts\)/);
  assert.match(server, /importTag:String\(body\.importTag\|\|body\.sourceTag\|\|body\.csvSourceTag\|\|''\)\.trim\(\)/);
});

test('staged GOALL board exposes aligned step rows for every discovered business', () => {
  assert.match(server, /function buildGoallStageRows/);
  assert.match(server, /business,\s*\n\s*decision:decision\?\.lead\|\|null/);
  assert.match(server, /review:review\?\.lead\|\|null/);
  assert.match(server, /step2Status/);
  assert.match(server, /step3Status/);
});

test('GOALL runs Apollo and RocketReach when Gemini finds a person without email or phone', () => {
  const stagedStart = server.indexOf('async function enrichGoallStagedProspect');
  const stagedEnd = server.indexOf('\nasync function fetchTextWithTimeout', stagedStart);
  const stagedBody = server.slice(stagedStart, stagedEnd);
  assert.match(stagedBody, /hasDecisionMakerEmail/);
  assert.match(stagedBody, /hasDecisionMakerPhone/);
  assert.match(stagedBody, /enrichProspectWithApollo\(next\)/);
  assert.match(stagedBody, /enrichProspectWithRocketReach\(next,\{maxTitleLookups:1\}\)/);
  assert.doesNotMatch(stagedBody, /linkedinPersonalUrl\)\{\s*\n\s*next\.apolloStatus=.*contact path/);

  const apolloStart = server.indexOf('function normalizeApolloPerson');
  const apolloEnd = server.indexOf('\nasync function lookupOutscraperLinkedIn', apolloStart);
  const apolloBody = server.slice(apolloStart, apolloEnd);
  assert.match(apolloBody, /email:personEmail/);
  assert.match(apolloBody, /phone:normalizePhoneNumber\(rawPhone\)/);
  assert.doesNotMatch(apolloBody, /if\(p\.decisionMakerName \|\| p\.linkedinPersonalUrl\) return p/);
});

test('GOALL holds location mismatches instead of counting them as addable leads', () => {
  assert.match(server, /explicitState/);
  assert.match(server, /exactLocationMatched:decision\.exactLocationMatched !== false/);
  const holdStart = server.indexOf('function goallStagedLeadHoldReason');
  const holdEnd = server.indexOf('\nfunction isGoallStagedAddableLead', holdStart);
  const holdBody = server.slice(holdStart, holdEnd);
  assert.match(holdBody, /goallTargetStateCode/);
  assert.match(holdBody, /goallVerifiedStateCode/);
  assert.match(holdBody, /verified location does not match searched business\/location/);
  assert.match(holdBody, /verified state \$\{verifiedState\} does not match target \$\{targetState\}/);
  assert.match(holdBody, /possible out-of-market location mismatch needs review/);
});

test('GOALL painpoint is formatted as a sentence-ready CRM merge phrase', () => {
  const promptStart = server.indexOf('async function researchGoallDecisionMakerWithGemini');
  const promptEnd = server.indexOf('\nasync function enrichProspectWithGoallGeminiDecisionMaker', promptStart);
  const promptBody = server.slice(promptStart, promptEnd);
  assert.match(promptBody, /You identified a challenge of \{\{contact\.painpoint\}\}/);
  assert.match(promptBody, /Other employers are also struggling with \{\{contact\.painpoint\}\}/);
  assert.match(promptBody, /Good explicitPainpoint examples/);
  assert.match(promptBody, /Bad explicitPainpoint examples/);
  assert.match(promptBody, /Do not put evidence, long explanations, company background, or GOALL positioning in explicitPainpoint/);

  const formatterStart = server.indexOf('function goallPainpointForMessaging');
  const formatterEnd = server.indexOf('\nfunction explicitGoallPainpoint', formatterStart);
  const formatterBody = server.slice(formatterStart, formatterEnd);
  assert.match(formatterBody, /operational\\s\+strain/);
  assert.match(formatterBody, /recruitment\\s\+pressure/);
  assert.match(formatterBody, /words\.length>12/);
  assert.match(server, /painpoint:goallPainpointForMessaging\(p\.painpoint\|\|p\.painPoint\|\|''\)/);
});

test('GOALL GHL notes put lead data first and call script last', () => {
  const noteStart = server.indexOf('function goallLeadImportNote');
  const noteEnd = server.indexOf('\nasync function createGhlLeadFromProspect', noteStart);
  const noteBody = server.slice(noteStart, noteEnd);
  assert.match(noteBody, /'Lead Data'/);
  assert.match(noteBody, /'Gemini Research Highlights'/);
  assert.match(noteBody, /'Enrichment'/);
  assert.match(noteBody, /'Call Script'/);
  assert.match(noteBody, /Caller snapshot/);
  assert.match(noteBody, /Phone type/);
  assert.match(noteBody, /Highest turnover area/);
  assert.match(noteBody, /GOALL value props/);
  assert.match(noteBody, /Suggested opener/);
  assert.match(noteBody, /function goallLeadCallerSnapshotNote/);
  assert.match(noteBody, /CALLER SNAPSHOT/);
  assert.doesNotMatch(server, /Insufficient lead data to definitively judge fit/);
  assert.doesNotMatch(server, /lead flow, follow-up, or revenue consistency/);
  assert.ok(noteBody.indexOf("'Lead Data'") < noteBody.indexOf("'Enrichment'"));
  assert.ok(noteBody.indexOf("'Enrichment'") < noteBody.indexOf("'Call Script'"));
  assert.match(server, /const note=goallLeadImportNote\(\{\.\.\.lead,\.\.\.automation\},automation,contactability,\{isWestwood:false\}\)/);
  assert.match(server, /const note=goallLeadImportNote\(p,automation,contactability,\{isWestwood\}\)/);
});

test('GOALL caller snapshot is written after the full note so it appears most recent in GHL', () => {
  const writerStart = server.indexOf('async function createGhlLeadFromProspect');
  const writerEnd = server.indexOf('\nfunction isGoallTestContactRequest', writerStart);
  const body = server.slice(writerStart, writerEnd);
  assert.match(body, /const note=goallLeadImportNote/);
  assert.match(body, /const callerSnapshotNote=goallLeadCallerSnapshotNote/);
  assert.ok(body.indexOf('const note=goallLeadImportNote') < body.indexOf('const callerSnapshotNote=goallLeadCallerSnapshotNote'));
  assert.ok(body.indexOf('body:note') < body.indexOf('body:callerSnapshotNote'));
});

test('GOALL duplicate repair path also writes caller snapshot after the full note', () => {
  const start = server.indexOf('async function ensureGhlOpportunityForExistingLead');
  const end = server.indexOf('\nasync function importApprovedHbsLeads', start);
  const body = server.slice(start, end);
  assert.match(body, /const note=goallLeadImportNote\(\{\.\.\.lead,\.\.\.automation\}/);
  assert.match(body, /const callerSnapshotNote=goallLeadCallerSnapshotNote\(\{\.\.\.lead,\.\.\.automation\}/);
  assert.ok(body.indexOf('const note=goallLeadImportNote') < body.indexOf('const callerSnapshotNote=goallLeadCallerSnapshotNote'));
  assert.ok(body.indexOf('body:note') < body.indexOf('body:callerSnapshotNote'));
});

test('RocketReach enrichment is chunked and gateway-safe', () => {
  assert.match(server, /ROCKETREACH_ENRICH_BATCH_MAX[^\n]+\|\|25/);
  assert.match(server, /pendingIndexes\.slice\(0,ROCKETREACH_ENRICH_BATCH_MAX\)/);
  assert.match(server, /ROCKETREACH_ENRICH_CONCURRENCY/);
  assert.match(server, /maxTitleLookups:1/);
  assert.match(server, /\[502,503,504\]\.includes\(response\.status\)/);
  assert.match(server, /rocketReachMode:remaining\?'defer':'review'/);
});
