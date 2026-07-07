# VAL Event Intelligence Pass v1

Purpose: define the master internal pass VAL runs after meaningful events so VAL continuously notices what changed, updates context with evidence, prepares useful actions, and avoids unsupported guesses.

This is a prompt and system design spec. It does not change runtime behavior until implemented.

Companion specs:

- [VAL_CONTEXT_REGISTRY.md](./VAL_CONTEXT_REGISTRY.md)
- [VAL_TRANSCRIPT_INTAKE_PROMPTS.md](./VAL_TRANSCRIPT_INTAKE_PROMPTS.md)
- [VAL_EXECUTIVE_INBOX_CLASSIFICATION_PROMPTS.md](./VAL_EXECUTIVE_INBOX_CLASSIFICATION_PROMPTS.md)
- [VAL_EMAIL_DRAFT_PROMPTS.md](./VAL_EMAIL_DRAFT_PROMPTS.md)
- [VAL_CHAT_VOICE_CONTEXT_PROMPTS.md](./VAL_CHAT_VOICE_CONTEXT_PROMPTS.md)
- [VAL_CALENDAR_AND_MEETING_PREP_PROMPTS.md](./VAL_CALENDAR_AND_MEETING_PREP_PROMPTS.md)
- [VAL_GHL_CRM_PROMPTS.md](./VAL_GHL_CRM_PROMPTS.md)
- [VAL_RELATIONSHIP_PROJECT_UNDERSTANDING_PROMPTS.md](./VAL_RELATIONSHIP_PROJECT_UNDERSTANDING_PROMPTS.md)
- [VAL_OS_INSTRUCTIONS_AND_APPROVAL_PROMPTS.md](./VAL_OS_INSTRUCTIONS_AND_APPROVAL_PROMPTS.md)
- [VAL_ONBOARDING_FIRST_UNDERSTANDING_PROMPTS.md](./VAL_ONBOARDING_FIRST_UNDERSTANDING_PROMPTS.md)

## Mission

VAL should not treat emails, transcripts, tasks, calendar events, CRM updates, chat, and voice as isolated inputs.

Every event should ask:

1. What happened?
2. Who or what does it touch?
3. What changed?
4. What should VAL remember temporarily?
5. What should VAL promote into durable context?
6. What priority changed?
7. What useful action should VAL prepare?
8. What must not happen without human approval?

The pass should make VAL feel like it is paying attention.

## Event Triggers

The pass should run after these event categories.

| Event type | Examples | Default tier | Sync or async |
|---|---|---:|---|
| `transcript_received` | Krisp/webhook/upload/voice transcript saved | 2 | async after raw save |
| `transcript_processed` | transcript summary/tasks/participants created | 2 | async |
| `email_received` | Gmail/Outlook inbox message fetched | 1 bulk, 2 if important | async/batched |
| `email_sent` | Gmail sent mail or internal sent record | 2 | async |
| `email_draft_created` | draft prepared from inbox/transcript/chat | 1 | async |
| `email_draft_edited` | user edits draft | 2 | async |
| `chat_message` | user sends chat message | 1 or 2 | sync hot retrieval, async update |
| `voice_turn` | meaningful voice turn completes | 1 | async/debounced |
| `voice_session_completed` | presence/voice session saved | 2 | async |
| `onboarding_source_connected` | user connects email/calendar/CRM/transcripts/docs/voice | 1 | async |
| `onboarding_ai_import_uploaded` | ChatGPT/Claude/other AI export imported | 2 | async |
| `onboarding_round_table_ready` | first observer pass can be shown | 3 | async/cache |
| `onboarding_confirmation_decision` | user agrees/disagrees/edits/marks unsure | 2 | async |
| `calendar_event_created` | Google/Outlook/GHL/VAL event appears | 1 or 2 | async |
| `calendar_event_updated` | time/attendees/title changes | 1 or 2 | async |
| `calendar_event_approaching` | pre-meeting window | 2 or 3 | sync if briefing requested |
| `task_created` | VAL/manual/transcript/email task | 1 | async |
| `task_completed` | task marked complete | 1 | async |
| `task_overdue` | task crosses due date | 2 | scheduled async |
| `ghl_contact_updated` | contact create/update/tag change | 1 | async/batched |
| `ghl_opportunity_updated` | stage/value/status change | 2 | async |
| `ghl_note_added` | note/call/conversation added | 2 | async |
| `rule_created` | VAL OS instruction created/published | 1 | async |
| `rule_updated` | VAL OS instruction edited/paused/archived | 1 | async |
| `approval_decision` | user approves/rejects/snoozes | 2 | async |
| `user_correction` | user says VAL was wrong | 3 | sync or immediate async |
| `homepage_refresh` | card context is stale | 3 | async/cache |

## Cost Tiers

The Event Intelligence Pass must be tiered. VAL should not send the whole universe to a large model after every tiny event.

### Tier 0: Deterministic Capture

No model call.

Do:

- Save raw source once.
- Normalize obvious metadata.
- Create event row.
- Extract deterministic IDs, timestamps, sender, attendees, source URL.
- Check dedupe fingerprints.

Use for every event.

### Tier 1: Cheap Triage

Small/cheap model or deterministic rules.

Do:

- Decide whether event is ignorable, store-only, analyze, or deep-analyze.
- Extract obvious people/projects/open loops.
- Assign rough importance.
- Avoid durable context updates except simple links.

Use for:

- Bulk email sync.
- Low-signal calendar changes.
- Ordinary task edits.
- Draft creation.

### Tier 2: Focused Intelligence

Moderate model call with a narrow packet.

Do:

- Create evidence observations.
- Update hot/warm context.
- Contextualize tasks.
- Detect priority shifts.
- Prepare actions for review.

Use for:

- Transcripts.
- Important emails.
- Sent emails.
- GHL notes/opportunity changes.
- Voice/chat sessions with substance.

### Tier 3: Deep Reasoning

Larger model call with richer context.

Do:

- Highest Leverage.
- Major user corrections.
- Relationship/project Understanding rebuild.
- Meeting prep.
- Draft rewrite when tone/context matters.
- Durable memory promotion.

Use sparingly and cache results.

### Tier 4: Draft/Action Preparation

Model call focused on user-visible output.

Do:

- Email replies.
- Meeting recaps.
- Follow-up drafts.
- Task descriptions.
- Approval packets.

Use only after Tier 1-3 decide an action is worth preparing.

## Context Temperature

Context should be retrieved by temperature, not dumped wholesale.

| Layer | Meaning | Examples |
|---|---|---|
| `hot_context` | Current, likely relevant now. | current event, matched person/project, today calendar, overdue tasks, current capacity, highest leverage. |
| `warm_context` | Recently relevant or active. | active projects, important people, recent transcripts, recent emails, CRM opportunities. |
| `cold_context` | Durable archive. | old transcripts, old emails, old decisions, long-term Teach VAL memory. |

Prompts should usually receive hot context plus selected warm context. Cold context should be retrieved only when needed.

## Event Row Shape

Recommended store shape:

```json
{
  "id": "event_123",
  "tenant_id": "client_slug",
  "user_id": "user_123",
  "event_type": "email_received",
  "source": "gmail",
  "source_id": "gmail_message_id",
  "source_url": "https://mail.google.com/...",
  "occurred_at": "2026-07-03T14:00:00.000Z",
  "captured_at": "2026-07-03T14:01:00.000Z",
  "dedupe_key": "gmail:gmail_message_id",
  "summary": "",
  "raw_ref": {
    "table": "evidence_items",
    "id": "evi_123"
  },
  "status": "captured",
  "metadata_json": {}
}
```

## Intelligence Pass Output Shape

Recommended store shape:

```json
{
  "id": "intel_123",
  "event_id": "event_123",
  "tier": 2,
  "model": "small-or-large-model-name",
  "status": "complete",
  "input_context_refs": [],
  "output_json": {},
  "created_evidence_ids": [],
  "created_observation_ids": [],
  "created_action_ids": [],
  "created_draft_ids": [],
  "created_task_ids": [],
  "errors": [],
  "created_at": "2026-07-03T14:01:10.000Z"
}
```

## Master Prompt

Use this as the canonical system prompt for Tier 2 and Tier 3. Tier 1 can use a smaller prompt derived from this.

```text
You are VAL's Event Intelligence Layer.

You do not write user-facing copy unless explicitly asked by an action-preparation prompt.
You notice, connect, update, and prepare.

An event happened:
{{event}}

Read the relevant context packet:
{{context_packet}}

Your job:
1. Summarize what happened.
2. Identify people, projects, relationships, tasks, calendar events, CRM records, and evidence touched.
3. Decide what changed.
4. Create source-backed observations.
5. Recommend context updates using append, link, promote, replace, deprecate, escalate, expire, or reject.
6. Detect open loops, risks, opportunities, emotional context, capacity signals, and priority changes.
7. Decide whether any action should be prepared for human review.
8. Record uncertainty and missing context.
9. Record what VAL must not do.

Rules:
- Do not invent facts.
- Use source quotes when available.
- A single weak signal may become an observation, not durable memory.
- Durable memory requires user confirmation, repeated signals, or very high-confidence evidence.
- Prefer append/link/promote/deprecate over replace.
- Do not overwrite relationship or project context unless correcting stale or false information.
- Every context update must include source_type, source_id, source_quote or source_summary, confidence, scope, and why_this_matters.
- If the event affects health, physical comfort, focus, trust, money, deadlines, promises, active projects, or important people, evaluate priority.
- If context is missing, say what is missing in uncertainty.
- Never send email, delete data, invite attendees, spend money, publish content, move CRM stages, or change user settings without explicit approval.
- If an action is useful but not allowed, prepare a review-only draft, task, or approval packet.

Return strict JSON only.
```

## Master JSON Schema

```json
{
  "event_summary": "",
  "event_type": "",
  "event_importance": "ignore|store|analyze|deep_analyze|prepare_action",
  "entities_touched": {
    "people": [
      {
        "name": "",
        "email": "",
        "id": "",
        "role": "",
        "match_confidence": 0.0,
        "match_reason": ""
      }
    ],
    "projects": [
      {
        "id": "",
        "name": "",
        "match_confidence": 0.0,
        "match_reason": ""
      }
    ],
    "relationships": [],
    "tasks": [],
    "calendar_events": [],
    "crm_records": []
  },
  "new_evidence": [
    {
      "source_type": "",
      "source_id": "",
      "title": "",
      "summary": "",
      "raw_text_excerpt": "",
      "source_url": "",
      "participants": [],
      "entities": {},
      "confidence": 0.0,
      "status": "captured|parsed|action_suggested|ignored"
    }
  ],
  "observations": [
    {
      "observation_type": "promise|commitment|task|decision|question|need|preference|risk|opportunity|relationship_signal|emotional_context|deadline|follow_up|idea|reply_needed|pricing_question|meeting_request|document_request|capacity_signal|environment_signal|project_blocker|project_momentum",
      "content": "",
      "person_id": "",
      "project_id": "",
      "organization_id": "",
      "exact_quote": "",
      "confidence": 0.0,
      "status": "observed|needs_review|action_suggested|ignored",
      "due_at": null
    }
  ],
  "context_updates": [
    {
      "target": "",
      "operation": "append|link|promote|replace|deprecate|escalate|expire|reject",
      "value": "",
      "source_type": "",
      "source_id": "",
      "source_quote": "",
      "source_summary": "",
      "confidence": 0.0,
      "scope": "current_state|observation|pattern|durable_memory|relationship|project|task|priority",
      "expires_at": null,
      "why_this_matters": ""
    }
  ],
  "priority_updates": [
    {
      "target": "",
      "level": "low|medium|high|critical",
      "reason": "",
      "urgency_score": 0,
      "importance_score": 0,
      "leverage_score": 0,
      "risk_score": 0,
      "capacity_impact": "",
      "if_ignored": "",
      "why_now": "",
      "confidence": 0.0
    }
  ],
  "open_loops_found": [
    {
      "title": "",
      "why_it_exists": "",
      "related_person": "",
      "related_project": "",
      "source_quote": "",
      "due_at": null,
      "priority_level": "low|medium|high|critical",
      "confidence": 0.0
    }
  ],
  "risks_found": [],
  "opportunities_found": [],
  "capacity_signals": [
    {
      "signal": "",
      "impact": "",
      "source_quote": "",
      "expires_at": null,
      "confidence": 0.0
    }
  ],
  "highest_leverage_candidate": {
    "title": "",
    "why": "",
    "evidence": [],
    "if_ignored": "",
    "recommended_action": "",
    "confidence": 0.0
  },
  "actions_to_prepare": [
    {
      "action_type": "draft_reply|create_task|prepare_meeting|summarize|follow_up|calendar_block|approval_packet|update_context|do_nothing",
      "title": "",
      "why": "",
      "input_context": {},
      "requires_human_approval": true,
      "confidence": 0.0
    }
  ],
  "requires_human_approval": [
    {
      "action": "",
      "reason": ""
    }
  ],
  "do_not_do": [
    {
      "action": "",
      "reason": ""
    }
  ],
  "uncertainty": [
    {
      "missing_context": "",
      "impact": "",
      "how_to_resolve": ""
    }
  ]
}
```

## Tier 1 Triage Prompt

Use for bulk or low-signal events.

```text
You are VAL's cheap event triage layer.

Event:
{{event}}

Small context:
{{small_context_packet}}

Decide whether this event should be ignored, stored only, analyzed, deeply analyzed, or used to prepare an action.

Look for:
- important person
- active project
- explicit promise or task
- deadline
- relationship risk
- revenue/opportunity signal
- user capacity/health/focus signal
- calendar pressure
- user correction
- external action risk

Return strict JSON:
{
  "event_importance": "ignore|store|analyze|deep_analyze|prepare_action",
  "reason": "",
  "matched_people": [],
  "matched_projects": [],
  "signals": [],
  "recommended_next_tier": 0,
  "do_not_do": []
}
```

## Trigger-Specific Context Packets

### Onboarding / First Understanding

Prompt suite:

- [VAL_ONBOARDING_FIRST_UNDERSTANDING_PROMPTS.md](./VAL_ONBOARDING_FIRST_UNDERSTANDING_PROMPTS.md)

Read:

- connected source status
- imported ChatGPT/Claude/other AI context
- recent email metadata and high-signal conversations
- recent calendar events
- recent transcripts
- CRM/GHL contacts, conversations, notes, and opportunities
- documents or voice history if connected
- existing Teach VAL memory
- existing important people, projects, relationships, preferences, and rules

Notice:

- which sources are usable
- recurring themes
- important people candidates
- active project candidates
- capacity patterns
- communication style candidates
- preferences and boundaries
- open loops
- observer-specific first impressions
- what is uncertain
- what needs confirmation

Write:

- connected source readiness
- AI history import summary
- Round Table reading state
- onboarding observer outputs
- first understanding
- confirmation cards
- memory promotion candidates
- onboarding completion message

Do not:

- design for emotional intensity
- pretend VAL fully understands the user
- promote source inference into durable memory without confirmation or repeated evidence
- show raw sensitive content unless needed for confirmation
- flatten onboarding into a checklist of integrations

### Transcript Arrives

Read:

- `{{event}}`
- `{{transcripts.current.raw_text}}`
- `{{teach_val}}`
- `{{important_people.list}}`
- `{{projects.active}}`
- `{{relationships.list}}`
- `{{user.current_capacity_context}}`
- `{{user.energy_patterns}}`
- `{{calendar.today}}`
- `{{tasks.open}}`

Notice:

- who is mentioned
- what projects are touched
- promises and tasks
- emotional context
- capacity signals
- user excitement/frisson
- blockers
- highest-leverage candidates

Write:

- evidence observations
- contextualized tasks
- relationship/project context appends
- current capacity updates
- priority candidates

### Email Arrives

Read:

- `{{emails.current}}`
- `{{emails.thread.current.summary}}`
- `{{important_people.list}}`
- `{{projects.active}}`
- `{{relationships.current}}`
- `{{crm}}`
- `{{tasks.open}}`
- `{{calendar.relevant_events}}`
- `{{user.priority_rules}}`

Notice:

- whether sender is important
- whether email touches an active project
- whether there is an ask, promise, risk, opportunity, deadline, or emotional shift
- whether it should be high priority
- whether drafting is appropriate

Write:

- email importance score
- priority reason
- relationship/project context append
- action to prepare, if needed

### Email Sent

Read:

- sent email
- current thread
- relationship/project context
- tasks/open loops

Notice:

- promise made by user
- follow-up expected from recipient
- new commitment or deadline
- tone/history update

Write:

- relationship timeline event
- thread waiting-on-response context
- follow-up task if source-backed
- tone history

### Chat or Voice

Read:

- user message/transcript
- hot user context
- active projects
- important people
- current capacity
- open tasks
- recent evidence

Notice:

- direct instruction
- correction
- preference
- current focus
- capacity/somatic/environment signals
- relief/frisson signals
- new project/person importance

Write:

- user current focus
- user capacity context
- Teach VAL memory candidate
- relationship/project context
- rejected/approved behavior learning

### Calendar Event

Prompt suite:

- [VAL_CALENDAR_AND_MEETING_PREP_PROMPTS.md](./VAL_CALENDAR_AND_MEETING_PREP_PROMPTS.md)

Read:

- calendar event
- attendees
- important people
- active projects
- recent transcripts/emails/tasks related to attendees
- calendar pressure
- internal contact and relationship profiles
- CRM/GHL contact, note, and opportunity records
- approved enrichment and public source results when available

Notice:

- meeting importance
- prep needed
- calendar overload
- context links
- relationship pressure
- attendee identity ambiguity
- relationship intelligence
- possible mutual-value introductions
- possible project, partnership, client, or CRM opportunity relevance
- source confidence gaps

Write:

- meeting prep candidate
- calendar pressure updates
- relevant relationship/project links
- attendee resolution
- meeting context
- relationship intelligence
- opportunity map
- source confidence summary
- suggested questions
- follow-up preparation candidate
- Ready For You handoff candidate

After the meeting:

- link transcripts, notes, emails, tasks, CRM updates, relationship updates, project updates, commitments, and opportunities back to the calendar event
- ask what changed because the meeting happened
- respect approval policy before writing external communications, CRM notes, proposals, invoices, or introductions

### GHL Update

Prompt suite:

- [VAL_GHL_CRM_PROMPTS.md](./VAL_GHL_CRM_PROMPTS.md)

Read:

- contact/opportunity/note/task/conversation update
- matching relationships/projects
- recent emails/transcripts/tasks
- calendar events and attendee resolution
- unified conversation context
- existing CRM contact ID and opportunity ID
- relationship profile
- relationship graph, lifecycle, health, mutual value, and communication preferences

Notice:

- identity match confidence
- duplicate or merge risk
- CRM hygiene impact
- whether the contact should be used, created, reviewed, or ignored
- relationship lifecycle change
- relationship health change
- relationship equity change
- communication preference evidence
- mutual value signal
- dormancy or rekindling signal
- network graph changes such as introducers, connectors, clusters, and shared projects
- opportunity stage/value change
- new note with promise/risk
- CRM task overlap
- relationship status change
- whether relationship value and opportunity value differ
- whether a proposal, invoice, SMS, email, calendar invite, or CRM task can be prepared
- whether a CRM action requires approval

Write:

- person key
- identity resolution
- CRM contact creation candidate
- CRM contact ID anchor plan
- relationship graph update
- relationship lifecycle update
- relationship health update
- relationship equity update
- relationship role update
- mutual value update
- communication preference update
- dormancy observation
- unified conversation timeline
- concise CRM note candidate
- CRM task sync plan
- opportunity resolution
- proposal/invoice plan
- SMS/email send plan
- calendar invite plan
- CRM action permission classification
- merge candidate
- CRM action audit
- relationship/project context
- evidence observations
- priority updates
- action candidates

Do not:

- auto-create contacts for newsletters, no-reply senders, cold spam, group aliases, scraped-only contacts, or one-off noise
- merge contacts automatically
- send SMS/email, send proposals/invoices, charge payments, move opportunity stages, delete contacts, bulk update records, or change automation-triggering tags without approval
- dump full transcript, email, observer, or Chief of Staff context into CRM

CRM writes should make the CRM cleaner, more accurate, or more connected.

VAL should optimize the health of the user's network rather than the size of the user's CRM.

### Relationship / Project Understanding Rebuild

Prompt suite:

- [VAL_RELATIONSHIP_PROJECT_UNDERSTANDING_PROMPTS.md](./VAL_RELATIONSHIP_PROJECT_UNDERSTANDING_PROMPTS.md)

Read:

- relationship profile and context
- project profile and context
- evidence observations
- recent transcripts
- recent email/conversation summaries
- calendar meeting intelligence
- CRM relationship graph, health, equity, role, mutual value, and communication preferences
- open tasks and open loops

Notice:

- what changed
- the thirty-second truth
- one-sentence understanding
- active threads
- open loops
- mutual value
- relationship/project becoming
- living narrative changes
- meaning timeline changes
- uncertainty or counter-evidence

Write:

- relationship thirty-second truth
- relationship one-sentence understanding
- relationship current state
- relationship active threads
- relationship mutual value
- relationship becoming
- relationship living narrative
- relationship meaning timeline
- project thirty-second truth
- project one-sentence understanding
- project why it exists
- project biggest unknown
- relationships moving the project
- project decisions waiting
- project becoming
- project living narrative
- project meaning timeline

Do not:

- write database-like overviews
- organize the page primarily by chronology
- invent importance, trust, intimacy, or meaning
- make every relationship strategic or every project profound

### VAL OS Instruction / Approval Event

Prompt suite:

- [VAL_OS_INSTRUCTIONS_AND_APPROVAL_PROMPTS.md](./VAL_OS_INSTRUCTIONS_AND_APPROVAL_PROMPTS.md)

Read:

- user instruction text
- selected function scope
- existing VAL OS instructions
- user preferences
- approval preferences
- safe automation rules
- do-not-do rules
- VIP/ignored rules
- module-specific behavior overrides
- current approval packet or approval decision

Notice:

- when-this-happens trigger
- VAL-understands intent
- so-VAL-will behavior
- origin story
- duration, review date, and expiration date
- function scope
- specificity ladder result
- approval policy
- conflicts
- test-before-publish result
- risk level
- whether behavior is hot-reloadable configuration
- whether external action approval is required
- what VAL should learn from approval, rejection, edit, or snooze

Write:

- instruction candidate
- behavior packet
- function override
- validation result
- specificity result
- conflict resolution
- test cases
- preview/simulation
- publish decision
- approval packet
- approval learning candidate
- instruction audit trail

Do not:

- treat behavior configuration as a code deployment
- create global instructions when module scope is enough
- silently create automation from repeated approvals
- execute external or high-risk actions without approval or a user-approved safe automation
- confuse publishing configuration with approving an external action

### User Correction

Read:

- correction
- prior recommendation/context it corrects
- source evidence

Notice:

- what VAL misunderstood
- whether memory should be replaced, deprecated, or rejected
- what future rule should change

Write:

- rejected suggestion memory
- corrected context
- do-not-do rule
- confidence downgrade

## Examples

### Example: Heatwave Transcript

Input signal:

```text
"It is hard to focus in this heat."
```

Output excerpt:

```json
{
  "observations": [
    {
      "observation_type": "capacity_signal",
      "content": "Heat is making it hard for the user to focus.",
      "exact_quote": "It is hard to focus in this heat.",
      "confidence": 0.93,
      "status": "observed"
    }
  ],
  "context_updates": [
    {
      "target": "user.current_capacity_context",
      "operation": "append",
      "value": "Heat is impairing focus.",
      "source_type": "transcript",
      "source_id": "tr_123",
      "source_quote": "It is hard to focus in this heat.",
      "confidence": 0.93,
      "scope": "current_state",
      "expires_at": "2026-07-10T00:00:00.000Z",
      "why_this_matters": "This may block every high-cognition task today."
    }
  ],
  "highest_leverage_candidate": {
    "title": "Get an air conditioner",
    "why": "The user's environment is directly blocking focus.",
    "evidence": ["Transcript: hard to focus in this heat"],
    "if_ignored": "VAL may keep recommending work while the real blocker remains physical discomfort.",
    "recommended_action": "Prioritize cooling the workspace before deep work.",
    "confidence": 0.88
  }
}
```

### Example: Important Person Email

Input signal:

```text
From: Marcus Chen <marcus@atlasops.com>
Subject: Pilot memo before today's demo
Body: Can you send the revised procurement section before 2?
```

Output excerpt:

```json
{
  "priority_updates": [
    {
      "target": "emails.current",
      "level": "high",
      "reason": "Sender matches important person and asks for a time-sensitive active-project deliverable.",
      "urgency_score": 9,
      "importance_score": 8,
      "leverage_score": 8,
      "risk_score": 7,
      "if_ignored": "The demo may proceed without the procurement clarity Marcus requested.",
      "why_now": "Requested before 2 PM today.",
      "confidence": 0.91
    }
  ],
  "actions_to_prepare": [
    {
      "action_type": "draft_reply",
      "title": "Draft reply to Marcus with procurement section",
      "why": "The email needs a specific time-sensitive response.",
      "requires_human_approval": true,
      "confidence": 0.88
    }
  ]
}
```

### Example: User Correction

Input signal:

```text
No, Renee is not high priority right now. I want VAL to stop surfacing her unless she emails me directly.
```

Output excerpt:

```json
{
  "context_updates": [
    {
      "target": "important_people.by_slug.renee.priority_level",
      "operation": "replace",
      "value": "low_unless_direct_contact",
      "source_type": "user_correction",
      "source_id": "chat_msg_123",
      "source_quote": "Renee is not high priority right now.",
      "confidence": 1.0,
      "scope": "durable_memory",
      "why_this_matters": "User explicitly corrected VAL's prioritization."
    }
  ],
  "do_not_do": [
    {
      "action": "surface Renee as high priority unless she directly contacts the user",
      "reason": "User explicitly requested this constraint."
    }
  ]
}
```

## Synchronous vs Asynchronous Behavior

### Run synchronously when:

- user asks a chat/voice question that needs hot context
- meeting prep is requested
- user correction affects immediate answer
- approval packet is being prepared
- draft is being generated for user review

### Run asynchronously when:

- transcript arrives
- bulk email sync completes
- calendar events refresh
- GHL data refreshes
- task changes
- draft is created
- voice session ends

### Debounce rules:

- Voice partials should not trigger deep passes.
- Bulk email sync should batch multiple emails.
- Calendar refresh should summarize changes before deep analysis.
- GHL updates should batch by contact/opportunity where possible.

## Storage and Memory Rules

1. Store raw source once.
2. Store evidence observations separately.
3. Link observations to relationships/projects/tasks.
4. Do not copy full raw email/transcript text into relationship context.
5. Relationship/project Understanding stores compact living narratives, meaning timelines, and evidence links.
6. Temporary state needs expiration.
7. User-confirmed corrections should override model inference.
8. Rejected recommendations should be remembered so VAL does not repeat them.

## Dedupe Rules

Use fingerprints to avoid duplicate tasks and context spam.

Task/open-loop fingerprint:

```text
tenant_id + normalized_person + normalized_project + normalized_action + source_type
```

Context update fingerprint:

```text
target + normalized_value + source_type + source_id
```

Evidence fingerprint:

```text
source_type + source_id
```

If duplicate:

- append new evidence link
- update confidence or recency
- do not create a new task/context row

## Safety Gates

The pass may prepare but must not execute:

- send email
- forward email
- delete/archive email
- invite attendee
- book meeting with attendee
- move CRM stage
- update user settings
- publish content
- share transcript
- spend money
- delete information

Unless a later explicit approval/execution layer validates permission.

## First Implementation Recommendation

1. Add event capture store.
2. Add intelligence output store.
3. Implement Tier 0 deterministic event capture.
4. Implement Tier 1 triage for transcript, email, chat/voice, calendar, GHL.
5. Implement Tier 2 for transcript arrivals first.
6. Use Tier 2 transcript output to populate:
   - `user.current_capacity_context`
   - `recent_transcripts.open_loops`
   - `recent_transcripts.emotional_context`
   - contextualized task descriptions
7. Implement Tier 3 Highest Leverage card from the new context.
8. Then wire Executive Inbox and email drafts.
