# VAL Stewardship Introduction Engine V1

Status: Product definition only.

Updated: 2026-07-11

Implementation approval required before runtime or UI changes.

## Purpose

Stewardship V1 exists for one executive outcome:

```text
Help the executive make valuable introductions.
```

VAL continuously learns:

- what people need
- what people offer
- how well the executive knows them
- why VAL believes those things

When an introduction opportunity appears, VAL prepares it for review and approval.

That is the whole V1 product.

## Supersedes Broader Stewardship Direction

This document supersedes the broader Stewardship direction in:

- `docs/VAL_STEWARDSHIP_PACKET_SORTING_SPEC.md`
- `docs/VAL_STEWARDSHIP_EXECUTIVE_UI_SORTING_SPEC.md`
- `docs/VAL_STEWARDSHIP_DECISION_ENGINE_SPEC.md`

Those documents may remain useful as background architecture, but they are too broad for the next implementation.

Do not implement general relationship management in Stewardship V1.

Do not optimize for:

- relationship scores
- relationship temperature
- dossiers
- open loops
- generic next moves
- follow-up management
- reconnect suggestions
- action piles
- people-to-watch queues
- executive attention sorting

Those may return later only after the introduction engine is trusted.

## One-Sentence Product Promise

```text
Stewardship helps you make the right introductions by understanding what people need and what they can offer.
```

## V1 Drawer Structure

The Stewardship drawer should have only three areas.

### 1. Suggested Introductions

This is the home of the drawer.

Purpose:

Show introduction opportunities VAL believes are worth reviewing.

Each suggested introduction must answer:

- Who are the two people?
- What does Person A need?
- What does Person B offer?
- What does Person B need, if relevant?
- What does Person A offer, if relevant?
- Why might this introduction matter?
- What evidence supports the recommendation?
- How confident is VAL?
- What draft can the executive review?

Example:

```text
Greg <-> Michele

Because Greg is looking for executive AI adoption partners, and Michele has spent years helping leadership teams implement AI responsibly.

Confidence: High

Evidence:
- Greg discussed AI strategy on July 3.
- Michele's recent conversations focus on executive adoption.

Action:
Review Draft
```

Rules:

- Every suggested introduction must lead to draft review.
- Every suggested introduction must have a single clear `Because...` sentence.
- If VAL cannot write that sentence cleanly, the suggestion should not appear.
- No suggestion may appear only because two people share a keyword.
- No suggestion may appear without source evidence from both sides.
- No external message may be sent without explicit approval.

Classifier labels are not packet content:

- Generic intake labels must never become a person's Need, Offer, or introduction reason.
- Labels such as `Email may involve a document request or document follow-up.`, `Email contains relationship momentum or warmth.`, `Email may contain relationship or revenue opportunity signal.`, `Transcript-derived introduction opportunity: review the source snippet before preparing any introduction.`, and `Transcript source mentions a possible introduction connected to this relationship context.` may route evidence internally, but they are not executive-facing judgment.
- If VAL only has those labels, the correct result is no suggested introduction.

Explicit transcript instructions outrank inferred matching:

- If a transcript says the executive wants to introduce one person to another, VAL must preserve the named target and the source snippet.
- VAL should prefer the named transcript target over unrelated keyword-overlap matches.
- The recommendation should explain the transcript instruction, not generic email labels.

### 2. Create An Introduction

Purpose:

Let the executive pick two people and ask VAL to compare their packets.

Required controls:

- Pick Person A
- Pick Person B
- Compare packets
- Draft Introduction
- Approve / edit / decline

After two people are selected, VAL must show:

```text
Needs
- Person A needs...
- Person B needs...

Offers
- Person A offers...
- Person B offers...

Why this could matter
...

Evidence
- ...

Draft Introduction
...
```

Rules:

- The user can manually choose any admitted person.
- Manual pairing does not mean the introduction is good.
- VAL must be willing to say:

```text
I do not see a strong reason to introduce these two yet.
```

- If identity or evidence is insufficient, the draft button should be blocked with a plain reason.

### 3. Network

Purpose:

Provide a searchable relationship network that supports introduction decisions.

This is not a CRM.

This is not a dossier browser.

It should support one introduction-centered workflow:

- search
- select
- inspect needs, offers, and evidence
- see best matches automatically
- create introductions

Each person should show only enough to support introduction decisions:

- name
- organization or role when known
- needs
- offers
- recent evidence
- introduction readiness

When a person is opened, VAL should already compare that person against the admitted network and show:

```text
Best Matches
```

If an explicit command is still needed, use:

```text
Who Should [Name] Meet?
```

VAL should then compare the selected person's packet against other admitted person packets and return possible introductions, not a generic profile view.

## Person Packet Contract For V1

Packets still matter, but they are infrastructure.

The executive does not come to Stewardship to browse packets.

The executive comes to Stewardship to discover or create introductions.

Each V1 person packet should maintain only these living sections:

```json
{
  "person_id": "",
  "identity": {
    "name": "",
    "email_addresses": [],
    "known_aliases": [],
    "organization": "",
    "role": "",
    "identity_confidence": "low|medium|high"
  },
  "relationship_to_user": {
    "how_user_knows_them": "",
    "relationship_strength": "unknown|thin|known|trusted",
    "source_receipts": []
  },
  "needs": [
    {
      "need": "",
      "evidence": [],
      "confidence": "low|medium|high",
      "last_seen_at": ""
    }
  ],
  "offers": [
    {
      "offer": "",
      "evidence": [],
      "confidence": "low|medium|high",
      "last_seen_at": ""
    }
  ],
  "constraints": [
    {
      "constraint": "",
      "type": "preference|avoidance|already_knows|timing|consent_required|sensitivity|missing_piece",
      "evidence": [],
      "confidence": "low|medium|high",
      "last_seen_at": ""
    }
  ],
  "evidence": [],
  "introduction_readiness": "not_ready|needs_review|ready"
}
```

Constraints are internal unless they explain why an introduction is recommended, blocked, or should be consent-first.

Examples:

- looking for nonprofit leadership
- not looking for venture capital
- prefers warm introductions only
- avoids vendors
- already knows Greg
- recently declined AI consulting
- already working together
- do not introduce without asking first

Everything else can wait.

## Relationship Admission: Emergency Correction

VAL must stop treating noisy inbound email addresses as relationships.

This is urgent because the current surface is polluted by spam, system senders, newsletters, sales emails, and people the user has never engaged.

### Trusted Relationship Signals

Do not define real relationships only by a 90-day email window.

The 90-day sent-mail scan is the strongest automatic admission signal, not the primary definition of a relationship.

For Stewardship V1, admission should accumulate trusted evidence:

- recent sent email
- recent reply
- direct meeting participant
- meaningful transcript participant
- confirmed CRM contact
- user manually marked as important
- user manually selected in Create Introduction
- existing approved introduction history

Recent sent mail remains the safest first cleanup source because it immediately removes most spam and newsletter clutter.

But important people must not disappear only because the user has not emailed them recently.

Examples of relationships that may be real without recent sent email:

- a mentor known for years
- a person primarily reached by text
- a client known through meetings
- a person present in transcripts and calendar context
- someone manually added because they matter

### Strong Automatic Admission Signal

The strongest automatic source of real relationships is:

```text
Recipients from the user's sent mail in the last 90 days.
```

Why:

If the user sent an email to someone, that person is far more likely to be real, known, and relationship-relevant than a random inbound sender.

The 90-day sent-mail scan should collect:

- `to`
- `cc`
- `bcc` only if available and appropriate
- sent date
- thread id
- subject
- whether there were multiple exchanges
- whether the person appears in more than one thread
- aliases for the same person

### Admission Rule

A person may appear in Stewardship V1 if at least one of these is true:

- The user sent them an email in the last 90 days.
- The user replied to them in the last 90 days.
- The user explicitly named them as important.
- They are a transcript participant with meaningful context.
- They are a direct meeting participant with meaningful context.
- They are linked to a confirmed CRM identity.
- They are selected manually by the user.
- They have prior approved introduction history.

Calendar attendees are trusted contacts for Stewardship admission.

If a person is a direct attendee in Google Calendar, Outlook Calendar, VAL calendar context, or GHL calendar context, VAL should treat that person as a real contact unless the attendee is clearly the owner, a resource room, a no-reply/system address, a generic mailbox, or a private/personal calendar block.

Calendar admission should not require a recent sent email.

Each admitted person should receive an admission confidence:

```json
{
  "admission_confidence": "low|medium|high",
  "admission_signals": [
    "recent_sent_email",
    "recent_reply",
    "meeting_participant",
    "transcript_participant",
    "confirmed_crm_contact",
    "user_marked_important",
    "manual_selection",
    "approved_intro_history"
  ]
}
```

Low-confidence people may be searchable for manual selection, but should not create suggested introductions until needs, offers, identity, and relationship context are stronger.

### Rejection Rule

Do not admit a person into Stewardship V1 if the only evidence is:

- they sent the user an email and the user never replied
- they appear only as an inbound sender
- their email contains an unsubscribe link or unsubscribe header
- they are a newsletter or marketing sender
- they are a receipt, notification, system, billing, or no-reply address
- they are a generic mailbox such as `info@`, `support@`, `hello@`, `sales@`, `admin@`, `team@`, `newsletter@`, `no-reply@`, or `notifications@`
- they are a scraped email address with no user interaction
- they are a company, brand, or mailbox rather than a real person

Rejected records may remain source evidence elsewhere, but they must not appear as people in Stewardship.

### Contact Quality Filters

These filters protect Stewardship from becoming polluted by non-relationships.

Hard reject from Stewardship people:

- message body contains an unsubscribe link
- message headers contain `List-Unsubscribe`
- sender domain or display name indicates newsletter, marketing, campaign, automation, notification, billing, receipt, support, noreply, or system mail
- sender address is generic or role-based rather than person-based
- sender appears only in inbound mail and the user never replied or sent to them
- sender has bulk-mail headers such as `Precedence: bulk`, `X-Campaign`, `X-Mailchimp`, `X-SES-Outgoing`, or equivalent marketing-provider traces
- message is categorized as promotion, update, social notification, receipt, invoice, shipping, calendar automation, password/security alert, or system notification
- message contains mass-email footer language such as "manage preferences", "update your email preferences", "view in browser", or "why am I receiving this"
- sender has no plausible human name after parsing display name and email local part
- sender is a company or brand identity with no named person attached

Soft reject unless another trusted relationship signal exists:

- first-time inbound sender
- public-relations pitch
- sales prospecting email
- recruiter/vendor cold outreach
- automated scheduling email
- calendar invite sender with no direct interaction
- email alias shared by a team
- email forwarded by a tool or assistant

Allowed to enrich after admission:

- inbound replies from admitted people
- newsletters from admitted people if they are also known personally
- assistant/coordinator emails if they clearly represent an admitted person
- generic company addresses only when the user manually links them to a real person

Important rule:

```text
Spam filters decide who cannot become a person.
Relationship signals decide who can become a person.
Needs/offers evidence decides whether that person can power introductions.
```

No single inbound message should be enough to create a Stewardship person.

### Inbound Email May Still Be Evidence

Inbound mail is not useless.

It may enrich a packet after the person is admitted through a trusted route.

Example:

```text
Michele appears because the user sent Michele an email.
Michele's inbound replies may then enrich Michele's needs, offers, and evidence.
```

Bad:

```text
A cold sales sender emailed the user three times.
The user never replied.
VAL shows them as a relationship.
```

## Introduction Outcomes

VAL should learn from introduction outcomes.

This is not analytics for the executive.

This is learning that improves future judgment.

After an approved introduction has had time to breathe, VAL may quietly ask:

```text
How did this introduction go?
```

Allowed outcomes:

- Great connection
- Helpful but no next steps
- Did not respond
- Not a good fit
- Skip

Outcome feedback should update:

- which introduction patterns work for the user
- who follows through
- who enjoys introductions
- who prefers warm introductions only
- who rarely responds
- which needs and offers actually connect well
- which industries, roles, or contexts tend to fit

Outcome learning must not become a visible scorecard.

It should improve future suggested introductions quietly.

## Introduction Opportunity Model

An introduction opportunity compares two admitted person packets.

```json
{
  "record_type": "introduction_opportunity",
  "person_a_id": "",
  "person_b_id": "",
  "person_a_need": "",
  "person_b_offer": "",
  "person_b_need": "",
  "person_a_offer": "",
  "why_this_matters": "",
  "evidence_for_a": [],
  "evidence_for_b": [],
  "relationship_safety": "blocked|needs_review|safe_to_draft",
  "confidence": "low|medium|high",
  "status": "suggested|draft_ready|approved|declined|not_now",
  "external_action_requires_approval": true
}
```

## Drafting Rules

VAL may draft an introduction only when:

- both people are admitted real people
- both identities are reasonably resolved
- at least one side has a clear need
- the other side has a clear matching offer
- there is evidence for both claims
- the user has enough relationship context with both people to plausibly make the introduction

VAL must not draft when:

- one person is a spam or inbound-only contact
- one person is a generic mailbox
- either packet lacks needs/offers
- the match is based only on keywords
- the relationship would expose sensitive context
- the introduction would feel extractive or inappropriate

## Executive UI Copy Rules

Use plain introduction language.

Good:

```text
Suggested Introductions
Create Introduction
Network
Needs
Offers
Why this could matter
Evidence
Best Matches
Who Should [Name] Meet?
Review Draft
Approve Introduction
Not now
```

Do not show:

```text
Packet maturity
Observer
Temperature
Relationship score
Dossier
Move evaluation
People to watch
Active stewardship
Executive visibility
Round Table
```

## Complete Product Example

### Source Evidence Received

Transcript:

```text
I told Terry that I wanted to introduce her to Kareemah because Kareemah understands nonprofit leadership and Terry is trying to think through the next version of her work.
```

Sent mail:

```text
The user has sent email to Terry within the last 90 days.
The user has sent email to Kareemah within the last 90 days.
```

### Identity Resolution Expected

VAL resolves:

- Terry = admitted real person from sent mail and transcript context
- Kareemah = admitted real person from sent mail and transcript context

VAL must not create duplicate records from alternate spellings until identity is checked.

### Packets Created Or Updated

Terry packet:

```text
Needs:
- Thinking through the next version of her work.

Relationship:
- The user has direct recent contact with Terry.

Evidence:
- Transcript statement.
- Sent-mail recipient evidence.
```

Kareemah packet:

```text
Offers:
- Understands nonprofit leadership.

Relationship:
- The user has direct recent contact with Kareemah.

Evidence:
- Transcript statement.
- Sent-mail recipient evidence.
```

### Reasoning Output Expected

```text
Terry may benefit from Kareemah because Terry is thinking through the next version of her work, and Kareemah has relevant nonprofit leadership context.
```

### Executive-Facing Result

```text
Suggested Introduction

Terry <-> Kareemah

Terry needs help thinking through the next version of her work.
Kareemah offers nonprofit leadership context.

Confidence: High

Evidence:
- You said in a transcript that you wanted to introduce Terry to Kareemah.
- You have recent sent-mail contact with both people.

Action:
Review Draft
```

### Approval Gate

VAL may prepare a draft.

VAL may not send the introduction.

The user must approve before any external action.

### Incorrect Outputs That Must Not Appear

```text
Kareemah is in People To Watch.
Terry has a warm relationship score.
Packet maturity: usable.
No confident network introduction is ready.
VAL recommends reviewing observers.
Terry and Kareemah overlap by keyword only.
Terrie needs Email may involve a document request or document follow-up.
Kareemah offers Email contains relationship momentum or warmth.
```

## Implementation Sequence After Approval

Do not implement until the user explicitly approves this documentation.

After approval, implement in this order:

1. Add a 90-day sent-mail recipient admission pass.
2. Add evidence-weighted admission signals beyond recent sent mail.
3. Block inbound-only senders from Stewardship person lists unless another trusted signal admits them.
4. Add unsubscribe, generic-mailbox, bulk-mail, marketing, automated-sender, and non-human sender rejection.
5. Normalize aliases so the same real person is not split across email addresses.
6. Reduce packet extraction to needs, offers, relationship, evidence.
7. Replace the current Stewardship drawer with the three V1 areas.
8. Add manual two-person introduction comparison.
9. Add automatic `Best Matches` from a selected Network person.
10. Add suggested introduction records.
11. Add draft review with approval required.
12. Add introduction outcome learning.
13. Add tests proving spam/inbound-only/unsubscribe contacts do not appear.

## Explicitly Out Of Scope For V1

- generalized relationship management
- follow-up recommendations
- reconnect suggestions
- relationship health scoring
- temperature
- full dossiers
- CRM browsing
- project relationship views
- Leverage routing beyond introduction drafts
- automatic sending
- hidden packet/debug explanation surfaces
- visible outcome analytics or relationship scorecards
