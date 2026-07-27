const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'hearth-prototype.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'hearth-prototype.css'), 'utf8');
const js = fs.readFileSync(path.join(root, 'hearth-prototype.js'), 'utf8');

test('all eight Executive Functions keep their existing names and entry points', () => {
  [
    'Alignment',
    'Leverage',
    'Executive Inbox',
    'Project Managers',
    'Stewardship',
    'Transcripts',
    'Lead Intelligence',
    'VAL'
  ].forEach((label) => assert.match(html, new RegExp(`>${label}<`)));
});

test('opened Executive Functions use the shared VAL Studio shell', () => {
  assert.match(css, /Executive Functions inherit VAL Studio's calm operating grammar/);
  assert.match(css, /width:min\(1180px,92vw\)!important/);
  assert.match(css, /height:min\(880px,90vh\)!important/);
  assert.match(css, /linear-gradient\(120deg,rgba\(241,247,236,.3\),rgba\(255,255,255,.76\) 46%,rgba\(252,235,237,.28\)\)/);
});

test('function headers remain visible and close controls remain crisp', () => {
  assert.match(css, /\.source-detail-header > div:first-child\{\s*display:grid!important/);
  assert.match(css, /\.source-detail-header h3\{/);
  assert.match(css, /border-radius:6px!important/);
  assert.match(html, /class="close-(?:correspondence|project|relationship|timeline|source|val)-detail"/);
});

test('dense functions preserve distinct executive layouts', () => {
  assert.match(css, /Executive Inbox opens as a calm queue and selected conversation/);
  assert.match(css, /Transcripts keeps one quiet index beside one readable source brief/);
  assert.match(css, /Lead Intelligence follows Studio's three-step contract without extra framing/);
  assert.match(css, /Project Managers reads like an executive project index/);
});

test('dense functions share a generous interior spacing contract', () => {
  assert.match(css, /Executive Function interior contract: one generous gutter at every depth/);
  assert.match(css, /--function-inner-gutter:clamp\(24px,2\.4vw,32px\)/);
  assert.match(css, /\.drawer-tray\.project-open \.project-rolodex\{\s*display:grid!important;\s*flex:1 1 auto!important/);
  assert.match(css, /\.drawer-tray\.relationship-open \.relationship-v1-panel\.active\{/);
  assert.match(css, /\.drawer-tray\.timeline-open \.transcript-index,\s*\.drawer-tray\.timeline-open \.transcript-detail-panel\{\s*padding:var\(--function-inner-gutter\)!important/);
  assert.match(css, /\.drawer-tray\.correspondence-open \.correspondence-queue,\s*\.drawer-tray\.correspondence-open \.correspondence-thread/);
});

test('Executive Inbox converts HTML found in either email body field to readable text', () => {
  assert.match(js, /function correspondenceReadableEmailBody\(body = '', bodyHtml = ''\)/);
  assert.match(js, /bodyContainsMarkup/);
  assert.match(js, /p\.textContent = correspondenceReadableEmailBody\(message\.body, message\.bodyHtml\)/);
  assert.doesNotMatch(js, /p\.textContent = message\.body \|\| correspondenceReadableTextFromHtml/);
});
