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
  assert.ok(body.indexOf('sanitizeDecisionMaker') < body.indexOf("ghlStrict('POST','/contacts'"));
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

test('RocketReach enrichment is chunked and gateway-safe', () => {
  assert.match(server, /ROCKETREACH_ENRICH_BATCH_MAX[^\n]+\|\|25/);
  assert.match(server, /pendingIndexes\.slice\(0,ROCKETREACH_ENRICH_BATCH_MAX\)/);
  assert.match(server, /ROCKETREACH_ENRICH_CONCURRENCY/);
  assert.match(server, /maxTitleLookups:1/);
  assert.match(server, /\[502,503,504\]\.includes\(response\.status\)/);
  assert.match(server, /rocketReachMode:remaining\?'defer':'review'/);
});
