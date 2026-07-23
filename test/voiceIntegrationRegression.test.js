'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
const dashboard=fs.readFileSync(path.join(root,'dashboard.html'),'utf8');
const hearth=fs.readFileSync(path.join(root,'hearth-prototype.js'),'utf8');

test('voice playback uses server-side Deepgram TTS proxy instead of browser-side token calls',()=>{
  assert.match(server,/const DEEPGRAM_API_KEY = process\.env\.DEEPGRAM_API_KEY/);
  assert.match(server,/app\.post\('\/api\/val\/tts'/);
  assert.match(server,/https:\/\/api\.deepgram\.com\/v1\/speak\?model=/);
  assert.match(server,/X-VAL-TTS-Provider/);
  assert.match(dashboard,/\/api\/val\/tts/);
  assert.match(hearth,/fetch\('\/api\/val\/tts'/);
  assert.match(hearth,/fetchValCoworkDeepgramAudio/);
  assert.doesNotMatch(dashboard,/fetch\('https:\/\/api\.deepgram\.com\/v1\/speak/);
  assert.doesNotMatch(hearth,/fetch\('https:\/\/api\.deepgram\.com\/v1\/speak/);
});

test('voice status exposes safe diagnostics without leaking the Deepgram key',()=>{
  assert.match(server,/app\.get\('\/api\/val\/voice\/status'/);
  assert.match(server,/app\.post\('\/api\/val\/voice\/test'/);
  assert.match(server,/ttsConfigured:!!DEEPGRAM_API_KEY/);
  assert.match(server,/ttsModel:deepgramTtsModel\(\)/);
  assert.match(server,/ttsModelSource:deepgramTtsModelSource\(\)/);
  assert.match(server,/ttsKeySource:deepgramKeySource\(\)/);
  assert.match(server,/lastTtsDiagnostic:lastDeepgramTtsDiagnostic/);
  assert.match(server,/voiceResponseTemperature:VAL_VOICE_RESPONSE_TEMPERATURE/);
  assert.doesNotMatch(server,/apiKey:DEEPGRAM_API_KEY/);
});

test('voice defaults to Deepgram Aura 2 Vesta without provider-facing fallback warnings',()=>{
  assert.match(server,/aura-2-vesta-en/);
  assert.match(dashboard,/VAL voice is using temporary browser audio for this turn/);
  assert.match(dashboard,/\/api\/val\/voice\/test/);
  assert.match(dashboard,/VAL voice is ready/);
  assert.match(dashboard,/voiceTtsWarnedAt/);
  assert.match(dashboard,/endpointing=800/);
});

test('dashboard exposes obvious voice co-work and meeting mode entry points',()=>{
  assert.match(dashboard,/Voice Co-Work/);
  assert.match(dashboard,/Meeting Mode/);
  assert.match(dashboard,/startVoiceChatMode\(\)/);
  assert.match(dashboard,/startMeetingPresenceMode\(\)/);
  assert.match(dashboard,/openGeneralChat\(\{welcome:true\}\)/);
  assert.match(dashboard,/what would you like to discuss or brainstorm/);
  assert.match(dashboard,/who are we meeting with today/);
  assert.match(dashboard,/I'll sit here quietly until you need me/);
  assert.match(dashboard,/Walk me through VAL/);
  assert.match(dashboard,/gchatStartPlatformTour/);
  assert.doesNotMatch(dashboard,/document\.getElementById\('voiceBtn'\)\.classList/);
});

test('voice waits for Deepgram before falling back to browser speech',()=>{
  assert.match(dashboard,/controller\.abort\(\);\}catch\(e\)\{\}\},6500\)/);
  assert.doesNotMatch(dashboard,/fallbackTimer=setTimeout\(fallbackOnce,900\)/);
  assert.match(dashboard,/curAudio\.onerror=function\(\)\{URL\.revokeObjectURL\(url\);curAudio=null;fallbackOnce\(\);\}/);
});

test('Hearth voice primes microphone access on click and keeps listening after silence',()=>{
  assert.match(hearth,/function primeValCoworkVoiceRecognition\(\)/);
  assert.match(hearth,/primeValCoworkVoiceRecognition\(\);\s*const greeting = valCoworkGreeting\(\);/);
  assert.match(hearth,/recognition\.onresult = \(\) => \{\};/);
  assert.match(hearth,/const errorName = String\(event\?\.error \|\| ''\);/);
  assert.match(hearth,/setValCoworkVoiceMode\('listening', 'VAL is still listening\.'\);/);
  assert.match(hearth,/valCoworkVoiceState\.listenAttempt === attempt/);
});

test('Hearth voice never swallows spoken prompts into unopened scoped sessions',()=>{
  assert.match(hearth,/const scopedEntryReady = Boolean\(entry\?\.sessionId && entry\.status !== 'opening'/);
  assert.match(hearth,/if\(scopedEntryReady && await submitActiveCoworkEntry\(spoken\)\) return;/);
  assert.match(hearth,/await runCowork\('think', spoken\);/);
});

test('Hearth Co-Work includes current calendar context for voice questions',()=>{
  assert.match(hearth,/function calendarCoworkContextLines\(limit = 6\)/);
  assert.match(hearth,/Current calendar context from the Hearth sidebar/);
  assert.match(hearth,/calendar: calendarContextLines/);
});

test('Hearth voice and plain Co-Work use the low-latency chat lane',()=>{
  assert.match(hearth,/const actionPrepLane = Boolean\(mode !== 'meeting_prep' && !heldContext && !activeProjectCoworkTarget && homeCoworkNeedsActionPrep\(visiblePrompt\)\);/);
  assert.match(hearth,/const needsFullValContext = Boolean\(mode !== 'meeting_prep' && !heldContext && !activeProjectCoworkTarget && homeCoworkNeedsFullValContext\(visiblePrompt\)\);/);
  assert.match(hearth,/const voiceFastLane = Boolean\(valCoworkVoiceState\.active && mode !== 'meeting_prep' && !needsFullValContext && !actionPrepLane\);/);
  assert.match(hearth,/const chatFastLane = Boolean\(keepHomeCoworkOpen && mode !== 'meeting_prep' && !heldContext && !activeProjectCoworkTarget && !needsFullValContext && !actionPrepLane\);/);
  assert.match(hearth,/latencyMode: actionPrepLane \? 'action_fast' : \(voiceFastLane \? 'voice_fast' : \(conversationFastLane \? 'chat_fast' : 'full_context'\)\)/);
  assert.match(hearth,/showCoworkContextGathering\('VAL is thinking with you\.', \{noTimeout:true\}\);/);
  assert.doesNotMatch(hearth,/showCoworkContextGathering\('VAL is writing the meeting brief from the gathered packet\.'\)/);
  assert.match(server,/function hearthFastChatEnabled/);
  assert.match(server,/function sendFastHearthChatNow/);
  assert.match(server,/function hearthFastNeedsFullValContext/);
  assert.match(server,/const immediateCalendarAnswer=hearthFastCalendarFallback\(lastUser,dashboard\);/);
  assert.match(server,/Fast Hearth Co-Work lane/);
  assert.match(server,/Do not fetch, imply, or wait for Gmail, Drive, GHL, transcripts, uploaded documents, or executive briefing context/);
  assert.match(server,/calendar, appointments, schedule, or meetings/);
  assert.match(server,/maxTokens:voiceMode\?260:520/);
  assert.match(server,/saveDeferred:true/);
  assert.match(server,/fastHearthChat:true/);
  assert.match(hearth,/timeoutMs: actionPrepLane \? 14000 : \(voiceFastLane \? 22000 : 28000\)/);
  assert.match(hearth,/function ensureValCoworkVoiceSurface/);
  assert.match(hearth,/console\.warn\('VAL voice turn failed:', error\);/);
});

test('Home VAL can leave fast lane for system-wide email and Stewardship context',()=>{
  assert.match(hearth,/function homeCoworkNeedsFullValContext/);
  assert.match(hearth,/function homeCoworkNeedsActionPrep/);
  assert.match(hearth,/homeCoworkNeedsFullValContext\(visiblePrompt\)/);
  assert.match(hearth,/I’m finding the right person and preparing the safest path/);
  assert.match(hearth,/if\(valCoworkVoiceState\.active\) speakValCoworkMessage\(fullContextDetail\);/);
  assert.match(server,/Gmail and Outlook are the email execution layers for provider drafts and email sends/);
  assert.match(server,/&& !hearthFastNeedsFullValContext\(lastUser\)/);
  assert.match(server,/if\(\/\\b\(send\|write\|compose\|draft\|create\|prepare\)\\b\[\\s\\S\]\{0,60\}\\b\(email\|reply\|message\)\\b\/i\.test\(value\)\) return false;/);
});

test('Home VAL external actions use a dedicated fast prep lane',()=>{
  assert.match(server,/function hearthActionIntent/);
  assert.match(server,/function hearthActionChatEnabled/);
  assert.match(server,/function hearthActionPrepContent/);
  assert.match(server,/^\s*if\(hearthActionChatEnabled\(req\.body\)\)\{/m);
  assert.match(server,/await valExternalActions\.createEmailSendPacket/);
  assert.match(server,/Say “Send” when you want me to send it/);
  assert.match(server,/What would you like the email to say\\?/);
  assert.match(server,/Who should I text\\?/);
  assert.match(server,/What should it remind you to do, and when\\?/);
  assert.match(server,/Who is it with, and what day and time should I use\\?/);
  assert.doesNotMatch(server,/VAL is checking contact context, Stewardship, and Gmail or Outlook email options/);
});

test('Home VAL voice supports source questions and spoken approval handoff',()=>{
  assert.match(hearth,/if\(\/\\bwitnessing\\b\/i\.test\(value\)\) return false;/);
  assert.match(server,/function hearthFastWitnessingFallback/);
  assert.match(server,/function hearthFastWitnessingSummary/);
  assert.match(server,/function hearthFastCapabilityFallback/);
  assert.match(server,/function hearthFastDefinitionFallback/);
  assert.match(server,/If your Witnessing Session has been completed and saved into VAL/);
  assert.match(server,/A mic handoff is the moment Voice stops listening/);
  assert.match(hearth,/let pendingHomeCoworkActionPacket = null;/);
  assert.match(hearth,/function isHomeCoworkActionConfirmation/);
  assert.match(hearth,/confirmPendingHomeCoworkActionPacket\(visiblePrompt\)/);
  assert.match(hearth,/encodeURIComponent\(packet\.id\) \+ '\/approve'/);
  assert.match(hearth,/finalConfirmation:true/);
  assert.match(hearth,/let pendingHomeCoworkActionDraft = null;/);
  assert.match(hearth,/Send ' \+ pendingHomeCoworkActionDraft\.contact\.name \+ ' an email saying:/);
});

test('GHL voice endpoint returns a flat speak field for custom actions',()=>{
  assert.match(server,/app\.post\('\/api\/val\/ghl\/voice-turn'/);
  assert.match(server,/function ghlVoiceUserMessage/);
  assert.match(server,/body\.user_request/);
  assert.match(server,/body\.userUtterance/);
  assert.match(server,/speak:content/);
  assert.match(server,/val_response:content/);
  assert.match(server,/GHL did not pass me the user’s words yet/);
});
