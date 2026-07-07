# VAL Do Not Regress

Purpose: define product regression guardrails for VAL.

These are not technical tests.

They are product integrity tests.

They exist to prevent VAL from slowly becoming a generic AI dashboard, CRM, task manager, or chatbot as new features are added.

Companion specs:

- [VAL_FOUNDATION.md](./VAL_FOUNDATION.md)
- [VAL_DESIGN_PHILOSOPHY.md](./VAL_DESIGN_PHILOSOPHY.md)
- [VAL_PRODUCT_PHILOSOPHY_AND_INFORMATION_ARCHITECTURE.md](./VAL_PRODUCT_PHILOSOPHY_AND_INFORMATION_ARCHITECTURE.md)
- [VAL_PHASE_13C_THE_HEARTH.md](./VAL_PHASE_13C_THE_HEARTH.md)
- [VAL_PHASE_13C_LEAD_INTELLIGENCE_SCRAPER_SYSTEM.md](./VAL_PHASE_13C_LEAD_INTELLIGENCE_SCRAPER_SYSTEM.md)
- [VAL_PHASE_13C_SCRAPER_LAUNCH_REGRESSION_GATE.md](./VAL_PHASE_13C_SCRAPER_LAUNCH_REGRESSION_GATE.md)
- [VAL_UI_COMPONENT_SYSTEM.md](./VAL_UI_COMPONENT_SYSTEM.md)
- [VAL_USER_JOURNEYS.md](./VAL_USER_JOURNEYS.md)

## Global Regressions

Never let VAL optimize for productivity at the expense of judgment, relationships, capacity, or long-term momentum.

Never let VAL ask the user to become smaller in order to become more productive.

Never let VAL expose system complexity before it has done the work of understanding.

Never let VAL sound like generic SaaS.

Never let VAL confuse urgency with importance.

Never let VAL present confidence as wisdom.

Never let VAL make external actions ambiguous.

Never let VAL hide what happened after an action executes.

Never let VAL use sensitive context casually.

Never let VAL make the user feel watched instead of witnessed.

Never let VAL feel like passive software waiting for interaction when it should feel aware before interaction.

## Homepage Regressions

Never let the homepage become a dashboard again.

Never let the Hearth become a banner, hero section, status header, or greeting widget.

Never let the living rooms compete with the Hearth for the first emotional moment.

Never remove the permission line unless silence is the intentional act of care.

Never add cards to the homepage simply because data exists.

Never let email counts, task counts, meetings, or CRM stats become the homepage's primary message.

Never use red notification badges, urgency dots, KPI blocks, metric grids, or dopamine mechanics on the homepage.

Never put stats, KPIs, tables, or charts on the homepage unless they are part of an explicit CRM / GHL pipeline supporting surface.

Never add a homepage element that makes VAL feel more like software and less like presence.

Never show ten recommendations where one clear recommendation is needed.

Never let Chief of Staff become a task priority widget.

Never let Momentum become analytics.

Never let Ready For You become a draft folder.

## Navigation Regressions

Never organize primary navigation around software features instead of executive experiences.

Never let supporting destinations compete with Home's three executive questions: Velocity, Alignment, and Leverage.

Never let supporting systems compete with primary experiences for meaning.

Never create a new destination if it should be a lens, drawer, or component inside an existing experience.

## People and Relationship Regressions

Never let People become CRM.

Never make contact IDs, field grids, or scraped facts the primary relationship experience.

Never describe a person as a record when VAL can describe the relationship meaningfully and with evidence.

Never surface public research in a way that feels creepy, performative, or irrelevant.

Never let relationship health become a fake certainty score.

Never let CRM size become a proxy for network health.

## Project Regressions

Never let Projects become project management.

Never present task boards as the main way to understand meaningful work.

Never show progress theater.

Never reduce a project to percentage complete when its meaning, season, blockers, and trajectory matter more.

## Executive Inbox Regressions

Never think in emails when VAL should think in conversations.

Never treat unread as important by default.

Never classify by recency when consequence matters more.

Never generate a draft that fakes missing context.

Never make the user wonder why a conversation is being surfaced.

Never let Executive Inbox become a conventional inbox clone.

## Calendar Regressions

Never let Calendar become only agenda management.

Never treat meetings as isolated events when they sit inside relationships, projects, opportunities, commitments, and timing.

Never use enriched or public data without source confidence.

Never encourage the user to recite scraped facts.

Never let meeting prep become an overwhelming dossier.

## Working Together Regressions

Never let Working Together become ChatGPT.

Never begin with "How can I help?" when VAL has context.

Never give generic brainstorming when the user asked for production.

Never hide context gathering, creation authority, or milestone progress.

Never perform external actions from chat or voice without authentication, clarity, safety, and authorization checks.

## Teach VAL and VAL OS Regressions

Never make users edit prompts as the primary way to shape VAL.

Never call behavior changes deployments.

Never create rules without reason, scope, specificity, duration, and test cases.

Never let stale instructions quietly shape VAL forever without review.

Never overwrite user-confirmed memory unless the user explicitly corrects it.

## Ready For You and External Action Regressions

Never show background work just because VAL created it.

Never surface work unless human judgment is required.

Never let approval imply execution unless execution is explicit and safe.

Never execute expired, ambiguous, bulk, unsupported, or never_auto action packets.

Never mark something complete without provider confirmation.

Never expose raw provider payloads, tokens, or sensitive provider internals.

Never approve multiple external actions as one hidden bundle.

## Lead Intelligence and Scraper Regressions

Never treat active client scrapers as passive status cards.

Never launch the new Home for a current VAL user until every active scraper has passed the scraper launch regression gate.

Never change a scraper's CRM destination, pipeline, stage, tags, custom fields, or approval rule without an explicit migration decision.

Never let preview imply import.

Never import scraped leads into GHL / CRM before user approval unless a narrow approved automation policy exists for that exact scraper.

Never remove duplicate detection, final import re-checking, or contact validation.

Never remove Level 3 verification chunking for broad batches.

Never hide scraper failures behind generic errors or raw logs.

## Developer Regressions

Never expose raw Observer outputs, Round Table internals, audit logs, or provider payloads in the primary user experience.

Never hide debugging tools from builders who need to understand VAL's reasoning.

Never make Developer the place where core user journeys live.

Never make users inspect debug surfaces to trust normal product behavior.

## Product Regression Review

Before shipping any major UX or intelligence change, ask:

- Does this violate any Foundation document?
- Does this make VAL feel more alive, or more like software?
- Does this make VAL feel more like generic software?
- Does this increase cognitive load without increasing judgment?
- Does this expose internals the user should only feel indirectly?
- Does this reduce people, projects, or commitments to records?
- Does this make external action state less clear?
- Does this help the user recognize truth, prepare meaningfully, or decide more wisely?

If the answer is uncertain, pause and request human review.
