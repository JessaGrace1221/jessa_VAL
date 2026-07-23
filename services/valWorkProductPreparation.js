function safeArray(value){return Array.isArray(value)?value:[];}
function objectValue(value){return value&&typeof value==='object'&&!Array.isArray(value)?value:{};}
function compactText(value,limit=1200){return String(value||'').replace(/\s+/g,' ').trim().slice(0,limit);}
function hasValue(value){
  if(value===undefined||value===null)return false;
  if(Array.isArray(value))return value.length>0;
  if(typeof value==='object')return Object.keys(value).length>0;
  return String(value).trim()!=='';
}
function firstValue(...values){return values.find(hasValue);}
function unique(values=[]){return [...new Set(values.filter(Boolean))];}
function emailDomain(email=''){return String(email).split('@')[1]?.toLowerCase()||'';}

function normalizedSourceRef(ref={}){
  return {
    source_type:compactText(ref.source_type||ref.sourceType||ref.type||'unknown',80),
    source_id:compactText(ref.source_id||ref.sourceId||ref.id||'',320),
    quote_or_summary:compactText(ref.quote_or_summary||ref.quoteOrSummary||ref.summary||ref.quote||'',900),
    url:compactText(ref.url||ref.source_url||ref.sourceUrl||'',1600),
    confidence:Math.max(0,Math.min(1,Number(ref.confidence)||0)),
    retrieved_at:ref.retrieved_at||ref.retrievedAt||ref.created_at||ref.createdAt||''
  };
}

function normalizedResearchResult(result={}){
  return {
    title:compactText(result.title||result.name||'',320),
    url:compactText(result.url||result.link||result.source_url||result.sourceUrl||'',1600),
    snippet:compactText(result.snippet||result.description||result.summary||result.text||'',1600),
    query:compactText(result.query||result.search_query||result.searchQuery||'',500),
    retrieved_at:result.retrieved_at||result.retrievedAt||result.created_at||result.createdAt||'',
    identity_confidence:Math.max(0,Math.min(1,Number(result.identity_confidence||result.identityConfidence||result.confidence)||0))
  };
}

function relationshipCandidates(context={}){
  const linked=objectValue(context.linked_context||context.linkedContext);
  const relationship=objectValue(context.relationship||context.contact||context.person);
  return safeArray(linked.relationships)
    .concat(safeArray(context.relationships),safeArray(context.linked_people||context.linkedPeople),Object.keys(relationship).length?[relationship]:[])
    .filter(item=>item&&typeof item==='object');
}

function projectCandidate(context={}){
  const linked=objectValue(context.linked_context||context.linkedContext);
  const scope=objectValue(context.scope);
  return objectValue(firstValue(linked.project,context.project,safeArray(context.linked_projects||context.linkedProjects)[0],scope.project));
}

function researchIdentity(target={},context={}){
  const person=relationshipCandidates(context)[0]||{};
  const targetValue=typeof target==='string'?target:'';
  const targetObject=objectValue(target);
  const email=compactText(firstValue(targetObject.email,person.email,context.verified_email,context.verifiedEmail,/\S+@\S+\.\S+/.test(targetValue)?targetValue:'')||'',320);
  return {
    person_name:compactText(firstValue(targetObject.name,person.name,context.person_name,context.personName,!email?targetValue:'')||'',240),
    verified_email:email,
    verified_domain:compactText(firstValue(targetObject.domain,person.domain,context.verified_domain,context.verifiedDomain,emailDomain(email))||'',240),
    known_linkedin_url:compactText(firstValue(targetObject.linkedin_url,targetObject.linkedinUrl,person.linkedin_url,person.linkedinUrl,context.known_linkedin_url,context.knownLinkedinUrl)||'',1600),
    identity_confidence:Math.max(0,Math.min(1,Number(firstValue(context.identity_confidence,context.identityConfidence,targetObject.identity_confidence,targetObject.identityConfidence,person.identity_confidence,person.identityConfidence)||0)))
  };
}

function buildResearchHandoff(input={}){
  const context=objectValue(input.context);
  const packet=objectValue(context.research_packet||context.researchPacket);
  const identity={...researchIdentity(input.target,context),...objectValue(packet.identity)};
  const sourceResults=safeArray(firstValue(packet.source_results,packet.sourceResults,context.source_results,context.sourceResults,context.results)).map(normalizedResearchResult).filter(result=>result.title||result.url||result.snippet);
  const findings=safeArray(firstValue(packet.verified_findings,packet.verifiedFindings,context.verified_findings,context.verifiedFindings,context.findings)).map(value=>compactText(typeof value==='string'?value:value.summary||value.finding,1600)).filter(Boolean);
  const conflicts=safeArray(firstValue(packet.conflicts,context.conflicts)).map(value=>compactText(typeof value==='string'?value:value.summary||value.reason,900)).filter(Boolean);
  const queries=unique(safeArray(firstValue(packet.queries,context.queries)).map(value=>compactText(value,500)));
  const sourceRefs=safeArray(input.sourceRefs).map(normalizedSourceRef);
  const hasEvidence=sourceResults.length>0||findings.length>0;
  const noResultReason=compactText(firstValue(packet.no_result_reason,packet.noResultReason,context.no_result_reason,context.noResultReason)||'',900);
  return {
    kind:'research_handoff',
    title:compactText(input.title||`Research handoff${identity.person_name?` for ${identity.person_name}`:''}`,320),
    source_channel:compactText(input.sourceChannel||'',80),
    source_type:compactText(input.sourceType||'',120),
    source_id:compactText(input.sourceId||'',320),
    instruction:compactText(input.instruction||'',4000),
    research_question:compactText(firstValue(packet.research_question,packet.researchQuestion,context.research_question,context.researchQuestion,input.instruction)||'',1600),
    identity,
    queries,
    freshness_window:compactText(firstValue(packet.freshness_window,packet.freshnessWindow,context.freshness_window,context.freshnessWindow,'current unless the request specifies otherwise')||'',240),
    allowed_sources:unique(safeArray(firstValue(packet.allowed_sources,packet.allowedSources,context.allowed_sources,context.allowedSources)).map(value=>compactText(value,240))),
    source_results:sourceResults,
    verified_findings:findings,
    conflicts,
    no_result_reason:noResultReason||(!hasEvidence?'Research has not returned verified findings yet.':''),
    completion_status:hasEvidence?'complete_for_review':'ready_for_research',
    handoff_status:hasEvidence?'findings_ready':'research_needed',
    source_refs:sourceRefs,
    linked_context:objectValue(context.linked_context||context.linkedContext),
    continuation_task:objectValue(context.continuation_task||context.continuationTask),
    downstream_action_requires_separate_approval:true,
    external_send:false,
    no_external_action:true
  };
}

function repositoryIdentity(target={},context={}){
  const project=projectCandidate(context);
  const targetObject=objectValue(target);
  const repository=objectValue(context.repository||context.github_repository||context.githubRepository);
  return {
    name:compactText(firstValue(targetObject.repository,targetObject.repo,repository.full_name,repository.fullName,context.repository,context.repo,project.repository,project.repo)||'',320),
    url:compactText(firstValue(targetObject.repository_url,targetObject.repositoryUrl,repository.url,context.repository_url,context.repositoryUrl,project.repository_url,project.repositoryUrl)||'',1600),
    owner:compactText(firstValue(repository.owner,context.repository_owner,context.repositoryOwner)||'',160),
    base_branch:compactText(firstValue(repository.base_branch,repository.baseBranch,context.base_branch,context.baseBranch,'main')||'',160)
  };
}

function textList(...values){return safeArray(firstValue(...values)).map(value=>compactText(typeof value==='string'?value:value.path||value.summary||value.title,900)).filter(Boolean);}

function buildEngineeringBrief(input={}){
  const context=objectValue(input.context);
  const brief=objectValue(context.engineering_brief||context.engineeringBrief||context.workingBrief);
  const linkedContext=objectValue(context.linked_context||context.linkedContext);
  const repository=repositoryIdentity(input.target,context);
  const project=projectCandidate(context);
  const files=unique(textList(brief.files,brief.paths,context.files,context.paths));
  const acceptance=textList(brief.acceptance_criteria,brief.acceptanceCriteria,context.acceptance_criteria,context.acceptanceCriteria);
  const tests=textList(brief.test_plan,brief.testPlan,context.test_plan,context.testPlan);
  const constraints=textList(brief.constraints,context.constraints);
  const dependencies=textList(brief.dependencies,context.dependencies);
  const risks=textList(brief.risks,context.risks);
  const missing=[];
  if(!repository.name&&!repository.url)missing.push('Confirm the GitHub repository.');
  if(!project.id&&!project.name)missing.push('Confirm the project this work belongs to.');
  if(!files.length)missing.push('Confirm the files or code area that should change.');
  if(!acceptance.length)missing.push('Confirm the acceptance criteria.');
  if(!tests.length)missing.push('Confirm the test plan.');
  return {
    kind:'engineering_brief',
    title:compactText(input.title||'Engineering brief',320),
    objective:compactText(firstValue(brief.objective,context.objective,input.instruction)||'',2400),
    source_channel:compactText(input.sourceChannel||'',80),
    source_type:compactText(input.sourceType||'',120),
    source_id:compactText(input.sourceId||'',320),
    source_refs:safeArray(input.sourceRefs).map(normalizedSourceRef),
    target_system:'github',
    github_runtime_connection:'not_connected',
    repository,
    working_branch:compactText(firstValue(brief.working_branch,brief.workingBranch,context.working_branch,context.workingBranch)||'',200),
    files,
    constraints,
    acceptance_criteria:acceptance,
    dependencies,
    risks,
    test_plan:tests,
    project:{id:compactText(project.id||project.projectId||'',320),name:compactText(project.name||project.title||'',320)},
    linked_context:linkedContext,
    continuation_task:objectValue(context.continuation_task||context.continuationTask),
    missing_inputs:missing,
    completion_status:missing.length?'partial_needs_context':'ready_for_implementation_review',
    execution_boundary:'prepare_only',
    approval_checkpoints:['prepare_patch','run_tests','commit','push','open_pull_request','deploy'],
    implementation_requires_explicit_approval:true,
    github_connection_required:true,
    no_shell_execution:true,
    no_git_write:true,
    no_deploy:true,
    no_external_action:true
  };
}

function buildWorkProductArtifact(input={}){
  if(input.actionType==='research')return buildResearchHandoff(input);
  if(input.actionType==='prepare_code')return buildEngineeringBrief(input);
  return null;
}

module.exports={buildWorkProductArtifact,buildResearchHandoff,buildEngineeringBrief,normalizedResearchResult,normalizedSourceRef};
