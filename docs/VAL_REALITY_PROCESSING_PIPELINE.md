# VAL Reality Processing Pipeline

Purpose: define how reality enters VAL before any drawer, card, page, chat, voice surface, relationship, project, or action is allowed to use it.

Executive Inbox revealed this pattern through email, but the pattern is platform-wide.

Every future source should follow the same lifecycle:

```text
Source
  -> Witness
  -> Executive Relevance Engine
  -> Round Table
  -> Packets
  -> Dashboard / Drawer / Co-Work
  -> Action
  -> Receipt
  -> Learn
  -> Reflect
  -> Remember
```

This applies to:

- email
- sent email
- transcripts
- calendar events
- meeting prep
- documents
- CRM/GHL updates
- voice notes
- chat messages
- SMS
- Slack
- LinkedIn
- WhatsApp
- external action receipts

## Core Principle

Not every true thing deserves understanding.

Not every understood thing deserves cognitive space.

Not every relevant thing deserves interruption.

VAL must protect the user's attention before it organizes the user's information.

## Source

Source is the raw event or record that entered VAL.

Examples:

- an email arrived
- an email was sent
- a transcript finished processing
- a calendar event changed
- a document was uploaded
- a CRM field changed
- the user spoke to VAL
- a task was completed
- an external action receipt arrived

Source answers:

```text
What entered VAL?
Where did it come from?
Can VAL return to the exact source?
```

Source is stored as evidence whenever technically possible, even when it does not earn attention.

## Witness

The Witness is the first intelligence layer.

Its only job is to answer:

```text
What actually happened?
```

The Witness does not recommend, prioritize, draft, decide, rank, or interpret motive.

It produces plain observations:

- Greg replied.
- Proposal attached.
- Signature requested by Friday.
- Michele changed the document.
- Calendar meeting moved to 2 PM.
- Transcript included a promise to send the scope.
- User said not to treat this person as important.

The Witness must not say:

- This is urgent.
- This matters because...
- You should reply.
- This is a relationship risk.
- VAL should draft...

Those belong later.

## Executive Relevance Engine

The Executive Relevance Engine is global.

Every source asks it before creating durable context or surfacing work.

It answers:

```text
Has this earned cognitive space?
```

It is not specific to Executive Inbox.

Every system must ask it:

- Can this create a Relationship?
- Can this create or update a Project?
- Can this feed Velocity?
- Can this feed Alignment?
- Can this feed Leverage?
- Can this influence Meeting Prep?
- Can this enter Co-Work context?
- Can this create a task, draft, or rule?
- Should this stay as quiet source evidence only?

## Relevance States

The Executive Relevance Engine returns one of these states:

| State | Meaning | Allowed behavior |
|---|---|---|
| `discard_noise` | Not useful enough to keep beyond provider/source history. | Do not packetize. |
| `store_evidence_only` | True and searchable, but no cognitive space. | Store evidence only. |
| `quiet_context` | May matter later, but should not interrupt now. | Link lightly; no Home/Inbox. |
| `contact_only` | Identity exists, but no durable relationship yet. | Lightweight identity only. |
| `relationship_eligible` | Can feed a Relationship packet. | Relationship observer may use it. |
| `project_eligible` | Can feed a Project packet. | Project observer may use it. |
| `executive_attention` | Deserves user judgment. | May feed Executive Inbox, Alignment, Home. |
| `prepared_work_eligible` | VAL can prepare something useful. | May feed Leverage/Ready For You. |
| `suppressed` | User or rule forbids cognitive use. | Do not use except source search/audit. |

## Universal Admission Rules

These rules apply before any domain-specific Round Table.

### 1. Suppression Wins

If the user marks a person/source/domain/project as not executive-relevant, suppression wins over every automatic signal until explicitly reversed.

Suppressed sources:

- do not create Relationships
- do not enrich Relationships
- do not create Projects
- do not feed Home
- do not feed Meeting Prep
- do not enter Co-Work context
- do not create drafts, tasks, or rules

### 2. Evidence Before Meaning

Every surfaced judgment must trace to a source receipt.

If VAL cannot route back to the source, the item cannot enter an executive surface.

### 3. Relationship Before Relationship Memory

A person becomes a Relationship only through evidence:

- user replied
- user explicitly marked important
- calendar presence
- transcript presence
- CRM presence
- task/commitment/project tie
- trusted important person mentioned them

### 4. Project Before Project Memory

A Project exists only when the signal is ongoing:

- multiple related emails
- multiple meetings
- transcript thread
- task/deliverable
- document/proposal
- CRM opportunity
- explicit user creation

Otherwise it remains a conversation or evidence item.

### 5. Attention Must Have Consequence

An item may enter Home, Executive Inbox, Meeting Prep, or Alignment only when there is a consequence:

- trust risk
- deadline
- revenue/opportunity movement
- promised follow-through
- blocked project
- meaningful relationship change
- user capacity impact
- prepared work ready for approval

### 6. Cheap VAL Work Before Expensive User Attention

If VAL can prepare safely without bothering the user, it should prepare first and surface only the review/approval.

If VAL cannot prepare safely, it should ask the smallest possible question.

### 7. No Context Borrowing From Suppressed Or Unadmitted Sources

Unadmitted context may not be used as background support for a different card, drawer, meeting prep, Co-Work answer, relationship file, or project dossier.

## Round Tables

Round Tables are domain-specific reasoning engines.

They should consume Witness observations and Executive Relevance decisions, not raw everything.

Examples:

| Round Table | Question |
|---|---|
| Velocity | What changed, and does it matter? |
| Alignment | What deserves attention first? |
| Leverage | What can VAL prepare or complete before bothering the user? |
| Executive Inbox | Does this communication deserve judgment, and what is the smallest safe action? |
| Meeting Prep | What does the user need to know before this meeting? |
| Relationships | What changed in trust, warmth, risk, or opportunity? |
| Projects | What moved, stalled, blocked, or became possible? |
| Documents | What does this document change or enable? |
| Commitments | Who owes whom what, by when, and with what consequence? |

## Packet Creation Rule

Packets are created only after the Executive Relevance Engine admits the source for that packet type.

Examples:

```text
Email arrived
  -> Witness: sender asked for pricing by Friday
  -> Relevance: relationship_eligible + executive_attention
  -> Executive Inbox Round Table
  -> Email Judgment Packet
  -> Draft Packet
  -> External Action Packet after Send approval
  -> Receipt
  -> Relationship + Project + Commitment feeds
```

```text
Newsletter arrived
  -> Witness: bulk newsletter from vendor
  -> Relevance: store_evidence_only or discard_noise
  -> No Executive Inbox
  -> No Relationship
  -> No Home
```

```text
Transcript processed
  -> Witness: user promised to send proposal to Michele
  -> Relevance: relationship_eligible + project_eligible + prepared_work_eligible
  -> Leverage Round Table
  -> Prepared Work Packet
  -> Draft Packet
  -> Approval Packet
```

## Dashboard Rule

Dashboard surfaces are downstream of relevance.

Home, Executive Inbox, Meeting Prep, Relationships, Projects, Documents, Commitments, and Co-Work may only show or use context that passed the relevant admission gate.

The UI should never be the first place relevance is decided.

## Co-Work Rule

Co-Work may hold full admitted packet context invisibly.

Co-Work must not expose raw context to the user unless explicitly coded to show a useful plain-English explanation.

Co-Work must not borrow unrelated context simply because it exists in VAL.

## Debugging Rule

When a bad item appears, debug in this order:

1. Source: did VAL capture the right source?
2. Witness: did VAL describe what happened accurately?
3. Relevance: did VAL admit something that should have stayed quiet?
4. Round Table: did the domain reasoning overreach?
5. Packet: did the packet contain the right variables?
6. Surface: did the drawer/card show only admitted context?
7. Action: did the approval/send/task/update packet preserve source refs?
8. Receipt: did downstream observers receive the right result?

This is how VAL avoids becoming a collection of special-case dashboards.

