const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createValConversationIdentityService}=require('../services/valConversationIdentity');
const {createValActionOrchestrator}=require('../services/valActionOrchestrator');
const {VAL_CONVERSATION_IDENTITY_SQL}=require('../services/valConversationIdentitySchema');

const root=path.join(__dirname,'..');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
const routes=fs.readFileSync(path.join(root,'services','valConversationIdentityRoutes.js'),'utf8');
const spine=fs.readFileSync(path.join(root,'services','valIntelligenceSpine.js'),'utf8');

test('conversation identity schema creates durable conversation tables',()=>{
  for(const table of ['email_messages','email_threads','unified_conversations','conversation_classifications']){
    assert.match(VAL_CONVERSATION_IDENTITY_SQL,new RegExp(`create table if not exists ${table}`));
  }
  assert.match(server,/ensureValConversationIdentityTables/);
});

test('conversation identity routes are backend-only and mounted from server',()=>{
  assert.match(server,/registerValConversationIdentityRoutes/);
  assert.match(routes,/\/api\/val\/email\/sync/);
  assert.match(routes,/\/api\/val\/email\/messages\/:messageId\/trigger-receipt/);
  assert.match(routes,/\/api\/val\/conversations\/build-context/);
  assert.match(routes,/\/api\/val\/crm\/resolve-identity/);
  assert.match(routes,/\/api\/val\/conversations\/:id/);
});

test('new inbound email is reviewed through the canonical action orchestrator and keeps a durable receipt',async()=>{
  let store={};
  const shared={hasPg:()=>false,getStore:()=>store,saveStore:s=>{store=s;},tenantId:()=>'tenant',userId:()=>'user'};
  const orchestrator=createValActionOrchestrator(shared);
  const service=createValConversationIdentityService({...shared,ownerEmails:['jessa@example.com'],actionOrchestrator:orchestrator});

  const result=await service.upsertEmailMessage({provider:'gmail',messageId:'action_1',threadId:'action_thread',from:{name:'Aric',email:'aric@example.com'},to:[{email:'jessa@example.com'}],subject:'Revised plan',bodyText:'Can you send the revised plan to me today?',receivedAt:'2026-07-22T12:00:00Z'});

  assert.equal(result.saved,true);
  assert.equal(result.triggerReceipt.status,'action_detected');
  assert.equal(result.triggerReceipt.candidateIds.length,1);
  assert.equal(store.valActionSources.length,1);
  assert.equal(store.valActionCandidates.length,1);
  assert.equal(store.emailMessages[0].triggerReceiptJson.sourceRecordId,store.valActionSources[0].id);
  const receipt=await service.triggerReceiptForMessage({messageId:'action_1',provider:'gmail'});
  assert.equal(receipt.triggerReceipt.status,'action_detected');
  assert.match(receipt.triggerReceipt.summary,/Nothing will happen externally without approval/);
});

test('inbound email with no request receives a no-action receipt instead of invented work',async()=>{
  let store={};
  const shared={hasPg:()=>false,getStore:()=>store,saveStore:s=>{store=s;},tenantId:()=>'tenant',userId:()=>'user'};
  const orchestrator=createValActionOrchestrator(shared);
  const service=createValConversationIdentityService({...shared,ownerEmails:['jessa@example.com'],actionOrchestrator:orchestrator});

  const result=await service.upsertEmailMessage({provider:'gmail',messageId:'quiet_1',threadId:'quiet_thread',from:{email:'friend@example.com'},to:[{email:'jessa@example.com'}],subject:'Thank you',bodyText:'Thank you for yesterday. I appreciated the conversation.',receivedAt:'2026-07-22T12:05:00Z'});

  assert.equal(result.triggerReceipt.status,'no_action_needed');
  assert.equal(store.valActionSources.length,1);
  assert.equal(store.valActionCandidates.length,0);
});

test('duplicate email sync does not review twice or inflate thread counts',async()=>{
  let store={},ingestCalls=0;
  const service=createValConversationIdentityService({
    hasPg:()=>false,getStore:()=>store,saveStore:s=>{store=s;},tenantId:()=>'tenant',userId:()=>'user',ownerEmails:['jessa@example.com'],
    actionOrchestrator:{ingest:async()=>{ingestCalls+=1;return {source:{id:'source_once'},candidates:[]};}}
  });
  const email={provider:'gmail',messageId:'duplicate_1',threadId:'duplicate_thread',from:{email:'friend@example.com'},to:[{email:'jessa@example.com'}],subject:'One message',bodyText:'Please confirm the time.',receivedAt:'2026-07-22T12:10:00Z'};

  const first=await service.upsertEmailMessage(email);
  const second=await service.upsertEmailMessage(email);

  assert.equal(first.saved,true);
  assert.equal(second.saved,false);
  assert.equal(second.reason,'unchanged_message');
  assert.equal(ingestCalls,1);
  assert.equal(store.emailThreads[0].messageCount,1);
  assert.equal(store.unifiedConversations[0].messageCount,1);
});

test('outbound email is saved without treating it as a new incoming request',async()=>{
  let store={},ingestCalls=0;
  const service=createValConversationIdentityService({
    hasPg:()=>false,getStore:()=>store,saveStore:s=>{store=s;},tenantId:()=>'tenant',userId:()=>'user',ownerEmails:['jessa@example.com'],
    actionOrchestrator:{ingest:async()=>{ingestCalls+=1;return {source:{id:'not_expected'},candidates:[]};}}
  });
  const result=await service.upsertEmailMessage({provider:'gmail',messageId:'sent_1',threadId:'sent_thread',from:{email:'jessa@example.com'},to:[{email:'friend@example.com'}],subject:'Sent note',bodyText:'Please confirm when you receive this.',receivedAt:'2026-07-22T12:15:00Z'});
  assert.equal(result.triggerReceipt.status,'not_applicable');
  assert.equal(ingestCalls,0);
});

test('email remains durable when action review fails and exposes the failure receipt',async()=>{
  let store={};
  const service=createValConversationIdentityService({
    hasPg:()=>false,getStore:()=>store,saveStore:s=>{store=s;},tenantId:()=>'tenant',userId:()=>'user',
    actionOrchestrator:{ingest:async()=>{throw new Error('review unavailable');}},logger:{warn:()=>{}}
  });
  const result=await service.upsertEmailMessage({provider:'gmail',messageId:'failed_1',threadId:'failed_thread',from:{email:'friend@example.com'},subject:'Need help',bodyText:'Can you send the plan?',receivedAt:'2026-07-22T12:20:00Z'});
  assert.equal(result.saved,true);
  assert.equal(result.triggerReceipt.status,'failed');
  assert.equal(store.emailMessages.length,1);
  const receipt=await service.triggerReceiptForMessage({messageId:'failed_1'});
  assert.equal(receipt.triggerReceipt.error,'review unavailable');
});

test('a failed action review retries on the next sync without duplicating the email or thread counts',async()=>{
  let store={},attempts=0;
  const service=createValConversationIdentityService({
    hasPg:()=>false,getStore:()=>store,saveStore:s=>{store=s;},tenantId:()=>'tenant',userId:()=>'user',
    actionOrchestrator:{ingest:async()=>{
      attempts+=1;
      if(attempts===1)throw new Error('temporary review outage');
      return {source:{id:'source_after_retry'},candidates:[]};
    }},
    logger:{warn:()=>{}}
  });
  const email={provider:'gmail',messageId:'retry_1',threadId:'retry_thread',from:{email:'friend@example.com'},subject:'A note',bodyText:'Thank you for the conversation.',receivedAt:'2026-07-22T12:25:00Z'};

  const first=await service.upsertEmailMessage(email);
  const retried=await service.upsertEmailMessage(email);

  assert.equal(first.triggerReceipt.status,'failed');
  assert.equal(retried.triggerReceipt.status,'no_action_needed');
  assert.equal(attempts,2);
  assert.equal(store.emailMessages.length,1);
  assert.equal(store.emailThreads[0].messageCount,1);
  assert.equal(store.unifiedConversations[0].messageCount,1);
});

test('intelligence spine consumes durable conversation context when available',()=>{
  assert.match(spine,/listRecentConversationSummaries/);
  assert.match(spine,/buildConversationContext/);
  assert.match(spine,/identityResolution/);
  assert.match(spine,/unified_conversation/);
});

test('email sync stores messages, threads, unified conversations, and context',async()=>{
  let store={};
  const service=createValConversationIdentityService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    uuid:prefix=>`${prefix}_test_${Math.random().toString(36).slice(2,7)}`,
    tenantId:()=>'tenant',
    userId:()=>'user',
    ownerEmails:['jessa@example.com'],
    fetchGmailMessages:async()=>({emails:[
      {provider:'gmail',messageId:'g1',threadId:'t1',from:{name:'Aric',email:'aric@example.com'},to:[{name:'Jessa',email:'jessa@example.com'}],subject:'Partner workflow',bodyPreview:'Can you send the partner workflow today?',bodyText:'Can you send the partner workflow today? Aric is waiting.',receivedAt:'2026-07-03T12:00:00Z'}
    ]}),
    fetchUnifiedOutlookEmails:async()=>({emails:[
      {provider:'outlook',messageId:'o1',threadId:'ot1',from:{name:'Jessa',email:'jessa@example.com'},to:[{name:'Greg',email:'greg@example.com'}],subject:'HopeMakers',bodyPreview:'Can you review this and let me know?',bodyText:'Can you review this and let me know?',receivedAt:'2026-07-03T12:05:00Z'}
    ]})
  });
  const synced=await service.syncEmail({providers:['gmail','outlook'],limit:10});
  assert.equal(synced.ok,true);
  assert.equal(synced.saved,2);
  assert.equal(store.emailMessages.length,2);
  assert.equal(store.emailThreads.length,2);
  assert.equal(store.unifiedConversations.length,2);
  const context=await service.buildConversationContext({provider:'gmail',threadId:'t1'});
  assert.equal(context.ok,true);
  assert.equal(context.conversation_state,'waiting_on_user');
  assert.equal(context.relationship_temperature,'waiting');
  assert.ok(context.open_questions.length);
  assert.ok(store.conversationClassifications.length);
});

test('conversation identity exposes the selected thread messages for Executive Inbox Co-Work',async()=>{
  let store={};
  const service=createValConversationIdentityService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    uuid:prefix=>`${prefix}_thread_${Math.random().toString(36).slice(2,7)}`,
    tenantId:()=>'tenant',
    userId:()=>'user',
    ownerEmails:['jessa@example.com'],
    fetchGmailMessages:async()=>({emails:[
      {provider:'gmail',messageId:'g1',threadId:'thread_selected',from:{name:'Aric',email:'aric@example.com'},to:[{name:'Jessa',email:'jessa@example.com'}],subject:'First note',bodyText:'Can you review this?',receivedAt:'2026-07-03T12:00:00Z'},
      {provider:'gmail',messageId:'g2',threadId:'thread_selected',from:{name:'Jessa',email:'jessa@example.com'},to:[{name:'Aric',email:'aric@example.com'}],subject:'Re: First note',bodyText:'Yes, I will review it today.',receivedAt:'2026-07-03T12:05:00Z'}
    ]})
  });
  await service.syncEmail({providers:['gmail'],limit:10});
  assert.equal(typeof service.messagesForConversation,'function');
  const messages=await service.messagesForConversation({provider:'gmail',threadId:'thread_selected'});
  assert.deepEqual(messages.map((message)=>message.messageId),['g1','g2']);
});

test('conversation identity keeps long shared tenant prefixes from collapsing distinct email threads',async()=>{
  let store={};
  const service=createValConversationIdentityService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    tenantId:()=>'val-core-tenant-with-a-long-shared-prefix',
    userId:()=>'user-with-a-long-shared-prefix',
    ownerEmails:['jessa@example.com'],
    fetchGmailMessages:async()=>({emails:[
      {provider:'gmail',messageId:'message_alpha',threadId:'thread_alpha',from:{name:'Alpha',email:'alpha@example.com'},subject:'Alpha',bodyText:'Can you review alpha?',receivedAt:'2026-07-03T12:00:00Z'},
      {provider:'gmail',messageId:'message_beta',threadId:'thread_beta',from:{name:'Beta',email:'beta@example.com'},subject:'Beta',bodyText:'Can you review beta?',receivedAt:'2026-07-03T12:01:00Z'},
      {provider:'gmail',messageId:'message_gamma',threadId:'thread_gamma',from:{name:'Gamma',email:'gamma@example.com'},subject:'Gamma',bodyText:'Can you review gamma?',receivedAt:'2026-07-03T12:02:00Z'}
    ]})
  });
  await service.syncEmail({providers:['gmail'],limit:10});
  assert.equal(new Set(store.emailMessages.map((message)=>message.id)).size,3);
  assert.equal(new Set(store.emailThreads.map((thread)=>thread.id)).size,3);
  assert.equal(new Set(store.unifiedConversations.map((conversation)=>conversation.id)).size,3);
  store.emailMessages.forEach((message)=>{message.id='em_legacy_collision';message.unifiedConversationId='uc_legacy_collision';});
  store.emailThreads.forEach((thread)=>{thread.id='eth_legacy_collision';thread.unifiedConversationId='uc_legacy_collision';});
  store.unifiedConversations.forEach((conversation)=>{conversation.id='uc_legacy_collision';});
  await service.syncEmail({providers:['gmail'],limit:10});
  assert.equal(new Set(store.emailMessages.map((message)=>message.id)).size,3);
  assert.equal(new Set(store.emailThreads.map((thread)=>thread.id)).size,3);
  assert.equal(new Set(store.unifiedConversations.map((conversation)=>conversation.id)).size,3);
  const alpha=await service.messagesForConversation({provider:'gmail',threadId:'thread_alpha'});
  const beta=await service.messagesForConversation({provider:'gmail',threadId:'thread_beta'});
  assert.deepEqual(alpha.map((message)=>message.messageId),['message_alpha']);
  assert.deepEqual(beta.map((message)=>message.messageId),['message_beta']);
});

test('exact message identity wins over a provider thread id passed as the conversation id',async()=>{
  let store={};
  const service=createValConversationIdentityService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    tenantId:()=>'tenant',
    userId:()=>'user'
  });
  await service.upsertEmailMessage({provider:'gmail',messageId:'message_selected',threadId:'thread_selected',from:{name:'Selected Sender',email:'selected@example.com'},subject:'Selected thread',bodyText:'Please confirm the selected response.',receivedAt:'2026-07-21T10:00:00Z'});
  await service.upsertEmailMessage({provider:'gmail',messageId:'message_other',threadId:'thread_other',from:{name:'Other Sender',email:'other@example.com'},subject:'Other thread',bodyText:'This must not replace the selected thread.',receivedAt:'2026-07-21T10:01:00Z'});

  const selected=await service.messagesForConversation({provider:'gmail',messageId:'message_selected',threadId:'thread_selected',conversationId:'thread_selected'});

  assert.deepEqual(selected.map((message)=>message.messageId),['message_selected']);
});

test('CRM identity resolver recommends use_existing for exact email and does not create',async()=>{
  let store={};
  const service=createValConversationIdentityService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    tenantId:()=>'tenant',
    userId:()=>'user',
    resolveContactFromContext:async()=>({status:'matched',confidence:0.94,matchReasons:['exact_email'],contact:{id:'crm_1',contactId:'crm_1',name:'Aric',email:'aric@example.com',source:'ghl_contact'}})
  });
  const result=await service.resolveIdentity({email:'aric@example.com',name:'Aric'});
  assert.equal(result.ok,true);
  assert.equal(result.match_status,'matched');
  assert.equal(result.recommended_action,'use_existing');
  assert.equal(result.crm_contact_id,'crm_1');
});
