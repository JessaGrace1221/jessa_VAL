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
  assert.match(routes,/\/api\/val\/board\/events\/:sourceType/);
  assert.match(routes,/afterSourceEvent/);
  assert.match(server,/afterSourceEvent:async/);
  assert.match(server,/triggerBoardIntelligenceForPackets\(\[packet\],\{type:'source_event'/);
  const triggerStart=server.indexOf('async function triggerBoardIntelligenceForPackets');
  const triggerEnd=server.indexOf('function conversationTurnSourceRefs',triggerStart);
  const triggerSource=server.slice(triggerStart,triggerEnd);
  assert.ok(
    triggerSource.indexOf('enrichBoardPacketsWithModel') < triggerSource.indexOf('return valIntelligenceSpine.runIntelligencePass'),
    'Observer digestion must finish before the Chief of Staff intelligence spine runs.'
  );
});

test('Board packet service routes and digests each packet through every observer',async()=>{
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
  assert.equal(packet.payloadJson.observerReviews.length,BOARD_OBSERVERS.length);
  assert.ok(packet.payloadJson.observerReviews.some(review=>review.observerName==='Relationship'&&review.status==='observed'));
  assert.ok(packet.payloadJson.observerReviews.some(review=>review.status==='no_signal'));
  assert.ok(packet.payloadJson.observerReviews.every(review=>review.evidence.sourceType==='email'));
  const relationshipReview=packet.payloadJson.observerReviews.find(review=>review.observerName==='Relationship');
  assert.match(relationshipReview.lensFinding,/Michelle has a relationship signal worth inspecting/i);
  assert.ok(Array.isArray(relationshipReview.people));
  assert.ok(Array.isArray(relationshipReview.projects));
});

test('model-backed Observer reviews replace fallback reviews only with packet-grounded entities',async()=>{
  let store={};
  const service=createValBoardPacketsService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    tenantId:()=>'tenant-a',
    userId:()=>'user-a',
    logger:{log(){},warn(){}}
  });
  const packet=await service.createPacket({
    sourceType:'transcript',
    sourceId:'meeting-1',
    packetType:'relationship_packet',
    title:'GOALL dashboard handoff',
    summary:'Mike sounded frustrated when the GOALL dashboard handoff stayed vague.',
    sourceRefs:[{sourceType:'transcript',sourceId:'meeting-1',quoteOrSummary:'Mike sounded frustrated when the GOALL dashboard handoff stayed vague.',confidence:0.91}]
  });
  const reviews=BOARD_OBSERVERS.map(observerName=>({
    observerName,
    status:observerName==='Relationship'?'observed':'no_signal',
    lensFinding:observerName==='Relationship'?'Mike shows a possible repair signal after frustration in the GOALL handoff.':'',
    observation:observerName==='Relationship'?'Mike sounded frustrated when the GOALL dashboard handoff stayed vague.':'',
    people:observerName==='Relationship'?['Mike','Invented Person']:[],
    projects:observerName==='Relationship'?['GOALL','Invented Project']:[],
    decisionObjects:['dashboard handoff'],
    confidence:0.86
  }));
  const saved=await service.applyModelObserverReviews(packet.id,reviews);
  assert.equal(saved.payloadJson.observerReviewVersion,3);
  assert.equal(saved.payloadJson.observerReviewMode,'model_backed_observer_suite_v1');
  assert.equal(saved.payloadJson.observerReviews.length,BOARD_OBSERVERS.length);
  const relationship=saved.payloadJson.observerReviews.find(review=>review.observerName==='Relationship');
  assert.equal(relationship.status,'observed');
  assert.deepEqual(relationship.people,['Mike']);
  assert.deepEqual(relationship.projects,['GOALL']);
  assert.deepEqual(relationship.decisionObjects,['dashboard handoff']);
  assert.equal(saved.payloadJson.observerReviews.find(review=>review.observerName==='Capacity').status,'no_signal');
});

test('an incomplete model review suite cannot masquerade as a full Board review',async()=>{
  let store={};
  const service=createValBoardPacketsService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    tenantId:()=>'tenant-a',
    userId:()=>'user-a',
    logger:{log(){},warn(){}}
  });
  const packet=await service.createPacket({
    sourceType:'email',
    sourceId:'email-incomplete',
    title:'A real email packet',
    summary:'A real sender asked for a decision.'
  });
  await assert.rejects(
    service.applyModelObserverReviews(packet.id,[{
      observerName:'Relationship',
      status:'observed',
      lensFinding:'A relationship needs attention.',
      observation:'A real sender asked for a decision.'
    }]),
    /Observer suite was incomplete/
  );
  const saved=(await service.listPackets({limit:20})).find(item=>item.id===packet.id);
  assert.equal(saved.payloadJson.observerReviewVersion,2);
  assert.notEqual(saved.payloadJson.observerReviewMode,'model_backed_observer_suite_v1');
  assert.equal(saved.payloadJson.observerReviews.length,BOARD_OBSERVERS.length);
});

test('Board context exposes durable Witnessing completion instead of relying on browser state',async()=>{
  let store={};
  const service=createValBoardPacketsService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    uuid:prefix=>`${prefix}_witnessed`,
    tenantId:()=>'tenant',
    userId:()=>'user',
    getWitnessingCompletion:async()=>({
      complete:true,
      sessionId:'witnessing_complete_1',
      stage:'complete',
      answeredCount:12,
      nextStep:''
    }),
    logger:{log(){}}
  });

  await service.createPacket({
    sourceType:'witnessing',
    sourceId:'witnessing_complete_1',
    packetType:'identity_context_packet',
    title:'Witnessing truth',
    summary:'The user completed the Witnessing Session.'
  });

  const context=await service.boardContext();
  assert.equal(context.witnessingComplete,true);
  assert.equal(context.witnessingSessionId,'witnessing_complete_1');
  assert.equal(context.witnessingStatus,'complete');
  assert.equal(context.witnessingStage,'complete');
  assert.equal(context.witnessingAnsweredCount,12);
  assert.equal(context.livePacketCount,1);
});

test('Observer reviews preserve concrete named evidence for project-first executive context',async()=>{
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
    sourceType:'transcript',
    sourceId:'tr_goall_mike',
    packetType:'meeting_evidence_packet',
    title:'GOALL dashboard handoff with Mike',
    summary:'Mike sounded frustrated during the GOALL projections dashboard handoff. Jessa needs to finish the HTML iframe dashboard so the agency has a clean next step.',
    sourceRefs:[{
      sourceType:'transcript',
      sourceId:'tr_goall_mike',
      quoteOrSummary:'Mike sounded frustrated during the GOALL projections dashboard handoff. Jessa needs to finish the HTML iframe dashboard.',
      confidence:0.91
    }],
    payload:{projectName:'GOALL',managerColorName:'Taffy',relationships:[{name:'Mike'}]}
  });

  const relationshipReview=packet.payloadJson.observerReviews.find(review=>review.observerName==='Relationship');
  const projectReview=packet.payloadJson.observerReviews.find(review=>review.observerName==='Project');
  assert.equal(relationshipReview.status,'observed');
  assert.equal(projectReview.status,'observed');
  assert.ok(relationshipReview.people.includes('Mike'));
  assert.ok(projectReview.projects.includes('GOALL'));
  assert.ok(projectReview.decisionObjects.includes('dashboard handoff'));
  assert.match(relationshipReview.lensFinding,/Mike has a relationship signal worth inspecting/i);
  assert.match(projectReview.lensFinding,/GOALL.*dashboard handoff/i);
  assert.match(projectReview.observation,/Why this lens received it/i);
});

test('Board source registry separates automatic hooks from source-specific ingress',()=>{
  const byType=Object.fromEntries(BOARD_SOURCE_REGISTRY.map(source=>[source.sourceType,source]));
  for(const sourceType of ['email','transcript','calendar_event','witnessing','cowork','external_action','home_email_action']){
    assert.equal(byType[sourceType]?.status,'live',sourceType);
    assert.ok(byType[sourceType]?.hook,sourceType);
  }
  for(const sourceType of ['task','relationship_profile','project_profile','ghl_voice','ghl_text']){
    assert.equal(byType[sourceType]?.status,'live',sourceType);
    assert.ok(byType[sourceType]?.hook,sourceType);
    assert.ok(byType[sourceType]?.claim,sourceType);
  }
  for(const sourceType of ['sms','linkedin_visibility','document','public_research']){
    assert.equal(byType[sourceType]?.status,'ingress',sourceType);
    assert.match(byType[sourceType]?.hook||'',/\/api\/val\/board\/events\//,sourceType);
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
  assert.ok(readiness.summary.ingress>0);
  assert.ok(readiness.sources.find(source=>source.sourceType==='email').packetCount>0);
  assert.ok(readiness.sources.find(source=>source.sourceType==='witnessing').packetCount>0);
  assert.equal(readiness.sources.find(source=>source.sourceType==='sms').claimSafe,false);
  assert.equal(readiness.sources.find(source=>source.sourceType==='sms').packetCount,0);
});

test('source-specific Board event ingress creates claim-safe packets for non-automatic sources',async()=>{
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

  await service.recordSourceEvent('sms',{id:'sms1',message:'Michele replied warmly to the introduction text.',direction:'inbound'});
  await service.recordSourceEvent('linkedin_visibility',{id:'li1',summary:'Drafted a supportive LinkedIn comment for Mark.',eventType:'draft_prepared'});
  await service.recordSourceEvent('document',{id:'doc1',title:'GOALL dashboard requirements',summary:'Dashboard should show pipeline projections and iframe-ready status.'});
  await service.recordSourceEvent('public_research',{id:'research1',summary:'Public research found company growth signals for the GOALL opportunity.'});

  const readiness=await service.sourceReadiness();
  assert.equal(readiness.sources.find(source=>source.sourceType==='sms').claimSafe,true);
  assert.equal(readiness.sources.find(source=>source.sourceType==='linkedin_visibility').claimSafe,true);
  assert.equal(readiness.sources.find(source=>source.sourceType==='document').claimSafe,true);
  assert.equal(readiness.sources.find(source=>source.sourceType==='public_research').claimSafe,true);
  assert.ok(readiness.summary.activeIngress>=4);
  const packets=await service.listPackets({limit:20});
  assert.ok(packets.some(packet=>packet.sourceType==='sms'&&packet.packetType==='relationship_packet'));
  assert.ok(packets.some(packet=>packet.sourceType==='linkedin_visibility'&&packet.packetType==='relationship_packet'));
  assert.ok(packets.some(packet=>packet.sourceType==='document'&&packet.packetType==='document_packet'));
  assert.ok(packets.some(packet=>packet.sourceType==='public_research'&&packet.packetType==='project_packet'));
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
  assert.ok(context.reviewsByObserver.Delight.length>0);
  assert.ok(context.reviewsByObserver.Delight.every(review=>review.status==='observed'||review.status==='no_signal'));
});

test('commitment actions create task packets reviewed by every observer',async()=>{
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

  const packet=await service.recordCommitmentEvent({
    eventType:'status_updated',
    commitment:{
      id:'commitment_goall_mike',
      title:'Finish the GOALL dashboard handoff with Mike',
      status:'complete',
      source_type:'transcript',
      source_id:'tr_goall_mike',
      evidence_quote:'Jessa finished the GOALL projections dashboard handoff with Mike so the agency has a clean next step.',
      confidence_score:0.91
    }
  });

  assert.equal(packet.sourceType,'task');
  assert.equal(packet.packetType,'task_packet');
  assert.equal(packet.payloadJson.observerReviews.length,BOARD_OBSERVERS.length);
  const projectReview=packet.payloadJson.observerReviews.find(review=>review.observerName==='Project');
  const commitmentReview=packet.payloadJson.observerReviews.find(review=>review.observerName==='Commitment');
  assert.equal(projectReview.status,'observed');
  assert.equal(commitmentReview.status,'observed');
  assert.ok(projectReview.projects.includes('GOALL'));
  assert.match(commitmentReview.evidence.quoteOrSummary,/GOALL projections dashboard handoff/i);
});

test('relationship and project profile saves create first-class Board packets',async()=>{
  let store={};
  const service=createValBoardPacketsService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    uuid:prefix=>`${prefix}_profile`,
    tenantId:()=>'tenant',
    userId:()=>'user',
    logger:{log(){}}
  });

  const relationshipPacket=await service.recordProfileEvent({
    eventType:'relationship_profile_saved',
    profile:{
      id:'rel_mike',
      profileType:'person',
      displayName:'Mike',
      summary:'Mike sounded frustrated after the GOALL dashboard handoff stayed vague.',
      confidence:0.88
    }
  });
  const projectPacket=await service.recordProfileEvent({
    eventType:'project_profile_saved',
    profile:{
      id:'project_goall',
      profileType:'project',
      projectId:'GOALL',
      displayName:'GOALL',
      summary:'GOALL needs the dashboard handoff and proposal context kept together.',
      confidence:0.9
    }
  });

  assert.equal(relationshipPacket.sourceType,'relationship_profile');
  assert.equal(relationshipPacket.packetType,'relationship_packet');
  assert.equal(projectPacket.sourceType,'project_profile');
  assert.equal(projectPacket.packetType,'project_packet');
  assert.equal(relationshipPacket.payloadJson.observerReviews.length,BOARD_OBSERVERS.length);
  assert.equal(projectPacket.payloadJson.observerReviews.length,BOARD_OBSERVERS.length);
  assert.match(relationshipPacket.payloadJson.observerReviews.find(review=>review.observerName==='Relationship').lensFinding,/Mike has a relationship signal worth inspecting/i);
  assert.match(projectPacket.payloadJson.observerReviews.find(review=>review.observerName==='Project').lensFinding,/GOALL/i);
});

test('GHL voice and text turns enter the Board as their own packet sources instead of generic chat',async()=>{
  let store={};
  const service=createValBoardPacketsService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    uuid:prefix=>`${prefix}_voice`,
    tenantId:()=>'tenant',
    userId:()=>'user',
    logger:{log(){}}
  });

  const packet=await service.recordCoworkEvent({
    sourceType:'ghl_voice',
    conversationId:'voice_1',
    title:'GHL Voice - Jessa',
    summary:'User asked VAL to find Michelle and prepare an email.',
    sourceRefs:[{sourceType:'ghl_voice',sourceId:'voice_1',quoteOrSummary:'Find Michelle and prepare an email.'}]
  });

  assert.equal(packet.sourceType,'ghl_voice');
  assert.equal(packet.packetType,'cowork_packet');
  assert.equal(packet.payloadJson.observerReviews.length,BOARD_OBSERVERS.length);
  assert.ok(packet.payloadJson.observerReviews.some(review=>review.observerName==='Relationship'));
  assert.ok(packet.payloadJson.observerReviews.every(review=>review.evidence.sourceType==='ghl_voice'));
  const textPacket=await service.recordCoworkEvent({
    sourceType:'ghl_text',
    conversationId:'text_1',
    title:'GHL Text - Jessa',
    summary:'User asked VAL to continue the Michelle email preparation from text chat.',
    sourceRefs:[{sourceType:'ghl_text',sourceId:'text_1',quoteOrSummary:'Continue the Michelle email preparation.'}]
  });
  assert.equal(textPacket.sourceType,'ghl_text');
  assert.equal(textPacket.packetType,'cowork_packet');
  assert.equal(textPacket.payloadJson.observerReviews.length,BOARD_OBSERVERS.length);
  assert.ok(textPacket.payloadJson.observerReviews.every(review=>review.evidence.sourceType==='ghl_text'));
});

test('Board packet people extraction ignores user and politeness filler words',async()=>{
  let store={};
  const service=createValBoardPacketsService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    uuid:prefix=>`${prefix}_people`,
    tenantId:()=>'tenant',
    userId:()=>'user',
    logger:{log(){}}
  });
  const packet=await service.recordSourceEvent('sms',{
    id:'sms_michelle_intro',
    title:'Michelle introduction',
    summary:'Jessa asked: Please introduce VAL to Michelle after the GOALL dashboard discussion.',
    sourceRefs:[{sourceType:'sms',sourceId:'sms_michelle_intro',quoteOrSummary:'Please introduce VAL to Michelle after the GOALL dashboard discussion.',confidence:0.9}]
  });
  const relationshipReview=packet.payloadJson.observerReviews.find(review=>review.observerName==='Relationship');
  assert.ok(relationshipReview.people.includes('Michelle'));
  assert.equal(relationshipReview.people.includes('Please'),false);
  assert.equal(relationshipReview.people.includes('Jessa'),false);
});

test('Board reviews do not turn document labels or routing into fabricated people and findings',async()=>{
  let store={};
  const service=createValBoardPacketsService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    uuid:prefix=>`${prefix}_document`,
    tenantId:()=>'tenant',
    userId:()=>'user',
    logger:{log(){}}
  });
  const packet=await service.recordSourceEvent('document',{
    id:'anthropic_receipt',
    title:'Your receipt from Anthropic, PBC',
    summary:'Invoice 2774-9749-4594'
  });
  const relationshipReview=packet.payloadJson.observerReviews.find(review=>review.observerName==='Relationship');
  const capacityReview=packet.payloadJson.observerReviews.find(review=>review.observerName==='Capacity');
  assert.deepEqual(relationshipReview.people,[]);
  assert.equal(relationshipReview.status,'no_signal');
  assert.equal(capacityReview.status,'no_signal');
  assert.match(relationshipReview.lensFinding,/No meaningful Relationship signal/);
  assert.equal(packet.payloadJson.observerReviewVersion,2);
});

test('profile persistence paths emit Board packets when relationship/project truth changes',()=>{
  assert.match(server,/async function recordRelationshipProfileBoardPacket/);
  assert.match(server,/recordProfileEvent\(\{eventType,profile\}\)/);
  assert.match(server,/recordRelationshipProfileBoardPacket\(saved,'relationship_profile_saved'\)/);
  assert.match(server,/recordRelationshipProfileBoardPacket\(saved,'relationship_profile_recalculated'\)/);
});

test('Home chat, GHL text, and GHL voice routes record conversation turns for the Board',()=>{
  assert.match(server,/async function recordValConversationTurnPacket/);
  assert.match(server,/function boardConversationSourceType/);
  assert.match(server,/ghl_text'\|\|value==='ghl_chat'/);
  const voiceRoute=server.slice(server.indexOf("app.post('/api/val/ghl/voice-turn'"),server.indexOf("app.post('/api/val/chat'"));
  assert.match(voiceRoute,/sourceType:'ghl_voice'/);
  assert.match(voiceRoute,/recordValConversationTurnPacket\(\{/);
  const chatRoute=server.slice(server.indexOf("app.post('/api/val/chat'"));
  assert.match(chatRoute,/recordValConversationTurnPacket\(\{/);
  assert.match(chatRoute,/boardConversationSourceType\(req\.body\.channel,'cowork'\)/);
  assert.match(chatRoute,/selectedSourceFocused:!!hasSelectedSourceContext/);
  const fastRoute=server.slice(server.indexOf('function sendFastHearthChatNow'),server.indexOf('function ghlVoiceUserMessage'));
  assert.match(fastRoute,/recordValConversationTurnPacket\(\{/);
  assert.match(fastRoute,/fastHearthChat:true/);
});

test('Board front end prefers live Board context over prototype packets',()=>{
  assert.match(frontend,/loadLiveObserverBoardContext/);
  assert.match(frontend,/fetch\('\/api\/val\/board\/context\?limit=80'/);
  assert.match(routes,/app\.get\('\/api\/val\/board\/context'/);
  assert.match(routes,/app\.get\('\/api\/val\/board\/status'/);
  assert.match(routes,/service\.witnessingStatus\(\)/);
  assert.match(routes,/service\.boardContext\(\{limit:/);
  assert.match(frontend,/observerBoardConnectionsFromPackets/);
  assert.match(frontend,/observerBoardState\.livePackets/);
  assert.match(frontend,/observerBoardState\.sourceSummary/);
  assert.match(frontend,/observerBoardState\.reviewsByObserver/);
  assert.match(frontend,/observerBoardState\.witnessingComplete/);
  assert.match(frontend,/typeof observerBoardState\.witnessingComplete === 'boolean'/);
  assert.match(frontend,/applyWitnessingPendingPerspective/);
  assert.match(frontend,/renderWitnessingPendingEvidence/);
  assert.match(frontend,/if\(observerBoardState\.witnessingComplete === false\)\{\s*renderWitnessingPendingEvidence\(observerBoardState\);\s*return;/);
  assert.match(server,/const session=await getTeachValWitnessingResumeSession\(\)/);
  assert.doesNotMatch(server,/const session=await getTeachValWitnessingSession\(\)/);
  assert.match(server,/Prepare and confirm your First Look/);
  assert.match(frontend,/data-workflow-action="valWitnessingResume"/);
  assert.match(frontend,/function observerLiveReviews/);
  assert.match(frontend,/function observerMeaningfulLiveReviews/);
  assert.match(frontend,/function observerReviewEvidenceLine/);
  assert.match(frontend,/Live packets through this lens/);
  assert.match(frontend,/Holding space for Analytical and Relational Context/);
});

test('Witnessing completion automatically reconciles every historical Board packet',()=>{
  assert.match(server,/post-Witnessing reconciliation deferred/);
  assert.match(server,/backfillBoardPackets\(\{days:3650,limit:300\}\)/);
  assert.doesNotMatch(server,/triggerBoardIntelligenceForPackets\(createdPackets\.slice\(0,80\)/);
  assert.match(server,/triggerBoardIntelligenceForPackets\(createdPackets,/);
});
