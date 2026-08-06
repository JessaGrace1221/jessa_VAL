const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
const hearth=fs.readFileSync(path.join(root,'hearth-prototype.js'),'utf8');
const dashboard=fs.readFileSync(path.join(root,'dashboard.html'),'utf8');

test('executive timezone is durable and governs the system clock',()=>{
  assert.match(server,/async function saveExecutiveTimezone/);
  assert.match(server,/app\.post\('\/api\/val\/preferences\/timezone'/);
  assert.match(server,/currentBoardBriefingSlot\(\{now,timeZone:executiveTimeZone\(\)\}\)/);
  assert.match(server,/outlook\.timezone="\$\{executiveTimeZone\(\)\}"/);
});

test('timezone selector appears in VAL Setup and dashboard settings',()=>{
  assert.match(hearth,/data-val-executive-timezone/);
  assert.match(hearth,/greetings, calendars, scheduled work, and Board briefings/);
  assert.match(dashboard,/id="babyStudioTimezone"/);
});
