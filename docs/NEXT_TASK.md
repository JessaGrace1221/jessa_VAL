# Next Task: Morning Restart

Updated: 2026-07-12 live promotion plus Co-Work hotfix, source-processing receipts, Drive document evidence, MOU validation fixes, source-only document preservation, and Documents Gmail intake scan

## 2026-07-12 Progress Note

The first source-processing / Project Managers slice is now live on `codex/stewardship-person-packets`.

Post-promotion hotfix:

- Co-Work now opens immediately before packet hydration completes.
- Co-Work packet receipts hydrate in the background.
- Co-Work renders above open drawers at `z-index:1800`, including the Project Managers drawer Co-Work route.
- That hotfix was deployed as `dcaeec98-f345-4496-8b2c-23e46b6a6b1e` from commit `5aecdde Fix Co-Work open timing and drawer layering`.

Post-hotfix source-processing receipt slice:

- Source-processing records now carry a shared `whatValDidReceipt` / `what_val_did_receipt` describing what VAL did from the email/document.
- The same receipt is attached to prepared artifacts, Ready For You metadata, and Project Managers/Home surface registrations.
- Project Managers suggestion rows can render a quiet `VAL handled:` line from the shared receipt.
- That receipt slice was deployed as `bad2fd11-adbf-455a-99a0-a92840397af0` from commit `fb8a7bb Add source-processing what VAL did receipts`.

Drive/document evidence hardening:

- `relationship-document-email` now treats Google Drive/Docs links and Google Drive share notifications as document evidence.
- Drive share notifications can use the parsed real sharer instead of Google's no-reply sender for admitted-relationship matching.
- That evidence slice was deployed as `e94868f0-555c-428a-9554-c78832f9a52e` from commit `e98449a Treat Google Drive shares as document evidence`.

Aric MOU validation fixes:

- Documents now reads source-processing records directly, so the MOU attachment can appear in the Documents drawer as source evidence.
- Document email intake now recognizes existing project owners, so Aric attached to Frisson can count as the admitted relationship for source-processing even when Executive Inbox has not separately matched him.
- Document email intake now saves source-only evidence for unmatched document senders instead of skipping before source-processing can create a record; this keeps Documents from silently losing real attachments while Project Managers remains stricter.
- Documents now has a subtle `Scan Gmail` intake control so the user can run authenticated document intake from the Documents drawer and see document-email/source-record/suggestion/source-only counts.
- The live app is now deployment `f290ec10-a88c-45e7-9c18-5c64a3652dee` from commit `c820004 Add Documents Gmail intake scan`.

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
- Google Drive/Docs links and Drive share notifications now count as document evidence for the same relationship-document source-processing path.
- Existing project owners can qualify the sender for relationship-document intake when the person is attached through a project owner packet.
- Documents drawer rows now include source-processing document evidence.
- Unmatched document senders are persisted as source-only source-processing records and do not create Project Managers suggestions.
- Documents drawer `Scan Gmail` runs `/api/email/gmail/refresh`, refreshes `/api/val/documents`, and reports the source-processing intake counts.
- Shared "What VAL did" receipts now follow relationship-document source processing into source records, prepared artifacts, Ready For You metadata, and Project Managers/Home surface registrations.
- Backend-only source-processing POST is blocked in public Hearth test mode; live read routes remain available.
- The one no-action source-processing smoke-test record created during deployment validation was deleted from production.

Verified locally:

```text
node --check services/valSourceProcessingSchema.js services/valSourceProcessing.js services/valSourceProcessingRoutes.js services/valProjectPinsSchema.js services/valProjectPins.js services/valProjectPinsRoutes.js services/valReviewUpdates.js hearth-prototype.js server.js test/valSourceProcessing.test.js test/intelligenceBackfill.test.js
node --check services/valSourceProcessing.js services/valSourceProcessingRoutes.js services/valSourceProcessingSchema.js server.js hearth-prototype.js test/valSourceProcessing.test.js test/hearthLeadIntelligence.test.js
node --check server.js services/valSourceProcessing.js test/valSourceProcessing.test.js test/intelligenceBackfill.test.js
node --check services/valDocuments.js services/valDocumentsRoutes.js server.js test/valDocuments.test.js
node --test --test-reporter=dot test/valProjectPins.test.js test/valSourceProcessing.test.js test/valReviewUpdates.test.js test/valReadyForYou.test.js test/hearthLeadIntelligence.test.js test/intelligenceBackfill.test.js
node --test --test-reporter=dot test/valSourceProcessing.test.js test/intelligenceBackfill.test.js
node --test --test-reporter=dot test/valDocuments.test.js test/valSourceProcessing.test.js test/hearthLeadIntelligence.test.js test/valReadyForYou.test.js
git diff --check
```

Verified live:

- Railway deployment: `f290ec10-a88c-45e7-9c18-5c64a3652dee`
- Production root returns `200`.
- `/api/config/status` returns `VAL Proxy OK`.
- `/api/val/source-processing/records` returns `200` with `records: []` after cleanup.
- `/api/val/documents?q=MOU&limit=3` returns `200` unauthenticated with an empty public-test result, expected until the authenticated Gmail flow reprocesses the Aric email.
- `/api/val/source-processing/surface-registrations?surface=project_managers&status=visible&reviewStatus=pending&limit=5` returns `200` with `surfaceRegistrations: []`.
- Live `hearth-prototype.js` contains `project_scoped_cowork_packet`, `project_owner_packet`, `project-owner-control`, source-processing surface registration fetch, `projectSuggestionReceiptLine`, `whatValDidReceipt`, and `VAL handled:`.
- Live `hearth-prototype.css` contains `.project-suggestion-receipt`.
- Live `hearth-prototype.html/js/css` contain `data-document-intake-scan`, `scanDocumentIntakeFromGmail`, `documentIntakeStatusLine`, and `.document-library-controls`.
- Live POST `/api/val/source-processing/relationship-document-email` without real auth returns `Authentication required`.
- Live `/api/val/source-processing/records?limit=5` returns `{ ok: true, count: 0 }`, expected after cleanup.
- Live `hearth-prototype.html` serves `hearth-prototype.css?v=cowork-open-20260712` and `hearth-prototype.js?v=cowork-open-20260712`.
- Production browser smoke confirms main Co-Work and Project Managers drawer Co-Work open at `z-index:1800` above drawer `z-index:1300`.

Remaining validation / next work:

- Re-run browser-visible/authenticated validation against the Aric MOU Gmail attachment, checking Project Managers suggestion, Documents drawer row, and the visible `VAL handled:` receipt line.
- Continue into broader source types or the next approved platform slice.

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
Live baseline commit: c820004
Railway deployment: f290ec10-a88c-45e7-9c18-5c64a3652dee
Working branch: codex/stewardship-person-packets
Latest live code promotion commit: c820004
```

If production does not match the current live baseline, stop before changing code.

If the branch is not at or after `c820004`, pull the branch before continuing.

## Current Next Step

Do not ask the old Co-Work V1 first question. The user approved the current sequencing:

1. Keep stale demo/contact residue for the later VAL drawer/onboarding pass.
2. Continue the source-processing spine.
3. The first source-processing receipt target, "What VAL did from this email/document," is implemented and live.
4. Google Drive shared docs/links now count as document evidence in the same relationship-document path.
5. Aric/Frisson MOU fixes are live: project-owner matching, Documents-from-source-processing, source-only preservation for unmatched document senders, and Documents `Scan Gmail` intake diagnostics.
6. Next: ask the user to click Documents `Scan Gmail`, then read the status line and verify whether the MOU appears in Documents / Project Managers.
7. Then broaden the source-processing spine to the next source type, likely transcripts/calendar events, while preserving the same no-action/action receipt pattern.

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
