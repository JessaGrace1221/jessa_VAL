const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {
  normalizeKrispDocumentId,
  isKrispDocumentId,
  normalizeKrispDocument,
  sanitizeKrispDocumentInspection,
  krispSearchPhrasesFromInput,
  krispTranscriptPayloadFromDocument
}=require('../services/krispMcpService');

const root=path.resolve(__dirname,'..');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
function mcpResponse(body,options={}){
  return new Response(JSON.stringify(body),{
    status:options.status||200,
    headers:{'content-type':'application/json',...(options.headers||{})}
  });
}

test('normalizes Krisp document IDs for MCP get_document calls',()=>{
  const dashed='12345678-90ab-cdef-1234-567890abcdef';
  assert.equal(normalizeKrispDocumentId(dashed),'1234567890abcdef1234567890abcdef');
  assert.equal(isKrispDocumentId(dashed),true);
  assert.equal(isKrispDocumentId('not-a-document'),false);
});

test('extracts searchable meeting title from Krisp share links',()=>{
  const phrases=krispSearchPhrasesFromInput('https://app.krisp.ai/t/Monday-Touch-Point-w-Jessa--019f37f754167298ab49aad28647a098?tr_utm_source=share_link');
  assert.ok(phrases.includes('Monday Touch Point w Jessa'));
  assert.ok(phrases.includes('Find all project pages mentioning "Monday Touch Point w Jessa"'));
  assert.ok(phrases.includes('Get meeting 019f37f754167298ab49aad28647a098 by ID'));
});

test('converts a Krisp document into a real transcript payload',()=>{
  const document={
    documentId:'1234567890abcdef1234567890abcdef',
    title:'Aric / Frisson working session',
    startedAt:'2026-07-09T14:00:00.000Z',
    participants:[{name:'Aric Soyring',email:'aric@example.com'}],
    transcript:{
      utterances:[
        {speaker:'Jessa',start:12,text:'Let me send Aric the dashboard notes after this call.'},
        {speaker:'Aric',start:18,text:'I will review them on Friday.'}
      ]
    },
    summary:{keyPoints:['Dashboard notes and Friday review.']},
    actionItems:[{text:'Jessa sends notes'}]
  };
  const normalized=normalizeKrispDocument(document);
  assert.match(normalized.transcriptText,/Jessa.*dashboard notes/);
  assert.equal(normalized.participants[0].email,'aric@example.com');
  const payload=krispTranscriptPayloadFromDocument(document);
  assert.equal(payload.id,'krisp_1234567890abcdef1234567890abcdef');
  assert.equal(payload.source,'krisp_mcp');
  assert.equal(payload.type,'meeting_transcript');
  assert.equal(payload.metadata.krispActionItems.length,1);
  assert.deepEqual(payload.metadata.krispSourceSections.actionItems,document.actionItems);
  assert.deepEqual(payload.metadata.krispSourceSections.keyPoints,document.summary);
  assert.equal(payload.metadata.importedVia,'krisp_mcp');
  assert.match(payload.transcript,/Friday/);
});

test('sanitizes Krisp inspection output without leaking raw documents',()=>{
  const transcriptText='Jessa: This is private transcript text that should only appear as a short preview for debugging.';
  const inspection=sanitizeKrispDocumentInspection({
    documentId:'1234567890abcdef1234567890abcdef',
    title:'Sensitive client meeting',
    transcriptText,
    summary:'Private summary.',
    actionItems:[{text:'Follow up'}],
    participants:[{name:'Jessa'}],
    rawKrispDocument:{secret:'do not return'}
  });
  assert.equal(inspection.hasTranscript,true);
  assert.equal(inspection.transcriptCharacters,transcriptText.length);
  assert.match(inspection.transcriptPreview,/private transcript text/);
  assert.equal(Object.hasOwn(inspection,'rawKrispDocument'),false);
  assert.equal(Object.hasOwn(inspection,'raw'),false);
});

test('inspection summaries preserve original Krisp raw fields after normalization',()=>{
  const normalized=normalizeKrispDocument({
    results:[{id:'1234567890abcdef1234567890abcdef',document:null}],
    requestedCount:1,
    foundCount:0
  });
  const inspection=sanitizeKrispDocumentInspection(normalized);
  assert.deepEqual(inspection.fields,['results','requestedCount','foundCount']);
  assert.deepEqual(inspection.rawCounts,{requestedCount:1,foundCount:0,resultsLength:1});
  assert.equal(inspection.hasTranscript,false);
});

test('searches Krisp meetings with Krisp-native search and date parameters',async()=>{
  const calls=[];
  const svc=require('../services/krispMcpService').createKrispMcpService({
    resolveSecret:async()=>'token',
    logger:{warn(){}},
    timeoutMs:1000
  });
  let initialized=false;
  const originalFetch=global.fetch;
  global.fetch=async(_url,options={})=>{
    const body=JSON.parse(options.body||'{}');
    calls.push(body);
    if(body.method==='initialize')return mcpResponse({jsonrpc:'2.0',id:body.id,result:{protocolVersion:'2025-06-18',capabilities:{tools:{}},serverInfo:{name:'krisp-test',version:'1.0.0'}}},{headers:{'mcp-session-id':'test-session'}});
    if(body.method==='notifications/initialized')return mcpResponse({jsonrpc:'2.0',id:body.id,result:{}});
    if(body.method==='tools/list')return mcpResponse({jsonrpc:'2.0',id:body.id,result:{tools:[{name:'get_document',description:'Fetch document',inputSchema:{type:'object',properties:{}}}]}});
    if(body.method==='tools/call'){
      initialized=true;
      assert.equal(body.params.name,'search_meetings');
      assert.equal(body.params.arguments.search,'Frisson');
      assert.equal(body.params.arguments.after,'2026-07-01');
      assert.equal(body.params.arguments.before,'2026-07-09');
      return mcpResponse({jsonrpc:'2.0',id:body.id,result:{content:[{type:'text',text:JSON.stringify({meetings:[{documentId:'1234567890abcdef1234567890abcdef',title:'Frisson call'}]})}]}});
    }
    return mcpResponse({jsonrpc:'2.0',id:body.id,result:{}});
  };
  try{
    const meetings=await svc.searchMeetings({query:'Frisson',from:'2026-07-01T00:00:00.000Z',to:'2026-07-09T00:00:00.000Z',limit:5});
    assert.equal(initialized,true);
    assert.equal(meetings[0].documentId,'1234567890abcdef1234567890abcdef');
    assert.ok(calls.some(call=>call.method==='notifications/initialized'));
  }finally{
    global.fetch=originalFetch;
  }
});

test('verifies Krisp transcript receipts through the date-filtered meeting index',async()=>{
  const {createKrispMcpService}=require('../services/krispMcpService');
  const svc=createKrispMcpService({resolveSecret:async()=>'token',logger:{warn(){}},timeoutMs:1000});
  const originalFetch=global.fetch;
  const calls=[];
  global.fetch=async(_url,options={})=>{
    const body=JSON.parse(options.body||'{}');
    calls.push(body);
    if(body.method==='initialize')return mcpResponse({jsonrpc:'2.0',id:body.id,result:{protocolVersion:'2025-06-18',capabilities:{tools:{}},serverInfo:{name:'krisp-test',version:'1.0.0'}}},{headers:{'mcp-session-id':'test-session'}});
    if(body.method==='notifications/initialized')return mcpResponse({jsonrpc:'2.0',id:body.id,result:{}});
    if(body.method==='tools/list')return mcpResponse({jsonrpc:'2.0',id:body.id,result:{tools:[
      {name:'search_meetings',description:'Search meetings',inputSchema:{type:'object',properties:{after:{type:'string'},before:{type:'string'},limit:{type:'integer'},fields:{type:'array'},isOwner:{type:'boolean'},sharedWithMe:{type:'boolean'}}}},
      {name:'list_action_items',description:'List action items',inputSchema:{type:'object',properties:{limit:{type:'integer'}}}}
    ]}});
    if(body.method==='tools/call'&&body.params.name==='search_meetings'){
      assert.equal(body.params.arguments.after,'2026-04-16');
      assert.equal(body.params.arguments.before,'2026-07-15');
      return mcpResponse({jsonrpc:'2.0',id:body.id,result:{structuredContent:{meetings:[{meeting_id:'1234567890abcdef1234567890abcdef',name:'Krisp meeting'}]}}});
    }
    throw new Error('Unexpected MCP call: '+body.params?.name);
  };
  try{
    const discovery=await svc.discoverTranscriptReceipts({from:'2026-04-16T00:00:00.000Z',to:'2026-07-15T23:59:59.999Z',limit:50});
    assert.equal(discovery.status,'complete');
    assert.equal(discovery.documents.length,1);
    assert.equal(discovery.probes[0].label,'Meetings available to this Krisp account');
    assert.ok(calls.some(call=>call.params?.name==='search_meetings'));
    assert.equal(calls.some(call=>call.params?.name==='list_action_items'),false);
  }finally{
    global.fetch=originalFetch;
  }
});

test('falls back through owned, shared, and action-item meeting indexes when the broad Krisp search is empty',async()=>{
  const {createKrispMcpService}=require('../services/krispMcpService');
  const svc=createKrispMcpService({resolveSecret:async()=>'token',logger:{warn(){}},timeoutMs:1000});
  const originalFetch=global.fetch;
  const calls=[];
  global.fetch=async(_url,options={})=>{
    const body=JSON.parse(options.body||'{}');
    calls.push(body);
    if(body.method==='initialize')return mcpResponse({jsonrpc:'2.0',id:body.id,result:{protocolVersion:'2025-06-18',capabilities:{tools:{}},serverInfo:{name:'krisp-test',version:'1.0.0'}}},{headers:{'mcp-session-id':'test-session'} });
    if(body.method==='notifications/initialized')return mcpResponse({jsonrpc:'2.0',id:body.id,result:{}});
    if(body.method==='tools/list')return mcpResponse({jsonrpc:'2.0',id:body.id,result:{tools:[
      {name:'search_meetings',description:'Search meetings',inputSchema:{type:'object',properties:{after:{type:'string'},before:{type:'string'},limit:{type:'integer'},fields:{type:'array'},isOwner:{type:'boolean'},sharedWithMe:{type:'boolean'}}}},
      {name:'list_action_items',description:'List action items',inputSchema:{type:'object',properties:{limit:{type:'integer'}}}}
    ]}});
    if(body.method==='tools/call'&&body.params.name==='search_meetings')return mcpResponse({jsonrpc:'2.0',id:body.id,result:{structuredContent:{meetings:[]}}});
    if(body.method==='tools/call'&&body.params.name==='list_action_items')return mcpResponse({jsonrpc:'2.0',id:body.id,result:{structuredContent:{action_items:[{meeting_id:'abcdefabcdefabcdefabcdefabcdefab',meeting_name:'Action item source meeting',meeting_date:'2026-07-14T14:00:00.000Z'}]}}});
    throw new Error('Unexpected MCP call: '+body.params?.name);
  };
  try{
    const discovery=await svc.discoverTranscriptReceipts({from:'2026-06-16T00:00:00.000Z',to:'2026-07-16T23:59:59.999Z',limit:50});
    assert.equal(discovery.status,'complete');
    assert.equal(discovery.documents.length,1);
    assert.equal(discovery.documents[0].documentId,'abcdefabcdefabcdefabcdefabcdefab');
    assert.ok(calls.some(call=>call.params?.name==='search_meetings'&&call.params.arguments.isOwner===true));
    assert.ok(calls.some(call=>call.params?.name==='search_meetings'&&call.params.arguments.sharedWithMe===true));
    assert.ok(calls.some(call=>call.params?.name==='list_action_items'));
    assert.ok(discovery.probes.some(probe=>probe.label==='Meetings linked to Krisp action items'&&probe.returned===1));
  }finally{
    global.fetch=originalFetch;
  }
});

test('falls back to the workspace-wide Krisp content index when metadata indexes are empty',async()=>{
  const {createKrispMcpService}=require('../services/krispMcpService');
  const svc=createKrispMcpService({resolveSecret:async()=>'token',logger:{warn(){}},timeoutMs:1000});
  const originalFetch=global.fetch;
  const calls=[];
  global.fetch=async(_url,options={})=>{
    const body=JSON.parse(options.body||'{}');
    calls.push(body);
    if(body.method==='initialize')return mcpResponse({jsonrpc:'2.0',id:body.id,result:{protocolVersion:'2025-06-18',capabilities:{tools:{}},serverInfo:{name:'krisp-test',version:'1.0.0'}}},{headers:{'mcp-session-id':'test-session'}});
    if(body.method==='notifications/initialized')return mcpResponse({jsonrpc:'2.0',id:body.id,result:{}});
    if(body.method==='tools/list')return mcpResponse({jsonrpc:'2.0',id:body.id,result:{tools:[
      {name:'search_meetings',description:'Search meetings',inputSchema:{type:'object',properties:{after:{type:'string'},before:{type:'string'},limit:{type:'integer'},fields:{type:'array'},isOwner:{type:'boolean'},sharedWithMe:{type:'boolean'}}}},
      {name:'list_action_items',description:'List action items',inputSchema:{type:'object',properties:{limit:{type:'integer'}}}},
      {name:'search_meeting_content',description:'Search meeting content',inputSchema:{type:'object',properties:{search:{type:'string'},after:{type:'string'},before:{type:'string'},limit:{type:'integer'},fields:{type:'array'}}}}
    ]}});
    if(body.method==='tools/call'&&body.params.name==='search_meetings')return mcpResponse({jsonrpc:'2.0',id:body.id,result:{structuredContent:{meetings:[]}}});
    if(body.method==='tools/call'&&body.params.name==='list_action_items')return mcpResponse({jsonrpc:'2.0',id:body.id,result:{structuredContent:{action_items:[]}}});
    if(body.method==='tools/call'&&body.params.name==='search_meeting_content'){
      assert.equal(body.params.arguments.search,'the');
      assert.equal(body.params.arguments.after,'2026-06-16');
      assert.equal(body.params.arguments.before,'2026-07-16');
      return mcpResponse({jsonrpc:'2.0',id:body.id,result:{structuredContent:{documents:[{document_id:'1234567890abcdef1234567890abcdef',title:'Meeting recovered from content',date:'2026-07-14T14:00:00.000Z'}]}}});
    }
    throw new Error('Unexpected MCP call: '+body.params?.name);
  };
  try{
    const discovery=await svc.discoverTranscriptReceipts({from:'2026-06-16T00:00:00.000Z',to:'2026-07-16T23:59:59.999Z',limit:50});
    assert.equal(discovery.status,'complete');
    assert.equal(discovery.documents.length,1);
    assert.equal(discovery.documents[0].documentId,'1234567890abcdef1234567890abcdef');
    assert.equal(discovery.documents[0].source,'search_meeting_content');
    assert.ok(calls.some(call=>call.params?.name==='search_meeting_content'));
    assert.ok(discovery.probes.some(probe=>probe.label==='Meeting content across accessible Krisp transcripts'&&probe.returned===1));
  }finally{
    global.fetch=originalFetch;
  }
});

test('falls back to meetings inside accessible Krisp folders when global indexes are empty',async()=>{
  const {createKrispMcpService}=require('../services/krispMcpService');
  const svc=createKrispMcpService({resolveSecret:async()=>'token',logger:{warn(){}},timeoutMs:1000});
  const originalFetch=global.fetch;
  const calls=[];
  global.fetch=async(_url,options={})=>{
    const body=JSON.parse(options.body||'{}');
    calls.push(body);
    if(body.method==='initialize')return mcpResponse({jsonrpc:'2.0',id:body.id,result:{protocolVersion:'2025-06-18',capabilities:{tools:{}},serverInfo:{name:'krisp-test',version:'1.0.0'}}},{headers:{'mcp-session-id':'test-session'}});
    if(body.method==='notifications/initialized')return mcpResponse({jsonrpc:'2.0',id:body.id,result:{}});
    if(body.method==='tools/list')return mcpResponse({jsonrpc:'2.0',id:body.id,result:{tools:[
      {name:'search_meetings',description:'Search meetings',inputSchema:{type:'object',properties:{after:{type:'string'},before:{type:'string'},limit:{type:'integer'},fields:{type:'array'},isOwner:{type:'boolean'},sharedWithMe:{type:'boolean'}}}},
      {name:'list_action_items',description:'List action items',inputSchema:{type:'object',properties:{limit:{type:'integer'}}}},
      {name:'listFolders',description:'List folders',inputSchema:{type:'object',properties:{limit:{type:'integer'}}}},
      {name:'getFolder',description:'Get folder',inputSchema:{type:'object',properties:{folder_id:{type:'string'},limit:{type:'integer'}}}}
    ]}});
    if(body.method==='tools/call'&&body.params.name==='search_meetings')return mcpResponse({jsonrpc:'2.0',id:body.id,result:{structuredContent:{meetings:[]}}});
    if(body.method==='tools/call'&&body.params.name==='list_action_items')return mcpResponse({jsonrpc:'2.0',id:body.id,result:{structuredContent:{action_items:[]}}});
    if(body.method==='tools/call'&&body.params.name==='listFolders')return mcpResponse({jsonrpc:'2.0',id:body.id,result:{structuredContent:{folders:[{folder_id:'abcdefabcdefabcdefabcdefabcdefab',meeting_count:2}]}}});
    if(body.method==='tools/call'&&body.params.name==='getFolder'){
      assert.equal(body.params.arguments.folder_id,'abcdefabcdefabcdefabcdefabcdefab');
      return mcpResponse({jsonrpc:'2.0',id:body.id,result:{structuredContent:{meetings:[{meeting_id:'1234567890abcdef1234567890abcdef',name:'Folder meeting',date:'2026-07-14T14:00:00.000Z'}]}}});
    }
    throw new Error('Unexpected MCP call: '+body.params?.name);
  };
  try{
    const discovery=await svc.discoverTranscriptReceipts({from:'2026-06-16T00:00:00.000Z',to:'2026-07-16T23:59:59.999Z',limit:50});
    assert.equal(discovery.status,'complete');
    assert.equal(discovery.documents.length,1);
    assert.equal(discovery.documents[0].documentId,'1234567890abcdef1234567890abcdef');
    assert.equal(discovery.documents[0].source,'getFolder');
    assert.ok(calls.some(call=>call.params?.name==='listFolders'));
    assert.ok(calls.some(call=>call.params?.name==='getFolder'));
    assert.ok(discovery.probes.some(probe=>probe.label==='Meetings inside accessible Krisp folders'&&probe.returned===1));
  }finally{
    global.fetch=originalFetch;
  }
});

test('tries Krisp document ID argument shapes until transcript text is returned',async()=>{
  const {createKrispMcpService}=require('../services/krispMcpService');
  const svc=createKrispMcpService({
    resolveSecret:async()=>'token',
    logger:{warn(){}},
    timeoutMs:1000
  });
  const originalFetch=global.fetch;
  const calls=[];
  global.fetch=async(_url,options={})=>{
    const body=JSON.parse(options.body||'{}');
    calls.push(body);
    if(body.method==='initialize')return mcpResponse({jsonrpc:'2.0',id:body.id,result:{protocolVersion:'2025-06-18',capabilities:{tools:{}},serverInfo:{name:'krisp-test',version:'1.0.0'}}},{headers:{'mcp-session-id':'test-session'}});
    if(body.method==='notifications/initialized')return mcpResponse({jsonrpc:'2.0',id:body.id,result:{}});
    if(body.method==='tools/list')return mcpResponse({jsonrpc:'2.0',id:body.id,result:{tools:[{name:'get_document',description:'Fetch document',inputSchema:{type:'object',properties:{}}}]}});
    if(body.method==='tools/call'){
      if(body.params.name==='get_document'&&body.params.arguments.document_id){
        return mcpResponse({jsonrpc:'2.0',id:body.id,result:{content:[{type:'text',text:JSON.stringify({documentId:'1234567890abcdef1234567890abcdef',title:'Shell only'})}]}});
      }
      if(body.params.name==='get_document'&&body.params.arguments.id){
        return mcpResponse({jsonrpc:'2.0',id:body.id,result:{content:[{type:'text',text:JSON.stringify({documentId:'1234567890abcdef1234567890abcdef',title:'Transcript',transcript:'Jessa: This is the transcript.'})}]}});
      }
    }
    return mcpResponse({jsonrpc:'2.0',id:body.id,result:{}});
  };
  try{
    const document=await svc.getDocument('12345678-90ab-cdef-1234-567890abcdef');
    assert.match(document.transcriptText,/This is the transcript/);
    assert.ok(calls.some(call=>call.params?.arguments?.document_id));
    assert.ok(calls.some(call=>call.params?.arguments?.id));
  }finally{
    global.fetch=originalFetch;
  }
});

test('falls back to Krisp get_multiple_documents when get_document is shallow',async()=>{
  const {createKrispMcpService}=require('../services/krispMcpService');
  const svc=createKrispMcpService({
    resolveSecret:async()=>'token',
    logger:{warn(){}},
    timeoutMs:1000
  });
  const originalFetch=global.fetch;
  global.fetch=async(_url,options={})=>{
    const body=JSON.parse(options.body||'{}');
    if(body.method==='initialize')return mcpResponse({jsonrpc:'2.0',id:body.id,result:{protocolVersion:'2025-06-18',capabilities:{tools:{}},serverInfo:{name:'krisp-test',version:'1.0.0'}}},{headers:{'mcp-session-id':'test-session'}});
    if(body.method==='notifications/initialized')return mcpResponse({jsonrpc:'2.0',id:body.id,result:{}});
    if(body.method==='tools/list')return mcpResponse({jsonrpc:'2.0',id:body.id,result:{tools:[]}});
    if(body.method==='tools/call'&&body.params.name==='get_document'){
      return mcpResponse({jsonrpc:'2.0',id:body.id,result:{structuredContent:{documentId:'1234567890abcdef1234567890abcdef',title:'Shell only'}}});
    }
    if(body.method==='tools/call'&&body.params.name==='get_multiple_documents'){
      return mcpResponse({jsonrpc:'2.0',id:body.id,result:{structuredContent:{documents:[{documentId:'1234567890abcdef1234567890abcdef',title:'Full',transcriptText:'Aric: Full transcript body.'}]}}});
    }
    return mcpResponse({jsonrpc:'2.0',id:body.id,result:{}});
  };
  try{
    const document=await svc.getDocument('1234567890abcdef1234567890abcdef');
    assert.match(document.transcriptText,/Full transcript body/);
  }finally{
    global.fetch=originalFetch;
  }
});

test('uses documented Krisp get_multiple_documents ids shape before fallbacks',async()=>{
  const {createKrispMcpService}=require('../services/krispMcpService');
  const svc=createKrispMcpService({
    resolveSecret:async()=>'token',
    logger:{warn(){}},
    timeoutMs:1000
  });
  const originalFetch=global.fetch;
  const calls=[];
  global.fetch=async(_url,options={})=>{
    const body=JSON.parse(options.body||'{}');
    calls.push(body);
    if(body.method==='initialize')return mcpResponse({jsonrpc:'2.0',id:body.id,result:{protocolVersion:'2025-06-18',capabilities:{tools:{}},serverInfo:{name:'krisp-test',version:'1.0.0'}}},{headers:{'mcp-session-id':'test-session'}});
    if(body.method==='notifications/initialized')return mcpResponse({jsonrpc:'2.0',id:body.id,result:{}});
    if(body.method==='tools/list')return mcpResponse({jsonrpc:'2.0',id:body.id,result:{tools:[{name:'get_multiple_documents',description:'Fetch documents',inputSchema:{type:'object',properties:{ids:{type:'array'}},required:['ids']}}]}});
    if(body.method==='tools/call'&&body.params.name==='get_multiple_documents'){
      assert.deepEqual(body.params.arguments,{ids:['1234567890abcdef1234567890abcdef']});
      return mcpResponse({jsonrpc:'2.0',id:body.id,result:{structuredContent:[{id:'1234567890abcdef1234567890abcdef',document:'Jessa: Full transcript from Krisp document.'}]}});
    }
    return mcpResponse({jsonrpc:'2.0',id:body.id,result:{}});
  };
  try{
    const document=await svc.getDocument('1234567890abcdef1234567890abcdef');
    assert.match(document.transcriptText,/Full transcript from Krisp document/);
    const toolCalls=calls.filter(call=>call.method==='tools/call');
    assert.deepEqual(toolCalls[0].params.arguments,{ids:['1234567890abcdef1234567890abcdef']});
    assert.equal(toolCalls.some(call=>call.params?.arguments?.document_ids),false);
  }finally{
    global.fetch=originalFetch;
  }
});

test('resolves direct Krisp IDs before searching to avoid rate-limit bursts',async()=>{
  const {createKrispMcpService}=require('../services/krispMcpService');
  const svc=createKrispMcpService({
    resolveSecret:async()=>'token',
    logger:{warn(){}},
    timeoutMs:1000
  });
  const originalFetch=global.fetch;
  const toolCalls=[];
  global.fetch=async(_url,options={})=>{
    const body=JSON.parse(options.body||'{}');
    if(body.method==='initialize')return mcpResponse({jsonrpc:'2.0',id:body.id,result:{protocolVersion:'2025-06-18',capabilities:{tools:{}},serverInfo:{name:'krisp-test',version:'1.0.0'}}},{headers:{'mcp-session-id':'test-session'}});
    if(body.method==='notifications/initialized')return mcpResponse({jsonrpc:'2.0',id:body.id,result:{}});
    if(body.method==='tools/list')return mcpResponse({jsonrpc:'2.0',id:body.id,result:{tools:[{name:'get_multiple_documents',description:'Fetch documents',inputSchema:{type:'object',properties:{ids:{type:'array'}},required:['ids']}},{name:'search_meetings',description:'Search meetings',inputSchema:{type:'object',properties:{search:{type:'string'}}}}]}});
    if(body.method==='tools/call'){
      toolCalls.push(body.params.name);
      if(body.params.name==='search_meetings')throw new Error('search_meetings should not run when direct document has transcript text');
      return mcpResponse({jsonrpc:'2.0',id:body.id,result:{structuredContent:[{id:'1234567890abcdef1234567890abcdef',document:'Jessa: Direct transcript body.'}]}});
    }
    return mcpResponse({jsonrpc:'2.0',id:body.id,result:{}});
  };
  try{
    const resolved=await svc.resolveTranscriptDocument('https://app.krisp.ai/t/Test--1234567890abcdef1234567890abcdef');
    assert.equal(resolved.ok,true);
    assert.match(resolved.document.transcriptText,/Direct transcript body/);
    assert.equal(toolCalls.includes('search_meetings'),false);
    assert.ok(toolCalls.every(name=>name==='get_multiple_documents'));
  }finally{
    global.fetch=originalFetch;
  }
});

test('inspect defaults to direct-only and skips Krisp search fanout',async()=>{
  const {createKrispMcpService}=require('../services/krispMcpService');
  const svc=createKrispMcpService({
    resolveSecret:async()=>'token',
    logger:{warn(){}},
    timeoutMs:1000
  });
  const originalFetch=global.fetch;
  const toolCalls=[];
  global.fetch=async(_url,options={})=>{
    const body=JSON.parse(options.body||'{}');
    if(body.method==='initialize')return mcpResponse({jsonrpc:'2.0',id:body.id,result:{protocolVersion:'2025-06-18',capabilities:{tools:{}},serverInfo:{name:'krisp-test',version:'1.0.0'}}},{headers:{'mcp-session-id':'test-session'}});
    if(body.method==='notifications/initialized')return mcpResponse({jsonrpc:'2.0',id:body.id,result:{}});
    if(body.method==='tools/list')return mcpResponse({jsonrpc:'2.0',id:body.id,result:{tools:[
      {name:'get_multiple_documents',description:'Fetch documents',inputSchema:{type:'object',properties:{ids:{type:'array'}},required:['ids']}},
      {name:'search_meetings',description:'Search meetings',inputSchema:{type:'object',properties:{search:{type:'string'}}}}
    ]}});
    if(body.method==='tools/call'){
      toolCalls.push(body.params.name);
      if(body.params.name==='search_meetings')throw new Error('inspect should not search by default');
      return mcpResponse({jsonrpc:'2.0',id:body.id,result:{structuredContent:[{id:'1234567890abcdef1234567890abcdef',document:null}]}});
    }
    return mcpResponse({jsonrpc:'2.0',id:body.id,result:{}});
  };
  try{
    const inspection=await svc.inspectTranscriptDocument('https://app.krisp.ai/t/Test--1234567890abcdef1234567890abcdef');
    assert.equal(inspection.resolved,false);
    assert.equal(inspection.searchUsed,false);
    assert.equal(inspection.searchSkipped,true);
    assert.ok(toolCalls.every(name=>name==='get_multiple_documents'));
  }finally{
    global.fetch=originalFetch;
  }
});

test('recent Krisp candidate search surfaces upstream errors instead of empty results',async()=>{
  const {createKrispMcpService}=require('../services/krispMcpService');
  const svc=createKrispMcpService({
    resolveSecret:async()=>'token',
    logger:{warn(){}},
    timeoutMs:1000
  });
  const originalFetch=global.fetch;
  global.fetch=async(_url,options={})=>{
    const body=JSON.parse(options.body||'{}');
    if(body.method==='initialize')return mcpResponse({jsonrpc:'2.0',id:body.id,result:{protocolVersion:'2025-06-18',capabilities:{tools:{}},serverInfo:{name:'krisp-test',version:'1.0.0'}}},{headers:{'mcp-session-id':'test-session'}});
    if(body.method==='notifications/initialized')return mcpResponse({jsonrpc:'2.0',id:body.id,result:{}});
    if(body.method==='tools/list')return mcpResponse({jsonrpc:'2.0',id:body.id,result:{tools:[{name:'search_meetings',description:'Search meetings',inputSchema:{type:'object',properties:{search:{type:'string'}}}}]}});
    if(body.method==='tools/call')return mcpResponse({jsonrpc:'2.0',id:body.id,error:{code:-32000,message:'Error 502: Bad gateway retry_after:60'}});
    return mcpResponse({jsonrpc:'2.0',id:body.id,result:{}});
  };
  try{
    await assert.rejects(
      ()=>svc.listDocumentCandidates({query:'meeting',limit:2}),
      /502|Bad gateway/
    );
  }finally{
    global.fetch=originalFetch;
  }
});

test('resolves a pasted Krisp meeting ID through search before fetching transcript document',async()=>{
  const {createKrispMcpService}=require('../services/krispMcpService');
  const meetingId='aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  const transcriptId='bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
  const svc=createKrispMcpService({
    resolveSecret:async()=>'token',
    logger:{warn(){}},
    timeoutMs:1000
  });
  const originalFetch=global.fetch;
  global.fetch=async(_url,options={})=>{
    const body=JSON.parse(options.body||'{}');
    if(body.method==='initialize')return mcpResponse({jsonrpc:'2.0',id:body.id,result:{protocolVersion:'2025-06-18',capabilities:{tools:{}},serverInfo:{name:'krisp-test',version:'1.0.0'}}},{headers:{'mcp-session-id':'test-session'}});
    if(body.method==='notifications/initialized')return mcpResponse({jsonrpc:'2.0',id:body.id,result:{}});
    if(body.method==='tools/list')return mcpResponse({jsonrpc:'2.0',id:body.id,result:{tools:[]}});
    if(body.method==='tools/call'&&body.params.name==='search_meetings'){
      return mcpResponse({jsonrpc:'2.0',id:body.id,result:{structuredContent:{meetings:[{documentId:transcriptId,title:'Transcript result'}]}}});
    }
    if(body.method==='tools/call'&&body.params.name==='get_multiple_documents'){
      const id=(body.params.arguments.ids||[])[0]||'';
      const transcriptText=id===transcriptId?'Jessa: Full transcript from search result.':'';
      return mcpResponse({jsonrpc:'2.0',id:body.id,result:{structuredContent:{documents:[{documentId:id,title:'Krisp doc',transcriptText}]}}});
    }
    return mcpResponse({jsonrpc:'2.0',id:body.id,result:{}});
  };
  try{
    const resolved=await svc.resolveTranscriptDocument(meetingId,{limit:4});
    assert.equal(resolved.ok,true);
    assert.equal(resolved.candidate.documentId,transcriptId);
    assert.match(resolved.document.transcriptText,/Full transcript/);
  }finally{
    global.fetch=originalFetch;
  }
});

test('server exposes Krisp OAuth as the transcript witness connector',()=>{
  assert.match(server,/createKrispMcpService/);
  assert.match(server,/providerId:'krisp'/);
  assert.match(server,/\/api\/val\/krisp\/status/);
  assert.match(server,/app\.get\('\/auth\/krisp'/);
  assert.match(server,/app\.get\('\/auth\/krisp\/start'/);
  assert.match(server,/app\.get\('\/auth\/krisp\/callback'/);
  assert.match(server,/CONFIGURED_KRISP_OAUTH_METADATA\|\|await discoverKrispOAuthMetadata\(\)/);
  assert.match(server,/code_challenge_method:'S256'/);
  assert.match(server,/code_verifier:pending\.verifier/);
  assert.match(server,/Opening Krisp securely/);
  assert.match(server,/oauth_client_id:registered\.clientId/);
  assert.match(server,/Krisp transcripts are connected to VAL/);
  assert.doesNotMatch(server,/\/api\/val\/krisp\/import/);
});
