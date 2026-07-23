const test=require('node:test');
const assert=require('node:assert/strict');
const {
  GOOGLE_CALENDAR_WRITE_SCOPE,
  selectCalendarProvider,
  hasMicrosoftCalendarWriteScope
}=require('../services/valCalendarProviderPolicy');

test('calendar provider policy prefers Google, then Outlook, and never silently falls back to GHL',()=>{
  assert.equal(selectCalendarProvider({googleCalendarReady:true,outlookCalendarReady:true}),'google');
  assert.equal(selectCalendarProvider({googleCalendarReady:false,outlookCalendarReady:true}),'outlook');
  assert.equal(selectCalendarProvider({requested:'outlook',googleCalendarReady:true,outlookCalendarReady:true}),'outlook');
  assert.throws(()=>selectCalendarProvider({googleCalendarReady:false,outlookCalendarReady:false}),/No writable Google or Outlook calendar/);
  assert.equal(GOOGLE_CALENDAR_WRITE_SCOPE,'https://www.googleapis.com/auth/calendar.events');
});

test('Microsoft calendar write scope is checked explicitly',()=>{
  assert.equal(hasMicrosoftCalendarWriteScope({scope:'offline_access User.Read Calendars.ReadWrite Mail.Send'}),true);
  assert.equal(hasMicrosoftCalendarWriteScope({scope:'offline_access User.Read Calendars.Read'}),false);
});
