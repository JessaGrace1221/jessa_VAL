# Board of Observers Briefing Schedule

## Operating Contract

Source intake is continuous and model-free. Emails, transcripts, calendar events,
tasks, drafts, relationship updates, Witnessing evidence, documents, notes, chat,
and voice create durable evidence packets as they arrive.

Jessa VAL remains on a launch hold by default. Scheduled reasoning cannot begin
until `VAL_BOARD_LAUNCH_READY=true` is explicitly configured after launch approval.
The hold does not stop evidence intake.

The Board of Observers reasons over those packets only three times per local day:

- Morning briefing: 6:00 AM
- Midday briefing: 12:00 PM
- End-of-day briefing: 5:00 PM

The default timezone is the VAL user's configured timezone.

## Cost Boundary

- Observer model: `gpt-5-nano`
- Chief of Staff synthesis model: `gpt-5.6-luna`
- Provider lane: OpenAI only, using one configured platform credential
- Maximum packets per briefing: 12
- Observer calls per full briefing: 14, one per Observer
- Maximum Observer calls per day: 42
- Chief of Staff synthesis calls per full day: 3
- Empty briefings make no model calls
- Failed briefings do not retry automatically
- Failed OpenAI calls do not fall back to Anthropic or another provider
- Provider-capacity failures open a short circuit for the rest of that briefing
- Manual Board reasoning and retry routes are disabled
- The Board lane has a $0.05 soft warning and a $0.10 daily hard stop
- The Board and all interactive work also share a $1.50 global daily hard stop

Packets beyond a briefing's limit remain durable and wait for the next scheduled
briefing.

## Alignment Queue

Every Observer reviews every packet in the scheduled batch through its own lens
and returns either a source-backed observation or no meaningful signal. The Chief
of Staff ranks the grounded work and persists that order on canonical work items.

The Alignment card reads this durable queue. Marking the current item Done:

1. completes the canonical work item;
2. records the completion against the Chief recommendation; and
3. exposes the next unfinished ranked item immediately.

Done does not invoke the Board, retrieve context, or make a model call. Midday and
end-of-day briefings can add or reorder new evidence, but unfinished earlier work
remains in the global queue until completed, dismissed, or superseded.

## Auditability

`GET /api/val/board/briefing-status` reports the configured schedule, timezone,
model, packet limit, daily Observer-call limit, and recent durable briefing runs.
Each local-day slot is claimed once through a database uniqueness constraint.
