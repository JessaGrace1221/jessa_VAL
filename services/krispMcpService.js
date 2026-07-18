const DEFAULT_KRISP_MCP_URL = 'https://mcp.krisp.ai/mcp';
const MCP_PROTOCOL_VERSION = '2025-06-18';
let McpClient = null;
let StreamableHTTPClientTransport = null;
try{
  ({Client:McpClient}=require('@modelcontextprotocol/sdk/client'));
  ({StreamableHTTPClientTransport}=require('@modelcontextprotocol/sdk/client/streamableHttp.js'));
}catch(_){}

function compactText(value,limit=900){
  return String(value||'').replace(/\s+/g,' ').trim().slice(0,limit);
}

function jsonClone(value){
  return value&&typeof value==='object'?JSON.parse(JSON.stringify(value)):value;
}

function safeArray(value){
  if(Array.isArray(value))return value;
  if(value&&Array.isArray(value.items))return value.items;
  if(value&&Array.isArray(value.data))return value.data;
  if(value&&Array.isArray(value.results))return value.results;
  if(value&&Array.isArray(value.meetings))return value.meetings;
  if(value&&Array.isArray(value.documents))return value.documents;
  return [];
}

function rowsFromKrispResponse(value,depth=0){
  if(depth>4||value==null)return [];
  if(Array.isArray(value))return value;
  if(typeof value!=='object')return [];
  for(const key of ['meetings','documents','items','results','data','chunks','activities','action_items','actionItems']){
    const rows=rowsFromKrispResponse(value[key],depth+1);
    if(rows.length)return rows;
  }
  return [];
}

function findFirstString(...values){
  for(const value of values.flat()){
    if(typeof value==='string'&&value.trim())return value.trim();
    if(typeof value==='number')return String(value);
  }
  return '';
}

function krispTurnSpeaker(turn={}){
  const speaker=turn.speaker||turn.speakerName||turn.speaker_name||turn.participant||turn.user||turn.person||turn.author||{};
  if(typeof speaker==='string')return speaker;
  return speaker.name||speaker.displayName||speaker.display_name||speaker.fullName||speaker.full_name||speaker.email||speaker.label||'';
}

function krispTurnText(turn={}){
  if(typeof turn==='string')return turn;
  return findFirstString(turn.text,turn.content,turn.transcript,turn.sentence,turn.value,turn.message,turn.words&&Array.isArray(turn.words)?turn.words.map(w=>typeof w==='string'?w:w.word||w.text).join(' '):'');
}

function extractText(value,depth=0){
  if(depth>5||!value)return '';
  if(typeof value==='string')return value.trim();
  if(Array.isArray(value)){
    const turns=value.map(item=>{
      if(!item||typeof item!=='object')return '';
      const text=krispTurnText(item);
      if(!text)return '';
      const speaker=krispTurnSpeaker(item);
      return [speaker?`${speaker}:`:'',text].filter(Boolean).join(' ');
    }).filter(Boolean);
    if(turns.length)return turns.join('\n');
    return value.map(v=>extractText(v,depth+1)).filter(Boolean).join('\n');
  }
  if(typeof value==='object'){
    const direct=findFirstString(
      value.transcript,
      value.rawTranscript,
      value.raw_transcript,
      value.transcriptText,
      value.transcript_text,
      value.fullTranscript,
      value.full_transcript,
      value.text,
      value.content,
      value.plainText,
      value.plain_text,
      value.markdown,
      value.summary
    );
    if(direct)return direct;
    return [
      value.transcript,
      value.transcripts,
      value.segments,
      value.utterances,
      value.sentences,
      value.items,
      value.entries,
      value.content,
      value.document,
      value.note,
      value.notes
    ].map(v=>extractText(v,depth+1)).filter(Boolean).join('\n');
  }
  return '';
}

function participantName(value){
  if(!value)return '';
  if(typeof value==='string')return value;
  return value.name||value.displayName||value.display_name||value.fullName||value.full_name||value.email||value.label||'';
}

function normalizeParticipants(...values){
  const participants=[];
  const push=value=>{
    if(!value)return;
    if(Array.isArray(value)){value.forEach(push);return;}
    if(typeof value==='string'){participants.push({name:value});return;}
    if(typeof value==='object'){
      participants.push({
        name:participantName(value),
        email:value.email||value.emailAddress||value.email_address||'',
        company:value.company||value.organization||value.organizationName||''
      });
    }
  };
  values.forEach(push);
  const seen=new Set();
  return participants.filter(p=>{
    const key=`${String(p.email||'').toLowerCase()}|${String(p.name||'').toLowerCase()}`;
    if(!p.name&&!p.email)return false;
    if(seen.has(key))return false;
    seen.add(key);
    return true;
  });
}

function normalizeKrispDocumentId(value=''){
  return String(value||'').trim().toLowerCase().replace(/-/g,'');
}

function isKrispDocumentId(value=''){
  return /^[a-f0-9]{32}$/.test(normalizeKrispDocumentId(value));
}

function normalizeMcpContent(value){
  if(!value)return value;
  if(value.result?.structuredContent)return value.result.structuredContent;
  if(value.structuredContent)return value.structuredContent;
  if(value.result&&value.result.content){
    const content=value.result.content;
    if(Array.isArray(content)){
      const text=content.map(item=>item.text||item.content||item.resource?.text||item.resource?.content||'').filter(Boolean).join('\n');
      if(text){
        try{return JSON.parse(text);}
        catch(_){
          const parsed=content.map(item=>{
            const itemText=item.text||item.content||item.resource?.text||item.resource?.content||'';
            if(!itemText)return null;
            try{return JSON.parse(itemText);}
            catch(_){return null;}
          }).filter(Boolean);
          if(parsed.length)return {items:parsed,text};
          return {text};
        }
      }
    }
  }
  if(value.content&&Array.isArray(value.content)){
    const text=value.content.map(item=>item.text||item.content||item.resource?.text||item.resource?.content||'').filter(Boolean).join('\n');
    if(text){
      try{return JSON.parse(text);}
      catch(_){return {text};}
    }
  }
  return value.result||value;
}

function toolMatches(tool,patterns=[]){
  const hay=[tool.name,tool.description].join(' ').toLowerCase();
  return patterns.some(p=>p.test(hay));
}

function pickTool(tools,patterns=[]){
  return tools.find(tool=>toolMatches(tool,patterns))||null;
}

function pickToolByName(tools,names=[],patterns=[]){
  const expected=new Set(names.map(name=>String(name||'').toLowerCase()));
  return tools.find(tool=>expected.has(String(tool?.name||'').toLowerCase()))
    || pickTool(tools,patterns);
}

function knownTool(name,description='Krisp MCP documented tool'){
  return {name,description,inputSchema:{type:'object',properties:{}}};
}

function shouldFallbackAfterSdkError(error){
  const message=String(error?.message||error||'');
  return !/timed?\s*out|timeout|TOO_MANY_REQUESTS|too many concurrent|blocked_seconds|rate/i.test(message);
}

function toolHasArgument(tool,name){
  return !!(tool&&tool.inputSchema&&tool.inputSchema.properties&&Object.prototype.hasOwnProperty.call(tool.inputSchema.properties,name));
}

function toolArgumentNames(tool){
  return Object.keys(tool?.inputSchema?.properties||{});
}

function toolAcceptsAnyArgument(tool,...names){
  const args=toolArgumentNames(tool);
  if(!args.length)return true;
  return names.some(name=>args.includes(name));
}

function normalizeKrispMeeting(row={}){
  const documentId=normalizeKrispDocumentId(row.documentId||row.document_id||row.documentID||row.meetingId||row.meeting_id||row.id||row.docId||row.doc_id||row.agendaId||row.agenda_id||'');
  return {
    documentId,
    title:compactText(row.title||row.name||row.meetingTitle||row.meeting_title||row.summary||'Krisp meeting',220),
    startedAt:row.startedAt||row.started_at||row.startTime||row.start_time||row.date||row.createdAt||row.created_at||row.meeting_date||'',
    duration:row.duration||row.durationText||row.duration_text||'',
    participants:normalizeParticipants(row.participants,row.attendees,row.users),
    raw:row
  };
}

function findKrispDocumentIds(value,ids=new Set(),depth=0){
  if(depth>8||!value)return ids;
  if(typeof value==='string'){
    const matches=value.toLowerCase().match(/[a-f0-9]{8}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{12}|[a-f0-9]{32}/g)||[];
    matches.forEach(match=>{
      const normalized=normalizeKrispDocumentId(match);
      if(isKrispDocumentId(normalized))ids.add(normalized);
    });
    return ids;
  }
  if(Array.isArray(value)){
    value.forEach(item=>findKrispDocumentIds(item,ids,depth+1));
    return ids;
  }
  if(typeof value==='object'){
    for(const key of ['documentId','document_id','documentID','docId','doc_id','meetingId','meeting_id','agendaId','agenda_id','id']){
      const normalized=normalizeKrispDocumentId(value[key]||'');
      if(isKrispDocumentId(normalized))ids.add(normalized);
    }
    Object.values(value).forEach(item=>findKrispDocumentIds(item,ids,depth+1));
  }
  return ids;
}

function documentCandidatesFromRows(rows=[]){
  const seen=new Set();
  const candidates=[];
  for(const row of safeArray(rows)){
    const ids=[...findKrispDocumentIds(row)];
    for(const documentId of ids){
      if(seen.has(documentId))continue;
      seen.add(documentId);
      candidates.push(normalizeKrispMeeting({...row,documentId}));
    }
  }
  return candidates;
}

function krispSearchPhrasesFromInput(input=''){
  const raw=String(input||'').trim();
  const phrases=[];
  const add=value=>{
    const text=compactText(String(value||'').replace(/\s+/g,' '),240);
    if(text&&!phrases.includes(text))phrases.push(text);
  };
  add(raw);
  try{
    const url=new URL(raw);
    const lastPath=decodeURIComponent((url.pathname.split('/').filter(Boolean).pop()||'').trim());
    const slugTitle=lastPath.replace(/--[a-f0-9]{32}$/i,'').replace(/[-_]+/g,' ').replace(/\s+/g,' ').trim();
    add(slugTitle);
    if(slugTitle){
      add(`Search for meetings about ${slugTitle}`);
      add(`Find meetings from last week with ${slugTitle}`);
      add(`Find all project pages mentioning "${slugTitle}"`);
    }
  }catch(_){}
  const idMatches=raw.toLowerCase().match(/[a-f0-9]{8}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{12}|[a-f0-9]{32}/g)||[];
  for(const id of idMatches){
    const normalized=normalizeKrispDocumentId(id);
    add(`Get meeting ${normalized} by ID`);
    add(`Get full content for meeting ${normalized}`);
  }
  return phrases;
}

function krispDocumentContentSummary(document={}){
  const normalized=document&&typeof document==='object'&&Object.hasOwn(document,'transcriptText')&&Object.hasOwn(document,'raw')
    ?document
    :normalizeKrispDocument(document);
  const raw=normalized.raw||{};
  const keys=raw&&typeof raw==='object'?Object.keys(raw).slice(0,24):[];
  return {
    title:normalized.title||'Krisp document',
    hasTranscript:!!String(normalized.transcriptText||'').trim(),
    hasSummary:!!String(normalized.summary||'').trim(),
    actionItemCount:safeArray(normalized.actionItems).length,
    participantCount:safeArray(normalized.participants).length,
    fields:keys
  };
}

function sanitizeKrispInspectionItem(item={}){
  return {
    documentId:item.documentId||'',
    source:item.source||'',
    title:item.title||'',
    hasTranscript:!!item.hasTranscript,
    hasSummary:!!item.hasSummary,
    actionItemCount:Number(item.actionItemCount||0),
    participantCount:Number(item.participantCount||0),
    fields:Array.isArray(item.fields)?item.fields.slice(0,24):[],
    error:item.error||''
  };
}

function sanitizeKrispDocumentInspection(document={}){
  const normalized=document&&typeof document==='object'&&Object.hasOwn(document,'transcriptText')&&Object.hasOwn(document,'raw')
    ?document
    :normalizeKrispDocument(document);
  const raw=normalized.raw||{};
  const fields=raw&&typeof raw==='object'?Object.keys(raw).slice(0,32):[];
  const rawCounts={};
  if(raw&&typeof raw==='object'){
    for(const key of ['requestedCount','requested_count','foundCount','found_count','total','count']){
      if(Number.isFinite(Number(raw[key])))rawCounts[key]=Number(raw[key]);
    }
    for(const key of ['results','documents','items','meetings']){
      if(Array.isArray(raw[key]))rawCounts[`${key}Length`]=raw[key].length;
    }
  }
  return {
    documentId:normalized.documentId||'',
    title:normalized.title||'Krisp meeting',
    hasTranscript:!!String(normalized.transcriptText||'').trim(),
    transcriptCharacters:String(normalized.transcriptText||'').length,
    transcriptPreview:compactText(normalized.transcriptText,360),
    hasSummary:!!String(normalized.summary||'').trim(),
    summaryPreview:compactText(normalized.summary,240),
    actionItemCount:safeArray(normalized.actionItems).length,
    participantCount:safeArray(normalized.participants).length,
    startedAt:normalized.startedAt||'',
    duration:normalized.duration||'',
    sourceUrl:normalized.sourceUrl||'',
    rawCounts,
    fields
  };
}

function normalizeKrispDocument(doc={},fallback={}){
  const source=Array.isArray(doc)
    ?(doc.find(item=>extractText(item?.transcript||item?.fullTranscript||item?.full_transcript||item?.transcriptText||item?.transcript_text||item?.content||item?.document||''))||doc[0]||{})
    :(safeArray(doc.documents||doc.items||doc.results).find(item=>extractText(item?.transcript||item?.fullTranscript||item?.full_transcript||item?.transcriptText||item?.transcript_text||item?.content||item?.document||''))||doc.document||doc.meeting||doc.data||doc);
  const documentId=normalizeKrispDocumentId(source.documentId||source.document_id||source.id||fallback.documentId||fallback.document_id||'');
  const transcriptText=extractText(source.transcript||source.fullTranscript||source.full_transcript||source.transcriptText||source.transcript_text||source.content||source);
  const summary=extractText(source.summary||source.notes||source.keyPoints||source.key_points||'');
  const actionItems=safeArray(source.actionItems||source.action_items||source.tasks);
  const sourceSections={
    actionItems:jsonClone(source.actionItems||source.action_items||source.tasks||[]),
    keyPoints:jsonClone(source.keyPoints||source.key_points||source.summary||source.notes||'')
  };
  const participants=normalizeParticipants(source.participants,source.attendees,source.users,fallback.participants);
  const title=compactText(source.title||source.name||source.meetingTitle||source.meeting_title||fallback.title||'Krisp meeting',220);
  return {
    documentId,
    title,
    transcriptText,
    summary,
    actionItems,
    sourceSections,
    participants,
    startedAt:source.startedAt||source.started_at||source.startTime||source.start_time||source.date||source.createdAt||source.created_at||fallback.startedAt||fallback.started_at||'',
    duration:source.duration||source.durationText||source.duration_text||fallback.duration||'',
    sourceUrl:source.url||source.sourceUrl||source.source_url||'',
    raw:jsonClone(source)
  };
}

function krispTranscriptPayloadFromDocument(document={}){
  const normalized=normalizeKrispDocument(document);
  return {
    id:normalized.documentId?`krisp_${normalized.documentId}`:'',
    source:'krisp_mcp',
    provider:'krisp',
    type:'meeting_transcript',
    title:normalized.title,
    transcript:normalized.transcriptText,
    attendees:normalized.participants,
    timestamp:normalized.startedAt||null,
    sourceUrl:normalized.sourceUrl,
    metadata:{
      provider:'krisp',
      source:'krisp_mcp',
      documentId:normalized.documentId,
      duration:normalized.duration,
      krispSummary:normalized.summary,
      krispActionItems:normalized.actionItems,
      krispSourceSections:normalized.sourceSections,
      participants:normalized.participants,
      importedVia:'krisp_mcp',
      rawKrispDocument:normalized.raw
    }
  };
}

function createKrispMcpService({
  url=DEFAULT_KRISP_MCP_URL,
  fallbackAccessToken='',
  resolveSecret,
  logger=console,
  timeoutMs=20000
}={}){
  if(typeof resolveSecret!=='function') throw new Error('createKrispMcpService requires resolveSecret');
  let mcpSessionId='';
  let initialized=false;
  let requestQueue=Promise.resolve();

  async function accessToken(){
    const fallback=fallbackAccessToken||process.env.KRISP_MCP_ACCESS_TOKEN||process.env.KRISP_ACCESS_TOKEN||process.env.KRISP_BEARER_TOKEN||'';
    const token=await resolveSecret('krisp','access_token',fallback);
    if(token)return token;
    return resolveSecret('krisp','api_key',fallback);
  }

  async function isConfigured(){
    return !!(await accessToken());
  }

  async function withSdkClient(operation){
    if(!McpClient||!StreamableHTTPClientTransport)throw new Error('MCP SDK is not installed.');
    const token=await accessToken();
    if(!token)throw new Error('Krisp MCP is not connected. Complete Krisp OAuth before importing transcripts.');
    const transport=new StreamableHTTPClientTransport(new URL(url),{
      requestInit:{
        headers:{
          Authorization:`Bearer ${token}`
        }
      }
    });
    const client=new McpClient({name:'VAL',version:'1.0.0'},{capabilities:{}});
    try{
      await client.connect(transport);
      return await operation(client);
    }finally{
      await client.close().catch(()=>{});
    }
  }

  function enqueueKrispRequest(operation){
    const run=requestQueue.then(operation,operation);
    requestQueue=run.catch(()=>null);
    return run;
  }

  async function rpc(method,params={}){
    const token=await accessToken();
    if(!token)throw new Error('Krisp MCP is not connected. Add a Krisp access token/OAuth credential before importing transcripts.');
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),timeoutMs);
    try{
      const response=await fetch(url,{
        method:'POST',
        headers:{
          Authorization:`Bearer ${token}`,
          'Content-Type':'application/json',
          Accept:'application/json, text/event-stream',
          ...(mcpSessionId?{'Mcp-Session-Id':mcpSessionId}:{}),
          'MCP-Protocol-Version':MCP_PROTOCOL_VERSION
        },
        body:JSON.stringify({jsonrpc:'2.0',id:`krisp_${Date.now()}_${Math.random().toString(36).slice(2)}`,method,params}),
        signal:controller.signal
      });
      const text=await response.text();
      const nextSessionId=response.headers.get('mcp-session-id')||response.headers.get('Mcp-Session-Id')||'';
      if(nextSessionId)mcpSessionId=nextSessionId;
      let data={};
      try{data=text?JSON.parse(text):{};}
      catch(_){data={raw:text};}
      if(!response.ok||data.error){
        const detail=data.error?.message||data.message||data.raw||text||`HTTP ${response.status}`;
        throw new Error(`Krisp MCP ${method} failed: ${detail}`);
      }
      return data;
    }catch(e){
      if(e.name==='AbortError')throw new Error(`Krisp MCP ${method} timed out after ${Math.round(timeoutMs/1000)} seconds`);
      throw e;
    }finally{
      clearTimeout(timer);
    }
  }

  async function initialize(){
    if(initialized)return null;
    return rpc('initialize',{
      protocolVersion:MCP_PROTOCOL_VERSION,
      capabilities:{},
      clientInfo:{name:'VAL',version:'1.0.0'}
    }).then(async(data)=>{
      initialized=true;
      await rpc('notifications/initialized',{}).catch(()=>null);
      return data;
    }).catch(e=>{
      logger.warn?.('[krisp-mcp] initialize skipped',e.message);
      return null;
    });
  }

  async function listTools(){
    if(McpClient&&StreamableHTTPClientTransport){
      const result=await withSdkClient(client=>client.listTools({}, {timeout:timeoutMs}));
      return result.tools||[];
    }
    await initialize();
    const data=await rpc('tools/list',{});
    return data.result?.tools||data.tools||[];
  }

  async function callTool(name,args={}){
    if(!name)throw new Error('Krisp MCP tool name is required.');
    return enqueueKrispRequest(async()=>{
      if(McpClient&&StreamableHTTPClientTransport){
        try{
          const result=await withSdkClient(client=>client.callTool({name,arguments:args}, undefined, {timeout:timeoutMs}));
          return normalizeMcpContent(result);
        }catch(e){
          if(!shouldFallbackAfterSdkError(e))throw e;
          logger.warn?.(`[krisp-mcp] sdk ${name} failed; falling back`,e.message);
        }
      }
      await initialize();
      const data=await rpc('tools/call',{name,arguments:args});
      return normalizeMcpContent(data);
    });
  }

  async function findTools(){
    const tools=await listTools();
    return {
      tools,
      searchMeetings:pickToolByName(tools,['search_meetings'],[/^search[_ -]?meetings?$/,/\bsearch[_ -]?meetings?\b/,/^list[_ -]?meetings?$/])||knownTool('search_meetings','Search Krisp meetings by text, date, or meeting ID.'),
      searchMeetingContent:pickToolByName(tools,['search_meeting_content'],[/^search[_ -]?meeting[_ -]?content$/,/\bsearch meeting content\b/,/\bfull[- ]text search\b/])||knownTool('search_meeting_content','Full-text search across meeting transcripts, agendas, and notes.'),
      getDocument:pickToolByName(tools,['get_document'],[/^get[_ -]?document$/,/\bfetch document\b/]),
      getMultipleDocuments:pickToolByName(tools,['get_multiple_documents'],[/^get[_ -]?multiple[_ -]?documents$/,/\bmultiple documents\b/])||knownTool('get_multiple_documents','Fetch one or more Krisp documents/transcripts by document ID.'),
      listActionItems:pickToolByName(tools,['list_action_items'],[/^list[_ -]?action[_ -]?items?$/])||knownTool('list_action_items','List Krisp meeting action items.'),
      listActivities:pickToolByName(tools,['list_activities'],[/^list[_ -]?activities$/])||knownTool('list_activities','List Krisp Activity Center items.'),
      upcomingMeetings:pickToolByName(tools,['list_upcoming_meetings'],[/^list[_ -]?upcoming[_ -]?meetings?$/])||knownTool('list_upcoming_meetings','List upcoming Krisp calendar meetings.')
    };
  }

  async function searchMeetings({query='',from='',to='',limit=10}={}){
    const found=await findTools();
    if(!found.searchMeetings)throw new Error('Krisp MCP did not expose a meeting search tool.');
    const startDate=from?String(from).slice(0,10):'';
    const endDate=to?String(to).slice(0,10):'';
    const fields=['name','date','url','attendees','speakers','transcript','agenda','meeting_notes','key_points','action_items','past_meeting_occurrences'];
    const searchTool=found.searchMeetings;
    const attempts=[];
    if(isKrispDocumentId(query)&&toolAcceptsAnyArgument(searchTool,'id')){
      attempts.push({id:normalizeKrispDocumentId(query),limit,fields});
    }
    if(query&&toolAcceptsAnyArgument(searchTool,'search')){
      attempts.push({search:query,limit,after:startDate,before:endDate,fields});
    }
    if(!query&&startDate&&toolAcceptsAnyArgument(searchTool,'after','before')){
      attempts.push({limit,after:startDate,before:endDate,fields});
    }
    if(query&&toolAcceptsAnyArgument(searchTool,'query')){
      attempts.push({query,limit,from,to,start_date:startDate,end_date:endDate});
    }
    if(query&&toolAcceptsAnyArgument(searchTool,'search_query')){
      attempts.push({search_query:query,limit,start_date:startDate,end_date:endDate});
    }
    if(!attempts.length)attempts.push({search:query||'meeting',limit});
    const seen=new Set();
    let lastError=null;
    for(const args of attempts){
      const compactArgs=Object.fromEntries(Object.entries(args).filter(([,value])=>{
        if(value===''||value===undefined||value===null)return false;
        if(typeof value==='object'&&!Array.isArray(value)&&Object.values(value).every(v=>!v))return false;
        return true;
      }));
      const key=JSON.stringify(compactArgs);
      if(seen.has(key))continue;
      seen.add(key);
      try{
        const data=await callTool(found.searchMeetings.name,compactArgs);
        const meetings=safeArray(data.meetings||data.documents||data.items||data.results||data).map(normalizeKrispMeeting).filter(m=>m.documentId||m.title);
        if(meetings.length||seen.size===attempts.length)return meetings;
      }catch(e){
        lastError=e;
      }
    }
    if(lastError)throw lastError;
    return [];
  }

  async function listDocumentCandidates({limit=10,query='',from='',to=''}={}){
    const found=await findTools();
    const candidates=[];
    const seen=new Set();
    const errors=[];
    const pushAll=(rows=[])=>{
      for(const candidate of documentCandidatesFromRows(rows)){
        if(!candidate.documentId||seen.has(candidate.documentId))continue;
        seen.add(candidate.documentId);
        candidates.push(candidate);
      }
    };
    try{pushAll(await searchMeetings({query,from,to,limit}));}catch(e){errors.push(e);logger.warn?.('[krisp-mcp] search candidates skipped',e.message);}
    const calls=[
      [found.searchMeetingContent?.name,query?{search:query,limit,fields:['document_id','title','content','chunk_type','date']}:{search:'meeting',limit,fields:['document_id','title','content','chunk_type','date']}],
      [found.searchMeetingContent?.name,query&&from?{search:query,limit,after:String(from).slice(0,10),before:to?String(to).slice(0,10):'',fields:['document_id','title','content','chunk_type','date']}:null],
      [found.listActivities?.name,{limit}],
      [found.listActivities?.name,{limit,after:from?String(from).slice(0,10):'',before:to?String(to).slice(0,10):''}],
      [found.listActionItems?.name,{limit,status:'all'}],
      [found.listActionItems?.name,{limit,completion_status:'all'}],
      [found.upcomingMeetings?.name,{limit,days:14}]
    ];
    const callKeys=new Set();
    for(const [name,args] of calls){
      if(!name||candidates.length>=limit)continue;
      if(!args)continue;
      const compactArgs=Object.fromEntries(Object.entries(args||{}).filter(([,value])=>value!==''&&value!==undefined&&value!==null));
      const key=`${name}:${JSON.stringify(compactArgs)}`;
      if(callKeys.has(key))continue;
      callKeys.add(key);
      try{
        const data=await callTool(name,compactArgs);
        pushAll(data.meetings||data.documents||data.items||data.results||data.activities||data.actionItems||data.action_items||data);
      }catch(e){
        errors.push(e);
        logger.warn?.(`[krisp-mcp] ${name} candidates skipped`,e.message);
      }
    }
    if(!candidates.length&&errors.length){
      const first=errors[0];
      const error=new Error(first.message||'Krisp MCP candidate search failed.');
      error.candidateErrors=errors.map(e=>e.message||String(e));
      throw error;
    }
    return candidates.slice(0,limit);
  }

  async function discoverTranscriptReceipts({limit=50,from='',to=''}={}){
    const startDate=from?String(from).slice(0,10):'';
    const endDate=to?String(to).slice(0,10):'';
    const safeLimit=Math.max(1,Math.min(Number(limit)||50,50));
    let found;
    try{
      found=await findTools();
    }catch(error){
      return {
        documents:[],
        probes:[{label:'Krisp meeting index',state:'unavailable',returned:0,error:compactText(error?.message||error,220)}],
        status:'unavailable',
        detail:'Krisp did not open its meeting index in time. No transcript was imported.',
        checkedAt:new Date().toISOString(),
        window:{start:startDate,end:endDate}
      };
    }
    const fields=['name','date','duration_seconds','url','attendees','speakers','transcript','agenda','meeting_notes','key_points','action_items'];
    const documents=[];
    const seen=new Set();
    const probes=[];
    const pushMeetings=(rows,source)=>{
      const meetings=rows.map(normalizeKrispMeeting).filter(meeting=>meeting.documentId||meeting.title);
      for(const meeting of meetings){
        if(!meeting.documentId||seen.has(meeting.documentId))continue;
        seen.add(meeting.documentId);
        documents.push({...meeting,source});
      }
      return meetings.length;
    };
    const runMeetingSearch=async(label,extra={})=>{
      const args={limit:safeLimit,after:startDate,before:endDate,fields,...extra};
      const compactArgs=Object.fromEntries(Object.entries(args).filter(([,value])=>value!==''&&value!==undefined&&value!==null));
      try{
        const data=await callTool(found.searchMeetings.name,compactArgs);
        const returned=pushMeetings(rowsFromKrispResponse(data),found.searchMeetings.name);
        probes.push({label,state:'complete',returned});
        return returned;
      }catch(error){
        probes.push({label,state:'unavailable',returned:0,error:compactText(error?.message||error,220)});
        return 0;
      }
    };

    if(!found.searchMeetings?.name){
      probes.push({label:'Krisp meetings',state:'unavailable',returned:0,error:'Krisp did not expose a meeting search.'});
    }else{
      await runMeetingSearch('Meetings available to this Krisp account');
      if(documents.length<safeLimit) await runMeetingSearch('Meetings you own in Krisp',{isOwner:true});
      if(documents.length<safeLimit) await runMeetingSearch('Meetings shared with you in Krisp',{sharedWithMe:true});
    }

    if(documents.length<safeLimit&&found.listActionItems?.name){
      try{
        const data=await callTool(found.listActionItems.name,{limit:safeLimit});
        const actionItems=safeArray(data.actionItems||data.action_items||data.items||data.results||data);
        const meetingRows=actionItems.map(item=>({
          meetingId:item.meeting_id||item.meetingId||item.source_meeting_id||item.sourceMeetingId||'',
          title:item.meeting_name||item.meetingName||item.source_meeting_name||item.sourceMeetingName||'Krisp meeting',
          startedAt:item.meeting_date||item.meetingDate||item.created_at||item.createdAt||''
        })).filter(item=>item.meetingId);
        const returned=pushMeetings(meetingRows,found.listActionItems.name);
        probes.push({label:'Meetings linked to Krisp action items',state:'complete',returned});
      }catch(error){
        probes.push({label:'Meetings linked to Krisp action items',state:'unavailable',returned:0,error:compactText(error?.message||error,220)});
      }
    }

    if(documents.length<safeLimit&&found.searchMeetingContent?.name){
      const args={
        search:'the',limit:safeLimit,after:startDate,before:endDate,
        fields:['document_id','title','content','chunk_type','date']
      };
      try{
        const data=await callTool(found.searchMeetingContent.name,args);
        const returned=pushMeetings(rowsFromKrispResponse(data),found.searchMeetingContent.name);
        probes.push({label:'Meeting content across accessible Krisp transcripts',state:'complete',returned});
      }catch(error){
        probes.push({label:'Meeting content across accessible Krisp transcripts',state:'unavailable',returned:0,error:compactText(error?.message||error,220)});
      }
    }

    if(documents.length<safeLimit&&found.listActivities?.name){
      try{
        const data=await callTool(found.listActivities.name,{limit:safeLimit});
        const rows=safeArray(data.activities||data.items||data.results||data);
        const returned=pushMeetings(documentCandidatesFromRows(rows),found.listActivities.name);
        probes.push({label:'Meetings linked from recent Krisp activity',state:'complete',returned});
      }catch(error){
        probes.push({label:'Meetings linked from recent Krisp activity',state:'unavailable',returned:0,error:compactText(error?.message||error,220)});
      }
    }

    const allUnavailable=probes.length>0&&probes.every(probe=>probe.state==='unavailable');
    const status=documents.length?'complete':(allUnavailable?'unavailable':'needs_verification');
    const detail=documents.length
      ? `Krisp returned ${documents.length} meeting receipt${documents.length===1?'':'s'} from this connection.`
      : allUnavailable
        ? 'Krisp could not return meeting receipts from this connection.'
        : 'Krisp checked accessible, owned, shared, action-item-linked, content-indexed, and activity-linked meetings but did not return a meeting receipt for this window.';
    return {documents:documents.slice(0,safeLimit),probes,status,detail,checkedAt:new Date().toISOString(),window:{start:startDate,end:endDate}};
  }

  async function getDocument(documentId){
    const normalizedId=normalizeKrispDocumentId(documentId);
    if(!isKrispDocumentId(normalizedId))throw new Error('Krisp document IDs must be 32 lowercase hexadecimal characters, with dashes removed.');
    const found=await findTools();
    const attempts=[];
    if(found.getMultipleDocuments?.name){
      attempts.push([found.getMultipleDocuments.name,{ids:[normalizedId]}]);
      if(toolHasArgument(found.getMultipleDocuments,'document_ids'))attempts.push([found.getMultipleDocuments.name,{document_ids:[normalizedId]}]);
      if(toolHasArgument(found.getMultipleDocuments,'documentIds'))attempts.push([found.getMultipleDocuments.name,{documentIds:[normalizedId]}]);
      if(toolHasArgument(found.getMultipleDocuments,'documents'))attempts.push([found.getMultipleDocuments.name,{documents:[{id:normalizedId}]}]);
    }
    if(found.getDocument?.name){
      const getArgs=[
        ['document_id',{document_id:normalizedId}],
        ['id',{id:normalizedId}],
        ['documentId',{documentId:normalizedId}],
        ['document',{document:{id:normalizedId}}],
        ['ids',{ids:[normalizedId]}]
      ];
      const argumentNames=toolArgumentNames(found.getDocument);
      for(const [argName,args] of getArgs){
        if(!argumentNames.length||toolHasArgument(found.getDocument,argName))attempts.push([found.getDocument.name,args]);
      }
    }
    if(!attempts.length)attempts.push(['get_multiple_documents',{ids:[normalizedId]}]);
    let best=null;
    let lastError=null;
    const seenAttempts=new Set();
    for(const [toolName,args] of attempts){
      if(!toolName)continue;
      const key=`${toolName}:${JSON.stringify(args)}`;
      if(seenAttempts.has(key))continue;
      seenAttempts.add(key);
      try{
        const data=await callTool(toolName,args);
        const normalized=normalizeKrispDocument(data,{documentId:normalizedId});
        if(normalized.transcriptText)return normalized;
        if(!best||(!best.summary&&normalized.summary)||safeArray(normalized.actionItems).length>safeArray(best.actionItems).length)best=normalized;
      }catch(e){
        lastError=e;
      }
    }
    if(best)return best;
    if(lastError)throw lastError;
    throw new Error('Krisp document was found, but VAL could not read its contents.');
  }

  async function resolveTranscriptDocument(input='',{limit=5,search=true}={}){
    const raw=String(input||'').trim();
    const idMatches=raw.toLowerCase().match(/[a-f0-9]{8}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{12}|[a-f0-9]{32}/g)||[];
    const candidates=[];
    const seen=new Set();
    const pushId=(id,source='direct')=>{
      const normalized=normalizeKrispDocumentId(id);
      if(!isKrispDocumentId(normalized)||seen.has(normalized))return;
      seen.add(normalized);
      candidates.push({documentId:normalized,source});
    };
    idMatches.forEach(id=>pushId(id,'direct'));
    if(!candidates.length&&isKrispDocumentId(raw))pushId(raw,'direct');
    const inspected=[];
    const inspectCandidates=async(rows=[])=>{
      for(const candidate of rows.slice(0,limit)){
        try{
          const document=await getDocument(candidate.documentId);
          const summary=krispDocumentContentSummary(document);
          inspected.push({...candidate,...summary});
          if(summary.hasTranscript)return {ok:true,document,candidate,inspected};
        }catch(e){
          inspected.push({...candidate,error:e.message});
        }
      }
      return null;
    };
    const directResult=await inspectCandidates(candidates);
    if(directResult)return directResult;
    if(!search)return {ok:false,inspected,candidates,searchSkipped:true};
    const searchTerms=krispSearchPhrasesFromInput(raw);
    for(const term of searchTerms){
      if(candidates.length>=limit)break;
      try{
        const meetings=await searchMeetings({query:term,limit});
        for(const meeting of meetings)pushId(meeting.documentId,'search_meetings');
      }catch(_){}
      if(candidates.length>=limit)break;
      try{
        const rows=await listDocumentCandidates({query:term,limit:Math.max(1,limit-candidates.length)});
        for(const row of rows)pushId(row.documentId,'search_meeting_content');
      }catch(_){}
    }
    const searchedResult=await inspectCandidates(candidates.filter(candidate=>!inspected.some(item=>item.documentId===candidate.documentId)));
    if(searchedResult)return searchedResult;
    return {ok:false,inspected,candidates};
  }

  async function inspectTranscriptDocument(input='',{limit=6,search=false}={}){
    const raw=String(input||'').trim();
    const resolved=await resolveTranscriptDocument(raw,{limit,search});
    const candidates=safeArray(resolved.candidates).map(candidate=>({
      documentId:candidate.documentId||'',
      source:candidate.source||''
    }));
    return {
      ok:true,
      resolved:!!resolved.ok,
      input:compactText(raw,240),
      searchUsed:search!==false,
      searchSkipped:!!resolved.searchSkipped,
      candidate:resolved.candidate?{
        documentId:resolved.candidate.documentId||'',
        source:resolved.candidate.source||''
      }:null,
      candidates,
      inspected:safeArray(resolved.inspected).map(sanitizeKrispInspectionItem),
      document:resolved.document?sanitizeKrispDocumentInspection(resolved.document):null
    };
  }

  return {
    url,
    isConfigured,
    usesSdk:()=>!!(McpClient&&StreamableHTTPClientTransport),
    listTools,
    callTool,
    findTools,
    searchMeetings,
    listDocumentCandidates,
    discoverTranscriptReceipts,
    getDocument,
    resolveTranscriptDocument,
    inspectTranscriptDocument,
    krispDocumentContentSummary,
    normalizeKrispDocument,
    krispTranscriptPayloadFromDocument
  };
}

module.exports={
  createKrispMcpService,
  normalizeKrispDocumentId,
  isKrispDocumentId,
  normalizeKrispDocument,
  krispDocumentContentSummary,
  sanitizeKrispDocumentInspection,
  krispSearchPhrasesFromInput,
  krispTranscriptPayloadFromDocument
};
