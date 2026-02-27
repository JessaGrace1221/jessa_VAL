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
    console.log('Google tokens stored, expires_in:', googleTokens.expires_in);
    res.send('<h2 style="font-family:sans-serif;padding:2rem">✅ Google Calendar & Gmail connected to VAL!<br><br>You can close this tab.</h2>');
  } catch(e) {
    res.status(500).send('Auth failed: '+e.message);
  }
});

// Refresh access token if expired
async function getGoogleToken() {
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
    res.json({pipelineActive:d.meta?.total||opps.length,stalledDeals:stalled.length,opportunities:opps.map(o=>({id:o.id,name:o.name,status:o.status,stage:o.pipelineStage?.name,value:o.monetaryValue,contactName:o.contact?.name,updatedAt:o.updatedAt}))});
  }catch(e){res.json({pipelineActive:0,stalledDeals:0,opportunities:[]});}
});

app.get('/api/calendar',async(req,res)=>{
  try{
    const s=new Date();s.setHours(0,0,0,0);
    const e=new Date();e.setDate(e.getDate()+7);e.setHours(23,59,59,999);

    // Fetch GHL + Google in parallel
    const [ghlRes, googleRes] = await Promise.allSettled([
      ghl('GET',`/calendars/events?locationId=${GHL_LOC}&startTime=${s.getTime()}&endTime=${e.getTime()}`),
      (async()=>{
        const token=await getGoogleToken();
        if(!token)return{items:[]};
        const r=await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${s.toISOString()}&timeMax=${e.toISOString()}&singleEvents=true&orderBy=startTime&maxResults=50`,{headers:{Authorization:`Bearer ${token}`}});
        return r.json();
      })()
    ]);

    const ghlEvents = ghlRes.status==='fulfilled'?(ghlRes.value.events||ghlRes.value.appointments||[]):[];
    const googleEvents = googleRes.status==='fulfilled'?(googleRes.value.items||[]):[];

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

    // Sort by start time
    mapped.sort((a,b)=>new Date(a.startTime)-new Date(b.startTime));
    res.json({calendarEvents:mapped});
  }catch(e){res.json({calendarEvents:[]});}
});

app.get('/api/tasks',async(req,res)=>{
  try{
    // GHL has no global tasks endpoint - fetch recent contacts then get their tasks
    const contactsData=await ghl('GET',`/contacts/?locationId=${GHL_LOC}&limit=50&sortBy=date_added&sortDirection=desc`);
    const contacts=contactsData.contacts||[];
    
    // Fetch tasks for each contact in parallel (limit to 30 to avoid rate limits)
    const taskPromises=contacts.slice(0,30).map(async c=>{
      try{
        const t=await ghl('GET',`/contacts/${c.id}/tasks`);
        return (t.tasks||[]).map(task=>({...task,contactName:c.firstName+' '+(c.lastName||''),contactId:c.id}));
      }catch(e){return [];}
    });
    
    const taskArrays=await Promise.all(taskPromises);
    const allTasks=taskArrays.flat();
    const now=new Date();
    
    // Filter incomplete tasks
    const open=allTasks.filter(t=>!t.completed&&t.status!=='completed');
    const overdue=open.filter(t=>t.dueDate&&new Date(t.dueDate)<now);
    
    res.json({
      openTasks:open.length,
      overdueTasks:overdue.length,
      tasks:open.map(t=>({
        id:t.id,
        title:t.title,
        contactName:t.contactName,
        contactId:t.contactId,
        dueDate:t.dueDate,
        status:t.status,
        overdue:t.dueDate&&new Date(t.dueDate)<now
      }))
    });
  }catch(e){
    console.error('tasks error:',e);
    res.json({openTasks:0,overdueTasks:0,tasks:[]});
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
