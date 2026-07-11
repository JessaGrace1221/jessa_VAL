# Next Task: Continue From July 10 Live Truth

Updated: 2026-07-10 18:24 EDT

## Start Here

Read first:

```text
docs/CODEX_HANDOFF.md
docs/CODEX_CURRENT_STATE.md
docs/audits/2026-07-10-live-truth-baseline.md
```

Then verify the working branch descends from:

```text
dbc5d579c2549cc3353daca007bc7944741220c0
```

If it does not, stop before changing code.

## Immediate Product Direction

The next work should continue the Stewardship drawer from the approved live baseline.

The user wants the next session to dig into the user's inbox as a context source for VAL onboarding and Stewardship.

Important:

- Read/replied-to emails do not belong in the active Executive Inbox queue.
- Those same read/replied-to emails may be essential context for VAL's understanding of people, projects, commitments, onboarding preferences, and stewardship opportunities.
- Inbox, sent mail, and CC'd email context from the last 30 days should help VAL understand who matters, what has happened, and where a useful introduction or follow-up may exist.

The visible Stewardship person card should stay simple:

1. Who this person is and what they do.
2. Who needs this person because this person has what they need.
3. Who this person should meet because those people have what this person needs.

The user wants to know:

```text
Who needs to meet whom, and why?
```

## Next Implementation Step

Make the network introduction logic real without adding visual clutter:

- use transcripts, emails, calendar context, projects, documents, and CRM context as evidence
- produce reviewable network-match packets behind the scenes
- show only the distilled match and why it matters
- prepare draft introduction emails when a match is strong enough
- send those drafts to Leverage for user approval

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
docs/VAL_STEWARDSHIP_PACKET_SORTING_SPEC.md
```

The next Stewardship implementation step should follow that spec: admit only real relationships, build durable person packets, extract needs/offers from source evidence, sort by usefulness, and show match packets only when the evidence can support an executive review.

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
