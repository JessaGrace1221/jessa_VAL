const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {
  createValEnvironmentsService,
  normalizeEnvironmentSpec,
  validateEnvironmentSpec,
  titleRuleMatches,
  exactMeetingContent
}=require('../services/valEnvironments');
const {VAL_ENVIRONMENTS_SQL}=require('../services/valEnvironmentsSchema');

const root=path.join(__dirname,'..');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
const routes=fs.readFileSync(path.join(root,'services','valEnvironmentsRoutes.js'),'utf8');

function validSpec(){
  return normalizeEnvironmentSpec({
    name:'MGSH meeting follow-through',
    outcome:'Send the meeting overview and preserve it in the shared record.',
    purpose:'Close the loop immediately after each recurring MGSH meeting.',
    trigger:{type:'krisp_transcript_received',eventTitlePattern:'MGSH Weekly Meeting',eventTitleConfirmed:true},
    observerIds:['commitment','relationship','delight','synchronicity'],
    connections:{emailProvider:'gmail',googleDocumentId:'doc_123'},
    approvals:{sendEmail:'required',appendGoogleDoc:'required'}
  });
}

test('Environment schema and routes are mounted as native VAL infrastructure',()=>{
  for(const table of ['val_environments','val_environment_versions','val_environment_runs']){
    assert.match(VAL_ENVIRONMENTS_SQL,new RegExp(`create table if not exists ${table}`));
  }
  assert.match(server,/ensureValEnvironmentTables/);
  assert.match(server,/registerValEnvironmentsRoutes/);
  assert.match(routes,/\/api\/val\/environments\/:id\/test/);
  assert.match(routes,/\/api\/val\/environments\/:id\/activate/);
});

test('Environment transcript intake includes canonical resolved participants as recipient evidence',()=>{
  assert.match(
    server,
    /calendarEvent\.attendees,\s*transcript\.attendees,\s*transcript\.participants,\s*transcript\.invitees/
  );
});

test('Environment contract requires confirmed event, observers, sender, and document',()=>{
  assert.equal(validateEnvironmentSpec(validSpec()).ok,true);
  const invalid=normalizeEnvironmentSpec({name:'Incomplete'});
  const result=validateEnvironmentSpec(invalid);
  assert.equal(result.ok,false);
  assert.ok(result.errors.some(error=>/outcome/i.test(error)));
  assert.ok(result.errors.some(error=>/recurring calendar event/i.test(error)));
  assert.ok(result.errors.some(error=>/Observer/i.test(error)));
  assert.ok(result.errors.some(error=>/sending account/i.test(error)));
  assert.ok(result.errors.some(error=>/Google Doc/i.test(error)));
});

test('event title matching tolerates dates but stays tied to the confirmed event',()=>{
  assert.equal(titleRuleMatches('MGSH Weekly Meeting','MGSH Weekly Meeting - July 27, 2026'),true);
  assert.equal(titleRuleMatches('MGSH Weekly Meeting','Unrelated client call'),false);
});

test('historical testing proves exact outputs and never performs an external action',async()=>{
  let store={};
  const previewed=[];
  const service=createValEnvironmentsService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:value=>{store=value;},
    tenantId:()=>'tenant',
    userId:()=>'jessa',
    uuid:prefix=>`${prefix}_${Math.random().toString(36).slice(2,9)}`,
    loadTranscript:async()=>({
      id:'transcript_1',
      title:'MGSH Weekly Meeting - July 27, 2026',
      occurredAt:'2026-07-27T14:00:00.000Z',
      attendees:[
        {name:'Greg',email:'greg@example.com'},
        {name:'Ed',email:'ed@example.com'}
      ],
      actionItems:['Greg will send the revised brief.'],
      keyPoints:['The launch remains on schedule.'],
      exactBody:'Action Items\nGreg will send the revised brief.\n\nKey Points\nThe launch remains on schedule.',
      sourceUrl:'https://example.com/transcript'
    }),
    previewObserver:async({observer})=>{
      previewed.push(observer.observerId);
      return {
        type:'observer_receipt_v1',
        observerId:observer.observerId,
        observerName:observer.observerName,
        status:observer.observerId==='commitment'?'observed':'no_meaningful_signal',
        observation:observer.observerId==='commitment'
          ? 'I see a specific promise from Greg.'
          : 'No meaningful signal from my lens.',
        evidence:observer.observerId==='commitment'
          ? [{source_type:'transcript',source_id:'transcript_1',quote_or_summary:'Greg will send the revised brief.',confidence:1}]
          : [],
        confidence:0.9
      };
    }
  });
  const draft=await service.saveDraft({spec:validSpec()});
  const result=await service.runHistoricalTest(draft.environment.id,{transcriptId:'transcript_1'});
  assert.equal(result.ok,true);
  assert.equal(result.no_external_action,true);
  assert.equal(result.run.status,'completed');
  assert.deepEqual(previewed.sort(),['commitment','delight','relationship','synchronicity']);
});

test('activation is blocked until the exact draft version has a successful test',async()=>{
  let store={};
  const service=createValEnvironmentsService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:value=>{store=value;},
    tenantId:()=>'tenant',
    userId:()=>'jessa',
    uuid:prefix=>`${prefix}_${Math.random().toString(36).slice(2,9)}`
  });
  const draft=await service.saveDraft({spec:validSpec()});
  await assert.rejects(()=>service.activate(draft.environment.id),/Test this exact Environment version/);
});

test('exact Krisp body remains untouched when supplied',()=>{
  const body='Key Points\nExact point.\n\nAction Items\nExact action.';
  assert.equal(exactMeetingContent({exactBody:body}).body,body);
});

test('live transcript processing creates governed actions once and preserves approval boundaries',async()=>{
  let store={};
  const packets=[];
  const packetById=new Map();
  const externalActions={
    async createEmailSendPacket(payload){
      const packet={id:`packet_email_${packets.length}`,status:'draft',actionType:'send_email',payloadPreviewJson:payload};
      packets.push(packet);packetById.set(packet.id,packet);return packet;
    },
    async createGoogleDocAppendPacket(payload){
      const packet={id:`packet_doc_${packets.length}`,status:'draft',actionType:'append_google_doc',payloadPreviewJson:payload,sourceContextJson:payload.sourceContext};
      packets.push(packet);packetById.set(packet.id,packet);return packet;
    },
    async edit(id,changes){Object.assign(packetById.get(id),changes);return packetById.get(id);},
    async approve(id){Object.assign(packetById.get(id),{status:'approved_local_only'});return packetById.get(id);},
    executor:{async execute(id){Object.assign(packetById.get(id),{status:'executed'});return {ok:true,executed:true,packet:packetById.get(id)};}}
  };
  const transcript={
    id:'transcript_live',
    title:'MGSH Weekly Meeting - July 27, 2026',
    occurredAt:'2026-07-27T14:00:00.000Z',
    attendees:[
      {name:'Jessa',email:'jessa@example.com',isExecutive:true},
      {name:'Greg',email:'greg@example.com'},
      {name:'Ed',email:'ed@example.com'}
    ],
    actionItems:['Greg will send the revised brief.'],
    keyPoints:['The launch remains on schedule.'],
    exactBody:'Action Items\nGreg will send the revised brief.\n\nKey Points\nThe launch remains on schedule.'
  };
  const service=createValEnvironmentsService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:value=>{store=value;},
    tenantId:()=>'tenant',
    userId:()=>'jessa',
    uuid:prefix=>`${prefix}_${Math.random().toString(36).slice(2,9)}`,
    loadTranscript:async()=>transcript,
    externalActions
  });
  const draft=await service.saveDraft({spec:validSpec()});
  await service.runHistoricalTest(draft.environment.id,{transcriptId:transcript.id});
  await service.activate(draft.environment.id);
  const first=await service.processTranscript(transcript);
  assert.equal(first.matched,1);
  assert.equal(first.runs[0].run.status,'needs_approval');
  assert.equal(packets.length,2);
  assert.equal(packets[0].payloadPreviewJson.to,'greg@example.com, ed@example.com');
  assert.equal(packets[1].sourceContextJson.dependsOnPacketId,packets[0].id);
  assert.equal(packets.every(packet=>packet.status==='draft'),true);
  const second=await service.processTranscript(transcript);
  assert.equal(second.runs[0].deduplicated,true);
  assert.equal(packets.length,2);
});
