# Grace Fit Engine Launch Repair

This branch preserves the production baseline audited November 6, 2026 and the focused Grace Intelligence repair. The original main worktree was not modified.

Baseline: deployment `ecf8aca2-0b96-4b6d-8fff-acc1b72c0afa`, source SHA-256 `22c610b0b569495525132b92601ee965aa6d842cfc4160e8894c4794537c4411`. The baseline is captured by commit `30ee92b`.

The repair adds evidence-based decision-maker, contact, dual-fit, financial and gifted-packet checks; supported CRM option mapping; verified evidence-note storage; a ten-primary-lead provider budget; staged research with provider fallback; and asynchronous preview support in Hearth.

`GI Review Status` is a dedicated text contact field. Existing audit progress is not reused for qualification. Imports always retain `GI Approved To Contact = No`. Demo packets and explicit `doNotImport` requests cannot import. The repair does not publish workflows or send messages.

For slow previews, POST `/api/grace/fit-engine/discover-preview` with `async: true`. It returns a job ID. Read `/api/grace/fit-engine/preview-jobs/:jobId` under the same signed-in user until complete. Identical active requests reuse a job. Jobs are in process memory, expire two hours after completion, and do not survive a service restart. An unavailable run returns an explicit 404 rather than a successful empty preview.

Run focused verification with:

```sh
node --check server.js
node --check hearth-prototype.js
node --test test/graceFitEngine.test.js test/graceLaunchReadinessBehavior.test.js test/leadContactValidation.test.js test/frissonConvergenceAssessment.test.js test/frissonScraperRegression.test.js
```

The CRM contract integration case uses saved LRT definitions when `GRACE_LRT_EVIDENCE_DIR` is set, and otherwise reports a skip. Provider and CRM credentials are not stored in this branch.

Release verification must include a live gifted packet and workflow graph review. The GHL definition API is currently unavailable for the destination account. An app health check or passing local tests cannot establish outbound delivery readiness.

The complete audit, provider responses, email drafts, test outputs and release archives are in `/Users/jessagrace/Documents/Codex/2026-09-29/my/outputs/grace-lrt-2026-11-06/`. Railway now tracks `grace-lrt-repair-20261106` to preserve the audited fixes. Merge the repair before switching production back to the old main branch. The original main worktree retains the owner's unfinished work.
