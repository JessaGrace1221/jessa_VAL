'use strict';

const {normalizeEmailAddress,isReliablePersonName}=require('./leadContactValidation');
const VERSION='grace-lrt-2026-11-06-v2';
const AUTHORITY=/\b(owner|(?:co[- ]?)?founder|ceo|coo|cfo|cro|cio|cto|chief\s+[\w ]+officer|president|principal|managing partner|executive director|vice president|vp|head of (?:sales|growth|revenue|operations|technology|it)|director of (?:sales|growth|revenue|operations|technology|it))\b/i;
const JUNIOR=/\b(assistant|intern|representative|associate|coordinator|specialist|account executive|account manager)\b/i;
const ARRAY=value=>Array.isArray(value)?value:[];
function webUrl(value){try{const url=new URL(String(value||''));return /^https?:$/.test(url.protocol)?url.href:'';}catch{return '';}}
function domain(value){try{return new URL(/^https?:\/\//i.test(value)?value:'https://'+value).hostname.toLowerCase().replace(/^www\./,'');}catch{return '';}}
function sameName(a,b){const clean=v=>String(v||'').toLowerCase().replace(/[^a-z0-9]/g,'');return Boolean(clean(a)&&clean(a)===clean(b));}
function sameDomain(a,b){const x=domain(a),y=domain(b);return Boolean(x&&y&&(x===y||x.endsWith('.'+y)||y.endsWith('.'+x)));}
function linkedEvidence(rows){return ARRAY(rows).filter(row=>webUrl(row.source_url||row.sourceUrl||row.url||row.source)&&String(row.observation||row.evidence||row.claim||row.summary||'').trim());}
function authorityTitle(title){return AUTHORITY.test(title||'')&&!JUNIOR.test(title||'');}
function verifiedDecisionMaker(p){
  const name=p.decisionMakerName||p.primaryContact||'',title=p.decisionMakerTitle||p.title||'';
  if(!isReliablePersonName(name,p.organizationName||p.companyName)||!authorityTitle(title))return false;
  const research=p.aiDecisionMakerResearch||{},identity=research.company_identity||{};
  if(identity.exact_company_matched===false)return false;
  const person=research.decision_maker?.preferred_person||{};
  const ai=sameName(name,person.name)&&authorityTitle(person.title)&&/^(high|medium|strong|verified)\b/i.test(person.confidence||'')&&ARRAY(person.source_urls).some(webUrl)&&identity.exact_company_matched===true;
  const rr=p.rocketReach?.data||{};
  const provider=rr.found===true&&sameName(name,rr.name)&&authorityTitle(rr.title)&&sameDomain(p.website,rr.companyDomain||rr.current_employer_domain||rr.companyWebsite||rr.website||p.email?.split('@')[1]);
  return Boolean(ai||provider);
}
function emailMatchesPerson(p){
  const email=normalizeEmailAddress(p.email),rr=p.rocketReach?.data||{},person=p.aiDecisionMakerResearch?.decision_maker?.preferred_person||{};
  if(!email||!sameDomain(email.split('@')[1],p.website))return false;
  const provider=rr.found===true&&sameName(p.decisionMakerName,rr.name)&&normalizeEmailAddress(rr.email)===email;
  const publicMatch=normalizeEmailAddress(person.email)===email&&p.emailVerification?.status==='publicly_listed';
  return Boolean(provider||publicMatch);
}
function commercialAdmission(p){
  const q=p.aiDecisionMakerResearch?.qualification||{};
  const rejected=q.outbound_ready===false||/not recommended|reject|unsupported|unlikely/i.test([q.status,q.annual_unlock_assessment].join(' '));
  const estimate=Number(q.annual_unlock_estimate);
  const annualEvidence=linkedEvidence(q.annual_unlock_evidence);
  const revenueEvidence=linkedEvidence(q.revenue_fit_evidence);
  const convergenceEvidence=linkedEvidence(q.convergence_fit_evidence);
  const dualFit=revenueEvidence.length>0&&convergenceEvidence.length>0;
  const supported=Number.isFinite(estimate)&&estimate>=100000&&annualEvidence.length>0&&String(q.annual_unlock_reasoning||'').trim().length>=30&&/^(strongly plausible|plausible|supported|confirmed)$/i.test(q.annual_unlock_assessment||'');
  return {dualFit,estimatedAnnualUnlock:supported?estimate:0,rejected,supported,annualEvidence,revenueEvidence,convergenceEvidence};
}
function stripSubject(value=''){
  return String(value||'').replace(/^\s*(?:\*\*)?subject(?:\*\*)?\s*[:\-]\s*[^\r\n]*(?:\r?\n|$)\s*/i,'').trim();
}
function packetReady(p){
  if(!p)return false;
  const caveat=[p.caveats,p.confidence].join(' ');
  if(/\b(pattern|guessed|unverified|not verified|verify|cannot verify|not publicly listed)\b/i.test(caveat))return false;
  const verification=p.contactVerification||{};
  return Boolean(p.companyName&&webUrl(p.website)&&isReliablePersonName(p.decisionMakerName,p.companyName)&&p.decisionMakerTitle&&normalizeEmailAddress(p.decisionMakerEmail)&&sameDomain(p.decisionMakerEmail.split('@')[1],p.website)&&/^(provider_matched|publicly_listed)$/.test(verification.status||'')&&webUrl(verification.sourceUrl)&&linkedEvidence(p.evidence).length&&(p.trigger||p.whyNow)&&p.whyItFitsProspect&&stripSubject(p.firstMessageGraceWouldSend).length>=80);
}
function mappedFields(fields,definitions,ids){
  const out=[];
  for(const [key,value] of Object.entries(fields)){
    let field=definitions.find(f=>f.fieldKey==='contact.'+key)||definitions.find(f=>f.id===ids[key]);
    if(key==='gi_review_status')field=definitions.find(f=>f.fieldKey==='contact.gi_review_status');
    if(!field){if(key.startsWith('gi_'))throw Error('Missing Grace custom field: '+key);continue;}
    let mapped=value??'';
    if(key==='gi_val_fit_tier')mapped=Number(fields.gi_val_fit_score)>=80?'A':Number(fields.gi_val_fit_score)>=65?'B':Number(fields.gi_val_fit_score)>=50?'C':'D';
    if(key==='gi_revenue_leak_potential')mapped=/^high$/i.test(value)?'High':/^meaningful|^medium/i.test(value)?'Medium':'Low';
    if(key==='gi_audit_priority')mapped=/^A|^Critical/.test(value)?'Critical':/^B|^High/.test(value)?'High':/^C|^Medium/.test(value)?'Medium':'Low';
    if(key==='gi_disc_estimate')mapped=ARRAY(field.picklistOptions).find(option=>String(option).startsWith(String(value||'').charAt(0)))||'';
    if(key==='gi_enrichment_status')mapped=/^(approved|rejected|needs_review|enriched)$/.test(value)?value:'needs_review';
    if(key==='gi_fit_confidence')mapped=/^high/i.test(value)?'High':/^medium/i.test(value)?'Medium':'Low';
    if(field.dataType==='DATE'&&mapped)mapped=String(mapped).slice(0,10);
    const options=ARRAY(field.picklistOptions);
    if(mapped!==''&&options.length&&!options.includes(mapped))throw Error('Unsupported value for '+field.fieldKey+': '+mapped);
    out.push({id:field.id,key:field.fieldKey,field_value:mapped});
  }
  return out;
}
module.exports={VERSION,webUrl,domain,sameDomain,sameName,linkedEvidence,authorityTitle,verifiedDecisionMaker,emailMatchesPerson,commercialAdmission,stripSubject,packetReady,mappedFields};
