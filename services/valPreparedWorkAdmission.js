function safeArray(value){return Array.isArray(value)?value:[];}
function compactText(value,limit=900){return String(value||'').replace(/\s+/g,' ').trim().slice(0,limit);}
function validEmail(value=''){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value||'').trim());}
function validPhone(value=''){return /^\+[1-9]\d{7,14}$/.test(String(value||'').replace(/[^\d+]/g,''));}
function normalizedName(value=''){
  return compactText(value,120)
    .replace(/\b(today|tomorrow|next week|this week|on (?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)|at \d.*)$/i,'')
    .replace(/[^a-z0-9]+/gi,' ')
    .trim()
    .toLowerCase();
}
function normalizePerson(person={}){
  const email=String(person.email||person.address||person.contactEmail||'').trim().toLowerCase();
  const phone=String(person.phone||person.contactPhone||'').replace(/[^\d+]/g,'');
  const cleanEmail=validEmail(email)?email:'';
  const cleanPhone=validPhone(phone)?phone:'';
  return {
    name:compactText(person.name||person.displayName||person.contactName||'',120),
    contactId:String(person.contactId||person.crm_contact_id||person.crmContactId||person.id||(cleanEmail?`email:${cleanEmail}`:'')||(cleanPhone?`phone:${cleanPhone}`:'')).trim(),
    email:cleanEmail,
    phone:cleanPhone,
    role:String(person.role||'').trim()
  };
}
function artifactRequiresContact(kind=''){
  return /(?:^|_)(email|introduction|proposal|invoice|agreement|calendar_invite)(?:_|$)/i.test(String(kind||''));
}
function artifactRequiresTwoPeople(kind=''){
  return /introduction_email/i.test(String(kind||''));
}
function artifactRequiresEmail(kind=''){
  return /email|introduction|proposal|invoice|agreement|calendar_invite/i.test(String(kind||''));
}
function artifactRequiresPhone(kind=''){
  return /sms|text_message/i.test(String(kind||''));
}
function isContactSharingWork(text=''){
  return /\b(contact (?:information|info|details)|email address|phone number|number|introduc(?:e|tion)|connect)\b/i.test(String(text||''));
}
function consentConfirmed(input={},text=''){
  if(input.consentConfirmed===true||input.consent_confirmed===true)return true;
  return /\b(consent(?:ed)?|approved (?:the )?(?:intro|introduction|sharing)|permission to share|okay to share|ok to share|asked me to introduce|wants? (?:an? )?introduction)\b/i.test(String(text||''));
}
function resolveRecipients({kind='',target='',people=[]}={}){
  const normalized=safeArray(people).map(normalizePerson).filter(person=>person.name||person.email||person.phone||person.contactId);
  if(/meeting_overview_email/i.test(kind))return normalized.filter(person=>person.email);
  if(artifactRequiresTwoPeople(kind))return normalized.slice(0,2);
  const targetEmail=validEmail(target)?String(target).trim().toLowerCase():'';
  const targetName=normalizedName(target);
  const exact=normalized.find(person=>
    (targetEmail&&person.email===targetEmail)
    ||(targetName&&normalizedName(person.name)===targetName)
    ||(targetName&&normalizedName(person.name)&&targetName.startsWith(normalizedName(person.name)))
  );
  if(exact)return [exact];
  if(normalized.length===1)return normalized;
  return [];
}
function sourceBrief({record={},sourceRefs=[],instruction={}}={}){
  const refs=safeArray(instruction.source_refs||instruction.sourceRefs).concat(safeArray(sourceRefs));
  const first=refs.find(ref=>compactText(ref.quote_or_summary||ref.quoteOrSummary||ref.summary||ref.quote,'').length)
    ||{};
  return {
    sourceType:String(first.source_type||first.sourceType||record.source||'').trim(),
    sourceId:String(first.source_id||first.sourceId||record.id||record.transcriptId||record.transcript_id||'').trim(),
    sourceDate:first.created_at||first.createdAt||record.createdAt||record.created_at||'',
    sourceExcerpt:compactText(first.quote_or_summary||first.quoteOrSummary||first.summary||first.quote||instruction.authorization_quote||instruction.instruction||'',900)
  };
}
function buildPreparedWorkBrief({kind='',instruction={},record={},linkage={},sourceRefs=[],artifact={}}={}){
  const projectNames=safeArray(linkage.linked_projects||linkage.linkedProjects).map(project=>normalizedName(project.name||project.title||project.projectName)).filter(Boolean);
  const people=safeArray(linkage.linked_people||linkage.linkedPeople)
    .concat(safeArray(artifact.recipients))
    .concat(safeArray(artifact.attendees))
    .filter(person=>{
      const name=normalizedName(person?.name||person?.displayName||person?.contactName||'');
      if(name&&projectNames.includes(name))return false;
      return !/^(sales system|pipeline|project|transcript|document|voice|user|task|calendar|email)$/i.test(name);
    })
    .filter((person,index,rows)=>{
      const normalized=normalizePerson(person);
      const key=normalized.contactId||normalized.email||normalized.phone||normalizedName(normalized.name);
      return key&&rows.findIndex(candidate=>{
        const other=normalizePerson(candidate);
        return (other.contactId||other.email||other.phone||normalizedName(other.name))===key;
      })===index;
    });
  const target=instruction.target_person_or_record||artifact.target||artifact.recipientName||artifact.recipient_email||'';
  const recipients=resolveRecipients({kind,target,people});
  const source=sourceBrief({record,sourceRefs,instruction});
  const instructionText=compactText(instruction.instruction||artifact.instruction||artifact.body||'',1400);
  const requiresConsentCheck=artifactRequiresTwoPeople(kind)||isContactSharingWork(instructionText+' '+source.sourceExcerpt);
  const requiredContent=[
    instructionText,
    source.sourceExcerpt,
    ...safeArray(instruction.required_content||instruction.requiredContent),
    ...safeArray(artifact.requiredContent)
  ].map(value=>compactText(value,700)).filter(Boolean);
  return {
    workType:kind,
    intendedAction:String(instruction.requested_action||artifact.intendedAction||kind||'').trim(),
    recipientName:recipients.map(person=>person.name).filter(Boolean).join(', '),
    recipientId:recipients.map(person=>person.contactId).filter(Boolean).join(', '),
    recipientAddress:recipients.map(person=>person.email||person.phone).filter(Boolean).join(', '),
    recipients,
    subjectPurpose:compactText(instruction.subject_purpose||instruction.subjectPurpose||instructionText||source.sourceExcerpt,220),
    ...source,
    peopleInvolved:safeArray(people).map(normalizePerson).filter(person=>person.name||person.email||person.phone||person.contactId),
    relationshipRoles:recipients.map(person=>({name:person.name||person.email||person.phone,role:person.role||'recipient'})),
    requiredContent:[...new Set(requiredContent)],
    missingInformation:[],
    confidence:Math.max(0,Math.min(1,Number(instruction.confidence||artifact.confidence||0.65))),
    requiresConsentCheck,
    consentConfirmed:consentConfirmed({...linkage,...artifact},instructionText+' '+source.sourceExcerpt),
    approvalRequired:instruction.authorization!=='voice_authorized'||artifact.reviewRequired!==false,
    senderIdentity:compactText(instruction.sender_identity||instruction.senderIdentity||artifact.senderIdentity||'VAL user',120),
    target:compactText(target,160)
  };
}
function validatePreparedWorkBrief(brief={},extraMissing=[]){
  const missing=safeArray(extraMissing).map(value=>compactText(value,260)).filter(Boolean);
  if(!brief.workType)missing.push('Confirm what VAL should prepare.');
  if(!brief.intendedAction)missing.push('Confirm the intended action.');
  if(!brief.subjectPurpose)missing.push('Confirm the purpose of the work.');
  if(!brief.senderIdentity)missing.push('Confirm who the work represents.');
  if(!brief.sourceType||!brief.sourceId||!brief.sourceExcerpt)missing.push('Attach inspectable source evidence.');
  if(!safeArray(brief.requiredContent).length)missing.push('Confirm the content VAL should represent.');
  if(artifactRequiresContact(brief.workType)){
    const requiredCount=artifactRequiresTwoPeople(brief.workType)?2:1;
    if(safeArray(brief.recipients).length<requiredCount)missing.push(requiredCount===2?'Resolve both people in the introduction.':'Resolve the intended recipient.');
    if(artifactRequiresEmail(brief.workType)&&safeArray(brief.recipients).some(person=>!validEmail(person.email)))missing.push('Add a verified recipient email address.');
    if(artifactRequiresPhone(brief.workType)&&safeArray(brief.recipients).some(person=>!validPhone(person.phone)))missing.push('Add a verified recipient phone number in international format.');
  }
  if(brief.requiresConsentCheck&&!brief.consentConfirmed)missing.push('Confirm permission before sharing contact details or making the introduction.');
  const unique=[...new Set(missing)];
  return {
    status:unique.length?'needs_information':'admitted',
    admitted:unique.length===0,
    missingInformation:unique,
    brief:{...brief,missingInformation:unique}
  };
}
function duplicateSentenceReport(text=''){
  const rows=String(text||'').replace(/\r/g,'\n').split(/(?<=[.!?])\s+|\n+/)
    .map(sentence=>compactText(sentence,500))
    .filter(sentence=>sentence.length>=12);
  const counts=new Map();
  for(const sentence of rows){
    const key=sentence.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
    counts.set(key,(counts.get(key)||0)+1);
  }
  const duplicates=[...counts.entries()].filter(([,count])=>count>1).map(([sentence,count])=>({sentence,count}));
  const repeatedCount=duplicates.reduce((sum,row)=>sum+row.count-1,0);
  return {duplicates,repeatedRatio:rows.length?repeatedCount/rows.length:0};
}
function validatePreparedArtifactQuality(artifact={},brief={}){
  const body=String(artifact.body||artifact.content||artifact.html||'').trim();
  const issues=[];
  if(body.length<20)issues.push('Artifact content is incomplete.');
  const repetition=/html_page|code|component/i.test(String(brief.workType||artifact.kind||''))?{duplicates:[],repeatedRatio:0}:duplicateSentenceReport(body);
  if(repetition.duplicates.length)issues.push('The artifact repeats one or more sentences.');
  if(repetition.repeatedRatio>0.25)issues.push('More than 25% of the artifact is repeated text.');
  if(artifactRequiresContact(brief.workType)){
    if(!brief.recipientName&&!brief.recipientAddress)issues.push('The recipient is unclear.');
    if(!brief.subjectPurpose)issues.push('The artifact does not have a clear purpose.');
    const greeting=(body.match(/^(?:subject:[^\n]*\n+)?\s*(?:hi|hello|dear)\s+([^,\n]+)/i)||[])[1]||'';
    if(greeting&&brief.recipientName){
      const expected=normalizedName(brief.recipientName.split(',')[0]);
      if(expected&&!normalizedName(greeting).includes(expected.split(' ')[0]))issues.push('The greeting does not match the resolved recipient.');
    }
  }
  return {passes:issues.length===0,issues,repetition};
}
function assessPreparedWork(input={}){
  const brief=buildPreparedWorkBrief(input);
  return validatePreparedWorkBrief(brief,input.extraMissing);
}
function artifactAdmissionFromStored(item={}){
  const metadata=item.metadataJson||item.metadata_json||item.metadata||{};
  const artifact=metadata.preparedArtifact||metadata.prepared_artifact||item.preparedArtifact||item.prepared_artifact||{};
  const kind=artifact.kind||metadata.preparedArtifactKind||metadata.prepared_artifact_kind||item.preparedArtifactKind||item.prepared_artifact_kind||'';
  const recipients=safeArray(artifact.recipients||artifact.attendees);
  const storedRecipient=metadata.recipientEmail||metadata.recipient_email||artifact.recipientEmail||artifact.recipient_email||'';
  if(validEmail(storedRecipient)&&!recipients.some(person=>String(person.email||person.address||'').toLowerCase()===String(storedRecipient).toLowerCase())){
    recipients.push({name:artifact.recipientName||metadata.recipientName||'',email:storedRecipient,contactId:artifact.recipientId||metadata.recipientId||''});
  }
  const sourceContext=artifact.source_packet||metadata.sourceContext||metadata.source_context||{};
  const admission=assessPreparedWork({
    kind,
    instruction:{
      requested_action:artifact.intendedAction||metadata.executionPath||kind,
      instruction:artifact.instruction||artifact.body||item.whatValPrepared||item.what_val_prepared||item.summary||'',
      target_person_or_record:artifact.target||storedRecipient||'',
      confidence:item.confidence,
      source_refs:item.sourceRefsJson||item.source_refs_json||[],
      authorization:'approval_required'
    },
    record:{
      id:sourceContext.source_id||sourceContext.transcript_id||metadata.transcriptId||metadata.transcript_id||item.id,
      source:sourceContext.source_type||metadata.source||'prepared_work',
      createdAt:item.createdAt||item.created_at
    },
    linkage:{
      linked_people:recipients,
      consentConfirmed:artifact.consentConfirmed||artifact.consent_confirmed
    },
    sourceRefs:item.sourceRefsJson||item.source_refs_json||[],
    artifact
  });
  if(!admission.admitted)return admission;
  const quality=validatePreparedArtifactQuality(artifact,admission.brief);
  return quality.passes?{...admission,quality}:{
    ...admission,
    admitted:false,
    status:'needs_information',
    missingInformation:quality.issues,
    brief:{...admission.brief,missingInformation:quality.issues},
    quality
  };
}

module.exports={
  artifactRequiresContact,
  assessPreparedWork,
  artifactAdmissionFromStored,
  buildPreparedWorkBrief,
  validatePreparedWorkBrief,
  validatePreparedArtifactQuality,
  validEmail,
  validPhone
};
