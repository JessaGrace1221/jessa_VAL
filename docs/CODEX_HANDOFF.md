# Jessa VAL Handoff: Clean Baseline Freeze

Updated: 2026-07-23

## Start Here

This is the canonical Jessa VAL source:

```text
Repository: /Users/jessagrace/Documents/Val-Alison/jessa_VAL-clean-baseline
Branch: codex/clean-baseline
Production: https://jessaval-production.up.railway.app
Railway project: a0402328-e877-406d-8f89-32bd6acdfd19
Railway service: df0839e1-880b-4aa6-8def-56170f4cc980
```

Do not use `/Users/jessagrace/Documents/VAL drawer - Correspondence`.

Read, in order:

1. `docs/CODEX_CURRENT_STATE.md`
2. `docs/NEXT_TASK.md`
3. `docs/VAL_DASHBOARD_CLONE_READINESS.md`
4. `docs/VAL_COWORK_SYSTEM_WIDE_CARRY_FORWARD_CONTRACT.md`
5. `docs/VAL_TRANSCRIPT_ACTION_CAPABILITY_AND_WORKFLOW_REGISTRY.md`
6. `docs/VAL_ACTION_ORCHESTRATOR_RUNTIME.md`

## What Was Completed

The accumulated Hearth work is one tested system, not a collection of visual
prototypes. Executive Inbox, Project Managers, Stewardship, Transcripts, Lead
Intelligence, VAL/Witnessing, Home, LinkedIn engagement, Meeting Prep,
Observers, Chief of Staff, task visibility, Co-Work, and external-action
orchestration are connected to durable backend contracts.

Transcript intake now has two paths into the same processor:

```text
Krisp webhook -> save exact receipt -> process transcript intelligence
Scheduled recovery -> find exact receipt -> process/recover pending intelligence
```

Exact Krisp titles, dates, Action Items, and Key Points remain source truth.
Webhook requests require the private transcript token. Polling is recovery, not
the primary conceptual path.

Co-Work and completed actions carry source-grounded results forward to exact
linked relationships, projects, packets, Observers, Round Table, Chief of
Staff, tasks, and Leverage where appropriate. External execution remains
review-gated and idempotent.

## Clone Safety

Jessa owner emails and known-contact aliases are no longer embedded in shared
runtime files. They are tenant configuration. The regression
`test/cloneIsolationRegression.test.js` protects this boundary.

Never copy:

- the production database;
- local `data/`;
- OAuth/provider tokens;
- API keys;
- encryption or session secrets;
- GHL location/account identifiers;
- transcript webhook tokens;
- Jessa relationship aliases or user records.

Use `docs/VAL_DASHBOARD_CLONE_READINESS.md` for every new dashboard.

## Last Verification

```text
Full Node test suite: 571 passed, 0 failed
Syntax checks: passed
git diff --check: passed
runtime secret-pattern scan: passed
clone identity regression: passed
```

## Product Rules

- Sources remain exact receipts; VAL's interpretation is separate.
- Nothing external happens without review and final approval.
- Every external result receives a provider receipt and reconciliation.
- Co-Work must be scoped, durable, useful, and return to its opening context.
- Do not expose packet/round-table machinery as backend data in the UI.
- Do not fabricate missing context.
- Preserve the six drawers and approved Hearth visual philosophy.
- OpenAI is the non-negotiable entry connection for every client VAL.

## Next Assignment

The next work is client rollout, not another Jessa-wide redesign. Ask which VAL
is next and which features should be Coming Soon, then execute the isolated
clone checklist. Do not deploy another client from Jessa's database or current
Railway environment.
