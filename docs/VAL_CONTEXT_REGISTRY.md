# VAL Context Registry v1

Purpose: define the internal variables, context objects, update rules, and prompt packets VAL should use so every function can notice, remember, decide, and prepare with evidence.

This is a product and prompt architecture spec. It does not mean every variable is already wired in code. Each field is marked as:

- `existing`: available in the current codebase or data stores.
- `derived`: can be computed from existing sources.
- `new`: should be added as a first-class field/store.

## Core Principles

1. VAL does not guess from the current item alone.
2. VAL reads durable Teach VAL context, current state, recent evidence, and source-specific data.
3. VAL writes observations before durable memory.
4. VAL appends source-backed context instead of overwriting history.
5. VAL promotes repeated or user-confirmed observations into durable memory.
6. VAL prepares actions, drafts, and recommendations, but external actions require approval unless the user has explicitly created a safe rule.
7. Every meaningful update must include source, quote or summary, confidence, timestamp, and scope.

## Update Operations

| Operation | Meaning | Allowed when | Example |
|---|---|---|---|
| `append` | Add new source-backed context without deleting prior context. | New evidence adds detail. | Add email fact to relationship context. |
| `link` | Attach evidence to a person, project, task, relationship, or decision. | Entity match is reliable enough. | Link transcript quote to project blocker. |
| `promote` | Turn repeated or confirmed observations into durable memory. | Repeated signal or user confirmation. | Heat repeatedly impairs focus. |
| `replace` | Correct stale or false context. | User corrects VAL or stronger evidence exists. | Update project status from "proposal" to "signed". |
| `deprecate` | Mark old context no longer current without deleting it. | Context is stale but historically useful. | Old priority no longer active. |
| `escalate` | Move item into a higher-priority queue. | Risk, leverage, urgency, or capacity impact warrants it. | Mark AC purchase highest leverage. |
| `expire` | Automatically age out temporary state. | Context is situational. | Heatwave capacity state expires after weather changes. |
| `reject` | Preserve a rejected suggestion so VAL learns not to repeat it. | User dismisses/corrects a recommendation. | User says a person is not important. |

## Required Update Envelope

Every Intelligence Pass output that updates context should use this shape:

```json
{
  "target": "user.current_capacity_context",
  "operation": "append",
  "value": "Heat is making focused work difficult.",
  "source_type": "transcript",
  "source_id": "tr_123",
  "source_quote": "It is hard to focus in this heat.",
  "confidence": 0.93,
  "scope": "current_state",
  "expires_at": "2026-07-10T00:00:00.000Z",
  "why_this_matters": "This affects every high-cognition task today."
}
```

## Namespace Overview

| Namespace | Purpose | Status |
|---|---|---|
| `event` | The thing that just happened. | new |
| `witness` | Plain observations of what actually happened, before judgment. | new |
| `relevance` | Global Executive Relevance Engine decisions about cognitive space. | new |
| `teach_val` | Root durable profile from Teach VAL. | existing/derived |
| `user` | Identity, preferences, capacity, energy, decision rules. | existing/new |
| `important_people` | People the user or VAL has identified as important. | derived/new |
| `person_packets` | Living source-backed packets for every meaningful person or new relationship VAL notices. | new |
| `projects` | Active projects, blockers, current truth, momentum. | derived/new |
| `relationships` | Person/org/project relationship memory and status. | existing/derived |
| `emails` | Current email, thread, sent mail, inbox classification. | existing |
| `transcripts` | Transcript text, summaries, participants, tasks, emotional context. | existing/derived |
| `calendar` | Today, upcoming events, pressure, attendees. | existing/derived |
| `tasks` | Open, overdue, contextualized tasks. | existing/derived |
| `crm` | GHL contacts, opportunities, notes, tasks, conversations. | existing |
| `environment` | Weather, physical setting, external constraints. | new |
| `evidence` | Source-backed observations and links. | existing |
| `priority` | Highest leverage, high priority queue, risk/leverage/urgency. | new/derived |
| `drafts` | Prepared replies, follow-ups, recaps, approval drafts. | existing |
| `rules` | VIP, ignored, automation, user-approved rules. | existing/derived |
| `val` | VAL's own confidence, uncertainty, safety gates, do-not-do list. | new/derived |

## Event Variables

`event` is the input to the Master Event Intelligence Pass.

| Label | Variable | Status | Type | Updated by | Notes |
|---|---|---|---|---|---|
| Event ID | `{{event.id}}` | new | string | event capture | Stable internal ID. |
| Event type | `{{event.type}}` | new | enum | event capture | `email_received`, `email_sent`, `transcript_received`, `chat_message`, `voice_session`, `calendar_event_created`, `ghl_update`, `task_changed`, `draft_created`, `user_correction`. |
| Event source | `{{event.source}}` | new | string | event capture | `gmail`, `outlook`, `krisp`, `google_calendar`, `ghl`, `val_chat`, etc. |
| Occurred at | `{{event.occurred_at}}` | new | datetime | event capture | When it happened in source system. |
| Captured at | `{{event.captured_at}}` | existing/new | datetime | VAL | When VAL saw it. |
| Raw payload | `{{event.raw}}` | new | object | event capture | Should not be sent to every prompt. |
| Event summary | `{{event.summary}}` | derived | string | Intelligence Pass | Compact description. |
| Event importance | `{{event.importance_hint}}` | new | enum | triage pass | `ignore`, `store`, `analyze`, `deep_analyze`, `prepare_action`. |
| Source quote | `{{event.source_quote}}` | derived | string | event parser | Best quote for grounding. |

## Witness Variables

Witness variables are produced before observers or Round Tables interpret meaning.

| Label | Variable | Status | Type | Updated by | Notes |
|---|---|---|---|---|---|
| Witness ID | `{{witness.id}}` | new | string | Witness layer | Stable observation record. |
| Source event ID | `{{witness.event_id}}` | new | string | Witness layer | Links to the source event. |
| What happened | `{{witness.observed}}` | new | array | Witness layer | Plain facts only. |
| Actors | `{{witness.actors}}` | new | array | Witness layer | People/orgs involved. |
| Objects | `{{witness.objects}}` | new | array | Witness layer | Documents, projects, meetings, tasks, attachments. |
| Time references | `{{witness.time_refs}}` | new | array | Witness layer | Dates, deadlines, meeting times. |
| Source refs | `{{witness.source_refs}}` | new | array | Witness layer | Evidence receipts for each observation. |
| Confidence | `{{witness.confidence}}` | new | number | Witness layer | Accuracy of the observation, not importance. |

## Executive Relevance Variables

Relevance variables decide whether a source earns cognitive space before any card, drawer, packet, or chat can use it.

| Label | Variable | Status | Type | Updated by | Notes |
|---|---|---|---|---|---|
| Relevance ID | `{{relevance.id}}` | new | string | Executive Relevance Engine | Stable decision record. |
| Source event ID | `{{relevance.event_id}}` | new | string | Executive Relevance Engine | Links to source and witness. |
| Relevance state | `{{relevance.state}}` | new | enum | Executive Relevance Engine | `discard_noise`, `store_evidence_only`, `quiet_context`, `contact_only`, `relationship_eligible`, `project_eligible`, `executive_attention`, `prepared_work_eligible`, `suppressed`. |
| Allowed consumers | `{{relevance.allowed_consumers}}` | new | array | Executive Relevance Engine | Which systems may use it. |
| Blocked consumers | `{{relevance.blocked_consumers}}` | new | array | Executive Relevance Engine | Which systems must not use it. |
| Admission rule | `{{relevance.rule}}` | new | string | Executive Relevance Engine | Rule that admitted or blocked it. |
| Reason | `{{relevance.reason}}` | new | string | Executive Relevance Engine | Plain-English explanation. |
| Cost if ignored | `{{relevance.cost_if_ignored}}` | new | string | Executive Relevance Engine | Consequence, if any. |
| Suppression key | `{{relevance.suppression_key}}` | new | string | Executive Relevance Engine | Sender/domain/source/person/project suppression key. |
| Source refs | `{{relevance.source_refs}}` | new | array | Executive Relevance Engine | Evidence behind the decision. |

## Teach VAL Variables

Teach VAL is the root durable context. Existing sources include `teach_val_onboarding_sessions.state_json`, `teach_val_memory_items`, `val_memory_items` with `teach_val_*` kinds, and `evidence_items.source_type = teach_val_onboarding`.

Dedicated onboarding prompt suite:

- [VAL_ONBOARDING_FIRST_UNDERSTANDING_PROMPTS.md](./VAL_ONBOARDING_FIRST_UNDERSTANDING_PROMPTS.md)

| Label | Variable | Status | Type | Updated by | Recommended use |
|---|---|---|---|---|---|
| Executive profile | `{{teach_val.executive_profile}}` | existing/derived | object | Teach VAL voice/interview/import | Understand who the user is. |
| Company context | `{{teach_val.company_context}}` | existing/derived | object | Teach VAL | Understand business context. |
| Current projects | `{{teach_val.current_projects}}` | existing/derived | array | Teach VAL | Seed `projects.active`. |
| Important people | `{{teach_val.important_people}}` | existing/derived | array | Teach VAL | Seed `important_people.list`. |
| Lessons learned | `{{teach_val.lessons_learned}}` | existing/derived | array | Teach VAL | Avoid repeating known mistakes. |
| Work preferences | `{{teach_val.work_preferences}}` | existing/derived | array | Teach VAL | Guide tone, cadence, assistance style. |
| Frustrations | `{{teach_val.frustrations}}` | existing/derived | array | Teach VAL | Spot recurring drains. |
| Process gaps | `{{teach_val.process_gaps}}` | existing/derived | array | Teach VAL | Identify system-level fixes. |
| Opportunities | `{{teach_val.opportunities}}` | existing/derived | array | Teach VAL | Match new signals to strategic opportunity. |
| Things to remember | `{{teach_val.things_to_remember}}` | existing/derived | array | Teach VAL | Durable memory feed. |
| Raw voice interview | `{{teach_val.voice_interview.transcript}}` | existing | string | Teach VAL | Use only in deep context rebuilds. |
| Voice interview summary | `{{teach_val.voice_interview.summary}}` | existing | object | Teach VAL summarizer | Compact user profile. |
| Reviewed memory items | `{{teach_val.reviewed_memory}}` | existing/derived | array | Teach VAL commit | User-reviewed durable entries. |
| Source imports | `{{teach_val.context_imports}}` | existing | array | Teach VAL import cards | Preserve provenance. |
| Connected source readiness | `{{onboarding.connected_source_readiness}}` | new/derived | object | Evidence Source Readiness Prompt | Which evidence sources are connected, usable, limited, or skipped. |
| AI history import | `{{onboarding.ai_history_import}}` | new/derived | object | AI History Import Prompt | ChatGPT/Claude/other AI recurring themes, people, projects, preferences, and conflicts. |
| Round Table reading state | `{{onboarding.round_table_reading_state}}` | new/derived | array | Onboarding UI/orchestrator | Observer reading messages instead of a generic spinner. |
| Onboarding observer outputs | `{{onboarding.observer_outputs}}` | new/derived | array | Onboarding Observer Pass | Observer introductions, noticed patterns, uncertainty, confidence, questions. |
| First understanding | `{{onboarding.first_understanding}}` | new/derived | object | First Understanding Synthesis Prompt | What VAL thinks it understands so far and what it does not know. |
| Confirmation cards | `{{onboarding.confirmation_cards}}` | new/derived | array | Confirmation UX Prompt | Agree/disagree/unsure/edit/tell more cards. |
| Onboarding memory promotion | `{{onboarding.memory_promotion}}` | new/derived | object | Onboarding Memory Promotion Prompt | What becomes memory, observation, needs evidence, or is discarded. |
| Onboarding completion | `{{onboarding.completion}}` | new/derived | object | Onboarding Completion Prompt | Humble readiness message and next step. |

## User Variables

| Label | Variable | Status | Type | Updated by | Recommended use |
|---|---|---|---|---|---|
| User ID | `{{user.id}}` | existing | string | auth | Audit/linking only. |
| User name | `{{user.name}}` | existing | string | auth/config | Draft signature and direct address. |
| User email | `{{user.email}}` | existing | string | auth | Owner identity. |
| VAL name | `{{user.val_name}}` | existing | string | Baby VAL Studio | Voice/brand identity. |
| About user | `{{user.about_me}}` | existing | string | Baby VAL Studio | Personal context. |
| Preferred tone | `{{user.preferred_tone}}` | existing | string | Baby VAL Studio/Teach VAL | Drafting and chat style. |
| Simple instructions | `{{user.simple_instructions}}` | existing | string | Baby VAL Studio | Global behavior guidance. |
| Communication style | `{{user.communication_style}}` | new/derived | object | Teach VAL, user corrections, draft approvals | Make drafts sound human. |
| Decision style | `{{user.decision_style}}` | new/derived | object | Teach VAL, chat, approvals | Decide how to prioritize. |
| Do-not-sound-like | `{{user.do_not_sound_like}}` | new | array | user corrections, rejected drafts | Avoid robotic drafts. |
| Do-not-do | `{{user.do_not_do}}` | new | array | Teach VAL, corrections | Safety and preference constraints. |
| Current capacity context | `{{user.current_capacity_context}}` | new | object | Intelligence Pass | Adjust priorities to real bandwidth. |
| Energy patterns | `{{user.energy_patterns}}` | new | object | Teach VAL, transcripts, chat, calendar/task patterns | Know what drains or restores the user. |
| Current focus | `{{user.current_focus}}` | new | object | recent chat/transcripts/tasks/projects | Know what is alive now. |
| Current cognitive load | `{{user.cognitive_load}}` | new | object | calendar density, overdue tasks, transcript/chat signals | Avoid overloading user. |
| Somatic context | `{{user.somatic_context}}` | new | object | user mentions, voice/transcripts, environment | Heat, fatigue, illness, sleep, sensory overload. |
| Irritants | `{{user.irritants}}` | new | array | repeated mentions/corrections | Spot small drains. |
| Relief signals | `{{user.relief_signals}}` | new | array | user feedback, chat, transcript signals | Notice what creates calm or frisson. |
| Priority rules | `{{user.priority_rules}}` | new/derived | array | Teach VAL, corrections, decisions | Define what counts as high priority. |
| Approval preferences | `{{user.approval_preferences}}` | new/derived | object | rules, user decisions | Know what can be prepared vs executed. |
| Calendar booking link | `{{user.calendar_booking_link}}` | new | string | Teach VAL onboarding, user settings, scheduling draft correction | Include as fallback in scheduling replies when suggested times do not work. |
| Calendar booking confirmation owner | `{{user.calendar_booking_confirmation_owner}}` | new | enum | Teach VAL onboarding, user settings | V1 default: CRM/calendar system sends booking confirmations; VAL should not send duplicate personal confirmation emails for calendar-link bookings. |

## Important People Variables

The system should store each person separately, expose lists for matching, and expose `current` for focused prompts.

| Label | Variable | Status | Type | Updated by | Recommended use |
|---|---|---|---|---|---|
| Important people list | `{{important_people.list}}` | derived/new | array | Teach VAL, relationship review, user marks VIP | Broad matching. |
| By ID | `{{important_people.by_id}}` | new | object | context indexer | Direct lookup. |
| By email | `{{important_people.by_email}}` | new | object | context indexer | Email matching. |
| By slug | `{{important_people.by_slug}}` | new | object | context indexer | Internal prompt lookup. |
| Current matched person | `{{important_people.current}}` | derived | object | event resolver | Focused decision context. |
| Match result | `{{important_people.match}}` | derived | object | event resolver | Explain why a person matched. |
| VIP people | `{{important_people.vip}}` | derived/new | array | rules, relationship preferences | Priority boost. |
| Watched people | `{{important_people.watched}}` | new/derived | array | user/VAL OS | Relationship radar. |
| Ignored people | `{{important_people.ignored}}` | derived/new | array | rules, user decisions | Lower priority. |
| User-important people | `{{important_people.user_marked_important}}` | new/derived | array | user decision | Manual promotion into important relationship context. |
| Suppressed senders | `{{important_people.suppressed_senders}}` | new/derived | array | user decision | Never show emails from these senders unless reversed. |

Person object shape:

```json
{
  "id": "person_123",
  "slug": "marcus_chen",
  "name": "Marcus Chen",
  "email": "marcus@atlasops.com",
  "company": "Atlas Ops",
  "why_they_matter": "Decision-maker for active pilot.",
  "priority_level": "high",
  "relationship_status": "active",
  "source": "teach_val",
  "confidence": 0.9
}
```

## Person Packet Variables

Person packets are the durable relationship intake layer for Stewardship. They are created during onboarding from connected source review and updated continuously as new relationships appear.

A person packet should hold who the person is, what they need, and what they offer. It should not permanently decide who needs them or who they need. Those are Stewardship matching decisions made by comparing packets later.

Dedicated Stewardship packet spec:

- [VAL_STEWARDSHIP_ROUND_TABLE_AND_PACKETS.md](./VAL_STEWARDSHIP_ROUND_TABLE_AND_PACKETS.md)

| Label | Variable | Status | Type | Updated by | Recommended use |
|---|---|---|---|---|---|
| Person packet list | `{{person_packets.list}}` | new | array | onboarding scan, relationship intake, source indexer | Broad matching across the network. |
| By person ID | `{{person_packets.by_person_id}}` | new | object | context indexer | Direct packet lookup. |
| By email | `{{person_packets.by_email}}` | new | object | email/contact resolver | Create or update packets from inbox, sent, and CC'd mail. |
| Current person packet | `{{person_packets.current}}` | new/derived | object | event resolver | Focused Stewardship and meeting prep context. |
| Who this person is | `{{person_packets.current.who_this_person_is}}` | new | object | person packet builder | Identity, role, relationship to user, current context. |
| What this person needs | `{{person_packets.current.what_this_person_needs}}` | new | array | person packet builder, source review | Needs, gaps, asks, open loops, and current support opportunities. |
| What this person offers | `{{person_packets.current.what_this_person_offers}}` | new | array | person packet builder, source review | Expertise, access, credibility, network, services, perspective, resources. |
| Relationship origin | `{{person_packets.current.relationship_origin}}` | new | object | onboarding scan, event intake | First meaningful signal and provenance. |
| Packet maturity | `{{person_packets.current.packet_state.maturity}}` | new | enum | packet builder | `thin`, `developing`, `usable`, or `strong`. Thin packets are allowed. |
| Last meaningful signal | `{{person_packets.current.relationship_state.last_meaningful_signal_at}}` | new | datetime | source intake | Freshness for Stewardship timing. |
| Missing variables | `{{person_packets.current.packet_state.missing_variables}}` | new | array | packet builder | What VAL does not know yet. |
| Packet evidence | `{{person_packets.current.evidence}}` | new | object | evidence linker | Source receipts from email, sent mail, CCs, transcripts, calendar, projects, documents, CRM, and user confirmations. |
| New relationship candidates | `{{person_packets.new_relationship_candidates}}` | new | array | email/calendar/transcript/contact intake | People who may need a new packet or identity review. |
| Stewardship match candidates | `{{person_packets.match_candidates}}` | new/derived | array | Stewardship Round Table | Candidate comparisons between needs and offers. |

Person packet creation rules:

1. Create packets during onboarding from roughly 90 days of inbox, sent, and CC'd email when source access is connected.
2. Continue creating packets after onboarding whenever a meaningful new relationship signal appears.
3. Do not discard thin packets. Mark them as thin, source them, and let meaning accumulate.
4. Do not confuse active Executive Inbox eligibility with relationship evidence eligibility.
5. Do not make importance final too early. New relationships often become important after more context arrives.

## Project Variables

Dedicated understanding prompt suite:

- [VAL_RELATIONSHIP_PROJECT_UNDERSTANDING_PROMPTS.md](./VAL_RELATIONSHIP_PROJECT_UNDERSTANDING_PROMPTS.md)

| Label | Variable | Status | Type | Updated by | Recommended use |
|---|---|---|---|---|---|
| Active projects | `{{projects.active}}` | derived/new | array | Teach VAL, transcripts, CRM, chat | Match events to work that matters. |
| Project list | `{{projects.list}}` | derived/new | array | context indexer | Broad scanning. |
| Current project | `{{projects.current}}` | derived | object | event resolver | Focused project context. |
| By ID | `{{projects.by_id}}` | new | object | context indexer | Direct lookup. |
| By slug | `{{projects.by_slug}}` | new | object | context indexer | Internal prompt lookup. |
| Project current truth | `{{projects.current.current_truth}}` | new | string | Intelligence Pass | Best current statement of reality. |
| Project blockers | `{{projects.current.blockers}}` | new/derived | array | transcripts, email, tasks, CRM | Highest leverage and meeting prep. |
| Project momentum | `{{projects.current.momentum}}` | new/derived | array | transcripts, email, CRM | Identify leverage. |
| Project risks | `{{projects.current.risks}}` | existing/derived | array | relationship profiles/evidence | Escalation. |
| Project opportunities | `{{projects.current.opportunities}}` | existing/derived | array | relationship profiles/evidence/CRM | Opportunity detection. |
| Project open loops | `{{projects.current.open_loops}}` | existing/derived | array | tasks/evidence | Task prioritization. |
| Related people | `{{projects.current.people}}` | derived/new | array | evidence/CRM/Teach VAL | Relationship-aware drafting. |
| Project thirty-second truth | `{{projects.current.thirty_second_truth}}` | new/derived | string | Understanding prompts | Fast re-entry into what matters. |
| Project one-sentence understanding | `{{projects.current.one_sentence_understanding}}` | new/derived | string | Understanding prompts | Current project truth in one sentence. |
| Project why it exists | `{{projects.current.why_it_exists}}` | new/derived | string | Understanding prompts | Purpose and meaning. |
| Project biggest unknown | `{{projects.current.biggest_unknown}}` | new/derived | string | Understanding prompts | Clarify what remains unresolved. |
| Relationships moving project | `{{projects.current.relationships_moving_it}}` | new/derived | array | Understanding prompts | People creating movement. |
| Project decisions waiting | `{{projects.current.decisions_waiting}}` | new/derived | array | Understanding prompts | Decisions blocking progress. |
| Project current season | `{{projects.current.current_season}}` | new/derived | object | Current Season Prompt | Current phase/pattern/posture of the work. |
| Project surprise | `{{projects.current.what_might_surprise_you}}` | new/derived | string | Surprise Observer | Recognition-worthy pattern the user may not have noticed. |
| Project invisible contributions | `{{projects.current.invisible_contributions}}` | new/derived | array | Invisible Contributions Prompt | Quiet influence of the project on life/work/direction. |
| Project becoming | `{{projects.current.becoming}}` | new/derived | string | Becoming Observer | What the work is turning into. |
| Project living narrative | `{{projects.current.living_narrative}}` | new/derived | string | Living Narrative Prompt | Meaning-organized project story. |
| Project meaning timeline | `{{projects.current.meaning_timeline}}` | new/derived | object | Meaning Timeline Prompt | Beginning, purpose, turning points, current season, open future. |
| Project stewardship | `{{projects.current.stewardship}}` | new/derived | object | Stewardship Observer | Responsibility in helping the project flourish. |

## Relationship Variables

Existing sources include `relationship_profiles`, `relationship_timeline_events`, `evidence_observations`, tasks, transcripts, drafts, memory, GHL notes, and calendar events.

Dedicated understanding prompt suite:

- [VAL_RELATIONSHIP_PROJECT_UNDERSTANDING_PROMPTS.md](./VAL_RELATIONSHIP_PROJECT_UNDERSTANDING_PROMPTS.md)

| Label | Variable | Status | Type | Updated by | Recommended use |
|---|---|---|---|---|---|
| Current relationship | `{{relationships.current}}` | derived | object | event resolver | Focused prompt context. |
| Relationship list | `{{relationships.list}}` | existing/derived | array | relationship profiles | Broad scanning. |
| By ID | `{{relationships.by_id}}` | new | object | context indexer | Direct lookup. |
| By person email | `{{relationships.by_email}}` | new | object | context indexer | Email matching. |
| Display name | `{{relationships.current.display_name}}` | existing | string | relationship profile | Human-readable. |
| Status | `{{relationships.current.status}}` | existing | string | profile recalculation | Relationship health. |
| Context | `{{relationships.current.context}}` | new/derived | string/object | Intelligence Pass | Rich relationship memory. |
| Context append target | `{{relationships.current.context_append}}` | new | write target | Intelligence Pass | Append without replacing. |
| Summary | `{{relationships.current.summary}}` | existing | string | relationship profile | Fast context. |
| Last observed | `{{relationships.current.last_observed_at}}` | existing | datetime | relationship profile | Freshness. |
| Open loops | `{{relationships.current.open_loops}}` | existing | array | profile/timeline/tasks | Follow-up. |
| Pressure points | `{{relationships.current.pressure_points}}` | new/derived | array | risks, open loops, emotional context | Priority and tone. |
| Preferences | `{{relationships.current.preferences}}` | existing/derived | array | profile/memory | Drafting and meeting prep. |
| Risks | `{{relationships.current.risks}}` | existing | array | profile | Careful escalation. |
| Opportunities | `{{relationships.current.opportunities}}` | existing | array | profile | Leverage detection. |
| Emotional context | `{{relationships.current.emotional_context}}` | existing/derived | array | profile/transcripts | Human tone. |
| Tone history | `{{relationships.current.tone_history}}` | new/derived | array | sent emails/drafts | Natural drafts. |
| Current thread history | `{{relationships.current.current_thread_history}}` | new | array | email thread fetch | Contextual replies. |
| If ignored | `{{relationships.current.if_ignored}}` | new/derived | string | Intelligence Pass | Priority explanation. |
| Relationship thirty-second truth | `{{relationships.current.thirty_second_truth}}` | new/derived | string | Understanding prompts | Fast re-entry into why this person matters. |
| Relationship one-sentence understanding | `{{relationships.current.one_sentence_understanding}}` | new/derived | string | Understanding prompts | Current truth of the relationship. |
| Relationship current state | `{{relationships.current.current_state}}` | new/derived | object | Understanding prompts | Temperature, lifecycle, health, trust, strategic importance. |
| Relationship what changed | `{{relationships.current.what_changed}}` | new/derived | array | Understanding prompts | Meaningful changes since last touch. |
| Relationship current season | `{{relationships.current.current_season}}` | new/derived | object | Current Season Prompt | Present phase/pattern/posture of the relationship. |
| Relationship gravity | `{{relationships.current.gravity}}` | new/derived | enum | Relationship Gravity Prompt | How much the person shapes the user's thinking and future. |
| Relationship surprise | `{{relationships.current.what_might_surprise_you}}` | new/derived | string | Surprise Observer | Recognition-worthy pattern the user may not have noticed. |
| Relationship invisible contributions | `{{relationships.current.invisible_contributions}}` | new/derived | array | Invisible Contributions Prompt | Quiet influence on the user's work, thinking, courage, or direction. |
| Why relationship matters | `{{relationships.current.why_this_matters}}` | new/derived | string | Understanding prompts | Human/contextual importance. |
| Relationship active threads | `{{relationships.current.active_threads}}` | new/derived | array | Active Threads Prompt | Projects, intros, decisions, open loops, themes. |
| Relationship mutual value | `{{relationships.current.mutual_value}}` | new/derived | object | Mutual Value Prompt | Reciprocal value without making the person transactional. |
| Relationship becoming | `{{relationships.current.becoming}}` | new/derived | string | Becoming Observer | What this person is becoming in the user's world. |
| Relationship living narrative | `{{relationships.current.living_narrative}}` | new/derived | string | Living Narrative Prompt | Meaning-organized relationship story. |
| Relationship meaning timeline | `{{relationships.current.meaning_timeline}}` | new/derived | object | Meaning Timeline Prompt | Beginning, trust, breakthroughs, current season, open future. |
| Relationship stewardship | `{{relationships.current.stewardship}}` | new/derived | object | Stewardship Observer | Responsibility in helping the relationship flourish. |
| Truth to remember | `{{relationships.current.truth_to_remember}}` | new/derived | string | Witness Observer | The one truth the user should not forget. |

## Email Variables

Dedicated classification prompt suite:

- [VAL_EXECUTIVE_INBOX_CLASSIFICATION_PROMPTS.md](./VAL_EXECUTIVE_INBOX_CLASSIFICATION_PROMPTS.md)

| Label | Variable | Status | Type | Updated by | Recommended use |
|---|---|---|---|---|---|
| Current email | `{{emails.current}}` | existing/derived | object | Gmail/Outlook event | Executive Inbox prompts. |
| Provider | `{{emails.current.provider}}` | existing | string | Gmail/Outlook | Routing. |
| Message ID | `{{emails.current.message_id}}` | existing | string | Gmail/Outlook | Evidence/linking. |
| Thread ID | `{{emails.current.thread_id}}` | existing | string | Gmail/Outlook | Thread grouping. |
| Subject | `{{emails.current.subject}}` | existing | string | Gmail/Outlook | Drafting/classification. |
| From | `{{emails.current.from}}` | existing | object | Gmail/Outlook | Sender matching. |
| To | `{{emails.current.to}}` | existing | array | Gmail/Outlook | Recipient awareness. |
| CC | `{{emails.current.cc}}` | existing | array | Gmail/Outlook | Stakeholders. |
| BCC | `{{emails.current.bcc}}` | new/derived | array | Gmail/Outlook sent mail | Relationship evidence when user sent to a human/contact-like recipient; system/archive destinations should be filtered. |
| Recipient channels | `{{emails.current.recipient_channels}}` | new/derived | object | email recipient resolver | Normalized To/CC/BCC participants and whether each is human, system, CRM/archive, alias, or unknown. |
| Date | `{{emails.current.date}}` | existing | datetime | Gmail/Outlook | Freshness. |
| Snippet | `{{emails.current.snippet}}` | existing | string | Gmail/Outlook | Fast preview. |
| Body preview | `{{emails.current.body_preview}}` | existing | string | Gmail/Outlook | Classification. |
| Body text | `{{emails.current.body_text}}` | existing | string | Gmail/Outlook | Deep analysis only. |
| Has attachments | `{{emails.current.has_attachments}}` | existing | boolean | Gmail/Outlook | Safety warning. |
| Labels | `{{emails.current.labels}}` | existing | array | Gmail only | Sent/unread handling. |
| Web link | `{{emails.current.web_link}}` | existing | string | Gmail/Outlook | Source link. |
| Classification | `{{emails.current.classification}}` | existing | string | `classifyEmail` | Routing. |
| Classification reason | `{{emails.current.reason}}` | existing | string | `classifyEmail` | Explain judgment. |
| Recommended action | `{{emails.current.recommended_action}}` | existing | string | `classifyEmail` | Prepare action. |
| Confidence | `{{emails.current.confidence}}` | existing | string | `classifyEmail` | Trust weighting. |
| Requires approval | `{{emails.current.requires_approval}}` | existing | boolean | classifier/rules | Safety gate. |
| Matched rule ID | `{{emails.current.matched_rule_id}}` | existing | string | email rules | Explain automation. |
| Prepared draft | `{{emails.current.prepared_draft}}` | existing | object | draft preparation | Review draft. |
| Importance score | `{{emails.current.importance_score}}` | new | number | Intelligence Pass | Better than coarse labels. |
| Relationship match | `{{emails.current.relationship_match}}` | new/derived | object | resolver | Decide priority. |
| Project match | `{{emails.current.project_match}}` | new/derived | object | resolver | Project-aware drafting. |
| Commitments | `{{emails.current.commitments}}` | new/derived | array | Intelligence Pass | Task extraction. |
| Sender intent | `{{emails.current.sender_intent}}` | new | string | Intelligence Pass | Natural responses. |
| Draft intent | `{{emails.current.draft_intent}}` | new | object | Intelligence Pass | Human-quality drafts. |
| Communication classification | `{{emails.current.communication_classification}}` | new/derived | object | Executive Inbox classification | Conversation-first routing. |
| Executive meaning | `{{emails.current.executive_meaning}}` | new/derived | array | Executive Inbox classification | Explain why surfaced. |
| If delayed | `{{emails.current.if_delayed}}` | new/derived | string | Executive Inbox classification | Timing consequence. |
| Notice lane | `{{emails.current.notice_lane}}` | new/derived | enum | email classifier | Quiet Notices, Executive Inbox, Alignment candidate, Documents, Projects, or suppress. |
| Notice surface posture | `{{emails.current.notice_surface_posture}}` | new/derived | enum | email classifier | Quiet lower-right control, Alignment escalation, Executive Inbox escalation, or hidden/source-only. |
| Operational alert type | `{{emails.current.operational_alert_type}}` | new/derived | enum | email classifier | Receipt, invoice, shipping, login_security, two_factor, automated_notification, payment_issue, deadline, service_risk, other. |
| Payment issue alignment copy | `{{emails.current.payment_issue_alignment_copy}}` | new/derived | object | project manager observer | Project-manager-framed Alignment copy for payment issues. |
| Finance/project document signal | `{{emails.current.finance_project_document_signal}}` | new/derived | object | document/project observer | Receipt/invoice attachment handling, project finance evidence, suggested project creation. |
| Project assignment action | `{{emails.current.project_assignment_action}}` | new/derived | object | document/project observer | "Assign this to a project" action with existing project options or new project creation when match is unclear. |
| Quiet action receipt | `{{emails.current.quiet_action_receipt}}` | new/derived | object | source processing spine | Quiet receipts such as "VAL linked this to Project X" for Notices or email detail. |
| Relationship admission graph | `{{emails.current.relationship_admission_graph}}` | new/derived | object | Email relationship resolver | Sent-to/CC/BCC, replied-to, thread participant, intro thread, calendar/transcript/CRM/manual evidence. |
| Sender suppression status | `{{emails.current.sender_suppression_status}}` | new/derived | enum | user decision, spam/bulk classifier | Decide whether to hide sender from Executive Inbox and relationship surfacing. |
| Suppression override evidence | `{{emails.current.suppression_override_evidence}}` | new/derived | array | relationship resolver | Calendar, transcript, sent/replied email, or manual important evidence that can override unsubscribe/bulk suppression. |

## Email Thread Variables

| Label | Variable | Status | Type | Updated by | Recommended use |
|---|---|---|---|---|---|
| Current thread | `{{emails.thread.current}}` | derived/new | object | email event | Focused thread context. |
| Thread messages | `{{emails.thread.current.messages}}` | new | array | thread fetch | Stop drafting from one snippet. |
| Thread summary | `{{emails.thread.current.summary}}` | new | string | thread summarizer | Compact prompt context. |
| Thread participants | `{{emails.thread.current.participants}}` | new/derived | array | thread fetch | Resolve everyone included in the thread, not only the latest sender. |
| User replied in thread | `{{emails.thread.current.user_replied_in_thread}}` | new/derived | boolean | thread analyzer | Reciprocal relationship evidence for human participants. |
| Introduction participants | `{{emails.thread.current.introduction_participants}}` | new/derived | array | introduction observer | Three-way introduction relationship admission and context. |
| Conversation state | `{{emails.thread.current.conversation_state}}` | new | enum | Conversation Context Builder | Know whether waiting/progressing/blocked/complete. |
| Relationship temperature | `{{emails.thread.current.relationship_temperature}}` | new | enum | Conversation Observer | Warm/cooling/waiting/repairing/sensitive context. |
| Conversation trajectory | `{{emails.thread.current.conversation_trajectory}}` | new | enum | Conversation Observer | Decision/trust/sale/repair/scheduling/closure. |
| Silence effect | `{{emails.thread.current.silence_effect}}` | new | enum | Silence Observer | Decide whether waiting helps or hurts. |
| Last inbound at | `{{emails.thread.current.last_inbound_at}}` | new | datetime | thread analyzer | Follow-up logic. |
| Last outbound at | `{{emails.thread.current.last_outbound_at}}` | new | datetime | thread analyzer | Waiting-on-response. |
| Waiting on response | `{{emails.thread.current.waiting_on_response}}` | existing/derived | boolean | sent mail analyzer | Follow-up tasks. |
| Open question | `{{emails.thread.current.open_question}}` | new/derived | string | Intelligence Pass | Reply clarity. |
| Required answer | `{{emails.thread.current.required_answer}}` | new | string | Intelligence Pass | Draft specificity. |
| Tone of thread | `{{emails.thread.current.tone}}` | new | object | Intelligence Pass | Human draft style. |

## Transcript Variables

Dedicated prompt suite:

- [VAL_TRANSCRIPT_INTAKE_PROMPTS.md](./VAL_TRANSCRIPT_INTAKE_PROMPTS.md)

| Label | Variable | Status | Type | Updated by | Recommended use |
|---|---|---|---|---|---|
| Current transcript | `{{transcripts.current}}` | existing/derived | object | transcript intake | Transcript prompts. |
| Transcript ID | `{{transcripts.current.id}}` | existing | string | storage | Evidence linking. |
| Source | `{{transcripts.current.source}}` | existing | string | webhook/upload/voice | Provenance. |
| Title | `{{transcripts.current.title}}` | existing/derived | string | UI cleanup | Human context. |
| Raw text | `{{transcripts.current.raw_text}}` | existing | string | transcript storage | Deep analysis only. |
| Summary | `{{transcripts.current.summary}}` | existing/derived | string/object | transcript summary | Compact context. |
| Participants | `{{transcripts.current.participants}}` | existing | array | transcript participants | Relationship matching. |
| Key decisions | `{{transcripts.current.key_decisions}}` | existing | array | transcript summaries | Decision tracking. |
| Open questions | `{{transcripts.current.open_questions}}` | existing | array | transcript summaries | Follow-up. |
| Relationship updates | `{{transcripts.current.relationship_updates}}` | existing | array | transcript summaries | Context updates. |
| Attendee relationship candidates | `{{transcripts.current.attendee_relationship_candidates}}` | new/derived | array | Transcript attendee resolver | Gold-standard relationship packet admission for real human attendees. |
| Named person candidates | `{{transcripts.current.named_person_candidates}}` | new/derived | array | Transcript entity resolver | Packet update, candidate record, or identity review for named people. |
| Explicit introduction mentions | `{{transcripts.current.explicit_introduction_mentions}}` | new/derived | array | Transcript introduction observer | Create Leverage/Stewardship introduction opportunities from explicit user intent. |
| Action items | `{{transcripts.current.action_items}}` | existing/derived | array | transcript tasks/metadata | Task creation. |
| Capacity and tone context | `{{transcripts.current.capacity_and_tone_context}}` | new/derived | array | Transcript intake | Safer capacity, tone, and relationship judgment. |
| Emotional context legacy alias | `{{transcripts.current.emotional_context}}` | legacy/new-derived | array | Intelligence Pass | Use `capacity_and_tone_context` in new prompts. |
| Capacity signals | `{{transcripts.current.capacity_signals}}` | new | array | Intelligence Pass | Homepage/highest leverage. |
| Project signals | `{{transcripts.current.project_signals}}` | new | array | Intelligence Pass | Project updates. |
| Source quotes | `{{transcripts.current.source_quotes}}` | new/derived | array | transcript analyzer | Grounded tasks and memory. |
| Recent open loops | `{{recent_transcripts.open_loops}}` | derived/new | array | transcript intake | Homepage/tasks/chat. |
| Recent capacity and tone context | `{{recent_transcripts.capacity_and_tone_context}}` | new/derived | array | transcript intake | Capacity and relationship judgment. |
| Recent emotional context legacy alias | `{{recent_transcripts.emotional_context}}` | legacy/new-derived | array | transcript intake | Use `capacity_and_tone_context` in new prompts. |
| Recent relationship updates | `{{recent_transcripts.relationship_updates}}` | derived | array | transcript summaries | Relationship review. |

## Calendar Variables

| Label | Variable | Status | Type | Updated by | Recommended use |
|---|---|---|---|---|---|
| Today | `{{calendar.today}}` | existing/derived | object | Google/Outlook/GHL/VAL calendar | Daily priority. |
| Upcoming | `{{calendar.upcoming}}` | existing/derived | array | calendar APIs | Meeting prep. |
| Current event | `{{calendar.current_event}}` | derived | object | event resolver | Meeting context. |
| Pressure | `{{calendar.pressure}}` | new/derived | object | calendar analyzer | Capacity-aware priorities. |
| Back-to-back blocks | `{{calendar.back_to_back_blocks}}` | new/derived | array | calendar analyzer | Cognitive load. |
| Recovery time | `{{calendar.recovery_time}}` | new/derived | object | calendar analyzer | Energy planning. |
| Relevant events | `{{calendar.relevant_events}}` | derived | array | resolver | Email/chat/relationship context. |
| Attendees today | `{{calendar.today.attendees}}` | derived | array | calendar APIs | Important people matching. |
| Human attendee candidates | `{{calendar.current_event.human_attendee_candidates}}` | new/derived | array | Attendee Resolver | Create or update relationship packets for real human attendees. |
| Meeting context | `{{calendar.current_event.meeting_context}}` | new/derived | object | Meeting Context Builder | Purpose, timing, and likely reason for the meeting. |
| Attendee resolution | `{{calendar.current_event.attendee_resolution}}` | new/derived | object | Attendee Resolver | Match attendees to contacts, CRM, prior emails, transcripts, projects, and enrichment identifiers. |
| Internal meeting context | `{{calendar.current_event.internal_context}}` | new/derived | object | Internal Context Gatherer | Known relationship, project, CRM, transcript, and email context. |
| Recurring meeting continuity | `{{calendar.current_event.recurring_meeting_continuity}}` | new/derived | object | Meeting Context Builder | Last meeting, this meeting, open loops, relevant changes, and attendee/project continuity. |
| External research plan | `{{calendar.current_event.external_research_plan}}` | new/derived | object | External Research Planner | Plan public/API research only when it improves meeting judgment. |
| Enrichment summary | `{{calendar.current_event.enrichment_summary}}` | new/derived | object | Apollo/Outscraper enrichment planner/summarizer | API-enriched attendee or company context. |
| Public signals | `{{calendar.current_event.public_signals}}` | new/derived | array | Public Signal Summarizer | Recent public or enriched signals relevant to the meeting. |
| Relationship intelligence | `{{calendar.current_event.relationship_intelligence}}` | new/derived | object | Relationship Intelligence Prompt | Who attendees are to the user, why they matter, what changed, and sensitivities. |
| Opportunity map | `{{calendar.current_event.opportunity_map}}` | new/derived | object | Opportunity and Introduction Mapper | Possible mutual-value intros, project unlocks, partnership/client potential. |
| Suggested questions | `{{calendar.current_event.suggested_questions}}` | new/derived | object | Suggested Questions Prompt | Natural meeting questions and what to listen for. |
| Follow-up preparation | `{{calendar.current_event.follow_up_preparation}}` | new/derived | object | Follow-Up Preparation Prompt | Draftable next steps, tasks, CRM notes, and approval policy. |
| Meeting source confidence | `{{calendar.current_event.source_confidence_summary}}` | new/derived | object | Calendar and meeting prep suite | Separates internal evidence, API enrichment, public sources, VAL inference, and unknowns. |

## Task Variables

| Label | Variable | Status | Type | Updated by | Recommended use |
|---|---|---|---|---|---|
| Open tasks | `{{tasks.open}}` | existing | array | VAL tasks | General context. |
| Overdue tasks | `{{tasks.overdue}}` | derived | array | task analyzer | Priority pressure. |
| Due today | `{{tasks.due_today}}` | derived | array | task analyzer | Daily planning. |
| Current task | `{{tasks.current}}` | derived | object | task event/resolver | Task-specific prompts. |
| Contextualized tasks | `{{tasks.contextualized}}` | new/derived | array | Intelligence Pass | Make tasks useful. |
| Task why | `{{tasks.current.why_it_exists}}` | new | string | Intelligence Pass | Avoid contextless tasks. |
| Source quote | `{{tasks.current.source_quote}}` | new/derived | string | evidence link | Ground task. |
| Promise made by | `{{tasks.current.promise_made_by}}` | new | string | Intelligence Pass | Accountability. |
| Promise made to | `{{tasks.current.promise_made_to}}` | new | string | Intelligence Pass | Relationship trust. |
| If ignored | `{{tasks.current.if_ignored}}` | new | string | Intelligence Pass | Priority. |
| Related relationship | `{{tasks.current.relationship}}` | derived/new | object | resolver | Relationship-aware tasks. |
| Related project | `{{tasks.current.project}}` | derived/new | object | resolver | Project-aware tasks. |

## CRM/GHL Variables

| Label | Variable | Status | Type | Updated by | Recommended use |
|---|---|---|---|---|---|
| CRM contacts | `{{crm.contacts}}` | existing | array | GHL `/contacts` | Contact matching. |
| Current CRM contact | `{{crm.contact.current}}` | derived | object | resolver | Focused CRM context. |
| CRM opportunities | `{{crm.opportunities}}` | existing | array | GHL `/opportunities/search` | Revenue leverage. |
| Current opportunity | `{{crm.opportunity.current}}` | derived | object | resolver | Project/deal context. |
| Opportunity stage | `{{crm.opportunity.current.stage}}` | existing/derived | string | GHL | Deal status. |
| Opportunity value | `{{crm.opportunity.current.value}}` | existing/derived | number/string | GHL | Leverage. |
| CRM notes | `{{crm.notes}}` | existing | array | GHL contact notes | Relationship history. |
| CRM tasks | `{{crm.tasks}}` | existing | array | GHL contact tasks | Open loops. |
| CRM conversations | `{{crm.conversations}}` | existing | array | GHL conversations | Recent comms. |
| GHL calendar events | `{{crm.calendar_events}}` | existing | array | GHL calendars | Appointments. |
| Raw CRM payload | `{{crm.raw}}` | existing | object | GHL | Deep/admin only. |
| Person key | `{{crm.identity.person_key}}` | new/derived | string | Contact Identity Resolver | Cross-system person identity. |
| Identity resolution | `{{crm.identity.resolution}}` | new/derived | object | Contact Identity Resolver | Match status, confidence, basis, risks, and next action. |
| CRM contact creation candidate | `{{crm.contact.creation_candidate}}` | new/derived | object | Contact Creation Policy | Whether to create, ask, or avoid contact creation. |
| CRM hygiene impact | `{{crm.hygiene_impact}}` | new/derived | object | Contact Creation Policy | Whether CRM write improves, is neutral, or risks noise. |
| CRM anchor plan | `{{crm.anchor_plan}}` | new/derived | object | CRM Contact ID Anchor Prompt | Objects that should link to the CRM contact ID. |
| Relationship graph | `{{crm.relationship_graph}}` | new/derived | object | Relationship Graph Builder | Network connections, shared projects, clusters, relationship lifecycle, health, role, and equity. |
| Relationship lifecycle | `{{crm.relationship_lifecycle}}` | new/derived | enum | Relationship Graph Builder | `discovered`, `introduced`, `building_trust`, `active`, `strategic`, `dormant`, `rekindling`, `complete`, or `unknown`. |
| Relationship health | `{{crm.relationship_health}}` | new/derived | object | Relationship Graph Builder | Strengthening/stable/waiting/strained/repairing state with evidence. |
| Relationship equity | `{{crm.relationship_equity}}` | new/derived | object | Relationship Graph Builder | Trust, history, shared work, mutual value, introductions, and consistency score. |
| Relationship role | `{{crm.relationship_role}}` | new/derived | enum | Relationship Graph Builder | Connector, introducer, operator, advisor, client, collaborator, vendor, friend, family, partner, prospect, or unknown. |
| Mutual value registry | `{{crm.mutual_value}}` | new/derived | object | Mutual Value Registry Prompt | How the user can create value for them and how they may create value for the user/network. |
| Communication preferences | `{{crm.communication_preferences}}` | new/derived | object | Communication Preference Learning Prompt | Channel, response, decision-context, meeting, format, and brainstorming preferences. |
| Dormancy observation | `{{crm.dormancy_observation}}` | new/derived | object | Dormancy Observer | Relationships quietly dormant without needing to be. |
| Unified conversation timeline | `{{crm.conversation_timeline}}` | new/derived | object | Unified Conversation Timeline Builder | Cross-channel conversation summary anchored to contact ID. |
| CRM note candidate | `{{crm.note_candidate}}` | new/derived | object | CRM Note Writer | Concise, factual, source-linked operational note candidate. |
| CRM task sync plan | `{{crm.task_sync_plan}}` | new/derived | object | CRM Task Sync Planner | Link/create/update/keep task sync recommendation. |
| CRM opportunity resolution | `{{crm.opportunity.resolution}}` | new/derived | object | CRM Opportunity Resolver | Relationship value, opportunity value, lifecycle/stage candidates. |
| CRM proposal/invoice plan | `{{crm.document_plan}}` | new/derived | object | Proposal / Invoice Planner | Proposal, invoice, estimate, quote, or contract prep plan. |
| Project Manager page | `{{projects.current.project_manager_page}}` | new/derived | object | Project Manager Round Table | Full-page project experience: header, charter, constraints, phase, workstreams, stakeholders, risk, actions, prepared work, activity, next actions, finance summary. |
| Project Manager current focus | `{{projects.current.project_manager_current_focus}}` | new/derived | object | Project Manager Round Table | Dynamic top module that shows what the Project Manager is handling right now. |
| Project Manager focus module | `{{projects.current.project_manager_focus_module}}` | new/derived | enum/object | Project Manager Round Table | Critical Project Issue, Needs Your Judgment, Prepared For You, Today's Reprioritization, Project Movement, Execution Adjustment, Project Reset, or Quietly Watching. |
| Project Manager focus receipt | `{{projects.current.project_manager_focus_receipt}}` | new/derived | object | source processing spine | Receipt proving what VAL handled, where it was written, and what changed. |
| Critical project issue | `{{projects.current.critical_project_issue}}` | new/derived | object | Project Manager Round Table | Payment, deadline, dependency, owner, stakeholder tension, relationship health, service/access, launch, legal/contract, or trade-off issue. |
| Critical issue source proof | `{{projects.current.critical_project_issue.source_proof}}` | new/derived | object | source receipt linker | One-sentence clickable source proof, never a long source dump. |
| Critical issue recommended move | `{{projects.current.critical_project_issue.recommended_move}}` | new/derived | object | Project Manager Round Table | Next recommended move, draft if useful, owner suggestion requiring approval when applicable. |
| Critical issue handled receipt | `{{projects.current.critical_project_issue.handled_receipt}}` | new/derived | object | source processing spine | Home welcome/context receipt shown when the issue is actually handled. |
| Needs judgment item | `{{projects.current.needs_judgment_item}}` | new/derived | object | Project Manager Round Table | Decision item requiring user judgment before safe progress. |
| Needs judgment options | `{{projects.current.needs_judgment_item.options}}` | new/derived | array | Project Manager Round Table | Clear options when the user needs to choose between paths. |
| Needs judgment recommendation | `{{projects.current.needs_judgment_item.recommendation}}` | new/derived | object | Project Manager Round Table | VAL's recommended path with brief source proof and consequence if delayed. |
| One-answer blocker | `{{projects.current.needs_judgment_item.one_answer_blocker}}` | new/derived | object | Project Manager Round Table | "I need one answer before I can prepare this" item for Alignment when blocking movement or prepared work. |
| Judgment decision receipt | `{{projects.current.needs_judgment_item.decision_receipt}}` | new/derived | object | source processing spine | One-line receipt after the user decides or puts a pin in it. |
| Project charter | `{{projects.current.charter}}` | new/derived | object | Project Manager Round Table, project interview | Business case, purpose, goals, scope, timeline, stakeholders, risks. |
| Project constraints | `{{projects.current.constraints}}` | new/derived | object | Project Manager Round Table | Scope, time, cost, quality trade-offs and impacts. |
| Project lifecycle phase | `{{projects.current.lifecycle_phase}}` | new/derived | enum/object | Project Manager Round Table | Initiation, planning, execution, monitor/control, closure, plus current phase evidence. |
| Project work breakdown | `{{projects.current.work_breakdown}}` | new/derived | object | Project Manager Round Table | Objectives, activities, tasks, owners, dependencies, milestones. |
| Project communication rhythm | `{{projects.current.communication_rhythm}}` | new/derived | object | Project Manager Round Table | Recurring meetings, stakeholder updates, transparency/status cadence, progress celebration. |
| Project manager operating signals | `{{projects.current.pm_operating_signals}}` | new/derived | object | Project Manager Round Table | Blockers, hidden dependencies, trade-offs, ownership clarity, decision fatigue, loop closure, tomorrow risks. |
| Project finance/document summary | `{{projects.current.finance_document_summary}}` | new/derived | object | document/project observer | Quiet lower Project-drawer-only summary with Receipts, Invoices, Payment Issues, Important Documents, and Open Finance Follow-ups. |
| Project Manager action | `{{projects.current.project_manager_action}}` | new/derived | object | Project Manager Round Table | One specific action VAL did, prepared, noticed, linked, blocked, monitored, or needs context for. |
| Project Manager action list | `{{projects.current.project_manager_actions}}` | new/derived | array | Project Manager Round Table | Action layer for the Project drawer; each row must have its own scoped packet. |
| Project Manager action Co-Work scope | `{{projects.current.project_manager_action.cowork_scope}}` | new/derived | object | Project click contract | Current project, selected action, attached source receipts, affected artifact/object only. |
| CRM send plan | `{{crm.send_plan}}` | new/derived | object | SMS / Email Send Planner | CRM-routed SMS/email preparation and permission requirements. |
| CRM calendar invite plan | `{{crm.calendar_invite_plan}}` | new/derived | object | CRM Calendar Invite Planner | Prepared invite candidate and missing confirmations. |
| CRM action permission | `{{crm.action_permission}}` | new/derived | object | CRM Action Permission Classifier | Whether action is prepare-only, auto-safe, approval-required, never-auto, or refused. |
| CRM merge candidate | `{{crm.merge_candidate}}` | new/derived | object | Merge Candidate Prompt | Possible duplicates and review recommendation. |
| CRM action audit | `{{crm.action_audit}}` | new/derived | object | CRM Action Audit Trail | Source-linked record of CRM write decision/action. |

## Environment Variables

These are not currently implemented as a standard context source, but they are necessary for true highest-leverage judgment.

| Label | Variable | Status | Type | Updated by | Recommended use |
|---|---|---|---|---|---|
| Local weather | `{{environment.local_weather}}` | new | object | weather API/user location | Capacity-aware priority. |
| Weather alerts | `{{environment.weather_alerts}}` | new | array | weather API | Heat, storm, travel impact. |
| Physical constraints | `{{environment.physical_constraints}}` | new | array | chat/transcript/user input | Heat, noise, illness, travel. |
| Workspace context | `{{environment.workspace_context}}` | new | object | Teach VAL/user updates | Work conditions. |
| External disruptions | `{{environment.external_disruptions}}` | new | array | user/calendar/weather | Context for lowered capacity. |

## Evidence Variables

Existing sources include `evidence_items`, `evidence_observations`, `relationship_timeline_events`, `agency_move_sources`, and `val_evidence_links`.

| Label | Variable | Status | Type | Updated by | Recommended use |
|---|---|---|---|---|---|
| Current evidence item | `{{evidence.current_item}}` | existing/derived | object | evidence capture | Ground every update. |
| Source type | `{{evidence.current_item.source_type}}` | existing | string | capture | `gmail_email`, `outlook_email`, `transcript`, `teach_val_onboarding`. |
| Source ID | `{{evidence.current_item.source_id}}` | existing | string | capture | Link to source. |
| Raw text | `{{evidence.current_item.raw_text}}` | existing | string | capture | Deep analysis only. |
| Summary | `{{evidence.current_item.summary}}` | existing | string | capture | Compact context. |
| Participants | `{{evidence.current_item.participants}}` | existing | array | capture | Entity matching. |
| Entities | `{{evidence.current_item.entities}}` | existing | object | capture | Project/person classification. |
| Observations | `{{evidence.observations}}` | existing | array | observation engine | Relationship/project/task updates. |
| Source quote | `{{evidence.source_quote}}` | existing/derived | string | observation engine | Grounded output. |
| Evidence links | `{{evidence.links}}` | existing | array | link creation | Audit trail. |

## Priority Variables

| Label | Variable | Status | Type | Updated by | Recommended use |
|---|---|---|---|---|---|
| Highest leverage now | `{{priority.highest_leverage_now}}` | new/derived | object | Intelligence Pass/deep reasoning | Homepage card. |
| High priority list | `{{priority.high_priority_list}}` | new/derived | array | Intelligence Pass | Executive Inbox/homepage. |
| Priority level | `{{priority.level}}` | new/derived | enum | function prompts | `low`, `medium`, `high`, `critical`. |
| Priority reason | `{{priority.reason}}` | new/derived | string | function prompts | Explain why. |
| Urgency score | `{{priority.urgency_score}}` | existing/new | number | agency moves/Intelligence Pass | Time pressure. |
| Importance score | `{{priority.importance_score}}` | existing/new | number | agency moves/Intelligence Pass | Meaning. |
| Leverage score | `{{priority.leverage_score}}` | existing/new | number | agency moves/Intelligence Pass | Impact. |
| Risk score | `{{priority.risk_score}}` | existing/new | number | agency moves/Intelligence Pass | Cost of ignoring. |
| Capacity impact | `{{priority.capacity_impact}}` | new | string/object | Intelligence Pass | Physical/cognitive constraints. |
| If ignored | `{{priority.if_ignored}}` | existing/new | string | agency moves/Intelligence Pass | Consequence. |
| Why now | `{{priority.why_now}}` | new | string | Intelligence Pass | Timing. |

## Draft Variables

Dedicated email draft prompt suite:

- [VAL_EMAIL_DRAFT_PROMPTS.md](./VAL_EMAIL_DRAFT_PROMPTS.md)

| Label | Variable | Status | Type | Updated by | Recommended use |
|---|---|---|---|---|---|
| Current draft | `{{drafts.current}}` | existing/derived | object | draft creation | Review prompts. |
| Draft type | `{{drafts.current.type}}` | existing | string | draft creation | `email_reply`, `meeting_recap`, etc. |
| Subject | `{{drafts.current.subject}}` | existing | string | draft creation | User-facing. |
| Body | `{{drafts.current.body}}` | existing | string | draft creation | User-facing. |
| Status | `{{drafts.current.status}}` | existing/new | string | draft workflow | `draft`, `needs_context`, `blocked`, `ready_for_review`, `do_not_draft`. |
| Source context | `{{drafts.current.source_context}}` | existing | object | draft creation | Grounding. |
| Draft intent | `{{drafts.current.intent}}` | new/derived | object | Intelligence Pass | Why draft exists. |
| Single purpose | `{{drafts.current.single_purpose}}` | new | string | Draft Brief Builder | Prevent mushy drafts. |
| Recipient next step | `{{drafts.current.recipient_next_step}}` | new | string | Draft Brief Builder | Make next move clear. |
| Representation risk | `{{drafts.current.representation_risk}}` | new | enum | Draft Safety Gate | Require approval for high-risk drafts. |
| Required specifics | `{{drafts.current.required_specifics}}` | new | array | Intelligence Pass | Prevent vague drafts. |
| Tone requirements | `{{drafts.current.tone_requirements}}` | new | object | communication style + relationship | Human draft quality. |
| Plainness check | `{{drafts.current.plainness_check}}` | new | object | Draft QA | Catch corporate filler, fake warmth, over-explaining, and vague next steps. |
| Do not include | `{{drafts.current.do_not_include}}` | new | array | user/relationship/safety | Avoid robotic or unsafe content. |

## Rule Variables

Dedicated VAL OS instruction and approval prompt suite:

- [VAL_OS_INSTRUCTIONS_AND_APPROVAL_PROMPTS.md](./VAL_OS_INSTRUCTIONS_AND_APPROVAL_PROMPTS.md)

| Label | Variable | Status | Type | Updated by | Recommended use |
|---|---|---|---|---|---|
| Email rules | `{{rules.email}}` | existing | array | user confirmation | Inbox automation. |
| Matched email rule | `{{rules.email.current_match}}` | existing/derived | object | classifyEmail | Explain classification. |
| VIP rules | `{{rules.vip}}` | derived/new | array | relationship preferences/email rules | Priority boost. |
| Ignore rules | `{{rules.ignore}}` | derived/new | array | email rules/preferences | Suppression. |
| Approval mode | `{{rules.current.approval_mode}}` | existing | string | rule records | Safety. |
| Conditions | `{{rules.current.conditions}}` | existing | object | email rules | Matching. |
| Actions | `{{rules.current.actions}}` | existing | object | email rules | Prepared behavior. |
| VAL OS instructions | `{{rules.val_os.instructions}}` | new/derived | array | VAL OS Instructions | Active standing instructions. |
| Current instruction | `{{rules.val_os.current_instruction}}` | new/derived | object | Instruction Intake Prompt | Focused instruction candidate or active instruction. |
| Instruction scope | `{{rules.val_os.current_instruction.scope}}` | new/derived | object | Function Router Prompt | Function/entity scope for behavior. |
| Instruction trigger | `{{rules.val_os.current_instruction.when_this_happens}}` | new/derived | object | Instruction Intake Prompt | Event and condition side of behavior. |
| Instruction intent | `{{rules.val_os.current_instruction.val_understands}}` | new/derived | object | Instruction Intake Prompt | Why this behavior exists. |
| Instruction actions | `{{rules.val_os.current_instruction.so_val_will}}` | new/derived | object | Behavior Compiler Prompt | What VAL will prepare, update, notify, or ask. |
| Instruction duration | `{{rules.val_os.current_instruction.duration}}` | new/derived | enum | Instruction Intake Prompt | `one_time`, `temporary`, `until_date`, or `durable`. |
| Instruction review date | `{{rules.val_os.current_instruction.review_at}}` | new/derived | datetime | Instruction Validator Prompt | When VAL should ask whether the instruction is still true. |
| Instruction expiration | `{{rules.val_os.current_instruction.expires_at}}` | new/derived | datetime | Instruction Validator Prompt | When a temporary instruction should stop applying. |
| Instruction origin story | `{{rules.val_os.current_instruction.origin_story}}` | new/derived | string | Instruction Intake/Behavior Compiler | Why the user created the instruction. |
| Behavior packet | `{{rules.val_os.behavior_packet}}` | new/derived | object | Behavior Compiler Prompt | Hot-reloadable behavior configuration. |
| Function override | `{{rules.val_os.function_overrides}}` | new/derived | object | Function Router/Behavior Compiler | Module-specific behavior overrides. |
| Instruction validation | `{{rules.val_os.validation}}` | new/derived | object | Instruction Validator Prompt | Clear, safe, non-conflicting, hot-reloadable status. |
| Specificity result | `{{rules.val_os.specificity_result}}` | new/derived | object | Instruction Validator/Conflict Resolver | Winning scope and overridden instruction IDs. |
| Instruction conflicts | `{{rules.val_os.conflicts}}` | new/derived | array | Conflict Resolver Prompt | Existing instructions or safety boundaries that conflict. |
| Instruction test cases | `{{rules.val_os.test_cases}}` | new/derived | array | Test Before Publish Prompt | Realistic examples used to verify behavior before publishing. |
| Instruction preview | `{{rules.val_os.preview}}` | new/derived | object | Preview / Simulation Prompt | Plain-language summary of what will change. |
| Publish decision | `{{rules.val_os.publish_decision}}` | new/derived | object | Publish Prompt | Whether configuration can hot reload without deployment. |
| Approval packet | `{{rules.val_os.approval_packet}}` | new/derived | object | Approval Packet Prompt | Exact user approval request. |
| Approval learning | `{{rules.val_os.approval_learning}}` | new/derived | object | Approval Learning Prompt | What VAL learns from approval/rejection/edit/snooze. |
| Instruction audit | `{{rules.val_os.audit}}` | new/derived | object | Instruction Audit Trail | Source-linked record of instruction changes. |

## VAL Self-Monitoring Variables

| Label | Variable | Status | Type | Updated by | Recommended use |
|---|---|---|---|---|---|
| VAL confidence | `{{val.confidence}}` | new/derived | number | every prompt | Avoid overclaiming. |
| VAL uncertainty | `{{val.uncertainty}}` | new/derived | array | every prompt | Say what is missing. |
| Needs human confirmation | `{{val.needs_human_confirmation}}` | new/derived | boolean | every prompt | Safety gate. |
| Do not do | `{{val.do_not_do}}` | new/derived | array | safety + context | Prevent bad actions. |
| External action allowed | `{{val.external_action_allowed}}` | derived | boolean | rules/approval | Send/delete/calendar/CRM changes. |
| Review-only mode | `{{val.review_only_mode}}` | existing/derived | boolean | VAL OS | Keep actions internal. |

## Master Event Intelligence Pass Prompt

This pass should run after meaningful incoming and outgoing events:

- transcript arrives
- email arrives
- email is sent
- chat message is sent or received
- voice session ends or meaningful voice turn completes
- calendar event is created, received, updated, or approaching
- GHL contact/opportunity/note/task/conversation changes
- task is created, completed, overdue, or edited
- draft is created, approved, rejected, or edited
- user corrects VAL
- homepage/briefing refresh needs new judgment

Use cheap triage first. Use deep reasoning only for meaningful events.

```text
You are VAL's Event Intelligence Layer.

An event happened:
{{event}}

Read the relevant available context:
{{teach_val}}
{{user.current_capacity_context}}
{{user.energy_patterns}}
{{user.current_focus}}
{{user.priority_rules}}
{{important_people.list}}
{{projects.active}}
{{relationships.list}}
{{calendar.today}}
{{calendar.pressure}}
{{tasks.open}}
{{tasks.overdue}}
{{recent_transcripts.open_loops}}
{{recent_transcripts.emotional_context}}
{{emails.thread.current}}
{{crm}}
{{environment.local_weather}}
{{evidence.recent_observations}}

Your job is not to write a user-facing response.
Your job is to notice what changed, what it touches, what should be remembered, and what should be prepared.

Rules:
- Do not invent facts.
- Do not create durable memory from a single weak signal.
- Prefer append/link/promote/deprecate over replace.
- Every context update must include source, quote or summary, confidence, and why it matters.
- If the event affects health, focus, trust, money, deadlines, promises, or important people, evaluate priority.
- If context is missing, record uncertainty.
- Never send, delete, invite, spend, publish, or move CRM stages without approval.

Return strict JSON:
{
  "event_summary": "",
  "entities_touched": {
    "people": [],
    "projects": [],
    "relationships": [],
    "tasks": [],
    "calendar_events": [],
    "crm_records": []
  },
  "new_evidence": [
    {
      "source_type": "",
      "source_id": "",
      "title": "",
      "summary": "",
      "raw_text_excerpt": "",
      "participants": [],
      "entities": {},
      "confidence": 0.0
    }
  ],
  "context_updates": [
    {
      "target": "",
      "operation": "append",
      "value": "",
      "source_type": "",
      "source_id": "",
      "source_quote": "",
      "confidence": 0.0,
      "scope": "observation",
      "expires_at": null,
      "why_this_matters": ""
    }
  ],
  "priority_updates": [
    {
      "target": "",
      "level": "low",
      "reason": "",
      "urgency_score": 0,
      "importance_score": 0,
      "leverage_score": 0,
      "risk_score": 0,
      "capacity_impact": "",
      "if_ignored": "",
      "confidence": 0.0
    }
  ],
  "open_loops_found": [],
  "risks_found": [],
  "opportunities_found": [],
  "highest_leverage_candidate": {
    "title": "",
    "why": "",
    "evidence": [],
    "if_ignored": "",
    "recommended_action": "",
    "confidence": 0.0
  },
  "actions_to_prepare": [],
  "requires_human_approval": [],
  "do_not_do": [],
  "uncertainty": []
}
```

## Core Function Context Packets

Do not send the whole registry into every prompt. Each function receives a packet.

### Teach VAL Packet

Reads:

- `{{teach_val.voice_interview.transcript}}`
- `{{teach_val.context_imports}}`
- `{{user}}`
- `{{evidence.recent_observations}}`

Writes:

- `{{teach_val.executive_profile}}`
- `{{teach_val.company_context}}`
- `{{important_people.list}}`
- `{{projects.active}}`
- `{{user.priority_rules}}`
- `{{user.communication_style}}`
- `{{user.energy_patterns}}`
- `{{user.do_not_do}}`

### Homepage Highest Leverage Packet

Reads:

- `{{user.current_capacity_context}}`
- `{{user.current_focus}}`
- `{{user.energy_patterns}}`
- `{{recent_transcripts.open_loops}}`
- `{{recent_transcripts.emotional_context}}`
- `{{calendar.today}}`
- `{{calendar.pressure}}`
- `{{tasks.overdue}}`
- `{{environment.local_weather}}`
- `{{relationships.list}}`
- `{{projects.active}}`
- `{{priority.high_priority_list}}`

Writes:

- `{{priority.highest_leverage_now}}`
- `{{actions_to_prepare}}`

### Transcript Intake Packet

Reads:

- `{{transcripts.current.raw_text}}`
- `{{teach_val}}`
- `{{important_people.list}}`
- `{{projects.active}}`
- `{{relationships.list}}`
- `{{user.current_capacity_context}}`
- `{{user.priority_rules}}`

Writes:

- `{{evidence.observations}}`
- `{{recent_transcripts.open_loops}}`
- `{{recent_transcripts.emotional_context}}`
- `{{user.current_capacity_context}}`
- `{{relationships.current.context_append}}`
- `{{projects.current.current_truth}}`
- `{{tasks.contextualized}}`

### Executive Inbox Packet

Reads:

- `{{emails.current}}`
- `{{emails.thread.current}}`
- `{{teach_val}}`
- `{{important_people.list}}`
- `{{projects.active}}`
- `{{relationships.current}}`
- `{{crm}}`
- `{{tasks.open}}`
- `{{calendar.relevant_events}}`
- `{{user.communication_style}}`
- `{{user.priority_rules}}`

Writes:

- `{{emails.current.importance_score}}`
- `{{priority.level}}`
- `{{priority.reason}}`
- `{{relationships.current.context_append}}`
- `{{projects.current.open_loops}}`
- `{{drafts.current.intent}}`
- `{{actions_to_prepare}}`

### Email Draft Packet

Reads:

- `{{emails.current}}`
- `{{emails.thread.current.summary}}`
- `{{relationships.current.context}}`
- `{{relationships.current.preferences}}`
- `{{relationships.current.tone_history}}`
- `{{projects.current.current_truth}}`
- `{{user.communication_style}}`
- `{{user.do_not_sound_like}}`
- `{{drafts.current.intent}}`
- `{{drafts.current.required_specifics}}`

Writes:

- `{{drafts.current.subject}}`
- `{{drafts.current.body}}`
- `{{val.uncertainty}}`
- `{{val.needs_human_confirmation}}`

### Chat and Voice Packet

Dedicated prompt suite:

- [VAL_CHAT_VOICE_CONTEXT_PROMPTS.md](./VAL_CHAT_VOICE_CONTEXT_PROMPTS.md)

Key variables:

- `{{event.session_state}}`
- `{{chat.current.mode}}`
- `{{chat.current.cognitive_posture}}`
- `{{chat.current.creation_authority}}`
- `{{chat.current.work_handoff}}`

Reads:

- `{{teach_val}}`
- `{{user.current_capacity_context}}`
- `{{user.current_focus}}`
- `{{user.energy_patterns}}`
- `{{important_people.list}}`
- `{{projects.active}}`
- `{{relationships.list}}`
- `{{tasks.open}}`
- `{{calendar.today}}`
- `{{priority.highest_leverage_now}}`
- `{{evidence.recent_observations}}`

Writes:

- `{{event.summary}}`
- `{{user.current_focus}}`
- `{{user.current_capacity_context}}`
- `{{user.relief_signals}}`
- `{{user.irritants}}`
- `{{relationships.current.context_append}}`
- `{{projects.current.current_truth}}`
- `{{tasks.contextualized}}`

### Calendar and Meeting Prep Packet

Prompt suite:

- [VAL_CALENDAR_AND_MEETING_PREP_PROMPTS.md](./VAL_CALENDAR_AND_MEETING_PREP_PROMPTS.md)

Reads:

- `{{calendar.current_event}}`
- `{{calendar.today}}`
- `{{calendar.pressure}}`
- `{{calendar.current_event.meeting_context}}`
- `{{calendar.current_event.attendee_resolution}}`
- `{{calendar.current_event.internal_context}}`
- `{{calendar.current_event.public_signals}}`
- `{{calendar.current_event.relationship_intelligence}}`
- `{{calendar.current_event.opportunity_map}}`
- `{{important_people.list}}`
- `{{relationships.current}}`
- `{{projects.current}}`
- `{{tasks.open}}`
- `{{recent_transcripts.relationship_updates}}`
- `{{crm.notes}}`
- `{{emails.thread.current.summary}}`

Writes:

- `{{priority.level}}`
- `{{meeting.briefing}}`
- `{{actions_to_prepare}}`
- `{{calendar.current_event.suggested_questions}}`
- `{{calendar.current_event.follow_up_preparation}}`
- `{{calendar.current_event.source_confidence_summary}}`
- `{{relationships.current.context_append}}`

### GHL/CRM Packet

Prompt suite:

- [VAL_GHL_CRM_PROMPTS.md](./VAL_GHL_CRM_PROMPTS.md)

Reads:

- `{{crm.contact.current}}`
- `{{crm.opportunity.current}}`
- `{{crm.notes}}`
- `{{crm.tasks}}`
- `{{crm.conversations}}`
- `{{crm.identity.resolution}}`
- `{{crm.relationship_graph}}`
- `{{crm.mutual_value}}`
- `{{crm.communication_preferences}}`
- `{{crm.conversation_timeline}}`
- `{{important_people.list}}`
- `{{projects.active}}`
- `{{relationships.current}}`

Writes:

- `{{relationships.current.context_append}}`
- `{{projects.current.current_truth}}`
- `{{priority.level}}`
- `{{actions_to_prepare}}`
- `{{evidence.observations}}`
- `{{crm.identity.person_key}}`
- `{{crm.contact.creation_candidate}}`
- `{{crm.anchor_plan}}`
- `{{crm.relationship_graph}}`
- `{{crm.relationship_lifecycle}}`
- `{{crm.relationship_health}}`
- `{{crm.relationship_equity}}`
- `{{crm.relationship_role}}`
- `{{crm.mutual_value}}`
- `{{crm.communication_preferences}}`
- `{{crm.dormancy_observation}}`
- `{{crm.note_candidate}}`
- `{{crm.task_sync_plan}}`
- `{{crm.opportunity.resolution}}`
- `{{crm.document_plan}}`
- `{{crm.send_plan}}`
- `{{crm.calendar_invite_plan}}`
- `{{crm.action_permission}}`
- `{{crm.merge_candidate}}`
- `{{crm.action_audit}}`

### VAL OS Instructions Packet

Prompt suite:

- [VAL_OS_INSTRUCTIONS_AND_APPROVAL_PROMPTS.md](./VAL_OS_INSTRUCTIONS_AND_APPROVAL_PROMPTS.md)

Reads:

- `{{rules.val_os.instructions}}`
- `{{rules.val_os.current_instruction}}`
- `{{rules.val_os.function_overrides}}`
- `{{rules.email}}`
- `{{rules.vip}}`
- `{{rules.ignore}}`
- `{{user.preferences}}`
- `{{user.priority_rules}}`
- `{{user.approval_preferences}}`
- `{{val.do_not_do}}`
- `{{val.external_action_allowed}}`
- `{{val.review_only_mode}}`

Writes:

- `{{rules.val_os.current_instruction}}`
- `{{rules.val_os.behavior_packet}}`
- `{{rules.val_os.function_overrides}}`
- `{{rules.val_os.validation}}`
- `{{rules.val_os.specificity_result}}`
- `{{rules.val_os.conflicts}}`
- `{{rules.val_os.test_cases}}`
- `{{rules.val_os.preview}}`
- `{{rules.val_os.publish_decision}}`
- `{{rules.val_os.approval_packet}}`
- `{{rules.val_os.approval_learning}}`
- `{{rules.val_os.audit}}`

### Onboarding / First Understanding Packet

Prompt suite:

- [VAL_ONBOARDING_FIRST_UNDERSTANDING_PROMPTS.md](./VAL_ONBOARDING_FIRST_UNDERSTANDING_PROMPTS.md)

Reads:

- `{{onboarding.connected_source_readiness}}`
- `{{onboarding.ai_history_import}}`
- `{{teach_val.context_imports}}`
- `{{teach_val.reviewed_memory}}`
- `{{important_people.list}}`
- `{{projects.active}}`
- `{{relationships.list}}`
- `{{emails.thread.current.summary}}`
- `{{calendar.today}}`
- `{{crm.conversation_timeline}}`
- `{{recent_transcripts.relationship_updates}}`
- `{{tasks.open}}`

Writes:

- `{{onboarding.connected_source_readiness}}`
- `{{onboarding.ai_history_import}}`
- `{{onboarding.round_table_reading_state}}`
- `{{onboarding.observer_outputs}}`
- `{{onboarding.first_understanding}}`
- `{{onboarding.confirmation_cards}}`
- `{{onboarding.memory_promotion}}`
- `{{onboarding.completion}}`
- `{{teach_val.reviewed_memory}}`
- `{{important_people.list}}`
- `{{projects.active}}`
- `{{relationships.list}}`

## First Implementation Targets

1. Build context registry and packet builders.
2. Add event capture table or store for `event`.
3. Add Intelligence Pass output table/store.
4. Create derived context views:
   - `important_people.list`
   - `projects.active`
   - `relationships.current`
   - `user.current_capacity_context`
   - `priority.highest_leverage_now`
5. Wire Intelligence Pass after transcript intake first.
6. Wire homepage Highest Leverage to `priority.highest_leverage_now`.
7. Wire Executive Inbox classification and drafts to the new packets.
8. Wire chat/voice to read hot context and asynchronously update context after turns.
