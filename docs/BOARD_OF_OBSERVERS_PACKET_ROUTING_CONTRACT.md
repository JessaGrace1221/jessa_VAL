# Board of Observers Packet Routing Contract

The Board of Observers is a reasoning-visibility layer, not another workspace.
It should show how VAL is being informed, not ask the user to manage the system from here.

## Current State

The Board visual uses a prototype packet field.

Before a Witnessing Session is complete, the Board should show no packet orbs and no active packet routes. It should hold the message:

`Holding space for Analytical and Relational Context`

After a Witnessing Session is complete, the prototype may show an active packet field with at least 20 packet orbs so the user can feel the future state. These packets are not yet live telemetry.

## Live Routing Rule

When live data is connected, every visible packet should have this shape:

`Source -> Packet Type -> Observer(s) -> Reason`

The Board should never show a packet merely because animation looks good. A packet must come from a real VAL source, or from an explicitly marked prototype/demo state.

## Primary Sources

Most packets should come from:

- Executive Inbox
- Calendar
- Transcripts
- Witnessing
- Synchronicity
- VAL-approved actions

## Initial Routing Contract

### Executive Inbox

Source systems: Gmail, sent mail, drafts.

Packet types:

- `email_attention_packet`
- `draft_review_packet`
- `reply_pressure_packet`

Routes:

- Courage: a reply, silence, or draft may require plain judgment.
- Relationship: a thread may change warmth, distance, repair, or trust.
- Commitment: an email may contain an implied promise or follow-up.
- Opportunity: a conversation may contain an emerging opening.

### Calendar

Source systems: Google Calendar, meeting prep, availability.

Packet types:

- `meeting_context_packet`
- `capacity_window_packet`
- `prep_timing_packet`

Routes:

- Capacity: the schedule determines whether judgment is available.
- Relationship: meetings can shift trust, repair, warmth, or presence.
- Commitment: meetings create or reveal promises.
- Environment: location, travel, and timing can change what is wise.

### Transcripts

Source systems: Krisp, uploaded transcripts, meeting notes.

Packet types:

- `meeting_evidence_packet`
- `decision_trace_packet`
- `task_extraction_packet`

Routes:

- Meaning: the transcript may reveal repeated themes and values.
- Project: meeting evidence may become project movement or blockers.
- Momentum: a transcript may clarify the next real move.
- Witnessing: user language can confirm or refine Witnessing context.

### Witnessing

Source systems: VAL Witnessing Session.

Packet types:

- `identity_context_packet`
- `relational_context_packet`
- `operating_context_packet`

Routes:

- Meaning: Witnessing provides the larger story and remembered values.
- Capacity: Witnessing names how the user makes good decisions.
- Delight: Witnessing protects aliveness, curiosity, and connection.
- Synchronicity: Witnessing gives repeated themes a known baseline.
- Courage: Witnessing reveals what must not be avoided.

### Synchronicity

Source systems: Board packets, cross-context memory, Witnessing echoes.

Packet types:

- `convergence_packet`
- `timing_cluster_packet`
- `pattern_echo_packet`

Routes:

- Meaning: a repeated arrival may reveal a larger theme.
- Opportunity: convergence can indicate a narrow opening.
- Relationship: a repeated name or signal may belong to relationship context.
- Capacity: convergence should be inspected without forcing action too early.

Guardrail:

Synchronicity never claims fate, signs, certainty, or causality. It only marks that independent signals are arriving together often enough to deserve inspection.

### VAL Action

Source systems: Co-Work, approved drafts, tasks, external actions.

Packet types:

- `approval_packet`
- `task_packet`
- `sent_action_packet`
- `learning_packet`

Routes:

- Momentum: approved work should create movement.
- Commitment: external actions can create promises that need protection.
- Executive Inbox: sent work can create a reply loop.
- Meaning: what happened should teach VAL what matters.

## Implementation Guardrails

- Before Witnessing, no packet orbs.
- After Witnessing, prototype packets are allowed but must remain internally marked as prototype/demo.
- Live packets should replace demo packets without changing the Board visual language.
- Packet labels should stay short, ideally three words or fewer.
- The Board should expose trust and reasoning without dumping raw chain-of-thought.
- Sage routes should lean analytical, operational, and capacity-aware.
- Rose routes should lean relational, introspective, meaning-aware, and alive.
