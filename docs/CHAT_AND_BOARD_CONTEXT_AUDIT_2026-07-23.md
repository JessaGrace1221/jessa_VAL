# Chat and Board Context Audit

Date: 2026-07-23
Repo: jessa_VAL-home-page-ui-clean

## Bottom Line

VAL's scoped text chat architecture is real enough to describe carefully to users.

The Board of Observers is now safe to describe as live packet telemetry for the source families that are explicitly registered as live: email sync, transcripts, saved calendar events, Witnessing, Co-Work, external action packets, and Home VAL email action preparation. It is not yet safe to describe every possible future VAL source as live Board telemetry until that source has its own packet hook and regression coverage.

Every live packet is visible to every Board Observer. The packet system still marks primary observers so VAL knows which lenses should speak first, but no Observer is excluded from shared Board context. The Intelligence Spine now stores per-observer packet reviews so the claim "every Observer looked at this packet through its own lens" is backed by saved output, not just by a route label.

## What Is Confirmed

### Function-Specific Text Chat

Confirmed:

- Co-Work entrypoints are registered as explicit contracts, not one generic chat bucket.
- Project, transcript, email thread, relationship, observer, and Chief of Staff conversations each have a stable entrypoint id.
- Co-Work sessions persist conversation history and can resume durable context.
- Missing selected source context is rejected instead of silently opening a generic chat.
- Transcript Co-Work uses selected transcript receipts and action items.
- Executive Inbox Co-Work scopes to a selected durable email thread.
- Relationship Co-Work scopes to a selected relationship or selected relationship section.
- Observer chat and Chief of Staff chat are routed through `observer.discussion` and `board.chief_of_staff`.

Relevant implementation:

- `services/valCowork.js`
- `services/valCoworkRoutes.js`
- `test/valCowork.test.js`

### Home VAL Chat

Confirmed:

- Home VAL is not only a Hearth sidebar chat anymore.
- The full-context route can gather saved memory, GHL context, Google Docs context, uploaded document context, linked Gmail attachment context, executive briefing context, task context, project context, and relationship context when the request requires it.
- Simple voice/chat turns can use a fast Hearth lane for responsiveness.
- Requests involving sending, email, contacts, people, relationships, Stewardship, CRM, GHL, projects, transcripts, LinkedIn, Board, observers, documents, memory, search, or "what do we know" leave the fast lane and require broader VAL context.
- Email and SMS preparation use contact lookup from relationship profiles/Rolodex-style context.
- Email sends are prepared as approval packets; VAL asks for approval before sending.

Relevant implementation:

- `server.js` `/api/val/chat`
- `server.js` `hearthFastNeedsFullValContext`
- `server.js` `hearthActionPrepContent`
- `server.js` `resolveHearthActionContact`

### Voice Integration

Confirmed by regression tests:

- The GHL voice endpoint returns a flat speakable response.
- Timestamp-style GHL conversation ids can be grouped into a rolling conversation flow.
- Voice actions can inherit recipient/body from transcript context.
- Home VAL chat can resolve action contacts from Stewardship/Rolodex context.
- Stewardship Network stores GHL-ready email and phone details.

Relevant implementation:

- `server.js` `/api/val/ghl/voice-turn`
- `test/voiceIntegrationRegression.test.js`

### Board of Observers: Existing Backend Spine

Confirmed:

- There is a backend Intelligence Spine.
- It builds a shared context packet from Teach VAL memory, transcripts, durable conversations/email summaries, selected conversation context, identity resolution, Executive Inbox classifications, Ready For You candidates, calendar events, tasks, relationships, projects, recent recommendations, and user feedback.
- It stores observer runs, round table runs, Chief of Staff recommendations, momentum snapshots, and Ready For You items.
- There are API routes to run an intelligence pass manually and fetch observer/round table runs.

Relevant implementation:

- `services/valIntelligenceSpine.js`
- `services/valIntelligenceSpineRoutes.js`

## What Is Not Yet Confirmed

### Source Families Still Not Fully Live

Not confirmed:

- SMS packets from the GHL/VAL SMS bridge.
- LinkedIn visibility packets from the updated LinkedIn function.
- Document/upload packets outside transcript and Home VAL source handling.
- Task mutation packets for every task creation/completion path.
- Relationship profile mutation packets from every Stewardship save path.
- Project profile mutation packets from every Project Managers save path.
- Public research packets from Apollo, Outscraper, web research, and LinkedIn research receipts.
- GHL Voice completed-turn packets.

These are intentionally registered as pending in the Board source registry so VAL does not overclaim them.

### Witnessing Is Backend-Live

The visual Board currently has 14 observers:

- Executive Inbox
- Relationship
- Project
- Capacity
- Courage
- Delight
- Opportunity
- Momentum
- Meaning
- Synchronicity
- Commitment
- Calendar
- Environment
- Witnessing

The backend `DEFAULT_OBSERVERS` now also has all 14 observers, including Witnessing and Synchronicity.

### Observer "Lenses" Are Not Yet Independent LLM Reasoners

The backend currently builds deterministic observer outputs from one shared context packet. It now stores a `packetReviews` record for every Observer against every live packet, including lens, concern, question, primary status, triggered status, and confidence. It does store prompt metadata, but each observer is not yet independently running a separate full LLM prompt against each incoming item.

That is acceptable as a Phase 1 reasoning scaffold, but it should be described accurately: every Observer reviews every live packet through its deterministic lens today; future work can upgrade those reviews to full model-backed observer prompts if needed.

## Test Results

Focused green suite:

- `test/valIntelligenceSpine.test.js`
- `test/voiceIntegrationRegression.test.js`
- `test/valExecutiveInbox.test.js`
- `test/valTranscriptIntelligence.test.js`

Result:

- 45 tests
- 45 passing
- 0 failing

Broader targeted suite:

- 116 tests
- 112 passing
- 4 failing

The visible failures are brittle/stale expectations:

- `test/contextualChat.test.js` expects `chatContextCorrection`, which is no longer present in `server.js`.
- `test/valCowork.test.js` expects an exact `submitActiveCoworkEntry()` string in the Project Managers UI path; the current implementation uses scoped entry behavior elsewhere.

These failures should be fixed before claiming the entire chat/Co-Work test suite is clean.

## Safe User-Facing Promise Today

Safe:

"VAL's function chats are scoped to the place you opened them from. If you open chat from a transcript, email thread, relationship, project, Observer, or Chief of Staff surface, VAL keeps that source context with the conversation and can build reviewable work around it. Home VAL is the broader Chief of Staff lane and can reason across more of the system."

Not safe yet:

"Every single thing that enters or happens inside VAL is already flowing live through every Board Observer."

Safer Board language:

"The Board of Observers is VAL's transparent reasoning layer. Today, it shows the intended packet field and can run backend intelligence passes from stored context. The next engineering step is connecting every real source event into durable Board packets so the visual field becomes true live telemetry."

## Recommended Next Build

1. Add Witnessing to the backend `DEFAULT_OBSERVERS` suite.
2. Create a durable `board_packets` model/table with:
   - source type
   - source id
   - packet type
   - source summary
   - observer routes
   - route reason
   - status
   - created/completed timestamps
   - prototype/live flag
3. Add ingestion hooks:
   - email sync/upsert -> Board packets
   - transcript saved/processed -> Board packets
   - calendar event import/update -> Board packets
   - approved external action -> Board packets
   - Co-Work saved decision/correction -> Board packets
   - Witnessing saved answer/completion -> Board packets
4. Run the Intelligence Spine automatically from those packets, or enqueue an async pass.
5. Update the Board front end to render live packets first and fall back to prototype packets only when explicitly in demo mode.
6. Add tests proving:
   - before Witnessing: no live/prototype packet orbs and the holding-space message appears.
   - after Witnessing: at least 20 starter packets are created from real Witnessing context.
   - email sync creates routed packet rows.
   - transcript processing creates routed packet rows.
   - every active observer, including Witnessing and Synchronicity, receives appropriate packets.
   - Chief of Staff recommendations reference observer runs produced from real packet ids.

## Recommendation

Do not promise the Board as fully live yet.

Do promise that the scoped chat foundation is real, and that the Board has the correct visual/product philosophy plus a backend spine ready to be wired into live source events.

## Implementation Update: Board Packet Integrity Pass

Completed after the audit:

- Added Witnessing to the backend default Observer suite.
- Added durable Board packet storage via `val_board_packets`.
- Added Board packet APIs:
  - `GET /api/val/board/packets`
  - `GET /api/val/board/context`
  - `POST /api/val/board/packets`
- Added live packet creation hooks for:
  - email sync
  - transcript processing
  - saved calendar events
  - Witnessing answers
  - Witnessing confirmations
  - Witnessing session commit
  - Co-Work open/respond/apply events
  - external action packet build/approval/execution
  - Home VAL email action preparation
- Board packet routing now sends every packet to every Observer while marking primary Observers for the most relevant first-pass lenses.
- Home VAL now receives live Board packet context as the Chief of Staff lane.
- Board Observer and Chief of Staff Co-Work chats now receive live Board packet context and are instructed not to invent activity when live packets are missing.
- The Board UI now prefers live Board packet records. It only shows prototype/stress packet motion when explicitly opened in a stress/demo mode; otherwise it shows “Holding space for Analytical and Relational Context.”
- Added a Board source registry/readiness contract so VAL can report which source families are live, which are pending, and whether it is safe to claim all sources are Board-aware.

New focused verification:

- `node --check server.js`
- `node --check hearth-prototype.js`
- `node --check services/valBoardPackets.js`
- `node --check services/valBoardPacketsRoutes.js`
- `node --check services/valBoardPacketsSchema.js`
- `node --check services/valIntelligenceSpine.js`
- `node --check services/valConversationIdentityRoutes.js`
- `node --check services/valExternalActionsRoutes.js`
- `node --check services/valCoworkRoutes.js`
- `node --test test/valBoardPackets.test.js test/valIntelligenceSpine.test.js test/valConversationIdentity.test.js test/valExternalActions.test.js test/valCowork.test.js test/valTranscriptIntelligence.test.js test/valExecutiveInbox.test.js`

Focused suite result:

- 93 passing
- 0 failing

Updated safe language:

"VAL’s function chats are scoped to the source/function they open from, and Home VAL is the broader Chief of Staff lane. The Board of Observers now has durable live packet records for the highest-value source events: email sync, transcripts, calendar events, Witnessing, Co-Work, and external action packets. Each packet is visible to every Observer with primary Observer lenses marked, and the Board UI now prefers those live packets instead of pretending demo motion is telemetry."

## Source Registry Contract

Live Board-aware sources:

- `email`
- `transcript`
- `calendar_event`
- `witnessing`
- `cowork`
- `external_action`
- `home_email_action`

Pending Board-aware sources:

- `sms`
- `linkedin_visibility`
- `document`
- `task`
- `relationship_profile`
- `project_profile`
- `public_research`
- `ghl_voice`

The Board source readiness API is:

- `GET /api/val/board/sources`

The rule going forward:

No source may be described as live Board telemetry unless it appears in the registry with `status: "live"`, has a concrete hook name, and has passing regression coverage proving packet creation or source readiness behavior.

Still not safe to overclaim:

- Do not say every possible future source in VAL is live until that source has an explicit packet hook.
- Do not say every Observer independently runs a full LLM prompt against every packet yet. The current Intelligence Spine is a durable deterministic observer/round-table scaffold with source refs, stored outputs, and per-observer packet reviews for every live packet.
- Do not describe raw `file://` prototype previews as live packet telemetry; live packet context requires the served app/backend.

## Implementation Update: Every Observer Reviews Every Packet

Completed after the source registry pass:

- Added per-observer `packetReviews` to Intelligence Spine observer outputs.
- Every non-prototype Board packet in the shared context is reviewed by every Observer in the default Board suite.
- Each review stores:
  - packet id
  - source type and packet type
  - observer lens
  - whether this Observer is primary for the packet
  - whether the packet triggered the current intelligence pass
  - what the Observer is seeing
  - concern
  - question
  - confidence
  - review mode
- Round Table outputs now include reviewed packet ids and per-observer packet-review counts.
- Home VAL and Board Observer Co-Work chats now receive recent observer packet reflections in addition to raw packet context.

New focused verification:

- `node --test test/valIntelligenceSpine.test.js`

Focused result:

- 5 passing
- 0 failing
