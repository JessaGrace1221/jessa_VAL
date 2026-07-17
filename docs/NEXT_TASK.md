# Next Task: Rebuild Executive Inbox From One Source Of Truth

## Goal

Give the executive one stable, readable place for only the email conversations
that require judgment. It must feel trustworthy because the selected thread is
real, the reason it is visible is clear, the related context is evidenced, and
every external action remains review-gated.

This is a clean implementation pass, not another layer over legacy behavior.

## First Conversation With The User

Ask for two real examples before deciding the new admission UI:

1. One email/thread that must appear in Executive Inbox, and why.
2. One email/thread that must remain out of Executive Inbox, and why.

Use those exact examples as browser and automated acceptance cases. The user
has asked for clarification where behavior is vague; do not invent a generic
executive workflow instead of checking.

## Start By Mapping, Not Editing

Read `docs/CODEX_HANDOFF.md`, then trace these current paths:

```text
hearth-prototype.html
  #correspondence-detail around line 526

hearth-prototype.js
  correspondence* functions around lines 7983-9454
  hydrateCorrespondenceDrawer()
  scanCorrespondenceWindow()
  openCorrespondenceThreadCowork()

server.js
  GET /api/email/intelligence around line 9505
  POST /api/email/gmail/refresh around line 9512
  classifyExecutiveEmail() around line 10996

services/valCowork.js
  email.thread entry point around line 2704
  openEmailThreadEntry()
  respondEmailThread()
```

Current problem: the client merges Ready For You, review drafts, and email
intelligence, with a local fallback when the API is unavailable. Decide the
single canonical persisted Inbox record and make all other surfaces read it.
Do not retain three independent lists plus browser deduplication as the live
truth.

## Required Outcome

### Queue

- Only unresolved conversations requiring a decision, reply, review, or
  explicitly approved routing appear.
- Read/replied/resolved conversations, calendar notices, system notices,
  newsletters, promotions, bulk mail, and repeated inbound-only noise stay out
  of the queue.
- Exclusion means "not an active Inbox item," never "discard the evidence."
- Loading presents one calm, stable state. It must not flash old local content
  before current results appear.

### Selected thread

- The selected thread is visible at the top of the detail area without an
  unnecessary scroll.
- Show actual readable email content, sender, date, available thread messages,
  and attachment names.
- Show a short, source-backed explanation of why it needs executive judgment.
- Relationship/project context stays narrow to the selected thread and is
  understandable in executive language.

### Documents

- Attachments remain tied to their email source.
- Documents route to their existing or proposed project; calendar `.ics`
  attachments are excluded.
- Do not create a generic file-list experience as a substitute for useful
  context.

### Draft and action

- VAL can prepare one private draft that the user can edit.
- A visible approval action is required before an email is sent.
- The drawer must give an unambiguous receipt of what happened and where the
  prepared work is visible.
- No direct mutation, external send, or provider draft is implied by a
  classification or Co-Work turn.

### Co-Work

- Opens only with the selected durable thread, never a generic inbox context.
- Uses `email.thread`; refuses to substitute another conversation or draft
  from a summary alone.
- Knows the exact purpose: establish the reply outcome, then prepare one
  private draft for Leverage review.
- Shows "Gathering context" while the packet loads.
- Returns to the same selected Inbox thread after closing or saving.

## Suggested Implementation Sequence

1. Capture API payloads for the two real acceptance emails.
2. Write/update the canonical Executive Inbox lifecycle and schema document.
3. Consolidate server-side queue construction and retire/quarantine legacy
   client fallback/merge paths.
4. Make the selected-thread path reliable and browser-test it before changing
   drafts, rules, or layout.
5. Wire private draft, approval, and receipt behavior through the canonical
   record.
6. Validate scoped Co-Work persistence and return behavior.
7. Revisit whether rules belong in the first executive surface only after the
   core queue works; do not preserve the current Rule Learning bar by habit.

Stop after each vertical slice for a browser-visible check. The user wants this
done inch by inch, with questions whenever a behavior choice would otherwise be
ambiguous or confusing to an executive.

## Tests And Browser Checks

```bash
node --check hearth-prototype.js server.js services/valCowork.js services/valExecutiveInbox.js
node --test test/gmailFreshness.test.js test/valExecutiveInbox.test.js test/valCowork.test.js test/valReadyForYou.test.js test/valDocuments.test.js
git diff --check
```

Browser validation must include:

- admitted thread is readable in full at the top;
- excluded thread is absent from active queue but has not been erased as
  evidence;
- attachment is visible and `.ics` is not a document;
- private draft stays private until an explicit approval/send action;
- scoped Co-Work saves and returns to the selected thread;
- no stale/demo/local fallback content flashes during load.

## Guardrails While Working

- Do not reactivate Project Managers.
- Do not broaden First Look, Krisp, Lead Intelligence, or stewardship
  enrichment as an incidental fix.
- Preserve exact Krisp material.
- Preserve the six-drawer order and white-glass visual system.
- Use the active authenticated browser for final behavioral claims; static tests
  alone are insufficient.
