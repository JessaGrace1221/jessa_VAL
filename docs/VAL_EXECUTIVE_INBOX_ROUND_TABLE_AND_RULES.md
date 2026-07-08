# VAL Executive Inbox Round Table, Packets, and Rules

Executive Inbox is not a mailbox. It is the communication judgment layer of VAL.

Its job is to decide which conversations deserve executive attention, prepare the safest useful response, and send only through an explicit approval or a narrow user-created rule.

## v1 Operating Rule

Executive Inbox may only show an email conversation when all of these are true:

1. The sender passed Executive Inbox admission.
2. The conversation has a complete Email Judgment Packet.
3. The recommended action is one of the allowed Executive Inbox actions.
4. The draft or next action can be reviewed in a clean work surface.
5. The source and source-of-source can feed downstream observers without blending unrelated context.

If any of these are missing, the conversation stays out of Executive Inbox.

## The User-Facing Page

The page should be calm and sparse.

Visible surface:

- Left or top: a list of admitted email conversations only.
- Selected email: a plain-English reason it matters.
- Main work area: an editable draft when a reply or forward is appropriate.
- Primary action: `Send`.
- Secondary action: `Co-Work with VAL`.
- Boundary action: `Not executive contact`.

Do not show tabs for every technical bucket on the primary surface.

Do not show raw packet context, source refs, JSON, observer output, or rule-engine language unless the user explicitly opens an audit/debug view.

The user should feel:

> VAL already triaged the inbox. I am only seeing what needs judgment.

## Original Dashboard Functions To Preserve

The earlier dashboard had useful capabilities that should survive, but not as visible clutter:

| Original Function | Keep? | New Placement |
|---|---:|---|
| Priority Inbox | Yes | Main admitted conversation list |
| Drafts Prepared | Yes | Selected email opens editable draft |
| Waiting on Response | Yes | Admitted only if consequence is high enough |
| Forwarding Suggestions | Yes | Draft/approval surface when rule or context supports forwarding |
| Ignored / Low Priority | Yes | Quietly logged, not primary UI |
| Rule Suggestions | Yes | Surface only when a repeated pattern is proven and useful |
| Saved Rules | Yes | Clean rules/settings drawer, not main inbox work surface |
| Draft Reply | Yes | Primary prepared work pattern |
| Forward | Yes | Prepared forward draft with recipient confirmation |
| Ignore in Future | Yes | Replaced by `Not executive contact` or scoped rule |
| Do This Automatically Next Time | Yes | User-confirmed rule creation |
| Track Response | Yes | Creates/updates commitment or follow-up packet |
| Add Task | Yes | Creates task packet only when context supports it |

Existing backend routes that express this earlier system:

- `GET /api/email/intelligence`
- `POST /api/email/gmail/refresh`
- `POST /api/email/inbox-command`
- `POST /api/email/inbox-command/action`
- `POST /api/email/actions`
- `GET /api/email/rules`
- `POST /api/email/rules`
- `PATCH /api/email/rules/:id`
- `POST /api/email/automation-rule`
- `POST /api/email/rule-suggestions/analyze`
- `POST /api/val/executive-inbox/not-executive-contact`
- `POST /api/val/external-actions/email-send-gate`

## Executive Inbox Round Table

The Executive Inbox Round Table answers one question:

> Does this communication deserve executive judgment, and what is the smallest safe action VAL can prepare?

It is a reasoning engine, not a UI surface.

### Participants

| Participant | Question |
|---|---|
| Admission Gate | Has this sender earned cognitive space? |
| Relationship Observer | Is this a real relationship, a contact, or noise? |
| Project Observer | Does this belong to an active project or initiative? |
| Commitment Observer | Does anyone owe anyone anything? |
| Calendar Observer | Is there timing, meeting, or deadline context? |
| Transcript Observer | Did this person/project appear in prior conversations? |
| Rule Observer | Does a user-created rule apply? |
| Safety Observer | Is this legally, financially, emotionally, or reputationally sensitive? |
| Draft Observer | Can VAL prepare a useful draft without inventing missing context? |
| Downstream Feed Observer | Which observers/packets must receive this result? |

### Round Table Output

The Round Table must produce exactly one of these outcomes:

| Outcome | Meaning | UI |
|---|---|---|
| `admit_for_reply` | User should review/send an editable reply draft. | Show email + draft + Send |
| `admit_for_forward` | User should review/send an editable forward draft. | Show email + forward draft + Send |
| `admit_for_decision` | User must decide before VAL can draft. | Show question + Co-Work |
| `admit_for_task` | User should confirm a task/follow-up. | Show task candidate + approve/create |
| `quiet_observation` | Useful truth, not worth interrupting. | No Executive Inbox item |
| `inbox_noise` | Not executive-relevant. | No Executive Inbox item |
| `suppressed_contact` | User marked sender as not executive. | Never surface unless reversed |
| `rule_executed_or_prepared` | A saved rule handled or prepared the action. | Receipt only if useful |

## Admission Rules

Admission happens before classification, drafting, relationship context, project linking, Home cards, or Co-Work retrieval.

### Hard Exclusion: One-Sided Sender

If all of these are true:

- more than 3 inbound emails from a sender
- 0 sent emails from the user to that sender
- no manual executive override
- no strong relationship/project/calendar/transcript evidence

Then:

- state: `inbox_noise`
- do not create Relationship
- do not enrich Relationship
- do not show in Executive Inbox
- do not create draft
- do not feed Home
- do not feed Meeting Prep
- do not inject into Co-Work context

### User Suppression

When the user clicks `Not executive contact`, VAL records `manual_not_executive_contact`.

This is stronger than automatic relevance.

Result:

- never show sender in Executive Inbox
- never build or enrich a Relationship from that sender
- never use that sender as supporting context for Home, Meeting Prep, Co-Work, Relationship drawers, or Project drawers
- keep raw source searchable only if the user searches source history
- reverse only through an explicit user action

### Relationship Admission

A sender may become a Relationship only when at least one is true:

- the user has replied
- the user explicitly marks them important
- they are in CRM
- they appear in calendar
- they appear in transcripts
- they are tied to a task, commitment, project, proposal, or document
- another important contact mentions them in a relevant context

### Project Admission

An email may feed a Project only when at least one is true:

- subject/body matches an existing project name or alias
- participants are already linked to the project
- a transcript/calendar/document/task connects the email to the project
- the user explicitly links it
- the email contains a project-level commitment, deliverable, risk, or decision

## Required Packets

### 1. Email Source Packet

Created from provider data.

Required variables:

- `provider`
- `message_id`
- `thread_id`
- `subject`
- `from`
- `to`
- `cc`
- `received_at`
- `body_preview`
- `body_text_available`
- `web_link`
- `attachments_present`
- `labels`

Feeds:

- Email Admission Packet
- Evidence Packet
- Conversation Packet

### 2. Email Admission Packet

Created before classification.

Required variables:

- `sender_email`
- `sender_name`
- `inbound_from_sender_count`
- `outbound_to_sender_count`
- `manual_not_executive_contact`
- `manual_executive_override`
- `relationship_evidence`
- `project_evidence`
- `calendar_evidence`
- `transcript_evidence`
- `crm_evidence`
- `admission_state`
- `admission_rule`

Allowed states:

- `noise`
- `contact`
- `relationship`
- `suppressed`

Feeds:

- Executive Inbox Round Table
- Relationship Observer only when admitted
- Project Observer only when admitted

### 3. Email Judgment Packet

Created by the Executive Inbox Round Table.

Required variables:

- `conversation_id`
- `thread_id`
- `classification`
- `why_this_matters`
- `what_is_needed`
- `if_ignored`
- `urgency`
- `importance`
- `relationship_risk`
- `project_risk`
- `confidence`
- `recommended_action`
- `allowed_actions`
- `never_do`
- `source_refs`

Feeds:

- Executive Inbox UI
- Alignment only if it becomes the highest priority
- Relationship/Project packets when admitted
- Ready For You if prepared work exists

### 4. Draft Packet

Created only when a reply or forward can be prepared without invention.

Required variables:

- `draft_id`
- `draft_type`
- `to`
- `cc`
- `subject`
- `body`
- `reply_to_thread_id`
- `source_message_id`
- `why_this_draft_exists`
- `missing_context`
- `representation_risk`
- `approval_policy`
- `editable_fields`

Rules:

- Draft body is user-editable.
- Draft may be sent only through an approval/send packet.
- Missing context must be named instead of invented.

Feeds:

- Executive Inbox UI
- External Action Packet
- Draft learning after edit/send/reject

### 5. Email Rule Packet

Created only by explicit user confirmation or approved rule suggestion.

Required variables:

- `rule_id`
- `rule_name`
- `rule_type`
- `trigger_scope`
- `conditions`
- `actions`
- `approval_mode`
- `created_from`
- `created_from_message_id`
- `created_from_thread_id`
- `confidence_threshold`
- `active`
- `test_cases`

Allowed rule types:

- `ignore_sender`
- `ignore_domain`
- `not_executive_contact`
- `vip_priority`
- `draft_reply`
- `forward_sender`
- `forward_category`
- `track_sent_followup`
- `create_task_candidate`

Rule examples:

```json
{
  "rule_type": "forward_sender",
  "conditions": {
    "from_email": "xyz@gmail.com"
  },
  "actions": {
    "action": "forward",
    "forward_to": "abc@companyemail.com",
    "include_summary": true,
    "cc_user": false
  },
  "approval_mode": "always_auto_unless_sensitive"
}
```

```json
{
  "rule_type": "not_executive_contact",
  "conditions": {
    "from_email": "vendor@example.com"
  },
  "actions": {
    "action": "suppress_from_executive_context"
  },
  "approval_mode": "always_auto"
}
```

Rule safety:

- No rule may have an empty trigger.
- No rule may apply globally without a sender, domain, category, or exact text condition.
- Rules that send/forward externally must have a recipient, scope, approval mode, and sensitivity override.
- Legal, HR, medical, financial, contract, complaint, or confidential content must require fresh approval unless explicitly allowed by a narrow rule.

### 6. External Action Packet

Created before any send, forward, task creation, calendar update, CRM update, or provider mutation.

Required variables:

- `action_type`
- `target_system`
- `target_id`
- `payload_preview`
- `source_context`
- `source_refs`
- `what_will_happen`
- `what_will_not_happen`
- `approval_policy`
- `risk_level`
- `representation_risk`
- `financial_or_legal_risk`
- `relationship_risk`
- `expires_at`

Feeds:

- Send gate
- Execution receipt
- Learning/Reflection

### 7. Email Execution Receipt

Created after an approved send/forward/action attempt.

Required variables:

- `receipt_id`
- `packet_id`
- `action_type`
- `provider`
- `provider_object_id`
- `provider_object_url`
- `status`
- `executed_at`
- `summary`
- `idempotency_key`
- `failure_reason`

Feeds:

- Relationship timeline
- Project timeline
- Commitment/follow-up status
- Draft learning
- Rule learning
- Home/Leverage receipt only if useful

## Clean UI Action Rules

### Clicking an email in the list

Must:

- open that exact email conversation
- show why VAL admitted it
- show the editable prepared draft when available
- show only context useful to the human
- inject full source context into Co-Work invisibly

Must not:

- open a different thread
- show raw packet context
- show unrelated relationship/project context
- make the user browse source evidence before acting

### Send

Must:

- send only the current edited draft
- use the current thread/source refs
- create an External Action Packet
- run fresh safety checks
- require final approval unless a narrow rule permits it
- create a receipt
- feed downstream observers

### Co-Work with VAL

Must:

- open the clean Co-Work box
- show no raw context
- hold the selected Email Judgment Packet, Draft Packet, Relationship Packet, Project Packet, and source refs invisibly
- answer from only that selected context unless the user asks VAL to widen scope

### Not Executive Contact

Must:

- target the inbound sender
- record manual suppression
- remove current item from Executive Inbox
- block future relationship/project/context enrichment from that sender
- write a receipt/audit event

## Downstream Observer Feed Rules

Every admitted inbound email and every approved outbound action must feed the correct observers.

### Admitted inbound email feeds

| Destination | Feed only when |
|---|---|
| Evidence Store | Always, with ignored/action status |
| Relationship Observer | Admission state is `relationship` |
| Project Observer | Project evidence exists |
| Commitment Observer | Promise, ask, deadline, decision, or follow-up exists |
| Calendar Observer | Meeting/scheduling language or event link exists |
| Transcript Observer | Participant/project overlap exists |
| Alignment | Highest-priority judgment exists |
| Leverage | VAL prepared useful work |
| Home Velocity | Material change passed Velocity Round Table |

### Approved outbound email feeds

| Destination | Feed |
|---|---|
| Evidence Store | sent message receipt and source refs |
| Relationship timeline | who was contacted, tone, promise, next expected response |
| Project timeline | project movement, deliverable sent, blocker resolved |
| Commitment Observer | follow-up created, fulfilled, waiting, or transferred |
| Rule Learning | whether approved as-is, edited, rejected, or saved as rule |
| Draft Learning | user edits, voice/style adjustments, missing context lessons |
| External Action Receipts | provider confirmation and idempotency key |

## Prompt Boundary

Executive Inbox prompts may read:

- Witnessing Session
- user priority rules
- do-not-do rules
- email source packet
- conversation/thread packet
- sender admission packet
- relationship/project packets only when admitted
- calendar/transcript/task packets only when source-linked
- active email rules
- draft standards

Executive Inbox prompts may not read:

- unrelated relationships
- unrelated projects
- suppressed contacts
- raw full inbox
- stale active source
- unrelated registry context

## Implementation Gap Checklist

The current system already has:

- email intelligence classification
- saved email rules
- rule creation/update routes
- rule suggestions
- internal reply/forward draft creation
- Gmail read/compose connection checks
- evidence capture from emails
- external action send gate
- one-click `Not executive contact`
- admission exclusion for one-sided senders

The next implementation pass should ensure:

- the Hearth Executive Inbox uses one clean list and one editable draft surface
- visible buttons are reduced to `Send`, `Co-Work with VAL`, and `Not executive contact` where possible
- send from Hearth uses the global email send gate
- outbound receipts feed Relationship, Project, Commitment, Draft Learning, Rule Learning, and Evidence
- saved rules are available from a quiet settings/rules drawer, not the main action surface
- rule suggestions appear only after repeated evidence and explicit confirmation

