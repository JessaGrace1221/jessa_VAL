const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const {VAL_PROJECT_PINS_SQL}=require('../services/valProjectPinsSchema');
const {createValProjectPinsService,projectPinAlignmentItem}=require('../services/valProjectPins');

const root=path.join(__dirname,'..');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
const routes=fs.readFileSync(path.join(root,'services','valProjectPinsRoutes.js'),'utf8');

function serviceFor(store){
  return createValProjectPinsService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    tenantId:()=>'tenant',
    userId:()=>'user',
    uuid:prefix=>`${prefix}_test`
  });
}

test('project pin schema and routes are mounted',()=>{
  assert.match(VAL_PROJECT_PINS_SQL,/create table if not exists project_pins/);
  for(const field of ['project_id','pin_until','source_refs_json','metadata_json','completed_at']){
    assert.match(VAL_PROJECT_PINS_SQL,new RegExp(field));
  }
  assert.match(server,/ensureValProjectPinsTables/);
  assert.match(server,/registerValProjectPinsRoutes/);
  assert.match(routes,/\/api\/val\/project-pins/);
  assert.match(routes,/\/api\/val\/project-pins\/alignment/);
  assert.match(routes,/\/api\/val\/project-pins\/:id\/complete/);
});

test('future project pins persist quietly without becoming alignment items',async()=>{
  const store={projectPins:[]};
  const pins=serviceFor(store);
  const result=await pins.createPin({
    projectId:'project_frisson',
    projectName:'Frisson',
    title:'Review partner scope',
    pinUntil:new Date(Date.now()+86400000).toISOString(),
    sourceRefs:[{sourceType:'project_manager_page',sourceId:'project_frisson',quoteOrSummary:'Scope review can wait until tomorrow.'}]
  });
  assert.equal(result.ok,true);
  assert.equal(result.pin.status,'pinned');
  assert.equal(store.projectPins.length,1);
  const alignment=await pins.listAlignmentPins({limit:5});
  assert.equal(alignment.alignmentItems.length,0);
});

test('due project pins become newly reopened Alignment open loops',async()=>{
  const store={projectPins:[]};
  const pins=serviceFor(store);
  const result=await pins.createPin({
    projectId:'project_westwood',
    projectName:'Westwood Launch',
    title:'Decide launch owner',
    summary:'Choose who owns the next launch move.',
    pinUntil:new Date(Date.now()-60000).toISOString(),
    sourceRefs:[{sourceType:'project_manager_page',sourceId:'project_westwood',quoteOrSummary:'Owner decision was pinned until now.',confidence:0.9}]
  });
  const alignment=await pins.listAlignmentPins({limit:5});
  assert.equal(alignment.alignmentItems.length,1);
  assert.ok(alignment.pins[0].reopenedAt);
  assert.ok(store.projectPins[0].reopenedAt);
  const item=alignment.alignmentItems[0];
  assert.equal(item.projectName,'Westwood Launch');
  assert.equal(item.metadataJson.reopenedLoop,true);
  assert.equal(item.metadataJson.homeAdmission.whyNowPacketComplete,true);
  assert.match(item.title,/This is unpinned/);
  assert.match(item.whyNow,/newly reopened/);
  assert.equal(item.sourceRefsJson[0].source_type,'project_manager_page');

  const direct=projectPinAlignmentItem(result.pin);
  assert.equal(direct.target.type,'project');
  assert.equal(direct.decisionNeeded,'Decide whether to work on it now, pin it again, or close the loop.');
});

test('completed project pins leave Alignment',async()=>{
  const store={projectPins:[]};
  const pins=serviceFor(store);
  const result=await pins.createPin({
    projectId:'project_scope',
    projectName:'Scope Cleanup',
    title:'Revisit scope question',
    pinUntil:new Date(Date.now()-60000).toISOString()
  });
  assert.equal((await pins.listAlignmentPins({limit:5})).alignmentItems.length,1);
  const completed=await pins.completePin(result.pin.id,{reason:'handled'});
  assert.equal(completed.status,'completed');
  assert.equal((await pins.listAlignmentPins({limit:5})).alignmentItems.length,0);
});
