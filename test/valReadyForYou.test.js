const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createValReadyForYouService}=require('../services/valReadyForYou');
const {createValExecutionReceiptService}=require('../services/valExecutionReceipts');
const {VAL_INTELLIGENCE_SPINE_SQL}=require('../services/valIntelligenceSpineSchema');

const root=path.join(__dirname,'..');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
const routes=fs.readFileSync(path.join(root,'services','valReadyForYouRoutes.js'),'utf8');

test('ready for you schema includes review queue fields',()=>{
  for(const field of ['category','summary','why_user_is_seeing_this','why_now','what_val_did','what_only_user_can_do','estimated_review_minutes','requires_approval','approval_policy','representation_risk','actions_json','decision_json','snoozed_until']){
    assert.match(VAL_INTELLIGENCE_SPINE_SQL,new RegExp(field));
  }
});

test('ready for you routes are backend-only and mounted',()=>{
  assert.match(server,/registerValReadyForYouRoutes/);
  assert.match(routes,/\/api\/val\/ready-for-you'/);
  assert.match(routes,/\/api\/val\/ready-for-you\/with-receipts/);
  assert.match(routes,/\/api\/val\/ready-for-you\/build/);
  assert.match(routes,/\/api\/val\/ready-for-you\/:id\/approve/);
  assert.match(routes,/\/api\/val\/ready-for-you\/:id\/reject/);
  assert.match(routes,/\/api\/val\/ready-for-you\/:id\/snooze/);
});

test('builds a judgment-only review queue and limits visible items to three',async()=>{
  let store={readyForYouItems:[]};
  const drafts=[
    {
      id:'draft_1',
      draftType:'executive_inbox_review_only',
      provider:'internal',
      subject:'Re: Partner workflow',
      body:'Hi Aric,\n\nYes, I can send the partner workflow over.',
      status:'ready_for_review',
      sourceContext:{
        source:'executive_inbox_review_only',
        conversationId:'uc_1',
        writerOutput:{why_this_draft_exists:'Aric asked for the workflow.',confidence:0.84,representation_risk:'medium',approval_policy:'approval_required'},
        draftReadiness:{status:'ready_for_review',approval_policy:'approval_required',representation_risk:'medium'},
        draftBrief:{single_purpose:'Answer Aric about the workflow.',why_now:'Aric is waiting.'},
        qa:{passes:true,confidence:0.82},
        noProviderDraftCreated:true
      },
      createdAt:'2026-07-03T12:00:00Z'
    },
    {
      id:'draft_2',
      draftType:'meeting_recap',
      provider:'internal',
      subject:'Recap: Doug keynote',
      body:'Draft recap from the meeting.',
      status:'draft',
      sourceContext:{source:'transcript_intelligence',meetingTitle:'Doug keynote'},
      createdAt:'2026-07-03T11:00:00Z'
    }
  ];
  const service=createValReadyForYouService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    uuid:prefix=>`${prefix}_test`,
    tenantId:()=>'tenant',
    userId:()=>'user',
    executiveInboxService:{
      reviewDrafts:async()=>({ok:true,drafts:drafts.filter(d=>d.sourceContext.source==='executive_inbox_review_only')}),
      listReadyForYouDraftCandidates:async()=>[
        {id:'eval_1',conversationId:'uc_2',status:'needs_context',draftReadiness:{status:'needs_context',missing_context:['pricing'],representation_risk:'high',approval_policy:'approval_required'},draftBrief:{single_purpose:'Pricing answer needs human input.',why_now:'Client is waiting.'},sourceRefs:[]},
        {id:'eval_2',conversationId:'uc_3',status:'ready_for_review',draftReadiness:{status:'ready_for_review',representation_risk:'low',approval_policy:'approval_required'},draftBrief:{single_purpose:'Confirm scheduling.',why_now:'Scheduling is open.'},sourceRefs:[]},
        {id:'eval_3',conversationId:'uc_4',status:'ready_for_review',draftReadiness:{status:'ready_for_review',representation_risk:'low',approval_policy:'approval_required'},draftBrief:{single_purpose:'Thank-you note.',why_now:'Relationship is warm.'},sourceRefs:[]}
      ]
    },
    listDrafts:async()=>drafts
  });
  const built=await service.buildQueue();
  assert.equal(built.ok,true);
  assert.equal(built.state,'has_items');
  assert.equal(built.items.length,3);
  assert.ok(built.allBuilt.length<=5);
  assert.ok(built.allBuilt.every(item=>item.requiresApproval));
  assert.ok(built.allBuilt.every(item=>item.metadataJson.noExternalAction||item.metadataJson.source));
  const listed=await service.listItems();
  assert.equal(listed.items.length,3);
  assert.notEqual(listed.message,"I'm caught up.");
});

test('approve, reject, and snooze update local state only',async()=>{
  let store={readyForYouItems:[]};
  const service=createValReadyForYouService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    tenantId:()=>'tenant',
    userId:()=>'user',
    executiveInboxService:{reviewDrafts:async()=>({drafts:[{id:'draft_approve',subject:'Ready',body:'Body',status:'ready_for_review',sourceContext:{source:'executive_inbox_review_only',writerOutput:{confidence:0.8}}}]}),listReadyForYouDraftCandidates:async()=>[]},
    listDrafts:async()=>[]
  });
  const built=await service.buildQueue();
  const id=built.allBuilt[0].id;
  const approved=await service.approve(id,{note:'looks good'});
  assert.equal(approved.status,'approved');
  assert.equal(approved.decisionJson.external_action,false);

  const rejected=await service.reject(id,{reason:'wrong voice'});
  assert.equal(rejected.status,'rejected');
  assert.equal(rejected.decisionJson.external_action,false);

  const rebuilt=await service.buildQueue();
  const snoozed=await service.snooze(rebuilt.allBuilt[0].id,{minutes:10,reason:'later'});
  assert.equal(snoozed.status,'snoozed');
  assert.ok(snoozed.snoozedUntil);
  assert.equal(snoozed.decisionJson.external_action,false);
});

test('empty queue returns caught-up state',async()=>{
  let store={readyForYouItems:[]};
  const service=createValReadyForYouService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    tenantId:()=>'tenant',
    userId:()=>'user',
    executiveInboxService:{reviewDrafts:async()=>({drafts:[]}),listReadyForYouDraftCandidates:async()=>[]},
    listDrafts:async()=>[]
  });
  const built=await service.buildQueue();
  assert.equal(built.state,'caught_up');
  assert.equal(built.message,"I'm caught up.");
  const listed=await service.listItems();
  assert.equal(listed.state,'caught_up');
  assert.equal(listed.message,"I'm caught up.");
});

test('ready for you with receipts exposes execution summary without raw provider payloads',async()=>{
  let store={
    readyForYouItems:[
      {
        id:'ready_receipt_1',
        tenantId:'tenant',
        userId:'user',
        status:'ready_for_review',
        category:'communication',
        title:'Draft ready',
        itemType:'email_review_only_draft',
        summary:'Draft was prepared.',
        whyUserIsSeeingThis:'Your judgment is needed.',
        whyNow:'The conversation is waiting.',
        decisionJson:{executionReceiptId:'receipt_packet_1',providerObjectUrl:'https://mail.google.com/draft/1?access_token=secret',lastExternalActionStatus:'succeeded'},
        metadataJson:{},
        sourceRefsJson:[],
        requiresApproval:true,
        confidence:0.8,
        createdAt:'2026-07-03T12:00:00Z'
      }
    ],
    valExecutionReceipts:[
      {
        id:'receipt_packet_1',
        tenantId:'tenant',
        userId:'user',
        packetId:'packet_1',
        status:'succeeded',
        providerResponseId:'draft_1',
        providerObjectUrl:'https://mail.google.com/draft/1?access_token=secret',
        providerResponseSummary:'Gmail draft created.',
        reconciliationStatus:'reconciled',
        reconciliationSummary:'Reconciled 1 VAL object link.',
        providerPayloadJson:{access_token:'secret'},
        createdAt:'2026-07-03T12:01:00Z'
      }
    ],
    valExecutionReconciliationEvents:[]
  };
  const service=createValReadyForYouService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    tenantId:()=>'tenant',
    userId:()=>'user'
  });
  const receiptService=createValExecutionReceiptService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    tenantId:()=>'tenant',
    userId:()=>'user'
  });
  const result=await service.listItemsWithReceipts({receiptService});
  assert.equal(result.ok,true);
  assert.equal(result.receiptAware,true);
  assert.equal(result.items[0].execution.has_receipt,true);
  assert.equal(result.items[0].execution.status,'succeeded');
  assert.equal(result.items[0].execution.provider_response_id,'draft_1');
  assert.equal(result.items[0].execution.provider_object_link,'');
  assert.equal(result.items[0].execution.reconciliation_status,'reconciled');
});

test('transcript prepared artifacts stay visible in Ready For You',async()=>{
  let store={readyForYouItems:[]};
  const service=createValReadyForYouService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    uuid:prefix=>`${prefix}_test`,
    tenantId:()=>'tenant',
    userId:()=>'user',
    executiveInboxService:{reviewDrafts:async()=>({drafts:[]}),listReadyForYouDraftCandidates:async()=>[]},
    meetingPrepService:{listReadyForYouCandidates:async()=>[]},
    transcriptIntelligenceService:{
      listReadyForYouCandidates:async()=>[{
        source:'transcript_intelligence',
        id:'intro_match_1',
        transcriptId:'tr_intro',
        status:'ready_for_review',
        title:'Possible introduction: Aric Soyring <> Greg Niesen',
        summary:'VAL noticed a useful introduction.',
        handoff:{
          id:'intro_match_1',
          category:'prepared_work',
          type:'relationship_introduction_candidate',
          title:'Possible introduction: Aric Soyring <> Greg Niesen',
          summary:'VAL noticed a useful introduction.',
          why_user_is_seeing_this:'VAL noticed a possible useful introduction.',
          why_now:'The relationship context is fresh.',
          what_val_did:'A reviewable introduction email candidate with both CRM/GHL contact IDs attached. Nothing was sent.',
          what_only_user_can_do:'Confirm whether this introduction is appropriate.',
          approval_policy:'approval_required',
          representation_risk:'high',
          prepared_artifact:{
            kind:'introduction_email_draft',
            source:'relationship_intro_matching',
            recipients:[{name:'Aric Soyring',contactId:'crm_aric'},{name:'Greg Niesen',contactId:'crm_greg'}],
            body:'Draft intro body.',
            execution_level:'level_2_autonomous_draft',
            completion_status:'complete_for_review',
            linked_context:{transcript:{id:'tr_intro'},project:{id:'frisson',name:'Frisson'},relationships:[{name:'Aric Soyring',contactId:'crm_aric'}],task:{id:'task_intro',title:'Continue intro'}},
            continuation_task:{id:'task_intro',title:'Continue intro',status:'ready_for_review'},
            externalSend:false,
            no_external_action:true
          },
          source_refs:[{source_type:'transcript',source_id:'tr_intro',quote_or_summary:'strategic partnership',confidence:0.8}],
          confidence:0.82
        },
        sourceRefs:[{source_type:'transcript',source_id:'tr_intro',quote_or_summary:'strategic partnership',confidence:0.8}],
        confidence:0.82,
        run:{id:'run_intro',transcriptId:'tr_intro',confidence:0.82,createdAt:'2026-07-04T10:00:00Z'}
      }]
    },
    listDrafts:async()=>[]
  });
  const built=await service.buildQueue();
  const item=built.allBuilt.find(row=>row.itemType==='relationship_introduction_candidate');
  assert.ok(item);
  assert.equal(item.category,'prepared_work');
  assert.equal(item.metadataJson.preparedArtifactKind,'introduction_email_draft');
  assert.equal(built.preparedCount,1);
  assert.equal(item.metadataJson.executionLevel,'level_2_autonomous_draft');
  assert.equal(item.metadataJson.taskContinuationCreated,true);
  assert.equal(item.metadataJson.projectName,'Frisson');
  assert.equal(item.metadataJson.continuationTask.id,'task_intro');
  assert.equal(item.metadataJson.preparedArtifact.recipients[0].contactId,'crm_aric');
  assert.equal(item.metadataJson.preparedArtifact.recipients[1].contactId,'crm_greg');
  assert.equal(item.metadataJson.noExternalSend,true);
  assert.ok(item.actionsJson.some(action=>action.key==='review_prepared_work'));
  assert.match(item.whatValPrepared,/Nothing was sent/);
});
