# Next Task: Build The System-Wide Source Spine

Updated: 2026-07-11

## Start Here

Read first:

```text
docs/CODEX_HANDOFF.md
docs/CODEX_CURRENT_STATE.md
docs/CODEX_DOCUMENTATION_FIRST_RULE.md
docs/VAL_SYSTEM_WIDE_SOURCE_AND_CLICK_MAP.md
docs/VAL_REALITY_PROCESSING_PIPELINE.md
docs/HEARTH_TRUTH_LINEAGE_MAP.md
docs/HEARTH_CLICK_CONTRACTS.md
```

Then verify the working branch is based on the current live baseline:

```text
Branch: codex/stewardship-person-packets
Commit: 79e199a
Railway deployment: 060f540b-4b95-4505-8db8-f484e27c40bb
Production URL: https://jessaval-production.up.railway.app
```

If it does not match the current live baseline, stop before changing code.

## Current Product Direction

Pause Stewardship-specific iteration.

The next problem is system-wide:

```text
Every email, transcript, calendar event, document, user correction, and external action receipt must go through one strict source-processing spine before any drawer, packet, prompt, or click can use it.
```

Do not start with UI polish.

Do not add more local special cases to Stewardship.

Build the spine that makes Stewardship, Projects, Documents, Executive Inbox, Meeting Prep, Commitments, Ready For You, and Home read from the same source truth.

## Required First Implementation

Implement the first version of a shared `source_processing_record`.

It should support:

- raw source identity
- source receipt
- witness observations
- executive relevance decision
- domain routes
- packet updates
- review updates
- prepared work candidates
- no-action receipt
- unknowns

Follow:

```text
docs/VAL_SYSTEM_WIDE_SOURCE_AND_CLICK_MAP.md
```

## First Acceptance Cases

### Terrie/Kareemah

A transcript where Jessa says she wants to introduce Terrie to Kareemah must:

- admit/update Terrie from transcript attendee context
- resolve Kareemah or create identity review
- create a first-class introduction opportunity
- preserve the transcript source quote
- never become generic "document request/follow-up"
- never suggest unrelated people from keyword overlap

### Anthony Documents

An email from Anthony with documents must:

- store the email source
- route documents/attachments to Document observer
- route project-like context to Project observer
- suggest a new project review update if no project exists
- avoid showing the email in Executive Inbox unless user judgment/reply is required

### Spam/Newsletter

Inbound messages with unsubscribe, bulk, list, no-reply, system, receipt, or notification signals must:

- not create person packets
- not create relationships
- not create Stewardship suggestions
- not feed Executive Inbox or Home
- optionally remain source-searchable

### Calendar Attendees

Calendar event attendees must:

- admit real human attendees as contacts/relationship candidates
- block self/resource/private/system/generic attendees
- never treat event title as a person
- feed Meeting Prep and relationship packets through source receipts

## Suggested Code Anchors

Start by reading:

- `server.js`
- `services/valConversationIdentity.js`
- `services/valTranscriptIntelligence.js`
- `services/valMeetingPrep.js`
- `services/valDocuments.js`
- `services/valReviewUpdates.js`
- `services/valReadyForYou.js`
- `services/valRelationshipActionIntelligence.js`
- `services/valIntelligenceSpine.js`
- `hearth-prototype.js`

Relevant existing functions/routes include:

- `saveEvidenceItem`
- `saveEvidenceObservation`
- `processTranscriptPayload`
- `runRelationshipEngineForObservations`
- `relationshipTargetsForObservation`
- `personPacketFromContact`
- `classifyConversation`
- `createValIntelligenceSpine`
- `buildExecutiveBriefing`
- `/api/val/email/sync`
- `/api/val/transcripts/intake`
- `/api/val/calendar/meeting-prep`
- `/api/val/documents`
- `/api/relationships/index`
- `/api/hearth/build-packet`

## Implementation Order

1. Add the shared source-processing schema/helper.
2. Add source classification helpers for spam/bulk/system/self/private/resource/source-only.
3. Route transcript processing through the source-processing record.
4. Add explicit introduction opportunity extraction from transcripts.
5. Route email sync/classification through the source-processing record.
6. Add attachment/document/project suggestion routing for email.
7. Route calendar attendees through the source-processing record.
8. Add tests for the four acceptance cases.
9. Only then return to Stewardship UI and suggestions.

## Do Not Do

- Do not rebuild the broad Stewardship drawer.
- Do not add more local-only Stewardship matching guesses.
- Do not rely on generic classifier labels as user-facing reasons.
- Do not use public enrichment to admit relationships.
- Do not allow inbound-only senders to become relationships by volume.
- Do not create projects silently from emails/documents.
- Do not send, publish, mutate CRM, schedule, or create external actions without explicit approval.
- Do not expose source-processing machinery in executive UI.

## Minimum Checks

Before committing:

```bash
node --check server.js
node --check hearth-prototype.js
node --check services/valTranscriptIntelligence.js
node --check services/valRelationshipActionIntelligence.js
node --test test/valTranscriptIntelligence.test.js test/valRelationshipActionIntelligence.test.js test/relationshipReviewRegression.test.js test/hearthLeadIntelligence.test.js
git diff --check
```

Add new tests for the source spine as implementation begins.
