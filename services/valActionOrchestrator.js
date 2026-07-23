const crypto=require('crypto');
const {buildWorkProductArtifact}=require('./valWorkProductPreparation');

function safeArray(value){return Array.isArray(value)?value:[];}
function jsonValue(value,fallback={}){if(value==null)return fallback;if(typeof value==='string'){try{return JSON.parse(value);}catch(_){return fallback;}}return value;}
function compactText(value,limit=1200){return String(value||'').replace(/\s+/g,' ').trim().slice(0,limit);}
function nowIso(){return new Date().toISOString();}
function toSnake(value){return String(value).replace(/[A-Z]/g,m=>`_${m.toLowerCase()}`);}
function toCamelRow(row={}){const out={};for(const [key,value] of Object.entries(row))out[key.replace(/_([a-z])/g,(_,c)=>c.toUpperCase())]=value;return out;}
function stableKey(parts=[]){return crypto.createHash('sha256').update(parts.map(value=>compactText(value,4000).toLowerCase()).join('|')).digest('hex');}

const ACTION_CAPABILITIES=Object.freeze({
  draft_email:{label:'Draft email',availability:'live',prepares:true,requiresApproval:true,executes:true,externalActionType:'create_gmail_draft'},
  send_email:{label:'Send email',availability:'live',prepares:true,requiresApproval:true,executes:true,externalActionType:'send_email'},
  make_introduction:{label:'Make an introduction',availability:'live',prepares:true,requiresApproval:true,executes:true,externalActionType:'send_email'},
  send_sms:{label:'Send text message',availability:'live',prepares:true,requiresApproval:true,executes:true,externalActionType:'send_sms'},
  create_calendar_hold:{label:'Create private calendar hold',availability:'live',prepares:true,requiresApproval:true,executes:true,externalActionType:'create_calendar_hold'},
  send_calendar_invite:{label:'Create attendee calendar invite',availability:'live',prepares:true,requiresApproval:true,executes:true,externalActionType:'send_calendar_invite'},
  create_crm_task:{label:'Create CRM task',availability:'live',prepares:true,requiresApproval:true,executes:true,externalActionType:'create_crm_task'},
  create_crm_note:{label:'Create CRM note',availability:'live',prepares:true,requiresApproval:true,executes:true,externalActionType:'create_crm_note'},
  upsert_contact:{label:'Create or update contact',availability:'live',prepares:true,requiresApproval:true,executes:true,externalActionType:'upsert_contact'},
  update_contact_tags:{label:'Update contact tags',availability:'live',prepares:true,requiresApproval:true,executes:true,externalActionType:'add_or_remove_tag'},
  update_opportunity:{label:'Update opportunity',availability:'live',prepares:true,requiresApproval:true,executes:true,externalActionType:'update_opportunity'},
  prepare_proposal:{label:'Prepare proposal',availability:'prepare_only',prepares:true,requiresApproval:true,executes:false,externalActionType:'send_proposal'},
  prepare_document:{label:'Prepare document',availability:'route_only',prepares:true,requiresApproval:true,executes:false,externalActionType:'create_document'},
  prepare_code:{label:'Prepare code',availability:'prepare_only',prepares:true,requiresApproval:true,executes:false,externalActionType:'prepare_code'},
  research:{label:'Research',availability:'live_read_only',prepares:true,requiresApproval:false,executes:false,externalActionType:'research'},
  publish_content:{label:'Publish content',availability:'route_only',prepares:true,requiresApproval:true,executes:false,externalActionType:'publish_content'}
});

const ALLOWED_STATUS=new Set(['candidate_detected','context_bound','prepared','awaiting_approval','approved','executing','succeeded','failed','expired','cancelled','receipt_recorded','reconciled']);

function normalizeActionType(value='',artifact={}){
  const raw=String(value||artifact.kind||artifact.type||'').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
  if(!raw)return '';
  if(/introduction|intro/.test(raw))return 'make_introduction';
  if(/gmail_draft|outlook_draft|email_draft|draft_email|follow_up_email|followup_email/.test(raw))return 'draft_email';
  if(/send_email|email_send/.test(raw))return 'send_email';
  if(/sms|text_message|send_text/.test(raw))return 'send_sms';
  if(/calendar_invite|calendar_event|schedule_calendar|send_invite|appointment|schedule_meeting|book_meeting|create_event/.test(raw))return 'send_calendar_invite';
  if(/calendar_hold|block_time|focus_block/.test(raw))return 'create_calendar_hold';
  if(/crm_task|create_task|task/.test(raw))return 'create_crm_task';
  if(/crm_note|contact_note|note/.test(raw))return 'create_crm_note';
  if(/contact_tag|add_tag|remove_tag|update_tag/.test(raw))return 'update_contact_tags';
  if(/create_contact|update_contact|upsert_contact/.test(raw))return 'upsert_contact';
  if(/opportunity|pipeline_stage/.test(raw))return 'update_opportunity';
  if(/proposal|estimate|scope_of_work/.test(raw))return 'prepare_proposal';
  if(/document|google_doc|google_drive|one_drive|brief|memo|create_file/.test(raw))return 'prepare_document';
  if(/code|repository|github|implementation/.test(raw))return 'prepare_code';
  if(/research|outscraper|apollo|rocketreach|lookup|enrich/.test(raw))return 'research';
  if(/publish|social_post|blog_post/.test(raw))return 'publish_content';
  return ACTION_CAPABILITIES[raw]?raw:'';
}

function detectActionCandidates(text=''){
  const input=compactText(text,12000);
  if(!input)return [];
  const patterns=[
    ['make_introduction',/\b(?:introduce|connect)\s+(?:me\s+)?(?:to|with)\b|\bmake an introduction\b/i],
    ['send_sms',/\b(?:send|text|message)\s+[^.!?]{0,100}\b(?:sms|text message|via text)\b|\btext\s+(?:him|her|them|[A-Z][a-z]+)\b/i],
    ['send_calendar_invite',/\b(?:send|create|book|schedule)\s+(?:an?\s+)?(?:calendar )?(?:invite|appointment|meeting)\b/i],
    ['create_calendar_hold',/\b(?:block|hold|protect)\s+(?:off\s+)?(?:time|my calendar)\b/i],
    ['prepare_proposal',/\b(?:draft|prepare|create|write)\s+(?:an?\s+)?(?:proposal|scope of work|estimate)\b/i],
    ['prepare_code',/\b(?:write|build|implement|code|fix)\s+[^.!?]{0,140}\b(?:code|feature|function|integration|repository|repo)\b/i],
    ['research',/\b(?:research|look up|investigate|find out|run outscraper|use outscraper|enrich)\b/i],
    ['create_crm_task',/\b(?:create|add|make)\s+(?:a\s+)?(?:crm\s+)?task\b|\bremind me\b/i],
    ['create_crm_note',/\b(?:create|add|save|log)\s+(?:a\s+)?(?:crm\s+)?note\b/i],
    ['upsert_contact',/\b(?:create|add|update)\s+(?:a\s+)?contact\b/i],
    ['update_contact_tags',/\b(?:add|remove|update)\s+(?:a\s+|the\s+)?(?:contact\s+)?tag\b/i],
    ['update_opportunity',/\b(?:create|update|move)\s+(?:the\s+|an?\s+)?(?:opportunity|pipeline|deal)\b/i],
    ['publish_content',/\b(?:publish|post)\s+(?:this|it|the|a|an)\b/i],
    ['draft_email',/\b(?:draft|write|prepare)\s+(?:an?\s+)?(?:email|reply|follow[- ]?up)\b/i],
    ['send_email',/\b(?:send|email)\s+(?:this|it|him|her|them|the|an?\s+email|[A-Z][a-z]+)\b/i],
    ['prepare_document',/\b(?:draft|prepare|create|write)\s+(?:an?\s+)?(?:document|brief|memo|one[- ]?pager|google doc)\b/i]
  ];
  const found=[];
  for(const [actionType,pattern] of patterns){
    if(actionType==='send_email'&&found.some(row=>row.actionType==='draft_email'))continue;
    if(pattern.test(input)&&!found.some(row=>row.actionType===actionType))found.push({actionType,instruction:input,title:ACTION_CAPABILITIES[actionType].label,confidence:0.72});
  }
  return found;
}

function normalizeStructuredAction(item={}){
  const artifact=jsonValue(item.prepared_artifact||item.preparedArtifact||item.artifact,{});
  const actionType=normalizeActionType(item.actionType||item.action_type||item.requested_action||item.requestedAction||item.type,artifact);
  if(!actionType)return null;
  const instruction=compactText(item.instruction||item.summary||item.title||artifact.title||ACTION_CAPABILITIES[actionType].label,4000);
  const sourceRefs=safeArray(item.source_refs||item.sourceRefs||item.sourceRefsJson||item.evidence_refs||item.evidenceRefs);
  return {
    actionType,
    title:compactText(item.title||artifact.title||ACTION_CAPABILITIES[actionType].label,320),
    instruction,
    target:jsonValue(item.target||item.target_json||item.targetJson,{name:item.target_person_or_record||item.targetPersonOrRecord||'',system:item.target_system||item.targetSystem||''}),
    context:jsonValue(item.context||item.linked_context||item.linkedContext,{}),
    sourceRefs,
    ambiguity:safeArray(item.ambiguity||item.ambiguity_json||item.ambiguityJson),
    preparedArtifact:artifact,
    approvalPolicy:item.approval_policy||item.approvalPolicy||item.authorization||'approval_required',
    confidence:Number(item.confidence||0.78)
  };
}

function createValActionOrchestrator({
  dbQuery,
  hasPg=()=>false,
  getStore=()=>({}),
  saveStore=()=>{},
  uuid=(prefix)=>`${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`,
  tenantId=()=>'default',
  userId=()=>'default',
  externalActionService=null,
  externalActionExecutor=null,
  researchExecution=null,
  onResearchComplete=null,
  onWorkProductPrepared=null,
  logger=console
}={}){
  let packetService=externalActionService;
  let executor=externalActionExecutor;
  const researchFlights=new Map();
  function bindExternalActions({service,actionExecutor}={}){packetService=service||packetService;executor=actionExecutor||service?.executor||executor;return {service:!!packetService,executor:!!executor};}
  function store(){const s=getStore()||{};for(const key of ['valActionSources','valActionCandidates','valActionCandidateEvents'])if(!Array.isArray(s[key]))s[key]=[];return s;}
  function scope(){return {tenantId:tenantId(),userId:userId()};}
  async function select(sql,params=[]){if(!hasPg())return [];const result=await dbQuery(sql,params);return result.rows||[];}
  async function saveSource(row){
    if(hasPg()){
      const values=[row.id,row.tenantId,row.userId,row.sourceChannel,row.sourceType,row.sourceId,row.sourceEventId,row.title,row.textExcerpt,JSON.stringify(row.contextJson),JSON.stringify(row.sourceRefsJson),row.idempotencyKey,row.receivedAt,row.createdAt,row.updatedAt];
      const result=await dbQuery(`insert into val_action_sources (id,tenant_id,user_id,source_channel,source_type,source_id,source_event_id,title,text_excerpt,context_json,source_refs_json,idempotency_key,received_at,created_at,updated_at) values (${values.map((_,i)=>`$${i+1}`).join(',')}) on conflict (tenant_id,user_id,idempotency_key) do update set title=excluded.title,text_excerpt=excluded.text_excerpt,context_json=excluded.context_json,source_refs_json=excluded.source_refs_json,updated_at=excluded.updated_at returning *`,values);
      return toCamelRow(result.rows[0]);
    }
    const s=store();const found=s.valActionSources.find(item=>item.tenantId===row.tenantId&&item.userId===row.userId&&item.idempotencyKey===row.idempotencyKey);
    if(found){Object.assign(found,row,{id:found.id,createdAt:found.createdAt,updatedAt:nowIso()});saveStore(s);return found;}
    s.valActionSources.unshift(row);saveStore(s);return row;
  }
  async function saveCandidate(row){
    if(hasPg()){
      const columns=['id','tenantId','userId','sourceRecordId','sourceChannel','sourceType','sourceId','status','actionType','title','instruction','targetJson','contextJson','sourceRefsJson','ambiguityJson','preparedArtifactJson','capabilityJson','approvalPolicy','externalActionPacketId','executionReceiptId','providerResponseId','failureReason','idempotencyKey','createdAt','updatedAt','reviewedAt','executedAt','reconciledAt'];
      const values=columns.map(key=>['targetJson','contextJson','sourceRefsJson','ambiguityJson','preparedArtifactJson','capabilityJson'].includes(key)?JSON.stringify(row[key]||(['sourceRefsJson','ambiguityJson'].includes(key)?[]:{})):row[key]);
      const names=columns.map(toSnake),updates=names.filter(name=>!['id','created_at'].includes(name)).map(name=>`${name}=excluded.${name}`).join(',');
      const result=await dbQuery(`insert into val_action_candidates (${names.join(',')}) values (${values.map((_,i)=>`$${i+1}`).join(',')}) on conflict (tenant_id,user_id,idempotency_key) do update set ${updates} returning *`,values);
      return toCamelRow(result.rows[0]);
    }
    const s=store();const found=s.valActionCandidates.find(item=>item.tenantId===row.tenantId&&item.userId===row.userId&&item.idempotencyKey===row.idempotencyKey);
    if(found){Object.assign(found,row,{id:found.id,createdAt:found.createdAt,updatedAt:nowIso()});saveStore(s);return found;}
    s.valActionCandidates.unshift(row);saveStore(s);return row;
  }
  async function getByIdempotencyKey(key){
    if(hasPg()){
      const rows=await select(`select * from val_action_candidates where tenant_id=$1 and user_id=$2 and idempotency_key=$3 limit 1`,[tenantId(),userId(),key]);
      return rows[0]?toCamelRow(rows[0]):null;
    }
    return store().valActionCandidates.find(row=>row.tenantId===tenantId()&&row.userId===userId()&&row.idempotencyKey===key)||null;
  }
  async function appendEvent(candidate,eventType,status,payload={}){
    const row={id:uuid('actionevt'),...scope(),candidateId:candidate.id,eventType,priorStatus:candidate.status===status?'':candidate.status||'',status,payloadJson:payload,sourceRefsJson:safeArray(candidate.sourceRefsJson),createdAt:nowIso()};
    if(hasPg())await dbQuery(`insert into val_action_candidate_events (id,tenant_id,user_id,candidate_id,event_type,prior_status,status,payload_json,source_refs_json,created_at) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,[row.id,row.tenantId,row.userId,row.candidateId,row.eventType,row.priorStatus,row.status,JSON.stringify(row.payloadJson),JSON.stringify(row.sourceRefsJson),row.createdAt]);
    else{const s=store();s.valActionCandidateEvents.push(row);saveStore(s);}
    return row;
  }
  async function updateCandidate(candidate,patch,eventType,payload={}){
    const status=patch.status||candidate.status;if(!ALLOWED_STATUS.has(status))throw new Error(`Invalid action candidate status: ${status}`);
    const next={...candidate,...patch,updatedAt:nowIso()};
    const saved=await saveCandidate(next);await appendEvent(candidate,eventType,status,payload);return saved;
  }
  async function maybePreparePacket(candidate){
    if(!packetService||!Object.keys(jsonValue(candidate.preparedArtifactJson,{})).length)return candidate;
    const packet=await packetService.preparePacketFromPreparedArtifact({
      id:candidate.id,
      title:candidate.title,
      summary:candidate.instruction,
      preparedArtifact:candidate.preparedArtifactJson,
      preparedArtifactKind:candidate.preparedArtifactJson.kind||candidate.preparedArtifactJson.type,
      sourceRefs:candidate.sourceRefsJson,
      approvalPolicy:candidate.approvalPolicy,
      metadata:{source:'val_action_orchestrator',sourceId:candidate.sourceId,sourceType:candidate.sourceType,actionCandidateId:candidate.id}
    }).catch(error=>{logger.warn?.('[val-action-orchestrator] packet preparation failed',error.message);return null;});
    if(!packet)return candidate;
    return updateCandidate(candidate,{status:'awaiting_approval',externalActionPacketId:packet.id},'external_packet_prepared',{packetId:packet.id});
  }
  async function ingest(input={}){
    const sc=scope(),sourceChannel=compactText(input.sourceChannel||input.channel||'unknown',80).toLowerCase(),sourceType=compactText(input.sourceType||input.type||sourceChannel,120).toLowerCase();
    const sourceId=compactText(input.sourceId||input.id||input.conversationId||input.sessionId,320)||stableKey([sourceChannel,input.title,input.text]).slice(0,32);
    const text=String(input.text||input.rawText||input.message||'').trim();
    const sourceEventId=compactText(input.sourceEventId||input.eventId||'',320)||(
      ['chat','voice','cowork'].includes(sourceChannel)&&text
        ? `content_${stableKey([sourceChannel,sourceId,text]).slice(0,24)}`
        : ''
    );
    const sourceRefs=safeArray(input.sourceRefs||input.source_refs).length?safeArray(input.sourceRefs||input.source_refs):[{source_type:sourceType,source_id:sourceId,quote_or_summary:compactText(text||input.title,700),confidence:0.8}];
    const sourceKey=stableKey([sc.tenantId,sc.userId,sourceChannel,sourceType,sourceId,sourceEventId]);
    const source=await saveSource({id:uuid('actionsrc'),...sc,sourceChannel,sourceType,sourceId,sourceEventId,title:compactText(input.title||sourceType,320),textExcerpt:compactText(text,6000),contextJson:jsonValue(input.context,{}),sourceRefsJson:sourceRefs,idempotencyKey:sourceKey,receivedAt:input.occurredAt||nowIso(),createdAt:nowIso(),updatedAt:nowIso()});
    const structured=safeArray(input.structuredActions).map(normalizeStructuredAction).filter(Boolean);
    const detected=detectActionCandidates(text);
    const actions=[...structured];
    for(const action of detected)if(!actions.some(existing=>existing.actionType===action.actionType&&compactText(existing.instruction,400)===compactText(action.instruction,400)))actions.push(action);
    const candidates=[];
    for(const action of actions){
      const capability=ACTION_CAPABILITIES[action.actionType];if(!capability)continue;
      const refs=safeArray(action.sourceRefs).length?action.sourceRefs:sourceRefs;
      const actionContext={...jsonValue(input.context,{}),...jsonValue(action.context,{})};
      const suppliedArtifact=jsonValue(action.preparedArtifact,{});
      const preparedArtifact=Object.keys(suppliedArtifact).length?suppliedArtifact:(buildWorkProductArtifact({
        actionType:action.actionType,
        title:action.title||capability.label,
        instruction:action.instruction||capability.label,
        target:action.target,
        context:actionContext,
        sourceRefs:refs,
        sourceChannel,
        sourceType,
        sourceId
      })||{});
      const researchNeedsExecution=action.actionType==='research'&&preparedArtifact.completion_status==='ready_for_research';
      const initialStatus=researchNeedsExecution?'context_bound':(Object.keys(preparedArtifact).length?(capability.requiresApproval?'awaiting_approval':'prepared'):(Object.keys(jsonValue(action.context,{})).length?'context_bound':'candidate_detected'));
      const key=stableKey([sc.tenantId,sc.userId,source.id,action.actionType,action.instruction,JSON.stringify(action.target||{})]);
      const existing=await getByIdempotencyKey(key);
      if(existing){candidates.push(existing);continue;}
      let candidate=await saveCandidate({id:uuid('action'),...sc,sourceRecordId:source.id,sourceChannel,sourceType,sourceId,status:initialStatus,actionType:action.actionType,title:action.title||capability.label,instruction:action.instruction||capability.label,targetJson:jsonValue(action.target,{}),contextJson:actionContext,sourceRefsJson:refs,ambiguityJson:safeArray(action.ambiguity),preparedArtifactJson:preparedArtifact,capabilityJson:capability,approvalPolicy:action.approvalPolicy||(capability.requiresApproval?'approval_required':'no_approval_required'),externalActionPacketId:'',executionReceiptId:'',providerResponseId:'',failureReason:'',idempotencyKey:key,createdAt:nowIso(),updatedAt:nowIso(),reviewedAt:null,executedAt:null,reconciledAt:null});
      const existingEvents=await timeline(candidate.id,{limit:5});
      if(!existingEvents.length){await appendEvent(candidate,'source_received','candidate_detected',{sourceRecordId:source.id,sourceChannel});await appendEvent(candidate,'candidate_detected',initialStatus,{actionType:action.actionType,capability});}
      if(Object.keys(preparedArtifact).length&&capability.requiresApproval)candidate=await maybePreparePacket(candidate);
      if(action.actionType==='prepare_code'&&Object.keys(preparedArtifact).length&&typeof onWorkProductPrepared==='function'){
        try{
          await Promise.resolve(onWorkProductPrepared({candidate,artifact:candidate.preparedArtifactJson}));
          candidate=await updateCandidate(candidate,{failureReason:''},'work_product_carried_forward',{
            artifactKind:candidate.preparedArtifactJson.kind||'',
            completionStatus:candidate.preparedArtifactJson.completion_status||''
          });
        }catch(error){
          candidate=await updateCandidate(candidate,{failureReason:`Prepared work was saved but could not be carried forward: ${compactText(error.message,900)}`},'work_product_carry_forward_failed',{error:compactText(error.message,900)});
        }
      }
      candidates.push(candidate);
      if(researchNeedsExecution&&researchExecution?.execute){
        setImmediate(()=>executeResearch(candidate.id).catch(error=>logger.warn?.('[val-action-orchestrator] background research failed',error.message)));
      }
    }
    return {ok:true,source,candidates,count:candidates.length,no_external_action:true};
  }
  async function get(id){
    if(hasPg()){const rows=await select(`select * from val_action_candidates where tenant_id=$1 and user_id=$2 and id=$3`,[tenantId(),userId(),id]);return rows[0]?toCamelRow(rows[0]):null;}
    return store().valActionCandidates.find(row=>row.tenantId===tenantId()&&row.userId===userId()&&row.id===id)||null;
  }
  async function list({limit=50,status='',sourceChannel=''}={}){
    const lim=Math.max(1,Math.min(Number(limit)||50,200));
    if(hasPg()){
      const params=[tenantId(),userId()];let where='tenant_id=$1 and user_id=$2';
      if(status){params.push(status);where+=` and status=$${params.length}`;}if(sourceChannel){params.push(sourceChannel);where+=` and source_channel=$${params.length}`;}
      const rows=await select(`select * from val_action_candidates where ${where} order by updated_at desc limit ${lim}`,params);return rows.map(toCamelRow);
    }
    return store().valActionCandidates.filter(row=>row.tenantId===tenantId()&&row.userId===userId()&&(!status||row.status===status)&&(!sourceChannel||row.sourceChannel===sourceChannel)).slice(0,lim);
  }
  async function timeline(id,{limit=100}={}){
    const lim=Math.max(1,Math.min(Number(limit)||100,250));
    if(hasPg()){const rows=await select(`select * from val_action_candidate_events where tenant_id=$1 and user_id=$2 and candidate_id=$3 order by created_at asc limit ${lim}`,[tenantId(),userId(),id]);return rows.map(toCamelRow);}
    return store().valActionCandidateEvents.filter(row=>row.tenantId===tenantId()&&row.userId===userId()&&row.candidateId===id).sort((a,b)=>String(a.createdAt).localeCompare(String(b.createdAt))).slice(0,lim);
  }
  async function prepare(id,{preparedArtifact={},sourceRefs=[]}={}){
    const candidate=await get(id);if(!candidate)return null;
    const artifact=jsonValue(preparedArtifact,{});if(!Object.keys(artifact).length)throw new Error('Prepared artifact is required.');
    let next=await updateCandidate(candidate,{status:candidate.capabilityJson?.requiresApproval?'awaiting_approval':'prepared',preparedArtifactJson:artifact,sourceRefsJson:safeArray(sourceRefs).length?sourceRefs:candidate.sourceRefsJson},'prepared',{artifactKind:artifact.kind||artifact.type||''});
    next=await maybePreparePacket(next);return next;
  }
  async function approve(id,{note=''}={}){
    const candidate=await get(id);if(!candidate)return null;
    let packet=null;if(candidate.externalActionPacketId&&packetService)packet=await packetService.approve(candidate.externalActionPacketId,{note});
    return updateCandidate(candidate,{status:'approved',reviewedAt:nowIso()},'approved',{note,packetId:packet?.id||candidate.externalActionPacketId||''});
  }
  async function execute(id,opts={}){
    const candidate=await get(id);if(!candidate)return null;
    if(!candidate.capabilityJson?.executes)return {ok:false,candidate,error:`${candidate.capabilityJson?.label||candidate.actionType} is not connected to a verified execution adapter yet.`};
    if(candidate.status!=='approved')return {ok:false,candidate,error:'This action must be explicitly approved before execution.'};
    if(!candidate.externalActionPacketId)return {ok:false,candidate,error:'No provider action packet is attached. This capability remains prepare-only or route-only.'};
    if(!executor?.execute)return {ok:false,candidate,error:'No execution adapter is attached to the Action Orchestrator.'};
    const executing=await updateCandidate(candidate,{status:'executing'},'execution_started',{packetId:candidate.externalActionPacketId});
    const result=await executor.execute(candidate.externalActionPacketId,opts);
    if(!result?.ok)return {ok:false,candidate:await updateCandidate(executing,{status:'failed',failureReason:result?.error||result?.packet?.failureReason||'Execution failed.'},'execution_failed',{error:result?.error||''}),execution:result};
    let succeeded=await updateCandidate(executing,{status:'succeeded',executionReceiptId:result.receipt?.id||'',providerResponseId:result.packet?.providerResponseId||'',executedAt:result.packet?.executedAt||nowIso(),failureReason:''},'execution_succeeded',{receiptId:result.receipt?.id||'',providerResponseId:result.packet?.providerResponseId||''});
    if(result.receipt)succeeded=await updateCandidate(succeeded,{status:'receipt_recorded'},'receipt_recorded',{receiptId:result.receipt.id});
    if(result.reconciliation?.ok)succeeded=await updateCandidate(succeeded,{status:'reconciled',reconciledAt:nowIso()},'reconciled',{reconciliation:result.reconciliation});
    return {ok:true,candidate:succeeded,execution:result};
  }
  async function executeResearch(id,{force=false}={}){
    const candidate=await get(id);if(!candidate)return null;
    if(candidate.actionType!=='research')return {ok:false,candidate,error:'This candidate is not a research handoff.'};
    if(!researchExecution?.execute)return {ok:false,candidate,error:'The verified research runner is not connected.'};
    const artifact=jsonValue(candidate.preparedArtifactJson,{});
    if(!force&&['complete_for_review','complete_no_verified_result'].includes(artifact.completion_status))return {ok:true,candidate,cached:true,no_external_action:true};
    if(researchFlights.has(candidate.id))return researchFlights.get(candidate.id);
    const flight=(async()=>{
      const researching=await updateCandidate(candidate,{status:'executing',failureReason:''},'research_started',{provider:'outscraper_google_search'});
      try{
        const completedArtifact=await researchExecution.execute({candidate:researching,artifact,force});
        const sourceRefs=safeArray(researching.sourceRefsJson).concat(safeArray(completedArtifact.source_refs));
        const completed=await updateCandidate(researching,{status:'prepared',preparedArtifactJson:completedArtifact,sourceRefsJson:sourceRefs,failureReason:''},'research_completed',{
          completionStatus:completedArtifact.completion_status,
          verifiedResultCount:safeArray(completedArtifact.source_results).length,
          rejectedUnverifiedResultCount:Number(completedArtifact.rejected_unverified_result_count||0)
        });
        if(typeof onResearchComplete==='function'){
          await Promise.resolve(onResearchComplete({candidate:completed,artifact:completedArtifact}))
            .catch(error=>logger.warn?.('[val-action-orchestrator] research carry-forward failed',error.message));
        }
        return {ok:true,candidate:completed,no_external_action:true};
      }catch(error){
        const failed=await updateCandidate(researching,{status:'failed',failureReason:compactText(error.message,1200)},'research_failed',{error:compactText(error.message,1200)});
        return {ok:false,candidate:failed,error:error.message,no_external_action:true};
      }
    })().finally(()=>researchFlights.delete(candidate.id));
    researchFlights.set(candidate.id,flight);
    return flight;
  }
  function capabilities(){return Object.entries(ACTION_CAPABILITIES).map(([actionType,capability])=>({actionType,...capability}));}
  return {ingest,get,list,timeline,prepare,approve,execute,executeResearch,capabilities,bindExternalActions,detectActionCandidates,normalizeActionType};
}

module.exports={createValActionOrchestrator,ACTION_CAPABILITIES,detectActionCandidates,normalizeActionType,normalizeStructuredAction};
