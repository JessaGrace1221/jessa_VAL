'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {registerValBoardPacketsRoutes}=require('../services/valBoardPacketsRoutes');

const root=path.join(__dirname,'..');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');

function sourceBetween(startMarker,endMarker){
  const start=server.indexOf(startMarker);
  assert.notEqual(start,-1,`Missing start marker: ${startMarker}`);
  const end=server.indexOf(endMarker,start+startMarker.length);
  assert.notEqual(end,-1,`Missing end marker: ${endMarker}`);
  return server.slice(start,end);
}

function requireCanonicalIngress(name,body,sourceType){
  assert.match(body,/processCanonicalBoardEvidence\(\{/i,`${name} does not use canonical source intake`);
  if(sourceType)assert.match(body,new RegExp(`sourceType:\\s*['"]${sourceType}['"]`),`${name} does not preserve ${sourceType}`);
}

test('every live evidence family has a named canonical ingress path',()=>{
  const witnessing=sourceBetween(
    "app.post('/api/teach-val/onboarding/:id/witnessing-cards/:cardId'",
    "app.post('/api/teach-val/onboarding/:id/witnessing-cards/:cardId/confirm'"
  );
  requireCanonicalIngress('Witnessing answer',witnessing,'witnessing');

  const witnessingConfirmation=sourceBetween(
    "app.post('/api/teach-val/onboarding/:id/witnessing-cards/:cardId/confirm'",
    "app.patch('/api/teach-val/onboarding/:id/imports/:importId/items/:itemId'"
  );
  requireCanonicalIngress('Witnessing confirmation',witnessingConfirmation,'witnessing');

  const witnessingCompletion=sourceBetween(
    "app.post('/api/teach-val/onboarding/:id/commit'",
    "app.post('/api/demo/reset'"
  );
  requireCanonicalIngress('Witnessing completion',witnessingCompletion,'witnessing');

  requireCanonicalIngress(
    'Historical transcript, email, calendar, task, relationship, and project reconciliation',
    sourceBetween('async function backfillBoardPackets','async function backfillValIntelligence')
  );
  requireCanonicalIngress(
    'Public research',
    sourceBetween('async function recordPublicResearchBoardEvent',"app.post('/api/val/leads/research'")
  ,'public_research');
  requireCanonicalIngress(
    'SMS',
    sourceBetween('async function recordGhlConversationMessagesForBoard',"app.get('/api/ghl/conversations'")
  ,'sms');
  requireCanonicalIngress(
    'Task lifecycle',
    sourceBetween('async function recordTaskLifecycleForBoard','async function saveTask')
  ,'task');
  requireCanonicalIngress(
    'Draft lifecycle',
    sourceBetween('async function recordInternalDraftBoardEvent','async function saveInternalDraft')
  ,'draft');
  requireCanonicalIngress(
    'LinkedIn draft lifecycle',
    sourceBetween('async function recordInternalDraftBoardEvent','async function saveInternalDraft')
  ,'linkedin_visibility');
  requireCanonicalIngress(
    'Relationship and project profiles',
    sourceBetween('async function recordRelationshipProfileBoardPacket','async function saveRelationshipProfile')
  );
  requireCanonicalIngress(
    'VAL calendar events',
    sourceBetween('async function saveValCalendarEvent','async function fetchValCalendarEvents')
  ,'calendar_event');
  requireCanonicalIngress(
    'Transcript processing',
    sourceBetween('async function processTranscriptPayload','function transcriptUiRecord')
  ,'transcript');
  requireCanonicalIngress(
    'Co-Work, GHL text, and GHL voice conversations',
    sourceBetween('async function recordValConversationTurnPacket','valEnvelopes = registerValEnvelopesRoutes')
  );
  requireCanonicalIngress(
    'External action lifecycle',
    sourceBetween('async function processExternalActionBoardEvidence','const valCanonicalWork=')
  ,'external_action');

  const serviceRegistration=sourceBetween('const valCanonicalWork=','registerValExecutiveInstructionRoutes(app');
  requireCanonicalIngress('Email sync',serviceRegistration,'email');
  requireCanonicalIngress('Meeting Prep research',serviceRegistration);
  requireCanonicalIngress('Commitment lifecycle',serviceRegistration,'task');
  requireCanonicalIngress('Document use and processing',serviceRegistration,'document');
  requireCanonicalIngress('Prepared artifacts',serviceRegistration,'draft');
  requireCanonicalIngress('Co-Work lifecycle',serviceRegistration,'cowork');
});

test('canonical source delivery creates Board packets before Observer intelligence is queued',()=>{
  const delivery=sourceBetween('async function deliverCanonicalSourceToBoard','const valTranscriptSourceProcessing=');
  assert.match(delivery,/valBoardPackets\?\.createPackets/);
  assert.match(delivery,/sourceProcessingRecordId:record\.id/);
  assert.match(delivery,/sourceFingerprint:record\.sourceFingerprint/);
  assert.match(delivery,/sourceVersion:record\.sourceVersion/);
  assert.match(delivery,/queueBoardIntelligenceForPackets\(packets,/);
});

test('live Board routes reject any attempt to bypass canonical source processing',async()=>{
  const routes={};
  const app={
    get(){},
    post(route,handler){routes[route]=handler;}
  };
  registerValBoardPacketsRoutes(app,{
    service:{},
    valDbReady:async()=>{}
  });

  const handler=routes['/api/val/board/events/:sourceType'];
  assert.equal(typeof handler,'function');
  let statusCode=200;
  let payload=null;
  await handler(
    {params:{sourceType:'email'},body:{id:'email-1',body:'Grounded source text'}},
    {
      status(code){statusCode=code;return this;},
      json(value){payload=value;return value;}
    }
  );
  assert.equal(statusCode,503);
  assert.equal(payload.ok,false);
  assert.match(payload.error,/cannot bypass source processing/i);
});

test('live Board event ingress requires identity and readable evidence',async()=>{
  const routes={};
  const app={
    get(){},
    post(route,handler){routes[route]=handler;}
  };
  let canonicalCalls=0;
  registerValBoardPacketsRoutes(app,{
    service:{},
    valDbReady:async()=>{},
    processSourceEvent:async()=>{canonicalCalls++;return {};}
  });

  let statusCode=200;
  let payload=null;
  await routes['/api/val/board/events/:sourceType'](
    {params:{sourceType:'email'},body:{id:'email-1'}},
    {
      status(code){statusCode=code;return this;},
      json(value){payload=value;return value;}
    }
  );
  assert.equal(statusCode,400);
  assert.equal(canonicalCalls,0);
  assert.match(payload.error,/readable source text/i);
});
