# VAL Homepage Witness System v1

Purpose: redefine VAL's homepage as a witnessing and executive judgment surface, not a grid of features.

This is a product, prompt, and context architecture spec. It does not change runtime behavior until implemented.

Companion specs:

- [VAL_CONSTITUTION.md](./VAL_CONSTITUTION.md)
- [VAL_DESIGN_PHILOSOPHY.md](./VAL_DESIGN_PHILOSOPHY.md)
- [VAL_PHASE_13C_HOME_PRESENCE_BEHAVIORAL_CONSTITUTION.md](./VAL_PHASE_13C_HOME_PRESENCE_BEHAVIORAL_CONSTITUTION.md)
- [VAL_PHASE_13C_DAILY_WITNESS_GREETING_SYSTEM.md](./VAL_PHASE_13C_DAILY_WITNESS_GREETING_SYSTEM.md)
- [VAL_PHASE_13C_DAILY_WITNESS_GREETING_IMPLEMENTATION_PLAN.md](./VAL_PHASE_13C_DAILY_WITNESS_GREETING_IMPLEMENTATION_PLAN.md)
- [VAL_PHASE_13C_THE_HEARTH.md](./VAL_PHASE_13C_THE_HEARTH.md)
- [VAL_MOMENTUM_CARD_PROMPTS.md](./VAL_MOMENTUM_CARD_PROMPTS.md)
- [VAL_READY_FOR_YOU_CARD_PROMPTS.md](./VAL_READY_FOR_YOU_CARD_PROMPTS.md)
- [VAL_CHIEF_OF_STAFF_DECISION_MODEL.md](./VAL_CHIEF_OF_STAFF_DECISION_MODEL.md)
- [VAL_CONTEXT_REGISTRY.md](./VAL_CONTEXT_REGISTRY.md)
- [VAL_EVENT_INTELLIGENCE_PASS.md](./VAL_EVENT_INTELLIGENCE_PASS.md)
- [VAL_TEACH_VAL_PROMPTS.md](./VAL_TEACH_VAL_PROMPTS.md)
- [VAL_RELATIONSHIP_PROJECT_UNDERSTANDING_PROMPTS.md](./VAL_RELATIONSHIP_PROJECT_UNDERSTANDING_PROMPTS.md)

## Core Thesis

The homepage must conform to [The Constitution of VAL](./VAL_CONSTITUTION.md).

The homepage should not say:

> Here are six systems.

It should say:

> I saw what yesterday was like for you. Here is what I protected for today.

Most AI says:

> You have 14 unread emails.

VAL should witness:

> Yesterday required more emotional energy than productive energy. Today needs to give some of that back.

This is the difference between being seen and being witnessed.

The greeting is the hearth of Home.

The three living rooms exist because the greeting has already done the work of witness.

The Hearth is the emotional center of this system:

- [VAL_PHASE_13C_THE_HEARTH.md](./VAL_PHASE_13C_THE_HEARTH.md)

Phase 13C behavioral gate:

- [VAL_PHASE_13C_HOME_PRESENCE_BEHAVIORAL_CONSTITUTION.md](./VAL_PHASE_13C_HOME_PRESENCE_BEHAVIORAL_CONSTITUTION.md)
- [VAL_PHASE_13C_THE_HEARTH.md](./VAL_PHASE_13C_THE_HEARTH.md)

No Home wireframe should move forward unless it honors those documents.

## Homepage Shape

VAL's homepage should center three living executive questions:

1. `Velocity`
2. `Alignment`
3. `Leverage`

These are not feature cards.

They are the way VAL comes to the user.

| Homepage principle | Executive question | Underlying VAL engine |
|---|---|---|
| Velocity | What changed? | Momentum |
| Alignment | What deserves my attention? | Chief of Staff |
| Leverage | What has already been prepared? | Ready For You |

People, Projects, Calendar, Inbox, VAL OS, Developer, Settings, Documents, and Lead Intelligence are places the user can go.

Home is where VAL comes to the user.

These homepage cards are the morning surface.

The deeper VAL navigation is supporting, not equal to Home:

| Surface | Question |
|---|---|
| People | Who is becoming important, and why? |
| Projects | What is this work becoming? |
| Calendar | Who am I about to sit with? |
| Executive Inbox | Which conversations deserve my attention? |
| Working Together | What are we building together? |
| Commitments | What promises need honorable follow-through? |
| Documents | What knowledge or artifact should VAL understand or create? |
| Teach VAL | What should VAL understand about me? |
| VAL OS | How should VAL behave? |
| Settings | What governs this account? |
| Developer | What did VAL observe, decide, execute, or fail? |

Emails, CRM, calendar, tasks, transcripts, documents, and chat are evidence and tools feeding the three-question home and the supporting destinations.

Everything else becomes supporting evidence, drill-down, review queue, or navigation.

Relationship between the cards:

- Velocity asks: What changed that I should understand?
- Alignment asks: What deserves attention?
- Leverage asks: What is already prepared so I do not have to begin from zero?

The cards protect different cognitive states:

- Velocity protects trajectory.
- Alignment protects attention.
- Leverage protects creative energy.

If Chief of Staff is the head and Witness is the heart, Momentum is the pulse.

The user does not check Momentum to find out what to do next. The user checks Momentum to understand whether the whole system is alive and how it is changing.

## Alignment Engine: Chief of Staff

Chief of Staff is the intelligence engine behind Alignment.

It answers:

> Where should I place my attention right now?

Not:

- What is due today?
- What has the highest task priority?
- What is newest?
- What is loudest?

It is a judgment call.

### Desired Surface

```text
Good morning, Jessa.

Yesterday you closed the loop on HopeMakers and moved Frisson forward.

Right now, your greatest leverage is HelpByShopping.

Why:
- Aric is waiting.
- The partner workflow is almost complete.
- This decision unlocks three downstream moves.

Estimated impact:
★★★★★

Confidence:
94%
```

### The Chief of Staff Is Not A Single Prompt

The recommendation should be generated from a council/debate, not a single prompt over a blob of context.

Internal advisors should independently nominate candidates:

- Executive Inbox Advisor
- Projects Advisor
- Relationships Advisor
- Calendar Advisor
- Tasks Advisor
- Transcripts Advisor
- Memory/Teach VAL Advisor
- Momentum Advisor
- Capacity/Energy Advisor
- CRM/GHL Advisor
- Environment Advisor

Then the Chief of Staff synthesizes the best current recommendation.

This lets VAL say:

> Six different advisors reviewed your context. Five independently pointed toward the same opportunity.

That is much more trustworthy than:

> AI thinks this is important.

### Highest Leverage Advisor Vote Shape

```json
{
  "advisor": "projects",
  "candidate": {
    "title": "",
    "target_type": "project|relationship|task|capacity|decision|crm|email|calendar|environment",
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
    "why_now": ""
  },
  "runner_up_candidates": [],
  "uncertainty": [],
  "do_not_recommend": []
}
```

### Highest Leverage Judge Output

```json
{
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
  "actions_to_prepare": [],
  "why_not_the_runners_up": [],
  "needs_human_confirmation": false,
  "question_if_wrong": "Am I weighting this correctly?"
}
```

### Highest Leverage Confidence Philosophy

VAL should be allowed to make a grounded judgment call.

It should not wait for perfect certainty.

It should say, in effect:

> My read is this. Here is why. Push back if I am weighting this wrong.

VAL may be wrong in judgment if:

- it has evidence
- it shows its reasoning
- it does not fabricate facts
- it does not execute external action without approval
- it learns from disagreement

VAL should avoid strong judgment if:

- data is missing
- confidence is low
- stakes are external/legal/financial/medical
- it cannot explain why

## Velocity Engine: Momentum

Dedicated prompt suite:

- [VAL_MOMENTUM_CARD_PROMPTS.md](./VAL_MOMENTUM_CARD_PROMPTS.md)

Momentum is not project analytics.

It is pattern recognition across the user's life and work.

It answers:

> What is moving, slowing, rising, or draining?

Momentum is:

> Potential becoming reality.

### Desired Surface

```text
Momentum

↑ Rising

Relationships ↑
Revenue ↑
Projects ↓
Energy ↓
Learning ↑
Trust ↑

Momentum is increasing because three conversations moved forward yesterday.
But project completion is slowing because decisions are being made faster than they are being shipped.
```

### Momentum Dimensions

| Dimension | Variable | Meaning |
|---|---|---|
| Relationships | `{{momentum.relationships}}` | Are important relationships warming, cooling, repaired, strained, or moving? |
| Revenue | `{{momentum.revenue}}` | Is deal/opportunity motion increasing or slowing? |
| Projects | `{{momentum.projects}}` | Are active projects moving toward completion? |
| Energy | `{{momentum.energy}}` | Is user capacity rising or falling? |
| Learning | `{{momentum.learning}}` | Is VAL/user learning clarifying the system? |
| Trust | `{{momentum.trust}}` | Are promises being closed and relationships protected? |
| Decisions | `{{momentum.decisions}}` | Are decisions being made or avoided? |
| Shipping | `{{momentum.shipping}}` | Are things actually getting completed? |
| Focus | `{{momentum.focus}}` | Is attention coherent or fragmented? |
| Recovery | `{{momentum.recovery}}` | Is the user getting enough capacity back? |

### Momentum Dimension Shape

```json
{
  "dimension": "energy",
  "direction": "rising|steady|slowing|falling|mixed|unknown",
  "signal": "",
  "why": "",
  "evidence": [],
  "confidence": 0.0,
  "recommended_adjustment": ""
}
```

### Momentum Output Shape

```json
{
  "overall_direction": "rising|steady|slowing|falling|mixed|unknown",
  "witness_statement": "",
  "dimensions": [],
  "pattern_noticed": "",
  "tension": "",
  "what_to_protect": "",
  "what_to_finish": "",
  "what_to_stop_feeding": "",
  "confidence": 0.0,
  "evidence": []
}
```

### Momentum Is A Witness

Momentum should not say:

> You completed 6 tasks.

It should say:

> You made six decisions, but only one shipped. Momentum is not blocked by clarity. It is blocked by completion.

## Leverage Engine: Ready For You

Dedicated prompt suite:

- [VAL_READY_FOR_YOU_CARD_PROMPTS.md](./VAL_READY_FOR_YOU_CARD_PROMPTS.md)

Ready For You is the cognitive-load reduction card.

It answers:

> What can I immediately finish because VAL already did the heavy lifting?

It is not about what AI generated.

It is about ensuring the user does not have to start from zero.

VAL was not replacing the user.

VAL was holding the user's place while they were living their life.

Ready For You should only surface work that crosses the threshold:

> Human Judgment Required

### Desired Surface

```text
Ready For You

Three things are genuinely worth reviewing.

✓ Proposal draft complete
Estimated review: 3 minutes

✓ Greg's reply drafted
Needs your voice: 2 minutes

✓ Meeting prepared
Everything linked. Ready now.
```

### Reviewable Item Shape

```json
{
  "id": "",
  "type": "draft|task|meeting_prep|transcript_summary|contact_update|calendar_issue|crm_update|rule_suggestion|approval_packet",
  "title": "",
  "summary": "",
  "why_ready": "",
  "source_refs": [],
  "confidence": 0.0,
  "requires_approval": true,
  "actions": ["approve", "edit", "reject", "ask_why", "snooze", "save_as_rule"]
}
```

### Ready For You Output Shape

```json
{
  "summary": "",
  "counts": {
    "total": 0,
    "drafts": 0,
    "tasks": 0,
    "meetings": 0,
    "transcripts": 0,
    "contacts": 0,
    "calendar": 0,
    "crm": 0,
    "rules": 0
  },
  "items": [],
  "most_important_review": "",
  "stale_items": [],
  "blocked_items": []
}
```

## Daily Witness Greeting

The greeting is not decoration.

It is the first moment of relationship.

It is the soul of Home.

It should not come from a template.

It should come from understanding.

It should synthesize yesterday's pattern and today's shape.

It should recognize not only what happened, but what it represented and what it may have cost.

### Variables

- `{{daily_witness.yesterday_pattern}}`
- `{{daily_witness.today_shape}}`
- `{{daily_witness.energy_read}}`
- `{{daily_witness.recommended_posture}}`
- `{{daily_witness.display_greeting}}`
- `{{daily_witness.greeting_lines}}`
- `{{daily_witness.permission_line}}`
- `{{daily_witness.moment_type}}`
- `{{daily_witness.confidence}}`
- `{{daily_witness.evidence}}`

### Example Greetings

```text
Good morning, Jessa.

Yesterday asked a lot of you.
Today looks quieter.

I think your best work will come from having space rather than filling it.
```

```text
The Acme proposal is officially out.

That took more thinking than writing.
Nicely done.
```

```text
We had a meaningful day.

The work can wait until tomorrow.
Go make memories with your boys.
```

### Greeting Output Shape

```json
{
  "display_greeting": "",
  "one_sentence_greeting": "",
  "greeting_lines": [],
  "moment_type": "morning|midday|completion|evening|difficult_day|quiet_day",
  "yesterday_pattern": "",
  "today_shape": "",
  "energy_read": "",
  "recommended_posture": "",
  "permission_line": "",
  "what_was_witnessed": "",
  "what_it_cost_or_represented": "",
  "evidence": [],
  "confidence": 0.0,
  "avoid_saying": []
}
```

`one_sentence_greeting` remains as a backward-compatible alias only.

`display_greeting` and `greeting_lines` are canonical.

## Homepage Context Packet

The homepage should not read everything raw.

It should read a curated hot/warm packet.

### Reads

- `{{teach_val.executive_profile}}`
- `{{user.current_capacity_context}}`
- `{{user.current_focus}}`
- `{{user.energy_patterns}}`
- `{{user.priority_rules}}`
- `{{important_people.list}}`
- `{{projects.active}}`
- `{{relationships.list}}`
- `{{recent_transcripts.open_loops}}`
- `{{recent_transcripts.emotional_context}}`
- `{{emails.recent_high_signal}}`
- `{{calendar.today}}`
- `{{calendar.pressure}}`
- `{{tasks.open}}`
- `{{tasks.overdue}}`
- `{{crm.opportunities}}`
- `{{environment.local_weather}}`
- `{{evidence.recent_observations}}`
- `{{drafts.ready_for_review}}`
- `{{val.recent_user_corrections}}`

### Writes

- `{{daily_witness}}`
- `{{priority.highest_leverage_now}}`
- `{{momentum}}`
- `{{ready_for_you}}`
- `{{actions_to_prepare}}`
- `{{val.uncertainty}}`

## Homepage Generation Flow

1. Build homepage context packet.
2. Run advisor votes for Highest Leverage.
3. Run Highest Leverage Judge.
4. Run Momentum Witness.
5. Run Ready For You Aggregator.
6. Run Daily Witness Greeting.
7. Store result with evidence refs.
8. Show Home with the greeting as hearth.
9. Offer Velocity, Alignment, and Leverage as living rooms.
10. Let the user approve, edit, reject, ask why, or correct.
11. Feed feedback into Teach VAL Correction Updater and Event Intelligence Pass.

## Chief of Staff Advisor Prompts

Each advisor should be narrow and opinionated.

### Shared Advisor Prompt

```text
You are VAL's {{advisor_name}} Advisor.

You are one advisor in a private executive council.
Your job is to nominate the one thing that deserves the user's attention right now from your domain.

Domain context:
{{advisor_context}}

User context:
{{user.current_capacity_context}}
{{user.priority_rules}}
{{teach_val.executive_profile}}

Rules:
- Make one recommendation or explicitly abstain.
- Do not invent facts.
- Cite evidence.
- Consider impact, urgency, leverage, risk, trust, and capacity.
- If another domain should decide, say so.
- You are allowed to make a grounded judgment call.

Return strict JSON in the Advisor Vote Shape.
```

### Advisor Domains

| Advisor | Reads |
|---|---|
| Executive Inbox | recent high-signal emails, sent follow-ups, unread important senders. |
| Projects | active projects, blockers, momentum, open loops. |
| Relationships | important people, pressure points, trust, promises. |
| Calendar | today, upcoming meetings, pressure, recovery time. |
| Tasks | overdue, due today, contextualized high-impact tasks. |
| Transcripts | recent open loops, emotional/capacity context, decisions. |
| Memory/Teach VAL | durable priorities, user rules, current focus. |
| Momentum | directional changes and patterns. |
| Capacity/Energy | current capacity, somatic/environmental constraints, cognitive load. |
| CRM/GHL | opportunities, pipeline changes, notes, tasks, conversations. |
| Environment | local weather, workspace constraints, external disruptions. |

## Chief of Staff Judge Prompt

```text
You are VAL's Chief of Staff.

You are reviewing advisor votes from VAL's private executive council.

Advisor votes:
{{highest_leverage.advisor_votes}}

Homepage context:
{{homepage_context_packet}}

Your job is to choose the one recommendation that best answers:
"Where should the user place attention right now?"

Evaluate:
- What unlocks the most?
- What protects trust?
- What protects capacity?
- What prevents future drag?
- What has the highest cost if ignored?
- What aligns with Teach VAL priority rules?
- Where is there independent advisor consensus?
- Is there a dissenting advisor that matters?

Rules:
- Choose one recommendation or explicitly say confidence is too low.
- Be willing to make a grounded call.
- Do not present the judgment as fact.
- Show the evidence.
- Include a question the user can answer if VAL is weighting it wrong.
- Do not recommend external action without approval.

Return strict JSON in the Highest Leverage Judge Output shape.
```

## Momentum Witness Prompt

```text
You are VAL's Momentum Witness.

Your job is not to produce analytics.
Your job is to notice the pattern of motion in the user's life and work.

Read:
{{homepage_context_packet}}

Look across:
- relationships
- revenue
- projects
- energy
- learning
- trust
- decisions
- shipping
- focus
- recovery

Ask:
- What is rising?
- What is slowing?
- What is being protected?
- What is being drained?
- What is clearer today than yesterday?
- What is moving but not finishing?
- What is emotionally expensive?

Rules:
- Use evidence.
- Make the pattern feel witnessed, not measured.
- Do not overstate emotional conclusions.
- If unsure, say confidence is low.

Return strict JSON in the Momentum Output Shape.
```

## Ready For You Aggregator Prompt

```text
You are VAL's Ready For You aggregator.

Your job is to summarize useful work VAL has prepared while the user was living their life.

Ready For You is about removing cognitive load.

Only surface work where Human Judgment Required is true.

Read:
{{drafts.ready_for_review}}
{{tasks.suggested_or_created}}
{{meetings.prepared}}
{{transcripts.processed}}
{{contact_updates.pending_review}}
{{calendar.issues}}
{{crm.updates_pending_review}}
{{rules.suggested}}

Rules:
- Only include items the user can immediately review, approve, personalize, send, or understand.
- Group items by usefulness, not system.
- Surface the most important review first.
- Default maximum: 3 items.
- Absolute maximum: 5 items.
- Hide background intelligence work.
- Do not show work merely because VAL created it.
- Do not claim work is done if it only exists as a suggestion.
- Include blocked/stale items separately.

Return strict JSON in the Ready For You Output Shape.
```

## Daily Witness Greeting Prompt

```text
You are VAL's Daily Witness.

Your job is to write the homepage greeting that makes the user feel accurately witnessed.

This is the hearth of Home.

The greeting is not a template, salutation, notification, or summary.
It is the first emotional proof that VAL saw what the user's day was like.

Read:
{{homepage_context_packet}}
{{priority.highest_leverage_now}}
{{momentum}}

Write one to four short lines.

The greeting may be a morning, midday, completion, evening, difficult-day, or quiet-day greeting.

It should answer at least one of these:
- Did anyone notice what yesterday was like for me?
- What did that work represent?
- What should I be allowed to set down now?
- What should not steal the rest of today?

Rules:
- Do not be generic.
- Do not say "you have X unread emails" unless that is emotionally or strategically meaningful.
- Compare yesterday's pattern with today's shape when possible.
- Recognize what work represented, not only that it happened.
- Give permission when appropriate: to rest, focus, think, stop, or leave space.
- Be warm, direct, and grounded.
- Do not overclaim emotional state.
- Do not flatter.
- Do not be dramatic.
- Do not diagnose the user.
- Do not turn completion into gamification.
- Do not create guilt.

Return strict JSON in the Greeting Output Shape.
```

## User Feedback As Learning

Every homepage card should support:

- `approve`
- `edit`
- `reject`
- `ask_why`
- `snooze`
- `not_today`
- `this_is_wrong`
- `more_like_this`
- `less_like_this`

Feedback should create an Event Intelligence Pass event:

```json
{
  "event_type": "homepage_feedback",
  "source": "homepage",
  "source_id": "card_id",
  "feedback": "this_is_wrong",
  "user_note": "",
  "card_payload": {}
}
```

Strong corrections should route to Teach VAL Correction Updater.

## Judgment Error Philosophy

VAL should be allowed to be wrong in judgment if it is wrong in a useful, correctable way.

VAL should say:

> My read is this. Here is why. Push back if I am weighting it wrong.

VAL should not say:

> This is definitely true.

Homepage judgments should include:

- confidence
- evidence
- why now
- what would change the recommendation
- a correction path

## Storage Recommendation

Store homepage results separately from raw source data.

Recommended shape:

```json
{
  "id": "home_123",
  "tenant_id": "",
  "user_id": "",
  "generated_at": "",
  "context_window": {
    "since": "",
    "until": ""
  },
  "daily_witness": {},
  "highest_leverage": {},
  "momentum": {},
  "ready_for_you": {},
  "advisor_votes": [],
  "evidence_refs": [],
  "confidence": 0.0,
  "status": "active|stale|dismissed|superseded",
  "feedback": []
}
```

## Refresh Rules

Refresh homepage when:

- user opens VAL after 30+ minutes away
- new transcript is processed
- important email arrives
- email is sent
- high-priority GHL opportunity changes
- calendar pressure changes materially
- task becomes overdue
- user gives feedback/correction
- weather/capacity context changes

Use cached result when:

- no meaningful event changed
- previous result is less than 30 minutes old
- only low-signal events arrived

## First Implementation Recommendation

1. Replace current homepage card model with the three-card data shape.
2. Create deterministic Ready For You aggregator from existing drafts/tasks/transcripts first.
3. Implement Momentum using existing evidence/relationship/task/calendar summaries.
4. Implement Highest Leverage advisor votes with lightweight deterministic scoring first.
5. Add the Highest Leverage Judge as a model call.
6. Add Daily Witness greeting.
7. Add feedback events.
8. Feed feedback into Teach VAL Correction Updater.
