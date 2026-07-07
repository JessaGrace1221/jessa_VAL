# Next Task: Verify Jessa Clean Dashboard Live

Start here in the next chat.

Repo:

```text
/Users/jessagrace/Documents/Val-Alison/jessa_VAL
```

Live local URL:

```text
http://localhost:3000/dashboard
```

## Immediate Goal

Confirm the new clean Jessa dashboard works live:

1. Partnership Protocol resumes correctly.
2. Transcript upload works for multiple files.
3. Lead Intelligence preview works for both organization and partner scrapers without breaking existing GHL-safe gates.

## First Test

Hard refresh:

```text
http://localhost:3000/dashboard
```

Click:

```text
Partnership Protocol
```

Then click:

```text
Pick Up Where We Left Off
```

Expected:

- It should not silently restart at Question 1.
- It should resume live witnessing progress or restore Jessa's completed personal witnessing export.
- If it cannot find saved witnessing data, it should pause with a clear message instead of pretending the beginning is the resumed state.

## What Was Just Fixed

- `/dashboard` serves `jessa-clean-dashboard.html`.
- `/legacy-dashboard` serves the old `dashboard.html`.
- Partnership Protocol links to `./hearth-prototype.html#valWitnessingResume`.
- Hearth prototype opens Witnessing Session resume mode from that hash.
- Resume no longer silently falls back to intro when no imports are found.
- Backend can restore Jessa's completed witnessing export:

```text
/Users/jessagrace/Documents/Val-Alison/jessa_VAL/data/jessa-real-witnessing-session-2026-07-06.json
```

## Verification Already Done

```bash
node --check server.js
node --check hearth-prototype.js
node --check jessa-clean-dashboard.js
node --test test/hearthLeadIntelligence.test.js test/leadScraperRegression.test.js test/partnerScraperRegression.test.js test/valTranscriptIntelligence.test.js
```

All passed. Regression result: `63/63`.

## Do Not Do

- Do not rewrite the existing scrapers.
- Do not remove the old dashboard.
- Do not import leads into GHL without user approval.
- Do not make Witnessing Session use canned responses.
- Do not let `Pick Up Where We Left Off` restart silently.

