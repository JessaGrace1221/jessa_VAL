const {createValPromptRegistry} = require('./valPromptRegistry');

const DEFAULT_OBSERVERS = [
  {observerName:'Executive Inbox',promptKey:'executive_inbox'},
  {observerName:'Relationship',promptKey:'relationship_project_understanding'},
  {observerName:'Project',promptKey:'relationship_project_understanding'},
  {observerName:'Capacity',promptKey:'chief_of_staff'},
  {observerName:'Courage',promptKey:'chief_of_staff'},
  {observerName:'Delight',promptKey:'chief_of_staff'},
  {observerName:'Opportunity',promptKey:'crm'},
  {observerName:'Momentum',promptKey:'momentum'},
  {observerName:'Meaning',promptKey:'momentum'},
  {observerName:'Synchronicity',promptKey:'chief_of_staff'},
  {observerName:'Commitment',promptKey:'transcript_intake'},
  {observerName:'Calendar',promptKey:'calendar_meeting_prep'},
  {observerName:'Environment',promptKey:'event_intelligence_pass'},
  {observerName:'Witnessing',promptKey:'chief_of_staff'}
];

function safeArray(value){ return Array.isArray(value) ? value : []; }
function compactText(value,limit=500){
  return String(value||'').replace(/\s+/g,' ').trim().slice(0,limit);
}
function jsonValue(value,fallback){
  if(value==null) return fallback;
  if(typeof value==='string'){
    try{return JSON.parse(value);}catch(_){return fallback;}
  }
  return value;
}
function iso(value){
  if(!value) return '';
  if(value instanceof Date) return value.toISOString();
  if(value.toISOString) return value.toISOString();
  return String(value);
}
function normalizeSourceRef(ref={}){
  return {
    source_type:String(ref.source_type||ref.sourceType||ref.type||'unknown'),
    source_id:String(ref.source_id||ref.sourceId||ref.id||''),
    quote_or_summary:compactText(ref.quote_or_summary||ref.quoteOrSummary||ref.summary||ref.quote||'',900),
    confidence:Math.max(0,Math.min(1,Number(ref.confidence)||0)),
    created_at:ref.created_at||ref.createdAt||new Date().toISOString()
  };
}
function sourceRefsFromRows(rows=[],sourceType='unknown',summaryKey='summary',idKey='id',limit=8){
  return safeArray(rows).slice(0,limit).map(row=>normalizeSourceRef({
    sourceType,
    sourceId:row[idKey]||row.id||row.sourceId||'',
    quoteOrSummary:row[summaryKey]||row.title||row.displayName||row.rawText||row.raw_text||'',
    confidence:row.confidence||0.65,
    createdAt:row.createdAt||row.created_at||row.updatedAt||row.updated_at||''
  }));
}
const OBSERVER_PACKET_LENSES = {
  'Executive Inbox':{
    lens:'attention and reply judgment',
    sees:'whether this creates a reply, draft, or inbox decision',
    concern:'communication loops could remain unowned',
    question:'Does this need human judgment?'
  },
  Relationship:{
    lens:'trust and relational warmth',
    sees:'whether this changes trust, warmth, distance, or repair',
    concern:'relationship context could be flattened into a task',
    question:'What changed between people?'
  },
  Project:{
    lens:'project movement and dependencies',
    sees:'whether this changes progress, blockers, ownership, or scope',
    concern:'work could move without a clear project anchor',
    question:'What project does this move?'
  },
  Capacity:{
    lens:'tradeoffs and decision quality',
    sees:'whether this adds load, pressure, recovery need, or timing strain',
    concern:'the system could protect output while degrading judgment',
    question:'What does this cost?'
  },
  Courage:{
    lens:'truth without comfort',
    sees:'whether this reveals avoidance, directness, or a needed challenge',
    concern:'the hard truth could be softened into politeness',
    question:'What is being avoided?'
  },
  Delight:{
    lens:'aliveness and restoration',
    sees:'whether this protects curiosity, energy, joy, or human connection',
    concern:'life could disappear from an otherwise effective day',
    question:'Where is life here?'
  },
  Opportunity:{
    lens:'openings and mutual value',
    sees:'whether this creates timing, demand, introduction, or revenue signal',
    concern:'an opening could be missed because it arrived quietly',
    question:'What opening is present?'
  },
  Momentum:{
    lens:'movement over perfection',
    sees:'whether this creates real movement, friction, or next-step clarity',
    concern:'activity could be mistaken for progress',
    question:'What is moving now?'
  },
  Meaning:{
    lens:'purpose and wider pattern',
    sees:'whether this connects to values, story, purpose, or recurring themes',
    concern:'execution could drift from what actually matters',
    question:'Why does this matter?'
  },
  Synchronicity:{
    lens:'cross-context convergence',
    sees:'whether this echoes another signal, timing cluster, or repeated arrival',
    concern:'a meaningful pattern could be dismissed as coincidence',
    question:'What is repeating?'
  },
  Commitment:{
    lens:'promises and follow-through',
    sees:'whether this creates, fulfills, or threatens a promise',
    concern:'trust could leak through small unclosed loops',
    question:'What was promised?'
  },
  Calendar:{
    lens:'time reality',
    sees:'whether this affects schedule, prep, availability, or timing',
    concern:'time could be treated as flexible when it is not',
    question:'When does this matter?'
  },
  Environment:{
    lens:'conditions around the work',
    sees:'whether this depends on location, travel, body, interruption, or external condition',
    concern:'context outside the screen could be ignored',
    question:'What condition changes this?'
  },
  Witnessing:{
    lens:'direct user-revealed truth',
    sees:'whether this aligns with or updates what the user has revealed about herself',
    concern:'VAL could advise from data while forgetting the person',
    question:'What did she already tell us?'
  }
};
function packetRouteForObserver(packet={},observerName=''){
  return safeArray(packet.routeObserversJson||packet.route_observers_json).find(route=>route.observerName===observerName)||null;
}
function packetPrimaryForObserver(packet={},observerName=''){
  const primary=safeArray(packet.primaryObserversJson||packet.primary_observers_json);
  return primary.includes(observerName)||!!packetRouteForObserver(packet,observerName)?.primary;
}
function buildPacketReview(observerName,packet={},context={}){
  const lens=OBSERVER_PACKET_LENSES[observerName]||{
    lens:`${observerName} lens`,
    sees:'whether this packet changes the observer perspective',
    concern:'the signal could be missed',
    question:'What does this change?'
  };
  const payload=packet.payloadJson||packet.payload_json||packet.payload||{};
  const packetObserverReview=safeArray(payload.observerReviews||payload.observer_reviews)
    .find(review=>review&&review.observerName===observerName);
  const packetId=String(packet.id||packet.packetId||'');
  const sourceType=String(packet.sourceType||packet.source_type||'unknown');
  const packetType=String(packet.packetType||packet.packet_type||'learning_packet');
  const title=compactText(packet.title||packetType.replace(/_/g,' '),180);
  const summary=compactText(packet.summary||packet.description||'',520);
  const route=packetRouteForObserver(packet,observerName);
  const primary=packetPrimaryForObserver(packet,observerName);
  const triggered=safeArray(context.event?.packetIds).includes(packetId);
  const observed=packetObserverReview ? packetObserverReview.status !== 'no_signal' : true;
  const reviewEvidence=packetObserverReview?.evidence||{};
  const reviewEvidenceRef=reviewEvidence.quoteOrSummary||reviewEvidence.quote_or_summary
    ? [normalizeSourceRef({
        sourceType:reviewEvidence.sourceType||reviewEvidence.source_type||sourceType,
        sourceId:reviewEvidence.sourceId||reviewEvidence.source_id||packet.sourceId||packet.source_id||'',
        quoteOrSummary:reviewEvidence.quoteOrSummary||reviewEvidence.quote_or_summary,
        confidence:reviewEvidence.confidence||0.65,
        createdAt:reviewEvidence.createdAt||reviewEvidence.created_at||packet.createdAt||packet.created_at
      })]
    : [];
  const evidence=safeArray(packet.sourceRefsJson||packet.source_refs_json||packet.sourceRefs).map(normalizeSourceRef).slice(0,6);
  const baseConfidence=observed ? (primary?0.72:0.56) : 0.22;
  const evidenceBoost=summary?0.08:0;
  const triggerBoost=triggered?0.06:0;
  const lensFinding=compactText(packetObserverReview?.lensFinding||packetObserverReview?.lens_finding||packetObserverReview?.observation||'',720);
  const observation=compactText(packetObserverReview?.observation||packetObserverReview?.lensFinding||packetObserverReview?.lens_finding||'',900);
  return {
    packetId,
    sourceType,
    sourceId:String(packet.sourceId||packet.source_id||''),
    packetType,
    title,
    summary,
    status:observed?'observed':'no_signal',
    evidence:reviewEvidenceRef.length ? reviewEvidenceRef : evidence,
    observerName,
    lens:lens.lens,
    primary,
    triggered,
    routeReason:route?.reason||`${observerName} can use this packet as shared Board context.`,
    seeing:lensFinding||`${observerName} is checking ${lens.sees}.`,
    observation:observation||lensFinding||'',
    people:safeArray(packetObserverReview?.people).slice(0,8),
    projects:safeArray(packetObserverReview?.projects).slice(0,6),
    decisionObjects:safeArray(packetObserverReview?.decisionObjects||packetObserverReview?.decision_objects).slice(0,6),
    matchedTerms:safeArray(packetObserverReview?.matchedTerms||packetObserverReview?.matched_terms).slice(0,6),
    concern:lens.concern,
    question:lens.question,
    confidence:Math.max(0.18,Math.min(0.92,baseConfidence+(observed?evidenceBoost:0)+triggerBoost)),
    reviewedAt:context.generatedAt||new Date().toISOString(),
    reflectionMode:'deterministic_lens_v1'
  };
}
function buildPacketReviews(observerName,context={}){
  return safeArray(context.boardPackets)
    .filter(packet=>packet&&!packet.prototype)
    .slice(0,60)
    .map(packet=>buildPacketReview(observerName,packet,context));
}
const CHIEF_PRIORITY_LENSES = [
  {key:'revenue',label:'Revenue',test:/\b(revenue|money|sales?|proposal|pricing|paid|contract|deal|opportunit(?:y|ies)|pipeline)\b/i,observers:['Opportunity'],weight:16},
  {key:'capacity',label:'Capacity',test:/\b(capacity|energy|load|bandwidth|tradeoffs?|overload|decision quality|time cost|recovery)\b/i,observers:['Capacity','Calendar','Environment'],weight:16},
  {key:'values',label:'Values',test:/\b(values?|principles?|purpose|meaning|integrity|alignment|what matters|mission)\b/i,observers:['Meaning','Witnessing','Courage'],weight:16},
  {key:'relationship',label:'Relationships',test:/\b(relationships?|trust|warmth|repair|connection|people|client|partner)\b/i,observers:['Relationship','Delight','Commitment'],weight:14},
  {key:'promises',label:'Promises',test:/\b(promises?|commitments?|follow[- ]?through|open loops?|owed|due|deliverable)\b/i,observers:['Commitment','Momentum'],weight:14},
  {key:'urgency',label:'Urgency',test:/\b(urgency|urgent|deadline|time[- ]?sensitive|soon|today|tomorrow|now)\b/i,observers:['Calendar','Momentum','Executive Inbox'],weight:12},
  {key:'truth',label:'Truth',test:/\b(truth|direct|avoidance|hard thing|challenge|honest|plain language)\b/i,observers:['Courage','Meaning'],weight:12},
  {key:'delight',label:'Delight',test:/\b(delight|joy|curiosity|life|play|aliveness|restore|grounding)\b/i,observers:['Delight','Capacity'],weight:12},
  {key:'synchronicity',label:'Synchronicity',test:/\b(synchronicity|pattern|repeating|coincidence|convergence|echo|cluster)\b/i,observers:['Synchronicity','Meaning'],weight:10},
  {key:'environment',label:'Environment',test:/\b(environment|body|travel|location|weather|external condition|interruption)\b/i,observers:['Environment','Capacity'],weight:10}
];
function itemTextForChiefPriorities(item={}){
  return [
    item.category,
    item.title,
    item.summary,
    item.rawText,
    item.raw_text,
    item.rawResponse,
    item.raw_response,
    item.structuredSummary?.integrityChain?.V?.answer,
    item.structuredSummary?.integrityChain?.O?.claim,
    item.payloadJson?.category,
    item.payloadJson?.title,
    item.payloadJson?.rawResponse,
    item.payloadJson?.structuredSummary?.integrityChain?.V?.answer,
    item.payload?.category,
    item.payload?.title,
    item.payload?.rawResponse
  ].filter(Boolean).join(' ');
}
function chiefPriorityRules(context={}){
  const rows=[
    ...safeArray(context.teachVal),
    ...safeArray(context.boardPackets).filter(packet=>String(packet.sourceType||packet.source_type||'')==='witnessing')
  ];
  const relevant=rows
    .map(row=>({row,text:itemTextForChiefPriorities(row)}))
    .filter(item=>/chief|priorit|optimi[sz]e|decision_weight|home_briefing|alignment_priority|revenue|capacity|values|urgency|relationship|promises/i.test(item.text));
  const rules=[];
  for(const lens of CHIEF_PRIORITY_LENSES){
    const source=relevant.find(item=>lens.test.test(item.text));
    if(source){
      rules.push({
        key:lens.key,
        label:lens.label,
        observers:lens.observers,
        weight:lens.weight,
        sourceTitle:compactText(source.row.title||source.row.category||source.row.packetType||source.row.packet_type||'Witnessing priority',120),
        sourceExcerpt:compactText(source.text,240)
      });
    }
  }
  return rules;
}
  function chiefPriorityMatch(packetCandidate={},priorityRules=[]){
  const text=[
    packetCandidate.title,
    packetCandidate.summary,
    packetCandidate.sourceType,
    packetCandidate.packetType
  ].join(' ');
  const matches=[];
  let boost=0;
  for(const rule of safeArray(priorityRules)){
    const observerMatch=safeArray(rule.observers).some(observer=>safeArray(packetCandidate.primaryObservers).includes(observer));
    if(observerMatch || CHIEF_PRIORITY_LENSES.find(lens=>lens.key===rule.key)?.test.test(text)){
      matches.push({key:rule.key,label:rule.label,sourceTitle:rule.sourceTitle,weight:rule.weight});
      boost += Number(rule.weight||0);
    }
  }
    return {boost,matches};
  }
  function chiefQueuePacketReceipt(packetCandidate={}){
    if(!packetCandidate)return null;
    return {
      title:packetCandidate.title,
      packetId:packetCandidate.packetId,
      sourceType:packetCandidate.sourceType,
      sourceId:packetCandidate.sourceId,
      packetType:packetCandidate.packetType,
      observerCount:packetCandidate.observerCount,
      score:packetCandidate.score,
      primaryObservers:packetCandidate.primaryObservers,
      triggeredObservers:packetCandidate.triggeredObservers,
      chiefPriorityMatches:packetCandidate.chiefPriorityMatches,
      evidence:packetCandidate.evidence,
      summary:packetCandidate.summary,
      observers:packetCandidate.observers
    };
  }
function rowToObject(row={}){
  const out={};
  for(const [k,v] of Object.entries(row||{})) out[k]=v instanceof Date?v.toISOString():v;
  return out;
}
function parseRecord(row){
  if(!row) return null;
  const out=rowToObject(row);
  for(const key of Object.keys(out)){
    if(/_json$/.test(key)) out[key]=jsonValue(out[key],out[key]);
  }
  return out;
}

function createValIntelligenceSpine({
  dbQuery,
  hasPg=()=>false,
  getStore=()=>({}),
  saveStore=()=>{},
  uuid=(prefix)=>`${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`,
  tenantId=()=>'default',
  userId=()=>'default',
  logger=console,
  promptRegistry=createValPromptRegistry(),
  loaders={}
}={}){
  function now(){ return new Date().toISOString(); }
  function spineStore(){
    const store=getStore()||{};
    for(const key of ['eventIntelligenceRuns','observerRuns','roundTableRuns','chiefOfStaffRecommendations','momentumSnapshots','readyForYouItems']){
      if(!Array.isArray(store[key])) store[key]=[];
    }
    return store;
  }
  function currentScope(){
    return {tenantId:tenantId(),userId:userId()};
  }
  async function pgInsert(table,row,columns,returning='*'){
    const values=columns.map(c=>row[c]);
    const params=columns.map((_,i)=>`$${i+1}`).join(',');
    const names=columns.map(c=>c.replace(/[A-Z]/g,m=>'_'+m.toLowerCase())).join(',');
    const r=await dbQuery(`insert into ${table} (${names}) values (${params}) returning ${returning}`,values);
    return r?.rows?.[0] ? parseRecord(r.rows[0]) : row;
  }
  async function pgList(table,{where='',params=[],limit=30,order='created_at desc'}={}){
    const lim=Math.max(1,Math.min(Number(limit)||30,200));
    const r=await dbQuery(`select * from ${table} ${where?`where ${where}`:''} order by ${order} limit ${lim}`,params);
    return (r?.rows||[]).map(parseRecord);
  }
  async function saveEventRun(row){
    const clean={...row};
    if(hasPg()){
      return pgInsert('event_intelligence_runs',clean,[
        'id','tenantId','userId','eventType','eventSourceType','eventSourceId','status','contextPacketJson','unknownsJson','sourceRefsJson','resultJson','errorMessage','createdAt','completedAt'
      ]);
    }
    const store=spineStore();
    store.eventIntelligenceRuns.unshift(clean);
    saveStore(store);
    return clean;
  }
  async function updateEventRun(id,patch){
    if(hasPg()){
      const r=await dbQuery(`update event_intelligence_runs set status=$1,result_json=$2,unknowns_json=$3,source_refs_json=$4,error_message=$5,completed_at=$6 where id=$7 and tenant_id=$8 and user_id=$9 returning *`,[
        patch.status||'completed',JSON.stringify(patch.resultJson||{}),JSON.stringify(patch.unknownsJson||[]),JSON.stringify(patch.sourceRefsJson||[]),patch.errorMessage||null,patch.completedAt||now(),id,tenantId(),userId()
      ]);
      return r?.rows?.[0]?parseRecord(r.rows[0]):null;
    }
    const store=spineStore();
    const row=store.eventIntelligenceRuns.find(r=>r.id===id);
    if(row) Object.assign(row,patch);
    saveStore(store);
    return row;
  }
  async function saveObserverRun(row){
    if(hasPg()){
      return pgInsert('observer_runs',row,[
        'id','tenantId','userId','eventRunId','observerName','promptKey','promptSource','status','contextPacketJson','outputJson','confidence','conviction','unknownsJson','evidenceRefsJson','closingStatement','errorMessage','createdAt'
      ]);
    }
    const store=spineStore();store.observerRuns.unshift(row);saveStore(store);return row;
  }
  async function saveRoundTableRun(row){
    if(hasPg()){
      return pgInsert('round_table_runs',row,[
        'id','tenantId','userId','eventRunId','observerRunIds','agreementsJson','conflictsJson','candidateTensionsJson','opposingViewsJson','uncertaintyJson','outputJson','sourceRefsJson','createdAt'
      ]);
    }
    const store=spineStore();store.roundTableRuns.unshift(row);saveStore(store);return row;
  }
  async function saveChiefRecommendation(row){
    if(hasPg()){
      return pgInsert('chief_of_staff_recommendations',row,[
        'id','tenantId','userId','eventRunId','roundTableRunId','status','title','recommendation','why','confidence','opposingView','anxietyVsMomentumJson','nextCandidatesJson','observerRunIds','sourceRefsJson','userFeedbackJson','createdAt','updatedAt','completedAt'
      ]);
    }
    const store=spineStore();store.chiefOfStaffRecommendations.unshift(row);saveStore(store);return row;
  }
  async function saveMomentumSnapshot(row){
    if(hasPg()){
      return pgInsert('momentum_snapshots',row,[
        'id','tenantId','userId','eventRunId','summary','direction','velocityJson','dimensionsJson','invisibleMomentumJson','meaningJson','sourceRefsJson','createdAt'
      ]);
    }
    const store=spineStore();store.momentumSnapshots.unshift(row);saveStore(store);return row;
  }
  async function saveReadyForYouItem(row){
    if(hasPg()){
      return pgInsert('ready_for_you_items',row,[
        'id','tenantId','userId','eventRunId','status','title','itemType','readinessJson','whatValPrepared','whatUserNeedsToDo','sourceRefsJson','metadataJson','createdAt','updatedAt'
      ]);
    }
    const store=spineStore();store.readyForYouItems.unshift(row);saveStore(store);return row;
  }
  async function listEventRuns({limit=30}={}){
    if(hasPg()) return pgList('event_intelligence_runs',{where:'tenant_id=$1 and user_id=$2',params:[tenantId(),userId()],limit});
    return spineStore().eventIntelligenceRuns.filter(r=>r.tenantId===tenantId()&&r.userId===userId()).slice(0,limit);
  }
  async function listObserverRuns({limit=30,eventRunId='',observerName=''}={}){
    if(hasPg()){
      const params=[tenantId(),userId()];
      let where='tenant_id=$1 and user_id=$2';
      if(eventRunId){params.push(eventRunId);where+=` and event_run_id=$${params.length}`;}
      if(observerName){params.push(observerName);where+=` and observer_name=$${params.length}`;}
      return pgList('observer_runs',{where,params,limit});
    }
    return spineStore().observerRuns.filter(r=>r.tenantId===tenantId()&&r.userId===userId()&&(!eventRunId||r.eventRunId===eventRunId)&&(!observerName||r.observerName===observerName)).slice(0,limit);
  }
  async function listRoundTableRuns({limit=30,eventRunId=''}={}){
    if(hasPg()){
      const params=[tenantId(),userId()];
      let where='tenant_id=$1 and user_id=$2';
      if(eventRunId){params.push(eventRunId);where+=` and event_run_id=$${params.length}`;}
      return pgList('round_table_runs',{where,params,limit});
    }
    return spineStore().roundTableRuns.filter(r=>r.tenantId===tenantId()&&r.userId===userId()&&(!eventRunId||r.eventRunId===eventRunId)).slice(0,limit);
  }
  async function listChiefRecommendations({limit=10}={}){
    if(hasPg()) return pgList('chief_of_staff_recommendations',{where:'tenant_id=$1 and user_id=$2',params:[tenantId(),userId()],limit});
    return spineStore().chiefOfStaffRecommendations.filter(r=>r.tenantId===tenantId()&&r.userId===userId()).slice(0,limit);
  }
  async function selectRows(table,sql,params,mapper=x=>x){
    try{
      if(hasPg()){
        const r=await dbQuery(sql,params);
        return (r?.rows||[]).map(row=>mapper(rowToObject(row)));
      }
    }catch(e){
      logger.warn?.(`[val-spine] ${table} unavailable: ${e.message}`);
    }
    return null;
  }
  async function buildSharedContextPacket({event={},req=null,includeExternal=false}={}){
    const unknowns=[];
    const scope=currentScope();
    const context={generatedAt:now(),tenantId:scope.tenantId,userId:scope.userId,event,currentTime:{iso:now(),timezone:Intl.DateTimeFormat().resolvedOptions().timeZone||'unknown'}};
    const addUnknown=(source,reason)=>unknowns.push({source,reason,recorded_at:now()});

    try{
      context.boardPackets=await (loaders.listBoardPackets ? loaders.listBoardPackets({limit:60}) : Promise.resolve([]));
      if(!context.boardPackets.length)addUnknown('board_packets','No live Board packets have been created yet.');
    }catch(e){
      context.boardPackets=[];
      addUnknown('board_packets',e.message);
    }

    try{
      context.teachVal=await (loaders.listTeachValCoreMemory ? loaders.listTeachValCoreMemory({limit:40}) : Promise.resolve([]));
      if(!context.teachVal.length)addUnknown('teach_val','No Teach VAL core memory available yet.');
    }catch(e){context.teachVal=[];addUnknown('teach_val',e.message);}

    try{
      const rows=await selectRows('transcripts',`select id,title,executive_summary,raw_text,created_at from transcripts where tenant_id=$1 and user_id=$2 order by created_at desc limit 8`,[tenantId(),userId()],row=>({id:row.id,title:row.title||'',summary:row.executive_summary||compactText(row.raw_text,600),createdAt:iso(row.created_at)}));
      context.recentTranscripts=rows || safeArray(getStore().transcripts).slice(0,8);
      if(!context.recentTranscripts.length)addUnknown('recent_transcripts','No recent transcript rows were available.');
    }catch(e){context.recentTranscripts=[];addUnknown('recent_transcripts',e.message);}

    try{
      const conversations=await (loaders.listRecentConversationSummaries ? loaders.listRecentConversationSummaries({limit:12}) : Promise.resolve([]));
      context.conversationsSummary={available:!!conversations.length,conversations};
      context.emailsSummary=conversations.length
        ? {available:true,stubbed:false,summary:`${conversations.length} durable conversation record${conversations.length===1?'':'s'} available.`,conversations}
        : {available:false,stubbed:false,summary:'No durable conversation records have been synced yet.'};
      if(!conversations.length)addUnknown('emails_summary','No durable synced email conversations were available. Run /api/val/email/sync after Gmail/Outlook are connected.');
    }catch(e){
      context.conversationsSummary={available:false,conversations:[]};
      context.emailsSummary={available:false,stubbed:false,summary:'Conversation summary builder failed.',error:e.message};
      addUnknown('emails_summary',e.message);
    }
    if(event.conversationId||event.messageId||(event.provider&&event.threadId)){
      try{
        context.conversationContext=await (loaders.buildConversationContext ? loaders.buildConversationContext(event) : Promise.resolve(null));
      }catch(e){
        context.conversationContext=null;
        addUnknown('conversation_context',e.message);
      }
    }
    const identityInput=event.identity||event.person||event.sender||event.from||null;
    if(identityInput){
      try{
        context.identityResolution=await (loaders.resolveIdentity ? loaders.resolveIdentity(identityInput) : Promise.resolve(null));
      }catch(e){
        context.identityResolution=null;
        addUnknown('identity_resolution',e.message);
      }
    }
    try{
      context.highSignalConversationClassifications=await (loaders.listHighSignalClassifications ? loaders.listHighSignalClassifications({limit:10}) : Promise.resolve([]));
      if(!context.highSignalConversationClassifications.length)addUnknown('conversation_classifications','No high-signal Executive Inbox classifications are available yet.');
    }catch(e){
      context.highSignalConversationClassifications=[];
      addUnknown('conversation_classifications',e.message);
    }
    try{
      context.readyForYouDraftCandidates=await (loaders.listReadyForYouDraftCandidates ? loaders.listReadyForYouDraftCandidates({limit:8}) : Promise.resolve([]));
    }catch(e){
      context.readyForYouDraftCandidates=[];
      addUnknown('ready_for_you_draft_candidates',e.message);
    }

    try{
      const rows=await selectRows('calendar',`select id,source,title,start_time,end_time,attendees from val_calendar_events where tenant_id=$1 and user_id=$2 and start_time >= now() - interval '1 day' order by start_time asc limit 12`,[tenantId(),userId()],row=>({id:row.id,source:row.source,title:row.title,startTime:iso(row.start_time),endTime:iso(row.end_time),attendees:jsonValue(row.attendees,[])}));
      context.calendarSummary={events:rows || safeArray(getStore().calendarEvents).slice(0,12)};
      if(!context.calendarSummary.events.length)addUnknown('calendar_summary','No stored VAL calendar events were available. Google/Outlook/GHL calendar routes may still fetch on demand.');
    }catch(e){context.calendarSummary={events:[]};addUnknown('calendar_summary',e.message);}

    try{
      const tasks=await (loaders.loadTasks ? loaders.loadTasks() : Promise.resolve(safeArray(getStore().tasks)));
      context.tasksSummary={total:tasks.length,open:tasks.filter(t=>!t.completed).slice(0,20),overdue:tasks.filter(t=>!t.completed&&t.dueDate&&new Date(t.dueDate)<new Date()).slice(0,10)};
    }catch(e){context.tasksSummary={total:0,open:[],overdue:[]};addUnknown('tasks_summary',e.message);}

    try{
      const relationships=await (loaders.listRelationshipProfiles ? loaders.listRelationshipProfiles({limit:40}) : Promise.resolve([]));
      context.relationshipsSummary=relationships.filter(r=>r.profileType!=='project').slice(0,30);
      context.projectsSummary=relationships.filter(r=>r.profileType==='project').slice(0,20);
      if(!context.relationshipsSummary.length)addUnknown('relationships_summary','No relationship profiles available yet.');
      if(!context.projectsSummary.length)addUnknown('projects_summary','No project profiles available yet.');
    }catch(e){context.relationshipsSummary=[];context.projectsSummary=[];addUnknown('relationships_projects',e.message);}

    context.crmSummary={available:false,stubbed:!includeExternal,summary:includeExternal?'CRM summary loader was requested but no Phase 1 persistent CRM summary exists.':'CRM/GHL is intentionally not fetched by default in Phase 1 to avoid noisy external calls.'};
    addUnknown('crm_summary','Persistent CRM summary model is not implemented yet; GHL context remains request-time.');

    try{
      context.recentRecommendations=await listChiefRecommendations({limit:8});
    }catch(e){context.recentRecommendations=[];addUnknown('recent_recommendations',e.message);}

    try{
      const rows=await selectRows('user_feedback',`select kind,summary,raw_text,metadata,created_at from val_memory_items where tenant_id=$1 and user_id=$2 and kind in ('homepage_card_decision','relationship_preference') order by created_at desc limit 20`,[tenantId(),userId()],row=>({kind:row.kind,summary:row.summary,rawText:row.raw_text,metadata:jsonValue(row.metadata,{}),createdAt:iso(row.created_at)}));
      context.userFeedback=rows || safeArray(getStore().memoryItems).filter(m=>['homepage_card_decision','relationship_preference'].includes(m.kind)).slice(0,20);
    }catch(e){context.userFeedback=[];addUnknown('user_feedback',e.message);}

    const refs=[
      ...sourceRefsFromRows(context.teachVal,'teach_val_memory','summary','id',6),
      ...sourceRefsFromRows(context.recentTranscripts,'transcript','summary','id',6),
      ...sourceRefsFromRows(context.relationshipsSummary,'relationship_profile','summary','id',6),
      ...sourceRefsFromRows(context.projectsSummary,'project_profile','summary','id',4),
      ...sourceRefsFromRows(context.conversationsSummary?.conversations||[],'unified_conversation','subject','id',6),
      ...sourceRefsFromRows(context.highSignalConversationClassifications||[],'conversation_classification','whyNow','id',6),
      ...sourceRefsFromRows(context.tasksSummary.open,'task','title','id',6),
      ...sourceRefsFromRows(context.calendarSummary.events,'calendar_event','title','id',4),
      ...sourceRefsFromRows(context.boardPackets,'board_packet','summary','id',10)
    ];
    context.unknowns=unknowns;
    context.sourceRefs=refs;
    return context;
  }
  function observerKind(name){
    return String(name||'').toLowerCase().replace(/\s+/g,'_');
  }
  function countSignals(context){
    const openTasks=context.tasksSummary?.open?.length||0;
    const overdue=context.tasksSummary?.overdue?.length||0;
    const relationships=context.relationshipsSummary?.length||0;
    const projects=context.projectsSummary?.length||0;
    const transcripts=context.recentTranscripts?.length||0;
    const calendar=context.calendarSummary?.events?.length||0;
    const boardPackets=context.boardPackets?.length||0;
    return {openTasks,overdue,relationships,projects,transcripts,calendar,boardPackets,unknowns:context.unknowns?.length||0};
  }
  function buildObserverOutput(observerName,context){
    const kind=observerKind(observerName);
    const c=countSignals(context);
    const packetReviews=buildPacketReviews(observerName,context);
    const baseUnknowns=safeArray(context.unknowns).filter(u=>{
      if(kind==='executive_inbox')return /email/i.test(u.source);
      if(kind==='calendar')return /calendar/i.test(u.source);
      if(kind==='opportunity')return /crm/i.test(u.source);
      return true;
    }).slice(0,6);
    let observation='No strong signal detected yet.';
    let attentionSignals=[];
    let confidence=0.55, conviction=0.45, closing='I do not have enough evidence to pound the table.';
    const meaningfulPacketReviews=packetReviews.filter(review=>review.status!=='no_signal');
    const topPacketReview=meaningfulPacketReviews
      .slice()
      .sort((a,b)=>(Number(b.triggered)-Number(a.triggered))||(Number(b.primary)-Number(a.primary))||(Number(b.confidence)-Number(a.confidence)))[0];
    if(topPacketReview){
      observation=topPacketReview.seeing||topPacketReview.observation||`${observerName} saw a signal in ${topPacketReview.title}.`;
      attentionSignals=[
        ...safeArray(topPacketReview.people),
        ...safeArray(topPacketReview.projects),
        ...safeArray(topPacketReview.decisionObjects),
        topPacketReview.title
      ].filter(Boolean).slice(0,5);
      confidence=Math.max(0.5,Number(topPacketReview.confidence||0.55));
      conviction=topPacketReview.primary?0.72:0.58;
      closing=topPacketReview.observation||topPacketReview.seeing||`${observerName} has inspectable evidence attached to ${topPacketReview.title}.`;
    }
    if(!topPacketReview&&kind==='executive_inbox'){
      const convs=context.conversationsSummary?.conversations||[];
      observation=convs.length?`${convs.length} durable conversation record${convs.length===1?' is':'s are'} available for inbox judgment.`:'No durable conversation records are available yet.';
      attentionSignals=convs.length?[convs[0].subject||'recent conversation','conversation state','relationship temperature']:['email sync','conversation state'];
      confidence=convs.length?0.58:0.35;
      conviction=convs.length?0.52:0.3;
      closing=convs.length?'I believe Executive Inbox can begin reasoning from durable conversations, but should stay humble until classifications mature.':'I believe Executive Inbox needs synced conversation data before it should speak loudly.';
    }else if(!topPacketReview&&kind==='relationship'){
      const top=context.relationshipsSummary?.[0];
      observation=top?`${top.displayName||top.profileKey} has the strongest stored relationship signal right now.`:'No relationship profile has enough stored signal yet.';
      attentionSignals=top?[top.displayName||top.profileKey,'relationship open loops','trust signals']:[];
      confidence=top?Math.max(0.55,Number(top.confidence||0.6)):0.4;
      conviction=top?0.68:0.35;
      closing=top?`I believe ${top.displayName||top.profileKey} deserves attention from the relationship lens.`:'I cannot yet protect a relationship truth without more evidence.';
    }else if(!topPacketReview&&kind==='project'){
      const top=context.projectsSummary?.[0];
      observation=top?`${top.displayName||top.profileKey} is the clearest stored project signal.`:'No durable project profile is available yet.';
      attentionSignals=top?[top.displayName||top.profileKey,'project movement','project blockers']:[];
      confidence=top?Math.max(0.55,Number(top.confidence||0.6)):0.38;
      conviction=top?0.66:0.32;
      closing=top?`I believe ${top.displayName||top.profileKey} is where project context is most visible.`:'I need first-class project context before I can argue strongly.';
    }else if(!topPacketReview&&kind==='capacity'){
      const load=c.overdue+c.calendar;
      observation=load>=5?'The current stored load suggests decision quality may need protection.':'Stored workload does not show a severe capacity signal yet.';
      attentionSignals=load>=5?['decision quality','overdue commitments','calendar load']:[];
      confidence=0.6;conviction=load>=5?0.78:0.42;
      closing=load>=5?'I believe protecting decision quality may matter more than increasing output.':'I am not seeing enough load evidence to recommend slowing down.';
    }else if(!topPacketReview&&kind==='courage'){
      observation=c.overdue>0?'Overdue tasks may include postponed commitments, but I need richer cause data before calling this avoidance.':'No repeated postponement pattern is durable yet.';
      attentionSignals=c.overdue>0?['overdue commitments','possible postponement']:[];
      confidence=c.overdue>0?0.52:0.35;conviction=c.overdue>0?0.58:0.25;
      closing='I will only challenge the user when the evidence shows repeated postponement, not when work is simply unfinished.';
    }else if(!topPacketReview&&kind==='delight'){
      observation='No explicit delight or recovery preference model exists yet.';
      attentionSignals=['recovery preferences','small replenishing actions'];
      confidence=0.25;conviction=0.28;
      closing='I believe delight belongs in the system, but I need user-confirmed preferences before speaking specifically.';
    }else if(!topPacketReview&&kind==='opportunity'){
      observation='CRM opportunity context is not persistently summarized in Phase 1.';
      attentionSignals=['CRM opportunity summaries','relationship graph','mutual value'];
      confidence=0.3;conviction=0.32;
      closing='I believe opportunity judgment needs CRM identity resolution and relationship graph data.';
    }else if(!topPacketReview&&kind==='momentum'){
      const active=c.openTasks+c.relationships+c.projects+c.transcripts;
      observation=active?`There are ${active} stored signals of movement across tasks, relationships, projects, and transcripts.`:'Momentum cannot be measured yet because stored signals are thin.';
      attentionSignals=active?['movement across systems','invisible momentum','meaning']:[];
      confidence=active?0.62:0.35;conviction=active?0.64:0.3;
      closing=active?'I believe momentum should be measured by whether future movement becomes easier.':'I cannot distinguish movement from noise yet.';
    }else if(!topPacketReview&&kind==='meaning'){
      const teach=context.teachVal?.[0];
      observation=teach?`Teach VAL memory is available and can begin anchoring meaning: ${teach.title||teach.summary}`:'Meaning requires more Teach VAL and project purpose context.';
      attentionSignals=teach?['Teach VAL purpose memory','mission alignment']:[];
      confidence=teach?0.58:0.3;conviction=teach?0.6:0.25;
      closing=teach?'I believe meaning should quietly check whether movement still belongs to the life being built.':'I need more confirmed meaning context before weighing in strongly.';
    }else if(!topPacketReview&&kind==='synchronicity'){
      const themes=[
        ...(context.recentTranscripts||[]).map(t=>t.title||t.summary||'').filter(Boolean),
        ...(context.relationshipsSummary||[]).map(r=>r.displayName||r.profileKey||'').filter(Boolean),
        ...(context.projectsSummary||[]).map(p=>p.displayName||p.profileKey||'').filter(Boolean),
        ...(context.calendarSummary?.events||[]).map(e=>e.title||'').filter(Boolean)
      ].filter(Boolean);
      const hasConvergence=themes.length>=3;
      observation=hasConvergence?'Several independent sources are available for convergence checks across transcripts, relationships, projects, and calendar.':'Synchronicity has too little cross-context evidence to name a repeated arrival yet.';
      attentionSignals=hasConvergence?['repeated arrivals','timing clusters','cross-context echoes']:[];
      confidence=hasConvergence?0.5:0.25;conviction=hasConvergence?0.46:0.18;
      closing=hasConvergence?'I can watch for convergence, but I will not call it fate, certainty, or causality.':'I will not create meaning from coincidence without repeated source-backed signals.';
    }else if(!topPacketReview&&kind==='commitment'){
      observation=c.openTasks?`${c.openTasks} open tasks are visible as commitments.`:'No open task commitments are visible.';
      attentionSignals=c.openTasks?['open commitments','follow-through','task context']:[];
      confidence=c.openTasks?0.7:0.4;conviction=c.overdue?0.75:0.5;
      closing=c.openTasks?'I believe commitments should be honored without letting anxiety define priority.':'I do not see enough commitment data to press.';
    }else if(!topPacketReview&&kind==='calendar'){
      observation=c.calendar?`${c.calendar} stored calendar events are visible in the current packet.`:'No stored calendar events are visible.';
      attentionSignals=c.calendar?['time blocks','meeting preparation','calendar constraints']:[];
      confidence=c.calendar?0.62:0.35;conviction=c.calendar?0.58:0.28;
      closing=c.calendar?'I believe time should be treated as a strategic asset.':'I need calendar evidence before I can protect time.';
    }else if(!topPacketReview&&kind==='environment'){
      observation='Environment context such as weather, location, travel, and local conditions is not connected yet.';
      attentionSignals=['weather','location','travel','external conditions'];
      confidence=0.2;conviction=0.2;
      closing='I cannot responsibly infer environment without a connected source.';
    }else if(!topPacketReview&&kind==='witnessing'){
      const witnessingPackets=safeArray(context.boardPackets).filter(packet=>String(packet.packetType||packet.packet_type||'').includes('context')||String(packet.sourceType||packet.source_type||'')==='witnessing');
      const teach=context.teachVal?.[0];
      observation=witnessingPackets.length
        ? `${witnessingPackets.length} Witnessing or context packet${witnessingPackets.length===1?' is':'s are'} available as direct user-revealed evidence.`
        : (teach?`Teach VAL memory is available for Witnessing grounding: ${teach.title||teach.summary}`:'No direct Witnessing packet is available yet.');
      attentionSignals=witnessingPackets.length?['direct user language','operating context','self-revealed truth']:(teach?['Teach VAL memory','user revealed context']:[]);
      confidence=witnessingPackets.length?0.72:(teach?0.58:0.28);
      conviction=witnessingPackets.length?0.7:(teach?0.5:0.2);
      closing=witnessingPackets.length?'I will keep the user’s own words in the room before any recommendation becomes confident.':'I need direct Witnessing evidence before I should shape advice from this lens.';
    }
    return {
      observer:observerName,
      executive_question:`What truth is ${observerName} responsible for protecting right now?`,
      observation,
      evidence:sourceRefsFromRows(context.sourceRefs||[],'source_ref','quote_or_summary','source_id',6),
      confidence,
      conviction,
      packet_review_count:packetReviews.length,
      packet_reviews:packetReviews,
      packetReviews,
      primary_packet_ids:packetReviews.filter(review=>review.primary).map(review=>review.packetId),
      triggered_packet_ids:packetReviews.filter(review=>review.triggered).map(review=>review.packetId),
      supports:[],
      conflicts_with:[],
      attention_signals:attentionSignals,
      unknowns:baseUnknowns,
      closing_statement:closing
    };
  }
  async function runObserver({observerName,promptKey,contextPacket,eventRunId='',output=null}={}){
    const scope=currentScope();
    const prompt=promptRegistry.getPrompt(promptKey||'event_intelligence_pass');
    const generated=output || buildObserverOutput(observerName,contextPacket||{});
    const row={
      id:uuid('observer'),
      tenantId:scope.tenantId,
      userId:scope.userId,
      eventRunId,
      observerName,
      promptKey:promptKey||'event_intelligence_pass',
      promptSource:prompt.sourcePath||'',
      status:'completed',
      contextPacketJson:contextPacket||{},
      outputJson:generated,
      confidence:Number(generated.confidence||0),
      conviction:Number(generated.conviction||0),
      unknownsJson:safeArray(generated.unknowns),
      evidenceRefsJson:safeArray(generated.evidence).map(normalizeSourceRef),
      closingStatement:generated.closing_statement||'',
      errorMessage:'',
      createdAt:now()
    };
    const saved=await saveObserverRun(row);
    logger.log?.(`[val-spine] observer stored ${saved.id} ${observerName}`);
    return saved;
  }
  function buildRoundTableOutput(observerRuns=[]){
    const runs=safeArray(observerRuns);
    const high=runs.filter(r=>Number(r.conviction||0)>=0.65);
    const low=runs.filter(r=>Number(r.confidence||0)<0.4);
    const agreements=high.slice(0,5).map(r=>({observer:r.observerName,statement:r.closingStatement||r.outputJson?.observation||'',conviction:Number(r.conviction||0)}));
    const conflicts=[];
    const capacity=runs.find(r=>r.observerName==='Capacity');
    const commitment=runs.find(r=>r.observerName==='Commitment');
    const project=runs.find(r=>r.observerName==='Project');
    if(capacity&&Number(capacity.conviction||0)>0.7&&(commitment||project)){
      conflicts.push({between:['Capacity',commitment?'Commitment':'Project'],tension:'Capacity may be protecting decision quality while work-oriented observers see movement or commitments.',severity:'medium'});
    }
    const candidateTensions=runs
      .filter(r=>safeArray(r.outputJson?.attention_signals).length)
      .sort((a,b)=>Number(b.conviction||0)-Number(a.conviction||0))
      .slice(0,6)
      .map(r=>({observer:r.observerName,signal:r.outputJson.attention_signals[0],conviction:Number(r.conviction||0),confidence:Number(r.confidence||0)}));
    const reviewedPacketIds=[...new Set(runs.flatMap(run=>safeArray(run.outputJson?.packetReviews||run.outputJson?.packet_reviews).map(review=>review.packetId).filter(Boolean)))];
    const observerPacketReviewCounts=Object.fromEntries(runs.map(run=>[
      run.observerName,
      safeArray(run.outputJson?.packetReviews||run.outputJson?.packet_reviews).length
    ]));
    const opposingViews=candidateTensions.slice(1,4).map(t=>({observer:t.observer,view:`${t.observer} would prioritize ${t.signal}.`,conviction:t.conviction}));
    const uncertainty=low.concat(runs.flatMap(r=>safeArray(r.unknownsJson).map(u=>({observer:r.observerName,...u})))).slice(0,12);
    return {
      agreements,
      conflicts,
      candidate_tensions:candidateTensions,
      opposing_views:opposingViews,
      uncertainty,
      reviewed_packet_ids:reviewedPacketIds,
      observer_packet_review_counts:observerPacketReviewCounts,
      synthesis:`${candidateTensions.length} candidate attention signals surfaced from ${runs.length} observers; ${reviewedPacketIds.length} live packet${reviewedPacketIds.length===1?' was':'s were'} reviewed by the Board.`
    };
  }
  async function runRoundTable({eventRunId='',observerRuns=[]}={}){
    if(!observerRuns.length&&eventRunId) observerRuns=await listObserverRuns({eventRunId,limit:50});
    const scope=currentScope();
    const output=buildRoundTableOutput(observerRuns);
    const row={
      id:uuid('roundtable'),
      tenantId:scope.tenantId,
      userId:scope.userId,
      eventRunId,
      observerRunIds:observerRuns.map(r=>r.id),
      agreementsJson:output.agreements,
      conflictsJson:output.conflicts,
      candidateTensionsJson:output.candidate_tensions,
      opposingViewsJson:output.opposing_views,
      uncertaintyJson:output.uncertainty,
      outputJson:output,
      sourceRefsJson:observerRuns.flatMap(r=>safeArray(r.evidenceRefsJson)).slice(0,12),
      createdAt:now()
    };
    const saved=await saveRoundTableRun(row);
    logger.log?.(`[val-spine] round table stored ${saved.id}`);
    return saved;
  }
  async function getRoundTable(id){
    if(!id)return null;
    if(hasPg()){
      const r=await dbQuery('select * from round_table_runs where id=$1 and tenant_id=$2 and user_id=$3 limit 1',[id,tenantId(),userId()]);
      return r?.rows?.[0]?parseRecord(r.rows[0]):null;
    }
    return spineStore().roundTableRuns.find(r=>r.id===id&&r.tenantId===tenantId()&&r.userId===userId())||null;
  }
  function chiefPacketQueue(observerRuns=[],context={}){
    const priorityRules=chiefPriorityRules(context);
    const grouped=new Map();
    for(const run of safeArray(observerRuns)){
      const observerName=run.observerName||run.observer_name||run.outputJson?.observer||'Observer';
      for(const review of safeArray(run.outputJson?.packetReviews||run.outputJson?.packet_reviews)){
        const packetId=review.packetId||review.packet_id;
        if(!packetId)continue;
        const current=grouped.get(packetId)||{
          packetId,
          title:compactText(review.title||'Board packet',180),
          summary:compactText(review.summary||'',520),
          sourceType:review.sourceType||review.source_type||'',
          sourceId:review.sourceId||review.source_id||'',
          packetType:review.packetType||review.packet_type||'',
          observers:[],
          primaryObservers:[],
          triggeredObservers:[],
          evidence:safeArray(review.evidence).slice(0,8),
          score:0
        };
        const confidence=Number(review.confidence||0);
        current.observers.push({observer:observerName,lens:review.lens||'',status:review.status||'observed',finding:review.observation||review.seeing||'',confidence,primary:!!review.primary,triggered:!!review.triggered,people:safeArray(review.people),projects:safeArray(review.projects),decisionObjects:safeArray(review.decisionObjects)});
        if(review.primary)current.primaryObservers.push(observerName);
        if(review.triggered)current.triggeredObservers.push(observerName);
        const observed=review.status!=='no_signal';
        current.score += (observed?1:0.12) + (observed&&review.primary?2.5:0) + (review.triggered?1.5:0) + (observed?confidence:0.04);
        if(!current.summary&&review.summary)current.summary=compactText(review.summary,520);
        if(!current.evidence.length&&safeArray(review.evidence).length)current.evidence=safeArray(review.evidence).slice(0,8);
        grouped.set(packetId,current);
      }
    }
    return Array.from(grouped.values())
      .map(item=>{
        const normalized={...item,observerCount:item.observers.length,primaryObservers:[...new Set(item.primaryObservers)],triggeredObservers:[...new Set(item.triggeredObservers)]};
        const preference=chiefPriorityMatch(normalized,priorityRules);
        return {...normalized,baseScore:normalized.score,score:normalized.score+preference.boost,chiefPriorityMatches:preference.matches};
      })
      .sort((a,b)=>b.score-a.score)
      .slice(0,12);
  }
  function chiefRecommendationFromPacket(packetCandidate=null){
    if(!packetCandidate)return null;
    const text=[packetCandidate.title,packetCandidate.summary].join(' ');
    if(/\bGOALL\b|Goal Agency|dashboard|projections|Mike|handoff/i.test(text)){
      return {
        title:'Clarify the GOALL dashboard handoff',
        recommendation:'Finish the dashboard/projections handoff with Mike so GOALL has one clean next step.',
        why:'The Board is pointing at a project packet, not a generic task. Project owns the work, Momentum wants the handoff closed, and Commitment is watching the follow-through.',
        action:'Clarify what Mike needs, what the dashboard must show, who owns the next move, and when it must be complete.'
      };
    }
    if(/\bemail|reply|message|introduction|intro\b/i.test(text)){
      return {
        title:packetCandidate.title||'Review the communication packet',
        recommendation:'Decide whether this message needs a reply, draft, hold, or explicit no-action.',
        why:'The Board is treating this as communication attention, not background noise.',
        action:'Open the prepared communication context, edit if needed, then approve or hold.'
      };
    }
    return {
      title:packetCandidate.title||'Review the highest Board packet',
      recommendation:packetCandidate.summary?`Decide the next move for: ${packetCandidate.summary}`:'Decide the next move for the highest-scored Board packet.',
      why:'The Chief of Staff chose the packet with the strongest Observer convergence.',
      action:'Inspect the source, choose the next move, or mark it done if the loop is already closed.'
    };
  }
  function buildChiefOutput(roundTable,observerRuns=[]){
    const tensions=safeArray(roundTable?.candidateTensionsJson||roundTable?.candidate_tensions_json||roundTable?.outputJson?.candidate_tensions);
    const contextPacket=observerRuns.find(run=>run.contextPacketJson)?.contextPacketJson||{};
    const chiefPriorities=chiefPriorityRules(contextPacket);
    const packetQueue=chiefPacketQueue(observerRuns,contextPacket);
    const packetChoice=packetQueue[0]||null;
    const packetRecommendation=chiefRecommendationFromPacket(packetChoice);
    const capacity=tensions.find(t=>t.observer==='Capacity');
    const top=capacity&&capacity.conviction>=0.74?capacity:(tensions[0]||null);
    const title=packetRecommendation?.title || (top?`Attend to ${top.signal}`:'Gather better evidence before choosing the next move');
    const recommendation=packetRecommendation?.recommendation || (top
      ? (top.observer==='Capacity'
        ? `Protect decision quality first: ${top.signal}. Then reassess the work queue.`
        : `Place attention on ${top.signal}.`)
      : 'Run the intelligence pass again after more evidence is available.');
    const opposing=safeArray(roundTable?.opposingViewsJson||roundTable?.opposing_views_json||roundTable?.outputJson?.opposing_views)[0];
    return {
      title,
      recommendation,
      why:packetRecommendation?.why || (top?`${top.observer} had the strongest current conviction. The Round Table did not average the observers; it selected the signal most aligned with long-term momentum and current capacity.`:'The current evidence is too thin for a strong executive recommendation.'),
      confidence:packetChoice?Math.max(0.42,Math.min(0.94,Number(packetChoice.score||0)/(Math.max(1,packetChoice.observerCount)*4.8))):(top?Math.max(0.35,Math.min(0.92,(Number(top.confidence||0)+Number(top.conviction||0))/2)):0.28),
      opposingView:opposing?`What almost won instead: ${opposing.view}`:'No strong opposing view emerged.',
      anxietyVsMomentum:{
        anxiety_signal:'Urgency may be over-weighted when evidence is thin.',
        momentum_signal:packetRecommendation?.action || (top?top.signal:'insufficient evidence'),
        reasoning:'The recommendation should distinguish what is asking for attention from what is worthy of it.',
        chief_priorities:chiefPriorities,
        matched_priorities:packetChoice?.chiefPriorityMatches||[],
        current_packet:chiefQueuePacketReceipt(packetChoice)
      },
      chiefPriorities,
      chiefPriorityMatches:packetChoice?.chiefPriorityMatches||[],
      packetQueue,
      nextCandidates:packetQueue.slice(1,8).map(chiefQueuePacketReceipt)
        .concat(tensions.slice(1,6).map(t=>({title:`Consider ${t.signal}`,observer:t.observer,confidence:t.confidence,conviction:t.conviction})))
        .slice(0,8),
      sourceRefs:packetChoice?.evidence?.length ? packetChoice.evidence : observerRuns.flatMap(r=>safeArray(r.evidenceRefsJson)).slice(0,12)
    };
  }
  async function recommendChiefOfStaff({roundTableRunId='',eventRunId='',observerRuns=[]}={}){
    let roundTable=roundTableRunId?await getRoundTable(roundTableRunId):null;
    if(!roundTable){
      const latest=await listRoundTableRuns({eventRunId,limit:1});
      roundTable=latest[0]||null;
    }
    if(!roundTable) throw new Error('No Round Table run is available. Run /api/val/events/intelligence-pass first.');
    if(!observerRuns.length&&roundTable.eventRunId) observerRuns=await listObserverRuns({eventRunId:roundTable.eventRunId,limit:50});
    const output=buildChiefOutput(roundTable,observerRuns);
    const scope=currentScope();
    const row={
      id:uuid('chief'),
      tenantId:scope.tenantId,
      userId:scope.userId,
      eventRunId:roundTable.eventRunId||eventRunId||'',
      roundTableRunId:roundTable.id,
      status:'active',
      title:output.title,
      recommendation:output.recommendation,
      why:output.why,
      confidence:output.confidence,
      opposingView:output.opposingView,
      anxietyVsMomentumJson:output.anxietyVsMomentum,
      nextCandidatesJson:output.nextCandidates,
      observerRunIds:roundTable.observerRunIds||roundTable.observer_run_ids||[],
      sourceRefsJson:output.sourceRefs,
      userFeedbackJson:{},
      createdAt:now(),
      updatedAt:now(),
      completedAt:null
    };
    const saved=await saveChiefRecommendation(row);
    logger.log?.(`[val-spine] chief recommendation stored ${saved.id}`);
    return saved;
  }
  async function completeChiefRecommendation(id,{feedback={},completionNote='',outcome='completed'}={}){
    const packetId=String(feedback?.packetId||feedback?.chiefQueuePacketId||'').trim();
    function completionPatch(row={}){
      const existing=jsonValue(row.userFeedbackJson||row.user_feedback_json,{});
      const completedPacketIds=[...new Set([...safeArray(existing.completedPacketIds),...safeArray(existing.completed_packet_ids),packetId].filter(Boolean).map(String))];
      const currentPacket=jsonValue(row.anxietyVsMomentumJson||row.anxiety_vs_momentum_json,{})?.current_packet;
      const fullQueue=[currentPacket,...safeArray(row.nextCandidatesJson||row.next_candidates_json)].filter(item=>item?.packetId||item?.packet_id);
      const remaining=packetId&&fullQueue.length
        ? fullQueue.filter(item=>!completedPacketIds.includes(String(item.packetId||item.packet_id||'')))
        : [];
      const stillActive=packetId&&remaining.length>0;
      return {
        status:stillActive?'active':outcome,
        userFeedbackJson:{...existing,feedback,completionNote,outcome:stillActive?'packet_completed':outcome,completedPacketIds,remainingPacketIds:remaining.map(item=>String(item.packetId||item.packet_id||'')),recordedAt:now()},
        completedAt:stillActive?null:now(),
        updatedAt:now()
      };
    }
    if(hasPg()){
      const existing=await dbQuery(`select * from chief_of_staff_recommendations where id=$1 and tenant_id=$2 and user_id=$3 limit 1`,[id,tenantId(),userId()]);
      const row=existing?.rows?.[0]?parseRecord(existing.rows[0]):null;
      if(!row)return null;
      const patch=completionPatch(row);
      const r=await dbQuery(`update chief_of_staff_recommendations set status=$1,user_feedback_json=$2,completed_at=$3,updated_at=now() where id=$4 and tenant_id=$5 and user_id=$6 returning *`,[patch.status,JSON.stringify(patch.userFeedbackJson),patch.completedAt,id,tenantId(),userId()]);
      return r?.rows?.[0]?parseRecord(r.rows[0]):null;
    }
    const store=spineStore();
    const row=store.chiefOfStaffRecommendations.find(r=>r.id===id&&r.tenantId===tenantId()&&r.userId===userId());
    if(row)Object.assign(row,completionPatch(row));
    saveStore(store);
    return row;
  }
  async function createMomentumSnapshot({eventRunId='',observerRuns=[]}={}){
    const momentum=observerRuns.find(r=>r.observerName==='Momentum')?.outputJson||{};
    const meaning=observerRuns.find(r=>r.observerName==='Meaning')?.outputJson||{};
    const summary=momentum.observation||'Momentum has not been measured yet.';
    return saveMomentumSnapshot({
      id:uuid('momentum'),
      tenantId:tenantId(),
      userId:userId(),
      eventRunId,
      summary,
      direction:Number(momentum.conviction||0)>0.6?'rising':'unknown',
      velocityJson:{current:Number(momentum.conviction||0),basis:'observer conviction'},
      dimensionsJson:{momentum,meaning},
      invisibleMomentumJson:{note:'Invisible momentum is stored as a Phase 1 placeholder until completion and relationship-change signals are richer.'},
      meaningJson:{observation:meaning.observation||'',confidence:meaning.confidence||0},
      sourceRefsJson:safeArray(momentum.evidence).map(normalizeSourceRef),
      createdAt:now()
    });
  }
  async function createReadyForYouItems({eventRunId='',contextPacket={}}={}){
    const drafts=safeArray(getStore().drafts).filter(d=>!d.status||['draft','ready_for_review'].includes(d.status)).slice(0,3);
    const rows=[];
    for(const draft of drafts){
      rows.push(await saveReadyForYouItem({
        id:uuid('ready'),
        tenantId:tenantId(),
        userId:userId(),
        eventRunId,
        status:'ready',
        title:draft.subject||draft.title||'Draft ready for review',
        itemType:'draft',
        readinessJson:{status:'ready',why:'Existing internal draft is available for human review.'},
        whatValPrepared:compactText(draft.body||draft.content||'Draft content prepared.',700),
        whatUserNeedsToDo:'Review whether this represents you before anything is sent.',
        sourceRefsJson:[normalizeSourceRef({sourceType:'draft',sourceId:draft.id,quoteOrSummary:draft.subject||draft.title||'',confidence:0.7})],
        metadataJson:{source:'phase_1_ready_for_you',stubbed:drafts.length===0,contextGeneratedAt:contextPacket.generatedAt||''},
        createdAt:now(),
        updatedAt:now()
      }));
    }
    for(const candidate of safeArray(contextPacket.readyForYouDraftCandidates).slice(0,5)){
      const readiness=candidate.draftReadiness||candidate.draft_readiness||{};
      const brief=candidate.draftBrief||candidate.draft_brief||{};
      const generatedDraft=candidate.generatedDraft||candidate.generated_draft||null;
      const isGenerated=!!generatedDraft;
      const writerOutput=generatedDraft?.sourceContext?.writerOutput||{};
      rows.push(await saveReadyForYouItem({
        id:uuid('ready'),
        tenantId:tenantId(),
        userId:userId(),
        eventRunId,
        status:readiness.status||candidate.status||'ready_for_review',
        title:isGenerated?(generatedDraft.subject||writerOutput.subject||'Email draft ready for review'):(brief.single_purpose||'Conversation needs human judgment'),
        itemType:isGenerated?'email_review_only_draft':'email_draft_readiness',
        readinessJson:readiness,
        whatValPrepared:isGenerated?compactText(generatedDraft.body||writerOutput.body||'Review-only email draft prepared. No external draft was created.',900):'VAL evaluated the conversation and prepared draft readiness/brief context. No external draft was created.',
        whatUserNeedsToDo:readiness.status==='needs_context'?'Provide the missing context before VAL drafts.':'Review whether this represents you before anything is sent.',
        sourceRefsJson:isGenerated?[normalizeSourceRef({sourceType:'draft',sourceId:generatedDraft.id,quoteOrSummary:generatedDraft.subject||writerOutput.subject||'Review-only email draft',confidence:0.75})]:safeArray(candidate.sourceRefs||candidate.source_refs).slice(0,8),
        metadataJson:{source:isGenerated?'executive_inbox_review_only':'executive_inbox_draft_readiness',evaluationId:candidate.id||'',conversationId:candidate.conversationId||'',draftId:generatedDraft?.id||'',noExternalAction:true},
        createdAt:now(),
        updatedAt:now()
      }));
    }
    return rows;
  }
  async function runIntelligencePass({event={},observerSuite=DEFAULT_OBSERVERS,req=null,includeExternal=false}={}){
    const scope=currentScope();
    const contextPacket=await buildSharedContextPacket({event,req,includeExternal});
    const eventRun=await saveEventRun({
      id:uuid('eventrun'),
      tenantId:scope.tenantId,
      userId:scope.userId,
      eventType:event.type||event.eventType||'manual',
      eventSourceType:event.sourceType||event.source_type||'manual',
      eventSourceId:event.sourceId||event.source_id||'',
      status:'running',
      contextPacketJson:contextPacket,
      unknownsJson:contextPacket.unknowns||[],
      sourceRefsJson:contextPacket.sourceRefs||[],
      resultJson:{},
      errorMessage:'',
      createdAt:now(),
      completedAt:null
    });
    logger.log?.(`[val-spine] intelligence pass started ${eventRun.id}`);
    const observerRuns=[];
    for(const observer of observerSuite){
      observerRuns.push(await runObserver({...observer,contextPacket,eventRunId:eventRun.id}));
    }
    const roundTable=await runRoundTable({eventRunId:eventRun.id,observerRuns});
    const recommendation=await recommendChiefOfStaff({roundTableRunId:roundTable.id,observerRuns});
    const momentumSnapshot=await createMomentumSnapshot({eventRunId:eventRun.id,observerRuns});
    const readyForYouItems=await createReadyForYouItems({eventRunId:eventRun.id,contextPacket});
    const completed=await updateEventRun(eventRun.id,{
      status:'completed',
      resultJson:{observerRunIds:observerRuns.map(r=>r.id),roundTableRunId:roundTable.id,chiefRecommendationId:recommendation.id,momentumSnapshotId:momentumSnapshot.id,readyForYouItemIds:readyForYouItems.map(r=>r.id)},
      unknownsJson:contextPacket.unknowns||[],
      sourceRefsJson:contextPacket.sourceRefs||[],
      completedAt:now()
    });
    return {ok:true,eventRun:completed||eventRun,contextPacket,observerRuns,roundTable,recommendation,momentumSnapshot,readyForYouItems,stubbed:{emailThreadPersistence:true,persistentCrmSummary:true,environment:true}};
  }
  return {
    DEFAULT_OBSERVERS,
    normalizeSourceRef,
    buildSharedContextPacket,
    runObserver,
    runRoundTable,
    recommendChiefOfStaff,
    completeChiefRecommendation,
    runIntelligencePass,
    listObserverRuns,
    listRoundTableRuns,
    listChiefRecommendations
  };
}

module.exports = {createValIntelligenceSpine,DEFAULT_OBSERVERS,normalizeSourceRef};
