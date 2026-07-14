# VAL Co-Work Entry Point Registry

Status: approved architecture contract for the Co-Work rebuild.

Purpose: make every Co-Work entry point useful for the exact place from which the executive opened it. A Co-Work button is not a generic invitation to chat. It is a request for VAL to finish a named piece of work with the correct evidence, the correct Round Table, and a visible result.

Companion specifications:

- [VAL_COWORK_WITH_VAL_V1_BUILD_SPEC.md](./VAL_COWORK_WITH_VAL_V1_BUILD_SPEC.md)
- [VAL_SYSTEM_WIDE_SOURCE_AND_CLICK_MAP.md](./VAL_SYSTEM_WIDE_SOURCE_AND_CLICK_MAP.md)
- [VAL_CONTEXT_REGISTRY.md](./VAL_CONTEXT_REGISTRY.md)
- [HEARTH_PACKET_COMPLETENESS_CONTRACT.md](./HEARTH_PACKET_COMPLETENESS_CONTRACT.md)
- [VAL_PROJECT_MANAGER_ROUND_TABLE_AND_PACKETS.md](./VAL_PROJECT_MANAGER_ROUND_TABLE_AND_PACKETS.md)

## Non-Negotiable Rule

Every active Co-Work entry must resolve this path before a conversation opens:

```text
visible button
  -> entry-point id
  -> selected object and selected section
  -> canonical Working Brief
  -> named objective and completion condition
  -> only the questions needed to complete that objective
  -> prepared internal update, decision, or artifact
  -> visible review/apply action
  -> action receipt and return to the originating surface
```

The user must never have to repeat which project, transcript, document, relationship, email, or card they clicked. VAL must never begin with a generic "How can I help?" when the initiating surface already defines the work.

## Canonical Entry Contract

Each registry entry must be executable data, not prose hidden in a front-end event handler.

```ts
type CoWorkEntry = {
  id: string;
  visibleTriggers: string[];
  surface: string;
  scope: {
    entityType: "home_card" | "project" | "project_section" | "relationship" |
      "relationship_section" | "transcript" | "meeting_prep" | "email_thread" |
      "commitment" | "document" | "lead_run" | "val_mode";
    entityId: string;
    sectionId?: string;
  };
  requiredPackets: string[];
  requiredSourceRefs: string[];
  workingBrief: string;
  objective: string;
  completionCondition: string;
  questionPlan: string[];
  writes: string[];
  allowedOutputs: string[];
  approvalBoundary: string;
  returnSurface: string;
};
```

`entityId`, source references, and packet versions are populated at click time. If a required entity or source cannot be loaded, Co-Work fails honestly and offers a retry. It must not substitute a stale demo object, an adjacent item, or generic Home context.

## Conversation Rules

### Questions Are Never Random

Every question must do one of these things:

1. fill a required field in the selected packet;
2. resolve a conflict between source-backed facts;
3. choose among explicit executive decisions;
4. provide required inputs for a named prepared artifact or authorized action; or
5. confirm that the prepared result should be applied.

Each question records its target field. The answer cannot vanish into chat history.

### Completion Is Explicit

Every entry has a definition of done. When it is satisfied, VAL presents a visible result card, for example:

```text
Prepared: 4 project workstreams
Updates: Project Managers > Workstreams
Evidence used: MOU, July 11 transcript, Aric relationship packet
Next: Apply workstreams
```

Internal project, relationship, and packet updates are prepared from the conversation and applied through a clear internal `Apply` action. External sends, CRM updates, calendar changes, task assignment, publishing, and other consequential work route through the Action Registry and their relevant approval surface.

### Canonical Working Brief

All entries construct one `WorkingBrief` from the exact scoped evidence. It contains:

- the initiating entity and selected section;
- immutable source receipts;
- source-backed current state;
- linked packets and Round Table outputs;
- known gaps and conflicts;
- the selected objective and completion condition;
- existing prepared work and action history; and
- the approval rules that constrain the next move.

For transcripts, the exact Krisp Action Items and Key Points remain an immutable source receipt. VAL may derive work from them, but may never rewrite them as the source.

## Project Managers

The Project Managers drawer is the most complete current start. Its existing field-level prompts are useful, but the current path is only a partial implementation: it passes a selected field and source summaries into a generic chat route, then uses a simple local rewrite/list parser to update the page. It does not yet use a canonical Working Brief, a completion-oriented question plan, or a reusable apply/receipt action.

The following registry is the required replacement.

| Entry id | Visible trigger or section | Objective | Completion condition | Packet write / visible result |
|---|---|---|---|---|
| `project.overview` | Top `Co-Work` | Resolve the next useful project decision, plan, comparison, or prepared artifact. | A decision, proposed artifact, or clearly named missing input is visible. | `project_manager_packet`; Project Manager focus module or prepared-work card. |
| `project.identity` | `What this is`, `Start onboarding chat`, and the foundation stage of `Project interview` | Define the project, beneficiary/audience, desired outcome, and one project owner. | Canonical name, purpose, desired outcome, and owner are explicit. | `project_identity_packet` and `project_owner_packet`; `What this is`, `People involved`, and Working narrative. |
| `project.why_it_matters` | `Why it matters` | Name the consequence, opportunity, relationship, or business reason. | Strategic importance and why-now are evidence-backed or explicitly marked as executive judgment. | `project_manager_judgment_packet.why_it_matters`; `Why it matters`. |
| `project.next_move` | `Next move` / `Decide the next narrow move` | Commit to the smallest meaningful move. | One concrete move has an owner, timing or trigger, and source/decision basis. | `project_next_action_packet`; next-move card and Alignment only when an executive loop remains open. |
| `project.people` | `People involved` | Connect the correct existing relationships and roles, including one project owner. | Each added person has a role; one owner is explicit. | `project_relationships_packet`, `project_owner_packet`, and local project-relationship links; people card. |
| `project.prepared_work` | `Prepared work` | Decide what VAL should prepare and the source/approval boundary. | A typed PreparedArtifact proposal has a source, audience, and review action. | `project_prepared_work_packets`; Project Managers and Leverage. |
| `project.documents` | `Documents / sources` | Attach or correctly interpret a source without altering it. | Document receipt is linked to the project and its intended use is known. | `document_receipt` and project source references; documents card and Documents drawer. |
| `project.risk` | `Risk / blocker` | Make a risk concrete and choose its smallest protective move. | Risk, impact, owner, mitigation, and watch condition are known. | `project_risk_packet`; risk/focus module. |
| `project.narrative` | `Working narrative` | Make the current state understandable to the executive. | A source-backed current-state narrative is prepared and applied. | `project_manager_judgment_packet.current_reality`; narrative card. |
| `project.needs_next` | `What VAL needs next` | Identify the one missing fact, decision, source, or person preventing safe management. | One next question or acquisition task is explicit. | `project_interview_packet`; Project Interview/Alignment when executive judgment is needed. |
| `project.sop` | `Operating system` | Select the closest operating pattern and record meaningful deviations. | SOP choice, fit reasoning, and deviations are explicit. | `project_sop_packet`; operating-system card. |
| `project.phase` | `Current phase` | Set the current phase and its evidence. | Current phase, exit condition, and next phase trigger are explicit. | `project_sop_packet.current_phase`; phase card. |
| `project.onboarding` | Future continuation after the project foundation is applied. | Complete the project manager's remaining onboarding picture. | Initial workstreams, milestones, nurture pattern, and prepared-work need are complete or explicitly deferred. | `project_interview_packet` plus the named Project Manager page sections. |
| `project.workstreams` | `Needs workstreams` / `Workstreams` | Build the complete, manageable lanes of work required to deliver the project outcome. | See the Workstreams contract below. | Structured `project_workstreams`; workstreams card and Project Manager Round Table. |
| `project.milestones` | `Milestones` | Define evidence-based checkpoints. | Each milestone is attached to an existing workstream and names its completion signal plus timing or trigger. | `project_milestone_packet`; milestones card. |
| `project.monitoring` | `Monitoring after launch` | Define what VAL watches after launch. | Each rule has a watch item, cadence, escalation trigger, and executive surface action. | `project_monitoring_packet`; monitoring card. |
| `project.relationship_nurture` | `Relationship nurture` | Protect the relationships that make the project viable. | Each rule is attached to an existing project relationship and has a cadence, useful touch, trust risk, and review trigger. | `project_relationship_nurture_packet`; nurture card. |

### Round Table Focus Contract

`project.overview` is the top Project Managers `Co-Work` button. It records one bounded Round Table Focus for the selected project only. The focus type must be `decision`, `plan`, `comparison`, `prepared_artifact`, or `missing_input`; it must name the exact question or work, a useful completion condition, the one existing Project Managers section that needs follow-through, basis, confidence, and immutable source references. The focus is an executive orientation aid, not a generic project chat and not a rewrite of the target section.

Every question maps directly to `project_overview_focus_packet.{focus_type,title,focus_statement,completion_condition,target_section,basis,confidence}` and to the visible Round Table focus at the top of the selected Project Manager. Applying it changes only that internal focus packet. It does not rewrite the selected follow-through section, create a task, generate content, send a message, update CRM, change a calendar, or alter a source.

### Workstreams Contract

`project.workstreams` is not a general brainstorming chat. VAL opens it already knowing the selected project, its desired outcome, project phase, people, commitments, documents, transcripts, prepared work, and source receipts.

VAL's objective is to prepare a complete set of workstreams, not merely collect an unstructured list.

Each prepared workstream has:

```text
name
purpose / outcome
accountable owner
current state
first concrete move
milestone or proof of progress
dependencies or blocker
monitoring signal
linked people and source receipts
```

Question logic:

1. If the project outcome is absent, ask the project-identity question first. Do not invent lanes.
2. Propose a small set of source-grounded lanes and ask the executive only to correct, add, merge, or remove them.
3. For each lane, ask only for the missing required field. Do not repeat answered questions.
4. If ownership is unclear, ask who is accountable for that one lane. Do not ask a generic "who owns the project?" again.
5. Show the proposed workstreams together before applying them.
6. Apply only after the executive confirms the prepared set. Then create an internal update receipt and return to the Workstreams section.

The workstreams conversation is complete only when every retained lane has the required fields above, or a field is explicitly marked `unknown` with the exact next question that will resolve it.

### Milestones Contract

`project.milestones` starts from the selected project's existing Workstreams packet. It never invents a lane merely to produce a milestone list.

Each prepared milestone has an existing workstream, checkpoint, concrete completion signal, timing or trigger, and source receipts.

If workstreams do not exist, VAL directs the executive back to the exact Workstreams section. Once workstreams exist, it asks only for the missing milestone fields, presents the complete set for review, and applies only to the selected internal Project Managers packet. It creates no task, event, CRM update, message, or document mutation.

### Monitoring Contract

`project.monitoring` defines the selected project's quiet-watch rules. Each rule names the specific item VAL watches, the cadence, the observable escalation trigger, and exactly what VAL should surface to the executive.

Existing workstream monitoring signals are brought into the Working Brief as context only. VAL does not silently convert them into rules, create an alert, make a task, send a message, update a CRM, change a calendar, or alter any source document. The executive reviews the prepared rules before they are applied to the selected internal Project Managers packet.

### Relationship Nurture Contract

`project.relationship_nurture` protects the relationships that make the selected project viable. It only accepts a relationship already linked through the selected project's People packet; a name from unrelated project evidence is not enough.

Each prepared rule names the project relationship, cadence, useful touch, trust risk, and review trigger. A useful touch describes value to bring, not a generic follow-up. Applying the packet does not draft or send outreach, create a task, update CRM, change a calendar, or alter source evidence.

### Risk / Blocker Contract

`project.risk` assesses one current, material project risk. It is not a generic prompt to list worries, and it must not manufacture a risk from an empty project shell.

When a material risk is present, the prepared packet names its type, concise summary, impact if ignored, severity, accountable existing project relationship, smallest mitigation, watch condition, confidence, and source receipts. The accountable person must already be linked through the selected project's People packet; a name from unrelated evidence is not enough.

When no material risk is proven, VAL can prepare an explicit internal no-risk assessment instead of inventing a blocker. Applying either outcome changes only the selected `project_risk_packet`. It does not create a task, alert, message, CRM update, calendar change, or alter source evidence.

### Why It Matters Contract

`project.why_it_matters` prepares the selected project's strategic judgment. It names the concrete consequence or opportunity, why it matters now, the basis for that judgment, and its confidence. The basis is either an available source receipt or explicitly labeled executive judgment; VAL must not blur the two.

Applying the prepared judgment updates only `project_manager_judgment_packet.why_it_matters`, `project_manager_judgment_packet.evidence_summary`, `project_manager_judgment_packet.confidence`, and the project's strategic-importance fields. It does not create a task, message, CRM update, calendar change, or alter source evidence.

### Working Narrative Contract

`project.narrative` prepares the selected project's current-state judgment. It captures the current reality, what VAL now knows, what is blocked (or the explicit statement `No current blocker`), the basis, and confidence. The basis is either an available source receipt or explicitly labeled executive judgment; VAL must not treat executive judgment as source fact.

Each question maps directly to `project_manager_judgment_packet.current_reality`, `project_manager_judgment_packet.what_val_now_knows`, `project_manager_judgment_packet.what_is_blocked`, `project_manager_judgment_packet.evidence_summary`, and `project_manager_judgment_packet.confidence`, as well as the visible Working narrative card. Applying the prepared narrative changes only that selected internal Project Managers packet. It does not create a task, message, CRM update, calendar change, or alter source evidence.

### What VAL Needs Next Contract

`project.needs_next` prepares one precise gap preventing safe management of the selected project. The gap must be a `fact`, `decision`, `source`, or `person`, with the missing item, why it matters, its resolving question or internal acquisition route, basis, and confidence. It is not a generic request for more context.

The type determines its exact target: a fact updates `project_manager_judgment_packet.what_val_now_knows`; a decision updates `project_manager_judgment_packet.user_decision_needed`; a source targets `project_document_receipts`; and a person targets `project_relationships_packet`. Every result also updates `project_interview_packet.current_question`, `question_purpose`, `target_packet_field`, `target_page_boxes`, and `missing_fields`, as well as the visible What VAL needs next card. Applying the prepared gap records only that internal packet; it does not reach out, fetch a source, create a task, message anyone, update CRM, change a calendar, or alter source evidence.

### Operating System Contract

`project.sop` selects the one operating pattern that should run the selected project. It may select only a current VAL operating system: `Frisson Partner Onboarding`, `Client Dashboard Buildout`, `Long-Term Partnership Nurture`, or `Create New SOP`. The result records the selected pattern, why it fits this project, material deviations (or `No material deviations`), basis, confidence, and immutable source references. It is not a freeform plan or a request for VAL to invent an operating system.

Every question maps directly to `project_sop_packet.sop_id`, `sop_name`, `fit_reason`, `known_deviations`, `basis`, and `confidence`, and to the visible Operating System card. Applying the prepared selection changes only the selected project’s internal SOP packet. It does not create a task, alter any workstreams, advance the phase, send a message, update CRM, change a calendar, or change source evidence.

### Current Phase Contract

`project.phase` records where the selected project is inside its already-applied operating system. It may select only a phase in that operating system’s sequence. The result records the current phase, evidence that the project is actually there, the phase exit condition, next-phase trigger, basis, confidence, and immutable source references. It does not infer an operating system or advance a project because a phase name sounds plausible.

Every question maps directly to `project_sop_packet.current_phase`, `phase_evidence`, `phase_exit_condition`, `next_phase_trigger`, `phase_basis`, and `phase_confidence`, and to the visible Current Phase card. Applying the prepared phase changes only the selected project’s internal SOP packet. It does not create a task, alter workstreams, change milestones, send a message, update CRM, change a calendar, or change source evidence.

### Prepared Work Contract

`project.prepared_work` records one reviewable artifact VAL should prepare for the selected project. It may select only an existing VAL artifact type: `proposal_draft`, `invoice_draft`, `agreement_draft`, `document_draft`, `copy_draft`, `html_page_draft`, `calendar_invite_draft`, `introduction_email_draft`, or `email_draft`. The result records its type, working title, intended audience, source receipt or project evidence, the outcome it should create, the review or approval boundary, basis, confidence, and immutable source references. It is a proposal for internal review, not generated external content.

Every question maps directly to `project_prepared_work_packets[].{kind,title,audience,source_context,desired_outcome,review_boundary,basis,confidence}` and to one Ready for You item for Leverage. Applying the prepared proposal changes only the selected project’s internal prepared-work packet and creates the internal review item. It does not draft content, send a message, create a provider draft, publish a page, create a calendar event, update CRM, alter a source, or create a task.

## Transcripts And Meeting Prep

| Entry id | Scope | Objective | Completion condition | Writes / result |
|---|---|---|---|---|
| `transcript.working_brief` | One selected transcript, exact Krisp receipt, linked calendar event/invitees, detected relationships/projects. | Turn the canonical Transcript Working Brief into prepared work, decisions, and packet updates without altering Krisp text. | Every proposed update/artifact is attached to an exact source line and has a review/apply route. | Transcript Working Brief, related packet proposals, WorkItems, attendee-email draft when applicable. |
| `meeting.prep` | One selected future calendar event and its meeting brief. | Prepare the executive for that meeting. | Brief includes purpose, people, changes, questions, risks, and intended outcome. | Meeting Prep packet and reviewable prepared artifacts. |

The current transcript drawer's inline chat and its drawer-wide Co-Work route are not sufficient. The future trigger must carry `transcript_id`, not merely the first loaded transcript or a generic timeline summary.

## Executive Inbox

| Entry id | Scope | Objective | Completion condition | Writes / result |
|---|---|---|---|---|
| `email.thread` | One selected email thread, readable message bodies, attachments, relationship/project matches, and existing draft. | Decide, prepare, or refine the right response to that thread. | A decision, exact requested clarification, or reviewable email artifact is visible and linked to the thread. | Email Judgment Packet, reviewable draft, related project/commitment proposals. |

The current `Discuss this thread with VAL` route carries a selected item summary, but it still uses generic chat. It must be replaced with the scoped Working Brief and typed output route above.

## Relationships

| Entry id | Scope | Objective | Completion condition | Writes / result |
|---|---|---|---|---|
| `relationship.overview` | One relationship packet and source-backed current state. | Clarify the useful next relationship move. | A source-backed decision, prepared artifact, or explicit unknown is ready. | Relationship packet, PreparedArtifact, or decision receipt. |
| `relationship.section` | One named relationship card, not the whole profile by default. | Improve the selected relationship section. | The selected section's required field is prepared and applied. | The exact relationship section and its history receipt. |

## Commitments

| Entry id | Scope | Objective | Completion condition | Writes / result |
|---|---|---|---|---|
| `commitment.follow_through` | One commitment record, exact evidence quote, owner, counterparty, due state, and related source. | Choose and prepare responsible follow-through. | A commitment decision, prepared draft/task, or status action awaits the appropriate approval. | Commitment Packet, prepared artifact, or action proposal. |

The current code contains a commitment Co-Work handler, but the active drawer does not render a validated Co-Work button. It must not be treated as an active production route until the entry is rendered and acceptance-tested.

## Documents

| Entry id | Scope | Objective | Completion condition | Writes / result |
|---|---|---|---|---|
| `document.interpret` | One document receipt, its immutable source, relationship/project links, and intended use. | Interpret the document or prepare a permitted derivative without changing the source. | The document's use, links, and any proposed artifact are visible and reviewable. | Document Round Table result, document links, PreparedArtifact if requested. |

The current code contains a document Co-Work handler, but the active drawer does not render a validated Co-Work button. It remains a target route, not a working user entry point.

## Lead Intelligence

| Entry id | Scope | Objective | Completion condition | Writes / result |
|---|---|---|---|---|
| `lead.run` | One protected scraper configuration, preview, selected rows, and connection status. | Improve criteria, inspect a result, or decide what may be approved for import. | A revised configuration, preview decision, or import approval packet is ready. | Lead Intelligence Packet and preview/import receipt. |

Lead Intelligence must continue to use the protected GOALL, Frisson, and Westwood scraper contracts. Co-Work may explain or refine a run; it may not bypass the configured preview and approve/hold flow.

## VAL Drawer

| Entry id | Scope | Objective | Completion condition | Writes / result |
|---|---|---|---|---|
| `val.witnessing` | Witnessing session state, exact approved question/prompt sequence, and user-provided imports. | Continue or complete first understanding. | The next approved Witnessing prompt or a reviewable imported understanding is visible. | Protected Witnessing records and review queue. |
| `val.teach` | Teach VAL correction or preference with its evidence. | Extract a reviewable learning candidate. | Candidate is ready for user review, not silently made durable. | Review-update record. |

Witnessing and Teach VAL are structured flows, not generic Co-Work. Their current protected prompts remain the source of truth.

## Home And Round Table Surfaces

| Entry id | Scope | Objective | Completion condition | Writes / result |
|---|---|---|---|---|
| `home.card` | Exact selected Home card plus its source item, Working Brief, and current action history. | Resolve or prepare the specific open loop the card represents. | The card's loop changes state, or VAL asks for the one decision needed to advance it. | Source-specific packet, PreparedArtifact, or action receipt. |
| `ready.work_item` | One Ready for You / Leverage WorkItem and its linked PreparedArtifact. | Review, revise, approve, or dismiss prepared work. | WorkItem state advances with a visible receipt. | WorkItem, Action Registry receipt, and source surface update. |

## Current Coverage Assessment

| Surface | Current contract status | What exists now | What is still missing |
|---|---|---|---|
| Project Managers | First sixteen canonical slices complete | `project.overview`, `project.identity`, `project.people`, `project.documents`, `project.milestones`, `project.monitoring`, `project.relationship_nurture`, `project.why_it_matters`, `project.risk`, `project.narrative`, `project.needs_next`, `project.sop`, `project.phase`, `project.prepared_work`, `project.workstreams`, and `project.next_move` now have server-owned Working Briefs, field-targeted questions, structured prepared work, explicit internal Apply, action receipts, and return to the selected project. Top `Co-Work`, `Start onboarding chat`, `Project interview`, `What this is`, `Why it matters`, `Working narrative`, `What VAL needs next`, `Operating System`, `Current Phase`, `Prepared work`, `People involved`, `Documents / sources`, `Risk / blocker`, `Milestones`, `Monitoring after launch`, and `Relationship nurture` now use registered entries rather than generic chat. | Every other Project Managers entry still uses the older scoped-chat/write-back path and must be replaced through this registry before it is treated as canonical. |
| Transcripts | First canonical slice complete | `transcript.working_brief` now loads one selected transcript, its exact Krisp Action Items and Key Points receipt, invitees, and draft state. It prepares the exact attendee meeting overview through an explicit internal Apply, creates a receipt, and never sends email or rewrites the source. The legacy freeform transcript chat route has been removed. | Typed packet outputs for transcript-derived project, relationship, commitment, and task work still need their own scoped entries. |
| Executive Inbox | Partial | Selected thread/source summary reaches a scoped chat launcher. | Typed email-thread brief, completion contract, and artifact/action routing. |
| Relationships | Partial | Relationship and selected-card summaries reach a scoped chat launcher. | Field-level objectives, target writes, and completion/apply contracts. |
| Commitments | Dormant | Handler code exists. | Visible validated entry point and the full contract above. |
| Documents | Dormant | Handler code exists. | Visible validated entry point and the full contract above. |
| Lead Intelligence | Unmapped Co-Work | Protected scraper flows exist. | Scoped Co-Work entry for a specific run without bypassing approval flow. |
| VAL drawer | Structured, not Co-Work | Witnessing and Teach VAL prompt suites are protected. | Explicit handoff only when a context-specific Co-Work task is appropriate. |

This is the source-of-truth assessment: VAL does **not** yet have a complete, implemented context-and-prompt map for every active Co-Work button. It has enough raw contracts to build one safely, and this registry is the gate that makes the rebuild cohesive.

## Implementation Gate

Before a drawer's Co-Work route is considered complete, automated coverage must prove:

1. every visible Co-Work trigger has one `entrypoint_id`;
2. the id resolves to exactly one registry entry;
3. the selected entity and selected section are supplied, not inferred from another active item;
4. the required packet and sources are loaded or the entry fails honestly;
5. every question is tied to a named field, decision, or artifact input;
6. the outcome renders as a typed internal update, decision, PreparedArtifact, or Action Proposal;
7. the user can apply, approve, decline, or return without losing the originating drawer; and
8. a receipt records the resulting state and source links.

No old `openContextualCoworkSession` fallback is allowed to remain as a competing route once its replacement entry is implemented.
