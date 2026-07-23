const GMAIL_SEND_SCOPE='https://www.googleapis.com/auth/gmail.send';
const MICROSOFT_SEND_SCOPE='Mail.Send';

function normalizeProvider(value='auto'){
  const provider=String(value||'auto').trim().toLowerCase();
  if(provider.includes('outlook')||provider.includes('microsoft'))return 'outlook';
  if(provider.includes('gmail')||provider.includes('google'))return 'gmail';
  return 'auto';
}

function selectEmailProvider({requested='auto',gmailSendReady=false,outlookSendReady=false}={}){
  const provider=normalizeProvider(requested);
  if(provider==='gmail'){
    if(gmailSendReady)return 'gmail';
    throw new Error('Gmail send permission is missing. Reconnect Google in Data Connections.');
  }
  if(provider==='outlook'){
    if(outlookSendReady)return 'outlook';
    throw new Error('Outlook send permission is missing. Reconnect Microsoft in Data Connections.');
  }
  if(gmailSendReady)return 'gmail';
  if(outlookSendReady)return 'outlook';
  throw new Error('No send-capable Gmail or Outlook connection is available. Reconnect one in Data Connections.');
}

function hasMicrosoftSendScope(tokens={}){
  const scopes=String(tokens?.scope||'').split(/\s+/).map(scope=>scope.trim().toLowerCase()).filter(Boolean);
  return scopes.includes(MICROSOFT_SEND_SCOPE.toLowerCase());
}

module.exports={
  GMAIL_SEND_SCOPE,
  MICROSOFT_SEND_SCOPE,
  normalizeProvider,
  selectEmailProvider,
  hasMicrosoftSendScope
};
