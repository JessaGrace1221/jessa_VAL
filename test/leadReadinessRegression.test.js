'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const server=fs.readFileSync(path.join(__dirname,'..','server.js'),'utf8');

test('all scraper families use one inspectable readiness contract',()=>{
  assert.match(server,/function buildLeadReadinessBrief/);
  assert.match(server,/WESTWOOD EMPLOYER/);
  assert.match(server,/STRATEGIC PARTNER/);
  assert.match(server,/FRISSON \$\{String/);
  assert.match(server,/SAVED SCRAPER LEAD/);
  assert.match(server,/OBSERVABLE READINESS:/);
  assert.match(server,/VERIFIED BUYING INTENT:/);
  assert.match(server,/CONTACT READINESS:/);
  assert.match(server,/INSPECTABLE SOURCES/);
  assert.match(server,/APPROVAL BOUNDARY/);
});

test('public readiness is never mislabeled as verified intent',()=>{
  assert.match(server,/const intentVerified=!!\(licensedIntentProvider&&licensedIntentEvidence\)/);
  assert.match(server,/does not contain licensed topic-consumption evidence proving that this organization is actively shopping for a solution/);
  assert.match(server,/Approval does not prove buying intent/);
});

test('approved Westwood, partner, and Frisson imports save readiness notes',()=>{
  assert.match(server,/saveLeadReadinessBrief\(contactId,lead,\{profile:isGoall\?'goall':'westwood'\}\)/);
  assert.match(server,/saveLeadReadinessBrief\(contactId,p,\{profile:isWestwood\?'westwood':'goall'\}\)/);
  assert.match(server,/saveLeadReadinessBrief\(contactId,p,\{profile:'partners'\}\)/);
  assert.match(server,/saveLeadReadinessBrief\(contactId,p,\{profile:'frisson',mode:currentMode\}\)/);
});

test('saved flexible scraper results carry a preview-only readiness packet',()=>{
  assert.match(server,/readinessBrief:buildLeadReadinessBrief\(normalized,\{profile:'general',previewOnly:true\}\)/);
  assert.match(server,/This is a research result only\. It has not been imported, contacted, or placed into an outreach automation\./);
});
