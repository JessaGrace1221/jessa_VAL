# VAL Co-Work With VAL V1 Build Spec

Status: Approved architecture contract. The implementation starts from the canonical entry-point registry, not from a generic chat launcher.

Purpose: define the executive-grade Co-Work with VAL experience.

Co-Work is not a small widget, chat bubble, or tucked-away input. It is the user's working room with VAL.

Companion contract:

- [VAL_COWORK_ENTRYPOINT_REGISTRY.md](./VAL_COWORK_ENTRYPOINT_REGISTRY.md): the required context, question sequence, completion condition, write target, and approval boundary for every active Co-Work entry point.
- [VAL_COWORK_SYSTEM_WIDE_CARRY_FORWARD_CONTRACT.md](./VAL_COWORK_SYSTEM_WIDE_CARRY_FORWARD_CONTRACT.md): the event ledger, recipient routing, delivery receipts, and no-orphan invariant for every response and applied result.

No new `Co-Work` or `Co-Work with VAL` button may be added until it has a registry entry. No registered button may fall through to unscoped generic chat.

Saving message history alone is not completion. Every response and applied result must create a durable carry-forward event, and the Chief of Staff, Round Table, originating packet and drawer, and every exact linked project and relationship must receive inspectable delivery receipts.

## Product Promise

Co-Work with VAL should feel like a clean, powerful executive workspace:

```text
Previous conversations on the left.
Open working space in the center.
Clear input at the bottom.
Obvious voice options.
Scoped context when opened from a drawer, card, source, project, email, transcript, or action.
```

The user should immediately understand:

- where they are
- what context VAL is holding
- what conversation they are in
- how to type
- how to speak
- how to return to the previous surface
- whether anything external can happen

## First Principle

Co-Work should work more like ChatGPT than like a small panel.

The page should be calm, spacious, and functional on both desktop and mobile.

Do not make the executive hunt for the voice option. Voice should be visible, labeled, and easy to start.

## Core Layout

Desktop layout:

```text
Left sidebar
  -> New Co-Work
  -> Recent conversations
  -> Search conversations
  -> Scoped context label when relevant

Main workspace
  -> conversation header
  -> context strip
  -> message thread / open work area
  -> prepared artifacts or action cards when relevant
  -> large input composer

Right rail, optional only when useful
  -> source/context summary
  -> attached files
  -> suggested next actions
  -> voice/session controls
```

Mobile layout:

```text
Top bar
  -> Back
  -> conversation title
  -> voice button

Main workspace
  -> context strip
  -> message thread / work area
  -> large input composer

Conversation list
  -> opens as drawer/sheet
```

## Left Conversation Sidebar

The left side should show previous conversations.

Required items:

- New Co-Work
- Search conversations
- Recent conversations, ordered most recently updated first
- conversation title
- last updated time or short recency label
- source/scope badge when relevant, such as `Project`, `Email`, `Transcript`, `Home`, `General`

The sidebar should not feel like a CRM list. It should feel like a working-history notebook.

If no conversations exist:

```text
No previous Co-Work conversations yet.
```

## Main Workspace

The main area should be open and uncluttered.

Required header:

```text
Co-Work with VAL
Conversation title
Scope/context label
Back or return control
```

The main workspace should show:

- user's messages
- VAL's responses
- prepared artifacts when VAL creates them
- action cards only when useful
- quiet receipts when VAL saves or prepares something

The main workspace should not show:

- raw packet dumps
- debug context
- backend observer language
- huge source blobs
- unexplained JSON

## Context Strip

When Co-Work opens from a specific place, show a small context strip near the top.

Examples:

```text
Scoped to: Anthony email thread
Scoped to: HelpByShopping Foundation Launch
Scoped to: Terrie transcript
Scoped to: Alignment open loop
```

The context strip should be compact. It should not expose all hidden packet context.

It should answer:

- what VAL is allowed to use
- what VAL is not allowed to do without approval

Example:

```text
VAL is using this email thread, linked project context, and attached source receipts. Nothing external will be sent without approval.
```

## Input Composer

The input composer should be large, obvious, and comfortable.

Required controls:

- multiline text input
- Send button
- Voice button
- Attach/upload button
- optional image button only when image generation is enabled

The Send button must send the message and render VAL's response.

The input composer should not be squeezed into a tiny row when the workspace is open.

## Voice UX

Voice must be obvious.

Required voice controls:

- visible `Voice` button in the composer
- visible microphone icon or voice symbol
- listening state
- stop/pause control
- transcript preview while speaking or immediately after
- clear state for when VAL is thinking
- clear fallback if microphone access fails

Voice should support:

- dictate a prompt
- brainstorm out loud
- continue a Co-Work thread
- capture additional context
- answer VAL's missing-context questions

Voice should not:

- start recording silently
- hide the transcript from the user
- send external actions
- bury microphone permission failure

Voice state examples:

```text
Listening...
Paused
Transcribing...
VAL is thinking...
Microphone access is blocked. You can still type here.
```

## Scoped Co-Work

Co-Work must preserve the context boundary from the surface that opened it.

Examples:

- Email Co-Work uses the selected email thread, relationship packet, linked project files, and attached source receipts.
- Project Co-Work uses the selected project and selected project action.
- Transcript Co-Work uses the selected transcript and linked relationship/project context.
- Home Co-Work uses the current Home state unless the user explicitly selects a source.

Do not let Co-Work borrow unrelated context just because it exists in VAL.

## External Action Safety

Co-Work can think, draft, compare, plan, summarize, ask questions, and prepare artifacts.

Co-Work must not:

- send email
- send SMS
- create calendar events
- update CRM
- assign tasks
- publish documents
- charge/invoice
- mutate external systems

unless the user approves through the relevant action surface.

Co-Work should say clearly:

```text
Nothing external has happened.
```

when appropriate.

## Conversation Persistence

Co-Work conversations should save and reload.

Required:

- new conversation creation
- conversation title
- message history
- source/scope metadata
- created/updated time
- saved state receipt or failure notice

If saving fails:

```text
VAL responded, but this conversation may not have been saved.
```

## Prepared Artifacts Inside Co-Work

When VAL prepares something in Co-Work, it should appear as a clear artifact card, not buried in the chat text.

Artifact examples:

- email draft
- project plan update
- stakeholder message
- task list
- meeting agenda
- introduction draft
- document outline

Artifact card should show:

```text
What VAL prepared
Why VAL prepared it
What evidence/context it used
What needs approval
What happens if approved
```

Approval should route through the relevant drawer/action surface, not happen silently inside chat.

## Mobile Requirements

On mobile:

- conversation list opens as drawer/sheet
- composer stays visible and reachable
- Voice button remains obvious
- Send button remains obvious
- messages do not hide behind fixed controls
- text does not overflow buttons
- context strip stays compact
- no horizontal scrolling

## Desktop Requirements

On desktop:

- left conversation sidebar is visible by default
- main work area has generous width
- composer is comfortable for long executive dictation/text
- voice controls are visible without opening a menu
- previous conversations are readable without crowding the work area

## Visual Direction

Co-Work should be:

- clean
- spacious
- quiet
- executive-functional
- low-friction
- confidence-building

It should not be:

- decorative
- cramped
- card-inside-card heavy
- debug-like
- over-explained
- visually noisy

## V1 Acceptance Criteria

Co-Work V1 is acceptable only if:

1. Opening Co-Work shows a full workspace, not a small widget.
2. Desktop shows previous conversations on the left.
3. Mobile provides an obvious conversation list drawer/sheet.
4. The main workspace has a clear message thread and open work area.
5. The input composer is large and clear.
6. Send reliably produces a VAL response.
7. Voice is visible without hunting.
8. Voice has clear listening, paused, transcribing, and error states.
9. Scoped Co-Work clearly shows what context VAL is using.
10. Co-Work does not leak unrelated context.
11. Co-Work does not mutate external systems without approval.
12. Conversation saving/reload is visible and reliable.

## Implementation Notes

Existing routes and concepts to preserve:

- `/api/val/chat`
- `/api/val/conversations`
- `/api/val/conversations/:id/messages`
- `cowork_packet`
- existing scoped Co-Work click contracts
- existing no-external-action safety rules

The current Hearth Co-Work widget should be treated as an entry point into this full workspace, not as the final V1 experience.
