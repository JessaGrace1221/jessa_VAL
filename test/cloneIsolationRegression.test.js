const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');

test('shared runtime files do not embed Jessa account identity', () => {
  for(const relativePath of ['server.js', 'services/valMeetingPrep.js', 'hearth-prototype.js']){
    const source = fs.readFileSync(path.join(root, relativePath), 'utf8');
    assert.doesNotMatch(source, /jessa@(jessagrace|goallprogram|goalprogram)\.com|jessa\.grace@gmail\.com/i, relativePath);
  }
});

test('known relationship aliases are loaded from tenant configuration', () => {
  const server = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
  assert.match(server, /VAL_KNOWN_RELATIONSHIP_ALIASES_JSON/);
  assert.doesNotMatch(server, /realestatewitharic@gmail\.com|mikenonhof\.wealth@gmail\.com/i);
});
