const express = require('express');
const cors    = require('cors');
const fs      = require('fs');
const path    = require('path');
const multer  = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const app     = express();

app.use(cors());
app.use(express.json({limit:'10mb'}));
const upload = multer({storage:multer.memoryStorage(),limits:{fileSize:25*1024*1024}});

const GHL_KEY = process.env.GHL_KEY;
const GHL_LOC = process.env.GHL_LOC;
const ANTHROPIC_KEY = process.env.ANTHROPIC_KEY;
const OPENAI_KEY = process.env.OPENAI_KEY;
const BASE    = 'https://services.leadconnectorhq.com';
const TASKS_FILE = process.env.TASKS_FILE || '/tmp/val_tasks.json';
const STORE_FILE = process.env.VAL_STORE_FILE || '/tmp/val_store.json';
const VAL_USER_ID = process.env.VAL_USER_ID || 'default';
const MEMORY_CHUNK_SIZE = Number(process.env.MEMORY_CHUNK_SIZE) || 1800;
const MEMORY_CHUNK_OVERLAP = Number(process.env.MEMORY_CHUNK_OVERLAP) || 250;
let pgPool = null;

if(process.env.DATABASE_URL){
  try{
    const {Pool} = require('pg');
    pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.PGSSLMODE === 'disable' ? false : {rejectUnauthorized:false}
    });
  }catch(e){
    console.error('Postgres disabled:', e.message);
  }
}

function gh(){
  return {'Authorization':`Bearer ${GHL_KEY}`,'Version':'2021-07-28','Content-Type':'application/json'};
}
async function ghl(method,path,body){
  const r=await fetch(BASE+path,{method,headers:gh(),body:body?JSON.stringify(body):undefined});
  return r.json();
}

function readJson(file,fallback){
  try{ return JSON.parse(fs.readFileSync(file,'utf8')); }
  catch(e){ return fallback; }
}
function writeJson(file,value){
  try{ fs.writeFileSync(file, JSON.stringify(value,null,2)); }
  catch(e){ console.error('writeJson error:',e.message); }
}
function valStore(){
  return readJson(STORE_FILE,{conversations:[],messages:[],transcripts:[],memoryItems:[]});
}
function saveValStore(store){ writeJson(STORE_FILE,store); }
function uuid(prefix){
  return prefix+'_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8);
}
function memoryChunks(text){
  const clean = String(text||'').replace(/\r\n/g,'\n').trim();
  if(!clean) return [];
  if(clean.length <= MEMORY_CHUNK_SIZE) return [clean];
  const chunks = [];
  let start = 0;
  while(start < clean.length){
    let end = Math.min(start + MEMORY_CHUNK_SIZE, clean.length);
    if(end < clean.length){
      const breakAt = Math.max(clean.lastIndexOf('\n\n',end), clean.lastIndexOf('. ',end), clean.lastIndexOf('\n',end));
      if(breakAt > start + MEMORY_CHUNK_SIZE * 0.55) end = breakAt + 1;
    }
    chunks.push(clean.slice(start,end).trim());
    if(end >= clean.length) break;
    start = Math.max(0,end - MEMORY_CHUNK_OVERLAP);
  }
  return chunks.filter(Boolean);
}
function queryTerms(text){
  const stop = new Set(['about','after','again','all','also','and','are','because','been','but','can','could','does','for','from','have','her','him','how','into','just','like','more','need','not','now','our','out','she','should','that','the','their','then','there','they','this','through','what','when','where','which','with','would','you','your']);
  return String(text||'').toLowerCase().match(/[a-z0-9']{3,}/g)?.filter(w=>!stop.has(w)).slice(-20) || [];
}
function scoreMemory(item,terms){
  const hay = `${item.kind||''} ${item.summary||''} ${item.raw_text||item.rawText||''}`.toLowerCase();
  return terms.reduce((score,term)=>score+(hay.includes(term)?1:0),0);
}
async function dbQuery(sql,params){
  if(!pgPool) return null;
  return pgPool.query(sql,params);
}
async function initValDb(){
  if(!pgPool) return;
  await dbQuery(`
    create table if not exists val_tasks (
      id text primary key,
      user_id text not null default 'default',
      title text not null,
      contact_name text,
      due_date timestamptz,
      notes text,
      details jsonb not null default '[]',
      completed boolean not null default false,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
    create table if not exists val_conversations (
      id text primary key,
      user_id text not null default 'default',
      title text,
      source text not null default 'chat',
      metadata jsonb not null default '{}',
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
    create table if not exists val_messages (
      id text primary key,
      conversation_id text references val_conversations(id) on delete cascade,
      role text not null,
      content text not null,
      metadata jsonb not null default '{}',
      created_at timestamptz not null default now()
    );
    create table if not exists val_transcripts (
      id text primary key,
      user_id text not null default 'default',
      type text not null,
      title text,
      raw_text text not null,
      metadata jsonb not null default '{}',
      created_at timestamptz not null default now()
    );
    create table if not exists val_memory_items (
      id text primary key,
      user_id text not null default 'default',
      kind text not null default 'note',
      summary text,
      raw_text text not null,
      importance integer not null default 1,
      metadata jsonb not null default '{}',
      created_at timestamptz not null default now()
    );
    create table if not exists val_oauth_tokens (
      provider text primary key,
      user_id text not null default 'default',
      tokens jsonb not null,
      updated_at timestamptz not null default now()
    );
    create index if not exists val_tasks_user_completed_idx on val_tasks(user_id,completed,due_date);
    create index if not exists val_messages_conversation_idx on val_messages(conversation_id,created_at);
    create index if not exists val_transcripts_user_created_idx on val_transcripts(user_id,created_at desc);
    create index if not exists val_memory_user_created_idx on val_memory_items(user_id,created_at desc);
  `);
  console.log('VAL Postgres store ready');
}
const valDbReady = initValDb().catch(e=>console.error('VAL DB init error:',e.message));

// ── HEALTH ───────────────────────────────────────────────
app.get('/',(req,res)=>res.json({status:'VAL Proxy OK',time:new Date().toISOString()}));
app.use(express.static(__dirname));
app.get('/dashboard',(req,res)=>res.sendFile(path.join(__dirname,'val-executive.html')));

// ════════════════════════════════════════════════════════
// GOOGLE OAUTH
// ════════════════════════════════════════════════════════

const GOOGLE_CLIENT_ID     = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI         = 'https://jessaval-production.up.railway.app/auth/callback';
let googleTokens = {}; // stored in memory — persists as long as server runs

// On startup, load refresh token from env if available
if(process.env.GOOGLE_REFRESH_TOKEN){
  googleTokens.refresh_token = process.env.GOOGLE_REFRESH_TOKEN;
  googleTokens.issued_at = 0; // force refresh on first use
  console.log('Loaded Google refresh token from env var');
}

async function saveOAuthTokens(provider,tokens){
  if(!tokens||!Object.keys(tokens).length) return;
  if(pgPool){
    await valDbReady;
    await dbQuery(`
      insert into val_oauth_tokens (provider,user_id,tokens,updated_at)
      values ($1,$2,$3,now())
      on conflict (provider) do update set tokens=excluded.tokens, updated_at=now()
    `,[provider,VAL_USER_ID,JSON.stringify(tokens)]);
  }else{
    const store=valStore();
    store.oauthTokens=store.oauthTokens||{};
    store.oauthTokens[provider]=tokens;
    saveValStore(store);
  }
}

async function loadOAuthTokens(provider){
  await valDbReady;
  if(pgPool){
    const r=await dbQuery('select tokens from val_oauth_tokens where provider=$1',[provider]);
    return r.rows[0]?.tokens || null;
  }
  return (valStore().oauthTokens||{})[provider] || null;
}

async function ensureGoogleTokensLoaded(){
  if(googleTokens.access_token||googleTokens.refresh_token) return;
  const saved=await loadOAuthTokens('google');
  if(saved){
    googleTokens=saved;
    console.log('Loaded Google tokens from VAL store');
  }
}

// Step 1 — redirect user to Google consent screen
// ── IMAGE ANALYSIS (GPT-4o) ─────────────────────────────
app.post('/api/analyze-image',async(req,res)=>{
  try{
    const {base64,mediaType,prompt}=req.body;
    if(!base64||!mediaType) return res.status(400).json({error:'Missing base64 or mediaType'});
    if(!OPENAI_KEY) return res.status(500).json({error:'OPENAI_KEY not configured'});
    const r=await fetch('https://api.openai.com/v1/chat/completions',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${OPENAI_KEY}`},
      body:JSON.stringify({
        model:'gpt-4o',
        max_tokens:1000,
        messages:[{
          role:'user',
          content:[
            {type:'image_url',image_url:{url:`data:${mediaType};base64,${base64}`}},
            {type:'text',text:prompt||'Analyze this image and give detailed feedback. What do you see, what\'s working well, and what could be improved?'}
          ]
        }]
      })
    });
    const d=await r.json();
    if(d.error) return res.status(500).json({error:d.error.message});
    res.json({reply:d.choices?.[0]?.message?.content||'No response'});
  }catch(e){
    console.error('image analysis error:',e);
    res.status(500).json({error:e.message});
  }
});

// ── IMAGE GENERATION (DALL-E 3) ─────────────────────────
app.post('/api/generate-image',async(req,res)=>{
  try{
    const {prompt,size,quality}=req.body;
    if(!prompt) return res.status(400).json({error:'Missing prompt'});
    if(!OPENAI_KEY) return res.status(500).json({error:'OPENAI_KEY not configured'});
    const r=await fetch('https://api.openai.com/v1/images/generations',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${OPENAI_KEY}`},
      body:JSON.stringify({
        model:'dall-e-3',
        prompt,
        n:1,
        size:size||'1024x1024',
        quality:quality||'standard',
        response_format:'url'
      })
    });
    const d=await r.json();
    if(d.error) return res.status(500).json({error:d.error.message});
    const url=d.data?.[0]?.url;
    const revised=d.data?.[0]?.revised_prompt;
    res.json({url,revisedPrompt:revised});
  }catch(e){
    console.error('image generation error:',e);
    res.status(500).json({error:e.message});
  }
});

app.get('/auth/google', (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/gmail.readonly'
  ].join(' ');
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(scopes)}&access_type=offline&prompt=consent`;
  res.redirect(url);
});

// Step 2 — Google redirects back with code, exchange for tokens
app.get('/auth/callback', async (req, res) => {
  const {code} = req.query;
  if(!code) return res.status(400).send('No code received');
  try {
    const r = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {'Content-Type':'application/x-www-form-urlencoded'},
      body: new URLSearchParams({
        code, client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code'
      })
    });
    googleTokens = await r.json();
    googleTokens.issued_at = Date.now();
    if(!googleTokens.refresh_token && process.env.GOOGLE_REFRESH_TOKEN){
      googleTokens.refresh_token = process.env.GOOGLE_REFRESH_TOKEN;
    }
    await saveOAuthTokens('google',googleTokens);
    console.log('Google tokens stored. refresh_token present:', !!googleTokens.refresh_token);
    // Log refresh token so it can be saved as GOOGLE_REFRESH_TOKEN env var in Railway
    if(googleTokens.refresh_token){
      console.log('SAVE THIS AS GOOGLE_REFRESH_TOKEN ENV VAR:', googleTokens.refresh_token);
    }
    res.send(`<h2 style="font-family:sans-serif;padding:2rem">✅ Google Calendar & Gmail connected to VAL!<br><br>You can close this tab.</h2>`);
  } catch(e) {
    res.status(500).send('Auth failed: '+e.message);
  }
});

// Refresh access token if expired
async function getGoogleToken() {
  await ensureGoogleTokensLoaded();
  // If no access token but we have a refresh token, go get one
  if(!googleTokens.access_token && googleTokens.refresh_token) {
    try {
      const r = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {'Content-Type':'application/x-www-form-urlencoded'},
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          refresh_token: googleTokens.refresh_token,
          grant_type: 'refresh_token'
        })
      });
      const fresh = await r.json();
      if(fresh.error){ console.error('Token bootstrap failed:', fresh.error, fresh.error_description); return null; }
      googleTokens = {...googleTokens, ...fresh, issued_at: Date.now()};
      await saveOAuthTokens('google',googleTokens);
      console.log('Bootstrapped access token from refresh token');
      return googleTokens.access_token;
    } catch(e) {
      console.error('Token bootstrap error:', e);
      return null;
    }
  }
  if(!googleTokens.access_token) return null;
  // Check if expired (with 60s buffer)
  const expiresAt = (googleTokens.issued_at||0) + (googleTokens.expires_in||3600)*1000 - 60000;
  if(Date.now() < expiresAt) return googleTokens.access_token;
  // Refresh
  try {
    const r = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {'Content-Type':'application/x-www-form-urlencoded'},
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: googleTokens.refresh_token,
        grant_type: 'refresh_token'
      })
    });
    const fresh = await r.json();
    if(fresh.error){ console.error('Token refresh failed:', fresh.error, fresh.error_description); return null; }
    googleTokens = {...googleTokens, ...fresh, issued_at: Date.now()};
    await saveOAuthTokens('google',googleTokens);
    return googleTokens.access_token;
  } catch(e) {
    console.error('Token refresh failed:', e);
    return null;
  }
}

// Auth status check
app.get('/auth/status', async (req, res) => {
  await ensureGoogleTokensLoaded();
  res.json({connected: !!googleTokens.access_token, hasRefreshToken: !!googleTokens.refresh_token});
});

// ════════════════════════════════════════════════════════
// GOOGLE CALENDAR
// ════════════════════════════════════════════════════════

app.get('/api/google/calendar', async (req, res) => {
  try {
    const token = await getGoogleToken();
    if(!token) return res.json({calendarEvents:[], needsAuth: true, authUrl: '/auth/google'});
    const now = new Date();
    const weekEnd = new Date(); weekEnd.setDate(weekEnd.getDate()+7);
    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now.toISOString()}&timeMax=${weekEnd.toISOString()}&singleEvents=true&orderBy=startTime&maxResults=50`;
    const r = await fetch(url, {headers:{Authorization:`Bearer ${token}`}});
    const d = await r.json();
    const events = (d.items||[]).map(e=>({
      id: e.id,
      summary: e.summary||'(No title)',
      startTime: e.start?.dateTime||e.start?.date,
      endTime: e.end?.dateTime||e.end?.date,
      location: e.location,
      description: e.description,
      attendees: (e.attendees||[]).map(a=>a.email),
      status: e.status
    }));
    res.json({calendarEvents: events});
  } catch(e) {
    res.json({calendarEvents:[], error: e.message});
  }
});

// ════════════════════════════════════════════════════════
// GMAIL — replies from GHL contacts only
// ════════════════════════════════════════════════════════

app.get('/api/google/gmail', async (req, res) => {
  try {
    const token = await getGoogleToken();
    if(!token) return res.json({emails:[], needsAuth: true});

    // First get GHL contacts to cross-reference
    const contactsData = await ghl('GET', `/contacts/?locationId=${GHL_LOC}&limit=100&sortBy=date_added&sortDirection=desc`);
    const contacts = contactsData.contacts||[];
    const contactEmails = new Set(contacts.map(c=>c.email).filter(Boolean).map(e=>e.toLowerCase()));

    // Search Gmail for recent unread messages
    const searchUrl = `https://www.googleapis.com/gmail/v1/users/me/messages?q=is:unread newer_than:7d&maxResults=20`;
    const r = await fetch(searchUrl, {headers:{Authorization:`Bearer ${token}`}});
    const d = await r.json();
    const messages = d.messages||[];

    // Fetch each message header
    const emailDetails = await Promise.all(messages.slice(0,10).map(async m=>{
      const mr = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
        {headers:{Authorization:`Bearer ${token}`}});
      const md = await mr.json();
      const headers = md.payload?.headers||[];
      const from = headers.find(h=>h.name==='From')?.value||'';
      const subject = headers.find(h=>h.name==='Subject')?.value||'';
      const date = headers.find(h=>h.name==='Date')?.value||'';
      const emailMatch = from.match(/<(.+?)>/)||[null,from];
      const fromEmail = emailMatch[1]?.toLowerCase()||'';
      const fromName = from.replace(/<.*>/,'').trim().replace(/"/g,'');
      const isGHLContact = contactEmails.has(fromEmail);
      return {id:m.id, from, fromEmail, fromName, subject, date, isGHLContact};
    }));

    const ghlEmails = emailDetails.filter(e=>e.isGHLContact);
    res.json({emails: emailDetails, ghlEmails, total: messages.length});
  } catch(e) {
    res.json({emails:[], error: e.message});
  }
});

// ════════════════════════════════════════════════════════
// DASHBOARD ENDPOINTS (called by VAL on load)
// ════════════════════════════════════════════════════════

app.get('/api/meetings',async(req,res)=>{
  try{
    const s=new Date();s.setHours(0,0,0,0);
    const e=new Date();e.setHours(23,59,59,999);

    const [ghlRes, googleRes] = await Promise.allSettled([
      ghl('GET',`/calendars/events?locationId=${GHL_LOC}&startTime=${s.getTime()}&endTime=${e.getTime()}`),
      (async()=>{
        const token=await getGoogleToken();
        if(!token)return{items:[]};
        const r=await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${s.toISOString()}&timeMax=${e.toISOString()}&singleEvents=true&orderBy=startTime&maxResults=20`,{headers:{Authorization:`Bearer ${token}`}});
        return r.json();
      })()
    ]);

    const ghlEvents=(ghlRes.status==='fulfilled'?(ghlRes.value.events||ghlRes.value.appointments||[]):[]).map(ev=>({
      id:ev.id, title:ev.title||ev.name, contactName:ev.contactName||ev.contact?.name,
      startTime:ev.startTime||ev.start, endTime:ev.endTime||ev.end,
      status:ev.appointmentStatus||ev.status, source:'ghl'
    }));

    const googleEvents=(googleRes.status==='fulfilled'?(googleRes.value.items||[]):[]).map(ev=>({
      id:ev.id, title:ev.summary||'(No title)',
      startTime:ev.start?.dateTime||ev.start?.date,
      endTime:ev.end?.dateTime||ev.end?.date,
      status:ev.status, source:'google'
    }));

    const allEvents=[...ghlEvents,...googleEvents];
    allEvents.sort((a,b)=>new Date(a.startTime)-new Date(b.startTime));
    res.json({meetingsToday:allEvents.length, appointments:allEvents});
  }catch(e){
    console.error('meetings error:',e);
    res.json({meetingsToday:0,appointments:[]});
  }
});

app.get('/api/pipeline',async(req,res)=>{
  try{
    const d=await ghl('GET',`/opportunities/search?location_id=${GHL_LOC}&status=open&limit=100`);
    const opps=d.opportunities||[];
    const now=Date.now();
    const stalled=opps.filter(o=>(now-new Date(o.lastStatusChangeAt||o.updatedAt).getTime())>14*24*60*60*1000);

    // Enrich each opp with contact notes
    const enriched=await Promise.all(opps.map(async o=>{
      console.log('RAW OPP FIELDS:', JSON.stringify({pipelineStage:o.pipelineStage, stage:o.stage, stageName:o.stageName, pipelineId:o.pipelineId, pipelineStageId:o.pipelineStageId, status:o.status}));
      const stage=o.pipelineStage?.name||o.stage?.name||o.stageName||o.pipelineStage||'Unknown Stage';
      const contactId=o.contact?.id||o.contactId;
      let notes=[];
      let contactEmail='';
      let contactPhone='';
      try{
        if(contactId){
          const [notesData,contactData]=await Promise.all([
            ghl('GET',`/contacts/${contactId}/notes`),
            ghl('GET',`/contacts/${contactId}`)
          ]);
          console.log('RAW NOTES:', JSON.stringify(notesData).substring(0,300));
          notes=(notesData.notes||notesData.data||[]).map(n=>n.body||n.note||n.text||n.content||'').filter(Boolean).slice(0,3);
          contactEmail=contactData.contact?.email||'';
          contactPhone=contactData.contact?.phone||'';
        }
      }catch(e){console.log('contact enrich error:',e.message);}
      return {
        id:o.id,
        name:o.name,
        status:o.status,
        stage,
        value:o.monetaryValue,
        contactName:o.contact?.name||o.contactName||'',
        contactId,
        contactEmail,
        contactPhone,
        notes,
        updatedAt:o.updatedAt,
        daysInStage:Math.floor((now-new Date(o.lastStatusChangeAt||o.updatedAt).getTime())/(24*60*60*1000)),
        stalled:(now-new Date(o.lastStatusChangeAt||o.updatedAt).getTime())>14*24*60*60*1000
      };
    }));

    res.json({pipelineActive:d.meta?.total||opps.length,stalledDeals:stalled.length,opportunities:enriched});
  }catch(e){console.error('pipeline error:',e);res.json({pipelineActive:0,stalledDeals:0,opportunities:[]});}
});

app.get('/api/calendar',async(req,res)=>{
  try{
    const token = await getGoogleToken();
    if(!token){
      console.log('Google token missing — needs auth');
      return res.json({calendarEvents:[], _debug:{googleNeedsAuth:true,hasRefreshToken:!!googleTokens.refresh_token}});
    }

    const s = new Date(); s.setHours(0,0,0,0);
    const e = new Date(); e.setDate(e.getDate()+14); e.setHours(23,59,59,999);

    const r = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events`
      +`?timeMin=${s.toISOString()}&timeMax=${e.toISOString()}`
      +`&singleEvents=true&orderBy=startTime&maxResults=100`,
      {headers:{Authorization:`Bearer ${token}`}}
    );
    const d = await r.json();

    if(d.error){
      console.error('Google Calendar API error:', d.error.message);
      return res.json({calendarEvents:[], _debug:{googleError:d.error.message}});
    }

    const calendarEvents = (d.items||[]).map(ev=>({
      id:        ev.id,
      summary:   ev.summary||'(No title)',
      startTime: ev.start?.dateTime||ev.start?.date,
      endTime:   ev.end?.dateTime||ev.end?.date,
      location:  ev.location||'',
      description: ev.description||'',
      attendees: (ev.attendees||[]).map(a=>a.displayName||a.email),
      status:    ev.status,
      source:    'google'
    }));

    console.log(`Calendar: ${calendarEvents.length} Google events`);
    res.json({calendarEvents, _debug:{googleCount:calendarEvents.length}});
  }catch(e){
    console.error('calendar error:',e);
    res.json({calendarEvents:[], _debug:{error:e.message}});
  }
});

// Debug endpoint — raw calendar responses
app.get('/api/debug/calendar',async(req,res)=>{
  try{
    const s=new Date();s.setHours(0,0,0,0);
    const e=new Date();e.setDate(e.getDate()+7);e.setHours(23,59,59,999);

    const [c1,c2,c3] = await Promise.allSettled([
      ghl('GET',`/calendars/?locationId=${GHL_LOC}`),
      ghl('GET',`/calendars/groups?locationId=${GHL_LOC}`),
      ghl('GET',`/users/search?locationId=${GHL_LOC}&limit=10`)
    ]);

    const calendars = c1.status==='fulfilled'?(c1.value.calendars||[]):[];
    const groups = c2.status==='fulfilled'?(c2.value.groups||[]):[];

    // Try fetching events for first calendar if any
    let sampleEvents=[];
    if(calendars.length){
      try{
        const d=await ghl('GET',`/calendars/events?locationId=${GHL_LOC}&calendarId=${calendars[0].id}&startTime=${s.getTime()}&endTime=${e.getTime()}`);
        sampleEvents=(d.events||d.appointments||[]).slice(0,3).map(ev=>({title:ev.title||ev.name,start:ev.startTime||ev.start}));
      }catch(err){}
    }

    const token=await getGoogleToken();
    let googleRaw={needsAuth:true};
    if(token){
      const r=await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${s.toISOString()}&timeMax=${e.toISOString()}&singleEvents=true&orderBy=startTime&maxResults=5`,{headers:{Authorization:`Bearer ${token}`}});
      googleRaw=await r.json();
    }

    res.json({
      timeRange:{start:s.toISOString(),end:e.toISOString()},
      calendars: calendars.map(c=>({id:c.id,name:c.name,type:c.calendarType})),
      groups: groups.map(g=>({id:g.id,name:g.name})),
      sampleEvents,
      users: c3.status==='fulfilled'?{count:(c3.value.users||[]).length,keys:Object.keys(c3.value)}:{error:c3.reason?.message},
      google:{hasToken:!!token,itemsCount:(googleRaw.items||[]).length,needsAuth:!!googleRaw.needsAuth,error:googleRaw.error?.message,items:(googleRaw.items||[]).map(i=>({summary:i.summary,start:i.start}))}
    });
  }catch(e){res.json({error:e.message});}
});

app.get('/api/tasks',async(req,res)=>{
  const now=new Date();
  function normalizeTasks(arr){
    return arr.map(t=>({
      id:t.id||t._id,
      title:t.title||t.name||'(No title)',
      contactName:t.contactName||t.contact?.name||'',
      contactId:t.contactId||t.contact?.id||'',
      contactEmail:t.contactEmail||'',
      dueDate:t.dueDate||t.due_date||t.dueAt||t.due||null,
      status:t.status||'open',
      completed:t.completed===true||t.status==='completed'||t.status==='closed'
    }));
  }
  async function trySearchEndpoint(){
    const d=await ghl('GET',`/contacts/tasks/search?locationId=${GHL_LOC}&limit=100&status=open`);
    console.log('tasks search response keys:',Object.keys(d));
    const arr=d.tasks||d.data||d.items||d.records||[];
    if(arr.length>0) return normalizeTasks(arr);
    return null;
  }
  async function tryLocationEndpoint(){
    const d=await ghl('GET',`/locations/${GHL_LOC}/tasks?limit=100&status=open`);
    console.log('tasks location response keys:',Object.keys(d));
    const arr=d.tasks||d.data||d.items||d.records||[];
    if(arr.length>0) return normalizeTasks(arr);
    return null;
  }
  async function trySearchPost(){
    const d=await ghl('POST',`/contacts/tasks/search`,{locationId:GHL_LOC,limit:100,filters:[{field:'status',value:'open'}]});
    console.log('tasks POST response keys:',Object.keys(d));
    const arr=d.tasks||d.data||d.items||d.records||[];
    if(arr.length>0) return normalizeTasks(arr);
    return null;
  }
  async function tryContactLoop(){
    // Fetch val_task tagged contacts first (from GHL automation), then general batches
    const [taggedRes, batch1, batch2, batch3] = await Promise.allSettled([
      ghl('GET',`/contacts/?locationId=${GHL_LOC}&limit=100&tags[]=val_task`),
      ghl('GET',`/contacts/?locationId=${GHL_LOC}&limit=100&sortBy=date_added&sortDirection=desc`),
      ghl('GET',`/contacts/?locationId=${GHL_LOC}&limit=100&sortBy=date_added&sortDirection=asc`),
      ghl('GET',`/contacts/?locationId=${GHL_LOC}&limit=100&sortBy=last_activity&sortDirection=desc`),
    ]);
    const allContacts=new Map();
    // Add tagged contacts first so they're always included
    if(taggedRes.status==='fulfilled'){
      const tagged=taggedRes.value.contacts||[];
      console.log('val_task tagged contacts found:',tagged.length);
      tagged.forEach(c=>allContacts.set(c.id,c));
    }
    [batch1,batch2,batch3].forEach(b=>{
      if(b.status==='fulfilled')(b.value.contacts||[]).forEach(c=>allContacts.set(c.id,c));
    });
    console.log('task loop: total unique contacts',allContacts.size);
    const contacts=[...allContacts.values()];
    const taskArrays=await Promise.all(contacts.map(async c=>{
      try{
        const t=await ghl('GET',`/contacts/${c.id}/tasks`);
        const tasks=t.tasks||[];
        if(tasks.length) console.log(`contact ${c.firstName} ${c.lastName} has ${tasks.length} tasks:`, JSON.stringify(tasks[0]).substring(0,200));
        return tasks.map(task=>({...task,contactName:((c.firstName||'')+' '+(c.lastName||'')).trim()||c.email||'Contact',contactId:c.id,contactEmail:c.email||''}));
      }catch(e){return [];}
    }));
    const flat=taskArrays.flat();
    console.log('task loop total raw tasks found:',flat.length);
    return normalizeTasks(flat);
  }
  try{
    let allTasks=null,source='';
    try{ allTasks=await trySearchEndpoint(); source='search'; }catch(e){ console.log('search endpoint failed:',e.message); }
    if(!allTasks){ try{ allTasks=await tryLocationEndpoint(); source='location'; }catch(e){ console.log('location endpoint failed:',e.message); } }
    if(!allTasks){ try{ allTasks=await trySearchPost(); source='post'; }catch(e){ console.log('post endpoint failed:',e.message); } }
    if(!allTasks){ allTasks=await tryContactLoop(); source='loop'; }
    console.log(`tasks source: ${source}, count: ${allTasks.length}`);
    const open=allTasks.filter(t=>!t.completed);
    const overdue=open.filter(t=>t.dueDate&&new Date(t.dueDate)<now);
    res.json({openTasks:open.length,overdueTasks:overdue.length,source,tasks:open.slice(0,50).map(t=>({id:t.id,title:t.title,contactName:t.contactName,contactId:t.contactId,dueDate:t.dueDate,status:t.status,overdue:!!(t.dueDate&&new Date(t.dueDate)<now)}))});
  }catch(e){
    console.error('tasks error:',e);
    res.json({openTasks:0,overdueTasks:0,tasks:[],error:e.message});
  }
});

// Debug endpoint — tasks
app.get('/api/debug/tasks',async(req,res)=>{
  try{
    // Test contacts fetch several ways
    const [cRes1, cRes2, cRes3] = await Promise.allSettled([
      ghl('GET',`/contacts/?locationId=${GHL_LOC}&limit=5`),
      ghl('GET',`/contacts?locationId=${GHL_LOC}&limit=5`),
      ghl('GET',`/contacts/?locationId=${GHL_LOC}&limit=5&sortBy=date_added&sortDirection=desc`),
    ]);
    const fmtC=r=>r.status==='fulfilled'?{keys:Object.keys(r.value),count:(r.value.contacts||[]).length,first:(r.value.contacts||[])[0]?.id}:{error:r.reason?.message};

    // Test known contact task fetch (VAL contact from pipeline)
    const knownContactId='c2tu9Oh6ybL2WMQ5PVJQ';
    let knownContactTasks=null;
    try{
      const ct=await ghl('GET',`/contacts/${knownContactId}/tasks`);
      knownContactTasks={keys:Object.keys(ct),raw:ct};
    }catch(e){knownContactTasks={error:e.message};}

    // Try a broader contacts search
    let allContactsTest=null;
    try{
      const ac=await ghl('GET',`/contacts/?locationId=${GHL_LOC}&limit=100`);
      allContactsTest={count:(ac.contacts||[]).length,keys:Object.keys(ac),ids:(ac.contacts||[]).slice(0,5).map(c=>c.id)};
    }catch(e){allContactsTest={error:e.message};}

    res.json({
      contactsV1:fmtC(cRes1),
      contactsV2:fmtC(cRes2),
      contactsV3:fmtC(cRes3),
      allContactsTest,
      knownContactTasks,
      knownContactId
    });
  }catch(e){res.json({error:e.message});}
});

app.get('/api/proposals',async(req,res)=>{
  try{
    // Fetch all status groups in parallel using the correct endpoint
    const statusGroups={
      draft:['draft'],
      sent:['sent'],
      viewed:['viewed'],
      signed:['completed','accepted']  // 'signed' is not valid per GHL
    };

    const results=await Promise.allSettled(
      Object.entries(statusGroups).map(async([stage,statuses])=>{
        const statusParams=statuses.map(s=>`status[]=${s}`).join('&');
        const d=await ghl('GET',`/proposals/document?locationId=${GHL_LOC}&${statusParams}&skip=0&limit=20`);
        console.log(`proposals ${stage}:`,JSON.stringify(d).substring(0,200));
        const docs=d.documents||d.proposals||d.data||d.list||[];
        return {stage, docs};
      })
    );

    const byStage={draft:[],sent:[],viewed:[],signed:[]};
    results.forEach(r=>{
      if(r.status==='fulfilled'){
        const {stage,docs}=r.value;
        byStage[stage]=docs.map(d=>({
          id:d.id||d._id,
          title:d.name||d.title||d.documentName||'Proposal',
          status:d.status,
          stage,
          contactName:d.contactName||d.contact?.name||d.recipientName||'',
          value:d.amount||d.total||d.value||0,
          viewCount:d.viewCount||d.views||d.openCount||0,
          sentAt:d.sentAt||d.updatedAt||d.createdAt,
          signedAt:d.signedAt||d.completedAt||null,
          url:`https://app.gohighlevel.com/v2/location/${GHL_LOC}/payments/proposals-estimates`
        }));
      }
    });

    const all=[...byStage.draft,...byStage.sent,...byStage.viewed,...byStage.signed];
    const waiting=[...byStage.sent,...byStage.viewed];

    res.json({
      total:waiting.length,
      draft:byStage.draft.length,
      sent:byStage.sent.length,
      viewed:byStage.viewed.length,
      signed:byStage.signed.length,
      allCount:all.length,
      proposals:all,
      waiting
    });
  }catch(e){
    console.error('proposals error:',e);
    res.json({total:0,draft:0,sent:0,viewed:0,signed:0,proposals:[],error:e.message});
  }
});

app.get('/api/debug/proposals',async(req,res)=>{
  const results={};
  const endpoints=[
    `/proposals/document?locationId=${GHL_LOC}&limit=10`,
    `/proposals/document?locationId=${GHL_LOC}&status[]=draft&limit=10`,
    `/proposals/document?locationId=${GHL_LOC}&status[]=sent&limit=10`,
    `/proposals/document?locationId=${GHL_LOC}&status[]=completed&limit=10`,
    `/proposals/document?locationId=${GHL_LOC}&status[]=viewed&limit=10`,
  ];
  await Promise.all(endpoints.map(async ep=>{
    try{const d=await ghl('GET',ep);results[ep]={status:'ok',keys:Object.keys(d),count:(d.documents||d.data||d.list||[]).length,sample:JSON.stringify(d).substring(0,300)};}
    catch(e){results[ep]={status:'error',message:e.message};}
  }));
  res.json(results);
});

// ── DEBUG: first unread conversation messages ──────────
app.get('/api/debug/conversation',async(req,res)=>{
  try{
    const d=await ghl('GET',`/conversations/search?locationId=${GHL_LOC}&limit=10`);
    const convos=d.conversations||[];
    const unread=convos.filter(c=>c.unreadCount>0);
    if(!unread.length) return res.json({error:'No unread conversations found', total:convos.length});
    const first=unread[0];
    const msgs=await ghl('GET',`/conversations/${first.id}/messages?limit=10`);
    res.json({
      conversationId:first.id,
      contactName:first.contactName,
      unreadCount:first.unreadCount,
      rawConversation:first,
      rawMessages:msgs
    });
  }catch(e){res.status(500).json({error:e.message});}
});

// ── CONVERSATION THREAD ────────────────────────────────
app.get('/api/conversation/:id',async(req,res)=>{
  const id=req.params.id;
  let convRaw={}, msgRaw={}, convErr=null, msgErr=null;
  try{
    convRaw=await ghl('GET',`/conversations/${id}`);
  }catch(e){ convErr=e.message; }

  try{
    msgRaw=await ghl('GET',`/conversations/${id}/messages?limit=20`);
  }catch(e){ msgErr=e.message; }

  const conv=convRaw.conversation||convRaw;

  // GHL nests messages as msgRaw.messages.messages
  const msgContainer=msgRaw.messages||msgRaw;
  const rawMessages=Array.isArray(msgContainer)?msgContainer
    :(msgContainer.messages||msgRaw.data||[]);

  console.log('rawMessages type:', typeof rawMessages, Array.isArray(rawMessages), 'length:', rawMessages.length);
  if(rawMessages[0]) console.log('first msg keys:', Object.keys(rawMessages[0]));

  const messages=rawMessages
    .filter(m=>m&&typeof m==='object')
    .slice(-15)
    .map(m=>{
      // GHL email messages store body in meta.email or body or html
      var body=m.body||m.text||m.content||m.html||m.message
        ||(m.meta&&m.meta.email&&m.meta.email.body)
        ||(m.attachments&&m.attachments[0]&&m.attachments[0].url?'[Attachment]':'')
        ||'(no body)';
      // Strip HTML tags for readability
      body=body.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
      var dir=(m.direction==='outbound'||m.type===1||m.type==='outbound')?'outbound':'inbound';
      return {
        id:m.id||'',
        direction:dir,
        body:body,
        type:m.type||m.messageType||m.contentType||'unknown',
        dateAdded:m.dateAdded||m.createdAt||'',
        from:dir==='outbound'?'You':conv.contactName||'Contact'
      };
    })
    .filter(m=>m.body&&m.body!=='(no body)');

  res.json({
    id,
    contactName:conv.contactName||conv.name||'Contact',
    contactId:conv.contactId||'',
    type:conv.type||'unknown',
    unreadCount:conv.unreadCount||0,
    lastMessageBody:conv.lastMessageBody||'',
    messages,
    lastMessage:messages[messages.length-1]?.body||conv.lastMessageBody||'',
    _debug:{convErr,msgErr,rawMessageCount:rawMessages.length,firstMsgKeys:rawMessages[0]?Object.keys(rawMessages[0]):[]}
  });
});

app.get('/api/comms',async(req,res)=>{
  try{
    const d=await ghl('GET',`/conversations/search?locationId=${GHL_LOC}&limit=50`);
    const convos=d.conversations||[];
    const unread=convos.filter(c=>c.unreadCount>0);
    res.json({
      total:unread.length,
      ghlUnread:unread.length,
      items:unread.map(c=>({
        id:c.id,
        label:`${c.contactName||'Contact'} (${c.unreadCount} unread)`,
        sublabel:c.lastMessage||'',
        source:'ghl',
        type:'unread',
        actionUrl:`https://app.gohighlevel.com/v2/location/${GHL_LOC}/conversations/${c.id}`
      }))
    });
  }catch(e){
    console.error('comms error:',e);
    res.json({total:0,ghlUnread:0,items:[],error:e.message});
  }
});

app.get('/api/feed',async(req,res)=>{
  try{
    const now=Date.now();
    const todayStart=new Date();todayStart.setHours(0,0,0,0);
    const todayEnd=new Date();todayEnd.setHours(23,59,59,999);

    const [convosRes, oppsRes, tasksRes, calRes] = await Promise.allSettled([
      ghl('GET',`/conversations/search?locationId=${GHL_LOC}&limit=30`),
      ghl('GET',`/opportunities/search?location_id=${GHL_LOC}&status=open&limit=50`),
      ghl('GET',`/tasks/search?locationId=${GHL_LOC}&limit=50`),
      (async()=>{
        const calData=await ghl('GET',`/calendars/?locationId=${GHL_LOC}`);
        const calendars=calData.calendars||[];
        let events=[];
        await Promise.all(calendars.map(async cal=>{
          try{
            const d=await ghl('GET',`/calendars/events?locationId=${GHL_LOC}&calendarId=${cal.id}&startTime=${todayStart.getTime()}&endTime=${todayEnd.getTime()}`);
            events.push(...(d.events||d.appointments||[]));
          }catch(e){}
        }));
        return events;
      })()
    ]);

    const items=[];

    // Unread conversations
    const convos=convosRes.status==='fulfilled'?(convosRes.value.conversations||[]):[];
    convos.filter(c=>c.unreadCount>0).slice(0,5).forEach(c=>{
      items.push({
        id:c.id,
        text:`${c.contactName||'Contact'} — ${c.unreadCount} unread message${c.unreadCount>1?'s':''}`,
        type:'Comms',color:'green',
        time:new Date(c.dateUpdated).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}),
        actionUrl:`https://app.gohighlevel.com/v2/location/${GHL_LOC}/conversations/${c.id}`
      });
    });

    // Stalled pipeline deals
    const opps=oppsRes.status==='fulfilled'?(oppsRes.value.opportunities||[]):[];
    opps.filter(o=>(now-new Date(o.lastStatusChangeAt||o.updatedAt).getTime())>7*24*60*60*1000).slice(0,3).forEach(o=>{
      const days=Math.floor((now-new Date(o.lastStatusChangeAt||o.updatedAt).getTime())/(24*60*60*1000));
      items.push({
        text:`${o.contact?.name||o.name} — pipeline stalled ${days}d`,
        type:'Pipeline',color:'amber',
        time:o.pipelineStage?.name||'Open',
        actionUrl:`https://app.gohighlevel.com/v2/location/${GHL_LOC}/opportunities/${o.id}`
      });
    });

    // Overdue tasks
    const tasks=tasksRes.status==='fulfilled'?(tasksRes.value.tasks||tasksRes.value||[]):[];
    const taskArr=Array.isArray(tasks)?tasks:(tasks.tasks||[]);
    taskArr.filter(t=>t.dueDate&&new Date(t.dueDate)<new Date()&&!t.completed).slice(0,3).forEach(t=>{
      items.push({
        text:`Overdue: ${t.title||t.name||'Task'}`,
        type:'Task',color:'red',
        time:new Date(t.dueDate).toLocaleDateString([],{month:'short',day:'numeric'})
      });
    });

    // Today's meetings
    const events=calRes.status==='fulfilled'?(Array.isArray(calRes.value)?calRes.value:[]):[];
    events.slice(0,3).forEach(e=>{
      const start=e.startTime||e.start?.dateTime||e.start?.date;
      items.push({
        text:`Meeting: ${e.title||e.summary||'Appointment'}`,
        type:'Meeting',color:'gold',
        time:start?new Date(start).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}):''
      });
    });

    // Sort: comms first, then pipeline, tasks, meetings
    const order={Comms:0,Pipeline:1,Task:2,Meeting:3};
    items.sort((a,b)=>(order[a.type]||9)-(order[b.type]||9));

    // Fallback if nothing
    if(!items.length){
      items.push({text:'All clear — no urgent signals',type:'Status',color:'navy',time:new Date().toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})});
    }

    res.json({feedItems:items,followups:convos.filter(c=>c.unreadCount>0).length});
  }catch(e){
    console.error('feed error:',e);
    res.json({feedItems:[{text:'Feed unavailable',type:'Error',color:'red',time:''}],followups:0});
  }
});

// ════════════════════════════════════════════════════════
// 1-2. CALENDAR TOOLS
// ════════════════════════════════════════════════════════

app.get('/api/ghl/calendar/events',async(req,res)=>{
  try{
    const {calendarId,userId,groupId,startTime,endTime}=req.query;
    let qs=`locationId=${GHL_LOC}`;
    if(calendarId)qs+=`&calendarId=${calendarId}`;
    if(userId)qs+=`&userId=${userId}`;
    if(groupId)qs+=`&groupId=${groupId}`;
    if(startTime)qs+=`&startTime=${startTime}`;
    if(endTime)qs+=`&endTime=${endTime}`;
    res.json(await ghl('GET',`/calendars/events?${qs}`));
  }catch(e){res.status(500).json({error:e.message});}
});

app.get('/api/ghl/calendar/appointments/:id/notes',async(req,res)=>{
  try{res.json(await ghl('GET',`/calendars/appointments/${req.params.id}/notes`));}
  catch(e){res.status(500).json({error:e.message});}
});

// ════════════════════════════════════════════════════════
// 3-10. CONTACT TOOLS
// ════════════════════════════════════════════════════════

app.get('/api/ghl/contacts',async(req,res)=>{
  try{
    const {limit=20,query,sortBy,sortDirection}=req.query;
    let qs=`locationId=${GHL_LOC}&limit=${limit}`;
    if(query)qs+=`&query=${encodeURIComponent(query)}`;
    if(sortBy)qs+=`&sortBy=${sortBy}`;
    if(sortDirection)qs+=`&sortDirection=${sortDirection}`;
    res.json(await ghl('GET',`/contacts/?${qs}`));
  }catch(e){res.status(500).json({error:e.message});}
});

app.post('/api/ghl/contacts',async(req,res)=>{
  try{res.json(await ghl('POST',`/contacts`,{...req.body,locationId:GHL_LOC}));}
  catch(e){res.status(500).json({error:e.message});}
});

app.post('/api/ghl/contacts/upsert',async(req,res)=>{
  try{res.json(await ghl('POST',`/contacts/upsert`,req.body));}
  catch(e){res.status(500).json({error:e.message});}
});

app.get('/api/ghl/contacts/:id',async(req,res)=>{
  try{res.json(await ghl('GET',`/contacts/${req.params.id}`));}
  catch(e){res.status(500).json({error:e.message});}
});

app.put('/api/ghl/contacts/:id',async(req,res)=>{
  try{res.json(await ghl('PUT',`/contacts/${req.params.id}`,req.body));}
  catch(e){res.status(500).json({error:e.message});}
});

app.get('/api/ghl/contacts/:id/tasks',async(req,res)=>{
  try{res.json(await ghl('GET',`/contacts/${req.params.id}/tasks`));}
  catch(e){res.status(500).json({error:e.message});}
});

app.post('/api/ghl/contacts/:id/tasks',async(req,res)=>{
  try{res.json(await ghl('POST',`/contacts/${req.params.id}/tasks`,req.body));}
  catch(e){res.status(500).json({error:e.message});}
});

app.get('/api/ghl/contacts/search',async(req,res)=>{
  try{
    const q=req.query.q||'';
    const d=await ghl('GET',`/contacts/?locationId=${GHL_LOC}&query=${encodeURIComponent(q)}&limit=5`);
    res.json({contacts:(d.contacts||[]).map(c=>({id:c.id,name:c.contactName||c.name||c.firstName+' '+c.lastName,email:c.email,phone:c.phone}))});
  }catch(e){res.status(500).json({error:e.message});}
});


app.post('/api/ghl/contacts/:id/tags',async(req,res)=>{
  try{res.json(await ghl('POST',`/contacts/${req.params.id}/tags`,req.body));}
  catch(e){res.status(500).json({error:e.message});}
});

app.delete('/api/ghl/contacts/:id/tags',async(req,res)=>{
  try{res.json(await ghl('DELETE',`/contacts/${req.params.id}/tags`,req.body));}
  catch(e){res.status(500).json({error:e.message});}
});

// ════════════════════════════════════════════════════════
// 11-13. CONVERSATION TOOLS
// ════════════════════════════════════════════════════════

app.get('/api/ghl/conversations',async(req,res)=>{
  try{
    const {limit=20,query,status}=req.query;
    let qs=`locationId=${GHL_LOC}&limit=${limit}`;
    if(query)qs+=`&query=${encodeURIComponent(query)}`;
    if(status)qs+=`&status=${status}`;
    res.json(await ghl('GET',`/conversations/search?${qs}`));
  }catch(e){res.status(500).json({error:e.message});}
});

app.get('/api/ghl/conversations/:id/messages',async(req,res)=>{
  try{res.json(await ghl('GET',`/conversations/${req.params.id}/messages`));}
  catch(e){res.status(500).json({error:e.message});}
});

app.post('/api/ghl/conversations/:id/messages',async(req,res)=>{
  try{res.json(await ghl('POST',`/conversations/messages`,{...req.body,conversationId:req.params.id}));}
  catch(e){res.status(500).json({error:e.message});}
});

// ════════════════════════════════════════════════════════
// 14-15. LOCATION TOOLS
// ════════════════════════════════════════════════════════

app.get('/api/ghl/location',async(req,res)=>{
  try{res.json(await ghl('GET',`/locations/${GHL_LOC}`));}
  catch(e){res.status(500).json({error:e.message});}
});

app.get('/api/ghl/location/custom-fields',async(req,res)=>{
  try{res.json(await ghl('GET',`/locations/${GHL_LOC}/customFields`));}
  catch(e){res.status(500).json({error:e.message});}
});

// ════════════════════════════════════════════════════════
// 16-19. OPPORTUNITY TOOLS
// ════════════════════════════════════════════════════════

app.get('/api/ghl/opportunities',async(req,res)=>{
  try{
    const {limit=20,query,status,pipelineId,stageId}=req.query;
    let qs=`location_id=${GHL_LOC}&limit=${limit}`;
    if(query)qs+=`&query=${encodeURIComponent(query)}`;
    if(status)qs+=`&status=${status}`;
    if(pipelineId)qs+=`&pipeline_id=${pipelineId}`;
    if(stageId)qs+=`&pipeline_stage_id=${stageId}`;
    res.json(await ghl('GET',`/opportunities/search?${qs}`));
  }catch(e){res.status(500).json({error:e.message});}
});

app.get('/api/ghl/pipelines',async(req,res)=>{
  try{res.json(await ghl('GET',`/opportunities/pipelines?locationId=${GHL_LOC}`));}
  catch(e){res.status(500).json({error:e.message});}
});

app.get('/api/ghl/opportunities/:id',async(req,res)=>{
  try{res.json(await ghl('GET',`/opportunities/${req.params.id}`));}
  catch(e){res.status(500).json({error:e.message});}
});

app.put('/api/ghl/opportunities/:id',async(req,res)=>{
  try{res.json(await ghl('PUT',`/opportunities/${req.params.id}`,req.body));}
  catch(e){res.status(500).json({error:e.message});}
});

// ════════════════════════════════════════════════════════
// 20-21. PAYMENT TOOLS
// ════════════════════════════════════════════════════════

app.get('/api/ghl/payments/orders/:id',async(req,res)=>{
  try{res.json(await ghl('GET',`/payments/orders/${req.params.id}?locationId=${GHL_LOC}`));}
  catch(e){res.status(500).json({error:e.message});}
});

app.get('/api/ghl/payments/transactions',async(req,res)=>{
  try{
    const {limit=20,startAt,endAt}=req.query;
    let qs=`locationId=${GHL_LOC}&limit=${limit}`;
    if(startAt)qs+=`&startAt=${startAt}`;
    if(endAt)qs+=`&endAt=${endAt}`;
    res.json(await ghl('GET',`/payments/transactions?${qs}`));
  }catch(e){res.status(500).json({error:e.message});}
});

// ════════════════════════════════════════════════════════
// 22-28. BLOG TOOLS
// ════════════════════════════════════════════════════════

app.get('/api/ghl/blogs',async(req,res)=>{
  try{res.json(await ghl('GET',`/blogs/?locationId=${GHL_LOC}`));}
  catch(e){res.status(500).json({error:e.message});}
});

app.get('/api/ghl/blogs/check-slug',async(req,res)=>{
  try{
    const {urlSlug,blogId,postId}=req.query;
    let qs=`locationId=${GHL_LOC}&urlSlug=${encodeURIComponent(urlSlug)}&blogId=${blogId}`;
    if(postId)qs+=`&postId=${postId}`;
    res.json(await ghl('GET',`/blogs/posts/url-slug-exists?${qs}`));
  }catch(e){res.status(500).json({error:e.message});}
});

app.get('/api/ghl/blogs/authors',async(req,res)=>{
  try{res.json(await ghl('GET',`/blogs/authors?locationId=${GHL_LOC}`));}
  catch(e){res.status(500).json({error:e.message});}
});

app.get('/api/ghl/blogs/categories',async(req,res)=>{
  try{res.json(await ghl('GET',`/blogs/categories?locationId=${GHL_LOC}`));}
  catch(e){res.status(500).json({error:e.message});}
});

app.get('/api/ghl/blogs/:blogId/posts',async(req,res)=>{
  try{
    const {limit=20,skip=0}=req.query;
    res.json(await ghl('GET',`/blogs/${req.params.blogId}/posts?locationId=${GHL_LOC}&limit=${limit}&skip=${skip}`));
  }catch(e){res.status(500).json({error:e.message});}
});

app.post('/api/ghl/blogs/:blogId/posts',async(req,res)=>{
  try{res.json(await ghl('POST',`/blogs/${req.params.blogId}/posts`,{...req.body,locationId:GHL_LOC}));}
  catch(e){res.status(500).json({error:e.message});}
});

app.put('/api/ghl/blogs/:blogId/posts/:postId',async(req,res)=>{
  try{res.json(await ghl('PUT',`/blogs/${req.params.blogId}/posts/${req.params.postId}`,req.body));}
  catch(e){res.status(500).json({error:e.message});}
});

// ════════════════════════════════════════════════════════
// 29-30. EMAIL TOOLS
// ════════════════════════════════════════════════════════

app.get('/api/ghl/emails/templates',async(req,res)=>{
  try{
    const {limit=20,skip=0}=req.query;
    res.json(await ghl('GET',`/emails/builder?locationId=${GHL_LOC}&limit=${limit}&skip=${skip}`));
  }catch(e){res.status(500).json({error:e.message});}
});

app.post('/api/ghl/emails/templates',async(req,res)=>{
  try{res.json(await ghl('POST',`/emails/builder`,{...req.body,locationId:GHL_LOC}));}
  catch(e){res.status(500).json({error:e.message});}
});

// ════════════════════════════════════════════════════════
// 31-36. SOCIAL MEDIA TOOLS
// ════════════════════════════════════════════════════════

app.get('/api/ghl/social/accounts',async(req,res)=>{
  try{res.json(await ghl('GET',`/social-media-posting/oauth/${GHL_LOC}/accounts`));}
  catch(e){res.status(500).json({error:e.message});}
});

app.get('/api/ghl/social/statistics',async(req,res)=>{
  try{
    const {startDate,endDate,accountIds}=req.query;
    let qs=`locationId=${GHL_LOC}`;
    if(startDate)qs+=`&startDate=${startDate}`;
    if(endDate)qs+=`&endDate=${endDate}`;
    if(accountIds)qs+=`&accountIds=${accountIds}`;
    res.json(await ghl('GET',`/social-media-posting/statistics?${qs}`));
  }catch(e){res.status(500).json({error:e.message});}
});

app.get('/api/ghl/social/posts',async(req,res)=>{
  try{
    const {limit=20,skip=0,status}=req.query;
    let qs=`limit=${limit}&skip=${skip}`;
    if(status)qs+=`&status=${status}`;
    res.json(await ghl('GET',`/social-media-posting/${GHL_LOC}/posts?${qs}`));
  }catch(e){res.status(500).json({error:e.message});}
});

app.post('/api/ghl/social/posts',async(req,res)=>{
  try{res.json(await ghl('POST',`/social-media-posting/${GHL_LOC}/posts`,req.body));}
  catch(e){res.status(500).json({error:e.message});}
});

app.get('/api/ghl/social/posts/:id',async(req,res)=>{
  try{res.json(await ghl('GET',`/social-media-posting/${GHL_LOC}/posts/${req.params.id}`));}
  catch(e){res.status(500).json({error:e.message});}
});

app.put('/api/ghl/social/posts/:id',async(req,res)=>{
  try{res.json(await ghl('PUT',`/social-media-posting/${GHL_LOC}/posts/${req.params.id}`,req.body));}
  catch(e){res.status(500).json({error:e.message});}
});

function readTasks(){
  return readJson(TASKS_FILE,[]);
}
function writeTasks(tasks){
  writeJson(TASKS_FILE,tasks);
}
function rowToTask(row){
  return {
    id: row.id,
    title: row.title,
    contactName: row.contact_name || '',
    dueDate: row.due_date ? row.due_date.toISOString() : null,
    notes: row.notes || '',
    details: row.details || [],
    completed: !!row.completed,
    createdAt: row.created_at ? row.created_at.toISOString() : new Date().toISOString()
  };
}
async function loadTasks(){
  await valDbReady;
  if(pgPool){
    const r = await dbQuery('select * from val_tasks where user_id=$1 order by completed asc, due_date asc nulls last, created_at desc',[VAL_USER_ID]);
    return r.rows.map(rowToTask);
  }
  return readTasks();
}
async function saveTask(task){
  await valDbReady;
  if(pgPool){
    await dbQuery(`
      insert into val_tasks (id,user_id,title,contact_name,due_date,notes,details,completed,created_at,updated_at)
      values ($1,$2,$3,$4,$5,$6,$7,$8,coalesce($9::timestamptz,now()),now())
      on conflict (id) do update set
        title=excluded.title,
        contact_name=excluded.contact_name,
        due_date=excluded.due_date,
        notes=excluded.notes,
        details=excluded.details,
        completed=excluded.completed,
        updated_at=now()
    `,[
      task.id,
      VAL_USER_ID,
      task.title || 'Untitled task',
      task.contactName || '',
      task.dueDate || null,
      task.notes || '',
      JSON.stringify(task.details || []),
      !!task.completed,
      task.createdAt || null
    ]);
    return;
  }
  const tasks = readTasks();
  const idx = tasks.findIndex(t=>t.id===task.id);
  if(idx>=0) tasks[idx]=task; else tasks.push(task);
  writeTasks(tasks);
}
async function replaceTasks(tasks){
  await valDbReady;
  if(pgPool){
    await dbQuery('delete from val_tasks where user_id=$1',[VAL_USER_ID]);
    for(const task of tasks) await saveTask(task);
    return;
  }
  writeTasks(tasks);
}
async function deleteTask(id){
  await valDbReady;
  if(pgPool){
    await dbQuery('delete from val_tasks where user_id=$1 and id=$2',[VAL_USER_ID,id]);
    return;
  }
  writeTasks(readTasks().filter(t=>t.id!==id));
}

// GET all tasks
app.get('/api/val/tasks',async(req,res)=>{
  try{ res.json(await loadTasks()); }
  catch(e){ res.status(500).json({error:e.message}); }
});

// POST — add a task  { id, title, contactName, dueDate, notes, details, completed, createdAt }
app.post('/api/val/tasks',async(req,res)=>{
  try{
    const task = req.body;
    if(!task||!task.id) return res.status(400).json({error:'Missing task id'});
    await saveTask(task);
    res.json({ok:true, task});
  }catch(e){ res.status(500).json({error:e.message}); }
});

// PUT — replace all tasks (bulk save)
app.put('/api/val/tasks',async(req,res)=>{
  try{
    const tasks = req.body;
    if(!Array.isArray(tasks)) return res.status(400).json({error:'Expected array'});
    await replaceTasks(tasks);
    res.json({ok:true, count:tasks.length});
  }catch(e){ res.status(500).json({error:e.message}); }
});

// DELETE — remove a task by id
app.delete('/api/val/tasks/:id',async(req,res)=>{
  try{
    await deleteTask(req.params.id);
    res.json({ok:true});
  }catch(e){ res.status(500).json({error:e.message}); }
});

// ════════════════════════════════════════════════════════
// VAL MEMORY STORE — conversations, messages, transcripts
// ════════════════════════════════════════════════════════
async function saveTranscript(payload){
  await valDbReady;
  const id = payload.id || uuid('tr');
  const type = payload.type || 'transcript';
  const rawText = payload.transcript || payload.rawText || '';
  const metadata = {...payload};
  delete metadata.transcript;
  delete metadata.rawText;
  if(pgPool){
    await dbQuery(
      'insert into val_transcripts (id,user_id,type,title,raw_text,metadata,created_at) values ($1,$2,$3,$4,$5,$6,coalesce($7::timestamptz,now()))',
      [id,VAL_USER_ID,type,payload.title||null,rawText,JSON.stringify(metadata),payload.timestamp||null]
    );
  }else{
    const store = valStore();
    store.transcripts.unshift({id,userId:VAL_USER_ID,type,title:payload.title||'',rawText,metadata,createdAt:payload.timestamp||new Date().toISOString()});
    saveValStore(store);
  }
  if(rawText){
    const chunks = memoryChunks(rawText);
    if(chunks.length <= 1){
      await saveMemoryItem({kind:type,summary:payload.title||type,rawText,metadata,importance:payload.importance||1});
    }else{
      for(let i=0;i<chunks.length;i++){
        await saveMemoryItem({
          kind:type,
          summary:`${payload.title||type} (${i+1}/${chunks.length})`,
          rawText:chunks[i],
          metadata:{...metadata,transcriptId:id,chunkIndex:i+1,chunkCount:chunks.length},
          importance:payload.importance||1
        });
      }
    }
  }
  return {id,type};
}
async function saveMemoryItem(payload){
  await valDbReady;
  const id = payload.id || uuid('mem');
  const rawText = payload.rawText || payload.transcript || payload.summary || '';
  if(pgPool){
    await dbQuery(
      'insert into val_memory_items (id,user_id,kind,summary,raw_text,importance,metadata,created_at) values ($1,$2,$3,$4,$5,$6,$7,now())',
      [id,VAL_USER_ID,payload.kind||payload.type||'note',payload.summary||null,rawText,payload.importance||1,JSON.stringify(payload.metadata||{})]
    );
  }else{
    const store = valStore();
    store.memoryItems.unshift({id,userId:VAL_USER_ID,kind:payload.kind||payload.type||'note',summary:payload.summary||'',rawText,importance:payload.importance||1,metadata:payload.metadata||{},createdAt:new Date().toISOString()});
    saveValStore(store);
  }
  return {id};
}
async function saveConversation(payload){
  await valDbReady;
  const id = payload.id || uuid('conv');
  const messages = Array.isArray(payload.messages) ? payload.messages : [];
  const title = payload.title || (messages.find(m=>m.role==='user')?.content || 'Conversation').slice(0,80);
  if(pgPool){
    await dbQuery(`
      insert into val_conversations (id,user_id,title,source,metadata,created_at,updated_at)
      values ($1,$2,$3,$4,$5,coalesce($6::timestamptz,now()),now())
      on conflict (id) do update set title=excluded.title, metadata=excluded.metadata, updated_at=now()
    `,[id,VAL_USER_ID,title,payload.source||payload.type||'chat',JSON.stringify(payload.metadata||{}),payload.timestamp||null]);
    await dbQuery('delete from val_messages where conversation_id=$1',[id]);
    for(const m of messages){
      await dbQuery(
        'insert into val_messages (id,conversation_id,role,content,metadata,created_at) values ($1,$2,$3,$4,$5,coalesce($6::timestamptz,now()))',
        [uuid('msg'),id,m.role||'user',m.content||'',JSON.stringify(m.metadata||{}),m.timestamp||null]
      );
    }
  }else{
    const store = valStore();
    store.conversations = store.conversations.filter(c=>c.id!==id);
    store.messages = store.messages.filter(m=>m.conversationId!==id);
    store.conversations.unshift({id,userId:VAL_USER_ID,title,source:payload.source||payload.type||'chat',metadata:payload.metadata||{},createdAt:payload.timestamp||new Date().toISOString(),updatedAt:new Date().toISOString()});
    messages.forEach(m=>store.messages.push({id:uuid('msg'),conversationId:id,role:m.role||'user',content:m.content||'',metadata:m.metadata||{},createdAt:m.timestamp||new Date().toISOString()}));
    saveValStore(store);
  }
  if(payload.transcript) await saveTranscript({...payload,title,type:payload.type||'chat_memory'});
  return {id,title,count:messages.length};
}

async function callValModel({system,user,maxTokens=1200,temperature=0.4,json=false}){
  if(!OPENAI_KEY) throw new Error('OPENAI_KEY not configured');
  const r=await fetch('https://api.openai.com/v1/chat/completions',{
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':`Bearer ${OPENAI_KEY}`},
    body:JSON.stringify({
      model:process.env.VAL_CHAT_MODEL||'gpt-4o-mini',
      messages:[{role:'system',content:system},{role:'user',content:user}],
      max_tokens:maxTokens,
      temperature,
      response_format:json?{type:'json_object'}:undefined
    })
  });
  const d=await r.json();
  if(d.error) throw new Error(d.error.message);
  return d.choices?.[0]?.message?.content || '';
}

function actionPrompt(action){
  const prompts={
    daily_command:'Create a daily command-center briefing. Include meetings, urgent tasks, open loops, follow-up radar, one focus block, and the single best next action.',
    what_now:'Choose exactly what Jessa should do next. Consider energy, urgency, calendar, overdue tasks, HALOS/DISC memory, and business leverage. Be decisive.',
    weekly_review:'Create a weekly review: wins, stuck loops, avoided work, relationship follow-ups, stop/start/continue, and top 3 priorities for next week.',
    relationship_briefing:'Create a relationship briefing for the person or meeting named by the user. Include context, last known interaction, tone, likely needs, questions, and follow-up suggestions.',
    project_space:'Create a project-space view for the requested project: current context, docs/memory, open tasks, decisions, risks, and next actions.',
    task_intelligence:'Review the task list. Group by urgency/energy/project, flag stale/vague tasks, rewrite vague tasks into next actions, and recommend what to clear first.',
    followup_radar:'Scan for dangling commitments, quiet leads, overdue replies, relational warmth opportunities, and concrete follow-up drafts.',
    document_vault:'Answer from saved documents/memory. Name the most relevant documents or chunks and summarize what matters.'
  };
  return prompts[action] || prompts.what_now;
}

app.post('/api/val/intelligence',async(req,res)=>{
  try{
    const action=req.body.action||'what_now';
    const query=req.body.query||'';
    const dashboard=req.body.dashboard||{};
    const tasks=Array.isArray(req.body.tasks)?req.body.tasks:[];
    const memory=await recentMemoryContext(`${action} ${query}`);
    const system=[
      "You are VAL, Jessa's executive function partner and strategic assistant.",
      'Use saved memory, HALOS/DISC context, dashboard data, task state, and the requested action.',
      'Be specific, practical, and decisive. If you recommend work, make it easy to start immediately.',
      memory?'Relevant saved memory:\n'+memory:''
    ].filter(Boolean).join('\n\n');
    const user=[
      'Requested VAL action: '+action,
      'Instruction: '+actionPrompt(action),
      query?'User query: '+query:'',
      'Dashboard JSON: '+JSON.stringify(dashboard).slice(0,9000),
      'Tasks JSON: '+JSON.stringify(tasks).slice(0,9000)
    ].filter(Boolean).join('\n\n');
    const content=await callValModel({system,user,maxTokens:1600,temperature:0.35});
    res.json({ok:true,action,content});
  }catch(e){ res.status(500).json({error:e.message}); }
});

async function processTranscriptPayload(payload){
  const transcript=payload.transcript||payload.rawText||'';
  if(!transcript.trim()) throw new Error('Missing transcript');
  const title=payload.title||'Processed transcript';
  const memory=await recentMemoryContext(title+' '+transcript.slice(0,1000));
  const system=[
    "You process transcripts for VAL, Jessa's executive assistant.",
    'Return strict JSON with keys: summary, actionItems, decisions, people, memoryUpdates, followupDrafts.',
    'actionItems must be an array of objects with title, dueDate, notes, priority.',
    memory?'Relevant saved memory:\n'+memory:''
  ].filter(Boolean).join('\n\n');
  const raw=await callValModel({
    system,
    user:'Transcript title: '+title+'\n\nTranscript:\n'+transcript.slice(0,30000),
    maxTokens:1800,
    temperature:0.2,
    json:true
  });
  let parsed={};
  try{ parsed=JSON.parse(raw); }catch(e){ parsed={summary:raw,actionItems:[],decisions:[],people:[],memoryUpdates:[],followupDrafts:[]}; }
  const createdTasks=[];
  if(Array.isArray(parsed.actionItems)){
    for(const item of parsed.actionItems.slice(0,12)){
      if(!item||!item.title) continue;
      const task={id:uuid('task'),title:item.title,contactName:'',dueDate:item.dueDate||null,notes:item.notes||'',details:[{text:'Created from transcript: '+title,ts:new Date().toISOString()}],completed:false,createdAt:new Date().toISOString()};
      await saveTask(task);
      createdTasks.push(task);
    }
  }
  if(Array.isArray(parsed.memoryUpdates)){
    for(const m of parsed.memoryUpdates.slice(0,12)){
      const text=typeof m==='string'?m:(m.text||m.summary||JSON.stringify(m));
      await saveMemoryItem({kind:'transcript_insight',summary:title,rawText:text,importance:3,metadata:{title,source:'transcript_processing'}});
    }
  }
  return {analysis:parsed,createdTasks};
}

app.post('/api/val/transcripts/process',async(req,res)=>{
  try{
    const title=req.body.title||'Processed transcript';
    await saveTranscript({type:'processed_transcript',title,transcript:req.body.transcript||req.body.rawText||'',metadata:{source:req.body.source||'manual_process'},importance:3});
    res.json({ok:true,...await processTranscriptPayload(req.body||{})});
  }catch(e){ res.status(500).json({error:e.message}); }
});

app.post('/api/val/memory',async(req,res)=>{
  try{ res.json({ok:true,...await saveMemoryItem(req.body||{})}); }
  catch(e){ res.status(500).json({error:e.message}); }
});

app.get('/api/val/memory/search',async(req,res)=>{
  try{
    await valDbReady;
    const q=req.query.q||'';
    const limit=Math.min(Number(req.query.limit)||20,50);
    const terms=queryTerms(q);
    let items=[];
    if(pgPool){
      const r=await dbQuery('select id,kind,summary,raw_text,importance,metadata,created_at from val_memory_items where user_id=$1 order by created_at desc limit 500',[VAL_USER_ID]);
      items=r.rows;
    }else{
      items=valStore().memoryItems.map(m=>({id:m.id,kind:m.kind,summary:m.summary,raw_text:m.rawText,importance:m.importance,metadata:m.metadata,created_at:m.createdAt}));
    }
    const ranked=items.map(m=>({...m,score:scoreMemory(m,terms)}))
      .filter(m=>!q||m.score>0)
      .sort((a,b)=>(b.score-a.score)||((b.importance||1)-(a.importance||1)))
      .slice(0,limit)
      .map(m=>({id:m.id,kind:m.kind,summary:m.summary,preview:(m.raw_text||'').slice(0,500),importance:m.importance,metadata:m.metadata,createdAt:m.created_at}));
    res.json({ok:true,query:q,results:ranked});
  }catch(e){ res.status(500).json({error:e.message}); }
});

app.post('/api/val/transcripts',async(req,res)=>{
  try{
    const saved=await saveTranscript(req.body||{});
    if(req.body&&req.body.process){
      return res.json({ok:true,...saved,...await processTranscriptPayload(req.body)});
    }
    res.json({ok:true,...saved});
  }
  catch(e){ res.status(500).json({error:e.message}); }
});

async function extractUploadedText(file){
  const name = file.originalname || 'uploaded-file';
  const mime = file.mimetype || '';
  const ext = path.extname(name).toLowerCase();
  if(mime.startsWith('text/') || ['.txt','.md','.markdown','.html','.htm','.json','.csv','.tsv'].includes(ext)){
    return file.buffer.toString('utf8');
  }
  if(mime === 'application/pdf' || ext === '.pdf'){
    const parsed = await pdfParse(file.buffer);
    return parsed.text || '';
  }
  if(mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || ext === '.docx'){
    const result = await mammoth.extractRawText({buffer:file.buffer});
    return result.value || '';
  }
  throw new Error('Unsupported file type. Upload TXT, MD, HTML, JSON, CSV, PDF, or DOCX.');
}

app.post('/api/val/files',upload.single('file'),async(req,res)=>{
  try{
    if(!req.file) return res.status(400).json({error:'Missing file'});
    const text = (await extractUploadedText(req.file)).trim();
    if(!text) return res.status(400).json({error:'No readable text found in file'});
    const saved = await saveTranscript({
      type:'knowledge_document',
      title:req.file.originalname,
      transcript:text,
      timestamp:new Date().toISOString(),
      source:'val_file_upload',
      importance:3,
      metadata:{
        fileName:req.file.originalname,
        mimeType:req.file.mimetype,
        size:req.file.size
      }
    });
    res.json({ok:true,...saved,fileName:req.file.originalname,chars:text.length});
  }catch(e){ res.status(500).json({error:e.message}); }
});

app.post('/api/val/conversations',async(req,res)=>{
  try{ res.json({ok:true,...await saveConversation(req.body||{})}); }
  catch(e){ res.status(500).json({error:e.message}); }
});

app.get('/api/val/conversations',async(req,res)=>{
  try{
    await valDbReady;
    if(pgPool){
      const r=await dbQuery('select id,title,source,metadata,created_at,updated_at from val_conversations where user_id=$1 order by updated_at desc limit $2',[VAL_USER_ID,Number(req.query.limit)||25]);
      return res.json(r.rows);
    }
    res.json(valStore().conversations.slice(0,Number(req.query.limit)||25));
  }catch(e){ res.status(500).json({error:e.message}); }
});

app.get('/api/val/conversations/:id/messages',async(req,res)=>{
  try{
    await valDbReady;
    if(pgPool){
      const r=await dbQuery('select role,content,metadata,created_at from val_messages where conversation_id=$1 order by created_at asc',[req.params.id]);
      return res.json(r.rows);
    }
    res.json(valStore().messages.filter(m=>m.conversationId===req.params.id));
  }catch(e){ res.status(500).json({error:e.message}); }
});

async function recentMemoryContext(query){
  await valDbReady;
  const terms = queryTerms(query);
  const format = (items)=>items.map(m=>`- [${m.kind}] ${(m.summary||m.raw_text||m.rawText||'').slice(0,140)}${(m.raw_text||m.rawText)&&((m.raw_text||m.rawText)!==m.summary)?': '+(m.raw_text||m.rawText).slice(0,650):''}`).join('\n');
  if(pgPool){
    const r=await dbQuery(
      'select kind,summary,raw_text,importance,created_at from val_memory_items where user_id=$1 order by created_at desc limit 200',
      [VAL_USER_ID]
    );
    const ranked = r.rows.map(m=>({...m,_score:scoreMemory(m,terms)}))
      .sort((a,b)=>(b._score-a._score)||(b.importance-a.importance))
      .slice(0,12);
    return format(ranked);
  }
  const ranked = valStore().memoryItems.map(m=>({...m,_score:scoreMemory(m,terms)}))
    .sort((a,b)=>(b._score-a._score)||((b.importance||1)-(a.importance||1)))
    .slice(0,12);
  return format(ranked);
}

app.post('/api/val/chat',async(req,res)=>{
  try{
    if(!OPENAI_KEY) return res.status(500).json({error:'OPENAI_KEY not configured'});
    const messages = Array.isArray(req.body.messages) ? req.body.messages : [];
    const lastUser = [...messages].reverse().find(m=>m.role==='user')?.content || '';
    const memory = await recentMemoryContext(lastUser);
    const system = [
      "You are VAL, Jessa's executive assistant. Be direct, useful, warm, and specific.",
      'Use dashboard context and saved memory when relevant. Do not pretend to know facts that are not present.',
      memory ? 'Recent saved VAL memory:\n'+memory : ''
    ].filter(Boolean).join('\n\n');
    const r=await fetch('https://api.openai.com/v1/chat/completions',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${OPENAI_KEY}`},
      body:JSON.stringify({
        model:process.env.VAL_CHAT_MODEL||'gpt-4o-mini',
        messages:[{role:'system',content:system}].concat(messages),
        temperature:0.7
      })
    });
    const d=await r.json();
    if(d.error) return res.status(500).json({error:d.error.message});
    res.json({message:{role:'assistant',content:d.choices?.[0]?.message?.content||'I could not process that.'}});
  }catch(e){ res.status(500).json({error:e.message}); }
});

// ════════════════════════════════════════════════════════
const PORT=process.env.PORT||3000;
app.listen(PORT,()=>console.log(`VAL proxy running on port ${PORT}`));
