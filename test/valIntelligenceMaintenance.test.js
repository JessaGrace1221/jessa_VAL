const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {
  currentBoardBriefingSlot,
  nextBoardBriefingSlot
}=require('../services/valBoardBriefingSchedule');

const server=fs.readFileSync(path.join(__dirname,'..','server.js'),'utf8');
const routes=fs.readFileSync(path.join(__dirname,'..','services','valIntelligenceSpineRoutes.js'),'utf8');
const schema=fs.readFileSync(path.join(__dirname,'..','services','valIntelligenceSpineSchema.js'),'utf8');

test('Board briefing schedule selects only the current local-day slot',()=>{
  assert.equal(
    currentBoardBriefingSlot({
      now:new Date('2026-07-27T09:30:00.000Z'),
      timeZone:'America/New_York'
    }),
    null
  );
  assert.equal(
    currentBoardBriefingSlot({
      now:new Date('2026-07-27T10:30:00.000Z'),
      timeZone:'America/New_York'
    }).id,
    'morning'
  );
  assert.equal(
    currentBoardBriefingSlot({
      now:new Date('2026-07-27T17:15:00.000Z'),
      timeZone:'America/New_York'
    }).id,
    'midday'
  );
  assert.equal(
    currentBoardBriefingSlot({
      now:new Date('2026-07-27T22:15:00.000Z'),
      timeZone:'America/New_York'
    }).id,
    'evening'
  );
  assert.equal(
    nextBoardBriefingSlot({
      now:new Date('2026-07-27T15:00:00.000Z'),
      timeZone:'America/New_York'
    }).id,
    'midday'
  );
});

test('scheduled maintenance runs one claimed briefing and never retries model reasoning',()=>{
  const start=server.indexOf('async function runValIntelligenceMaintenance()');
  const end=server.indexOf('const HEARTH_PACKET_HYDRATION_REQUIREMENTS',start);
  assert.ok(start>=0&&end>start);
  const block=server.slice(start,end);
  assert.match(block,/await runScheduledBoardBriefingIfDue\(\)/);
  assert.doesNotMatch(block,/retryUndeliveredSources/);
  assert.doesNotMatch(block,/retryFailedIntelligenceRuns/);
  assert.doesNotMatch(block,/valBoardDeliveryQueue/);
  assert.match(schema,/unique \(tenant_id,user_id,local_date,briefing_slot\)/);
});

test('source intake queues packets without invoking Observer reasoning',()=>{
  const start=server.indexOf('function queueBoardIntelligenceForPackets');
  const end=server.indexOf('function conversationTurnSourceRefs',start);
  const block=server.slice(start,end);
  assert.match(block,/status:'queued_for_briefing'/);
  assert.doesNotMatch(block,/runIntelligencePass/);
  assert.doesNotMatch(block,/triggerBoardIntelligenceForPackets/);
  assert.match(server,/runObserverBatch:\(packets,event\)=>queueBoardIntelligenceForPackets/);
});

test('Board reasoning is capped at three nano briefings per local day',()=>{
  assert.match(server,/const OPENAI_OBSERVER_MODEL = process\.env\.VAL_OBSERVER_MODEL \|\| 'gpt-5-nano'/);
  assert.match(server,/VAL_BOARD_DAILY_OBSERVER_CALL_LIMIT = Math\.max\(14,Number\(process\.env\.VAL_BOARD_DAILY_OBSERVER_CALL_LIMIT\)\|\|42\)/);
  assert.match(server,/VAL_BOARD_PACKETS_PER_BRIEFING/);
  assert.match(server,/async function boardObserverDailyBudget\(localDate=''\)/);
  assert.match(server,/created_at at time zone \$3/);
  assert.match(server,/reason:'daily_observer_call_limit'/);
  assert.match(server,/schedule:\['06:00','12:00','17:00'\]/);
  assert.match(server,/async function callBoardNanoModel/);
  assert.match(server,/allowPlatformFallback:false/);
  assert.match(server,/allowCompatibilityRetries:false/);
  assert.match(server,/boardNanoUnavailableUntil/);
  assert.match(server,/callModel:callBoardNanoModel/);
});

test('manual Board passes and retries are closed in scheduled-only mode',()=>{
  assert.match(server,/scheduledOnly:true/);
  assert.match(routes,/if\(scheduledOnly\)return res\.status\(409\)/);
  assert.match(routes,/Automatic and manual Board retries are disabled/);
});
