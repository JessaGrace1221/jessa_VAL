'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'hearth-prototype.html'), 'utf8');
const js = fs.readFileSync(path.join(root, 'hearth-prototype.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'hearth-prototype.css'), 'utf8');
const server = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
const meetingPrepService = fs.readFileSync(path.join(root, 'services', 'valMeetingPrep.js'), 'utf8');
const baseline = fs.readFileSync(path.join(root, 'docs', 'audits', '2026-07-10-known-good-baseline.md'), 'utf8');
const doNotRegress = fs.readFileSync(path.join(root, 'docs', 'VAL_DO_NOT_REGRESS.md'), 'utf8');

test('July 10 known-good baseline is documented and linked from Do Not Regress', () => {
  assert.match(baseline, /Known Good Baseline/);
  assert.match(baseline, /f8259d04-88c5-46e5-9602-d92a66b57ec8/);
  assert.match(baseline, /9fe505a Restore transcript meeting notes drawer/);
  assert.match(baseline, /Do not replace an executive-facing drawer with an older diagnostic/);
  assert.match(doNotRegress, /2026-07-10-known-good-baseline\.md/);
  assert.match(doNotRegress, /Never replace the Meeting Notes transcript workbench/);
});

test('Home baseline keeps Velocity Alignment and Leverage distinct', () => {
  assert.doesNotMatch(html, /Prototype states/);
  assert.doesNotMatch(html, /data-state-option/);
  assert.match(html, /<h2>What changed<\/h2>/);
  assert.match(html, /<h2>Top priority<\/h2>/);
  assert.match(html, /<h2>Prepared drafts<\/h2>/);
  assert.match(js, /function hydrateRoomsFromBriefing/);
  assert.match(js, /function hydrateGreetingFromBriefing/);
  assert.match(js, /function updatePreparedCount/);
  assert.match(js, /function renderWhyTodayPanel/);
  assert.doesNotMatch(js, /forceExecutiveInboxHome\s*=\s*true/);
  assert.doesNotMatch(html, /Open Executive Inbox[\s\S]{0,500}Open Executive Inbox[\s\S]{0,500}Open Executive Inbox/);
});

test('Calendar baseline treats solo blocks as private rhythm, not meetings', () => {
  assert.match(js, /function calendarEventIsMeeting/);
  assert.match(js, /function calendarEventExternalAttendees/);
  assert.match(js, /function calendarEventLooksPrivateBlock/);
  assert.match(js, /function calendarEventIsFutureMeeting/);
  assert.match(js, /currentMeetingEvents = visibleEvents\.filter\(calendarEventIsFutureMeeting\)/);
  assert.match(js, /Past event - open matching transcript/);
  assert.match(js, /Solo blocks stay out of meeting prep/);
  assert.match(js, /if\(!calendarEventIsMeeting\(event\)\)\{/);
  assert.match(server, /meetingPrepEligible:externalAttendees\.length>0/);
  assert.match(server, /privateCalendarBlock:privateBlock/);
  assert.match(server, /externalAttendeeCount:externalAttendees\.length/);
  assert.match(meetingPrepService, /function isMeetingEvent/);
  assert.match(meetingPrepService, /private_calendar_block/);
  assert.match(meetingPrepService, /code:'not_a_meeting'/);
  assert.match(meetingPrepService, /private calendar block/);
});

test('Transcript drawer baseline stays source-grounded, not diagnostic workflow', () => {
  assert.match(html, /<h3>Transcripts<\/h3>/);
  assert.match(html, /Meeting evidence, attendee context, source Action Items, and clean review-ready follow-up/);
  assert.match(html, /data-transcript-list/);
  assert.match(html, /data-transcript-detail/);
  assert.doesNotMatch(html, /Select a transcript/);
  assert.doesNotMatch(html, /Krisp|Crisp|Outscraper|RocketReach|GoHighLevel|\bGHL\b/);
  assert.match(html, /Action Items/);
  assert.match(html, /Meeting Overview/);
  assert.match(html, /People and Projects/);
  assert.match(html, /Co-Work on This Transcript/);
  assert.match(html, /View full transcript/);
  assert.match(js, /function timelineNativeActionItems/);
  assert.match(js, /function timelineSourceReceipt/);
  assert.match(js, /function timelineKrispSections/);
  assert.match(js, /rawTranscript/);
  assert.match(js, /Key Points\|Meeting Overview\|Summary\|Overview/);
  assert.match(js, /function timelineKrispStructuredActionItems/);
  assert.match(js, /sourcePayloadMetadata\?\.data\?\.sections/);
  assert.match(js, /Action Items\?/);
  assert.match(js, /Meeting Overview\|Summary\|Overview/);
  assert.match(js, /krispSections\.actionItems\.length/);
  assert.match(js, /krispStructured\.length/);
  assert.match(js, /if\(native\.length\) return native/);
  assert.match(js, /function timelineMeetingOverviewDraft/);
  assert.match(js, /Prepare email draft/);
  assert.match(js, /Open email draft/);
  assert.match(js, /function renderTimelineTranscriptSourceSections/);
  assert.match(js, /VAL is opening the source receipt/);
  assert.doesNotMatch(js, /renderTimelineTranscriptDetail\(\{\.\.\.cached/);
  assert.doesNotMatch(js, /VAL Action Items/);
  for(const forbidden of ['Transcript Review Workflow', 'Ready to Extract', 'Proposed Notes', 'Proposed Tasks', 'Useful Note', 'Useful Task']){
    assert.doesNotMatch(html, new RegExp(forbidden.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('Hearth-facing copy hides provider names behind VAL and CRM', () => {
  assert.match(js, /function publicSurfaceText/);
  assert.match(js, /replace\([^)]*CRM/);
  for(const provider of ['Krisp', 'Crisp', 'Outscraper', 'RocketReach', 'Apollo', 'GoHighLevel']){
    assert.match(js, new RegExp('replace\\([^\\n]*' + provider));
  }
  assert.doesNotMatch(html, /\bGHL\b|GoHighLevel|Krisp|Crisp|Outscraper|RocketReach/);
});

test('Transcript titles stay source-grounded and reject weak calendar contradictions', () => {
  assert.match(server, /function transcriptKnownContentTitle/);
  assert.match(server, /function transcriptTitleConflictsWithContent/);
  assert.match(server, /function transcriptGroundedTitleCandidate/);
  assert.match(server, /calendar title contradicts transcript content/);
  assert.match(js, /function timelineTranscriptKnownTitle/);
  assert.match(js, /function timelineTranscriptTitle/);
  assert.match(server, /GOALL/);
  assert.match(server, /mammogram\|screening\|wang building\|annual screening/);
});

test('Opened drawer visuals keep frosted white baseline', () => {
  assert.match(css, /--frost-open-surface:/);
  assert.match(css, /--frost-open-card:/);
  assert.match(css, /rgba\(255,255,255,\.92\)/);
  assert.match(css, /rgba\(255,255,255,\.82\)/);
  assert.match(css, /System-wide opened surface standard: frosted off-white, quiet sage, never heavy tan/);
  assert.match(css, /\.transcript-workbench/);
  assert.match(css, /\.drawer-tray\.correspondence-open\{[\s\S]{0,180}background:var\(--frost-open-surface\)/);
  assert.doesNotMatch(css, /--frost-open-surface:[\s\S]{0,180}rgba\(235,241,226,\.34\)/);
});

test('Lead Intelligence baseline keeps two scrapers plus train control and three levels', () => {
  assert.match(html, /Run organization scraper/);
  assert.match(html, /Run partner scraper/);
  assert.match(html, /Train this scraper/);
  assert.match(js, /<span>Step 1<\/span><h4>Find organizations<\/h4><small>Source discovery<\/small>/);
  assert.match(js, /<span>Step 2<\/span><h4>Find decision makers<\/h4><small>Contact evidence<\/small>/);
  assert.match(js, /<span>Step 3<\/span><h4>Confirm before CRM<\/h4><small>Dedupe and approval<\/small>/);
  assert.match(js, /Live preview - not imported/);
});
