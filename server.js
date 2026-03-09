const express = require('express');
const cors    = require('cors');
const app     = express();

app.use(cors());
app.use(express.json());

const GHL_KEY = process.env.GHL_KEY;
const GHL_LOC = process.env.GHL_LOC;
const BASE    = 'https://services.leadconnectorhq.com';

function gh(){
  return {'Authorization':`Bearer ${GHL_KEY}`,'Version':'2021-07-28','Content-Type':'application/json'};
}
async function ghl(method,path,body){
  const r=await fetch(BASE+path,{method,headers:gh(),body:body?JSON.stringify(body):undefined});
  return r.json();
}

// ── HEALTH ───────────────────────────────────────────────
app.get('/',(req,res)=>res.json({status:'VAL Proxy OK',time:new Date().toISOString()}));

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

// Step 1 — redirect user to Google consent screen
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
    googleTokens = {...googleTokens, ...fresh, issued_at: Date.now()};
    return googleTokens.access_token;
  } catch(e) {
    console.error('Token refresh failed:', e);
    return null;
  }
}

// Auth status check
app.get('/auth/status', (req, res) => {
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
      const stage=o.pipelineStage?.name||o.stage?.name||o.stageName||'Unknown Stage';
      const contactId=o.contact?.id||o.contactId;
      let notes=[];
      let contactEmail='';
      let contactPhone='';
      try{
        if(contactId){
          const [notesData,contactData]=await Promise.all([
            ghl('GET',`/contacts/${contactId}/notes?limit=5`),
            ghl('GET',`/contacts/${contactId}`)
          ]);
          notes=(notesData.notes||[]).map(n=>n.body||n.note||'').filter(Boolean).slice(0,3);
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
    const s=new Date();s.setHours(0,0,0,0);
    const e=new Date();e.setDate(e.getDate()+7);e.setHours(23,59,59,999);

    // Get GHL events by fetching calendars list first
    async function getGHLEvents(){
      try{
        // Get all calendars for this location
        const calData = await ghl('GET',`/calendars/?locationId=${GHL_LOC}`);
        const calendars = calData.calendars||[];
        console.log('GHL calendars found:',calendars.length, calendars.map(c=>({id:c.id,name:c.name})));

        if(calendars.length){
          // Fetch events for each calendar
          let allEvents=[];
          await Promise.all(calendars.map(async cal=>{
            try{
              const d=await ghl('GET',`/calendars/events?locationId=${GHL_LOC}&calendarId=${cal.id}&startTime=${s.getTime()}&endTime=${e.getTime()}`);
              const evs=d.events||d.appointments||[];
              console.log(`GHL events for calendar ${cal.name||cal.id}:`,evs.length);
              allEvents.push(...evs);
            }catch(err){console.log('GHL calendar events error:',err.message);}
          }));
          return allEvents;
        }

        // Fallback: try groupId approach
        const groupData = await ghl('GET',`/calendars/groups?locationId=${GHL_LOC}`);
        const groups = groupData.groups||[];
        console.log('GHL groups found:',groups.length);
        if(groups.length){
          let allEvents=[];
          await Promise.all(groups.map(async g=>{
            try{
              const d=await ghl('GET',`/calendars/events?locationId=${GHL_LOC}&groupId=${g.id}&startTime=${s.getTime()}&endTime=${e.getTime()}`);
              allEvents.push(...(d.events||d.appointments||[]));
            }catch(err){}
          }));
          return allEvents;
        }
        return [];
      }catch(err){
        console.error('getGHLEvents error:',err.message);
        return [];
      }
    }

    const [ghlRes, googleRes] = await Promise.allSettled([
      getGHLEvents(),
      (async()=>{
        const token=await getGoogleToken();
        if(!token){console.log('Google token missing');return{items:[],needsAuth:true};}
        const r=await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${s.toISOString()}&timeMax=${e.toISOString()}&singleEvents=true&orderBy=startTime&maxResults=50`,{headers:{Authorization:`Bearer ${token}`}});
        const d=await r.json();
        if(d.error)console.error('Google Calendar error:',d.error.message);
        return d;
      })()
    ]);

    const ghlEvents = ghlRes.status==='fulfilled'?ghlRes.value:[];
    const googleRaw = googleRes.status==='fulfilled'?googleRes.value:{};
    const googleEvents = googleRaw.items||[];

    console.log(`Calendar: ${ghlEvents.length} GHL + ${googleEvents.length} Google events`);

    const mapped = [
      ...ghlEvents.map(ev=>({
        id:ev.id, summary:ev.title||ev.name||ev.summary,
        startTime:ev.startTime||ev.start, endTime:ev.endTime||ev.end,
        contactName:ev.contactName||ev.contact?.name,
        status:ev.appointmentStatus||ev.status, source:'ghl'
      })),
      ...googleEvents.map(ev=>({
        id:ev.id, summary:ev.summary||'(No title)',
        startTime:ev.start?.dateTime||ev.start?.date,
        endTime:ev.end?.dateTime||ev.end?.date,
        location:ev.location, status:ev.status, source:'google'
      }))
    ];

    mapped.sort((a,b)=>new Date(a.startTime)-new Date(b.startTime));
    res.json({
      calendarEvents:mapped,
      _debug:{ghlCount:ghlEvents.length, googleCount:googleEvents.length, googleNeedsAuth:!!googleRaw.needsAuth}
    });
  }catch(e){
    console.error('calendar error:',e);
    res.json({calendarEvents:[],_debug:{error:e.message}});
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
      title:t.title||t.name||t['task.title']||'(No title)',
      contactName:t.contactName||t.contact?.name||t.assignedTo||'',
      contactId:t.contactId||t.contact?.id||'',
      dueDate:t.dueDate||t.due_date||t.dueAt||t.due||null,
      status:t.status||t.taskStatus||'open',
      completed:t.completed||t.status==='completed'||t.taskStatus==='completed'
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
    const contactsData=await ghl('GET',`/contacts/?locationId=${GHL_LOC}&limit=20&sortBy=date_added&sortDirection=desc`);
    const contacts=contactsData.contacts||[];
    const taskArrays=await Promise.all(contacts.map(async c=>{
      try{
        const t=await ghl('GET',`/contacts/${c.id}/tasks`);
        return (t.tasks||[]).map(task=>({...task,contactName:(c.firstName||'')+' '+(c.lastName||''),contactId:c.id}));
      }catch(e){return [];}
    }));
    return normalizeTasks(taskArrays.flat());
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
    const [r1,r2,r3,r4,r5] = await Promise.allSettled([
      ghl('GET',`/contacts/tasks/search?locationId=${GHL_LOC}&limit=10`),
      ghl('GET',`/locations/${GHL_LOC}/tasks?limit=10`),
      ghl('POST',`/contacts/tasks/search`,{locationId:GHL_LOC,limit:10}),
      ghl('GET',`/contacts/tasks?locationId=${GHL_LOC}&limit=10`),
      ghl('GET',`/locations/${GHL_LOC}/tasks/search?limit=10`)
    ]);
    const fmt=r=>r.status==='fulfilled'?{keys:Object.keys(r.value),sample:r.value}:{error:r.reason?.message||'failed'};
    
    // Also try fetching tasks for a known contact to confirm the per-contact endpoint works
    const contacts=await ghl('GET',`/contacts/?locationId=${GHL_LOC}&limit=5&sortBy=date_added&sortDirection=desc`);
    const firstContact=(contacts.contacts||[])[0];
    let contactTaskSample=null;
    if(firstContact){
      const ct=await ghl('GET',`/contacts/${firstContact.id}/tasks`);
      contactTaskSample={contactId:firstContact.id,contactName:(firstContact.firstName||'')+' '+firstContact.lastName,response:ct};
    }

    res.json({
      searchGET:fmt(r1),
      locationTasks:fmt(r2),
      searchPOST:fmt(r3),
      tasksGET:fmt(r4),
      locationSearch:fmt(r5),
      contactTaskSample
    });
  }catch(e){res.json({error:e.message});}
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
    const d=await ghl('GET',`/conversations/search?locationId=${GHL_LOC}&limit=20`);
    const convos=d.conversations||[];
    const items=convos.filter(c=>c.unreadCount>0).map(c=>({text:`${c.contactName||'Contact'} replied`,type:'Communication',color:'green',time:new Date(c.dateUpdated).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}),contactId:c.contactId,actionUrl:`https://app.gohighlevel.com/v2/location/${GHL_LOC}/conversations/${c.id}`}));
    res.json({feedItems:items,followups:items.length});
  }catch(e){res.json({feedItems:[],followups:0});}
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

// ════════════════════════════════════════════════════════
const PORT=process.env.PORT||3000;
app.listen(PORT,()=>console.log(`VAL proxy running on port ${PORT}`));
