const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {
  createValEnvironmentsService,
  VAL_ENVIRONMENT_SHARE_FORMAT,
  normalizeEnvironmentSpec,
  importedEnvironmentSpec,
  validateEnvironmentSpec,
  titleRuleMatches,
  exactMeetingContent
}=require('../services/valEnvironments');
const {VAL_ENVIRONMENTS_SQL}=require('../services/valEnvironmentsSchema');

const root=path.join(__dirname,'..');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
const routes=fs.readFileSync(path.join(root,'services','valEnvironmentsRoutes.js'),'utf8');
const hearth=fs.readFileSync(path.join(root,'hearth-prototype.js'),'utf8');

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
  assert.match(routes,/\/api\/val\/environments\/:id\/export/);
  assert.match(routes,/\/api\/val\/environments\/import/);
});

test('shared Environments keep governance and remove private tenant context',async()=>{
  let sourceStore={};
  const sourceService=createValEnvironmentsService({
    hasPg:()=>false,
    getStore:()=>sourceStore,
    saveStore:value=>{sourceStore=value;},
    tenantId:()=>'source_tenant',
    userId:()=>'source_user',
    uuid:prefix=>`${prefix}_${Math.random().toString(36).slice(2,9)}`
  });
  const draft=await sourceService.saveDraft({spec:validSpec()});
  const exported=await sourceService.exportTemplate(draft.environment.id);
  assert.equal(exported.share.format,VAL_ENVIRONMENT_SHARE_FORMAT);
  assert.deepEqual(exported.share.template.spec.observerIds,['commitment','relationship','delight','synchronicity']);
  assert.equal(exported.share.template.spec.trigger.eventTitlePattern,'');
  assert.equal(exported.share.template.spec.trigger.eventTitleConfirmed,false);
  assert.equal(exported.share.template.spec.connections.emailProvider,'');
  assert.equal(exported.share.template.spec.connections.googleDocumentId,'');
  assert.equal(exported.share.template.spec.approvals.sendEmail,'required');
  assert.equal(exported.share.template.spec.approvals.appendGoogleDoc,'required');
  assert.equal(exported.share.template.safety.containsCredentials,false);
  assert.equal(exported.share.template.safety.containsEvidence,false);
  assert.doesNotMatch(JSON.stringify(exported.share),/doc_123|source_tenant|source_user/);
});

test('imported Environments are new disconnected Drafts that require recipient testing',async()=>{
  let sourceStore={};
  const sourceService=createValEnvironmentsService({
    hasPg:()=>false,
    getStore:()=>sourceStore,
    saveStore:value=>{sourceStore=value;},
    tenantId:()=>'source_tenant',
    userId:()=>'source_user',
    uuid:prefix=>`${prefix}_${Math.random().toString(36).slice(2,9)}`
  });
  const sourceDraft=await sourceService.saveDraft({spec:validSpec()});
  const exported=await sourceService.exportTemplate(sourceDraft.environment.id);
  let recipientStore={};
  const recipientService=createValEnvironmentsService({
    hasPg:()=>false,
    getStore:()=>recipientStore,
    saveStore:value=>{recipientStore=value;},
    tenantId:()=>'recipient_tenant',
    userId:()=>'recipient_user',
    uuid:prefix=>`${prefix}_${Math.random().toString(36).slice(2,9)}`
  });
  const imported=await recipientService.importTemplate(exported.share);
  assert.equal(imported.imported,true);
  assert.notEqual(imported.environment.id,sourceDraft.environment.id);
  assert.equal(imported.environment.status,'draft');
  assert.equal(imported.environment.activeVersion,null);
  assert.equal(imported.environment.draftVersion.state,'draft');
  assert.equal(imported.validation.ok,false);
  assert.ok(imported.validation.errors.some(error=>/recurring calendar event/i.test(error)));
  assert.ok(imported.validation.errors.some(error=>/sending account/i.test(error)));
  assert.ok(imported.validation.errors.some(error=>/Google Doc/i.test(error)));
  await assert.rejects(()=>recipientService.activate(imported.environment.id),/recurring calendar event|sending account|Google Doc/);
});

test('Environment imports reject unknown or malformed share files',()=>{
  assert.throws(()=>importedEnvironmentSpec({format:'other',formatVersion:1}),/not a supported/);
  assert.throws(()=>importedEnvironmentSpec({format:VAL_ENVIRONMENT_SHARE_FORMAT,formatVersion:1}),/usable template/);
});

test('Environment transcript intake includes canonical resolved participants as recipient evidence',()=>{
  assert.match(
    server,
    /calendarEvent\.attendees,\s*transcript\.attendees,\s*transcript\.participants,\s*transcript\.invitees/
  );
  assert.match(server,/eventTitle===normalizedTranscriptTitle/);
  assert.match(server,/transcriptCalendarEventCompatible\(transcript,linked\)/);
});

test('scheduled Observer model lane omits unsupported temperature before requesting',()=>{
  assert.match(server,/async function callOpenAIResponses\(\{[^}]*omitTemperature=false/);
  assert.match(server,/if\(!omitTemperature&&!reasoningEffort\)body\.temperature=temperature/);
  assert.match(server,/omitTemperature:true,[\s\S]{0,180}model:OPENAI_OBSERVER_MODEL/);
  assert.match(server,/const apiKey=String\(await resolveOpenAIKey\(\)\|\|''\)\.trim\(\)/);
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
  const activated=await service.activate(draft.environment.id);
  assert.equal(activated.environment.status,'active');
  assert.equal(activated.environment.draftVersion,null);
  assert.equal(activated.environment.activeVersion.state,'active');
});

test('historical test proof reads like executive support instead of backend receipts',()=>{
  assert.match(hearth,/This Environment understood the assignment\./);
  assert.match(hearth,/What VAL will do/);
  assert.match(hearth,/VAL will not invent meaning where the evidence does not support it\./);
  assert.match(hearth,/Google Doc destination confirmed/);
  assert.match(hearth,/A document retry will never resend the email\./);
  assert.doesNotMatch(hearth,/escapeHtml\(outputs\.googleDoc\?\.documentId\|\|'No document'\)/);
});

test('VAL Studio opens as an Environment library and preserves live detail state',()=>{
  assert.match(hearth,/function valStudioLibraryView\(\)/);
  assert.match(hearth,/data-val-studio-new>New Environment/);
  assert.match(hearth,/data-val-studio-open=/);
  assert.match(hearth,/Your first Environment starts with a repeated outcome\./);
  assert.match(hearth,/valStudioState\.mode='library'/);
  assert.match(hearth,/function valStudioResumeStage\(spec=\{\}\)/);
  assert.match(hearth,/environment\.draftVersion\?valStudioResumeStage\(valStudioState\.spec\):0/);
  assert.match(hearth,/function valStudioLiveView\(\)/);
  assert.match(hearth,/environment\.status==='active'&&environment\.activeVersion&&!environment\.draftVersion\?'live':'builder'/);
  assert.match(hearth,/VAL is listening for the next matching meeting\./);
  assert.match(hearth,/The current version remains active until you deliberately replace it with another tested version\./);
  assert.match(hearth,/Make Environment Live/);
  assert.match(hearth,/Live v.*remains active/);
});

test('VAL Studio can share and import sanitized Environment files',()=>{
  assert.match(hearth,/data-val-studio-import>Import Environment/);
  assert.match(hearth,/data-val-studio-import-file/);
  assert.match(hearth,/data-val-studio-share>Share Environment/);
  assert.match(hearth,/function shareValStudioEnvironment\(\)/);
  assert.match(hearth,/function importValStudioEnvironment\(file\)/);
  assert.match(hearth,/\.val-environment\.json/);
  assert.match(hearth,/Imported as a disconnected Draft/);
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
