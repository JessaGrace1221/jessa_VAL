# Current State: Jessa VAL Live Truth Baseline

Updated: 2026-07-11 end-of-day handoff

## 2026-07-12 Local Implementation State

Local branch `codex/stewardship-person-packets` now includes the first source-processing / Project Managers slice.

This is not yet recorded here as deployed production truth.

Implemented locally:

- shared source-processing service, schema, and routes for `source_processing_records`, `prepared_artifact_records`, and `surface_registrations`
- relationship-sent document intake endpoint
- suggested project review updates from admitted relationship senders with document evidence
- Project Managers top suggestion lane, shown subtly above the project index and hidden when empty
- review actions for `Yes, create this project and assign it a manager` / `No, this is not a project`
- approval creates a local project shell with one owner and a color-named Project Manager
- Project Managers and Leverage / Ready For You surface registrations for the same suggested project
- project-level `Put a pin in it` persistence with due reminders resurfacing in Project Managers and Home Alignment as newly reopened loops
- reminder-handled receipts clear the pin from Alignment without marking the project itself complete
- scoped Project Managers Co-Work from the subtle top action and project packet/action rows, with locked context for the selected project, selected action, source receipts, and affected artifact/object only
- assigned color-named Project Managers appear in the Project Manager page header as a subtle ownership cue and are included in the project manager packet
- owner reassignment is available from the People involved card, with choose-existing/create-new relationship owner paths, persisted project metadata, and no-external-action relationship/project link receipts
- live email intelligence and intelligence backfill now route admitted relationship document attachments into the source-processing intake, using Gmail/Outlook attachment metadata and the same Project Managers yes/no review path

Still remaining before this local work becomes production truth:

- browser-visible/authenticated validation against real connected email data
- deployment decision and production verification
- broader source types beyond relationship-sent email documents

## Current Working State

The current live Railway app remains the product-behavior baseline.

Do not use older local state, queued changes, abandoned worktrees, or waiting deployments as source truth.

Live baseline:

- Production URL: `https://jessaval-production.up.railway.app`
- Railway deployment: `060f540b-4b95-4505-8db8-f484e27c40bb`
- Branch: `codex/stewardship-person-packets`
- Live baseline commit: `79e199a`
- Live baseline commit message: `Add Stewardship relationship evidence freshness map`

Anything not deployed in this commit is discarded unless the user explicitly approves bringing it forward.

The July 10 recovery baseline is now historical context. The current live Railway deployment above is the operative truth.

## End-Of-Day Branch State

The current local/GitHub branch also contains the approved documentation stack created on 2026-07-11 and one focused Co-Work bug fix.

Current handoff branch:

```text
Branch: codex/stewardship-person-packets
Latest pushed commit: 980d245
Latest pushed commit message: Document Co-Work V1 workspace spec
```

These branch changes are safe handoff material, but do not assume they are deployed to Railway unless deployment is explicitly checked or the user approves deployment.

Today’s pushed commits to preserve:

```text
980d245 Document Co-Work V1 workspace spec
6bbe31f Fix Hearth Co-Work submit response
1acd722 Add Project Manager V1 build spec
27d861e Document board of observers watching flow
63a9f1e Document project reset flow
f3fa716 Document project execution adjustment flow
d11928c Document project movement open loop flow
9178196 Document project reprioritization flow
8e30457 Document project prepared work flow
e2b5955 Document project judgment decision flow
11455b5 Document critical project issue handling
40cd192 Document dynamic Project Manager focus modules
d58c650 Document full page Project Manager experience
b4dcb79 Document payment issue alignment priority
5869ae0 Document project finance summary visibility
cd00aa8 Document path completeness and project finance receipts
023cc32 Document quiet notices project assignment flow
77f69f1 Document operational notice email routing
```

## Current Architecture Pause

The user paused Stewardship-specific iteration on 2026-07-11.

Reason:

```text
Stewardship is showing a symptom of a bigger system-wide source-routing problem.
```

The next work is not more Stewardship UI polish.

The next work is a strict system-wide source and click map:

```text
docs/VAL_SYSTEM_WIDE_SOURCE_AND_CLICK_MAP.md
```

That document now governs the next architecture pass.

Core new rule:

```text
Every email, transcript, calendar event, document, user correction, and external action receipt must enter VAL through one strict source-processing spine before any drawer, packet, prompt, or click can use it.
```

Examples that must drive the next implementation:

- Terrie transcript should create a first-class introduction opportunity for Terrie/Kareemah.
- Anthony email with documents should route to Documents and Project observer, and suggest a new project if no project exists.
- Spam/newsletter/unsubscribe/bulk/no-reply/system senders must not create relationships.

## 2026-07-11 Documentation Stack To Preserve

The user and Codex spent the day documenting a stricter system map and Project Manager/Co-Work direction. This must not be lost or summarized away.

Read these exact documents before next implementation:

```text
docs/VAL_PROJECT_MANAGER_V1_BUILD_SPEC.md
docs/VAL_COWORK_WITH_VAL_V1_BUILD_SPEC.md
docs/VAL_PROJECT_MANAGER_ROUND_TABLE_AND_PACKETS.md
docs/VAL_SYSTEM_WIDE_SOURCE_AND_CLICK_MAP.md
docs/VAL_CONTEXT_REGISTRY.md
docs/HEARTH_CLICK_CONTRACTS.md
```

The Project Manager V1 build spec is now the single implementation target for the full Project Manager page.

The Co-Work V1 build spec is documentation-only and currently awaits user approval before implementation.

The Co-Work bug fix was implemented and pushed:

```text
Commit: 6bbe31f
Change: Hearth Co-Work submit now calls runCowork('think') and has a real Send button.
Verification: node --check hearth-prototype.js; node --test test/hearthLeadIntelligence.test.js
```

Do not confuse that small bug fix with the larger Co-Work V1 workspace redesign. The larger redesign is documented but not implemented.

## 2026-07-11 Product Decisions To Preserve Exactly

### Home

Home has four major visible areas:

- Velocity: what happened.
- Alignment: the open-loop command center.
- Leverage / Ready For You: prepared work ready for review.
- Right-hand panel: keep substantially as-is with next calendar event, full calendar access, Co-Work icon/control, and Teach VAL button/control.

Alignment is all about open loops. It is not a general priority shelf.

### Project Managers

The drawer is called `Project Managers`.

Project Managers should open to a full Project Manager page, not a cramped drawer card.

Core promise:

```text
This page is how the user knows things are being handled.
```

Project Manager V1 dynamic module order:

1. Critical Project Issue
2. Needs Your Judgment
3. Prepared For You
4. Today's Reprioritization
5. Project Movement
6. Execution Adjustment
7. Project Reset
8. Quietly Watching

Use:

```text
docs/VAL_PROJECT_MANAGER_V1_BUILD_SPEC.md
```

as the implementation-facing source.

### Open Loops / Alignment

User language:

```text
If something was presented and has not been done, it is an open loop.
```

Alignment surfaces the open loop that most needs executive attention now.

Closed loops leave Alignment and produce receipts.

### Board Of Observers

Quietly Watching belongs primarily on the Board of Observers.

The top of Board of Observers should show project-by-project quiet watching summaries, alphabetically for now.

Each project section should show:

- project name
- what VAL is observing
- what would trigger action
- last checked/source proof
- whether anything needs the user
- available actions

The existing lower observer details should remain below that top section.

### Co-Work With VAL

The user tested Co-Work and found that it repeated what they typed but did not respond. That was fixed in commit `6bbe31f`.

The larger Co-Work V1 direction is documented but not implemented:

```text
docs/VAL_COWORK_WITH_VAL_V1_BUILD_SPEC.md
```

User requirement:

```text
Co-Work with VAL needs to be bigger, clearer, exactly like ChatGPT with previous conversations on the left, open space, clean and clear and functional for an executive on mobile or desktop. Voice options need to be obvious.
```

The current Hearth Co-Work widget should be treated as an entry point into the full workspace, not the final V1 experience.

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
docs/VAL_STEWARDSHIP_INTRODUCTION_UI_V1.md
```

Use that V1 spec before changing the Stewardship drawer, relationship admission logic, person packets, introduction suggestions, or manual two-person comparison.

Use `docs/VAL_STEWARDSHIP_INTRODUCTION_UI_V1.md` before changing visible Stewardship UI.

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

Additional current verification on 2026-07-11 after the Co-Work submit fix:

```bash
node --check hearth-prototype.js
node --test test/hearthLeadIntelligence.test.js
git diff --check
```

Result:

```text
56/56 focused Hearth tests passing
```

Live verification confirmed:

- new Stewardship network map is present
- old visible Stewardship sections are absent

## Next Safe Move

Continue only from this live baseline.

Do documentation-first architecture work from:

```text
docs/VAL_SYSTEM_WIDE_SOURCE_AND_CLICK_MAP.md
```

Then implement the shared `source_processing_record` and source router before returning to drawer-specific behavior.

Stewardship V1 remains introduction-only, but it is paused until the system-wide source pass exists:

- Suggested Introductions
- Create an Introduction
- Network
- V1 visible UI documented in `docs/VAL_STEWARDSHIP_INTRODUCTION_UI_V1.md`
- evidence-weighted admission, with 90-day sent mail as the strongest automatic signal
- block inbound-only/spam/generic/unsubscribe/bulk-mail senders from Stewardship
- packets limited to needs, offers, relationship to user, internal constraints, and evidence
- introduction outcome learning
- drafts require explicit approval before any external action

Do not rebuild the removed relationship dossier/card sections.

## End-Of-Day Continuation Note

The user stopped here for the day and wants the next session to pick up without re-litigating the recovery work.

Next focus when the user returns:

1. Build the shared source-processing spine first.
2. Use relationship-sent documents as the first Project Managers proof case.
3. Suggested projects should show `Yes, create this project and assign it a manager` and `No, this is not a project`.
4. Project Manager V1 should include one owner, reassignment by relationship/create-new-relationship, color-named managers, real `Put a pin in it` reminders, and scoped Co-Work actions in the first slice.
5. Then continue through:
   - Project Managers
   - Commitments / task list
   - Documents
   - Lead Intelligence
   - Co-Work with VAL as a full scoped experience
   - VAL onboarding/updating

Remember:

- read/replied-to emails do not belong in active Executive Inbox, but they do matter as context across VAL
- preserve Round Table / packet / custom field / AI prompt-layering architecture
- do not expose machinery in executive UI

Major frustration to avoid: do not expose internal reasoning machinery, stale fake records, generic filler, or half-working buttons. The user needs calm executive surfaces that reduce cognitive load.
