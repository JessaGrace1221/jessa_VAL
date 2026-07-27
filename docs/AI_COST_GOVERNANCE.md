# VAL AI Cost Governance

## Model Routing

VAL chooses the least expensive model that can safely complete the work:

- `gpt-5-nano`: extraction, classification, transcript structuring, and each Observer review
- `gpt-5.6-luna`: Chief of Staff synthesis, text chat, voice context answers, prepared drafts, and ordinary executive judgment
- `gpt-5.6-terra`: explicit Deep Review only

Deep Review is disabled by default. It requires both
`VAL_AI_DEEP_REVIEW_ENABLED=true` and an explicitly approved request. There is
no automatic escalation to Terra or Sol.

## Daily Budgets

The default limits are:

- Interactive soft warning: $0.75
- Interactive hard stop: $1.40
- Scheduled Board soft warning: $0.05
- Scheduled Board hard stop: $0.10
- Global hard stop across every lane: $1.50
- Emergency request-count circuit breaker: 200 calls

The Board's separate 42-Observer-call limit remains in place. The Board lane
allows 45 calls so three Chief of Staff synthesis calls fit alongside the 42
Observer calls.

Before each request, VAL estimates the maximum request cost from its selected
model, bounded input, and requested output limit. The request is rejected before
it reaches OpenAI when that reservation would cross either its lane budget or
the global budget. After a successful response, VAL replaces the reservation
with the actual token cost.

If a valid response reaches `max_output_tokens`, VAL records that paid attempt
and makes at most one compact retry with a larger bounded allowance. The retry
is reserved against the same lane and global hard budgets. VAL does not loop or
treat an incomplete paid request as free.

Reasoning-enabled GPT-5 requests omit unsupported temperature controls on their
first attempt instead of paying the latency cost of a predictable rejected call.

Explicit pricing can be overridden only by changing code after reviewing current
OpenAI pricing. Unknown model names are costed at the expensive Sol rate so an
unrecognized model cannot bypass the budget.

## Audit Surface

`GET /api/val/ai-budget` returns:

- today's global calls, tokens, reserved cost, actual cost, and hard-stop state;
- Board, interactive, and Deep Review lane totals;
- soft-warning and hard-stop state for each lane;
- the model assigned to each workload;
- whether Deep Review is enabled.

Every successful OpenAI call also emits a `[val-ai-usage]` receipt containing
the lane, model, actual tokens, reserved cost, actual cost, and active budgets.

## Failure Rules

- Paid generation never runs merely because a page loaded.
- Failed compatibility requests release their cost reservation before a bounded retry.
- Network-ambiguous requests keep their reservation for the rest of the day because
  the provider may still have processed them.
- Anthropic fallback remains off unless it is explicitly enabled.
- The Jessa Board launch hold remains active until launch is explicitly approved.
