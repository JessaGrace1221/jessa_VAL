# VAL OS Instructions and Approval Prompt Suite v1

Purpose: define how users give standing instructions to VAL, how those instructions become hot-reloadable behavior configuration, and how VAL decides what can happen automatically, what must be prepared for review, and what requires explicit approval.

This is a product and prompt specification. It does not change runtime behavior until implemented.

Companion specs:

- [VAL_CONSTITUTION.md](./VAL_CONSTITUTION.md)
- [VAL_CONTEXT_REGISTRY.md](./VAL_CONTEXT_REGISTRY.md)
- [VAL_EVENT_INTELLIGENCE_PASS.md](./VAL_EVENT_INTELLIGENCE_PASS.md)
- [VAL_CHIEF_OF_STAFF_PROMPTS.md](./VAL_CHIEF_OF_STAFF_PROMPTS.md)
- [VAL_EMAIL_DRAFT_PROMPTS.md](./VAL_EMAIL_DRAFT_PROMPTS.md)
- [VAL_CHAT_VOICE_CONTEXT_PROMPTS.md](./VAL_CHAT_VOICE_CONTEXT_PROMPTS.md)
- [VAL_GHL_CRM_PROMPTS.md](./VAL_GHL_CRM_PROMPTS.md)

## Core Thesis

VAL OS is not a prompt editor.

VAL OS is where the user gives standing instructions to their Chief of Staff.

The Chief of Staff then routes those instructions to the correct VAL function, observer, planner, or action surface.

Users should not feel like they are editing software.

They should feel like they are shaping how their executive operating system behaves.

## Behavior, Not Code

Prompts should remain stable.

Behavior should be configurable.

Example:

```text
Chief of Staff prompt:
What deserves attention?

Behavior packet:
Protect mornings.
Greg is VIP.
Never auto-send proposals.
Always consider school pickup windows.
Relationships count more than task completion when trust is at risk.
```

The prompt does not change.

The behavior packet changes.

## Configuration, Not Deployment

VAL OS changes should not require code deploys.

Target architecture:

```text
VAL OS Instructions
↓
Validate
↓
Save Configuration
↓
Hot Reload
↓
Observers and functions immediately use the updated behavior packet
```

No Railway.

No GitHub.

No Docker.

No restart.

The user should experience this as:

```text
Publish.
Done.
```

## Product Language

Avoid:

- rules engine
- prompt editor
- deploy
- config JSON
- automation script

Prefer:

- instructions
- behaviors
- preferences
- standing instructions
- approval settings
- when this happens
- VAL understands
- so VAL will

## Instruction Center Structure

VAL OS should have five primary areas:

| Area | Purpose |
|---|---|
| Behaviors | Standing if/understands/then instructions. |
| Preferences | Global user preferences and boundaries. |
| Understanding | Durable context the user wants VAL to know. |
| Skills | Function-specific behavior overrides. |
| Automations | Approved repeatable actions with permission rules. |

This is not the same as the original Teach VAL surface.

Teach VAL remains the context extraction and memory system.

VAL OS Instructions is the user's living operating manual for VAL.

## Three-Box Instruction Model

Every behavior instruction should use three boxes:

```text
WHEN THIS HAPPENS
...

VAL UNDERSTANDS
...

SO VAL WILL
...
```

The middle box is required.

It captures intent.

Without it, VAL becomes brittle automation.

With it, VAL understands why the behavior exists and can apply it more intelligently.

Example:

```text
WHEN THIS HAPPENS
A meeting transcript arrives.

VAL UNDERSTANDS
Meetings usually create commitments, relationship updates, and follow-up work.

SO VAL WILL
Prepare a recap.
Extract commitments.
Update relationship context.
Prepare a CRM note candidate.
Draft follow-up.
Wait for approval before sending anything.
```

## Function Dropdown

Every instruction should have an explicit scope.

The user should be able to choose which VAL function the instruction updates.

Initial function options:

- Chief of Staff
- Executive Inbox
- Momentum
- Ready For You
- Calendar
- Meeting Prep
- Relationships
- Projects
- Email Drafting
- Proposal Builder
- CRM / GHL
- Voice
- Chat
- Transcript Intake
- Task Creation
- Documents
- Lead Scraper
- Global

`Global` should be used sparingly.

Most instructions should target a specific function.

## Specificity Ladder

When instructions overlap, VAL should use the most specific applicable instruction.

Specificity order:

```text
Person-specific
>
Project-specific
>
Function-specific
>
Global
```

Example:

```text
Global instruction:
Write brief emails.

Person-specific instruction:
With Greg, give more context.

Result:
The Greg-specific instruction wins when writing to Greg.
```

Specific instructions may narrow, override, or add nuance to broader instructions.

Safety boundaries still override specificity.

## Behavior Override Examples

| Function | Example behavior override |
|---|---|
| Chief of Staff | Protect deep work before email. |
| Executive Inbox | If Greg emails about HopeMakers, treat it as high priority and prepare a draft, but do not send. |
| Email Drafting | Always ask before apologizing. |
| Meeting Prep | Always look for mutual-value introductions. |
| Momentum | Relationships count more than task completion when trust is changing. |
| Calendar | Never book Fridays without asking. |
| CRM / GHL | Never auto-create contacts from newsletters, no-reply senders, or scraped-only data. |
| Voice | Keep updates short and action-oriented. |
| Proposal Builder | Never send a proposal without explicit approval. |

## Permission Philosophy

VAL may prepare generously.

VAL may execute cautiously.

VAL should not ask the user to approve internal configuration changes as though they are code deployments.

VAL must ask before external or high-risk actions unless the user has explicitly created a safe automation.

External or high-risk actions include:

- sending email
- sending SMS
- sending proposals
- sending invoices
- charging money
- publishing content
- inviting attendees
- blocking calendar availability
- deleting records
- merging CRM contacts
- moving opportunity stages
- changing automation-triggering CRM tags
- bulk updating records
- changing security, privacy, billing, or connected-account settings

## Instruction Object

Compiled instructions should use this shape:

```json
{
  "instruction_id": "",
  "name": "",
  "status": "draft|active|paused|archived",
  "duration": "one_time|temporary|until_date|durable",
  "review_at": "",
  "expires_at": "",
  "scope": {
    "function": "chief_of_staff|executive_inbox|momentum|ready_for_you|calendar|meeting_prep|relationships|projects|email_drafting|proposal_builder|crm_ghl|voice|chat|transcript_intake|task_creation|documents|lead_scraper|global",
    "entity_type": "global|person|project|relationship|calendar|crm|email_thread|task|document|unknown",
    "entity_id": ""
  },
  "when_this_happens": {
    "event_types": [],
    "conditions": [],
    "source_systems": [],
    "confidence_required": 0.0
  },
  "val_understands": {
    "intent": "",
    "why_this_matters": "",
    "principle": "",
    "user_language": "",
    "origin_story": ""
  },
  "so_val_will": {
    "actions": [],
    "preparation": [],
    "context_updates": [],
    "notifications": [],
    "approval_requirements": []
  },
  "approval_policy": "auto_safe|prepare_only|approval_required|never_auto",
  "risk_level": "low|medium|high",
  "conflicts": [],
  "created_by": "user|VAL",
  "created_at": "",
  "last_updated_at": "",
  "audit": []
}
```

## Instruction Intake Prompt

Question:

```text
What standing instruction is the user trying to give VAL?
```

Prompt:

```text
Parse the user's natural language into a VAL OS instruction.
Do not execute the instruction.
Identify the scope, trigger, intent, desired behavior, approval policy, and risks.
Preserve the user's language where useful.
If the instruction is ambiguous, create a clarification question instead of guessing.
```

Output:

```json
{
  "instruction_candidate": {},
  "clarification_needed": true,
  "clarifying_questions": [],
  "confidence": 0.0
}
```

## Function Router Prompt

Question:

```text
Which VAL function should this instruction update?
```

Prompt:

```text
Route the instruction to the smallest appropriate function scope.
Avoid global scope unless the user clearly intends system-wide behavior.
If multiple functions are affected, list primary and secondary functions.
```

Output:

```json
{
  "primary_function": "",
  "secondary_functions": [],
  "scope_reason": "",
  "global_scope_allowed": false,
  "confidence": 0.0
}
```

## Behavior Compiler Prompt

Question:

```text
How should this instruction become behavior configuration?
```

Prompt:

```text
Convert the instruction into a behavior packet.
Keep the prompt stable and encode the change as configuration.
Separate trigger, intent, actions, approval policy, and conflicts.
Do not create executable code.
```

Output:

```json
{
  "behavior_packet": {
    "instruction_id": "",
    "function": "",
    "when_this_happens": {},
    "val_understands": {},
    "so_val_will": {},
    "origin_story": "",
    "approval_policy": "",
    "risk_level": "",
    "duration": "one_time|temporary|until_date|durable",
    "review_at": "",
    "expires_at": "",
    "hot_reloadable": true
  },
  "cannot_compile_reason": "",
  "confidence": 0.0
}
```

## Instruction Validator Prompt

Question:

```text
Is this instruction clear, safe, non-conflicting, and hot-reloadable?
```

Prompt:

```text
Validate the instruction before it becomes active.
Check ambiguity, conflicts, unsafe actions, impossible triggers, overbroad scope, missing approval requirements, and possible unintended consequences.
Do not require code deployment for valid behavior changes.
```

Output:

```json
{
  "valid": true,
  "hot_reloadable": true,
  "issues": [],
  "conflicts": [],
  "specificity_result": {
    "winning_scope": "person|project|function|global|unknown",
    "overridden_instruction_ids": [],
    "safety_override_applied": false
  },
  "requires_user_confirmation": false,
  "recommended_status": "active|draft|blocked",
  "confidence": 0.0
}
```

## Test Before Publish Prompt

Question:

```text
Does this instruction behave correctly in realistic examples before it becomes active?
```

Prompt:

```text
Generate 2 to 3 realistic test cases before publishing the instruction.
Each test should include a scenario, the expected behavior, and whether the compiled behavior packet passes.
Include at least one edge case when the instruction could conflict with a broader or narrower instruction.
Do not publish if tests reveal ambiguity, unsafe behavior, or unintended automation.
```

Output:

```json
{
  "instruction_id": "",
  "test_cases": [
    {
      "scenario": "",
      "expected_behavior": "",
      "actual_behavior": "",
      "passes": true,
      "notes": ""
    }
  ],
  "overall_result": "pass|needs_revision|blocked",
  "revision_needed": "",
  "confidence": 0.0
}
```

## Approval Policy Classifier

Question:

```text
May VAL do this automatically, prepare it only, ask approval, or never do it?
```

Output:

```json
{
  "instruction_id": "",
  "approval_policy": "auto_safe|prepare_only|approval_required|never_auto",
  "why": "",
  "external_action": true,
  "representation_risk": "low|medium|high",
  "financial_or_legal_risk": "low|medium|high",
  "relationship_risk": "low|medium|high",
  "approval_prompt": "",
  "confidence": 0.0
}
```

Guidance:

- `auto_safe`: internal organization, low-risk context update, or harmless preparation.
- `prepare_only`: VAL can do the work but must wait before external action.
- `approval_required`: user must approve before action.
- `never_auto`: VAL must not do this automatically, even after repeated approvals.

## Conflict Resolver Prompt

Question:

```text
Does this instruction conflict with existing user instructions or safety rules?
```

Prompt:

```text
Compare the new instruction against active behavior packets, user preferences, approval settings, do-not-do rules, VIP/ignored rules, and module-specific overrides.
Prefer the more specific instruction unless safety requires otherwise.
User-confirmed safety boundaries override convenience.
Apply the specificity ladder: person-specific > project-specific > function-specific > global.
```

Output:

```json
{
  "conflicts_found": true,
  "conflicts": [
    {
      "existing_instruction_id": "",
      "conflict_type": "direct_conflict|scope_overlap|approval_conflict|safety_conflict|ambiguity",
      "description": "",
      "recommended_resolution": "use_new|keep_existing|ask_user|block_new|narrow_scope"
    }
  ],
  "final_recommendation": "",
  "confidence": 0.0
}
```

## Preview / Simulation Prompt

Question:

```text
What will change if this instruction becomes active?
```

Prompt:

```text
Create a plain-language preview of how VAL will behave after this instruction is published.
Use realistic examples when possible.
Do not require deployment language.
```

Output:

```json
{
  "preview": {
    "plain_language_summary": "",
    "example_scenarios": [],
    "what_val_will_prepare": [],
    "what_val_may_do_automatically": [],
    "what_val_will_still_ask_approval_for": [],
    "what_will_not_change": []
  },
  "confidence": 0.0
}
```

## Publish Prompt

Question:

```text
Can this instruction be published as hot-reloadable configuration?
```

Prompt:

```text
Decide whether the validated behavior packet can be saved and hot reloaded.
Publishing a behavior packet is not a code deployment.
If validation passes, test cases pass, and risk is handled by approval policy, mark it publishable.
```

Output:

```json
{
  "publishable": true,
  "status_after_publish": "active|draft|blocked",
  "hot_reload_required": true,
  "deployment_required": false,
  "test_result": "pass|needs_revision|blocked",
  "reason": "",
  "audit_event": {}
}
```

## Approval Packet Prompt

Question:

```text
What exactly is the user being asked to approve?
```

Prompt:

```text
Create an approval packet for an action or instruction that requires user approval.
Be specific.
Do not ask for vague approval.
Separate approving a configuration from approving an external action.
```

Output:

```json
{
  "approval_packet": {
    "approval_type": "instruction_publish|external_action|high_risk_update|exception",
    "summary": "",
    "why_approval_is_needed": "",
    "what_will_happen": [],
    "what_will_not_happen": [],
    "risk_level": "low|medium|high",
    "options": ["approve", "edit", "reject", "snooze"],
    "expires_at": ""
  }
}
```

## Approval Learning Prompt

Question:

```text
What should VAL learn from this approval, rejection, edit, or snooze?
```

Prompt:

```text
Learn from the user's decision without overgeneralizing.
Repeated approvals may suggest a future behavior candidate, but should not silently create a new automation.
Rejected actions should reduce future confidence for similar behavior.
Edits should update preferences, style, or approval boundaries when evidence is strong.
```

Output:

```json
{
  "learning_candidate": {
    "decision": "approved|rejected|edited|snoozed",
    "instruction_id": "",
    "what_changed": "",
    "future_behavior_candidate": "",
    "requires_user_confirmation": true,
    "confidence": 0.0
  }
}
```

## Instruction Audit Trail

Every instruction change should record:

```json
{
  "audit": {
    "instruction_id": "",
    "event": "created|validated|published|paused|edited|archived|blocked|triggered|action_prepared|approval_requested|approved|rejected",
    "user_id": "",
    "source": "user|VAL|system",
    "before": {},
    "after": {},
    "reason": "",
    "created_at": ""
  }
}
```

## Review Checklist

Before this suite is implemented, verify:

- The product language feels like giving instructions to VAL, not editing prompts.
- Instructions use `When this happens / VAL understands / So VAL will`.
- Every instruction has a function scope from the dropdown.
- Global instructions are allowed only when truly intended.
- Overlapping instructions follow the specificity ladder: person-specific > project-specific > function-specific > global.
- Instructions include duration, review date, and expiration when appropriate.
- Instructions preserve an origin story so future VAL understands why the behavior exists.
- Test Before Publish generates 2 to 3 realistic examples and blocks unsafe or ambiguous instructions.
- Behavior is stored as configuration, not code.
- Valid behavior changes can publish without deployment.
- External and high-risk actions still require approval unless explicitly covered by a safe automation.
- Approval packets specify exactly what the user is approving.
- Conflicts are detected before publishing.
- Preview/simulation explains what will change.
- Approval learning suggests future behavior without silently creating automation.
