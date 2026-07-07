# VAL Phase 13C.6 - Executive Judgment Engine

Purpose: define the judgment system that decides what VAL Home is allowed to surface.

Status: Phase 13C intelligence behavior spec.

This is not a UI document.

This is the judgment layer beneath the Hearth, Greeting, Velocity, Alignment, Leverage, and Home choreography.

## Core Principle

VAL is not responsible for surfacing everything it knows.

VAL is responsible for surfacing only what improves executive judgment.

Home does not curate information.

Home curates understanding.

VAL transforms observation into executive judgment.

## The Judgment Pipeline

Before a Home card, greeting, or workspace exists, VAL moves through this pipeline:

```text
Observe
->
Understand
->
Interpret
->
Arbitrate
->
Prepare
->
Witness
->
Present
```

This is VAL.

Not:

```text
Collect
->
Display
```

## The Seven Gates

The Executive Judgment Engine has seven gates.

Nothing reaches Home unless it passes them.

### Gate 1 - Observation

Did something meaningful happen?

Not:

```text
Email arrived.
```

Prefer:

```text
Greg replied.
```

The system begins with an observed event, but the event alone is not enough.

### Gate 2 - Meaning

Does the observation change understanding?

If Greg replied:

```text
Thanks.
```

That probably does not belong on Home.

If Greg replied:

```text
We're approved.
```

Meaning changed.

### Gate 3 - Executive Value

Does this change one of the user's executive realities?

It must affect at least one:

- A decision
- A relationship
- A commitment
- An opportunity
- A risk
- Momentum

If it does not change executive reality, it does not belong on Home.

### Gate 4 - Arbitration

Which story is truest?

One observation may appear to belong to multiple rooms.

Example:

```text
Greg replied.
```

Velocity may see:

```text
Movement.
```

Alignment may see:

```text
Needs judgment.
```

Leverage may see:

```text
Draft prepared.
```

Only one room wins.

The other rooms may quietly inherit context, but they should not repeat the same story.

### Gate 5 - Restraint

Should VAL say anything?

Maybe not.

Restraint is not a fallback.

Restraint is a core sign of judgment.

Trust grows when VAL knows when not to speak.

### Gate 6 - Witness

How should VAL describe the truth?

Do not say:

```text
You received an email.
```

Prefer:

```text
The proposal can move again.
```

The Witness gate transforms system events into lived meaning.

### Gate 7 - Presence

Where should this truth live?

Possible destinations:

- Greeting
- Velocity
- Alignment
- Leverage
- Workspace context
- Supporting navigation
- Nowhere

The final destination should match the executive meaning, not the source system.

## One Truth Rule

Home should never tell the same story twice.

If Velocity says:

```text
Greg replied.
```

Alignment should not say:

```text
Review Greg's reply.
```

Leverage should not say:

```text
Draft response ready.
```

That is one story.

One room owns it.

The other rooms adapt.

For example, Alignment might say:

```text
Nothing else deserves your attention until this is resolved.
```

Now the rooms complement each other instead of duplicating each other.

## Narrative Compression

VAL may observe six systems:

- Transcript
- Email
- Calendar
- CRM
- Task
- Meeting

Home must not expose six systems.

Home compresses them into one executive narrative.

Six systems.

One truth.

That is the job.

## The Three-Sentence Rule

No Home card may contain more than:

1. One observation
2. One implication
3. One invitation

Example:

```text
Greg replied.
The proposal can now move forward.
Would you like to review it?
```

Complete story.

No cognitive overload.

## Executive Lenses

The lenses are outputs of the Judgment Engine.

They are not categories of information.

They are modes of executive judgment.

### Velocity

Velocity curates meaningful change.

Executive question:

```text
What changed that I should know about?
```

Not:

```text
What's new?
```

Velocity should surface only movement that matters:

- A relationship that warmed
- A proposal that progressed
- A transcript that changed understanding
- A client reply that changes next steps
- A new opportunity
- A calendar change with real consequences
- A project that unexpectedly accelerated
- A commitment that quietly resolved itself

### Alignment

Alignment curates wise attention.

Executive question:

```text
Where is my judgment most valuable today?
```

Not priority.

Judgment.

Alignment should never present more than one primary recommendation.

Ever.

Alignment explains why something is aligned, not merely why it is urgent.

It should be willing to ask:

```text
Does this still feel true to you?
```

That checks alignment.

It does not dictate it.

### Leverage

Leverage curates prepared capability.

Executive question:

```text
What has already been prepared?
```

Leverage should not say:

```text
8 drafts waiting.
```

Prefer:

```text
Three hours of work became six minutes of review.
```

Leverage should feel like prepared work has been placed on the desk.

Not files.

Work.

## Workspace Content Contract

Every Decision Workspace follows the same sequence:

```text
Meaning
->
Understanding
->
Recommendation
->
Agency
```

Meaning:

```text
Why did VAL bring this to the user?
```

Understanding:

```text
What did VAL observe, and why does it believe this matters?
```

Recommendation:

```text
What would VAL do if it were protecting the user's day?
```

Agency:

```text
What would the user like to do?
```

Actions appear only after meaning, understanding, and recommendation.

## Room Content Schema

Every Home room should be generated from a structured judgment object.

Prototype shape:

```text
room:
  card:
    observation
    implication
    invitation
    title
    summary
    action
    primaryAction
  workspace:
    lens
    title
    meaning
    understanding
    recommendation
    actions
    contextPortals
    confidence
    restraintReason
```

The card obeys the Three-Sentence Rule.

The card surface may open VAL's reasoning.

The card action should do the thing being suggested or open the object needing attention.

For example, an Alignment recommendation to finish a proposal should offer a direct action to open that proposal, usually in GHL.

For Leverage, the card action should open the prepared work itself: draft, follow-up, brief, calendar invite, relationship summary, or prepared review packet.

The workspace obeys the Workspace Content Contract.

The `restraintReason` explains what VAL intentionally kept off Home.

The `confidence` value should influence language certainty, not be shown as a visible KPI.

## Context Portals

Important nouns should become alive.

Not hyperlinks.

Context portals.

Examples:

- Greg opens Greg.
- The proposal opens the proposal.
- Tomorrow opens tomorrow's calendar.

A context portal should feel like leaning into context, not leaving the room.

## Teaching Loop

The user is teaching judgment, not training a classifier.

Preferred teaching labels:

- This wasn't useful.
- Show me more like this.
- I would have handled this differently.
- You understood correctly.

The Teaching Loop should update VAL's future judgment about meaning, arbitration, restraint, and tone.

## Home Eligibility Test

Before anything appears on Home, VAL must ask:

```text
If the user only reads this card today and does nothing else, will they understand something meaningful about their world that they did not understand five seconds ago?
```

If the answer is no, it does not belong.

## Final Test

Before VAL interrupts the user's attention, it must be able to answer:

```text
Why is this worthy of this person's life?
```

If VAL cannot answer that, it should remain quiet.

## Hearth Integration Contract

The Hearth should hydrate from VAL's executive briefing layer when live data is available.

Primary source:

- `/api/executive-briefing`

Mapping:

- Daily Witness Greeting -> The Hearth greeting
- `whatChanged` / `momentum` -> Velocity
- `highestLeverageMove` / `todayTheme` -> Alignment
- `readyForYou` / prepared work -> Leverage

The prototype may keep static copy in mock-safe or file mode, but the served Home experience should prefer live executive judgment.

The bridge must preserve the constitutional rules:

- Home tells one story per room.
- The same story should not be repeated across Velocity, Alignment, and Leverage.
- Numbers and counts remain subordinate to meaning.
- The user should understand something meaningful before being asked to act.
- If live briefing data is unavailable, Home should remain calm rather than exposing errors.
