'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.join(__dirname,'..');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
const hearth=fs.readFileSync(path.join(root,'hearth-prototype.js'),'utf8');

function homeTranscriptHelpers(overrides={}){
  const start=server.indexOf('function homeValTranscriptDateRange');
  const end=server.indexOf('function stableRecoveredTranscriptId',start);
  assert.ok(start>0&&end>start,'Home transcript helpers must remain inspectable');
  const sandbox={
    safeArray:value=>Array.isArray(value)?value:[],
    normalizeContextName:value=>String(value||'').toLowerCase().replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim(),
    transcriptArchiveRecords:async()=>[],
    transcriptIndexData:async()=>({transcripts:[],participants:[],summaries:[],tasks:[],contactUpdates:[],actionLog:[]}),
    mergeTranscriptMigrationRecords:records=>records,
    transcriptDetailFromIndex:()=>({}),
    saveInternalDraft:async draft=>draft,
    stableKey:value=>String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,'-'),
    console,
    ...overrides
  };
  vm.runInNewContext(`${server.slice(start,end)}\nthis.helpers={homeValTranscriptDateRange,homeValTranscriptArchiveContext,homeValTranscriptCompilationRequested,prepareHomeValTranscriptCompilation};`,sandbox);
  return sandbox.helpers;
}

test('Home Co-Work preserves the server conversation id across follow-up turns',()=>{
  assert.match(hearth,/let homeCoworkConversationId = '';/);
  assert.match(hearth,/conversationId: homeCoworkConversationId \|\| undefined/);
  assert.match(hearth,/homeCoworkConversationId = result\.conversationId \|\| homeCoworkConversationId/);
  assert.match(server,/const priorMessages=requestedConversationId\?await conversationMessagesForContext\(requestedConversationId,14\):\[\]/);
  assert.match(server,/const messages=mergeConversationMessages\(priorMessages,incomingMessages,18\)/);
});

test('Home transcript retrieval honors date and participant evidence instead of mentions',async()=>{
  const records=[
    {id:'with-michele',title:'Book work with Michele Julian',createdAt:'2026-04-10T14:00:00Z',rawText:'We restarted at Chapter 1.',attendees:[{name:'Michele Julian'}]},
    {id:'mentions-michele',title:'Internal planning',createdAt:'2026-05-10T14:00:00Z',rawText:'We discussed Michele Julian and her book.',attendees:[{name:'Alex Rivera'}]},
    {id:'outside-range',title:'Book work with Michele Julian',createdAt:'2026-02-10T14:00:00Z',rawText:'Earlier book work.',attendees:[{name:'Michele Julian'}]}
  ];
  const index={transcripts:[],participants:[{transcriptId:'with-michele',matchedContactName:'Michele Julian'},{transcriptId:'outside-range',matchedContactName:'Michele Julian'}],summaries:[],tasks:[],contactUpdates:[],actionLog:[]};
  const helpers=homeTranscriptHelpers({
    transcriptArchiveRecords:async()=>records,
    transcriptIndexData:async()=>index
  });
  const result=await helpers.homeValTranscriptArchiveContext('Compile transcripts with Michele Julian from March 1st 2026 until August 1st 2026, especially book editing and Chapter 1.');
  assert.equal(result.range.label,'March 1, 2026 through August 1, 2026');
  assert.deepEqual([...result.participantNames],['Michele Julian']);
  assert.deepEqual(Array.from(result.matches,record=>record.id),['with-michele']);
  assert.match(result.prompt,/Participant evidence: Michele Julian/);
  assert.doesNotMatch(result.prompt,/Internal planning/);
});

test('Home transcript compilation creates one private Leverage document with full source text',async()=>{
  let saved=null;
  const helpers=homeTranscriptHelpers({saveInternalDraft:async draft=>(saved=draft)});
  const context={
    range:{start:new Date('2026-03-01T00:00:00Z'),end:new Date('2026-08-01T23:59:59Z'),label:'March 1, 2026 through August 1, 2026'},
    participantNames:['Michele Julian'],
    matches:[{id:'book-1',title:'Chapter 1 restart',rawText:'The complete source transcript.',_date:new Date('2026-04-10T14:00:00Z'),_participantEvidence:['Michele Julian']}]
  };
  await helpers.prepareHomeValTranscriptCompilation(context,'Start the compilation.');
  assert.equal(saved.draftType,'document_compilation');
  assert.equal(saved.provider,'internal');
  assert.equal(saved.status,'draft');
  assert.match(saved.body,/The complete source transcript\./);
  assert.equal(saved.sourceContext.noExternalAction,true);
  assert.deepEqual(Array.from(saved.sourceContext.transcriptIds),['book-1']);
});

test('Home full-context prompt names the canonical transcript archive and current tenant date',()=>{
  assert.match(server,/Direct transcript archive search results/);
  assert.match(server,/Current date in the executive's timezone/);
  assert.match(server,/never substitute meetings where the person was merely discussed/);
  assert.match(server,/placed it in Leverage for review/);
});
