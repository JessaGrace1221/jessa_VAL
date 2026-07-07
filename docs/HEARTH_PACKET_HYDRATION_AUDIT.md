# Hearth Packet Hydration Audit

Purpose: prove whether Hearth packet variables are actually fed by live sources.

The packet completeness contract says what every click must know. The hydration audit says whether the app currently has a real provider for each required variable.

## Live Endpoint

`GET /api/hearth/packet-hydration-audit`

`GET /api/hearth/truth-lineage`

`GET /api/hearth/packet-receipts`

`POST /api/hearth/build-packet`

The endpoint returns:

- `liveCounts`: current counts from real services such as Executive Briefing, relationship profiles, project profiles, commitments, documents, drafts, and Teach VAL memory.
- `liveDataWarnings`: warnings when a provider exists but the current production dataset has no data to hydrate for that scope.
- `providers`: each source provider and whether it is `available`, `partial`, or `gap`.
- `packets`: each packet, each required variable, its provider, route/source, and status.
- `nextBuilderGap`: the next architecture step.

## Packet Builder

`POST /api/hearth/build-packet` accepts:

```json
{
  "packetName": "relationship_packet",
  "source": {
    "relationshipId": "optional",
    "projectId": "optional",
    "sourceId": "optional"
  },
  "click": {
    "action": "optional workflow or home action"
  },
  "mode": "preflight"
}
```

It returns:

- `status: "ready"` when all required variables are present.
- `status: "partial"` when providers exist but non-gated context is incomplete.
- `status: "blocked"` when an action-gated packet is missing required variables or has provider gaps.
- `missingRequired`
- `providerGaps`
- `providerPartials`
- `context`
- `receipt`
- `receiptId`

Action-gated packets fail closed. That means VAL may show the user what is missing, but it should not continue into an action workflow as if the context were complete.

The builder timeboxes provider reads so a slow source cannot freeze a click. If a provider cannot respond in time, the packet returns the safest available `partial` or `blocked` state.

Every packet build records a durable receipt in `hearth_packet_receipts` when Postgres is available, or in the local VAL store fallback when it is not. Receipts include packet status, variables, missing variables, provider gaps, source receipts, downstream consumers, and the clicked action/contract.

## Status Meanings

- `available`: a real route/service/source exists and can hydrate the variable.
- `partial`: the app has related plumbing, but it is not yet normalized into every Hearth packet.
- `gap`: required by the packet contract, but no unified Hearth packet builder hydrates it yet.

## Known Current Gap

The app now has:

- click contracts
- packet completeness requirements
- hydration provider audit

It now has:

- a first unified Hearth packet builder
- client-side preflight wired for server-hydrated action packets
- client/server variable parity checks for all server-enforced packets
- machine-readable truth lineage at `GET /api/hearth/truth-lineage`
- durable packet receipt storage at `GET /api/hearth/packet-receipts`
- fail-closed status for action-gated packets
- per-click receipts showing whether the packet was ready, partial, or blocked

It does not yet have:

- server hydration for every display/navigation metadata packet
- a user-facing packet receipt browser in the Hearth UI

## Variable Parity

The client registry now matches the server-enforced variable list for:

- `relationship_packet`
- `project_packet`
- `email_packet`
- `timeline_packet`
- `home_source_packet`
- `workflow_scoped_packet`
- `val_os_packet`

Client-only packets such as navigation, drawer index, source display, document, commitment, lead intelligence, Co-Work, and text-field packets still function as click metadata until the server builder hydrates them directly. They should not be described as fully confirmed packet flows yet.
