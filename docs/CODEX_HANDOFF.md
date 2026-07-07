# Codex Handoff: Jessa VAL Clean Dashboard + Partnership Protocol

Last updated: 2026-07-07 10:35 ET

## Current Objective

Prepare `jessa_VAL` for live, click-by-click audit from a clean dashboard.

The user decided to stop trying to preserve the old dense dashboard as the primary Jessa experience. The new Jessa dashboard should start clean and only expose:

- Partnership Protocol / Witnessing Session.
- Transcript upload, including multi-file upload for `.txt`, `.docx`, and legacy `.doc` where possible.
- Lead Intelligence using the existing Jessa organization scraper and partner scraper workflows.

The old dashboard and all underlying scraper behavior must be preserved. The user is especially concerned that the individual client scrapers for Jessa, Mark, Greg, Ed, and Aric must continue functioning exactly as currently programmed for GHL. Michele can remain as-is.

## Current User Feedback State

The user tested the new dashboard and reported:

- They could reach the Witnessing Session and click `Pick Up Where We Left Off`.
- It started from the beginning again.
- Earlier they also saw:
  - Lead Intelligence returned `No leads returned yet` for both scrapers.
  - Transcript files appeared to upload.
  - Partnership Protocol initially took them to the new home page instead of directly into the session.

Latest code pass addressed these items, but the user has not yet re-tested after the final server restart.

## Running App

Repo:

```text
/Users/jessagrace/Documents/Val-Alison/jessa_VAL
```

Local URL:

```text
http://localhost:3000/dashboard
```

Current server process:

```text
npm start
```

At handoff time the server was restarted and is running on port `3000`.

If the new chat needs to restart it:

```bash
cd /Users/jessagrace/Documents/Val-Alison/jessa_VAL
npm start
```

## Files Changed In The Current Pass

Primary new clean dashboard files:

- `/Users/jessagrace/Documents/Val-Alison/jessa_VAL/jessa-clean-dashboard.html`
- `/Users/jessagrace/Documents/Val-Alison/jessa_VAL/jessa-clean-dashboard.css`
- `/Users/jessagrace/Documents/Val-Alison/jessa_VAL/jessa-clean-dashboard.js`

Primary existing files patched:

- `/Users/jessagrace/Documents/Val-Alison/jessa_VAL/server.js`
- `/Users/jessagrace/Documents/Val-Alison/jessa_VAL/hearth-prototype.js`

Asset copied:

- `/Users/jessagrace/Documents/Val-Alison/jessa_VAL/assets/val-favicon.png`

Jessa's completed personal witnessing export exists here:

- `/Users/jessagrace/Documents/Val-Alison/jessa_VAL/data/jessa-real-witnessing-session-2026-07-06.json`

## What Was Implemented

### Clean Dashboard

`/dashboard` now serves `jessa-clean-dashboard.html` after auth.

`/legacy-dashboard` serves the previous `dashboard.html`.

The clean dashboard has three main cards:

- `Partnership Protocol`
- `Upload Transcripts`
- `Lead Intelligence`

The Partnership Protocol button now links to:

```text
./hearth-prototype.html#valWitnessingResume
```

The Hearth prototype checks that hash and attempts to open the Witnessing Session in resume mode.

### Transcript Upload

The clean dashboard upload card posts multiple files to:

```text
POST /api/val/files
```

with:

```text
docType=transcript
uploadedVia=jessa_clean_dashboard_transcript_upload
processTranscript=true
files[]=...
```

`server.js` now has a fallback for legacy `.doc` extraction using `/usr/bin/textutil` when available. `.txt` and `.docx` continue using the existing extraction paths.

### Lead Intelligence

The clean dashboard exposes both scraper modes:

- Organization scraper:
  - Preview endpoint: `/api/val/leads/discover-preview`
  - Import endpoint: `/api/val/leads/import-approved`
- Partner scraper:
  - Preview endpoint: `/api/val/partners/discover-preview`
  - Import endpoint: `/api/val/partners/import-approved`

The UI keeps the preview / approve / import safety gate:

- No CRM import until preview candidates are explicitly approved.
- Held leads are excluded.
- Import button stays disabled until at least one candidate is approved.

Organization defaults were updated away from the prior generic/Frisson-ish values to GOALL/Jessa-appropriate defaults:

```text
Market: Arizona
Lead set: GOALL priority industries
Limit: 25
Criteria: GOALL priority industries with at least 10 employees in Arizona.
```

The empty-state now shows the backend error/content/pipeline warning when no leads return instead of only saying `No leads returned yet`.

### Witnessing Resume Fix

Root cause found:

`Pick Up Where We Left Off` called the resume API, but if no live `teach_val_imports` were found, the frontend fell back to the intro/first question. That made a failed resume look like a deliberate restart.

Frontend fix in `hearth-prototype.js`:

- `valWitnessingResumeTarget()` no longer silently returns `intro` when imports are missing.
- It returns `state: 'paused'` with a clear error message.
- `openValWitnessingSession()` now passes `resumeTarget.witness` into rendering.
- If the last resumed card is the final card, it renders `state: 'complete'` instead of a new question.

Backend fix in `server.js`:

- `getTeachValWitnessingResumeSession()` now considers both `draft` and `committed` sessions, preferring drafts first.
- Added `restoreJessaRealWitnessingSessionBackup()`.
- `/api/teach-val/onboarding/start` with `resumeWitnessing:true` now:
  - tries active/committed witnessing sessions in live store,
  - then restores `/data/jessa-real-witnessing-session-2026-07-06.json` if no live session is found,
  - then returns normal `teachValStateResponse()`.

This should prevent Jessa's completed personal Witnessing Session from being orphaned if it exists only as the export file.

## Verification Already Run

Syntax checks:

```bash
node --check server.js
node --check hearth-prototype.js
node --check jessa-clean-dashboard.js
```

All passed.

Regression tests:

```bash
node --test test/hearthLeadIntelligence.test.js test/leadScraperRegression.test.js test/partnerScraperRegression.test.js test/valTranscriptIntelligence.test.js
```

Result:

```text
63/63 passing
```

Also checked:

```bash
curl -I http://localhost:3000/hearth-prototype.html
```

Returned `200 OK`.

## Must-Test First In Fresh Chat

Start here. Do not drift into new features before these are confirmed.

1. Hard refresh:

```text
http://localhost:3000/dashboard
```

2. Click `Partnership Protocol`.

Expected:

- It opens the Hearth prototype / Witnessing Session path.
- It does not strand the user on the generic home page.

3. Click `Pick Up Where We Left Off`.

Expected:

- It should not start at Question 1 unless there is truly no saved/restored session for the current login.
- If the Jessa completed backup is restored, it should land on the completed Partnership Promise state.
- If no saved session is found, it should pause and say saved witnessing answers could not be found instead of restarting silently.

4. Test transcript upload:

- Upload multiple `.txt` and `.docx` files.
- If possible, test one `.doc` file.

Expected:

- Upload succeeds or gives a specific extraction error.
- User gets a clear receipt.
- Transcript intelligence should process them as transcript context.

5. Test Lead Intelligence:

- Run organization scraper preview.
- Run partner scraper preview.
- If no leads return, inspect the visible backend message, not only the empty state.
- Do not click import unless the user explicitly approves a live CRM import.

Expected:

- Preview returns candidates or useful backend explanation.
- Approval gate works.
- Import remains review-gated.

## Important Product Constraints

These are not style preferences. Treat them as product requirements.

- VAL is philosophy-forward, not feature-forward.
- VAL must never sound canned.
- VAL must not silently restart an emotionally significant process.
- The Witnessing Session is not onboarding. It is the beginning of the partnership.
- VAL witnesses before it advises.
- VAL should feel nurturing, comforting, uplifting, and grateful to be part of the process.
- VAL should only share observations that help it support the user's vision, mission, tone of voice, relationships, capacity, decisions, calendar, drafts, or protection boundaries.
- If an observation does not help VAL serve the user, leave it unsaid.
- Omissions are not evidence by themselves.
- Avoid mean/judgmental analysis. No psychoanalyzing. No “catching” the user.
- No generic AI phrasing anywhere:
  - no `I hope this finds you well`
  - no em-dash-heavy AI voice
  - no canned reassurance
  - no repeated witness templates

## Critical Safety Constraints

- Do not remove or rewrite the existing organization and partner scraper logic.
- Do not change GHL import destinations casually.
- Do not add Make.com handoff back into the social/LinkedIn workflow; user said it is not needed.
- Do not import scraper results to GHL without explicit preview approval.
- Do not publish, comment, like, DM, email, calendar-create, CRM-write, or memory-promote without an explicit review/approval gate.
- LinkedIn automation boundary:
  - LinkedIn posting/comments should be copy/paste or approval-gated.
  - LinkedIn Support Circle is front and center.
  - Support Circle members require only name + LinkedIn profile URL.

## Known Dirty Worktree

The repo has a large dirty state, including many pre-existing files and untracked service/test additions. Do not assume all changes are from this chat. Do not revert unrelated work.

At handoff time `git status --short` showed modified core files and many untracked files, including:

- `.gitignore`
- `VAL_USER_GUIDE.md`
- `command-center.css`
- `command-center.js`
- `dashboard.html`
- `server.js`
- many tests
- `hearth-prototype.*`
- `jessa-clean-dashboard.*`
- many `services/val*` files

Use targeted diffs. Do not run destructive git commands.

## Next Engineering Moves

1. Verify the resume fix live in the browser.
2. If resume still starts at the beginning, inspect:
   - `POST /api/teach-val/onboarding/start`
   - request body includes `resumeWitnessing:true`
   - response includes `imports` with `witness_%` categories
   - whether restored backup inserted into the same tenant/user used by the logged-in session
3. If the completed backup restores but the UI lands awkwardly, adjust only the completed-state rendering in `hearth-prototype.js`.
4. Verify transcript upload results are visible in the dashboard or add a simple uploaded-transcripts receipt/list if not.
5. Verify scraper preview payloads and backend responses before touching scraper internals.
6. After Jessa dashboard is good, apply the same clean-dashboard pattern to Mark, Greg, Ed, and Aric. Michele stays as-is.

## Commands To Re-run

```bash
cd /Users/jessagrace/Documents/Val-Alison/jessa_VAL
node --check server.js
node --check hearth-prototype.js
node --check jessa-clean-dashboard.js
node --test test/hearthLeadIntelligence.test.js test/leadScraperRegression.test.js test/partnerScraperRegression.test.js test/valTranscriptIntelligence.test.js
npm start
```

