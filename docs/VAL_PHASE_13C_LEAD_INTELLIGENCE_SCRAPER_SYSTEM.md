# VAL Phase 13C.8 - Lead Intelligence Scraper System

VAL scrapers are not a background utility.

They are one of VAL's highest-value engines for creating new opportunity.

The user-facing system is called Lead Intelligence.

The internal capability may still be called scrapers.

Launch regression gate:

- [VAL_PHASE_13C_SCRAPER_LAUNCH_REGRESSION_GATE.md](./VAL_PHASE_13C_SCRAPER_LAUNCH_REGRESSION_GATE.md)

## Purpose

Lead Intelligence exists to let the user intentionally initiate client-specific lead scrapes, review the qualified preview, and place approved records into GHL / CRM without making the user manage scraping software.

It should feel like VAL has already prepared a refined opportunity file.

Not:

> Here are scraped leads.

But:

> Tell me what to look for. I will run the scrape, prepare a review set, and only add approved records to GHL.

## Constitutional Rule

VAL should never confuse lead volume with opportunity quality.

Lead Intelligence earns trust by filtering, enriching, and restraining.

More scraped records is not the achievement.

Better prepared opportunities are the achievement.

## Client-Specific Scraper Sets

Every VAL may contain one or more client-specific scraper sets.

Example:

```text
jessa_val
```

Initial lead intelligence drawers:

- Organizations / Non-Profits
- Partners

Each client may define its own lead categories, source mix, qualification criteria, CRM pipeline, tags, and approval rules.

## The Lead Intelligence Pipeline

Lead Intelligence follows this order:

```text
Open Scraper
↓
Criteria
↓
Source Scan
↓
Qualification
↓
Enrichment
↓
Preview
↓
User Approval
↓
GHL / CRM Handoff
```

The scraper does not end when a URL is found.

It ends when the user has reviewed the preview and chosen whether approved leads should be pushed to GHL.

## Original VAL Behavior To Preserve

The original `jessa_VAL` and `Mark_GOALL_VAL` implementations expose scrapers as intentional workflows:

- Scrape Employers
- Scrape Partners

Employer scrapes are guided:

```text
Business type
↓
Minimum employee count
↓
Number of businesses
↓
Market
↓
Run preview
↓
Approve import
```

Partner scrapes are structured:

```text
Partner type
↓
Geographic market
↓
Prospect count
↓
Run partner scrape
↓
Review sortable preview
↓
Select approved partners
↓
Push approved partners to CRM
```

This behavior should remain intact.

The new UI should make it feel more elite, calm, and executive, but it should not turn scrapers into passive status cards.

Before this UI ships to existing VAL users, each active scraper must pass the scraper launch regression gate.

## Active Scraper Contract

The current `val-core` scraper implementation adds important production behavior that must be preserved:

- GOALL can auto-run a configured mixed priority-industry batch.
- Production batches may request up to 200 leads.
- Broad GOALL batches are one focused batch, not the entire pipeline.
- The user can import and then find the next batch.
- Level 1 business discovery runs first.
- Live GHL duplicate checking happens before enrichment spend.
- Level 2 enrichment may attach company and decision-maker context.
- Level 3 verification is optional/deferred for broad batches.
- Level 3 verification runs in chunks of up to 25 leads.
- Gateway and timeout failures should not destroy the whole preview.
- Import re-checks duplicates before writing to GHL.
- Duplicate contacts are skipped or repaired instead of duplicated.
- Employer paths must apply the Employer / GOALL Lead / Limitless Leads tagging contract.
- Partner paths must remain locked to the strategic partner pipeline and stage.

This means the UI must distinguish these states clearly:

```text
Ready to run
↓
Running discovery
↓
Preview ready
↓
Optional Level 3 verification
↓
Import approval
↓
Import complete
↓
Next batch available
```

The user should always know which state they are in.

No screen should imply that a lead has entered GHL before approval and import have actually completed.

## What Users Should See

The supporting surface should show:

- Which scraper can be opened
- What criteria the user can set
- Existing scraper defaults before the user runs anything
- CRM / GHL destination before preview
- Which sources and CRM connection will be used
- That preview happens before import
- Whether this is a focused scrape or a configured batch
- Whether Level 3 verification is deferred, running, complete, or still available
- Which leads were found after the scrape runs
- A reviewable list of found contacts / organizations
- Company or organization name
- Location or market
- Industry / partner type / organization type
- Fit score or lead score
- Contactability status
- Decision maker when known
- Website or source link when available
- Evidence or reason for fit
- Which leads are approved or held back
- A visible approved / held summary before import
- An import action that names how many approved records will be imported
- Which records were cleanly added to GHL after approval
- What failed, duplicated, or needed repair

The surface may show counts because this is an explicit CRM / lead intelligence operating area, not the Home Hearth.

Those counts must remain subordinate to meaning.

The preview list is not dashboard clutter.

It is the trust surface.

Users need to see enough concrete detail to believe VAL actually found real opportunities and to make an informed approval decision.

Each preview row should make the approval decision plain:

- Approve
- Hold

The default may be approved when the scraper confidence is high enough, but the user must be able to hold a lead back before import.

The import action should update from the current approval state.

Example:

```text
2 approved / 1 held
Import 2 approved leads
```

If no leads are approved, import should be unavailable.

The setup screen should be equally clear.

Before running a scrape, the user should see:

- lead set or scraper type
- market
- preview count / batch size
- qualification criteria
- destination pipeline or CRM account
- source readiness
- whether Level 3 verification is deferred or active

This lets the user trust where the scrape is going before VAL starts.

## What Users Should Not See First

Lead Intelligence should not lead with:

- Raw scrape logs
- Technical job names
- URL tables
- Unqualified lists
- Error dumps
- Volume charts
- "More leads" as a success signal
- Statements implying records were added before approval

Technical details belong behind Developer or an inspection view.

## GHL / CRM Handoff

Lead Intelligence should make GHL cleaner, not noisier.

Before adding a record to GHL, VAL should resolve:

- Lead category
- Organization or person identity
- Contact details confidence
- Source provenance
- Tags
- Pipeline and stage
- Relationship path, if known
- Next recommended action
- Whether approval is required

Approval is required before importing discovered leads unless the user has created a narrow, explicit authorization policy for that exact scraper, destination, and record type.

VAL should avoid creating scraped-only CRM records when confidence is weak or fit is unsupported.

## User Actions

Preferred action language:

- Start organization scrape
- Run partner scrape
- Run preview
- Run Level 3 verification
- Review qualified leads
- Open GHL pipeline
- Inspect sync
- Tune criteria
- Hold this lead
- Add to GHL
- Push approved leads to CRM
- Import and find next batch
- Mark as not a fit
- Teach VAL why

Avoid:

- Run scraper job
- View rows
- Import batch
- Export CSV

Those may exist in admin tools, but they are not the primary experience.

## Output Contract

Each scraper set should produce:

```json
{
  "client_id": "jessa_val",
  "scraper_id": "organizations_nonprofits",
  "user_label": "Organizations / Non-Profits",
  "purpose": "Find qualified organizations and non-profits that match the client's ideal opportunity profile.",
  "run_state": "ready",
  "requires_user_initiation": true,
  "requires_import_approval": true,
  "criteria_fields": ["organization_type", "minimum_size", "market", "result_count"],
  "source_mix": ["Outscraper", "Apollo", "public_web", "GHL"],
  "preview": {
    "qualified_ready_count": 0,
    "needs_review_count": 0,
    "held_back_count": 0,
    "signal_quality": "not_run"
  },
  "primary_story": "This scraper is ready. Choose criteria, run the preview, then approve what should enter GHL.",
  "recommended_action": "Start organization scrape",
  "ghl_sync": {
    "status": "not_started",
    "pipeline": "Organizations",
    "tags_applied": ["lead_intelligence", "organization", "nonprofit"],
    "audit_record_created": false
  }
}
```

## Home Relationship

Lead Intelligence lives in the drawers, not in the Hearth.

It may contribute to Home only when it changes executive judgment.

Examples:

Velocity:

> A new partner candidate is ready for review.

Alignment:

> Review the strongest partner lead before tomorrow's outreach block.

Leverage:

> VAL already prepared the GHL records and first-touch context.

Home should never display raw scraper counts as the primary story.

Home should also never imply that VAL imported leads unless approval actually happened.

## Acceptance Test

Lead Intelligence succeeds if the user feels:

- VAL has been creating opportunity while they were away
- The user knows how to intentionally initiate a scrape
- GHL became cleaner, not louder
- The best leads rose to the top
- Weak or noisy records were restrained
- Nothing enters GHL before approval
- Review feels executive, not administrative
- The next action is obvious

If the user feels like they are managing scraping software, the experience has failed.
