# VAL Executive Reasoning Architecture

Purpose: define the cognitive architecture VAL must use before any feature, drawer, card, workflow, prompt, or automation is built.

Round Tables, Packets, and Prompt Layering are not implementation details. They are how VAL thinks.

## Why This Exists

VAL is not a collection of prompts.

VAL is not a collection of dashboards.

VAL is not a collection of workflows.

Every feature in VAL exists because the same reasoning architecture was applied to a different executive problem.

Whether VAL is helping with Stewardship, Projects, meetings, correspondence, transcripts, calendar, strategy, documents, commitments, lead intelligence, or prepared work, it should think the same way.

The interface may change.

The reasoning never does.

## Executive Reasoning Flow

Every executive decision in VAL follows the same path.

```text
Reality
  -> Witness
  -> Executive Relevance
  -> Round Table
  -> Packet
  -> Persistent Memory
  -> Executive Surface
  -> Prepared Work
  -> User Approval
```

Skipping a layer creates unreliable intelligence.

## Witness Before Judgment

VAL never reasons directly from raw information.

Every source is witnessed first.

A witness answers only one question:

```text
What actually happened?
```

No interpretation.

No assumptions.

No recommendations.

Only observable facts with source receipts.

## Executive Relevance Before Intelligence

Not every witnessed fact deserves executive attention.

VAL asks:

- Does this matter?
- Does it change a decision?
- Does it change a relationship?
- Does it create risk?
- Does it create opportunity?
- Does it require preparation?

If the answer is no, the information should not continue through the pipeline.

## Round Tables Produce Judgment

A Round Table is a group of specialized executive perspectives.

Each seat answers one narrow question.

No seat attempts to solve the entire problem.

Example seats include:

- Identity
- Context
- Risk
- Opportunity
- Stewardship
- Project Health
- Preparation
- Safety
- Provenance

The Round Table exists to create better judgment, not longer summaries.

Every card, drawer, page, and executive manager may have its own Round Table.

## Packets Preserve Understanding

A packet is not UI.

A packet is not memory.

A packet is not a prompt.

A packet is structured executive understanding produced by a Round Table.

Packets exist so reasoning happens once and can be reused many times.

Multiple interfaces may consume the same packet without repeating reasoning.

Packets should be:

- deterministic
- traceable
- source-backed
- machine-readable
- reusable

If understanding changes, the packet changes.

The interface simply reflects it.

## Custom Fields Persist Executive Understanding

Packets are temporary reasoning.

Custom fields are durable understanding.

They exist independently of any CRM.

CRM providers may change.

Databases may change.

The executive understanding should not.

## Prompt Layering Is Executive Thinking

VAL never asks a model to solve everything in one prompt.

Reasoning is built one layer at a time.

Every layer inherits verified understanding from the previous layer.

The pattern is always:

```text
Previous Understanding
+
Current Goal
+
New Evidence
=
Next Prompt
```

Not:

```text
Everything
  -> One giant prompt
```

This allows VAL to think incrementally rather than repeatedly.

Every prompt should have one responsibility.

Every response becomes structured input for the next layer.

## The Interface Never Thinks

Pages, cards, drawers, chat, voice, Leverage, and Co-Work never perform executive reasoning.

They consume packets.

If a UI component must perform reasoning to display itself, the architecture is wrong.

## User Approval Protects Trust

VAL prepares.

The user decides.

No external communication, introductions, emails, calendar invitations, CRM updates, or workflow execution may happen without an explicit approval path unless the user has intentionally enabled autonomous behavior.

Preparation builds trust.

Approval protects it.

## Constitutional Rule

Every executive capability in VAL should satisfy this architecture:

- Reality is witnessed.
- Witnesses become executive relevance.
- Round Tables create judgment.
- Packets preserve understanding.
- Custom fields preserve continuity.
- Interfaces display understanding.
- Leverage prepares work.
- The user approves action.
