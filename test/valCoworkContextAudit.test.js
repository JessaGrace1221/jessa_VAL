const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {COWORK_ENTRYPOINTS}=require('../services/valCowork');

const root=path.resolve(__dirname,'..');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
const hearth=fs.readFileSync(path.join(root,'hearth-prototype.js'),'utf8');
const audit=fs.readFileSync(path.join(root,'docs/VAL_COWORK_CONTEXT_AUDIT.md'),'utf8');

const expectedCanonicalEntries=[
  'project.overview','project.identity','project.onboarding','project.people',
  'project.documents','project.milestones','project.monitoring',
  'project.relationship_nurture','project.why_it_matters','project.risk',
  'project.narrative','project.needs_next','project.sop','project.phase',
  'project.prepared_work','project.workstreams','project.next_move',
  'transcript.working_brief','transcript.action_item','email.thread',
  'relationship.overview','relationship.section','observer.discussion',
  'board.chief_of_staff'
];

test('all canonical Co-Work entries declare their context packets',()=>{
  assert.deepEqual(Object.keys(COWORK_ENTRYPOINTS).sort(),expectedCanonicalEntries.sort());
  for(const id of expectedCanonicalEntries){
    const entry=COWORK_ENTRYPOINTS[id];
    assert.ok(entry.surface,`${id} needs a surface`);
    assert.ok(entry.scopeType,`${id} needs a scope`);
    assert.ok(entry.objective,`${id} needs an objective`);
    assert.ok(entry.completionCondition,`${id} needs a completion condition`);
    assert.ok(Array.isArray(entry.requiredPackets)&&entry.requiredPackets.length,`${id} needs required packets`);
    assert.match(audit,new RegExp(id.replace(/[.]/g,'\\.')),`${id} must be inspectable in the context audit`);
  }
});

test('Home, Alignment, Tasks, Meeting Prep, and Leverage preserve distinct context boundaries',()=>{
  assert.match(server,/only general VAL chat lane that may synthesize across Hearth, Executive Functions, the Board of Observers, memory, documents, CRM, calendar, email, and external action packets/);
  assert.match(hearth,/function homeCoworkSelectedSourceContext/);
  assert.match(hearth,/function selectedSourceContextFromCommitmentTask/);
  assert.match(hearth,/function meetingPrepHiddenEvidence/);
  assert.match(hearth,/function leverageReviewableQueueItems/);
  assert.match(hearth,/hasPreparedWorkPacketAndActionStatus\(sourceItem\)/);
  assert.match(audit,/Home VAL/);
  assert.match(audit,/Alignment Co-Work/);
  assert.match(audit,/Task Co-Work/);
  assert.match(audit,/Meeting Prep Co-Work/);
  assert.match(audit,/Leverage review/);
});

test('shared Co-Work model contract is direct, human, and forward-moving',()=>{
  assert.match(server,/Answer the executive\\'s exact question first in natural language/);
  assert.match(server,/point out the most useful pattern, tradeoff, risk, opportunity, or missing fact/);
  assert.match(server,/End with one clear forward-moving question or next move only when it helps/);
  assert.match(server,/Do not expose packet field names, schemas, JSON, backend processes, or internal retrieval language/);
  assert.match(server,/Sound like a thoughtful human collaborator: direct, specific, warm, and concise/);
  assert.match(server,/Do not make the user restate context already present in the Working Brief/);
});

test('all 14 Observer folders are named in the launch contract',()=>{
  [
    'Executive Inbox','Relationship','Project','Capacity','Courage','Delight',
    'Opportunity','Momentum','Meaning','Synchronicity','Commitment','Calendar',
    'Environment','Witnessing'
  ].forEach((name)=>assert.match(audit,new RegExp(`\\b${name}\\b`)));
  assert.match(audit,/Every source packet is reviewed by all 14 Observers/);
  assert.match(audit,/`observed` with evidence or `no meaningful signal`/);
});
