# Jessa VAL System Audit

Date: 2026-07-02
Scope: Jessa_VAL functional audit and launch-readiness pass.
Constraint: No visual redesign work. This audit checks behavior, data flow, trust, actionability, and executive usability.

## Executive Summary

Jessa_VAL is no longer just a dashboard. It is an executive operating system with these major responsibilities:

- Notice what changed across transcripts, email, relationships, projects, calendar, documents, memory, and CRM context.
- Convert source-backed information into executive decisions, tasks, drafts, relationship updates, project files, and calendar blocks.
- Keep the user in control before anything external happens.
- Preserve evidence and explain why VAL believes something matters.
- Let the user teach, correct, and enrich VAL from multiple surfaces.

The platform now has strong foundations in the areas that matter most for launch:

- Home page intelligence is source-backed and routes into premium drawers.
- Transcript intake has a durable pipeline with staging, review, evidence, participants, tasks, decisions, and recap drafts.
- Gmail/Executive Inbox supports inbox search, reply drafting, Gmail draft creation, approved sending, reply-all preservation, and draft style learning.
- Projects, relationships, evidence, tasks, drafts, and transcripts are now distinct workspaces rather than generic dashboard panels.
- Chat has a global route and can use dashboard, memory, documents, Google Docs, GHL, executive briefing, and uploaded source context.
- Security/privacy settings include audit log, support access controls, sessions, export, and delete-my-data workflows.

The most important functional gap found during this pass was that contextual chat had the right UI context but did not always act on contextual commands. A user could click "Create task" or ask "draft an email from this" and still get a conversational answer instead of a saved object. That is now patched server-side.

## Functional Updates Made In This Audit

### 1. Contextual chat now performs contextual actions

File: `server.js`

The `/api/val/chat` route now detects contextual chat commands when a chat includes active context from a homepage card, project, contact, relationship drawer, evidence drawer, or other workspace.

Supported contextual intents:

- Show evidence
- Create task
- Schedule / create scheduling action
- Draft email
- Update VAL memory
- Add context to a project

Expected executive behavior:

- If the user says "create a task from this," VAL creates an Action item.
- If the user says "reschedule a follow-up for this contact," VAL creates a linked task instead of talking around it.
- If the user says "draft an email," VAL saves an internal draft for approval.
- If the user says "show evidence," VAL returns attached evidence/source IDs.
- If the user says "remember this" or "add this to the project," VAL stores durable memory/context.

Safety standard:

- Contextual chat can prepare internal objects.
- It does not send emails or create external calendar events without approval.

### 2. Transcript artifact cleanup is scheduled again

File: `server.js`

The code already had cleanup functions for bad Jessa transcript artifacts, but one was not scheduled at server startup. That meant generated action summaries and recovered non-Krisp artifacts could remain in transcript archives and pollute the homepage.

Now startup runs:

- `purgeJessaTranscriptArtifacts()`
- `purgeJessaRecoveredNonKrispTranscripts()`

Expected executive behavior:

- The transcript list should show real transcript records, not generated action summaries, random excerpts, or dashboard artifacts.
- Homepage cards should not be driven by bad transcript residue.

### 3. Gmail approved-send now requires an explicit approval flag

Files: `server.js`, `dashboard.html`, `test/inboxCommand.test.js`

The Executive Inbox already had an approval button, but the backend endpoint did not require an explicit `approved:true` payload. It now rejects send requests unless the UI sends that flag.

Expected executive behavior:

- Drafts can be prepared.
- Gmail drafts can be saved.
- Emails can be sent only through the explicit approved-send flow.
- Reply-all recipients are preserved, excluding the current user.
- Draft style samples are remembered so VAL can learn the user's voice over time.

### 4. Regression test contract updated for approved send

File: `test/inboxCommand.test.js`

The old test asserted that Gmail send should not exist anywhere in the app. That was correct when VAL was draft-only. It is no longer correct now that approved send is a launch requirement.

The updated contract is:

- Inbox Command drafts require approval.
- Approved Gmail sending is allowed only through `/api/gmail/send-approved-draft`.
- The frontend sends `approved:true`.
- The backend rejects missing approval.

## System Map

### 1. Authentication and Configuration

Primary responsibilities:

- Serve login and password setup.
- Create and destroy sessions.
- Recover auth state through a session bridge.
- Expose tenant/client configuration.
- Expose setup and health checks.

Key routes:

- `GET /`
- `GET /login`
- `GET /set-password`
- `POST /api/auth/login`
- `POST /api/auth/request-password-setup`
- `POST /api/auth/set-password`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/config`
- `GET /api/config/status`
- `GET /api/setup-health`
- `GET /api/health`
- `GET /health`

Executive expectation:

- Sign-in should feel invisible once working.
- If a session expires, drawers should explain that protected data needs a fresh login instead of looking broken.

Audit result:

- Session recovery messaging exists in key drawers.
- Security/privacy controls are present.
- No visual changes made.

### 2. Home Page / Executive Briefing

Primary responsibilities:

- Build the six-card executive briefing.
- Rank what changed, highest leverage move, people, projects, momentum, and ready-for-you items.
- Keep cards source-backed and evidence-aware.
- Open premium drawers.
- Route card actions into tasks, drafts, decisions, memory, or evidence review.

Key routes:

- `GET /api/executive-briefing`
- `POST /api/homepage-cards/action`
- `POST /api/val/intelligence`
- `POST /api/val/intelligence/backfill`
- `POST /api/val/chat`

Key frontend:

- `command-center.js`
- `dashboard.html`

Executive expectation:

- The home page should answer: "What matters, why, what should I do, and what changed?"
- Empty states should feel calm and alive, not broken.
- Cards should never invent work from unsupported noise.
- Every card should give a path to action.

Audit result:

- Card action endpoint supports tasks, drafts, decisions, memory, attachment requests, and review actions.
- Contextual command chat now acts on card context.
- Tests confirm homepage card contract and workspace rendering.

Remaining product opportunity:

- The homepage drawers should eventually show created artifacts inline after action completion. Currently many actions are saved correctly, but the drawer does not always refresh its own object list immediately.

### 3. Global Chat and Contextual Chat

Primary responsibilities:

- Answer general executive questions.
- Use dashboard state, memory, uploaded docs, Google Docs, GHL context, and executive briefing context.
- Create tasks from model responses when appropriate.
- Prepare external action packets for GHL actions.
- Handle inbox search commands.
- Handle calendar/task scheduling prompts.
- Handle document rewrite requests.
- Store conversations.

Key route:

- `POST /api/val/chat`

Executive expectation:

- Chat should not be a "discussion only" surface.
- Any chat should be able to close loops, create tasks, draft emails, update context, and pull source evidence.
- External actions should require approval.

Audit result:

- The global chat already had broad context access.
- Contextual action handling was incomplete and is now patched.
- Presence mode still protects external actions.

Remaining product opportunity:

- Chat should eventually expose clear receipts in the UI for every created object: task ID, draft ID, project drawer, evidence source.
- Transcript-specific chat still has separate logic and should continue converging with the global command behavior.

### 4. Transcripts

Primary responsibilities:

- Receive Krisp/webhook transcripts.
- Accept uploads and historical transcript imports.
- Store raw transcript data before processing.
- Create transcript index rows.
- Generate summaries, participants, tasks, contact updates, decisions, and evidence.
- Stage tasks for approval instead of blindly dumping them into Actions.
- Support transcript-specific chat.
- Generate meeting recap drafts.
- Recover usable transcript-shaped content from older storage.
- Filter out non-transcripts and Jessa-specific bad artifacts.

Key routes:

- `GET /api/val/transcripts`
- `GET /api/val/transcripts/:transcriptId`
- `GET /api/val/transcripts/review`
- `GET /api/val/transcripts/intake-status`
- `POST /api/val/transcripts`
- `POST /api/val/transcripts/:transcriptId/chat`
- `POST /api/val/transcripts/:transcriptId/actions`
- `POST /api/val/transcripts/tasks/:taskId/approve`
- `POST /api/val/transcripts/participants/:participantId/approve`
- `POST /api/val/transcripts/contact-updates/:updateId/approve`
- `POST /api/val/transcripts/repair`
- `POST /api/val/transcripts/reprocess`
- `POST /api/val/transcripts/process`
- `POST /api/val/transcripts/recover-existing`
- `DELETE /api/val/transcripts/clear-all`

Executive expectation:

- Transcripts should become accurate summaries, tasks with assignees, relationship context, project updates, and evidence.
- The system should distinguish transcript text from generated notes.
- If the user asks chat to create tasks from a transcript, those tasks should be actionable and not weird excerpts.

Audit result:

- Transcript regression suite passes.
- Artifact cleanup is scheduled again.
- The core pipeline is source-backed and review-gated.

Remaining product opportunity:

- The transcript import task extractor still needs to fully match the quality of transcript chat's "list tasks and assignees" behavior. This is the central launch-critical intelligence quality area.
- Krisp note/action-item payloads should be inspected on the next real webhook arrival to see if we can trust Krisp's structured action items before falling back to model extraction.

### 5. Actions / Tasks / Calendarization

Primary responsibilities:

- Store durable tasks.
- Merge calendar block metadata.
- Suggest protected work blocks.
- Calendarize tasks as private busy blocks.
- Complete tasks while preserving source evidence.
- Ingest tasks from chat, transcript review, project drawers, homepage cards, and contextual commands.

Key routes:

- `GET /api/val/tasks`
- `POST /api/val/tasks`
- `PUT /api/val/tasks`
- `DELETE /api/val/tasks/:id`
- `GET /api/val/tasks/open-loops`
- `POST /api/val/tasks/:id/suggest-time`
- `POST /api/val/tasks/:id/calendarize`
- `POST /api/val/tasks/:id/complete`

Executive expectation:

- Actions should be the place where open loops become manageable.
- Tasks should have enough context to be useful: person, project, source, why it matters, and next move.
- Calendarization should not surprise invite people or create meeting links.

Audit result:

- Calendarized task tests pass.
- Private busy-block behavior is covered.
- Contextual chat now creates tasks from card/project/contact context.

Remaining product opportunity:

- Task objects need a richer "assignee" field across all creation paths, not only `contactName`.
- Actions should show source receipts more consistently when created from transcript chat.

### 6. Executive Inbox / Gmail / Drafts

Primary responsibilities:

- Sync active Gmail inbox.
- Search Gmail/Outlook with natural language.
- Classify inbox items.
- Prepare reply drafts.
- Save Gmail drafts.
- Send approved Gmail drafts.
- Preserve reply-all recipients.
- Learn from draft edits.
- Store internal drafts for approval.
- Let user set draft standards.

Key routes:

- `GET /api/email/intelligence`
- `POST /api/email/gmail/refresh`
- `POST /api/email/inbox-command`
- `POST /api/email/inbox-command/action`
- `POST /api/email/actions`
- `GET /api/email/rules`
- `POST /api/email/rules`
- `PATCH /api/email/rules/:id`
- `GET /api/val/drafts`
- `POST /api/val/drafts`
- `PATCH /api/val/drafts/:id`
- `GET /api/val/draft-standards`
- `PUT /api/val/draft-standards`
- `POST /api/gmail/drafts`
- `POST /api/gmail/send-approved-draft`

Executive expectation:

- Drafts should default to reply-all in the original thread.
- The user should approve before anything sends.
- VAL should learn the user's writing style from edited drafts.
- The inbox should be a command center, not a list of raw email.

Audit result:

- Gmail freshness suite passes.
- Inbox Command suite passes after updating the approved-send contract.
- Approved send now explicitly requires `approved:true`.

Remaining product opportunity:

- Drafts drawer currently shows drafts cleanly but still needs richer approve/save/send affordances across all draft sources. This is functional UI, not visual polish.

### 7. Relationships

Primary responsibilities:

- Build relationship review from evidence.
- Separate owner identity from external participants.
- Track VIP, cooling, momentum, forgotten commitments, suggested introductions, and drafts.
- Accept relationship actions: snooze, mark not important, create task, draft message, contact timeline.
- Pull contact context from email, transcripts, memory, CRM, and calendar.

Key routes:

- `GET /api/relationships/review`
- `POST /api/relationships/actions`
- `POST /api/val/context/resolve-contact`
- `GET /api/val/contacts/:contactId/timeline`

Executive expectation:

- Relationships should explain who matters, why now, what changed, and the next thoughtful action.
- The drawer should support "tell VAL more about this person."
- The user should be able to create a task or draft without leaving the relationship context.

Audit result:

- Relationship regression suite passes.
- Contextual chat now supports memory updates and task creation when given contact context.

Remaining product opportunity:

- Relationship drawer data hierarchy can still become more actionable by showing a clearer "what VAL knows / what VAL needs / what to do next" structure.
- Contact-specific chat should be wired directly into relationship memory and timeline receipts.

### 8. Projects

Primary responsibilities:

- Build a project cabinet.
- Keep project drawers for GOALL, HopeMakers, Grace Intelligence, VAL, Help by Shopping, and discovered project files.
- Group tasks, updates, documents/memory, conversations, transcripts, email, and drafts by project.
- Let the user save project context.
- Let VAL answer project questions and draft updates.

Key route:

- `GET /api/projects/cabinet`

Executive expectation:

- Projects should feel like a filing cabinet, not a generic status summary.
- Opening a project should show all source-backed updates, agreements, tasks, documents, conversations, and next moves.
- The user should be able to ask "what is missing?" and update the project context.

Audit result:

- Project cabinet exists and pulls from multiple data stores.
- Contextual chat can now add project context, create project tasks, and draft updates when called with context.

Remaining product opportunity:

- Project matching is heuristic. It should eventually use stronger project IDs and explicit user corrections to prevent cross-filing.
- Documents by project need deeper integration with Google Docs and attachments.

### 9. Evidence / Trust Center

Primary responsibilities:

- Show source receipts.
- Explain VAL's interpretation.
- Show confidence and corrections.
- Allow evidence corrections.
- Build evidence from existing transcripts.

Key route:

- `GET /api/evidence/review`

Executive expectation:

- Evidence should create trust by showing "what VAL saw" and "how VAL interpreted it."
- The user should be able to correct wrong associations.

Audit result:

- Evidence drawer exists and has source receipt patterns.
- Homepage card action can log evidence review and correction decisions.
- Contextual chat can show attached evidence/source IDs.

Remaining product opportunity:

- Evidence is still early compared with Home and Projects. It needs a fuller receipt browser and correction workflow.

### 10. Documents / Google Docs / Uploaded Files

Primary responsibilities:

- Upload readable files.
- Store knowledge documents and transcript uploads.
- Process uploaded transcript files through transcript intelligence.
- Create, read, update, and rewrite Google Docs.
- Support Michele book/editor workflows.
- Store templates and meeting recap drafts.

Key routes:

- `POST /api/val/files`
- `GET /api/google/docs/status`
- `POST /api/google/docs/create`
- `POST /api/google/docs/update`
- `POST /api/google/docs/read`
- `POST /api/google/docs/rewrite`
- `GET /api/google/docs/search`
- `GET /api/val/templates/:templateKey`
- `PUT /api/val/templates/:templateKey`
- Michele book/editor routes under `/api/michele/book/*`

Executive expectation:

- Documents should be organized by project.
- VAL should retrieve relevant docs and attachments.
- VAL should create documents and save them where the user can find them.

Audit result:

- Uploaded files and Google Docs are available to chat/model context.
- Transcript uploads can enter transcript intelligence.

Remaining product opportunity:

- Email attachment retrieval and project-based document organization are not fully mature.
- Document folder UI still needs a real project document cabinet behavior.

### 11. Calendar / Meetings / Presence

Primary responsibilities:

- Read calendar sidebar and full calendar.
- Prepare meeting intelligence and meeting briefings.
- Process after-meeting context.
- Support voice and meeting mode.
- Calendarize tasks safely.

Key routes:

- `GET /api/calendar`
- `GET /api/calendar/sidebar`
- `POST /api/val/meeting-intel`
- `POST /api/val/meeting-briefing`
- `GET /api/meetings`
- `POST /api/val/meetings/:meetingId/process-after-meeting`
- `GET /api/val/voice/status`
- `POST /api/val/voice/test`
- `POST /api/val/tts`
- `POST /api/presence/session`

Executive expectation:

- VAL should know the day, protect capacity, and turn tasks into time.
- VAL should not surprise-add guests or links to calendarized task blocks.

Audit result:

- Calendarized task tests pass.
- Presence mode contract tests pass.

Remaining product opportunity:

- Chat command "create a calendar appointment" currently creates an internal scheduling action unless a confirmed calendarize flow is used. This is safe, but should become a clearer guided flow.

### 12. GHL / CRM / Leads

Primary responsibilities:

- Access contacts, tasks, notes, conversations, opportunities, pipelines, payments, blogs, email templates, and social posts.
- Prepare external action packets for approval before touching GHL.
- Research, discover, enrich, preview, and import leads.
- Support employer and partner scraping workflows.

Key route families:

- `/api/ghl/*`
- `/api/val/ghl/action`
- `/api/val/ghl/actions`
- `/api/val/os/external-action-packets/:id/approve`
- `/api/val/leads/*`
- `/api/val/partners/*`

Executive expectation:

- VAL should use CRM context as a source of truth.
- External CRM changes should be approved and have receipts.

Audit result:

- External action packet pattern is present.
- Lead flows are route-complete.

Remaining product opportunity:

- LinkedIn context is referenced as future/partial.
- External action receipts should be shown more consistently in the UI.

### 13. Teach VAL / Onboarding

Primary responsibilities:

- Start and reset onboarding.
- Interview the user.
- Accept voice turns.
- Import source insights.
- Review and edit extracted items.
- Commit onboarding memory.
- Upload old transcripts into the transcript pipeline.

Key routes:

- `GET /api/teach-val/onboarding`
- `POST /api/teach-val/onboarding/start`
- `POST /api/teach-val/onboarding/:id/reset`
- `PATCH /api/teach-val/onboarding/:id`
- `POST /api/teach-val/onboarding/:id/voice-turn`
- `POST /api/teach-val/onboarding/:id/interview`
- `POST /api/teach-val/onboarding/:id/imports/:category`
- `PATCH /api/teach-val/onboarding/:id/imports/:importId/items/:itemId`
- `POST /api/teach-val/onboarding/:id/source-insights`
- `POST /api/teach-val/onboarding/:id/commit`

Executive expectation:

- Teach VAL should feel like setting context once so the system keeps improving.
- Uploaded old transcripts should become evidence, not clutter.

Audit result:

- Teach VAL memory regression passes.
- Transcript upload from Teach VAL is covered.

### 14. Security, Settings, API Keys

Primary responsibilities:

- Manage tenant API keys.
- Store encrypted integration credentials.
- Show privacy center.
- Support audit logs, support access, session revocation, data export, and delete-my-data.
- Control Dashboard Studio beta settings and deployment history.

Key routes:

- `/api/security/privacy-center`
- `/api/security/audit-log`
- `/api/security/support-access`
- `/api/security/export`
- `/api/security/delete-my-data`
- `/api/tenant-api-keys/*`
- `/api/integrations/credentials`
- `/api/integrations/test/:provider`
- `/api/dashboard-studio/*`

Executive expectation:

- Trust requires clear controls for data, keys, support access, and deletions.

Audit result:

- Security/privacy tests pass.
- Dashboard Studio beta tests pass.

## Executive UX Assessment

### What feels intuitive

- Home page cards now have a clear executive purpose.
- Drawers are the right interaction model for premium workflows.
- Projects as a cabinet is the correct metaphor.
- Relationship Review is valuable when it surfaces context and next actions.
- Draft approval, reply-all preservation, and style learning match executive expectations.
- Calendarized tasks as private blocks are a strong capacity-protection model.

### What still risks overwhelming an executive

- Too many surfaces can initiate chat, but not every chat historically performed actions the same way. The new contextual command handler reduces that mismatch, but unification should continue.
- Transcript intelligence quality is the highest trust lever. If imported transcript tasks are poor, the user loses confidence even when transcript chat can reason well.
- Evidence is still conceptually powerful but not yet as finished as Home, Projects, and Drawers.
- Drafts and Documents need to feel less like storage and more like executive approval/filing workflows.

### What an overwhelmed executive expects VAL to do

- Tell me what changed.
- Tell me why it matters.
- Tell me what I should do next.
- Make the task for me.
- Draft the message for me.
- Put time on my calendar, but do not surprise anyone.
- Remember what I just told you.
- File this under the right project.
- Show me the source if I ask why.
- Let me approve anything external.

That is the product standard I used for this audit.

## Verification

Commands run:

- `node --check server.js`
- Inline `dashboard.html` script parse check
- `node test/calendarizedTasks.test.js`
- `node test/dashboardStudioBeta.test.js`
- `node test/executiveBriefing.test.js`
- `node test/gmailFreshness.test.js`
- `node test/homepageCards.test.js`
- `node test/inboxCommand.test.js`
- `node test/intelligenceBackfill.test.js`
- `node test/presenceModeContract.test.js`
- `node test/relationshipReviewRegression.test.js`
- `node test/securityPrivacyCenter.test.js`
- `node test/teachValOnboardingMemory.test.js`
- `node test/transcriptIntelligenceIndex.test.js`
- `node test/transcriptTabRegression.test.js`
- `node test/voiceIntegrationRegression.test.js`

Result:

- All local regression tests pass.
- Server syntax passes.
- Dashboard inline scripts parse.

## Recommended Next Launch Priorities

1. Transcript import intelligence parity

Make the automatic transcript task extractor produce the same quality as "Chat about this transcript: list tasks and assignees." This is the most mission-critical functional gap.

2. Unified action receipts

Every chat-created task, draft, memory update, schedule request, project note, or evidence correction should show a clear receipt and destination.

3. Documents by project

Turn Documents into the project document cabinet: uploaded files, Google Docs, email attachments, generated docs, and source URLs grouped by project.

4. Evidence Trust Center

Continue turning Evidence into a receipt and correction workspace. It should be the place a skeptical executive goes to trust VAL.

5. Draft approval queue maturity

Let every draft source move through the same flow: review, edit, save Gmail draft, approve-send, learn style, and log receipt.

6. Calendar appointment flow

Build a guided "schedule this" flow that can create internal scheduling tasks first, then let the user approve real calendar blocks or meetings with clear attendees.

## Bottom Line

Jessa_VAL has the right architecture for an executive AI operating system. The biggest launch principle is consistency: every surface should either inform, create, schedule, draft, remember, file, or show evidence. After this pass, contextual chat now follows that principle more closely, transcript artifact cleanup is restored, and approved Gmail sending is safer.

The remaining launch-critical work is not visual. It is intelligence quality and workflow unification, especially around transcript-derived tasks, documents, and evidence receipts.
