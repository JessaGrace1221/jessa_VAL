# Next Task: Morning Restart

Updated: 2026-07-11 end-of-day handoff

## 2026-07-12 Progress Note

The first source-processing / Project Managers slice is now implemented locally on `codex/stewardship-person-packets`.

Implemented:

- `source_processing_records`, `prepared_artifact_records`, and `surface_registrations` schema/service/route foundations.
- Relationship-sent documents can create a `create_project_from_relationship_documents` review update.
- The Project Managers drawer now has a subtle top `From documents` suggestion lane, hidden when empty.
- Suggested project choices are wired to the review-update approval path:
  - `Yes, create this project and assign it a manager`
  - `No, this is not a project`
- Approval creates one local project owner and assigns a color-named Project Manager.
- Suggested project surfaces are filtered to pending review updates, so approved/rejected suggestions do not reappear.
- The same suggested project is registered for Project Managers and Leverage / Ready For You.
- `Put a pin in it` now persists project reminders, records `reopened_at` when due, surfaces due pins in Project Managers and Home Alignment as newly reopened loops, and lets the executive mark the reminder handled without changing the project itself.
- Scoped Project Managers Co-Work now opens from a subtle top `Co-Work` button and from each project packet/action row; it locks context to the selected project, selected action, source receipts, and affected artifact/object only.
- Assigned color-named Project Managers now appear in the Project Manager page header as a subtle accent and assignee cue, and the assignment is included in the project manager packet.
- Owner reassignment now lives in the People involved card: the executive can choose an existing relationship or create a new local relationship owner; VAL persists the single owner in project metadata and records a no-external-action relationship/project link.
- Live email intelligence and intelligence backfill now route admitted relationship document attachments into source-processing, using Gmail/Outlook attachment metadata and the same Project Managers suggestion path.

Verified locally:

```text
node --check services/valSourceProcessingSchema.js services/valSourceProcessing.js services/valSourceProcessingRoutes.js services/valProjectPinsSchema.js services/valProjectPins.js services/valProjectPinsRoutes.js services/valReviewUpdates.js hearth-prototype.js server.js test/valSourceProcessing.test.js test/intelligenceBackfill.test.js
node --test --test-reporter=dot test/valProjectPins.test.js test/valSourceProcessing.test.js test/valReviewUpdates.test.js test/valReadyForYou.test.js test/hearthLeadIntelligence.test.js test/intelligenceBackfill.test.js
git diff --check
```

Remaining local validation / handoff work:

- Restart the local server after the latest `server.js` edits and smoke-check served assets/routes.
- Run browser-visible/authenticated validation if a connected email session is available.
- Decide whether to deploy this local slice or continue into broader source types.

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

Use this spec before implementing Project Managers.

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

Build the spine that makes Stewardship, Project Managers, Documents, Executive Inbox, Meeting Prep, Commitments, Ready For You, and Home read from the same source truth.

The user chose this sequence because it moves the needle for all of VAL, not only Project Managers.

Do not implement Co-Work V1 as a standalone first step. Co-Work scoped actions should be included in the first Project Managers slice after the source spine can create source-backed project suggestions and action packets.

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
- show two simple choices: `Yes, create this project and assign it a manager` and `No, this is not a project`
- only suggest projects when a relationship sends documents
- use documents as the minimum evidence threshold, especially agreements, scopes, decks, proposals, spreadsheets, SOWs, and similar project material
- keep documents visible in both the Documents drawer and the Project Manager page
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
12. Add Project Managers first-slice actions: approve/reject suggested project, assign one color-named manager, choose/create owner, open scoped Co-Work, and persist `Put a pin in it` reminders.
13. Add tests for the acceptance cases.
14. Only then return to Stewardship UI and suggestions.

## Do Not Do

- Do not rebuild the broad Stewardship drawer.
- Do not add more local-only Stewardship matching guesses.
- Do not rely on generic classifier labels as user-facing reasons.
- Do not use public enrichment to admit relationships.
- Do not allow inbound-only senders to become relationships by volume.
- Do not create projects silently from emails/documents.
- Do not suggest a project from a document sender who is not an admitted relationship.
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

## Project Managers First Slice Requirements

The first Project Managers implementation slice must include:

1. Source spine support for relationship-sent documents.
2. Suggested project review updates with simple yes/no creation.
3. One assigned project owner.
4. Reassignment by choosing an existing relationship or creating a new one.
5. Named project managers using color names, not human names.
6. Project Manager page headers that reflect the assigned manager color.
7. `Put a pin in it` with real persistence, reminder wakeup, Alignment resurfacing, and reminder-handled receipts.
8. Scoped Co-Work actions attached to the selected project, selected action, source receipts, and affected artifact only.

Suggested manager color-name pool:

```text
Frost, Pearl, Alabaster, Snow, Ivory, Cotton, Lace, Porcelain,
Rose, Blush, Coral, Peach, Taffy, Ballet Slipper,
Sage, Fern, Olive, Moss, Seafoam, Mint, Basil, Pistachio
```

Avoid names that feel too human, too muddy, or too cute for executive operations.

## If Full Co-Work V1 Is Approved Later

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
