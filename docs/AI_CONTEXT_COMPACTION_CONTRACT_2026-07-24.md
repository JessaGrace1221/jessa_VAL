# AI Context Compaction Contract

Date: 2026-07-24

Purpose: keep VAL fast without making VAL shallow.

## Current Answer

Yes, VAL now has an explicit AI-usable compaction structure.

Every three days by default, VAL can compact older context into source-family digests. Those digests are stored as `ai_context_digest` memory records so Home VAL, Co-Work, and Board-aware prompt assembly can retrieve the useful shape quickly without rereading every raw event.

This is different from deletion.

## Non-Negotiable Rule

No raw evidence is deleted by compaction.

The digest is for speed; the source receipt is for truth.

Compaction creates a lighter executive context layer while retaining original source IDs and receipts so VAL can still show where an observation came from.

## Runtime Structure

- `AI_CONTEXT_COMPACTION_AFTER_DAYS` defaults to `3`.
- `AI_CONTEXT_COMPACTION_INTERVAL_MS` defaults to once per day.
- `/api/val/memory/compact` can run the AI-usable compaction manually.
- The existing `/api/val/memory/condense` route now includes this compaction before legacy 30-day month-level condensation.
- Each digest stores:
  - `sourceFamily`
  - `bucket`
  - `sourceIds`
  - `sourceCount`
  - `fingerprint`
  - `keptOriginals: true`
  - `retentionContract`

## Sources Included

The compaction pass includes ordinary VAL memory and Board packets.

Board packets are included because they are the cleanest live representation of what entered VAL, what source family it belongs to, and which observers received it.

Emails, transcripts, calendar, Witnessing, Co-Work, and external actions are live registered Board sources. Their packet records can now be compacted into AI-usable source-family digests after the three-day window.

## What This Solves

- VAL does not need to stuff every older email, transcript, packet, and chat turn into every prompt.
- VAL can retrieve recent raw evidence plus older compact digests.
- The Board of Observers can keep accumulated understanding without carrying a messy diary into every response.
- Source receipts remain intact for proof, review, and trust.

## What It Does Not Yet Solve

Pending source families still need packet hooks before VAL can honestly claim they are Board-live forever.

Pending Board source families currently include:

- SMS
- LinkedIn visibility
- documents/uploads outside current source processing
- task mutations
- relationship profile mutations
- project profile mutations
- public research receipts
- GHL Voice turns

Those sources may have working feature surfaces, but until each one writes a Board packet hook, we should say they are available to the feature, not guaranteed to be continuously observed by every Board member.

## User-Facing Integrity Language

Safe:

> VAL keeps recent source context available directly and compacts older context into lightweight source-family digests so the system stays fast without losing receipts.

Safe:

> The Board sees live packets from registered sources like email, transcripts, calendar, Witnessing, Co-Work, and external actions. As more source hooks are attached, those sources become Board-live too.

Not safe yet:

> Every single thing that could ever happen in VAL is already continuously reviewed by every Board member forever.

Better:

> Every registered live source is routed to every Board member. Any new source family must be added to the packet registry before we claim it is Board-live.

## Operating Rule Going Forward

Every new source or action must ship with:

1. A durable source record or receipt.
2. A Board packet hook if it should influence the Board.
3. Source references inside the packet.
4. A compact digest path after the compaction window.
5. A test proving the source is either `live` or honestly marked `pending`.
