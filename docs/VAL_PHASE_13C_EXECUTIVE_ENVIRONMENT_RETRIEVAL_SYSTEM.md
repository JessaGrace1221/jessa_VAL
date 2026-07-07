# VAL Phase 13C.7 - Executive Environment & Retrieval System

Purpose: define how supporting systems are accessed from Home without turning VAL into a dashboard.

Status: Phase 13C information architecture and interaction behavior spec.

## Constitutional Rule

Supporting systems should be retrievable without breaking presence.

VAL Home should not feel like navigation.

It should feel like an executive environment where the right material can be reached when needed.

## Clarity Rule

Metaphor may shape the interaction, but clarity must label the path.

The office can behave like furniture.

The labels must remain obvious.

Users should not have to decode poetry to find their work.

## Retrieval, Not Navigation

Navigation belongs to software.

VAL uses retrieval.

The user is not leaving Home.

The user is reaching for prepared material.

## Executive Environment IA

The office itself is the information architecture:

| Office Element | Product Meaning |
|---|---|
| Window / light | The Hearth and greeting |
| Desk surface | Decision Workspace |
| Living rooms | Executive lenses |
| Drawers | Supporting systems |
| Folders | Relationships, projects, commitments |
| Documents | Prepared work and source material |
| Notebook | Working Together with VAL |
| Pen | Teach VAL |
| Agenda book | Calendar |
| Correspondence tray | Executive inbox |

## Always Present

Some tools support thinking and should remain quietly present:

- Hearth
- Velocity
- Alignment
- Leverage
- Agenda book / Calendar
- Working Together notebook
- Teach VAL pen

Always present does not mean loud.

It means available without retrieval.

## Desk Companions

Desk Companions are always-present tools that support the user's thinking without competing with the Hearth.

Initial Desk Companions:

- Calendar / agenda book
- Co-Work with VAL notebook
- Teach VAL pen

They should feel intentionally grouped.

They should remain clearly labeled.

They should be subtle until the user reaches for them.

## Calendar Object

Calendar should remain visible as an agenda object, not hidden in the drawers.

Default state:

- Show only the next meaningful calendar item.
- Indicate whether meeting prep is ready.
- Stay visually quiet.

Clicking the next calendar item should open Meeting Prep.

Meeting Prep should gather internal VAL context and external intelligence sources when relevant, including:

- CRM / GHL context
- Relationship memory
- Related projects or proposals
- Outscraper research
- Apollo research

The visible calendar object should connect to VAL's backend Meeting Prep contract:

- `/api/val/calendar/meeting-prep`
- internal calendar and relationship context
- Apollo / Outscraper enrichment planning only when it improves judgment
- no external action without approval

The user should feel prepared, not like they are carrying a dossier into the room.

The calendar object may include an `Open full calendar` tab.

Clicking that tab should slide the full calendar in from the right, preserving the office context.

## Working Together Notebook

Co-Work with VAL should remain visible as a quiet notebook object.

It is not storage.

It is a thinking surface.

Clicking it should open a workspace for:

- Strategy
- Drafting
- Decision thinking
- Working out loud
- Teaching VAL through conversation

The notebook should feel related to the calendar object: always available, visually subtle, and clearly labeled.

The notebook may connect to VAL chat / co-working intelligence, but it must preserve this boundary:

- private preparation is allowed
- external action requires separate approval
- generated tasks or candidates remain reviewable
- the user can continue thinking without leaving Home

## Teach VAL Pen

Teach VAL should remain visible as a small pen object near the notebook.

It is not settings.

It is how the user teaches judgment.

Clicking it should open a teaching workspace with feedback language such as:

- This wasn't useful.
- Show me more like this.
- I would have handled this differently.
- You understood correctly.

Teach VAL should connect to safe teaching contracts:

- executive instruction extraction
- review update building
- Teach VAL memory candidates

It should not silently commit sensitive or durable memory.

Teaching VAL should feel like adjusting a trusted partner's judgment, not configuring software.

## Retrieved Intentionally

Drawers are for systems the user intentionally reaches for:

- Relationships
- Projects
- Correspondence
- Commitments
- Documents
- Lead Intelligence
- VAL

These should be labeled clearly.

They should be visually calm until requested.

## Drawer Choreography

The drawers should not slide up like a software panel.

They should pull out like furniture.

Opening motion:

```text
User reaches for handle
↓
Desk apron subtly lowers forward
↓
Drawer glides toward the user
↓
Folders / destinations are revealed inside
```

Closing motion:

```text
Drawer softly returns into the desk
↓
Desk apron settles back into place
↓
The office becomes calm again
```

The motion should communicate craftsmanship and retrieval.

It should not feel like a modal, drawer menu, bottom sheet, or navigation bar.

## Lead Intelligence

Lead Intelligence is the user-facing home for client-specific scrapers.

See:

- [VAL_PHASE_13C_LEAD_INTELLIGENCE_SCRAPER_SYSTEM.md](./VAL_PHASE_13C_LEAD_INTELLIGENCE_SCRAPER_SYSTEM.md)

Scrapers are first-class supporting systems and one of VAL's strongest selling points.

Do not hide them under settings.

User-facing label:

```text
Lead Intelligence
```

Internal term:

```text
Scrapers
```

Lead Intelligence includes:

- GHL / CRM scrapers
- Website scrapers
- Competitor scrapers
- Social or content scrapers
- Market or listing scrapers
- Custom user scrapers

Example client-specific scraper set:

```text
jessa_val
```

Initial lead drawers:

- Organizations / Non-Profits
- Partners

Each source should eventually show:

- What it watches
- Last run
- Signal quality
- What VAL learned
- What changed
- Whether it is contributing to Home judgment
- What was added to GHL / CRM
- What needs human judgment
- What was intentionally held back

The initial drawer view should show prepared opportunity, not technical jobs.

Preferred source card fields:

- Scraper set name
- What VAL was looking for
- Last run or queued state
- Qualified opportunities ready
- GHL / CRM sync state
- Review queue
- Restraint status for weak or noisy leads

Lead Intelligence may show numbers because it is an explicit CRM / GHL supporting surface.

Those numbers must remain subordinate to judgment.

Do not lead with:

- raw scrape logs
- URL tables
- job names
- volume charts
- import batches
- "more leads" as success

## Drawer Set

Initial Home drawer labels:

- Relationships
- Projects
- Calendar
- Correspondence
- Commitments
- Documents
- Lead Intelligence
- VAL

These labels are intentionally plain.

The interaction may feel crafted.

The destination must be unmistakable.

## Retrieval Acceptance Test

A new user should be able to find a person, project, calendar item, message, commitment, document, scraper, or VAL setting within five seconds without Home becoming a dashboard.

## Final Test

Did opening this system feel like reaching for prepared material, or did it feel like entering software?

If it felt like software, it needs to go back into the drawer.
