# Executive Inbox Issue Log

Updated: 2026-07-17

## Current User-Reported Issues

1. Layout is worse after recent patches.
   - The selected thread, draft area, and context controls are still squished.
   - Sections overlap or appear visually stacked on top of each other.
   - The drawer no longer feels calm, executive, or trustworthy.

2. The actual thread experience is incomplete.
   - The user needs the email content and prior emails in the selected thread.
   - "Previous emails in this thread" must be visible as a real function, not lost behind summary text or a partial latest-message card.
   - The selected-thread area must show readable source material before asking the user to draft, resolve, send, attach context, or make rules.

3. Writing Rules is not mapped clearly enough.
   - Opening Writing Rules felt slow.
   - Categories are missing.
   - The user cannot tell where writing rules are saved, how VAL uses them, or how they affect created drafts.

4. Draft behavior is unclear.
   - The user does not see prepared drafts waiting for review.
   - The product does not clearly show whether VAL created an internal review draft, a provider draft, or no draft.
   - The path from writing rules -> draft generation -> editable review -> explicit send approval needs to be mapped and visible.

5. Discuss with VAL is not right yet.
   - The button styling and behavior feel weird.
   - It should be clear what context VAL has: selected email thread, previous thread messages, draft, relationship, project, and saved rules.
   - It should not be a generic chat button.

6. Recent work moved too fast.
   - The Executive Inbox needs to be rebuilt inch by inch.
   - No more cosmetic deployment passes should happen before the functional map is agreed and each slice is browser-validated.

## Root Cause Hypothesis

The current drawer still carries multiple competing paths:

- client-side merging of Ready For You, review drafts, and email intelligence;
- legacy local fallback content;
- draft-generation behavior that is not visibly tied to the selected canonical thread;
- rules UI that saves data without an obvious user-facing lifecycle;
- accumulated CSS layers that fight each other.

The fix is not another broad CSS patch. The fix is to establish the canonical Executive Inbox record and lifecycle, then rebuild the drawer one vertical slice at a time.

## Required Repair Sequence

1. Freeze broad UI patching and stop deploying cosmetic fixes.
2. Map the canonical Executive Inbox lifecycle:
   source email -> thread receipt -> admission/exclusion -> selected-thread view -> private draft -> review -> explicit send/receipt -> resolved/evidence.
3. Inventory the current implementation paths:
   queue fetches, draft creation, writing rules, Co-Work, relationship/project attachment, and send.
4. Decide what each user-facing control is supposed to do before restyling it.
5. Rebuild the selected-thread area first:
   latest message, previous thread messages, attachments, why it is here, and no overlap.
6. Rebuild draft and writing-rules behavior second:
   categories, storage path, draft generation path, where drafts appear, and send approval.
7. Rebuild relationship/project/rules actions third.
8. Only after the functional slices work, return to executive visual polish.

## Non-Negotiables

- One stable source of truth for active Executive Inbox records.
- Actual readable email content must be visible.
- Previous thread messages must be accessible.
- No external send without explicit approval.
- Writing rules must have visible categories and a clear storage/use path.
- Co-Work must be scoped to the selected thread and return to that thread.
- White/frosted glass visual language stays, but layout clarity wins before ornament.
