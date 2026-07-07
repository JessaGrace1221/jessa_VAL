# Railway Deployment Checklist

Use this for each new client deployment from `val-core`.

## 1. Create The Railway Service

1. Create a new Railway project or service.
2. Choose GitHub repo: `JessaGrace1221/val-core`.
3. Use branch: `main`.
4. Add a Postgres database to the Railway project.
5. Add `DATABASE_URL` to the VAL service, referencing the Postgres database variable.

## 2. Add Required Variables

Required:

- `DATABASE_URL`
- `OPENAI_KEY`
- `SESSION_SECRET`
- `ADMIN_NAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `VAL_CLIENT_NAME`
- `VAL_CLIENT_SLUG`
- `VAL_CLIENT_BRAND_NAME`
- `VAL_PUBLIC_BASE_URL`

Optional project-mode variables:

- `VAL_PROJECT_NAME`
- `VAL_PROJECT_TYPE`

Use `VAL_PROJECT_TYPE=book_editor` for a manuscript/editor dashboard like Michele VAL. That mode changes the dashboard command center, upload metadata, and VAL behavior toward book editing, chapter flow, humor, IFS prompts, reader transformation, and launch strategy.

Generate a long random `SESSION_SECRET`. Do not reuse a weak password.

## 3. Add Optional Integration Variables

For GHL:

- `GHL_KEY`
- `GHL_LOC`
- `GHL_CALENDAR_ID` or `GHL_CALENDAR_IDS`
- `GHL_OPPORTUNITY_PIPELINE_ID` and `GHL_OPPORTUNITY_STAGE_ID`, or the name variables
- `GHL_FIELD_AI_EXACT_INDUSTRY` if GOALL lead imports need to pin exact industry to the custom field ID. If omitted, VAL attempts to resolve `contact.ai_exact_industry` from GHL custom fields.

For clients with more than one GHL account, use named account variables:

- `GHL_ACCOUNT_SLUGS=hopemakers,westwood`
- `GHL_ACCOUNT_HOPEMAKERS_LABEL=HopeMakers`
- `GHL_ACCOUNT_HOPEMAKERS_KEY`
- `GHL_ACCOUNT_HOPEMAKERS_LOC`
- `GHL_ACCOUNT_HOPEMAKERS_CALENDAR_IDS`
- `GHL_ACCOUNT_WESTWOOD_LABEL=Westwood International`
- `GHL_ACCOUNT_WESTWOOD_KEY`
- `GHL_ACCOUNT_WESTWOOD_LOC`
- `GHL_ACCOUNT_WESTWOOD_CALENDAR_IDS`

VAL will label calendar events and pipeline opportunities with the account label so users can tell which business each item belongs to.

For Google:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`

For Microsoft Outlook:

- `MICROSOFT_CLIENT_ID`
- `MICROSOFT_CLIENT_SECRET`
- `MICROSOFT_REDIRECT_URI`

The Google redirect URI must exactly match:

```text
https://CLIENT-DOMAIN/auth/callback
```

Add that same URL to Google Cloud under the OAuth client’s `Authorized redirect URIs`.

## 4. First Smoke Test

Open:

```text
https://CLIENT-DOMAIN/health
```

Confirm:

- `databaseConfigured: true`
- `openAiConfigured: true`
- `googleConfigured: true` if Google is enabled
- `ghlConfigured: true` if GHL is enabled

Open:

```text
https://CLIENT-DOMAIN/dashboard
```

Expected: redirect to `/login`.

Login with:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

After login, confirm:

```text
https://CLIENT-DOMAIN/api/config
```

returns the right client name and slug.

For project-mode deployments, also confirm `projectName` and `projectType` are correct.

## 5. Functional Test

Test:

- dashboard loads
- chat replies
- tasks create and persist after refresh
- file upload saves memory
- transcript endpoint saves and processes
- GHL pipeline loads
- GHL contact notes appear in pipeline/contact context
- Google button opens OAuth
- Google Calendar events appear after authorization

## 6. Migration Rule

Do not move a live client until the matching `val-core` test deployment passes the smoke test and functional test.
