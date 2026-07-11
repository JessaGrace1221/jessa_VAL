# VAL Stewardship Decision Engine Conflict Map

Status: Documentation-first audit.

No runtime implementation is approved by this document.

Source spec: [VAL_STEWARDSHIP_DECISION_ENGINE_SPEC.md](./VAL_STEWARDSHIP_DECISION_ENGINE_SPEC.md)

Purpose: identify where current services, UI, data shape, prompts/docs, and tests still conflict with the Stewardship decision engine before more code is written.

## Executive Summary

Current Stewardship is closer than it was, but it is still not yet the decision engine described in the spec.

The biggest conflicts are:

1. admission is not yet a first-class decision with `admitted|rejected|blocked_by_identity|watch`
2. relationship packet maturity is still computed loosely and does not include `blocked_by_identity`
3. next-move logic is still mostly introduction matching with a broader label
4. explicit commitments are not yet ranked above inferred opportunities
5. the UI still exposes older concepts such as temperature, waiting state, open-loop counts, observer posture, and dossier sections
6. tests still lock in legacy internal names and temperature/open-loop behavior
7. prompt/docs still contain older "who should meet whom" and opportunity-map framing in places

The next implementation should not start with UI polish. It should start by building the admission and maturity gate, because every useful executive surface depends on knowing which people belong in Stewardship at all.

## 1. Service Conflicts

### `services/valRelationshipActionIntelligence.js`

Current behavior:

- `personPacketFromContact()` creates person packets from contact-shaped data without a formal admission decision.
- `packet_state.maturity` is currently `thin|developing|usable` based mostly on identity, needs/offers, and evidence length.
- `blocked_by_identity` does not exist as a maturity state.
- `relationshipIntroCandidates()` is still the main next-move function.
- `introductionDirection()` only evaluates bidirectional needs/offers for introduction-like matches.
- `complementaryScore()` uses word overlap and evidence text overlap, which can create false confidence when two people share vocabulary.
- `stewardshipMovePacket()` exists, but it is fed by introduction candidate logic.
- `relationshipStewardshipReviewSurface()` is a wrapper around `relationshipIntroReviewSurface()`.
- Weak matches are filtered out by score, but rejected alternatives and rejection reasons are not preserved in the output.

Conflict with spec:

- The spec requires an admission output before visible Stewardship membership:

```json
{
  "admission_status": "admitted|rejected|blocked_by_identity|watch"
}
```

- The spec requires maturity to describe reliable relationship understanding, not contact completeness.
- The spec requires multiple move types: introduce, follow up, reconnect, ask question, send something, wait/watch, do nothing.
- The spec requires explicit commitments to outrank inferred opportunities.
- The spec requires rejection tests before choosing a move.
- The spec requires `rejected_alternatives`, `missing_context`, `risks`, and plain-language explanation.

What must change:

- Add a formal relationship admission function.
- Add a formal packet maturity function.
- Rename or wrap introduction-specific functions behind a move engine.
- Preserve introduction as one move type, not the matching engine itself.
- Add explicit commitment detection before inferred matching.
- Add rejection-test output.

What remains valid:

- `personPacketFromContact()` is a useful starting packet constructor.
- `sourceReceipts()` is useful.
- `contactId()` correctly rejects raw `email:` and `person:email:` pseudo IDs.
- `stewardship_move_packet` is the right direction, but needs a real decision engine behind it.
- Review-only/no-external-action boundaries remain valid.

## 2. Relationship Index / Admission Conflicts

### `server.js`

Current behavior:

- `/api/relationships/index` builds profiles, admits/dedupes them, and maps to index items.
- `/api/relationships/person-packets` builds admitted profiles and maps to packet rows.
- Spam and raw-handle filtering has improved, but admission is still not expressed as the spec's `admission_status` decision.
- Current relationship inclusion still depends on scattered helpers rather than a single relationship admission contract.
- The `find_relationship_introductions` action now returns `stewardshipMovePackets`, but the route still starts from introduction-oriented action naming and candidate grouping.

Conflict with spec:

- A sender can still become a relationship-looking object if upstream profile construction treats them as meaningful.
- The system does not yet store why a person was admitted, rejected, blocked, or watched.
- Blocked identity is not consistently represented as a hidden/internal packet barred from matching.
- The route does not yet consider follow-up, ask-question, send-something, wait/watch, or do-nothing as first-class moves.

What must change:

- Add one service-level admission gate used by index, person-packets, and matching.
- Store admission output on every packet/profile.
- Use admission status to decide visibility:
  - `admitted`: visible when maturity/queue rules allow
  - `watch`: internal or People To Watch only
  - `blocked_by_identity`: identity review only, no matching
  - `rejected`: no Stewardship item
- Rename route behavior internally after compatibility is safe.

What remains valid:

- Keeping the existing route ID temporarily for compatibility is acceptable.
- Auth guard and review-only behavior remain valid.
- The recently added `stewardshipMovePackets` response is a useful bridge.

## 3. UI Conflicts

### `hearth-prototype.js`

Current behavior:

- The visible button now says `Review next move`.
- The review workspace now says `Relationship stewardship review`.
- The underlying UI still uses:
  - `relationshipIntroCandidatePackets`
  - `prepareRelationshipIntroReview`
  - `introReviewLines`
  - `introReviewActions`
  - `introDraftCandidates`
  - `openRelationshipIntroReview`
- The Rolodex still prominently uses relationship temperature, waiting state, state filters, open loops, and temperature correction review.
- Sorting still considers state rank, changed time, temperature score, and name.
- The Stewardship detail still carries dossier-like sections:
  - key facts
  - network stewardship cards
  - linked projects
  - relationship actions
  - observer controls
- The "temperature thing" remains visually present but not executive-explained in the terms of the new decision engine.

Conflict with spec:

- The executive UI should show one primary next move, why now, what is open, evidence, and relevant controls.
- It should not force the executive to interpret temperature, waiting, open-loop counts, observer labels, or several equal recommendations.
- It should not rank by email volume, open-loop count, or alphabetic fallback.
- It should not show buttons that do not correspond to real behavior.
- It should not become an internal dossier.

What must change:

- Replace the primary Stewardship list row model with:
  - Person
  - Why this person matters
  - What is open
  - VAL's next move
  - Why now
  - Evidence posture
  - Relevant controls only
- Replace temperature-first sorting with decision-engine ordering:
  1. explicit commitments ready for approval
  2. explicit commitments blocked by one clear missing fact
  3. high-value moves ready for review
  4. time-sensitive relationship moves
  5. questions that unlock a meaningful move
  6. people worth watching
  7. no-action items hidden
- Keep `Refresh observers` only if it maps to a real source refresh/review behavior.
- Hide no-action items from the active queue.

What remains valid:

- The top-level Stewardship drawer can remain.
- The three person-packet cards can remain if their copy is converted from "network introduction" to source-backed relationship judgment.
- The `Review next move` entry point remains valid.
- The back-to-person/workspace mechanics remain valid.

## 4. Command Center Conflicts

### `command-center.js`

Current behavior:

- Relationship dossier action output now says `Next relationship move ready`.
- The registry still uses `relationshipIntroCandidateRegistry`.
- Cards still render `Draft intro for review` as the primary action for every candidate.
- The action panel still assumes `whoNeedsThisPerson` and `whoThisPersonNeeds` sections.

Conflict with spec:

- The command center should render the selected move type, not assume introduction draft.
- A follow-up, ask-question, wait/watch, or do-nothing result should not show `Draft intro for review`.
- It should not expose debug-ish confidence output as the central executive message.

What must change:

- Add move-aware rendering:
  - introduce -> Review draft intro
  - follow_up -> Review follow-up draft or mark complete
  - ask_question -> Answer question / add context
  - send_something -> Review resource
  - wait_watch -> Set watch trigger / wait
  - do_nothing -> no active item
- Rename internal registries when safe, or wrap them so the UI no longer assumes all candidates are intro candidates.

What remains valid:

- The command-center review panel is useful as a secondary/admin surface.
- Review-first/no-external-action language remains valid.

## 5. Data Shape Conflicts

Current behavior:

- Person packets contain:
  - who this person is
  - what this person needs
  - what this person offers
  - relationship state
  - evidence
  - packet state
- Move packets now exist but are still introduction-derived.
- Relationship dossier outputs still include observer notes, current reality, executive assessment, strategic importance, and action groups.

Conflict with spec:

- Admission decision is missing as a durable structured output.
- Maturity does not include `blocked_by_identity`.
- Next move output does not fully match the spec:

```json
{
  "move": "",
  "plain_summary": "",
  "why_now": "",
  "relationship_value": "",
  "source_receipts": [],
  "missing_context": [],
  "risks": [],
  "confidence": "",
  "prepared_work_allowed": false,
  "approval_required": true,
  "rejected_alternatives": []
}
```

- Explicit stewardship commitments are not yet their own durable action-layer object.

What must change:

- Add `relationship_admission` to packet/profile output.
- Add `packet_maturity` output separate from relationship value/importance.
- Add `next_move_decision` output separate from the person packet.
- Add `stewardship_commitment` for direct user commitments.

What remains valid:

- `person_packet` remains the knowledge layer.
- `stewardship_move_packet` remains the right action-layer direction.
- Source receipts remain mandatory.

## 6. Prompt / Documentation Conflicts

Current behavior:

- `VAL_STEWARDSHIP_ROUND_TABLE_AND_PACKETS.md` still contains sections titled around matching, opportunity packets, and who should meet whom.
- `VAL_PRODUCT_PHILOSOPHY_AND_INFORMATION_ARCHITECTURE.md` still references opportunity and introduction maps.
- Older docs still include relationship temperature as a core concept.
- `VAL_STEWARDSHIP_PACKET_SORTING_SPEC.md` has moved in the right direction but should now defer to the decision-engine spec for admission/maturity/next-move rules.

Conflict with spec:

- The new center is not "who should meet whom." It is "what is the most thoughtful next relationship move, if any?"
- Introductions are one move type.
- Relationship memory exists to support judgment, not to expose a dossier.

What must change:

- Add a cross-reference from packet sorting and round-table docs to the decision-engine spec.
- Mark introduction/opportunity language as legacy where it remains.
- Keep "who needs whom" only as a sub-question inside the introduction move.

What remains valid:

- "Packets, packets, packets" remains valid.
- Person packet fields `who_this_person_is`, `what_this_person_needs`, and `what_this_person_offers` remain valid.
- Round Table prompt layering remains valid.

## 7. Test Conflicts

### `test/valRelationshipActionIntelligence.test.js`

Current behavior:

- Tests assert canonical CRM identity.
- Tests assert review-only intro candidates.
- Tests assert introduction direction.
- Tests now assert `stewardship_move_packet` but still through introduction candidate flow.

Conflict with spec:

- Tests do not cover relationship admission states.
- Tests do not cover rejected spam/cold inbound.
- Tests do not cover `blocked_by_identity`.
- Tests do not cover follow-up, ask-question, send-something, wait/watch, or do-nothing.
- Tests do not assert explicit user commitment priority over inferred opportunities.
- Tests do not assert rejected alternatives.

Required future tests:

- spam inbound sender is rejected
- sent email without reply can be admitted when user intent is clear
- explicit user teaching admits a person
- blocked identity prevents matching
- thin packet cannot prepare work
- developing packet can ask a precise question or wait/watch
- usable packet can consider moves
- strong packet can prepare work for approval
- explicit Terrie/Kareemah commitment outranks inferred intro
- Michele does not inherit Mike evidence
- Mark returns wait/watch or do-nothing with a clear reason

### `test/hearthLeadIntelligence.test.js`

Current behavior:

- Tests still encode temperature model expectations.
- Tests assert `find_relationship_introductions`.
- Tests assert `relationshipIntroCandidatePackets`, `normalizedIntroCandidate`, `introDraft`, and related functions.
- Tests keep the selectable file cabinet/Rolodex model.

Conflict with spec:

- Tests should shift from proving the old Rolodex and temperature mechanics to proving the executive decision row.
- Compatibility tests may keep old function names temporarily, but product contract tests should assert the decision-engine UI.

### `test/valRelationshipDossier.test.js`

Current behavior:

- Tests assert relationship dossier shape.
- Tests assert observer notes.
- Tests assert actions such as draft message, LinkedIn comment/DM, create task, brainstorm, review LinkedIn, review next move, refresh observers, mark VIP, snooze, not important.
- Tests assert temperature fields and observer labels.

Conflict with spec:

- The new active Stewardship UI should not show broad action menus.
- Buttons must have real behavior and be relevant to the selected move.
- Observer labels should not be executive-facing evidence posture.

## 8. Existing Behaviors This Replaces

This decision engine replaces:

- admitting people because they appear in inbox, scraped data, or public enrichment
- treating one-way cold inbound as a relationship
- ranking relationships by temperature, open-loop count, email volume, or alphabetic fallback
- forcing relationship moves into introductions
- showing several equal candidate recommendations
- making the executive interpret "waiting" without saying what is waiting for what
- exposing observer/debug/source plumbing instead of a short evidence posture
- using vague "needs more evidence" copy
- creating relationship actions from overlapping words alone

## 9. What Must Be Removed Or Hidden

Remove or hide from the active executive Stewardship queue:

- spam/cold inbound senders
- generic mailboxes
- raw handles
- no-action items
- no-source claims
- irrelevant buttons
- observer/debug labels
- confidence/debug output as primary copy
- project task counts not tied to the relationship
- open-loop counts without a named open matter
- temperature as the main decision cue

Do not remove source evidence. Move it behind source review or evidence posture.

## 10. What Remains Valid

These should be preserved:

- documentation-first workflow
- person packets as the knowledge layer
- stewardship moves as the action layer
- Round Table prompt layering
- source receipts
- review-first/no-external-action safety
- CRM identity anchoring when reliable
- user teaching as a valid relationship signal
- sent email/user-initiated intent as a valid relationship signal
- explicit commitments as highest-priority action candidates
- Leverage as the place for prepared work after the move passes decision tests

## 11. Proposed First Implementation Slice

Do not start with UI redesign.

First slice:

1. Add `relationshipAdmissionDecision(input)` in `services/valRelationshipActionIntelligence.js` or a new focused service.
2. Add `packetMaturityDecision(personPacket, admissionDecision)`.
3. Wire admission/maturity into person packet output without changing visible UI yet.
4. Add tests for:
   - spam inbound rejected
   - sent email admitted without reply
   - explicit user teaching admitted
   - blocked identity created and barred from matching
   - public enrichment alone cannot exceed thin
5. Update `/api/relationships/person-packets` to include admission/maturity fields.
6. Do not change the visible Stewardship layout until the data gate is correct.

Why this first:

- It directly addresses the spam/false relationship problem.
- It gives Mike-style missing/alias cases a structured place to land.
- It prevents future UI from prettifying bad data.
- It creates the foundation for next-move sorting.

## 12. Tests That Must Prove The Engine Works

Minimum acceptance tests before UI work:

- one-way cold inbound sender returns `admission_status: rejected`
- repeated newsletter/promotional sender returns `admission_status: rejected`
- sent email to new real person returns `admission_status: admitted` or `watch`
- user teaching returns `admission_status: admitted`
- meaningful transcript mention with unresolved identity returns `blocked_by_identity`
- blocked identity does not appear in introduction/move candidates
- direct "I will introduce Terrie to Kareemah" creates explicit introduction commitment
- explicit commitment ranks above inferred overlap
- Michele/Mike evidence does not cross-contaminate
- Mark developing packet returns wait/watch or do-nothing, not forced intro/follow-up

## 13. Implementation Approval Gate

No runtime changes should begin from this conflict map.

The user must explicitly approve with:

```text
Approved. Implement this documentation.
```

Until then, the next appropriate work is review, correction, and tightening of this documentation.
