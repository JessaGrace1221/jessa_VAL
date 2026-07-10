# Known Good Baseline

Date: 2026-07-10 13:30 ET

Production deployment: `f8259d04-88c5-46e5-9602-d92a66b57ec8`

Commit: `9fe505a Restore transcript meeting notes drawer`

Branch: `codex/executive-inbox-only`

Purpose: define the baseline standard after the July 10 recovery work. Future changes should preserve this state unless the user explicitly approves a new baseline.

## Baseline Rule

Do not replace an executive-facing drawer with an older diagnostic, demo, workflow, or architecture surface.

Do not let old copy, muddy color systems, fake records, or debug concepts creep back into the Hearth.

If a future implementation conflicts with this baseline, stop and inspect the source-of-truth docs before changing the UI.

## Visual Baseline

Opened Hearth drawers use the shared white-glass/frosted surface system:

- `--frost-open-surface`
- `--frost-open-card`
- `--frost-open-card-strong`
- `--frost-open-line`
- `--frost-open-shadow`
- `--frost-open-soft-shadow`

The drawer should read as clean frosted white over the Hearth. It must not drift back into muddy brown, heavy tan, clay, espresso, opaque gray, or black panel styling.

The relevant static guard is in `test/hearthLeadIntelligence.test.js`, especially the drawer frost and transcript workbench tests.

## Home Baseline

Home is not Executive Inbox.

Home must not show prototype-only controls such as `Prototype states`, `Quiet`, `Protective`, `Completion`, or `Evening`.

The three Home rooms remain:

- Velocity: what changed.
- Alignment: the top priority, shown one at a time.
- Leverage: prepared work/drafts VAL shaped while the user was away.

Do not point all three rooms to Executive Inbox. Do not collapse Home into a generic dashboard, inbox, task board, metrics board, or static explainer.

## Calendar And Meeting Prep Baseline

The small calendar companion is for the next real meeting, not the next private calendar note.

A calendar item is a meeting only when it has at least one external attendee and is not obviously a private appointment. Solo calendar blocks, personal reminders, medical appointments, focus blocks, and notes to self may inform rhythm/capacity, but they must not:

- appear as the next meeting
- launch Meeting Prep
- create meeting prep briefs
- feed Ready For You as a meeting
- manufacture relationship intelligence

Meeting Prep should gather and present:

- calendar event title/time
- attendee identity resolution
- relationship context
- project context
- relevant emails
- relevant transcripts
- relevant tasks/open loops
- source confidence
- public stewardship signals when useful, including LinkedIn/Outscraper-style updates

Meeting Prep must stay review-only. VAL may prepare openings, questions, follow-up candidates, and stewardship notes, but it must not send messages, update CRM, write calendar changes, or publish LinkedIn content without explicit approval.

## Transcripts Baseline

The user-facing drawer is called `Transcripts`.

The drawer heading is:

```text
Meeting notes
```

The drawer subcopy is:

```text
Recent transcript conversations, action items, and clean meeting overviews.
```

The normal user surface must use the Meeting Notes workbench:

- left transcript list
- transcript count
- Krisp import controls
- right-side `Select a transcript` empty state
- selected transcript detail starts with Action Items
- Meeting Overview follows action items
- Decisions when present
- People and Projects
- Co-Work scoped to the selected transcript
- `View full transcript` as secondary path

The normal drawer must not show these old diagnostic/workflow cards:

- `Transcript Review Workflow`
- `Ready to Extract`
- `Proposed Notes`
- `Proposed Tasks`
- `Useful Note`
- `Useful Task`

Diagnostics may exist, but only behind explicit developer/admin diagnostic paths.

## Transcript Data Baseline

Transcript titles must stay grounded in source evidence.

For the July 10 GOALL meeting, the live transcript API should show:

```text
GOALL · Jul 10, 2026
```

It must not show the unrelated calendar title:

```text
Mammogram Wang Building annual screening
```

It must not use AI summary sentences as meeting titles, such as:

```text
Automation build-out is mostly moving.
Jessa walked the team through completed build items...
```

The server-side guard lives in `server.js`:

- `transcriptKnownContentTitle`
- `transcriptTitleConflictsWithContent`
- `transcriptGroundedTitleCandidate`

The frontend guard lives in `hearth-prototype.js`:

- `timelineTranscriptKnownTitle`
- `timelineTranscriptTitle`

## Executive Inbox Baseline

Executive Inbox should remain frosted white, executive, and conversation-based.

It must preserve:

- live Gmail-derived conversations only, not demo/hallucinated emails
- scan windows for 30/90 days
- clickable saved rules modal with a working close button
- `Type New Rule Here`
- Rules VAL Suggests with accept/dismiss behavior
- thread discussion with VAL

Do not reintroduce the old dark/clunky/muddy version.

## Relationships Baseline

Relationships should remain a frosted white Relationship Brief, not CRM.

It must preserve:

- selectable relationship list/file-cabinet behavior
- details do not disappear after a timeout
- relationship actions remain scoped to the selected person
- round-table/packet-derived relationship meaning where available

Do not replace relationship cards with generic "canonical index" filler as the primary user value.

## Projects Baseline

Projects should remain an actionable Project Dossier / Project Manager surface.

It must preserve:

- project dossier, not generic project management
- intake/new project creation path
- project source review and SOP/next-move context
- relationship/project packet grounding

Do not flatten Projects into static cards or vague project summaries.

## Lead Intelligence Baseline

Lead Intelligence opens directly into the three-level sourcing board:

- Level 1 Discovery
- Level 2 Decision Maker
- Level 3 Confirm / Dedupe

The only primary controls are:

- run organization scraper
- run partner scraper
- train this scraper

Preview does not equal import. Import still requires explicit approval and final dedupe/validation.

## Required Checks Before Deploying Drawer/Home Changes

Run:

```bash
node --check hearth-prototype.js
node --check server.js
node --test test/hearthLeadIntelligence.test.js test/transcriptTabRegression.test.js test/transcriptIntelligenceIndex.test.js
```

For changes touching Krisp, also run:

```bash
node --test test/krispMcpService.test.js
```

Before a production deploy, check the live/static page for these markers:

```bash
curl -sS https://jessaval-production.up.railway.app/hearth-prototype.html \
  | rg "Meeting notes|data-transcript-list|data-transcript-detail|View full transcript"
```

And check that old transcript workflow copy is absent:

```bash
curl -sS https://jessaval-production.up.railway.app/hearth-prototype.html \
  | rg "Transcript Review Workflow|Ready to Extract|Proposed Notes|Useful Task"
```

The second command should return no matches.
