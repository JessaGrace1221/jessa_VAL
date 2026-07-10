# Home and Transcripts Damage Map

Date: 2026-07-10

Baseline inspected: `69ea4cf Fix Home card clicks and balance frost surfaces`

Current deployed branch inspected: `b65c2e9 Clarify Lead Intelligence preview gate`

## Summary

The main regression is not a styling accident. The Home surface was intentionally rewired in commit `12e7ae1 Keep Hearth home live and connect Krisp MCP` so all three Home rooms point toward Executive Inbox. That conflicts with the Home product specs, which define:

- Velocity: what changed.
- Alignment: what deserves attention.
- Leverage: what has already been prepared.

The transcript drawer rename is separate. Commit `8cd80fe Rename transcript drawer surface` changed labels from `Timeline & Tasks` to `Transcripts`. That may be directionally right if the drawer is now transcript-first, but the current surface must still preserve calendar, transcript, tasks, drafts, relationships, projects, and review status as the evidence spine.

## Clearly Wrong

### Home Cards Became Executive Inbox Links

Files:

- `hearth-prototype.html`
- `hearth-prototype.js`
- `test/hearthLeadIntelligence.test.js`

Symptoms:

- Velocity card title became `Executive Inbox`.
- Alignment card title became `Judgment only`.
- Leverage card title became `Connected evidence`.
- All three room actions say `Open Executive Inbox`.
- `forceExecutiveInboxHome = true` forces Home into this state.

Why wrong:

- `docs/VAL_HOMEPAGE_WITNESS_SYSTEM.md` defines Home as Velocity, Alignment, Leverage.
- Executive Inbox is a supporting drawer, not the identity of all Home cards.

Repair:

- Remove or disable `forceExecutiveInboxHome`.
- Restore Home card language around the three executive questions.
- Keep the live-data safety rule: no fake demo stories should appear as if they are live.
- If live data is missing, each card should show an honest empty/quiet state for its own question, not point every card at Executive Inbox.

### Prototype Briefing Was Flattened Into Executive Inbox

File:

- `hearth-prototype.js`
- `test/hearthLeadIntelligence.test.js`

Symptoms:

- `prototypeBriefing()` changed `whatChanged`, `highestLeverageMove`, and `readyForYou` into Executive Inbox placeholders.
- Ready For You demo drafts were removed and replaced with a drawer review placeholder.

Why wrong:

- Prototype data can be visibly demo/mock, but it still needs to exercise the correct product shape.
- Leverage specifically needs prepared work/drafts so it can prove the Ready For You path.

Repair:

- Restore prototype data to exercise the three Home engines.
- Make demo/mock status explicit if needed.
- Do not let demo data render as live admitted data.
- Update tests that currently assert the bad fallback:
  - `Executive Inbox is the live review surface`
  - `Open Executive Inbox for live judgment`
  - absence of prepared draft examples such as `Frisson introduction draft`

## Probably Keep

### Executive Inbox Drawer Improvements

Files:

- `hearth-prototype.html`
- `hearth-prototype.css`
- `hearth-prototype.js`
- `server.js`

Likely keep:

- Rule learning bar and saved rules modal.
- Thread discussion with VAL.
- Relationship/project side context.
- Rule suggestions with accept/dismiss.
- Scan windows for 30/90 days.
- Live Gmail-classified empty state.

Reason:

- These directly responded to Executive Inbox feedback and do not need to own Home.

### Lead Intelligence Three-Column Drawer

Files:

- `hearth-prototype.html`
- `hearth-prototype.css`
- `hearth-prototype.js`
- `test/hearthLeadIntelligence.test.js`

Likely keep:

- Immediate three-column board.
- Two scraper buttons plus `Train this scraper`.
- Clear `Live preview - not imported` copy.
- Confirm/Dedupe as approval/import gate.

Reason:

- This is unrelated to Home damage and was later fixed to clarify live preview vs import.

### Krisp MCP Service Integration

Files:

- `services/krispMcpService.js`
- `server.js`
- `package.json`
- `package-lock.json`
- `test/krispMcpService.test.js`

Likely keep, but do not let it rewrite Home:

- Krisp MCP service code.
- Server routes and tests.

Reason:

- The integration can support transcripts, but it should feed evidence and prepared work. It should not turn Leverage into `Connected evidence`.

## Product Decision Made

### `Timeline & Tasks` vs `Transcripts`

Files:

- `hearth-prototype.html`
- `hearth-prototype.js`
- `test/hearthLeadIntelligence.test.js`

Current change:

- Drawer label changed from `Timeline & Tasks` to `Transcripts`.
- Internal code still mostly uses `timeline*` names.

Decision:

- The user-facing drawer should be called `Transcripts`.
- Internal `timeline*` code names can stay until a deeper refactor is worth the risk.

Recommended repair:

- Keep the user-facing label as `Transcripts`, but the drawer still needs to show:
  - source transcript,
  - proposed notes,
  - proposed tasks,
  - linked relationships,
  - linked projects,
  - prepared drafts,
  - review status.
- Otherwise restore `Timeline & Tasks` until the transcript-first design is fully rebuilt.

## Repair Order

1. Restore Home shape first.
2. Preserve Executive Inbox drawer work while removing its ownership of Home.
3. Keep transcript drawer named `Transcripts` and rebuild the page around the evidence-spine contract.
4. Re-run focused tests.
5. Deploy only after Home and transcript surface are verified from the browser.

## Commits To Inspect

- `12e7ae1 Keep Hearth home live and connect Krisp MCP`: primary Home regression.
- `8cd80fe Rename transcript drawer surface`: transcript label and copy change.
- `b0cc050` through `eead5a6` and `b688edc`: Executive Inbox changes, mostly keep.
- `655b6a2`, `236516f`, `b65c2e9`: Lead Intelligence changes, mostly keep.
