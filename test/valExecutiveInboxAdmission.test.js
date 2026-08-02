const test = require('node:test');
const assert = require('node:assert/strict');
const {
  cachedSentHistory,
  decideExecutiveInboxAdmission,
  hasListMailSignal
} = require('../services/valExecutiveInboxAdmission');

test('unsubscribe and list-mail signals never enter Executive Inbox', () => {
  assert.equal(hasListMailSignal({
    subject:'Monthly update',
    bodyText:'Read the latest news. Unsubscribe or manage preferences.'
  }), true);
  const decision = decideExecutiveInboxAdmission({
    email:{
      from:{email:'newsletter@example.com'},
      subject:'Monthly update',
      bodyText:'Read the latest news. Unsubscribe here.'
    },
    hasSentHistory:true,
    clearAsk:true
  });
  assert.equal(decision.admitted, false);
  assert.equal(decision.rule, 'unsubscribe_or_list_mail');
});

test('calendar invitations stay in Calendar instead of Executive Inbox', () => {
  const decision = decideExecutiveInboxAdmission({
    email:{subject:'Updated invitation: Weekly leadership sync',from:{email:'leader@example.com'},classification:'calendar_notice'},
    hasSentHistory:true,
    clearAsk:true
  });
  assert.equal(decision.admitted, false);
  assert.equal(decision.rule, 'calendar_notice');
});

test('outbox history is required unless the user explicitly safe-lists the contact', () => {
  const blocked = decideExecutiveInboxAdmission({
    email:{from:{email:'new@example.com'},subject:'Can you review this?'},
    hasSentHistory:false,
    clearAsk:true
  });
  assert.equal(blocked.admitted, false);
  assert.equal(blocked.rule, 'no_outbox_history');

  const overridden = decideExecutiveInboxAdmission({
    email:{from:{email:'new@example.com'},subject:'Can you review this?'},
    safeContacts:[{email:'new@example.com'}],
    hasSentHistory:false,
    clearAsk:true
  });
  assert.equal(overridden.admitted, true);
  assert.equal(overridden.rule, 'manual_executive_contact_override');

  const ordinarySafeListedMail = decideExecutiveInboxAdmission({
    email:{from:{email:'new@example.com'},subject:'A quiet update'},
    safeContacts:[{email:'new@example.com'}],
    hasSentHistory:false,
    clearAsk:false
  });
  assert.equal(ordinarySafeListedMail.admitted, true);
  assert.equal(ordinarySafeListedMail.rule, 'manual_executive_contact_override');
});

test('reciprocal mail still needs an executive action', () => {
  const quiet = decideExecutiveInboxAdmission({
    email:{from:{email:'known@example.com'},subject:'For your information'},
    hasSentHistory:true,
    clearAsk:false
  });
  assert.equal(quiet.admitted, false);
  assert.equal(quiet.rule, 'no_executive_action');

  const actionable = decideExecutiveInboxAdmission({
    email:{from:{email:'known@example.com'},subject:'Can you approve this proposal?'},
    hasSentHistory:true,
    clearAsk:true
  });
  assert.equal(actionable.admitted, true);
  assert.equal(actionable.rule, 'reciprocal_actionable_thread');
});

test('manual suppression and resolution outrank every admission signal', () => {
  const suppressed = decideExecutiveInboxAdmission({
    email:{from:{email:'known@example.com'},subject:'Can you approve this?'},
    suppressions:[{email:'known@example.com'}],
    safeContacts:[{email:'known@example.com'}],
    hasSentHistory:true,
    clearAsk:true
  });
  assert.equal(suppressed.admitted, false);
  assert.equal(suppressed.rule, 'manual_not_executive_contact');

  const resolved = decideExecutiveInboxAdmission({
    email:{from:{email:'known@example.com'},subject:'Can you approve this?'},
    hasSentHistory:true,
    clearAsk:true,
    resolved:true
  });
  assert.equal(resolved.admitted, false);
  assert.equal(resolved.rule, 'resolved_thread');
});

test('cached context recognizes durable outbound history', () => {
  assert.equal(cachedSentHistory({sender_metrics:{outboundToSenderCount:1}}), true);
  assert.equal(cachedSentHistory({latest_outbound:{messageId:'sent-1'}}), true);
  assert.equal(cachedSentHistory({sender_metrics:{outboundToSenderCount:0}}), false);
});
