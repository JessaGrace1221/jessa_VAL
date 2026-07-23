# Next Task: Roll The Clean Baseline To Another VAL

## Goal

Create the next client VAL from the frozen Jessa baseline without copying any
Jessa data, identity, credentials, provider state, or tenant-specific aliases.

## First Question

Ask:

> Which VAL are we building next, and which capabilities should be marked
> Coming Soon for that client?

Do not create or deploy a client service until the user answers.

## Required Sequence

1. Read `docs/CODEX_CURRENT_STATE.md`,
   `docs/VAL_DASHBOARD_CLONE_READINESS.md`, and `docs/CODEX_HANDOFF.md`.
2. Create an isolated repository/worktree and a new Railway service/database.
3. Set a unique client slug, user ID, owner identity, public URL, session
   secret, encryption key, and transcript webhook token.
4. Start with an empty database and no copied `data/` directory.
5. Confirm the OpenAI-only connection gate before exposing the Hearth.
6. Connect only that client's Gmail/Outlook, Calendar, Krisp, GHL, research,
   and other provider credentials.
7. Configure client-specific Coming Soon locks.
8. Run the complete test suite and clone-isolation regression.
9. Verify empty-state Home, drawers, API-key gate, OAuth callback URLs,
   transcript intake, and zero Jessa records in the browser.
10. Deploy only after the zero-data and identity checks pass.

## Acceptance Gate

- Search runtime, database, and rendered UI for Jessa email addresses, names,
  relationship aliases, meetings, projects, transcripts, and OAuth state.
- Verify the new service uses a different database and webhook token.
- Verify no Jessa API key or provider token exists in the new environment.
- Verify the new owner is filtered from their own calendar attendees.
- Verify the client cannot enter VAL without a saved OpenAI key.
- Verify source receipts and all external action approval boundaries still pass.

Do not solve client customization by weakening the shared baseline.
