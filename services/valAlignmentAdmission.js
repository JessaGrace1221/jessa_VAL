const MIN_ALIGNMENT_CONFIDENCE=0.6;

function compactText(value='',limit=600){
  return String(value||'').replace(/\s+/g,' ').trim().slice(0,limit);
}

function genericAlignmentLanguage(value=''){
  const text=compactText(value,900).toLowerCase();
  if(!text)return true;
  return [
    /\breview .+ before choosing an action\b/,
    /\binspect (?:the )?evidence\b.*\bchoose (?:the )?next move\b/,
    /\bdecide (?:on )?the next move\b/,
    /\bchoose (?:the )?next (?:move|step|action)\b/,
    /\breview .+\bdecide (?:on )?the next concrete step\b/,
    /\bgather better evidence\b/,
    /\brun the intelligence pass again\b/,
    /\bplace attention on\b/,
    /\bprotect decision quality first\b/
  ].some(pattern=>pattern.test(text));
}

function concreteExecutiveAction(value=''){
  const text=compactText(value,900);
  if(!text||genericAlignmentLanguage(text))return false;
  return /\b(send|reply|follow up|close|finish|complete|confirm|decide|choose|approve|decline|hold|schedule|cancel|call|ask|tell|share|review|revise|clarify|resolve|prepare|draft|discuss|meet|handoff|hand off|assign|delegate|remove|update|deliver|create|build|submit|sign|pay|introduce|connect|nudge|pause|stop|start|continue|record|mark)\b/i.test(text);
}

function concreteAlignmentObject(value=''){
  const text=compactText(value,900);
  if(!text)return false;
  const normalized=text.toLowerCase().replace(/["']/g,'').trim();
  if([
    'this',
    'this item',
    'this signal',
    'this board signal',
    'the evidence',
    'board packet',
    'the next move',
    'the next step',
    'the next action',
    'insufficient evidence'
  ].includes(normalized))return false;
  return !genericAlignmentLanguage(text);
}

function assessAlignmentAdmission({
  actionText='',
  objectText='',
  exactSourceQuote='',
  sourceRefs=[],
  confidence=0
}={}){
  const action=compactText(actionText,900);
  const object=compactText(objectText,900);
  const quote=compactText(exactSourceQuote,1400);
  const refs=Array.isArray(sourceRefs)?sourceRefs:[];
  const numericConfidence=Number(confidence);
  if(!quote&&!refs.length)return {passed:false,reason:'missing_source_evidence'};
  if(!Number.isFinite(numericConfidence)||numericConfidence<MIN_ALIGNMENT_CONFIDENCE){
    return {passed:false,reason:'confidence_below_alignment_floor'};
  }
  if(genericAlignmentLanguage(action)||genericAlignmentLanguage(object)){
    return {passed:false,reason:'generic_chief_language'};
  }
  if(!concreteExecutiveAction(action))return {passed:false,reason:'missing_concrete_action'};
  if(!concreteAlignmentObject(object))return {passed:false,reason:'missing_concrete_object'};
  return {passed:true,reason:'grounded_executive_action'};
}

module.exports={
  MIN_ALIGNMENT_CONFIDENCE,
  assessAlignmentAdmission,
  concreteAlignmentObject,
  concreteExecutiveAction,
  genericAlignmentLanguage
};
