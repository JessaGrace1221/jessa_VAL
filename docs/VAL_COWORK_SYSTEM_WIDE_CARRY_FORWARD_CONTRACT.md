# VAL Co-Work System-Wide Carry-Forward Contract

Status: required architecture contract.

Purpose: ensure that nothing meaningful said, decided, corrected, prepared, or applied in Co-Work with VAL becomes an isolated chat fragment. Every Co-Work turn must create a durable chronological event, reach the Chief of Staff and Round Table, and be linked to every exact relevant packet and drawer without turning uncertain language into false fact.

Companion specifications:

- [VAL_COWORK_WITH_VAL_V1_BUILD_SPEC.md](./VAL_COWORK_WITH_VAL_V1_BUILD_SPEC.md)
- [VAL_COWORK_ENTRYPOINT_REGISTRY.md](./VAL_COWORK_ENTRYPOINT_REGISTRY.md)
- [VAL_CONTEXT_REGISTRY.md](./VAL_CONTEXT_REGISTRY.md)
- [VAL_STEWARDSHIP_ROUND_TABLE_AND_PACKETS.md](./VAL_STEWARDSHIP_ROUND_TABLE_AND_PACKETS.md)

## The Promise

Every meaningful Co-Work turn is carried forward.

That does **not** mean copying the full conversation into every drawer. It means:

1. the exact scoped conversation remains durable and chronological;
2. a source-backed carry-forward event is recorded;
3. the Chief of Staff receives the system-wide signal;
4. the Round Table receives the event for relevance and routing;
5. the Witnessing Steward receives the event and checks it against the user's confirmed Witnessing context;
6. the originating packet and drawer receive a linked receipt;
7. every exact linked project and relationship receives a linked receipt;
8. prepared work reaches its review surface;
9. uncertain matches remain visible as `needs_review` instead of being dropped or promoted as fact; and
10. external action remains approval-gated.

## Non-Negotiable Invariant

A Co-Work response or applied update is not complete unless it has:

- one durable `cowork_event`;
- one delivered Chief of Staff receipt;
- one delivered Round Table receipt;
- one delivered Witnessing Steward receipt;
- one delivered originating-scope receipt; and
- a delivery record for every exact linked project, relationship, packet, and drawer known at that moment.

If there is no additional relevant recipient, the event still reaches the Chief of Staff, Round Table, and originating scope. If an identity or match is uncertain, VAL records `needs_review`; it does not silently omit the person or attach the event to a guessed entity.

## One Canonical Path

```text
Co-Work user turn
  -> durable scoped session message
  -> canonical cowork_event
  -> Round Table routing receipt
  -> Chief of Staff global receipt
  -> Witnessing Steward enactment receipt
  -> originating packet and drawer receipt
  -> exact linked project and relationship receipts
  -> prepared-work receipt when applicable
  -> visible carried-forward proof
```

Applied work follows the same path and additionally records the exact internal update receipt. External actions still require the separate action packet and approval path.

## Canonical Event Envelope

```json
{
  "id": "coworkevent_...",
  "tenant_id": "tenant_...",
  "user_id": "user_...",
  "session_id": "cowork_...",
  "work_item_id": "workitem_...",
  "entrypoint_id": "relationship.section",
  "event_type": "conversation_turn",
  "status": "recorded",
  "summary": "The user clarified the relationship's current need.",
  "payload": {
    "user_message": "...",
    "val_response": "...",
    "promotable": false,
    "no_external_action": true
  },
  "source_refs": [],
  "created_at": "2026-07-20T00:00:00.000Z"
}
```

Event types in V1:

- `conversation_turn`: a user message and VAL response were saved;
- `applied_update`: reviewed internal work was applied;
- `correction`: the user corrected identity or context;
- `decision`: the user confirmed a durable decision;
- `prepared_work`: VAL prepared a reviewable artifact; and
- `no_action`: the conversation was retained but created no durable fact or action.

The event ledger is append-only. A correction creates a new event that replaces or deprecates the earlier claim by reference. It does not erase chronology.

## Delivery Envelope

```json
{
  "id": "coworkdelivery_...",
  "event_id": "coworkevent_...",
  "recipient_type": "relationship_packet",
  "recipient_id": "relationship_...",
  "status": "delivered",
  "reason": "Exact relationship selected when Co-Work opened.",
  "payload": {
    "operation": "link",
    "no_external_action": true
  },
  "delivered_at": "2026-07-20T00:00:00.000Z"
}
```

Drawers and packet projectors retrieve only their own deliveries through
`GET /api/val/cowork/carry-forward?recipientType=...&recipientId=...`. Tenant
and user scope are enforced by the service; one user cannot request another
user's carried-forward context.

Relevant drawers show one quiet, collapsed `What VAL is carrying` projection.
It displays only delivered events addressed to that exact drawer, keeps the
complete chronology in the ledger, and expands only when the user chooses to
inspect it. It is evidence of continuity, not another work queue and not a
duplicate card stack.

Opening Co-Work must also hydrate the new scoped working brief automatically
from that exact packet recipient. The compact context window is chronological,
source-linked, and excludes the current session's own message history to avoid
echoing the same conversation twice. The complete event ledger remains durable
even when the working brief uses only the most recent bounded context window.
The Chief of Staff hydrates from `chief_of_staff_packet:chief_of_staff`, so its
next conversation can reason across every prior Co-Work event. A project,
relationship, transcript, email thread, or Observer hydrates only from its exact
packet recipient; VAL must not borrow a similarly named entity's context.

Allowed delivery states:

- `delivered`: the event is durably linked to an exact recipient;
- `needs_review`: a possible recipient exists but identity or relevance is uncertain;
- `rejected`: the Round Table or user determined the recipient is wrong;
- `not_relevant`: the recipient was considered and explicitly excluded; and
- `failed`: delivery did not persist and must be retried.

## Recipient Rules

### Always

- `chief_of_staff_packet:chief_of_staff`
- `round_table:system`
- `observer_packet:witnessing_steward`
- the exact originating packet
- the originating drawer projection

### When Exact

- `project_packet:{project_id}` and `drawer:project_managers`
- `relationship_packet:{relationship_id}` and `drawer:stewardship`
- `transcript_packet:{transcript_id}` and `drawer:transcripts`
- `email_thread_packet:{thread_or_message_id}` and `drawer:executive_inbox`
- `observer_packet:{observer_id}` and `drawer:observer_board`
- `prepared_work_packet:{work_item_id}` and `drawer:leverage`
- task or commitment packets created from the applied result

Names alone are not durable identifiers. A name-only candidate is retained for review and must not be attached as an exact recipient.

## Packet Semantics

Receiving an event does not make every sentence a durable fact.

- The delivery is an evidence link.
- The Round Table decides whether a claim is relevant.
- User-confirmed or repeated source-backed claims may be promoted.
- Contradictions remain visible with provenance.
- Raw chat is not copied into packet summary fields.
- Packet summaries are projections over linked events, not duplicate stores.

This preserves the governing flow:

```text
Round Table decides.
Packet stores the source-backed link.
Drawer displays the relevant projection.
User approves consequential action.
```

## Observer Responsibilities

The Round Table receives every event and decides which observers should inspect it. At minimum:

- Relationships Observer: people, trust, commitments, care, introductions;
- Project Observer: outcomes, dependencies, ownership, milestones, risk;
- Correspondence Observer: email, drafts, reply rules, forwarding;
- Transcript Observer: action items, key points, meeting commitments;
- Capacity Observer: overload, timing, cognitive burden;
- Leverage Observer: prepared work and high-value next moves;
- Chief of Staff: system-wide synthesis, conflicts, gaps, and orphan prevention.
- Witnessing Steward: hold the direct Witnessing Session answers and reviewed Teach VAL memory, constrain every Co-Work conversation with that confirmed context, and surface where a stated priority, boundary, relationship commitment, voice rule, or operating preference may not yet be enacted.

An Observer may add an interpretation event, but it may not rewrite the original event or fabricate evidence.

### Witnessing Steward Runtime Contract

Every Co-Work working brief must contain a bounded `witnessingContext` block before the first response is generated. It is hydrated from the current tenant and user's direct Witnessing answers plus reviewed Teach VAL memory. It is never borrowed from another tenant, user, relationship, or project.

The block always exists, even when no Witnessing records exist yet:

```json
{
  "observerId": "witnessing_steward",
  "status": "available",
  "recordCount": 12,
  "directAnswerCount": 8,
  "reviewedMemoryCount": 4,
  "records": [],
  "responsibility": "Protect the user's confirmed priorities, boundaries, relationships, voice, and operating commitments, and surface enactment gaps.",
  "noExternalAction": true
}
```

`status` is `available`, `not_yet_available`, or `temporarily_unavailable`. An unavailable source must not prevent Co-Work from opening, but it must remain explicit rather than silently disappearing.

The Witnessing Steward may identify a possible enactment gap only when it can cite the relevant Witnessing record and the current event or packet evidence. It must say what remains unknown. It cannot turn an inferred preference into a rule or take external action.

## User-Visible Proof

Co-Work should show one quiet receipt after persistence:

```text
Carried forward
Chief of Staff · Relationships · GOALL Project
```

The receipt can expand to show:

- what was saved;
- which exact packets received it;
- which recipients need review;
- what was prepared;
- what still requires approval; and
- whether anything failed.

The UI must never say `carried forward` when a required delivery failed.

## Failure Rules

1. A saved chat with no event is an orphan and a defect.
2. An event with no Chief of Staff, Round Table, or origin delivery is incomplete.
3. A delivery to a guessed relationship or project is a false attachment and a defect.
4. A failed delivery stays retryable and visible; it is not discarded.
5. Cross-tenant delivery is forbidden.
6. External action is never implied by carry-forward delivery.

## Delivery Reconciliation

The intended recipient set is persisted inside the event envelope before the
first delivery attempt. Each delivery has a deterministic identity derived from
the event, recipient type, and recipient id. A repeated attempt therefore
updates the same delivery instead of creating a duplicate.

VAL attempts each missing delivery immediately. Events that remain `recorded`
or become `delivery_incomplete` are reconciled again when the service starts and
before a carried-forward projection is read. Reconciliation compares the
durable intended recipient set with delivered receipts, writes only the missing
receipts, and marks the event `delivered` only after the full intended set is
confirmed.

This is an internal repair path only. It never sends an email, SMS, calendar
invitation, CRM update, or other external action.

## Acceptance Tests

The system must prove:

1. every Co-Work response creates one event;
2. every applied update creates one event;
3. every event has Chief of Staff, Round Table, origin packet, and origin drawer deliveries;
4. exact project and relationship identifiers create packet and drawer deliveries;
5. observer and Chief of Staff conversations cannot remain chat-only;
6. uncertain identities become `needs_review` and are not promoted;
7. tenant and user isolation applies to events and deliveries;
8. event chronology is append-only;
9. no event delivery triggers external action;
10. a carried-forward receipt is returned to the caller;
11. opening the Chief of Staff hydrates prior Co-Work events from the global Chief packet; and
12. reopening an exact project, relationship, transcript, email thread, or Observer hydrates that recipient's prior delivered events without borrowing another entity's history.
13. an interrupted delivery is repaired from the saved intended recipient set;
14. repeated reconciliation creates no duplicate recipient deliveries; and
15. each relevant drawer can show a quiet, collapsed projection containing only events delivered to that drawer.
