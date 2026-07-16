const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const test=require('node:test');

const root=path.join(__dirname,'..');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
const html=fs.readFileSync(path.join(root,'witnessing-packet-map-react.html'),'utf8');
const react=fs.readFileSync(path.join(root,'witnessing-packet-map-react.js'),'utf8');

test('Witnessing packet map exposes live packet contracts without exposing source content',()=>{
  assert.match(server,/function buildWitnessingPacketArchitectureMap\(\)/);
  assert.match(server,/app\.get\('\/api\/val\/architecture\/witnessing-packet-map'/);
  assert.match(server,/listTeachValWitnessingSourceMemory/);
  assert.match(server,/listTeachValCoreMemory/);
  assert.match(server,/Krisp receipts from the most recent 30 days/);
  assert.match(server,/inherited_from_selected_upstream_packet/);
  assert.match(server,/DEFAULT_OBSERVERS\.map/);
});

test('React architecture map renders the contract endpoint and direct versus inherited packet states',()=>{
  assert.match(html,/type="module"/);
  assert.match(html,/witnessing-packet-map-react\.js/);
  assert.match(react,/react@18/);
  assert.match(react,/\/api\/val\/architecture\/witnessing-packet-map/);
  assert.match(react,/Direct shared root/);
  assert.match(react,/Inherited upstream context/);
  assert.match(react,/does not reveal your Witnessing answers, source content, or relationship data/);
});
