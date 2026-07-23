const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('Mark deployment exposes the pipeline command room flag', () => {
  const server = read('server.js');
  assert.match(server, /pipelineCommandRoom:\s*IS_MARK_GOALL_DEPLOYMENT/);
  assert.match(server, /pipelineDashboardUrl:/);
});

test('Hearth includes the Mark pipeline command room and call-center dashboard', () => {
  const html = read('hearth-prototype.html');
  const js = read('hearth-prototype.js');
  assert.match(html, /data-mark-pipeline-command-room/);
  assert.match(html, /GOALL call center/);
  assert.match(js, /hydrateMarkPipelineCommandRoom/);
  assert.match(js, /GOALL Strategic Partners/);
  assert.match(js, /GOALL Employers/);
});

test('Mark pipeline opportunities retain pipeline identity', () => {
  const server = read('server.js');
  assert.match(server, /pipelineId:o\.pipelineId/);
  assert.match(server, /pipelineName:o\.pipeline\?\.name/);
  assert.match(server, /opportunities\/pipelines\?locationId=/);
});
