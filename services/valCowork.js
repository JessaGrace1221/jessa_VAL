function safeArray(value){return Array.isArray(value) ? value : [];}
function compactText(value='',limit=900){return String(value || '').replace(/\s+/g,' ').trim().slice(0,limit);}
function multilineText(value='',limit=5000){return String(value || '').replace(/\r\n?/g,'\n').trim().slice(0,limit);}
function stableKey(value=''){
  return String(value || '').toLowerCase().replace(/[^a-z0-9:_-]+/g,'_').replace(/^_+|_+$/g,'').slice(0,180) || 'cowork';
}
function jsonValue(value,fallback){
  if(value == null) return fallback;
  if(typeof value === 'string'){
    try{return JSON.parse(value);}catch(_){return fallback;}
  }
  return value;
}
function toSnake(key){return key.replace(/[A-Z]/g,(match)=>'_'+match.toLowerCase());}
function rowToCamel(row={}){
  const result={};
  for(const [key,value] of Object.entries(row || {})){
    const camel=key.replace(/_([a-z])/g,(_,letter)=>letter.toUpperCase());
    result[camel]=value instanceof Date ? value.toISOString() : value;
  }
  for(const key of ['workingBriefJson','questionPlanJson','stateJson','payloadJson','sourceRefsJson']){
    if(Object.hasOwn(result,key)) result[key]=jsonValue(result[key],key === 'questionPlanJson' || key === 'sourceRefsJson' ? [] : {});
  }
  return result;
}
function sourceRef(input={}){
  return {
    source_type:compactText(input.source_type || input.sourceType || 'project_packet',100),
    source_id:compactText(input.source_id || input.sourceId || input.id || '',220),
    quote_or_summary:compactText(input.quote_or_summary || input.quoteOrSummary || input.summary || '',900),
    confidence:Math.max(0,Math.min(1,Number(input.confidence) || 0.8))
  };
}
function simpleWorkstreamName(value=''){
  return compactText(value,160).replace(/^[-*\d.\s]+/,'').replace(/\s*[\-:]+\s*(owner|first move|milestone|dependency|monitor)\s*:.*/i,'').trim();
}
function uniqueNames(values=[]){
  const seen=new Set();
  return values.map((value)=>typeof value === 'string' ? value : (value?.name || value?.title || value?.label || ''))
    .map(simpleWorkstreamName)
    .filter(Boolean)
    .filter((name)=>{
      const key=name.toLowerCase();
      if(seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}
function parseWorkstreamNames(answer=''){
  const text=String(answer || '').trim();
  if(!text) return [];
  return uniqueNames(text.split(/\n|,|;/).map((line)=>line.replace(/^\s*(?:workstreams?|lanes?)\s*:\s*/i,'')));
}
function answerAcceptsProposal(answer=''){
  return /^(yes|yep|yeah|use (?:those|them|the suggestions)|looks right|that works|go ahead)\b/i.test(String(answer || '').trim());
}
function workstreamTemplate(name='',brief={}){
  return {
    id:stableKey(`workstream_${name}`),
    name:compactText(name,160),
    purpose:'',
    accountableOwner:'',
    currentState:'planned',
    firstConcreteMove:'',
    milestone:'',
    dependencies:'',
    monitoringSignal:'',
    linkedPeople:safeArray(brief.linkedPeople).map((item)=>compactText(item,140)).filter(Boolean),
    sourceRefs:safeArray(brief.sourceRefs).map(sourceRef)
  };
}
function normalizeWorkstream(value={},brief={}){
  const raw=typeof value === 'string' ? {name:value} : (value || {});
  const template=workstreamTemplate(raw.name || raw.title || raw.label || '',brief);
  return {
    ...template,
    ...raw,
    id:compactText(raw.id || template.id,220),
    name:compactText(raw.name || raw.title || raw.label || template.name,160),
    purpose:compactText(raw.purpose || raw.outcome || '',500),
    accountableOwner:compactText(raw.accountableOwner || raw.owner || '',180),
    currentState:compactText(raw.currentState || raw.status || template.currentState,160),
    firstConcreteMove:compactText(raw.firstConcreteMove || raw.firstMove || raw.nextMove || '',500),
    milestone:compactText(raw.milestone || raw.proofOfProgress || '',500),
    dependencies:compactText(raw.dependencies || raw.blocker || '',500),
    monitoringSignal:compactText(raw.monitoringSignal || raw.monitor || '',500),
    linkedPeople:uniqueNames(raw.linkedPeople || raw.people || template.linkedPeople),
    sourceRefs:safeArray(raw.sourceRefs || template.sourceRefs).map(sourceRef)
  };
}
function missingWorkstreamFields(workstream={}){
  const labels=[];
  if(!compactText(workstream.purpose)) labels.push('purpose');
  if(!compactText(workstream.accountableOwner)) labels.push('owner');
  if(!compactText(workstream.firstConcreteMove)) labels.push('first move');
  if(!compactText(workstream.milestone)) labels.push('milestone');
  if(!compactText(workstream.monitoringSignal)) labels.push('monitoring signal');
  return labels;
}
function parseLabeledWorkstreamDetails(answer='',workstreams=[]){
  const byName=new Map(safeArray(workstreams).map((item)=>[String(item.name || '').toLowerCase(),{...item}]));
  const lines=String(answer || '').split(/\n+/).map((line)=>line.trim()).filter(Boolean);
  for(const line of lines){
    const [rawName,...detailParts]=line.split(/\s+[\-\u2013\u2014]\s+/);
    const candidateName=simpleWorkstreamName(rawName);
    const target=byName.get(candidateName.toLowerCase()) || (byName.size === 1 ? [...byName.values()][0] : null);
    if(!target) continue;
    const detail=detailParts.join(' ') || line;
    const capture=(labels)=>{
      const match=detail.match(new RegExp(`(?:^|[;|])\\s*(?:${labels})\\s*:\\s*([^;|]+)`, 'i'));
      return compactText(match?.[1] || '',500);
    };
    target.purpose=capture('purpose|outcome') || target.purpose;
    target.accountableOwner=capture('owner|accountable owner') || target.accountableOwner;
    target.firstConcreteMove=capture('first move|next move|first concrete move') || target.firstConcreteMove;
    target.milestone=capture('milestone|proof') || target.milestone;
    target.dependencies=capture('dependency|dependencies|blocker') || target.dependencies;
    target.monitoringSignal=capture('monitoring signal|monitoring|monitor|signal') || target.monitoringSignal;
    byName.set(String(target.name || '').toLowerCase(),target);
  }
  return [...byName.values()];
}
function entryQuestion(state={},brief={}){
  const stage=state.stage || 'project_outcome';
  const proposed=uniqueNames(state.proposedWorkstreams || []);
  if(stage === 'project_outcome'){
    return {
      targetField:'project_identity_packet.desired_outcome',
      question:`Before I build workstreams for ${brief.projectName || 'this project'}, what outcome should the project create?`,
      detail:'The answer fills Project Managers > What this is and lets VAL judge which workstreams are actually necessary.'
    };
  }
  if(stage === 'confirm_lanes'){
    const names=proposed.length ? proposed.join(', ') : 'no lanes yet';
    return {
      targetField:'project_workstreams[].name',
      question:proposed.length
        ? `I can start with these workstreams: ${names}. Should I use them as written, or what should I add, merge, remove, or rename?`
        : `What are the 2 to 6 major lanes of work needed to achieve "${brief.desiredOutcome}"?`,
      detail:'This answer creates the named workstreams. It does not create tasks.'
    };
  }
  if(stage === 'workstream_details'){
    const incomplete=safeArray(state.draftWorkstreams).filter((item)=>missingWorkstreamFields(item).length);
    if(!incomplete.length){
      return {targetField:'project_workstreams',question:'The workstreams are ready for review.',detail:'Review the prepared set, then apply it to Project Managers.'};
    }
    const examples=incomplete.map((item)=>`${item.name} - ${missingWorkstreamFields(item).join(': ...; ')}: ...`).join('\n');
    return {
      targetField:'project_workstreams[].{purpose,accountable_owner,first_concrete_move,milestone,monitoring_signal}',
      question:`Fill only the missing details below.\n\n${examples}`,
      detail:'Use labels exactly as shown. VAL will ask again only for fields that remain blank. Dependencies are optional; write "dependency: none" when there is no known dependency.'
    };
  }
  return {targetField:'project_workstreams',question:'Review the prepared workstreams, then apply them when they are true.',detail:'No external action happens from this step.'};
}
function buildProjectWorkstreamsBrief(project={},input={}){
  const metadata=project.metadataJson || project.metadata || {};
  const sourceDetails=project.sourceDetails || metadata.sourceDetails || {};
  const linkedPeople=uniqueNames([metadata.owner?.name,project.nextStepOwner,sourceDetails.relationships,metadata.intake?.relationships,project.relationships].filter(Boolean));
  const references=[
    sourceRef({sourceType:'project_packet',sourceId:project.projectId || project.id || input.scope?.entityId || '',quoteOrSummary:project.sourceReceipts || project.reality || project.summary || 'Project packet'}),
    sourceDetails.documents && sourceRef({sourceType:'document',sourceId:project.projectId || project.id || '',quoteOrSummary:`Project documents: ${sourceDetails.documents}`}),
    sourceDetails.rawContext && sourceRef({sourceType:'project_context',sourceId:project.projectId || project.id || '',quoteOrSummary:sourceDetails.rawContext})
  ].filter(Boolean);
  const providedSuggestions=uniqueNames(input.suggestedWorkstreams || input.suggested_workstreams || []);
  const existing=uniqueNames(project.workstreams || metadata.workstreams || []);
  return {
    id:stableKey(`working_brief_project_workstreams_${project.projectId || project.id || input.scope?.entityId || project.name}`),
    entrypointId:'project.workstreams',
    entityType:'project_section',
    entityId:String(project.projectId || project.id || input.scope?.entityId || ''),
    sectionId:'workstreams',
    projectName:compactText(project.name || project.displayName || metadata.projectName || 'Project',180),
    desiredOutcome:compactText(project.desiredOutcome || project.outcome || metadata.desiredOutcome || metadata.outcome || '',500),
    currentPhase:compactText(project.projectPhase || metadata.projectPhase || project.status || '',180),
    currentReality:compactText(project.reality || project.summary || '',900),
    linkedPeople,
    sourceRefs:references,
    existingWorkstreams:safeArray(project.workstreams || metadata.workstreams).map((item)=>normalizeWorkstream(item,{})),
    suggestedWorkstreams:providedSuggestions.length ? providedSuggestions : existing,
    objective:'Build a complete, manageable set of project workstreams from the selected Project Managers section.',
    completionCondition:'Every retained workstream has a purpose, accountable owner, first concrete move, milestone, monitoring signal, linked people, and source references.',
    approvalBoundary:'Applying the workstreams changes only the internal Project Managers packet. It does not create tasks, update CRM, send a message, schedule anything, or alter a source document.'
  };
}

function answerField(answer='', labels=''){
  const source=String(answer || '');
  const match=source.match(new RegExp(`(?:^|[;\\n])\\s*(?:${labels})\\s*:\\s*([^;\\n]+)`, 'i'));
  return compactText(match?.[1] || '',500);
}
function nextMoveProposalFromAnswer(answer='', current={}){
  const source=multilineText(answer,5000);
  const hasLabels=/(?:^|[;\n])\s*(?:next move|action|move|owner|accountable owner|timing|when|due|trigger|basis|why now|reason)\s*:/i.test(source);
  const action=answerField(source,'next move|action|move') || (!hasLabels ? compactText(source,500) : '');
  return {
    nextMove:action || compactText(current.nextMove || '',500),
    accountableOwner:answerField(source,'accountable owner|owner') || compactText(current.accountableOwner || '',180),
    timingOrTrigger:answerField(source,'timing|when|due|trigger') || compactText(current.timingOrTrigger || '',300),
    basis:answerField(source,'why now|basis|reason') || compactText(current.basis || '',700)
  };
}
function missingNextMoveFields(proposal={}){
  const missing=[];
  if(!compactText(proposal.nextMove)) missing.push('next move');
  if(!compactText(proposal.accountableOwner)) missing.push('owner');
  if(!compactText(proposal.timingOrTrigger)) missing.push('timing or trigger');
  if(!compactText(proposal.basis)) missing.push('basis');
  return missing;
}
function buildProjectNextMoveBrief(project={},input={}){
  const metadata=project.metadataJson || project.metadata || {};
  const sourceDetails=project.sourceDetails || metadata.sourceDetails || {};
  const linkedPeople=uniqueNames([metadata.owner?.name,project.nextStepOwner,sourceDetails.relationships,metadata.intake?.relationships,project.relationships].filter(Boolean));
  const references=[
    sourceRef({sourceType:'project_packet',sourceId:project.projectId || project.id || input.scope?.entityId || '',quoteOrSummary:project.sourceReceipts || project.nextMoveEvidence || project.reality || project.summary || 'Project packet'}),
    sourceDetails.documents && sourceRef({sourceType:'document',sourceId:project.projectId || project.id || '',quoteOrSummary:`Project documents: ${sourceDetails.documents}`}),
    sourceDetails.rawContext && sourceRef({sourceType:'project_context',sourceId:project.projectId || project.id || '',quoteOrSummary:sourceDetails.rawContext})
  ].filter(Boolean);
  const sourceBasis=compactText(project.nextMoveEvidence || references[0]?.quote_or_summary || '',700);
  return {
    id:stableKey(`working_brief_project_next_move_${project.projectId || project.id || input.scope?.entityId || project.name}`),
    entrypointId:'project.next_move',
    entityType:'project_section',
    entityId:String(project.projectId || project.id || input.scope?.entityId || ''),
    sectionId:'next_move',
    projectName:compactText(project.name || project.displayName || metadata.projectName || 'Project',180),
    desiredOutcome:compactText(project.desiredOutcome || project.outcome || metadata.desiredOutcome || metadata.outcome || '',500),
    currentReality:compactText(project.reality || project.summary || '',900),
    linkedPeople,
    sourceRefs:references,
    currentProposal:{
      nextMove:compactText(project.nextMove || metadata.nextMove || '',500),
      accountableOwner:compactText(project.nextStepOwner || metadata.nextStepOwner || metadata.owner?.name || '',180),
      timingOrTrigger:compactText(project.nextStepDueAt || project.deadline || project.dueAt || metadata.nextStepDueAt || '',300),
      basis:sourceBasis
    },
    objective:'Commit to the smallest concrete move that advances this selected project without scattering its context.',
    completionCondition:'The next move has one concrete action, one accountable owner, a timing or trigger, and a source or decision basis.',
    approvalBoundary:'Applying the next move changes only the internal Project Managers packet. It does not create a task, send a message, update CRM, schedule anything, or alter a source document.'
  };
}
function nextMoveQuestion(state={},brief={}){
  const stage=state.stage || 'next_move';
  const current=state.draftNextMove || brief.currentProposal || {};
  if(stage === 'next_move'){
    if(compactText(current.nextMove)){
      return {
        targetField:'project_next_action_packet.next_action',
        question:`The current proposed move for ${brief.projectName || 'this project'} is "${current.nextMove}". Should that remain the next narrow move, or what should replace it?`,
        detail:'This answer fills Project Managers > Next move. It does not create a task or send anything.'
      };
    }
    return {
      targetField:'project_next_action_packet.next_action',
      question:`What is the one smallest concrete move that should advance ${brief.projectName || 'this project'} now?`,
      detail:'Name one action only. VAL will then ask only for the owner, timing or trigger, and basis that are still missing.'
    };
  }
  if(stage === 'next_move_details'){
    const missing=missingNextMoveFields(current);
    return {
      targetField:'project_next_action_packet.{next_action,owner,due_at,why_now}',
      question:`Fill only the missing details for this next move: ${missing.join(', ')}.`,
      detail:'Use: Next move: ...; Owner: ...; Timing: ...; Basis: ... . The basis can name a source receipt or an executive decision.'
    };
  }
  return {
    targetField:'project_next_action_packet',
    question:'Review the prepared next move, then apply it to this Project Manager.',
    detail:'Applying changes only the internal Project Managers packet.'
  };
}

function projectIdentityReferences(project={},input={}){
  const metadata=project.metadataJson || project.metadata || {};
  const sourceDetails=project.sourceDetails || metadata.sourceDetails || {};
  const projectId=project.projectId || project.id || input.scope?.entityId || '';
  return [
    project.sourceReceipts && sourceRef({sourceType:'project_packet',sourceId:projectId,quoteOrSummary:project.sourceReceipts}),
    sourceDetails.documents && sourceRef({sourceType:'document',sourceId:projectId,quoteOrSummary:`Project documents: ${sourceDetails.documents}`}),
    sourceDetails.rawContext && sourceRef({sourceType:'project_context',sourceId:projectId,quoteOrSummary:sourceDetails.rawContext})
  ].filter(Boolean);
}
function projectIdentityOwner(project={}){
  const metadata=project.metadataJson || project.metadata || {};
  const owner=metadata.owner && typeof metadata.owner === 'object' ? metadata.owner : {};
  return compactText(project.nextStepOwner || owner.name || owner.displayName || '',180);
}
function buildProjectIdentityBrief(project={},input={}){
  const metadata=project.metadataJson || project.metadata || {};
  const references=projectIdentityReferences(project,input);
  const projectId=String(project.projectId || project.id || input.scope?.entityId || '');
  const currentIdentity={
    canonicalName:compactText(project.name || project.displayName || metadata.projectName || '',180),
    purpose:compactText(project.purpose || metadata.purpose || metadata.projectPurpose || '',700),
    desiredOutcome:compactText(project.desiredOutcome || project.outcome || metadata.desiredOutcome || metadata.outcome || '',700),
    owner:projectIdentityOwner(project)
  };
  return {
    id:stableKey(`working_brief_project_identity_${projectId || currentIdentity.canonicalName}`),
    entrypointId:'project.identity',
    entityType:'project_section',
    entityId:projectId,
    sectionId:'identity',
    projectName:currentIdentity.canonicalName || 'Project',
    currentIdentity,
    sourceRefs:references,
    linkedPeople:uniqueNames([currentIdentity.owner,project.sourceDetails?.relationships,metadata.intake?.relationships,project.relationships].filter(Boolean)),
    objective:'Establish the selected project\'s canonical identity before VAL proposes operational work.',
    completionCondition:'The canonical name, who or what the project serves, desired outcome, and one project owner are explicit. Existing source references are preserved without copying details from another project.',
    approvalBoundary:'Applying the project foundation changes only the internal Project Managers packet. It does not create workstreams or tasks, link a relationship, update CRM, send a message, schedule anything, or alter a source document.'
  };
}
function missingProjectIdentityFields(identity={}){
  const missing=[];
  if(!compactText(identity.canonicalName)) missing.push('project name');
  if(!compactText(identity.purpose)) missing.push('who or what it serves');
  if(!compactText(identity.desiredOutcome)) missing.push('desired outcome');
  if(!compactText(identity.owner)) missing.push('project owner');
  return missing;
}
function identityAnswerHasLabels(answer=''){
  return /(?:^|[;\n])\s*(?:project name|name|called|who or what it serves|serves|beneficiary|audience|purpose|desired outcome|outcome|project owner|owner)\s*:/i.test(String(answer || ''));
}
function identityAnswerValue(answer='',labels=''){
  return answerField(answer,labels);
}
function projectIdentityFromAnswer(answer='',current={},stage='identity'){
  const source=multilineText(answer,5000);
  const next={
    canonicalName:compactText(current.canonicalName || '',180),
    purpose:compactText(current.purpose || '',700),
    desiredOutcome:compactText(current.desiredOutcome || '',700),
    owner:compactText(current.owner || '',180)
  };
  const hasLabels=identityAnswerHasLabels(source);
  const canonicalName=identityAnswerValue(source,'project name|name|called');
  const purpose=identityAnswerValue(source,'who or what it serves|serves|beneficiary|audience|purpose|what this is');
  const desiredOutcome=identityAnswerValue(source,'desired outcome|outcome');
  const owner=identityAnswerValue(source,'project owner|owner|accountable owner');
  if(canonicalName) next.canonicalName=canonicalName;
  if(purpose) next.purpose=purpose;
  if(desiredOutcome) next.desiredOutcome=desiredOutcome;
  if(owner) next.owner=owner;
  if(!hasLabels){
    const identityMissing=['canonicalName','purpose','desiredOutcome'].filter((field)=>!compactText(next[field]));
    if(stage === 'owner') next.owner=compactText(source,180) || next.owner;
    else if(identityMissing.length === 1) next[identityMissing[0]]=compactText(source,700) || next[identityMissing[0]];
  }
  return next;
}
function projectIdentityQuestion(state={},brief={}){
  const identity=state.draftIdentity || brief.currentIdentity || {};
  const stage=state.stage || 'identity';
  if(stage === 'identity'){
    return {
      targetField:'project_identity_packet.{canonical_name,purpose,desired_outcome}',
      question:`For ${brief.projectName || 'this project'}, confirm or correct its name, then name who or what it serves and the outcome it should create.`,
      detail:'Use: Project name: ...; Serves: ...; Desired outcome: ... . This fills Project Managers > Identity, What this is, and the foundation for Working narrative.'
    };
  }
  if(stage === 'identity_details'){
    const missing=missingProjectIdentityFields(identity).filter((field)=>field !== 'project owner');
    return {
      targetField:'project_identity_packet.{canonical_name,purpose,desired_outcome}',
      question:`I still need ${missing.join(', ')} for this selected project.`,
      detail:'Use only the missing labels: Project name: ...; Serves: ...; Desired outcome: ... .'
    };
  }
  if(stage === 'owner'){
    return {
      targetField:'project_owner_packet.owner',
      question:`Who is the one project owner for ${identity.canonicalName || brief.projectName || 'this project'}?`,
      detail:'Name one accountable person or relationship. This fills Project Managers > People involved and does not create or change a relationship; reassignment remains explicit there.'
    };
  }
  return {
    targetField:'project_identity_packet + project_owner_packet',
    question:'Review the prepared project foundation, then apply it to this Project Manager.',
    detail:'Applying changes only the selected internal project packet. The source references remain unchanged.'
  };
}

function projectPeopleList(value=[]){
  const raw=Array.isArray(value) ? value : String(value || '').split(/\n|,|;/);
  return raw.map((item)=>typeof item === 'string' ? item : (item?.name || item?.displayName || '')).map((item)=>compactText(item,180)).filter(Boolean);
}
function relationshipCandidate(profile={}){
  return {
    id:compactText(profile.id || profile.relationshipId || profile.profileKey || profile.personId || profile.contactId || profile.email || '',220),
    name:compactText(profile.displayName || profile.name || profile.relationshipName || '',180),
    email:compactText(profile.email || profile.metadata?.email || '',220),
    detail:compactText(profile.company || profile.role || profile.relationshipStatus || profile.summary || '',240)
  };
}
function projectPeopleCandidateMatch(value='',candidates=[]){
  const needle=compactText(value,220).toLowerCase();
  return safeArray(candidates).find((candidate)=>[candidate.id,candidate.name,candidate.email].filter(Boolean).some((item)=>String(item).toLowerCase() === needle)) || null;
}
function buildProjectPeopleBrief(project={},candidates=[],input={}){
  const metadata=project.metadataJson || project.metadata || {};
  const sourceDetails=project.sourceDetails || metadata.sourceDetails || {};
  const existingNames=uniqueNames([project.relationships,sourceDetails.relationships,metadata.intake?.relationships].filter(Boolean));
  const knownCandidates=safeArray(candidates).map(relationshipCandidate).filter((candidate)=>candidate.id && candidate.name);
  const existingPeople=existingNames.map((name)=>{
    const candidate=projectPeopleCandidateMatch(name,knownCandidates);
    return {relationshipId:candidate?.id || '',name:candidate?.name || name,email:candidate?.email || '',role:'',known:Boolean(candidate)};
  });
  const references=projectIdentityReferences(project,input);
  return {
    id:stableKey(`working_brief_project_people_${project.projectId || project.id || input.scope?.entityId || project.name}`),
    entrypointId:'project.people',
    entityType:'project_section',
    entityId:String(project.projectId || project.id || input.scope?.entityId || ''),
    sectionId:'people',
    projectName:compactText(project.name || project.displayName || metadata.projectName || 'Project',180),
    existingPeople,
    currentOwner:projectIdentityOwner(project),
    relationshipCandidates:knownCandidates.slice(0,40),
    sourceRefs:references,
    objective:'Connect the correct existing relationships to the selected project and make one project owner explicit.',
    completionCondition:'Every retained person has an existing relationship, a role in the project, and one of those people is the explicit owner.',
    approvalBoundary:'Applying links only the selected existing relationships to this internal project and records one owner. It does not create a relationship, update CRM, send a message, create a task, schedule anything, or alter source evidence.'
  };
}
function parseProjectPeople(answer='',brief={},current={}){
  const source=multilineText(answer,5000);
  const existingPeople=safeArray(Array.isArray(current) ? current : current.people);
  const existingOwnerId=compactText(Array.isArray(current) ? '' : current.ownerId || '',220);
  const labeled=/(?:^|[;\n])\s*(?:people|relationships|people involved|owner|project owner)\s*:/i.test(source);
  const peopleMatch=source.match(/(?:^|\n)\s*(?:people involved|relationships|people)\s*:\s*([\s\S]*?)(?=(?:\n|;)\s*(?:project owner|owner)\s*:|$)/i);
  const peopleText=compactText(peopleMatch?.[1] || '',5000) || (!labeled ? source : '');
  const owner=answerField(source,'project owner|owner');
  const items=peopleText.split(/\n|;/).map((item)=>item.trim()).filter(Boolean).flatMap((item)=>item.split(/,(?![^()]*\))/).map((part)=>part.trim())).filter(Boolean);
  const draft=[];
  const unresolved=[];
  for(const item of items){
    const match=item.match(/^(.+?)(?:\s+[-\u2013]\s+|\s*:\s*)(.+)$/);
    const candidateName=compactText(match?.[1] || item,180);
    const role=compactText(match?.[2] || '',240);
    const candidate=projectPeopleCandidateMatch(candidateName,brief.relationshipCandidates);
    if(!candidate){
      if(candidateName) unresolved.push(candidateName);
      continue;
    }
    if(!draft.some((person)=>person.relationshipId === candidate.id)) draft.push({relationshipId:candidate.id,name:candidate.name,email:candidate.email,role,known:true});
  }
  if(!items.length && existingPeople.length) draft.push(...existingPeople);
  for(const person of draft){
    const existing=existingPeople.find((item)=>item.relationshipId===person.relationshipId);
    if(existing?.role && !person.role) person.role=existing.role;
  }
  const ownerCandidate=projectPeopleCandidateMatch(owner,brief.relationshipCandidates) || draft.find((person)=>person.relationshipId===existingOwnerId) || draft.find((person)=>person.name.toLowerCase()===String(owner || brief.currentOwner || '').toLowerCase()) || null;
  return {people:draft,ownerId:ownerCandidate?.relationshipId || ownerCandidate?.id || '',ownerName:ownerCandidate?.name || compactText(owner || '',180),unresolved:uniqueNames(unresolved)};
}
function missingProjectPeopleFields(proposal={}){
  const missing=[];
  if(!safeArray(proposal.people).length) missing.push('relationships');
  if(safeArray(proposal.people).some((person)=>!compactText(person.role))) missing.push('roles');
  if(!compactText(proposal.ownerId) || !safeArray(proposal.people).some((person)=>person.relationshipId===proposal.ownerId)) missing.push('project owner');
  return missing;
}
function projectPeopleQuestion(state={},brief={}){
  const proposal=state.draftPeople || {people:[],ownerId:'',unresolved:[]};
  if(state.stage === 'people'){
    const choices=safeArray(brief.relationshipCandidates).slice(0,12).map((person)=>person.name).join(', ');
    return {
      targetField:'project_relationships_packet[].{relationship_name,role_in_project}',
      question:`Which existing relationships belong on ${brief.projectName || 'this project'}, and what is each person's role?`,
      detail:`Use: People: Name - role; Name - role. Available relationships: ${choices || 'none loaded yet'}. Creating a new relationship stays in People involved, then reopen this brief.`
    };
  }
  if(state.stage === 'unresolved'){
    return {
      targetField:'project_relationships_packet[].relationship_name',
      question:`I cannot link ${proposal.unresolved.join(', ')} because those relationships are not in VAL yet.`,
      detail:'Create the relationship from People involved, then reopen this brief. VAL will not silently invent or duplicate a relationship.'
    };
  }
  if(state.stage === 'roles'){
    const missing=safeArray(proposal.people).filter((person)=>!compactText(person.role)).map((person)=>person.name).join(', ');
    return {targetField:'project_relationships_packet[].role_in_project',question:`What is each missing role for ${missing}?`,detail:'Use: Name - role. This writes only the selected project relationship roles.'};
  }
  if(state.stage === 'owner'){
    return {targetField:'project_owner_packet.owner',question:`Which one of these linked people owns ${brief.projectName || 'this project'}?`,detail:'Use: Owner: Name. One owner is recorded; changing it later remains explicit in People involved.'};
  }
  return {targetField:'project_relationships_packet + project_owner_packet',question:'Review the linked people and owner, then apply them to this Project Manager.',detail:'Applying creates internal relationship links only. Nothing external happens.'};
}

function exactTranscriptLines(value=[]){
  return safeArray(value).map((item)=>String(item == null ? '' : item).trim()).filter(Boolean);
}
function transcriptInvitees(transcript={}){
  const buckets=[
    transcript.attendees,
    transcript.invitees,
    transcript.calendarEvent?.attendees,
    transcript.calendar_event?.attendees,
    transcript.event?.attendees,
    transcript.metadata?.attendees,
    transcript.sourcePayloadMetadata?.attendees
  ];
  const seen=new Set();
  return buckets.flatMap((bucket)=>safeArray(bucket)).map((person)=>{
    if(typeof person === 'string') return {name:person,email:''};
    return {
      name:compactText(person?.name || person?.displayName || person?.emailAddress?.name || '',180),
      email:compactText(person?.email || person?.address || person?.emailAddress?.address || '',220)
    };
  }).filter((person)=>person.name || person.email).filter((person)=>{
    const key=(person.email || person.name).toLowerCase();
    if(seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function buildTranscriptWorkingBrief(transcript={},input={}){
  const receipt=transcript.sourceReceipt && typeof transcript.sourceReceipt === 'object' ? transcript.sourceReceipt : {};
  const actionItems=exactTranscriptLines(receipt.actionItems);
  const keyPoints=exactTranscriptLines(receipt.keyPoints);
  const sections=safeArray(receipt.sections).map((section)=>({
    kind:compactText(section?.kind || '',80),
    heading:compactText(section?.heading || '',180),
    raw:multilineText(section?.raw || '',24000),
    lines:exactTranscriptLines(section?.lines)
  }));
  const entityId=compactText(transcript.id || transcript.transcriptId || input.scope?.entityId || '',220);
  const title=compactText(transcript.title || transcript.meetingTitle || 'Transcript',240);
  const body=multilineText(receipt.body || '',50000);
  const calendarEvent=transcript.calendarEvent || transcript.calendar_event || transcript.event || {};
  const invitees=transcriptInvitees(transcript);
  const participants=uniqueNames(safeArray(transcript.participants).map((person)=>person?.matchedContactName || person?.speakerNameRaw || person?.name || person?.email || person));
  const relatedProjects=uniqueNames([
    transcript.projectName,
    transcript.relatedProject,
    transcript.metadata?.projectName,
    transcript.sourcePayloadMetadata?.projectName
  ]);
  const relatedRelationships=uniqueNames([
    transcript.contactName,
    transcript.metadata?.contactName,
    transcript.sourcePayloadMetadata?.contactName,
    ...participants
  ]);
  const references=[
    sourceRef({sourceType:'transcript_source_receipt',sourceId:entityId,quoteOrSummary:body || actionItems.concat(keyPoints).join(' ')}),
    calendarEvent?.id && sourceRef({sourceType:'calendar_event',sourceId:calendarEvent.id,quoteOrSummary:calendarEvent.title || title}),
    invitees.length && sourceRef({sourceType:'calendar_invitees',sourceId:entityId,quoteOrSummary:invitees.map((person)=>person.name || person.email).join(', ')})
  ].filter(Boolean);
  return {
    id:stableKey(`working_brief_transcript_${entityId || title}`),
    entrypointId:'transcript.working_brief',
    entityType:'transcript',
    entityId,
    sectionId:'working_brief',
    transcriptTitle:title,
    sourceReceipt:{body,sections,actionItems,keyPoints,ready:Boolean(body && sections.length)},
    calendarEvent:{id:compactText(calendarEvent?.id || transcript.calendarEventId || '',220),title:compactText(calendarEvent?.title || '',240)},
    invitees,
    linkedPeople:participants,
    relatedProjects,
    relatedRelationships,
    existingDrafts:safeArray(transcript.drafts).map((draft)=>({id:compactText(draft?.id || '',220),type:compactText(draft?.draftType || '',100),status:compactText(draft?.status || '',100)})),
    sourceRefs:references,
    objective:'Prepare one reviewable, source-preserving result from the selected transcript.',
    completionCondition:'The result is tied to the exact Krisp receipt, uses the selected meeting context, and has an explicit review or apply route.',
    approvalBoundary:'Applying the first Transcript Working Brief result creates only an internal meeting-overview draft. It does not send email, create provider drafts, alter Krisp text, create a task, update CRM, or modify a calendar event.'
  };
}
function transcriptWorkingBriefQuestion(state={},brief={}){
  if(state.stage === 'ready_to_apply'){
    return {
      targetField:'prepared_artifact.email_draft',
      question:'Review the exact meeting overview, then apply it to Leverage as an internal draft.',
      detail:'Applying creates an internal draft for review only. Nothing sends and the Krisp source receipt stays unchanged.'
    };
  }
  const receipt=brief.sourceReceipt || {};
  return {
    targetField:'transcript_working_brief.prepared_artifact_kind',
    question:`Krisp's exact receipt for ${brief.transcriptTitle || 'this transcript'} is loaded unchanged (${exactTranscriptLines(receipt.actionItems).length} Action Items and ${exactTranscriptLines(receipt.keyPoints).length} Key Points). Should I prepare that attendee meeting overview for review?`,
    detail:'Reply "yes" or "prepare" to create the source-preserving internal email draft. Nothing sends from this conversation.'
  };
}
function confirmsTranscriptMeetingOverview(answer=''){
  return /^(?:yes|yep|yeah|prepare|prepare (?:the )?(?:meeting )?overview|create (?:the )?(?:meeting )?overview|go ahead)\b/i.test(String(answer || '').trim());
}

const COWORK_ENTRYPOINTS=Object.freeze({
  'project.identity':{
    id:'project.identity',
    surface:'project_managers',
    scopeType:'project_section',
    sectionId:'identity',
    requiredPackets:['project_packet','project_identity_packet','project_owner_packet'],
    objective:'Establish the selected project foundation.',
    completionCondition:'Name, purpose, desired outcome, and one project owner are explicit and ready for internal review.'
  },
  'project.people':{
    id:'project.people',surface:'project_managers',scopeType:'project_section',sectionId:'people',
    requiredPackets:['project_packet','project_relationships_packet','project_owner_packet'],
    objective:'Connect the selected project to its people and owner.',
    completionCondition:'Each linked person has a role and one is the explicit project owner.'
  },
  'project.workstreams':{
    id:'project.workstreams',
    surface:'project_managers',
    scopeType:'project_section',
    sectionId:'workstreams',
    requiredPackets:['project_packet','project_sop_packet','project_relationships_packet','project_identity_packet'],
    objective:'Build complete project workstreams.',
    completionCondition:'Each workstream is complete enough for executive review and explicit internal application.'
  },
  'project.next_move':{
    id:'project.next_move',
    surface:'project_managers',
    scopeType:'project_section',
    sectionId:'next_move',
    requiredPackets:['project_packet','project_next_action_packet','project_owner_packet','project_identity_packet'],
    objective:'Commit to the selected project\'s next narrow move.',
    completionCondition:'The move has an action, owner, timing or trigger, and source or decision basis.'
  },
  'transcript.working_brief':{
    id:'transcript.working_brief',
    surface:'transcripts',
    scopeType:'transcript',
    sectionId:'working_brief',
    requiredPackets:['transcript_working_brief','transcript_source_receipt','calendar_event_packet'],
    objective:'Prepare reviewable work from one selected transcript without altering its Krisp receipt.',
    completionCondition:'The prepared result cites the selected source receipt and has an explicit review or apply route.'
  }
});

function createValCoworkService({
  dbQuery,
  hasPg=()=>false,
  getStore=()=>({}),
  saveStore=()=>{},
  uuid=(prefix)=>`${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`,
  tenantId=()=>'default',
  userId=()=>'default',
  loadProject=async()=>null,
  loadRelationships=async()=>[],
  applyProjectIdentity=async()=>null,
  applyProjectPeople=async()=>null,
  applyProjectWorkstreams=async()=>null,
  applyProjectNextMove=async()=>null,
  loadTranscript=async()=>null,
  prepareTranscriptMeetingOverview=async()=>null
}={}){
  function scope(){return {tenantId:tenantId(),userId:userId()};}
  function store(){
    const value=getStore() || {};
    if(!Array.isArray(value.coworkSessions)) value.coworkSessions=[];
    if(!Array.isArray(value.coworkWorkItems)) value.coworkWorkItems=[];
    if(!Array.isArray(value.coworkActionReceipts)) value.coworkActionReceipts=[];
    return value;
  }
  async function pgUpsert(table,row,columns){
    const names=columns.map(toSnake);
    const values=columns.map((key)=>row[key]);
    const params=columns.map((_,index)=>`$${index+1}`).join(',');
    const updates=names.filter((name)=>!['id','created_at'].includes(name)).map((name)=>`${name}=excluded.${name}`).join(',');
    const result=await dbQuery(`insert into ${table} (${names.join(',')}) values (${params}) on conflict (id) do update set ${updates} returning *`,values);
    return rowToCamel(result.rows?.[0] || row);
  }
  async function saveSession(row){
    const columns=['id','tenantId','userId','entrypointId','scopeType','scopeId','scopeSectionId','status','workingBriefJson','questionPlanJson','stateJson','createdAt','updatedAt'];
    if(hasPg()) return pgUpsert('val_cowork_sessions',row,columns);
    const value=store();
    const index=value.coworkSessions.findIndex((item)=>item.id===row.id && item.tenantId===row.tenantId && item.userId===row.userId);
    if(index >= 0) value.coworkSessions[index]={...value.coworkSessions[index],...row,createdAt:value.coworkSessions[index].createdAt || row.createdAt,updatedAt:new Date().toISOString()};
    else value.coworkSessions.unshift(row);
    saveStore(value);
    return index >= 0 ? value.coworkSessions[index] : row;
  }
  async function saveWorkItem(row){
    const columns=['id','tenantId','userId','sessionId','workType','title','status','payloadJson','sourceRefsJson','createdAt','updatedAt'];
    if(hasPg()) return pgUpsert('val_cowork_work_items',row,columns);
    const value=store();
    const index=value.coworkWorkItems.findIndex((item)=>item.id===row.id && item.tenantId===row.tenantId && item.userId===row.userId);
    if(index >= 0) value.coworkWorkItems[index]={...value.coworkWorkItems[index],...row,createdAt:value.coworkWorkItems[index].createdAt || row.createdAt,updatedAt:new Date().toISOString()};
    else value.coworkWorkItems.unshift(row);
    saveStore(value);
    return index >= 0 ? value.coworkWorkItems[index] : row;
  }
  async function saveReceipt(row){
    const columns=['id','tenantId','userId','sessionId','workItemId','action','status','summary','payloadJson','createdAt'];
    if(hasPg()) return pgUpsert('val_cowork_action_receipts',row,columns);
    const value=store();
    const index=value.coworkActionReceipts.findIndex((item)=>item.id===row.id && item.tenantId===row.tenantId && item.userId===row.userId);
    if(index >= 0) value.coworkActionReceipts[index]={...value.coworkActionReceipts[index],...row};
    else value.coworkActionReceipts.unshift(row);
    saveStore(value);
    return index >= 0 ? value.coworkActionReceipts[index] : row;
  }
  async function getSession(id){
    const sc=scope();
    if(hasPg()){
      const result=await dbQuery('select * from val_cowork_sessions where id=$1 and tenant_id=$2 and user_id=$3 limit 1',[id,sc.tenantId,sc.userId]);
      return result.rows?.[0] ? rowToCamel(result.rows[0]) : null;
    }
    return store().coworkSessions.find((item)=>item.id===id && item.tenantId===sc.tenantId && item.userId===sc.userId) || null;
  }
  async function getWorkItem(id){
    const sc=scope();
    if(hasPg()){
      const result=await dbQuery('select * from val_cowork_work_items where id=$1 and tenant_id=$2 and user_id=$3 limit 1',[id,sc.tenantId,sc.userId]);
      return result.rows?.[0] ? rowToCamel(result.rows[0]) : null;
    }
    return store().coworkWorkItems.find((item)=>item.id===id && item.tenantId===sc.tenantId && item.userId===sc.userId) || null;
  }
  async function findSessionWorkItem(sessionId){
    const sc=scope();
    if(hasPg()){
      const result=await dbQuery('select * from val_cowork_work_items where session_id=$1 and tenant_id=$2 and user_id=$3 order by updated_at desc limit 1',[sessionId,sc.tenantId,sc.userId]);
      return result.rows?.[0] ? rowToCamel(result.rows[0]) : null;
    }
    return store().coworkWorkItems.filter((item)=>item.sessionId===sessionId && item.tenantId===sc.tenantId && item.userId===sc.userId).sort((a,b)=>String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))[0] || null;
  }
  function publicResult(session,workItem,message='',question=null,receipt=null){
    const state=session.stateJson || {};
    const brief=session.workingBriefJson || {};
    return {
      ok:true,
      entrypoint:COWORK_ENTRYPOINTS[session.entrypointId] || null,
      session:{
        id:session.id,
        entrypointId:session.entrypointId,
        scope:{entityType:session.scopeType,entityId:session.scopeId,sectionId:session.scopeSectionId},
        status:session.status,
        workingBrief:brief,
        state:{
          stage:state.stage || '',
          draftWorkstreams:safeArray(state.draftWorkstreams),
          draftIdentity:state.draftIdentity || null,
          draftPeople:state.draftPeople || null,
          draftNextMove:state.draftNextMove || null,
          draftTranscriptArtifact:state.draftTranscriptArtifact || null
        }
      },
      workItem:workItem ? {
        id:workItem.id,
        type:workItem.workType,
        title:workItem.title,
        status:workItem.status,
        payload:workItem.payloadJson || {},
        sourceRefs:workItem.sourceRefsJson || []
      } : null,
      message,
      question,
      receipt,
      no_external_action:true
    };
  }
  async function openProjectNextMoveEntry(input={}){
    const entry=COWORK_ENTRYPOINTS['project.next_move'];
    const scopeInput=input.scope || {};
    const entityId=compactText(scopeInput.entityId || scopeInput.entity_id || input.projectId || '',220);
    if(!entityId) throw new Error('Project Managers needs the selected project before it can decide the next move.');
    const project=await loadProject(entityId);
    if(!project) throw new Error('VAL could not load the selected project. It did not substitute another project.');
    const brief=buildProjectNextMoveBrief(project,input);
    if(!brief.entityId) throw new Error('The selected project has no durable identifier yet.');
    const state={stage:'next_move',draftNextMove:{...brief.currentProposal},answers:[]};
    const question=nextMoveQuestion(state,brief);
    const now=new Date().toISOString();
    const sc=scope();
    const session=await saveSession({
      id:uuid('cowork'),
      tenantId:sc.tenantId,
      userId:sc.userId,
      entrypointId:entry.id,
      scopeType:entry.scopeType,
      scopeId:brief.entityId,
      scopeSectionId:entry.sectionId,
      status:'needs_input',
      workingBriefJson:brief,
      questionPlanJson:[question],
      stateJson:state,
      createdAt:now,
      updatedAt:now
    });
    const workItem=await saveWorkItem({
      id:uuid('workitem'),
      tenantId:sc.tenantId,
      userId:sc.userId,
      sessionId:session.id,
      workType:'project_next_move',
      title:`Next move for ${brief.projectName}`,
      status:'needs_input',
      payloadJson:{projectId:brief.entityId,projectName:brief.projectName,objective:brief.objective,completionCondition:brief.completionCondition},
      sourceRefsJson:brief.sourceRefs,
      createdAt:now,
      updatedAt:now
    });
    return publicResult(session,workItem,question.question,question);
  }
  async function openProjectIdentityEntry(input={}){
    const entry=COWORK_ENTRYPOINTS['project.identity'];
    const scopeInput=input.scope || {};
    const entityId=compactText(scopeInput.entityId || scopeInput.entity_id || input.projectId || '',220);
    if(!entityId) throw new Error('Project Managers needs the selected project before it can establish its foundation.');
    const project=await loadProject(entityId);
    if(!project) throw new Error('VAL could not load the selected project. It did not substitute another project.');
    const brief=buildProjectIdentityBrief(project,input);
    if(!brief.entityId) throw new Error('The selected project has no durable identifier yet.');
    const state={stage:'identity',draftIdentity:{...brief.currentIdentity},answers:[]};
    const question=projectIdentityQuestion(state,brief);
    const now=new Date().toISOString();
    const sc=scope();
    const session=await saveSession({
      id:uuid('cowork'),tenantId:sc.tenantId,userId:sc.userId,entrypointId:entry.id,scopeType:entry.scopeType,scopeId:brief.entityId,scopeSectionId:entry.sectionId,status:'needs_input',workingBriefJson:brief,questionPlanJson:[question],stateJson:state,createdAt:now,updatedAt:now
    });
    const workItem=await saveWorkItem({
      id:uuid('workitem'),tenantId:sc.tenantId,userId:sc.userId,sessionId:session.id,workType:'project_identity',title:`Project foundation for ${brief.projectName}`,status:'needs_input',
      payloadJson:{projectId:brief.entityId,projectName:brief.projectName,identity:state.draftIdentity,objective:brief.objective,completionCondition:brief.completionCondition},sourceRefsJson:brief.sourceRefs,createdAt:now,updatedAt:now
    });
    return publicResult(session,workItem,question.question,question);
  }
  async function openProjectPeopleEntry(input={}){
    const entry=COWORK_ENTRYPOINTS['project.people'];
    const scopeInput=input.scope || {};
    const entityId=compactText(scopeInput.entityId || scopeInput.entity_id || input.projectId || '',220);
    if(!entityId) throw new Error('Project Managers needs the selected project before it can link people.');
    const project=await loadProject(entityId);
    if(!project) throw new Error('VAL could not load the selected project. It did not substitute another project.');
    const candidates=await loadRelationships({limit:100});
    const brief=buildProjectPeopleBrief(project,candidates,input);
    if(!brief.entityId) throw new Error('The selected project has no durable identifier yet.');
    const state={stage:'people',draftPeople:{people:brief.existingPeople.filter((person)=>person.known),ownerId:'',ownerName:brief.currentOwner,unresolved:[]},answers:[]};
    const question=projectPeopleQuestion(state,brief);
    const now=new Date().toISOString(),sc=scope();
    const session=await saveSession({id:uuid('cowork'),tenantId:sc.tenantId,userId:sc.userId,entrypointId:entry.id,scopeType:entry.scopeType,scopeId:brief.entityId,scopeSectionId:entry.sectionId,status:'needs_input',workingBriefJson:brief,questionPlanJson:[question],stateJson:state,createdAt:now,updatedAt:now});
    const workItem=await saveWorkItem({id:uuid('workitem'),tenantId:sc.tenantId,userId:sc.userId,sessionId:session.id,workType:'project_people',title:`People for ${brief.projectName}`,status:'needs_input',payloadJson:{projectId:brief.entityId,projectName:brief.projectName,people:state.draftPeople.people,objective:brief.objective,completionCondition:brief.completionCondition},sourceRefsJson:brief.sourceRefs,createdAt:now,updatedAt:now});
    return publicResult(session,workItem,question.question,question);
  }
  async function respondProjectPeople(session,workItem,answer){
    const brief=session.workingBriefJson || {};
    const state={...(session.stateJson || {}),answers:safeArray(session.stateJson?.answers)};
    state.answers.push({text:answer,at:new Date().toISOString()});
    const proposal=parseProjectPeople(answer,brief,state.draftPeople || {});
    state.draftPeople=proposal;
    const missing=missingProjectPeopleFields(proposal);
    if(proposal.unresolved.length) state.stage='unresolved';
    else if(missing.includes('roles')) state.stage='roles';
    else if(missing.includes('project owner')) state.stage='owner';
    let question,message='';
    if(!proposal.unresolved.length && !missing.length){
      state.stage='ready_to_apply';session.status='needs_review';workItem.status='needs_review';
      workItem.payloadJson={...workItem.payloadJson,projectId:brief.entityId,projectName:brief.projectName,people:proposal.people,ownerId:proposal.ownerId,ownerName:proposal.ownerName,completionCondition:brief.completionCondition};
      question=projectPeopleQuestion(state,brief);message='VAL prepared the linked people and project owner for review. Apply when this is true.';
    }else{question=projectPeopleQuestion(state,brief);message=question.question;session.status='needs_input';workItem.status='needs_input';}
    session.stateJson=state;session.questionPlanJson=[...(session.questionPlanJson || []),question];session.updatedAt=new Date().toISOString();workItem.updatedAt=new Date().toISOString();
    await saveSession(session);await saveWorkItem(workItem);return publicResult(session,workItem,message,question);
  }
  async function respondProjectIdentity(session,workItem,answer){
    const brief=session.workingBriefJson || {};
    const state={...(session.stateJson || {}),answers:safeArray(session.stateJson?.answers)};
    state.answers.push({text:answer,at:new Date().toISOString()});
    const current=state.draftIdentity || brief.currentIdentity || {};
    if(state.stage === 'identity' || state.stage === 'identity_details'){
      state.draftIdentity=projectIdentityFromAnswer(answer,current,state.stage);
      const missingIdentity=missingProjectIdentityFields(state.draftIdentity).filter((field)=>field !== 'project owner');
      state.stage=missingIdentity.length ? 'identity_details' : 'owner';
    }else if(state.stage === 'owner'){
      state.draftIdentity=projectIdentityFromAnswer(answer,current,'owner');
    }
    const missing=missingProjectIdentityFields(state.draftIdentity);
    let message='';
    let question;
    if(!missing.length){
      state.stage='ready_to_apply';
      session.status='needs_review';
      workItem.status='needs_review';
      workItem.payloadJson={
        ...workItem.payloadJson,
        projectId:brief.entityId,
        projectName:state.draftIdentity.canonicalName,
        identity:state.draftIdentity,
        completionCondition:brief.completionCondition
      };
      message='VAL prepared the selected project foundation for review. Apply it when it is true.';
      question=projectIdentityQuestion(state,brief);
    }else{
      question=projectIdentityQuestion(state,brief);
      message=question.question;
      session.status='needs_input';
      workItem.status='needs_input';
    }
    session.stateJson=state;
    session.questionPlanJson=[...(session.questionPlanJson || []),question];
    session.updatedAt=new Date().toISOString();
    workItem.updatedAt=new Date().toISOString();
    await saveSession(session);
    await saveWorkItem(workItem);
    return publicResult(session,workItem,message,question);
  }
  async function respondProjectNextMove(session,workItem,answer){
    const brief=session.workingBriefJson || {};
    const state={...(session.stateJson || {}),answers:safeArray(session.stateJson?.answers)};
    state.answers.push({text:answer,at:new Date().toISOString()});
    const current=state.draftNextMove || brief.currentProposal || {};
    if(state.stage === 'next_move'){
      const acceptsCurrent=answerAcceptsProposal(answer) && compactText(current.nextMove);
      state.draftNextMove=acceptsCurrent ? {...current} : nextMoveProposalFromAnswer(answer,current);
      if(answerAcceptsProposal(answer) && !compactText(current.nextMove)) state.draftNextMove.nextMove='';
      state.stage='next_move_details';
    }else if(state.stage === 'next_move_details'){
      state.draftNextMove=nextMoveProposalFromAnswer(answer,current);
    }
    const proposal=state.draftNextMove || {};
    const missing=missingNextMoveFields(proposal);
    let message='';
    let question;
    if(state.stage === 'next_move_details' && !missing.length){
      state.stage='ready_to_apply';
      session.status='needs_review';
      workItem.status='needs_review';
      workItem.payloadJson={
        ...workItem.payloadJson,
        projectId:brief.entityId,
        projectName:brief.projectName,
        nextMove:proposal.nextMove,
        accountableOwner:proposal.accountableOwner,
        timingOrTrigger:proposal.timingOrTrigger,
        basis:proposal.basis,
        completionCondition:brief.completionCondition
      };
      message='VAL prepared the next narrow move for review. Apply it when this is true.';
      question=nextMoveQuestion({stage:'ready_to_apply',draftNextMove:proposal},brief);
    }else{
      question=nextMoveQuestion(state,brief);
      message=question.question;
      session.status='needs_input';
      workItem.status='needs_input';
    }
    session.workingBriefJson=brief;
    session.stateJson=state;
    session.questionPlanJson=[...(session.questionPlanJson || []),question];
    session.updatedAt=new Date().toISOString();
    workItem.updatedAt=new Date().toISOString();
    await saveSession(session);
    await saveWorkItem(workItem);
    return publicResult(session,workItem,message,question);
  }
  async function openTranscriptWorkingBriefEntry(input={}){
    const entry=COWORK_ENTRYPOINTS['transcript.working_brief'];
    const scopeInput=input.scope || {};
    const entityId=compactText(scopeInput.entityId || scopeInput.entity_id || input.transcriptId || '',220);
    if(!entityId) throw new Error('Transcripts needs the selected transcript before VAL can prepare its Working Brief.');
    const transcript=await loadTranscript(entityId);
    if(!transcript) throw new Error('VAL could not load the selected transcript. It did not substitute another meeting.');
    const brief=buildTranscriptWorkingBrief(transcript,input);
    if(!brief.entityId) throw new Error('The selected transcript has no durable identifier yet.');
    if(!brief.sourceReceipt.ready) throw new Error('This transcript has no exact Krisp Action Items and Key Points receipt yet. VAL will not invent one.');
    const state={stage:'choose_artifact',draftTranscriptArtifact:null,answers:[]};
    const question=transcriptWorkingBriefQuestion(state,brief);
    const now=new Date().toISOString();
    const sc=scope();
    const session=await saveSession({
      id:uuid('cowork'),tenantId:sc.tenantId,userId:sc.userId,entrypointId:entry.id,scopeType:entry.scopeType,scopeId:brief.entityId,scopeSectionId:entry.sectionId,status:'needs_input',workingBriefJson:brief,questionPlanJson:[question],stateJson:state,createdAt:now,updatedAt:now
    });
    const workItem=await saveWorkItem({
      id:uuid('workitem'),tenantId:sc.tenantId,userId:sc.userId,sessionId:session.id,workType:'transcript_meeting_overview',title:`Meeting overview for ${brief.transcriptTitle}`,status:'needs_input',
      payloadJson:{transcriptId:brief.entityId,transcriptTitle:brief.transcriptTitle,sourceReceipt:brief.sourceReceipt,invitees:brief.invitees,objective:brief.objective,completionCondition:brief.completionCondition},sourceRefsJson:brief.sourceRefs,createdAt:now,updatedAt:now
    });
    return publicResult(session,workItem,question.question,question);
  }
  async function respondTranscriptWorkingBrief(session,workItem,answer){
    const brief=session.workingBriefJson || {};
    const state={...(session.stateJson || {}),answers:safeArray(session.stateJson?.answers)};
    state.answers.push({text:answer,at:new Date().toISOString()});
    if(!confirmsTranscriptMeetingOverview(answer)){
      const question={
        targetField:'transcript_working_brief.prepared_artifact_kind',
        question:'This selected Transcript Working Brief currently prepares one source-preserving result: the attendee meeting overview. Reply "prepare" when you want that exact receipt placed in Leverage for review.',
        detail:'VAL will not turn a freeform transcript conversation into an untracked update. Other transcript outputs will receive their own typed packet routes.'
      };
      session.stateJson=state;
      session.questionPlanJson=[...(session.questionPlanJson || []),question];
      session.updatedAt=new Date().toISOString();
      await saveSession(session);
      return publicResult(session,workItem,question.question,question);
    }
    const receipt=brief.sourceReceipt || {};
    state.stage='ready_to_apply';
    state.draftTranscriptArtifact={kind:'email_draft',source:'exact_krisp_receipt',body:receipt.body || '',actionItems:exactTranscriptLines(receipt.actionItems),keyPoints:exactTranscriptLines(receipt.keyPoints),invitees:safeArray(brief.invitees)};
    session.status='needs_review';
    workItem.status='needs_review';
    workItem.payloadJson={...workItem.payloadJson,preparedArtifact:state.draftTranscriptArtifact};
    const question=transcriptWorkingBriefQuestion(state,brief);
    session.stateJson=state;
    session.questionPlanJson=[...(session.questionPlanJson || []),question];
    session.updatedAt=new Date().toISOString();
    workItem.updatedAt=new Date().toISOString();
    await saveSession(session);
    await saveWorkItem(workItem);
    return publicResult(session,workItem,'VAL prepared the exact Krisp meeting overview for review. Apply it when this is true.',question);
  }
  async function openEntry(input={}){
    const entrypointId=String(input.entrypointId || input.entrypoint_id || '').trim();
    const entry=COWORK_ENTRYPOINTS[entrypointId];
    if(!entry) throw new Error('This Co-Work entry point is not registered.');
    if(entrypointId === 'project.identity') return openProjectIdentityEntry(input);
    if(entrypointId === 'project.people') return openProjectPeopleEntry(input);
    if(entrypointId === 'project.next_move') return openProjectNextMoveEntry(input);
    if(entrypointId === 'transcript.working_brief') return openTranscriptWorkingBriefEntry(input);
    const scopeInput=input.scope || {};
    const entityId=compactText(scopeInput.entityId || scopeInput.entity_id || input.projectId || '',220);
    if(!entityId) throw new Error('Project Managers needs the selected project before it can build workstreams.');
    const project=await loadProject(entityId);
    if(!project) throw new Error('VAL could not load the selected project. It did not substitute another project.');
    const brief=buildProjectWorkstreamsBrief(project,input);
    if(!brief.entityId) throw new Error('The selected project has no durable identifier yet.');
    const initialWorkstreams=safeArray(brief.existingWorkstreams).map((item)=>normalizeWorkstream(item,brief));
    const proposed=uniqueNames(brief.suggestedWorkstreams || initialWorkstreams);
    const stage=brief.desiredOutcome ? 'confirm_lanes' : 'project_outcome';
    const state={stage,draftWorkstreams:initialWorkstreams,proposedWorkstreams:proposed,answers:[]};
    const question=entryQuestion(state,brief);
    const now=new Date().toISOString();
    const sc=scope();
    const session=await saveSession({
      id:uuid('cowork'),
      tenantId:sc.tenantId,
      userId:sc.userId,
      entrypointId,
      scopeType:entry.scopeType,
      scopeId:brief.entityId,
      scopeSectionId:entry.sectionId,
      status:'needs_input',
      workingBriefJson:brief,
      questionPlanJson:[question],
      stateJson:state,
      createdAt:now,
      updatedAt:now
    });
    const workItem=await saveWorkItem({
      id:uuid('workitem'),
      tenantId:sc.tenantId,
      userId:sc.userId,
      sessionId:session.id,
      workType:'project_workstreams',
      title:`Workstreams for ${brief.projectName}`,
      status:'needs_input',
      payloadJson:{projectId:brief.entityId,projectName:brief.projectName,workstreams:initialWorkstreams,objective:brief.objective,completionCondition:brief.completionCondition},
      sourceRefsJson:brief.sourceRefs,
      createdAt:now,
      updatedAt:now
    });
    return publicResult(session,workItem,question.question,question);
  }
  async function respond(sessionId,input={}){
    const answer=multilineText(input.answer || input.message || '',5000);
    if(!answer) throw new Error('VAL needs an answer before it can continue this scoped conversation.');
    const session=await getSession(sessionId);
    if(!session) throw new Error('This Co-Work session no longer exists.');
    const workItem=await findSessionWorkItem(session.id);
    if(!workItem) throw new Error('The prepared work item is missing. Nothing was applied.');
    if(session.entrypointId === 'project.identity') return respondProjectIdentity(session,workItem,answer);
    if(session.entrypointId === 'project.people') return respondProjectPeople(session,workItem,answer);
    if(session.entrypointId === 'project.next_move') return respondProjectNextMove(session,workItem,answer);
    if(session.entrypointId === 'transcript.working_brief') return respondTranscriptWorkingBrief(session,workItem,answer);
    if(session.entrypointId !== 'project.workstreams') throw new Error('This session does not use a registered Project Managers interview.');
    const brief=session.workingBriefJson || {};
    const state={...(session.stateJson || {}),answers:safeArray(session.stateJson?.answers)};
    state.answers.push({text:answer,at:new Date().toISOString()});
    if(state.stage === 'project_outcome'){
      brief.desiredOutcome=answer;
      state.stage='confirm_lanes';
      if(!safeArray(state.proposedWorkstreams).length) state.proposedWorkstreams=uniqueNames(brief.existingWorkstreams || []);
    }else if(state.stage === 'confirm_lanes'){
      const names=answerAcceptsProposal(answer) ? uniqueNames(state.proposedWorkstreams || []) : parseWorkstreamNames(answer);
      if(!names.length){
        const question={
          targetField:'project_workstreams[].name',
          question:'I need the names of the major workstreams before I can build them. List the lanes separated by lines, commas, or semicolons.',
          detail:'Each answer will become a named workstream in Project Managers.'
        };
        session.questionPlanJson=[...(session.questionPlanJson || []),question];
        session.stateJson=state;
        session.updatedAt=new Date().toISOString();
        await saveSession(session);
        return publicResult(session,workItem,question.question,question);
      }
      state.draftWorkstreams=names.map((name)=>{
        const existing=safeArray(state.draftWorkstreams).find((item)=>String(item.name || '').toLowerCase()===name.toLowerCase());
        return normalizeWorkstream(existing || workstreamTemplate(name,brief),brief);
      });
      state.stage='workstream_details';
    }else if(state.stage === 'workstream_details'){
      state.draftWorkstreams=parseLabeledWorkstreamDetails(answer,state.draftWorkstreams).map((item)=>normalizeWorkstream(item,brief));
    }
    const incomplete=safeArray(state.draftWorkstreams).filter((item)=>missingWorkstreamFields(item).length);
    let message='';
    let question;
    if(state.stage === 'workstream_details' && !incomplete.length){
      state.stage='ready_to_apply';
      session.status='needs_review';
      workItem.status='needs_review';
      workItem.payloadJson={
        ...workItem.payloadJson,
        projectId:brief.entityId,
        projectName:brief.projectName,
        desiredOutcome:brief.desiredOutcome,
        workstreams:state.draftWorkstreams,
        completionCondition:brief.completionCondition
      };
      message=`VAL prepared ${state.draftWorkstreams.length} workstream${state.draftWorkstreams.length === 1 ? '' : 's'} for review. Apply them when this is true.`;
      question={targetField:'project_workstreams',question:'Review the prepared workstreams, then apply them to this Project Manager.',detail:'Applying changes only the internal Project Managers packet.'};
    }else{
      question=entryQuestion(state,brief);
      message=question.question;
      session.status='needs_input';
      workItem.status='needs_input';
    }
    session.workingBriefJson=brief;
    session.stateJson=state;
    session.questionPlanJson=[...(session.questionPlanJson || []),question];
    session.updatedAt=new Date().toISOString();
    workItem.updatedAt=new Date().toISOString();
    await saveSession(session);
    await saveWorkItem(workItem);
    return publicResult(session,workItem,message,question);
  }
  async function applyWorkItem(workItemId){
    const workItem=await getWorkItem(workItemId);
    if(!workItem) throw new Error('Prepared work item not found.');
    if(workItem.workType === 'transcript_meeting_overview'){
      if(workItem.status !== 'needs_review') throw new Error('The meeting overview must be reviewed before it can be applied.');
      const session=await getSession(workItem.sessionId);
      if(!session) throw new Error('The Co-Work session for this prepared item is missing.');
      const payload=workItem.payloadJson || {};
      const expectedBody=multilineText(payload.preparedArtifact?.body || payload.sourceReceipt?.body || '',50000);
      if(!expectedBody) throw new Error('The exact Krisp meeting overview is missing and cannot be prepared.');
      const prepared=await prepareTranscriptMeetingOverview({transcriptId:payload.transcriptId || session.scopeId});
      const actualBody=multilineText(prepared?.draft?.body || '',50000);
      if(actualBody !== expectedBody) throw new Error('VAL stopped the draft because it would not preserve the exact Krisp receipt.');
      const now=new Date().toISOString();
      workItem.status='applied';
      workItem.updatedAt=now;
      session.status='completed';
      session.updatedAt=now;
      session.stateJson={...(session.stateJson || {}),stage:'completed',appliedAt:now,draftId:prepared.draft?.id || ''};
      const sc=scope();
      const receipt=await saveReceipt({
        id:uuid('coworkreceipt'),tenantId:sc.tenantId,userId:sc.userId,sessionId:session.id,workItemId:workItem.id,action:'prepare_transcript_meeting_overview',status:'completed',
        summary:`Prepared the exact meeting overview for ${payload.transcriptTitle || 'the selected transcript'} in Leverage. Nothing was sent.`,
        payloadJson:{transcriptId:payload.transcriptId || session.scopeId,draftId:prepared.draft?.id || '',recipientCount:Number(prepared.recipientCount || 0),sourceReceipt:payload.sourceReceipt || {},noExternalAction:true},createdAt:now
      });
      await saveSession(session);
      await saveWorkItem(workItem);
      return {...publicResult(session,workItem,receipt.summary,null,receipt),draft:prepared.draft || null,recipientCount:Number(prepared.recipientCount || 0)};
    }
    if(workItem.workType === 'project_next_move'){
      if(workItem.status !== 'needs_review') throw new Error('The next move must be complete and reviewed before it can be applied.');
      const session=await getSession(workItem.sessionId);
      if(!session) throw new Error('The Co-Work session for this prepared item is missing.');
      const payload=workItem.payloadJson || {};
      const proposal={
        nextMove:compactText(payload.nextMove || '',500),
        accountableOwner:compactText(payload.accountableOwner || '',180),
        timingOrTrigger:compactText(payload.timingOrTrigger || '',300),
        basis:compactText(payload.basis || '',700)
      };
      if(missingNextMoveFields(proposal).length) throw new Error('The next move proposal is incomplete and cannot be applied yet.');
      const project=await applyProjectNextMove({
        projectId:payload.projectId || session.scopeId,
        projectName:payload.projectName || session.workingBriefJson?.projectName || 'Project',
        ...proposal,
        sourceRefs:workItem.sourceRefsJson || [],
        sessionId:session.id,
        workItemId:workItem.id
      });
      if(!project) throw new Error('VAL could not save the next move to the selected Project Manager.');
      const now=new Date().toISOString();
      workItem.status='applied';
      workItem.updatedAt=now;
      session.status='completed';
      session.updatedAt=now;
      session.stateJson={...(session.stateJson || {}),stage:'completed',appliedAt:now};
      const sc=scope();
      const receipt=await saveReceipt({
        id:uuid('coworkreceipt'),
        tenantId:sc.tenantId,
        userId:sc.userId,
        sessionId:session.id,
        workItemId:workItem.id,
        action:'apply_project_next_move',
        status:'completed',
        summary:`Applied the next move to ${payload.projectName || 'the selected Project Manager'}.`,
        payloadJson:{projectId:payload.projectId || session.scopeId,projectName:payload.projectName || '',...proposal,noExternalAction:true},
        createdAt:now
      });
      await saveSession(session);
      await saveWorkItem(workItem);
      return {...publicResult(session,workItem,receipt.summary,null,receipt),project};
    }
    if(workItem.workType === 'project_identity'){
      if(workItem.status !== 'needs_review') throw new Error('The project foundation must be complete and reviewed before it can be applied.');
      const session=await getSession(workItem.sessionId);
      if(!session) throw new Error('The Co-Work session for this prepared item is missing.');
      const payload=workItem.payloadJson || {};
      const identity=projectIdentityFromAnswer('',payload.identity || {},'ready_to_apply');
      if(missingProjectIdentityFields(identity).length) throw new Error('The project foundation is incomplete and cannot be applied yet.');
      const project=await applyProjectIdentity({
        projectId:payload.projectId || session.scopeId,
        projectName:identity.canonicalName,
        purpose:identity.purpose,
        desiredOutcome:identity.desiredOutcome,
        owner:identity.owner,
        sourceRefs:workItem.sourceRefsJson || [],
        sessionId:session.id,
        workItemId:workItem.id
      });
      if(!project) throw new Error('VAL could not save the foundation to the selected Project Manager.');
      const now=new Date().toISOString();
      workItem.status='applied';
      workItem.updatedAt=now;
      session.status='completed';
      session.updatedAt=now;
      session.stateJson={...(session.stateJson || {}),stage:'completed',appliedAt:now};
      const sc=scope();
      const receipt=await saveReceipt({
        id:uuid('coworkreceipt'),tenantId:sc.tenantId,userId:sc.userId,sessionId:session.id,workItemId:workItem.id,action:'apply_project_identity',status:'completed',
        summary:`Applied the project foundation to ${identity.canonicalName}.`,
        payloadJson:{projectId:payload.projectId || session.scopeId,projectName:identity.canonicalName,identity,noExternalAction:true},createdAt:now
      });
      await saveSession(session);
      await saveWorkItem(workItem);
      return {...publicResult(session,workItem,receipt.summary,null,receipt),project};
    }
    if(workItem.workType === 'project_people'){
      if(workItem.status !== 'needs_review') throw new Error('The project people must be complete and reviewed before they can be applied.');
      const session=await getSession(workItem.sessionId);
      if(!session) throw new Error('The Co-Work session for this prepared item is missing.');
      const payload=workItem.payloadJson || {};
      const proposal={people:safeArray(payload.people),ownerId:compactText(payload.ownerId || '',220),ownerName:compactText(payload.ownerName || '',180)};
      if(missingProjectPeopleFields(proposal).length) throw new Error('The project people proposal is incomplete and cannot be applied yet.');
      const project=await applyProjectPeople({projectId:payload.projectId || session.scopeId,projectName:payload.projectName || session.workingBriefJson?.projectName || 'Project',...proposal,sourceRefs:workItem.sourceRefsJson || [],sessionId:session.id,workItemId:workItem.id});
      if(!project) throw new Error('VAL could not save the people to the selected Project Manager.');
      const now=new Date().toISOString();workItem.status='applied';workItem.updatedAt=now;session.status='completed';session.updatedAt=now;session.stateJson={...(session.stateJson || {}),stage:'completed',appliedAt:now};
      const sc=scope();const receipt=await saveReceipt({id:uuid('coworkreceipt'),tenantId:sc.tenantId,userId:sc.userId,sessionId:session.id,workItemId:workItem.id,action:'apply_project_people',status:'completed',summary:`Applied ${proposal.people.length} linked people and the owner to ${payload.projectName || 'the selected Project Manager'}.`,payloadJson:{projectId:payload.projectId || session.scopeId,projectName:payload.projectName || '',people:proposal.people,ownerId:proposal.ownerId,noExternalAction:true},createdAt:now});
      await saveSession(session);await saveWorkItem(workItem);return {...publicResult(session,workItem,receipt.summary,null,receipt),project};
    }
    if(workItem.workType !== 'project_workstreams') throw new Error('This work item cannot apply project workstreams.');
    if(workItem.status !== 'needs_review') throw new Error('Workstreams must be complete and reviewed before they can be applied.');
    const session=await getSession(workItem.sessionId);
    if(!session) throw new Error('The Co-Work session for this prepared item is missing.');
    const payload=workItem.payloadJson || {};
    const workstreams=safeArray(payload.workstreams).map((item)=>normalizeWorkstream(item,session.workingBriefJson || {}));
    if(!workstreams.length || workstreams.some((item)=>missingWorkstreamFields(item).length)) throw new Error('The workstream proposal is incomplete and cannot be applied yet.');
    const project=await applyProjectWorkstreams({
      projectId:payload.projectId || session.scopeId,
      projectName:payload.projectName || session.workingBriefJson?.projectName || 'Project',
      desiredOutcome:payload.desiredOutcome || session.workingBriefJson?.desiredOutcome || '',
      workstreams,
      sourceRefs:workItem.sourceRefsJson || [],
      sessionId:session.id,
      workItemId:workItem.id
    });
    if(!project) throw new Error('VAL could not save the workstreams to the selected Project Manager.');
    const now=new Date().toISOString();
    workItem.status='applied';
    workItem.updatedAt=now;
    session.status='completed';
    session.updatedAt=now;
    session.stateJson={...(session.stateJson || {}),stage:'completed',appliedAt:now};
    const sc=scope();
    const receipt=await saveReceipt({
      id:uuid('coworkreceipt'),
      tenantId:sc.tenantId,
      userId:sc.userId,
      sessionId:session.id,
      workItemId:workItem.id,
      action:'apply_project_workstreams',
      status:'completed',
      summary:`Applied ${workstreams.length} workstream${workstreams.length === 1 ? '' : 's'} to ${payload.projectName || 'the selected Project Manager'}.`,
      payloadJson:{projectId:payload.projectId || session.scopeId,projectName:payload.projectName || '',workstreams,noExternalAction:true},
      createdAt:now
    });
    await saveSession(session);
    await saveWorkItem(workItem);
    return {...publicResult(session,workItem,receipt.summary,null,receipt),project};
  }
  return {openEntry,respond,applyWorkItem,getSession,COWORK_ENTRYPOINTS};
}

module.exports={
  COWORK_ENTRYPOINTS,
  buildProjectIdentityBrief,
  buildProjectPeopleBrief,
  buildTranscriptWorkingBrief,
  buildProjectWorkstreamsBrief,
  createValCoworkService,
  entryQuestion,
  missingProjectIdentityFields,
  missingProjectPeopleFields,
  missingWorkstreamFields,
  normalizeWorkstream,
  parseLabeledWorkstreamDetails,
  parseWorkstreamNames
};
