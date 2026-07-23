const test=require('node:test');
const assert=require('node:assert/strict');
const {createGhlMcpService}=require('../services/ghlMcpService');

test('GHL contact search uses only API-supported sorting parameters',async()=>{
  const originalFetch=global.fetch;
  let requestedUrl='';
  global.fetch=async url=>{
    requestedUrl=String(url);
    return new Response(JSON.stringify({contacts:[{id:'contact_1',firstName:'Jessa',lastName:'Grace',email:'jessa@example.com'}]}),{status:200});
  };

  try{
    const service=createGhlMcpService({
      fallbackApiKey:'test-key',
      fallbackLocationId:'location_1',
      resolveSecret:async(_provider,_type,fallback)=>fallback
    });
    const contacts=await service.searchContacts({query:'jessa@example.com'});

    assert.equal(contacts.length,1);
    assert.match(requestedUrl,/sortBy=date_added/);
    assert.doesNotMatch(requestedUrl,/sortDirection=/);
  }finally{
    global.fetch=originalFetch;
  }
});
