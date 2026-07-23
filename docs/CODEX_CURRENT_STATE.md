# Current State: Jessa VAL Clean Baseline

Updated: 2026-07-23

## Deployment Truth

```text
Repository: /Users/jessagrace/Documents/Val-Alison/jessa_VAL-clean-baseline
Branch: codex/clean-baseline
Production: https://jessaval-production.up.railway.app
Railway project: a0402328-e877-406d-8f89-32bd6acdfd19
Railway service: df0839e1-880b-4aa6-8def-56170f4cc980
```

This branch is the complete Jessa baseline. Do not work from
`/Users/jessagrace/Documents/VAL drawer - Correspondence`.

## Product Shape

The six user-facing drawers are:

1. Executive Inbox
2. Project Managers
3. Stewardship
4. Transcripts
5. Lead Intelligence
6. VAL

Documents and Commitments are internal evidence/action domains. Alignment and
Leverage remain the two Home work cards. The task list, calendar, LinkedIn
engagement, Observers, Chief of Staff, and Co-Work are connected support
surfaces.

## Working System

- Executive Inbox is a judgment-only queue with readable source messages,
  private drafts, explicit send approval, relationship/project mapping, rules,
  and thread-scoped Co-Work.
- Project Managers is an interview-led command room. The Project Interview
  populates the project; unresolved items are one concise list; tasks preserve
  source and prepared-work continuation.
- Stewardship persists people, LinkedIn URLs, relationship evidence, scoped
  Co-Work, and introduction context.
- Transcripts preserve exact Krisp titles, dates, Action Items, Key Points,
  attendees, source text, project/relationship mapping, task creation, and
  reviewed attendee follow-up.
- Transcript polling covers 30/90-day recovery. New webhook receipts enter the
  same transcript-intelligence path, and pending receipts can be recovered
  without opening the drawer.
- LinkedIn engagement uses Stewardship LinkedIn URLs, verified person matching,
  comment-style rules, and reviewed manual posting.
- Meeting Prep uses the selected calendar event and exact internal evidence,
  with external research kept source-grounded.
- Co-Work carries durable scoped context into linked relationships, projects,
  packets, Observers, Round Table, and Chief of Staff.
- External actions use one-action review packets, final confirmation,
  idempotency, provider receipts, and reconciliation.
- Gmail/Outlook email and calendar provider policies prefer the connected
  first-party provider. GHL remains the CRM/SMS delivery system, not VAL's
  intelligence layer.
- Research, introductions, work-product preparation, and engineering briefs
  preserve source lineage and route prepared work into Leverage.

## Clone Isolation

Shared runtime files contain no Jessa owner identity. Owner email detection and
known relationship aliases come from tenant configuration. Every client
dashboard requires a new service, database, credentials, OAuth connections,
webhook token, encryption/session secrets, and empty data state.

Follow `docs/VAL_DASHBOARD_CLONE_READINESS.md`. Never copy Jessa's database,
`data/`, provider tokens, API keys, relationship aliases, or OAuth state.

## Non-Negotiables

1. Preserve source receipts separately from VAL's judgment.
2. Never fabricate people, dates, titles, attendees, public facts, or actions.
3. No external action without visible review and explicit final approval.
4. Every completed action receives a provider receipt and carries forward to
   every exact linked context.
5. Co-Work remains scoped, durable, conversational, and returns to its source.
6. Use plain executive language; keep packets and diagnostics behind the scenes.
7. Preserve the approved white/frosted-glass, sage, and rose Hearth system.
8. A client with no OpenAI key sees only the required connection gate.

## Verification

On 2026-07-23:

```text
node --test
571 tests passed
0 failed
git diff --check passed
runtime secret-pattern scan passed
clone identity regression passed
```
