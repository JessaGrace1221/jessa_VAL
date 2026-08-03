const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'hearth-prototype.css'), 'utf8');
const html = fs.readFileSync(path.join(root, 'hearth-prototype.html'), 'utf8');

test('production shell fingerprints the mobile operating contract', () => {
  assert.match(html, /hearth-prototype\.css\?v=mark-goall-linkedin-dismiss-20260803/);
  assert.match(html, /hearth-prototype\.js\?v=mark-goall-linkedin-dismiss-20260803/);
});

test('mobile functions use one fixed viewport and one vertical scroll owner', () => {
  assert.match(css, /VAL mobile operating contract: one viewport, one scroll owner/);
  assert.match(css, /\.hearth-shell \.desk-workspace\[aria-hidden="false"\][\s\S]*inset:var\(--val-mobile-edge\)!important/);
  assert.match(css, /> \.source-detail\[aria-hidden="false"\][\s\S]*overflow-y:auto!important/);
  assert.match(css, /\.source-detail-header\{[\s\S]*position:sticky!important/);
});

test('mobile cowork and prepared work do not trap content behind fixed chat controls', () => {
  assert.match(css, /\.alignment-room,[\s\S]*\.leverage-room,[\s\S]*overflow:visible!important/);
  assert.match(css, /\.desk-workspace\.home-cowork-mode \.workspace-input-panel\{[\s\S]*position:relative!important/);
  assert.match(css, /\.leverage-draft-review textarea\{[\s\S]*max-height:none!important/);
});

test('mobile Studio, Board, calendar, and executive drawers collapse safely', () => {
  assert.match(css, /\.scraper-preview-list\.val-studio-surface,[\s\S]*overflow:visible!important/);
  assert.match(css, /\.observer-card-slot,[\s\S]*position:fixed!important/);
  assert.match(css, /\.full-calendar-panel \.calendar-panel-inner\{[\s\S]*env\(safe-area-inset-bottom\)/);
  assert.match(css, /\.drawer-tray\.correspondence-open \.correspondence-email-html :is\(img,table\)/);
});

test('mobile Executive Functions compass stays inside the phone viewport', () => {
  assert.match(css, /\.retrieval-system\.open:not\(\[data-active-drawer\]\) \.drawer-tray\{[\s\S]*height:calc\(100dvh - 54px\)!important/);
  assert.match(css, /\.retrieval-system\.open:not\(\[data-active-drawer\]\) \.project-drawer-link\{[\s\S]*--node-x:-148px/);
  assert.match(css, /\.retrieval-system\.open:not\(\[data-active-drawer\]\) \.source-drawer-link\{[\s\S]*--node-x:148px/);
});
