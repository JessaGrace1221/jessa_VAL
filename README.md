# VAL Core

Single shared VAL codebase for client-specific Railway deployments.

Each Railway service uses this same repo, but has its own environment variables,
Postgres database, OAuth credentials, API keys, branding, and login.

## Required Variables

- `DATABASE_URL`
- `OPENAI_API_KEY` or legacy `OPENAI_KEY`
- `SESSION_SECRET`
- `ADMIN_NAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `VAL_CLIENT_NAME`
- `VAL_CLIENT_SLUG`
- `VAL_CLIENT_BRAND_NAME`
- `VAL_PUBLIC_BASE_URL`

## Common Optional Variables

- `GHL_KEY` or `GHL_API_KEY`
- `GHL_LOC` or `GHL_LOCATION_ID`
- `GHL_CALENDAR_ID`
- `GHL_CALENDAR_IDS`
- `GHL_OPPORTUNITY_PIPELINE_ID`
- `GHL_OPPORTUNITY_STAGE_ID`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI` or `REDIRECT_URI`
- `ROCKETREACH_API_KEY`
- `OUTSCRAPER_API_KEY`
- `VAL_CLIENT_LOGO_URL`
- `VAL_SUPPORT_EMAIL`
- `VAL_DEFAULT_TIMEZONE`

## Main Routes

- `GET /login`
- `GET /dashboard`
- `GET /guide`
- `GET /api/config`
- `GET /api/config/status`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/val/chat`
- `POST /api/val/intelligence`
- `POST /api/val/transcripts`
- `GET /api/teach-val/onboarding`
- `POST /api/teach-val/onboarding/start`
- `POST /api/teach-val/onboarding/:id/interview`
- `POST /api/teach-val/onboarding/:id/imports/:category`
- `POST /api/teach-val/onboarding/:id/commit`

## Teach VAL About You Onboarding

The dashboard includes a guided **Teach VAL About You** workspace. Users can start it from the dashboard alert card, the Actions menu, or the existing onboarding entry point.

The flow is:

- Welcome
- Voice Interview
- AI context imports through Knowledge Cards
- Review extracted memory items
- Test Send or Send to VAL Memory

Onboarding memory is stored separately from operational records. It uses tenant-scoped onboarding tables for sessions, imported AI context, extracted memory items, and onboarding transcript data. It does not write into contacts, tasks, transcripts, or emails.

Optional outbound handoff:

```env
TEACH_VAL_WEBHOOK_URL=https://example.com/val-onboarding
# or
VAL_ONBOARDING_WEBHOOK_URL=https://example.com/val-onboarding
```

If no webhook is configured, approved onboarding items are stored locally for the active VAL deployment. Use **Test Send** in the dashboard to build and validate the payload without sending or committing production memory.

## GHL MCP Architecture

GHL access is centralized in `services/ghlMcpService.js`. Server routes should use the shared `ghlMcp` service instead of creating local GHL clients or hiding GHL calls inside one feature module.

The shared service is available to:

- dashboard intelligence via `POST /api/val/intelligence`
- chat mode via `POST /api/val/chat`
- relationship review via `GET /api/relationships/review`
- meeting prep via `POST /api/val/meeting-briefing`
- pipeline/opportunity review via `GET /api/pipeline`
- contact lookup and GHL actions via the existing GHL action routes
- lead scraping and enrichment

The service resolves the active tenant/user credentials first, then falls back to the deployment-level GHL environment variables. This keeps GHL reusable across every client deployment instead of hardcoding a single client or location.

Manual verification:

```bash
node --check server.js
node --check services/ghlMcpService.js
curl "$VAL_PUBLIC_BASE_URL/api/debug/ghl-mcp-context?query=recent%20opportunities"
```

## Railway Model

Create one Railway project/service per client, all connected to this repo.
Each deployment is single-tenant for now and uses its own database.

Example:

```env
VAL_CLIENT_NAME=Mark
VAL_CLIENT_SLUG=mark-goall-val
VAL_CLIENT_BRAND_NAME=Mark VAL
VAL_PUBLIC_BASE_URL=https://mark-goall-val-production.up.railway.app
ADMIN_NAME=Mark
ADMIN_EMAIL=mark@example.com
ADMIN_PASSWORD=change-me
SESSION_SECRET=generate-a-long-random-secret
```

Do not commit real secrets.
