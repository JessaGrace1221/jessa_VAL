const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createValBoardPacketsService,BOARD_OBSERVERS,BOARD_SOURCE_REGISTRY}=require('../services/valBoardPackets');
const {VAL_BOARD_PACKETS_SQL}=require('../services/valBoardPacketsSchema');

const root=path.join(__dirname,'..');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
const routes=fs.readFileSync(path.join(root,'services','valBoardPacketsRoutes.js'),'utf8');
const frontend=fs.readFileSync(path.join(root,'hearth-prototype.js'),'utf8');

test('Board packet schema and routes are mounted',()=>{
  assert.match(VAL_BOARD_PACKETS_SQL,/create table if not exists val_board_packets/);
  assert.match(VAL_BOARD_PACKETS_SQL,/route_observers_json jsonb/);
  assert.match(VAL_BOARD_PACKETS_SQL,/primary_observers_json jsonb/);
  assert.match(server,/ensureValBoardPacketTables/);
  assert.match(server,/registerValBoardPacketsRoutes/);
  assert.match(routes,/\/api\/val\/board\/packets/);
  assert.match(routes,/\/api\/val\/board\/context/);
  assert.match(routes,/\/api\/val\/board\/sources/);
});

test('Board packet service routes each packet to every observer with primary lenses marked',async()=>{
  let store={};
  const service=createValBoardPacketsService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    uuid:prefix=>`${prefix}_test`,
    tenantId:()=>'tenant',
    userId:()=>'user',
    logger:{log(){}}
  });

  const packet=await service.createPacket({
    sourceType:'email',
    sourceId:'email_1',
    packetType:'reply_pressure_packet',
    title:'Michelle reply',
    summary:'Michelle needs a reply.'
  });

  assert.equal(packet.prototype,false);
  assert.equal(packet.routeObserversJson.length,BOARD_OBSERVERS.length);
  assert.deepEqual(packet.routeObserversJson.map(route=>route.observerName),BOARD_OBSERVERS);
  assert.ok(packet.primaryObserversJson.includes('Executive Inbox'));
  assert.ok(packet.primaryObserversJson.includes('Relationship'));
  assert.ok(packet.primaryObserversJson.includes('Capacity'));
  assert.ok(packet.routeObserversJson.every(route=>route.reason));
});

test('Board source registry names live and pending sources so VAL cannot overclaim',()=>{
  const byType=Object.fromEntries(BOARD_SOURCE_REGISTRY.map(source=>[source.sourceType,source]));
  for(const sourceType of ['email','transcript','calendar_event','witnessing','cowork','external_action','home_email_action']){
    assert.equal(byType[sourceType]?.status,'live',sourceType);
    assert.ok(byType[sourceType]?.hook,sourceType);
  }
  for(const sourceType of ['sms','linkedin_visibility','document','task','relationship_profile','project_profile','public_research','ghl_voice']){
    assert.equal(byType[sourceType]?.status,'pending',sourceType);
    assert.ok(byType[sourceType]?.claim,sourceType);
  }
});

test('Board source readiness calculates honest claim boundaries from packet records',async()=>{
  let store={};
  const service=createValBoardPacketsService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    uuid:prefix=>`${prefix}_test`,
    tenantId:()=>'tenant',
    userId:()=>'user',
    logger:{log(){}}
  });
  await service.recordEmailSync({savedMessages:[{messageId:'e1',subject:'Intro',bodyPreview:'Please send the intro.',direction:'inbound'}]});
  await service.recordWitnessingAnswer({id:'w1',category:'identity',rawResponse:'I need VAL to protect my judgment.'});
  const readiness=await service.sourceReadiness();
  assert.equal(readiness.summary.claimAllSourcesSafe,false);
  assert.ok(readiness.summary.live>0);
  assert.ok(readiness.summary.pending>0);
  assert.ok(readiness.sources.find(source=>source.sourceType==='email').packetCount>0);
  assert.ok(readiness.sources.find(source=>source.sourceType==='witnessing').packetCount>0);
  assert.equal(readiness.sources.find(source=>source.sourceType==='sms').claimSafe,false);
});

test('email, transcript, calendar, Witnessing, and Co-Work sources create live non-prototype Board packets',async()=>{
  let store={};
  const service=createValBoardPacketsService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    uuid:prefix=>`${prefix}_${Math.random().toString(36).slice(2,8)}`,
    tenantId:()=>'tenant',
    userId:()=>'user',
    logger:{log(){}}
  });

  await service.recordEmailSync({savedMessages:[{
    provider:'gmail',
    messageId:'g1',
    threadId:'t1',
    direction:'inbound',
    subject:'Can you review this?',
    bodyPreview:'Please review and confirm the next follow-up.'
  }]});
  await service.recordTranscriptProcessed({
    sourceId:'tr1',
    title:'GOALL meeting',
    summary:{executiveSummary:'GOALL needs a clearer payment decision.'},
    analysis:{keyDecisions:['Payment structure needs review.']},
    stagedTasks:[{title:'Draft payment options'}]
  });
  await service.recordCalendarEvent({id:'cal1',title:'Michelle follow-up',startTime:'2026-07-24T14:00:00Z'});
  await service.recordWitnessingAnswer({id:'wit1',category:'capacity',rawResponse:'I need clean tradeoffs before I decide.'});
  await service.recordCoworkEvent({sessionId:'cow1',entrypointId:'board.capacity',summary:'Capacity explored payment tradeoffs.'});

  const packets=await service.listPackets({limit:80});
  assert.ok(packets.length>=10);
  assert.ok(packets.every(packet=>packet.prototype===false));
  assert.ok(packets.some(packet=>packet.sourceType==='email'));
  assert.ok(packets.some(packet=>packet.sourceType==='transcript'));
  assert.ok(packets.some(packet=>packet.sourceType==='calendar_event'));
  assert.ok(packets.some(packet=>packet.sourceType==='witnessing'));
  assert.ok(packets.some(packet=>packet.sourceType==='cowork'));

  const context=await service.boardContext({limit:80,observerName:'Delight'});
  assert.equal(context.observers.length,BOARD_OBSERVERS.length);
  assert.ok(context.sources.length>=BOARD_SOURCE_REGISTRY.length);
  assert.equal(context.sourceSummary.claimAllSourcesSafe,false);
  assert.ok(context.livePacketCount>0);
  assert.ok(context.byObserver.Delight.length>0);
});

test('Board front end prefers live Board context over prototype packets',()=>{
  assert.match(frontend,/loadLiveObserverBoardContext/);
  assert.match(frontend,/observerBoardConnectionsFromPackets/);
  assert.match(frontend,/observerBoardState\.livePackets/);
  assert.match(frontend,/observerBoardState\.sourceSummary/);
  assert.match(frontend,/Holding space for Analytical and Relational Context/);
});
