# VAL Clean Baseline Reset Manifest

**Status:** active reset contract  
**Created:** 2026-07-13  
**Purpose:** establish one clean implementation path for the drawers being rebuilt without losing VAL's proven onboarding intelligence or lead-scraper behavior.

## Decision

The following existing drawer implementations are **not** the future source of truth. Their user interfaces, drawer state, fallback rendering, and legacy route assumptions are to be rebuilt through one canonical path each:

1. Commitments
2. Documents
3. Lead Intelligence
4. VAL
5. Executive Inbox

Their existing code remains available only as migration evidence until its replacement has passed the acceptance contract. It must not be copied forward merely because it already exists.

## Protected Assets

These are functional assets, not old drawer designs. They must survive the reset unchanged in behavior unless an explicit migration is approved.

### VAL onboarding and Witnessing

| Asset | Canonical source | Protection rule |
|---|---|---|
| Witnessing principles and two-layer prompting | `docs/VAL_WITNESSING_CONSTITUTION.md` | Preserve question order, safety boundaries, and the distinction between witnessing and durable memory. |
| Witnessing project fields and import prompt | `docs/VAL_WITNESSING_SESSION_FIELDS_AND_PROMPTS.md` | Preserve the exact fields that feed Project Managers and the other Round Tables. |
| Teach VAL prompt suite | `docs/VAL_TEACH_VAL_PROMPTS.md` | Preserve extraction, import, memory compilation, source insight, correction, review, and promotion contracts. |
| Onboarding implementation checks | `test/teachValOnboardingMemory.test.js` | Keep green before moving any onboarding behavior. |

The new VAL drawer may be designed from zero. It must call and present the protected onboarding system without replacing its prompts with a simplified chat flow.

### Lead scrapers

| Workflow | Protected contract | Current routes / behavior |
|---|---|---|
| GOALL employer leads | Preview before approval, CRM duplicate filtering, approved-only import, existing GOALL tags and destination fields | `/api/val/leads/discover-preview`, `/api/val/leads/import-approved` |
| GOALL strategic partners | Separate partner workflow, scoring, preview, hold/approve, protected strategic-partner destination | `/api/val/partners/discover-preview`, `/api/val/partners/import-approved` |
| Frisson organizations | Separate organization scraper, preview, approval, Frisson organization pipeline and custom-field mapping | `/api/frisson/organizations/discover-preview`, `/api/frisson/organizations/import-approved` |
| Frisson partners | Separate partner scraper, preview, approval, Frisson partner pipeline and custom-field mapping | `/api/frisson/partners/discover-preview`, `/api/frisson/partners/import-approved` |
| Westwood / Limitless leads | Westwood profile, Idaho/private-business criteria, existing enrichment and CRM mapping | Generic VAL lead routes with `leadProfile: "westwood"`; inspect for a second distinct workflow before any deletion. |

The backend behavior and data contracts above remain protected while Lead Intelligence is rebuilt. The prior Lead Intelligence drawer is not protected.

Required regression gates:

```text
node --test test/leadScraperRegression.test.js
node --test test/partnerScraperRegression.test.js
node --test test/frissonScraperRegression.test.js
node --test test/leadContactValidation.test.js
```

## Canonical Architecture

Every rebuilt drawer must have exactly one path:

```text
incoming source -> packet -> Round Table -> persisted approved state -> drawer -> user-approved action
```

The governing rule is:

> Round Table decides. Packet stores. Custom fields persist. Drawer displays. User approves action.

A drawer may not independently classify, invent, cache, transform, or re-ingest its source. A background job may not render a competing version of a drawer's data.

## Rebuild Scope

| Drawer | Replacement objective | Explicitly do not reuse |
|---|---|---|
| Commitments | One clear list of active promises, ownership, due date, source, and next action. | Old task/draft/status paths that produce competing records. |
| Documents | One document receipt linked to its source, relationship, project, and source packet. | Drafts masquerading as documents, Gmail scan fallbacks, and separate drawer-only document stores. |
| Lead Intelligence | One launcher for the protected scraper contracts, with configure -> preview -> approve/hold -> import state. | Existing mock, demo, or duplicate lead-drawer behavior. |
| VAL | One calm home for Witnessing, Teach VAL, reviewed memory, and approved recommendations. | Generic or unscoped chat behavior and duplicate onboarding entry points. |
| Executive Inbox | One admitted-conversation surface with readable source email, one judgment packet, one editable prepared action, and explicit approval. | Old inbox rules screens, duplicate classifiers, and generic email intelligence views. |

## Out of Scope: Preserve Without Refactoring

The following are not reset by this manifest and must not be deleted or silently rewritten during this work:

- Project Managers and its project packets
- Transcripts and the exact Krisp source-receipt contract
- Existing production data, evidence, external integrations, and Railway production configuration
- Relationship and calendar functionality, unless a required canonical packet boundary is identified
- The approved white-glass Hearth visual system

## Cleanup Method

No deletion is allowed during discovery. The reset proceeds in four controlled stages:

1. **Inventory:** list each old UI entry point, API, service, job, cache, prompt, packet, table, and test associated with the five reset drawers.
2. **Replace:** build one canonical route and one data flow per drawer, with regression tests and a migration receipt.
3. **Quarantine:** remove old UI entry points and legacy exports from production paths. Label their code `deprecated` and keep it reachable only by a documented audit reference.
4. **Delete:** remove quarantined code only after production verification proves no live path, scheduled job, test, external connector, or persisted data migration needs it.

## Definition of Clean

The clean baseline is ready only when every reset drawer has:

- one user-visible entry point;
- one canonical API contract;
- one packet schema and one owning Round Table;
- one persistence path;
- no initial stale render followed by a different rehydrated render;
- no hidden fallback that performs another classification or ingestion pass;
- explicit loading, empty, error, approval, and success states;
- a test proving legacy routes are not invoked;
- a visible receipt showing what source and packet produced the result.

## Immediate Next Deliverable

Create a source-of-truth matrix for the five reset drawers. For each row, identify every current UI trigger, API, service, persistence location, scheduled job, prompt, and test. Mark each `replace`, `quarantine`, or `protected` before any interface is rebuilt or legacy path is removed.

## Source-of-Truth Matrix: Audit 1

This is the initial route and ownership map. It is intentionally specific about competing paths already found. A later audit will add every scheduled job and every persistence migration before deletion begins.

| Drawer | Keep as protected source | Current competing paths to quarantine | New canonical boundary |
|---|---|---|---|
| Commitments | Existing source evidence, task records, relationship/project links, and user-approved status history. | `hearth-prototype.js` commitment drawer, `dashboard.html?view=commitments`, and `services/valCommitments.js` heuristic aggregation must not remain coequal implementations. | `Commitment Packet` -> Commitment Round Table -> one persisted commitment record -> `/api/val/commitments` -> one drawer. |
| Documents | The actual source evidence: email attachments, Google Drive/Docs metadata, project uploads, transcript-prepared artifacts, source-processing receipts, and approved VAL-created artifacts. Calendar invites remain excluded. | Browser `localStorage` key `val_docs_v1`, direct Gmail scan presentation, Ready For You document copies, memory/draft/transcript aggregation, and drawer-only project assignment logic. | `Document Receipt` -> Document Round Table -> one document evidence record with source, relationship, project, and packet references -> `/api/val/documents` -> one drawer. |
| Lead Intelligence | All five scraper contracts listed above, their CRM mappings, and their focused regression tests. | Hearth mock/demo lead states, legacy dashboard lead pages, and any UI that bypasses configure -> preview -> approve/hold -> import. | `Lead Intelligence Packet` -> scraper contract selector -> protected preview endpoint -> user selection -> protected import endpoint -> one receipt. |
| VAL | Witnessing and Teach VAL prompt documents; onboarding routes; `teach_val_onboarding_sessions`, `teach_val_imports`, and reviewed memory records. | Multiple Hearth workspace launchers for Witnessing, onboarding, VAL OS, Teach VAL, connections, and generic Co-Work. None becomes the future primary path by default. | One VAL drawer with an explicit mode: Witnessing, Teach VAL, reviewed memory, or approved recommendation. Each mode calls the protected onboarding contract. |
| Executive Inbox | Canonical email source records: `email_messages`, `email_threads`, conversation identity, executive-contact suppression, classification records, and review-only drafts. | Older `/api/email/*` intelligence/rules/command/action routes, `val-executive.html`, and any drawer screen that applies its own classification or unreadable body fallback. | Email source -> Email Judgment Packet -> Executive Inbox Round Table -> `conversation_classifications` and review-only draft -> one admitted-conversation drawer. |

### Protected route families

The following route families are retained while their user interfaces are rebuilt:

```text
POST /api/val/leads/discover-preview
POST /api/val/leads/import-approved
POST /api/val/partners/discover-preview
POST /api/val/partners/import-approved
POST /api/frisson/organizations/discover-preview
POST /api/frisson/organizations/import-approved
POST /api/frisson/partners/discover-preview
POST /api/frisson/partners/import-approved

GET  /api/teach-val/onboarding
POST /api/teach-val/onboarding/start
POST /api/teach-val/onboarding/:id/voice-turn
POST /api/teach-val/onboarding/:id/commit
```

### First non-negotiable cleanup rule

The fresh drawers must not read browser-local drawer state, create mock data, or silently fall back to a second source when the canonical service is slow or unavailable. They show an honest loading, empty, or failure state instead. That is the specific protection against a page visibly changing through old layers before it reaches the current answer.
