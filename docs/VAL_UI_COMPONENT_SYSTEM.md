# VAL UI Component System v1

Purpose: define VAL's reusable UI behavior system before Phase 13 wireframes and implementation.

This is not a design system.

This is a meaning system.

It prevents VAL from inventing a different interaction model on every page.

The components below should be reused across destinations so VAL feels like one coherent operating environment instead of a collection of screens.

Companion specs:

- [VAL_PRODUCT_PHILOSOPHY_AND_INFORMATION_ARCHITECTURE.md](./VAL_PRODUCT_PHILOSOPHY_AND_INFORMATION_ARCHITECTURE.md)
- [VAL_HOMEPAGE_WITNESS_SYSTEM.md](./VAL_HOMEPAGE_WITNESS_SYSTEM.md)
- [VAL_RELATIONSHIP_PROJECT_UNDERSTANDING_PROMPTS.md](./VAL_RELATIONSHIP_PROJECT_UNDERSTANDING_PROMPTS.md)
- [VAL_READY_FOR_YOU_CARD_PROMPTS.md](./VAL_READY_FOR_YOU_CARD_PROMPTS.md)
- [VAL_CALENDAR_AND_MEETING_PREP_PROMPTS.md](./VAL_CALENDAR_AND_MEETING_PREP_PROMPTS.md)

## Core Thesis

VAL does not have pages.

VAL has lenses.

The underlying graph of relationships, evidence, projects, conversations, commitments, prepared work, and receipts stays connected.

The question changes.

Each UI component should help the user look through the right lens without forcing them to relearn the interface.

## Component Rule

Every reusable component must answer at least one of VAL's four screen questions:

1. Why am I here?
2. What matters?
3. What can VAL already do for me?
4. What only I can do?

If a component does not help answer one of these questions, it is decoration or clutter.

## Recognition Header

Purpose:

Begin every page with recognition before interaction.

This is the first truth the user sees.

Used on:

- Chief of Staff
- Momentum
- Ready For You
- People
- Projects
- Calendar
- Executive Inbox
- Working Together
- Teach VAL
- VAL OS

Examples:

| Destination | Recognition Header |
|---|---|
| Chief of Staff | Here's where I believe your attention belongs today. |
| Momentum | Here is what is changing. |
| Ready For You | Three things are waiting on your judgment. |
| People | If I had thirty seconds to remind you about Aric... |
| Projects | Frisson is becoming... |
| Calendar | Here's what matters before you walk into this room. |
| Executive Inbox | Three conversations deserve your attention. |
| Working Together | I already have context. Here is what I am carrying into this with you. |
| Teach VAL | Here is what I think I understand. Please correct me. |
| VAL OS | Here are the behaviors currently shaping how VAL acts. |

Should contain:

- One primary sentence
- Optional supporting sentence
- Confidence or unknowns only when useful
- One primary action at most

Should not contain:

- Metrics grids
- Button rows
- Raw data
- Multiple competing conclusions

## Context Drawer

Purpose:

Explain why VAL believes something and what it is connected to.

This is Context, not details.

Used everywhere.

Default tabs:

- Evidence
- History
- Related
- Open Loops
- Timeline
- Sources
- Actions

Optional tabs:

- Receipts
- Opposing View
- Unknowns
- Debug

Should show:

- Source quotes or summaries
- Source confidence
- Related people
- Related projects
- Related conversations
- Execution receipts
- Reconciliation events
- What VAL did
- What VAL did not do

Should not show:

- Raw provider payloads
- Sensitive tokens
- Internal prompt text
- Observer dumps unless Developer mode is active
- Data with no interpretive value

## Understanding Card

Purpose:

Summarize the meaning, trajectory, and current season of a person, project, company, opportunity, or document.

Used on:

- People
- Projects
- CRM
- Lead Intelligence
- Documents
- Calendar attendee context

Core fields:

- Thirty Second Truth
- Current Season
- Why It Matters
- What Changed
- Momentum
- Open Loops
- Related People
- Related Projects
- Source Confidence

Should feel:

- Living
- Grounded
- Specific
- Evidence-backed

Should never feel:

- Like a CRM field card
- Like a task summary
- Like a scraped profile
- Like a generic AI bio

## Prepared Work Card

Purpose:

Show work VAL has already prepared where human judgment is now the bottleneck.

Used on:

- Ready For You
- Meeting Prep
- Proposal Review
- Draft Review
- Transcript Follow-up
- CRM note/task review
- External action packet review

Core fields:

- Title
- Status
- Why you are seeing this
- Why now
- What VAL prepared
- What only you can do
- Estimated review time
- Representation risk
- Approval policy
- Actions
- Receipt status when present

Primary actions:

- Review
- Approve
- Reject
- Snooze
- Edit
- Inspect context

Should not show:

- Background work that does not need review
- Multiple draft variants by default
- External execution as a hidden side effect

## Decision Workspace

Purpose:

Give the user one focused place to make a high-trust decision about prepared work.

Used when clicking:

- Ready For You item
- Email draft
- Proposal candidate
- CRM update candidate
- Calendar follow-up
- External action packet

Core structure:

1. What VAL prepared
2. Why this exists
3. What only the user can decide
4. Risks and approval policy
5. Evidence and context
6. Receipt/timeline if already executed
7. Final local decision

Should support:

- Approve
- Reject
- Edit
- Ask why
- Ask VAL to revise
- Create action packet
- Execute only when future execution rules allow

## Timeline Component

Purpose:

Show meaningful progression.

This is not merely chronological.

Used on:

- People
- Projects
- External actions
- Execution receipts
- Meeting prep
- Transcript intake
- Teach VAL
- VAL OS behavior history

Timeline modes:

- Meaning-first
- Chronological
- Execution
- Relationship season
- Project season

External action timeline stages:

```text
planned -> approved -> executed -> reconciled
```

Relationship/project timeline stages may include:

- Beginning
- Trust
- Breakthroughs
- Current Season
- Open Future

Should not become:

- An activity feed with every trivial event
- A noisy audit log outside Developer mode

## Confidence Component

Purpose:

Display certainty without pretending certainty is wisdom.

Used on:

- Chief of Staff
- Momentum
- Meeting Prep
- Executive Inbox
- People
- Projects
- CRM identity resolution
- External action safety checks

Should show:

- Confidence value or qualitative label
- Why confidence is high or low
- Unknowns affecting confidence
- Source strength when useful

Suggested labels:

- High confidence
- Moderate confidence
- Low confidence
- Needs more context
- Unknown

Should never imply:

- Confidence equals correctness
- The user should obey VAL
- Weak evidence is stronger than it is

## Source Confidence Badge

Purpose:

Separate known internal evidence, API-enriched data, public source data, VAL inference, and unknowns.

Source labels:

- Internal evidence
- API enriched
- Public source
- VAL inference
- Unknown

Used on:

- Context Drawer
- Calendar
- Meeting Prep
- CRM
- People
- Projects
- Lead Intelligence
- Executive Inbox

Rule:

VAL must never blur source types to sound smarter.

## Relationship Chip

Purpose:

Provide a consistent visual shorthand for relationship state.

Used on:

- People
- Calendar attendees
- Executive Inbox conversations
- Projects
- CRM
- Lead Intelligence

Relationship states:

- Strategic
- Building Trust
- Active
- Waiting
- Dormant
- Rekindling
- Repairing
- Sensitive
- New
- Unknown

Should not be:

- A score pretending to be emotional certainty
- A replacement for evidence

## Momentum Strip

Purpose:

Show direction and velocity in a small reusable form.

Used on:

- Homepage Momentum
- People
- Projects
- Calendar
- CRM
- Executive Inbox

Fields:

- Direction: rising, stable, slowing, mixed, unknown
- Duration: how long the pattern has held
- Reason
- Evidence count
- Meaning dimension when relevant

Example:

```text
Relationships rising for 19 days.
Projects slowing for 11 days.
Recovery improving for 3 days.
```

Should not become:

- A chart-first analytics widget
- A productivity score

## Risk and Approval Badge

Purpose:

Make action safety visible before the user approves or executes anything.

Used on:

- Ready For You
- External action packets
- Drafts
- CRM updates
- Calendar actions
- Proposal/invoice candidates

Fields:

- Approval policy
- Representation risk
- Financial/legal risk
- Relationship risk
- External action status

Labels:

- Auto safe
- Approval required
- Voice authorized
- Never auto
- Review only
- External action planned
- Executed
- Failed safely

Rule:

The user should never wonder whether clicking a button will create an external action.

## Receipt Badge

Purpose:

Show what actually happened after execution.

Used on:

- Ready For You
- External action detail
- CRM
- Calendar
- Draft review
- Developer

States:

- No external action
- Planned
- Approved
- Executed
- Reconciled
- Failed safely
- Retry available
- Retry blocked

Should link to:

- Execution receipt
- Provider object link when safe
- Timeline
- Reconciliation events

Should never expose:

- Tokens
- Raw provider payloads
- Sensitive provider internals

## Empty State

Purpose:

Make quiet feel earned, not broken.

Used on:

- Ready For You
- Executive Inbox
- Tasks
- External Actions
- Review Updates
- Developer lists

Examples:

| Surface | Empty State |
|---|---|
| Ready For You | I'm caught up. |
| Executive Inbox | Nothing needs your attention right now. |
| Tasks | No promises are waiting on you. |
| External Actions | No external actions are waiting. |
| Review Updates | No intelligence updates need review. |

Should not say:

- No data
- Empty
- Nothing found
- You are all set, unless the tone truly fits the surface

## Lens Switcher

Purpose:

Let the user view the same object through different questions.

Used on:

- People
- Projects
- CRM
- Calendar attendee context
- Documents

Potential lenses:

- Understanding
- Evidence
- Open Loops
- Momentum
- Prepared Work
- Timeline
- Receipts

Rule:

Changing lens changes the question, not the underlying entity.

## Implementation Guardrails

- Reuse these components before creating new UI patterns.
- Do not create a new component when a VAL lens with different content would work.
- Do not let Developer/debug components leak into primary user experiences.
- Do not show a metric unless it changes judgment.
- Do not show an action without approval/execution clarity.
- Do not show evidence without source confidence where source ambiguity matters.
- Do not make the user interpret raw complexity that VAL could interpret first.

## Review Checklist

Before creating or modifying a component, ask:

- Which VAL screen question does this answer?
- Which destinations reuse this pattern?
- Does this component create recognition, judgment, preparation, or agency?
- Does this reduce variation across VAL?
- Does this preserve source confidence and approval safety?
- Does it feel like a meaning component or a generic SaaS component?
