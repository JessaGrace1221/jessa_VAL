# VAL Stewardship Decision Engine

Status: Product definition only.

Implementation approval required before runtime changes.

This document defines how VAL decides:

1. who belongs in Stewardship
2. how mature each person packet is
3. what thoughtful relationship move, if any, should be considered
4. what the executive should see
5. when VAL must wait instead of pretending it has enough evidence

Stewardship is not a contact directory.

Stewardship is not an activity log.

Stewardship is not a relationship dossier.

Stewardship helps the user care for real relationships by understanding who matters, what is open, what thoughtful move may create value, why the timing matters, and what VAL can prepare for approval.

## Core Decision Sequence

```text
Source evidence arrives
-> resolve the person
-> determine whether a real relationship exists
-> create or update the person packet
-> determine packet maturity
-> identify open relationship needs or commitments
-> consider possible next moves
-> reject unsafe, weak, irrelevant, or premature moves
-> rank the remaining move
-> show the executive conclusion
-> require approval before external action
```

## Operating Rules

No real person, no relationship packet.

No relationship evidence, no Stewardship admission.

No source receipt, no claim.

No clear reason, no next move.

No sufficient evidence, no prepared action.

No user approval, no external action.

## 1. Relationship Admission

VAL must answer:

```text
Is this a real person with evidence of an actual or intentionally developing relationship with the user?
```

A person should not enter Stewardship merely because VAL can find their name, email address, company, website, or public information.

The core rule is:

```text
A person must have evidence of a real relationship or meaningful user intent, not merely evidence that they exist.
```

Reciprocal communication strengthens admission but is not always required. A user-initiated action or explicit user teaching can establish a real relationship before reciprocity exists.

Admission and executive visibility are separate decisions.

Admission answers:

```text
Is this a real relationship VAL should maintain?
```

Visibility answers:

```text
Does this relationship deserve executive attention now?
```

A person may be a real admitted relationship and still not belong in the active Stewardship queue.

### Required Identity Standard

Before a person can become a normal relationship packet, VAL must have:

- a real person identity or a strongly supported alias
- enough information to distinguish the person from a company, generic mailbox, system sender, or another person
- at least one source receipt showing why the person is connected to the user

Identity may be anchored through:

- CRM contact ID
- confirmed email address
- transcript speaker identity
- calendar attendee identity
- user-confirmed name or alias
- known email aliases
- strong cross-source matching

### Admit A Person When

Admit a person into Stewardship when at least one meaningful relationship signal exists:

- the user sent them a direct email
- the user replied to them
- the person replied to the user
- the user had a meaningful meeting with them
- the person participated meaningfully in a transcript
- the user explicitly taught VAL who they are
- the user named them as important
- the user promised them something
- the user promised to connect them with someone
- the person is tied to a real project, commitment, document, task, or opportunity
- the person is connected to a CRM record with meaningful supporting context
- the person was introduced through a known relationship
- multiple credible sources show an intentionally developing relationship

### Do Not Admit A Person When

Do not admit a person into Stewardship when the only evidence is:

- one-way inbound email with no user response or meaningful engagement
- cold outreach
- newsletter
- promotional email
- marketing sequence
- receipt
- invoice
- notification
- system-generated email
- automated calendar notice
- scraped email address
- public directory listing
- generic company mailbox
- `info@`
- `hello@`
- `support@`
- `sales@`
- `notifications@`
- `no-reply@`
- an unresolved transcript name with no reliable identity
- a company name presented as though it were a person

These sources may remain available as evidence, but they must not create a real relationship packet by themselves.

### Blocked Identity State

When meaningful evidence exists but VAL cannot safely resolve the person, create an internal packet with:

```json
{
  "maturity": "blocked_by_identity"
}
```

The person must not be used for introduction matching or prepared communication.

The executive may see:

```text
Review contact identity
```

The executive must not see fabricated identity details.

### Admission Output

```json
{
  "admission_status": "admitted|rejected|blocked_by_identity",
  "person_id": "",
  "reason": "",
  "source_receipts": [],
  "identity_confidence": "high|medium|low",
  "relationship_signals": [],
  "rejection_signals": [],
  "review_required": false
}
```

## 2. Source-To-Person Evidence Binding

Before VAL calculates packet maturity or next moves, every source receipt must be bound to the person or people it actually supports.

Evidence may not be inherited by another person merely because:

- they appear in the same transcript
- they belong to the same project
- their names occur near each other
- one source references both people

This prevents Michele/Mike-style contamination, where one person's commitment or context appears on another person's packet.

### Evidence Binding Output

```json
{
  "source_id": "",
  "source_type": "email|transcript|calendar|crm|document|task|user_teaching",
  "supports_person_ids": [],
  "supports_claims": [],
  "relationship_context": "",
  "resolution_method": "direct_identity|speaker_match|email_match|user_confirmed|inferred",
  "review_required": false
}
```

Evidence with `review_required: true` may support internal review, but it must not create confident claims, mature a packet, or prepare work until resolved.

## 3. Executive Visibility

Visibility determines whether and where an admitted relationship appears to the executive.

It does not decide whether the relationship is real.

It does not decide the person's value.

It is a queueing and attention decision.

### Visibility Output

```json
{
  "visibility": "active_queue|people_to_watch|identity_review|hidden",
  "why_visible_or_hidden": "",
  "attention_reason": "",
  "review_required": false
}
```

Use:

- `active_queue` when a relationship move, explicit commitment, blocking question, or time-sensitive matter deserves executive attention now
- `people_to_watch` when the person is real and worth monitoring, but no move is ready
- `identity_review` when meaningful evidence exists but identity resolution blocks safe use
- `hidden` when the person is admitted but no executive attention is currently needed

`watch` belongs here or in the next-move engine as `wait_watch`. It must not be an admission status.

## 4. Person Packet Maturity

Packet maturity describes how much reliable relationship understanding VAL has.

It does not describe how valuable the person is.

It does not describe relationship importance.

It does not describe popularity, email volume, status, or influence.

Packet maturity determines whether VAL has enough relationship understanding to evaluate moves.

Move readiness determines whether a specific action may be prepared.

A strong packet may still have no responsible move.

A usable packet may have an explicit, source-backed commitment that is ready to draft.

### Blocked By Identity

Use when:

- the source appears meaningful
- the person may matter
- the identity cannot be safely resolved
- aliases may be conflicting
- multiple people may share the same name
- the contact record may be incorrectly merged

Executive behavior:

- do not suggest relationship moves
- do not match them with others
- show only when identity review is useful
- name the identity issue plainly

Example:

```text
VAL found meaningful context for Mike, but two possible contact records exist.
Review the contact match before VAL uses this relationship.
```

### Thin

Use when:

- the person is real
- at least one relationship source exists
- VAL knows how the person entered the user's world
- needs and offers are mostly unknown
- no responsible next move is ready

Executive behavior:

- usually keep out of the primary Stewardship queue
- allow the packet to accumulate meaning
- show only when user review would improve understanding
- do not recommend introductions

### Developing

Use when:

- identity is reliable
- relationship context is understandable
- VAL has partial evidence of a need, offer, commitment, or meaningful direction
- important variables are still missing
- a move may exist, but it is not yet responsible to prepare

Executive behavior:

- may appear under More Context Needed or People To Watch
- show the exact missing fact
- offer correction or review
- do not use vague copy such as "needs more evidence"

### Usable

Use when:

- identity is reliable
- the relationship is real
- current context is source-backed
- at least one credible need, offer, commitment, or open relationship matter exists
- VAL can compare the packet with other people or assess a direct next move
- risks and missing context are manageable

Executive behavior:

- may create reviewable next-move candidates
- may appear in the primary Stewardship queue
- may evaluate moves when the selected move independently passes its own threshold

### Strong

Use when:

- identity risk is low
- multiple reliable sources support current understanding
- relationship intent or context is clear
- the proposed move is timely
- trust and permission are appropriate
- VAL can explain why the move serves the relationship
- no important contradiction remains

Executive behavior:

- VAL may evaluate moves with stronger relationship understanding
- VAL may route prepared work into Leverage only when a specific move passes its own readiness threshold
- VAL may never send or execute without approval

### Maturity Calculation

Maturity should consider:

- identity confidence
- number of meaningful source types
- quality of source receipts
- recency
- user-confirmed context
- clarity of relationship origin
- clarity of current relationship context
- credible needs
- credible offers
- explicit commitments
- unresolved contradictions
- permission and sensitivity risks
- missing variables

Email volume alone must not increase maturity.

Public enrichment alone must not increase a packet beyond thin.

### Packet Maturity Output

```json
{
  "maturity": "blocked_by_identity|thin|developing|usable|strong",
  "why": "",
  "supporting_receipts": [],
  "missing_variables": [],
  "contradictions": [],
  "can_evaluate_moves": false
}
```

## 5. Next Move Decision Engine

For every usable or strong packet, VAL asks:

```text
What is the most thoughtful next relationship move, if any?
```

VAL must not assume that activity is always better than restraint.

Doing nothing may be the correct decision.

### Candidate Moves

VAL may consider:

- introduce
- follow up
- reconnect
- ask a question
- send something
- wait or watch
- do nothing

Future move types may be added, but they must follow the same evidence and approval rules.

### Introduce

Consider an introduction when:

- one person has a source-backed need
- another person has a source-backed offer
- the relationship identities are reliable
- the user is an appropriate connector
- the introduction would create value for both people
- timing is reasonable
- permission and trust are sufficient
- no sensitivity, conflict, or competitive risk blocks the introduction

An explicit user commitment to introduce people takes priority over inferred introduction opportunities.

Do not recommend an introduction only because two people work in similar industries.

### Follow Up

Consider follow-up when:

- the user made a commitment
- the other person asked a direct question
- a decision or deliverable is pending
- the user said they would send, review, introduce, confirm, or return to something
- a recent meaningful exchange lacks a necessary next step
- the follow-up serves the relationship rather than merely clearing a task list

Do not turn unrelated project tasks into relationship follow-ups.

### Reconnect

Consider reconnecting when:

- the relationship previously had meaningful value
- enough time has passed to make contact appropriate
- there is a real reason to reconnect
- recent context creates relevance
- the move is not based only on inactivity

A dormant relationship does not automatically require reconnection. VAL must identify a human reason.

Good:

```text
Reconnect because Terrie's new initiative directly overlaps with work Kareemah recently discussed.
```

Bad:

```text
You have not emailed Terrie in 90 days.
```

### Ask A Question

Consider asking a question when:

- one specific missing fact would unlock a responsible move
- identity needs clarification
- the person's current role is unclear
- permission to introduce is unclear
- a stated need may be outdated
- the user's intention is ambiguous
- two sources contradict one another

Questions should be precise and easy to answer.

Bad:

```text
Tell me more about Mark.
```

Good:

```text
Is Mark still looking for a nonprofit technology partner, or is that no longer current?
```

### Send Something

Consider sending a resource, document, article, proposal, deck, note, or other useful item when:

- the item directly addresses a source-backed need
- the user has the right relationship posture to send it
- the item is specific and useful
- VAL can explain why it fits
- the item is available or can be prepared

Do not suggest generic content merely to create activity.

### Wait Or Watch

Choose wait or watch when:

- the packet is developing
- timing is not yet appropriate
- the need or offer is plausible but unconfirmed
- another event is expected
- the person is in a sensitive transition
- the user has already acted and should not over-contact
- trust or permission is still developing
- VAL knows what evidence should change the decision

Waiting must include a reason or trigger.

Example:

```text
Wait until Kareemah confirms her current nonprofit work before preparing the introduction.
```

### Do Nothing

Choose do nothing when:

- no meaningful relationship move is needed
- evidence is stale
- the relationship is healthy without intervention
- the proposed action would create no real value
- the only reason to act is inactivity
- the relationship is outside the user's current priorities
- permission or trust is insufficient and no useful clarification is available
- the person does not need to be surfaced

Do nothing is a valid executive judgment.

It should usually remove the person from the active Stewardship queue.

### Move Scoring

Each candidate move should be evaluated using:

- explicit user commitment
- relationship relevance
- need strength
- offer strength
- timing
- source quality
- recency
- reciprocal value
- user appropriateness
- permission
- trust
- sensitivity
- risk
- effort required
- likelihood of creating genuine value
- whether VAL can prepare useful work

### Required Rejection Tests

Before selecting a move, VAL must ask:

1. Is the identity reliable?
2. Is the relationship real?
3. Is the evidence current enough?
4. Does this move serve the relationship?
5. Is the user the right person to take this action?
6. Is permission sufficient?
7. Is there a contradiction or sensitivity?
8. Is VAL acting only because activity exists?
9. Would waiting be wiser?
10. Can VAL explain the move in plain language?

If the move cannot pass these tests, it must be rejected or downgraded to wait, ask, or do nothing.

### Next Move Output

```json
{
  "move": "introduce|follow_up|reconnect|ask_question|send_something|wait_watch|do_nothing",
  "plain_summary": "",
  "why_now": "",
  "relationship_value": "",
  "source_receipts": [],
  "missing_context": [],
  "risks": [],
  "confidence": "high|medium|low",
  "prepared_work_allowed": false,
  "approval_required": true,
  "rejected_alternatives": []
}
```

## 6. Executive UI Contract

The primary Stewardship surface should help the executive understand the judgment in under ten seconds.

Every active Stewardship item should show:

- Person
- Why This Person Matters
- What Is Open
- What VAL Thinks The Next Move Is
- Why Now
- Evidence
- Executive Controls

### Person

Show the resolved person's name and essential identifying context.

### Why This Person Matters

Show a short explanation of why this person is in the user's world and why the relationship deserves attention now.

This must be relationship-specific.

It must not be a generic biography.

### What Is Open

Show the important unresolved relationship matter.

Examples:

- a promised introduction
- a pending reply
- a requested resource
- a question requiring clarification
- a possible connection
- a reason to reconnect
- a missing identity fact
- no open move yet

Do not display unrelated task counts or project lists.

### What VAL Thinks The Next Move Is

Show one primary move.

Examples:

- Introduce Terrie and Kareemah
- Follow up with Mike about the Friday commitment
- Ask whether Mark still needs this support
- Send Michele the revised document
- Wait until Kareemah's role is confirmed
- No move is needed right now

VAL should not show several equal recommendations and force the executive to perform the reasoning.

### Why Now

Explain the timing trigger.

Examples:

- the user made a direct promise
- a recent reply created an opening
- a project milestone makes the introduction timely
- the relationship has new relevance
- one specific missing fact is blocking action

### Evidence

Show a short source posture such as:

- From your transcript on July 8
- Supported by two sent emails and a CRM note
- Based on your meeting and Kareemah's current role
- Needs source review before VAL can draft

Allow deeper source review when requested.

Do not expose internal packet names, model reasoning, confidence debugging, observer labels, or provider names.

### Executive Controls

Each item should offer only relevant controls:

- Approve
- Review draft
- Correct VAL
- Add context
- Wait
- Mark completed
- Not appropriate
- Do nothing

Buttons must have real behavior.

Do not show buttons for actions VAL cannot perform.

### Primary UI Order

Sort active items by:

1. explicit user commitments ready for approval
2. explicit user commitments blocked by one clear missing fact
3. high-value moves ready for review
4. time-sensitive relationship moves
5. questions that unlock a meaningful move
6. people worth watching
7. no-action items should normally remain hidden

Do not sort alphabetically.

Do not rank by email volume.

Do not rank by number of open loops.

### Person Detail View

The person detail view may show:

- who they are
- why they matter
- what they need
- what they offer
- what is open
- the recommended next move
- connections involving them
- source-backed relationship context
- major relationship chapters when useful

It must not become an activity dump or internal dossier.

## 7. Acceptance Examples

### Example A: Terrie Should Meet Kareemah

Evidence:

```text
I will introduce Terrie to Kareemah.
```

Expected decision:

- admit Terrie
- admit Kareemah
- update both person packets
- create an explicit introduction commitment
- rank it above inferred opportunities
- assess whether enough context exists to prepare the introduction
- prepare the draft when responsible
- route it to Leverage
- require approval before sending

Expected UI:

```text
Terrie and Kareemah
Why this matters:
You told Terrie you would introduce her to Kareemah. Their current work appears connected through [source-backed reason].
What is open:
The introduction has not been completed.
VAL's next move:
Review the prepared introduction.
Why now:
This is a direct commitment from your transcript.
Evidence:
Transcript from [date], supported by [sources].
Actions:
Review draft
Correct VAL
Wait
Mark completed
```

Incorrect results:

- transcript summary only
- generic task only
- open-loop count
- temperature change
- isolated notes on separate profiles
- vague follow-up suggestion

### Example B: Mike Nonhof Appears As A Real Missing Person

Expected decision:

- resolve Mike's real identity
- merge or link confirmed aliases
- admit Mike as a real relationship
- preserve each source receipt
- create or update one durable person packet
- do not create duplicate Mike packets
- determine maturity based on actual relationship evidence
- identify a move only when supported

Incorrect results:

- missing Mike entirely despite strong evidence
- duplicate Mike records
- company-only identity
- unrelated evidence from another person
- inferred action without sufficient context

### Example C: Spam Inbound Sender Is Rejected

Evidence:

- a sender emails the user repeatedly
- the user never replied
- the sender is running a sales or marketing sequence
- no CRM relationship, meeting, transcript, user teaching, project link, or meaningful commitment exists

Expected decision:

```text
admission_status = rejected
```

Expected UI:

```text
No Stewardship item.
```

Incorrect results:

- visible relationship packet
- importance based on email volume
- reconnect recommendation
- follow-up recommendation
- possible introduction suggestion

### Example D: Michele Is Not Incorrectly Tied To Mike

Expected decision:

- maintain separate person packets
- attach evidence only to the correct person
- require direct source linkage before assigning an open matter
- reject cross-person contamination
- do not infer a relationship between Michele and Mike unless supported

Incorrect results:

- Michele inherits Mike's commitment
- Mike appears in Michele's relationship summary without a source
- an introduction is proposed solely because both names appeared near one another
- a project task is assigned to the wrong person

### Example E: Mark Has No Move Ready

Evidence:

- Mark is a real admitted relationship
- the packet has identity and some relationship context
- current needs, offers, timing, or permission are unclear
- no direct commitment is open
- no source-backed next action is strong enough

Expected decision:

```json
{
  "maturity": "developing",
  "move": "wait_watch|do_nothing"
}
```

Expected UI:

```text
No move is ready. VAL does not yet have a current, source-backed reason to contact or connect Mark.
```

Incorrect results:

- forced follow-up
- generic reconnect prompt
- introduction based on profession alone
- activity based only on elapsed time
- invented need
- generic "packet needs more evidence"

## Implementation Gate

Before writing more Stewardship code, Codex must present:

1. the final decision-engine documentation
2. the existing behaviors this replaces
3. the UI, service, prompt, data-field, and test conflicts found
4. what must be removed
5. what will remain valid
6. the exact first implementation slice
7. the tests that will prove the decision engine works

Codex must remain in documentation mode until the user explicitly says:

```text
Approved. Implement this documentation.
```
