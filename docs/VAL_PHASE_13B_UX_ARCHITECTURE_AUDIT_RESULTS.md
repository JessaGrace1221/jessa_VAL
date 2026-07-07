# VAL Phase 13B UX Architecture Audit Results

Purpose: evaluate the existing VAL UI surfaces against the Foundation before wireframes or visual redesign.

Status: ready for human review.

This audit follows [VAL_PHASE_13B_UX_ARCHITECTURE_AUDIT.md](./VAL_PHASE_13B_UX_ARCHITECTURE_AUDIT.md).

Post-review design philosophy amendment:

- [VAL_DESIGN_PHILOSOPHY.md](./VAL_DESIGN_PHILOSOPHY.md)
- [VAL_PHASE_13C_HOME_PRESENCE_BEHAVIORAL_CONSTITUTION.md](./VAL_PHASE_13C_HOME_PRESENCE_BEHAVIORAL_CONSTITUTION.md)

The audit remains valid, but the homepage recommendation has evolved: Home should be organized around three executive questions, not five equal primary experiences.

## Guardian Summary

The current product is powerful, but the interface still exposes too much operational machinery.

The Foundation is clear:

- VAL should begin with recognition before interaction.
- VAL should expose confidence, context, and reasoning, not raw intelligence plumbing.
- Primary experiences should create states of executive knowing.
- Supporting systems should explain, prepare, and act without becoming the product center.

The current UI already contains many correct primitives:

- Home briefing cards
- Prepared work / approval patterns
- Relationship and project understanding
- Transcript evidence and review
- External-action approval boundaries
- Teach VAL learning review
- VAL OS behavior governance

The main UX problem is structural:

> Too many destinations are implemented as modal workspaces or operational tools rather than coherent VAL lenses.

The next phase should not "polish the dashboard."

The next phase should turn Home into three living executive questions with supporting systems behind them.

Those questions are Velocity, Alignment, and Leverage.

## Screen Inventory

Inspected from `dashboard.html`, `command-center.js`, and registered server routes.

Primary visible navigation:

- Home
- Relationships
- Projects
- Evidence
- Transcripts
- Calendar
- Documents
- Executive Inbox
- Scrape Employers
- Scrape Partners
- Actions
- Drafts
- Teach VAL
- My VAL OS
- Dashboard Studio
- Templates
- API Keys & Connections
- Security & Privacy
- Settings

Additional UI surfaces:

- Homepage card workspaces
- Priority Review workspace
- Meeting Briefing workspace
- Contact Timeline workspace
- Opportunity Intelligence workspace
- Integration Status overlay
- API key modal
- Security Privacy workspace
- Dashboard Studio workspace
- Task detail panel
- Relationship profile overlay
- Transcript review queue
- Transcript intake status
- Transcript detail and transcript chat
- Email draft review panel
- Inbox command panel
- Lead / partner review tables
- Voice Chat / Meeting Mode entry points

## Audit Table

| Screen | Current Purpose | Executive Question | Recognition First? | Foundation Alignment | Executive Value | Recommendation | Notes |
|---|---|---|---|---:|---:|---|---|
| Home | Briefing and launch surface | Where should I place my attention? | partial | 8 | 9 | refine | Strongest existing VAL surface. Needs less brand-banner energy and clearer Chief of Staff recommendation hierarchy. |
| Homepage Card Workspace | Explain and act on briefing cards | Why this item, why now, what can I do? | yes | 8 | 9 | refine | Preserve as Decision Workspace pattern. Convert side content into Context Drawer model. |
| Relationships | Relationship review / radar | Who matters, and why? | partial | 7 | 9 | replace | Destination matters deeply, but current implementation risks becoming CRM and scoring. Needs People lens with Thirty Second Truth. |
| Relationship Profile | Detailed relationship context | What is true about this relationship now? | partial | 8 | 9 | refine | Good Understanding Card candidate. Reduce score emphasis and elevate current season, evidence, open loops. |
| Projects | Priority review / project proxy | What is this work becoming? | no | 5 | 8 | replace | Current route points to Priority Review. Needs dedicated Projects lens, not task/project management. |
| Evidence | Transcript attention proxy | What evidence changed my understanding? | partial | 6 | 7 | merge | Evidence is not a primary destination. Move into Context Drawer / Developer, with transcript review as supporting system. |
| Transcripts | Durable meeting archive and transcript review | What happened, what was decided, what needs review? | partial | 8 | 8 | refine | Valuable supporting system. Should not sit as primary experience. Keep as evidence/prep surface. |
| Transcript Detail | Notes, raw transcript, chat, processing debug | What should I know from this conversation? | partial | 7 | 8 | refine | Split user-facing Understanding from debug processing details. Debug belongs in Developer. |
| Transcript Review Queue | Approve uncertain extracted items | What needs my judgment before VAL trusts it? | yes | 9 | 9 | refine | Strong approval and agency surface. Preserve as Ready For You source. |
| Transcript Intake Status | Inspect storage and webhook intake | Where are transcript records landing? | no | 5 | 5 | move_to_developer | Operational diagnostics should not be in normal UX. |
| Calendar Sidebar | Upcoming schedule | Who am I about to sit with? | partial | 7 | 8 | refine | Useful persistent context, but should become preparedness surface, not agenda list. |
| Calendar Full View | List schedule by day | Who am I about to sit with? | no | 5 | 7 | replace | Needs Meeting Prep lens. Current view is agenda-first. |
| Calendar Event / Meeting Prep | Meeting intelligence and memory search | What matters before I walk into this room? | partial | 8 | 9 | refine | Preserve. Should become Calendar's core interaction. |
| Documents | Currently routes to chat | What knowledge or artifact should VAL understand or create? | no | 4 | 6 | replace | Destination exists in IA but not as coherent surface. Needs one of: Documents supporting system or remove from nav until real. |
| Working Together / General Chat | Conversational work surface | What are we building together? | partial | 7 | 8 | replace | Must stop feeling like ChatGPT. Needs context-carrying collaboration lens. |
| Executive Inbox | Triage, search, draft, rules | Which conversations deserve my attention? | partial | 8 | 9 | refine | Strong value. Reduce inbox-clone layout; lead with consequence and decision. |
| Inbox Command | Search/action over email | Which conversation am I looking for and why? | partial | 7 | 8 | refine | Useful command surface. Should be contextual, not the primary first impression. |
| Email Draft Panel | Prepare and approve replies | What has VAL prepared for my review? | yes | 9 | 9 | merge | Belongs in Ready For You / Decision Workspace. |
| Email Rules | Save communication behavior | How should VAL handle this in the future? | partial | 7 | 7 | merge | Move to VAL OS when it changes behavior. |
| Scrape Employers | Lead discovery | Which external opportunities deserve investigation? | partial | 6 | 7 | merge | Keep as Lead Intelligence supporting system. Rename away from "Scrape." |
| Scrape Partners | Partner discovery and CRM import | Which partner opportunities deserve investigation? | partial | 7 | 7 | merge | Same as Lead Intelligence. Strong approval flow, weak language. |
| Partner Review Table | Approve partner imports | Which leads are worth adding? | partial | 7 | 7 | refine | Useful, but table-heavy. Needs evidence, confidence, and approval clarity. |
| Opportunity Intelligence | Pipeline/opportunity prompts | Which hidden opportunity deserves attention? | partial | 7 | 8 | merge | Merge into Momentum or Projects depending source. |
| Actions / Task Board | Task list and calendarization | What commitments need honorable follow-through? | partial | 6 | 8 | replace | Tasks are supporting system, not primary. Reframe as Commitments. |
| Task Detail Panel | Notes, schedule, completion | What context helps me keep this promise? | partial | 6 | 7 | refine | Keep as supporting detail, but avoid task-manager energy. |
| Drafts | Internal drafts awaiting approval | What prepared work needs judgment? | yes | 8 | 9 | merge | Should become Ready For You, not separate Drafts. |
| Priority Review | Combined priorities, tasks, meetings, opportunities | Where should I place attention? | no | 5 | 7 | replace | This is old-dashboard thinking. Replace with Chief of Staff lens. |
| Ready For You | Implied through cards/drafts/review queues | What has VAL already prepared for me? | partial | 8 | 10 | replace | Essential primary experience, but not currently a real destination. Build it. |
| Momentum | Implied through homepage card | What is changing? | partial | 8 | 9 | replace | Essential primary experience, but currently a card only. Build it. |
| Teach VAL | Onboarding and source insight review | What should VAL understand about me? | partial | 8 | 9 | refine | Strong concept. Needs recognition header: what VAL believes it understands. |
| Source Insights | Scan email/calendar for facts, beliefs, behaviors | What did VAL infer and what needs approval? | yes | 9 | 8 | refine | Preserve. Good learning review pattern. |
| My VAL OS | Behavior governance, trust ledger, approvals | How should VAL behave? | partial | 9 | 9 | refine | Strong Foundation alignment. Needs calmer IA and less metric-grid density. |
| VAL OS Review Queue | Behavior-triggered prepared items | What behavior-created work needs review? | yes | 9 | 9 | merge | Feed Ready For You while preserving OS traceability. |
| Calendar Approval Queue | Calendar proposals before external changes | What needs approval before VAL touches calendar? | yes | 10 | 9 | refine | Excellent agency pattern. Preserve. |
| External Action Readiness / Executor | Action capability diagnostics | Can VAL act safely? | partial | 8 | 7 | move_to_developer | User-facing trust summary should remain; executor internals should move behind Developer. |
| Dashboard Studio | Request/approve dashboard changes | How can this VAL be adapted safely? | partial | 6 | 6 | move_to_settings | Valuable configuration/admin surface, not primary UX. |
| Templates | Manage templates | What reusable artifacts can VAL prepare? | partial | 6 | 6 | move_to_settings | Keep as Settings / Documents support, not nav primary. |
| API Keys & Connections | Tenant API key vault and setup health | What integrations govern VAL? | yes | 8 | 8 | move_to_settings | Strong settings surface. Keep out of primary nav. |
| Integration Status | Live diagnostics | What is connected or broken? | no | 5 | 6 | move_to_developer | User-friendly connection summary belongs in Settings; detailed diagnostics belong in Developer. |
| Security & Privacy | Data, sessions, audit, support access | What permissions and records govern VAL? | yes | 8 | 8 | refine | Keep in Settings. Reduce table density for normal users; keep audit detail available. |
| Settings | Currently points to API keys | What governs this account? | no | 5 | 6 | replace | Needs true Settings hub. |
| Developer / Debug Routes | Observer, round table, debug, migration routes | What did VAL observe, decide, execute, or fail? | no | 8 | 7 | move_to_developer | Necessary for trust through inspection, but should not leak into primary UX. |
| Login / Password Setup | Authentication | How do I securely enter VAL? | yes | 8 | 8 | keep | Operationally necessary. Outside main UX audit scope. |
| Michele Book Home | Client-specific book companion home | What is the next gentle book step? | yes | 8 | 8 | refine | Good specialized VAL mode. Preserve as custom project lens, not core IA. |

## Screens To Preserve Or Refine

- Home
- Homepage Card Workspace
- Relationship Profile
- Transcripts
- Transcript Review Queue
- Calendar Event / Meeting Prep
- Executive Inbox
- Inbox Command
- Partner Review Table
- Task Detail Panel
- Teach VAL
- Source Insights
- My VAL OS
- Calendar Approval Queue
- Security & Privacy
- Michele Book Home

## Screens To Merge

- Evidence -> Context Drawer / Developer
- Email Draft Panel -> Ready For You
- Email Rules -> VAL OS
- Scrape Employers -> Lead Intelligence
- Scrape Partners -> Lead Intelligence
- Opportunity Intelligence -> Momentum or Projects
- Drafts -> Ready For You
- VAL OS Review Queue -> Ready For You with OS source context
- Templates -> Settings / Documents

## Screens To Replace

- Relationships -> People lens
- Projects -> Projects lens
- Calendar Full View -> Calendar / Meeting Prep lens
- Documents -> Documents supporting system
- Working Together / General Chat -> Working Together lens
- Actions / Task Board -> Commitments supporting system
- Priority Review -> Chief of Staff lens
- Ready For You -> build real primary destination
- Momentum -> build real primary destination
- Settings -> Settings hub

## Screens To Move To Context Drawer

- Evidence snippets attached to homepage cards
- Relationship source evidence
- Project source evidence
- Transcript source references when used by another lens
- Email raw body preview when the executive decision is already summarized
- Timeline/history sections that explain why VAL believes something

## Screens To Move To Developer

- Transcript Intake Status
- Integration Status detail
- Raw webhook setup/debug detail
- Processing details inside Transcript Detail
- External Action executor internals
- Observer and Round Table run inspection
- Migration/debug/admin operational routes

## Screens To Move To Settings

- API Keys & Connections
- Security & Privacy
- Dashboard Studio
- Templates
- OAuth connection management
- Setup Health summary

## Screens To Delete Or Hide From Primary UX

- Priority Review as a standalone destination
- Evidence as a top-level daily destination
- Documents nav item until the Documents surface is real
- "Scrape Employers" and "Scrape Partners" labels
- Generic Settings route that only opens API keys

Do not delete the underlying capabilities yet.

The deletion recommendation is about daily product shape, not backend removal.

## Human Review Required

The following decisions should be reviewed before wireframes:

1. Should Home be organized around the three executive questions:
   - Velocity: What changed?
   - Alignment: What deserves my attention?
   - Leverage: What has already been prepared?

2. Should Calendar remain visible in primary navigation or become a supporting system surfaced through Chief of Staff and People?

3. Should Transcripts remain visible as a supporting nav item, or move fully behind Evidence / Context / Developer?

4. Should Lead Intelligence exist in the daily VAL product for all tenants, or only in GOALL-style deployments?

5. Should Dashboard Studio remain accessible to normal client users, or only to owner/admin roles?

6. Should Documents be built now, or hidden until it has a true recognition-first surface?

7. Should Tasks be renamed to Commitments everywhere before visual redesign?

## Reusable Components Identified

These components already exist in partial form and should become formal UI primitives:

- Recognition Header
- Briefing Card
- Decision Workspace
- Understanding Card
- Prepared Work Card
- Approval Queue Item
- Source Confidence Badge
- Context Drawer
- Timeline Component
- Trust Ledger
- Receipt Badge
- Relationship Chip
- Calendar Prep Card
- Empty State
- Settings Status Card
- Developer Diagnostic Row

## Missing Components Needed

- Global Context Drawer
- Lens Header with executive question
- Chief of Staff Recommendation Block
- Thirty Second Truth component
- What Changed strip
- What Only You Can Decide block
- Prepared Work queue shell
- Confidence and Unknowns component
- Approval Policy badge
- External Action Receipt timeline
- Human Review Gate banner
- Supporting System layout shell
- Developer Mode boundary marker

## Recommended IA After Audit

Homepage executive questions:

- Velocity
- Alignment
- Leverage

Supporting systems:

- People
- Projects
- Calendar
- Executive Inbox
- Working Together
- Commitments
- Documents
- Lead Intelligence
- Teach VAL
- VAL OS
- Settings
- Developer

Hidden or role-gated systems:

- Dashboard Studio
- Templates
- API Keys
- Security audit detail
- Integration diagnostics
- Transcript intake diagnostics

## Next Step

Pause for human review.

After review, Phase 13C should produce wireframes for:

1. Home as Velocity / Alignment / Leverage
2. Living card states: resting, attentive, inviting
3. People supporting destination
4. Projects supporting destination
5. Global Context Drawer
6. Supporting navigation shell
7. Settings / Developer boundary

Do not begin visual implementation until the recommendations above are accepted or amended.
