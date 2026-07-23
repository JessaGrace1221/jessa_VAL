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
  assert.match(hearth,/const voiceFastLane = Boolean\(valCoworkVoiceState\.active && mode !== 'meeting_prep'\);/);
  assert.match(hearth,/const chatFastLane = Boolean\(keepHomeCoworkOpen && mode !== 'meeting_prep' && !heldContext && !activeProjectCoworkTarget\);/);
  assert.match(hearth,/latencyMode: voiceFastLane \? 'voice_fast' : \(conversationFastLane \? 'chat_fast' : 'full_context'\)/);
  assert.match(hearth,/showCoworkContextGathering\('VAL is thinking with you\.', \{noTimeout:true\}\);/);
  assert.doesNotMatch(hearth,/showCoworkContextGathering\('VAL is writing the meeting brief from the gathered packet\.'\)/);
  assert.match(server,/function hearthFastChatEnabled/);
  assert.match(server,/Fast Hearth Co-Work lane/);
  assert.match(server,/Do not fetch, imply, or wait for Gmail, Drive, GHL, transcripts, uploaded documents, or executive briefing context/);
  assert.match(server,/maxTokens:voiceMode\?260:520/);
  assert.match(server,/fastHearthChat:true/);
});
