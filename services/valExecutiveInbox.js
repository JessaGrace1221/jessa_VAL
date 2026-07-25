function safeArray(value){return Array.isArray(value)?value:[];}
function compactText(value,limit=900){return String(value||'').replace(/\s+/g,' ').trim().slice(0,limit);}
function normalizeEmail(value){const email=String(value||'').trim().toLowerCase();return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)?email:'';}
function jsonValue(value,fallback){if(value==null)return fallback;if(typeof value==='string'){try{return JSON.parse(value);}catch(_){return fallback;}}return value;}
function rowObject(row={}){
  const out={};
  for(const [k,v] of Object.entries(row||{}))out[k]=v instanceof Date?v.toISOString():v;
  return out;
}
function priorityScore(level){
  return {critical:5,high:4,medium:3,low:2,suppressed:1,unknown:0}[String(level||'unknown').toLowerCase()]||0;
}
function normalizePriority(score){
  if(score>=8)return 'critical';
  if(score>=5)return 'high';
  if(score>=3)return 'medium';
  if(score>=1)return 'low';
  return 'suppressed';
}
function sourceRefsFromContext(context={}){
  return safeArray(context.source_refs||context.sourceRefs).slice(0,12).map(ref=>({
    source_type:ref.source_type||ref.sourceType||'email_message',
    source_id:ref.source_id||ref.sourceId||ref.id||'',
    quote_or_summary:compactText(ref.quote_or_summary||ref.quoteOrSummary||ref.summary||'',500),
    confidence:Math.max(0,Math.min(1,Number(ref.confidence)||0.7)),
    created_at:ref.created_at||ref.createdAt||new Date().toISOString()
  }));
}
function textHaystack(context={}){
  const messages=[context.current_message,context.latest_inbound,context.latest_outbound].filter(Boolean);
  return [
    context.thread_summary,
    ...messages.flatMap(m=>[m.subject,m.bodyPreview,m.bodyText,m.snippet]),
    ...safeArray(context.open_questions).map(q=>q.text),
    ...safeArray(context.commitments).map(c=>c.text)
  ].join(' ').toLowerCase();
}
function detectExecutiveMeaning(context={}){
  const text=textHaystack(context);
  const meanings=[];
  if(/\b(trust|sorry|apolog|concern|frustrat|disappoint|repair|relationship|waiting|haven't heard)\b/.test(text))meanings.push('protect_trust');
  if(/\b(proposal|contract|invoice|pricing|deal|client|sale|opportunity|partner|partnership|intro|introduction|referral)\b/.test(text))meanings.push('protect_opportunity');
  if(/\b(promised|commit|due|deadline|send|share|review|follow up|waiting on|owed)\b/.test(text))meanings.push('protect_commitment');
  if(/\b(today|tomorrow|before|deadline|by end|urgent|asap|schedule|meeting|calendar|available)\b/.test(text))meanings.push('protect_timing');
  if(/\b(confidential|legal|payment|financial|sensitive|hr|medical|boundary)\b/.test(text))meanings.push('protect_reputation');
  if(/\b(overwhelmed|too much|burnout|capacity|exhausted|drained)\b/.test(text))meanings.push('protect_capacity');
  return meanings[0]||'protect_momentum';
}
function senderEmailFromContext(context={}){
  return normalizeEmail(context.sender_email||context.senderEmail||context.current_message?.from?.email||context.latest_inbound?.from?.email||context.latest_inbound?.sender?.email||context.from?.email);
}
function executiveContactSuppressionKey(sender={}){
  const domain=normalizeEmail('x@' + String(sender.domain||sender.fromDomain||'').replace(/^@/,'')).split('@')[1]||'';
  if(domain)return `domain:${domain}`;
  const email=normalizeEmail(sender.email||sender.senderEmail||sender.from?.email||sender);
  if(email)return `email:${email}`;
  const name=compactText(sender.name||sender.displayName||sender.senderName||'',120).toLowerCase();
  return name?`name:${name}`:'';
}
function inboundOutboundMetrics(context={}){
  const metrics=context.sender_metrics||context.senderMetrics||context.participant_metrics||context.participantMetrics||{};
  const inbound=Number(metrics.inbound_from_sender_count??metrics.inboundFromSenderCount??metrics.inbound_count??metrics.inboundCount??context.inbound_from_sender_count??context.inboundFromSenderCount??0)||0;
  const outbound=Number(metrics.outbound_to_sender_count??metrics.outboundToSenderCount??metrics.outbound_count??metrics.outboundCount??context.outbound_to_sender_count??context.outboundToSenderCount??0)||0;
  return {inboundFromSenderCount:inbound,outboundToSenderCount:outbound};
}
function hasManualExecutiveOverride(context={}){
  return !!(context.executive_contact_override||context.manual_executive_contact||context.user_marked_important||context.starred_by_user||context.manually_starred||context.relationship_override==='include');
}
function executiveInboxAdmissionDecision({context={},identity={},suppressedContacts=[]}={}){
  const senderEmail=senderEmailFromContext(context);
  const key=executiveContactSuppressionKey({email:senderEmail,name:context.current_message?.from?.name||context.latest_inbound?.from?.name||''});
  const suppressionKeys=new Set(safeArray(suppressedContacts).map(item=>typeof item==='string'?item:executiveContactSuppressionKey(item)).filter(Boolean));
  if((key&&suppressionKeys.has(key))||context.not_executive_contact||context.never_executive_contact){
    return {
      admitted:false,
      state:'noise',
      reason:'The user marked this sender as not an executive contact. VAL must not surface or borrow context from this contact.',
      rule:'manual_not_executive_contact',
      key
    };
  }
  const metrics=inboundOutboundMetrics(context);
  if(metrics.inboundFromSenderCount>3&&metrics.outboundToSenderCount===0&&!hasManualExecutiveOverride(context)){
    return {
      admitted:false,
      state:'noise',
      reason:'More than three inbound emails from this sender and zero sent replies from the user. This is inbox noise, not an executive relationship.',
      rule:'more_than_three_inbound_zero_sent',
      key,
      metrics
    };
  }
  const hasRelationshipEvidence=hasManualExecutiveOverride(context)||identity.match_status==='matched'||identity.match_status==='probable_match'||!!context.calendar_evidence||!!context.transcript_evidence||!!context.task_evidence;
  return {
    admitted:true,
    state:hasRelationshipEvidence?'relationship':'contact',
    reason:hasRelationshipEvidence?'Sender has evidence of executive relevance.':'Sender may exist as a lightweight contact, but has not earned deep relationship context.',
    rule:'admitted_by_relevance_evidence',
    key,
    metrics
  };
}
function classifyHeuristically({context={},identity={},teachVal=[]}={}){
  const text=textHaystack(context);
  const unknowns=[...safeArray(context.unknowns)];
  const admission=executiveInboxAdmissionDecision({context,identity,suppressedContacts:context.suppressedExecutiveContacts||context.notExecutiveContacts||[]});
  if(!admission.admitted){
    return {
      conversation_state:'complete',
      relationship_temperature:'unknown',
      executive_meaning:'protect_attention',
      priority_level:'suppressed',
      why_now:admission.reason,
      if_ignored:'Nothing important is lost by keeping this sender out of Executive Inbox unless the user explicitly reverses the suppression.',
      if_delayed:'Delay is acceptable. VAL should not spend cognitive space on this contact.',
      false_urgency_check:{possible_false_urgency:true,reason:'The sender did not pass Executive Inbox admission, regardless of urgency language.'},
      routing:{bucket:'inbox_noise',suggested_owner:'none',reason:admission.reason},
      approval_policy:'do_not_prepare',
      unknowns:[...unknowns,{source:'executive_inbox_admission',reason:admission.reason,rule:admission.rule}],
      confidence:0.92,
      source_refs:sourceRefsFromContext(context),
      executive_inbox_admission:admission
    };
  }
  const executiveMeaning=detectExecutiveMeaning(context);
  let score=0;
  if(context.waiting_on_user)score+=3;
  if(context.conversation_state==='waiting_on_user')score+=2;
  if(['sensitive','waiting','repairing','escalating'].includes(context.relationship_temperature))score+=2;
  if(identity.match_status==='matched')score+=1;
  if(identity.match_status==='ambiguous')unknowns.push({source:'identity_resolution',reason:'Identity is ambiguous; do not over-personalize or auto-route.'});
  if(/\b(today|tomorrow|deadline|before noon|by end|asap)\b/i.test(text))score+=2;
  if(/\b(proposal|contract|invoice|client|partner|intro|referral|pricing)\b/i.test(text))score+=2;
  if(/\b(newsletter|unsubscribe|receipt|promotion|webinar|digest|no-reply|noreply)\b/i.test(text))score-=3;
  const hasQuestion=safeArray(context.open_questions).length>0;
  const hasCommitment=safeArray(context.commitments).length>0;
  if(hasQuestion)score+=1;
  if(hasCommitment)score+=1;
  const priority=normalizePriority(score);
  const falseUrgency=/\b(urgent|asap|immediately)\b/i.test(text)&&!/(deadline|client|contract|proposal|payment|meeting|trust|waiting)/i.test(text);
  const routing={
    bucket:priorityScore(priority)>=4?'executive_attention':(priority==='medium'?'review_when_possible':'quiet'),
    suggested_owner:'user',
    reason:priorityScore(priority)>=4?'Consequence is meaningful enough for executive attention.':'No high-consequence signal detected yet.'
  };
  const approvalPolicy=/protect_reputation|protect_trust/.test(executiveMeaning)||/\b(apolog|pricing|contract|legal|boundary|sensitive|proposal|invoice)\b/i.test(text)
    ? 'approval_required'
    : 'auto_safe_to_prepare_only';
  const whyNow=context.waiting_on_user
    ? 'The latest durable signal suggests the conversation may be waiting on the user.'
    : (priorityScore(priority)>=4?'The consequence is meaningful even if the message itself is not loud.':'No immediate timing pressure is proven.');
  return {
    conversation_state:context.conversation_state||'unknown',
    relationship_temperature:context.relationship_temperature||'unknown',
    executive_meaning:executiveMeaning,
    priority_level:falseUrgency&&priority==='high'?'medium':priority,
    why_now:whyNow,
    if_ignored:priorityScore(priority)>=4?'Trust, timing, opportunity, or follow-through may degrade if this is ignored.':'Likely limited consequence if ignored, based on current evidence.',
    if_delayed:priorityScore(priority)>=4?'Delay could make the reply colder, less useful, or more expensive to repair.':'Delay appears acceptable unless new evidence changes the context.',
    false_urgency_check:{possible_false_urgency:falseUrgency,reason:falseUrgency?'Urgent language appears without strong consequence evidence.':'Consequence signals, not urgency language alone, drove the classification.'},
    routing,
    approval_policy:approvalPolicy,
    unknowns,
    confidence:Math.max(0.25,Math.min(0.9,0.35+(score*0.07)+(identity.match_status==='matched'?0.08:0)+(teachVal.length?0.04:0))),
    source_refs:sourceRefsFromContext(context),
    executive_inbox_admission:admission
  };
}
function inferDraftType(classification={},context={}){
  const text=textHaystack(context);
  if(classification.priority_level==='suppressed')return 'do_not_draft';
  if(/\b(apolog|sorry|concern|frustrated|repair)\b/i.test(text))return 'repair';
  if(/\b(schedule|available|calendar|meet|meeting)\b/i.test(text))return 'schedule';
  if(/\b(no|decline|not able|boundary)\b/i.test(text))return 'boundary';
  if(/\b(thank|appreciate)\b/i.test(text))return 'thank_you';
  if(context.waiting_on_user)return 'reply';
  return 'clarification';
}
function createDraftReadiness({context={},classification={}}={}){
  const missing=[];
  if(!context.current_message)missing.push('current_message');
  if(safeArray(context.open_questions).length&&/\?$/.test(compactText(context.open_questions[0]?.text||''))&&!/yes|no|available|send|share|review/i.test(context.open_questions[0]?.text||''))missing.push('answer_to_open_question');
  if(/\b(price|pricing|proposal|contract|legal|invoice)\b/i.test(textHaystack(context)))missing.push('commercial_or_legal_specifics');
  const representationRisk=/protect_reputation|protect_trust|protect_opportunity/.test(classification.executive_meaning||'')||/\b(apology|pricing|proposal|contract|legal|boundary|conflict|sensitive)\b/i.test(textHaystack(context))?'high':(context.waiting_on_user?'medium':'low');
  const status=classification.priority_level==='suppressed'?'do_not_draft':(missing.length?'needs_context':'ready_for_review');
  return {
    status,
    allowed_draft_type:status==='do_not_draft'?'do_not_draft':inferDraftType(classification,context),
    reason:status==='needs_context'?'A trustworthy draft needs more context before it can represent the user.':'VAL can prepare a review-only draft brief. Nothing should be sent.',
    representation_risk:representationRisk,
    missing_context:missing,
    approval_policy:representationRisk==='high'?'approval_required':classification.approval_policy||'approval_required',
    confidence:missing.length?0.45:0.72
  };
}
function createDraftBrief({context={},classification={},readiness={}}={}){
  const latest=context.latest_inbound||context.current_message||{};
  const purpose=readiness.status==='needs_context'
    ? 'Ask for or gather the missing context before drafting.'
    : (classification.executive_meaning==='protect_trust'?'Protect trust while answering clearly.':(classification.executive_meaning==='protect_opportunity'?'Move the opportunity forward without overcommitting.':'Continue the real conversation clearly.'));
  return {
    status:readiness.status,
    single_purpose:purpose,
    recipient:latest.from||{},
    recipient_next_step:readiness.status==='needs_context'?'Wait for the user to provide the missing answer/context.':'Know exactly what happens next after reading.',
    conversation_state:classification.conversation_state,
    relationship_temperature:classification.relationship_temperature,
    executive_meaning:classification.executive_meaning,
    draft_type:readiness.allowed_draft_type,
    representation_risk:readiness.representation_risk,
    must_include:safeArray(context.open_questions).slice(0,3).map(q=>q.text),
    avoid:['corporate filler','fake warmth','over-explaining','vague next steps','invented facts'],
    source_refs:sourceRefsFromContext(context)
  };
}
function runDraftQa({draftText='',draftBrief={},readiness={}}={}){
  const text=String(draftText||'');
  const issues=[];
  const filler=/\b(i hope this email finds you well|just wanted to reach out|circle back|touch base|at your earliest convenience|please do not hesitate|as per|utilize|leverage|synergy)\b/i;
  if(filler.test(text))issues.push('corporate_filler');
  if(/\bthrilled|delighted|incredible|amazing opportunity\b/i.test(text)&&!/\b(congrat|celebrat)\b/i.test(text))issues.push('fake_warmth');
  if(text.length>1800)issues.push('over_explaining');
  if(!/[?.!]$/.test(text.trim())&&text.trim())issues.push('unfinished_or_fragment');
  if(readiness.status==='needs_context')issues.push('draft_should_not_be_written_until_context_is_known');
  const nextStepOk=!!draftBrief.recipient_next_step&&(!text||/\b(can you|please|i will|i'll|next|send|review|confirm|available|let me know|call|schedule)\b/i.test(text));
  if(text&&!nextStepOk)issues.push('vague_next_step');
  const passes=!issues.length;
  return {
    passes,
    plainness_check:{passes:!issues.some(i=>['corporate_filler','fake_warmth','over_explaining','vague_next_step'].includes(i)),issues},
    representation_risk:draftBrief.representation_risk||readiness.representation_risk||'medium',
    approval_required:true,
    result:passes?'ready_for_human_review':'needs_revision',
    issues
  };
}
function clampConfidence(value,fallback=0.55){
  const n=Number(value);
  if(!Number.isFinite(n))return fallback;
  return Math.max(0,Math.min(1,n));
}
function firstText(...values){
  for(const value of values){
    const text=compactText(value,1200);
    if(text)return text;
  }
  return '';
}
function hasReadableDraftSource(context={},brief={}){
  const facts=extractConversationFacts(context,brief);
  const sourceText=facts.map(f=>f.text).join(' ').replace(/\s+/g,' ').trim();
  if(sourceText.length>=50)return true;
  return /\?/.test(sourceText) && sourceText.length>=24;
}
function extractConversationFacts(context={},brief={}){
  const facts=[];
  const push=(value,source='context')=>{
    const text=compactText(value,700);
    if(text&&!facts.some(f=>f.text===text))facts.push({source,text});
  };
  push(context.thread_summary,'thread_summary');
  for(const message of [context.current_message,context.latest_inbound,context.latest_outbound].filter(Boolean)){
    push(message.subject,'message_subject');
    push(message.bodyPreview||message.body_preview||message.snippet,'message_preview');
    push(message.bodyText||message.body_text,'message_body');
  }
  for(const q of safeArray(context.open_questions))push(q.text||q.summary,'open_question');
  for(const c of safeArray(context.commitments))push(c.text||c.summary,'commitment');
  for(const item of safeArray(brief.must_include))push(item,'brief_must_include');
  for(const ref of safeArray(brief.source_refs||context.source_refs))push(ref.quote_or_summary||ref.quoteOrSummary||ref.summary,'source_ref');
  return facts.slice(0,24);
}
function styleSignalsFromTeachVal(teachVal=[]){
  const items=safeArray(teachVal).slice(0,24);
  const joined=items.map(x=>[x.title,x.summary,x.text,x.content].filter(Boolean).join(': ')).join('\n');
  return {
    communication_style:compactText(joined.match(/(?:communication style|voice|tone|write|sound like)[\s\S]{0,500}/i)?.[0]||joined,900),
    do_not_sound_like:safeArray(items).flatMap(x=>safeArray(x.do_not_sound_like||x.doNotSoundLike)).concat((joined.match(/do not sound like[^.\n]+/ig)||[])).slice(0,10)
  };
}
function parseJsonObject(text){
  if(typeof text==='object'&&text)return text;
  const raw=String(text||'').trim();
  if(!raw)return {};
  try{return JSON.parse(raw);}catch(_){}
  const start=raw.indexOf('{'),end=raw.lastIndexOf('}');
  if(start>=0&&end>start){
    try{return JSON.parse(raw.slice(start,end+1));}catch(_){}
  }
  return {};
}
function normalizeDraftWriterOutput(output={},fallback={}){
  const missing=safeArray(output.missing_context||fallback.missing_context).map(x=>compactText(x,180)).filter(Boolean);
  const draftType=compactText(output.draft_type||fallback.draft_type||'reply',80);
  const approvalPolicy=output.approval_policy||fallback.approval_policy||'approval_required';
  const representationRisk=output.representation_risk||fallback.representation_risk||'medium';
  return {
    subject:compactText(output.subject||fallback.subject||'Reply for review',180),
    body:String(output.body||fallback.body||'').trim(),
    draft_type:draftType,
    why_this_draft_exists:compactText(output.why_this_draft_exists||fallback.why_this_draft_exists||'',700),
    what_it_answers:safeArray(output.what_it_answers||fallback.what_it_answers).map(x=>compactText(x,240)).filter(Boolean),
    what_it_does_not_answer:safeArray(output.what_it_does_not_answer||fallback.what_it_does_not_answer).map(x=>compactText(x,240)).filter(Boolean),
    missing_context:missing,
    tone_notes:compactText(output.tone_notes||fallback.tone_notes||'',700),
    representation_risk:representationRisk,
    approval_policy:representationRisk==='high'?'approval_required':approvalPolicy,
    confidence:clampConfidence(output.confidence,fallback.confidence||0.55)
  };
}
function localHoldingDraft({context={},brief={},readiness={},classification={}}={}){
  const latest=context.latest_inbound||context.current_message||{};
  const name=latest.from?.name||latest.from?.email||'there';
  const missing=safeArray(readiness.missing_context);
  const openQuestion=firstText(safeArray(context.open_questions)[0]?.text,context.required_answer,brief.must_include?.[0]);
  const subject=latest.subject?`Re: ${String(latest.subject).replace(/^re:\s*/i,'')}`:'Re: your note';
  const needsCommercial=missing.includes('commercial_or_legal_specifics');
  const body=needsCommercial
    ? `Hi ${name},\n\nI saw this and want to answer it carefully. I need to confirm the right details before I send pricing, terms, or specifics.\n\nI’ll come back with the clean answer once I have that in front of me.`
    : `Hi ${name},\n\nI saw this and want to answer it clearly. I need to confirm one thing before I give you the wrong answer${openQuestion?`: ${openQuestion}`:'.'}\n\nI’ll follow up with the clean answer once I have it.`;
  return normalizeDraftWriterOutput({
    subject,
    body,
    draft_type:readiness.status==='needs_context'?'holding':'reply',
    why_this_draft_exists:brief.single_purpose||'Keep the conversation warm without inventing missing information.',
    what_it_answers:readiness.status==='needs_context'?['Acknowledges the message and prevents silence.']:safeArray(brief.must_include),
    what_it_does_not_answer:missing.length?missing:['Anything not supported by the conversation context.'],
    missing_context:missing,
    tone_notes:'Plain, careful, and low-commitment because context is incomplete.',
    representation_risk:readiness.representation_risk||classification.representation_risk||'medium',
    approval_policy:readiness.approval_policy||classification.approval_policy||'approval_required',
    confidence:readiness.status==='needs_context'?0.5:0.62
  });
}
function buildDraftWriterPrompt({context={},classification={},readiness={},brief={},teachVal=[]}={}){
  const latest=context.latest_inbound||context.current_message||{};
  const style=styleSignalsFromTeachVal(teachVal);
  const facts=extractConversationFacts(context,brief);
  return {
    system:[
      'You write review-only email drafts for VAL.',
      'You never send, save to Gmail/Outlook, schedule, promise, attach, link, quote prices, invent dates, invent availability, or perform external action.',
      'Use only the provided conversation facts. If the answer is missing, write a clarifying or holding draft only.',
      'The draft must sound like the user continuing a real conversation, not generic AI.',
      'Return only JSON.'
    ].join('\n'),
    user:JSON.stringify({
      required_output_fields:['subject','body','draft_type','why_this_draft_exists','what_it_answers','what_it_does_not_answer','missing_context','tone_notes','representation_risk','approval_policy','confidence'],
      current_message:{subject:latest.subject||'',from:latest.from||{},preview:latest.bodyPreview||latest.body_preview||latest.snippet||''},
      draft_readiness:readiness,
      draft_brief:brief,
      conversation_context:{
        thread_summary:context.thread_summary||'',
        conversation_state:context.conversation_state||classification.conversation_state||'unknown',
        relationship_temperature:context.relationship_temperature||classification.relationship_temperature||'unknown',
        executive_meaning:classification.executive_meaning||brief.executive_meaning||'',
        open_questions:safeArray(context.open_questions).slice(0,8),
        commitments:safeArray(context.commitments).slice(0,8),
        required_specifics:safeArray(brief.must_include),
        facts
      },
      user_style:{
        communication_style:style.communication_style,
        writing_rules:compactText(brief.writingRules||brief.writing_rules||'',1200),
        do_not_sound_like:style.do_not_sound_like
      },
      hard_rules:[
        'No external actions.',
        'No Gmail or Outlook draft creation.',
        'Use writing_rules as style guidance only. Do not append, label, quote, or explain the writing rules in the email body.',
        'No invented dates, pricing, promises, links, attachments, or availability.',
        'High representation risk must have approval_policy approval_required.',
        'If missing_context is not empty, draft_type must be holding or clarification.'
      ]
    },null,2)
  };
}
function qaCheckGeneratedDraft({draft={},context={},brief={},readiness={},classification={}}={}){
  const subject=String(draft.subject||'');
  const body=String(draft.body||'');
  const text=`${subject}\n${body}`;
  const lower=text.toLowerCase();
  const facts=extractConversationFacts(context,brief).map(f=>f.text.toLowerCase()).join('\n');
  const checks={
    specificity:{passes:true,issues:[]},
    unsupported_claim:{passes:true,issues:[]},
    relationship_tone:{passes:true,issues:[]},
    recipient_next_step:{passes:true,issues:[]},
    plainness:{passes:true,issues:[]},
    length_generic:{passes:true,issues:[]}
  };
  const missing=safeArray(readiness.missing_context||draft.missing_context).filter(Boolean);
  if(!body.trim())checks.specificity.issues.push('empty_body');
  if(!subject.trim())checks.specificity.issues.push('empty_subject');
  if(missing.length&&!/holding|clarif/i.test(draft.draft_type||''))checks.specificity.issues.push('missing_context_requires_holding_or_clarification');
  if(safeArray(brief.must_include).length&&!missing.length){
    const covered=safeArray(brief.must_include).some(item=>lower.includes(compactText(item,80).toLowerCase().split(/\s+/).filter(w=>w.length>3)[0]||''));
    if(!covered)checks.specificity.issues.push('does_not_address_required_specifics');
  }
  const riskyUnsupported=[
    {name:'date_or_time',regex:/\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|monday|tuesday|wednesday|thursday|friday|saturday|sunday|today|tomorrow|\d{1,2}:\d{2}|\d{1,2}\/\d{1,2})\b/i},
    {name:'pricing_or_money',regex:/[$€£]\s?\d|\b\d+\s?(?:dollars|usd|percent|%)\b/i},
    {name:'link',regex:/https?:\/\/|www\./i},
    {name:'attachment',regex:/\b(attached|attachment|enclosed)\b/i},
    {name:'availability',regex:/\b(i am available|i'm available|i can meet|i can do|works for me|my calendar)\b/i}
  ];
  for(const item of riskyUnsupported){
    if(item.regex.test(text)&&!item.regex.test(facts))checks.unsupported_claim.issues.push(item.name);
  }
  if(/\b(i promise|guarantee|definitely|absolutely will|no problem)\b/i.test(text)&&!/promise|guarantee|definitely|no problem/i.test(facts))checks.unsupported_claim.issues.push('unsupported_promise');
  if((classification.executive_meaning==='protect_trust'||readiness.representation_risk==='high')&&/\b(no worries|all good|sure thing|sounds great)\b/i.test(text))checks.relationship_tone.issues.push('too_casual_for_high_trust_risk');
  if(/\b(i hope this email finds you well|just wanted to|circle back|touch base|at your earliest convenience|please do not hesitate|utilize|leverage|synergy)\b/i.test(text))checks.plainness.issues.push('corporate_or_ai_filler');
  const hasNextStep=/\b(can you|could you|please|i'll|i will|i need to confirm|let me know|send me|confirm|review|follow up|come back)\b/i.test(body);
  if(!hasNextStep)checks.recipient_next_step.issues.push('no_clear_next_step');
  if(body.length>1600)checks.length_generic.issues.push('too_long');
  if(body.length<40)checks.length_generic.issues.push('too_short');
  if(/\bthanks for reaching out\b/i.test(text)&&!facts.includes('thank'))checks.length_generic.issues.push('generic_opening');
  for(const check of Object.values(checks))check.passes=!check.issues.length;
  const issues=Object.entries(checks).flatMap(([name,check])=>check.issues.map(issue=>`${name}:${issue}`));
  const passes=!issues.length;
  return {
    passes,
    result:passes?'ready_for_human_review':(missing.length?'needs_context':'needs_revision'),
    specificity_check:checks.specificity,
    unsupported_claim_check:checks.unsupported_claim,
    relationship_tone_check:checks.relationship_tone,
    recipient_next_step_check:checks.recipient_next_step,
    plainness_check:checks.plainness,
    too_long_too_generic_check:checks.length_generic,
    issues,
    approval_required:true,
    representation_risk:readiness.representation_risk||draft.representation_risk||'medium',
    confidence:passes?Math.min(0.88,clampConfidence(draft.confidence,0.55)+0.08):Math.min(0.62,clampConfidence(draft.confidence,0.5))
  };
}
function buildRevisionPrompt({draft={},qa={},context={},classification={},readiness={},brief={},teachVal=[]}={}){
  const base=buildDraftWriterPrompt({context,classification,readiness,brief,teachVal});
  return {
    system:base.system,
    user:JSON.stringify({
      task:'Revise this review-only draft once so it passes QA. If missing context prevents a real answer, convert it to a holding or clarification draft.',
      qa_issues:qa.issues||[],
      qa,
      previous_draft:draft,
      original_context:parseJsonObject(base.user)
    },null,2)
  };
}

function createValExecutiveInboxService({
  dbQuery,
  hasPg=()=>false,
  getStore=()=>({}),
  saveStore=()=>{},
  uuid=(prefix)=>`${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`,
  tenantId=()=>'default',
  userId=()=>'default',
  conversationService,
  listTeachValCoreMemory=async()=>[],
  generateDraftWithModel,
  saveReviewDraft,
  listReviewDrafts,
  listSuppressedExecutiveContacts,
  saveSuppressedExecutiveContact,
  logger=console
}={}){
  function store(){
    const s=getStore()||{};
    if(!Array.isArray(s.conversationClassifications))s.conversationClassifications=[];
    if(!Array.isArray(s.emailDraftEvaluations))s.emailDraftEvaluations=[];
    if(!Array.isArray(s.reviewOnlyEmailDrafts))s.reviewOnlyEmailDrafts=[];
    if(!Array.isArray(s.suppressedExecutiveContacts))s.suppressedExecutiveContacts=[];
    return s;
  }
  async function getSuppressedExecutiveContacts(){
    if(typeof listSuppressedExecutiveContacts==='function')return safeArray(await listSuppressedExecutiveContacts());
    return store().suppressedExecutiveContacts.filter(r=>r.tenantId===tenantId()&&r.userId===userId());
  }
  async function markNotExecutiveContact(input={}){
    const sender=input.sender||input.contact||input.from||{};
    const email=normalizeEmail(input.email||sender.email);
    const name=compactText(input.name||sender.name||sender.displayName||'',180);
    const domain=String(input.domain||sender.domain||'').replace(/^@/,'').trim().toLowerCase();
    const key=executiveContactSuppressionKey({email,name});
    if(!key)throw new Error('email or name is required to suppress an executive contact.');
    const row={
      id:input.id||uuid('notexec'),
      tenantId:tenantId(),
      userId:userId(),
      key,
      email,
      name,
      reason:compactText(input.reason||'User marked this sender as not an executive contact.',400),
      rule:'manual_not_executive_contact',
      source:'user_one_click',
      createdAt:new Date().toISOString(),
      updatedAt:new Date().toISOString()
    };
    const domainRow=domain&&input.suppressDomain ? {
      ...row,
      id:input.domainId||uuid('notexec_domain'),
      key:`domain:${domain}`,
      email:'',
      name:domain,
      domain,
      reason:compactText(input.domainReason||`User marked ${domain} as not an executive contact domain.`,400),
      rule:'manual_not_executive_domain'
    } : null;
    if(typeof saveSuppressedExecutiveContact==='function')return {ok:true,suppression:await saveSuppressedExecutiveContact(row)};
    const s=store();
    const upsert=(candidate)=>{
      const existing=s.suppressedExecutiveContacts.find(item=>item.tenantId===tenantId()&&item.userId===userId()&&item.key===candidate.key);
      if(existing)Object.assign(existing,candidate,{id:existing.id,createdAt:existing.createdAt,updatedAt:new Date().toISOString()});
      else s.suppressedExecutiveContacts.unshift(candidate);
      return existing||candidate;
    };
    const saved=upsert(row);
    if(domainRow)upsert(domainRow);
    saveStore(s);
    return {ok:true,suppression:saved,domainSuppression:domainRow};
  }
  async function saveClassification(context,classification){
    const id=uuid('cclass');
    if(hasPg()){
      await dbQuery(`insert into conversation_classifications (id,tenant_id,user_id,unified_conversation_id,email_thread_id,current_message_id,conversation_state,relationship_temperature,executive_meaning,priority_level,why_now,if_ignored,if_delayed,false_urgency_check_json,routing_json,approval_policy,waiting_on_user,waiting_on_other,open_questions_json,commitments_json,unknowns_json,context_json,source_refs_json,confidence)
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)`,[
        id,tenantId(),userId(),context.conversationId||'',context.threadId||'',context.current_message?.messageId||context.currentMessage?.messageId||'',
        classification.conversation_state,classification.relationship_temperature,classification.executive_meaning,classification.priority_level,classification.why_now,classification.if_ignored,classification.if_delayed,JSON.stringify(classification.false_urgency_check),JSON.stringify(classification.routing),classification.approval_policy,!!context.waiting_on_user,!!context.waiting_on_other,JSON.stringify(context.open_questions||[]),JSON.stringify(context.commitments||[]),JSON.stringify(classification.unknowns||[]),JSON.stringify({...context,classification}),JSON.stringify(classification.source_refs||[]),classification.confidence
      ]);
      if(context.conversationId)await dbQuery('update unified_conversations set state=$1,relationship_temperature=$2,unknowns_json=$3,updated_at=now() where id=$4 and tenant_id=$5 and user_id=$6',[classification.conversation_state,classification.relationship_temperature,JSON.stringify(classification.unknowns||[]),context.conversationId,tenantId(),userId()]).catch(()=>{});
    }else{
      const s=store();
      s.conversationClassifications.unshift({id,tenantId:tenantId(),userId:userId(),unifiedConversationId:context.conversationId||'',emailThreadId:context.threadId||'',currentMessageId:context.current_message?.messageId||context.currentMessage?.messageId||'',...classification,contextJson:{...context,classification},createdAt:new Date().toISOString()});
      saveStore(s);
    }
    return id;
  }
  async function classifyConversation(input={}){
    if(!conversationService?.buildConversationContext)throw new Error('Conversation context builder is unavailable.');
    const context=await conversationService.buildConversationContext(input);
    let identity={ok:false,match_status:'no_match',unknowns:[{source:'identity_resolution',reason:'No sender available.'}]};
    const sender=context.current_message?.from||context.latest_inbound?.from||input.from||input.sender||{};
    if(conversationService.resolveIdentity&&sender&&(sender.email||sender.name)){
      identity=await conversationService.resolveIdentity(sender).catch(e=>({ok:false,match_status:'unknown',unknowns:[{source:'identity_resolution',reason:e.message}]}));
    }
    const teachVal=await listTeachValCoreMemory({limit:30}).catch(e=>([{title:'Teach VAL unavailable',summary:e.message}]));
    context.suppressedExecutiveContacts=await getSuppressedExecutiveContacts().catch(()=>[]);
    const classification=classifyHeuristically({context,identity,teachVal});
    classification.identity_resolution=identity;
    classification.teach_val_signals=safeArray(teachVal).slice(0,6);
    classification.id=await saveClassification(context,classification);
    logger.log?.(`[val-executive-inbox] classified ${context.conversationId||context.threadId||classification.id} ${classification.priority_level}`);
    return {ok:true,context,classification};
  }
  async function classifyBatch({limit=25,conversationIds=[]}={}){
    let ids=safeArray(conversationIds).filter(Boolean);
    if(!ids.length&&conversationService?.listRecentConversationSummaries){
      ids=(await conversationService.listRecentConversationSummaries({limit})).map(c=>c.id).filter(Boolean);
    }
    const results=[];
    for(const id of ids.slice(0,Math.max(1,Math.min(Number(limit)||25,100)))){
      results.push(await classifyConversation({conversationId:id}).catch(e=>({ok:false,conversationId:id,error:e.message})));
    }
    return {ok:true,count:results.length,classified:results.filter(r=>r.ok).length,results};
  }
  async function saveDraftEvaluation({context={},classification={},readiness={},brief={},qa={},evaluationType='readiness'}={}){
    const id=uuid('draftqa');
    const row={id,tenantId:tenantId(),userId:userId(),unifiedConversationId:context.conversationId||'',emailMessageId:context.current_message?.id||context.current_message?.messageId||'',evaluationType,status:readiness.status||qa.result||'ready_for_review',draftReadinessJson:readiness,draftBriefJson:brief,representationRisk:readiness.representation_risk||brief.representation_risk||qa.representation_risk||'medium',missingContextJson:readiness.missing_context||[],plainnessCheckJson:qa.plainness_check||{},qaResultJson:qa,sourceRefsJson:brief.source_refs||sourceRefsFromContext(context),confidence:readiness.confidence||qa.confidence||0,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
    if(hasPg()){
      await dbQuery(`insert into email_draft_evaluations (id,tenant_id,user_id,unified_conversation_id,email_message_id,evaluation_type,status,draft_readiness_json,draft_brief_json,representation_risk,missing_context_json,plainness_check_json,qa_result_json,source_refs_json,confidence)
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,[id,tenantId(),userId(),row.unifiedConversationId,row.emailMessageId,row.evaluationType,row.status,JSON.stringify(readiness),JSON.stringify(brief),row.representationRisk,JSON.stringify(row.missingContextJson),JSON.stringify(row.plainnessCheckJson),JSON.stringify(qa),JSON.stringify(row.sourceRefsJson),row.confidence]);
    }else{
      const s=store();s.emailDraftEvaluations.unshift(row);saveStore(s);
    }
    return row;
  }
  async function draftReadiness(input={}){
    const classified=input.classification&&input.context?{context:input.context,classification:input.classification}:await classifyConversation(input);
    const readiness=createDraftReadiness({context:classified.context,classification:classified.classification});
    const saved=await saveDraftEvaluation({context:classified.context,classification:classified.classification,readiness,evaluationType:'readiness'});
    return {ok:true,readiness,evaluation:saved,context:classified.context,classification:classified.classification};
  }
  async function draftBrief(input={}){
    const ready=input.readiness&&input.context&&input.classification?input:await draftReadiness(input);
    const brief=createDraftBrief({context:ready.context,classification:ready.classification,readiness:ready.readiness});
    const saved=await saveDraftEvaluation({context:ready.context,classification:ready.classification,readiness:ready.readiness,brief,evaluationType:'brief'});
    return {ok:true,draft_brief:brief,brief,readiness:ready.readiness,evaluation:saved,context:ready.context,classification:ready.classification};
  }
  async function draftQa(input={}){
    const briefed=input.brief&&input.context?input:await draftBrief(input);
    const qa=runDraftQa({draftText:input.draftText||input.body||'',draftBrief:briefed.brief||briefed.draft_brief,readiness:briefed.readiness});
    const saved=await saveDraftEvaluation({context:briefed.context,classification:briefed.classification,readiness:briefed.readiness,brief:briefed.brief||briefed.draft_brief,qa,evaluationType:'qa'});
    return {ok:true,qa,plainness_check:qa.plainness_check,evaluation:saved,readiness:briefed.readiness,draft_brief:briefed.brief||briefed.draft_brief};
  }
  async function callDraftWriter(payload){
    if(typeof generateDraftWithModel!=='function')return localHoldingDraft(payload);
    const prompt=buildDraftWriterPrompt(payload);
    const raw=await generateDraftWithModel({system:prompt.system,user:prompt.user,maxTokens:1800,temperature:0.25,json:true});
    return normalizeDraftWriterOutput(parseJsonObject(raw),{
      draft_type:payload.readiness?.status==='needs_context'?'holding':payload.readiness?.allowed_draft_type,
      missing_context:payload.readiness?.missing_context||[],
      representation_risk:payload.readiness?.representation_risk,
      approval_policy:payload.readiness?.approval_policy,
      confidence:0.6
    });
  }
  async function callDraftRevision(payload){
    if(typeof generateDraftWithModel!=='function')return localHoldingDraft(payload);
    const prompt=buildRevisionPrompt(payload);
    const raw=await generateDraftWithModel({system:prompt.system,user:prompt.user,maxTokens:1800,temperature:0.2,json:true});
    return normalizeDraftWriterOutput(parseJsonObject(raw),payload.draft);
  }
  async function persistReviewDraft({draft,context={},classification={},readiness={},brief={},qa={},revisionOf='',status}={}){
    const sourceContext={
      source:'executive_inbox_review_only',
      noExternalAction:true,
      noProviderDraftCreated:true,
      conversationId:context.conversationId||'',
      threadId:context.threadId||'',
      currentMessageId:context.current_message?.messageId||context.current_message?.id||'',
      classificationId:classification.id||'',
      executiveMeaning:classification.executive_meaning||brief.executive_meaning||'',
      relationshipTemperature:classification.relationship_temperature||context.relationship_temperature||'unknown',
      draftReadiness:readiness,
      draftBrief:brief,
      writingRules:brief.writingRules||brief.writing_rules||'',
      conversationContext:context,
      classification,
      writerOutput:draft,
      qa,
      revisionOf
    };
    const payload={
      draftType:draft.draft_type||readiness.allowed_draft_type||'email_reply',
      provider:'internal',
      subject:draft.subject,
      body:draft.body,
      status:status || (qa.result==='ready_for_human_review'?'ready_for_review':qa.result||'needs_context'),
      sourceContext
    };
    if(typeof saveReviewDraft==='function'){
      return saveReviewDraft(payload);
    }
    const id=uuid('reviewdraft');
    const row={id,tenantId:tenantId(),userId:userId(),...payload,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
    const s=store();s.reviewOnlyEmailDrafts.unshift(row);saveStore(s);return row;
  }
  async function generateDraft(input={}){
    const briefed=input.brief&&input.context?input:await draftBrief(input);
    const teachVal=await listTeachValCoreMemory({limit:30}).catch(()=>[]);
    const writingRules=compactText(input.writingRules || input.writing_rules || '',1200);
    const brief={
      ...(briefed.brief||briefed.draft_brief||{}),
      writingRules,
      writing_rules:writingRules,
      tone_requirements:[
        ...safeArray((briefed.brief||briefed.draft_brief||{}).tone_requirements),
        writingRules
      ].filter(Boolean)
    };
    const base={context:briefed.context,classification:briefed.classification,readiness:briefed.readiness,brief,teachVal};
    if(!hasReadableDraftSource(base.context,base.brief)){
      return {
        ok:false,
        status:'needs_source_content',
        needsThreadContent:true,
        message:'VAL could not load enough readable email content to prepare a source-backed draft. No generic reply was created.',
        readiness:{
          ...base.readiness,
          status:'needs_context',
          missing_context:Array.from(new Set([...(base.readiness?.missing_context||[]),'readable_email_thread_content']))
        },
        draft_brief:base.brief,
        context:base.context,
        classification:base.classification,
        no_external_action:true
      };
    }
    let draft=await callDraftWriter(base);
    let qa=qaCheckGeneratedDraft({...base,draft});
    let revised=false;
    if(!qa.passes&&qa.result==='needs_revision'&&!safeArray(base.readiness.missing_context).length){
      const revisedDraft=await callDraftRevision({...base,draft,qa});
      const revisedQa=qaCheckGeneratedDraft({...base,draft:revisedDraft});
      draft=revisedDraft;
      qa=revisedQa;
      revised=true;
    }
    const finalStatus=qa.passes?'ready_for_review':(qa.result==='needs_context'?'needs_context':'blocked');
    const saved=await persistReviewDraft({draft,qa,...base,status:finalStatus});
    await saveDraftEvaluation({context:base.context,classification:base.classification,readiness:base.readiness,brief:base.brief,qa:{...qa,writer_output:draft,revised_once:revised,saved_draft_id:saved.id},evaluationType:'generated_draft'});
    return {ok:true,draft:saved,writer_output:draft,qa,revised_once:revised,status:finalStatus,readiness:base.readiness,draft_brief:base.brief,context:base.context,classification:base.classification,no_external_action:true};
  }
  async function reviseDraft(input={}){
    let draft=input.draft||input.writer_output||{};
    if(!draft.id&&input.draftId&&typeof listReviewDrafts==='function'){
      const found=await listReviewDrafts({limit:100,source:'executive_inbox_review_only'}).catch(()=>[]);
      draft=safeArray(found).find(d=>String(d.id)===String(input.draftId))||draft;
    }
    const writerDraft=input.writer_output||draft.sourceContext?.writerOutput||draft;
    const context=input.context||draft.sourceContext?.conversationContext||{};
    const classification=input.classification||draft.sourceContext?.classification||{};
    const readiness=input.readiness||draft.sourceContext?.draftReadiness||{};
    const brief=input.brief||input.draft_brief||draft.sourceContext?.draftBrief||{};
    const teachVal=await listTeachValCoreMemory({limit:30}).catch(()=>[]);
    const qa=input.qa||qaCheckGeneratedDraft({draft:writerDraft,context,brief,readiness,classification});
    const revisedOutput=await callDraftRevision({draft:writerDraft,qa,context,classification,readiness,brief,teachVal});
    const revisedQa=qaCheckGeneratedDraft({draft:revisedOutput,context,brief,readiness,classification});
    const finalStatus=revisedQa.passes?'ready_for_review':(revisedQa.result==='needs_context'?'needs_context':'blocked');
    const saved=await persistReviewDraft({draft:revisedOutput,context,classification,readiness,brief,qa:revisedQa,revisionOf:input.draftId||draft.id||'',status:finalStatus});
    return {ok:true,draft:saved,writer_output:revisedOutput,qa:revisedQa,status:finalStatus,no_external_action:true};
  }
  async function reviewDrafts({limit=50,status=''}={}){
    const lim=Math.max(1,Math.min(Number(limit)||50,100));
    if(typeof listReviewDrafts==='function'){
      const rows=await listReviewDrafts({limit:lim,status,source:'executive_inbox_review_only'});
      return {ok:true,drafts:safeArray(rows).slice(0,lim)};
    }
    const rows=store().reviewOnlyEmailDrafts.filter(r=>r.tenantId===tenantId()&&r.userId===userId()&&(!status||r.status===status)).slice(0,lim);
    return {ok:true,drafts:rows};
  }
  async function listHighSignalClassifications({limit=12}={}){
    const lim=Math.max(1,Math.min(Number(limit)||12,50));
    if(hasPg()){
      const r=await dbQuery(`select * from conversation_classifications where tenant_id=$1 and user_id=$2 and priority_level in ('critical','high','medium') order by case priority_level when 'critical' then 1 when 'high' then 2 when 'medium' then 3 else 4 end, created_at desc limit $3`,[tenantId(),userId(),lim]);
      return r.rows.map(row=>({id:row.id,conversationId:row.unified_conversation_id,threadId:row.email_thread_id,currentMessageId:row.current_message_id,conversationState:row.conversation_state,relationshipTemperature:row.relationship_temperature,executiveMeaning:row.executive_meaning,priorityLevel:row.priority_level,whyNow:row.why_now,ifIgnored:row.if_ignored,ifDelayed:row.if_delayed,routing:jsonValue(row.routing_json,{}),approvalPolicy:row.approval_policy,unknowns:jsonValue(row.unknowns_json,[]),confidence:Number(row.confidence||0),sourceRefs:jsonValue(row.source_refs_json,[]),context:jsonValue(row.context_json,{}),createdAt:row.created_at?.toISOString?.()||row.created_at||''}));
    }
    return store().conversationClassifications.filter(r=>r.tenantId===tenantId()&&r.userId===userId()&&priorityScore(r.priority_level||r.priorityLevel)>=3).slice(0,lim);
  }
  async function listReadyForYouDraftCandidates({limit=8}={}){
    const lim=Math.max(1,Math.min(Number(limit)||8,30));
    const generated=typeof listReviewDrafts==='function'
      ? await listReviewDrafts({limit:lim,status:'ready_for_review',source:'executive_inbox_review_only'}).catch(()=>[])
      : store().reviewOnlyEmailDrafts.filter(r=>r.tenantId===tenantId()&&r.userId===userId()&&r.status==='ready_for_review').slice(0,lim);
    const rows=hasPg()
      ? (await dbQuery(`select * from email_draft_evaluations where tenant_id=$1 and user_id=$2 and status in ('ready_for_review','needs_context') order by created_at desc limit $3`,[tenantId(),userId(),lim])).rows.map(row=>({id:row.id,conversationId:row.unified_conversation_id,status:row.status,draftReadiness:jsonValue(row.draft_readiness_json,{}),draftBrief:jsonValue(row.draft_brief_json,{}),representationRisk:row.representation_risk,missingContext:jsonValue(row.missing_context_json,[]),qaResult:jsonValue(row.qa_result_json,{}),sourceRefs:jsonValue(row.source_refs_json,[]),createdAt:row.created_at?.toISOString?.()||row.created_at||''}))
      : store().emailDraftEvaluations.filter(r=>r.tenantId===tenantId()&&r.userId===userId()&&['ready_for_review','needs_context'].includes(r.status)).slice(0,lim);
    return [
      ...safeArray(generated).map(d=>({id:d.id,conversationId:d.sourceContext?.conversationId||d.sourceContext?.sourceContext?.conversationId||'',status:d.status||'ready_for_review',draftReadiness:d.sourceContext?.draftReadiness||{},draftBrief:d.sourceContext?.draftBrief||{},generatedDraft:d,representationRisk:d.sourceContext?.writerOutput?.representation_risk||d.sourceContext?.draftReadiness?.representation_risk||'medium',missingContext:d.sourceContext?.writerOutput?.missing_context||[],qaResult:d.sourceContext?.qa||{},sourceRefs:d.sourceContext?.draftBrief?.source_refs||[],createdAt:d.createdAt||d.created_at||'',source:'executive_inbox_review_only'})),
      ...rows
    ].slice(0,lim);
  }
  return {classifyConversation,classifyBatch,draftReadiness,draftBrief,draftQa,generateDraft,reviseDraft,reviewDrafts,listHighSignalClassifications,listReadyForYouDraftCandidates,markNotExecutiveContact};
}

module.exports={createValExecutiveInboxService,classifyHeuristically,createDraftReadiness,createDraftBrief,runDraftQa,qaCheckGeneratedDraft,normalizeDraftWriterOutput,executiveInboxAdmissionDecision,executiveContactSuppressionKey};
