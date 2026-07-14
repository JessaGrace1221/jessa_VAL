# VAL Core Functionality Acceptance Gate

Status: required before implementing the VAL drawer. Lead Intelligence is intentionally excluded from this gate because its current scraper behavior is accepted and it has no Co-Work route.

## Purpose

The active executive system is ready for the VAL drawer only when each meaningful source can travel through its Round Table, packet, durable record, executive surface, review action, and return path without falling into an older generic workflow.

This gate protects the operating model:

```text
Round Table decides
  -> Packet stores
  -> Custom fields persist
  -> Drawer displays
  -> User approves action
```

Documents and commitments remain internal evidence and follow-through records. They are not retrieval drawers and they have no generic Co-Work entry.

## In Scope

1. Transcripts
2. Executive Inbox
3. Project Managers
4. Stewardship
5. Leverage / Ready For You as the shared review surface

## Out Of Scope

- Lead Intelligence behavior and scraper logic. It remains preview, approve/hold, and import only; no Co-Work route may be added.
- VAL drawer redesign, Witnessing changes, Teach VAL changes, connection UX, or prompt changes. These begin only after this gate passes.
- New source types or broader source-processing expansion.

## Automated Contract Gate

The automated suite must prove all of the following before any live walkthrough:

| Journey | Required proof |
|---|---|
| Transcript -> overview | Exact Krisp Action Items and Key Points remain the immutable source receipt; a selected transcript Working Brief prepares one reviewable attendee overview without sending it. |
| Transcript -> follow-through | A selected exact Krisp Action Item can become one review-gated internal commitment without changing its wording or guessing an owner. |
| Email -> evidence / draft | A selected Executive Inbox thread renders readable body and attachment metadata; scoped reply work prepares a private Leverage draft, never sends it. |
| Project -> selected update | A Project Managers entry receives the selected project and section, prepares only its mapped update, requires internal Apply, and returns to that same project. |
| Stewardship -> next move | A selected relationship receives readable evidence and prepares one review-gated stewardship move without drafting or sending outreach. |
| Review -> source | Prepared work in Leverage remains linked to its source, has a clear review decision, and never claims external execution without provider confirmation. |
| Internal evidence | Commitments and documents remain source-linked internal records reachable from their meaningful source surfaces, with no public drawer or generic Co-Work fallback. |

## Live Acceptance Walkthrough

Run these in the browser after the clean baseline is deployed. Each line must complete without a refresh changing the selected record, a modal dropping behind the page, or a return action sending the user to Home.

### 1. Transcript To Reviewable Meeting Overview

1. Open one real transcript.
2. Verify the selected transcript detail appears at the top of the workbench and displays the exact Krisp Action Items and Key Points word for word.
3. Open its Working Brief.
4. Apply the prepared meeting overview.
5. Verify Leverage shows one reviewable draft whose body is the exact Krisp Action Items and Key Points, formatted cleanly for the meeting invitees.
6. Verify no email was sent and the transcript source receipt remains unchanged.

### 2. Executive Email To Evidence And Private Draft

1. Open one real Executive Inbox thread with a readable body and, where available, an attachment.
2. Verify the sender, body, attachment metadata, and selected thread do not change during loading.
3. Open the thread-scoped reply flow and prepare a reply outcome.
4. Verify the result is a private Leverage draft linked to that exact thread, not a sent email.
5. Where the attachment is admissible evidence, verify it remains linked to the selected project or relationship source path; calendar `.ics` attachments must never become documents.

### 3. Project Manager Scoped Update

1. Open a selected project and note its title, owner, assigned color-named manager, and current field values.
2. Use one visible section action, such as Workstreams, Next Move, or Project Interview.
3. Verify every question maps to that named section and does not repeat an already answered field.
4. Apply the prepared result.
5. Verify only the selected project and selected section update, the return action returns to that project, and no other project data is copied in.

### 4. Stewardship Next Move

1. Open one selected relationship.
2. Open the relationship overview flow.
3. Give one executive direction.
4. Verify VAL prepares one internal stewardship move grounded in that relationship's evidence.
5. Verify the move is review-gated and that no introduction, message, CRM update, task, or calendar action executes automatically.

### 5. Leverage Review And Return

1. Open each prepared artifact created in the preceding walkthroughs.
2. Verify its source, intended action, and approval boundary are visible.
3. Review, revise, approve, decline, or return as appropriate.
4. Verify the originating surface reflects the receipt and no external execution is claimed unless the provider confirms it.

## Failure Rule

If a journey opens generic chat, borrows another entity's context, loses its source, changes the page during loading, creates invisible prepared work, returns to Home unexpectedly, or suggests that an external action happened when it did not, the core is not ready. Fix that route before beginning the VAL drawer.

## Exit Condition

The system is ready to implement the VAL drawer when:

1. the automated contract gate passes;
2. all five browser walkthroughs pass using real source data;
3. any provider-authentication limitation is recorded plainly rather than disguised as success; and
4. the resulting production baseline is committed, deployed, and documented before VAL drawer work begins.
