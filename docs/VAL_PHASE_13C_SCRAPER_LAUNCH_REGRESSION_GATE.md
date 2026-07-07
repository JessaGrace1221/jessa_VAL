# VAL Phase 13C - Scraper Launch Regression Gate

This gate must pass before shipping the new Home / Hearth experience to any existing VAL user with active scrapers.

Lead scrapers are a core selling point of VAL.

The new UI may make the scraper experience feel more elegant, but it must not change the working behavior without an explicit migration decision.

## Launch Rule

No current VAL user may be migrated to the new Home experience until every active scraper in that VAL has been verified against its existing workflow.

This includes:

- GOALL employer scrapers
- GOALL partner scrapers
- Frisson organization scrapers
- Frisson partner scrapers
- Westwood / Limitless lead scrapers
- Any client-specific custom scraper

## Required Per-VAL Inventory

Before launch, create a scraper inventory for each VAL:

```json
{
  "client_slug": "jessa_val",
  "scrapers": [
    {
      "scraper_id": "frisson_organizations",
      "user_label": "Scrape Organizations",
      "entry_point": "drawer|dashboard|chat|command_center",
      "preview_endpoint": "/api/val/leads/discover-preview",
      "import_endpoint": "/api/val/leads/import-approved",
      "crm_destination": "Frisson GHL sub-account",
      "requires_approval": true,
      "status": "needs_test"
    }
  ]
}
```

## Functional Test Matrix

Each active scraper must prove:

- The scraper can be opened from the new UI.
- Existing criteria fields are preserved.
- Existing defaults are preserved.
- The setup screen shows destination pipeline / CRM account before preview.
- The setup screen shows source readiness before preview.
- The preview endpoint is called before any import endpoint.
- No GHL / CRM records are created during preview.
- Duplicate checking runs before enrichment spend.
- The preview clearly shows review, verification, approval, and cancel states.
- The preview shows a concrete list of found leads / contacts.
- Each preview row includes enough trust detail for approval: company or organization, location, type/industry, score or fit, contactability, decision maker when known, and evidence/source context.
- Each preview row can be approved or held before import.
- The preview shows an approved / held summary before import.
- The import action names the number of approved records and becomes unavailable when none are approved.
- Level 3 verification remains optional/deferred when the existing scraper expects it.
- Level 3 verification remains chunked for broad batches.
- Approved import re-checks duplicates.
- Approved import writes to the correct CRM account, pipeline, stage, tags, and custom fields.
- Cancel leaves GHL untouched.
- Failed source calls produce a helpful recovery path, not raw logs.
- The post-import summary reports created, skipped, repaired, failed, and next-batch state when applicable.

## Existing Automated Tests To Preserve

These tests must remain green before launch:

```text
node --test val-core/test/leadScraperRegression.test.js
node --test val-core/test/partnerScraperRegression.test.js
node --test val-core/test/leadContactValidation.test.js
```

They currently protect:

- 200-lead production batch limits
- mixed GOALL priority-industry batches
- early CRM duplicate filtering
- final import duplicate re-checking
- contact name/email/phone validation
- Level 3 verification chunking
- partner preview / import separation
- partner 100-point scoring
- strategic partner pipeline lock
- partner custom fields
- required Employer / GOALL / Limitless tags

## Manual Launch Script

For every active scraper:

1. Open the new Home.
2. Open drawers.
3. Open Lead Intelligence.
4. Open the scraper.
5. Confirm the criteria UI matches the existing scraper's required fields.
6. Run a small preview in a safe market or demo mode.
7. Confirm no CRM record was created during preview.
8. Review the preview.
9. If Level 3 verification is available, run one chunk and confirm the preview remains intact.
10. Approve one safe test record or run in demo mode.
11. Confirm the CRM destination, tags, custom fields, notes, and opportunity stage.
12. Cancel a second preview and confirm nothing is written.
13. Capture the result in the launch inventory.

For visual QA of the Hearth prototype only, the served page may be opened with:

```text
/hearth-prototype.html?mockScrapers=1
```

That preserves the UI flow without calling live scraper endpoints.

Do not use mock mode as launch evidence for a real VAL migration.

## Pass / Fail Standard

Pass:

- The new UI opens the same scraper behavior.
- The user can tell whether they are configuring, previewing, verifying, approving, importing, or done.
- Approval is required before CRM write.
- The CRM result matches the old scraper contract.
- The experience feels cleaner and more elite without losing function.

Fail:

- Any scraper becomes harder to initiate.
- Any old default disappears.
- Any CRM destination changes unexpectedly.
- Preview and import become ambiguous.
- GHL receives records before approval.
- Duplicate filtering is skipped.
- Level 3 verification becomes all-or-nothing for broad batches.
- The user must inspect Developer/logs to understand what happened.

## Release Gate

If any active scraper fails this gate, do not launch the new Home for that VAL.

Fix the scraper workflow first, then repeat the gate.
