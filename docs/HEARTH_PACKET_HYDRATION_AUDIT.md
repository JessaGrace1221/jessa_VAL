# Hearth Packet Hydration Audit

Purpose: prove whether Hearth packet variables are actually fed by live sources.

The packet completeness contract says what every click must know. The hydration audit says whether the app currently has a real provider for each required variable.

## Live Endpoint

`GET /api/hearth/packet-hydration-audit`

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

Action-gated packets fail closed. That means VAL may show the user what is missing, but it should not continue into an action workflow as if the context were complete.

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
- fail-closed status for action-gated packets
- per-click receipts showing whether the packet was ready, partial, or blocked

It does not yet have:

- client-side preflight wired before every workflow action
- durable per-click packet receipts stored for later review

That builder is the next layer.
