const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {
  shouldAutoReplyToValInvocation,
  buildValInstantReplyPrompt,
  validateValInstantReply,
  DEFAULT_SCHEDULING_LINK
}=require('../services/valInstantEmailReply');

test('VAL instant email replies trigger only on inbound VAL or Val invocation',()=>{
  assert.equal(shouldAutoReplyToValInvocation({
    direction:'inbound',
    subject:'Question for VAL',
    from:{email:'client@example.com'}
  },['jessa@example.com']),true);
  assert.equal(shouldAutoReplyToValInvocation({
    direction:'inbound',
    bodyText:'Can Val help Jessa and me understand this?',
    from:{email:'client@example.com'}
  },['jessa@example.com']),true);
  assert.equal(shouldAutoReplyToValInvocation({
    direction:'inbound',
    bodyText:'Can val help with this?',
    from:{email:'client@example.com'}
  },['jessa@example.com']),false);
  assert.equal(shouldAutoReplyToValInvocation({
    direction:'outbound',
    subject:'VAL follow-up',
    from:{email:'jessa@example.com'}
  },['jessa@example.com']),false);
});

test('VAL instant reply prompt requires transcripts, prior emails, scheduling link, and observers',()=>{
  const prompt=buildValInstantReplyPrompt({
    email:{subject:'VAL question',bodyText:'VAL, what should we do next?',from:{name:'Avery',email:'avery@example.com'}},
    threadMessages:[{direction:'inbound',from:{email:'avery@example.com'},subject:'VAL question',bodyText:'VAL, what should we do next?'}],
    transcripts:[{id:'tr_1',title:'Strategy Call',summary:'Avery asked for a clear next step with Jessa.'}]
  });
  const payload=JSON.parse(prompt.user);
  assert.match(prompt.system,/Mention the observers at least once/);
  assert.equal(payload.hard_requirements[0],`Include this scheduling link exactly: ${DEFAULT_SCHEDULING_LINK}`);
  assert.match(payload.previous_thread_emails[0],/VAL, what should we do next/);
  assert.match(payload.relevant_transcripts[0],/Strategy Call/);
});

test('VAL instant reply QA enforces scheduling link and observers mention',()=>{
  const good=validateValInstantReply({
    subject:'Re: VAL question',
    body:`VAL can see the shape of this and the observers will keep the relationship context visible.\n\nMeet with Jessa here: ${DEFAULT_SCHEDULING_LINK}`
  });
  assert.equal(good.passes,true);
  const bad=validateValInstantReply({subject:'Re: VAL question',body:'VAL can help.'});
  assert.equal(bad.passes,false);
  assert.deepEqual(bad.issues.sort(),['missing_observers_mention','missing_scheduling_link'].sort());
});

test('VAL instant email sender deploys disabled until explicitly enabled',()=>{
  const server=fs.readFileSync(path.join(__dirname,'..','server.js'),'utf8');
  assert.match(server,/VAL_INSTANT_EMAIL_REPLY_ENABLED = \/\^\(1\|true\|yes\|on\)\$\//);
  assert.match(server,/VAL_INSTANT_EMAIL_REPLY_NOT_BEFORE = process\.env\.VAL_INSTANT_EMAIL_REPLY_NOT_BEFORE/);
  assert.match(server,/function valInstantReplyIsAfterCutoff/);
  assert.match(server,/\.filter\(email=>valInstantReplyIsAfterCutoff\(email,notBeforeMs\)\)/);
  assert.match(server,/processValInstantEmailReplies\(\{[\s\S]*?\}\)\.catch[\s\S]*: \{ok:true,disabled:true,candidates:0,sent:0,blocked:0,skipped:0,results:\[\]\}/);
  assert.match(server,/VAL instant email replies are disabled\. No emails were sent\./);
});
