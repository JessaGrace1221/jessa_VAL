const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const server=fs.readFileSync(path.join(__dirname,'..','server.js'),'utf8');
const docs=fs.readFileSync(path.join(__dirname,'..','docs','AI_COST_GOVERNANCE.md'),'utf8');

test('routes routine VAL work to bounded models',()=>{
  assert.match(server,/OPENAI_CHAT_MODEL = process\.env\.VAL_CHAT_MODEL \|\| 'gpt-5\.6-luna'/);
  assert.match(server,/OPENAI_EXTRACTION_MODEL = process\.env\.VAL_EXTRACTION_MODEL \|\| 'gpt-5-nano'/);
  assert.match(server,/OPENAI_DEEP_REVIEW_MODEL = process\.env\.VAL_DEEP_REVIEW_MODEL \|\| 'gpt-5\.6-terra'/);
  assert.match(server,/task==='extraction'\?OPENAI_EXTRACTION_MODEL/);
  assert.match(server,/task==='deep_review'\?'deep_review'/);
  assert.doesNotMatch(server,/OPENAI_CHAT_MODEL = process\.env\.VAL_CHAT_MODEL \|\| 'gpt-5\.6-sol'/);
});

test('requires explicit approval and configuration for Deep Review',()=>{
  assert.match(server,/VAL_AI_DEEP_REVIEW_ENABLED/);
  assert.match(server,/selectedLane==='deep_review'&&!deepReviewApproved/);
  assert.match(server,/Deep Review requires explicit user approval/);
  assert.match(docs,/There is\s+no automatic escalation to Terra or Sol\./);
});

test('persists lane and global cost reservations before paid calls',()=>{
  assert.match(server,/create table if not exists val_ai_daily_lane_usage/);
  assert.match(server,/reserved_cost_micros/);
  assert.match(server,/spent_cost_micros/);
  assert.match(server,/VAL_AI_DAILY_HARD_USD[^;]*1\.50/);
  assert.match(server,/VAL_AI_INTERACTIVE_DAILY_SOFT_USD[^;]*0\.75/);
  assert.match(server,/VAL_AI_INTERACTIVE_DAILY_HARD_USD[\s\S]*1\.40/);
  assert.match(server,/VAL_AI_BOARD_DAILY_HARD_USD[\s\S]*0\.10/);
  assert.match(server,/spent_cost_micros\+val_ai_daily_usage\.reserved_cost_micros\+\$3 <= \$5/);
});

test('exposes an inspectable daily budget receipt',()=>{
  assert.match(server,/app\.get\('\/api\/val\/ai-budget'/);
  assert.match(server,/softWarning:/);
  assert.match(server,/globalHardBudgetUsd:VAL_AI_DAILY_HARD_USD/);
  assert.match(server,/\[val-ai-usage\]/);
});

test('the scheduled Board uses Nano while the Chief uses Luna in the Board lane',()=>{
  assert.match(server,/model:OPENAI_OBSERVER_MODEL/);
  assert.match(server,/lane:'board'/);
  assert.match(server,/callModel:args=>callValModel\(\{\.\.\.args,lane:'board'\}\)/);
  assert.match(server,/VAL_AI_BOARD_DAILY_CALL_LIMIT[^;]*45/);
});

test('bounded responses retry once without escaping cost accounting',()=>{
  assert.match(server,/function valAiReasoningEffort/);
  assert.match(server,/if\(!omitTemperature&&!reasoningEffort\)body\.temperature=temperature/);
  assert.match(server,/if\(reason==='max_output_tokens'\)/);
  assert.match(server,/const retryMaxTokens=Math\.min\(12000/);
  assert.match(server,/await accountResponse\(d\)/);
  assert.match(server,/await accountResponse\(retry\)/);
  assert.match(server,/VAL could not finish the response within its protected output limit/);
});
