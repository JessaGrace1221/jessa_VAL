# Executive Inbox / Commitments Audit

Date: July 5, 2026

## Purpose

Audit the broader dashboard/page routing after the Hearth drawer split:

- Executive Inbox = what deserves attention.
- Commitments = who owes whom what.
- Relationships/Projects = meaning and context homes.
- Transcripts = operational source of truth.

The Hearth drawer implementation is aligned. The broader dashboard still needs routing and language cleanup.

---

## Current Alignment

### Hearth

Status: aligned.

- `hearth-prototype.html` labels the old Correspondence drawer as `Executive Inbox`.
- `hearth-prototype.html` has a separate `Commitments` drawer with `Accountability ledger`.
- `hearth-prototype.js` routes Executive Inbox review through the old internal correspondence selectors, but visible copy is Executive Inbox.
- `hearth-prototype.js` routes Commitments to `/api/val/commitments?limit=120`.
- `services/valCommitments.js` and `services/valCommitmentsRoutes.js` implement the first Commitments ledger.

Notes:

- Internal selector names like `correspondenceDrawerLink` can remain for now. They are implementation detail.
- User-facing copy should continue to say Executive Inbox.

---

## Findings

### 1. Main Dashboard Navigation Still Uses `Actions`

Files:

- `command-center.js`
- `dashboard.html`

Current:

- `command-center.js` nav has `{id:'tasks', label:'Actions'}`.
- `dashboard.html` legacy nav has `data-view="tasks"` with label `Actions`.
- The underlying destination is `openTaskBoard()`.

Problem:

This still frames follow-through as generic actions/tasks. The product direction says this area should be Commitments.

Recommended change:

- Rename visible nav label from `Actions` to `Commitments`.
- Keep `tasks` as a backward-compatible route alias initially.
- Add `commitments` as the new canonical view id.
- Route both `commitments` and `tasks` to a Commitments page/wrapper.

---

### 2. There Is No Page-Level Commitments Surface Yet

Files:

- `dashboard.html`
- `command-center.js`

Current:

- The only true Commitments UI is the Hearth drawer.
- Dashboard route aliases send `calendarized_tasks`, `task_board`, and `tasks` to `openTaskBoard()`.
- No dashboard route calls `/api/val/commitments`.

Problem:

The platform now has a backend Commitments ledger, but the full dashboard still exposes the old task board.

Recommended change:

- Add `openCommitmentsPage()` in `dashboard.html`.
- It should call `/api/val/commitments?limit=120`.
- It should show the same executive categories:
  - You owe
  - Others owe you
  - Overdue
  - Ready for approval
  - Needs resolution
- It can include the existing task board as a secondary section, but not as the primary mental model.

---

### 3. Summary Cards Still Say Action Items / Comms Queue

File:

- `dashboard.html`

Current:

- Left/top summary card says `Action Items`.
- Communication card says `Comms Queue`.
- Approval card says `Approval Queue`.

Problem:

These are not wrong, but they do not match the new IA. `Comms Queue` risks pulling users back toward a generic inbox. `Action Items` risks hiding commitments.

Recommended change:

- `Action Items` -> `Commitments`
- `Comms Queue` -> `Executive Inbox`
- `Approval Queue` can remain, but copy should clarify it is draft/artifact approval.

---

### 4. Executive Inbox Page Is Mostly Aligned

File:

- `dashboard.html`

Current:

- `openEmailIntelligence()` opens title `Executive Inbox`.
- Copy says: conversations that need a decision, drafts, and plain-English rules.
- Chat prompt recognizes “email intelligence” and “inbox attention,” then opens Executive Inbox.

Problem:

The page is still structurally an email list with tabs and active conversations. That is acceptable for now, but future work should keep pulling it away from “clear your inbox.”

Recommended change:

- Keep `email_intelligence` route for compatibility.
- Add/accept `executive_inbox` route alias.
- Do not rename backend email service yet.
- Adjust copy from “Refresh Inbox” to “Refresh Conversations” or “Refresh Executive Inbox”.

---

### 5. Voice and Chat Commands Still Route “Tasks” Separately

File:

- `dashboard.html`

Current:

- Voice command “show my tasks” calls `askTasks()`.
- “dangling commitments” calls `followup_radar`.
- Chat command add-suggested-tasks opens title `Tasks`.

Problem:

This is understandable internally, but user-facing language should connect tasks to commitments.

Recommended change:

- Keep “task” as an accepted user phrase.
- Display Commitments when the user asks for tasks/open loops/follow-through.
- Use task language only for the internal task object or explicit task creation.

---

### 6. Server Guide Is Already Partially Aligned

File:

- `server.js`

Current:

- Guide card says `Executive Inbox`.
- Journey says `Open Executive Inbox`.
- Journey step 5 says `Calendarize A Task`.

Problem:

The guide still points task-oriented follow-through to tasks.

Recommended change:

- Add a Commitments card or replace Calendarized Tasks with Commitments.
- Keep calendarization as an action inside Commitments.

---

## Recommended Implementation Order

1. Add canonical `commitments` view id and route aliases.
2. Rename visible dashboard/sidebar `Actions` to `Commitments`.
3. Implement `openCommitmentsPage()` backed by `/api/val/commitments`.
4. Keep `openTaskBoard()` available as the internal task-board section.
5. Update summary cards:
   - `Action Items` -> `Commitments`
   - `Comms Queue` -> `Executive Inbox`
6. Add dashboard tests proving:
   - nav contains Commitments
   - `commitments` route exists
   - legacy `tasks` route still works
   - Commitments page calls `/api/val/commitments`
   - Executive Inbox remains separate from Commitments

---

## Must Not Change

- Do not turn Commitments into an email inbox.
- Do not move all drafts into Commitments.
- Do not remove the existing task infrastructure yet.
- Do not break old `tasks`, `task_board`, or `calendarized_tasks` links.
- Do not auto-send, auto-post, auto-write CRM, auto-write calendar, or auto-save durable memory from Commitments.

