# VAL System-Wide Source And Click Map

Updated: 2026-07-11

Status: documentation baseline for the next architecture pass.

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

## The One Spine

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
| Sent email recipient | Yes | Yes, strongest automatic signal | Yes, if project evidence exists | Yes, if commitment/draft exists | Sometimes | Safer than inbound because user initiated. |
| Replied email thread | Yes | Yes | Yes | Yes | Sometimes | A reply is reciprocal relationship evidence. |
| Inbound-only email | Yes if not spam | No by itself | No by itself | Rarely | Rarely | Cannot create relationship without another trusted signal. |
| Email with unsubscribe/bulk/list headers | Maybe source-only | No | No | No | No | Marketing/newsletter unless user explicitly marks important. |
| No-reply/system/receipt | Maybe source-only | No | No | No | No | Never a relationship. |
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

1. Is this spam, bulk, unsubscribe, receipt, notification, system, or no-reply?
2. Did the user send to or reply to this person?
3. Does it contain a commitment, document, project, deadline, question, relationship signal, or draftable response?
4. Which consumers are allowed to use it?

### Required Routes

| Signal | Route |
|---|---|
| User sent or replied | Update person packet relationship evidence. |
| Inbound-only from human | Store source; do not create relationship unless another trusted signal admits. |
| Attachment/document request | Document observer and project observer. |
| Project-like document with no project | Create project suggestion review update. |
| Commitment language | Commitment observer. |
| Needs response with consequence | Executive Inbox. |
| Email context for meeting attendee | Meeting prep. |
| Relationship warmth/risk | Relationship packet only if person admitted. |
| Introduction language | Stewardship intro observer if identities resolve. |

### Example: Anthony Document Email

Expected behavior:

```text
Anthony email arrives with documents
  -> Source receipt: email_message with attachments
  -> Witness: Anthony sent documents; documents appear connected to an ongoing/new workstream
  -> Relevance: project_eligible + document_eligible + possibly executive_attention
  -> Document observer: create document references
  -> Project observer: if no matching project exists, create "Suggested new project" review update
  -> Executive Inbox: only if user judgment/reply is needed
  -> Ready For You: prepare project intake summary or document review, not external action
```

Incorrect outcomes:

- Treating Anthony only as an inbox item.
- Losing the documents because the email did not need a reply.
- Adding documents nowhere.
- Creating a project silently without approval.
- Showing generic "email may involve document follow-up" text.

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
| Named person | Person candidate or identity review. |
| "I want to introduce A to B" | Stewardship introduction opportunity. |
| Commitment/promise | Commitment packet and Ready For You if preparable. |
| Project movement | Project packet. |
| New project idea | Suggested project review update. |
| Document/proposal/SOW mentioned | Document/project observer. |
| Meeting follow-up | Ready For You and/or Executive Inbox draft. |
| User preference/rule | Teach VAL candidate, approval required. |

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
| Contract/proposal/SOW/invoice | Project + external action risk gate. |
| Reference document | Document library only unless relevance admits. |

## Project Processing Map

### Current Code Anchors

- Project index/dossier routes in `server.js`
- Relationship/project understanding docs
- Review updates: `services/valReviewUpdates.js`
- Project UI in `hearth-prototype.js`

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

## Home Processing Map

Home is downstream. Home does not decide source truth.

Home may show only:

- Velocity: what changed and passed Velocity Round Table.
- Alignment: one priority with Why Now Packet.
- Leverage: prepared work ready for review.

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
  "ready_for_you_candidates": [],
  "external_action_packets": [],
  "no_action_receipt": ""
}
```

## Implementation Sequence

Do not start by fixing Stewardship UI again.

Start with the spine.

1. Define `source_processing_record` schema and tests.
2. Add shared source classifier helpers for spam/bulk/system/self/private/resource/source-only.
3. Route transcripts through a first-class source pass that emits intro commitments, project signals, document signals, and person updates.
4. Route synced email through the same source pass, including attachment/document/project-suggestion handling.
5. Route calendar events through the same source pass, including attendee admission and private/resource filtering.
6. Create first-class `introduction_opportunity` records from transcripts/emails/user teaching.
7. Create first-class `suggested_project` review updates from emails/documents/transcripts.
8. Update drawers to consume only packet/review outputs from the source pass.
9. Add click preflight tests proving each click uses the correct packet and source.
10. Backfill existing sources through the new pass.

## Acceptance Cases

### Terrie/Kareemah

Given a transcript where Jessa tells Terrie she wants to introduce her to Kareemah:

- Terrie is admitted from transcript attendee context.
- Kareemah is resolved or put in identity review.
- The transcript creates an `introduction_opportunity`.
- Stewardship Suggested Introductions shows it after identity resolution.
- The reason is source-specific, not generic.
- Review Draft uses transcript evidence.

### Anthony Documents

Given an email from Anthony with documents:

- Email source is stored.
- Attachments/documents are routed to Document observer.
- Project observer checks for existing project.
- If no project exists, VAL creates a suggested project review update.
- Executive Inbox only shows the email if a user reply/decision is needed.

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

## Non-Negotiables

- Source receipts are required.
- No UI decides relevance.
- No drawer borrows unrelated context.
- No public enrichment admits a person.
- No inbound-only sender becomes a relationship by volume.
- No generic classifier text is allowed as a visible reason.
- No external action happens without explicit approval.
- Every prepared draft/action must keep source refs.
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
