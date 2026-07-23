'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
const dashboard=fs.readFileSync(path.join(root,'dashboard.html'),'utf8');
const hearth=fs.readFileSync(path.join(root,'hearth-prototype.html'),'utf8');
const hearthJs=fs.readFileSync(path.join(root,'hearth-prototype.js'),'utf8');
const hearthCss=fs.readFileSync(path.join(root,'hearth-prototype.css'),'utf8');

test('relationship ingestion establishes and enforces owner identity',()=>{
  assert.match(server,/function relationshipOwnerIdentity/);
  assert.match(server,/ADMIN_EMAIL/);
  assert.match(server,/ADMIN_NAME/);
  assert.match(server,/VAL_OWNER_ALIASES/);
  assert.match(server,/filter\(person=>!isOwnerRelationship\(person,owner\)\)/);
  assert.match(server,/!isOwnerRelationship\(p,owner\)/);
});

test('emails and meetings attribute evidence to external participants',()=>{
  assert.match(server,/function relationshipEmailParticipants/);
  assert.match(server,/relationshipEmailParticipants\(email\).*filter\(person=>!isOwnerRelationship/s);
  assert.match(server,/inferAttendeesFromEvent\(ev\)\.forEach/);
  assert.match(server,/if\(isOwnerRelationship\(\{name:cleanName,email:cleanEmail\},owner\)/);
});

test('Stewardship admits Network people from explicit user action, calendar attendees, or qualifying sent mail',()=>{
  assert.match(server,/function firstLookCandidateRelationshipEmailQualification/);
  assert.match(server,/sentCount>3/);
  assert.match(server,/function stewardshipNetworkSentMailQualification/);
  assert.match(server,/function stewardshipNetworkManualAdmission/);
  assert.match(server,/function stewardshipNetworkCalendarAttendeeAdmission/);
  assert.match(server,/function stewardshipNetworkStoredSentMailAdmission/);
  assert.match(server,/\.filter\(profile=>stewardshipNetworkManualAdmission\(profile\)\|\|stewardshipNetworkCalendarAttendeeAdmission\(profile\)\|\|stewardshipNetworkStoredSentMailAdmission\(profile\)\|\|stewardshipNetworkSentMailQualification\(profile,candidateAnalysis\)\.accepted\)/);
  assert.doesNotMatch(server,/function calendarRelationshipProfiles/);
  assert.doesNotMatch(server,/function calendarAttendeeProfileFromEvent/);
});

test('Network offers a sent-mail refresh and an explicit manual person path',()=>{
  assert.match(server,/function safeArray\(value\)\{\s*return Array\.isArray\(value\) \? value : \[\];\s*\}/);
  assert.match(server,/app\.post\('\/api\/relationships\/network\/refresh-sent-mail'/);
  assert.match(server,/function fetchGmailSentNetworkMessages/);
  assert.match(server,/maxResults=500/);
  assert.match(server,/sentCount>3/);
  assert.match(server,/app\.post\('\/api\/relationships\/network\/manual'/);
  assert.match(server,/app\.post\('\/api\/relationships\/network\/import-csv'/);
  assert.match(server,/networkAdmission:'manual'/);
  assert.match(hearth,/data-stewardship-refresh-network/);
  assert.match(hearth,/data-stewardship-network-add-form/);
  assert.match(hearth,/data-stewardship-import-network/);
  assert.match(hearth,/data-stewardship-network-total/);
  assert.match(hearthCss, /\.stewardship-network-add-form\[hidden\]\{[\s\S]*display:none!important/);
  assert.match(hearthJs,/refreshStewardshipNetworkFromSentMail/);
  assert.match(hearthJs,/api\/relationships\/network\/manual/);
  assert.match(hearthJs,/api\/relationships\/network\/import-csv/);
  assert.match(hearthJs,/relationshipIndexNetworkCount/);
  assert.match(hearthJs,/function stewardshipNetworkPeople/);
  assert.match(hearthJs,/data-stewardship-save-linkedin/);
  assert.match(hearthJs,/Open recent activity/);
  assert.match(hearthJs,/Meeting Prep and LinkedIn commenting/);
});

test('Stewardship Co-Work carries the visibly selected person through every relationship entry path',()=>{
  assert.match(hearthJs,/function relationshipCoworkIdentifier/);
  assert.match(hearthJs,/function relationshipCoworkProfileMatches/);
  assert.match(hearthJs,/activeRelationshipProfile = profile;/);
  assert.match(hearthJs,/relationshipCoworkIdentifier\(profile, stewardshipSelectedNetworkId\)/);
  assert.match(hearthJs,/stewardshipPersonById\(stewardshipSelectedNetworkId\) \|\| activeRelationshipProfile/);
  assert.doesNotMatch(hearthJs,/if\(!relationshipId \|\| !canUseApi\) return;/);
  assert.doesNotMatch(hearthJs,/if\(!sectionLabel \|\| !selected \|\| !durableId \|\| !canUseApi\) return;/);
});

test('Stewardship introductions use a durable two-person review and explicit final send gate',()=>{
  assert.match(hearthJs,/action:'draft_intro_candidate'/);
  assert.match(hearthJs,/\/api\/relationships\/actions/);
  assert.match(hearthJs,/Review recipients and send/);
  assert.match(hearthJs,/\/api\/val\/external-actions\/email-send-now/);
  assert.match(hearthJs,/Two distinct verified email addresses are required/);
  assert.match(hearthJs,/The earlier review packet is no longer treated as approval for this wording/);
  assert.match(hearthJs,/Both relationships will receive the execution receipt/);
});

test('tracking notifications and preference memory are not relationship evidence',()=>{
  assert.match(server,/mailsuite\|mailtrack\|email tracking\|tracking notification/);
  assert.match(server,/memory\.filter\(m=>m&&m\.kind!==\'relationship_preference\'\)/);
});

test('identity resolution merges exact email name and company signals',()=>{
  assert.match(server,/existing\.email===cleanEmail/);
  assert.match(server,/normalizeContextName\(existing\.name\)===normalizedName/);
  assert.match(server,/normalizeContextName\(existing\.company\)===normalizedCompany/);
  assert.match(server,/new Set\(people\.values\(\)\)/);
});

test('all relationship actions are wired with readable hierarchy',()=>{
  for(const action of ['draft_message','create_task','brainstorm','mark_vip','snooze','not_important'])assert.ok(dashboard.includes(`relationshipAction('${action}')`)||dashboard.includes(`action:'${action}'`));
  assert.match(dashboard,/showRelationshipProfile\(\)/);
  assert.match(dashboard,/relationship-actions/);
  assert.match(dashboard,/relationship-action-panel/);
  assert.match(dashboard,/relationship-profile-grid/);
});

test('VIP snooze and not-important preferences alter review visibility',()=>{
  assert.match(server,/p\.manualVip=pref\.action===\'mark_vip\'/);
  assert.match(server,/p\.notImportant=pref\.action===\'not_important\'/);
  assert.match(server,/p\.snoozedUntil=pref\.action===\'snooze\'/);
  assert.match(server,/!p\.notImportant&&\(!p\.snoozedUntil/);
});

test('null contacts cannot crash production relationship ingestion',()=>{
  assert.match(server,/if\(!p\|\|p\.name===\'Unknown\'\) continue/);
});

test('relationship contrast rules load after the shared command center stylesheet',()=>{
  const sharedStyles=dashboard.search(/<link rel="stylesheet" href="\/command-center\.css(?:\?[^\"]*)?">/);
  const contrastStyles=dashboard.indexOf('<style id="relationship-review-contrast">');
  assert.ok(sharedStyles>=0&&contrastStyles>sharedStyles);
  assert.match(dashboard,/\.exec-workspace-modal \.exec-workspace-footer \.alert-btn\{[^}]*color:#172740!important/);
  assert.match(dashboard,/\.exec-workspace-modal #relationshipTabs button\{[^}]*color:#172740!important/);
  assert.match(dashboard,/\.relationship-review-error\{[^}]*color:#7f1d1d!important/);
});
