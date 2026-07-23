# VAL Dashboard Clone Readiness

Use this checklist whenever the Hearth codebase becomes another person's VAL.
Code and product behavior may be shared. User data, credentials, OAuth grants,
sessions, source receipts, and learned context must never be shared.

## Required Isolation

Every dashboard must have its own:

- Railway service and production domain
- Postgres database
- `VAL_CLIENT_SLUG`
- `VAL_CLIENT_NAME`
- `VAL_CLIENT_BRAND_NAME`
- `VAL_PUBLIC_BASE_URL`
- `VAL_USER_ID`
- `SESSION_SECRET`
- `ENCRYPTION_KEY`
- Google and Microsoft OAuth callback configuration
- GHL location/account configuration
- transcript webhook token

Never copy these values from an existing user's service:

- `DATABASE_URL`
- `SESSION_SECRET`
- `ENCRYPTION_KEY`
- OAuth access or refresh tokens
- tenant API keys
- GHL private integration credentials
- transcript webhook tokens
- persisted `data/` files

## First Login Contract

1. The new dashboard opens with no inherited people, projects, transcripts,
   emails, tasks, drafts, observer conclusions, or Co-Work history.
2. If the new account has no encrypted tenant OpenAI key, the OpenAI connection
   gate is the only usable surface.
3. The user connects OpenAI and then enters the Witnessing Session.
4. Google, Outlook, Krisp, GHL, Outscraper, RocketReach, Apollo, and custom
   providers are connected from that user's Data Connections surface.
5. Source intake begins only inside the new tenant after its owner authorizes
   the source.

## Pre-Launch Checks

`GET /api/health` must return:

- HTTP 200
- the intended unique client slug
- `databaseConfigured: true`
- `isolationWarnings: []`

The new database must begin with zero user-owned source rows:

- relationships
- projects
- transcripts
- email conversations
- tasks
- drafts
- Co-Work conversations and memory

Open the production Hearth and verify:

- the displayed user and brand are correct
- no other user's names or history appear
- OpenAI blocks entry until that tenant's key is connected
- Data Connections show only that tenant's connection status
- Google OAuth returns to that dashboard's production domain
- Krisp polling and webhook intake write only to that tenant
- Project Managers and LinkedIn obey the intended feature locks

## Transcript Intake Checks

For each dashboard:

1. `VAL_TRANSCRIPT_INGEST_ENABLED=true` only after a private
   `TRANSCRIPT_WEBHOOK_TOKEN` exists.
2. The Krisp webhook uses `POST /api/val/transcripts` with that token.
3. The authenticated ping returns `live:true`.
4. Krisp polling remains enabled as recovery, not as the only delivery path.
5. A source receipt is saved exactly once under the dashboard's `VAL_USER_ID`.
6. Post-ingest processing reaches `processingStatus: complete`, or the visible
   sync state reports `partial`; it must never claim completion while queued.

## Release Rule

Do not call a cloned dashboard ready until its health, empty-state, OpenAI gate,
OAuth return path, source isolation, and one end-to-end source receipt have all
been verified on its own production URL.
