const fs = require('fs');
const path = require('path');

const PROMPT_DOCS = {
  chief_of_staff: 'VAL_CHIEF_OF_STAFF_PROMPTS.md',
  chief_of_staff_decision_model: 'VAL_CHIEF_OF_STAFF_DECISION_MODEL.md',
  event_intelligence_pass: 'VAL_EVENT_INTELLIGENCE_PASS.md',
  momentum: 'VAL_MOMENTUM_CARD_PROMPTS.md',
  ready_for_you: 'VAL_READY_FOR_YOU_CARD_PROMPTS.md',
  executive_inbox: 'VAL_EXECUTIVE_INBOX_CLASSIFICATION_PROMPTS.md',
  calendar_meeting_prep: 'VAL_CALENDAR_AND_MEETING_PREP_PROMPTS.md',
  crm: 'VAL_GHL_CRM_PROMPTS.md',
  chat_voice: 'VAL_CHAT_VOICE_CONTEXT_PROMPTS.md',
  relationship_project_understanding: 'VAL_RELATIONSHIP_PROJECT_UNDERSTANDING_PROMPTS.md',
  teach_val: 'VAL_TEACH_VAL_PROMPTS.md',
  transcript_intake: 'VAL_TRANSCRIPT_INTAKE_PROMPTS.md'
};

function createValPromptRegistry({docsDir=path.join(__dirname,'..','docs')}={}){
  const cache = new Map();
  function resolvePromptDoc(promptKey){
    const fileName = PROMPT_DOCS[promptKey] || PROMPT_DOCS[String(promptKey||'').toLowerCase()] || '';
    if(!fileName) return null;
    return path.join(docsDir,fileName);
  }
  function getPrompt(promptKey){
    const filePath = resolvePromptDoc(promptKey);
    if(!filePath) return {promptKey,found:false,sourcePath:'',content:''};
    if(cache.has(filePath)) return cache.get(filePath);
    let content = '';
    let found = false;
    try{
      content = fs.readFileSync(filePath,'utf8');
      found = true;
    }catch(_){}
    const prompt = {promptKey,found,sourcePath:filePath,content};
    cache.set(filePath,prompt);
    return prompt;
  }
  return {getPrompt,resolvePromptDoc,promptDocs:{...PROMPT_DOCS}};
}

module.exports = {createValPromptRegistry,PROMPT_DOCS};
