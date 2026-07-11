# Next Task: Continue From July 10 Live Truth

Updated: 2026-07-10 18:24 EDT

## Start Here

Read first:

```text
docs/CODEX_HANDOFF.md
docs/CODEX_CURRENT_STATE.md
docs/CODEX_DOCUMENTATION_FIRST_RULE.md
docs/audits/2026-07-10-live-truth-baseline.md
```

Then verify the working branch descends from:

```text
dbc5d579c2549cc3353daca007bc7944741220c0
```

If it does not, stop before changing code.

## Immediate Product Direction

Do not implement first.

The user now requires all relevant documentation before product/code changes so she can give feedback.

The next Stewardship move is documentation-only unless the user explicitly approves implementation after reviewing the docs.

The next work should replace the noisy broad Stewardship direction with the introduction-only V1 product definition:

```text
docs/VAL_STEWARDSHIP_INTRODUCTION_ENGINE_V1.md
docs/VAL_STEWARDSHIP_INTRODUCTION_UI_V1.md
```

Stewardship V1 has one purpose:

```text
Help the executive make valuable introductions.
```

The drawer should reduce to:

1. Suggested Introductions
2. Create an Introduction
3. People

The user wants the next implementation to resolve the polluted relationship list urgently.

Important:

- Recent sent mail from the last 90 days is the strongest automatic admission signal, not the entire definition of a relationship.
- People the user sent email to are much safer relationship candidates than inbound-only senders.
- Other trusted admission signals include replies, meaningful meeting participation, meaningful transcript participation, confirmed CRM contact, user-marked importance, manual selection, and prior approved introduction history.
- Inbound-only email addresses the user never replied to or emailed must not appear as relationships unless another trusted relationship signal admits them.
- Spam, newsletters, unsubscribe-link senders, bulk-mail/list senders, no-reply/system senders, generic mailboxes, receipts, notifications, and scraped addresses must be rejected from Stewardship.
- Inbound mail may enrich a packet only after the person is admitted through a trusted relationship signal.

The visible Stewardship output should stay simple:

1. Who should be introduced to whom.
2. What each person needs.
3. What each person offers.
4. Why this introduction could matter.
5. What evidence supports it.
6. Review draft / approve / not now.

The user wants to know:

```text
Who should meet whom, and why?
```

## Next Implementation Step

After explicit implementation approval, make the introduction engine real without visual clutter:

- replace the visible Stewardship drawer with the three-area UI in `docs/VAL_STEWARDSHIP_INTRODUCTION_UI_V1.md`
- remove broad relationship-dashboard sections and generic action buttons from the Stewardship drawer
- scan 90 days of sent mail recipients
- add evidence-weighted admission from trusted relationship signals
- admit only real people who pass trusted relationship gates
- suppress inbound-only, unsubscribe, bulk-mail, spam, marketing, automated, and generic addresses
- extract needs/offers/relationship/evidence into simple packets
- create suggested introduction records from packet comparisons
- let the user manually choose two people and compare their packets
- add `Find Matches` from the People section
- draft introductions only when both identities and evidence are strong enough
- learn from introduction outcomes without exposing analytics
- require explicit approval before sending anything

## Drawer Order After Stewardship

Work through these next, carrying forward the Round Table / packet / prompt-layering architecture:

1. Projects
2. Commitments / task list
3. Documents
4. Lead Intelligence
5. VAL onboarding / updating

Do not rebuild these as generic drawers. Each drawer should use the same model:

```text
Round Table decides.
Packet stores.
Custom fields persist.
Drawer displays.
User approves action.
```

Read the source-of-truth docs before changing each drawer:

- `docs/VAL_EXECUTIVE_REASONING_ARCHITECTURE.md`
- `docs/VAL_ROUND_TABLE_INSTRUMENTATION.md`
- `docs/VAL_ROUND_TABLE_MEMORY_AND_RECOGNITION.md`
- `docs/VAL_PROJECT_MANAGER_ROUND_TABLE_AND_PACKETS.md`
- `docs/VAL_STEWARDSHIP_ROUND_TABLE_AND_PACKETS.md`
- `docs/VAL_STEWARDSHIP_PACKET_SORTING_SPEC.md`
- `docs/VAL_EXECUTIVE_INBOX_ROUND_TABLE_AND_RULES.md`
- `docs/VAL_PROMPT_ARCHITECTURE.md`
- `docs/VAL_TRANSCRIPT_INTAKE_PROMPTS.md`
- `docs/VAL_RELATIONSHIP_PROJECT_UNDERSTANDING_PROMPTS.md`
- `docs/VAL_EMAIL_DRAFT_PROMPTS.md`
- `docs/VAL_ONBOARDING_FIRST_UNDERSTANDING_PROMPTS.md`
- `docs/VAL_TEACH_VAL_PROMPTS.md`
- `docs/VAL_CONTEXT_REGISTRY.md`

## Do Not Do

- Do not restore old Relationship drawer sections.
- Do not continue the broad relationship-stewardship UI.
- Do not show People To Watch, Active Stewardship, relationship scores, temperature, dossiers, or generic action piles in Stewardship V1.
- Do not show Round Table internals, packet internals, observer labels, debug copy, or architecture language.
- Do not bring back `What VAL wants you to remember`, `Executive Judgment`, `Collaboration`, `Story`, or `Temperature Review`.
- Do not deploy any waiting work from before `dbc5d57`.
- Do not use provider names in user-facing copy unless explicitly requested.
- Do not say `GHL`; say `CRM`.
- Do not make the user repeat the same philosophy or frustration history.
- Do not confuse "not in Executive Inbox" with "not useful context for VAL."
- Do not show fake/demo/hallucinated records as real.
- Do not expose Round Table, packet, observer, prompt, provider, or debug language in the executive surface.
- Do not make buttons clickable unless they have a real, useful behavior.

## Required Checks Before Deploy

Before implementation, read:

```text
docs/VAL_STEWARDSHIP_INTRODUCTION_ENGINE_V1.md
docs/VAL_STEWARDSHIP_INTRODUCTION_UI_V1.md
```

The next Stewardship implementation step should follow that spec: use evidence-weighted admission with 90-day sent mail as the strongest automatic signal, reject inbound-only/spam/generic/unsubscribe/bulk-mail senders, build simple needs/offers/relationship/evidence packets, and show only suggested or manually-created introductions plus People/Find Matches.

Before requesting implementation approval, documentation must include:

- what new behavior is being introduced
- what existing behavior it replaces
- what remains valid
- what is deprecated
- what conflicting UI/prompts/services/tests must be removed or prevented
- at least one visible-output example

The mandatory first example is the Terry/Kareemah promised-introduction case in `docs/VAL_STEWARDSHIP_INTRODUCTION_ENGINE_V1.md`.

Run at minimum:

```bash
node --check hearth-prototype.js
node --check services/valRelationshipDossier.js
node --test test/hearthLeadIntelligence.test.js test/valRelationshipDossier.test.js
git diff --check
```

Then verify live/static strings after deployment:

```bash
curl -sS https://jessaval-production.up.railway.app/hearth-prototype.html \
  | rg "Who needs to meet whom, and why|stewardship-network-map"
```

And verify the removed old sections stay absent:

```bash
curl -sS https://jessaval-production.up.railway.app/hearth-prototype.html \
  | rg "What VAL wants you to remember|<span>Executive Judgment</span>|<span>Collaboration</span>|<span>Story</span>|data-relationship-temperature-review"
```

The second command should return no matches.
