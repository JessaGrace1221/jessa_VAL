'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const {createGhlMcpService} = require('../services/ghlMcpService');
const {
  normalizeEmailAddress,
  normalizePhoneNumber,
  sanitizeDecisionMaker,
  validEmail,
  validPhone
} = require('../services/leadContactValidation');

const args = new Map(process.argv.slice(2).map(arg => {
  const [key, ...rest] = arg.replace(/^--/, '').split('=');
  return [key, rest.length ? rest.join('=') : 'true'];
}));

const WRITE = args.get('write') === 'true';
const LIMIT = Math.max(1, Math.min(500, Number(args.get('limit')) || 500));
const CONTACT_QUERY = args.get('query') || 'Limitless';
const TARGET_TAG = String(args.get('tag') || 'limitless leads').toLowerCase();
const CONCURRENCY = Math.max(1, Math.min(4, Number(args.get('concurrency')) || 2));
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || '';
const GEMINI_GROUNDED_MODEL = args.get('model') || process.env.GEMINI_GROUNDED_MODEL || process.env.GEMINI_MODEL || 'gemini-3.5-flash';
const GEMINI_FALLBACK_MODELS = String(process.env.GEMINI_FALLBACK_MODELS || 'gemini-flash-latest,gemini-2.5-flash-lite').split(',').map(v => v.trim()).filter(Boolean);
const GHL_LOC = process.env.GHL_LOC || process.env.GHL_LOCATION_ID || '';

const GHL_FIELD_KEYS = {
  painpoint:'contact.painpoint',
  decision_maker_first_name:'contact.decision_maker_first_name',
  decision_maker_last_name:'contact.decision_maker_last_name',
  decision_maker_name:'contact.decision_maker_name',
  decision_maker_title:'contact.decision_maker_title',
  decision_maker_email:'contact.decision_maker_email',
  decision_maker_phone:'contact.decision_maker_phone',
  ai_exact_industry:'contact.ai_exact_industry',
  industry:'contact.industry',
  company_signals:'contact.company_signals',
  enrichment_data:'contact.enrichment_data',
  raw_enrichment_notes:'contact.raw_enrichment_notes',
  call_script_angle:'contact.call_script_angle',
  recommended_outreach_angle:'contact.recommended_outreach_angle',
  ai_company_summary:'contact.ai_company_summary',
  call_script:'contact.call_script',
  lead_enrichment_status:'contact.lead_enrichment_status',
  lead_last_processed_at:'contact.lead_last_processed_at'
};

const FIELD_ALIASES = {
  painpoint:['painpoint','pain point'],
  decision_maker_first_name:['decision maker first name','decision maker s first name','decision_maker_first_name'],
  decision_maker_last_name:['decision maker last name','decision maker s last name','decision_maker_last_name'],
  decision_maker_name:['decision maker name','decision_maker_name'],
  decision_maker_title:['decision maker title','decision_maker_title'],
  decision_maker_email:['decision maker email','decision maker email address','decision_maker_email'],
  decision_maker_phone:['decision maker phone','decision maker phone number','decision_maker_phone'],
  ai_exact_industry:['ai exact industry','ai_exact_industry'],
  industry:['industry'],
  company_signals:['company signals','company_signals'],
  enrichment_data:['enrichment data','enrichment_data'],
  raw_enrichment_notes:['raw enrichment notes','raw_enrichment_notes'],
  call_script_angle:['call script angle','call_script_angle'],
  recommended_outreach_angle:['recommended outreach angle','recommended_outreach_angle'],
  ai_company_summary:['ai company summary','ai_company_summary'],
  call_script:['call script','call_script'],
  lead_enrichment_status:['lead enrichment status','lead_enrichment_status'],
  lead_last_processed_at:['lead last processed at','lead_last_processed_at']
};

function normalizeFieldName(value){
  return String(value || '').toLowerCase().replace(/\([^)]*\)/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim();
}

function cleanText(value, limit = 1000){
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, limit);
}

function jsonArrayValue(value){
  if(Array.isArray(value)) return value.filter(Boolean);
  if(value && typeof value === 'object') return Object.values(value).filter(Boolean);
  if(!value) return [];
  return [String(value)];
}

function decisionArrayValue(value){
  return jsonArrayValue(value);
}

function goallPainpointForMessaging(value = ''){
  let text = String(value || '').replace(/\s+/g, ' ').trim().replace(/[.!?]+$/, '');
  if(!text) return '';
  text = text
    .replace(/^a\s+(?:challenge|pain point|painpoint|problem|issue)\s+(?:of|with)\s+/i, '')
    .replace(/^the\s+(?:challenge|pain point|painpoint|problem|issue)\s+(?:of|with)\s+/i, '')
    .replace(/^challenge\s+(?:of|with)\s+/i, '')
    .replace(/^struggling\s+with\s+/i, '')
    .replace(/^operational\s+strain\s+and\s+/i, '')
    .replace(/^recruitment\s+pressure\s+for\s+/i, 'recruiting ')
    .replace(/^hiring\s+pressure\s+for\s+/i, 'hiring ')
    .replace(/^difficulty\s+(?:with|in)\s+/i, '')
    .replace(/^need\s+for\s+/i, '');
  const words = text.split(/\s+/).filter(Boolean);
  if(words.length > 12) text = words.slice(0, 12).join(' ');
  while(/\s+(?:to|for|with|and|or|of|the|a|an)$/i.test(text)){
    text = text.replace(/\s+(?:to|for|with|and|or|of|the|a|an)$/i, '').trim();
  }
  return text;
}

function extractJsonObject(text){
  const raw = String(text || '').trim();
  try{
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  }catch(_){}
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if(fenced){
    try{
      const parsed = JSON.parse(fenced[1]);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    }catch(_){}
  }
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if(start >= 0 && end > start){
    try{
      const parsed = JSON.parse(raw.slice(start, end + 1));
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    }catch(_){return {};}
  }
  return {};
}

function geminiInteractionText(data = {}){
  return (data.candidates || []).flatMap(candidate => candidate.content?.parts || []).map(part => part.text || '').filter(Boolean).join('\n').trim();
}

function geminiInteractionSourceUrls(data = {}){
  const urls = [];
  for(const candidate of data.candidates || []){
    for(const chunk of candidate.groundingMetadata?.groundingChunks || []){
      if(chunk.web?.uri) urls.push(chunk.web.uri);
    }
    for(const support of candidate.groundingMetadata?.groundingSupports || []){
      for(const chunkIndex of support.groundingChunkIndices || []){
        const chunk = candidate.groundingMetadata?.groundingChunks?.[chunkIndex];
        if(chunk?.web?.uri) urls.push(chunk.web.uri);
      }
    }
  }
  return [...new Set(urls.filter(Boolean))];
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 60000){
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try{
    return await fetch(url, {...options, signal: controller.signal});
  }finally{
    clearTimeout(timer);
  }
}

function geminiModelCandidates(primary){
  return [...new Set([primary, GEMINI_GROUNDED_MODEL, ...GEMINI_FALLBACK_MODELS].map(v => String(v || '').trim()).filter(Boolean))];
}

async function callGeminiGroundedSearch(input){
  if(!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured');
  const errors = [];
  for(const model of geminiModelCandidates(GEMINI_GROUNDED_MODEL)){
    const response = await fetchWithTimeout(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        contents:[{role:'user', parts:[{text:String(input || '')}]}],
        generationConfig:{temperature:0.1, maxOutputTokens:8192, responseMimeType:'application/json'},
        tools:[{google_search:{}}]
      })
    }).catch(error => ({ok:false, status:0, error}));
    if(response.error){
      errors.push(`${model}: ${response.error.message}`);
      continue;
    }
    const text = await response.text();
    let data = {};
    try{data = text ? JSON.parse(text) : {};}catch(_){data = {raw:text};}
    if(response.ok){
      const answer = geminiInteractionText(data);
      if(answer) return {text:answer, sourceUrls:geminiInteractionSourceUrls(data), model};
      errors.push(`${model}: empty response`);
      continue;
    }
    const message = data.error?.message || data.raw || text || 'upstream error';
    errors.push(`${model}: ${response.status} ${message}`);
    if(![404,429,500,502,503,504].includes(Number(response.status))) break;
  }
  throw new Error(`Gemini grounded search failed: ${errors.join(' | ')}`);
}

function contactFieldValue(contact = {}, fieldIds = {}, key = ''){
  const id = String(fieldIds[key] || '');
  const fields = Array.isArray(contact.customFields) ? contact.customFields : [];
  const found = fields.find(field => String(field.id || field.fieldId || field.customFieldId || '') === id);
  return found?.value ?? found?.field_value ?? '';
}

function goallLeadResearchFacts(p = {}){
  return [
    `Company: ${p.organizationName || p.name || ''}`,
    `Address: ${[p.address1, p.city, p.state, p.postalCode].filter(Boolean).join(', ') || p.location || ''}`,
    `Website: ${p.website || ''}`,
    `Industry: ${p.aiExactIndustry || p.industry || p.organizationType || ''}`,
    `Phone: ${p.phone || ''}`,
    `Business email: ${p.email || ''}`,
    `Public signals: ${jsonArrayValue(p.evidenceSignals).join('; ')}`,
    `Google/raw context: ${String(p.googleRaw || p.googleData || '').slice(0, 900)}`
  ].filter(line => !/:\s*$/.test(line)).join('\n');
}

function goallResearchPrompt(p = {}){
  return [
    'Act as an expert B2B sales researcher for GOALL (Growth Only Automated Life & Legacy), an employee benefits program.',
    'Use Google Search grounding to answer the same question a human operator would ask Gemini/Google AI, but return only the exact JSON object the scraper needs.',
    '',
    `Primary search query: ${[p.organizationName || p.name || 'this company', p.city || '', p.state || '', 'owner'].filter(Boolean).join(' ')}`,
    `Leadership fallback query: ${[p.organizationName || p.name || 'this company', p.city || '', p.state || '', 'CEO president executive leadership founder'].filter(Boolean).join(' ')}`,
    `Direct question: Who owns ${p.organizationName || p.name || 'this company'} at ${[p.address1, p.city, p.state, p.postalCode].filter(Boolean).join(', ') || p.location || p.website || 'the known location'}?`,
    `Executive fallback question: If no individual owner is currently named, who leads ${p.organizationName || p.name || 'this company'} as CEO, president, founder, managing member, general manager, executive leader, HR/benefits leader, or operations leader?`,
    `Follow-up question: Where would ${p.organizationName || p.name || 'this company'} likely see turnover, hiring pressure, recruiting friction, retention problems, operational strain, or expansion needs based only on public evidence?`,
    '',
    'Research the exact business and produce the same content the team liked from Gemini, but in structured fields: decision makers, best contact method, business size context, customized GOALL value propositions, hiring/turnover, and GOALL-aligned business needs/pain points.',
    '',
    'Business facts:',
    goallLeadResearchFacts(p),
    '',
    'Requirements:',
    '- Match the exact company name and exact address/location. Do not confuse similarly named businesses.',
    '- exactLocationMatched must be false when the best verified company appears to be in a different city or state than the searched business/location.',
    '- If the verified company is in a different state than the searched market, return explicitState as the verified state and explain the mismatch in possibleConfusionWarnings.',
    '- If the exact legal name is not active or public results reveal a likely DBA, operating company, parent/umbrella company, or similarly named regional entity, do not discard the row. Return the closest verified match in alternativeBusinessMatches and explain the ambiguity in possibleConfusionWarnings.',
    '- Only return a decisionMakerName when the person belongs to the exact company or a clearly connected operating/umbrella entity. Use medium or low confidence when the match is an operating/umbrella entity rather than the exact legal name.',
    '- Decision-maker search ladder: first owner/co-owner; then founder; then president/CEO/managing member; then general manager/operator; then HR/benefits/operations leader; then another senior executive who would plausibly decide on GOALL.',
    '- Employee-owned, ESOP, trust-owned, private equity-owned, family-owned without a named current owner, or ownership-transfer situations are not "no decision maker" cases. In those cases, return the CEO, president, chair, founder, or strongest current executive leader when public evidence supports the person.',
    '- Do not set Unverified solely because ownership is diffuse, employee-owned, or held by an ESOP/trust.',
    '- If you find a person, return first name and last name separately.',
    '- If you find no reliable person, set decisionMakerFirstName to "Unverified", leave last name empty, and explain why.',
    '- If you find a person but no direct person contact info, leave email and phone empty. Do not use generic company emails as person emails.',
    '- explicitCity and explicitState must be the verified business city and state from the matched location. Do not infer city or state from a broad market if the business location does not support it.',
    '- explicitPainpoint must be a short, sentence-ready phrase that works inside these exact templates: "You identified a challenge of {{contact.painpoint}}" and "Other employers are also struggling with {{contact.painpoint}}".',
    '- Write explicitPainpoint in lowercase unless a proper noun is required. Use 3 to 9 words when possible and no more than 12 words.',
    '- Good explicitPainpoint examples: "finding skilled electricians", "keeping experienced drivers", "hiring reliable HVAC technicians", "retaining project managers", "filling open field roles", "managing rapid team growth".',
    '- Bad explicitPainpoint examples: "Operational strain and recruitment pressure for skilled in-house project management and trade staff to support multi-regional renovation projects", "growth and outreach goals", "workforce challenges", "a need for solutions".',
    '- Do not put evidence, long explanations, company background, or GOALL positioning in explicitPainpoint. Put the evidence sentence in painpointEvidence and the outreach angle in recommendedGoallPositioning.',
    '- Use public evidence such as hiring pages, press releases, reviews, BBB/company descriptions, service-area scale, posted roles, expansion language, or industry-specific labor pressure. Name the concrete evidence in painpointEvidence.',
    '- Do not use generic phrases like "growth, outreach, or pipeline goals" unless public evidence supports that exact issue.',
    '- Leave explicitPainpoint empty only when the grounded search finds no public evidence for any concrete GOALL-relevant painpoint.',
    '- Keep every string under 300 characters except callerSnapshot, notes, and evidence fields, which must stay under 600 characters.',
    '- Keep secondaryDecisionMakers, regionalDecisionMakers, alternativeBusinessMatches, keyDecisionMakers, and peopleToAvoid to no more than 3 items each.',
    '- phoneType must be one of: direct_decision_maker, main_office, likely_gatekeeper, unknown.',
    '- emailType must be one of: decision_maker, general_inbox, unknown.',
    '- companyStructure must be one of: local_owner_led, regional_branch, large_corporation, out_of_state_hq_with_local_branch, ambiguous.',
    '- customizedValueProps must include 3 to 4 GOALL value propositions mapped to this exact company industry/business model.',
    '- callerSnapshot must be a compact block a caller can read while the phone is ringing.',
    '- callOpener must be one or two sentences and must change depending on phoneType.',
    '- emailAngle must be a short personalized angle for future email generation. It must use only explicit evidence, not guesses.',
    '- Return only valid JSON. No markdown.',
    '',
    'Return JSON with this exact shape:',
    '{"decisionMakerFirstName":"","decisionMakerLastName":"","decisionMakerName":"","decisionMakerTitle":"","decisionMakerConfidence":"high|medium|low|none","decisionMakerEvidence":"","primaryDecisionMaker":{"name":"","title":"","roleType":"owner|president|ceo|founder|regional|hr|operations|admin|unknown","linkedinUrl":"","confidence":"high|medium|low|none","evidence":""},"secondaryDecisionMakers":[{"name":"","title":"","roleType":"vp|hr|operations|admin|regional|other","linkedinUrl":"","reason":"","sourceUrl":""}],"regionalDecisionMakers":[{"name":"","title":"","region":"","linkedinUrl":"","reason":"","sourceUrl":""}],"bestPersonToSpeakTo":{"name":"","title":"","reason":"","confidence":"high|medium|low|none","linkedinUrl":""},"bestContactMethod":{"email":"","emailType":"decision_maker|general_inbox|unknown","phone":"","phoneType":"direct_decision_maker|main_office|likely_gatekeeper|unknown","address":"","contactNotes":""},"explicitCity":"","explicitState":"","explicitPainpoint":"","painpointEvidence":"","businessNeedsAndPainPoints":[""],"hiringAndTurnover":{"activelyHiring":"yes|no|unclear","highestTurnoverArea":"","turnoverRisk":"","evidence":""},"businessSizeContext":"","companyStructure":"local_owner_led|regional_branch|large_corporation|out_of_state_hq_with_local_branch|ambiguous","customizedValueProps":[""],"recommendedGoallPositioning":"","callerSnapshot":"","callOpener":"","emailAngle":"","operatingEntityName":"","exactEntityStatus":"","alternativeBusinessMatches":[{"entityName":"","location":"","relationshipToSearch":"","ownersOrExecutives":[{"name":"","title":""}],"sourceUrl":""}],"personalLinkedInUrl":"","personEmail":"","personPhone":"","companyLinkedInUrl":"","keyDecisionMakers":[{"name":"","title":"","reason":"","sourceUrl":""}],"peopleToAvoid":[{"nameOrRole":"","reason":""}],"sourceUrls":[],"notes":"","exactLocationMatched":true,"possibleConfusionWarnings":[]}'
  ].join('\n');
}

function goallDecisionPerson(decision = {}){
  const best = decision.bestPersonToSpeakTo || {};
  const primary = decision.primaryDecisionMaker || {};
  const first = String(decision.decisionMakerFirstName || '').trim();
  const last = String(decision.decisionMakerLastName || '').trim();
  const joined = [first, last].filter(v => v && !/^unverified$/i.test(v)).join(' ').trim();
  return {
    name:String(decision.decisionMakerName || primary.name || best.name || joined || '').trim(),
    title:String(decision.decisionMakerTitle || primary.title || best.title || '').trim(),
    confidence:String(decision.decisionMakerConfidence || primary.confidence || best.confidence || '').trim().toLowerCase(),
    evidence:String(decision.decisionMakerEvidence || primary.evidence || primary.reason || best.reason || decision.notes || '').trim(),
    linkedinUrl:String(decision.personalLinkedInUrl || primary.linkedinUrl || best.linkedinUrl || '').trim()
  };
}

function leadContactability(p = {}){
  const email = normalizeEmailAddress(p.email || p.decisionMakerEmail || p.personEmail || '');
  const phone = normalizePhoneNumber(p.phone || p.decisionMakerPhone || p.personPhone || '');
  return {
    email,
    phone,
    hasEmail:!!email,
    hasPhone:!!phone,
    contactabilityStatus:email && phone ? 'full_contactability' : email ? 'email_only' : phone ? 'phone_only' : 'no_contact_method'
  };
}

function leadCallScript(p){
  if(p.callOpener) return String(p.callOpener).trim();
  const contactability = leadContactability(p);
  const phoneType = String(p.bestContactPhoneType || '').toLowerCase();
  const gatekeeper = /main_office|gatekeeper/.test(phoneType);
  const name = gatekeeper ? 'there' : (p.decisionMakerName || 'there');
  const company = p.organizationName || p.name || 'your company';
  const painpoint = goallPainpointForMessaging(p.painpoint || p.painPoint || '') || 'employee retention and benefits pressure';
  const angle = p.nextOutreachAngle || p.recommendedOutreachAngle || p.emailAngle || `supporting ${painpoint}`;
  if(gatekeeper || contactability.contactabilityStatus === 'phone_only'){
    return `Hi, this is Mark with GOALL. I was hoping to speak with whoever handles employee benefits, retention, or owner-level planning for ${company}. We help employers address ${painpoint} without the compliance burden of a traditional 401(k) conversation.`;
  }
  return `Hi ${name}, this is Mark with GOALL. I was looking at ${company} and noticed public signals around ${painpoint}. I wanted to ask whether you are open to a short conversation about ${angle} through a benefits program built for owners and key employees.`;
}

function enrichProspectFromDecision(prospect, decision, gemini){
  const person = goallDecisionPerson(decision);
  const contactMethod = decision.bestContactMethod && typeof decision.bestContactMethod === 'object' ? decision.bestContactMethod : {};
  const hiringTurnover = decision.hiringAndTurnover && typeof decision.hiringAndTurnover === 'object' ? decision.hiringAndTurnover : {};
  let next = {
    ...prospect,
    aiDecisionMakerResearch:decision,
    decisionMakerEvidence:person.evidence || decision.decisionMakerEvidence || decision.notes || '',
    decisionMakerSourceUrls:[...new Set([...jsonArrayValue(decision.sourceUrls), ...(gemini.sourceUrls || [])])],
    keyDecisionMakers:decisionArrayValue(decision.keyDecisionMakers),
    secondaryDecisionMakers:decisionArrayValue(decision.secondaryDecisionMakers),
    regionalDecisionMakers:decisionArrayValue(decision.regionalDecisionMakers),
    possibleConfusionWarnings:decisionArrayValue(decision.possibleConfusionWarnings || decision.ambiguity_warnings),
    alternativeBusinessMatches:decisionArrayValue(decision.alternativeBusinessMatches),
    operatingEntityName:cleanText(decision.operatingEntityName || decision.company_name || '', 200),
    exactEntityStatus:cleanText(decision.exactEntityStatus || '', 500),
    exactLocationMatched:decision.exactLocationMatched !== false,
    decisionMakerSource:'Gemini grounded search backfill',
    city:cleanText(decision.explicitCity || prospect.city || '', 120),
    explicitState:cleanText(decision.explicitState || decision.verifiedState || prospect.state || '', 80),
    verifiedState:cleanText(decision.explicitState || decision.verifiedState || prospect.state || '', 80),
    painpoint:goallPainpointForMessaging(decision.explicitPainpoint || prospect.painpoint || ''),
    painpointEvidence:cleanText(decision.painpointEvidence || prospect.painpointEvidence || '', 900),
    businessNeedsAndPainPoints:decisionArrayValue(decision.businessNeedsAndPainPoints),
    businessSizeContext:cleanText(decision.businessSizeContext || '', 500),
    companyStructure:cleanText(decision.companyStructure || '', 120),
    customizedValueProps:decisionArrayValue(decision.customizedValueProps),
    activelyHiring:cleanText(hiringTurnover.activelyHiring || '', 40),
    highestTurnoverArea:cleanText(hiringTurnover.highestTurnoverArea || '', 200),
    turnoverRisk:cleanText(hiringTurnover.turnoverRisk || '', 500),
    hiringTurnoverEvidence:cleanText(hiringTurnover.evidence || '', 900),
    bestContactEmail:cleanText(contactMethod.email || '', 254),
    bestContactEmailType:cleanText(contactMethod.emailType || '', 80),
    bestContactPhone:cleanText(contactMethod.phone || '', 80),
    bestContactPhoneType:cleanText(contactMethod.phoneType || '', 80),
    bestContactAddress:cleanText(contactMethod.address || '', 300),
    bestContactNotes:cleanText(contactMethod.contactNotes || '', 900),
    callerSnapshot:cleanText(decision.callerSnapshot || '', 1500),
    callOpener:cleanText(decision.callOpener || '', 900),
    emailAngle:cleanText(decision.emailAngle || '', 900),
    recommendedOutreachAngle:cleanText(decision.recommendedGoallPositioning || prospect.recommendedOutreachAngle || '', 1200),
    nextOutreachAngle:cleanText(decision.recommendedGoallPositioning || prospect.nextOutreachAngle || '', 1200),
    geminiGrounded:true,
    geminiModel:gemini.model
  };
  const confidence = String(person.confidence || decision.decisionMakerConfidence || '').toLowerCase();
  if((confidence === 'high' || confidence === 'medium') && person.name){
    const parts = person.name.split(/\s+/);
    next.decisionMakerName = person.name;
    next.decisionMakerTitle = person.title || next.decisionMakerTitle || '';
    next.linkedinPersonalUrl = person.linkedinUrl || next.linkedinPersonalUrl || '';
    next.decisionMakerFirstName = decision.decisionMakerFirstName || parts[0] || '';
    next.decisionMakerLastName = decision.decisionMakerLastName || parts.slice(1).join(' ');
    next.decisionMakerConfidence = confidence;
    next.linkedinMatchNotes = `Gemini matched ${person.name}${person.title ? ' - ' + person.title : ''}. ${person.evidence || decision.notes || ''}`.trim();
    if(decision.personEmail && normalizeEmailAddress(decision.personEmail)){
      next.email = normalizeEmailAddress(decision.personEmail);
      next.decisionMakerEmail = next.email;
      next.personEmail = next.email;
    }
    if(decision.personPhone && normalizePhoneNumber(decision.personPhone)){
      next.phone = normalizePhoneNumber(decision.personPhone);
      next.decisionMakerPhone = next.phone;
      next.personPhone = next.phone;
    }
  }else{
    next.decisionMakerFirstName = 'Unverified';
    next.decisionMakerLastName = '';
    next.decisionMakerConfidence = confidence || 'none';
  }
  if(!next.email && contactMethod.email && normalizeEmailAddress(contactMethod.email)){
    next.email = normalizeEmailAddress(contactMethod.email);
  }
  if(!normalizePhoneNumber(next.phone || '') && contactMethod.phone && normalizePhoneNumber(contactMethod.phone)){
    next.phone = normalizePhoneNumber(contactMethod.phone);
  }
  return sanitizeDecisionMaker(next);
}

function leadFieldsFromProspect(p){
  const contactability = leadContactability(p);
  const decisionName = String(p.decisionMakerName || '').trim();
  const parts = decisionName.split(/\s+/).filter(Boolean);
  const valueProps = decisionArrayValue(p.customizedValueProps).map(v => typeof v === 'string' ? v : [v.title, v.reason, v.value].filter(Boolean).join(' - ')).filter(Boolean);
  const needs = decisionArrayValue(p.businessNeedsAndPainPoints).map(v => typeof v === 'string' ? v : [v.need, v.evidence].filter(Boolean).join(' - ')).filter(Boolean);
  const researchSummary = [
    p.callerSnapshot ? `Caller snapshot: ${p.callerSnapshot}` : '',
    p.businessSizeContext ? `Business size context: ${p.businessSizeContext}` : '',
    p.companyStructure ? `Company structure: ${p.companyStructure}` : '',
    p.bestContactPhoneType ? `Phone type: ${p.bestContactPhoneType}` : '',
    p.bestContactEmailType ? `Email type: ${p.bestContactEmailType}` : '',
    p.activelyHiring ? `Actively hiring: ${p.activelyHiring}` : '',
    p.highestTurnoverArea ? `Highest turnover area: ${p.highestTurnoverArea}` : '',
    p.turnoverRisk ? `Turnover risk: ${p.turnoverRisk}` : '',
    p.painpointEvidence ? `Pain point evidence: ${p.painpointEvidence}` : '',
    needs.length ? `Business needs: ${needs.slice(0, 4).join(' | ')}` : '',
    valueProps.length ? `GOALL value props: ${valueProps.slice(0, 4).join(' | ')}` : '',
    p.recommendedOutreachAngle ? `GOALL positioning: ${p.recommendedOutreachAngle}` : '',
    p.emailAngle ? `Email angle: ${p.emailAngle}` : ''
  ].filter(Boolean).join('\n');
  return {
    painpoint:goallPainpointForMessaging(p.painpoint || ''),
    decision_maker_first_name:p.decisionMakerFirstName || parts[0] || (decisionName ? '' : 'Unverified'),
    decision_maker_last_name:p.decisionMakerLastName || parts.slice(1).join(' '),
    decision_maker_name:decisionName || 'Unverified',
    decision_maker_title:p.decisionMakerTitle || '',
    decision_maker_email:p.decisionMakerEmail || p.personEmail || (decisionName && normalizeEmailAddress(p.email) ? normalizeEmailAddress(p.email) : ''),
    decision_maker_phone:p.decisionMakerPhone || p.personPhone || (decisionName && normalizePhoneNumber(p.phone) ? normalizePhoneNumber(p.phone) : ''),
    ai_exact_industry:p.aiExactIndustry || p.industry || p.organizationType || '',
    industry:p.aiExactIndustry || p.industry || p.organizationType || '',
    company_signals:researchSummary,
    enrichment_data:researchSummary,
    raw_enrichment_notes:JSON.stringify(p.aiDecisionMakerResearch || {}, null, 2).slice(0, 9000),
    call_script_angle:p.callOpener || p.recommendedOutreachAngle || p.emailAngle || '',
    recommended_outreach_angle:p.recommendedOutreachAngle || p.emailAngle || '',
    ai_company_summary:[p.businessSizeContext, p.companyStructure, p.callerSnapshot].filter(Boolean).join('\n').slice(0, 3000),
    call_script:leadCallScript(p),
    lead_enrichment_status:contactability.hasEmail || contactability.hasPhone ? 'enriched' : 'partial',
    lead_last_processed_at:new Date().toISOString()
  };
}

function goallLeadImportNote(p = {}){
  const contactability = leadContactability(p);
  const name = p.organizationName || p.name || 'Unnamed business lead';
  const exactIndustry = p.aiExactIndustry || p.industry || p.organizationType || 'unclear';
  const location = p.location || [p.city, p.state].filter(Boolean).join(', ') || 'unclear';
  const decisionName = String(p.decisionMakerName || '').trim();
  const valueProps = decisionArrayValue(p.customizedValueProps).map(v => typeof v === 'string' ? v : [v.title, v.reason, v.value].filter(Boolean).join(' - ')).filter(Boolean);
  const businessNeeds = decisionArrayValue(p.businessNeedsAndPainPoints).map(v => typeof v === 'string' ? v : [v.need, v.evidence].filter(Boolean).join(' - ')).filter(Boolean);
  return [
    'Lead Data',
    `- Company: ${name}`,
    `- Industry: ${exactIndustry}`,
    `- Location: ${location}`,
    `- Website: ${p.website || 'unclear'}`,
    `- Decision maker: ${decisionName ? `${decisionName}${p.decisionMakerTitle ? ' - ' + p.decisionMakerTitle : ''}` : 'Unverified'}`,
    `- Decision maker email: ${p.decisionMakerEmail || p.personEmail || (decisionName && normalizeEmailAddress(p.email) ? p.email : '') || 'missing'}`,
    `- Decision maker phone: ${p.decisionMakerPhone || p.personPhone || (decisionName && normalizePhoneNumber(p.phone) ? p.phone : '') || 'missing'}`,
    `- Business email: ${contactability.email || p.email || 'missing'}`,
    `- Business phone: ${contactability.phone || p.phone || 'missing'}`,
    '',
    'Gemini Research Highlights',
    p.callerSnapshot ? `- Caller snapshot: ${p.callerSnapshot}` : '',
    p.businessSizeContext ? `- Business size context: ${p.businessSizeContext}` : '',
    p.companyStructure ? `- Company structure: ${p.companyStructure}` : '',
    p.bestContactPhoneType ? `- Phone type: ${p.bestContactPhoneType}` : '',
    p.bestContactEmailType ? `- Email type: ${p.bestContactEmailType}` : '',
    p.activelyHiring ? `- Actively hiring: ${p.activelyHiring}` : '',
    p.highestTurnoverArea ? `- Highest turnover area: ${p.highestTurnoverArea}` : '',
    p.turnoverRisk ? `- Turnover risk: ${p.turnoverRisk}` : '',
    `- Pain point: ${goallPainpointForMessaging(p.painpoint || '') || 'missing'}`,
    p.painpointEvidence ? `- Pain point evidence: ${p.painpointEvidence}` : '',
    p.hiringTurnoverEvidence ? `- Hiring/turnover evidence: ${p.hiringTurnoverEvidence}` : '',
    businessNeeds.length ? `- Business needs: ${businessNeeds.slice(0, 4).join(' | ')}` : '',
    valueProps.length ? `- GOALL value props: ${valueProps.slice(0, 4).join(' | ')}` : '',
    p.recommendedOutreachAngle || p.nextOutreachAngle ? `- GOALL positioning: ${p.recommendedOutreachAngle || p.nextOutreachAngle}` : '',
    p.emailAngle ? `- Email angle: ${p.emailAngle}` : '',
    p.callOpener ? `- Suggested opener: ${p.callOpener}` : '',
    p.decisionMakerEvidence ? `- Decision-maker evidence: ${p.decisionMakerEvidence}` : '',
    '',
    'Call Script',
    leadCallScript(p)
  ].filter(Boolean).join('\n');
}

function goallLeadCallerSnapshotNote(p = {}){
  const contactability = leadContactability(p);
  const decisionName = String(p.decisionMakerName || '').trim();
  const decisionLine = decisionName ? `${decisionName}${p.decisionMakerTitle ? ' - ' + p.decisionMakerTitle : ''}` : 'Unverified';
  return [
    'CALLER SNAPSHOT',
    `- Decision maker: ${decisionLine}`,
    `- Phone type: ${p.bestContactPhoneType || 'unknown'}`,
    `- Email type: ${p.bestContactEmailType || 'unknown'}`,
    `- Business phone: ${contactability.phone || p.phone || 'missing'}`,
    `- Business email: ${contactability.email || p.email || 'missing'}`,
    p.activelyHiring ? `- Actively hiring: ${p.activelyHiring}` : '',
    p.highestTurnoverArea ? `- Highest turnover: ${p.highestTurnoverArea}` : '',
    p.turnoverRisk ? `- Turnover risk: ${p.turnoverRisk}` : '',
    `- Pain point: ${goallPainpointForMessaging(p.painpoint || '') || 'missing'}`,
    p.recommendedOutreachAngle || p.nextOutreachAngle ? `- GOALL angle: ${p.recommendedOutreachAngle || p.nextOutreachAngle}` : '',
    p.callOpener ? `- Suggested opener: ${p.callOpener}` : '',
    p.callerSnapshot ? `- Context: ${p.callerSnapshot}` : ''
  ].filter(Boolean).join('\n');
}

async function mapWithConcurrency(items, concurrency, worker){
  const results = [];
  let index = 0;
  const runners = Array.from({length:Math.min(concurrency, items.length)}, async() => {
    while(index < items.length){
      const current = index++;
      results[current] = await worker(items[current], current);
    }
  });
  await Promise.all(runners);
  return results;
}

async function listLimitlessContacts(ghl){
  const contacts = [];
  let startAfter = '';
  let startAfterId = '';
  while(contacts.length < LIMIT){
    const params = new URLSearchParams({locationId:GHL_LOC, limit:'100', query:CONTACT_QUERY});
    if(startAfter) params.set('startAfter', startAfter);
    if(startAfterId) params.set('startAfterId', startAfterId);
    const data = await ghl.requestStrict('GET', `/contacts/?${params.toString()}`);
    const page = data.contacts || data.data || [];
    for(const contact of page){
      const tags = (contact.tags || []).map(tag => String(tag).toLowerCase());
      if(tags.includes(TARGET_TAG)) contacts.push(contact);
      if(contacts.length >= LIMIT) break;
    }
    const meta = data.meta || {};
    startAfter = String(meta.startAfter || '');
    startAfterId = String(meta.startAfterId || '');
    if(!page.length || !startAfter || !startAfterId) break;
  }
  return contacts;
}

function fieldIdsFromCustomFields(fields){
  const byName = new Map(fields.map(field => [normalizeFieldName(field.name || field.fieldName || field.key || ''), field.id || field._id || field.fieldId || '']).filter(([, id]) => id));
  const ids = {};
  for(const [key, aliases] of Object.entries(FIELD_ALIASES)){
    const envName = 'GHL_FIELD_' + key.toUpperCase();
    const envId = process.env[envName] || '';
    const found = aliases.map(normalizeFieldName).map(alias => byName.get(alias) || byName.get(`${alias} text`) || '').find(Boolean);
    ids[key] = envId || found || '';
  }
  return ids;
}

function customFieldPayloads(ids, fields){
  return Object.entries(fields)
    .filter(([key, value]) => ids[key] && value !== undefined && value !== null)
    .map(([key, value]) => ({id:ids[key], key:GHL_FIELD_KEYS[key], field_value:String(value || '').slice(0, 9000)}));
}

function prospectFromContact(contact, fieldIds){
  const company = contact.companyName || contact.businessName || contact.company || contact.contactName || contact.name || '';
  const industry = contactFieldValue(contact, fieldIds, 'industry') || contactFieldValue(contact, fieldIds, 'ai_exact_industry') || '';
  const painpoint = contactFieldValue(contact, fieldIds, 'painpoint') || '';
  return {
    contactId:contact.id,
    organizationName:company,
    name:company,
    website:contact.website || '',
    address1:contact.address1 || contact.address || '',
    city:contact.city || '',
    state:contact.state || '',
    postalCode:contact.postalCode || contact.postal_code || '',
    location:[contact.city, contact.state].filter(Boolean).join(', '),
    phone:contact.phone || '',
    email:contact.email || '',
    industry,
    organizationType:industry || 'GOALL employer',
    aiExactIndustry:industry,
    painpoint,
    googleRaw:`Existing GHL Limitless Leads contact. Tags: ${(contact.tags || []).join(', ')}. Source: ${contact.source || ''}.`,
    evidenceSignals:[`Existing GHL contact tagged ${TARGET_TAG}`],
    leadProfile:'goall'
  };
}

async function main(){
  if(!GHL_LOC) throw new Error('GHL location id is missing.');
  const ghl = createGhlMcpService({
    fallbackApiKey:process.env.GHL_KEY || process.env.GHL_API_KEY,
    fallbackLocationId:GHL_LOC,
    resolveSecret:async(_provider, _type, fallback) => fallback
  });
  const customFieldData = await ghl.requestStrict('GET', `/locations/${encodeURIComponent(GHL_LOC)}/customFields`);
  const customFields = customFieldData.customFields || customFieldData.fields || customFieldData.data || [];
  const fieldIds = fieldIdsFromCustomFields(customFields);
  const contacts = await listLimitlessContacts(ghl);
  console.log(`${WRITE ? 'WRITE' : 'DRY RUN'} backfill for ${contacts.length} contacts tagged "${TARGET_TAG}".`);
  const summary = {write:WRITE, targetTag:TARGET_TAG, query:CONTACT_QUERY, found:contacts.length, updated:[], skipped:[], failed:[]};
  await mapWithConcurrency(contacts, CONCURRENCY, async(contact, index) => {
    const label = `${index + 1}/${contacts.length} ${contact.companyName || contact.contactName || contact.id}`;
    try{
      const prospect = prospectFromContact(contact, fieldIds);
      if(!prospect.organizationName){
        summary.skipped.push({contactId:contact.id, reason:'missing company name'});
        console.log('SKIP', label, 'missing company name');
        return;
      }
      const gemini = await callGeminiGroundedSearch(goallResearchPrompt(prospect));
      const decision = extractJsonObject(gemini.text);
      const enriched = enrichProspectFromDecision(prospect, decision, gemini);
      const fields = leadFieldsFromProspect(enriched);
      const customFieldPayload = customFieldPayloads(fieldIds, fields);
      const fullNote = goallLeadImportNote(enriched);
      const snapshotNote = goallLeadCallerSnapshotNote(enriched);
      if(WRITE){
        if(customFieldPayload.length){
          await ghl.requestStrict('PUT', `/contacts/${encodeURIComponent(contact.id)}`, {
            companyName:enriched.organizationName,
            email:normalizeEmailAddress(enriched.email) || undefined,
            phone:normalizePhoneNumber(enriched.phone) || undefined,
            website:enriched.website || undefined,
            address1:enriched.address1 || undefined,
            city:enriched.city || undefined,
            state:enriched.state || undefined,
            postalCode:enriched.postalCode || undefined,
            customFields:customFieldPayload
          });
        }
        await ghl.requestStrict('POST', `/contacts/${encodeURIComponent(contact.id)}/notes`, {body:fullNote});
        await ghl.requestStrict('POST', `/contacts/${encodeURIComponent(contact.id)}/notes`, {body:snapshotNote});
      }
      summary.updated.push({
        contactId:contact.id,
        company:enriched.organizationName,
        decisionMaker:enriched.decisionMakerName || 'Unverified',
        painpoint:enriched.painpoint || '',
        phoneType:enriched.bestContactPhoneType || '',
        emailType:enriched.bestContactEmailType || '',
        fields:customFieldPayload.length,
        wrote:WRITE
      });
      console.log(WRITE ? 'UPDATED' : 'WOULD UPDATE', label, '|', enriched.decisionMakerName || 'Unverified', '|', enriched.painpoint || 'no painpoint');
    }catch(error){
      summary.failed.push({contactId:contact.id, company:contact.companyName || contact.contactName || '', error:error.message});
      console.log('FAILED', label, error.message);
    }
  });
  const outDir = path.join(process.cwd(), 'tmp');
  fs.mkdirSync(outDir, {recursive:true});
  const outPath = path.join(outDir, `limitless-backfill-${new Date().toISOString().replace(/[:.]/g, '-')}-${crypto.randomBytes(3).toString('hex')}.json`);
  fs.writeFileSync(outPath, JSON.stringify(summary, null, 2));
  console.log(`Summary written to ${outPath}`);
  console.log(JSON.stringify({found:summary.found, updated:summary.updated.length, skipped:summary.skipped.length, failed:summary.failed.length, write:WRITE}, null, 2));
  if(summary.failed.length) process.exitCode = 2;
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
