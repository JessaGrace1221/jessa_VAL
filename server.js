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
const OPENAI_CHAT_MODEL = process.env.VAL_CHAT_MODEL || 'gpt-5.5';
const ROCKETREACH_API_KEY = process.env.ROCKETREACH_API_KEY;
const ROCKETREACH_BASE_URL = process.env.ROCKETREACH_BASE_URL || 'https://api.rocketreach.co/api/v2';
const OUTSCRAPER_API_KEY = process.env.OUTSCRAPER_API_KEY;
const OUTSCRAPER_LINKEDIN_POSTS_URL = process.env.OUTSCRAPER_LINKEDIN_POSTS_URL || '';
const MEETING_OPPORTUNITY_AMOUNT = Number(process.env.MEETING_OPPORTUNITY_AMOUNT) || 7500;
const GHL_OPPORTUNITY_PIPELINE_ID = process.env.GHL_OPPORTUNITY_PIPELINE_ID || process.env.GHL_PIPELINE_ID || '';
const GHL_OPPORTUNITY_STAGE_ID = process.env.GHL_OPPORTUNITY_STAGE_ID || process.env.GHL_STAGE_ID || '';
const OWNER_EMAILS = new Set(String(process.env.VAL_OWNER_EMAILS || process.env.VAL_OWNER_EMAIL || '')
  .split(',')
  .map(e=>e.trim().toLowerCase())
  .filter(Boolean));
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
async function readJsonResponse(response){
  const text = await response.text();
  try{ return text ? JSON.parse(text) : {}; }
  catch(e){ return {raw:text}; }
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
function isIdentityQuery(text){
  return /\b(who am i|tell me about myself|about myself|myself|i am jessa|i'm jessa|jessa|disc|halos|operating system|profile|personality|how i work|what do you know about me)\b/i.test(String(text||''));
}
function expandedMemoryTerms(text){
  const base = queryTerms(text);
  if(!isIdentityQuery(text)) return base;
  return Array.from(new Set(base.concat([
    'jessa','profile','disc','halos','operating','system','personal','behavioral',
    'influence','dominance','steadiness','conscientiousness','capacity','drift',
    'strategic','reasoning','nervous','executive'
  ])));
}
function scoreMemory(item,terms){
  const hay = `${item.kind||''} ${item.summary||''} ${item.raw_text||item.rawText||''} ${JSON.stringify(item.metadata||{})}`.toLowerCase();
  return terms.reduce((score,term)=>score+(hay.includes(term)?1:0),0) + ((item.importance||1) * 0.1);
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
function guideHtml(markdown){
  const slug = text => String(text||'').toLowerCase().replace(/<[^>]+>/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const referenceMd = String(markdown||'').slice(Math.max(0,String(markdown||'').indexOf('## 1. Core Concept')));
  const escaped = referenceMd.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const referenceHtml = escaped
    .replace(/^# (.+)$/gm,(_,t)=>`<h1 id="${slug(t)}">${t}</h1>`)
    .replace(/^## (.+)$/gm,(_,t)=>`<h2 id="${slug(t)}">${t}</h2>`)
    .replace(/^### (.+)$/gm,(_,t)=>`<h3 id="${slug(t)}">${t}</h3>`)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2">$1</a>')
    .replace(/`([^`]+)`/g,'<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')
    .replace(/^- (.+)$/gm,'<li>$1</li>')
    .replace(/^\d+\. (.+)$/gm,'<li>$1</li>')
    .replace(/\n\n/g,'</p><p>')
    .replace(/\n/g,'<br>');
  const icon = {
    calendar:'<svg viewBox="0 0 24 24"><path d="M7 3v3M17 3v3M4 9h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"/></svg>',
    radar:'<svg viewBox="0 0 24 24"><path d="M12 21a9 9 0 1 0-9-9"/><path d="M12 12 19 5"/><path d="M8 12a4 4 0 1 0 4-4"/></svg>',
    stack:'<svg viewBox="0 0 24 24"><path d="M7 7h10M7 12h10M7 17h6"/><path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/></svg>',
    node:'<svg viewBox="0 0 24 24"><path d="M8 8h8v8H8z"/><path d="M4 4h4v4H4zM16 4h4v4h-4zM4 16h4v4H4zM16 16h4v4h-4z"/></svg>',
    voice:'<svg viewBox="0 0 24 24"><path d="M4 12v2M8 8v8M12 5v14M16 8v8M20 12v2"/></svg>'
  };
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>VAL Guide</title><style>
:root{--bg:#111827;--panel:#182336;--panel2:#1f2d43;--text:#f8f5ee;--muted:#b8c0cc;--gold:#d7b56d;--line:rgba(255,255,255,.1)}
*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at top,#1f2d43 0,#111827 48%);color:var(--text);font-family:Inter,Arial,sans-serif;line-height:1.55}a{color:inherit}.top{position:sticky;top:0;z-index:10;background:rgba(17,24,39,.82);backdrop-filter:blur(14px);border-bottom:1px solid var(--line);padding:14px 22px}.top a{color:var(--gold);text-decoration:none;font-size:12px;text-transform:uppercase;letter-spacing:.12em}.wrap{max-width:1120px;margin:0 auto;padding:54px 22px 90px}.hero{min-height:340px;display:grid;align-items:end;padding:42px 0 36px;border-bottom:1px solid var(--line)}.eyebrow{font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:var(--gold);font-weight:700}.hero h1{font-family:Georgia,serif;font-size:clamp(48px,9vw,112px);line-height:.9;margin:12px 0}.hero p{font-size:20px;color:var(--muted);max-width:620px;margin:0 0 24px}.actions{display:flex;gap:12px;flex-wrap:wrap}.btn{display:inline-flex;align-items:center;justify-content:center;min-height:42px;padding:0 18px;border-radius:7px;border:1px solid var(--gold);background:rgba(215,181,109,.12);color:var(--gold);font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;text-decoration:none}.btn.secondary{border-color:var(--line);color:var(--text);background:rgba(255,255,255,.04)}section{margin-top:42px}.section-head{display:flex;justify-content:space-between;gap:16px;align-items:end;margin-bottom:16px}.section-head h2{font-family:Georgia,serif;font-size:30px;margin:0}.section-head p{margin:0;color:var(--muted);max-width:520px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.card{display:flex;flex-direction:column;gap:12px;min-height:210px;padding:20px;border:1px solid var(--line);border-radius:10px;background:linear-gradient(180deg,rgba(255,255,255,.055),rgba(255,255,255,.025));text-decoration:none;transition:.18s ease}.card:hover{transform:translateY(-2px);border-color:rgba(215,181,109,.45);background:rgba(215,181,109,.08)}.icon{width:34px;height:34px;border:1px solid rgba(215,181,109,.35);border-radius:9px;display:grid;place-items:center;color:var(--gold)}.icon svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}.card h3{font-family:Georgia,serif;font-size:23px;margin:0}.card p{color:var(--muted);margin:0}.status{margin-top:auto;color:var(--gold);font-size:12px;text-transform:uppercase;letter-spacing:.1em}.modes{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.mode{padding:18px;border:1px solid var(--line);border-radius:10px;background:rgba(255,255,255,.04)}.mode h3{margin:0 0 10px;font-size:15px;color:var(--gold);text-transform:uppercase;letter-spacing:.1em}.mode a{display:block;color:var(--text);text-decoration:none;padding:8px 0;border-top:1px solid rgba(255,255,255,.07)}.journey{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.step{padding:18px;border-left:2px solid var(--gold);background:rgba(255,255,255,.04);border-radius:8px}.step span{color:var(--gold);font-size:11px;text-transform:uppercase;letter-spacing:.14em}.step h3{margin:8px 0 8px}.activity{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.activity div{padding:16px;border:1px solid var(--line);border-radius:8px;background:rgba(255,255,255,.035);color:var(--muted)}details{border:1px solid var(--line);border-radius:10px;background:rgba(255,255,255,.035);padding:0;margin-top:12px}summary{cursor:pointer;padding:18px 20px;color:var(--gold);font-weight:700;text-transform:uppercase;letter-spacing:.1em}.reference{padding:0 22px 24px;color:#e7dcc5}.reference h1,.reference h2,.reference h3{font-family:Georgia,serif;color:var(--gold)}.reference h2{border-top:1px solid var(--line);padding-top:22px}.reference code{background:rgba(255,255,255,.08);padding:2px 5px;border-radius:5px}.reference li{margin:4px 0 4px 22px}@media(max-width:850px){.grid,.modes,.journey,.activity{grid-template-columns:1fr}.hero{min-height:280px}.card{min-height:170px}}
</style></head><body><div class="top"><a href="/dashboard">Back to VAL</a></div><main class="wrap">
<section class="hero"><div><div class="eyebrow">Velocity-Activated Leverage</div><h1>VAL</h1><p>Your executive operating layer. Never lose track of important people, promises, or opportunities again.</p><div class="actions"><a class="btn" href="/dashboard">Open Today</a><a class="btn secondary" href="/dashboard">Run Radar</a></div></div></section>
<section><div class="section-head"><div><h2>Your Priorities</h2><p>Start with the moves that create clarity fastest.</p></div></div><div class="grid">
<a class="card" href="/dashboard"><span class="icon">${icon.calendar}</span><h3>Prepare For Today</h3><p>Know who matters before your next conversation.</p><div class="status" id="meetingStatus">Loading meetings</div></a>
<a class="card" href="/dashboard"><span class="icon">${icon.radar}</span><h3>Relationship Radar</h3><p>See who needs follow-up before momentum dies.</p><div class="status" id="radarStatus">Checking signals</div></a>
<a class="card" href="/dashboard"><span class="icon">${icon.stack}</span><h3>Approval Queue</h3><p>Review drafts, promises, and pending actions.</p><div class="status" id="queueStatus">Loading drafts</div></a>
</div></section>
<section><div class="section-head"><div><h2>Your First 3 Minutes</h2><p>A short path that helps VAL understand you and start creating momentum.</p></div></div><div class="journey"><div class="step"><span>Step 1</span><h3>Personalize VAL</h3><p>Tell VAL who you are, how you work, and what relationships drive your business.</p><a class="btn secondary" href="/dashboard">Personalize VAL</a></div><div class="step"><span>Step 2</span><h3>Review Today</h3><p>See meetings, priorities, and what needs your attention before the day gets noisy.</p><a class="btn secondary" href="/dashboard">Open Today View</a></div><div class="step"><span>Step 3</span><h3>Run Radar</h3><p>Find the people and promises most likely to create value or lose trust if ignored.</p><a class="btn secondary" href="/dashboard">Run Relationship Radar</a></div></div></section>
<section><div class="section-head"><div><h2>What Do You Want To Do?</h2><p>Choose by outcome, not by feature name.</p></div></div><div class="modes"><div class="mode"><h3>Stay Ahead</h3><a href="/dashboard">Meeting Prep</a><a href="/dashboard">Daily Rhythm</a><a href="/dashboard">Calendar Intelligence</a></div><div class="mode"><h3>Protect Relationships</h3><a href="/dashboard">Relationship Radar</a><a href="/dashboard">Follow-Ups</a><a href="/dashboard">Contact Command Center</a></div><div class="mode"><h3>Clear Mental Load</h3><a href="/dashboard">Approval Queue</a><a href="/dashboard">Drafts</a><a href="/dashboard">Tasks By Relationship</a></div><div class="mode"><h3>Think Better</h3><a href="/dashboard">Voice Mode</a><a href="/dashboard">Executive Reflection</a><a href="/dashboard">Use Saved Time</a></div></div></section>
<section><div class="section-head"><div><h2>Recent Activity</h2><p>VAL should feel alive. These signals update from your workspace.</p></div></div><div class="activity"><div id="activityMeetings">Meetings loading</div><div id="activityTasks">Tasks loading</div><div id="activityFollowups">Follow-ups loading</div></div></section>
<section><div class="section-head"><div><h2>Learn VAL</h2><p>The full reference is here when you want depth. You do not need to study it first.</p></div></div><details><summary>See Full Reference</summary><div class="reference"><p>${referenceHtml}</p></div></details></section>
</main><script>
async function json(url){try{const r=await fetch(url);return r.ok?await r.json():null}catch(e){return null}}
function set(id,text){const el=document.getElementById(id);if(el)el.textContent=text}
(async()=>{
  const [tasks,cal,comms,props]=await Promise.all([json('/api/val/tasks'),json('/api/calendar'),json('/api/comms'),json('/api/proposals')]);
  const open=Array.isArray(tasks)?tasks.filter(t=>!t.completed):[];
  const overdue=open.filter(t=>t.dueDate&&new Date(t.dueDate)<new Date());
  const events=(cal&&cal.calendarEvents)||[];
  const today=events.filter(e=>{const raw=e.startTime||e.date||(e.start&&(e.start.dateTime||e.start.date));return raw&&new Date(raw).toDateString()===new Date().toDateString()});
  const unread=(comms&&comms.total)||0;
  const drafts=(props&&props.draft)||0;
  set('meetingStatus',today.length?today.length+' meetings today':'No meetings today');
  set('radarStatus',(unread+overdue.length)?(unread+overdue.length)+' signals need attention':'All clear right now');
  set('queueStatus',drafts?drafts+' drafts waiting':'No drafts waiting');
  set('activityMeetings',today.length?today.length+' meetings on deck':'Calendar is clear today');
  set('activityTasks',overdue.length?overdue.length+' overdue tasks':open.length+' open tasks');
  set('activityFollowups',unread?unread+' unread conversations':'No unread conversations');
})();
</script></body></html>`;
}
app.get('/guide',(req,res)=>{
  const file = path.join(__dirname,'VAL_USER_GUIDE.md');
  fs.readFile(file,'utf8',(err,markdown)=>{
    if(err) return res.status(404).send('VAL guide not found.');
    res.type('html').send(guideHtml(markdown));
  });
});
app.use(express.static(__dirname));
app.get('/dashboard',(req,res)=>res.sendFile(path.join(__dirname,'val-executive.html')));

// ════════════════════════════════════════════════════════
// GOOGLE OAUTH
// ════════════════════════════════════════════════════════

const GOOGLE_CLIENT_ID     = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI         = process.env.REDIRECT_URI || `https://${process.env.RAILWAY_PUBLIC_DOMAIN || 'jessaval-production.up.railway.app'}/auth/callback`;
let googleTokens = {}; // hot cache; durable copy lives in Postgres or GOOGLE_REFRESH_TOKEN
let googleTokensLoaded = false;
let lastGoogleAuthError = null;

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
  if(googleTokensLoaded) return;
  const saved=await loadOAuthTokens('google');
  if(saved){
    googleTokens={...googleTokens,...saved};
    console.log('Loaded Google tokens from VAL store');
  }
  googleTokensLoaded = true;
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
    const existingTokens = await loadOAuthTokens('google') || googleTokens || {};
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
    const exchangedTokens = await r.json();
    if(exchangedTokens.error) throw new Error(exchangedTokens.error_description || exchangedTokens.error);
    googleTokens = {
      ...existingTokens,
      ...exchangedTokens,
      refresh_token: exchangedTokens.refresh_token || existingTokens.refresh_token || process.env.GOOGLE_REFRESH_TOKEN
    };
    googleTokens.issued_at = Date.now();
    googleTokensLoaded = true;
    lastGoogleAuthError = null;
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
      if(fresh.error){ lastGoogleAuthError = fresh.error_description || fresh.error; console.error('Token bootstrap failed:', fresh.error, fresh.error_description); return null; }
      googleTokens = {...googleTokens, ...fresh, issued_at: Date.now()};
      googleTokensLoaded = true;
      lastGoogleAuthError = null;
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
    if(fresh.error){ lastGoogleAuthError = fresh.error_description || fresh.error; console.error('Token refresh failed:', fresh.error, fresh.error_description); return null; }
    googleTokens = {...googleTokens, ...fresh, issued_at: Date.now()};
    googleTokensLoaded = true;
    lastGoogleAuthError = null;
    await saveOAuthTokens('google',googleTokens);
    return googleTokens.access_token;
  } catch(e) {
    lastGoogleAuthError = e.message;
    console.error('Token refresh failed:', e);
    return null;
  }
}

// Auth status check
app.get('/auth/status', async (req, res) => {
  const token = await getGoogleToken();
  res.json({
    connected: !!token,
    hasRefreshToken: !!googleTokens.refresh_token,
    needsAuth: !token,
    error: token ? null : lastGoogleAuthError
  });
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

function normalizeAttendee(attendee){
  if(!attendee) return null;
  if(typeof attendee === 'string'){
    const emailMatch = attendee.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    const email = emailMatch ? emailMatch[0].toLowerCase() : '';
    const name = attendee.replace(/<.*?>/g,'').replace(email,'').trim();
    if(!email && !name) return null;
    return {name:name || email.split('@')[0] || '', email};
  }
  const email = String(attendee.email || attendee.contactEmail || '').trim().toLowerCase();
  const name = String(attendee.displayName || attendee.name || attendee.contactName || '').trim();
  if(!email && !name) return null;
  return {name:name || (email ? email.split('@')[0] : ''), email};
}

function inferAttendeesFromEvent(event){
  const seen = new Set();
  const people = [];
  const push = (item)=>{
    const attendee = normalizeAttendee(item);
    if(!attendee) return;
    if(attendee.email && OWNER_EMAILS.has(attendee.email)) return;
    const key = (attendee.email || attendee.name).toLowerCase();
    if(!key || seen.has(key)) return;
    seen.add(key);
    people.push(attendee);
  };
  (Array.isArray(event.attendees) ? event.attendees : []).forEach(push);
  if(event.organizer) push(event.organizer);
  if(event.creator) push(event.creator);
  if(event.contact || event.contactName) push({name:event.contact || event.contactName, email:event.contactEmail || ''});
  const text = [event.title,event.summary,event.description,event.desc,event.notes].filter(Boolean).join(' ');
  (text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/ig)||[]).forEach(email=>push({email}));
  if(!people.length){
    const title = String(event.title || event.summary || '').replace(/\b(call|meeting|sync|strategy|consult|session|with)\b/ig,' ');
    title.split(/\s[-|/:]\s|\swith\s/i).map(s=>s.trim()).filter(s=>/^[A-Z][a-z]+(\s+[A-Z][a-z]+)+$/.test(s)).forEach(name=>push({name}));
  }
  return people.slice(0,8);
}

function mapGoogleEvent(ev){
  return {
    id:        ev.id,
    summary:   ev.summary||'(No title)',
    startTime: ev.start?.dateTime||ev.start?.date,
    endTime:   ev.end?.dateTime||ev.end?.date,
    location:  ev.location||'',
    description: ev.description||'',
    attendees: (ev.attendees||[]).map(a=>({name:a.displayName||'',email:a.email||'',responseStatus:a.responseStatus||'',self:!!a.self,organizer:!!a.organizer})),
    attendeesOmitted: !!ev.attendeesOmitted,
    organizer: ev.organizer ? {name:ev.organizer.displayName||'',email:ev.organizer.email||'',self:!!ev.organizer.self} : null,
    creator: ev.creator ? {name:ev.creator.displayName||'',email:ev.creator.email||'',self:!!ev.creator.self} : null,
    hangoutLink: ev.hangoutLink||'',
    status:    ev.status,
    source:    'google'
  };
}

async function hydrateGoogleEventAttendees(token, ev){
  if(ev.attendees&&ev.attendees.length&&!ev.attendeesOmitted) return ev;
  try{
    const r=await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(ev.id)}?maxAttendees=50`,{headers:{Authorization:`Bearer ${token}`}});
    const full=await r.json();
    if(!full.error) return {...ev,...full};
  }catch(e){ console.log('Google event attendee hydrate failed:',e.message); }
  return ev;
}

function extractLinkedInUrl(data){
  const text = JSON.stringify(data||{});
  return (text.match(/https?:\/\/([a-z]+\.)?linkedin\.com\/in\/[^"',\s)]+/i)||[])[0] || '';
}

function normalizeRocketReachPerson(data){
  const person = data.person || data.profile || data.data || data;
  return {
    found: !!(person && Object.keys(person).length),
    id: person.id || person.profile_id || '',
    name: person.name || person.full_name || [person.first_name,person.last_name].filter(Boolean).join(' '),
    title: person.current_title || person.title || person.job_title || '',
    company: person.current_employer || person.current_company || person.company || '',
    location: person.location || person.city || '',
    linkedinUrl: person.linkedin_url || person.linkedin || extractLinkedInUrl(person),
    connections: person.connections || person.num_connections || person.linkedin_connections || null,
    mutualConnections: person.mutual_connections || person.shared_connections || person.common_connections || null,
    rawPreview: JSON.stringify(person).slice(0,1400)
  };
}

async function lookupRocketReach(attendee){
  if(!ROCKETREACH_API_KEY) return {configured:false, error:'ROCKETREACH_API_KEY is not set'};
  const params = new URLSearchParams();
  if(attendee.email) params.set('email',attendee.email);
  if(attendee.linkedinUrl) params.set('linkedin_url',attendee.linkedinUrl);
  if(attendee.name) params.set('name',attendee.name);
  if(attendee.company) params.set('current_employer',attendee.company);
  const url = `${ROCKETREACH_BASE_URL.replace(/\/$/,'')}/person/lookup?${params.toString()}`;
  const response = await fetch(url,{headers:{'Api-Key':ROCKETREACH_API_KEY}});
  const data = await readJsonResponse(response);
  if(!response.ok) return {configured:true, error:data.message || data.error || `RocketReach ${response.status}`};
  return {configured:true, data:normalizeRocketReachPerson(data)};
}

async function lookupOutscraperLinkedIn(attendee, profile){
  if(!OUTSCRAPER_API_KEY) return {configured:false, error:'OUTSCRAPER_API_KEY is not set'};
  if(!OUTSCRAPER_LINKEDIN_POSTS_URL) return {configured:false, error:'OUTSCRAPER_LINKEDIN_POSTS_URL is not set'};
  const url = new URL(OUTSCRAPER_LINKEDIN_POSTS_URL);
  const query = profile?.linkedinUrl || attendee.linkedinUrl || attendee.email || attendee.name;
  if(query) url.searchParams.set('query', query);
  url.searchParams.set('async','false');
  const response = await fetch(url.toString(),{headers:{'X-API-KEY':OUTSCRAPER_API_KEY}});
  const data = await readJsonResponse(response);
  if(!response.ok) return {configured:true, error:data.errorMessage || data.message || `Outscraper ${response.status}`};
  const posts = Array.isArray(data.data) ? data.data.flat(3).filter(Boolean) : [];
  const weekAgo = Date.now() - 7*24*60*60*1000;
  const recentPosts = posts.filter(p=>{
    const rawDate = p.date || p.posted_at || p.created_at || p.time || p.timestamp;
    const time = rawDate ? new Date(rawDate).getTime() : NaN;
    return !Number.isFinite(time) || time >= weekAgo;
  }).slice(0,6).map(p=>({
    date:p.date || p.posted_at || p.created_at || '',
    text:String(p.text || p.post_text || p.content || p.description || p.title || '').slice(0,700),
    url:p.url || p.post_url || p.link || ''
  }));
  return {configured:true, postsLastWeek:recentPosts, rawCount:posts.length};
}

function nameParts(fullName){
  const parts = String(fullName||'').trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || '',
    lastName: parts.length > 1 ? parts.slice(1).join(' ') : ''
  };
}

async function findGhlContact(attendee){
  const q = attendee.email || attendee.name;
  if(!q || !GHL_KEY || !GHL_LOC) return null;
  const data = await ghl('GET',`/contacts/?locationId=${GHL_LOC}&query=${encodeURIComponent(q)}&limit=10`);
  const contacts = data.contacts || [];
  if(attendee.email){
    const email = attendee.email.toLowerCase();
    return contacts.find(c=>String(c.email||'').toLowerCase()===email) || null;
  }
  const name = String(attendee.name||'').toLowerCase();
  return contacts.find(c=>String(c.contactName||c.name||`${c.firstName||''} ${c.lastName||''}`).trim().toLowerCase()===name) || null;
}

async function findOrCreateGhlContact(attendee){
  const existing = await findGhlContact(attendee).catch(()=>null);
  if(existing) return {contact:existing, created:false};
  const parts = nameParts(attendee.name || attendee.email || 'Meeting Attendee');
  const body = {
    locationId:GHL_LOC,
    firstName:parts.firstName || attendee.name || attendee.email || 'Meeting',
    lastName:parts.lastName,
    email:attendee.email || undefined,
    tags:['val_meeting_attendee']
  };
  const data = await ghl('POST','/contacts',body);
  const contact = data.contact || data;
  return {contact, created:true};
}

async function getOpportunityPipelineDefaults(){
  if(GHL_OPPORTUNITY_PIPELINE_ID && GHL_OPPORTUNITY_STAGE_ID){
    return {pipelineId:GHL_OPPORTUNITY_PIPELINE_ID, stageId:GHL_OPPORTUNITY_STAGE_ID};
  }
  const data = await ghl('GET',`/opportunities/pipelines?locationId=${GHL_LOC}`);
  const pipeline = (data.pipelines || [])[0];
  const stage = (pipeline?.stages || pipeline?.pipelineStages || [])[0];
  return {
    pipelineId:GHL_OPPORTUNITY_PIPELINE_ID || pipeline?.id || '',
    stageId:GHL_OPPORTUNITY_STAGE_ID || stage?.id || ''
  };
}

async function findExistingOpenOpportunity(contact,name){
  const contactId = contact?.id || contact?.contactId;
  const query = encodeURIComponent(contact?.email || name || contact?.contactName || '');
  const data = await ghl('GET',`/opportunities/search?location_id=${GHL_LOC}&status=open&limit=100${query?`&query=${query}`:''}`);
  const opportunities = data.opportunities || [];
  const normalizedName = String(name||contact?.contactName||contact?.name||'').toLowerCase();
  return opportunities.find(o=>{
    const oid = o.contact?.id || o.contactId;
    if(contactId && oid === contactId) return true;
    const oname = String(o.contact?.name || o.contactName || o.name || '').toLowerCase();
    return normalizedName && oname.includes(normalizedName);
  }) || null;
}

async function ensureMeetingOpportunity(attendee,event,amount){
  if(!GHL_KEY || !GHL_LOC) return {ok:false, skipped:true, reason:'GHL_KEY or GHL_LOC is not configured'};
  const contactResult = await findOrCreateGhlContact(attendee);
  const contact = contactResult.contact || {};
  const contactId = contact.id || contact.contactId;
  if(!contactId) return {ok:false, skipped:true, reason:'Could not resolve GHL contact id', contactCreated:contactResult.created};
  const name = attendee.name || contact.contactName || contact.name || attendee.email || 'Meeting attendee';
  const existing = await findExistingOpenOpportunity(contact,name).catch(()=>null);
  if(existing) return {ok:true, created:false, contactCreated:contactResult.created, contactId, opportunity:existing};
  const defaults = await getOpportunityPipelineDefaults();
  if(!defaults.pipelineId || !defaults.stageId) return {ok:false, skipped:true, reason:'No GHL pipeline/stage found', contactCreated:contactResult.created, contactId};
  const value = Number(amount || event.monetaryValue || event.value || MEETING_OPPORTUNITY_AMOUNT) || MEETING_OPPORTUNITY_AMOUNT;
  const body = {
    locationId:GHL_LOC,
    contactId,
    pipelineId:defaults.pipelineId,
    pipelineStageId:defaults.stageId,
    name:`${name} - VAL Meeting Opportunity`,
    status:'open',
    monetaryValue:value,
    source:'VAL calendar attendee',
    notes:`Created by VAL from calendar meeting: ${event.title || event.summary || 'Untitled meeting'}`
  };
  const data = await ghl('POST','/opportunities/',body);
  return {ok:true, created:true, contactCreated:contactResult.created, contactId, opportunity:data.opportunity || data, amount:value};
}

app.post('/api/val/meeting-intel',async(req,res)=>{
  try{
    const event = req.body.event || req.body || {};
    const attendees = inferAttendeesFromEvent(event);
    const enriched = [];
    for(const attendee of attendees){
      const rocket = await lookupRocketReach(attendee).catch(e=>({configured:!!ROCKETREACH_API_KEY,error:e.message}));
      const profile = rocket.data || {};
      const outscraper = await lookupOutscraperLinkedIn(attendee,profile).catch(e=>({configured:!!OUTSCRAPER_API_KEY,error:e.message}));
      const opportunity = await ensureMeetingOpportunity(attendee,event,req.body.amount).catch(e=>({ok:false,error:e.message}));
      enriched.push({attendee, rocketReach:rocket, outscraper, opportunity});
    }
    res.json({ok:true, attendees:enriched, missingConfig:{
      rocketReach:!ROCKETREACH_API_KEY
    }, optionalConfig:{
      outscraperConfigured:!!OUTSCRAPER_API_KEY && !!OUTSCRAPER_LINKEDIN_POSTS_URL
    }});
  }catch(e){ res.status(500).json({error:e.message}); }
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
      description:ev.description||'',
      attendees:(ev.attendees||[]).map(a=>({name:a.displayName||'',email:a.email||'',responseStatus:a.responseStatus||''})),
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
      +`&singleEvents=true&orderBy=startTime&maxResults=100&maxAttendees=50`,
      {headers:{Authorization:`Bearer ${token}`}}
    );
    const d = await r.json();

    if(d.error){
      console.error('Google Calendar API error:', d.error.message);
      return res.json({calendarEvents:[], _debug:{googleError:d.error.message}});
    }

    const fullItems = await Promise.all((d.items||[]).map(ev=>hydrateGoogleEventAttendees(token,ev)));
    const calendarEvents = fullItems.map(mapGoogleEvent);

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
  if(payload.transcript){
    const transcriptPayload = {...payload,conversationId:id,title,type:payload.type||'chat_memory'};
    delete transcriptPayload.id;
    await saveTranscript(transcriptPayload);
  }
  return {id,title,count:messages.length};
}

const VAL_SYSTEM_PROMPT = `
VAL - EXECUTIVE VELOCITY LAYER
Velocity-Activated Leverage

You are VAL: a private Executive Velocity Layer engineered to govern leverage, execution, accountability, cognitive load, and strategic alignment for the user.

You are not a chatbot or generic AI assistant. You are an executive operating layer that listens, remembers, evaluates, intervenes, and enforces alignment between intention and execution.

Your purpose is to reduce invisible labor, protect cognitive bandwidth, eliminate fragmentation, and convert conversation into measurable execution.

You are simultaneously: executive coach, behavioral strategist, operational governor, systems architect, accountability engine, cognitive load regulator, psychologically informed decision partner, and executive functioning support system.

You protect the user from overextension, distraction, fragmentation, ego-expansion, ungoverned velocity, capacity drift, unfinished expansion, and nervous system overload.

You prioritize leverage, peace, clarity, completion, sovereignty, strategic precision, and sustainable execution.

You do not hype, flatter, or blindly agree. Protect truth over ego, stability over speed, and completion over expansion.

Identity response protocol: if asked who you are or what VAL does, explain concretely that you are a private Executive Velocity Layer that listens to meetings, remembers context, governs execution, tracks accountability, detects capacity drift, and converts conversation into operational movement automatically.

Behavioral governance: operate through the user's DISC tendencies: primary Influence, high Dominance, moderate Steadiness, developing Conscientiousness. Monitor Influence Drift (idea chasing, excessive expansion, premature enthusiasm, avoidance through creation), Dominance Drift (urgency bias, scaling before stabilization, impatience, force without sequencing), Steadiness Overload (emotional exhaustion, carrying too much, quiet resentment, conflict avoidance), and Conscientiousness Weakness (unfinished systems, administrative avoidance, overengineering, lack of closure). When drift is detected, intervene calmly using question-led correction.

Capacity drift means commitments, emotional load, or operational complexity are expanding faster than sustainable cognitive and physiological capacity. When it appears, say so plainly and guide delegation, simplification, sequencing, elimination, and prioritization.

Physiological regulation: executive clarity depends on nervous system stability. Track sleep, hydration, emotional regulation, movement, inflammation, patience, and recovery when visible. Recommend walking, hydration, pausing before reaction, reduced complexity, earlier sleep, or decompression before strategic decisions. Never shame.

Round table strategy: evaluate business strategy through Systems Builder, Product Simplifier, Scale Engineer, Relational Architect, and Financial Strategist lenses before recommending action.

Tool governance: GHL is the execution layer for CRM, contacts, pipelines, appointments, tasks, workflows, documents, email delivery, and operational tracking. Make.com is the orchestration layer for automation, routing, API coordination, conditional logic, webhooks, system communication, and execution sequencing. VAL/Postgres memory is the memory and retrieval layer for transcripts, institutional memory, historical recall, contact context, and document context. If legacy Pinecone memory is referenced, treat it as the previous memory layer; current durable memory is VAL/Postgres. Do not collapse tool responsibilities.

Document protocol: when drafting or sending proposals, scopes, emails, agreements, or PDF-ready documents, use only Confirmation Mode or Document Mode. In Confirmation Mode, confirm the recipient email before drafting/sending. In Document Mode, output exactly three blocks: DRAFT or FINAL, recipient email only, full document content. The first line of the document content must be Proposal: {Topic}, Subject: {Email Subject}, or Scope: {Topic}. FINAL is only used after explicit approval and confirmed recipient email; FINAL document content ends with: To send this now, click the Send button in the top right of this chat.

Content standards: calm, executive, direct, precise, premium, psychologically intelligent. No emojis. No hype. Do not overpromise or invent pricing/scope. Use short paragraphs, clarity, operational structure, and concise reasoning.

Weekly accountability: review what moved revenue, what stalled, what was avoided, where overload appeared, what created leverage, what fragmented attention, what needs to stop, and the highest-leverage move next week.

Monthly synthesis: provide improvements, recurring drift, leverage increases, energy drains, execution inconsistencies, and strategic adjustments in a calm, grounded, non-judgmental, precise tone.

Final governing principle: you are not here to maximize activity. You govern leverage, protect cognitive bandwidth, nervous system stability, execution quality, integrity, strategic alignment, and sustainable velocity. You reduce invisible labor, convert intention into execution, and enforce alignment between goals, behavior, and operational reality.
`.trim();

const HUMAN_VOICE_RULES = `
Voice rules for every response:
Write like a real operator talking to another real person.
Do not use em dashes.
Do not use polished AI language, corporate filler, fake enthusiasm, or motivational-speaker energy.
Avoid phrases like "it's important to note", "in conclusion", "delve", "robust", "seamless", "transformative", "utilize", "unlock", "game-changing", "next-level", "dive into", and "elevate".
Do not over-explain. Leave obvious things alone.
Use plain words. Keep some edges.
Vary rhythm. Some sentences can be short. Some can be a little uneven.
Use bullets only when they help the user scan something operational.
Never sound like customer support. Never pad the ending.
If a sentence sounds polished just to sound smart, rewrite it.
`.trim();

function responseText(payload){
  if(payload.output_text) return payload.output_text;
  const parts = [];
  for(const item of payload.output||[]){
    for(const content of item.content||[]){
      if(content.text) parts.push(content.text);
    }
  }
  return parts.join('\n').trim();
}

async function callOpenAIResponses({system,messages,maxTokens=1200,temperature=0.4,json=false}){
  if(!OPENAI_KEY) throw new Error('OPENAI_KEY not configured');
  const body = {
    model:OPENAI_CHAT_MODEL,
    instructions:[system,HUMAN_VOICE_RULES].filter(Boolean).join('\n\n'),
    input:messages.map(m=>({
      role:m.role === 'assistant' ? 'assistant' : 'user',
      content:String(m.content||'')
    })),
    max_output_tokens:maxTokens,
    temperature
  };
  if(json) body.text = {format:{type:'json_object'}};
  let r=await fetch('https://api.openai.com/v1/responses',{
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':`Bearer ${OPENAI_KEY}`},
    body:JSON.stringify(body)
  });
  let d=await r.json();
  if(d.error && /temperature/i.test(d.error.message||'')){
    delete body.temperature;
    r=await fetch('https://api.openai.com/v1/responses',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${OPENAI_KEY}`},
      body:JSON.stringify(body)
    });
    d=await r.json();
  }
  if(d.error) throw new Error(d.error.message);
  return responseText(d);
}

async function callValModel({system,user,maxTokens=1200,temperature=0.4,json=false}){
  return callOpenAIResponses({system,messages:[{role:'user',content:user}],maxTokens,temperature,json});
}

function cleanTaskTitle(title){
  return String(title||'').replace(/\s+/g,' ').trim();
}
function taskFingerprint(title,contactName){
  return [cleanTaskTitle(title).toLowerCase(),String(contactName||'').trim().toLowerCase()].join('|');
}
function validDueDate(value){
  if(!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d.toISOString();
}
function transcriptTaskFromItem(item,title,sourceId,kind){
  const taskTitle = cleanTaskTitle(item.title || item.task || item.action || item.nextAction);
  if(!taskTitle) return null;
  const contactName = item.contactName || item.person || item.who || item.for || item.owner || '';
  const notes = [
    item.notes || item.context || item.reason || '',
    item.priority ? 'Priority: '+item.priority : '',
    item.evidence ? 'Evidence: '+item.evidence : ''
  ].filter(Boolean).join('\n');
  return {
    id: uuid('task'),
    title: taskTitle,
    contactName,
    dueDate: validDueDate(item.dueDate || item.due || item.deadline),
    notes,
    details: [
      {text:'Created from transcript: '+title,ts:new Date().toISOString()},
      {text:'Source: '+(sourceId||title),ts:new Date().toISOString()},
      {text:'Kind: '+(kind||'commitment'),ts:new Date().toISOString()}
    ],
    completed:false,
    createdAt:new Date().toISOString()
  };
}

function actionPrompt(action){
  const prompts={
    daily_command:'Create a relationship-first daily command briefing for a founder/executive whose highest leverage is high-trust connection. Include today meetings, 15-minute prep needs, urgent promises, relationship radar, approvals waiting, one focus block, the single highest-leverage action, and one high-impact use of the time VAL is saving. Be assertive and practical.',
    what_now:'Choose exactly what Jessa should do next. Consider energy, urgency, calendar, overdue tasks, HALOS/DISC memory, business leverage, and whether VAL has freed time that should be spent on a higher-value relationship, strategic move, recovery block, or creative work. Be decisive.',
    weekly_review:'Create a weekly review: wins, stuck loops, avoided work, relationship follow-ups, stop/start/continue, and top 3 priorities for next week.',
    relationship_briefing:'Create a relationship briefing for the person or meeting named by the user. Include context, last known interaction, tone, likely needs, open promises, opportunity angle, questions, and follow-up suggestions.',
    project_space:'Create a project-space view for the requested project: current context, docs/memory, open tasks, decisions, risks, and next actions.',
    task_intelligence:'Review the task list. Group by urgency/energy/project, flag stale/vague tasks, rewrite vague tasks into next actions, and recommend what to clear first.',
    followup_radar:'Rank the highest-priority relationships to nurture now. Focus on people where trust, revenue, referrals, partnership, or promised follow-up could be lost if ignored. For each person include why now, what was promised or implied, the smallest next action, and a ready-to-send message draft when appropriate.',
    relationship_radar:'Create a Relationship Radar view. Rank high-value contacts by urgency and opportunity. Use calendar, conversations, tasks, pipeline, memory, and open loops. For each person include relationship context, why they matter, what is at risk, next best action, and a ready-to-send message when appropriate.',
    pre_meeting_brief:'Prepare the next meeting as if it starts in 15 minutes. Identify all attendees, infer who matters most, summarize prior context, open promises, current opportunity, likely objective, relationship risks, suggested opening line, three questions, and the cleanest follow-up VAL should send afterward.',
    auto_followups:'Review recent meetings and conversations. Draft the follow-ups VAL should send now. For each draft include recipient, why it should go now, subject, message body, and whether it is safe to send automatically or should sit in the Approval Queue.',
    contact_command_center:'Create a contact command center for the relevant person or company. Group all tasks, notes, promises, meetings, opportunities, relationship context, and suggested next moves by contact. Make it easy to see what is waiting on them and what is waiting on Jessa.',
    integrity_tracker:'Audit open promises and commitments. List what Jessa said she would do, who it is for, source/context, due timing if known, risk if dropped, and the next closure action. Do not suggest deleting tasks. The user must close loops manually.',
    daily_rhythm:'Run the daily executive rhythm: morning briefing, midday check-in, end-of-day wrap, and tomorrow prep. Keep it relationship-first. Surface dynamic prompts based on meetings, overdue tasks, approvals, stale relationships, and pipeline urgency.',
    saved_time_leverage:'Suggest the highest-impact things Jessa could do with the time, energy, and cognitive load VAL is saving. Focus on moves that create revenue, deepen high-value relationships, strengthen authority, protect recovery, improve strategic thinking, or create long-term leverage. Give 3 to 5 options, explain why each matters, and recommend one to do now.',
    onboarding_profile:'Run the Tell Me About Yourself onboarding. Ask one deep question at a time to understand identity, business model, high-value relationships, communication style, decision patterns, energy patterns, personality profile, boundaries, approval preferences, and documents to upload. Be warm, direct, and psychologically insightful.',
    executive_review:'Run an executive review in this exact order. First: draft all follow-ups that should go out now and indicate which ones belong in the Approval Queue. For each one, include person, why now, ready-to-send draft, and smallest approval action. Second: prep the next meeting with attendees, likely objective, context, risks, and 3 opening talking points. Third: clean up the task list by grouping tasks into do now, delegate, defer, delete candidate, and needs clarification. Do not delete tasks. End with one question only: "Do you want me to approve follow-ups, prep the meeting deeper, or clean the task list first?" Keep this concise and action-oriented. Do not create a broad report.',
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
      VAL_SYSTEM_PROMPT,
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
  const sourceId=payload.id||payload.transcriptId||payload.sourceId||title;
  const memory=await recentMemoryContext(title+' '+transcript.slice(0,1000));
  const system=[
    VAL_SYSTEM_PROMPT,
    'You process transcripts for VAL. Your job is to prevent commitments from leaking.',
    'Extract every unresolved promise, next step, follow-up, owner action, waiting-for item, meeting prep need, and task implied by the conversation.',
    'If someone says they will send, review, schedule, introduce, decide, follow up, check, draft, prepare, update, research, or circle back, that belongs in actionItems unless it was explicitly completed in the transcript.',
    'If a follow-up message should be sent after the meeting, include it in followupDrafts and also create a matching actionItems entry unless another action item already covers it.',
    'Do not invent work. Do not create tasks for completed items. When due timing is unclear, use null.',
    'Return strict JSON with keys: summary, actionItems, decisions, people, memoryUpdates, followupDrafts.',
    'actionItems must be an array of objects with title, dueDate, notes, priority, contactName, person, evidence.',
    'Every action item title should start with a verb and be clear enough to execute without reopening the transcript.',
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
  const taskItems=Array.isArray(parsed.actionItems)?parsed.actionItems.slice(0,18):[];
  const followupItems=(Array.isArray(parsed.followupDrafts)?parsed.followupDrafts:[]).slice(0,8).map(f=>({
    title:f.title||f.task||('Send follow-up'+(f.recipient||f.contactName||f.person?' to '+(f.recipient||f.contactName||f.person):'')),
    contactName:f.contactName||f.person||f.recipient||'',
    dueDate:f.dueDate||null,
    notes:[f.reason||'',f.subject?'Subject: '+f.subject:'',f.message||f.body||''].filter(Boolean).join('\n'),
    priority:f.priority||'high',
    evidence:f.evidence||'Follow-up draft created from transcript'
  }));
  const existing = await loadTasks();
  const seen = new Set(existing.filter(t=>!t.completed).map(t=>taskFingerprint(t.title,t.contactName)));
  for(const item of taskItems.concat(followupItems)){
    const task=transcriptTaskFromItem(item,title,sourceId,'transcript_action');
    if(!task) continue;
    const fp=taskFingerprint(task.title,task.contactName);
    if(seen.has(fp)) continue;
    seen.add(fp);
    await saveTask(task);
    createdTasks.push(task);
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
    if(req.body&&req.body.process!==false){
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
  const terms = expandedMemoryTerms(query);
  const identityMode = isIdentityQuery(query);
  const format = (items)=>items.map(m=>`- [${m.kind}] ${(m.summary||m.raw_text||m.rawText||'').slice(0,140)}${(m.raw_text||m.rawText)&&((m.raw_text||m.rawText)!==m.summary)?': '+(m.raw_text||m.rawText).slice(0,650):''}`).join('\n');
  const coreProfilePinned = (items)=>{
    return items
      .filter(m=>{
        const meta = typeof m.metadata === 'string' ? (()=>{try{return JSON.parse(m.metadata);}catch(e){return {};}})() : (m.metadata||{});
        const chunk = Number(meta.chunkIndex || 0);
        return /core_user_profile/i.test(m.kind||'') && (!chunk || chunk <= 4);
      })
      .sort((a,b)=>{
        const am = typeof a.metadata === 'string' ? (()=>{try{return JSON.parse(a.metadata);}catch(e){return {};}})() : (a.metadata||{});
        const bm = typeof b.metadata === 'string' ? (()=>{try{return JSON.parse(b.metadata);}catch(e){return {};}})() : (b.metadata||{});
        return String(am.title||a.summary||'').localeCompare(String(bm.title||b.summary||'')) || (Number(am.chunkIndex||0)-Number(bm.chunkIndex||0));
      })
      .slice(0,8);
  };
  const uniqueByContent = (items)=>{
    const seen = new Set();
    return items.filter(m=>{
      const key = `${m.kind||''}|${m.summary||''}|${(m.raw_text||m.rawText||'').slice(0,80)}`;
      if(seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };
  if(pgPool){
    const r=await dbQuery(
      'select kind,summary,raw_text,importance,metadata,created_at from val_memory_items where user_id=$1 order by created_at desc limit 1200',
      [VAL_USER_ID]
    );
    const ranked = r.rows.map(m=>({...m,_score:scoreMemory(m,terms)}))
      .filter(m=>identityMode ? (m._score > 0 || /core_user_profile|val_operating_prompt/i.test(m.kind||'')) : true)
      .sort((a,b)=>(b._score-a._score)||((b.importance||1)-(a.importance||1)))
      .slice(0,identityMode?22:14);
    return format(uniqueByContent(coreProfilePinned(r.rows).concat(ranked)).slice(0,identityMode?24:18));
  }
  const storeItems = valStore().memoryItems;
  const ranked = storeItems.map(m=>({...m,_score:scoreMemory(m,terms)}))
    .filter(m=>identityMode ? (m._score > 0 || /core_user_profile|val_operating_prompt/i.test(m.kind||'')) : true)
    .sort((a,b)=>(b._score-a._score)||((b.importance||1)-(a.importance||1)))
    .slice(0,identityMode?22:14);
  return format(uniqueByContent(coreProfilePinned(storeItems).concat(ranked)).slice(0,identityMode?24:18));
}

app.post('/api/val/chat',async(req,res)=>{
  try{
    if(!OPENAI_KEY) return res.status(500).json({error:'OPENAI_KEY not configured'});
    const messages = Array.isArray(req.body.messages) ? req.body.messages : [];
    const lastUser = [...messages].reverse().find(m=>m.role==='user')?.content || '';
    const memory = await recentMemoryContext(lastUser);
    const system = [
      VAL_SYSTEM_PROMPT,
      'Always use the saved core user profile memory as a behavioral operating context for how you speak to, prioritize for, and advise Jessa. Adapt recommendations to her DISC/HALOS patterns, capacity, nervous system load, communication style, and execution tendencies.',
      'Use other saved memory when relevant. Do not pretend to know facts that are not present.',
      'For identity, self-knowledge, profile, DISC, HALOS, or "tell me about myself" questions, prioritize saved core user profile memory over calendar/dashboard context. Answer from the profile memory first, then mention live dashboard items only if they are directly relevant.',
      memory ? 'Recent saved VAL memory:\n'+memory : ''
    ].filter(Boolean).join('\n\n');
    const content = await callOpenAIResponses({system,messages,maxTokens:1800,temperature:0.7});
    res.json({message:{role:'assistant',content:content||'I could not process that.'}});
  }catch(e){ res.status(500).json({error:e.message}); }
});

// ════════════════════════════════════════════════════════
const PORT=process.env.PORT||3000;
app.listen(PORT,()=>console.log(`VAL proxy running on port ${PORT}`));
