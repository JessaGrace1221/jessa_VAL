# VAL Live Promotion Checklist - 2026-07-12

Purpose: promote the handoff-approved Project Managers / source-processing slice as one cohesive live release.

Update: after this promotion, a focused Co-Work open-timing and drawer-layering hotfix was also promoted. The current live truth is now deployment `dcaeec98-f345-4496-8b2c-23e46b6a6b1e` from commit `5aecdde Fix Co-Work open timing and drawer layering`.

This is a deployment-readiness checklist, not a new product spec. `docs/CODEX_HANDOFF.md` remains the source handoff.

## Current Live Truth Check

- Production URL: `https://jessaval-production.up.railway.app`
- Live root check: `200`
- Live `/api/config/status`: `status = VAL Proxy OK`
- Live Railway deployment: `dcaeec98-f345-4496-8b2c-23e46b6a6b1e`
- Live branch commit: `5aecdde`
- Live `hearth-prototype.js`: contains Project Managers/source-processing markers from the promoted slice and the immediate Co-Work open path.
- Live `hearth-prototype.css`: renders Co-Work above open drawers at `z-index:1800`.
- Live `/api/val/source-processing/records`: `200`, with `records: []` after cleanup.
- Live `/api/val/source-processing/surface-registrations?surface=project_managers&status=visible&reviewStatus=pending&limit=5`: `200`, with `surfaceRegistrations: []`.
- Live unauthenticated POST `/api/val/source-processing/relationship-document-email`: `Authentication required`.

Conclusion: the handoff slice is now live. The source-processing read surface exists, and backend-only source-processing mutation is blocked in public Hearth test mode.

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

## Verification Already Run Locally

```text
node --check services/valSourceProcessingSchema.js services/valSourceProcessing.js services/valSourceProcessingRoutes.js services/valProjectPinsSchema.js services/valProjectPins.js services/valProjectPinsRoutes.js services/valReviewUpdates.js hearth-prototype.js server.js test/valSourceProcessing.test.js test/intelligenceBackfill.test.js
node --test --test-reporter=dot test/valProjectPins.test.js test/valSourceProcessing.test.js test/valReviewUpdates.test.js test/valReadyForYou.test.js test/hearthLeadIntelligence.test.js test/intelligenceBackfill.test.js
git diff --check
```

Local runtime smoke:

```text
GET http://127.0.0.1:3000/ -> 200
POST /api/val/source-processing/relationship-document-email without auth -> Authentication required
POST /api/relationships/create without auth -> Authentication required
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
- Live `/api/val/source-processing/records` no longer returns `404`.
- Project Managers drawer is named `Project Managers`.
- Subtle top suggestion lane renders when pending suggestions exist and is hidden when empty.
- `Put a pin in it` due reminders can surface in Project Managers and Home Alignment.
- Owner reassignment persists one owner only.
- Co-Work opens with locked project/action context.
- Main and drawer-scoped Co-Work open immediately before packet hydration and do not render behind drawers.

## Known Non-Blockers For This Promotion

- Broader source types beyond relationship-sent email documents are future work.
- Full standalone Co-Work V1 workspace redesign is documented but not part of this release.
- The full test suite has five unrelated pre-existing contract failures.
