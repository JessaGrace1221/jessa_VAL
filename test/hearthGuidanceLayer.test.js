const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'hearth-prototype.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'hearth-prototype.css'), 'utf8');
const js = fs.readFileSync(path.join(root, 'hearth-prototype.js'), 'utf8');

test('Home exposes one persistent system-wide Guidance preference', () => {
  assert.match(html, /data-val-guidance-toggle/);
  assert.match(html, /data-val-guidance-tooltip/);
  assert.match(js, /VAL_GUIDANCE_STORAGE_KEY = 'val\.ui\.guidance\.enabled\.v1'/);
  assert.match(js, /window\.localStorage\.setItem\(VAL_GUIDANCE_STORAGE_KEY/);
  assert.match(js, /initValGuidanceLayer\(\);/);
});

test('Guidance explains the executive consequence of every signature function', () => {
  [
    'Board of Observers',
    'Alignment',
    'Leverage',
    'Executive Functions',
    'Executive Inbox',
    'Project Managers',
    'Stewardship',
    'Transcripts',
    'Lead Intelligence',
    'VAL Studio',
    'Co-Work with VAL'
  ].forEach((label) => assert.match(js, new RegExp(`title:'${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`)));
  assert.match(js, /function valGuidanceFallback/);
  assert.match(js, /\.living-room/);
  assert.match(js, /\[data-correspondence-item\]/);
  assert.match(js, /\[data-transcript-open\]/);
  assert.match(js, /\[data-project-open-profile\]/);
  assert.match(js, /\[data-relationship-open-profile\]/);
});

test('Guidance works through hover, keyboard focus, and deliberate touch', () => {
  assert.match(js, /document\.addEventListener\('pointerover'/);
  assert.match(js, /document\.addEventListener\('focusin'/);
  assert.match(js, /element\.setAttribute\('aria-describedby',tooltip\.id\)/);
  assert.match(js, /event\.pointerType !== 'touch'/);
  assert.match(js, /repeatTouchExpires = now \+ 5000/);
  assert.match(js, /event\.preventDefault\(\);[\s\S]*event\.stopImmediatePropagation\(\);/);
  assert.match(html, /Tap again to continue\./);
});

test('Guidance remains readable and out of the way on mobile', () => {
  assert.match(css, /\.val-guidance-tooltip\{/);
  assert.match(css, /@media\(max-width:720px\)\{[\s\S]*\.val-guidance-tooltip\{[\s\S]*safe-area-inset-bottom/);
  assert.match(css, /z-index:50000/);
  assert.match(css, /pointer-events:none/);
  assert.match(css, /\.val-guidance-enabled \[data-tooltip\]::after/);
});
