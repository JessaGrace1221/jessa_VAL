# VAL Live Promotion Checklist - 2026-07-12

Purpose: promote the handoff-approved Project Managers / source-processing slice as one cohesive live release.

Update: after this promotion, a focused Co-Work open-timing and drawer-layering hotfix, the first source-processing "What VAL did" receipt slice, Google Drive share/link document evidence handling, the Aric/Frisson MOU validation fixes, source-only document preservation for unmatched senders, and a Documents Gmail intake scan were also promoted. The current live product truth is now deployment `f290ec10-a88c-45e7-9c18-5c64a3652dee` from commit `c820004 Add Documents Gmail intake scan`.

This is a deployment-readiness checklist, not a new product spec. `docs/CODEX_HANDOFF.md` remains the source handoff.

## Current Live Truth Check

- Production URL: `https://jessaval-production.up.railway.app`
- Live root check: `200`
- Live `/api/config/status`: `status = VAL Proxy OK`
- Live Railway deployment: `f290ec10-a88c-45e7-9c18-5c64a3652dee`
- Live branch commit: `c820004`
- Live `hearth-prototype.js`: contains Project Managers/source-processing markers from the promoted slice, the immediate Co-Work open path, and receipt markers `projectSuggestionReceiptLine`, `whatValDidReceipt`, and `VAL handled:`.
- Live `hearth-prototype.css`: renders Co-Work above open drawers at `z-index:1800` and includes `.project-suggestion-receipt`.
- Live `/api/val/source-processing/records`: `200`, with `records: []` after cleanup.
- Live `/api/val/source-processing/surface-registrations?surface=project_managers&status=visible&reviewStatus=pending&limit=5`: `200`, with `surfaceRegistrations: []`.
- Live unauthenticated POST `/api/val/source-processing/relationship-document-email`: `Authentication required`.

Conclusion: the handoff slice is now live. The source-processing read surface exists, backend-only source-processing mutation is blocked in public Hearth test mode, the first shared "What VAL did" receipt path is deployed, Google Drive share/link evidence is included in relationship-document intake, Aric/Frisson-style project-owner document intake is supported, unmatched document senders are preserved as source-only evidence instead of silently skipped, and the Documents drawer can run the Gmail intake scan directly.

## Cohesion Rule

Deploy the Project Managers slice as one unit. Do not split the source-processing spine, review updates, pins, Hearth UI, owner reassignment, Co-Work hooks, and live email/document intake into separate partial releases.

## Handoff Promises To Promote

| Handoff promise | Local status | Evidence | Live gate |
| --- | --- | --- | --- |
| Source-processing tables, service, and routes | Implemented | `services/valSourceProcessing*`, `test/valSourceProcessing.test.js` | `/api/val/source-processing/records` exists live and is auth-protected or returns records when authenticated |
| Relationship-sent documents can create suggested-project review updates | Implemented | `processRelationshipDocumentEmail`, review update tests | Authenticated source-processing request creates a pending suggestion without external action |
| Suggested projects register to Project Managers and Leverage / Ready For You | Implemented | surface registration tests | Project Managers lane and Leverage both see the same pending suggestion |
| Project Managers top suggestion lane is subtle and hidden when empty | Implemented | Hearth JS/CSS tests and local served asset smoke | Browser-visible live check |
| Yes/no review actions are wired | Implemented | `valReviewUpdates` and Hearth tests | Approve creates project; reject removes pending suggestion |
| Approval creates one owner and a color-named Project Manager | Implemented | `test/valSourceProcessing.test.js`, `test/hearthLeadIntelligence.test.js` | Project page shows one owner and assigned color cue |
| Pending-only filtering prevents old suggestions resurfacing | Implemented | surface registration pending test | Approved/rejected suggestions do not reappear live |
| Put a Pin in It reminders reopen in Project Managers and Home Alignment | Implemented | `test/valProjectPins.test.js` | Due pin appears as a newly reopened loop; handled receipt clears only the reminder |
| Scoped Project Managers Co-Work locks project/action context | Implemented | Hearth JS tests and local served asset smoke | Browser-visible live Co-Work preflight and context lock |
| Assigned color-named Project Manager appears in header and packet | Implemented | Hearth JS tests | Project Manager page header shows subtle color assignee |
| Owner reassignment supports existing or new relationship owner | Implemented | Hearth JS tests and protected route smoke | Owner metadata persists; link receipt is local only |
| Live email intelligence/backfill route admitted relationship document attachments into source-processing | Implemented | `server.js`, `test/valSourceProcessing.test.js`, `test/intelligenceBackfill.test.js` | Authenticated connected email validation or controlled source-processing request proves path |
| Shared "What VAL did" receipts follow source records into review/work surfaces | Implemented | `services/valSourceProcessing.js`, `hearth-prototype.js`, `test/valSourceProcessing.test.js`, `test/hearthLeadIntelligence.test.js` | Project Managers suggestion row can show `VAL handled:` from the shared receipt |
| Google Drive shares/Docs links count as document evidence | Implemented | `server.js`, `test/valSourceProcessing.test.js` | Authenticated email validation sees Drive share/link evidence route through the same source-processing path |
| Source-processing documents appear in Documents | Implemented | `services/valDocuments.js`, `test/valDocuments.test.js` | Aric MOU attachment appears in Documents after authenticated Gmail refresh |
| Existing project owners can admit document-email senders | Implemented | `server.js`, `test/valSourceProcessing.test.js` | Aric attached to Frisson can qualify the MOU email for project suggestion processing |
| Unmatched document senders are preserved as source-only evidence | Implemented | `server.js`, `services/valSourceProcessing.js`, `test/valSourceProcessing.test.js` | If relationship admission misses Aric, the MOU still appears in Documents with no Project Managers suggestion |
| Documents can trigger document-intake scan directly | Implemented | `hearth-prototype.html/js/css`, `test/hearthLeadIntelligence.test.js` | Click Documents `Scan Gmail`, read document-email/source-record/suggestion/source-only counts, and verify the MOU row |

## Live Promotion Result

- Committed and pushed `59d62dd Add Project Managers source processing slice`.
- Deployed Railway deployment `2e617aba-f1d0-4c41-8735-67dbba77ae21`.
- Production verification exposed that public Hearth test mode allowed backend-only source-processing POST.
- Committed and pushed `a731181 Guard source processing public test writes`.
- Deployed Railway deployment `7b561aab-dace-4179-b74d-f2afd4fe38ad`.
- Verified live source-processing POST now returns `Authentication required`.
- Deleted the one no-action source-processing smoke-test record created during validation.
- Committed and pushed `5aecdde Fix Co-Work open timing and drawer layering`.
- Deployed Railway deployment `dcaeec98-f345-4496-8b2c-23e46b6a6b1e`.
- Verified production main Co-Work and Project Managers drawer Co-Work open immediately at `z-index:1800` above drawer `z-index:1300`.
- Committed and pushed `486d8d5 Sync handoff docs to Co-Work live baseline`.
- Committed and pushed `fb8a7bb Add source-processing what VAL did receipts`.
- Deployed Railway deployment `bad2fd11-adbf-455a-99a0-a92840397af0`.
- Verified live JS/CSS receipt markers, live auth protection for source-processing POST, and live source-processing records route health with empty records after cleanup.
- Committed and pushed `e98449a Treat Google Drive shares as document evidence`.
- Deployed Railway deployment `e94868f0-555c-428a-9554-c78832f9a52e`.
- Verified production health, source-processing records route health, and unauthenticated mutation protection after deploy.
- Committed and pushed `8c058b2 Show source-processing documents in Documents drawer`.
- Deployed Railway deployment `b3cb3acc-95a3-46b8-bb3b-3554d070c10f`.
- Committed and pushed `be66920 Recognize project owners in document email intake`.
- Deployed Railway deployment `53b59259-820a-4188-b463-9dfcbf4edbd7`.
- Verified production health after deploy. Authenticated browser re-run is required to prove the Aric MOU row and project suggestion in the user's session.
- Committed and pushed `13c8943 Preserve document evidence for unmatched senders`.
- Deployed Railway deployment `3b79543b-0717-4c78-8d1b-6b1fccea3ff6`.
- Verified production health, source-processing records route health, and unauthenticated Documents `MOU` query behavior after deploy. Authenticated browser re-run is required to prove the Aric MOU row in the user's session.
- Committed and pushed `c820004 Add Documents Gmail intake scan`.
- Deployed Railway deployment `f290ec10-a88c-45e7-9c18-5c64a3652dee`.
- Verified production health and live `hearth-prototype.html/js/css` markers for `data-document-intake-scan`, `scanDocumentIntakeFromGmail`, `documentIntakeStatusLine`, and `.document-library-controls`.

## Verification Already Run Locally

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

Local runtime smoke:

```text
GET http://127.0.0.1:3000/ -> 200
POST /api/val/source-processing/relationship-document-email without auth -> Authentication required
POST /api/relationships/create without auth -> Authentication required
served JS includes projectSuggestionReceiptLine / whatValDidReceipt / VAL handled:
served CSS includes .project-suggestion-receipt
```

Full-suite note:

```text
node --test test/*.test.js
363 passing / 368 total
```

The five failures are unrelated existing contracts in:

- `test/contextualChat.test.js`
- `test/executiveBriefing.test.js`
- `test/valTranscriptIntelligence.test.js`

Do not block this promotion on those unless a later diff touches the failing areas.

## Must Pass Before Push

- Focused tests pass.
- `git diff --check` passes.
- Local server starts cleanly.
- Local served Hearth bundle includes:
  - `project_scoped_cowork_packet`
  - `project_owner_packet`
  - `project-owner-control`
  - source-processing surface registration fetch
- No destructive or external provider action is performed during validation.

## Must Pass After Deploy

- Live app returns `200`.
- Live `/api/config/status` returns `VAL Proxy OK`.
- Live Hearth bundle includes Project Managers/source-processing markers.
- Live Hearth bundle includes receipt markers `projectSuggestionReceiptLine`, `whatValDidReceipt`, and `VAL handled:`.
- Live Hearth CSS includes `.project-suggestion-receipt`.
- Live `/api/val/source-processing/records` no longer returns `404`.
- Project Managers drawer is named `Project Managers`.
- Subtle top suggestion lane renders when pending suggestions exist and is hidden when empty.
- `Put a pin in it` due reminders can surface in Project Managers and Home Alignment.
- Owner reassignment persists one owner only.
- Co-Work opens with locked project/action context.
- Main and drawer-scoped Co-Work open immediately before packet hydration and do not render behind drawers.

## Known Non-Blockers For This Promotion

- Broader source types beyond relationship-sent email documents are future work.
- Authenticated connected-email validation of a real suggestion plus visible receipt line is still future work.
- The Aric MOU Gmail attachment and a real Drive share/link still need browser-visible authenticated re-validation after the latest deployment.
- Use Documents `Scan Gmail` for that validation; a hard refresh alone is not sufficient proof that document intake re-ran.
- If the MOU appears in Documents but not Project Managers, inspect saved relationship admission metadata before changing UI.
- Full standalone Co-Work V1 workspace redesign is documented but not part of this release.
- The full test suite has five unrelated pre-existing contract failures.
