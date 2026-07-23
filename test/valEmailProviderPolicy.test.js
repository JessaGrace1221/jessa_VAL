const test=require('node:test');
const assert=require('node:assert/strict');
const {
  GMAIL_SEND_SCOPE,
  MICROSOFT_SEND_SCOPE,
  selectEmailProvider,
  hasMicrosoftSendScope
}=require('../services/valEmailProviderPolicy');

test('email provider policy prefers Gmail and falls back to Outlook',()=>{
  assert.equal(selectEmailProvider({gmailSendReady:true,outlookSendReady:true}),'gmail');
  assert.equal(selectEmailProvider({gmailSendReady:false,outlookSendReady:true}),'outlook');
});

test('email provider policy honors an explicit reviewed provider',()=>{
  assert.equal(selectEmailProvider({requested:'microsoft',outlookSendReady:true}),'outlook');
  assert.throws(
    ()=>selectEmailProvider({requested:'gmail',gmailSendReady:false,outlookSendReady:true}),
    /Gmail send permission is missing/
  );
});

test('email provider policy never falls back to GHL',()=>{
  assert.throws(
    ()=>selectEmailProvider({requested:'ghl',gmailSendReady:false,outlookSendReady:false}),
    /No send-capable Gmail or Outlook connection/
  );
});

test('provider scope constants and Microsoft scope detection cover live sending',()=>{
  assert.equal(GMAIL_SEND_SCOPE,'https://www.googleapis.com/auth/gmail.send');
  assert.equal(MICROSOFT_SEND_SCOPE,'Mail.Send');
  assert.equal(hasMicrosoftSendScope({scope:'offline_access User.Read Mail.Read Mail.Send'}),true);
  assert.equal(hasMicrosoftSendScope({scope:'offline_access User.Read Mail.Read'}),false);
});
