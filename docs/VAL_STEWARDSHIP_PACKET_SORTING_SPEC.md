# VAL Stewardship Packet Sorting Spec

Updated: 2026-07-11

Purpose: define how VAL should create powerful relationship packets and sort them into an executive-useful Stewardship surface.

This spec tightens [VAL_STEWARDSHIP_ROUND_TABLE_AND_PACKETS.md](./VAL_STEWARDSHIP_ROUND_TABLE_AND_PACKETS.md). The older document defines the philosophy and Round Table architecture. This document defines the practical product contract for packet creation, relationship admission, packet maturity, sorting, and executive display.

## Executive Promise

Stewardship should answer one executive question:

```text
Who needs to meet whom, and why should I care now?
```

The user should not have to inspect raw email artifacts, debug labels, model reasoning, packet internals, provider names, or generic CRM fields to understand why a person is on the list.

VAL's job is:

1. Build a source-backed packet for each real relationship.
2. Keep that packet alive as new evidence arrives.
3. Compare packets against one another.
4. Sort the relationships and introduction opportunities by usefulness.
5. Show only the executive-ready conclusion, source posture, and review path.

## Core Distinction

There are three different things:

| Layer | What It Is | What It Must Not Pretend To Be |
|---|---|---|
| Contact evidence | Raw source traces from email, transcripts, calendar, CRM, documents, tasks, projects, and user corrections. | A relationship by itself. |
| Person packet | A living source-backed understanding of a real person: who they are, what they need, what they offer. | A final introduction recommendation. |
| Stewardship match | A comparison between packets that says who may need whom, why, and whether an introduction draft is warranted. | A sent message or automatic action. |

The packet is the foundation. The match is a decision made from multiple packets.

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

Thin packets are not introduction-ready.

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
| `thin` | VAL has identity or source evidence, but not enough meaning. | Show only if user asks for all people or review gaps. Do not recommend introductions. |
| `developing` | VAL knows who the person is and has some needs/offers, but evidence is partial. | Can appear in Stewardship with careful language. Usually watch, ask, or review source. |
| `usable` | VAL has enough source-backed needs/offers and relationship context to compare against other packets. | Can create introduction candidates for review. |
| `strong` | VAL has recent, source-backed reciprocal value and low identity risk. | Can draft an introduction for user approval. |

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

The executive list should not sort alphabetically by default.

It should sort by usefulness.

### Primary Sort Lanes

| Lane | Meaning | Example Executive Copy |
|---|---|---|
| Ready To Review | Strong enough match exists; user should review why these people belong in the same conversation. | `Review introduction: Terry may need Kareemah's adaptive nonprofit experience.` |
| Needs Source Review | VAL sees a possible match, but source evidence is not human-readable enough yet. | `Possible introduction, but review transcript/source first.` |
| Waiting On Loop | Relationship has open loops or follow-up obligations. | `Waiting: 3 open loops need source review.` |
| Needs Identity Cleanup | Person is likely real but CRM/contact identity is unresolved. | `Link the real person before matching.` |
| Developing Relationship | Packet is real but not introduction-ready. | `Watch quietly until needs/offers are clearer.` |
| Dormant / Low Signal | Real person, low recent value signal. | `No current stewardship action.` |

### Sort Score

Sort score should combine:

- identity confidence
- packet maturity
- recency
- explicit user instruction
- number and quality of source receipts
- match strength between needs and offers
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
- there is a source-backed need/offer match
- the user explicitly cares about them
- VAL can prepare a useful review item

## Introduction Match Packet

When VAL compares packets, it may create an introduction match packet:

```json
{
  "packet_type": "stewardship_match_packet",
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
  "why_this_may_matter": "",
  "direction": "a_needs_b|b_needs_a|reciprocal",
  "confidence": "high|medium|low",
  "review_posture": "draft_ready|review_source_first|watch|do_not_intro",
  "risks": [],
  "missing_variables": [],
  "no_external_action": true
}
```

The match packet can prepare a draft introduction only when:

- both people are real identities
- source evidence is readable
- there is an actual need/offer connection
- the introduction would serve both people
- the user is the right person to make the introduction
- no sensitivity or permission issue blocks the match

## Executive UI Contract

The executive should see:

1. Person name.
2. Plain relationship state.
3. Why they are on the list.
4. Best next review/action.
5. Source posture.
6. Review introductions button when there is something to review.
7. Refresh observers when the packet needs more evidence.

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

When the user clicks `Review introductions`, the page should answer:

1. Is an introduction ready?
2. Who is involved?
3. Which direction is the value flowing?
4. What source proves the need?
5. What source proves the offer?
6. What risk or missing context remains?
7. What would VAL draft if approved?

The page should reuse the same information as the first Stewardship page. It must not become a disconnected generic review surface.

If no introduction is ready, say plainly:

```text
No introduction is ready yet.
```

Then explain the specific missing variable:

- no real identity
- no source-backed need
- no source-backed offer
- source is too thin
- possible match is stale
- permission/trust is unclear

## Quality Bar

A Stewardship result is useful only if the executive can answer, in under 10 seconds:

1. Who is this?
2. Why is VAL showing them?
3. What might they need?
4. What might they offer?
5. Who might they need to meet?
6. Why would that introduction matter?
7. What should I review before VAL drafts anything?

If the answer is unclear, VAL should not show the item as action-ready.

## Current Known Gaps

As of 2026-07-11:

- Packet creation exists but needs stronger need/offer extraction from transcripts.
- Relationship admission is improving but must continue rejecting passive inbound-only spam/newsletter/system contacts.
- Confirmed aliases need to become durable user-editable identity mappings, not only code constants.
- Mike Nonhof now appears as a real admitted relationship and dedupes across known email aliases.
- Kareemah's packet can receive transcript-backed intro evidence through adaptive/para-climbing context, but the future target is stronger exact-name/entity resolution.
- The introduction review page must continue moving toward the same source-backed information as the first Stewardship page.
- Sorting needs explicit lane labels and score reasoning stored internally, with only plain executive copy shown.

## Implementation Next Steps

1. Create a durable packet builder for each admitted relationship.
2. Add exact and fuzzy identity resolution across email aliases, CRM contacts, transcript speaker names, and user corrections.
3. Add source-backed need/offer extraction for transcripts, sent email, CC'd email, calendar, projects, documents, tasks, and CRM notes.
4. Store packet maturity and missing variables.
5. Create match packets by comparing needs/offers across people.
6. Sort Stewardship by lane and usefulness, not alphabetically or volume.
7. Make `Review introductions` show match packets with the same source evidence as the person drawer.
8. Route draft-ready introductions into Leverage for user approval.
9. Keep all external actions behind explicit user approval.

## Non-Negotiables

- No source, no claim.
- No identity, no introduction.
- No reciprocal value, no draft.
- No user approval, no external action.
- No passive inbound-only email address in Stewardship as a relationship.
- No debug language in the executive surface.
- No generic "AI prepared something" copy when the specific value can be named.

