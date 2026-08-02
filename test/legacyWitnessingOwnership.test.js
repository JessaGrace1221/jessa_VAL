const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const server = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');

test('configured owner can reclaim legacy tenant-scoped Witnessing records', () => {
  assert.match(server, /function currentOwnerMayClaimLegacyWitnessing\(\)/);
  assert.match(server, /String\(user\.role\|\|''\)\.toLowerCase\(\)!=='owner'/);
  assert.match(server, /configured\.includes\(String\(user\.email\|\|''\)\.trim\(\)\.toLowerCase\(\)\)/);
  assert.match(server, /const legacyUserId=tenant/);
  assert.match(server, /update \$\{table\} set user_id=\$1 where tenant_id=\$2 and user_id=\$3/);
});

test('every Witnessing read path repairs legacy ownership before selecting a session', () => {
  assert.match(server, /async function getTeachValSession\(id=''\)\{[\s\S]*?await reclaimLegacyTenantWitnessingForCurrentOwner\(\)/);
  assert.match(server, /async function getTeachValWitnessingResumeSession\(\)\{[\s\S]*?await reclaimLegacyTenantWitnessingForCurrentOwner\(\)/);
  assert.match(server, /async function getTeachValCompletedWitnessingSession\(\)\{[\s\S]*?await reclaimLegacyTenantWitnessingForCurrentOwner\(\)/);
});
