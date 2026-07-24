function safeArray(value){return Array.isArray(value)?value:[];}
function jsonValue(value,fallback){if(value==null)return fallback;if(typeof value==='string'){try{return JSON.parse(value);}catch(_){return fallback;}}return value;}
function compactText(value='',limit=400){return String(value||'').replace(/\s+/g,' ').trim().slice(0,limit);}
function stableKey(value=''){return String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'').slice(0,180)||'commitment';}
function nowIso(){return new Date().toISOString();}

function parseDueHint(text='',now=new Date()){
  const raw=String(text||'').toLowerCase();
  const base=new Date(now);
  if(/\btoday\b/.test(raw))return base.toISOString();
  if(/\btomorrow\b/.test(raw)){base.setDate(base.getDate()+1);return base.toISOString();}
  if(/\bnext week\b/.test(raw)){base.setDate(base.getDate()+7);return base.toISOString();}
  const weekdays={sunday:0,monday:1,tuesday:2,wednesday:3,thursday:4,friday:5,saturday:6};
  const found=Object.keys(weekdays).find(day=>new RegExp(`\\b${day}\\b`).test(raw));
  if(found){
    const delta=(weekdays[found]-base.getDay()+7)||7;
    base.setDate(base.getDate()+delta);
    return base.toISOString();
  }
  return null;
}

function ownerFromText(text='',direction='',explicitOwner=''){
  const s=String(text||'').toLowerCase();
  const owner=String(explicitOwner||'').toLowerCase();
  if(owner==='user_or_team')return 'user';
  if(owner==='other')return 'contact';
  if(/\b(i will|i'll|we will|we'll|i can|we can|i need to|we need to)\b/.test(s))return direction==='inbound'?'contact':'user';
  if(/\b(can you|could you|please|you will|you'll|need you to)\b/.test(s))return direction==='outbound'?'contact':'user';
  return 'unknown';
}

function priorityFor(commitment={}){
  const text=[commitment.title,commitment.description,commitment.evidence_quote,commitment.due_hint].join(' ').toLowerCase();
  if(/\burgent|today|asap|before\b/.test(text))return 'urgent';
  if(/\btomorrow|friday|monday|deadline|signed|approval|proposal|contract\b/.test(text))return 'high';
  return 'normal';
}

function commitmentSeedText(seed={}){
  return compactText([
    seed.title,
    seed.summary,
    seed.description,
    seed.text,
    seed.source_quote,
    seed.sourceQuote,
    seed.evidence_quote,
    seed.evidenceQuote
  ].filter(Boolean).join(' '),1200);
}

function looksLikeTranscriptNoise(text=''){
  const value=String(text||'').trim();
  if(!value)return true;
  if(value.length<12)return true;
  if(/^\s*(?:i'?m going to|i am going to|we'?re going to|we are going to)\s*(?:\.{0,3})?\s*$/i.test(value))return true;
  return /\b(vulgar|coffee takes a deep breath|morning face|stop watching everything|that was my child|sorry,? that was|i don'?t like it|unintelligible audio|recording download link)\b/i.test(value);
}

function hasExecutiveCommitmentShape(seed={}){
  const text=commitmentSeedText(seed);
  if(looksLikeTranscriptNoise(text))return false;
  const explicit=String(seed.owner||seed.owner_type||seed.ownerType||seed.assignedToName||seed.owner_name||seed.ownerName||'').trim();
  const actionVerb=/\b(send|email|text|call|reach out|follow up|schedule|book|confirm|approve|review|finish|fix|create|draft|prepare|introduce|share|deliver|update|check|research|organize|build|scrape|handoff|hand off|circle back|respond|reply|set up|connect|meet with)\b/i.test(text);
  const commitmentLanguage=/\b(i will|i'll|i need to|i have to|jessa to|jessa will|we will|we'll|we need to|we have to|val should|val needs to|[^.]{2,40}\bto\s+(?:send|email|text|call|reach out|follow up|schedule|book|confirm|approve|review|finish|fix|create|draft|prepare|introduce|share|deliver|update|check|research|organize|build|scrape|handoff|hand off|respond|reply|set up|connect|meet with))\b/i.test(text);
  const hasTarget=/\b(to|with|for|about|before|by|on)\b\s+[A-Z0-9][A-Za-z0-9@._-]{2,}/.test(text)
    || /\b(send|email|text|call|reach out|follow up|schedule|book|confirm|approve|review|finish|fix|create|draft|prepare|introduce|share|deliver|update|check|research|organize|build|scrape|handoff|hand off|reply|set up)\s+[A-Z0-9][A-Za-z0-9@._-]{2,}/.test(text)
    || /\b(proposal|dashboard|handoff|email|meeting|call|draft|contract|calendar|pipeline|crm|transcript|document|introduction|follow[- ]?up|legal|chapter|feedback)\b/i.test(text);
  const confident=Number(seed.confidence_score||seed.confidenceScore||seed.confidence||0);
  return Boolean(((explicit&&actionVerb)||(commitmentLanguage&&(hasTarget||actionVerb))||(actionVerb&&hasTarget)) && (!confident || confident>=0.6));
}

function riskFor(commitment={}){
  const text=[commitment.title,commitment.description,commitment.evidence_quote].join(' ').toLowerCase();
  if(/\bcontract|legal|pricing|proposal|signed|approval|client|deadline|overdue\b/.test(text))return 'high';
  if(/\bfollow up|send|review|schedule|introduce|waiting\b/.test(text))return 'medium';
  return 'low';
}

function findContactByName(name='',contacts=[]){
  const target=String(name||'').trim().toLowerCase();
  if(!target)return null;
  return contacts.find(contact=>{
    const names=[contact.name,contact.contactName,contact.fullName,contact.email].filter(Boolean).map(v=>String(v).toLowerCase());
    return names.some(value=>value===target||value.includes(target)||target.includes(value));
  })||null;
}

function firstParticipantName(value){
  const participants=safeArray(value);
  const found=participants.find(p=>p&&typeof p==='object'&&(p.name||p.email));
  return found?.name||found?.email||'';
}

function applyOverride(commitment,override={}){
  if(!override)return commitment;
  return {
    ...commitment,
    status:override.status||commitment.status,
    owner_type:override.owner_type||commitment.owner_type,
    owner_name:override.owner_name||commitment.owner_name,
    owner_contact_id:override.owner_contact_id||commitment.owner_contact_id,
    task_id:override.task_id||commitment.task_id,
    draft_id:override.draft_id||commitment.draft_id,
    updated_at:override.updated_at||commitment.updated_at,
    last_touched_at:override.last_touched_at||commitment.last_touched_at,
    dismissal_reason:override.dismissal_reason||commitment.dismissal_reason
  };
}

function normalizeCommitment(seed={},contacts=[],overrides={}){
  const evidence=compactText(seed.evidence_quote||seed.source_quote||seed.summary||seed.description||seed.title,900);
  const dueAt=seed.due_at||seed.dueAt||parseDueHint(seed.due_hint||evidence);
  const ownerType=seed.owner_type||seed.ownerType||ownerFromText(evidence,seed.direction,seed.owner);
  const counterpartyName=seed.counterparty_name||seed.counterpartyName||seed.counterpartyNameHint||'';
  const ownerName=seed.owner_name||seed.ownerName||(ownerType==='user'?'Jessa':seed.ownerNameHint||(ownerType==='contact'?counterpartyName:''));
  const ownerContact=findContactByName(ownerName,contacts);
  const counterpartyContact=findContactByName(counterpartyName,contacts);
  const id=seed.id||stableKey(['commitment',seed.source_type||seed.sourceType,seed.source_id||seed.sourceId,evidence].join(':'));
  const commitment={
    id,
    title:compactText(seed.title||evidence||'Commitment',120),
    description:compactText(seed.description||seed.summary||evidence,500),
    owner_type:ownerType,
    owner_contact_id:seed.owner_contact_id||seed.ownerContactId||ownerContact?.contactId||ownerContact?.id||'',
    owner_name:ownerName||ownerContact?.name||ownerContact?.email||'Unknown',
    counterparty_contact_id:seed.counterparty_contact_id||seed.counterpartyContactId||counterpartyContact?.contactId||counterpartyContact?.id||'',
    counterparty_name:counterpartyName||counterpartyContact?.name||counterpartyContact?.email||'',
    source_type:seed.source_type||seed.sourceType||'manual',
    source_id:seed.source_id||seed.sourceId||'',
    source_title:seed.source_title||seed.sourceTitle||'',
    evidence_quote:evidence,
    evidence_summary:compactText(seed.evidence_summary||seed.evidenceSummary||seed.description||evidence,500),
    status:seed.status||(!dueAt?'open':(new Date(dueAt)<new Date()?'overdue':'waiting')),
    priority:seed.priority||priorityFor(seed),
    risk_level:seed.risk_level||seed.riskLevel||riskFor(seed),
    due_at:dueAt,
    created_at:seed.created_at||seed.createdAt||nowIso(),
    updated_at:seed.updated_at||seed.updatedAt||nowIso(),
    last_touched_at:seed.last_touched_at||seed.lastTouchedAt||seed.created_at||seed.createdAt||nowIso(),
    next_action:seed.next_action||seed.nextAction||'Review commitment and decide the next accountable move.',
    suggested_action_type:seed.suggested_action_type||seed.suggestedActionType||(/send|follow up|reply/i.test(evidence)?'draft_email':'create_task'),
    draft_id:seed.draft_id||seed.draftId||'',
    task_id:seed.task_id||seed.taskId||'',
    crm_contact_id:seed.crm_contact_id||seed.crmContactId||ownerContact?.contactId||counterpartyContact?.contactId||'',
    crm_company_id:seed.crm_company_id||seed.crmCompanyId||ownerContact?.companyId||counterpartyContact?.companyId||'',
    confidence_score:Number(seed.confidence_score||seed.confidenceScore||seed.confidence||0.64)
  };
  if(commitment.owner_type==='contact'&&!commitment.owner_contact_id)commitment.status='needs_resolution';
  return applyOverride(commitment,overrides[id]);
}

function transcriptSeeds(runs=[]){
  return safeArray(runs).flatMap(run=>{
    const commitments=jsonValue(run.commitmentsJson||run.commitments_json,[]);
    const linkage=jsonValue(run.linkageJson||run.linkage_json,{});
    const people=safeArray(linkage.linked_people||linkage.linkedPeople);
    const counterparty=firstParticipantName(people);
    return safeArray(commitments).filter(hasExecutiveCommitmentShape).map((c,index)=>({
      ...c,
      id:stableKey(['commitment','transcript',run.transcriptId||run.transcript_id||run.id,c.id||index].join(':')),
      source_type:'transcript',
      source_id:run.transcriptId||run.transcript_id||run.id,
      source_title:run.finalJson?.title||run.final_json?.title||'Transcript',
      evidence_quote:c.source_quote||c.summary||c.title,
      counterpartyNameHint:counterparty,
      created_at:run.createdAt||run.created_at,
      updated_at:run.updatedAt||run.updated_at
    }));
  });
}

function emailSeeds(classifications=[]){
  return safeArray(classifications).flatMap(row=>{
    const commitments=jsonValue(row.commitmentsJson||row.commitments_json||row.commitments,[]);
    const context=jsonValue(row.contextJson||row.context_json||row.context,{});
    const latest=context.latest_inbound||context.latestInbound||context.current_message||context.currentMessage||{};
    const counterparty=latest.from?.name||latest.from?.email||'';
    return safeArray(commitments).filter(hasExecutiveCommitmentShape).map((c,index)=>({
      ...c,
      id:stableKey(['commitment','email',row.unifiedConversationId||row.unified_conversation_id||row.id,c.messageId||index,c.text||c.summary].join(':')),
      title:c.title||c.text||c.summary,
      description:c.summary||c.text,
      source_type:'email',
      source_id:row.unifiedConversationId||row.unified_conversation_id||row.id,
      source_title:latest.subject||context.thread_summary||'Email thread',
      evidence_quote:c.text||c.summary,
      direction:c.direction||latest.direction||'',
      counterpartyNameHint:counterparty,
      created_at:row.createdAt||row.created_at,
      updated_at:row.updatedAt||row.updated_at
    }));
  });
}

function commitmentSummary(commitments=[]){
  const active=safeArray(commitments).filter(c=>!['complete','dismissed'].includes(c.status));
  return {
    you_owe:active.filter(c=>c.owner_type==='user').length,
    others_owe_you:active.filter(c=>c.owner_type==='contact'||c.owner_type==='company').length,
    overdue:active.filter(c=>c.status==='overdue').length,
    ready_for_approval:active.filter(c=>c.status==='drafted'||c.draft_id||c.task_id).length,
    needs_resolution:active.filter(c=>c.status==='needs_resolution'||c.owner_type==='unknown').length,
    total:active.length
  };
}

function createValCommitmentsService({
  getStore=()=>({}),
  saveStore=()=>{},
  hasPg=()=>false,
  dbQuery=null,
  uuid=(prefix)=>`${prefix}_${Date.now().toString(36)}`,
  tenantId=()=>'default',
  userId=()=>'default',
  listRelationshipContacts=async()=>[],
  saveDraft=null,
  saveTask=null
}={}){
  function store(){
    const s=getStore()||{};
    for(const key of ['valCommitmentOverrides','transcriptIntelligenceRuns','conversationClassifications'])if(!Array.isArray(s[key]))s[key]=[];
    return s;
  }
  async function loadTranscriptRuns(){
    if(hasPg()&&dbQuery){
      const r=await dbQuery(`select * from transcript_intelligence_runs where tenant_id=$1 and user_id=$2 order by created_at desc limit 120`,[tenantId(),userId()]).catch(()=>({rows:[]}));
      return r.rows||[];
    }
    return store().transcriptIntelligenceRuns.filter(r=>r.tenantId===tenantId()&&r.userId===userId()).slice(0,120);
  }
  async function loadEmailClassifications(){
    if(hasPg()&&dbQuery){
      const r=await dbQuery(`select * from conversation_classifications where tenant_id=$1 and user_id=$2 order by created_at desc limit 120`,[tenantId(),userId()]).catch(()=>({rows:[]}));
      return r.rows||[];
    }
    return store().conversationClassifications.filter(r=>r.tenantId===tenantId()&&r.userId===userId()).slice(0,120);
  }
  async function overrides(){
    if(hasPg())return {};
    return Object.fromEntries(store().valCommitmentOverrides.filter(r=>r.tenantId===tenantId()&&r.userId===userId()).map(r=>[r.id,r]));
  }
  async function list({status='',ownerType='',limit=100}={}){
    const contacts=await listRelationshipContacts().catch(()=>[]);
    const over=await overrides();
    const seeds=transcriptSeeds(await loadTranscriptRuns()).concat(emailSeeds(await loadEmailClassifications()));
    const byId=new Map();
    for(const seed of seeds){
      const commitment=normalizeCommitment(seed,contacts,over);
      if(!byId.has(commitment.id))byId.set(commitment.id,commitment);
    }
    let commitments=Array.from(byId.values()).sort((a,b)=>String(b.updated_at||'').localeCompare(String(a.updated_at||'')));
    if(status)commitments=commitments.filter(c=>c.status===status);
    if(ownerType)commitments=commitments.filter(c=>c.owner_type===ownerType);
    commitments=commitments.slice(0,Math.max(1,Math.min(Number(limit)||100,200)));
    return {ok:true,commitments,summary:commitmentSummary(commitments),empty:commitments.length===0};
  }
  async function get(id){
    return (await list({limit:200})).commitments.find(c=>c.id===id)||null;
  }
  async function saveOverride(id,patch={}){
    const row={id,tenantId:tenantId(),userId:userId(),...patch,updated_at:nowIso(),last_touched_at:nowIso()};
    if(hasPg())return row;
    const s=store();
    const idx=s.valCommitmentOverrides.findIndex(r=>r.id===id&&r.tenantId===tenantId()&&r.userId===userId());
    if(idx>=0)s.valCommitmentOverrides[idx]={...s.valCommitmentOverrides[idx],...row};else s.valCommitmentOverrides.unshift(row);
    saveStore(s);
    return row;
  }
  async function updateStatus(id,{status,reason=''}={}){
    const allowed=['open','waiting','drafted','delegated','complete','dismissed','overdue','needs_resolution'];
    if(!allowed.includes(status))throw new Error('Unsupported commitment status');
    await saveOverride(id,{status,dismissal_reason:reason});
    return {ok:true,commitment:await get(id),no_external_action:true};
  }
  async function draftEmail(id){
    const commitment=await get(id);
    if(!commitment)throw new Error('Commitment not found');
    if(typeof saveDraft!=='function')throw new Error('Draft writer unavailable');
    const draft=await saveDraft({
      draftType:'commitment_follow_up',
      provider:'internal',
      subject:'Follow-up: '+commitment.title,
      body:[
        commitment.counterparty_name||commitment.owner_name ? `Hi ${commitment.counterparty_name||commitment.owner_name},` : 'Hi,',
        '',
        'I wanted to follow up on this:',
        commitment.evidence_quote,
        '',
        'Does this still look right as the next step?',
        '',
        'Best,'
      ].join('\n'),
      status:'draft',
      sourceContext:{source:'commitment_ledger',commitmentId:id,sourceType:commitment.source_type,sourceId:commitment.source_id,noExternalAction:true}
    });
    await saveOverride(id,{status:'drafted',draft_id:draft.id});
    return {ok:true,draft,commitment:await get(id),no_external_action:true};
  }
  async function createTask(id){
    const commitment=await get(id);
    if(!commitment)throw new Error('Commitment not found');
    if(typeof saveTask!=='function')throw new Error('Task writer unavailable');
    const task={id:uuid('task'),title:commitment.title,contactName:commitment.owner_type==='user'?commitment.counterparty_name:commitment.owner_name,contactId:commitment.crm_contact_id||commitment.owner_contact_id||commitment.counterparty_contact_id||'',dueDate:commitment.due_at,priority:commitment.priority==='urgent'?'high':commitment.priority,notes:[commitment.description,`Evidence: ${commitment.evidence_quote}`,`Source: ${commitment.source_type} ${commitment.source_title}`].filter(Boolean).join('\n\n'),details:[{text:`Created from Commitments Ledger: ${id}`,ts:nowIso()}],completed:false,createdAt:nowIso(),source:'commitments_ledger',sourceCommitmentId:id,noExternalAction:true};
    await saveTask(task);
    await saveOverride(id,{status:'waiting',task_id:task.id});
    return {ok:true,task,commitment:await get(id),no_external_action:true};
  }
  return {list,get,updateStatus,draftEmail,createTask,normalizeCommitment,commitmentSummary};
}

module.exports={createValCommitmentsService,normalizeCommitment,transcriptSeeds,emailSeeds,parseDueHint,ownerFromText,commitmentSummary,hasExecutiveCommitmentShape};
