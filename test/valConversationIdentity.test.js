const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createValConversationIdentityService}=require('../services/valConversationIdentity');
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
  assert.match(routes,/\/api\/val\/conversations\/build-context/);
  assert.match(routes,/\/api\/val\/crm\/resolve-identity/);
  assert.match(routes,/\/api\/val\/conversations\/:id/);
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
