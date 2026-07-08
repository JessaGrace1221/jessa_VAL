# Hearth Executive Reasoning Pipeline

Purpose: define the reasoning spine that decides what VAL observes, classifies, judges, prepares, shows, executes, learns, and remembers before anything reaches Home, a drawer, Co-Work, or a voice/chat interface.

This document sits above:

- `VAL_REALITY_PROCESSING_PIPELINE.md`
- `HEARTH_TRUTH_LINEAGE_MAP.md`
- `HEARTH_CLICK_CONTRACTS.md`
- `HEARTH_PACKET_COMPLETENESS_CONTRACT.md`
- `VAL_CHIEF_OF_STAFF_DECISION_MODEL.md`
- `VAL_PROMPT_ARCHITECTURE.md`

Those documents answer where truths travel and what packets/clicks may use them.

This document answers:

```text
Should this truth matter to the user right now?
What kind of truth is it?
What should VAL do with it before the user is interrupted?
What should VAL learn after the user acts?
```

## Architecture Layer Boundary

The Hearth architecture has four separate layers:

1. Reasoning: how VAL thinks.
2. Truth: what is true and where it came from.
3. Context: what information is available to a specific interaction.
4. Interaction: what happens when the user clicks, speaks, types, approves, or dismisses.

This document owns Reasoning.

It should not define DOM triggers, click selectors, drawer mechanics, or packet hydration syntax except as examples. Those belong in click contracts, packet contracts, and the truth lineage map.

The boundary matters because VAL must be debugged by layer:

- If VAL surfaced the wrong thing, inspect Reasoning.
- If VAL used the wrong source, inspect Truth.
- If VAL lacked context, inspect Context.
- If the click opened the wrong surface, inspect Interaction.

## Core Principle

Truth lineage is not executive judgment.

A fact can be true, sourced, and packet-ready, and still not deserve the user's attention.

VAL should not show something merely because it exists. VAL should show it because it has passed a reasoning gate.

The platform-wide rule for that gate is defined in `VAL_REALITY_PROCESSING_PIPELINE.md`: source data is first witnessed, then admitted or held back by the Executive Relevance Engine, then interpreted by the appropriate Round Table.

## v1 Executive Relevance Rule

For v1, source data must earn cognitive space before it can feed Home, Executive Inbox, Relationships, Projects, Co-Work, or Meeting Prep.

The clearest current boundary is:

```text
More than 3 inbound emails from a sender + 0 sent emails from the user to that sender = inbox_noise.
```

Unless the user explicitly upgrades that sender, this rule means:

- no Executive Inbox item
- no Relationship packet
- no deep context
- no draft
- no Home card

If the user clicks `Not executive contact`, the manual suppression is stronger than all automatic relevance signals until the user explicitly reverses it.

## Reasoning Pipeline

Every meaningful piece of information should pass through this pipeline:

```text
Truth
  -> Normalize
  -> Witness
  -> Observe
  -> Classify
  -> Judge
  -> Prioritize
  -> Prepare
  -> Can VAL Act?
  -> Execute
  -> Learn
  -> Reflect
  -> Remember
```

## Stage Executive Questions

Each stage exists to answer one executive question.

| Stage | Executive question |
|---|---|
| Truth | What entered VAL? |
| Normalize | What exactly is this? |
| Witness | What actually happened? |
| Observe | What changed, moved, appeared, or resolved? |
| Classify | What kind of thing is this? |
| Judge | Does this deserve attention? |
| Prioritize | Is this the best use of the user's judgment now? |
| Prepare | What can VAL finish before interrupting? |
| Can VAL Act? | Can VAL safely complete this, or does it need approval/context? |
| Execute | Can VAL safely complete the approved action? |
| Learn | Was VAL's judgment correct? |
| Reflect | Did VAL help accomplish the user's real goal? |
| Remember | Should this change future behavior? |

### 1. Truth

Raw information enters VAL from:

- witnessing session
- Teach VAL
- transcript
- email
- calendar
- relationship profile
- project dossier
- document
- commitment/task
- CRM/GHL
- user chat or voice input
- external action receipt

Truth is not yet meaning.

### 2. Normalize

Normalize raw inputs into stable source records:

- source type
- source id
- source timestamp
- actor/person/project match
- confidence
- source receipt
- source-of-source references
- provider metadata

Normalization should answer:

```text
What is this?
Where did it come from?
Can VAL route back to it exactly?
```

### 3. Observe

Before observation, the Witness states what actually happened without interpretation.

Witness examples:

- Greg replied.
- Proposal attached.
- Signature requested by Friday.
- User said this person is not an executive contact.

The Witness does not recommend, rank, draft, or decide.

Observers detect what happened without deciding what should happen.

Observer outputs should be narrow:

- what changed
- what was said
- what was promised
- what was requested
- what moved
- what stalled
- what risk appeared
- what opportunity appeared
- what emotional/relationship signal changed

Observers do not decide Home placement.

### 4. Classify

Intent classification turns observations into typed meaning.

Every statement, signal, or change should be classified as one or more:

- question
- answer
- decision
- unresolved decision
- promise
- commitment
- delegation
- explicit request
- implied request
- idea
- risk
- opportunity
- teaching
- preference
- memory
- relationship signal
- project signal
- document/reference signal
- calendar/timing signal
- blocker
- completion

This prevents every Round Table from rediscovering the same meaning independently.

### 5. Judge

The Executive Judge asks:

```text
Should this interrupt the user?
Should VAL prepare something quietly?
Should this remain in the source drawer only?
Should this become memory?
Should this be ignored?
```

Judgment should consider:

- confidence
- cost to user
- cost to VAL
- urgency
- reversibility
- relationship risk
- project impact
- timing sensitivity
- user capacity
- explicitness
- source trust
- witnessing context
- prior user feedback

### 6. Prioritize

Prioritization asks whether this is the best use of the user's judgment now.

Prioritize should not mean sort by urgency only.

It should consider:

- executive leverage
- blocked people/projects
- deadline shape
- cost if delayed
- relationship sensitivity
- user's stated goals
- user's available capacity
- whether VAL can prepare first

### 7. Prepare

Prepare is where VAL earns its keep.

Prepare should not be treated as a single step. It is Leverage's factory.

Internal Prepare pipeline:

```text
Gather Context
  -> Research
  -> Draft / Organize / Schedule / Classify / Update
  -> Cross-check
  -> Predict Questions
  -> Package
  -> Ready for Approval
```

Prepare should answer:

```text
What can VAL complete before interrupting the user?
What context will the user need to approve quickly?
What questions will the user ask before trusting this?
What risks or missing fields remain?
```

Prepared work should carry:

```text
prepared_work_type
trigger_source_id
context_used
source_of_source_refs
draft_or_work_product
cross_check_notes
predicted_questions
approval_needed
execution_path
missing_fields
confidence
```

### 8. Can VAL Act?

Between Prepare and Execute, VAL must pass an explicit action gate.

```text
Prepare
  -> Can VAL execute?
      -> Yes: Execute
      -> No: Leverage
      -> Missing information: Alignment
      -> Not worth interrupting: Quiet Observation
```

The gate should consider:

- whether the user has approved the action
- whether the action has external side effects
- whether required fields are present
- whether the action is reversible
- whether the user has delegated this class of action to VAL
- whether legal, financial, medical, privacy, or reputational risk is present

Execute is not the default next step. Approval, more context, or silence may be the wiser path.

## Cost Model

Confidence is not enough.

Each candidate should carry:

```text
confidence
cost_to_user
cost_to_val
cost_if_ignored
reversibility
approval_required
```

Example:

```text
Candidate: Reply to Greg
Confidence: 97%
Cost to user: 8 minutes
Cost to VAL: 3 seconds to draft
Cost if ignored: relationship drift
Approval required: yes, before send
Judgment: prepare draft quietly, surface in Leverage
```

This is executive behavior: VAL should reduce user load when the work is cheap for VAL and expensive for the user.

## Round Tables In The Pipeline

Round Tables are not UI surfaces.

They are specialized reasoning engines inside the pipeline.

```text
Observe
  -> Velocity Round Table
Classify + Judge + Prioritize
  -> Alignment Round Table
Prepare
  -> Leverage Round Table
Learn + Reflect + Remember
  -> Memory / Wisdom Round Table
```

### Velocity Round Table

Question:

```text
What changed, and does it matter?
```

Velocity Round Table should observe meaningful movement only. It should not decide the user's top priority or prepare autonomous work.

### Alignment Round Table

Question:

```text
Given everything VAL knows, where is the user's judgment most valuable now?
```

Alignment Round Table should consume Movement Packets, intent classifications, commitments, calendar pressure, relationship risk, project blockers, user capacity, and Witnessing Context.

It produces ordered Priority Packets with Why Now reasoning.

### Leverage Round Table

Question:

```text
What can VAL prepare or complete without bothering the user yet?
```

Leverage Round Table consumes explicit requests, implied requests, opportunities, commitments, emails, transcripts, documents, and project/relationship context.

It produces Prepared Work Packets.

### Memory / Wisdom Round Table

Question:

```text
What should change about future judgment?
```

Memory / Wisdom Round Table consumes approvals, edits, dismissals, completed actions, changed relationship/project judgments, and user corrections.

It produces reviewable memory, calibration lessons, and reflection notes.

## Executive Queues

After Judge, an item may enter one of these queues.

### Quiet Observation

For true information that does not deserve interruption.

Use when:

- the source is valid
- the information may be useful later
- no action or attention is needed now

### Velocity Queue

Executive question:

```text
What changed while I was away?
```

Velocity is awareness.

An item enters Velocity only when:

- something specific changed
- the change matters
- the source routes to an exact drawer/workspace
- the source has a real record or reviewed receipt
- the item is not merely new, synced, imported, reviewed, or counted

Velocity does not ask the user to do the work.

### Alignment Queue

Executive question:

```text
Where is my judgment most valuable now?
```

Alignment is execution.

An item enters Alignment only when:

- it is the highest-priority active thing
- it needs the user's judgment or action
- the needed decision/action is clear
- Co-Work can open with full context
- completion can load the next priority or produce a receipt

### Leverage Queue

Executive question:

```text
What did VAL create or prepare for me?
```

Leverage is prepared work plus approval-to-execute.

An item enters Leverage only when:

- VAL has prepared concrete work
- the trigger source is attached
- approval/action is explicit
- the execution path is known or the blocker is named

### Memory Queue

For durable truths, preferences, lessons, and relationship/project updates.

Memory requires review when:

- the scope is ambiguous
- the truth affects more than one relationship/project
- the user did not explicitly ask VAL to remember it
- it changes a durable judgment

## Why Now Packet

Every Alignment item must include a Why Now Packet.

Required fields:

```text
priority
why_now
blocked_project_or_person
deadline_or_timing_basis
cost_if_delayed
decision_needed
action_needed
evidence_refs
confidence
```

Bad:

```text
This is important because it is urgent.
```

Good:

```text
This should come first because Michele is waiting on the proposal decision,
the Friday deadline blocks the next project step,
and replying now prevents three later follow-up tasks.
```

## Opportunity Engine

VAL should not only react.

The Opportunity Engine asks:

```text
What useful work exists that the user did not explicitly ask for?
```

Examples:

- transcript mentions someone wants an introduction
- email implies a follow-up task
- meeting reveals a reusable proposal section
- relationship warms enough to justify a check-in
- project blocker can be clarified in a draft
- document can be attached to the right project

Opportunity output:

```text
opportunity_type
source_id
why_it_matters
confidence
explicit_or_implied
prepared_work_possible
approval_required
recommended_queue
```

Most opportunities should feed Leverage only after VAL prepares concrete work.

## Intent Engine

The Intent Engine is foundational.

It reads transcripts, email, chat, voice, and Teach VAL input and classifies statements before downstream Round Tables run.

It should produce:

```text
statement
speaker
source_id
intent_type
explicitness
linked_relationships
linked_projects
required_action
deadline
confidence
evidence_refs
```

Explicitness values:

- explicit
- implied
- inferred
- ambiguous

Routing examples:

- explicit request -> Leverage or Commitment
- implied request -> Opportunity Engine, then Leverage if prepared work is possible
- unresolved decision -> Alignment
- relationship signal -> Relationship packet and possibly Velocity
- project movement -> Project packet and possibly Velocity
- teaching/preference -> Memory Queue

## Executive Memory

VAL must remember judgment changes, not only facts.

Example:

```text
Relationship: Greg
June 4: Warm
June 12: Cooling
Reason: Three unanswered emails and one missed follow-up.
Evidence: email thread ids, calendar gap, prior warmth signal
```

Executive Memory should track:

- previous judgment
- current judgment
- reason for change
- evidence
- confidence
- user feedback
- downstream surfaces updated

This lets VAL explain why it changed its mind.

## Completion Learning

Every approval, edit, dismissal, completion, or refusal should teach VAL.

Learning events:

- approved as-is
- approved after edits
- rejected
- ignored
- delayed
- sent
- scheduled
- task created
- memory accepted
- memory rejected

Completion Learning should ask:

```text
What pattern made this successful or wrong?
Should similar future items be promoted, prepared quietly, delayed, or suppressed?
```

Learning output:

```text
action_id
source_id
original_judgment
user_response
success_pattern
correction
future_rule_candidate
confidence
requires_review
```

## Executive Reflection

Learning asks:

```text
Was VAL's judgment correct?
```

Reflection asks:

```text
Did VAL help accomplish the user's real goal?
```

Example:

```text
Surface behavior: The user approved ten emails.
Learning: The user prefers shorter emails.
Reflection: The real objective was rebuilding trust with Michele.
Future optimization: Optimize for trust, not merely inbox completion.
```

Reflection output:

```text
stated_goal
inferred_goal
action_taken
surface_success
deeper_goal_progress
evidence
future_optimization
requires_user_review
```

Reflection should be careful. It may infer goals, but durable changes to operating behavior should become reviewable learning candidates unless the user explicitly confirms them.

## Chief of Staff Test

Before any item reaches Home, VAL should pass the Chief of Staff Test:

```text
If a human Chief of Staff had unlimited time,
would they interrupt the CEO with this?
```

If yes, the item may continue toward Home.

If no, it should stay in Quiet Observation, source drawers, prepared work review, or memory review.

The Chief of Staff Test is intentionally simple. It protects Home from becoming an activity feed.

## v1 Operating Rule

For v1, Home may only show:

1. Velocity items that passed the Velocity Round Table.
2. Alignment items with a complete Why Now Packet.
3. Leverage items with a Prepared Work Packet and Can VAL Act status.

If an item lacks the required reasoning proof for its Home mode, it must stay out of Home.

No partial, fallback, synced, imported, reviewed, counted, or merely available item may appear on Home because it is convenient to display.

## Executive Narrative

The morning Home narrative should synthesize packets into a coherent executive story.

It should not list every change.

It should answer:

```text
What is the shape of momentum?
What changed that matters?
Where is judgment needed?
What has VAL already prepared?
What can stay quiet?
```

Example:

```text
Yesterday three important things happened.

Michele moved the proposal forward.
GOALL slowed slightly because the transcript uncovered five unanswered commitments.
Greg's relationship strengthened after yesterday's meeting.

Overall momentum is positive, but follow-through needs protection today.
```

This narrative is not a summary. It is synthesis from the reasoning pipeline.

## Witnessing Context Packet

The Witnessing Session must be available to every chat, voice interface, card, drawer, and Round Table.

But it must be scoped.

Do not dump the full Witnessing Session into every prompt.

Always include:

- user identity and partnership posture
- voice/tone rules
- do-not-do rules
- known preferences
- durable operating agreements
- relevant boundaries

Retrieve only when relevant:

- relationship-specific witnessing memory
- project-specific witnessing memory
- prior user correction
- style examples
- emotional/contextual patterns
- important people/projects

Rule:

```text
Witnessing context should deepen the active source.
It must not dilute or replace the active source.
```

## Implementation Boundary

This document is an architecture contract.

Do not implement new Round Table or packet behavior until:

1. The user has reviewed this document.
2. Admission rules are accepted or revised.
3. Runtime packet changes are mapped back to this pipeline.
4. Tests are planned for at least Velocity admission, Alignment Why Now, Leverage prepared-work admission, and Witnessing Context scoping.

## Open Questions

1. Should Opportunity have a visible drawer, or should it feed Leverage quietly?
2. Should Executive Memory be visible to the user by default, or only when a judgment changes?
3. What is the minimum cost model needed for v1?
4. Which approvals should teach automatically, and which should create reviewable learning candidates?
5. Should the morning Executive Narrative be a separate packet or generated from the three Home queues?
6. Which Reflection notes should become durable memory, and which should remain temporary calibration?
7. What classes of action can pass the Can VAL Act gate without fresh approval?
