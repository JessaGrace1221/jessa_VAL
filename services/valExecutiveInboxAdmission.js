function safeArray(value){
  return Array.isArray(value) ? value : [];
}

function normalizeEmail(value = ''){
  const email = String(value || '').trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '';
}

function senderEmail(email = {}, context = {}){
  const message = context.current_message || context.currentMessage || context.latest_inbound || context.latestInbound || {};
  return normalizeEmail(
    email.from?.email ||
    email.senderEmail ||
    message.from?.email ||
    message.sender?.email ||
    context.sender_email ||
    context.senderEmail
  );
}

function senderKey(email = {}, context = {}){
  const address = senderEmail(email, context);
  return address ? `email:${address}` : '';
}

function executiveInboxText(email = {}, context = {}){
  const message = context.current_message || context.currentMessage || {};
  const inbound = context.latest_inbound || context.latestInbound || {};
  return [
    email.subject,
    email.snippet,
    email.bodyPreview,
    email.bodyText,
    email.bodyHtml,
    message.subject,
    message.snippet,
    message.bodyPreview,
    message.bodyText,
    message.bodyHtml,
    inbound.subject,
    inbound.snippet,
    inbound.bodyPreview,
    inbound.bodyText,
    inbound.bodyHtml,
    context.thread_summary,
    context.threadSummary
  ].filter(Boolean).join(' ');
}

function hasListMailSignal(email = {}, context = {}){
  const headers = email.headers || context.headers || {};
  const headerText = [
    headers['list-unsubscribe'],
    headers['List-Unsubscribe'],
    headers['list-id'],
    headers['List-ID'],
    headers.precedence,
    headers.Precedence
  ].filter(Boolean).join(' ');
  return /\b(unsubscribe|manage (?:email )?preferences|update (?:your )?preferences|view in browser|opt out|newsletter|digest|list-unsubscribe|list-id|mailing list)\b/i.test(
    `${executiveInboxText(email, context)} ${headerText}`
  );
}

function isCalendarNotice(email = {}, context = {}){
  const classification = String(
    email.classification ||
    context.classification?.classification ||
    context.classification ||
    ''
  ).toLowerCase();
  if(classification === 'calendar_notice') return true;
  const subject = String(email.subject || context.current_message?.subject || context.currentMessage?.subject || '');
  return /^(?:updated |canceled |cancelled )?invitation:|^(?:accepted|declined|tentative):/i.test(subject);
}

function cachedSentHistory(context = {}, email = {}){
  const metrics = context.sender_metrics || context.senderMetrics || email.senderMetrics || {};
  const outbound = Number(
    metrics.outboundToSenderCount ??
    metrics.outbound_to_sender_count ??
    metrics.sentToSenderCount ??
    metrics.sent_to_sender_count ??
    context.outboundToSenderCount ??
    context.outbound_to_sender_count ??
    0
  ) || 0;
  const latestOutbound = context.latest_outbound || context.latestOutbound || {};
  const message = context.current_message || context.currentMessage || {};
  const ownerSentCurrent = String(message.direction || email.direction || '').toLowerCase() === 'outbound';
  return outbound > 0 || !!Object.keys(latestOutbound).length || ownerSentCurrent;
}

function hasClearAsk(email = {}, context = {}){
  if(context.waiting_on_user || context.waitingOnUser) return true;
  return /\?|(\b(can you|could you|will you|would you|please|let me know|confirm|review|send|share|thoughts|feedback|available|availability|schedule|booking|appointment|decision|approve|approval|quote|estimate|proposal|next step)\b)/i.test(
    executiveInboxText(email, context)
  );
}

function keySet(rows = []){
  return new Set(safeArray(rows).flatMap((row) => {
    if(typeof row === 'string') return [row.toLowerCase()];
    const email = normalizeEmail(row.email || row.senderEmail || row.from?.email);
    const domain = String(row.domain || '').replace(/^@/, '').trim().toLowerCase();
    return [row.key, email && `email:${email}`, domain && `domain:${domain}`].filter(Boolean).map(String);
  }));
}

function decideExecutiveInboxAdmission({
  email = {},
  context = {},
  suppressions = [],
  safeContacts = [],
  hasSentHistory,
  waitingOnOther,
  clearAsk,
  resolved = false
} = {}){
  const address = senderEmail(email, context);
  const domain = address.split('@')[1] || '';
  const suppressionKeys = keySet(suppressions);
  const safeKeys = keySet(safeContacts);
  const suppressed = (address && suppressionKeys.has(`email:${address}`)) || (domain && suppressionKeys.has(`domain:${domain}`));
  const safeListed = (address && safeKeys.has(`email:${address}`)) || (domain && safeKeys.has(`domain:${domain}`));
  const sentHistory = hasSentHistory == null ? cachedSentHistory(context, email) : !!hasSentHistory;
  const waiting = waitingOnOther == null
    ? !!(context.waiting_on_other || context.waitingOnOther || String(email.classification || '').toLowerCase() === 'waiting_on_response')
    : !!waitingOnOther;
  const asksForJudgment = clearAsk == null ? hasClearAsk(email, context) : !!clearAsk;

  if(resolved) return {admitted:false, rule:'resolved_thread', reason:'This thread was already resolved.'};
  if(suppressed) return {admitted:false, rule:'manual_not_executive_contact', reason:'The user marked this sender as not an executive contact.', address};
  if(hasListMailSignal(email, context)) return {admitted:false, rule:'unsubscribe_or_list_mail', reason:'Unsubscribe or list-mail evidence keeps this message out of Executive Inbox.', address};
  if(isCalendarNotice(email, context)) return {admitted:false, rule:'calendar_notice', reason:'Calendar invitations belong in Calendar, not Executive Inbox.', address};
  if(!sentHistory && !safeListed) return {admitted:false, rule:'no_outbox_history', reason:'The user has not sent mail to this address, so it has not earned Executive Inbox space.', address};
  if(!waiting && !asksForJudgment) return {admitted:false, rule:'no_executive_action', reason:'This thread does not currently require a reply, decision, approval, or follow-up.', address};

  return {
    admitted:true,
    rule:safeListed && !sentHistory ? 'manual_executive_contact_override' : 'reciprocal_actionable_thread',
    reason:waiting
      ? 'The user sent something that is still waiting on the other person.'
      : 'The user has sent mail to this person before, and the latest thread needs judgment.',
    address,
    hasSentHistory:sentHistory,
    safeListed,
    clearAsk:asksForJudgment,
    waitingOnOther:waiting
  };
}

module.exports = {
  cachedSentHistory,
  decideExecutiveInboxAdmission,
  executiveInboxText,
  hasClearAsk,
  hasListMailSignal,
  isCalendarNotice,
  senderEmail,
  senderKey
};
