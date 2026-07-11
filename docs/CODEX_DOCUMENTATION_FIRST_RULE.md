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
3. Show the user what changed in the documentation.
4. Wait for user feedback or approval.
5. Only then implement code changes.
6. Test locally.
7. Deploy only when appropriate.
8. Update handoff/current-state/next-task docs if the product direction changed.

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
Primary object = connection record.
Supporting object = person packet.
Primary UI = promised connections, reviewable opportunities, and missing-context blockers.
```

Do not implement more relationship-profile, dossier, temperature, open-loop, or history surfaces until the user approves the connection-first documentation.

