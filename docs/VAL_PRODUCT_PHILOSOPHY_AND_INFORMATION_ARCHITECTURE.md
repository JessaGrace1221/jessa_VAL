# VAL Product Philosophy and Information Architecture v1

Purpose: define VAL's product philosophy, product language, navigation philosophy, and information architecture before any Phase 13 wireframes or UI implementation.

This is not a visual design spec.

This is the meaning layer for VAL's interface.

The philosophy generates the language.

It answers:

> What is each place in VAL for?

Before VAL draws boxes, cards, tables, drawers, or buttons, every destination must know why it exists.

Companion specs:

- [VAL_FOUNDATION.md](./VAL_FOUNDATION.md)
- [VAL_DO_NOT_REGRESS.md](./VAL_DO_NOT_REGRESS.md)
- [VAL_CONSTITUTION.md](./VAL_CONSTITUTION.md)
- [VAL_DESIGN_PHILOSOPHY.md](./VAL_DESIGN_PHILOSOPHY.md)
- [VAL_HOMEPAGE_WITNESS_SYSTEM.md](./VAL_HOMEPAGE_WITNESS_SYSTEM.md)
- [VAL_CHIEF_OF_STAFF_DECISION_MODEL.md](./VAL_CHIEF_OF_STAFF_DECISION_MODEL.md)
- [VAL_MOMENTUM_CARD_PROMPTS.md](./VAL_MOMENTUM_CARD_PROMPTS.md)
- [VAL_READY_FOR_YOU_CARD_PROMPTS.md](./VAL_READY_FOR_YOU_CARD_PROMPTS.md)
- [VAL_RELATIONSHIP_PROJECT_UNDERSTANDING_PROMPTS.md](./VAL_RELATIONSHIP_PROJECT_UNDERSTANDING_PROMPTS.md)
- [VAL_EXECUTIVE_INBOX_CLASSIFICATION_PROMPTS.md](./VAL_EXECUTIVE_INBOX_CLASSIFICATION_PROMPTS.md)
- [VAL_CALENDAR_AND_MEETING_PREP_PROMPTS.md](./VAL_CALENDAR_AND_MEETING_PREP_PROMPTS.md)
- [VAL_CHAT_VOICE_CONTEXT_PROMPTS.md](./VAL_CHAT_VOICE_CONTEXT_PROMPTS.md)
- [VAL_OS_INSTRUCTIONS_AND_APPROVAL_PROMPTS.md](./VAL_OS_INSTRUCTIONS_AND_APPROVAL_PROMPTS.md)
- [VAL_UI_COMPONENT_SYSTEM.md](./VAL_UI_COMPONENT_SYSTEM.md)
- [VAL_USER_JOURNEYS.md](./VAL_USER_JOURNEYS.md)

## The Promise of VAL

Every screen in VAL exists to help the user recognize something true, prepare something meaningful, or make a wiser decision.

If a screen does not do one of those three things, it does not belong in VAL.

This promise should govern every future feature, page, workflow, card, drawer, prompt, and action.

## How VAL Thinks

VAL's interface should respect the way VAL thinks.

Not technically.

Philosophically.

```text
Reality
  -> Evidence
  -> Observers
  -> Round Table
  -> Chief of Staff
  -> Understanding
  -> Preparation
  -> Action
  -> Learning
  -> Wisdom
```

The user should not need to see every layer.

But every screen should honor the order.

Evidence comes before opinion.

Understanding comes before action.

Preparation comes before execution.

Learning becomes wisdom only when VAL updates its beliefs with humility.

## Primary Design Principle

The UI should not expose VAL's intelligence.

It should expose the confidence, context, and reasoning the user needs in order to trust VAL's judgment.

Everything else remains behind the curtain.

The user should feel the Round Table.

They should not have to watch the Round Table think.

The user should feel that VAL has been paying attention.

They should not feel watched.

## Constitutional UX Rule

The interface should feel aware before it feels interactive.

The user should not experience VAL as a passive dashboard waiting for clicks.

When VAL opens, it should already communicate that it has noticed, thought, prepared, and is quietly ready to brief the user.

This is the visual and interaction form of recognition before interaction.

Home should feel like presence before it feels like navigation.

## What Every Screen Must Do

Every screen must answer four questions:

1. Why am I here?
2. What matters?
3. What can VAL already do for me?
4. What only I can do?

These questions map to four responsibilities:

| Question | Responsibility |
|---|---|
| Why am I here? | Recognition |
| What matters? | Judgment |
| What can VAL already do for me? | Preparation |
| What only I can do? | Human agency |

If a screen cannot answer these four questions, it should be removed, merged, or redesigned.

No screen should exist merely because the data exists.

No screen should ask the user to interpret raw system complexity before VAL has done the work of understanding.

## Core Product Shift

VAL is not organized around screens.

VAL is organized around experiences.

The old question is:

> What feature is this?

The new question is:

> What state of executive knowing does this place create?

Every destination must answer five questions:

1. Why does this place exist?
2. What executive question does it answer?
3. What emotional state should the user leave with?
4. What should never appear here?
5. What is the smallest meaningful interaction?

## The Emotional Journey

No screen in VAL should leave the user feeling busy.

Each destination should create a specific state of executive knowing:

| Destination | User Should Feel When Leaving |
|---|---|
| Chief of Staff | Clear |
| Momentum | Oriented |
| Ready For You | Relieved |
| People | Connected |
| Projects | Purposeful |
| Executive Inbox | Confident |
| Calendar | Prepared |
| Working Together | Capable |
| Teach VAL | Understood |
| VAL OS | In control |
| Settings | Secure |
| Developer | Trust through inspection |

If a screen increases noise without increasing clarity, it has failed.

## What VAL Never Says

VAL's product language should avoid phrases that make the user feel managed, measured, behind, or reduced to a productivity object.

| Never Say | Prefer |
|---|---|
| You have 27 unread emails. | Three conversations deserve your attention. |
| You are behind. | Momentum has slowed because one decision is still waiting. |
| How can I help? | I already have context. Here is what I am carrying into this with you. |
| Task overdue. | A promise is still waiting. |
| AI generated this. | VAL prepared this for your review. |
| Contact record updated. | This relationship context is now connected. |
| Low productivity day. | Today appears to require more protection than output. |
| Error occurred. | VAL could not complete this safely. Here is what happened. |
| Automation ran. | VAL followed the instruction and recorded the receipt. |

VAL should speak as a thoughtful executive partner.

It should never sound like a generic SaaS notification layer.

## Product Language

Use language that feels:

- Executive, not corporate.
- Warm, not friendly.
- Quiet, not empty.
- Confident, not flashy.
- Human, not emotional.
- Intelligent, not clever.
- Spacious, not sparse.
- Calm, not cold.
- Premium, not luxurious.
- Purposeful, not decorative.

VAL should prefer language that names judgment:

- `Recommendation`
- `Why I believe this`
- `Evidence`
- `What changed`
- `What needs your judgment`
- `What I prepared`
- `What only you can decide`
- `Confidence`
- `Unknowns`
- `What almost won instead`
- `Source`
- `Receipt`
- `Timeline`

VAL should avoid generic software language when a more human and precise phrase exists:

| Avoid | Prefer |
|---|---|
| Dashboard | Home, Today, Overview, Briefing |
| Contacts | People |
| Tasks generated | Commitments found |
| AI output | Prepared work |
| Details | Context |
| Activity feed | Timeline |
| Priority score | Why now |
| Automation | Instruction, behavior, action packet |
| Draft folder | Ready For You |
| Chatbot | Working Together |
| CRM record | Relationship anchor, person, organization |

## Navigation Philosophy

VAL should have two interface systems:

1. Home Presence
2. Supporting Destinations

Home Presence begins with the Hearth.

The Hearth is where VAL witnesses, orients, and gives permission before the user takes action.

Only after the Hearth does Home come to the user through Velocity, Alignment, and Leverage.

Supporting Destinations are the evidence, tools, and operational surfaces that help VAL prepare, explain, and act.

### Homepage Executive Questions

Home is where VAL comes to the user.

It is organized around three executive questions:

| Principle | Executive Question | User Leaves With |
|---|---|---|
| Velocity | What changed? | Orientation |
| Alignment | What deserves my attention? | Clarity |
| Leverage | What has already been prepared? | Relief |

Chief of Staff, Momentum, and Ready For You remain the underlying intelligence engines behind Alignment, Velocity, and Leverage.

They should not force Home into five equal columns.

### Supporting Destinations

| Destination | Executive Question | User Leaves With |
|---|---|---|
| People | Who matters, and why? | Connection |
| Projects | What is this work becoming? | Purpose |
| Calendar | Who am I about to sit with? | Preparedness |
| Executive Inbox | Which conversations deserve my attention? | Confidence |
| Working Together | What are we building together? | Partnership |
| Tasks | What commitments need honorable follow-through? | Cleanliness |
| Documents | What knowledge or artifact should VAL understand or create? | Continuity |
| CRM | What relationship operating data must stay clean and connected? | Order |
| Lead Intelligence | Which external opportunities deserve investigation? | Discernment |
| Teach VAL | What should VAL understand about me, my work, and my world? | Being understood |
| VAL OS | How should VAL behave when specific things happen? | Agency |
| Settings | What account, permissions, and integrations govern VAL? | Control |
| Developer | What did VAL observe, decide, execute, fail, or reconcile? | Trust through inspection |

## Recognition Before Interaction

Every page must begin with recognition before interaction.

The first thing the user sees should answer:

> Why am I here?

Not:

> What buttons do I have?

This is a hard UX rule.

Examples:

| Destination | Recognition First |
|---|---|
| Chief of Staff | Recommendation |
| Momentum | Witness line |
| Ready For You | Why you are seeing this |
| People | Thirty Second Truth |
| Projects | Thirty Second Truth |
| Calendar | One sentence orientation |
| Executive Inbox | Conversation consequence |
| Working Together | Current context |
| Teach VAL | What VAL believes it understands |
| VAL OS | Active behavior summary |
| Developer | Current system state |

## Global Context Drawer

The right drawer is Context, not details.

It is the reusable trust surface across VAL.

It should show only what helps the user understand why VAL believes something, what it is connected to, and what happened next.

Possible drawer sections:

- Evidence
- History
- Related relationships
- Related projects
- Open loops
- Timeline
- Source confidence
- Unknowns
- Execution receipts
- Reconciliation events
- Opposing view
- What VAL did
- What VAL did not do

The drawer should not become a dumping ground.

If a section does not strengthen trust, judgment, or context, it should stay hidden.

## Destination Definitions

### Chief of Staff

Why this place exists:

Chief of Staff helps the user decide where attention belongs now.

It protects the user from confusing urgency, anxiety, availability, or guilt with priority.

Executive question:

> Where should I place my attention?

User leaves with:

Clarity.

Recognition first:

One recommendation, stated with humility and conviction.

Smallest meaningful interaction:

Read the recommendation, understand why, accept support, complete or dismiss.

Should show:

- Recommendation
- Why I believe this
- Evidence
- Confidence
- Opposing view
- What VAL can do now
- Next candidates queue
- Completion observation

Should never show:

- Generic task lists
- Raw observer dumps
- Email counts
- Analytics grids
- Ten competing recommendations
- Productivity guilt

Core language:

> Here is why I believe this is your best move.

### Momentum

Why this place exists:

Momentum helps the user understand what is changing across life, work, relationships, energy, meaning, and commitments.

It protects tomorrow's trajectory.

Executive question:

> What is changing?

User leaves with:

Orientation.

Recognition first:

A witness line naming the strongest current movement.

Smallest meaningful interaction:

Read what changed, inspect evidence, protect or redirect momentum.

Should show:

- Direction
- Velocity
- Meaning
- Invisible momentum
- What is rising
- What is slowing
- What deserves protection
- Evidence and source confidence

Should never show:

- Generic analytics
- Vanity metrics
- Productivity charts
- A scoreboard of completed tasks
- One-note positive spin

Core language:

> Potential becoming reality.

### Ready For You

Why this place exists:

Ready For You helps the user finish meaningful work without starting from zero.

It protects creative energy by surfacing only work where human judgment is now the bottleneck.

Executive question:

> What has already been prepared so I do not have to start from zero?

User leaves with:

Relief.

Recognition first:

Why the user is seeing each item.

Smallest meaningful interaction:

Review, approve, reject, edit, snooze, or inspect receipt.

Should show:

- Items requiring human judgment
- Why now
- What VAL prepared
- What only the user can do
- Review time
- Representation risk
- Approval policy
- Execution receipt when present

Should never show:

- All drafts
- Background summaries
- Internal enrichments
- Every AI-generated artifact
- Work that does not need the user's judgment
- A noisy inbox of machine output

Core language:

> Nothing meaningful is waiting on your judgment.

Empty state:

> I'm caught up.

### People

Why this place exists:

People helps the user remember who someone is becoming, why they matter, and what the relationship needs now.

It is Understanding, not CRM.

Executive question:

> Who matters, and why?

User leaves with:

Connection.

Recognition first:

Thirty Second Truth.

Smallest meaningful interaction:

Read, ask a question, take a relationship action.

Should show:

- Thirty Second Truth
- Current season
- Relationship gravity
- Relationship health
- Why this relationship matters
- What changed
- Mutual value
- Invisible contributions
- Living narrative
- Open loops
- Related projects
- Source evidence

Should never show:

- CRM field grids as the primary experience
- Contact IDs as user-facing identity
- Arbitrary engagement scores
- Scraped facts without context
- Personal details that feel creepy or performative

Core language:

> If I had thirty seconds to remind you about this person...

### Projects

Why this place exists:

Projects helps the user understand what the work is becoming, why it exists, and what kind of movement matters.

It is Understanding, not project management.

Executive question:

> What is this work becoming?

User leaves with:

Purpose.

Recognition first:

Thirty Second Truth.

Smallest meaningful interaction:

Understand the current season, inspect what changed, move one meaningful blocker or decision.

Should show:

- Thirty Second Truth
- Why it exists
- Current season
- Momentum
- Meaning
- Relationships moving it
- Decisions waiting
- Biggest unknown
- Living narrative
- Open future
- Evidence

Should never show:

- Project management boards as the main page
- Busywork status reports
- Progress theater
- Task lists without meaning
- Arbitrary percentage-complete claims

Core language:

> This work is becoming...

### Calendar

Why this place exists:

Calendar prepares the user for the humans, context, stakes, and opportunities in the room before the room opens.

It is relationship intelligence placed exactly where it is needed.

Executive question:

> Who am I about to sit with?

User leaves with:

Preparedness.

Recognition first:

One sentence orientation for the meeting.

Smallest meaningful interaction:

Open meeting prep, understand who matters, enter the meeting well.

Should show:

- Meeting purpose
- User role
- Meeting stakes
- Attendee intelligence
- Relationship context
- Opportunity and introduction map
- First five minutes
- Suggested questions
- Follow-up preparation
- Post-meeting capture prompt

Should never show:

- Agenda-only calendar blocks as the primary experience
- Creepy public research phrasing
- Unsourced attendee claims
- Recited personal details
- Calendar density as the main insight

Core language:

> This meeting is not isolated. It sits inside a web of relationships, projects, opportunities, commitments, and timing.

### Executive Inbox

Why this place exists:

Executive Inbox protects important conversations from being lost, overreacted to, or mistaken for priority.

It thinks in conversations, not emails.

Executive question:

> Which conversations deserve my attention?

User leaves with:

Confidence.

Recognition first:

Conversation consequence.

Smallest meaningful interaction:

Review the few conversations that need the user, inspect why, draft or defer.

Should show:

- Needs Me
- Waiting On Them
- Moving Well
- Needs Care
- Can Wait
- Hidden
- Conversation state
- Relationship temperature
- Executive meaning
- Why now
- If delayed
- Draft readiness

Should never show:

- Unread counts as importance
- Message chronology as priority
- Generic priority labels without consequence
- Drafts that fake missing context
- Email as the relationship object

Core language:

> This is surfacing because it protects trust, timing, opportunity, commitment, reputation, capacity, or momentum.

### Working Together

Why this place exists:

Working Together is where the user and VAL create, think, decide, build, write, code, prepare, and make sense of work in context.

It replaces traditional chat.

Executive question:

> What are we building together?

User leaves with:

Partnership.

Recognition first:

Current context.

Smallest meaningful interaction:

State intent, choose mode implicitly or explicitly, let VAL gather context, build with milestones.

Should show:

- Context gathered
- Active mode
- Session state
- Creation authority
- Milestones
- Prepared work
- Current activity
- Work handoff
- Stop-and-ask moments

Should never show:

- "How can I help?"
- Blank chatbot emptiness
- Long voice responses
- Generic brainstorming when the user asked for production
- External actions without clear authorization and safety checks

Core language:

> I already have context. Here is what I am carrying into this with you.

### Tasks

Why this place exists:

Tasks help commitments become honorable follow-through without stripping away their source, relationship, or reason.

Executive question:

> What commitments need honorable follow-through?

User leaves with:

Cleanliness.

Recognition first:

Commitments that matter and why.

Smallest meaningful interaction:

Clarify, complete, delegate, schedule, or connect a task to its source.

Should show:

- Commitment before task
- Why this exists
- Source quote or summary
- Related person
- Related project
- Timing
- Approval status
- Context needed

Should never show:

- Context-free task dumps
- Transcript fragments flattened into chores
- Tasks without source evidence
- Artificial urgency

Core language:

> This matters because...

### Documents

Why this place exists:

Documents help VAL understand, prepare, create, and preserve important artifacts without losing their relationship or project context.

Executive question:

> What knowledge or artifact should VAL understand or create?

User leaves with:

Continuity.

Recognition first:

What this document changes or supports.

Smallest meaningful interaction:

Open artifact context, ask VAL to understand or build from it, hand off prepared work to review.

Should show:

- Artifact purpose
- Related people
- Related projects
- Current version state
- What VAL extracted
- What VAL prepared
- Review status

Should never show:

- File storage as the primary experience
- Undifferentiated document lists
- Generated documents without provenance
- Version changes without explanation

Core language:

> This artifact belongs to...

### CRM

Why this place exists:

CRM keeps relationship operating data clean, connected, and anchored without becoming VAL's memory.

The CRM is an external system of record.

VAL is the intelligence layer.

Executive question:

> What relationship operating data must stay clean and connected?

User leaves with:

Order.

Recognition first:

CRM cleanliness and identity resolution state.

Smallest meaningful interaction:

Resolve identity, review proposed CRM note/task, inspect sync status, approve external action packet.

Should show:

- Contact identity resolution
- CRM contact ID
- Match confidence
- Recommended action
- CRM note candidates
- CRM task candidates
- External action packets
- Execution receipts
- Reconciliation timeline

Should never show:

- Auto-created contact clutter
- CRM size as success
- Sensitive context casually pushed to CRM
- External writes without approval or authorization policy

Core language:

> The CRM should feel cleaner after VAL touches it, not noisier.

### Lead Intelligence

Why this place exists:

Lead Intelligence helps the user evaluate external opportunities without confusing data abundance with opportunity quality.

Detailed scraper behavior:

- [VAL_PHASE_13C_LEAD_INTELLIGENCE_SCRAPER_SYSTEM.md](./VAL_PHASE_13C_LEAD_INTELLIGENCE_SCRAPER_SYSTEM.md)

Lead Intelligence is the user-facing expression of client-specific VAL scrapers. For example, `jessa_val` may watch for Organizations / Non-Profits and Partners, then qualify, enrich, and hand clean records to GHL / CRM.

Executive question:

> Which external opportunities deserve investigation?

User leaves with:

Discernment.

Recognition first:

Why this lead or organization might matter now.

Smallest meaningful interaction:

Review lead context, connect it to people/projects, prepare next step, discard noise.

Should show:

- What VAL has already found and prepared
- What was cleanly added to GHL / CRM
- What still needs judgment
- Why now
- Source confidence
- Relationship path
- Opportunity fit
- Unknowns
- Research provenance
- Possible introduction path

Should never show:

- Scraped lists as value
- Cold outreach spam
- Unsupported fit claims
- More leads when fewer, better ones are needed

Core language:

> This deserves investigation because...

### Teach VAL

Why this place exists:

Teach VAL lets the user shape what VAL understands about them, their work, their relationships, their preferences, and their world.

Executive question:

> What should VAL understand about me, my work, and my world?

User leaves with:

Being understood.

Recognition first:

What VAL believes it understands so far.

Smallest meaningful interaction:

Confirm, correct, add, or retire an understanding.

Should show:

- Observer introductions
- Imported context provenance
- User-confirmed insights
- Corrections
- Misunderstandings
- Sensitive context handling
- People/projects/preferences/patterns

Should never show:

- Prompt editing as the main experience
- Overconfident claims from imports
- Sensitive memories without careful handling
- Inferred identity statements without confirmation

Core language:

> Here is what I think I understand. Please correct me.

### VAL OS

Why this place exists:

VAL OS lets the user teach behavior, not edit prompts.

It is the user's way of giving their Chief of Staff operating instructions that VAL can delegate to the correct specialist.

Executive question:

> How should VAL behave when specific things happen?

User leaves with:

Agency.

Recognition first:

Active behavior summary.

Smallest meaningful interaction:

Create or edit a behavior: when this happens, VAL understands, so VAL will.

Should show:

- Behaviors
- Preferences
- Understanding
- Skills
- Automations
- Specificity ladder
- Duration/review date
- Origin story
- Test before publish

Should never show:

- Code-like automation complexity as the default
- Deployment language
- Prompt engineering burden
- Rules without reason
- Behavior changes without test cases

Core language:

> When this happens, VAL understands this, so VAL will do this.

### Settings

Why this place exists:

Settings governs account, access, integrations, privacy, permissions, and operational configuration.

Executive question:

> What account, permissions, and integrations govern VAL?

User leaves with:

Control.

Recognition first:

Connection and permission health.

Smallest meaningful interaction:

Connect, disconnect, configure, or review permissions.

Should show:

- Account settings
- Integrations
- Permissions
- Privacy controls
- Notification preferences
- Billing if applicable
- Data controls

Should never show:

- Intelligence recommendations
- Relationship narratives
- Debugger output unless specifically linked
- Sensitive data outside its permission context

Core language:

> VAL can only support what it is allowed to see and do.

### Developer

Why this place exists:

Developer gives builders and administrators the ability to inspect how VAL observed, reasoned, planned, executed, failed, retried, and reconciled.

It is the debugger, not the user's daily experience.

Executive question:

> What did VAL observe, decide, execute, fail, or reconcile?

User leaves with:

Trust through inspection.

Recognition first:

Current system state.

Smallest meaningful interaction:

Inspect a run, trace evidence, replay a pass, inspect a packet, diagnose a failure.

Should show:

- Observer runs
- Round Table runs
- Chief of Staff recommendations
- Momentum snapshots
- External action packets
- Fresh risk checks
- Execution receipts
- Reconciliation events
- Unknowns
- Audit trails

Should never show:

- Primary user workflows
- Unnecessary raw provider payloads
- Sensitive tokens
- Debug noise in the main experience

Core language:

> Here is what VAL believed, why, what happened, and what remains unresolved.

## Homepage Information Architecture

The homepage contains only three primary cards:

1. Chief of Staff
2. Momentum
3. Ready For You

Everything else moves into navigation or context drawers.

The homepage should not be a command center with every system visible.

It should be the morning surface.

It should answer:

- What deserves my attention?
- What is changing?
- What is already prepared?

## What Belongs Behind The Curtain

These systems are essential, but should not dominate the main user experience:

- Observer internals
- Raw Round Table output
- Context packet assembly
- Draft QA internals
- CRM matching heuristics
- Transcript extraction internals
- Provider payloads
- Audit logs
- Reconciliation details unless relevant
- Failed provider calls unless action is needed

They may appear in:

- Context drawer
- Developer
- Explain views
- Failure/retry surfaces
- Receipt/timeline views

## Trust Surfaces

VAL earns trust through:

- Evidence
- Confidence
- Unknowns
- Opposing view
- Source labels
- Receipt-aware action status
- What VAL did
- What VAL did not do
- What only the user can decide
- Correction paths

VAL should never ask the user to trust opaque certainty.

## The Measure of Success

Users should not leave VAL thinking:

> That AI is impressive.

They should leave thinking:

> I understand my own life and work more clearly than I did ten minutes ago.

That is Frisson.

Not as a brand.

As an experience.

VAL succeeds when the user recognizes something true, feels more capable of acting wisely, and trusts that the system is protecting their judgment rather than consuming their attention.

## Phase 13 Sequence

1. Foundation Freeze
2. Product Philosophy and Information Architecture
3. UI Component System
4. User Journeys
5. UX Architecture Audit
6. Destination-by-destination wireframes
7. Homepage redesign
8. Context drawer
9. Primary experience pages
10. Supporting system pages
11. Developer/debugger visibility
12. Motion and interaction polish

## Experience Implementation Order

1. Homepage: Velocity, Alignment, Leverage
2. People, Projects, Understanding
3. Working Together
4. Executive Inbox
5. Calendar and Meeting Prep
6. Teach VAL and VAL OS
7. Developer, Debugger, Round Table visibility

## Review Checklist

Before any Phase 13 screen is implemented, answer:

- Does this destination have a clear executive question?
- Does the page begin with recognition before interaction?
- Does the user leave with the intended emotional state?
- Is the interface showing only the reasoning the user needs to trust VAL?
- Is anything leaking from the debugger into the daily experience?
- Does this feel like VAL, or like generic SaaS?
- Does this organize around relationships, judgment, context, and preparation?
- Does this avoid reducing people, projects, or commitments to records?
- Is every action approval-safe and receipt-aware where needed?
- Does the user feel witnessed, never watched?
