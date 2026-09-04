function text(value,fallback=''){
  return String(value ?? fallback ?? '').trim();
}

function escapeHtml(value){
  return text(value).replace(/[&<>"']/g,(char)=>({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    "'":'&#39;'
  }[char]));
}

function setText(selector,value){
  const node=document.querySelector(selector);
  if(node) node.textContent=text(value);
}

function renderList(selector,items=[]){
  const node=document.querySelector(selector);
  if(!node) return;
  node.innerHTML=(items||[]).map(item=>`<li>${escapeHtml(item)}</li>`).join('');
}

function renderStats(stats={}){
  Object.entries(stats).forEach(([key,value])=>{
    setText(`[data-stat="${key}"]`,Number(value||0).toLocaleString());
  });
}

function renderLeadModel(model={}){
  setText('[data-lead-model-target]',model.target||'');
  const fields=document.querySelector('[data-lead-model-fields]');
  if(fields){
    fields.innerHTML=(model.fields||[]).map(field=>`<span>${escapeHtml(field)}</span>`).join('');
  }
}

function renderTranscript(transcript={}){
  setText('[data-transcript-title]',transcript.title||'Scott / Jessa Transcript');
  setText('[data-transcript-status]',transcript.status==='seeded_now_automation_next'?'Seeded now; automation next':'Current');
  const excerpts=document.querySelector('[data-transcript-excerpts]');
  if(excerpts){
    excerpts.innerHTML=(transcript.excerpts||[]).map(item=>`<p>${escapeHtml(item)}</p>`).join('');
  }
  setText('[data-transcript-text]',transcript.rawText||'Transcript has not been loaded yet.');
}

function sourceLinks(urls=[]){
  const links=(urls||[]).slice(0,3);
  if(!links.length) return '<small>No source URL saved yet</small>';
  return `<div class="source-links">${links.map(url=>`<a href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(url)}</a>`).join('')}</div>`;
}

function renderLeads(leads=[]){
  const body=document.querySelector('[data-leads-body]');
  if(!body) return;
  if(!leads.length){
    body.innerHTML='<tr class="empty-row"><td colspan="6">No Frisson Partner leads have been approved into GHL for Scott yet.</td></tr>';
    setText('[data-lead-sync-status]','Waiting for approved partner imports');
    return;
  }
  setText('[data-lead-sync-status]',`${leads.length} partner lead${leads.length===1?'':'s'} synced from GHL imports`);
  body.innerHTML=leads.map((lead)=>{
    const scoring=lead.scoring||{};
    const handoff=lead.handoff||{};
    return `
      <tr>
        <td>
          <strong>${escapeHtml(lead.companyName||'Unnamed prospect')}</strong>
          <small>${escapeHtml(lead.website||'Website not saved')}</small>
          ${sourceLinks(lead.sourceUrls)}
        </td>
        <td>
          <span class="fit-label">${escapeHtml(scoring.convergenceFitLabel||'Needs review')}</span>
          <small>${Number(scoring.convergenceFitScore||0)}/100 Convergence fit</small>
          <small>Lead score ${escapeHtml(scoring.leadScore||'')}</small>
        </td>
        <td>
          <strong>${escapeHtml(scoring.likelySavingsCategory||'Unknown')}</strong>
          <small>${escapeHtml(scoring.estimatedAnnualItSpend||'Spend not qualified')}</small>
          <small>Cloud: ${escapeHtml(scoring.cloudDependency||'Unknown')} | Data revenue: ${escapeHtml(scoring.dataRevenuePotential||'Unknown')}</small>
        </td>
        <td>
          <strong>${escapeHtml(scoring.decisionMakerAccess||'Needs path')}</strong>
          <small>Nonprofit-facing: ${escapeHtml(scoring.nonprofitFacing||'Unknown')}</small>
          <small>AI governance: ${escapeHtml(scoring.aiGovernanceNeed||'Unknown')}</small>
        </td>
        <td>
          <strong>${escapeHtml(handoff.scottSummary||'Qualify annual IT spend and CTO/CFO access.')}</strong>
          <small>${escapeHtml(handoff.outreachAngle||'')}</small>
        </td>
        <td>
          <strong>${escapeHtml(lead.pipelineName||'Frisson Partners')}</strong>
          <small>${escapeHtml(lead.stageName||'New Partner Lead')}</small>
          <small>${escapeHtml(lead.contactId||'No contact id saved')}</small>
        </td>
      </tr>
    `;
  }).join('');
}

async function loadDashboard(){
  try{
    const response=await fetch('/api/frisson/scott-integrity-dashboard',{credentials:'same-origin'});
    const data=await response.json().catch(()=>({}));
    if(!response.ok || data.ok===false) throw new Error(data.error||'Dashboard could not load.');
    renderStats(data.stats||{});
    renderList('[data-positioning="graceIntelligence"]',data.positioning?.graceIntelligence||[]);
    renderList('[data-positioning="frissonConsulting"]',data.positioning?.frissonConsulting||[]);
    renderList('[data-positioning="convergence"]',data.positioning?.convergence||[]);
    renderLeadModel(data.leadModel||{});
    renderTranscript(data.transcript||{});
    renderLeads(data.leads||[]);
  }catch(error){
    const body=document.querySelector('[data-leads-body]');
    if(body) body.innerHTML=`<tr class="empty-row"><td colspan="6">${escapeHtml(error.message||'Dashboard could not load.')}</td></tr>`;
    setText('[data-transcript-text]',error.message||'Dashboard could not load.');
  }
}

loadDashboard();
