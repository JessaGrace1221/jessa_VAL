const {emailSeeds,normalizeCommitment}=require('./valCommitments');

function safeArray(value){return Array.isArray(value)?value:[];}
function compactText(value='',limit=1200){return String(value||'').replace(/\s+/g,' ').trim().slice(0,limit);}
function firstText(...values){
  for(const value of values){
    const text=compactText(value,1200);
    if(text)return text;
  }
  return '';
}
function normalized(value=''){
  return compactText(value,2000).toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
}
function uniqueMessages(context={}){
  const messages=safeArray(context.evidence_messages||context.evidenceMessages)
    .concat([context.current_message||context.currentMessage,context.latest_inbound||context.latestInbound,context.latest_outbound||context.latestOutbound])
    .filter(Boolean);
  return messages.filter((message,index,all)=>{
    const key=firstText(message.id,message.messageId,message.message_id,[message.direction,message.subject,message.bodyText,message.bodyPreview].join('|'));
    return all.findIndex(other=>firstText(other.id,other.messageId,other.message_id,[other.direction,other.subject,other.bodyText,other.bodyPreview].join('|'))===key)===index;
  });
}
function exactEmailEvidence(context={}){
  return uniqueMessages(context).map(message=>{
    const from=message.from||message.sender||{};
    const sender=firstText(from.name,from.email,'Unknown sender');
    const direction=firstText(message.direction,'unknown');
    const subject=firstText(message.subject,'(no subject)');
    const body=String(message.bodyText||message.body_text||message.bodyPreview||message.body_preview||message.snippet||'').trim();
    return [`[${direction}] ${sender}`,`Subject: ${subject}`,body].filter(Boolean).join('\n');
  }).filter(Boolean).join('\n\n---\n\n');
}
function projectEnvelope(rawText='',profiles=[]){
  const haystack=` ${normalized(rawText)} `;
  const matches=safeArray(profiles)
    .filter(profile=>String(profile.profileType||profile.profile_type||'').toLowerCase()==='project')
    .map(profile=>{
      const name=firstText(profile.name,profile.displayName,profile.display_name,profile.projectName,profile.project_name);
      const key=normalized(name);
      return {profile,name,key};
    })
    .filter(candidate=>candidate.key&&haystack.includes(` ${candidate.key} `))
    .sort((a,b)=>b.key.length-a.key.length);
  const match=matches[0];
  if(!match)return {};
  return {
    projectId:firstText(match.profile.id,match.profile.projectId,match.profile.project_id),
    projectName:match.name
  };
}
function relationshipEnvelope(context={},classification={}){
  const inbound=context.latest_inbound||context.latestInbound||context.current_message||context.currentMessage||{};
  const from=inbound.from||inbound.sender||{};
  const identity=classification.identity_resolution||classification.identityResolution||{};
  return {
    relationshipId:firstText(identity.crm_contact_id,identity.crmContactId,identity.contact_id,identity.contactId),
    relationshipName:firstText(from.name,from.email,identity.name,identity.email)
  };
}
function splitActionObject(value=''){
  const title=compactText(value,240);
  const match=title.match(/^([A-Za-z][A-Za-z-]*)\s+(.+)$/);
  return {
    actionText:match?.[1]||title,
    objectText:match?.[2]||title
  };
}
function ownershipFor(ownerType=''){
  if(ownerType==='user')return 'user';
  if(ownerType==='contact'||ownerType==='company')return 'other';
  if(ownerType==='val')return 'val';
  return 'unknown';
}
function classificationRow(context={},classification={}){
  return {
    id:classification.id,
    unifiedConversationId:context.conversationId||'',
    commitmentsJson:context.commitments||[],
    contextJson:{...context,classification},
    sourceRefsJson:classification.source_refs||classification.sourceRefs||context.source_refs||[],
    createdAt:classification.createdAt||new Date().toISOString()
  };
}

function createValCanonicalEmailIntake({
  processEvidenceSource,
  admitCanonicalWork,
  listProjectProfiles=async()=>[],
  logger=console
}={}){
  async function intakeClassification({context={},classification={},notify=true}={}){
    if(typeof processEvidenceSource!=='function')throw new Error('Canonical email intake requires source processing.');
    if(typeof admitCanonicalWork!=='function')throw new Error('Canonical email intake requires canonical work admission.');
    const sourceId=firstText(context.conversationId,context.threadId,classification.id);
    if(!sourceId)throw new Error('Canonical email intake requires a conversation or thread ID.');
    const messages=uniqueMessages(context);
    const sourceTitle=firstText(context.current_message?.subject,context.currentMessage?.subject,messages.at(-1)?.subject,context.thread_summary,'Email conversation');
    const rawText=exactEmailEvidence(context);
    if(!rawText)throw new Error('Canonical email intake requires readable email evidence.');
    const processed=await processEvidenceSource({
      sourceType:'email',
      sourceId,
      sourceTitle,
      rawText,
      createdAt:firstText(messages[0]?.receivedAt,messages[0]?.sentAt),
      witnessObservation:`VAL read "${sourceTitle}" as email conversation evidence.`,
      executiveRelevance:{
        email_read:true,
        priority_level:classification.priority_level||classification.priorityLevel||'unknown',
        executive_meaning:classification.executive_meaning||classification.executiveMeaning||'',
        canonical_work_admission_pending:true
      },
      domainRoutes:['executive_inbox','board_of_observers','canonical_work'],
      metadata:{
        source:'executive_inbox_classification',
        classificationId:classification.id||'',
        conversationId:context.conversationId||'',
        threadId:context.threadId||'',
        provider:context.provider||''
      },
      notify
    });
    const profiles=await listProjectProfiles({limit:200}).catch(()=>[]);
    const project=projectEnvelope(rawText,profiles);
    const relationship=relationshipEnvelope(context,classification);
    const seeds=emailSeeds([classificationRow(context,classification)]);
    const canonicalWorkItems=[];
    const rejectedAsNoise=(classification.priority_level||classification.priorityLevel)==='suppressed'
      || classification.executive_inbox_admission?.admitted===false;
    for(const seed of seeds){
      const commitment=normalizeCommitment(seed,[]);
      const shape=splitActionObject(commitment.title||commitment.evidence_quote);
      const result=await admitCanonicalWork({
        sourceProcessingRecordId:processed.sourceProcessingRecord?.id||'',
        sourceType:'email',
        sourceId,
        sourceFingerprint:processed.sourceProcessingRecord?.sourceFingerprint||'',
        workType:'commitment',
        ownership:ownershipFor(commitment.owner_type),
        ownerName:commitment.owner_name,
        ...shape,
        outcomeText:commitment.description||commitment.title,
        title:commitment.title,
        summary:commitment.description,
        exactSourceQuote:commitment.evidence_quote,
        sourceRefs:[{
          sourceType:'email',
          sourceId,
          quoteOrSummary:commitment.evidence_quote,
          confidence:commitment.confidence_score||classification.confidence||0.64,
          createdAt:commitment.created_at
        }],
        ...project,
        ...relationship,
        dueAt:null,
        dueBasis:{sourceHint:seed.due_hint||'',explicitDate:false},
        confidence:commitment.confidence_score||classification.confidence||0.64,
        isNoise:rejectedAsNoise,
        metadata:{
          classificationId:classification.id||'',
          provider:context.provider||'',
          messageId:seed.messageId||'',
          approvalPolicy:classification.approval_policy||classification.approvalPolicy||'approval_required',
          noExternalAction:true
        },
        notify
      }).catch(error=>{
        logger.warn?.('[val-canonical-email] work admission failed:',error.message);
        return null;
      });
      if(result?.workItem)canonicalWorkItems.push(result.workItem);
    }
    return {
      ok:true,
      sourceProcessingRecord:processed.sourceProcessingRecord,
      sourcePacket:processed.sourcePacket||null,
      sourcePackets:safeArray(processed.sourcePackets),
      canonicalWorkItems,
      deduplicated:processed.deduplicated,
      no_external_action:true
    };
  }
  return {intakeClassification};
}

module.exports={
  createValCanonicalEmailIntake,
  exactEmailEvidence,
  projectEnvelope,
  relationshipEnvelope,
  ownershipFor
};
