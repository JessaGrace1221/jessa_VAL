# VAL Stewardship And Function Map - 2026-07-19

## Current Stewardship Issues Logged

1. Network must show every admitted contact, not only the people visible in action-ready Stewardship lanes.
2. Manually added contacts must persist after refresh in every relationship index mode.
3. Existing contacts need an obvious LinkedIn URL field. That URL must feed Meeting Prep and LinkedIn Commenting.
4. Talk / Co-Work with VAL for relationship fields must feel conversational: ask one scoped question, prepare a reviewable update, then apply only after confirmation.
5. Closing a relationship Co-Work session must return the user to Stewardship, ideally the Network tab and selected contact.

## Immediate Fix Slice

- Keep manually added, calendar-added, and sent-mail admitted contacts in the normal `/api/relationships/index` route.
- Use a full Network list for the Network tab and manual introduction dropdowns.
- Keep Suggested Introductions stricter so VAL does not promote weak or noisy opportunities.
- Add LinkedIn profile and recent-activity links in the selected contact panel.
- Add a LinkedIn save control for existing contacts.

## Internal Things VAL Can Do

- Create or update person packets.
- Create or update project packets.
- Link a transcript, email, calendar event, document, task, or prepared artifact to a relationship.
- Link a transcript, email, calendar event, document, task, or prepared artifact to a project.
- Create internal commitments from transcript action items, emails, or meeting prep.
- Create internal prepared work for Leverage / Ready For You.
- Create internal email drafts for review.
- Create internal meeting prep briefs.
- Create internal stewardship move packets.
- Create internal LinkedIn comment drafts.
- Store user-confirmed rules, tone rules, relationship context, project context, and Witnessing Session context.
- Store source receipts and packet receipts.

## External Things VAL Can Do Or Needs To Do

- Gmail: read inbox/sent/thread context, create drafts, send approved emails, forward approved emails.
- Google Calendar: read events, create appointments, update appointments when approved.
- Google Drive / Docs: create or attach documents when approved.
- Outlook: read mail/calendar, create drafts, send approved emails, create appointments.
- GHL CRM: create/update contacts, create notes/documents, create tasks, send SMS, send email, read pipelines/opportunities, update opportunity state.
- Krisp: read transcript receipts, download recording links when available, preserve exact action items and key points.
- Outscraper: run public web research, run LinkedIn/profile/post lookups when available, save reusable general public context.
- LinkedIn Commenting: open user-provided profile/recent-activity links, accept pasted post content, draft comments in the user tone, never post automatically.

## Packet / Round Table Map Needed Next

| Function | Source packet | Required observers | External action gate |
|---|---|---|---|
| Calendar invite | calendar packet + relationship packet + project packet | Witnessing observer, relationship resolver, project resolver, scheduling observer | Explicit approve before creating appointment |
| Proposal | transcript/email/project packet + project manager packet | Project Round Table, document observer, relationship observer | Explicit approve before creating document/email |
| Code/work artifact | project packet + document/source packet | Project Round Table, implementation observer, source evidence observer | Explicit approve before external write/deploy |
| Send email | email packet + relationship/project packet + tone rules | Executive Inbox observer, tone observer, approval observer | Explicit send approval |
| Make introduction | two person packets + stewardship move packet | Stewardship observer, identity resolver, permission checker | Explicit approve before draft/send |
| Send SMS | relationship packet + GHL contact packet + tone rules | CRM observer, message safety observer | Explicit send approval |
| Do research | relationship/project packet + research packet | Research observer, source verification observer, wrong-person guard | Explicit save/use decision |
| Create CRM document | project/relationship packet + document packet | CRM observer, document observer | Explicit approve before CRM write |
| Create CRM task | commitment packet + owner/contact packet | Commitment observer, CRM observer | Explicit approve before CRM write |

## Workflow Order For Each Function

1. Identify exact source and durable target.
2. Build scoped packet with source receipts.
3. Ask the minimum missing question only if required.
4. Prepare reviewable internal output.
5. Show what VAL used and what remains unknown.
6. Wait for explicit approval before external action.
7. Write receipt after action.
8. Feed result back into person/project packets chronologically.

## Open Verification Items

- Confirm GHL can create documents in the CRM for this tenant and identify the exact API route/field shape.
- Confirm GHL can send SMS for this tenant and identify the exact approval + audit path.
- Confirm Google and Outlook send/draft/calendar scopes are connected and fail closed when missing.
- Confirm user API key onboarding blocks entry until OpenAI key exists.
- Confirm project management drawer can read CRM pipelines/opportunities and produce a clean overview with Co-Work.
- Confirm Transcripts can answer "Ask about any conversation" through chat and allow text entry in Co-Work.
- Confirm mobile home becomes voice-first and uses visible working/done states.
- Confirm Witnessing Session can be navigated by step and revised without restarting the whole flow.
- Confirm LinkedIn Commenting accepts profile URLs, appends `/recent-activity/all/`, displays a clean support grid, and drafts comments from pasted post content plus style rules.

