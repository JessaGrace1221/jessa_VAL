const GOOGLE_CALENDAR_WRITE_SCOPE='https://www.googleapis.com/auth/calendar.events';
const MICROSOFT_CALENDAR_WRITE_SCOPE='Calendars.ReadWrite';

function normalizeProvider(value='auto'){
  const provider=String(value||'auto').trim().toLowerCase();
  if(provider.includes('outlook')||provider.includes('microsoft'))return 'outlook';
  if(provider.includes('google'))return 'google';
  return 'auto';
}

function selectCalendarProvider({requested='auto',googleCalendarReady=false,outlookCalendarReady=false}={}){
  const provider=normalizeProvider(requested);
  if(provider==='google'){
    if(googleCalendarReady)return 'google';
    throw new Error('Google Calendar write permission is missing. Reconnect Google in Data Connections.');
  }
  if(provider==='outlook'){
    if(outlookCalendarReady)return 'outlook';
    throw new Error('Outlook Calendar write permission is missing. Reconnect Microsoft in Data Connections.');
  }
  if(googleCalendarReady)return 'google';
  if(outlookCalendarReady)return 'outlook';
  throw new Error('No writable Google or Outlook calendar connection is available. Reconnect one in Data Connections.');
}

function hasMicrosoftCalendarWriteScope(tokens={}){
  const scopes=String(tokens?.scope||'').split(/\s+/).map(scope=>scope.trim().toLowerCase()).filter(Boolean);
  return scopes.includes(MICROSOFT_CALENDAR_WRITE_SCOPE.toLowerCase());
}

module.exports={
  GOOGLE_CALENDAR_WRITE_SCOPE,
  MICROSOFT_CALENDAR_WRITE_SCOPE,
  normalizeProvider,
  selectCalendarProvider,
  hasMicrosoftCalendarWriteScope
};
