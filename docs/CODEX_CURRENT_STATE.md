# Current State: Jessa VAL Live Truth Baseline

Updated: 2026-07-10 18:24 EDT

## Current Working State

The current live Railway app is the baseline.

Do not use older local state, queued changes, abandoned worktrees, or waiting deployments as source truth.

Baseline:

- Production URL: `https://jessaval-production.up.railway.app`
- Branch: `codex/executive-inbox-only`
- Commit: `dbc5d579c2549cc3353daca007bc7944741220c0`
- Commit message: `Simplify Stewardship network view`

Anything not deployed in this commit is discarded unless the user explicitly approves bringing it forward.

## Product Stance

The app has been recovered to the July 10 live standard:

- frosted-white Hearth drawers
- Home with Velocity, Alignment, and Leverage
- Transcripts as Meeting Notes, not diagnostic workflow cards
- Executive Inbox grounded in real connected email only
- Stewardship, not Relationships
- Stewardship focused on who should meet whom and why
- Projects as actionable dossiers
- Lead Intelligence as the three-level scraper board

## Absolute Guardrail

If a future change conflicts with `docs/CODEX_HANDOFF.md`, stop and read the handoff first.

The handoff wins over any stale code, stale docs, stale deployment, or old chat instruction.

## Current Verification

The baseline commit was deployed to Railway and live-verified.

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

Live verification confirmed:

- new Stewardship network map is present
- old visible Stewardship sections are absent

## Next Safe Move

Continue only from this live baseline.

For Stewardship, the next approved product direction is to make source-backed network introductions real:

- identify who needs this person
- identify who this person should meet
- explain why in plain executive language
- draft introductions only after evidence is strong enough
- place reviewable drafts in Leverage

Do not rebuild the removed relationship dossier/card sections.

## End-Of-Day Continuation Note

The user stopped here for the day and wants the next session to pick up without re-litigating the recovery work.

Next focus:

- dig into the user's inbox/sent/CC'd email context for VAL onboarding and Stewardship
- remember that read/replied-to emails do not belong in active Executive Inbox, but they do matter as context across VAL
- preserve Round Table / packet / custom field / AI prompt-layering architecture across all remaining drawers

Next drawers after Stewardship:

1. Projects
2. Commitments / task list
3. Documents
4. Lead Intelligence
5. VAL onboarding / updating

Major frustration to avoid: do not expose internal reasoning machinery, stale fake records, generic filler, or half-working buttons. The user needs calm executive surfaces that reduce cognitive load.
