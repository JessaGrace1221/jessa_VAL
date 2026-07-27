# VAL Observer Agent Runtime Contract

Status: canonical foundation contract.

This contract defines what makes a VAL Observer a real bounded agent and what
makes the Chief of Staff a coordinating agent. It extends, rather than replaces:

- `VAL_CANONICAL_EVIDENCE_AND_WORK_LINEAGE.md`
- `BOARD_OF_OBSERVERS_PACKET_ROUTING_CONTRACT.md`
- `VAL_CHIEF_OF_STAFF_DECISION_MODEL.md`
- `VAL_CHIEF_OF_STAFF_PROMPTS.md`

## Core Rule

An Observer is not a name attached to a general prompt.

Every Observer has:

1. a bounded responsibility
2. a versioned instruction contract
3. durable context scoped to its lens
4. inspectable source evidence
5. an explicit execution lifecycle
6. one persisted receipt for every packet it reviews

The Chief of Staff does not invent an executive brief from raw sources. It
coordinates completed Observer receipts, reconciles competing truths, ranks the
grounded candidates, and keeps the next eligible recommendation ready.

## Bounded Observer Definition

Every canonical Observer definition must include:

```json
{
  "observer_id": "capacity",
  "observer_name": "Capacity",
  "version": "v1",
  "truth_protected": "The human remains capable of making good decisions.",
  "question": "What does this cost?",
  "reads": ["board_packet", "source_refs", "approved_memory"],
  "notices": ["load", "pressure", "recovery need", "timing strain"],
  "does_not": ["recommend", "rank", "draft", "send", "mutate source truth"],
  "output_contract": "observer_receipt_v1"
}
```

The role boundary is enforced in code and tests. Prompt wording alone is not an
execution boundary.

## Durable Context

An Observer's durable context is not an ever-growing chat transcript.

It is the evidence-qualified record of:

- immutable source processing records
- Board packets accepted for this tenant and user
- the Observer's prior receipts
- approved Witnessing and Teach VAL memory relevant to the lens
- entity envelopes for the grounded project, relationship, or source
- user corrections and outcome receipts that changed the Observer's belief

Every context read must remain tenant-scoped, user-scoped, versioned, and
traceable to its source. Compaction may summarize older receipts, but it must
retain evidence references, conclusions, corrections, and unresolved tensions.

## Observer Execution Cycle

Every packet offered to an Observer moves through these states:

```text
queued
  -> context_loaded
  -> reviewed
  -> observed | no_meaningful_signal
  -> validated
  -> persisted
  -> available_to_chief
```

Failure states are explicit:

```text
needs_context | retryable_failure | permanent_failure
```

A failed or incomplete Observer run is never silently treated as
`no_meaningful_signal`.

### Input

The Observer receives:

- Observer definition and prompt version
- Board packet ID
- source processing record ID
- exact source references
- relevant approved durable context
- project-first envelope, then relationship, then source
- earlier receipts only when they are relevant and still valid

### Output

Every review returns exactly one receipt:

```json
{
  "observer_id": "relationship",
  "observer_version": "v1",
  "packet_id": "packet_123",
  "source_processing_record_id": "source_456",
  "status": "observed",
  "observation": "Mike expressed frustration after the handoff changed again.",
  "watching": "Whether the next exchange repairs or increases that distance.",
  "concern": "Another ambiguous handoff may reduce trust.",
  "question": "Would a direct reset be more useful than another status update?",
  "evidence_refs": ["evidence_789"],
  "confidence": 0.86,
  "reviewed_at": "2026-07-27T14:30:00Z"
}
```

Or:

```json
{
  "observer_id": "relationship",
  "observer_version": "v1",
  "packet_id": "packet_123",
  "source_processing_record_id": "source_456",
  "status": "no_meaningful_signal",
  "observation": "No meaningful signal from my lens.",
  "evidence_refs": [],
  "confidence": 0.9,
  "reviewed_at": "2026-07-27T14:30:00Z"
}
```

An `observed` receipt is invalid without an exact, inspectable evidence
reference. `no_meaningful_signal` is an honest result, not an error.

## Chief of Staff Coordination Cycle

The Chief of Staff runs only after the required Observer receipts for a Board
packet are complete or explicitly marked failed.

```text
collect completed Observer receipts
  -> reject unsupported claims
  -> identify agreement, conflict, and uncertainty
  -> connect receipts to canonical work and prepared artifacts
  -> rank grounded candidates in order
  -> persist the ordered recommendation queue
  -> publish the first eligible Home and Alignment projection
  -> keep the next eligible recommendation ready
```

The Chief of Staff:

- reads Observer receipts and their evidence
- may ask for a missing receipt or additional context
- decides what deserves executive attention and in what order
- separates human action, VAL-prepared work, and no-action-needed
- attaches the complete packet to Co-Work
- sends only concrete prepared artifacts to Leverage

The Chief of Staff does not:

- treat routing rules as Observer deductions
- convert incomplete runs into certainty
- produce atmospheric or unexplained language
- rescan all raw sources when the next queued recommendation is requested
- execute an external action without the configured approval policy

## Execution Triggers

The agent contract is independent of trigger frequency.

Allowed triggers are:

- scheduled Board briefing
- explicit user refresh
- Witnessing completion
- approved correction or outcome receipt
- an operator-authorized source-specific run

Real-time source ingestion may store packets continuously without invoking all
Observers continuously. This protects cost, calm, and system responsiveness.

## Inspectability

The user must be able to inspect:

- what source entered VAL
- which Observer reviewed it
- whether the Observer observed a signal or found none
- the exact evidence supporting an observation
- when the run happened
- which prompt and Observer version ran
- what the Chief of Staff decided
- why another candidate ranked above or below it
- what work was prepared or executed afterward

VAL exposes conclusions and evidence, not hidden chain-of-thought.

### Board Card Projection

Clicking an Observer in the Board room must visibly project the same bounded
definition and durable receipts used by the runtime. The card shows:

- `What I Protect`, from the canonical Observer registry
- the latest honest state: observation stored, no meaningful signal, pending,
  or waiting
- how many completed packet reviews support the state and when the latest one
  completed
- the Observer definition version
- the current observation, watching stance, evidence, concern, and question

The card never turns a failed or incomplete review into `no meaningful signal`.
It does not display hidden reasoning or infrastructure diagnostics.

## Builder Compatibility

Future VAL Studio workflows use these contracts as stable building blocks.

An Observer block references an immutable Observer definition and selects which
packets it reviews. It does not permit a workflow author to remove the
Observer's evidence requirement or expand its authority into drafting or
execution.

Preparation, approval, and external-action blocks remain separate. This keeps
Observer judgment reusable without turning every Observer into an unsafe general
agent.

## Acceptance Tests

The foundation is not complete until tests prove:

- all 14 canonical Observers have bounded definitions
- every accepted packet produces 14 terminal receipts
- every `observed` receipt has inspectable evidence
- a failed run is distinguishable from `no_meaningful_signal`
- receipts survive reload and remain tenant-isolated
- the Chief of Staff waits for terminal receipts
- the recommendation queue retains its order
- completing Alignment promotes the next eligible recommendation
- Leverage admits only a real prepared artifact
- execution receipts return to the packet lineage as new evidence

## Non-Negotiable Rules

- No general-purpose Observer prompts.
- No unsupported Observer observations.
- No silent failed runs.
- No Chief of Staff summary built directly from packet animation.
- No recommendation without completed receipt lineage.
- No prepared work without the complete source packet.
- No external action hidden inside an Observer or Chief of Staff prompt.
- No workflow builder setting may weaken these boundaries.
