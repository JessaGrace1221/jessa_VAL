# Jessa VAL Deployed Baseline

Date: 2026-07-24  
Baseline purpose: hold the approved Hearth / Board / chat / voice / integrity state before visual QA and tenant-dashboard rollout.

## Baseline Anchors

- Morning comparison commit: `ea8c855`
- Verified code checkpoint before baseline note: `ed37bc16dd59df3f96f641e8d2e517892987e967`
- Production deployment verified from that checkpoint: `88c0950b-9058-4470-bf33-df497197888a`
- Production URL: `https://jessaval-production.up.railway.app`
- Branch: `codex/home-page-ui-clean`

## Verification

Command:

```sh
node --test
```

Result:

- 511 tests
- 511 passing
- 0 failing

Production smoke checks:

- Root URL returned `HTTP 200`.
- `hearth-prototype.html?v=baseline-ed37bc1` returned the live Hearth HTML.
- Railway reported service `jessa_VAL` online after deployment `88c0950b-9058-4470-bf33-df497197888a`.

## What Changed Since `ea8c855`

- Hearth/Home visual system and function surfaces preserved as the approved sage-green / dusty-rose philosophy.
- Board of Observers now has live packet context instead of vague visual-only promises.
- Every live Board packet is routed to every Observer, with each Observer reviewing it through its own lens.
- Board source readiness distinguishes live sources from pending source families so VAL cannot overclaim.
- Home VAL is confirmed as the broad Chief of Staff lane.
- Function-specific chats remain scoped to their function context.
- GHL Voice support was shaped around VAL voice handoff, Vesta preference, and GHL custom action flow.
- Rolodex/contact resolution now supports Stewardship email and phone details in GHL-readable form.
- Krisp / Chrome self-captures from VAL voice sessions are filtered out of transcript intake.
- Transcript list/detail behavior keeps the index lightweight while preserving source transcript truth in the detail route.
- AI-usable context compaction was added:
  - default compaction window is every 3 days;
  - compacted records are saved as `ai_context_digest`;
  - original source receipts are retained;
  - Board packets are included;
  - digest records keep `sourceIds` for traceability.
- System-wide integrity audit was updated to match the green test state.

## Tomorrow Morning Visual QA

Primary pages to visually check before cloning to other dashboards:

1. Login page.
2. Hearth/Home.
3. Open Executive Functions / compass.
4. Board of Observers with `witnessed=true&stress=orbs`.
5. Home VAL chat.
6. Voice wrapper / GHL Voice launch.
7. Executive Inbox.
8. Calendar.
9. LinkedIn Posts and Instructions.
10. Transcripts.
11. Stewardship.
12. Project Managers.
13. Lead Intelligence.

## Integrity Boundary To Preserve

Safe promise:

> VAL's core functions are source-scoped, review-first, and approval-gated. Home VAL is the broad Chief of Staff lane. The Board of Observers receives live packet telemetry for registered live source families, and every Board Observer reviews every live packet through its own lens.

Do not promise yet:

> Every future source family is Board-live forever.

Any new source or external action is not baseline-complete until it has:

1. A source receipt or durable record.
2. A Board packet hook when it should be visible to the Board.
3. Source references on any digest or observer review.
4. A review/approval gate for external actions.
5. A regression test.

