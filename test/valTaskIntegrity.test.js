const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const server=fs.readFileSync(path.join(__dirname,'..','server.js'),'utf8');

function functionBlock(name,nextName){
  const start=server.indexOf(`async function ${name}`);
  const end=server.indexOf(`async function ${nextName}`,start+1);
  assert.ok(start>=0,`${name} was not found`);
  assert.ok(end>start,`${nextName} was not found after ${name}`);
  return server.slice(start,end);
}

test('task persistence never invents a due date and emits canonical lifecycle evidence',()=>{
  const block=functionBlock('saveTask','replaceTasks');
  assert.match(block,/task\.dueDate=task\.dueDate\|\|null/);
  assert.doesNotMatch(block,/Date\.now\(\)\+24\*60\*60\*1000/);
  assert.match(block,/recordTaskLifecycleForBoard/);
  assert.match(server,/source:'task_persistence'/);
  assert.match(server,/sourceType:'task'/);
});

test('canonical work and commitment lifecycle events use immutable source processing',()=>{
  const workStart=server.indexOf('const valCanonicalWork=registerValCanonicalWorkRoutes');
  const workEnd=server.indexOf('const valConversationIdentity',workStart);
  const workBlock=server.slice(workStart,workEnd);
  assert.match(workBlock,/processCanonicalBoardEvidence\(\{/);
  assert.match(workBlock,/source:'canonical_work_lifecycle'/);
  assert.doesNotMatch(workBlock,/recordSourceEvent\('task'/);

  const commitmentsStart=server.indexOf('const valCommitments = registerValCommitmentsRoutes');
  const commitmentsEnd=server.indexOf('const valDocuments = registerValDocumentsRoutes',commitmentsStart);
  const commitmentsBlock=server.slice(commitmentsStart,commitmentsEnd);
  assert.match(commitmentsBlock,/processCanonicalBoardEvidence\(\{/);
  assert.match(commitmentsBlock,/source:'commitment_lifecycle'/);
  assert.doesNotMatch(commitmentsBlock,/recordCommitmentEvent/);
});
