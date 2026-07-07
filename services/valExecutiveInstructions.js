function safeArray(value){return Array.isArray(value)?value:[];}
function compactText(value,limit=900){return String(value||'').replace(/\s+/g,' ').trim().slice(0,limit);}
function normalizeSourceRef(ref={}){
  return {
    source_type:String(ref.source_type||ref.sourceType||ref.type||'unknown'),
    source_id:String(ref.source_id||ref.sourceId||ref.id||''),
    quote_or_summary:compactText(ref.quote_or_summary||ref.quoteOrSummary||ref.summary||ref.quote||'',900),
    confidence:Math.max(0,Math.min(1,Number(ref.confidence)||0)),
    created_at:ref.created_at||ref.createdAt||new Date().toISOString()
  };
}
function linesFromText(text=''){
  return String(text||'').replace(/\r/g,'\n').split(/\n+/).map(l=>l.trim()).filter(Boolean);
}
function sourceRef({sourceType='chat',sourceId='',quote='',confidence=0.8}={}){
  return normalizeSourceRef({sourceType,sourceId,quoteOrSummary:quote,confidence});
}
function speakerInfo(line='',context={}){
  const authenticatedNames=safeArray(context.authenticatedUserNames).concat(['you','user','owner','jessa']).map(n=>String(n||'').toLowerCase());
  const match=String(line||'').match(/^\s*([^:\n]{1,80}):\s*(.+)$/);
  if(!match){
    const trusted=/^(chat|voice)$/i.test(context.sourceType||'chat')||context.trustedAuthenticatedUser===true;
    return {speaker:'authenticated_user',text:line,authenticatedUserSpoke:trusted,speakerConfidence:trusted?0.95:0.55};
  }
  const speaker=match[1].trim(),text=match[2].trim(),low=speaker.toLowerCase();
  const authenticated=authenticatedNames.some(n=>n&&low===n)||/\b(jessa|owner|user|you)\b/i.test(speaker);
  return {speaker,text,authenticatedUserSpoke:authenticated,speakerConfidence:authenticated?0.92:0.35};
}
function instructionType(text=''){
  const s=String(text||'').toLowerCase();
  if(/\b(never mind|disregard|stop|cancel|don't do that|do not do that|revoke|undo permission)\b/.test(s))return 'revocation';
  if(/\b(you can|you may|permission|go ahead and|yes[, ]+(send|schedule|publish|update|do it))\b/.test(s))return 'permission';
  if(/\b(remind me|remember to|follow up with me)\b/.test(s))return 'reminder';
  if(/\?$/.test(s)||/^(can|could|would|should|what|why|how)\b/.test(s))return 'question';
  if(/\b(what if|imagine|hypothetically|suppose)\b/.test(s))return 'hypothetical';
  if(/\b(idea|maybe|we could|could build|brainstorm|let's think)\b/.test(s))return 'brainstorm';
  if(/\b(i wonder|maybe val|could val|would be nice)\b/.test(s))return 'idea';
  if(/\b(val[, ]+)?(please\s+)?(create|send|schedule|block|draft|research|update|remind|build|prepare|write|make|add|move|publish|go ahead and)\b/.test(s))return 'command';
  if(/\b(i need you to|can you|could you|please|let's)\b/.test(s))return 'request';
  return 'idea';
}
function requestedAction(text=''){
  const s=String(text||'').toLowerCase();
  if(/\b(charge|collect payment|run payment)\b/.test(s))return {action:'charge_money',targetSystem:'billing',external:true,never:true};
  if(/\b(delete|erase|remove permanently)\b/.test(s))return {action:'delete_record',targetSystem:'val_or_crm',external:true,never:true};
  if(/\b(merge contacts|merge records)\b/.test(s))return {action:'merge_contacts',targetSystem:'crm',external:true,never:true};
  if(/\b(security|privacy|billing setting|api key|password|permission setting)\b/.test(s))return {action:'change_security_privacy_billing_settings',targetSystem:'settings',external:true,never:true};
  if(/\b(make|send|draft|write|create|set up)\b/.test(s)&&/\b(intro|introduction|introduce|connect)\b/.test(s))return {action:/\b(send|make|set up)\b/.test(s)?'make_introduction':'draft_introduction',targetSystem:'email',external:/\b(send|make|set up)\b/.test(s)};
  if(/\b(send|email|mail)\b/.test(s)&&/\b(email|mail|message|reply|draft)\b/.test(s))return {action:/\bdraft\b/.test(s)?'create_draft':'send_email',targetSystem:'email',external:!/\bdraft\b/.test(s)};
  if(/\b(text|sms)\b/.test(s)&&/\b(send|message)\b/.test(s))return {action:'send_sms',targetSystem:'sms',external:true};
  if(/\b(send|create|prepare)\b/.test(s)&&/\bproposal\b/.test(s))return {action:/\bsend\b/.test(s)?'send_proposal':'prepare_proposal',targetSystem:'crm',external:/\bsend\b/.test(s)};
  if(/\b(send|create|prepare)\b/.test(s)&&/\binvoice\b/.test(s))return {action:/\bsend\b/.test(s)?'send_invoice':'prepare_invoice',targetSystem:'crm',external:/\bsend\b/.test(s)};
  if(/\b(draft|write|create|prepare|make)\b/.test(s)&&/\b(agreement|statement of work|sow|project plan|website copy|marketing copy|social post|documentation|report|technical specification|spec|agenda|executive summary|research brief)\b/.test(s))return {action:'create_draft',targetSystem:'val_workspace',external:false};
  if(/\b(block|hold|protect)\b/.test(s)&&/\b(calendar|time|morning|afternoon|day|slot)\b/.test(s))return {action:'create_calendar_hold',targetSystem:'calendar',external:true};
  if(/\b(schedule|book|set|set up|invite)\b/.test(s)&&/\b(meeting|call|calendar|invite|appointment)\b/.test(s))return {action:'send_calendar_invite',targetSystem:'calendar',external:true};
  if(/\b(move|advance|update)\b/.test(s)&&/\b(crm|stage|pipeline|opportunity)\b/.test(s))return {action:'move_crm_stage',targetSystem:'crm',external:true};
  if(/\b(tag|untag|add tag|remove tag)\b/.test(s))return {action:'add_or_remove_tag',targetSystem:'crm',external:true};
  if(/\b(publish|post|launch)\b/.test(s))return {action:'publish_content',targetSystem:'publishing',external:true};
  if(/\b(update|add|write)\b/.test(s)&&/\b(crm|contact|note|record)\b/.test(s))return {action:'create_crm_note',targetSystem:'crm',external:true};
  if(/\b(remind me|make.*task|create.*task|add.*task)\b/.test(s))return {action:'create_task',targetSystem:'val_tasks',external:false};
  if(/\b(research)\b/.test(s))return {action:'research',targetSystem:'web_or_internal_research',external:false};
  if(/\b(build|create|make|code|redesign|implement|scaffold|generate)\b/.test(s)&&/\b(page|landing|site|app|workflow|html|css|javascript|react|component|python|script|sql|migration|api|integration|database|schema|dashboard|repository|repo|branch|commit|pull request|pr|automation)\b/.test(s))return {action:'build_artifact',targetSystem:'val_workspace',external:false};
  if(/\b(analyze|summarize)\b/.test(s))return {action:'analyze',targetSystem:'val_memory',external:false};
  return {action:'prepare_only',targetSystem:'val',external:false};
}
function targetFromText(text=''){
  const raw=String(text||'');
  const email=(raw.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)||[])[0]||'';
  if(email)return email;
  const to=(raw.match(/\b(?:to|with|for)\s+([A-Z][A-Za-z0-9' -]{1,60})(?:\b|$)/)||[])[1]||'';
  if(to&&!/^(the|my|a|an|this|that|calendar|proposal|invoice|email|message|meeting|call)$/i.test(to))return to.trim();
  return '';
}
function ambiguityFor(text='',action={}){
  const ambiguity=[];
  const target=targetFromText(text);
  if(action.external&&['send_email','send_sms','send_proposal','send_invoice','send_calendar_invite','move_crm_stage','add_or_remove_tag','create_crm_note','make_introduction'].includes(action.action)&&!target)ambiguity.push('target_identity_unresolved');
  if(action.action==='make_introduction'&&!/\b(to|with|and|between|intro|introduction|introduce|connect)\b/i.test(text))ambiguity.push('introduction_parties_unclear');
  if(action.action==='send_email'&&!/\b(email|reply|message|draft|subject|about|to)\b/i.test(text))ambiguity.push('email_content_unclear');
  if(action.action==='create_calendar_hold'&&!/\b(today|tomorrow|monday|tuesday|wednesday|thursday|friday|morning|afternoon|\d)/i.test(text))ambiguity.push('calendar_time_unclear');
  return ambiguity;
}
function blockingRules(text='',action={}){
  const blocking=[];
  if(action.never)blocking.push('never_auto_action');
  if(/\b(bulk|everyone|all contacts|entire list|all clients)\b/i.test(text))blocking.push('bulk_external_action');
  if(/\b(legal advice|medical advice|diagnos|investment advice|financial commitment|binding agreement)\b/i.test(text))blocking.push('high_stakes_commitment');
  if(action.action==='send_invoice')blocking.push('financial_action_requires_review');
  return blocking;
}
function authorizationFor({type,action,authenticatedUserSpoke,speakerConfidence,ambiguity,blocking}){
  if(!authenticatedUserSpoke||speakerConfidence<0.75)return 'approval_required';
  if(blocking.length)return action.never?'never_auto':'approval_required';
  if(ambiguity.length)return 'approval_required';
  if(['command','delegation','permission'].includes(type)&&action.external)return 'voice_authorized';
  if(['command','request','delegation','permission','reminder'].includes(type)&&!action.external)return 'prepare_only';
  return 'prepare_only';
}
function nextStepFor({authorization,ambiguity,blocking,external}){
  if(authorization==='never_auto'||blocking.includes('never_auto_action'))return 'block';
  if(blocking.length)return 'block';
  if(ambiguity.length)return 'ask_clarification';
  if(authorization==='voice_authorized'&&external)return 'execute_later_packet';
  if(authorization==='prepare_only')return 'prepare_only';
  return 'ask_clarification';
}
function extractExecutiveInstructions({text='',sourceType='chat',sourceId='',authenticatedUserNames=[],trustedAuthenticatedUser=false,createdAt=new Date().toISOString()}={}){
  const rows=linesFromText(text);
  const candidates=[];
  for(const line of rows){
    const info=speakerInfo(line,{sourceType,authenticatedUserNames,trustedAuthenticatedUser});
    const raw=info.text||'';
    if(!/\b(val|create|send|schedule|block|draft|research|update|remind|build|go ahead|prepare|write|make|add|move|publish|delete|charge|invoice|proposal|intro|introduction|introduce|connect|appointment)\b/i.test(raw))continue;
    const type=instructionType(raw);
    if(['idea','brainstorm','hypothetical','question'].includes(type)&&!/\bval\b/i.test(raw))continue;
    const action=requestedAction(raw);
    const ambiguity=ambiguityFor(raw,action);
    const blocking=blockingRules(raw,action);
    const authorization=authorizationFor({type,action,authenticatedUserSpoke:info.authenticatedUserSpoke,speakerConfidence:info.speakerConfidence,ambiguity,blocking});
    const target=targetFromText(raw);
    candidates.push({
      instruction:compactText(raw,900),
      instruction_type:type,
      requested_action:action.action,
      target_system:action.targetSystem,
      target_person_or_record:target,
      external_action:!!action.external,
      authorization,
      authenticated_user_spoke:!!info.authenticatedUserSpoke,
      speaker_confidence:info.speakerConfidence,
      ambiguity,
      conflicts:[],
      blocking_safety_rules:blocking,
      recommended_next_step:nextStepFor({authorization,ambiguity,blocking,external:action.external}),
      source_refs:[sourceRef({sourceType,sourceId,quote:raw,confidence:info.speakerConfidence})],
      confidence:Math.min(0.95,Math.max(0.35,info.speakerConfidence-(ambiguity.length?0.18:0)-(blocking.length?0.22:0))),
      authorization_source:sourceType,
      authorization_event_id:sourceId,
      authorization_quote:compactText(raw,900),
      authenticated_user_confirmed:!!info.authenticatedUserSpoke&&info.speakerConfidence>=0.75,
      authorization_created_at:createdAt
    });
  }
  for(let i=0;i<candidates.length;i++){
    const curr=candidates[i];
    if(curr.instruction_type==='revocation'){
      for(const prev of candidates.slice(0,i)){
        if(prev.target_system===curr.target_system||prev.requested_action===curr.requested_action){
          prev.conflicts.push({type:'later_revocation',instruction:curr.instruction});
          prev.authorization='approval_required';
          prev.recommended_next_step='ask_clarification';
        }
      }
    }
  }
  return {executive_instructions:candidates};
}

module.exports={extractExecutiveInstructions,requestedAction,instructionType};
