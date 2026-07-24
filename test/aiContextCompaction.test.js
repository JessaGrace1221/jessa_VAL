const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
const audit=fs.readFileSync(path.join(root,'docs','AI_CONTEXT_COMPACTION_CONTRACT_2026-07-24.md'),'utf8');

test('AI context compaction runs every few days and keeps original receipts',()=>{
  assert.match(server,/const AI_CONTEXT_DIGEST_KIND='ai_context_digest'/);
  assert.match(server,/const AI_CONTEXT_COMPACTION_AFTER_DAYS=Math\.max\(1,Number\(process\.env\.VAL_AI_CONTEXT_COMPACTION_AFTER_DAYS\)\|\|3\)/);
  assert.match(server,/function compactAiUsableContext\(/);
  assert.match(server,/sourceFamily/);
  assert.match(server,/sourceIds/);
  assert.match(server,/keptOriginals:true/);
  assert.match(server,/Original source receipts are retained/);
  assert.match(server,/app\.post\('\/api\/val\/memory\/compact'/);
  assert.match(server,/setInterval\(\(\)=>condenseOlderMemory\(\).*AI_CONTEXT_COMPACTION_INTERVAL_MS/);
});

test('compaction includes Board packets plus memory so Observers stay light',()=>{
  assert.match(server,/from val_board_packets/);
  assert.match(server,/board_packet:\$\{packet\.packet_type\}/);
  assert.match(server,/primary_observers_json/);
  assert.match(server,/store\.valBoardPackets/);
  assert.match(server,/aiContextFamilyForRow/);
  assert.match(server,/ai_context_digest/);
});

test('compaction contract states what can and cannot be promised',()=>{
  [
    'Every three days by default',
    'No raw evidence is deleted by compaction',
    'Board packets are included',
    'Emails, transcripts, calendar, Witnessing, Co-Work, and external actions are live registered Board sources',
    'Pending source families still need packet hooks before VAL can honestly claim they are Board-live forever',
    'The digest is for speed; the source receipt is for truth'
  ].forEach((required)=>assert.ok(audit.includes(required),`Missing compaction contract: ${required}`));
});
