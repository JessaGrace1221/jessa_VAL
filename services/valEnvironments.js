const crypto=require('node:crypto');
const {publicObserverBlockDefinitions}=require('./valObserverRegistry');

function safeArray(value){return Array.isArray(value)?value:[];}
function compactText(value='',limit=900){return String(value||'').replace(/\s+/g,' ').trim().slice(0,limit);}
function jsonValue(value,fallback){
  if(value==null)return fallback;
  if(typeof value==='string'){try{return JSON.parse(value);}catch(_){return fallback;}}
  return value;
}
function rowToCamel(row={}){
  const out={};
  for(const [key,value] of Object.entries(row||{})){
    out[key.replace(/_([a-z])/g,(_,letter)=>letter.toUpperCase())]=value instanceof Date?value.toISOString():value;
  }
  for(const key of ['specJson','humanContractJson','versionSnapshotJson','inputJson','receiptsJson','outputsJson']){
    if(Object.hasOwn(out,key))out[key]=jsonValue(out[key],/receipts/i.test(key)?[]:{});
  }
  return out;
}
function normalizeEmailProvider(value=''){
  const provider=String(value||'').toLowerCase();
  if(provider.includes('outlook')||provider.includes('microsoft'))return 'outlook';
  if(provider.includes('gmail')||provider.includes('google'))return 'gmail';
  return '';
}
function environmentBlockCatalog(){
  return {
    sources:[
      {blockType:'source',blockId:'krisp_transcript',label:'Krisp Transcript',emits:['transcript_packet_v1']},
      {blockType:'source',blockId:'calendar_event',label:'Calendar Event',emits:['calendar_event_packet_v1']},
      {blockType:'source',blockId:'email',label:'Email',emits:['email_packet_v1']},
      {blockType:'source',blockId:'voice_or_chat',label:'VAL Conversation',emits:['conversation_packet_v1']}
    ],
    observers:publicObserverBlockDefinitions(),
    coordination:[
      {blockType:'round_table',blockId:'round_table',label:'Round Table',accepts:['observer_receipt_v1'],emits:['round_table_receipt_v1'],authority:'observe_only'},
      {blockType:'chief_of_staff',blockId:'chief_of_staff',label:'Chief of Staff',accepts:['round_table_receipt_v1'],emits:['chief_advisory_receipt_v1'],authority:'advise_only'}
    ],
    preparation:[
      {blockType:'transform',blockId:'exact_krisp_sections',label:'Preserve Krisp Sections',accepts:['transcript_packet_v1'],emits:['exact_meeting_overview_v1']},
      {blockType:'approval',blockId:'approval_gate',label:'Approval Gate',accepts:['prepared_action_v1'],emits:['approved_action_v1']}
    ],
    actions:[
      {blockType:'external_action',blockId:'send_email',label:'Send Email',accepts:['approved_action_v1'],policy:'recipient_and_action_bounded'},
      {blockType:'external_action',blockId:'append_google_doc',label:'Append to Google Doc',accepts:['approved_action_v1'],policy:'document_id_bounded'}
    ]
  };
}
function normalizeEnvironmentSpec(input={}){
  const observerIds=[...new Set(safeArray(input.observerIds||input.observer_ids||input.observers)
    .map(item=>String(item?.observerId||item?.observer_id||item||'').trim())
    .filter(Boolean))];
  const trigger=input.trigger&&typeof input.trigger==='object'?input.trigger:{};
  const connections=input.connections&&typeof input.connections==='object'?input.connections:{};
  const approvals=input.approvals&&typeof input.approvals==='object'?input.approvals:{};
  return {
    contractVersion:1,
    name:compactText(input.name||'Untitled Environment',120),
    outcome:compactText(input.outcome,600),
    purpose:compactText(input.purpose,900),
    trigger:{
      type:String(trigger.type||input.triggerType||'krisp_transcript_received'),
      eventTitlePattern:compactText(trigger.eventTitlePattern||trigger.event_title_pattern||input.eventTitlePattern,220),
      eventTitleConfirmed:Boolean(trigger.eventTitleConfirmed||trigger.event_title_confirmed),
      mode:String(trigger.mode||'immediate')
    },
    observerIds,
    roundTable:{required:true,authority:'observe_only'},
    chiefOfStaff:{required:true,authority:'advise_only'},
    instructions:{
      sourceTruth:'Use Krisp Action Items and Key Points exactly as received.',
      formatting:'Basic headings and a short introduction are allowed. Source wording is not rewritten.',
      recipientRule:'Include every attendee except the executive.',
      emailSubject:'Meeting Title and Date - Overview',
      failureOrder:['ask_user','create_alignment_item','notify_chief_of_staff','pause_environment']
    },
    connections:{
      emailProvider:normalizeEmailProvider(connections.emailProvider||connections.email_provider),
      googleDocumentId:compactText(connections.googleDocumentId||connections.google_document_id,240)
    },
    actions:{
      sendEmail:true,
      appendGoogleDoc:true,
      executionOrder:['send_email','append_google_doc']
    },
    approvals:{
      sendEmail:approvals.sendEmail==='preauthorized'?'preauthorized':'required',
      appendGoogleDoc:approvals.appendGoogleDoc==='preauthorized'?'preauthorized':'required',
      recipientScope:'meeting_attendees_except_executive',
      actionScope:['send_email','append_google_doc']
    },
    retryPolicy:{
      idempotent:true,
      retryOnlyFailedAction:true,
      duplicateSourceBehavior:'return_existing_receipt'
    },
    sharing:{
      stripPersonalEvidence:true,
      stripCredentials:true,
      stripContactIdentities:true,
      stripAccountMappings:true,
      installAsDraft:true
    }
  };
}
function validateEnvironmentSpec(spec={}){
  const errors=[];
  const observerIds=new Set(publicObserverBlockDefinitions().map(block=>block.observerId));
  if(!compactText(spec.name,120))errors.push('Name the Environment.');
  if(!compactText(spec.outcome,600))errors.push('Explain the outcome this Environment should create.');
  if(!compactText(spec.purpose,900))errors.push('Explain why this Environment exists.');
  if(spec.trigger?.type!=='krisp_transcript_received')errors.push('The first Environment requires a Krisp transcript trigger.');
  if(!compactText(spec.trigger?.eventTitlePattern,220))errors.push('Confirm the recurring calendar event title.');
  if(!spec.trigger?.eventTitleConfirmed)errors.push('Confirm the recurring calendar event title rule.');
  if(!safeArray(spec.observerIds).length)errors.push('Choose at least one Observer.');
  for(const id of safeArray(spec.observerIds))if(!observerIds.has(id))errors.push(`Unknown Observer: ${id}.`);
  if(!spec.roundTable?.required)errors.push('Every Environment requires the Round Table.');
  if(!spec.chiefOfStaff?.required)errors.push('Every Environment requires the Chief of Staff.');
  if(!normalizeEmailProvider(spec.connections?.emailProvider))errors.push('Select the connected sending account.');
  if(!compactText(spec.connections?.googleDocumentId,240))errors.push('Add the destination Google Doc ID.');
  if(spec.approvals?.recipientScope!=='meeting_attendees_except_executive')errors.push('Email authorization must remain bounded to meeting attendees except the executive.');
  return {ok:errors.length===0,errors};
}
function humanEnvironmentContract(spec={}){
  const observers=publicObserverBlockDefinitions()
    .filter(block=>safeArray(spec.observerIds).includes(block.observerId))
    .map(block=>block.observerName);
  return {
    title:spec.name,
    outcome:spec.outcome,
    when:`Immediately after VAL receives a Krisp transcript matching "${spec.trigger?.eventTitlePattern||''}".`,
    listensTo:'Krisp Action Items, Key Points, attendee emails, meeting title, and meeting date.',
    observers,
    observerPurpose:'Each selected Observer reviews the exact meeting packet. The Round Table observes their receipts. The Chief of Staff advises but does not govern execution.',
    produces:[
      'One email to all attendees except the executive.',
      'One dated section appended to the selected Google Doc.'
    ],
    sourcePromise:'Krisp Action Items and Key Points remain word for word.',
    approval:{
      email:spec.approvals?.sendEmail||'required',
      googleDoc:spec.approvals?.appendGoogleDoc||'required'
    },
    failure:'Ask for missing context, create Alignment, notify the Chief of Staff, then pause visibly.',
    safety:'Duplicate sends, invalid recipients, missing authorization, and expired permission remain permanently blocked.'
  };
}
function environmentSourceHash(environmentId='',source={}){
  return crypto.createHash('sha256').update([
    environmentId,
    source.id||source.sourceId||'',
    source.contentHash||source.hash||'',
    source.title||''
  ].join('|')).digest('hex');
}
function normalizedTitle(value=''){
  return String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
}
function titleRuleMatches(rule='',title=''){
  const expected=normalizedTitle(rule);
  const actual=normalizedTitle(title);
  if(!expected||!actual)return false;
  if(expected===actual||actual.includes(expected)||expected.includes(actual))return true;
  const tokens=expected.split(' ').filter(token=>token.length>2);
  return tokens.length>0&&tokens.every(token=>actual.includes(token));
}
function displayDate(value=''){
  const date=new Date(value);
  if(Number.isNaN(date.getTime()))return 'Date unavailable';
  return new Intl.DateTimeFormat('en-US',{month:'long',day:'numeric',year:'numeric'}).format(date);
}
function sourceLines(value){
  return safeArray(value).map(item=>compactText(typeof item==='string'?item:(item?.text||item?.title||item?.taskTitle||item?.summary||''),1200)).filter(Boolean);
}
function validEmail(value=''){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value||'').trim());}
function externalRecipients(source={}){
  const executiveEmails=new Set(safeArray(source.executiveEmails).map(value=>String(value||'').trim().toLowerCase()).filter(Boolean));
  const seen=new Set();
  return safeArray(source.attendees).filter(person=>{
    const email=String(person?.email||'').trim();
    const normalized=email.toLowerCase();
    if(!validEmail(email)||seen.has(normalized))return false;
    if(person?.isExecutive||person?.isOwner||person?.self||executiveEmails.has(normalized))return false;
    seen.add(normalized);
    return true;
  });
}
function exactMeetingContent(source={}){
  const actionItems=sourceLines(source.actionItems);
  const keyPoints=sourceLines(source.keyPoints);
  const sections=[];
  if(actionItems.length)sections.push(['Action Items',...actionItems].join('\n'));
  if(keyPoints.length)sections.push(['Key Points',...keyPoints].join('\n'));
  const exactBody=String(source.exactBody||'').trim();
  return {actionItems,keyPoints,body:exactBody||sections.join('\n\n').trim(),ready:Boolean(exactBody||sections.length)};
}
function meetingOutputs(spec={},source={}){
  const exact=exactMeetingContent(source);
  const title=compactText(source.title||'Meeting',220);
  const date=displayDate(source.occurredAt||source.createdAt);
  const attendees=externalRecipients(source);
  const emailIntro=`Thank you for your time. Here is the overview from ${title}.`;
  const emailBody=[emailIntro,exact.body].filter(Boolean).join('\n\n');
  const documentBody=[
    `${title} | ${date}`,
    attendees.length?`Attendees: ${attendees.map(person=>person.name||person.email).join(', ')}`:'',
    exact.body,
    source.sourceUrl?`Transcript: ${source.sourceUrl}`:''
  ].filter(Boolean).join('\n\n');
  return {
    email:{
      provider:spec.connections?.emailProvider||'',
      to:attendees.map(person=>person.email).join(', '),
      recipients:attendees,
      subject:`${title} ${date} - Overview`,
      body:emailBody,
      approval:spec.approvals?.sendEmail||'required',
      state:'proposed'
    },
    googleDoc:{
      documentId:spec.connections?.googleDocumentId||'',
      mode:'append',
      content:documentBody,
      approval:spec.approvals?.appendGoogleDoc||'required',
      state:'proposed'
    },
    exactSourceSections:exact,
    executionOrder:['send_email','append_google_doc']
  };
}

function createValEnvironmentsService({
  dbQuery,
  hasPg=()=>false,
  getStore=()=>({}),
  saveStore=()=>{},
  uuid=(prefix)=>`${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`,
  tenantId=()=>'default',
  userId=()=>'default',
  loadTranscript=async()=>null,
  externalActions=null,
  onNeedsAttention=async()=>{},
  previewObserver=async({observer})=>({
    observerId:observer.observerId,
    observerName:observer.observerName,
    status:'no_meaningful_signal',
    observation:'No meaningful signal from my lens.',
    evidence:[],
    confidence:0.9
  })
}={}){
  function scope(){return {tenantId:tenantId(),userId:userId()};}
  function store(){
    const state=getStore()||{};
    if(!Array.isArray(state.valEnvironments))state.valEnvironments=[];
    if(!Array.isArray(state.valEnvironmentVersions))state.valEnvironmentVersions=[];
    if(!Array.isArray(state.valEnvironmentRuns))state.valEnvironmentRuns=[];
    return state;
  }
  async function getEnvironment(id){
    const current=scope();
    if(hasPg()){
      const result=await dbQuery('select * from val_environments where id=$1 and tenant_id=$2 and user_id=$3 limit 1',[id,current.tenantId,current.userId]);
      return result.rows?.[0]?rowToCamel(result.rows[0]):null;
    }
    return store().valEnvironments.find(item=>item.id===id&&item.tenantId===current.tenantId&&item.userId===current.userId)||null;
  }
  async function getVersion(id){
    if(!id)return null;
    const current=scope();
    if(hasPg()){
      const result=await dbQuery('select * from val_environment_versions where id=$1 and tenant_id=$2 and user_id=$3 limit 1',[id,current.tenantId,current.userId]);
      return result.rows?.[0]?rowToCamel(result.rows[0]):null;
    }
    return store().valEnvironmentVersions.find(item=>item.id===id&&item.tenantId===current.tenantId&&item.userId===current.userId)||null;
  }
  async function hydrateEnvironment(environment){
    if(!environment)return null;
    const activeVersion=await getVersion(environment.activeVersionId);
    const draftVersion=await getVersion(environment.draftVersionId);
    return {...environment,activeVersion,draftVersion};
  }
  async function list({limit=50}={}){
    const current=scope();
    let rows=[];
    if(hasPg()){
      const result=await dbQuery('select * from val_environments where tenant_id=$1 and user_id=$2 order by updated_at desc limit $3',[current.tenantId,current.userId,Math.max(1,Math.min(Number(limit)||50,200))]);
      rows=(result.rows||[]).map(rowToCamel);
    }else{
      rows=store().valEnvironments.filter(item=>item.tenantId===current.tenantId&&item.userId===current.userId).slice(0,limit);
    }
    return {ok:true,environments:await Promise.all(rows.map(hydrateEnvironment)),blockCatalog:environmentBlockCatalog()};
  }
  async function nextVersionNumber(environmentId){
    const current=scope();
    if(hasPg()){
      const result=await dbQuery('select coalesce(max(version_number),0)::int as max_version from val_environment_versions where environment_id=$1 and tenant_id=$2 and user_id=$3',[environmentId,current.tenantId,current.userId]);
      return Number(result.rows?.[0]?.max_version||0)+1;
    }
    return Math.max(0,...store().valEnvironmentVersions.filter(item=>item.environmentId===environmentId&&item.tenantId===current.tenantId&&item.userId===current.userId).map(item=>Number(item.versionNumber)||0))+1;
  }
  async function saveEnvironment(row){
    if(hasPg()){
      const result=await dbQuery(`
        insert into val_environments (id,tenant_id,user_id,name,status,active_version_id,draft_version_id,created_at,updated_at)
        values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        on conflict (id) do update set name=excluded.name,status=excluded.status,active_version_id=excluded.active_version_id,draft_version_id=excluded.draft_version_id,updated_at=excluded.updated_at
        returning *
      `,[row.id,row.tenantId,row.userId,row.name,row.status,row.activeVersionId||null,row.draftVersionId||null,row.createdAt,row.updatedAt]);
      return rowToCamel(result.rows?.[0]||row);
    }
    const state=store();
    const index=state.valEnvironments.findIndex(item=>item.id===row.id&&item.tenantId===row.tenantId&&item.userId===row.userId);
    if(index>=0)state.valEnvironments[index]={...state.valEnvironments[index],...row};
    else state.valEnvironments.unshift(row);
    saveStore(state);
    return index>=0?state.valEnvironments[index]:row;
  }
  async function saveVersion(row){
    if(hasPg()){
      const result=await dbQuery(`
        insert into val_environment_versions (id,environment_id,tenant_id,user_id,version_number,state,spec_json,human_contract_json,created_at,confirmed_at)
        values ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9,$10)
        on conflict (id) do update set state=excluded.state,spec_json=excluded.spec_json,human_contract_json=excluded.human_contract_json,confirmed_at=excluded.confirmed_at
        returning *
      `,[row.id,row.environmentId,row.tenantId,row.userId,row.versionNumber,row.state,JSON.stringify(row.specJson),JSON.stringify(row.humanContractJson),row.createdAt,row.confirmedAt||null]);
      return rowToCamel(result.rows?.[0]||row);
    }
    const state=store();
    const index=state.valEnvironmentVersions.findIndex(item=>item.id===row.id&&item.tenantId===row.tenantId&&item.userId===row.userId);
    if(index>=0)state.valEnvironmentVersions[index]={...state.valEnvironmentVersions[index],...row};
    else state.valEnvironmentVersions.unshift(row);
    saveStore(state);
    return index>=0?state.valEnvironmentVersions[index]:row;
  }
  async function saveRun(row){
    if(hasPg()){
      const result=await dbQuery(`
        insert into val_environment_runs (
          id,environment_id,tenant_id,user_id,version_number,version_snapshot_json,
          trigger_type,source_type,source_id,source_hash,status,test_mode,input_json,
          receipts_json,outputs_json,error_message,started_at,completed_at
        )
        values ($1,$2,$3,$4,$5,$6::jsonb,$7,$8,$9,$10,$11,$12,$13::jsonb,$14::jsonb,$15::jsonb,$16,$17,$18)
        on conflict (id) do update set
          status=excluded.status,receipts_json=excluded.receipts_json,
          outputs_json=excluded.outputs_json,error_message=excluded.error_message,
          completed_at=excluded.completed_at
        returning *
      `,[
        row.id,row.environmentId,row.tenantId,row.userId,row.versionNumber,
        JSON.stringify(row.versionSnapshotJson||{}),row.triggerType,row.sourceType||null,
        row.sourceId||null,row.sourceHash||null,row.status,!!row.testMode,
        JSON.stringify(row.inputJson||{}),JSON.stringify(row.receiptsJson||[]),
        JSON.stringify(row.outputsJson||{}),row.errorMessage||null,row.startedAt,row.completedAt||null
      ]);
      return rowToCamel(result.rows?.[0]||row);
    }
    const state=store();
    const index=state.valEnvironmentRuns.findIndex(item=>item.id===row.id&&item.tenantId===row.tenantId&&item.userId===row.userId);
    if(index>=0)state.valEnvironmentRuns[index]={...state.valEnvironmentRuns[index],...row};
    else state.valEnvironmentRuns.unshift(row);
    saveStore(state);
    return index>=0?state.valEnvironmentRuns[index]:row;
  }
  async function saveDraft(input={}){
    const current=scope();
    const existing=input.id?await getEnvironment(input.id):null;
    const environmentId=existing?.id||uuid('environment');
    const spec=normalizeEnvironmentSpec(input.spec||input);
    const now=new Date().toISOString();
    const versionNumber=existing?.draftVersionId
      ? Number((await getVersion(existing.draftVersionId))?.versionNumber||await nextVersionNumber(environmentId))
      : await nextVersionNumber(environmentId);
    const version={
      id:existing?.draftVersionId||uuid('environment_version'),
      environmentId,
      tenantId:current.tenantId,
      userId:current.userId,
      versionNumber,
      state:'draft',
      specJson:spec,
      humanContractJson:humanEnvironmentContract(spec),
      createdAt:now,
      confirmedAt:null
    };
    await saveVersion(version);
    const environment=await saveEnvironment({
      id:environmentId,
      tenantId:current.tenantId,
      userId:current.userId,
      name:spec.name,
      status:existing?.status==='active'?'active':'draft',
      activeVersionId:existing?.activeVersionId||null,
      draftVersionId:version.id,
      createdAt:existing?.createdAt||now,
      updatedAt:now
    });
    return {ok:true,environment:await hydrateEnvironment(environment),validation:validateEnvironmentSpec(spec),no_external_action:true};
  }
  async function activate(id){
    const environment=await getEnvironment(id);
    if(!environment)throw new Error('Environment not found.');
    const draft=await getVersion(environment.draftVersionId);
    if(!draft)throw new Error('This Environment has no draft to activate.');
    const validation=validateEnvironmentSpec(draft.specJson);
    if(!validation.ok)throw new Error(validation.errors.join(' '));
    const tested=await latestSuccessfulTest(id,draft.versionNumber);
    if(!tested)throw new Error('Test this exact Environment version with historical evidence before making it live.');
    const confirmedAt=new Date().toISOString();
    const activeVersion=await saveVersion({...draft,state:'active',confirmedAt});
    const saved=await saveEnvironment({...environment,status:'active',activeVersionId:activeVersion.id,draftVersionId:null,updatedAt:confirmedAt});
    if(hasPg()){
      await dbQuery('delete from val_environment_versions where environment_id=$1 and tenant_id=$2 and user_id=$3 and id<>$4',[id,environment.tenantId,environment.userId,activeVersion.id]);
    }else{
      const state=store();
      state.valEnvironmentVersions=state.valEnvironmentVersions.filter(version=>version.environmentId!==id||version.id===activeVersion.id);
      saveStore(state);
    }
    return {ok:true,environment:await hydrateEnvironment(saved),activated:true};
  }
  async function pause(id){
    const environment=await getEnvironment(id);
    if(!environment)throw new Error('Environment not found.');
    const saved=await saveEnvironment({...environment,status:'paused',updatedAt:new Date().toISOString()});
    return {ok:true,environment:await hydrateEnvironment(saved)};
  }
  async function runHistoricalTest(id,{transcriptId}={}){
    const environment=await getEnvironment(id);
    if(!environment)throw new Error('Environment not found.');
    const version=await getVersion(environment.draftVersionId||environment.activeVersionId);
    if(!version)throw new Error('This Environment has no version to test.');
    const validation=validateEnvironmentSpec(version.specJson);
    if(!validation.ok)throw new Error(validation.errors.join(' '));
    const source=await loadTranscript(String(transcriptId||'').trim());
    if(!source)throw new Error('Choose a real historical transcript for this test.');
    if(!titleRuleMatches(version.specJson.trigger?.eventTitlePattern,source.title)){
      throw new Error(`"${source.title||'This transcript'}" does not match the confirmed recurring event rule "${version.specJson.trigger?.eventTitlePattern}".`);
    }
    const exact=exactMeetingContent(source);
    if(!exact.ready)throw new Error('This transcript does not contain inspectable Krisp Key Points or Action Items.');
    if(!externalRecipients(source).length){
      throw new Error('This transcript does not contain a valid attendee email address outside the executive.');
    }
    const current=scope();
    const startedAt=new Date().toISOString();
    const runId=uuid('environment_run');
    const runBase={
      id:runId,
      environmentId:id,
      tenantId:current.tenantId,
      userId:current.userId,
      versionNumber:version.versionNumber,
      versionSnapshotJson:version.specJson,
      triggerType:'historical_transcript_test',
      sourceType:'transcript',
      sourceId:source.id,
      sourceHash:environmentSourceHash(id,{...source,contentHash:crypto.createHash('sha256').update(exact.body).digest('hex')}),
      status:'testing',
      testMode:true,
      inputJson:{
        sourceId:source.id,
        title:source.title,
        occurredAt:source.occurredAt||source.createdAt||'',
        attendees:externalRecipients(source),
        sourceUrl:source.sourceUrl||'',
        exactSourceSections:exact
      },
      receiptsJson:[],
      outputsJson:{},
      errorMessage:'',
      startedAt,
      completedAt:null
    };
    await saveRun(runBase);
    await saveEnvironment({...environment,status:'testing',updatedAt:startedAt});
    try{
      const definitions=publicObserverBlockDefinitions().filter(block=>safeArray(version.specJson.observerIds).includes(block.observerId));
      const observerReceipts=[];
      for(const observer of definitions){
        observerReceipts.push(await previewObserver({observer,source,exactSections:exact,environment:version.specJson,runId}));
      }
      const observed=observerReceipts.filter(receipt=>receipt.status==='observed');
      const roundTable={
        type:'round_table_receipt_v1',
        authority:'observe_only',
        observerCount:observerReceipts.length,
        observedCount:observed.length,
        noSignalCount:observerReceipts.length-observed.length,
        observations:observed.map(receipt=>({
          observerId:receipt.observerId,
          observerName:receipt.observerName,
          observation:receipt.observation,
          evidence:safeArray(receipt.evidence)
        })),
        conclusion:observed.length
          ? `${observed.length} selected Observer${observed.length===1?' found':'s found'} a source-backed signal.`
          : 'The selected Observers found no meaningful signal. The Environment may still carry out its explicit source-preservation instructions.'
      };
      const chief={
        type:'chief_advisory_receipt_v1',
        authority:'advise_only',
        recommendation:observed.length
          ? 'The source is complete enough to prepare the configured outputs. Review the exact recipients and actions before activation.'
          : 'The source is complete enough for the configured mechanical follow-through. No Observer claim should be added.',
        observerSuggestions:[],
        governsExecution:false
      };
      const outputs=meetingOutputs(version.specJson,source);
      const completedAt=new Date().toISOString();
      const completed=await saveRun({
        ...runBase,
        status:'completed',
        receiptsJson:[...observerReceipts,roundTable,chief],
        outputsJson:outputs,
        completedAt
      });
      await saveEnvironment({...environment,status:environment.activeVersionId?'active':'draft',updatedAt:completedAt});
      return {ok:true,run:completed,no_external_action:true,message:'Historical evidence test completed. No External Actions Occurred.'};
    }catch(error){
      const completedAt=new Date().toISOString();
      await saveRun({...runBase,status:'needs_attention',errorMessage:error.message,completedAt});
      await saveEnvironment({...environment,status:'needs_attention',updatedAt:completedAt});
      throw error;
    }
  }
  async function listRuns(environmentId,{limit=50}={}){
    const current=scope();
    if(hasPg()){
      const result=await dbQuery('select * from val_environment_runs where environment_id=$1 and tenant_id=$2 and user_id=$3 order by started_at desc limit $4',[environmentId,current.tenantId,current.userId,Math.max(1,Math.min(Number(limit)||50,200))]);
      return {ok:true,runs:(result.rows||[]).map(rowToCamel)};
    }
    return {ok:true,runs:store().valEnvironmentRuns.filter(run=>run.environmentId===environmentId&&run.tenantId===current.tenantId&&run.userId===current.userId).slice(0,limit)};
  }
  async function latestSuccessfulTest(environmentId,versionNumber){
    const current=scope();
    if(hasPg()){
      const result=await dbQuery(`
        select * from val_environment_runs
        where environment_id=$1 and tenant_id=$2 and user_id=$3
          and version_number=$4 and test_mode=true and status='completed'
        order by completed_at desc nulls last, started_at desc
        limit 1
      `,[environmentId,current.tenantId,current.userId,Number(versionNumber)||0]);
      return result.rows?.[0]?rowToCamel(result.rows[0]):null;
    }
    return store().valEnvironmentRuns.find(run=>
      run.environmentId===environmentId
      &&run.tenantId===current.tenantId
      &&run.userId===current.userId
      &&Number(run.versionNumber)===Number(versionNumber)
      &&run.testMode===true
      &&run.status==='completed'
    )||null;
  }
  async function activeEnvironments(){
    const current=scope();
    if(hasPg()){
      const result=await dbQuery(
        `select * from val_environments
         where tenant_id=$1 and user_id=$2 and status='active' and active_version_id is not null
         order by updated_at asc`,
        [current.tenantId,current.userId]
      );
      return Promise.all((result.rows||[]).map(row=>hydrateEnvironment(rowToCamel(row))));
    }
    return Promise.all(store().valEnvironments
      .filter(item=>item.tenantId===current.tenantId&&item.userId===current.userId&&item.status==='active'&&item.activeVersionId)
      .map(hydrateEnvironment));
  }
  async function existingRun(environmentId,sourceHash){
    const current=scope();
    if(hasPg()){
      const result=await dbQuery(
        `select * from val_environment_runs
         where environment_id=$1 and tenant_id=$2 and user_id=$3
           and source_hash=$4 and test_mode=false
         order by started_at desc limit 1`,
        [environmentId,current.tenantId,current.userId,sourceHash]
      );
      return result.rows?.[0]?rowToCamel(result.rows[0]):null;
    }
    return store().valEnvironmentRuns.find(run=>
      run.environmentId===environmentId
      &&run.tenantId===current.tenantId
      &&run.userId===current.userId
      &&run.sourceHash===sourceHash
      &&run.testMode===false
    )||null;
  }
  async function observerReceiptsFor({version,source,exact,runId}){
    const definitions=publicObserverBlockDefinitions()
      .filter(block=>safeArray(version.specJson.observerIds).includes(block.observerId));
    const observerReceipts=[];
    for(const observer of definitions){
      observerReceipts.push(await previewObserver({
        observer,
        source,
        exactSections:exact,
        environment:version.specJson,
        runId
      }));
    }
    const observed=observerReceipts.filter(receipt=>receipt.status==='observed');
    const roundTable={
      type:'round_table_receipt_v1',
      authority:'observe_only',
      observerCount:observerReceipts.length,
      observedCount:observed.length,
      noSignalCount:observerReceipts.length-observed.length,
      observations:observed.map(receipt=>({
        observerId:receipt.observerId,
        observerName:receipt.observerName,
        observation:receipt.observation,
        evidence:safeArray(receipt.evidence)
      })),
      conclusion:observed.length
        ? `${observed.length} selected Observer${observed.length===1?' found':'s found'} a source-backed signal.`
        : 'The selected Observers found no meaningful signal. The Environment may still carry out its explicit source-preservation instructions.'
    };
    const chief={
      type:'chief_advisory_receipt_v1',
      authority:'advise_only',
      recommendation:observed.length
        ? 'The source is complete enough to prepare the configured outputs. Keep the source language intact and preserve the configured approval boundaries.'
        : 'The source is complete enough for mechanical follow-through. Add no Observer claim.',
      observerSuggestions:[],
      governsExecution:false
    };
    return [...observerReceipts,roundTable,chief];
  }
  async function prepareEnvironmentActions({environment,version,source,run,outputs}){
    if(!externalActions?.createEmailSendPacket||!externalActions?.createGoogleDocAppendPacket){
      throw new Error('VAL Environment action infrastructure is unavailable.');
    }
    const sourceRef={
      sourceType:'transcript',
      sourceId:source.id,
      quoteOrSummary:compactText(outputs.exactSourceSections?.body,900),
      confidence:1,
      createdAt:source.occurredAt||source.createdAt||new Date().toISOString()
    };
    const commonContext={
      source:'val_environment',
      sourceId:source.id,
      environmentId:environment.id,
      environmentRunId:run.id,
      environmentVersion:version.versionNumber
    };
    const emailPacket=await externalActions.createEmailSendPacket({
      ...outputs.email,
      messageId:`${run.id}:email`,
      why:`${environment.name} prepared this attendee follow-through from the exact Krisp sections.`,
      sourceRefs:[sourceRef],
      sourceContext:{...commonContext,actionKey:'send_email'},
      finalApprovalSurface:'val_environment'
    });
    const docPacket=await externalActions.createGoogleDocAppendPacket({
      ...outputs.googleDoc,
      id:`${run.id}:google_doc`,
      title:`Append ${source.title||'meeting'} overview`,
      why:`${environment.name} prepared this dated record from the exact Krisp sections.`,
      sourceRefs:[sourceRef],
      sourceContext:{...commonContext,actionKey:'append_google_doc',dependsOnPacketId:emailPacket.id},
      finalApprovalSurface:'val_environment'
    });
    const packets=[
      {key:'send_email',approval:version.specJson.approvals?.sendEmail||'required',packet:emailPacket},
      {key:'append_google_doc',approval:version.specJson.approvals?.appendGoogleDoc||'required',packet:docPacket}
    ];
    const actionReceipts=[];
    let priorActionPending=false;
    for(const action of packets){
      if(action.approval!=='preauthorized'){
        actionReceipts.push({action:action.key,status:'awaiting_approval',packetId:action.packet.id});
        priorActionPending=true;
        continue;
      }
      const updated=await externalActions.edit(action.packet.id,{approvalPolicy:'preauthorized'});
      const approved=await externalActions.approve(updated.id,{note:`Preauthorized by Environment ${environment.name}.`});
      if(priorActionPending){
        actionReceipts.push({action:action.key,status:'waiting_for_prior_action',packetId:approved.id});
        continue;
      }
      const result=await externalActions.executor?.execute(approved.id,{
        finalConfirmation:true,
        executedBy:`environment:${environment.id}`
      });
      if(!result?.executed){
        actionReceipts.push({
          action:action.key,
          status:'failed',
          packetId:approved.id,
          error:result?.error||result?.packet?.failureReason||'Action did not complete.'
        });
        priorActionPending=true;
        continue;
      }
      actionReceipts.push({
        action:action.key,
        status:'executed',
        packetId:approved.id,
        providerResponseId:result.packet?.providerResponseId||''
      });
    }
    return {
      actionReceipts,
      packetIds:packets.map(action=>action.packet.id),
      status:actionReceipts.some(receipt=>receipt.status==='failed')
        ? 'needs_attention'
        : actionReceipts.some(receipt=>receipt.status!=='executed')
          ? 'needs_approval'
          : 'completed'
    };
  }
  async function processTranscript(sourceOrId){
    const source=typeof sourceOrId==='string'?await loadTranscript(sourceOrId):sourceOrId;
    if(!source?.id)return {ok:true,matched:0,runs:[],message:'No durable transcript was available for Environment matching.'};
    const exact=exactMeetingContent(source);
    const matches=(await activeEnvironments()).filter(environment=>
      titleRuleMatches(environment.activeVersion?.specJson?.trigger?.eventTitlePattern,source.title)
    );
    const results=[];
    for(const environment of matches){
      const version=environment.activeVersion;
      const sourceHash=environmentSourceHash(environment.id,{
        ...source,
        contentHash:crypto.createHash('sha256').update(exact.body||source.rawText||source.id).digest('hex')
      });
      const prior=await existingRun(environment.id,sourceHash);
      if(prior){
        results.push({environmentId:environment.id,deduplicated:true,run:prior});
        continue;
      }
      const current=scope();
      const startedAt=new Date().toISOString();
      const run={
        id:uuid('environment_run'),
        environmentId:environment.id,
        tenantId:current.tenantId,
        userId:current.userId,
        versionNumber:version.versionNumber,
        versionSnapshotJson:version.specJson,
        triggerType:'krisp_transcript_received',
        sourceType:'transcript',
        sourceId:source.id,
        sourceHash,
        status:'processing',
        testMode:false,
        inputJson:{
          sourceId:source.id,
          title:source.title,
          occurredAt:source.occurredAt||source.createdAt||'',
          attendees:externalRecipients(source),
          sourceUrl:source.sourceUrl||'',
          exactSourceSections:exact
        },
        receiptsJson:[],
        outputsJson:{},
        errorMessage:'',
        startedAt,
        completedAt:null
      };
      await saveRun(run);
      try{
        if(!exact.ready)throw new Error('The matching transcript did not include inspectable Krisp Key Points or Action Items.');
        if(!externalRecipients(source).length)throw new Error('The matching transcript did not include a valid attendee email address.');
        const receipts=await observerReceiptsFor({version,source,exact,runId:run.id});
        const outputs=meetingOutputs(version.specJson,source);
        const actions=await prepareEnvironmentActions({environment,version,source,run,outputs});
        const completedAt=new Date().toISOString();
        const saved=await saveRun({
          ...run,
          status:actions.status,
          receiptsJson:receipts,
          outputsJson:{...outputs,actionReceipts:actions.actionReceipts,packetIds:actions.packetIds},
          completedAt
        });
        if(actions.status==='needs_attention'){
          await saveEnvironment({...environment,status:'needs_attention',updatedAt:completedAt});
          await onNeedsAttention({environment,version,source,run:saved,reason:'One or more Environment actions failed.'});
        }
        results.push({environmentId:environment.id,deduplicated:false,run:saved});
      }catch(error){
        const completedAt=new Date().toISOString();
        const failed=await saveRun({...run,status:'needs_attention',errorMessage:error.message,completedAt});
        await saveEnvironment({...environment,status:'needs_attention',updatedAt:completedAt});
        await onNeedsAttention({environment,version,source,run:failed,reason:error.message}).catch(()=>{});
        results.push({environmentId:environment.id,deduplicated:false,run:failed,error:error.message});
      }
    }
    return {ok:true,matched:matches.length,runs:results};
  }
  return {
    list,
    get:async id=>hydrateEnvironment(await getEnvironment(id)),
    saveDraft,
    activate,
    pause,
    runHistoricalTest,
    listRuns,
    latestSuccessfulTest,
    processTranscript,
    blockCatalog:environmentBlockCatalog,
    normalizeSpec:normalizeEnvironmentSpec,
    validateSpec:validateEnvironmentSpec,
    humanContract:humanEnvironmentContract,
    sourceHash:environmentSourceHash
  };
}

module.exports={
  createValEnvironmentsService,
  environmentBlockCatalog,
  normalizeEnvironmentSpec,
  validateEnvironmentSpec,
  humanEnvironmentContract,
  environmentSourceHash,
  titleRuleMatches,
  exactMeetingContent,
  meetingOutputs
};
