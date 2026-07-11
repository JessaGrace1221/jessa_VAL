# VAL Stewardship Executive UI And Sorting Spec

Status: Product definition only.

Implementation approval required before visible UI changes.

## Purpose

This document defines the first visible Stewardship product slice now that the backend judgment layer can determine:

- relationship admission
- packet maturity
- source-to-person evidence binding
- executive visibility
- whether VAL may evaluate possible moves

The first visible Stewardship product slice must help the user answer:

- Who deserves my attention?
- Why are they here?
- What is happening in this relationship?
- What does VAL believe the next thoughtful move may be?
- What should I review, correct, approve, or leave alone?

Stewardship must not become:

- a contact directory
- a CRM record viewer
- an activity stream
- a debugging surface
- a project-management page
- an introduction-only workflow
- a pile of generic action buttons

## Product Hierarchy

Person packet = durable relationship understanding.

Stewardship judgment = whether the relationship needs attention.

Next move decision = what thoughtful action, if any, should be considered.

Executive UI = the distilled judgment and review path.

Leverage = prepared work awaiting approval.

The executive UI must not expose the machinery used to reach the judgment.

## 1. People List Sorting

### Purpose Of The List

The Stewardship people list is not a list of every contact VAL knows.

It is a prioritized relationship-attention surface.

Every person must first pass:

Identity resolution -> evidence binding -> relationship admission -> packet maturity -> executive visibility.

Only then may the person appear in a visible Stewardship section.

### Visibility States

Every admitted or unresolved person must receive one executive visibility state:

```json
{
  "executive_visibility": "hidden|identity_review|people_to_watch|active_stewardship"
}
```

Visibility is separate from admission.

A person may be a valid relationship and still remain hidden because no executive attention is needed.

### Hidden

Use when:

- the person was rejected from Stewardship
- the sender is spam, marketing, automated, or one-way inbound with no meaningful engagement
- the record is a generic mailbox
- public enrichment is the only evidence
- the relationship is real but no review, move, or monitoring need exists
- the selected move is `do_nothing`
- the relationship is healthy and requires no current attention
- the packet is thin and user review would not improve it
- the item would add clutter without helping the executive act or decide

Hidden does not mean deleted.

The person packet and source evidence may continue accumulating meaning behind the scenes.

Expected UI:

No active Stewardship item.

### Needs Identity Review

Use when `admission_status = blocked_by_identity`, or when meaningful evidence exists but the system cannot safely determine:

- which contact record is correct
- whether two names are the same person
- whether one person has multiple aliases
- whether two different people were merged
- which transcript speaker matches which contact
- which CRM identity should anchor the packet

These people must not be matched, drafted for, or included in move preparation until resolved.

Visible copy must name the problem.

Good:

```text
Mike Nonhof
Needs identity review
VAL found meaningful context for Mike, but two possible contact records may refer to him.
Review the contact match before VAL uses this relationship.
```

Bad:

```text
Identity unresolved
Packet blocked
Low confidence contact
```

Allowed controls:

- Review contact match
- Confirm identity
- Not the same person
- Ignore this record

### People To Watch

Use when:

- the relationship is admitted
- the packet is thin or developing
- no move is responsible yet
- something specific may change the judgment later
- there is a clear reason to monitor the relationship
- one missing fact may make the person relevant later
- timing is not yet appropriate
- the user has already acted and should not over-contact

A person should not appear under People To Watch merely because their packet is incomplete.

There must be a reason to watch.

Good:

```text
Kareemah
Packet developing
VAL has evidence of Kareemah's nonprofit experience, but her current role is not yet confirmed.
Watch for:
A current role update or direct confirmation of the work she is doing now.
```

Bad:

```text
Needs more evidence
Developing relationship
Waiting
```

Allowed controls:

- Add context
- Check for new evidence
- Stop watching
- Correct VAL

### Active Stewardship Queue

Use when:

- the relationship is admitted
- identity is reliable
- the packet is usable or strong
- there is an explicit commitment, meaningful open matter, specific question, or responsible move candidate
- the item requires executive awareness, correction, approval, or judgment
- VAL can explain why the relationship deserves attention now

Examples:

- a promised introduction
- a follow-up commitment
- a pending response with relationship significance
- a useful resource VAL can prepare
- a timely reconnection opportunity
- a precise question that unlocks a responsible move
- a suggested move ready for review
- a move blocked by one specific missing fact

The active queue should not include:

- people with no move
- generic dormant relationships
- low-value contact records
- relationships surfaced only because time passed
- people ranked highly because of email volume
- general biographies
- unrelated project work

### Primary Sort Order

Sort visible Stewardship items in this order:

1. Explicit user commitments with prepared work ready for review
2. Explicit user commitments blocked by one specific missing fact
3. High-value suggested moves ready for executive review
4. Time-sensitive relationship matters
5. Precise questions that unlock a responsible move
6. Needs identity review
7. People To Watch
8. No-move relationships remain hidden

Within the same section, sort by:

- direct user commitment
- urgency
- relationship consequence
- timing relevance
- source strength
- readiness of prepared work
- risk of missed follow-through
- user-defined importance

Do not sort by:

- alphabetic order as the primary method
- email volume
- number of messages
- number of open loops
- packet age
- arbitrary temperature score
- contact popularity
- company size

### List Row Contract

Each visible row should show only enough information to support executive judgment.

Required fields:

- person
- executive status
- why this person matters now
- what is open
- VAL's recommended posture or move
- evidence posture

Example:

```text
Terrie
Move suggested
Why this matters:
You told Terrie you would introduce her to Kareemah.
What is open:
The introduction has not been completed.
VAL's next move:
Review the prepared introduction.
Evidence:
Transcript from July 8, supported by Kareemah's person packet.
```

The row should not display:

- packet IDs
- observer names
- raw confidence values
- open-loop counts
- email counts
- activity totals
- internal state codes
- provider names
- debugging copy

## 2. Status Meaning

### Purpose

The previous temperature model used vague labels such as:

- waiting
- warm
- strategic
- needs attention
- new

Those labels require the executive to interpret what the system means.

The visible status should instead explain the current Stewardship posture.

### Approved Visible Statuses

#### Needs Identity Review

Meaning:

VAL found meaningful relationship evidence but cannot safely resolve the person.

Executive implication:

Correct the identity before VAL uses this person in recommendations or prepared work.

#### Packet Developing

Meaning:

VAL recognizes a real relationship but does not yet have enough source-backed understanding to recommend a move.

Executive implication:

Add context, review one missing fact, or allow VAL to keep learning.

This status should usually appear under People To Watch, not in the active queue.

#### Ready To Evaluate

Meaning:

VAL has enough reliable context to consider possible stewardship moves, but no move has yet passed the full decision tests.

Executive implication:

VAL may evaluate introductions, follow-ups, reconnections, questions, resources, waiting, or no action.

This may be a temporary internal-to-visible bridge state.

It should not appear prominently unless executive review is useful.

#### Move Suggested

Meaning:

VAL has selected one source-backed next move that deserves executive review.

Executive implication:

Review, approve, correct, or wait.

The move must be named.

Good:

```text
Move suggested: Introduce Terrie and Kareemah
```

Bad:

```text
Move suggested
```

#### No Move Right Now

Meaning:

VAL understands the relationship but does not see a responsible or valuable action at this time.

Executive implication:

No action is needed.

These people should normally remain hidden from the active queue.

They may appear in the person detail view when the user searches for them directly.

### Status Is Not A Score

Status must not imply:

- relationship quality
- human worth
- influence
- closeness
- strategic importance
- emotional sentiment
- executive priority by itself

Status explains where the relationship sits in VAL's current decision process.

### Plain-Language Explanation

Every status must answer:

- What does this mean?
- What prevents or enables the next step?
- What should the executive do, if anything?

No visible status may stand alone without explanation.

## 3. Relationship Detail Page

### Purpose

The relationship detail page should show the durable person packet and the current Stewardship judgment clearly.

It should help the user understand the relationship.

It should not become a dossier, raw source archive, or broad action menu.

### Page Header

Show:

- person name
- role or essential context
- company or relationship context when useful
- visible Stewardship status
- one-sentence explanation of that status

Example:

```text
Terrie
Nonprofit leader connected through [relationship context]
Move suggested
You told Terrie you would introduce her to Kareemah, and VAL found enough supporting context to prepare the connection for review.
```

### Section 1: Who This Person Is

Show:

- concise source-backed summary
- how the user knows them
- current role or context
- meaningful relationship origin

Do not show a generic scraped biography.

Public enrichment may support role or company context, but it must be clearly subordinate to relationship evidence.

### Section 2: Why This Person Matters

Show:

- why this person is in the user's world
- what makes the relationship meaningful
- why VAL is surfacing them now
- what opportunity, commitment, or care responsibility exists

This section should not repeat Who This Person Is.

### Section 3: What They Need

Show only:

- explicit needs
- strong source-backed inferred needs
- current gaps
- requested support
- goals or friction relevant to stewardship

Each need should include:

- plain-language need
- why it matters
- timing
- source posture

Example:

```text
Needs:
A trusted introduction to someone with adaptive nonprofit program experience.
Why it matters:
Terrie is exploring how to expand access in her current initiative.
Source:
Transcript from July 8.
```

Do not present weak assumptions as facts.

### Section 4: What They Offer

Show:

- expertise
- access
- credibility
- resources
- network value
- lived experience
- operational ability
- strategic knowledge
- support they can genuinely provide

Each offer should include:

- plain-language offer
- why it matters
- source posture

Public enrichment may support a plausible offer, but it must not independently prove willingness, availability, permission, or current relevance.

### Section 5: What Is Open

Show relationship-specific unresolved matters only.

Examples:

- promised introduction
- follow-up commitment
- pending answer
- resource to send
- clarification needed
- unfinished conversation
- permission question
- identity correction

Do not show:

- every task connected to the person
- raw task counts
- unrelated project items
- every unread message
- every transcript mention
- every calendar event

Each open item should answer:

- What is open?
- Why does it matter to the relationship?
- What source supports it?

### Section 6: Recommended Next Stewardship Move

Show one selected move or one clear posture.

Possible values:

- Introduce
- Follow up
- Reconnect
- Ask a question
- Send something
- Wait or watch
- No move right now

Required display:

- VAL's next move
- why this move
- why now
- what evidence supports it
- what risk or missing context remains
- what VAL has prepared

Example:

```text
VAL's next move:
Introduce Terrie and Kareemah.
Why:
Terrie appears to need adaptive nonprofit experience, and Kareemah has source-backed experience in that area.
Why now:
You made a direct commitment to connect them.
Evidence:
Transcript from July 8, Kareemah's CRM context, and recent sent email.
Prepared:
Introduction draft ready for review.
```

### Section 7: Source-Backed Evidence

Show a clean source summary.

Examples:

- Transcript from July 8
- Sent email from July 9
- Meeting on June 28
- CRM note confirmed by user
- Public role context from approved enrichment

Allow the user to expand or review the source.

Do not expose:

- raw prompt output
- observer names
- reasoning traces
- confidence debugging
- provider-specific architecture
- source-of-source internals

### Controls

The relationship detail page should not show a broad pile of actions.

Show only controls relevant to the current judgment.

Possible controls:

- Review prepared move
- Approve
- Correct VAL
- Add context
- Wait
- Mark completed
- Not appropriate
- Check for new evidence

Do not show controls such as:

- brainstorm
- generic draft message
- create random task
- review social profile
- mark VIP
- snooze
- not important
- unrelated project actions

unless those controls are tied to a real, defined product behavior and the selected move.

### Refresh Action

Executive-facing label:

```text
Check for new evidence
```

or:

```text
Refresh relationship context
```

Do not use:

```text
Refresh observers
```

The action should:

- check newly available source evidence
- update identity resolution
- update evidence binding
- update packet maturity
- re-evaluate visibility
- re-evaluate the next move when allowed
- explain what changed

It must not simply rerun the same summary and produce different wording.

## 4. Leverage / Move Review Page

### Purpose

The move review page should answer:

- What is the most thoughtful next move?
- Why is VAL recommending it?
- What has VAL prepared?
- What should the user approve, correct, or decline?

The page must not be centered only on introductions.

Introduction is one move type.

### Move Types

The review page must support:

- introduce
- follow up
- reconnect
- ask a question
- send something
- wait or watch
- no move right now

### Shared Review Page Contract

Every move review should show:

#### The People Involved

For single-person moves:

- focus person
- user's relationship to them

For introductions:

- both people
- direction of value
- why the user is the appropriate connector

#### The Suggested Move

Example:

```text
Suggested move:
Follow up with Mike about the commitment from Friday.
```

#### Why This Move

Explain the relationship value.

Not merely:

```text
There is an open task.
```

Instead:

```text
Mike is waiting for the material you said you would send, and completing it protects trust in the relationship.
```

#### Why Now

Show the timing trigger.

Examples:

- direct promise
- recent reply
- upcoming meeting
- project milestone
- current opportunity
- relationship-sensitive delay
- newly resolved context

#### Evidence

Show the sources supporting:

- the relationship
- the open matter
- the proposed move
- timing
- permission
- relevant needs or offers

#### Missing Context Or Risk

Show:

- what remains uncertain
- what could make the move inappropriate
- what the user should correct
- whether VAL should wait

#### Prepared Work

Show the actual prepared output when applicable:

- introduction draft
- follow-up draft
- reconnection note
- question to ask
- resource message
- document or proposal
- watch trigger

#### Approval State

Use:

```text
Ready for review
Nothing has been sent
```

Do not use vague copy such as:

```text
VAL prepared something
```

Name the work.

### Move-Specific Behaviors

#### Introduce

Show:

- who needs whom
- what need is supported
- what offer is supported
- why both people may benefit
- permission or sensitivity posture
- prepared introduction

#### Follow Up

Show:

- what the user committed to
- what remains incomplete
- why following through matters
- prepared follow-up or deliverable

#### Reconnect

Show:

- why the relationship mattered before
- what makes reconnecting relevant now
- why inactivity alone is not the reason
- prepared reconnection note

#### Ask A Question

Show:

- the exact missing fact
- why it blocks a responsible move
- the shortest useful question
- where the answer will update VAL's understanding

#### Send Something

Show:

- what VAL recommends sending
- which source-backed need it addresses
- why the item fits
- the prepared message or material

#### Wait Or Watch

Show:

- why action is premature
- what trigger VAL is watching for
- what evidence would cause re-evaluation
- whether the user wants to change the trigger

#### No Move Right Now

Do not create a Leverage card.

The person remains searchable in Stewardship but stays outside the active queue.

## 5. Acceptance Cases

### Acceptance Case A: Terrie And Kareemah

Source evidence:

```text
I will introduce Terrie to Kareemah.
```

Required backend posture:

- Terrie is admitted or marked for identity review
- Kareemah is admitted or marked for identity review
- evidence is bound separately to both people
- the explicit commitment is preserved
- the commitment outranks inferred opportunities
- VAL evaluates whether the introduction can responsibly be prepared

Expected people list:

```text
Terrie
Move suggested
Why this matters:
You told Terrie you would introduce her to Kareemah.
What is open:
The introduction has not been completed.
VAL's next move:
Review the introduction context.
Evidence:
Transcript from [date].
```

When sufficient context exists:

```text
VAL's next move:
Review the prepared introduction.
```

Expected relationship detail:

Terrie's page may show:

- who Terrie is
- what Terrie needs
- what is known about Kareemah's relevant offer
- the promised introduction
- why it matters
- the prepared move
- supporting sources

Kareemah's page may show the same connection from Kareemah's side without duplicating or changing the underlying evidence.

Expected Leverage review:

```text
Prepared introduction: Terrie and Kareemah
Why VAL prepared it:
You made a direct commitment to introduce them, and their source-backed packets indicate a relevant need-and-offer fit.
Status:
Ready for review. Nothing has been sent.
```

Failure conditions:

- the promise appears only in the transcript summary
- the promise becomes only a generic task
- the UI shows an open-loop count
- the UI shows only relationship temperature
- no move is surfaced
- the introduction draft is created without evidence
- the message is sent without approval
- Terrie and Kareemah's evidence is mixed incorrectly

### Acceptance Case B: Mike Nonhof

Source evidence:

Mike is referenced through meaningful user-created or reciprocal evidence.

His identity may appear through:

- aliases
- sent email
- transcript mention
- CRM contact
- user teaching
- commitments
- meeting context

Expected result:

- Mike has one durable person packet
- confirmed aliases resolve to the same person
- Mike does not disappear because one source uses a different email or naming format
- Mike's evidence remains bound to Mike
- Mike receives the correct visibility state
- a move is shown only when supported

Expected identity review state:

```text
Mike Nonhof
Needs identity review
VAL found meaningful context for Mike, but two possible contact records may refer to him.
```

Failure conditions:

- Mike is missing despite valid evidence
- duplicate Mike packets appear
- a company is shown as Mike
- Mike inherits another person's evidence
- Mike is matched or drafted for while identity is blocked

### Acceptance Case C: Michele Does Not Inherit Mike's Context

Source evidence:

Michele and Mike may both appear in:

- the same transcript
- the same project
- nearby email context
- the same meeting
- related documents

This does not prove that every claim applies to both.

Expected result:

Michele's packet contains only evidence explicitly bound to Michele.

Mike's packet contains only evidence explicitly bound to Mike.

If a spreadsheet belongs to Mike's context, Michele must not inherit:

- the spreadsheet commitment
- the open loop
- the project need
- the follow-up recommendation
- the next move

Expected UI:

Michele's detail page must not mention Mike's spreadsheet unless the source explicitly shows that Michele is involved.

Mike's detail page may show the spreadsheet when directly supported.

Failure conditions:

- Michele receives Mike's open matter
- Michele receives a spreadsheet follow-up
- Mike appears in Michele's summary without source support
- an introduction is proposed because the names appear near each other
- shared project membership causes evidence inheritance

### Acceptance Case D: Spam Sender

Source evidence:

- repeated inbound marketing messages
- no user reply
- no meeting
- no transcript
- no user teaching
- no relationship-linked CRM context
- no meaningful commitment

Expected result:

```text
admission_status = rejected
executive_visibility = hidden
```

Expected UI:

No Stewardship item.

### Acceptance Case E: Mark Has No Move

Source evidence:

- real admitted relationship
- identity is reliable
- packet is developing or usable
- no current need, commitment, timing trigger, or responsible move is supported

Expected result:

```text
No move right now
```

Mark remains searchable but outside the active Stewardship queue.

Expected person detail:

```text
VAL does not currently have a source-backed reason to contact, connect, or prepare something for Mark.
```

Failure conditions:

- generic reconnect suggestion
- action based only on time elapsed
- introduction based on profession
- invented need
- forced follow-up
- active queue clutter

## First Visible Implementation Slice

After explicit documentation approval, the first UI implementation should:

1. Use backend executive visibility to place people into:
   - hidden
   - Needs Identity Review
   - People To Watch
   - Active Stewardship Queue
2. Replace vague temperature labels with:
   - Needs identity review
   - Packet developing
   - Ready to evaluate
   - Move suggested
   - No move right now
3. Create the first executive list row using:
   - Person
   - Why this person matters
   - What is open
   - VAL's next move
   - Why now
   - Evidence posture
4. Update the relationship detail page to show:
   - who this person is
   - why they matter
   - what they need
   - what they offer
   - what is open
   - recommended move
   - source evidence
5. Remove or hide the broad relationship action pile.
6. Replace visible `Refresh observers` language with:
   - Check for new evidence
   - or Refresh relationship context
7. Make the move review page move-aware rather than introduction-only.
8. Do not redesign unrelated VAL pages.

## Required Tests Before Deployment

- rejected senders do not appear
- hidden admitted relationships do not appear in the active queue
- blocked identities appear only under Needs Identity Review
- developing packets appear under People To Watch only when a specific watch reason exists
- explicit commitments rank above inferred moves
- no-action relationships remain hidden
- every active row shows a named open matter or move
- Terrie/Kareemah appears as a suggested introduction move
- Mike resolves to one packet or identity review
- Michele does not inherit Mike's spreadsheet context
- move review supports non-introduction move types
- no external action occurs without approval
- no observer, packet, confidence-debug, provider, or internal architecture language appears in executive UI

## Implementation Gate

Codex must present:

1. the final executive UI and sorting documentation
2. the current UI elements this replaces
3. the exact files and functions affected
4. the elements that will be removed or hidden
5. the first visible implementation slice
6. the tests that will prove the UI contract works

No visible Stewardship implementation may begin until the user explicitly says:

```text
Approved. Implement this documentation.
```

This spec is ready for a documentation-first review.

The main decision to verify is whether People To Watch should be visible as a normal section by default or collapsed unless it contains a specific, meaningful trigger.
