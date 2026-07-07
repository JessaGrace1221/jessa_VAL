# Hearth Packet Hydration Audit

Purpose: prove whether Hearth packet variables are actually fed by live sources.

The packet completeness contract says what every click must know. The hydration audit says whether the app currently has a real provider for each required variable.

## Live Endpoint

`GET /api/hearth/packet-hydration-audit`

The endpoint returns:

- `liveCounts`: current counts from real services such as Executive Briefing, relationship profiles, project profiles, commitments, documents, drafts, and Teach VAL memory.
- `providers`: each source provider and whether it is `available`, `partial`, or `gap`.
- `packets`: each packet, each required variable, its provider, route/source, and status.
- `nextBuilderGap`: the next architecture step.

## Status Meanings

- `available`: a real route/service/source exists and can hydrate the variable.
- `partial`: the app has related plumbing, but it is not yet normalized into every Hearth packet.
- `gap`: required by the packet contract, but no unified Hearth packet builder hydrates it yet.

## Known Current Gap

The app now has:

- click contracts
- packet completeness requirements
- hydration provider audit

It does not yet have:

- a unified Hearth packet builder that assembles the required variables per click
- fail-closed enforcement when a required provider is missing
- per-click receipts proving which variables were actually included

That builder is the next layer.
