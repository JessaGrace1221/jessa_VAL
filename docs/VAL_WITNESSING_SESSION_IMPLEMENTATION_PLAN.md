# VAL Witnessing Session Implementation Plan

Status: Implementation bridge

Source of truth:

- [VAL_PARTNERSHIP_PROTOCOL.md](./VAL_PARTNERSHIP_PROTOCOL.md)
- [VAL_WITNESSING_SESSION_FIELDS_AND_PROMPTS.md](./VAL_WITNESSING_SESSION_FIELDS_AND_PROMPTS.md)
- [VAL_ONBOARDING_FIRST_UNDERSTANDING_PROMPTS.md](./VAL_ONBOARDING_FIRST_UNDERSTANDING_PROMPTS.md)
- [VAL_TEACH_VAL_PROMPTS.md](./VAL_TEACH_VAL_PROMPTS.md)
- [VAL_CONTEXT_REGISTRY.md](./VAL_CONTEXT_REGISTRY.md)

Architecture pause:

Do not continue expanding Witnessing Session UI until the Living Executive Graph field and prompt map is accepted. The next durable step is not more screens. It is the typed object model: permanent vs. living objects, provenance, protected objects, evidence, confidence source, prompt contracts, correction loops, and stewardship impact.

## Current Gap

The existing VAL drawer is structurally safe, but emotionally wrong for the new direction.

It currently behaves like:

- status panels
- routing cards
- category buttons
- generic onboarding imports
- save-to-onboarding receipts

The Witnessing Session needs to behave like:

- VAL introduces the partnership contract
- VAL asks one meaningful question at a time
- the user answers, pastes, uploads, or connects a source
- VAL witnesses what it noticed
- VAL shows evidence
- VAL explains what changed in its understanding
- VAL asks for correction
- only then does VAL earn the next question

The most important change is not visual. It is orchestration.

## What We Can Reuse

### Existing endpoints

- `POST /api/teach-val/onboarding/start`
- `GET /api/teach-val/onboarding`
- `POST /api/teach-val/onboarding/:id/imports/:category`
- `POST /api/teach-val/onboarding/:id/voice-turn`
- `POST /api/teach-val/onboarding/:id/interview`
- `POST /api/teach-val/onboarding/:id/commit`

### Existing stores

- `teach_val_onboarding_sessions`
- `teach_val_imports`
- `teach_val_memory_items`
- `val_memory_items`
- `evidence_items`
- `evidence_observations`
- VAL OS review candidates from onboarding operational context

### Existing categories to evolve

| Current category | New Witnessing Session role |
|---|---|
| `things_to_remember` | Personal Context and Assessments |
| `working_agreements` | Working Agreements Questionnaire |
| `support_circle` | LinkedIn Support Circle |
| `documents_and_examples` | Documents and Templates |
| `ai_history_import` | Prior AI Context, still evidence only |
| `current_projects` | Current Projects card |
| `important_people` | Relationships card |
| `linkedin_strategy` | LinkedIn voice/strategy, separate from LinkedIn Support Circle |

## What Must Change

### 1. VAL drawer entry

Current:

`Start / continue onboarding`

New:

`Begin Witnessing Session`

The opening should not land on import prompts. It should land on the partnership contract:

```text
Before we connect your accounts or import your work, I'd rather meet you.

This isn't setup.

It's the beginning of our partnership.
```

### 2. Onboarding categories become cards

The current `valOnboardingCategories` object should become a card registry.

Each card should define:

- `id`
- `title`
- `movement`
- `question`
- `inputKinds`
- `examples`
- `writesTo`
- `evidenceRequired`
- `reflectionPrompt`
- `visibleLearning`
- `correctionPrompt`
- `nextCard`

### 3. Save receipts become witnessing receipts

Current receipt:

```text
VAL saved the context where the onboarding system can review, route, and later commit it intentionally.
```

New receipt:

```text
Here is what I noticed.
Here is the evidence I used.
Here is what changed in my understanding.
Here is how I will use this to protect or better serve you.
Did I see this correctly?
```

### 4. Progress becomes movement, not percentage

Do not show `73%` or generic setup progress.

Show:

- Learning communication style
- Building executive memory
- Understanding relationships
- Connecting projects
- Finding repeating patterns
- Identifying priorities
- Creating working agreements
- Preparing partnership agreement

### 5. Working Agreements must become a questionnaire

This should not be a single freeform text area.

Required questions:

- What should VAL always protect?
- What should VAL never assume?
- When should VAL interrupt you?
- When should VAL stay quiet?
- What tone do you want from VAL when you are overwhelmed?
- What kinds of decisions should VAL only prepare, never make?
- What would make you lose trust?
- What should VAL remember when you are moving too fast?
- What should VAL do when your calendar contradicts your stated priorities?
- What should VAL do when your communication contradicts your stated values?
- What should VAL ask before taking on greater responsibility?

### 6. Personal Context must broaden

The Personal Context card should explicitly invite typed, pasted, or uploaded material.

Examples:

- DISC profile
- Kolbe
- Working Genius
- CliftonStrengths
- Enneagram
- bio, speaker profile, founder story, or coach profile
- personality notes, values notes, or self-reflections
- Zodiac, chart, or other interpretive frameworks if meaningful to the user
- health context VAL should protect
- children, school, family, or care schedules
- doctor or provider information VAL may need to remember
- recurring personal constraints
- anything another AI, coach, consultant, therapist, or assessment has said that feels true

Rule:

Behavior always outweighs assessments.

### 7. Support Circle must be LinkedIn-specific

Rename visible language to:

`LinkedIn Support Circle`

Purpose:

People the user has committed to supporting on LinkedIn by commenting on their posts.

Only collect:

- name
- LinkedIn profile link

Do not turn this into a broad relationship intake.

### 8. Documents and Examples becomes Documents and Templates

The user must classify each upload.

If Document:

- Which relationship does this relate to?
- Which project does this relate to?
- What should VAL understand from it?

If Template:

- What is this template used for?
- When should VAL reuse it?
- Should VAL preserve the structure, the tone, or both?
- Is this a gold-standard example or only a starting point?

## Proposed Data Shape

The current import model can support the first version, but the structured JSON should become more specific.

```json
{
  "card_id": "personal_context",
  "card_title": "Personal Context and Assessments",
  "raw_input": "",
  "input_kind": "typed|pasted|upload|connection",
  "observations": [
    {
      "summary": "",
      "evidence": [
        {
          "source_type": "user_text|uploaded_document|ai_history|calendar|email|crm|assessment",
          "source_label": "",
          "quote_or_summary": ""
        }
      ],
      "confidence": 0.0,
      "supporting_examples": [],
      "contradicting_examples": [],
      "writes_to": [
        "executive_constitution.principles",
        "user.decision_style"
      ],
      "user_confirmation": "not_shown|confirmed|corrected|unsure"
    }
  ],
  "visible_learning": {
    "what_i_noticed": "",
    "what_changed": "",
    "how_i_will_use_it": "",
    "where_it_applies": []
  },
  "correction": {
    "question": "Did I see this correctly?",
    "status": "pending|confirmed|corrected|unsure",
    "user_text": ""
  },
  "stewardship_effect": {
    "capability": "communication_style|calendar_protection|relationship_followup|proposal_drafting",
    "from": "observe",
    "to": "recommend",
    "evidence_required_before_next_level": []
  }
}
```

## First Safe Build Slice

Do not attempt all 18 cards at once.

Build the first four-card vertical slice:

1. Meeting VAL
2. Your Story
3. Your Mission
4. What Must Never Be Compromised

This slice proves the core rhythm without touching account connections, uploads, CRM routing, LinkedIn, or autonomous behavior.

### Slice requirements

- Replace `Start / continue onboarding` with `Begin Witnessing Session`.
- Opening workspace shows the partnership contract, not import prompts.
- Card state shows current card title and movement.
- User can answer in one large text box.
- Save action stores the answer using the existing onboarding import endpoint.
- Receipt is a witnessing receipt, not a save receipt.
- Receipt includes evidence language, even if first version uses a lightweight local reflection.
- User can mark:
  - `Yes, continue`
  - `Mostly, let me clarify`
  - `Not yet`
- No external action occurs.
- No durable memory promotion occurs until commit/review.

## Implementation Phases

### Phase 1: Product-safe prototype

Frontend only plus existing import endpoint.

- Add witnessing card registry.
- Add card navigation state.
- Render partnership contract.
- Render first four cards.
- Save answers to existing `teach_val_imports`.
- Show local witnessing receipts based on the submitted text.
- Add tests that prove the old category-button experience is no longer the entry point.

### Phase 2: Structured witness extraction

Backend prompt extraction.

- Add an endpoint such as `POST /api/teach-val/onboarding/:id/witnessing-cards/:cardId`.
- Store structured observations, evidence, visible learning, correction status, and stewardship effect.
- Keep raw response and extracted observations inspectable.
- Do not promote to durable memory automatically.

### Phase 3: Correction loop

User authority.

- Add confirm/correct/unsure actions.
- Corrections become high-authority evidence.
- Corrected observations replace or deprecate prior interpretations.

### Phase 4: Full card set

Add remaining cards:

- Communication DNA
- Public Voice
- Relationships
- Personal Context and Assessments
- Calendar Reality
- Email Reality
- Current Projects
- Documents and Templates
- Executive Friction
- LinkedIn Support Circle
- Working Agreements Questionnaire
- Executive Identity Reflection
- Executive Partnership Agreement

### Phase 5: Stewardship visualization

Add the quiet Partnership / Stewardship visual:

- no points
- no gamification
- no trust percentage
- show earned responsibility with evidence
- show capability maturity through `Observe`, `Recommend`, `Prepare`, `Act with approval`, `Act autonomously`

## Tests To Update First

Current tests expect the old VAL drawer categories:

- `test/hearthLeadIntelligence.test.js`
- `test/teachValOnboardingMemory.test.js`

First test changes should prove:

- VAL drawer names the Witnessing Session.
- `Begin Witnessing Session` exists.
- Old `Documents and Examples` visible language is replaced by `Documents and Templates`.
- Support Circle visible language is `LinkedIn Support Circle`.
- The first card uses partnership language, not setup language.
- Save still uses `/api/teach-val/onboarding/:id/imports/:category` in Phase 1.
- No external action routes are introduced.

## Must Not Do

- Do not build a progress-bar wizard.
- Do not make onboarding a settings page.
- Do not make the user wonder what VAL learned.
- Do not generate flattering identity language without evidence.
- Do not let assessments override lived behavior.
- Do not broaden LinkedIn Support Circle into generic relationship intake.
- Do not commit durable memory without review.
- Do not imply VAL has earned permission to act autonomously because a user completed onboarding.
