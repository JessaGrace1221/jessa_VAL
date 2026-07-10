# Next Task: Continue From July 10 Live Truth

Updated: 2026-07-10 18:16 EDT

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

## Do Not Do

- Do not restore old Relationship drawer sections.
- Do not show Round Table internals, packet internals, observer labels, debug copy, or architecture language.
- Do not bring back `What VAL wants you to remember`, `Executive Judgment`, `Collaboration`, `Story`, or `Temperature Review`.
- Do not deploy any waiting work from before `dbc5d57`.
- Do not use provider names in user-facing copy unless explicitly requested.
- Do not say `GHL`; say `CRM`.

## Required Checks Before Deploy

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
