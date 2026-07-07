# VAL Phase 13C.4 - The Hearth

Purpose: define the emotional center of VAL Home and the first visual expression of the Daily Witness Greeting.

Status: Phase 13C UI behavior spec.

The Hearth is not the next section of Home.

The Hearth is the irreducible unit of VAL.

Companion specs:

- [VAL_FOUNDATION.md](./VAL_FOUNDATION.md)
- [VAL_DESIGN_PHILOSOPHY.md](./VAL_DESIGN_PHILOSOPHY.md)
- [VAL_PHASE_13C_HOME_PRESENCE_BEHAVIORAL_CONSTITUTION.md](./VAL_PHASE_13C_HOME_PRESENCE_BEHAVIORAL_CONSTITUTION.md)
- [VAL_PHASE_13C_DAILY_WITNESS_GREETING_SYSTEM.md](./VAL_PHASE_13C_DAILY_WITNESS_GREETING_SYSTEM.md)
- [VAL_PHASE_13C_DAILY_WITNESS_GREETING_IMPLEMENTATION_PLAN.md](./VAL_PHASE_13C_DAILY_WITNESS_GREETING_IMPLEMENTATION_PLAN.md)
- [VAL_PHASE_13C_HOME_CHOREOGRAPHY.md](./VAL_PHASE_13C_HOME_CHOREOGRAPHY.md)
- [VAL_PHASE_13C_EXECUTIVE_JUDGMENT_ENGINE.md](./VAL_PHASE_13C_EXECUTIVE_JUDGMENT_ENGINE.md)
- [VAL_HOMEPAGE_WITNESS_SYSTEM.md](./VAL_HOMEPAGE_WITNESS_SYSTEM.md)
- [VAL_DO_NOT_REGRESS.md](./VAL_DO_NOT_REGRESS.md)

## The Hearth

The Hearth is the emotional center of VAL.

It is not a banner.

It is not a hero section.

It is not a greeting component.

It is where VAL demonstrates that it has been paying attention before the user arrived.

Every interaction on Home begins here.

Before judgment.

Before action.

Before navigation.

The Hearth restores executive presence.

## Interaction Order

The Hearth follows Jessa's personal design pattern:

```text
Presence
->
Perspective
->
Judgment
->
Action
```

The Hearth creates presence first.

The greeting offers perspective.

The living rooms express judgment.

Only then should the interface invite action.

## What The Hearth Contains

The Hearth contains three acts of care:

1. Witnessing
2. Orientation
3. Permission

These are not content slots.

They are the emotional sequence of arrival.

## Witnessing

Witnessing says:

```text
I saw yesterday.
```

Witnessing does not summarize data.

It recognizes the lived experience behind the data.

Do not say:

```text
You had four meetings and completed two tasks.
```

Prefer:

```text
Yesterday asked a great deal of your attention.
```

Witnessing names what was carried, closed, protected, endured, prepared, or released.

It should feel accurate without feeling invasive.

## Orientation

Orientation says:

```text
Here is where today stands.
```

Orientation gives the user a simple felt sense of the day before any interaction.

It may name:

- Whether the day is spacious, dense, reactive, protected, or open.
- Whether one meaningful commitment deserves attention.
- Whether work has already been prepared.
- Whether the evening should close rather than extend.
- Whether VAL is choosing restraint because the signal is light.

Orientation should reduce mental noise.

It should not create a new management task.

## Permission

Permission says:

```text
You do not have to carry everything.
```

This may become one of the most loved parts of VAL.

Permission is not advice.

Permission is stewardship.

Examples:

```text
Protect that space.
```

```text
There is no need to rush.
```

```text
The work can wait until tomorrow.
```

```text
Let's keep today spacious.
```

The permission line should leave the user with more agency, not more pressure.

## Not Text, A Fireplace

The Hearth should not be designed as text on a screen.

It should be designed as a fireplace.

Sometimes the fire is quiet.

Sometimes it is warm.

Sometimes it is brighter because something wonderful happened.

Sometimes it is almost embers because today is meant for rest.

The content changes.

The feeling remains.

## Visual Principle

The Hearth should feel like light entering the room.

It should not have a visible border.

No card.

No container.

No box.

The living rooms, navigation, and supporting systems may be architectural elements.

The Hearth is the sunrise itself.

It gives meaning to every component below it.

## Relationship To The Living Rooms

The living rooms are secondary presence.

They should never compete with the Hearth.

The Hearth always speaks first.

Only after that should the user notice:

- Velocity
- Alignment
- Leverage

The sequence should feel almost cinematic:

```text
Arrive.
Be witnessed.
Understand the day.
Receive permission.
Notice the rooms waiting below.
Choose where to step deeper.
```

The living rooms exist because of the Hearth.

They are not the center of Home.

They are where the witnessed state becomes executive action.

## First Interaction

The first interaction with the Hearth should not feel like opening a widget.

It should feel like leaning closer.

When the user engages the Hearth, VAL may reveal:

```text
Why I am saying this today
```

This should expose transparent judgment, not hidden magic.

Example:

```text
Yesterday contained:

- Three client conversations.
- One emotionally difficult meeting.
- Two important decisions.
- Everything else has already been organized.
```

The purpose is not explanation for its own sake.

The purpose is trust.

The user should be able to see enough evidence to understand VAL's judgment without being dragged into raw data management.

## Hearth States

The Hearth may express these states:

### Quiet

Signal is light.

VAL says less.

The fire is low and steady.

### Witnessing

Yesterday or the current day has a meaningful shape.

VAL names it with care.

The fire is warm.

### Protective

The user is at risk of unnecessary load, context switching, or overextension.

VAL gives permission to protect capacity.

The fire creates shelter.

### Celebratory

Something meaningful closed, resolved, shipped, or became lighter.

VAL recognizes what the moment represented.

The fire brightens.

### Evening

The day should close.

VAL helps the user set work down.

The fire softens.

### Restrained

Confidence is low, data is sparse, or signals are contradictory.

VAL chooses humility.

The fire remains present without claiming too much.

## Constitutional Prohibitions

The Hearth may never:

- Become a dashboard header.
- Lead with counts, KPIs, unread badges, charts, or metrics.
- Compete visually with the living rooms.
- Perform motivation.
- Flatter the user.
- Overstate uncertain evidence.
- Reveal sensitive details unless confidence and relevance are high.
- Ask the user to manage software.
- Feel like a notification center.
- Make productivity the opening emotion.

The Hearth exists to restore presence, not to accelerate clicking.

## Screenshot Memory

If someone screenshots VAL, they should immediately notice the living rooms.

If someone uses VAL every morning, the thing they should remember is the Hearth.

The architecture may be what people admire.

The Hearth is what they would quietly miss.

## Acceptance Test

The Hearth succeeds if, before any interaction, the user feels:

- Witnessed
- Oriented
- Less mentally burdened
- Curious about the day ahead
- Safe enough to think

Not productive.

Not motivated.

Not excited.

Those may come later.

The first promise is presence.

## Design Review Questions

Before accepting Hearth work, ask:

1. Does this feel like VAL has already been paying attention?
2. Does this create an emotional pause before action?
3. Does witnessing come before navigation?
4. Does the permission line reduce what the user feels they must carry?
5. Does the visual treatment feel like light, not a component box?
6. Does the first interaction feel like leaning closer, not opening a widget?
7. If all numbers disappeared, would the Hearth still be useful?
8. Would the user miss this if they had to start tomorrow without it?

If the answer to any of these is no, the Hearth is not ready.
