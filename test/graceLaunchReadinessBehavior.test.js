'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const crypto=require('node:crypto');
const policy=require('../services/graceLaunchReadiness');
const validation=require('../services/leadContactValidation');
const source=fs.readFileSync(path.join(__dirname,'..','server.js'),'utf8');
const evidence=[{source_url:'https://company.example.com/about',observation:'Documented commercial scale and explicit lower-bound assumptions.'}];
function prospect(){return {organizationName:'Example Systems',website:'https://company.example.com',decisionMakerName:'Taylor Smith',decisionMakerTitle:'Chief Executive Officer',email:'taylor@company.example.com',rocketReach:{data:{found:true,name:'Taylor Smith',title:'CEO',email:'taylor@company.example.com',company:'Example Systems'}},aiDecisionMakerResearch:{company_identity:{exact_company_matched:true},decision_maker:{preferred_person:{name:'Taylor Smith',title:'CEO',confidence:'High',source_urls:['https://company.example.com/team']}},qualification:{status:'Qualified',outbound_ready:true,annual_unlock_assessment:'Plausible',annual_unlock_estimate:120000,annual_unlock_reasoning:'The documented baseline and explicit assumptions support a conservative annual lower bound.',annual_unlock_evidence:evidence,revenue_fit_evidence:evidence,convergence_fit_evidence:evidence}}};}
function gift(){return {companyName:'Gift Company',website:'https://gift.example.com',decisionMakerName:'Morgan Smith',decisionMakerTitle:'Chief Operating Officer',decisionMakerEmail:'morgan@gift.example.com',contactVerification:{status:'provider_matched',sourceUrl:'https://gift.example.com/team'},trigger:'Current expansion announcement',whyItFitsProspect:'A sourced operational need matching the prospect service.',evidence:[{url:'https://gift.example.com/news',summary:'Published expansion announcement'}],firstMessageGraceWouldSend:'Morgan, your team announced its expansion. Here is a concrete way to handle the additional service demand, grounded in the scope you published.'};}
test('authority excludes sales reps, assistants and unsupported person assertions',()=>{
  for(const title of ['Sales Representative','Assistant to CEO','Account Executive','IT Specialist'])assert.equal(policy.authorityTitle(title),false,title);
  for(const title of ['CEO','Founder','Managing Partner','Head of Revenue','Director of Operations'])assert.equal(policy.authorityTitle(title),true,title);
  const p=prospect();assert.equal(policy.verifiedDecisionMaker(p),true);
  delete p.rocketReach;delete p.aiDecisionMakerResearch;assert.equal(policy.verifiedDecisionMaker(p),false);
});
test('financial gate never raises weak or rejected evidence to the threshold',()=>{
  assert.equal(policy.commercialAdmission({industry:'cloud managed IT enterprise sales'}).supported,false);
  const p=prospect();assert.equal(policy.commercialAdmission(p).supported,true);
  p.aiDecisionMakerResearch.qualification.annual_unlock_estimate=null;assert.equal(policy.commercialAdmission(p).supported,false);
  p.aiDecisionMakerResearch.qualification.outbound_ready=false;assert.equal(policy.commercialAdmission(p).rejected,true);
});
test('email admission binds named provider match to employer domain',()=>{
  const p=prospect();assert.equal(policy.emailMatchesPerson(p),true);
  p.email='taylor@vendor.example.org';assert.equal(policy.emailMatchesPerson(p),false);
  p.email='other@company.example.com';assert.equal(policy.emailMatchesPerson(p),false);
});
test('gift admission requires linked evidence, contact verification and a usable message',()=>{
  const p=gift();assert.equal(policy.packetReady(p),true);
  for(const field of ['website','decisionMakerName','decisionMakerEmail','firstMessageGraceWouldSend','contactVerification','evidence'])assert.equal(policy.packetReady({...p,[field]:null}),false,field);
  assert.equal(policy.packetReady({...p,evidence:[{summary:'uncited assertion'}]}),false);
  assert.equal(policy.packetReady({...p,caveats:'Guessed email pattern'}),false);
});
test('subject is removed from body for CRLF, markdown and header-only responses',()=>{
  for(const value of ['Subject: Test\n\nHello Morgan','**Subject:** Test\r\n\r\nHello Morgan','Subject: Test\nHello Morgan'])assert.equal(policy.stripSubject(value),'Hello Morgan');
  assert.equal(policy.stripSubject('Subject: Test'),'');
  assert.equal(policy.stripSubject('Hello Morgan\nThe subject is clear.'),'Hello Morgan\nThe subject is clear.');
});
test('CRM mapping uses actual IDs and supported choices and preserves zero',()=>{
  const defs=[{id:'tier',fieldKey:'contact.gi_val_fit_tier',picklistOptions:['A','B','C','D']},{id:'priority',fieldKey:'contact.gi_audit_priority',picklistOptions:['Critical','High','Medium','Low']},{id:'status',fieldKey:'contact.gi_review_status',dataType:'TEXT'},{id:'score',fieldKey:'contact.gi_val_fit_score',dataType:'NUMERICAL'}];
  const rows=policy.mappedFields({gi_val_fit_score:0,gi_val_fit_tier:'Suppress',gi_audit_priority:'D - hold',gi_review_status:'Research Hold'},defs,{});
  assert.equal(rows.find(r=>r.id==='tier').field_value,'D');assert.equal(rows.find(r=>r.id==='priority').field_value,'Low');assert.equal(rows.find(r=>r.id==='score').field_value,0);assert.equal(rows.find(r=>r.id==='status').field_value,'Research Hold');
  assert.throws(()=>policy.mappedFields({gi_review_status:'Research Hold'},[{id:'old',fieldKey:'contact.val_audit_status'}],{gi_review_status:'old'}),/Missing Grace/);
});
function runtime(extra={}){
  const ctx={...validation,graceLaunch:policy,crypto,...extra};vm.createContext(ctx);
  for(const [from,to] of [['function safeArray(','function jsonRecord('],['function frissonPartnerNumber(','function frissonPartnerEmployeeEstimate('],['function isLikelyPersonEmail(','function classifyEmail('],['function graceText(','const GRACE_SURFACE_FIT_MIN_SCORE'],['function graceNormalizeShowcaseLeadPacket(','function graceShowcaseLeadPacketText(']])vm.runInContext(source.slice(source.indexOf(from),source.indexOf(to)),ctx);
  return ctx;
}
test('integrated qualification preserves hold and allows only evidence-complete prospects',()=>{
  const ctx=runtime(),p=prospect();p.showcaseLeadPacket=gift();
  assert.equal(ctx.graceQualificationProfile(p).qualificationStatus,'Qualified for Import');
  for(const change of [{decisionMakerTitle:'Sales Representative'},{email:'info@company.example.com'},{showcaseLeadPacket:null},{demoGiftedPacket:true},{aiDecisionMakerResearch:{qualification:{status:'Not Recommended',outbound_ready:false}}}])assert.equal(ctx.graceQualificationProfile({...p,...change}).qualificationStatus,'Research Hold');
});
test('evidence note failures propagate and partial writes recover without duplicate parts',async()=>{
  const notes=[];let fail=true;
  const ctx={crypto,ghlStrict:async(method,url,body)=>{if(method==='GET')return {notes};if(fail){fail=false;throw Error('CRM unavailable');}const note={id:'note-'+notes.length,body:body.body};notes.push(note);return {note};}};
  vm.createContext(ctx);vm.runInContext(source.slice(source.indexOf('async function saveGraceEvidenceNotes('),source.indexOf('function graceAuditIntakeFromPayload(')),ctx);
  await assert.rejects(ctx.saveGraceEvidenceNotes('contact','Report',{evidence:'x'.repeat(15000)}),/CRM unavailable/);
  const first=await ctx.saveGraceEvidenceNotes('contact','Report',{evidence:'x'.repeat(15000)});assert.equal(first.noteVerified,true);assert.equal(notes.length,2);
  await ctx.saveGraceEvidenceNotes('contact','Report',{evidence:'x'.repeat(15000)});assert.equal(notes.length,2);
});
test('quota failure switches provider once and keeps subsequent stages off Gemini during cooldown',async()=>{
  let geminiCalls=0,webCalls=0;
  const ctx={GEMINI_API_KEY:'test-key',Date,Math,JSON,graceGeminiBaseContext:()=>'',graceUsefulJsonArray:value=>Array.isArray(value)?value:[],extractJsonObject:JSON.parse,callGeminiGroundedSearch:async()=>{geminiCalls++;throw Error('429 quota exceeded');},callOpenAIWebResearch:async()=>{webCalls++;return '{"source_urls":["https://example.com"],"ok":true}';}};
  vm.createContext(ctx);vm.runInContext(source.slice(source.indexOf('let graceGeminiUnavailableUntil='),source.indexOf('async function researchGraceWithGeminiStages(')),ctx);
  for(const stage of ['gifted_lead_strategy','gifted_lead_packet_for_prospect'])assert.equal((await ctx.callGraceGeminiStage({stage,schema:'{}'})).provider,'openai');
  assert.equal(geminiCalls,1);assert.equal(webCalls,2);
});
test('discovery provider and enrichment budgets stop at requested count, capped at ten',async()=>{
  let requests=[],enriched=0;
  const ctx={GRACE_SURFACE_FIT_MIN_SCORE:68,GRACE_MINIMUM_PLAUSIBLE_ANNUAL_UNLOCK:100000,OUTSCRAPER_API_KEY:'test',graceFitPlan:body=>({limit:Math.min(body.limit,10),market:'Test',searchTerms:['one','two','three'],surfaceGate:true,enrichContacts:true}),graceSpecificBusinessLeadFromBody:()=>null,discoverOutscraperProspects:async args=>{requests.push(args.limit);return {configured:true,leads:Array.from({length:args.limit},(_,i)=>({organizationName:'Company '+i}))};},goallLeadKey:p=>p.organizationName,graceSurfaceFitGate:()=>({score:90,passed:true,reasons:[],concerns:[],mustHaveMisses:[]}),mapWithConcurrency:(rows,limit,fn)=>Promise.all(rows.map(fn)),enrichProspect:async p=>{enriched++;return p;},scoreGraceFitLead:p=>p,graceFitPreviewText:()=>''};
  vm.createContext(ctx);vm.runInContext(source.slice(source.indexOf('async function discoverGraceFitLeads('),source.indexOf('function graceFitPreviewText(')),ctx);
  for(const limit of [1,10,999]){
    requests=[];enriched=0;const result=await ctx.discoverGraceFitLeads({limit});
    assert.equal(result.leads.length,Math.min(limit,10));assert.equal(requests.reduce((a,b)=>a+b,0),Math.min(limit,10));assert.equal(enriched,Math.min(limit,10));
  }
});
test('field mapper accepts every GI value generated in the failed production LRT',t=>{
  const root=process.env.GRACE_LRT_EVIDENCE_DIR;
  if(!root){t.skip('Saved live CRM definitions are required for this integration case');return;}
  const definitions=JSON.parse(fs.readFileSync(path.join(root,'ghl-fields-after-repair.json'))).body.customFields;
  const ids=Object.fromEntries(JSON.parse(fs.readFileSync(path.join(root,'live-field-status.json'))).body.fields.map(f=>[f.key,f.id]));
  const rejected=JSON.parse(fs.readFileSync(path.join(root,'invalid-field-values.json')));
  for(const item of rejected){
    const fields={[item.key]:item.attemptedValue};
    if(item.key==='gi_val_fit_tier')fields.gi_val_fit_score=50;
    const payload=policy.mappedFields(fields,definitions,ids);
    assert.ok(payload.length>0);
    for(const row of payload){const def=definitions.find(f=>f.id===row.id);assert.ok(!def.picklistOptions?.length||row.field_value===''||def.picklistOptions.includes(row.field_value),item.key);}
  }
});
test('preview jobs preserve slow results, isolate owners and deduplicate active requests',async()=>{
  const jobs=require('../services/gracePreviewJobs').createGracePreviewJobs();
  let finish,received;
  const run=payload=>{received=payload;return new Promise(resolve=>{finish=resolve;});};
  const first=jobs.start('owner-1',{limit:1},run);
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(jobs.start('owner-1',{limit:1},run).jobId,first.jobId);
  assert.equal(jobs.get('owner-2',first.jobId),null);
  assert.throws(()=>jobs.start('owner-1',{limit:2},run),/already running/);
  assert.equal(received.doNotSend,true);assert.equal(received.doNotImport,true);
  finish({ok:true,leads:[{organizationName:'Example'}]});
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(jobs.get('owner-1',first.jobId).status,'complete');
  assert.equal(jobs.get('owner-1',first.jobId).result.leads.length,1);
});
test('preview job failure is visible and completed results expire',async()=>{
  let clock=0;const jobs=require('../services/gracePreviewJobs').createGracePreviewJobs({now:()=>clock,ttlMs:10});
  const job=jobs.start('owner',{},async()=>{throw Error('Provider unavailable');});
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(jobs.get('owner',job.jobId).status,'failed');assert.match(jobs.get('owner',job.jobId).error,/Provider unavailable/);
  clock=20;assert.equal(jobs.get('owner',job.jobId),null);
});
