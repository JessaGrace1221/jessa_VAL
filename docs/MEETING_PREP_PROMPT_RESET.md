# Meeting Prep Prompt Reset

Updated: 2026-07-19T23:48:25Z

## Why This File Exists

Meeting Prep drifted away from the useful May 26 behavior. The current prompt
stack became noisy, diagnostic, and overly concerned with mapping mechanics.
Before rebuilding, preserve the original prompt language and mark the current
stack as removed from the visible user experience.

## Original May-Style Prompt To Preserve

From `dashboard.html`, Meeting Mode:

```text
I've switched to Meeting Mode. My next meeting is [name] at [time]. Give me a full briefing: who they are, what we've discussed before, what the goal of this meeting should be, and 3 talking points to open strong.
```

Fallback variants from the same source:

```text
I've switched to Meeting Mode. My next meeting is "[upcoming meeting]". Give me a full briefing including who is attending, what we should accomplish, and 3 strong opening talking points.
```

```text
I've switched to Meeting Mode. Give me a briefing for my next meeting: who they are, what we should cover, and 3 talking points.
```

## Current Stack Being Removed From Visible Meeting Prep

The 2026-07-19 stack added these visible instructions in
`hearth-prototype.js`:

```text
Prepare me for this upcoming meeting using attendee intelligence, saved memory, dashboard context, relationship/project packets, recent transcripts, tasks, and public web/LinkedIn context.

This Meeting Prep packet is temporary and read-only. Do not write back to Relationships, Projects, transcripts, tasks, drafts, or other drawers. Co-Work may suggest explicit next actions, but nothing should be created, changed, sent, or saved unless the user asks.

Use the May 26 Meeting Mode style: useful judgment first, evidence second. Do not make this a static attendee profile card. Do not dump raw transcript text, source receipts, CRM ids, scraper diagnostics, or internal variable names. Do not use hashtags. No em dashes.

If the data is thin, say what is missing plainly. Keep it natural. Use all known attendees. If public evidence is verified, say "This is what I found on the web about [Name]" and include the useful website or LinkedIn post link. If it is not verified, do not use it.
```

The backend also added `meeting_prep_brief_packet_v1` wording that attempted to
summarize relationship mapping, project mapping, verified internal context, and open loops.
That packet may remain as raw evidence while rebuilding, but it must not drive
the visible Meeting Prep answer until the new prompt is rebuilt.

## Clean Rebuild Boundary

For the next pass:

- Keep evidence gathering hidden.
- Do not expose packet names, source diagnostics, CRM ids, mapping mechanics,
  or fallback lectures.
- Visible Meeting Prep should start from the May-style executive question:
  who they are, what we discussed, what is unresolved, what the goal should be,
  and how to open strong.
- Outscraper rebuild is separate and should not be patched into this prompt
  reset.

## 2026-07-19 Complete Rebuild Approval Boundary

The active Hearth Meeting Prep click path must be rebuilt as one path:

1. User clicks a calendar meeting.
2. Hearth opens the Co-Work Meeting Prep surface immediately.
3. The frontend sends the clicked event to one backend route.
4. The backend gathers only the context needed for the May-style brief.
5. The backend returns one final executive brief.
6. The frontend renders that brief in the same Co-Work surface.

The active click path must not call or depend on:

- `/api/val/calendar/meeting-prep`
- `renderMeetingPrepResult`
- `fetchSavedMeetingPrepResult`
- `runMeetingPrepCoworkMayPrompt`
- `/api/val/chat` for the initial Meeting Prep answer
- `meeting_prep_brief_packet_v1` as visible user copy
- the old static Meeting Prep drawer/page sections

These old pieces may remain in the repository only for historical tests,
Ready-For-You compatibility, or migration reference. They must not be reachable
from the calendar click path.

The rebuilt visible answer must not show:

- packet names
- readiness scores
- external review status cards
- source diagnostics
- CRM ids
- "VAL did not take external action"
- "relationship file has not been matched yet"
- "use Co-Work to add context"
- reset/archive/prompt-rebuild notices

The rebuilt prompt is allowed to use hidden evidence from:

- clicked calendar event title, time, description, attendees, and organizer
- relationship profiles, excluding saved public/web enrichment
- project profiles
- recent relevant transcripts
- recent relevant Gmail/Outlook snippets
- open tasks and memory
- public web and LinkedIn lookup context is excluded from this reset path until
  the public lookup rebuild has exact-person verification

The output must use the May-style executive structure:

- who they are
- what we have discussed before
- what the goal of this meeting should be
- 3 talking points to open strong

It should explicitly surface open loops, ambiguity, and drift risk when they
matter. It should not become a system-status report.
