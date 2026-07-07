# Current State: Jessa VAL

Updated: 2026-07-07 10:35 ET

## Current Working State

`jessa_VAL` is being converted to a clean dashboard that keeps only the first necessary live-test surfaces:

- Partnership Protocol / Witnessing Session.
- Transcript upload.
- Lead Intelligence with existing organization and partner scrapers.

The old dashboard is preserved at:

```text
/legacy-dashboard
```

The new clean dashboard is served at:

```text
/dashboard
```

## Running Server

At handoff time:

```text
npm start
VAL proxy running on port 3000
```

URL:

```text
http://localhost:3000/dashboard
```

## Most Recent Issue

User clicked `Pick Up Where We Left Off` and it restarted the Witnessing Session from the beginning.

Fix implemented:

- Frontend no longer treats missing resume data as intro.
- Backend now restores the completed Jessa witnessing export if no live session is found.

Needs live browser re-test.

## Important Files

- `server.js`
- `hearth-prototype.html`
- `hearth-prototype.css`
- `hearth-prototype.js`
- `jessa-clean-dashboard.html`
- `jessa-clean-dashboard.css`
- `jessa-clean-dashboard.js`
- `data/jessa-real-witnessing-session-2026-07-06.json`

## Current Verification

Passed:

```bash
node --check server.js
node --check hearth-prototype.js
node --check jessa-clean-dashboard.js
node --test test/hearthLeadIntelligence.test.js test/leadScraperRegression.test.js test/partnerScraperRegression.test.js test/valTranscriptIntelligence.test.js
```

Result: `63/63` relevant tests passing.

## Product North Star

VAL is not a generic AI dashboard. For Jessa, this build must feel like:

- witnessed,
- calm,
- clean,
- context-rich,
- review-gated,
- non-canned,
- and trustworthy enough to hand off to other client dashboards later.

