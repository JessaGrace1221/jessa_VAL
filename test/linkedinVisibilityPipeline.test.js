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
  assert.match(server,/sourceReceipts:\{\.\.\.sourceReceipts,linkedInLatestPosts:posts\}/);
  assert.match(server,/draftType:'linkedin_comment_draft'/);
  assert.match(server,/status:'ready_for_review'/);
  assert.match(server,/app\.post\('\/api\/val\/linkedin\/visibility\/refresh'/);
  assert.match(server,/noExternalAction:true/);
});

test('LinkedIn workspace runs one refresh on open and supports an explicit refresh without auto-publishing',()=>{
  assert.match(hearth,/postJson\('\/api\/val\/linkedin\/visibility\/refresh'/);
  assert.match(hearth,/data-linkedin-refresh/);
  assert.match(hearth,/linkedinVisibilityRefreshAttempted/);
  assert.match(hearth,/VAL never auto-publishes posts, comments, reactions, or DMs/);
});
