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
  assert.match(server,/backfillBoardPackets/);
  assert.match(server,/saveEvidenceItem/);
  assert.match(server,/runObservationEngine/);
  assert.match(server,/relationshipReviewFromStoredProfiles/);
  assert.match(server,/buildExecutiveBriefing/);
});

test('intelligence backfill reconciles historical evidence into Board packets',()=>{
  assert.match(server,/async function backfillBoardPackets/);
  assert.match(server,/app\.post\('\/api\/val\/board\/reconcile'/);
  assert.match(server,/valBoardPackets\.recordTranscriptProcessed/);
  assert.match(server,/valBoardPackets\.recordEmailSync/);
  assert.match(server,/valBoardPackets\.recordCalendarEvent/);
  assert.match(server,/valBoardPackets\.recordCommitmentEvent/);
  assert.match(server,/valBoardPackets\.recordProfileEvent/);
  assert.match(server,/triggerBoardIntelligenceForPackets\(createdPackets\.slice\(0,80\),\{type:'board_reconciliation'/);
});

test('Board packet reconciliation reads existing source tables and local stores',()=>{
  assert.match(server,/async function boardBackfillTranscriptRuns/);
  assert.match(server,/from transcript_intelligence_runs/);
  assert.match(server,/valStore\(\)\.transcriptIntelligenceRuns/);
  assert.match(server,/async function boardBackfillEmailMessages/);
  assert.match(server,/from email_messages/);
  assert.match(server,/valStore\(\)\.emailMessages/);
  assert.match(server,/async function boardBackfillCalendarEvents/);
  assert.match(server,/from val_calendar_events/);
  assert.match(server,/valStore\(\)\.calendarEvents/);
  assert.match(server,/listRelationshipProfiles\(\{limit:lim\}\)/);
  assert.match(server,/valCommitments\.list\(\{limit:lim\}\)/);
});

test('transcript migration merges old archive records with the processed transcript index',()=>{
  assert.match(server,/function mergeTranscriptMigrationRecords/);
  assert.match(server,/transcriptMigrationRecordsFromIndex/);
  const start=server.indexOf("app.get('/api/val/transcripts'");
  const end=server.indexOf("app.get('/api/val/transcripts/review'",start);
  const body=server.slice(start,end);
  assert.match(body,/transcriptArchiveRecords\(days,limit\)/);
  assert.match(body,/mergeTranscriptMigrationRecords\(archive,data\)/);
  assert.doesNotMatch(body,/if\(data\.transcripts\.length\)/);
});

test('transcript migration fallback observations quote the evidence instead of vague titles',()=>{
  const start=server.indexOf('function transcriptBackfillCandidates');
  const end=server.indexOf('function transcriptMigrationRecordsFromIndex',start);
  const body=server.slice(start,end);
  assert.match(server,/function transcriptEvidenceSnippet/);
  assert.match(server,/function transcriptFallbackObservationContent/);
  assert.match(server,/Possible risk:/);
  assert.match(server,/Possible opportunity:/);
  assert.doesNotMatch(body,/includes possible risk, concern, blocker, or drift language/);
  assert.doesNotMatch(body,/includes possible opportunity, introduction, referral, partnership, lead, client, or deal language/);
});

test('personal transcript migration can run without touching email or Michele book mode',()=>{
  const start=server.indexOf("app.post('/api/val/transcripts/migrate'");
  const end=server.indexOf("app.post('/api/relationships/actions'",start);
  const body=server.slice(start,end);
  assert.match(body,/isBookEditorProject\(\)/);
  assert.match(body,/backfillTranscriptEvidence/);
  assert.match(body,/executiveBriefingCounts/);
  assert.doesNotMatch(body,/backfillEmailEvidence/);
  assert.doesNotMatch(body,/saveTask\(/);
});

test('email backfill keeps the evidence-first rule',()=>{
  const start=server.indexOf('async function backfillEmailEvidence');
  const end=server.indexOf('async function backfillValIntelligence',start);
  const body=server.slice(start,end);
  assert.match(body,/classifyExecutiveEmail\(withMetrics,rules\)/);
  assert.match(body,/emailSenderMetrics\(email,emailCorpus\)/);
  assert.match(body,/saveEmailEvidenceBatch/);
  assert.match(body,/relationshipIntake/);
  assert.match(body,/personPackets/);
  assert.match(body,/processEmailDocumentSourceProcessing\(emails,\{origin:'email_backfill'\}/);
  assert.match(body,/sourceProcessing:\{projectManagers:projectManagerIntake\}/);
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

test('relationship profiles persist person packets for ongoing Stewardship intake',()=>{
  assert.match(server,/function relationshipProfilePersonPacketMetadata/);
  assert.match(server,/personPacketFromContact\(\{/);
  assert.match(server,/personPacket:packet/);
  assert.match(server,/row\.metadataJson=relationshipProfilePersonPacketMetadata\(row\)/);
  assert.match(server,/metadata_json=relationship_profiles\.metadata_json\|\|\$20::jsonb/);
  assert.match(server,/personPacket:metadata\.personPacket\|\|null/);
});

test('Stewardship exposes an internal person packet read surface',()=>{
  assert.match(server,/function relationshipPersonPacketItemFromProfile/);
  assert.match(server,/app\.get\('\/api\/relationships\/person-packets'/);
  assert.match(server,/maturityCounts/);
  assert.match(server,/needsReviewCount/);
  assert.match(server,/includeThin/);
  assert.match(server,/noExternalAction:true/);
});
