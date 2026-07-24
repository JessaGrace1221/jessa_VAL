# VAL System-Wide Integrity Audit

Date: 2026-07-24  
Repo: `jessa_VAL-home-page-ui-clean`  
Audited commit: `f143726ec26cf33fdd78c2616af2f203c07170fe`

## Scope

This is a code-and-test integrity audit. It checks visible user promises against the current frontend, backend routes, service contracts, and regression tests.

It is not yet a full live-tenant click test with connected Gmail, Google Calendar, Outlook, GHL, Deepgram, Krisp, Outscraper, Apollo, and Railway production credentials. A promise can therefore be:

- `Confirmed`: wired in code and covered by focused regression tests.
- `Partial`: wired for the main path, but missing a source hook, live credential path, or regression proof.
- `Unproven`: visible or implied in UI, but not safe to promise yet.
- `Stale Test`: behavior may exist or has been intentionally renamed, but a contract test is failing and must be reconciled before release confidence.

## Executive Summary

VAL is much stronger than it was. The core architecture now protects the most important promises:

- Home VAL is the broad Chief of Staff lane.
- Function-specific chats stay scoped to their source/function.
- External actions are review-first and approval-gated.
- Executive Inbox, Transcripts, Meeting Prep, Co-Work, Board packets, Board observer reviews, Ready For You, Commitments, Documents, Stewardship profiles, and source processing all have real backend surfaces and tests.
- Every live Board packet is now visible to every Board Observer, and every Observer stores its own packet review.

The biggest integrity risks are not the main architecture. They are:

- some stale/static tests failing after UI and language refactors;
- not every future source is Board-packet-live yet;
- some visible buttons are still local/prototype or review-only despite action-sounding labels;
- GHL Voice can speak through VAL, but full external action completion depends on GHL custom action/webhook orchestration and provider credentials;
- live tenant verification still needs to be done after deployment with real connected accounts.

## Full Test Result

Command:

```sh
node --test
```

Result:

- 508 tests
- 500 passing
- 8 failing

Failing areas:

- `test/contextualChat.test.js`: 3 stale/contract failures around named `chatContextCorrection` and shared conversational contract text.
- `test/executiveBriefing.test.js`: 1 failure proving Home chat still includes exact Executive Briefing "why" wording.
- `test/hearthLeadIntelligence.test.js`: 2 failures around desk companion contract strings and deep source completeness registry coverage.
- `test/intelligenceBackfill.test.js`: 1 failure around transcript archive/index merge contract.
- `test/tenantApiKeyVault.test.js`: 1 failure around first-run Google connection visibility.

Focused green suite for the newly updated Board/voice/context core:

```sh
node --test test/valBoardPackets.test.js test/valIntelligenceSpine.test.js test/valCowork.test.js test/voiceIntegrationRegression.test.js
```

Result:

- 74 passing
- 0 failing

## System-Wide Promise Ledger

| Surface | User Promise | Completion Path | Status | Evidence | Integrity Notes |
|---|---|---|---|---|---|
| Login | Secure private entry into VAL. | `/login`, `/api/auth/login`, `/api/auth/me`, password setup/reset routes. | Confirmed | Auth routes and UI exist in `server.js`; security tests exist. | Needs live production auth test after deploy. |
| Set Password | User can set/reset password securely. | `/set-password`, `/api/auth/request-password-setup`, `/api/auth/set-password`. | Confirmed | Auth handlers in `server.js`. | Setup link display is test-friendly; production delivery should be reviewed. |
| Home Page | VAL is present, protective, context-aware, and does not move without approval. | Hearth dashboard, Home VAL chat, cards, calendar/sidebar widgets, Executive Functions drawer. | Partial | Home chat and UI tests; `voiceIntegrationRegression.test.js`; `hearthLeadIntelligence.test.js` mostly passes but has failures. | The visual promise is strong; full integrity depends on resolving failing Hearth contract tests and live credential checks. |
| Refresh Perspective | Refresh Home recommendations without external action. | `data-refresh-perspective`, dashboard/perspective API context. | Partial | Frontend handler exists; Home route has perspective refresh wiring. | Needs explicit button-level regression proving it refreshes the right data and never writes externally. |
| Alignment Card | Surface the highest-priority judgment/work needing attention. | Home workspace `alignment`, open loops/review candidates/Ready For You. | Partial | Home card and Ready For You tests. | "Always create/load draft" requirement must remain enforced wherever Alignment references draftable work. |
| Leverage Card | Surface prepared work waiting for approval/review. | Ready For You, drafts, external action packet review. | Confirmed | `valReadyForYou.test.js`, `preparedArtifactReviewSurface.test.js`, `valExternalActions.test.js`. | Strong review-first path. Continue preventing generic draft fallback. |
| Open Executive Functions | Open the compass/function layer and return correctly. | Drawer/compass UI in `hearth-prototype.html/js`. | Partial | UI contract tests. | We fixed major close/return behavior earlier; needs browser click test after deployment. |
| Board of Observers | Transparent reasoning layer; every live packet is seen by every Observer. | `val_board_packets`, Intelligence Spine observer runs, Board UI live context. | Confirmed for live registered sources | `valBoardPackets.test.js`, `valIntelligenceSpine.test.js`. | Do not claim every possible future source is live until source registry says live. |
| Board Observer Cards | Clicking an Observer shows that Observer's lens and lets user chat with that Observer. | Observer card UI, scoped Co-Work `observer.discussion`. | Confirmed core / needs browser polish check | `valCowork.test.js`, Board UI code. | Cards should close on outside click and chat should return to Board; live click test still recommended. |
| Chief of Staff | Home VAL can synthesize across the Board and system context. | Home `/api/val/chat`, Board packet context, latest observer reflections. | Confirmed core | `voiceIntegrationRegression.test.js`, `valIntelligenceSpine.test.js`. | Executive Briefing exact wording test currently failing; fix before overclaiming "why" briefing fidelity. |
| Witnessing / Teach VAL | Gather foundational context before packets appear; save user-revealed truth with review. | Teach VAL onboarding, Witnessing answers, First Look, Board packet creation. | Confirmed core | `cleanBaselineGuard.test.js`, `witnessingPacketMap.test.js`, Board packet tests. | Needs live onboarding completion path test in browser after deploy. |
| Before Witnessing | No packet orbs; hold space for Analytical and Relational Context. | Board UI gating on witnessed/live packets. | Confirmed by contract | Board UI contract and packet tests. | Verify exact empty-state copy in browser. |
| After Witnessing | At least 20 starter packet orbs can appear from real Witnessing context. | Witnessing answer/commit packets and Board UI live packet rendering. | Partial | Witnessing packet hooks exist. | Need a regression that asserts "at least 20" after a realistic completed Witnessing seed. |
| Executive Inbox | Only conversations needing judgment appear; drafts remain private until approved. | Durable conversation identity, classification, queue/thread/detail, draft readiness, safe contacts/rules. | Confirmed core | `valExecutiveInbox.test.js`, `gmailFreshness.test.js`, `inboxCommand.test.js`. | Live Gmail/Outlook credential test still needed. |
| Executive Inbox Filters | Requires Reply, Waiting on You, FYI/Tracking, All filter the queue. | Frontend filters plus `/api/val/executive-inbox/queue`. | Partial | UI present; queue/classification tests. | Needs button-level UI test confirming counts and filter state. |
| Executive Inbox Controls | Rules, Tone Rules, Search Inbox, Save Contact, Save Rule, Suggest Rules. | `/api/email/rules`, `/api/email/inbox-command`, safe-contact routes. | Partial | Gmail/rules tests. | Some controls are advanced; each needs explicit "does it save and persist" browser/API check. |
| Executive Inbox Draft Reply | Generate a review-only draft from selected thread. | `generate`, Co-Work email thread, Ready For You/Leverage handoff. | Confirmed | `valExecutiveInbox.test.js`, `valCowork.test.js`, `preparedArtifactReviewSurface.test.js`. | Strong: no generic draft when thread content missing. |
| Executive Inbox Send | Send only through external action gate/approval. | External action packets, final confirmation, provider adapter. | Confirmed core | `globalSendGate.test.js`, `valExternalActions.test.js`. | Live Gmail/Outlook send requires connected provider and final manual confirmation. |
| Full Calendar | Show full calendar and meeting context. | Calendar sidebar/full panel, Google/Microsoft calendar routes, Meeting Prep. | Partial | Calendar and Meeting Prep tests. | First-run Google connection test failing; live provider test needed. |
| Meeting Prep | Build source-backed prep from calendar, attendees, transcripts, relationships, public evidence. | `valMeetingPrep` service/routes, calendar event save, attendee packeting. | Confirmed core | `valMeetingPrep.test.js`. | External enrichment depends on keys; failures should degrade visibly, not invent facts. |
| LinkedIn Function | Manage LinkedIn posts/instructions and keep review boundaries. | Home LinkedIn widget plus GHL social/blog routes. | Partial | UI exists; GHL routes exist. | Recently changed into two pages; needs fresh regression specifically for Posts + Instructions. Board registry still marks `linkedin_visibility` pending. |
| Teach VAL Button | Open onboarding/teaching, never external action. | Teach VAL/Witnessing routes. | Confirmed core | Teach/Witnessing tests. | Needs browser QA for visual state and return path. |
| Project Managers | Manage project profiles, source packets, workstreams, milestones, monitoring, narrative, risks, prepared work. | Project Managers UI, project Co-Work routes, source processing, pins. | Confirmed core | `valCowork.test.js`, `valSourceProcessing.test.js`, `valProjectPins.test.js`. | Board registry still marks project profile mutation packets pending. Need source hook for every project save/update. |
| New Project | Create a local project with owner/SOP/files; no external action. | Project create form and save routines. | Partial | Project Co-Work/source tests. | Needs button-level test for form submit and upload behavior. |
| Project Co-Work Buttons | Each project subsection opens a scoped Co-Work route and applies only mapped fields. | Registered project entrypoints and apply handlers. | Confirmed | `valCowork.test.js`. | Strong scoped behavior; preserve exact route contracts. |
| Stewardship / Relationship | Maintain living relationship profiles, person packets, evidence, introductions, Rolodex details. | Relationship dossier/action intelligence, Stewardship Network UI, contacts create/update. | Confirmed core | `valRelationshipDossier.test.js`, `valRelationshipActionIntelligence.test.js`, `intelligenceBackfill.test.js` mostly. | Need Board packet hook for every relationship profile mutation; currently pending in registry. |
| Add Person | Add person with email/phone in GHL-readable format. | Stewardship add form, relationship profiles/Rolodex. | Confirmed core | `voiceIntegrationRegression.test.js` tests GHL-ready email and phone. | Needs browser form test and import test. |
| Refresh from Sent Mail | Admit known contacts from sent mail into Stewardship. | Gmail/sent mail relationship admission. | Partial | Gmail freshness/intelligence backfill tests. | Live Gmail credential test required. |
| Refresh Public Context | Refresh public context without poisoning identity. | Outscraper/Apollo/public enrichment gates. | Partial | Meeting Prep and relationship tests quarantine unsafe identity. | Requires keys; public research Board source is pending. |
| Create Introduction | Generate relationship introduction with review-only draft. | Relationship matching/draft/introduction review. | Confirmed core | `valRelationshipActionIntelligence.test.js`. | Sending must remain behind external action gate. |
| Transcripts | Ingest transcripts as source truth; preserve evidence; extract tasks/decisions/drafts for review. | Transcript API, Krisp sync, transcript intelligence, review queues. | Confirmed core with one migration gap | `valTranscriptIntelligence.test.js`, `transcriptIntelligenceIndex.test.js`, `krispMcpService.test.js`; one `intelligenceBackfill` failure. | Transcript archive/index merge contract is failing and should be fixed before saying all legacy transcript paths are perpetually clean. |
| Refresh Transcripts | Refresh transcript receipt/index window. | `/api/val/transcripts/refresh`, transcript list/detail. | Partial | Transcript tests. | Button-level browser test needed. |
| Open Transcript Working Brief | Open scoped transcript Co-Work, not generic chat. | `openTranscriptWorkingBriefCowork`, Co-Work transcript route. | Confirmed | `valCowork.test.js`, transcript tests. | Strong scope guard. |
| View Full Transcript | Reveal full transcript source text. | Frontend toggle and transcript detail API. | Partial | Transcript retrieval tests. | Needs browser QA for long text/readability. |
| Documents | Show documents, drafts, source material, generated artifacts, attachments, Google Docs as reference material. | `valDocuments` service/routes, source processing, Google Docs routes. | Confirmed core | `valDocuments.test.js`, `valSourceProcessing.test.js`. | Board document source still pending; actions like send/update must stay review-gated. |
| Scan Gmail Documents | Find relationship/project document evidence in email. | Document intake/source processing. | Confirmed core | `valSourceProcessing.test.js`. | Live Gmail credential test needed. |
| Document Present/Update/Send/Open Source/Link Context | Work with document artifacts while preserving source and approval boundaries. | Document workspace/action handlers, Google Docs/external action routes. | Partial | Document routes and prepared artifact tests. | Needs button-by-button confirmation, especially `send` and Google Docs update paths. |
| Commitments | Accountability surface for promises, next steps, follow-through, evidence, and ownership. | `valCommitments`, tasks/open loops, transcript/email commitments. | Confirmed core | `valCommitments.test.js`, `commitmentsPage.test.js`, `calendarizedTasks.test.js`. | Board task source pending for all task mutations. |
| Commitment Actions | Draft Email, Create Task, Schedule, Complete, Delegate, Dismiss, Show Source, Resolve Contact. | Commitment action handlers, tasks, calendarize, external action packet gates. | Partial | Commitments/calendarized tasks/global send tests. | Needs per-action test matrix; sending/delegating must remain approval-gated. |
| Lead Intelligence | Preview leads/partners/orgs, train criteria, import only after approval. | Lead/partner/frisson endpoints and scraper UI. | Confirmed core | `leadScraperRegression.test.js`, `partnerScraperRegression.test.js`, `frissonScraperRegression.test.js`. | It is intentionally non-conversational. External providers require keys and should report errors clearly. |
| Ready For You | Show only judgment-required work; approve/reject/snooze locally. | `valReadyForYou`, prepared artifacts, receipts. | Confirmed | `valReadyForYou.test.js`. | Strong review queue; visible count/card expectations should be browser-tested. |
| External Actions | Nothing external happens without exact packet, approval, execution receipt, and reconciliation. | `valExternalActions`, executor, receipts, send gate. | Confirmed core | `valExternalActions.test.js`, `globalSendGate.test.js`. | Critical contract: every new external action type must use this service, not bespoke send logic. |
| Voice Mode | Speak through GHL Voice/Deepgram visual wrapper; hide backend work; fast conversational action handoff. | GHL voice widget wrapper, `/api/val/ghl/voice-turn`, Deepgram TTS routes. | Partial | `voiceIntegrationRegression.test.js` green. | Live GHL agent custom action behavior still needs end-to-end testing. GHL Voice completed-turn Board packet is pending. |
| Text Chat | Home VAL broad context; function chats scoped; no fake source access. | `/api/val/chat`, Co-Work routes, memories, Board packet/reflection context. | Confirmed core with stale tests | `voiceIntegrationRegression.test.js`, `valCowork.test.js`; `contextualChat.test.js` failing. | Need reconcile shared conversational contract tests and maybe restore named correction helper or update tests. |
| Upload/Image/Attach in Chat | Attach source files/images without confusing the chat bar. | `/api/val/files`, workspace file handlers, image analysis/generation routes. | Partial | File upload route exists; document tests. | Needs UX test. Image route exists but should be checked for provider availability and source persistence. |
| Security / Privacy Center | Tenant-scoped audit, support access, export/delete controls. | Security routes and RBAC. | Confirmed core | `securityPrivacyCenter.test.js`. | Live tenant permission test recommended. |
| API Keys / Connections | User-owned provider keys; no silent platform fallback. | Tenant API key vault and integration health. | Partial | `tenantApiKeyVault.test.js` mostly; one Google connection visibility failure. | Fix failing first-run Google dashboard assertion before deployment confidence. |

## Page/Button Risk Register

### Highest Priority Before Broad Client Rollout

1. Fix the 8 failing tests or explicitly update them if they are stale.
2. Add a button-level smoke test for the Home page:
   - Refresh Perspective
   - Open Executive Functions
   - Calendar
   - LinkedIn Posts
   - LinkedIn Instructions
   - Teach VAL
   - Board of Observers
   - Home VAL text chat
   - Voice button / GHL wrapper
3. Add Board packet hooks for pending source families before promising them:
   - SMS
   - LinkedIn
   - documents/uploads outside current source processing
   - task mutations
   - relationship profile mutations
   - project profile mutations
   - public research receipts
   - GHL Voice turns
4. Add an "every action button resolves to a route or explicit local-only receipt" static test for `hearth-prototype.html/js`.
5. Run live tenant QA with real connections:
   - Gmail read
   - Gmail draft/send approval gate
   - Outlook equivalent if enabled
   - Google Calendar next appointment
   - Meeting Prep
   - Krisp transcript sync and VAL voice self-talk filtering
   - GHL Voice custom action
   - GHL SMS/email/calendar action handoff if configured

### Do Not Promise Yet

- "Every single thing in VAL is already Board-live forever."
- "Every source mutation creates Board packets."
- "GHL Voice completed turns are already part of Board telemetry."
- "Every visible button has button-level regression coverage."
- "All legacy transcript archive data is definitely merged with the processed transcript index."

### Safe Promise Now

"VAL's core functions are source-scoped, review-first, and approval-gated. Home VAL is the broad Chief of Staff lane. The Board of Observers now receives live packet telemetry for the registered live source families, and every Board Observer reviews every live packet through its own lens. Some source families still need packet hooks before we can honestly claim the entire system is Board-live forever."

## Perpetuity Contract

Going forward, a new page/button/function is not complete unless it has:

1. A visible user promise written in plain language.
2. A source-of-truth route or local-only handler.
3. A scoped context boundary.
4. A no-fake-source rule.
5. A review/approval gate if anything external can happen.
6. An execution receipt if anything external actually happens.
7. A Board packet hook if the event should be visible to the Board.
8. A regression test proving the promise.
9. A graceful empty/error state.
10. A return path that takes the user back to the right surface.

If any of those ten are missing, the function is not done. It may be usable, but it is not integrity-complete.
