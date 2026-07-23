# VAL Transcript Action Capability and Workflow Registry v1

Status: canonical documentation-first contract. This document does not make an action executable merely by naming it.

Purpose: define every internal and external thing VAL may do because of transcript evidence, the packets and Round Table members required for each action, the provider API boundary, the user approval boundary, and the receipt that proves what happened.

Companion specifications:

- [VAL_TRANSCRIPT_INTAKE_PROMPTS.md](./VAL_TRANSCRIPT_INTAKE_PROMPTS.md)
- [VAL_PROJECT_MANAGER_ROUND_TABLE_AND_PACKETS.md](./VAL_PROJECT_MANAGER_ROUND_TABLE_AND_PACKETS.md)
- [VAL_OS_INSTRUCTIONS_AND_APPROVAL_PROMPTS.md](./VAL_OS_INSTRUCTIONS_AND_APPROVAL_PROMPTS.md)
- [VAL_GHL_CRM_PROMPTS.md](./VAL_GHL_CRM_PROMPTS.md)
- [VAL_SYSTEM_WIDE_SOURCE_AND_CLICK_MAP.md](./VAL_SYSTEM_WIDE_SOURCE_AND_CLICK_MAP.md)

## Non-Negotiable Rule

A transcript is evidence. It is never permission.

VAL may read, classify, link, summarize, research, and prepare work from transcript evidence. VAL may not send, publish, schedule attendees, move a CRM record, change a tag, or otherwise act outside VAL until the applicable approval contract is satisfied.

A low-level route existing in `server.js` does not mean a transcript-derived action is operational. An action is operational only when all of these exist:

1. a bounded source packet,
2. a supported action type,
3. the required Round Table review,
4. an editable prepared artifact or exact payload preview,
5. a visible approval boundary,
6. a provider execution adapter,
7. an idempotency key,
8. a provider-confirmed execution receipt,
9. reconciliation back into the related person, project, task, and source packets.

## Canonical Source-to-Receipt Path

```text
Transcript source received
  -> immutable Source Receipt
  -> transcript quality gate
  -> speaker and attendee identity resolution
  -> relationship, project, calendar, email, and CRM context binding
  -> commitments, decisions, open loops, and action candidates
  -> action-specific Round Table
  -> prepared artifact or exact payload preview
  -> visible review surface
  -> user approval or approved standing instruction
  -> fresh risk and ambiguity check
  -> one provider adapter call
  -> provider-confirmed Execution Receipt
  -> source, relationship, project, task, and learning packet updates
```

VAL must never skip from transcript extraction directly to a provider call.

## Action State Machine

Every action candidate uses the same states:

```text
source_received
extracted
identity_resolved
context_bound
candidate_detected
round_table_reviewed
prepared
awaiting_approval
approved
executing
succeeded | failed | expired | cancelled
receipt_recorded
reconciled
```

Rules:

- `prepared` means VAL has created an internal, editable artifact. It does not mean a provider draft exists.
- `awaiting_approval` must name the provider, recipient or target, and exact effect.
- `approved` is scoped to one immutable payload version.
- editing an approved artifact invalidates approval and returns it to `awaiting_approval`.
- `succeeded` requires provider confirmation, not an optimistic UI response.
- retry uses the original idempotency key and must not duplicate an action.
- a failed action remains inspectable and may not silently fall back to another provider or recipient.

## Core Packets

### 1. Transcript Source Packet

Required fields:

```json
{
  "transcript_id": "",
  "provider": "krisp|manual|other",
  "provider_title": "",
  "provider_meeting_started_at": "",
  "received_at": "",
  "participants": [],
  "source_url": "",
  "source_hash": "",
  "quality": "high|medium|low|unusable"
}
```

The provider title and meeting time remain authoritative. `received_at` must never replace the meeting time.

### 2. Identity Resolution Packet

Required fields:

```json
{
  "source_person_label": "",
  "email": "",
  "calendar_attendee_match": "",
  "relationship_id": "",
  "crm_contact_id": "",
  "match_method": "email|provider_id|confirmed_name|manual",
  "confidence": 0.0,
  "is_user": false,
  "unresolved_reason": ""
}
```

Exact email is the strongest ordinary identity key. A name alone may suggest a person but may not authorize a contact update or public enrichment. The signed-in user's own addresses are excluded from attendee enrichment.

### 3. Context Binding Packet

Required fields:

- linked relationship IDs and evidence excerpts,
- linked project IDs and why each match is supported,
- linked calendar event,
- recent relevant transcript summaries,
- recent relevant email thread summaries,
- CRM contact, task, conversation, and opportunity references,
- unresolved conflicts and missing context.

Context is bounded by the people, project, and meeting at hand. Unrelated packet content may not leak into the action.

### 4. Commitment and Open Loop Packet

Required fields:

- exact source excerpt,
- speaker,
- commitment or open loop,
- owner,
- intended recipient or beneficiary,
- due date or timing language,
- dependency,
- confidence,
- whether the transcript states the action or VAL is recommending it.

### 5. Action Candidate Packet

Required fields:

```json
{
  "action_type": "",
  "source_excerpt": "",
  "requested_by": "speaker|user|VAL_recommendation",
  "target": {},
  "payload_requirements": {},
  "relationship_ids": [],
  "project_ids": [],
  "dependencies": [],
  "unknowns": [],
  "confidence": 0.0,
  "risk_level": "read_only|low|medium|high|very_high",
  "recommended_disposition": "prepare|ask|discard|no_action"
}
```

### 6. Prepared Artifact Packet

Required fields:

- artifact ID and type,
- exact editable content,
- source packet IDs,
- relationship and project links,
- provider target,
- version and content hash,
- writing or function rules used,
- missing inputs,
- validation result,
- surfaces where the artifact appears.

### 7. External Action Packet

The existing `val_external_action_packets` contract is the execution boundary.

Required fields include:

- action type,
- provider,
- exact target,
- exact payload preview,
- source references,
- risk level,
- approval state and approver,
- approval expiry,
- payload version/hash,
- idempotency key,
- attempt status.

### 8. Execution Receipt

The existing `val_execution_receipts` contract must record:

- packet and artifact IDs,
- provider,
- provider object or message ID,
- attempted and completed times,
- success or failure,
- normalized provider response,
- retry state,
- relationship, project, task, and source links.

## Round Table Members

Every candidate is reviewed only by the members relevant to that action.

| Member | Responsibility |
|---|---|
| Source Fidelity Observer | Proves the request or commitment is actually present in the transcript. |
| Identity Steward | Resolves the correct people, accounts, email addresses, phone numbers, and provider records. |
| Relationship Steward | Protects tone, trust, history, sensitivity, and relationship-specific rules. |
| Project Manager | Binds the action to the correct project, owner, dependency, timeline, and open loop. |
| Calendar Steward | Checks availability, timezone, duration, attendee list, conflicts, and scheduling rules. |
| Communications Steward | Applies writing, tone, channel, introduction, and recipient rules. |
| Research Steward | Defines a bounded research question, identity proof, source requirements, and freshness. |
| Artifact Steward | Chooses the correct document, proposal, code, template, or prepared-work format. |
| CRM Steward | Resolves contact, opportunity, pipeline, task, tag, note, and conversation records. |
| Approval Guardian | Assigns risk, determines approval requirements, and blocks ambiguous or stale approval. |
| Chief of Staff | Chooses whether the action is useful now, should be prepared, should wait, or should be discarded. |

The Chief of Staff may recommend. The Approval Guardian controls whether execution is permitted.

## Internal Things VAL Can Do

These actions remain inside VAL or connected private storage. They do not contact another person or change a third-party business record unless explicitly noted.

| Internal capability | Transcript use | Current state |
|---|---|---|
| Preserve source receipt | Store exact provider identity, title, meeting time, participants, and source link. | Implemented foundation. |
| Quality gate | Prevent poor transcripts from creating unreliable memory or work. | Specified and partly implemented. |
| Resolve identities | Match speakers and attendees to relationships and CRM contacts by strong identifiers. | Implemented in multiple surfaces; needs one canonical transcript path. |
| Create relationship candidate | Make an unresolved person available for confirmation. | Implemented in surfaces; persistence must be verified per route. |
| Bind relationships | Attach transcript evidence chronologically to each supported relationship packet. | Foundation exists; canonical reconciliation required. |
| Bind projects | Attach transcript evidence to confirmed or confidently matched projects. | Foundation exists; project dropdown and persistence are separate UI concerns. |
| Extract commitments | Distinguish promises from generic tasks. | Prompt/spec exists. |
| Extract decisions | Preserve decided, deferred, and unresolved decisions. | Prompt/spec exists. |
| Extract open loops | Identify unfinished work, ambiguity, dependencies, and drift. | Prompt/spec exists. |
| Extract action items | Capture owner, beneficiary, due date, context, and exact evidence. | Implemented foundation. |
| Prepare task candidate | Create an editable task with why, owner, project, and source. | Implemented. |
| Prepare CRM note | Create an editable note candidate with source proof. | Implemented. |
| Prepare email | Draft a contextual email without sending it. | Implemented. |
| Prepare introduction | Draft a two-sided introduction with verified consent and context. | Implemented as an email artifact; no separate executor required. |
| Prepare SMS | Draft a short message with exact number and recipient. | Planner recognizes it; executor blocks sending. |
| Prepare calendar invite | Draft title, attendees, timezone, duration, location, description, and reminders. | Artifact type exists; attendee send is blocked. |
| Prepare proposal | Draft scope, outcomes, assumptions, pricing inputs, and next step. | Artifact type exists; provider send is blocked. |
| Prepare estimate or invoice | Prepare exact line items, contact, due dates, and terms for review. | Not a canonical transcript adapter yet. |
| Prepare document | Create an internal document artifact or Google Doc candidate. | Internal documents and Google Doc helpers exist; not packetized for transcripts. |
| Prepare code | Create a code brief, acceptance criteria, patch plan, or reviewable diff artifact. | Prepare-only; no transcript-driven shell, commit, deploy, or publish. |
| Prepare research | Define a bounded question and assemble source-linked findings. | One canonical read-only research executor now reuses the existing Outscraper submit-and-poll runner, verifies identity, and carries source-linked findings forward. |
| Prepare blog or social post | Draft channel-specific content and metadata. | Low-level provider routes exist; transcript executor blocks publishing. |
| Summarize key points | Produce concise, source-grounded meeting meaning. | Implemented. |
| Prepare attendee follow-up | Prepare Action Items and Key Points exactly as approved. | Preparation supported; send uses email action contract. |
| Register prepared work | Surface artifact in transcript, relationship, project, task, and Leverage review paths. | Architecture exists; must be enforced for every artifact. |
| Record no-action receipt | Explain when nothing durable or actionable changed. | Specified. |
| Learn from correction | Preserve user correction without rewriting source evidence. | Foundation exists. |

## External Things VAL Can Do or Prepare

Status vocabulary:

- `LIVE`: packetized executor and receipt path exist.
- `CONDITIONAL`: code exists but provider consent/configuration may prevent execution.
- `ROUTE_ONLY`: a low-level API route exists, but no transcript external-action adapter owns it.
- `PREPARE_ONLY`: VAL may create an internal artifact, but execution is blocked.
- `NOT_WIRED`: provider capability may exist, but VAL has no current path.

| Action | Provider | Transcript status now | Approval | Required Round Table |
|---|---|---|---|---|
| Create Gmail draft | Gmail | `LIVE` | Review before provider draft creation unless standing instruction allows drafts. | Source, Identity, Relationship, Communications, Approval. |
| Create Outlook draft | Microsoft Graph | `CONDITIONAL`: adapter exists; default OAuth lacks required mail write scope. | Same as Gmail. | Source, Identity, Relationship, Communications, Approval. |
| Send email | Gmail | `LIVE` | Explicit approval of recipient, subject, and final body. | Source, Identity, Relationship, Communications, Approval. |
| Send email | Microsoft Graph | `CONDITIONAL`: adapter exists; default OAuth lacks `Mail.Send`. | Explicit approval. | Same. |
| Draft introduction | Gmail/Outlook/internal | `LIVE` as email preparation. | Draft approval; sending requires second explicit send approval. | Source, Identity for both sides, Relationship for both sides, Communications, Approval. |
| Send SMS | HighLevel Conversations | `LIVE`: packetized one-contact SMS adapter and receipt path. | Very high: verified contact ID, exact body, explicit approval, and final confirmation. | Source, Identity, Relationship, CRM, Communications, Approval. |
| Create CRM note | HighLevel Contacts | `LIVE` | Review or approved standing instruction. | Source, Identity, CRM, Project, Approval. |
| Create CRM task | HighLevel Contacts | `LIVE` | Review or approved standing instruction. | Source, Identity, Project, CRM, Approval. |
| Create calendar hold without attendees | Google/Microsoft | `LIVE` | Review time, timezone, calendar, and duration. | Source, Calendar, Project, Approval. |
| Send calendar invite to attendees | Google/Microsoft | `PREPARE_ONLY`; provider APIs support it, executor blocks it. | High: exact attendees, title, time, timezone, location, description, notification behavior. | Source, Identity, Relationship, Calendar, Project, Approval. |
| Upsert verified contact | HighLevel Contacts | `LIVE`: packetized upsert adapter; exact email or phone required and duplicate creation disabled. | Explicit review of identity and fields. | Source, Identity, CRM, Approval. |
| Update contact | HighLevel Contacts | `LIVE`: packetized one-contact update adapter with an allowlisted payload. | Review changed fields. | Source, Identity, CRM, Approval. |
| Add or remove tags | HighLevel Contacts | `LIVE`: packetized dedicated add/remove tag adapters; no tag-list overwrite. | Review exact contact, operation, and tags. | Source, Identity, CRM, Approval. |
| Update opportunity or stage | HighLevel Opportunities | `LIVE`: packetized one-opportunity update adapter with an allowlisted payload. | High: exact opportunity, pipeline/stage, value, owner, and consequence. | Source, Identity, Project, CRM, Approval. |
| Send proposal/document | HighLevel Documents and Contracts | `PREPARE_ONLY`. Public API can list and send existing documents but does not currently expose creation of a new document body from arbitrary content. | High: exact document, contact, terms, and send behavior. | Source, Identity, Relationship, Project, Artifact, CRM, Approval. |
| Create/send estimate | HighLevel Estimates | `NOT_WIRED`; provider supports create and send. | Very high: line items, price, tax, expiry, recipient, terms. | Source, Identity, Relationship, Project, Artifact, CRM, Approval. |
| Create/send invoice | HighLevel Invoices | `NOT_WIRED`; provider supports create and send. | Very high: line items, price, tax, due date, recipient, terms. | Same as estimate. |
| Create Google Doc | Google Drive/Docs | `ROUTE_ONLY`: helper exists, not a transcript action adapter. | Review title, content, folder, and sharing. | Source, Identity when named, Project, Artifact, Approval. |
| Create Microsoft file | OneDrive/Graph | `NOT_WIRED`; provider supports file creation. | Review file, folder, format, and sharing. | Source, Project, Artifact, Approval. |
| Create CRM email template | HighLevel Emails | `ROUTE_ONLY`. | Review template name, subject, HTML/text, and location. | Source, Communications, Artifact, CRM, Approval. |
| Create/update blog post | HighLevel Blogs | `ROUTE_ONLY`; transcript executor blocks publishing. | High: site, author, category, slug, content, publication state. | Source, Project, Communications, Artifact, Approval. |
| Create/update social post | HighLevel Social Planner | `ROUTE_ONLY`; transcript executor blocks publishing. | High: accounts, content, media, schedule, and publication state. | Source, Identity if people named, Relationship, Communications, Approval. |
| Read payments, orders, transactions | HighLevel Payments | Read-only route exists. | No external-action approval; access policy still applies. | Source, CRM, Project. |
| Run public research | Outscraper Google Search | `LIVE_READ_ONLY` through the canonical Action Orchestrator research executor. | No send approval; identity, scope, URL-backed evidence, and source confidence gates are mandatory. Downstream work requires separate approval. | Source, Identity, Research, Relationship, Project, Task, Chief of Staff. |
| Run or deploy code | Git/shell/hosting | `PREPARE_ONLY`. | Separate engineering review, tests, commit, and deployment approval. | Source, Project, Artifact, Approval. |

## HighLevel Tool Crosswalk

The following table maps the 36 supplied HighLevel functions. `Route` means VAL exposes a lower-level route today. It does not imply transcript execution readiness.

| # | Tool | HighLevel endpoint/tool name | Transcript use | Current VAL classification |
|---:|---|---|---|---|
| 1 | Get Calendar Events | `calendars_get-calendar-events` | Match transcript to meeting, time, calendar, and attendees. | Read route; context input. |
| 2 | Get Appointment Notes | `calendars_get-appointment-notes` | Retrieve prior appointment context and notes. | Read route; context input. |
| 3 | Get All Tasks | `contacts_get-all-tasks` | Find duplicates, open loops, owners, and prior commitments. | Read route; context input. |
| 4 | Add Tags | `contacts_add-tags` | Apply a reviewed classification or workflow trigger. | `LIVE`; packetized one-contact add adapter. |
| 5 | Remove Tags | `contacts_remove-tags` | Remove an obsolete reviewed classification. | `LIVE`; packetized one-contact remove adapter. |
| 6 | Get Contact | `contacts_get-contact` | Resolve identity, phones, emails, fields, and relationship evidence. | Read route; context input. |
| 7 | Update Contact | `contacts_update-contact` | Apply approved field corrections or additions. | `LIVE`; verified contact ID and reviewed allowlisted fields. |
| 8 | Upsert Contact | `contacts_upsert-contact` | Create/update a verified attendee by exact identity. | `LIVE`; exact email or phone and duplicate-safe upsert. |
| 9 | Create Contact | `contacts_create-contact` | Create a verified attendee/contact. | Route only; canonical creation uses duplicate-safe upsert instead. |
| 10 | Get Contacts | `contacts_get-contacts` | Search and resolve people before creating duplicates. | Read route; context input. |
| 11 | Search Conversation | `conversations_search-conversation` | Find relevant email/SMS history and the conversation ID. | Read route; context input. |
| 12 | Get Messages | `conversations_get-messages` | Ground follow-up in exact prior messages. | Read route; context input. |
| 13 | Send a New Message | `conversations_send-a-new-message` | Send approved SMS, email, WhatsApp, or supported channel message. | `LIVE` for one reviewed SMS; other HighLevel channels remain route only. |
| 14 | Get Location | `locations_get-location` | Resolve account identity, timezone, and configuration. | Read route; system context. |
| 15 | Get Custom Fields | `locations_get-custom-fields` | Map transcript-derived values to valid CRM fields. | Read route; schema context. |
| 16 | Search Opportunity | `opportunities_search-opportunity` | Match transcript to opportunity/project and prevent duplicates. | Read route; context input. |
| 17 | Get Pipelines | `opportunities_get-pipelines` | Resolve pipeline and valid stage IDs. | Read route; schema context. |
| 18 | Get Opportunity | `opportunities_get-opportunity` | Read value, stage, owner, contact, and history. | Read route; context input. |
| 19 | Update Opportunity | `opportunities_update-opportunity` | Apply approved field or stage updates. | `LIVE`; one verified opportunity and reviewed allowlisted fields. |
| 20 | Get Order by ID | `payments_get-order-by-id` | Verify commercial context and payment evidence. | Read route; context input. |
| 21 | List Transactions | `payments_list-transactions` | Verify payments, balances, and project finance signals. | Read route; context input. |
| 22 | Check Blog URL Slug | `blogs_check-url-slug-exists` | Validate a prepared post before publishing. | Read/validation route. |
| 23 | Update Blog Post | `blogs_update-blog-post` | Apply approved changes to a specific post. | Route only; publish mutation not packetized. |
| 24 | Create Blog Post | `blogs_create-blog-post` | Create an approved draft or scheduled post. | Route only; publish mutation not packetized. |
| 25 | Get Blog Authors | `blogs_get-all-blog-authors-by-location` | Resolve valid author. | Read route; schema context. |
| 26 | Get Blog Categories | `blogs_get-all-categories-by-location` | Resolve valid category. | Read route; schema context. |
| 27 | Get Blog Posts by Blog ID | `blogs_get-blog-post` | Find source post and prevent duplicates. | Read route; context input. |
| 28 | Get Blogs by Location | `blogs_get-blogs` | Resolve target blog/site. | Read route; schema context. |
| 29 | Create Email Template | `emails_create-template` | Save an approved reusable template. | Route only; not packetized. |
| 30 | Get Email Templates | `emails_fetch-template` | Reuse a verified existing template. | Read route; context input. |
| 31 | Get Social Media Accounts | `socialmediaposting_get-account` | Resolve exact target accounts. | Read route; schema context. |
| 32 | Get Social Media Statistics | `socialmediaposting_get-social-media-statistics` | Ground recommendations in performance evidence. | Read route; context input. |
| 33 | Create Social Media Post | `socialmediaposting_create-post` | Create approved draft/scheduled/published post. | Route only; publish mutation not packetized. |
| 34 | Get Social Media Post | `socialmediaposting_get-post` | Inspect exact prior post. | Read route; context input. |
| 35 | Get Social Media Posts | `socialmediaposting_get-posts` | Find related posts and avoid repetition. | Read route; context input. |
| 36 | Update Social Media Post | `socialmediaposting_edit-post` | Apply approved edits. | Route only; publish mutation not packetized. |

HighLevel capabilities required by transcript workflows but missing from the supplied 36-tool list:

- create and send estimates,
- create and send invoices,
- list and send existing documents/contracts,
- create appointment,
- create contact notes and tasks,
- optional opportunity creation when a verified transcript should birth a new deal.

## Google Workspace Crosswalk

| Function | Official API | Transcript use | Current VAL state |
|---|---|---|---|
| Read calendar events | Calendar `events.list` | Match meeting title, time, attendees, conference link, and recurrence. | Connected/read path exists. |
| Create private hold | Calendar `events.insert` without attendees | Reserve user time for a task. | Packetized executor exists. |
| Create/send attendee invite | Calendar `events.insert` with `attendees` and `sendUpdates=all` | Send approved invitation. | Provider supports; transcript executor blocks. |
| Update attendee event | Calendar `events.update`/`patch` with notifications | Apply an approved schedule or attendee change. | Not a canonical transcript adapter. |
| Read Gmail thread | Gmail messages/threads read | Bind transcript to recent email context. | Connected/read path exists. |
| Create Gmail draft | Gmail `users.drafts.create` | Save reviewed content as provider draft. | Packetized executor exists. |
| Send Gmail message | Gmail `users.messages.send` | Send approved final content. | Packetized executor exists. |
| Create Google Doc | Drive `files.create` plus Docs `documents.batchUpdate` | Create approved project/proposal/brief document. | Helper exists; not transcript packetized. |
| Update Google Doc | Docs `documents.batchUpdate` | Apply approved append/replace/prepend changes. | Helper exists; not transcript packetized. |
| Read Drive/Docs | Drive/Docs read/export | Ground transcript work in linked documents. | Connected helper paths exist. |
| Google contacts | People API | Resolve or update Google contacts. | Not wired as a canonical source or action. |
| Google tasks | Tasks API | Create provider-native Google task. | Not wired; current tasks use VAL/GHL and optional calendar holds. |

Current Google scopes include Calendar read/events, Gmail read/compose, Drive read/file, and Docs document access. Sending Gmail through the current compose scope is supported by the Gmail API.

## Microsoft 365 Crosswalk

| Function | Official Graph API | Transcript use | Current VAL state |
|---|---|---|---|
| Read calendar events | Calendar view/events | Match meeting and attendee context. | Connected/read path exists. |
| Create private hold | `POST /me/events` without attendees | Reserve user time. | Packetized executor exists. |
| Create/send attendee invite | `POST /me/events` with attendees | Send approved invitation. | Provider supports; transcript executor blocks. |
| Read Outlook mail | Messages API | Bind transcript to email context. | Default scope includes `Mail.Read`. |
| Create Outlook draft | `POST /me/messages` | Save approved provider draft. | Adapter exists, but default scope lacks `Mail.ReadWrite`. |
| Send Outlook mail | `POST /me/sendMail` | Send approved final content. | Adapter exists, but default scope lacks `Mail.Send`. |
| Create OneDrive file | `PUT /me/drive/items/{parent}:/{name}:/content` | Create an approved document/file. | Provider supports; no VAL transcript adapter; default scope lacks `Files.ReadWrite`. |
| Microsoft contacts | People/Contacts API | Resolve or update Outlook contacts. | Not wired. |
| Microsoft To Do tasks | To Do API | Create Microsoft task. | Not wired. |

Required Microsoft consent migration before mail/file execution can be trusted:

```text
offline_access User.Read Mail.Read Mail.ReadWrite Mail.Send Calendars.Read Calendars.ReadWrite Files.ReadWrite
```

The exact least-privilege scope set should be reduced per enabled feature, but the current defaults are insufficient for the existing Outlook draft and send adapters.

## Outscraper Research Contract

Outscraper research is a read-only action, but it still requires strict identity and evidence controls.

### Research packet

```json
{
  "person_name": "",
  "verified_email": "",
  "verified_domain": "",
  "known_linkedin_url": "",
  "research_question": "",
  "queries": [],
  "freshness_window": "",
  "allowed_sources": [],
  "identity_confidence": 0.0,
  "source_results": [],
  "verified_findings": [],
  "conflicts": [],
  "no_result_reason": ""
}
```

### Required workflow

```text
Action candidate: research
  -> resolve exact person first
  -> build bounded queries from verified name + email/domain + known LinkedIn URL
  -> submit Google Search request
  -> if result is inline, normalize immediately
  -> otherwise retain request ID/results_location and poll the request endpoint
  -> reject people-search sites and identity-conflicting results
  -> preserve title, URL, snippet, query, and retrieved time
  -> summarize only verified findings
  -> append Research Packet to the relationship/project packet
  -> never block transcript intake or the initial internal brief indefinitely
```

Current code contains both:

- a synchronous `async=false` lookup path for fast, bounded requests,
- an asynchronous submit-and-poll path using the request ID or `results_location`.

These paths are consolidated behind the Action Orchestrator research executor, which delegates to the existing submit-and-poll Outscraper runner. The user-facing result must never claim that a search completed when it timed out, and a timeout must not become a factual statement about the person.

### Identity safety

- Never enrich the signed-in user as an attendee.
- Do not merge two people because their names are similar.
- A retail listing, physician profile, directory record, or unrelated company result is not usable unless the email/domain/known profile proves the identity.
- A LinkedIn company page is not a person's recent post.
- If no verified result exists, show the known website or LinkedIn URL and say no verified new signal was found.
- Every useful claim must retain its source URL.

## Canonical Workflows

### A. Email reply or follow-up

```text
Transcript excerpt requests follow-up
  -> resolve sender, recipients, relationship, and project
  -> inspect recent relevant thread
  -> Communications + Relationship + Project Round Table
  -> prepare editable email artifact using applicable writing rules
  -> user reviews recipient, subject, and body
  -> Approve and Send
  -> fresh risk check
  -> Gmail or Outlook send adapter
  -> message ID receipt
  -> close or update related open loop
```

Do not create a canned draft when the original request or context is missing. Ask the user for the missing decision instead.

### B. Introduction

```text
Transcript suggests introducing Person A and Person B
  -> independently resolve both identities
  -> confirm why the introduction benefits both people
  -> check consent, sensitivity, relationship rules, and conflicts
  -> prepare two-sided introduction email
  -> user reviews all recipients and claims
  -> Approve and Send
  -> email adapter and receipt
  -> relationship packets record the introduction and follow-up date
```

### C. SMS

```text
Transcript contains an SMS commitment
  -> resolve exact contact and verified phone
  -> find or create the correct HighLevel conversation reference
  -> prepare concise message
  -> show exact recipient, number, body, and channel SMS
  -> explicit final confirmation
  -> HighLevel conversations message adapter
  -> provider message ID/status receipt
  -> reconcile open loop
```

No phone number guessing. No channel substitution. No sending to all conversation participants.

### D. Calendar invite

```text
Transcript contains scheduling commitment
  -> extract date/time language and participants
  -> resolve timezone, duration, calendar, location/link, recurrence, and organizer
  -> check conflicts and scheduling instructions
  -> prepare invite artifact
  -> user reviews exact attendee list and notification behavior
  -> Approve and Send Invite
  -> Google or Microsoft event adapter with attendees
  -> event ID and attendee delivery receipt
  -> calendar, relationship, project, and task reconciliation
```

Ambiguous date/time creates a question, not an event.

### E. CRM contact, note, task, tag, or opportunity update

```text
Transcript creates CRM-relevant change
  -> resolve contact and location
  -> read current fields/tasks/opportunities/pipelines
  -> identify exact delta and duplicates
  -> CRM + Project + Approval Round Table
  -> show before/after payload
  -> approve or apply exact standing instruction
  -> one HighLevel adapter call
  -> provider record ID receipt
  -> relationship/project packet reconciliation
```

Verified calendar attendees with an exact email may be auto-upserted only under an explicit standing instruction. Name-only transcript speakers remain candidates until confirmed.

### F. Proposal, estimate, invoice, or CRM document

```text
Transcript indicates commercial artifact
  -> extract requested outcome, scope, assumptions, line items, price inputs, dates, terms, and recipient
  -> identify missing commercial facts
  -> Artifact + Relationship + Project + CRM + Approval Round Table
  -> prepare editable internal artifact
  -> user supplies/approves every material term
  -> choose provider artifact type
  -> execute only through a supported adapter
  -> provider object ID and delivery receipt
```

Provider choice:

- proposal narrative: internal artifact or Google Doc today;
- reusable CRM email: HighLevel email template after adapter work;
- estimate: HighLevel Estimate API after adapter work;
- invoice: HighLevel Invoice API after adapter work;
- HighLevel document/contract: only an existing provider document can currently be selected and sent through the public API; VAL cannot create a new arbitrary contract body in HighLevel today.

### G. Document creation

```text
Transcript calls for a brief, memo, plan, recap, one-pager, or other document
  -> determine audience, purpose, format, owner, project, and source excerpts
  -> prepare internal document artifact
  -> validate facts, links, and required sections
  -> user reviews content and storage destination
  -> create Google Doc or future OneDrive file
  -> store provider URL/ID
  -> link to project, relationship, task, and transcript
  -> receipt
```

### H. Code

```text
Transcript requests a build or technical change
  -> create engineering brief with source, objective, constraints, acceptance criteria, dependencies, risk, and test plan
  -> attach to project/task
  -> prepare patch or implementation plan in an engineering workspace only after explicit user instruction
  -> run tests
  -> separate approval for commit, push, pull request, or deployment
  -> git/deployment receipt
```

A transcript may create a code candidate. It may never autonomously execute shell commands, commit, push, or deploy.

### I. Research

```text
Transcript creates a bounded research question
  -> resolve person/company/topic identity
  -> Research Round Table sets scope and evidence standard
  -> run provider query
  -> normalize and source-link results
  -> prepare Research Packet with findings, conflicts, unknowns, and implications
  -> attach to relationship/project/task
  -> show in the working artifact
```

### J. Blog or social content

```text
Transcript contains content commitment
  -> resolve channel, audience, account, author, timing, source claims, and media
  -> prepare editable content artifact
  -> validate links, slug/category/account, and claims
  -> explicit publication or scheduling approval
  -> provider adapter
  -> post ID/status receipt
```

## Prompt Contracts

### 1. Action candidate extraction prompt

```text
You are VAL's Transcript Action Candidate Extractor.

Your job is to identify possible internal preparation and external actions supported by this transcript.
The transcript is evidence, never permission.

For every candidate:
- quote the exact supporting excerpt,
- identify the speaker,
- distinguish a stated commitment from a VAL recommendation,
- identify target people, project, timing, dependencies, and missing facts,
- choose one canonical action_type,
- assign confidence and risk,
- recommend prepare, ask, discard, or no_action.

Do not draft the artifact.
Do not call a provider.
Do not invent recipients, phone numbers, dates, prices, project links, or intent.
Return strict JSON matching Action Candidate Packet.
```

### 2. Action Round Table prompt

```text
You are the action-specific VAL Round Table.

Inputs:
- Transcript Source Packet
- Identity Resolution Packets
- Context Binding Packet
- Action Candidate Packet
- applicable standing instructions
- current provider record state

Decide:
1. Is the action actually supported by evidence?
2. Is it useful now?
3. Are identities, relationships, projects, owners, timing, and dependencies resolved?
4. What must VAL prepare?
5. What must the user decide or approve?
6. What would make execution unsafe, misleading, duplicative, or premature?

Return one disposition:
- prepare
- ask_one_question
- discard
- no_action

Never execute an external action.
Return strict JSON.
```

### 3. Artifact preparation prompt

```text
You are VAL's {{artifact_type}} preparer.

Create the smallest complete, editable artifact that fulfills the approved candidate.
Use only the provided source and bounded context.
Apply the applicable person, project, function, and global rules in that order.
Do not include internal reasoning, confidence labels, source mechanics, or "Writing rules VAL used" in user-facing content.
Do not claim a provider draft or external action exists.
Return the artifact, missing inputs, validation result, and rules applied as structured metadata.
```

### 4. Approval card contract

Every approval card must say exactly what will happen:

```text
Approve and {{verb}}

Provider: {{provider}}
Target: {{recipient_or_record}}
Effect: {{plain_language_effect}}
Prepared from: {{source_title_and_time}}
Project: {{project_or_not_linked}}

The user may edit, approve, cancel, or ask VAL to revise.
Editing invalidates prior approval.
```

Examples:

- `Approve and Send Email`
- `Approve and Send SMS`
- `Approve and Invite 3 Attendees`
- `Approve and Create CRM Task`
- `Approve and Move Opportunity to Proposal Sent`
- `Approve and Publish to LinkedIn`

### 5. Executor contract

The executor is deterministic code, not a generative prompt.

It must:

1. load one approved action packet,
2. verify approval has not expired,
3. verify the approved payload hash still matches,
4. rerun action-specific risk and ambiguity checks,
5. verify provider permissions and configuration,
6. use the idempotency key,
7. call one adapter,
8. persist the raw and normalized result,
9. return a receipt,
10. reconcile linked packets.

It may not rewrite content, choose another recipient, switch providers, expand scope, or reinterpret the transcript.

## CRM Document Creation Verdict

### Confirmed today

- VAL has code capable of creating and updating Google Docs in the connected user's Drive.
- VAL has internal document records and relationship/project reference routes.
- HighLevel can create email templates.
- HighLevel can create estimates and invoices through their dedicated APIs.

### Not confirmed as available today

- VAL cannot currently create a new arbitrary HighLevel Document/Contract body from transcript content through the public Documents and Contracts API.
- The public Documents and Contracts API exposes list and send operations for existing documents, not a create-document-body operation.
- None of the Google Doc, HighLevel template, estimate, or invoice creation paths is currently a packetized transcript executor.

Therefore:

> VAL can prepare documents and can technically create a Google Doc, but VAL cannot truthfully claim it can create a new document inside the HighLevel CRM from transcript content today.

The first production path should be:

```text
Transcript -> internal document artifact -> review -> Google Doc creation -> link Google Doc URL to CRM note/project/contact -> receipt
```

HighLevel-native document creation should wait for a supported provider endpoint or a controlled template-instantiation strategy.

## CRM SMS Verdict

### Provider capability

HighLevel supports sending a message with:

```text
POST /conversations/messages
type: SMS
contactId: verified contact ID
message: approved body
```

The provider requires `conversations/message.write` and supports exact sender/recipient number fields when needed.

### Current VAL capability

- the action planner recognizes `send_sms`,
- Transcript and Co-Work prepared artifacts create the same canonical packet,
- the executor calls `POST /conversations/messages` with `type: SMS`, one verified HighLevel contact ID, and one reviewed message,
- explicit approval and a separate final send confirmation are required unless a valid voice authorization satisfies the standing authorization contract,
- idempotency prevents a second execution,
- the provider message ID is stored in an execution receipt and reconciled to the source packet.

Therefore:

> VAL can safely send one reviewed transcript- or Co-Work-derived SMS through the canonical executor when HighLevel is configured and every identity, approval, and confirmation gate passes.

Retained safeguards:

1. one verified HighLevel contact ID,
2. exact message preview,
3. explicit approval plus final confirmation,
4. no bulk recipient language,
5. immutable source references,
6. idempotency and duplicate-send protection,
7. provider message ID receipt and reconciliation.

## Implementation Order

### Phase 1: make the registry executable

1. Machine-readable action registry and unknown-action rejection: complete in `services/valActionOrchestrator.js`.
2. Canonical source ingestion for Transcript, Co-Work, chat, and voice: complete.
3. Packet preparation, approval, execution receipt, idempotency, and reconciliation lifecycle: complete.
4. UI capability-state consumption remains product wiring; backend capability truth is available from `GET /api/val/action-orchestrator/capabilities`.

### Phase 2: close existing adapter gaps

1. Add Microsoft consent migration and reconnect flow.
2. Packetized HighLevel SMS adapter and tests: complete.
3. Add Google/Microsoft attendee invite adapters and tests.
4. HighLevel contact upsert/update/tag/opportunity adapters with reviewed payload previews: complete.
5. Add Google Doc creation adapter and provider receipt.

### Legacy GHL route boundary

The repository still contains older general-purpose `/api/ghl/*` and `/api/val/ghl/action*` routes used by legacy surfaces. They are not evidence that Transcript or Co-Work work is safely orchestrated. The canonical source-driven path is:

```text
source -> action candidate -> prepared artifact -> external action packet -> approval -> adapter -> receipt -> reconciliation
```

New Transcript and Co-Work actions must use that path. Migrating or retiring the older direct-mutation routes is a separate compatibility project and should be done only after their callers are inventoried.

### Phase 3: commercial and publishing actions

1. Add HighLevel estimate adapter.
2. Add HighLevel invoice adapter.
3. Define controlled existing-document send strategy.
4. Add email template adapter.
5. Add blog and social post adapters only after publication-state and account-target tests exist.

### Phase 4: research consolidation

1. Put synchronous and asynchronous Outscraper flows behind one research adapter.
2. Store request ID, results URL, query, status, and source results.
3. Separate cached general profile evidence from fresh research questions.
4. Add identity-conflict tests and user-exclusion tests.
5. Ensure research completion never mutates or delays the source receipt.

## Required Test Matrix

Every enabled action requires tests for:

- exact source excerpt preserved,
- wrong-person and duplicate-person rejection,
- unresolved project handling,
- missing required payload,
- applicable standing instruction precedence,
- approval required,
- approval expiry,
- payload edit invalidates approval,
- unsupported action blocked,
- missing provider scope/configuration,
- one adapter call only,
- idempotent retry,
- provider failure receipt,
- successful provider ID receipt,
- reconciliation to source, relationship, project, and task,
- no UI claim stronger than the provider receipt.

## Official Provider References

- HighLevel Send a New Message: https://marketplace.gohighlevel.com/docs/ghl/conversations/send-a-new-message/
- HighLevel Calendars Create Appointment: https://marketplace.gohighlevel.com/docs/ghl/calendars/create-appointment/index.html
- HighLevel Contacts: https://marketplace.gohighlevel.com/docs/ghl/contacts/contacts/index.html
- HighLevel Contact Tasks: https://marketplace.gohighlevel.com/docs/ghl/contacts/tasks/index.html
- HighLevel Contact Notes: https://marketplace.gohighlevel.com/docs/ghl/contacts/notes/index.html
- HighLevel Documents and Contracts: https://marketplace.gohighlevel.com/docs/ghl/proposals/documents-and-contracts-api/
- HighLevel Estimates: https://marketplace.gohighlevel.com/docs/ghl/invoices/estimate/
- HighLevel Invoices: https://marketplace.gohighlevel.com/docs/ghl/invoices/invoice/
- HighLevel Create Email Template: https://marketplace.gohighlevel.com/docs/ghl/emails/create-email-template/
- Google Calendar Events Insert: https://developers.google.com/workspace/calendar/api/v3/reference/events/insert
- Gmail Draft Create: https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.drafts/create
- Gmail Message Send: https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/send
- Google Docs Create: https://developers.google.com/workspace/docs/api/reference/rest/v1/documents/create
- Microsoft Graph Create Event: https://learn.microsoft.com/en-us/graph/api/user-post-events?view=graph-rest-1.0
- Microsoft Graph Create Draft: https://learn.microsoft.com/en-us/graph/api/user-post-messages?view=graph-rest-1.0
- Microsoft Graph Send Mail: https://learn.microsoft.com/en-us/graph/api/user-sendmail?view=graph-rest-1.0
- Microsoft Graph Create File: https://learn.microsoft.com/en-us/graph/api/driveitem-put-content?view=graph-rest-1.0
- Outscraper Google Search: https://docs.outscraper.com/endpoints/google-search/
- Outscraper Request Results: https://docs.outscraper.com/endpoints/requests-requestid/
