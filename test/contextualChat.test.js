const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
const dashboard=fs.readFileSync(path.join(root,'dashboard.html'),'utf8');

test('contextual chat recognizes corrections before save/update intents',()=>{
  assert.match(server,/function chatContextCorrection/);
  assert.match(server,/const correction=chatContextCorrection\(lastUser\)/);
  assert.match(server,/if\(correction\)\{/);
  assert.match(server,/Oh\. I should have known that/);
  assert.match(server,/you are still the most important person on any list/);
  assert.match(server,/const intent=chatContextIntent\(lastUser\)/);
  assert.ok(server.indexOf('const correction=chatContextCorrection(lastUser)')<server.indexOf('const intent=chatContextIntent(lastUser)'));
});

test('contextual chat quick prompts are human-facing instead of form commands',()=>{
  assert.match(dashboard,/Tell me what I should understand, what I got wrong, or what you want moved forward/);
  assert.match(dashboard,/Remember the important context from this conversation/);
  assert.doesNotMatch(dashboard,/Update VAL memory with what should be remembered from this context/);
});

test('VAL has a shared conversational contract for user-facing chat and voice',()=>{
  assert.match(server,/Deep conversational standard for every user-facing voice or chat response/);
  assert.match(server,/Sound like a present, emotionally intelligent partner/);
  assert.match(server,/First show that you understood the human meaning/);
  assert.match(server,/If the user corrects you, respond relationally before operationally/);
  assert.match(server,/Avoid generic receipt language/);
});

test('selected source Co-Work answers from the loaded envelope instead of dead-ending on timeout',()=>{
  assert.match(server,/Selected envelope:/);
  assert.match(server,/Selected working brief/);
  assert.match(server,/selectedSourceContext\.contextLines/);
  assert.match(server,/selectedSourceContext\.sourceBrief/);
  assert.match(server,/function selectedSourceWorkingBrief/);
  assert.match(server,/function selectedSourceContextEvidenceLines/);
  assert.match(server,/function selectedSourceEvidenceBundle/);
  assert.match(server,/function selectedSourceSection/);
  assert.match(server,/function selectedHearthSourceFallbackAnswer/);
  assert.match(server,/function selectedHearthSourceDirectAnswer/);
  assert.match(server,/const directSelectedAnswer=selectedHearthSourceDirectAnswer/);
  assert.match(server,/if\(hasSelectedSourceContext\)\{/);
  assert.match(server,/selectedSourceDirect:true/);
  assert.match(server,/asksForLoadedContext/);
  assert.match(server,/I have \$\{envelopeLabel\} loaded/);
  assert.match(server,/timeoutMs:artifactRequest\?12000:9000/);
  assert.match(server,/text\.slice\(0,6000\)/);
  assert.match(server,/selectedSourceFallback:fallbackUsed\|\|!content/);
  assert.match(server,/Selected source context JSON/);
  assert.match(server,/contextLines=Array\.from\(new Set\(selectedSourceContextEvidenceLines\(source\)/);
  assert.match(server,/sourceBrief\|source_brief\|contextLines\|context_lines/);
  assert.match(server,/workingBrief\|working_brief/);
  assert.match(server,/sourceContext\|source_context/);
  assert.match(server,/Do not ask what "this" is when the selected source contains the needed context/);
  assert.match(server,/Here is the working outline from the loaded packet/);
  assert.match(server,/What the dashboard needs to contain/);
  assert.match(server,/People\/context named in the packet/);
  assert.match(server,/GOALL\|Goal Agency\|dashboard\|projection\|handoff\|Mike/);
  assert.match(server,/function selectedSourceIframeDraft/);
  assert.match(server,/I have the selected packet loaded, so I am not going to ask what "this" is/);
  assert.match(server,/Here is a clean iframe-ready first version based on the loaded context/);
  assert.match(server,/<title>'\+selectedSourceHtmlEscape\(titleText\)\+'<\/title>/);
  assert.match(server,/asksForFullArtifact&&\/\\b\(html\|css\|iframe\|embed\|dashboard\|page\|template\|code\|build\|create\)\\b\/i\.test\(text\)/);
});
