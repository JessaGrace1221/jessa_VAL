# VAL System-Wide Source And Click Map

Updated: 2026-07-11

Status: documentation baseline for the next architecture pass.

2026-07-12 local progress:

- first `source_processing_records`, `prepared_artifact_records`, and `surface_registrations` implementation is in place
- admitted relationship-sent documents can produce suggested Project Managers review updates
- Project Managers and Leverage / Ready For You can read the same suggested-project surface registration
- project `Put a pin in it` reminders now persist, record `reopened_at`, and surface due pins in Home Alignment as newly reopened loops
- scoped Project Managers Co-Work now preflights `project_packet` and locks held context to the selected project, selected action, source receipts, and affected artifact/object only
- assigned color-named Project Managers now appear in the Project Manager page header and in the project manager packet
- owner reassignment now updates project metadata and records no-external-action relationship/project link receipts
- live email intelligence and intelligence backfill now route admitted relationship document attachments into source-processing with Gmail/Outlook attachment metadata
- remaining work is authenticated validation, production deployment/verification, and broader source types

## Current Baseline

The current production deployment is the baseline for this map.

- Production URL: `https://jessaval-production.up.railway.app`
- Railway project: `a0402328-e877-406d-8f89-32bd6acdfd19`
- Railway service: `df0839e1-880b-4aa6-8def-56170f4cc980`
- Railway deployment: `060f540b-4b95-4505-8db8-f484e27c40bb`
- Branch: `codex/stewardship-person-packets`
- Commit: `79e199a`
- Commit message: `Add Stewardship relationship evidence freshness map`

This supersedes the July 10 recovery baseline for future work. July 10 remains useful historical recovery context, but the current live Railway deployment is now the operative truth.

## Why This Document Exists

Stewardship exposed a system-wide problem.

The problem is not only that introduction suggestions were noisy. The deeper problem is that sources are not yet forced through one strict processing map before they are allowed to influence drawers, packets, prompts, drafts, projects, relationships, or Home.

VAL needs one rule:

```text
Every source enters once, is witnessed once, receives explicit admission decisions, then feeds every eligible system through source-bound packets.
```

No drawer should guess from its own local data.

No click should start reasoning from scratch.

No transcript, email, calendar event, document, or user correction should be trapped inside only one tool if it belongs in several places.

## Constitutional Rule

VAL does not optimize for information retrieval.

VAL optimizes for relationship judgment, project judgment, priority judgment, and prepared action.

Knowledge exists so better decisions and more thoughtful actions can be prepared.

## The Two Spines

VAL has two mandatory system-wide maps:

1. Source Processing Spine: what arrived, what it means, and which packets/systems may use it.
2. Output Delivery Spine: what VAL prepared, where it is stored, where it appears, and what the user can do with it.

Generated and available are not the same thing.

The system must never say something is created, prepared, written, or ready merely because a model returned text.

Nothing is considered created, prepared, written, or ready until it has been persisted, registered to a visible surface, successfully retrieved by that surface, and given a working review action.

## Source Processing Spine

Every source follows this sequence:

```text
Raw source
  -> Source receipt
  -> Witness observations
  -> Executive Relevance decision
  -> Domain observers
  -> Round Table synthesis
  -> Packets
  -> Durable entity memory
  -> Executive surfaces
  -> Prepared work
  -> Approval
  -> External action or no-action receipt
  -> Learning/outcome update
```

If a step is skipped, VAL becomes noisy.

## Output Delivery Spine

Every prepared output follows this sequence:

```text
Judgment selected
  -> Output requested
  -> Artifact generated
  -> Artifact validated
  -> Artifact persisted
  -> Artifact linked to source and entities
  -> Surface registration created
  -> Surface query confirms retrieval
  -> UI renders artifact
  -> Review action enabled
  -> User sees artifact
  -> Interaction receipt recorded
```

If a step is skipped, VAL creates invisible intelligence.

This applies to:

- email drafts
- meeting overviews
- meeting follow-ups
- introductions
- project suggestions
- tasks
- proposals
- document reviews
- reminders
- calendar suggestions
- Ready For You / Leverage work

## Path Completeness Rule

Every new behavior documented in this map must include an implementation-grade path.

For each source or click, the map must answer:

1. What source/event starts the path?
2. Which classifier or observer receives it?
3. Which packet, record, or memory object gets written?
4. Which visible surface shows the result?
5. Which action can the user take?
6. What receipt proves the action happened?
7. What happens if confidence is low or the match is unclear?

Do not treat an idea as mapped until the intake path, write target, visible surface, review/action path, and receipt are all named.

## Prepared Output Vocabulary

The word "draft" must not be used loosely.

| Term | Meaning | What VAL may say |
|---|---|---|
| Generated Content | Text exists only inside a processing response or temporary memory. | "VAL generated candidate text." |
| Prepared Artifact | Validated content has been persisted inside VAL. | "VAL prepared an artifact." |
| Reviewable Draft | A prepared artifact is registered and visible in a user-facing review surface. | "Ready for review." |
| Provider Draft | A real draft exists in Gmail, Outlook, CRM, or another external provider. | "Saved as a Gmail/Outlook draft." |
| Approved Action | User approved execution or external creation. | "Approved." |
| Executed Action | External provider confirmed completion. | "Sent", "created", "scheduled", or provider-specific confirmation. |

VAL should only say "ready for review" when it is a Reviewable Draft.

VAL should only say "saved as a Gmail draft" or "saved as an Outlook draft" when the provider confirms that provider draft exists.

For email, the safer default is:

```text
Keep the draft in VAL as a Reviewable Draft until the user approves sending.
```

If VAL ever creates a provider draft before final sending, edits made by the user must remain synchronized with the final sent version. If sync cannot be guaranteed, VAL should not create the provider draft first.

## Prepared Artifact Record

Every prepared output must create a `prepared_artifact_record`.

Required shape:

```json
{
  "artifact_id": "",
  "artifact_type": "email_draft|meeting_overview|meeting_follow_up|introduction_draft|project_suggestion|task_draft|document_review|calendar_proposal|proposal_draft|other",
  "status": "requested|generating|generated|validated|persisted|registered|visible|approved|executed|rejected|failed",
  "title": "",
  "body": {},
  "source_refs": [],
  "person_refs": [],
  "project_refs": [],
  "meeting_refs": [],
  "document_refs": [],
  "commitment_refs": [],
  "created_by_observer": "",
  "created_by_round_table": "",
  "storage_target": "",
  "storage_record_id": "",
  "surface_targets": [],
  "surface_registration_ids": [],
  "approval_required": true,
  "allowed_actions": [],
  "validation": {
    "has_content": false,
    "has_source_refs": false,
    "has_entity_links": false,
    "has_surface_target": false,
    "retrievable": false,
    "visible": false
  },
  "failure_reason": "",
  "created_at": "",
  "updated_at": ""
}
```

This is the system-wide definition of ready.

## Surface Registration Record

Every prepared artifact must explicitly register where it should appear.

No UI should search around and infer what might belong there.

Required shape:

```json
{
  "surface_registration_id": "",
  "artifact_id": "",
  "surface": "home_velocity|home_alignment|home_leverage|home_right_panel|executive_inbox|meeting_overview|calendar_event|project_drawer|stewardship|ready_for_you|transcript_detail|document_drawer|commitment_drawer",
  "section": "",
  "priority": "",
  "visibility_state": "queued|visible|dismissed|expired|blocked",
  "display_title": "",
  "display_summary": "",
  "primary_action": "",
  "secondary_actions": [],
  "source_refs": [],
  "created_at": ""
}
```

The source pass or downstream artifact system must say:

```text
Put this artifact here.
```

## Output Visibility Rules

| Artifact | Must appear | May also appear | Must not say |
|---|---|---|---|
| Email draft | Leverage / Ready For You and relevant Executive Inbox thread | Home Leverage if timely | "Sent" or "Gmail draft saved" unless provider confirms. |
| Meeting overview | Transcript detail and Calendar event detail | Meeting Prep, Leverage / Ready For You, Home if executive-worthy | "Overview written" until visible in at least one surface. |
| Meeting follow-up | Leverage / Ready For You and relevant meeting/transcript | Executive Inbox if email reply needed | "Ready" unless review action works. |
| Introduction draft | Stewardship, Leverage / Ready For You, both person profiles | Home Leverage if timely | "Introduction ready" unless both identities and source refs are attached. |
| Project suggestion | Project Managers drawer and relevant source surface | Home right panel if noteworthy | "Project created" unless user approves creation. |
| Document review | Documents drawer and relevant project/person/email | Leverage if review is needed | "Reviewed" before user or VAL review result exists. |
| Task draft | Commitments and Leverage / Ready For You | Home Alignment if it exposes or blocks an open loop | "Task created" unless task record exists. |
| Calendar proposal | Calendar event/Timeline and Leverage | Home if priority | "Scheduled" unless provider confirms. |

Leverage and Ready For You are the same product concept in different visible language. Implementation may keep `ready_for_you` naming, but executive-facing copy should treat Leverage as the place where reviewable prepared work lives.

## Home Output Contract

Home has four major visible areas:

1. Velocity: what happened.
2. Alignment: the open-loop command center.
3. Leverage: things VAL drafted/prepared and are ready for review.
4. Right-hand panel: contextual notices, source receipts, quiet status, and supporting orientation.

Alignment is not a generic priority shelf. Alignment is where VAL surfaces the open loop that most needs executive attention now.

An Alignment item must answer:

```text
What loop is open?
What is needed to close it?
Why now?
What can VAL do next?
```

Examples of Alignment-worthy open loops:

- a missing decision blocks work
- a question needs the executive's judgment
- a payment issue or deadline needs attention
- a stakeholder tension needs a next move
- VAL needs one answer before it can prepare or send something
- an accepted action is still unhandled
- a pinned item has reached its unpin time

Closed loops do not belong in Alignment. They belong in receipts, Velocity, the welcome/context message, and the relevant project/source surface.

When VAL says it prepared something, it should appear:

- on the Leverage card / Ready For You system, and
- in the relevant drawer or entity surface.

Who knows where the executive will start. The same prepared artifact must be discoverable from both the executive queue and the source-specific place where it belongs.

## What Each Layer Is Allowed To Do

| Layer | Allowed to do | Must never do |
|---|---|---|
| Raw source | Preserve provider payload and source identifiers. | Interpret importance. |
| Source receipt | Store where it came from and how to return to it. | Decide whether it matters. |
| Witness | Say what happened in plain facts. | Recommend, rank, draft, or infer motive. |
| Executive Relevance | Decide which systems may use the source. | Write final drawer copy or take action. |
| Observer | Examine one domain only. | Solve the whole problem. |
| Round Table | Resolve tensions and choose judgment. | Read unrelated raw context. |
| Packet | Store structured understanding. | Become visible UI machinery. |
| Durable memory | Preserve accepted source-backed truth. | Overwrite history without a correction trail. |
| Executive surface | Display distilled value. | Decide relevance locally. |
| Prepared work | Draft or prepare reviewable work. | Send, publish, mutate CRM, or schedule without approval. |
| Receipt | Record what happened or did not happen. | Backfill unapproved conclusions. |
| Learning | Improve future routing. | Re-litigate a user decision. |

## The Strict Source Router

Every incoming source must produce a `source_processing_record`.

Required shape:

```json
{
  "source_id": "",
  "source_type": "email|sent_email|transcript|calendar_event|document|crm_update|voice_session|chat|external_action_receipt|user_correction",
  "provider": "gmail|outlook|krisp|google_calendar|crm|upload|val_chat|manual",
  "occurred_at": "",
  "captured_at": "",
  "source_receipt": {},
  "witness_observations": [],
  "executive_relevance": {
    "state": "discard_noise|store_evidence_only|quiet_context|contact_only|relationship_eligible|project_eligible|executive_attention|prepared_work_eligible|suppressed",
    "allowed_consumers": [],
    "blocked_consumers": [],
    "reason": "",
    "source_refs": []
  },
  "domain_routes": [],
  "packet_updates": [],
  "review_updates": [],
  "prepared_work": [],
  "no_action_receipt": "",
  "unknowns": []
}
```

## Domain Route Shape

Each observer receives only admitted source facts plus relevant existing packet context.

```json
{
  "observer": "identity|relationship|project|commitment|calendar|document|executive_inbox|stewardship_intro|ready_for_you|home|teach_val|external_action",
  "admission": "admitted|quiet|blocked|suppressed|needs_review",
  "reason": "",
  "source_refs": [],
  "writes": [
    {
      "target": "person_packet|project_packet|commitment_packet|document_packet|email_packet|calendar_packet|review_update|ready_for_you_item",
      "operation": "append|link|promote|replace|deprecate|escalate|expire|reject",
      "field": "",
      "value": {},
      "approval_required": true
    }
  ]
}
```

## Source Admission Matrix

| Source | Always stored? | Can create person? | Can create project? | Can create prepared work? | Can enter Home? | Notes |
|---|---:|---:|---:|---:|---:|---|
| Sent email recipient | Yes | Yes, strongest automatic signal | Yes, if project evidence exists | Yes, if commitment/draft exists | Sometimes | If the user is in communication with them, they are a relationship. |
| Sent email CC/BCC recipient | Yes | Yes, if human/contact-like | Maybe | Maybe | Sometimes | If an email is sent to anyone, that is relationship evidence. |
| Replied email thread | Yes | Yes | Yes | Yes | Sometimes | A reply is reciprocal relationship evidence. |
| Person included in a thread the user replied to | Yes | Yes, if human/contact-like | Maybe | Maybe | Sometimes | Includes three-way introductions and group threads. |
| Inbound-only email | Yes if not spam | No by itself | No by itself | Rarely | Rarely | Cannot create relationship without another trusted signal. |
| Email with unsubscribe/bulk/list headers | Maybe source-only | No by itself | No | No | No | Does not belong in Executive Inbox unless stronger relationship evidence overrides. |
| Receipt or invoice email | Yes | No by itself | Yes, if project/finance evidence exists | Maybe | Yes, if deadline/payment issue | Can be operationally important without being a relationship. |
| Shipping notice/login/security alert/automated notification | Maybe source-only | No | No by itself | Rarely | Rarely, only if urgent/risky | Quiet Notices lane unless it creates priority risk. |
| No-reply/system source | Maybe source-only | No | No | No by itself | Rarely | Never a relationship. |
| Transcript attendee | Yes | Yes | Yes, if project named or implied | Yes | Sometimes | Attendees are real relationship candidates. |
| Person named in transcript | Yes | Candidate or identity review | Maybe | Maybe | Maybe | Must resolve identity before acting. |
| Explicit transcript intro statement | Yes | Yes | Maybe | Yes | Maybe | Must create Stewardship introduction opportunity. |
| Calendar attendee | Yes | Yes | Maybe | Meeting prep/follow-up | Sometimes | Attendee is a contact unless self/resource/system/private block. |
| Calendar title only | Yes | No | Maybe if project name matches | Maybe | No by itself | Titles are context, not people. |
| Uploaded document | Yes | No by itself | Yes, if project indicated | Yes | Sometimes | Should suggest new project when no project exists but document implies one. |
| CRM contact | Yes | Yes if connected to user context | Maybe | Maybe | Sometimes | CRM alone may be contact, not meaningful relationship. |
| Outscraper/Apollo/public enrichment | Yes | No | No | No | No by itself | Enriches admitted entities only. |
| User correction | Yes | Yes | Yes | Yes | Sometimes | User correction can suppress, promote, or replace. |
| External action receipt | Yes | No by itself | Maybe | Maybe | Sometimes | Feeds learning/outcome. |

## Email Processing Map

### Current Code Anchors

- Sync/storage: `services/valConversationIdentity.js`
- Routes: `services/valConversationIdentityRoutes.js`
- Executive Inbox judgment: `services/valExecutiveInbox.js`
- Draft/send packet boundary: `services/valExternalActions.js`
- Evidence creation in `server.js` around email evidence save paths
- Active UI: Executive Inbox drawer in `hearth-prototype.js`

### Required Processing

Every email must answer:

1. Is this spam, bulk, unsubscribe, receipt, invoice, shipping notice, security alert, notification, system, or no-reply?
2. Did the user send to or reply to this person?
3. Was this person included in `To`, `CC`, or `BCC` on an email the user sent?
4. Was this person included in any thread the user replied to?
5. Has the user manually marked this person important or blocked?
6. Does it contain a commitment, document, project, deadline, question, relationship signal, or draftable response?
7. Which consumers are allowed to use it?

### Required Routes

| Signal | Route |
|---|---|
| User sent or replied | Update person packet relationship evidence. |
| User sent with person in To/CC/BCC | Update person packet relationship evidence for human/contact-like recipients. |
| User replied to thread containing person | Update person packet relationship evidence for human/contact-like participants. |
| Inbound-only from human | Store source; do not create relationship unless another trusted signal admits. |
| Inbound email contains unsubscribe link | Suppress from Executive Inbox by default. |
| Receipt or invoice, especially with attachment | Route to Documents, Projects, and finance/project context. |
| Shipping notice/login/security alert/automated notification | Route to Quiet Notices unless urgent/risky. |
| Payment issue or important deadline | Route to Executive Inbox and Home Alignment. |
| User marks person important | Promote or preserve person packet and raise priority. |
| User marks "Never show me email from this person again" | Suppress from Executive Inbox and relationship surfacing unless user reverses. |
| Attachment/document request | Document observer and project observer. |
| Project-like document with no project | Create project suggestion review update. |
| Commitment language | Commitment observer. |
| Needs response with consequence | Executive Inbox. |
| Email context for meeting attendee | Meeting prep. |
| Relationship warmth/risk | Relationship packet only if person admitted. |
| Introduction language | Stewardship intro observer if identities resolve. |

### Email Relationship Admission Graph

Email relationship admission should use a graph of reciprocal communication, not just the latest inbound sender.

Gold-standard email relationship signals:

- the user sent an email to the person in `To`, `CC`, or `BCC`
- the user replied directly to the person
- the person was included in an email thread where the user replied
- the person was introduced in a thread where the user participated
- the person is also present in calendar, transcript, CRM, project, or manual-important context

Rule:

```text
If the user is in communication with them, they are a relationship.
```

The relationship may be large or small, warm or practical, but it is still a relationship packet candidate.

Recipient-channel rule:

```text
If an email is sent to anyone, that is relationship evidence.
```

This includes `To`, `CC`, and `BCC` when the recipient resolves to a human or contact-like entity.

Known CRM/archive BCC destinations, routing aliases, support queues, no-reply/system addresses, and other non-human destinations should be classified as system/source destinations rather than person relationships.

Three-way introduction example:

```text
Colin emails Sally and Jessa:
  "Sally, I want you to meet Jessa..."

Jessa replies anywhere in that thread
  -> Sally becomes relationship-admissible
  -> Colin remains relationship evidence
  -> thread becomes source evidence for Sally/Jessa relationship context
```

This means VAL must resolve relationship evidence across the whole thread and participant list, not only the sender of the latest message.

### Inbound Sender Suppression And Manual Promotion

Inbound-only senders should not become relationships by volume. They need reciprocal/trusted evidence or an explicit user decision.

Allowed promotion signals:

- user has sent to them
- user has replied in any thread containing them
- they are a calendar attendee
- they are a transcript attendee
- they are a confirmed CRM contact tied to user context
- user manually marks them important

Allowed suppression signal:

```text
Never show me an email from this person again
```

Required suppression behavior:

```text
User suppresses sender
  -> suppress from Executive Inbox
  -> suppress from relationship surfacing
  -> keep source receipts internally for audit and reversal
  -> do not delete historical evidence
```

Unsubscribe links, list headers, bulk sender patterns, no-reply addresses, notification senders, receipts, and obvious system messages should default to source-only or suppressed unless the user explicitly marks the sender important.

### Newsletter And Unsubscribe Rule

If an inbound email contains an unsubscribe link, it does not belong in the Executive Inbox by default.

Default behavior:

```text
Inbound email contains unsubscribe link
  -> classify as newsletter/marketing/bulk unless stronger evidence overrides
  -> store source if useful
  -> suppress from Executive Inbox
  -> do not create a relationship by itself
  -> do not create Stewardship candidate
```

This applies even when the sender display name looks like a real person.

Override behavior:

```text
Suppressed/unsubscribe sender later appears in:
  -> calendar event
  -> transcript
  -> email the user sends
  -> email thread the user replies to
  -> manual important mark

Then:
  -> promote or admit as real relationship
  -> keep unsubscribe evidence as source context, not an active inbox blocker
```

Rule:

```text
Unsubscribe suppresses inbox visibility. Real relationship evidence can override suppression.
```

### Notices, Receipts, Invoices, And Operational Alerts

Receipts and invoices are not relationships by themselves, but they can be operationally important.

Required behavior for receipts/invoices:

```text
Receipt or invoice email arrives
  -> store source
  -> inspect attachments carefully
  -> route PDFs/attachments to Documents
  -> automatically link to obvious matching project when clear
  -> create project/finance evidence when relevant
  -> update project finance/document summary
  -> show quiet receipt: "VAL linked this to Project X"
  -> if project match is unclear, create Quiet Notices action: "Assign this to a project"
  -> user may attach to an existing project or create a new project
```

Reason:

```text
Project management includes tracking project finances.
```

Shipping notices, login/security alerts, two-factor/security codes, and generic automated notifications should not clutter Executive Inbox.

Default behavior:

```text
Automated notice arrives
  -> store if useful
  -> route to Quiet Notices / Notifications
  -> do not create relationship
  -> do not create Stewardship candidate
  -> do not enter Executive Inbox unless urgent or risky
```

Quiet Notices is a secondary, low-pressure lane:

```text
This is here if you need it.
```

Quiet Notices should be visually quiet, such as a small lower-right control or drawer entry. It should not compete with Home, Executive Inbox, Alignment, or Leverage.

Default posture:

```text
Quiet lower-right notice
  -> opens Notices / Notifications
  -> shows low-pressure operational items
  -> shows quiet receipts such as "VAL linked this to Project X"
  -> includes "Assign this to a project" when a receipt/invoice needs placement
```

If the user is already viewing the email in Executive Inbox, the email detail should also show the quiet pre-read receipt:

```text
VAL linked this to Project X.
```

If the receipt/invoice created or updated a project finance summary, include that in the quiet receipt.

New project from receipt/invoice:

```text
User creates new project from receipt/invoice
  -> project packet created
  -> source email/document linked
  -> finance/document summary created automatically
  -> receipt/invoice added as first finance evidence
  -> Quiet Notices receipt recorded
```

Every project should have a finance/document summary, even if it starts empty.

Project finance/document summary visible sections:

```text
Receipts
Invoices
Payment Issues
Important Documents
Open Finance Follow-ups
```

Visibility rule:

```text
Project finance/document summaries live inside the Project drawer only.
```

Placement rule:

```text
Place the finance/document summary quietly toward the bottom of the Project drawer.
```

Quiet Notices may show that VAL linked or assigned a receipt/invoice, but it should not render the full finance/document summary. Keep the summary in the Project drawer so the operational notice lane stays simple.

If any receipt, invoice, system notice, or automated email contains an important deadline, payment issue, service interruption, account access risk, or other consequence, it should become executive-worthy.

Payment issues are always Alignment candidates.

Required Alignment language:

```text
This comes from your project manager for Project XYZ. It is important that we handle this as soon as possible so you can move on to bigger things.
```

Required escalation:

```text
System/finance notice contains payment issue, deadline, or consequence
  -> Executive Inbox
  -> Home Alignment priority candidate
  -> Alignment drawer/card if it becomes the top priority
  -> relevant project/document packet
  -> no relationship packet unless separate relationship evidence exists
```

### Document/Attachment Email Rule

This rule applies to all emails with documents, attachments, proposals, spreadsheets, project files, SOWs, drafts, or project-like material.

Anthony is only the example name. Do not special-case Anthony.

When an admitted relationship sends documents or project-like material, VAL must route the source through Email, Documents, Project Managers, and any relevant entity packets before deciding what should be visible.

Do not create suggested projects from non-relationship senders.

Minimum project-suggestion evidence is a document, such as an agreement, scope, deck, proposal, spreadsheet, SOW, project file, deliverable, or contract.

### Example: Anthony Document Email

Expected behavior:

```text
Anthony email arrives with documents
  -> Source receipt: email_message with attachments
  -> Witness: Anthony sent documents; documents appear connected to an ongoing/new workstream
  -> Relevance: project_eligible + document_eligible + possibly executive_attention
  -> Document observer: create document references
  -> Project observer: if no matching project exists, create "Suggested new project" review update
  -> Executive Inbox: show the email if the user should know Anthony sent what was requested
  -> Documents: show the attached/linked documents
  -> Project Managers: link to matching project or show suggested project review
  -> Suggested project choice: Yes, create this project and assign it a manager / No, this is not a project
  -> Home right-hand panel or welcome context: "Anthony sent you what you asked for"
  -> Leverage / Ready For You: only if VAL prepared a review, summary, draft, or project intake artifact
```

Incorrect outcomes:

- Treating Anthony only as an inbox item.
- Losing the documents because the email did not need a reply.
- Adding documents nowhere.
- Creating a project silently without approval.
- Sending the item to Leverage when VAL did not actually prepare work.
- Showing generic "email may involve document follow-up" text.

Executive Inbox detail for this email must include:

- readable full email content
- prior messages in the thread
- ability to chat with VAL about the email thread
- a visible "What VAL did from this email" section

## Executive Inbox Email Detail Contract

When the user clicks an Executive Inbox email, the main view should show:

1. A quiet pre-read VAL status note.
2. The full latest email only.
3. A clear provider-native button to show the full thread/conversation.
4. `Chat with VAL about this thread`.

The full thread should not be expanded by default.

The user should be able to read the current email first without being buried in the entire thread history.

### Thread Button Language

The button for prior messages should use provider-native language where possible.

If the connected source is Gmail, use the thread/conversation language closest to Gmail conventions.

If the connected source is Outlook, use the conversation/thread language closest to Outlook conventions.

Do not force one universal label if it makes the experience feel unfamiliar to the user's connected email provider.

The functional meaning is always:

```text
Show the prior messages in this email thread/conversation.
```

### Pre-Read VAL Status Placement

The pre-read VAL status should appear above the email body.

Purpose:

```text
Before the executive reads the email details, they should know whether VAL already handled, placed, linked, prepared, or queued the useful parts.
```

Tone:

- quiet
- subtle
- crisp
- not a warning banner
- not a loud success state
- not visually heavier than the email itself

Example:

```text
What VAL did with this
Added the attached documents to Documents and linked them to Project X. No reply was sent.
```

If VAL did nothing beyond storing the email, show a subtle ellipsis:

```text
...
```

Meaning:

```text
VAL looked at this email before the user opened it and found nothing it needed to place, prepare, link, or queue.
```

Do not write a visible "No action taken" sentence in the primary email detail. The ellipsis is enough. Full no-action receipts belong in internal/audit context unless the source type specifically benefits from a visible no-action receipt, such as empty transcripts.

### Email Thread Chat Boundary

`Chat with VAL about this thread` should open a scoped Co-Work session for that email thread.

This is the cleanest boundary because the Co-Work packet can explicitly name the allowed context and block everything else.

Co-Work should follow `VAL_COWORK_WITH_VAL_V1_BUILD_SPEC.md`: a full executive workspace with previous conversations on the left, open working space, clear composer, obvious voice controls, and scoped context boundaries.

Allowed context:

- the selected latest email
- previous messages in that email thread
- the matched relationship/person packet, if admitted
- the matched project packet, if admitted
- source receipts directly attached to that email, relationship, or project packet

Blocked context:

- unrelated emails
- unrelated transcripts
- unrelated calendar events
- unrelated people
- unrelated projects
- general memory that is not attached to the selected thread, relationship, or project
- public enrichment unless already attached to an admitted packet

The session opening receipt should say, internally:

```text
Scope: email_thread
Allowed sources: selected email, thread messages, admitted relationship packet, admitted project packet.
No unrelated source retrieval.
```

User-facing copy should stay simple:

```text
Chat with VAL about this thread
```

### Reply Draft Placement

If VAL prepared a reply draft for the selected email, the draft should appear in the right-side draft panel while the latest email remains readable in the main panel.

This preserves the current three-panel executive pattern:

```text
email list / selected thread
  -> latest email in main reading area
  -> editable draft waiting in the right panel
```

The user should be able to read the email, glance right, edit the prepared draft, and approve it.

The primary button should say:

```text
Approve and send
```

Approval means send.

If the draft is not yet ready for sending, the primary action should not say approve/send. It should ask for the missing context or show that the draft is still being prepared.

Provider drafts should not be created unless the system can guarantee edits remain synchronized with the version that will be sent.

### Missing Context Instead Of Draft

If VAL needs more context before it can draft safely, the right-side panel should show a scoped question/chat box in place of the draft.

User-facing posture:

```text
Answer these questions so VAL can create this draft, then you can approve and send.
```

Rules:

- The question box is scoped to the selected email thread and admitted relationship/project packet.
- VAL asks only the missing information needed to create the draft.
- VAL must not open a broad chat automatically.
- VAL asks one question at a time.
- VAL tells the user how many questions it has.
- After required questions are answered, VAL gives the user room to add any extra context.
- VAL does not immediately generate the draft after the last answer.
- The user clicks `Create draft` when ready.
- When the user clicks `Create draft`, VAL updates the draft packet and replaces the question box with the editable draft.
- The final action remains `Approve and send`.

Example flow:

```text
I have three questions before I can draft this safely.

Question 1 of 3: ...
User answers.

Thanks. Question 2 of 3: ...
User answers.

Great. Last question: ...
User answers.

Anything else you want VAL to know before I create the draft?
[open text box]
[Create draft]
```

The final open text box is important. The system should not constrain the user to only VAL's questions. The user may add additional context, wording, preferences, reminders, links, or instructions before creating the draft.

### Scheduling Email Rule

If an email asks about scheduling, availability, meeting times, or when to meet, VAL should prepare the scheduling answer.

Scheduling phrases include:

- "when are you available"
- "when do you want to meet"
- "can we schedule"
- "what times work"
- "are you free"
- "pick a time"
- similar meeting availability language

Required behavior:

1. Read the selected email thread and requested time window.
2. Check the user's calendar availability.
3. Offer three reasonable times within the requested window when possible.
4. Include the user's calendar booking link as a fallback.
5. If none of the suggested times work, invite the recipient to choose a time through the link.
6. Keep the draft in VAL for review.
7. User edits, then clicks `Approve and send`.

VAL should not ask the user before offering times when the email's requested scheduling window and the user's calendar availability are clear.

Reason:

```text
Scheduling should remove executive work. It should not make the user do the scheduling work inside VAL.
```

If the email asks for "next week", "Tuesday afternoon", "sometime this month", or another clear enough window, VAL should inspect the calendar and prepare the reply.

If the requested window is impossible or unclear, VAL may ask the smallest possible question in the right-side missing-context panel.

Follow-up scheduling behavior:

```text
Recipient accepts a suggested time
  -> VAL confirms the selected time is still available
  -> VAL creates the calendar appointment
  -> VAL sends the confirmation reply
  -> Calendar reflects the meeting
```

Target confirmation language:

```text
Great, we put you in the calendar. You can expect a confirmation email shortly.
```

This is an approved narrow scheduling automation for V1.

It applies only when:

- the recipient is replying to a scheduling thread
- VAL previously suggested the accepted time or the accepted time is clearly inside the availability window VAL offered
- the time is still available on the user's calendar
- the calendar event can be created without ambiguity
- the confirmation reply is purely logistical

In this narrow case, do not put the item in Leverage / Ready For You and do not put it in the email draft panel.

Reason:

```text
The scheduling loop is complete. Additional review would create friction instead of value.
```

The visible result should be:

- the meeting appears on the calendar
- the email thread contains the confirmation reply
- an internal execution receipt is stored

If any ambiguity or risk appears, fall back to the right-side missing-context panel instead of executing automatically.

### Scheduling Conflict And Alternate-Time Rules

If the recipient accepts one of VAL's suggested times but that time is no longer available by the time VAL checks the calendar, VAL should continue handling the scheduling loop automatically.

Required behavior:

```text
Accepted suggested time is no longer available
  -> VAL checks calendar again
  -> VAL replies with new available times, or the calendar booking link
  -> no Leverage item
  -> no user approval required
  -> internal receipt stored
```

Tone example:

```text
It looks like that time is no longer available on Jessa's calendar. Here are a few other options...
```

Or:

```text
It looks like that time is no longer available. Here is Jessa's calendar link so you can choose a time that works for you.
```

If the recipient suggests a different time that VAL did not offer, and that time is available, VAL may pencil it in but should ask the user to confirm.

Required behavior:

```text
Recipient suggests a different available time
  -> VAL checks calendar
  -> VAL pencils in the time as a visible calendar hold
  -> VAL sends or prepares a soft reply only if safe
  -> VAL creates a Leverage / Ready For You confirmation item
  -> user confirms or rejects
```

Target recipient-facing posture:

```text
You're in luck, Jessa is available at that time. I'm going to pencil you in for now and ask Jessa to confirm it.
```

Target Leverage item:

```text
I penciled in Susie for next Thursday at 1:00. Does this work for you?
```

This is different from accepting VAL's own suggested time. A recipient-proposed alternate time deserves user confirmation because VAL did not previously offer that slot.

Use executive language:

```text
Penciled in
```

Do not use `tentative` as the primary user-facing label when `penciled in` is clearer.

The visible calendar hold should read like:

```text
Penciled in: Susie
```

The penciled-in hold should include the source email thread link or source note in the calendar description.

Reason:

```text
When the user opens the hold, they should be able to quickly recognize, "Oh yeah, I know what this is about."
```

If the user confirms the Leverage item:

```text
Penciled in hold
  -> confirmed calendar event
  -> confirmation reply sent
  -> execution receipt stored
```

If the user rejects the Leverage item, VAL should automatically close the scheduling loop politely.

Required behavior:

```text
User rejects penciled-in time
  -> VAL removes or releases the penciled-in hold
  -> VAL sends a polite reply saying Jessa is not available then
  -> VAL includes the calendar booking link
  -> no further back-and-forth automation unless recipient books through the link
  -> execution receipt stored
```

Tone example:

```text
I know I penciled you in, but Jessa actually is not going to be available at that time. Here is her calendar link so you can choose a time that works for you.
```

This should end the scheduling loop. Do not keep offering new rounds of times after the user rejects a recipient-proposed alternate time.

If the recipient books through the user's calendar link, VAL should not send a separate personal confirmation email in V1.

Reason:

```text
The CRM/calendar system already handles booking confirmations. VAL should not duplicate that loop.
```

Example draft logic:

```text
I can do Tuesday at 10:00, Wednesday at 1:30, or Thursday at 3:00.
If none of those work, here is my calendar link and you can choose a time that works for you: {{user.calendar_booking_link}}
```

Onboarding must collect:

```text
{{user.calendar_booking_link}}
```

If the calendar link is missing, the right panel should ask for it as missing context and offer to save it for future scheduling replies.

V1 supports one default calendar booking link.

Reason:

```text
Most scheduling should be clean and simple: one main calendar link, with unavailable time already blocked.
```

Future versions may support multiple booking links, such as discovery call, client meeting, or internal meeting. Do not build multi-link complexity into V1 unless the user explicitly requests it later.

Example "What VAL did from this email":

```text
VAL added these documents to Documents.
VAL linked them to Project X.
VAL prepared a suggested new project review because no existing project clearly matched.
No email was sent and no project was created without approval.
```

## Transcript Processing Map

### Current Code Anchors

- Intake service: `services/valTranscriptIntelligence.js`
- Routes: `services/valTranscriptIntelligenceRoutes.js`
- Transcript storage and processing: `processTranscriptPayload` in `server.js`
- Evidence creation: `saveEvidenceItem`, `saveEvidenceObservation`
- Relationship engine: `runRelationshipEngineForObservations`
- Ready For You candidates: `services/valReadyForYou.js`

### Required Processing

Every transcript must answer:

1. Is the transcript usable?
2. Who attended?
3. Who was explicitly named?
4. What changed because this was said?
5. Were commitments made?
6. Were introductions promised or requested?
7. Were projects advanced, created, blocked, or clarified?
8. Were documents, proposals, spreadsheets, or deliverables discussed?
9. Which entities should receive packet updates?

### Required Routes

| Signal | Route |
|---|---|
| Attendee | Person packet admission/update. |
| Named person | Person packet update, person candidate, or identity review, depending on evidence strength. |
| "I want to introduce A to B" | Reviewable Stewardship introduction opportunity in Leverage and Stewardship. |
| Commitment/promise | Commitment packet and Ready For You if preparable. |
| Project movement | Project packet. |
| New project idea | Suggested project review update. |
| Document/proposal/SOW mentioned | Document/project observer. |
| Meeting follow-up | Ready For You and/or Executive Inbox draft. |
| User preference/rule | Teach VAL candidate, approval required. |

### Transcript Relationship Admission

If someone is in a meeting with the user, that person is a relationship. Transcript attendees are a gold-standard relationship signal for VAL.

Required behavior:

```text
Transcript processed
  -> resolve attendees/participants
  -> create or update person packet for each real human attendee
  -> attach transcript as relationship evidence
  -> scan named people for relationship/action/project/introduction relevance
  -> create or update packets for named people when evidence is strong enough
  -> otherwise create identity review or candidate record
```

Named people should not be ignored. However, attendee admission is stronger than a passing mention. A named person becomes packet-worthy when the transcript ties them to a relationship, need, offer, commitment, project, document, decision, or explicit introduction.

### Explicit Introduction Mentions

When a transcript clearly says the user wants to introduce one person to another, VAL should create a reviewable introduction opportunity immediately.

Required behavior:

```text
Transcript says "I want to introduce X to Y"
  -> create introduction opportunity record
  -> update both person packets with source-bound needs/offers/evidence
  -> create Leverage / Ready For You item: "I found an introduction you mentioned. Review?"
  -> show in Stewardship Suggested Introductions
  -> show on relevant person profiles
  -> draft only after identities resolve
```

This should not wait for the user to click a search or match button. Explicit user intent in a transcript is stronger than inferred keyword matching.

### Example: Terrie Transcript

Expected behavior:

```text
Conversation with Terrie is processed
  -> Source receipt: transcript
  -> Witness: Jessa said she wanted to introduce Terrie to Kareemah and why
  -> Identity observer: Terrie = attendee/admitted person; Kareemah = named person, resolve against existing contacts/packets
  -> Stewardship intro observer: create explicit introduction opportunity
  -> Person packets: update Terrie needs/offers/evidence and Kareemah relevant offer/evidence if source-bound
  -> Suggested Introductions: Terrie <-> Kareemah appears because explicit transcript evidence exists
  -> Leverage: "I found an introduction you mentioned. Review?"
  -> Review Draft: draft is prepared only after identities resolve
```

Incorrect outcomes:

- Missing the introduction entirely.
- Turning the transcript into "document request/follow-up."
- Suggesting unrelated people because of keyword overlap.
- Requiring a button click before scanning the transcript.
- Treating transcript title or generic classifier text as the reason.

## Calendar Processing Map

### Current Code Anchors

- Meeting prep service: `services/valMeetingPrep.js`
- Routes: `services/valMeetingPrepRoutes.js`
- Calendar routes in `server.js`
- Context matching: `/api/val/calendar/matching-transcripts`, `/api/val/context/link-transcript`

### Required Processing

Every calendar event must answer:

1. Is this a real meeting, focus block, private event, resource, duplicate, or system item?
2. Who are the attendees?
3. Are attendees known people, new people, resources, or generic/system addresses?
4. What project, relationship, transcript, email, document, or commitment context should be attached?
5. Is meeting prep needed?
6. Is post-meeting capture needed?

### Required Routes

| Signal | Route |
|---|---|
| Human attendee | Person packet admission/update. |
| Event tied to project | Project packet. |
| Event tied to transcript | Transcript linkage. |
| Event includes documents/agenda | Document/project observer. |
| Prep-worthy meeting | Meeting prep packet and Ready For You candidate. |
| Routine/focus/private block | Store or suppress; no person/project creation. |

### Attendee Relationship Admission

When a new calendar event arrives, VAL should automatically create or update relationship packets for every human attendee.

Required behavior:

```text
Calendar event arrives
  -> classify event
  -> resolve attendees
  -> filter out self, rooms, resources, system addresses, private blocks, and generic calendars
  -> create or update person packet for each human attendee
  -> attach the event as relationship evidence
  -> link relevant project, email thread, transcript, or document context when available
```

Rule:

```text
Calendar attendees are real relationship candidates unless evidence says they are not human contacts.
```

This does not mean every attendee becomes visible in every executive surface. Admission into packets is separate from visibility. The executive UI should only surface the relationship when there is a reason to review, prepare, introduce, or act.

### Meeting Overview Visibility

For every real meeting, the before/after context must be visible in every place an executive might reasonably start.

Before the meeting:

```text
Calendar event
  -> Meeting Prep packet
  -> visible inside Calendar event detail
  -> optionally visible in Leverage / Ready For You if VAL prepared something
  -> optionally visible on Home if executive-worthy
```

After a linked transcript:

```text
Transcript processed
  -> Meeting Overview artifact
  -> visible inside Transcript detail
  -> visible inside Calendar event detail
  -> linked to attendee person packets
  -> linked to project packet if applicable
  -> follow-up draft visible in Leverage / Ready For You if prepared
```

Recurring meetings must preserve continuity:

- last meeting overview
- open follow-ups from prior meeting
- what changed since last meeting
- what is coming up in the next meeting
- attendee/person/project context

Recurring meeting calendar detail should include a continuity block:

```text
Last meeting
This meeting
Open loops
Relevant changes
```

This block belongs inside the calendar event view and may also feed meeting prep, Home, Leverage, transcript detail, and project/relationship surfaces when relevant.

If a transcript contains no tasks, no follow-ups, no commitments, no project change, and no relationship signal, the transcript detail should show a visible no-action receipt:

```text
Nothing needs your attention from this transcript.
```

This is especially important for transcripts so the user does not waste cognitive energy opening something empty.

## Document Processing Map

### Current Code Anchors

- Document service: `services/valDocuments.js`
- Routes: `services/valDocumentsRoutes.js`
- Upload path: `/api/val/files`
- Google Docs paths in `server.js`
- Project creation path: `/api/projects/create`

### Required Processing

Every document must answer:

1. What is this document?
2. Did it arrive from email, upload, Google Docs, transcript, CRM, or manual project creation?
3. Which project/person does it belong to?
4. If no project exists, should VAL suggest one?
5. Does it create a task, deadline, decision, draft, or review update?

### Required Routes

| Signal | Route |
|---|---|
| Existing project match | Link document to project packet. |
| Person-specific document | Link document to person packet. |
| Unknown project but clear ongoing work | Suggested project review update. |
| Receipt/invoice with obvious project match | Automatically link to project, create finance/project evidence, update finance/document summary, and record quiet receipt. |
| Receipt/invoice with unclear project match | Quiet Notices action: "Assign this to a project." |
| New project from receipt/invoice | Create project packet and finance/document summary automatically. |
| Contract/proposal/SOW/invoice | Project + external action risk gate. |
| Reference document | Document library only unless relevance admits. |

## Project Processing Map

### Current Code Anchors

- Project index/dossier routes in `server.js`
- Project Manager specification: [VAL_PROJECT_MANAGER_ROUND_TABLE_AND_PACKETS.md](./VAL_PROJECT_MANAGER_ROUND_TABLE_AND_PACKETS.md)
- Click contract: [HEARTH_CLICK_CONTRACTS.md](./HEARTH_CLICK_CONTRACTS.md)
- Relationship/project understanding docs
- Review updates: `services/valReviewUpdates.js`
- Project UI in `hearth-prototype.js`

### Required Project Manager Principle

Project Managers is VAL's execution command center.

The Project Managers drawer/card is an entry point. The active project itself should open as a full Project Manager page.

The Project Manager page must show what the dedicated Project Manager is doing, has done, is preparing, is watching, or needs from the user.

Every displayed Project Manager action must be clickable only if it has a scoped action packet.

Required path:

```text
Source arrives
  -> Witness
  -> Executive Relevance
  -> Project Admission Packet
  -> Project Manager Round Table
  -> Project Manager Action Packet
  -> Project Dossier action layer
  -> item-scoped Co-Work / review / approval / receipt
```

Click scope rule:

```text
Project Manager action click
  -> current project
  -> selected project-manager action
  -> attached source receipts
  -> affected artifact/object only
  -> no unrelated project context
```

User-facing opening posture:

```text
We are looking only at this project item.
```

This applies when the Project Manager says VAL built, linked, prepared, noticed, updated, monitored, blocked, assigned, summarized, or needs context for one specific thing.

### Full Project Manager Page Path

Required click path:

```text
Project Managers card / drawer row
  -> admitted project
  -> full Project Manager page
  -> Project Manager Packet
  -> page sections
  -> project-manager action packets
  -> item-scoped Co-Work / review / approval
```

The page must not be a generic CRM/project record.

It should answer:

```text
What is this project?
Where does it stand?
What is VAL doing?
What has VAL already handled?
What needs judgment?
What is blocked?
What is next?
What did VAL prepare?
What changed since the last review?
What can safely wait because VAL is watching it?
```

The first screen is dynamic. It should not always start with identity, snapshot, or project charter.

Dynamic top-module priority:

```text
Critical project issue
  -> Needs your judgment
  -> Prepared for you
  -> Today's reprioritization
  -> Project movement
  -> Execution adjustment
  -> Project reset
  -> Quietly watching
```

Required full-page sections:

- identity/header
- current status
- project charter
- constraints: scope, time, cost, quality
- lifecycle phase
- workstreams / work breakdown
- stakeholders, sponsors, and team
- communication/status rhythm
- risk, blockers, and trade-offs
- Project Manager actions
- prepared work
- recent activity
- next best actions
- finance/document summary near the bottom
- lessons learned when applicable

### Dynamic Project Manager Focus Map

Every dynamic top module must be tied to a real path.

| Focus module | Trigger | Write target | Surface | User action | Receipt |
|---|---|---|---|---|---|
| Critical Project Issue | Payment issue, deadline, failed dependency, blocked/unclear owner, angry stakeholder, relationship tension, service/access risk, launch/legal/contract risk | Project Risk Packet + Project Manager Action Packet + recommended next move | Project top module and Alignment | Approve recommendation/draft, answer scoped question, add context, approve owner assignment | Issue receipt, updated project packet, Home handled receipt when resolved |
| Needs Your Judgment | Option choice, strategic trade-off, sensitive relationship decision, scope change, escalation, external action approval, unclear owner, or one missing answer blocks safe progress | Project Manager Judgment Packet + decision/action packet + prepared artifact when useful | Project top module, Alignment, Leverage if prepared work exists | Choose option, approve recommendation, add context, ask scoped question, prepare draft, approve external action, put a pin in it | One-line decision receipt |
| Prepared For You | VAL drafted/prepared something ready for review and approval | Project Prepared Work Packet + persisted artifact + surface registration | Project top module/action layer and Leverage | Review, edit/refine, approve, ask scoped question, add context, execute after approval, put a pin in it | Simple action receipt |
| Today's Reprioritization | Any new project-related source/event or user opens project page | Project Manager Focus Packet + updated project priority order | Project top module when reprioritized | Accept, choose different top priority, ask why, add context, ask VAL to prepare, create task if needed, safe stakeholder message, put a pin in it until date/time | Reprioritization receipt |
| Project Movement | Forward/backward movement: task, document, payment, question, clarification, meeting, dependency, status, or open-loop change | Project Movement Packet + open-loop update | Home welcome/context, Project top module/recent activity, Velocity, Project action layer | Open source, follow up, ask what changed, add context, prepare next step, create task, update project plan, safe stakeholder message, put a pin in it until date/time | Movement receipt |
| Execution Adjustment | Scope, time, cost, quality, resource, stakeholder expectation, dependency, launch, or risk trade-off appears | Project Execution Adjustment Packet + plan/draft update when useful | Project top module; Alignment only when open-loop judgment is needed; Velocity if project reality moved; Leverage if prepared work exists | Accept adjustment, choose another option, ask alternatives, add context, update project plan, draft stakeholder message, put a pin in it until date/time | Trade-off adjustment receipt |
| Project Reset | End of day, after meetings, after major actions, after open loops change, when user opens VAL the next morning, or stale open loops need restatement | Project Reset Packet | Project page always; Home welcome/context only when something shifted or needs attention; Velocity when meaningful movement is recorded; Alignment only when an unresolved open loop needs the user | Confirm, add context, prepare tomorrow's first move, create task, put a pin in it until date/time | Reset receipt |
| Quietly Watching | No user action needed but project monitoring rules exist | Project watch item + Board of Observers summary | Board of Observers project-by-project top section; Project page quiet section or top module only when nothing higher exists; Home only when watch condition changes | Open watcher, change rule, add context, prepare next move, put a pin in it, stop watching | Watching receipt |

Path:

```text
Source/time trigger
  -> Witness observation
  -> Project Manager Round Table
  -> dynamic focus module selection
  -> Project Manager Focus/Action Packet
  -> full Project Manager page top module
  -> item-scoped action
  -> receipt
  -> project memory update
```

If this path is incomplete, VAL must not imply that something is being handled.

Critical Project Issue rules:

```text
Critical issue detected
  -> route to Alignment
  -> place at top of Project Manager page
  -> attach one-sentence clickable source proof
  -> prepare recommended next move
  -> prepare draft when useful
  -> ask before assigning an owner
```

When resolved:

```text
Issue handled
  -> update project packet
  -> create issue resolution receipt
  -> show handled note in Home welcome/context message
```

Critical issue source proof should be brief, not a source dump.

Example:

```text
Source proof: There was tension in this morning's call during the partner timeline discussion.
```

Critical issue question flow:

```text
VAL has 4 questions
  -> ask question 1
  -> user answers
  -> ask question 2
  -> user answers
  -> ask question 3
  -> user answers
  -> ask final question
  -> allow additional context
  -> continue preparing/resolving
```

Needs Your Judgment rules:

```text
Judgment needed
  -> prepare clear options when options exist
  -> recommend one path
  -> attach brief clickable source proof
  -> explain consequence if delayed
  -> prepare action packet
  -> prepare draft/artifact when useful and route it to Leverage
  -> place judgment at top of Project Manager page
  -> route consequential judgment to Alignment
```

One-answer blocker:

```text
I need one answer before I can prepare this.
```

If one missing answer blocks project movement or prepared work, it belongs in Alignment.

Owner assignment:

```text
VAL can infer likely owner from evidence, but must ask before assigning ownership when the assignment is consequential or ambiguous.
```

Use:

```text
Put a pin in it.
```

Do not use `not now` as the primary label.

Decision receipt should be one simple line:

```text
VAL just updated the project plan.
```

Prepared For You rules:

```text
Prepared work exists
  -> persist artifact
  -> link to project and source
  -> register on Project Manager page
  -> register in Leverage
  -> show why/what/where/needed/approval proof
  -> enable review/refine/approve/context actions
```

Required proof:

```text
Why I prepared this
What I prepared
Where it is
What I need from you
What happens if approved
```

If questions are needed:

```text
VAL has questions
  -> ask one at a time
  -> allow additional context
  -> update prepared work after answers
```

Prepared work receipt:

```text
VAL just created/sent/saved/added [what it did].
```

Today's Reprioritization rules:

```text
Any project-related change
  -> re-scan emails/transcripts/calendar/documents/commitments/payment issues/relationship tension tied to project
  -> update priority order
  -> recommend what should happen first
  -> show top module if priority changed
```

Top module order:

```text
What VAL recommends first
What changed
What is at risk
Who needs clarity
What VAL already handled
```

User may choose a different priority from the priority list.

Stakeholder messaging is allowed only when VAL has the right stakeholder identity and enough context.

Global `Put a pin in it` rule:

```text
Put a pin in it
  -> ask "Until when?"
  -> user selects date/time
  -> store pin-until timestamp
  -> keep watching
  -> at that time, reopen the loop in Project Managers and Home Alignment
  -> let the user open the project, pin it again, or mark only the reminder handled
```

Receipt:

```text
Reminder cleared. The project record stayed intact. No external action was taken.
```

Project Movement rules:

```text
Movement detected
  -> classify direction as forward or backward
  -> update project current reality
  -> update open loops
  -> if an open loop needs executive attention, create/update Alignment open-loop packet
  -> create movement packet
  -> show in Home welcome/context
  -> show in Project Manager page
  -> show in Velocity
  -> show in Project action layer
```

Open-loop rule:

```text
If something was presented and has not been done, it is an open loop.
```

Alignment rule:

```text
Alignment is for open loops.
Movement appears in Alignment only when it opens, reopens, blocks, or escalates a loop that needs executive attention.
Closed-loop movement appears as a receipt, in Velocity when meaningful, and on the relevant project/source surface.
```

Visible movement display:

```text
What changed
Forward or backward
One-line source proof
Follow up action
```

Do not show visible clutter:

```text
why this matters
affected people
broad priority analysis
affected document/task/deadline lists
```

Movement source proof should be one line and clickable when possible.

Primary movement action should be whatever VAL believes is needed, such as:

```text
Follow up
```

Unpin behavior:

```text
Put a pin in it
  -> ask "When do you want me to unpin this for you?"
  -> user selects date/time
  -> surface again at that date/time: "This is unpinned. Let's work on it."
```

Execution Adjustment rules:

```text
Project-related source or event changes a constraint
  -> detect whether scope, time, cost, quality, resources, stakeholder expectations, dependency, launch pressure, or risk changed
  -> compare against the current project plan
  -> identify the trade-off
  -> prepare clear options
  -> recommend the least-risk path
  -> decide whether an executive open loop exists
  -> write Project Execution Adjustment Packet
  -> update Project Manager page
```

Execution Adjustment is not a warning label. It is the place where VAL says:

```text
The project plan cannot responsibly stay exactly the same.
Here is the trade-off.
Here is the least-risk adjustment.
```

Required visible display:

```text
What changed
The trade-off
VAL's recommendation
Consequence if delayed
One-line source proof
Available actions
```

Surface routing:

```text
Project top module: whenever Execution Adjustment is active
Alignment: only if the trade-off creates an open loop needing executive judgment
Velocity: when the trade-off represents meaningful movement in project reality
Leverage: when VAL prepared a plan update, message, schedule, or other reviewable artifact
```

Allowed actions:

```text
Accept VAL's adjustment
Choose another option
Ask for alternatives
Add context
Ask VAL to update the project plan
Ask VAL to draft a stakeholder message
Put a pin in it
```

Receipt example:

```text
VAL just updated the launch plan to protect quality and moved the content deadline to Friday.
```

Project Reset rules:

```text
End of day, meeting, major action, open-loop change, morning open, or stale-loop trigger
  -> scan project movement
  -> scan open loops
  -> scan prepared work
  -> scan decisions made
  -> scan unresolved issues
  -> write Project Reset Packet
  -> update Project Manager page
```

Project Reset answers:

```text
What moved
What closed
What opened
What is still unresolved
Tomorrow's likely first move
```

Home routing rule:

```text
Project Reset appears in Home welcome/context only when something shifted, closed, opened, or needs attention.
```

Surface routing:

```text
Project page: always stores the reset
Home welcome/context: only when something changed or needs attention
Velocity: when reset records meaningful movement
Alignment: only when reset identifies an unresolved open loop needing the user
Leverage: only when VAL prepared something reviewable during reset
```

Allowed actions:

```text
Confirm
Add context
Ask VAL to prepare tomorrow's first move
Create task
Put a pin in it
```

Receipt example:

```text
VAL just reset this project for tomorrow: two loops closed, one decision still needs you.
```

Quietly Watching / Board of Observers rules:

```text
Source or user action creates a monitoring condition
  -> identify project if applicable
  -> write project watch item
  -> add/update Board of Observers project summary
  -> keep watching without creating a task
  -> escalate only when the watched condition changes or becomes actionable
```

The Board of Observers is the primary surface for quiet watching.

Top section:

```text
Project-by-project watching summary
Projects listed alphabetically for now
```

Each project watch summary should show:

```text
Project name
What VAL is observing
What would trigger action
Last checked or source proof
Whether anything needs the user
Available actions
```

Actions:

```text
Open source
Change a rule
Add context
Ask VAL to prepare something
Put a pin in it
Stop watching
```

Layout rule:

```text
Board of Observers top: project-by-project watching summary
Board of Observers below: existing observer details, diagnostics, and observer-specific information
```

Home rule:

```text
Quiet watching does not show on Home by default.
Home may show quiet watching only when a watch condition changes, becomes actionable, or the user explicitly opens a watching surface.
```

Alignment rule:

```text
A watched item becomes Alignment only when it becomes an open loop needing executive attention.
```

Receipt example:

```text
VAL is watching for Anthony's signed agreement. No action is needed right now.
```

The Project Manager page should be driven by the Project Manager Round Table and PM source material, especially:

- reprioritize before reacting
- scan for blockers, updates, and noise
- detect hidden dependencies and early warning signs
- clarify ownership and misunderstandings
- make trade-offs explicit
- close loops the same day
- document decisions immediately
- prepare tomorrow's likely trade-offs

### Required Project Admission

A project may be created or suggested when one or more are true:

- user explicitly creates it
- multiple related emails reference the same workstream
- transcript names an ongoing initiative
- document/proposal/SOW implies an ongoing deliverable
- calendar meeting recurs around a named initiative
- CRM opportunity exists
- task/commitment chain implies ongoing work

Project suggestions must be review updates, not silent creation, unless user explicitly submits a project form.

## Person Packet Processing Map

Person packets are infrastructure. They are not the executive surface.

Required fields:

```json
{
  "identity": {},
  "aliases": [],
  "admission_sources": [],
  "last_direct_communication_at": "",
  "relationship_to_user": "",
  "needs": [],
  "offers": [],
  "constraints": [],
  "evidence": [],
  "introduction_commitments": [],
  "project_links": [],
  "document_links": [],
  "calendar_links": [],
  "email_links": [],
  "transcript_links": [],
  "outcomes": [],
  "review_flags": []
}
```

### Person Admission

Admit as person/relationship when:

- user sent email
- user replied
- person replied in a reciprocal thread
- person attended calendar event
- person attended transcript meeting
- user manually marked important
- CRM contact is connected to user context
- person is part of a project/commitment/document with reliable identity

Block or hold:

- inbound-only email with no reciprocal/trusted signal
- unsubscribe/bulk/list sender
- no-reply/system/receipt/notification
- generic mailbox
- raw handle or phone number without identity
- calendar resource room
- event title pretending to be a person
- public enrichment without prior admission

## Stewardship Introduction Processing Map

Stewardship V1 has one purpose:

```text
Help the executive make valuable introductions.
```

It should consume person packets, not invent matches.

Suggested introduction requirements:

1. Both people have resolvable identities.
2. Both people are admitted person packets.
3. Needs/offers or explicit source evidence supports the match.
4. At least one person has direct communication with user in the last 14 days.
5. A single clear "Because..." sentence can be written.
6. Evidence source is attached.
7. No constraint says they already know each other, should not meet, or are a poor fit.

Manual introduction creation requirements:

1. User may select any two admitted people.
2. VAL compares needs, offers, constraints, relationship, and evidence.
3. If weak, VAL says: "I do not see a strong reason to introduce these two yet."
4. Drafting remains review-only.
5. Sending requires explicit approval.

### Introduction Output Visibility

Suggested introductions and introduction drafts must appear in:

- Stewardship Suggested Introductions
- Leverage / Ready For You
- the profile for Person A
- the profile for Person B

They may also appear in Home Leverage when timely or especially high value.

The canonical review action is still review-only:

```text
Review Draft -> edit/refine -> approve/send
```

No external email is sent until explicit approval.

## Home Processing Map

Home is downstream. Home does not decide source truth.

Home may show only:

- Velocity: what changed and passed Velocity Round Table.
- Alignment: the most important open loop with a Why Now Packet.
- Leverage: prepared work ready for review.
- Right-hand panel: contextual notices, quiet status, and source receipts that orient the executive without becoming a task queue.

### Home Right-Hand Panel

The right-hand panel should remain substantially as it is now.

Required stable elements:

- next calendar event
- button/control that opens the full calendar view
- Co-Work with VAL icon/control
- Teach VAL button/control

Do not redesign this panel during the source-spine work unless the user explicitly asks for it.

The panel may show quiet contextual notices only when they support the existing panel purpose and do not replace the calendar/Co-Work/Teach VAL functions.

The Co-Work control should open the full Co-Work workspace described in `VAL_COWORK_WITH_VAL_V1_BUILD_SPEC.md`, not a cramped chat widget.

Inputs:

- Executive Briefing
- Ready For You
- transcript intelligence
- email classification
- calendar/meeting prep
- relationship/project packets
- commitments

Home must not show:

- raw source lists
- generic "interesting" facts
- unadmitted relationship/project context
- debug packet language

### Home Placement Rules

| Event/result | Home placement |
|---|---|
| "Anthony sent you what you asked for" | Right-hand panel or welcome/context notice; not Leverage unless VAL prepared a review artifact. |
| Email draft ready | Leverage. |
| Introduction draft ready | Leverage, and Stewardship. |
| Meeting overview ready | Leverage only if it needs review or creates prepared follow-up; otherwise Calendar/Transcript surfaces. |
| Open loop requiring judgment, escalation, answer, or next move | Alignment. |
| Open loop closed or handled | Welcome/context receipt, Velocity when meaningful, and relevant source/project surface. |
| Meaningful change in source reality | Velocity. |
| Processed source with nothing needed | Usually quiet; visible no-action receipt inside source detail, especially transcripts. |

## Leverage / Ready For You Ordering

Leverage / Ready For You should be ordered chronologically by creation time.

Default order:

```text
oldest reviewable item at the top
most recent reviewable item at the bottom
```

Reason:

The executive should be able to move through prepared work in the order it was created, remember the flow of meetings and source events, and avoid losing older prepared items under newer ones.

Leverage may still display artifact type, source, and urgency labels, but those labels should not become the default grouping unless the user later asks for it.

## Click Processing Map

Every click must have:

```text
surface -> selected entity/source -> packet -> prompt/rule -> allowed actions -> receipt
```

If a click does not have a packet, it should be disabled or converted to a source-opening action.

### Click Families

| Click family | Packet required | Allowed behavior |
|---|---|---|
| Home card | `home_source_packet` | Open source, explain, review prepared work. |
| Executive Inbox item | `email_packet` | Review/draft/co-work/not-executive-contact. |
| Transcript row | `transcript_packet` | Show notes, action items, decisions, people/projects, scoped Co-Work. |
| Calendar event | `timeline_packet` or `meeting_prep_packet` | Meeting prep, match transcript, contact candidate review. |
| Stewardship suggestion | `stewardship_intro_packet` | Review reason, draft intro, approve/not now. |
| Manual introduction | `stewardship_intro_packet` | Compare two people, draft only if supported. |
| Project row | `project_packet` | Open dossier, source review, prepare work. |
| Document row | `document_packet` | Present, update, link context, prepare send packet. |
| Commitment row | `commitment_packet` | Draft email, create task, schedule, complete, show source. |
| Lead preview row | `lead_intelligence_packet` | Approve/hold/import approved only. |
| VAL/Teach action | `val_os_packet` | Teach, correct, connect, approve learning. |
| External action | `external_action_packet` | Fresh risk check, final approval, execute, receipt. |

## Current System Map

### Existing Source Stores And Services

| Area | Primary files | Current role |
|---|---|---|
| Email identity and thread store | `services/valConversationIdentity.js` | Normalizes messages, threads, conversations. |
| Executive Inbox | `services/valExecutiveInbox.js` | Classifies email conversations, drafts/revises email. |
| Transcript intelligence | `services/valTranscriptIntelligence.js` | Extracts commitments, tasks, relationship/project signals, ready-for-you candidates. |
| Meeting prep | `services/valMeetingPrep.js` | Builds meeting prep packets and handoffs. |
| Intelligence spine | `services/valIntelligenceSpine.js` | Event pass, observers, Round Table, Chief recommendation, Ready For You items. |
| Documents | `services/valDocuments.js` | Lists and references documents. |
| Commitments | `services/valCommitments.js` | Commitment ledger and follow-up actions. |
| Review updates | `services/valReviewUpdates.js` | Approval layer for proposed updates. |
| Ready For You | `services/valReadyForYou.js` | Reviewable prepared work. |
| External actions | `services/valExternalActions.js` | Approval packets and execution boundary. |
| Relationship actions | `services/valRelationshipActionIntelligence.js` | Person packets, intro candidates, admission decisions. |
| Relationship/project dossiers | `services/valRelationshipDossier.js` | Relationship understanding and source-backed dossier structures. |
| Hearth packet preflight | `server.js` packet hydration functions | Click packet preflight and truth lineage helpers. |

### Existing Gaps

These are architecture gaps, not blame:

1. Source processors exist, but not every source is forced through the same strict record.
2. Drawers still have some local reasoning helpers.
3. Transcript introduction promises are not yet promoted into first-class intro opportunities reliably.
4. Email attachments/documents are not reliably routed to project suggestions.
5. Calendar attendee admission exists in pieces, but source route outcomes need one map.
6. Public enrichment can still look tempting as identity evidence; it must enrich only admitted entities.
7. Current tests assert contracts in pieces, not the full source-to-click map.

## Required Universal Pass

Build a `Source Processing Pass` that every ingestion route calls.

Required input:

```json
{
  "source_type": "",
  "provider": "",
  "source_id": "",
  "raw": {},
  "text": "",
  "participants": [],
  "attachments": [],
  "occurred_at": "",
  "source_url": ""
}
```

Required output:

```json
{
  "source_processing_record": {},
  "evidence_item": {},
  "observations": [],
  "domain_routes": [],
  "packet_updates": [],
  "review_updates": [],
  "prepared_artifact_records": [],
  "surface_registrations": [],
  "ready_for_you_candidates": [],
  "external_action_packets": [],
  "no_action_receipt": ""
}
```

## Implementation Sequence

Do not start by fixing Stewardship UI again.

Start with the spine.

The user chose this sequence because the shared source-processing spine will improve all of VAL, not only Project Managers.

1. Define `source_processing_record` schema and tests.
2. Define `prepared_artifact_record` schema and tests.
3. Define `surface_registration` schema and tests.
4. Add shared source classifier helpers for spam/bulk/system/self/private/resource/source-only.
5. Route transcripts through a first-class source pass that emits intro commitments, project signals, document signals, person updates, prepared artifacts, surface registrations, and no-action receipts.
6. Route synced email through the same source pass, including attachment/document/project-suggestion handling and "What VAL did from this email" receipts.
7. Route calendar events through the same source pass, including attendee admission, recurring-meeting continuity, meeting overview visibility, and private/resource filtering.
8. Create first-class `introduction_opportunity` records from transcripts/emails/user teaching.
9. Create first-class `suggested_project` review updates from relationship-sent documents.
10. Update drawers to consume only packet/review/artifact/registration outputs from the source and delivery passes.
11. Add click preflight tests proving each click uses the correct packet, artifact, source, and review action.
12. Implement Project Managers first-slice actions: approve/reject suggested project, assign one color-named manager, choose/create owner, keep scoped Co-Work locked to the selected project/action packet, and keep `Put a pin in it` reminders persisted with Alignment resurfacing.
13. Backfill existing sources through the new pass.

## Acceptance Cases

### Terrie/Kareemah

Given a transcript where Jessa tells Terrie she wants to introduce her to Kareemah:

- Terrie is admitted from transcript attendee context.
- Kareemah is resolved or put in identity review.
- The transcript creates an `introduction_opportunity`.
- Stewardship Suggested Introductions shows it after identity resolution.
- Leverage / Ready For You shows the reviewable introduction draft if VAL prepared one.
- Both person profiles show the suggested introduction.
- The reason is source-specific, not generic.
- Review Draft uses transcript evidence.

### Anthony Documents

Given an email from Anthony with documents:

- Email source is stored.
- Attachments/documents are routed to Document observer.
- Project observer checks for existing project.
- If Anthony is an admitted relationship and no project exists, VAL creates a suggested project review update.
- The suggested project shows `Yes, create this project and assign it a manager` and `No, this is not a project`.
- If approved, VAL creates the project, assigns one color-named Project Manager, and asks for or infers the one project owner with reassignment support.
- If rejected, VAL records the rejection and does not repeat the same suggestion from the same source pattern.
- Executive Inbox can show the email as "Anthony sent what you asked for" with readable full content and prior thread messages.
- Executive Inbox shows what VAL did with the email: document links, project links, suggested project review, or no prepared work.
- Leverage / Ready For You is used only if VAL prepared a reviewable artifact.
- Documents remain visible in both Documents and the Project Manager page.

### Spam/Newsletter

Given an inbound email with unsubscribe/bulk/list indicators:

- Source may be stored.
- No person packet is created.
- No relationship is created.
- No Executive Inbox item is created.
- No Stewardship candidate is created.

### Calendar Attendee

Given a calendar event with human attendees:

- Attendees are person candidates/admitted contacts.
- Resource rooms/system addresses are blocked.
- Event title is not treated as a person.
- Meeting prep may consume attendee packets and recent evidence.
- Meeting overview appears in Calendar event detail and Transcript detail after a linked transcript exists.
- Recurring meetings show prior-meeting continuity.

### Empty Transcript

Given a transcript with no tasks, follow-ups, commitments, project changes, or relationship signals:

- Source is stored.
- Transcript detail shows "Nothing needs your attention from this transcript."
- No Leverage / Ready For You item is created.
- No Stewardship, Project, Executive Inbox, or Home item is created.

## Non-Negotiables

- Source receipts are required.
- No UI decides relevance.
- No drawer borrows unrelated context.
- No public enrichment admits a person.
- No inbound-only sender becomes a relationship by volume.
- No generic classifier text is allowed as a visible reason.
- No external action happens without explicit approval.
- Every prepared draft/action must keep source refs.
- No prepared output is considered ready until it is persisted, registered, retrievable, visible, and has a working review action.
- Every rejected suggestion teaches VAL not to repeat it.

## Relationship To Existing Docs

This document sits above the drawer-specific specs.

Supporting docs:

- `docs/VAL_REALITY_PROCESSING_PIPELINE.md`
- `docs/HEARTH_TRUTH_LINEAGE_MAP.md`
- `docs/HEARTH_CLICK_CONTRACTS.md`
- `docs/VAL_CONTEXT_REGISTRY.md`
- `docs/VAL_EXECUTIVE_REASONING_ARCHITECTURE.md`
- `docs/VAL_PROMPT_ARCHITECTURE.md`
- `docs/VAL_TRANSCRIPT_INTAKE_PROMPTS.md`
- `docs/VAL_EXECUTIVE_INBOX_ROUND_TABLE_AND_RULES.md`
- `docs/VAL_CALENDAR_AND_MEETING_PREP_PROMPTS.md`
- `docs/VAL_STEWARDSHIP_INTRODUCTION_ENGINE_V1.md`

If a drawer-specific doc conflicts with this map, this map wins until the user explicitly revises it.
