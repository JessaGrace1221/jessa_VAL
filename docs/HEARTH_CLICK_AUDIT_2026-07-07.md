# Hearth Live Click Audit - 2026-07-07

Production URL: https://jessaval-production.up.railway.app/

Latest verified deployment: `10f1d1bd-49ae-4454-8ef8-02d4825bb35e`

Latest verified commit: `7dcc3bf`

## Summary

This audit focused on the trust-breaking paths Jessa flagged:

- Google was connected, but the Hearth right panel still showed demo calendar data.
- Alignment promised one email/risk on the card, then opened a mismatched workspace.
- Drawer clicks could leave the prior card workspace visible, making it unclear what opened.

I fixed and deployed all three classes of issue that were directly reproducible in code or live Chrome.

## Fixed

### Calendar Panel Uses Live Google Data

Status: fixed and live verified.

Where to click:

1. Open https://jessaval-production.up.railway.app/
2. Look at the right `Desk Companions` calendar card.
3. Click `Open full calendar`.

Expected/verified result:

- Right panel shows real Google event data, not demo `Acme proposal review`.
- Live verified first event: `8:30 AM Research GOALL linkedin`.
- Full calendar shows Google agenda items including `GOALL`, `Jessa Grace Zoom Val Update`, and later events.

Why it worked:

- Hearth now hydrates the right calendar panel from `/api/calendar/sidebar`.
- The panel rehydrates when the full calendar opens.

### Alignment Email Workspace No Longer Mismatches `RocketReach`

Status: fixed enough to prevent misleading output; remaining subject recovery noted below.

Where to click:

1. On Home, click `Review the decision` in the Alignment card.

Expected/verified result:

- The card now says `Email needing attention`, not `Review: RocketReach`.
- The workspace title also says `Email needing attention`.
- The action row is email-specific:
  - `Open email`
  - `Draft reply`
  - `Create task`
  - `Open Executive Inbox`
  - `Teach VAL`
- The repeated inline `Open email` links inside every paragraph are gone.

Why it failed before:

- The agency move was email-derived, but the Home normalizer preferred a relationship/person label over the email evidence title.
- Hearth then appended generic inline context portals, producing repeated `Open email` links and a workspace that felt non-actionable.

What changed:

- Backend evidence normalization now carries email subject/message/thread/source metadata when source evidence can be found.
- Evidence lookup now indexes evidence by row ID, source ID, Gmail message ID, and thread ID.
- Hearth email card titles now prefer the real email subject; if no subject is recoverable, Hearth uses neutral copy: `Email needing attention`.
- Email workspaces no longer append fallback inline context buttons to every paragraph.

Remaining risk:

- The current live Alignment item still does not expose the original DNC email subject to Hearth. I could not retrieve the signed-in `/api/executive-briefing` JSON from terminal because it correctly returns `401 Authentication required`, and Chrome does not expose readable auth cookies.
- The safe fix prevents the wrong label from appearing. The deeper follow-up is to repair the source agency move/evidence record so existing items include the actual subject, not just generic risk text.

### Drawer Navigation From An Open Card

Status: fixed and live verified.

Where to click:

1. Open Alignment with `Review the decision`.
2. Click `OPEN DRAWERS`.
3. Click `Relationships`.

Expected/verified result:

- The active card workspace closes.
- `#desk-workspace` becomes hidden.
- The drawer tray opens.
- `Relationships` opens the Relationship Brief.

Why it failed before:

- Individual drawer links called the workspace-hide helper, but the `OPEN DRAWERS` pull itself did not.
- From an open card state, the tray could become available while the old card stayed visually dominant.

What changed:

- `drawerPull` now calls `hideWorkspaceForDrawerNavigation()` before toggling the drawer tray.

## Live Click Results

### Home Shell

- `Why I am saying this today`: works. Opens/evidences reasoning without external action.
- `Fresh desk`: partially works but still needs polish. It cleared/changed visible room attendance state, but in live automation it could leave a card workspace visible. This should be made visually clearer.
- Mood controls: code path is local UI state only; no external action.

### Right Panel

- Calendar card: works with live Google event data.
- `Open full calendar`: works.
- Calendar agenda item: works as a selection surface; no external write.
- `Close calendar`: works.
- Co-Work with VAL: works; opens private workspace.
- Teach VAL: works; opens teaching workspace with review posture.
- LinkedIn widget: works; opens manual LinkedIn visibility workspace. It explicitly says publishing remains manual.

### Home Cards

- Velocity action: works, but one queue-item path opens a Co-Work workspace for the selected item instead of the main Velocity lens when a queue button is clicked. This is not unsafe, but it can feel surprising.
- Alignment action: fixed; now opens an email-action workspace without the wrong `RocketReach` title.
- Leverage action: works as a prepared-work workspace.

### Drawer Tray

Live verified left-to-right after the drawer fix:

- Relationships: opens Relationship Brief.
- Projects: opens Project Dossiers.
- Timeline & Tasks: opens Timeline & Tasks.
- Executive Inbox: opens Executive Inbox.
- Commitments: opens Commitments ledger.
- Documents: opens Documents.
- Lead Intelligence: opens Lead Intelligence.
- VAL: opens Witnessing Session / VAL drawer.

### Mutating Buttons Not Live-Clicked

I did not live-click buttons that would create or mutate production data unless the code path was explicitly internal and already covered by regression tests.

Not live-clicked in production:

- Send draft
- Import approved leads
- Mark complete
- Delegate
- Dismiss
- Create project
- Start Fresh in witnessing
- Save API key
- Upload file
- Open external LinkedIn post

Reason:

- These are real production operations or external-window actions. The audit rule says they must be approval-gated; the correct next step is a focused safe test harness or an explicit user-approved live test, not silent mutation while Jessa is away.

## Verification

Local verification:

- `node --check server.js`
- `node --check hearth-prototype.js`
- `node --test test/hearthLeadIntelligence.test.js`

Result:

- 37/37 Hearth tests passed after the fixes.

Live Chrome verification:

- Production calendar now shows real Google events.
- Alignment card now says `Email needing attention`.
- Alignment workspace has the correct email action buttons.
- Drawer tray opens correctly from an active card state.
- All eight drawer links open their expected drawer surfaces after the drawer fix.

## Follow-Up Recommendations

1. Repair existing email agency move data so the actual email subject, message ID, thread ID, and Gmail link are present on existing `highestLeverageMove` items.
2. Add a signed-in debug/admin endpoint or development-only inspector for the exact `/api/executive-briefing` payload so future audits do not rely on DOM inference.
3. Make `Fresh desk` visibly report what it cleared and guarantee it does not leave a workspace open unless that is intentional.
4. Add non-mutating test harnesses for send/import/create/mark-complete workflows so production can be audited without creating real artifacts.
