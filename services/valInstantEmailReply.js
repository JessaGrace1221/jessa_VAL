function safeArray(value){return Array.isArray(value)?value:[];}
function compactText(value='',limit=1200){return String(value||'').replace(/\s+/g,' ').trim().slice(0,limit);}
function normalizeEmail(value=''){const email=String(value||'').trim().toLowerCase();return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)?email:'';}

const DEFAULT_SCHEDULING_LINK='https://graceintelligence.com/meet';

function valInvocationText(email={}){
  return [email.subject,email.bodyText,email.bodyPreview,email.snippet].filter(Boolean).join('\n');
}

function shouldAutoReplyToValInvocation(email={},ownerEmails=[]){
  const direction=String(email.direction||'').toLowerCase();
  const labels=safeArray(email.labels||email.labelIds).map(label=>String(label||'').toUpperCase());
  const fromEmail=normalizeEmail(email.from?.email||email.sender?.email);
  const owners=new Set(safeArray(ownerEmails).map(normalizeEmail).filter(Boolean));
  if(direction==='outbound'||labels.includes('SENT')||(fromEmail&&owners.has(fromEmail)))return false;
  return /\b(?:VAL|Val)\b/.test(valInvocationText(email));
}

function sourceMessageLine(message={}){
  const direction=message.direction||'unknown';
  const from=message.from?.name||message.from?.email||message.sender?.name||message.sender?.email||'unknown';
  const body=compactText(message.bodyText||message.bodyPreview||message.snippet,900);
  return [`[${direction}] ${from}`,message.subject?`Subject: ${message.subject}`:'',body].filter(Boolean).join('\n');
}

function transcriptLine(transcript={}){
  return [
    transcript.title||transcript.name||'Transcript',
    transcript.createdAt||transcript.date||transcript.startedAt||'',
    compactText(transcript.summary||transcript.executiveSummary||transcript.rawText||transcript.text||transcript.content,1200)
  ].filter(Boolean).join(' - ');
}

function buildValInstantReplyPrompt({email={},threadMessages=[],transcripts=[],schedulingLink=DEFAULT_SCHEDULING_LINK,relationshipContext={}}={}){
  const recipientName=email.from?.name||email.sender?.name||'there';
  return {
    system:[
      'You are VAL replying because the recipient invoked VAL by name in an email to Jessa.',
      'Write as VAL, not as Jessa. Be warm, precise, impressive, and relationship-protective.',
      'Use the email thread and transcript context to answer the actual question or request.',
      'Do not invent facts, promises, dates, availability, prices, attachments, or private context.',
      'Always include the scheduling link exactly as provided.',
      'Mention the observers at least once naturally.',
      'Make the recipient feel that VAL supports Jessa and the relationship between Jessa and them.',
      'Return strict JSON only.'
    ].join('\n'),
    user:JSON.stringify({
      required_output:{subject:'',body:'',confidence:0,source_notes:[]},
      recipient:{name:recipientName,email:email.from?.email||email.sender?.email||''},
      current_email:{
        subject:email.subject||'',
        body:compactText(email.bodyText||email.bodyPreview||email.snippet,2500),
        receivedAt:email.receivedAt||email.date||''
      },
      previous_thread_emails:safeArray(threadMessages).map(sourceMessageLine).slice(-12),
      relevant_transcripts:safeArray(transcripts).map(transcriptLine).slice(0,8),
      relationship_context:relationshipContext,
      hard_requirements:[
        `Include this scheduling link exactly: ${schedulingLink}`,
        'Mention the observers at least once.',
        'Answer from supplied emails and transcripts only.',
        'If the answer is not fully known, say what VAL can see and invite them to meet with Jessa.',
        'Do not expose internal scoring, hidden reasoning, or implementation details.',
        'Keep it concise enough to be read quickly, but specific enough to feel unmistakably contextual.'
      ]
    },null,2)
  };
}

function parseJsonObject(text){
  if(text&&typeof text==='object')return text;
  const raw=String(text||'').trim();
  if(!raw)return {};
  try{return JSON.parse(raw);}catch(_){}
  const start=raw.indexOf('{'),end=raw.lastIndexOf('}');
  if(start>=0&&end>start){
    try{return JSON.parse(raw.slice(start,end+1));}catch(_){}
  }
  return {};
}

function replySubject(email={}){
  const subject=String(email.subject||'your note').trim()||'your note';
  return /^re:/i.test(subject)?subject:`Re: ${subject}`;
}

function fallbackValInstantReply({email={},schedulingLink=DEFAULT_SCHEDULING_LINK}={}){
  const name=email.from?.name||email.sender?.name||'there';
  return {
    subject:replySubject(email),
    body:[
      `Hi ${name},`,
      '',
      'VAL saw that you invoked me here. I am reading this in the context of your thread with Jessa and the meeting/transcript record VAL has available, so the reply can protect the real relationship instead of treating this like a one-off inbox task.',
      '',
      `The clean next step is to meet with Jessa here: ${schedulingLink}`,
      '',
      'The observers will keep watching for the actual question, timing, and relationship context around this conversation so Jessa can walk in with the right memory, not just another calendar event.',
      '',
      'VAL'
    ].join('\n'),
    confidence:0.48,
    source_notes:['Fallback used because model output was unavailable.']
  };
}

function normalizeValInstantReplyOutput(output={},fallback={}){
  return {
    subject:compactText(output.subject||fallback.subject||'Re: your note',180),
    body:String(output.body||fallback.body||'').trim(),
    confidence:Math.max(0,Math.min(1,Number(output.confidence)||fallback.confidence||0.55)),
    source_notes:safeArray(output.source_notes||output.sourceNotes||fallback.source_notes).map(note=>compactText(note,240)).filter(Boolean).slice(0,8)
  };
}

function validateValInstantReply(reply={},schedulingLink=DEFAULT_SCHEDULING_LINK){
  const body=String(reply.body||'');
  const issues=[];
  if(!body.trim())issues.push('empty_body');
  if(!String(reply.subject||'').trim())issues.push('empty_subject');
  if(!body.includes(schedulingLink))issues.push('missing_scheduling_link');
  if(!/\bobservers?\b/i.test(body))issues.push('missing_observers_mention');
  if(/\b(i hope this email finds you well|circle back|touch base|at your earliest convenience|please do not hesitate)\b/i.test(body))issues.push('generic_email_filler');
  if(body.length>2200)issues.push('too_long');
  return {passes:issues.length===0,issues};
}

module.exports={
  DEFAULT_SCHEDULING_LINK,
  shouldAutoReplyToValInvocation,
  buildValInstantReplyPrompt,
  parseJsonObject,
  fallbackValInstantReply,
  normalizeValInstantReplyOutput,
  validateValInstantReply,
  replySubject
};
