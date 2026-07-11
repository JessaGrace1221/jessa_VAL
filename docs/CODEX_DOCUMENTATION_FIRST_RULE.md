# Codex Documentation-First Rule

Updated: 2026-07-11

Purpose: protect Jessa VAL from Codex implementing product changes before the user has reviewed the product definition.

## Rule

Going forward, Codex must document the intended product/architecture change before changing runtime behavior.

The user needs to review and give feedback on documentation first.

This applies especially to:

- Stewardship
- packet architecture
- prompt layering
- Round Table behavior
- drawer redesigns
- inbox, transcript, project, task, document, and onboarding workflows
- any change that affects what the executive sees or how VAL decides what matters

## Required Sequence

For non-trivial product work, Codex must follow this order:

1. Read the current handoff and relevant source-of-truth docs.
2. Draft or update the relevant documentation.
3. Show the user what changed in the documentation, including what the new documentation replaces or deprecates.
4. Wait for explicit implementation approval.
5. Only then implement code changes.
6. Test locally.
7. Deploy only when appropriate.
8. Update handoff/current-state/next-task docs if the product direction changed.

## Approval Standard

Codex must not infer implementation approval from discussion, feedback, enthusiasm, clarification, emotional agreement, or partial agreement.

Implementation may begin only after the user gives a direct instruction such as:

- `Approved. Implement this documentation.`
- `This product definition is correct. Proceed to code.`
- `Build exactly what is documented here.`

Statements such as the following do not count as implementation approval:

- `This is better.`
- `We are getting closer.`
- `I like this direction.`
- `What do you think?`
- `Add one more thing.`
- `Yes, but...`

When approval is unclear, Codex must remain in documentation mode.

## Required Documentation Change Summary

Before requesting implementation approval, Codex must show:

1. What product behavior is being introduced.
2. What existing behavior it replaces.
3. What existing behavior remains valid.
4. What is now deprecated.
5. Which existing UI, prompts, data fields, services, and tests conflict with the new definition.
6. What must be removed or prevented from rendering.
7. What is explicitly outside the scope of the next implementation.

Codex must not preserve contradictory legacy behavior merely because it already exists.

## Required Product Example

For any change affecting executive-facing behavior, the documentation must include at least one complete example showing:

1. The source evidence received.
2. The identity or entity resolution expected.
3. The packet or durable record created or updated.
4. The reasoning output expected.
5. The exact executive-facing result.
6. The action available to the user.
7. The approval gate.
8. The incorrect outputs that must not appear.

The example is part of the product contract, not optional illustration.

## What Counts As Documentation

Documentation may include:

- product spec
- acceptance test
- data model
- prompt-layering contract
- UI contract
- source authority rules
- non-negotiables
- implementation sequence
- explicit "do not build" list

For VAL, documentation should be specific enough that another senior engineer can implement without reinterpreting the user's product philosophy.

## What Not To Do

Do not treat a conversation as permission to implement.

Do not jump from user feedback directly into code if the feedback changes product direction.

Do not create a UI patch first and explain it afterward.

Do not ship "temporary" behavior that violates the current product definition.

Do not bury major product decisions only in chat. Put them in docs.

## Small Exception

Tiny typo fixes, broken-link fixes, or emergency revert/repair work may be done directly when the user explicitly asks for that narrow fix.

Even then, if the fix changes product behavior, document the change afterward.

## Current Stewardship Application

For Stewardship specifically, the next work must document and receive feedback on the connection-first correction before implementation.

The current direction is:

```text
Stewardship = Network Connection System.
Primary product outcome = a valuable, responsible connection.
Primary knowledge object = person packet.
Primary action object = connection commitment or connection opportunity.
Primary UI = promised connections, reviewable opportunities, and missing-context blockers.
```

Do not implement more relationship-profile, dossier, temperature, open-loop, or history surfaces until the user approves the connection-first documentation.

The first required Stewardship product example is the Terrie and Kareemah connection case:

```text
The user states in a transcript that they will introduce Terrie to Kareemah.
```

The documentation must show how this becomes resolved person identities, updated person packets, an explicit connection commitment, source-backed context, a clear reason the connection matters, a prepared introduction when sufficient context exists, a Stewardship review item, a Leverage draft, and no external action without user approval.
