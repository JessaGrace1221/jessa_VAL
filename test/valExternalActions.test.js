const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {VAL_EXTERNAL_ACTIONS_SQL}=require('../services/valExternalActionsSchema');
const {createValExternalActionsService,riskFromText}=require('../services/valExternalActions');
const {createValExternalActionExecutor,freshRiskCheck}=require('../services/valExternalActionExecutor');
const {createValExecutionReceiptService}=require('../services/valExecutionReceipts');
const {buildExternalActionDetail,safeProviderObjectLink}=require('../services/valExecutionVisibility');

const root=path.join(__dirname,'..');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
const routes=fs.readFileSync(path.join(root,'services','valExternalActionsRoutes.js'),'utf8');

test('external actions schema creates packet and audit tables',()=>{
  for(const table of ['val_external_action_packets','val_external_action_audit','val_execution_receipts','val_execution_reconciliation_events']){
    assert.match(VAL_EXTERNAL_ACTIONS_SQL,new RegExp(`create table if not exists ${table}`));
  }
  for(const field of ['action_type','target_system','payload_preview_json','what_will_happen','what_will_not_happen','financial_or_legal_risk','relationship_risk','authorization_source','authorization_event_id','authorization_quote','authenticated_user_confirmed','speaker_confidence','authorization_created_at','attempted_at','executed_at','provider_response_id','provider_response_summary','failure_reason','retry_count','idempotency_key','executed_by','expires_at']){
    assert.match(VAL_EXTERNAL_ACTIONS_SQL,new RegExp(field));
  }
});

test('external action routes are backend-only and mounted',()=>{
  assert.match(server,/registerValExternalActionsRoutes/);
  assert.match(server,/ensureValExternalActionTables/);
  assert.match(routes,/\/api\/val\/external-actions/);
  assert.match(routes,/\/api\/val\/external-actions\/build/);
  assert.match(routes,/\/api\/val\/external-actions\/:id\/approve/);
  assert.match(routes,/\/api\/val\/external-actions\/:id\/reject/);
  assert.match(routes,/\/api\/val\/external-actions\/:id\/edit/);
  assert.match(routes,/\/api\/val\/external-actions\/:id\/fresh-risk-check/);
  assert.match(routes,/\/api\/val\/external-actions\/:id\/execute/);
  assert.match(routes,/\/api\/val\/execution-receipts/);
  assert.match(routes,/\/api\/val\/execution-receipts\/:id/);
  assert.match(routes,/\/api\/val\/external-actions\/:id\/retry/);
  assert.match(routes,/\/api\/val\/external-actions\/:id\/reconcile/);
  assert.match(routes,/\/api\/val\/external-actions\/:id\/detail/);
  assert.match(routes,/\/api\/val\/external-actions\/:id\/timeline/);
  assert.match(server,/async function executeEmailSendPacket/);
  assert.match(server,/send_email:executeEmailSendPacket/);
  assert.match(server,/https:\/\/www\.googleapis\.com\/gmail\/v1\/users\/me\/messages\/send/);
});

test('risk classifier keeps financial and representation actions high risk',()=>{
  const risk=riskFromText('Send proposal with pricing and contract language');
  assert.equal(risk.riskLevel,'high');
  assert.equal(risk.financialOrLegalRisk,'high');
  assert.equal(risk.representationRisk,'high');
});

test('builds one-action packets from approved local candidates and review-only drafts',async()=>{
  let store={
    valReviewUpdates:[
      {id:'upd_note',tenantId:'tenant',userId:'user',status:'approved',targetType:'crm_note_candidate',targetKey:'crm_aric',title:'CRM note for Aric',summary:'Aric is waiting on the workflow.',proposedValueJson:{note:'Aric is waiting on the workflow.'},sourceRefsJson:[{source_type:'transcript',source_id:'tr_1',quote_or_summary:'Aric is waiting',confidence:0.8}],createdAt:new Date().toISOString()},
      {id:'upd_prop',tenantId:'tenant',userId:'user',status:'approved',targetType:'teach_val_memory',targetKey:'proposal',title:'Proposal candidate',summary:'Send proposal with pricing.',proposedValueJson:{},sourceRefsJson:[{source_type:'email',source_id:'em_1',quote_or_summary:'send proposal',confidence:0.7}],createdAt:new Date().toISOString()}
    ],
    readyForYouItems:[
      {id:'ready_meeting',tenantId:'tenant',userId:'user',status:'approved',title:'Meeting prep',summary:'Prepare a calendar hold.',metadataJson:{source:'meeting_prep',calendarEventId:'cal_1'},sourceRefsJson:[{source_type:'calendar_event',source_id:'cal_1',quote_or_summary:'Meeting',confidence:0.7}],createdAt:new Date().toISOString()}
    ],
    crmNoteCandidates:[
      {id:'note_local',tenantId:'tenant',userId:'user',status:'approved_local_only',title:'Local note',summary:'Local CRM note body.',sourceRefs:[{source_type:'review_update',source_id:'upd_note',quote_or_summary:'note',confidence:0.7}]}
    ],
    crmTaskCandidates:[
      {id:'task_local',tenantId:'tenant',userId:'user',status:'approved_local_only',title:'Local task',summary:'Local CRM task why.',sourceRefs:[{source_type:'review_update',source_id:'upd_task',quote_or_summary:'task',confidence:0.7}]}
    ],
    meetingPrepBriefs:[],
    transcriptIntelligenceRuns:[
      {id:'trintel_1',tenantId:'tenant',userId:'user',transcriptId:'voice_1',readyForYouCandidatesJson:[],evidenceRefsJson:[],executiveInstructionsJson:[
        {instruction:'VAL, send email to Aric about the partner workflow.',instruction_type:'command',requested_action:'send_email',target_system:'email',target_person_or_record:'Aric',external_action:true,authorization:'voice_authorized',authenticated_user_spoke:true,speaker_confidence:0.92,ambiguity:[],conflicts:[],blocking_safety_rules:[],recommended_next_step:'execute_later_packet',source_refs:[{source_type:'voice',source_id:'voice_1',quote_or_summary:'VAL, send email to Aric about the partner workflow.',confidence:0.92}],confidence:0.9,authorization_source:'voice',authorization_event_id:'voice_1',authorization_quote:'VAL, send email to Aric about the partner workflow.',authenticated_user_confirmed:true,authorization_created_at:new Date().toISOString()}
      ]},
      {id:'trintel_prepared',tenantId:'tenant',userId:'user',transcriptId:'voice_prepared',readyForYouCandidatesJson:[
        {id:'prepared_proposal',category:'prepared_work',type:'proposal_draft',title:'Proposal draft for Acme',summary:'VAL prepared a proposal draft.',approval_policy:'approval_required',prepared_artifact:{kind:'proposal_draft',target:'Acme',externalSend:false},source_refs:[{source_type:'voice',source_id:'voice_prepared',quote_or_summary:'VAL, prepare the proposal for Acme.',confidence:0.9}]},
        {id:'prepared_page',category:'prepared_work',type:'html_page_draft',title:'HTML page draft',summary:'VAL prepared an HTML page.',approval_policy:'approval_required',prepared_artifact:{kind:'html_page_draft',target:'workshop',filename:'workshop.html',html:'<html></html>',externalPublish:false},source_refs:[{source_type:'voice',source_id:'voice_prepared',quote_or_summary:'VAL, build the HTML page.',confidence:0.9}]},
        {id:'prepared_invite',category:'prepared_work',type:'calendar_invite_draft',title:'Calendar invitation draft',summary:'VAL prepared a calendar invite.',approval_policy:'voice_authorized',prepared_artifact:{kind:'calendar_invite_draft',target:'Greg',externalCalendarWrite:false},source_refs:[{source_type:'voice',source_id:'voice_prepared',quote_or_summary:'VAL, set that appointment with Greg.',confidence:0.9}]},
        {id:'prepared_intro',category:'prepared_work',type:'introduction_email_draft',title:'Introduction draft',summary:'VAL prepared an intro email.',approval_policy:'voice_authorized',prepared_artifact:{kind:'introduction_email_draft',target:'Greg and Lindsey',recipients:[{contactId:'crm_greg'},{contactId:'crm_lindsey'}],externalSend:false},source_refs:[{source_type:'voice',source_id:'voice_prepared',quote_or_summary:'VAL, make that introduction.',confidence:0.9}]}
      ],evidenceRefsJson:[],executiveInstructionsJson:[]}
    ]
  };
  const drafts=[
    {id:'draft_1',tenantId:'tenant',userId:'user',provider:'internal',subject:'Re: Partner workflow',body:'Hi Aric, here is the workflow.',status:'ready_for_review',sourceContext:{source:'executive_inbox_review_only',conversationId:'uc_1',threadId:'thread_1'}}
  ];
  const service=createValExternalActionsService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    listDrafts:async()=>drafts,
    tenantId:()=>'tenant',
    userId:()=>'user',
    uuid:prefix=>`${prefix}_test_${Math.random().toString(36).slice(2,6)}`
  });
  const built=await service.build();
  assert.equal(built.ok,true);
  assert.equal(built.no_external_action,true);
  assert.equal(built.execution_available,false);
  const types=built.packets.map(p=>p.actionType);
  for(const type of ['create_crm_note','create_crm_task','create_gmail_draft','create_outlook_draft','send_email','create_calendar_hold','send_proposal','publish_content','send_calendar_invite']){
    assert.ok(types.includes(type),`missing ${type}`);
  }
  assert.ok(built.packets.every(p=>p.whatWillNotHappen.includes('No email')));
  assert.ok(built.packets.every(p=>p.sourceRefsJson.length));
  assert.ok(built.packets.find(p=>p.actionType==='send_proposal').approvalPolicy==='approval_required');
  const voiceAuthorized=built.packets.find(p=>p.sourceContextJson?.source==='executive_instruction'&&p.actionType==='send_email');
  assert.equal(voiceAuthorized.approvalPolicy,'voice_authorized');
  assert.equal(voiceAuthorized.authorizationSource,'voice');
  assert.equal(voiceAuthorized.authorizationEventId,'voice_1');
  assert.equal(voiceAuthorized.authenticatedUserConfirmed,true);
  assert.equal(voiceAuthorized.speakerConfidence,0.92);
  assert.ok(built.packets.find(p=>p.sourceContextJson?.source==='transcript_prepared_work'&&p.actionType==='send_proposal').payloadPreviewJson.proposalDraft);
  assert.ok(built.packets.find(p=>p.sourceContextJson?.source==='transcript_prepared_work'&&p.actionType==='publish_content').payloadPreviewJson.externalPublish===false);
  assert.ok(built.packets.find(p=>p.sourceContextJson?.source==='transcript_prepared_work'&&p.actionType==='send_calendar_invite').payloadPreviewJson.externalCalendarWrite===false);
  assert.ok(built.packets.find(p=>p.sourceContextJson?.source==='transcript_prepared_work'&&p.actionType==='create_gmail_draft').payloadPreviewJson.recipients.length===2);
});

test('approving a packet only updates local packet state and audit',async()=>{
  let store={
    valExternalActionPackets:[
      {id:'packet_1',tenantId:'tenant',userId:'user',status:'draft',actionType:'create_crm_note',targetSystem:'GHL/CRM',targetId:'crm_1',payloadPreviewJson:{note:'Note'},sourceRefsJson:[{source_type:'review_update',source_id:'upd_1',quote_or_summary:'Note',confidence:0.7}],whyThisActionExists:'Because approved locally.',whatWillHappen:'Future review only.',whatWillNotHappen:'No external action.',riskLevel:'medium',approvalPolicy:'approval_required',representationRisk:'medium',financialOrLegalRisk:'low',relationshipRisk:'medium',expiresAt:new Date(Date.now()+86400000).toISOString(),sourceContextJson:{},createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}
    ]
  };
  const service=createValExternalActionsService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    tenantId:()=>'tenant',
    userId:()=>'user',
    uuid:prefix=>`${prefix}_test`
  });
  const approved=await service.approve('packet_1',{note:'approved for later'});
  assert.equal(approved.status,'approved_local_only');
  assert.equal(store.valExternalActionAudit.length,1);
  assert.equal(store.valExternalActionAudit[0].externalActionTaken,false);
});

test('prepared artifact review creates exact packet before local approval',async()=>{
  let store={valExternalActionPackets:[],valExternalActionAudit:[]};
  const service=createValExternalActionsService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    tenantId:()=>'tenant',
    userId:()=>'user',
    uuid:prefix=>`${prefix}_test`
  });
  const packet=await service.preparePacketFromPreparedArtifact({
    id:'ready_intro',
    title:'Introduction draft',
    summary:'VAL prepared an intro email.',
    preparedArtifactKind:'introduction_email_draft',
    preparedArtifact:{
      kind:'introduction_email_draft',
      title:'Intro: Greg and Lindsey',
      recipients:[{contactId:'crm_greg'},{contactId:'crm_lindsey'}]
    },
    sourceRefs:[{source_type:'transcript',source_id:'tr_intro',quote_or_summary:'VAL, make that introduction.',confidence:0.9}]
  });
  assert.equal(packet.actionType,'create_gmail_draft');
  assert.equal(packet.sourceContextJson.source,'transcript_prepared_work');
  assert.equal(packet.sourceContextJson.kind,'introduction_email_draft');
  assert.equal(packet.payloadPreviewJson.externalSend,false);
  assert.equal(packet.payloadPreviewJson.recipients.length,2);
  const approved=await service.approve(packet.id,{note:'local approval only'});
  assert.equal(approved.status,'approved_local_only');
  assert.equal(store.valExternalActionAudit[0].externalActionTaken,false);
});

test('edit and reject keep execution unavailable',async()=>{
  let store={
    valExternalActionPackets:[
      {id:'packet_2',tenantId:'tenant',userId:'user',status:'draft',actionType:'send_email',targetSystem:'email',targetId:'thread',payloadPreviewJson:{subject:'Old'},sourceRefsJson:[{source_type:'draft',source_id:'draft_1',quote_or_summary:'Old',confidence:0.7}],whyThisActionExists:'Old',whatWillHappen:'Future review only.',whatWillNotHappen:'No external action.',riskLevel:'high',approvalPolicy:'approval_required',representationRisk:'high',financialOrLegalRisk:'low',relationshipRisk:'medium',expiresAt:new Date(Date.now()+86400000).toISOString(),sourceContextJson:{},createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}
    ]
  };
  const service=createValExternalActionsService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    tenantId:()=>'tenant',
    userId:()=>'user',
    uuid:prefix=>`${prefix}_test`
  });
  const edited=await service.edit('packet_2',{payloadPreviewJson:{subject:'New'},note:'tightened'});
  assert.equal(edited.payloadPreviewJson.subject,'New');
  const rejected=await service.reject('packet_2',{reason:'not now'});
  assert.equal(rejected.status,'rejected');
  assert.ok(store.valExternalActionAudit.every(a=>a.externalActionTaken===false));
});

test('fresh risk check blocks expired, unsupported, ambiguous, and never-auto packets',()=>{
  const base={id:'packet_risk',status:'approved_local_only',actionType:'create_gmail_draft',targetSystem:'gmail',targetId:'thread_1',payloadPreviewJson:{subject:'Hi',body:'Body'},approvalPolicy:'approval_required',riskLevel:'low',financialOrLegalRisk:'low',representationRisk:'medium',sourceContextJson:{},expiresAt:new Date(Date.now()+86400000).toISOString()};
  assert.equal(freshRiskCheck(base).ok,true);
  assert.ok(freshRiskCheck({...base,expiresAt:new Date(Date.now()-1000).toISOString()}).errors.includes('expired_packet'));
  const sendPacket={...base,actionType:'send_email',payloadPreviewJson:{subject:'Hi',body:'Body',to:'aric@example.com'}};
  assert.ok(freshRiskCheck(sendPacket).errors.includes('final_send_confirmation_required'));
  assert.equal(freshRiskCheck(sendPacket,{finalConfirmation:true}).ok,true);
  assert.ok(freshRiskCheck({...base,approvalPolicy:'never_auto'}).errors.includes('blocked_action'));
  assert.ok(freshRiskCheck({...base,sourceContextJson:{authorization:{ambiguity:['target_identity_unresolved']}}}).errors.includes('ambiguous_packet'));
});

test('executor runs one supported adapter once, creates receipt, and reconciles source objects',async()=>{
  let store={valExternalActionPackets:[
    {id:'exec_1',tenantId:'tenant',userId:'user',status:'approved_local_only',actionType:'create_gmail_draft',targetSystem:'gmail',targetId:'thread_1',payloadPreviewJson:{subject:'Re: Workflow',body:'Hi Aric'},sourceRefsJson:[{source_type:'draft',source_id:'d1',quote_or_summary:'Draft',confidence:0.8}],whyThisActionExists:'Create Gmail draft for review.',whatWillHappen:'Create provider draft.',whatWillNotHappen:'Nothing will be sent.',riskLevel:'low',approvalPolicy:'approval_required',representationRisk:'medium',financialOrLegalRisk:'low',relationshipRisk:'low',expiresAt:new Date(Date.now()+86400000).toISOString(),sourceContextJson:{draftId:'draft_1'},createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}
  ],valExternalActionAudit:[],valExecutionReceipts:[],valExecutionReconciliationEvents:[],drafts:[{id:'draft_1',tenantId:'tenant',userId:'user',status:'ready_for_review',subject:'Re: Workflow',sourceContext:{}}]};
  const packetService=createValExternalActionsService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    tenantId:()=>'tenant',
    userId:()=>'user',
    uuid:prefix=>`${prefix}_test`
  });
  const receiptService=createValExecutionReceiptService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    tenantId:()=>'tenant',
    userId:()=>'user',
    uuid:prefix=>`${prefix}_test`
  });
  let adapterCalls=0;
  const executor=createValExternalActionExecutor({
    packetService,
    receiptService,
    executedBy:()=>'user',
    adapters:{create_gmail_draft:async({packet,idempotencyKey})=>{adapterCalls++;return {providerResponseId:'gmail_draft_1',providerObjectUrl:'https://mail.google.com/draft/gmail_draft_1',providerResponseSummary:`Created ${packet.id} with ${idempotencyKey}`};}}
  });
  const result=await executor.execute('exec_1');
  assert.equal(result.ok,true);
  assert.equal(result.executed,true);
  assert.equal(adapterCalls,1);
  assert.equal(result.packet.status,'executed');
  assert.equal(result.packet.providerResponseId,'gmail_draft_1');
  assert.ok(result.packet.idempotencyKey.includes('exec_1'));
  assert.equal(result.receipt.status,'succeeded');
  assert.equal(result.receipt.providerResponseSummary,'Gmail draft created.');
  assert.equal(result.receipt.retryAllowed,false);
  assert.equal(result.reconciliation.receipt.reconciliationStatus,'reconciled');
  assert.equal(store.drafts[0].status,'executed');
  assert.equal(store.drafts[0].executionReceiptId,'receipt_exec_1');
  assert.equal(store.valExecutionReconciliationEvents.some(e=>e.targetTable==='drafts'),true);
  assert.equal(store.valExternalActionAudit.some(a=>a.action==='executed'&&a.externalActionTaken===true),true);
  const duplicate=await executor.execute('exec_1');
  assert.equal(duplicate.ok,false);
  assert.ok(duplicate.risk_check.errors.includes('already_executed'));
  assert.equal(adapterCalls,1);
});

test('global email send gate creates one approved packet and requires final confirmation',async()=>{
  let store={valExternalActionPackets:[],valExternalActionAudit:[],valExecutionReceipts:[],valExecutionReconciliationEvents:[]};
  const packetService=createValExternalActionsService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    tenantId:()=>'tenant',
    userId:()=>'user',
    uuid:prefix=>`${prefix}_send_gate`
  });
  const receiptService=createValExecutionReceiptService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    tenantId:()=>'tenant',
    userId:()=>'user',
    uuid:prefix=>`${prefix}_send_gate`
  });
  const packet=await packetService.createEmailSendPacket({to:'aric@example.com',subject:'Partner workflow',body:'Here is the workflow.',provider:'gmail',sourceContext:{source:'test_send_gate'}});
  assert.equal(packet.actionType,'send_email');
  assert.equal(packet.payloadPreviewJson.to,'aric@example.com');
  assert.equal(packet.status,'draft');
  const approved=await packetService.approve(packet.id,{note:'Approved from send gate.'});
  assert.equal(approved.status,'approved_local_only');
  let adapterCalls=0;
  const executor=createValExternalActionExecutor({
    packetService,
    receiptService,
    executedBy:()=>'user',
    adapters:{send_email:async({payload})=>{adapterCalls++;return {providerResponseId:'gmail_msg_1',providerResponseSummary:`Sent to ${payload.to}`};}}
  });
  const blocked=await executor.execute(packet.id);
  assert.equal(blocked.ok,false);
  assert.ok(blocked.risk_check.errors.includes('final_send_confirmation_required'));
  assert.equal(adapterCalls,0);
  await packetService.updatePacket(packet.id,{status:'approved_local_only',failureReason:''});
  const sent=await executor.execute(packet.id,{finalConfirmation:true});
  assert.equal(sent.ok,true);
  assert.equal(sent.executed,true);
  assert.equal(sent.packet.status,'executed');
  assert.equal(sent.packet.providerResponseId,'gmail_msg_1');
  assert.equal(adapterCalls,1);
  assert.equal(store.valExecutionReceipts[0].status,'succeeded');
});

test('executor safely fails with receipt, then retries with same idempotency key',async()=>{
  let store={valExternalActionPackets:[
    {id:'exec_missing_adapter',tenantId:'tenant',userId:'user',status:'approved_local_only',actionType:'create_crm_note',targetSystem:'GHL/CRM',targetId:'crm_1',payloadPreviewJson:{note:'Note'},sourceRefsJson:[{source_type:'review_update',source_id:'u1',quote_or_summary:'Note',confidence:0.7}],whyThisActionExists:'Create CRM note.',whatWillHappen:'Create note.',whatWillNotHappen:'No other action.',riskLevel:'low',approvalPolicy:'approval_required',representationRisk:'medium',financialOrLegalRisk:'low',relationshipRisk:'low',expiresAt:new Date(Date.now()+86400000).toISOString(),sourceContextJson:{},createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}
  ],valExternalActionAudit:[],valExecutionReceipts:[],valExecutionReconciliationEvents:[]};
  const packetService=createValExternalActionsService({hasPg:()=>false,getStore:()=>store,saveStore:s=>{store=s;},tenantId:()=>'tenant',userId:()=>'user',uuid:prefix=>`${prefix}_test`});
  const receiptService=createValExecutionReceiptService({hasPg:()=>false,getStore:()=>store,saveStore:s=>{store=s;},tenantId:()=>'tenant',userId:()=>'user',uuid:prefix=>`${prefix}_test`});
  const executor=createValExternalActionExecutor({packetService,receiptService,adapters:{}});
  const result=await executor.execute('exec_missing_adapter');
  assert.equal(result.ok,false);
  assert.equal(result.packet.status,'execution_failed');
  assert.match(result.packet.failureReason,/adapter unavailable/i);
  assert.equal(result.receipt.status,'failed');
  assert.equal(result.receipt.retryAllowed,true);
  const key=result.packet.idempotencyKey;
  assert.equal(store.valExternalActionAudit.some(a=>a.action==='execution_failed'&&a.externalActionTaken===false),true);
  const retryExecutor=createValExternalActionExecutor({
    packetService,
    receiptService,
    adapters:{create_crm_note:async()=>({providerResponseId:'crm_note_1',providerResponseSummary:'Created CRM note'})}
  });
  const retry=await retryExecutor.retry('exec_missing_adapter');
  assert.equal(retry.ok,true);
  assert.equal(retry.packet.status,'executed');
  assert.equal(retry.packet.idempotencyKey,key);
  assert.equal(retry.receipt.status,'succeeded');
});

test('execution visibility bridge sanitizes receipts and builds planned to reconciled timeline',()=>{
  const packet={
    id:'exec_visible',
    tenantId:'tenant',
    userId:'user',
    status:'executed',
    actionType:'create_gmail_draft',
    approvalPolicy:'approval_required',
    reviewedAt:'2026-07-03T12:00:00Z',
    createdAt:'2026-07-03T11:00:00Z',
    sourceRefsJson:[{source_type:'draft',source_id:'draft_1',quote_or_summary:'Draft',confidence:0.8}]
  };
  const receipt={
    id:'receipt_exec_visible',
    packetId:'exec_visible',
    actionType:'create_gmail_draft',
    targetSystem:'gmail',
    providerResponseId:'draft_1',
    providerObjectUrl:'https://mail.google.com/draft/draft_1?access_token=secret',
    providerResponseSummary:'Gmail draft created.',
    executedAt:'2026-07-03T12:01:00Z',
    status:'succeeded',
    retryAllowed:false,
    reconciliationStatus:'reconciled',
    reconciliationSummary:'Reconciled 2 VAL object links.',
    providerPayloadJson:{access_token:'secret'}
  };
  const detail=buildExternalActionDetail({
    packet,
    receipt,
    events:[{id:'recon_1',receiptId:'receipt_exec_visible',status:'linked',targetTable:'drafts',createdAt:'2026-07-03T12:02:00Z'}],
    audit:[{id:'audit_1',packetId:'exec_visible',action:'executed',executedAt:'2026-07-03T12:01:00Z'}]
  });
  assert.equal(detail.ok,true);
  assert.equal(detail.execution_receipt.providerPayloadJson,undefined);
  assert.equal(detail.provider_object_link,'');
  assert.equal(safeProviderObjectLink('https://mail.google.com/draft/draft_1'),'https://mail.google.com/draft/draft_1');
  assert.deepEqual(detail.timeline.map(stage=>stage.stage),['planned','approved','executed','reconciled']);
  assert.equal(detail.timeline.find(stage=>stage.stage==='executed').status,'completed');
  assert.equal(detail.timeline.find(stage=>stage.stage==='reconciled').status,'completed');
  assert.equal(detail.retry_eligibility.retry_allowed,false);
  assert.match(detail.retry_eligibility.why_retry_is_blocked,/duplicate/i);
});
