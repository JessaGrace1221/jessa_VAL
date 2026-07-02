(function(){
'use strict';
var transcriptState={items:[],counts:{total:0,needsReview:0,withOpenActions:0,failedProcessing:0},active:null,loaded:false,loading:false,error:'',lastLoadedAt:''};
var transcriptChatHistory=[];
var transcriptRecoveryRunning=false;
var draftSignalState={drafts:[],loaded:false,error:''};
var executiveBriefingState={data:null,loaded:false,loading:false,error:'',lastLoadedAt:''};
var VAL_LOGO_URL='https://assets.cdn.filesafe.space/JuRSFup6NNQErVKkXlX5/media/6a3fd004c93b89d83f6008e6.png';
var navItems=[
  {id:'dashboard',icon:'home',label:'Home',group:'core'},
  {id:'relationships',icon:'people',label:'Relationships',group:'core'},
  {id:'projects',icon:'folder',label:'Projects',group:'core'},
  {id:'transcripts',icon:'document',label:'Transcripts',group:'core'},
  {id:'documents',icon:'document',label:'Documents',group:'core'},
  {id:'email_intelligence',icon:'mail',label:'Executive Inbox',group:'growth'},
  {id:'leads_employers',icon:'search',label:'Scrape Employers',group:'growth'},
  {id:'leads_partners',icon:'search',label:'Scrape Partners',group:'growth'},
  {id:'tasks',icon:'check',label:'Actions',group:'growth'},
  {id:'drafts',icon:'document',label:'Drafts',group:'growth'},
  {id:'teach_val',icon:'spark',label:'Teach VAL',group:'growth'},
  {id:'settings_dashboard_studio',icon:'studio',label:'Dashboard Studio',group:'settings'},
  {id:'settings_templates',icon:'document',label:'Templates',group:'settings'},
  {id:'settings_api_keys',icon:'key',label:'API Keys & Connections',group:'settings'},
  {id:'settings_security',icon:'gear',label:'Security & Privacy',group:'settings'},
  {id:'settings',icon:'gear',label:'Settings',group:'settings'}
];
var valDashboardSourceAnchors="['drafts','✎','Drafts'] ['settings_templates','▤','Templates'] settings_templates:'openTemplatesPage' drafts:'openDraftsPage' leads_employers:'openLeadIntelligence' leads_partners:'openPartnerIntelligence' Meeting Recaps & Drafts";
function safe(value){return typeof docSafe==='function'?docSafe(String(value==null?'':value)):String(value==null?'':value).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function call(name){var fn=window[name];if(typeof fn==='function')return fn.apply(window,[].slice.call(arguments,1));}
function dashboardStudioEnabled(){return !!(window.VAL_CONFIG&&VAL_CONFIG.featureFlags&&VAL_CONFIG.featureFlags.dashboard_studio_beta);}
function visibleNavItems(){return navItems.filter(function(n){return n.id!=='settings_dashboard_studio'||dashboardStudioEnabled();});}
function valBrandName(){return (window.VAL_CONFIG&&(VAL_CONFIG.brandName||VAL_CONFIG.clientName))||'VAL';}
function clientFirstName(){var name=(window.VAL_CONFIG&&VAL_CONFIG.clientName)||'Jessa';return String(name).split(/\s+/)[0]||'there';}
function pendingDraftCount(){return (draftSignalState.drafts||[]).filter(function(d){return !/sent|approved|done/i.test(String(d.status||'draft'));}).length;}
function openTaskCount(){return taskInfo().open.length;}
function transcriptAttentionCount(){var c=transcriptState.counts||{};return Number(c.needsReview||0)+Number(c.failedProcessing||0);}
function navBadge(view){
  var count=view==='drafts'?pendingDraftCount():(view==='tasks'?openTaskCount():(view==='evidence'?transcriptAttentionCount():0));
  return '<span class="val-nav-badge'+(count?'':' empty')+'" data-badge-view="'+safe(view)+'">'+(count?String(count):'')+'</span>';
}
function updateCommandCenterBadges(){
  document.querySelectorAll('[data-badge-view]').forEach(function(el){
    var view=el.getAttribute('data-badge-view'),count=view==='drafts'?pendingDraftCount():(view==='tasks'?openTaskCount():(view==='evidence'?transcriptAttentionCount():0));
    el.textContent=count?String(count):'';
    el.classList.toggle('empty',!count);
  });
}
window.syncCommandCenterDrafts=function(){return loadDraftSignals(false);};
function navIcon(name){
  var paths={
    home:'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
    people:'M16 11a4 4 0 1 0-8 0M4 21a8 8 0 0 1 16 0M19 8a3 3 0 0 1 2 5M23 21a6 6 0 0 0-4-5.6',
    folder:'M3 6h7l2 2h9v11H3z',
    evidence:'M8 3h8l4 4v14H4V3h4zM8 12h8M8 16h8M16 3v5h5',
    calendar:'M5 4v3M19 4v3M4 9h16M5 6h14a1 1 0 0 1 1 1v13H4V7a1 1 0 0 1 1-1z',
    document:'M7 3h8l4 4v14H5V3h2zM14 3v5h5M8 13h8M8 17h6',
    mail:'M4 6h16v12H4zM4 7l8 6 8-6',
    search:'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM16 16l5 5',
    check:'M5 13l4 4L19 7',
    spark:'M12 3l1.6 5.2L19 10l-5.4 1.8L12 17l-1.6-5.2L5 10l5.4-1.8z',
    studio:'M4 5h16v14H4zM8 5v14M4 10h16',
    key:'M14 10a4 4 0 1 0-3 3l-5 5v2h3v-2h2v-2h2z',
    gear:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM4 12h2M18 12h2M12 4v2M12 18v2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M17.7 6.3l-1.4 1.4M7.7 16.3l-1.4 1.4'
  };
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+(paths[name]||paths.spark)+'"/></svg>';
}
function navHtml(){
  var current='',items=visibleNavItems().map(function(n){
    var group=n.group!==current?'<div class="val-nav-group-label">'+safe(n.group==='growth'?'Momentum':(n.group==='settings'?'System':'Workspace'))+'</div>':'';
    current=n.group;
    return group+'<button class="val-nav-item'+(n.id==='dashboard'?' active':'')+'" data-view="'+n.id+'" onclick="commandCenterNavigate(\''+n.id+'\')"><span class="val-nav-icon">'+navIcon(n.icon)+'</span><span class="val-nav-label">'+safe(n.label)+'</span>'+navBadge(n.id)+'</button>';
  }).join('');
  return '<div class="val-nav-brand"><img class="val-nav-logo" src="'+VAL_LOGO_URL+'" alt="VAL"></div><div class="val-nav-items">'+items+'</div><div class="val-nav-foot"><div class="val-nav-user"><span class="val-user-avatar">'+safe(clientFirstName().slice(0,1).toUpperCase())+'</span><span><strong>'+safe(clientFirstName())+'</strong><small id="valNavStatus">System ready</small></span></div></div>';
}
window.refreshCommandCenterNav=function(){
  var nav=document.getElementById('valPrimaryNav');
  if(!nav) return;
  nav.innerHTML=navHtml();
  updateCommandCenterBadges();
};
function installShell(){
  var app=document.querySelector('.app');if(!app)return;
  var nav=document.getElementById('valPrimaryNav');
  if(!nav){nav=document.createElement('nav');nav.id='valPrimaryNav';nav.className='val-primary-nav';nav.setAttribute('aria-label','Primary navigation');app.insertBefore(nav,app.firstChild);}
  nav.innerHTML=navHtml();
  updateCommandCenterBadges();
  var top=document.querySelector('.topbar');if(top){var b=document.createElement('button');b.className='val-mobile-nav';b.setAttribute('aria-label','Open navigation');b.innerHTML='☰';b.onclick=function(){nav.classList.toggle('open');};top.insertBefore(b,top.firstChild);}
  if(!document.getElementById('valMobileNavToggle')){var mb=document.createElement('button');mb.id='valMobileNavToggle';mb.className='val-mobile-nav val-mobile-nav-floating';mb.setAttribute('aria-label','Open navigation');mb.innerHTML='☰';mb.onclick=function(){nav.classList.toggle('open');};app.appendChild(mb);}
  var center=document.querySelector('.center'),cmd=center&&center.querySelector('.cmd-area');if(center&&cmd){var view=document.createElement('section');view.id='valTranscriptView';view.className='val-transcript-view';center.insertBefore(view,cmd);}
  buildCommandCenter();loadTranscripts(false);loadDraftSignals(false);loadExecutiveBriefing(false);
}
function setActive(view){document.querySelectorAll('.val-nav-item').forEach(function(el){el.classList.toggle('active',el.getAttribute('data-view')===view);});var nav=document.getElementById('valPrimaryNav');if(nav)nav.classList.remove('open');}
function closeTranscriptView(){var view=document.getElementById('valTranscriptView');if(view)view.classList.remove('open');document.body.classList.remove('val-transcripts-mode');transcriptState.active=null;}
window.commandCenterNavigate=function(view){
  setActive(view);closeTranscriptView();
  if(view==='dashboard'){call('closeDetail');buildCommandCenter();return;}
  if(view==='transcripts'){openTranscripts();return;}
  var routes={chat:'openGeneralChat',teach_val:'openTeachValOnboarding',relationships:'openRelationshipReview',projects:'openPriorityReview',evidence:'openEvidenceReview',calendar:'openCalendarFullView',documents:'openGeneralChat',reports:'openPriorityReview',meetings:'openMeetingBriefing',communications:'askComms',email_intelligence:'openEmailIntelligence',opportunities:'openOpportunityIntelligence',tasks:'openTaskBoard',drafts:'openDraftsPage',intelligence:'openPriorityReview',leads_employers:'openLeadIntelligence',leads_partners:'openPartnerIntelligence',settings:'openKeysPanel',settings_api_keys:'openKeysPanel',settings_templates:'openTemplatesPage',settings_dashboard_studio:'openDashboardStudioPage',settings_security:'openSecurityPrivacyPage'};
  call(routes[view]||'closeDetail');
};
function listLine(label,value){return '<div class="val-mini-item"><strong>'+safe(label)+'</strong><span>'+safe(value)+'</span></div>';}
function loadDraftSignals(show){
  var fetcher=typeof apiFetch==='function'?apiFetch:function(url){return fetch(url,{credentials:'same-origin'}).then(function(r){return r.json();});};
  return fetcher((window.PROXY||'')+'/api/val/drafts').then(function(data){draftSignalState.drafts=Array.isArray(data.drafts)?data.drafts:[];draftSignalState.loaded=true;draftSignalState.error='';updateCommandCenterBadges();buildCommandCenter();return data;}).catch(function(e){draftSignalState.loaded=true;draftSignalState.error=e.message||String(e);if(show&&typeof addSys==='function')addSys('Drafts could not be loaded: '+draftSignalState.error);updateCommandCenterBadges();buildCommandCenter();});
}
function loadExecutiveBriefing(show){
  if(typeof isBookEditorMode==='function'&&isBookEditorMode())return Promise.resolve(null);
  var fetcher=typeof apiFetch==='function'?apiFetch:function(url){return fetch(url,{credentials:'same-origin'}).then(function(r){return r.json();});};
  executiveBriefingState.loading=true;executiveBriefingState.error='';buildCommandCenter();
  return fetcher((window.PROXY||'')+'/api/executive-briefing').then(function(data){executiveBriefingState.data=data&&data.ok!==false?data:null;executiveBriefingState.loaded=true;executiveBriefingState.loading=false;executiveBriefingState.error='';executiveBriefingState.lastLoadedAt=new Date().toISOString();if(data&&!data.bookMode)window.executiveBriefing=data;buildCommandCenter();return data;}).catch(function(e){executiveBriefingState.loaded=true;executiveBriefingState.loading=false;executiveBriefingState.error=e.message||String(e);if(show&&typeof addSys==='function')addSys('Executive Briefing could not be loaded: '+executiveBriefingState.error);buildCommandCenter();});
}
window.loadExecutiveBriefing=loadExecutiveBriefing;
function upcomingEvents(){return ([].concat((window.dashData&&dashData.appointments)||[],(window.dashData&&dashData.calendarEvents)||[])).filter(function(e){var d=new Date(e.startTime||e.start||e.date||0);return d>=new Date()&&!isNaN(d);}).sort(function(a,b){return new Date(a.startTime||a.start||a.date)-new Date(b.startTime||b.start||b.date);});}
function taskInfo(){var all=window.valTasks||((window.dashData&&dashData.tasks)||[]),open=all.filter(function(t){return !t.completed&&t.status!=='completed';}),now=new Date(),todayEnd=new Date();todayEnd.setHours(23,59,59,999);return{open:open,overdue:open.filter(function(t){return t.dueDate&&new Date(t.dueDate)<now;}),unscheduled:open.filter(function(t){return !t.scheduledStart&&!t.calendarEventId;}),scheduledToday:open.filter(function(t){var d=t.scheduledStart?new Date(t.scheduledStart):null;return d&&!isNaN(d)&&d>=now&&d<=todayEnd;})};}
function commandCard(kicker,title,copy,action,label,extra,priority){return '<article class="val-command-card'+(priority?' priority':'')+'"><div class="val-card-head"><div class="val-card-kicker">'+safe(kicker)+'</div>'+(extra&&extra.count!=null?'<span class="val-card-count">'+safe(extra.count)+'</span>':'')+'</div><h3>'+safe(title)+'</h3>'+(extra&&extra.html?'<div class="val-mini-list">'+extra.html+'</div>':'<p>'+safe(copy)+'</p>')+'<button class="val-card-action" onclick="'+action+'">'+safe(label)+'</button></article>';}
function pct(value){return Math.round(Number(value||0)*100)+'%';}
function moveLine(move){return '<div class="eb-move-line"><strong>'+safe(move.title||'Agency move')+'</strong><span>'+safe(move.why||move.whatChanged||'VAL noticed this may matter.')+'</span><em>'+pct(move.confidence)+'</em></div>';}
function timeOfDayInfo(){
  var h=new Date().getHours();
  if(h<12)return{key:'morning',greeting:'Good morning',note:'You have got this.'};
  if(h<17)return{key:'afternoon',greeting:'Good afternoon',note:'Steady momentum.'};
  if(h<21)return{key:'evening',greeting:'Good evening',note:'Bring the day home.'};
  return{key:'night',greeting:'Good evening',note:'Quiet clarity.'};
}
function lineIcon(type){
  var map={risk:'!',opportunity:'↗',decision:'✓',relationship:'↗',relationship_signal:'↗',emotional_context:'•',deadline:'□',question:'?',promise:'✓',commitment:'✓',task:'✓',default:'•'};
  return map[type]||map.default;
}
function compactText(value,fallback){return safe(String(value||fallback||'').replace(/\s+/g,' ').trim());}
function firstMoveTitle(move,fallback){return compactText(move&&move.title,fallback);}
function firstMoveCopy(move,fallback){return compactText(move&&(move.why||move.whatChanged||move.content),fallback);}
function cardLink(label,view){return '<button class="val-card-link" onclick="commandCenterNavigate(\''+view+'\')">'+safe(label)+'</button>';}
function jsString(value){return String(value==null?'':value).replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,' ');}
function cardItemKey(item){return String((item&&item.id)||(item&&item.source_id)||(item&&item.sourceId)||(item&&item.name)||(item&&item.title)||'');}
function cardSpec(type){
  return {
    what_changed:{title:'What Changed',empty:'Nothing new has changed since your last review.',view:'evidence',intro:'I am only showing changes backed by stored records.'},
    highest_leverage:{title:'Highest Leverage',empty:'No major move needs your judgment right now.',view:'tasks',intro:'This is the single move with the strongest current evidence.'},
    people:{title:'People',empty:'No relationship needs extra attention right now.',view:'relationships',intro:'These are relationships with evidence-backed attention signals.'},
    projects:{title:'Projects',empty:'No project is asking for intervention right now.',view:'projects',intro:'These projects are showing movement, risk, or a needed next action.'},
    momentum:{title:'Momentum',empty:'Quiet morning. I am still watching the patterns.',view:'relationships',intro:'Momentum is based on observable changes, not vibes.'},
    ready_for_you:{title:'Ready for You',empty:'Nothing is waiting on you right now.',view:'tasks',intro:'These are items VAL prepared and is waiting for you to review.'}
  }[type]||{title:'VAL Card',empty:'Nothing needs review right now.',view:'dashboard',intro:'This card is grounded in stored VAL context.'};
}
function homepageCardItems(type){
  var b=executiveBriefingState.data||{},entities=b.dashboardEntities||{};
  if(type==='what_changed')return Array.isArray(b.whatChanged)?b.whatChanged:[];
  if(type==='highest_leverage')return b.highestLeverageMove?[b.highestLeverageMove]:[];
  if(type==='people')return Array.isArray(b.people)?b.people:(entities.people||[]);
  if(type==='projects')return Array.isArray(b.projects)?b.projects:(entities.projects||[]);
  if(type==='momentum')return Array.isArray(b.momentum)?b.momentum:(entities.momentum||[]);
  if(type==='ready_for_you')return Array.isArray(b.readyForYou)?b.readyForYou:(entities.readyForYou||[]);
  return [];
}
function homepageCardFind(type,id){
  return homepageCardItems(type).find(function(item){return cardItemKey(item)===String(id);})||homepageCardItems(type)[0]||null;
}
function actionLabel(action){
  return String(action||'review').replace(/_/g,' ').replace(/\b\w/g,function(c){return c.toUpperCase();});
}
function actionClass(action){
  return /approve|do_it_now|create|draft|send|schedule|follow_up/.test(String(action))?'primary':'';
}
function cardActionButtons(type,item,limit){
  var actions=Array.isArray(item&&item.available_actions)?item.available_actions:[];
  if(!actions.length)actions=['review','create_task','snooze'];
  return actions.slice(0,limit||8).map(function(action){
    return '<button class="val-card-action-btn '+actionClass(action)+'" onclick="homepageCardAction(\''+jsString(type)+'\',\''+jsString(cardItemKey(item))+'\',\''+jsString(action)+'\')">'+safe(actionLabel(action))+'</button>';
  }).join('');
}
function cardMetric(value,fallback){return safe(value==null||value===''?fallback:value);}
function cardDate(value){if(!value)return 'Stored';var d=new Date(value);return isNaN(d)?String(value):d.toLocaleString([],{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});}
function cardRiskLabel(item){
  var raw=String((item&&item.risk_level)||(item&&item.riskLevel)||(item&&item.priorityBand)||(item&&item.impact)||'').toLowerCase();
  if(/high|risk|urgent|highest/.test(raw))return 'High';
  if(/important|medium|also/.test(raw))return 'Medium';
  if(/quiet|low|watch/.test(raw))return 'Low';
  return item&&item.confidence!=null?'Review':'Normal';
}
function cardImpactLabel(item){
  return (item&&item.impact)||(item&&item.priorityBand)||(cardRiskLabel(item)==='High'?'High':'Important');
}
function cardTaskSource(item){
  var target=item&&item.target||{};
  return (target.type&&target.id)?target.type+': '+target.id:(item&&item.source_type?item.source_type:'stored record');
}
function cardEvidenceList(item){
  var evidence=Array.isArray(item&&item.evidence)?item.evidence:[];
  var ids=[].concat(item&&item.evidenceIds||[],item&&item.observationIds||[],item&&item.source_ids||[]).filter(Boolean);
  if(!evidence.length&&ids.length)evidence=ids.map(function(id){return{id:id,title:'Stored source',summary:'Source ID: '+id,sourceType:'record'};});
  if(!evidence.length)return '<div class="val-card-empty">No display evidence attached yet. VAL still has source IDs for this item when available.</div>';
  return evidence.slice(0,10).map(function(e){
    return '<div class="val-card-evidence-row"><span>'+safe((e.sourceType||e.type||'record').slice(0,1).toUpperCase())+'</span><div><strong>'+safe(e.title||e.type||'Evidence')+'</strong><small>'+safe(e.summary||e.id||'Stored evidence record')+'</small></div><em>'+safe(e.occurredAt||e.createdAt||'')+'</em></div>';
  }).join('');
}
function cardChatPanel(type,item,activeId,chips){
  var spec=cardSpec(type);
  chips=chips&&chips.length?chips:[
    {label:'Why this?',prompt:'Explain why this matters using only this card evidence.'},
    {label:'Show evidence',prompt:'Show me the evidence behind this card.'},
    {label:'Next move',prompt:'What should I do next from this card?'}
  ];
  return '<section class="exec-card val-card-chat-panel"><h3>Chat With VAL</h3><div id="valCardChatLog"><div class="val-card-chat">'+safe(spec.intro)+' What would you like to do next?</div></div><div class="val-card-chip-row">'+chips.map(function(ch){return '<button onclick="homepageCardAsk(\''+jsString(type)+'\',\''+jsString(activeId)+'\',\''+jsString(ch.prompt)+'\')">'+safe(ch.label)+'</button>';}).join('')+'</div><div class="val-card-chat-input"><input id="valCardChatInput" placeholder="Ask about this card..." onkeydown="if(event.key===\'Enter\')homepageCardAsk(\''+jsString(type)+'\',\''+jsString(activeId)+'\')"><button onclick="homepageCardAsk(\''+jsString(type)+'\',\''+jsString(activeId)+'\')">Send</button></div></section>';
}
function readyWorkspaceHtml(type,item,activeId){
  var reviewType=item.review_type||item.reviewType||item.draftType||item.source_type||'review';
  var recommended=item.recommended_action||item.recommendedAction||'Review and decide';
  var risk=cardRiskLabel(item);
  var chips=[
    {label:'Review this',prompt:'Walk me through this pending review item and what decision it needs.'},
    {label:'What is risky?',prompt:'What risk should I notice before approving or rejecting this?'},
    {label:'Prepare edit',prompt:'Help me edit this before approving it.'}
  ];
  return '<section class="val-card-callout ready-mode"><strong>'+safe(item.title||'Ready for You')+'</strong><p>'+safe(item.summary||'VAL prepared this and needs your review before it moves forward.')+'</p></section>'
    +'<div class="val-card-decision-strip"><div><span>Review type</span><strong>'+safe(actionLabel(reviewType))+'</strong></div><div><span>Recommended</span><strong>'+safe(recommended)+'</strong></div><div><span>Risk</span><strong>'+safe(risk)+'</strong></div><div><span>Created</span><strong>'+safe(cardDate(item.created_at||item.createdAt))+'</strong></div></div>'
    +'<div class="val-card-two-col ready-layout"><section class="exec-card"><h3>Decision Needed</h3><p>'+safe(item.reason_it_matters||item.summary||'This is waiting for human approval, correction, or dismissal.')+'</p><div class="val-card-review-flow"><span>Prepared</span><span class="active">Review</span><span>Approve or edit</span><span>Logged</span></div></section><section class="exec-card"><h3>Approval Actions</h3><div class="val-card-action-grid">'+cardActionButtons(type,item,11)+'</div></section></div>'
    +'<section class="exec-card"><h3>Source and Evidence</h3><div class="val-card-source-line"><strong>'+safe(cardTaskSource(item))+'</strong><span>'+safe(item.source_id||item.sourceId||'Source record attached when available')+'</span></div>'+cardEvidenceList(item)+'</section>'
    +cardChatPanel(type,item,activeId,chips);
}
function highestWorkspaceHtml(type,item,activeId){
  var confidence=item.confidence!=null?pct(item.confidence):'--';
  var urgency=cardMetric(item.urgencyScore||item.urgency_score,'--');
  var impact=cardImpactLabel(item);
  var risk=cardMetric(item.riskScore||item.risk_score,cardRiskLabel(item));
  var relationship=cardMetric(item.relationshipScore||item.relationship_score,'--');
  var chips=[
    {label:'Why this move?',prompt:'Explain why this is the highest leverage move and what evidence made it win.'},
    {label:'If ignored?',prompt:'What happens if I ignore this move?'},
    {label:'Do it now',prompt:'Walk me through doing this now, step by step.'}
  ];
  return '<section class="val-card-callout highest-mode"><strong>'+safe(item.title||'Highest Leverage Move')+'</strong><p>'+safe(item.why||item.reason_it_matters||item.summary||'This is the strongest move VAL sees right now.')+'</p></section>'
    +'<div class="val-card-scoreboard"><div><span>Impact</span><strong>'+safe(impact)+'</strong></div><div><span>Confidence</span><strong>'+safe(confidence)+'</strong></div><div><span>Urgency</span><strong>'+safe(urgency)+'</strong></div><div><span>Risk</span><strong>'+safe(risk)+'</strong></div><div><span>Relationship</span><strong>'+safe(relationship)+'</strong></div></div>'
    +'<div class="val-card-two-col highest-layout"><section class="exec-card"><h3>Why This Move Won</h3><p>'+safe(item.reason_it_matters||item.why||item.summary||'VAL selected this because it has the strongest combination of urgency, impact, risk, and confidence.')+'</p><h3>If Ignored</h3><p>'+safe(item.ifIgnored||item.if_ignored||'This may stay unresolved or lose momentum if it is not reviewed.')+'</p></section><section class="exec-card"><h3>Move Options</h3><div class="val-card-action-grid">'+cardActionButtons(type,item,9)+'</div></section></div>'
    +'<section class="exec-card"><h3>Evidence Snapshot</h3>'+cardEvidenceList(item)+'</section>'
    +cardChatPanel(type,item,activeId,chips);
}
function whatChangedWorkspaceHtml(type,item,activeId){
  var changeType=item.source_type||item.sourceType||item.type||'record';
  var chips=[
    {label:'Explain change',prompt:'Explain what changed in plain English and why it matters.'},
    {label:'Show evidence',prompt:'Show the evidence behind this change.'},
    {label:'Act on it',prompt:'What are my best action options for this change?'}
  ];
  return '<section class="val-card-callout changed-mode"><strong>'+safe(item.title||'What changed')+'</strong><p>'+safe(item.summary||item.reason_it_matters||'VAL detected a source-backed change.')+'</p></section>'
    +'<div class="val-card-decision-strip"><div><span>Change type</span><strong>'+safe(actionLabel(changeType))+'</strong></div><div><span>Source</span><strong>'+safe(item.source_id||item.sourceId||'Attached')+'</strong></div><div><span>Created</span><strong>'+safe(cardDate(item.created_at||item.createdAt))+'</strong></div><div><span>Evidence</span><strong>'+safe(item.evidence_count||((item.evidence||[]).length)||'Source IDs')+'</strong></div></div>'
    +'<div class="val-card-two-col changed-layout"><section class="exec-card"><h3>Why This Matters</h3><p>'+safe(item.reason_it_matters||item.summary||'This may update memory, context, a relationship, a project, or an action queue.')+'</p></section><section class="exec-card"><h3>Actions</h3><div class="val-card-action-grid">'+cardActionButtons(type,item,8)+'</div></section></div>'
    +'<section class="exec-card"><h3>Evidence Behind the Change</h3><div class="val-card-source-line"><strong>'+safe(cardTaskSource(item))+'</strong><span>'+safe(item.source_id||item.sourceId||'Stored source attached')+'</span></div>'+cardEvidenceList(item)+'</section>'
    +cardChatPanel(type,item,activeId,chips);
}
function peopleWorkspaceHtml(type,item,activeId){
  var loops=Array.isArray(item.open_loops)?item.open_loops:(item.openLoops||[]);
  var risks=item.risks||[],opps=item.opportunities||[];
  var momentum=item.momentum_direction||item.momentumDirection||item.state||'stable';
  var chips=[
    {label:'Why this person?',prompt:'Explain why this person is showing up and what needs attention.'},
    {label:'Open loops',prompt:'Summarize the open loops for this relationship.'},
    {label:'Draft follow-up',prompt:'Help me draft the best follow-up for this person.'}
  ];
  function miniList(items,empty){return (items&&items.length)?'<ul>'+items.slice(0,5).map(function(x){return '<li>'+safe(x.content||x.summary||x)+'</li>';}).join('')+'</ul>':'<p>'+safe(empty)+'</p>';}
  return '<section class="val-card-callout people-mode"><strong>'+safe(item.name||item.title||'Relationship')+'</strong><p>'+safe(item.reason_shown||item.summary||'This relationship has an evidence-backed attention signal.')+'</p></section>'
    +'<div class="val-card-decision-strip"><div><span>Status</span><strong>'+safe(item.relationship_status||item.state||'Observed')+'</strong></div><div><span>Momentum</span><strong>'+safe(actionLabel(momentum))+'</strong></div><div><span>Last interaction</span><strong>'+safe(cardDate(item.last_interaction||item.lastObservedAt))+'</strong></div><div><span>Open loops</span><strong>'+safe(loops.length||0)+'</strong></div></div>'
    +'<div class="val-card-two-col people-layout"><section class="exec-card"><h3>Open Loops</h3>'+miniList(loops,'No explicit open loop is attached yet.')+'<h3>Relationship Risk</h3>'+miniList(risks,'No explicit risk is attached. VAL is watching the evidence trail.')+'</section><section class="exec-card"><h3>Relationship Actions</h3><div class="val-card-action-grid">'+cardActionButtons(type,item,8)+'</div></section></div>'
    +'<section class="exec-card"><h3>Opportunity and Evidence</h3>'+miniList(opps,'No explicit opportunity is attached yet.')+cardEvidenceList(item)+'</section>'
    +cardChatPanel(type,item,activeId,chips);
}
function projectsWorkspaceHtml(type,item,activeId){
  var stalled=item.stalled_items||item.stalledItems||item.risks||[];
  var taskCount=item.open_tasks_count||item.openTasksCount||((item.openLoops||[]).length)||0;
  var chips=[
    {label:'Project status',prompt:'Explain what is happening with this project and why it is showing up.'},
    {label:'Blockers',prompt:'Identify blockers, stalled items, and unfinished commitments for this project.'},
    {label:'Draft update',prompt:'Draft a short project update from this evidence.'}
  ];
  function miniList(items,empty){return (items&&items.length)?'<ul>'+items.slice(0,5).map(function(x){return '<li>'+safe(x.content||x.summary||x)+'</li>';}).join('')+'</ul>':'<p>'+safe(empty)+'</p>';}
  return '<section class="val-card-callout project-mode"><strong>'+safe(item.project_name||item.name||item.title||'Project')+'</strong><p>'+safe(item.reason_shown||item.summary||'This project has activity, risk, or a needed next action.')+'</p></section>'
    +'<div class="val-card-decision-strip"><div><span>Status</span><strong>'+safe(item.status||item.state||'Watched')+'</strong></div><div><span>Open tasks</span><strong>'+safe(taskCount)+'</strong></div><div><span>Stalled</span><strong>'+safe(stalled.length||0)+'</strong></div><div><span>Project ID</span><strong>'+safe(item.project_id||item.id||'Stored')+'</strong></div></div>'
    +'<div class="val-card-two-col project-layout"><section class="exec-card"><h3>Next Suggested Action</h3><p>'+safe(item.next_suggested_action||item.summary||'Review recent evidence and choose the next operational step.')+'</p><h3>Stalled Items</h3>'+miniList(stalled,'No stalled item is attached yet.')+'</section><section class="exec-card"><h3>Project Actions</h3><div class="val-card-action-grid">'+cardActionButtons(type,item,9)+'</div></section></div>'
    +'<section class="exec-card"><h3>Latest Evidence</h3>'+cardEvidenceList(item)+'</section>'
    +cardChatPanel(type,item,activeId,chips);
}
function momentumWorkspaceHtml(type,item,activeId){
  var direction=item.momentum_direction||item.momentumDirection||item.state||'watch';
  var entityType=item.entity_type||item.entityType||(item.target&&item.target.type)||'entity';
  var chips=[
    {label:'Explain signal',prompt:'Explain this momentum signal and what changed.'},
    {label:'People vs projects',prompt:'Tell me whether this is a people or project momentum signal and what action fits.'},
    {label:'Mark wrong?',prompt:'What happens if I mark this momentum signal wrong?'}
  ];
  return '<section class="val-card-callout momentum-mode"><strong>'+safe(item.title||'Momentum Signal')+'</strong><p>'+safe(item.reason||item.detail||item.summary||'VAL detected an evidence-backed momentum change.')+'</p></section>'
    +'<div class="val-card-decision-strip"><div><span>Entity</span><strong>'+safe(actionLabel(entityType))+'</strong></div><div><span>Direction</span><strong>'+safe(actionLabel(direction))+'</strong></div><div><span>Evidence</span><strong>'+safe(item.evidence_count||((item.evidence||[]).length)||'Source IDs')+'</strong></div><div><span>Created</span><strong>'+safe(cardDate(item.created_at||item.createdAt))+'</strong></div></div>'
    +'<div class="val-card-two-col momentum-layout"><section class="exec-card"><h3>What Changed</h3><p>'+safe(item.reason||item.detail||item.summary||'This signal needs evidence review before action.')+'</p><h3>Suggested Action</h3><p>'+safe(item.suggested_action||item.suggestedAction||'Review the signal, then follow up, create a task, or snooze it.')+'</p></section><section class="exec-card"><h3>Momentum Actions</h3><div class="val-card-action-grid">'+cardActionButtons(type,item,8)+'</div></section></div>'
    +'<section class="exec-card"><h3>Evidence Snapshot</h3>'+cardEvidenceList(item)+'</section>'
    +cardChatPanel(type,item,activeId,chips);
}
function defaultWorkspaceHtml(type,item,activeId){
  var spec=cardSpec(type),confidence=item&&item.confidence!=null?pct(item.confidence):'--';
  return '<section class="val-card-callout"><strong>Here’s what I’m seeing</strong><p>'+safe(item.summary||item.reason_it_matters||spec.intro)+'</p></section>'
    +'<div class="val-card-two-col"><section class="exec-card"><h3>Why This Matters</h3><p>'+safe(item.reason_it_matters||item.why||item.summary||spec.intro)+'</p><div class="val-card-meta"><span>Source <strong>'+safe(item.source_type||item.sourceType||'record')+'</strong></span><span>Confidence <strong>'+safe(confidence)+'</strong></span><span>Created <strong>'+safe(cardDate(item.created_at||item.createdAt))+'</strong></span></div></section><section class="exec-card"><h3>Suggested Actions</h3><div class="val-card-action-grid">'+cardActionButtons(type,item,10)+'</div></section></div>'
    +'<section class="exec-card"><h3>Evidence Snapshot</h3>'+cardEvidenceList(item)+'</section>'
    +cardChatPanel(type,item,activeId);
}
function emptyWorkspaceHtml(type,activeId){
  var spec=cardSpec(type);
  var chips=[
    {label:'Why empty?',prompt:'Explain why this card is empty and what source records would make it populate.'},
    {label:'Check sources',prompt:'What data sources does this card use and what should I connect or review?'},
    {label:'Refresh logic',prompt:'Tell me how this card decides what deserves attention.'}
  ];
  return '<section class="val-card-callout empty-mode"><strong>'+safe(spec.empty)+'</strong><p>That is usually a good sign. I will keep watching your source records and surface this only when something deserves your attention.</p></section>'
    +'<div class="val-empty-state-scene" aria-hidden="true"><div class="val-empty-sun"></div><div class="val-empty-hill one"></div><div class="val-empty-hill two"></div><div class="val-empty-plant"><span></span><i></i><b></b></div><div class="val-empty-mug">VAL</div></div>'
    +'<div class="val-card-two-col empty-layout"><section class="exec-card"><h3>What I am watching for</h3><ul><li>New risks, blockers, or open loops</li><li>Relationship shifts or capacity changes</li><li>Project movement or decisions</li><li>Opportunities needing your attention</li></ul></section><section class="exec-card val-stay-loop"><h3>Stay in the loop</h3><p>I will tell you when something deserves your attention.</p><div class="val-card-action-grid"><button class="val-card-action-btn primary" onclick="loadExecutiveBriefing(true)">Check again</button><button class="val-card-action-btn" onclick="commandCenterNavigate(\''+jsString(spec.view)+'\')">Open source view</button></div></section></div>'
    +cardChatPanel(type,{},activeId,chips);
}
function cardWorkspaceContent(type,item,activeId){
  if(type==='what_changed')return whatChangedWorkspaceHtml(type,item,activeId);
  if(type==='ready_for_you')return readyWorkspaceHtml(type,item,activeId);
  if(type==='highest_leverage')return highestWorkspaceHtml(type,item,activeId);
  if(type==='people')return peopleWorkspaceHtml(type,item,activeId);
  if(type==='projects')return projectsWorkspaceHtml(type,item,activeId);
  if(type==='momentum')return momentumWorkspaceHtml(type,item,activeId);
  return defaultWorkspaceHtml(type,item,activeId);
}
function cardRowsForWorkspace(type,activeId){
  var items=homepageCardItems(type),spec=cardSpec(type);
  if(!items.length)return '<div class="val-card-empty">'+safe(spec.empty)+'</div>';
  return items.slice(0,12).map(function(item){
    var id=cardItemKey(item),active=String(id)===String(activeId);
    return '<button class="val-card-side-item '+(active?'active':'')+'" onclick="openHomepageCard(\''+jsString(type)+'\',\''+jsString(id)+'\')"><strong>'+safe(item.title||item.name||'VAL signal')+'</strong><small>'+safe(item.summary||item.reason_it_matters||item.state||'Evidence-backed item')+'</small></button>';
  }).join('');
}
window.homepageCardAction=function(type,id,action){
  var item=homepageCardFind(type,id)||{};
  var out=document.getElementById('valCardChatLog');
  if(out)out.innerHTML+='<div class="val-card-chat user">'+safe(actionLabel(action))+'</div><div class="val-card-chat">Working on that...</div>';
  apiFetch((window.PROXY||'')+'/api/homepage-cards/action',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cardType:type,action:action,item:item})}).then(function(data){
    if(out){out.lastChild.textContent=data.message||(data.status==='task_created'?'Task created and linked to this signal.':(data.status==='draft_created'?'Draft created for review.':(data.status==='approval_required'?'I logged that this needs final send approval. Nothing was sent.':'Decision logged.')));}
    loadExecutiveBriefing(false);
    if(typeof valTasksLoad==='function'&&data.task)valTasksLoad();
  }).catch(function(e){if(out)out.lastChild.textContent='Action failed: '+(e.message||e);});
};
window.homepageCardAsk=function(type,id,prompt){
  var item=homepageCardFind(type,id)||{},input=document.getElementById('valCardChatInput'),out=document.getElementById('valCardChatLog');
  var msg=prompt||(input&&input.value.trim())||'Walk me through this.';
  var scoped='Card-scoped request. Card: '+cardSpec(type).title+'. Stay inside this card item, its evidence, and its available actions unless the user explicitly asks broader context. User request: '+msg;
  if(input)input.value='';
  if(out)out.innerHTML+='<div class="val-card-chat user">'+safe(msg)+'</div><div class="val-card-chat">Reading the evidence...</div>';
  apiFetch((window.PROXY||'')+'/api/val/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:[{role:'user',content:scoped}],dashboard:Object.assign({},executiveBriefingState.data||{},{homepageCard:{type:type,item:item}}),channel:'homepage_card',title:cardSpec(type).title})}).then(function(data){
    var text=((data.message&&data.message.content)||data.content||data.text||'').trim()||'I could not generate a response for this card.';
    if(out)out.lastChild.innerHTML='<p>'+safe(text).replace(/\n\n/g,'</p><p>').replace(/\n/g,'<br>')+'</p>';
  }).catch(function(e){if(out)out.lastChild.textContent='Chat failed: '+(e.message||e);});
};
window.openHomepageCard=function(type,id){
  var spec=cardSpec(type),items=homepageCardItems(type),item=homepageCardFind(type,id);
  if(!item&&items.length)item=items[0];
  var activeId=cardItemKey(item||{});
  var title=item?(item.title||item.name||spec.title):spec.empty;
  var confidence=item&&item.confidence!=null?pct(item.confidence):'--';
  var evidenceCount=Number((item&&item.evidence_count)||((item&&item.evidence)||[]).length||0);
  var body='<div class="val-card-workspace">'
    +'<aside class="val-card-side"><div class="val-card-side-head"><strong>'+safe(spec.title)+'</strong><button onclick="loadExecutiveBriefing(true)">Refresh</button></div>'+cardRowsForWorkspace(type,activeId)+'</aside>'
    +'<main class="val-card-main">'
      +'<nav class="val-card-tabs"><span class="active">Overview</span><span>Evidence '+(evidenceCount?'('+evidenceCount+')':'')+'</span><span>Actions</span><span>History</span></nav>'
      +(item?cardWorkspaceContent(type,item,activeId)
      :emptyWorkspaceHtml(type,activeId))
    +'</main></div>';
  if(typeof openExecutiveWorkspace==='function')openExecutiveWorkspace({id:'homepageCardWorkspace',title:spec.title,kicker:'Executive Workspace',mode:'drawer',body:body,footer:'<button class="alert-btn primary" onclick="loadExecutiveBriefing(true)">Check Again</button><button class="alert-btn" onclick="commandCenterNavigate(\''+spec.view+'\')">Open Source View</button><button class="alert-btn" onclick="closeExecutiveWorkspace(\'homepageCardWorkspace\')">Close</button>'});
};
function dashboardTargetAction(target,fallback){
  target=target||{};
  var type=target.type||'',id=target.id||'';
  if(type&&id)return "openDashboardTarget('"+jsString(type)+"','"+jsString(id)+"')";
  return "commandCenterNavigate('"+jsString(fallback||'evidence')+"')";
}
window.openDashboardTarget=function(type,id){
  var b=executiveBriefingState.data||{},entities=b.dashboardEntities||{};
  function all(list){return Array.isArray(list)?list:[];}
  var item=null,title='VAL Detail';
  if(type==='person')item=all(entities.people).find(function(x){return String(x.id||x.profileKey||x.email||x.name)===String(id);});
  else if(type==='project')item=all(entities.projects).find(function(x){return String(x.id||x.profileKey||x.name)===String(id);});
  else if(type==='draft'){if(typeof openDraftsPage==='function')openDraftsPage(id);return;}
  else if(type==='move')item=[b.highestLeverageMove].concat(all(b.alsoImportant),all(b.watching)).find(function(x){return x&&String(x.id)===String(id);});
  if(!item){
    item=all(entities.whatChanged).concat(all(entities.momentum),all(entities.readyForYou)).find(function(x){return String(x.id||'')===String(id);});
  }
  if(type==='person')title=(item&&item.name?item.name:'Relationship')+' Profile';
  else if(type==='project')title=(item&&item.name?item.name:'Project')+' Workspace';
  else if(type==='move')title='Why This Matters';
  if(!item){commandCenterNavigate(type==='project'?'projects':(type==='person'?'relationships':'evidence'));return;}
  var evidence=(item.evidence||[]).slice(0,8).map(function(e){return '<li><strong>'+safe(e.title||e.type||'Evidence')+'</strong><br><span>'+safe(e.summary||'')+'</span></li>';}).join('');
  var loops=(item.openLoops||[]).slice(0,6).map(function(x){return '<li>'+safe(x)+'</li>';}).join('');
  var risks=(item.risks||[]).slice(0,6).map(function(x){return '<li>'+safe(x)+'</li>';}).join('');
  var opps=(item.opportunities||[]).slice(0,6).map(function(x){return '<li>'+safe(x)+'</li>';}).join('');
  var body='<div class="relationship-profile-grid">'
    +'<section class="exec-card"><h3>'+safe(item.name||item.title||'Signal')+'</h3><p>'+safe(item.summary||item.why||item.detail||'VAL is watching this from evidence.')+'</p><p><strong>Status:</strong> '+safe(item.state||item.impact||item.priorityBand||'Observed')+'</p></section>'
    +'<section class="exec-card"><h3>What Needs Attention</h3><ul>'+(loops||risks||opps||'<li>No urgent open loop attached yet.</li>')+'</ul></section>'
    +'<section class="exec-card"><h3>Risks</h3><ul>'+(risks||'<li>No explicit risk attached.</li>')+'</ul></section>'
    +'<section class="exec-card"><h3>Opportunities</h3><ul>'+(opps||'<li>No explicit opportunity attached.</li>')+'</ul></section>'
    +'<section class="exec-card relationship-profile-wide"><h3>Evidence Trail</h3><ul class="relationship-timeline">'+(evidence||'<li>Evidence IDs are stored, but no display summary is attached yet.</li>')+'</ul></section>'
    +'</div>';
  if(typeof openExecutiveWorkspace==='function')openExecutiveWorkspace({id:'dashboardEntityOverlay',title:title,body:body,footer:"<button class=\"alert-btn primary\" onclick=\"commandCenterNavigate('relationships')\">Relationship Review</button><button class=\"alert-btn\" onclick=\"closeExecutiveWorkspace('dashboardEntityOverlay')\">Close</button>"});
};
function whatChangedRows(b){
  var items=(b&&Array.isArray(b.whatChanged)?b.whatChanged:[]).slice(0,4);
  if(!items.length)return '<div class="val-card-empty">No meaningful changes yet.</div>';
  return items.map(function(item){
    var title=typeof item==='string'?item:(item.title||item.content||item.summary||'Something changed');
    var type=typeof item==='string'?'default':(item.type||item.observationType||'default');
    return '<button class="val-dash-row" onclick="openHomepageCard(\'what_changed\',\''+jsString(cardItemKey(item))+'\')"><span class="val-row-icon '+safe(type)+'">'+safe(lineIcon(type))+'</span><span>'+compactText(title)+'</span></button>';
  }).join('');
}
function peopleRows(b){
  var people=(b&&Array.isArray(b.people)?b.people:[]).slice(0,4);
  if(!people.length)return '<div class="val-card-empty">No relationships need review yet.</div>';
  return people.map(function(p){
    var trend=String(p.trend||p.state||'steady').toLowerCase();
    var cls=/risk|waiting|needs|cool|slow/.test(trend)?'risk':(/warm|momentum|increas|build/.test(trend)?'up':'steady');
    return '<button class="val-person-row" onclick="openHomepageCard(\'people\',\''+jsString(cardItemKey(p))+'\')"><span class="val-person-avatar">'+safe((p.name||p.title||'R').slice(0,1).toUpperCase())+'</span><span><strong>'+safe(p.name||p.title||'Relationship')+'</strong><small class="'+cls+'">'+safe(p.state||p.summary||'Observed')+'</small></span><em class="'+cls+'">'+(cls==='risk'?'↘':(cls==='up'?'↗':'→'))+'</em></button>';
  }).join('');
}
function projectRows(b){
  var projects=(b&&Array.isArray(b.projects)?b.projects:[]).slice(0,3);
  if(!projects.length)return '<div class="val-card-empty">No active project signals yet.</div>';
  return projects.map(function(p){
    var cls=/risk|slow|stall|watch/i.test(String(p.state||''))?'risk':'up';
    return '<button class="val-project-row" onclick="openHomepageCard(\'projects\',\''+jsString(cardItemKey(p))+'\')"><span class="val-project-icon '+cls+'">↗</span><span><strong>'+safe(p.name||p.title||'Project')+'</strong><small>'+safe(p.summary||p.description||'Current priority')+'</small></span><em class="'+cls+'">'+safe(p.state||p.status||'Watched')+'</em></button>';
  }).join('');
}
function momentumRows(b){
  var momentum=(b&&Array.isArray(b.momentum)?b.momentum:[]).slice(0,4);
  if(!momentum.length)return '<div class="val-card-empty">No momentum signal yet.</div>';
  return momentum.map(function(m){
    var cls=/risk|at risk/i.test(String(m.state||m.title||''))?'risk':(/slow|watch/i.test(String(m.state||m.title||''))?'watch':(/recover/i.test(String(m.state||m.title||''))?'recover':'up'));
    return '<button class="val-momentum-row '+cls+'" onclick="openHomepageCard(\'momentum\',\''+jsString(cardItemKey(m))+'\')"><span>'+safe(cls==='risk'?'↓':(cls==='watch'?'↘':(cls==='recover'?'↻':'↗')))+'</span><div><strong>'+safe(m.title||'Momentum signal')+'</strong><small>'+safe(m.detail||m.summary||'VAL is watching the pattern.')+'</small></div></button>';
  }).join('');
}
function readyRows(b){
  var ready=[],seen={};
  function pushReady(r){
    if(!r)return;
    var key=String((r.target&&r.target.id)||r.id||r.title||'').toLowerCase();
    if(key&&seen[key])return;
    if(key)seen[key]=true;
    ready.push(r);
  }
  (b&&Array.isArray(b.readyForYou)?b.readyForYou:[]).slice(0,5).forEach(function(r){pushReady({id:r.id,title:r.title||'VAL is ready',view:r.view||'teach_val',target:r.target});});
  (draftSignalState.drafts||[]).filter(function(d){return !d.dashboardQuality||d.dashboardQuality.ready!==false;}).slice(0,5).forEach(function(d){pushReady({id:d.id,title:d.subject||'Draft prepared',view:'drafts',target:{type:'draft',id:d.id}});});
  (b&&Array.isArray(b.alsoImportant)?b.alsoImportant:[]).slice(0,3).forEach(function(m){pushReady({id:m.id,title:m.title||'Suggested move ready',view:'tasks',target:m.target});});
  if(!ready.length)return '<div class="val-card-empty">No pending review items yet.</div>';
  return ready.slice(0,5).map(function(r){return '<div class="val-ready-row"><span>✓</span><strong>'+safe(r.title)+'</strong><button class="val-card-link" onclick="openHomepageCard(\'ready_for_you\',\''+jsString(cardItemKey(r))+'\')">View</button></div>';}).join('');
}
function executiveBriefingHtml(bookMode){
  if(bookMode)return '';
  if(executiveBriefingState.loading&&!executiveBriefingState.loaded)return '<section class="val-dashboard-grid"><article class="val-dash-card loading"><div class="eb-kicker">Executive Briefing</div><h2>Reading what changed...</h2><p>VAL is distilling evidence, relationships, projects, and agency moves.</p></article></section>';
  if(executiveBriefingState.error)return '<section class="executive-briefing-panel"><div class="eb-kicker">Executive Briefing</div><h2>Briefing unavailable</h2><p>'+safe(executiveBriefingState.error)+'</p><button class="eb-btn" onclick="loadExecutiveBriefing(true)">Try Again</button></section>';
  var b=executiveBriefingState.data;if(!b||b.bookMode)return '';
  var highest=b.highestLeverageMove||{};
  return '<div class="val-briefing-contract" aria-hidden="true">People Create Velocity · Highest Leverage Move · Also Important · Quietly Handled · VAL Noticed</div><section class="val-dashboard-grid">'
    +'<article class="val-dash-card what-changed" onclick="openHomepageCard(\'what_changed\')"><div class="val-card-title"><span class="val-card-symbol">⌾</span><h2>What Changed</h2><button class="val-card-link" onclick="event.stopPropagation();loadExecutiveBriefing(true)">Refresh</button></div><div class="val-row-list">'+whatChangedRows(b)+'</div></article>'
    +'<article class="val-dash-card highest" onclick="openHomepageCard(\'highest_leverage\')"><div class="val-card-title"><span class="val-card-symbol gold">☆</span><h2>Highest Leverage</h2><button class="val-card-link" onclick="event.stopPropagation();openHomepageCard(\'highest_leverage\')">Why this?</button></div><h3>'+firstMoveTitle(highest,'No major move is ready yet')+'</h3><p>'+firstMoveCopy(highest,'VAL is watching without forcing action.')+'</p><div class="val-leverage-meta"><span>Estimated impact <strong>'+safe(highest.impact||highest.priorityBand||'Quiet')+'</strong></span><span>Confidence <strong>'+safe(highest.confidence!=null?pct(highest.confidence):'--')+'</strong></span></div><button class="val-primary-action" onclick="event.stopPropagation();openHomepageCard(\'highest_leverage\')">'+safe(highest.title?'Review Move':'Keep Watching')+'</button></article>'
    +'<article class="val-dash-card people" onclick="openHomepageCard(\'people\')"><div class="val-card-title"><span class="val-card-symbol">♙</span><h2>People</h2><button class="val-card-link" onclick="event.stopPropagation();commandCenterNavigate(\'relationships\')">View all</button></div><div class="val-people-list">'+peopleRows(b)+'</div></article>'
    +'<article class="val-dash-card projects" onclick="openHomepageCard(\'projects\')"><div class="val-card-title"><span class="val-card-symbol">□</span><h2>Projects</h2><button class="val-card-link" onclick="event.stopPropagation();commandCenterNavigate(\'projects\')">View all</button></div><div class="val-project-list">'+projectRows(b)+'</div></article>'
    +'<article class="val-dash-card momentum" onclick="openHomepageCard(\'momentum\')"><div class="val-card-title"><span class="val-card-symbol">◷</span><h2>Momentum</h2><button class="val-card-link" onclick="event.stopPropagation();openHomepageCard(\'momentum\')">View analysis</button></div><div class="val-momentum-list">'+momentumRows(b)+'</div></article>'
    +'<article class="val-dash-card ready" onclick="openHomepageCard(\'ready_for_you\')"><div class="val-card-title"><span class="val-card-symbol">✧</span><h2>Ready for You</h2></div><div class="val-ready-list">'+readyRows(b)+'</div></article>'
  +'</section>';
}
function buildCommandCenter(){
  var welcome=document.getElementById('centerWelcome');if(!welcome)return;
  var events=upcomingEvents(),tasks=taskInfo(),next=events[0],unread=Number((window.dashData&&dashData.followups)||0),pipeline=Number((window.dashData&&dashData.pipelineActive)||0),stalled=Number((window.dashData&&dashData.stalledDeals)||0);
  var priorityHtml='';if(next)priorityHtml+=listLine(next.title||next.summary||next.contactName||'Next meeting',new Date(next.startTime||next.start||next.date).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}));if(tasks.overdue.length)priorityHtml+=listLine(tasks.overdue[0].title||'Overdue commitment','Overdue');if(unread)priorityHtml+=listLine('Important conversations',unread+' unread');if(!priorityHtml)priorityHtml=listLine('No urgent exceptions detected','Review your day');
  var tr=transcriptState.items.slice(0,2),trHtml=tr.map(function(t){return listLine(t.title,t.status==='needs_review'?'Needs review':new Date(t.createdAt).toLocaleDateString());}).join('');
  var recapDrafts=draftSignalState.drafts.filter(function(d){return d.draftType==='meeting_recap'&&String(d.status||'draft')!=='approved'&&String(d.status||'draft')!=='sent';});
  var recentTranscriptTasks=(window.valTasks||((window.dashData&&dashData.tasks)||[])).filter(function(t){return t.transcriptId||t.sourceTranscriptId||/transcript/i.test(String(t.source||t.origin||''));}).slice(0,2);
  var recapHtml='';
  recapDrafts.slice(0,2).forEach(function(d){var ctx=d.sourceContext||{};recapHtml+=listLine(d.subject||'Meeting recap draft',ctx.meetingTitle||ctx.transcriptTitle||d.status||'Draft');});
  if(Number(transcriptState.counts.failedProcessing||0))recapHtml+=listLine('Failed transcript processing',transcriptState.counts.failedProcessing+' need attention');
  recentTranscriptTasks.forEach(function(t){recapHtml+=listLine(t.title||t.taskTitle||'Transcript task',t.dueDate||t.status||'created');});
  var bookMode=typeof isBookEditorMode==='function'&&isBookEditorMode();
  var studioOverrides=(window.VAL_CONFIG&&VAL_CONFIG.dashboardStudioOverrides)||{};
  var dashboardOverride=studioOverrides.dashboard||{};
  var defaultTitle=bookMode?'Continue the book, gently.':'Today, clearly.';
  var defaultSub=bookMode?'Start at the beginning, use prior editor notes, and move chapter by chapter without making Michele manage the machinery.':'The decisions, relationships, and commitments most likely to need your attention—without the dashboard noise.';
  if(!bookMode){
    var tod=timeOfDayInfo(),brief=executiveBriefingState.data||{},theme=brief.todayTheme||{};
    welcome.className='center-welcome val-home '+('time-'+tod.key);
    welcome.innerHTML='<div class="val-home-hero"><div class="val-home-banner" aria-label="Velocity Alignment Leverage. AI that moves you forward."></div><div class="val-home-greeting"><div><h1>'+safe(tod.greeting+', '+clientFirstName()+'.')+'</h1><p>'+safe((theme.why||dashboardOverride.heroSubtitle||'I’ve been paying attention. Here’s what matters today.'))+'</p></div><div class="val-hero-note">'+safe(tod.note)+' <span>♡</span></div></div></div>'+executiveBriefingHtml(false)+'<div class="val-presence-actions"><button class="val-presence-btn" onclick="startVoiceChatMode()"><span class="val-presence-icon">◌</span><span><strong>Voice Chat</strong><small>Discuss, brainstorm, or ask VAL for your next best move.</small></span></button><button class="val-presence-btn meeting" onclick="startMeetingPresenceMode()"><span class="val-presence-icon">◍</span><span><strong>Meeting Mode</strong><small>VAL listens quietly and helps when called.</small></span></button></div><div class="val-home-chat"><span>✦</span><button onclick="openGeneralChat({welcome:true})">What are we working on today?</button><button class="val-home-send" onclick="openGeneralChat({welcome:true})">↑</button></div><button class="val-talk-button" onclick="openGeneralChat({welcome:true})" aria-label="Talk to VAL"><span class="val-face-glow"></span><span class="val-face"><span class="val-face-smile"></span></span><strong>Talk to VAL</strong></button>';
    welcome.style.display='block';
    return;
  }
  welcome.className='center-welcome';
  var html='<div class="cw-label">'+(bookMode?'Book Command Center':'Executive Command Center')+'</div><div class="cw-title">'+safe(dashboardOverride.heroTitle||defaultTitle)+'</div><div class="cw-sub">'+safe(dashboardOverride.heroSubtitle||defaultSub)+'</div>'+executiveBriefingHtml(bookMode)+'<div class="val-command-grid">';
  if(bookMode){
    html+=commandCard('Continue My Book','Continue My Book','Read the current manuscript chapter, use Michele’s prior edit notes, ask one gentle question, then update the manuscript safely.','openMicheleBookCompanion()','Continue My Book',{count:'Start here'},true);
  }
  html+=commandCard(bookMode?'Book Priorities':"Today's Priorities",tasks.overdue.length?'Close the open loops first':'Your highest-leverage work is ready',bookMode?'VAL is holding the manuscript, prior notes, and editorial tasks in one place.':'VAL ranked today across meetings, communication, relationships, commitments, and revenue.','openPriorityReview()',bookMode?'Review Priorities':'Do It',{count:(tasks.overdue.length+unread+(stalled||0))+' signals',html:priorityHtml},!bookMode&&true);
  html+=commandCard('Meetings',next?(next.title||next.summary||'Next meeting'):'No upcoming meeting',next?'Your next conversation is ready for context and preparation.':'Your connected calendar has no upcoming event.','openMeetingBriefing()','Prepare Briefing',{count:events.length+' upcoming'});
  html+=commandCard('Transcripts',transcriptState.error?'Unable to load transcripts':tr.length?'Recent conversations are in memory':'No transcripts received yet',transcriptState.error?'The transcript archive could not be reached. Open it to retry.':'Webhook transcripts, summaries, and open actions live together here.','openTranscripts()','View Transcripts',{count:transcriptState.error?'Needs attention':transcriptState.counts.needsReview+' to review',html:trHtml||''});
  html+=commandCard('Meeting Recaps & Drafts',recapDrafts.length?recapDrafts.length+' recap drafts need approval':'Recaps and transcript drafts are current',draftSignalState.error?'Draft signals could not be loaded.':'Review recap drafts, failed transcript processing, and tasks created from transcript intelligence.','openDraftsPage()','Review Drafts',{count:(recapDrafts.length+Number(transcriptState.counts.failedProcessing||0))+' items',html:recapHtml||''});
  var openLoopHtml='';tasks.unscheduled.slice(0,2).forEach(function(t){openLoopHtml+=listLine(t.title||'Unscheduled task',t.dueDate?'Due '+new Date(t.dueDate).toLocaleDateString():'Needs time block');});tasks.scheduledToday.slice(0,1).forEach(function(t){openLoopHtml+=listLine(t.title||'Scheduled task','Today '+new Date(t.scheduledStart).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}));});
  html+=commandCard('Open Loops',tasks.unscheduled.length?tasks.unscheduled.length+' tasks need calendar time':'Tasks have protected time blocks',tasks.overdue.length?tasks.overdue.length+' overdue tasks also need attention.':'Calendarized tasks protect time without creating meetings.','openTaskBoard()','Calendarize Tasks',{count:tasks.unscheduled.length+' unscheduled',html:openLoopHtml||''},tasks.overdue.length>0);
  html+=commandCard('Communications',unread?unread+' conversations need attention':'Your communication queue is clear','Review important threads, waiting-on-response items, and draft replies.','openEmailIntelligence()','Draft Reply',{count:unread+' unread'});
  html+=commandCard('Relationships','Keep valuable people from drifting','See who needs follow-up and why the relationship matters now.','openRelationshipReview()','Review');
  html+=commandCard('Opportunities',pipeline?pipeline+' active opportunities':'Review opportunity signals',stalled?stalled+' opportunities may be stalled.':'Pipeline and lead signals are ready for review.','openOpportunityIntelligence()','Open',{count:stalled+' stalled'});
  html+=commandCard('Tasks & Commitments',tasks.open.length?tasks.open.length+' open commitments':'No open commitments',tasks.overdue.length?tasks.overdue.length+' are overdue and should be resolved first.':'Promised follow-ups and action items are organized here.','openTaskBoard()','Create Task',{count:tasks.overdue.length+' overdue'});
  html+='</div>';welcome.innerHTML=html;welcome.style.display='block';
}
function loadTranscripts(show){
  var fetcher=typeof apiFetch==='function'?apiFetch:function(url){return fetch(url,{credentials:'same-origin'}).then(function(r){return r.json().catch(function(){return{};}).then(function(data){if(!r.ok)throw new Error(data.error||('Transcript request failed ('+r.status+')'));return data;});});};
  transcriptState.loading=true;transcriptState.error='';if(show)renderTranscriptLoading();
  return fetcher((window.PROXY||'')+'/api/val/transcripts?days=3650&limit=250').then(function(data){if(!data||data.ok===false||!Array.isArray(data.transcripts))throw new Error((data&&data.error)||'Transcript retrieval returned an invalid response.');transcriptState.items=data.transcripts;transcriptState.counts=data.counts||{total:data.transcripts.length,needsReview:0,withOpenActions:0};transcriptState.loaded=true;transcriptState.loading=false;transcriptState.error='';transcriptState.lastLoadedAt=new Date().toISOString();updateCommandCenterBadges();if(show)renderTranscriptList();return data;}).catch(function(e){transcriptState.loaded=true;transcriptState.loading=false;transcriptState.error=e.message||String(e);updateCommandCenterBadges();if(show)renderTranscriptError(transcriptState.error);throw e;});
}
window.openTranscripts=function(){setActive('transcripts');call('closeDetail');document.body.classList.add('val-transcripts-mode');var welcome=document.getElementById('centerWelcome');if(welcome)welcome.style.display='none';var view=document.getElementById('valTranscriptView');if(view)view.classList.add('open');if(!transcriptState.loaded||transcriptState.error){loadTranscripts(true).catch(function(){});}else renderTranscriptList();};
function transcriptHeader(subtitle,back){var clearBtn=(window.VAL_CONFIG&&VAL_CONFIG.clientSlug==='jessa-val')?'<button class="val-ui-btn danger" onclick="clearTranscriptArchive()">Clear Transcript Data</button>':'';return '<div class="val-view-head"><div><h2>Transcript Intelligence</h2><p>'+safe(subtitle)+'</p></div><div class="val-view-actions">'+(back?'<button class="val-ui-btn" onclick="renderTranscriptList()">Inbox</button>':'')+'<button class="val-ui-btn primary" onclick="chooseTranscriptUpload()">Upload Transcript</button><button class="val-ui-btn" onclick="renderTranscriptReviewQueue()">Review Queue</button><button class="val-ui-btn" onclick="renderTranscriptIntakeStatus()">Intake Status</button><button class="val-ui-btn" onclick="repairTranscriptProcessing()">Process Pending</button><button class="val-ui-btn" onclick="reprocessRecentTranscripts()">Reprocess Recent</button><button class="val-ui-btn" onclick="openIntegrationStatus()">Webhook Setup</button><button class="val-ui-btn" '+(transcriptState.loading?'disabled':'')+' onclick="loadTranscripts(true).catch(function(){})">'+(transcriptState.loading?'Refreshing…':'Refresh')+'</button>'+clearBtn+'</div></div>';}
function renderTranscriptLoading(){var view=document.getElementById('valTranscriptView');if(view)view.innerHTML=transcriptHeader('Loading the durable transcript archive…')+'<div class="val-empty val-transcript-loading">Refreshing transcripts…</div>';}
window.chooseTranscriptUpload=function(){
  var input=document.getElementById('valTranscriptUploadInput');
  if(!input){
    input=document.createElement('input');
    input.type='file';
    input.id='valTranscriptUploadInput';
    input.accept='.txt,text/plain,.md,.markdown,.pdf,.docx';
    input.multiple=true;
    input.style.display='none';
    input.onchange=function(){uploadTranscriptFiles(input.files);};
    document.body.appendChild(input);
  }
  input.value='';
  input.click();
};
window.uploadTranscriptFiles=function(files){
  files=Array.prototype.slice.call(files||[]);
  if(!files.length)return;
  var view=document.getElementById('valTranscriptView');
  if(view)view.innerHTML=transcriptHeader('Uploading transcript...',true)+'<div class="val-empty val-transcript-loading">Saving '+files.length+' transcript file'+(files.length===1?'':'s')+' into VAL.</div>';
  var body=new FormData();
  files.forEach(function(file){body.append('files',file,file.name);});
  body.append('docType','transcript');
  body.append('uploadedVia','transcript_tab_upload');
  body.append('processTranscript','true');
  return fetch((window.PROXY||'')+'/api/val/files',{method:'POST',credentials:'same-origin',body:body}).then(function(r){return r.json().catch(function(){return{};}).then(function(data){if(!r.ok||data.ok===false)throw new Error(data.error||'Transcript upload failed.');return data;});}).then(function(data){
    if(typeof addSys==='function')addSys('Uploaded '+Number((data.files&&data.files.length)||1)+' transcript file'+(((data.files&&data.files.length)||1)===1?'':'s')+'.');
    return loadTranscripts(true);
  }).catch(function(e){renderTranscriptError(e.message);throw e;});
};
window.clearTranscriptArchive=function(){
  var phrase=prompt('This permanently clears the current transcript archive for jessa_val. Type clear transcripts to continue.','');
  if(!phrase)return;
  var fetcher=typeof apiFetch==='function'?apiFetch:function(url,opts){return fetch(url,Object.assign({credentials:'same-origin'},opts||{})).then(function(r){return r.json().then(function(data){if(!r.ok||data.ok===false)throw new Error(data.error||'Transcript cleanup failed.');return data;});});};
  var view=document.getElementById('valTranscriptView');if(view)view.innerHTML=transcriptHeader('Clearing transcript data...',true)+'<div class="val-empty val-transcript-loading">Removing transcript archive records, summaries, staging data, and transcript memory chunks.</div>';
  return fetcher((window.PROXY||'')+'/api/val/transcripts/clear-all',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({confirmation:phrase})}).then(function(data){
    transcriptState.items=[];transcriptState.counts={total:0,needsReview:0,failedProcessing:0};transcriptState.loaded=true;
    if(typeof addSys==='function')addSys('Transcript archive cleared.');
    renderTranscriptList();
    return data;
  }).catch(function(e){renderTranscriptError(e.message);throw e;});
};
window.repairTranscriptProcessing=function(){
  var view=document.getElementById('valTranscriptView');if(view)view.innerHTML=transcriptHeader('Processing pending transcripts…')+'<div class="val-empty val-transcript-loading">VAL is processing received transcripts now. This can take a little while.</div>';
  var fetcher=typeof apiFetch==='function'?apiFetch:function(url,opts){return fetch(url,Object.assign({credentials:'same-origin'},opts||{})).then(function(r){return r.json().then(function(data){if(!r.ok||data.ok===false)throw new Error(data.error||'Transcript repair failed.');return data;});});};
  return fetcher((window.PROXY||'')+'/api/val/transcripts/repair',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({limit:25})}).then(function(data){if(typeof addSys==='function')addSys('Transcript repair: '+data.processed+' processed, '+data.failed+' failed.');return loadTranscripts(true);}).catch(function(e){renderTranscriptError(e.message);throw e;});
};
window.reprocessRecentTranscripts=function(){
  if(!confirm('Reprocess the 10 most recent transcripts with the current intelligence engine? This replaces extracted summaries, staged transcript tasks, decisions, and evidence observations, but keeps the raw transcripts.'))return;
  var view=document.getElementById('valTranscriptView');if(view)view.innerHTML=transcriptHeader('Reprocessing recent transcripts…')+'<div class="val-empty val-transcript-loading">VAL is rerunning the current meeting intelligence engine on recent transcripts.</div>';
  var fetcher=typeof apiFetch==='function'?apiFetch:function(url,opts){return fetch(url,Object.assign({credentials:'same-origin'},opts||{})).then(function(r){return r.json().then(function(data){if(!r.ok||data.ok===false)throw new Error(data.error||'Transcript reprocess failed.');return data;});});};
  return fetcher((window.PROXY||'')+'/api/val/transcripts/reprocess',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({limit:10})}).then(function(data){if(typeof addSys==='function')addSys('Transcript reprocess: '+data.processed+' processed, '+data.failed+' failed.');return loadTranscripts(true);}).catch(function(e){renderTranscriptError(e.message);throw e;});
};
window.reprocessTranscript=function(id){
  id=id||(transcriptState.active&&transcriptState.active.id)||'';
  if(!id)return;
  if(!confirm('Reprocess this transcript with the current intelligence engine? This replaces extracted summary objects, staged transcript tasks, decisions, and evidence observations for this transcript.'))return;
  var view=document.getElementById('valTranscriptView');if(view)view.innerHTML=transcriptHeader('Reprocessing transcript…',true)+'<div class="val-empty val-transcript-loading">VAL is rerunning meeting intelligence for this transcript.</div>';
  var fetcher=typeof apiFetch==='function'?apiFetch:function(url,opts){return fetch(url,Object.assign({credentials:'same-origin'},opts||{})).then(function(r){return r.json().then(function(data){if(!r.ok||data.ok===false)throw new Error(data.error||'Transcript reprocess failed.');return data;});});};
  return fetcher((window.PROXY||'')+'/api/val/transcripts/reprocess',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({transcriptId:id,limit:1})}).then(function(data){if(typeof addSys==='function')addSys('Transcript reprocess: '+data.processed+' processed, '+data.failed+' failed.');return openTranscriptDetail(id);}).catch(function(e){renderTranscriptError(e.message);throw e;});
};
window.recoverStoredTranscripts=function(){
  if(transcriptRecoveryRunning)return Promise.resolve(null);
  transcriptRecoveryRunning=true;
  var view=document.getElementById('valTranscriptView');if(view)view.innerHTML=transcriptHeader('Recovering transcripts already stored elsewhere in VAL...',true)+'<div class="val-empty val-transcript-loading">Scanning VAL memory, evidence, conversations, uploads, and Teach VAL records for transcript-shaped content...</div>';
  var fetcher=typeof apiFetch==='function'?apiFetch:function(url,opts){return fetch(url,Object.assign({credentials:'same-origin'},opts||{})).then(function(r){return r.json().then(function(data){if(!r.ok||data.ok===false)throw new Error(data.error||'Stored transcript recovery failed.');return data;});});};
  var controller=window.AbortController?new AbortController():null,timeout=setTimeout(function(){try{controller&&controller.abort();}catch(_){}},45000);
  return fetcher((window.PROXY||'')+'/api/val/transcripts/recover-existing',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({days:3650,limit:20}),signal:controller&&controller.signal}).then(function(data){
    clearTimeout(timeout);
    transcriptRecoveryRunning=false;
    var samples=(data.importedSamples||[]).map(function(x){return '<article class="val-review-card"><span class="val-status '+(x.processingError?'review':'ok')+'">'+(x.processingError?'Needs processing':'Recovered')+'</span><h3>'+safe(transcriptShortText(x.title||x.id,'Recovered transcript',110))+'</h3><p>'+safe((x.sourceType||'stored VAL record')+' · '+(x.characters||0)+' chars'+(x.deferredProcessing?' · ready for Process Pending':'')+(x.processingError?' · '+x.processingError:''))+'</p></article>';}).join('');
    if(view)view.innerHTML=transcriptHeader('Recovered '+Number(data.imported||0)+' stored transcript'+(Number(data.imported||0)===1?'':'s')+'.',true)+'<div class="val-transcript-stats"><span class="val-transcript-stat"><strong>'+Number(data.candidates||0)+'</strong> candidates found</span><span class="val-transcript-stat"><strong>'+Number(data.imported||0)+'</strong> imported</span><span class="val-transcript-stat"><strong>'+Number(data.skipped||0)+'</strong> skipped</span><span class="val-transcript-stat"><strong>'+Number((data.errors||[]).length)+'</strong> errors</span></div><div class="val-empty">Recovery now saves raw transcripts first so the page does not time out. Use <strong>Process Pending</strong> to extract summaries and action items in smaller batches.</div><div class="val-review-grid">'+(samples||'<div class="val-empty">No recoverable transcript-shaped records were found in VAL storage.</div>')+'</div>';
    return loadTranscripts(false).then(function(){return data;}).catch(function(){return data;});
  }).catch(function(e){clearTimeout(timeout);transcriptRecoveryRunning=false;if(String(e.name||'')==='AbortError'){renderTranscriptError('Recovery took longer than expected and was stopped before the browser could get stuck. Try again after refreshing, or use Intake Status to inspect where records are stored.');return null;}if(/session expired|authentication required|please log back in/i.test(String(e.message||e))){renderTranscriptAuthExpired();return null;}renderTranscriptError(e.message);throw e;});
};
window.renderTranscriptList=function(){
  transcriptState.active=null;var view=document.getElementById('valTranscriptView');if(!view)return;
  var c=transcriptState.counts,hasItems=(transcriptState.items||[]).length>0;
  var empty=hasItems?'<section class="val-transcript-blank"><h3>Select a transcript</h3><p>Choose one from the left to open its Notes and Transcript. VAL will keep this space quiet until you ask to review something.</p><div class="val-transcript-stats"><span class="val-transcript-stat"><strong>'+Number(c.total||transcriptState.items.length)+'</strong> transcripts</span><span class="val-transcript-stat"><strong>'+Number(c.failedProcessing||0)+'</strong> processing issues</span></div></section>':'<div class="val-empty"><strong>No real transcripts are available yet.</strong><br>No transcripts are available yet because VAL has not received a usable meeting, voice, VAL conversation, upload, or webhook transcript for this dashboard. Planning notes, prompts, drafts, and task artifacts are intentionally hidden here.</div>';
  view.innerHTML=transcriptHeader('Choose a transcript from the left. Notes and raw transcript evidence will appear here after you select one.')+'<div class="val-transcript-workspace list-only">'+transcriptSidebarHtml('')+'<main class="val-transcript-main">'+empty+'</main></div>';
};
window.renderTranscriptReviewQueue=function(){
  var view=document.getElementById('valTranscriptView');if(!view)return;
  view.innerHTML=transcriptHeader('Loading transcript review…',true)+'<div class="val-empty">Loading…</div>';
  var fetcher=typeof apiFetch==='function'?apiFetch:function(url){return fetch(url,{credentials:'same-origin'}).then(function(r){return r.json();});};
  fetcher((window.PROXY||'')+'/api/val/transcripts/review').then(function(d){
    var cards=[];
    (d.decisions||[]).forEach(function(x){cards.push('<article class="val-review-card"><span class="val-status review">Decision</span><h3>'+safe(x.title||'Decision needs review')+'</h3><p>'+safe(x.summary||'Review this before VAL uses it for drafts or next actions.')+'</p><button class="val-ui-btn primary" onclick="reviewValDecision(\''+safe(x.id)+'\',\'approved\')">Approve</button><button class="val-ui-btn" onclick="reviewValDecision(\''+safe(x.id)+'\',\'dismissed\')">Dismiss</button><button class="val-ui-btn" onclick="openTranscriptDetail(\''+safe(x.sourceId)+'\')">Open Source</button></article>');});
    (d.participants||[]).forEach(function(p){cards.push('<article class="val-review-card"><span class="val-status review">Participant match</span><h3>'+safe(p.speakerNameRaw)+'</h3><p>'+safe(p.matchReason)+' · '+Math.round(Number(p.matchConfidence||0)*100)+'% confidence</p><button class="val-ui-btn primary" onclick="approveTranscriptParticipant(\''+safe(p.participantId)+'\')">Approve Match</button></article>');});
    (d.tasks||[]).forEach(function(t){cards.push('<article class="val-review-card"><span class="val-status review">Task</span><h3>'+safe(t.taskTitle)+'</h3><p>'+safe(t.assignedToName||'Assignment unclear')+' · “'+safe(t.sourceQuote)+'”</p><button class="val-ui-btn primary" onclick="approveTranscriptTask(\''+safe(t.taskId)+'\')">Approve & Create</button></article>');});
    (d.contactUpdates||[]).forEach(function(u){cards.push('<article class="val-review-card"><span class="val-status review">Contact update</span><h3>'+safe(u.fieldToUpdate)+': '+safe(u.newValue)+'</h3><p>'+safe(u.reason)+' · “'+safe(u.sourceQuote)+'”</p><button class="val-ui-btn" onclick="approveTranscriptContactUpdate(\''+safe(u.updateId)+'\')">Approve Update</button></article>');});
    view.innerHTML=transcriptHeader('Review Queue · only uncertain items from real transcripts appear here.',true)+'<div class="val-review-grid">'+(cards.join('')||'<div class="val-empty"><strong>No transcript decisions need review.</strong><br>If you expected items here, first confirm a real transcript has been captured in the Inbox view. VAL now hides planning notes, prompts, and task artifacts from transcript review.</div>')+'</div>';
  }).catch(function(e){renderTranscriptError(e.message);});
};
window.renderTranscriptIntakeStatus=function(){
  var view=document.getElementById('valTranscriptView');if(!view)return;
  view.innerHTML=transcriptHeader('Checking where transcript records are landing...',true)+'<div class="val-empty">Loading intake status...</div>';
  var fetcher=typeof apiFetch==='function'?apiFetch:function(url){return fetch(url,{credentials:'same-origin'}).then(function(r){return r.json().then(function(d){if(!r.ok||d.ok===false)throw new Error(d.error||'Intake status failed');return d;});});};
  fetcher((window.PROXY||'')+'/api/val/transcripts/intake-status?days=3650').then(function(d){
    var c=d.counts||{}, latest=d.latestRawTranscript||null, webhook=d.webhook||{};
    var stats=[
      ['Visible transcripts',c.visibleTranscripts],
      ['Raw canonical rows',c.rawCanonicalRows],
      ['Raw legacy rows',c.rawLegacyRows],
      ['Hidden canonical rows',c.hiddenCanonicalRows],
      ['Transcript memory rows',c.transcriptMemoryRows],
      ['Upload/webhook audit events',c.transcriptAuditEvents],
      ['Accepted without transcript text',c.webhookAcceptedWithoutTranscriptText],
      ['Krisp-linked records',c.krispLinkedRows],
      ['Purged recovered trash',c.purgedRecoveredTrash],
      ['Calendar links',c.meetingLinks]
    ].map(function(pair){return '<span class="val-transcript-stat"><strong>'+safe(pair[1]||0)+'</strong> '+safe(pair[0])+'</span>';}).join('');
    var hidden=(d.hiddenSamples||[]).map(function(x){return '<article class="val-review-card"><span class="val-status review">Hidden</span><h3>'+safe(transcriptShortText(x.title||x.id,'Untitled record',110))+'</h3><p>'+safe((x.source||'unknown')+' · '+(x.reason||'filtered')+' · '+(x.createdAt||''))+'</p></article>';}).join('');
    var krisp=(d.krispSamples||[]).map(function(x){return '<article class="val-review-card"><span class="val-status ok">Krisp</span><h3>'+safe(transcriptShortText(x.title||x.id,'Krisp-linked record',110))+'</h3><p>'+safe((x.source||'unknown')+' · '+(x.characters||0)+' chars · '+(x.createdAt||''))+'</p></article>';}).join('');
    var noText=(d.recentNoTextWebhooks||[]).map(function(x){var meta=x.metadata||{};return '<article class="val-review-card"><span class="val-status review">Accepted, no transcript text</span><h3>'+safe(meta.title||meta.eventId||'Krisp webhook accepted')+'</h3><p>'+safe((x.createdAt||'')+' · '+(meta.contentType||'no content type')+' · '+(meta.contentLength||'0')+' bytes')+'</p><p>Keys: '+safe((meta.keys||[]).join(', ')||'none')+'</p><p>'+safe(transcriptShortText(meta.preview||'No body preview captured yet. Resend one Krisp event after this deploy to inspect the payload.', '', 220))+'</p></article>';}).join('');
    var audit=(d.recentAudit||[]).map(function(x){var meta=x.metadata||{};return '<article class="val-review-card"><span class="val-status '+(x.success?'ok':'review')+'">'+safe(x.action||'audit')+'</span><h3>'+safe(meta.fileName||meta.title||x.resourceId||'Transcript intake event')+'</h3><p>'+safe((x.createdAt||'')+' · '+(meta.docType||meta.source||'')+' · '+(meta.processingError||meta.characters||''))+'</p></article>';}).join('');
    var memory=(d.recentMemory||[]).map(function(x){return '<article class="val-review-card"><span class="val-status review">'+safe(x.kind||'memory')+'</span><h3>'+safe(transcriptShortText(x.title||x.id,'Memory record',110))+'</h3><p>'+safe((x.docType||'')+' · '+(x.uploadedVia||'')+' · '+(x.characters||0)+' chars · '+(x.createdAt||''))+'</p></article>';}).join('');
    var latestHtml=latest?'<section class="val-detail-card"><h3>Latest raw transcript-like record</h3><p>'+safe([latest.title||latest.id,latest.source,latest.createdAt,latest.characters+' characters'].filter(Boolean).join(' · '))+'</p></section>':'<section class="val-detail-card"><h3>Latest raw transcript-like record</h3><p>No raw transcript rows were found in VAL storage.</p></section>';
    view.innerHTML=transcriptHeader('Intake Status · where webhook and uploaded transcript records are landing.',true)+'<div class="val-transcript-stats">'+stats+'</div><div class="val-transcript-detail"><div class="val-detail-main"><section class="val-detail-card"><h3>Webhook</h3><p>'+safe(webhook.live?'Live signed webhook URL is configured. Use Webhook Setup to copy the exact URL with token.':'Webhook status unavailable.')+'</p><p>Token preview: '+safe(webhook.tokenPreview||'hidden')+'</p></section>'+latestHtml+'<section class="val-detail-card"><h3>Accepted webhooks without transcript text</h3><div class="val-review-grid">'+(noText||'<div class="val-empty">No accepted-empty webhook events found.</div>')+'</div></section><section class="val-detail-card"><h3>Krisp-linked records</h3><div class="val-review-grid">'+(krisp||'<div class="val-empty">No records containing app.krisp.ai links were found.</div>')+'</div></section><section class="val-detail-card"><h3>Hidden or filtered records</h3><div class="val-review-grid">'+(hidden||'<div class="val-empty">No hidden transcript-like rows found.</div>')+'</div></section></div><aside class="val-detail-side"><section class="val-detail-card"><h3>Recent intake audit</h3><div class="val-review-grid">'+(audit||'<div class="val-empty">No upload or webhook audit events found yet.</div>')+'</div></section><section class="val-detail-card"><h3>Transcript-like memory</h3><div class="val-review-grid">'+(memory||'<div class="val-empty">No transcript-like memory records found.</div>')+'</div></section></aside></div>';
  }).catch(function(e){renderTranscriptError(e.message);});
};
function renderTranscriptError(message){var view=document.getElementById('valTranscriptView');if(view)view.innerHTML=transcriptHeader('Transcript archive unavailable')+'<div class="val-empty val-transcript-error"><strong>Unable to load transcripts.</strong><br>Check the transcript retrieval endpoint or server logs.<br><small>'+safe(message)+'</small></div>';}
function renderTranscriptAuthExpired(){var view=document.getElementById('valTranscriptView'),next=encodeURIComponent(location.pathname+location.search);if(view)view.innerHTML=transcriptHeader('Session expired')+'<div class="val-empty val-transcript-error"><strong>Please sign back in.</strong><br>VAL kept you on this page instead of redirecting during recovery.<br><button class="val-ui-btn primary" onclick="window.location.href=\'/login?next='+next+'\'">Open Login</button></div>';}
function transcriptObjectLabel(x){
  if(!x||typeof x==='string')return x||'';
  var head=[x.category,x.title||x.decision||x.question||x.summary||x.text].filter(Boolean).join(': ');
  var meta=[x.owner?'Owner: '+x.owner:'',x.timestamp?'Time: '+x.timestamp:'',x.relatedProject?'Project: '+x.relatedProject:'',x.confidence?'Confidence: '+Math.round(Number(x.confidence||0)*100)+'%':''].filter(Boolean).join(' · ');
  return [head,meta,x.sourceQuote?'Evidence: '+x.sourceQuote:''].filter(Boolean).join(' — ');
}
function normalizeList(items){return (Array.isArray(items)?items:[]).map(function(x){return typeof x==='string'?x:transcriptObjectLabel(x)||(x.title||x.text||x.summary||x.name||x.email||JSON.stringify(x));}).filter(Boolean);}
function transcriptCleanText(value,fallback){
  var text=String(value||'').replace(/\[(?:relationship|chat)_memory\]/gi,'').replace(/\*\*/g,'').replace(/#{1,6}\s*/g,'').replace(/\bUser\/Time\/Date\b/gi,'').replace(/\b(?:Attendee intelligence|Saved memory|dashboard context|user profile context):?/gi,'').replace(/\s+/g,' ').trim();
  if(!text||/^(unknown|user|time|date)$/i.test(text))return fallback||'';
  return text;
}
function transcriptShortText(value,fallback,limit){
  var clean=transcriptCleanText(value,fallback||'');
  limit=limit||260;
  return clean.length>limit?clean.slice(0,limit-1).trim()+'…':clean;
}
function transcriptIsUsableAction(x){
  var text=[x&&x.taskTitle,x&&x.taskDescription,x&&x.sourceQuote].filter(Boolean).join(' ');
  if(/deterministic fallback processor/i.test(text))return false;
  if(/_transcript\.txt|review_transcript|transcript captured/i.test(text))return false;
  return !!transcriptCleanText(x&&x.taskTitle,'');
}
function transcriptSidebarHtml(activeId){
  var rows=(transcriptState.items||[]).map(function(t){
    var isActive=String(t.id)===String(activeId||'');
    var summary=t.summary&&typeof t.summary==='object'?t.summary.executiveSummary:(t.summaryPreview||t.summary||t.preview||'Summary pending.');
    return '<button class="val-transcript-side-item'+(isActive?' active':'')+'" onclick="openTranscriptDetail(\''+safe(t.id)+'\')"><strong>'+safe(transcriptShortText(t.title,'Transcript',72))+'</strong><span>'+safe(t.createdAt?new Date(t.createdAt).toLocaleDateString():(t.source||'Transcript'))+'</span><small>'+safe(transcriptShortText(summary,'Open to review notes.',96))+'</small></button>';
  }).join('');
  return '<aside class="val-transcript-sidebar"><div class="val-transcript-sidebar-head"><strong>Transcripts</strong><span>'+Number(transcriptState.items.length||0)+'</span></div>'+(rows||'<div class="val-empty">No transcripts yet.</div>')+'</aside>';
}
function transcriptNotesHtml(t,s,tasks,createdTasks,debug){
  var decisions=detailList(s.keyDecisions,'No decisions extracted yet.');
  var openQuestions=detailList(s.openQuestions,'No open questions or decision needs extracted yet.');
  var risks=detailList((s.relationshipUpdates||[]).filter(function(x){return /risk|dependency/i.test(String((x&&x.category)||''));}),'No risks or dependencies extracted yet.');
  var intelligence=detailList([s.clientSummary,s.internalNotes].concat((s.relationshipUpdates||[]).filter(function(x){return !/risk|dependency/i.test(String((x&&x.category)||''));})).filter(Boolean),'No meeting intelligence objects extracted yet.');
  var usableActions=(t.tasks||[]).filter(transcriptIsUsableAction);
  var hiddenActions=(t.tasks||[]).length-usableActions.length;
  var actionItems=usableActions.length?usableActions.map(function(x){
    var created=String(x.status||'').toLowerCase()==='created',virtual=!!x.virtual||String(x.taskId||'').indexOf('suggested_')===0;
    return '<article class="val-action-note"><div><strong>'+safe(x.taskTitle||'Action item')+'</strong><p>'+safe(x.taskDescription||x.sourceQuote||'Transcript action item.')+'</p>'+(x.sourceQuote?'<small>Evidence: '+safe(x.sourceQuote)+'</small>':'')+'</div><span class="val-status '+(created?'ok':'review')+'">'+(created?'Added to Actions':(virtual?'Suggested':'Needs approval'))+'</span>'+(created||virtual?'':'<button class="val-ui-btn primary" onclick="approveTranscriptTask(\''+safe(x.taskId)+'\')">Add to Actions</button>')+'</article>';
  }).join(''):'<p class="val-note-empty">No clear action items yet. VAL kept lower-confidence transcript fragments out of this list so they do not look more certain than they are.</p>';
  var hiddenNote=hiddenActions>0?'<p class="val-note-hint">'+hiddenActions+' lower-confidence extraction'+(hiddenActions===1?' is':'s are')+' kept in Processing details for review.</p>':'';
  return '<div class="val-transcript-notes"><section class="val-detail-card val-overview-card"><h3>What Changed</h3><p>'+safe(transcriptShortText(s.executiveSummary||s.clientSummary||'Summary pending.','Summary pending.',900))+'</p></section><section class="val-detail-card"><h3>Action Items</h3><div class="val-action-note-list">'+actionItems+'</div>'+hiddenNote+'</section><section class="val-detail-card"><h3>Decisions</h3>'+decisions+'</section><section class="val-detail-card"><h3>Open Questions</h3>'+openQuestions+'</section><section class="val-detail-card"><h3>Risks & Dependencies</h3>'+risks+'</section><section class="val-detail-card"><h3>Meeting Intelligence</h3>'+intelligence+'</section>'+debug+'</div>';
}
window.setTranscriptTab=function(tab){
  var view=document.getElementById('valTranscriptView');if(!view)return;
  view.querySelectorAll('[data-transcript-tab]').forEach(function(btn){btn.classList.toggle('active',btn.getAttribute('data-transcript-tab')===tab);});
  view.querySelectorAll('[data-transcript-panel]').forEach(function(panel){panel.classList.toggle('active',panel.getAttribute('data-transcript-panel')===tab);});
};
window.openTranscriptDetail=function(id){
  var view=document.getElementById('valTranscriptView');if(view)view.innerHTML='<div class="val-empty">Opening transcript…</div>';
  return (typeof apiFetch==='function'?apiFetch((window.PROXY||'')+'/api/val/transcripts/'+encodeURIComponent(id)):fetch('/api/val/transcripts/'+encodeURIComponent(id),{credentials:'same-origin'}).then(function(r){return r.json().then(function(data){if(!r.ok)throw new Error(data.error||'Transcript could not be opened.');return data;});})).then(function(data){if(!data.transcript)throw new Error(data.error||'Transcript could not be opened.');transcriptState.active=data.transcript;renderTranscriptDetail(data.transcript);return data.transcript;}).catch(function(e){renderTranscriptError(e.message);throw e;});
};
function detailList(items,empty){var arr=normalizeList(items);return arr.length?'<ul>'+arr.map(function(x){return '<li>'+safe(x)+'</li>';}).join('')+'</ul>':'<p>'+safe(empty)+'</p>';}
function draftRecipients(ctx){var r=ctx&&ctx.recipients;if(Array.isArray(r))return r.join(', ');return (ctx&&ctx.recipient)||(ctx&&ctx.recipientEmail)||'';}
function renderTranscriptDetail(t){
  var view=document.getElementById('valTranscriptView');if(!view)return;var meta=[t.contactName,t.source,t.createdAt?new Date(t.createdAt).toLocaleString():''].filter(Boolean).join(' · ');
  var s=t.summary&&typeof t.summary==='object'?t.summary:{executiveSummary:t.summary||''};
  var participants=(t.participants||[]).map(function(p){return (p.matchedContactName||p.speakerNameRaw)+' — '+Math.round(Number(p.matchConfidence||0)*100)+'% · '+p.matchReason+(p.needsReview?' [review]':'');});
  var tasks=(t.tasks||[]).map(function(x){return x.taskTitle+' — '+(x.status||'staged')+' · “'+x.sourceQuote+'”';});
  var createdTasks=(t.tasks||[]).filter(function(x){return String(x.status||'').toLowerCase()==='created';}).map(function(x){return x.taskTitle+' — '+(x.assignedToName||'VAL task system')+(x.dueDate?' · due '+x.dueDate:'');});
  var updates=(t.contactUpdates||[]).map(function(x){return x.fieldToUpdate+': '+x.newValue+' · “'+x.sourceQuote+'”';}),log=(t.actionLog||[]).map(function(x){return x.actionType+' — '+x.status+(x.errorMessage?' · '+x.errorMessage:'');});
  var canonical=t.canonical||{},canonicalConversation=canonical.conversation?[canonical.conversation.title||canonical.conversation.id]:[],canonicalIdentities=(canonical.identityLinks||[]).map(function(x){return (x.label||x.normalizedValue||x.entityId)+' — '+(x.normalizedValue||'identity')+' · '+Math.round(Number(x.confidence||0)*100)+'%';}),canonicalDecisions=(canonical.decisions||[]).map(function(x){return (x.title||x.summary||'Decision')+' — '+(x.status||'needs_review')+' · '+Math.round(Number(x.confidence||0)*100)+'%';});
  var status=['Processing: '+(t.processingStatus||t.status||'received'),'Summary: '+(t.summaryStatus||'pending'),'Review items: '+Number(t.reviewCount||0),'Tasks extracted: '+Number(t.taskCount||(t.tasks||[]).length)].join(' · ');
  var recap=(t.drafts||[]).find(function(d){return d.draftType==='meeting_recap';});
  var recapHtml=recap?'<div class="val-recap-preview"><strong>'+safe(recap.subject||'Meeting recap draft')+'</strong><p>'+safe((recap.body||'').slice(0,700))+'</p><small>Status: '+safe(recap.status||'draft')+(draftRecipients(recap.sourceContext)?' · Recipients: '+safe(draftRecipients(recap.sourceContext)):'')+'</small></div>':'<p>No recap draft has been created yet.</p>';
  var debug='<details class="val-detail-card val-transcript-debug"><summary>Processing details</summary><h3>Status</h3><p>'+safe(status)+'</p><h3>Canonical structure</h3>'+detailList(canonicalConversation.concat(canonicalIdentities).concat(canonicalDecisions),'No canonical conversation, identity, or decision records have been stored for this transcript yet.')+'<h3>Key Points</h3>'+detailList([s.clientSummary,s.internalNotes].concat(s.relationshipUpdates||[]).filter(Boolean),'No key points extracted.')+'<h3>Decisions</h3>'+detailList(s.keyDecisions,'No decisions extracted.')+'<h3>Action Items</h3>'+detailList(tasks,'No action items extracted.')+'<h3>Created Tasks</h3>'+detailList(createdTasks,'No tasks have been pushed to the main task system yet.')+'<h3>Participants & Match Confidence</h3>'+detailList(participants,'No participants detected.')+'<h3>Contact Updates</h3>'+detailList(updates,'No contact updates extracted.')+'<h3>Action Log</h3>'+detailList(log,'No actions logged.')+'<h3>Recap Draft</h3>'+recapHtml+'</details>';
  view.innerHTML=transcriptHeader(meta,true)+'<div class="val-transcript-workspace">'+transcriptSidebarHtml(t.id)+'<main class="val-transcript-main"><div class="val-transcript-selected-head"><div><h2>'+safe(transcriptShortText(t.title,'Transcript',120))+'</h2><p>'+safe(meta||'Transcript intelligence')+'</p></div><div class="val-view-actions"><button class="val-ui-btn" onclick="reprocessTranscript(\''+safe(t.id)+'\')">Reprocess This</button><button class="val-ui-btn primary val-transcript-chat-launch" onclick="openTranscriptChat()">Chat About This Transcript</button></div></div><div class="val-transcript-tabs"><button class="active" data-transcript-tab="notes" onclick="setTranscriptTab(\'notes\')">Notes</button><button data-transcript-tab="transcript" onclick="setTranscriptTab(\'transcript\')">Transcript</button></div><section class="val-transcript-panel active" data-transcript-panel="notes">'+transcriptNotesHtml(t,s,tasks,createdTasks,debug)+'</section><section class="val-transcript-panel" data-transcript-panel="transcript"><section class="val-detail-card"><h3>Transcript</h3><p class="val-full-transcript">'+safe(t.transcriptText||t.rawTranscript||'No transcript text is available.')+'</p></section></section></main></div>';
}
function transcriptApproval(path,body){return fetch((window.PROXY||'')+path,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(body||{})}).then(function(r){return r.json().then(function(d){if(!r.ok||d.ok===false)throw new Error(d.error||'Approval failed');return d;});});}
window.approveTranscriptTask=function(id){transcriptApproval('/api/val/transcripts/tasks/'+encodeURIComponent(id)+'/approve').then(function(){renderTranscriptReviewQueue();loadTranscripts(false);call('valTasksLoad');}).catch(function(e){alert(e.message);});};
window.approveTranscriptParticipant=function(id){var existing=null;transcriptState.items.some(function(t){existing=(t.participants||[]).find(function(p){return p.participantId===id;});return !!existing;});var contactId=existing&&existing.matchedContactId||prompt('Enter the exact CRM contact ID for this participant:');if(!contactId)return;var contactName=existing&&existing.matchedContactName||prompt('Enter the confirmed contact name:')||'';transcriptApproval('/api/val/transcripts/participants/'+encodeURIComponent(id)+'/approve',{contactId:contactId,contactName:contactName}).then(renderTranscriptReviewQueue).catch(function(e){alert(e.message);});};
window.approveTranscriptContactUpdate=function(id){transcriptApproval('/api/val/transcripts/contact-updates/'+encodeURIComponent(id)+'/approve').then(renderTranscriptReviewQueue).catch(function(e){alert(e.message);});};
window.reviewValDecision=function(id,status){transcriptApproval('/api/val/decisions/'+encodeURIComponent(id)+'/review',{status:status}).then(renderTranscriptReviewQueue).catch(function(e){alert(e.message);});};
window.openTranscriptChat=function(question){
  var t=transcriptState.active;if(!t)return;
  var existing=document.getElementById('valTranscriptChatOverlay');if(existing){existing.remove();if(!question)return;}
  transcriptChatHistory=[];
  var el=document.createElement('div');el.id='valTranscriptChatOverlay';el.className='gchat-overlay val-transcript-chat-overlay val-chat-drawer-overlay';
  el.innerHTML='<div class="gchat-modal val-transcript-chat-modal" role="dialog" aria-modal="true" aria-label="Chat about this transcript"><div class="gchat-main"><div class="gchat-header"><div class="gchat-title"><span>Chat About This Transcript</span><span class="gchat-context">'+safe(transcriptShortText(t.title,'Transcript',90))+'</span></div><button class="gchat-close" onclick="document.getElementById(\'valTranscriptChatOverlay\').remove()" aria-label="Close chat">×</button></div><div id="valTranscriptChat" class="gchat-messages"><div class="val-chat-msg">Ask about what happened, what was decided, what matters, or what VAL noticed in this transcript.</div></div><div class="gchat-quick-actions"><button onclick="transcriptAsk(\'What are the key points in this transcript?\')">Key points</button><button onclick="transcriptAsk(\'What are the action items, owners, and timing?\')">Action items</button><button onclick="transcriptAsk(\'What should Jessa do next based only on this transcript?\')">Next move</button></div><div class="gchat-input-row"><textarea id="valTranscriptQuestion" class="gchat-input" placeholder="Ask VAL about this transcript..." onkeydown="if(event.key===\'Enter\'&&!event.shiftKey){event.preventDefault();transcriptAsk();}" oninput="this.style.height=\'auto\';this.style.height=Math.min(this.scrollHeight,124)+\'px\'"></textarea><button class="gchat-send" onclick="transcriptAsk()" aria-label="Ask"><svg fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:16px;height:16px;"><path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/></svg></button></div></div></div>';
  el.onclick=function(e){if(e.target===el)el.remove();};
  document.body.appendChild(el);
  setTimeout(function(){var input=document.getElementById('valTranscriptQuestion');if(input)input.focus();},80);
  if(question)transcriptAsk(question);
};
function chatMessage(text,user){var log=document.getElementById('valTranscriptChat');if(!log){openTranscriptChat();log=document.getElementById('valTranscriptChat');}if(!log)return;var el=document.createElement('div');el.className='val-chat-msg'+(user?' user':'');el.textContent=text;log.appendChild(el);log.scrollTop=log.scrollHeight;}
function transcriptActionSummary(data){
  var action=data&&data.actionsCreated;
  if(!action||action.type!=='tasks'||!Array.isArray(action.tasks)||!action.tasks.length)return '';
  return '\n\nCreated in Actions:\n'+action.tasks.map(function(task,i){return (i+1)+'. '+(task.title||'Task')+(task.contactName?' — '+task.contactName:'')+(task.dueDate?' — due '+new Date(task.dueDate).toLocaleDateString():'');}).join('\n');
}
window.transcriptAsk=function(question){
  var t=transcriptState.active;if(!t)return;var input=document.getElementById('valTranscriptQuestion'),q=question||(input&&input.value.trim());if(!q)return;if(input)input.value='';chatMessage(q,true);chatMessage('Working from this transcript…',false);var log=document.getElementById('valTranscriptChat'),pending=log&&log.lastChild;
  var prior=transcriptChatHistory.slice(-8);
  transcriptChatHistory.push({role:'user',content:q});
  fetch((window.PROXY||'')+'/api/val/transcripts/'+encodeURIComponent(t.id)+'/chat',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:q,history:prior})}).then(function(r){return r.json().then(function(d){if(!r.ok||d.ok===false)throw new Error(d.error||'Transcript chat failed.');return d;});}).then(function(d){if(pending)pending.remove();if(d.actionsCreated&&d.actionsCreated.type==='tasks'){call('valTasksLoad');loadTranscripts(false).catch(function(){});}var answer=(d.message&&d.message.content)||d.message||'No response was returned.';transcriptChatHistory.push({role:'assistant',content:answer});chatMessage(answer,false);}).catch(function(e){if(pending)pending.remove();chatMessage('Unable to complete that request: '+e.message,false);});
};
function transcriptById(id){return transcriptState.items.find(function(t){return String(t.id)===String(id);})||transcriptState.active;}
function transcriptAction(id,action){return fetch((window.PROXY||'')+'/api/val/transcripts/'+encodeURIComponent(id)+'/actions',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:action})}).then(function(r){return r.json().catch(function(){return{};}).then(function(data){if(!r.ok||data.ok===false)throw new Error(data.error||'Transcript action failed.');return data;});});}
window.transcriptAskFromList=function(id){return openTranscriptDetail(id).then(function(){transcriptAsk('What matters most in this transcript, and what should happen next?');}).catch(function(){});};
window.transcriptCreateTask=function(id){var t=transcriptById(id);if(!t)return;return transcriptAction(t.id,'create_task').then(function(data){if(transcriptState.active&&String(transcriptState.active.id)===String(t.id))chatMessage('Task created: '+data.task.title,false);else if(typeof addSys==='function')addSys('Task created from '+t.title+': '+data.task.title);call('valTasksLoad');}).catch(function(e){if(transcriptState.active)chatMessage('Task was not created: '+e.message,false);else if(typeof addSys==='function')addSys('Task was not created: '+e.message);});};
window.transcriptDraftFollowUp=function(id){var t=transcriptById(id);if(!t)return;return transcriptAction(t.id,'draft_followup').then(function(data){var message='Draft saved for approval.\n\nSubject: '+data.draft.subject+'\n\n'+data.draft.body;if(transcriptState.active&&String(transcriptState.active.id)===String(t.id))chatMessage(message,false);else{if(typeof addSys==='function')addSys('Follow-up draft saved for '+t.title+'.');openTranscriptDetail(t.id).then(function(){chatMessage(message,false);});}}).catch(function(e){if(transcriptState.active)chatMessage('Follow-up draft failed: '+e.message,false);else if(typeof addSys==='function')addSys('Follow-up draft failed: '+e.message);});};
window.transcriptReviewRecapDraft=function(){var t=transcriptState.active;if(!t)return;if(typeof openDraftsPage==='function')openDraftsPage();};
window.transcriptRegenerateRecapDraft=function(){var t=transcriptState.active;if(!t)return;transcriptDraftFollowUp(t.id).then(function(){loadDraftSignals(false);openTranscriptDetail(t.id);});};
window.transcriptAskFocus=function(){openTranscriptChat();};
window.transcriptMarkReviewed=function(){var t=transcriptState.active;if(!t)return;transcriptAction(t.id,'mark_reviewed').then(function(){t.reviewStatus='reviewed';t.status='reviewed';chatMessage('Marked reviewed.',false);loadTranscripts(false).catch(function(){});}).catch(function(e){chatMessage('Could not mark reviewed: '+e.message,false);});};
var originalSend=window.sendMessage;window.sendMessage=function(){var input=document.getElementById('msgInput');if(transcriptState.active&&document.getElementById('valTranscriptView')&&document.getElementById('valTranscriptView').classList.contains('open')&&input&&input.value.trim()){var q=input.value.trim();input.value='';input.style.height='auto';transcriptAsk(q);return;}return originalSend&&originalSend.apply(window,arguments);};
document.addEventListener('click',function(e){var nav=document.getElementById('valPrimaryNav');if(nav&&nav.classList.contains('open')&&!nav.contains(e.target)&&!e.target.closest('.val-mobile-nav'))nav.classList.remove('open');});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installShell);else installShell();
setTimeout(updateCommandCenterBadges,1200);setTimeout(updateCommandCenterBadges,3500);
setInterval(function(){updateCommandCenterBadges();},15000);
})();
