# VAL Phase 13C.3 - Daily Witness Greeting Implementation Plan

Purpose: translate the Daily Witness Greeting constitution into buildable behavior.

Status: implementation bridge.

This document does not define the greeting's soul.

It defines how VAL arrives at the greeting without reducing it to a template.

Companion specs:

- [VAL_FOUNDATION.md](./VAL_FOUNDATION.md)
- [VAL_PHASE_13C_DAILY_WITNESS_GREETING_SYSTEM.md](./VAL_PHASE_13C_DAILY_WITNESS_GREETING_SYSTEM.md)
- [VAL_PHASE_13C_HOME_PRESENCE_BEHAVIORAL_CONSTITUTION.md](./VAL_PHASE_13C_HOME_PRESENCE_BEHAVIORAL_CONSTITUTION.md)
- [VAL_HOMEPAGE_WITNESS_SYSTEM.md](./VAL_HOMEPAGE_WITNESS_SYSTEM.md)
- [VAL_DESIGN_PHILOSOPHY.md](./VAL_DESIGN_PHILOSOPHY.md)

## Bridge Sequence

VAL's UI should be built in this order:

```text
Foundation
  -> Behavior
  -> Implementation
  -> UI
```

Foundation answers:

> Why does VAL behave this way?

Behavior answers:

> What should the user experience?

Implementation answers:

> How does VAL arrive at that behavior?

UI answers:

> How is that behavior expressed visually?

The Daily Witness Greeting must follow this order.

Do not implement visual greeting treatment before the implementation judgment model exists.

## Greeting Pipeline

The greeting pipeline is:

```text
Evidence Collection
  -> Meaning Extraction
  -> Contradictions Resolver
  -> Greeting State Selection
  -> Greeting Intent Selection
  -> Greeting Composition
  -> Restraint Filter
  -> Final Gate
  -> Home Rendering
```

VAL should not summarize data.

VAL should summarize meaning.

## Evidence Collection

Evidence Collection gathers signals from existing systems.

It should not decide what the greeting says.

It should produce a structured evidence packet.

Initial sources:

- Calendar: yesterday, today, tomorrow, meeting density, after-hours work, breaks.
- Tasks / Commitments: completed, carried over, created, overdue, calendarized, meaningful completions.
- Drafts / Ready For You: proposals, replies, approval packets, prepared work.
- Transcripts: recent meetings, decisions, open loops, explicit emotional context, strategic breakthroughs.
- Executive Inbox: meaningful replies, high-signal conversations, waiting loops, important senders.
- Teach VAL: user preferences, family/context boundaries, work rhythms, priority rules.
- Projects / Relationships: recent movement, blocked loops, important people, active work.
- VAL OS / External Actions: approved behaviors, pending review, action receipts.
- User corrections: feedback about what VAL got wrong or should notice differently.

Evidence items should include:

```json
{
  "source_type": "calendar|task|draft|transcript|email|teach_val|project|relationship|val_os|receipt",
  "source_id": "",
  "title": "",
  "summary": "",
  "occurred_at": "",
  "confidence": 0.0,
  "sensitivity": "low|medium|high",
  "user_visible": true
}
```

## Meaning Extraction

Meaning Extraction converts evidence into the story behind the data.

Example evidence:

- 5 meetings
- 2 proposals sent
- calendar until 7 PM
- one transcript mentioning frustration
- two tasks completed
- one important reply from Greg

Meaning Extraction might conclude:

- high context switching
- significant emotional effort
- one major business milestone
- today has unusually low demand
- user would benefit from permission to think

Those meanings are what the greeting uses.

Meaning Extraction output:

```json
{
  "previous_day_shape": "",
  "current_day_shape": "",
  "observed_patterns": [],
  "effort_read": "",
  "outcome_read": "",
  "capacity_read": "",
  "relationship_read": "",
  "workload_read": "",
  "prepared_work_read": "",
  "meaning_candidates": [
    {
      "meaning": "",
      "supporting_evidence_ids": [],
      "confidence": 0.0,
      "sensitivity": "low|medium|high"
    }
  ]
}
```

## Contradictions Resolver

Sometimes evidence will not agree.

Example:

- Calendar says busy day.
- Tasks say nothing completed.
- Email says seven meaningful conversations.
- Transcript says huge strategic breakthrough.

Potentially all of those are true.

The implementation should not pick one signal.

It should decide:

> What is the truest story of the day?

Contradiction resolution should identify:

- dominant story
- secondary story
- conflicting signals
- what not to overstate
- whether the greeting should choose restraint

Contradictions Resolver output:

```json
{
  "dominant_story": "",
  "secondary_story": "",
  "conflicting_signals": [],
  "resolution": "synthesize|choose_dominant|choose_restraint|defer_to_silence",
  "confidence": 0.0,
  "do_not_overstate": []
}
```

## Greeting State Selection

Greeting State describes the broad emotional weather.

Possible states:

- clear_morning
- quiet_morning
- heavy_morning
- momentum_morning
- recovery_morning
- completion
- unexpected_win
- protective
- midday
- evening
- difficult_day
- exceptional_event
- unknown

State is not tone.

State describes what kind of moment VAL is greeting.

## Greeting Intent Selection

Greeting Intent describes the act of service the greeting performs.

Possible intents:

- recognize
- protect
- celebrate
- reassure
- refocus
- invite
- ground
- encourage_rest
- prepare

These are not emotions.

They are acts of service.

The greeting should have one primary intent and optionally one secondary intent.

Example:

```json
{
  "primary_intent": "protect",
  "secondary_intent": "encourage_rest",
  "reason": "Yesterday had high context switching and today has lower demand."
}
```

## Uncertainty Pathways

Fallback behavior should distinguish different kinds of uncertainty.

### First Day

No history.

VAL is observant but humble.

Greeting posture:

```text
Good morning, Jessa.

I am still learning the shape of your days.
For now, I will keep this quiet and only surface what earns your attention.
```

### Sparse Data

Some signals.

Low confidence.

Use gentle language:

- It looks like...
- I do not have much new signal yet...
- From what I can see...

### Contradictory Data

Conflicting evidence.

Choose restraint.

Avoid forcing one confident story.

### Rich Context

High confidence.

Speak naturally and directly.

### Exceptional Event

Exceptional events deserve their own pathway.

Examples:

- court
- bereavement
- major launch
- travel
- large project completion
- medical event
- high-stakes client decision
- family milestone

Exceptional event rules:

- Do not treat the event like ordinary productivity context.
- Do not mention sensitive events unless explicitly known and appropriate.
- Prefer restraint over cleverness.
- Offer permission, grounding, or protection.
- Keep the greeting short.

## Greeting Composition

Greeting Composition uses:

- meaning extraction
- contradiction resolution
- greeting state
- greeting intent
- confidence
- calibration library
- user preferences

It should produce:

- internal understanding
- user output

Canonical output contracts are defined in:

- [VAL_PHASE_13C_DAILY_WITNESS_GREETING_SYSTEM.md](./VAL_PHASE_13C_DAILY_WITNESS_GREETING_SYSTEM.md)

Composition rules:

- Use one to four short lines.
- Mention only what is earned.
- Prefer specific meaning over generic warmth.
- Avoid counts unless they carry meaning.
- Use confidence to soften certainty.
- Write as VAL, not as a coach.

## Restraint Filter

Before the greeting reaches Home, VAL should apply a Restraint Filter.

The filter may remove:

- low-confidence emotional claims
- sensitive topics
- implementation details
- raw counts
- anything that creates unnecessary cognitive load
- anything that sounds like praise instead of recognition
- anything that tries too hard

The filter must populate `things_intentionally_not_mentioned`.

Restraint Filter output:

```json
{
  "approved_lines": [],
  "removed_lines": [
    {
      "line": "",
      "reason": "low_confidence|too_sensitive|too_noisy|too_generic|too_much|not_kind|not_earned"
    }
  ],
  "things_intentionally_not_mentioned": []
}
```

## Final Gate

Before a greeting is rendered, VAL silently asks:

1. Is this true?
2. Is this useful?
3. Is this kind?
4. Is this earned?
5. Would I say this if the user knew exactly how I reached this conclusion?
6. Does this reduce cognitive load instead of adding to it?
7. Does this help the user begin the day with greater clarity?

Only if all seven answers are yes should the greeting reach Home.

If any answer is no, VAL should revise, shorten, soften, or choose silence.

Final Gate output:

```json
{
  "passed": true,
  "failed_checks": [],
  "revision_instruction": "",
  "final_display_greeting": "",
  "final_greeting_lines": []
}
```

## Home Rendering

Home renders:

- `display_greeting`
- `greeting_lines`
- optional `permission_line`
- living rooms

Home does not usually render:

- confidence
- evidence
- internal understanding
- things intentionally not mentioned

Those should remain available to Context / Developer / future inspection surfaces when appropriate.

## Uniqueness Rule

The greeting is the first evidence that the user's VAL is unique.

Two users may have identical calendars, inboxes, and task lists.

They should still not receive the same greeting.

VAL is not greeting the calendar.

VAL is greeting the person who lived the day behind that calendar.

## Integration Point

Initial implementation should plug into the existing `executiveBriefing` / Home pipeline.

Likely build path:

1. Add Daily Witness builder on the server near `/api/executive-briefing`.
2. Use existing dashboard data, drafts, tasks, transcripts, calendar, email intelligence, and Teach VAL memory where available.
3. Return `dailyWitness` alongside existing executive briefing payload.
4. Update Home rendering to prefer `dailyWitness.display_greeting` / `greeting_lines`.
5. Keep legacy greeting fallback until the builder is stable.

## Test Scenarios

| Scenario | Evidence | Expected State | Expected Intent | Greeting Style |
|---|---|---|---|---|
| First day | no history, sparse config | unknown | prepare | humble, short, observant |
| Quiet morning | light calendar, no urgent loops | quiet_morning | protect | spacious, restrained |
| Heavy prior day | many meetings, late calendar, few completions | recovery_morning | encourage_rest | permission, no guilt |
| Momentum morning | project movement, pending decision | momentum_morning | refocus | one meaningful next step |
| Completion | proposal sent, long-open task closed | completion | recognize | effort and relief |
| Unexpected win | important reply arrived early | unexpected_win | prepare | name uncertainty removed |
| Protective afternoon | small requests accumulating | protective | protect | calm boundary |
| Evening | meaningful work completed, open loops remain | evening | encourage_rest | permission to stop |
| Contradictory day | busy calendar, no tasks, major transcript breakthrough | heavy_morning | recognize | synthesize, avoid overclaiming |
| Exceptional event | court/heavy family event explicitly known | exceptional_event | ground | short, careful, non-clinical |
| Sparse data | one calendar event, no history | unknown | prepare | "from what I can see" language |
| Rich context | strong evidence across sources | clear_morning | recognize | direct, natural confidence |

## Implementation Acceptance Criteria

The first implementation is acceptable only if:

- Evidence and meaning are separate steps.
- Meaning Extraction exists before state selection.
- Contradictions are represented, not ignored.
- Greeting Intent is explicit.
- Uncertainty pathways are distinct.
- Exceptional events are handled separately.
- Restraint produces `things_intentionally_not_mentioned`.
- Final Gate can block or revise a greeting.
- Home can render a short greeting without forcing all fields visible.
- Test scenarios cover first day, sparse data, contradictory data, rich context, and exceptional events.

## Protected Implementation Question

Before changing the implementation, ask:

> Is VAL summarizing data, or summarizing meaning?

If it is summarizing data, the implementation is wrong.
