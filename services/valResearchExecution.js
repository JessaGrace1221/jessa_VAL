function safeArray(value){return Array.isArray(value)?value:[];}
function objectValue(value){return value&&typeof value==='object'&&!Array.isArray(value)?value:{};}
function compactText(value,limit=1200){return String(value||'').replace(/\s+/g,' ').trim().slice(0,limit);}
function unique(values=[]){return [...new Set(values.map(value=>compactText(value,1600)).filter(Boolean))];}
function normalizedUrl(value=''){
  const raw=compactText(value,1600);
  if(!raw)return '';
  try{
    const url=new URL(raw);
    if(!/^https?:$/.test(url.protocol))return '';
    url.hash='';
    return url.toString();
  }catch(_){return '';}
}
function normalizedLinkedInSlug(value=''){
  const match=normalizedUrl(value).match(/linkedin\.com\/in\/([^/?#]+)/i);
  return match?match[1].toLowerCase():'';
}
function emailDomain(value=''){return compactText(value,320).split('@')[1]?.toLowerCase()||'';}
function normalizedIdentity(value={}){
  const identity=objectValue(value);
  const verifiedEmail=compactText(identity.verified_email||identity.verifiedEmail||identity.email,320).toLowerCase();
  return {
    person_name:compactText(identity.person_name||identity.personName||identity.name,240),
    verified_email:verifiedEmail,
    verified_domain:compactText(identity.verified_domain||identity.verifiedDomain||identity.domain||emailDomain(verifiedEmail),240).toLowerCase(),
    known_linkedin_url:normalizedUrl(identity.known_linkedin_url||identity.knownLinkedinUrl||identity.linkedin_url||identity.linkedinUrl),
    identity_confidence:Math.max(0,Math.min(1,Number(identity.identity_confidence||identity.identityConfidence)||0))
  };
}
function identityQueries(identity={},researchQuestion=''){
  const name=identity.person_name;
  const email=identity.verified_email;
  const domain=identity.verified_domain;
  const slug=normalizedLinkedInSlug(identity.known_linkedin_url);
  return unique([
    researchQuestion,
    slug?`site:linkedin.com/posts "${slug}"`:'',
    identity.known_linkedin_url?`"${identity.known_linkedin_url}"`:'',
    email?`"${email}"`:'',
    name&&domain?`"${name}" ${domain}`:'',
    name?`"${name}"`:''
  ]).slice(0,6);
}
function nameTokens(value=''){
  return compactText(value,240).toLowerCase().split(/[^a-z0-9]+/).filter(token=>token.length>1);
}
function resultIdentityConfidence(result={},identity={}){
  const url=normalizedUrl(result.url||result.link||result.source_url||result.sourceUrl);
  if(!url)return {accepted:false,confidence:0,reason:'missing_source_url'};
  const text=[result.title,result.snippet,result.description,result.summary,url].map(value=>compactText(value,1800).toLowerCase()).join(' ');
  const linkedInSlug=normalizedLinkedInSlug(identity.known_linkedin_url);
  if(linkedInSlug&&new RegExp(`linkedin\\.com/(?:in|posts)/[^\\s]*${linkedInSlug.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}`,'i').test(url)){
    return {accepted:true,confidence:0.99,reason:'known_linkedin_url_match'};
  }
  if(identity.verified_email&&text.includes(identity.verified_email))return {accepted:true,confidence:0.98,reason:'verified_email_match'};
  const host=(()=>{try{return new URL(url).hostname.toLowerCase().replace(/^www\./,'');}catch(_){return '';}})();
  const domainMatch=identity.verified_domain&&(host===identity.verified_domain||host.endsWith(`.${identity.verified_domain}`)||text.includes(identity.verified_domain));
  const tokens=nameTokens(identity.person_name);
  const nameMatch=tokens.length>=2&&tokens.every(token=>text.includes(token));
  if(domainMatch&&nameMatch)return {accepted:true,confidence:0.94,reason:'verified_name_and_domain_match'};
  if(nameMatch&&/linkedin\.com$/i.test(host))return {accepted:true,confidence:0.88,reason:'verified_name_and_linkedin_match'};
  return {accepted:false,confidence:0,reason:'identity_not_verified'};
}
function normalizedResult(result={},identity={}){
  const identityMatch=resultIdentityConfidence(result,identity);
  if(!identityMatch.accepted)return null;
  const url=normalizedUrl(result.url||result.link||result.source_url||result.sourceUrl);
  return {
    title:compactText(result.title||result.name||url,320),
    url,
    snippet:compactText(result.snippet||result.description||result.summary||result.text,1600),
    query:compactText(result.query||result.search_query||result.searchQuery,500),
    retrieved_at:result.retrieved_at||result.retrievedAt||result.completedAt||new Date().toISOString(),
    identity_confidence:identityMatch.confidence,
    identity_basis:identityMatch.reason
  };
}
function sourceRefForResult(result={}){
  return {
    source_type:'outscraper_google_search_result',
    source_id:result.url,
    quote_or_summary:compactText([result.title,result.snippet].filter(Boolean).join(': '),900),
    url:result.url,
    confidence:result.identity_confidence,
    retrieved_at:result.retrieved_at
  };
}
function findingForResult(result={}){
  return compactText([result.title,result.snippet].filter(Boolean).join(': '),1600);
}
function finishResearchHandoff(artifact={},execution={}){
  const identity=normalizedIdentity(artifact.identity);
  const rawResults=safeArray(execution.results);
  const verifiedResults=rawResults.map(result=>normalizedResult(result,identity)).filter(Boolean).filter((result,index,array)=>array.findIndex(item=>item.url===result.url)===index);
  const rejectedCount=Math.max(0,rawResults.length-verifiedResults.length);
  const verifiedFindings=unique(verifiedResults.map(findingForResult));
  const completedAt=execution.completedAt||new Date().toISOString();
  const noResultReason=verifiedResults.length?'':compactText(execution.error||execution.noResultReason||(rawResults.length?'Results returned, but none could be tied safely to the verified identity.':'No verified public results were returned.'),900);
  return {
    ...artifact,
    identity,
    queries:unique(safeArray(execution.queries).length?execution.queries:artifact.queries),
    source_results:verifiedResults,
    verified_findings:verifiedFindings,
    conflicts:unique(safeArray(artifact.conflicts).concat(safeArray(execution.conflicts))),
    no_result_reason:noResultReason,
    completion_status:verifiedResults.length?'complete_for_review':'complete_no_verified_result',
    handoff_status:verifiedResults.length?'findings_ready':'no_verified_findings',
    research_provider:'outscraper_google_search',
    research_completed_at:completedAt,
    rejected_unverified_result_count:rejectedCount,
    source_refs:safeArray(artifact.source_refs).concat(verifiedResults.map(sourceRefForResult)),
    downstream_action_requires_separate_approval:true,
    external_send:false,
    no_external_action:true
  };
}
function createValResearchExecution({runSearch,logger=console}={}){
  if(typeof runSearch!=='function')throw new Error('Research execution requires a search runner.');
  async function execute({candidate={},artifact={},force=false}={}){
    const handoff=objectValue(artifact);
    const identity=normalizedIdentity(handoff.identity);
    const queries=unique(safeArray(handoff.queries).concat(identityQueries(identity,handoff.research_question||candidate.instruction))).slice(0,6);
    if(!queries.length){
      return finishResearchHandoff(handoff,{queries,results:[],noResultReason:'VAL needs a verified person, email, domain, LinkedIn URL, or specific research query before research can run.'});
    }
    let search;
    try{
      search=await runSearch(queries,{force,label:`Research handoff for ${identity.person_name||identity.verified_email||candidate.id||'selected context'}`});
    }catch(error){
      logger.warn?.('[val-research-execution] research runner failed',error.message);
      search={queries,results:[],error:error.message};
    }
    return finishResearchHandoff(handoff,{
      queries:search?.queries||queries,
      results:safeArray(search?.results),
      error:search?.error||'',
      completedAt:new Date().toISOString()
    });
  }
  return {execute};
}

module.exports={createValResearchExecution,finishResearchHandoff,normalizedIdentity,resultIdentityConfidence,identityQueries};
