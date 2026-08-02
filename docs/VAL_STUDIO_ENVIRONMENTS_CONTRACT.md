# VAL Studio Environments Contract

## Product Boundary

VAL Studio is the single guided place where an executive creates an Environment.
An Environment is a durable, governed executive function. It is not a blank
canvas and it is not a freeform agent prompt.

The guided sequence is:

1. Define the outcome and purpose.
2. Select a real source and confirm its trigger rule.
3. Choose the Observers that should review each run.
4. Connect bounded external actions and approval rules.
5. Test the exact draft version with historical evidence.
6. Make the tested version live.

Teach VAL remains a reviewed learning action inside VAL Studio. Every durable
learning candidate still requires review before it changes future judgment.

## Runtime Authority

- The Environment governs the run.
- Selected Observers review the source through their bounded lenses.
- The Round Table observes the selected Observer receipts.
- The Chief of Staff advises. It does not override the Environment contract.
- External actions execute only through governed action packets and receipts.

## Shared Intelligence Network

Environments are bounded, but they are not isolated. Every successful live run
publishes one durable `environment_result_packet_v1` into the executive's VAL.
The packet contains the source lineage, Observer receipts, Chief of Staff
advisory, and a bounded summary of what the Environment prepared or completed.

Communication follows these rules:

1. The Chief of Staff receives and indexes every published Environment packet.
2. Every other active Environment records the packet as received. A later run
   records whether it was used, deferred, or not relevant. Silence is a recorded
   state, not missing processing.
3. A future Environment run may use relevant sibling packets as context. The
   original source remains authoritative for that Environment's configured
   external actions.
4. Receiving a packet never starts another Environment or external action by
   itself. Cross-Environment handoffs require an explicit governed instruction.
5. Packet lineage, delivery state, and use remain inspectable in VAL Studio.
6. Historical tests may preview shared context but never publish into the live
   network.

The network does not add another Observer model pass. A completed run publishes
the receipts it already created, and sibling delivery is a database operation.
This keeps the shared intelligence durable without multiplying model cost.

## First Environment

The first prefilled Environment is `MGSH meeting follow-through`.

Trigger:

- A new Krisp transcript arrives.
- Its meeting title matches the executive-confirmed recurring calendar event
  title.
- The title rule identifies the recurring event, not a separate MGSH calendar.

Source truth:

- Use Krisp Action Items and Key Points exactly as received.
- Basic headings and one short introduction are allowed.
- Do not rewrite, infer, or embellish the source sections.

Round Table:

- Commitment
- Relationship
- Delight
- Synchronicity

The executive may change the selected Observers. The Chief of Staff may recommend
adding or removing an Observer and must explain why.

Actions:

1. Send one email from the selected connected account to every valid attendee
   except the executive.
2. Append a dated section to the selected existing Google Doc.

The email subject is `Meeting Title and Date - Overview`.

The Google Doc section contains:

- meeting title
- meeting date
- attendees
- exact Krisp Key Points
- exact Krisp Action Items
- transcript link when available

## Approval and Safety

Approval is configured separately for Email and Google Doc actions.

Default:

- approval is required
- historical tests never take external action

Optional preauthorization:

- remains bounded to the configured action and recipient or document scope
- still runs fresh payload, permission, expiry, dependency, and duplicate checks

Permanent blocks:

- invalid or missing recipient
- missing or expired permission
- duplicate source execution
- Google Doc append before the matching email completes

Execution order is always Email, then Google Doc. If the Google Doc action fails,
VAL retries only that action and never resends the email.

## Failure Contract

When required context is missing or an action fails, VAL must:

1. ask the executive for the missing context
2. create an evidence-backed Alignment item
3. notify the Chief of Staff
4. leave the Environment visibly in `Needs Attention`

The source, version snapshot, Observer receipts, proposed outputs, action packet
IDs, and error remain inspectable in the Environment run.

## Version and Run Integrity

- States: Draft, Testing, Active, Paused, Needs Attention.
- Activation requires a successful historical test of the exact draft version.
- Activating a replacement removes the prior editable version.
- Immutable run snapshots and execution history remain.
- A transcript source hash is unique per Environment.
- Receiving the same transcript again returns the existing run and creates no
  duplicate email or document action.
- Shared or library copies strip identities, evidence, credentials, and account
  mappings, then install as Draft.

## Environment Sharing

Sharing is a governed product action, not a source-code operation.

- User-created Environments remain private tenant and user records in Postgres.
- GitHub contains the VAL Studio builder and runtime, not private Environments.
- Share Environment produces a portable `val_environment_template_v1` file.
- The file retains the outcome, purpose, selected Observers, bounded action
  sequence, failure order, and governance.
- The file contains no source evidence, contacts, credentials, connected account
  mappings, external destination IDs, approval grants, receipts, or run history.
- The recurring event match is cleared because it belongs to the recipient's
  sources.
- Import Environment always creates a new disconnected Draft. It never modifies
  an existing Environment and never installs as Active.
- The recipient must reconnect the trigger, sending account, destinations, and
  approval boundaries, then pass a historical test using their own evidence.
