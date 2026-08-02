# VAL General Lead Scraper Contract

## Protected boundary

The GOALL employer and strategic-partner scrapers are separate, approved client
workflows. This contract does not change their routes, search plans, scoring,
enrichment, preview, import, or CRM behavior.

This contract governs the flexible lead scraper used by general VAL tenants and
the public Demo VAL experience.

## Executive promise

An executive can describe who or what they need to find using any useful
combination of:

- business or organization type
- person or decision-making role
- visible need or pain point
- location
- additional qualification context

VAL turns that description into a live public-business discovery run. Results
remain a review set until the executive approves them. No result enters CRM and
no outreach begins merely because a scrape completed.

## Saved scraper entitlement

Every general VAL includes one active saved scraper.

- The included scraper may be edited, renamed, rerun, or replaced without an
  additional charge.
- The limit applies to active saved scraper definitions, not browser sessions.
- Additional active scrapers cost `$200/month` each.
- The server enforces the active-slot count. Browser storage is never the source
  of truth for entitlement.
- A blocked second scraper returns a clear expansion response. It must never
  silently overwrite the existing scraper or create an unpaid slot.

## Durable scraper definition

A saved definition belongs to the tenant and contains:

- name
- target description
- business or organization terms
- person or role terms
- pain point or need signals
- locations
- qualification instructions
- preview result limit
- CRM destination
- post-scrape automation policy
- status and timestamps

## Discovery and enrichment

The general workflow is intentionally less rigid than GOALL:

1. **Find businesses**
   - Search public business sources using the combined target and location.
   - Preserve the official website or public listing URL.
   - Dedupe the live result set.
2. **Find people**
   - Attach role and contact evidence only when requested and available.
   - Never invent a decision maker.
   - Expensive contact enrichment should happen after a business earns review,
     not across every raw public result by default.
3. **Confirm before CRM**
   - Show source evidence and a direct `View business` or `View person` link.
   - Let the executive approve or hold each result.
   - Recheck CRM duplicates at import.

## Demo contract

Demo VAL runs real Level 1 public-business discovery.

- Show the real business name, category, location, fit evidence, and official
  website or public business listing.
- Show a direct `View business` link.
- Hide contact-person identity and all direct contact details.
- Do not call paid person-enrichment sources for the Demo run.
- Do not write Demo results to CRM.
- Cap and rate-limit Demo runs to protect cost and abuse.
- If the live source is unavailable, say so plainly. Do not substitute fictional
  companies while describing the result as live.

## Post-scrape automation

Outreach is a governed Environment attached to a saved scraper, not an invisible
side effect.

The initial launch mode is **Prepare and queue**:

1. VAL discovers and qualifies.
2. The executive approves records.
3. VAL dedupes and upserts approved records in CRM.
4. VAL prepares the first outreach from the evidence packet.
5. The executive reviews the recipient, channel, claims, and message.
6. After approval, GHL/CRM sends or enrolls the contact in the selected cadence.
7. GHL handles deterministic delivery, delays, opt-out, DND, and stop-on-reply.
8. VAL interprets replies, updates context, and recommends the next move.

Before outreach can be activated, the Environment must name:

- sender identity
- allowed channels
- recipient/contactability requirements
- daily volume cap
- approval mode
- DND and opt-out behavior
- stop-on-reply behavior
- human handoff rule
- claims and language VAL may not use

Full autonomy is not the default.

## Trust standard

Every surfaced claim must answer:

- What did VAL find?
- Where did it find it?
- Why might it fit this scraper?
- What is known versus still unconfirmed?
- What will happen if the executive approves it?

The user should never have to trust a score without evidence or mistake a
preview for an import.
