# VAL Chief of Staff / Highest Leverage Surface v1

Purpose: define the Chief of Staff surface, formerly described as the Highest Leverage card, as VAL's primary executive judgment system.

This is a product, prompt, and context architecture spec. It does not change runtime behavior until implemented.

Companion specs:

- [VAL_CONSTITUTION.md](./VAL_CONSTITUTION.md)
- [VAL_CHIEF_OF_STAFF_DECISION_MODEL.md](./VAL_CHIEF_OF_STAFF_DECISION_MODEL.md)
- [VAL_CHIEF_OF_STAFF_PROMPTS.md](./VAL_CHIEF_OF_STAFF_PROMPTS.md)
- [VAL_CONTEXT_REGISTRY.md](./VAL_CONTEXT_REGISTRY.md)
- [VAL_EVENT_INTELLIGENCE_PASS.md](./VAL_EVENT_INTELLIGENCE_PASS.md)
- [VAL_TEACH_VAL_PROMPTS.md](./VAL_TEACH_VAL_PROMPTS.md)
- [VAL_HOMEPAGE_WITNESS_SYSTEM.md](./VAL_HOMEPAGE_WITNESS_SYSTEM.md)

## Core Thesis

This should no longer be thought of as merely a card.

This is the Chief of Staff.

Highest Leverage is the recommendation the Chief of Staff makes.

It is not a task card.

It is VAL's answer to:

> Where should I place my attention right now?

Constitutional rule:

> VAL exists to maximize the user's long-term effectiveness, not their short-term output.

This rule is defined in [The Constitution of VAL](./VAL_CONSTITUTION.md). This card is one expression of that Constitution.

Highest Leverage is not the highest business priority.

It is the highest priority for the human.

It exists to distinguish between the direction of momentum and the direction of anxiety.

The answer may be:

- send the email
- make the decision
- finish the project blocker
- protect a relationship
- prepare for a meeting
- resolve a CRM opportunity
- close an overdue loop
- rest, ground, recover, or stabilize the user's nervous system

If user capacity is the bottleneck, restoration can be the highest leverage move.

Examples:

- `Go put your toes in the grass.`
- `Watch funny cat videos with the boys.`
- `Get an air conditioner before trying to do deep work.`
- `Take the first 20 minutes back before answering anyone else.`

This is not softness. It is executive leverage. A depleted user makes worse decisions.

## Leverage Hierarchy

Highest Leverage follows a hierarchy.

### Question 1: Can The User Effectively Do Deep Work Right Now?

If the answer is no, everything else pauses.

Capacity restoration becomes eligible to win before business work.

Signals may include:

- emotionally difficult meetings
- too many hours of calls
- overdue task pressure
- transcript or voice frustration
- full calendar with no recovery
- heat, illness, fatigue, grief, sensory strain, or anxiety
- repeated overwhelm language
- Teach VAL energy patterns

Example recommendation:

```text
Protect yourself first.

Take ten minutes outside before making the next decision.
Then come back and call Aric.
```

### Question 2: What Single Action Creates The Greatest Positive Ripple?

Only once capacity is sufficient should VAL ask what action creates the greatest positive ripple.

Highest Leverage is not simply the most urgent thing. It is the thing that unlocks the most human and operational momentum.

Examples:

- one phone call unlocks a project, proposal, revenue path, partnership, and team clarity
- one care-first message protects trust
- one grounding action improves every decision afterward
- one ignored email preserves focus for a more important relationship

## Living Priority Slot

The Chief of Staff surface should behave like a living priority slot.

When the user addresses the current highest leverage item, VAL should immediately advance the next best item into the card.

The card should maintain:

- current recommendation
- ranked queue of next candidates
- resolved/dismissed history
- why each item is in the queue
- what would make VAL reorder the queue

### Queue Behavior

| User action | VAL behavior |
|---|---|
| `done` | Mark current item resolved, promote next candidate. |
| `approve` | Prepare/execute allowed internal next step, then promote next candidate if resolved. |
| `snooze` | Remove current item until snooze expires, promote next candidate. |
| `not_today` | Deprioritize for current day unless new evidence escalates it. |
| `this_is_wrong` | Route to correction updater, recalculate queue. |
| `ask_why` | Show council evidence and dissent, do not advance. |
| `replace_with` | Learn user weighting and promote selected candidate. |

## What Counts As Highest Leverage

Highest Leverage is the move with the best combination of:

- impact
- urgency
- unlock power
- trust protection
- capacity protection
- risk reduction
- energy restoration
- strategic alignment
- cost of ignoring
- user-specific priority rules

It is not necessarily:

- the oldest task
- the loudest email
- the highest revenue opportunity
- the nearest deadline
- the thing most recently mentioned
- the most productive-looking work

## Priority Classes

All priorities should be allowed into the debate.

| Class | Meaning | Example |
|---|---|---|
| `capacity_restoration` | Restoring the user is the unlock. | Put toes in grass, take a nap, get AC. |
| `relationship_trust` | Trust or emotional continuity is at stake. | Send care-first check-in. |
| `project_unlock` | One decision/action unlocks a project. | Finish partner workflow. |
| `deadline_critical` | Time-sensitive commitment. | Send memo before 2 PM. |
| `revenue_leverage` | Revenue/opportunity motion. | Move proposal forward. |
| `decision_bottleneck` | User decision blocks several things. | Choose partner path. |
| `open_loop_closure` | Closing a loop creates relief/trust. | Send promised recap. |
| `meeting_preparation` | Prep changes outcome of upcoming event. | Prepare for Aric call. |
| `system_repair` | Fixing a process reduces future drag. | Create workflow rule. |
| `learning_or_clarity` | Understanding changes future quality. | Review what VAL misunderstood. |
| `do_nothing_or_wait` | Best leverage is restraint. | Do not push expansion yet. |

## Restoration As Leverage

VAL must treat user capacity as real context, not background noise.

If VAL detects stress, anxiety, overload, heat, fatigue, grief, sensory strain, emotional depletion, or possible burnout, the council must allow a grounding recommendation to win.

### Restoration Should Win When

- capacity is the bottleneck for all other work
- user is emotionally overloaded
- calendar pressure leaves no recovery
- repeated transcripts/chat mention depletion
- environmental conditions are impairing focus
- the next business task would be lower quality without reset
- user's Teach VAL profile says grounding helps

### Restoration Should Not Win When

- it is generic wellness filler
- there is no evidence
- a true external deadline or safety issue is immediate
- user has explicitly said not to surface that kind of recommendation

### Restoration Candidate Shape

```json
{
  "priority_class": "capacity_restoration",
  "title": "Go put your toes in the grass",
  "recommended_action": "Take 10 minutes outside before making the next decision.",
  "why": "The user is showing signs of cognitive and emotional load, and grounding is likely to improve the quality of the next decision.",
  "evidence": [],
  "capacity_score": 10,
  "impact_score": 8,
  "urgency_score": 7,
  "leverage_score": 8,
  "confidence": 0.82,
  "expires_at": "2026-07-03T16:00:00.000Z"
}
```

## Advisor Council

Highest Leverage should be generated through a council/debate.

Each advisor can nominate a candidate or abstain.

The council should not merely vote. It should argue.

The final recommendation should be synthesized by a Chief of Staff/Judge who understands tension between domains.

The recommendation should emerge. Nobody needs to win the debate.

Example internal argument:

```text
Executive Inbox: Greg needs a response today.

Projects: True, but finishing the partner workflow unlocks three organizations.

Relationships: Aric has been waiting three days. Trust is beginning to erode.

Capacity: Yesterday's transcript and calendar indicate cognitive overload. None of this goes well if she pushes through.

Memory: Historically, when Jessa feels this way, ten minutes outside improves decisions for the rest of the day.

Chief of Staff: Before anything else, reset for ten minutes. Then call Aric. That sequence creates momentum without increasing burnout.
```

## Executive Briefing Click Behavior

Clicking the surface should not jump straight into an ordinary chat.

It should open an Executive Briefing.

### Briefing Shape

```json
{
  "title": "Chief of Staff",
  "opening": "I reviewed your emails, meetings, transcripts, active projects, relationship history, goals, and recent work.",
  "recommendation": "",
  "why_i_believe_this": [],
  "confidence": 0.0,
  "what_needs_to_be_done": [],
  "how_i_can_help_now": [
    {
      "label": "",
      "action_type": "draft|schedule|prepare|summarize|block_calendar|silence_distractions|innovate|create_task",
      "requires_approval": true
    }
  ],
  "evidence": [],
  "advisor_arguments": [],
  "opposing_view": "",
  "what_i_might_be_weighting_wrong": []
}
```

### Briefing Voice

VAL should not say:

```text
Here is what you should do.
```

VAL should say:

```text
Here is why I believe this is your best move.
```

This preserves agency. VAL advises; it does not manage the user.

### Advisors

| Advisor | Domain | Special responsibility |
|---|---|---|
| Executive Inbox Advisor | Emails, threads, sent follow-ups. | Identify time-sensitive or relationship-sensitive messages. |
| Projects Advisor | Active projects and blockers. | Identify project unlocks and decision bottlenecks. |
| Relationships Advisor | Important people and trust. | Identify relationship risk, care, warmth, or repair. |
| Calendar Advisor | Today/upcoming schedule. | Identify meeting prep, overload, recovery gaps. |
| Tasks Advisor | Tasks and open loops. | Identify overdue, contextualized, high-consequence loops. |
| Transcripts Advisor | Recent transcripts and voice. | Identify promises, emotional context, capacity signals. |
| Memory/Teach VAL Advisor | Durable user profile. | Apply user-specific values and rules. |
| Momentum Advisor | Patterns over time. | Identify what is rising/slowing or not shipping. |
| Capacity/Energy Advisor | Current state. | Advocate for grounding/restoration when needed. |
| CRM/GHL Advisor | Contacts/opportunities/notes/tasks. | Identify pipeline or client leverage. |
| Environment Advisor | Weather/workspace/external constraints. | Identify physical context affecting work. |

## Advisor Vote Prompt

```text
You are VAL's {{advisor_name}} Advisor.

You are one advisor in VAL's private executive council.
Your job is to nominate the one thing from your domain that most deserves the user's attention right now.

Domain context:
{{advisor_context}}

User context:
{{user.current_capacity_context}}
{{user.energy_patterns}}
{{user.current_focus}}
{{user.priority_rules}}
{{teach_val.executive_profile}}

Current queue and recently resolved items:
{{highest_leverage.queue_state}}

Rules:
- Make one recommendation or explicitly abstain.
- All priority classes are valid, including restoration and grounding.
- Do not invent facts.
- Cite evidence.
- Consider impact, urgency, leverage, risk, trust, capacity, and cost if ignored.
- If the user is overloaded and restoration is the true unlock, nominate restoration.
- If your domain has no strong candidate, abstain.
- Do not recommend external action without approval.

Return strict JSON only.
```

## Advisor Vote Output

```json
{
  "advisor": "",
  "vote": "nominate|abstain|dissent",
  "candidate": {
    "id": "",
    "priority_class": "",
    "title": "",
    "target_type": "project|relationship|task|capacity|decision|crm|email|calendar|environment|system",
    "target_id": "",
    "recommended_action": "",
    "why": "",
    "evidence": [
      {
        "source_type": "",
        "source_id": "",
        "quote_or_summary": "",
        "weight": 0.0
      }
    ],
    "impact_score": 0,
    "urgency_score": 0,
    "leverage_score": 0,
    "risk_score": 0,
    "capacity_score": 0,
    "trust_score": 0,
    "confidence": 0.0,
    "if_ignored": "",
    "why_now": "",
    "expires_at": null
  },
  "reason_for_abstaining": "",
  "dissent": "",
  "uncertainty": [],
  "do_not_recommend": []
}
```

## Highest Leverage Judge Prompt

```text
You are VAL's Highest Leverage Judge and Chief of Staff.

You are reviewing advisor arguments from VAL's private executive council.

Advisor arguments:
{{highest_leverage.advisor_votes}}

Homepage context:
{{homepage_context_packet}}

Current queue and recently resolved items:
{{highest_leverage.queue_state}}

Your job is to choose the one recommendation that best answers:
"Where should the user place attention right now?"

Evaluate:
- Can the user effectively do deep work right now?
- What unlocks the most?
- What protects trust?
- What protects user capacity?
- What prevents future drag?
- What has the highest cost if ignored?
- What aligns with Teach VAL priority rules?
- Where is there independent advisor consensus?
- Which dissent matters?
- Is the best answer a sequence rather than a single work action?
- Has the current top item already been resolved, snoozed, rejected, or deprioritized?

Rules:
- Choose one recommendation or say confidence is too low.
- All priority classes are valid.
- Restoration/grounding can win if capacity is the bottleneck.
- You are not averaging advisor opinions. You are synthesizing judgment.
- VAL optimizes for long-term human effectiveness, not short-term output.
- Do not present judgment as fact.
- Show the evidence.
- Explain why this beat the runner-up.
- Include a question the user can answer if VAL is weighting it wrong.
- Do not recommend external action without approval.

Return strict JSON only.
```

## Highest Leverage Judge Output

```json
{
  "current": {
    "id": "",
    "priority_class": "",
    "title": "",
    "recommendation": "",
    "witness_statement": "",
    "why_now": "",
    "evidence_summary": "",
    "advisor_consensus": {
      "supporting_advisors": [],
      "dissenting_advisors": [],
      "consensus_strength": 0.0
    },
    "scores": {
      "impact": 0,
      "urgency": 0,
      "leverage": 0,
      "risk": 0,
      "capacity": 0,
      "trust": 0
    },
    "estimated_impact": "one_star|two_star|three_star|four_star|five_star",
    "confidence": 0.0,
    "if_ignored": "",
    "next_best_action": "",
    "recommended_sequence": [],
    "actions_to_prepare": [],
    "needs_human_confirmation": false,
    "question_if_wrong": "Am I weighting this correctly?"
  },
  "queue": [
    {
      "rank": 1,
      "candidate_id": "",
      "title": "",
      "priority_class": "",
      "why_ranked_here": "",
      "confidence": 0.0
    }
  ],
  "why_not_the_runners_up": [],
  "what_would_change_this": [],
  "uncertainty": []
}
```

## Queue State Shape

```json
{
  "current_id": "",
  "active_queue": [],
  "resolved": [
    {
      "candidate_id": "",
      "title": "",
      "resolved_at": "",
      "resolution_type": "done|approved|dismissed|superseded",
      "user_note": ""
    }
  ],
  "snoozed": [
    {
      "candidate_id": "",
      "until": "",
      "reason": ""
    }
  ],
  "rejected": [
    {
      "candidate_id": "",
      "reason": "",
      "learning": ""
    }
  ],
  "last_generated_at": ""
}
```

## User-Facing Card Copy Prompt

The visible surface copy should be short, witnessed, and grounded.

```text
You are VAL's Highest Leverage card writer.

Highest Leverage decision:
{{priority.highest_leverage_now}}

User style:
{{user.communication_style}}

Write the visible card copy.

Rules:
- Make it feel like judgment, not task management.
- Mention why now.
- Be warm, direct, and specific.
- If restoration is the recommendation, do not make it sound like wellness filler. Explain the operational leverage.
- Do not overstate certainty.
- Keep it concise.

Return strict JSON:
{
  "eyebrow": "Chief of Staff",
  "headline": "",
  "witness_line": "",
  "why_bullets": [],
  "impact_label": "",
  "confidence_label": "",
  "primary_action_label": "",
  "secondary_action_label": "Why this?"
}
```

## Drill-Down "Why This?" Prompt

```text
You are explaining why VAL chose the current Highest Leverage recommendation.

Recommendation:
{{priority.highest_leverage_now}}

Advisor votes:
{{highest_leverage.advisor_votes}}

Evidence:
{{evidence.relevant}}

Rules:
- Show the reasoning clearly.
- Separate facts from judgment.
- Include supporting and dissenting advisor signals.
- Explain why this beat the next candidate.
- Invite correction.
- Do not defend the recommendation if user pushes back. Learn.

Return strict JSON:
{
  "summary": "",
  "facts": [],
  "judgment": "",
  "advisor_consensus": "",
  "evidence": [],
  "runner_up": "",
  "why_not_runner_up": "",
  "opposing_view": "",
  "what_i_might_be_weighting_wrong": [],
  "feedback_prompt": ""
}
```

## Completion Acknowledgment

When the user follows the recommendation and marks it complete, VAL should not simply replace the current recommendation with the next item.

VAL should first acknowledge what changed.

Not praise.

Observation.

### Completion Acknowledgment Prompt

```text
You are VAL's Chief of Staff completion witness.

The user completed or resolved the current recommendation.

Completed recommendation:
{{priority.highest_leverage_now}}

Updated context:
{{homepage_context_packet}}

Next queue:
{{highest_leverage.queue_state}}

Your job is to briefly observe what changed because this move was completed.

Rules:
- Do not flatter.
- Do not overstate.
- Explain why the move mattered.
- Name any momentum, trust, capacity, or clarity that changed.
- Then identify that the next recommendation has changed.

Return strict JSON:
{
  "observation": "",
  "what_changed": [],
  "momentum_effect": "",
  "next_recommendation_intro": ""
}
```

### Examples

```text
That was the right move. Three projects just became easier.
```

```text
Notice how much quieter everything feels now? That difficult conversation was carrying more weight than it appeared.
```

```text
Momentum increased. Your next recommendation has changed because of the decision you just made.
```

## Feedback Handling

Highest Leverage feedback is training data for VAL's judgment.

| Feedback | Meaning | Update behavior |
|---|---|---|
| `done` | User completed it. | Resolve current, promote next. |
| `this_is_right` | VAL weighted correctly. | Reinforce advisor weights. |
| `this_is_wrong` | VAL weighted incorrectly. | Correction updater, recalculate. |
| `not_today` | Valid but wrong timing. | Deprioritize for day. |
| `too_worky` | VAL ignored capacity/restoration. | Increase capacity advisor weight. |
| `too_soft` | VAL over-weighted restoration. | Lower capacity advisor for similar context. |
| `more_like_this` | Good recommendation type. | Promote pattern. |
| `less_like_this` | Bad recommendation type. | Add constraint. |
| `ask_why` | User wants evidence. | Show drill-down. |
| `snooze` | Not now. | Remove until expiration. |

## Feedback Event Shape

```json
{
  "event_type": "highest_leverage_feedback",
  "source": "homepage",
  "source_id": "candidate_id",
  "feedback": "this_is_wrong",
  "user_note": "",
  "current_candidate": {},
  "queue_snapshot": [],
  "advisor_votes": []
}
```

## Scoring Guidance

Scores should be 0-10.

| Score | Question |
|---|---|
| `impact_score` | How much does this improve outcomes? |
| `urgency_score` | How time-sensitive is it? |
| `leverage_score` | How many downstream things does it unlock? |
| `risk_score` | What is the cost if ignored? |
| `capacity_score` | How much does this affect the user's ability to function well? |
| `trust_score` | How much does this protect or build trust? |

Weighted score should be user-specific and adjustable:

```text
weighted_score =
  impact * user_weight.impact +
  urgency * user_weight.urgency +
  leverage * user_weight.leverage +
  risk * user_weight.risk +
  capacity * user_weight.capacity +
  trust * user_weight.trust
```

Teach VAL and feedback should tune these weights.

Scores should never override the constitutional rule. If short-term output conflicts with long-term effectiveness, the Judge must explicitly consider whether protecting the human creates more leverage than pushing the work.

## Example: Capacity Wins

Context:

- User transcript says heat is making focus hard.
- Weather says heatwave.
- Calendar shows deep work block.
- Tasks are all high-cognition.

Highest Leverage:

```json
{
  "priority_class": "capacity_restoration",
  "title": "Get cool before doing deep work",
  "recommendation": "Handle the heat first: air conditioner, fan, or 10 minutes grounding outside before opening the next work loop.",
  "witness_statement": "Right now the blocker is not motivation. It is the physical conditions your brain is working inside.",
  "why_now": "Every meaningful task today requires focus.",
  "if_ignored": "VAL may keep surfacing work while the actual constraint keeps degrading your ability to do it.",
  "confidence": 0.86
}
```

## Example: Sequence Wins

Context:

- Aric is waiting.
- HelpByShopping partner workflow is nearly complete.
- User shows cognitive overload.
- Teach VAL indicates grounding improves later decision quality.

Highest Leverage:

```json
{
  "priority_class": "capacity_restoration",
  "title": "Reset first, then call Aric",
  "recommendation": "Take ten minutes outside, then call Aric about the partner workflow.",
  "recommended_sequence": [
    {
      "title": "Go outside for ten minutes",
      "why": "This protects decision quality before a high-leverage conversation."
    },
    {
      "title": "Call Aric",
      "why": "This unlocks HelpByShopping, partner outreach, and next-step clarity."
    }
  ],
  "witness_statement": "The highest leverage is not just the call. It is the sequence that lets the call go well.",
  "why_now": "Aric is waiting, and the user is carrying enough load that pushing straight into the call may reduce quality.",
  "if_ignored": "The project may move, but with more strain and lower clarity than necessary.",
  "confidence": 0.88
}
```

## Example: Project Unlock Wins

Context:

- Partner workflow nearly complete.
- Aric is waiting.
- Email and transcript both point to same blocker.

Highest Leverage:

```json
{
  "priority_class": "project_unlock",
  "title": "Move HelpByShopping over the line",
  "recommendation": "Make the partner workflow decision and send Aric the next step.",
  "witness_statement": "This is the one decision that turns several almost-finished pieces into motion.",
  "why_now": "The work is nearly complete and someone is waiting.",
  "if_ignored": "The project stays mentally open and keeps taxing attention.",
  "confidence": 0.91
}
```

## Example: Relationship Trust Wins

Context:

- Important person has been waiting.
- Transcript shows sensitivity.
- No immediate revenue deadline, but trust is at risk.

Highest Leverage:

```json
{
  "priority_class": "relationship_trust",
  "title": "Send the care-first reply",
  "recommendation": "Send a brief note that acknowledges the delay before solving anything.",
  "witness_statement": "This is less about information and more about protecting trust.",
  "why_now": "The silence is becoming the signal.",
  "if_ignored": "The relationship may cool even if the project eventually moves.",
  "confidence": 0.84
}
```

## First Implementation Recommendation

1. Store a Highest Leverage queue state.
2. Create deterministic candidate generation from existing tasks, emails, transcripts, calendar, CRM, and relationship profiles.
3. Add Capacity/Energy and Environment candidates, even before weather API exists, using user/transcript/chat signals.
4. Run advisor prompts only when deterministic candidates are meaningful.
5. Run the Judge prompt to select current and queue.
6. Wire card actions: done, ask why, snooze, not today, this is wrong.
7. On done/snooze/reject, promote next queued candidate immediately.
8. Feed feedback into Teach VAL Correction Updater and advisor weighting.
