const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const server=fs.readFileSync(path.join(__dirname,'..','server.js'),'utf8');

test('public static hosting blocks backend source and repository internals',()=>{
  const guard=server.indexOf("const privateRootFile=/^(?:server\\.js");
  const staticMount=server.indexOf('app.use(express.static(__dirname));');
  assert.ok(guard>=0&&guard<staticMount);
  assert.match(server,/package\(\?:-lock\)\?\\\.json/);
  assert.match(server,/\(\?:services\|test\|tests\|docs\|data\|scripts\|node_modules\|\\\.git\)/);
  assert.match(server,/return res\.status\(404\)\.type\('text'\)\.send\('Not found'\)/);
});
