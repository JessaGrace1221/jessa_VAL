# VAL Clean Start And Source Intake Contract

**Status:** active implementation contract  
**Created:** 2026-07-15  
**Purpose:** make a fresh VAL start real, while preserving the architecture and the source connections needed to rebuild trusted context.

## Clean Start Boundary

`START FRESH WITH VAL` deletes the current user's **local VAL content**. It does not delete or alter anything in Gmail, Google Calendar, Google Drive, Krisp, Outlook, OpenAI, or any other external account.

### Deleted

- the active and historical Witnessing Session, its answers, imports, and derived local memory;
- First Look runs, receipts, proposals, and delivery records;
- local email copies, classifications, inbox threads, drafts, and rules;
- relationship, organization, and project profiles, timeline entries, evidence, observations, project pins, and local packet outputs;
- stored transcripts, transcript intelligence, transcript action items, transcript participants, transcript-created drafts, tasks, and local meeting links;
- local inbox copies, email classifications, email drafts, and reusable inbox rules;
- local Lead Intelligence research results, source-processing records, observer runs, Round Table runs, Chief of Staff recommendations, and all prepared-work/review queues;
- Co-Work conversations, work items, action receipts, prepared work, review records, recommendations, local calendar blocks, and local external-action receipts.

### Preserved

- the signed-in VAL account and the user's external source permissions, including Google and Krisp connections;
- VAL's Witnessing prompts, Teach VAL prompts, Round Tables, packets, Chief of Staff, and lead-scraper contracts;
- source data held by external systems;
- the lead scrapers for Frisson, GOALL, and Westwood.

The reset writes one content-free audit receipt with deletion counts. It never retains the deleted answer text, email text, contact names, project names, or transcript text in that receipt. Until a new Witnessing Session reaches First Look, normal email, network, packet, transcript-recovery, and backfill paths remain intake-locked so an empty account cannot silently repopulate itself.

## Source To Packet Contract

VAL must not make every Round Table reread every raw source. That would be slow, repetitive, and unsafe. The correct path is:

```text
Witnessing answers, Gmail and sent mail, Calendar, Drive and Docs, and Krisp transcripts
    -> exact source evidence and source receipt
    -> source-specific observer output
    -> bounded packet for each relevant domain
    -> Round Table decision
    -> Chief of Staff synthesis
    -> review surface and explicit user approval
```

The governing rule remains:

> Round Table decides. Packet stores. Custom fields persist. Drawer displays. User approves action.

### Required Reading Coverage

| Source | What VAL preserves | Packets that may receive it |
|---|---|---|
| Witnessing | Exact user answer and its declared meaning | VAL foundation, Stewardship, Project Managers, Chief of Staff |
| Gmail and sent mail | Source email, direction, participants, dates, attachments, and relevant text | Executive Inbox, Stewardship, Project Managers, Chief of Staff |
| Calendar | Event title, time, attendees, and linked meeting evidence | Stewardship, Project Managers, Transcripts, Chief of Staff |
| Drive and Docs | Source receipt, title, provenance, relationship/project links, and allowed content | Project Managers, Stewardship, Chief of Staff |
| Krisp | Exact transcript, Krisp Action Items, Krisp Key Points, attendees, and meeting provenance | Transcripts, Stewardship, Project Managers, Chief of Staff |

Each packet receives only the evidence relevant to its decision. A packet may say that it has no relevant evidence; it may not invent any.

### Witnessing Completeness Gate

The Witnessing Session is not background flavor. Every completed answer is retained as a direct, first-class source receipt for the First Look. Before VAL can show the relationship and project review map, it must prove all of the following:

1. every completed Witnessing answer was read by the candidate-analysis pass;
2. every answer has an explicit coverage receipt, including answers that do not name a relationship or project;
3. any person, organization, or project the user explicitly frames as important, protected, owned, or needing organization appears as a reviewable packet backed by that same Witnessing answer; and
4. no inferred relationship or project may outrank a direct Witnessing instruction merely because it occurred in a random email or calendar event.

If VAL cannot meet this gate, it must stop before saving the proposed map. It must never silently omit a user-named relationship or project.

This does **not** mean that every Round Table rereads every raw email, event, document, and transcript. The complete source receipt is read once; the relevant packet carries the bounded evidence to the relevant Round Table. The source coverage and packet routes remain visible in the First Look analysis so the user can see what VAL used and where it will go after approval.

The shared packet root also hydrates the current Witnessing answers directly. A Witnessing answer is therefore available to later packet and Round Table work even when it has not been condensed into durable memory. Direct source evidence remains distinct from any later memory proposal or approved working agreement.

## Krisp Thirty-Day Intake

Once Krisp is connected, VAL's first source intake requests the previous 30 calendar days of Krisp meeting receipts. For every receipt Krisp returns, VAL:

1. fetches the original transcript document;
2. saves the exact transcript and exact Krisp Action Items and Key Points without rewriting them as source material;
3. links the transcript to its calendar meeting when there is a reliable match;
4. records which bounded packets can use the transcript as evidence;
5. gives the user a coverage receipt: found, imported, already present, unavailable, skipped without transcript text, and failed.

The coverage receipt must state the time window and whether Krisp returned a capped result. VAL must never claim that it read a transcript it did not receive.

The relationship/project candidate pass uses that same 30-day Krisp window. It cannot quietly broaden into older transcript receipts after the intake coverage has been stated.

## First Look Delivery Boundary

First Look creates reviewable proposals only. It may prepare relationship and project candidates from source-backed evidence, but it does not create Executive Inbox items, send messages, create calendar events, or mutate an external system.

The First Look receipt must tell the user, in plain language:

- which source categories were available;
- how many source records were read, without exposing random examples as proof of work;
- which packet families received relevant evidence;
- which evidence was unavailable or not yet eligible;
- what is ready for the user to review and approve.

## Reset Acceptance Criteria

A clean start is complete only when:

- no Witnessing Session, First Look run, local email, local network profile, project profile, stored transcript, task, draft, or source evidence remains for the current VAL user;
- Google and Krisp still report connected when their credentials were connected before the reset;
- the reset leaves prompts, packets, Round Tables, Chief of Staff, and lead scrapers available;
- the reset result reports counts from the deletion itself rather than relying on a stale browser view;
- the next First Look produces a fresh source coverage receipt before it proposes anything.
