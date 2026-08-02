const form = document.querySelector('[data-upload-form]');
const fileInput = document.querySelector('[data-csv-file]');
const tagInput = document.querySelector('[data-source-tag]');
const submitButton = document.querySelector('[data-upload-submit]');
const importButton = document.querySelector('[data-import-button]');
const statusNode = document.querySelector('[data-run-status]');
const messageNode = document.querySelector('[data-run-message]');
const leadList = document.querySelector('[data-lead-list]');
const counts = {
  businesses: document.querySelector('[data-count-businesses]'),
  decisionMakers: document.querySelector('[data-count-decision-makers]'),
  addable: document.querySelector('[data-count-addable]')
};

let currentRun = null;
let pollTimer = null;
const uploadKey = cleanText(new URLSearchParams(window.location.search).get('key') || new URLSearchParams(window.location.search).get('token') || '');
const api = uploadKey
  ? {
      upload:'/api/public/goall/rep-upload/staged-runs',
      statusBase:'/api/public/goall/rep-upload/staged-runs',
      import:'/api/public/goall/rep-upload/import-approved',
      authHint:'Ask the GOALL admin for the current upload link.'
    }
  : {
      upload:'/api/val/leads/upload-csv-staged-runs',
      statusBase:'/api/val/leads/staged-runs',
      import:'/api/val/leads/import-approved',
      authHint:'Open VAL in this browser first, then return to this GHL link and try again.'
    };

function cleanText(value){
  return String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
}

function escapeHtml(value){
  return cleanText(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

function setWorking(working){
  submitButton.disabled = working;
  fileInput.disabled = working;
  tagInput.disabled = working;
}

function setStatus(label, message){
  statusNode.textContent = label;
  messageNode.textContent = message;
}

async function readJson(response){
  const text = await response.text();
  let data = {};
  try{ data = text ? JSON.parse(text) : {}; }catch(_error){ data = {error:text}; }
  if(!response.ok || data.ok === false){
    const authHint = response.status === 401 ? api.authHint : '';
    throw new Error([data.error || response.statusText || 'Request failed.', authHint].filter(Boolean).join(' '));
  }
  return data;
}

function requestHeaders(extra = {}){
  return uploadKey ? {...extra, 'x-goall-rep-upload-token':uploadKey} : extra;
}

async function postForm(url, formData){
  return readJson(await fetch(url, {method:'POST', body:formData, credentials:'same-origin', headers:requestHeaders()}));
}

async function postJson(url, body){
  return readJson(await fetch(url, {
    method:'POST',
    credentials:'same-origin',
    headers:requestHeaders({'Content-Type':'application/json'}),
    body:JSON.stringify(body || {})
  }));
}

async function getJson(url){
  return readJson(await fetch(url, {credentials:'same-origin', cache:'no-store', headers:requestHeaders()}));
}

function leadName(lead){
  return cleanText(lead.organizationName || lead.companyName || lead.businessName || lead.name || 'Unnamed business');
}

function personName(lead){
  return cleanText(lead.decisionMakerName || lead.contactName || lead.primaryContact || '');
}

function addableLeads(run){
  return (run?.reviewLeads || []).filter((lead) => lead && lead._approved !== false && !lead.reviewNeeded);
}

function rowStatus(lead){
  if(!lead) return 'Researching';
  if(lead.reviewNeeded || lead._approved === false) return 'Needs review';
  if(personName(lead)) return 'Addable';
  return 'Addable business contact';
}

function renderRun(run){
  currentRun = run;
  const runCounts = run.counts || {};
  const addable = addableLeads(run);
  counts.businesses.textContent = String(runCounts.businesses || (run.businesses || []).length || 0);
  counts.decisionMakers.textContent = String(runCounts.decisionMakers || (run.decisionMakers || []).length || 0);
  counts.addable.textContent = String(runCounts.addableReady || addable.length || 0);
  setStatus((run.status || 'running').toUpperCase(), run.message || 'The GOALL enrichment system is working.');
  importButton.disabled = run.status !== 'complete' || !addable.length;
  importButton.textContent = addable.length ? `Import ${addable.length} addable lead${addable.length === 1 ? '' : 's'}` : 'No addable leads yet';

  const stageRows = Array.isArray(run.stageRows) && run.stageRows.length ? run.stageRows : [];
  const rows = stageRows.length ? stageRows : (run.reviewLeads || []).map((lead) => ({business:lead, decision:lead, review:lead}));
  if(!rows.length){
    leadList.innerHTML = '<article><strong>Reading upload</strong><span>Businesses will appear here as the file moves through enrichment.</span></article>';
    return;
  }
  leadList.innerHTML = rows.map((row) => {
    const business = row.business || {};
    const review = row.review || null;
    const decision = row.decision || review || {};
    const name = leadName(business);
    const person = personName(decision);
    const hold = review && (review.reviewNeeded || review._approved === false);
    const detail = person
      ? `${person}${decision.decisionMakerTitle ? ', ' + decision.decisionMakerTitle : ''}`
      : (row.step2Status === 'waiting' ? 'Waiting for decision-maker research' : 'No verified person yet');
    const evidence = cleanText(review?.painpoint || review?.painPoint || review?.reviewNeededReason || review?.leadScoreReason || review?.reasonForScore || '');
    return [
      `<article data-hold="${hold ? 'true' : 'false'}">`,
      `<strong>${escapeHtml(name)}</strong>`,
      `<span>${escapeHtml(detail)}</span>`,
      evidence ? `<small>${escapeHtml(evidence)}</small>` : '',
      `<b>${escapeHtml(rowStatus(review))}</b>`,
      '</article>'
    ].join('');
  }).join('');
}

async function pollRun(runId){
  if(pollTimer) window.clearTimeout(pollTimer);
  const run = await getJson(`${api.statusBase}/${encodeURIComponent(runId)}`);
  renderRun(run);
  if(run.status === 'running' || run.status === 'queued'){
    pollTimer = window.setTimeout(() => {
      pollRun(runId).catch((error) => {
        setWorking(false);
        setStatus('Needs attention', error.message);
      });
    }, 1400);
  }else{
    setWorking(false);
  }
}

async function uploadCsv(event){
  event.preventDefault();
  const file = fileInput.files && fileInput.files[0];
  const sourceTag = cleanText(tagInput.value);
  if(!sourceTag){
    tagInput.focus();
    setStatus('Needs tag', 'Add a source tag before uploading.');
    return;
  }
  if(!file){
    fileInput.focus();
    setStatus('Needs file', 'Choose a CSV file before uploading.');
    return;
  }
  setWorking(true);
  importButton.disabled = true;
  setStatus('Starting', 'Uploading the CSV and starting GOALL enrichment.');
  leadList.innerHTML = '<article><strong>Starting upload</strong><span>Nothing has been imported yet.</span></article>';
  const csvText = await file.text().catch(() => '');
  const rowCount = Math.max(0, csvText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).length - 1);
  const formData = new FormData();
  formData.append('file', file);
  formData.append('leadProfile', 'goall');
  formData.append('sourceType', 'csv_upload');
  formData.append('importTag', sourceTag);
  formData.append('sourceTag', sourceTag);
  formData.append('csvSourceTag', sourceTag);
  if(rowCount) formData.append('limit', String(Math.min(rowCount, 100)));
  const run = await postForm(api.upload, formData);
  renderRun(run);
  await pollRun(run.runId);
}

async function importAddable(){
  const leads = addableLeads(currentRun);
  if(!currentRun || !leads.length) return;
  importButton.disabled = true;
  setStatus('Importing', 'Sending addable enriched leads to GHL.');
  const sourceTag = cleanText(currentRun.payload?.importTag || currentRun.payload?.sourceTag || tagInput.value);
  const result = await postJson(api.import, {
    ...(currentRun.payload || {}),
    leadProfile:'goall',
    sourceType:'csv_upload',
    importTag:sourceTag,
    sourceTag,
    leads,
    searchPlan:currentRun.searchPlan || null,
    report:currentRun.report || null
  });
  const created = result.created || [];
  const failed = result.failed || [];
  setStatus('Imported', `Imported ${created.length} lead${created.length === 1 ? '' : 's'} to GHL${failed.length ? `; ${failed.length} failed` : ''}.`);
  importButton.textContent = 'Imported';
  importButton.disabled = true;
}

form.addEventListener('submit', (event) => {
  uploadCsv(event).catch((error) => {
    setWorking(false);
    setStatus('Needs attention', error.message);
  });
});

importButton.addEventListener('click', () => {
  importAddable().catch((error) => {
    importButton.disabled = false;
    setStatus('Import needs attention', error.message);
  });
});
