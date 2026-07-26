const crypto=require('node:crypto');

function safeArray(value){return Array.isArray(value)?value:[];}
function compactText(value='',limit=900){return String(value||'').replace(/\s+/g,' ').trim().slice(0,limit);}
function now(){return new Date().toISOString();}
function jsonValue(value,fallback){
  if(value===null||value===undefined||value==='')return fallback;
  if(typeof value==='string'){try{return JSON.parse(value);}catch{return fallback;}}
  return value;
}
function toSnake(key){return key.replace(/[A-Z]/g,m=>'_'+m.toLowerCase());}
const WORK_JSON_FIELDS=new Set([
  'sourceRefsJson',
  'envelopeJson',
  'dueBasisJson',
  'observerReceiptsJson',
  'preparedArtifactIdsJson',
  'metadataJson'
]);
const EVENT_JSON_FIELDS=new Set(['sourceRefsJson','payloadJson']);
function pgValue(column,value,jsonFields){
  if(value===undefined)return null;
  return jsonFields.has(column)?JSON.stringify(value??(/RefsJson$|IdsJson$/.test(column)?[]:{})):value;
}
function rowToCamel(row={}){
  const out={};
  for(const [key,value] of Object.entries(row)){
    const camel=key.replace(/_([a-z])/g,(_,letter)=>letter.toUpperCase());
    const jsonFallback=/^(source_refs|observer_receipts|prepared_artifact_ids)_json$/.test(key)?[]:{};
    out[camel]=/_json$/.test(key)?jsonValue(value,jsonFallback):value;
  }
  return out;
}
function stableHash(value=''){
  return crypto.createHash('sha256').update(String(value||'')).digest('hex');
}
function normalizedKey(value=''){
  return compactText(value,1000).toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
}
function firstText(...values){
  for(const value of values){
    const text=compactText(value,1200);
    if(text)return text;
  }
  return '';
}
function normalizeOwnership(value=''){
  const normalized=normalizedKey(value);
  if(['user','executive','self','me','i'].includes(normalized))return 'user';
  if(['other','counterparty','someone else'].includes(normalized))return 'other';
  if(['val','assistant','system'].includes(normalized))return 'val';
  return 'unknown';
}
function normalizeSourceRef(ref={}){
  return {
    sourceType:firstText(ref.sourceType,ref.source_type,'unknown'),
    sourceId:firstText(ref.sourceId,ref.source_id),
    quoteOrSummary:firstText(ref.quoteOrSummary,ref.quote_or_summary,ref.sourceQuote,ref.source_quote,ref.summary),
    confidence:Number(ref.confidence||0),
    createdAt:firstText(ref.createdAt,ref.created_at)
  };
}
function canonicalEnvelope(input={}){
  const projectId=firstText(input.projectId,input.project_id,input.envelope?.projectId,input.envelope?.project_id);
  const projectName=firstText(input.projectName,input.project_name,input.envelope?.projectName,input.envelope?.project_name);
  const relationshipId=firstText(input.relationshipId,input.relationship_id,input.envelope?.relationshipId,input.envelope?.relationship_id);
  const relationshipName=firstText(input.relationshipName,input.relationship_name,input.envelope?.relationshipName,input.envelope?.relationship_name);
  if(projectId||projectName)return {type:'project',id:projectId,name:projectName};
  if(relationshipId||relationshipName)return {type:'relationship',id:relationshipId,name:relationshipName};
  return {type:'source',id:firstText(input.sourceId,input.source_id),name:firstText(input.sourceTitle,input.source_title)};
}
function admissionFor(input={}){
  const ownership=normalizeOwnership(input.ownership);
  const actionText=firstText(input.actionText,input.action_text,input.action,input.title);
  const objectText=firstText(input.objectText,input.object_text,input.object,input.outcomeText,input.outcome_text,input.outcome);
  const exactSourceQuote=firstText(input.exactSourceQuote,input.exact_source_quote,input.sourceQuote,input.source_quote);
  if(input.isNoise===true||input.is_noise===true)return {admissionStatus:'rejected_noise',lifecycleStatus:'dismissed',reason:'Source was classified as noise.'};
  if(input.alreadyComplete===true||input.already_complete===true)return {admissionStatus:'already_complete',lifecycleStatus:'complete',reason:'Source states the work is already complete.'};
  if(!actionText||!objectText||!exactSourceQuote)return {admissionStatus:'needs_context',lifecycleStatus:'open',reason:'Actor, action, object, and exact source evidence are required.'};
  if(ownership==='unknown')return {admissionStatus:'needs_owner',lifecycleStatus:'open',reason:'Evidence does not identify a safe owner.'};
  if(ownership==='other')return {admissionStatus:'waiting_on_other',lifecycleStatus:'waiting',reason:'Another person owns this action.'};
  return {admissionStatus:'admitted',lifecycleStatus:'open',reason:'Grounded work item admitted.'};
}
function canonicalFingerprints(input={}){
  const sourceType=firstText(input.sourceType,input.source_type,'unknown');
  const sourceId=firstText(input.sourceId,input.source_id);
  const sourceQuote=firstText(input.exactSourceQuote,input.exact_source_quote,input.sourceQuote,input.source_quote);
  const sourceFingerprint=firstText(input.sourceFingerprint,input.source_fingerprint,stableHash([sourceType,sourceId,normalizedKey(sourceQuote)].join('|')));
  const envelope=canonicalEnvelope(input);
  const ownership=normalizeOwnership(input.ownership);
  const owner=firstText(input.ownerId,input.owner_id,input.ownerName,input.owner_name,ownership);
  const action=firstText(input.actionText,input.action_text,input.action,input.title);
  const object=firstText(input.objectText,input.object_text,input.object,input.outcomeText,input.outcome_text,input.outcome);
  const workFingerprint=stableHash([
    normalizedKey(owner),
    normalizedKey(action),
    normalizedKey(object),
    normalizedKey(envelope.type),
    normalizedKey(envelope.id||envelope.name)
  ].join('|'));
  return {sourceFingerprint,workFingerprint,envelope};
}
function boundedSourceContext(rawText='',exactQuote='',limit=12000){
  const text=String(rawText||'').trim();
  if(!text||text.length<=limit)return text;
  const quote=String(exactQuote||'').trim();
  const quoteIndex=quote?text.indexOf(quote):-1;
  if(quoteIndex>=0){
    const half=Math.floor(limit/2);
    const start=Math.max(0,quoteIndex-half);
    return text.slice(start,Math.min(text.length,start+limit)).trim();
  }
  const edge=Math.floor((limit-80)/2);
  return `${text.slice(0,edge).trim()}\n\n[Source continues]\n\n${text.slice(-edge).trim()}`;
}

function createValCanonicalWorkService({
  dbQuery,
  hasPg=()=>false,
  getStore=()=>({}),
  saveStore=()=>{},
  uuid=prefix=>`${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`,
  tenantId=()=>'default',
  userId=()=>'default',
  afterWorkItemEvent=null,
  loadSourceProcessingRecord=null,
  loadTranscriptTasks=null
}={}){
  function store(){
    const value=getStore()||{};
    if(!Array.isArray(value.valWorkItems))value.valWorkItems=[];
    if(!Array.isArray(value.valWorkItemEvents))value.valWorkItemEvents=[];
    return value;
  }
  async function pgUpsertWork(row){
    const columns=['id','tenantId','userId','sourceProcessingRecordId','sourceType','sourceId','sourceFingerprint','workFingerprint','workType','ownership','ownerId','ownerName','actionText','objectText','outcomeText','title','summary','exactSourceQuote','sourceRefsJson','envelopeJson','projectId','projectName','relationshipId','relationshipName','admissionStatus','lifecycleStatus','dueAt','dueBasisJson','confidence','boardPacketId','observerReceiptsJson','roundTableRunId','chiefRecommendationId','chiefRank','preparedArtifactIdsJson','metadataJson','createdAt','updatedAt','completedAt'];
    const names=columns.map(toSnake);
    const values=columns.map(column=>pgValue(column,row[column],WORK_JSON_FIELDS));
    const params=columns.map((_,index)=>`$${index+1}`).join(',');
    const updates=names.filter(name=>!['id','tenant_id','user_id','work_fingerprint','created_at'].includes(name)).map(name=>`${name}=excluded.${name}`).join(',');
    const result=await dbQuery(
      `insert into val_work_items (${names.join(',')}) values (${params})
       on conflict (tenant_id,user_id,work_fingerprint) do update set ${updates}
       returning *`,
      values
    );
    if(!result?.rows?.[0])throw new Error('Canonical work item was not persisted.');
    return rowToCamel(result.rows[0]);
  }
  async function saveEvent(event){
    if(hasPg()){
      const columns=['id','tenantId','userId','workItemId','eventType','previousStatus','newStatus','sourceRefsJson','payloadJson','createdAt'];
      const names=columns.map(toSnake);
      const values=columns.map(column=>pgValue(column,event[column],EVENT_JSON_FIELDS));
      const params=columns.map((_,index)=>`$${index+1}`).join(',');
      const result=await dbQuery(`insert into val_work_item_events (${names.join(',')}) values (${params}) on conflict (id) do nothing returning *`,values);
      if(!result?.rows?.[0])throw new Error('Canonical work event was not persisted.');
      return rowToCamel(result.rows[0]);
    }
    const value=store();
    if(!value.valWorkItemEvents.some(existing=>existing.id===event.id))value.valWorkItemEvents.push(event);
    saveStore(value);
    return event;
  }
  async function admit(input={}){
    const scoped={tenantId:tenantId(),userId:userId()};
    const ownership=normalizeOwnership(input.ownership);
    const fingerprints=canonicalFingerprints(input);
    const admission=admissionFor({...input,ownership});
    const incomingSourceRefs=safeArray(input.sourceRefs||input.source_refs).map(normalizeSourceRef);
    const timestamp=now();
    let existing=null;
    if(hasPg()){
      const result=await dbQuery(
        `select * from val_work_items where tenant_id=$1 and user_id=$2 and work_fingerprint=$3 limit 1`,
        [scoped.tenantId,scoped.userId,fingerprints.workFingerprint]
      );
      existing=result.rows?.[0]?rowToCamel(result.rows[0]):null;
    }else{
      existing=store().valWorkItems.find(item=>item.tenantId===scoped.tenantId&&item.userId===scoped.userId&&item.workFingerprint===fingerprints.workFingerprint)||null;
    }
    const sourceRefs=[...safeArray(existing?.sourceRefsJson),...incomingSourceRefs].filter((ref,index,all)=>{
      const key=[ref.sourceType,ref.sourceId,ref.quoteOrSummary].join('|');
      return all.findIndex(other=>[other.sourceType,other.sourceId,other.quoteOrSummary].join('|')===key)===index;
    });
    const sourceProcessingRecordIds=[...new Set([
      ...safeArray(existing?.metadataJson?.sourceProcessingRecordIds),
      existing?.sourceProcessingRecordId,
      firstText(input.sourceProcessingRecordId,input.source_processing_record_id)
    ].filter(Boolean))];
    const sourceFingerprints=[...new Set([
      ...safeArray(existing?.metadataJson?.sourceFingerprints),
      existing?.sourceFingerprint,
      fingerprints.sourceFingerprint
    ].filter(Boolean))];
    const row={
      id:existing?.id||uuid('work'),
      ...scoped,
      sourceProcessingRecordId:existing?.sourceProcessingRecordId||firstText(input.sourceProcessingRecordId,input.source_processing_record_id),
      sourceType:existing?.sourceType||firstText(input.sourceType,input.source_type,'unknown'),
      sourceId:existing?.sourceId||firstText(input.sourceId,input.source_id),
      sourceFingerprint:existing?.sourceFingerprint||fingerprints.sourceFingerprint,
      workFingerprint:fingerprints.workFingerprint,
      workType:firstText(input.workType,input.work_type,'commitment'),
      ownership,
      ownerId:firstText(input.ownerId,input.owner_id),
      ownerName:firstText(input.ownerName,input.owner_name),
      actionText:firstText(input.actionText,input.action_text,input.action,input.title),
      objectText:firstText(input.objectText,input.object_text,input.object,input.outcomeText,input.outcome_text,input.outcome),
      outcomeText:firstText(input.outcomeText,input.outcome_text,input.outcome),
      title:firstText(input.title,input.actionText,input.action_text,'Unresolved work item'),
      summary:firstText(input.summary),
      exactSourceQuote:firstText(input.exactSourceQuote,input.exact_source_quote,input.sourceQuote,input.source_quote),
      sourceRefsJson:sourceRefs,
      envelopeJson:fingerprints.envelope,
      projectId:fingerprints.envelope.type==='project'?fingerprints.envelope.id:'',
      projectName:fingerprints.envelope.type==='project'?fingerprints.envelope.name:'',
      relationshipId:fingerprints.envelope.type==='relationship'?fingerprints.envelope.id:'',
      relationshipName:fingerprints.envelope.type==='relationship'?fingerprints.envelope.name:'',
      admissionStatus:admission.admissionStatus,
      lifecycleStatus:existing?.lifecycleStatus||admission.lifecycleStatus,
      dueAt:firstText(input.dueAt,input.due_at)||null,
      dueBasisJson:input.dueBasis||input.due_basis||{},
      confidence:Number(input.confidence||0),
      boardPacketId:firstText(input.boardPacketId,input.board_packet_id),
      observerReceiptsJson:safeArray(input.observerReceipts||input.observer_receipts),
      roundTableRunId:firstText(input.roundTableRunId,input.round_table_run_id),
      chiefRecommendationId:firstText(input.chiefRecommendationId,input.chief_recommendation_id),
      chiefRank:Number.isFinite(Number(input.chiefRank??input.chief_rank))?Number(input.chiefRank??input.chief_rank):null,
      preparedArtifactIdsJson:safeArray(input.preparedArtifactIds||input.prepared_artifact_ids),
      metadataJson:{...(existing?.metadataJson||{}),...(input.metadata||input.metadata_json||{}),sourceProcessingRecordIds,sourceFingerprints,admissionReason:admission.reason},
      createdAt:existing?.createdAt||timestamp,
      updatedAt:timestamp,
      completedAt:existing?.completedAt||null
    };
    let saved;
    if(hasPg())saved=await pgUpsertWork(row);
    else{
      const value=store();
      const index=value.valWorkItems.findIndex(item=>item.id===row.id);
      if(index>=0)value.valWorkItems[index]={...value.valWorkItems[index],...row};
      else value.valWorkItems.unshift(row);
      saveStore(value);
      saved=index>=0?value.valWorkItems[index]:row;
    }
    const event=await saveEvent({
      id:uuid('workevt'),
      ...scoped,
      workItemId:saved.id,
      eventType:existing?'evidence_reconfirmed':'work_admitted',
      previousStatus:existing?.lifecycleStatus||'',
      newStatus:saved.lifecycleStatus,
      sourceRefsJson:incomingSourceRefs,
      payloadJson:{admissionStatus:saved.admissionStatus,ownership:saved.ownership,reason:admission.reason,deduplicated:Boolean(existing)},
      createdAt:timestamp
    });
    if(input.notify!==false&&typeof afterWorkItemEvent==='function')await afterWorkItemEvent({workItem:saved,event}).catch(()=>null);
    return {ok:true,workItem:saved,event,deduplicated:Boolean(existing)};
  }
  async function transition(id,{status,eventType='status_changed',payload={},sourceRefs=[]}={}){
    const allowed=new Set(['open','in_progress','waiting','complete','dismissed','superseded']);
    if(!allowed.has(status))throw new Error(`Unsupported work item lifecycle status: ${status}`);
    let item;
    if(hasPg()){
      const result=await dbQuery(`select * from val_work_items where id=$1 and tenant_id=$2 and user_id=$3 limit 1`,[id,tenantId(),userId()]);
      item=result.rows?.[0]?rowToCamel(result.rows[0]):null;
    }else item=store().valWorkItems.find(row=>row.id===id&&row.tenantId===tenantId()&&row.userId===userId())||null;
    if(!item)throw new Error('Canonical work item not found.');
    const previousStatus=item.lifecycleStatus;
    const updated={...item,lifecycleStatus:status,updatedAt:now(),completedAt:status==='complete'?now():item.completedAt||null};
    if(hasPg())await dbQuery(`update val_work_items set lifecycle_status=$1,updated_at=$2,completed_at=$3 where id=$4 and tenant_id=$5 and user_id=$6`,[updated.lifecycleStatus,updated.updatedAt,updated.completedAt,id,tenantId(),userId()]);
    else{
      const value=store();
      const index=value.valWorkItems.findIndex(row=>row.id===id);
      value.valWorkItems[index]=updated;
      saveStore(value);
    }
    const event=await saveEvent({
      id:uuid('workevt'),
      tenantId:tenantId(),
      userId:userId(),
      workItemId:id,
      eventType,
      previousStatus,
      newStatus:status,
      sourceRefsJson:safeArray(sourceRefs).map(normalizeSourceRef),
      payloadJson:payload,
      createdAt:now()
    });
    if(typeof afterWorkItemEvent==='function')await afterWorkItemEvent({workItem:updated,event}).catch(()=>null);
    return {ok:true,workItem:updated,event};
  }
  async function attachPreparedArtifact(id,{artifactId,sourceRefs=[],metadata={}}={}){
    const preparedArtifactId=firstText(artifactId);
    if(!preparedArtifactId)throw new Error('Prepared artifact ID is required.');
    let item;
    if(hasPg()){
      const result=await dbQuery(`select * from val_work_items where id=$1 and tenant_id=$2 and user_id=$3 limit 1`,[id,tenantId(),userId()]);
      item=result.rows?.[0]?rowToCamel(result.rows[0]):null;
    }else item=store().valWorkItems.find(row=>row.id===id&&row.tenantId===tenantId()&&row.userId===userId())||null;
    if(!item)throw new Error('Canonical work item not found.');
    const existingIds=safeArray(item.preparedArtifactIdsJson);
    if(existingIds.includes(preparedArtifactId))return {ok:true,workItem:item,event:null,attached:false};
    const preparedArtifactIdsJson=[...existingIds,preparedArtifactId];
    const updated={
      ...item,
      preparedArtifactIdsJson,
      metadataJson:{
        ...(item.metadataJson||{}),
        ...metadata,
        latestPreparedArtifactId:preparedArtifactId
      },
      updatedAt:now()
    };
    if(hasPg()){
      await dbQuery(
        `update val_work_items set prepared_artifact_ids_json=$1,metadata_json=$2,updated_at=$3 where id=$4 and tenant_id=$5 and user_id=$6`,
        [JSON.stringify(updated.preparedArtifactIdsJson),JSON.stringify(updated.metadataJson),updated.updatedAt,id,tenantId(),userId()]
      );
    }else{
      const value=store();
      const index=value.valWorkItems.findIndex(row=>row.id===id);
      value.valWorkItems[index]=updated;
      saveStore(value);
    }
    const event=await saveEvent({
      id:uuid('workevt'),
      tenantId:tenantId(),
      userId:userId(),
      workItemId:id,
      eventType:'prepared_artifact_attached',
      previousStatus:item.lifecycleStatus,
      newStatus:item.lifecycleStatus,
      sourceRefsJson:safeArray(sourceRefs).map(normalizeSourceRef),
      payloadJson:{preparedArtifactId,noExternalAction:true},
      createdAt:now()
    });
    if(typeof afterWorkItemEvent==='function')await afterWorkItemEvent({workItem:updated,event}).catch(()=>null);
    return {ok:true,workItem:updated,event,attached:true};
  }
  async function recordDecision(id,{eventType='work_decision_recorded',decisionId='',payload={},sourceRefs=[]}={}){
    let item;
    if(hasPg()){
      const result=await dbQuery(`select * from val_work_items where id=$1 and tenant_id=$2 and user_id=$3 limit 1`,[id,tenantId(),userId()]);
      item=result.rows?.[0]?rowToCamel(result.rows[0]):null;
    }else item=store().valWorkItems.find(row=>row.id===id&&row.tenantId===tenantId()&&row.userId===userId())||null;
    if(!item)throw new Error('Canonical work item not found.');
    const normalizedPayload={...payload,decisionId:firstText(decisionId,payload.decisionId,payload.decision_id),noExternalAction:true};
    const decisionIdentityPayload={...normalizedPayload};
    delete decisionIdentityPayload.reviewedAt;
    delete decisionIdentityPayload.reviewed_at;
    delete decisionIdentityPayload.recordedAt;
    delete decisionIdentityPayload.recorded_at;
    if(decisionIdentityPayload.decision&&typeof decisionIdentityPayload.decision==='object'){
      decisionIdentityPayload.decision={...decisionIdentityPayload.decision};
      delete decisionIdentityPayload.decision.reviewedAt;
      delete decisionIdentityPayload.decision.reviewed_at;
      delete decisionIdentityPayload.decision.recordedAt;
      delete decisionIdentityPayload.decision.recorded_at;
    }
    const eventId=`workevt_${stableHash([
      tenantId(),
      userId(),
      id,
      eventType,
      normalizedPayload.decisionId,
      JSON.stringify(decisionIdentityPayload)
    ].join('|')).slice(0,32)}`;
    const event=await saveEvent({
      id:eventId,
      tenantId:tenantId(),
      userId:userId(),
      workItemId:id,
      eventType,
      previousStatus:item.lifecycleStatus,
      newStatus:item.lifecycleStatus,
      sourceRefsJson:safeArray(sourceRefs).map(normalizeSourceRef),
      payloadJson:normalizedPayload,
      createdAt:now()
    });
    return {ok:true,workItem:item,event};
  }
  async function recordChiefOrdering(id,{
    boardPacketId='',
    observerReceipts=[],
    roundTableRunId='',
    chiefRecommendationId='',
    chiefRank=null,
    chiefScore=null,
    chiefPriorityMatches=[],
    sourceRefs=[]
  }={}){
    let item;
    if(hasPg()){
      const result=await dbQuery(`select * from val_work_items where id=$1 and tenant_id=$2 and user_id=$3 limit 1`,[id,tenantId(),userId()]);
      item=result.rows?.[0]?rowToCamel(result.rows[0]):null;
    }else item=store().valWorkItems.find(row=>row.id===id&&row.tenantId===tenantId()&&row.userId===userId())||null;
    if(!item)throw new Error('Canonical work item not found.');
    const rank=Number.isFinite(Number(chiefRank))?Number(chiefRank):null;
    const score=Number.isFinite(Number(chiefScore))?Number(chiefScore):Number(item.metadataJson?.chiefScore||0);
    const receipts=safeArray(observerReceipts);
    const unchanged=String(item.chiefRecommendationId||'')===String(chiefRecommendationId||'')
      && String(item.roundTableRunId||'')===String(roundTableRunId||'')
      && Number(item.chiefRank??-1)===Number(rank??-1)
      && Number(item.metadataJson?.chiefScore||0)===score
      && String(item.boardPacketId||'')===String(boardPacketId||'');
    if(unchanged)return {ok:true,workItem:item,event:null,recorded:false};
    const updated={
      ...item,
      boardPacketId:firstText(boardPacketId,item.boardPacketId),
      observerReceiptsJson:receipts.length?receipts:item.observerReceiptsJson,
      roundTableRunId:firstText(roundTableRunId,item.roundTableRunId),
      chiefRecommendationId:firstText(chiefRecommendationId,item.chiefRecommendationId),
      chiefRank:rank,
      metadataJson:{
        ...(item.metadataJson||{}),
        chiefScore:score,
        chiefPriorityMatches:safeArray(chiefPriorityMatches),
        chiefOrderedAt:now()
      },
      updatedAt:now()
    };
    if(hasPg()){
      await dbQuery(
        `update val_work_items set board_packet_id=$1,observer_receipts_json=$2,round_table_run_id=$3,chief_recommendation_id=$4,chief_rank=$5,metadata_json=$6,updated_at=$7 where id=$8 and tenant_id=$9 and user_id=$10`,
        [updated.boardPacketId,JSON.stringify(updated.observerReceiptsJson),updated.roundTableRunId,updated.chiefRecommendationId,updated.chiefRank,JSON.stringify(updated.metadataJson),updated.updatedAt,id,tenantId(),userId()]
      );
    }else{
      const value=store();
      const index=value.valWorkItems.findIndex(row=>row.id===id);
      value.valWorkItems[index]=updated;
      saveStore(value);
    }
    const event=await saveEvent({
      id:uuid('workevt'),
      tenantId:tenantId(),
      userId:userId(),
      workItemId:id,
      eventType:'chief_ordered',
      previousStatus:item.lifecycleStatus,
      newStatus:item.lifecycleStatus,
      sourceRefsJson:safeArray(sourceRefs).map(normalizeSourceRef),
      payloadJson:{boardPacketId,roundTableRunId,chiefRecommendationId,chiefRank:rank,chiefScore:score,chiefPriorityMatches:safeArray(chiefPriorityMatches),noExternalAction:true},
      createdAt:now()
    });
    return {ok:true,workItem:updated,event,recorded:true};
  }
  async function rebalanceChiefQueue(){
    const result=await list({admissionStatus:'admitted',ownership:'user',limit:500});
    const eligible=result.workItems
      .filter(item=>!['complete','dismissed','superseded'].includes(item.lifecycleStatus))
      .filter(item=>item.chiefRecommendationId)
      .sort((a,b)=>{
        const scoreDelta=Number(b.metadataJson?.chiefScore||0)-Number(a.metadataJson?.chiefScore||0);
        if(scoreDelta)return scoreDelta;
        const aDue=a.dueAt?Date.parse(a.dueAt):Number.POSITIVE_INFINITY;
        const bDue=b.dueAt?Date.parse(b.dueAt):Number.POSITIVE_INFINITY;
        if(aDue!==bDue)return aDue-bDue;
        return String(a.createdAt||'').localeCompare(String(b.createdAt||''));
      });
    const changed=[];
    for(const [index,item] of eligible.entries()){
      const chiefRank=index+1;
      if(Number(item.chiefRank)===chiefRank)continue;
      const updated={...item,chiefRank,updatedAt:now()};
      if(hasPg()){
        await dbQuery(
          `update val_work_items set chief_rank=$1,updated_at=$2 where id=$3 and tenant_id=$4 and user_id=$5`,
          [chiefRank,updated.updatedAt,item.id,tenantId(),userId()]
        );
      }else{
        const value=store();
        const itemIndex=value.valWorkItems.findIndex(row=>row.id===item.id);
        if(itemIndex>=0)value.valWorkItems[itemIndex]=updated;
        saveStore(value);
      }
      await saveEvent({
        id:uuid('workevt'),
        tenantId:tenantId(),
        userId:userId(),
        workItemId:item.id,
        eventType:'chief_queue_rebalanced',
        previousStatus:item.lifecycleStatus,
        newStatus:item.lifecycleStatus,
        sourceRefsJson:[],
        payloadJson:{previousChiefRank:item.chiefRank??null,chiefRank,noExternalAction:true},
        createdAt:updated.updatedAt
      });
      changed.push(updated);
    }
    return {ok:true,workItems:eligible.map((item,index)=>({...item,chiefRank:index+1})),changedCount:changed.length};
  }
  async function list({admissionStatus='',lifecycleStatus='',ownership='',limit=100}={}){
    const bounded=Math.max(1,Math.min(Number(limit)||100,500));
    if(hasPg()){
      const params=[tenantId(),userId()];
      const where=['tenant_id=$1','user_id=$2'];
      if(admissionStatus){params.push(admissionStatus);where.push(`admission_status=$${params.length}`);}
      if(lifecycleStatus){params.push(lifecycleStatus);where.push(`lifecycle_status=$${params.length}`);}
      if(ownership){params.push(ownership);where.push(`ownership=$${params.length}`);}
      params.push(bounded);
      const result=await dbQuery(`select * from val_work_items where ${where.join(' and ')} order by updated_at desc limit $${params.length}`,params);
      return {ok:true,workItems:safeArray(result.rows).map(rowToCamel)};
    }
    const rows=store().valWorkItems
      .filter(item=>item.tenantId===tenantId()&&item.userId===userId())
      .filter(item=>!admissionStatus||item.admissionStatus===admissionStatus)
      .filter(item=>!lifecycleStatus||item.lifecycleStatus===lifecycleStatus)
      .filter(item=>!ownership||item.ownership===ownership)
      .slice(0,bounded);
    return {ok:true,workItems:rows};
  }
  async function taskProjection({limit=100}={}){
    const result=await list({admissionStatus:'admitted',ownership:'user',limit});
    const workItems=result.workItems
      .filter(item=>!['complete','dismissed','superseded'].includes(item.lifecycleStatus))
      .sort((a,b)=>{
        const aRank=a.chiefRank!==null&&a.chiefRank!==undefined&&Number.isFinite(Number(a.chiefRank))?Number(a.chiefRank):Number.POSITIVE_INFINITY;
        const bRank=b.chiefRank!==null&&b.chiefRank!==undefined&&Number.isFinite(Number(b.chiefRank))?Number(b.chiefRank):Number.POSITIVE_INFINITY;
        if(aRank!==bRank)return aRank-bRank;
        return String(b.updatedAt||'').localeCompare(String(a.updatedAt||''));
      });
    const canonicalTasks=await Promise.all(workItems.map(async item=>{
      const sourceProcessingRecordIds=[...new Set([
        ...safeArray(item.metadataJson?.sourceProcessingRecordIds),
        item.sourceProcessingRecordId
      ].filter(Boolean))];
      const sourceRecords=typeof loadSourceProcessingRecord==='function'
        ? (await Promise.all(sourceProcessingRecordIds.map(id=>
            loadSourceProcessingRecord(id).catch(()=>null)
          ))).filter(Boolean)
        : [];
      const sourcePackets=sourceRecords.map((sourceRecord,index)=>{
        const sourceReceipt=sourceRecord.sourceReceiptJson||sourceRecord.source_receipt_json||{};
        const rawText=String(sourceReceipt.rawText||sourceReceipt.raw_text||'').trim();
        return {
          source_processing_record_id:sourceRecord.id||sourceProcessingRecordIds[index],
          source_type:sourceRecord.sourceType||sourceRecord.source_type||item.sourceType,
          source_id:sourceRecord.sourceId||sourceRecord.source_id||item.sourceId,
          source_title:sourceRecord.sourceTitle||sourceRecord.source_title||'',
          source_version:sourceRecord.sourceVersion||sourceRecord.source_version||null,
          source_fingerprint:sourceRecord.sourceFingerprint||sourceRecord.source_fingerprint||'',
          context_excerpt:boundedSourceContext(rawText,item.exactSourceQuote,8000)
        };
      });
      const sourceContext=boundedSourceContext(
        sourcePackets.map((packet,index)=>[
          `[Source ${index+1}: ${packet.source_title||packet.source_type||'evidence'}]`,
          packet.context_excerpt
        ].filter(Boolean).join('\n')).join('\n\n'),
        item.exactSourceQuote,
        16000
      );
      const primarySourcePacket=sourcePackets[0]||{
        source_processing_record_id:item.sourceProcessingRecordId,
        source_type:item.sourceType,
        source_id:item.sourceId,
        source_version:null,
        source_fingerprint:item.sourceFingerprint,
        context_excerpt:''
      };
      const workingBrief={
        objective:item.title,
        sourceSummary:item.summary||item.outcomeText||'',
        sourceQuote:item.exactSourceQuote,
        sourceRefs:item.sourceRefsJson,
        contextLines:[
          item.outcomeText,
          item.projectName?`Project: ${item.projectName}`:'',
          item.relationshipName?`Relationship: ${item.relationshipName}`:'',
          sourceContext
        ].filter(Boolean),
        sourceContext:{
          sourceType:item.sourceType,
          sourceId:item.sourceId,
          sourceProcessingRecordId:item.sourceProcessingRecordId,
          sourceProcessingRecordIds,
          immutableSourceVersion:primarySourcePacket.source_version,
          immutableSourceVersions:sourcePackets.map(packet=>({
            sourceProcessingRecordId:packet.source_processing_record_id,
            sourceVersion:packet.source_version,
            sourceFingerprint:packet.source_fingerprint
          }))
        },
        sourcePackets,
        envelope:item.envelopeJson,
        projectName:item.projectName,
        relationshipName:item.relationshipName
      };
      return {
      id:item.id,
      title:item.title,
      description:item.summary||item.outcomeText||'',
      evidence_quote:item.exactSourceQuote,
      source_type:item.sourceType,
      source_id:item.sourceId,
      source_refs:item.sourceRefsJson,
      source_processing_record_id:item.sourceProcessingRecordId,
      owner_type:'user',
      owner_name:item.ownerName||'You',
      status:item.lifecycleStatus,
      confidence:Number(item.confidence||0),
      confidence_score:Number(item.confidence||0),
      due_at:item.dueAt,
      project_id:item.projectId,
      project_name:item.projectName,
      relationship_id:item.relationshipId,
      relationship_name:item.relationshipName,
      envelope:item.envelopeJson,
      prepared_artifact_ids:item.preparedArtifactIdsJson,
      chief_recommendation_id:item.chiefRecommendationId,
      chief_rank:item.chiefRank,
      chief_score:Number(item.metadataJson?.chiefScore||0),
      canonical_work_item_id:item.id,
      working_brief:workingBrief,
      source_packet:{
        ...primarySourcePacket,
        canonical_work_item_id:item.id,
        context_excerpt:sourceContext
      },
      source_packets:sourcePackets.map(packet=>({...packet,canonical_work_item_id:item.id})),
      updated_at:item.updatedAt,
      created_at:item.createdAt
      };
    }));
    const transcriptTasks=typeof loadTranscriptTasks==='function'
      ? safeArray(await loadTranscriptTasks({limit:Math.max(100,Math.min(Number(limit)||100,500))}))
      : [];
    const transcriptKeys=new Set(transcriptTasks.map(task=>[
      task.source_id||task.transcript_id||'',
      normalizedKey(task.title||task.evidence_quote||'')
    ].join('|')));
    const tasks=[
      ...transcriptTasks,
      ...canonicalTasks.filter(task=>!transcriptKeys.has([
        task.source_id||'',
        normalizedKey(task.title||task.evidence_quote||'')
      ].join('|')))
    ];
    return {
      ok:true,
      tasks,
      openCount:tasks.length,
      source:transcriptTasks.length?'canonical_work_plus_transcript_action_items':'canonical_work_items',
      filters:{ownership:'user',admissionStatus:'admitted',excludedLifecycleStatuses:['complete','dismissed','superseded'],transcriptActionItems:'all_open'}
    };
  }
  async function eventsFor(id){
    if(hasPg()){
      const result=await dbQuery(`select * from val_work_item_events where tenant_id=$1 and user_id=$2 and work_item_id=$3 order by created_at asc`,[tenantId(),userId(),id]);
      return {ok:true,events:safeArray(result.rows).map(rowToCamel)};
    }
    return {ok:true,events:store().valWorkItemEvents.filter(event=>event.tenantId===tenantId()&&event.userId===userId()&&event.workItemId===id)};
  }
  return {admit,transition,attachPreparedArtifact,recordDecision,recordChiefOrdering,rebalanceChiefQueue,list,taskProjection,eventsFor};
}

module.exports={
  createValCanonicalWorkService,
  admissionFor,
  canonicalEnvelope,
  canonicalFingerprints,
  normalizeOwnership,
  boundedSourceContext
};
