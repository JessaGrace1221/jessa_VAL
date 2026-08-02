# VAL Co-Work Context Audit

Status: launch contract.

This document answers one question for every VAL conversation: **what does this
chat already know when it opens?**

## Shared Conversation Standard

Every Co-Work chat must:

1. answer the executive's exact question first;
2. use the selected folder and packets before looking anywhere broader;
3. point out a supported pattern, tradeoff, risk, opportunity, or missing fact;
4. ask one useful forward-moving question only when it helps;
5. keep the selected work unfinished while the executive is thinking aloud;
6. preserve the conversation with that selected object; and
7. never expose packet fields, schemas, loading diagnostics, or backend process.

If the loaded packet does not support a claim, VAL says what is missing. It does
not borrow a nearby object or invent an answer.

## Home And Executive Desk

| Chat | Context folder | Packets and evidence already held | Boundary |
|---|---|---|---|
| Home VAL | Chief of Staff / whole VAL system | Live Board packets and Observer reviews, Executive Briefing, current Hearth state, active project context, relationship context, saved memory, uploaded VAL documents, linked Gmail attachments, Google Docs, GHL contacts/opportunities/tasks/conversations/notes/call transcripts, calendar, email, and approved external-action tools | This is the only general, cross-system VAL chat. External actions still require the relevant approval. |
| Alignment Co-Work | One selected Alignment item | Selected source item, Working Brief, project-first Envelope, relationship fallback only when no project exists, context lines, source receipts, transcript ids, evidence ids, observation ids, existing prepared work, and action history | Helps finish the selected action. It must not substitute the Home dashboard or another task. |
| Task Co-Work | One selected Commitment | Exact Commitment, verbatim source quote when available, Working Brief, project-first Envelope, owner/contact, due state, context lines, source receipts, transcript link, and prepared work linked to that Commitment | Helps complete the task. A draft appears only when a real draft is attached. |
| Meeting Prep Co-Work | One selected future calendar event | Meeting title/time, attendees, durable relationship profiles, project context, prior discussion evidence, open loops, public context, likely meeting purpose, questions, risks, follow-up, and intended outcome | Prepares the meeting only. It does not silently alter calendar, CRM, or source records. |
| Leverage review | One selected prepared item | Prepared Artifact body, source packet, recipient/audience, source receipts, action history, review state, and approval boundary | This is review/edit/approve/hold, not a generic chat and never an empty promise that work exists. |

## Project Managers

Every Project Managers chat holds the selected project's `project_packet`, its
immutable source receipts, linked relationships, documents, transcripts,
commitments, current prepared work, and only the named section packets below.

| Entry point | Context folder | Required packets |
|---|---|---|
| `project.overview` | Project > Round Table focus | `project_packet`, `project_manager_judgment_packet`, `project_overview_focus_packet` |
| `project.identity` | Project > What this is | `project_packet`, `project_identity_packet`, `project_owner_packet` |
| `project.onboarding` | Project > Project Interview | `project_packet`, `project_interview_packet` |
| `project.people` | Project > People involved | `project_packet`, `project_relationships_packet`, `project_owner_packet` |
| `project.documents` | Project > Documents / sources | `project_packet`, `document_receipt`, `project_source_references` |
| `project.milestones` | Project > Milestones | `project_packet`, `project_sop_packet`, `project_milestone_packet`, `project_workstreams` |
| `project.monitoring` | Project > Monitoring after launch | `project_packet`, `project_sop_packet`, `project_monitoring_packet`, `project_workstreams` |
| `project.relationship_nurture` | Project > Relationship nurture | `project_packet`, `project_relationships_packet`, `project_relationship_nurture_packet` |
| `project.why_it_matters` | Project > Why it matters | `project_packet`, `project_manager_judgment_packet`, `project_identity_packet`, `project_next_action_packet` |
| `project.risk` | Project > Risk / blocker | `project_packet`, `project_relationships_packet`, `project_risk_packet` |
| `project.narrative` | Project > Working narrative | `project_packet`, `project_manager_judgment_packet` |
| `project.needs_next` | Project > What VAL needs next | `project_packet`, `project_interview_packet`, `project_manager_judgment_packet`, `project_document_receipts`, `project_relationships_packet` |
| `project.sop` | Project > Operating system | `project_packet`, `project_sop_packet`, `project_identity_packet` |
| `project.phase` | Project > Current phase | `project_packet`, `project_sop_packet` |
| `project.prepared_work` | Project > Prepared work | `project_packet`, `project_prepared_work_packets`, `project_document_receipts` |
| `project.workstreams` | Project > Workstreams | `project_packet`, `project_sop_packet`, `project_relationships_packet`, `project_identity_packet` |
| `project.next_move` | Project > Next move | `project_packet`, `project_next_action_packet`, `project_owner_packet`, `project_identity_packet` |

Asking a question in any of these lanes no longer gets interpreted as a form
answer. VAL responds conversationally and leaves the section's Apply workflow
unfinished until the executive explicitly completes it.

## Transcripts

| Entry point | Context folder | Required packets |
|---|---|---|
| `transcript.working_brief` | One selected transcript | `transcript_working_brief`, immutable `transcript_source_receipt`, linked `calendar_event_packet`; exact Krisp Action Items and Key Points, invitees, linked people/projects, and prepared work |
| `transcript.action_item` | One exact Action Item in one transcript | `transcript_source_receipt`, `commitment_packet`; transcript id and exact source index |

The transcript source is never rewritten. Co-Work can explain, question,
prepare, or create a reviewable internal update from it.

## Executive Inbox

| Entry point | Context folder | Required packets |
|---|---|---|
| `email.thread` | One durable selected email thread | `email_packet`, `email_judgment_packet`, `prepared_artifact_packet`; message id, thread id, conversation id, provider, readable messages, matched supporting context, and any existing private draft |

The chat discusses the exact thread. With no draft, it can clarify the reply
outcome and prepare one private review draft. It does not send from Co-Work.

## Stewardship

| Entry point | Context folder | Required packets |
|---|---|---|
| `relationship.overview` | One selected durable relationship | `relationship_packet`, `relationship_stewardship_packet`, current source receipts, and current internal Stewardship state |
| `relationship.section` | One selected Needs, Offers, Relationship, or Evidence card | `relationship_packet`, `relationship_person_packet`, exact card id, immutable source receipts, and prior user-confirmed context |

The chat stays with that person and that card. It does not borrow another
relationship or turn a vague inference into fact.

## Board Of Observers

Every source packet is reviewed by all 14 Observers. Each review is either
`observed` with evidence or `no meaningful signal`. The selected Observer chat
holds that Observer's meaningful reviews, no-signal receipts, source trail,
card state, and current Board packets.

The 14 Observer folders are:

1. Executive Inbox
2. Relationship
3. Project
4. Capacity
5. Courage
6. Delight
7. Opportunity
8. Momentum
9. Meaning
10. Synchronicity
11. Commitment
12. Calendar
13. Environment
14. Witnessing

| Entry point | Context folder | Required packets |
|---|---|---|
| `observer.discussion` | One selected Observer lens | `observer_packet`, selected Observer reviews, source trail, source-backed card state, and current Board packet receipts |
| `board.chief_of_staff` | Chief of Staff / full Board | `observer_board_packet`, `chief_of_staff_packet`, all Observer responses, Board source trail, Executive Briefing, and ordered attention state |

Observer answers must sound like the named perspective, cite the person,
project, or source when it exists, and say "not enough signal" when it does
not. The Chief of Staff may synthesize across the Board; an individual Observer
may not pretend to be the whole Board.

## Deliberately Not Generic Chat

- Witnessing and Teach VAL use their protected structured flows.
- Lead Intelligence uses criteria, preview, approval, and import. It has no
  Co-Work lane.
- Documents and Commitments are evidence infrastructure. The executive reaches
  them through Transcripts, Project Managers, Stewardship, Executive Inbox,
  Tasks, Alignment, or Leverage.

## Automated Proof

Launch acceptance requires:

- every one of the 24 canonical entry points to be registered with required
  packets;
- all 22 structured entry points to answer a scoped question without mutating
  or completing their unfinished work;
- all 14 Observer chats to answer from their own evidence-backed lens;
- Home, Alignment, Tasks, Meeting Prep, and Leverage to retain the context
  boundaries described above; and
- the shared model prompt to require direct, human, forward-moving language.
