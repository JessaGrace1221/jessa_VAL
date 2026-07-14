# VAL First Look Repository Assessment

Status: approved implementation baseline

This assessment translates the Witnessing Session notes into the live VAL codebase before the First Look is built. It is the contract for replacing the current scattered connection and source-insight paths without losing the protected Witnessing prompts, packet model, or lead scrapers.

## 1. Relevant Files And Current Architecture

| Area | Current implementation | Decision |
| --- | --- | --- |
| VAL drawer | `hearth-prototype.html`, `hearth-prototype.js`, `hearth-prototype.css` | Replace the drawer entry with one explicit set of VAL modes and one session-owned connection moment. |
| Witnessing conversation | `PARTNERSHIP_PROTOCOL_CARDS` and `/api/teach-val/onboarding/*` in `server.js` | Protected. Keep the evidence -> observation -> confirmation loop. |
| Teach VAL persistence | `teach_val_onboarding_sessions`, `teach_val_imports`, `teach_val_memory_items`, `val_memory_items` | Protected. Extend, do not replace. |
| Source connections | Google and Microsoft OAuth in `server.js`; user integration credentials and tenant API keys | Consolidate behind a Witnessing connection-status API. |
| Source intelligence | `buildTeachValConnectedSourceInsights`, email/calendar helpers, transcript routes | Do not use this as the First Look directly. It is currently a partial 30-day scan with no immutable receipt. |
| Relationships and projects | `relationship_profiles`, `saveRelationshipProfile`, `saveRelationshipProjectLink`, project source helpers | Keep as downstream write targets only after First Look confirmation. |
| Evidence and memory | `saveEvidenceItem`, `saveEvidenceObservation`, `saveMemoryItem` | Keep. First Look must add source receipts and confirmation state before promotion. |

## 2. Current Witnessing Flow

The live flow already provides the strongest starting point in the product:

1. A user begins a Witnessing Session.
2. VAL asks one meaningful question at a time.
3. The answer is stored as a `witness_*` onboarding import.
4. VAL returns an observation that must be confirmed, corrected, or clarified.
5. The next question receives the earlier evidence chain.
6. The completed session can promote reviewed context into memory and evidence.

The flow has two correctness issues to remove during the rebuild:

- the old drawer offers duplicate Start Fresh and Resume entry points before a session exists;
- the legacy Jessa backup restoration helper can repopulate an old session when a user asks to resume. A clean first-run account must never hydrate that backup.

## 3. Existing Email Connector Support

Google OAuth stores per-user tokens in `val_oauth_tokens`. Gmail helpers retrieve readable messages, including bodies and attachments, and can persist canonical email records in `email_messages` and `email_threads`.

Microsoft OAuth also exists for Outlook and Microsoft Calendar. The connection is tenant/user scoped, but it needs to be represented beside Google rather than through a separate older settings screen.

Neither connector currently creates an immutable First Look source snapshot. The existing Teach VAL source-insight path reads a partial current view and must not be used as the one-time source of truth.

## 4. Existing Calendar Connector Support

Google Calendar and Microsoft Calendar are both available through their OAuth connections. Calendar events are already readable by VAL and relationship helpers can derive meeting-participant candidates. The existing connected-source insight path is only a 30-day email and calendar scan, so it does not satisfy the required three-month First Look boundary.

## 5. Existing Transcript Support

Krisp is supported through the Krisp MCP service and a tenant/user credential. Transcript intake, source receipts, exact Krisp Action Items, Key Points, transcript evidence, and review routes already exist under `/api/val/transcripts`.

The live First Look must read only the selected source window and preserve the exact source receipt. A non-Krisp source is not currently a generic live connector; it may be imported as a transcript source only when an actual connector or upload path is configured.

## 6. Existing Google Drive Support

The Google OAuth scopes and server helpers support Drive search, Google Docs reads, exports, and document metadata. Drive must be searched selectively after project and relationship candidates exist. The current code does not enforce that selective ordering and does not retain a First Look Drive search receipt.

## 7. Existing Stewardship Write Path

`saveRelationshipProfile` persists relationship packets. `services/valConversationIdentity.js` can resolve identity using exact email, local relationship profiles, and CRM context. This is a useful downstream target, but current callers can write relationship profiles outside a First Look confirmation transaction.

For First Look, relationship candidates stay in the First Look packet until the user confirms, corrects, defers, excludes, or merges them. Only an approved transactional apply may write Stewardship.

## 8. Existing Project Managers Write Path

Project evidence is currently represented through project-shaped relationship profiles, relationship-project links, project source helpers, documents, and project review updates. Project Managers remains intentionally unavailable in the user interface while its packets and persistence code are preserved.

First Look may prepare project candidates, but it must not create a project until the user confirms source-backed project evidence. The project candidate must include the protected Project Manager questions and uncertainty.

## 9. Existing Inbox Priority Path

The conversation identity service stores canonical email messages and writes `conversation_classifications`. It can derive conversation state, questions, commitments, relationship temperature, and source references. Executive Inbox presentation remains review-first.

First Look can propose inbox treatment such as `executive_priority`, `assistant_managed`, `project_specific`, or `exclude`. It must not alter inbox behavior until the user approves the proposed treatment.

## 10. Existing Identity Resolution Logic

`services/valConversationIdentity.js` resolves identity using:

- exact email matches in canonical email records;
- existing relationship profiles;
- optional CRM resolution;
- name similarity only as a lower-confidence candidate.

The existing resolver returns matched, probable, ambiguous, and no-match states. First Look must call it before record creation and must never silently merge ambiguous identities.

## 11. Existing Evidence And Confirmation Models

The system has the necessary foundation:

- `evidence_items` and `evidence_observations` preserve source-backed reasoning;
- Teach VAL imports keep raw source, structured summary, reviewed state, and status;
- Witnessing uses the V/O/C integrity chain: user evidence, VAL observation, user confirmation;
- review updates and audit logs can record approval decisions.

What is missing is a single immutable First Look report that groups its evidence, candidate decisions, proposed system changes, and transaction receipt.

## 12. Gaps Against The First Look Specification

1. No single connection hub lives inside the Witnessing Session.
2. Existing Google and Microsoft success pages do not return the user to the active Witnessing moment.
3. The existing source-insight pass is 30 days, not the required 90 days.
4. There is no immutable First Look snapshot or one-time enforcement.
5. Relationship, project, role, writing-style, and inbox candidates are not yet held in one confirmation packet.
6. There is no transactional preview and apply across Stewardship, projects, documents, and inbox treatment.
7. A confirmed, context-specific writing profile is not yet a required dependency for all user-facing drafting.
8. The current VAL drawer exposes several older workspace launchers instead of four clear modes.
9. Old session restoration can violate the clean first-run baseline.

## 13. Recommended Implementation Phases

### Phase 1: Canonical Witnessing Entry And Connection Hub

- Retire duplicate first-run actions and legacy session resurrection.
- Put Google, Outlook, Krisp, OpenAI, and Outscraper connection controls in the `Connect Your World` Witnessing movement.
- Show each source's purpose, connection status, and honest limitation.
- Do not scan, classify, or write any business record in this phase.

### Phase 2: First Look Snapshot

- Add one immutable, 90-day source snapshot per user.
- Capture Gmail or Outlook, calendar, and connected transcripts that are available at the time of the snapshot.
- Retain source receipts, connection availability, exclusions, and the exact time window.
- Once a snapshot is complete, it may be reopened and reviewed but never regenerated.

### Phase 3: Candidate Packets And Confirmation

- Resolve identity before creating candidates.
- Produce relationship, project, support-role, inbox-treatment, writing-context, LinkedIn-watch, and open-loop candidates.
- Present one category at a time with source evidence and clear confirmation controls.

### Phase 4: Transactional Apply

- Preview every downstream change.
- Apply approved relationship, project, document-link, inbox-treatment, and authority changes in one database transaction.
- Return an auditable success or failure receipt; never partially apply.

### Phase 5: Writing And Immediate Leverage

- Promote confirmed writing contexts into a canonical, system-wide dependency.
- End the First Look with at least one evidence-supported prepared item, never only a completion message.

## 14. Required Database Changes

Additive migrations only:

| Table | Purpose |
| --- | --- |
| `val_first_look_runs` | One immutable First Look snapshot and report per tenant/user, including its exact 90-day boundary and state. |
| `val_first_look_candidates` | Reviewable relationship, project, role, writing, inbox, LinkedIn, and open-loop candidates with evidence and user decision. |
| `val_first_look_change_sets` | Proposed downstream updates, user confirmation, atomic apply result, failure detail, and created/updated IDs. |
| `val_writing_profiles` | Confirmed global and context-specific writing profiles, approved examples, prohibited language, provenance, and revision history. |
| `val_communication_profiles` | Confirmed situational communication preferences used by Co-Work, notifications, and VAL's direct conversation. |

These tables complement the protected onboarding, evidence, and memory tables. Nothing existing is deleted.

## 15. Required API Changes

Phase 1 establishes:

- `GET /api/val/witnessing/connections` - safe status for Google, Outlook, Krisp, OpenAI, and Outscraper;
- `POST /api/val/witnessing/connections/:provider` - securely save and validate supported API credentials;
- OAuth links for Google and Microsoft remain the canonical connection mechanism.

Later phases establish:

- `POST /api/val/first-look/prepare` - create the one immutable source snapshot;
- `GET /api/val/first-look` - return the original report and current confirmation state;
- `POST /api/val/first-look/:runId/candidates/:candidateId/decision` - confirm, correct, defer, exclude, or merge;
- `POST /api/val/first-look/:runId/apply` - atomically apply an approved change set;
- `GET` and `POST` routes for the canonical writing and communication profiles.

## 16. Required UI Changes

- A calm first-run VAL drawer with only one primary action: `Begin Witnessing Session`.
- A session-owned `Connect Your World` step with five explicit source cards:
  Google, Outlook, Krisp transcripts, OpenAI, and Outscraper.
- Each card must show what VAL can learn, what it cannot do, real connection status, and a direct connection action.
- Witnessing stays conversational before the First Look; a separate `The First Look` panel explains the one-time, review-only 90-day source review.
- Users may reopen every answered Witnessing movement later to read, correct, or add context. The First Look source snapshot itself is immutable after it is created.

## 17. Migration Requirements

- Preserve all protected prompt documents and lead-scraper routes.
- Do not repopulate archived seed data or the Jessa Witnessing backup for a clean user.
- Add tables and routes before moving any old UI trigger.
- Quarantine older connection/settings launchers only after the new session hub works in production.
- Keep OAuth tokens and API credentials tenant/user scoped and encrypted. Never expose stored key values.

## 18. Required Tests

- A clean user sees one Witnessing start action and no resume/fresh duplicate state.
- A clean user cannot load the legacy Witnessing backup.
- Connection status reports Google, Outlook, Krisp, OpenAI, and Outscraper without leaking credentials.
- OpenAI, Krisp, and Outscraper credential writes are encrypted, scoped, and testable.
- First Look cannot start without a valid 90-day source boundary.
- First Look creates exactly one immutable source snapshot per user.
- Identity ambiguity blocks relationship creation.
- Candidate decisions do not update drawers until transactional apply.
- A failed transactional apply leaves every downstream target unchanged.
- Confirmed writing profiles are required by a user-voice draft route.
- Legacy connection and onboarding entry points are not invoked by the VAL drawer.

## 19. Risks And Technical Constraints

- Google and Microsoft OAuth currently finish on a minimal success page. A return-to-Witnessing handoff is needed for a seamless experience.
- Krisp is a live supported transcript connection. Otter or another provider needs its own verified connector or a deliberate upload/import route; VAL must not claim it is connected before that exists.
- Existing email/calendar source insight is not a safe substitute for the First Look because it is not immutable and uses a different time window.
- Writing profiles require an explicit global read contract before changing all drafting routes. A one-off prompt cannot enforce system-wide voice.
- The current relationship and project persistence paths predate this flow. First Look must wrap their approved writes in a single transaction rather than call them opportunistically.

## Immediate Build Boundary

The next implementation step is Phase 1 only: make the source connection moment explicit inside Witnessing, remove stale first-run behavior, and preserve honest connection state. No First Look scan, candidate creation, or cross-drawer write will happen until the immutable snapshot and confirmation model exist.
