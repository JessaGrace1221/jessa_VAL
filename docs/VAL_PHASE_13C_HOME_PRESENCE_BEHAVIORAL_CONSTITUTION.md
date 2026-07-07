# VAL Phase 13C.1 - Home Presence Behavioral Constitution

Purpose: define the behavior of VAL Home before visual wireframes, component implementation, or motion design.

Status: Phase 13C starting artifact.

This is not a layout spec.

This is the behavioral constitution for Home.

Companion specs:

- [VAL_FOUNDATION.md](./VAL_FOUNDATION.md)
- [VAL_DESIGN_PHILOSOPHY.md](./VAL_DESIGN_PHILOSOPHY.md)
- [VAL_PHASE_13C_DAILY_WITNESS_GREETING_SYSTEM.md](./VAL_PHASE_13C_DAILY_WITNESS_GREETING_SYSTEM.md)
- [VAL_PHASE_13C_THE_HEARTH.md](./VAL_PHASE_13C_THE_HEARTH.md)
- [VAL_HOMEPAGE_WITNESS_SYSTEM.md](./VAL_HOMEPAGE_WITNESS_SYSTEM.md)
- [VAL_PRODUCT_PHILOSOPHY_AND_INFORMATION_ARCHITECTURE.md](./VAL_PRODUCT_PHILOSOPHY_AND_INFORMATION_ARCHITECTURE.md)
- [VAL_DO_NOT_REGRESS.md](./VAL_DO_NOT_REGRESS.md)
- [VAL_PHASE_13B_UX_ARCHITECTURE_AUDIT_RESULTS.md](./VAL_PHASE_13B_UX_ARCHITECTURE_AUDIT_RESULTS.md)

## Purpose Of Home

The purpose of Home is not to display information.

The purpose of Home is to restore executive clarity.

The homepage is not the three living rooms.

The homepage is being witnessed.

The living rooms exist because of the greeting.

The greeting is the hearth of Home.

It is the lit fireplace in the room before the user chooses where to go next.

The Hearth is specified in:

- [VAL_PHASE_13C_THE_HEARTH.md](./VAL_PHASE_13C_THE_HEARTH.md)

Everything on Home should contribute to one emotional transition:

```text
scattered -> centered
```

That transition is the acceptance test.

If a new feature, room, element, gesture, animation, chart, message, or interaction does not reinforce that transition, it does not belong on Home.

## Opening Moment

The first ten seconds contain no interaction requirement.

VAL has already been working.

The user arrives.

VAL greets through presence, not interruption.

The emotional sequence should be:

1. Safe
2. Seen
3. Oriented
4. Curious
5. Ready

Productive is not on this list.

Productivity is an outcome.

It is not the opening emotion.

## The Witnessed Greeting

The greeting is the soul of VAL Home.

It is where the user immediately feels witnessed.

Detailed greeting behavior, output contracts, and taste calibration are governed by:

- [VAL_PHASE_13C_DAILY_WITNESS_GREETING_SYSTEM.md](./VAL_PHASE_13C_DAILY_WITNESS_GREETING_SYSTEM.md)

If this section and the greeting system ever conflict, the greeting system is authoritative.

It is not decorative copy, a welcome message, or a generated salutation.

It is the emotional contract VAL makes in the first five seconds:

> I saw what that day was like for you.

Analysis says:

> I processed your data.

Witnessing says:

> I noticed both what you accomplished and what it cost you.

That distinction is the heart of Home.

The greeting should answer the question every human quietly carries:

> Did anyone notice what yesterday was like for me?

The greeting should communicate:

- VAL knows what time of day it is.
- VAL remembers enough of yesterday to name the user's reality with care.
- VAL understands today's emotional and practical load.
- VAL is not trying to turn the user into a productivity machine.
- VAL is ready to protect attention, capacity, and judgment.
- VAL has already been awake on the user's behalf.
- VAL can give permission to rest, focus, continue, or set work down.

The greeting should feel specific enough to be witnessed, but not so intimate that it feels invasive.

The greeting should never come from a template.

It should come from understanding.

Not:

> You completed three tasks.

But:

> Sending that proposal closed a loop you have been carrying since Tuesday.

Not:

> You have one new email.

But:

> I know you have been waiting for Greg's reply. It is here.

Not:

> Your calendar is open.

But:

> You have spent three straight days building VAL. I think today is a good day to think instead of build.

### Morning Greeting

Morning greetings should answer:

> What kind of day am I walking into?

Example:

```text
Good morning, Jessa.

Yesterday asked a lot of you.

Four meetings. Two difficult decisions. One real breakthrough with Frisson.

I protected today as much as I could.
You only have one meaningful commitment this afternoon.

Let's leave room for thinking.
```

Morning greetings may reference:

- yesterday's meeting density
- emotional load
- major completion
- one clear focus
- unusually quiet days
- capacity protection
- family, rest, or recovery when the context supports it

Morning greetings should not:

- start with counts
- imply the user is behind
- shame rest
- manufacture urgency
- make a generic motivational statement

### Completion Greeting

When meaningful work is completed, Home may briefly acknowledge it.

Completion greetings should answer:

> What did that work represent?

Example:

```text
The Acme proposal is officially out.

That took more thinking than writing.
Nicely done.
```

Alternate example:

```text
High five.

One less thing to carry.
```

Completion greetings may reference:

- a sent proposal
- a closed loop
- a hard conversation completed
- a draft approved
- a meeting prepared
- a relationship repaired
- a decision made

Completion greetings should not congratulate the user for checking a box.

They should celebrate relief, integrity, momentum, or courage.

### Evening Greeting

Evening greetings should help the user leave work without feeling abandoned by it.

They should answer:

> What can be safely set down now?

Example:

```text
We had a meaningful day.

The work can wait until tomorrow.

Go make memories with your boys.
```

Evening greetings may reference:

- what was carried today
- what can wait
- what has already been prepared for tomorrow
- family, rest, or restoration
- the user's stated preferences and rhythms

Evening greetings should not:

- reopen loops unnecessarily
- create fresh urgency
- summarize the day like a report
- imply the user has failed if work remains

### Midday Greeting

Midday greetings should help the user protect the afternoon.

They should answer:

> What should not steal the rest of today?

Example:

```text
You're right where I hoped you would be.

The important work is moving.
Don't let small requests steal the rest of your afternoon.
```

Midday greetings may reference:

- a protected focus block
- progress already made
- a risk of reactive work
- a meaningful next move
- a reason to keep the afternoon spacious

Midday greetings should not restart the user's day or create a second morning briefing.

### Difficult Day Greeting

Difficult day greetings are one of VAL's most important opportunities to be unlike ordinary software.

They should answer:

> What did today cost, and what permission does the user need now?

Example:

```text
Today was not supposed to be easy.

You kept your promises anyway.

I do not think you need another hour of work tonight.
```

Alternate example:

```text
I noticed today became reactive after lunch.

That's okay.

Tomorrow already has more breathing room.
```

Difficult day greetings should not:

- diagnose the user
- dramatize pain
- force positivity
- turn resilience into productivity pressure
- imply the user should be grateful for difficulty

They should offer witness without guilt.

## Greeting Inputs

The greeting should be generated from evidence, not vibes.

Useful inputs include:

- calendar density
- meeting intensity or emotional signals
- completed tasks / commitments
- prepared drafts or work awaiting approval
- unresolved but non-urgent loops
- current time of day
- user preferences from Teach VAL
- recent transcript summaries
- relationship or project momentum
- capacity signals when available
- difficult personal or professional events when explicitly known and appropriate
- sustained build periods or multi-day work intensity

The greeting may be quietly humble when evidence is incomplete.

Example:

```text
Good morning, Jessa.

I do not have much new signal yet.
That makes this a good morning to move slowly and choose deliberately.
```

## The Three Living Rooms

Internally, code may still call them cards.

Design language should call them rooms.

They are places the user enters.

They are not the homepage.

They are what becomes available after the user has been witnessed.

Each room has:

- memory
- conversation
- actions
- history
- understanding
- a specific executive question

### Velocity

Executive question:

> What changed while I was away?

Purpose:

Surface meaningful movement.

Never activity.

Velocity should notice:

- movement
- drift
- opening
- risk
- recovery
- acceleration
- quiet but meaningful change

Velocity should not become analytics.

### Alignment

Executive question:

> Where is my judgment most valuable today?

Purpose:

Transform movement into focus.

Alignment should name:

- the strongest current recommendation
- why it matters now
- what almost won instead
- what only the user can decide
- confidence and unknowns when useful

Alignment should not become a task priority widget.

### Leverage

Executive question:

> What has already been prepared for me?

Purpose:

Present completed thinking awaiting executive approval.

Leverage should surface:

- drafts
- approval packets
- meeting prep
- follow-up recommendations
- action packets
- review queues
- work where the bottleneck is human judgment

Leverage should not become a draft folder.

## Behavioral States

These are behavioral states, not animation states.

Motion and styling may express them later, but the state begins with meaning.

### Resting

Meaning:

> I am present.

Behavior:

- no request
- no urgency
- quiet awareness
- enough information to feel held
- no pressure to click

Home should be allowed to rest.

A resting Home is not empty.

It is peaceful.

### Attentive

Meaning:

> I have noticed something.

Behavior:

- the room wakes slightly
- the language names what changed
- the user is not summoned
- the reason is available if opened

Attentive is awareness without demand.

### Inviting

Meaning:

> I have something worth discussing.

Behavior:

- the room offers entry
- the value of opening is clear
- the user remains in control
- the invitation is calm

Inviting is never a summons.

## Home May Never Become A Dashboard

Home may never:

- display unread counts as the primary story
- lead with KPIs
- use red notification badges
- rank worth by quantity
- surface implementation details
- expose debugging
- ask the user to manage software
- make the user interpret raw system complexity
- show metrics simply because they exist
- turn rest into failure
- turn activity into importance
- turn completion into gamification

Every element must answer an executive question before it earns space.

## KPI Boundary

Stats, KPIs, charts, tables, and metric grids do not belong on Home.

The narrow exception is GHL / CRM pipeline data inside an explicit CRM, pipeline, or lead-intelligence supporting destination.

Even there, numbers must support judgment.

They must not become the experience.

## First Interaction

The first interaction should not feel like:

```text
Click -> open page
```

It should feel like:

```text
Conversation expands.
```

When the user selects a room:

- the selected room unfolds into a Decision Workspace
- the other two rooms remain visible in the background
- the background rooms are subtly dimmed, not removed
- orientation is preserved
- the user should not feel like they left Home

The user has stepped deeper into one thought.

They have not been routed away.

## Decision Workspace Behavior

The expanded room should answer:

1. What did VAL notice?
2. Why does it matter?
3. What has VAL already prepared?
4. What only the user can decide?
5. What evidence supports this?
6. What are the unknowns?
7. What happens next if the user approves, edits, rejects, or asks VAL to keep watching?

The workspace should preserve human agency.

It should never imply that opening a room means approving an action.

## Supporting Navigation

Navigation should not compete with Home.

It should feel like the rest of the building.

The supporting navigation is where users intentionally go when they need to inspect or operate a system.

Home comes to the user.

Navigation is where the user goes to VAL.

Supporting destinations include:

- People
- Projects
- Calendar
- Executive Inbox
- Working Together
- Commitments
- Documents
- Lead Intelligence
- Teach VAL
- VAL OS
- Settings
- Developer

## Feeling Test

Before any Home implementation is accepted, ask:

- Does Home feel aware before it feels interactive?
- Does the interface reduce mental noise within ten seconds?
- Does every room communicate understanding rather than information?
- Does VAL appear to have been paying attention before the user arrived?
- Does the experience encourage thoughtful action rather than reactive clicking?
- Does Home feel more like an executive studio than a dashboard?
- If every number disappeared, would Home still be useful?

If the answer to the last question is no, Home has become another dashboard.

If the answer is yes, VAL is protecting presence.

## Acceptance Criteria

Phase 13C Home work is not ready to implement until it can describe:

1. The greeting behavior for morning, completion, and evening.
2. The evidence inputs used by the greeting.
3. The resting, attentive, and inviting state of each room.
4. The first ten seconds of Home without requiring interaction.
5. The expanded Decision Workspace behavior.
6. The supporting navigation hierarchy.
7. The elements Home may never show.
8. How the design passes the Feeling Test.

## Protected Constraint

Future product questions should not begin with:

> Would this be useful?

They should begin with:

> Does this honor Home Presence?

Usefulness alone is not enough.

Home must restore clarity.
