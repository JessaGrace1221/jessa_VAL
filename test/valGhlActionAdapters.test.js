const test=require('node:test');
const assert=require('node:assert/strict');
const {createValGhlActionAdapters}=require('../services/valGhlActionAdapters');

function harness(responses=[]){
  const calls=[];
  const adapters=createValGhlActionAdapters({
    smsStatusDelayMs:0,
    sleep:async()=>{},
    async requestStrict(method,path,body){
      calls.push({method,path,body});
      return responses[calls.length-1]||{};
    }
  });
  return {adapters,calls};
}

test('GHL SMS adapter sends one reviewed message to one verified contact',async()=>{
  const h=harness([{messageId:'msg_1',conversationId:'conv_1'},{message:{id:'msg_1',status:'sent'}}]);
  const result=await h.adapters.send_sms({packet:{targetId:'contact_1'},payload:{message:'See you Friday.'}});
  assert.deepEqual(h.calls,[
    {method:'POST',path:'/conversations/messages',body:{type:'SMS',contactId:'contact_1',message:'See you Friday.'}},
    {method:'GET',path:'/conversations/messages/msg_1',body:undefined}
  ]);
  assert.equal(result.providerResponseId,'msg_1');
  assert.equal(result.providerDeliveryStatus,'sent');
  assert.match(result.providerResponseSummary,/final delivery is not yet confirmed/);
});

test('GHL SMS adapter rejects provider-created message rows that immediately fail delivery',async()=>{
  const h=harness([
    {messageId:'msg_failed',conversationId:'conv_1'},
    {message:{id:'msg_failed',status:'failed',error:'Failed: No numbers available in the account. Buy a number to send SMS.'}}
  ]);
  await assert.rejects(
    ()=>h.adapters.send_sms({packet:{targetId:'contact_1'},payload:{message:'This is VAL'}}),
    /No numbers available in the account/
  );
  assert.equal(h.calls.length,2);
});

test('GHL contact upsert uses verified identity and disables duplicate creation',async()=>{
  const h=harness([{contact:{id:'contact_2'}}]);
  const result=await h.adapters.upsert_contact({packet:{},payload:{contact:{firstName:'Greg',lastName:'Zlevor',email:'greg@example.com',tags:['must not overwrite']}}});
  assert.deepEqual(h.calls,[{
    method:'POST',path:'/contacts/upsert',body:{firstName:'Greg',lastName:'Zlevor',email:'greg@example.com',locationId:'',createNewIfDuplicateAllowed:false}
  }]);
  assert.equal(result.providerResponseId,'contact_2');
});

test('GHL contact update only sends reviewed allowlisted fields',async()=>{
  const h=harness([{contact:{id:'contact_3'}}]);
  await h.adapters.update_contact({packet:{targetId:'contact_3'},payload:{contact:{phone:'+15551234567',unknown:'ignored'}}});
  assert.deepEqual(h.calls,[{method:'PUT',path:'/contacts/contact_3',body:{phone:'+15551234567'}}]);
});

test('GHL tag adapter uses dedicated add and remove endpoints without overwriting contact tags',async()=>{
  const h=harness([{contact:{id:'contact_4'}},{contact:{id:'contact_4'}}]);
  await h.adapters.add_or_remove_tag({packet:{targetId:'contact_4'},payload:{operation:'add',tags:['Executive']}});
  await h.adapters.add_or_remove_tag({packet:{targetId:'contact_4'},payload:{operation:'remove',tags:['Old']}});
  assert.deepEqual(h.calls,[
    {method:'POST',path:'/contacts/contact_4/tags',body:{tags:['Executive']}},
    {method:'DELETE',path:'/contacts/contact_4/tags',body:{tags:['Old']}}
  ]);
});

test('GHL opportunity adapter updates one verified opportunity with reviewed fields',async()=>{
  const h=harness([{opportunity:{id:'opp_1'}}]);
  const result=await h.adapters.update_opportunity({packet:{targetId:'opp_1'},payload:{opportunity:{pipelineStageId:'stage_2',status:'open',privateField:'ignored'}}});
  assert.deepEqual(h.calls,[{method:'PUT',path:'/opportunities/opp_1',body:{status:'open',pipelineStageId:'stage_2'}}]);
  assert.equal(result.providerResponseId,'opp_1');
});

test('GHL mutation adapters reject bulk work and unverified contact identity',async()=>{
  const h=harness();
  await assert.rejects(()=>h.adapters.send_sms({packet:{targetId:'all contacts'},payload:{message:'Hello'}}),/one verified record/);
  await assert.rejects(()=>h.adapters.upsert_contact({packet:{},payload:{contact:{name:'Name only'}}}),/verified email address or phone number/);
  assert.equal(h.calls.length,0);
});
