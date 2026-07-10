# Hearth Drawer Contract Audit

Date: 2026-07-10

Purpose: stop drawer-by-drawer regressions by making every Hearth drawer prove the same visual and intelligence contracts before more feature work continues.

## Drawers Covered

| Drawer | Open class | Detail panel | Required packet | Required contract |
|---|---|---|---|---|
| Relationships | `relationship-open` | `#relationship-detail` | `relationship_packet` | `drawer.relationships` |
| Projects | `project-open` | `#project-detail` | `project_packet` | `drawer.projects` |
| Transcripts | `timeline-open` | `#timeline-detail` | `timeline_packet` | `drawer.timeline` |
| Executive Inbox | `correspondence-open` | `#correspondence-detail` | `email_packet` | `drawer.executive_inbox` |
| Commitments | `commitment-open` | `#commitment-detail` | `commitment_packet` | `drawer.commitments` |
| Documents | `document-open` | `#document-detail` | `document_packet` | `drawer.documents` |
| Lead Intelligence | `source-open` | `#source-detail` | `lead_intelligence_packet` | `drawer.lead_intelligence` |
| VAL OS | `val-open` | `#val-detail` | `val_os_packet` | `drawer.val_os` |

## Visual Contract

Every opened drawer must use the shared frosted surface system in `hearth-prototype.css`:

- `--frost-open-surface`
- `--frost-open-card`
- `--frost-open-card-strong`
- `--frost-open-line`
- `--frost-open-shadow`
- `--frost-open-soft-shadow`

The opened drawer must not reintroduce heavy tan, clay, mahogany, espresso, muddy brown, or opaque gray/black drawer surfaces. Drawer-specific rules may adjust layout, density, and emphasis, but they should inherit the shared frost variables for tray, cards, inputs, buttons, and panels.

## Intelligence Contract

Each drawer button and meaningful item/action must remain packet-backed:

- visible trigger has `data-val-click-contract`
- visible trigger has `data-val-variable-packet`
- packet name matches the drawer's required packet
- prompt/rule, allowed actions, never-do, required layers, source web, graph links, and required variables stay attached through `applyValClickContracts`
- item clicks scope packet source to the selected row/profile/thread, not generic drawer context
- user surfaces hide raw packet/debug language unless an explicit audit/debug view is opened

The packet labels alone are not enough. Authenticated live checks should also verify hydration through:

- `GET /api/hearth/packet-hydration-audit`
- `GET /api/hearth/truth-lineage`
- `POST /api/hearth/build-packet`

Those routes require a signed-in session. Local shell checks can verify static packet contracts and browser-visible attributes; logged-in Chrome checks are needed for live packet payload quality.

## Current Findings

Initial browser audit showed seven drawers using the frosted family and the correct packet metadata. Executive Inbox was the outlier: it carried `email_packet`, but its tray and workbench used opaque Apple gray/black surfaces instead of the shared frost contract.

Repair made in this pass:

- `.drawer-tray.correspondence-open` now uses `var(--frost-open-surface)`, `var(--frost-open-line)`, and `var(--frost-open-shadow)`.
- Executive Inbox workbench, panels, rule modal, draft preview, context rows, action buttons, and selected conversation state now use frost variables or quiet sage equivalents.

## Repeatable Audit

Run the Hearth app locally, then:

```bash
PORT=5188 node server.js
node scripts/hearth-drawer-contract-audit.js http://127.0.0.1:5188/hearth-prototype.html
```

The script opens every drawer and fails if:

- the expected open class is missing
- the detail panel is hidden
- the drawer trigger has the wrong packet
- the drawer trigger has the wrong click contract
- frosted surface cues are missing
- muddy brown/tan surface cues are present

## Do Not Regress

- Do not add drawer-specific opaque backgrounds after the shared frost block without also extending the drawer contract test.
- Do not replace packet-backed drawer actions with direct dashboard/page shortcuts.
- Do not let fallback/index data masquerade as a full round-table packet.
- Do not expose packet receipts, raw JSON, source refs, or debug labels in the executive-facing drawer body.
