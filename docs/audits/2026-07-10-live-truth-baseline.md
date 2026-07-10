# July 10 Live Truth Baseline

Timestamp: 2026-07-10 18:16 EDT

## Declaration

The current live Railway deployment is THE TRUTH.

This is the hard baseline. Anything waiting for deployment, living in another worktree, sitting uncommitted, or preserved from an older chat is trash unless the user explicitly re-approves it.

## Baseline Identity

- Production URL: `https://jessaval-production.up.railway.app`
- Branch: `codex/executive-inbox-only`
- Commit: `dbc5d579c2549cc3353daca007bc7944741220c0`
- Commit message: `Simplify Stewardship network view`
- Railway project: `a0402328-e877-406d-8f89-32bd6acdfd19`
- Railway service: `df0839e1-880b-4aa6-8def-56170f4cc980`
- Railway environment: `production`

## Recovery Meaning

This baseline was created after a regression recovery day.

The recovery standard is not merely "the app works." The standard is:

- calm executive surface
- frosted white drawers
- no muddy brown regression
- no fake/demo data presented as real
- no diagnostic screens in user-facing drawers
- no behind-the-scenes Round Table or packet language on the executive surface
- no generic AI filler
- no resurrected stale UI

## Approved Drawer Stance

### Home

Home preserves:

- Velocity
- Alignment
- Leverage

Home is not a dashboard, inbox, metrics board, or prototype-state playground.

### Transcripts

Transcripts preserves the Meeting Notes workbench.

The user-facing drawer should show transcript conversations, source action items, meeting overviews, decisions, people, projects, and selected transcript detail.

It must not return to diagnostic workflow cards.

### Executive Inbox

Executive Inbox preserves real connected email judgment only.

Read/replied-to emails can be used as context elsewhere in VAL but do not belong in the active Executive Inbox queue.

### Stewardship

Stewardship is the approved drawer name.

The visible relationship/person card is simplified to:

1. Who this person is and what they do.
2. Who needs this person because this person has what they need.
3. Who this person should meet because those people have what this person needs.

The visible executive question is:

```text
Who needs to meet whom, and why?
```

Do not restore:

- `What VAL wants you to remember`
- `Executive Judgment`
- `Collaboration`
- `Story`
- `Temperature Review`
- raw observer language
- raw packet language
- raw round-table language

### Projects

Projects remain actionable dossiers grounded in project intake, source review, SOP/operating context, linked people, linked transcripts, linked documents, and the next narrow move.

### Lead Intelligence

Lead Intelligence remains the three-level scraper board:

- Level 1 Discovery
- Level 2 Decision Maker
- Level 3 Confirm / Dedupe

Controls stay simple:

- run organization scraper
- run partner scraper
- train this scraper

## Product Constitution Hook

This sentence must remain true across Stewardship and related surfaces:

```text
Your network is one of your greatest assets. Stewardship is how you care for it.
```

VAL should create value, strengthen relationships, prepare meaningful follow-ups, and connect people who can genuinely help one another.

## Architecture Hook

This pattern applies broadly:

```text
Round Table decides.
Packet stores.
Custom fields persist.
Drawer displays.
User approves action.
```

The UI shows the distilled executive value, not the machinery.

## Verification At Baseline

Focused checks passed:

```bash
node --check hearth-prototype.js
node --check services/valRelationshipDossier.js
node --test test/hearthLeadIntelligence.test.js test/valRelationshipDossier.test.js
git diff --check
```

Result:

```text
62/62 tests passing
```

Live checks passed:

```bash
curl -fsSL https://jessaval-production.up.railway.app/hearth-prototype.html
curl -fsSL https://jessaval-production.up.railway.app/hearth-prototype.js
```

Confirmed live:

- `Who needs to meet whom, and why`
- `relationshipStewardshipNetwork`
- `peopleWhoNeedThem`
- `peopleTheyShouldMeet`

Confirmed absent from live HTML:

- `What VAL wants you to remember`
- `<span>Executive Judgment</span>`
- `<span>Collaboration</span>`
- `<span>Story</span>`
- `data-relationship-temperature-review`

## Future Change Gate

Before any deployment:

1. Confirm the work descends from commit `dbc5d579c2549cc3353daca007bc7944741220c0`.
2. Confirm it does not restore older drawer content.
3. Confirm it does not rely on pending pre-baseline work.
4. Confirm the user explicitly approved any baseline change.
5. Run the focused checks.
6. Verify the live app after deploy.

If any step fails, do not deploy.
