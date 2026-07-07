# VAL User Journeys v1

Purpose: define VAL's most important user journeys before Phase 13 wireframes and UI implementation.

These are not feature flows.

They are journeys through states of understanding.

Features are what VAL can do.

Journeys are what the user remembers.

Companion specs:

- [VAL_PRODUCT_PHILOSOPHY_AND_INFORMATION_ARCHITECTURE.md](./VAL_PRODUCT_PHILOSOPHY_AND_INFORMATION_ARCHITECTURE.md)
- [VAL_UI_COMPONENT_SYSTEM.md](./VAL_UI_COMPONENT_SYSTEM.md)
- [VAL_ONBOARDING_FIRST_UNDERSTANDING_PROMPTS.md](./VAL_ONBOARDING_FIRST_UNDERSTANDING_PROMPTS.md)
- [VAL_HOMEPAGE_WITNESS_SYSTEM.md](./VAL_HOMEPAGE_WITNESS_SYSTEM.md)
- [VAL_READY_FOR_YOU_CARD_PROMPTS.md](./VAL_READY_FOR_YOU_CARD_PROMPTS.md)

## Journey Rule

Every important VAL journey should move through four moments:

1. Recognition
2. Judgment
3. Preparation
4. Human agency

The order matters.

VAL should not ask the user to act before helping them understand why the action matters.

## Journey 1: First Day With VAL

User state at start:

Curious, skeptical, overwhelmed, hopeful, or tired of starting over with AI tools.

Executive question:

> Does VAL understand enough about me to be useful?

Desired emotional state:

Relief and being understood.

Path:

1. User connects evidence sources.
2. User imports prior AI conversations or context.
3. VAL runs first understanding across observers.
4. Each observer introduces what it believes it understands so far.
5. VAL separates confirmed evidence, imported context, inference, and unknowns.
6. User confirms, corrects, dismisses, or marks insights as not important.
7. VAL records misunderstandings as first-class learning.
8. VAL produces the first recognition moment.

Recognition moment:

> Here is what I think I understand. Please correct me.

VAL should show:

- Source provenance
- Confidence
- Observer introductions
- Major people
- Major projects
- Preferences
- Open loops
- Sensitive context handling
- Correction options

VAL should not show:

- Overconfident identity claims
- Therapy-like interpretation
- Raw transcript dumps
- CRM-style records
- A generic onboarding checklist as the main experience

Success:

The user feels VAL has begun to understand their actual world, not merely connected their accounts.

## Journey 2: A Normal Morning

User state at start:

Opening VAL to understand what matters before the day takes over.

Executive question:

> What deserves my attention, what is changing, and what is already prepared?

Desired emotional state:

Clarity, orientation, and relief.

Path:

1. User opens home.
2. Chief of Staff gives one best next move.
3. Momentum names what is changing.
4. Ready For You shows only work where human judgment is required.
5. User opens Chief of Staff for the briefing.
6. VAL explains why, evidence, confidence, and opposing view.
7. VAL offers support it can provide now.
8. User accepts, completes, dismisses, or asks why.
9. The next recommendation rises when the current one is completed.

Recognition moment:

> Here is where I believe your attention belongs today.

VAL should show:

- Three-card home
- Recommendation
- Witness line
- Prepared work count
- Evidence drawer
- What VAL can do now
- Completion observation

VAL should not show:

- Six-card dashboard clutter
- Email counts
- Generic productivity stats
- Raw Round Table output
- Ten possible priorities

Success:

The user knows where to begin without feeling pushed, managed, or overloaded.

## Journey 3: Preparing For An Important Meeting

User state at start:

About to meet someone, unsure what matters most, or wanting to enter prepared.

Executive question:

> Who am I about to sit with, what matters about them, and how can this meeting create real movement?

Desired emotional state:

Preparedness.

Path:

1. User opens Calendar or clicks a meeting from another surface.
2. VAL shows one sentence orientation.
3. VAL resolves attendees against internal people, CRM, calendar, email, transcripts, projects, and known relationships.
4. VAL separates internal evidence, API enrichment, public sources, inference, and unknowns.
5. VAL shows meeting stakes and user role.
6. VAL prepares first five minutes.
7. VAL maps possible opportunities and introductions.
8. User reviews questions, sensitivities, and what to prepare.
9. After the meeting, VAL prompts for a tiny capture.
10. Follow-up candidates move into Ready For You only when human judgment is required.

Recognition moment:

> Here is what matters before you walk into this room.

VAL should show:

- Meeting purpose
- User role
- Meeting stakes
- Attendee intelligence
- Relationship context
- First five minutes
- Questions
- Opportunity/introduction map
- Anti-creep source handling
- Follow-up preparation

VAL should not show:

- Calendar agenda as the main value
- Creepy scraped facts
- Unsourced attendee claims
- Overly long meeting dossiers
- Actions without approval

Success:

The user enters the meeting feeling oriented to the people, stakes, and possible movement.

## Journey 4: Managing A Key Relationship

User state at start:

Thinking about a person who matters, preparing a response, or trying to understand what the relationship needs.

Executive question:

> Who is this person becoming in my world, and what does this relationship need now?

Desired emotional state:

Connection.

Path:

1. User opens People or clicks a person from Inbox, Calendar, Projects, CRM, or Chief of Staff.
2. VAL shows Thirty Second Truth.
3. User sees current season, relationship gravity, health, mutual value, and open loops.
4. VAL explains what changed since the last meaningful interaction.
5. User opens Context Drawer for evidence, history, related projects, conversations, and timeline.
6. User asks VAL a question or takes a relationship action.
7. Prepared drafts, follow-ups, CRM notes, or calendar actions become Ready For You or external action packets where appropriate.

Recognition moment:

> If I had thirty seconds to remind you about this person...

VAL should show:

- Living narrative
- Mutual value
- Current season
- What changed
- Invisible contributions
- Open loops
- Related projects
- Conversation state
- Evidence

VAL should not show:

- CRM field grids as primary experience
- Contact IDs
- Engagement scores without meaning
- Public facts that feel performative
- Generic AI biographies

Success:

The user remembers why the relationship matters and what stewardship requires.

## Journey 5: Building Something New

User state at start:

Ready to create, write, code, design, strategize, or make something real.

Executive question:

> What are we building together, and what context should shape it?

Desired emotional state:

Capable.

Path:

1. User opens Working Together or starts from a project/person/context surface.
2. VAL begins with current context, not a blank chatbot prompt.
3. User gives intent.
4. VAL classifies session state and creation authority.
5. VAL gathers relevant context from projects, people, transcripts, documents, CRM, calendar, and prior work.
6. VAL names what it understands and what it needs to ask before proceeding.
7. VAL works in milestones.
8. Prepared artifact is handed off to Ready For You when human judgment is required.
9. External action packets are created only when appropriate and approval-safe.

Recognition moment:

> I already have context. Here is what I am carrying into this with you.

VAL should show:

- Context gathered
- Active mode
- Creation authority
- Milestones
- Current activity
- Prepared work
- Work handoff
- Stop-and-ask moments

VAL should not show:

- "How can I help?"
- Generic brainstorming when production was requested
- Long voice responses
- External action ambiguity
- Work with no relationship to existing context

Success:

The user feels VAL can create with them, not merely answer them.

## Journey 6: Reviewing Prepared Work

User state at start:

VAL has done work while the user was living their life, and now judgment is needed.

Executive question:

> What can I finish because VAL already did the heavy lifting?

Desired emotional state:

Relief.

Path:

1. User opens Ready For You.
2. VAL shows up to three meaningful items, max five.
3. Each item explains why the user is seeing it and why now.
4. User opens Decision Workspace.
5. VAL shows what it prepared, what only the user can decide, risk, approval policy, and evidence.
6. User approves, rejects, edits, snoozes, or asks for revision.
7. If local approval creates an external action packet, VAL shows the packet clearly.
8. If execution happens in future execution-safe phases, receipt and reconciliation appear in the same trail.

Recognition moment:

> Three things are waiting on your judgment.

VAL should show:

- Human Judgment Required
- What VAL did
- What only the user can do
- Review time
- Representation risk
- Approval policy
- Receipt status
- Timeline

VAL should not show:

- All generated drafts
- Background work
- Low-confidence suggestions
- External actions hidden behind friendly buttons

Success:

The user can finish meaningful work without starting from zero or wondering what will happen next.

## Journey 7: Teaching VAL Something New

User state at start:

The user wants VAL to understand or behave differently.

Executive question:

> How do I shape VAL's understanding and behavior without becoming a prompt engineer?

Desired emotional state:

Agency.

Path:

1. User opens Teach VAL or VAL OS.
2. Teach VAL shows what VAL believes it understands.
3. User confirms, corrects, adds, retires, or marks context sensitive.
4. VAL records provenance and confidence.
5. In VAL OS, user creates behavior through: When this happens, VAL understands, so VAL will.
6. VAL applies specificity ladder: person > project > function > global.
7. VAL runs test cases before publishing behavior.
8. Behavior becomes configuration, not deployment.
9. Later screens reflect the changed understanding or behavior.

Recognition moment:

> Here is what I think I understand. Please correct me.

VAL should show:

- Confirmed understanding
- Corrections
- Misunderstandings
- Origin story
- Duration/review date
- Specificity ladder
- Test before publish
- Active behavior summary

VAL should not show:

- Raw prompt editing as the primary experience
- Deploy/restart language
- Ambiguous rules without tests
- Sensitive context as casual memory

Success:

The user feels they can teach VAL how to understand and support them.

## Journey 8: Inspecting What Happened

User state at start:

The user or builder needs to understand what VAL prepared, approved, executed, failed, or reconciled.

Executive question:

> What did VAL believe, what happened, and what remains unresolved?

Desired emotional state:

Trust through inspection.

Path:

1. User opens Developer or a receipt-aware detail surface.
2. VAL shows the packet or run summary.
3. User sees planned -> approved -> executed -> reconciled timeline where applicable.
4. VAL shows receipt, provider confirmation, safe provider link, and reconciliation events.
5. If failed, VAL explains retry eligibility.
6. User sees what can be done next without guessing.

Recognition moment:

> Here is what happened.

VAL should show:

- Packet
- Approval state
- Execution receipt
- Reconciliation events
- Retry eligibility
- Safe provider link
- Source refs
- Timeline

VAL should not show:

- Raw provider payloads
- Tokens
- Debug noise outside Developer
- A success state without provider confirmation

Success:

The user trusts the system because VAL can account for its actions.

## Cross-Journey Tests

Before implementation, every journey should pass these tests:

- Does the journey begin with recognition?
- Does the user know what matters before being asked to act?
- Does VAL prepare before asking for human judgment?
- Is the user's agency preserved?
- Are external actions approval-safe and receipt-aware?
- Are sources and confidence visible where trust requires them?
- Is the journey organized around experience rather than feature inventory?
- Does the user leave clearer, not busier?

## Phase 13 Journey Priority

1. First Day With VAL
2. A Normal Morning
3. Reviewing Prepared Work
4. Building Something New
5. Preparing For An Important Meeting
6. Managing A Key Relationship
7. Teaching VAL Something New
8. Inspecting What Happened

This order protects the product's emotional promise first, then expands into operational depth.
