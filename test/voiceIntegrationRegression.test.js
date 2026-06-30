'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
const dashboard=fs.readFileSync(path.join(root,'dashboard.html'),'utf8');
const commandCenter=fs.readFileSync(path.join(root,'command-center.js'),'utf8');
const commandCss=fs.readFileSync(path.join(root,'command-center.css'),'utf8');

test('voice playback uses server-side Deepgram TTS proxy instead of browser-side token calls',()=>{
  assert.match(server,/const DEEPGRAM_API_KEY = process\.env\.DEEPGRAM_API_KEY/);
  assert.match(server,/app\.post\('\/api\/val\/tts'/);
  assert.match(server,/https:\/\/api\.deepgram\.com\/v1\/speak\?model=/);
  assert.match(server,/X-VAL-TTS-Provider/);
  assert.match(dashboard,/\/api\/val\/tts/);
  assert.doesNotMatch(dashboard,/fetch\('https:\/\/api\.deepgram\.com\/v1\/speak/);
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

test('voice defaults to Deepgram Aura 2 Cora without provider-facing fallback warnings',()=>{
  assert.match(server,/aura-2-cora-en/);
  assert.match(dashboard,/VAL voice is using temporary browser audio for this turn/);
  assert.match(dashboard,/\/api\/val\/voice\/test/);
  assert.match(dashboard,/VAL voice is ready/);
  assert.match(dashboard,/voiceTtsWarnedAt/);
  assert.match(dashboard,/endpointing=800/);
});

test('dashboard exposes obvious voice chat and meeting mode entry points',()=>{
  assert.match(dashboard,/Voice Chat/);
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

test('home keeps calendar rail and opens a clean VAL chat overlay',()=>{
  assert.match(commandCss,/grid-template-columns:minmax\(0,1fr\) var\(--val-cal-w\)/);
  assert.match(commandCss,/\.rpanel\{display:flex!important;flex-direction:column!important/);
  assert.match(commandCss,/\.week-scroll\{[^}]*overflow:auto!important/);
  assert.match(dashboard,/el\.className='gchat-overlay'/);
  assert.match(dashboard,/\.gchat-overlay\{[^}]*position:fixed/);
  assert.match(dashboard,/\.gchat-modal\{[^}]*width:min\(1180px/);
  assert.match(dashboard,/\.gchat-modal\{[^}]*background:#fbfaf7/);
  assert.match(dashboard,/\.gchat-sidebar\{[^}]*linear-gradient/);
  assert.match(dashboard,/class="gchat-modal"/);
  assert.match(dashboard,/class="gchat-sidebar"/);
  assert.match(dashboard,/class="gchat-input-row"/);
  assert.match(dashboard,/class="gchat-send"/);
  assert.match(dashboard,/class="val-face"/);
  assert.match(commandCenter,/class="val-face"/);
  assert.match(dashboard,/@keyframes valFaceFloat/);
  assert.match(dashboard,/\.val-talk-button\{[^}]*linear-gradient\(145deg,#f8d98b/);
  assert.match(dashboard,/\.val-home-send\{[^}]*background:#07182d/);
  assert.doesNotMatch(dashboard,/id='gchatOverlay';\s*el\.style\.cssText=/);
});

test('voice waits for Deepgram before falling back to browser speech',()=>{
  assert.match(dashboard,/controller\.abort\(\);\}catch\(e\)\{\}\},6500\)/);
  assert.doesNotMatch(dashboard,/fallbackTimer=setTimeout\(fallbackOnce,900\)/);
  assert.match(dashboard,/curAudio\.onerror=function\(\)\{URL\.revokeObjectURL\(url\);curAudio=null;fallbackOnce\(\);\}/);
});
