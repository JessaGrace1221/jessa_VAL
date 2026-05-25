# VAL User Guide

VAL is an Executive Velocity Layer. It is designed to listen, remember, organize, prioritize, and convert conversations into operational movement. Users can chat with VAL, save meeting transcripts, create tasks, draft documents, review pipeline activity, inspect follow-ups, search memory, and use calendar context to prepare for meetings or review past ones.

This guide documents the major functions available in the VAL web app and the supporting backend routes.

## What's New

### Relationship Radar

What you can do with it: see the highest-priority relationships that need attention right now, including people tied to revenue, referrals, partnerships, trust, or promised follow-up.

How this helps: VAL keeps valuable relationships from going cold just because the user had a full day and too many conversations to mentally track.

### Pre-Meeting Brief

What you can do with it: prepare for the next meeting as if it starts in 15 minutes. VAL reviews attendees, prior context, open promises, likely objectives, relationship risks, and suggested talking points.

How this helps: the user walks into important conversations prepared, confident, and clear on the best next move.

### Approval Queue

What you can do with it: open one place where VAL keeps drafts that need review before sending, including follow-ups, emails, proposals, notes, and other approval-ready messages.

How this helps: VAL can move quickly without losing user control. Nothing important gets buried in chat, and the user can approve, revise, copy, or send when ready.

### Contact Command Center

What you can do with it: ask VAL for a person or company view that groups the relationship summary, meetings, tasks, notes, promises, opportunities, and next moves.

How this helps: the user does not have to reconstruct the relationship from memory before every call or follow-up.

### Integrity Tracker

What you can do with it: ask VAL to show open promises and commitments by person.

How this helps: it protects trust. The user can see what needs closure without relying on mental memory at the end of a packed day.

### Daily Executive Rhythm

What you can do with it: use VAL for morning briefing, midday check-in, end-of-day wrap, and tomorrow prep.

How this helps: the day has a clear rhythm. VAL keeps relationships, follow-ups, approvals, meetings, and tasks moving without overwhelming the user.

### Use My Saved Time

What you can do with it: ask VAL what high-impact work deserves the time, energy, and mental space it has freed up.

How this helps: the user does not just become more efficient. They redirect saved time into revenue, authority, strategic thinking, recovery, creativity, or high-value relationships.

### Tell Me About Yourself

What you can do with it: start a dedicated onboarding conversation where VAL asks thoughtful questions about the user, their business, relationship network, decision patterns, working style, voice, boundaries, and goals.

How this helps: VAL becomes more personal and useful faster. The user can also upload business plans, personality profiles, DISC reports, brand voice docs, offers, sales process notes, strategic plans, or other personal operating documents.

### Executive Review

What you can do with it: click Executive Review and VAL will draft follow-ups first, prep the next meeting second, and clean up the task list third.

How this helps: it gives the user a clear sequence instead of a pile of information. The goal is fast approval, not another report.

### Smarter Meeting Intelligence

What you can do with it: click a calendar meeting and VAL will look at the attendees, meeting title, description, saved notes, related tasks, and available profile data.

How this helps: meeting prep becomes specific. VAL can surface who is attending, what matters, what to say, and what relationship context is useful.

### LinkedIn And Relationship Context

What you can do with it: when RocketReach and Outscraper are connected, VAL can look for attendee profile details, recent LinkedIn activity, connection counts, and mutual connection context.

How this helps: the user walks into meetings with timely relationship signals instead of generic prep notes.

### Opportunity Creation From Meetings

What you can do with it: in Jessa VAL, new calendar attendees can be added to GoHighLevel as contacts and given an open opportunity. If the value is unknown, VAL uses $7,500.

How this helps: new relationship momentum gets captured automatically. The user does not have to remember to create pipeline records after every meeting.

### More Stable Voice Chat

What you can do with it: speak to VAL with fewer interruptions and fewer repeated spoken replies.

How this helps: voice mode feels less jumpy. VAL waits longer before deciding the user is finished speaking and avoids repeating the same spoken answer.

### More Natural Writing

What you can do with it: ask VAL for messages, strategy, briefs, and drafts that sound less like AI.

How this helps: outputs are easier to trust, edit, and send. VAL avoids em dashes, generic filler, over-polished phrasing, and customer-support style responses.

## 1. Core Concept

VAL is not meant to behave like a blank chatbot. It is designed to act as a private executive operating layer that:

- remembers conversations, transcripts, documents, and user context
- tracks tasks, commitments, follow-ups, proposals, and pipeline movement
- detects overload, capacity drift, and unfinished loops
- helps decide what should happen next
- drafts messages, proposals, scopes, agreements, and social posts
- converts meetings into notes, tasks, decisions, and follow-up actions
- connects with GoHighLevel, Google Calendar, Gmail, Make.com, and the VAL memory store

VAL's current durable memory layer is the app database. Pinecone is legacy context from the original architecture and is no longer required for the main chat, task, transcript, or file-memory flows.

## 2. Main Screens

### Command Center

The Command Center is the primary dashboard. It shows the current operational state across meetings, tasks, follow-ups, pipeline, proposals, and recent activity.

Users can use it to:

- see meetings for today
- see open action items
- see overdue or high-priority tasks
- view unread follow-ups
- review active and stalled pipeline deals
- see proposals in draft, sent, viewed, or signed states
- start a focused command with VAL
- jump into chat, meeting mode, posting, or document creation

### Workspace Sidebar

The left sidebar organizes the system into workspaces and views.

Common workspace items:

- Dashboard: returns to the main command view
- Daily Briefing: asks VAL for the day overview
- Meetings: asks VAL to summarize today's and upcoming meetings
- Tasks: asks VAL to review overdue and open tasks
- Pipeline: asks VAL to review active opportunities and next actions
- Followups: asks VAL to review unread conversations and open loops
- Recent Threads: loads saved chat sessions
- New Session: starts a clean conversation

Pinned workspaces can represent important client, project, or business contexts.

### Detail Panel

The right side of the interface shows contextual details such as:

- weekly calendar events
- meeting details
- related meeting notes
- related tasks
- pipeline activity
- document review panels
- task detail panels
- action chips generated by VAL

## 3. Chat and Command Input

The main input box can be used like a normal chat, but it also recognizes operational commands.

Users can:

- ask VAL general questions
- ask for strategy
- ask what to do next
- create tasks
- draft documents
- search memory
- review meetings
- review pipeline
- start meeting mode
- generate images
- upload files
- ask for weekly or monthly accountability

Press Enter to send. Use Shift+Enter for a new line.

## 4. Quick Actions

### Draft Follow-Up to Latest Lead

Creates a ready-to-send follow-up message based on the newest lead, recent conversations, or pipeline context.

Use when:

- a new lead has come in
- someone needs a timely response
- the user wants VAL to write a warm, direct follow-up

### Start My Day

Asks VAL to produce an executive daily briefing.

Typical output includes:

- today's highest-leverage priority
- upcoming meetings
- open tasks
- risks or overload patterns
- follow-ups that need attention
- recommended sequence for the day

### What Should I Do Now?

Asks VAL to choose the next best action using dashboard, task, pipeline, meeting, and memory context.

VAL should help distinguish:

- urgent from important
- revenue-generating from administrative
- strategic from reactive
- completion work from expansion work

### Follow-Up Radar

Asks VAL to scan for people, commitments, conversations, or deals that need attention.

Use when:

- the user suspects something is slipping
- follow-ups are scattered across conversations
- pipeline momentum needs protection
- client or lead communication needs review

### Executive Review

Runs a focused executive review in the order that matters most:

1. Draft all follow-ups first.
2. Prep for the next meeting.
3. Clean up the task list.

Use when:

- the user needs VAL to reduce the mental pile quickly
- follow-ups, meetings, and tasks are all competing for attention
- the user wants approval-ready drafts and a short next-step sequence
- the priority is action, not analysis

## 5. Natural Language Commands

VAL recognizes many natural commands. The user does not need exact wording.

### Task Commands

Examples:

- "Add a task"
- "Create task"
- "New task"
- "Show my tasks"
- "What tasks are overdue?"
- "Review my action items"
- "Prioritize my tasks"
- "What should I do first?"

What happens:

- VAL starts the add-task flow or task review flow
- tasks are saved locally first and then synced to the backend
- tasks remain after refresh when the backend is available
- task detail can be opened, edited, brainstormed, or completed

### Meeting Commands

Examples:

- "Show my meetings"
- "What's on my calendar?"
- "Meeting mode"
- "Meeting mode off"
- "Summarize this meeting"
- "What do I need to know before this meeting?"

What happens:

- VAL pulls meeting and calendar context
- Meeting Mode can listen for live transcript content
- calendar events can be clicked for prep or past-meeting review
- saved transcripts and related tasks are searched for context

### Document Commands

Examples:

- "Draft a proposal"
- "Write an agreement"
- "Create a contract"
- "Make an invoice"
- "Draft an email to Sarah"
- "Write a follow-up email"

What happens:

- VAL starts the document drafting flow
- VAL asks for title, recipient, email, and key points as needed
- VAL may look up contact matches
- the draft opens in a review panel
- users can revise, copy, approve, or send

### Communication Commands

Examples:

- "Show my comms"
- "Open my inbox"
- "Check conversations"
- "Who needs a reply?"
- "Draft replies for unread messages"

What happens:

- VAL reviews GHL conversations and unread messages
- VAL summarizes the context
- VAL drafts suggested replies in the user's voice

### Pipeline Commands

Examples:

- "Show my pipeline"
- "Review active deals"
- "Which deals are stalled?"
- "Who should I follow up with?"

What happens:

- VAL pulls active opportunities from GHL
- VAL identifies stage, value, age, and stall risk when available
- VAL recommends next actions by deal

### Memory Commands

Examples:

- "Search memory for DISC"
- "Find in memory the notes about Ed"
- "What do you remember about this client?"
- "Search the document vault"
- "What did we decide last time?"

What happens:

- VAL searches saved memory items, transcript summaries, uploaded documents, and saved chat context
- VAL returns relevant context and can synthesize an answer

### Weekly and Monthly Review Commands

Examples:

- "Weekly review"
- "Review my week"
- "Monthly synthesis"
- "What created leverage this month?"

What happens:

- VAL reviews movement, stalls, avoidance, overload, leverage, attention fragmentation, and next highest-leverage moves
- patterns can be carried forward into memory

### Mode Commands

Examples:

- "Focus mode"
- "Strategy mode"
- "Operations mode"
- "Meeting mode"

What happens:

- VAL changes its working frame
- the interface can update the active mode buttons
- responses become more targeted to the selected operating lens

## 6. Tasks and Action Items

### Add a Task

Users can add tasks from the chat input or action buttons.

The task flow asks for:

- task title
- due date or no date

Once created, the task appears in Action Items and is saved to the VAL task store.

### Task Persistence

Tasks are designed to survive page refreshes.

Flow:

1. The task is added in the browser immediately.
2. VAL syncs it to `/api/val/tasks`.
3. On refresh, the app reloads tasks from the backend.
4. If the backend is unavailable, the browser copy can still display local tasks temporarily.

### Open Task Detail

Opening a task detail allows the user to:

- see task title and due date
- add or review notes
- ask VAL to brainstorm the task
- mark the task complete
- move to the next task in a review sequence

### Task Review

The task review walkthrough presents tasks one at a time.

For each task, VAL can:

- explain why it matters
- suggest the next action
- draft a message
- propose CRM updates
- create talking points
- help decide whether to do, delegate, defer, or delete

## 7. Meetings and Calendar

### Calendar Summary

The calendar panel shows upcoming Google Calendar events.

Users can:

- view the week
- open a full calendar view
- click an event for details
- ask VAL for meeting prep
- review past meeting notes

### Full Calendar View

The Full View button opens a larger calendar experience.

Users can inspect:

- event title
- date and time
- attendees if available
- meeting status
- linked memory or task context

### Click a Meeting

When a user clicks a meeting, VAL searches for related context.

For upcoming meetings, VAL can provide:

- prep notes
- known client context
- attendee intelligence from calendar attendees, RocketReach, and Outscraper when configured
- recent LinkedIn post context when available
- connection count and mutual connection context when available from the data provider
- GoHighLevel opportunity status for new attendees in Jessa VAL
- suggested agenda
- risks or open loops
- questions to ask

For past meetings, VAL can provide:

- transcript summary
- tasks created from that meeting
- decisions
- follow-up drafts
- commitments
- unresolved loops

### Google Calendar Connection

Google Calendar uses OAuth. The backend stores refresh tokens so the user should not need to reconnect repeatedly.

If the app says Google is disconnected:

- use the Connect Google button
- complete the Google OAuth screen
- confirm `/auth/status` shows connected
- check that the production environment has `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and the correct redirect URI

## 8. Voice and Meeting Mode

### Voice

Voice mode allows the user to speak to VAL.

Depending on browser support and configured services, VAL can:

- capture speech
- send speech as chat input
- respond conversationally
- speak back using text-to-speech
- wait longer before cutting off a spoken thought
- avoid repeating the same spoken reply

### One-Shot Mic

The mic button can capture a single spoken command.

Use it for:

- quick task creation
- quick questions
- dictating a message
- asking what to do next

### Meeting Mode

Meeting Mode is designed for live meetings.

When Meeting Mode is on:

- VAL listens quietly
- the user can say "VAL" to engage
- VAL can answer, summarize, or capture context
- saying "meeting mode off" stops the mode

When Meeting Mode stops, the transcript can be saved to VAL memory so it can be used later for tasks, notes, meeting summaries, and follow-up recommendations.

## 9. Memory

### What VAL Remembers

VAL can save and retrieve:

- chat history
- uploaded documents
- meeting transcripts
- transcript summaries
- extracted action items
- decisions
- follow-up drafts
- user context
- client or project context
- sent document history

### Save Chat

The Save button stores the current conversation as a saved VAL conversation.

Saved chats can be reloaded from recent threads and searched later as memory.

### Auto-Save

The app can auto-save chat memory as the conversation grows. This protects useful context from disappearing when the browser is refreshed.

### Search Memory

Memory search finds relevant saved records using keywords and relevance scoring.

Search works best when the user includes:

- person name
- company or project name
- meeting topic
- date or rough timeframe
- document type
- decision or commitment

Examples:

- "Search memory for Westwood pricing."
- "What did Ed decide about the proposal?"
- "Find the DISC notes about my communication style."

## 10. File Uploads and Knowledge Documents

Users can upload documents into VAL memory.

Supported file types include:

- TXT
- Markdown
- HTML
- JSON
- CSV
- PDF
- DOCX

What happens:

1. The file is uploaded through the chat attachment control.
2. The backend extracts readable text.
3. Long documents are split into memory chunks.
4. Each chunk is saved with metadata.
5. VAL can search and use that document context in later answers.

Use this for:

- operating manuals
- DISC profiles
- client notes
- strategy documents
- meeting notes
- brand voice documents
- proposals or scopes

## 11. Image Analysis and Image Generation

### Image Analysis

When a user uploads an image, VAL can analyze it.

Modes may include:

- general analysis
- brand review
- marketing review
- screenshot review

Use it for:

- reviewing website screenshots
- checking design or copy
- analyzing brand assets
- interpreting a visual reference

### Image Generation

VAL can send image-generation requests when the user asks to generate, create, make, or design an image.

Examples:

- "Generate an image for this campaign."
- "Create a clean executive brand image."
- "Design a visual concept for this post."

The backend sends the prompt to the configured OpenAI image model.

## 12. Documents, Proposals, Emails, and Sending

### Draft Documents

VAL can draft:

- proposals
- scopes
- agreements
- contracts
- invoices
- quotes
- emails
- follow-up messages

The drafting flow collects:

- document type
- topic or title
- recipient name
- recipient email
- key points, terms, pricing, or context

### Recipient Confirmation

Before sending, VAL should confirm the recipient email.

If one contact match is found, VAL asks for confirmation.

If multiple matches are found, VAL asks which email should be used.

If no match is found, VAL asks the user to enter the email address.

### Review Panel

Drafted documents open in a review panel where users can:

- read the full draft
- request revisions
- copy the text
- approve the document
- send the document through the configured send flow

### Revisions

When users ask for edits, VAL should regenerate the full document rather than patching only part of it. This keeps proposals, emails, and scopes coherent.

### Sending

Sending can use a Make.com webhook or another configured delivery path.

When a document is approved and sent:

- the content can be sent to the automation layer
- the sent document can be saved into VAL memory
- the interaction can be used for future follow-ups

## 13. Communication Queue

The Communication Queue pulls unread or relevant conversations from GHL.

Users can:

- see who needs a reply
- review unread messages
- ask VAL to draft responses
- inspect the context of each conversation

VAL should prioritize:

- revenue-related communication
- client delivery communication
- unresolved questions
- high-intent leads
- delayed responses

## 14. Pipeline

The Pipeline view pulls opportunity data from GHL.

Users can:

- review active deals
- see stalled opportunities
- identify next actions
- ask VAL who should be followed up with
- ask VAL to draft follow-up messages

VAL should help the user protect momentum and avoid vague pipeline review. The goal is always a specific next action.

## 15. Proposals

The Proposals view pulls proposal/document status from GHL when available.

Statuses can include:

- draft
- sent
- viewed
- signed or completed

VAL can help answer:

- which drafts need to be finished
- which sent proposals need follow-up
- which viewed proposals should be acted on now
- which signed proposals require onboarding or next steps

## 16. Social Post Tool

The Post button opens the social post tool.

Users can:

- choose platforms such as LinkedIn, Instagram, Facebook, X / Twitter, or Threads
- choose a tone
- paste a topic, story, insight, or announcement
- generate a post in the user's voice
- edit the draft
- copy the draft
- send the draft to the configured automation

Available tones include:

- Authoritative
- Motivational
- Conversational
- Story-driven
- Educational

## 17. General Chat Modal

The Chat button opens a cleaner general chat window.

Use it for:

- strategy conversations
- writing help
- coding questions
- analysis
- brainstorming
- business decisions

This chat is intentionally separate from the denser dashboard experience.

## 18. Backend and Webhook Reference

This section is for admins, builders, and automation setup.

### Health and App

`GET /`

Returns a simple status response confirming the proxy is running.

`GET /dashboard`

Serves the VAL funnel HTML file when hosted by the backend.

### Google Auth

`GET /auth/google`

Starts the Google OAuth flow.

`GET /auth/callback`

Receives the Google OAuth callback and stores tokens.

`GET /auth/status`

Returns whether Google is connected and whether a refresh token is available.

### Google Data

`GET /api/google/calendar`

Returns upcoming Google Calendar events.

`GET /api/google/gmail`

Returns recent unread Gmail messages matched against GHL contacts where possible.

### Dashboard Data

`GET /api/meetings`

Returns today's meetings from GHL and Google Calendar when connected.

`GET /api/calendar`

Returns Google Calendar events for the upcoming date window used by the calendar panel.

`GET /api/tasks`

Returns task data from GHL where available.

`GET /api/pipeline`

Returns active opportunities and stalled deal context from GHL.

`GET /api/proposals`

Returns proposal/document status from GHL where available.

`GET /api/comms`

Returns conversation and communication queue data from GHL.

`GET /api/feed`

Returns a combined activity feed from conversations, opportunities, tasks, and meetings.

`GET /api/conversation/:id`

Returns messages for a specific GHL conversation.

### VAL Tasks

`GET /api/val/tasks`

Returns saved VAL tasks for the current VAL user.

`POST /api/val/tasks`

Creates a task.

Common body fields:

- `title`
- `notes`
- `dueDate`
- `source`

`PUT /api/val/tasks`

Updates a task.

Common body fields:

- `id`
- `title`
- `notes`
- `dueDate`
- `completed`

`DELETE /api/val/tasks/:id`

Deletes a task.

### VAL Chat

`POST /api/val/chat`

Sends a chat message to VAL.

Common body fields:

- `message`
- `messages`
- `context`
- `conversationId`

This route:

- searches memory for relevant context
- includes recent task and conversation context
- calls the configured OpenAI chat model
- saves user and assistant messages

### VAL Intelligence

`POST /api/val/intelligence`

Runs specialized executive intelligence actions.

Common action values:

- `daily_command`
- `what_now`
- `followup_radar`
- `weekly_review`
- `task_intelligence`
- `relationship_briefing`
- `project_space`
- `memory_search`

Common body fields:

- `action`
- `query`
- `context`

### VAL Transcripts

`POST /api/val/transcripts`

Receives transcripts from a transcription app, Make.com, or another automation.

Common body fields:

- `transcript`
- `text`
- `title`
- `source`
- `contactId`
- `contactEmail`
- `project`
- `date`
- `metadata`
- `process`

If `process` is true, VAL also processes the transcript into summary, tasks, decisions, follow-up drafts, and memory items.

`POST /api/val/transcripts/process`

Processes transcript text directly.

Common body fields:

- `transcript`
- `title`
- `source`
- `metadata`

### VAL Memory

`POST /api/val/memory`

Saves a memory item.

Common body fields:

- `kind`
- `summary`
- `rawText`
- `metadata`

`GET /api/val/memory/search?q=search terms`

Searches memory items for relevant saved context.

### VAL Files

`POST /api/val/files`

Uploads a document into VAL memory.

Request type:

- multipart form data

Common fields:

- `file`
- `title`
- `source`
- `project`
- `contactId`
- `contactEmail`
- `metadata`

### VAL Conversations

`POST /api/val/conversations`

Saves or creates a VAL conversation.

`GET /api/val/conversations`

Lists saved VAL conversations.

`GET /api/val/conversations/:id/messages`

Returns messages for a saved VAL conversation.

### Image Routes

`POST /api/analyze-image`

Analyzes an uploaded or provided image.

`POST /api/generate-image`

Generates an image from a prompt.

### GHL Proxy Routes

The backend includes proxy routes for GoHighLevel so the frontend does not expose the private GHL API key.

Supported GHL proxy areas include:

- calendar events
- appointment notes
- contacts
- contact tasks
- contact tags
- conversations
- conversation messages
- location details
- custom fields
- opportunities
- pipelines
- payments
- blogs
- email templates
- social media accounts
- social media posts
- social statistics

These routes are intended for app integration and should be treated as admin/backend capabilities.

## 19. Transcript Webhook Setup

Use this when sending transcripts from a transcription app or Make.com.

Recommended endpoint:

`POST https://YOUR-VAL-DOMAIN/api/val/transcripts`

Recommended JSON body:

```json
{
  "title": "Client Meeting - May 22",
  "transcript": "Full transcript text here...",
  "source": "transcription_app",
  "contactEmail": "client@example.com",
  "project": "Client Project Name",
  "date": "2026-05-22",
  "process": true,
  "metadata": {
    "meetingId": "optional-id",
    "attendees": ["Name One", "Name Two"]
  }
}
```

When `process` is true, VAL should return and/or save:

- summary
- action items
- decisions
- follow-up drafts
- memory updates

## 20. Admin Setup

### Required Environment Variables

`DATABASE_URL`

The Postgres database connection string. This is used for durable tasks, memory, transcripts, conversations, messages, and OAuth tokens.

`OPENAI_KEY`

OpenAI API key used for chat, intelligence, document drafting, image analysis, and image generation.

`GHL_KEY`

GoHighLevel API key used by backend proxy routes.

`GHL_LOC`

GoHighLevel location ID.

`GOOGLE_CLIENT_ID`

Google OAuth client ID.

`GOOGLE_CLIENT_SECRET`

Google OAuth client secret.

`RAILWAY_PUBLIC_DOMAIN` or `REDIRECT_URI`

Used to build the Google OAuth callback URL.

### Optional Environment Variables

`VAL_CHAT_MODEL`

Overrides the default chat model. The default is `gpt-5.5`.

`ROCKETREACH_API_KEY`

Enables RocketReach attendee lookup for meeting intelligence.

`ROCKETREACH_BASE_URL`

Optional RocketReach base URL override. Defaults to `https://api.rocketreach.co/api/v2`.

`OUTSCRAPER_API_KEY`

Enables Outscraper lookup for LinkedIn post context.

`OUTSCRAPER_LINKEDIN_POSTS_URL`

The Outscraper endpoint VAL should call to retrieve LinkedIn posts for a profile or attendee query. VAL passes a `query` parameter and expects post data in the response.

`VAL_OWNER_EMAILS`

Comma-separated owner emails to exclude from attendee enrichment.

`MEETING_OPPORTUNITY_AMOUNT`

Default dollar amount for opportunities VAL creates from new calendar attendees. Defaults to `7500`.

`GHL_OPPORTUNITY_PIPELINE_ID`

Optional pipeline ID for opportunities created from calendar attendees. If omitted, VAL uses the first available GHL pipeline.

`GHL_OPPORTUNITY_STAGE_ID`

Optional pipeline stage ID for opportunities created from calendar attendees. If omitted, VAL uses the first stage in the selected pipeline.

`VAL_USER_ID`

Sets the user scope for tasks, memory, transcripts, and conversations.

`GOOGLE_REFRESH_TOKEN`

Optional fallback refresh token.

`TASKS_FILE`

Fallback JSON task storage path when Postgres is unavailable.

`VAL_STORE_FILE`

Fallback JSON memory/conversation storage path when Postgres is unavailable.

`PGSSLMODE`

Postgres SSL behavior.

`MEMORY_CHUNK_SIZE`

Controls document memory chunk size.

`MEMORY_CHUNK_OVERLAP`

Controls overlap between long document memory chunks.

## 21. Troubleshooting

### Task Disappears After Refresh

Check:

- `/api/val/tasks` is reachable
- `DATABASE_URL` is set in production
- the task POST request succeeds
- the browser is pointed at the correct production proxy

### Cannot POST /api/val/chat

This means the HTML is pointing at a backend that does not have the VAL chat route.

Check:

- the `PROXY` value in the HTML points to the correct Railway app
- the latest backend is deployed
- `/api/val/chat` exists in `server.js`
- the app has restarted after deployment

### Google Calendar Keeps Disconnecting

Check:

- `/auth/status`
- Google OAuth redirect URI
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- database token storage
- whether the Google app requested offline access and received a refresh token

### Uploaded File Does Not Appear in Memory

Check:

- file is under the configured upload size limit
- file type is supported
- `/api/val/files` returns success
- extracted text is not empty
- memory search uses relevant keywords from the document

### Transcript Does Not Create Tasks or Summary

Check:

- transcript body includes `transcript` or `text`
- `process` is true if automatic processing is desired
- `OPENAI_KEY` is configured
- Make.com is sending JSON
- Make.com content type is `application/json`

## 22. Recommended User Workflows

### Start of Day

1. Click Start My Day.
2. Review meetings, tasks, follow-ups, and pipeline risks.
3. Ask "What should I do now?"
4. Complete or delegate the first recommended action.

### After a Meeting

1. Send the transcript to `/api/val/transcripts` with `process: true`.
2. Review the generated summary, action items, decisions, and follow-ups.
3. Open Action Items to confirm tasks.
4. Ask VAL to draft follow-up messages.

### Before a Meeting

1. Open Calendar.
2. Click the meeting.
3. Ask VAL for prep.
4. Review prior notes, tasks, commitments, and risks.

### Weekly Review

Ask VAL:

"Weekly review."

VAL should review:

- what moved revenue
- what stalled
- what was avoided
- where overload appeared
- what created leverage
- what fragmented attention
- what needs to stop
- highest-leverage move next week

### Document Creation

1. Ask VAL to draft a proposal, email, agreement, scope, invoice, or quote.
2. Confirm recipient details.
3. Provide key points.
4. Review the draft.
5. Request revisions if needed.
6. Approve or copy/send through the configured workflow.

## 23. Data Boundaries

VAL stores operational memory so it can be useful over time. Users should treat it as a private business system.

Sensitive data should only be uploaded or sent if:

- the production app is secured
- database access is controlled
- API keys are stored in environment variables
- webhook URLs are not publicly shared
- users understand what information is being stored

## 24. Quick Reference

Useful phrases:

- "Start my day."
- "Executive review."
- "What should I do now?"
- "Show my tasks."
- "Add a task."
- "Review my pipeline."
- "Who needs follow-up?"
- "Draft a proposal."
- "Draft an email to..."
- "Search memory for..."
- "What did we decide last time?"
- "Meeting mode."
- "Weekly review."
- "Create a social post about..."
- "Upload this into memory."

VAL works best when the user gives names, context, desired outcome, and any deadlines.
