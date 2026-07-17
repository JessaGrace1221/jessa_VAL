# Jessa VAL Handoff: Executive Inbox Reset

Updated: 2026-07-17

## Start Here

This is the active clean baseline for the next VAL session. Do not work from
`/Users/jessagrace/Documents/VAL drawer - Correspondence`; that is a different
project and not the live Jessa VAL implementation.

- Repository: `/Users/jessagrace/Documents/Val-Alison/jessa_VAL-clean-baseline`
- Branch: `codex/clean-baseline`
- Production: `https://jessaval-production.up.railway.app`
- Railway project: `a0402328-e877-406d-8f89-32bd6acdfd19`
- Railway service: `df0839e1-880b-4aa6-8def-56170f4cc980`
- Verified live deployment: `01f42fec-81f1-488a-8fa7-57939a86453b`
- Production verification on 2026-07-17: root returned HTTP `200`; Railway
  reported the service online.

Read these documents before touching code:

1. `docs/CODEX_CURRENT_STATE.md`
2. `docs/NEXT_TASK.md`
3. `docs/HEARTH_CLICK_CONTRACTS.md`
4. `docs/VAL_SYSTEM_WIDE_SOURCE_AND_CLICK_MAP.md`
5. `docs/VAL_COWORK_WITH_VAL_V1_BUILD_SPEC.md`

The current deployed Railway state is the behavioral truth. This handoff
supersedes the old July 10-12 handoff language in this repository.

## What Is Live And Must Survive

### Drawer model

The user-facing drawers are ordered:

1. Executive Inbox
2. Project Managers
3. Stewardship
4. Transcripts
5. Lead Intelligence
6. VAL

Documents and Commitments are internal evidence/action domains, not drawers to
restore as independent top-level workspaces. Existing markup or routes are not
permission to reintroduce them into navigation.

### Current working baseline

- The VAL Witnessing Session and First Look now produce a reviewable proposal
  map before creating relationship or project packets.
- The First Look is packetized so one oversized OpenAI response does not block
  all of the work. It scans approved Gmail, Calendar, Drive/Docs, and Krisp
  sources, then prepares bounded relationship/project proposals.
- Stewardship's Network can be refreshed from sent mail, manually populated,
  and populated from CSV. Admission requires an email address; sent-mail
  candidates require more than three sent messages.
- Stewardship supports stored public-context enrichment per relationship,
  individual enrichment, bulk opt-in enrichment, immediate saved Co-Work card
  updates, and visible enrichment progress.
- Relationship-card Co-Work is scoped to exactly one person and one card. A
  user-confirmed internal update is applied immediately; it must not touch
  other people, cards, or external systems.
- Transcript material is a source receipt. Krisp's words, Action Items, and
  Key Points must not be rewritten as though VAL authored them.
- Project Managers is deliberately not the next implementation target. Do not
  reactivate or broaden it while rebuilding Executive Inbox. The user asked
  for a clearly unavailable/Coming Soon experience until its later dedicated
  pass.
- Lead Intelligence functions for now. It does not need a Co-Work control in
  this phase.

### Latest implementation commits

```text
44006e9 Clarify relationship context enrichment copy
f4c5251 Version Stewardship live assets
f023e20 Make Stewardship updates and enrichment progress immediate
e3fb577 Fix sent-mail Network refresh list handling
60069cd Refresh Hearth relationship card assets
```

## Product Principles That Are Not Optional

- VAL should feel calm, useful, and executive-ready. Do not expose packet,
  round-table, or diagnostic machinery in user-facing drawers.
- A source receipt is not a new fact. Preserve exact source material and keep
  it distinct from VAL's judgment.
- No external action happens without a visible, explicit approval path.
- Co-Work means a real, scoped conversation that saves a bounded result to the
  exact surface the user opened. It is not a generic chat, a dead end, or a
  text echo.
- Do not recreate fake/demo contacts, placeholder emails, legacy local preview
  data, or stale fallback screens in production.
- An email excluded from the active Executive Inbox can still be valid
  relationship, project, onboarding, or evidence context. Queue exclusion is
  not deletion.
- `invite.ics` and other calendar invitations never become documents.
- Preserve the approved white-glass drawer visual language. Do not reintroduce
  muddy, heavy, brown, or opaque card treatments.

## Immediate Assignment: Executive Inbox

The user wants Executive Inbox rebuilt cleanly rather than patched around its
old, overlapping workflows. Work inch by inch. Before implementing the visual
design, establish a single canonical queue and verify it with real email data.

Ask this first question after reading the code:

> Please show me one real conversation that absolutely belongs in Executive
> Inbox and one that absolutely does not. I will use those as the first
> admission and exclusion acceptance cases.

Then make the smallest correct implementation step. Do not use generic fake
emails to demonstrate progress.

## Current Executive Inbox Architecture

### Surface

- Drawer markup: `hearth-prototype.html`, `#correspondence-detail` around line
  526.
- Main client behavior: `hearth-prototype.js`, `correspondence*` functions
  around lines 7983-9454.
- Existing visible pieces: queue, selected readable thread, editable private
  draft, relationship/project context, and rules.

### Competing inputs to remove or unify

`hydrateCorrespondenceDrawer()` currently fetches and merges three different
lists in the browser:

1. `/api/val/ready-for-you/build?limit=5`
2. `/api/val/email/review-drafts?limit=20`
3. `/api/email/intelligence?days=30&limit=75`

There is also a non-API local fallback (`localCorrespondenceItems`). This is
the primary source of competing paths and shifting states. The rebuild must
choose one server-side canonical Executive Inbox queue or make the other two
strict, traceable views of that same record. Do not keep a client-side merge as
the source of truth.

### Gmail intake and admission

- Gmail refresh: `POST /api/email/gmail/refresh` in `server.js` around line
  9512.
- Inbox data: `GET /api/email/intelligence` around line 9505.
- Admission logic: `classifyExecutiveEmail()` in `server.js` around line
  10996.
- Existing guardrails exclude read inbound messages, calendar notices,
  automated/system/bulk mail, and repeated inbound-only senders without
  relationship evidence.
- `test/gmailFreshness.test.js` already asserts that read/CC history can still
  inform relationship context without admitting an email into Executive Inbox.

Keep that separation: the active queue is judgment-only; the broader evidence
model remains intact.

### Scoped Co-Work contract

- Client opener: `openCorrespondenceThreadCowork()` around line 9291.
- Entry point: `email.thread` in `services/valCowork.js` around line 2704.
- Open behavior loads the selected durable message/thread and refuses to
  substitute another conversation or draft from a summary alone.
- Reply behavior creates one internal review-only draft, then sends it to
  Leverage for review. It does not send email, create a provider draft, update
  CRM, create a task, alter the email, or mutate an external system.
- Contract coverage: `test/valCowork.test.js`, especially the Executive Inbox
  tests around lines 910 and 1133.

Retain this scope and approval boundary. Improve reliability and return-to-
drawer behavior before adding more Co-Work options.

## Executive Inbox Acceptance Criteria

The finished drawer should satisfy all of these with real account data:

1. It opens quickly into one stable judgment-only queue. Loading state is
   explicit and quiet; it never flashes old, local, or unrelated records first.
2. Selecting a conversation shows the actual readable message/thread at the
   top of the working area, including sender, date, full available text, and
   attachment names. Do not present a label saying an email exists without the
   email itself.
3. The active queue contains only unresolved executive judgments. Read/replied,
   calendar, system, bulk, promotional, and unsupported noise stay out, while
   remaining available as evidence where appropriate.
4. Relationship and project context is attached only when supported by the
   selected source. It must be understandable, not a dump of backend fields.
5. Documents/attachments stay linked to their source and route to the correct
   existing or proposed project. Calendar invite attachments are excluded.
6. Drafting is private preparation. The user can edit and clearly approve the
   exact external send. No ambiguous direct mutation or phantom completion.
7. Co-Work is limited to the selected thread and produces a saved, visible
   private draft/next state. Closing it returns to that thread in Executive
   Inbox, not Home.
8. Rules, if retained, are plain-language behavior the user can understand and
   verify. Do not preserve the existing Rule Learning controls by default;
   validate their value with the user first.

## First Engineering Pass

1. Use the real authenticated browser and the two user-provided acceptance
   emails. Record the exact API responses and rendering path for each.
2. Inventory all writers of Executive Inbox records, drafts, and Ready For You
   registrations. Identify duplicates by durable provider/message/thread ID.
3. Document the chosen canonical record and lifecycle before editing UI:
   source received -> classified -> admitted or excluded -> private draft ->
   user review -> explicit external approval -> receipt.
4. Remove or quarantine the noncanonical fallback path. Do not merely sort the
   three arrays more carefully.
5. Build one narrow vertical slice, test it in the browser, then ask for the
   next user decision before expanding the surface.

## Required Verification

At minimum, after each Inbox slice:

```bash
node --check hearth-prototype.js server.js services/valCowork.js services/valExecutiveInbox.js
node --test test/gmailFreshness.test.js test/valExecutiveInbox.test.js test/valCowork.test.js test/valReadyForYou.test.js test/valDocuments.test.js
git diff --check
```

Also test in the authenticated production browser:

- one admitted message is readable in full;
- one excluded message stays out of the queue but remains evidence-safe;
- one attached document appears correctly and no `.ics` appears as a document;
- one scoped Co-Work turn persists and returns to the same selected thread;
- no external send occurs without the explicit approval action.

## Do Not Do

- Do not start another broad data purge. The user has now created real
  Witnessing/First Look/Stewardship data that is the current test baseline.
- Do not re-enable Project Managers while rebuilding Inbox.
- Do not alter First Look, Krisp intake, or relationship enrichment just because
  Inbox uses the same evidence. Make a targeted interface/service change and
  prove it.
- Do not change production based only on static tests. Browser-visible behavior
  is required for this drawer.
