# VAL First Look: Candidate Review And Delivery

## Purpose

The First Look is not a gallery of recent emails, calendar events, or documents. It is the private, evidence-backed bridge between a completed Witnessing Session and VAL's working system.

The user first sees a concise confirmation of what VAL scanned. The next useful action is `Build my proposed map`. VAL then uses the approved sources and the user's Witnessing answers to prepare two reviewable groups:

1. Relationships proposed for **Stewardship**.
2. Projects proposed for **Project Managers**.

The map is always a proposal. It is never an automatic import.

## Trust Contract

- The First Look receipt shows source name, scan state, count, date range, and limitations. It does not surface arbitrary sample messages, events, or file names.
- The candidate map is generated only after the user chooses to build it.
- Candidate evidence is source-backed and retains the exact source receipt references used to make the proposal.
- Witnessing answers are first-class evidence. A relationship or project the user named during Witnessing must be considered before weaker inferred patterns.
- VAL cannot save a proposed map until every completed Witnessing answer has a coverage receipt. If an answer explicitly names a relationship or project that VAL should understand, protect, or organize, the map must include that item as a review packet with the same Witnessing answer cited as evidence.
- A candidate is not a new relationship, project, task, draft, or memory item.
- Identity ambiguity blocks relationship delivery. A project without a sufficiently clear name remains a question, not a project.
- First Look never creates, changes, or admits an Executive Inbox conversation. Source material may become quiet relationship or project evidence only through this separate review flow.
- A relationship proposal must name a plausible person or organization that appears in its cited evidence. Phone numbers, email addresses, generic mailboxes, automated senders, and unnamed participants cannot become candidates.
- One-sided inbound email alone is not relationship admission. It needs a sent-mail, calendar, transcript, project, document, or explicit Witnessing signal before VAL may prepare a candidate.
- Delivery requires an explicit user decision and produces an auditable receipt. It does not send email, change a calendar, update a CRM, or take any external action.

## First Look Sequence

1. **Sources scanned**
   - Gmail, Google Calendar, Drive and Docs, and Krisp are shown as `Scanned`, `Partially scanned`, `Needs verification`, or `Unavailable`.
   - The receipt states the 90-day window, record counts, and source limits.
   - The receipt never lists random source items as proof of work.

2. **Build the proposed map**
   - VAL rereads the approved source metadata for the immutable First Look window and the completed Witnessing answers tied to that First Look.
   - This is a separate, read-only candidate-analysis receipt. It never overwrites the immutable First Look snapshot.
   - While the map is being prepared, VAL says what it is reading: Witnessing answers, relationship signals in email and calendar, named projects, and source references.
   - The finished map states how many Witnessing answers were accounted for. It cannot quietly omit a relationship or project the user explicitly named for VAL to understand.

3. **Review relationships**
   - Each relationship packet includes a proposed name, any known email or organization, a concise note, confidence, and linked source receipts.
   - The user may keep, correct, defer, or exclude each packet.
   - A kept packet is labelled `Ready for Stewardship`; it is not yet delivered.

4. **Review projects**
   - Each project packet includes a proposed project name, why VAL thinks it is a project, known people, source notes, and the first onboarding question still needed.
   - The user may keep, correct, defer, or exclude each packet.
   - A kept packet is labelled `Ready for Project Managers`; it is not yet delivered.

5. **Deliver approved items**
   - One explicit delivery action creates all kept, unambiguous relationship and project packets in one local transaction.
   - Relationships are delivered to Stewardship as person packets with their notes and source provenance.
   - Projects are delivered to Project Managers as clean project shells with notes, source provenance, and the correct onboarding question. No inherited project data is copied.
   - Project-to-relationship links are created only when the relevant kept relationship packet is delivered in the same change set.
   - VAL returns a receipt with direct paths to Stewardship and Project Managers.

## Candidate Packet Shape

Every candidate must include:

- `type`: `relationship` or `project`.
- `proposedName` and a normalized key.
- `note`: a short, factual explanation of the proposed item.
- `confidence`: `high`, `likely`, or `needs_confirmation`.
- `sourceEvidence`: receipt references with source, title/subject, date, and reason.
- `witnessingEvidence`: the relevant Witnessing answer when one exists.
- `decision`: `proposed`, `kept`, `corrected`, `deferred`, `excluded`, or `delivered`.
- `destination`: `stewardship` or `project_managers`.

Project packets additionally include:

- `knownPeople`.
- `ownerCandidateKey` only when a kept relationship candidate clearly owns the project.
- `onboardingQuestion`, which is blank-safe and starts the project-specific onboarding rather than copying any prior project's details.

## Initial Candidate Rules

- Do not propose automated senders, newsletters, receipts, vendors, or generic meeting links as relationships.
- Do not trust a model-supplied email address or phone number. VAL may retain an email only when the exact address came from the cited source metadata; First Look never stores a phone number as relationship identity.
- Prefer a person or organization the user named during Witnessing, a repeated substantive correspondent, or a recurring meeting participant.
- Do not treat every topic as a project. A project needs a defined body of work, outcome, or ongoing coordination signal.
- Use source evidence to explain a proposal, but do not expose raw email bodies or full transcript text in this view.
- Krisp material remains exact. VAL may cite a Krisp meeting receipt but must never rewrite it as the original transcript.
- The Krisp portion of this map comes from the same last-30-calendar-day receipt window that VAL imports into Transcripts. Gmail and Calendar retain the First Look's stated 90-day review boundary; Drive and Docs retain their stated metadata limit.

## Delivery Scope In This Slice

This implementation adds only relationship and project candidate packets and their two destinations:

- **Stewardship** receives approved relationship packets.
- **Project Managers** receives approved project shells and their linked approved relationship packets.

Inbox treatment, tasks, drafts, memory, writing profiles, LinkedIn support, and external actions remain outside this delivery action. They will be prepared in their own review flows after this system has a clean, trustworthy source map.
