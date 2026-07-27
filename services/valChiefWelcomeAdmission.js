const MIN_CHIEF_WELCOME_CONFIDENCE=0.6;

function compactText(value='',limit=500){
  return String(value||'').replace(/\s+/g,' ').trim().slice(0,limit);
}

function genericWelcomeFinding(value=''){
  const text=compactText(value,700).toLowerCase();
  if(!text)return true;
  return [
    /\{\{[^}]+\}\}/,
    /\baction items?\s*-\s*\[\s*\]/,
    /\bspeaker[_\s-]?\d+\b/,
    /\bemail may contain\b/,
    /\bmay need relational attention\b/,
    /\bsent email appears to need a response\b/,
    /\btrust and warmth are moving\b/,
    /\bprotect (?:the )?(?:space|center)\b/,
    /\bthe important work is moving\b/,
    /\bone thread is no longer asking to be carried\b/,
    /\bthe room feels lighter\b/,
    /\bchanged what deserves attention\b/,
    /\bdecide the next clean step\b/
  ].some(pattern=>pattern.test(text));
}

function assessChiefWelcome({
  observerName='',
  finding='',
  sourceRefs=[],
  confidence=0
}={}){
  const observer=compactText(observerName,80);
  const statement=compactText(finding,500);
  const refs=Array.isArray(sourceRefs)?sourceRefs:[];
  const numericConfidence=Number(confidence);
  if(!observer||observer==='Board')return {passed:false,reason:'missing_specific_observer'};
  if(!refs.length||!refs.some(ref=>compactText(ref.quote_or_summary||ref.quoteOrSummary||ref.quote||ref.summary,1200))){
    return {passed:false,reason:'missing_source_evidence'};
  }
  if(!Number.isFinite(numericConfidence)||numericConfidence<MIN_CHIEF_WELCOME_CONFIDENCE){
    return {passed:false,reason:'confidence_below_welcome_floor'};
  }
  if(statement.length<20)return {passed:false,reason:'finding_too_thin'};
  if(genericWelcomeFinding(statement))return {passed:false,reason:'generic_or_raw_finding'};
  return {passed:true,reason:'grounded_board_brief'};
}

module.exports={
  MIN_CHIEF_WELCOME_CONFIDENCE,
  assessChiefWelcome,
  genericWelcomeFinding
};
