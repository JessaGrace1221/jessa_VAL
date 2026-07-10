# Hearth Click Contracts

Purpose: every Hearth page, card, drawer, button, and repeated row must have a named context packet plus a named prompt or deterministic rule behind the click.

This document is a product/runtime contract. It exists so VAL never shows unrelated context, never blends sources casually, and never offers generic actions where a source-specific action is required.

## Contract Shape

Every clickable surface should be traceable as:

```text
surface -> trigger -> variable packet -> prompt/rule -> source-of-source -> allowed actions -> never-do -> receipt
```

Required fields:

- `Surface`: the user-facing thing clicked.
- `Trigger`: DOM/action identifier.
- `Variable packet`: exact context allowed into the prompt/rule.
- `Prompt or rule`: named prompt suite, observer, deterministic handler, or approval rule.
- `Source-of-source`: evidence receipts the click is allowed to reveal.
- `Allowed actions`: buttons that can appear from this source.
- `Never do`: actions or context blending this click must not perform.
- `Receipt`: what the user should see after the click.

Runtime enforcement:

- Clickable elements are annotated by `hearthClickContractRegistry`.
- Runtime attributes:
  - `data-val-click-contract`
  - `data-val-variable-packet`
  - `data-val-prompt-rule`
  - `data-val-allowed-actions`
  - `data-val-never-do`
  - `data-val-required-layers`
  - `data-val-source-web`
  - `data-val-graph-links`
  - `data-val-required-variables`
- Dynamic controls are annotated through a `MutationObserver`.
- Chrome audits can inspect these attributes before clicking.
- Packet completeness is governed by [HEARTH_PACKET_COMPLETENESS_CONTRACT.md](./HEARTH_PACKET_COMPLETENESS_CONTRACT.md). The runtime source of truth is `hearthPacketCompletenessRegistry`.

Global rule:

- Do not send the whole registry into a click. Each click receives a packet.
- Do not combine Observe + Judge + Act in one prompt.
- Do not show action buttons that do not belong to the selected source.
- Do not show unrelated relationship, project, email, draft, calendar, or transcript context just because VAL has it.

## Global Packets

| Packet | Variables | Source |
|---|---|---|
| `home_source_packet` | `{{home.card.current}}`, `{{home.card.sourceItem}}`, `{{home.card.sourceType}}`, `{{home.card.sourceId}}`, `{{home.card.sourceRefs}}`, `{{val.confidence}}`, `{{val.uncertainty}}` | Executive briefing, Ready For You, email evidence, relationship/project/meeting/draft resolver |
| `relationship_packet` | `{{relationships.current}}`, `{{relationships.current.current_state}}`, `{{relationships.current.what_changed}}`, `{{relationships.current.source_receipts}}`, `{{projects.linked_to_relationship}}`, `{{documents.linked_to_relationship}}` | Stewardship dossier, CRM contact, project links, document links, review updates |
| `project_packet` | `{{projects.current}}`, `{{projects.current.one_sentence_understanding}}`, `{{projects.current.decisions_waiting}}`, `{{relationships.moving_project}}`, `{{documents.linked_to_project}}`, `{{source_reviews.pending}}` | Project dossier, document/context links, relationship graph, review updates |
| `email_packet` | `{{emails.current}}`, `{{emails.thread.current}}`, `{{relationships.current}}`, `{{projects.current}}`, `{{drafts.current}}`, `{{sourceRefs}}` | Gmail/Outlook event, Executive Inbox classification, draft review queue |
| `commitment_packet` | `{{tasks.current}}`, `{{commitments.current}}`, `{{sourceRefs}}`, `{{emails.current}}`, `{{calendar.current_event}}`, `{{relationships.current}}` | Commitment ledger, transcript/email/calendar source |
| `document_packet` | `{{documents.current}}`, `{{relationships.current}}`, `{{projects.current}}`, `{{sourceRefs}}`, `{{drafts.current}}` | Document drawer, Ready For You artifacts, onboarding imports |
| `timeline_packet` | `{{calendar.current_event}}`, `{{transcripts.current}}`, `{{tasks.current}}`, `{{proposed_reviews.current}}`, `{{sourceRefs}}` | Calendar sidebar, context debug, transcript proposal review cards |
| `lead_intelligence_packet` | `{{lead.criteria}}`, `{{lead.preview.current}}`, `{{lead.approvals}}`, `{{lead.source_urls}}`, `{{crm.mapping_contract}}` | Lead/partner preview endpoints, approval choices, CRM import mapping |
| `val_os_packet` | `{{teach_val.onboarding}}`, `{{val.os.review_queue}}`, `{{val.connections}}`, `{{val.runtime}}`, `{{sourceRefs}}` | Teach VAL onboarding, VAL OS review queue, setup health, connection status |
| `cowork_packet` | `{{active_surface.current}}`, `{{active_source.current}}`, `{{user.input}}`, `{{sourceRefs}}`, `{{val.needs_human_confirmation}}` | Any scoped Co-Work workspace |

## Home And Desk

| Surface | Trigger | Variable packet | Prompt or rule | Source-of-source | Allowed actions | Never do | Receipt |
|---|---|---|---|---|---|---|---|
| State switches | `data-state-option` | `home_state_packet`: selected visual state only | Prototype state display rule | None; visual posture only | Switch view | Do not run intelligence or mutate memory | State copy changes only |
| Why I am saying this today | `.lean-button` | `home_presence_packet` | Daily witness explanation rule | Executive briefing summary | Open/close evidence panel | Do not create tasks or drafts | Evidence panel opens |
| Fresh desk | `.fresh-desk-button` | `home_session_packet` | Session room-attendance reset rule | Session storage only | Clear held marks | Do not clear memory or source records | Desk attention marks clear |
| Calendar mini-card | `.agenda-card` / calendar tab | `timeline_packet` | Calendar sidebar rule | Google Calendar connection and event source | Open calendar panel, open meeting prep when applicable | Do not create/update calendar events | Calendar panel or meeting prep workspace |
| Co-Work companion | `.cowork-notebook` | `cowork_packet` with `active_surface=home` | Co-Work prompt suite | Current Home state only unless source is selected | Think with VAL, Draft with VAL | Do not send, save memory, or change CRM/calendar/tasks | Private Co-Work workspace |
| LinkedIn companion | `.linkedin-widget` | `relationship_packet` plus `linkedin_visibility_packet` | LinkedIn visibility preparation rule | LinkedIn support-circle/prepared comments | Copy manually, open source links | Do not post to LinkedIn | Manual-copy workspace |
| Teach VAL companion | `.teach-pen` | `val_os_packet` with `user.input` | Teach VAL extraction/review prompt | User-written teaching only | Review what I taught VAL | Do not save durable memory without review | Teach VAL review workspace |

## Home Cards

| Surface | Trigger | Variable packet | Prompt or rule | Source-of-source | Allowed actions | Never do | Receipt |
|---|---|---|---|---|---|---|---|
| Velocity card | `data-open-room="velocity"` | `home_source_packet` scoped to selected movement | Homepage Momentum/Velocity observer + workspace rule | Email, transcript, relationship, project, or evidence refs attached to that one item | Open source, Review evidence, source-specific action | Do not blend in unrelated Home items | Velocity workspace with source lines |
| Alignment card | `data-open-room="alignment"` | `home_source_packet` scoped to selected judgment | Highest Leverage / Alignment judge prompt | Source refs from the chosen item only | Open source, Draft reply/Create task for email, Review evidence | Do not open a different relationship/project than the card named | Alignment workspace with source lines |
| Leverage card | `data-open-room="leverage"` | `home_source_packet` scoped to prepared draft/work | Ready For You / Prepared Work prompt suite | Prepared artifact context, original email/transcript/task refs | Open prepared draft, Refine prepared work, Approve prepared work | Do not expose queue rows as extra CTAs | Leverage workspace with source lines |
| Home source rows | `data-home-room-source` | Source display only | Source receipt display rule | Source type/id/label | None | Do not act; rows are evidence, not buttons | No action |
| Home action buttons | `data-home-action` | `home_source_packet` plus clicked action | Home action posture rule or email action endpoint | Active workspace source item | Only actions listed in workspace | Do not infer additional actions | Receipt with source and no-external-action statement |

## Drawers

| Surface | Trigger | Variable packet | Prompt or rule | Source-of-source | Allowed actions | Never do | Receipt |
|---|---|---|---|---|---|---|---|
| Open drawers | `.drawer-pull` | `drawer_index_packet` | Drawer retrieval rule | Drawer availability only | Open drawer tray, close all drawers | Do not load unrelated detail panels | Drawer tray opens |
| Stewardship drawer | `.relationship-drawer-link` | `relationship_packet` index state | Stewardship understanding prompt suite | CRM contact, email/calendar/transcript/project/document refs | Open Stewardship view, All people, scoped Stewardship actions | Do not expose internal packet/debug language in the drawer | Stewardship drawer opens |
| Projects drawer | `.project-drawer-link` | `project_packet` index state | Project understanding prompt suite | Project source, linked people/docs/reviews | Open project file, Co-Work, Ask priority, Show alternatives | Do not create project records without explicit create flow | Project drawer opens |
| Timeline & Tasks drawer | `.timeline-drawer-link` | `timeline_packet` | Calendar/transcript/task observer rules | Calendar events, transcripts, proposed reviews, tasks | Co-Work, review transcript proposals | Do not create notes/tasks without review | Timeline drawer opens |
| Executive Inbox drawer | `.correspondence-drawer-link` | `email_packet` | Executive Inbox classification/draft prompt suite | Email thread, draft, source refs | Co-Work, Review, Prepare draft, Tighten draft, Send packet | Do not send directly from drawer click | Executive Inbox drawer opens |
| Commitments drawer | `.commitment-drawer-link` | `commitment_packet` | Commitment observer/task support prompt suite | Email/calendar/transcript/task evidence | Co-Work, Draft Email, Create Task, Schedule, status actions, Show Source | Do not send; status mutations need visible user action | Commitment drawer opens/status receipt |
| Documents drawer | `.document-drawer-link` | `document_packet` | Document observer/reference prompt suite | Document source, linked relationship/project | Co-Work, Present, Update, Send packet, Open Source, Link Context | Do not send or update live document without approval gate | Document drawer opens/status receipt |
| Lead Intelligence drawer | `.source-drawer-link` | `lead_intelligence_packet` | Lead Intelligence scraper prompt suite | Criteria, preview sources, approval choices | Run preview, choose approve/hold, import approved only | Do not import unreviewed leads | Lead Intelligence workspace/preview receipt |
| VAL drawer | `.val-drawer-link` | `val_os_packet` | VAL OS / Teach VAL prompt suite | Onboarding, memory review, connection health | Witnessing Session, Resume, Fresh, Connections, Review OS | Do not save durable memory without review | VAL drawer/workspace receipt |

## Relationship Surfaces

| Surface | Trigger | Variable packet | Prompt or rule | Source-of-source | Allowed actions | Never do | Receipt |
|---|---|---|---|---|---|---|---|
| Stewardship row/profile | `data-relationship-profile`, `data-relationship-open-profile` | `relationship_packet` for selected person | Stewardship resolver + dossier display rule | CRM contact/id, source receipts | Select/open Stewardship view | Do not infer wrong person from similar name | Profile brief updates |
| Relationship filters/search/sort | `data-relationship-state-filter`, `data-relationship-search`, `data-relationship-sort` | Relationship index packet | Index filtering rule | Relationship index metadata | Filter/sort only | Do not mutate relationship state | List updates |
| Relationship section actions | `data-relationship-section-actions` / `data-relationship-action` | `relationship_packet` plus section id | Section-specific relationship understanding rule | Section source receipts | Open full file, draft message, create task, ask alignment, Teach VAL | Do not send or update CRM without approval | Scoped workspace/receipt |
| Teach temperature | `data-relationship-action="teach_temperature"` | `relationship_packet` plus user correction | Relationship temperature correction prompt | User correction plus relationship evidence | Review temperature correction | Do not immediately change canonical temperature | Review update queued |
| Pending temperature review | `data-relationship-pending-temperature-review` | Relationship review update packet | Relationship temperature approval rule | Pending review update | Approve/reject learning | Do not save memory if rejected | Approval/rejection receipt |
| Refresh observers | `data-relationship-action="refresh_relationship_observers"` | `relationship_packet` | Observer refresh rule | CRM/LinkedIn/Apollo/Outscraper availability | Refresh/read receipt | Do not scrape/import automatically | Source receipt |

## Project Surfaces

| Surface | Trigger | Variable packet | Prompt or rule | Source-of-source | Allowed actions | Never do | Receipt |
|---|---|---|---|---|---|---|---|
| Project row/profile | `data-project-open-profile` | `project_packet` for selected project | Project dossier resolver | Project source and linked graph | Select/open project | Do not mix project context | Project brief updates |
| Create project | `data-project-create-toggle`, `data-project-create-form`, `data-project-create-cancel` | Project creation packet from form fields/files | Project create/review rule | User-entered source and uploads | Create/cancel | Do not create from empty or unrelated form data | Project creation receipt |
| Project source review | `data-project-review-update` | Project source review packet | Project source learning approval rule | Pending project source update | Approve/reject project-source learning | Do not change project judgment directly | Approval/rejection receipt |
| Open project file | `data-project-action="open_project_file"` | `project_packet` | Project file receipt rule | Current project evidence | Ask priority, Show alternatives | Do not mutate project | Project workspace receipt |
| Ask priority | `data-project-action="ask_priority"` | `project_packet` | Project priority judge prompt/rule | Decision evidence | Open project file, Show alternatives | Do not create tasks or reprioritize unrelated projects | Priority workspace receipt |
| Show alternatives | `data-project-action="show_alternatives"` | `project_packet` | Project alternatives rule | Current project evidence | Ask priority, Open project file | Do not rank from unrelated context | Alternatives workspace receipt |
| Project Co-Work | `data-project-action="cowork_project"` | `cowork_packet` with `projects.current` | Co-Work prompt suite | Active project source refs | Think/Draft/Back | Do not create external actions | Scoped Co-Work workspace |

## Timeline And Meeting Prep

| Surface | Trigger | Variable packet | Prompt or rule | Source-of-source | Allowed actions | Never do | Receipt |
|---|---|---|---|---|---|---|---|
| Timeline Co-Work | `data-timeline-action="cowork_timeline"` | `cowork_packet` with `timeline_packet` | Co-Work prompt suite | Calendar/transcript/task evidence | Think/Draft/Back | Do not create notes/tasks automatically | Scoped Co-Work workspace |
| Timeline match review | `data-timeline-match-review` | Transcript/calendar match packet | Timeline match explanation rule | Transcript and calendar match evidence | Expand/collapse review | Do not accept match silently | Review expands |
| Timeline match accept | `data-timeline-match-accept` | Transcript/calendar match packet | Timeline match acceptance rule | Matched transcript/calendar ids | Accept match | Do not attach wrong event if stale | Match receipt/status |
| Timeline review action | `data-timeline-review-action` | Proposed transcript review packet | Transcript proposal review rule | Proposed notes/tasks/context evidence | Approve/reject/reprocess as shown | Do not create final tasks/notes without review | Review receipt |
| Meeting prep card | `.agenda-card.active` | `timeline_packet` focused to current event | Meeting prep prompt suite | Calendar attendees, recent emails, tasks, transcripts | Contact candidate review, close | Do not create contacts without review | Meeting prep workspace |
| Meeting contact candidate | `workflow=contactCandidate/contactCreate/contactOpen` | Meeting attendee identity packet | CRM contact identity review rule | Calendar attendee payload | Create CRM contact, open Stewardship file | Do not merge/send/create task | Contact create receipt |

## Executive Inbox

| Surface | Trigger | Variable packet | Prompt or rule | Source-of-source | Allowed actions | Never do | Receipt |
|---|---|---|---|---|---|---|---|
| Correspondence item row | `data-correspondence-item` | `email_packet` for selected item | Executive Inbox item display rule | Ready For You/draft/email evidence | Select item | Do not send or draft | Brief updates |
| Co-Work reply | `data-correspondence-action="cowork_correspondence"` | `cowork_packet` with `email_packet` | Co-Work prompt suite | Selected email/draft evidence | Think/Draft/Back | Do not send | Scoped Co-Work |
| Review in Leverage | `data-correspondence-action="review"` | `email_packet` | Executive Inbox review workspace rule | Selected draft/evidence | Back, Teach VAL | Do not send | Review workspace |
| Prepare draft | `data-correspondence-action="generate"` | `email_packet` with conversation id | Email draft prompt suite | Email thread/conversation evidence | Saved draft review | Do not send | Draft prepared receipt/status |
| Tighten draft | `data-correspondence-action="revise"` | `drafts.current` plus email source | Email draft revision prompt | Existing draft and source refs | Revised draft review | Do not send | Draft revised receipt/status |
| Send draft | `data-correspondence-action="send"` | `email_packet` / `drafts.current` | External email send packet rule | Draft source refs and recipient | Prepare send packet only | Do not send directly | Send packet ready receipt |

## Commitments

| Surface | Trigger | Variable packet | Prompt or rule | Source-of-source | Allowed actions | Never do | Receipt |
|---|---|---|---|---|---|---|---|
| Commitment filter | `data-commitment-filter` | Commitment index packet | Commitment filter rule | Commitment metadata | Filter list | Do not mutate records | List updates |
| Commitment row | `data-commitment-item` | `commitment_packet` selected commitment | Commitment detail rule | Source quote/task/email/calendar refs | Select item | Do not mutate records | Brief updates |
| Commitment Co-Work | `data-commitment-action="cowork_commitment"` | `cowork_packet` with `commitment_packet` | Co-Work prompt suite | Commitment source quote | Think/Draft/Back | Do not send or change task status | Scoped Co-Work |
| Draft email | `data-commitment-action="draft_email"` | `commitment_packet` | Commitment follow-up draft rule | Commitment evidence | Draft review | Do not send | Draft created receipt/status |
| Create task | `data-commitment-action="create_task"` | `commitment_packet` | Commitment task creation rule | Commitment evidence | Task review/status | Do not set due date without context | Task created receipt/status |
| Schedule | `data-commitment-action="schedule"` | `commitment_packet` plus calendar availability | Task scheduling suggestion rule | Calendar availability and task evidence | Suggested time blocks | Do not create calendar event without approval | Schedule workspace/status |
| Complete/delegate/dismiss | `data-commitment-action` status values | `commitment_packet` | Commitment status rule | Selected commitment id/source | Status update | Do not alter other commitments | Status receipt |
| Show source | `data-commitment-action="show_source"` | `commitment_packet` | Source receipt rule | Commitment source id/quote | Open source if available | Do not infer missing source | Source receipt/status |
| Resolve contact | `data-commitment-action="resolve_contact"` | Commitment counterparty identity packet | Contact resolution rule | Counterparty/source evidence | Resolve/review contact | Do not attach wrong contact | Resolution receipt |

## Documents

| Surface | Trigger | Variable packet | Prompt or rule | Source-of-source | Allowed actions | Never do | Receipt |
|---|---|---|---|---|---|---|---|
| Document search/filter | `data-document-search`, relationship/project filters | Document index packet | Document filter rule | Document metadata | Filter list | Do not mutate docs | List updates |
| Document row | `data-document-item` | `document_packet` selected document | Document brief rule | Document/source refs | Select item | Do not send/update | Brief updates |
| Document Co-Work | `data-document-action="cowork_document"` | `cowork_packet` with `document_packet` | Co-Work prompt suite | Selected document refs | Think/Draft/Back | Do not update/send | Scoped Co-Work |
| Present | `data-document-action="present"` | `document_packet` | Document review/presentation rule | Document body/source refs | Back, Teach VAL | Do not alter source | Review workspace |
| Update | `data-document-action="update"` | `document_packet` | Document update preparation rule | Document body/source refs | Back, Teach VAL | Do not update live doc without approval | Update workspace |
| Send | `data-document-action="send"` | `document_packet` | External email send packet rule | Document source refs and recipient | Prepare send packet | Do not send directly | Send packet ready/status |
| Open Source | `data-document-action="open_source"` | `document_packet` | Source open rule | Source URL/id | Open source | Do not change VAL records | Status receipt |
| Link Context | `data-document-action="link_context"` | `document_packet` plus selected relationship/project | Document context linking rule | Relationship/project/document refs | Back, Teach VAL | Do not link wrong entity | Link workspace |

## Lead Intelligence

| Surface | Trigger | Variable packet | Prompt or rule | Source-of-source | Allowed actions | Never do | Receipt |
|---|---|---|---|---|---|---|---|
| Start organization scrape | `data-open-scraper="organizations"` | `lead_intelligence_packet` employer criteria | Lead discovery preview prompt | Public source URLs/criteria | Run preview, approve/hold | Do not import before approval | Preview workspace |
| Run partner scrape | `data-open-scraper="partners"` | `lead_intelligence_packet` partner criteria | Partner discovery preview prompt | Public source URLs/criteria | Run preview, approve/hold | Do not import before approval | Preview workspace |
| Approval flow | `data-open-scraper="approval"` | Lead approval packet | Lead approval/import rule | Preview choices | Import approved | Do not import held/unreviewed | Import receipt |
| Check connections | `data-open-scraper="connections"` | Connection health packet | Lead connection health rule | Tool/CRM configuration | Check/open setup | Do not run scrape | Connection receipt |
| Preview choice | `data-preview-choice` | Lead preview row packet | Preview approval rule | Preview row source refs | Approve/hold | Do not import on choice click | Approval count updates |
| Import approved | `workflow=import:*` | Approved lead packet | CRM import rule | Approved rows only | Import approved | Do not import held/unreviewed | Import receipt |

## VAL Drawer And Setup

| Surface | Trigger | Variable packet | Prompt or rule | Source-of-source | Allowed actions | Never do | Receipt |
|---|---|---|---|---|---|---|---|
| Begin Witnessing Session | `data-val-action="start_onboarding"` | `val_os_packet` onboarding state | Witnessing Session prompt suite | User answers and uploaded files | Answer, confirm, skip, upload, copy import prompt | Do not import other data except witnessing session when scoped that way | Witnessing workspace |
| Pick Up Where We Left Off | `workflow=valWitnessingResume` | Witnessing saved-state packet | Witnessing resume rule | Existing witnessing state | Resume current question | Do not restart or overwrite | Witnessing workspace |
| Start Fresh | `workflow=valWitnessingFresh` | Empty witnessing packet | Witnessing fresh-start rule | None until user answers | Start first question | Do not delete prior durable memory without approval | Fresh workspace |
| Connect inbox/calendar | `data-val-action="connections"` / `workflow=valConnections` | Connection health packet | VAL connections rule | Google auth/setup health | Connect Google, check OpenAI runtime | Do not fake connected state | Connections workspace/status |
| OpenAI runtime save | `workflow=valRuntimeOpenAI` | Runtime key/model packet | Runtime connection rule | User-entered key/model | Save/test runtime | Do not expose key in UI/logs | Runtime status |
| Google connection | `data-google-oauth` / `workflow=valGoogle` | Google connection packet | OAuth redirect/status rule | Google OAuth result | Connect/reconnect/check | Do not claim data synced until API confirms | Connection status |
| VAL OS review | `workflow=valOs` | VAL OS review packet | VAL OS instruction/approval prompt suite | Learning candidates/review queue | Approve/reject/save review items | Do not save durable memory without review | VAL OS workspace |

## Shared Dynamic Actions

| Surface | Trigger | Variable packet | Prompt or rule | Source-of-source | Allowed actions | Never do | Receipt |
|---|---|---|---|---|---|---|---|
| Workflow action | `data-workflow-action` | Packet determined by workflow prefix | `handleWorkflowAction` dispatch rule | Active workspace source | Only workflow-specific actions | Do not dispatch unknown workflow silently | Workspace/status receipt |
| Home action | `data-home-action` | `home_source_packet` | `handleHomeRoomAction` rule | Active Home source | Open source, approve/refine/review, email actions | Do not use stale active source | Action receipt |
| Workspace prompt copy | `data-workspace-prompt-copy` | Prompt card packet | Prompt copy rule | Prompt card content | Copy/place prompt | Do not save or send | Copied/placed status |
| Workspace tools | `data-workspace-tool` | `cowork_packet` | Workspace input tool rule | Active workspace only | Voice, upload, image request | Do not transmit externally without approval | Tool status |
| Autocorrect suggestion | `.val-autocorrect button` | User text field packet | Spelling suggestion rule | Current field text only | Replace misspelled word after click | Do not silently rewrite | Field value updates |

## Regression Rule

When a new clickable selector is added to Hearth:

1. Add it to this contract map or map it to an existing family.
2. Name its packet.
3. Name its prompt/rule.
4. Name what it must never do.
5. Add or update a focused test so the contract cannot disappear quietly.
