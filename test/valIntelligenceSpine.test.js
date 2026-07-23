const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createValIntelligenceSpine,normalizeSourceRef}=require('../services/valIntelligenceSpine');
const {VAL_INTELLIGENCE_SPINE_SQL}=require('../services/valIntelligenceSpineSchema');

const root=path.join(__dirname,'..');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
const routes=fs.readFileSync(path.join(root,'services','valIntelligenceSpineRoutes.js'),'utf8');
const hearth=fs.readFileSync(path.join(root,'hearth-prototype.js'),'utf8');

test('VAL Intelligence Spine schema creates durable reasoning tables',()=>{
  for(const table of [
    'event_intelligence_runs',
    'observer_runs',
    'round_table_runs',
    'chief_of_staff_recommendations',
    'momentum_snapshots',
    'ready_for_you_items'
  ]){
    assert.match(VAL_INTELLIGENCE_SPINE_SQL,new RegExp(`create table if not exists ${table}`));
  }
  assert.match(VAL_INTELLIGENCE_SPINE_SQL,/source_refs_json jsonb/);
  assert.match(server,/ensureValIntelligenceSpineTables/);
});

test('VAL Intelligence Spine exposes backend-only API routes',()=>{
  assert.match(server,/registerValIntelligenceSpineRoutes/);
  assert.match(routes,/\/api\/val\/events\/intelligence-pass/);
  assert.match(routes,/\/api\/val\/observers\/runs/);
  assert.match(routes,/\/api\/val\/round-table\/runs/);
  assert.match(routes,/\/api\/val\/chief-of-staff\/recommend/);
  assert.match(routes,/\/api\/val\/chief-of-staff\/:id\/complete/);
});

test('Hearth makes the Witnessing Steward visible on the Board of Observers',()=>{
  assert.match(hearth,/name: 'Witnessing Steward'/);
  assert.match(hearth,/stance: 'Governing context'/);
  assert.match(hearth,/reviewed Teach VAL memory, and delivery receipts/);
});

test('source references normalize to the shared audit structure',()=>{
  const ref=normalizeSourceRef({sourceType:'transcript',sourceId:'tr_1',quoteOrSummary:' Something happened. ',confidence:2});
  assert.equal(ref.source_type,'transcript');
  assert.equal(ref.source_id,'tr_1');
  assert.equal(ref.quote_or_summary,'Something happened.');
  assert.equal(ref.confidence,1);
  assert.ok(ref.created_at);
});

test('in-memory intelligence pass records observers, round table, recommendation, momentum, and unknowns',async()=>{
  let store={
    memoryItems:[{id:'mem_1',kind:'teach_val_project',summary:'Frisson: protect human judgment',rawText:'Frisson is about wisdom, not productivity.'}],
    transcripts:[{id:'tr_1',title:'Frisson call',summary:'Aric is waiting on partner workflow.',createdAt:new Date().toISOString()}],
    drafts:[{id:'draft_1',subject:'Reply to Greg',body:'Draft for review',status:'draft'}],
    tasks:[]
  };
  const spine=createValIntelligenceSpine({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    uuid:prefix=>`${prefix}_${Math.random().toString(36).slice(2,9)}`,
    tenantId:()=>'test-tenant',
    userId:()=>'test-user',
    logger:{log(){},warn(){}},
    loaders:{
      loadTasks:async()=>[{id:'task_1',title:'Finish partner workflow',completed:false,dueDate:new Date(Date.now()-86400000).toISOString()}],
      listTeachValCoreMemory:async()=>[{id:'teach_1',title:'Frisson',summary:'Frisson protects human judgment.'}],
      listRelationshipProfiles:async()=>[
        {id:'rel_1',profileType:'person',displayName:'Aric',summary:'Strategic partner',confidence:0.88,openLoopCount:1},
        {id:'proj_1',profileType:'project',displayName:'Frisson',summary:'Operating philosophy',confidence:0.82}
      ]
    }
  });
  const result=await spine.runIntelligencePass({event:{type:'smoke_test',sourceType:'test'}});
  assert.equal(result.ok,true);
  assert.equal(result.observerRuns.length,13);
  const witnessing=result.observerRuns.find(run=>run.observerName==='Witnessing Steward');
  assert.ok(witnessing);
  assert.equal(witnessing.promptKey,'teach_val');
  assert.equal(witnessing.outputJson.enactment_audit.status,'watching');
  assert.equal(witnessing.outputJson.enactment_audit.protected_context_count,1);
  assert.ok(result.roundTable.id);
  assert.ok(result.recommendation.id);
  assert.ok(result.momentumSnapshot.id);
  assert.equal(result.readyForYouItems.length,1);
  assert.ok(result.contextPacket.unknowns.some(u=>/email/i.test(u.source)));
  assert.ok(store.eventIntelligenceRuns.length);
  assert.ok(store.observerRuns.length);
  assert.ok(store.roundTableRuns.length);
  assert.ok(store.chiefOfStaffRecommendations.length);
});
