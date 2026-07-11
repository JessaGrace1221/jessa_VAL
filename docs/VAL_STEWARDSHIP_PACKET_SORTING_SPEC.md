# VAL Stewardship Packet Sorting Spec

Updated: 2026-07-11

Purpose: define how VAL should create powerful relationship packets, use them to prepare thoughtful stewardship moves, and sort those moves into an executive-useful Stewardship surface.

This spec tightens [VAL_STEWARDSHIP_ROUND_TABLE_AND_PACKETS.md](./VAL_STEWARDSHIP_ROUND_TABLE_AND_PACKETS.md). The older document defines the philosophy and Round Table architecture. This document defines the practical product contract for packet creation, relationship admission, packet maturity, sorting, and executive display.

## Executive Promise

Stewardship should answer one executive question:

```text
What is the most thoughtful next move for this relationship?
```

Sometimes the answer is an introduction. Sometimes it is a follow-up, a reconnection, a congratulations, a resource, a question, a check-in, a reminder, a declined introduction, or waiting.

The user should not have to inspect raw email artifacts, debug labels, model reasoning, packet internals, provider names, or generic CRM fields to understand why a person is on the list.

VAL's job is:

1. Build a source-backed packet for each real relationship.
2. Keep that packet alive as new evidence arrives.
3. Compare packets against one another.
4. Create explicit stewardship commitments and stewardship opportunities.
5. Sort promised moves, reviewable opportunities, and missing-context blockers by usefulness.
6. Show only the executive-ready conclusion, source posture, and review path.

## Stewardship Object Hierarchy

Stewardship must not become a better contact profile.

The hierarchy is:

```text
Stewardship = Relationship Stewardship System.
Primary product outcome = the most thoughtful next relationship move.
Primary knowledge object = person packet.
Primary action object = stewardship commitment or stewardship opportunity.
Primary UI = promised stewardship moves, reviewable opportunities, and specific missing-context blockers.
```

Person packets exist so VAL can prepare better relationship judgment and more thoughtful actions. The drawer does not exist to display packets.

## Core Distinction

There are three different things:

| Layer | What It Is | What It Must Not Pretend To Be |
|---|---|---|
| Contact evidence | Raw source traces from email, transcripts, calendar, CRM, documents, tasks, projects, and user corrections. | A relationship by itself. |
| Person packet | A living source-backed understanding of a real person: who they are, what they need, what they offer. | A final stewardship recommendation. |
| Stewardship move | A comparison between packet knowledge, commitments, timing, and context that says what the thoughtful next relationship move is. | A sent message or automatic action. |

The packet is the foundation. The stewardship move is a decision made from packets plus context.

## Stewardship Records

Stewardship needs a dedicated action layer in addition to person packets.

### Stewardship Commitment

Create this when the user explicitly promises, requests, or approves a relationship move.

```json
{
  "record_type": "stewardship_commitment",
  "stewardship_type": "introduction|follow_up|resource|referral|meeting|reminder|check_in|congratulation|question|decline_intro|wait|other",
  "person_a_id": "",
  "person_b_id": "",
  "stated_direction": "a_to_b|b_to_a|mutual|unknown",
  "user_statement": "",
  "reason_stated": "",
  "source_receipts": [],
  "promised_at": "",
  "status": "needs_context|draft_ready|ready_for_review|completed|declined|stale",
  "missing_context": [],
  "prepared_artifact_id": "",
  "external_action_requires_approval": true
}
```

An explicit stewardship commitment has priority over an inferred opportunity.

### Stewardship Opportunity

Create this when VAL discovers a possible relationship move that the user did not explicitly state.

```json
{
  "record_type": "stewardship_opportunity",
  "stewardship_type": "introduction|follow_up|resource|referral|meeting|reminder|check_in|congratulation|question|decline_intro|wait|other",
  "primary_person_id": "",
  "related_person_id": "",
  "need": "",
  "offer": "",
  "recommended_move": "",
  "why_the_move_matters": "",
  "timing_reason": "",
  "need_source_receipts": [],
  "offer_source_receipts": [],
  "relationship_permission_receipts": [],
  "confidence": "low|medium|high",
  "status": "watch|needs_source_review|ready_for_review|draft_ready|do_not_act",
  "risks": [],
  "missing_context": [],
  "external_action_requires_approval": true
}
```

Do not use the same status or data model for an explicit promise and an inferred opportunity.

### Stewardship Move Types

Introductions are one strong stewardship move, not the whole product.

Supported stewardship move types include:

- introduction
- follow-up
- reconnection
- congratulations
- resource/article/deck/proposal
- referral
- meeting
- reminder
- check-in
- clarifying question
- decline or delay an introduction
- wait/watch quietly
- other

## Relationship Admission

VAL must not treat every email address as a relationship.

### Admit A Relationship When

Admit a person into Stewardship when at least one of these is true:

- The user sent an email to them.
- The user replied to them.
- The user was in a direct meeting with them.
- They were a meaningful transcript participant.
- The user explicitly named them as important.
- They are linked to a CRM contact identity.
- They were introduced by a known relationship.
- They appear in a project, document, task, or commitment with enough source context to explain why they matter.
- They are a known alias confirmed by the user or by high-confidence source evidence.

### Do Not Admit As A Relationship When

Do not admit a person into Stewardship when the only evidence is:

- a one-way inbound email the user never answered
- newsletter, spam, receipt, invoice, notification, or system email
- a generic mailbox such as `info@`, `support@`, `hello@`, `no-reply@`, `notifications@`
- a calendar invite with no meaningful interaction
- an email address scraped from a tool
- a raw handle that cannot be tied to a real person

These may remain source evidence, but they should not appear as relationships.

### Thin Packet Exception

If VAL sees a potentially important but underdeveloped person, it may create a thin packet, but the visible executive label must be honest:

```text
Needs identity review
```

or

```text
Watch quietly until stronger evidence appears
```

Thin packets are not external-move-ready.

## Person Packet Contract

Every real relationship packet should strive to answer:

1. Who is this person?
2. What does this person need?
3. What does this person offer?
4. Why does this relationship matter to the user?
5. What evidence supports those claims?
6. What is unknown or still risky?

### Minimum Useful Packet

A packet is minimally useful when it has:

- real person identity or confirmed alias
- at least one source receipt
- relationship origin
- current context
- one credible need or offer
- maturity state
- next evidence to watch or next useful review step

### Packet Maturity

| Maturity | Meaning | Executive Behavior |
|---|---|---|
| `thin` | VAL has identity or source evidence, but not enough meaning. | Show only if user asks for all people or review gaps. Do not recommend external moves. |
| `developing` | VAL knows who the person is and has some needs/offers, but evidence is partial. | Can appear in Stewardship with careful language. Usually watch, ask, or review source. |
| `usable` | VAL has enough source-backed needs/offers and relationship context to prepare a responsible next move. | Can create stewardship opportunities for review. |
| `strong` | VAL has recent, source-backed context and low identity risk. | Can draft a stewardship move for user approval. |

## Packet Fields

The packet should store this shape behind the scenes:

```json
{
  "packet_type": "person_packet",
  "identity": {
    "name": "",
    "emails": [],
    "crm_contact_id": "",
    "known_aliases": [],
    "identity_status": "linked|known_alias|needs_review|duplicate|unknown"
  },
  "relationship_origin": {
    "first_seen_at": "",
    "first_meaningful_signal": "",
    "introduced_by": "",
    "source_receipts": []
  },
  "who_this_person_is": {
    "plain_summary": "",
    "role_or_context": "",
    "relationship_to_user": "",
    "confidence": "high|medium|low",
    "source_receipts": []
  },
  "what_this_person_needs": [
    {
      "need": "",
      "why_it_matters": "",
      "timing": "now|soon|someday|unknown",
      "confidence": "high|medium|low",
      "source_receipts": []
    }
  ],
  "what_this_person_offers": [
    {
      "offer": "",
      "why_it_matters": "",
      "confidence": "high|medium|low",
      "source_receipts": []
    }
  ],
  "relationship_state": {
    "temperature": "needs_attention|waiting|strategic|warm|new|unknown",
    "plain_meaning": "",
    "open_loops": [],
    "risks": [],
    "opportunities": [],
    "last_meaningful_signal_at": ""
  },
  "stewardship_readiness": {
    "maturity": "thin|developing|usable|strong",
    "can_match": false,
    "can_draft_intro": false,
    "missing_variables": [],
    "review_reason": ""
  },
  "evidence": {
    "email": [],
    "sent_email": [],
    "cc": [],
    "transcripts": [],
    "calendar": [],
    "projects": [],
    "documents": [],
    "tasks": [],
    "crm": [],
    "user_confirmed": []
  }
}
```

## Evidence Intake

### Onboarding Scan

During onboarding, after Gmail or Outlook permission is granted, VAL should scan roughly 90 days of:

- inbox
- sent mail
- CC'd conversations
- calendar meetings
- available transcripts
- CRM contacts and opportunities
- projects, tasks, documents, and user memory

The output is not an inbox. The output is a packet foundation.

### Ongoing Intake

After onboarding, VAL should update packets continuously when new evidence arrives:

- new sent email
- reply from user
- new meeting attendee
- transcript mention
- introduction thread
- project link
- task or commitment
- document mention
- user teaching/correction
- CRM identity cleanup

Important user expectation:

```text
New relationships must be treated as seriously as old relationships.
```

The system should not only understand the people found during initial onboarding.

## Needs And Offers Extraction

VAL should extract needs and offers differently.

### Need Signals

A person may need:

- an introduction
- funding
- a partner
- a decision maker
- operational help
- technical help
- emotional support
- credibility
- visibility
- a document, deck, or proposal
- a follow-up
- a resource
- a mentor
- a customer/client
- a collaborator
- a next step

Need language may be explicit:

```text
I need...
Could you introduce me to...
Do you know anyone who...
I am looking for...
We are stuck on...
```

Need language may also be implicit:

```text
They are building X but lack Y.
They are trying to reach Z.
They are blocked by A.
They keep asking about B.
```

### Offer Signals

A person may offer:

- expertise
- lived experience
- credibility
- funding access
- network access
- audience
- distribution
- technical capability
- operational capability
- emotional steadiness
- strategic insight
- hiring/recruiting reach
- nonprofit knowledge
- real estate knowledge
- decision-maker access
- introductions
- social proof

Offer language may be explicit:

```text
I can help with...
I know someone...
I have experience in...
I can introduce...
```

Offer language may be inferred only when there is source support.

## Stewardship Sorting

The executive list should be stewardship-move-first. It should not sort alphabetically by default.

It should sort by usefulness.

### Primary Stewardship Sections

The primary Stewardship surface should be organized around relationship-care outcomes:

1. Stewardship You Promised
2. Stewardship Moves Worth Reviewing
3. More Context Needed
4. People To Watch

Every visible primary-surface item must lead toward one of four outcomes:

1. Complete a promised relationship move.
2. Review a valuable possible relationship move.
3. Learn the missing context needed to act responsibly.
4. Do nothing yet.

If an item does not support one of these outcomes, it does not belong on the primary Stewardship surface.

### Primary Sort Lanes

| Lane | Meaning | Example Executive Copy |
|---|---|---|
| Promised Move Ready | The user promised something and VAL has enough context for review. | `Review introduction: You said you would connect Terrie and Kareemah.` |
| Opportunity Ready | Strong enough stewardship move exists; user should review why it matters. | `Review follow-up: send the proposal after yesterday's call.` |
| Needs Source Review | VAL sees a possible move, but source evidence is not human-readable enough yet. | `Possible check-in, but review the transcript first.` |
| Waiting On Commitment | Relationship has a promised follow-up or obligation. | `Waiting: proposal follow-up needs source review.` |
| Needs Identity Cleanup | Person is likely real but CRM/contact identity is unresolved. | `Link the real person before matching.` |
| Developing Relationship | Packet is real but not stewardship-ready. | `Watch quietly until needs/offers are clearer.` |
| Dormant / Low Signal | Real person, low recent value signal. | `No current stewardship action.` |

### Sort Score

Sort score should combine:

- identity confidence
- packet maturity
- recency
- explicit user instruction
- number and quality of source receipts
- strength of the recommended move
- reciprocal value
- current project relevance
- open loop urgency
- relationship risk
- user-defined importance/VIP status

Do not let high email volume alone create importance.

### Anti-Sort Rule

Never rank a person highly only because they emailed often.

Rank them highly because:

- the user engaged with them
- there is a real open loop
- they are tied to meaningful work
- there is a source-backed stewardship move
- the user explicitly cares about them
- VAL can prepare a useful review item

## Stewardship Move Packet

When VAL compares packets and context, it may create a stewardship move packet:

```json
{
  "packet_type": "stewardship_move_packet",
  "stewardship_type": "introduction|follow_up|resource|referral|meeting|reminder|check_in|congratulation|question|decline_intro|wait|other",
  "candidate_a": {
    "name": "",
    "need": "",
    "source_receipts": []
  },
  "candidate_b": {
    "name": "",
    "offer": "",
    "source_receipts": []
  },
  "recommended_move": "",
  "why_this_may_matter": "",
  "direction": "a_needs_b|b_needs_a|reciprocal",
  "confidence": "high|medium|low",
  "review_posture": "draft_ready|review_source_first|watch|do_not_act",
  "risks": [],
  "missing_variables": [],
  "no_external_action": true
}
```

The move packet can prepare a draft or review artifact only when:

- required people are real identities
- source evidence is readable
- there is an actual reason the move would help
- the move would serve the relationship rather than create noise
- the user is the right person to make the move
- no sensitivity or permission issue blocks the move

## Executive UI Contract

The executive should see:

1. Promised stewardship moves first.
2. Reviewable stewardship opportunities second.
3. Missing-context blockers third.
4. People worth watching only when they may become useful relationship nodes.
5. Plain explanation of why the move matters.
6. Specific missing fact when action is blocked.
7. Review the move when there is something real to review.
8. Refresh/review sources only when the packet needs more evidence.

The executive should not see:

- `packet`
- `Round Table`
- `observer`
- `workflow_scoped_packet`
- `undefined`
- provider names
- raw model confidence internals
- stale generic copy
- unrelated open loops from another person
- draft buttons that do not create useful drafts
- introduction suggestions without evidence
- relationship-profile, dossier, temperature, open-loop, or history surfaces as the center of the drawer

### Temperature Copy

Temperature must explain itself.

Bad:

```text
Michele Julian
Relationship
Waiting
Review projection spreadsheet with Mike
```

Good:

```text
Michele Julian
Waiting: 36 open loops need source review.
Latest source: Use Grace AI calendar exclusively instead of Calendly.
```

If the list shows `Waiting`, it must answer:

```text
Waiting for what?
```

## Executive Review Page

When the user opens a stewardship review item, the page should answer:

1. Is a relationship move ready?
2. Who is involved?
3. What kind of move is this?
4. What source proves the need or reason?
5. What source proves the offer, context, or timing?
6. What risk or missing context remains?
7. What would VAL draft, prepare, or mark if approved?

The page should reuse the same information as the first Stewardship page. It must not become a disconnected generic review surface.

If no move is ready, say plainly:

```text
No stewardship move is ready yet.
```

Then explain the specific missing variable:

- no real identity
- no source-backed need
- no source-backed offer
- source is too thin
- possible match is stale
- permission/trust is unclear

## Required Documentation Change Summary For Next Implementation

Before implementing the next Stewardship change, the documentation and implementation plan must show:

1. What product behavior is being introduced: stewardship commitments and stewardship opportunities become first-class Stewardship objects.
2. What existing behavior it replaces: primary Stewardship surfaces centered on relationship profiles, temperature, open loops, generic history, or packet maturity.
3. What remains valid: person packets, source receipts, identity admission gates, need/offer extraction, Leverage approval, and no external action without approval.
4. What is now deprecated: relationship-profile-first Stewardship, open-loop-count-driven ranking, generic "packet needs evidence" copy, and review pages disconnected from the person/context evidence.
5. Which existing UI, prompts, data fields, services, and tests conflict with the new definition.
6. What must be removed or prevented from rendering.
7. What is outside the next implementation scope.

Codex must not preserve contradictory legacy behavior merely because it already exists.

## Stewardship Reference Acceptance Case

This is the mandatory reference test for Stewardship.

### Source Evidence Received

Transcript source contains a direct user commitment:

```text
I will introduce Terrie to Kareemah.
```

or a semantically equivalent statement:

```text
I want to connect you with Kareemah.
I should introduce Terrie and Kareemah.
Terrie needs to meet Kareemah.
```

### Expected Identity Resolution

VAL must resolve:

- Terrie as a real person packet or create a thin packet requiring identity review.
- Kareemah as a real person packet or create a thin packet requiring identity review.

If either identity cannot be resolved, the commitment still exists, but its status is `needs_context`.

### Expected Person Packet Changes

Terrie packet receives:

- source receipt for the transcript promise
- possible need related to the stated reason
- relationship context from inbox, sent mail, CC'd mail, CRM, calendar, transcripts, documents, projects, tasks, and approved enrichment when available

Kareemah packet receives:

- source receipt for the transcript promise
- possible offer related to the stated reason
- relationship context from inbox, sent mail, CC'd mail, CRM, calendar, transcripts, documents, projects, tasks, and approved enrichment when available

Scraped/enriched public data may explain who Kareemah is or what she plausibly offers, but it must not prove the user relationship, current need, permission, or promised introduction.

### Expected Stewardship Record

VAL creates or updates:

```json
{
  "record_type": "stewardship_commitment",
  "stewardship_type": "introduction",
  "person_a_id": "terrie",
  "person_b_id": "kareemah",
  "stated_direction": "unknown",
  "user_statement": "I will introduce Terrie to Kareemah.",
  "reason_stated": "",
  "source_receipts": [
    {
      "source_type": "transcript",
      "source_id": "",
      "summary": "User stated they would introduce Terrie to Kareemah."
    }
  ],
  "status": "needs_context|draft_ready|ready_for_review",
  "missing_context": [],
  "external_action_requires_approval": true
}
```

### Expected Reasoning Output

VAL must answer:

- What did the user promise?
- Who are the two people?
- What does Terrie need?
- What does Kareemah offer?
- Why might this relationship move matter now?
- What source proves each claim?
- What remains unknown?
- Is it responsible to draft now, or should VAL ask/review one missing fact first?

### Exact Executive-Facing Result

The Stewardship primary surface should show a promised stewardship move near the top:

```text
Stewardship You Promised

Introduce Terrie and Kareemah

You said you would introduce Terrie to Kareemah.
VAL found the promise in your transcript and is checking both person packets for why this relationship move matters.

Next step: Review introduction context.
```

If enough context exists:

```text
Next step: Review prepared introduction.
```

If context is missing, name the missing fact:

```text
Missing context: VAL needs Kareemah's current role/source-backed offer before drafting.
```

### Action Available To The User

Allowed actions:

- Review introduction
- Add missing context
- Mark completed
- Not appropriate anymore
- Watch quietly

### Approval Gate

VAL may prepare a draft when the context is sufficient.

VAL must place the draft in Leverage for user review.

VAL must not send an email, message, calendar invite, CRM write, or external action without explicit user approval.

### Expected Leverage Draft

Leverage should show:

```text
Prepared introduction: Terrie <> Kareemah

Why VAL prepared it:
You said you wanted to introduce them, and the source-backed packets indicate a plausible need/offer fit.

Status:
Ready for review. Nothing has been sent.
```

### Incorrect Outputs That Must Not Appear

The result is incorrect if the promise appears only as:

- a transcript summary
- a generic task
- an open loop
- a relationship-history event
- an isolated note on Terrie's profile
- an isolated note on Kareemah's profile
- a temperature change
- a vague follow-up recommendation
- a generic "packet needs evidence" message
- a debug/observer/provider/prompt label

## Quality Bar

A Stewardship result is useful only if the executive can answer, in under 10 seconds:

1. Who is this?
2. Why is VAL showing them?
3. What might they need?
4. What might they offer?
5. What thoughtful move might be useful?
6. Why would that move matter?
7. What should I review before VAL drafts or marks anything?

If the answer is unclear, VAL should not show the item as action-ready.

## Current Known Gaps

As of 2026-07-11:

- Packet creation exists but needs stronger need/offer extraction from transcripts.
- Relationship admission is improving but must continue rejecting passive inbound-only spam/newsletter/system contacts.
- Confirmed aliases need to become durable user-editable identity mappings, not only code constants.
- Mike Nonhof now appears as a real admitted relationship and dedupes across known email aliases.
- Kareemah's packet can receive transcript-backed intro evidence through adaptive/para-climbing context, but the future target is stronger exact-name/entity resolution.
- The review page must continue moving toward the same source-backed information as the first Stewardship page.
- Sorting needs explicit lane labels and score reasoning stored internally, with only plain executive copy shown.
- The architecture must broaden beyond introductions into follow-ups, resources, congratulations, check-ins, questions, referrals, reminders, and waiting.

## Implementation Next Steps

1. Create a durable packet builder for each admitted relationship.
2. Add exact and fuzzy identity resolution across email aliases, CRM contacts, transcript speaker names, and user corrections.
3. Add source-backed need/offer extraction for transcripts, sent email, CC'd email, calendar, projects, documents, tasks, and CRM notes.
4. Store packet maturity and missing variables.
5. Create stewardship commitment and stewardship opportunity records from explicit promises and inferred next moves.
6. Create move packets by comparing needs/offers, commitments, timing, permission, and relationship context.
7. Sort Stewardship by lane and usefulness, not alphabetically or volume.
8. Make review surfaces show stewardship move packets with the same source evidence as the person drawer.
9. Route draft-ready moves into Leverage for user approval.
10. Keep all external actions behind explicit user approval.

## Non-Negotiables

- No source, no claim.
- No identity, no external relationship move.
- No source-backed reason, no draft.
- No user approval, no external action.
- No passive inbound-only email address in Stewardship as a relationship.
- No debug language in the executive surface.
- No generic "AI prepared something" copy when the specific value can be named.
