# VAL Stewardship Round Table and Packets

Purpose: define the renamed Stewardship drawer and protect it from becoming an internal dossier, project-management surface, or packet/debug display.

The Stewardship drawer replaces the user-facing name "Relationships." Internal code may continue to use `relationship_packet` until a larger migration is safe, but the executive-facing product language is Stewardship.

This document applies the constitutional reasoning architecture in [VAL_EXECUTIVE_REASONING_ARCHITECTURE.md](./VAL_EXECUTIVE_REASONING_ARCHITECTURE.md) to Stewardship.

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
  -> Stewardship Round Table
  -> Stewardship Packet
  -> Stewardship custom fields
  -> Stewardship drawer
  -> Prepared introduction / follow-up packet
  -> Leverage card
  -> User approval
```

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

The packet is the structured output of the round table. It should be boring, traceable, and machine-readable.

```json
{
  "packet_type": "stewardship_packet",
  "person": {
    "name": "",
    "role": "",
    "company_or_context": "",
    "crm_contact_id": "",
    "identity_status": "linked|needs_review|duplicate|unknown"
  },
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
  "ways_they_create_value": [
    {
      "value": "",
      "why_it_matters": "",
      "source_receipts": [],
      "confidence": "high|medium|low"
    }
  ],
  "opportunities_to_help": [
    {
      "opportunity": "",
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
    "ways_they_create_value": [],
    "opportunities_to_help": [],
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
- `stewardship_ways_they_create_value`
- `stewardship_opportunities_to_help`
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

Ways Mark Creates Value
Specific relationship value Mark can bring to others.

Opportunities to Help
Explicit asks, hidden friction, or useful support VAL notices before it becomes urgent.

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
- "Ways They Create Value"
- "Opportunities to Help"
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
