'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
const commandCenter=fs.readFileSync(path.join(root,'command-center.js'),'utf8');

test('personal VAL exposes transcripts as a first-class workspace item',()=>{
  assert.match(commandCenter,/\{id:'transcripts',icon:'document',label:'Transcripts',group:'core'\}/);
  assert.match(commandCenter,/if\(view==='transcripts'\)\{openTranscripts\(\);return;\}/);
  assert.match(commandCenter,/window\.openTranscripts=function/);
});

test('intelligence backfill rehydrates existing evidence before dashboard conclusions',()=>{
  assert.match(server,/app\.post\('\/api\/val\/intelligence\/backfill'/);
  assert.match(server,/async function backfillValIntelligence/);
  assert.match(server,/Postgres is not connected/);
  assert.match(server,/backfillTranscriptEvidence/);
  assert.match(server,/backfillEmailEvidence/);
  assert.match(server,/saveEvidenceItem/);
  assert.match(server,/runObservationEngine/);
  assert.match(server,/relationshipReviewFromStoredProfiles/);
  assert.match(server,/buildExecutiveBriefing/);
});

test('email backfill keeps the evidence-first rule',()=>{
  const start=server.indexOf('async function backfillEmailEvidence');
  const end=server.indexOf('async function backfillValIntelligence',start);
  const body=server.slice(start,end);
  assert.match(body,/classifyEmail\(email,rules\)/);
  assert.match(body,/saveEmailEvidenceBatch/);
  assert.doesNotMatch(body,/saveTask\(/);
  assert.doesNotMatch(body,/create_task/);
});

test('relationship review can use stored relationship engine profiles when provider review is empty',()=>{
  assert.match(server,/function relationshipContactFromStoredProfile/);
  assert.match(server,/async function relationshipReviewFromStoredProfiles/);
  assert.match(server,/source:'relationship_profiles'/);
  assert.match(server,/providerReviewErrors/);
  assert.match(server,/stored&&\(stored\.relationshipProfiles\|\|\[\]\)\.length/);
});
