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
  assert.match(routes,/\/api\/val\/ready-for-you\/:id\/draft/);
  assert.match(routes,/function parseLimit\(value,defaultValue=3,max=25\)/);
  assert.match(routes,/service\.listItems\(\{limit:parseLimit\(req\.query\.limit,20,25\)/);
  assert.match(routes,/materializeLimit:Math\.max\(0,Math\.min\(Number\(req\.body\?\.materializeLimit\?\?2\)/);
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
        writingRules:'Warm but direct. Sign off with Jessa.',
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
  const draftItem=built.allBuilt.find(item=>item.metadataJson.draftId==='draft_1');
  assert.equal(draftItem.metadataJson.writingRules,'Warm but direct. Sign off with Jessa.');
  const listed=await service.listItems();
  assert.equal(listed.items.length,3);
  assert.equal(listed.message,"I'm caught up.");
  assert.deepEqual(listed.preparedItems,[]);
  assert.equal(listed.preparedCount,0);
});

test('buildQueue keeps prepared work beyond the old five item cap',async()=>{
  let store={readyForYouItems:[]};
  const drafts=Array.from({length:8},(_,index)=>({
    id:'draft_cap_' + index,
    draftType:'proposal_draft',
    provider:'internal',
    subject:'Prepared proposal ' + (index + 1),
    body:'This is a reviewable prepared proposal artifact body ' + (index + 1) + '.',
    status:'ready_for_review',
    sourceContext:{
      source:'proposal',
      preparedArtifactKind:'proposal_draft',
      recipientEmail:`client${index+1}@example.com`,
      recipientId:`crm_client_${index+1}`,
      preparedArtifact:{kind:'proposal_draft',body:'Reviewable prepared proposal artifact ' + (index + 1) + '.',target:`client${index+1}@example.com`,recipients:[{name:`Client ${index+1}`,email:`client${index+1}@example.com`,contactId:`crm_client_${index+1}`}]},
      canValAct:'approval_required',
      executionPath:'review_then_send'
    },
    createdAt:'2026-07-03T12:0' + index + ':00Z'
  }));
  const service=createValReadyForYouService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    uuid:prefix=>`${prefix}_cap`,
    tenantId:()=>'tenant',
    userId:()=>'user',
    executiveInboxService:{
      reviewDrafts:async()=>({ok:true,drafts:[]}),
      listReadyForYouDraftCandidates:async()=>[]
    },
    meetingPrepService:{listReadyForYouCandidates:async()=>[]},
    transcriptIntelligenceService:{listReadyForYouCandidates:async()=>[]},
    commitmentsService:{list:async()=>({ok:true,commitments:[]})},
    listDrafts:async()=>drafts
  });
  const built=await service.buildQueue({limit:20});
  assert.equal(built.allBuilt.length,8);
  assert.equal(built.preparedCount,8);
  assert.equal(built.items.length,3);
  assert.ok(built.preparedItems.every(item=>item.metadataJson.source==='proposal'));
  const listed=await service.listItems({limit:20});
  assert.equal(listed.items.length,8);
  assert.equal(listed.visibleLimit,20);
});

test('prepared projection is not starved by older non-prepared judgment rows',async()=>{
  const noisyRows=Array.from({length:30},(_,index)=>({
    id:`noise_${index}`,
    tenantId:'tenant',
    userId:'user',
    category:'communication',
    type:'email_draft_readiness',
    itemType:'email_draft_readiness',
    title:`Needs context ${index}`,
    status:'needs_context',
    summary:'A judgment record, not prepared work.',
    confidence:0.99,
    requiresApproval:true,
    sourceRefsJson:[],
    metadataJson:{source:'legacy_readiness'},
    createdAt:`2026-07-27T12:${String(index).padStart(2,'0')}:00Z`
  }));
  const prepared={
    id:'prepared_after_noise',
    tenantId:'tenant',
    userId:'user',
    category:'prepared_work',
    type:'proposal_draft',
    itemType:'proposal_draft',
    title:'GOALL proposal',
    status:'ready_for_review',
    summary:'A grounded proposal is ready.',
    confidence:0.7,
    requiresApproval:true,
    sourceRefsJson:[{source_type:'transcript',source_id:'tr_goall',quote_or_summary:'Jessa and Mike agreed to the scope and timing.',confidence:0.9}],
    metadataJson:{
      source:'transcript_intelligence',
      preparedArtifactKind:'proposal_draft',
      preparedArtifact:{
        kind:'proposal_draft',
        body:'Proposal scope, timing, and pricing for GOALL.',
        recipients:[{name:'Mike',email:'mike@example.com'}]
      },
      canValAct:'approval_required',
      executionPath:'review_then_send'
    },
    createdAt:'2026-07-26T12:00:00Z'
  };
  let store={readyForYouItems:[...noisyRows,prepared]};
  const ready=createValReadyForYouService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    tenantId:()=> 'tenant',
    userId:()=> 'user'
  });
  const listed=await ready.listItems({limit:5});
  assert.equal(listed.items.length,5);
  assert.equal(listed.preparedCount,1);
  assert.equal(listed.preparedItems[0].id,'prepared_after_noise');
});

test('approve, reject, and snooze remain local actions and notify the canonical decision return path',async()=>{
  let store={readyForYouItems:[]};
  const decisions=[];
  const service=createValReadyForYouService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    tenantId:()=>'tenant',
    userId:()=>'user',
    executiveInboxService:{reviewDrafts:async()=>({drafts:[{id:'draft_approve',subject:'Ready',body:'Body',status:'ready_for_review',sourceContext:{source:'executive_inbox_review_only',writerOutput:{confidence:0.8}}}]}),listReadyForYouDraftCandidates:async()=>[]},
    listDrafts:async()=>[],
    afterDecision:async event=>decisions.push(event)
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
  assert.deepEqual(decisions.map(event=>event.status),['approved','rejected','snoozed']);
  assert.ok(decisions.every(event=>event.item&&event.reviewedAt));
});

test('server returns every prepared-work decision to canonical work and the Board',()=>{
  assert.match(server,/afterDecision:async\(\{item,status,decision,reviewedAt,snoozedUntil\}=\{\}\)=>/);
  assert.match(server,/valCanonicalWork\.recordDecision/);
  assert.match(server,/source:'prepared_work_decision'/);
  assert.match(server,/sourceId:`prepared-decision:\$\{item\.id\}`/);
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
          what_val_did:'A reviewable introduction email candidate with both CRM contact IDs attached. Nothing was sent.',
          what_only_user_can_do:'Confirm whether this introduction is appropriate.',
          approval_policy:'approval_required',
          representation_risk:'high',
          prepared_artifact:{
            kind:'introduction_email_draft',
            source:'relationship_intro_matching',
            recipients:[{name:'Aric Soyring',email:'aric@example.com',contactId:'crm_aric'},{name:'Greg Niesen',email:'greg@example.com',contactId:'crm_greg'}],
            consentConfirmed:true,
            body:'Hi Aric and Greg, I would like to introduce you because your partnership interests appear aligned.',
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

test('commitment packets with enough context produce reviewable Leverage prepared work',async()=>{
  let store={readyForYouItems:[]};
  const ready=createValReadyForYouService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    uuid:prefix=>`${prefix}_test`,
    tenantId:()=> 'tenant',
    userId:()=> 'user',
    executiveInboxService:{reviewDrafts:async()=>({drafts:[]}),listReadyForYouDraftCandidates:async()=>[]},
    meetingPrepService:{listReadyForYouCandidates:async()=>[]},
    transcriptIntelligenceService:{listReadyForYouCandidates:async()=>[]},
    commitmentsService:{
      list:async()=>({ok:true,commitments:[{
        id:'commitment_goall_dashboard',
        title:'Finish the GOALL dashboard handoff with Mike',
        description:'Finish the GOALL dashboard handoff with Mike so the agency has a clean next step.',
        evidence_quote:'Mike said the dashboard needs to show pipeline projections, open follow-up, owner, and whether the team has enough context to move. Jessa said it needs to be HTML/CSS so it can be embedded as an iframe in the CRM dashboard.',
        evidence_summary:'GOALL dashboard handoff needs an iframe-ready HTML/CSS draft.',
        source_type:'transcript',
        source_id:'tr_goall_dashboard_handoff',
        source_title:'GOALL dashboard handoff with Mike',
        owner_type:'user',
        owner_name:'Jessa',
        status:'open',
        confidence_score:0.82,
        workingBrief:{
          projectName:'GOALL',
          relationshipName:'Mike',
          envelope:{envelopeType:'project',displayName:'GOALL',projectName:'GOALL'},
          contextLines:[
            'The dashboard needs to show pipeline projections.',
            'The dashboard needs open follow-up, owner, and context readiness.',
            'It needs to be HTML/CSS so it can be embedded as an iframe in the CRM dashboard.'
          ],
          sourceRefs:[{source_type:'transcript',source_id:'tr_goall_dashboard_handoff',quote_or_summary:'dashboard needs to show pipeline projections, open follow-up, owner, and whether the team has enough context to move',confidence:0.82}]
        },
        sourceRefs:[{source_type:'transcript',source_id:'tr_goall_dashboard_handoff',quote_or_summary:'iframe in the CRM dashboard',confidence:0.82}]
      }]})
    },
    listDrafts:async()=>[]
  });
  const built=await ready.buildQueue({limit:5});
  const item=built.preparedItems.find(row=>row.metadataJson?.commitmentId==='commitment_goall_dashboard');
  assert.ok(item);
  assert.equal(item.category,'prepared_work');
  assert.equal(item.metadataJson.source,'commitment_packet');
  assert.equal(item.metadataJson.preparedArtifactKind,'html_page_draft');
  assert.equal(item.metadataJson.preparedArtifact.kind,'html_page_draft');
  assert.equal(item.metadataJson.projectName,'GOALL');
  assert.match(item.metadataJson.preparedArtifact.html,/GOALL Dashboard Handoff/);
  assert.match(item.metadataJson.preparedArtifact.html,/pipeline projections/i);
  assert.match(item.metadataJson.preparedArtifact.html,/iframe/i);
  assert.ok(item.actionsJson.some(action=>action.key==='review_prepared_work'));
  assert.equal(built.preparedCount,1);
});

test('canonical work packets are preferred and preserve full lineage in Leverage',async()=>{
  let store={readyForYouItems:[]};
  let legacyRead=false;
  const attached=[];
  const ready=createValReadyForYouService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    uuid:prefix=>`${prefix}_canonical`,
    tenantId:()=> 'tenant',
    userId:()=> 'user',
    executiveInboxService:{reviewDrafts:async()=>({drafts:[]}),listReadyForYouDraftCandidates:async()=>[]},
    meetingPrepService:{listReadyForYouCandidates:async()=>[]},
    transcriptIntelligenceService:{listReadyForYouCandidates:async()=>[]},
    canonicalWorkService:{
      taskProjection:async()=>({ok:true,tasks:[{
        id:'work_goall_1',
        canonical_work_item_id:'work_goall_1',
        source_processing_record_id:'source_record_9',
        source_type:'transcript',
        source_id:'transcript_9',
        title:'Build the GOALL projections dashboard',
        description:'Create the agreed dashboard for the GOALL project.',
        evidence_quote:'Jessa: I will build the dashboard in HTML and CSS for the CRM.',
        owner_type:'user',
        owner_name:'Jessa',
        status:'open',
        confidence_score:0.94,
        project_name:'GOALL',
        relationship_name:'Mike',
        envelope:{type:'project',id:'project_goall',name:'GOALL'},
        working_brief:{
          projectName:'GOALL',
          relationshipName:'Mike',
          contextLines:[
            'Mike: Show pipeline projections, owner, and open follow-up.',
            'Jessa: Make it iframe-ready for the CRM.'
          ],
          sourceRefs:[{source_type:'transcript',source_id:'transcript_9',quote_or_summary:'Make it iframe-ready for the CRM.',confidence:0.94}]
        },
        source_packet:{
          canonical_work_item_id:'work_goall_1',
          source_processing_record_id:'source_record_9',
          source_type:'transcript',
          source_id:'transcript_9',
          source_version:2,
          source_fingerprint:'fingerprint_9',
          context_excerpt:'Mike: Show pipeline projections, owner, and open follow-up.\nJessa: Make it iframe-ready for the CRM.'
        }
      }]}),
      attachPreparedArtifact:async(id,input)=>{attached.push({id,input});return {ok:true,attached:true};}
    },
    commitmentsService:{list:async()=>{legacyRead=true;return {ok:true,commitments:[]};}},
    listDrafts:async()=>[]
  });
  const built=await ready.buildQueue({limit:5});
  const item=built.preparedItems.find(row=>row.metadataJson?.canonicalWorkItemId==='work_goall_1');
  assert.ok(item);
  assert.equal(legacyRead,false);
  assert.equal(item.metadataJson.projectName,'GOALL');
  assert.equal(item.metadataJson.relationshipName,'Mike');
  assert.equal(item.metadataJson.sourceProcessingRecordId,'source_record_9');
  assert.equal(item.metadataJson.preparedArtifact.source_packet.canonical_work_item_id,'work_goall_1');
  assert.equal(item.metadataJson.preparedArtifact.source_packet.source_version,2);
  assert.match(item.metadataJson.preparedArtifact.html,/pipeline projections/i);
  assert.match(item.metadataJson.preparedArtifact.html,/iframe/i);
  assert.equal(attached.length,1);
  assert.equal(attached[0].id,'work_goall_1');
  assert.equal(attached[0].input.artifactId,item.id);
  assert.equal(attached[0].input.metadata.latestPreparedArtifactKind,'html_page_draft');
});

test('meeting overview drafts preserve their reviewable email artifact for Leverage',async()=>{
  const state={drafts:[{
    id:'meeting-overview-draft',
    draftType:'meeting_recap',
    provider:'internal',
    subject:'Meeting overview: Forever Freedom follow up',
    body:'Action Items\n- Send the website link\n\nKey Points\n- CRM ownership is confirmed.',
    status:'ready_for_review',
    sourceContext:{
      source:'transcript_meeting_overview',
      transcriptId:'transcript-1',
      preparedArtifactKind:'email_draft',
      recipientEmail:'mike@example.com',
      recipientId:'crm_mike',
      preparedArtifact:{kind:'email_draft',body:'Action Items\n- Send the website link\n\nKey Points\n- CRM ownership is confirmed.',target:'mike@example.com',recipients:[{name:'Mike',email:'mike@example.com',contactId:'crm_mike'}]},
      canValAct:'approval_required',
      executionPath:'create_provider_draft_then_human_send',
      noExternalAction:true
    },
    createdAt:'2026-07-13T12:00:00Z'
  }],readyForYouItems:[]};
  const ready=createValReadyForYouService({
    getStore:()=>state,
    saveStore:()=>{},
    uuid:(prefix)=>prefix+'-id',
    tenantId:()=> 'tenant',
    userId:()=> 'user',
    listDrafts:async()=>state.drafts
  });
  const built=await ready.buildQueue({limit:5});
  const item=built.allBuilt.find(row=>row.metadataJson?.draftId==='meeting-overview-draft');
  assert.equal(item.metadataJson.preparedArtifactKind,'email_draft');
  assert.equal(item.metadataJson.preparedArtifact.kind,'email_draft');
  assert.equal(item.metadataJson.canValAct,'approval_required');
  assert.equal(item.metadataJson.executionPath,'create_provider_draft_then_human_send');
});

test('existing contactless prepared work is reclassified as a durable task when read',async()=>{
  const savedTasks=[];
  let store={readyForYouItems:[{
    id:'ready_bad_email',
    tenantId:'tenant',
    userId:'user',
    category:'prepared_work',
    type:'email_draft',
    itemType:'email_draft',
    title:'Email draft prepared',
    status:'ready_for_review',
    summary:'Send the information to Anna.',
    whatValPrepared:'Hi Anna, here is the information you requested.',
    sourceRefsJson:[{source_type:'transcript',source_id:'tr_bad',quote_or_summary:'Send the information to Anna.',confidence:0.8}],
    confidence:0.8,
    requiresApproval:true,
    metadataJson:{
      source:'transcript_intelligence',
      transcriptId:'tr_bad',
      preparedArtifactKind:'email_draft',
      preparedArtifact:{kind:'email_draft',body:'Hi Anna, here is the information you requested.'}
    },
    createdAt:'2026-07-24T12:00:00Z'
  }]};
  const ready=createValReadyForYouService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    tenantId:()=> 'tenant',
    userId:()=> 'user',
    saveTask:async task=>{savedTasks.push(task);}
  });
  const listed=await ready.listItems({limit:5});
  assert.equal(listed.items[0].type,'prepared_work_needs_information');
  assert.equal(listed.items[0].category,'task');
  assert.equal(listed.items[0].metadataJson.preparedArtifactKind,'');
  assert.equal(listed.preparedCount,0);
  assert.equal(savedTasks.length,1);
  assert.equal(savedTasks[0].source,'prepared_work_admission');
  assert.match(savedTasks[0].notes,/recipient/i);
});

test('transcript commitment review bundles do not count as prepared Leverage work',async()=>{
  let store={readyForYouItems:[]};
  const ready=createValReadyForYouService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    uuid:prefix=>`${prefix}_test`,
    tenantId:()=> 'tenant',
    userId:()=> 'user',
    executiveInboxService:{reviewDrafts:async()=>({drafts:[]}),listReadyForYouDraftCandidates:async()=>[]},
    meetingPrepService:{listReadyForYouCandidates:async()=>[]},
    transcriptIntelligenceService:{
      listReadyForYouCandidates:async()=>[{
        source:'transcript_intelligence',
        id:'followup_tr_1_commitments',
        transcriptId:'tr_1',
        status:'ready_for_review',
        title:'Review 12 transcript commitments',
        summary:'VAL extracted commitments before turning anything into tasks.',
        handoff:{
          id:'followup_tr_1_commitments',
          category:'transcript_follow_up',
          type:'commitment_bundle',
          title:'Review 12 transcript commitments',
          summary:'VAL extracted commitments before turning anything into tasks.',
          why_user_is_seeing_this:'This transcript changed what someone may be waiting on.',
          why_now:'Commitments lose value when they are not clarified soon after the conversation.',
          what_val_did:'Extracted commitments, source quotes, and task context. No task was created automatically.',
          what_only_user_can_do:'Confirm which commitments are real and how they should move forward.',
          approval_policy:'approval_required',
          requires_approval:true,
          source_refs:[{source_type:'transcript',source_id:'tr_1',quote_or_summary:'I have one more thing I want to accomplish today.',confidence:0.74}]
        },
        run:{id:'run_1',transcriptId:'tr_1',confidence:0.74,createdAt:'2026-07-24T10:00:00Z'}
      }]
    },
    listDrafts:async()=>[]
  });
  const built=await ready.buildQueue({limit:5});
  const item=built.allBuilt.find(row=>row.title==='Review 12 transcript commitments');
  assert.ok(item);
  assert.equal(item.metadataJson.preparedArtifactKind,'');
  assert.equal(item.metadataJson.preparedWorkCount,0);
  assert.equal(built.preparedCount,0);
  assert.deepEqual(built.preparedItems,[]);
});

test('canonical prepared work is generated once per immutable source version',async()=>{
  let store={readyForYouItems:[]};
  let generationCount=0;
  const preparedReceipts=[];
  const task={
    id:'work_goall',
    canonical_work_item_id:'work_goall',
    title:'Build the GOALL dashboard in HTML',
    description:'Create the CRM iframe dashboard.',
    evidence_quote:'Jessa: I will build the GOALL dashboard in HTML for the CRM iframe.',
    source_type:'transcript',
    source_id:'tr_goall',
    source_refs:[{source_type:'transcript',source_id:'tr_goall',quote_or_summary:'Jessa: I will build the GOALL dashboard in HTML for the CRM iframe.',confidence:0.96}],
    project_name:'GOALL',
    status:'open',
    confidence_score:0.96,
    workingBrief:{
      projectName:'GOALL',
      envelope:{type:'project',id:'goall',name:'GOALL'},
      contextLines:['The dashboard needs pipeline projections, owner, follow-up, and weekly status.'],
      sourceContext:{
        sourceProcessingRecordIds:['source_1'],
        immutableSourceVersions:[{sourceProcessingRecordId:'source_1',sourceVersion:1,sourceFingerprint:'fp_1'}]
      }
    },
    source_packet:{source_processing_record_id:'source_1',source_type:'transcript',source_id:'tr_goall',context_excerpt:'The dashboard needs pipeline projections, owner, follow-up, and weekly status.'},
    source_packets:[{source_processing_record_id:'source_1',source_version:1,source_fingerprint:'fp_1',source_title:'GOALL meeting',context_excerpt:'The dashboard needs pipeline projections, owner, follow-up, and weekly status.'}]
  };
  const service=createValReadyForYouService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:value=>{store=value;},
    uuid:prefix=>`${prefix}_test`,
    tenantId:()=> 'tenant',
    userId:()=> 'user',
    canonicalWorkService:{
      taskProjection:async()=>({ok:true,tasks:[task]}),
      attachPreparedArtifact:async()=>({ok:true})
    },
    generatePreparedArtifact:async({artifact})=>{
      generationCount+=1;
      return {
        ok:true,
        artifact:{
          ...artifact,
          html:'<!doctype html><html><body><h1>GOALL Dashboard</h1><p>Pipeline projections, owner, follow-up, and weekly status.</p></body></html>',
          generatedFromCanonicalPacket:true,
          usedEvidence:[task.evidence_quote]
        }
      };
    },
    afterPreparedItem:async item=>{
      preparedReceipts.push(item);
      return {sourceProcessingRecord:{id:'source_prepared_1'}};
    },
    listDrafts:async()=>[]
  });
  const first=await service.prepareCanonicalWorkItem(task.id);
  const second=await service.prepareCanonicalWorkItem(task.id);
  assert.equal(first.prepared,true);
  assert.equal(second.prepared,true);
  assert.equal(generationCount,1);
  assert.equal(preparedReceipts.length,1);
  assert.match(preparedReceipts[0].metadataJson.preparedArtifact.html,/GOALL Dashboard/);
  assert.equal(preparedReceipts[0].sourceRefsJson[0].source_id,'tr_goall');
  assert.equal(store.readyForYouItems.length,1);
  assert.match(store.readyForYouItems[0].metadataJson.preparedArtifact.html,/GOALL Dashboard/);
  assert.equal(store.readyForYouItems[0].metadataJson.preparedBoardReceiptId,'source_prepared_1');
});

test('canonical preparation is bounded and resumes from the next unprepared item',async()=>{
  let store={readyForYouItems:[]};
  let generationCount=0;
  const tasks=Array.from({length:4},(_,index)=>({
    id:`work_${index+1}`,
    canonical_work_item_id:`work_${index+1}`,
    title:`Build dashboard ${index+1} in HTML`,
    description:'Prepare the source-backed iframe dashboard.',
    evidence_quote:`Jessa: Please build dashboard ${index+1} in HTML for the CRM iframe.`,
    source_type:'transcript',
    source_id:`tr_${index+1}`,
    source_refs:[{source_type:'transcript',source_id:`tr_${index+1}`,quote_or_summary:`Jessa: Please build dashboard ${index+1} in HTML for the CRM iframe.`,confidence:0.9}],
    status:'open',
    confidence_score:0.9,
    workingBrief:{
      workType:'html_page_draft',
      contextLines:[`Jessa: Please build dashboard ${index+1} in HTML for the CRM iframe.`],
      sourceContext:{immutableSourceVersions:[{sourceVersion:1,sourceFingerprint:`fp_${index+1}`}]}
    },
    source_packets:[{source_title:`Transcript ${index+1}`,source_version:1,source_fingerprint:`fp_${index+1}`,context_excerpt:`Jessa: Please build dashboard ${index+1} in HTML for the CRM iframe.`}]
  }));
  const service=createValReadyForYouService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:value=>{store=value;},
    tenantId:()=> 'tenant',
    userId:()=> 'user',
    canonicalWorkService:{
      taskProjection:async()=>({ok:true,tasks}),
      attachPreparedArtifact:async()=>({ok:true})
    },
    generatePreparedArtifact:async({artifact,workItem})=>{
      generationCount+=1;
      return {ok:true,artifact:{...artifact,html:`<!doctype html><html><body><h1>${workItem.id}</h1><p>Complete reviewable dashboard grounded in the source packet.</p></body></html>`,generatedFromCanonicalPacket:true,usedEvidence:[workItem.evidence_quote]}};
    },
    listDrafts:async()=>[]
  });
  const first=await service.buildQueue({limit:25,materializeLimit:1});
  assert.equal(generationCount,1);
  assert.equal(first.generation.materializedCount,1);
  assert.equal(first.generation.generationBacklog,3);
  const second=await service.buildQueue({limit:25,materializeLimit:1});
  assert.equal(generationCount,2);
  assert.equal(second.generation.materializedCount,1);
  assert.equal(second.generation.generationBacklog,2);
  assert.equal(store.readyForYouItems.filter(item=>item.metadataJson?.generatedFromCanonicalPacket).length,2);
});

test('editing canonical prepared work persists the final draft and emits learning feedback',async()=>{
  let store={readyForYouItems:[]};
  const edits=[];
  const service=createValReadyForYouService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:value=>{store=value;},
    tenantId:()=> 'tenant',
    userId:()=> 'user',
    afterDraftEdit:async payload=>edits.push(payload)
  });
  await service.saveItem({
    id:'ready_edit',
    tenantId:'tenant',
    userId:'user',
    status:'ready_for_review',
    type:'prepared_work',
    itemType:'prepared_work',
    title:'Follow-up',
    summary:'Prepared follow-up',
    sourceRefsJson:[],
    metadataJson:{
      preparedArtifactKind:'email_draft',
      preparedWorkAdmission:'admitted',
      preparedArtifact:{kind:'email_draft',title:'Follow-up',subject:'Following up',body:'Original prepared message with enough content to review.',recipientName:'Michele',recipientEmail:'michele@example.com'}
    },
    createdAt:new Date().toISOString(),
    updatedAt:new Date().toISOString()
  });
  const saved=await service.updatePreparedArtifact('ready_edit',{body:'Edited final message in Jessa voice, ready for approval and sending.'});
  assert.match(saved.metadataJson.preparedArtifact.body,/Edited final message/);
  assert.equal(saved.metadataJson.userEdited,true);
  assert.equal(edits.length,1);
  assert.match(edits[0].beforeArtifact.body,/Original prepared/);
  assert.match(edits[0].afterArtifact.body,/Edited final/);
});
