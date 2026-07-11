# VAL Project Manager Round Table, Packets, and Rules

Projects is not a task list, file folder, or generic CRM object.

Projects is VAL's execution command center.

Its job is to understand an active body of work, keep every relevant part of VAL updated on its role, prepare what can be prepared, expose what needs executive judgment, and make sure the next move is never hidden inside scattered emails, transcripts, meetings, documents, or relationship notes.

The Chief of Staff protects attention and decides what deserves executive judgment.

The Project Manager turns admitted work into coordinated execution.

Each active project gets its own dedicated Project Manager.

This does not mean a separate visible bot persona. It means each project has a separated Project Manager Packet, memory, SOP fit, interview thread, decisions, open loops, relationships, and monitoring rules. A project manager for `HelpByShopping Frisson Partnership` must not blend work, assumptions, relationships, or next moves with `ACME Frisson Partnership` unless an SOP, relationship, document, or source explicitly connects them.

## Constitutional Rule

A Project Dossier is not a database record. It is VAL's executive understanding of an active body of work.

Every section must reduce cognitive load by transforming scattered evidence into current state, strategic importance, risk, decision, ownership, prepared work, and next action.

Raw context belongs in audit trails. The Project Dossier exists to help the user know what is happening, what matters, what is blocked, who is involved, what VAL prepared, and what should happen next.

The project manager's job is not to display what VAL knows. Its job is to manage the work.

## v1 Operating Rule

Projects may only show an active project when all of these are true:

1. The source or initiative passed the global Executive Relevance Engine for project use.
2. The project has a complete Project Admission Packet.
3. The project has a Project Manager Packet that can answer current state, why it matters, next action, owner, open loops, and source proof.
4. The project can route back to the exact source or source-of-source behind each displayed claim.
5. The project can feed downstream observers without blending unrelated relationship, inbox, transcript, calendar, document, or commitment context.

If any of these are missing, the item stays as quiet evidence, a conversation, or a candidate project. It does not become an active Projects drawer item.

## Executive Questions

The Projects drawer must answer the questions a user is already asking:

| Layer | Executive question |
|---|---|
| Identity | What is this project and why does it exist? |
| Current reality | Where does it stand right now? |
| Executive judgment | What matters, what changed, and what is the next move? |
| Coordination | Who is involved and what does each part of VAL need to do? |
| Risk | What is blocked, exposed, late, unclear, or quietly drifting? |
| Prepared work | What did VAL already create or prepare for approval? |
| Story | How did this project get here and what season is it in? |
| Action | What can the user trust, decide, review, approve, or do now? |

## Dedicated Project Manager Rule

Every admitted project must have a dedicated Project Manager boundary.

Required properties:

- one active Project Manager Packet per project
- one active project interview thread per project when shaping is needed
- one SOP selection or `no_sop_selected` state
- one project-specific relationship graph
- one project-specific decision log
- one project-specific prepared work queue
- one project-specific monitoring rule set
- one project-specific memory trail

The Project Manager may reuse SOPs, templates, lessons, and operating patterns. It may not reuse live context from another project unless the source explicitly belongs to both projects.

### Project Manager Interview

When a user creates or shapes a project, VAL should interview them like a newly hired project manager for that one project.

The interview can be voice or text.

It asks one useful question at a time, then converts rough user answers into clean project-manager language.

The interview must collect:

- project name
- project type or SOP fit
- intended outcome
- audience / client / beneficiary
- owner
- people involved
- workstreams
- deliverables
- dependencies
- deadline or cadence
- success metrics
- risks and sensitivities
- what VAL should prepare
- what VAL should monitor after launch
- relationship nurture requirements

The user should not have to fill out a database form. The user can think out loud; VAL structures the work.

## SOP Operating System

Many projects repeat.

VAL must let each project either:

1. use an existing SOP,
2. create a new SOP from this project,
3. continue without an SOP yet.

An SOP is not a static checklist. It is a living operating pattern learned from repeated project work.

Example:

```text
HelpByShopping Frisson Partnership
  -> uses Frisson Partner Onboarding SOP
  -> completes onboarding
  -> monitors client activation and relationship health
  -> updates the SOP with what worked, what changed, and what should happen next time
```

Then:

```text
ACME Frisson Partnership
  -> user chooses Frisson Partner Onboarding SOP
  -> VAL preloads phases, milestones, dashboard requirements, automations, API checks, metrics, risk patterns, and nurture cadence
  -> VAL asks only what is different for ACME
```

### SOP v1 Operating Rule

For v1, a project may show an SOP only when the SOP packet can answer:

- when to use it
- required inputs
- default phases
- default workstreams
- standard milestones
- approval points
- monitoring rules
- relationship nurture rules
- known risks
- what differs for this project

If these are missing, VAL may show `No SOP selected yet` and ask the user whether to choose or create one.

## GHL / CRM Opportunity Birth Rule

When a GHL / CRM opportunity is marked `WON`, it immediately becomes a candidate for active project creation.

For v1, a WON opportunity should create a Project Manager-ready project shell when:

1. the opportunity has a stable opportunity ID or name,
2. the opportunity status or stage is clearly `WON`,
3. the opportunity is not manually suppressed,
4. the pipeline is allowed to create projects.

The resulting project must:

- use the opportunity as the source of project birth,
- carry the GHL opportunity ID,
- carry the pipeline ID and pipeline name,
- carry the contact / relationship identity when available,
- open in Project Manager interview mode,
- load the SOP assigned to that pipeline when one exists,
- use `create_gradually` SOP mode when no SOP is assigned,
- avoid external actions until the user or an approved rule authorizes them.

If a pipeline has an assigned SOP, the Project Manager Packet should preload that SOP's phases, workstreams, milestones, approval points, monitoring rules, and relationship nurture rules.

If no SOP is assigned to the pipeline, VAL should gradually build an SOP from the project as it executes. The first project teaches the pattern. Later similar WON opportunities may reuse that SOP after user confirmation.

### Pipeline SOP Assignment

Pipeline-to-SOP mapping may come from:

- CRM / GHL custom field,
- VAL admin configuration,
- environment mapping,
- user confirmation during project interview.

The mapping produces a Project SOP Fit Packet:

```text
GHL opportunity WON
  -> Project Admission Packet
  -> Project SOP Fit Packet
  -> Project Interview Packet
  -> Project Manager Packet
```

### Won Opportunity Packet

Required variables:

- `opportunity_id`
- `opportunity_name`
- `opportunity_status`
- `pipeline_id`
- `pipeline_name`
- `stage_id`
- `stage_name`
- `contact_id`
- `contact_name`
- `contact_email`
- `assigned_sop_id`
- `sop_assignment`
- `project_id`
- `project_manager_interview_status`
- `source_receipt`

Feeds:

- Project Admission Packet
- Project SOP Fit Packet
- Project Manager Packet
- Relationship Dossier when contact identity is resolved
- Meeting Prep when meetings attach to the new project

Must not:

- send onboarding messages automatically
- create external tasks automatically
- update GHL again merely because the opportunity became a project
- blend the project with another WON opportunity in the same pipeline

## Project Admission Rules

Project admission happens after Witness and Executive Relevance, before the Projects drawer, Home, Meeting Prep, Co-Work, Relationships, or Leverage may use project context.

### Active Project Eligibility

A source may create or update an active project only when at least one is true:

- the user explicitly created, named, or confirmed the project
- multiple source types point to the same ongoing initiative
- repeated emails, meetings, transcripts, tasks, documents, or CRM records refer to the same body of work
- the project has a deliverable, deadline, owner, commitment, decision, proposal, or external consequence
- the Chief of Staff marks it as having executive consequence
- VAL has prepared work connected to it
- an external action receipt proves work occurred on it

### Candidate Project

A source may become a candidate project when there is plausible ongoing work, but not enough proof for active project status.

Candidate projects may be visible only in a deliberate review surface. They must not feed Home, Meeting Prep, Alignment, Leverage, or Relationship judgment until admitted.

### Quiet Evidence

The source stays quiet evidence when it is true but not project-worthy.

Examples:

- a one-off email with no next step
- a vague idea with no owner or consequence
- a single conversation that does not recur
- a relationship note with no shared work
- a document reference with no active initiative
- a suppressed or non-executive source

### Suppression Wins

If a person, sender, source, domain, or project is marked not executive-relevant, it cannot create or enrich a project unless the user explicitly reverses that suppression.

## Project States

Every project must carry exactly one state.

| State | Meaning | Allowed surfaces |
|---|---|---|
| `quiet_evidence` | True, stored, not project-worthy yet. | Source search or audit only |
| `candidate_project` | Possible project, needs confirmation or more evidence. | Project review surface only |
| `active_project` | Ongoing work with enough evidence to coordinate. | Projects drawer, related drawers |
| `strategic_project` | Active work with high consequence, leverage, risk, or priority. | Projects, Home when admitted, Meeting Prep |
| `blocked_project` | Work cannot move until a decision, owner, data, approval, or external action happens. | Projects, Alignment when Why Now is complete |
| `prepared_project_work` | VAL has prepared work tied to the project. | Projects, Leverage when Can VAL Act is complete |
| `complete_or_archived` | No active coordination needed. | Archive/history only |

## Chief of Staff and Project Manager Boundary

The Chief of Staff answers:

```text
Does this deserve the user's attention?
Why now?
Is this the best use of executive judgment?
```

The Project Manager answers:

```text
What is the current state of this work?
What needs to happen next?
Who or what is responsible?
What can VAL prepare?
Which drawers, observers, packets, and external systems must be updated?
```

The Chief of Staff feeds the Project Manager with attention gates, priorities, Why Now Packets, user constraints, and executive strategy.

The Project Manager feeds the rest of VAL with coordinated project truth.

## Project Manager Round Table

The Project Manager Round Table answers one question:

> What is the state of this body of work, what needs to happen next, and which parts of VAL must be updated?

It is a reasoning engine, not a UI surface.

It consumes Witness observations, Executive Relevance decisions, Chief of Staff judgment, and admitted source packets. It must not reread all raw context or invent project meaning without source proof.

### Participants

| Participant | Question | Output |
|---|---|---|
| Chief of Staff Observer | Does this project deserve attention now? | Attention gate, Why Now, executive priority |
| Project Identity Observer | What is this project and what aliases identify it? | Name, purpose, state, aliases, source proof |
| Witness Observer | What actually happened across sources? | Plain source observations |
| Relationship Observer | Who is involved and what role do they play? | Relationship roles, trust, obligations, risks |
| Commitment Observer | What is owed, promised, late, delegated, or waiting? | Commitment and owner list |
| Calendar Observer | What meetings, deadlines, or timing constraints matter? | Timing and meeting context |
| Email Observer | What project-relevant communications need attention? | Email signals and thread links |
| Transcript Observer | What did the user or others say about this work? | Decisions, promises, opportunities, risks |
| Document Observer | What artifacts exist or need updating? | Linked docs, proposals, packets, files |
| Prepared Work Observer | What has VAL created, drafted, organized, or prepared? | Prepared Work Packet candidates |
| Risk Observer | What is blocked, stale, sensitive, unclear, or exposed? | Risk Packet |
| Execution Observer | What can happen next and who can do it? | Next Action Packet and Can VAL Act status |
| SOP Observer | Does this project match an existing operating pattern? | SOP fit, deviations, reusable steps |
| Project Interview Observer | What does VAL still need to ask the user? | Next interview question and missing fields |
| Learning Observer | What did approvals, edits, or receipts teach VAL? | Future project memory update |

### Round Table Outcomes

The Round Table must produce exactly one primary outcome:

| Outcome | Meaning | Surface |
|---|---|---|
| `active_project_update` | Project changed and dossier should update. | Projects drawer |
| `needs_executive_decision` | User judgment is required before work can move. | Alignment or Projects |
| `prepared_work_ready` | VAL prepared work requiring review/approval. | Leverage and Projects |
| `blocked_needs_context` | Missing data prevents safe progress. | Projects or Co-Work |
| `quiet_project_memory` | Useful project truth, no interruption. | Project memory only |
| `candidate_needs_confirmation` | Possible project needs confirmation. | Project review surface |
| `complete_or_archive` | Project no longer needs active coordination. | Archive/history |
| `sop_update_available` | Completed or corrected work should improve an SOP. | SOP memory and future project starts |

## Required Packets

### 1. Project Admission Packet

Created by the Executive Relevance Engine before project interpretation.

Required variables:

- `source_id`
- `source_type`
- `project_candidate_name`
- `explicit_user_project`
- `source_count`
- `source_types`
- `has_deliverable`
- `has_deadline`
- `has_owner`
- `has_commitment`
- `has_document`
- `has_calendar_context`
- `has_relationship_context`
- `has_prepared_work`
- `manual_suppression`
- `admission_state`
- `admission_rule`
- `confidence`
- `source_receipts`

Feeds:

- Project Manager Round Table
- Candidate project review
- Project quiet evidence

Must not:

- create an active project without admission proof
- borrow context from suppressed sources
- feed Home directly

### 2. Project Identity Packet

Defines the project as a stable entity.

Required variables:

- `project_id`
- `canonical_name`
- `aliases`
- `purpose`
- `desired_outcome`
- `current_state`
- `strategic_importance`
- `project_season`
- `created_by`
- `created_from_source`
- `source_receipts`

Feeds:

- Project Dossier identity
- Relationship linked work
- Meeting Prep project context
- Co-Work project context

### 3. Project Movement Packet

Answers what changed.

Required variables:

- `project_id`
- `what_changed`
- `source_type`
- `source_id`
- `timestamp`
- `why_it_may_matter`
- `affected_relationships`
- `affected_commitments`
- `affected_documents`
- `affected_deadlines`
- `source_receipt`
- `source_of_source`

Feeds:

- Projects drawer change history
- Velocity only when passed by the Velocity Round Table
- Relationship dossier when a relationship role changes

Must not:

- say `Something changed`
- show movement without the exact source it opens

### 4. Project Manager Judgment Packet

The main synthesis packet for a Project Dossier.

Required variables:

- `project_id`
- `current_reality`
- `why_it_matters`
- `what_val_now_knows`
- `what_is_blocked`
- `what_is_at_risk`
- `recommended_next_step`
- `next_step_owner`
- `next_step_due_at`
- `user_decision_needed`
- `confidence`
- `evidence_summary`
- `source_receipts`

Feeds:

- Project Dossier executive judgment
- Chief of Staff priority review
- Alignment only when a complete Why Now Packet exists
- Co-Work when the project icon is opened

### 5. Project Relationships Packet

Coordinates people connected to the project.

Required variables:

- `project_id`
- `relationship_id`
- `relationship_name`
- `role_in_project`
- `trust_state`
- `open_loops`
- `owed_by_user`
- `owed_to_user`
- `recent_interactions`
- `relationship_risk`
- `source_receipts`

Feeds:

- Relationship Dossiers
- Project Dossier collaboration layer
- Meeting Prep attendee context
- Executive Inbox relationship/project matching

### 6. Project Commitments Packet

Tracks promises, owners, and follow-through.

Required variables:

- `project_id`
- `commitment_id`
- `commitment_text`
- `owner`
- `owed_to`
- `due_at`
- `status`
- `source_type`
- `source_id`
- `blocked_by`
- `next_action`
- `source_receipt`

Feeds:

- Commitments drawer
- Timeline and tasks
- Alignment when overdue or blocking
- Meeting Prep

### 7. Project Risk Packet

Protects the user from quiet drift.

Required variables:

- `project_id`
- `risk_type`
- `risk_summary`
- `why_it_matters`
- `if_ignored`
- `severity`
- `confidence`
- `source_receipts`
- `mitigation_next_step`
- `owner`

Feeds:

- Project Dossier risk layer
- Chief of Staff attention gate
- Alignment when action is needed now

### 8. Project Prepared Work Packet

Created when VAL can prepare output for the project.

Required variables:

- `project_id`
- `prepared_work_id`
- `work_type`
- `what_val_prepared`
- `why_val_prepared_it`
- `trigger_source`
- `required_approval`
- `editable_artifact`
- `can_val_act_status`
- `external_action_type`
- `missing_fields`
- `source_receipts`

Feeds:

- Leverage only when Can VAL Act status is complete
- Project Dossier prepared work
- Documents when artifact-based
- Executive Inbox when communication-based

Must not:

- send, update, schedule, attach, or create externally without approval or a user-created rule

### 9. Project Next Action Packet

Defines the smallest useful move.

Required variables:

- `project_id`
- `next_action`
- `action_type`
- `owner`
- `due_at`
- `why_now`
- `allowed_actions`
- `approval_required`
- `can_val_act_status`
- `receipt_expected`
- `source_receipts`

Feeds:

- Project Dossier action rail
- Alignment execution
- Co-Work project context
- External Action Packet after approval

### 10. Project Manager Packet

Composite packet produced by the Project Manager Round Table.

Required variables:

- `project_admission_packet`
- `project_identity_packet`
- `project_movement_packets`
- `project_manager_judgment_packet`
- `project_relationships_packet`
- `project_commitments_packet`
- `project_risk_packet`
- `project_prepared_work_packets`
- `project_next_action_packet`
- `project_interview_packet`
- `project_sop_packet`
- `chief_of_staff_attention_gate`
- `source_receipts`
- `downstream_feeds`

Feeds:

- Projects drawer
- Relationship Dossiers
- Meeting Prep
- Executive Inbox
- Commitments
- Documents
- Home Velocity, Alignment, and Leverage only through their separate admission gates
- Co-Work when the lower-right icon opens from a project surface

### 11. Project Receipt Packet

Created after a project action, approval, update, dismissal, or archive.

Required variables:

- `project_id`
- `action_taken`
- `result`
- `external_action_receipt`
- `updated_packets`
- `downstream_observers_notified`
- `what_val_learned`
- `reflection`
- `timestamp`

Feeds:

- Learn
- Reflect
- Remember
- Project history
- Relationship/project/commitment/document updates as applicable

### 12. Project Interview Packet

Created when the project is being shaped by voice or text.

Required variables:

- `project_id`
- `project_manager_id`
- `current_question`
- `question_purpose`
- `target_packet_field`
- `user_answer_raw`
- `val_rewrite`
- `missing_fields`
- `next_question`
- `ready_to_build_project_manager_packet`
- `source_receipts`

Feeds:

- Project Manager Packet
- Project Dossier fields
- SOP fit review
- Co-Work project context

Must not:

- expose raw packet context in chat
- blend answers into another project
- ask broad vague questions when a specific field is missing

### 13. Project SOP Packet

Reusable operating pattern for similar projects.

Required variables:

- `sop_id`
- `sop_name`
- `project_type`
- `when_to_use`
- `required_inputs`
- `default_phases`
- `default_workstreams`
- `standard_milestones`
- `task_templates`
- `relationship_roles`
- `automation_requirements`
- `metric_templates`
- `approval_points`
- `monitoring_rules`
- `relationship_nurture_rules`
- `risk_patterns`
- `lessons_learned`
- `last_updated_from_project`
- `confidence`

Feeds:

- New project interview
- Project Manager Packet
- Project Dossier workstreams
- Prepared work creation
- Monitoring rules
- Learning and Remember

Must not:

- auto-execute external work
- hide project-specific deviations
- overwrite a project's dedicated manager memory

### 14. Project SOP Fit Packet

Created during project intake.

Required variables:

- `project_id`
- `candidate_sop_ids`
- `selected_sop_id`
- `fit_reason`
- `known_deviations`
- `questions_to_confirm`
- `confidence`

Feeds:

- Project interview
- Project Manager Packet
- SOP selection UI
- Project creation defaults

## Drawer Surfaces

### Project Index

The index shows admitted projects only. It may appear as a drawer, side list, card, or navigation entry.

Each row should show:

- project name
- current state
- strategic importance
- next action
- owner
- risk or blocker if present
- prepared work count if present
- last meaningful movement

Do not show candidate projects, quiet evidence, unrelated source counts, raw context, or audit language in the main index.

### Full Project Manager Page

Opening a project should lead to a full-page Project Manager experience, not a cramped drawer card.

The Projects drawer/card is the entry point. The active project page is the working surface.

Purpose:

```text
Give the executive a project manager who can show what is happening, what matters, what VAL is doing, what needs judgment, and what can be acted on now.
```

This page should feel like a competent Project Manager has every base covered, not like a database view.

Core trust promise:

```text
This page is how the user knows things are being handled.
```

The first screen must not be a static project profile. It must be dynamic around the Project Manager's current operating moment.

The top of the page should answer:

```text
What is the Project Manager handling right now?
What has VAL already handled?
What needs executive judgment?
What can safely wait because VAL is watching it?
```

If VAL shows that something is being handled, the page must also show the path that proves it:

- what source triggered the project-manager work
- what VAL did, noticed, prepared, linked, or monitored
- what packet/artifact changed
- where the result now lives
- what the user can do next
- what receipt proves it happened

The full page should include:

- project navigation/sidebar or project list
- project breadcrumb
- project identity header
- project snapshot
- key facts
- recent activity
- next best actions
- main Project Manager reasoning sections
- project-manager action layer
- scoped action buttons
- bottom action rail
- lower Project finance/document summary

Recommended page architecture:

```text
Left rail
  -> Projects navigation and recent projects

Header
  -> project name, type, owner, stage/phase, dates, team, health

Main column
  -> Identity
  -> Observation
  -> Interpretation
  -> Meaning
  -> Wisdom
  -> Project Manager actions
  -> Finance/document summary near bottom

Right rail
  -> Project Snapshot
  -> Key Facts
  -> Recent Activity
  -> Next Best Actions

Bottom action rail
  -> Message Project / Co-Work
  -> Create Task
  -> Log Note
  -> Schedule
  -> More
```

The screenshot reference `projects card.png` points in the right direction: a full-page, calm executive project workspace with a navigation rail, strong project identity, main reasoning stack, right-side project facts/actions, and an action rail.

### Dynamic Project Manager Focus

The top module of the Project Manager page is selected dynamically.

It should not always be Identity, Snapshot, or Project Charter. Those are stable context. The top module should reflect what the Project Manager is doing at that point in the project/day.

Priority order:

1. Critical blocker, payment issue, deadline, owner gap, or executive-risk item.
2. User decision needed.
3. Prepared work ready for approval.
4. Today's reprioritization.
5. Active project movement.
6. End-of-day reset / tomorrow preparation.
7. Quiet monitoring if nothing needs attention.

The top module must be backed by a Project Manager Action Packet or Project Manager Focus Packet. It must not be generated as decorative summary copy.

### Dynamic Focus Modules

| Module | Trigger | What VAL must do | Visible surface | User action | Receipt |
|---|---|---|---|---|---|
| `Critical Project Issue` | Payment issue, deadline, failed dependency, blocked owner, service/access risk, angry stakeholder, relationship tension, high-risk trade-off | Create risk/next-action packet, notify Alignment, update project status, prepare next recommended move | Top module, Alignment, Project action layer | Approve recommendation, approve draft, answer scoped question, add context, approve owner assignment | Issue receipt + updated project packet + handled Home receipt when resolved |
| `Needs Your Judgment` | PM cannot safely move without user judgment, especially option choice, strategic trade-off, sensitive relationship decision, scope change, escalation, external action, or one missing answer | Create decision packet with options, recommendation, brief source proof, consequence if delayed, and action/prepared-work packet when possible | Top module, Alignment, Project action layer, Leverage if VAL prepared something | Choose option, approve recommendation, add context, ask scoped question, ask VAL to prepare draft, approve external action, put a pin in it | One-line decision receipt |
| `Prepared For You` | VAL prepared draft, SOP, workflow, note, schedule, document, or follow-up | Persist artifact, link to project/source, register in Leverage if reviewable | Top module or action layer; Leverage when appropriate | Review, refine, approve, reject | Prepared-work receipt |
| `Today's Reprioritization` | Start of day, new source since last review, changed priority/risk | Re-rank project priorities, identify risk today, clarify who needs context | Top module | Accept priority, ask why, change priority | Reprioritization receipt |
| `Project Movement` | Task completed/slipped, source added, meeting happened, document changed, dependency moved | Create movement packet and update current reality | Top module or recent activity | Open source, add context, ask what changed | Movement receipt |
| `Execution Adjustment` | Scope/time/cost/quality trade-off appears | Make trade-off explicit, show impact, recommend least-risk move | Top module when active | Choose trade-off, ask alternatives, escalate | Trade-off receipt |
| `Project Reset` | End of day, after meeting, after major action, stale open loops | Summarize what moved, decisions made, unresolved risks, tomorrow prep | Top module or lower reset card | Confirm, add missing context, create tomorrow task | Reset receipt |
| `Quietly Watching` | Nothing needs user attention but monitoring rules exist | Show what VAL is watching and why no action is needed | Top module only when no higher module exists | Open watcher, add context, change watch rule | Monitoring receipt |

### Module Path Completeness

Every dynamic focus module must pass this path:

```text
Source or time trigger
  -> Witness observation
  -> Project Manager Round Table
  -> Focus module selection
  -> Project Manager Focus/Action Packet
  -> Project page top module
  -> item-scoped user action
  -> receipt
  -> updated project memory
```

If any step is missing, the page must not imply that VAL handled the item.

### Critical Project Issue Contract

Critical project issues include:

- payment issue
- missed or threatened deadline
- failed dependency
- blocked owner
- unclear owner
- angry stakeholder
- relationship tension discovered in transcript or email
- service or account access risk
- launch risk
- legal, contract, or compliance risk
- high-risk scope/time/cost/quality trade-off

Relationship health is part of project health. If a transcript or email reveals tension, frustration, distrust, conflict, or an angry stakeholder, that can be a critical project issue even when the project tasks still look on track.

Required behavior before showing the issue:

```text
Critical issue detected
  -> identify the issue
  -> attach brief clickable source proof
  -> prepare the recommended next move
  -> prepare draft message when appropriate
  -> ask before assigning an owner
  -> route to Alignment
  -> place at top of Project Manager page
```

Source proof must be brief.

Example:

```text
Source proof: There was tension in this morning's call during the partner timeline discussion.
```

The source proof sentence should be clickable so the user can inspect the email, transcript, meeting, document, or source receipt.

Allowed user actions:

- approve VAL's recommendation
- approve or refine a prepared draft
- answer scoped questions
- add additional context
- approve suggested owner assignment
- ask a scoped question about this issue

Not allowed:

- vague `dismiss`
- vague `hold`
- silent owner assignment
- broad generic project chat
- long source dumps

Scoped question rule:

```text
If VAL has multiple questions:
  -> say how many questions there are
  -> ask one question at a time
  -> allow additional context after the required questions
  -> then continue preparing or resolving the issue
```

Resolution behavior:

The user should not have to manually mark the issue resolved as the primary path. VAL should show resolution when the issue is actually handled.

Resolved/handled items should surface in the Home welcome message or equivalent morning/context greeting.

Example:

```text
I handled the payment issue for Project XYZ. VAL linked the invoice, prepared the follow-up, and updated the project manager packet. Yay, go us. Let's see what's next.
```

### Needs Your Judgment Contract

Needs Your Judgment is the decision layer. It appears when the Project Manager cannot safely move the project without the user's judgment.

Counts as needing judgment:

- choosing between options
- unclear owner
- strategic trade-off
- sensitive relationship decision
- approving scope change
- deciding whether to escalate
- approving external action
- confirming whether VAL should create, send, schedule, assign, or update something
- one missing answer before VAL can prepare the work

Where it appears:

```text
Needs judgment
  -> top of Project Manager page
  -> Home Alignment card
  -> Leverage if VAL prepared a reviewable draft/artifact/action packet
```

Anything consequential belongs in Alignment.

Before asking the user, VAL should prepare:

- clear options when there are options
- VAL's recommendation
- brief clickable source proof
- consequence if delayed
- action packet when an action may follow
- draft/prepared artifact when useful, then place it in Leverage

Owner handling:

VAL should know who the work appears to belong to when the evidence is clear. If assigning ownership creates consequence or ambiguity, VAL should ask before assignment.

One-answer blocker:

```text
I need one answer before I can prepare this.
```

This should appear in Alignment when the missing answer blocks meaningful project movement or prepared work.

Allowed actions:

- choose option
- approve VAL's recommendation
- add context
- ask scoped question
- ask VAL to prepare a draft
- approve external action
- put a pin in it

Use executive language:

```text
Put a pin in it.
```

Do not use `not now` as the primary user-facing action label.

Receipt rule:

After the user decides, the receipt should be one simple line:

```text
VAL just updated the project plan.
```

or:

```text
VAL just prepared the follow-up for review.
```

or:

```text
VAL just put a pin in this and will keep watching it.
```

### Handled Work Copy Rule

Allowed:

```text
VAL linked this invoice to Project X.
VAL prepared the follow-up email for review.
VAL found a payment issue from this project.
VAL is watching the launch workflow dependency.
Nothing needs your attention right now; VAL is watching the open loops.
```

Not allowed:

```text
Project updated.
Insight generated.
Context found.
Things are moving.
```

The user should always understand what was handled, why it matters, and what VAL will do next.

### Project Dossier Sections

The dossier should be organized by user need:

1. Identity: what this is and why it exists.
2. Current reality: where it stands now.
3. Executive judgment: what matters, what changed, what VAL recommends.
4. Coordination: people, roles, commitments, open loops.
5. Prepared work: drafts, documents, schedules, updates, packets ready for approval.
6. Risk: blockers, drift, unclear ownership, sensitive consequences.
7. Story: living narrative and timeline by meaning.
8. Related context: recent activity, related work, quick facts.

The PM 101 source material adds required operational sections:

- Project Charter: business case, purpose, goals, scope, timeline, stakeholders, risks.
- Constraints: scope, time, cost, and quality trade-offs.
- Lifecycle Phase: initiation, planning, execution, monitor/control, closure.
- Work Breakdown Structure: objectives, activities, tasks.
- Stakeholders and Sponsors: executive sponsor, project leadership, teams, support areas.
- Communication: recurring meetings, stakeholder management, status transparency, progress celebration.
- Project Plan: timelines, budget, task tracking, issue resolution, risk management.
- Lessons Learned: closure, reporting, customer sign-off, what VAL learned.

The day-in-the-life source material adds required operating behaviors:

- reprioritize before reacting
- scan for blockers, updates, and noise
- detect early warning signs
- clarify misunderstandings
- resolve small conflicts before they grow
- make trade-offs explicit
- protect momentum while managing risk
- align stakeholders to reality
- document decisions immediately
- close loops the same day
- summarize meeting outcomes
- reduce ambiguity
- review what actually moved the project forward
- capture unresolved risks and tomorrow's likely trade-offs

For projects with an SOP, the dossier must also show:

- selected SOP
- current phase
- active workstreams
- next milestone
- monitoring cadence
- known deviations from the SOP
- what VAL is watching after launch

This section should feel like a project manager has every base covered.

### Project Manager Action Layer

The Project Dossier must not merely describe the project. It must show what the dedicated Project Manager is doing, preparing, monitoring, updating, or asking for.

Every displayed Project Manager action must be intensely actionable and scoped.

Examples:

- `VAL built the SOP draft for this project.`
- `VAL linked Anthony's invoice to this project.`
- `VAL found a payment issue.`
- `VAL prepared the follow-up email.`
- `VAL updated the relationship role for Michelle.`
- `VAL noticed the launch workflow is blocked.`
- `VAL created a project finance/document summary.`

Each displayed action must have:

- a plain-English action statement
- source proof
- affected packet or artifact
- current status
- next available user action
- scoped Co-Work entry
- receipt or pending receipt

The action row is not a generic note. It is a doorway into one specific piece of project-manager work.

### Project Manager Scoped Co-Work

When the user clicks a Project Manager action, Co-Work must open with only:

1. the active project packet,
2. the selected Project Manager action packet,
3. the source receipts directly attached to that action,
4. the specific artifact/document/SOP/workflow/commitment/relationship object involved.

It must not pull in the entire project history, unrelated project actions, unrelated documents, unrelated people, unrelated emails, or global memory.

Example:

```text
Displayed action:
VAL built the onboarding SOP draft.

Click:
Ask VAL / Add context / Review this

Co-Work context:
  -> current project
  -> selected SOP draft action
  -> SOP draft artifact
  -> source receipts that caused the SOP draft
  -> no unrelated project context
```

Required Co-Work opening posture:

```text
We are looking only at this project item.
```

Allowed user actions:

- add context to this item
- ask a question about this item
- refine the prepared artifact
- approve, reject, or hold the item when applicable
- link the item to a document, relationship, commitment, SOP, or project phase when applicable

Forbidden:

- blend another project into this item
- answer from unrelated source memory
- expose raw packet/debug context
- mutate the project broadly when the user only clicked one action
- treat the whole Project Dossier as the Co-Work scope

### Project Manager Action Packet

Every displayed Project Manager action must have a packet.

Required variables:

- `project_id`
- `project_manager_action_id`
- `action_statement`
- `action_type`
- `what_val_did_or_noticed`
- `affected_artifact_type`
- `affected_artifact_id`
- `source_receipts`
- `status`
- `next_user_action`
- `allowed_actions`
- `forbidden_actions`
- `cowork_scope`
- `receipt_expected`

Feeds:

- Project Dossier action layer
- scoped Project Co-Work
- Leverage when the action includes reviewable prepared work
- Alignment when the action is a priority/risk/payment issue
- Documents/Commitments/Relationships when the action updates those packets

Must not:

- render without source proof
- open generic project chat
- use the action as permission to change unrelated project fields

### Co-Work From Projects

Every Project surface uses the lower-right VAL icon only.

When opened, Co-Work receives the active Project Manager Packet privately. The overlay may show no more than two lines of plain-English context.

It must not print packet context, source refs, observer notes, JSON, raw evidence, or audit data into the chat unless explicitly coded for an audit/debug view.

## Downstream Feed Rules

The Project Manager must notify only the surfaces that need the project truth.

| If the project truth is... | Feed |
|---|---|
| meaningful movement | Velocity Round Table |
| best current priority | Chief of Staff and Alignment Why Now Packet |
| prepared output | Leverage Prepared Work Packet |
| promise, obligation, or follow-up | Commitments |
| person role or trust changes | Relationship Dossier |
| upcoming meeting context | Meeting Prep |
| communication needing judgment | Executive Inbox |
| artifact created or changed | Documents |
| approved external action | Receipt, Learn, Reflect, Remember |

No Home card may show project information unless the appropriate Home mode admits it:

- Velocity = meaningful movement only
- Alignment = complete Why Now Packet only
- Leverage = Prepared Work Packet plus Can VAL Act status only

## Source Propagation Pattern

```text
Source
  -> Witness
  -> Executive Relevance Engine
  -> Project Admission Packet
  -> Project Manager Round Table
  -> Project Manager Packet
  -> Projects drawer
  -> Related drawers and Home only through their own admission gates
```

Examples:

```text
New email arrives
  -> Witness observes exact request or update
  -> Executive Relevance decides whether it can affect project context
  -> Project Admission confirms existing project or candidate
  -> Project Manager updates current reality, commitments, relationships, risk, and next action
  -> Executive Inbox receives the email only if it needs user judgment
```

```text
Transcript says "VAL, prepare the proposal update"
  -> Witness records explicit request
  -> Project Admission links it to the project
  -> Project Manager creates Prepared Work Packet
  -> Leverage receives it only when Can VAL Act status is complete
  -> Approval creates Receipt Packet and updates project, documents, relationship, and memory
```

```text
Relationship trust changes
  -> Relationship Observer updates the Relationship packet
  -> Project Manager receives it only for projects linked to that relationship
  -> Project Risk or Judgment updates if the change affects work
```

## Forbidden Behavior

Projects must never:

- create an active project from one weak signal
- show raw packet context to the user
- show audit receipts on the main drawer surface
- blend unrelated project or relationship context
- open a source different from the displayed item
- send, schedule, update, attach, or create externally from a Project Dossier without an approval path
- feed Home because a project merely exists
- turn every idea into a project
- treat the Project Manager Round Table as a visible UI page

## Audit Questions

Every Project click must answer:

| Audit question | Required answer |
|---|---|
| Click purpose | What should this click help the user know or do? |
| Variable packet feeding the click | Which exact project packet is active? |
| Variables in that packet | What values are required before the click is trustworthy? |
| Things that feed the variable | Which source, source-of-source, observers, receipts, and graph links created it? |
| Destination | Which drawer, source, Co-Work session, approval surface, or receipt opens? |
| Allowed actions | What can happen safely here? |
| Forbidden actions | What must never happen from this click? |

If a Project surface cannot pass this audit, it should not be clickable yet.
