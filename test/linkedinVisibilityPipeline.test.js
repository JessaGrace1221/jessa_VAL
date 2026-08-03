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
  assert.match(server,/linkedInStructuredPosts/);
  assert.match(server,/lookupPublicLinkedInProfilePosts/);
  assert.match(server,/provider:'linkedin_public_profile'/);
  assert.match(server,/attempt<3/);
  assert.match(server,/response\.status!==999/);
  assert.match(server,/if\(direct\.postsLastWeek\?\.length\)return direct/);
  assert.match(server,/if\(attendee\.strictLatest\)return direct/);
  assert.match(server,/strictLatest:true/);
  assert.match(server,/function linkedInVerifiedCachedPosts/);
  assert.match(server,/refreshAgeMs<10\*60\*1000/);
  assert.match(server,/The last verified posts remain visible/);
  assert.match(server,/storedPosts\.filter\(post=>post\?\.contentSource==='linkedin_public_profile'\)/);
  assert.match(server,/const cachedVerifiedPosts=linkedInVerifiedCachedPosts\(profile\)/);
  assert.match(server,/verified post\$\{cachedVerifiedPosts\.length===1\?' remains':'s remain'\} visible/);
  assert.match(server,/const observedAuthorName=/);
  assert.match(server,/latest public thinking/);
  assert.match(server,/readPublicLinkedInPost/);
  assert.match(server,/linkedin_public_metadata/);
  assert.match(server,/embeddedError/);
  assert.match(server,/latest\.contentSource==='search_snippet'/);
  assert.match(server,/linkedinLastRefreshStatus:'draft_error'/);
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
  assert.match(server,/\['error','draft_error'\]\.includes\(profile\.lastRefreshStatus\)/);
  assert.match(hearth,/data-linkedin-watch-form/);
  assert.match(hearth,/data-linkedin-stop-watch/);
  assert.match(hearth,/Choose whose work VAL should watch/);
  assert.match(hearth,/workflow: 'linkedin:profiles'/);
});

test('LinkedIn posts can be durably dismissed without stopping the profile watch',()=>{
  assert.match(server,/function linkedinVisibilityDismissals/);
  assert.match(server,/function linkedinVisibilityItemIsDismissed/);
  assert.match(server,/linkedinVisibilityDismissals:\[\.\.\.prior/);
  assert.match(server,/app\.post\('\/api\/val\/linkedin\/visibility\/dismiss'/);
  assert.match(server,/action:'linkedin_visibility_item_dismissed'/);
  assert.match(server,/status:'dismissed'/);
  assert.match(server,/!\['dismissed','archived','deleted'\]\.includes/);
  assert.match(hearth,/data-linkedin-dismiss=/);
  assert.match(hearth,/async function dismissLinkedInVisibilityItem/);
  assert.match(hearth,/linkedinVisibilityItems=linkedinVisibilityItems\.filter/);
  assert.match(hearth,/VAL will keep watching the person for newer activity/);
});
