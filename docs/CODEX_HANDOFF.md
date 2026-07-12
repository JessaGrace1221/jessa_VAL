# Codex Handoff: July 10 Live Truth Baseline

Last updated: 2026-07-11 end-of-day handoff

## 2026-07-12 Local Continuation

The first system-wide source-processing / Project Managers implementation slice has started locally on `codex/stewardship-person-packets`.

New local implementation:

- `services/valSourceProcessingSchema.js`
- `services/valSourceProcessing.js`
- `services/valSourceProcessingRoutes.js`
- `test/valSourceProcessing.test.js`
- `services/valProjectPinsSchema.js`
- `services/valProjectPins.js`
- `services/valProjectPinsRoutes.js`
- `test/valProjectPins.test.js`

Behavior implemented:

- relationship-sent documents create source-processing records
- admitted relationship senders with document evidence can produce a suggested-project review update
- suggested projects register to both Project Managers and Leverage / Ready For You
- the Project Managers drawer has a subtle top suggestion lane above the project index
- approval/rejection uses the existing review-update route
- approval creates one local project owner and assigns a color-named Project Manager
- pending-only surface filtering prevents approved/rejected suggestions from resurfacing
- `Put a pin in it` persists project reminders, records `reopened_at` when the reminder becomes due, surfaces due pins in Project Managers and Home Alignment as newly reopened loops, and provides a `Mark reminder handled` action that clears only the reminder loop
- scoped Project Managers Co-Work opens from a subtle top action and from project packet/action rows, preflights `project_packet`, and locks held context to the selected project, selected action, source receipts, and affected artifact/object only
- assigned color-named Project Managers appear in the Project Manager page header as a subtle ownership cue and are included in the project manager packet
- owner reassignment is available from the People involved card, with choose-existing/create-new relationship owner paths, persisted project metadata, and no-external-action relationship/project link receipts
- live email intelligence and intelligence backfill route admitted relationship document attachments into source-processing, using Gmail/Outlook attachment metadata and the same Project Managers suggested-project review path

Verified:

```text
node --check services/valSourceProcessingSchema.js services/valSourceProcessing.js services/valSourceProcessingRoutes.js services/valProjectPinsSchema.js services/valProjectPins.js services/valProjectPinsRoutes.js services/valReviewUpdates.js hearth-prototype.js server.js test/valSourceProcessing.test.js test/intelligenceBackfill.test.js
node --test --test-reporter=dot test/valProjectPins.test.js test/valSourceProcessing.test.js test/valReviewUpdates.test.js test/valReadyForYou.test.js test/hearthLeadIntelligence.test.js test/intelligenceBackfill.test.js
git diff --check
```

Still not production truth:

- browser-visible/authenticated validation against real connected email data is still needed
- deployment decision and production verification are still needed
- broader source types beyond relationship-sent email documents are still future work

## Absolute Baseline

The current live Railway deployment is THE TRUTH.

Use this as the recovery baseline for all future work:

- Production URL: `https://jessaval-production.up.railway.app`
- Branch: `codex/stewardship-person-packets`
- Baseline commit: `79e199a`
- Baseline commit message: `Add Stewardship relationship evidence freshness map`
- Railway deployment: `060f540b-4b95-4505-8db8-f484e27c40bb`
- Railway project: `a0402328-e877-406d-8f89-32bd6acdfd19`
- Railway service: `df0839e1-880b-4aa6-8def-56170f4cc980`
- Railway environment: `production`

Anything not included in this live deployed commit is trash until the user explicitly re-approves it.

Do not preserve, merge, deploy, cherry-pick, or "finish" any waiting work from another branch, worktree, uncommitted state, older deployment, or abandoned chat unless it is first checked against this live baseline and the user explicitly confirms it belongs.

## End-Of-Day Branch Handoff

The user asked to keep every inch of the day safe for morning handoff.

Current handoff branch:

```text
Branch: codex/stewardship-person-packets
Latest pushed commit: 980d245
Latest pushed commit message: Document Co-Work V1 workspace spec
```

Important distinction:

```text
Production remains the behavioral truth.
The branch contains today's approved documentation stack and one focused Co-Work bug fix.
Do not assume branch changes are deployed to Railway unless deployment is explicitly checked or approved.
```

The day’s important commits, in newest-first order:

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

Read these first tomorrow:

```text
docs/CODEX_HANDOFF.md
docs/CODEX_CURRENT_STATE.md
docs/NEXT_TASK.md
docs/CODEX_DOCUMENTATION_FIRST_RULE.md
docs/VAL_PROJECT_MANAGER_V1_BUILD_SPEC.md
docs/VAL_COWORK_WITH_VAL_V1_BUILD_SPEC.md
docs/VAL_SYSTEM_WIDE_SOURCE_AND_CLICK_MAP.md
docs/HEARTH_CLICK_CONTRACTS.md
```

The Project Manager V1 spec is approved consolidation and is the build target.

The Co-Work V1 workspace spec is a draft for user approval before implementation.

The Co-Work submit bug fix is implemented:

```text
Commit: 6bbe31f
What changed: home Co-Work now has a Send button and submit calls runCowork('think') instead of only echoing the user input into context.
Verified with: node --check hearth-prototype.js; node --test test/hearthLeadIntelligence.test.js
```

## Current Strategic Pause

On 2026-07-11, the user paused Stewardship-specific iteration.

Do not keep polishing Stewardship until the larger source-routing problem is addressed.

The new governing architecture document is:

```text
docs/VAL_SYSTEM_WIDE_SOURCE_AND_CLICK_MAP.md
```

The next architecture pass must create a strict system-wide map where every email, transcript, calendar event, document, user correction, and external action receipt goes through the same source-processing spine before any drawer, packet, prompt, or click can use it.

The user wants a system that can do this reliably:

- A transcript from a conversation with Terrie should be available to every relevant observer. Stewardship should have flagged the explicit Terrie/Kareemah introduction.
- An email from Anthony with documents should route to Documents and Project Managers, and should suggest a new project if no project exists.
- Spam, newsletters, unsubscribe/bulk/no-reply/system senders must never leak into relationships.

The next implementation should start from the shared source-processing spine, not from visible drawer tweaks.

The user confirmed this sequence because it moves the needle for all of VAL, not only Project Managers.

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
- Alignment: the open-loop command center.
- Leverage: drafts/prepared work VAL shaped while the user was away.

Do not reintroduce prototype state controls, canned explanation panels, generic KPI cards, or static architecture filler.

Important 2026-07-11 correction:

```text
The alignment card is all about open loops.
```

Alignment is not a general priority list. It shows the open loop that most needs executive attention now.

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

The prior broad philosophy was:

> Your network is one of your greatest assets. Stewardship is how you care for it. Rather than simply storing contacts, VAL continuously looks for ways to create value, strengthen relationships, prepare meaningful follow-ups, and connect people who can genuinely help one another.

On 2026-07-11, the user narrowed Stewardship V1 because the broader drawer became noisy and non-actionable.

The current V1 source of truth is:

```text
docs/VAL_STEWARDSHIP_INTRODUCTION_ENGINE_V1.md
docs/VAL_STEWARDSHIP_INTRODUCTION_UI_V1.md
```

V1 purpose:

```text
Stewardship helps the executive make valuable introductions.
```

Stewardship V1 is not a CRM profile, not a project management dossier, not relationship management, and not a generalized next-move engine.

The visible drawer should reduce to:

1. Suggested Introductions
2. Create an Introduction
3. Network

Packets remain infrastructure only. The executive should not browse packet machinery.

The packet sections for V1 are:

1. Needs
2. Offers
3. Relationship to user
4. Internal constraints / missing pieces
5. Evidence

The primary question is:

```text
Who needs to meet whom, and why?
```

Urgent identity/admission correction:

```text
Recent sent-mail recipients are the strongest automatic admission signal, but not the only definition of a relationship.
Inbound-only senders the user never replied to or emailed must not appear as relationships unless another trusted relationship signal admits them.
Emails with unsubscribe links or bulk-mail/list headers are spam or marketing, not contacts.
```

Reject spam, newsletters, unsubscribe-link senders, bulk-mail/list senders, no-reply/system senders, generic mailboxes, receipts, notifications, scraped addresses, and company/mailbox records that are not real people.

Calendar attendees are trusted contacts for Stewardship admission unless they are owner/self, private calendar blocks, resource rooms, system/no-reply addresses, or generic mailboxes.

Do not reintroduce visible sections like:

- `What VAL wants you to remember`
- `Executive Judgment`
- `Collaboration`
- `Story`
- `Temperature Review`
- `People To Watch`
- `Active Stewardship`
- relationship score
- relationship temperature
- dossiers
- generic action piles
- raw round-table/debug/packet language
- generic canonical relationship index filler

Round Table and packet logic may exist behind the scenes. The executive surface should show the distilled stewardship recommendation, not the machinery.

### Project Managers Standard

The drawer is called `Project Managers`.

Project Managers must remain actionable project dossiers, not generic project management cards.

Preserve the idea that Projects are grounded by:

- intake
- source review
- SOP/operating context
- linked people
- linked transcripts
- linked documents
- next narrow move

Do not flatten Projects into vague summaries or task-board theater.

2026-07-11 Project Manager V1 direction:

```text
docs/VAL_PROJECT_MANAGER_V1_BUILD_SPEC.md
```

Project Managers should open to a full Project Manager page.

Implementation decisions now approved:

- suggest projects only when an admitted relationship sends documents
- minimum evidence is documents, especially agreements, scopes, decks, proposals, spreadsheets, SOWs, and similar project material
- show simple project-suggestion choices: `Yes, create this project and assign it a manager` and `No, this is not a project`
- documents remain visible in both the Documents drawer and the Project Manager page
- V1 has one project owner
- the executive can reassign ownership by choosing a relationship or creating a new one
- keep `Put a pin in it` persisted and reminder-wired; due pins should surface in Project Managers and Alignment as newly reopened loops until the reminder is handled
- keep scoped Co-Work actions in the first Project Managers slice; the visible entry should stay subtle, and the held context must not leak beyond the selected project/action packet
- assign color-named Project Managers and use the color subtly in each Project Manager page header

Core trust promise:

```text
This page is how the user knows things are being handled.
```

Dynamic top modules:

1. Critical Project Issue
2. Needs Your Judgment
3. Prepared For You
4. Today's Reprioritization
5. Project Movement
6. Execution Adjustment
7. Project Reset
8. Quietly Watching

Board of Observers should become the primary Quietly Watching surface, with project-by-project watch summaries at the top and existing observer details below.

### Co-Work With VAL Standard

Co-Work must not remain a tiny, cramped widget.

The user explicitly said:

```text
We need the co-work with VAL to be bigger, clearer... exactly like ChatGPT with the previous conversations on the left - open space -- clean and clear and functional the way an executive needs it to look and feel whether on mobile or desktop. Also the voice options needs to be obvious.
```

The governing draft spec is:

```text
docs/VAL_COWORK_WITH_VAL_V1_BUILD_SPEC.md
```

Do not implement this larger redesign until the user approves the documentation.

The current Hearth Co-Work widget is only an entry point into the future full workspace.

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

Start from `79e199a` or a descendant of it unless the user explicitly resets the baseline again.

Before deploying, confirm:

1. The work is based on the current live baseline.
2. No older drawer implementation is being resurrected.
3. No queued work from another chat is being treated as valid just because it exists.
4. The drawer/Home regression tests pass.
5. The user has approved any intentional change to the baseline stance.

If there is a conflict between a pending change and this handoff, this handoff wins.

## Next Product Work

The user paused Stewardship-specific iteration and wants the next session to pick up from the system-wide source map.

Start with:

```text
docs/VAL_SYSTEM_WIDE_SOURCE_AND_CLICK_MAP.md
```

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

1. Project Managers
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
