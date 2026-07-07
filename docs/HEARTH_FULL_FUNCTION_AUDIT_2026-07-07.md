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
