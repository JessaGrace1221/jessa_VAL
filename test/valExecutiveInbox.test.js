const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createValExecutiveInboxService}=require('../services/valExecutiveInbox');
const {VAL_CONVERSATION_IDENTITY_SQL}=require('../services/valConversationIdentitySchema');

const root=path.join(__dirname,'..');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
const routes=fs.readFileSync(path.join(root,'services','valExecutiveInboxRoutes.js'),'utf8');
const spine=fs.readFileSync(path.join(root,'services','valIntelligenceSpine.js'),'utf8');

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
  assert.match(routes,/\/api\/val\/email\/draft-readiness/);
  assert.match(routes,/\/api\/val\/email\/draft-brief/);
  assert.match(routes,/\/api\/val\/email\/draft-qa/);
  assert.match(routes,/\/api\/val\/email\/generate-draft/);
  assert.match(routes,/\/api\/val\/email\/revise-draft/);
  assert.match(routes,/\/api\/val\/email\/review-drafts/);
});

test('intelligence spine reads high-signal classifications and draft candidates',()=>{
  assert.match(spine,/listHighSignalClassifications/);
  assert.match(spine,/readyForYouDraftCandidates/);
  assert.match(spine,/conversation_classification/);
  assert.match(spine,/email_draft_readiness/);
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
  const result=await service.generateDraft({conversationId:'uc_phase4'});
  assert.equal(result.ok,true);
  assert.equal(result.no_external_action,true);
  assert.equal(result.revised_once,true);
  assert.equal(modelCalls,2);
  assert.equal(result.status,'ready_for_review');
  assert.equal(result.writer_output.subject,'Re: Partner workflow');
  for(const field of ['why_this_draft_exists','what_it_answers','what_it_does_not_answer','missing_context','tone_notes','representation_risk','approval_policy','confidence']){
    assert.ok(Object.hasOwn(result.writer_output,field),`missing writer field ${field}`);
  }
  assert.equal(result.qa.passes,true);
  assert.equal(savedDrafts.length,1);
  assert.equal(savedDrafts[0].provider,'internal');
  assert.equal(savedDrafts[0].sourceContext.source,'executive_inbox_review_only');
  assert.equal(savedDrafts[0].sourceContext.noProviderDraftCreated,true);
  const review=await service.reviewDrafts();
  assert.equal(review.drafts.length,1);
  const candidates=await service.listReadyForYouDraftCandidates();
  assert.equal(candidates[0].source,'executive_inbox_review_only');
  assert.equal(candidates[0].generatedDraft.id,'draft_1');
});
