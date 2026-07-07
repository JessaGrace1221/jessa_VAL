# VAL Phase 13C.5 - Home Choreography

Purpose: define how VAL Home moves from presence into deeper work without becoming page navigation.

Status: Phase 13C interaction behavior spec.

Companion specs:

- [VAL_PHASE_13C_THE_HEARTH.md](./VAL_PHASE_13C_THE_HEARTH.md)
- [VAL_PHASE_13C_EXECUTIVE_JUDGMENT_ENGINE.md](./VAL_PHASE_13C_EXECUTIVE_JUDGMENT_ENGINE.md)
- [VAL_PHASE_13C_EXECUTIVE_ENVIRONMENT_RETRIEVAL_SYSTEM.md](./VAL_PHASE_13C_EXECUTIVE_ENVIRONMENT_RETRIEVAL_SYSTEM.md)

## Constitutional Rule

Home does not move between pages.

Home moves between distances.

The office, Hearth, window, desk, and living rooms preserve the user's executive perspective. The user should never feel dropped into software after choosing a room.

## Core Pattern

VAL Home follows Jessa's design pattern:

```text
Presence
->
Perspective
->
Judgment
->
Action
->
Return
```

Action is never first.

Action is earned by presence, perspective, and judgment.

## Distance One - Presence

The user arrives.

The Hearth speaks first.

The living rooms wait below as secondary presence.

Nothing demands interaction.

The user should feel witnessed, oriented, and less mentally burdened before choosing anything.

## Distance Two - Perspective

The user does not open a room.

The user walks toward a conversation.

The office remains visible. The Hearth softens but does not disappear. The selected room becomes more present while the others recede.

This should feel like moving three feet closer, not navigating away.

## Distance Three - Judgment

The desk becomes the Decision Workspace.

Evidence should feel placed on the desk, not rendered as generic panels.

VAL speaks in this order:

```text
Meaning
->
Evidence
->
Recommendation
```

The workspace should answer:

- What changed?
- Why does it matter?
- What does VAL think deserves attention first?
- What has already been prepared?

## Distance Four - Action

Actions appear only after judgment.

Actions should feel like signing, approving, sending, scheduling, ignoring, or teaching VAL.

They should not feel like generic software buttons.

Possible actions:

- Approve
- Review
- Draft
- Call
- Schedule
- Ignore
- Teach VAL

## Distance Five - Return

Leaving the workspace is not closing a modal.

It is returning to the Hearth.

The papers organize themselves. The desk clears. The Hearth comes back into focus. The user remains in the office.

## Prototype Rule

The first prototype should prove one room only.

Velocity is the recommended first room because it can demonstrate the whole choreography:

```text
Presence: The Hearth witnesses the day.
Perspective: Velocity is selected.
Judgment: The desk presents what changed and why it matters.
Action: The user can review, approve, or teach VAL.
Return: The workspace clears and the Hearth regains focus.
```

## Acceptance Test

The Home choreography succeeds if:

- Choosing a room feels like approaching a conversation, not opening a page.
- The mountain/window/office never disappears.
- The Hearth remains present even when softened.
- The desk becomes the place where judgment is laid out.
- Actions appear after meaning and evidence.
- Returning feels like coming back to the Hearth, not dismissing a modal.
- The user remains at the place of perspective the entire time.
