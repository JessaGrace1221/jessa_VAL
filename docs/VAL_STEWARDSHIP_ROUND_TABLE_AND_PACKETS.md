# VAL Stewardship Round Table and Packets

Purpose: define the renamed Stewardship drawer and protect it from becoming an internal dossier, project-management surface, or packet/debug display.

The Stewardship drawer replaces the user-facing name "Relationships." Internal code may continue to use `relationship_packet` until a larger migration is safe, but the executive-facing product language is Stewardship.

This document applies the constitutional reasoning architecture in [VAL_EXECUTIVE_REASONING_ARCHITECTURE.md](./VAL_EXECUTIVE_REASONING_ARCHITECTURE.md) to Stewardship.

For the practical packet admission, maturity, sorting, and executive display contract, read [VAL_STEWARDSHIP_PACKET_SORTING_SPEC.md](./VAL_STEWARDSHIP_PACKET_SORTING_SPEC.md).

## Core Thesis

VAL users are relationship builders.

Your network is one of your greatest assets. Stewardship is how you care for it.

Rather than simply storing contacts, VAL continuously looks for ways to create value, strengthen relationships, prepare meaningful follow-ups, and connect people who can genuinely help one another.

Stewardship exists because our network grows our net worth. The drawer should help the user care for a relationship well: what is happening, what matters now, how the user can create value, where meaningful connection is possible, and what VAL has already prepared to help.

Stewardship is not a project drawer. It should not show project-management language unless it directly helps the user care for a relationship.

The user's mental model should not be "Tell me about Mark." It should be "Help me care for this relationship well."

## Operating Rule

```text
Round Table decides.
Packet stores.
Custom fields persist.
Drawer displays.
User approves action.
```

No packet, no claim.
No source receipt, no certainty.
No custom field, no UI section.
No approval gate, no external action.

## Source Flow

```text
Source evidence
  -> Witness
  -> Executive relevance
  -> Person packet intake / update
  -> Stewardship Round Table
  -> Stewardship match packet
  -> Stewardship custom fields
  -> Stewardship drawer
  -> Prepared introduction / follow-up packet
  -> Leverage card
  -> User approval
```

## Person Packets First

Stewardship starts with packets, packets, packets.

Every real relationship should have a living person packet. The packet is not a CRM profile and it is not the final Stewardship recommendation. It is the durable, source-backed understanding VAL uses later when deciding who should meet whom.

A person packet answers three primary questions:

1. Who is this person?
2. What does this person need?
3. What does this person offer?

It should not permanently decide "who needs this person" or "who this person needs." Those are Stewardship matching decisions made later by comparing many person packets against each other, current projects, transcripts, email context, calendar context, documents, and CRM context.

### Onboarding Packet Creation

During VAL onboarding, when the user connects Gmail or Outlook, VAL should review roughly 90 days of inbox, sent, and CC'd email as relationship evidence.

That scan should:

- identify important people already in the user's world
- create initial person packets for real relationships
- preserve why each person was noticed
- mark thin packets as incomplete instead of discarding them
- distinguish active Executive Inbox material from broader VAL context

Read/replied-to emails do not belong in the active Executive Inbox queue, but they are essential relationship evidence for onboarding and Stewardship.

### Ongoing Packet Creation

VAL must continue creating packets after onboarding.

The user may build dozens of new relationships each month. A new relationship should not be treated as less important simply because it appeared after the first onboarding scan.

Create or update a person packet when VAL sees a meaningful new relationship signal:

- a new email thread with a real person
- a sent email to a new person
- a person CC'd into a meaningful conversation
- a calendar meeting with an external attendee
- a transcript participant or repeated transcript mention
- a CRM contact or opportunity link
- an introduction email
- a document, project, or task connected to a person
- a user correction, VIP mark, or "watch this person" instruction

Thin packets are allowed. Early packets should hold name, email/domain, source, first meaningful signal, possible role/company, relationship origin, inferred relevance, confidence, and unknown needs/offers. Importance can emerge over time.

The rule is:

```text
Not every new contact is urgent.
Every new relationship deserves a place to accumulate meaning.
```

## Person Packet

The person packet is the reusable relationship understanding layer. It should be boring, traceable, and append-friendly.

```json
{
  "packet_type": "person_packet",
  "person": {
    "person_id": "",
    "name": "",
    "email_addresses": [],
    "role": "",
    "company_or_context": "",
    "crm_contact_id": "",
    "identity_status": "linked|needs_review|duplicate|unknown"
  },
  "relationship_origin": {
    "first_seen_at": "",
    "first_meaningful_signal": "",
    "source_receipts": []
  },
  "who_this_person_is": {
    "summary": "",
    "relationship_to_user": "",
    "current_context": "",
    "source_receipts": [],
    "confidence": "high|medium|low"
  },
  "what_this_person_needs": [
    {
      "need": "",
      "why_it_matters": "",
      "timing": "current|emerging|stale|unknown",
      "source_receipts": [],
      "confidence": "high|medium|low"
    }
  ],
  "what_this_person_offers": [
    {
      "offer": "",
      "why_it_matters": "",
      "source_receipts": [],
      "confidence": "high|medium|low"
    }
  ],
  "relationship_state": {
    "status": "new|active|building_trust|strategic|dormant|needs_care|unknown",
    "last_meaningful_signal_at": "",
    "open_loops": [],
    "source_receipts": []
  },
  "evidence": {
    "email_receipts": [],
    "sent_email_receipts": [],
    "cc_receipts": [],
    "transcript_receipts": [],
    "calendar_receipts": [],
    "project_receipts": [],
    "document_receipts": [],
    "crm_receipts": [],
    "user_confirmed_receipts": []
  },
  "packet_state": {
    "maturity": "thin|developing|usable|strong",
    "needs_review": false,
    "missing_variables": [],
    "updated_at": ""
  }
}
```

## Stewardship Matching Layer

The Stewardship Round Table compares person packets. It does not treat a single person packet as the whole answer.

For each possible match, VAL asks:

1. Does Person A need something Person B offers?
2. Does Person B need something Person A offers?
3. Is there recent evidence that makes the match timely?
4. Is the relationship permission and trust level appropriate?
5. Would the introduction create real value for both sides?
6. Is the confidence high enough to draft, or should VAL only watch/ask?

The output of this layer is a match packet or introduction opportunity packet, not a mutation of the person packet into fixed truth.

Stewardship should be able to say:

- who needs this person because this person offers something useful
- who this person should meet because that person offers something they need
- why the match matters now
- whether VAL should prepare a draft, ask a clarifying question, watch quietly, or do nothing

## Stewardship Round Table

The round table is a set of narrow judgments, not one giant summarizer.

### Identity Seat

Answers:

- Who is this person?
- Is this a real contact, duplicate, alias, company-only record, or unresolved identity?
- What CRM/contact record should anchor the person?

Never expose internal identity uncertainty as vague copy. If identity needs review, show a direct action such as "Review contact match."

### Context Seat

Answers:

- What is the brief overview of this relationship?
- What is VAL's current understanding today?
- Why does this relationship matter now?
- What projects, meetings, transcripts, emails, documents, and commitments are actually connected?
- What is recent enough to matter?
- What are the relationship history chapters, not the raw activity log?

Only source-backed context can move forward.

### Stewardship Status Seat

Answers:

- How well is the user stewarding this relationship?
- Is the relationship healthy, drifting, unbalanced, neglected, strengthening, or in a good season for reconnection?
- Has the user followed through?
- Has the relationship become request-heavy from one side?
- What would caring well look like next?

This is narrative, not a score.

### Value Seat

Answers:

- What can this person offer the user's network?
- What expertise, timing, introductions, credibility, emotional support, distribution, hiring, investment, mentorship, perspective, access, audience, resources, influence, or problem-solving capacity do they appear to have?
- Which source proves or suggests each offer?

### Opportunity Seat

Answers:

- What explicit needs has this person named?
- What hidden friction is visible?
- What opportunity to help exists even if they have not asked?
- What are they building, seeking, stuck on, considering, or trying to decide?
- Which source proves or suggests each need?

### Network Match Seat

Answers:

- Who should this person meet?
- Who in the user's network needs what this person offers?
- Why is the match useful now?
- Is there enough evidence and relationship permission to prepare an introduction?
- Is this only a person-to-person match, or is an ecosystem/network cluster forming?

Network clusters are a future-facing layer. VAL should leave room to notice them without forcing a complex visualization today.

### Stewardship Seat

Answers:

- What is the next thoughtful move?
- Should VAL prepare an introduction, follow-up, reminder, meeting note, CRM update, or nothing?
- What should not be forced?

### Safety and Provenance Seat

Answers:

- Which statements are sourced?
- Which statements are inferred?
- Which statements are blocked until the user reviews them?
- What can be shown to the user, and what must stay internal?

## Stewardship Packet

Legacy note: older Hearth contracts use `Stewardship Packet` as the umbrella term. In the current architecture, the umbrella contains many `person_packet` records plus `stewardship_match_packet` records. Do not collapse those layers.

## Stewardship Match Packet

The match packet is the structured output of the Stewardship Round Table. It should be boring, traceable, and machine-readable.

```json
{
  "packet_type": "stewardship_match_packet",
  "focus_person_packet_id": "",
  "compared_person_packet_ids": [],
  "stewardship_status": {
    "status": "healthy|drifting|unbalanced|strengthening|reconnect_now|needs_care|unknown",
    "narrative": "",
    "source_receipts": [],
    "confidence": "high|medium|low"
  },
  "current_understanding": {
    "today": "",
    "why_it_matters_now": "",
    "source_receipts": []
  },
  "brief_overview": "",
  "relationship_history": [
    {
      "period": "",
      "chapter": "",
      "source_receipts": []
    }
  ],
  "connected_work": [],
  "recent_touchpoints": [],
  "what_this_person_offers": [
    {
      "offer": "",
      "why_it_matters": "",
      "source_receipts": [],
      "confidence": "high|medium|low"
    }
  ],
  "what_this_person_needs": [
    {
      "need": "",
      "why_it_matters": "",
      "source_receipts": [],
      "confidence": "high|medium|low"
    }
  ],
  "people_they_should_meet": [
    {
      "person": "",
      "reason": "",
      "need_met": "",
      "source_receipts": [],
      "prepared_intro_packet_id": "",
      "approval_status": "not_ready|ready_for_review|approved|rejected"
    }
  ],
  "people_who_need_them": [
    {
      "person": "",
      "reason": "",
      "offer_matched": "",
      "source_receipts": [],
      "prepared_intro_packet_id": "",
      "approval_status": "not_ready|ready_for_review|approved|rejected"
    }
  ],
  "network_clusters": [
    {
      "theme": "",
      "people": [],
      "why_this_cluster_matters": "",
      "source_receipts": [],
      "maturity": "noticed|forming|ready_for_review"
    }
  ],
  "next_stewardship_move": {
    "move": "",
    "why": "",
    "source_receipts": [],
    "approval_required": true
  },
  "user_visible": {
    "headline": "",
    "stewardship_status": "",
    "current_understanding": "",
    "why_it_matters_now": "",
    "overview": "",
    "relationship_history": [],
    "what_this_person_offers": [],
    "what_this_person_needs": [],
    "matches": [],
    "prepared_work": []
  },
  "internal_only": {
    "round_table_notes": [],
    "missing_variables": [],
    "source_of_source": [],
    "graph_links": [],
    "confidence_debug": []
  }
}
```

## Custom Fields

These fields are the durable shape every future VAL should follow, even if the CRM provider changes.

- `stewardship_identity_status`
- `stewardship_status`
- `stewardship_current_understanding`
- `stewardship_why_it_matters_now`
- `stewardship_brief_overview`
- `stewardship_relationship_history`
- `stewardship_connected_work`
- `stewardship_recent_touchpoints`
- `stewardship_person_packet_id`
- `stewardship_who_this_person_is`
- `stewardship_what_this_person_needs`
- `stewardship_what_this_person_offers`
- `stewardship_packet_maturity`
- `stewardship_packet_last_meaningful_signal_at`
- `stewardship_people_they_should_meet`
- `stewardship_people_who_need_them`
- `stewardship_network_clusters`
- `stewardship_next_move`
- `stewardship_source_receipts`
- `stewardship_prepared_intro_packets`
- `stewardship_needs_user_review`

## What The User Sees

The drawer should be quiet.

```text
Mark Biermann

Stewardship Status
A short narrative about how well the relationship is being cared for.

Current Understanding
One alive sentence about what is true in this relationship today.

Why It Matters Now
The timely reason this relationship deserves attention, care, or quiet.

Overview
Who Mark is, what he owns/leads, and why he is in VAL.

Relationship History
The major chapters of the relationship, not every email or transcript.

What Mark Offers
Specific relationship value Mark can bring to others.

What Mark Needs
Explicit asks, hidden friction, current gaps, or useful support VAL notices before it becomes urgent.

Legacy copy mapping:

- `Ways They Create Value` now maps to `What They Offer`.
- `Opportunities to Help` now maps to `What They Need`.
- A `network cluster` is still valid behind the scenes when several person packets point to an emerging ecosystem.

Mark Should Meet
People in the user's network who may help Mark.
Prepared draft shown only when ready for review.

People Who Need Mark
People in the user's network who may benefit from Mark.
Prepared draft shown only when ready for review.

Next Stewardship Move
One clear, source-backed move.
```

The user should not see:

- Round Table notes
- packet names
- source-of-source
- graph links
- missing variable lists
- debug confidence
- raw prompt output
- vague states like "open loop momentum"
- repetitive transcript snippets
- internal phrases like "observed trajectory" or "identity unresolved" unless paired with a clear action

## Introduction Opportunity Packet

When VAL finds that one person needs what another person can offer, VAL may prepare an introduction packet.

```json
{
  "packet_type": "introduction_opportunity_packet",
  "match_direction": "person_needs_mark|mark_needs_person",
  "recipient": "",
  "introduced_person": "",
  "why_this_match_matters": "",
  "need": "",
  "offer": "",
  "source_receipts": [],
  "draft_subject": "",
  "draft_body": "",
  "approval_status": "ready_for_review",
  "no_external_action": true
}
```

Prepared introduction drafts feed the Home Leverage card because they are work VAL prepared for review.

Nothing sends without explicit user approval.

## Executive Copy Rules

Use executive-facing language:

- "Stewardship"
- "Overview"
- "Stewardship Status"
- "Current Understanding"
- "Why It Matters Now"
- "Relationship History"
- "What They Offer"
- "What They Need"
- "Should Meet"
- "People Who Need Them"
- "Prepared Draft"
- "Review Contact Match"
- "Review Source"

Avoid internal language:

- "relationship_packet"
- "round table output"
- "source-of-source"
- "graph links"
- "confidence debug"
- "observed trajectory"
- "open loop momentum"
- "identity unresolved"
- "hydration"
- "packet blocked"

## Done Standard

The Stewardship drawer is acceptable only when:

- It renders from Stewardship packet/custom-field data.
- Every visible claim has source receipts behind it.
- Every review state has a plain user action.
- Prepared introductions appear in Leverage before any send action.
- Internal packet/debug language is hidden from the executive-facing surface.
- The drawer answers "how do I care for this relationship well?" before profile or project-management questions.
