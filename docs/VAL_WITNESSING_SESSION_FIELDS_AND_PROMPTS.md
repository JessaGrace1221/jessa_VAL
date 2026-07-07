# The Living Executive Graph

Status: Architecture draft

Purpose: define the hidden structure behind the Witnessing Session before the AI witnessing layer is implemented.

This document exists because the Witnessing Session cannot depend on beautiful wording alone.

Design principle:

Every conversation should leave VAL with a better model of the executive than it had one minute before.

That model must be structured enough to remain coherent for years, yet flexible enough to evolve as the partnership deepens.

The conversation is for the human.

The graph is for coherence.

The prompts are the bridge between them.

Primary governing document:

- `VAL_WITNESSING_CONSTITUTION.md`

This file defines the fields and graph. The constitution defines how VAL thinks while moving through those fields.

The runtime prompt stack is:

1. Master constitution: constant across the session.
2. Question prompt: specific to the current movement goal.
3. Evidence variables: `V1`, `O1`, `C1`, then `V2`, `O2`, `C2`, and so on.
4. Witness response prompt: one grounded observation, not reassurance.

The formula is:

```text
V1..Vn + O1..On + C1..Cn + Goal n+1 -> Prompt n+1
```

Where:

- `V` is user evidence.
- `O` is VAL observation.
- `C` is user confirmation.

The question is not primary. The goal is primary. The question is the best current strategy for reducing uncertainty.

## Product Boundary

The UI should feel like one conversation.

The hidden system is the Living Executive Graph.

Everything feeds it:

- Story
- Constitution
- Projects
- Meetings
- Relationships
- Emails
- Documents
- Stewardship
- Morning Briefing

Every future interaction should use the same pipeline:

Observe -> Structure -> Witness -> Confirm -> Protect -> Earn Stewardship.

The user should never hear:

- memory saved
- executive identity updated
- evidence stored
- context promoted
- learning candidate
- durable memory
- working agreement candidate

Those are internal objects. The conversation is where partnership is born. The graph is where coherence is protected.

The graph exists to preserve coherence. The conversation exists to preserve trust. Neither should ever be sacrificed for the other.

Witnessing rule:

VAL never responds with reassurance when it can respond with observation.

The user should not leave a witnessing response thinking, "VAL was kind."

They should leave thinking, "I had not realized that is what I just revealed."

Witnessing is gentle, provisional, evidence-based judgment:

- "You did not mention..."
- "You described..."
- "You began with..."
- "That tells me..."
- "I do not know if that is true yet, but..."

VAL may be warm, but warmth cannot replace perception.

## Executive Constitution vs. Executive State

The Living Executive Graph must distinguish the executive's Constitution from the executive's State.

One difficult month must not look like an identity change.

### Executive Constitution

The Constitution changes slowly. These objects may evolve over years, usually through repeated evidence and explicit user confirmation.

Examples:

- principles
- communication DNA
- mission
- working agreements
- protected things
- decision style

### Executive State

State changes quickly. These objects may change weekly or even daily.

Examples:

- current priorities
- current friction
- current energy
- current projects
- current relationships
- current stewardship

Rule:

State can influence what VAL prepares today. Constitution governs what VAL is allowed to protect over time.

## Object Stability

VAL must separate permanent objects from living objects.

One transcript must never rewrite a person's Constitution.

### Permanent Objects

Permanent objects almost never change. They may be corrected by the user, but they should not be overwritten by a single transcript, email, meeting, or import.

Examples:

- name
- family
- mission
- core principles
- working agreements
- communication DNA
- assessment results

### Living Objects

Living objects continuously update as evidence accumulates.

Examples:

- current friction
- current projects
- relationship temperature
- observed patterns
- contradictions
- stewardship
- executive priorities

Living objects can influence daily behavior. Permanent objects require stronger confirmation before changing.

## Core Knowledge Types

VAL must never mix these object types.

Every object, regardless of type, carries provenance:

- created_by: user | val | imported | derived
- created_from
- evidence_refs[]
- confidence
- confidence_source
- last_reviewed_at
- stability: permanent | living

### Facts

Objectively true or user-confirmed data.

Examples:

- name
- family_members
- children
- company
- role
- calendar_constraints
- contact_channels
- assessment_results

### Preferences

User choices or stated working preferences.

Examples:

- preferred_meeting_length
- email_style
- notification_preferences
- preferred_feedback_tone
- protected_days
- linkedin_strategy

### Observations

VAL-owned interpretations that require evidence and confidence.

Examples:

- appears_family_driven
- uses_story_to_make_meaning
- values_integrity_over_speed
- protects_relationships
- resists_generic_advice
- delegates_reluctantly

Required fields:

- observation_id
- claim
- evidence_refs[]
- confidence
- confidence_source
- last_confirmed_at
- status: noticed | repeated | supported | confirmed | challenged | retired

## Observation Maturity

Every observation moves through a universal maturity lifecycle.

Observation maturity:

1. noticed
2. repeated
3. supported
4. confirmed
5. challenged
6. retired

This lifecycle lets VAL think and speak like:

```text
I noticed something.

I've seen it again.

Now I've seen it in three places.

I'm beginning to think...

Would you agree?
```

### Hypotheses

VAL-owned possibilities that are not yet safe to call observations.

Examples:

- I suspect the word "witness" carries deeper meaning.
- I suspect family is not separate from the work but the reason for it.
- I suspect this project matters because it protects reputation, not only revenue.

Required fields:

- hypothesis_id
- suspicion
- evidence_refs[]
- confidence
- confidence_source
- questions_remaining[]
- status: open | strengthened | weakened | converted_to_observation | retired

Hypotheses are how VAL says "I wonder" instead of pretending to know.

### Principles

High-confidence commitments that belong in the Executive Constitution.

Examples:

- family_commitments_are_executive_priorities
- relationships_before_transactions
- integrity_over_speed
- clarity_over_complexity
- alignment_before_scale

Required fields:

- principle_id
- statement
- evidence_refs[]
- confidence
- confirmed_by_user
- stewardship_implications[]

### Stewardship

Earned permissions and responsibilities.

Examples:

- protect_calendar
- draft_email
- prepare_meeting
- prioritize_relationships
- prepare_linkedin_commentary
- suggest_follow_up

Required fields:

- stewardship_id
- capability
- level: none | prepare_only | suggest | execute_with_approval | autonomous
- earned_by[]
- blocked_by[]
- last_reviewed_at

### Contradictions

Places where stated values and observed behavior do not yet fit.

Required fields:

- contradiction_id
- stated_value
- observed_behavior
- evidence_refs[]
- confidence
- status: open | clarified | resolved | retired
- next_question

### Protected

Things VAL has been asked to guard or has earned enough evidence to treat as protection-worthy.

Examples:

- Friday mornings
- children
- writing voice
- certain relationships
- reputation
- sleep
- integrity
- creative thinking

Required fields:

- protected_id
- name
- protection_reason
- evidence_refs[]
- confidence
- confidence_source
- related_principles[]
- related_stewardship[]
- status: candidate | confirmed | challenged | retired

This is where "I'll protect that" lives.

### Executive Vocabulary

Words the executive repeatedly uses to make meaning.

Examples:

- alignment
- frisson
- witness
- integrity
- possibility
- stewardship
- grace
- momentum

Required fields:

- vocabulary_id
- word_or_phrase
- user_meaning
- evidence_refs[]
- first_seen_at
- repeated_in[]
- confidence
- status: noticed | repeated | defined | retired

These words tell VAL how the executive thinks.

### Relationship Graph

Relationships deserve their own architecture, not only a list.

Required fields:

- relationship_id
- identity
- role
- trajectory
- trust
- temperature
- shared_history[]
- active_projects[]
- promises[]
- unknowns[]
- protection_notes[]
- evidence_refs[]
- confidence
- last_observed_at

The Relationship Graph feeds Relationship Map, Meeting Prep, Executive Inbox, Commitments, LinkedIn support, and project judgment.

## Confidence Source

Confidence is not enough. VAL must explain why confidence changed.

Examples:

```text
confidence: high
confidence_source:
  repeated_across:
    - Story
    - Email
    - Calendar
    - Meeting
```

Confidence source can include:

- directly stated by user
- confirmed by user correction
- repeated across cards
- repeated across meetings
- repeated in documents
- repeated in calendar behavior
- repeated in email behavior
- imported but not yet confirmed

Confidence without a source is not trustworthy.

## Evidence Model

Every claim VAL makes must point to evidence.

Evidence can be:

- direct quote
- uploaded document excerpt
- transcript excerpt
- repeated phrase
- calendar pattern
- email pattern
- user correction
- external profile or assessment, if user supplied it

Evidence fields:

- evidence_id
- source_type: answer | document | transcript | calendar | email | linkedin | assessment | correction
- source_id
- quote
- timestamp_or_location
- card_id
- sensitivity: ordinary | personal | private | highly_sensitive
- user_visible: true | false

Rule: assessment data can inform questions, but behavior and user correction outweigh assessment labels.

## Prompt Chain

Each Witnessing card uses five prompts. These prompts should be small and typed.

### 1. Observer Prompt

Input:

- current_answer
- current_card_schema
- previous_fields
- prior_observations
- known_contradictions

Task:

- extract candidate facts, preferences, observations, principles, and contradictions
- attach evidence
- assign confidence

Output: structured JSON only.

### 2. Witness Prompt

Input:

- current_answer
- observer_json
- previous_confirmed_context
- unresolved_unknowns

Task:

- reflect back one meaningful observation
- use short lines
- reference only evidence
- include uncertainty when appropriate
- do not summarize the whole answer
- do not flatter
- do not diagnose
- do not mention internal object names

Output: conversational lines.

### 3. Connection Prompt

Input:

- observer_json
- prior card objects
- contradictions
- principles

Task:

- find links across cards
- find repeated words or meanings
- find contradictions
- identify what is not yet safe to conclude

Output: structured JSON only.

### 4. Correction Prompt

Input:

- witness_lines
- highest-impact uncertainty
- user corrections so far

Task:

- ask one clarifying question when needed
- otherwise ask whether the observation feels true
- never force binary confirmation

Output: one conversational question.

### 5. Stewardship Prompt

Input:

- confirmed facts
- confirmed observations
- confirmed principles
- unresolved contradictions
- current stewardship levels

Task:

- decide whether any capability becomes safer
- decide whether any capability remains blocked
- never increase execution permission without explicit user approval

Output: structured JSON only.

## Universal Card Schema

Every card should define:

- card_id
- visible_name
- internal_purpose
- why_this_card_exists_now
- visible_question
- input_types
- custom_fields_created
- evidence_required
- permanence_profile: permanent | living | mixed
- observer_prompt_contract
- witness_prompt_contract
- connection_prompt_contract
- correction_prompt_contract
- stewardship_impact
- immediate_consumers
- future_consumers
- next_question_logic

Why this card exists now is required. It prevents arbitrary questions.

Example:

Story exists early because without understanding the person's story, every later observation risks becoming generic.

Consumer rules:

- immediate_consumers are features that can safely use the fields soon.
- future_consumers are capabilities that may eventually use the fields after more evidence, confirmation, or stewardship.

## Sixteen Card Map

This is a draft map. Question wording can change, but the field contract should be stable before implementation.

### 1. First Meeting

Why this card exists now:

The first answer reveals what the user chooses to place at the center before VAL has asked for categories, credentials, or work history.

Visible question:

If we were simply meeting for coffee, what is one thing you would hope I understood about you before we ever worked together?

Creates:

- first_meeting_raw
- partnership_hopes[]
- early_trust_signals[]
- early_boundaries[]
- identity_opening_signal
- words_to_watch[]
- executive_vocabulary[]
- hypotheses[]

Primary object types:

- facts
- observations
- principles candidates
- hypotheses
- executive vocabulary

Witness prompt focus:

Notice the first thing the user chose to reveal. Do not over-explain. Reflect one observation and ask if it feels true.

Immediate consumers:

- Executive Constitution
- trust model
- next question selection

Future consumers:

- future tone calibration
- calendar protection
- meeting prep

### 2. Story

Why this card exists now:

Without understanding the person's story, every later observation risks becoming generic.

Visible question:

Tell me your story. Not your resume. Your story.

Creates:

- story_raw
- story_summary_private
- formative_events[]
- identity_events[]
- recurring_themes[]
- core_people[]
- values_expressed_through_action[]
- language_patterns[]
- hypotheses[]
- executive_vocabulary[]

Primary object types:

- facts
- observations
- principles candidates
- hypotheses
- executive vocabulary

Witness prompt focus:

Do not summarize the life story. Witness one turning point, repeated phrase, or identity thread.

Immediate consumers:

- Executive Identity
- Writing DNA

Future consumers:

- Relationship Map
- Decision Engine
- Morning Briefing

### 3. Mission

Why this card exists now:

VAL needs to know what the user's work is ultimately in service of before it can safely prioritize projects, relationships, meetings, or drafts.

Visible question:

What are you trying to change?

Creates:

- mission_raw
- change_target
- people_served[]
- problem_space[]
- future_state[]
- mission_language[]
- distractions_to_protect_against[]
- protected_candidates[]

Primary object types:

- principles
- observations
- stewardship candidates
- protected

Witness prompt focus:

Reflect the difference between what the user is building and why it matters.

Immediate consumers:

- Project Priority
- Proposal Drafting

Future consumers:

- Meeting Prep
- Strategy Briefs

### 4. What Must Never Be Compromised

Why this card exists now:

This card defines protection boundaries before VAL is allowed to optimize, accelerate, or recommend.

Visible question:

When you are at your best, what must never be sacrificed?

Creates:

- non_negotiables[]
- integrity_boundaries[]
- relationship_boundaries[]
- time_boundaries[]
- decision_guardrails[]
- values_at_risk[]
- protected[]

Primary object types:

- principles
- preferences
- stewardship blockers
- protected

Witness prompt focus:

Treat these as protection signals, not productivity preferences.

Immediate consumers:

- Executive Constitution
- Calendar Protection

Future consumers:

- Email Approval Gates
- External Action Gates

### 5. Family and Care

Visible question:

Who or what must VAL understand as part of your real life, not separate from your work?

Creates:

- family_context[]
- care_responsibilities[]
- protected_commitments[]
- school_or_care_schedules[]
- family_language[]
- sensitivity_flags[]

Primary object types:

- facts
- principles
- preferences

Witness prompt focus:

Do not treat family as an interruption. Identify how care responsibilities should shape executive support.

Consumers:

- Calendar Protection
- Morning Briefing
- Travel Planning
- Commitment Ledger

### 6. Energy and Friction

Visible question:

Where does your work usually become heavier than it needs to be?

Creates:

- friction_patterns[]
- energy_drains[]
- overwhelm_signals[]
- avoidance_patterns_candidate[]
- delegation_edges[]
- support_needed[]

Primary object types:

- observations
- contradictions
- stewardship candidates

Witness prompt focus:

Reflect one place VAL may need to protect the user from unnecessary load without judgment.

Consumers:

- Daily Planning
- Task Triage
- Co-Work
- Delegation Support

### 7. Decision Style

Visible question:

When a decision really matters, how do you know what is right?

Creates:

- decision_criteria[]
- risk_tolerance
- evidence_required
- pace_preference
- consultation_style
- decision_failure_modes[]

Primary object types:

- preferences
- observations
- principles

Witness prompt focus:

Notice whether the user relies on data, people, intuition, values, timing, or pattern recognition.

Consumers:

- Decision Engine
- Meeting Prep
- Project Prioritization
- Proposal Strategy

### 8. Communication DNA

Visible question:

When your communication is at its best, what does it sound like?

Creates:

- writing_voice_raw
- tone_preferences[]
- forbidden_tones[]
- signature_phrases[]
- persuasion_style
- edit_preferences[]
- examples_needed[]

Primary object types:

- preferences
- observations

Witness prompt focus:

Reflect what the user wants their communication to protect, not only how it should sound.

Consumers:

- Email Drafting
- LinkedIn Drafting
- Proposals
- Meeting Follow-Ups

### 9. Relationships

Visible question:

Which relationships matter most to the life and work you are building?

Creates:

- key_relationships[]
- relationship_roles[]
- trust_levels_candidate[]
- relationship_obligations[]
- relationship_context_needed[]
- sensitive_relationship_flags[]

Primary object types:

- facts
- observations
- stewardship blockers

Witness prompt focus:

Notice the difference between important people, active obligations, and relationships that need protection.

Consumers:

- Relationship Map
- Meeting Prep
- Executive Inbox
- Commitment Ledger

### 10. LinkedIn Support Circle

Visible question:

Who have you committed to supporting on LinkedIn?

Creates:

- linkedin_support_circle[]

Required fields per person:

- name
- linkedin_profile_url

Primary object types:

- facts
- preferences

Witness prompt focus:

Do not broaden this into relationship intake. This card only captures LinkedIn support commitments.

Consumers:

- LinkedIn Comment Prep
- Relationship Warmth Signals
- Weekly Visibility Support

### 11. Current Projects

Visible question:

What are you actively building or carrying right now?

Creates:

- active_projects[]
- project_roles[]
- project_outcomes[]
- project_pressure_points[]
- project_relationships[]
- project_source_needs[]

Primary object types:

- facts
- observations
- contradictions

Witness prompt focus:

Notice which projects carry emotional weight, strategic weight, or hidden obligation.

Consumers:

- Project Dossiers
- Morning Briefing
- Meeting Prep
- Proposal Drafting

### 12. Documents and Templates

Visible question:

What documents or templates should VAL understand before it helps you?

Creates:

- uploaded_documents[]
- uploaded_templates[]
- document_relationship_links[]
- document_project_links[]
- template_use_cases[]
- template_preservation_rules[]

If Document, ask:

- Which relationship does this relate to?
- Which project does this relate to?
- What should VAL understand from it?

If Template, ask:

- What is this used for?
- When should VAL reuse it?
- Should VAL preserve structure, tone, or both?
- Is this gold-standard or a starting point?

Primary object types:

- facts
- preferences
- evidence

Witness prompt focus:

Classify the artifact before interpreting it.

Consumers:

- Document Library
- Proposal Drafting
- Email Drafting
- Project Dossiers

### 13. Personal Context and Profiles

Visible question:

What context about you should VAL be allowed to consider?

Creates:

- personal_context_raw
- assessment_profiles[]
- health_context[]
- care_context[]
- interpretive_frameworks[]
- user_supplied_self_descriptions[]
- context_sensitivity_flags[]

Examples:

- DISC
- Kolbe
- CliftonStrengths
- Working Genius
- Enneagram
- bio or speaker profile
- founder story
- health context
- children or school schedules
- doctor or provider information
- Zodiac/chart if meaningful to the user

Primary object types:

- facts
- preferences
- evidence

Witness prompt focus:

Treat profiles as user-supplied context, not truth. Behavior and correction outweigh assessment labels.

Consumers:

- Executive Constitution
- Communication DNA
- Calendar Protection
- Meeting Prep

### 14. Working Agreements

Visible question:

What agreements should govern how VAL works with you?

Creates:

- always_protect[]
- never_assume[]
- interrupt_when[]
- stay_quiet_when[]
- overwhelm_tone
- prepare_never_make[]
- trust_breakers[]
- moving_too_fast_protocol
- contradiction_protocol
- stewardship_questions[]

Primary object types:

- preferences
- principles
- stewardship blockers

Witness prompt focus:

Convert the user's preferences into operating agreements only after confirmation.

Consumers:

- VAL OS
- External Action Gates
- Co-Work
- Morning Briefing

### 15. Prior AI Context

Visible question:

What have other AI systems, coaches, consultants, or notes already helped you discover that still feels true?

Creates:

- prior_ai_context[]
- imported_insights[]
- user_confirmed_imports[]
- stale_or_uncertain_imports[]
- source_systems[]

Primary object types:

- evidence
- observations candidates
- principles candidates

Witness prompt focus:

Do not accept imported context as truth. Ask what still feels accurate.

Consumers:

- Teach VAL
- Executive Constitution
- Prompt Personalization

### 16. Partnership Agreement

Visible question:

Before we begin working together, what do you want me to be responsible for protecting?

Creates:

- partnership_agreement_raw
- protection_priorities[]
- initial_stewardship_levels[]
- explicit_non_permissions[]
- unresolved_questions[]
- first_30_day_focus[]

Primary object types:

- principles
- stewardship
- contradictions

Witness prompt focus:

Reflect the responsibilities VAL has earned and the responsibilities it has not earned yet.

Consumers:

- VAL OS
- Daily Briefing
- Stewardship Model
- Permission Gates

## Prompt Contract For Real AI Witnessing

Every Witness Prompt must include these non-negotiables:

```text
You are VAL.

Your task is not to summarize the user.
Your task is to witness one thing you can responsibly notice.

Use only the current answer, confirmed previous fields, and supplied evidence.
Do not invent context.
Do not flatter.
Do not diagnose.
Do not use internal system words.
Do not say memory, database, field, object, graph, executive identity, evidence stored, or confidence score.

Write in short lines.
One thought per line.
Prefer uncertainty over performance.

If the evidence is thin, say so gently.
If something does not fit, name the uncertainty.

End with one natural question or check-in.
```

## Structured Observer Output

The Observer Prompt should return JSON shaped like:

```json
{
  "card_id": "first_meeting",
  "permanence_profile": "mixed",
  "facts": [
    {
      "field": "",
      "value": "",
      "stability": "permanent",
      "created_by": "user",
      "created_from": "",
      "evidence_refs": [],
      "confidence": 0.0,
      "confidence_source": []
    }
  ],
  "preferences": [],
  "observations": [
    {
      "claim": "",
      "evidence_refs": [],
      "confidence": 0.0,
      "confidence_source": [],
      "status": "noticed",
      "created_by": "val"
    }
  ],
  "hypotheses": [
    {
      "suspicion": "",
      "evidence_refs": [],
      "confidence": 0.0,
      "confidence_source": [],
      "questions_remaining": [],
      "status": "open"
    }
  ],
  "principles": [],
  "protected": [],
  "executive_vocabulary": [],
  "relationship_graph_updates": [],
  "contradictions": [],
  "stewardship_implications": [],
  "next_question_recommendation": {
    "question": "",
    "why": "",
    "depends_on": []
  }
}
```

## Implementation Sequence

1. Freeze this schema before expanding the UI.
2. Build the hidden object store.
3. Build Observer Prompt with structured JSON output.
4. Build Witness Prompt with conversational output.
5. Build Connection Prompt across previous cards.
6. Build Correction Prompt.
7. Build Stewardship Prompt.
8. Only then replace scripted prototype witnessing in the Hearth UI.

## Design Rule

The database can update silently.

The conversation is where the partnership is born.
