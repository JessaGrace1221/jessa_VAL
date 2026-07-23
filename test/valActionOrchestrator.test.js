const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {VAL_ACTION_ORCHESTRATOR_SQL}=require('../services/valActionOrchestratorSchema');
const {createValActionOrchestrator,ACTION_CAPABILITIES}=require('../services/valActionOrchestrator');

function harness({packetService=null,executor=null,researchExecution=null,onResearchComplete=null,onWorkProductPrepared=null}={}){
  let store={};
  let sequence=0;
  const service=createValActionOrchestrator({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:value=>{store=value;},
    tenantId:()=>'tenant',
    userId:()=>'user',
    uuid:prefix=>`${prefix}_${++sequence}`,
    externalActionService:packetService,
    externalActionExecutor:executor,
    researchExecution,
    onResearchComplete,
    onWorkProductPrepared,
    logger:{log(){},warn(){},error(){}}
  });
  return {service,get store(){return store;}};
}

test('action orchestrator schema keeps source, candidate, and lifecycle event ledgers',()=>{
  for(const table of ['val_action_sources','val_action_candidates','val_action_candidate_events']){
    assert.match(VAL_ACTION_ORCHESTRATOR_SQL,new RegExp(`create table if not exists ${table}`));
  }
  for(const field of ['source_channel','idempotency_key','prepared_artifact_json','external_action_packet_id','execution_receipt_id','provider_response_id']){
    assert.match(VAL_ACTION_ORCHESTRATOR_SQL,new RegExp(field));
  }
});

test('chat detects one durable action candidate and duplicate intake is idempotent',async()=>{
  const h=harness();
  const input={
    sourceChannel:'chat',sourceType:'general_chat',sourceId:'conversation_1',sourceEventId:'message_1',
    title:'Follow up with Greg',text:'Draft an email to Greg confirming the Friday setup.',
    sourceRefs:[{source_type:'conversation',source_id:'conversation_1',quote_or_summary:'Draft an email to Greg confirming the Friday setup.',confidence:0.9}]
  };
  const first=await h.service.ingest(input);
  const second=await h.service.ingest(input);
  assert.equal(first.candidates.length,1);
  assert.equal(first.candidates[0].actionType,'draft_email');
  assert.equal(second.candidates[0].id,first.candidates[0].id);
  assert.equal(h.store.valActionSources.length,1);
  assert.equal(h.store.valActionCandidates.length,1);
  assert.equal(h.store.valActionCandidateEvents.length,2);
  assert.equal(first.candidates[0].capabilityJson.availability,'live');
});

test('non-action context is retained without inventing work',async()=>{
  const h=harness();
  const result=await h.service.ingest({
    sourceChannel:'cowork',sourceType:'relationship_cowork',sourceId:'session_1',
    text:'Greg values directness and needs time to think before deciding.'
  });
  assert.equal(result.candidates.length,0);
  assert.equal(h.store.valActionSources.length,1);
  assert.equal(h.store.valActionCandidates.length,0);
});

test('separate chat instructions keep separate immutable source records without frontend message ids',async()=>{
  const h=harness();
  const shared={sourceChannel:'chat',sourceType:'general_chat',sourceId:'conversation_1'};
  const first=await h.service.ingest({...shared,text:'Create a CRM task to confirm Friday.'});
  const second=await h.service.ingest({...shared,text:'Draft an email to Greg about the agenda.'});
  assert.notEqual(first.source.id,second.source.id);
  assert.notEqual(first.source.sourceEventId,second.source.sourceEventId);
  assert.equal(h.store.valActionSources.length,2);
  assert.equal(h.store.valActionCandidates.length,2);
  assert.match(first.source.textExcerpt,/confirm Friday/);
  assert.match(second.source.textExcerpt,/email to Greg/);
});

test('transcript structured actions preserve explicit capability limits',async()=>{
  const h=harness();
  const result=await h.service.ingest({
    sourceChannel:'transcript',sourceType:'transcript_intelligence',sourceId:'transcript_1',
    text:'Jessa: Send Greg a text after the meeting and schedule the calendar event.',
    structuredActions:[
      {requested_action:'send_sms',instruction:'Send Greg a text after the meeting.',source_refs:[{source_type:'transcript',source_id:'transcript_1',quote_or_summary:'Send Greg a text after the meeting.',confidence:0.94}]},
      {requested_action:'schedule_calendar_event',instruction:'Schedule the calendar event with Greg.',source_refs:[{source_type:'transcript',source_id:'transcript_1',quote_or_summary:'schedule the calendar event',confidence:0.91}]}
    ]
  });
  const byType=Object.fromEntries(result.candidates.map(candidate=>[candidate.actionType,candidate]));
  assert.equal(byType.send_sms.capabilityJson.availability,'live');
  assert.equal(byType.send_sms.capabilityJson.executes,true);
  assert.equal(byType.send_calendar_invite.capabilityJson.availability,'live');
  assert.equal(byType.send_calendar_invite.capabilityJson.executes,true);
});

test('prepared work enters approval and execution records receipt and reconciliation',async()=>{
  const packetCalls=[];
  const packetService={
    async preparePacketFromPreparedArtifact(item){packetCalls.push(item);return {id:'packet_1'};},
    async approve(id,{note}){return {id,status:'approved_local_only',note};}
  };
  const executor={
    async execute(id){
      assert.equal(id,'packet_1');
      return {ok:true,packet:{id,providerResponseId:'gmail_draft_1',executedAt:'2026-07-21T12:00:00.000Z'},receipt:{id:'receipt_1'},reconciliation:{ok:true}};
    }
  };
  const h=harness({packetService,executor});
  const ingested=await h.service.ingest({
    sourceChannel:'voice',sourceType:'transcript_intelligence',sourceId:'voice_1',
    structuredActions:[{
      action_type:'draft_email',title:'Friday setup follow-up',instruction:'Draft the Friday setup follow-up for Greg.',
      prepared_artifact:{kind:'email_draft',subject:'Friday setup',body:'Greg, confirming Friday.'},
      source_refs:[{source_type:'voice',source_id:'voice_1',quote_or_summary:'Draft the Friday setup follow-up for Greg.',confidence:0.96}]
    }]
  });
  assert.equal(packetCalls.length,1);
  assert.equal(ingested.candidates[0].status,'awaiting_approval');
  assert.equal(ingested.candidates[0].externalActionPacketId,'packet_1');
  const approved=await h.service.approve(ingested.candidates[0].id,{note:'Looks right.'});
  assert.equal(approved.status,'approved');
  const executed=await h.service.execute(approved.id);
  assert.equal(executed.ok,true);
  assert.equal(executed.candidate.status,'reconciled');
  assert.equal(executed.candidate.executionReceiptId,'receipt_1');
  assert.equal(executed.candidate.providerResponseId,'gmail_draft_1');
  assert.deepEqual((await h.service.timeline(approved.id)).map(event=>event.status).slice(-5),['awaiting_approval','approved','executing','succeeded','receipt_recorded','reconciled'].slice(-5));
});

test('execution is blocked until approval and route-only work can never cross the provider boundary',async()=>{
  let executions=0;
  const packetService={
    async preparePacketFromPreparedArtifact(){return {id:'packet_1'};},
    async approve(id){return {id,status:'approved_local_only'};}
  };
  const executor={async execute(){executions+=1;return {ok:true,packet:{},receipt:{id:'receipt'}};}};
  const h=harness({packetService,executor});
  const email=await h.service.ingest({
    sourceChannel:'chat',sourceId:'chat_1',
    structuredActions:[{action_type:'draft_email',instruction:'Draft a note.',prepared_artifact:{kind:'email_draft',subject:'Hello',body:'Hello.'}}]
  });
  const beforeApproval=await h.service.execute(email.candidates[0].id);
  assert.equal(beforeApproval.ok,false);
  assert.match(beforeApproval.error,/explicitly approved/);
  assert.equal(executions,0);

  const research=await h.service.ingest({
    sourceChannel:'chat',sourceId:'chat_2',
    structuredActions:[{action_type:'research',instruction:'Research Greg.',prepared_artifact:{kind:'research_brief',query:'Greg'}}]
  });
  const approvedResearch=await h.service.approve(research.candidates[0].id);
  const blockedResearch=await h.service.execute(approvedResearch.id);
  assert.equal(blockedResearch.ok,false);
  assert.match(blockedResearch.error,/not connected to a verified execution adapter/);
  assert.equal(executions,0);
});

test('transcript, cowork, chat, and voice share one candidate contract',async()=>{
  const h=harness();
  for(const channel of ['transcript','cowork','chat','voice']){
    const result=await h.service.ingest({
      sourceChannel:channel,sourceType:`${channel}_source`,sourceId:`source_${channel}`,
      text:'Create a CRM task to confirm the project owner.'
    });
    assert.equal(result.candidates[0].actionType,'create_crm_task');
    assert.equal(result.candidates[0].sourceChannel,channel);
    assert.equal(result.candidates[0].status,'candidate_detected');
    assert.ok(result.candidates[0].idempotencyKey);
    assert.ok(result.candidates[0].sourceRefsJson.length);
  }
  assert.equal(h.store.valActionCandidates.length,4);
});

test('research becomes a source-linked handoff and preserves verified findings',async()=>{
  const h=harness();
  const result=await h.service.ingest({
    sourceChannel:'cowork',sourceType:'relationship_cowork',sourceId:'session_research',
    text:'Research Greg Zlevor before our next meeting.',
    context:{
      relationship:{name:'Greg Zlevor',email:'gzlevor@westwoodintl.com',linkedinUrl:'https://www.linkedin.com/in/gregzlevor/'},
      researchPacket:{
        researchQuestion:'What has changed publicly for Greg?',
        queries:['site:linkedin.com/posts "Greg Zlevor"'],
        sourceResults:[{title:'Greg Zlevor on leadership',url:'https://www.linkedin.com/posts/gregzlevor_example',snippet:'A post about leadership and emotional intelligence.',query:'site:linkedin.com/posts "Greg Zlevor"',retrievedAt:'2026-07-22T12:00:00.000Z',identityConfidence:0.96}],
        verifiedFindings:['Greg published a recent post about leadership and emotional intelligence.']
      }
    },
    sourceRefs:[{source_type:'cowork',source_id:'session_research',quote_or_summary:'Research Greg Zlevor before our next meeting.',confidence:0.94}]
  });
  const candidate=result.candidates[0];
  assert.equal(candidate.actionType,'research');
  assert.equal(candidate.status,'prepared');
  assert.equal(candidate.preparedArtifactJson.kind,'research_handoff');
  assert.equal(candidate.preparedArtifactJson.identity.known_linkedin_url,'https://www.linkedin.com/in/gregzlevor/');
  assert.equal(candidate.preparedArtifactJson.source_results[0].url,'https://www.linkedin.com/posts/gregzlevor_example');
  assert.match(candidate.preparedArtifactJson.verified_findings[0],/leadership and emotional intelligence/);
  assert.equal(candidate.preparedArtifactJson.downstream_action_requires_separate_approval,true);
  assert.equal(candidate.preparedArtifactJson.no_external_action,true);
});

test('research runner moves a handoff through research and carries verified sources forward',async()=>{
  const carried=[];
  const researchExecution={
    async execute({artifact}){
      return {
        ...artifact,
        completion_status:'complete_for_review',
        handoff_status:'findings_ready',
        source_results:[{title:'Greg Zlevor on leadership',url:'https://www.linkedin.com/posts/gregzlevor_leadership',snippet:'A post about leadership.',identity_confidence:0.99}],
        verified_findings:['Greg Zlevor on leadership: A post about leadership.'],
        source_refs:[{source_type:'outscraper_google_search_result',source_id:'https://www.linkedin.com/posts/gregzlevor_leadership',quote_or_summary:'A post about leadership.',confidence:0.99}],
        no_external_action:true
      };
    }
  };
  const h=harness({researchExecution,onResearchComplete:async payload=>carried.push(payload)});
  const ingested=await h.service.ingest({
    sourceChannel:'cowork',sourceType:'relationship_cowork',sourceId:'session_research_live',
    structuredActions:[{action_type:'research',instruction:'Research Greg.',context:{relationship:{name:'Greg Zlevor',linkedinUrl:'https://www.linkedin.com/in/gregzlevor/'},linkedContext:{relationshipId:'relationship_greg',projectId:'project_val'}}}]
  });
  assert.equal(ingested.candidates[0].status,'context_bound');
  const result=await h.service.executeResearch(ingested.candidates[0].id);
  assert.equal(result.ok,true);
  assert.equal(result.candidate.status,'prepared');
  assert.equal(result.candidate.preparedArtifactJson.source_results[0].url,'https://www.linkedin.com/posts/gregzlevor_leadership');
  assert.equal(carried.length,1);
  assert.equal(carried[0].artifact.linked_context.relationshipId,'relationship_greg');
  assert.deepEqual((await h.service.timeline(result.candidate.id)).map(event=>event.eventType).slice(-2),['research_started','research_completed']);
  assert.equal(result.no_external_action,true);
});

test('code preparation produces a GitHub engineering brief without GitHub execution',async()=>{
  const carried=[];
  const h=harness({onWorkProductPrepared:async payload=>carried.push(payload)});
  const result=await h.service.ingest({
    sourceChannel:'voice',sourceType:'project_cowork',sourceId:'session_code',
    text:'Build the transcript research handoff feature in the repository.',
    context:{
      project:{id:'project_val',name:'VAL'},
      repository:{fullName:'JessaGrace1221/jessa_VAL',url:'https://github.com/JessaGrace1221/jessa_VAL',baseBranch:'main'},
      files:['services/valActionOrchestrator.js'],
      acceptanceCriteria:['Research requests create a durable handoff.'],
      testPlan:['Run the action orchestrator tests.']
    }
  });
  const candidate=result.candidates[0];
  assert.equal(candidate.actionType,'prepare_code');
  assert.equal(candidate.preparedArtifactJson.kind,'engineering_brief');
  assert.equal(candidate.preparedArtifactJson.repository.name,'JessaGrace1221/jessa_VAL');
  assert.equal(candidate.preparedArtifactJson.completion_status,'ready_for_implementation_review');
  assert.equal(candidate.preparedArtifactJson.github_runtime_connection,'not_connected');
  assert.equal(candidate.preparedArtifactJson.no_git_write,true);
  assert.equal(candidate.capabilityJson.executes,false);
  assert.equal(carried.length,1);
  assert.equal(carried[0].candidate.id,candidate.id);
  assert.equal(carried[0].artifact.project.id,'project_val');
  assert.equal((await h.service.timeline(candidate.id)).some(event=>event.eventType==='work_product_carried_forward'),true);
  const approved=await h.service.approve(candidate.id);
  const blocked=await h.service.execute(approved.id);
  assert.equal(blocked.ok,false);
  assert.match(blocked.error,/not connected to a verified execution adapter/);
});

test('capability registry is honest about live, prepare-only, and route-only work',()=>{
  assert.equal(ACTION_CAPABILITIES.send_email.availability,'live');
  assert.equal(ACTION_CAPABILITIES.send_calendar_invite.availability,'live');
  assert.equal(ACTION_CAPABILITIES.send_calendar_invite.executes,true);
  assert.equal(ACTION_CAPABILITIES.send_sms.availability,'live');
  assert.equal(ACTION_CAPABILITIES.upsert_contact.availability,'live');
  assert.equal(ACTION_CAPABILITIES.update_contact_tags.availability,'live');
  assert.equal(ACTION_CAPABILITIES.update_opportunity.availability,'live');
  assert.equal(ACTION_CAPABILITIES.prepare_proposal.availability,'prepare_only');
  assert.equal(ACTION_CAPABILITIES.research.availability,'live_read_only');
});

test('server mounts the orchestrator behind every supported entry point',()=>{
  const server=fs.readFileSync(path.join(__dirname,'..','server.js'),'utf8');
  const routes=fs.readFileSync(path.join(__dirname,'..','services','valActionOrchestratorRoutes.js'),'utf8');
  assert.match(server,/registerValActionOrchestratorRoutes\(app/);
  assert.match(server,/actionOrchestrator:\(\)=>valActionOrchestrator/g);
  assert.match(server,/sourceChannel:\/\^presence_mode:/);
  assert.match(server,/sourceChannel:String\(req\.body\.channel\|\|'chat'\)/);
  assert.match(server,/actionOrchestration:transcriptIntelligence\?\.action_orchestration/);
  assert.match(server,/createValResearchExecution\(/);
  assert.match(server,/runSearch:\(queries,options\)=>lookupOutscraperGoogleSearch\(queries,options\)/);
  assert.match(routes,/\/api\/val\/action-orchestrator\/candidates\/:id\/research/);
});
