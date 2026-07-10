(function(){
'use strict';
var transcriptState={items:[],counts:{total:0,needsReview:0,withOpenActions:0,failedProcessing:0},active:null,loaded:false,loading:false,error:'',lastLoadedAt:''};
var transcriptRecoveryRunning=false;
var draftSignalState={drafts:[],loaded:false,error:''};
var executiveBriefingState={data:null,loaded:false,loading:false,error:'',lastLoadedAt:''};
var VAL_LOGO_URL='https://assets.cdn.filesafe.space/JuRSFup6NNQErVKkXlX5/media/6a3fd004c93b89d83f6008e6.png';
var navItems=[
  {id:'dashboard',icon:'home',label:'Home',group:'core'},
  {id:'relationships',icon:'people',label:'Relationships',group:'core'},
  {id:'projects',icon:'folder',label:'Projects',group:'core'},
  {id:'evidence',icon:'evidence',label:'Evidence',group:'core'},
  {id:'transcripts',icon:'document',label:'Transcripts',group:'core'},
  {id:'calendar',icon:'calendar',label:'Calendar',group:'core'},
  {id:'documents',icon:'document',label:'Documents',group:'core'},
  {id:'email_intelligence',icon:'mail',label:'Executive Inbox',group:'growth'},
  {id:'leads_employers',icon:'search',label:'Scrape Employers',group:'growth'},
  {id:'leads_partners',icon:'search',label:'Scrape Partners',group:'growth'},
  {id:'commitments',icon:'check',label:'Commitments',group:'growth'},
  {id:'drafts',icon:'document',label:'Drafts',group:'growth'},
  {id:'teach_val',icon:'spark',label:'Teach VAL',group:'growth'},
  {id:'val_os',icon:'system',label:'My VAL OS',group:'settings'},
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
function visibleNavItems(){
  var isJessa=String((window.VAL_CONFIG&&VAL_CONFIG.clientSlug)||'').toLowerCase()==='jessa-val';
  return navItems.filter(function(n){
    if(isJessa&&n.id==='calendar')return false;
    return n.id!=='settings_dashboard_studio'||dashboardStudioEnabled();
  });
}
function valBrandName(){return (window.VAL_CONFIG&&(VAL_CONFIG.brandName||VAL_CONFIG.clientName))||'VAL';}
function clientFirstName(){var name=(window.VAL_CONFIG&&VAL_CONFIG.clientName)||'Jessa';return String(name).split(/\s+/)[0]||'there';}
function pendingDraftCount(){return (draftSignalState.drafts||[]).filter(function(d){return !/sent|approved|done/i.test(String(d.status||'draft'));}).length;}
function openTaskCount(){return taskInfo().open.length;}
function transcriptAttentionCount(){var c=transcriptState.counts||{};return Number(c.needsReview||0)+Number(c.failedProcessing||0);}
function navBadge(view){
  var count=view==='drafts'?pendingDraftCount():((view==='tasks'||view==='commitments')?openTaskCount():(view==='evidence'?transcriptAttentionCount():0));
  return '<span class="val-nav-badge'+(count?'':' empty')+'" data-badge-view="'+safe(view)+'">'+(count?String(count):'')+'</span>';
}
function updateCommandCenterBadges(){
  document.querySelectorAll('[data-badge-view]').forEach(function(el){
    var view=el.getAttribute('data-badge-view'),count=view==='drafts'?pendingDraftCount():((view==='tasks'||view==='commitments')?openTaskCount():(view==='evidence'?transcriptAttentionCount():0));
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
    system:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 3M8 12h1M15 12h1M12 8v1M12 15v1',
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
function installValExperienceSystemStyle(){
  if(document.getElementById('valExperienceSystemMandate'))return;
  var style=document.createElement('style');
  style.id='valExperienceSystemMandate';
  style.textContent=`
:root{
  --val-ivory:#FBF8F3;
  --val-canvas:#F6F2EA;
  --val-glow:#F8E8BE;
  --val-gold:#C89B3C;
  --val-gold-deep:#A97922;
  --val-deep:#102D5B;
  --val-night:#081E43;
  --val-olive:#C8D9B2;
  --val-gray:#E9E3D8;
  --val-ink:#0B1730;
  --val-muted:#667280;
  --val-border:rgba(16,45,91,.11);
  --val-border-gold:rgba(200,155,60,.34);
  --val-shadow-soft:0 16px 45px rgba(8,30,67,.08);
  --val-shadow-rise:0 24px 70px rgba(8,30,67,.14);
  --val-radius:24px;
  --val-radius-sm:16px;
  --body:'Inter','Jost',system-ui,sans-serif;
  --serif:'Cormorant Garamond',Georgia,serif;
  --navy:var(--val-deep);
  --gold:var(--val-gold);
  --cream:var(--val-ivory);
  --cream-2:var(--val-canvas);
}
html,body,.app{background:var(--val-canvas)!important;color:var(--val-ink)!important;font-family:var(--body)!important}
*{letter-spacing:0!important}
*{cursor:none!important}
input,textarea,[contenteditable="true"]{cursor:text!important;caret-color:var(--val-gold)!important}
button,a,[role="button"],.chip,.tbtn,.cbtn,.send-btn,.val-nav-item,.day-evt,.val-dash-card{cursor:pointer!important}
#val-cursor{display:block!important;background:var(--val-gold)!important;width:7px!important;height:7px!important;box-shadow:0 0 18px rgba(200,155,60,.55)!important}
#val-cursor-ring{display:block!important;width:34px!important;height:34px!important;border:1px solid rgba(200,155,60,.38)!important;box-shadow:0 0 28px rgba(200,155,60,.12)!important}
.app{grid-template-columns:242px minmax(0,1fr)!important;grid-template-rows:64px minmax(0,1fr)!important;background:var(--val-canvas)!important}
.val-primary-nav{background:rgba(255,255,255,.68)!important;border-right:1px solid var(--val-border)!important;box-shadow:10px 0 36px rgba(8,30,67,.05)!important;color:var(--val-ink)!important}
.val-nav-brand{height:96px!important;padding:18px 24px!important;border-bottom:1px solid rgba(16,45,91,.08)!important}
.val-nav-logo{max-width:112px!important;margin:auto!important;filter:drop-shadow(0 8px 15px rgba(8,30,67,.12))}
.val-nav-items{padding:10px 14px 18px!important;gap:5px!important}
.val-nav-group-label{padding:18px 10px 6px!important;color:#9B8E7B!important;font:800 10px var(--body)!important;text-transform:uppercase!important}
.val-nav-item{height:36px!important;margin:0!important;padding:0 12px!important;border:1px solid transparent!important;border-radius:8px!important;background:transparent!important;color:var(--val-ink)!important;font:800 13px var(--body)!important;transition:background .25s ease,border-color .25s ease,transform .25s ease,box-shadow .25s ease!important;position:relative!important}
.val-nav-item:before{content:"";position:absolute;left:0;top:8px;bottom:8px;width:3px;border-radius:999px;background:var(--val-gold);transform:scaleY(0);transform-origin:center;transition:transform .28s ease}
.val-nav-item:hover{background:rgba(248,232,190,.28)!important;border-color:rgba(200,155,60,.18)!important;transform:translateX(2px)}
.val-nav-item.active{background:rgba(248,232,190,.42)!important;border-color:rgba(200,155,60,.22)!important;box-shadow:none!important}
.val-nav-item.active:before{transform:scaleY(1)}
.val-nav-icon svg{stroke:var(--val-night)!important;fill:none!important}
.val-nav-badge{background:var(--val-night)!important;color:white!important}
.val-nav-foot{padding:18px 22px!important;border-top:1px solid var(--val-border)!important;color:var(--val-muted)!important}
.val-user-avatar{background:var(--val-glow)!important;color:var(--val-night)!important}
.topbar{height:64px!important;background:rgba(251,248,243,.84)!important;border-bottom:1px solid rgba(16,45,91,.08)!important;backdrop-filter:blur(16px)!important;color:var(--val-ink)!important}
.tb-logo{font:700 1.45rem var(--serif)!important;color:var(--val-night)!important}
.tbtn,.val-mobile-nav,.actor-btn,.mbtn-mode,.alert-btn,.val-ui-btn,.val-card-action,.val-card-action-btn,.email-actions button,.task-actions button,.relationship-actions button,.relationship-action-panel button,.exec-workspace-modal button:not(.exec-workspace-close):not(.val-card-link):not(.val-card-side-item){min-height:38px!important;border-radius:14px!important;border:1px solid rgba(8,30,67,.13)!important;background:#fff!important;color:var(--val-night)!important;font:850 12px var(--body)!important;text-transform:none!important;box-shadow:0 8px 22px rgba(8,30,67,.06)!important;transition:transform .25s ease,box-shadow .25s ease,background .25s ease,border-color .25s ease!important}
.alert-btn.primary,.val-ui-btn.primary,.val-card-action-btn.primary,.email-actions button.primary,.task-actions button.primary,.relationship-actions button.primary,.relationship-action-panel button.primary,.val-primary-action,.send-btn{background:linear-gradient(135deg,var(--val-night),var(--val-deep))!important;border-color:var(--val-night)!important;color:#fff!important;box-shadow:0 14px 28px rgba(8,30,67,.22)!important}
.tbtn:hover,.alert-btn:hover,.val-ui-btn:hover,.val-card-action:hover,.val-card-action-btn:hover,.email-actions button:hover,.exec-workspace-modal button:hover{transform:translateY(-1px)!important;box-shadow:0 16px 34px rgba(8,30,67,.12)!important;border-color:var(--val-border-gold)!important;background:#FFFCF5!important}
.body{grid-template-columns:minmax(0,1fr) 365px!important;background:var(--val-canvas)!important;max-height:none!important}
.center,.center-welcome,.center-detail,.cmd-area,.chat-scroll{background:var(--val-canvas)!important;color:var(--val-ink)!important}
.center-welcome.val-home{padding:22px 28px 112px!important}
.val-home-hero{max-width:1040px!important;margin:0 auto 14px!important}
.val-home-banner{height:88px!important;border-radius:0 0 10px 10px!important;background:linear-gradient(90deg,#fff 0%,#fff 40%,rgba(248,232,190,.68) 72%,rgba(200,155,60,.18)),radial-gradient(circle at 88% 50%,rgba(200,155,60,.48),transparent 20%),linear-gradient(135deg,#fff,#FBF8F3)!important;border:1px solid var(--val-border)!important;box-shadow:var(--val-shadow-soft)!important;position:relative!important;overflow:hidden}
.val-home-banner:before{content:"VAL";position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font:900 54px var(--body);color:var(--val-night);letter-spacing:.04em!important}
.val-home-banner:after{content:"VELOCITY  +  ALIGNMENT  +  LEVERAGE";position:absolute;left:58%;top:51%;transform:translateY(-50%);font:900 9px var(--body);color:var(--val-deep);opacity:.74;white-space:nowrap;border-left:1px solid rgba(200,155,60,.55);padding-left:28px}
.val-home-greeting{display:flex!important;align-items:flex-start!important;justify-content:space-between!important;gap:18px!important;margin:22px 4px 18px!important}
.val-home-greeting h1{font:600 2.35rem var(--serif)!important;line-height:1!important;color:var(--val-night)!important}
.val-home-greeting p{margin-top:8px!important;color:var(--val-deep)!important;font-size:.94rem!important}
.val-hero-note{color:var(--val-gold-deep)!important;font-size:.82rem!important}
.val-dashboard-grid{max-width:1040px!important;margin:0 auto!important;display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:16px!important}
.val-dash-card,.val-command-card,.exec-card,.val-detail-card,.val-review-card,.val-transcript-row,.email-card,.key-card,.task-card,.teach-val-stage,.teach-val-rail{background:rgba(255,255,255,.74)!important;border:1px solid var(--val-border)!important;border-radius:var(--val-radius-sm)!important;box-shadow:var(--val-shadow-soft)!important;color:var(--val-ink)!important;transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease,background .25s ease!important}
.val-dash-card{min-height:230px!important;padding:22px!important;overflow:hidden!important}
.val-dash-card:hover,.val-transcript-row:hover,.exec-card:hover{transform:translateY(-2px) scale(1.003)!important;box-shadow:var(--val-shadow-rise)!important;border-color:var(--val-border-gold)!important;background:#FFFDF8!important}
.val-dash-card.highest{background:radial-gradient(circle at 75% 76%,rgba(248,232,190,.96),rgba(248,232,190,.58) 30%,rgba(255,255,255,.74) 62%)!important;border-color:var(--val-border-gold)!important}
.val-card-title h2,.val-dash-card h2,.exec-card h3,.val-detail-card h3,.val-review-card h3{font-family:var(--serif)!important;color:var(--val-night)!important;font-weight:700!important}
.val-card-title h2{font-size:1.2rem!important}
.val-dash-card.highest h3{font:700 1.55rem var(--serif)!important;color:var(--val-night)!important}
.val-dash-card p,.exec-card p,.exec-card li,.val-detail-card p,.val-detail-card li,.val-review-card p{color:#31405B!important;line-height:1.58!important}
.val-card-symbol{width:22px!important;height:22px!important;border-radius:999px!important;background:#F5F7F1!important;border:1px solid rgba(16,45,91,.08)!important;color:var(--val-deep)!important;display:grid!important;place-items:center!important}
.val-card-symbol.gold{background:var(--val-glow)!important;color:var(--val-gold-deep)!important;border-color:var(--val-border-gold)!important}
.val-card-link{border:0!important;background:transparent!important;color:var(--val-deep)!important;font:850 11px var(--body)!important;padding:0!important;box-shadow:none!important}
.val-dash-row,.val-person-row,.val-project-row,.val-momentum-row,.val-ready-row{border:0!important;background:transparent!important;border-radius:12px!important;padding:9px!important;color:var(--val-ink)!important;transition:background .22s ease,transform .22s ease!important}
.val-dash-row:hover,.val-person-row:hover,.val-project-row:hover,.val-momentum-row:hover,.val-ready-row:hover{background:rgba(248,232,190,.28)!important;transform:translateX(3px)}
.val-row-icon,.val-project-icon,.val-person-avatar{background:var(--val-glow)!important;color:var(--val-night)!important;border-color:rgba(200,155,60,.24)!important}
.val-leverage-meta span strong{background:var(--val-olive)!important;color:var(--val-deep)!important;border-radius:999px!important;padding:4px 10px!important}
.rpanel{background:rgba(255,255,255,.55)!important;border-left:1px solid var(--val-border)!important;padding:14px!important}
.rpanel-head{background:transparent!important;border:0!important;padding:8px 8px 14px!important}
.rpanel-title{font:850 12px var(--body)!important;color:var(--val-gold-deep)!important;text-transform:uppercase!important}
.rpanel-link{color:var(--val-deep)!important}
.week-scroll{display:grid!important;gap:10px!important;padding:0 2px 18px!important}
.day-block{background:rgba(255,255,255,.72)!important;border:1px solid var(--val-border)!important;border-radius:16px!important;box-shadow:0 8px 24px rgba(8,30,67,.045)!important;overflow:hidden!important}
.day-block.today{background:#FFF8E8!important;border-color:var(--val-border-gold)!important}
.day-head{padding:12px 14px 8px!important;color:var(--val-night)!important;font-weight:850!important;text-transform:none!important}
.day-date-num{color:var(--val-gold-deep)!important}
.day-evt{margin:0 10px 8px!important;padding:10px 12px!important;border-radius:12px!important;background:linear-gradient(135deg,#FFF7E8,#F8F2E4)!important;border:1px solid rgba(200,155,60,.16)!important}
.day-evt:nth-child(3n){background:linear-gradient(135deg,#EEF7EF,#E6F0E0)!important}
.day-evt:nth-child(3n+1){background:linear-gradient(135deg,#EEF2FA,#E9EDF8)!important}
.day-evt:hover{transform:translateY(-1px)!important;box-shadow:0 12px 26px rgba(8,30,67,.09)!important}
.cmd-area{background:linear-gradient(180deg,rgba(246,242,234,0),var(--val-canvas) 36%)!important}
.cmd-box,.val-home-chat{border-radius:16px!important;background:rgba(255,255,255,.8)!important;border:1px solid var(--val-border)!important;box-shadow:var(--val-shadow-soft)!important}
.exec-workspace-overlay{background:rgba(8,30,67,.20)!important;backdrop-filter:blur(8px)!important;display:flex!important;justify-content:flex-end!important;align-items:stretch!important;padding:18px!important;animation:valFadeIn .22s ease both!important}
.exec-workspace-modal{width:min(575px,calc(100vw - 36px))!important;height:calc(100dvh - 36px)!important;margin-left:auto!important;background:var(--val-ivory)!important;border:1px solid rgba(200,155,60,.2)!important;border-radius:24px!important;box-shadow:-28px 0 80px rgba(8,30,67,.18)!important;color:var(--val-ink)!important;animation:valDrawerIn .28s cubic-bezier(.2,.8,.2,1) both!important}
.val-workspace-full .exec-workspace-modal{width:min(1180px,calc(100vw - 36px))!important;margin:auto!important}
.exec-workspace-head{height:78px!important;background:rgba(251,248,243,.92)!important;border-bottom:1px solid rgba(16,45,91,.08)!important;padding:0 24px!important}
.exec-workspace-kicker{font:850 11px var(--body)!important;color:var(--val-gold-deep)!important;text-transform:none!important}
.exec-workspace-title{font:700 1.65rem var(--serif)!important;color:var(--val-night)!important}
.exec-workspace-close{width:36px!important;height:36px!important;border-radius:12px!important;background:#fff!important;border:1px solid var(--val-border)!important;color:var(--val-night)!important;box-shadow:0 8px 22px rgba(8,30,67,.06)!important}
.exec-workspace-body{background:var(--val-ivory)!important;padding:22px!important}
.exec-workspace-footer{min-height:82px!important;background:rgba(251,248,243,.92)!important;border-top:1px solid rgba(16,45,91,.08)!important;padding:16px 22px!important}
.val-card-workspace{display:grid!important;grid-template-columns:106px minmax(0,1fr)!important;gap:18px!important;min-height:100%!important}
.val-card-side{background:rgba(255,255,255,.58)!important;border:1px solid var(--val-border)!important;border-radius:18px!important;padding:14px 10px!important}
.val-card-side-head{display:grid!important;gap:8px!important}
.val-card-side-head strong{font:850 11px var(--body)!important;color:var(--val-night)!important;text-transform:uppercase!important}
.val-card-side-head button{min-height:32px!important}
.val-card-side-item{width:100%!important;border:0!important;background:transparent!important;text-align:left!important;border-radius:12px!important;padding:10px!important;box-shadow:none!important}
.val-card-side-item strong{display:block!important;font-size:11px!important;color:var(--val-night)!important}
.val-card-side-item small{display:none!important}
.val-card-side-item.active{background:rgba(248,232,190,.44)!important}
.val-card-main{min-width:0!important}
.val-card-tabs{display:flex!important;gap:22px!important;border-bottom:1px solid rgba(16,45,91,.09)!important;margin:0 0 20px!important;padding-bottom:12px!important}
.val-card-tabs span{font:850 12px var(--body)!important;color:#4A5871!important;position:relative!important}
.val-card-tabs span.active{color:var(--val-night)!important}
.val-card-tabs span.active:after{content:"";position:absolute;left:0;right:0;bottom:-13px;height:2px;background:var(--val-gold)}
.val-card-callout{background:linear-gradient(135deg,#fff,#FFF7E8)!important;border:1px solid var(--val-border-gold)!important;border-radius:18px!important;padding:20px!important;margin-bottom:16px!important;box-shadow:var(--val-shadow-soft)!important}
.val-card-callout strong{font:750 1.2rem var(--serif)!important;color:var(--val-night)!important;display:block!important;margin-bottom:6px!important}
.val-card-decision-strip,.val-card-scoreboard{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important;margin:0 0 16px!important}
.val-card-decision-strip div,.val-card-scoreboard div{background:#fff!important;border:1px solid var(--val-border)!important;border-radius:14px!important;padding:12px!important}
.val-card-decision-strip span,.val-card-scoreboard span{display:block!important;font-size:11px!important;color:var(--val-muted)!important;margin-bottom:4px!important}
.val-card-decision-strip strong,.val-card-scoreboard strong{color:var(--val-night)!important}
.val-packet-decision-strip{grid-template-columns:repeat(2,minmax(0,1fr))!important}
.val-packet-decision-strip .val-packet-meaning,.val-packet-decision-strip .val-packet-why{grid-column:1 / -1!important}
.val-packet-decision-strip .val-packet-meaning strong,.val-packet-decision-strip .val-packet-why strong{line-height:1.45!important;font-weight:750!important}
.val-card-two-col{display:grid!important;grid-template-columns:1fr!important;gap:14px!important}
.val-card-action-grid{display:grid!important;grid-template-columns:1fr!important;gap:9px!important}
.relationship-dossier{gap:14px!important}
.relationship-dossier .relationship-profile-wide:first-child{background:linear-gradient(135deg,#fff,#fff8ec 62%,#f3f7ee)!important;border-color:var(--val-border-gold)!important}
.relationship-source-line{display:inline-flex!important;align-items:center!important;gap:8px!important;width:max-content!important;max-width:100%!important;margin-top:8px!important;padding:7px 10px!important;border:1px solid rgba(76,96,64,.16)!important;border-radius:999px!important;background:rgba(238,247,239,.64)!important;color:#40573B!important;font:800 11px var(--body)!important}
.relationship-action-group{display:grid!important;gap:8px!important;padding:12px!important;border:1px solid var(--val-border)!important;border-radius:14px!important;background:rgba(255,255,255,.7)!important;margin:0 0 10px!important}
.relationship-action-group>strong{font:850 11px var(--body)!important;color:var(--val-gold-deep)!important;text-transform:uppercase!important}
.relationship-action-group>div{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}
.relationship-action-group .val-card-action-btn{width:100%!important}
.relationship-receipt-grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important;margin-top:12px!important}
.relationship-receipt-grid article{background:rgba(238,247,239,.58)!important;border:1px solid rgba(76,96,64,.16)!important;border-radius:14px!important;padding:12px!important}
.relationship-receipt-grid span{display:block!important;color:#5f754f!important;font-size:11px!important;font-weight:850!important;text-transform:uppercase!important;margin-bottom:5px!important}
.intro-review-surface{display:grid!important;gap:12px!important;background:linear-gradient(135deg,#fffdf8,#eef7ef)!important;border:1px solid rgba(117,88,55,.18)!important;border-radius:18px!important;padding:16px!important}
.intro-review-section{display:grid!important;gap:8px!important;padding:12px!important;border:1px solid rgba(8,30,67,.1)!important;border-radius:14px!important;background:rgba(255,255,255,.72)!important}
.intro-review-section h5{margin:0!important;font:850 12px var(--body)!important;text-transform:uppercase!important;color:var(--val-gold-deep)!important}
.intro-review-card{display:grid!important;gap:7px!important;padding:12px!important;border:1px solid rgba(76,96,64,.14)!important;border-radius:14px!important;background:#fff!important}
.intro-review-card strong{font:750 1rem var(--serif)!important;color:var(--val-night)!important}
.intro-review-card small,.intro-review-boundary{color:#67594d!important;font-weight:750!important}
.intro-review-card>div{display:flex!important;gap:8px!important;flex-wrap:wrap!important}
.prepared-artifact-callout small{display:block!important;margin-top:8px!important;color:#6b5946!important;font-weight:700!important}
.val-prepared-sequence{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:8px!important;margin:0 0 16px!important}
.val-prepared-sequence span{background:#fff!important;border:1px solid var(--val-border)!important;border-radius:999px!important;padding:8px 10px!important;text-align:center!important;font-size:11px!important;font-weight:800!important;letter-spacing:.1em!important;text-transform:uppercase!important;color:var(--val-muted)!important}
.val-prepared-sequence span.active{background:#fff7e8!important;border-color:var(--val-border-gold)!important;color:var(--val-gold-deep)!important}
.prepared-preview pre{white-space:pre-wrap!important;word-break:break-word!important;background:#fffdf8!important;border:1px solid rgba(117,88,55,.18)!important;border-radius:12px!important;padding:14px!important;color:#1f2937!important;font:500 .92rem/1.55 var(--body)!important;max-height:360px!important;overflow:auto!important}
.prepared-artifact-layout .val-card-source-line{margin-top:10px!important}
.val-card-evidence-row{background:#fff!important;border:1px solid var(--val-border)!important;border-radius:14px!important;padding:10px!important;margin:8px 0!important}
.val-card-chat-panel{margin-top:14px!important}
#valCardChatLog,.val-chat-log{background:rgba(255,255,255,.7)!important;border:1px solid var(--val-border)!important;border-radius:16px!important;padding:12px!important}
.val-card-chat,.val-chat-msg{background:#fff!important;border:1px solid var(--val-border)!important;border-radius:14px!important;padding:10px 12px!important;color:var(--val-ink)!important}
.val-card-chat.user,.val-chat-msg.user{background:linear-gradient(135deg,var(--val-night),var(--val-deep))!important;color:#fff!important;margin-left:26px!important}
.val-card-packet-receipt{background:#fffdf8!important;border:1px solid var(--val-border-gold)!important;border-radius:16px!important;padding:14px!important;margin-top:10px!important;color:var(--val-ink)!important}
.val-card-packet-receipt h4{font:750 1.05rem var(--serif)!important;color:var(--val-night)!important;margin:0 0 8px!important}
.val-card-packet-receipt dl{display:grid!important;grid-template-columns:120px minmax(0,1fr)!important;gap:6px 10px!important;margin:10px 0!important}
.val-card-packet-receipt dt{font-size:11px!important;font-weight:850!important;letter-spacing:.1em!important;text-transform:uppercase!important;color:var(--val-muted)!important}
.val-card-packet-receipt dd{font-weight:700!important;color:#26344f!important;overflow-wrap:anywhere!important}
.val-packet-id{font:700 11px var(--mono,monospace)!important;color:#7A6D5C!important;letter-spacing:.02em!important;opacity:.82!important}
.val-card-packet-receipt dt.val-packet-receipt-meaning,.val-card-packet-receipt dt.val-packet-receipt-meaning+dd,.val-card-packet-receipt dt.val-packet-receipt-why,.val-card-packet-receipt dt.val-packet-receipt-why+dd{grid-column:1 / -1!important}
.val-card-packet-receipt dt.val-packet-receipt-meaning+dd,.val-card-packet-receipt dt.val-packet-receipt-why+dd{line-height:1.45!important;font-weight:750!important}
.val-card-packet-boundary{border-top:1px solid rgba(117,88,55,.14)!important;margin-top:10px!important;padding-top:10px!important;font-weight:750!important;color:#6b5946!important}
.val-card-packet-receipt button{margin-top:10px!important}
.val-card-packet-receipt .val-packet-gate-badge{margin:4px 0 8px!important}
.val-packet-timeline{display:grid!important;gap:12px!important}
.val-packet-stage{background:#fff!important;border:1px solid var(--val-border)!important;border-radius:16px!important;padding:14px!important}
.val-packet-stage.complete,.val-packet-stage.completed{border-color:rgba(26,122,74,.28)!important;background:#fbfff8!important}
.val-packet-stage.rejected,.val-packet-stage.failed{border-color:rgba(184,50,40,.28)!important;background:#fff8f7!important}
.val-packet-stage strong{display:block!important;color:var(--val-night)!important;font:800 .98rem var(--body)!important}
.val-packet-stage small{display:block!important;color:var(--val-muted)!important;margin-top:3px!important}
.val-packet-stage p{margin-top:8px!important}
.val-packet-payload pre{white-space:pre-wrap!important;word-break:break-word!important;background:#fffdf8!important;border:1px solid rgba(117,88,55,.18)!important;border-radius:12px!important;padding:14px!important;color:#1f2937!important;font:500 .88rem/1.55 var(--body)!important;max-height:420px!important;overflow:auto!important}
.val-packet-payload textarea{width:100%!important;min-height:220px!important;resize:vertical!important;background:#fff!important;border:1px solid rgba(117,88,55,.2)!important;border-radius:12px!important;padding:14px!important;color:#1f2937!important;font:500 .88rem/1.55 var(--mono)!important;margin-top:12px!important}
.val-packet-friendly-fields{display:grid!important;gap:10px!important;margin:12px 0!important}
.val-packet-friendly-fields label{display:grid!important;gap:6px!important;font-weight:850!important;color:var(--val-night)!important}
.val-packet-friendly-fields input,.val-packet-friendly-fields textarea{width:100%!important;background:#fff!important;border:1px solid rgba(117,88,55,.2)!important;border-radius:12px!important;padding:12px!important;color:#1f2937!important;font:500 .92rem/1.5 var(--body)!important;margin:0!important}
.val-packet-friendly-fields textarea{min-height:150px!important}
.val-packet-payload-grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important;margin-bottom:12px!important}
.val-packet-payload-grid div{background:#fff!important;border:1px solid var(--val-border)!important;border-radius:14px!important;padding:10px!important}
.val-packet-payload-grid span{display:block!important;color:var(--val-muted)!important;font-size:11px!important;font-weight:850!important;text-transform:uppercase!important;letter-spacing:.1em!important}
.val-packet-payload-grid strong{display:block!important;color:var(--val-night)!important;margin-top:4px!important;overflow-wrap:anywhere!important}
.val-packet-gate-badge{display:inline-flex!important;align-items:center!important;gap:8px!important;border:1px solid rgba(76,96,64,.22)!important;background:linear-gradient(135deg,rgba(238,247,239,.96),rgba(255,253,248,.94))!important;color:#40573B!important;border-radius:999px!important;padding:8px 12px!important;font:850 11px var(--body)!important;margin:2px 0 12px!important;box-shadow:0 8px 20px rgba(64,87,59,.07)!important}
.val-packet-gate-badge:before{content:"";width:8px;height:8px;border-radius:999px;background:#6E8B5F;box-shadow:0 0 0 4px rgba(110,139,95,.12)}
.val-packet-edit-status{display:block!important;margin-top:8px!important;color:#6b5946!important;font-weight:750!important}
.val-card-chip-row button,.val-chat-chips button{border-radius:999px!important;background:#fff!important;border:1px solid var(--val-border)!important;color:var(--val-deep)!important}
.val-card-chat-input input,.val-chat-input input{border-radius:14px!important;background:#fff!important;border:1px solid var(--val-border)!important}
.val-empty,.task-empty,.day-empty{background:linear-gradient(135deg,#fff,#FFFBF1)!important;border:1px solid var(--val-border-gold)!important;border-radius:18px!important;box-shadow:var(--val-shadow-soft)!important;color:#31405B!important}
.val-empty-state-scene{height:190px;border-radius:18px;background:linear-gradient(180deg,#FFF6DA,#FBF8F3 58%,#F6F2EA);border:1px solid var(--val-border-gold);box-shadow:inset 0 0 70px rgba(248,232,190,.72);position:relative;overflow:hidden;margin:0 0 16px}
.val-empty-sun{position:absolute;width:120px;height:120px;border-radius:999px;background:radial-gradient(circle,#F8E8BE,rgba(248,232,190,0));left:50%;top:28px;transform:translateX(-50%)}
.val-empty-hill{position:absolute;left:-10%;right:-10%;height:72px;bottom:38px;background:#D9D8C8;border-radius:50% 50% 0 0;opacity:.82}
.val-empty-hill.two{bottom:22px;background:#BFC6B0;left:24%;right:-18%;opacity:.7}
.val-empty-plant{position:absolute;left:50%;bottom:54px;width:42px;height:58px;transform:translateX(-50%)}
.val-empty-plant span{position:absolute;left:20px;bottom:0;width:3px;height:54px;background:#899B7E;border-radius:999px}
.val-empty-plant i,.val-empty-plant b{position:absolute;width:19px;height:11px;background:#9BAC8E;border-radius:100% 0 100% 0;transform:rotate(35deg)}
.val-empty-plant i{left:21px;top:17px}.val-empty-plant b{left:4px;top:29px;transform:rotate(205deg)}
.val-empty-mug{position:absolute;left:50%;bottom:18px;transform:translateX(-50%);width:78px;height:54px;border-radius:0 0 22px 22px;background:linear-gradient(135deg,#D5A755,#B88931);color:#fff;display:grid;place-items:center;font:700 18px var(--serif);box-shadow:0 18px 32px rgba(122,86,24,.18)}
.val-empty-mug:after{content:"";position:absolute;right:-18px;top:12px;width:24px;height:24px;border:7px solid #C79744;border-left:0;border-radius:0 18px 18px 0}
.val-stay-loop{background:linear-gradient(135deg,#fff,#FFF7E8)!important;border-color:var(--val-border-gold)!important}
.val-transcript-view{background:var(--val-canvas)!important;padding:28px!important}
.val-view-head h2{font:700 2rem var(--serif)!important;color:var(--val-night)!important}
.val-transcript-detail{grid-template-columns:minmax(0,1fr) minmax(300px,34%)!important;gap:16px!important}
@keyframes valDrawerIn{from{transform:translateX(28px);opacity:.75}to{transform:translateX(0);opacity:1}}
@keyframes valFadeIn{from{opacity:0}to{opacity:1}}
@media(max-width:1180px){.val-dashboard-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}.body{grid-template-columns:minmax(0,1fr) 320px!important}.app{grid-template-columns:220px minmax(0,1fr)!important}}
@media(max-width:900px){.app{grid-template-columns:1fr!important}.body{grid-template-columns:1fr!important}.rpanel{display:none!important}.val-dashboard-grid{grid-template-columns:1fr!important}.val-home-banner:after{display:none}.val-home-greeting{display:block!important}.exec-workspace-overlay{padding:0!important}.exec-workspace-modal{width:100vw!important;height:100dvh!important;border-radius:0!important}.val-card-workspace{grid-template-columns:1fr!important}.val-card-side{display:none!important}.val-transcript-detail{grid-template-columns:1fr!important}}
@media(min-width:901px){.app{display:grid!important;grid-template-columns:242px minmax(0,1fr)!important;grid-template-rows:64px minmax(0,1fr)!important}.topbar{grid-column:2!important;grid-row:1!important}.body{display:grid!important;grid-column:2!important;grid-row:2!important;grid-template-columns:minmax(0,1fr) 365px!important;height:calc(100dvh - 64px)!important;min-height:0!important}.center{min-width:0!important}.rpanel{display:flex!important;width:auto!important;min-width:0!important}.center-welcome.val-home{padding-top:18px!important}.val-home-banner{height:72px!important}.val-home-greeting{margin:14px 4px 14px!important}.val-home-greeting h1{font-size:2.05rem!important}.val-dashboard-grid{gap:12px!important}.val-dash-card{min-height:0!important;padding:18px!important}.val-dash-card h3{font-size:1.35rem!important}.val-dash-row,.val-person-row,.val-project-row,.val-momentum-row,.val-ready-row{padding:7px!important}.val-presence-actions{display:none!important}}
`;
  document.head.appendChild(style);
}
function setActive(view){document.querySelectorAll('.val-nav-item').forEach(function(el){el.classList.toggle('active',el.getAttribute('data-view')===view);});var nav=document.getElementById('valPrimaryNav');if(nav)nav.classList.remove('open');}
function closeTranscriptView(){var view=document.getElementById('valTranscriptView');if(view)view.classList.remove('open');document.body.classList.remove('val-transcripts-mode');transcriptState.active=null;}
window.commandCenterNavigate=function(view){
  if(view==='tasks'||view==='task_board'||view==='calendarized_tasks')view='commitments';
  setActive(view);closeTranscriptView();
  if(view==='dashboard'){call('closeDetail');buildCommandCenter();return;}
  if(view==='transcripts'){openTranscripts();return;}
  var routes={chat:'openGeneralChat',teach_val:'openTeachValOnboarding',relationships:'openRelationshipReview',projects:'openPriorityReview',evidence:'openTranscripts',calendar:'openCalendarFullView',documents:'openGeneralChat',reports:'openPriorityReview',meetings:'openMeetingBriefing',communications:'askComms',email_intelligence:'openEmailIntelligence',opportunities:'openOpportunityIntelligence',commitments:'openCommitmentsPage',tasks:'openCommitmentsPage',drafts:'openDraftsPage',intelligence:'openPriorityReview',leads_employers:'openLeadIntelligence',leads_partners:'openPartnerIntelligence',val_os:'openValOsPage',settings:'openKeysPanel',settings_api_keys:'openKeysPanel',settings_templates:'openTemplatesPage',settings_dashboard_studio:'openDashboardStudioPage',settings_security:'openSecurityPrivacyPage'};
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
function micheleBookHomeHtml(){
  var project=(window.VAL_CONFIG&&VAL_CONFIG.projectName)||'The Big Trick';
  return '<section class="michele-home-hero" aria-label="Michele book home">'
    +'<div class="michele-home-copy"><div class="michele-home-kicker">Michele VAL</div><h1>Michele, your brave beautiful book is waiting.</h1><p class="michele-home-love">Jessa loves you deeply, believes in every page of this becoming, and wanted this space to feel like walking into encouragement before the work begins.</p><p class="michele-home-sub">VAL will hold the manuscript, the prior notes, the emotional thread, the humor, and the next clean step so you can simply return to the story.</p></div>'
    +'<article class="michele-continue-card">'
      +'<div class="michele-cover-frame"><img src="/assets/michele-big-trick-cover.png" alt="'+safe(project)+' book cover"></div>'
      +'<div class="michele-continue-copy"><div class="val-card-kicker">Start here</div><h2>Continue My Book</h2><p>Open the companion, choose where you want to begin, and let VAL help you keep the voice, courage, humor, and heart intact.</p><ul><li>Find where you left off</li><li>Ask one gentle question</li><li>Protect the original manuscript</li><li>Save each approved revision safely</li></ul><button class="michele-continue-btn" onclick="openMicheleBookCompanion()">Continue My Book</button></div>'
    +'</article>'
  +'</section>';
}
function pct(value){return Math.round(Number(value||0)*100)+'%';}
function moveLine(move){return '<div class="eb-move-line"><strong>'+safe(move.title||'Agency move')+'</strong><span>'+safe(move.why||move.whatChanged||'VAL noticed this may matter.')+'</span><em>'+pct(move.confidence)+'</em></div>';}
function timeOfDayInfo(){
  var h=new Date().getHours();
  if(h<12)return{key:'morning',greeting:'Good morning',note:'You have got this.'};
  if(h<17)return{key:'afternoon',greeting:'Good afternoon',note:'Steady momentum.'};
  if(h<21)return{key:'evening',greeting:'Good evening',note:'Bring the day home.'};
  return{key:'night',greeting:'Good evening',note:'Quiet clarity.'};
}
function dailyWitnessGreetingHtml(brief,tod,dashboardOverride){
  var witness=brief&&brief.dailyWitness||{},lines=Array.isArray(witness.greeting_lines)?witness.greeting_lines.filter(Boolean):[];
  if(!lines.length&&witness.display_greeting)lines=String(witness.display_greeting).split(/\n+/).map(function(x){return x.trim();}).filter(Boolean);
  var title=lines.shift()||(tod.greeting+', '+clientFirstName()+'.');
  var copy=lines.length?lines.map(safe).join('<br>'):safe(witness.permission_line||((brief.todayTheme&&brief.todayTheme.why)||dashboardOverride.heroSubtitle||'I’ve been paying attention. Here’s what matters today.'));
  var note=witness.permission_line||tod.note;
  return '<div class="val-home-greeting"><div><h1>'+safe(title)+'</h1><p>'+copy+'</p></div><div class="val-hero-note">'+safe(note)+' <span>♡</span></div></div>';
}
function lineIcon(type){
  var map={risk:'!',opportunity:'↗',decision:'✓',relationship:'↗',relationship_signal:'↗',emotional_context:'•',deadline:'□',question:'?',promise:'✓',commitment:'✓',task:'✓',default:'•'};
  return map[type]||map.default;
}
function compactText(value,fallback){return safe(String(value||fallback||'').replace(/\s+/g,' ').trim());}
function displayMoveTitle(value,fallback){
  var text=String(value||fallback||'').replace(/\s+/g,' ').trim();
  var m=text.match(/^draft\s+reply\s*:\s*(.+)$/i);
  if(m)return 'Reply for '+m[1];
  m=text.match(/^close\s+loop\s*:\s*(.+)$/i);
  if(m)return 'Close the loop with '+m[1];
  m=text.match(/^review\s*:\s*(.+)$/i);
  if(m)return 'Review '+m[1];
  m=text.match(/^answer\s+question\s*:\s*(.+)$/i);
  if(m)return m[1];
  return text;
}
function firstMoveTitle(move,fallback){return compactText(displayMoveTitle(move&&move.title,fallback));}
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
function homeEmptyCard(type,message){
  var labels={
    what_changed:'I am watching quietly.',
    people:'No relationship needs pressure.',
    projects:'No project is asking for intervention.',
    momentum:'Quiet patterns are still patterns.',
    ready_for_you:'Nothing is waiting on you.'
  };
  var cls='home-empty '+safe(type||'default');
  return '<div class="val-card-empty '+cls+'"><div class="val-home-empty-art" aria-hidden="true"><span class="sun"></span><span class="hill one"></span><span class="hill two"></span><span class="sprout"><i></i><b></b></span></div><strong>'+safe(labels[type]||'Nothing needs your attention yet.')+'</strong><span>'+safe(message)+'</span></div>';
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
function packetStatusLabel(status){
  status=String(status||'unknown').toLowerCase();
  var map={
    pending:'Waiting for review',
    planned:'Planned for review',
    draft:'Drafted for review',
    ready:'Ready for review',
    approved:'Approved for review; not executed',
    approved_local_only:'Approved for review; not executed',
    rejected:'Declined; not executed',
    edited:'Refined; not executed',
    needs_edit:'Needs refinement',
    executed:'Executed',
    reconciled:'Reconciled with provider',
    failed:'Execution failed; receipt saved',
    waiting:'Waiting'
  };
  return map[status]||actionLabel(status);
}
function packetStatusMeaning(status,label){
  status=String(status||'unknown').toLowerCase();
  label=label||'packet';
  var map={
    pending:'This '+label.toLowerCase()+' is waiting for your judgment before anything moves forward.',
    planned:'VAL has prepared the packet, but it is still only a review item.',
    draft:'VAL has drafted the packet for review. Nothing has left VAL.',
    ready:'This '+label.toLowerCase()+' is ready for review. Execution is still gated.',
    approved:'Your approval is recorded, but the external action has not run.',
    approved_local_only:'Your approval is recorded, but the external action has not run.',
    rejected:'This packet was declined. VAL will not execute it.',
    edited:'Your refinements were saved to the packet. Execution is still gated.',
    needs_edit:'This packet needs refinement before it can move forward.',
    executed:'The external action ran. Review the provider receipt before relying on it.',
    reconciled:'VAL reconciled the provider receipt back to this packet.',
    failed:'The execution attempt failed safely and VAL saved a receipt.',
    waiting:'This packet is waiting. No external action is running.'
  };
  return map[status]||'VAL recorded this packet state. Review the receipt trail before taking external action.';
}
function actionClass(action){
  return /approve|do_it_now|create|draft|send|schedule|follow_up/.test(String(action))?'primary':'';
}
function itemMetadata(item){
  return (item&&item.metadataJson)||(item&&item.metadata)||(item&&item.readinessJson)||{};
}
function preparedArtifactKind(item){
  var metadata=itemMetadata(item),artifact=(item&&item.preparedArtifact)||(item&&item.prepared_artifact)||metadata.preparedArtifact||metadata.prepared_artifact||{};
  return String((item&&item.preparedArtifactKind)||(item&&item.prepared_artifact_kind)||artifact.kind||metadata.preparedArtifactKind||metadata.prepared_artifact_kind||'').replace(/\s+/g,' ').trim().toLowerCase();
}
function preparedArtifactPayload(item){
  var metadata=itemMetadata(item);
  return (item&&item.preparedArtifact)||(item&&item.prepared_artifact)||metadata.preparedArtifact||metadata.prepared_artifact||{};
}
function preparedArtifactCopy(item){
  var kind=preparedArtifactKind(item),artifact=preparedArtifactPayload(item),title=item&&item.title||artifact.title||artifact.subject||'Prepared work';
  var map={
    proposal_draft:{label:'Proposal draft',prepared:'VAL prepared a proposal draft from the conversation.',meaning:'The proposal is ready to review before anything moves into CRM.',primary:'Review proposal draft',approve:'Approve for CRM proposal workspace',edit:'Refine proposal',actionHeading:'Proposal Review',approvalMeaning:'Approval records this exact proposal packet as ready for the CRM proposal workspace. Execution still stays behind the external-action gate.',never:'Nothing has been sent or moved in CRM.'},
    html_page_draft:{label:'Page draft',prepared:'VAL prepared an HTML page draft from the conversation.',meaning:'The page is ready to inspect before anything is published.',primary:'Review page draft',approve:'Approve for publishing queue',edit:'Refine page',actionHeading:'Page Review',approvalMeaning:'Approval records this exact page packet as ready for the publishing workflow. It does not publish the page.',never:'Nothing has been published.'},
    calendar_invite_draft:{label:'Calendar invitation',prepared:'VAL prepared a calendar invitation draft.',meaning:'The invite is ready to review before anything appears on a calendar.',primary:'Review appointment details',approve:'Approve calendar invitation',edit:'Refine appointment',actionHeading:'Appointment Review',approvalMeaning:'Approval records this exact calendar packet as ready for scheduling. It does not create or change a calendar event.',never:'No calendar event has been created or changed.'},
    introduction_email_draft:{label:'Introduction draft',prepared:'VAL prepared an introduction email using CRM-safe relationship context.',meaning:'The relationship IDs are attached, and nothing has been sent.',primary:'Review introduction draft',approve:'Approve introduction draft',edit:'Refine introduction',actionHeading:'Introduction Review',approvalMeaning:'Approval records this exact introduction packet as ready for the email execution gate. It does not send or expose recipients.',never:'No email has been sent and no recipient has been exposed.'},
    email_draft:{label:'Email draft',prepared:'VAL prepared an email draft from the conversation.',meaning:'The email is ready to review before anything is sent.',primary:'Review email draft',approve:'Approve email draft',edit:'Refine email',actionHeading:'Email Review',approvalMeaning:'Approval records this exact email packet as ready for the email execution gate. It does not send the email.',never:'No email has been sent.'}
  };
  var copy=map[kind]||{label:'Prepared work',prepared:'VAL prepared this for review.',meaning:'It is waiting for human judgment before anything moves forward.',primary:'Review prepared work',approve:'Approve packet',edit:'Refine packet',actionHeading:'Packet Review',approvalMeaning:'Approval records this exact packet for the next review gate. It does not take external action.',never:'No external action has been taken.'};
  copy.title=title;
  copy.kind=kind||'prepared_work';
  copy.artifact=artifact;
  return copy;
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
  return '<section class="exec-card val-card-chat-panel"><h3>Co-Work with VAL</h3><div id="valCardChatLog"><div class="val-card-chat">'+safe(spec.intro)+' What would you like to do next?</div></div><div class="val-card-chip-row">'+chips.map(function(ch){return '<button onclick="homepageCardAsk(\''+jsString(type)+'\',\''+jsString(activeId)+'\',\''+jsString(ch.prompt)+'\')">'+safe(ch.label)+'</button>';}).join('')+'</div><div class="val-card-chat-input"><input id="valCardChatInput" placeholder="Ask VAL about this card..." onkeydown="if(event.key===\'Enter\')homepageCardAsk(\''+jsString(type)+'\',\''+jsString(activeId)+'\')"><button onclick="homepageCardAsk(\''+jsString(type)+'\',\''+jsString(activeId)+'\')">Send</button></div></section>';
}
function preparedArtifactWorkspaceHtml(type,item,activeId){
  var copy=preparedArtifactCopy(item),artifact=copy.artifact||{},recipients=artifact.recipients||artifact.to||[],evidence=artifact.evidence||item.evidence||[];
  var preview=artifact.body||artifact.html||artifact.content||artifact.description||item.preview||item.summary||'The prepared artifact body is stored with the review item when available.';
  var destination=artifact.destination||artifact.destinationLabel||artifact.target||((item.target&&item.target.name)||'Review surface');
  var chips=[
    {label:'Why prepared?',prompt:'Explain why VAL prepared this artifact and what evidence supports it.'},
    {label:'Review tone',prompt:'Review the artifact for accuracy, tone, and relationship fit.'},
    {label:'What happens next?',prompt:'Explain exactly what approval would and would not do.'}
  ];
  function peopleList(list){
    return Array.isArray(list)&&list.length?'<ul>'+list.slice(0,6).map(function(p){return '<li>'+safe([p.name||p.email||p.contactId||p.id,p.company,p.role].filter(Boolean).join(' · '))+'</li>';}).join('')+'</ul>':'<p>No recipient list is displayed yet. VAL should keep this review-only until identity is explicit.</p>';
  }
  function evidenceList(list){
    return Array.isArray(list)&&list.length?'<ul>'+list.slice(0,6).map(function(e){return '<li>'+safe(e.summary||e.title||e.quote||e.id||e)+'</li>';}).join('')+'</ul>':'<p>Evidence is attached through the source record when available.</p>';
  }
  return '<section class="val-card-callout ready-mode prepared-artifact-callout"><strong>'+safe(copy.label+': '+copy.title)+'</strong><p>'+safe(copy.meaning)+'</p><small>'+safe(copy.never)+'</small></section>'
    +'<div class="val-prepared-sequence"><span class="active">Meaning</span><span>Evidence</span><span>Recommendation</span><span>Action</span></div>'
    +'<div class="val-card-two-col prepared-artifact-layout"><section class="exec-card"><h3>What VAL Prepared</h3><p>'+safe(copy.prepared)+'</p><div class="val-card-source-line"><strong>'+safe(copy.kind.replace(/_/g,' '))+'</strong><span>'+safe(destination)+'</span></div></section><section class="exec-card"><h3>Why It Matters</h3><p>'+safe(item.reason_it_matters||item.summary||copy.meaning)+'</p><p><strong>Trust boundary:</strong> '+safe(copy.never)+'</p></section></div>'
    +'<section class="exec-card prepared-preview"><h3>Prepared Preview</h3><pre>'+safe(preview)+'</pre></section>'
    +'<div class="val-card-two-col prepared-artifact-layout"><section class="exec-card"><h3>People and Destination</h3>'+peopleList(recipients)+'<div class="val-card-source-line"><strong>Destination</strong><span>'+safe(destination)+'</span></div></section><section class="exec-card"><h3>Evidence Behind It</h3>'+evidenceList(evidence)+'</section></div>'
    +'<section class="exec-card"><h3>'+safe(copy.actionHeading||'Packet Review')+'</h3><p>'+safe(copy.approvalMeaning||copy.never)+'</p><div class="val-card-action-grid"><button class="val-card-action-btn primary" onclick="homepageCardAction(\''+jsString(type)+'\',\''+jsString(activeId)+'\',\'review_prepared_work\')">'+safe(copy.primary)+'</button><button class="val-card-action-btn" onclick="homepageCardAction(\''+jsString(type)+'\',\''+jsString(activeId)+'\',\'edit_before_approving\')">'+safe(copy.edit)+'</button><button class="val-card-action-btn" onclick="homepageCardAction(\''+jsString(type)+'\',\''+jsString(activeId)+'\',\'approve\')">'+safe(copy.approve)+'</button><button class="val-card-action-btn" onclick="homepageCardAction(\''+jsString(type)+'\',\''+jsString(activeId)+'\',\'reject\')">Decline</button><button class="val-card-action-btn" onclick="homepageCardAction(\''+jsString(type)+'\',\''+jsString(activeId)+'\',\'teach_val\')">Teach VAL</button></div></section>'
    +cardChatPanel(type,item,activeId,chips);
}
function readyWorkspaceHtml(type,item,activeId){
  if(preparedArtifactKind(item))return preparedArtifactWorkspaceHtml(type,item,activeId);
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
  var dossier=item.relationshipDossier||item.relationship_dossier||null;
  var chips=[
    {label:'Why this person?',prompt:'Explain why this person is showing up and what needs attention.'},
    {label:'Open loops',prompt:'Summarize the open loops for this relationship.'},
    {label:'Draft follow-up',prompt:'Help me draft the best follow-up for this person.'}
  ];
  function miniList(items,empty){return (items&&items.length)?'<ul>'+items.slice(0,5).map(function(x){return '<li>'+safe(x.content||x.summary||x)+'</li>';}).join('')+'</ul>':'<p>'+safe(empty)+'</p>';}
  if(dossier)return relationshipDossierHtml(dossier)+cardChatPanel(type,item,activeId,chips);
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
function externalPacketArtifactLabel(packet){
  packet=packet||{};
  var payload=packet.payloadPreviewJson||packet.payload_preview_json||{},actionType=packet.actionType||packet.action_type||'',why=packet.whyThisActionExists||packet.why_this_action_exists||'';
  if(payload.proposalDraft)return 'Proposal packet';
  if(payload.calendarInviteDraft)return 'Calendar invitation packet';
  if(payload.htmlDraft||payload.filename)return 'Page packet';
  if(payload.subject||payload.bodyPreview||payload.recipients)return /introduction/i.test(String(actionType)+' '+why)?'Introduction packet':'Email packet';
  return 'Prepared-work packet';
}
function packetReceiptHtml(data){
  var packet=data&&data.packet||{},status=packet.status||data.status||'recorded';
  var actionType=packet.actionType||packet.action_type||'prepared work';
  var targetSystem=packet.targetSystem||packet.target_system||'VAL';
  var packetId=packet.id||data.packet_id||'packet pending';
  var willNot=packet.whatWillNotHappen||packet.what_will_not_happen||'No external action was taken.';
  var why=packet.whyThisActionExists||packet.why_this_action_exists||data.message||'VAL recorded this review decision.';
  var receiptLabel=externalPacketArtifactLabel(packet);
  return '<div class="val-card-packet-receipt"><h4>'+safe(receiptLabel)+' recorded</h4><div class="val-packet-gate-badge">Execution remains gated</div><p>'+safe(data.message||'VAL recorded this exact '+receiptLabel.toLowerCase()+'.')+'</p><dl><dt>Packet</dt><dd class="val-packet-id">'+safe(packetId)+'</dd><dt>Type</dt><dd>'+safe(receiptLabel)+'</dd><dt>Status</dt><dd>'+safe(packetStatusLabel(status))+'</dd><dt class="val-packet-receipt-meaning">Meaning</dt><dd>'+safe(packetStatusMeaning(status,receiptLabel))+'</dd><dt>Action</dt><dd>'+safe(actionLabel(actionType))+'</dd><dt>System</dt><dd>'+safe(targetSystem)+'</dd><dt class="val-packet-receipt-why">Why</dt><dd>'+safe(why)+'</dd></dl><div class="val-card-packet-boundary">'+safe(willNot)+'</div><button class="val-card-action-btn" onclick="openExternalActionPacketTimeline(\''+jsString(packetId)+'\',\''+jsString(receiptLabel)+'\')">Open receipt trail</button></div>';
}
function packetPayloadPreviewHtml(packet){
  var payload=packet.payloadPreviewJson||packet.payload_preview_json||{},actionType=packet.actionType||packet.action_type||'prepared action';
  function jsonBlock(value){try{return JSON.stringify(value||{},null,2);}catch(_){return String(value||'');}}
  function recipientsText(list){
    return Array.isArray(list)&&list.length?list.map(function(p){return p.email||p.contactId||p.name||p.id||JSON.stringify(p);}).join(', '):'';
  }
  function inviteAttendeesText(invite){
    var list=invite&&Array.isArray(invite.attendees)?invite.attendees:(invite&&Array.isArray(invite.recipients)?invite.recipients:[]);
    return recipientsText(list);
  }
  function peopleList(list){
    return Array.isArray(list)&&list.length?list.map(function(p){return p.name||p.email||p.contactId||p.id||JSON.stringify(p);}).join(', '):'None shown';
  }
  var preview='',summary=[
    ['Action',actionLabel(actionType)],
    ['Target',packet.targetId||packet.target_id||'Not specified'],
    ['System',packet.targetSystem||packet.target_system||'VAL'],
    ['Execution',packet.status==='executed'?'Executed':'Not executed from this review']
  ];
  if(payload.proposalDraft){
    preview=jsonBlock(payload.proposalDraft);
    summary.push(['Preview type','Proposal draft']);
  }else if(payload.htmlDraft||payload.filename){
    preview=payload.htmlDraft||jsonBlock(payload);
    summary.push(['Preview type','HTML page draft']);
    if(payload.filename)summary.push(['File',payload.filename]);
  }else if(payload.calendarInviteDraft){
    preview=jsonBlock(payload.calendarInviteDraft);
    summary.push(['Preview type','Calendar invite draft']);
  }else if(payload.subject||payload.bodyPreview||payload.recipients){
    preview=['Subject: '+(payload.subject||'(no subject)'),payload.bodyPreview||'(body stored in packet preview)',payload.recipients?'Recipients: '+peopleList(payload.recipients):''].filter(function(x){return x!=='';}).join('\n\n');
    summary.push(['Preview type','Email draft']);
    summary.push(['Recipients',peopleList(payload.recipients)]);
  }else{
    preview=jsonBlock(payload);
    summary.push(['Preview type','Packet payload']);
  }
  var packetId=packet.id||packet.packet_id||'';
  var payloadJson=jsonBlock(payload);
  var friendly='';
  if(payload.subject||payload.bodyPreview||payload.recipients){
    friendly='<div class="val-packet-friendly-fields" data-packet-friendly-fields="'+safe(packetId)+'"><label>Subject<input id="packetSubject-'+safe(packetId)+'" value="'+safe(payload.subject||'')+'"></label><label>Body<textarea id="packetBody-'+safe(packetId)+'">'+safe(payload.bodyPreview||'')+'</textarea></label><label>Recipients<input id="packetRecipients-'+safe(packetId)+'" value="'+safe(recipientsText(payload.recipients))+'" placeholder="email or CRM contact IDs, comma separated"></label></div>';
  }else if(payload.calendarInviteDraft){
    var invite=payload.calendarInviteDraft||{};
    friendly='<div class="val-packet-friendly-fields" data-packet-friendly-fields="'+safe(packetId)+'"><label>Meeting title<input id="packetCalendarTitle-'+safe(packetId)+'" value="'+safe(invite.title||invite.summary||'')+'"></label><label>Proposed time<input id="packetCalendarTime-'+safe(packetId)+'" value="'+safe(invite.proposedTime||invite.startTime||invite.start||'')+'" placeholder="Date/time or scheduling note"></label><label>Attendees<input id="packetCalendarAttendees-'+safe(packetId)+'" value="'+safe(inviteAttendeesText(invite))+'" placeholder="email or CRM contact IDs, comma separated"></label><label>Notes / message<textarea id="packetCalendarNotes-'+safe(packetId)+'">'+safe(invite.notes||invite.message||invite.description||'')+'</textarea></label></div>';
  }else if(payload.proposalDraft){
    var proposal=payload.proposalDraft||{};
    friendly='<div class="val-packet-friendly-fields" data-packet-friendly-fields="'+safe(packetId)+'"><label>Proposal title<input id="packetProposalTitle-'+safe(packetId)+'" value="'+safe(proposal.title||proposal.name||payload.proposalTitle||'')+'"></label><label>Recipient / company<input id="packetProposalRecipient-'+safe(packetId)+'" value="'+safe(proposal.recipient||proposal.company||proposal.client||proposal.target||payload.target||'')+'"></label><label>Scope summary<textarea id="packetProposalScope-'+safe(packetId)+'">'+safe(proposal.scope||proposal.summary||proposal.description||payload.scope||'')+'</textarea></label><label>Investment / pricing note<textarea id="packetProposalInvestment-'+safe(packetId)+'">'+safe(proposal.investmentNote||proposal.investment||proposal.pricing||proposal.price||payload.investmentNote||'')+'</textarea></label><label>Proposal body<textarea id="packetProposalBody-'+safe(packetId)+'">'+safe(proposal.body||proposal.content||proposal.proposalBody||payload.proposalBody||'')+'</textarea></label></div>';
  }else if(payload.htmlDraft||payload.filename){
    friendly='<div class="val-packet-friendly-fields" data-packet-friendly-fields="'+safe(packetId)+'"><label>Filename<input id="packetPageFilename-'+safe(packetId)+'" value="'+safe(payload.filename||'')+'"></label><label>Page title / heading<input id="packetPageTitle-'+safe(packetId)+'" value="'+safe(payload.pageTitle||payload.title||'')+'"></label><label>Publish destination<input id="packetPageDestination-'+safe(packetId)+'" value="'+safe(payload.destination||payload.publishDestination||'')+'" placeholder="Where this page should eventually live"></label><label>HTML / body content<textarea id="packetPageHtml-'+safe(packetId)+'">'+safe(payload.htmlDraft||'')+'</textarea></label></div>';
  }
  return '<section class="exec-card val-packet-payload"><h3>Packet Contents</h3><div class="val-packet-gate-badge">Execution remains gated</div><div class="val-packet-payload-grid">'+summary.map(function(row){return '<div><span>'+safe(row[0])+'</span><strong>'+safe(row[1])+'</strong></div>';}).join('')+'</div><pre>'+safe(preview||'No packet contents are stored for this receipt yet.')+'</pre><h3>Refine Exact Packet</h3><p>Edits save to this packet only. No external action is taken.</p>'+friendly+'<textarea id="packetPayloadEdit-'+safe(packetId)+'" aria-label="Edit exact packet JSON">'+safe(payloadJson)+'</textarea><button class="val-card-action-btn primary" onclick="saveExternalActionPacketPayload(\''+jsString(packetId)+'\')">Save packet changes</button><span id="packetPayloadStatus-'+safe(packetId)+'" class="val-packet-edit-status">Ready to refine this packet. Execution remains gated.</span></section>';
}
function externalPacketTimelineHtml(detail){
  var packet=detail&&detail.packet||{},packetLabel=externalPacketArtifactLabel(packet),defaultTimeline=[
    {stage:'planned',status:'waiting',summary:packetLabel+' planned as a one-action review item.'},
    {stage:'approved',status:'waiting',summary:packetLabel+' approval is recorded only when the user approves this exact packet.'},
    {stage:'executed',status:'waiting',summary:packetLabel+' execution remains separate from review and requires the execution gate.'},
    {stage:'reconciled',status:'waiting',summary:packetLabel+' reconciliation will confirm what the provider actually did.'}
  ],timeline=Array.isArray(detail&&detail.timeline)&&detail.timeline.length?detail.timeline:defaultTimeline,approval=detail&&detail.approval_state||{},retry=detail&&detail.retry_eligibility||{};
  var stages=timeline.length?timeline.map(function(stage){
    var status=String(stage.status||'waiting').toLowerCase();
    return '<article class="val-packet-stage '+safe(status)+'"><strong>'+safe(actionLabel(stage.stage||'stage'))+' · '+safe(packetStatusLabel(status))+'</strong><small>'+safe(stage.at||'Not recorded yet')+'</small><p>'+safe(stage.summary||'No detail recorded for this stage yet.')+'</p></article>';
  }).join(''):'<div class="val-card-empty">No receipt trail stages are available yet.</div>';
  return '<section class="val-card-callout ready-mode"><strong>'+safe(packetLabel)+' receipt trail</strong><div class="val-packet-gate-badge">Execution remains gated</div><p>'+safe(packet.whyThisActionExists||packet.why_this_action_exists||'VAL prepared this packet for review.')+'</p></section>'
    +'<div class="val-card-decision-strip val-packet-decision-strip"><div><span>Packet</span><strong class="val-packet-id">'+safe(packet.id||'Unknown')+'</strong></div><div><span>Type</span><strong>'+safe(packetLabel)+'</strong></div><div><span>Status</span><strong>'+safe(packetStatusLabel(packet.status||'unknown'))+'</strong></div><div class="val-packet-meaning"><span>Meaning</span><strong>'+safe(packetStatusMeaning(packet.status||'unknown',packetLabel))+'</strong></div><div class="val-packet-why"><span>Why</span><strong>'+safe(packet.whyThisActionExists||packet.why_this_action_exists||'VAL prepared this packet for review.')+'</strong></div><div><span>Action</span><strong>'+safe(actionLabel(packet.actionType||packet.action_type||'action'))+'</strong></div><div><span>Approval</span><strong>'+safe(packetStatusLabel(approval.status||packet.approvalPolicy||packet.approval_policy||'required'))+'</strong></div></div>'
    +packetPayloadPreviewHtml(packet)
    +'<section class="exec-card"><h3>Receipt Trail</h3><div class="val-packet-timeline">'+stages+'</div></section>'
    +'<section class="exec-card"><h3>Trust Boundary</h3><p>'+safe(packet.whatWillNotHappen||packet.what_will_not_happen||'No external action has been taken from this review.')+'</p><p><strong>Retry:</strong> '+safe(retry.what_user_can_do_next||retry.why_retry_is_blocked||'Retry information is available after execution is attempted.')+'</p></section>';
}
window.openExternalActionPacketTimeline=function(packetId,packetLabel){
  if(!packetId||packetId==='packet pending')return;
  if(typeof openExecutiveWorkspace==='function')openExecutiveWorkspace({
    id:'externalPacketTimelineWorkspace',
    title:packetLabel?packetLabel+' receipt trail':'Receipt Trail',
    kicker:'Execution gated',
    mode:'drawer',
    body:'<div class="exec-card"><h3>Opening receipt trail...</h3><p>VAL is reading the receipt and audit trail. No external action is being taken.</p></div>',
    footer:'<button class="alert-btn" onclick="closeExecutiveWorkspace(\'externalPacketTimelineWorkspace\')">Close</button>'
  });
  var body=document.querySelector('#externalPacketTimelineWorkspace .exec-workspace-body');
  apiFetch((window.PROXY||'')+'/api/val/external-actions/'+encodeURIComponent(packetId)+'/detail').then(function(detail){
    if(body)body.innerHTML=externalPacketTimelineHtml(detail);
  }).catch(function(e){
    if(body)body.innerHTML='<div class="exec-card"><h3>Receipt trail unavailable</h3><p>'+safe(e.message||e)+'</p><p>No external action was taken while trying to load this receipt.</p></div>';
  });
};
window.saveExternalActionPacketPayload=function(packetId){
  var textarea=document.getElementById('packetPayloadEdit-'+packetId),status=document.getElementById('packetPayloadStatus-'+packetId);
  if(!textarea)return;
  var payload;
  try{payload=JSON.parse(textarea.value||'{}');}
  catch(e){if(status)status.textContent='Packet details must be valid JSON before VAL can save them.';return;}
  var subject=document.getElementById('packetSubject-'+packetId),body=document.getElementById('packetBody-'+packetId),recipients=document.getElementById('packetRecipients-'+packetId);
  if(subject||body||recipients){
    if(subject)payload.subject=subject.value.trim();
    if(body)payload.bodyPreview=body.value.trim();
    if(recipients)payload.recipients=recipients.value.split(',').map(function(value){value=value.trim();if(!value)return null;return /@/.test(value)?{email:value}:{contactId:value};}).filter(Boolean);
    textarea.value=JSON.stringify(payload,null,2);
  }
  var calTitle=document.getElementById('packetCalendarTitle-'+packetId),calTime=document.getElementById('packetCalendarTime-'+packetId),calAttendees=document.getElementById('packetCalendarAttendees-'+packetId),calNotes=document.getElementById('packetCalendarNotes-'+packetId);
  if(calTitle||calTime||calAttendees||calNotes){
    payload.calendarInviteDraft=payload.calendarInviteDraft||{};
    if(calTitle)payload.calendarInviteDraft.title=calTitle.value.trim();
    if(calTime)payload.calendarInviteDraft.proposedTime=calTime.value.trim();
    if(calAttendees)payload.calendarInviteDraft.attendees=calAttendees.value.split(',').map(function(value){value=value.trim();if(!value)return null;return /@/.test(value)?{email:value}:{contactId:value};}).filter(Boolean);
    if(calNotes)payload.calendarInviteDraft.notes=calNotes.value.trim();
    textarea.value=JSON.stringify(payload,null,2);
  }
  var proposalTitle=document.getElementById('packetProposalTitle-'+packetId),proposalRecipient=document.getElementById('packetProposalRecipient-'+packetId),proposalScope=document.getElementById('packetProposalScope-'+packetId),proposalInvestment=document.getElementById('packetProposalInvestment-'+packetId),proposalBody=document.getElementById('packetProposalBody-'+packetId);
  if(proposalTitle||proposalRecipient||proposalScope||proposalInvestment||proposalBody){
    payload.proposalDraft=payload.proposalDraft||{};
    if(proposalTitle)payload.proposalDraft.title=proposalTitle.value.trim();
    if(proposalRecipient)payload.proposalDraft.recipient=proposalRecipient.value.trim();
    if(proposalScope)payload.proposalDraft.scope=proposalScope.value.trim();
    if(proposalInvestment)payload.proposalDraft.investmentNote=proposalInvestment.value.trim();
    if(proposalBody)payload.proposalDraft.body=proposalBody.value;
    textarea.value=JSON.stringify(payload,null,2);
  }
  var pageFilename=document.getElementById('packetPageFilename-'+packetId),pageTitle=document.getElementById('packetPageTitle-'+packetId),pageDestination=document.getElementById('packetPageDestination-'+packetId),pageHtml=document.getElementById('packetPageHtml-'+packetId);
  if(pageFilename||pageTitle||pageDestination||pageHtml){
    if(pageFilename)payload.filename=pageFilename.value.trim();
    if(pageTitle)payload.pageTitle=pageTitle.value.trim();
    if(pageDestination)payload.destination=pageDestination.value.trim();
    if(pageHtml)payload.htmlDraft=pageHtml.value;
    textarea.value=JSON.stringify(payload,null,2);
  }
  if(status)status.textContent='Saving exact packet payload. No external action is being taken.';
  apiFetch((window.PROXY||'')+'/api/val/external-actions/'+encodeURIComponent(packetId)+'/edit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({payloadPreviewJson:payload,note:'Packet contents refined from receipt trail drawer.'})}).then(function(data){
    var refreshedPacket=data&&data.packet;
    if(status)status.textContent='Saved to '+externalPacketArtifactLabel(refreshedPacket||{payloadPreviewJson:payload}).toLowerCase()+'. No external action was taken.';
    if(refreshedPacket){
      var workspaceBody=document.querySelector('#externalPacketTimelineWorkspace .exec-workspace-body');
      if(workspaceBody)workspaceBody.innerHTML=externalPacketTimelineHtml({packet:refreshedPacket,timeline:data.timeline,approval_state:data.approval_state,retry_eligibility:data.retry_eligibility});
      setTimeout(function(){openExternalActionPacketTimeline(packetId);},450);
    }
  }).catch(function(e){
    if(status)status.textContent='Could not save payload: '+(e.message||e);
  });
};
window.homepageCardAction=function(type,id,action){
  var item=homepageCardFind(type,id)||{};
  var out=document.getElementById('valCardChatLog');
  if(out)out.innerHTML+='<div class="val-card-chat user">'+safe(actionLabel(action))+'</div><div class="val-card-chat">Working on that...</div>';
  apiFetch((window.PROXY||'')+'/api/homepage-cards/action',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cardType:type,action:action,item:item})}).then(function(data){
    if(out){
      if(data&&data.packet)out.lastChild.innerHTML=packetReceiptHtml(data);
      else out.lastChild.textContent=data.message||(data.status==='task_created'?'Task created and linked to this signal.':(data.status==='draft_created'?'Draft created for review.':(data.status==='approval_required'?'I logged that this needs final send approval. Nothing was sent.':'Decision logged.')));
    }
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
  }).catch(function(e){if(out)out.lastChild.textContent='Co-Work failed: '+(e.message||e);});
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
function relationshipBriefFromDossier(dossier){
  dossier=dossier||{};
  var identity=dossier.identity||{},observation=dossier.observation||{},interpretation=dossier.interpretation||{},meaning=dossier.meaning||{},wisdom=dossier.wisdom||{};
  function arr(items){return Array.isArray(items)?items:[];}
  function textList(items,limit){return arr(items).map(function(x){return x&&typeof x==='object'?(x.summary||x.content||x.text||x.title||x.note||''):x;}).filter(Boolean).slice(0,limit||4);}
  function actionById(id,label){
    var items=dossier.actions&&Array.isArray(dossier.actions.items)?dossier.actions.items:[];
    var action=items.find(function(a){return a.id===id;});
    return action?Object.assign({},action,{label:label||action.label,safe:true}):null;
  }
  var observerNotes=textList(dossier.observerNotes||dossier.observer_notes,3).map(function(note){return {observer:'Relationship Observer',note:note};});
  if(interpretation.momentum)observerNotes.push({observer:'Momentum Observer',note:'Current relationship momentum: '+interpretation.momentum+'.'});
  if(arr(interpretation.risks).length)observerNotes.push({observer:'Risk Observer',note:textList(interpretation.risks,1)[0]});
  if(arr(interpretation.opportunities).length)observerNotes.push({observer:'Opportunity Observer',note:textList(interpretation.opportunities,1)[0]});
  return dossier.relationshipBrief||{
    briefVersion:'VAL_PHASE_13C_RELATIONSHIP_BRIEF_V1',
    identity:{id:identity.id||dossier.id||'',crmContactId:identity.crmContactId||'',name:identity.name||'Relationship',photoUrl:identity.photoUrl||identity.photo_url||'',company:identity.company||'',role:identity.role||'',tags:arr(identity.tags).slice(0,8),status:identity.status||'Observed',lastInteraction:observation.lastObservedAt||''},
    currentReality:{summary:observation.summary||'VAL is still collecting relationship evidence.',activeConversations:textList(dossier.activeConversations||dossier.active_conversations,4),waitingOn:textList(dossier.waitingOn||dossier.waiting_on,4),openCommitments:textList(observation.openLoops||dossier.openCommitments||dossier.open_commitments,4),recentMeetings:textList(dossier.recentMeetings||dossier.recent_meetings,4),recentEmails:textList(dossier.recentEmails||dossier.recent_emails,4),timeline:arr(observation.evidence||dossier.timeline).slice(0,5)},
    executiveAssessment:textList([interpretation.pattern,interpretation.momentum?'Momentum is '+interpretation.momentum+'.':'',arr(interpretation.relationshipSignals)[0],arr(interpretation.risks)[0],arr(interpretation.opportunities)[0]],4),
    strategicImportance:{summary:meaning.whyItMatters||meaning.executiveValue||'VAL has not assigned strategic importance yet.',executiveValue:meaning.executiveValue||meaning.whyItMatters||''},
    executiveReminder:wisdom.oneThingToRemember||'Nothing should be compressed into a reminder until VAL has enough evidence.',
    observerNotes:observerNotes.slice(0,5),
    actions:{communicate:[actionById('draft_message','Draft Email')].filter(Boolean),plan:[actionById('create_task','Create Task')].filter(Boolean),think:[actionById('brainstorm','Brainstorm'),actionById('ask_alignment','Ask VAL')].filter(Boolean),teach:[actionById('mark_vip','Update Relationship'),actionById('not_important','Correct Judgment'),actionById('snooze','Protect Attention')].filter(Boolean)},
    sourceReceipts:{crmContactId:identity.crmContactId||'',canonicalSource:identity.canonicalSource||'unresolved',linkedInLatestPosts:arr(dossier.linkedInLatestPosts||dossier.linkedinLatestPosts||dossier.linkedin_latest_posts).slice(0,3),observers:[{id:'ghl_crm',label:'CRM Contact',status:identity.crmContactId?'resolved':'required',sourceId:identity.crmContactId||''},{id:'linkedin',label:'LinkedIn Observer',status:(identity.linkedinUrl||identity.linkedin_url||dossier.linkedinUrl||dossier.linkedin_url)?'available':'watching',sourceId:identity.linkedinUrl||identity.linkedin_url||dossier.linkedinUrl||dossier.linkedin_url||''},{id:'apollo',label:'Apollo Observer',status:(dossier.apollo||dossier.apolloStatus)?'available':'watching',sourceId:dossier.apolloStatus||''},{id:'outscraper',label:'Outscraper Observer',status:(dossier.outscraper||dossier.outscraperStatus)?'available':'watching',sourceId:dossier.outscraperStatus||''}],sourceRefs:arr(dossier.sourceRefs||dossier.source_refs)}
  };
}
function relationshipDossierHtml(dossier){
  if(!dossier||!dossier.identity)return '';
  var brief=relationshipBriefFromDossier(dossier),identity=brief.identity||{},currentReality=brief.currentReality||{},strategicImportance=brief.strategicImportance||{},sourceReceipts=brief.sourceReceipts||{};
  window.relationshipDossierActionRegistry=window.relationshipDossierActionRegistry||{};
  var dossierId=String(dossier.id||identity.id||identity.email||identity.name||'relationship');
  window.relationshipDossierActionRegistry[dossierId]=dossier;
  var actions=(dossier.actions&&Array.isArray(dossier.actions.items)?dossier.actions.items:[]).slice(0,8);
  var sectionActions=dossier.actions&&dossier.actions.sections||{};
  function list(items,empty){return (Array.isArray(items)&&items.length)?'<ul>'+items.slice(0,5).map(function(x){return '<li>'+safe(x.summary||x.content||x.text||x.title||x)+'</li>';}).join('')+'</ul>':'<p>'+safe(empty)+'</p>';}
  function actionButton(action){return '<button class="val-card-action-btn '+actionClass(action.id)+'" title="'+safe((action.willDo||'')+' '+(action.willNotDo||''))+'" onclick="relationshipDossierAction(\''+jsString(dossierId)+'\',\''+jsString(action.id)+'\')">'+safe(action.label||actionLabel(action.id))+'</button>';}
  function groupedButtons(){
    var groups=brief.actions||{},order=[['communicate','Communicate'],['plan','Plan'],['think','Think'],['teach','Teach']];
    return order.map(function(pair){
      var group=Array.isArray(groups[pair[0]])?groups[pair[0]]:[];
      return group.length?'<div class="relationship-action-group"><strong>'+safe(pair[1])+'</strong><div>'+group.map(actionButton).join('')+'</div></div>':'';
    }).join('') || (actions.length?'<div class="val-card-action-grid relationship-dossier-actions">'+actions.map(actionButton).join('')+'</div>':'');
  }
  function sectionButtons(section){var scoped=Array.isArray(sectionActions[section])?sectionActions[section]:[];return scoped.length?'<div class="val-card-chip-row relationship-section-actions">'+scoped.map(function(action){return '<button title="'+safe((action.willDo||action.prompt||'')+' '+(action.willNotDo||''))+'" onclick="relationshipDossierAction(\''+jsString(dossierId)+'\',\''+jsString(action.id)+'\',\''+jsString(section)+'\')">'+safe(action.label||actionLabel(action.id))+'</button>';}).join('')+'</div>':'';}
  function observerList(){var observers=(sourceReceipts.observers||[]).slice(0,5);return observers.length?'<ul>'+observers.map(function(o){return '<li><strong>'+safe(o.label||o.id||'Observer')+':</strong> '+safe(o.status||'watching')+(o.sourceId?' · '+safe(o.sourceId):'')+'</li>';}).join('')+'</ul>':'<p>CRM, LinkedIn, Apollo, and Outscraper observers are watching for relationship evidence.</p>';}
  function linkedInSignal(){var posts=Array.isArray(sourceReceipts.linkedInLatestPosts)?sourceReceipts.linkedInLatestPosts:[];var post=posts[0]||{};return safe(post.summary||post.title||post.text||'LinkedIn is being watched for useful public context.');}
  return '<div class="relationship-profile-grid relationship-dossier">'
    +'<section class="exec-card relationship-profile-wide"><h3>Relationship Brief</h3><p><strong>'+safe(identity.name||'Relationship')+'</strong></p><p>'+safe([identity.role,identity.company,identity.status].filter(Boolean).join(' · '))+'</p><p class="relationship-source-line">CRM contact ID: '+safe(identity.crmContactId||'required before context is merged')+'</p>'+sectionButtons('identity')+'</section>'
    +'<section class="exec-card"><h3>Current Reality</h3><p>'+safe(currentReality.summary||'No relationship evidence is attached yet.')+'</p>'+list(currentReality.openCommitments,'No open commitment is attached yet.')+sectionButtons('evidence')+'</section>'
    +'<section class="exec-card"><h3>Executive Assessment</h3>'+list(brief.executiveAssessment,'VAL is still watching for a clear executive assessment.')+sectionButtons('patterns')+'</section>'
    +'<section class="exec-card"><h3>Strategic Importance</h3><p>'+safe(strategicImportance.summary||'VAL has not assigned strategic importance yet.')+'</p>'+sectionButtons('meaning')+'</section>'
    +'<section class="exec-card"><h3>Executive Reminder</h3><p>'+safe(brief.executiveReminder||'Nothing should be compressed into a reminder until VAL has enough evidence.')+'</p>'+sectionButtons('wisdom')+'</section>'
    +'<section class="exec-card"><h3>Observer Notes</h3>'+list(brief.observerNotes,'No observer note has earned space yet.')+'<div class="relationship-receipt-grid"><article><span>LinkedIn Signal</span><p>'+linkedInSignal()+'</p><button class="val-card-action-btn" onclick="relationshipDossierAction(\''+jsString(dossierId)+'\',\'review_linkedin_activity\')">Review LinkedIn activity</button></article><article><span>Source Receipts</span>'+observerList()+'<button class="val-card-action-btn" onclick="relationshipDossierAction(\''+jsString(dossierId)+'\',\'refresh_relationship_observers\')">Refresh observers</button></article></div></section>'
    +'<section class="exec-card relationship-profile-wide"><h3>Executive Actions</h3>'+groupedButtons()+'<div id="relationshipDossierActionPanel" class="relationship-dossier-action-panel"></div></section>'
    +'</div>';
}
window.relationshipDossierAction=function(dossierId,actionId,section,candidateKey){
  var registry=window.relationshipDossierActionRegistry||{},dossier=registry[dossierId]||{},actions=(dossier.actions&&dossier.actions.items)||[];
  window.relationshipIntroCandidateRegistry=window.relationshipIntroCandidateRegistry||{};
  var sectionActions=dossier.actions&&dossier.actions.sections||{};
  var allSectionActions=Object.keys(sectionActions).reduce(function(out,key){return out.concat(sectionActions[key]||[]);},[]);
  var action=actions.find(function(a){return a.id===actionId;})||allSectionActions.find(function(a){return a.id===actionId;})||{id:actionId,type:'endpoint',endpoint:'/api/relationships/actions'};
  var panel=document.getElementById('relationshipDossierActionPanel');
  function say(title,body){if(panel)panel.innerHTML='<section class="relationship-action-panel"><h4>'+safe(title)+'</h4><div>'+safe(body||'').replace(/\n/g,'<br>')+'</div></section>';}
  var identity=dossier.identity||{},contact={id:identity.id||dossier.id||'',contactId:identity.crmContactId||identity.id||dossier.id||'',name:identity.name||'',email:identity.email||'',company:identity.company||'',recommendedAction:(dossier.actions&&dossier.actions.primary)||'',reason:(dossier.meaning&&dossier.meaning.whyItMatters)||'',openLoops:(dossier.observation&&dossier.observation.openLoops)||[],evidence:(dossier.observation&&dossier.observation.evidence)||[],relationshipDossier:dossier};
  if(action.type==='route'&&action.route){window.open(action.route,'_blank','noopener');say('Opened relationship file','No message, task, CRM write, or external action was taken.');return;}
  if(action.type==='workspace'&&action.workspace==='alignment'){if(typeof openHomepageCard==='function')openHomepageCard('people',dossierId);say('Alignment opened','VAL kept the relationship context attached for judgment.');return;}
  if(action.id==='open_evidence'){relationshipDossierAction(dossierId,'open_full_file','evidence');return;}
  if(action.id==='create_task_from_loop'){action={id:'create_task',label:'Create task',type:'endpoint',endpoint:'/api/relationships/actions',method:'POST'};}
  if(action.id==='ask_about_pattern'||action.id==='ask_why_matters'){
    var prompt=action.prompt||'Explain this relationship section using only the dossier evidence.';
    if(typeof homepageCardAsk==='function')homepageCardAsk('people',dossierId,prompt);
    say(action.label||'Asked VAL',prompt);
    return;
  }
  if(action.id==='teach_wisdom'){if(typeof openTeachValOnboarding==='function')openTeachValOnboarding();else commandCenterNavigate('teach_val');say('Teach VAL opened','Use this to correct or refine the relationship wisdom.');return;}
  say(action.label||actionLabel(actionId),'Working from the relationship dossier...');
  var introCandidate=candidateKey?(window.relationshipIntroCandidateRegistry||{})[candidateKey]:null;
  apiFetch((window.PROXY||'')+(action.endpoint||'/api/relationships/actions'),{method:action.method||'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:actionId,contact:contact,dossier:dossier,candidate:introCandidate})}).then(function(data){
    function introReviewHtml(surface){
      if(!surface||!Array.isArray(surface.sections))return '';
      return '<section class="relationship-action-panel intro-review-surface"><h4>'+safe(surface.title||'Introduction leverage ready')+'</h4><p>'+safe(surface.summary||data.message||'VAL prepared review-only introduction candidates.')+'</p>'
        +surface.sections.map(function(section){
          var cards=(section.cards||[]).slice(0,4).map(function(card){
            var candidate=(data.candidates||[]).find(function(item){return item.id===card.id;})||card;
            var candidateKey=dossierId+':'+card.id;
            window.relationshipIntroCandidateRegistry[candidateKey]=candidate;
            return '<article class="intro-review-card"><strong>'+safe(card.title||'Relationship')+'</strong><p>'+safe(card.meaning||'Potential relationship leverage.')+'</p><small>Confidence '+Math.round(Number(card.confidence||0)*100)+'% · CRM IDs attached</small><div><button onclick="relationshipDossierAction(\''+jsString(dossierId)+'\',\'draft_intro_candidate\',\'intro\',\''+jsString(candidateKey)+'\')" title="Creates only a reviewable internal draft. Nothing is sent.">Draft intro for review</button><button onclick="openDashboardTarget(\'person\',\''+jsString(card.contactIds&&card.contactIds.other||'')+'\')" title="Opens the other relationship brief when available.">Open brief</button></div></article>';
          }).join('')||'<article class="intro-review-card quiet"><p>No confident match yet.</p></article>';
          return '<div class="intro-review-section"><h5>'+safe(section.title||'Direction')+'</h5><p>'+safe(section.question||'Review this direction.')+'</p>'+cards+'</div>';
        }).join('')
        +'<p class="intro-review-boundary">'+safe(surface.boundary||'Review first. Nothing external happened.')+'</p></section>';
    }
    function introLines(items){
      return (items||[]).slice(0,4).map(function(item){
        var other=(item.personB&&item.personB.name)||item.name||'Relationship';
        return '- '+other+': '+(item.whyThisMayMatter||'Potential relationship leverage.')+' Confidence '+Math.round((item.confidence||0)*100)+'%.';
      }).join('\n')||'- No confident match yet.';
    }
    if(data.draft)say('Draft prepared','Draft saved for review. Nothing was sent.\n\nSubject: '+(data.draft.subject||'Relationship follow-up'));
    else if(data.task){say('Task created',data.task.title||'Relationship task created.');if(typeof valTasksLoad==='function')valTasksLoad();}
    else if(data.observers){say('Observer refresh preview',(data.message||'Observers are ready for review.')+'\n\n'+data.observers.map(function(o){return (o.label||o.id)+': '+(o.status||'watching');}).join('\n'));}
    else if(data.whoNeedsThisPerson||data.whoThisPersonNeeds){
      if(panel&&data.reviewSurface)panel.innerHTML=introReviewHtml(data.reviewSurface);
      else say('Introduction leverage ready',
        (data.message||'VAL prepared review-only introduction candidates.')+'\n\n'
        +'Who needs this person:\n'+introLines(data.whoNeedsThisPerson)+'\n\n'
        +'Who this person needs:\n'+introLines(data.whoThisPersonNeeds)+'\n\n'
        +'Boundary: no introduction was sent and no contact was exposed without review.');
    }
    else if(data.content)say('Relationship thinking',data.content);
    else say('Relationship updated',data.status||data.action||'VAL recorded the relationship action.');
    if(typeof loadExecutiveBriefing==='function')loadExecutiveBriefing(false);
  }).catch(function(e){say('Action failed',(e&&e.message)||String(e));});
};
window.openDashboardTarget=function(type,id){
  var b=executiveBriefingState.data||{},entities=b.dashboardEntities||{};
  function all(list){return Array.isArray(list)?list:[];}
  function readyMatchId(item){
    var metadata=itemMetadata(item),artifact=preparedArtifactPayload(item),target=item&&item.target||{};
    return [item&&item.id,item&&item.sourceId,item&&item.source_id,item&&item.draftId,target.id,artifact.id,artifact.artifactId,metadata.artifactId,metadata.preparedArtifactId].filter(Boolean).map(String);
  }
  function openPreparedReadyItem(){
    var ready=all(b.readyForYou).concat(all(entities.readyForYou));
    var match=ready.find(function(item){return readyMatchId(item).indexOf(String(id))>=0;});
    if(match&&typeof openHomepageCard==='function'){
      openHomepageCard('ready_for_you',cardItemKey(match));
      return true;
    }
    return false;
  }
  var item=null,title='VAL Detail';
  if(type==='person'||type==='contact')item=all(entities.people).find(function(x){return String(x.id||x.profileKey||x.email||x.name||x.contactId)===String(id);});
  else if(type==='project')item=all(entities.projects).find(function(x){return String(x.id||x.profileKey||x.name)===String(id);});
  else if(type==='draft'){
    if(openPreparedReadyItem())return;
    if(typeof openDraftsPage==='function')openDraftsPage(id);
    return;
  }
  else if(type==='opportunity'||type==='pipeline'){if(typeof openPipelineTarget==='function'&&id)openPipelineTarget(id);else if(typeof openOpportunityIntelligence==='function')openOpportunityIntelligence();else commandCenterNavigate('opportunities');return;}
  else if(type==='meeting'||type==='calendar'){commandCenterNavigate('meetings');return;}
  else if(type==='evidence'||type==='transcript'||type==='conversation'||type==='email'){commandCenterNavigate('evidence');return;}
  else if(type==='move')item=[b.highestLeverageMove].concat(all(b.alsoImportant),all(b.watching)).find(function(x){return x&&String(x.id)===String(id);});
  if(!item){
    item=all(entities.whatChanged).concat(all(entities.momentum),all(entities.readyForYou)).find(function(x){return String(x.id||'')===String(id);});
  }
  if(type==='person'||type==='contact')title=(item&&item.name?item.name:'Relationship')+' Profile';
  else if(type==='project')title=(item&&item.name?item.name:'Project')+' Workspace';
  else if(type==='move')title='Why This Matters';
  if(!item){commandCenterNavigate(type==='project'?'projects':((type==='person'||type==='contact')?'relationships':'evidence'));return;}
  var evidence=(item.evidence||[]).slice(0,8).map(function(e){return '<li><strong>'+safe(e.title||e.type||'Evidence')+'</strong><br><span>'+safe(e.summary||'')+'</span></li>';}).join('');
  var loops=(item.openLoops||[]).slice(0,6).map(function(x){return '<li>'+safe(x)+'</li>';}).join('');
  var risks=(item.risks||[]).slice(0,6).map(function(x){return '<li>'+safe(x)+'</li>';}).join('');
  var opps=(item.opportunities||[]).slice(0,6).map(function(x){return '<li>'+safe(x)+'</li>';}).join('');
  var dossier=item.relationshipDossier||item.relationship_dossier||null;
  var body=dossier?relationshipDossierHtml(dossier):'<div class="relationship-profile-grid">'
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
  if(!items.length)return homeEmptyCard('what_changed','No meaningful changes yet. I will surface this only when a source record deserves your attention.');
  return items.map(function(item){
    var title=typeof item==='string'?item:(item.title||item.content||item.summary||'Something changed');
    var type=typeof item==='string'?'default':(item.type||item.observationType||'default');
    return '<button class="val-dash-row" onclick="openHomepageCard(\'what_changed\',\''+jsString(cardItemKey(item))+'\')"><span class="val-row-icon '+safe(type)+'">'+safe(lineIcon(type))+'</span><span>'+compactText(displayMoveTitle(title))+'</span></button>';
  }).join('');
}
function peopleRows(b){
  var people=(b&&Array.isArray(b.people)?b.people:[]).slice(0,4);
  if(!people.length)return homeEmptyCard('people','No relationships need review yet. I am still watching for open loops, cooling momentum, and warm opportunities.');
  return people.map(function(p){
    var trend=String(p.trend||p.state||'steady').toLowerCase();
    var cls=/risk|waiting|needs|cool|slow/.test(trend)?'risk':(/warm|momentum|increas|build/.test(trend)?'up':'steady');
    return '<button class="val-person-row" onclick="openHomepageCard(\'people\',\''+jsString(cardItemKey(p))+'\')"><span class="val-person-avatar">'+safe((p.name||p.title||'R').slice(0,1).toUpperCase())+'</span><span><strong>'+safe(p.name||p.title||'Relationship')+'</strong><small class="'+cls+'">'+safe(p.state||p.summary||'Observed')+'</small></span><em class="'+cls+'">'+(cls==='risk'?'↘':(cls==='up'?'↗':'→'))+'</em></button>';
  }).join('');
}
function projectRows(b){
  var projects=(b&&Array.isArray(b.projects)?b.projects:[]).slice(0,3);
  if(!projects.length)return homeEmptyCard('projects','No active project signals yet. Projects will appear here when evidence shows movement, risk, or a next decision.');
  return projects.map(function(p){
    var cls=/risk|slow|stall|watch/i.test(String(p.state||''))?'risk':'up';
    return '<button class="val-project-row" onclick="openHomepageCard(\'projects\',\''+jsString(cardItemKey(p))+'\')"><span class="val-project-icon '+cls+'">↗</span><span><strong>'+safe(p.name||p.title||'Project')+'</strong><small>'+safe(p.summary||p.description||'Current priority')+'</small></span><em class="'+cls+'">'+safe(p.state||p.status||'Watched')+'</em></button>';
  }).join('');
}
function momentumRows(b){
  var momentum=(b&&Array.isArray(b.momentum)?b.momentum:[]).slice(0,4);
  if(!momentum.length)return homeEmptyCard('momentum','No momentum signal yet. Quiet does not mean inactive; I am watching for the pattern.');
  return momentum.map(function(m){
    var cls=/risk|at risk/i.test(String(m.state||m.title||''))?'risk':(/slow|watch/i.test(String(m.state||m.title||''))?'watch':(/recover/i.test(String(m.state||m.title||''))?'recover':'up'));
    return '<button class="val-momentum-row '+cls+'" onclick="openHomepageCard(\'momentum\',\''+jsString(cardItemKey(m))+'\')"><span>'+safe(cls==='risk'?'↓':(cls==='watch'?'↘':(cls==='recover'?'↻':'↗')))+'</span><div><strong>'+safe(displayMoveTitle(m.title||'Momentum signal'))+'</strong><small>'+safe(m.detail||m.summary||'VAL is watching the pattern.')+'</small></div></button>';
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
  (b&&Array.isArray(b.alsoImportant)?b.alsoImportant:[]).slice(0,3).forEach(function(m){pushReady({id:m.id,title:m.title||'Suggested move ready',view:'commitments',target:m.target});});
  if(!ready.length)return homeEmptyCard('ready_for_you','No pending review items yet. When something is ready for your judgment, I will put it here.');
  return ready.slice(0,5).map(function(r){return '<div class="val-ready-row"><span>✓</span><strong>'+safe(displayMoveTitle(r.title))+'</strong><button class="val-card-link" onclick="openHomepageCard(\'ready_for_you\',\''+jsString(cardItemKey(r))+'\')">View</button></div>';}).join('');
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
    welcome.innerHTML='<div class="val-home-hero"><div class="val-home-banner" aria-label="Velocity Alignment Leverage. AI that moves you forward."></div>'+dailyWitnessGreetingHtml(brief,tod,dashboardOverride)+'</div>'+executiveBriefingHtml(false)+'<div class="val-presence-actions"><button class="val-presence-btn" onclick="startVoiceChatMode()"><span class="val-presence-icon">◌</span><span><strong>Voice Co-Work</strong><small>Discuss, brainstorm, or ask VAL for your next best move.</small></span></button><button class="val-presence-btn meeting" onclick="startMeetingPresenceMode()"><span class="val-presence-icon">◍</span><span><strong>Meeting Mode</strong><small>VAL listens quietly and helps when called.</small></span></button></div><div class="val-home-chat"><span>✦</span><button onclick="openGeneralChat({welcome:true})">What are we working on today?</button><button class="val-home-send" onclick="openGeneralChat({welcome:true})">↑</button></div><button class="val-talk-button" onclick="openGeneralChat({welcome:true})" aria-label="Co-Work with VAL"><span class="val-face-glow"></span><span class="val-face"><span class="val-face-smile"></span></span><strong>Co-Work with VAL</strong></button>';
    welcome.style.display='block';
    return;
  }
  welcome.className='center-welcome michele-book-home';
  welcome.innerHTML=micheleBookHomeHtml();
  welcome.style.display='block';
}
function loadTranscripts(show){
  var fetcher=typeof apiFetch==='function'?apiFetch:function(url){return fetch(url,{credentials:'same-origin'}).then(function(r){return r.json().catch(function(){return{};}).then(function(data){if(!r.ok)throw new Error(data.error||('Transcript request failed ('+r.status+')'));return data;});});};
  transcriptState.loading=true;transcriptState.error='';if(show)renderTranscriptLoading();
  return fetcher((window.PROXY||'')+'/api/val/transcripts?days=3650&limit=250').then(function(data){if(!data||data.ok===false||!Array.isArray(data.transcripts))throw new Error((data&&data.error)||'Transcript retrieval returned an invalid response.');transcriptState.items=data.transcripts;transcriptState.counts=data.counts||{total:data.transcripts.length,needsReview:0,withOpenActions:0};transcriptState.loaded=true;transcriptState.loading=false;transcriptState.error='';transcriptState.lastLoadedAt=new Date().toISOString();updateCommandCenterBadges();if(show)renderTranscriptList();return data;}).catch(function(e){transcriptState.loaded=true;transcriptState.loading=false;transcriptState.error=e.message||String(e);updateCommandCenterBadges();if(show)renderTranscriptError(transcriptState.error);throw e;});
}
window.openTranscripts=function(){setActive('transcripts');call('closeDetail');document.body.classList.add('val-transcripts-mode');var welcome=document.getElementById('centerWelcome');if(welcome)welcome.style.display='none';var view=document.getElementById('valTranscriptView');if(view)view.classList.add('open');if(!transcriptState.loaded||transcriptState.error){loadTranscripts(true).catch(function(){});}else renderTranscriptList();};
function transcriptHeader(subtitle,back){var clearBtn=(window.VAL_CONFIG&&VAL_CONFIG.clientSlug==='jessa-val')?'<button class="val-ui-btn danger" onclick="clearTranscriptArchive()">Clear Transcript Data</button>':'';return '<div class="val-view-head"><div><h2>Transcript Intelligence</h2><p>'+safe(subtitle)+'</p></div><div class="val-view-actions">'+(back?'<button class="val-ui-btn" onclick="renderTranscriptList()">Inbox</button>':'')+'<button class="val-ui-btn primary" onclick="chooseTranscriptUpload()">Upload Transcript</button><button class="val-ui-btn" onclick="renderTranscriptReviewQueue()">Review Queue</button><button class="val-ui-btn" onclick="renderTranscriptIntakeStatus()">Intake Status</button><button class="val-ui-btn" onclick="repairTranscriptProcessing()">Process Pending</button><button class="val-ui-btn" onclick="recoverStoredTranscripts()">Reprocess Recent</button><button class="val-ui-btn" onclick="openIntegrationStatus()">Webhook Setup</button><button class="val-ui-btn" '+(transcriptState.loading?'disabled':'')+' onclick="loadTranscripts(true).catch(function(){})">'+(transcriptState.loading?'Refreshing…':'Refresh')+'</button>'+clearBtn+'</div></div>';}
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
function transcriptSidebar(activeId){
  var count=Number((transcriptState.counts&&transcriptState.counts.total)||transcriptState.items.length||0);
  var rows=transcriptState.items.map(function(t){
    var active=String(t.id)===String(activeId);
    var title=transcriptShortText(t.title||t.contactName,'Transcript',86);
    var summary=t.summary&&typeof t.summary==='object'?t.summary.executiveSummary:(t.summaryPreview||t.summary||t.preview||'Open to review.');
    var date=t.createdAt?new Date(t.createdAt).toLocaleDateString():'';
    return '<button class="val-transcript-side-row'+(active?' active':'')+'" onclick="openTranscriptDetail(\''+jsString(t.id)+'\')"><strong>'+safe(title)+'</strong><small>'+safe(date)+'</small><span>'+safe(transcriptShortText(summary,'Open to review.',120))+'</span></button>';
  }).join('');
  return '<aside class="val-transcript-sidebar"><div class="val-transcript-sidebar-head"><span>Transcripts</span><strong>'+count+'</strong></div><div class="val-transcript-sidebar-list">'+(rows||'<div class="val-transcript-side-empty">No transcripts yet. Upload or connect a meeting source when ready.</div>')+'</div></aside>';
}
window.renderTranscriptList=function(){
  transcriptState.active=null;var view=document.getElementById('valTranscriptView');if(!view)return;
  var c=transcriptState.counts||{};
  view.innerHTML=transcriptHeader('Choose a transcript from the left. Notes and raw transcript evidence will appear here after you select one.')+'<div class="val-transcript-shell">'+transcriptSidebar('')+'<main class="val-transcript-empty-panel"><div><h3>Select a transcript</h3><p>Choose one from the left to open its Notes and Transcript. VAL will keep this space quiet until you ask to review something.</p><div class="val-transcript-stats compact"><span class="val-transcript-stat"><strong>'+Number(c.total||transcriptState.items.length)+'</strong> transcripts</span><span class="val-transcript-stat"><strong>'+Number(c.failedProcessing||0)+'</strong> processing issues</span></div></div></main></div>';
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
function normalizeList(items){return (Array.isArray(items)?items:[]).map(function(x){return typeof x==='string'?x:(x.title||x.text||x.summary||x.name||x.email||JSON.stringify(x));}).filter(Boolean);}
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
  view.innerHTML=transcriptHeader(meta,true)+'<div class="val-transcript-shell detail">'+transcriptSidebar(t.id)+'<main class="val-transcript-main-detail"><div class="val-transcript-detail"><div class="val-detail-main"><section class="val-detail-card"><div class="val-detail-actions"><button class="val-ui-btn primary" onclick="transcriptAskFocus()">Co-Work on This Transcript</button></div><h3>Summary</h3><p>'+safe(transcriptShortText(s.executiveSummary||s.clientSummary||'Summary pending.','Summary pending.',900))+'</p></section><section class="val-detail-card"><h3>Transcript</h3><p class="val-full-transcript">'+safe(t.transcriptText||t.rawTranscript||'No transcript text is available.')+'</p></section>'+debug+'</div><aside class="val-detail-side"><section class="val-detail-card"><h3>Co-Work on This Transcript</h3><div class="val-chat-log" id="valTranscriptChat"><div class="val-chat-msg">Ask about what happened, what was decided, what matters, or what VAL noticed in this transcript.</div></div><div class="val-chat-input"><input id="valTranscriptQuestion" placeholder="Ask VAL about this transcript" onkeydown="if(event.key===\'Enter\')transcriptAsk()"><button class="val-ui-btn primary" onclick="transcriptAsk()">Ask</button></div></section></aside></div></main></div>';
}
function transcriptApproval(path,body){return fetch((window.PROXY||'')+path,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(body||{})}).then(function(r){return r.json().then(function(d){if(!r.ok||d.ok===false)throw new Error(d.error||'Approval failed');return d;});});}
window.approveTranscriptTask=function(id){transcriptApproval('/api/val/transcripts/tasks/'+encodeURIComponent(id)+'/approve').then(function(){renderTranscriptReviewQueue();loadTranscripts(false);call('valTasksLoad');}).catch(function(e){alert(e.message);});};
window.approveTranscriptParticipant=function(id){var existing=null;transcriptState.items.some(function(t){existing=(t.participants||[]).find(function(p){return p.participantId===id;});return !!existing;});var contactId=existing&&existing.matchedContactId||prompt('Enter the exact CRM contact ID for this participant:');if(!contactId)return;var contactName=existing&&existing.matchedContactName||prompt('Enter the confirmed contact name:')||'';transcriptApproval('/api/val/transcripts/participants/'+encodeURIComponent(id)+'/approve',{contactId:contactId,contactName:contactName}).then(renderTranscriptReviewQueue).catch(function(e){alert(e.message);});};
window.approveTranscriptContactUpdate=function(id){transcriptApproval('/api/val/transcripts/contact-updates/'+encodeURIComponent(id)+'/approve').then(renderTranscriptReviewQueue).catch(function(e){alert(e.message);});};
window.reviewValDecision=function(id,status){transcriptApproval('/api/val/decisions/'+encodeURIComponent(id)+'/review',{status:status}).then(renderTranscriptReviewQueue).catch(function(e){alert(e.message);});};
function chatMessage(text,user){var log=document.getElementById('valTranscriptChat');if(!log)return;var el=document.createElement('div');el.className='val-chat-msg'+(user?' user':'');el.textContent=text;log.appendChild(el);log.scrollTop=log.scrollHeight;}
window.transcriptAsk=function(question){
  var t=transcriptState.active;if(!t)return;var input=document.getElementById('valTranscriptQuestion'),q=question||(input&&input.value.trim());if(!q)return;if(input)input.value='';chatMessage(q,true);chatMessage('Working from this transcript…',false);var log=document.getElementById('valTranscriptChat'),pending=log&&log.lastChild;
  fetch((window.PROXY||'')+'/api/val/transcripts/'+encodeURIComponent(t.id)+'/chat',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:q})}).then(function(r){return r.json().then(function(d){if(!r.ok||d.ok===false)throw new Error(d.error||'Transcript chat failed.');return d;});}).then(function(d){if(pending)pending.remove();chatMessage((d.message&&d.message.content)||d.message||'No response was returned.',false);}).catch(function(e){if(pending)pending.remove();chatMessage('Unable to complete that request: '+e.message,false);});
};
function transcriptById(id){return transcriptState.items.find(function(t){return String(t.id)===String(id);})||transcriptState.active;}
function transcriptAction(id,action){return fetch((window.PROXY||'')+'/api/val/transcripts/'+encodeURIComponent(id)+'/actions',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:action})}).then(function(r){return r.json().catch(function(){return{};}).then(function(data){if(!r.ok||data.ok===false)throw new Error(data.error||'Transcript action failed.');return data;});});}
window.transcriptAskFromList=function(id){return openTranscriptDetail(id).then(function(){transcriptAsk('What matters most in this transcript, and what should happen next?');}).catch(function(){});};
window.transcriptCreateTask=function(id){var t=transcriptById(id);if(!t)return;return transcriptAction(t.id,'create_task').then(function(data){if(transcriptState.active&&String(transcriptState.active.id)===String(t.id))chatMessage('Task created: '+data.task.title,false);else if(typeof addSys==='function')addSys('Task created from '+t.title+': '+data.task.title);call('valTasksLoad');}).catch(function(e){if(transcriptState.active)chatMessage('Task was not created: '+e.message,false);else if(typeof addSys==='function')addSys('Task was not created: '+e.message);});};
window.transcriptDraftFollowUp=function(id){var t=transcriptById(id);if(!t)return;return transcriptAction(t.id,'draft_followup').then(function(data){var message='Draft saved for approval.\n\nSubject: '+data.draft.subject+'\n\n'+data.draft.body;if(transcriptState.active&&String(transcriptState.active.id)===String(t.id))chatMessage(message,false);else{if(typeof addSys==='function')addSys('Follow-up draft saved for '+t.title+'.');openTranscriptDetail(t.id).then(function(){chatMessage(message,false);});}}).catch(function(e){if(transcriptState.active)chatMessage('Follow-up draft failed: '+e.message,false);else if(typeof addSys==='function')addSys('Follow-up draft failed: '+e.message);});};
window.transcriptReviewRecapDraft=function(){var t=transcriptState.active;if(!t)return;if(typeof openDraftsPage==='function')openDraftsPage();};
window.transcriptRegenerateRecapDraft=function(){var t=transcriptState.active;if(!t)return;transcriptDraftFollowUp(t.id).then(function(){loadDraftSignals(false);openTranscriptDetail(t.id);});};
window.transcriptAskFocus=function(){var input=document.getElementById('valTranscriptQuestion');if(input){input.focus();input.scrollIntoView({behavior:'smooth',block:'center'});}else transcriptAsk('What should I know and do from this transcript?');};
window.transcriptMarkReviewed=function(){var t=transcriptState.active;if(!t)return;transcriptAction(t.id,'mark_reviewed').then(function(){t.reviewStatus='reviewed';t.status='reviewed';chatMessage('Marked reviewed.',false);loadTranscripts(false).catch(function(){});}).catch(function(e){chatMessage('Could not mark reviewed: '+e.message,false);});};
var originalSend=window.sendMessage;window.sendMessage=function(){var input=document.getElementById('msgInput');if(transcriptState.active&&document.getElementById('valTranscriptView')&&document.getElementById('valTranscriptView').classList.contains('open')&&input&&input.value.trim()){var q=input.value.trim();input.value='';input.style.height='auto';transcriptAsk(q);return;}return originalSend&&originalSend.apply(window,arguments);};
document.addEventListener('click',function(e){var nav=document.getElementById('valPrimaryNav');if(nav&&nav.classList.contains('open')&&!nav.contains(e.target)&&!e.target.closest('.val-mobile-nav'))nav.classList.remove('open');});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installShell);else installShell();
setTimeout(updateCommandCenterBadges,1200);setTimeout(updateCommandCenterBadges,3500);
setInterval(function(){updateCommandCenterBadges();},15000);
})();
