function safeArray(value){return Array.isArray(value)?value:[];}
function compactText(value='',limit=700){return String(value||'').replace(/\s+/g,' ').trim().slice(0,limit);}
const {documentLooksLikeCalendarInvite}=require('./valDocumentEvidenceFilters');
function stableKey(value=''){
  return String(value||'').toLowerCase().replace(/[^a-z0-9:_-]+/g,'_').replace(/^_+|_+$/g,'').slice(0,180)||'source';
}
function jsonValue(value,fallback){
  if(value==null)return fallback;
  if(typeof value==='string'){try{return JSON.parse(value);}catch(_){return fallback;}}
  return value;
}
function toSnake(key){return key.replace(/[A-Z]/g,m=>'_'+m.toLowerCase());}
function rowToCamel(row={}){
  const out={};
  for(const [k,v] of Object.entries(row||{})){
    const camel=k.replace(/_([a-z])/g,(_,c)=>c.toUpperCase());
    out[camel]=v instanceof Date?v.toISOString():v;
  }
  for(const key of ['sourceReceiptJson','witnessObservationsJson','executiveRelevanceJson','domainRoutesJson','packetUpdatesJson','reviewUpdatesJson','preparedWorkCandidatesJson','noActionReceiptJson','unknownsJson','metadataJson','payloadJson','sourceRefsJson','actionJson']){
    if(Object.hasOwn(out,key))out[key]=jsonValue(out[key],/json$/i.test(key)&&!/Receipt|Relevance|Action|Metadata|Payload/i.test(key)?[]:{});
  }
  return out;
}
function now(){return new Date().toISOString();}
function normalizeSourceRef(ref={}){
  return {
    source_type:String(ref.source_type||ref.sourceType||ref.type||'unknown'),
    source_id:String(ref.source_id||ref.sourceId||ref.id||''),
    quote_or_summary:compactText(ref.quote_or_summary||ref.quoteOrSummary||ref.summary||ref.quote||'',900),
    confidence:Math.max(0,Math.min(1,Number(ref.confidence)||0)),
    created_at:ref.created_at||ref.createdAt||now()
  };
}
function firstText(...values){
  for(const value of values){
    const text=compactText(value,500);
    if(text)return text;
  }
  return '';
}
function relationshipAdmitted(relationship={}){
  return relationship.admitted===true
    || relationship.relationshipAdmitted===true
    || relationship.relationshipAdmission?.admitted===true
    || relationship.status==='admitted'
    || relationship.admissionStatus==='admitted';
}
function normalizeDocument(doc={},index=0){
  const title=firstText(doc.title,doc.fileName,doc.filename,doc.name,`Document ${index+1}`);
  const sourceId=firstText(doc.sourceId,doc.source_id,doc.id,doc.messageId,title);
  return {
    id:sourceId||stableKey(title),
    title,
    type:firstText(doc.type,doc.kind,doc.mimeType,doc.contentType,'document'),
    summary:compactText(firstText(doc.summary,doc.bodyPreview,doc.text,doc.description,title),900),
    sourceType:firstText(doc.sourceType,doc.source_type,'relationship_document'),
    sourceId,
    sourceUrl:firstText(doc.sourceUrl,doc.url,doc.webUrl)
  };
}
function documentsFromInput(input={}){
  const source=input.source||input.email||{};
  const payload=jsonValue(source.payloadJson||source.payload_json||source.payload,{});
  return safeArray(input.documents)
    .concat(safeArray(source.documents))
    .concat(safeArray(source.attachments))
    .concat(safeArray(source.attachmentsJson||source.attachments_json))
    .concat(safeArray(payload.attachments))
    .filter(doc=>!documentLooksLikeCalendarInvite(doc))
    .map(normalizeDocument)
    .filter(doc=>doc.title||doc.sourceId)
    .filter(doc=>!documentLooksLikeCalendarInvite(doc));
}
function projectNameFromInput(input={},relationship={},documents=[]){
  const source=input.source||input.email||{};
  const subject=firstText(input.projectName,input.name,source.projectName,source.subject,input.subject);
  if(subject)return subject.replace(/^(re|fw|fwd):\s*/i,'').slice(0,180);
  const docTitle=documents[0]?.title ? documents[0].title.replace(/\.[a-z0-9]{2,8}$/i,'') : '';
  const relName=firstText(relationship.name,relationship.displayName,relationship.email,'Relationship');
  return compactText(docTitle ? `${relName} ${docTitle}` : `${relName} document project`,180);
}
function projectLooksLike(project={},projectId='',projectName=''){
  const haystack=[project.id,project.projectId,project.project_id,project.profileKey,project.profile_key,project.name,project.displayName,project.display_name].map(stableKey);
  return haystack.includes(stableKey(projectId)) || haystack.includes(stableKey(projectName));
}
function sourceRecordId(uuid,scope,sourceType,sourceId){
  return stableKey(`source_${scope.tenantId}_${scope.userId}_${sourceType}_${sourceId}`)||uuid('source');
}
function surfaceLabel(value=''){
  return String(value||'').replace(/_/g,' ').replace(/\b\w/g,char=>char.toUpperCase());
}
function sourceProcessingWhatValDidReceipt(record={},overrides={}){
  const metadata=jsonValue(record.metadataJson||record.metadata_json,{});
  const sourceReceipt=jsonValue(record.sourceReceiptJson||record.source_receipt_json,{});
  const noAction=jsonValue(record.noActionReceiptJson||record.no_action_receipt_json,{});
  const domainRoutes=safeArray(record.domainRoutesJson||record.domain_routes_json);
  const reviewUpdates=safeArray(record.reviewUpdatesJson||record.review_updates_json);
  const preparedWork=safeArray(record.preparedWorkCandidatesJson||record.prepared_work_candidates_json);
  const sourceType=firstText(record.sourceType,record.source_type,sourceReceipt.sourceType,sourceReceipt.source_type,'source');
  const sourceId=firstText(record.sourceId,record.source_id,sourceReceipt.sourceId,sourceReceipt.source_id);
  const sourceTitle=firstText(record.sourceTitle,record.source_title,sourceReceipt.sourceTitle,sourceReceipt.source_title,sourceId,'source');
  const documentCount=Number(sourceReceipt.documentCount||sourceReceipt.document_count||metadata.documentCount||metadata.document_count||0);
  const reviewUpdateId=firstText(overrides.reviewUpdateId,metadata.reviewUpdateId,metadata.review_update_id,reviewUpdates[0]?.id);
  const noActionReason=firstText(noAction.reason,metadata.noActionReason);
  const routeLabels=domainRoutes.map(surfaceLabel).filter(Boolean);
  const surfaces=safeArray(overrides.surfaces).length ? safeArray(overrides.surfaces) : safeArray(metadata.surfaces).concat(domainRoutes).filter(Boolean);
  const actionLabels=[];
  let summary='';
  if(noActionReason){
    actionLabels.push('Stored source-only receipt');
    summary=`Kept "${sourceTitle}" as source-only: ${noActionReason}`;
  }else if(reviewUpdateId){
    actionLabels.push('Stored source receipt','Prepared yes/no project review','Registered Project Managers surface','Mirrored in Leverage');
    const documentText=documentCount ? `${documentCount} document${documentCount===1?'':'s'}` : 'the document evidence';
    summary=`Stored the source receipt for "${sourceTitle}", routed ${documentText} to Documents, prepared a Project Managers yes/no suggestion, and mirrored it in Leverage.`;
  }else if(preparedWork.length){
    actionLabels.push('Stored source receipt','Prepared reviewable work');
    summary=`Stored the source receipt for "${sourceTitle}" and prepared ${preparedWork.length} reviewable item${preparedWork.length===1?'':'s'}.`;
  }else if(routeLabels.length){
    actionLabels.push('Stored source receipt','Routed source context');
    summary=`Stored the source receipt for "${sourceTitle}" and routed it to ${routeLabels.join(', ')}.`;
  }else{
    actionLabels.push('Stored source receipt');
    summary=`Stored the source receipt for "${sourceTitle}". No external action was taken.`;
  }
  return {
    label:overrides.label || (/email/i.test(sourceType) ? 'What VAL did from this email' : (/document|attachment|file/i.test(sourceType) ? 'What VAL did from this document' : 'What VAL did from this source')),
    summary:compactText(overrides.summary||summary,900),
    actions:actionLabels.map(label=>({label,external_action:false})),
    surfaces:[...new Set(surfaces)],
    source:{sourceType,sourceId,sourceTitle},
    documentCount,
    reviewUpdateId,
    preparedArtifactRecordId:firstText(overrides.preparedArtifactRecordId,metadata.preparedArtifactRecordId,metadata.prepared_artifact_record_id),
    readyForYouItemId:firstText(overrides.readyForYouItemId,metadata.readyForYouItemId,metadata.ready_for_you_item_id),
    noExternalAction:true,
    externalActionTaken:false,
    createdAt:record.createdAt||record.created_at||now(),
    updatedAt:record.updatedAt||record.updated_at||now()
  };
}
function withWhatValDidReceipt(record={}){
  const metadata=jsonValue(record.metadataJson||record.metadata_json,{});
  const receipt=sourceProcessingWhatValDidReceipt({...record,metadataJson:metadata});
  return {
    ...record,
    metadataJson:{...metadata,whatValDidReceipt:receipt,sourceProcessingReceipt:receipt},
    whatValDidReceipt:receipt
  };
}
function readyItemFromProjectSuggestion({update,sourceProcessingRecordId,preparedArtifactRecordId,readyForYouItemId,whatValDidReceipt=null}={}){
  const value=update.proposedValueJson||update.proposed_value_json||{};
  const actions=safeArray(value.reviewActions).map(action=>({
    key:action.key,
    label:action.label,
    external_action:false,
    review_update_id:update.id
  }));
  return {
    id:readyForYouItemId||stableKey(`ready_project_suggestion_${update.id}`),
    tenantId:update.tenantId||update.tenant_id||'default',
    userId:update.userId||update.user_id||'default',
    eventRunId:'',
    category:'project',
    type:'suggested_project',
    itemType:'suggested_project',
    title:update.title,
    status:'ready_for_review',
    summary:update.summary,
    whyUserIsSeeingThis:'VAL found relationship-sent documents that may define a project and needs your yes/no judgment before creating anything.',
    whyNow:'Documents are the minimum evidence for a Project Managers suggestion, and this came from an admitted relationship.',
    readinessJson:{status:'ready_for_review',review_update_id:update.id,project_id:value.projectId||'',project_name:value.projectName||''},
    whatValPrepared:'Prepared a suggested project review from relationship-sent documents. No project has been created yet.',
    whatUserNeedsToDo:'Choose whether this should become a project and receive an assigned Project Manager.',
    whatValDid:whatValDidReceipt?.summary || 'Stored the source receipt, routed the documents to Documents, prepared the Project Managers suggestion, and registered it in Leverage for review.',
    whatOnlyUserCanDo:'Decide whether the document set is actually a project.',
    estimatedReviewMinutes:2,
    sourceRefsJson:safeArray(update.sourceRefsJson||update.source_refs_json),
    confidence:update.confidence||0.76,
    requiresApproval:true,
    approvalPolicy:'approval_required',
    representationRisk:'medium',
    actionsJson:actions,
    metadataJson:{source:'source_processing_spine',reviewUpdateId:update.id,sourceProcessingRecordId,preparedArtifactRecordId,whatValDidReceipt,sourceProcessingReceipt:whatValDidReceipt,noExternalAction:true,surfaces:['project_managers','home_leverage']},
    decisionJson:{},
    createdAt:now(),
    updatedAt:now(),
    reviewedAt:null,
    snoozedUntil:null
  };
}

function surfaceMetadataFromProjectSuggestion(update={}){
  const value=update.proposedValueJson||update.proposed_value_json||{};
  return {
    projectName:value.projectName||'',
    owner:value.owner||value.relationship||{},
    assignedProjectManager:value.assignedProjectManager||{},
    documentCount:safeArray(value.documents).length,
    documentPlacement:value.documentPlacement||[],
    noExternalAction:true
  };
}

function createValSourceProcessingService({
  dbQuery,
  hasPg=()=>false,
  getStore=()=>({}),
  saveStore=()=>{},
  uuid=(prefix)=>`${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`,
  tenantId=()=>'default',
  userId=()=>'default',
  reviewUpdatesService=null,
  readyForYouService=null,
  listProjectProfiles=null
}={}){
  function scope(){return {tenantId:tenantId(),userId:userId()};}
  function store(){
    const s=getStore()||{};
    for(const key of ['sourceProcessingRecords','preparedArtifactRecords','surfaceRegistrations','readyForYouItems'])if(!Array.isArray(s[key]))s[key]=[];
    return s;
  }
  async function pgUpsert(table,row,columns){
    const values=columns.map(c=>row[c]);
    const names=columns.map(toSnake);
    const params=columns.map((_,i)=>`$${i+1}`).join(',');
    const updates=names.filter(n=>!['id','created_at'].includes(n)).map(n=>`${n}=excluded.${n}`).join(',');
    const r=await dbQuery(`insert into ${table} (${names.join(',')}) values (${params}) on conflict (id) do update set ${updates} returning *`,values);
    return rowToCamel(r.rows?.[0]||row);
  }
  async function saveRecord(row){
    const withReceipt=withWhatValDidReceipt(row);
    if(hasPg()){
      return withWhatValDidReceipt(await pgUpsert('source_processing_records',withReceipt,['id','tenantId','userId','sourceType','sourceId','sourceTitle','status','sourceReceiptJson','witnessObservationsJson','executiveRelevanceJson','domainRoutesJson','packetUpdatesJson','reviewUpdatesJson','preparedWorkCandidatesJson','noActionReceiptJson','unknownsJson','metadataJson','createdAt','updatedAt']));
    }
    const s=store();const idx=s.sourceProcessingRecords.findIndex(r=>r.id===row.id);
    if(idx>=0)s.sourceProcessingRecords[idx]={...s.sourceProcessingRecords[idx],...withReceipt,createdAt:s.sourceProcessingRecords[idx].createdAt||withReceipt.createdAt,updatedAt:now()};else s.sourceProcessingRecords.unshift(withReceipt);
    saveStore(s);return idx>=0?s.sourceProcessingRecords[idx]:withReceipt;
  }
  async function savePreparedArtifact(row){
    if(hasPg()){
      return pgUpsert('prepared_artifact_records',row,['id','tenantId','userId','sourceProcessingRecordId','artifactType','status','title','summary','payloadJson','sourceRefsJson','reviewUpdateId','metadataJson','createdAt','updatedAt']);
    }
    const s=store();const idx=s.preparedArtifactRecords.findIndex(r=>r.id===row.id);
    if(idx>=0)s.preparedArtifactRecords[idx]={...s.preparedArtifactRecords[idx],...row,createdAt:s.preparedArtifactRecords[idx].createdAt||row.createdAt,updatedAt:now()};else s.preparedArtifactRecords.unshift(row);
    saveStore(s);return idx>=0?s.preparedArtifactRecords[idx]:row;
  }
  async function saveSurfaceRegistration(row){
    if(hasPg()){
      return pgUpsert('surface_registrations',row,['id','tenantId','userId','sourceProcessingRecordId','preparedArtifactRecordId','reviewUpdateId','readyForYouItemId','surface','surfaceTargetType','surfaceTargetId','title','summary','status','actionJson','sourceRefsJson','metadataJson','createdAt','updatedAt']);
    }
    const s=store();const idx=s.surfaceRegistrations.findIndex(r=>r.id===row.id);
    if(idx>=0)s.surfaceRegistrations[idx]={...s.surfaceRegistrations[idx],...row,createdAt:s.surfaceRegistrations[idx].createdAt||row.createdAt,updatedAt:now()};else s.surfaceRegistrations.unshift(row);
    saveStore(s);return idx>=0?s.surfaceRegistrations[idx]:row;
  }
  async function saveReadyItem(item){
    if(readyForYouService?.saveItem)return readyForYouService.saveItem(item);
    const s=store();const idx=s.readyForYouItems.findIndex(r=>r.id===item.id&&r.tenantId===item.tenantId&&r.userId===item.userId);
    if(idx>=0)s.readyForYouItems[idx]={...s.readyForYouItems[idx],...item,createdAt:s.readyForYouItems[idx].createdAt||item.createdAt,updatedAt:now()};else s.readyForYouItems.unshift(item);
    saveStore(s);return idx>=0?s.readyForYouItems[idx]:item;
  }
  async function currentProjects(){
    if(typeof listProjectProfiles==='function')return safeArray(await listProjectProfiles({limit:200}).catch(()=>[]));
    return safeArray(store().relationshipProfiles).filter(p=>p.profileType==='project'||p.profile_type==='project');
  }
  async function processKnowledgeDocument(input={}){
    const sc=scope();
    const document=input.document||input.source||{};
    const sourceType=firstText(document.sourceType,document.source_type,input.sourceType,'knowledge_document');
    const sourceId=firstText(document.sourceId,document.source_id,document.id,input.sourceId,uuid('document'));
    const sourceTitle=firstText(document.title,document.fileName,document.filename,input.title,'Uploaded document');
    const rawText=String(document.rawText||document.raw_text||document.text||document.content||input.rawText||input.raw_text||input.text||input.content||'').trim();
    if(!rawText)throw new Error('Knowledge document processing requires readable document text.');
    const uploadedVia=firstText(document.uploadedVia,document.uploaded_via,input.uploadedVia,input.uploaded_via,'val_file_upload');
    const docType=firstText(document.docType,document.doc_type,input.docType,input.doc_type,'knowledge_document');
    const documentCategory=firstText(document.documentCategory,document.document_category,input.documentCategory,input.document_category,'other');
    const sourceRef=normalizeSourceRef({
      sourceType,
      sourceId,
      quoteOrSummary:compactText(rawText,900),
      confidence:1,
      createdAt:firstText(document.createdAt,document.created_at,input.createdAt,input.created_at,now())
    });
    const packetUpdates=[
      {target:'knowledge_document_packet',status:'stored',sourceType,sourceId,sourceTitle}
    ];
    const domainRoutes=['documents'];
    if(uploadedVia==='val_witnessing_session'){
      packetUpdates.push({target:'witnessing_context',status:'available',sourceType,sourceId,sourceTitle});
      domainRoutes.push('witnessing');
    }
    const record=await saveRecord({
      id:sourceRecordId(uuid,sc,sourceType,sourceId),
      tenantId:sc.tenantId,
      userId:sc.userId,
      sourceType,
      sourceId,
      sourceTitle,
      status:'processed',
      sourceReceiptJson:{
        sourceType,
        sourceId,
        sourceTitle,
        receivedAt:firstText(document.createdAt,document.created_at,input.createdAt,input.created_at,now()),
        uploadedVia,
        docType,
        documentCategory,
        mimeType:firstText(document.mimeType,document.mime_type,input.mimeType,input.mime_type),
        fileName:firstText(document.fileName,document.filename,input.fileName,input.filename,sourceTitle),
        characterCount:rawText.length,
        rawText
      },
      witnessObservationsJson:[{
        observer:'witness',
        observation:`VAL read "${sourceTitle}" and stored its extracted text as inspectable source evidence.`,
        evidence_refs:[sourceRef]
      }],
      executiveRelevanceJson:{
        document_read:true,
        witnessing_context_available:uploadedVia==='val_witnessing_session',
        recommendation_created:false
      },
      domainRoutesJson:domainRoutes,
      packetUpdatesJson:packetUpdates,
      reviewUpdatesJson:[],
      preparedWorkCandidatesJson:[],
      noActionReceiptJson:{},
      unknownsJson:[],
      metadataJson:{
        source:'knowledge_document_upload',
        uploadedVia,
        docType,
        documentCategory,
        documentRead:true,
        noExternalAction:true
      },
      createdAt:now(),
      updatedAt:now()
    });
    return {
      ok:true,
      sourceProcessingRecord:record,
      whatValDidReceipt:record.whatValDidReceipt,
      what_val_did_receipt:record.whatValDidReceipt,
      documentRead:true,
      witnessingContextAvailable:uploadedVia==='val_witnessing_session',
      no_external_action:true
    };
  }
  async function processRelationshipDocumentEmail(input={}){
    const sc=scope();
    const relationship=input.relationship||{};
    const admitted=relationshipAdmitted(relationship);
    const documents=documentsFromInput(input);
    const source=input.source||input.email||{};
    const sourceType=firstText(source.sourceType,source.source_type,source.provider,'email_message');
    const sourceId=firstText(source.sourceId,source.source_id,source.messageId,source.message_id,source.id,documents[0]?.sourceId,uuid('email'));
    const sourceTitle=firstText(source.subject,source.title,input.subject,'Relationship document email');
    const projectName=projectNameFromInput(input,relationship,documents);
    const record={
      id:sourceRecordId(uuid,sc,sourceType,sourceId),
      tenantId:sc.tenantId,
      userId:sc.userId,
      sourceType,
      sourceId,
      sourceTitle,
      status:'processed',
      sourceReceiptJson:{sourceType,sourceId,sourceTitle,receivedAt:firstText(source.receivedAt,source.createdAt,now()),relationship,documentCount:documents.length},
      witnessObservationsJson:documents.length?[{observer:'witness',observation:`${firstText(relationship.name,relationship.displayName,relationship.email,'A relationship')} sent ${documents.length} document${documents.length===1?'':'s'}.`,documents}]:[],
      executiveRelevanceJson:{relationship_sender_admitted:admitted,document_evidence_count:documents.length,project_suggestion_eligible:admitted&&documents.length>0},
      domainRoutesJson:documents.length?['documents','project_managers']:[],
      packetUpdatesJson:[],
      reviewUpdatesJson:[],
      preparedWorkCandidatesJson:[],
      noActionReceiptJson:{},
      unknownsJson:[],
      metadataJson:{source:'relationship_document_email',noExternalAction:true},
      createdAt:now(),
      updatedAt:now()
    };
    if(!admitted){
      record.status='no_action';
      record.noActionReceiptJson={reason:'Document sender is not an admitted relationship, so VAL will not suggest a project.',sourceType,sourceId};
      const saved=await saveRecord(record);
      return {ok:true,sourceProcessingRecord:saved,projectSuggestion:null,readyForYouItem:null,surfaceRegistrations:[],whatValDidReceipt:saved.whatValDidReceipt,what_val_did_receipt:saved.whatValDidReceipt,no_action_receipt:saved.noActionReceiptJson,no_external_action:true};
    }
    if(!documents.length){
      record.status='no_action';
      record.noActionReceiptJson={reason:'No document evidence was present, so VAL will not suggest a project.',sourceType,sourceId};
      const saved=await saveRecord(record);
      return {ok:true,sourceProcessingRecord:saved,projectSuggestion:null,readyForYouItem:null,surfaceRegistrations:[],whatValDidReceipt:saved.whatValDidReceipt,what_val_did_receipt:saved.whatValDidReceipt,no_action_receipt:saved.noActionReceiptJson,no_external_action:true};
    }
    const existing=(await currentProjects()).find(project=>projectLooksLike(project,input.projectId||stableKey(projectName),projectName));
    if(existing){
      record.noActionReceiptJson={reason:'A matching project already exists. VAL should link documents rather than suggest a new project.',projectId:existing.projectId||existing.id||existing.profileKey||'',sourceType,sourceId};
      const saved=await saveRecord(record);
      return {ok:true,sourceProcessingRecord:saved,existingProject:existing,projectSuggestion:null,readyForYouItem:null,surfaceRegistrations:[],whatValDidReceipt:saved.whatValDidReceipt,what_val_did_receipt:saved.whatValDidReceipt,no_external_action:true};
    }
    if(!reviewUpdatesService?.createRelationshipDocumentProjectSuggestion)throw new Error('Review update service does not support relationship document project suggestions.');
    const savedRecord=await saveRecord(record);
    const projectSuggestion=await reviewUpdatesService.createRelationshipDocumentProjectSuggestion({
      relationship,
      documents,
      source:{...source,sourceType,sourceId,sourceTitle},
      projectName,
      sourceProcessingRecordId:savedRecord.id,
      confidence:input.confidence||0.76
    });
    const update=projectSuggestion.update;
    const preparedArtifactId=stableKey(`artifact_suggested_project_${update.id}`);
    const readyForYouItemId=stableKey(`ready_project_suggestion_${update.id}`);
    const whatValDidReceipt=sourceProcessingWhatValDidReceipt({
      ...savedRecord,
      reviewUpdatesJson:[{id:update.id,targetType:update.targetType,updateType:update.updateType}],
      preparedWorkCandidatesJson:[{id:preparedArtifactId,artifactType:'suggested_project_review',reviewUpdateId:update.id}],
      packetUpdatesJson:[{target:'project_packet',status:'review_required',reviewUpdateId:update.id}],
      metadataJson:{...(savedRecord.metadataJson||{}),reviewUpdateId:update.id,preparedArtifactRecordId:preparedArtifactId,readyForYouItemId,surfaces:['project_managers','home_leverage']}
    });
    const preparedArtifact=await savePreparedArtifact({
      id:preparedArtifactId,
      tenantId:sc.tenantId,
      userId:sc.userId,
      sourceProcessingRecordId:savedRecord.id,
      artifactType:'suggested_project_review',
      status:'registered',
      title:update.title,
      summary:update.summary,
      payloadJson:update.proposedValueJson||{},
      sourceRefsJson:safeArray(update.sourceRefsJson),
      reviewUpdateId:update.id,
      metadataJson:{source:'source_processing_spine',whatValDidReceipt,sourceProcessingReceipt:whatValDidReceipt,noExternalAction:true},
      createdAt:now(),
      updatedAt:now()
    });
    const readyItem=await saveReadyItem(readyItemFromProjectSuggestion({update:{...update,tenantId:sc.tenantId,userId:sc.userId},sourceProcessingRecordId:savedRecord.id,preparedArtifactRecordId:preparedArtifact.id,readyForYouItemId,whatValDidReceipt}));
    const projectSurface=await saveSurfaceRegistration({
      id:stableKey(`surface_project_managers_${update.id}`),
      tenantId:sc.tenantId,
      userId:sc.userId,
      sourceProcessingRecordId:savedRecord.id,
      preparedArtifactRecordId:preparedArtifact.id,
      reviewUpdateId:update.id,
      readyForYouItemId:'',
      surface:'project_managers',
      surfaceTargetType:'review_update',
      surfaceTargetId:update.id,
      title:update.title,
      summary:update.summary,
      status:'visible',
      actionJson:{primary:'approve_create_project',secondary:'reject_not_project'},
      sourceRefsJson:safeArray(update.sourceRefsJson),
      metadataJson:{source:'source_processing_spine',ownedSurface:true,whatValDidReceipt,sourceProcessingReceipt:whatValDidReceipt,...surfaceMetadataFromProjectSuggestion(update)},
      createdAt:now(),
      updatedAt:now()
    });
    const leverageSurface=await saveSurfaceRegistration({
      id:stableKey(`surface_home_leverage_${readyItem.id}`),
      tenantId:sc.tenantId,
      userId:sc.userId,
      sourceProcessingRecordId:savedRecord.id,
      preparedArtifactRecordId:preparedArtifact.id,
      reviewUpdateId:update.id,
      readyForYouItemId:readyItem.id,
      surface:'home_leverage',
      surfaceTargetType:'ready_for_you_item',
      surfaceTargetId:readyItem.id,
      title:update.title,
      summary:update.summary,
      status:'visible',
      actionJson:{primary:'review_project_suggestion',reviewUpdateId:update.id},
      sourceRefsJson:safeArray(update.sourceRefsJson),
      metadataJson:{source:'source_processing_spine',mirrors:'project_managers',whatValDidReceipt,sourceProcessingReceipt:whatValDidReceipt,...surfaceMetadataFromProjectSuggestion(update)},
      createdAt:now(),
      updatedAt:now()
    });
    const finalRecord=await saveRecord({
      ...savedRecord,
      reviewUpdatesJson:[{id:update.id,targetType:update.targetType,updateType:update.updateType}],
      preparedWorkCandidatesJson:[{id:preparedArtifact.id,artifactType:preparedArtifact.artifactType,reviewUpdateId:update.id}],
      packetUpdatesJson:[{target:'project_packet',status:'review_required',reviewUpdateId:update.id}],
      metadataJson:{...(savedRecord.metadataJson||{}),reviewUpdateId:update.id,preparedArtifactRecordId:preparedArtifact.id,readyForYouItemId:readyItem.id,surfaceRegistrationIds:[projectSurface.id,leverageSurface.id],whatValDidReceipt,sourceProcessingReceipt:whatValDidReceipt}
    });
    return {ok:true,sourceProcessingRecord:finalRecord,projectSuggestion:update,preparedArtifactRecord:preparedArtifact,readyForYouItem:readyItem,surfaceRegistrations:[projectSurface,leverageSurface],whatValDidReceipt:finalRecord.whatValDidReceipt,what_val_did_receipt:finalRecord.whatValDidReceipt,no_external_action:true};
  }
  async function listSourceRecords({limit=50}={}){
    const lim=Math.max(1,Math.min(Number(limit)||50,200));
    if(hasPg()){
      const r=await dbQuery(`select * from source_processing_records where tenant_id=$1 and user_id=$2 order by created_at desc limit $3`,[tenantId(),userId(),lim]);
      return {ok:true,records:(r.rows||[]).map(rowToCamel).map(withWhatValDidReceipt)};
    }
    return {ok:true,records:store().sourceProcessingRecords.filter(r=>r.tenantId===tenantId()&&r.userId===userId()).slice(0,lim).map(withWhatValDidReceipt)};
  }
  async function listSurfaceRegistrations({surface='',status='visible',reviewStatus='',limit=50}={}){
    const lim=Math.max(1,Math.min(Number(limit)||50,200));
    const tenant=tenantId();
    const user=userId();
    if(hasPg()){
      const params=[tenant,user];
      const where=['sr.tenant_id=$1','sr.user_id=$2'];
      if(surface){params.push(surface);where.push(`sr.surface=$${params.length}`);}
      if(status){params.push(status);where.push(`sr.status=$${params.length}`);}
      if(reviewStatus){params.push(reviewStatus);where.push(`(sr.review_update_id is null or vu.status=$${params.length})`);}
      params.push(lim);
      const r=await dbQuery(
        `select sr.* from surface_registrations sr left join val_review_updates vu on vu.id=sr.review_update_id and vu.tenant_id=sr.tenant_id and vu.user_id=sr.user_id where ${where.join(' and ')} order by sr.created_at desc limit $${params.length}`,
        params
      );
      return {ok:true,surfaceRegistrations:(r.rows||[]).map(rowToCamel)};
    }
    const reviewRows=safeArray(store().valReviewUpdates);
    const reviewStatusFor=(id)=>reviewRows.find(r=>r.id===id&&r.tenantId===tenant&&r.userId===user)?.status
      || reviewRows.find(r=>r.id===id&&r.tenantId===tenant)?.status
      || '';
    const rows=store().surfaceRegistrations
      .filter(r=>r.tenantId===tenant&&r.userId===user)
      .filter(r=>!surface||r.surface===surface)
      .filter(r=>!status||r.status===status)
      .filter(r=>!reviewStatus||!r.reviewUpdateId||reviewStatusFor(r.reviewUpdateId)===reviewStatus)
      .slice(0,lim);
    return {ok:true,surfaceRegistrations:rows};
  }
  return {processKnowledgeDocument,processRelationshipDocumentEmail,listSourceRecords,listSurfaceRegistrations,saveRecord,savePreparedArtifact,saveSurfaceRegistration,sourceProcessingWhatValDidReceipt};
}

module.exports={createValSourceProcessingService,relationshipAdmitted,documentsFromInput,readyItemFromProjectSuggestion,surfaceMetadataFromProjectSuggestion,sourceProcessingWhatValDidReceipt};
