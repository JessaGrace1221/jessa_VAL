# VAL Phase 13B UX Architecture Audit

Purpose: define the audit framework for evaluating every existing VAL screen against the Foundation before any UI redesign or implementation begins.

This is the audit framework.

This is not the audit itself.

Completed audit output:

- [VAL_PHASE_13B_UX_ARCHITECTURE_AUDIT_RESULTS.md](./VAL_PHASE_13B_UX_ARCHITECTURE_AUDIT_RESULTS.md)

The purpose of this audit is not to preserve existing screens.

It is to determine whether each screen still deserves to exist within the philosophy of VAL.

Companion specs:

- [VAL_FOUNDATION.md](./VAL_FOUNDATION.md)
- [WHY_VAL_IS_DIFFERENT.md](./WHY_VAL_IS_DIFFERENT.md)
- [VAL_DO_NOT_REGRESS.md](./VAL_DO_NOT_REGRESS.md)
- [VAL_PRODUCT_PHILOSOPHY_AND_INFORMATION_ARCHITECTURE.md](./VAL_PRODUCT_PHILOSOPHY_AND_INFORMATION_ARCHITECTURE.md)
- [VAL_UI_COMPONENT_SYSTEM.md](./VAL_UI_COMPONENT_SYSTEM.md)
- [VAL_USER_JOURNEYS.md](./VAL_USER_JOURNEYS.md)

## Guardian Requirement

Before auditing any screen, act as the Guardian of the VAL Foundation.

Verify that recommendations comply with the Foundation documents.

If a screen conflicts with the Foundation, do not decorate it.

Recommend a compliant redesign, merge, or deletion.

If preserving the screen would require changing the Foundation, flag that as a human-review decision.

## Audit Principle

Every screen must earn its place.

A screen earns its place by helping the user:

1. Recognize something true.
2. Prepare something meaningful.
3. Make a wiser decision.

If a screen does none of these, it should be deleted, merged, or moved to Developer/Settings.

## Audit Template

| Screen | Current Purpose | Executive Question | Recognition First? | Foundation Alignment (1-10) | Executive Value (1-10) | Recommendation | Notes |
|---|---|---|---|---:|---:|---|---|
|  |  |  | yes/no/partial |  |  | keep/merge/replace/delete |  |

## Required Screen Questions

For every existing screen, answer:

1. Why does this screen exist?
2. Which executive question does it answer?
3. Does it begin with recognition before interaction?
4. Does it expose judgment instead of raw data?
5. Does it reduce cognitive load?
6. Does it preserve human agency?
7. Does it honor approval safety where actions exist?
8. Does it belong in a primary experience, supporting system, context drawer, Developer, Settings, or nowhere?
9. Does it honor the Foundation?
10. Should it live, merge, be replaced, or disappear?

## Foundation Alignment Score

Foundation Alignment measures whether the screen honors VAL's philosophy, constitutional architecture, product language, component system, and do-not-regress guardrails.

| Score | Meaning | Default Action |
|---:|---|---|
| 9-10 | Strongly aligned | Preserve or refine |
| 7-8 | Mostly aligned, but needs careful redesign | Redesign carefully |
| 5-6 | Partially aligned but structurally weak | Merge or substantially replace |
| 1-4 | Philosophically inconsistent | Delete unless there is a compelling operational reason |

Anything below 8 cannot move forward unchanged.

## Executive Value Score

Executive Value measures whether the screen meaningfully improves judgment, attention, preparation, relationship understanding, capacity, momentum, or agency.

| Score | Meaning | Default Action |
|---:|---|---|
| 9-10 | Essential | Preserve or make central |
| 7-8 | Valuable | Keep, refine, or integrate into a primary journey |
| 5-6 | Secondary | Merge, hide, or move to supporting surface |
| 1-4 | Does not meaningfully improve executive judgment | Delete, hide, or move to Developer/Settings only if operationally necessary |

A screen should not survive as a primary experience unless it scores well on both Foundation Alignment and Executive Value.

## Recommendation Values

Use one of these recommendation values:

- `keep`
- `refine`
- `merge`
- `replace`
- `delete`
- `move_to_context_drawer`
- `move_to_developer`
- `move_to_settings`
- `defer`

Definitions:

- `keep`: screen is already aligned and valuable.
- `refine`: screen works conceptually but needs design/content improvements.
- `merge`: screen belongs inside another experience.
- `replace`: current screen is wrong, but the destination still matters.
- `delete`: screen does not deserve to exist.
- `move_to_context_drawer`: content is useful only as supporting context.
- `move_to_developer`: content is useful for builders/debugging, not daily users.
- `move_to_settings`: content is configuration, not an executive experience.
- `defer`: decision requires human product review.

## Audit Output Sections

The completed audit should be grouped into:

1. Screens to Preserve or Refine
2. Screens to Merge
3. Screens to Replace
4. Screens to Delete
5. Screens to Move to Context Drawer
6. Screens to Move to Developer
7. Screens to Move to Settings
8. Human Review Required
9. Reusable Components Identified
10. Missing Components Needed

## Screen Inventory Requirements

The audit must inspect:

- Routes
- Top-level pages
- Modals
- Drawers
- Dashboards
- Workspaces
- Admin/debug screens
- Settings/configuration pages
- Legacy screens
- Empty states
- Review queues
- Action/approval surfaces

Do not assume the visible navigation is the complete product.

If a screen exists in code but is not visible in navigation, include it.

## Product Regression Checks

For each screen, check whether it risks any of these regressions:

- Homepage becoming a dashboard
- People becoming CRM
- Projects becoming project management
- Momentum becoming analytics
- Ready For You becoming a draft folder
- Executive Inbox becoming an inbox clone
- Calendar becoming agenda-only
- Working Together becoming ChatGPT
- Teach VAL becoming prompt editing
- VAL OS becoming brittle automation rules
- Developer leaking into primary UX
- External actions becoming ambiguous

## Stop Rule

Phase 13B should not redesign screens while auditing them.

It may recommend redesign direction.

It should not produce final wireframes.

The goal is to decide what deserves to exist before deciding what it should look like.

## Human Review Gate

After the audit is complete, pause for human review.

Do not proceed to wireframes or implementation until the screen recommendations are reviewed.

This is where product judgment matters most.
