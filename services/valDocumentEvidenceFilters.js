function firstText(...values){
  for(const value of values){
    const text=String(value||'').trim();
    if(text)return text;
  }
  return '';
}

const CALENDAR_INVITE_MIME_RE=/^(text\/calendar|text\/x-vcalendar|application\/(?:ics|calendar|x-ical)|application\/vnd\.ms-outlook)(?:\s*;.*)?$/i;

function calendarInviteValues(value={}){
  const raw=value&&typeof value==='object'?value:{};
  const nested=[
    raw,
    raw.raw,
    raw.attachment,
    raw.document,
    raw.raw?.attachment,
    raw.raw?.document
  ].filter(item=>item&&typeof item==='object');
  return nested.length?nested:[raw];
}

function documentLooksLikeCalendarInvite(value={}){
  const values=calendarInviteValues(value);
  const filenames=values.map(item=>firstText(
    item.filename,
    item.fileName,
    item.name,
    item.title,
    item.originalFilename,
    item.originalName,
    item.id,
    item.attachmentId
  )).join(' ');
  const mimeTypes=values.map(item=>firstText(
    item.mimeType,
    item.contentType,
    item.mediaType
  )).join(' ');
  const typeText=values.map(item=>firstText(
    item.type,
    item.kind,
    item.sourceType,
    item.source,
    item.origin
  )).join(' ');
  if(/(?:^|[\\/])[^\\/]*\.ics(?:$|[?#\s])/i.test(`${filenames} `))return true;
  if(/\b(?:invite|invitation|calendar|event)\.ics\b/i.test(filenames))return true;
  if(mimeTypes.split(/\s+/).some(type=>CALENDAR_INVITE_MIME_RE.test(type)))return true;
  return /\b(calendar_invite|icalendar|vcalendar)\b/i.test(typeText);
}

module.exports={documentLooksLikeCalendarInvite,CALENDAR_INVITE_MIME_RE};
