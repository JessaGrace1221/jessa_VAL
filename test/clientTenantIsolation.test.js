const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const server = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
const hearthHtml = fs.readFileSync(path.join(root, 'hearth-prototype.html'), 'utf8');
const hearthJs = fs.readFileSync(path.join(root, 'hearth-prototype.js'), 'utf8');

test('client release excludes Jessa private witnessing data', () => {
  assert.equal(
    fs.existsSync(path.join(root, 'data', 'jessa-real-witnessing-session-2026-07-06.json')),
    false,
  );
});

test('client release derives owner and known aliases from tenant configuration', () => {
  assert.doesNotMatch(server, /const SIDEBAR_SELF_CALENDAR_EMAILS=new Set\(\['jessa@/);
  assert.match(server, /VAL_KNOWN_RELATIONSHIP_ALIASES_JSON/);
  assert.match(server, /const SIDEBAR_SELF_CALENDAR_EMAILS=new Set\(OWNER_EMAILS\)/);
});

test('client release blocks direct data-directory access', () => {
  assert.match(server, /app\.use\('\/data',\(_req,res\)=>res\.sendStatus\(404\)\)/);
});

test('home perspective waits for the configured tenant identity', () => {
  assert.doesNotMatch(hearthHtml, /id="hearth-title">[^<]*Jessa/);
  assert.match(hearthJs, /clientDisplayName = String\(config\?\.clientName\|\|''\)\.trim\(\)/);
  assert.match(hearthJs, /hydrateClientConfig\(\)\.finally\(\(\) => hydrateHomePresence\(\)\)/);
});
