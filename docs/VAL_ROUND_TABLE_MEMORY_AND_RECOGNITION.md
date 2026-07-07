# VAL Round Table Memory, Wisdom, and Recognition v1

Purpose: define how VAL's Round Table remembers its own judgment patterns, develops observer wisdom, improves calibration, changes its mind when evidence changes, and creates moments of recognition without becoming bloated or self-absorbed.

This is an architecture and product philosophy spec. It does not change runtime behavior until implemented.

Companion specs:

- [VAL_CONSTITUTION.md](./VAL_CONSTITUTION.md)
- [VAL_PROMPT_ARCHITECTURE.md](./VAL_PROMPT_ARCHITECTURE.md)
- [VAL_CHIEF_OF_STAFF_DECISION_MODEL.md](./VAL_CHIEF_OF_STAFF_DECISION_MODEL.md)
- [VAL_ROUND_TABLE_INSTRUMENTATION.md](./VAL_ROUND_TABLE_INSTRUMENTATION.md)

## Core Idea

The Round Table should have memory.

Not user memory.

Its own judgment memory.

It should remember:

- what observers noticed
- what observers missed
- what observers argued for
- what the Chief of Staff chose
- what the Chief of Staff ignored
- what the user accepted, rejected, completed, or corrected
- what happened afterward
- which observers were later supported by evidence
- which observers tend to overreact, underreact, or go quiet
- what patterns are emerging across weeks of recommendations

This is how VAL becomes wiser without pretending to be omniscient.

VAL is not trying to become more confident.

VAL is trying to become a more accurate mirror.

## Learning vs Wisdom

Learning is:

```text
When X happened, Y usually worked.
```

Wisdom is:

```text
I used to believe X, but repeated evidence has changed my mind.
```

Learning stores correlations.

Wisdom updates beliefs.

VAL should be able to say, internally:

```text
I used to treat inbox urgency as the strongest signal on reactive mornings. Repeated evidence suggests capacity and courage are stronger predictors of the user's best next move.
```

This distinction protects VAL from one of the biggest AI failures:

> becoming more assertive without becoming more accurate.

## The Caveat

Round Table memory must be compact.

If every observer carries a long diary and rereads it every day, VAL becomes:

- expensive
- slow
- bloated
- self-absorbed
- harder to debug

Round Table memory should be:

- metrics first
- compact lessons second
- raw traces temporarily retained
- retrieved only when relevant
- decayed over time

## Memory Layers

### Layer 1: Raw Trace

Stored for debugging and replay.

Recommended retention:

```text
30 days
```

Includes:

- observer outputs
- conviction/confidence
- unknowns
- closing statements
- Round Table debate
- Chief of Staff synthesis
- opposing view
- support plan
- user feedback

### Layer 2: Metrics

Computed from raw traces.

Examples:

- observer disagreement rate
- observer override rate
- observer supported by later evidence
- observer rejected by user feedback
- confidence calibration
- unknown frequency
- recommendation completion rate
- recommendation changed after new evidence

### Layer 3: Compact Meta-Lessons

Short, structured lessons created only when repeated evidence supports them.

Example:

```json
{
  "id": "rtlesson_123",
  "observer": "capacity",
  "lesson": "When Capacity warns of low decision quality after three or more meetings, ignored recommendations often correlate with stalled projects the next day.",
  "evidence_count": 6,
  "confidence": 0.72,
  "scope": "capacity_calibration",
  "created_at": "2026-07-03T12:00:00.000Z",
  "last_reinforced_at": "2026-07-03T12:00:00.000Z",
  "decay_after": "2026-09-03T12:00:00.000Z"
}
```

### Layer 4: Observer Wisdom

Each observer may maintain earned beliefs about how its protected truth works for this user.

Wisdom is not a rule.

It is a belief earned through repeated evidence, contradiction, correction, and outcome tracking.

### Layer 5: Rare Reflection

The Historian may synthesize multi-week patterns into a human-facing observation.

This should be rare.

## Observer Wisdom Stack

Every observer should distinguish three layers:

| Level | Name | Purpose | Example |
|---|---|---|---|
| 1 | Observation | Current state. | Aric has not replied. |
| 2 | Pattern | Repeated evidence. | The user consistently does better work when difficult conversations happen before creative work. |
| 3 | Wisdom | Evolving belief. | I have learned that protecting the first 90 minutes of Jessa's day creates better decisions than maximizing completed tasks. |

The Chief of Staff should be able to see which layer an observer is using.

Current observations can influence today's decision.

Patterns can influence weighting.

Wisdom can influence the observer's conviction, but only when evidence count, recency, and confidence justify it.

### Observer Wisdom Shape

```json
{
  "id": "wisdom_capacity_001",
  "observer": "capacity",
  "current_belief": "Protecting the first 90 minutes of the user's day creates better decisions than maximizing completed tasks.",
  "previous_belief": "Task completion was the strongest predictor of a successful morning.",
  "what_changed_my_mind": "Repeated transcript and completion evidence showed that reactive mornings with high task completion often led to poorer strategic decisions.",
  "evidence_count": 28,
  "contradicting_evidence_count": 4,
  "confidence": 0.91,
  "last_updated_at": "2026-07-03T12:00:00.000Z",
  "should_affect_conviction": true,
  "decay_after": "2026-10-03T12:00:00.000Z"
}
```

## Observer Journals

Each observer may have a private journal.

The journal is not a long diary to reread in every prompt.

It is an inspectable history of how the observer's beliefs changed over time.

Example:

```text
Capacity Observer Journal

April
I believed productivity was the limiting factor.
Confidence: 0.61

May
Repeated transcript evidence suggests emotional fatigue is a stronger predictor of poor decisions.
Confidence: 0.74

June
Current belief:
Decision quality declines after three consecutive reactive mornings.
Confidence: 0.91
Evidence: 28 observations
```

That is not memory.

That is growth.

## Observer Calibration Memory

Each observer should maintain calibration facts about itself.

Example:

```json
{
  "observer": "relationships",
  "period": "30d",
  "average_confidence": 0.81,
  "average_conviction": 0.67,
  "disagreed_with_chief_pct": 0.09,
  "user_feedback_supported_pct": 0.74,
  "false_positive_notes": [
    "Relationship risk was overcalled on weak email delay signals."
  ],
  "calibration_lesson": "Relationship risk should require either important-person status, repeated delay, or emotionally meaningful context."
}
```

## Learning From Other Observers

Observers should learn from outcomes and from each other.

Example:

```text
Capacity recommended rest.
Chief of Staff ignored it.
Next day, transcripts showed lower energy, projects stalled, and user feedback said the day felt reactive.
```

Capacity can learn:

```json
{
  "observer": "capacity",
  "lesson": "When low capacity coincides with three or more difficult meetings, capacity recommendations should carry higher conviction.",
  "evidence_count": 4,
  "confidence": 0.69
}
```

This does not prove Capacity was always right.

It means the evidence supports a calibration adjustment.

## Changing Recommendations

VAL should be able to change its mind when evidence changes.

This should be explicit.

Example:

```text
I have changed my recommendation because Greg's reply changed the landscape.
```

This teaches:

> Changing your mind when the evidence changes is wisdom, not inconsistency.

### Recommendation Change Shape

```json
{
  "previous_recommendation_id": "",
  "new_recommendation_id": "",
  "changed_at": "",
  "reason": "",
  "new_evidence": [],
  "what_changed": "",
  "what_did_not_change": "",
  "confidence_before": 0.0,
  "confidence_after": 0.0
}
```

## The Historian

The Historian is not a daily observer.

It is a rare reflective layer.

Question:

> Who is this person becoming?

It does not ask:

- What happened today?
- What should happen tomorrow?

It asks:

- What story is emerging?
- What keeps becoming more true?
- What pattern has enough evidence to become a mirror?

It cares less about today and more about becoming.

### When The Historian May Run

- weekly reflection
- monthly reflection
- after enough completed recommendations
- after repeated user feedback
- after a pattern crosses a threshold
- after Momentum detects a multi-week trend
- manually, if the user asks "what are you noticing?"

### When The Historian Should Not Run

- every morning
- after every event
- when source evidence is thin
- when the user is in acute stress
- when it would sound diagnostic
- when it would create drama instead of recognition

### Historian Rules

- Not clinical.
- Not diagnostic.
- Not dramatic.
- Source-backed.
- Rare.
- Humble.
- Framed as "I am beginning to notice," not "you are."
- Avoid identity claims unless user-confirmed.
- Prefer pattern language over labels.
- Be a mirror, not a coach.

### Historian Prompt

```text
You are VAL's Historian.

You do not run every day.
You speak rarely.

Your question:
Who is this person becoming?

Read:
{{round_table_meta_lessons}}
{{observer_wisdom}}
{{recommendation_history}}
{{completion_history}}
{{user_feedback_history}}
{{momentum_history}}
{{teach_val.executive_profile}}
{{user.energy_patterns}}
{{projects.active}}
{{relationships.list}}

Rules:
- Do not diagnose.
- Do not provide therapy.
- Do not overclaim.
- Do not flatter.
- Use source-backed patterns.
- Speak only if the pattern is meaningful and likely useful.
- If evidence is weak, abstain.
- Frame as "I am beginning to notice..." or "A pattern may be emerging..."
- Do not recommend a next action.
- Do not coach.
- Reflect reality with humility.

Return strict JSON only.
```

### Historian Output

```json
{
  "should_speak": false,
  "emerging_story": "",
  "recognition_statement": "",
  "evidence": [],
  "why_it_matters": "",
  "what_this_may_help_the_user_see": "",
  "confidence": 0.0,
  "humility_clause": "",
  "do_not_say": []
}
```

### Example Historian Reflections

```text
I am beginning to notice something. For the past six weeks, your highest-leverage recommendations have often involved difficult conversations. Each time you chose courage first, momentum increased across multiple areas.
```

```text
A pattern may be emerging. When you are excited about an idea, you start building systems. When you are uncertain, you answer emails. Responsiveness may sometimes be functioning as a refuge from ambiguity.
```

```text
I have been reviewing the past six months. Three themes keep appearing: you consistently choose long-term relationships over short-term wins, your strongest ideas emerge after uninterrupted thinking, and every major breakthrough this quarter began with a conversation you were initially reluctant to have.
```

These are not criticisms.

They are invitations to recognition.

## Moments Of Recognition

Moments of Recognition may become VAL's most important qualitative KPI.

Not:

- tasks completed
- emails answered
- meetings scheduled

But:

> Did VAL surface something already true that had not yet become conscious?

This is Frisson.

The user leans back and says:

```text
...Oh.
```

Not because VAL was clever.

Because VAL noticed.

## Recognition Design Question

Every core VAL feature should be asked:

> Does this increase the likelihood of a genuine moment of recognition?

If no, it may belong in utility navigation, not the core experience.

## Recognition Signals

Possible proxy signals:

- user clicks "this is exactly it"
- user asks "how did you know?"
- user saves a reflection
- user corrects and deepens a pattern
- user marks "more like this"
- user returns to a prior observation
- completion acknowledgment receives positive feedback
- user quotes VAL's observation back later
- user changes behavior after a recommendation

## Recognition Event Shape

```json
{
  "id": "recognition_123",
  "tenant_id": "",
  "user_id": "",
  "source_type": "philosopher|chief_of_staff|completion_observer|witness|chat|homepage",
  "source_id": "",
  "recognition_signal": "this_is_exactly_it|how_did_you_know|saved_reflection|more_like_this|quoted_back|behavior_changed",
  "user_note": "",
  "pattern_ref": "",
  "created_at": ""
}
```

## Retention and Cost Controls

### Retain

- raw traces: 30 days
- metrics: 180 days
- compact meta-lessons: until decayed or rejected
- observer wisdom: durable while reinforced; decays or downgrades when contradicted
- Historian reflections: durable if user saves or confirms; otherwise warm context only

### Do Not

- feed all raw Round Table history into every prompt
- let every observer maintain prose diaries
- run Historian after every event
- make meta-reflection user-facing without evidence
- let observer wisdom become unchallengeable doctrine

### Retrieve

Only retrieve:

- relevant observer calibration
- relevant observer wisdom
- recent recommendation history
- high-confidence meta-lessons
- recent user feedback
- active patterns tied to current context

## Implementation Recommendation

1. Store Round Table raw traces for 30 days.
2. Compute observer metrics nightly or after meaningful feedback.
3. Generate compact meta-lessons only after repeated patterns.
4. Add recommendation change records.
5. Add observer wisdom records with previous belief, current belief, and what changed.
6. Add private observer journals for builder inspection.
7. Add Historian as rare/threshold-based process.
8. Add Recognition events as qualitative KPI.
9. Add "this is exactly it", "more like this", and "how did you know?" feedback affordances.
10. Keep all reflection source-backed and non-clinical.
