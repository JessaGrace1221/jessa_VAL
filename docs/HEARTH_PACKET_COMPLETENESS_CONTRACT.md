# Hearth Packet Completeness Contract

Purpose: make the click contracts trustworthy enough for live user testing.

The prior click contract proved that every clickable surface has a named packet, prompt/rule, allowed actions, and never-do rule. That is necessary, but it is not sufficient. A packet name is only trustworthy if the packet is hydrated from the full context web needed for that click.

## Required Shape

Every click must resolve to:

`click -> packet name -> Witnessing root -> selected surface/entity -> source evidence -> source-of-source -> graph links -> allowed actions -> approval gates -> receipt`

Runtime click nodes are annotated with:

- `data-val-click-contract`
- `data-val-variable-packet`
- `data-val-prompt-rule`
- `data-val-allowed-actions`
- `data-val-never-do`
- `data-val-required-layers`
- `data-val-source-web`
- `data-val-graph-links`
- `data-val-required-variables`

These attributes are not the whole data payload. They are the audit contract that says which data must be present before the prompt or rule can be trusted.

## Global Rule

Every meaningful packet must include the Witnessing root unless it is purely a read-only source receipt.

Witnessing root means:

- `{{teach_val.reviewed_memory}}`
- `{{onboarding.first_understanding}}`
- `{{user.preferences}}`
- `{{user.do_not_do}}`
- `{{rules.val_os.behavior_packet}}`
- `{{val.do_not_do}}`

The Witnessing root is not a giant prompt dump. It is the stable human/VAL context that prevents a function from acting like the current card is the whole truth.

## Relationship Packet

`relationship_packet` must carry:

- Witnessing root
- Selected relationship profile
- Relationship current state
- Source receipts and source-of-source
- Recent email thread context
- Calendar touchpoints and attendee context
- Transcript mentions and relationship updates
- Linked projects
- Linked documents
- Open tasks / commitments
- Approval and VAL OS rules

Required graph links:

- `projects.linked_to_relationship`
- `emails.thread.current.relationship_temperature`
- `calendar.current_event.relationship_intelligence`
- `recent_transcripts.relationship_updates`
- `documents.linked_to_relationship`
- `tasks.open`

If a relationship click cannot answer "what projects, emails, meetings, transcripts, documents, and commitments are connected to this person?", the packet is incomplete.

## Project Packet

`project_packet` must carry:

- Witnessing root
- Selected project profile
- Project source and source-of-source
- Linked relationships
- Relevant emails and project matches
- Calendar touchpoints
- Transcript open loops and project signals
- Linked documents
- Open tasks / commitments
- Prepared work
- Approval and VAL OS rules

Required graph links:

- `relationships.moving_project`
- `relationships.linked_to_project`
- `emails.current.project_match`
- `calendar.relevant_events`
- `recent_transcripts.open_loops`
- `documents.linked_to_project`
- `tasks.open`
- `drafts.current`

If a project click cannot answer "who is connected to this work, what changed in email/transcript/calendar, what is open, and what can be done next?", the packet is incomplete.

## Email Packet

`email_packet` must carry:

- Witnessing root
- Current email
- Full thread context
- Sender/recipient relationship match
- Project match
- Extracted commitments
- Calendar relevance
- Transcript relevance
- Prepared draft state
- Approval gates

Required graph links:

- `emails.current.relationship_match`
- `emails.current.project_match`
- `emails.current.commitments`
- `emails.thread.current.messages`
- `calendar.relevant_events`
- `recent_transcripts.relationship_updates`
- `tasks.open`
- `drafts.current`

An important email must never open a generic or unrelated relationship/project receipt.

## Home Source Packet

`home_source_packet` must carry:

- Witnessing root
- The exact Home card selected
- The selected source item
- Source type and source id
- Source refs and source receipts
- Source-of-source
- Linked relationships, projects, email threads, calendar events, transcripts, tasks, and prepared work
- Confidence and uncertainty

The Home card is not allowed to open a different object than the one named on the card.

## Timeline Packet

`timeline_packet` must carry:

- Witnessing root
- Calendar today/upcoming
- Current event
- Attendee resolution
- Relationship intelligence
- Internal context from email, transcript, CRM, tasks, projects, and memory
- Follow-up preparation
- Meeting source confidence

Calendar can show a meeting only after it can also explain what sources were checked.

## Workflow Packet

`workflow_scoped_packet` must carry:

- Witnessing root
- Active workflow action
- Active source
- Allowed actions
- Approval gates
- VAL OS rules
- Current relationship/project/email/calendar/transcript/document/task context when present

Workflow buttons must not inherit generic static workspace rules.

## Source Receipt Exception

`source_display_packet` may omit the full Witnessing root because it is not an action packet. It exists only to display evidence rows. It must still include source type, source id, source quote/summary, and never-do: no action from source rows.

## Current State

This contract is now present in runtime metadata through `hearthPacketCompletenessRegistry`. The next implementation layer is packet builders that hydrate these required variables from storage/API sources and fail closed when required layers are missing.
