'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const hearth = fs.readFileSync(path.join(root, 'hearth-prototype.js'), 'utf8');
const server = fs.readFileSync(path.join(root, 'server.js'), 'utf8');

function sourceBetween(start, end){
  const startIndex = hearth.indexOf(start);
  const endIndex = hearth.indexOf(end, startIndex + start.length);
  assert.notEqual(startIndex, -1, 'missing source boundary: ' + start);
  assert.notEqual(endIndex, -1, 'missing source boundary: ' + end);
  return hearth.slice(startIndex, endIndex);
}

test('all attachment surfaces use the canonical Stewardship and Project Managers catalogs', () => {
  assert.match(hearth, /function attachmentRelationshipOptions\(\)/);
  assert.match(hearth, /function attachmentProjectOptions\(\)/);
  assert.match(hearth, /function hydrateAttachmentCatalogs\(\{force=false\}=\{\}\)/);
  assert.match(hearth, /api\/relationships\/index\?limit=200/);
  assert.match(hearth, /api\/projects\/index\?limit=200/);
  assert.match(hearth, /getJson\('\/api\/relationships\/index\?limit=200', \{cache:'no-store'\}\)/);
  assert.match(hearth, /getJson\('\/api\/projects\/index\?limit=200', \{cache:'no-store'\}\)/);
  assert.match(hearth, /function meetingPrepRelationshipOptions\(\)\{\s*return attachmentRelationshipOptions\(\);/);
  assert.match(hearth, /function meetingPrepProjectOptions\(\)\{\s*return attachmentProjectOptions\(\);/);
  assert.match(hearth, /const projectOptions = attachmentProjectOptions\(\)/);
  assert.match(hearth, /const relationshipOptions = attachmentRelationshipOptions\(\)/);
  assert.match(hearth, /correspondencePopulateSelect\(correspondenceProjectSelect, attachmentProjectOptions\(\), 'Choose project'\)/);
});

test('typed labels cannot be saved as fake relationship or project identifiers', () => {
  const transcriptSelectors = sourceBetween('function timelineSelectedProjectOption', 'function timelineAttendeeEmailDraftRecord');
  const meetingSelectors = sourceBetween('function meetingPrepSelectedRelationship', 'function meetingPrepCalendarEventId');
  assert.doesNotMatch(transcriptSelectors, /\{id:raw/);
  assert.doesNotMatch(meetingSelectors, /\{id:raw/);
  assert.match(transcriptSelectors, /\|\| null/);
  assert.match(meetingSelectors, /\|\| null/);
});

test('meeting prep attachment actions confirm inline and never navigate to a stale receipt', () => {
  const handler = sourceBetween('async function handleMeetingPrepAttendeeMappingAction', 'function openCanonicalRelationshipFile');
  assert.doesNotMatch(handler, /showRelationshipReceipt/);
  assert.doesNotMatch(handler, /openCanonicalRelationshipFile/);
  assert.match(handler, /Choose an existing Project Managers project from the matching results/);
  assert.match(handler, /Relationship attached to this meeting\. VAL will carry this context forward\./);
  assert.match(handler, /Project created and linked\. It is now available throughout VAL\./);
  assert.match(handler, /const projectName = String\(input\?\.value \|\| ''\)\.trim\(\)/);
});

test('transcript project creation stays distinct from choosing an existing project', () => {
  const createProject = sourceBetween('async function createTimelineTranscriptProject', 'async function linkTimelineTranscriptRelationship');
  assert.match(createProject, /const name = String\(input\?\.value \|\| ''\)\.trim\(\)/);
  assert.doesNotMatch(createProject, /timelineSuggestedProjectOption/);
  assert.match(createProject, /postJson\('\/api\/val\/transcripts\/' \+ encodeURIComponent\(transcriptId\) \+ '\/link-project'/);
  assert.doesNotMatch(createProject, /await linkTimelineTranscriptProject/);
  assert.match(createProject, /hydrateProjectIndex\(\{force:true, render:false\}\)/);
});

test('meeting prep relationship creation accepts either trustworthy attendee identifier', () => {
  const handler = sourceBetween('async function handleMeetingPrepAttendeeMappingAction', 'function openCanonicalRelationshipFile');
  assert.match(handler, /if\(!payload\.name && !payload\.email\)/);
  assert.doesNotMatch(handler, /if\(!payload\.name \|\| !payload\.email\)/);
});

test('closing transcript Co-Work restores the transcript archive instead of the proposal fallback', () => {
  const restore = sourceBetween('function restoreTimelineWindow', 'function restoreCorrespondenceWindow');
  assert.match(restore, /openTimelineTranscript\(currentTimelineTranscriptItems\[0\]\.id\)/);
  assert.match(restore, /loadTimelineTranscripts\(\{openFirst:true\}\)/);
  assert.doesNotMatch(restore, /renderTimelineReviewCards/);
  assert.doesNotMatch(hearth, /The event queue may show transcript review needs, but no proposal packet is loaded here yet/);
});

test('drawers refresh attachment catalogs when opened', () => {
  assert.match(hearth, /loadTimelineTranscripts[\s\S]*?hydrateAttachmentCatalogs\(\{force:true\}\)/);
  assert.match(hearth, /openMeetingPrep\(\)[\s\S]*?hydrateAttachmentCatalogs\(\{force:true\}\)/);
  const inboxHydration = sourceBetween('async function hydrateCorrespondenceDrawer', 'async function scanCorrespondenceWindow');
  assert.match(inboxHydration, /hydrateRelationshipIndex\(\{force:true\}\)/);
  assert.match(inboxHydration, /hydrateProjectIndex\(\{force:true, render:false\}\)/);
});

test('project catalog filters at the storage boundary before applying its limit', () => {
  assert.match(server, /where tenant_id=\$1 and profile_type='project'/);
  assert.doesNotMatch(
    server,
    /listRelationshipProfiles\(\{limit:Math\.max\(capped,160\)\}\)\)\.filter\(p=>p\.profileType==='project'/
  );
});
