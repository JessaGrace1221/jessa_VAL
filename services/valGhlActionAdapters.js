function compactText(value,limit=4000){
  return String(value||'').replace(/\s+/g,' ').trim().slice(0,limit);
}

function compactObject(value={},allowed=[]){
  const result={};
  for(const key of allowed){
    const current=value?.[key];
    if(current===undefined||current===null||current==='')continue;
    result[key]=current;
  }
  return result;
}

function providerId(data={},keys=[]){
  for(const key of keys){
    const value=key.split('.').reduce((current,part)=>current?.[part],data);
    if(value)return String(value);
  }
  return '';
}

function targetId(packet={},payload={},key='contactId'){
  return compactText(payload[key]||packet.targetId||packet.target_id,320);
}

function requireSingleRecord(packet={},payload={}){
  const text=[packet.targetId,packet.whyThisActionExists,JSON.stringify(payload)].join(' ');
  if(/\b(bulk|all contacts|all clients|everyone|entire list)\b/i.test(text)){
    throw new Error('GHL actions must target one verified record at a time.');
  }
}

function createValGhlActionAdapters({requestStrict,smsStatusAttempts=6,smsStatusDelayMs=250,sleep=(ms)=>new Promise(resolve=>setTimeout(resolve,ms))}={}){
  if(typeof requestStrict!=='function')throw new Error('createValGhlActionAdapters requires requestStrict');

  async function confirmSmsStatus(messageId){
    let latest={};
    for(let attempt=0;attempt<Math.max(1,Number(smsStatusAttempts)||1);attempt+=1){
      const data=await requestStrict('GET',`/conversations/messages/${encodeURIComponent(messageId)}`);
      latest=data?.message||data||{};
      const status=compactText(latest.status,40).toLowerCase();
      if(['failed','undelivered','canceled','cancelled'].includes(status)){
        const detail=compactText(latest.error||latest.failureReason||latest.errorMessage||latest.message,600)||status;
        throw new Error(`GHL SMS failed: ${detail}`);
      }
      if(['sent','delivered','read'].includes(status))return {status,raw:latest,confirmationPending:false};
      if(attempt+1<Math.max(1,Number(smsStatusAttempts)||1))await sleep(Math.max(0,Number(smsStatusDelayMs)||0));
    }
    return {status:compactText(latest.status,40).toLowerCase()||'pending',raw:latest,confirmationPending:true};
  }

  async function sendSms({packet={},payload={}}={}){
    requireSingleRecord(packet,payload);
    const contactId=targetId(packet,payload);
    const message=compactText(payload.message||payload.body||payload.bodyPreview,12000);
    if(!contactId)throw new Error('SMS requires a verified GHL contact id.');
    if(!message)throw new Error('SMS requires message text.');
    const data=await requestStrict('POST','/conversations/messages',{type:'SMS',contactId,message});
    const messageId=providerId(data,['messageId','message.id','id']);
    if(!messageId)throw new Error('GHL accepted the SMS request without returning a message id; delivery cannot be verified.');
    const confirmation=await confirmSmsStatus(messageId);
    const summary=confirmation.status==='delivered'||confirmation.status==='read'
      ? `GHL confirmed SMS delivery to contact ${contactId}.`
      : confirmation.status==='sent'
        ? `GHL confirmed SMS carrier submission for contact ${contactId}; final delivery is not yet confirmed.`
        : `GHL accepted the SMS for contact ${contactId}; delivery confirmation is still pending.`;
    return {
      providerResponseId:messageId,
      providerResponseSummary:summary,
      providerDeliveryStatus:confirmation.status,
      providerConfirmationPending:confirmation.confirmationPending,
      raw:{submission:data,message:confirmation.raw}
    };
  }

  async function upsertContact({packet={},payload={}}={}){
    requireSingleRecord(packet,payload);
    const source=payload.contact&&typeof payload.contact==='object'?payload.contact:payload;
    const body=compactObject(source,[
      'firstName','lastName','name','email','phone','address1','city','state','country',
      'postalCode','website','timezone','source','companyName','assignedTo','customFields'
    ]);
    if(!body.email&&!body.phone)throw new Error('Contact upsert requires a verified email address or phone number.');
    body.locationId='';
    body.createNewIfDuplicateAllowed=false;
    const data=await requestStrict('POST','/contacts/upsert',body);
    const id=providerId(data,['contact.id','newContact.id','id']);
    return {
      providerResponseId:id,
      providerResponseSummary:`Upserted one GHL contact${id?` (${id})`:''} using verified identity fields.`,
      raw:data
    };
  }

  async function updateContact({packet={},payload={}}={}){
    requireSingleRecord(packet,payload);
    const contactId=targetId(packet,payload);
    const source=payload.contact&&typeof payload.contact==='object'?payload.contact:payload;
    const body=compactObject(source,[
      'firstName','lastName','name','email','phone','address1','city','state','country',
      'postalCode','website','timezone','source','companyName','assignedTo','customFields'
    ]);
    if(!contactId)throw new Error('Contact update requires a verified GHL contact id.');
    if(!Object.keys(body).length)throw new Error('Contact update requires at least one reviewed field.');
    const data=await requestStrict('PUT',`/contacts/${encodeURIComponent(contactId)}`,body);
    return {
      providerResponseId:providerId(data,['contact.id','id'])||contactId,
      providerResponseSummary:`Updated one GHL contact (${contactId}).`,
      raw:data
    };
  }

  async function changeContactTags({packet={},payload={}}={}){
    requireSingleRecord(packet,payload);
    const contactId=targetId(packet,payload);
    const operation=compactText(payload.operation||payload.mode,20).toLowerCase();
    const tags=(Array.isArray(payload.tags)?payload.tags:[payload.tag]).map(tag=>compactText(tag,120)).filter(Boolean);
    if(!contactId)throw new Error('Tag change requires a verified GHL contact id.');
    if(!['add','remove'].includes(operation))throw new Error('Tag change operation must be add or remove.');
    if(!tags.length)throw new Error('Tag change requires at least one reviewed tag.');
    const method=operation==='add'?'POST':'DELETE';
    const data=await requestStrict(method,`/contacts/${encodeURIComponent(contactId)}/tags`,{tags});
    return {
      providerResponseId:providerId(data,['contact.id','id'])||contactId,
      providerResponseSummary:`${operation==='add'?'Added':'Removed'} ${tags.length} GHL tag${tags.length===1?'':'s'} for contact ${contactId}.`,
      raw:data
    };
  }

  async function updateOpportunity({packet={},payload={}}={}){
    requireSingleRecord(packet,payload);
    const opportunityId=targetId(packet,payload,'opportunityId');
    const source=payload.opportunity&&typeof payload.opportunity==='object'?payload.opportunity:payload;
    const body=compactObject(source,['name','status','pipelineId','pipelineStageId','monetaryValue','assignedTo']);
    if(!opportunityId)throw new Error('Opportunity update requires a verified GHL opportunity id.');
    if(!Object.keys(body).length)throw new Error('Opportunity update requires at least one reviewed field.');
    const data=await requestStrict('PUT',`/opportunities/${encodeURIComponent(opportunityId)}`,body);
    return {
      providerResponseId:providerId(data,['opportunity.id','id'])||opportunityId,
      providerResponseSummary:`Updated one GHL opportunity (${opportunityId}).`,
      raw:data
    };
  }

  return {
    send_sms:sendSms,
    upsert_contact:upsertContact,
    update_contact:updateContact,
    add_or_remove_tag:changeContactTags,
    update_opportunity:updateOpportunity,
    move_crm_stage:updateOpportunity
  };
}

module.exports={createValGhlActionAdapters};
