# VAL Round Table Instrumentation v1

Purpose: make VAL's Chief of Staff architecture inspectable, debuggable, replayable, and improvable.

This is an engineering and product architecture spec. It does not change runtime behavior until implemented.

Companion specs:

- [VAL_CONSTITUTION.md](./VAL_CONSTITUTION.md)
- [VAL_PROMPT_ARCHITECTURE.md](./VAL_PROMPT_ARCHITECTURE.md)
- [VAL_CHIEF_OF_STAFF_DECISION_MODEL.md](./VAL_CHIEF_OF_STAFF_DECISION_MODEL.md)
- [VAL_ROUND_TABLE_MEMORY_AND_RECOGNITION.md](./VAL_ROUND_TABLE_MEMORY_AND_RECOGNITION.md)

## Core Principle

Do not merely implement the Round Table.

Instrument it.

VAL's recommendation engine must be inspectable because wise judgment emerges from multiple narrow perspectives. If those perspectives cannot be inspected, VAL cannot reliably improve.

## Why Instrumentation Matters

Instrumentation lets the builder see:

- what each observer noticed
- what each observer missed
- where confidence came from
- what evidence mattered
- which unknowns reduced confidence
- which observers disagreed
- whether the Chief of Staff overrode a perspective
- whether feedback changed future judgment
- whether an observer is becoming too timid, too aggressive, too noisy, or too stale

Without instrumentation, VAL becomes another mysterious AI system.

With instrumentation, VAL becomes an inspectable executive organization.

## Round Table Debug View

The internal debug view should show the complete chain:

1. event/context snapshot
2. observer outputs
3. Round Table debate
4. Chief of Staff synthesis
5. Witness output
6. Executive Briefing
7. Support Planner
8. Completion Observer
9. Learning updates

### Example Debug Display

```text
────────────────────────────────────
Executive Round Table
────────────────────────────────────

Conviction
Relationships      ██████████ 97%
Projects           ███ 31%
Capacity           ████████ 81%
Momentum           █████████ 91%
Executive Inbox    █████ 54%

Executive Inbox
Confidence: 0.91
Conviction: 0.54
Decision style: Protective
Observation:
Greg requires a response before tomorrow.
Closing statement:
I believe Greg's email can wait until this afternoon without meaningful consequence.
Recommended Focus:
Medium
Supports:
Relationships
Conflicts:
Projects
Unknowns:
- No full thread history available.

────────────────────────────────────

Projects
Confidence: 0.94
Conviction: 0.31
Decision style: Strategic
Observation:
Partner workflow completion unlocks four downstream actions.
Closing statement:
I believe finishing the partner workflow creates the greatest downstream leverage.
Recommended Focus:
Very High
Supports:
Goals, Momentum
Conflicts:
Executive Inbox
Unknowns:
- Final partner deck status unavailable.

────────────────────────────────────

Capacity
Confidence: 0.88
Conviction: 0.81
Decision style: Gentle but firm
Observation:
Mental fatigue is elevated.
Closing statement:
I believe protecting today's decision quality is more important than increasing today's output.
Recommended Focus:
Ground first.
Supports:
Meaning
Unknowns:
- No sleep data available.

────────────────────────────────────

Chief of Staff
Recommendation:
Finish the partner workflow.
Reason:
Projects, Goals, and Momentum aligned.
Executive Inbox disagreed.
Capacity recommends a 10-minute reset beforehand.
What almost won instead:
Replying to Greg.
```

This view is for builders/admins, not ordinary users.

## Replay Mode

Add a replay mode:

```text
Replay Yesterday
```

Replay should let a builder watch every observer and synthesis step for a selected window.

### Replay Inputs

- date or date range
- user/tenant
- event types
- selected context snapshot
- optional "as of" timestamp

### Replay Should Show

- event sequence
- observer outputs at each meaningful event
- changes in queue
- Chief of Staff recommendations over time
- what changed after user feedback
- when observer confidence changed
- when unknowns were resolved or introduced

### Replay Use Cases

- Capacity missed a burnout signal.
- Relationships overreacted to a weak signal.
- Courage became too timid.
- Executive Inbox over-weighted urgency.
- Momentum saw motion but not progress.
- Chief of Staff ignored dissent too often.

## Observer History

Keep observer output history for a limited window.

Recommended default:

```text
30 days
```

This allows questions like:

- When did Capacity begin thinking burnout risk was high?
- Has Courage become too timid?
- Is Relationships overreacting?
- Has Momentum been consistently optimistic?
- Which observers most often conflict with the Chief of Staff?

## Universal Observer Envelope

Every observer must produce the same structure.

```json
{
  "observer": "capacity",
  "decision_style": "gentle_but_firm",
  "truth_protected": "The human remains capable of making good decisions.",
  "executive_question": "Can the user make wise decisions right now?",
  "observation": "",
  "closing_statement": "",
  "evidence": [
    {
      "source_type": "",
      "source_id": "",
      "quote_or_summary": "",
      "relevance": "",
      "confidence": 0.0
    }
  ],
  "confidence": 0.0,
  "conviction": 0.0,
  "supports": [],
  "conflicts_with": [],
  "recommended_focus": [],
  "cannot_determine": [
    {
      "unknown": "",
      "why_it_matters": "",
      "confidence_impact": "low|medium|high"
    }
  ],
  "risks": [],
  "opportunities": [],
  "open_loops": [],
  "tensions": [],
  "metadata": {}
}
```

## Confidence vs Conviction

Confidence and conviction are different.

Confidence answers:

> How reliable is the observer's evidence?

Conviction answers:

> How strongly does this observer believe its truth should influence the final decision?

Examples:

- A relationship observer may have high confidence and high conviction if a trust threshold is near.
- A project observer may have high confidence but low conviction if the project can wait.
- A capacity observer may have medium confidence but high conviction if the cost of being wrong is high.

Conviction is what makes the Round Table legible.

It shows who is pounding the table.

## Observer Closing Statement

Every observer should end with one sentence.

This is not user-facing prose.

It is a board member's closing statement for debugging and sanity checking.

Examples:

```text
Capacity:
I believe protecting today's decision quality is more important than increasing today's output.
```

```text
Relationships:
I believe one difficult conversation today will create more value than twenty completed tasks.
```

```text
Projects:
I believe finishing the partner workflow creates the greatest downstream leverage.
```

```text
Executive Inbox:
I believe Greg's email can wait until this afternoon without meaningful consequence.
```

When a builder reads these, they should quickly know whether the observer is thinking correctly.

## Unknowns Are Required

Every observer should name what it cannot determine.

Not:

```text
I do not know.
```

But:

```text
Unknowns:
- I have not seen today's transcript.
- No relationship history exists.
- Calendar is unavailable.
- Full email thread is unavailable.
- Confidence reduced because GHL notes failed to load.
```

Unknowns allow the Chief of Staff to say:

> I am only 62% confident because Capacity does not have enough evidence.

That is executive behavior.

## Observer Decision Styles

Observers should have stable decision styles.

Not tone.

Decision style.

| Observer | Decision style | Meaning |
|---|---|---|
| Executive Inbox | Protective | Protects important humans from accidental neglect. |
| Projects | Strategic | Looks for long-term value and unlocks. |
| Relationships | Empathetic | Notices trust, care, warmth, waiting, and repair. |
| Capacity | Gentle but firm | Protects decision quality and future capacity. |
| Courage | Quietly challenging | Names meaningful discomfort and avoidance. |
| Delight | Humanizing | Protects meaning, joy, play, and aliveness. |
| Momentum | Optimistic but discerning | Distinguishes motion from real movement. |
| Meaning | Wise | Connects past lessons to who the user is becoming. |
| Calendar | Practical | Treats time as a strategic asset. |
| Commitment | Accountable | Protects promises without worshiping busyness. |
| Goals | Directional | Keeps daily work aligned with long-term direction. |
| CRM/GHL | Commercially attentive | Notices opportunity, client risk, and pipeline decay. |
| Environment | Contextual | Notices external conditions affecting human function. |
| Documents | Craft-aware | Notices written assets that carry strategic weight. |
| Financials | Consequence-aware | Notices monetary consequence and runway. |
| Voice | Somatic/listening | Notices spoken energy, friction, and emphasis. |
| Learning | Adaptive | Notices what VAL should improve. |

These styles make the Round Table feel alive because each specialist consistently protects something different.

## Disagreement Tracking

Track disagreement, not only agreement.

Agreement is useful.

Disagreement is diagnostic.

The Chief of Staff should be allowed to explicitly disagree with advisors.

Example:

```text
I appreciate the concern from Relationships, but I believe Capacity is correct. The user is unlikely to have a productive conversation until they have had uninterrupted thinking time.
```

### Metrics

```json
{
  "observer": "capacity",
  "period": "30d",
  "disagreed_with_chief_of_staff_pct": 42,
  "overridden_by_chief_of_staff_count": 17,
  "chief_followed_observer_count": 9,
  "user_feedback_supported_observer_count": 6,
  "user_feedback_rejected_observer_count": 3
}
```

### Questions Disagreement Metrics Answer

- Is Capacity being ignored too often?
- Is Executive Inbox over-calling urgency?
- Is Courage too timid?
- Is Relationships too sensitive?
- Is Momentum too optimistic?
- Is the Chief of Staff consistently overriding the same truth?

## Observer Quality Metrics

Track:

- average confidence
- confidence calibration after user feedback
- wisdom confidence calibration after later evidence
- unknown count
- source load failures
- repeated false positives
- repeated missed signals
- agreement with user correction
- time since last useful observation
- belief changed by evidence
- stale belief count

## Recommended Store Shapes

### Observer Run

```json
{
  "id": "obsrun_123",
  "tenant_id": "",
  "user_id": "",
  "observer": "capacity",
  "event_id": "",
  "run_group_id": "round_123",
  "input_refs": [],
  "output_json": {},
  "observation_level": "current_observation|repeated_pattern|earned_wisdom",
  "wisdom_refs": [],
  "confidence": 0.88,
  "conviction": 0.81,
  "closing_statement": "",
  "unknown_count": 2,
  "status": "complete|failed|skipped",
  "model": "",
  "created_at": ""
}
```

### Observer Wisdom Record

```json
{
  "id": "wisdom_capacity_001",
  "tenant_id": "",
  "user_id": "",
  "observer": "capacity",
  "previous_belief": "",
  "current_belief": "",
  "what_changed_my_mind": "",
  "evidence_count": 0,
  "contradicting_evidence_count": 0,
  "confidence": 0.0,
  "status": "active|downgraded|rejected|stale",
  "created_at": "",
  "last_updated_at": "",
  "decay_after": ""
}
```

### Observer Journal Entry

```json
{
  "id": "journal_capacity_001",
  "tenant_id": "",
  "user_id": "",
  "observer": "capacity",
  "period": "2026-06",
  "belief_snapshot": "",
  "confidence": 0.0,
  "evidence_count": 0,
  "what_changed": "",
  "created_at": ""
}
```

### Round Table Run

```json
{
  "id": "round_123",
  "tenant_id": "",
  "user_id": "",
  "trigger_event_id": "",
  "observer_run_ids": [],
  "debate_json": {},
  "chief_of_staff_json": {},
  "witness_json": {},
  "support_plan_json": {},
  "queue_state_json": {},
  "status": "complete|failed|partial",
  "created_at": ""
}
```

### Observer Feedback Metric

```json
{
  "id": "",
  "tenant_id": "",
  "observer": "",
  "chief_recommendation_id": "",
  "observer_supported": true,
  "chief_followed": false,
  "user_feedback": "this_is_right|this_is_wrong|not_today|too_worky|too_soft|more_like_this|less_like_this",
  "learning_summary": "",
  "created_at": ""
}
```

## Builder Debug Questions

The debug surface should make it easy to ask:

- What did each observer notice?
- What did each observer not know?
- Which observers supported the recommendation?
- Which observers conflicted?
- Which advisor was overridden?
- What evidence had the most weight?
- What changed since the previous recommendation?
- Which observer beliefs have changed recently?
- Which observer wisdom records influenced conviction?
- What would have changed the recommendation?
- Did user feedback support the Chief of Staff?
- Did user feedback support an overridden advisor?
- Which observer should be improved?

## User-Facing Boundary

Most users should not see the full debug view by default.

User-facing explanations should be cleaner:

```text
I chose this because Projects, Goals, and Momentum aligned.
Capacity added one caution: reset for ten minutes first.
Executive Inbox disagreed, but Greg's email can wait until this afternoon.
```

Builder/admin view can show the full Round Table transcript.

## Implementation Recommendation

1. Store observer runs with universal envelope.
2. Store Round Table runs with observer run IDs.
3. Add unknowns to every observer output.
4. Add run group ID for all observer outputs contributing to one Chief of Staff recommendation.
5. Build internal Round Table debug view.
6. Add Replay Yesterday mode.
7. Track disagreement metrics.
8. Track user feedback against Chief and observer positions.
9. Track recognition signals such as "this is exactly it", "how did you know?", and saved reflections.
10. Use metrics to tune observer prompts and weights.
11. Generate compact Round Table meta-lessons only after repeated evidence supports them.
12. Store observer wisdom records with previous belief, current belief, and what changed.
13. Add observer journals for builder inspection, not prompt context stuffing.
