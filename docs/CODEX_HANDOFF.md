# Codex Handoff: July 10 Live Truth Baseline

Last updated: 2026-07-10 18:24 EDT

## Absolute Baseline

The current live Railway deployment is THE TRUTH.

Use this as the recovery baseline for all future work:

- Production URL: `https://jessaval-production.up.railway.app`
- Branch: `codex/executive-inbox-only`
- Baseline commit: `dbc5d579c2549cc3353daca007bc7944741220c0`
- Baseline commit message: `Simplify Stewardship network view`
- Railway project: `a0402328-e877-406d-8f89-32bd6acdfd19`
- Railway service: `df0839e1-880b-4aa6-8def-56170f4cc980`
- Railway environment: `production`

Anything not included in this live deployed commit is trash until the user explicitly re-approves it.

Do not preserve, merge, deploy, cherry-pick, or "finish" any waiting work from another branch, worktree, uncommitted state, older deployment, or abandoned chat unless it is first checked against this live baseline and the user explicitly confirms it belongs.

## Why This Baseline Exists

On July 10, the product had regressed into stale drawer states, muddy colors, fake/demo records, overexposed architecture language, generic "canonical index" filler, and diagnostic surfaces in places where the user needed a calm executive product.

The recovery work brought the app back to an acceptable live stance. That current stance is now the foundation. Future work starts from here only.

## What Must Stay True

### Documentation-First Rule

Going forward, documentation comes before implementation.

Before Codex makes non-trivial product, architecture, prompt, drawer, packet, or executive-surface changes, it must draft or update the relevant documentation and wait for user feedback.

Read and follow:

```text
docs/CODEX_DOCUMENTATION_FIRST_RULE.md
```

Do not treat a conversation as permission to implement. If the user gives product feedback that changes direction, document the new direction first and show it to the user.

Implementation may begin only after explicit approval such as:

```text
Approved. Implement this documentation.
This product definition is correct. Proceed to code.
Build exactly what is documented here.
```

### Visual Standard

The Hearth drawers must keep the clean frosted-white/translucent standard.

Never regress to:

- muddy brown
- heavy tan
- clay/espresso palette
- dark clunky panels
- opaque gray/black drawer surfaces
- juvenile oversized card styling

The user explicitly approved the current white-glass direction and said to hold these colors so they never change.

### Home Standard

Home is not a dashboard and not an inbox.

The three Home cards remain:

- Velocity: what changed.
- Alignment: the one priority that deserves judgment.
- Leverage: drafts/prepared work VAL shaped while the user was away.

Do not reintroduce prototype state controls, canned explanation panels, generic KPI cards, or static architecture filler.

### Transcripts Standard

The drawer is called `Transcripts`.

The user-facing surface is the Meeting Notes workbench:

- left transcript list
- transcript count
- import controls
- selected transcript detail
- Action Items first
- Meeting Overview after Action Items
- Decisions when present
- People and Projects when present
- Co-Work scoped to the selected transcript
- View full transcript as a secondary path

VAL should treat imported transcript action items, notes, summaries, and titles as source truth. Do not reinterpret them into fabricated titles or generic AI summaries.

Do not return to the diagnostic cards:

- `Transcript Review Workflow`
- `Ready to Extract`
- `Proposed Notes`
- `Proposed Tasks`
- `Useful Note`
- `Useful Task`

### Executive Inbox Standard

Executive Inbox must show only real connected email conversations that qualify for judgment.

Do not show:

- demo email data
- Railway/system emails as executive conversations
- calendar invites as draft-reply email threads
- spam/newsletters/bank notices
- read/replied-to emails as current inbox items
- contacts who have emailed repeatedly while the user never replied, unless the user changes the rule

Executive Inbox context may use read emails from the last 30 days to understand a person, but read emails do not belong in the active Executive Inbox queue.

Preserve:

- saved rules review
- rule learning
- `Type New Rule Here`
- VAL-suggested rules with accept/dismiss
- thread-scoped discussion with VAL
- scan 30/90 day controls

### Stewardship Standard

The drawer is called `Stewardship`, not Relationships.

The core philosophy:

> Your network is one of your greatest assets. Stewardship is how you care for it. Rather than simply storing contacts, VAL continuously looks for ways to create value, strengthen relationships, prepare meaningful follow-ups, and connect people who can genuinely help one another.

Stewardship is not a CRM profile and not a project management dossier.

The visible person card must stay simple and executive:

1. Who this person is and what they do.
2. Who needs this person because this person has what they need.
3. Who this person should meet because those people have what this person needs.

The primary question is:

```text
Who needs to meet whom, and why?
```

Do not reintroduce visible sections like:

- `What VAL wants you to remember`
- `Executive Judgment`
- `Collaboration`
- `Story`
- `Temperature Review`
- raw round-table/debug/packet language
- generic canonical relationship index filler

Round Table and packet logic may exist behind the scenes. The executive surface should show the distilled stewardship recommendation, not the machinery.

### Projects Standard

Projects must remain actionable project dossiers, not generic project management cards.

Preserve the idea that Projects are grounded by:

- intake
- source review
- SOP/operating context
- linked people
- linked transcripts
- linked documents
- next narrow move

Do not flatten Projects into vague summaries or task-board theater.

### Lead Intelligence Standard

Lead Intelligence opens into the three-level sourcing board:

- Level 1 Discovery
- Level 2 Decision Maker
- Level 3 Confirm / Dedupe

Primary controls:

- run organization scraper
- run partner scraper
- train this scraper

Users must be able to define scraper parameters. Every future VAL dashboard will have its own scrapers, so this pattern must scale without hardcoding Jessa-only assumptions.

Preview does not equal import. Import still requires explicit approval and final dedupe/validation.

## Architectural Rule

This applies everywhere:

```text
Round Table decides.
Packet stores.
Custom fields persist.
Drawer displays.
User approves action.
```

The UI must not expose VAL's intelligence as raw machinery. The UI should show the executive-ready conclusion, the source-backed next move, and the approval path.

## Language Rules

Do not say `GHL` in user-facing copy. Say `CRM`.

Do not say `Krisp`, `Outscraper`, `RocketReach`, or provider names in user-facing copy unless the user explicitly asks to inspect integrations. Say `VAL` or use plain source language.

Do not use fake certainty. Do not invent people, emails, transcripts, tasks, or context.

## Current Verification

The baseline commit was deployed to Railway and live-verified.

Post-deploy live checks confirmed:

- live app includes the simplified Stewardship network map
- live app includes `Who needs to meet whom, and why`
- live app includes `peopleWhoNeedThem` and `peopleTheyShouldMeet`
- old visible Stewardship sections are absent from live HTML

Focused local checks passed:

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

## Before Any Future Deployment

Start from `dbc5d579c2549cc3353daca007bc7944741220c0` or a descendant of it.

Before deploying, confirm:

1. The work is based on the current live baseline.
2. No older drawer implementation is being resurrected.
3. No queued work from another chat is being treated as valid just because it exists.
4. The drawer/Home regression tests pass.
5. The user has approved any intentional change to the baseline stance.

If there is a conflict between a pending change and this handoff, this handoff wins.

## Next Product Work

The user is done for the day and needs to be able to pick up exactly here.

The user is auditing the Stewardship drawer and wants the next session to dig into the user's inbox as a context source for:

- VAL onboarding / updating
- Stewardship
- relationship context
- project context
- relationship stewardship logic

Important distinction:

- Executive Inbox should not show read/replied-to emails as active inbox items.
- VAL as a whole should still use read emails, sent emails, and CC'd emails as context when understanding a person, project, onboarding preference, stewardship opportunity, or follow-up.

For context gathering, inspect the user's inbox and sent history carefully, especially the last 30 days, and use those emails as evidence for VAL understanding. Do not confuse "not active Executive Inbox material" with "not useful VAL context."

## Next Drawer Order

After the current Stewardship pass, the next drawers to work through are:

1. Projects
2. Commitments / task list
3. Documents
4. Lead Intelligence
5. VAL onboarding / updating

Each drawer must inherit the same architecture discipline:

```text
Round Table decides.
Packet stores.
Custom fields persist.
Drawer displays.
User approves action.
```

Do not rebuild these drawers from generic UI intuition. Carry forward the documents and source-of-truth architecture around Round Table, packets, custom fields, and AI prompt layering.

At minimum, read and preserve the intent of:

- `docs/VAL_EXECUTIVE_REASONING_ARCHITECTURE.md`
- `docs/VAL_ROUND_TABLE_INSTRUMENTATION.md`
- `docs/VAL_ROUND_TABLE_MEMORY_AND_RECOGNITION.md`
- `docs/VAL_PROJECT_MANAGER_ROUND_TABLE_AND_PACKETS.md`
- `docs/VAL_STEWARDSHIP_ROUND_TABLE_AND_PACKETS.md`
- `docs/VAL_EXECUTIVE_INBOX_ROUND_TABLE_AND_RULES.md`
- `docs/VAL_PROMPT_ARCHITECTURE.md`
- `docs/VAL_TRANSCRIPT_INTAKE_PROMPTS.md`
- `docs/VAL_RELATIONSHIP_PROJECT_UNDERSTANDING_PROMPTS.md`
- `docs/VAL_CALENDAR_AND_MEETING_PREP_PROMPTS.md`
- `docs/VAL_EMAIL_DRAFT_PROMPTS.md`
- `docs/VAL_ONBOARDING_FIRST_UNDERSTANDING_PROMPTS.md`
- `docs/VAL_TEACH_VAL_PROMPTS.md`
- `docs/VAL_CONTEXT_REGISTRY.md`
- `docs/VAL_DO_NOT_REGRESS.md`

The point is not to expose these documents in the UI. The point is to preserve their reasoning structure behind the UI so the user sees calm, useful, source-backed conclusions instead of raw machinery.

## Frustrations To Avoid

The user spent too much time recovering from regressions that should not have happened. Avoid these specifically:

- Do not make the user repeat the same product philosophy every session.
- Do not resurrect old drawers just because stale code or queued deployment work exists.
- Do not show fake/demo/hallucinated records as if they are real.
- Do not show stale "canonical index" filler that creates cognitive load without action.
- Do not expose Round Table, packet, observer, prompt, provider, or debug language in the executive surface.
- Do not replace working source-grounded surfaces with diagnostic cards.
- Do not make buttons clickable but functionless.
- Do not allow close/back buttons to strand the user or close the whole drawer when they should return to the previous view.
- Do not make the user hunt through raw snippets to infer the open loop.
- Do not show redundant cards saying the same vague thing in several ways.
- Do not use muddy colors or regress from the frosted-white baseline.
- Do not deploy or preserve anything outside the live truth baseline without explicit user approval.
- Do not say `GHL` in user-facing copy; say `CRM`.
- Do not mention provider names such as Krisp, Outscraper, or RocketReach in normal user copy unless the user asks for integration/debug detail.
- Do not assume "empty Executive Inbox" means VAL has no email context.
- Do not confuse read email exclusion from Executive Inbox with excluding read email from VAL's understanding.

If the next chat gets uncertain, stop and compare the proposal against this handoff before coding.

## Current Stewardship Direction

The current approved direction is:

- keep Stewardship simple
- focus on thoughtful relationship moves
- use person packets as the relationship memory layer
- support introductions as one move type, alongside follow-ups, resources, check-ins, congratulations, questions, reminders, and waiting
- prepare drafts or review artifacts only after source-backed context is clear
- surface prepared work in Leverage for approval

Do not rebuild the removed relationship dossier sections unless the user explicitly asks for a new version of them.
