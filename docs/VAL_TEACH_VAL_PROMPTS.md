# VAL Teach VAL Prompt System v1

Purpose: define the Teach VAL extraction, update, memory, and correction prompts that create VAL's durable understanding of the user.

This is a prompt and architecture spec. It does not change runtime behavior until implemented.

Companion specs:

- [VAL_CONTEXT_REGISTRY.md](./VAL_CONTEXT_REGISTRY.md)
- [VAL_EVENT_INTELLIGENCE_PASS.md](./VAL_EVENT_INTELLIGENCE_PASS.md)
- [VAL_TRANSCRIPT_INTAKE_PROMPTS.md](./VAL_TRANSCRIPT_INTAKE_PROMPTS.md)
- [VAL_EMAIL_DRAFT_PROMPTS.md](./VAL_EMAIL_DRAFT_PROMPTS.md)
- [VAL_CHAT_VOICE_CONTEXT_PROMPTS.md](./VAL_CHAT_VOICE_CONTEXT_PROMPTS.md)
- [VAL_ONBOARDING_FIRST_UNDERSTANDING_PROMPTS.md](./VAL_ONBOARDING_FIRST_UNDERSTANDING_PROMPTS.md)

## Mission

Teach VAL is the root context layer.

It should teach VAL:

- who the user is
- what matters to them
- who matters to them
- what projects are alive
- how they communicate
- how they decide
- what drains them
- what gives them momentum, relief, or frisson
- what VAL should never do
- what should count as high priority
- how VAL should interpret future emails, transcripts, meetings, tasks, and CRM events

The goal is not to create a static profile. The goal is to create a living operating map that every VAL function can read and update.

## Existing Sources

Current code already has several Teach VAL-related stores and flows:

| Source | Current storage | Notes |
|---|---|---|
| Voice interview | `teach_val_onboarding_sessions.state_json.voiceInterview` | Includes transcript and summary. |
| Imports/cards | `teach_val_imports` | Raw response, prompt used, structured JSON, reviewed flag. |
| Extracted memory | `teach_val_memory_items` | Category, title, summary, source, confidence, data JSON. |
| Committed memory | `val_memory_items.kind` beginning with `teach_val_` | Current durable memory store. |
| Teach VAL evidence | `evidence_items.source_type = teach_val_onboarding` | Used for observation engine. |
| Teach VAL observations | `evidence_observations` | Generated from committed onboarding payload. |
| Baby VAL Studio | `baby_val_studio_settings.settings_json` | Name, about me, preferred tone, simple instructions. |

## Teach VAL Output Namespaces

Teach VAL should produce and maintain these registry sections:

- `{{teach_val.executive_profile}}`
- `{{teach_val.company_context}}`
- `{{teach_val.current_projects}}`
- `{{teach_val.important_people}}`
- `{{teach_val.lessons_learned}}`
- `{{teach_val.work_preferences}}`
- `{{teach_val.frustrations}}`
- `{{teach_val.process_gaps}}`
- `{{teach_val.opportunities}}`
- `{{teach_val.things_to_remember}}`
- `{{teach_val.observer_introduction_candidates}}`
- `{{teach_val.misunderstandings}}`
- `{{user.communication_style}}`
- `{{user.decision_style}}`
- `{{user.priority_rules}}`
- `{{user.energy_patterns}}`
- `{{user.current_capacity_context}}`
- `{{user.irritants}}`
- `{{user.relief_signals}}`
- `{{user.do_not_do}}`
- `{{user.do_not_sound_like}}`
- `{{important_people.list}}`
- `{{projects.active}}`
- `{{relationships.list}}`
- `{{rules.vip}}`
- `{{rules.ignore}}`

## Teach VAL Extraction Principles

1. Preserve the user's language when it carries meaning.
2. Separate durable truths from temporary states.
3. Separate user-confirmed facts from model inference.
4. Extract people and projects as independent entities, not just prose.
5. Every important person needs a `why_they_matter`.
6. Every project needs a `current_truth`.
7. Every priority rule should be phrased so another VAL function can use it.
8. Extract "do not do" rules aggressively and respectfully.
9. Capture what gives the user relief, momentum, or frisson.
10. Do not flatten emotionally important context into corporate summaries.
11. Sensitive context may support judgment, but should not be surfaced casually, added to CRM, or used in external communications unless clearly relevant and approved.
12. Every major extracted insight should carry a `user_confirmation` status: `confirmed`, `corrected`, `unsure`, or `not_shown`.

## Knowledge Types

| Type | Meaning | Durability |
|---|---|---|
| `fact` | Stable detail about user, person, project, or company. | durable |
| `preference` | How the user wants VAL to behave or communicate. | durable until corrected |
| `priority_rule` | What should count as important. | durable until corrected |
| `pattern` | Repeated behavior, energy, or decision pattern. | durable after repetition or confirmation |
| `current_state` | Temporary condition. | expires |
| `observation` | One-time source-backed signal. | not durable yet |
| `correction` | User says prior understanding is wrong. | high authority |
| `boundary` | Something VAL must not do or assume. | durable |
| `style` | User's voice, draft preferences, tone. | durable but refinable |
| `relationship_rule` | How to treat a person or class of people. | durable until corrected |
| `project_truth` | Current state of an active project. | warm, updated often |

## Prompt 1: Voice Interview Summarizer

Use when the user completes a Teach VAL voice interview or long onboarding conversation.

### Reads

- `{{teach_val.voice_interview.transcript}}`
- `{{user}}`
- `{{teach_val.reviewed_memory}}` if available

### Writes

- `{{teach_val.executive_profile}}`
- `{{teach_val.company_context}}`
- `{{teach_val.current_projects}}`
- `{{teach_val.important_people}}`
- `{{teach_val.work_preferences}}`
- `{{user.communication_style}}`
- `{{user.decision_style}}`
- `{{user.priority_rules}}`
- `{{user.energy_patterns}}`
- `{{user.do_not_do}}`

### Prompt

```text
You are Teach VAL's voice interview extraction layer.

Your job is to extract a living operating map of the user from the interview transcript.
Do not write a user-facing summary.
Do not invent facts.
Preserve emotionally meaningful language.

Transcript:
{{teach_val.voice_interview.transcript}}

Existing reviewed memory, if any:
{{teach_val.reviewed_memory}}

Extract:
1. Who the user is.
2. What the user is building or responsible for.
3. What matters most right now.
4. Important people and why they matter.
5. Active projects and their current truth.
6. The user's communication style.
7. The user's decision style.
8. The user's priority rules.
9. Energy, capacity, somatic, or environmental patterns.
10. Frustrations and process gaps.
11. Relief signals, momentum signals, and frisson signals.
12. What VAL should never do.
13. What future VAL functions should remember when reading emails, transcripts, calendar events, tasks, CRM records, chat, and voice.

Rules:
- Distinguish durable facts from temporary current states.
- If a claim is uncertain, mark it as inference.
- Every important person needs why_they_matter.
- Every project needs current_truth.
- Every priority rule should be actionable by other prompts.
- Do not flatten the user's personality into generic business language.

Return strict JSON only.
```

### JSON Output

```json
{
  "executive_profile": {
    "summary": "",
    "roles": [],
    "responsibilities": [],
    "values": [],
    "current_focus": [],
    "operating_style": "",
    "confidence": 0.0
  },
  "company_context": {
    "company_name": "",
    "business_model": "",
    "audience": "",
    "offerings": [],
    "current_stage": "",
    "strategic_context": "",
    "confidence": 0.0
  },
  "important_people": [
    {
      "name": "",
      "email": "",
      "company": "",
      "role": "",
      "relationship_type": "",
      "why_they_matter": "",
      "priority_level": "low|medium|high|critical|unknown",
      "relationship_status": "active|watch|cooling|sensitive|unknown",
      "source_quote": "",
      "confidence": 0.0,
      "user_confirmation": "confirmed|corrected|unsure|not_shown"
    }
  ],
  "projects": [
    {
      "name": "",
      "slug": "",
      "current_truth": "",
      "why_it_matters": "",
      "status": "active|paused|watch|blocked|unknown",
      "people": [],
      "blockers": [],
      "momentum": [],
      "open_loops": [],
      "source_quote": "",
      "confidence": 0.0,
      "user_confirmation": "confirmed|corrected|unsure|not_shown"
    }
  ],
  "communication_style": {
    "preferred_tone": "",
    "sounds_like_user": [],
    "does_not_sound_like_user": [],
    "draft_preferences": [],
    "signoff_preferences": [],
    "confidence": 0.0
  },
  "decision_style": {
    "how_user_decides": [],
    "what_user_avoids": [],
    "when_user_wants_directness": [],
    "when_user_wants_care": [],
    "confidence": 0.0
  },
  "priority_rules": [
    {
      "rule": "",
      "applies_to": "email|task|calendar|relationship|project|crm|homepage|all",
      "priority_level": "low|medium|high|critical",
      "source_quote": "",
      "confidence": 0.0,
      "user_confirmation": "confirmed|corrected|unsure|not_shown"
    }
  ],
  "energy_patterns": {
    "works_best_when": [],
    "drains": [],
    "capacity_warning_signs": [],
    "relief_signals": [],
    "frisson_signals": [],
    "environmental_factors": [],
    "confidence": 0.0
  },
  "frustrations": [],
  "process_gaps": [],
  "opportunities": [],
  "things_to_remember": [],
  "do_not_do": [
    {
      "rule": "",
      "why": "",
      "source_quote": "",
      "confidence": 0.0,
      "user_confirmation": "confirmed|corrected|unsure|not_shown"
    }
  ],
  "patterns": [
    {
      "pattern": "",
      "pattern_type": "energy|capacity|decision|communication|relationship|project|priority|other",
      "source_quote": "",
      "confidence": 0.0,
      "user_confirmation": "confirmed|corrected|unsure|not_shown"
    }
  ],
  "uncertainty": []
}
```

## Prompt 2: Source Import Extractor

Use when the user pastes context into a Teach VAL knowledge card or imports outside AI/context.

### Reads

- knowledge card category
- card prompt/guidance
- raw user/imported response
- existing Teach VAL memory

### Prompt

```text
You are Teach VAL's source import extractor.

Knowledge card:
{{teach_val.import.category}}

Internal guidance:
{{teach_val.import.prompt_used}}

User/imported context:
{{teach_val.import.raw_response}}

Existing Teach VAL memory:
{{teach_val.reviewed_memory}}

Extract useful onboarding memory for VAL.
The output must help future VAL functions make better decisions.

Rules:
- Do not invent facts.
- Preserve source attribution.
- Prefer specific, actionable memory over vague summaries.
- Extract entities separately: people, projects, preferences, rules, blockers, patterns.
- Mark whether each item should become durable memory now or remain an observation.
- If the imported text conflicts with existing reviewed memory, flag the conflict instead of silently replacing it.

Return strict JSON only.
```

### JSON Output

```json
{
  "import_provenance": {
    "source_tool": "chatgpt|claude|gemini|other",
    "conversation_title": "",
    "imported_at": "",
    "source_confidence": 0.0
  },
  "summary": {
    "category": "",
    "what_this_teaches_val": "",
    "confidence": 0.0,
    "user_confirmation": "confirmed|corrected|unsure|not_shown"
  },
  "items": [
    {
      "title": "",
      "summary": "",
      "category": "",
      "knowledge_type": "fact|preference|priority_rule|pattern|current_state|observation|correction|boundary|style|relationship_rule|project_truth",
      "target_namespace": "",
      "source": "teach_val_import",
      "source_quote": "",
      "confidence": 0.0,
      "user_confirmation": "confirmed|corrected|unsure|not_shown",
      "include_in_val": true,
      "durability": "observation|current_state|durable_memory|needs_review",
      "expires_at": null,
      "data": {}
    }
  ],
  "people": [],
  "projects": [],
  "rules": [],
  "patterns": [],
  "conflicts": [],
  "uncertainty": []
}
```

## Prompt 3: Teach VAL Memory Compiler

Use when reviewed imports and interview output are committed into VAL's usable context.

### Reads

- `{{teach_val.voice_interview.summary}}`
- reviewed `teach_val_memory_items`
- existing durable `val_memory_items`
- existing important people/projects/relationships

### Writes

- durable memory candidates
- `important_people.list`
- `projects.active`
- `user.priority_rules`
- `user.communication_style`
- `user.energy_patterns`
- evidence item + observations

### Prompt

```text
You are Teach VAL's memory compiler.

Your job is to turn reviewed onboarding knowledge into clean context objects future VAL functions can use.
You are not writing a profile for the user to read.
You are building VAL's operating memory.

Reviewed Teach VAL inputs:
{{teach_val.reviewed_inputs}}

Existing durable memory:
{{teach_val.existing_durable_memory}}

Existing important people/projects/relationships:
{{important_people.list}}
{{projects.active}}
{{relationships.list}}

Compile:
- durable user profile context
- active projects
- important people
- communication style
- decision style
- priority rules
- energy and capacity patterns
- boundaries and do-not-do rules
- relationship/project rules

Rules:
- Merge duplicates.
- Preserve source references.
- Do not overwrite confirmed memory unless the new input is a correction.
- If two memories conflict, mark conflict for review.
- Use compact fields future prompts can read quickly.

Return strict JSON only.
```

### JSON Output

```json
{
  "compiled_context": {
    "teach_val": {},
    "user": {},
    "important_people": [],
    "projects": [],
    "relationships": [],
    "rules": []
  },
  "memory_updates": [
    {
      "target": "",
      "operation": "append|promote|replace|deprecate|reject",
      "value": {},
      "source_type": "teach_val_onboarding",
      "source_id": "",
      "source_quote": "",
      "confidence": 0.0,
      "user_confirmation": "confirmed|corrected|unsure|not_shown",
      "scope": "durable_memory",
      "why_this_matters": ""
    }
  ],
  "evidence_candidates": [],
  "conflicts_for_review": [],
  "uncertainty": []
}
```

## Prompt 4: Teach VAL Connected Source Insight Prompt

Use when Teach VAL reviews connected sources to help the user understand what VAL can already infer from email/calendar/transcripts/tasks.

This should not silently create durable memory. It should propose what VAL appears to notice and ask for confirmation where needed.

### Reads

- recent email metadata
- recent calendar events
- recent transcripts
- open tasks
- existing Teach VAL memory
- important people/projects

### Prompt

```text
You are Teach VAL's connected-source insight layer.

VAL has access to connected source signals.
Your job is to identify what these sources suggest about the user, important people, active projects, open loops, capacity, and preferences.

Connected source context:
{{teach_val.connected_source_context}}

Existing Teach VAL memory:
{{teach_val.reviewed_memory}}

Rules:
- Do not treat source inference as confirmed truth.
- Separate likely insights from questions for the user.
- Prefer useful patterns over raw lists.
- Do not expose sensitive raw content unless needed.
- Suggest what Teach VAL should ask the user to confirm.

Return strict JSON only.
```

### JSON Output

```json
{
  "likely_insights": [
    {
      "insight": "",
      "target_namespace": "",
      "evidence": [],
      "confidence": 0.0,
      "user_confirmation": "confirmed|corrected|unsure|not_shown",
      "needs_user_confirmation": true
    }
  ],
  "suggested_questions": [
    {
      "question": "",
      "why_ask": "",
      "would_update": []
    }
  ],
  "possible_important_people": [],
  "possible_active_projects": [],
  "possible_priority_rules": [],
  "possible_energy_patterns": [],
  "do_not_infer": []
}
```

## Prompt 4B: Observer Introduction Candidate Prompt

Use when onboarding is preparing the first "I think I understand..." Round Table moment.

Teach VAL provides the raw material. The onboarding suite decides how to present it.

### Reads

- reviewed Teach VAL memory
- imported AI history
- connected-source insights
- important people/projects
- candidate preferences, rules, patterns, and boundaries
- observer list from Chief of Staff prompt suite

### Prompt

```text
You are Teach VAL's Observer Introduction Candidate layer.

Your job is to prepare source-grounded candidate introductions for VAL's onboarding observers.

Do not perform the final onboarding presentation.
Do not optimize for emotional intensity.
Optimize for truthful recognition.

For each observer, identify:
- what this observer believes it understands so far
- what evidence supports that understanding
- what the observer is not sure about
- what the user should be asked to confirm or correct

Every major insight must include user_confirmation.
Sensitive context must be handled carefully and not surfaced casually.

Return strict JSON only.
```

### JSON Output

```json
{
  "observer_introduction_candidates": [
    {
      "observer": "executive_inbox|relationships|projects|capacity|courage|delight|opportunity|momentum|meaning|commitment|calendar|environment|crm|memory",
      "protects": "",
      "candidate_introduction": "",
      "what_i_think_i_understand": "",
      "evidence": [],
      "confidence": 0.0,
      "user_confirmation": "confirmed|corrected|unsure|not_shown",
      "what_i_am_not_sure_about": [],
      "confirmation_options": ["yes_thats_right", "almost", "no_change_this", "not_important"],
      "sensitive_context_flags": [],
      "do_not_surface": []
    }
  ],
  "cross_observer_themes": [],
  "needs_user_confirmation": [],
  "do_not_promote": []
}
```

## Prompt 5: Teach VAL Correction Updater

Use whenever the user corrects VAL directly.

Examples:

- "No, Renee is not high priority."
- "Never draft emails that sound like that."
- "That project is paused."
- "This person is important even if they rarely email me."
- "Stop surfacing tasks from that transcript."

### Reads

- correction message
- context object being corrected
- prior recommendation or memory
- source evidence

### Prompt

```text
You are Teach VAL's correction updater.

The user corrected VAL.
User correction:
{{event.source_text}}

Prior context or recommendation:
{{correction.prior_context}}

Relevant evidence:
{{evidence.relevant}}

Your job is to update VAL's understanding so the mistake is less likely to happen again.

Rules:
- User correction has high authority.
- Identify exactly what should change.
- Prefer replace, deprecate, reject, or do_not_do updates.
- Preserve source trail.
- If the correction applies broadly, create a reusable rule.
- If the correction only applies to one person/project/event, scope it narrowly.

Return strict JSON only.
```

### JSON Output

```json
{
  "correction_summary": "",
  "misunderstandings": [
    {
      "what_val_thought": "",
      "user_correction": "",
      "rule_created": "",
      "scope": "",
      "confidence": 1.0
    }
  ],
  "updates": [
    {
      "target": "",
      "operation": "replace|deprecate|reject|append",
      "value": "",
      "scope": "person|project|relationship|drafting|priority|global|current_state",
      "source_type": "user_correction",
      "source_id": "",
      "source_quote": "",
      "confidence": 1.0,
      "why_this_matters": ""
    }
  ],
  "new_rules": [
    {
      "rule_type": "priority|drafting|relationship|project|safety|do_not_do",
      "rule": "",
      "applies_to": "",
      "confidence": 1.0
    }
  ],
  "deprecate_context": [],
  "do_not_do": [],
  "needs_clarification": []
}
```

## Sensitive Context Handling

Teach VAL will inevitably ingest emotional, legal, family, health, financial, personal, and sensitive relationship context.

Rules:

1. Sensitive context may be used to support judgment.
2. Sensitive context should not be surfaced casually.
3. Sensitive context should not be added to CRM unless clearly operational, necessary, and approved.
4. Sensitive context should not be used in external communications unless clearly relevant and approved.
5. Sensitive context should be summarized with care, not copied raw by default.
6. Sensitive context should include source, confidence, and confirmation status.
7. If sensitive context is uncertain, keep it as an observation or ask the user.
8. If the user corrects sensitive context, the correction has highest authority.
9. VAL should never use sensitive context to diagnose, shame, or manipulate.
10. When in doubt, protect the user's dignity and privacy.

## Prompt 6: Communication Style Extractor

Use specifically to make email/chat/voice drafts stop sounding robotic.

### Reads

- Teach VAL interview/imports
- user-edited drafts
- sent emails if available
- rejected draft feedback
- explicit style preferences

### Prompt

```text
You are VAL's communication style extractor.

Your job is to learn how the user actually sounds and how VAL should draft for review.

Read:
{{user_style_sources}}

Extract:
- tone
- sentence length
- formality
- warmth
- directness
- humor/edge
- signoffs
- phrases to use
- phrases to avoid
- what makes a draft feel fake
- what context must be included so a human knows what is going on

Rules:
- Do not imitate private content unnecessarily.
- Extract style guidance, not full personal messages.
- Preserve explicit user dislikes.
- If there is not enough evidence, say so.

Return strict JSON only.
```

### JSON Output

```json
{
  "communication_style": {
    "summary": "",
    "tone": [],
    "directness": "",
    "warmth": "",
    "formality": "",
    "typical_structure": [],
    "signoffs": [],
    "phrases_that_fit": [],
    "phrases_to_avoid": [],
    "draft_must_include": [],
    "draft_must_not_do": [],
    "examples_of_good_style": [],
    "uncertainty": [],
    "confidence": 0.0
  },
  "updates": []
}
```

## Prompt 7: Priority Rule Extractor

Use to teach every other VAL function what "high priority" means for this user.

### Reads

- Teach VAL interview/imports
- user corrections
- accepted/rejected homepage cards
- accepted/rejected tasks
- important people/projects
- capacity/energy patterns

### Prompt

```text
You are VAL's priority rule extractor.

Your job is to convert user context into practical rules future VAL functions can use to decide priority.

Read:
{{priority_rule_sources}}

Extract rules for:
- email priority
- transcript task priority
- homepage highest leverage
- calendar priority
- relationship priority
- project priority
- CRM opportunity priority
- capacity/energy priority

Rules should be concrete.
Bad rule: "Important relationships matter."
Good rule: "If an email is from a person marked important and includes a deadline, classify it high priority unless the person is currently ignored or snoozed."

Return strict JSON only.
```

### JSON Output

```json
{
  "priority_rules": [
    {
      "id": "",
      "rule": "",
      "applies_to": "email|transcript|task|homepage|calendar|relationship|project|crm|all",
      "priority_level": "low|medium|high|critical",
      "positive_triggers": [],
      "negative_triggers": [],
      "exceptions": [],
      "source_quote": "",
      "confidence": 0.0,
      "needs_user_confirmation": false
    }
  ],
  "conflicts": [],
  "uncertainty": []
}
```

## Prompt 8: Energy and Capacity Pattern Extractor

Use to make VAL aware of the user's actual bandwidth and environment.

### Reads

- Teach VAL interview
- transcripts
- chat/voice messages
- calendar load
- task completion patterns
- weather/environment signals
- user corrections

### Prompt

```text
You are VAL's energy and capacity pattern extractor.

Your job is to identify what helps or harms the user's ability to think, focus, decide, and follow through.

Read:
{{capacity_sources}}

Extract:
- current capacity context
- durable energy patterns
- temporary physical/environmental constraints
- drains
- relief signals
- frisson signals
- warning signs
- what VAL should adjust when capacity is low

Rules:
- Do not pathologize the user.
- Treat physical/environmental context as operationally important.
- Temporary states need expiration.
- Durable patterns need repeated evidence or user confirmation.
- Make this useful for homepage, tasks, inbox, chat, and calendar.

Return strict JSON only.
```

### JSON Output

```json
{
  "current_capacity_context": {
    "state": "clear|strained|overloaded|recovering|unknown",
    "signals": [],
    "operational_impact": "",
    "recommended_adjustment": "",
    "expires_at": null,
    "confidence": 0.0
  },
  "energy_patterns": {
    "works_best_when": [],
    "drains": [],
    "warning_signs": [],
    "relief_signals": [],
    "frisson_signals": [],
    "environmental_factors": [],
    "val_should_adjust_by": []
  },
  "updates": [],
  "uncertainty": []
}
```

## Canonical Important Person Object

```json
{
  "id": "",
  "slug": "",
  "name": "",
  "email": "",
  "phone": "",
  "company": "",
  "role": "",
  "relationship_type": "",
  "why_they_matter": "",
  "priority_level": "low|medium|high|critical|unknown",
  "relationship_status": "active|watch|cooling|sensitive|ignored|unknown",
  "preferred_handling": "",
  "known_context": "",
  "open_loops": [],
  "source_refs": [],
  "confidence": 0.0,
  "confirmed_by_user": false,
  "created_at": "",
  "updated_at": ""
}
```

## Canonical Project Object

```json
{
  "id": "",
  "slug": "",
  "name": "",
  "current_truth": "",
  "why_it_matters": "",
  "status": "active|paused|watch|blocked|complete|unknown",
  "priority_level": "low|medium|high|critical|unknown",
  "people": [],
  "blockers": [],
  "momentum": [],
  "open_loops": [],
  "risks": [],
  "opportunities": [],
  "source_refs": [],
  "confidence": 0.0,
  "confirmed_by_user": false,
  "created_at": "",
  "updated_at": ""
}
```

## Canonical User Context Object

```json
{
  "communication_style": {},
  "decision_style": {},
  "priority_rules": [],
  "energy_patterns": {},
  "current_capacity_context": {},
  "current_focus": {},
  "irritants": [],
  "relief_signals": [],
  "do_not_do": [],
  "do_not_sound_like": [],
  "approval_preferences": {},
  "updated_at": ""
}
```

## Teach VAL Review and Promotion Rules

| Source | Can become durable immediately? | Notes |
|---|---|---|
| Direct user statement in Teach VAL | Yes | Highest confidence. |
| User correction | Yes | Should override prior inference. |
| User-reviewed import item | Yes | If reviewed/accepted. |
| Connected-source inference | No, usually needs confirmation | May become observation first. |
| Observer introduction candidate | No | Raw material for onboarding; user should confirm, correct, or mark unsure. |
| Repeated transcript signal | Sometimes | Promote after repeated evidence or user confirmation. |
| Email behavior pattern | Sometimes | Promote after repeated behavior and/or approval. |
| Draft rejection/edit | Yes for style guidance | Scope to drafting unless broader. |
| Homepage card dismissal | Sometimes | Learn what not to surface. |

## How Teach VAL Feeds Every Function

| Function | Reads Teach VAL for |
|---|---|
| Onboarding / First Understanding | imported AI history, observer introduction candidates, confirmation status, misunderstandings, sensitive context boundaries. |
| Executive Inbox | important people, projects, priority rules, communication style, relationship handling. |
| Email drafts | communication style, do-not-sound-like, relationship/project context, required specifics. |
| Transcript intake | important people, projects, capacity patterns, priority rules. |
| Transcript tasks | context, why it matters, source quote, if ignored. |
| Homepage Highest Leverage | current focus, capacity, energy, active projects, priority rules. |
| Chat/voice | user profile, current focus, style, durable memory, open loops. |
| Calendar/meeting prep | important people, projects, relationship context, energy/capacity. |
| GHL/CRM | important contacts, project/opportunity meaning, relationship priority. |
| VAL OS rules | approval preferences, do-not-do, priority rules. |

## First Implementation Recommendation

1. Replace the current Teach VAL summarizer prompt with Prompt 1.
2. Replace source import extraction with Prompt 2.
3. Add compiled context output from Prompt 3.
4. Store compiled `important_people` and `projects` separately instead of only as memory prose.
5. Add correction updater for chat/voice/user feedback.
6. Add communication style extractor using sent/edited/rejected drafts.
7. Add priority rule extractor.
8. Add energy/capacity pattern extractor.
9. Feed compiled Teach VAL context into the Event Intelligence Pass.
