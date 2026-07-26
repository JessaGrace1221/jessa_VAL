const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createValExecutiveInboxService, executiveInboxAdmissionDecision}=require('../services/valExecutiveInbox');
const {VAL_CONVERSATION_IDENTITY_SQL}=require('../services/valConversationIdentitySchema');

const root=path.join(__dirname,'..');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
const routes=fs.readFileSync(path.join(root,'services','valExecutiveInboxRoutes.js'),'utf8');
const executiveInboxService=fs.readFileSync(path.join(root,'services','valExecutiveInbox.js'),'utf8');
const coworkService=fs.readFileSync(path.join(root,'services','valCowork.js'),'utf8');
const spine=fs.readFileSync(path.join(root,'services','valIntelligenceSpine.js'),'utf8');
const roundTableDoc=fs.readFileSync(path.join(root,'docs','VAL_EXECUTIVE_INBOX_ROUND_TABLE_AND_RULES.md'),'utf8');
const lineageDoc=fs.readFileSync(path.join(root,'docs','HEARTH_TRUTH_LINEAGE_MAP.md'),'utf8');
const realityPipelineDoc=fs.readFileSync(path.join(root,'docs','VAL_REALITY_PROCESSING_PIPELINE.md'),'utf8');
const reasoningPipelineDoc=fs.readFileSync(path.join(root,'docs','HEARTH_EXECUTIVE_REASONING_PIPELINE.md'),'utf8');
const contextRegistryDoc=fs.readFileSync(path.join(root,'docs','VAL_CONTEXT_REGISTRY.md'),'utf8');
const productPhilosophyDoc=fs.readFileSync(path.join(root,'docs','VAL_PRODUCT_PHILOSOPHY_AND_INFORMATION_ARCHITECTURE.md'),'utf8');

test('conversation classification schema stores executive inbox fields and draft evaluations',()=>{
  for(const field of ['executive_meaning','priority_level','why_now','if_ignored','if_delayed','false_urgency_check_json','routing_json','approval_policy']){
    assert.match(VAL_CONVERSATION_IDENTITY_SQL,new RegExp(field));
  }
  assert.match(VAL_CONVERSATION_IDENTITY_SQL,/create table if not exists email_draft_evaluations/);
});

test('executive inbox routes are backend-only and mounted',()=>{
  assert.match(server,/registerValExecutiveInboxRoutes/);
  assert.match(routes,/\/api\/val\/executive-inbox\/classify-conversation/);
  assert.match(routes,/\/api\/val\/executive-inbox\/classify-batch/);
  assert.match(routes,/\/api\/val\/executive-inbox\/not-executive-contact/);
  assert.match(routes,/\/api\/val\/email\/draft-readiness/);
  assert.match(routes,/\/api\/val\/email\/draft-brief/);
  assert.match(routes,/\/api\/val\/email\/draft-qa/);
  assert.match(routes,/\/api\/val\/email\/generate-draft/);
  assert.match(routes,/\/api\/val\/email\/revise-draft/);
  assert.match(routes,/\/api\/val\/email\/review-drafts/);
  assert.match(server,/\/api\/val\/executive-inbox\/thread/);
  assert.match(server,/\/api\/val\/executive-inbox\/attachment/);
  assert.match(server,/Gmail email attachment/);
  assert.match(server,/function extractGmailBodyHtml/);
  assert.match(server,/bodyHtml/);
  assert.match(server,/Gmail thread message body/);
  assert.match(server,/function executiveInboxWritingRuleText/);
  assert.match(server,/async function prepareEmailDraftIfNeeded\(email,rules=\[\]\)/);
  assert.match(server,/saveInternalDraft\(\{[\s\S]*source:'executive_inbox_review_only'/);
  assert.doesNotMatch(server,/async function prepareEmailDraftIfNeeded\(email\)\{\s*if\(!emailShouldPrepareDraft\(email\)\)return null;\s*return null;\s*\}/);
  assert.match(server,/noExternalAction:true/);
  assert.match(server,/loadEmailThreadForCowork/);
  assert.match(executiveInboxService,/writingRules/);
  assert.match(executiveInboxService,/tone_requirements/);
  assert.match(executiveInboxService,/writing_rules:compactText\(brief\.writingRules/);
  assert.match(executiveInboxService,/Do not append, label, quote, or explain the writing rules in the email body/);
  assert.match(server,/writingRules:req\.body\.writingRules/);
  assert.match(server,/linkedContexts/);
  assert.match(coworkService,/linkedContexts/);
  assert.match(coworkService,/Attached context:/);
});

test('executive inbox round table doc defines packets rules and downstream feeds',()=>{
  assert.match(roundTableDoc,/Executive Inbox Round Table/);
  assert.match(roundTableDoc,/VAL Reality Processing Pipeline/);
  assert.match(roundTableDoc,/Executive Relevance Engine/);
  assert.match(roundTableDoc,/Witness observations/);
  assert.match(roundTableDoc,/Email Admission Packet/);
  assert.match(roundTableDoc,/Email Judgment Packet/);
  assert.match(roundTableDoc,/Email Rule Packet/);
  assert.match(roundTableDoc,/External Action Packet/);
  assert.match(roundTableDoc,/more than 3 inbound emails from a sender/);
  assert.match(roundTableDoc,/0 sent emails from the user to that sender/);
  assert.match(roundTableDoc,/Not executive contact/);
  assert.match(roundTableDoc,/forward_sender/);
  assert.match(roundTableDoc,/abc@companyemail\.com/);
  assert.match(roundTableDoc,/Approved outbound email feeds/);
  assert.match(roundTableDoc,/Relationship timeline/);
  assert.match(roundTableDoc,/Project timeline/);
  assert.match(roundTableDoc,/Rule Learning/);
  assert.match(roundTableDoc,/Draft Learning/);
  assert.match(lineageDoc,/VAL_EXECUTIVE_INBOX_ROUND_TABLE_AND_RULES\.md/);
});

test('reality processing pipeline defines witness and global relevance before round tables',()=>{
  assert.match(realityPipelineDoc,/Source\s*\n  -> Witness\s*\n  -> Executive Relevance Engine\s*\n  -> Round Table/);
  assert.match(realityPipelineDoc,/What actually happened\?/);
  assert.match(realityPipelineDoc,/Has this earned cognitive space\?/);
  assert.match(realityPipelineDoc,/Can this create a Relationship\?/);
  assert.match(realityPipelineDoc,/Can this feed Velocity\?/);
  assert.match(realityPipelineDoc,/Can this influence Meeting Prep\?/);
  assert.match(realityPipelineDoc,/No Context Borrowing From Suppressed Or Unadmitted Sources/);
  assert.match(reasoningPipelineDoc,/VAL_REALITY_PROCESSING_PIPELINE\.md/);
  assert.match(reasoningPipelineDoc,/-> Witness/);
  assert.match(productPhilosophyDoc,/Witness\s*\n  -> Executive Relevance Engine/);
  assert.match(contextRegistryDoc,/\| `witness` \| Plain observations/);
  assert.match(contextRegistryDoc,/\| `relevance` \| Global Executive Relevance Engine/);
});

test('executive inbox hard-excludes one-sided senders and manual not-executive contacts',async()=>{
  assert.match(server,/function classifyExecutiveEmail/);
  assert.match(server,/function emailSenderMetrics/);
  assert.match(server,/function emailIsCalendarNotification/);
  assert.match(server,/calendar_notice/);
  assert.match(server,/classifyExecutiveEmail\(withMetrics,rules\)/);
  const oneSided=executiveInboxAdmissionDecision({
    context:{
      current_message:{from:{name:'Cold Vendor',email:'vendor@example.com'}},
      latest_inbound:{from:{name:'Cold Vendor',email:'vendor@example.com'}},
      sender_metrics:{inboundFromSenderCount:4,outboundToSenderCount:0}
    },
    identity:{match_status:'no_match'}
  });
  assert.equal(oneSided.admitted,false);
  assert.equal(oneSided.state,'noise');
  assert.equal(oneSided.rule,'more_than_three_inbound_zero_sent');

  let store={};
  const service=createValExecutiveInboxService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    uuid:prefix=>`${prefix}_noise`,
    tenantId:()=>'tenant',
    userId:()=>'user',
    conversationService:{
      buildConversationContext:async()=>({
        conversationId:'uc_noise',
        threadId:'thread_noise',
        current_message:{messageId:'noise_4',direction:'inbound',from:{name:'Vendor',email:'vendor@example.com'},subject:'Quick bump',bodyPreview:'Just checking in again.'},
        latest_inbound:{messageId:'noise_4',direction:'inbound',from:{name:'Vendor',email:'vendor@example.com'},subject:'Quick bump',bodyPreview:'Just checking in again.'},
        latest_outbound:null,
        thread_summary:'4 inbound messages from Vendor.',
        sender_metrics:{inboundFromSenderCount:4,outboundToSenderCount:0},
        waiting_on_user:true,
        waiting_on_other:false,
        open_questions:[],
        commitments:[],
        conversation_state:'waiting_on_user',
        relationship_temperature:'waiting',
        unknowns:[],
        source_refs:[]
      }),
      resolveIdentity:async()=>({ok:true,match_status:'no_match',unknowns:[]})
    },
    listTeachValCoreMemory:async()=>[],
    logger:{log(){}}
  });
  const classified=await service.classifyConversation({conversationId:'uc_noise'});
  assert.equal(classified.classification.priority_level,'suppressed');
  assert.equal(classified.classification.routing.bucket,'inbox_noise');
  assert.equal(classified.classification.executive_inbox_admission.rule,'more_than_three_inbound_zero_sent');
  const readiness=await service.draftReadiness({conversationId:'uc_noise'});
  assert.equal(readiness.readiness.status,'do_not_draft');

  const suppression=await service.markNotExecutiveContact({email:'person@example.com',name:'Not Exec'});
  assert.equal(suppression.ok,true);
  const manual=executiveInboxAdmissionDecision({
    context:{current_message:{from:{email:'person@example.com',name:'Not Exec'}},sender_metrics:{inboundFromSenderCount:1,outboundToSenderCount:1}},
    identity:{match_status:'matched'},
    suppressedContacts:store.suppressedExecutiveContacts
  });
  assert.equal(manual.admitted,false);
  assert.equal(manual.rule,'manual_not_executive_contact');
  const domainSuppression=await service.markNotExecutiveContact({email:'info@vendor.example',name:'Vendor',domain:'vendor.example',suppressDomain:true});
  assert.equal(domainSuppression.ok,true);
  assert.equal(domainSuppression.domainSuppression.key,'domain:vendor.example');
});

test('intelligence spine reads high-signal classifications and draft candidates',()=>{
  assert.match(spine,/listHighSignalClassifications/);
  assert.match(spine,/readyForYouDraftCandidates/);
  assert.match(spine,/conversation_classification/);
  assert.match(spine,/ready_for_you_draft_candidates/);
  assert.doesNotMatch(spine,/email_draft_readiness/);
});

test('opening Executive Inbox reads the saved index instead of rerunning classification',()=>{
  const queueStart=server.indexOf('async function localExecutiveInboxQueue');
  const queueEnd=server.indexOf('\n}',queueStart);
  const queueSource=server.slice(queueStart,queueEnd);
  assert.match(queueSource,/listHighSignalClassifications/);
  assert.doesNotMatch(queueSource,/classifyBatch/);
  assert.match(queueSource,/Promise\.race/);
  assert.match(server,/executiveInboxNewestByConversation/);
  assert.match(server,/decideExecutiveInboxAdmission/);
  assert.match(server,/valExecutiveInbox\.reviewDrafts\(\{limit:100\}\)/);
  assert.match(server,/draftsByConversation\.get\(email\.conversationId\)/);
});

function fakeConversationService(){
  const context={
    ok:true,
    conversationId:'uc_1',
    provider:'gmail',
    threadId:'thread_1',
    current_message:{id:'em_1',messageId:'m_1',threadId:'thread_1',provider:'gmail',direction:'inbound',from:{name:'Aric',email:'aric@example.com'},subject:'Partner workflow',bodyPreview:'Can you send the partner workflow today? Aric is waiting.'},
    latest_inbound:{messageId:'m_1',direction:'inbound',from:{name:'Aric',email:'aric@example.com'},subject:'Partner workflow',bodyPreview:'Can you send the partner workflow today? Aric is waiting.'},
    latest_outbound:null,
    thread_summary:'1 message about Partner workflow.',
    waiting_on_user:true,
    waiting_on_other:false,
    open_questions:[{text:'Can you send the partner workflow today?',messageId:'m_1'}],
    commitments:[{text:'send the partner workflow today',messageId:'m_1',direction:'inbound'}],
    conversation_state:'waiting_on_user',
    relationship_temperature:'waiting',
    unknowns:[],
    confidence:0.72,
    source_refs:[{source_type:'email_message',source_id:'em_1',quote_or_summary:'Can you send the partner workflow today?',confidence:0.8,created_at:'2026-07-03T12:00:00Z'}]
  };
  return {
    buildConversationContext:async()=>context,
    resolveIdentity:async()=>({ok:true,person_key:'email:aric@example.com',crm_contact_id:'crm_aric',match_status:'matched',match_confidence:0.94,match_basis:['exact_email'],recommended_action:'use_existing',candidates:[],unknowns:[]})
  };
}

test('classifies by consequence and stores draft readiness without sending',async()=>{
  let store={};
  const service=createValExecutiveInboxService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    uuid:prefix=>`${prefix}_test_${Math.random().toString(36).slice(2,7)}`,
    tenantId:()=>'tenant',
    userId:()=>'user',
    conversationService:fakeConversationService(),
    listTeachValCoreMemory:async()=>[{title:'Voice',summary:'Write plainly and protect relationships.'}],
    logger:{log(){}}
  });
  const classified=await service.classifyConversation({conversationId:'uc_1'});
  assert.equal(classified.ok,true);
  assert.equal(classified.classification.conversation_state,'waiting_on_user');
  assert.equal(classified.classification.executive_meaning,'protect_trust');
  assert.ok(['high','critical'].includes(classified.classification.priority_level));
  assert.equal(classified.classification.approval_policy,'approval_required');
  assert.equal(store.conversationClassifications.length,1);
  const readiness=await service.draftReadiness({conversationId:'uc_1'});
  assert.equal(readiness.ok,true);
  assert.equal(readiness.readiness.status,'ready_for_review');
  assert.equal(readiness.readiness.allowed_draft_type,'reply');
  const brief=await service.draftBrief({conversationId:'uc_1'});
  assert.equal(brief.ok,true);
  assert.ok(brief.draft_brief.single_purpose);
  const qa=await service.draftQa({conversationId:'uc_1',draftText:'Just wanted to touch base at your earliest convenience.'});
  assert.equal(qa.ok,true);
  assert.equal(qa.qa.passes,false);
  assert.ok(qa.qa.issues.includes('corporate_filler'));
  assert.ok(store.emailDraftEvaluations.length>=3);
});

test('draft readiness needs context for commercial specifics',async()=>{
  const service=createValExecutiveInboxService({
    hasPg:()=>false,
    getStore:()=>({}),
    saveStore:()=>{},
    tenantId:()=>'tenant',
    userId:()=>'user',
    conversationService:{
      buildConversationContext:async()=>({
        conversationId:'uc_2',
        threadId:'t2',
        current_message:{messageId:'m2',direction:'inbound',from:{email:'client@example.com'},subject:'Pricing',bodyPreview:'Can you send pricing for the proposal?'},
        latest_inbound:{messageId:'m2',direction:'inbound',from:{email:'client@example.com'},bodyPreview:'Can you send pricing for the proposal?'},
        thread_summary:'Pricing question.',
        waiting_on_user:true,
        waiting_on_other:false,
        open_questions:[{text:'Can you send pricing for the proposal?'}],
        commitments:[],
        conversation_state:'waiting_on_user',
        relationship_temperature:'neutral',
        unknowns:[],
        source_refs:[]
      }),
      resolveIdentity:async()=>({match_status:'no_match',unknowns:[]})
    },
    listTeachValCoreMemory:async()=>[]
  });
  const readiness=await service.draftReadiness({conversationId:'uc_2'});
  assert.equal(readiness.readiness.status,'needs_context');
  assert.ok(readiness.readiness.missing_context.includes('commercial_or_legal_specifics'));
});

test('generates review-only email drafts, revises once after QA, and stores locally without provider action',async()=>{
  let store={};
  const savedDrafts=[];
  let modelCalls=0;
  const service=createValExecutiveInboxService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    uuid:prefix=>`${prefix}_phase4_${Math.random().toString(36).slice(2,7)}`,
    tenantId:()=>'tenant',
    userId:()=>'user',
    conversationService:{
      buildConversationContext:async()=>({
        conversationId:'uc_phase4',
        threadId:'thread_phase4',
        current_message:{id:'em_phase4',messageId:'m_phase4',direction:'inbound',from:{name:'Aric',email:'aric@example.com'},subject:'Partner workflow',bodyPreview:'Can you send the partner workflow?'},
        latest_inbound:{messageId:'m_phase4',direction:'inbound',from:{name:'Aric',email:'aric@example.com'},subject:'Partner workflow',bodyPreview:'Can you send the partner workflow?'},
        thread_summary:'Aric asked for the partner workflow.',
        waiting_on_user:true,
        waiting_on_other:false,
        open_questions:[{text:'Can you send the partner workflow?',messageId:'m_phase4'}],
        commitments:[{text:'send the partner workflow',messageId:'m_phase4',direction:'inbound'}],
        conversation_state:'waiting_on_user',
        relationship_temperature:'waiting',
        unknowns:[],
        source_refs:[{source_type:'email_message',source_id:'em_phase4',quote_or_summary:'Can you send the partner workflow?',confidence:0.8,created_at:'2026-07-03T12:00:00Z'}]
      }),
      resolveIdentity:async()=>({ok:true,match_status:'matched',unknowns:[]})
    },
    listTeachValCoreMemory:async()=>[{title:'Communication style',summary:'Write plainly. Do not sound like corporate customer support.',do_not_sound_like:['corporate customer support']}],
    generateDraftWithModel:async()=>{
      modelCalls+=1;
      if(modelCalls===1)return JSON.stringify({
        subject:'Re: Partner workflow',
        body:'Hi Aric,\n\nYes, I can send it tomorrow at 2:00.\n\nI will follow up then.',
        draft_type:'reply',
        why_this_draft_exists:'Aric asked for the workflow.',
        what_it_answers:['The workflow request'],
        what_it_does_not_answer:[],
        missing_context:[],
        tone_notes:'Direct.',
        representation_risk:'medium',
        approval_policy:'approval_required',
        confidence:0.72
      });
      return JSON.stringify({
        subject:'Re: Partner workflow',
        body:'Hi Aric,\n\nYes, I can send the partner workflow over.\n\nI’ll follow up with the clean version.',
        draft_type:'reply',
        why_this_draft_exists:'Aric asked for the workflow and the conversation is waiting on the user.',
        what_it_answers:['Acknowledges the workflow request'],
        what_it_does_not_answer:['Exact timing not present in the thread'],
        missing_context:[],
        tone_notes:'Plain and specific without inventing timing.',
        representation_risk:'medium',
        approval_policy:'approval_required',
        confidence:0.8
      });
    },
    saveReviewDraft:async(payload)=>{
      const draft={id:`draft_${savedDrafts.length+1}`,...payload,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
      savedDrafts.unshift(draft);
      return draft;
    },
    listReviewDrafts:async()=>savedDrafts,
    logger:{log(){}}
  });
  const result=await service.generateDraft({conversationId:'uc_phase4',writingRules:'Warm but direct. Sign off with Jessa.'});
  assert.equal(result.ok,true);
  assert.equal(result.no_external_action,true);
  assert.equal(result.revised_once,true);
  assert.equal(modelCalls,2);
  assert.equal(result.status,'ready_for_review');
  assert.equal(result.writer_output.subject,'Re: Partner workflow');
  assert.doesNotMatch(result.writer_output.body,/Writing rules VAL used/i);
  assert.doesNotMatch(result.writer_output.body,/Warm but direct\. Sign off with Jessa\./);
  for(const field of ['why_this_draft_exists','what_it_answers','what_it_does_not_answer','missing_context','tone_notes','representation_risk','approval_policy','confidence']){
    assert.ok(Object.hasOwn(result.writer_output,field),`missing writer field ${field}`);
  }
  assert.equal(result.qa.passes,true);
  assert.equal(savedDrafts.length,1);
  assert.equal(savedDrafts[0].provider,'internal');
  assert.equal(savedDrafts[0].sourceContext.source,'executive_inbox_review_only');
  assert.equal(savedDrafts[0].sourceContext.noProviderDraftCreated,true);
  assert.equal(savedDrafts[0].sourceContext.writingRules,'Warm but direct. Sign off with Jessa.');
  assert.equal(savedDrafts[0].sourceContext.draftBrief.writingRules,'Warm but direct. Sign off with Jessa.');
  const review=await service.reviewDrafts();
  assert.equal(review.drafts.length,1);
  const candidates=await service.listReadyForYouDraftCandidates();
  assert.equal(candidates[0].source,'executive_inbox_review_only');
  assert.equal(candidates[0].generatedDraft.id,'draft_1');
});

test('does not create a generic Executive Inbox draft when readable thread content is missing',async()=>{
  let store={};
  let saved=false;
  const service=createValExecutiveInboxService({
    hasPg:()=>false,
    getStore:()=>store,
    saveStore:s=>{store=s;},
    uuid:prefix=>`${prefix}_missing_source`,
    tenantId:()=>'tenant',
    userId:()=>'user',
    conversationService:{
      buildConversationContext:async()=>({
        conversationId:'uc_missing',
        threadId:'thread_missing',
        current_message:{id:'em_missing',messageId:'m_missing',direction:'inbound',from:{name:'Client',email:'client@example.com'},subject:'Question',bodyPreview:''},
        latest_inbound:{messageId:'m_missing',direction:'inbound',from:{name:'Client',email:'client@example.com'},subject:'Question',bodyPreview:''},
        thread_summary:'',
        waiting_on_user:true,
        waiting_on_other:false,
        open_questions:[],
        commitments:[],
        conversation_state:'waiting_on_user',
        relationship_temperature:'unknown',
        unknowns:[],
        source_refs:[]
      }),
      resolveIdentity:async()=>({ok:true,match_status:'matched',unknowns:[]})
    },
    listTeachValCoreMemory:async()=>[],
    generateDraftWithModel:async()=>{ throw new Error('model should not be called without source content'); },
    saveReviewDraft:async()=>{ saved=true; },
    logger:{log(){}}
  });
  const result=await service.generateDraft({conversationId:'uc_missing',writingRules:'Warm but direct.'});
  assert.equal(result.ok,false);
  assert.equal(result.needsThreadContent,true);
  assert.equal(result.status,'needs_source_content');
  assert.equal(saved,false);
});
