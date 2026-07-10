const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const commandCenterJs = fs.readFileSync(path.join(root, 'command-center.js'), 'utf8');
const dashboardHtml = fs.readFileSync(path.join(root, 'dashboard.html'), 'utf8');
const serverJs = fs.readFileSync(path.join(root, 'server.js'), 'utf8');

test('command center renders transcript-prepared artifacts as a review surface', () => {
  assert.match(commandCenterJs, /function preparedArtifactKind/);
  assert.match(commandCenterJs, /function preparedArtifactWorkspaceHtml/);
  assert.match(commandCenterJs, /Proposal draft/);
  assert.match(commandCenterJs, /Page draft/);
  assert.match(commandCenterJs, /Calendar invitation/);
  assert.match(commandCenterJs, /Introduction draft/);
  assert.match(commandCenterJs, /No email has been sent and no recipient has been exposed/);
  assert.match(commandCenterJs, /Meaning<\/span><span>Evidence<\/span><span>Recommendation<\/span><span>Action/);
  assert.match(commandCenterJs, /Prepared Preview/);
  assert.match(commandCenterJs, /People and Destination/);
  assert.match(commandCenterJs, /Evidence Behind It/);
});

test('prepared artifact actions use artifact-specific approval language', () => {
  assert.match(commandCenterJs, /Approve for CRM proposal workspace/);
  assert.match(commandCenterJs, /Approve for publishing queue/);
  assert.match(commandCenterJs, /Review appointment details/);
  assert.match(commandCenterJs, /Approve calendar invitation/);
  assert.match(commandCenterJs, /Approve introduction draft/);
  assert.match(commandCenterJs, /Approve email draft/);
  assert.match(commandCenterJs, /actionHeading/);
  assert.match(commandCenterJs, /approvalMeaning/);
  assert.match(commandCenterJs, /does not send or expose recipients/);
  assert.match(commandCenterJs, /does not create or change a calendar event/);
  assert.match(commandCenterJs, /does not publish the page/);
});

test('prepared artifacts reopen Ready For You before falling back to generic drafts', () => {
  assert.match(commandCenterJs, /function openPreparedReadyItem/);
  assert.match(commandCenterJs, /openHomepageCard\('ready_for_you',cardItemKey\(match\)\)/);
  assert.match(commandCenterJs, /if\(openPreparedReadyItem\(\)\)return/);
  assert.match(commandCenterJs, /preparedArtifactPayload/);
  assert.match(commandCenterJs, /preparedArtifactId/);
  assert.match(dashboardHtml, /artifactKind/);
  assert.match(dashboardHtml, /targetType/);
});

test('prepared-work actions are routed through external action packets', () => {
  assert.match(serverJs, /preparePacketFromPreparedArtifact/);
  assert.match(serverJs, /homepage_prepared_work_packet_review/);
  assert.match(serverJs, /external_packet_approved_local_only/);
  assert.match(serverJs, /Nothing has been sent, published, scheduled, or changed externally/);
  assert.match(serverJs, /no_external_action:true/);
  assert.match(commandCenterJs, /review_prepared_work/);
  assert.match(commandCenterJs, /edit_before_approving/);
});

test('prepared-work packet responses render a receipt in the review UI', () => {
  assert.match(commandCenterJs, /function packetReceiptHtml/);
  assert.match(commandCenterJs, /function externalPacketArtifactLabel/);
  assert.match(commandCenterJs, /function packetStatusLabel/);
  assert.match(commandCenterJs, /function packetStatusMeaning/);
  assert.match(commandCenterJs, /approved_local_only:'Approved for review; not executed'/);
  assert.match(commandCenterJs, /edited:'Refined; not executed'/);
  assert.match(commandCenterJs, /rejected:'Declined; not executed'/);
  assert.match(commandCenterJs, /failed:'Execution failed; receipt saved'/);
  assert.match(commandCenterJs, /Your approval is recorded, but the external action has not run/);
  assert.match(commandCenterJs, /Your refinements were saved to the packet\. Execution is still gated/);
  assert.match(commandCenterJs, /This packet was declined\. VAL will not execute it/);
  assert.match(commandCenterJs, /Proposal packet/);
  assert.match(commandCenterJs, /Calendar invitation packet/);
  assert.match(commandCenterJs, /Page packet/);
  assert.match(commandCenterJs, /Introduction packet/);
  assert.match(commandCenterJs, /Email packet/);
  assert.match(commandCenterJs, /Prepared-work packet/);
  assert.match(commandCenterJs, /val-card-packet-receipt/);
  assert.match(commandCenterJs, /val-card-packet-boundary/);
  assert.match(commandCenterJs, /val-packet-id\{font:700 11px var\(--mono,monospace\)/);
  assert.match(commandCenterJs, /<dt>Packet<\/dt><dd class="val-packet-id">'\+safe\(packetId\)\+'/);
  assert.match(commandCenterJs, /val-card-packet-receipt \.val-packet-gate-badge/);
  assert.match(commandCenterJs, /<div class="val-packet-gate-badge">Execution remains gated<\/div>/);
  assert.match(commandCenterJs, /safe\(packetStatusLabel\(status\)\)/);
  assert.match(commandCenterJs, /val-packet-receipt-meaning/);
  assert.match(commandCenterJs, /dt\.val-packet-receipt-meaning\+dd,\.val-card-packet-receipt dt\.val-packet-receipt-why\+dd\{line-height:1\.45/);
  assert.match(commandCenterJs, /<dt class="val-packet-receipt-meaning">Meaning<\/dt><dd>'\+safe\(packetStatusMeaning\(status,receiptLabel\)\)\+'/);
  assert.match(commandCenterJs, /val-packet-receipt-why/);
  assert.match(commandCenterJs, /dt\.val-packet-receipt-meaning,\.val-card-packet-receipt dt\.val-packet-receipt-meaning\+dd,\.val-card-packet-receipt dt\.val-packet-receipt-why/);
  assert.match(commandCenterJs, /<dt class="val-packet-receipt-why">Why<\/dt><dd>'\+safe\(why\)\+'/);
  assert.match(commandCenterJs, /if\(data&&data\.packet\)out\.lastChild\.innerHTML=packetReceiptHtml\(data\)/);
  assert.match(commandCenterJs, /whatWillNotHappen/);
  assert.match(commandCenterJs, /<dt>Type<\/dt>/);
  assert.match(commandCenterJs, /Open receipt trail/);
  assert.match(commandCenterJs, /openExternalActionPacketTimeline\(\\''\+jsString\(packetId\)\+'\\',\\''\+jsString\(receiptLabel\)\+'\\'\)/);
});

test('packet receipts link to a full external action timeline drawer', () => {
  assert.match(commandCenterJs, /receiptLabel\.toLowerCase\(\)/);
  assert.match(commandCenterJs, /function externalPacketTimelineHtml/);
  assert.match(commandCenterJs, /packetLabel=externalPacketArtifactLabel\(packet\)/);
  assert.match(commandCenterJs, /safe\(packetLabel\)\+' receipt trail/);
  assert.match(commandCenterJs, /<strong>'\+safe\(packetLabel\)\+' receipt trail<\/strong><div class="val-packet-gate-badge">Execution remains gated<\/div>/);
  assert.match(commandCenterJs, /<span>Packet<\/span><strong class="val-packet-id">'\+safe\(packet\.id\|\|'Unknown'\)\+'/);
  assert.match(commandCenterJs, /<span>Type<\/span><strong>'\+safe\(packetLabel\)/);
  assert.match(commandCenterJs, /val-packet-decision-strip/);
  assert.match(commandCenterJs, /val-packet-meaning,\.val-packet-decision-strip \.val-packet-why\{grid-column:1 \/ -1/);
  assert.match(commandCenterJs, /val-packet-meaning strong,\.val-packet-decision-strip \.val-packet-why strong\{line-height:1\.45/);
  assert.match(commandCenterJs, /class="val-packet-meaning"><span>Meaning<\/span>/);
  assert.match(commandCenterJs, /class="val-packet-why"><span>Why<\/span>/);
  assert.match(commandCenterJs, /safe\(packetStatusLabel\(packet\.status\|\|'unknown'\)\)/);
  assert.match(commandCenterJs, /<span>Meaning<\/span><strong>'\+safe\(packetStatusMeaning\(packet\.status\|\|'unknown',packetLabel\)\)\+'/);
  assert.match(commandCenterJs, /safe\(packetStatusLabel\(approval\.status\|\|packet\.approvalPolicy/);
  assert.match(commandCenterJs, /safe\(packetStatusLabel\(status\)\)/);
  assert.match(commandCenterJs, /packetLabel\+' planned as a one-action review item/);
  assert.match(commandCenterJs, /packetLabel\+' approval is recorded only when the user approves this exact packet/);
  assert.match(commandCenterJs, /packetLabel\+' execution remains separate from review/);
  assert.match(commandCenterJs, /packetLabel\+' reconciliation will confirm/);
  assert.match(commandCenterJs, /openExternalActionPacketTimeline/);
  assert.match(commandCenterJs, /title:packetLabel\?packetLabel\+' receipt trail':'Receipt Trail'/);
  assert.match(commandCenterJs, /kicker:'Execution gated'/);
  assert.match(commandCenterJs, /Opening receipt trail/);
  assert.match(commandCenterJs, /Receipt trail unavailable/);
  assert.match(commandCenterJs, /No receipt trail stages are available yet/);
  assert.match(commandCenterJs, /<h3>Receipt Trail<\/h3>/);
  assert.match(commandCenterJs, /Review the receipt trail before taking external action/);
  assert.match(commandCenterJs, /\/api\/val\/external-actions\/'\+encodeURIComponent\(packetId\)\+'\/detail/);
  assert.match(commandCenterJs, /val-packet-timeline/);
  assert.match(commandCenterJs, /planned/);
  assert.match(commandCenterJs, /approved/);
  assert.match(commandCenterJs, /executed/);
  assert.match(commandCenterJs, /reconciled/);
  assert.match(commandCenterJs, /No external action is being taken/);
});

test('receipt trail drawer renders exact packet contents', () => {
  assert.match(commandCenterJs, /function packetPayloadPreviewHtml/);
  assert.match(commandCenterJs, /Packet Contents/);
  assert.match(commandCenterJs, /No packet contents are stored for this receipt yet/);
  assert.match(commandCenterJs, /val-packet-payload/);
  assert.match(commandCenterJs, /val-packet-gate-badge/);
  assert.match(commandCenterJs, /Execution remains gated/);
  assert.match(commandCenterJs, /proposalDraft/);
  assert.match(commandCenterJs, /HTML page draft/);
  assert.match(commandCenterJs, /calendarInviteDraft/);
  assert.match(commandCenterJs, /Email draft/);
  assert.match(commandCenterJs, /Recipients/);
  assert.match(commandCenterJs, /packetPayloadPreviewHtml\(packet\)/);
});

test('receipt trail packet contents can refine the exact packet', () => {
  assert.match(commandCenterJs, /Refine Exact Packet/);
  assert.match(commandCenterJs, /packetPayloadEdit-/);
  assert.match(commandCenterJs, /function\(packetId\)/);
  assert.match(commandCenterJs, /saveExternalActionPacketPayload/);
  assert.match(commandCenterJs, /JSON\.parse\(textarea\.value/);
  assert.match(commandCenterJs, /Packet details must be valid JSON/);
  assert.match(commandCenterJs, /\/api\/val\/external-actions\/'\+encodeURIComponent\(packetId\)\+'\/edit/);
  assert.match(commandCenterJs, /payloadPreviewJson:payload/);
  assert.match(commandCenterJs, /Save packet changes/);
  assert.match(commandCenterJs, /Packet contents refined from receipt trail drawer/);
  assert.match(commandCenterJs, /Ready to refine this packet\. Execution remains gated\./);
  assert.match(commandCenterJs, /No external action was taken/);
  assert.match(commandCenterJs, /externalPacketArtifactLabel\(refreshedPacket\|\|\{payloadPreviewJson:payload\}\)/);
  assert.match(commandCenterJs, /externalPacketTimelineWorkspace \.exec-workspace-body/);
  assert.match(commandCenterJs, /workspaceBody\.innerHTML=externalPacketTimelineHtml\(\{packet:refreshedPacket/);
  assert.match(commandCenterJs, /setTimeout\(function\(\)\{openExternalActionPacketTimeline\(packetId\);\},450\)/);
});

test('email and introduction packets expose friendly edit fields before JSON fallback', () => {
  assert.match(commandCenterJs, /val-packet-friendly-fields/);
  assert.match(commandCenterJs, /packetSubject-/);
  assert.match(commandCenterJs, /packetBody-/);
  assert.match(commandCenterJs, /packetRecipients-/);
  assert.match(commandCenterJs, /data-packet-friendly-fields/);
  assert.match(commandCenterJs, /recipientsText/);
  assert.match(commandCenterJs, /payload\.subject=subject\.value\.trim/);
  assert.match(commandCenterJs, /payload\.bodyPreview=body\.value\.trim/);
  assert.match(commandCenterJs, /payload\.recipients=recipients\.value\.split/);
});

test('calendar invite packets expose friendly edit fields before JSON fallback', () => {
  assert.match(commandCenterJs, /inviteAttendeesText/);
  assert.match(commandCenterJs, /packetCalendarTitle-/);
  assert.match(commandCenterJs, /packetCalendarTime-/);
  assert.match(commandCenterJs, /packetCalendarAttendees-/);
  assert.match(commandCenterJs, /packetCalendarNotes-/);
  assert.match(commandCenterJs, /payload\.calendarInviteDraft=payload\.calendarInviteDraft\|\|\{\}/);
  assert.match(commandCenterJs, /payload\.calendarInviteDraft\.title=calTitle\.value\.trim/);
  assert.match(commandCenterJs, /payload\.calendarInviteDraft\.proposedTime=calTime\.value\.trim/);
  assert.match(commandCenterJs, /payload\.calendarInviteDraft\.attendees=calAttendees\.value\.split/);
  assert.match(commandCenterJs, /payload\.calendarInviteDraft\.notes=calNotes\.value\.trim/);
});

test('proposal packets expose friendly edit fields before JSON fallback', () => {
  assert.match(commandCenterJs, /packetProposalTitle-/);
  assert.match(commandCenterJs, /packetProposalRecipient-/);
  assert.match(commandCenterJs, /packetProposalScope-/);
  assert.match(commandCenterJs, /packetProposalInvestment-/);
  assert.match(commandCenterJs, /packetProposalBody-/);
  assert.match(commandCenterJs, /Proposal title/);
  assert.match(commandCenterJs, /Recipient \/ company/);
  assert.match(commandCenterJs, /Scope summary/);
  assert.match(commandCenterJs, /Investment \/ pricing note/);
  assert.match(commandCenterJs, /Proposal body/);
  assert.match(commandCenterJs, /payload\.proposalDraft=payload\.proposalDraft\|\|\{\}/);
  assert.match(commandCenterJs, /payload\.proposalDraft\.title=proposalTitle\.value\.trim/);
  assert.match(commandCenterJs, /payload\.proposalDraft\.recipient=proposalRecipient\.value\.trim/);
  assert.match(commandCenterJs, /payload\.proposalDraft\.scope=proposalScope\.value\.trim/);
  assert.match(commandCenterJs, /payload\.proposalDraft\.investmentNote=proposalInvestment\.value\.trim/);
  assert.match(commandCenterJs, /payload\.proposalDraft\.body=proposalBody\.value/);
});

test('HTML page packets expose friendly edit fields before JSON fallback', () => {
  assert.match(commandCenterJs, /packetPageFilename-/);
  assert.match(commandCenterJs, /packetPageTitle-/);
  assert.match(commandCenterJs, /packetPageDestination-/);
  assert.match(commandCenterJs, /packetPageHtml-/);
  assert.match(commandCenterJs, /Page title \/ heading/);
  assert.match(commandCenterJs, /Publish destination/);
  assert.match(commandCenterJs, /HTML \/ body content/);
  assert.match(commandCenterJs, /payload\.filename=pageFilename\.value\.trim/);
  assert.match(commandCenterJs, /payload\.pageTitle=pageTitle\.value\.trim/);
  assert.match(commandCenterJs, /payload\.destination=pageDestination\.value\.trim/);
  assert.match(commandCenterJs, /payload\.htmlDraft=pageHtml\.value/);
});
