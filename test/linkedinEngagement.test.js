const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const server = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
const hearthJs = fs.readFileSync(path.join(root, 'hearth-prototype.js'), 'utf8');
const hearthCss = fs.readFileSync(path.join(root, 'hearth-prototype.css'), 'utf8');

test('LinkedIn visibility is sourced from Stewardship instead of sample contacts', () => {
  assert.match(server, /listRelationshipProfiles\(\{limit:300\}\)/);
  assert.ok(server.includes('linkedin\\.com\\/in'), 'daily review should require a LinkedIn person profile URL');
  assert.match(server, /findLinkedInPostForProfile/);
  assert.match(hearthJs, /let linkedinVisibilityItems = \[\]/);
  assert.doesNotMatch(hearthJs, /const linkedinVisibilityItems = \[/);
});

test('LinkedIn visibility runs a persisted daily review at 8 AM with manual refresh', () => {
  assert.match(server, /VAL_LINKEDIN_DAILY_HOUR\)\|\|8/);
  assert.match(server, /runLinkedInDailySchedulerCheck/);
  assert.match(server, /app\.post\('\/api\/val\/linkedin\/refresh'/);
  assert.match(server, /linkedin_engagement_runs/);
  assert.match(hearthJs, /This may take a minute or two/);
  assert.match(hearthJs, /data-linkedin-refresh/);
});

test('LinkedIn lookup uses the contact name first and recovers interrupted daily runs', () => {
  assert.match(server, /site:linkedin\.com\/posts \"\$\{name\}\"/);
  assert.match(server, /site:linkedin\.com\/posts \"\$\{slug\}\"/);
  assert.match(server, /runningIsFresh/);
  assert.match(server, /10\*60\*1000/);
});

test('Meeting Prep and LinkedIn visibility share a verified post resolver', () => {
  assert.match(server, /async function resolveLinkedInPublicPost/);
  assert.match(server, /async function resolveMeetingPrepLinkedInPublicPost/);
  assert.match(server, /outscraper_google_discovery_and_linkedin_public_post/);
  assert.match(server, /async function fetchPublicLinkedInPost/);
  assert.match(server, /og:description/);
  assert.match(server, /return resolveLinkedInPublicPost\(\{profile\}\)/);
  assert.match(server, /resolveMeetingPrepLinkedInPublicPost\(\{attendee,contact,profile,\.\.\.options\}\)/);
  assert.match(server, /lookupOutscraperGoogleSearch\(queries/);
  assert.match(server, /identitySource:'stewardship_linkedin_url'/);
  assert.match(server, /identitySource:'calendar_email_lookup'/);
  assert.match(server, /No official LinkedIn profile exists with this attendee's email address/);
  assert.doesNotMatch(server, /new URL\(OUTSCRAPER_LINKEDIN_POSTS_URL\)/);
});

test('LinkedIn drafts preserve human style rules and remain review-only', () => {
  for(const field of ['tone','expertise','emojis','length','avoid','examples','additionalGuidance']){
    assert.match(server, new RegExp(field));
    assert.match(hearthJs, new RegExp('name="' + field + '"'));
  }
  assert.match(server, /manualPublishRequired:true/);
  assert.match(server, /noExternalAction:true/);
  assert.match(server, /Never pitch/);
  assert.match(hearthJs, /VAL never auto-publishes LinkedIn posts, comments, or DMs/);
});

test('a found LinkedIn post remains visible when comment drafting fails', () => {
  assert.match(server, /maxTokens:1600/);
  assert.match(server, /status:outcome\.draft\?'ready_for_review':'draft_failed'/);
  assert.match(server, /postUrl:outcome\.post\?\.url/);
  assert.match(hearthJs, /Draft needs attention/);
  assert.match(hearthJs, /VAL found the post, but the grounded comment draft did not finish/);
});

test('LinkedIn workspace exposes source, draft, and manual posting path', () => {
  assert.match(hearthJs, /Public post excerpt/);
  assert.match(hearthJs, /Prepared comment/);
  assert.match(hearthJs, /Copy comment/);
  assert.match(hearthJs, /Open post/);
  assert.match(hearthJs, /Open LinkedIn activity/);
  assert.match(hearthJs, /Comment style/);
});

test('LinkedIn comment style uses the full opened workspace instead of the legacy preview height', () => {
  assert.match(hearthCss, /\.desk-workspace\.linkedin-engagement-mode\{\s*width:min\(1280px,calc\(100vw - 48px\)\)/);
  assert.match(hearthCss, /\.desk-workspace\.linkedin-engagement-mode \.scraper-preview-list\{[\s\S]*max-height:calc\(100vh - 72px\)[\s\S]*min-height:calc\(100vh - 96px\)/);
  assert.match(hearthCss, /\.linkedin-style-form\{[\s\S]*width:100%[\s\S]*max-width:none/);
});
