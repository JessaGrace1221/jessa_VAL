# Hearth Full Function Audit - 2026-07-07

## Scope

Audited Hearth as the actual VAL SaaS dashboard surface: Home cards, desk companions, calendar panel, drawer tray, drawer detail panels, source-action routing, and risky send/import boundaries.

Production deployment was updated and verified first:

- `99bd5bb` - staged Hearth send actions behind review packets.
- Railway deployment `73f5d5d1-ca86-47dc-898c-056dd0372abf` succeeded.

Chrome production note: the production Chrome session was at `/login?next=/dashboard`, so I did not reset or create a password token without Jessa's explicit approval. Live clicking was completed against the current local Hearth build in `VAL_DEMO_MODE=1`; production code and deployment were verified separately.

## Audit Rule Used

For every click, I checked:

1. Does the correct screen, drawer, card, or workspace open?
2. Does it preserve VAL's judgment-first tone?
3. Does it use relevant context where needed?
4. Does it avoid external action unless explicitly approved?
5. Does the user know what happened and what to do next?

## What Feeds Hearth

- Home presence and cards: `/api/executive-briefing`, `/api/val/ready-for-you/build`, `/api/val/ready-for-you`, email-derived homepage card evidence, and prepared-work artifacts.
- Calendar panel and meeting prep: `/api/calendar/sidebar` and `/api/val/calendar/meeting-prep`.
- Executive Inbox drawer: `/api/val/ready-for-you/build`, `/api/val/email/review-drafts`, `/api/val/email/generate-draft`, `/api/val/email/revise-draft`, and external-action send packets.
- Relationships drawer: `/api/relationships/index`, `/api/relationships/dossier`, `/api/projects/links`, relationship review updates, and document references.
- Projects drawer: `/api/projects/index`, `/api/projects/dossier`, `/api/projects/create`, `/api/projects/links`, project review updates, and project document references.
- Timeline & Tasks: `/api/val/context-debug`, transcript proposal review updates, and local meeting/task evidence.
- Commitments drawer: `/api/val/commitments`, draft-email, create-task, and status endpoints.
- Documents drawer: `/api/val/documents`, `/api/val/documents/reference`, `/api/val/ready-for-you/build`, and send packets.
- Lead Intelligence drawer: `/api/val/leads/discover-preview`, `/api/val/leads/import-approved`, `/api/val/partners/discover-preview`, and `/api/val/partners/import-approved`.
- VAL drawer: `/api/teach-val/onboarding`, `/api/val/os`, `/api/setup-health`, `/api/dev/openai-runtime`, `/auth/google`, and onboarding commit/reset endpoints.

## Click Results

Passed:

- Quiet, Protective, Completion, and Evening state buttons switch posture without external action.
- "Why I am saying this today" opens the evidence panel.
- Next meeting card opens meeting-prep workspace and states that no external action happened if prep cannot assemble cleanly.
- Open full calendar opens the calendar panel; close calendar closes it.
- Co-Work companion opens a Co-Work workspace with safe "nothing is sent or changed externally" framing.
- LinkedIn companion opens manual LinkedIn visibility workspace. Publishing remains manual.
- Teach VAL opens the teaching workspace and frames learning as reviewable.
- Velocity card opens a workspace tied to the same email/source context promised by the card.
- Alignment card now opens a matching email/context workspace instead of an unrelated relationship file.
- Leverage card opens prepared work, not relationship context.
- Relationships, Projects, Timeline & Tasks, Executive Inbox, Commitments, Documents, Lead Intelligence, and VAL drawer buttons all open the Hearth drawer system.
- Close all drawers closes the drawer tray.

Fixed during this audit:

- Documents drawer `Send` and Executive Inbox `Send draft` were using `/api/val/external-actions/email-send-now`. That made one drawer click too close to a real external send. I changed both to `/api/val/external-actions/email-send-packet`, with explicit copy: "Nothing was sent; use the external-action approval gate for final confirmation."
- Lead Intelligence drawer was opening every drawer detail at once because CSS used `.drawer-tray.source-open .source-detail`, and every drawer detail shared `.source-detail`. I narrowed it to `.drawer-tray.source-open #source-detail`, so only Lead Intelligence opens.

Remaining caution:

- Production Chrome testing was blocked by login state. I did not use the testing setup-link flow because it can create/reset a production password setup token. That needs Jessa's explicit approval or a fresh signed-in Chrome session.
- Lead Intelligence import remains intentionally mutating after preview approval. I did not click live imports; code confirms preview and import endpoints are separate and import stays disabled until preview choices exist.
- Commitments actions can create drafts/tasks or update status; I traced these rather than clicking live production mutations.
- Project creation and file upload were not executed live because they create records/files.

## Verification

- `node --check hearth-prototype.js`
- `node --check server.js`
- `node --test test/hearthLeadIntelligence.test.js`
- Chrome local Hearth click audit with screenshot verification.
- Railway deployment `ed960f98-9b05-47ed-9e10-81e4aad57745` on commit `33e01f5` succeeded with the Lead Intelligence drawer isolation fix.

## Source And Action Audit Pass

Additional audit rules checked live in Chrome against `https://jessaval-production.up.railway.app/`:

1. The information shown on a card must come from the same source opened by the card CTA.
2. CTAs must preserve the source and source-of-source context.
3. Workspaces should show buttons only for the suggested actions that apply to that source.

Production test access:

- Temporary no-login Hearth test mode is ON through `VAL_PUBLIC_HEARTH_TEST_MODE=1`.
- Health check confirmed `publicHearthTestMode: true` and `demoMode: false`.
- Turn this off after live testing with `railway variables --set VAL_PUBLIC_HEARTH_TEST_MODE=0`.

Findings and fixes:

- Home queue entries were clickable buttons even though they were source evidence, not suggested actions. They also did not reliably open the source workspace in live Chrome. I converted them to non-clickable source rows with `data-home-room-source`, `data-source-type`, `data-source-id`, and `data-source-label`.
- The Leverage card was initially prioritizing broad prepared-work summaries over the concrete draft. I changed Leverage selection to prefer concrete actionable items, so the card now surfaces `Draft for colin@finserve360.com`.
- The Leverage workspace opened the right draft but lacked complete provenance. I added shared source-context lines so it shows `Home source`, `Source type`, `Source id`, and `Source-of-source`.
- Draft items with `sourceType: draft` were not getting prepared-work actions unless `preparedArtifactKind` was present. I changed action selection so draft sources get `Open prepared draft`, `Refine prepared work`, and `Approve prepared work`.
- Inline source portal buttons were appearing inside workspace copy, creating extra buttons beyond the suggested actions. I suppressed inline portals for briefing workspaces so the visible buttons are the actual action set.
- Static script cache keys were stale during production verification. I bumped the Hearth script query key with each deployed source/action change so Chrome loads the current behavior.

Live Chrome proof after deployment `056d7028-986d-4f3c-be95-64840ab37c44` on commit `448a2d4`:

- The production script loaded as `hearth-prototype.js?v=source-action-audit-actions-20260707`.
- Old queue action buttons count: `0`.
- Source rows render as `DIV` rows, including the Leverage row with `sourceType: draft`, `sourceId: draft_email_cf62948eec809b19ba2afc4b`, and text `Draft for colin@finserve360.com`.
- Clicking `Review what's ready` opened `Leverage decision workspace`.
- Workspace contained `Home source`, `Source type`, `Source id`, and `Source-of-source`.
- Workspace had no generic Co-Work input.
- Visible workspace action buttons were: `Open prepared draft`, `Refine prepared work`, and `Approve prepared work` plus the standard `Close card` control.

Verification for this pass:

- `node --check hearth-prototype.js`
- `node --test test/hearthLeadIntelligence.test.js`
- Railway deployments verified successful:
  - `45d88806-7b85-4141-b099-ce896df63630` for temporary public Hearth test mode.
  - `046f63fd-04b2-42cc-8182-6910378a446a` for source-scoped Home actions.
  - `64afb436-0f3b-4822-901a-3fdafb259bc8` for reliable queue click handling attempt.
  - `66e2b8a7-23f1-4914-85de-37fc82e931a8` for actionable Leverage prioritization.
  - `7f926add-1723-4d2b-9f6b-7a68e72bfc91` for shared workspace-shell routing.
  - `5869d56a-a294-4919-af45-7990c62990a8` for script cache refresh.
  - `19417007-27f8-41e0-96b8-8e98368f5eeb` for explicit source item click contract.
  - `8b6579d5-baac-4ced-bb38-e6c217d90eb3` for source-only queue rows.
  - `056d7028-986d-4f3c-be95-64840ab37c44` for suggested-action-only source workspaces.
