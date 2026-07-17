# Current State: Jessa VAL Clean Baseline

Updated: 2026-07-17

## Deployment Truth

```text
Repository: /Users/jessagrace/Documents/Val-Alison/jessa_VAL-clean-baseline
Branch: codex/clean-baseline
Production: https://jessaval-production.up.railway.app
Railway project: a0402328-e877-406d-8f89-32bd6acdfd19
Railway service: df0839e1-880b-4aa6-8def-56170f4cc980
Verified deployment: 01f42fec-81f1-488a-8fa7-57939a86453b
Verified health: HTTP 200 on 2026-07-17
```

Production behavior and the current clean-baseline branch are the truth. Older
July 10-12 baseline language and abandoned demo/fallback assumptions are
superseded.

## Product Shape

The user sees six drawers in this order:

1. Executive Inbox
2. Project Managers
3. Stewardship
4. Transcripts
5. Lead Intelligence
6. VAL

Documents and Commitments remain internal system domains. They should surface
through their meaningful contexts, including Executive Inbox, Project Managers,
Leverage, Transcripts, and Stewardship, rather than as independent drawers.

## Working Capabilities

### VAL and First Look

- The Witnessing Session is the start of a clean user journey. It gathers the
  user's own meaning, source connections, and explicit relationship/project
  routing instructions before creating operational objects.
- Google, OpenAI, and Krisp connections have been integrated into that journey.
- First Look scans approved sources as review-only evidence, then prepares
  bounded proposal packets. It does not silently create relationships,
  projects, tasks, drafts, or memory.
- The proposal-map build is split into bounded OpenAI packets with saved
  progress to avoid one giant response exceeding output limits.

### Stewardship

- Network admission has a sent-mail-first route: an address-backed person with
  more than three sent messages can become a relationship candidate.
- Users can add a person manually and import relationships via CSV.
- The Network supports individual saved public-context enrichment and an
  explicit bulk "Refresh all public context" action. It does not automatically
  re-run enrichment every time a profile opens.
- Relationship cards (Needs, Offers, Relationship, Evidence) are scoped
  Co-Work targets. A direct user answer saves to that same card and is rendered
  immediately after the chat closes.
- Progress is visible while public context is being gathered.

### Source integrity

- Every source must retain its own receipt and be distinct from VAL's
  interpretation.
- Krisp transcript Action Items and Key Points are copied word for word; VAL
  must never restyle them as original source material.
- Email and Drive attachments are document evidence. `invite.ics` is never a
  document.
- A document arriving in VAL must be connected to an existing project or
  proposed for a new one; project suggestions require document evidence and an
  admitted relationship/project owner.

### Co-Work

- A Co-Work session is scoped to a precise drawer, object, and section.
- It must show a useful context-gathering state while it prepares a source
  packet.
- It must save only the bounded result it describes and return to the same
  working context. It must never drop the user back to Home or silently lose a
  completed response.
- It never performs external actions without an explicit approval flow.

## Deferred Or Restricted Areas

- Executive Inbox is the next clean rebuild. Its old browser-side merge and
  overlapping workflows must be consolidated, not cosmetically patched.
- Project Managers is intentionally unavailable/Coming Soon while its later
  dedicated pass is deferred. Do not revive it as incidental work.
- Lead Intelligence works functionally and has no Co-Work requirement in this
  phase. Its visual polish can wait.
- Transcript and Krisp behavior has been substantially improved, but future
  work must preserve the exact-source contract before expanding features.

## Non-Negotiable Safety Rules

1. Executive Inbox is a judgment queue, not a copy of Gmail. Read or resolved
   mail stays out of the active queue but can still be source evidence.
2. Never leak system mail, bulk campaigns, generic role mailboxes, telephone
   fragments, or fabricated contacts into Network or Executive Inbox.
3. No fake/demo state is allowed in production.
4. No external send, provider draft, task, calendar update, CRM write, or file
   mutation occurs without a visible review/approval boundary.
5. User-facing language is plain and useful. Packets, round tables, and
   diagnostic internals belong behind the scenes.
6. Maintain the approved white-glass visual system; do not make drawers muddy,
   heavy, or opaque.

## Last Verified Local Test Commands

The most recent Stewardship changes passed:

```bash
node --check hearth-prototype.js
git diff --check
node --test test/relationshipReviewRegression.test.js test/hearthLeadIntelligence.test.js test/valCowork.test.js test/valMeetingPrep.test.js
node --test test/hearthLeadIntelligence.test.js test/relationshipReviewRegression.test.js
```

Use targeted tests for the next drawer as well as browser-visible production
validation.
