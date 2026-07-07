# VAL Design Philosophy v1

Purpose: define the emotional and interaction philosophy that governs VAL wireframes, visual design, animation, and homepage composition.

This is a Foundation document.

It does not replace the UX audit.

It is the lens through which every wireframe after Phase 13B should be evaluated.

Companion specs:

- [VAL_FOUNDATION.md](./VAL_FOUNDATION.md)
- [VAL_CONSTITUTION.md](./VAL_CONSTITUTION.md)
- [VAL_PHASE_13C_HOME_PRESENCE_BEHAVIORAL_CONSTITUTION.md](./VAL_PHASE_13C_HOME_PRESENCE_BEHAVIORAL_CONSTITUTION.md)
- [VAL_PHASE_13C_DAILY_WITNESS_GREETING_SYSTEM.md](./VAL_PHASE_13C_DAILY_WITNESS_GREETING_SYSTEM.md)
- [VAL_PHASE_13C_THE_HEARTH.md](./VAL_PHASE_13C_THE_HEARTH.md)
- [VAL_PHASE_13C_EXECUTIVE_JUDGMENT_ENGINE.md](./VAL_PHASE_13C_EXECUTIVE_JUDGMENT_ENGINE.md)
- [VAL_PHASE_13C_EXECUTIVE_ENVIRONMENT_RETRIEVAL_SYSTEM.md](./VAL_PHASE_13C_EXECUTIVE_ENVIRONMENT_RETRIEVAL_SYSTEM.md)
- [VAL_PRODUCT_PHILOSOPHY_AND_INFORMATION_ARCHITECTURE.md](./VAL_PRODUCT_PHILOSOPHY_AND_INFORMATION_ARCHITECTURE.md)
- [VAL_HOMEPAGE_WITNESS_SYSTEM.md](./VAL_HOMEPAGE_WITNESS_SYSTEM.md)
- [VAL_DO_NOT_REGRESS.md](./VAL_DO_NOT_REGRESS.md)
- [VAL_UI_COMPONENT_SYSTEM.md](./VAL_UI_COMPONENT_SYSTEM.md)

## Constitutional UX Rule

The interface should feel aware before it feels interactive.

Most software behaves like this:

```text
User opens dashboard.
Dashboard waits.
User clicks.
Dashboard responds.
Interaction begins.
```

VAL should behave like this:

```text
User opens VAL.
VAL has already noticed.
VAL has already thought.
VAL has already prepared.
VAL quietly communicates.
Interaction begins.
```

This inversion is one of VAL's core differentiators.

The homepage is not passive.

The homepage has presence.

## Presence Over Intelligence

VAL should not make the user think:

> That AI is impressive.

VAL should make the user feel:

> Something has already been awake, paying attention on my behalf, and is ready to brief me.

The differentiator is not intelligence.

The differentiator is presence.

VAL should feel like awareness, not software.

## Executive Judgment

VAL transforms observation into executive judgment.

Home does not curate information.

Home curates understanding.

This is governed by:

- [VAL_PHASE_13C_EXECUTIVE_JUDGMENT_ENGINE.md](./VAL_PHASE_13C_EXECUTIVE_JUDGMENT_ENGINE.md)

## Jessa's Design Pattern

Every VAL experience should move in this order:

```text
Presence
->
Perspective
->
Judgment
->
Action
```

Do not begin with action.

Action earns its place only after VAL has created presence, offered perspective, and demonstrated judgment.

## Home Is Three Executive Questions

Home is not five primary experiences.

Home is not the three living rooms.

Home is being witnessed.

The greeting is the hearth of Home.

The living rooms exist because of the greeting.

After the user is witnessed, Home offers three executive questions:

| Principle | Question | Meaning |
|---|---|---|
| Velocity | What changed? | VAL has noticed movement, drift, risk, or opening. |
| Alignment | What deserves my attention? | VAL has judged what matters now. |
| Leverage | What has already been prepared? | VAL has reduced the cost of beginning. |

People, Projects, Calendar, Inbox, VAL OS, Developer, Settings, Documents, and Lead Intelligence are places the user can go.

Home is where VAL comes to the user.

This is a different relationship than navigation.

## The Greeting Is The Hearth

The Hearth is governed by:

- [VAL_PHASE_13C_THE_HEARTH.md](./VAL_PHASE_13C_THE_HEARTH.md)

The greeting is not a welcome message.

It is the first emotional proof that VAL has been paying attention.

The greeting should answer:

> Did anyone notice what yesterday was like for me?

If the greeting works, the user should feel witnessed before they understand the interface.

The rooms, motion, cards, navigation, and AI output are secondary to that first contract.

## Recognition Before Words

Recognition should happen before reading.

When the user opens VAL, the visual field should already communicate:

- Velocity is active.
- Alignment is calm.
- Leverage has prepared something.

The user should not need to read a paragraph to know whether the room is calm, attentive, or inviting.

Words should confirm recognition.

They should not be the only source of recognition.

## Living Rooms

Internally, code may still call them cards.

Design language should call them rooms.

Living rooms are not alive because they animate.

They are alive because they appear to have agency.

A normal dashboard card says:

> 8 emails require attention.

A living VAL card says:

> I have already reviewed those eight. Only one deserves your attention. Here is why.

Movement should communicate that VAL has already noticed, thought, prepared, or is quietly holding something for the user.

Movement must not decorate the interface.

Each room has memory, conversation, actions, history, understanding, and its own executive question.

## Living Room States

Every homepage room should support three states.

### Resting

Nothing urgent.

The card breathes very subtly, almost imperceptibly.

The room feels calm.

Resting does not mean empty.

It means VAL is watching quietly.

### Attentive

Something changed.

The border catches a little more light.

The card may lift slightly.

It does not bounce, flash, glow, pulse aggressively, or demand attention.

Attentive means:

> I am paying attention.

### Inviting

The card has something worth saying.

It is not urgent.

It does not shout.

It quietly communicates:

> Whenever you are ready.

Inviting is an offer, not an interruption.

## No Dopamine Mechanics

VAL must not use:

- red notification badges
- alarm colors for ordinary work
- bouncing cards
- gamified completion tricks
- urgency counters
- unread-count theater
- notification-dot pressure
- progress theater

There is no red on the homepage except for true safety, security, destructive, or high-risk failure states.

Attention is not the same as alarm.

## KPI Boundary

Stats, KPIs, pipeline numbers, charts, tables, and metric grids do not belong on the VAL homepage.

The main exception is GHL / CRM pipeline data when the user is explicitly inside a CRM, pipeline, or lead-intelligence supporting system.

Even there, numbers should support judgment.

They should not become the experience.

## Design Review Question

Every wireframe review must ask:

> Does this make VAL feel more alive, or more like software?

If the answer is "more like software," the element probably does not belong on the homepage.

This question is a product integrity test.

It applies especially to requests for:

- widgets
- graphs
- notification badges
- KPI blocks
- tables
- metric grids
- extra cards
- generic dashboards

## Homepage Test

A homepage element may exist only if it helps VAL communicate one of these:

1. I noticed something changed.
2. I know what deserves your attention.
3. I prepared something so you do not have to start from zero.
4. I am calm because nothing needs pressure.
5. I need your judgment before anything moves.

If an element cannot pass this test, it belongs in a supporting surface, Context Drawer, Settings, Developer, or nowhere.

## Motion Rule

Motion should communicate state, not personality.

Motion should clarify:

- resting
- attentive
- inviting
- prepared
- waiting for judgment
- safely completed

Motion should never exist merely to make VAL feel futuristic, premium, or animated.

VAL is not impressive because it moves.

VAL is trustworthy because it noticed.

## What This Changes

The Phase 13B audit remains valid.

This design philosophy clarifies the next phase:

- Home should be organized around Velocity, Alignment, and Leverage.
- People and Projects remain important destinations, but not equal homepage columns.
- Chief of Staff, Momentum, and Ready For You become the conceptual engines behind Alignment, Velocity, and Leverage.
- Supporting systems stay available, but they should not compete with the homepage's presence.
- Wireframes must protect awareness before interaction.

## Protected Feeling

The feeling to protect is:

> When I open VAL, someone has already been awake, paying attention on my behalf, and is ready to brief me.

That feeling is not a feature.

It is the product.

## Phase 13C Behavioral Gate

Before Home wireframes, visual design, motion, or implementation, use:

- [VAL_PHASE_13C_HOME_PRESENCE_BEHAVIORAL_CONSTITUTION.md](./VAL_PHASE_13C_HOME_PRESENCE_BEHAVIORAL_CONSTITUTION.md)

This document defines the greeting, living rooms, behavioral states, first interaction, supporting navigation, and Feeling Test for Home.
