function safeArray(value){return Array.isArray(value)?value:[];}
function jsonValue(value,fallback){if(value==null)return fallback;if(typeof value==='string'){try{return JSON.parse(value);}catch(_){return fallback;}}return value;}
function compactText(value='',limit=600){return String(value||'').replace(/\s+/g,' ').trim().slice(0,limit);}
function stableKey(value=''){return String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'').slice(0,180)||'document';}
const {documentLooksLikeCalendarInvite}=require('./valDocumentEvidenceFilters');

const DOCUMENT_KIND_RE=/document|proposal|agreement|sow|scope|copy|html_page|report|brief|spec|documentation|contract|file|attachment|google_doc|knowledge_document|manuscript|chapter/i;

function firstText(...values){
  for(const value of values){
    const text=String(value||'').trim();
    if(text)return text;
  }
  return '';
}

function normalizeLinks(input={}){
  const relationshipLinks=safeArray(input.relationshipLinks||input.relationship_links||input.relationships).map(link=>({
    id:firstText(link.id,link.contactId,link.contact_id,link.crm_contact_id,link.email,link.name),
    name:firstText(link.name,link.displayName,link.email),
    email:firstText(link.email)
  })).filter(link=>link.id||link.name||link.email);
  const projectLinks=safeArray(input.projectLinks||input.project_links||input.projects).map(link=>({
    id:firstText(link.id,link.projectId,link.project_id,link.profileKey,link.name),
    name:firstText(link.name,link.projectName,link.displayName)
  })).filter(link=>link.id||link.name);
  const relationshipName=firstText(input.relationship,input.relationshipName,input.recipient,input.contactName,relationshipLinks[0]?.name,relationshipLinks[0]?.email);
  const projectName=firstText(input.project,input.projectName,projectLinks[0]?.name);
  return {relationshipLinks,projectLinks,relationshipName,projectName};
}

function documentRecord(input={}){
  const links=normalizeLinks(input);
  const title=firstText(input.title,input.name,input.fileName,input.subject,'Untitled document');
  const type=firstText(input.type,input.kind,input.documentType,input.docType,'document');
  const body=String(firstText(input.body,input.text,input.rawText,input.preview,input.summary)||'');
  const sourceType=firstText(input.sourceType,input.source_type,input.source,input.origin,'val_document');
  return {
    id:firstText(input.id,stableKey([sourceType,title,input.sourceId,input.url].join(':'))),
    title,
    type,
    status:firstText(input.status,'reference'),
    source:firstText(input.sourceLabel,input.source,sourceType),
    sourceType,
    sourceId:firstText(input.sourceId,input.source_id,input.id),
    relationship:links.relationshipName,
    project:links.projectName,
    relationshipLinks:links.relationshipLinks,
    projectLinks:links.projectLinks,
    summary:compactText(firstText(input.summary,body,title),500),
    bodyPreview:compactText(body,2200),
    body,
    sourceUrl:firstText(input.sourceUrl,input.url,input.webViewLink),
    recipientEmail:firstText(input.recipientEmail,input.to,input.email),
    createdAt:firstText(input.createdAt,input.created_at),
    updatedAt:firstText(input.updatedAt,input.updated_at,input.modifiedTime),
    referenceUse:firstText(input.referenceUse,links.projectName||links.relationshipName?`Use as reference evidence for ${[links.relationshipName,links.projectName].filter(Boolean).join(' and ')}.`:'Use as relationship/project reference evidence when context is linked.'),
    needs:firstText(input.needs,input.whatOnlyUserCanDo,input.whatUserNeedsToDo,'Review before updating, sending, publishing, or using externally.'),
    sourceRefs:safeArray(input.sourceRefs||input.source_refs),
    noExternalAction:input.noExternalAction!==false,
    raw:input.raw||null
  };
}

function draftDocuments(drafts=[]){
  return safeArray(drafts).filter(draft=>{
    const source=draft.sourceContext||draft.source_context_json||{};
    return DOCUMENT_KIND_RE.test([draft.draftType,draft.subject,source.source,source.documentType,source.docType].join(' '));
  }).map(draft=>{
    const source=draft.sourceContext||draft.source_context_json||{};
    const recipients=safeArray(source.recipients);
    const firstRecipient=recipients[0]||{};
    return documentRecord({
      id:`draft:${draft.id}`,
      sourceId:draft.id,
      title:draft.subject||'VAL document draft',
      type:draft.draftType||source.documentType||'draft',
      status:draft.status||'draft',
      source:'VAL-created draft',
      sourceType:'val_draft',
      relationship:firstText(source.recipientName,source.recipient,firstRecipient.name,firstRecipient.email),
      project:firstText(source.projectName,source.project),
      recipientEmail:firstText(source.recipientEmail,source.to,firstRecipient.email),
      body:draft.body||'',
      createdAt:draft.createdAt,
      updatedAt:draft.updatedAt,
      referenceUse:'Use this draft as prepared-work evidence for the linked relationship or project.',
      needs:'Review before sending or writing to an external document system.',
      raw:draft
    });
  });
}

function preparedArtifactDocuments(runs=[]){
  return safeArray(runs).flatMap(run=>{
    const candidates=safeArray(jsonValue(run.readyForYouCandidatesJson||run.ready_for_you_candidates_json,[]));
    return candidates.filter(candidate=>{
      const artifact=candidate.prepared_artifact||candidate.preparedArtifact||{};
      return candidate.category==='prepared_work'&&DOCUMENT_KIND_RE.test([candidate.type,artifact.kind,artifact.title].join(' '));
    }).map(candidate=>{
      const artifact=candidate.prepared_artifact||candidate.preparedArtifact||{};
      const linked=artifact.linked_context||candidate.linked_context||{};
      return documentRecord({
        id:`prepared:${candidate.id}`,
        sourceId:candidate.id,
        title:candidate.title||artifact.title,
        type:artifact.kind||candidate.type||'prepared_work',
        status:candidate.completion_status||artifact.completion_status||'ready_for_review',
        source:'Transcript prepared work',
        sourceType:'transcript_prepared_work',
        relationshipLinks:linked.relationships||linked.linked_people||[],
        projectLinks:linked.project?[linked.project]:safeArray(linked.projects),
        project:linked.project?.name||linked.projectName,
        body:artifact.html||artifact.body||safeArray(artifact.sections).join('\n')||candidate.what_val_did||candidate.summary||'',
        summary:candidate.summary,
        createdAt:run.createdAt||run.created_at,
        updatedAt:run.updatedAt||run.updated_at,
        referenceUse:'Use as source evidence for transcript-created prepared work and linked project/relationship follow-through.',
        needs:candidate.what_only_user_can_do||safeArray(candidate.remaining_context_needed||artifact.remaining_context_needed).join('; '),
        sourceRefs:candidate.source_refs||run.evidenceRefsJson||[],
        raw:candidate
      });
    });
  });
}

function memoryDocuments(memoryItems=[]){
  return safeArray(memoryItems).filter(item=>{
    const meta=jsonValue(item.metadata||item.metadataJson||item.metadata_json,{});
    if(documentLooksLikeCalendarInvite({...item,...meta}))return false;
    return DOCUMENT_KIND_RE.test([item.kind,item.type,item.title,item.summary,meta.source,meta.docType,meta.uploadedVia,meta.fileName].join(' '));
  }).map(item=>{
    const meta=jsonValue(item.metadata||item.metadataJson||item.metadata_json,{});
    return documentRecord({
      id:`memory:${item.id}`,
      sourceId:item.id,
      title:firstText(meta.title,meta.fileName,item.title,item.summary,'Uploaded document'),
      type:firstText(meta.docType,item.kind,item.type,'document'),
      status:'reference',
      source:firstText(meta.source,meta.uploadedVia,'VAL memory'),
      sourceType:firstText(meta.source,meta.uploadedVia,'val_memory_document'),
      project:firstText(meta.projectName,meta.project),
      relationship:firstText(meta.relationshipName,meta.contactName,meta.recipient),
      sourceUrl:firstText(meta.url,meta.sourceUrl),
      body:firstText(item.rawText,item.raw_text,item.text,item.summary),
      summary:item.summary,
      createdAt:item.createdAt||item.created_at,
      updatedAt:item.updatedAt||item.updated_at,
      referenceUse:'Use this stored document as source material for relationship/project judgment.',
      needs:'Link missing relationship or project context if not already resolved.',
      raw:item
    });
  });
}

function projectProfileDocuments(projectProfiles=[]){
  return safeArray(projectProfiles).flatMap(profile=>{
    const meta=jsonValue(profile.metadata||profile.metadataJson||profile.metadata_json,{});
    const projectName=profile.displayName||profile.name||meta.projectName||meta.project||'Project';
    const projectId=profile.projectId||profile.profileKey||profile.id||stableKey(projectName);
    const intake=meta.intake||{};
    const rows=[];
    for(const file of safeArray(meta.uploadedFiles)){
      if(documentLooksLikeCalendarInvite(file))continue;
      rows.push(documentRecord({
        id:`project-file:${projectId}:${file.id||file.fileName}`,
        sourceId:file.id||file.fileName,
        title:file.fileName||'Project source file',
        type:file.docType||file.mimeType||'uploaded_file',
        status:'reference',
        source:'Project uploaded file',
        sourceType:file.source||'hearth_project_source_upload',
        project:projectName,
        projectLinks:[{id:projectId,name:projectName}],
        body:file.text||`${file.fileName||'Project file'} · ${file.chars||0} readable characters`,
        createdAt:profile.createdAt||profile.created_at,
        updatedAt:profile.updatedAt||profile.updated_at,
        referenceUse:'Use this uploaded project file as required source evidence for project judgment.',
        needs:'Review before parsing obligations, changing project judgment, or creating tasks.',
        raw:file
      }));
    }
    if(intake.documents){
      rows.push(documentRecord({
        id:`project-doc-notes:${projectId}`,
        sourceId:projectId,
        title:`Document notes for ${projectName}`,
        type:'project_document_notes',
        status:'reference',
        source:'Project intake',
        sourceType:'hearth_project_intake',
        project:projectName,
        projectLinks:[{id:projectId,name:projectName}],
        body:intake.documents,
        createdAt:profile.createdAt||profile.created_at,
        updatedAt:profile.updatedAt||profile.updated_at,
        referenceUse:'Use these project document notes when briefing or judging the project.',
        needs:'Attach source files or external document links when available.',
        raw:intake
      }));
    }
    return rows;
  });
}

function emailAttachmentDocuments(messages=[]){
  return safeArray(messages).flatMap(message=>{
    const payload=jsonValue(message.payloadJson||message.payload_json||message.payload,{});
    const raw=jsonValue(message.rawJson||message.raw_json||message.raw,{});
    const rawPayload=jsonValue(raw.payloadJson||raw.payload_json||raw.payload,{});
    const attachments=safeArray(message.attachments)
      .concat(safeArray(message.attachmentsJson||message.attachments_json))
      .concat(safeArray(payload.attachments))
      .concat(safeArray(raw.attachments))
      .concat(safeArray(raw.attachmentsJson||raw.attachments_json))
      .concat(safeArray(rawPayload.attachments));
    const seen=new Set();
    return attachments.filter(attachment=>{
      if(documentLooksLikeCalendarInvite(attachment))return false;
      const key=firstText(attachment.id,attachment.attachmentId,attachment.filename,attachment.name,attachment.title);
      if(!key||seen.has(key))return false;
      seen.add(key);
      return true;
    }).map((attachment,index)=>documentRecord({
      id:`email-attachment:${message.messageId||message.message_id||message.id}:${attachment.id||attachment.filename||index}`,
      sourceId:message.messageId||message.message_id||message.id,
      title:attachment.filename||attachment.name||'Email attachment',
      type:attachment.mimeType||attachment.contentType||'email_attachment',
      status:'needs_review',
      source:'Email attachment',
      sourceType:'email_attachment',
      relationship:firstText(message.fromName,message.from?.name,message.senderJson?.name,message.sender_json?.name,message.fromEmail,message.from?.email,message.senderJson?.email,message.sender_json?.email),
      sourceUrl:attachment.url||attachment.webUrl||message.webLink||message.web_link||'',
      body:firstText(attachment.text,attachment.summary,message.subject),
      createdAt:message.receivedAt||message.createdAt||message.created_at,
      updatedAt:message.updatedAt||message.updated_at,
      referenceUse:'Use as relationship/project evidence only after attachment content and context are reviewed.',
      needs:'Review attachment before relying on it; do not send, forward, or extract obligations silently.',
      raw:attachment
    }));
  });
}

function googleDocDocuments(files=[]){
  return safeArray(files).map(file=>documentRecord({
    id:`google-doc:${file.id}`,
    sourceId:file.id,
    title:file.name||file.title||'Google Doc',
    type:'google_doc',
    status:'reference',
    source:'Google Docs',
    sourceType:'google_docs',
    sourceUrl:file.webViewLink||file.url||'',
    body:file.text||file.name||'Google Docs metadata result.',
    updatedAt:file.modifiedTime||file.updatedAt,
    referenceUse:'Use as relationship/project evidence after linked context is confirmed.',
    needs:'Read/update/send actions require Google permissions and explicit approval.',
    raw:file
  }));
}

function sourceProcessingRecordDocuments(records=[]){
  return safeArray(records).flatMap(record=>{
    const sourceReceipt=jsonValue(record.sourceReceiptJson||record.source_receipt_json,{});
    const witnessObservations=safeArray(jsonValue(record.witnessObservationsJson||record.witness_observations_json,[]));
    const metadata=jsonValue(record.metadataJson||record.metadata_json,{});
    const relationship=sourceReceipt.relationship||metadata.relationship||{};
    const relationshipName=firstText(relationship.name,relationship.displayName,relationship.email);
    const sourceType=firstText(record.sourceType,record.source_type,sourceReceipt.sourceType,sourceReceipt.source_type,'source_processing_record');
    const sourceId=firstText(record.sourceId,record.source_id,sourceReceipt.sourceId,sourceReceipt.source_id,record.id);
    const sourceTitle=firstText(record.sourceTitle,record.source_title,sourceReceipt.sourceTitle,sourceReceipt.source_title,'Relationship document email');
    const status=firstText(record.status,'processed');
    const projectName=firstText(metadata.projectName,metadata.project_name,metadata.project?.name,metadata.whatValDidReceipt?.source?.projectName);
    const documents=witnessObservations.flatMap(obs=>safeArray(obs.documents))
      .concat(safeArray(sourceReceipt.documents))
      .concat(safeArray(metadata.documents));
    const seen=new Set();
    return documents.filter(doc=>{
      if(documentLooksLikeCalendarInvite(doc))return false;
      const key=firstText(doc.sourceId,doc.source_id,doc.id,doc.title,doc.filename,doc.name);
      if(!key||seen.has(key))return false;
      seen.add(key);return true;
    }).map((doc,index)=>documentRecord({
      id:`source-processing:${record.id}:${firstText(doc.sourceId,doc.source_id,doc.id,doc.title,index)}`,
      sourceId:firstText(doc.sourceId,doc.source_id,doc.id,sourceId),
      title:firstText(doc.title,doc.filename,doc.fileName,doc.name,sourceTitle),
      type:firstText(doc.type,doc.kind,doc.mimeType,doc.contentType,'source_processing_document'),
      status:status==='no_action'?'source_only':'needs_review',
      source:'Source-processing document',
      sourceType:firstText(doc.sourceType,doc.source_type,'source_processing_document'),
      relationship:relationshipName,
      relationshipLinks:relationshipName?[{
        id:firstText(relationship.id,relationship.profileKey,relationship.email,relationshipName),
        name:relationshipName,
        email:firstText(relationship.email)
      }]:[],
      project:projectName,
      projectLinks:projectName?[{id:stableKey(projectName),name:projectName}]:[],
      sourceUrl:firstText(doc.sourceUrl,doc.url,doc.webUrl,doc.webViewLink,sourceReceipt.webLink,sourceReceipt.sourceUrl),
      body:firstText(doc.text,doc.rawText,doc.summary,sourceTitle),
      summary:firstText(doc.summary,sourceTitle),
      createdAt:firstText(record.createdAt,record.created_at,sourceReceipt.receivedAt,sourceReceipt.received_at),
      updatedAt:firstText(record.updatedAt,record.updated_at,record.createdAt,record.created_at),
      referenceUse:'Use this document as source evidence for the linked relationship, project suggestion, or project dossier.',
      needs:'Review the document context before approving a project, extracting obligations, or taking external action.',
      sourceRefs:[{source_type:sourceType,source_id:sourceId,quote_or_summary:sourceTitle,confidence:0.82}],
      raw:{sourceProcessingRecordId:record.id,document:doc,whatValDidReceipt:metadata.whatValDidReceipt||metadata.sourceProcessingReceipt||null}
    }));
  });
}

function dedupeDocuments(rows=[]){
  const byId=new Map();
  for(const row of rows){
    if(!row||!row.id)continue;
    if(documentLooksLikeCalendarInvite(row))continue;
    if(!byId.has(row.id))byId.set(row.id,row);
  }
  return [...byId.values()].sort((a,b)=>String(b.updatedAt||b.createdAt||'').localeCompare(String(a.updatedAt||a.createdAt||''))||a.title.localeCompare(b.title));
}

function documentMatches(doc={},filters={}){
  const q=String(filters.q||'').toLowerCase().trim();
  const relationship=String(filters.relationship||'').toLowerCase().trim();
  const project=String(filters.project||'').toLowerCase().trim();
  if(relationship&&!String([doc.relationship,...safeArray(doc.relationshipLinks).map(r=>`${r.name} ${r.email} ${r.id}`)].join(' ')).toLowerCase().includes(relationship))return false;
  if(project&&!String([doc.project,...safeArray(doc.projectLinks).map(p=>`${p.name} ${p.id}`)].join(' ')).toLowerCase().includes(project))return false;
  if(!q)return true;
  return [doc.title,doc.type,doc.status,doc.source,doc.relationship,doc.project,doc.summary,doc.bodyPreview].join(' ').toLowerCase().includes(q);
}

function summaryFor(documents=[]){
  const active=safeArray(documents);
  return {
    total:active.length,
    relationships:new Set(active.map(d=>d.relationship).filter(Boolean)).size,
    projects:new Set(active.map(d=>d.project).filter(Boolean)).size,
    needs_context:active.filter(d=>!d.relationship&&!d.project).length,
    sendable:active.filter(d=>d.recipientEmail&&d.body).length
  };
}

function createValDocumentsService({
  dbQuery=null,
  hasPg=()=>false,
  getStore=()=>({}),
  listDrafts=null,
  listTranscriptRuns=null,
  listMemoryItems=null,
  listProjectProfiles=null,
  searchGoogleDocs=null,
  tenantId=()=>'default',
  userId=()=>'default'
}={}){
  function store(){
    const s=getStore()||{};
    for(const key of ['drafts','transcriptIntelligenceRuns','memoryItems','emailMessages','relationshipProfiles','sourceProcessingRecords'])if(!Array.isArray(s[key]))s[key]=[];
    return s;
  }
  async function loadDrafts(){
    if(typeof listDrafts==='function')return listDrafts('').catch(()=>[]);
    return store().drafts.filter(d=>(!d.tenantId||d.tenantId===tenantId())&&(!d.userId||d.userId===userId()));
  }
  async function loadRuns(){
    if(typeof listTranscriptRuns==='function')return listTranscriptRuns().catch(()=>[]);
    return store().transcriptIntelligenceRuns.filter(r=>(!r.tenantId||r.tenantId===tenantId())&&(!r.userId||r.userId===userId()));
  }
  async function loadMemory(){
    if(typeof listMemoryItems==='function')return listMemoryItems().catch(()=>[]);
    return store().memoryItems.filter(r=>(!r.tenantId||r.tenantId===tenantId())&&(!r.userId||r.userId===userId()));
  }
  async function loadProjects(){
    if(typeof listProjectProfiles==='function')return listProjectProfiles({limit:200}).catch(()=>[]);
    return store().relationshipProfiles.filter(p=>p.profileType==='project'||p.profile_type==='project');
  }
  async function loadSourceProcessingRecords(unknowns=[]){
    if(hasPg()&&typeof dbQuery==='function'){
      const result=await dbQuery('select * from source_processing_records where tenant_id=$1 and user_id=$2 order by created_at desc limit 200',[tenantId(),userId()]).catch(error=>{
        unknowns.push({source:'source_processing_records',scope:'current_user',reason:error.message});
        return {rows:[]};
      });
      if((result.rows||[]).length)return result.rows||[];
      const tenantResult=await dbQuery('select * from source_processing_records where tenant_id=$1 order by created_at desc limit 200',[tenantId()]).catch(error=>{
        unknowns.push({source:'source_processing_records',scope:'tenant',reason:error.message});
        return {rows:[]};
      });
      return tenantResult.rows||[];
    }
    return store().sourceProcessingRecords.filter(r=>(!r.tenantId||r.tenantId===tenantId())&&(!r.userId||r.userId===userId()));
  }
  async function loadEmailMessages(unknowns=[]){
    if(hasPg()&&typeof dbQuery==='function'){
      const sql = `select id, provider, message_id, thread_id, sender_json, subject, body_preview, snippet, has_attachments, web_link, received_at, sent_at, raw_json, created_at, updated_at
           from email_messages
          where tenant_id=$1
          order by coalesce(received_at,sent_at,created_at) desc
          limit 200`;
      const mapRow = row => ({
        id:row.id,
        provider:row.provider,
        messageId:row.message_id,
        threadId:row.thread_id,
        senderJson:jsonValue(row.sender_json,{}),
        subject:row.subject||'',
        bodyPreview:row.body_preview||row.snippet||'',
        hasAttachments:!!row.has_attachments,
        webLink:row.web_link||'',
        receivedAt:row.received_at?.toISOString?.()||row.received_at||'',
        sentAt:row.sent_at?.toISOString?.()||row.sent_at||'',
        rawJson:jsonValue(row.raw_json,{})
      });
      const result=await dbQuery(
        `select id, provider, message_id, thread_id, sender_json, subject, body_preview, snippet, has_attachments, web_link, received_at, sent_at, raw_json, created_at, updated_at
           from email_messages
          where tenant_id=$1 and user_id=$2
          order by coalesce(received_at,sent_at,created_at) desc
          limit 200`,
        [tenantId(),userId()]
      ).catch(error=>{
        unknowns.push({source:'email_messages',scope:'current_user',reason:error.message});
        return {rows:[]};
      });
      if((result.rows||[]).length)return (result.rows||[]).map(mapRow);
      const tenantResult=await dbQuery(sql,[tenantId()]).catch(error=>{
        unknowns.push({source:'email_messages',scope:'tenant',reason:error.message});
        return {rows:[]};
      });
      return (tenantResult.rows||[]).map(mapRow);
    }
    return store().emailMessages.filter(r=>(!r.tenantId||r.tenantId===tenantId())&&(!r.userId||r.userId===userId()));
  }
  async function list({q='',relationship='',project='',limit=120,includeGoogle=false}={}){
    const unknowns=[];
    const [drafts,runs,memory,projects,sourceProcessingRecords,emailMessages] = await Promise.all([loadDrafts(),loadRuns(),loadMemory(),loadProjects(),loadSourceProcessingRecords(unknowns),loadEmailMessages(unknowns)]);
    let google=[];
    if(includeGoogle&&typeof searchGoogleDocs==='function'&&(q||relationship||project)){
      try{google=await searchGoogleDocs(q||relationship||project,8);}catch(e){unknowns.push({source:'google_docs',reason:e.message});}
    }else if(includeGoogle){
      unknowns.push({source:'google_docs',reason:'Search query required before Google Docs metadata lookup.'});
    }
    const rows=dedupeDocuments(
      draftDocuments(drafts)
        .concat(preparedArtifactDocuments(runs))
        .concat(memoryDocuments(memory))
        .concat(projectProfileDocuments(projects))
        .concat(emailAttachmentDocuments(emailMessages))
        .concat(sourceProcessingRecordDocuments(sourceProcessingRecords))
        .concat(googleDocDocuments(google))
    );
    const filtered=rows.filter(doc=>documentMatches(doc,{q,relationship,project}));
    const capped=filtered.slice(0,Math.max(1,Math.min(Number(limit)||120,240)));
    return {ok:true,documents:capped,summary:summaryFor(filtered),count:capped.length,totalMatches:filtered.length,source:'val_documents_index',sourceCounts:{drafts:drafts.length,runs:runs.length,memory:memory.length,projects:projects.length,sourceProcessingRecords:sourceProcessingRecords.length,emailMessages:emailMessages.length,google:google.length},unknowns,empty:capped.length===0};
  }
  async function get(id){
    return (await list({limit:240})).documents.find(doc=>String(doc.id)===String(id))||null;
  }
  async function referenceFor({relationship='',project='',limit=12}={}){
    const result=await list({relationship,project,limit});
    return {...result,referenceRule:'VAL must use linked documents as source evidence for relationship and project judgment.'};
  }
  return {list,get,referenceFor,documentRecord,draftDocuments,preparedArtifactDocuments,memoryDocuments,projectProfileDocuments,emailAttachmentDocuments,sourceProcessingRecordDocuments};
}

module.exports={createValDocumentsService,documentRecord,draftDocuments,preparedArtifactDocuments,memoryDocuments,projectProfileDocuments,emailAttachmentDocuments,sourceProcessingRecordDocuments,documentMatches,summaryFor,documentLooksLikeCalendarInvite};
