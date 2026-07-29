const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
const dashboard=fs.readFileSync(path.join(root,'dashboard.html'),'utf8');
const commandCenter=fs.readFileSync(path.join(root,'command-center.js'),'utf8');
const hearth=fs.readFileSync(path.join(root,'hearth-prototype.html'),'utf8');
const hearthJs=fs.readFileSync(path.join(root,'hearth-prototype.js'),'utf8');
const cleanDashboard=fs.readFileSync(path.join(root,'jessa-clean-dashboard.html'),'utf8');
const cleanDashboardJs=fs.readFileSync(path.join(root,'jessa-clean-dashboard.js'),'utf8');

test('tenant API key vault has provider registry and encrypted storage tables',()=>{
  assert.match(server,/TENANT_API_KEY_PROVIDER_REGISTRY/);
  for(const provider of ['openai','anthropic','outscraper','rocketreach','apollo']){
    assert.match(server,new RegExp(`${provider}:\\{providerId:'${provider}'`));
  }
  assert.match(server,/create table if not exists tenant_api_keys/);
  assert.match(server,/create table if not exists tenant_provider_approvals/);
  assert.match(server,/encrypted_secret text not null/);
  assert.match(server,/key_preview text/);
  assert.match(server,/tenant_api_keys_lookup_idx/);
  assert.match(server,/tenant_provider_approvals_lookup_idx/);
  assert.match(server,/encryptSecret\(secret\)/);
  assert.match(server,/decryptSecret\(encrypted\)/);
  assert.match(server,/ENCRYPTION_KEY is required to save tenant API keys/);
});

test('tenant API key routes support list save delete test requirements and approval',()=>{
  assert.match(server,/app\.get\('\/api\/tenant-api-keys\/providers',requirePermission\('settings:manage'\)/);
  assert.match(server,/app\.get\('\/api\/tenant-api-keys\/status',requirePermission\('settings:manage'\)/);
  assert.match(server,/app\.get\('\/api\/tenant-api-keys\/providers\/:provider\/requirements',requirePermission\('settings:manage'\)/);
  assert.match(server,/app\.post\('\/api\/tenant-api-keys\/:provider',requirePermission\('settings:manage'\)/);
  assert.match(server,/app\.delete\('\/api\/tenant-api-keys\/:provider',requirePermission\('settings:manage'\)/);
  assert.match(server,/app\.post\('\/api\/tenant-api-keys\/:provider\/test',requirePermission\('settings:manage'\)/);
  assert.match(server,/app\.post\('\/api\/tenant-api-keys\/providers\/:provider\/approval',requirePermission\('settings:manage'\)/);
  assert.match(server,/tenantProviderApproval/);
  assert.match(server,/approveTenantProvider/);
  assert.match(server,/This connection requires approval before it can be added to your VAL/);
});

test('runtime resolver prefers tenant vault and permits an explicit platform fallback',()=>{
  assert.match(server,/function platformKeyFallbackAllowed/);
  assert.match(server,/VAL_ALLOW_PLATFORM_KEY_FALLBACK/);
  assert.match(server,/async function resolveTenantApiKey/);
  assert.match(server,/using tenant vault key/);
  assert.match(server,/using legacy tenant credential/);
  assert.match(server,/using platform\/demo fallback/);
  assert.match(server,/async function resolveIntegrationSecret/);
  assert.match(server,/tenantApiKeyProvider\(provider\)/);
  assert.match(server,/platformKeyFallbackAllowed\(\) \? \(fallback \|\| ''\) : ''/);
  assert.match(server,/async function resolveOpenAIKey\(\)\{ return RUNTIME_OPENAI_KEY \|\| resolveIntegrationSecret\('openai','api_key',OPENAI_KEY\); \}/);
  assert.match(server,/async function resolveAnthropicKey\(\)\{ return resolveIntegrationSecret\('anthropic','api_key',ANTHROPIC_KEY\); \}/);
  assert.match(server,/Tenant OpenAI key could not generate a response; using the approved platform fallback/);
  assert.match(server,/platformKeyFallbackAllowed\('openai'\)/);
});

test('OpenAI tenant key validation proves that the key can generate a response',()=>{
  const testBlock=server.match(/async function testTenantApiKey[\s\S]*?\n}\nfunction platformKeyFallbackAllowed/)?.[0]||'';
  assert.match(testBlock,/https:\/\/api\.openai\.com\/v1\/responses/);
  assert.match(testBlock,/could not generate a response/);
  assert.match(testBlock,/Reply with OK\./);
  assert.doesNotMatch(testBlock,/json_object/);
  assert.doesNotMatch(testBlock,/https:\/\/api\.openai\.com\/v1\/models/);
});

test('API Keys & Connections UI is exposed under settings navigation',()=>{
  assert.match(commandCenter,/settings_api_keys/);
  assert.match(commandCenter,/API Keys & Connections/);
  assert.match(commandCenter,/settings_api_keys:'openKeysPanel'/);
  assert.match(dashboard,/API Keys & Connections/);
  assert.match(dashboard,/api\/tenant-api-keys\/status/);
  assert.match(dashboard,/tenantApiKeyProviders/);
  assert.match(dashboard,/renderTenantApiKeyCard/);
  assert.match(dashboard,/saveTenantApiKey/);
  assert.match(dashboard,/deleteTenantApiKey/);
  assert.match(dashboard,/testTenantApiKey/);
  assert.match(dashboard,/Client-owned provider keys live here, encrypted per tenant/);
  assert.match(dashboard,/No silent platform-key fallback/);
  assert.doesNotMatch(dashboard,/Full keys never show after save[\s\S]*value="\$\{/);
});

test('missing user-owned OpenAI key gates the authenticated Hearth before any other route',()=>{
  assert.match(server,/const approvedServiceKey=!!\(OPENAI_KEY&&platformKeyFallbackAllowed\('openai'\)\)/);
  assert.match(server,/requiresOpenAIKey:!openai\.connected/);
  assert.doesNotMatch(server,/requiresOpenAIKey:!openai\.connected&&!continuationAllowed/);
  assert.match(hearthJs,/async function enforceOpenAIConnectionOnDashboardEntry\(\)/);
  assert.match(hearthJs,/openValOpenAISetup\('dashboard',\{mandatory:true,afterConnect:'dashboard'\}\)/);
  assert.match(hearthJs,/if\(openAiSetupRequired\) return;/);
  assert.match(hearthJs,/window\.setTimeout\(initializeAuthenticatedDashboardEntry,120\)/);
  assert.match(hearthJs,/No Jessa or shared client AI key will be used for your work/);
  assert.match(hearthJs,/https:\/\/platform\.openai\.com\/api-keys/);
});

test('clean dashboard exposes Google connection as a first-run user action',()=>{
  assert.match(server,/app\.get\('\/dashboard',\(req,res\)=>\{res\.set\('Cache-Control','no-store, max-age=0'\);res\.sendFile\(path\.join\(__dirname,'hearth-prototype\.html'\)\);\}\);/);
  assert.match(server,/app\.get\('\/witnessing-dashboard'/);
  assert.match(hearth,/Connect inbox\/calendar/);
  assert.match(hearth,/data-calendar-source-status/);
  assert.match(hearth,/data-google-oauth/);
  assert.match(hearthJs,/\/api\/setup-health/);
  assert.match(hearthJs,/function connectGoogleOAuth/);
  assert.match(hearthJs,/window\.location\.assign\('\/auth\/google'\)/);
  assert.match(hearthJs,/fullCalendarPanel\?\.addEventListener\('click'/);
  assert.match(hearthJs,/workspaceInputPanel\.addEventListener\('click'/);
  assert.match(cleanDashboard,/Connect Google/);
  assert.match(cleanDashboard,/href="\/auth\/google"/);
  assert.match(cleanDashboard,/id="google-connection-status"/);
  assert.match(cleanDashboardJs,/\/api\/setup-health/);
  assert.match(cleanDashboardJs,/Reconnect Google/);
});
