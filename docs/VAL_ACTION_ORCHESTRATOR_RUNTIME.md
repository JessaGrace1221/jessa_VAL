# VAL Action Orchestrator Runtime

Status: implemented shared runtime contract.

This runtime is the canonical action ledger for requests and commitments heard in incoming email, transcripts, Co-Work with VAL, general chat, and voice. It does not replace the source-specific intelligence that understands an email thread, transcript, relationship, project, or conversation. It gives every source the same durable path after an action is recognized.

## The Promise

VAL may listen broadly, but it must act through one narrow, inspectable path:

```text
Detect
  -> bind source and context
  -> prepare editable work
  -> review and approve
  -> execute through one verified provider adapter
  -> record provider receipt
  -> reconcile the result back to VAL
```

A transcript is evidence, not permission. A chat or voice instruction is also not proof that an external action succeeded. No user-facing surface may say `sent`, `scheduled`, `created`, or `updated` without the corresponding provider receipt.

## Entry Points

| Entry point | Source channel | What enters the ledger |
|---|---|---|
| Incoming email | `email` | The exact inbound message, selected thread identity, sender and recipient context, and any detected action candidates. Outbound messages are not treated as new requests. |
| Transcript intelligence | `transcript` | Exact transcript evidence plus structured prepared-work candidates. |
| Presence or voice transcript | `voice` | The spoken source and any structured action candidates extracted from it. |
| Scoped Co-Work | `cowork` | The user's answer, scope, working brief, source references, and resulting work item. |
| General chat | `chat` | Each user instruction, dashboard/project context, and conversation source reference. |
| Voice chat | `voice` | The same chat contract with a voice source channel. |

Each message or event receives its own immutable source receipt. Repeated delivery of the same event is idempotent; a later message in the same conversation cannot overwrite an earlier action's evidence. Incoming email also stores a compact trigger receipt on the canonical email message so Executive Inbox can show whether VAL found no action, detected an action, needs context, prepared work, awaits approval, or could not finish the review. A temporary review failure retries on the next sync without inflating email, thread, or conversation counts.

The tenant owner's connected Gmail and Outlook accounts are checked in the background every five minutes by default. This owner-only boundary is intentional while the legacy Google hot-token cache remains process-scoped. Other signed-in users still invoke their own user-scoped intake immediately when they refresh Executive Inbox. The background check uses a short two-day lookback and the same idempotent intake path as Executive Inbox refresh, so an unchanged provider message cannot create a second action candidate. Configure the cadence, lookback, and batch size with `VAL_EMAIL_ACTION_SYNC_INTERVAL_MS`, `VAL_EMAIL_ACTION_SYNC_LOOKBACK`, and `VAL_EMAIL_ACTION_SYNC_LIMIT`. Operational status is available at `GET /api/val/email/action-sync-status`.

## Durable Records

- `val_action_sources`: source channel, source identity, text excerpt, bound context, source references, and idempotency key.
- `val_action_candidates`: action type, current state, target, ambiguity, prepared artifact, capability truth, approval policy, external packet, and execution receipt.
- `val_action_candidate_events`: append-only lifecycle history from detection through reconciliation.

The local JSON store uses the matching `valActionSources`, `valActionCandidates`, and `valActionCandidateEvents` collections.

## Runtime States

The current runtime uses these externally meaningful states:

```text
candidate_detected
context_bound
prepared
awaiting_approval
approved
executing
succeeded | failed | expired | cancelled
receipt_recorded
reconciled
```

Execution is rejected unless all three conditions are true:

1. the capability is marked executable,
2. an external action packet exists,
3. the candidate is explicitly approved.

## Current Capability Truth

`LIVE` means the current code has an execution adapter and receipt path. It does not waive approval or provider configuration.

| Capability | Runtime state | Current boundary |
|---|---|---|
| Draft email | LIVE | Gmail or Outlook draft packet; approval required before provider execution. |
| Send email | LIVE | Exact recipient and payload preview; approval required. |
| Make introduction | LIVE | Prepared as a consent-aware email artifact; approval required. |
| Private calendar hold | LIVE | User-only busy block; approval required. |
| CRM task | LIVE | Exact contact/owner/task payload; approval required. |
| CRM note | LIVE | Exact contact and note payload; approval required. |
| Send SMS | LIVE | One verified HighLevel contact ID, one reviewed body, explicit approval, and final send confirmation. |
| Contact create/update | LIVE | HighLevel upsert requires an exact email or phone and disables create-on-duplicate; direct updates require a verified contact ID and reviewed allowlisted fields. |
| Contact tags | LIVE | Add/remove only for one verified HighLevel contact and reviewed tags; no full tag-list overwrite. |
| Opportunity update/stage move | LIVE | One verified HighLevel opportunity ID and reviewed allowlisted fields; approval required. |
| Attendee calendar invite | PREPARE ONLY | Artifact can be prepared; no verified attendee-send adapter is connected. |
| Proposal | PREPARE ONLY | Proposal artifact can be prepared; no verified provider-send adapter is connected. |
| Code | PREPARE ONLY | A source-linked engineering brief is prepared and carried to Leverage plus every exact project/task/transcript/relationship context. Transcript/chat never runs shell, commits, pushes, opens a PR, or deploys. |
| Document creation | ROUTE ONLY | Candidate is retained; Google/CRM document creation is not packetized here yet. |
| Research | LIVE READ ONLY | Uses the existing Outscraper Google Search submit-and-poll runner, verifies identity, retains source URLs, and carries the completed handoff to every exact linked context. Downstream action requires separate approval. |
| Publish content | ROUTE ONLY | Draft may be retained; no publish call is permitted from this runtime. |

## API Surface

- `GET /api/val/action-orchestrator/capabilities`
- `GET /api/val/action-orchestrator/candidates`
- `GET /api/val/action-orchestrator/candidates/:id`
- `POST /api/val/action-orchestrator/ingest`
- `POST /api/val/action-orchestrator/candidates/:id/prepare`
- `POST /api/val/action-orchestrator/candidates/:id/approve`
- `POST /api/val/action-orchestrator/candidates/:id/execute`
- `POST /api/val/action-orchestrator/candidates/:id/research`
- `GET /api/val/email/messages/:messageId/trigger-receipt`
- `GET /api/val/email/action-sync-status`

## What Still Needs Product Wiring

The canonical ledger is now shared. Completed research and prepared engineering briefs also enter the Co-Work carry-forward ledger, where Leverage, Chief of Staff, Round Table, Witnessing Steward, and every exact linked project, relationship, transcript, email thread, and task can project them. HighLevel SMS, contact, tag, and opportunity mutations use exact one-record adapters with approval, idempotency, provider receipts, and packet reconciliation. GitHub still needs a tenant-owned product connection and a separately approved execution adapter. Naming a capability in a prompt or exposing a low-level route does not make it live.

The longer source, packet, Round Table, and workflow requirements remain canonical in `VAL_TRANSCRIPT_ACTION_CAPABILITY_AND_WORKFLOW_REGISTRY.md`.
