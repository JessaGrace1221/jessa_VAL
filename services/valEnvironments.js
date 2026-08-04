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
  for(const key of ['specJson','humanContractJson','versionSnapshotJson','inputJson','receiptsJson','outputsJson','topicsJson','evidenceRefsJson','observerReceiptsJson','chiefAdvisoryJson','outputSummaryJson','lineageJson']){
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
function normalizeApproval(value=''){
  return value==='preauthorized'?'preauthorized':'required';
}
function normalizeWorkflowText(value='',fallback='',limit=2400){
  const text=compactText(value,limit);
  return text||fallback;
}
function normalizeTemplateText(value='',fallback='',limit=2400){
  const text=String(value||'').replace(/\r\n/g,'\n').replace(/\r/g,'\n').trim().slice(0,limit);
  return text||fallback;
}
const VAL_ENVIRONMENT_SHARE_FORMAT='val_environment_template_v1';
function environmentBlockCatalog(){
  return {
    sources:[
      {blockType:'source',blockId:'krisp_transcript',label:'Krisp Transcript',emits:['transcript_packet_v1']},
      {blockType:'source',blockId:'calendar_event',label:'Calendar Event',emits:['calendar_event_packet_v1']},
      {blockType:'source',blockId:'email',label:'Email',emits:['email_packet_v1']},
      {blockType:'source',blockId:'voice_or_chat',label:'VAL Conversation',emits:['conversation_packet_v1']},
      {blockType:'source',blockId:'environment_network',label:'Environment Network',emits:['environment_result_packet_v1']}
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
      {blockType:'external_action',blockId:'send_sms',label:'Send me a Text Message',accepts:['approved_action_v1'],policy:'phone_provider_required'},
      {blockType:'external_action',blockId:'append_google_doc',label:'Append to Google Doc',accepts:['approved_action_v1'],policy:'document_id_bounded'}
    ],
    communication:[
      {blockType:'communication',blockId:'publish_result',label:'Publish Result Packet',emits:['environment_result_packet_v1'],policy:'one_per_live_run'},
      {blockType:'communication',blockId:'receive_context',label:'Receive Environment Context',accepts:['environment_result_packet_v1'],policy:'context_only'},
      {blockType:'communication',blockId:'explicit_handoff',label:'Explicit Handoff',accepts:['environment_result_packet_v1'],policy:'never_automatic'}
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
  const instructions=input.instructions&&typeof input.instructions==='object'?input.instructions:{};
  const actions=input.actions&&typeof input.actions==='object'?input.actions:{};
  const eventTitlePattern=compactText(trigger.eventTitlePattern||trigger.event_title_pattern||input.eventTitlePattern,220);
  const appendGoogleDoc=Boolean(actions.appendGoogleDoc||actions.append_google_doc||connections.googleDocumentId||connections.google_document_id);
  const sendEmail=actions.sendEmail!==false&&actions.send_email!==false;
  const sendSms=Boolean(actions.sendSms||actions.send_sms||safeArray(actions.executionOrder||actions.execution_order).includes('send_sms'));
  const actionScope=[sendEmail?'send_email':'',sendSms?'send_sms':'',appendGoogleDoc?'append_google_doc':''].filter(Boolean);
  return {
    contractVersion:1,
    name:compactText(input.name||'Untitled Environment',120),
    outcome:compactText(input.outcome,600),
    purpose:compactText(input.purpose,900),
    trigger:{
      type:String(trigger.type||input.triggerType||'krisp_transcript_received'),
      eventTitlePattern,
      eventTitleConfirmed:Boolean(trigger.eventTitleConfirmed||trigger.event_title_confirmed),
      mode:String(trigger.mode||(eventTitlePattern?'immediate':'all_transcripts'))
    },
    observerIds,
    roundTable:{required:true,authority:'observe_only'},
    chiefOfStaff:{required:true,authority:'advise_only'},
    communication:{
      publishResult:true,
      receiveSiblingContext:true,
      subscription:'all_active_environments',
      automaticHandoffs:false,
      maxContextPackets:20
    },
    instructions:{
      sourceTruth:normalizeWorkflowText(instructions.sourceTruth,'Use Krisp Action Items and Key Points exactly as received.',900),
      formatting:normalizeWorkflowText(instructions.formatting,'Basic headings and a short introduction are allowed. Source wording is not rewritten.',900),
      recipientRule:normalizeWorkflowText(instructions.recipientRule,'Include every attendee except the executive.',900),
      emailSubject:normalizeWorkflowText(instructions.emailSubject,'Meeting Title and Date - Overview',220),
      emailBodyTemplate:normalizeTemplateText(instructions.emailBodyTemplate,[
        'Hello, VAL here. I am Jessa\'s AI assistant.',
        'After reading the transcript, {{upbeat_key_point}}',
        '',
        'Action Items',
        '{{action_items}}',
        '',
        'Key Points',
        '{{key_points}}',
        '',
        'If you have your own VAL all of this information will now be in your own system. If you do not have a VAL be sure to ask Jessa about getting you set up.'
      ].join('\n'),2400),
      upbeatKeyPointInstruction:normalizeWorkflowText(instructions.upbeatKeyPointInstruction,'Write one upbeat, transcript-grounded sentence about the meeting momentum without inventing facts.',600),
      failureOrder:safeArray(instructions.failureOrder).length?safeArray(instructions.failureOrder):['ask_user','create_alignment_item','notify_chief_of_staff','pause_environment']
    },
    connections:{
      emailProvider:normalizeEmailProvider(connections.emailProvider||connections.email_provider),
      googleDocumentId:compactText(connections.googleDocumentId||connections.google_document_id,240)
    },
    actions:{
      sendEmail,
      sendSms,
      actionId:compactText(actions.actionId||actions.action_id,80),
      appendGoogleDoc,
      executionOrder:actionScope
    },
    approvals:{
      sendEmail:normalizeApproval(approvals.sendEmail),
      appendGoogleDoc:normalizeApproval(approvals.appendGoogleDoc),
      recipientScope:'meeting_attendees_except_executive',
      actionScope
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
function portableEnvironmentSpec(input={}){
  const spec=normalizeEnvironmentSpec(input);
  return {
    ...spec,
    trigger:{
      ...spec.trigger,
      eventTitlePattern:'',
      eventTitleConfirmed:false
    },
    connections:{
      emailProvider:'',
      googleDocumentId:''
    },
    approvals:{
      ...spec.approvals,
      sendEmail:'required',
      appendGoogleDoc:'required'
    },
    sharing:{
      ...spec.sharing,
      stripPersonalEvidence:true,
      stripCredentials:true,
      stripContactIdentities:true,
      stripAccountMappings:true,
      installAsDraft:true
    }
  };
}
function environmentSharePackage({environment={},version={},exportedAt=new Date().toISOString()}={}){
  const spec=portableEnvironmentSpec(version.specJson||version.spec_json||{});
  return {
    format:VAL_ENVIRONMENT_SHARE_FORMAT,
    formatVersion:1,
    exportedAt,
    template:{
      name:spec.name,
      outcome:spec.outcome,
      purpose:spec.purpose,
      spec,
      sourceVersion:Number(version.versionNumber||version.version_number||1),
      safety:{
        containsCredentials:false,
        containsEvidence:false,
        containsContacts:false,
        containsRunHistory:false,
        installsAsDraft:true
      },
      recipientSetup:[
        'Confirm the recurring source trigger.',
        'Connect the recipient sending account.',
        'Connect each external destination.',
        'Review approval boundaries.',
        'Test with the recipient’s own historical evidence.'
      ]
    }
  };
}
function importedEnvironmentSpec(input={}){
  if(input?.format!==VAL_ENVIRONMENT_SHARE_FORMAT||Number(input?.formatVersion)!==1){
    throw new Error('This is not a supported VAL Environment share file.');
  }
  const rawSpec=input?.template?.spec;
  if(!rawSpec||typeof rawSpec!=='object'||Array.isArray(rawSpec)){
    throw new Error('This Environment share file does not contain a usable template.');
  }
  return portableEnvironmentSpec(rawSpec);
}
function validateEnvironmentSpec(spec={}){
  const errors=[];
  const observerIds=new Set(publicObserverBlockDefinitions().map(block=>block.observerId));
  if(!compactText(spec.name,120))errors.push('Name the Environment.');
  if(!compactText(spec.outcome,600))errors.push('Explain the outcome this Environment should create.');
  if(!compactText(spec.purpose,900))errors.push('Explain why this Environment exists.');
  if(spec.trigger?.type!=='krisp_transcript_received')errors.push('This Environment currently requires a Krisp transcript trigger.');
  const allTranscripts=spec.trigger?.mode==='all_transcripts';
  if(!allTranscripts&&!compactText(spec.trigger?.eventTitlePattern,220))errors.push('Confirm the recurring calendar event title or choose every transcript.');
  if(!allTranscripts&&!spec.trigger?.eventTitleConfirmed)errors.push('Confirm the recurring calendar event title rule or choose every transcript.');
  if(!safeArray(spec.observerIds).length)errors.push('Choose at least one Observer.');
  for(const id of safeArray(spec.observerIds))if(!observerIds.has(id))errors.push(`Unknown Observer: ${id}.`);
  if(!spec.roundTable?.required)errors.push('Every Environment requires the Round Table.');
  if(!spec.chiefOfStaff?.required)errors.push('Every Environment requires the Chief of Staff.');
  if(spec.actions?.sendEmail!==false&&!normalizeEmailProvider(spec.connections?.emailProvider))errors.push('Select the connected sending account.');
  if(spec.actions?.appendGoogleDoc&& !compactText(spec.connections?.googleDocumentId,240))errors.push('Add the destination Google Doc ID or turn off the Google Doc action.');
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
    when:spec.trigger?.mode==='all_transcripts'
      ? 'Immediately after VAL receives any Krisp transcript.'
      : `Immediately after VAL receives a Krisp transcript matching "${spec.trigger?.eventTitlePattern||''}".`,
    listensTo:'Krisp Action Items, Key Points, attendee emails, meeting title, and meeting date.',
    observers,
    observerPurpose:'Each selected Observer reviews the exact meeting packet. The Round Table observes their receipts. The Chief of Staff advises but does not govern execution.',
    sharedIntelligence:'Every live run publishes one evidence-backed result packet. Other active Environments may use it as context, but cannot act from it without an explicit governed handoff.',
    produces:[
      spec.actions?.sendEmail!==false?'One email to all attendees except the executive.':'',
      spec.actions?.appendGoogleDoc?'One dated section appended to the selected Google Doc.':''
    ].filter(Boolean),
    sourcePromise:'Krisp Action Items and Key Points remain word for word.',
    approval:{
      email:spec.approvals?.sendEmail||'required',
      googleDoc:spec.actions?.appendGoogleDoc?spec.approvals?.appendGoogleDoc||'required':'disabled'
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
function environmentMatchesSource(spec={},source={}){
  if(spec.trigger?.type!=='krisp_transcript_received')return false;
  if(spec.trigger?.mode==='all_transcripts')return true;
  return titleRuleMatches(spec.trigger?.eventTitlePattern,source.title||source.meetingTitle||'');
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
function numberedLines(lines=[]){
  return safeArray(lines).map((line,index)=>`${index+1}. ${compactText(line,800)}`).filter(Boolean).join('\n');
}
function upbeatMeetingPoint(spec={},source={},exact={}){
  const firstKeyPoint=sourceLines(exact.keyPoints||source.keyPoints)[0]||'it feels like momentum is happening.';
  const sentence=compactText(firstKeyPoint,220);
  if(/[.!?]$/.test(sentence))return sentence;
  return sentence+'.';
}
function renderEnvironmentEmailBody(spec={},source={},exact={}){
  const template=normalizeTemplateText(spec.instructions?.emailBodyTemplate,'',2400);
  if(!template)return [
    `Hello, VAL here. I am Jessa's AI assistant.`,
    `After reading the transcript, ${upbeatMeetingPoint(spec,source,exact)}`,
    '',
    'Action Items',
    numberedLines(exact.actionItems),
    '',
    'Key Points',
    numberedLines(exact.keyPoints),
    '',
    'If you have your own VAL all of this information will now be in your own system. If you do not have a VAL be sure to ask Jessa about getting you set up.'
  ].join('\n').trim();
  return template
    .replace(/\{\{\s*upbeat_key_point\s*\}\}/gi,upbeatMeetingPoint(spec,source,exact))
    .replace(/\{\{\s*action_items\s*\}\}/gi,numberedLines(exact.actionItems)||'No Action Items were provided.')
    .replace(/\{\{\s*key_points\s*\}\}/gi,numberedLines(exact.keyPoints)||'No Key Points were provided.')
    .replace(/\{\{\s*meeting_title\s*\}\}/gi,compactText(source.title||source.meetingTitle||'the meeting',220))
    .replace(/\{\{\s*meeting_date\s*\}\}/gi,displayDate(source.occurredAt||source.createdAt));
}
function meetingOutputs(spec={},source={}){
  const exact=exactMeetingContent(source);
  const title=compactText(source.title||'Meeting',220);
  const date=displayDate(source.occurredAt||source.createdAt);
  const attendees=externalRecipients(source);
  const emailBody=renderEnvironmentEmailBody(spec,source,exact);
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
      subject:normalizeWorkflowText(spec.instructions?.emailSubject,'Meeting Title and Date - Overview',220)
        .replace(/\{\{\s*meeting_title\s*\}\}/gi,title)
        .replace(/\{\{\s*meeting_date\s*\}\}/gi,date),
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
    executionOrder:safeArray(spec.actions?.executionOrder).length?safeArray(spec.actions.executionOrder):['send_email']
  };
}

function environmentPacketTopics({environment={},source={},receipts=[]}={}){
  const topics=new Set(['environment_result',String(source.sourceType||'transcript')]);
  for(const receipt of safeArray(receipts)){
    if(receipt?.type==='observer_receipt_v1'&&receipt.status==='observed')topics.add(`observer:${receipt.observerId}`);
  }
  const titleTokens=normalizedTitle(`${environment.name||''} ${source.title||''}`)
    .split(' ')
    .filter(token=>token.length>3)
    .slice(0,8);
  for(const token of titleTokens)topics.add(`topic:${token}`);
  return [...topics];
}

function environmentOutputSummary(outputs={}){
  const actionReceipts=safeArray(outputs.actionReceipts);
  return {
    preparedActions:actionReceipts.map(receipt=>({
      action:receipt.action||'',
      status:receipt.status||'',
      packetId:receipt.packetId||''
    })),
    emailPrepared:Boolean(outputs.email?.subject),
    documentPrepared:Boolean(outputs.googleDoc?.documentId),
    approvalRequired:actionReceipts.some(receipt=>receipt.status==='awaiting_approval'),
    completedActions:actionReceipts.filter(receipt=>receipt.status==='executed').length
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
  onPacketPublished=async()=>{},
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
    if(!Array.isArray(state.valEnvironmentPackets))state.valEnvironmentPackets=[];
    if(!Array.isArray(state.valEnvironmentPacketDeliveries))state.valEnvironmentPacketDeliveries=[];
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
      const result=await dbQuery(`select * from val_environments where tenant_id=$1 and user_id=$2 and status<>'deleted' order by updated_at desc limit $3`,[current.tenantId,current.userId,Math.max(1,Math.min(Number(limit)||50,200))]);
      rows=(result.rows||[]).map(rowToCamel);
    }else{
      rows=store().valEnvironments.filter(item=>item.tenantId===current.tenantId&&item.userId===current.userId&&item.status!=='deleted').slice(0,limit);
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
  async function savePacket(row){
    if(hasPg()){
      const result=await dbQuery(`
        insert into val_environment_packets (
          id,tenant_id,user_id,source_environment_id,source_run_id,source_type,source_id,
          packet_type,title,summary,topics_json,evidence_refs_json,observer_receipts_json,
          chief_advisory_json,output_summary_json,lineage_json,status,created_at
        ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,$12::jsonb,$13::jsonb,$14::jsonb,$15::jsonb,$16::jsonb,$17,$18)
        on conflict (tenant_id,user_id,source_run_id) do update set
          title=excluded.title,summary=excluded.summary,topics_json=excluded.topics_json,
          evidence_refs_json=excluded.evidence_refs_json,observer_receipts_json=excluded.observer_receipts_json,
          chief_advisory_json=excluded.chief_advisory_json,output_summary_json=excluded.output_summary_json,
          lineage_json=excluded.lineage_json,status=excluded.status
        returning *
      `,[
        row.id,row.tenantId,row.userId,row.sourceEnvironmentId,row.sourceRunId,row.sourceType||null,
        row.sourceId||null,row.packetType,row.title,row.summary,JSON.stringify(row.topicsJson||[]),
        JSON.stringify(row.evidenceRefsJson||[]),JSON.stringify(row.observerReceiptsJson||[]),
        JSON.stringify(row.chiefAdvisoryJson||{}),JSON.stringify(row.outputSummaryJson||{}),
        JSON.stringify(row.lineageJson||{}),row.status,row.createdAt
      ]);
      return rowToCamel(result.rows?.[0]||row);
    }
    const state=store();
    const index=state.valEnvironmentPackets.findIndex(item=>item.sourceRunId===row.sourceRunId&&item.tenantId===row.tenantId&&item.userId===row.userId);
    if(index>=0)state.valEnvironmentPackets[index]={...state.valEnvironmentPackets[index],...row,id:state.valEnvironmentPackets[index].id};
    else state.valEnvironmentPackets.unshift(row);
    saveStore(state);
    return index>=0?state.valEnvironmentPackets[index]:row;
  }
  async function saveDelivery(row){
    if(hasPg()){
      const result=await dbQuery(`
        insert into val_environment_packet_deliveries (
          id,tenant_id,user_id,packet_id,target_environment_id,status,reason,attached_run_id,created_at,updated_at
        ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        on conflict (tenant_id,user_id,packet_id,target_environment_id) do update set
          status=excluded.status,reason=excluded.reason,attached_run_id=excluded.attached_run_id,updated_at=excluded.updated_at
        returning *
      `,[row.id,row.tenantId,row.userId,row.packetId,row.targetEnvironmentId,row.status,row.reason||null,row.attachedRunId||null,row.createdAt,row.updatedAt]);
      return rowToCamel(result.rows?.[0]||row);
    }
    const state=store();
    const index=state.valEnvironmentPacketDeliveries.findIndex(item=>item.packetId===row.packetId&&item.targetEnvironmentId===row.targetEnvironmentId&&item.tenantId===row.tenantId&&item.userId===row.userId);
    if(index>=0)state.valEnvironmentPacketDeliveries[index]={...state.valEnvironmentPacketDeliveries[index],...row,id:state.valEnvironmentPacketDeliveries[index].id,createdAt:state.valEnvironmentPacketDeliveries[index].createdAt};
    else state.valEnvironmentPacketDeliveries.unshift(row);
    saveStore(state);
    return index>=0?state.valEnvironmentPacketDeliveries[index]:row;
  }
  async function incomingContext(environmentId,{limit=20}={}){
    const current=scope();
    const boundedLimit=Math.max(1,Math.min(Number(limit)||20,50));
    if(hasPg()){
      const result=await dbQuery(`
        select p.*,d.id as delivery_id,d.status as delivery_status,d.reason as delivery_reason,
          d.attached_run_id as delivery_attached_run_id,d.updated_at as delivery_updated_at
        from val_environment_packet_deliveries d
        join val_environment_packets p on p.id=d.packet_id and p.tenant_id=d.tenant_id and p.user_id=d.user_id
        where d.tenant_id=$1 and d.user_id=$2 and d.target_environment_id=$3 and p.status='published'
        order by p.created_at desc limit $4
      `,[current.tenantId,current.userId,environmentId,boundedLimit]);
      return (result.rows||[]).map(rowToCamel);
    }
    const state=store();
    return state.valEnvironmentPacketDeliveries
      .filter(item=>item.tenantId===current.tenantId&&item.userId===current.userId&&item.targetEnvironmentId===environmentId)
      .map(delivery=>{
        const packet=state.valEnvironmentPackets.find(item=>item.id===delivery.packetId&&item.tenantId===current.tenantId&&item.userId===current.userId);
        return packet?{...packet,deliveryId:delivery.id,deliveryStatus:delivery.status,deliveryReason:delivery.reason||'',deliveryAttachedRunId:delivery.attachedRunId||'',deliveryUpdatedAt:delivery.updatedAt}:null;
      })
      .filter(Boolean)
      .sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)))
      .slice(0,boundedLimit);
  }
  async function markContextUsed(environmentId,packets,runId){
    const current=scope();
    const now=new Date().toISOString();
    await Promise.all(safeArray(packets).map(packet=>saveDelivery({
      id:packet.deliveryId||uuid('environment_delivery'),
      tenantId:current.tenantId,
      userId:current.userId,
      packetId:packet.id,
      targetEnvironmentId:environmentId,
      status:'used',
      reason:'Included in this run and presented to the selected Observers as sibling Environment context.',
      attachedRunId:runId,
      createdAt:packet.createdAt||now,
      updatedAt:now
    })));
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
  async function exportTemplate(id){
    const environment=await getEnvironment(id);
    if(!environment)throw new Error('Environment not found.');
    const version=await getVersion(environment.draftVersionId||environment.activeVersionId);
    if(!version)throw new Error('This Environment has no version to share.');
    return {
      ok:true,
      share:environmentSharePackage({environment,version}),
      message:'Private evidence, identities, connections, approvals, and run history were removed.'
    };
  }
  async function importTemplate(input={}){
    const spec=importedEnvironmentSpec(input?.share||input);
    const result=await saveDraft({spec});
    return {
      ...result,
      imported:true,
      message:'Environment imported as a disconnected Draft. Reconnect, review, and test it before activation.',
      requiredSetup:[
        'trigger',
        'sending_account',
        'external_destinations',
        'approval_boundaries',
        'historical_test'
      ]
    };
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
    const hydrated=await hydrateEnvironment(saved);
    await backfillEnvironmentDeliveries(hydrated);
    return {ok:true,environment:hydrated,activated:true};
  }
  async function pause(id){
    const environment=await getEnvironment(id);
    if(!environment)throw new Error('Environment not found.');
    const saved=await saveEnvironment({...environment,status:'paused',updatedAt:new Date().toISOString()});
    return {ok:true,environment:await hydrateEnvironment(saved)};
  }
  async function deleteEnvironment(id){
    const environment=await getEnvironment(id);
    if(!environment)throw new Error('Environment not found.');
    const saved=await saveEnvironment({
      ...environment,
      status:'deleted',
      activeVersionId:null,
      draftVersionId:null,
      updatedAt:new Date().toISOString()
    });
    return {ok:true,deleted:true,environment:await hydrateEnvironment(saved),no_external_action:true};
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
    if(!environmentMatchesSource(version.specJson,source)){
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
    const siblingContext=version.specJson.communication?.receiveSiblingContext===false
      ? []
      : await incomingContext(id,{limit:version.specJson.communication?.maxContextPackets||20});
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
        exactSourceSections:exact,
        environmentContextPackets:siblingContext
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
        observerReceipts.push(await previewObserver({observer,source,exactSections:exact,environment:version.specJson,runId,siblingContextPackets:siblingContext}));
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
        environmentContextPacketIds:siblingContext.map(packet=>packet.id),
        environmentContextCount:siblingContext.length,
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
  async function publishRunPacket({environment,run,source}={}){
    if(!environment||!run||run.testMode||environment.activeVersion?.specJson?.communication?.publishResult===false)return null;
    const current=scope();
    const receipts=safeArray(run.receiptsJson);
    const observerReceipts=receipts.filter(receipt=>receipt.type==='observer_receipt_v1');
    const chief=receipts.find(receipt=>receipt.type==='chief_advisory_receipt_v1')||{};
    const sourceEvidence={
      source_type:run.sourceType||'transcript',
      source_id:run.sourceId||source?.id||'',
      quote_or_summary:compactText(run.inputJson?.exactSourceSections?.body||source?.title||run.inputJson?.title||'Environment source',900),
      confidence:1,
      created_at:source?.occurredAt||source?.createdAt||run.completedAt||new Date().toISOString()
    };
    const evidenceRefs=[sourceEvidence,...observerReceipts.flatMap(receipt=>safeArray(receipt.evidence)).filter(Boolean)];
    const observedCount=observerReceipts.filter(receipt=>receipt.status==='observed').length;
    const sourceContextPackets=safeArray(run.inputJson?.environmentContextPackets);
    let packet=await savePacket({
      id:uuid('environment_packet'),
      tenantId:current.tenantId,
      userId:current.userId,
      sourceEnvironmentId:environment.id,
      sourceRunId:run.id,
      sourceType:run.sourceType||'transcript',
      sourceId:run.sourceId||source?.id||'',
      packetType:'environment_result_packet_v1',
      title:`${environment.name}: ${compactText(source?.title||run.inputJson?.title||'Completed run',180)}`,
      summary:`${environment.name} completed a governed run. ${observedCount} selected Observer${observedCount===1?' found':'s found'} a source-backed signal; ${environmentOutputSummary(run.outputsJson).preparedActions.length} configured action${environmentOutputSummary(run.outputsJson).preparedActions.length===1?' was':'s were'} prepared or completed.`,
      topicsJson:environmentPacketTopics({environment,source:{...source,sourceType:run.sourceType},receipts}),
      evidenceRefsJson:evidenceRefs,
      observerReceiptsJson:observerReceipts,
      chiefAdvisoryJson:chief,
      outputSummaryJson:environmentOutputSummary(run.outputsJson),
      lineageJson:{
        sourceEnvironmentId:environment.id,
        sourceRunId:run.id,
        parentPacketIds:sourceContextPackets.map(item=>item.id).filter(Boolean),
        sourceEnvironmentIds:[...new Set(sourceContextPackets.map(item=>item.sourceEnvironmentId).filter(Boolean))],
        boardDeliveryStatus:'pending'
      },
      status:'published',
      createdAt:run.completedAt||new Date().toISOString()
    });
    const siblings=(await activeEnvironments()).filter(item=>item.id!==environment.id&&item.activeVersion?.specJson?.communication?.receiveSiblingContext!==false);
    const now=new Date().toISOString();
    const deliveries=[];
    for(const sibling of siblings){
      deliveries.push(await saveDelivery({
        id:uuid('environment_delivery'),
        tenantId:current.tenantId,
        userId:current.userId,
        packetId:packet.id,
        targetEnvironmentId:sibling.id,
        status:'received',
        reason:'Published by an active sibling Environment and available for the next governed run.',
        attachedRunId:null,
        createdAt:now,
        updatedAt:now
      }));
    }
    try{
      await onPacketPublished({packet,environment,run,source,deliveries});
      packet=await savePacket({...packet,lineageJson:{...packet.lineageJson,boardDeliveryStatus:'queued_for_briefing'}});
    }catch(error){
      packet=await savePacket({...packet,lineageJson:{...packet.lineageJson,boardDeliveryStatus:'needs_attention',boardDeliveryError:compactText(error.message,240)}});
    }
    return {...packet,deliveries};
  }
  async function listNetwork({limit=50}={}){
    const current=scope();
    const boundedLimit=Math.max(1,Math.min(Number(limit)||50,200));
    const environments=(await list({limit:200})).environments;
    let packets=[];
    let deliveries=[];
    let packetCount=0;
    let deliveryCounts={received:0,used:0,deferred:0,not_relevant:0};
    if(hasPg()){
      const [packetResult,packetCountResult,deliveryCountResult]=await Promise.all([
        dbQuery('select * from val_environment_packets where tenant_id=$1 and user_id=$2 order by created_at desc limit $3',[current.tenantId,current.userId,boundedLimit]),
        dbQuery('select count(*)::int as count from val_environment_packets where tenant_id=$1 and user_id=$2',[current.tenantId,current.userId]),
        dbQuery('select status,count(*)::int as count from val_environment_packet_deliveries where tenant_id=$1 and user_id=$2 group by status',[current.tenantId,current.userId])
      ]);
      packets=(packetResult.rows||[]).map(rowToCamel);
      packetCount=Number(packetCountResult.rows?.[0]?.count||0);
      deliveryCounts=Object.fromEntries((deliveryCountResult.rows||[]).map(row=>[row.status,Number(row.count)||0]));
      if(packets.length){
        const deliveryResult=await dbQuery('select * from val_environment_packet_deliveries where tenant_id=$1 and user_id=$2 and packet_id=any($3::text[]) order by updated_at desc',[current.tenantId,current.userId,packets.map(packet=>packet.id)]);
        deliveries=(deliveryResult.rows||[]).map(rowToCamel);
      }
    }else{
      const state=store();
      const allPackets=state.valEnvironmentPackets.filter(item=>item.tenantId===current.tenantId&&item.userId===current.userId);
      const allDeliveries=state.valEnvironmentPacketDeliveries.filter(item=>item.tenantId===current.tenantId&&item.userId===current.userId);
      packets=allPackets.slice(0,boundedLimit);
      packetCount=allPackets.length;
      deliveryCounts=allDeliveries.reduce((counts,item)=>({...counts,[item.status]:(counts[item.status]||0)+1}),deliveryCounts);
      const packetIds=new Set(packets.map(packet=>packet.id));
      deliveries=allDeliveries.filter(item=>packetIds.has(item.packetId));
    }
    return {
      ok:true,
      environments,
      packets,
      deliveries,
      chiefOfStaff:{
        packetCount,
        latestPacketAt:packets[0]?.createdAt||null,
        role:'Receives and indexes every Environment result packet.'
      },
      counts:{
        environments:environments.length,
        active:environments.filter(item=>item.status==='active').length,
        packets:packetCount,
        received:deliveryCounts.received||0,
        used:deliveryCounts.used||0,
        deferred:deliveryCounts.deferred||0,
        notRelevant:deliveryCounts.not_relevant||0
      }
    };
  }
  async function listCommunications(environmentId,{limit=50}={}){
    const network=await listNetwork({limit});
    const incomingDeliveries=network.deliveries.filter(item=>item.targetEnvironmentId===environmentId);
    const incomingIds=new Set(incomingDeliveries.map(item=>item.packetId));
    const outgoing=network.packets.filter(item=>item.sourceEnvironmentId===environmentId);
    const incoming=network.packets.filter(item=>incomingIds.has(item.id)).map(packet=>({
      ...packet,
      delivery:incomingDeliveries.find(item=>item.packetId===packet.id)||null
    }));
    return {ok:true,environmentId,incoming,outgoing,chiefOfStaff:network.chiefOfStaff};
  }
  async function backfillEnvironmentDeliveries(environment){
    if(!environment?.id||environment.activeVersion?.specJson?.communication?.receiveSiblingContext===false)return [];
    const current=scope();
    let packets=[];
    let existingPacketIds=new Set();
    if(hasPg()){
      const [packetResult,deliveryResult]=await Promise.all([
        dbQuery(`select * from val_environment_packets where tenant_id=$1 and user_id=$2 and source_environment_id<>$3 and status='published' order by created_at desc limit 1000`,[current.tenantId,current.userId,environment.id]),
        dbQuery('select packet_id from val_environment_packet_deliveries where tenant_id=$1 and user_id=$2 and target_environment_id=$3',[current.tenantId,current.userId,environment.id])
      ]);
      packets=(packetResult.rows||[]).map(rowToCamel);
      existingPacketIds=new Set((deliveryResult.rows||[]).map(row=>row.packet_id));
    }else{
      const state=store();
      packets=state.valEnvironmentPackets.filter(packet=>packet.tenantId===current.tenantId&&packet.userId===current.userId&&packet.sourceEnvironmentId!==environment.id&&packet.status==='published');
      existingPacketIds=new Set(state.valEnvironmentPacketDeliveries.filter(delivery=>delivery.tenantId===current.tenantId&&delivery.userId===current.userId&&delivery.targetEnvironmentId===environment.id).map(delivery=>delivery.packetId));
    }
    const now=new Date().toISOString();
    const created=[];
    for(const packet of packets){
      if(existingPacketIds.has(packet.id))continue;
      created.push(await saveDelivery({
        id:uuid('environment_delivery'),
        tenantId:current.tenantId,
        userId:current.userId,
        packetId:packet.id,
        targetEnvironmentId:environment.id,
        status:'received',
        reason:'Existing shared intelligence was made available when this Environment became active.',
        attachedRunId:null,
        createdAt:now,
        updatedAt:now
      }));
    }
    return created;
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
  async function observerReceiptsFor({version,source,exact,runId,siblingContextPackets=[]}){
    const definitions=publicObserverBlockDefinitions()
      .filter(block=>safeArray(version.specJson.observerIds).includes(block.observerId));
    const observerReceipts=[];
    for(const observer of definitions){
      observerReceipts.push(await previewObserver({
        observer,
        source,
        exactSections:exact,
        environment:version.specJson,
        runId,
        siblingContextPackets
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
      environmentContextPacketIds:safeArray(siblingContextPackets).map(packet=>packet.id),
      environmentContextCount:safeArray(siblingContextPackets).length,
      observerSuggestions:[],
      governsExecution:false
    };
    return [...observerReceipts,roundTable,chief];
  }
  async function prepareEnvironmentActions({environment,version,source,run,outputs}){
    if(!externalActions?.createEmailSendPacket){
      throw new Error('VAL Environment action infrastructure is unavailable.');
    }
    if(version.specJson.actions?.appendGoogleDoc&& !externalActions?.createGoogleDocAppendPacket){
      throw new Error('VAL Environment Google Doc action infrastructure is unavailable.');
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
    const packets=[];
    let emailPacket=null;
    if(version.specJson.actions?.sendEmail!==false){
      emailPacket=await externalActions.createEmailSendPacket({
        ...outputs.email,
        messageId:`${run.id}:email`,
        why:`${environment.name} prepared this attendee follow-through from the exact Krisp sections.`,
        sourceRefs:[sourceRef],
        sourceContext:{...commonContext,actionKey:'send_email'},
        finalApprovalSurface:'val_environment'
      });
      packets.push({key:'send_email',approval:version.specJson.approvals?.sendEmail||'required',packet:emailPacket});
    }
    if(version.specJson.actions?.appendGoogleDoc){
      const docPacket=await externalActions.createGoogleDocAppendPacket({
        ...outputs.googleDoc,
        id:`${run.id}:google_doc`,
        title:`Append ${source.title||'meeting'} overview`,
        why:`${environment.name} prepared this dated record from the exact Krisp sections.`,
        sourceRefs:[sourceRef],
        sourceContext:{...commonContext,actionKey:'append_google_doc',dependsOnPacketId:emailPacket?.id||''},
        finalApprovalSurface:'val_environment'
      });
      packets.push({key:'append_google_doc',approval:version.specJson.approvals?.appendGoogleDoc||'required',packet:docPacket});
    }
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
      environmentMatchesSource(environment.activeVersion?.specJson||{},source)
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
      const siblingContext=version.specJson.communication?.receiveSiblingContext===false
        ? []
        : await incomingContext(environment.id,{limit:version.specJson.communication?.maxContextPackets||20});
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
          exactSourceSections:exact,
          environmentContextPackets:siblingContext
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
        const receipts=await observerReceiptsFor({version,source,exact,runId:run.id,siblingContextPackets:siblingContext});
        await markContextUsed(environment.id,siblingContext,run.id);
        const outputs=meetingOutputs(version.specJson,source);
        const actions=await prepareEnvironmentActions({environment,version,source,run,outputs});
        const completedAt=new Date().toISOString();
        let saved=await saveRun({
          ...run,
          status:actions.status,
          receiptsJson:receipts,
          outputsJson:{...outputs,actionReceipts:actions.actionReceipts,packetIds:actions.packetIds},
          completedAt
        });
        if(actions.status!=='needs_attention'){
          const networkPacket=await publishRunPacket({environment:{...environment,activeVersion:version},run:saved,source});
          if(networkPacket){
            saved=await saveRun({...saved,outputsJson:{...saved.outputsJson,environmentPacketId:networkPacket.id}});
          }
        }
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
    exportTemplate,
    importTemplate,
    activate,
    pause,
    delete:deleteEnvironment,
    runHistoricalTest,
    listRuns,
    listNetwork,
    listCommunications,
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
  VAL_ENVIRONMENT_SHARE_FORMAT,
  environmentBlockCatalog,
  normalizeEnvironmentSpec,
  portableEnvironmentSpec,
  environmentSharePackage,
  importedEnvironmentSpec,
  validateEnvironmentSpec,
  humanEnvironmentContract,
  environmentSourceHash,
  environmentMatchesSource,
  titleRuleMatches,
  exactMeetingContent,
  meetingOutputs
};
