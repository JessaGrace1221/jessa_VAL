const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
const hearth=fs.readFileSync(path.join(root,'hearth-prototype.js'),'utf8');

test('LinkedIn visibility refreshes real relationship post receipts and prepares review-only comments',()=>{
  assert.match(server,/async function refreshLinkedInVisibility/);
  assert.match(server,/lookupOutscraperLinkedIn/);
  assert.match(server,/lookupOutscraperLinkedInPersonalPosts/);
  assert.match(server,/linkedInActivityDate/);
  assert.match(server,/embeddedError/);
  assert.match(server,/sourceReceipts:posts\.length\?\{\.\.\.sourceReceipts,linkedInLatestPosts:posts\}:sourceReceipts/);
  assert.match(server,/draftType:'linkedin_comment_draft'/);
  assert.match(server,/contactId:profile\.id/);
  assert.match(server,/status:'ready_for_review'/);
  assert.match(server,/app\.post\('\/api\/val\/linkedin\/visibility\/refresh'/);
  assert.match(server,/noExternalAction:true/);
});

test('LinkedIn workspace loads saved receipts on open and refreshes only when explicitly requested',()=>{
  assert.match(hearth,/postJson\('\/api\/val\/linkedin\/visibility\/refresh'/);
  assert.match(hearth,/data-linkedin-refresh/);
  assert.match(hearth,/hydrateLinkedInVisibility\(\{force:true,refresh:true\}\)/);
  assert.match(hearth,/await hydrateLinkedInVisibility\(\{force:true\}\)/);
  assert.match(hearth,/timeoutMs:90000/);
  assert.match(hearth,/VAL never auto-publishes posts, comments, reactions, or DMs/);
});

test('Teach LinkedIn owns a durable profile watch list with inspectable refresh receipts',()=>{
  assert.match(server,/function normalizeLinkedInWatchUrl/);
  assert.match(server,/function linkedinProfileIsWatched/);
  assert.match(server,/app\.post\('\/api\/val\/linkedin\/watched-profiles'/);
  assert.match(server,/app\.delete\('\/api\/val\/linkedin\/watched-profiles\/:id'/);
  assert.match(server,/linkedinLastRefreshStatus/);
  assert.match(server,/watchedProfiles/);
  assert.match(hearth,/data-linkedin-watch-form/);
  assert.match(hearth,/data-linkedin-stop-watch/);
  assert.match(hearth,/Choose whose work VAL should watch/);
  assert.match(hearth,/workflow: 'linkedin:profiles'/);
});
