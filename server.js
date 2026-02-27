const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const GHL_KEY = process.env.GHL_KEY;
const GHL_LOC = process.env.GHL_LOC;
const BASE    = 'https://services.leadconnectorhq.com';

function ghlHeaders() {
  return {
    'Authorization': `Bearer ${GHL_KEY}`,
    'Version': '2021-07-28',
    'Content-Type': 'application/json'
  };
}

// ── MEETINGS / APPOINTMENTS ──────────────────────────────
app.get('/api/meetings', async (req, res) => {
  try {
    const today = new Date();
    const start = new Date(today); start.setHours(0,0,0,0);
    const end   = new Date(today); end.setHours(23,59,59,999);

    const url = `${BASE}/calendars/events?locationId=${GHL_LOC}&startTime=${start.toISOString()}&endTime=${end.toISOString()}`;
    const r = await fetch(url, { headers: ghlHeaders() });
    const d = await r.json();

    const events = d.events || [];
    res.json({
      meetingsToday: events.length,
      appointments: events.map(e => ({
        id: e.id,
        title: e.title || e.name,
        contactName: e.contactName,
        startTime: e.startTime || e.start,
        endTime: e.endTime || e.end,
        status: e.status,
        calendarId: e.calendarId
      }))
    });
  } catch(e) {
    console.error('meetings error:', e);
    res.json({ meetingsToday: 0, appointments: [] });
  }
});

// ── PIPELINE / OPPORTUNITIES ─────────────────────────────
app.get('/api/pipeline', async (req, res) => {
  try {
    const url = `${BASE}/opportunities/search?location_id=${GHL_LOC}&status=open&limit=100`;
    const r = await fetch(url, { headers: ghlHeaders() });
    const d = await r.json();

    const opps = d.opportunities || [];
    const now = Date.now();
    const stalled = opps.filter(o => {
      const updated = new Date(o.lastStatusChangeAt || o.updatedAt).getTime();
      return (now - updated) > 14 * 24 * 60 * 60 * 1000; // 14 days
    });

    res.json({
      pipelineActive: d.meta?.total || opps.length,
      stalledDeals: stalled.length,
      opportunities: opps.map(o => ({
        id: o.id,
        name: o.name,
        status: o.status,
        stage: o.pipelineStage?.name,
        value: o.monetaryValue,
        contactName: o.contact?.name,
        updatedAt: o.updatedAt
      }))
    });
  } catch(e) {
    console.error('pipeline error:', e);
    res.json({ pipelineActive: 0, stalledDeals: 0, opportunities: [] });
  }
});

// ── TASKS ────────────────────────────────────────────────
app.get('/api/tasks', async (req, res) => {
  try {
    // GHL has no global tasks endpoint — return from stored signals
    // This will be populated by your GHL workflow → Make scenario
    res.json({ openTasks: 0, overdueTasks: 0, tasks: [] });
  } catch(e) {
    res.json({ openTasks: 0, overdueTasks: 0, tasks: [] });
  }
});

// ── CONTACTS (recent) ────────────────────────────────────
app.get('/api/contacts', async (req, res) => {
  try {
    const url = `${BASE}/contacts/?locationId=${GHL_LOC}&limit=20&sortBy=date_added&sortDirection=desc`;
    const r = await fetch(url, { headers: ghlHeaders() });
    const d = await r.json();
    res.json({ contacts: d.contacts || [] });
  } catch(e) {
    res.json({ contacts: [] });
  }
});

// ── CONVERSATIONS (inbound replies) ─────────────────────
app.get('/api/conversations', async (req, res) => {
  try {
    const url = `${BASE}/conversations/search?locationId=${GHL_LOC}&limit=20`;
    const r = await fetch(url, { headers: ghlHeaders() });
    const d = await r.json();
    const convos = d.conversations || [];
    const unread = convos.filter(c => c.unreadCount > 0);
    res.json({
      followups: unread.length,
      conversations: convos.map(c => ({
        id: c.id,
        contactName: c.contactName || c.fullName,
        lastMessage: c.lastMessage,
        unread: c.unreadCount,
        updatedAt: c.dateUpdated
      }))
    });
  } catch(e) {
    res.json({ followups: 0, conversations: [] });
  }
});

// ── ALL DASHBOARD DATA IN ONE CALL ───────────────────────
app.get('/api/dashboard', async (req, res) => {
  try {
    const [meetings, pipeline, tasks, conversations] = await Promise.allSettled([
      fetch(`http://localhost:${PORT}/api/meetings`).then(r => r.json()),
      fetch(`http://localhost:${PORT}/api/pipeline`).then(r => r.json()),
      fetch(`http://localhost:${PORT}/api/tasks`).then(r => r.json()),
      fetch(`http://localhost:${PORT}/api/conversations`).then(r => r.json()),
    ]);

    res.json({
      ...(meetings.status==='fulfilled' ? meetings.value : {}),
      ...(pipeline.status==='fulfilled' ? pipeline.value : {}),
      ...(tasks.status==='fulfilled'    ? tasks.value    : {}),
      ...(conversations.status==='fulfilled' ? conversations.value : {}),
    });
  } catch(e) {
    res.json({});
  }
});

// ── HEALTH CHECK ─────────────────────────────────────────
app.get('/', (req, res) => res.json({ status: 'VAL Proxy OK', time: new Date().toISOString() }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`VAL proxy running on port ${PORT}`));
