'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
const hearth=fs.readFileSync(path.join(root,'hearth-prototype.js'),'utf8');
const html=fs.readFileSync(path.join(root,'hearth-prototype.html'),'utf8');
const contract=fs.readFileSync(path.join(root,'docs','VAL_GENERAL_LEAD_SCRAPER_CONTRACT.md'),'utf8');

test('general scraper is durable and server-enforces one included active slot',()=>{
  assert.match(server,/create table if not exists val_lead_scraper_definitions/);
  assert.match(server,/const INCLUDED_GENERAL_LEAD_SCRAPER_SLOTS = 1/);
  assert.match(server,/const ADDITIONAL_GENERAL_LEAD_SCRAPER_PRICE_MONTHLY = 200/);
  assert.match(server,/VAL_ADDITIONAL_SCRAPER_SLOTS/);
  assert.match(server,/additional_scraper_slot_required/);
  assert.match(server,/app\.get\('\/api\/val\/lead-scrapers'/);
  assert.match(server,/app\.post\('\/api\/val\/lead-scrapers'/);
  assert.match(server,/app\.put\('\/api\/val\/lead-scrapers\/:id'/);
  assert.match(server,/app\.delete\('\/api\/val\/lead-scrapers\/:id'/);
  assert.match(hearth,/persistGeneralLeadScraper/);
  assert.match(hearth,/available across devices/);
  assert.doesNotMatch(html,/Run organization scraper/);
  assert.doesNotMatch(html,/Run partner scraper/);
});

test('general scraper accepts flexible executive search language and preserves source links',()=>{
  for(const field of ['businessTerms','roleTerms','painPoints','locations','qualification']){
    assert.match(server,new RegExp(field));
    assert.match(hearth,new RegExp(field));
  }
  assert.match(server,/app\.post\('\/api\/val\/lead-scrapers\/discover-preview'/);
  assert.match(server,/leadProfile:'general'/);
  assert.match(server,/businessViewUrl:generalLeadViewUrl\(lead\)/);
  assert.match(server,/personViewUrl:lead\.linkedinPersonalUrl/);
  assert.match(hearth,/View this business/);
  assert.match(hearth,/View this person/);
  assert.match(hearth,/Save this scraper/);
  assert.match(hearth,/safeLeadSourceHref/);
  assert.match(hearth,/\['decisionMakerName','contactName','primaryContact'\]/);
  assert.doesNotMatch(hearth,/\['decisionMakerName','contactName','primaryContact','name'\]/);
});

test('GOALL remains a separate protected workflow',()=>{
  assert.match(server,/app\.post\('\/api\/val\/leads\/discover-preview'/);
  assert.match(server,/app\.post\('\/api\/val\/leads\/import-approved'/);
  assert.match(server,/app\.post\('\/api\/val\/partners\/discover-preview'/);
  assert.match(server,/async function discoverGoallProspectsWithOutscraper/);
  assert.match(server,/leadProfile:plan\.leadProfile/);
  assert.match(contract,/does not change their routes, search plans, scoring/);
  assert.doesNotMatch(contract,/replace the GOALL/);
});

test('post-scrape outreach defaults to governed prepare-and-queue mode',()=>{
  assert.match(server,/mode:'prepare_and_queue'/);
  assert.match(server,/outreachPolicy:\{mode:'prepare_and_queue',active:false\}/);
  assert.match(contract,/Outreach is a governed Environment/);
  assert.match(contract,/GHL handles deterministic delivery/);
  assert.match(contract,/Full autonomy is not the default/);
});
