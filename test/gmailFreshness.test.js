const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
const dashboard=fs.readFileSync(path.join(root,'dashboard.html'),'utf8');

test('gmail fetch uses a 14-day active inbox window and sorts newest first',()=>{
  assert.match(server,/query='in:inbox newer_than:14d'/);
  assert.match(server,/const recentQuery=`in:inbox newer_than:\$\{activeDays\}d`/);
  assert.match(server,/sortEmailsNewestFirst/);
  assert.match(server,/internalDate/);
});

test('gmail refresh retries rejected access tokens and exposes sync status',()=>{
  assert.match(server,/async function gmailFetchJson/);
  assert.match(server,/response\.status===401&&googleTokens\.refresh_token/);
  assert.match(server,/lastSuccessfulSyncAt/);
  assert.match(server,/lastFetchedCount/);
  assert.match(server,/lastAnalyzedCount/);
  assert.match(server,/app\.post\('\/api\/email\/gmail\/refresh'/);
});

test('executive inbox UI has manual refresh and visible sync metadata',()=>{
  assert.match(dashboard,/Executive Inbox/);
  assert.match(dashboard,/Needs My Attention/);
  assert.match(dashboard,/Drafts/);
  assert.match(dashboard,/Rules/);
  assert.match(dashboard,/function selectEmailAt/);
  assert.match(dashboard,/onclick="selectEmailAt\(\$\{i\}\)"/);
  assert.match(dashboard,/list\.addEventListener\('click'/);
  assert.match(dashboard,/function renderSelectedEmailDetail/);
  assert.match(dashboard,/renderEmailDetail\(emailIntel\.selected\)/);
  assert.match(dashboard,/function markEmailNotImportant/);
  assert.match(dashboard,/function setEmailActionStatus/);
  assert.match(dashboard,/function saveInlineEmailRule/);
  assert.match(dashboard,/emailRulePanel/);
  assert.match(dashboard,/function saveManualEmailRule/);
  assert.match(dashboard,/Refresh Inbox/);
  assert.match(dashboard,/function refreshGmailNow/);
  assert.match(dashboard,/function renderEmailSyncStatus/);
  assert.match(dashboard,/Last successful sync/);
  assert.match(dashboard,/Evidence:/);
  assert.match(dashboard,/\/api\/email\/gmail\/refresh/);
});

test('executive inbox scan gates reply-worthy mail without canned auto drafts',()=>{
  assert.match(server,/function classifyExecutiveEmail/);
  assert.match(server,/function emailSenderMetrics/);
  assert.match(server,/more_than_three_inbound_zero_sent/);
  assert.match(server,/function emailIsCalendarNotification/);
  assert.match(server,/calendar_notice/);
  assert.match(server,/placeholder virtual meeting\|join with google meet/);
  assert.match(server,/function emailLooksAutomatedSystemNotice/);
  assert.match(server,/notify\\.railway\\.app\|mail\\.atlasfin\\.com/);
  assert.match(server,/function emailIsReadInbound/);
  assert.match(server,/read_inbound_excluded/);
  assert.match(server,/Already read by the user; Executive Inbox only shows unresolved unread conversations/);
  assert.match(server,/function emailLooksTransactionalOrBulk/);
  assert.match(server,/your orders\|thanks for your order\|ordered:\|shipped:/);
  assert.match(server,/recommended jobs\|job picks/);
  assert.match(server,/mastercard\|new loan inquiry\|loan offer/);
  assert.match(server,/function htmlToReadableEmailText/);
  assert.match(server,/replace\(\s*\/<style\[\\s\\S\]\*\?<\\\/style>\/gi/);
  assert.match(server,/function emailIsRelationshipSchedulingRequest/);
  assert.match(server,/Scheduling or booking request from a relationship-backed sender/);
  assert.match(server,/booking\|schedule\|class calendar\|appointment\|available\|availability/);
  assert.ok(server.indexOf('if(emailIsRelationshipSchedulingRequest(email))')<server.indexOf("if(/\\b(unsubscribe|special offer|limited time|book a call|seo|cold email|quick question|sponsor|advertis|newsletter)\\b/.test(text))"));
  assert.match(server,/Automated system or account notice without relationship\/project context/);
  assert.match(server,/const scanCorpus=\[/);
  assert.match(server,/senderMetrics:emailSenderMetrics\(email,scanCorpus\)/);
  assert.match(server,/app\.get\('\/api\/val\/executive-inbox\/queue'/);
  assert.match(server,/app\.post\('\/api\/val\/executive-inbox\/resolve-thread'/);
  assert.match(server,/app\.post\('\/api\/val\/executive-inbox\/safe-contact'/);
  assert.match(server,/app\.post\('\/api\/val\/executive-inbox\/link-context'/);
  assert.match(server,/executive_inbox_context_link/);
  assert.match(server,/function executiveInboxSafeListed/);
  assert.match(server,/This is here because you told VAL this sender belongs in Executive Inbox/);
  assert.match(server,/function canonicalExecutiveInboxQueue/);
  assert.match(server,/fetchGmailMessages\(\{query:`in:sent to:\$\{sender\}`/);
  assert.match(server,/waitingOnResponseFromSent\(sentGmail\.emails\|\|\[\],Array\.from\(gmailMap\.values\(\)\),0\)/);
  assert.match(server,/function emailShouldPrepareDraft/);
  assert.match(server,/function buildEmailReplyDraft/);
  assert.match(server,/function emailDraftStableId/);
  assert.match(server,/prepareEmailDraftIfNeeded/);
  assert.match(server,/Warm introduction opportunity asks for reply language/);
  assert.match(server,/intro\|introduction\|referral\|connect you/);
  assert.match(server,/async function prepareEmailDraftIfNeeded\(email\)\{\s*if\(!emailShouldPrepareDraft\(email\)\)return null;\s*return null;\s*\}/);
  assert.doesNotMatch(server,/source:'executive_inbox_auto_draft'/);
  assert.match(server,/if\(draft\)email\.preparedDraft=draft/);
  assert.match(dashboard,/Draft waiting for approval/);
  assert.match(dashboard,/Review Prepared Draft/);
});

test('relationship context can use read email and cc history without admitting it to Executive Inbox',()=>{
  assert.match(server,/function gmailRelationshipContextQuery/);
  assert.match(server,/from:\$\{email\} OR to:\$\{email\} OR cc:\$\{email\}/);
  assert.match(server,/newer_than:\$\{boundedDays\}d/);
  assert.match(server,/buildRelationshipContextTimeline/);
  assert.match(server,/fetchGmailMessages\(\{query:gmailRelationshipContextQuery\(contact,30\),maxResults:40,includeBody:true\}/);
  assert.match(server,/Gmail from\/to\/cc 30 days/);
  assert.match(server,/read_inbound_excluded/);
  assert.match(server,/Already read by the user; Executive Inbox only shows unresolved unread conversations/);
});

test('executive inbox actions report inline and rules avoid native confirm flow',()=>{
  assert.match(dashboard,/Follow-up tracked/);
  assert.match(dashboard,/Task created/);
  assert.match(dashboard,/Rule saved/);
  assert.match(dashboard,/VAL is saving this rule/);
  assert.doesNotMatch(dashboard,/Confirm automation rule\\\\n/);
  assert.match(server,/mode==='vip_priority'/);
  assert.match(server,/mode==='draft_reply'/);
  assert.match(server,/mode==='track_response'/);
});

test('email sync captures evidence before actions and does not auto-create tasks',()=>{
  assert.match(server,/async function saveEmailEvidence/);
  assert.match(server,/async function runObservationEngine/);
  assert.match(server,/runObservationEngine\(evidence,\{candidates:emailObservationCandidates\(email\),replace:true\}\)/);
  assert.match(server,/sourceType=email\.provider==='outlook'\?'outlook_email':'gmail_email'/);
  assert.match(server,/function emailParticipantIntakeEligible/);
  assert.match(server,/relationshipIntake:eligible/);
  assert.match(server,/inbound_or_unconfirmed_email_only/);
  assert.match(server,/source:'email_relationship_intake'/);
  assert.match(server,/relationshipProfilesTouched:relationshipIntake\.relationshipProfiles/);
  assert.match(server,/personPacketsTouched:relationshipIntake\.personPackets/);
  for(const type of ['reply_needed','pricing_question','meeting_request','document_request','spam','newsletter','receipt']){
    assert.match(server,new RegExp(`'${type}'`));
  }
  const syncStart=server.indexOf('async function emailIntelligencePayload');
  const evidenceWrite=server.indexOf('const evidenceResults=await saveEmailEvidenceBatch(emails)',syncStart);
  const logOnly=server.indexOf("actionType:'classified'",evidenceWrite);
  const firstTaskSave=server.indexOf('await saveTask',syncStart);
  assert.ok(evidenceWrite>syncStart,'email sync should write evidence');
  assert.ok(logOnly>evidenceWrite,'email sync should log classification after evidence capture');
  assert.ok(firstTaskSave<0||firstTaskSave>server.indexOf("app.post('/api/email/actions'",syncStart),'email sync should not save tasks directly');
});

test('stewardship contact admission rejects unsubscribe bulk and generic senders',()=>{
  assert.match(server,/function relationshipContactQuality/);
  assert.match(server,/function relationshipEmailHasUnsubscribeSignal/);
  assert.match(server,/function relationshipEmailHasBulkSignal/);
  assert.match(server,/function relationshipEmailIsGenericMailbox/);
  assert.match(server,/headers:\{\s*listUnsubscribe:header\('List-Unsubscribe'\)/);
  assert.match(server,/relationshipContactQuality\(\{email,role,participant:p\}\)/);
  assert.match(server,/relationshipIntakeReason:eligible\?\(alias\?\.source\|\|quality\.trustedSignals\[0\]\|\|'reciprocal_or_linked_email_signal'\):\(quality\.reasons\[0\]\|\|'inbound_or_unconfirmed_email_only'\)/);
  assert.match(server,/relationshipContactQuality:p\.relationshipContactQuality\|\|null/);
  assert.match(server,/quality\?\.hardRejected\|\|quality\?\.accepted===false/);
  assert.match(server,/if\(contactQuality\.hardRejected\)/);
  for(const token of ['List-Unsubscribe','manage preferences','view in browser','Precedence','X-Mailchimp','generic_or_role_mailbox','unsubscribe_or_list_mail','bulk_or_campaign_mail','transactional_or_bulk_mail']){
    assert.match(server,new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
  }
});
