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
summarize relationship mapping, project mapping, public context, and open loops.
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
