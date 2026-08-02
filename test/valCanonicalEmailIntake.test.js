const test=require('node:test');
const assert=require('node:assert/strict');

const {createValSourceProcessingService}=require('../services/valSourceProcessing');
const {createValCanonicalWorkService}=require('../services/valCanonicalWork');
const {createValCanonicalEmailIntake,exactEmailEvidence}=require('../services/valCanonicalEmailIntake');
const {createValExecutiveInboxService}=require('../services/valExecutiveInbox');
const {createValBoardPacketsService}=require('../services/valBoardPackets');
const {createValIntelligenceSpine,DEFAULT_OBSERVERS,OBSERVER_PACKET_LENSES}=require('../services/valIntelligenceSpine');
const {createEvidenceQualifiedObserverReasoner}=require('../services/valEvidenceQualifiedObserverReview');

function harness(){
  let store={
    relationshipProfiles:[{id:'project_goall',profileType:'project',name:'GOALL'}]
  };
  let sequence=0;
  const deps={
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:value=>{store=value;},
    uuid:prefix=>`${prefix}_${++sequence}`,
    tenantId:()=>'tenant',
    userId:()=>'user',
    logger:{log(){},warn(){}}
  };
  return {deps,getStore:()=>store};
}

test('email classification becomes immutable source evidence and project-first canonical work',async()=>{
  const {deps,getStore}=harness();
  const board=createValBoardPacketsService(deps);
  const packets=[];
  const sourceProcessing=createValSourceProcessingService({
    ...deps,
    afterSourceProcessed:async({record,rawText,sourceType,sourceId,sourceTitle,sourceRef})=>{
      const packet=await board.recordSourceEvent(sourceType,{
        id:record.id,
        eventType:'canonical_source_version_processed',
        sourceType,
        sourceId,
        title:sourceTitle,
        summary:rawText,
        sourceProcessingRecordId:record.id,
        sourceRefs:[sourceRef],
        noExternalAction:true
      });
      packets.push(packet);
      return packet;
    }
  });
  const canonicalWork=createValCanonicalWorkService({
    ...deps,
    afterWorkItemEvent:async({workItem,event})=>{
      const packet=await board.recordSourceEvent('task',{
        id:event.id,
        eventType:`canonical_work_${event.eventType}`,
        sourceType:workItem.sourceType,
        sourceId:workItem.sourceId,
        title:workItem.title,
        summary:workItem.exactSourceQuote,
        projectName:workItem.projectName,
        sourceProcessingRecordId:workItem.sourceProcessingRecordId,
        canonicalWorkItemId:workItem.id,
        sourceRefs:workItem.sourceRefsJson,
        noExternalAction:true
      });
      packets.push(packet);
    }
  });
  const context={
    conversationId:'conversation_goall',
    threadId:'thread_goall',
    provider:'gmail',
    current_message:{
      id:'message_1',
      messageId:'gmail_1',
      direction:'inbound',
      from:{name:'Mike',email:'mike@example.com'},
      subject:'GOALL dashboard handoff',
      bodyText:'Can you finish the GOALL dashboard handoff before our weekly check-in?'
    },
    latest_inbound:{
      id:'message_1',
      messageId:'gmail_1',
      direction:'inbound',
      from:{name:'Mike',email:'mike@example.com'},
      subject:'GOALL dashboard handoff',
      bodyText:'Can you finish the GOALL dashboard handoff before our weekly check-in?'
    },
    evidence_messages:[{
      id:'message_1',
      messageId:'gmail_1',
      direction:'inbound',
      from:{name:'Mike',email:'mike@example.com'},
      subject:'GOALL dashboard handoff',
      bodyText:'Can you finish the GOALL dashboard handoff before our weekly check-in?'
    }],
    thread_summary:'1 message about GOALL dashboard handoff.',
    waiting_on_user:true,
    waiting_on_other:false,
    open_questions:[{text:'Can you finish the GOALL dashboard handoff before our weekly check-in?',messageId:'gmail_1'}],
    commitments:[{text:'Can you finish the GOALL dashboard handoff before our weekly check-in?',messageId:'gmail_1',direction:'inbound'}],
    source_refs:[{source_type:'email_message',source_id:'message_1',quote_or_summary:'GOALL dashboard handoff: Can you finish the GOALL dashboard handoff before our weekly check-in?',confidence:0.9}]
  };
  const intake=createValCanonicalEmailIntake({
    processEvidenceSource:input=>sourceProcessing.processEvidenceSource(input),
    admitCanonicalWork:input=>canonicalWork.admit(input),
    listProjectProfiles:async()=>getStore().relationshipProfiles,
    logger:deps.logger
  });
  const executiveInbox=createValExecutiveInboxService({
    ...deps,
    conversationService:{
      buildConversationContext:async()=>context,
      resolveIdentity:async()=>({ok:true,match_status:'matched',crm_contact_id:'contact_mike'})
    },
    listTeachValCoreMemory:async()=>[],
    afterClassification:input=>intake.intakeClassification(input)
  });
  const classified=await executiveInbox.classifyConversation({conversationId:context.conversationId});

  assert.equal(classified.canonical_intake.ok,true);
  assert.equal(classified.canonical_intake.sourceProcessingRecord.sourceType,'email');
  assert.match(classified.canonical_intake.sourceProcessingRecord.sourceReceiptJson.rawText,/Can you finish the GOALL dashboard handoff/);
  assert.equal(classified.canonical_intake.canonicalWorkItems.length,1);
  assert.equal(classified.canonical_intake.canonicalWorkItems[0].ownership,'user');
  assert.equal(classified.canonical_intake.canonicalWorkItems[0].admissionStatus,'admitted');
  assert.equal(classified.canonical_intake.canonicalWorkItems[0].projectName,'GOALL');
  assert.equal(classified.canonical_intake.canonicalWorkItems[0].relationshipName,'');
  assert.equal(classified.canonical_intake.canonicalWorkItems[0].dueAt,null);
  assert.equal(packets.length,2);
  assert.equal(packets[0].sourceType,'email');
  assert.equal(packets[1].sourceType,'task');

  const reasoner=createEvidenceQualifiedObserverReasoner({
    observerLenses:OBSERVER_PACKET_LENSES,
    callModel:async({user})=>{
      const request=JSON.parse(String(user).split('\n')[0]);
      return JSON.stringify({reviews:request.packets.map(packet=>({
        packetId:packet.packetId,
        status:'no_meaningful_signal',
        observation:'No meaningful signal from my lens.',
        useful_context:[],
        evidence_quote:'',
        confidence:0.8
      }))});
    }
  });
  const spine=createValIntelligenceSpine({
    ...deps,
    observerReasoner:reasoner,
    loaders:{
      listBoardPackets:async()=>packets,
      loadTasks:async()=>[],
      listTeachValCoreMemory:async()=>[],
      listRelationshipProfiles:async()=>getStore().relationshipProfiles
    }
  });
  const pass=await spine.runIntelligencePass({
    event:{type:'email_classified',sourceType:'email',sourceId:context.conversationId,packetIds:packets.map(packet=>packet.id)},
    observerSuite:DEFAULT_OBSERVERS
  });
  assert.equal(pass.observerRuns.length,14);
  for(const run of pass.observerRuns){
    assert.equal(run.outputJson.packetReviews.length,2);
    assert.deepEqual(run.outputJson.packetReviews.map(review=>review.status),['no_signal','no_signal']);
  }
});

test('email evidence preserves the exact readable messages instead of a classification summary',()=>{
  const rawText=exactEmailEvidence({
    evidence_messages:[
      {id:'one',direction:'inbound',from:{name:'Michele'},subject:'Scope',bodyText:'Please send the revised scope.'},
      {id:'two',direction:'outbound',from:{name:'Jessa'},subject:'Re: Scope',bodyText:'I will send it tomorrow.'}
    ]
  });
  assert.match(rawText,/\[inbound\] Michele/);
  assert.match(rawText,/Please send the revised scope\./);
  assert.match(rawText,/\[outbound\] Jessa/);
  assert.match(rawText,/I will send it tomorrow\./);
});
