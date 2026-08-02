# VAL Canonical Evidence and Work Lineage

Status: canonical implementation contract.

This contract defines the one path by which evidence becomes understanding,
priority, prepared work, and completed action in VAL.

```text
Source
  -> Source Processing Record
  -> Board Packet
  -> 14 Observer Receipts
  -> Round Table
  -> Chief of Staff Queue
  -> Home insight

Source Processing Record
  -> Canonical Work Admission when actionable work is grounded
  -> Chief of Staff ordering
  -> Alignment, Leverage, or Tasks
  -> User Decision or External Receipt
  -> Work Item Event and Updated Board Packet
```

Every executive surface is a projection of this lineage. A card, task, draft,
Observer statement, or Chief of Staff message is never its own source of truth.

## Source Truth

Each source version creates one immutable `source_processing_records` receipt.
The receipt keeps the tenant, user, source type, source identifier, content
fingerprint, exact evidence, and processing version.

Reprocessing unchanged evidence reuses the same source version. Changed evidence
creates a new version and preserves the earlier receipt.

## Canonical Work Admission

Every potential commitment or prepared action extracted from a source is
evaluated once. Sources that contain no grounded work still reach the Board and
receive Observer receipts; they do not create a work item. Work candidates and
their admission result are stored in `val_work_items`.

A work item requires:

- a real actor, or an explicit `unknown` owner state
- a concrete action
- an object or outcome
- an exact source quote or inspectable source reference
- a stable source fingerprint

Ownership is explicit:

- `user`: the executive owes the action
- `other`: another person owes the action
- `val`: VAL can prepare or complete work subject to its approval policy
- `unknown`: the evidence does not identify a safe owner

`unknown` never silently becomes a user task.

Admission status is explicit:

- `admitted`
- `needs_owner`
- `needs_context`
- `waiting_on_other`
- `already_complete`
- `rejected_noise`
- `archived`

No due date is invented. A due date exists only when the source states it or the
user explicitly sets it.

The envelope is project first. If no grounded project exists, VAL uses the
relationship. If neither exists, the item remains source-grounded without
inventing a project or relationship.

## Deduplication

One real-world obligation has one canonical work item. Its fingerprint combines:

- tenant and user
- normalized owner
- normalized action
- normalized object or outcome
- project or relationship envelope
- source identity

Repeated extraction updates lineage and confidence. It does not create another
task merely because a transcript was reprocessed or reworded.

## Board Receipts

Every accepted live source packet is offered to all 14 Observers. Each Observer must
return exactly one inspectable receipt:

1. `observed`: what this lens noticed, why it matters, and the source evidence.
2. `no_meaningful_signal`: this source produced no meaningful signal for this
   lens.

Rule-based routing may prioritize processing order, but it is not an Observer
deduction and must never be displayed as one.

Every Observer claim must retain:

- Board packet ID
- source processing record ID
- exact source references
- Observer prompt version
- processing status

## Chief of Staff

The Chief of Staff reads completed Observer receipts, not raw packet animation.
It ranks grounded recommendations in order and keeps the next eligible
recommendation ready.

When an Alignment item is marked complete, the next Chief of Staff recommendation
becomes eligible without rescanning raw sources.

The Home message names the concrete situation, person or project, relevant
evidence, recommended decision, and the Observer whose lens contributed the
insight. It never reports unexplained counts or atmospheric language.

## Alignment, Leverage, and Tasks

Alignment shows what the user may do next. It supports:

- `Done`
- `Co-Work w/ VAL`

Co-Work opens with the complete work packet already attached.

Leverage shows work VAL has actually prepared. A Leverage item must include the
real editable artifact and its source packet. Opening it goes directly to review,
edit, approve, send, schedule, or hold.

If VAL lacks required recipient, destination, delivery channel, or grounded
content, the item is not a draft. It becomes a `needs_context` or user task.

Tasks are a list projection of canonical user-owned work. Transcript titles,
email subjects, source snippets, unknown owners, and completed actions are not
tasks.

## Lifecycle

Every canonical work lifecycle transition appends a `val_work_item_events`
record. Prepared-work approval, rejection, and snooze decisions append
idempotent decision events without falsely marking the underlying work complete.
Events are never rewritten or deleted.

Canonical lifecycle states:

- `open`
- `in_progress`
- `waiting`
- `complete`
- `dismissed`
- `superseded`

Completing work, deciding on prepared work, or receiving an external execution
receipt creates canonical evidence for a new Board pass. Editing an unsaved
browser draft does not become system truth until it is saved or used in an
approved action.

## Non-Negotiable Integrity Rules

- No surfaced claim without inspectable evidence.
- No user task from an unknown owner.
- No invented due date.
- No duplicate task from unchanged evidence.
- No prepared work without a real artifact.
- No Observer deduction from a routing rule.
- No Chief recommendation before Observer processing completes.
- No UI-local state pretending to be durable system truth.
- No external action without its configured approval policy and action receipt.
