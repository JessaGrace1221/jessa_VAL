# Next Task: Morning Restart

Updated: 2026-07-11 end-of-day handoff

## Start Here

Read first:

```text
docs/CODEX_HANDOFF.md
docs/CODEX_CURRENT_STATE.md
docs/NEXT_TASK.md
docs/CODEX_DOCUMENTATION_FIRST_RULE.md
docs/VAL_PROJECT_MANAGER_V1_BUILD_SPEC.md
docs/VAL_COWORK_WITH_VAL_V1_BUILD_SPEC.md
docs/VAL_SYSTEM_WIDE_SOURCE_AND_CLICK_MAP.md
docs/VAL_REALITY_PROCESSING_PIPELINE.md
docs/HEARTH_TRUTH_LINEAGE_MAP.md
docs/HEARTH_CLICK_CONTRACTS.md
```

Then verify the working branch is based on the current live baseline:

```text
Production URL: https://jessaval-production.up.railway.app
Live baseline commit: 79e199a
Railway deployment: 060f540b-4b95-4505-8db8-f484e27c40bb
Working branch: codex/stewardship-person-packets
Latest pushed branch commit: 980d245
```

If production does not match the current live baseline, stop before changing code.

If the branch is not at or after `980d245`, pull the branch before continuing.

## First Morning Question

Ask the user whether to implement the documented Co-Work V1 workspace.

The relevant doc is:

```text
docs/VAL_COWORK_WITH_VAL_V1_BUILD_SPEC.md
```

The user specifically asked for:

```text
Co-Work with VAL to be bigger, clearer, exactly like ChatGPT with previous conversations on the left, open space, clean and clear and functional for an executive on mobile or desktop, with obvious voice options.
```

This documentation is drafted and pushed, but not yet approved for implementation.

Do not implement the full Co-Work redesign until the user approves.

## What Is Already Implemented

The Co-Work submit bug was fixed:

```text
Commit: 6bbe31f
Fix: Hearth home Co-Work form now has a Send button and submit calls runCowork('think').
Verification:
  node --check hearth-prototype.js
  node --test test/hearthLeadIntelligence.test.js
```

This only fixes response submission. It does not implement the full V1 workspace.

## What Is Approved Documentation

Project Manager V1 is consolidated here:

```text
docs/VAL_PROJECT_MANAGER_V1_BUILD_SPEC.md
```

The Project Manager spec includes:

- full Project Manager page
- dynamic top module order
- Alignment as open-loop command center
- Critical Project Issue
- Needs Your Judgment
- Prepared For You
- Today's Reprioritization
- Project Movement
- Execution Adjustment
- Project Reset
- Quietly Watching / Board of Observers

Use this spec before implementing Projects.

## Current Product Direction

Pause Stewardship-specific iteration.

The next problem is system-wide:

```text
Every email, transcript, calendar event, document, user correction, and external action receipt must go through one strict source-processing spine before any drawer, packet, prompt, or click can use it.
```

There are now two required spines:

```text
Source Processing Spine: what arrived, what it means, and what systems may use it.
Output Delivery Spine: what VAL prepared, where it is stored, where it appears, and what action the user can take.
```

Do not start with UI polish.

Do not add more local special cases to Stewardship.

Build the spine that makes Stewardship, Projects, Documents, Executive Inbox, Meeting Prep, Commitments, Ready For You, and Home read from the same source truth.

Exception: if the user approves the Co-Work V1 documentation in the morning, implement Co-Work first because the user just identified it as actively broken/insufficient.

## Required First Implementation

Implement the first version of a shared `source_processing_record`.

Also implement the first version of:

- `prepared_artifact_record`
- `surface_registration`

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

Prepared artifacts should not be considered "ready" unless they are persisted, registered to a visible surface, retrievable, visible, and attached to a working review action.

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
2. Add the prepared artifact schema/helper.
3. Add the surface registration schema/helper.
4. Add source classification helpers for spam/bulk/system/self/private/resource/source-only.
5. Route transcript processing through the source-processing record.
6. Add explicit introduction opportunity extraction from transcripts.
7. Add meeting overview and empty-transcript no-action delivery rules.
8. Route email sync/classification through the source-processing record.
9. Add attachment/document/project suggestion routing for email.
10. Add "What VAL did from this email" receipts.
11. Route calendar attendees through the source-processing record.
12. Add tests for the acceptance cases.
13. Only then return to Stewardship UI and suggestions.

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

## If Co-Work V1 Is Approved First

Implement from:

```text
docs/VAL_COWORK_WITH_VAL_V1_BUILD_SPEC.md
```

Minimum implementation requirements:

1. Full Co-Work workspace instead of small widget.
2. Desktop left sidebar with previous conversations.
3. Mobile conversation list drawer/sheet.
4. Main message/work area.
5. Large composer.
6. Obvious Send button.
7. Obvious Voice button.
8. Voice states: listening, paused, transcribing, VAL thinking, microphone blocked.
9. Context strip showing scope.
10. Conversation save/reload through existing routes.
11. No external action mutations from Co-Work.
12. Tests for open workspace, previous conversations, send response, voice controls, mobile layout contracts, and scoped context label.

Suggested code anchors:

```text
hearth-prototype.js
hearth-prototype.css
server.js
/api/val/chat
/api/val/conversations
/api/val/conversations/:id/messages
```

Minimum checks:

```bash
node --check hearth-prototype.js
node --check server.js
node --test test/hearthLeadIntelligence.test.js test/voiceIntegrationRegression.test.js test/contextualChat.test.js
git diff --check
```
