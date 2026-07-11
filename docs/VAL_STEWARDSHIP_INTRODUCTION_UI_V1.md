# VAL Stewardship Introduction UI V1

Status: Product/UI documentation only.

Updated: 2026-07-11

Implementation approval required before visible UI changes.

## Purpose

This document defines the simplified Stewardship drawer UI for V1.

Stewardship V1 has one visible job:

```text
Help the executive create valuable introductions.
```

The UI should answer one executive question:

```text
Who should I introduce, and why?
```

Everything else is out of scope for V1.

## Supersedes

For visible Stewardship UI, this document supersedes:

- `docs/VAL_STEWARDSHIP_EXECUTIVE_UI_SORTING_SPEC.md`
- the broad relationship-care portions of `docs/VAL_STEWARDSHIP_PACKET_SORTING_SPEC.md`
- any UI that presents Stewardship as a relationship dashboard, attention queue, CRM, dossier browser, or generic next-move manager

Those documents may remain useful as background architecture, but they should not drive the next visible Stewardship implementation.

The implementation must follow:

```text
docs/VAL_STEWARDSHIP_INTRODUCTION_ENGINE_V1.md
```

## Product Promise

```text
Stewardship helps you make the right introductions by understanding what people need and what they can offer.
```

## Executive Experience

When the executive opens Stewardship, the first screen should feel calm, narrow, and useful.

It should not feel like:

- a list of everyone VAL has ever seen
- a CRM cleanup page
- a relationship scorecard
- a dashboard of vague signals
- a pile of possible actions
- a debugging surface

It should feel like:

```text
Here are the introductions worth considering.
You can also choose two people yourself.
VAL will explain the fit and draft only after evidence is strong enough.
```

## Drawer Structure

The drawer has exactly three primary areas.

1. Suggested Introductions
2. Create An Introduction
3. Network

No other primary Stewardship areas should appear in V1.

Do not show:

- Active Stewardship
- People To Watch
- relationship temperature
- relationship score
- relationship trajectory
- generic action buttons
- open-loop dashboards
- dossiers
- packet maturity labels
- observer labels
- Round Table labels
- source provider names such as GHL

## 1. Suggested Introductions

This is the default view.

Purpose:

Show only introduction opportunities VAL believes are worth executive review.

Empty state:

```text
No suggested introductions are ready yet.

VAL is still learning what people need and offer. You can create an introduction manually or open Network to discover possible matches.
```

Suggested introduction card:

```text
Greg <-> Michele

Why this could matter
Because Greg is looking for executive AI adoption partners, and Michele has spent years helping leadership teams implement AI responsibly.

Confidence
High

Evidence
- Greg discussed AI strategy on July 3.
- Michele's recent conversations focus on executive adoption.

Review Draft
Not Now
```

Required fields:

- Person A
- Person B
- one-sentence fit explanation
- Person A need
- Person B offer
- Person B need, when relevant
- Person A offer, when relevant
- confidence: High, Medium, or Needs review
- evidence from both sides
- Review Draft action
- Not Now action

Rules:

- Do not show a suggestion unless there is evidence from both people.
- Every suggested introduction must have a single clear `Because...` sentence.
- If VAL cannot write that sentence cleanly, the suggestion should not appear.
- Do not show a suggestion merely because two people share a keyword.
- Do not show a suggestion when either identity is unresolved.
- Do not show a suggestion when either person is admitted only through weak or noisy evidence.
- Do not send anything from this screen.
- Review Draft opens an approval surface, not an external send.

## 2. Create An Introduction

Purpose:

Let the executive pick two people and ask VAL to compare their packets.

Required layout:

```text
Create an Introduction

Person A: [search/select]
Person B: [search/select]

[Compare]
```

After both people are selected:

```text
Greg and Michele

Needs
Greg needs: organizations exploring executive AI.
Michele needs: leadership teams ready for responsible AI adoption.

Offers
Greg offers: access to operators evaluating AI workflows.
Michele offers: executive adoption strategy and facilitation.

Why this could matter
Because Greg is actively looking at AI strategy, and Michele helps leaders implement AI responsibly.

Evidence
- Greg discussed AI strategy on July 3.
- Michele's recent conversations focus on executive adoption.

[Draft Introduction]
[Not a Fit]
```

If VAL cannot justify the fit:

```text
I do not see a strong reason to introduce these two yet.

What is missing:
- clear need from Greg
- clear offer from Michele
- evidence that this would be welcome now
```

Rules:

- The user may manually pair any admitted people.
- Manual pairing does not force a positive recommendation.
- Draft Introduction remains blocked until identities and evidence are strong enough.
- The UI should make "not a fit" feel like a responsible outcome, not an error.

## 3. Network

Purpose:

Provide the smallest useful searchable relationship network for introduction workflows.

This is not a CRM.

This is not a dossier browser.

Network is a discovery surface for introductions.

Network supports:

- search
- select a person
- see needs
- see offers
- see how the executive knows them
- see recent evidence
- see best matches automatically
- choose them for a manual introduction

Network row:

```text
Michele Julian
Helps leadership teams adopt AI responsibly.
Needs: teams ready for executive AI implementation.
Offers: strategy, facilitation, adoption support.

Best match: Greg
```

Person detail:

```text
Michele Julian

Needs
- Teams ready for executive AI implementation.

Offers
- Responsible AI adoption strategy.
- Leadership team facilitation.

Relationship
Known through recent VAL / executive AI conversations.

Evidence
- Transcript, July 3: executive AI adoption discussion.
- Sent email, July 5: follow-up on AI implementation.

Best Matches
1. Greg
Because Greg is looking for executive AI adoption partners, and Michele has spent years helping leadership teams implement AI responsibly.

2. Terry
Because Terry needs a trusted nonprofit operator perspective, and Michele can help frame responsible executive adoption.

[Who Should Michele Meet?]
[Use In Introduction]
```

Rules:

- Network must search for best matches automatically when a person is opened.
- If an explicit command is still needed, the button should say `Who Should [Name] Meet?`, not `Find Matches`.
- Network people must be admitted through trusted signals before appearing.
- Trusted signals include recent sent email, recent reply, calendar attendee, meaningful transcript participant, confirmed CRM contact, user-marked important, manual selection, and prior approved introduction history.
- Inbound-only senders do not appear unless another trusted signal admits them.
- Spam, bulk mail, unsubscribe/list senders, no-reply/system addresses, generic mailboxes, receipts, and resource rooms do not appear.
- Calendar attendees are contacts unless they are owner/self, private blocks, resource rooms, system addresses, or generic mailboxes.

## Internal Match Constraints

VAL should compare more than visible needs and offers.

Internally, person packets should also maintain:

```text
Missing Piece / Constraints
```

Examples:

- looking for nonprofit leadership
- not looking for venture capital
- prefers warm introductions only
- avoids vendors
- already knows Greg
- recently declined AI consulting
- already working together
- do not introduce without asking first

Rules:

- Constraints are internal unless they explain a recommendation or block a draft.
- Constraints should prevent technically matching but socially awkward introductions.
- If two people already know each other, VAL should not recommend an introduction unless there is a new, specific reason.
- If one person avoids vendors, VAL should not suggest a vendor-style introduction.
- If someone prefers warm introductions only, VAL should prepare a consent-first draft or block direct introduction drafting.

## Introduction Quality Gate

Every suggested or manually generated introduction must pass this test:

```text
Can VAL write one clean sentence explaining why these two people should meet?
```

The sentence should start with:

```text
Because...
```

Good:

```text
Because Greg is looking for executive AI adoption partners, and Michele has spent years helping leadership teams implement AI responsibly.
```

Weak:

```text
Because both people are connected to AI.
```

If the sentence is weak, generic, keyword-based, or socially awkward, VAL should say:

```text
I do not see a strong reason to introduce these two yet.
```

## Review Draft Surface

Review Draft should show the same information that created the recommendation.

Required content:

```text
Introduction Draft

Introduction
Greg <-> Michele

Why this introduction may matter
...

Evidence
- ...
- ...

Draft
Hi Greg and Michele,
...

[Approve]
[Edit Draft]
[Not Now]
```

Rules:

- The review page must not lose the context from the originating card.
- The draft must be editable before approval.
- Approve means approval to send only if the sending integration is explicitly implemented and confirmed.
- If live sending is not implemented, Approve should save or mark as approved for manual send, not pretend to send.

## Outcome Learning

After an approved introduction, VAL should eventually ask for lightweight outcome feedback.

Prompt:

```text
How did this introduction go?
```

Options:

- Great connection
- Helpful, no next steps
- Did not respond
- Not a good fit
- Skip

Rules:

- This is learning, not analytics.
- Do not show charts or scores in V1.
- Use the outcome to improve future introduction recommendations.

## Visual Contract

The UI should remain consistent with the existing Hearth drawer style:

- frosted white drawer surface
- calm executive typography
- generous spacing
- clear cards with restrained borders
- no dense table as the default view
- no debug-looking copy
- no backend terminology

Cards should be information-dense enough to be useful, but not dossier-like.

The most important button should be:

```text
Review Draft
```

or, for manual mode:

```text
Draft Introduction
```

## Forbidden UI Copy

Do not show these phrases in Stewardship V1:

- packet developing
- active stewardship
- people to watch
- relationship temperature
- relationship score
- executive visibility
- admission status
- observer
- Round Table
- packet maturity
- source posture
- CRM identity needs review, unless the page is specifically an identity review page
- Find Matches
- GHL
- undefined
- supporting source

## Required First Acceptance Case

Terry / Kareemah promised introduction:

If transcripts contain a clear statement that Terry should be introduced to Kareemah, Stewardship should be able to surface:

```text
Terry <-> Kareemah

Why this could matter
The executive explicitly discussed introducing Terry to Kareemah.

Evidence
- Transcript: the user said Terry should meet Kareemah and why.

Review Draft
```

Incorrect outcomes:

- Terry is absent from Network despite transcript evidence.
- Kareemah is present but no match is found.
- VAL only says "no confident introduction is ready" when the transcript explicitly contains the intended introduction.
- The review page drops the transcript reason.
- The UI shows packet/debug language instead of the actual reason.

## Implementation Notes

First implementation should be a visual simplification, not a broader intelligence expansion.

Build in this order:

1. Replace the current Stewardship drawer layout with the three V1 areas.
2. Remove old relationship-dashboard sections and generic action buttons.
3. Use the admitted people endpoint as the selectable Network pool.
4. Add the Create An Introduction two-person selector.
5. Add placeholder suggested-introduction cards only when real evidence exists.
6. Ensure Review Draft carries forward the same needs, offers, why, and evidence.
7. Keep live sending disabled unless explicitly approved.

## Completion Definition

The V1 UI is complete when the executive can:

1. Open Stewardship.
2. See suggested introductions, or a clean empty state.
3. Pick two admitted people.
4. See needs, offers, why it may matter, and evidence.
5. Ask VAL to draft an introduction only when evidence is strong enough.
6. Open Network.
7. See Best Matches automatically for a selected person.
8. Avoid spam/noise/non-contacts in the Network picker.

The UI is not complete if it still feels like a relationship management dashboard.
