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

## Stewardship Packet Sorting Spec

The previous broad Stewardship direction is documented in:

```text
docs/VAL_STEWARDSHIP_PACKET_SORTING_SPEC.md
```

However, on 2026-07-11 the user narrowed Stewardship V1 to introduction-only because the broader drawer became noisy and non-actionable.

The current Stewardship V1 product definition is now:

```text
docs/VAL_STEWARDSHIP_INTRODUCTION_ENGINE_V1.md
```

Use that V1 spec before changing the Stewardship drawer, relationship admission logic, person packets, introduction suggestions, or manual two-person comparison.

The new V1 promise is:

```text
Stewardship helps you make the right introductions by understanding what people need and what they can offer.
```

Do not implement general relationship management in Stewardship V1.

Do not show relationship scores, temperature, dossiers, open loops, People To Watch, Active Stewardship, action piles, observer language, packet internals, or generic next-move management.

The urgent identity/admission correction is:

```text
Recent sent-mail recipients are the strongest automatic admission signal, but not the only definition of a relationship.
Inbound-only senders the user never replied to or emailed must not appear as relationships unless another trusted relationship signal admits them.
Emails with unsubscribe links or bulk-mail/list headers are spam or marketing, not contacts.
```

Packets remain infrastructure, but the visible drawer exists to discover or create introductions.

## Absolute Guardrail

If a future change conflicts with `docs/CODEX_HANDOFF.md`, stop and read the handoff first.

The handoff wins over any stale code, stale docs, stale deployment, or old chat instruction.

## Documentation-First Workflow

The user has now explicitly required documentation before implementation.

Follow:

```text
docs/CODEX_DOCUMENTATION_FIRST_RULE.md
```

For any non-trivial product or architecture work, update the docs first and wait for user feedback before writing code.

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

For Stewardship, the next product direction is documentation-first and introduction-only:

- Suggested Introductions
- Create an Introduction
- People
- evidence-weighted admission, with 90-day sent mail as the strongest automatic signal
- block inbound-only/spam/generic/unsubscribe/bulk-mail senders from Stewardship
- packets limited to needs, offers, relationship to user, and evidence
- introduction outcome learning
- drafts require explicit approval before any external action

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
