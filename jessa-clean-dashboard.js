const panels = {
  protocol: document.querySelector('#protocol-panel'),
  connections: document.querySelector('#connections-panel'),
  'lead-intelligence': document.querySelector('#lead-intelligence-panel')
};
const frissonPreviews = {
  organizations: null,
  partners: null
};

function setPanel(name){
  Object.entries(panels).forEach(([key, panel]) => panel?.classList.toggle('active', key === name));
  document.querySelectorAll('[data-panel]').forEach((button) => button.classList.toggle('active', button.dataset.panel === name));
}

function setGoogleConnectionStatus({connected = false, message = '', error = ''} = {}){
  const status = document.querySelector('#google-connection-status');
  const link = document.querySelector('#google-connect-link');
  if(!status) return;
  status.classList.toggle('connected', connected);
  status.classList.toggle('failed', !!error);
  const label = connected ? 'Google is connected.' : 'Google is not connected yet.';
  status.querySelector('strong').textContent = error || message || label;
  if(link) link.textContent = connected ? 'Reconnect Google' : 'Connect Google';
}

async function refreshGoogleConnectionStatus(){
  try{
    const response = await fetch('/api/setup-health', {credentials: 'same-origin'});
    const data = await response.json().catch(() => ({}));
    if(!response.ok) throw new Error(data.error || 'Could not check Google connection.');
    const google = data.google || {};
    if(google.connected){
      setGoogleConnectionStatus({connected: true});
    }else{
      setGoogleConnectionStatus({message: google.setupMessage || google.error || 'Connect Google to give VAL Gmail, Calendar, Drive, and Docs context.'});
    }
  }catch(error){
    setGoogleConnectionStatus({error: error.message || 'Could not check Google connection.'});
  }
}

document.addEventListener('click', (event) => {
  const panelButton = event.target.closest('[data-panel]');
  if(panelButton){
    setPanel(panelButton.dataset.panel);
  }
});

function scraperCard(type){
  return document.querySelector(`[data-frisson-scraper="${type}"]`);
}

function scraperPayload(type){
  const card = scraperCard(type);
  const value = (name, fallback = '') => card?.querySelector(`[data-scraper-field="${name}"]`)?.value?.trim() || fallback;
  return {
    market: value('market', 'United States'),
    keywords: value('keywords', ''),
    limit: Math.min(Math.max(Number(value('limit', '12')) || 12, 1), 100),
    enrichContacts: true
  };
}

function setScraperResult(text, isError = false){
  const result = document.querySelector('#frisson-scraper-result');
  if(!result) return;
  result.textContent = text || '';
  result.classList.toggle('failed', !!isError);
}

function setScraperBusy(type, busy){
  const card = scraperCard(type);
  const hasPreviewLeads = Array.isArray(frissonPreviews[type]?.leads) && frissonPreviews[type].leads.length > 0;
  card?.querySelectorAll('button').forEach((button) => {
    if(button.dataset.frissonImport) button.disabled = busy || !hasPreviewLeads;
    else button.disabled = !!busy;
  });
}

async function previewFrissonScraper(type){
  setScraperBusy(type, true);
  setScraperResult(`Running Frisson ${type} preview...`);
  try{
    const response = await fetch(`/api/frisson/${type}/discover-preview`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(scraperPayload(type))
    });
    const rawText = await response.text();
    let data = {};
    try{data = rawText ? JSON.parse(rawText) : {};}catch{data = {content:rawText};}
    if(!response.ok) throw new Error(data.content || data.error || rawText || `Could not preview Frisson ${type}.`);
    frissonPreviews[type] = data.ok && Array.isArray(data.leads) && data.leads.length ? data : null;
    const importButton = scraperCard(type)?.querySelector(`[data-frisson-import="${type}"]`);
    if(importButton) importButton.disabled = !(data.ok && Array.isArray(data.leads) && data.leads.length);
    setScraperResult(data.content || JSON.stringify(data, null, 2), !data.ok);
  }catch(error){
    frissonPreviews[type] = null;
    setScraperResult(error.message || `Could not preview Frisson ${type}.`, true);
  }finally{
    setScraperBusy(type, false);
  }
}

async function importFrissonScraper(type){
  const preview = frissonPreviews[type];
  if(!preview?.leads?.length){
    setScraperResult(`Run a Frisson ${type} preview before importing.`, true);
    return;
  }
  setScraperBusy(type, true);
  setScraperResult(`Importing approved Frisson ${type}...`);
  try{
    const response = await fetch(`/api/frisson/${type}/import-approved`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(preview)
    });
    const rawText = await response.text();
    let data = {};
    try{data = rawText ? JSON.parse(rawText) : {};}catch{data = {content:rawText};}
    if(!response.ok) throw new Error(data.content || data.error || rawText || `Could not import Frisson ${type}.`);
    setScraperResult(data.content || JSON.stringify(data, null, 2), !data.ok);
  }catch(error){
    setScraperResult(error.message || `Could not import Frisson ${type}.`, true);
  }finally{
    setScraperBusy(type, false);
  }
}

document.addEventListener('click', (event) => {
  const previewButton = event.target.closest('[data-frisson-preview]');
  if(previewButton) previewFrissonScraper(previewButton.dataset.frissonPreview);
  const importButton = event.target.closest('[data-frisson-import]');
  if(importButton) importFrissonScraper(importButton.dataset.frissonImport);
});

refreshGoogleConnectionStatus();
