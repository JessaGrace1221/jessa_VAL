# VAL Project Manager V1 Build Spec

Status: Approved documentation consolidation.

This document is the implementation-facing Project Manager V1 spec. It consolidates the approved project-manager decisions from:

- `VAL_PROJECT_MANAGER_ROUND_TABLE_AND_PACKETS.md`
- `VAL_SYSTEM_WIDE_SOURCE_AND_CLICK_MAP.md`
- `VAL_CONTEXT_REGISTRY.md`

Do not treat this as a new product direction. Treat it as the buildable V1 map for the Project Manager experience.

## Product Promise

The Project Manager page is how the executive knows things are being handled.

It should feel like a competent project manager has every base covered, not like a database view, generic project dashboard, or static dossier.

The page must answer:

```text
What is happening?
What has changed?
What has VAL already handled?
What needs executive judgment?
What is VAL preparing?
What can safely wait because VAL is watching it?
What is the next best move?
```

## First Principle

The visible drawer is called `Project Managers`.

The Project Managers drawer/card is only the entry point.

Opening a project should lead to a full Project Manager page.

The first screen must be dynamic. It should not always start with identity, snapshot, or project charter. Those are stable context. The top of the page should reflect what the Project Manager is handling right now.

## 2026-07-12 Implementation Status

The first source-backed Project Managers suggestion slice is implemented locally:

- admitted relationship + documents can create a suggested-project review update
- Project Managers shows pending suggestions at the top, subtly, above the project index
- the suggestion uses the two simple decisions:
  - `Yes, create this project and assign it a manager`
  - `No, this is not a project`
- approval creates a local project shell with one owner and a color-named Project Manager
- documents are recorded for both the Documents drawer and Project Manager page
- the same prepared suggestion is registered to Project Managers and Leverage / Ready For You
- `Put a pin in it` persists project reminders, records `reopened_at` when due, reopens due pins in Home Alignment, and lets the executive clear the reminder loop without marking the project complete
- scoped Project Managers Co-Work opens from a subtle top action and from project packet/action rows, with locked context for the selected project, selected action, source receipts, and affected artifact/object only
- the Project Manager page header now reflects the assigned color-named manager with a subtle accent, assignee pill, and project packet assignment field
- owner reassignment is available from the People involved card: choose an existing relationship or create a new local relationship owner, persist the owner in project metadata, and record a no-external-action relationship/project link
- live email intelligence and intelligence backfill now route admitted relationship document attachments into source-processing, using Gmail/Outlook attachment metadata and the same suggested-project review path

Still required before production truth:

- browser-visible/authenticated validation against real connected email data
- deployment decision and production verification
- broader source types beyond relationship-sent email documents

## Current Sequencing Decision

Implement the shared source-processing spine before building Project Managers as a larger visible surface.

Reason:

```text
This moves the needle for all of VAL, not just Project Managers.
```

Project Managers is the first major product proof of the spine, but it should not own private source-routing logic.

Required order:

1. Build the shared source-processing records and source router.
2. Route relationship-sent documents through Documents and Project observer logic.
3. Create suggested project review updates when no project exists.
4. Let the user approve or reject the project suggestion.
5. Create the Project Manager page only from approved/admitted project packets.
6. Wire scoped Co-Work and `Put a pin in it` as part of the first Project Managers slice.

## Project Suggestion Rule

Project Managers should suggest new projects only when a relationship sends documents.

Minimum evidence is documents. Typical evidence includes:

- agreements
- scopes
- decks
- proposals
- spreadsheets
- SOWs
- project files
- deliverables
- contracts

The suggestion should be extremely simple:

```text
Yes, create this project and assign it a manager.
No, this is not a project.
```

Do not silently create projects from emails or documents.

Do not suggest a project from a sender who is not an admitted relationship.

If the user says no, VAL should remember that rejection and avoid repeating the same suggestion from the same source pattern.

## Documents Placement

Documents live in both places:

- Documents drawer: the full document/reference library.
- Project Manager page: documents attached to that project, with source proof and project relevance.

Do not move documents out of the Documents drawer just because they are linked to a project.

## Ownership

V1 has one project owner.

The executive can reassign the owner by:

- choosing an existing relationship
- creating a new relationship when the owner does not exist yet

VAL may infer a likely owner from evidence, but ownership assignment remains explicit when consequential or ambiguous.

## Assigned Project Manager Names

Each project may be assigned a named Project Manager.

The name should be a color name rather than a human name. This keeps the experience warm and memorable without pretending VAL has separate human staff.

Use calm, executive-safe color names drawn from white, rose, and green families. Good candidates:

```text
Frost, Pearl, Alabaster, Snow, Ivory, Cotton, Lace, Porcelain,
Rose, Blush, Coral, Peach, Taffy, Ballet Slipper,
Sage, Fern, Olive, Moss, Seafoam, Mint, Basil, Pistachio
```

The Project Manager page header uses the assigned manager color as a subtle visual identity: a small assignee chip, a narrow accent, and color-aware project mark. This is an ownership cue, not a decorative theme.

Do not use muddy, dark, or overly whimsical manager names.

## Page Structure

Recommended architecture:

```text
Left rail
  -> projects navigation and recent projects

Header
  -> project name, type, owner, stage/phase, dates, team, health

Main column
  -> dynamic Project Manager focus module
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

The page should show proof for handled work:

- what source triggered the work
- what VAL did, noticed, prepared, linked, or monitored
- what packet/artifact changed
- where the result now lives
- what the user can do next
- what receipt proves it happened

## Dynamic Focus Priority

The top module is selected dynamically in this priority order:

1. Critical Project Issue
2. Needs Your Judgment
3. Prepared For You
4. Today's Reprioritization
5. Project Movement
6. Execution Adjustment
7. Project Reset
8. Quietly Watching

Every top module must be backed by a real Project Manager Focus Packet or Action Packet. It must not be decorative summary copy.

## Alignment Rule

Alignment is the open-loop command center.

It is not a general priority list, project feed, or place for every interesting risk.

A project item routes to Alignment only when there is an unresolved loop that needs executive attention, judgment, escalation, an answer, or approval before the loop can close.

An Alignment-bound project packet must answer:

```text
What loop is open?
What is needed to close it?
Why now?
What can VAL do next?
```

Closed loops leave Alignment and produce a simple receipt.

## Module Contracts

### Critical Project Issue

Use when there is a payment issue, deadline, failed dependency, blocked owner, unclear owner, angry stakeholder, relationship tension, service/access risk, launch risk, legal/contract risk, or high-risk trade-off.

Relationship health is part of project health. Tension in a transcript or email can be a critical project issue.

VAL must:

- identify the issue
- attach one brief clickable source proof
- prepare the recommended next move
- prepare a draft when appropriate
- ask before assigning an owner
- route to Alignment when unresolved
- place at the top of the Project Manager page

Allowed actions:

- approve recommendation
- approve/refine draft
- answer scoped question
- add context
- approve owner assignment
- ask scoped question

Do not use vague `dismiss` or `hold`.

Receipt example:

```text
VAL just handled the payment issue for Project X.
```

### Needs Your Judgment

Use when the Project Manager cannot safely move without the user's judgment.

Counts:

- choosing between options
- unclear owner
- strategic trade-off
- sensitive relationship decision
- scope change
- escalation
- external action approval
- one missing answer before VAL can prepare work

VAL must prepare:

- options
- recommendation
- brief clickable source proof
- consequence if delayed
- action packet
- draft/artifact when useful

User-facing language:

```text
I need one answer before I can prepare this.
```

Use `Put a pin in it`, not `not now`.

Receipt example:

```text
VAL just updated the project plan.
```

### Prepared For You

Use when VAL drafted or prepared something ready for review, refinement, approval, and execution.

Prepared work includes:

- email draft
- stakeholder message
- SOP draft
- workflow draft
- project plan update
- note
- schedule/calendar proposal
- document
- task list
- status update
- proposal
- invoice/payment follow-up
- meeting agenda
- project manager recommendation/action packet

Prepared work must appear in both:

- Project Manager page
- Leverage

Required proof:

```text
Why I prepared this:
What I prepared:
Where it is:
What I need from you:
What happens if approved:
```

If VAL needs answers, it asks one question at a time and leaves room for additional context.

Receipt examples:

```text
VAL just saved the SOP draft.
VAL just sent the approved stakeholder update.
```

### Today's Reprioritization

Use when anything new happens in the project.

Triggers:

- start of day
- user opens project page
- new project email
- transcript processed
- calendar attendee/event change
- missed task/commitment
- stakeholder tension
- payment issue
- new document
- receipt/invoice
- dependency change
- prepared work change
- any source/event tied to the project

VAL must re-scan:

- emails
- transcripts
- calendar
- documents
- commitments/tasks
- payment/project issues
- relationship tension/stakeholder health

Top module shows:

1. what VAL recommends first
2. what changed
3. what is at risk
4. who needs clarity
5. what VAL already handled

User can accept priority or choose a different top priority.

Receipt example:

```text
VAL just reprioritized Project X for today and is watching the partner timeline.
```

### Project Movement

Movement can be forward or backward.

Open-loop principle:

```text
If something was presented and has not been done, it is an open loop.
```

Forward examples:

- invoice paid
- document opened
- question asked
- clarification made
- requested document sent
- meeting held
- task completed
- dependency resolved
- decision made

Backward examples:

- payment not received
- important meeting canceled
- task slipped
- dependency failed
- stakeholder tension worsened
- document still missing
- owner unclear

Visible display:

```text
What changed
Movement direction: forward/backward
One-line source proof
Follow up action
```

Do not clutter with why-it-matters, affected people, broad priority analysis, or long follow-up explanation.

Routing:

- Home welcome/context when meaningful
- Project Manager page
- Velocity
- Project action layer
- Alignment only when movement opens, reopens, or blocks a loop needing executive attention

Receipt example:

```text
VAL just logged the website draft as completed and updated the launch project.
```

### Execution Adjustment

Use when the project plan cannot responsibly stay exactly the same.

Constraints:

```text
scope
time
cost
quality
resources
stakeholder expectations
risk
```

Triggers:

- scope creep
- timeline slipping
- budget pressure
- quality risk
- resource overload
- stakeholder asks for bigger/faster/cheaper
- dependency failure
- launch pressure
- sponsor/client expectation changes
- deliverable changes
- risk becomes active

Visible display:

```text
What changed
The trade-off
VAL's recommendation
Consequence if delayed
One-line source proof
Available actions
```

Routing:

- Project top module when active
- Alignment only when executive judgment is needed
- Velocity when project reality moved
- Leverage when VAL prepared a reviewable artifact

Receipt example:

```text
VAL just updated the launch plan to protect quality and moved the content deadline to Friday.
```

### Project Reset

Project Reset clears residue so the executive does not hold the project state in their head.

Triggers:

- end of day
- after meetings
- after major actions
- after open loops change
- next-morning VAL open
- stale open loops need restatement

Summary:

```text
What moved
What closed
What opened
What is still unresolved
Tomorrow's likely first move
```

Routing:

- Project page always stores reset
- Home welcome/context only when something shifted or needs attention
- Velocity when reset records meaningful movement
- Alignment only when an unresolved open loop needs the user
- Leverage only when VAL prepared something reviewable during reset

Receipt example:

```text
VAL just reset this project for tomorrow: two loops closed, one decision still needs you.
```

### Quietly Watching / Board Of Observers

Quietly Watching is the monitoring layer.

The Board of Observers is the primary surface for quiet watching.

Top of Board of Observers:

```text
Project-by-project watching summary
Projects listed alphabetically for now
```

Each project watch summary shows:

```text
Project name
What VAL is observing
What would trigger action
Last checked or source proof
Whether anything needs the user
Available actions
```

Actions:

- open source
- change rule
- add context
- ask VAL to prepare something
- put a pin in it
- stop watching

Layout:

```text
Top: project-by-project watching summary
Below: existing Board of Observers details, diagnostics, observer-specific information
```

Home does not show quiet watching by default. Home only shows it when a watch condition changes, becomes actionable, or the user opens a watching surface.

Receipt example:

```text
VAL is watching for Anthony's signed agreement. No action is needed right now.
```

## Global Interaction Rules

### Put A Pin In It

```text
User clicks "Put a pin in it"
  -> VAL asks "When do you want me to unpin this for you?"
  -> user picks date/time
  -> VAL stores pin-until timestamp
  -> VAL keeps watching
  -> at date/time, VAL surfaces: "This is unpinned. Let's work on it."
  -> Home Alignment treats it as a newly reopened loop only after the chosen unpin time
  -> user may open the Project Manager page, pin it again, or mark the reminder handled
```

This is now locally implemented with real persistence, `reopened_at` marking, Alignment resurfacing, and reminder-handled receipts. Keep it as a reminder loop, not a project-completion action.

### Scoped Questions

When VAL needs missing context:

```text
I have 3 questions.
Question 1...
```

VAL asks one question at a time and allows additional context before creating the draft, plan, action, or update.

### Scoped Co-Work

Every Project Manager action must open Co-Work scoped to:

- current project
- selected action/watch/reset/movement/issue
- attached source receipts
- affected artifact/object only

Do not let broad unrelated context leak in.

Scoped Co-Work is now locally implemented in the first Project Managers slice, even though the full standalone Co-Work V1 workspace is still a later build. Keep the visible top entry subtle, keep row-level Co-Work available from project packet/action rows, and keep the held context locked so typing does not erase or broaden the selected project/action packet.

## Source-To-Project Processing

Every incoming source should be eligible to update projects:

- email
- transcript
- calendar event
- document
- receipt/invoice
- user action
- CRM/project artifact

Processing path:

```text
Source arrives
  -> raw source preserved
  -> source receipt created
  -> Witness says what happened
  -> project relevance is evaluated
  -> Project Manager Round Table runs for affected projects
  -> appropriate focus/action packet is written
  -> surfaces update
  -> receipt is stored
```

## Home Surface Contract

Home is downstream. Home does not decide source truth.

Home areas:

1. Velocity: what happened.
2. Alignment: open-loop command center.
3. Leverage: prepared work ready for review.
4. Right-hand panel: calendar, Co-Work, Teach VAL, quiet support.

Project Manager routing to Home:

- Velocity: meaningful project movement.
- Alignment: unresolved open loop needing executive attention.
- Leverage: prepared work.
- Welcome/context: handled receipts and meaningful project shifts.

Home must not become a project feed.

## Context Registry Variables

Implementation should use the context variables in `VAL_CONTEXT_REGISTRY.md`, especially:

- `{{projects.current.project_manager_page}}`
- `{{projects.current.project_manager_current_focus}}`
- `{{projects.current.project_manager_focus_module}}`
- `{{projects.current.alignment_open_loop}}`
- `{{projects.current.movement_items}}`
- `{{projects.current.execution_adjustment}}`
- `{{projects.current.reset_packet}}`
- `{{projects.current.watch_items}}`
- `{{observers.board.project_summaries}}`

## V1 Acceptance Criteria

Project Manager V1 is acceptable only if:

1. Opening a project shows a full-page Project Manager experience, not a static drawer card.
2. The top module is dynamic and backed by a real packet.
3. Alignment only shows open loops needing executive attention.
4. Velocity shows meaningful forward/backward movement.
5. Leverage shows prepared work, and the project page also links to it.
6. Every handled item has a short receipt.
7. Every source proof is brief and clickable when possible.
8. Project Movement can recognize forward and backward movement.
9. Project Reset clears residue without crowding Home.
10. Board of Observers has a project-by-project quiet-watching summary at the top.
11. Every action opens scoped context, not broad generic chat.
12. `Put a pin in it` asks for a date/time and resurfaces at that time.
13. Relationship-sent documents can create a suggested project review with simple yes/no approval.
14. Project creation assigns one color-named Project Manager.
15. Project owner reassignment can choose a relationship or create a new one.
16. Scoped Co-Work opens from first-slice Project Manager actions.

## Non-Goals For V1

Do not build:

- a generic CRM project dashboard
- a static dossier-first project profile
- a noisy project feed
- a broad project chat without scoped context
- generic "insights" without receipts
- Alignment as a general priority list
- Board of Observers as backend diagnostics only

The executive should feel: VAL is handling the project, closing loops, watching what can wait, and asking only when judgment is actually needed.
