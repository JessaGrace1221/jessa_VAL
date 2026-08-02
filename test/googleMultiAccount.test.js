const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
const hearth=fs.readFileSync(path.join(root,'hearth-prototype.js'),'utf8');
const externalActions=fs.readFileSync(path.join(root,'services','valExternalActions.js'),'utf8');

test('Google OAuth stores additional Gmail accounts without replacing primary Google',()=>{
  assert.match(server,/provider like \$4/);
  assert.match(server,/mode==='add'\?googleProviderForEmail\(profile\.email\)/);
  assert.match(server,/targetProvider==='google'/);
  assert.match(server,/account_email:profile\.email/);
  assert.match(server,/account_id:googleAccountId\(profile\.email\)/);
});

test('Google OAuth state preserves account intent through Aric Hearth callback',()=>{
  assert.match(server,/googleOAuthState\(\{mode,provider\}\)/);
  assert.match(server,/parseGoogleOAuthState\(req\.query\.state/);
  assert.match(server,/prompt=\$\{encodeURIComponent\(prompt\)\}/);
});

test('Gmail reads every connected account and preserves source provenance',()=>{
  assert.match(server,/Promise\.all\(accounts\.map\(account=>fetchGmailMessagesForAccount/);
  assert.match(server,/googleProvider,accountId:account\?\.accountId/);
  assert.match(server,/accountEmail:account\?\.email/);
  assert.match(server,/sourceAccount:account\?\.email/);
  assert.match(server,/in:sent newer_than:90d/);
});

test('Google Calendar reads every connected account and deduplicates shared invitations',()=>{
  assert.match(server,/async function fetchGoogleCalendarEventsForAccount/);
  assert.match(server,/getGoogleTokenForProvider\(googleProvider\)/);
  assert.match(server,/accounts\.map\(account=>fetchGoogleCalendarEventsForAccount/);
  assert.match(server,/googleCalendarEventDedupeKey/);
  assert.match(server,/const sourceAccounts=Array\.from\(new Set/);
});

test('Gmail draft, send, thread body, and attachments use the selected source account',()=>{
  assert.match(server,/payload\.googleProvider\|\|payload\.google_provider/);
  assert.match(server,/getGoogleTokenForProvider\(googleProvider\)/);
  assert.match(server,/gmailFetchJsonForProvider\(\s*googleProvider/);
  assert.match(hearth,/googleProvider:\s*item\.googleProvider/);
  assert.match(hearth,/googleProvider:\s*attachment\.googleProvider/);
  assert.match(externalActions,/googleProvider=String\(payload\.googleProvider\|\|payload\.google_provider/);
  assert.match(externalActions,/payload:\{to,subject,body,bodyPreview:[^}]+googleProvider,accountEmail/);
});

test('Hearth Connections names connected accounts and offers another Gmail account',()=>{
  assert.match(server,/addActionHref:'\/auth\/google\?mode=add'/);
  assert.match(hearth,/Additional Gmail inbox/);
  assert.match(hearth,/Add another Gmail account/);
});
