const hearth = document.querySelector('.hearth-shell');
const title = document.querySelector('#hearth-title');
const witness = document.querySelector('[data-line="witness"]');
const orientation = document.querySelector('[data-line="orientation"]');
const permission = document.querySelector('[data-line="permission"]');
const evidence = document.querySelector('#hearth-evidence');
const leanButton = document.querySelector('.lean-button');
const freshDeskButton = document.querySelector('.fresh-desk-button');
const switches = Array.from(document.querySelectorAll('[data-state-option]'));
const roomButtons = Array.from(document.querySelectorAll('[data-open-room]'));
const rooms = Array.from(document.querySelectorAll('.living-room'));
const leveragePreparedCount = document.querySelector('[data-prepared-count]');
const returnButton = document.querySelector('.return-button');
const deskWorkspace = document.querySelector('#desk-workspace');
const workspaceKicker = document.querySelector('.workspace-kicker');
const workspaceTitle = document.querySelector('.workspace-panel h2');
const workspaceMeaning = document.querySelector('.workspace-meaning');
const judgmentSequence = document.querySelector('.judgment-sequence');
const agencyNote = document.querySelector('.agency-note');
const workspacePapers = {
  meaningLabel: document.querySelector('.meaning-paper span'),
  meaning: document.querySelector('.meaning-paper p'),
  understandingLabel: document.querySelector('.understanding-paper span'),
  understanding: document.querySelector('.understanding-paper ul'),
  recommendationLabel: document.querySelector('.recommendation-paper span'),
  recommendation: document.querySelector('.recommendation-paper p')
};
const workspaceActions = document.querySelector('.workspace-actions');
const scraperCriteriaPanel = document.querySelector('.scraper-criteria-panel');
const scraperPreviewList = document.querySelector('.scraper-preview-list');
const workspaceInputPanel = document.querySelector('.workspace-input-panel');
const workspacePacketReceipt = document.querySelector('[data-workspace-packet-receipt]');
const calendarPacketReceipt = document.querySelector('[data-calendar-packet-receipt]');
const drawerPacketReceipt = document.querySelector('[data-drawer-packet-receipt]');
let activeAutocorrectField = null;
const retrievalSystem = document.querySelector('.retrieval-system');
const drawerPull = document.querySelector('.drawer-pull');
const closeAllDrawersButton = document.querySelector('.close-all-drawers');
const drawerTray = document.querySelector('#drawer-tray');
const valDrawerLink = document.querySelector('.val-drawer-link');
const closeValDetail = document.querySelector('.close-val-detail');
const valLiveStatus = document.querySelector('[data-val-live-status]');
const valStatusFields = {
  onboarding: document.querySelector('[data-val-status="onboarding"]'),
  agreements: document.querySelector('[data-val-status="agreements"]'),
  memory: document.querySelector('[data-val-status="memory"]')
};
const valStatusCopy = {
  onboarding: document.querySelector('[data-val-status-copy="onboarding"]'),
  agreements: document.querySelector('[data-val-status-copy="agreements"]'),
  memory: document.querySelector('[data-val-status-copy="memory"]')
};
const valRouteCountFields = {
  support_circle: document.querySelector('[data-val-route-count="support_circle"]'),
  documents_and_examples: document.querySelector('[data-val-route-count="documents_and_examples"]'),
  connections: document.querySelector('[data-val-route-count="connections"]')
};
const valRouteCopyFields = {
  support_circle: document.querySelector('[data-val-route-copy="support_circle"]'),
  documents_and_examples: document.querySelector('[data-val-route-copy="documents_and_examples"]'),
  connections: document.querySelector('[data-val-route-copy="connections"]')
};
const relationshipDrawerLink = document.querySelector('.relationship-drawer-link');
const closeRelationshipDetail = document.querySelector('.close-relationship-detail');
const projectDrawerLink = document.querySelector('.project-drawer-link');
const closeProjectDetail = document.querySelector('.close-project-detail');
const timelineDrawerLink = document.querySelector('.timeline-drawer-link');
const closeTimelineDetail = document.querySelector('.close-timeline-detail');
const correspondenceDrawerLink = document.querySelector('.correspondence-drawer-link');
const closeCorrespondenceDetail = document.querySelector('.close-correspondence-detail');
const correspondenceList = document.querySelector('[data-correspondence-list]');
const correspondenceCount = document.querySelector('[data-correspondence-count]');
const correspondenceDraftPreview = document.querySelector('[data-correspondence-draft-preview]');
const correspondenceEvidence = document.querySelector('[data-correspondence-evidence]');
const correspondenceSafety = document.querySelector('[data-correspondence-safety]');
const commitmentDrawerLink = document.querySelector('.commitment-drawer-link');
const closeCommitmentDetail = document.querySelector('.close-commitment-detail');
const commitmentList = document.querySelector('[data-commitment-list]');
const commitmentStatus = document.querySelector('[data-commitment-status]');
const commitmentEvidence = document.querySelector('[data-commitment-evidence]');
const commitmentFilterButtons = Array.from(document.querySelectorAll('[data-commitment-filter]'));
const timelineStatusPanel = document.querySelector('[data-timeline-status-panel]');
const timelineStatusCount = document.querySelector('[data-timeline-status-count]');
const timelineEventList = document.querySelector('[data-timeline-event-list]');
const timelineEventCount = document.querySelector('[data-timeline-event-count]');
const timelineReviewCards = document.querySelector('[data-timeline-review-cards]');
const timelineReviewCount = document.querySelector('[data-timeline-review-count]');
const documentDrawerLink = document.querySelector('.document-drawer-link');
const closeDocumentDetail = document.querySelector('.close-document-detail');
const documentList = document.querySelector('[data-document-list]');
const documentCount = document.querySelector('[data-document-count]');
const documentSearchInput = document.querySelector('[data-document-search]');
const documentRelationshipFilter = document.querySelector('[data-document-relationship-filter]');
const documentProjectFilter = document.querySelector('[data-document-project-filter]');
const documentPreview = document.querySelector('[data-document-preview]');
const documentStatus = document.querySelector('[data-document-status]');
let currentTimelineReviewItems = [];
const timelineReviewDecisions = {};
const timelineMatchReviewOpen = {};
let currentCorrespondenceItems = [];
let activeCorrespondenceItem = null;
let currentCommitmentItems = [];
let activeCommitmentItem = null;
let activeCommitmentFilter = 'all';
let currentDocumentItems = [];
let activeDocumentItem = null;
const projectRolodex = document.querySelector('[data-project-rolodex]');
const projectIndexSource = document.querySelector('[data-project-index-source]');
const projectCreateToggle = document.querySelector('[data-project-create-toggle]');
const projectCreateForm = document.querySelector('[data-project-create-form]');
const projectCreateStatus = document.querySelector('[data-project-create-status]');
const projectFileInput = document.querySelector('[data-project-create-form] input[type="file"]');
const projectFileReceipt = document.querySelector('[data-project-file-receipt]');
const projectSourcePanel = document.querySelector('[data-project-source-panel]');
const projectSourceCount = document.querySelector('[data-project-source-count]');
const projectGraphPanel = document.querySelector('[data-project-graph-panel]');
const projectGraphCount = document.querySelector('[data-project-graph-count]');
const projectReviewPanel = document.querySelector('[data-project-review-panel]');
const projectReviewCount = document.querySelector('[data-project-review-count]');
const projectPreparedPanel = document.querySelector('[data-project-prepared-panel]');
const projectPreparedCount = document.querySelector('[data-project-prepared-count]');
const relationshipFolderButtons = Array.from(document.querySelectorAll('[data-relationship-profile]'));
const relationshipRolodex = document.querySelector('[data-relationship-rolodex]');
const relationshipSearchInput = document.querySelector('[data-relationship-search]');
const relationshipSortSelect = document.querySelector('[data-relationship-sort]');
const relationshipIndexSource = document.querySelector('[data-relationship-index-source]');
const relationshipStateFilterButtons = Array.from(document.querySelectorAll('[data-relationship-state-filter]'));
const relationshipProjectPanel = document.querySelector('[data-relationship-project-panel]');
const relationshipProjectCount = document.querySelector('[data-relationship-project-count]');
const relationshipDocumentPanel = document.querySelector('[data-relationship-document-panel]');
const relationshipDocumentCount = document.querySelector('[data-relationship-document-count]');
const projectDocumentPanel = document.querySelector('[data-project-document-panel]');
const projectDocumentCount = document.querySelector('[data-project-document-count]');
const sourceDrawerLink = document.querySelector('.source-drawer-link');
const closeSourceDetail = document.querySelector('.close-source-detail');
const scraperButtons = Array.from(document.querySelectorAll('[data-open-scraper]'));
const nextMeetingCard = document.querySelector('.next-meeting-card');
const agendaItems = Array.from(document.querySelectorAll('.agenda-item'));
const agendaList = document.querySelector('.agenda-list');
const calendarTab = document.querySelector('.calendar-tab');
const closeCalendarButton = document.querySelector('.close-calendar-button');
const fullCalendarPanel = document.querySelector('#full-calendar-panel');
const calendarSourceStatus = document.querySelector('[data-calendar-source-status]');
const coworkNotebook = document.querySelector('.cowork-notebook');
const teachPen = document.querySelector('.teach-pen');
const linkedinWidget = document.querySelector('.linkedin-widget');
const linkedinReadyCount = document.querySelector('[data-linkedin-ready-count]');
const prototypeParams = new URLSearchParams(location.search);
const mockScrapers = prototypeParams.has('mockScrapers');
const mockBriefing = prototypeParams.has('mockBriefing');
const canUseApi = !mockScrapers && (location.protocol === 'http:' || location.protocol === 'https:');
const scraperSessions = {};
const attendedRoomsStorageKey = 'val.hearth.attendedRooms.v1';
let activeScraperType = '';
let executiveBriefingState = null;
let activeHomeWorkspace = null;
let activeRelationshipProfile = null;
let activeProjectProfile = null;
let activeIntroDraftCandidate = null;
let activeRelationshipTemperatureReviewUpdate = null;
let activeProjectSourceReviewUpdate = null;
let activeMeetingContactCandidates = {};
let activeValOnboardingSessionId = '';
let activeValWitnessingSessionId = '';
let activeWorkspacePromptCards = [];
let currentCalendarEvents = [];
let valOnboardingRouteState = {supportCircle: [], documentExamples: [], connections: []};
const homeRoomQueues = {velocity: [], leverage: []};
let workspaceReturnTarget = 'home';

const hearthPacketCompletenessRegistry = {
  navigation_packet: {
    requiredLayers: ['witnessing_root','active_user','val_os_rules','navigation_context'],
    sourceWeb: ['current_route','return_target','source_receipt'],
    graphLinks: ['none'],
    requiredVariables: ['{{teach_val.reviewed_memory}}','{{onboarding.first_understanding}}','{{user.preferences}}','{{val.do_not_do}}']
  },
  active_context_packet: {
    requiredLayers: ['witnessing_root','active_surface','active_entity','val_os_rules'],
    sourceWeb: ['current_workspace','return_target','opened_source_receipts'],
    graphLinks: ['current_relationship','current_project','current_calendar_event','current_email_thread'],
    requiredVariables: ['{{teach_val.reviewed_memory}}','{{onboarding.first_understanding}}','{{evidence.current_item}}','{{val.review_only_mode}}']
  },
  workspace_seed_packet: {
    requiredLayers: ['witnessing_root','active_surface','active_workspace','allowed_actions'],
    sourceWeb: ['workspace_seed','visible_recommendation','source_receipt'],
    graphLinks: ['current_relationship','current_project','current_email_thread','current_calendar_event'],
    requiredVariables: ['{{teach_val.reviewed_memory}}','{{onboarding.first_understanding}}','{{evidence.current_item}}','{{rules.val_os.behavior_packet}}']
  },
  source_navigation_packet: {
    requiredLayers: ['witnessing_root','active_source','source_of_source','val_os_rules'],
    sourceWeb: ['source_type','source_id','source_url','source_receipt'],
    graphLinks: ['source_relationships','source_projects','source_calendar_events','source_email_threads','source_transcripts'],
    requiredVariables: ['{{evidence.current_item}}','{{evidence.current_item.source_type}}','{{evidence.current_item.source_id}}','{{val.external_action_allowed}}']
  },
  home_state_packet: {
    requiredLayers: ['witnessing_root','prototype_state','val_os_rules'],
    sourceWeb: ['display_state','session_state'],
    graphLinks: ['none'],
    requiredVariables: ['{{onboarding.first_understanding}}','{{user.current_capacity_context}}','{{val.review_only_mode}}']
  },
  home_presence_packet: {
    requiredLayers: ['witnessing_root','daily_witness','capacity_context','val_os_rules'],
    sourceWeb: ['homepage_context_packet','daily_witness_internal_understanding','source_receipts'],
    graphLinks: ['calendar.today','recent_transcripts','emails.thread.current','tasks.open','projects.active','relationships.list'],
    requiredVariables: ['{{teach_val.reviewed_memory}}','{{onboarding.first_understanding}}','{{calendar.today}}','{{recent_transcripts.capacity_and_tone_context}}','{{emails.thread.current.summary}}','{{tasks.open}}']
  },
  home_session_packet: {
    requiredLayers: ['witnessing_root','session_state','val_os_rules'],
    sourceWeb: ['browser_session','held_context_marks'],
    graphLinks: ['current_workspace','current_room'],
    requiredVariables: ['{{user.id}}','{{val.review_only_mode}}','{{rules.val_os.behavior_packet}}']
  },
  timeline_packet: {
    requiredLayers: ['witnessing_root','calendar','transcripts','emails','tasks','relationships','projects','val_os_rules'],
    sourceWeb: ['calendar_event','attendee_resolution','meeting_source_confidence','source_receipts'],
    graphLinks: ['calendar.current_event.relationship_intelligence','calendar.current_event.internal_context','calendar.current_event.follow_up_preparation','recent_transcripts.open_loops','emails.thread.current','tasks.open'],
    requiredVariables: ['{{teach_val.reviewed_memory}}','{{calendar.today}}','{{calendar.upcoming}}','{{calendar.current_event.attendee_resolution}}','{{calendar.current_event.internal_context}}','{{recent_transcripts.open_loops}}','{{emails.thread.current.summary}}','{{tasks.open}}']
  },
  cowork_packet: {
    requiredLayers: ['witnessing_root','active_workspace','active_source','allowed_actions','val_os_rules'],
    sourceWeb: ['selected_workspace','visible_context','source_receipts'],
    graphLinks: ['current_relationship','current_project','current_email_thread','current_calendar_event','current_transcript','current_document'],
    requiredVariables: ['{{teach_val.reviewed_memory}}','{{onboarding.first_understanding}}','{{evidence.current_item}}','{{rules.val_os.behavior_packet}}','{{val.external_action_allowed}}']
  },
  val_os_packet: {
    requiredLayers: ['witnessing_root','teach_val','onboarding','connections','val_os_rules','approval_gates'],
    sourceWeb: ['witnessing_session','teach_val_imports','connected_source_readiness','behavior_packet_receipts'],
    graphLinks: ['important_people.list','projects.active','relationships.list','emails.thread.current','calendar.today','recent_transcripts.relationship_updates','tasks.open'],
    requiredVariables: ['{{teach_val.reviewed_memory}}','{{teach_val.context_imports}}','{{onboarding.first_understanding}}','{{onboarding.connected_source_readiness}}','{{rules.val_os.behavior_packet}}','{{rules.val_os.approval_packet}}']
  },
  relationship_packet: {
    requiredLayers: ['witnessing_root','relationship','projects','emails','calendar','transcripts','documents','commitments','val_os_rules'],
    sourceWeb: ['relationship_profile','relationship_timeline_events','evidence_observations','source_receipts','source_of_source'],
    graphLinks: ['projects.linked_to_relationship','emails.thread.current.relationship_temperature','calendar.current_event.relationship_intelligence','recent_transcripts.relationship_updates','documents.linked_to_relationship','tasks.open'],
    requiredVariables: ['{{teach_val.reviewed_memory}}','{{onboarding.first_understanding}}','{{relationships.current}}','{{relationships.current.source_receipts}}','{{relationships.current.current_thread_history}}','{{projects.linked_to_relationship}}','{{emails.thread.current.summary}}','{{calendar.relevant_events}}','{{recent_transcripts.relationship_updates}}','{{documents.linked_to_relationship}}','{{tasks.open}}']
  },
  project_packet: {
    requiredLayers: ['witnessing_root','project','relationships','emails','calendar','transcripts','documents','commitments','prepared_work','val_os_rules'],
    sourceWeb: ['project_profile','project_source','evidence_observations','source_reviews','source_of_source'],
    graphLinks: ['relationships.moving_project','relationships.linked_to_project','emails.current.project_match','calendar.relevant_events','recent_transcripts.open_loops','documents.linked_to_project','tasks.open','drafts.current'],
    requiredVariables: ['{{teach_val.reviewed_memory}}','{{onboarding.first_understanding}}','{{projects.current}}','{{projects.current.blockers}}','{{projects.current.momentum}}','{{relationships.moving_project}}','{{emails.current.project_match}}','{{calendar.relevant_events}}','{{recent_transcripts.open_loops}}','{{documents.linked_to_project}}','{{tasks.open}}']
  },
  home_source_packet: {
    requiredLayers: ['witnessing_root','home_card','selected_source','source_of_source','relationships','projects','emails','calendar','transcripts','tasks','val_os_rules'],
    sourceWeb: ['home.card.current','home.card.sourceItem','home.card.sourceRefs','source_receipts','source_confidence'],
    graphLinks: ['source_relationships','source_projects','source_email_threads','source_calendar_events','source_transcripts','source_tasks','prepared_work'],
    requiredVariables: ['{{home.card.current}}','{{home.card.sourceItem}}','{{home.card.sourceType}}','{{home.card.sourceId}}','{{home.card.sourceRefs}}','{{teach_val.reviewed_memory}}','{{onboarding.first_understanding}}','{{val.confidence}}','{{val.uncertainty}}']
  },
  source_display_packet: {
    requiredLayers: ['selected_source','source_receipt'],
    sourceWeb: ['source_type','source_id','source_summary'],
    graphLinks: ['none'],
    requiredVariables: ['{{evidence.current_item.source_type}}','{{evidence.current_item.source_id}}','{{evidence.current_item.source_quote}}']
  },
  drawer_index_packet: {
    requiredLayers: ['witnessing_root','drawer_index','source_counts','val_os_rules'],
    sourceWeb: ['drawer_state','connected_source_readiness'],
    graphLinks: ['relationships.list','projects.active','calendar.today','emails.thread.current','tasks.open','documents.current'],
    requiredVariables: ['{{onboarding.connected_source_readiness}}','{{relationships.list}}','{{projects.active}}','{{calendar.today}}','{{tasks.open}}']
  },
  email_packet: {
    requiredLayers: ['witnessing_root','email','thread','relationship','project','calendar','transcripts','commitments','drafts','approval_gates','val_os_rules'],
    sourceWeb: ['email_message','email_thread','sender_resolution','source_receipts','source_of_source'],
    graphLinks: ['emails.current.relationship_match','emails.current.project_match','emails.current.commitments','emails.thread.current.messages','calendar.relevant_events','recent_transcripts.relationship_updates','tasks.open','drafts.current'],
    requiredVariables: ['{{teach_val.reviewed_memory}}','{{emails.current}}','{{emails.thread.current.messages}}','{{emails.thread.current.summary}}','{{emails.current.relationship_match}}','{{emails.current.project_match}}','{{emails.current.commitments}}','{{relationships.current}}','{{projects.current}}','{{calendar.relevant_events}}','{{tasks.open}}','{{drafts.current}}']
  },
  commitment_packet: {
    requiredLayers: ['witnessing_root','commitment','tasks','emails','calendar','transcripts','relationships','projects','approval_gates','val_os_rules'],
    sourceWeb: ['task_record','originating_source','source_receipts','due_date_basis'],
    graphLinks: ['tasks.open','emails.current.commitments','calendar.relevant_events','recent_transcripts.open_loops','relationships.current','projects.current'],
    requiredVariables: ['{{tasks.open}}','{{emails.current.commitments}}','{{calendar.relevant_events}}','{{recent_transcripts.open_loops}}','{{relationships.current}}','{{projects.current}}','{{val.external_action_allowed}}']
  },
  document_packet: {
    requiredLayers: ['witnessing_root','document','relationships','projects','emails','calendar','transcripts','approval_gates','val_os_rules'],
    sourceWeb: ['document_source','document_links','source_receipts'],
    graphLinks: ['documents.linked_to_relationship','documents.linked_to_project','relationships.current','projects.current','emails.thread.current','recent_transcripts.open_loops'],
    requiredVariables: ['{{documents.current}}','{{documents.linked_to_relationship}}','{{documents.linked_to_project}}','{{relationships.current}}','{{projects.current}}','{{emails.thread.current.summary}}','{{recent_transcripts.open_loops}}']
  },
  lead_intelligence_packet: {
    requiredLayers: ['witnessing_root','lead_source','relationship','project','approval_gates','val_os_rules'],
    sourceWeb: ['scraper_criteria','preview_rows','approve_or_hold_state','source_receipts'],
    graphLinks: ['relationships.list','projects.active','crm.contacts','crm.opportunities','source_reviews.pending'],
    requiredVariables: ['{{relationships.list}}','{{projects.active}}','{{crm.contacts}}','{{crm.opportunities}}','{{source_reviews.pending}}','{{val.external_action_allowed}}']
  },
  workflow_scoped_packet: {
    requiredLayers: ['witnessing_root','active_workflow','active_source','allowed_actions','approval_gates','val_os_rules'],
    sourceWeb: ['workflow_action','workflow_source','source_receipts'],
    graphLinks: ['current_relationship','current_project','current_email_thread','current_calendar_event','current_transcript','current_document','tasks.open'],
    requiredVariables: ['{{teach_val.reviewed_memory}}','{{event.type}}','{{evidence.current_item}}','{{rules.val_os.behavior_packet}}','{{val.external_action_allowed}}']
  },
  user_text_field_packet: {
    requiredLayers: ['user_input','witnessing_root','val_os_rules'],
    sourceWeb: ['typed_text','field_context'],
    graphLinks: ['active_workspace'],
    requiredVariables: ['{{user.communication_style}}','{{user.do_not_sound_like}}','{{val.do_not_do}}']
  }
};

const hearthClickContractRegistry = [
  {selector:'.val-mark', contract:'nav.val_home', packet:'navigation_packet', rule:'VAL home navigation rule', actions:'Return to canonical VAL dashboard shell', never:'Do not alter source data or memory'},
  {selector:'.return-button,.close-calendar-button,.close-val-detail,.close-document-detail,.close-relationship-detail,.close-project-detail,.close-timeline-detail,.close-correspondence-detail,.close-commitment-detail,.close-source-detail', contract:'nav.close_context', packet:'active_context_packet', rule:'Close active context without mutation', actions:'Close active card/detail and return to prior Hearth context', never:'Do not save, send, import, or mutate while closing'},
  {selector:'.workspace-card button,.workspace-actions button:not([data-workflow-action])', contract:'workspace.static_action', packet:'workspace_seed_packet', rule:'Static workspace action rule', actions:'Open the matching review/approval/teaching workspace only', never:'Do not execute external action from static demo card'},
  {selector:'.source-action', contract:'nav.source_action', packet:'source_navigation_packet', rule:'Source navigation rule', actions:'Open the named source surface only', never:'Do not mutate source data or infer approval from navigation'},
  {selector:'[data-state-option]', contract:'home.state_switch', packet:'home_state_packet', rule:'Prototype state display rule', actions:'Switch visual Home state', never:'Do not run intelligence or mutate memory'},
  {selector:'.lean-button', contract:'home.why_today', packet:'home_presence_packet', rule:'Daily witness explanation rule', actions:'Open or close evidence panel', never:'Do not create tasks or drafts'},
  {selector:'.fresh-desk-button', contract:'home.fresh_desk', packet:'home_session_packet', rule:'Session room-attendance reset rule', actions:'Clear session held marks', never:'Do not clear memory or source records'},
  {selector:'.next-meeting-card,.calendar-tab,.agenda-item,[data-calendar-event-index]', contract:'timeline.calendar_panel', packet:'timeline_packet', rule:'Calendar sidebar and meeting prep rule', actions:'Open calendar or meeting prep', never:'Do not create or update calendar events'},
  {selector:'.cowork-notebook', contract:'home.cowork_companion', packet:'cowork_packet', rule:'Co-Work prompt suite', actions:'Think with VAL, Draft with VAL', never:'Do not send, save memory, or mutate external systems'},
  {selector:'.teach-pen', contract:'home.teach_val_companion', packet:'val_os_packet', rule:'Teach VAL extraction/review prompt', actions:'Review what I taught VAL', never:'Do not save durable memory without review'},
  {selector:'.linkedin-widget,[data-linkedin-copy],[data-linkedin-link]', contract:'home.linkedin_visibility', packet:'relationship_packet', rule:'LinkedIn visibility preparation rule', actions:'Copy manually, open source link', never:'Do not post to LinkedIn'},
  {selector:'.living-room .room-action[data-open-room="velocity"]', contract:'home.velocity_card', packet:'home_source_packet', rule:'Homepage Momentum/Velocity observer workspace rule', actions:'Open source, review evidence, source-specific action', never:'Do not blend unrelated Home items'},
  {selector:'.living-room .room-action[data-open-room="alignment"]', contract:'home.alignment_card', packet:'home_source_packet', rule:'Highest Leverage / Alignment judge rule', actions:'Open source, draft reply/create task for email, review evidence', never:'Do not open a different relationship/project than the card named'},
  {selector:'.living-room .room-action[data-open-room="leverage"]', contract:'home.leverage_card', packet:'home_source_packet', rule:'Ready For You / Prepared Work prompt suite', actions:'Open prepared draft, refine prepared work, approve prepared work', never:'Do not expose queue rows as extra CTAs'},
  {selector:'[data-home-room-source]', contract:'home.source_row', packet:'source_display_packet', rule:'Source receipt display rule', actions:'None; evidence row only', never:'Do not act from source rows'},
  {selector:'[data-home-action]', contract:'home.dynamic_action', packet:'home_source_packet', rule:'Home action posture or source-specific action rule', actions:'Only actions listed in active workspace', never:'Do not use stale active source'},
  {selector:'.drawer-pull,.close-all-drawers', contract:'drawer.index', packet:'drawer_index_packet', rule:'Drawer retrieval rule', actions:'Open/close drawer tray', never:'Do not load unrelated drawer detail panels'},
  {selector:'.relationship-drawer-link,[data-relationship-profile],[data-relationship-open-profile],[data-relationship-state-filter],[data-relationship-action],[data-relationship-pending-temperature-review],[data-relationship-search],[data-relationship-sort]', contract:'drawer.relationships', packet:'relationship_packet', rule:'Relationship Dossier understanding prompt suite', actions:'Open brief, filter, search, sort, scoped relationship actions', never:'Do not default to CRM dashboard instead of dossier'},
  {selector:'.project-drawer-link,[data-project-open-profile],[data-project-action],[data-project-create-toggle],[data-project-create-cancel],[data-project-review-update]', contract:'drawer.projects', packet:'project_packet', rule:'Project understanding prompt suite', actions:'Open file, Co-Work, ask priority, show alternatives, review source learning', never:'Do not create or mutate project records without explicit flow'},
  {selector:'.timeline-drawer-link,[data-timeline-action],[data-timeline-match-review],[data-timeline-match-accept],[data-timeline-review-action]', contract:'drawer.timeline', packet:'timeline_packet', rule:'Calendar/transcript/task observer rules', actions:'Co-Work and review timeline proposals', never:'Do not create notes or tasks without review'},
  {selector:'.correspondence-drawer-link,[data-correspondence-item],[data-correspondence-action]', contract:'drawer.executive_inbox', packet:'email_packet', rule:'Executive Inbox classification/draft prompt suite', actions:'Co-Work, review, prepare draft, tighten draft, send packet', never:'Do not send directly from drawer click'},
  {selector:'.commitment-drawer-link,[data-commitment-item],[data-commitment-filter],[data-commitment-action]', contract:'drawer.commitments', packet:'commitment_packet', rule:'Commitment observer/task support rules', actions:'Co-Work, draft email, create task, schedule, status, show source', never:'Do not send; status changes need visible user action'},
  {selector:'.document-drawer-link,[data-document-item],[data-document-action],[data-document-search],[data-document-relationship-filter],[data-document-project-filter]', contract:'drawer.documents', packet:'document_packet', rule:'Document observer/reference prompt suite', actions:'Co-Work, present, update, send packet, open source, link context', never:'Do not send or update live document without approval gate'},
  {selector:'.source-drawer-link,[data-open-scraper],[data-preview-choice]', contract:'drawer.lead_intelligence', packet:'lead_intelligence_packet', rule:'Lead Intelligence scraper prompt suite', actions:'Run preview, approve/hold, import approved only', never:'Do not import unreviewed leads'},
  {selector:'.val-drawer-link,[data-val-action],[data-val-witnessing-file-input],[data-google-oauth]', contract:'drawer.val_os', packet:'val_os_packet', rule:'VAL OS / Teach VAL / connections prompt suite', actions:'Witnessing Session, connections, review OS, upload witnessing files', never:'Do not save durable memory or fake connected state without review/API proof'},
  {selector:'[data-workflow-action]', contract:'shared.workflow_action', packet:'workflow_scoped_packet', rule:'handleWorkflowAction dispatch rule', actions:'Only workflow-specific actions', never:'Do not dispatch unknown workflow silently'},
  {selector:'[data-workspace-tool],[data-workspace-file-input],[data-workspace-prompt-copy]', contract:'shared.workspace_tools', packet:'cowork_packet', rule:'Workspace input tool rule', actions:'Voice, upload, image request, prompt copy', never:'Do not transmit externally without approval'},
  {selector:'.val-autocorrect button', contract:'shared.autocorrect', packet:'user_text_field_packet', rule:'Spelling suggestion rule', actions:'Replace misspelled word after click', never:'Do not silently rewrite'}
];

function applyHearthClickContracts(root = document){
  hearthClickContractRegistry.forEach((entry) => {
    const nodes = [];
    if(root.nodeType === 1 && root.matches(entry.selector)) nodes.push(root);
    root.querySelectorAll(entry.selector).forEach((node) => nodes.push(node));
    nodes.forEach((node) => {
      if(node.dataset.valClickContract) return;
      node.dataset.valClickContract = entry.contract;
      if(!node.dataset.valVariablePacket) node.dataset.valVariablePacket = entry.packet;
      node.dataset.valPromptRule = entry.rule;
      node.dataset.valAllowedActions = entry.actions;
      node.dataset.valNeverDo = entry.never;
      const packetContract = hearthPacketCompletenessRegistry[entry.packet] || {};
      node.dataset.valRequiredLayers = (packetContract.requiredLayers || []).join(',');
      node.dataset.valSourceWeb = (packetContract.sourceWeb || []).join(',');
      node.dataset.valGraphLinks = (packetContract.graphLinks || []).join(',');
      node.dataset.valRequiredVariables = (packetContract.requiredVariables || []).join(',');
    });
  });
}

function observeHearthClickContracts(){
  applyHearthClickContracts(document);
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if(node.nodeType === 1) applyHearthClickContracts(node);
      });
    });
  });
  observer.observe(document.body, {childList:true, subtree:true});
}

const linkedinVisibilityItems = [
  {
    contact: 'Michele',
    postPreview: 'Shared a reflection on sustaining creative momentum without overextending.',
    whyItMatters: 'This is a natural support moment tied to the chapter feedback relationship.',
    draftComment: 'This is such a clear framing of momentum as something protected, not forced. I especially appreciate the part about staying close to the work without letting it consume the whole day.',
    postUrl: 'https://www.linkedin.com/feed/'
  },
  {
    contact: 'Aric',
    postPreview: 'Posted about turning early ideas into visible traction before the strategy is perfect.',
    whyItMatters: 'A thoughtful comment reinforces the partnership lane without creating a new ask.',
    draftComment: 'This is exactly the kind of early visible momentum that helps people believe in a direction before every detail is settled. Strong signal here.',
    postUrl: 'https://www.linkedin.com/feed/'
  },
  {
    contact: 'Allen',
    postPreview: 'Shared assessment notes about founder clarity and operational follow-through.',
    whyItMatters: 'This connects to the assessment notes already waiting in Velocity.',
    draftComment: 'The distinction between clarity and follow-through is so useful. The best systems make the next right action easier to see and easier to take.',
    postUrl: 'https://www.linkedin.com/feed/'
  },
  {
    contact: 'Lindsey',
    postPreview: 'Posted a client success story that fits the current relationship-support circle.',
    whyItMatters: 'Supporting wins keeps the relationship warm without asking for anything.',
    draftComment: 'Love seeing this result. The care in the work really comes through here, and it is so good to see that effort becoming visible.',
    postUrl: 'https://www.linkedin.com/feed/'
  },
  {
    contact: 'Greg',
    postPreview: 'Shared a short note about proposal clarity and decision timing.',
    whyItMatters: 'A light public comment can support the relationship while the proposal stays private.',
    draftComment: 'This is a helpful reminder that clear timing often matters as much as clear language. The decision gets easier when the next step is explicit.',
    postUrl: 'https://www.linkedin.com/feed/'
  },
  {
    contact: 'Priya',
    postPreview: 'Posted about community health partnerships and practical implementation.',
    whyItMatters: 'This supports the HealthBridge context without opening a direct follow-up thread.',
    draftComment: 'This is such a grounded view of partnership. The practical implementation lens is what makes the idea feel real.',
    postUrl: 'https://www.linkedin.com/feed/'
  },
  {
    contact: 'D3Day',
    postPreview: 'Announced a programming update that could use a warm visibility lift.',
    whyItMatters: 'This supports current project visibility while keeping publishing manual.',
    draftComment: 'This is exciting to see coming together. The programming update makes the event feel even more concrete and useful.',
    postUrl: 'https://www.linkedin.com/feed/'
  }
];

const meetingPrep = {
  lens: 'Meeting Prep',
  title: 'Acme proposal review is already prepared.',
  meaning: 'This conversation is the one moment today where preparation can protect your judgment.',
  understanding: [
    'VAL reviewed the Acme relationship history and current proposal context.',
    'Outscraper signals are queued for company and web context.',
    'Apollo research is queued for people and role context.'
  ],
  recommendation: 'I would scan the decision points, review the open concern, and then walk into the meeting with the proposal language already in front of you.',
  actions: ['Open meeting prep', 'Open Acme in GHL', 'Run Apollo refresh', 'Run Outscraper refresh'],
  event: {
    id: 'hearth-acme-proposal-review',
    title: 'Acme proposal review',
    startTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    source: 'hearth_prototype',
    attendees: [
      {name: 'Greg', email: 'greg@example.com'},
      {name: 'Jessa', email: 'jessa@example.com'}
    ],
    description: 'Review proposal language, CRM context, Apollo research, and Outscraper signals before the Acme conversation.'
  }
};

const coworkSession = {
  lens: 'Co-Work with VAL',
  title: 'What would you like to think through together?',
  meaning: 'This is the open Co-Work space: a place for strategy, drafting, decisions, and working out loud with VAL.',
  understanding: [
    'VAL can use the current Home context as a starting point.',
    'The conversation can become a draft, decision, project note, or teaching moment.',
    'Nothing here needs to become a task unless you choose that.'
  ],
  recommendation: 'I would start with the one thought you do not want to carry alone, then let VAL shape the next useful artifact.',
  actions: ['Start co-working', 'Draft with VAL', 'Think through a decision', 'Teach VAL']
};

const teachValSession = {
  lens: 'Teach VAL',
  title: 'Help VAL understand your judgment.',
  meaning: 'This is where you tune what VAL notices, protects, prepares, and leaves quiet.',
  understanding: [
    "This wasn't useful.",
    'Show me more like this.',
    'I would have handled this differently.',
    'You understood correctly.'
  ],
  recommendation: 'Choose the sentence closest to what you mean. VAL should learn your judgment, not just your preferences.',
  actions: ["This wasn't useful", 'Show me more like this', 'I would have handled this differently', 'You understood correctly']
};

const localCorrespondenceItems = [
  {
    id: 'local-correspondence-frisson',
    title: 'Frisson follow-up draft',
    status: 'ready_for_review',
    summary: 'A relationship-sensitive follow-up is shaped and waiting for review.',
    whyNow: 'The conversation can move forward if the reply stays specific and low-pressure.',
    context: 'Project: Frisson · Relationship: Aric Soyring',
    prepared: 'VAL prepared draft language, source framing, and approval boundary.',
    needs: 'Review tone and confirm the next ask before anything is sent.',
    draftBody: 'Hi Aric,\n\nI pulled the Frisson thread into a cleaner next step. The useful move seems to be narrowing the partner path before we add any new work.\n\nIf that still feels right, I can send over the short version for review.',
    recipientEmail: 'aric@example.com',
    provider: 'gmail',
    evidence: ['Transcript: partner path should stay narrow.', 'Relationship file: warm strategic context.'],
    source: 'local_preview',
    noExternalAction: true
  },
  {
    id: 'local-correspondence-greg',
    title: 'Proposal reply needs context',
    status: 'needs_context',
    summary: 'VAL can hold the thread warm, but pricing and terms need human confirmation.',
    whyNow: 'The reply matters because silence could turn a clear proposal step into ambiguity.',
    context: 'Relationship: Greg Niesen · Project: Acme proposal',
    prepared: 'VAL prepared a holding reply and marked commercial specifics as missing.',
    needs: 'Confirm scope, pricing, and terms before a final reply is approved.',
    draftBody: 'Hi Greg,\n\nI saw this and want to answer it carefully. I need to confirm the exact scope and terms before I give you the wrong answer.\n\nI’ll come back with the clean version once I have that in front of me.',
    recipientEmail: 'greg@example.com',
    provider: 'gmail',
    evidence: ['Email: proposal question is waiting.', 'Draft readiness: commercial_or_legal_specifics missing.'],
    source: 'local_preview',
    noExternalAction: true
  }
];

const localCommitmentItems = [
  {
    id: 'local-commitment-michele-feedback',
    title: 'Send Michele chapter feedback',
    description: 'Jessa owes Michele focused chapter feedback before the next editorial pass.',
    owner_type: 'user',
    owner_name: 'Jessa',
    counterparty_name: 'Michele',
    source_type: 'transcript',
    source_title: 'Michele book review',
    evidence_quote: 'I will send Michele chapter feedback before the next pass.',
    evidence_summary: 'A transcript created an explicit follow-through promise.',
    status: 'waiting',
    priority: 'high',
    risk_level: 'medium',
    due_at: '',
    next_action: 'Draft the feedback note or create a task with source context.',
    suggested_action_type: 'draft_email',
    confidence_score: .72
  },
  {
    id: 'local-commitment-greg-approval',
    title: 'Greg proposal approval',
    description: 'Greg appears to owe proposal approval after review.',
    owner_type: 'contact',
    owner_name: 'Greg',
    counterparty_name: 'Jessa',
    source_type: 'email',
    source_title: 'Proposal approval thread',
    evidence_quote: 'We will approve this after legal reviews it.',
    evidence_summary: 'Email thread contains a waiting-on-other commitment.',
    status: 'needs_resolution',
    priority: 'high',
    risk_level: 'high',
    due_at: '',
    next_action: 'Resolve the contact, then draft a friendly follow-up.',
    suggested_action_type: 'draft_email',
    confidence_score: .68
  }
];

const localDocumentItems = [
  {
    id: 'local-document-frisson-proposal',
    title: 'Frisson partner path proposal',
    type: 'proposal_draft',
    status: 'draft',
    relationship: 'Aric Soyring',
    project: 'Frisson',
    source: 'VAL-created draft',
    summary: 'Prepared proposal language for the Frisson partner path.',
    referenceUse: 'Use when briefing Aric, Frisson, partner strategy, or follow-up drafts.',
    needs: 'Review scope, claims, and recipient before sending externally.',
    body: 'Proposal: Frisson partner path\n\nPurpose\nNarrow the partner path before expanding delivery work.\n\nRecommended scope\nClarify partner positioning, immediate constraints, and the next review decision.\n\nOpen questions\nConfirm ownership, timeline, and external-facing language before use.',
    recipientEmail: 'aric@example.com',
    sourceUrl: '',
    origin: 'local_preview',
    noExternalAction: true
  },
  {
    id: 'local-document-acme-sow',
    title: 'Acme implementation SOW',
    type: 'agreement_draft',
    status: 'needs_context',
    relationship: 'Greg Niesen',
    project: 'Acme proposal',
    source: 'Transcript prepared work',
    summary: 'Statement of work shell created from meeting evidence, with commercial terms unresolved.',
    referenceUse: 'Use when judging Acme proposal commitments, pricing questions, and next-step emails.',
    needs: 'Confirm scope, pricing, terms, and authority before sending or updating a live document.',
    body: 'Scope: Acme implementation\n\nParties\nTo be confirmed.\n\nScope\nImplementation support, dashboard review, and proposal language refinement.\n\nTerms requiring human review\nPricing, contract authority, legal language, and timeline.',
    recipientEmail: 'greg@example.com',
    sourceUrl: '',
    origin: 'local_preview',
    noExternalAction: true
  }
];

const relationshipProfiles = {
  aric: {
    query: {name: 'Aric Soyring', email: 'aric@example.com', targetId: 'aric-soyring'},
    name: 'Aric Soyring',
    initials: 'AS',
    role: 'Strategic Partner',
    company: 'Acme Ventures',
    temperature: 'Warm',
    temperatureScore: 82,
    trajectory: 'Growing',
    relationshipState: 'strategic',
    relationshipStateLabel: 'Strategic',
    sourceEvidence: 'GHL contact, Frisson notes, and partner-path context all point to active leverage.',
    confidence: 0.82,
    lastChangedAt: '2026-07-04T09:30:00-04:00',
    signal: 'Frisson and partner momentum',
    identity: 'Entrepreneur · Strategist · Idea to momentum',
    contact: 'Acme Ventures · Minneapolis, MN · aric@acmeventures.com',
    wisdom: 'Protect this relationship. Aric consistently creates momentum where you naturally create systems.',
    evidence: 'Recent conversations moved Frisson forward, opened two partner paths, and left one proposal review waiting.',
    patterns: 'The relationship is shifting from collaborator to strategic thought partner.',
    meaning: 'Aric creates leverage beyond individual projects by turning ideas into visible momentum.',
    certainty: 'You know why Aric matters, what changed recently, and why your next action should preserve trust rather than create urgency.',
    linkedinSignal: 'Recent LinkedIn activity is worth watching for a thoughtful comment before the next Frisson follow-up.',
    sourceReceipts: 'GHL contact resolved · LinkedIn watching · Apollo available · Outscraper available',
    introReview: {
      whoNeedsThisPerson: [
        {
          name: 'HopeMakers Foundation',
          reason: 'They need an operator who can turn a good community idea into a visible pilot.',
          confidence: 0.78,
          contactId: 'crm_hopemakers'
        }
      ],
      whoThisPersonNeeds: [
        {
          name: 'Greg Niesen',
          reason: 'Greg can give Aric the proposal clarity he needs without turning it into a larger project.',
          confidence: 0.74,
          contactId: 'crm_greg'
        }
      ]
    },
    href: './dashboard.html?view=relationships&targetType=person&targetId=aric-soyring'
  },
  greg: {
    query: {name: 'Greg Niesen', email: 'greg@example.com', targetId: 'greg-niesen'},
    name: 'Greg Niesen',
    initials: 'GN',
    role: 'Proposal Decision Partner',
    company: 'Acme Ventures',
    temperature: 'Active',
    temperatureScore: 68,
    trajectory: 'Needs clarity',
    relationshipState: 'waiting',
    relationshipStateLabel: 'Waiting',
    sourceEvidence: 'Direct proposal reply is the strongest current signal; LinkedIn is quiet.',
    confidence: 0.74,
    lastChangedAt: '2026-07-05T08:15:00-04:00',
    signal: 'Reply waiting; proposal can move again',
    identity: 'Client sponsor · Practical operator · Decision clarity',
    contact: 'Acme Ventures · greg@example.com · active proposal thread',
    wisdom: 'Do not let silence become ambiguity. Greg responds best when the next decision is named plainly.',
    evidence: 'Greg answered the proposal question that had been holding the next step in place.',
    patterns: 'The relationship is becoming more concrete: fewer broad ideas, more decisions that move work forward.',
    meaning: 'Greg can unlock the proposal path if the follow-up stays precise and does not create extra work.',
    certainty: 'You know the next move is review, not persuasion. The relationship needs clarity more than urgency.',
    linkedinSignal: 'LinkedIn is quiet; the stronger signal is the direct proposal reply already in the relationship file.',
    sourceReceipts: 'GHL contact resolved · LinkedIn watching · Apollo available · Outscraper watching',
    introReview: {
      whoNeedsThisPerson: [
        {
          name: 'Aric Soyring',
          reason: 'Aric needs Greg’s practical decision clarity before the proposal moves forward.',
          confidence: 0.74,
          contactId: 'crm_aric'
        }
      ],
      whoThisPersonNeeds: [
        {
          name: 'Lindsey Wincek',
          reason: 'Lindsey can help Greg preserve relationship trust while narrowing the next decision.',
          confidence: 0.68,
          contactId: 'crm_lindsey'
        }
      ]
    },
    href: './dashboard.html?view=relationships&targetType=person&targetId=greg-niesen'
  },
  lindsey: {
    query: {name: 'Lindsey Wincek', email: 'lindsey@example.com', targetId: 'lindsey-wincek'},
    name: 'Lindsey Wincek',
    initials: 'LW',
    role: 'Trust Holder',
    company: 'Partner Network',
    temperature: 'Healthy',
    temperatureScore: 74,
    trajectory: 'Protect',
    relationshipState: 'warm',
    relationshipStateLabel: 'Warm',
    sourceEvidence: 'Recurring trust notes and follow-up timing point to a warm, care-dependent relationship.',
    confidence: 0.77,
    lastChangedAt: '2026-07-03T13:10:00-04:00',
    signal: 'Follow-up timing matters',
    identity: 'Collaborator · Relationship memory · Follow-through',
    contact: 'Partner network · lindsey@example.com · warm thread',
    wisdom: 'Consistency matters more than speed here. Lindsey notices whether promises are carried carefully.',
    evidence: 'Recent notes show recurring trust, shared context, and one follow-up that should not be rushed.',
    patterns: 'The relationship is deepening through reliability rather than volume.',
    meaning: 'Lindsey helps protect reputation and continuity across work that depends on human trust.',
    certainty: 'You know this relationship should be handled gently, with fewer promises and stronger follow-through.',
    linkedinSignal: 'A recent network post may be a natural place to reinforce shared trust without creating a new ask.',
    sourceReceipts: 'GHL contact resolved · LinkedIn watching · Apollo watching · Outscraper available',
    href: './dashboard.html?view=relationships&targetType=person&targetId=lindsey-wincek'
  }
};

const relationshipTemperatureModel = {
  needs_attention: {
    label: 'Needs attention',
    scoreRange: [0, 54],
    meaning: 'Trust, clarity, or follow-through needs executive care before action.',
    observers: ['GHL/CRM', 'calendar', 'email', 'transcripts', 'Teach VAL']
  },
  warm: {
    label: 'Warm',
    scoreRange: [55, 79],
    meaning: 'The relationship is healthy enough for thoughtful continuation.',
    observers: ['GHL/CRM', 'LinkedIn', 'calendar', 'email', 'Teach VAL']
  },
  strategic: {
    label: 'Strategic',
    scoreRange: [80, 100],
    meaning: 'This relationship creates meaningful leverage and should be handled deliberately.',
    observers: ['GHL/CRM', 'LinkedIn', 'Apollo', 'Outscraper', 'Teach VAL']
  },
  new: {
    label: 'New',
    scoreRange: [45, 70],
    meaning: 'Identity is known, but VAL needs more evidence before forming strong judgment.',
    observers: ['GHL/CRM', 'calendar', 'email']
  },
  waiting: {
    label: 'Waiting',
    scoreRange: [45, 75],
    meaning: 'A known loop is open; the next move should preserve clarity without creating pressure.',
    observers: ['GHL/CRM', 'email', 'calendar', 'Teach VAL']
  }
};

const projectProfiles = {
  frisson: {
    id: 'frisson',
    name: 'Frisson',
    initials: 'FR',
    status: 'Partner paths forming',
    signal: 'Relationships and lead intelligence are converging.',
    reality: 'Frisson has enough relationship and lead context to decide which path deserves the next executive move.',
    momentum: 'Visible movement',
    momentumEvidence: 'Relationship notes, partner candidates, and source material are converging around a few viable paths.',
    decision: 'Choose the next narrow move',
    decisionEvidence: 'The risk is turning a clear next move into broad planning. VAL should keep the decision small and inspectable.',
    nextMove: 'Review the strongest path',
    nextMoveEvidence: 'Open the relationship context and prepared material before adding new work.',
    sourceReceipts: 'Relationships · lead intelligence · prepared documents · decision notes',
    sourceDetails: {
      files: [],
      websiteSource: 'Lead intelligence sources and relationship notes are staged for review.',
      documents: 'Prepared documents are referenced, not uploaded in this local preview.',
      relationships: 'Partner candidates and warm relationship paths.',
      rawContext: 'Preview project context only.'
    },
    href: './dashboard.html?view=projects&projectId=frisson'
  },
  valCore: {
    id: 'val-core',
    name: 'VAL Core',
    initials: 'VC',
    status: 'Drawer system maturing',
    signal: 'Relationships is strong enough to become the model for adjacent drawers.',
    reality: 'The Hearth is moving drawer by drawer from navigation into lived user experience.',
    momentum: 'Steady interface deepening',
    momentumEvidence: 'Relationships now has canonical source checks, row-click loops, review states, and responsive density.',
    decision: 'Bring Projects up next',
    decisionEvidence: 'Projects is closest to Relationships because both depend on dossiers, source context, and careful next moves.',
    nextMove: 'Make Projects legible from the drawer',
    nextMoveEvidence: 'Start with a project index and a brief before adding live backend hydration.',
    sourceReceipts: 'Hearth prototype · CODEX current state · relationship drawer pattern',
    sourceDetails: {
      files: [],
      websiteSource: 'Local VAL Core source files and Hearth prototype work.',
      documents: 'CODEX current state and VAL architecture notes.',
      relationships: 'Relationship drawer is the model for this project drawer.',
      rawContext: 'Preview project context only.'
    },
    href: './dashboard.html?view=projects&projectId=val-core'
  },
  clientPipeline: {
    id: 'client-pipeline',
    name: 'Client Pipeline',
    initials: 'CP',
    status: 'Source review waiting',
    signal: 'Lead Intelligence can feed project momentum once review gates stay visible.',
    reality: 'Client growth work needs a calm bridge between source discovery and project decisions.',
    momentum: 'Ready to inspect',
    momentumEvidence: 'Scrapers can prepare reviewed candidates, but project judgment decides which work matters.',
    decision: 'Separate source action from project priority',
    decisionEvidence: 'A lead can be valid without becoming the next project move.',
    nextMove: 'Review approved leads against current projects',
    nextMoveEvidence: 'Use Lead Intelligence as source material, then decide priority in the Projects drawer.',
    sourceReceipts: 'Lead Intelligence · GHL duplicate checks · project notes',
    sourceDetails: {
      files: [],
      websiteSource: 'Lead Intelligence preview and duplicate-check sources.',
      documents: 'Project notes are referenced, not uploaded in this local preview.',
      relationships: 'Approved leads, GHL contact context, and project owner notes.',
      rawContext: 'Preview project context only.'
    },
    href: './dashboard.html?view=projects&projectId=client-pipeline'
  }
};

let relationshipIndexSearch = '';
let relationshipStateFilter = 'all';
let relationshipSortMode = 'attention';
let relationshipIndexProfiles = {};
let relationshipIndexLoaded = false;
let relationshipIndexRequest = null;
let relationshipIndexSourceLabel = 'Local preview';
let relationshipTeachMode = 'relationship';
let projectIndexProfiles = {};
let projectIndexLoaded = false;
let projectIndexRequest = null;
let projectIndexSourceLabel = 'Local project preview';

function updateRelationshipIndexSourceLabel(){
  if(!relationshipIndexSource) return;
  const count = Object.keys(relationshipIndexSourceProfiles()).length;
  relationshipIndexSource.textContent = relationshipIndexSourceLabel + ' · ' + count + ' ' + (count === 1 ? 'relationship' : 'relationships');
}

function defaultRelationshipSectionActions(name = 'this relationship'){
  return {
    identity:[
      {id:'open_full_file',label:'Open file',intent:'inspect',section:'identity',willDo:'Open the full relationship file.',willNotDo:'No external action will happen.'}
    ],
    evidence:[
      {id:'open_evidence',label:'Open evidence',intent:'inspect',section:'evidence',willDo:'Open source evidence connected to this relationship.',willNotDo:'VAL will not change records.'},
      {id:'create_task_from_loop',label:'Turn loop into task',intent:'commitment',section:'evidence',willDo:'Create a local VAL task from an open loop.',willNotDo:'VAL will not invite, email, or write to GHL.'}
    ],
    patterns:[
      {id:'ask_about_pattern',label:'Ask about pattern',intent:'understand',section:'patterns',prompt:'Explain what is changing in ' + name + ' using only the dossier evidence.'}
    ],
    meaning:[
      {id:'ask_why_matters',label:'Ask why it matters',intent:'understand',section:'meaning',prompt:'Explain why ' + name + ' matters to executive judgment right now.'}
    ],
    wisdom:[
      {id:'teach_wisdom',label:'Teach VAL',intent:'teach',section:'wisdom',willDo:'Open a teaching moment about the relationship wisdom.',willNotDo:'VAL will not save durable memory without review.'}
    ]
  };
}

const scraperWorkflows = {
  organizations: {
    lens: 'Lead Intelligence',
    setupTitle: 'Set the organization scrape before VAL begins.',
    setupMeaning: 'This is an intentional scrape. VAL should know the market, fit profile, result count, and CRM destination before it touches the sources.',
    setupUnderstanding: [
      'Lead set: Organizations / Non-Profits.',
      'Active pattern: focused preview, or a configured broad batch up to 200 when the client preset supports it.',
      'Safeguard: Level 1 discovery checks live GHL duplicates before enrichment or import.'
    ],
    setupRecommendation: 'I would start with a focused preview unless the client has a proven batch preset. Either way, VAL should show the preview before anything enters GHL.',
    criteria: {
      title: 'Organization scrape criteria',
      fields: [
        {label: 'Lead set', type: 'select', value: 'Organizations / Non-Profits', options: ['Organizations / Non-Profits', 'Mission-aligned companies', 'Community partners']},
        {label: 'Market', value: 'Tennessee and Southeast US'},
        {label: 'Preview count', type: 'number', value: '12'},
        {label: 'Minimum size', value: 'Evidence of active programs'},
        {label: 'Criteria', type: 'textarea', value: 'Find mission-aligned organizations with visible partnership readiness, active public programs, and enough contact evidence for review.'}
      ],
      destination: 'Frisson GHL pipeline / Organizations',
      sources: [
        ['Level 1 business discovery', 'Ready'],
        ['GHL duplicate check', 'Ready'],
        ['Level 2 enrichment', 'Ready'],
        ['Level 3 verification', 'Deferred']
      ]
    },
    previewTitle: 'The organization preview is ready for judgment.',
    previewMeaning: 'VAL has not imported anything. The review set is staged so the user can decide what belongs in GHL.',
    previewUnderstanding: [
      'Level 1 found viable organizations and filtered known GHL duplicates.',
      'Level 2 person and company enrichment is attached where available.',
      'Level 3 verification is deferred for broad batches and can run in 25-lead chunks after review.'
    ],
    previewRecommendation: 'Review the ranked set, run Level 3 only where it helps, then import approved records only.',
    verifiedTitle: 'Level 3 verification is attached where it matters.',
    verifiedMeaning: 'VAL verified contactability in a bounded pass. The workflow stays gateway-safe by reviewing a chunk at a time.',
    verifiedUnderstanding: [
      'Verification runs in chunks of up to 25 leads.',
      'Transient failures can be retried without losing the preview.',
      'The import decision still belongs to the user.'
    ],
    verifiedRecommendation: 'Import only the leads that are still worth adding after verification, then continue with the next focused batch if needed.',
    importedTitle: 'Approved organizations were sent to the pipeline.',
    importedMeaning: 'The CRM handoff is complete for the approved records only.',
    importedUnderstanding: [
      'Approved contacts were created or matched.',
      'Tags, source notes, lead type, automation tag, custom fields, and opportunity stage were applied.',
      'Duplicates were skipped or repaired instead of creating CRM noise.'
    ],
    importedRecommendation: 'Open the pipeline to inspect the new records, or run another focused scrape when the next market is clear.',
    previewLeads: [
      {
        name: 'Riverbend Community Foundation',
        type: 'Nonprofit organization',
        location: 'Nashville, TN',
        score: 'Strong fit',
        contact: 'Maya Chen, Executive Director',
        evidence: 'Public program expansion and active partnership page.'
      },
      {
        name: 'Northstar Youth Alliance',
        type: 'Youth services nonprofit',
        location: 'Franklin, TN',
        score: 'Possible fit',
        contact: 'Decision maker not confirmed',
        evidence: 'Mission fit is strong; contactability needs Level 3 verification.'
      },
      {
        name: 'Civic Pathways Network',
        type: 'Community development',
        location: 'Atlanta, GA',
        score: 'Highest priority',
        contact: 'Email available, phone not confirmed',
        evidence: 'Recent initiative matches Frisson partnership criteria.'
      }
    ]
  },
  partners: {
    lens: 'Lead Intelligence',
    setupTitle: 'Set the partner scrape before VAL begins.',
    setupMeaning: 'Partner scrapes should feel like opening a strategic file, not running a bulk import.',
    setupUnderstanding: [
      'Lead set: Partners.',
      'Criteria: partner type, geographic market, potential reach, and fit score.',
      'Safeguard: the strategic partner destination is locked before anything is pushed to GHL.'
    ],
    setupRecommendation: 'I would choose one partner type, keep the first preview small, and sort by potential reach before approving records.',
    criteria: {
      title: 'Partner scrape criteria',
      fields: [
        {label: 'Partner type', type: 'select', value: 'Strategic distribution partners', options: ['Strategic distribution partners', 'Professional associations', 'Payroll companies', 'HR consultants', 'Referral partners']},
        {label: 'Market', value: 'United States'},
        {label: 'Preview count', type: 'number', value: '12'},
        {label: 'Scoring', value: 'Potential Reach + Partnership Fit'},
        {label: 'Criteria', type: 'textarea', value: 'Find organizations that can distribute, recommend, introduce, or sell GOALL. Prefer recent public sources and at least two supporting URLs.'}
      ],
      destination: 'GOALL Strategic Partners / New Limitless Lead Added',
      sources: [
        ['Public source discovery', 'Ready'],
        ['GHL duplicate check', 'Ready'],
        ['Fit scoring', 'Ready'],
        ['Level 3 verification', 'Deferred']
      ]
    },
    previewTitle: 'The partner preview is ready for selection.',
    previewMeaning: 'VAL found candidates and scored them, but the user still owns the import decision.',
    previewUnderstanding: [
      '6 strategic partner candidates found.',
      'Potential Reach and Partnership Fit are ready for sorting.',
      'Each candidate includes evidence, recommended outreach angle, and source links; two supporting sources are preferred.'
    ],
    previewRecommendation: 'Select only the partners that would genuinely expand reach, then push approved partners to the strategic partner pipeline.',
    verifiedTitle: 'Partner evidence is ready for approval.',
    verifiedMeaning: 'VAL has checked source support and contactability without moving anything into GHL.',
    verifiedUnderstanding: [
      'Partner fit is scored on a 100-point standard.',
      'Potential Reach remains sortable.',
      'Evidence and outreach angle stay visible before approval.'
    ],
    verifiedRecommendation: 'Approve only partners with credible reach and a clear reason for GOALL to start a relationship.',
    importedTitle: 'Approved partners were sent to the pipeline.',
    importedMeaning: 'The selected records were written to the strategic partner destination.',
    importedUnderstanding: [
      'Approved partner contacts were created or matched.',
      'Potential Reach and Partnership Fit Score were stored as sortable lead data.',
      'The GOALL Strategic Partners destination remains protected.'
    ],
    importedRecommendation: 'Open the pipeline for review, or tune the partner type before running the next scrape.',
    previewLeads: [
      {
        name: 'Southeast Benefits Association',
        type: 'Professional association',
        location: 'Southeast US',
        score: 'Fit 88/100',
        contact: 'Partnership director identified',
        evidence: 'Potential reach 4,800 members; annual conference listed.'
      },
      {
        name: 'Keystone HR Advisors',
        type: 'HR consulting firm',
        location: 'Charlotte, NC',
        score: 'Fit 76/100',
        contact: 'Principal identified',
        evidence: 'Employer access is clear; second source preferred.'
      },
      {
        name: 'Summit Payroll Partners',
        type: 'Payroll company',
        location: 'Arizona',
        score: 'Fit 81/100',
        contact: 'General inbox only',
        evidence: 'Strong employer base; Level 3 should verify a decision-maker.'
      }
    ]
  }
};

const scraperApiConfig = {
  organizations: {
    previewUrl: '/api/val/leads/discover-preview',
    importUrl: '/api/val/leads/import-approved',
    buildPayload(criteria){
      return {
        organizationType: criteria['Lead set'] || 'Organizations / Non-Profits',
        market: criteria.Market || 'Tennessee and Southeast US',
        limit: Number(criteria['Preview count']) || 12,
        criteria: criteria.Criteria || 'Find mission-aligned organizations with visible partnership readiness, active public programs, and enough contact evidence for review.',
        leadProfile: 'frisson',
        rocketReachMode: 'defer'
      };
    }
  },
  partners: {
    previewUrl: '/api/val/partners/discover-preview',
    importUrl: '/api/val/partners/import-approved',
    buildPayload(criteria){
      return {
        partnerType: criteria['Partner type'] || 'Strategic distribution partners',
        market: criteria.Market || 'United States',
        limit: Number(criteria['Preview count']) || 12,
        criteria: criteria.Criteria || 'Find organizations that can distribute, recommend, introduce, or sell GOALL. Prefer recent public sources and at least two supporting URLs.',
        rocketReachMode: 'defer'
      };
    }
  }
};

const scraperUtilityWorkflows = {
  approval: {
    lens: 'Approval Gate',
    title: 'Preview is the promise.',
    meaning: 'The scraper may search broadly, but CRM writes stay narrow and approved.',
    understanding: [
      'Lead and partner scrapers use separate preview and import endpoints.',
      'The preview can be sorted, verified, selected, held, or canceled.',
      'Approved import re-checks duplicates before creating contacts and opportunities.'
    ],
    recommendation: 'Keep approval visible and plain. The user should always know whether they are reviewing, verifying, or actually importing.',
    actions: ['Open Pipeline', 'Teach VAL']
  },
  connections: {
    lens: 'Connections',
    title: 'The scraper depends on clean source access.',
    meaning: 'If a scrape fails, the user should know which connection needs attention without reading logs.',
    understanding: [
      'Level 1: Outscraper or public business discovery.',
      'Level 2: Apollo-style company and decision-maker enrichment.',
      'Level 3: RocketReach verification, chunked to avoid gateway timeouts.',
      'GHL: contact, tag, custom field, note, and opportunity write access.'
    ],
    recommendation: 'Show connection readiness before the workflow starts, and show a graceful recovery path when a source fails.',
    actions: ['Check connections', 'Open Pipeline', 'Teach VAL']
  }
};

function roomContent(card, workspace = {}){
  return { card, workspace };
}

const states = {
  quiet: {
    title: 'Good morning, Jessa.',
    witness: 'Today has room to think.',
    orientation: 'There is one meaningful commitment this afternoon, and everything else can stay quiet for now.',
    permission: 'Protect that space.',
    rooms: {
      velocity: roomContent({
        observation: 'Greg replied.',
        implication: 'The proposal can now move forward.',
        invitation: 'Would you like to review it?',
        title: 'Greg replied',
        summary: 'The proposal can now move forward.',
        action: 'Review the reply'
      }, {
        lens: 'Velocity',
        title: 'Greg answered the question that was holding the proposal.',
        meaning: 'This changes the next step, not the whole day.',
        understanding: [
          "Greg's reply resolves the open approval question.",
          'The proposal language is already drafted.',
          'No other thread needs first attention.'
        ],
        recommendation: 'I would review this before the afternoon commitment, then leave the rest of the morning open.',
        actions: ['Review reply', 'Draft response', 'Teach VAL'],
        contextPortals: ['Greg', 'proposal', 'afternoon commitment'],
        confidence: 0.86,
        restraintReason: 'One story owns the Home surface; related draft context stays inside the workspace.'
      }),
      alignment: roomContent({
        observation: 'Only one thing deserves your judgment first.',
        implication: 'Everything else can wait.',
        invitation: 'Would you like to check that with me?',
        title: 'Protected attention',
        summary: 'Everything else can wait.',
        action: 'Open Acme proposal',
        primaryAction: {
          type: 'openExternal',
          target: 'https://app.gohighlevel.com/',
          ariaLabel: 'Open Acme proposal in GHL'
        }
      }, {
        lens: 'Alignment',
        title: 'The Acme proposal deserves your first judgment.',
        meaning: 'This is the one decision that can protect the shape of the day.',
        understanding: [
          'The afternoon has one meaningful commitment.',
          'The proposal is close enough to complete, but still needs your judgment.',
          'Small requests can wait without consequence.'
        ],
        recommendation: 'If this were my day, I would finish the proposal before opening anything reactive.',
        actions: ['Open proposal', 'Accept', 'Adjust', 'Show alternatives', 'Teach VAL'],
        contextPortals: ['Acme proposal', 'afternoon commitment', 'small requests'],
        confidence: 0.82,
        restraintReason: 'Velocity owns the Greg reply; Alignment owns where judgment should go first.'
      }),
      leverage: roomContent({
        observation: 'The Frisson follow-up is ready.',
        implication: 'Three hours of work became six minutes of review.',
        invitation: 'Would you like to review it?',
        title: 'Prepared',
        summary: 'Three hours of work became six minutes of review.',
        action: 'Open prepared follow-up',
        primaryAction: {
          type: 'openInternal',
          target: './dashboard.html',
          ariaLabel: 'Open prepared Frisson follow-up'
        }
      }, {
        lens: 'Leverage',
        title: 'Everything for the Frisson follow-up is ready.',
        meaning: 'You do not need to assemble the work; you only need to review the few pieces that affect judgment.',
        understanding: [
          'The follow-up email is drafted.',
          'The meeting notes have been compressed into decision points.',
          'The relationship context is already attached.'
        ],
        recommendation: 'I would review the prepared follow-up, approve the draft if it still feels true, and leave the supporting material closed unless something feels off.',
        actions: ['Open prepared follow-up', 'Approve draft', 'Refine', 'Teach VAL'],
        contextPortals: ['Frisson follow-up', 'email draft', 'meeting notes', 'relationship context'],
        confidence: 0.84,
        restraintReason: 'Prepared work is surfaced as one review moment instead of separate draft, note, and relationship cards.'
      })
    }
  },
  protective: {
    title: 'Good morning, Jessa.',
    witness: 'Yesterday asked more of your attention than it should have.',
    orientation: 'Today has enough room to recover the thread before anyone else gets your best thinking.',
    permission: 'Do not let small requests take the morning.',
    rooms: {
      velocity: roomContent({
        observation: 'Nothing new needs the morning.',
        implication: 'Your first attention can stay protected.',
        invitation: 'Keep it contained',
        title: 'Noise is contained',
        summary: 'Nothing needs to interrupt the first part of your day.',
        action: 'Keep it contained'
      }),
      alignment: roomContent({
        observation: 'One priority is clean.',
        implication: 'Your judgment belongs on the work that moves the week.',
        invitation: 'See the clean priority',
        title: 'One clean priority',
        summary: 'Your judgment belongs on the work that moves the week.',
        action: 'See the clean priority'
      }, {
        lens: 'Alignment',
        title: 'The week moves through one clean priority.',
        meaning: 'Your first judgment should go where it prevents later rework.',
        understanding: [
          'Yesterday created more context switching than deep work.',
          'The morning is the only protected thinking space.',
          'Everything else can remain contained until the priority is clear.'
        ],
        recommendation: 'I would use the morning to resolve the clean priority before responding to smaller requests.',
        actions: ['Accept', 'Adjust', 'Show alternatives', 'Teach VAL'],
        contextPortals: ['clean priority', 'morning', 'smaller requests'],
        confidence: 0.8,
        restraintReason: 'Protective mode should reduce inputs, so only one judgment thread is surfaced.'
      }),
      leverage: roomContent({
        observation: 'The pieces are gathered.',
        implication: 'You do not need to assemble them this morning.',
        invitation: 'Review what is gathered',
        title: 'Already gathered',
        summary: 'The supporting pieces are waiting behind the curtain.',
        action: 'Open gathered work',
        primaryAction: {
          type: 'openInternal',
          target: './dashboard.html',
          ariaLabel: 'Open gathered work'
        }
      }, {
        lens: 'Leverage',
        title: 'The supporting work is already gathered.',
        meaning: 'Your morning should be spent judging the work, not assembling the evidence around it.',
        understanding: [
          'The relevant notes have been grouped.',
          'The draft is ready enough for review.',
          'The remaining work is judgment, not collection.'
        ],
        recommendation: 'I would open the gathered work only after the clean priority is clear.',
        actions: ['Open gathered work', 'Approve', 'Refine', 'Teach VAL'],
        contextPortals: ['supporting work', 'draft', 'clean priority'],
        confidence: 0.78,
        restraintReason: 'Leverage stays secondary to Alignment while still holding the prepared material.'
      })
    }
  },
  celebratory: {
    title: 'The proposal is out.',
    witness: 'That closed a loop you have been carrying since Tuesday.',
    orientation: 'The follow-up is already organized, and nothing else needs to become urgent tonight.',
    permission: 'One less thing to carry.',
    rooms: {
      velocity: roomContent({
        observation: 'The proposal is out.',
        implication: 'The next reply can wait until it has a real shape.',
        invitation: 'Let it settle',
        title: 'Chapter closed',
        summary: 'The next reply can wait until it has a real shape.',
        action: 'Let it settle'
      }),
      alignment: roomContent({
        observation: 'Nothing needs proving tonight.',
        implication: 'Filling the quiet would not improve the work.',
        invitation: 'Protect the quiet',
        title: 'No rush',
        summary: 'There is nothing to prove by filling the quiet.',
        action: 'Protect the quiet'
      }, {
        lens: 'Alignment',
        title: 'The aligned move is to let the work settle.',
        meaning: 'The proposal is out, and adding effort tonight would not improve the outcome.',
        understanding: [
          'A meaningful chapter closed today.',
          'The follow-up has already been organized.',
          'More work tonight would mostly create noise.'
        ],
        recommendation: 'I would protect the quiet and revisit only if a real reply changes the picture.',
        actions: ['Accept', 'Adjust', 'Show alternatives', 'Teach VAL'],
        contextPortals: ['proposal', 'follow-up', 'tonight'],
        confidence: 0.84,
        restraintReason: 'Completion mode should not manufacture a new priority after closure.'
      }),
      leverage: roomContent({
        observation: 'The follow-up is ready.',
        implication: 'What happens next has already been organized.',
        invitation: 'Review the follow-up',
        title: 'Follow-up ready',
        summary: 'I have already organized what happens next.',
        action: 'Open follow-up',
        primaryAction: {
          type: 'openInternal',
          target: './dashboard.html',
          ariaLabel: 'Open organized follow-up'
        }
      }, {
        lens: 'Leverage',
        title: 'The follow-up is organized for tomorrow.',
        meaning: 'The chapter closed, and the next step is already shaped enough to wait.',
        understanding: [
          'The proposal has been sent.',
          'The follow-up draft is organized.',
          'Nothing else needs to become urgent tonight.'
        ],
        recommendation: 'I would leave the follow-up prepared and review it when tomorrow has room for it.',
        actions: ['Open follow-up', 'Approve later', 'Refine', 'Teach VAL'],
        contextPortals: ['proposal', 'follow-up draft', 'tomorrow'],
        confidence: 0.86,
        restraintReason: 'Completion mode should show prepared capability without inviting unnecessary evening work.'
      })
    }
  },
  evening: {
    title: 'We had a meaningful day.',
    witness: 'The important work moved, and the rest can wait.',
    orientation: 'I have already gathered the follow-up for tomorrow.',
    permission: 'Go make memories with your boys.',
    rooms: {
      velocity: roomContent({
        observation: 'The day is settled.',
        implication: 'Anything new can wait for tomorrow morning.',
        invitation: 'Leave it for morning',
        title: 'Settled for now',
        summary: 'Anything new can wait for tomorrow morning.',
        action: 'Leave it for morning'
      }),
      alignment: roomContent({
        observation: 'The workday can close.',
        implication: 'Your attention belongs somewhere softer now.',
        invitation: 'Close the day',
        title: 'Day closed',
        summary: 'Your attention belongs somewhere softer now.',
        action: 'Close the day'
      }, {
        lens: 'Alignment',
        title: 'Your judgment is no longer needed tonight.',
        meaning: 'The most aligned choice is to leave the work held until morning.',
        understanding: [
          'The meaningful work already moved.',
          'Tomorrow has the follow-up context waiting.',
          'Nothing tonight is worthy of taking attention from home.'
        ],
        recommendation: 'I would close the day and let tomorrow inherit the work.',
        actions: ['Accept', 'Adjust', 'Show alternatives', 'Teach VAL'],
        contextPortals: ['tomorrow', 'follow-up', 'home'],
        confidence: 0.88,
        restraintReason: 'Evening mode should protect closure unless a true exception appears.'
      }),
      leverage: roomContent({
        observation: 'Tomorrow is held.',
        implication: 'The follow-up will be here when you return.',
        invitation: 'Review tomorrow',
        title: 'Tomorrow is held',
        summary: 'The follow-up will be here when you return.',
        action: 'Open tomorrow plan',
        primaryAction: {
          type: 'openInternal',
          target: './dashboard.html',
          ariaLabel: 'Open tomorrow plan'
        }
      }, {
        lens: 'Leverage',
        title: 'Tomorrow already has the follow-up held.',
        meaning: 'You do not need to keep the next step in your head tonight.',
        understanding: [
          'The follow-up context is waiting for tomorrow.',
          'The workday has already closed.',
          'No prepared item needs approval tonight.'
        ],
        recommendation: 'I would let VAL hold this until morning and leave the desk clear tonight.',
        actions: ['Open tomorrow plan', 'Leave it for morning', 'Adjust', 'Teach VAL'],
        contextPortals: ['tomorrow', 'follow-up context', 'morning'],
        confidence: 0.87,
        restraintReason: 'Evening leverage should remove mental load, not create one more review task.'
      })
    }
  }
};
let currentState = states.quiet;

function readAttendedRooms(){
  try{
    return JSON.parse(sessionStorage.getItem(attendedRoomsStorageKey) || '{}') || {};
  }catch(error){
    return {};
  }
}

function writeAttendedRooms(attended){
  try{
    sessionStorage.setItem(attendedRoomsStorageKey, JSON.stringify(attended || {}));
  }catch(error){
    // Session memory is a nicety; the interface should remain calm if storage is unavailable.
  }
}

function roomNameFromWorkspace(workspace = {}, fallback = ''){
  const lens = String(workspace.lens || fallback || '').toLowerCase();
  if(/velocity/.test(lens)) return 'velocity';
  if(/alignment/.test(lens)) return 'alignment';
  if(/leverage/.test(lens)) return 'leverage';
  return fallback || '';
}

function roomAttendedLabel(mode){
  if(mode === 'source') return 'Opened';
  if(mode === 'judgment') return 'Held';
  if(mode === 'adjust') return 'Refined';
  if(mode === 'evidence') return 'Evidence';
  return 'Held';
}

function markRoomAttended(roomName, mode = 'judgment'){
  if(!roomName) return;
  const room = document.querySelector('.living-room.' + roomName);
  if(!room) return;
  let marker = room.querySelector('.room-attended');
  if(!marker){
    marker = document.createElement('span');
    marker.className = 'room-attended';
    room.appendChild(marker);
  }
  marker.textContent = roomAttendedLabel(mode);
  room.dataset.attended = mode;
  room.classList.add('room-has-been-held');
  const attended = readAttendedRooms();
  attended[roomName] = mode;
  writeAttendedRooms(attended);
}

function applyStoredRoomAttendance(){
  const attended = readAttendedRooms();
  Object.entries(attended).forEach(([roomName, mode]) => {
    markRoomAttended(roomName, mode);
  });
}

function clearRoomAttendance(){
  writeAttendedRooms({});
  document.querySelectorAll('.living-room').forEach((room) => {
    room.classList.remove('room-has-been-held');
    delete room.dataset.attended;
    room.querySelector('.room-attended')?.remove();
  });
  hearth.classList.add('desk-settling');
  window.setTimeout(() => hearth.classList.remove('desk-settling'), 620);
}

function relationshipIndexSourceProfiles(){
  return relationshipIndexLoaded ? relationshipIndexProfiles : relationshipProfiles;
}

function relationshipIndexItems(){
  return Object.entries(relationshipIndexSourceProfiles()).map(([id, profile]) => ({
    id,
    profile,
    name: profile.name || 'Unnamed relationship',
    company: profile.company || String(profile.contact || '').split('·')[0]?.trim() || 'Relationship',
    temperature: profile.temperature || 'Unknown',
    temperatureScore: Math.max(0, Math.min(100, Number(profile.temperatureScore || 50))),
    trajectory: profile.trajectory || profile.role || 'Watch',
    state: profile.relationshipState || relationshipStateFromTemperature(profile),
    stateLabel: profile.relationshipStateLabel || relationshipTemperatureModel[profile.relationshipState]?.label || profile.temperature || 'Watch',
    sourceEvidence: profile.sourceEvidence || profile.sourceReceipts || 'Evidence source pending canonical relationship index.',
    confidence: Math.max(0, Math.min(1, Number(profile.confidence || 0.6))),
    lastChangedAt: profile.lastChangedAt || '',
    signal: profile.signal || profile.certainty || profile.evidence || 'No current signal attached.',
    temperatureReviewPending: relationshipPendingTemperatureReviewFor(profile) || profile.temperatureReviewPending || null
  }));
}

function relationshipProfileFromIndexItem(item = {}){
  const id = item.id || item.profileKey || item.name || 'relationship';
  const query = {
    ...(item.query || {}),
    name: item.query?.name || item.name || item.displayName || '',
    email: item.query?.email || item.email || '',
    targetId: item.query?.targetId || id,
    contactId: item.query?.contactId || item.contactId || item.crmContactId || ''
  };
  return {
    ...item,
    query,
    name: item.name || item.displayName || 'Unnamed relationship',
    initials: item.initials || String(item.name || item.displayName || 'R').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase(),
    role: item.role || item.relationshipStatus || 'Relationship',
    company: item.company || 'Relationship',
    temperature: item.temperature || 'Warm',
    temperatureScore: Math.max(0, Math.min(100, Number(item.temperatureScore || 55))),
    trajectory: item.trajectory || item.relationshipStatus || 'Watch',
    relationshipState: item.relationshipState || item.state || relationshipStateFromTemperature(item),
    relationshipStateLabel: item.relationshipStateLabel || item.stateLabel || item.temperature || 'Warm',
    temperatureMeaning: item.temperatureMeaning || relationshipTemperatureModel[item.relationshipState || item.state]?.meaning || '',
    temperatureObservers: item.temperatureObservers || relationshipTemperatureModel[item.relationshipState || item.state]?.observers || [],
    temperatureScoreRange: item.temperatureScoreRange || relationshipTemperatureModel[item.relationshipState || item.state]?.scoreRange || [],
    temperatureEvidence: Array.isArray(item.temperatureEvidence) ? item.temperatureEvidence : [],
    temperatureConflict: item.temperatureConflict || null,
    sourceEvidence: item.sourceEvidence || item.summary || 'Canonical relationship index profile.',
    confidence: Math.max(0, Math.min(1, Number(item.confidence || 0.6))),
    lastChangedAt: item.lastChangedAt || item.updatedAt || item.lastObservedAt || '',
    signal: item.signal || item.summary || 'Relationship signal available.',
    identity: item.identity || item.name || item.displayName || 'Relationship',
    contact: item.contact || item.email || item.profileKey || 'CRM identity review may be required.',
    wisdom: item.wisdom || item.summary || 'Review the relationship file before acting.',
    evidence: item.evidence || item.signal || item.summary || 'Relationship evidence is available in the canonical index.',
    patterns: item.patterns || 'VAL is reading this from the canonical relationship index.',
    meaning: item.meaning || item.summary || 'This relationship has enough observed context to appear in the index.',
    certainty: item.certainty || 'Open the brief to resolve identity and review the relationship dossier before acting.',
    linkedinSignal: item.linkedinSignal || 'LinkedIn context will appear when an observer has current evidence.',
    sourceReceipts: item.sourceReceipts || 'Canonical relationship index · GHL identity gate required before dossier attachment',
    projectLinks: Array.isArray(item.projectLinks) ? item.projectLinks : [],
    href: item.href || './dashboard.html?view=relationships&targetType=person&targetId=' + encodeURIComponent(id)
  };
}

function onboardingImportItems(onboarding = {}, category = ''){
  const imports = Array.isArray(onboarding.imports) ? onboarding.imports : [];
  const memory = Array.isArray(onboarding.memory) ? onboarding.memory : [];
  const fromImports = imports
    .filter((row) => row.category === category)
    .flatMap((row) => {
      const extracted = Array.isArray(row.extractedItems) ? row.extractedItems : [];
      if(extracted.length){
        return extracted.map((item) => ({
          ...item,
          category: item.category || category,
          sourceCategory: category,
          sourceImportId: row.id,
          routeStatus: row.status || 'Imported'
        }));
      }
      return row.rawResponse ? [{
        id: row.id,
        title: row.structuredSummary?.title || row.structuredSummary?.summary || row.category.replace(/_/g, ' '),
        summary: row.rawResponse,
        category,
        sourceCategory: category,
        sourceImportId: row.id,
        routeStatus: row.status || 'Imported'
      }] : [];
    });
  const fromMemory = memory
    .filter((row) => row.category === category || row.data?.sourceCategory === category)
    .map((item) => ({
      ...item,
      sourceCategory: category,
      routeStatus: 'Memory review'
    }));
  return dedupeOnboardingRouteItems(fromImports.concat(fromMemory));
}

function osRouteItems(os = {}, category = ''){
  const rows = []
    .concat(Array.isArray(os.learningReview) ? os.learningReview : [])
    .concat(Array.isArray(os.facts) ? os.facts : [])
    .concat(Array.isArray(os.skills) ? os.skills : []);
  return dedupeOnboardingRouteItems(rows
    .filter((item) => valOperationalCategory(item) === category)
    .map((item) => ({
      ...item,
      sourceCategory: category,
      routeStatus: item.needsApproval ? 'Needs review' : item.approvedForUse ? 'Approved' : item.status || 'VAL OS'
    })));
}

function dedupeOnboardingRouteItems(items = []){
  const byKey = new Map();
  items.filter(Boolean).forEach((item) => {
    const key = [item.id, item.title, item.summary].filter(Boolean).join('|').toLowerCase() || Math.random().toString(36);
    if(!byKey.has(key)) byKey.set(key, item);
  });
  return Array.from(byKey.values());
}

function onboardingSupportProfile(item = {}, index = 0){
  const name = String(item.name || item.personName || item.title || 'Support person ' + (index + 1)).replace(/^Support-circle context:\s*/i, '').trim();
  const id = 'onboarding-support-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || ('onboarding-support-' + index);
  const summary = item.summary || item.detail || item.data?.text || 'Onboarding named this person as someone VAL should help the user support.';
  return relationshipProfileFromIndexItem({
    id,
    name,
    company: item.company || item.organization || 'Support circle',
    role: item.role || 'Onboarding support circle',
    temperature: 'Needs linking',
    temperatureScore: 52,
    relationshipState: 'new',
    relationshipStateLabel: 'Needs linking',
    trajectory: 'Resolve CRM/contact',
    signal: summary,
    summary,
    sourceEvidence: 'Teach VAL onboarding · support circle',
    confidence: Number(item.confidence || 0.64),
    linkedinSignal: item.linkedinUrl || item.data?.linkedinProfile || item.data?.linkedin || 'Add LinkedIn/profile context if relevant.',
    certainty: 'Review identity, CRM contact, support posture, and open commitments before VAL acts.',
    sourceReceipts: 'Onboarding support circle · no CRM write taken',
    query: {name, email: item.email || item.data?.email || '', contactId: item.contactId || '', targetId: id}
  });
}

function mergeOnboardingSupportProfiles(items = []){
  if(!items.length) return 0;
  let added = 0;
  items.forEach((item, index) => {
    const profile = onboardingSupportProfile(item, index);
    const id = profile.query?.targetId || profile.id || 'onboarding-support-' + index;
    const duplicate = Object.values(relationshipIndexProfiles).some((existing) => String(existing.name || '').toLowerCase() === String(profile.name || '').toLowerCase());
    if(!duplicate && !relationshipIndexProfiles[id]){
      relationshipIndexProfiles[id] = profile;
      added += 1;
    }
  });
  return added;
}

async function hydrateRelationshipIndex(){
  if(!canUseApi || relationshipIndexLoaded) return;
  if(relationshipIndexRequest) return relationshipIndexRequest;
  relationshipIndexRequest = getJson('/api/relationships/index?limit=120')
    .then(async(data) => {
      if(Array.isArray(data?.relationships)){
        relationshipIndexProfiles = data.relationships.reduce((profiles, item) => {
          const id = item.id || item.profileKey || item.name;
          if(id) profiles[id] = relationshipProfileFromIndexItem(item);
          return profiles;
        }, {});
        const onboarding = await getJson('/api/teach-val/onboarding').catch(() => ({}));
        const added = mergeOnboardingSupportProfiles(onboardingImportItems(onboarding, 'support_circle'));
        relationshipIndexLoaded = true;
        relationshipIndexSourceLabel = (data.source === 'demo_relationships' ? 'Demo canonical index' : 'Canonical relationship index') + (added ? ' + onboarding support circle' : '');
        updateRelationshipIndexSourceLabel();
        renderRelationshipRolodex();
      }
    })
    .catch((error) => {
      relationshipIndexSourceLabel = 'Local preview';
      updateRelationshipIndexSourceLabel();
      console.warn('[hearth] relationship index unavailable', error.message);
    })
    .finally(() => {
      relationshipIndexRequest = null;
    });
  return relationshipIndexRequest;
}

const relationshipStateAttentionRank = {
  needs_attention: 0,
  waiting: 1,
  strategic: 2,
  warm: 3,
  new: 4
};

const relationshipSectionCopy = {
  needs_attention: {
    title: 'Needs attention',
    note: 'Trust, clarity, or follow-through should be handled before action.'
  },
  waiting: {
    title: 'Waiting',
    note: 'A loop is open; clarity matters more than pressure.'
  },
  strategic: {
    title: 'Strategic',
    note: 'These relationships create leverage and deserve deliberate handling.'
  },
  warm: {
    title: 'Warm',
    note: 'Healthy enough for thoughtful continuation.'
  },
  new: {
    title: 'New',
    note: 'Known identity, still gathering enough evidence for judgment.'
  }
};

function relationshipStateFromTemperature(profile = {}){
  const trajectory = String(profile.trajectory || '').toLowerCase();
  const temperature = String(profile.temperature || '').toLowerCase();
  const score = Number(profile.temperatureScore || 50);
  if(/need|risk|attention|clarity/.test(trajectory)) return 'needs_attention';
  if(/wait|reply|pending/.test(trajectory + ' ' + temperature)) return 'waiting';
  if(score >= 80) return 'strategic';
  if(/new/.test(temperature)) return 'new';
  return 'warm';
}

function relationshipItemMatchesSearch(item, query){
  if(!query) return true;
  const haystack = [
    item.name,
    item.company,
    item.temperature,
    item.trajectory,
    item.stateLabel,
    item.signal,
    item.sourceEvidence,
    item.profile.role,
    item.profile.contact
  ].join(' ').toLowerCase();
  return haystack.includes(query);
}

function filteredRelationshipIndexItems(){
  const query = relationshipIndexSearch.trim().toLowerCase();
  const items = relationshipIndexItems().filter((item) => {
    const stateMatches = relationshipStateFilter === 'all' || item.state === relationshipStateFilter;
    return stateMatches && relationshipItemMatchesSearch(item, query);
  });
  return sortRelationshipIndexItems(items);
}

function relationshipChangedTime(item = {}){
  const time = Date.parse(item.lastChangedAt || '');
  return Number.isFinite(time) ? time : 0;
}

function sortRelationshipIndexItems(items = []){
  return [...items].sort((a, b) => {
    if(relationshipSortMode === 'warmest'){
      return b.temperatureScore - a.temperatureScore || a.name.localeCompare(b.name);
    }
    if(relationshipSortMode === 'changed'){
      return relationshipChangedTime(b) - relationshipChangedTime(a) || a.name.localeCompare(b.name);
    }
    if(relationshipSortMode === 'alpha'){
      return a.name.localeCompare(b.name);
    }
    const rankA = relationshipStateAttentionRank[a.state] ?? 9;
    const rankB = relationshipStateAttentionRank[b.state] ?? 9;
    return rankA - rankB || relationshipChangedTime(b) - relationshipChangedTime(a) || b.temperatureScore - a.temperatureScore || a.name.localeCompare(b.name);
  });
}

function shouldShowRelationshipSections(){
  return relationshipStateFilter === 'all' && relationshipSortMode === 'attention' && !relationshipIndexSearch.trim();
}

function relationshipRolodexEmptyText(){
  if(relationshipIndexSearch.trim() || relationshipStateFilter !== 'all'){
    return 'No relationship matches this search or filter.';
  }
  if(relationshipIndexLoaded && !Object.keys(relationshipIndexProfiles).length){
    return 'Canonical relationship index is connected. No relationship profiles have enough evidence to appear here yet.';
  }
  return 'No relationship matches this view.';
}

function appendRelationshipSectionHeader(state, count){
  const copy = relationshipSectionCopy[state] || {
    title: relationshipTemperatureModel[state]?.label || 'Relationships',
    note: 'Relationships grouped by current executive posture.'
  };
  const header = document.createElement('div');
  header.className = 'relationship-rolodex-section';
  header.dataset.relationshipSection = state;
  const title = document.createElement('strong');
  title.textContent = copy.title;
  const note = document.createElement('span');
  note.textContent = copy.note;
  const total = document.createElement('small');
  total.textContent = count + ' ' + (count === 1 ? 'person' : 'people');
  header.append(title, note, total);
  relationshipRolodex.appendChild(header);
}

function relationshipSectionCounts(items = []){
  return items.reduce((counts, item) => {
    counts[item.state] = (counts[item.state] || 0) + 1;
    return counts;
  }, {});
}

function appendRelationshipRolodexRow(item){
  const row = document.createElement('div');
  row.className = 'relationship-rolodex-row';
  row.dataset.relationshipRow = item.id;
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.relationshipOpenProfile = item.id;
  button.dataset.relationshipState = item.state;
  button.setAttribute('title', item.sourceEvidence + ' Confidence: ' + Math.round(item.confidence * 100) + '%.');
  button.style.setProperty('--temperature-score', item.temperatureScore + '%');
  const name = document.createElement('span');
  name.className = 'rolodex-name';
  name.textContent = item.name;
  const company = document.createElement('span');
  company.className = 'rolodex-company';
  company.textContent = item.company;
  const temperature = document.createElement('span');
  temperature.className = 'rolodex-temperature';
  const gauge = document.createElement('i');
  gauge.setAttribute('aria-hidden', 'true');
  const tempLabel = document.createElement('b');
  tempLabel.textContent = item.temperature;
  const trajectory = document.createElement('em');
  trajectory.textContent = item.stateLabel + ' · ' + item.trajectory;
  temperature.append(gauge, tempLabel, trajectory);
  const signal = document.createElement('span');
  signal.className = 'rolodex-signal';
  signal.textContent = item.signal;
  button.append(name, company, temperature, signal);
  if(item.temperatureReviewPending?.status === 'pending'){
    const pending = document.createElement('button');
    pending.type = 'button';
    pending.className = 'rolodex-temperature-pending';
    pending.dataset.relationshipPendingTemperatureReview = item.id;
    pending.setAttribute('title', 'Open temperature correction review');
    pending.textContent = 'Temperature review pending · correction waiting';
    row.appendChild(pending);
  }
  if(item.profile?.temperatureConflict || item.temperatureConflict){
    const conflict = item.profile?.temperatureConflict || item.temperatureConflict;
    const review = document.createElement('span');
    review.className = 'rolodex-temperature-review';
    review.textContent = 'Review temperature · ' + (conflict.challengerState || 'conflicting signal') + ' also has evidence';
    button.appendChild(review);
  }
  row.insertBefore(button, row.firstChild);
  relationshipRolodex.appendChild(row);
}

function renderRelationshipRolodex(){
  if(!relationshipRolodex) return;
  updateRelationshipIndexSourceLabel();
  relationshipRolodex.innerHTML = '';
  const items = filteredRelationshipIndexItems();
  relationshipRolodex.dataset.relationshipDensity = items.length >= 12 ? 'compact' : 'comfortable';
  if(!items.length){
    const empty = document.createElement('p');
    empty.className = 'relationship-rolodex-empty';
    empty.textContent = relationshipRolodexEmptyText();
    relationshipRolodex.appendChild(empty);
    return;
  }
  const showSections = shouldShowRelationshipSections();
  const sectionCounts = showSections ? relationshipSectionCounts(items) : {};
  let currentSection = '';
  items.forEach((item) => {
    if(showSections && item.state !== currentSection){
      currentSection = item.state;
      appendRelationshipSectionHeader(item.state, sectionCounts[item.state] || 0);
    }
    appendRelationshipRolodexRow(item);
  });
}

function setRelationshipDetailMode(mode = 'brief'){
  const showIndex = mode === 'index';
  document.querySelector('#relationship-detail')?.classList.toggle('show-index', showIndex);
  relationshipFolderButtons.forEach((button) => {
    const profile = relationshipProfiles[button.dataset.relationshipProfile];
    button.classList.toggle('active', !showIndex && activeRelationshipProfile && profile === activeRelationshipProfile);
    button.setAttribute('aria-pressed', String(!showIndex && button.classList.contains('active')));
  });
}

function renderRelationshipTemperatureReview(profile = {}){
  const panel = document.querySelector('[data-relationship-temperature-review]');
  const copy = document.querySelector('[data-relationship-temperature-review-copy]');
  if(!panel || !copy) return;
  const conflict = profile.temperatureConflict;
  if(!conflict){
    panel.hidden = true;
    copy.textContent = '';
    return;
  }
  panel.hidden = false;
  copy.textContent = 'VAL sees credible evidence for ' + (conflict.challengerState || 'another state') + ' while showing ' + (conflict.selectedState || profile.relationshipState || 'this state') + '. Review before treating this temperature as durable judgment.';
}

function relationshipProjectName(link = {}){
  return link.metadata?.projectName || link.targetLabel || link.target_label || link.projectName || link.targetId || link.target_id || 'Linked project';
}

function relationshipProjectDetail(link = {}){
  return link.summary || 'This project is linked to the relationship profile.';
}

function relationshipProjectLookupId(profile = {}){
  return profile.query?.contactId || profile.contactId || profile.crmContactId || profile.personId || profile.id || '';
}

function renderRelationshipProjectPanel(profile = {}, links = null){
  if(!relationshipProjectPanel || !relationshipProjectCount) return;
  const items = Array.isArray(links) ? links : (Array.isArray(profile.projectLinks) ? profile.projectLinks : []);
  relationshipProjectPanel.innerHTML = '';
  relationshipProjectCount.textContent = items.length ? items.length + ' linked ' + (items.length === 1 ? 'project' : 'projects') : 'No linked projects yet';
  if(!items.length){
    const empty = document.createElement('article');
    empty.className = 'empty';
    empty.innerHTML = '<span>Projects</span><p>Projects linked through this relationship will appear here after CRM identity is clean.</p>';
    relationshipProjectPanel.appendChild(empty);
    return;
  }
  items.slice(0, 6).forEach((link) => {
    const article = document.createElement('article');
    const label = document.createElement('span');
    label.textContent = 'Project';
    const name = document.createElement('strong');
    name.textContent = relationshipProjectName(link);
    const detail = document.createElement('p');
    detail.textContent = relationshipProjectDetail(link);
    const small = document.createElement('small');
    small.textContent = [link.targetId || link.target_id, link.relationship].filter(Boolean).join(' · ');
    article.append(label, name, detail, small);
    relationshipProjectPanel.appendChild(article);
  });
}

async function hydrateRelationshipProjectLinks(profile = activeRelationshipProfile){
  const relationshipId = relationshipProjectLookupId(profile);
  renderRelationshipProjectPanel(profile, profile?.projectLinks || []);
  if(!canUseApi || !relationshipId) return;
  try{
    const data = await getJson('/api/projects/links?relationshipId=' + encodeURIComponent(relationshipId));
    const links = Array.isArray(data?.links) ? data.links : [];
    profile.projectLinks = links;
    if(activeRelationshipProfile === profile || activeRelationshipProfile?.id === profile.id) renderRelationshipProjectPanel(profile, links);
  }catch(error){
    console.warn('[hearth] relationship project links unavailable', error.message);
  }
}

function renderLinkedDocumentCards({panel, countNode, items = [], emptyCopy = 'Linked documents will appear here when VAL can resolve source evidence.'} = {}){
  if(!panel || !countNode) return;
  panel.innerHTML = '';
  countNode.textContent = items.length ? items.length + ' linked ' + (items.length === 1 ? 'document' : 'documents') : 'No linked documents yet';
  if(!items.length){
    const empty = document.createElement('article');
    empty.className = 'empty';
    empty.innerHTML = '<span>Documents</span><p>' + escapeHtml(emptyCopy) + '</p>';
    panel.appendChild(empty);
    return;
  }
  items.slice(0, 6).forEach((doc) => {
    const article = document.createElement('article');
    const label = document.createElement('span');
    label.textContent = documentTypeLabel(doc.type || doc.sourceType || 'Document');
    const title = document.createElement('strong');
    title.textContent = doc.title || 'Linked document';
    const body = document.createElement('p');
    body.textContent = doc.summary || doc.bodyPreview || doc.referenceUse || 'Document evidence is available.';
    const small = document.createElement('small');
    small.textContent = [doc.source, doc.relationship && 'Relationship: ' + doc.relationship, doc.project && 'Project: ' + doc.project].filter(Boolean).join(' · ');
    article.append(label, title, body, small);
    panel.appendChild(article);
  });
}

async function hydrateRelationshipDocuments(profile = activeRelationshipProfile){
  renderLinkedDocumentCards({
    panel: relationshipDocumentPanel,
    countNode: relationshipDocumentCount,
    items: profile?.documents || [],
    emptyCopy: 'Documents linked to this relationship will appear here and become required evidence before VAL drafts or judges.'
  });
  if(!canUseApi || !profile?.name) return;
  try{
    const data = await getJson('/api/val/documents/reference?relationship=' + encodeURIComponent(profile.name) + '&limit=6');
    profile.documents = Array.isArray(data?.documents) ? data.documents : [];
    if(activeRelationshipProfile === profile || activeRelationshipProfile?.id === profile.id){
      renderLinkedDocumentCards({
        panel: relationshipDocumentPanel,
        countNode: relationshipDocumentCount,
        items: profile.documents,
        emptyCopy: 'No document evidence is linked to this relationship yet.'
      });
    }
  }catch(error){
    console.warn('[hearth] relationship documents unavailable', error.message);
  }
}

function relationshipTemperatureTeachingContext(profile = {}){
  const conflict = profile.temperatureConflict;
  const evidence = Array.isArray(profile.temperatureEvidence) ? profile.temperatureEvidence.slice(0, 3) : [];
  const lines = [
    'Current temperature: ' + (profile.temperature || profile.relationshipStateLabel || 'Not set'),
    conflict ? 'Competing evidence: ' + (conflict.challengerState || 'another state') + ' also has evidence.' : 'No competing temperature state is currently flagged.',
    profile.temperatureMeaning ? 'Current meaning: ' + profile.temperatureMeaning : ''
  ].filter(Boolean);
  evidence.forEach((item) => {
    lines.push('Evidence: ' + [item.observer, item.summary].filter(Boolean).join(' - '));
  });
  return lines;
}

function relationshipTemperatureReviewPayload(profile = {}, teaching = ''){
  const query = profile.query || {};
  return {
    correction: teaching,
    relationship: {
      name: profile.name || query.name || '',
      email: query.email || profile.email || '',
      targetId: query.targetId || profile.targetId || profile.id || '',
      contactId: query.contactId || profile.contactId || '',
      temperature: profile.temperature || '',
      relationshipState: profile.relationshipState || '',
      relationshipStateLabel: profile.relationshipStateLabel || ''
    },
    currentTemperature: profile.temperature || profile.relationshipStateLabel || profile.relationshipState || '',
    temperatureConflict: profile.temperatureConflict || null,
    temperatureEvidence: Array.isArray(profile.temperatureEvidence) ? profile.temperatureEvidence : [],
    confidence: profile.confidence || 0.78
  };
}

async function createRelationshipTemperatureReviewUpdate(profile = {}, teaching = ''){
  if(mockScrapers || !canUseApi) return null;
  return postJson('/api/val/review-updates/relationship-temperature', relationshipTemperatureReviewPayload(profile, teaching));
}

function relationshipTemperatureReviewTargetKeys(source = {}){
  const value = source.proposedValueJson || source;
  const query = source.query || {};
  return [
    value.contactId,
    value.targetId,
    value.email,
    value.relationshipName,
    source.contactId,
    source.targetId,
    source.email,
    source.name,
    query.contactId,
    query.targetId,
    query.email,
    query.name
  ].map((item) => String(item || '').trim().toLowerCase()).filter(Boolean);
}

function relationshipPendingTemperatureReviewFor(profile = {}){
  const pending = activeRelationshipTemperatureReviewUpdate;
  if(!pending || pending.status !== 'pending') return null;
  const pendingKeys = relationshipTemperatureReviewTargetKeys(pending);
  const profileKeys = relationshipTemperatureReviewTargetKeys(profile);
  return pendingKeys.some((key) => profileKeys.includes(key)) ? pending : null;
}

function syncRelationshipTemperatureReviewState(update = null){
  const keys = relationshipTemperatureReviewTargetKeys(update);
  const nextPending = update?.status === 'pending' ? update : null;
  const profiles = [
    activeRelationshipProfile,
    ...Object.values(relationshipProfiles || {}),
    ...Object.values(relationshipIndexProfiles || {})
  ].filter(Boolean);
  profiles.forEach((profile) => {
    const profileKeys = relationshipTemperatureReviewTargetKeys(profile);
    if(!keys.some((key) => profileKeys.includes(key))) return;
    profile.temperatureReviewPending = nextPending;
  });
}

function relationshipTemperatureReviewUpdateLines(update = {}){
  const value = update.proposedValueJson || {};
  const refs = Array.isArray(update.evidenceRefsJson) ? update.evidenceRefsJson.slice(0, 3) : [];
  return [
    'Relationship: ' + (value.relationshipName || activeRelationshipProfile?.name || 'Relationship'),
    value.currentTemperature ? 'Current read: ' + value.currentTemperature : '',
    value.correction ? 'Proposed teaching: ' + value.correction : (update.summary ? 'Proposed teaching: ' + update.summary : ''),
    refs.length ? 'Evidence held: ' + refs.map((ref) => ref.quote_or_summary || ref.quoteOrSummary || ref.summary || ref.source_type || ref.sourceType || 'supporting evidence').filter(Boolean).join(' / ') : '',
    'Boundary: approval records local Teach VAL learning only. It does not directly change relationship temperature, CRM, messages, or external systems.'
  ].filter(Boolean);
}

async function openRelationshipTemperatureReviewQueue(){
  if(mockScrapers || !canUseApi){
    setWorkspaceContent({
      lens: 'Relationship Temperature',
      title: 'Temperature correction is waiting for review.',
      meaning: 'In live VAL, this opens the pending temperature correction without leaving the Hearth.',
      understanding: ['Mock-safe mode is on.', 'No backend review queue was changed.', 'No durable memory, CRM update, message, or relationship fact changed.'],
      recommendation: 'Approve or reject from the live review queue when the local VAL API is available.',
      actions: relationshipContextActions([{label:'Teach temperature again', workflow:'relationship:teach_temperature'}]),
      label: 'Relationship temperature review queue'
    });
    openWorkspaceShell('Relationship temperature review queue', {returnTarget:'relationship'});
    return;
  }
  let update = activeRelationshipTemperatureReviewUpdate;
  if(!update || update.status !== 'pending'){
    const result = await getJson('/api/val/review-updates?status=pending&limit=30');
    update = (result.updates || []).find((item) => item.updateType === 'relationship_temperature_correction');
    activeRelationshipTemperatureReviewUpdate = update || null;
  }
  if(!update){
    setWorkspaceContent({
      lens: 'Relationship Temperature',
      title: 'No temperature corrections are waiting.',
      meaning: 'The relationship temperature review queue is clear.',
      understanding: ['No pending relationship_temperature_correction update was found.', 'No durable memory, CRM update, message, or relationship fact changed.', 'You can teach VAL temperature again from the relationship brief.'],
      recommendation: 'Return to the relationship or all people.',
      actions: relationshipContextActions([{label:'Teach temperature again', workflow:'relationship:teach_temperature'}]),
      label: 'Relationship temperature review empty'
    });
    openWorkspaceShell('Relationship temperature review empty', {returnTarget:'relationship'});
    return;
  }
  setWorkspaceContent({
    lens: 'Relationship Temperature',
    title: 'Review relationship temperature correction.',
    meaning: 'This is the approval gate for one relationship-temperature correction. It can teach future judgment, but it cannot move the temperature by itself.',
    understanding: relationshipTemperatureReviewUpdateLines(update),
    recommendation: 'Approve if this should become local learning for future relationship judgment. Reject if the evidence is too thin, too stale, or aimed at the wrong relationship.',
    actions: relationshipContextActions([
      {label:'Approve temperature learning', workflow:'relationshipTemperatureApprove'},
      {label:'Reject temperature learning', workflow:'relationshipTemperatureReject'}
    ]),
    label: 'Relationship temperature review approval'
  });
  openWorkspaceShell('Relationship temperature review approval', {returnTarget:'relationship'});
}

async function openPendingRelationshipTemperatureReviewFromRolodex(pendingNode){
  const relationshipProfileButton = pendingNode.closest('.relationship-rolodex-row')?.querySelector('[data-relationship-open-profile]');
  const id = pendingNode.dataset.relationshipPendingTemperatureReview || relationshipProfileButton?.dataset.relationshipOpenProfile;
  const profile = id ? relationshipIndexSourceProfiles()[id] || relationshipProfiles[id] || relationshipIndexProfiles[id] : activeRelationshipProfile;
  const pending = profile ? relationshipPendingTemperatureReviewFor(profile) || profile.temperatureReviewPending : null;
  if(profile) activeRelationshipProfile = profile;
  if(pending?.status === 'pending') activeRelationshipTemperatureReviewUpdate = pending;
  await openRelationshipTemperatureReviewQueue();
}

async function decideRelationshipTemperatureReview(action){
  const update = activeRelationshipTemperatureReviewUpdate;
  if(!update?.id){
    await openRelationshipTemperatureReviewQueue();
    return;
  }
  const approved = action === 'approve';
  const result = await postJson('/api/val/review-updates/' + encodeURIComponent(update.id) + '/' + (approved ? 'approve' : 'reject'), approved ? {note:'Approved from Hearth relationship temperature review.'} : {reason:'Rejected from Hearth relationship temperature review.'});
  activeRelationshipTemperatureReviewUpdate = result.update || null;
  syncRelationshipTemperatureReviewState(result.update || update);
  setWorkspaceContent({
    lens: 'Relationship Temperature',
    title: approved ? 'Temperature learning approved locally.' : 'Temperature learning rejected.',
    meaning: approved ? 'VAL recorded this as local relationship-temperature learning, without changing the relationship temperature directly.' : 'VAL set this correction aside without creating memory or changing the relationship.',
    understanding: [
      'Review update: ' + (result.update?.updateType || 'relationship_temperature_correction'),
      'Status: ' + (result.update?.status || (approved ? 'approved' : 'rejected')),
      approved && result.update?.appliedTargetId ? 'Local learning receipt: ' + result.update.appliedTargetId : '',
      'No CRM update, message, scrape, import, external action, or direct relationship-temperature change happened.'
    ].filter(Boolean),
    recommendation: approved ? 'Use this as a learning receipt, not a temperature mutation. Future observer-backed movement still needs evidence.' : 'Return to the relationship and teach VAL again only if there is better evidence.',
    actions: relationshipContextActions([{label:'Review another temperature correction', workflow:'relationshipTemperatureReview'}]),
    label: 'Relationship temperature review decision'
  });
  openWorkspaceShell('Relationship temperature review decision', {returnTarget:'relationship'});
}

function openRelationshipIndex(){
  if(relationshipSearchInput) relationshipSearchInput.value = relationshipIndexSearch;
  if(relationshipSortSelect) relationshipSortSelect.value = relationshipSortMode;
  relationshipStateFilterButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.relationshipStateFilter === relationshipStateFilter);
    button.setAttribute('aria-pressed', String(button.classList.contains('active')));
  });
  renderRelationshipRolodex();
  hydrateRelationshipIndex();
  const nameField = document.querySelector('[data-relationship-field="name"]');
  if(nameField) nameField.textContent = 'Relationships';
  setRelationshipDetailMode('index');
}

function projectIndexItems(){
  const canonicalItems = Object.values(projectIndexProfiles);
  return projectIndexLoaded ? canonicalItems : Object.values(projectProfiles);
}

function updateProjectIndexSourceLabel(){
  if(!projectIndexSource) return;
  const count = projectIndexItems().length;
  projectIndexSource.textContent = projectIndexSourceLabel + ' · ' + count + ' ' + (count === 1 ? 'project' : 'projects');
}

function setProjectCreateOpen(open){
  if(!projectCreateForm || !projectCreateToggle) return;
  projectCreateForm.hidden = !open;
  projectCreateToggle.setAttribute('aria-expanded', String(open));
  if(open){
    projectCreateForm.querySelector('input[name="name"]')?.focus();
  } else if(projectCreateStatus){
    projectCreateStatus.textContent = '';
  }
}

function projectCreateFormPayload(){
  return new FormData(projectCreateForm);
}

function projectCreateFormValue(payload, key){
  return String(payload?.get?.(key) || '').trim();
}

function updateProjectFileReceipt(){
  if(!projectFileInput || !projectFileReceipt) return;
  const files = Array.from(projectFileInput.files || []);
  if(!files.length){
    projectFileReceipt.textContent = 'No files selected';
    return;
  }
  const names = files.slice(0,3).map((file) => file.name).join(', ');
  const extra = files.length > 3 ? ' +' + (files.length - 3) + ' more' : '';
  projectFileReceipt.textContent = files.length + ' ' + (files.length === 1 ? 'file' : 'files') + ' selected: ' + names + extra;
}

function normalizedProjectSourceDetails(project = {}){
  const looksLikeDetails = project.files || project.websiteSource || project.website || project.documents || project.documentNotes || project.relationships || project.people || project.rawContext || project.notes;
  const details = looksLikeDetails ? project : (project.sourceDetails || project.sources || {});
  return {
    files: Array.isArray(details.files) ? details.files : [],
    websiteSource: details.websiteSource || details.website || '',
    documents: details.documents || details.documentNotes || '',
    relationships: details.relationships || details.people || '',
    rawContext: details.rawContext || details.notes || ''
  };
}

function projectSourceDetailCount(details){
  return (details.files?.length || 0) + ['websiteSource','documents','relationships','rawContext'].filter((key) => String(details[key] || '').trim()).length;
}

function appendProjectSourceSection(label, value, emptyText){
  if(!projectSourcePanel) return;
  const article = document.createElement('article');
  const title = document.createElement('span');
  title.textContent = label;
  const body = document.createElement('p');
  body.textContent = value || emptyText;
  if(!value) article.classList.add('empty');
  article.append(title, body);
  projectSourcePanel.appendChild(article);
}

function renderProjectSourcePanel(project = {}){
  if(!projectSourcePanel || !projectSourceCount) return;
  const details = normalizedProjectSourceDetails(project);
  const count = projectSourceDetailCount(details);
  projectSourcePanel.innerHTML = '';
  projectSourceCount.textContent = count ? count + ' source ' + (count === 1 ? 'item' : 'items') + ' attached' : 'No source details attached yet';
  const fileNames = details.files.map((file) => {
    const name = file.fileName || file.name || 'Uploaded file';
    const size = file.chars ? file.chars + ' chars' : file.size ? Math.round(file.size / 1024) + ' KB' : '';
    return [name, size].filter(Boolean).join(' · ');
  }).join('\n');
  appendProjectSourceSection('Files', fileNames, 'No files uploaded for this project yet.');
  appendProjectSourceSection('Website / Source Code', details.websiteSource, 'No website or source-code notes attached yet.');
  appendProjectSourceSection('Documents / Contracts', details.documents, 'No document or contract notes attached yet.');
  appendProjectSourceSection('People / Relationships', details.relationships, 'No people or relationship context attached yet.');
  appendProjectSourceSection('Raw Context', details.rawContext, 'No raw project context attached yet.');
}

function projectGraphLinkLabel(link = {}){
  if(link.relationship === 'linked_to_project') return 'Relationship';
  if(link.relationship === 'meeting_context_for_project') return 'Calendar';
  return 'Context';
}

function projectGraphLinkText(link = {}){
  return link.summary || link.sourceLabel || link.source_label || link.sourceId || link.source_id || 'Linked context';
}

function renderProjectGraphPanel(project = {}, links = null){
  if(!projectGraphPanel || !projectGraphCount) return;
  const items = Array.isArray(links) ? links : (Array.isArray(project.graphLinks) ? project.graphLinks : []);
  projectGraphPanel.innerHTML = '';
  projectGraphCount.textContent = items.length ? items.length + ' linked ' + (items.length === 1 ? 'item' : 'items') : 'No linked context yet';
  if(!items.length){
    const empty = document.createElement('article');
    empty.className = 'empty';
    empty.innerHTML = '<span>Graph</span><p>Relationships and calendar meetings linked to this project will appear here.</p>';
    projectGraphPanel.appendChild(empty);
    return;
  }
  items.slice(0, 6).forEach((link) => {
    const article = document.createElement('article');
    const label = document.createElement('span');
    label.textContent = projectGraphLinkLabel(link);
    const body = document.createElement('p');
    body.textContent = projectGraphLinkText(link);
    const detail = document.createElement('small');
    detail.textContent = [link.sourceLabel || link.source_label || link.sourceId || link.source_id, link.relationship].filter(Boolean).join(' · ');
    article.append(label, body, detail);
    projectGraphPanel.appendChild(article);
  });
}

async function hydrateProjectGraphLinks(project = activeProjectProfile){
  if(!project?.id){
    renderProjectGraphPanel(project);
    return;
  }
  renderProjectGraphPanel(project, project.graphLinks || []);
  if(!canUseApi) return;
  const projectId = project.projectId || project.id;
  try{
    const data = await getJson('/api/projects/links?projectId=' + encodeURIComponent(projectId));
    const links = Array.isArray(data?.links) ? data.links : [];
    const profile = projectIndexProfiles[project.id] || projectProfiles[project.id] || project;
    profile.graphLinks = links;
    if(activeProjectProfile?.id === project.id) renderProjectGraphPanel(profile, links);
  }catch(error){
    console.warn('[hearth] project graph links unavailable', error.message);
  }
}

function projectReviewItems(project = {}, reviews = null){
  const items = Array.isArray(reviews) ? reviews : (Array.isArray(project.reviewUpdates) ? project.reviewUpdates : []);
  const projectId = project.projectId || project.id || '';
  return items.filter((item) => {
    if(item.updateType && item.updateType !== 'review_project_source_context') return false;
    if(projectId && item.targetKey && item.targetKey !== projectId) return false;
    return true;
  });
}

function renderProjectReviewPanel(project = {}, reviews = null){
  if(!projectReviewPanel || !projectReviewCount) return;
  const items = projectReviewItems(project, reviews);
  projectReviewPanel.innerHTML = '';
  projectReviewCount.textContent = items.length ? items.length + ' source ' + (items.length === 1 ? 'review' : 'reviews') + ' pending' : 'No source reviews pending';
  if(!items.length){
    const empty = document.createElement('article');
    empty.className = 'empty';
    empty.innerHTML = '<span>Review</span><p>Uploaded documents, project chats, and meeting context must be reviewed before they become project judgment, tasks, relationship updates, or recommendations.</p>';
    projectReviewPanel.appendChild(empty);
    return;
  }
  items.slice(0, 6).forEach((review) => {
    const article = document.createElement('article');
    const label = document.createElement('span');
    label.textContent = review.approvalPolicy === 'never_auto' ? 'Sensitive Review' : 'Review Required';
    const title = document.createElement('strong');
    title.textContent = review.title || 'Project source review';
    const body = document.createElement('p');
    body.textContent = review.summary || review.proposedValueJson?.interpretation || 'Project source context is waiting for approval.';
    const small = document.createElement('small');
    small.textContent = 'No task, relationship update, project judgment, CRM write, message, or external action has happened.';
    article.append(label, title, body, small);
    if(review.id){
      const action = document.createElement('button');
      action.type = 'button';
      action.dataset.projectReviewUpdate = review.id;
      action.textContent = 'Review project source';
      article.appendChild(action);
    }
    projectReviewPanel.appendChild(article);
  });
}

function renderProjectPreparedWorkPanel(project = {}, prepared = null){
  if(!projectPreparedPanel || !projectPreparedCount) return;
  const items = Array.isArray(prepared) ? prepared : (Array.isArray(project.preparedWork) ? project.preparedWork : []);
  projectPreparedPanel.innerHTML = '';
  projectPreparedCount.textContent = items.length ? items.length + ' prepared ' + (items.length === 1 ? 'item' : 'items') + ' waiting' : 'No prepared work waiting';
  if(!items.length){
    const empty = document.createElement('article');
    empty.className = 'empty';
    empty.innerHTML = '<span>Prepared</span><p>Transcript-built work, continuation tasks, and partial drafts linked to this project will appear here.</p>';
    projectPreparedPanel.appendChild(empty);
    return;
  }
  items.slice(0, 6).forEach((item) => {
    const article = document.createElement('article');
    const label = document.createElement('span');
    label.textContent = item.completionStatus === 'needs_context' || item.completionStatus === 'partial_needs_context' ? 'Needs Context' : 'Ready For Review';
    const title = document.createElement('strong');
    title.textContent = item.title || 'Prepared work';
    const body = document.createElement('p');
    body.textContent = item.summary || item.notes || 'VAL prepared work from transcript context.';
    const small = document.createElement('small');
    small.textContent = [item.executionLevelLabel || item.executionLevel, item.transcriptTitle || item.transcriptId, 'No external action'].filter(Boolean).join(' · ');
    article.append(label, title, body, small);
    projectPreparedPanel.appendChild(article);
  });
}

async function hydrateProjectDocuments(project = activeProjectProfile){
  renderLinkedDocumentCards({
    panel: projectDocumentPanel,
    countNode: projectDocumentCount,
    items: project?.documents || [],
    emptyCopy: 'Documents linked to this project will appear here and become required evidence for project judgment.'
  });
  const projectName = project?.name || project?.projectName || '';
  if(!canUseApi || !projectName) return;
  try{
    const data = await getJson('/api/val/documents/reference?project=' + encodeURIComponent(projectName) + '&limit=6');
    project.documents = Array.isArray(data?.documents) ? data.documents : [];
    if(activeProjectProfile === project || activeProjectProfile?.id === project.id){
      renderLinkedDocumentCards({
        panel: projectDocumentPanel,
        countNode: projectDocumentCount,
        items: project.documents,
        emptyCopy: 'No document evidence is linked to this project yet.'
      });
    }
  }catch(error){
    console.warn('[hearth] project documents unavailable', error.message);
  }
}

async function hydrateProjectReviewUpdates(project = activeProjectProfile){
  if(!project?.id){
    renderProjectReviewPanel(project);
    return;
  }
  renderProjectReviewPanel(project, project.reviewUpdates || []);
  if(!canUseApi) return;
  const projectId = project.projectId || project.id;
  try{
    const data = await getJson('/api/val/review-updates?status=pending&limit=80');
    const updates = Array.isArray(data?.updates) ? data.updates.filter((item) => item.updateType === 'review_project_source_context' && item.targetKey === projectId) : [];
    const profile = projectIndexProfiles[project.id] || projectProfiles[project.id] || project;
    const existing = Array.isArray(profile.reviewUpdates) ? profile.reviewUpdates : [];
    const merged = updates.reduce((items, update) => items.some((item) => item.id === update.id) ? items : items.concat(update), existing);
    profile.reviewUpdates = merged;
    if(activeProjectProfile?.id === project.id) renderProjectReviewPanel(profile, merged);
  }catch(error){
    console.warn('[hearth] project review updates unavailable', error.message);
  }
}

function projectSourceReviewTargetKeys(source = {}){
  const value = source.proposedValueJson || source;
  return [
    value.projectId,
    value.projectProfileId,
    value.projectName,
    source.targetKey,
    source.projectId,
    source.id,
    source.name
  ].map((item) => String(item || '').trim().toLowerCase()).filter(Boolean);
}

function projectSourceReviewMatchesProject(update = {}, project = {}){
  const updateKeys = projectSourceReviewTargetKeys(update);
  const projectKeys = projectSourceReviewTargetKeys(project);
  return updateKeys.some((key) => projectKeys.includes(key));
}

function findProjectSourceReviewUpdate(id = ''){
  const candidates = [
    activeProjectSourceReviewUpdate,
    ...(Array.isArray(activeProjectProfile?.reviewUpdates) ? activeProjectProfile.reviewUpdates : []),
    ...Object.values(projectProfiles || {}).flatMap((project) => Array.isArray(project.reviewUpdates) ? project.reviewUpdates : []),
    ...Object.values(projectIndexProfiles || {}).flatMap((project) => Array.isArray(project.reviewUpdates) ? project.reviewUpdates : [])
  ].filter(Boolean);
  return candidates.find((update) => String(update.id || '') === String(id || '')) || null;
}

function syncProjectReviewState(update = null){
  if(!update) return;
  const profiles = [
    activeProjectProfile,
    ...Object.values(projectProfiles || {}),
    ...Object.values(projectIndexProfiles || {})
  ].filter(Boolean);
  profiles.forEach((project) => {
    if(!projectSourceReviewMatchesProject(update, project)) return;
    const existing = Array.isArray(project.reviewUpdates) ? project.reviewUpdates : [];
    if(update.status === 'pending'){
      project.reviewUpdates = existing.some((item) => item.id === update.id)
        ? existing.map((item) => item.id === update.id ? update : item)
        : existing.concat(update);
    } else {
      project.reviewUpdates = existing.filter((item) => item.id !== update.id);
    }
  });
  if(activeProjectProfile) renderProjectReviewPanel(activeProjectProfile);
}

function projectSourceReviewUpdateLines(update = {}){
  const value = update.proposedValueJson || {};
  const refs = Array.isArray(update.evidenceRefsJson) ? update.evidenceRefsJson.slice(0, 4) : [];
  return [
    'Project: ' + (value.projectName || activeProjectProfile?.name || 'Project'),
    value.sourceType ? 'Source type: ' + value.sourceType : '',
    value.sourceTitle ? 'Source: ' + value.sourceTitle : '',
    value.interpretation ? 'Proposed learning: ' + value.interpretation : (update.summary ? 'Proposed learning: ' + update.summary : ''),
    refs.length ? 'Evidence held: ' + refs.map((ref) => ref.quote_or_summary || ref.quoteOrSummary || ref.summary || ref.source_type || ref.sourceType || 'supporting evidence').filter(Boolean).join(' / ') : '',
    value.boundary || 'Boundary: approval records local project-source learning only. It does not create tasks, update relationships, change project judgment, parse contracts into obligations, send messages, write CRM, or take external action.'
  ].filter(Boolean);
}

async function openProjectSourceReview(update = null){
  const review = update || activeProjectSourceReviewUpdate;
  if(!review?.id){
    setWorkspaceContent({
      lens: 'Project Source Review',
      title: 'No project source is waiting for review.',
      meaning: 'The project review gate is clear for the selected project.',
      understanding: ['No pending review_project_source_context update was found.', 'No task, relationship update, project judgment, CRM write, message, or external action happened.'],
      recommendation: 'Return to the project brief or keep adding source material.',
      actions: projectContextActions([]),
      label: 'Project source review empty'
    });
    openWorkspaceShell('Project source review empty', {returnTarget:'project'});
    return;
  }
  activeProjectSourceReviewUpdate = review;
  setWorkspaceContent({
    lens: 'Project Source Review',
    title: 'Review project source.',
    meaning: 'This is the approval gate for one piece of project source context. It can become local learning, but it cannot directly change project judgment.',
    understanding: projectSourceReviewUpdateLines(review),
    recommendation: 'Approve if this should become local source learning for future project judgment. Reject if it is thin, stale, sensitive in the wrong way, or attached to the wrong project.',
    actions: projectContextActions([
      {label:'Approve project-source learning', workflow:'projectSourceApprove'},
      {label:'Reject project-source learning', workflow:'projectSourceReject'}
    ]),
    label: 'Project source review approval'
  });
  openWorkspaceShell('Project source review approval', {returnTarget:'project'});
}

async function decideProjectSourceReview(action){
  const update = activeProjectSourceReviewUpdate;
  if(!update?.id){
    await openProjectSourceReview();
    return;
  }
  const approved = action === 'approve';
  const result = await postJson('/api/val/review-updates/' + encodeURIComponent(update.id) + '/' + (approved ? 'approve' : 'reject'), approved ? {note:'Approved from Hearth project source review.'} : {reason:'Rejected from Hearth project source review.'});
  activeProjectSourceReviewUpdate = result.update || null;
  syncProjectReviewState(result.update || update);
  setWorkspaceContent({
    lens: 'Project Source Review',
    title: approved ? 'Project source learning approved locally.' : 'Project source learning rejected.',
    meaning: approved ? 'VAL recorded this as local project-source learning, without changing project judgment directly.' : 'VAL set this project source aside without creating memory or changing the project.',
    understanding: [
      'Review update: ' + (result.update?.updateType || 'review_project_source_context'),
      'Status: ' + (result.update?.status || (approved ? 'approved' : 'rejected')),
      approved && result.update?.appliedTargetId ? 'Local learning receipt: ' + result.update.appliedTargetId : '',
      'No task, relationship update, project judgment, CRM write, contract obligation, message, or external action happened.'
    ].filter(Boolean),
    recommendation: approved ? 'Use this as a learning receipt, not a project mutation. Future recommendations still need reviewed evidence.' : 'Return to the project and add or review better source context when it exists.',
    actions: projectContextActions([]),
    label: 'Project source review decision'
  });
  openWorkspaceShell('Project source review decision', {returnTarget:'project'});
}

function projectProfileFromIndexItem(item = {}){
  const id = item.id || item.projectId || item.profileKey || item.name || 'project';
  const name = item.name || item.displayName || 'Unnamed project';
  return {
    ...item,
    id,
    name,
    initials: item.initials || name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'P',
    status: item.status || item.relationshipStatus || 'Observed',
    signal: item.signal || item.summary || 'Project signal available.',
    reality: item.reality || item.summary || 'Canonical project profile from VAL project index.',
    momentum: item.momentum || 'Active context',
    momentumEvidence: item.momentumEvidence || item.signal || item.summary || 'Project movement is visible in stored VAL evidence.',
    decision: item.decision || 'Review project reality',
    decisionEvidence: item.decisionEvidence || 'Review project context before adding work.',
    nextMove: item.nextMove || item.recommendedAction || item.summary || 'Review the project file.',
    nextMoveEvidence: item.nextMoveEvidence || item.nextMove || item.summary || 'Use the project dossier before creating new work.',
    sourceReceipts: item.sourceReceipts || 'Canonical project index',
    sourceDetails: normalizedProjectSourceDetails(item),
    graphLinks: Array.isArray(item.graphLinks) ? item.graphLinks : [],
    reviewUpdates: Array.isArray(item.reviewUpdates) ? item.reviewUpdates : [],
    href: item.href || './dashboard.html?view=projects&projectId=' + encodeURIComponent(id)
  };
}

async function hydrateProjectIndex(){
  if(!canUseApi || projectIndexLoaded) return;
  if(projectIndexRequest) return projectIndexRequest;
  projectIndexSourceLabel = 'Checking project index';
  updateProjectIndexSourceLabel();
  projectIndexRequest = getJson('/api/projects/index?limit=80')
    .then((data) => {
      if(Array.isArray(data?.projects)){
        projectIndexProfiles = data.projects.reduce((profiles, item) => {
          const profile = projectProfileFromIndexItem(item);
          if(profile.id) profiles[profile.id] = profile;
          return profiles;
        }, {});
        projectIndexLoaded = true;
        projectIndexSourceLabel = data.source === 'demo_project_profiles' ? 'Demo project index' : 'Canonical project index';
        updateProjectIndexSourceLabel();
        renderProjectRolodex();
        const firstProject = projectIndexItems()[0];
        if(firstProject) renderProjectProfile(firstProject.id);
      }
    })
    .catch((error) => {
      projectIndexSourceLabel = 'Local project preview';
      updateProjectIndexSourceLabel();
      console.warn('[hearth] project index unavailable', error.message);
    })
    .finally(() => {
      projectIndexRequest = null;
    });
  return projectIndexRequest;
}

function projectRolodexEmptyText(){
  if(projectIndexLoaded && !Object.keys(projectIndexProfiles).length){
    return 'Canonical project index is connected. No project profiles have enough evidence to appear here yet.';
  }
  return 'No project dossiers are available in this view yet.';
}

function appendProjectRolodexRow(project){
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.projectOpenProfile = project.id;
  button.setAttribute('aria-pressed', String(activeProjectProfile?.id === project.id));
  button.setAttribute('title', project.signal);
  const name = document.createElement('span');
  name.className = 'project-row-name';
  name.textContent = project.name;
  const status = document.createElement('span');
  status.className = 'project-row-status';
  status.textContent = project.status;
  const signal = document.createElement('span');
  signal.className = 'project-row-signal';
  signal.textContent = project.signal;
  const next = document.createElement('span');
  next.className = 'project-row-next';
  next.textContent = project.nextMove;
  button.append(name, status, signal, next);
  projectRolodex.appendChild(button);
}

function renderProjectRolodex(){
  if(!projectRolodex) return;
  updateProjectIndexSourceLabel();
  projectRolodex.innerHTML = '';
  const items = projectIndexItems();
  if(!items.length){
    const empty = document.createElement('p');
    empty.className = 'project-rolodex-empty';
    empty.textContent = projectRolodexEmptyText();
    projectRolodex.appendChild(empty);
    return;
  }
  items.forEach(appendProjectRolodexRow);
}

function renderProjectProfile(projectId = 'frisson'){
  const project = projectIndexProfiles[projectId] || projectProfiles[projectId] || projectProfiles.frisson;
  activeProjectProfile = project;
  document.querySelectorAll('[data-project-field]').forEach((node) => {
    const field = node.dataset.projectField;
    node.textContent = project[field] || '';
  });
  document.querySelectorAll('[data-project-open-profile]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.projectOpenProfile === project.id));
  });
  renderProjectSourcePanel(project);
  renderProjectPreparedWorkPanel(project);
  hydrateProjectDocuments(project);
  hydrateProjectGraphLinks(project);
  hydrateProjectReviewUpdates(project);
}

function projectProfileFromDossier(dossier = {}, fallback = {}){
  const card = dossier.card || {};
  const identity = dossier.identity || {};
  const currentReality = dossier.currentReality || {};
  const momentum = dossier.momentum || {};
  const decisionPoint = dossier.decisionPoint || {};
  const nextMove = dossier.nextMove || {};
  const sourceReceipts = dossier.sourceReceipts || {};
  return {
    ...fallback,
    id: identity.id || card.id || fallback.id || 'project',
    projectId: identity.projectId || card.projectId || fallback.projectId || '',
    profileKey: identity.profileKey || card.profileKey || fallback.profileKey || '',
    name: identity.name || card.name || fallback.name || 'Project',
    initials: card.initials || fallback.initials || initialsFromName(identity.name || card.name || fallback.name || 'Project'),
    status: identity.status || currentReality.status || card.status || fallback.status || 'Observed',
    signal: currentReality.signal || card.signal || fallback.signal || '',
    reality: currentReality.summary || card.reality || fallback.reality || '',
    momentum: momentum.summary || card.momentum || fallback.momentum || '',
    momentumEvidence: momentum.evidence || card.momentumEvidence || fallback.momentumEvidence || '',
    decision: decisionPoint.summary || card.decision || fallback.decision || '',
    decisionEvidence: decisionPoint.evidence || card.decisionEvidence || fallback.decisionEvidence || '',
    nextMove: nextMove.summary || card.nextMove || fallback.nextMove || '',
    nextMoveEvidence: nextMove.evidence || card.nextMoveEvidence || fallback.nextMoveEvidence || '',
    sourceReceipts: sourceReceipts.summary || card.sourceReceipts || fallback.sourceReceipts || '',
    sourceDetails: normalizedProjectSourceDetails(sourceReceipts.details || card.sourceDetails || fallback.sourceDetails || {}),
    graphLinks: Array.isArray(sourceReceipts.graphLinks) ? sourceReceipts.graphLinks : (Array.isArray(card.graphLinks) ? card.graphLinks : (Array.isArray(fallback.graphLinks) ? fallback.graphLinks : [])),
    reviewUpdates: Array.isArray(sourceReceipts.reviewUpdates) ? sourceReceipts.reviewUpdates : (Array.isArray(card.reviewUpdates) ? card.reviewUpdates : (Array.isArray(fallback.reviewUpdates) ? fallback.reviewUpdates : [])),
    preparedWork: Array.isArray(sourceReceipts.preparedWork) ? sourceReceipts.preparedWork : (Array.isArray(card.preparedWork) ? card.preparedWork : (Array.isArray(fallback.preparedWork) ? fallback.preparedWork : [])),
    href: card.href || fallback.href || './dashboard.html?view=projects&projectId=' + encodeURIComponent(identity.id || card.id || fallback.id || 'project'),
    dossier
  };
}

async function loadProjectDossier(projectId = 'frisson'){
  const fallback = projectIndexProfiles[projectId] || projectProfiles[projectId] || projectProfiles.frisson;
  renderProjectProfile(projectId);
  if(!canUseApi) return;
  const params = new URLSearchParams();
  params.set('projectId', fallback.projectId || fallback.id || projectId);
  if(fallback.name) params.set('name', fallback.name);
  try{
    const data = await getJson('/api/projects/dossier?' + params.toString());
    if(data?.dossier){
      const profile = projectProfileFromDossier(data.dossier, fallback);
      projectIndexProfiles[profile.id] = profile;
      renderProjectProfile(profile.id);
    }
  }catch(error){
    console.warn('[hearth] project dossier unavailable', error.message);
  }
}

async function createProjectFromDrawer(event){
  event.preventDefault();
  if(!projectCreateForm || !projectCreateStatus) return;
  const payload = projectCreateFormPayload();
  if(!projectCreateFormValue(payload, 'name')){
    projectCreateStatus.textContent = 'Name the project first.';
    return;
  }
  if(!canUseApi){
    projectCreateStatus.textContent = 'Project creation needs the local VAL server. The form has not saved anything yet.';
    return;
  }
  projectCreateStatus.textContent = 'Creating project intake...';
  try{
    const result = await postFormData('/api/projects/create', payload);
    const project = projectProfileFromIndexItem(result.project || result.dossier?.card || {});
    if(project.id){
      const reviewUpdate = result.projectSourceReview?.update || null;
      if(reviewUpdate) project.reviewUpdates = [reviewUpdate];
      projectIndexProfiles[project.id] = result.dossier ? projectProfileFromDossier(result.dossier, project) : project;
      if(reviewUpdate) projectIndexProfiles[project.id].reviewUpdates = [reviewUpdate];
      projectIndexLoaded = true;
      projectIndexSourceLabel = result.source === 'demo_project_profiles' ? 'Demo project index' : 'Canonical project index';
      renderProjectRolodex();
      renderProjectProfile(project.id);
      projectCreateForm.reset();
      updateProjectFileReceipt();
      setProjectCreateOpen(false);
      if(projectCreateStatus) projectCreateStatus.textContent = '';
    }
  }catch(error){
    projectCreateStatus.textContent = 'Project was not created: ' + error.message;
  }
}

function openProjectIndex(){
  renderProjectRolodex();
  renderProjectProfile(activeProjectProfile?.id || 'frisson');
  hydrateProjectIndex();
}

function normalizeCorrespondenceDraft(draft = {}){
  const source = draft.sourceContext || {};
  const writer = source.writerOutput || {};
  const readiness = source.draftReadiness || {};
  const brief = source.draftBrief || {};
  const qa = source.qa || {};
  return {
    id: draft.id || writer.id || source.conversationId || 'draft',
    draftId: draft.id || '',
    conversationId: source.conversationId || '',
    threadId: source.threadId || '',
    recipientEmail: source.to || source.recipientEmail || source.recipient || source.forwardTo || source.classification?.from?.email || source.conversationContext?.latest_inbound?.from?.email || '',
    provider: source.provider || source.classification?.provider || draft.provider || 'gmail',
    title: draft.subject || writer.subject || brief.single_purpose || 'Prepared email draft',
    status: draft.status || readiness.status || 'ready_for_review',
    summary: writer.why_this_draft_exists || brief.single_purpose || draft.body || 'Review-only draft prepared locally.',
    whyNow: brief.why_now || source.classification?.why_now || 'This conversation appears to be waiting on judgment.',
    context: [source.classification?.executive_meaning, source.classification?.relationship_temperature, source.conversationId && 'Conversation ' + source.conversationId].filter(Boolean).join(' · ') || 'Conversation context attached when available.',
    prepared: draft.body || writer.body || 'VAL prepared draft readiness and brief context.',
    needs: readiness.status === 'needs_context' ? 'Provide missing context: ' + (readiness.missing_context || writer.missing_context || []).join(', ') : 'Review whether this represents your voice, intent, and relationship.',
    draftBody: draft.body || writer.body || '',
    evidence: (brief.source_refs || source.sourceRefs || []).map((ref) => ref.quote_or_summary || ref.quoteOrSummary || ref.summary).filter(Boolean),
    representationRisk: writer.representation_risk || readiness.representation_risk || 'medium',
    source: 'executive_inbox_review_only',
    noExternalAction: true,
    raw: draft
  };
}

function normalizeCorrespondenceReadyItem(item = {}){
  const metadata = item.metadataJson || item.metadata || {};
  const readiness = item.readinessJson || {};
  const sourceRefs = item.sourceRefsJson || item.source_refs || item.sourceRefs || [];
  const draft = metadata.preparedArtifact || item.preparedArtifact || {};
  const draftId = metadata.draftId || item.draftId || '';
  return {
    id: item.id || draftId || item.conversationId || 'ready-correspondence',
    readyForYouId: item.id || '',
    draftId,
    conversationId: metadata.conversationId || item.conversationId || '',
    threadId: metadata.threadId || '',
    recipientEmail: metadata.to || metadata.recipientEmail || metadata.email || draft.to || draft.recipientEmail || '',
    provider: metadata.provider || item.provider || 'gmail',
    title: item.title || draft.subject || 'Conversation ready for review',
    status: item.status || readiness.status || 'ready_for_review',
    summary: item.summary || item.whyUserIsSeeingThis || 'VAL prepared correspondence context for review.',
    whyNow: item.whyNow || item.why_now || 'This thread appears to need human judgment.',
    context: [metadata.projectName, metadata.contactName, metadata.conversationId && 'Conversation ' + metadata.conversationId].filter(Boolean).join(' · ') || 'Relationship and project context appear when resolved.',
    prepared: item.whatValPrepared || item.whatValDid || draft.body || 'VAL prepared draft/readiness context only.',
    needs: item.whatOnlyUserCanDo || item.whatUserNeedsToDo || 'Review, edit, approve, reject, or provide missing context.',
    draftBody: draft.body || item.whatValPrepared || '',
    evidence: sourceRefs.map((ref) => ref.quote_or_summary || ref.quoteOrSummary || ref.summary).filter(Boolean),
    representationRisk: item.representationRisk || readiness.representation_risk || 'medium',
    source: metadata.source || item.source || 'ready_for_you',
    noExternalAction: true,
    raw: item
  };
}

function documentTypeLabel(value = ''){
  return String(value || 'document').replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function localStoredDocuments(){
  try{
    const raw = localStorage.getItem('val_docs_v1');
    const docs = raw ? JSON.parse(raw) : [];
    if(!Array.isArray(docs)) return [];
    return docs.map((doc) => ({
      id: doc.id || 'local-doc-' + Math.random().toString(36).slice(2),
      title: doc.title || 'VAL Document',
      type: doc.type || 'document',
      status: doc.status || 'draft',
      relationship: doc.recipient || doc.relationship || '',
      project: doc.project || doc.projectName || '',
      source: 'Browser document store',
      summary: doc.summary || doc.body || 'VAL-managed local document.',
      referenceUse: 'Use as reference when briefing the linked relationship or project.',
      needs: doc.status === 'sent' ? 'Already sent; keep as relationship/project evidence.' : 'Review before sending, updating, or using externally.',
      body: doc.body || '',
      recipientEmail: doc.recipientEmail || '',
      sourceUrl: doc.url || '',
      origin: 'local_storage',
      raw: doc,
      noExternalAction: true
    }));
  }catch(error){
    return [];
  }
}

function normalizeReadyDocumentItem(item = {}){
  const metadata = item.metadataJson || item.metadata || {};
  const readiness = item.readinessJson || {};
  const artifact = metadata.preparedArtifact || item.preparedArtifact || {};
  const linked = metadata.linkedContext || artifact.linked_context || artifact.linkedContext || {};
  const relationships = Array.isArray(linked.relationships) ? linked.relationships : [];
  const sourceRefs = item.sourceRefsJson || item.source_refs || item.sourceRefs || [];
  return {
    id: item.id || artifact.id || 'ready-document',
    readyForYouId: item.id || '',
    title: item.title || artifact.title || 'Prepared document',
    type: metadata.preparedArtifactKind || artifact.kind || item.type || item.itemType || 'document',
    status: item.status || readiness.status || metadata.completionStatus || 'ready_for_review',
    relationship: metadata.contactName || relationships.map((person) => person.name || person.email).filter(Boolean).join(', '),
    project: metadata.projectName || linked.project?.name || '',
    source: metadata.source === 'transcript_intelligence' ? 'Transcript prepared work' : metadata.source || item.category || 'Ready For You',
    summary: item.summary || item.whyUserIsSeeingThis || 'Prepared document work is ready for review.',
    referenceUse: 'Use as source evidence for linked relationships, projects, drafts, and decisions.',
    needs: item.whatOnlyUserCanDo || item.whatUserNeedsToDo || readiness.remaining_context_needed?.join('; ') || 'Review before external use.',
    body: artifact.html || artifact.body || item.whatValPrepared || artifact.sections?.join('\n') || item.summary || '',
    recipientEmail: artifact.recipientEmail || artifact.to || '',
    sourceUrl: artifact.url || artifact.sourceUrl || '',
    evidence: sourceRefs.map((ref) => ref.quote_or_summary || ref.quoteOrSummary || ref.summary).filter(Boolean),
    origin: metadata.source || 'ready_for_you',
    raw: item,
    noExternalAction: true
  };
}

function documentItemsFromReady(result = {}){
  return (Array.isArray(result.allBuilt) ? result.allBuilt : Array.isArray(result.items) ? result.items : [])
    .filter((item) => {
      const text = [item.category, item.itemType, item.type, item.title, item.metadataJson?.source, item.metadataJson?.preparedArtifactKind].join(' ').toLowerCase();
      return /document|proposal|agreement|sow|copy|html_page|report|brief|spec|documentation|artifact/.test(text);
    })
    .map(normalizeReadyDocumentItem);
}

function documentItemsFromOnboarding(onboarding = {}){
  return onboardingImportItems(onboarding, 'documents_and_examples').map((item, index) => {
    const raw = item.data || {};
    const title = item.documentName || raw.documentName || raw.name || item.title || 'Onboarding document reference';
    return {
      id: 'onboarding-doc-' + (item.id || item.sourceImportId || index),
      title,
      type: raw.type || raw.documentType || item.type || 'reference',
      status: item.routeStatus || 'onboarding_reference',
      relationship: raw.relationship || raw.person || raw.client || item.relationship || '',
      project: raw.project || raw.projectName || item.project || '',
      source: 'Teach VAL onboarding',
      summary: item.summary || raw.summary || 'Onboarding named this document, example, or source material as context VAL should use.',
      referenceUse: raw.useFor || raw.referenceUse || 'Use as reference context for linked relationships, projects, drafts, commitments, and decisions.',
      needs: 'Resolve the source file, upload/Google Docs link, and relationship/project links before VAL treats this as durable evidence.',
      body: item.summary || raw.text || raw.notes || '',
      recipientEmail: raw.recipientEmail || '',
      sourceUrl: raw.url || raw.googleDocUrl || raw.sourceUrl || '',
      evidence: [item.summary].filter(Boolean),
      origin: 'teach_val_onboarding',
      raw: item,
      noExternalAction: true
    };
  });
}

function normalizeCanonicalDocumentItem(item = {}){
  return {
    id: item.id || item.sourceId || 'canonical-document',
    title: item.title || 'VAL document',
    type: item.type || 'document',
    status: item.status || 'reference',
    relationship: item.relationship || (item.relationshipLinks || []).map((link) => link.name || link.email).filter(Boolean).join(', '),
    project: item.project || (item.projectLinks || []).map((link) => link.name).filter(Boolean).join(', '),
    source: item.source || item.sourceType || 'VAL document index',
    summary: item.summary || item.bodyPreview || 'Document reference is available.',
    referenceUse: item.referenceUse || 'Use as source evidence for relationship and project judgment.',
    needs: item.needs || 'Review before external use.',
    body: item.body || item.bodyPreview || item.summary || '',
    recipientEmail: item.recipientEmail || '',
    sourceUrl: item.sourceUrl || '',
    evidence: (item.sourceRefs || []).map((ref) => ref.quote_or_summary || ref.quoteOrSummary || ref.summary).filter(Boolean),
    origin: item.sourceType || 'val_documents_index',
    raw: item,
    noExternalAction: item.noExternalAction !== false
  };
}

function documentFilterOptions(items = [], key = ''){
  return Array.from(new Set(items.map((item) => String(item[key] || '').trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

function renderDocumentFilters(){
  if(documentRelationshipFilter){
    const selected = documentRelationshipFilter.value;
    documentRelationshipFilter.innerHTML = '<option value="">All relationships</option>' + documentFilterOptions(currentDocumentItems, 'relationship').map((value) => '<option value="' + escapeHtml(value) + '">' + escapeHtml(value) + '</option>').join('');
    documentRelationshipFilter.value = selected;
  }
  if(documentProjectFilter){
    const selected = documentProjectFilter.value;
    documentProjectFilter.innerHTML = '<option value="">All projects</option>' + documentFilterOptions(currentDocumentItems, 'project').map((value) => '<option value="' + escapeHtml(value) + '">' + escapeHtml(value) + '</option>').join('');
    documentProjectFilter.value = selected;
  }
}

function filteredDocumentItems(){
  const query = String(documentSearchInput?.value || '').trim().toLowerCase();
  const relationship = String(documentRelationshipFilter?.value || '').trim();
  const project = String(documentProjectFilter?.value || '').trim();
  return currentDocumentItems.filter((item) => {
    if(relationship && item.relationship !== relationship) return false;
    if(project && item.project !== project) return false;
    if(!query) return true;
    return [item.title, item.relationship, item.project, item.type, item.source, item.summary].join(' ').toLowerCase().includes(query);
  });
}

function setDocumentField(field, value){
  const node = document.querySelector('[data-document-field="' + field + '"]');
  if(node) node.textContent = value || '';
}

function documentSuggestedActions(item = activeDocumentItem){
  if(!item) return [];
  const actions = ['cowork_document', 'present'];
  const push = (action) => {
    if(action && !actions.includes(action)) actions.push(action);
  };
  const status = String(item.status || '').toLowerCase();
  const type = String(item.type || '').toLowerCase();
  const origin = String(item.origin || item.source || '').toLowerCase();
  const hasBody = Boolean(String(item.body || item.summary || '').trim());
  const hasSource = Boolean(String(item.sourceUrl || item.url || '').trim());
  const hasRecipient = Boolean(String(item.recipientEmail || '').trim());
  const isPreviewOnly = item.noExternalAction !== false || String(item.id || '').startsWith('local-');
  const needsLinks = !String(item.relationship || '').trim() || !String(item.project || '').trim();
  const editable = /draft|ready|prepared|proposal|copy|brief|report|html|document/.test([status,type,origin].join(' '));
  if(editable) push('update');
  if(hasBody && hasRecipient && !isPreviewOnly) push('send');
  if(hasSource) push('open_source');
  if(needsLinks || /onboarding|unlinked|reference/.test([status,origin,item.needs || ''].join(' ').toLowerCase())) push('link_context');
  return actions.filter((action) => [
    'cowork_document',
    'present',
    'update',
    'send',
    'open_source',
    'link_context'
  ].includes(action));
}

function documentSource(item = activeDocumentItem, action = ''){
  const selected = item || activeDocumentItem || null;
  return {
    document: selected,
    documentId: selected?.id || '',
    sourceId: selected?.id || '',
    sourceType: selected?.type ? 'document_' + selected.type : 'document',
    sourceLabel: selected?.title || 'Document',
    sourceItem: selected,
    relationshipName: selected?.relationship || '',
    projectName: selected?.project || '',
    relationshipId: selected?.relationshipId || selected?.relationship_id || '',
    projectId: selected?.projectId || selected?.project_id || '',
    emailThreadId: selected?.threadId || selected?.thread_id || '',
    transcriptId: selected?.transcriptId || selected?.transcript_id || '',
    calendarEventId: selected?.calendarEventId || selected?.calendar_event_id || '',
    draftId: selected?.draftId || selected?.draft_id || selected?.readyForYouId || '',
    sourceUrl: selected?.sourceUrl || '',
    sourceTitle: selected?.source || selected?.origin || '',
    sourceQuote: selected?.summary || selected?.referenceUse || '',
    suggestedActions: documentSuggestedActions(selected),
    requestedAction: action
  };
}

function documentActionNeedsLiveConfirmation(action = ''){
  return ['update','send','link_context'].includes(action);
}

function renderDocumentList(){
  if(!documentList || !documentCount) return;
  const rows = filteredDocumentItems();
  documentList.innerHTML = '';
  documentCount.textContent = rows.length ? rows.length + ' document' + (rows.length === 1 ? '' : 's') : 'No matching documents';
  if(!rows.length){
    const empty = document.createElement('article');
    empty.className = 'empty';
    empty.innerHTML = '<span>No documents found</span><p>Uploaded files, VAL-created documents, CRM files, email attachments, and Google Docs will appear here after they are connected or created.</p>';
    documentList.appendChild(empty);
    return;
  }
  rows.forEach((item) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.documentItem = item.id;
    const isActive = activeDocumentItem?.id === item.id;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
    const meta = [documentTypeLabel(item.type), item.status, item.source].filter(Boolean).join(' · ');
    const context = [item.relationship && 'Relationship: ' + item.relationship, item.project && 'Project: ' + item.project].filter(Boolean).join(' · ') || 'Context needs linking';
    button.innerHTML = '<span>' + escapeHtml(meta) + '</span><strong>' + escapeHtml(item.title) + '</strong><p>' + escapeHtml(item.summary || '') + '</p><small>' + escapeHtml(context) + '</small>';
    documentList.appendChild(button);
  });
}

function renderDocumentBrief(item = activeDocumentItem){
  activeDocumentItem = item || filteredDocumentItems()[0] || currentDocumentItems[0] || null;
  renderDocumentList();
  const selected = activeDocumentItem;
  setDocumentField('status', selected ? documentTypeLabel(selected.status) : 'Reference');
  setDocumentField('title', selected?.title || 'Select a document');
  setDocumentField('summary', selected?.summary || 'Documents, drafts, source material, and generated artifacts will appear here with relationship and project context.');
  setDocumentField('relationship', selected?.relationship || 'Unlinked');
  setDocumentField('project', selected?.project || 'Unlinked');
  setDocumentField('source', selected ? [selected.source, selected.origin].filter(Boolean).join(' · ') : 'No source selected.');
  setDocumentField('reference', selected?.referenceUse || 'VAL should use this document when judging linked relationships and projects.');
  setDocumentField('needs', selected?.needs || 'Review, update, send, or link missing context.');
  if(documentPreview){
    const body = selected?.body || selected?.evidence?.join('\n') || 'No document selected yet.';
    documentPreview.innerHTML = '<span>Document Preview</span><p>' + escapeHtml(String(body).slice(0, 2200)) + '</p>';
  }
  if(documentStatus) documentStatus.textContent = selected ? 'Selected document is reference material. Presenting is internal; updating and sending require review-gated action.' : 'Documents are reference material until the user approves an update, send, or external write.';
  document.querySelectorAll('[data-document-action]').forEach((button) => {
    const allowed = documentSuggestedActions(selected).includes(button.dataset.documentAction);
    button.hidden = !allowed;
    button.disabled = !selected || !allowed;
    button.setAttribute('aria-hidden', String(!allowed));
  });
}

async function hydrateDocumentDrawer(){
  currentDocumentItems = localDocumentItems.concat(localStoredDocuments());
  activeDocumentItem = currentDocumentItems[0] || null;
  renderDocumentFilters();
  renderDocumentBrief(activeDocumentItem);
  if(!canUseApi) return;
  try{
    const [documents, ready, onboarding] = await Promise.all([
      getJson('/api/val/documents?limit=120').catch(() => ({documents:[]})),
      postJson('/api/val/ready-for-you/build', {limit:5}).catch(() => ({items:[]})),
      getJson('/api/teach-val/onboarding').catch(() => ({}))
    ]);
    const byId = new Map();
    (documents.documents || []).map(normalizeCanonicalDocumentItem).concat(documentItemsFromReady(ready)).concat(documentItemsFromOnboarding(onboarding)).concat(currentDocumentItems).forEach((item) => {
      if(item?.id && !byId.has(item.id)) byId.set(item.id, item);
    });
    currentDocumentItems = Array.from(byId.values());
    activeDocumentItem = currentDocumentItems[0] || null;
    renderDocumentFilters();
    renderDocumentBrief(activeDocumentItem);
  }catch(error){
    if(documentStatus) documentStatus.textContent = 'Document services unavailable; showing local document previews only.';
  }
}

function openDocumentWorkspace(action, item = activeDocumentItem){
  if(!item) return;
  const actionLabel = action === 'update' ? 'Document update workspace' : action === 'link_context' ? 'Document context linking workspace' : 'Document review workspace';
  setWorkspaceContent({
    lens: 'Documents',
    title: item.title || 'Document ready for review',
    meaning: item.summary || 'This document is part of the evidence VAL should use.',
    understanding: [
      'Relationship: ' + (item.relationship || 'Unlinked'),
      'Project: ' + (item.project || 'Unlinked'),
      'Source: ' + (item.source || 'Unknown'),
      item.referenceUse || 'Use as relationship/project evidence.',
      item.needs || 'Review before external use.'
    ].filter(Boolean),
    recommendation: action === 'update'
      ? 'Review the requested changes before VAL updates a live document or creates a new version.'
      : action === 'link_context'
        ? 'Resolve relationship and project links so VAL can reference this document in the right places.'
        : 'Use this as a source-backed brief before deciding whether it should be updated, sent, or linked.',
    actions: [
      {label:'Back to Documents', workflow:'cancel:document'},
      {label:'Teach VAL', workflow:'teach'}
    ],
    label: actionLabel,
    returnTarget:'document'
  });
  openWorkspaceShell(actionLabel, {returnTarget:'document'});
  renderHearthPacketReceiptStrip(lastHearthPacketReceipt);
}

function documentSendPayload(item = activeDocumentItem){
  if(!item) return null;
  return {
    to: item.recipientEmail || '',
    subject: item.title || 'VAL document',
    body: item.body || item.summary || '',
    provider: 'gmail',
    sourceContext: {source:'hearth_documents_drawer', documentId:item.id, documentType:item.type, relationship:item.relationship || '', project:item.project || ''},
    sourceRefs: [{source_type:'hearth_documents_drawer', source_id:item.id, quote_or_summary:item.title || 'Document draft', confidence:0.85}],
    finalApprovalSurface: 'hearth_documents_drawer'
  };
}

async function handleDocumentAction(action){
  const item = activeDocumentItem;
  if(!item) return;
  if(action === 'cowork_document'){
    openContextualCoworkSession({
      returnTarget: 'document',
      title: 'Co-Work with VAL about ' + (item.title || 'this document') + '.',
      meaning: 'This Co-Work space is scoped to the selected document so VAL can help interpret, revise, summarize, or prepare from source evidence.',
      context: [
        'Document: ' + (item.title || 'Untitled'),
        'Relationship: ' + (item.relationship || 'Unlinked'),
        'Project: ' + (item.project || 'Unlinked'),
        'Source: ' + (item.source || item.origin || 'Unknown'),
        'Reference use: ' + (item.referenceUse || 'Use as relationship/project evidence.')
      ],
      recommendation: 'Use this to ask VAL what the document means, what should change, who it affects, or what artifact should be prepared next.',
      placeholder: 'What should VAL help you do with ' + (item.title || 'this document') + '?',
      helper: 'This Co-Work note is tagged to the selected document. Updating, sending, or changing source files still requires approval.',
      backWorkflow: 'cancel:document'
    });
    renderHearthPacketReceiptStrip(lastHearthPacketReceipt);
    return;
  }
  if(action === 'present' || action === 'update' || action === 'link_context'){
    openDocumentWorkspace(action, item);
    return;
  }
  if(action === 'open_source'){
    if(item.sourceUrl){
      window.open(item.sourceUrl, '_blank', 'noopener');
      if(documentStatus) documentStatus.textContent = 'Opened source document. No VAL data was changed.';
    }else if(documentStatus){
      documentStatus.textContent = 'No source URL is attached yet. Link CRM, email, upload, or Google Docs source context before opening externally.';
    }
    return;
  }
  if(action === 'send'){
    if(item.noExternalAction || String(item.id || '').startsWith('local-')){
      if(documentStatus) documentStatus.textContent = 'Local preview only: VAL can prepare this send for review, but no document, email, CRM record, Google Doc, Drive file, or external system was changed.';
      return;
    }
    const payload = documentSendPayload(item);
    if(!payload?.body){
      if(documentStatus) documentStatus.textContent = 'This document has no sendable body yet. Present or update it first.';
      return;
    }
    if(!payload.to){
      if(documentStatus) documentStatus.textContent = 'Recipient is missing. Link the relationship or confirm the recipient before sending.';
      return;
    }
    if(!canUseApi){
      if(documentStatus) documentStatus.textContent = 'The local VAL server is needed to send through the shared send gate. Nothing was sent.';
      return;
    }
    if(documentStatus) documentStatus.textContent = 'Preparing a send packet for review. Nothing is sent from this drawer click.';
    let packetResult;
    try{
      packetResult = await postJson('/api/val/external-actions/email-send-packet', payload);
    }catch(error){
      packetResult = error.data || {ok:false,error:error.message};
    }
    if(packetResult.ok && packetResult.packet){
      if(documentStatus) documentStatus.textContent = 'Send packet prepared for review. Nothing was sent; use the external-action approval gate for final confirmation.';
      activeDocumentItem = {...item, status:'send_packet_ready'};
      currentDocumentItems = currentDocumentItems.map((row) => row.id === item.id ? activeDocumentItem : row);
      renderDocumentBrief(activeDocumentItem);
      return;
    }
    if(documentStatus) documentStatus.textContent = 'Send packet was not prepared: ' + (packetResult.error || 'missing send context.');
  }
}

function correspondenceItemsFromReady(result = {}){
  return (Array.isArray(result.allBuilt) ? result.allBuilt : Array.isArray(result.items) ? result.items : [])
    .filter((item) => {
      const text = [item.category, item.itemType, item.type, item.title, item.metadataJson?.source, item.metadataJson?.preparedArtifactKind].join(' ').toLowerCase();
      return /email|draft|correspond|conversation|communication|executive_inbox/.test(text);
    })
    .map(normalizeCorrespondenceReadyItem);
}

function renderCorrespondenceList(){
  if(!correspondenceList || !correspondenceCount) return;
  correspondenceList.innerHTML = '';
  correspondenceCount.textContent = currentCorrespondenceItems.length ? currentCorrespondenceItems.length + ' prepared ' + (currentCorrespondenceItems.length === 1 ? 'reply' : 'replies') : 'No prepared replies waiting';
  if(!currentCorrespondenceItems.length){
    const empty = document.createElement('article');
    empty.className = 'empty';
    empty.innerHTML = '<span>Review-only</span><p>Prepared replies, draft-readiness items, and correspondence evidence will appear here when VAL has enough signal.</p>';
    correspondenceList.appendChild(empty);
    return;
  }
  currentCorrespondenceItems.forEach((item) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.correspondenceItem = item.id;
    const isActive = activeCorrespondenceItem?.id === item.id;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
    const label = document.createElement('span');
    label.textContent = item.status === 'needs_context' ? 'Needs Context' : 'Ready For Review';
    const title = document.createElement('strong');
    title.textContent = item.title;
    const summary = document.createElement('p');
    summary.textContent = item.summary;
    const small = document.createElement('small');
    small.textContent = [item.representationRisk && 'Risk: ' + item.representationRisk, item.source, 'No external action'].filter(Boolean).join(' · ');
    button.append(label, title, summary, small);
    correspondenceList.appendChild(button);
  });
}

function correspondenceSuggestedActions(item = activeCorrespondenceItem){
  if(!item) return [];
  const actions = ['cowork_correspondence', 'review'];
  if(item.conversationId) actions.push('generate');
  if(item.draftId) actions.push('revise');
  return actions;
}

function setCorrespondenceField(field, value){
  const node = document.querySelector('[data-correspondence-field="' + field + '"]');
  if(node) node.textContent = value || '';
}

function renderCorrespondenceBrief(item = activeCorrespondenceItem){
  activeCorrespondenceItem = item || currentCorrespondenceItems[0] || null;
  renderCorrespondenceList();
  const selected = activeCorrespondenceItem;
  setCorrespondenceField('status', selected ? (selected.status === 'needs_context' ? 'Needs context' : 'Review-only') : 'Review-only');
  setCorrespondenceField('title', selected?.title || 'Select a prepared reply');
  setCorrespondenceField('summary', selected?.summary || 'Prepared replies and draft-readiness items will appear here with evidence and approval boundaries.');
  setCorrespondenceField('whyNow', selected?.whyNow || 'No active correspondence selected.');
  setCorrespondenceField('context', selected?.context || 'Identity and project context will appear when known.');
  setCorrespondenceField('prepared', selected?.prepared || 'No draft selected yet.');
  setCorrespondenceField('needs', selected?.needs || 'Review, edit, approve, reject, or provide missing context.');
  if(correspondenceDraftPreview){
    correspondenceDraftPreview.innerHTML = '<span>Draft Preview</span><p>' + escapeHtml(selected?.draftBody || 'No draft body selected yet.') + '</p>';
  }
  if(correspondenceEvidence){
    const evidenceText = selected?.evidence?.length ? selected.evidence.slice(0, 5).map((line) => '- ' + line).join('\n') : 'Source excerpts will appear here.';
    correspondenceEvidence.innerHTML = '<span>Evidence</span><p>' + escapeHtml(evidenceText) + '</p>';
  }
  if(correspondenceSafety) correspondenceSafety.textContent = 'Drafting is private preparation inside VAL. Sending represents Jessa externally and still requires explicit approval.';
  document.querySelectorAll('[data-correspondence-action]').forEach((button) => {
    const allowed = correspondenceSuggestedActions(selected).includes(button.dataset.correspondenceAction);
    button.hidden = !allowed;
    button.disabled = !selected || !allowed;
    button.setAttribute('aria-hidden', String(!allowed));
  });
}

function showCorrespondenceLocalBoundary(action, item = activeCorrespondenceItem){
  if(!item) return;
  const needs = action === 'generate'
    ? 'I can only prepare a fresh saved draft when this item has a live conversation id. This preview already has private draft language ready for review.'
    : action === 'send'
      ? 'I can only send a saved draft that has a draft id and recipient context. Prepare or select a saved draft first.'
      : 'I can only tighten a saved draft when this item has a draft id. This preview draft is private preparation inside VAL, and no saved draft record was changed.';
  setCorrespondenceField('needs', needs);
  if(correspondenceSafety){
    correspondenceSafety.textContent = needs + ' Nothing was sent. Sending represents Jessa externally and still requires explicit approval.';
  }
}

function correspondencePacketSource(packet = {}){
  return packet.sourceContextJson || packet.source_context_json || {};
}

function sendPacketForDraft(packets = [], draftId = ''){
  return packets.find((packet) => {
    const source = correspondencePacketSource(packet);
    return packet.actionType === 'send_email' && String(source.draftId || source.draft_id || '') === String(draftId);
  }) || null;
}

function correspondenceSendPayload(item = activeCorrespondenceItem){
  if(!item) return null;
  const raw = item.raw || {};
  const source = raw.sourceContext || raw.source_context || {};
  const draft = source.writerOutput || source.draft || {};
  const subject = item.title || raw.subject || draft.subject || 'VAL follow-up';
  const body = item.draftBody || raw.body || draft.body || item.prepared || '';
  const recipientEmail = item.recipientEmail || source.to || source.recipientEmail || source.recipient || source.forwardTo || '';
  return {
    to: recipientEmail,
    subject,
    body,
    provider: item.provider || source.provider || raw.provider || 'gmail',
    threadId: item.threadId || source.threadId || '',
    messageId: source.messageId || '',
    sourceContext: {
      source: 'hearth_executive_inbox',
      draftId: item.draftId || '',
      readyForYouId: item.readyForYouId || '',
      conversationId: item.conversationId || '',
      originalSource: item.source || ''
    },
    sourceRefs: (item.evidence || []).map((line, index) => ({
      source_type: 'hearth_executive_inbox',
      source_id: item.id || item.draftId || 'hearth-correspondence',
      quote_or_summary: line,
      confidence: index === 0 ? 0.9 : 0.75
    })),
    finalApprovalSurface: 'hearth_executive_inbox_drawer'
  };
}

function correspondenceExecutionMessage(result = {}){
  if(result.executed){
    const summary = result.packet?.providerResponseSummary || result.receipt?.providerResponseSummary || 'Draft sent.';
    return summary + ' Execution receipt was recorded.';
  }
  const errors = result.risk_check?.errors || [];
  if(errors.includes('payload.to') || result.risk_check?.missing?.includes('payload.to')){
    return 'Send approval was captured, but VAL could not send because the recipient is missing.';
  }
  if(errors.includes('unsupported_adapter')){
    return 'Send approval was captured, but this email provider is not enabled for sending yet.';
  }
  if(errors.includes('final_confirmation_required') || errors.includes('final_send_confirmation_required')){
    return 'Send approval was captured, but final confirmation is still required.';
  }
  return 'Send approval was recorded, but the email was not sent: ' + (result.error || errors.join(', ') || result.packet?.failureReason || 'provider execution did not finish.');
}

async function hydrateCorrespondenceDrawer(){
  currentCorrespondenceItems = localCorrespondenceItems.slice();
  activeCorrespondenceItem = currentCorrespondenceItems[0] || null;
  renderCorrespondenceBrief(activeCorrespondenceItem);
  if(!canUseApi) return;
  try{
    const [ready, drafts] = await Promise.all([
      postJson('/api/val/ready-for-you/build', {limit:5}).catch(() => ({items:[]})),
      getJson('/api/val/email/review-drafts?limit=20').catch(() => ({drafts:[]}))
    ]);
    const merged = correspondenceItemsFromReady(ready).concat((drafts.drafts || []).map(normalizeCorrespondenceDraft));
    const byId = new Map();
    merged.concat(localCorrespondenceItems).forEach((item) => {
      if(item?.id && !byId.has(item.id)) byId.set(item.id, item);
    });
    currentCorrespondenceItems = Array.from(byId.values());
    activeCorrespondenceItem = currentCorrespondenceItems[0] || null;
    renderCorrespondenceBrief(activeCorrespondenceItem);
  }catch(error){
    console.warn('[hearth] correspondence drawer unavailable', error.message);
  }
}

function openCorrespondenceReviewWorkspace(item = activeCorrespondenceItem){
  if(!item) return;
  setWorkspaceContent({
    lens: 'Executive Inbox',
    title: item.title || 'Prepared reply ready for review',
    meaning: item.whyNow || item.summary || 'VAL prepared an important reply for review.',
    understanding: [
      item.context,
      item.prepared,
      item.needs,
      'Drafting is private preparation inside VAL; sending represents Jessa externally and still requires explicit approval.'
    ].filter(Boolean),
    recommendation: item.status === 'needs_context' ? 'Provide the missing context before approving any external use.' : 'Review voice, accuracy, and relationship consequence before anything is sent.',
    actions: [
      {label:'Back to Executive Inbox', workflow:'cancel:correspondence'},
      {label:'Teach VAL', workflow:'teach'}
    ],
    label: 'Executive Inbox review workspace',
    returnTarget:'correspondence'
  });
  openWorkspaceShell('Executive Inbox review workspace', {returnTarget:'correspondence'});
}

async function handleCorrespondenceAction(action){
  const item = activeCorrespondenceItem;
  if(!item) return;
  if(action === 'cowork_correspondence'){
    openContextualCoworkSession({
      returnTarget: 'correspondence',
      title: 'Co-Work with VAL about this reply.',
      meaning: item.whyNow || item.summary || 'This Co-Work space is scoped to the selected Executive Inbox item.',
      context: [
        'Prepared item: ' + (item.title || 'Reply draft'),
        'Relationship/project: ' + (item.context || 'Context is still being resolved.'),
        'VAL prepared: ' + (item.prepared || 'Draft context is available.'),
        'Needs from user: ' + (item.needs || 'Review before external use.')
      ],
      recommendation: 'Use this to tune voice, decide whether to send, add missing context, or reshape the reply before approval.',
      placeholder: 'What should VAL help you decide or rewrite about this reply?',
      helper: 'This Co-Work note is tagged to the selected Executive Inbox item. Sending still requires explicit approval.',
      backWorkflow: 'cancel:correspondence'
    });
    return;
  }
  if(action === 'review'){
    openCorrespondenceReviewWorkspace(item);
    return;
  }
  if(!canUseApi){
    if(correspondenceSafety) correspondenceSafety.textContent = 'The local VAL server is needed to prepare or revise saved drafts. Nothing was sent or changed externally.';
    return;
  }
  try{
    if(action === 'generate'){
      if(!item.conversationId){
        showCorrespondenceLocalBoundary('generate', item);
        return;
      }
      if(correspondenceSafety) correspondenceSafety.textContent = 'Preparing a private draft for review. Nothing will be sent from this click.';
      const result = await postJson('/api/val/email/generate-draft', {conversationId:item.conversationId});
      const generated = normalizeCorrespondenceDraft(result.draft || {});
      currentCorrespondenceItems = [generated].concat(currentCorrespondenceItems.filter((row) => row.id !== generated.id));
      activeCorrespondenceItem = generated;
      renderCorrespondenceBrief(generated);
    }
    if(action === 'revise'){
      if(!item.draftId){
        showCorrespondenceLocalBoundary('revise', item);
        return;
      }
      if(correspondenceSafety) correspondenceSafety.textContent = 'Tightening the private draft for review. Nothing will be sent from this click.';
      const result = await postJson('/api/val/email/revise-draft', {draftId:item.draftId});
      const revised = normalizeCorrespondenceDraft(result.draft || {});
      currentCorrespondenceItems = [revised].concat(currentCorrespondenceItems.filter((row) => row.id !== revised.id));
      activeCorrespondenceItem = revised;
      renderCorrespondenceBrief(revised);
    }
    if(action === 'send'){
      const payload = correspondenceSendPayload(item);
      if(!payload?.body){
        showCorrespondenceLocalBoundary('send', item);
        return;
      }
      if(correspondenceSafety) correspondenceSafety.textContent = 'Preparing a send packet for review. Nothing is sent from this drawer click.';
      let packetResult;
      try{
        packetResult = await postJson('/api/val/external-actions/email-send-packet', payload);
      }catch(executeError){
        packetResult = executeError.data || {ok:false,error:executeError.message};
      }
      if(packetResult.ok && packetResult.packet){
        if(correspondenceSafety) correspondenceSafety.textContent = 'Send packet prepared for review. Nothing was sent; use the external-action approval gate for final confirmation.';
        setCorrespondenceField('status', 'Send packet ready');
        setCorrespondenceField('needs', 'A send packet is ready for the external-action approval gate. No email was sent from this drawer.');
        return;
      }
      if(correspondenceSafety) correspondenceSafety.textContent = 'Send packet was not prepared: ' + (packetResult.error || 'missing send context.');
    }
  }catch(error){
    if(correspondenceSafety) correspondenceSafety.textContent = 'Correspondence action stayed local: ' + error.message;
  }
}

function commitmentLabel(value = ''){
  return String(value || '').replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function commitmentDueLabel(value = ''){
  if(!value) return 'No due date';
  const date = new Date(value);
  if(isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {month:'short', day:'numeric'});
}

function commitmentItemsForFilter(){
  return currentCommitmentItems.filter((item) => {
    if(activeCommitmentFilter === 'all') return !['complete','dismissed'].includes(item.status);
    if(activeCommitmentFilter === 'complete') return item.status === 'complete';
    if(activeCommitmentFilter === 'drafted') return item.status === 'drafted' || item.draft_id || item.task_id;
    if(activeCommitmentFilter === 'overdue') return item.status === 'overdue';
    if(activeCommitmentFilter === 'needs_resolution') return item.status === 'needs_resolution' || item.owner_type === 'unknown';
    return item.owner_type === activeCommitmentFilter;
  });
}

function updateCommitmentSummary(summary = {}){
  document.querySelectorAll('[data-commitment-summary]').forEach((node) => {
    node.textContent = summary[node.dataset.commitmentSummary] ?? 0;
  });
}

function setCommitmentField(field, value){
  const node = document.querySelector('[data-commitment-field="' + field + '"]');
  if(node) node.textContent = value || '';
}

function commitmentSuggestedActions(item = activeCommitmentItem){
  if(!item) return [];
  const actions = ['cowork_commitment'];
  const explicit = Array.isArray(item.suggested_actions) ? item.suggested_actions : Array.isArray(item.suggestedActions) ? item.suggestedActions : [];
  const push = (action) => {
    if(action && !actions.includes(action)) actions.push(action);
  };
  explicit.forEach(push);
  if(item.suggested_action_type) push(item.suggested_action_type);
  if(item.owner_type === 'user'){
    push('draft_email');
    push('create_task');
  }
  if(item.owner_type === 'contact'){
    push('draft_email');
  }
  if(item.status === 'needs_resolution' || item.owner_type === 'unknown') push('resolve_contact');
  if(item.task_id || item.due_at || item.suggested_action_type === 'schedule') push('schedule');
  if(item.status === 'drafted' || item.task_id || item.draft_id) push('show_source');
  push('show_source');
  if(item.status === 'ready_for_completion' || item.can_complete === true || item.canComplete === true) push('complete');
  if(item.can_delegate === true || item.canDelegate === true) push('delegate');
  if(item.dismissable === true || item.can_dismiss === true || item.canDismiss === true) push('dismiss');
  return actions.filter((action) => [
    'cowork_commitment',
    'draft_email',
    'create_task',
    'schedule',
    'complete',
    'delegate',
    'dismiss',
    'show_source',
    'resolve_contact'
  ].includes(action));
}

function commitmentSource(item = activeCommitmentItem, action = ''){
  const selected = item || activeCommitmentItem || null;
  return {
    commitment: selected,
    commitmentId: selected?.id || '',
    sourceId: selected?.id || '',
    sourceType: selected?.source_type ? 'commitment_' + selected.source_type : 'commitment',
    sourceLabel: selected?.title || 'Commitment',
    sourceItem: selected,
    ownerType: selected?.owner_type || '',
    ownerName: selected?.owner_name || '',
    counterpartyName: selected?.counterparty_name || '',
    relationshipId: selected?.relationship_id || selected?.relationshipId || selected?.contact_id || selected?.contactId || '',
    projectId: selected?.project_id || selected?.projectId || '',
    emailThreadId: selected?.thread_id || selected?.threadId || selected?.conversation_id || selected?.conversationId || '',
    transcriptId: selected?.transcript_id || selected?.transcriptId || '',
    calendarEventId: selected?.calendar_event_id || selected?.calendarEventId || '',
    taskId: selected?.task_id || selected?.taskId || '',
    draftId: selected?.draft_id || selected?.draftId || '',
    sourceTitle: selected?.source_title || '',
    sourceQuote: selected?.evidence_quote || selected?.evidence_summary || '',
    suggestedActions: commitmentSuggestedActions(selected),
    requestedAction: action
  };
}

function commitmentActionNeedsLiveConfirmation(action = ''){
  return ['draft_email','create_task','schedule','complete','delegate','dismiss'].includes(action);
}

function renderCommitmentList(){
  if(!commitmentList) return;
  commitmentList.innerHTML = '';
  const rows = commitmentItemsForFilter();
  if(!rows.length){
    const empty = document.createElement('article');
    empty.className = 'empty';
    empty.innerHTML = '<span>No active commitments yet</span><p>VAL will surface promises, next steps, and follow-through here as transcripts, emails, meetings, and conversations are processed.</p>';
    commitmentList.appendChild(empty);
    return;
  }
  rows.forEach((item) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.commitmentItem = item.id;
    const isActive = activeCommitmentItem?.id === item.id;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
    const meta = [commitmentLabel(item.owner_type), item.source_type, item.status, 'Risk: ' + commitmentLabel(item.risk_level)].filter(Boolean).join(' · ');
    button.innerHTML = '<span>' + escapeHtml(meta) + '</span><strong>' + escapeHtml(item.title) + '</strong><p>' + escapeHtml(item.evidence_quote || item.description || '') + '</p><small>' + escapeHtml((item.owner_name || 'Unknown') + ' · ' + commitmentDueLabel(item.due_at)) + '</small>';
    commitmentList.appendChild(button);
  });
}

function renderCommitmentBrief(item = activeCommitmentItem){
  activeCommitmentItem = item || currentCommitmentItems[0] || null;
  renderCommitmentList();
  const selected = activeCommitmentItem;
  setCommitmentField('status', selected ? commitmentLabel(selected.status) : 'Open');
  setCommitmentField('title', selected?.title || 'Select a commitment');
  setCommitmentField('description', selected?.description || 'Promises, next steps, and follow-through will appear here with evidence and ownership.');
  setCommitmentField('owner', selected ? [selected.owner_name, commitmentLabel(selected.owner_type)].filter(Boolean).join(' · ') : 'Unknown');
  setCommitmentField('counterparty', selected?.counterparty_name || 'Unknown');
  setCommitmentField('due', selected ? commitmentDueLabel(selected.due_at) : 'No due date');
  setCommitmentField('source', selected ? [commitmentLabel(selected.source_type), selected.source_title || selected.source_id].filter(Boolean).join(' · ') : 'No source selected.');
  setCommitmentField('risk', selected ? commitmentLabel(selected.risk_level) + ' · ' + commitmentLabel(selected.priority) : 'Medium');
  setCommitmentField('next', selected?.next_action || 'Review commitment.');
  if(commitmentEvidence){
    commitmentEvidence.innerHTML = '<span>Evidence</span><p>' + escapeHtml(selected?.evidence_quote || 'Source quote will appear here.') + '</p>';
  }
  if(commitmentStatus) commitmentStatus.textContent = selected ? 'Selected commitment is evidence-backed. Drafts and tasks stay local until you act; sends still require approval.' : 'Commitments are accountability records. Drafts and tasks require visible user action; sends still require approval.';
  document.querySelectorAll('[data-commitment-action]').forEach((button) => {
    const allowed = commitmentSuggestedActions(selected).includes(button.dataset.commitmentAction);
    button.hidden = !allowed;
    button.disabled = !selected || !allowed;
    button.setAttribute('aria-hidden', String(!allowed));
  });
}

async function hydrateCommitmentDrawer(){
  currentCommitmentItems = localCommitmentItems.slice();
  activeCommitmentItem = currentCommitmentItems[0] || null;
  updateCommitmentSummary({you_owe:1, others_owe_you:1, overdue:0, ready_for_approval:0});
  renderCommitmentBrief(activeCommitmentItem);
  if(!canUseApi) return;
  try{
    const result = await getJson('/api/val/commitments?limit=120');
    if(Array.isArray(result.commitments) && result.commitments.length){
      currentCommitmentItems = result.commitments;
      activeCommitmentItem = currentCommitmentItems[0] || null;
      updateCommitmentSummary(result.summary || {});
      renderCommitmentBrief(activeCommitmentItem);
    }else{
      updateCommitmentSummary(result.summary || {you_owe:0, others_owe_you:0, overdue:0, ready_for_approval:0});
    }
  }catch(error){
    if(commitmentStatus) commitmentStatus.textContent = 'Commitments API unavailable; showing local preview only.';
  }
}

async function handleCommitmentAction(action){
  const item = activeCommitmentItem;
  if(!item) return;
  if(action === 'cowork_commitment'){
    openContextualCoworkSession({
      returnTarget: 'commitment',
      title: 'Co-Work with VAL about ' + (item.title || 'this commitment') + '.',
      meaning: item.description || item.evidence_quote || 'This Co-Work space is scoped to the selected commitment.',
      context: [
        'Commitment: ' + (item.title || 'Untitled'),
        'Owner: ' + [item.owner_name, commitmentLabel(item.owner_type)].filter(Boolean).join(' · '),
        'Counterparty: ' + (item.counterparty_name || 'Unknown'),
        'Due: ' + commitmentDueLabel(item.due_at),
        'Evidence: ' + (item.evidence_quote || 'No quote attached yet.'),
        'Next action: ' + (item.next_action || 'Review commitment.')
      ],
      recommendation: 'Use this to decide the right follow-through, draft language, renegotiate scope, or clarify ownership before acting.',
      placeholder: 'What should VAL help you decide or prepare for this commitment?',
      helper: 'This Co-Work note is tagged to the selected commitment. Sends, task changes, and status updates stay approval-gated.',
      backWorkflow: 'cancel:commitment'
    });
    renderHearthPacketReceiptStrip(lastHearthPacketReceipt);
    return;
  }
  if(String(item.id || '').startsWith('local-') && commitmentActionNeedsLiveConfirmation(action)){
    if(commitmentStatus){
      commitmentStatus.textContent = 'Local preview only: VAL can prepare this action for review, but no draft, task, schedule change, status update, delegation, dismissal, send, CRM update, or calendar change happened.';
    }
    return;
  }
  if(!canUseApi){
    if(commitmentStatus) commitmentStatus.textContent = 'The local VAL server is needed for commitment actions. Nothing changed.';
    return;
  }
  try{
    if(action === 'draft_email'){
      if(commitmentStatus) commitmentStatus.textContent = 'Drafting follow-up from commitment evidence...';
      const result = await postJson('/api/val/commitments/' + encodeURIComponent(item.id) + '/draft-email', {});
      activeCommitmentItem = result.commitment || item;
      currentCommitmentItems = currentCommitmentItems.map((row) => row.id === item.id ? activeCommitmentItem : row);
      renderCommitmentBrief(activeCommitmentItem);
      if(commitmentStatus) commitmentStatus.textContent = 'Draft created for review. Nothing was sent.';
      return;
    }
    if(action === 'create_task'){
      const result = await postJson('/api/val/commitments/' + encodeURIComponent(item.id) + '/create-task', {});
      activeCommitmentItem = result.commitment || item;
      currentCommitmentItems = currentCommitmentItems.map((row) => row.id === item.id ? activeCommitmentItem : row);
      renderCommitmentBrief(activeCommitmentItem);
      if(commitmentStatus) commitmentStatus.textContent = 'Task created from commitment evidence and linked locally.';
      return;
    }
    if(action === 'complete' || action === 'dismiss'){
      const status = action === 'complete' ? 'complete' : 'dismissed';
      const result = await postJson('/api/val/commitments/' + encodeURIComponent(item.id) + '/status', {status, reason: action === 'dismiss' ? 'Dismissed from Commitments drawer.' : ''});
      activeCommitmentItem = result.commitment || {...item,status};
      currentCommitmentItems = currentCommitmentItems.map((row) => row.id === item.id ? activeCommitmentItem : row);
      renderCommitmentBrief(activeCommitmentItem);
      if(commitmentStatus) commitmentStatus.textContent = action === 'complete' ? 'Commitment marked complete.' : 'Commitment dismissed with local audit context.';
      return;
    }
    if(action === 'delegate'){
      const result = await postJson('/api/val/commitments/' + encodeURIComponent(item.id) + '/status', {status:'delegated'});
      activeCommitmentItem = result.commitment || {...item,status:'delegated'};
      currentCommitmentItems = currentCommitmentItems.map((row) => row.id === item.id ? activeCommitmentItem : row);
      renderCommitmentBrief(activeCommitmentItem);
      if(commitmentStatus) commitmentStatus.textContent = 'Commitment marked delegated. Full owner reassignment can attach a resolved contact next.';
      return;
    }
    if(action === 'schedule'){
      setWorkspaceContent({
        lens:'Commitments',
        title:'Schedule commitment follow-through',
        meaning:item.title,
        understanding:[item.evidence_quote, item.owner_name, item.due_at ? commitmentDueLabel(item.due_at) : 'No due date yet'].filter(Boolean),
        recommendation:'Use the existing calendar/task scheduling flow once this commitment has a confirmed task or date.',
        actions:[{label:'Back to Commitments', workflow:'cancel:commitment'}],
        label:'Commitment scheduling workspace'
      });
      openWorkspaceShell('Commitment scheduling workspace', {returnTarget:'commitment'});
      renderHearthPacketReceiptStrip(lastHearthPacketReceipt);
      return;
    }
    if(action === 'show_source'){
      if(commitmentStatus) commitmentStatus.textContent = 'Source: ' + [commitmentLabel(item.source_type), item.source_title || item.source_id, item.evidence_quote].filter(Boolean).join(' · ');
      return;
    }
    if(action === 'resolve_contact'){
      if(commitmentStatus) commitmentStatus.textContent = 'Contact resolution needed. VAL will not guess or create duplicate relationship records.';
    }
  }catch(error){
    if(commitmentStatus) commitmentStatus.textContent = 'Commitment action did not complete: ' + error.message;
  }
}

function projectContextActions(actions = []){
  const name = activeProjectProfile?.name || 'project';
  return actions.concat([
    {label:'Back to ' + name, workflow:'cancel:project'},
    {label:'All projects', workflow:'projectAllProjects'}
  ]);
}

function activeProjectChatContext(){
  const project = activeProjectProfile || null;
  if(!project) return null;
  return {
    projectId: project.projectId || project.id || '',
    projectProfileId: project.id || '',
    projectName: project.name || 'Project',
    sourceReceipts: project.sourceReceipts || '',
    sourceDetails: normalizedProjectSourceDetails(project),
    status: project.status || '',
    nextMove: project.nextMove || ''
  };
}

function showProjectReceipt({title, meaning, understanding = [], recommendation, actions = []}){
  setWorkspaceContent({
    lens: 'Project Judgment',
    title,
    meaning,
    understanding,
    recommendation,
    actions: projectContextActions(actions),
    label: 'Project action workspace'
  });
  openWorkspaceShell('Project action workspace', {returnTarget:'project'});
}

function openProjectCoworkSession(){
  const project = activeProjectProfile || projectProfiles.frisson;
  closeCalendarPanel();
  closeDrawer();
  setWorkspaceContent({
    lens: 'Co-Work with VAL',
    title: 'Co-Work with VAL about ' + project.name + '.',
    meaning: 'This Co-Work space is scoped to the active project so the conversation can stay organized around project context.',
    understanding: [
      'Project: ' + project.name,
      'Current reality: ' + (project.reality || project.status || 'Project context is available.'),
      'Source receipts: ' + (project.sourceReceipts || 'Source receipts are not attached yet.'),
      'No task, CRM update, calendar change, message, or project status change happens from this Co-Work space.'
    ],
    recommendation: 'Use this to think, draft, decide, or clarify what VAL should remember for this project.',
    actions: [
      {label: 'Think with VAL', workflow: 'cowork:think'},
      {label: 'Draft with VAL', workflow: 'cowork:draft'},
      {label: 'Back to ' + project.name, workflow: 'cancel:project'}
    ],
    label: 'Project Co-Work with VAL workspace'
  });
  renderWorkspaceInput({
    label: 'Co-Work with VAL about this project',
    placeholder: 'What should VAL help you think through for ' + project.name + '?',
    helper: 'This Co-Work note is tagged to the active project. External actions still require a separate approval step.',
    mode: 'cowork'
  });
  openWorkspaceShell('Project Co-Work with VAL workspace', {returnTarget:'project'});
}

function openContextualCoworkSession({returnTarget = 'home', title, meaning, context = [], recommendation, placeholder, helper, backWorkflow}){
  const safeTitle = title || 'Co-Work with VAL';
  setWorkspaceContent({
    lens: 'Co-Work with VAL',
    title: safeTitle,
    meaning: meaning || 'This Co-Work space is scoped to the context you opened it from.',
    understanding: context.concat(['No email, CRM update, task, memory write, calendar change, document send, public post, or external action happens from this Co-Work space.']).filter(Boolean),
    recommendation: recommendation || 'Use this to think, draft, decide, or give VAL the missing context before action.',
    actions: [
      {label: 'Think with VAL', workflow: 'cowork:think'},
      {label: 'Draft with VAL', workflow: 'cowork:draft'},
      {label: 'Back', workflow: backWorkflow || ('cancel:' + returnTarget)}
    ],
    label: safeTitle
  });
  renderWorkspaceInput({
    label: safeTitle,
    placeholder: placeholder || 'What should VAL help you think through here?',
    helper: helper || 'This Co-Work note stays tied to the active context. External actions still require a separate approval step.',
    mode: 'cowork'
  });
  openWorkspaceShell(safeTitle, {returnTarget});
}

function handleProjectAction(action){
  const project = activeProjectProfile || projectProfiles.frisson;
  if(action === 'cowork_project'){
    openProjectCoworkSession();
    return;
  }
  if(action === 'open_project_file'){
    showProjectReceipt({
      title: project.name + ' project file is ready to inspect.',
      meaning: project.reality,
      understanding: [
        'Current reality: ' + project.status,
        'Momentum: ' + project.momentumEvidence,
        'Decision point: ' + project.decisionEvidence,
        'No task, CRM update, message, scrape, or import happened from this click.'
      ],
      recommendation: project.nextMoveEvidence,
      actions: [
        {label:'Ask what matters now', workflow:'project:ask_priority'},
        {label:'Show alternatives', workflow:'project:show_alternatives'}
      ]
    });
    return;
  }
  if(action === 'ask_priority'){
    showProjectReceipt({
      title: project.name + ' priority is ready to judge.',
      meaning: project.reality,
      understanding: [
        'Project: ' + project.name,
        'Current status: ' + project.status,
        'Decision point: ' + project.decision,
        'Evidence: ' + project.decisionEvidence,
        'No task, CRM update, message, scrape, import, or project status change happened from this click.'
      ],
      recommendation: project.nextMoveEvidence || project.nextMove,
      actions: [
        {label:'Open project file', workflow:'project:open_project_file'},
        {label:'Show alternatives', workflow:'project:show_alternatives'}
      ]
    });
    return;
  }
  if(action === 'show_alternatives'){
    showProjectReceipt({
      title: project.name + ' alternatives are ready to compare.',
      meaning: project.momentumEvidence || project.reality,
      understanding: [
        'Option A: ' + (project.nextMove || 'Review the current project file.'),
        'Option B: Resolve the decision point first - ' + (project.decision || 'review project reality') + '.',
        'Option C: Hold the project until stronger evidence appears.',
        'No task, CRM update, message, scrape, import, or project status change happened from this click.'
      ],
      recommendation: project.nextMoveEvidence || project.decisionEvidence || project.reality,
      actions: [
        {label:'Ask what matters now', workflow:'project:ask_priority'},
        {label:'Open project file', workflow:'project:open_project_file'}
      ]
    });
  }
}

function renderRelationshipProfile(profileId = 'aric', providedProfile = null){
  const profile = {...(providedProfile || relationshipProfiles[profileId] || relationshipProfiles.aric), profileId};
  activeRelationshipProfile = profile;
  document.querySelectorAll('[data-relationship-field]').forEach((node) => {
    const field = node.dataset.relationshipField;
    if(field === 'href'){
      node.setAttribute('href', relationshipRouteUrl(profile.href));
      return;
    }
    node.textContent = profile[field] || '';
  });
  relationshipFolderButtons.forEach((button) => {
    const active = button.dataset.relationshipProfile === profileId;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  renderRelationshipActions(profile);
  renderRelationshipSectionActions(profile);
  renderRelationshipTemperatureReview(profile);
  hydrateRelationshipProjectLinks(profile);
  hydrateRelationshipDocuments(profile);
  setRelationshipDetailMode('brief');
}

function relationshipRouteUrl(route = ''){
  const value = String(route || '').trim();
  if(!value) return '#';
  if(/^https?:\/\//i.test(value)) return value;
  if(location.protocol === 'http:' || location.protocol === 'https:'){
    return new URL(value, location.href).href;
  }
  return new URL(value, 'http://127.0.0.1:3199/hearth-prototype.html').href;
}

function openRelationshipRoute(route, profile = {}, options = {}){
  const href = relationshipRouteUrl(route || profile.href);
  if(href === '#') return false;
  if(options.sameTab) window.location.href = href;
  else window.open(href, '_blank', 'noopener');
  return true;
}

function initialsFromName(name = ''){
  return String(name || 'R')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'R';
}

function relationshipProfileFromDossier(dossier = {}, fallback = {}){
  const brief = dossier.relationshipBrief || {};
  const briefIdentity = brief.identity || {};
  const currentReality = brief.currentReality || {};
  const strategicImportance = brief.strategicImportance || {};
  const sourceReceipts = brief.sourceReceipts || {};
  const identity = dossier.identity || {};
  const observation = dossier.observation || {};
  const interpretation = dossier.interpretation || {};
  const meaning = dossier.meaning || {};
  const wisdom = dossier.wisdom || {};
  const actions = dossier.actions || {};
  const actionItems = Array.isArray(actions.items) ? actions.items : [];
  const openAction = actionItems.find((action) => action.id === 'open_full_file');
  const latestLinkedInPost = Array.isArray(sourceReceipts.linkedInLatestPosts) && sourceReceipts.linkedInLatestPosts.length
    ? sourceReceipts.linkedInLatestPosts[0]
    : null;
  const observerReceiptLine = Array.isArray(sourceReceipts.observers) && sourceReceipts.observers.length
    ? sourceReceipts.observers.map((observer) => [observer.label || observer.id, observer.status].filter(Boolean).join(' ')).join(' · ')
    : fallback.sourceReceipts || 'GHL contact required before observers can merge relationship context.';
  return {
    id: dossier.id || identity.id || fallback.query?.targetId || fallback.name || 'relationship',
    dossier,
    query: fallback.query || {},
    contactId: identity.crmContactId || fallback.contactId || fallback.query?.contactId || '',
    crmContactId: identity.crmContactId || fallback.crmContactId || '',
    personId: fallback.personId || fallback.query?.contactId || '',
    name: briefIdentity.name || identity.name || fallback.name || 'Relationship',
    initials: initialsFromName(briefIdentity.name || identity.name || fallback.name),
    role: briefIdentity.role || identity.role || fallback.role || briefIdentity.status || identity.status || 'Relationship',
    temperature: fallback.temperature || '',
    relationshipState: fallback.relationshipState || '',
    relationshipStateLabel: fallback.relationshipStateLabel || '',
    temperatureMeaning: fallback.temperatureMeaning || '',
    temperatureObservers: fallback.temperatureObservers || [],
    temperatureScoreRange: fallback.temperatureScoreRange || [],
    temperatureEvidence: fallback.temperatureEvidence || [],
    temperatureConflict: fallback.temperatureConflict || null,
    identity: [briefIdentity.company || identity.company, briefIdentity.status || identity.status, (briefIdentity.tags || identity.tags)?.slice?.(0, 2)?.join(' / ')].filter(Boolean).join(' · ') || fallback.identity || '',
    contact: [identity.email, briefIdentity.company || identity.company, briefIdentity.crmContactId ? 'CRM/GHL ' + briefIdentity.crmContactId : ''].filter(Boolean).join(' · ') || fallback.contact || '',
    wisdom: brief.executiveReminder || wisdom.oneThingToRemember || fallback.wisdom || '',
    evidence: currentReality.summary || observation.summary || observation.evidence?.[0]?.summary || fallback.evidence || '',
    patterns: Array.isArray(brief.executiveAssessment) && brief.executiveAssessment.length ? brief.executiveAssessment.slice(0, 3).join(' ') : (interpretation.pattern || interpretation.momentum || fallback.patterns || ''),
    meaning: strategicImportance.summary || meaning.whyItMatters || meaning.executiveValue || fallback.meaning || '',
    certainty: Array.isArray(brief.observerNotes) && brief.observerNotes.length ? brief.observerNotes.slice(0, 3).map((note) => [note.observer, note.note].filter(Boolean).join(': ')).join(' | ') : (actions.primary || fallback.certainty || 'You know what this relationship needs before deciding what to do next.'),
    linkedinSignal: latestLinkedInPost ? (latestLinkedInPost.summary || latestLinkedInPost.title || latestLinkedInPost.text || 'LinkedIn has a recent signal worth reviewing.') : (fallback.linkedinSignal || 'LinkedIn is being watched for useful public context.'),
    sourceReceipts: observerReceiptLine,
    projectLinks: Array.isArray(fallback.projectLinks) ? fallback.projectLinks : [],
    href: openAction?.route || './dashboard.html?view=relationships&targetType=person&targetId=' + encodeURIComponent(identity.id || fallback.query?.targetId || fallback.name || 'relationship'),
    actions: actionItems,
    sectionActions: actions.sections || {}
  };
}

function contactCandidatePayloadFromRelationship(profile = {}){
  const query = profile.query || {};
  const name = profile.name || query.name || 'Unresolved person';
  const email = query.email || '';
  return {
    name,
    email: email || undefined,
    source: 'VAL relationship identity gate',
    tags: ['val_relationship_identity_review'],
    note: 'Created from Relationship file identity gate after CRM/GHL lookup did not return a canonical contact ID.'
  };
}

function relationshipProfileFromUnresolvedIdentity(data = {}, fallback = {}){
  const name = data.input?.name || fallback.name || 'Unresolved person';
  const email = data.input?.email || fallback.query?.email || '';
  const matches = Array.isArray(data.matches) ? data.matches : [];
  return {
    id: data.input?.contactId || fallback.query?.targetId || name,
    unresolvedIdentity: true,
    unresolvedData: data,
    name,
    initials: initialsFromName(name),
    role: 'Identity unresolved',
    identity: 'Not organized in GHL yet',
    contact: email || 'No canonical CRM/GHL contact ID is attached.',
    wisdom: 'Create or match the contact before VAL attaches relationship context.',
    evidence: 'VAL found possible relationship context, but it is holding that context until identity is clean.',
    patterns: matches.length ? matches.slice(0, 2).map((match) => [match.name, match.email, match.source].filter(Boolean).join(' · ')).join(' | ') : 'No confident GHL match was returned.',
    meaning: 'This prevents transcripts, calendar attendees, emails, and notes from overlapping the wrong person.',
    certainty: 'Resolve identity first. Then build the Relationship Dossier from the returned GHL contact ID.',
    href: '#',
    actions: [
      {id:'search_ghl_contacts',label:'Search GHL contacts',type:'identity_gate',willDo:'Show the possible GHL matches returned by the resolver.',willNotDo:'No contact will be created or merged.'},
      {id:'review_new_contact_candidate',label:'Review new contact candidate',type:'identity_gate',willDo:'Review a new GHL contact candidate before creation.',willNotDo:'VAL will not create a contact without review.'}
    ],
    sectionActions: {},
    contactCandidate:{payload:contactCandidatePayloadFromRelationship({...fallback,name,query:{...(fallback.query||{}),email}})}
  };
}

function preferredRelationshipActions(actions = []){
  const preferred = ['search_ghl_contacts','review_new_contact_candidate','open_full_file','ask_alignment','draft_message','draft_linkedin_comment','draft_linkedin_dm','create_task','brainstorm','review_linkedin_activity','find_relationship_introductions','refresh_relationship_observers'];
  return preferred.map((id) => actions.find((action) => action.id === id)).filter(Boolean);
}

function relationshipSuggestedActions(profile = {}){
  if(profile.unresolvedIdentity){
    return [
      {id:'search_ghl_contacts',label:'Search GHL contacts',type:'identity_gate',willDo:'Show possible GHL matches for this person.',willNotDo:'No contact will be created or merged.'},
      {id:'review_new_contact_candidate',label:'Review new contact candidate',type:'identity_gate',willDo:'Review the proposed contact before creation.',willNotDo:'VAL will not create a contact without review.'}
    ];
  }
  const state = String(profile.relationshipState || profile.relationshipStateLabel || '').toLowerCase();
  const evidence = [profile.evidence, profile.signal, profile.certainty, profile.linkedinSignal].join(' ').toLowerCase();
  const actions = [
    {id:'open_full_file',label:'Open full file',type:'route',route:profile.href,willDo:'Open the full relationship file.',willNotDo:'No external action will happen.'}
  ];
  if(state.includes('waiting') || evidence.includes('reply') || evidence.includes('proposal') || evidence.includes('loop')){
    actions.push(
      {id:'draft_message',label:'Draft reply',type:'endpoint',willDo:'Prepare a relationship-specific reply for review.',willNotDo:'Nothing will be sent.'},
      {id:'create_task',label:'Create follow-up task',type:'endpoint',willDo:'Prepare a task connected to this relationship loop.',willNotDo:'No external system will be changed without approval.'},
      {id:'ask_alignment',label:'Ask what matters now',type:'workspace',workspace:'alignment'}
    );
    return actions;
  }
  if(state.includes('strategic') || evidence.includes('partner') || evidence.includes('momentum')){
    actions.push(
      {id:'cowork_relationship',label:'Co-Work with VAL',type:'workspace',willDo:'Think with VAL using this relationship file.',willNotDo:'No email, CRM update, task, or post will happen.'},
      {id:'find_relationship_introductions',label:'Review introductions',type:'endpoint',willDo:'Prepare review-only introduction candidates.',willNotDo:'No introduction will be sent.'},
      {id:'review_linkedin_activity',label:'Review LinkedIn signal',type:'endpoint',willDo:'Show the latest known LinkedIn signal.',willNotDo:'No post, comment, scrape, message, or CRM change will happen.'}
    );
    return actions;
  }
  actions.push(
    {id:'draft_message',label:'Draft check-in',type:'endpoint',willDo:'Prepare a warm relationship-specific check-in for review.',willNotDo:'Nothing will be sent.'},
    {id:'create_task',label:'Create follow-up task',type:'endpoint',willDo:'Prepare a task connected to this relationship.',willNotDo:'No external system will be changed without approval.'},
    {id:'teach_wisdom',label:'Teach VAL',type:'teach',willDo:'Open a teaching moment about this relationship.',willNotDo:'VAL will not save durable memory without review.'}
  );
  return actions;
}

function renderRelationshipActions(profile = {}){
  const container = document.querySelector('.relationship-actions');
  if(!container) return;
  const actions = preferredRelationshipActions(Array.isArray(profile.actions) ? profile.actions : []);
  const safeActions = actions.length ? actions : relationshipSuggestedActions(profile);
  const actionHtml = (action) => {
    const label = escapeHtml(action.label || 'Review');
    const title = escapeHtml([action.willDo, action.willNotDo].filter(Boolean).join(' '));
    if(action.type === 'route'){
      const href = escapeHtml(relationshipRouteUrl(action.route || profile.href || '#'));
      return '<a href="' + href + '" data-relationship-action="' + escapeHtml(action.id) + '" title="' + title + '">' + label + '</a>';
    }
    return '<button type="button" data-relationship-action="' + escapeHtml(action.id) + '" title="' + title + '">' + label + '</button>';
  };
  const groups = [
    {label:'Suggested next moves', ids:['draft_message','create_task','ask_alignment','cowork_relationship','find_relationship_introductions','review_linkedin_activity','teach_wisdom','open_full_file','search_ghl_contacts','review_new_contact_candidate','draft_linkedin_comment','draft_linkedin_dm','brainstorm','refresh_relationship_observers','mark_vip','not_important','snooze']}
  ];
  const groupedHtml = groups.map((group) => {
    const groupActions = safeActions.filter((action) => group.ids.includes(action.id));
    return groupActions.length
      ? '<div class="relationship-action-group"><strong>' + group.label + '</strong><div>' + groupActions.map(actionHtml).join('') + '</div></div>'
      : '';
  }).join('');
  container.innerHTML = groupedHtml || safeActions.map(actionHtml).join('');
}

function relationshipSectionActions(profile = {}, section = ''){
  const sections = profile.sectionActions || profile.dossier?.actions?.sections || defaultRelationshipSectionActions(profile.name || 'this relationship');
  return Array.isArray(sections[section]) ? sections[section] : [];
}

function relationshipAllSectionActions(profile = {}){
  const sections = profile.sectionActions || profile.dossier?.actions?.sections || defaultRelationshipSectionActions(profile.name || 'this relationship');
  return Object.values(sections).flat().filter(Boolean);
}

function renderRelationshipSectionActions(profile = {}){
  document.querySelectorAll('[data-relationship-section-actions]').forEach((container) => {
    const section = container.dataset.relationshipSectionActions;
    const actions = relationshipSectionActions(profile, section).slice(0, 2);
    container.innerHTML = actions.map((action) => {
      const title = escapeHtml([action.willDo, action.willNotDo, action.prompt].filter(Boolean).join(' '));
      return '<button type="button" data-relationship-action="' + escapeHtml(action.id) + '" data-relationship-section="' + escapeHtml(section) + '" title="' + title + '">' + escapeHtml(action.label || 'Review') + '</button>';
    }).join('');
  });
}

function relationshipContactPayload(profile = {}){
  const dossier = profile.dossier || {};
  const identity = dossier.identity || {};
  return {
    id: identity.id || profile.id || '',
    contactId: identity.crmContactId || identity.id || profile.id || '',
    name: identity.name || profile.name || '',
    email: identity.email || '',
    company: identity.company || '',
    recommendedAction: profile.certainty || '',
    reason: profile.meaning || '',
    relationshipDossier: dossier
  };
}

function relationshipActionById(profile = {}, actionId = ''){
  const actions = Array.isArray(profile.actions) ? profile.actions : [];
  const sectionActions = relationshipAllSectionActions(profile);
  return actions.find((action) => action.id === actionId) || sectionActions.find((action) => action.id === actionId) || {id: actionId, label: actionId.replace(/_/g, ' ')};
}

function relationshipSource(profile = activeRelationshipProfile, action = ''){
  const person = profile || activeRelationshipProfile || relationshipProfiles.aric;
  return {
    sourceId: person.contactId || person.crmContactId || person.id || person.profileId || person.name || 'relationship',
    sourceType: 'relationship_profile',
    sourceLabel: person.name || 'Relationship',
    sourceItem: {
      id: person.id || person.profileId || person.name || 'relationship',
      name: person.name || 'Relationship',
      company: person.company || '',
      role: person.role || '',
      state: person.relationshipStateLabel || person.relationshipState || '',
      temperature: person.temperature || '',
      signal: person.signal || '',
      currentReality: person.evidence || '',
      executiveAssessment: person.patterns || '',
      strategicImportance: person.meaning || '',
      sourceReceipts: person.sourceReceipts || '',
      linkedProjects: person.projectLinks || [],
      linkedDocuments: person.documentLinks || [],
      requestedAction: action
    }
  };
}

function relationshipFirstName(profile = activeRelationshipProfile){
  const name = String(profile?.name || '').trim();
  return name.split(/\s+/)[0] || 'relationship';
}

function relationshipBackLabel(profile = activeRelationshipProfile){
  const firstName = relationshipFirstName(profile);
  return firstName === 'relationship' ? 'Back to relationship' : 'Back to ' + firstName;
}

function relationshipContextActions(actions = [], profile = activeRelationshipProfile){
  const filtered = actions.filter((action) => action?.workflow !== 'cancel:relationship' && action?.workflow !== 'relationshipAllPeople');
  return filtered.concat([
    {label: relationshipBackLabel(profile), workflow:'cancel:relationship'},
    {label:'All people', workflow:'relationshipAllPeople'}
  ]);
}

function updateWorkspaceReturnButton(){
  if(workspaceReturnTarget === 'relationship'){
    const label = relationshipBackLabel();
    returnButton.textContent = label;
    returnButton.setAttribute('aria-label', label + ' relationship brief');
    return;
  }
  if(workspaceReturnTarget === 'project'){
    const label = 'Back to ' + (activeProjectProfile?.name || 'project');
    returnButton.textContent = label;
    returnButton.setAttribute('aria-label', label + ' project brief');
    return;
  }
  if(workspaceReturnTarget === 'timeline'){
    returnButton.textContent = 'Back to Timeline & Tasks';
    returnButton.setAttribute('aria-label', 'Back to Timeline and Tasks drawer');
    return;
  }
  if(workspaceReturnTarget === 'correspondence'){
    returnButton.textContent = 'Back to Executive Inbox';
    returnButton.setAttribute('aria-label', 'Back to Executive Inbox drawer');
    return;
  }
  if(workspaceReturnTarget === 'commitment'){
    returnButton.textContent = 'Back to Commitments';
    returnButton.setAttribute('aria-label', 'Back to Commitments ledger');
    return;
  }
  if(workspaceReturnTarget === 'document'){
    returnButton.textContent = 'Back to Documents';
    returnButton.setAttribute('aria-label', 'Back to Documents drawer');
    return;
  }
  if(workspaceReturnTarget === 'val'){
    returnButton.textContent = 'Back to VAL';
    returnButton.setAttribute('aria-label', 'Back to VAL onboarding drawer');
    return;
  }
  returnButton.textContent = 'Close card';
  returnButton.setAttribute('aria-label', 'Close card and return to the desk');
}

function showRelationshipReceipt({title, meaning, understanding = [], recommendation, actions = []}){
  setWorkspaceContent({
    lens: 'Relationship Judgment',
    title,
    meaning,
    understanding,
    recommendation,
    actions: relationshipContextActions(actions),
    label: 'Relationship action workspace',
    packetReceipt: lastHearthPacketReceipt
  });
  openWorkspaceShell('Relationship action workspace', {returnTarget:'relationship'});
}

function introReviewLines(profile = {}){
  const review = profile.introReview || {};
  const needs = Array.isArray(review.whoNeedsThisPerson) ? review.whoNeedsThisPerson : [];
  const needed = Array.isArray(review.whoThisPersonNeeds) ? review.whoThisPersonNeeds : [];
  function lines(title, items){
    return [title].concat((items.length ? items : [{name:'No confident match yet', reason:'VAL needs stronger evidence before recommending an introduction.', confidence:0}]).map((item) => (
      item.name + ': ' + item.reason + (item.confidence ? ' Confidence ' + Math.round(item.confidence * 100) + '%.' : '')
    )));
  }
  return lines('Who needs this person', needs).concat(lines('Who this person needs', needed));
}

function introReviewActions(profile = {}){
  const review = profile.introReview || {};
  const actions = [];
  [...(review.whoNeedsThisPerson || []), ...(review.whoThisPersonNeeds || [])].slice(0, 3).forEach((item, index) => {
    actions.push({label:'Draft intro for ' + item.name, workflow:'introDraft:' + index});
  });
  return relationshipContextActions(actions, profile);
}

function introDraftCandidates(profile = {}){
  const review = profile.introReview || {};
  return [...(review.whoNeedsThisPerson || []), ...(review.whoThisPersonNeeds || [])].slice(0, 3);
}

function introDraftBody(profile = {}, candidate = {}){
  const userName = 'Jessa';
  const person = candidate.name || 'there';
  const firstName = person.split(/\s+/)[0] || person;
  const why = candidate.reason || 'I thought there may be useful overlap in what you are each carrying right now.';
  return [
    'Subject: Introduction: ' + (profile.name || 'VAL relationship') + ' <> ' + person,
    '',
    'Hi ' + firstName + ',',
    '',
    'I wanted to make a thoughtful introduction because I think there may be a useful reason for you and ' + (profile.name || 'this person') + ' to know one another.',
    '',
    why,
    '',
    'No pressure from either side. I simply thought this might be worth a brief conversation if it feels useful to both of you.',
    '',
    userName
  ].join('\n');
}

function openIntroDraftReview(candidateIndex = 0){
  const profile = activeRelationshipProfile || relationshipProfiles.aric;
  const candidate = introDraftCandidates(profile)[Number(candidateIndex)] || introDraftCandidates(profile)[0] || {name:'this relationship',reason:'VAL needs stronger evidence before drafting this introduction.'};
  activeIntroDraftCandidate = {profile,candidate,draftBody:introDraftBody(profile,candidate)};
  setWorkspaceContent({
    lens: 'Relationship Leverage',
    title: 'Introduction draft held for review.',
    meaning: 'VAL prepared the draft language, but nothing leaves the desk yet.',
    understanding: [
      'Candidate: ' + (candidate.name || 'Relationship'),
      'Why this intro may matter: ' + (candidate.reason || 'Potential relationship leverage.'),
      'No email, LinkedIn message, calendar invite, scrape, import, or CRM write happened from this click.'
    ],
    recommendation: 'Review the wording and the reason before approving, refining, or teaching VAL that this is not the right introduction.',
    actions: relationshipContextActions([
      {label:'Approve draft for review queue', workflow:'introApprove'},
      {label:'Refine wording', workflow:'introRefine'},
      {label:'Not this intro', workflow:'introDismiss'},
      {label:'Teach VAL', workflow:'introTeach'},
      {label:'Back to introduction review', workflow:'relationship:find_relationship_introductions'}
    ], profile),
    label: 'Introduction draft review'
  });
  renderWorkspaceInput({
    label: 'Prepared introduction draft',
    placeholder: 'VAL prepared draft language for review.',
    helper: 'Editing this text only changes the review draft. It does not send, expose recipients, write CRM, or create a calendar event.',
    mode: 'intro-draft',
    value: activeIntroDraftCandidate.draftBody
  });
  openWorkspaceShell('Introduction draft review', {returnTarget:'relationship'});
}

function openRelationshipIntroReview(profile = {}){
  const name = profile.name || 'this relationship';
  setWorkspaceContent({
    lens: 'Relationship Leverage',
    title: 'Introduction leverage is ready for review.',
    meaning: 'VAL looked in both directions around ' + name + ': who needs this person, and who this person needs.',
    understanding: introReviewLines(profile),
    recommendation: 'Choose an introduction only if it would serve both people. The next step is a draft for review, never a sent email.',
    actions: introReviewActions(profile),
    label: 'Relationship introduction review'
  });
  openWorkspaceShell('Relationship introduction review', {returnTarget:'relationship'});
}

function openRelationshipTeachWorkspace(reason = 'relationship'){
  const profile = activeRelationshipProfile || relationshipProfiles.aric;
  relationshipTeachMode = reason;
  const promptByReason = {
    wisdom:'What should VAL remember about this relationship wisdom?',
    importance:'How important is this relationship, and why?',
    temperature:'What should VAL understand about this relationship temperature or state?',
    relationship:'What should VAL understand differently about this relationship?'
  };
  setWorkspaceContent({
    lens: 'Teach VAL',
    title: 'Teach VAL about ' + (profile.name || 'this relationship') + '.',
    meaning: 'This is where you correct, deepen, or nuance VAL’s relationship judgment.',
    understanding: (reason === 'temperature' ? relationshipTemperatureTeachingContext(profile) : [
      'Current reminder: ' + (profile.wisdom || 'No relationship wisdom is attached yet.'),
      'Current pattern: ' + (profile.patterns || 'No durable pattern is attached yet.'),
      'Teaching stays reviewable before it becomes memory.'
    ]),
    recommendation: promptByReason[reason] || promptByReason.relationship,
    actions: [
      {label:'Review what I taught VAL', workflow:'relationshipTeachCandidate'},
      {label:relationshipBackLabel(profile), workflow:'cancel:relationship'},
      {label:'All people', workflow:'relationshipAllPeople'}
    ],
    label: 'Relationship Teach VAL workspace'
  });
  renderWorkspaceInput({
    label: 'Teach VAL',
    placeholder: 'Example: This relationship is warmer than VAL thinks because... / Do not suggest introductions until... / This person prefers concise follow-up...',
    helper: 'This prepares your teaching for review only. It does not save durable memory, update CRM, send messages, or change relationship facts from this click.',
    mode: 'relationship-teach'
  });
  openWorkspaceShell('Relationship Teach VAL workspace', {returnTarget:'relationship'});
}

function openRelationshipFullFile(profile = {}){
  setWorkspaceContent({
    lens: 'Relationship File',
    title: profile.name || 'Relationship file',
    meaning: 'VAL opened the fuller relationship file inside the executive environment.',
    understanding: [
      'Identity: ' + (profile.identity || 'Identity context is still being assembled.'),
      'Current reality: ' + (profile.evidence || 'No current reality summary is attached yet.'),
      'Executive assessment: ' + (profile.patterns || 'No durable pattern is attached yet.'),
      'Strategic importance: ' + (profile.meaning || 'No strategic importance summary is attached yet.'),
      'Source receipts: ' + (profile.sourceReceipts || 'Source receipts are not attached yet.')
    ],
    recommendation: profile.wisdom || 'Use this relationship file to understand before acting.',
    actions: relationshipContextActions([
      {label:'Teach VAL', workflow:'relationship:teach_wisdom'},
      {label:'Find Introductions', workflow:'relationship:find_relationship_introductions'}
    ], profile),
    label: 'Relationship full file workspace'
  });
  openWorkspaceShell('Relationship full file workspace', {returnTarget:'relationship'});
}

async function handleRelationshipAction(actionId){
  const profile = activeRelationshipProfile || relationshipProfiles.aric;
  const action = relationshipActionById(profile, actionId);
  if(profile.unresolvedIdentity && actionId !== 'cowork_relationship'){
    await handleUnresolvedRelationshipAction(actionId, profile);
    return;
  }
  if(actionId === 'cowork_relationship'){
    openContextualCoworkSession({
      returnTarget: 'relationship',
      title: 'Co-Work with VAL about ' + (profile.name || 'this relationship') + '.',
      meaning: 'This Co-Work space is scoped to the active relationship so VAL can help without losing the person, evidence, or trust context.',
      context: [
        'Relationship: ' + (profile.name || 'Unknown'),
        'Current reality: ' + (profile.evidence || 'Relationship evidence is still being assembled.'),
        'Executive assessment: ' + (profile.patterns || 'No durable pattern is attached yet.'),
        'Strategic importance: ' + (profile.meaning || 'No strategic importance summary is attached yet.')
      ],
      recommendation: 'Use this to think through the relationship before drafting, scheduling, introducing, or changing anything.',
      placeholder: 'What should VAL help you think through about ' + (profile.name || 'this relationship') + '?',
      helper: 'This Co-Work note is tagged to the active relationship. External actions still require a separate approval step.',
      backWorkflow: 'cancel:relationship'
    });
    return;
  }
  if(actionId === 'teach_wisdom'){
    openRelationshipTeachWorkspace('wisdom');
    return;
  }
  if(actionId === 'teach_temperature'){
    openRelationshipTeachWorkspace('temperature');
    return;
  }
  if(actionId === 'mark_vip' || actionId === 'not_important' || actionId === 'snooze'){
    openRelationshipTeachWorkspace('importance');
    return;
  }
  if(actionId === 'open_full_file' || action.type === 'route'){
    openRelationshipFullFile(profile);
    return;
  }
  if(actionId === 'ask_alignment' || action.workspace === 'alignment'){
    showRelationshipReceipt({
      title: (profile.name || 'This relationship') + ' is ready for judgment.',
      meaning: profile.certainty || 'VAL is holding the relationship context so attention comes before action.',
      understanding: [profile.evidence, profile.patterns, profile.meaning].filter(Boolean),
      recommendation: 'Decide what this relationship needs before drafting, scheduling, or creating a task.',
      actions: [
        {label:'Open full file', workflow:'relationship:open_full_file'},
        {label:'Draft message', workflow:'relationship:draft_message'},
        {label:'Create task', workflow:'relationship:create_task'}
      ]
    });
    return;
  }
  if(actionId === 'review_linkedin_activity'){
    showRelationshipReceipt({
      title: 'LinkedIn activity is ready to review.',
      meaning: profile.linkedinSignal || 'LinkedIn is being watched for useful public context.',
      understanding: ['No post was created.', 'No comment was drafted publicly.', 'No scrape or CRM update happened from this click.'],
      recommendation: 'Use this signal only if it helps you offer a thoughtful response without creating a new ask.'
    });
    return;
  }
  if(actionId === 'draft_linkedin_comment'){
    showRelationshipReceipt({
      title: 'LinkedIn comment drafted for review.',
      meaning: profile.linkedinSignal || 'VAL prepared a thoughtful comment from known relationship context.',
      understanding: ['This is an internal draft only.', 'No comment was posted.', 'No message, scrape, or CRM update happened.'],
      recommendation: 'Use the draft only if it offers genuine encouragement or context without creating a new ask.'
    });
    return;
  }
  if(actionId === 'draft_linkedin_dm'){
    showRelationshipReceipt({
      title: 'LinkedIn DM drafted for review.',
      meaning: profile.linkedinSignal || 'VAL prepared a private follow-up from known relationship context.',
      understanding: ['This is an internal draft only.', 'No DM was sent.', 'No post, comment, scrape, or CRM update happened.'],
      recommendation: 'Use the draft only if a private note would deepen trust without creating pressure.'
    });
    return;
  }
  if(actionId === 'refresh_relationship_observers'){
    showRelationshipReceipt({
      title: 'Observer refresh is ready for review.',
      meaning: profile.sourceReceipts || 'CRM, LinkedIn, Apollo, and Outscraper are the observers for this relationship brief.',
      understanding: ['GHL/CRM remains the identity anchor.', 'LinkedIn is for public relationship awareness.', 'Apollo and Outscraper enrich context only when configured and appropriate.'],
      recommendation: 'Run observer refresh only when the relationship brief needs newer evidence before action.'
    });
    return;
  }
  if(actionId === 'find_relationship_introductions'){
    openRelationshipIntroReview(profile);
    return;
  }
  if(action.section){
    showRelationshipSectionReceipt(action, profile);
    return;
  }
  showRelationshipReceipt({
    title: action.label || 'Relationship action',
    meaning: 'VAL is working from the relationship dossier, not a generic CRM record.',
    understanding: ['The action uses the shared relationship contract.', 'Final external actions still require their dedicated approval flow.', 'No email will be sent from this click.'],
    recommendation: 'Wait a moment while VAL prepares the reviewable result.'
  });
  if(!canUseApi){
    showRelationshipReceipt({
      title: action.label || 'Relationship action recorded.',
      meaning: 'Prototype mode logged the action locally.',
      understanding: ['No external action was taken.', 'The relationship dossier stayed attached.', 'Live VAL will use the shared /api/relationships/actions contract.'],
      recommendation: 'Use this as the intended interaction shape before live data is connected.'
    });
    return;
  }
  try{
    const result = await postJson(action.endpoint || '/api/relationships/actions', {
      action: actionId,
      contact: relationshipContactPayload(profile),
      dossier: profile.dossier || null
    });
    showRelationshipReceipt({
      title: result.draft ? 'Draft prepared for review.' : result.task ? 'Task created from the relationship.' : 'Relationship action completed.',
      meaning: result.content || result.status || 'VAL completed the safe relationship action.',
      understanding: [
        result.draft ? 'A draft exists for review. Nothing was sent.' : '',
        result.task ? (result.task.title || 'A local VAL task was created.') : '',
        'The source relationship dossier remains attached.'
      ].filter(Boolean),
      recommendation: result.draft ? 'Review the draft before anything leaves VAL.' : 'Return to the relationship file if you need more context.'
    });
  }catch(error){
    showRelationshipReceipt({
      title: 'That relationship action needs review.',
      meaning: 'Nothing external happened.',
      understanding: [error.message, 'The relationship dossier is still intact.', 'This can be retried once the local VAL service is ready.'],
      recommendation: 'Use Teach VAL if this action should behave differently.'
    });
  }
}

function showRelationshipSectionReceipt(action = {}, profile = {}){
  const section = action.section || 'relationship';
  const sectionCopy = {
    identity:{
      title:'Identity is the anchor.',
      meaning:profile.identity || 'VAL starts with who this is before attaching interpretation.',
      understanding:[profile.contact, 'Canonical contact ID protects every transcript, calendar event, and note from attaching to the wrong person.'],
      recommendation:'Open the full file when identity needs inspection before action.'
    },
    evidence:{
      title:'Here is the current reality VAL is using.',
      meaning:profile.evidence || 'VAL is grounding this relationship in observable context.',
      understanding:[profile.evidence, profile.contact].filter(Boolean),
      recommendation:'Turn an open loop into a task only after the evidence still feels true.'
    },
    patterns:{
      title:'Here is VAL’s executive assessment.',
      meaning:profile.patterns || 'VAL is watching the relationship pattern, not just the last interaction.',
      understanding:[profile.evidence, profile.meaning].filter(Boolean),
      recommendation:'Use this when you need to understand the season of the relationship before deciding.'
    },
    meaning:{
      title:'Here is the strategic importance.',
      meaning:profile.meaning || 'VAL is translating relationship context into executive value.',
      understanding:[profile.evidence, profile.patterns].filter(Boolean),
      recommendation:'Let meaning decide whether this deserves action today.'
    },
    wisdom:{
      title:'This is the executive reminder.',
      meaning:profile.wisdom || 'VAL is compressing the relationship into one remembered posture.',
      understanding:[profile.evidence, profile.patterns, profile.meaning].filter(Boolean),
      recommendation:'Teach VAL if this wisdom is close, but not quite right.'
    }
  };
  const copy = sectionCopy[section] || sectionCopy.meaning;
  const actions = [];
  if(action.id === 'open_full_file' || section === 'identity'){
    actions.push({label:'Open full file', workflow:'relationship:open_full_file'});
  }
  if(action.id === 'create_task_from_loop'){
    actions.push({label:'Create task', workflow:'relationship:create_task'});
  }
  if(action.id === 'teach_wisdom' || section === 'wisdom'){
    actions.push({label:'Teach VAL', workflow:'relationship:teach_wisdom'});
  }
  if(action.id === 'ask_about_pattern' || action.id === 'ask_why_matters'){
    actions.push({label:'Ask Alignment', workflow:'relationship:ask_alignment'});
  }
  showRelationshipReceipt({
    title: copy.title,
    meaning: copy.meaning,
    understanding: copy.understanding.filter(Boolean),
    recommendation: copy.recommendation,
    actions
  });
}

async function handleUnresolvedRelationshipAction(actionId, profile = {}){
  if(actionId === 'search_ghl_contacts'){
    const matches = Array.isArray(profile.unresolvedData?.matches) ? profile.unresolvedData.matches : [];
    showRelationshipReceipt({
      title: 'Search GHL before attaching context.',
      meaning: profile.name + ' is not organized under a canonical GHL contact ID yet.',
      understanding: matches.length ? matches.map((match) => [match.name || 'Unnamed contact', match.email, match.contactId || match.source, match.confidence != null ? 'confidence ' + match.confidence : ''].filter(Boolean).join(' · ')) : ['No confident GHL match was returned by the resolver.', 'Use a more specific email, phone, or company if this should match an existing contact.'],
      recommendation: 'Match or create the GHL contact first. Then VAL can safely attach transcripts, calendar, emails, and notes.',
      actions: [{label:'Review new contact candidate', workflow:'relationship:review_new_contact_candidate'}]
    });
    return;
  }
  if(actionId === 'review_new_contact_candidate'){
    activeMeetingContactCandidates.relationship_identity_gate = {
      attendee:{name:profile.name,email:profile.contactCandidate?.payload?.email || ''},
      candidate:{
        endpoint:'/api/val/contacts/create',
        payload:profile.contactCandidate?.payload || contactCandidatePayloadFromRelationship(profile),
        willNotDo:'VAL will not merge contacts, send messages, add opportunities, or attach relationship context until GHL returns a contact ID.',
        onSuccess:'Use the returned contact.id/contactId as the canonical relationship key.'
      }
    };
    await handleMeetingContactCandidate('relationship_identity_gate');
    return;
  }
  showRelationshipReceipt({
    title: 'Resolve identity first.',
    meaning: 'VAL cannot use this as a Relationship Dossier until a CRM/GHL contact ID exists.',
    understanding: ['No relationship context was attached.', 'No CRM write happened.', 'This protects against overlapping people.'],
    recommendation: 'Search GHL or review a new contact candidate.'
  });
}

async function loadRelationshipDossier(profileId = 'aric'){
  const fallback = relationshipProfiles[profileId] || relationshipIndexProfiles[profileId] || relationshipProfiles.aric;
  renderRelationshipProfile(profileId, fallback);
  if(!canUseApi) return;
  const query = fallback.query || {name: fallback.name};
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if(value) params.set(key, value);
  });
  try{
    const data = await getJson('/api/relationships/dossier?' + params.toString());
    if(data?.dossier){
      renderRelationshipProfile(profileId, relationshipProfileFromDossier(data.dossier, fallback));
    }
  }catch(error){
    if(error.data?.error === 'relationship_identity_unresolved'){
      renderRelationshipProfile(profileId, relationshipProfileFromUnresolvedIdentity(error.data, fallback));
      return;
    }
    console.warn('[hearth] relationship dossier unavailable', error.message);
  }
}

function closeDrawer(){
  retrievalSystem.classList.remove('open');
  hearth.classList.remove('drawer-open');
  drawerPull.setAttribute('aria-expanded', 'false');
  drawerTray.setAttribute('aria-hidden', 'true');
  drawerTray.classList.remove('val-open', 'relationship-open', 'project-open', 'timeline-open', 'correspondence-open', 'commitment-open', 'document-open', 'source-open');
  valDrawerLink?.setAttribute('aria-expanded', 'false');
  relationshipDrawerLink.setAttribute('aria-expanded', 'false');
  projectDrawerLink.setAttribute('aria-expanded', 'false');
  timelineDrawerLink?.setAttribute('aria-expanded', 'false');
  correspondenceDrawerLink?.setAttribute('aria-expanded', 'false');
  commitmentDrawerLink?.setAttribute('aria-expanded', 'false');
  documentDrawerLink?.setAttribute('aria-expanded', 'false');
  sourceDrawerLink.setAttribute('aria-expanded', 'false');
  document.querySelector('#val-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#relationship-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#project-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#timeline-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#correspondence-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#commitment-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#document-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#source-detail')?.setAttribute('aria-hidden', 'true');
  renderDrawerPacketReceiptStrip(null);
  updateCloseAllDrawersButton();
}

function updateCloseAllDrawersButton(){
  if(!closeAllDrawersButton) return;
  closeAllDrawersButton.hidden = !retrievalSystem.classList.contains('open');
}

function ensureDrawerTrayOpen(){
  hideWorkspaceForDrawerNavigation();
  retrievalSystem.classList.add('open');
  hearth.classList.add('drawer-open');
  drawerPull.setAttribute('aria-expanded', 'true');
  drawerTray.setAttribute('aria-hidden', 'false');
  updateCloseAllDrawersButton();
}

function bringDrawerTargetIntoView(target){
  if(!target) return;
  const compactDrawer = window.matchMedia('(max-width: 720px), (max-height: 720px)').matches;
  if(!compactDrawer) return;
  window.requestAnimationFrame(() => {
    target.scrollIntoView({block:'center', inline:'nearest', behavior:'smooth'});
  });
}

function renderTimelineStatus(data = null){
  if(!timelineStatusPanel || !timelineStatusCount) return;
  const counts = data?.counts || {};
  const events = Array.isArray(data?.timelineEvents) ? data.timelineEvents : [];
  const unmatched = Array.isArray(data?.unmatchedTranscripts) ? data.unmatchedTranscripts : [];
  const needsMatching = events.filter((event) => event.reviewStage === 'needs_matching' || event.reviewNeeded).length + unmatched.length;
  const readyToExtract = events.filter((event) => event.reviewStage === 'ready_to_extract' || event.transcriptStatus === 'attached').length;
  const proposedTasks = events.reduce((sum, event) => sum + Number(event.taskCount || 0), 0);
  const proposedNotes = events.filter((event) => event.transcriptStatus === 'attached').length;
  const cards = [
    {
      label: 'Needs Matching',
      value: data?.ok ? needsMatching + ' to review' : 'Attach first',
      body: 'Match transcript to calendar event, attendees, project, and relationships before VAL extracts anything.'
    },
    {
      label: 'Ready to Extract',
      value: data?.ok ? readyToExtract + ' anchored' : 'Anchored evidence',
      body: 'Only matched transcripts can move into proposed notes, proposed tasks, drafts, or meeting prep.'
    },
    {
      label: 'Proposed Notes',
      value: data?.ok ? proposedNotes + ' source sets' : 'Meaning, not mush',
      body: 'Notes must name the decision, commitment, risk, opportunity, or relationship context they preserve.'
    },
    {
      label: 'Proposed Tasks',
      value: data?.ok ? proposedTasks + ' to source-check' : 'Specific work',
      body: 'Tasks must include source excerpt, owner, due date or review-needed date, project, relationship, and why it matters.'
    }
  ];
  timelineStatusCount.textContent = data?.ok ? 'Timeline context connected' : 'Local timeline structure';
  timelineStatusPanel.innerHTML = cards.map((card) => [
    '<article>',
    '<span>' + escapeHtml(card.label) + '</span>',
    '<strong>' + escapeHtml(card.value) + '</strong>',
    '<p>' + escapeHtml(card.body) + '</p>',
    '</article>'
  ].join('')).join('');
  renderTimelineEvents(data?.timelineEvents || [], data?.unmatchedTranscripts || []);
}

function timelineEventDateLabel(value = ''){
  if(!value) return 'No time set';
  const date = new Date(value);
  if(Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString([], {month:'short', day:'numeric', hour:'numeric', minute:'2-digit'});
}

function renderTimelineEvents(events = [], unmatched = []){
  if(!timelineEventList || !timelineEventCount) return;
  const items = Array.isArray(events) ? events.slice(0, 8) : [];
  const unmatchedItems = Array.isArray(unmatched) ? unmatched.slice(0, 3) : [];
  const needsMatchingCount = items.filter((event) => event.reviewStage === 'needs_matching' || event.reviewNeeded).length + unmatchedItems.length;
  const readyCount = items.filter((event) => event.reviewStage === 'ready_to_extract' || event.transcriptStatus === 'attached').length;
  timelineEventCount.textContent = items.length || unmatchedItems.length ? (items.length + unmatchedItems.length) + ' shown · ' + needsMatchingCount + ' shown need matching · ' + readyCount + ' ready to extract' : 'No events loaded yet';
  if(!items.length && !unmatchedItems.length){
    timelineEventList.innerHTML = '<article class="empty"><span>Review Queue</span><p>Calendar events and transcripts will appear here for matching, proposed notes, proposed tasks, and approval.</p></article>';
    return;
  }
  const eventCards = items.map((event) => {
    const transcriptLabel = event.transcriptStatus === 'attached' ? 'Transcript attached' : 'Transcript review needed';
    const stageLabel = event.reviewStage === 'ready_to_extract' || event.transcriptStatus === 'attached' ? 'Ready to Extract' : 'Needs Matching';
    const chips = [
      transcriptLabel,
      (event.taskCount || 0) + ' task' + (event.taskCount === 1 ? '' : 's'),
      (event.draftCount || 0) + ' draft' + (event.draftCount === 1 ? '' : 's'),
      (event.attendeeCount || 0) + ' attendee' + (event.attendeeCount === 1 ? '' : 's')
    ];
    return [
      '<article class="' + (event.reviewNeeded ? 'needs-review' : 'ready-review') + '">',
      '<div><span>' + escapeHtml(stageLabel + ' · ' + timelineEventDateLabel(event.startTime)) + '</span><strong>' + escapeHtml(event.title || 'Calendar event') + '</strong></div>',
      '<p>' + escapeHtml(event.nextReview || 'Review event context before creating notes, tasks, or drafts.') + '</p>',
      '<dl class="timeline-review-checklist">',
      '<div><dt>Note standard</dt><dd>' + escapeHtml(event.noteReadiness || 'Preserve meaning with source evidence before saving a note.') + '</dd></div>',
      '<div><dt>Task standard</dt><dd>' + escapeHtml(event.taskReadiness || 'Create only specific tasks with source excerpt, owner, due date, project, and relationship.') + '</dd></div>',
      '</dl>',
      '<div class="timeline-event-chips">' + chips.map((chip) => '<small>' + escapeHtml(chip) + '</small>').join('') + '</div>',
      event.tasks?.length ? '<ul>' + event.tasks.slice(0, 2).map((task) => '<li>' + escapeHtml(task.title || 'Task') + '</li>').join('') + '</ul>' : '',
      '</article>'
    ].join('');
  });
  const unmatchedCards = unmatchedItems.map((transcript) => [
    '<article class="needs-review">',
    '<div><span>Needs Matching · Unmatched Transcript</span><strong>' + escapeHtml(transcript.title || 'Transcript') + '</strong></div>',
    '<p>' + escapeHtml(transcript.nextReview || 'Match this transcript to a prior calendar event before creating notes, tasks, or drafts.') + '</p>',
    '<dl class="timeline-review-checklist">',
    '<div><dt>Note standard</dt><dd>' + escapeHtml(transcript.noteReadiness || 'No notes until this transcript is anchored to the right event, people, and project.') + '</dd></div>',
    '<div><dt>Task standard</dt><dd>' + escapeHtml(transcript.taskReadiness || 'No task creation until matching is reviewed.') + '</dd></div>',
    '</dl>',
    '<div class="timeline-event-chips"><small>Needs event match</small><small>No task creation yet</small></div>',
    '</article>'
  ].join(''));
  timelineEventList.innerHTML = eventCards.concat(unmatchedCards).join('');
}

function renderTimelineReviewCards(reviews = []){
  if(!timelineReviewCards || !timelineReviewCount) return;
  const items = Array.isArray(reviews) ? reviews.slice(0, 6) : [];
  currentTimelineReviewItems = items;
  timelineReviewCount.textContent = items.length ? items.length + ' review proposal' + (items.length === 1 ? '' : 's') : 'No proposals loaded yet';
  if(!items.length){
    timelineReviewCards.innerHTML = '<article class="empty"><span>Review-only</span><p>Once transcript evidence is anchored, proposed notes and tasks will appear here with source excerpts and approval boundaries.</p></article>';
    return;
  }
  timelineReviewCards.innerHTML = items.map((item) => {
    const isTask = item.type === 'task';
    const anchorStatus = timelineProposalAnchorStatus(item);
    const canApprove = anchorStatus.canApprove !== false;
    const decision = timelineReviewDecisions[item.id] || null;
    const decisionLabel = decision?.action === 'approved'
      ? 'Approved locally'
      : decision?.action === 'needs_edit'
        ? 'Needs better context'
        : decision?.action === 'rejected'
          ? 'Rejected locally'
          : '';
    const receipt = decision?.action === 'approved'
      ? 'Approved locally. No note, task, CRM update, message, or external action was created.'
      : decision?.action === 'needs_edit'
        ? 'Sent back for better context. VAL should improve the source excerpt, owner, due date, project, relationship, or reason before this becomes a note or task.'
        : decision?.action === 'rejected'
          ? 'Rejected locally. No memory, task, CRM update, message, or external action was created.'
          : '';
    const meta = [
      item.eventTitle || '',
      item.project ? 'Project: ' + item.project : '',
      Array.isArray(item.relationships) && item.relationships.length ? 'Relationships: ' + item.relationships.join(', ') : ''
    ].filter(Boolean);
    const anchorCards = [
      ['Event', anchorStatus.event],
      ['Relationships', anchorStatus.relationships],
      ['Project', anchorStatus.project]
    ].map(([label, anchor]) => '<small data-anchor-state="' + escapeHtml(anchor.status || 'needs_match') + '"><b>' + escapeHtml(label) + '</b> ' + escapeHtml(anchor.label || 'Needs match') + '</small>').join('');
    const acceptedMatchReceipt = renderTimelineAcceptedMatchReceipt(item);
    const matchReview = timelineMatchReviewOpen[item.id] ? renderTimelineMatchReview(item, anchorStatus) : '';
    return [
      '<article class="' + (isTask ? 'task-proposal' : 'note-proposal') + '"' + (decision ? ' data-review-decision="' + escapeHtml(decision.action) + '"' : '') + '>',
      '<div class="timeline-proposal-head">',
      '<span>' + escapeHtml(isTask ? 'Proposed Task' : 'Proposed Note') + '</span>',
      '<strong>' + escapeHtml(item.title || (isTask ? 'Transcript task' : 'Transcript note')) + '</strong>',
      '</div>',
      meta.length ? '<p class="timeline-proposal-meta">' + escapeHtml(meta.join(' · ')) + '</p>' : '',
      '<div class="timeline-anchor-status" aria-label="Proposal context matches">' + anchorCards + '</div>',
      acceptedMatchReceipt,
      isTask ? '<dl class="timeline-review-checklist"><div><dt>Owner</dt><dd>' + escapeHtml(item.owner || 'Needs owner review') + '</dd></div><div><dt>Due date</dt><dd>' + escapeHtml(item.dueDate || 'Needs due-date review') + '</dd></div></dl>' : '',
      '<blockquote>' + escapeHtml(item.sourceExcerpt || 'Source excerpt required before approval.') + '</blockquote>',
      '<dl class="timeline-review-checklist">',
      '<div><dt>Why it matters</dt><dd>' + escapeHtml(item.whyItMatters || 'Needs executive reason before approval.') + '</dd></div>',
      '<div><dt>Approval boundary</dt><dd>' + escapeHtml(item.approvalBoundary || 'Review only. No durable memory, task, CRM, message, or external action is created here.') + '</dd></div>',
      '</dl>',
      '<div class="timeline-event-chips"><small>' + escapeHtml(item.transcriptTitle || 'Transcript source') + '</small><small>' + escapeHtml(decisionLabel || 'Needs approval') + '</small><small>No external action</small></div>',
      '<div class="timeline-proposal-actions" aria-label="Review proposal actions">',
      '<button type="button" data-timeline-review-id="' + escapeHtml(item.id || '') + '" data-timeline-review-action="approved"' + (canApprove ? '' : ' disabled title="Match event, relationship, and project before approval"') + '>' + (canApprove ? 'Approve locally' : 'Needs matching first') + '</button>',
      canApprove ? '' : '<button type="button" data-timeline-match-review="' + escapeHtml(item.id || '') + '">Review matches</button>',
      '<button type="button" data-timeline-review-id="' + escapeHtml(item.id || '') + '" data-timeline-review-action="needs_edit">Needs better context</button>',
      '<button type="button" data-timeline-review-id="' + escapeHtml(item.id || '') + '" data-timeline-review-action="rejected">Reject</button>',
      '</div>',
      matchReview,
      receipt ? '<p class="timeline-proposal-receipt">' + escapeHtml(receipt) + '</p>' : '',
      '</article>'
    ].join('');
  }).join('');
}

function renderTimelineAcceptedMatchReceipt(item = {}){
  const matches = Array.isArray(item.acceptedMatches) ? item.acceptedMatches : [];
  if(!matches.length) return '';
  const labels = {event:'Event', relationships:'Relationships', project:'Project'};
  return [
    '<div class="timeline-accepted-matches" aria-label="Accepted local matches">',
    '<span>Local match receipt</span>',
    '<div>',
    matches.map((match) => [
      '<small>',
      '<b>' + escapeHtml(labels[match.category] || match.category || 'Match') + '</b> ',
      escapeHtml(match.label || 'Accepted match'),
      match.confidence ? ' <em>' + escapeHtml(Math.round((Number(match.confidence) || 0) * 100) + '%') + '</em>' : '',
      '</small>'
    ].join('')).join(''),
    '</div>',
    '<p>Audit evidence only. No calendar link, relationship link, project link, note, task, CRM update, memory, message, or external action was created.</p>',
    '</div>'
  ].join('');
}

function renderTimelineMatchReview(item = {}, anchorStatus = {}){
  const candidates = item.matchCandidates || {};
  const groups = [
    ['event', 'Event', candidates.event || []],
    ['relationships', 'Relationships', candidates.relationships || []],
    ['project', 'Project', candidates.project || []]
  ];
  const rows = groups.map(([category, label, list]) => {
    const anchor = anchorStatus[category] || {};
    if(anchor.status === 'anchored') return '';
    const candidateRows = Array.isArray(list) && list.length ? list.slice(0, 3).map((candidate, index) => [
      '<div class="timeline-match-row">',
      '<p><b>' + escapeHtml(candidate.label || 'Possible match') + '</b><span>' + escapeHtml(candidate.reason || 'Needs review before this context is treated as attached.') + '</span></p>',
      '<small>' + escapeHtml(Math.round((Number(candidate.confidence) || 0) * 100) + '% confidence · local review only') + '</small>',
      '<button type="button" data-timeline-match-accept="' + escapeHtml(item.id || '') + '" data-timeline-match-category="' + escapeHtml(category) + '" data-timeline-match-index="' + index + '">Use local match</button>',
      '</div>'
    ].join('')).join('') : '<p class="timeline-match-empty">No candidate yet. Mark needs edit and add context before approval.</p>';
    return [
      '<section>',
      '<span>' + escapeHtml(label) + '</span>',
      candidateRows,
      '</section>'
    ].join('');
  }).join('');
  return '<div class="timeline-match-review" aria-label="Review proposal matches">' + rows + '<p>No note, task, CRM update, durable memory, message, or external action is created from match review.</p></div>';
}

function timelineReviewSource(reviewId = ''){
  const review = currentTimelineReviewItems.find((item) => item.id === reviewId) || null;
  return {
    review,
    sourceId: review?.id || reviewId || '',
    sourceType: review?.type ? 'timeline_' + review.type + '_proposal' : 'timeline_proposal',
    sourceLabel: review?.title || review?.eventTitle || review?.transcriptTitle || 'Timeline proposal',
    sourceItem: review,
    transcriptId: review?.transcriptId || '',
    transcriptTitle: review?.transcriptTitle || '',
    eventTitle: review?.eventTitle || '',
    relationships: review?.relationships || [],
    project: review?.project || ''
  };
}

function timelineMatchSource(reviewId = '', category = '', index = ''){
  const source = timelineReviewSource(reviewId);
  const candidates = source.review?.matchCandidates?.[category] || [];
  const candidate = candidates[Number(index)] || null;
  return {
    ...source,
    sourceType: 'timeline_match_review',
    sourceLabel: candidate?.label ? 'Timeline match: ' + candidate.label : source.sourceLabel,
    matchCategory: category || '',
    matchCandidate: candidate
  };
}

function timelineProposalAnchorStatus(item = {}){
  const provided = item.anchorStatus || {};
  const relationships = Array.isArray(item.relationships) ? item.relationships : [];
  const eventTitle = item.eventTitle || '';
  const fallback = {
    event:{status:eventTitle && !/match needed|needs?_?event|transcript event match/i.test(eventTitle) ? 'anchored' : 'needs_match', label:eventTitle ? 'Event: ' + eventTitle : 'Needs event match'},
    relationships:{status:relationships.length ? 'anchored' : 'needs_match', label:relationships.length ? 'Relationships: ' + relationships.join(', ') : 'Needs relationship match'},
    project:{status:item.project ? 'anchored' : 'needs_match', label:item.project ? 'Project: ' + item.project : 'Needs project match'}
  };
  const event = provided.event || fallback.event;
  const rel = provided.relationships || fallback.relationships;
  const project = provided.project || fallback.project;
  return {
    event,
    relationships: rel,
    project,
    canApprove: provided.canApprove !== undefined ? !!provided.canApprove : [event, rel, project].every((anchor) => anchor.status === 'anchored')
  };
}

function acceptTimelineLocalMatch(reviewId, category, index){
  const review = currentTimelineReviewItems.find((item) => item.id === reviewId);
  if(!review || !['event','relationships','project'].includes(category)) return;
  const list = review.matchCandidates?.[category] || [];
  const candidate = list[Number(index)];
  if(!candidate) return;
  if(category === 'event'){
    review.eventTitle = candidate.label || review.eventTitle || 'Matched event';
  }else if(category === 'relationships'){
    const relationships = Array.isArray(review.relationships) ? review.relationships.slice() : [];
    if(candidate.label && !relationships.includes(candidate.label)) relationships.push(candidate.label);
    review.relationships = relationships;
  }else if(category === 'project'){
    review.project = candidate.label || review.project || 'Matched project';
  }
  review.acceptedMatches = Array.isArray(review.acceptedMatches) ? review.acceptedMatches.filter((match) => match.category !== category) : [];
  review.acceptedMatches.push({
    category,
    id: candidate.id || '',
    label: candidate.label || '',
    confidence: Number(candidate.confidence) || 0,
    reason: candidate.reason || '',
    acceptedAt: new Date().toISOString(),
    localOnly: true
  });
  delete review.anchorStatus;
  review.anchorStatus = timelineProposalAnchorStatus(review);
  timelineReviewDecisions[reviewId] = {
    action:'needs_edit',
    decidedAt:new Date().toISOString(),
    syncStatus:'local_match_reviewed'
  };
  renderTimelineReviewCards(currentTimelineReviewItems);
}

function timelineProposalReviewPayload(review){
  return {
    id: review.id,
    type: review.type,
    transcriptId: review.transcriptId,
    transcriptTitle: review.transcriptTitle,
    eventTitle: review.eventTitle,
    project: review.project,
    relationships: review.relationships,
    title: review.title,
    sourceExcerpt: review.sourceExcerpt,
    whyItMatters: review.whyItMatters,
    owner: review.owner,
    dueDate: review.dueDate,
    approvalBoundary: review.approvalBoundary,
    anchorStatus: review.anchorStatus,
    acceptedMatches: review.acceptedMatches || [],
    confidence: review.confidence || 0.72
  };
}

async function syncTimelineReviewDecision(review, action){
  if(!canUseApi || !review) return null;
  const created = await postJson('/api/val/review-updates/transcript-proposal', timelineProposalReviewPayload(review));
  const updateId = created?.update?.id;
  if(!updateId) return created;
  if(action === 'approved'){
    return postJson('/api/val/review-updates/' + encodeURIComponent(updateId) + '/approve', {note:'Approved from Timeline & Tasks transcript review.'});
  }
  if(action === 'rejected'){
    return postJson('/api/val/review-updates/' + encodeURIComponent(updateId) + '/reject', {reason:'Rejected from Timeline & Tasks transcript review.'});
  }
  return postJson('/api/val/review-updates/' + encodeURIComponent(updateId) + '/edit', {note:'Marked needs edit from Timeline & Tasks transcript review.'});
}

async function handleTimelineReviewAction(reviewId, action){
  if(!reviewId || !['approved','needs_edit','rejected'].includes(action)) return;
  const review = currentTimelineReviewItems.find((item) => item.id === reviewId);
  if(!review) return;
  timelineReviewDecisions[reviewId] = {
    action,
    decidedAt: new Date().toISOString(),
    syncStatus: 'local'
  };
  renderTimelineReviewCards(currentTimelineReviewItems);
  try{
    const result = await syncTimelineReviewDecision(review, action);
    if(result?.ok){
      timelineReviewDecisions[reviewId] = {
        ...timelineReviewDecisions[reviewId],
        syncStatus: 'review_update_recorded',
        reviewUpdateId: result.update?.id || result.update?.reviewUpdateId || ''
      };
      renderTimelineReviewCards(currentTimelineReviewItems);
    }
  }catch(error){
    console.warn('[hearth] transcript review decision stayed local', error.message);
  }
}

function openTimelineCoworkSession(){
  const proposals = currentTimelineReviewItems || [];
  const firstProposal = proposals[0] || null;
  openContextualCoworkSession({
    returnTarget: 'timeline',
    title: 'Co-Work with VAL about Timeline & Tasks.',
    meaning: 'This Co-Work space is scoped to calendar, transcripts, proposed notes, proposed tasks, and follow-through.',
    context: [
      proposals.length ? proposals.length + ' transcript proposal' + (proposals.length === 1 ? '' : 's') + ' currently loaded.' : 'No transcript proposals are loaded yet.',
      firstProposal?.title ? 'First proposal: ' + firstProposal.title : '',
      firstProposal?.eventTitle ? 'Event: ' + firstProposal.eventTitle : '',
      firstProposal?.project ? 'Project: ' + firstProposal.project : '',
      firstProposal?.relationships?.length ? 'Relationships: ' + firstProposal.relationships.join(', ') : ''
    ].filter(Boolean),
    recommendation: 'Use this to decide what should become notes, tasks, drafts, commitments, or meeting prep before approving anything.',
    placeholder: 'What should VAL help you understand or prepare from the timeline, transcripts, or tasks?',
    helper: 'This Co-Work note is tagged to Timeline & Tasks. Creating final notes/tasks or linking records still requires review.',
    backWorkflow: 'cancel:timeline'
  });
}

async function hydrateTimelineStatus(){
  renderTimelineStatus();
  renderTimelineReviewCards();
  if(!canUseApi) return;
  try{
    const data = await getJson('/api/val/context-debug?days=30');
    renderTimelineStatus(data);
    renderTimelineReviewCards(data?.proposedTranscriptReviews || []);
  }catch(error){
    if(timelineStatusCount) timelineStatusCount.textContent = 'Timeline context unavailable';
    console.warn('[hearth] timeline context unavailable', error.message);
  }
}

function setRoomCopy(state){
  ['velocity','alignment','leverage'].forEach((name) => {
    const room = document.querySelector('.living-room.' + name);
    const content = state.rooms && state.rooms[name];
    if(!room || !content) return;
    const actionButton = room.querySelector('.room-action');
    room.querySelector('h2').textContent = content.card.title;
    room.querySelector('.room-copy').textContent = content.card.summary;
    const existingList = room.querySelector('.room-item-list');
    if(existingList) existingList.remove();
    const queue = homeRoomQueues[name] || [];
    if(queue.length && (name === 'velocity' || name === 'leverage')){
      const list = document.createElement('div');
      list.className = 'room-item-list';
      list.setAttribute('aria-label', name === 'velocity' ? 'Velocity items' : 'Prepared drafts');
      list.innerHTML = queue.map((item, index) => (
        '<div role="listitem" data-home-room-source="' + name + '" data-home-room-index="' + index + '"' +
          ' data-source-type="' + escapeHtml(item.sourceType || '') + '"' +
          ' data-source-id="' + escapeHtml(item.sourceId || '') + '"' +
          ' data-source-label="' + escapeHtml(item.sourceLabel || item.title || '') + '">' +
          '<span>' + (index + 1) + '</span>' +
          '<strong>' + escapeHtml(item.title) + '</strong>' +
          '<small>' + escapeHtml(item.kind || item.summary || 'Open with VAL') + '</small>' +
        '</div>'
      )).join('');
      room.insertBefore(list, actionButton);
    }
    actionButton.innerHTML = content.card.action + ' <b>&rarr;</b>';
    actionButton.dataset.actionType = content.card.primaryAction?.type || 'workspace';
    actionButton.setAttribute('aria-label', content.card.primaryAction?.ariaLabel || content.card.action);
    if(content.card.primaryAction?.target){
      actionButton.dataset.actionTarget = content.card.primaryAction.target;
    } else {
      delete actionButton.dataset.actionTarget;
    }
    room.setAttribute('aria-label', content.card.observation + ' ' + content.card.implication + ' ' + content.card.invitation);
    const hasWorkspace = Boolean(content.workspace && content.workspace.title);
    room.classList.toggle('has-workspace', hasWorkspace);
    if(hasWorkspace){
      room.setAttribute('tabindex', '0');
    } else {
      room.removeAttribute('tabindex');
    }
  });
  applyStoredRoomAttendance();
}

function openHomeItemCowork(roomName, index){
  const item = (homeRoomQueues[roomName] || [])[Number(index)];
  if(!item) return;
  const sourceItem = item.sourceItem || item;
  const roomLabel = roomName === 'leverage' ? 'prepared work' : 'movement';
  const sourceLabel = sourceActionLabel(sourceItem, roomName === 'leverage' ? 'Open prepared work' : 'Open source context');
  const workspace = {
    lens: roomName === 'leverage' ? 'Leverage Item' : 'Velocity Item',
    title: item.title,
    meaning: item.summary || itemMeaning(sourceItem, 'VAL opened this Home item with its current context attached.'),
    understanding: [
      ...homeSourceContextLines(sourceItem, item.title),
      sourceItem.confidence != null ? 'Confidence: ' + Math.round(Number(sourceItem.confidence) * 100) + '%' : '',
      'Priority ' + item.priority + ' in ' + (roomName === 'leverage' ? 'Leverage' : 'Velocity') + '.'
    ].filter(Boolean),
    recommendation: suggestedRecommendationForHomeItem(sourceItem, roomName),
    actions: suggestedHomeActionsForItem(sourceItem, roomName, sourceLabel),
    sourceItem,
    cardType: roomName === 'leverage' ? 'ready_for_you_queue_item' : 'what_changed_queue_item'
  };
  setWorkspaceContent({...workspace, label: 'Home ' + roomLabel + ' source workspace'});
  activeHomeWorkspace = {roomName, workspace};
  openWorkspaceShell('Home ' + roomLabel + ' source workspace', {returnTarget:'home'});
  document.querySelectorAll('.living-room').forEach((room) => {
    room.classList.toggle('active-room', room.dataset.room === roomName);
  });
}

function homeSourceContextLines(item = {}, fallbackTitle = 'Source context'){
  const identity = sourceIdentityForItem(item);
  return [
    'Home source: ' + (identity.label || fallbackTitle),
    identity.type ? 'Source type: ' + identity.type : '',
    identity.id ? 'Source id: ' + identity.id : '',
    ...sourceOfSourceLines(item)
  ].filter(Boolean);
}

async function openHomeItemWorkspaceFromButton(button, event){
  if(!button || !button.dataset.homeRoomItem) return false;
  if(event){
    event.preventDefault();
    event.stopPropagation();
    if(typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
  }
  const preflight = await ensureHearthClickPacket({
    node: button,
    packetName: button.dataset.valVariablePacket || 'home_source_packet',
    action: 'homeRoomItem:' + (button.dataset.homeRoomItem || ''),
    source: {
      sourceId: button.dataset.sourceId || '',
      sourceType: button.dataset.sourceType || '',
      sourceLabel: button.dataset.sourceLabel || '',
      sourceItem: (homeRoomQueues[button.dataset.homeRoomItem] || [])[Number(button.dataset.homeRoomIndex)] || null
    }
  });
  if(!preflight.ok) return true;
  openHomeItemCowork(button.dataset.homeRoomItem, button.dataset.homeRoomIndex);
  return true;
}

window.openHearthHomeItemFromButton = openHomeItemWorkspaceFromButton;

function setState(nextState){
  const state = states[nextState] || states.quiet;
  closeWorkspace();
  currentState = state;
  hearth.dataset.state = nextState;
  title.textContent = state.title;
  witness.textContent = state.witness;
  orientation.textContent = state.orientation;
  permission.textContent = state.permission;
  setRoomCopy(state);
  switches.forEach((button) => {
    button.classList.toggle('active', button.dataset.stateOption === nextState);
  });
}

function renderWorkspace(roomName){
  const content = currentState.rooms && currentState.rooms[roomName];
  if(!content || !content.workspace || !content.workspace.title) return false;
  const workspace = content.workspace;
  activeHomeWorkspace = {roomName, workspace};
  workspaceKicker.textContent = workspace.lens || roomName;
  workspaceTitle.textContent = workspace.title;
  workspaceMeaning.innerHTML = renderContextPortalText(workspace.meaning, workspace);
  renderJudgmentSequence(workspace, roomName);
  renderPaperLabels(workspace, roomName);
  renderAgencyNote(workspace, roomName);
  workspacePapers.meaning.innerHTML = renderContextPortalText(workspace.meaning, workspace);
  workspacePapers.understanding.innerHTML = workspace.understanding.map((item, index) => '<li>' + renderContextPortalText(item, workspace, index === 0) + '</li>').join('');
  workspacePapers.recommendation.innerHTML = renderContextPortalText(workspace.recommendation, workspace);
  workspaceActions.innerHTML = renderWorkspaceActionButtons(workspace.actions);
  renderHearthPacketReceiptStrip(lastHearthPacketReceipt);
  deskWorkspace.setAttribute('aria-label', (workspace.lens || roomName) + ' decision workspace');
  return true;
}

function meetingPrepEventTitle(event = activeMeetingPrepEvent){
  return event?.title || event?.summary || meetingPrep.event.title || 'Calendar event';
}

function meetingPrepEventTime(event = activeMeetingPrepEvent){
  const raw = event?.start || event?.startTime;
  if(!raw) return '';
  const date = new Date(raw);
  if(Number.isNaN(date.getTime())) return '';
  return date.toLocaleString([], {weekday:'short', month:'short', day:'numeric', hour:'numeric', minute:'2-digit'});
}

function meetingPrepEventDescription(event = activeMeetingPrepEvent){
  return event?.description || event?.notes || event?.location || event?.meetingLink || '';
}

function renderMeetingPrep(){
  const event = activeMeetingPrepEvent || meetingPrep.event;
  const eventTitle = meetingPrepEventTitle(event);
  const eventTime = meetingPrepEventTime(event);
  const eventDescription = meetingPrepEventDescription(event);
  workspaceKicker.textContent = meetingPrep.lens;
  workspaceTitle.textContent = eventTitle + ' prep is being assembled.';
  workspaceMeaning.textContent = 'VAL is preparing only the context attached to this calendar event.';
  renderJudgmentSequence({lens: 'Meeting Prep'}, 'meeting');
  renderPaperLabels({lens: 'Meeting Prep'}, 'meeting');
  renderAgencyNote({lens: 'Meeting Prep'}, 'meeting');
  workspacePapers.meaning.textContent = 'Calendar source: ' + eventTitle + (eventTime ? ' at ' + eventTime : '') + '.';
  workspacePapers.understanding.innerHTML = [
    eventDescription ? 'Event context: ' + eventDescription : 'No event description is attached.',
    event?.attendees?.length ? 'Attendees attached: ' + event.attendees.length : 'No attendees are attached to this event.',
    'VAL will not pull unrelated meeting prep into this card.'
  ].map((item) => '<li>' + escapeHtml(item) + '</li>').join('');
  workspacePapers.recommendation.textContent = 'Review this event-specific prep, then decide whether to create follow-up tasks or relationship context.';
  workspaceActions.innerHTML = renderWorkspaceActionButtons([
    {label:'Open full calendar', workflow:'calendar'},
    {label:'Create follow-up task', workflow:'task'},
    {label:'Close and return to desk', workflow:'cancel:meeting'}
  ]);
  renderHearthPacketReceiptStrip(lastHearthPacketReceipt);
  deskWorkspace.setAttribute('aria-label', 'Meeting prep workspace');
}

function meetingPrepAttendeeIdentityLines(attendees = []){
  activeMeetingContactCandidates = {};
  const lines = [];
  attendees.forEach((attendee, index) => {
    const name = attendee.name || attendee.email || 'Calendar attendee';
    if(attendee.crm_contact_id){
      lines.push(name + ' is organized under GHL contact ' + attendee.crm_contact_id + '.');
      return;
    }
    const unresolved = attendee.unresolved_relationship_context || {};
    const candidate = unresolved.contact_creation_candidate;
    if(candidate){
      const key = 'attendee_' + index;
      activeMeetingContactCandidates[key] = {attendee, candidate};
      lines.push(name + ' is not in GHL yet. Create the contact before VAL attaches relationship context. [[contact-candidate:' + key + ']]');
      return;
    }
    lines.push(name + ' has not resolved to a CRM/GHL contact yet.');
  });
  return lines;
}

function renderMeetingPrepUnderstanding(items = []){
  return items.map((item) => {
    const match = String(item || '').match(/\[\[contact-candidate:([^\]]+)\]\]/);
    if(!match) return '<li>' + escapeHtml(item) + '</li>';
    const text = String(item).replace(match[0], '').trim();
    const key = match[1];
    return '<li>' + escapeHtml(text) + ' <button type="button" class="inline-meeting-action" data-workflow-action="contactCandidate:' + escapeHtml(key) + '">Review contact candidate</button></li>';
  }).join('');
}

function renderMeetingPrepResult(result){
  const event = activeMeetingPrepEvent || meetingPrep.event;
  const brief = result.brief || {};
  const prep = brief.briefJson || {};
  const firstFive = brief.firstFiveMinutesJson || {};
  const questions = Array.isArray(brief.suggestedQuestionsJson) ? brief.suggestedQuestionsJson : [];
  const followUp = brief.followUpPreparationJson || {};
  const attendeeLines = meetingPrepAttendeeIdentityLines(Array.isArray(brief.attendeeIntelligenceJson) ? brief.attendeeIntelligenceJson : []);
  setWorkspaceContent({
    lens: 'Meeting Prep',
    title: prep.meeting_title || meetingPrepEventTitle(event),
    meaning: prep.concise_brief || ('VAL prepared context for ' + meetingPrepEventTitle(event) + '.'),
    understanding: [
      'Calendar source: ' + meetingPrepEventTitle(event) + (meetingPrepEventTime(event) ? ' at ' + meetingPrepEventTime(event) : '') + '.',
      firstFive.first_sentence_option ? 'Opening: ' + firstFive.first_sentence_option : 'Opening guidance is prepared.',
      ...attendeeLines,
      questions[0]?.text ? 'First question: ' + questions[0].text : 'Suggested questions are prepared.',
      followUp.likely_follow_up_needed ? 'Follow-up preparation is likely needed after the meeting.' : 'No follow-up action is required yet.'
    ],
    recommendation: (prep.what_val_recommends_preparing || []).join(' / ') || meetingPrep.recommendation,
    actions: [
      {label: 'Open relationship context', workflow: 'pipeline'},
      {label: 'Prepare follow-up', workflow: 'teach'},
      {label: 'Close and return to desk', workflow: 'cancel:meeting'}
    ],
    label: 'Meeting prep workspace'
  });
  workspacePapers.understanding.innerHTML = renderMeetingPrepUnderstanding([
    firstFive.first_sentence_option ? 'Opening: ' + firstFive.first_sentence_option : 'Opening guidance is prepared.',
    ...attendeeLines,
    questions[0]?.text ? 'First question: ' + questions[0].text : 'Suggested questions are prepared.',
    followUp.likely_follow_up_needed ? 'Follow-up preparation is likely needed after the meeting.' : 'No follow-up action is required yet.'
  ]);
}

async function runMeetingPrep(){
  const event = activeMeetingPrepEvent || meetingPrep.event;
  if(mockScrapers || !canUseApi){
    renderMeetingPrep();
    return;
  }
  setWorkspaceContent({
    lens: 'Meeting Prep',
    title: 'VAL is preparing ' + meetingPrepEventTitle(event) + '.',
    meaning: 'This should reduce what you have to hold before this calendar event.',
    understanding: [
      'Calendar source: ' + meetingPrepEventTitle(event) + (meetingPrepEventTime(event) ? ' at ' + meetingPrepEventTime(event) : '') + '.',
      'Internal relationship and CRM context are being checked.',
      'External enrichment is planned only if it improves judgment for this event.'
    ],
    recommendation: 'Let VAL assemble the brief, then review the parts that affect your judgment.',
    actions: [{label: 'Close and return to desk', workflow: 'cancel:meeting'}],
    label: 'Meeting prep loading workspace'
  });
  try{
    const result = await postJson('/api/val/calendar/meeting-prep', {event});
    renderMeetingPrepResult(result);
  }catch(error){
    setWorkspaceContent({
      lens: 'Meeting Prep',
      title: 'Meeting prep needs attention.',
      meaning: 'VAL did not take any external action. The prep brief could not be assembled cleanly.',
      understanding: [
        error.message,
        'The calendar card remains available.',
        'Internal context can still be reviewed from the desk.'
      ],
      recommendation: 'Open the full calendar or try again when the calendar connection is ready.',
      actions: [
        {label: 'Open full calendar', workflow: 'calendar'},
        {label: 'Close and return to desk', workflow: 'cancel:meeting'}
      ],
      label: 'Meeting prep error workspace'
    });
  }
}

function setWorkspaceContent({lens,title,meaning,understanding,recommendation,actions,label,packetReceipt}){
  activeHomeWorkspace = null;
  deskWorkspace.classList.remove('witnessing-mode');
  workspaceKicker.textContent = lens;
  workspaceTitle.textContent = title;
  workspaceMeaning.textContent = meaning;
  renderJudgmentSequence({lens}, lens);
  renderPaperLabels({lens}, lens);
  renderAgencyNote({lens}, lens);
  workspacePapers.meaning.textContent = meaning;
  workspacePapers.understanding.innerHTML = understanding.map((item) => '<li>' + escapeHtml(item) + '</li>').join('');
  workspacePapers.recommendation.textContent = recommendation;
  workspaceActions.innerHTML = renderWorkspaceActionButtons(actions);
  renderHearthPacketReceiptStrip(packetReceipt || lastHearthPacketReceipt);
  deskWorkspace.setAttribute('aria-label', label || lens + ' workspace');
  scraperCriteriaPanel.hidden = true;
  scraperCriteriaPanel.innerHTML = '';
  scraperPreviewList.hidden = true;
  scraperPreviewList.innerHTML = '';
  scraperPreviewList.classList.remove('linkedin-preview-list');
  workspaceInputPanel.hidden = true;
  workspaceInputPanel.innerHTML = '';
  applyHearthClickContracts(deskWorkspace);
}

function packetReceiptSummary(packet = {}){
  const receipt = packet.receipt || {};
  const sourceReceipts = Array.isArray(receipt.sourceReceipts) ? receipt.sourceReceipts : [];
  const downstreamConsumers = Array.isArray(receipt.downstreamConsumers) ? receipt.downstreamConsumers : [];
  const explicitSourceLabel = packet.source?.sourceLabel || packet.source?.sourceItem?.name || packet.source?.sourceItem?.title || '';
  const sourceLabels = (explicitSourceLabel ? [explicitSourceLabel] : sourceReceipts
    .map((item) => item.label || item.sourceLabel || item.source_type || item.sourceType || item.key || item.variable)
    .filter(Boolean)
    .slice(0, 3));
  return {
    packetName: packet.packetName || receipt.packetName || '',
    status: packet.status || receipt.status || '',
    receiptId: packet.receiptId || receipt.id || '',
    clickAction: packet.click?.action || receipt.clickAction || '',
    sourceCount: sourceReceipts.length,
    downstreamConsumers,
    sourceLabels
  };
}

function renderPacketReceiptInto(target, packet = null){
  if(!target) return;
  if(!packet || !packet.packetName){
    target.hidden = true;
    target.innerHTML = '';
    return;
  }
  const summary = packetReceiptSummary(packet);
  const status = summary.status || 'checked';
  target.hidden = false;
  target.dataset.packetStatus = status;
  target.innerHTML = [
    '<div>',
      '<span>Packet receipt</span>',
      '<strong>' + escapeHtml(summary.packetName) + '</strong>',
      summary.receiptId ? '<small>' + escapeHtml(summary.receiptId) + '</small>' : '<small>metadata-only receipt</small>',
    '</div>',
    '<ul>',
      '<li>Status: ' + escapeHtml(status) + '</li>',
      summary.clickAction ? '<li>Click: ' + escapeHtml(summary.clickAction) + '</li>' : '',
      '<li>Sources: ' + escapeHtml(String(summary.sourceCount)) + '</li>',
      summary.downstreamConsumers.length ? '<li>Feeds: ' + escapeHtml(summary.downstreamConsumers.slice(0, 4).join(', ')) + '</li>' : '',
      summary.sourceLabels.length ? '<li>Source proof: ' + escapeHtml(summary.sourceLabels.join(', ')) + '</li>' : ''
    ].filter(Boolean).join('') + '</ul>';
}

function renderHearthPacketReceiptStrip(packet = null){
  renderPacketReceiptInto(workspacePacketReceipt, packet);
}

function renderCalendarPacketReceiptStrip(packet = null){
  renderPacketReceiptInto(calendarPacketReceipt, packet);
}

function renderDrawerPacketReceiptStrip(packet = null){
  renderPacketReceiptInto(drawerPacketReceipt, packet);
}

function lensSequenceLabels(workspace = {}, roomName = ''){
  const lens = String(workspace.lens || roomName || '').toLowerCase();
  if(/temperature/.test(lens)) return ['Current read', 'Correction', 'Evidence', 'Decision'];
  if(/velocity/.test(lens)) return ['Movement', 'Meaning', 'Evidence', 'Next step'];
  if(/alignment/.test(lens)) return ['Judgment', 'Fit', 'Tradeoff', 'Choice'];
  if(/relationship|introduction/.test(lens)) return ['Leverage', 'Fit', 'Review', 'Approval'];
  if(/leverage/.test(lens)) return ['Prepared', 'Review', 'Approve', 'Release'];
  if(/meeting/.test(lens)) return ['Purpose', 'People', 'Opening', 'Follow-up'];
  if(/lead|scraper|approval|connection/.test(lens)) return ['Criteria', 'Preview', 'Approve', 'Import'];
  if(/co-work|cowork|notebook/.test(lens)) return ['Thought', 'Shape', 'Draft', 'Decide'];
  if(/teach/.test(lens)) return ['Notice', 'Instruction', 'Review', 'Remember'];
  return ['Meaning', 'Evidence', 'Recommendation', 'Agency'];
}

function renderJudgmentSequence(workspace = {}, roomName = ''){
  if(!judgmentSequence) return;
  judgmentSequence.innerHTML = lensSequenceLabels(workspace, roomName)
    .map((label) => '<span>' + escapeHtml(label) + '</span>')
    .join('');
}

function paperLabelsForLens(workspace = {}, roomName = ''){
  const lens = String(workspace.lens || roomName || '').toLowerCase();
  if(/temperature/.test(lens)) return ['Temperature context', 'Review evidence', 'Decision boundary'];
  if(/velocity/.test(lens)) return ['What moved', 'Why VAL noticed', 'Suggested next step'];
  if(/alignment/.test(lens)) return ['Why this matters', 'What it protects', 'Alignment check'];
  if(/relationship|introduction/.test(lens)) return ['Relationship leverage', 'Two directions', 'Review posture'];
  if(/leverage/.test(lens)) return ['What is ready', 'What is already handled', 'Review posture'];
  if(/meeting/.test(lens)) return ['Meeting meaning', 'Prepared context', 'How to enter'];
  if(/lead|scraper|approval|connection/.test(lens)) return ['Scrape intent', 'Trust evidence', 'Approval posture'];
  if(/co-work|cowork|notebook/.test(lens)) return ['Working thought', 'What VAL can hold', 'Next useful artifact'];
  if(/teach/.test(lens)) return ['What to teach', 'How VAL will use it', 'Review before memory'];
  return ['Meaning', 'Understanding', 'Recommendation'];
}

function renderPaperLabels(workspace = {}, roomName = ''){
  const labels = paperLabelsForLens(workspace, roomName);
  if(workspacePapers.meaningLabel) workspacePapers.meaningLabel.textContent = labels[0];
  if(workspacePapers.understandingLabel) workspacePapers.understandingLabel.textContent = labels[1];
  if(workspacePapers.recommendationLabel) workspacePapers.recommendationLabel.textContent = labels[2];
}

function agencyNoteForLens(workspace = {}, roomName = ''){
  const lens = String(workspace.lens || roomName || '').toLowerCase();
  if(/temperature/.test(lens)) return 'Temperature teaching can become local learning, but observer-backed movement still needs evidence.';
  if(/velocity/.test(lens)) return 'Open the source only if the meaning is not already clear enough.';
  if(/alignment/.test(lens)) return 'VAL is offering a judgment, not making the decision for you.';
  if(/relationship|introduction/.test(lens)) return 'Introductions stay private until you review why both people belong in the same conversation.';
  if(/leverage/.test(lens)) return 'Prepared work waits here until you approve, refine, or release it.';
  if(/meeting/.test(lens)) return 'Meeting prep stays private until you choose what to use.';
  if(/lead|scraper|approval|connection/.test(lens)) return 'Nothing enters GHL until the preview is reviewed and approved.';
  if(/co-work|cowork|notebook/.test(lens)) return 'Co-Work can become work only when you choose to shape it.';
  if(/teach/.test(lens)) return 'Teaching stays reviewable before VAL turns it into memory.';
  return 'VAL will wait for your judgment before anything moves.';
}

function renderAgencyNote(workspace = {}, roomName = ''){
  if(!agencyNote) return;
  agencyNote.textContent = agencyNoteForLens(workspace, roomName);
}

function renderWorkspaceActionButtons(actions = []){
  return actions.map((action, index) => {
    const spec = typeof action === 'string' ? {label: action} : action;
    const label = spec.label || 'Review';
    const classes = ['workspace-action'];
    if(index === 0) classes.push('primary-action');
    if(/teach/i.test(label) || spec.workflow === 'teach') classes.push('teach-action');
    if(/close|return|cancel|dismiss/i.test(label)) classes.push('quiet-action');
    const attrs = [
      ' class="' + classes.join(' ') + '"',
      spec.workflow ? ' data-workflow-action="' + escapeHtml(spec.workflow) + '"' : '',
      spec.homeAction ? ' data-home-action="' + escapeHtml(spec.homeAction) + '"' : '',
      spec.packet ? ' data-val-variable-packet="' + escapeHtml(spec.packet) + '"' : '',
      spec.workflow ? ' onclick="event.preventDefault();event.stopPropagation();handleWorkflowAction(this.dataset.workflowAction,this);return false;"' : '',
      spec.homeAction ? ' onclick="event.preventDefault();event.stopPropagation();handleHomeRoomAction(this.dataset.homeAction,this);return false;"' : ''
    ].join('');
    return '<button type="button"' + attrs + '>' + escapeHtml(label) + '</button>';
  }).join('');
}

function portalPhraseForWorkspace(workspace = {}){
  const item = workspace.sourceItem || {};
  const profile = targetProfile(item);
  if(profile.key === 'source' && !(item.target || item.id || item.source_id || item.sourceId)) return '';
  const phrase = (Array.isArray(item.portalPhrases) ? item.portalPhrases : [])
    .map(compactSentence)
    .find((candidate) => candidate && [
      workspace.meaning,
      ...(Array.isArray(workspace.understanding) ? workspace.understanding : []),
      workspace.recommendation
    ].some((text) => String(text || '').toLowerCase().includes(candidate.toLowerCase())));
  if(phrase) return phrase;
  if(profile.key === 'opportunity') return item.opportunityName || item.name || item.title || 'GHL opportunity';
  if(profile.key === 'draft') return /proposal/i.test(item.title || item.summary || '') ? 'proposal' : (item.title || 'prepared draft');
  if(profile.key === 'relationship') return item.name || item.contactName || item.title || 'relationship';
  if(profile.key === 'project') return item.projectName || item.name || item.title || 'project';
  if(profile.key === 'meeting') return item.title || item.name || 'meeting';
  if(profile.key === 'evidence') return item.title || item.source_id || item.sourceId || 'evidence';
  return item.title || item.name || '';
}

function renderContextPortalText(text, workspace = {}, allowFallback = true){
  const value = String(text == null ? '' : text);
  if(workspace.suppressInlinePortals) return escapeHtml(value);
  const profile = targetProfile(workspace.sourceItem || {});
  if(profile.key === 'source' && !(workspace.sourceItem?.target || workspace.sourceItem?.id || workspace.sourceItem?.source_id || workspace.sourceItem?.sourceId)) return escapeHtml(value);
  const phrase = compactSentence(portalPhraseForWorkspace(workspace));
  if(!phrase) return escapeHtml(value);
  const index = value.toLowerCase().indexOf(phrase.toLowerCase());
  if(index >= 0){
    return escapeHtml(value.slice(0, index)) +
      '<button type="button" class="context-portal" data-home-action="open_source">' +
      escapeHtml(value.slice(index, index + phrase.length)) +
      '</button>' +
      escapeHtml(value.slice(index + phrase.length));
  }
  if(profile.key === 'email') return escapeHtml(value);
  if(!allowFallback) return escapeHtml(value);
  return escapeHtml(value) +
    ' <button type="button" class="context-portal inline-context-portal" data-home-action="open_source">' +
    escapeHtml(sourceActionLabel(workspace.sourceItem || {}, 'Open context')) +
    '</button>';
}

const valAutocorrectMap = {
  teh:'the',
  adn:'and',
  recieve:'receive',
  recieved:'received',
  definately:'definitely',
  seperate:'separate',
  occured:'occurred',
  occuring:'occurring',
  accomodate:'accommodate',
  acheive:'achieve',
  acheived:'achieved',
  becuase:'because',
  begining:'beginning',
  calender:'calendar',
  committment:'commitment',
  committments:'commitments',
  concious:'conscious',
  enviroment:'environment',
  goverment:'government',
  judgement:'judgment',
  liason:'liaison',
  maintenence:'maintenance',
  neccessary:'necessary',
  occassion:'occasion',
  opporunity:'opportunity',
  opporunities:'opportunities',
  priviledge:'privilege',
  recomend:'recommend',
  recomendation:'recommendation',
  recomendations:'recommendations',
  relevent:'relevant',
  sucess:'success',
  sucessful:'successful',
  tommorrow:'tomorrow',
  wierd:'weird',
  woudl:'would',
  shoudl:'should',
  coudl:'could',
  thier:'their',
  taht:'that',
  tehre:'there',
  tehri:'their'
};

const valAutocorrectWords = [
  'alignment','approve','briefing','calendar','commitment','context','correspondence','decision',
  'document','draft','email','evidence','follow','intelligence','judgment','leverage','meeting',
  'memory','onboarding','opportunity','prepared','project','recommendation','relationship',
  'source','timeline','transcript','velocity','witnessing'
];

function valEditDistance(a = '', b = ''){
  if(Math.abs(a.length - b.length) > 1) return 2;
  const rows = Array.from({length:a.length + 1}, (_, i) => [i]);
  for(let j = 1; j <= b.length; j++) rows[0][j] = j;
  for(let i = 1; i <= a.length; i++){
    for(let j = 1; j <= b.length; j++){
      rows[i][j] = Math.min(
        rows[i - 1][j] + 1,
        rows[i][j - 1] + 1,
        rows[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return rows[a.length][b.length];
}

function valAutocorrectSuggestion(word = ''){
  const clean = String(word || '').replace(/^[^A-Za-z']+|[^A-Za-z']+$/g, '');
  if(clean.length < 3 || /^[A-Z][a-z]+$/.test(clean)) return null;
  const lower = clean.toLowerCase();
  const mapped = valAutocorrectMap[lower];
  if(mapped) return clean === lower ? mapped : mapped.charAt(0).toUpperCase() + mapped.slice(1);
  if(clean.length < 5) return null;
  const close = valAutocorrectWords.find((candidate) => valEditDistance(lower, candidate) === 1);
  if(!close || close === lower) return null;
  return clean === lower ? close : close.charAt(0).toUpperCase() + close.slice(1);
}

function valAutocorrectTarget(field){
  const value = field.value || '';
  const caret = field.selectionStart == null ? value.length : field.selectionStart;
  const before = value.slice(0, caret);
  const match = before.match(/([A-Za-z']+)(\s*)$/);
  if(!match) return null;
  const word = match[1];
  const suggestion = valAutocorrectSuggestion(word);
  if(!suggestion || suggestion.toLowerCase() === word.toLowerCase()) return null;
  const end = caret - match[2].length;
  return {word, suggestion, start:end - word.length, end};
}

function removeValAutocorrect(){
  document.querySelectorAll('.val-autocorrect').forEach((node) => node.remove());
}

function applyValAutocorrect(field, target){
  if(!field || !target) return;
  field.value = field.value.slice(0, target.start) + target.suggestion + field.value.slice(target.end);
  const caret = target.start + target.suggestion.length;
  field.setSelectionRange(caret, caret);
  field.dispatchEvent(new Event('input', {bubbles:true}));
  field.focus();
}

function renderValAutocorrect(field){
  removeValAutocorrect();
  if(!isValAutocorrectField(field)) return;
  const target = valAutocorrectTarget(field);
  if(!target) return;
  const prompt = document.createElement('div');
  prompt.className = 'val-autocorrect';
  prompt.innerHTML = '<span>Spelling</span><button type="button">Did you mean "' + escapeHtml(target.suggestion) + '"?</button>';
  prompt.querySelector('button').addEventListener('click', () => applyValAutocorrect(field, target));
  const label = field.closest('label');
  if(label && field.nextSibling){
    label.insertBefore(prompt, field.nextSibling);
  } else if(label) {
    label.appendChild(prompt);
  } else {
    field.insertAdjacentElement('afterend', prompt);
  }
}

function isValAutocorrectField(field){
  if(!field || field.disabled || field.readOnly) return false;
  if(field.tagName === 'TEXTAREA') return true;
  if(field.tagName !== 'INPUT') return false;
  return ['text','search'].includes((field.type || 'text').toLowerCase());
}

function enableValAutocorrect(root = document){
  root.querySelectorAll('textarea,input[type="text"],input[type="search"]').forEach((field) => {
    field.setAttribute('spellcheck', 'true');
    field.setAttribute('autocorrect', 'on');
    field.setAttribute('autocomplete', field.getAttribute('autocomplete') || 'on');
  });
}

function renderWorkspaceInput({label,placeholder,helper,mode,value = '', promptCards = []}){
  activeWorkspacePromptCards = promptCards;
  workspaceInputPanel.hidden = false;
  const isCowork = /cowork|teach|onboarding|import|document|proposal|draft/i.test(String(mode || '') + ' ' + String(label || ''));
  workspaceInputPanel.innerHTML = [
    promptCards.length ? '<div class="workspace-prompt-shelf" aria-label="Copyable prompts">' + promptCards.map((card, index) => (
      '<article class="workspace-prompt-card">' +
        '<span>' + escapeHtml(card.kicker || 'Prompt') + '</span>' +
        '<strong>' + escapeHtml(card.title || 'Import prompt') + '</strong>' +
        '<p>' + escapeHtml(card.summary || '') + '</p>' +
        '<button type="button" data-workspace-prompt-copy="' + index + '">' + escapeHtml(card.button || 'Copy prompt') + '</button>' +
      '</article>'
    )).join('') + '</div>' : '',
    '<label>',
      '<span>' + escapeHtml(label) + '</span>',
      '<textarea data-workspace-input="' + escapeHtml(mode) + '" placeholder="' + escapeHtml(placeholder) + '" spellcheck="true" autocorrect="on" autocomplete="on">' + escapeHtml(value) + '</textarea>',
    '</label>',
    isCowork ? [
      '<div class="workspace-input-tools" aria-label="Co-Work input tools">',
        '<button type="button" data-workspace-tool="voice">Voice</button>',
        '<button type="button" data-workspace-tool="upload">Upload</button>',
        '<button type="button" data-workspace-tool="image">Generate Image</button>',
        '<input type="file" data-workspace-file-input multiple hidden>',
      '</div>',
      '<small class="workspace-tool-status" data-workspace-tool-status>Voice, uploads, and image requests stay inside this workspace until you approve what should happen next.</small>'
    ].join('') : '',
    helper ? '<small>' + escapeHtml(helper) + '</small>' : ''
  ].join('');
  enableValAutocorrect(workspaceInputPanel);
  applyHearthClickContracts(workspaceInputPanel);
}

function activeWorkspaceTextarea(){
  return workspaceInputPanel.querySelector('[data-workspace-input]');
}

function setWorkspaceToolStatus(message){
  const status = workspaceInputPanel.querySelector('[data-workspace-tool-status]');
  if(status) status.textContent = message;
}

function appendToWorkspaceInput(text){
  const textarea = activeWorkspaceTextarea();
  if(!textarea || !text) return;
  const prefix = textarea.value.trim() ? '\n\n' : '';
  textarea.value += prefix + text;
  textarea.focus();
}

function startWorkspaceVoiceInput(){
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SpeechRecognition){
    setWorkspaceToolStatus('Voice input is not available in this browser yet. Type here, or use upload/generate image as context.');
    return;
  }
  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  setWorkspaceToolStatus('Listening. Speak the context you want VAL to hold here.');
  recognition.onresult = (event) => {
    const transcript = Array.from(event.results || [])
      .map((result) => result[0]?.transcript || '')
      .join(' ')
      .trim();
    appendToWorkspaceInput(transcript);
    setWorkspaceToolStatus(transcript ? 'Voice note added to this workspace. Nothing was sent or saved externally.' : 'Voice stopped without a transcript.');
  };
  recognition.onerror = () => {
    setWorkspaceToolStatus('Voice input could not start. The typed Co-Work and upload controls are still available.');
  };
  recognition.onend = () => {
    const current = workspaceInputPanel.querySelector('[data-workspace-tool-status]')?.textContent || '';
    if(current === 'Listening. Speak the context you want VAL to hold here.'){
      setWorkspaceToolStatus('Voice listening ended. Add more context or ask VAL to help shape it.');
    }
  };
  recognition.start();
}

async function appendWorkspaceFiles(files = []){
  const selected = Array.from(files || []);
  if(!selected.length) return;
  setWorkspaceToolStatus('Reading ' + selected.length + ' uploaded file' + (selected.length === 1 ? '' : 's') + ' for this workspace only.');
  const snippets = await Promise.all(selected.slice(0, 6).map(async (file) => {
    const receipt = 'Uploaded file: ' + file.name + ' (' + Math.ceil((file.size || 0) / 1024) + ' KB)';
    if(!/^text\/|json|csv|markdown|xml|html|javascript/.test(file.type || '') && !/\.(txt|md|json|csv|tsv|html|css|js)$/i.test(file.name || '')){
      return receipt + '\nContext: file attached for review. VAL should use the document library/upload pipeline before treating this as durable evidence.';
    }
    try{
      const text = await file.text();
      return receipt + '\nExcerpt: ' + text.slice(0, 1200);
    }catch(error){
      return receipt + '\nContext: file selected, but this browser could not read a local excerpt.';
    }
  }));
  appendToWorkspaceInput(snippets.join('\n\n'));
  setWorkspaceToolStatus('Upload context added to this workspace. Nothing was sent, posted, or written to memory.');
}

async function appendValWitnessingFiles(category, files = []){
  const selected = Array.from(files || []);
  if(!selected.length) return;
  const card = valWitnessingCard(category);
  const mode = 'val-witnessing-' + card.category;
  const statusTarget = workspaceInputPanel.querySelector('.val-conversation-helper');
  if(statusTarget) statusTarget.textContent = 'Uploading ' + selected.length + ' file' + (selected.length === 1 ? '' : 's') + ' into VAL document context...';
  const receipts = [];
  for(const file of selected.slice(0, 8)){
    let receipt = 'Uploaded file: ' + file.name + ' (' + Math.ceil((file.size || 0) / 1024) + ' KB)';
    if(canUseApi && !mockScrapers){
      try{
        const form = new FormData();
        form.append('files', file, file.name);
        form.append('uploadedVia', 'val_witnessing_session');
        form.append('docType', 'knowledge_document');
        form.append('title', file.name);
        const response = await fetch('/api/val/files', {method:'POST', body:form});
        const data = await response.json().catch(() => ({}));
        if(!response.ok) throw new Error(data.error || data.message || 'Upload failed');
        receipt += '\nVAL file id: ' + (data.id || data.files?.[0]?.id || 'saved');
        receipt += '\nClassification needed: Document or Template.';
        receipt += '\nIf Document: which relationship or project does this belong to?';
        receipt += '\nIf Template: what is this template used for?';
      }catch(error){
        receipt += '\nUpload note: VAL could not read this file yet (' + (error.message || 'upload failed') + '). Keep the file named here and add its purpose below.';
      }
    }else{
      receipt += '\nPrototype note: file selected. In live VAL this should upload into the document library before being interpreted.';
    }
    receipts.push(receipt);
  }
  const textarea = workspaceInputPanel.querySelector('[data-workspace-input="' + mode + '"]');
  if(textarea){
    const prefix = textarea.value.trim() ? '\n\n' : '';
    textarea.value += prefix + receipts.join('\n\n');
    textarea.focus();
  }else{
    appendToWorkspaceInput(receipts.join('\n\n'));
  }
  if(statusTarget) statusTarget.textContent = 'File context added. Tell VAL whether each item is a Document or Template before continuing.';
}

async function copyValWitnessingImportPrompt(){
  try{
    await navigator.clipboard.writeText(valUniversalAiImportPrompt);
    valLiveStatus.textContent = 'Copied the one-time ChatGPT/Claude import prompt.';
  }catch(error){
    const card = valWitnessingCard('import_context');
    const mode = 'val-witnessing-' + card.category;
    const textarea = workspaceInputPanel.querySelector('[data-workspace-input="' + mode + '"]');
    if(textarea){
      textarea.value = valUniversalAiImportPrompt + '\n\n' + textarea.value;
      textarea.focus();
    }
    valLiveStatus.textContent = 'Clipboard was unavailable, so I placed the prompt in the text box.';
  }
}

function appendWorkspaceImageRequest(){
  appendToWorkspaceInput([
    'Image request for VAL:',
    '- Purpose:',
    '- Style/reference:',
    '- Where it will be used:',
    '- Relationship/project context:',
    '- Approval needed before external use: yes'
  ].join('\n'));
  setWorkspaceToolStatus('Image-generation brief added. VAL will prepare imagery as a draft for review before any external use.');
}

function renderCriteriaField(field){
  const label = '<span>' + field.label + '</span>';
  const dataLabel = ' data-criteria-label="' + field.label + '"';
  if(field.type === 'select'){
    return '<label class="criteria-field">' + label + '<select' + dataLabel + '>' + field.options.map((option) => (
      '<option' + (option === field.value ? ' selected' : '') + '>' + option + '</option>'
    )).join('') + '</select></label>';
  }
  if(field.type === 'textarea'){
    return '<label class="criteria-field wide">' + label + '<textarea' + dataLabel + '>' + field.value + '</textarea></label>';
  }
  return '<label class="criteria-field">' + label + '<input' + dataLabel + ' type="' + (field.type || 'text') + '" value="' + field.value + '"></label>';
}

function renderScraperCriteria(workflow){
  if(!workflow.criteria) return;
  const criteria = workflow.criteria;
  scraperCriteriaPanel.hidden = false;
  scraperCriteriaPanel.innerHTML = [
    '<section class="criteria-card">',
      '<h3>' + criteria.title + '</h3>',
      '<div class="criteria-grid">' + criteria.fields.map(renderCriteriaField).join('') + '</div>',
    '</section>',
    '<section class="criteria-card source-readiness">',
      '<h3>Source readiness</h3>',
      '<div class="source-status"><span>Destination</span><b>' + criteria.destination + '</b></div>',
      criteria.sources.map((source) => '<div class="source-status"><span>' + source[0] + '</span><b>' + source[1] + '</b></div>').join(''),
    '</section>'
  ].join('');
}

function renderScraperPreviewList(workflow, stage){
  const leads = workflow.previewLeads || [];
  if(!leads.length || stage === 'setup') return;
  const stageLabel = stage === 'imported' ? 'Imported records' : stage === 'verified' ? 'Verified preview' : 'Preview records';
  scraperPreviewList.hidden = false;
  scraperPreviewList.innerHTML = [
    '<div class="preview-list-head"><span>' + stageLabel + '</span><small data-preview-summary>Details create trust before approval.</small></div>',
    leads.map((lead, index) => (
      '<article class="preview-lead" data-lead-index="' + index + '" data-lead-review="' + (lead._approved === false ? 'held' : 'approved') + '">' +
        '<div><strong>' + escapeHtml(lead.name) + '</strong><span>' + escapeHtml(lead.type) + '</span></div>' +
        '<div><b>' + escapeHtml(lead.score) + '</b><small class="muted">' + escapeHtml(lead.location) + '</small></div>' +
        '<div><span>' + escapeHtml(lead.contact) + '</span></div>' +
        '<div><small>' + escapeHtml(lead.evidence) + '</small></div>' +
        '<div class="preview-controls" aria-label="Review decision for ' + escapeHtml(lead.name) + '">' +
          '<button type="button" class="preview-choice' + (lead._approved === false ? '' : ' active') + '" data-preview-choice="approved">Approve</button>' +
          '<button type="button" class="preview-choice' + (lead._approved === false ? ' active' : '') + '" data-preview-choice="held">Hold</button>' +
        '</div>' +
      '</article>'
    )).join('')
  ].join('');
  updatePreviewApprovalSummary();
}

function updatePreviewApprovalSummary(){
  const rows = Array.from(scraperPreviewList.querySelectorAll('.preview-lead'));
  if(!rows.length) return;
  const approved = rows.filter((row) => row.dataset.leadReview !== 'held').length;
  const held = rows.length - approved;
  const summary = scraperPreviewList.querySelector('[data-preview-summary]');
  if(summary){
    summary.textContent = approved + ' approved / ' + held + ' held';
  }
  const importAction = workspaceActions.querySelector('[data-workflow-action^="import:"]');
  if(importAction){
    importAction.textContent = approved ? 'Import ' + approved + ' approved lead' + (approved === 1 ? '' : 's') : 'No approved leads';
    importAction.disabled = approved === 0;
  }
}

function activeLeadIntelligenceSource(action = '', extra = {}){
  const type = activeScraperType || extra.type || '';
  const session = type ? sessionFor(type) : {};
  const rows = scraperPreviewList ? Array.from(scraperPreviewList.querySelectorAll('.preview-lead')) : [];
  const approvedCount = rows.filter((row) => row.dataset.leadReview !== 'held').length;
  const heldCount = rows.length - approvedCount;
  return {
    ...extra,
    sourceId: extra.sourceId || type || action || 'lead_intelligence',
    sourceType: extra.sourceType || 'lead_intelligence_workflow',
    sourceLabel: extra.sourceLabel || (type ? documentTypeLabel(type) + ' Lead Intelligence' : 'Lead Intelligence'),
    sourceItem: extra.sourceItem || {
      id: type || 'lead_intelligence',
      title: extra.sourceLabel || (type ? documentTypeLabel(type) + ' Lead Intelligence' : 'Lead Intelligence'),
      workflowType: type,
      criteria: session?.payload || null,
      previewCount: rows.length,
      approvedCount,
      heldCount
    },
    workflowType: type,
    previewCount: rows.length,
    approvedCount,
    heldCount,
    requestedAction: action
  };
}

function getScraperCriteria(){
  return Array.from(scraperCriteriaPanel.querySelectorAll('[data-criteria-label]')).reduce((values, field) => {
    values[field.dataset.criteriaLabel] = field.value;
    return values;
  }, {});
}

function escapeHtml(value){
  return String(value == null ? '' : value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

function leadField(lead, keys, fallback = ''){
  for(const key of keys){
    if(lead && lead[key] != null && String(lead[key]).trim()) return String(lead[key]).trim();
  }
  return fallback;
}

function normalizePreviewLead(lead, type){
  const sourceUrls = Array.isArray(lead.sourceUrls) ? lead.sourceUrls : Array.isArray(lead.sources) ? lead.sources : [];
  const contactName = leadField(lead, ['decisionMakerName','contactName','primaryContact','name'], '');
  const contactTitle = leadField(lead, ['decisionMakerTitle','contactTitle','title'], '');
  const contact = contactName ? contactName + (contactTitle ? ', ' + contactTitle : '') : lead.email || lead.phone || 'Decision maker not confirmed';
  const score = type === 'partners'
    ? (lead.partnershipFitScore != null ? 'Fit ' + Number(lead.partnershipFitScore) + '/100' : leadField(lead, ['score','leadScore','partnerFit'], 'Fit pending'))
    : (lead.leadScore != null ? 'Score ' + lead.leadScore : leadField(lead, ['score','leadScoreReason','partnerFit','confidence'], 'Review fit'));
  const evidence = leadField(lead, ['reasonForScore','leadScoreReason','evidence','nextOutreachAngle','recommendedOutreachAngle','tagReason'], sourceUrls.length ? 'Sources: ' + sourceUrls.slice(0, 2).join(', ') : 'Evidence attached in scraper result.');
  return {
    name: leadField(lead, ['organizationName','companyName','businessName','name'], 'Unnamed organization'),
    type: leadField(lead, ['partnerType','organizationType','industry','aiExactIndustry','normalizedIndustry'], type === 'partners' ? 'Strategic partner' : 'Organization'),
    location: leadField(lead, ['location','city','state','market'], 'Location pending'),
    score,
    contact,
    evidence,
    _raw: lead,
    _approved: lead._approved !== false
  };
}

function sessionFor(type){
  scraperSessions[type] = scraperSessions[type] || {};
  return scraperSessions[type];
}

async function postJson(url, payload){
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload)
  });
  const text = await response.text();
  let data = {};
  try{ data = text ? JSON.parse(text) : {}; }
  catch(e){ data = {content: text}; }
  if(!response.ok || data.ok === false){
    const error = new Error(data.error || data.message || 'Request failed.');
    error.data = data;
    error.status = response.status;
    throw error;
  }
  return data;
}

async function postFormData(url, payload){
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'same-origin',
    body: payload
  });
  const text = await response.text();
  let data = {};
  try{ data = text ? JSON.parse(text) : {}; }
  catch(e){ data = {content: text}; }
  if(!response.ok || data.ok === false){
    const error = new Error(data.error || data.message || 'Request failed.');
    error.data = data;
    error.status = response.status;
    throw error;
  }
  return data;
}

async function getJson(url){
  const response = await fetch(url, {credentials: 'same-origin'});
  const text = await response.text();
  let data = {};
  try{ data = text ? JSON.parse(text) : {}; }
  catch(e){ data = {content: text}; }
  if(!response.ok || data.ok === false){
    const error = new Error(data.error || data.message || 'Request failed.');
    error.data = data;
    error.status = response.status;
    throw error;
  }
  return data;
}

const hearthServerPacketNames = new Set([
  'relationship_packet',
  'project_packet',
  'email_packet',
  'timeline_packet',
  'home_source_packet',
  'workflow_scoped_packet',
  'val_os_packet'
]);
let lastHearthPacketReceipt = null;
let activeMeetingPrepEvent = null;

function hearthPacketSourceFromContext(source = {}, node = null){
  const nodeSource = node?.dataset || {};
  const homeSourceItem = activeHomeWorkspace?.workspace?.sourceItem || {};
  return {
    ...source,
    action: source.action || nodeSource.workflowAction || nodeSource.homeAction || nodeSource.valAction || nodeSource.relationshipAction || nodeSource.projectAction || nodeSource.commitmentAction || nodeSource.correspondenceAction || '',
    sourceId: source.sourceId || nodeSource.sourceId || nodeSource.actionTarget || homeSourceItem.sourceId || homeSourceItem.source_id || homeSourceItem.id || '',
    sourceType: source.sourceType || nodeSource.sourceType || homeSourceItem.sourceType || homeSourceItem.source_type || homeSourceItem.kind || '',
    sourceLabel: source.sourceLabel || nodeSource.sourceLabel || homeSourceItem.title || homeSourceItem.name || '',
    relationshipId: source.relationshipId || nodeSource.relationshipOpenProfile || nodeSource.relationshipProfile || activeRelationshipProfile?.contactId || activeRelationshipProfile?.crmContactId || activeRelationshipProfile?.id || '',
    relationshipName: source.relationshipName || activeRelationshipProfile?.name || '',
    projectId: source.projectId || nodeSource.projectOpenProfile || activeProjectProfile?.projectId || activeProjectProfile?.id || '',
    projectName: source.projectName || activeProjectProfile?.name || '',
    email: source.email || activeCorrespondenceItem || homeSourceItem.email || null,
    commitmentId: source.commitmentId || nodeSource.commitmentItem || activeCommitmentItem?.id || '',
    documentId: source.documentId || nodeSource.documentItem || activeDocumentItem?.id || '',
    homeCard: source.homeCard || activeHomeWorkspace?.workspace || null,
    sourceItem: source.sourceItem || homeSourceItem || null
  };
}

function hearthPacketShouldSkip(action = '', packetName = ''){
  const command = String(action || '').split(':')[0];
  if(!canUseApi) return true;
  return ['cancel','calendar','relationshipAllPeople','projectAllProjects'].includes(command);
}

function localHearthMetadataPacket({packetName = '', action = '', node = null, source = {}} = {}){
  const resolvedSource = hearthPacketSourceFromContext(source, node);
  const sourceLabel = resolvedSource.sourceLabel || resolvedSource.sourceItem?.title || resolvedSource.sourceItem?.name || resolvedSource.sourceId || action || packetName || 'Client-side source';
  const sourceReceipts = sourceLabel ? [{
    label:sourceLabel,
    sourceType:resolvedSource.sourceType || resolvedSource.sourceItem?.sourceType || 'client_context',
    key:resolvedSource.sourceId || resolvedSource.sourceItem?.id || action || packetName || 'client_context'
  }] : [];
  const packet = {
    ok:true,
    status:hearthServerPacketNames.has(packetName) ? 'not_checked' : 'metadata_only',
    packetName,
    source:resolvedSource,
    click:{
      action,
      contract:node?.dataset?.valClickContract || '',
      promptRule:node?.dataset?.valPromptRule || '',
      allowedActions:node?.dataset?.valAllowedActions || '',
      neverDo:node?.dataset?.valNeverDo || ''
    },
    receipt:{
      id:'client_packet_' + Date.now().toString(36),
      sourceReceipts,
      downstreamConsumers:[],
      summary:'This click has a client-side packet contract. Server hydration is not wired for this packet yet.'
    }
  };
  lastHearthPacketReceipt = packet;
  renderHearthPacketReceiptStrip(packet);
  return packet;
}

function drawerIndexPacketReceipt({node = null, packetName = '', action = '', label = '', sourceType = 'drawer_index', downstreamConsumers = []} = {}){
  const sourceLabel = label || node?.innerText?.trim?.() || action || 'Drawer index';
  const packet = {
    ok:true,
    status:'index_context',
    packetName,
    source:hearthPacketSourceFromContext({
      sourceId:action || packetName || sourceType,
      sourceType,
      sourceLabel,
      sourceItem:{id:action || packetName || sourceType, title:sourceLabel, sourceType}
    }, node),
    click:{
      action,
      contract:node?.dataset?.valClickContract || '',
      promptRule:node?.dataset?.valPromptRule || '',
      allowedActions:node?.dataset?.valAllowedActions || '',
      neverDo:node?.dataset?.valNeverDo || ''
    },
    receipt:{
      id:'drawer_packet_' + Date.now().toString(36),
      sourceReceipts:[{
        label:sourceLabel,
        sourceType,
        key:action || packetName || sourceType
      }],
      downstreamConsumers,
      summary:'This drawer opened with an index-level packet. Select a specific row or action for source-specific packet hydration.'
    }
  };
  lastHearthPacketReceipt = packet;
  renderDrawerPacketReceiptStrip(packet);
  return packet;
}

function hearthPacketMissingLines(packet = {}){
  const missing = Array.isArray(packet.missingRequired) ? packet.missingRequired : [];
  const gaps = Array.isArray(packet.providerGaps) ? packet.providerGaps : [];
  const partials = Array.isArray(packet.providerPartials) ? packet.providerPartials : [];
  return [
    missing.length ? 'Missing context: ' + missing.slice(0, 6).join(', ') + (missing.length > 6 ? ' +' + (missing.length - 6) + ' more' : '') : '',
    gaps.length ? 'Provider gaps: ' + gaps.join(', ') : '',
    partials.length ? 'Partial providers: ' + partials.join(', ') : '',
    packet.counts?.variables ? 'Checked ' + packet.counts.variables + ' required variables.' : ''
  ].filter(Boolean);
}

function showHearthPacketBlocked(packet = {}, action = ''){
  lastHearthPacketReceipt = packet;
  setWorkspaceContent({
    lens: 'Packet Check',
    title: 'VAL needs the right context before this click.',
    meaning: packet.receipt?.summary || 'This click did not have enough source context attached.',
    understanding: hearthPacketMissingLines(packet).concat([
      'Click/action: ' + (action || packet.click?.action || 'unknown'),
      'Packet: ' + (packet.packetName || 'unknown')
    ]),
    recommendation: 'Open or select the exact source first, then retry the action. VAL should not blend unrelated context to make this work.',
    actions: [{label:'Back to desk', workflow:'cancel:meeting'}],
    label: 'Hearth packet blocked receipt'
  });
  openWorkspaceShell('Hearth packet blocked receipt', {returnTarget:workspaceReturnTarget || 'home'});
}

async function ensureHearthClickPacket({node = null, packetName = '', action = '', source = {}, allowBlockedForInspection = false} = {}){
  const resolvedPacketName = packetName || node?.dataset?.valVariablePacket || '';
  if(hearthPacketShouldSkip(action, resolvedPacketName)) return {ok:true,status:'not_checked'};
  if(!resolvedPacketName || !hearthServerPacketNames.has(resolvedPacketName)){
    const packet = localHearthMetadataPacket({packetName:resolvedPacketName, action, node, source});
    return {ok:true,packet,status:packet.status};
  }
  const payload = {
    packetName: resolvedPacketName,
    source: hearthPacketSourceFromContext(source, node),
    click: {
      action,
      contract: node?.dataset?.valClickContract || '',
      promptRule: node?.dataset?.valPromptRule || '',
      allowedActions: node?.dataset?.valAllowedActions || '',
      neverDo: node?.dataset?.valNeverDo || ''
    },
    mode: allowBlockedForInspection ? 'inspect' : 'preflight'
  };
  if(node) node.setAttribute('aria-busy', 'true');
  try{
    const packet = await postJson('/api/hearth/build-packet', payload);
    lastHearthPacketReceipt = packet;
    if(node){
      node.dataset.valPacketStatus = packet.status || '';
      node.dataset.valPacketCheckedAt = packet.generatedAt || new Date().toISOString();
      node.dataset.valPacketReceiptId = packet.receiptId || packet.receipt?.id || '';
    }
    renderHearthPacketReceiptStrip(packet);
    if(packet.status === 'blocked' && !allowBlockedForInspection){
      showHearthPacketBlocked(packet, action);
      return {ok:false,packet};
    }
    return {ok:true,packet};
  }catch(error){
    const packet = error.data || {packetName:resolvedPacketName,status:'blocked',receipt:{summary:error.message},missingRequired:[],providerGaps:['packet_builder_unavailable']};
    if(!allowBlockedForInspection) showHearthPacketBlocked(packet, action);
    return {ok:allowBlockedForInspection,packet,error};
  }finally{
    if(node) node.removeAttribute('aria-busy');
  }
}

function compactSentence(value, fallback = ''){
  return String(value || fallback || '').replace(/\s+/g, ' ').trim();
}

function firstBriefingItem(items){
  return Array.isArray(items) ? items.filter(Boolean)[0] || null : null;
}

function briefingItems(items){
  return Array.isArray(items) ? items.filter(Boolean) : [];
}

function itemTitle(item, fallback){
  if(isEmailSourceItem(item)){
    const email = homeEmailPayload(item);
    return compactSentence(email.subject, fallback || 'Email needing attention');
  }
  return compactSentence(item?.title || item?.name || item?.summary || fallback, fallback);
}

function itemMeaning(item, fallback){
  return compactSentence(item?.reason_it_matters || item?.why || item?.summary || item?.detail || item?.ifIgnored || fallback, fallback);
}

function itemMetadata(item){
  return item?.metadataJson || item?.metadata || item?.readinessJson || {};
}

function preparedArtifactKind(item){
  const metadata = itemMetadata(item);
  return compactSentence(
    item?.preparedArtifactKind ||
    item?.prepared_artifact_kind ||
    item?.preparedArtifact?.kind ||
    item?.prepared_artifact?.kind ||
    metadata.preparedArtifactKind ||
    metadata.prepared_artifact_kind ||
    metadata.preparedArtifact?.kind ||
    metadata.prepared_artifact?.kind
  ).toLowerCase();
}

function preparedArtifactHomeCopy(item){
  const kind = preparedArtifactKind(item);
  const subject = primaryPortalPhrase(item) || itemTitle(item, 'Prepared work');
  if(kind === 'linkedin_post_draft' || kind === 'social_post_draft') return {
    observation: 'Social post draft prepared',
    implication: subject + ' is ready to copy manually into LinkedIn.',
    invitation: 'Would you like to review the post?',
    action: 'Review social post',
    workspaceTitle: subject,
    workspaceMeaning: 'VAL prepared the LinkedIn post draft and held publishing as a manual user action.',
    recommendation: 'Review the voice, copy the post, and open LinkedIn manually. VAL should never auto-publish LinkedIn content.'
  };
  if(kind === 'linkedin_comment_draft' || kind === 'social_comment_draft') return {
    observation: 'LinkedIn comment prepared',
    implication: subject + ' is ready to copy manually onto LinkedIn.',
    invitation: 'Would you like to review the comment?',
    action: 'Review LinkedIn comment',
    workspaceTitle: subject,
    workspaceMeaning: 'VAL prepared a support comment from relationship context and kept posting manual.',
    recommendation: 'Copy only if it still feels true. No LinkedIn automation or auto-posting should happen.'
  };
  if(kind === 'proposal_draft') return {
    observation: 'Proposal draft prepared',
    implication: subject + ' is ready to review before anything moves into GHL.',
    invitation: 'Would you like to review the proposal?',
    action: 'Review proposal draft',
    workspaceTitle: subject,
    workspaceMeaning: 'VAL prepared the proposal shape from the transcript and kept it waiting for approval.',
    recommendation: 'Review the decision points first. Nothing should be sent or moved in GHL until it still feels true.'
  };
  if(kind === 'agreement_draft') return {
    observation: 'Agreement draft prepared',
    implication: subject + ' is ready to review before terms leave VAL.',
    invitation: 'Would you like to review the agreement?',
    action: 'Review agreement draft',
    workspaceTitle: subject,
    workspaceMeaning: 'VAL prepared the agreement shape from transcript evidence and held legal or external consequence behind review.',
    recommendation: 'Confirm parties, scope, terms, and authority before anything is sent or signed.'
  };
  if(kind === 'document_draft' || kind === 'copy_draft' || kind === 'invoice_draft') return {
    observation: kind === 'invoice_draft' ? 'Invoice packet prepared' : 'Draft prepared',
    implication: subject + ' is shaped and waiting for review.',
    invitation: 'Would you like to review the draft?',
    action: 'Review draft',
    workspaceTitle: subject,
    workspaceMeaning: 'VAL prepared the work product from the transcript and kept external use gated.',
    recommendation: 'Review what VAL completed, then supply any missing facts, claims, pricing, or destination context.'
  };
  if(kind === 'html_page_draft') return {
    observation: 'Page draft prepared',
    implication: subject + ' is ready to inspect before anything is published.',
    invitation: 'Would you like to review the page?',
    action: 'Review page draft',
    workspaceTitle: subject,
    workspaceMeaning: 'VAL prepared the page draft from the conversation and held it for human review.',
    recommendation: 'Check the message, structure, and destination before publishing anything.'
  };
  if(kind === 'calendar_invite_draft') return {
    observation: 'Calendar invitation prepared',
    implication: subject + ' is drafted, but nothing has been scheduled yet.',
    invitation: 'Would you like to review the invite?',
    action: 'Review calendar invite',
    workspaceTitle: subject,
    workspaceMeaning: 'VAL prepared the calendar invitation and kept the calendar unchanged.',
    recommendation: 'Confirm the people, timing, and purpose before allowing any calendar write.'
  };
  if(kind === 'introduction_email_draft') return {
    observation: 'Introduction draft prepared',
    implication: 'The relationship IDs are attached, and nothing has been sent.',
    invitation: 'Would you like to review the introduction?',
    action: 'Review introduction',
    workspaceTitle: subject,
    workspaceMeaning: 'VAL found a useful relationship connection and drafted the introduction for review.',
    recommendation: 'Review why both people belong in the same conversation before sending anything.'
  };
  if(kind === 'email_draft') return {
    observation: 'Email draft prepared',
    implication: subject + ' is ready to review before anything is sent.',
    invitation: 'Would you like to review the email?',
    action: 'Review email draft',
    workspaceTitle: subject,
    workspaceMeaning: 'VAL prepared the email from the transcript and held it for approval.',
    recommendation: 'Read for accuracy and relationship tone before releasing it.'
  };
  return null;
}

function updateLinkedInWidget(){
  if(linkedinReadyCount) linkedinReadyCount.textContent = String(linkedinVisibilityItems.length);
}

function renderLinkedInEngagementList(){
  scraperPreviewList.hidden = false;
  scraperPreviewList.classList.add('linkedin-preview-list');
  scraperPreviewList.innerHTML = [
    '<div class="linkedin-engagement-list" aria-label="Posts to comment on">',
      linkedinVisibilityItems.map((item, index) => (
        '<article class="linkedin-engagement-item">' +
          '<div class="linkedin-engagement-head">' +
            '<span class="linkedin-logo small" aria-hidden="true">in</span>' +
            '<div><strong>' + escapeHtml(item.contact) + '</strong><small>' + escapeHtml(item.whyItMatters) + '</small></div>' +
          '</div>' +
          '<p>' + escapeHtml(item.postPreview) + '</p>' +
          '<blockquote>' + escapeHtml(item.draftComment) + '</blockquote>' +
          '<div class="linkedin-engagement-actions">' +
            '<button type="button" data-linkedin-copy="' + index + '">Copy comment</button>' +
            '<a href="' + escapeHtml(item.postUrl) + '" target="_blank" rel="noopener" data-linkedin-link="' + index + '">Open LinkedIn</a>' +
          '</div>' +
        '</article>'
      )).join(''),
    '</div>'
  ].join('');
}

function openLinkedInEngagementWorkspace(){
  closeCalendarPanel();
  setWorkspaceContent({
    lens: 'LinkedIn Visibility',
    title: linkedinVisibilityItems.length + ' LinkedIn posts are ready for support.',
    meaning: 'VAL prepared comments and visibility opportunities, but LinkedIn publishing remains manual to protect the account and the relationship.',
    understanding: [
      'Posts to comment on: ' + linkedinVisibilityItems.length,
      'Each item includes the contact, post preview, why it matters, draft comment, copy button, and direct LinkedIn link.',
      'VAL never auto-publishes LinkedIn posts, comments, or DMs.'
    ],
    recommendation: 'Copy only the comments that feel true, then open LinkedIn and paste manually.',
    actions: [
      {label: 'Co-Work with VAL', workflow: 'cowork:think'},
      {label: 'Teach LinkedIn style', workflow: 'valOnboarding:linkedin_strategy'},
      {label: 'Back to Home', workflow: 'cancel:meeting'}
    ],
    label: 'LinkedIn visibility workspace'
  });
  renderLinkedInEngagementList();
  hearth.dataset.distance = 'judgment';
  deskWorkspace.setAttribute('aria-hidden', 'false');
  document.querySelectorAll('.living-room').forEach((room) => {
    room.classList.remove('active-room');
  });
}

function primaryPortalPhrase(item){
  const target = item?.target || {};
  const metadata = item?.metadata || item?.metadataJson || {};
  const candidates = [
    ...(Array.isArray(item?.portalPhrases) ? item.portalPhrases : []),
    item?.opportunityName,
    metadata.opportunityName,
    item?.projectName,
    metadata.projectName,
    item?.contactName,
    item?.matchedContactName,
    metadata.contactName,
    target.name,
    target.label,
    item?.name
  ];
  return candidates
    .map((candidate) => compactSentence(candidate))
    .find((candidate) => candidate && !/^(source|context|evidence|item)$/i.test(candidate)) || '';
}

function sourceActionLabel(item, fallback = 'Open source view'){
  const target = item?.target || {};
  const kind = preparedArtifactKind(item);
  if(isEmailSourceItem(item)) return 'Open email';
  if(kind === 'proposal_draft') return 'Review proposal draft';
  if(kind === 'html_page_draft') return 'Review page draft';
  if(kind === 'calendar_invite_draft') return 'Review calendar invite';
  if(kind === 'introduction_email_draft') return 'Review introduction';
  if(kind === 'email_draft') return 'Review email draft';
  const raw = String(target.type || item?.targetType || item?.source_type || item?.sourceType || item?.review_type || item?.reviewType || item?.draftType || '').toLowerCase();
  if(/opportunity|pipeline|deal/.test(raw) || item?.opportunityId || item?.metadata?.opportunityId || item?.metadataJson?.opportunityId) return 'Open GHL opportunity';
  if(/draft|prepared|reply|proposal|follow/.test(raw) || item?.draftId) return /proposal/i.test(item?.title || item?.summary || '') ? 'Open proposal draft' : 'Open prepared draft';
  if(/contact|person|relationship|people/.test(raw) || item?.contactId || item?.personId) return 'Open relationship file';
  if(/project/.test(raw) || item?.projectId) return 'Open project dossier';
  if(/calendar|meeting|appointment/.test(raw)) return 'Open meeting prep';
  if(/partner/.test(raw)) return 'Open partner scraper';
  if(/lead|scraper|organization|non-profit|nonprofit|employer/.test(raw)) return 'Open lead scraper';
  if(/transcript|evidence|conversation|email/.test(raw)) return 'Open evidence trail';
  return fallback;
}

function targetProfile(item){
  const target = item?.target || {};
  const kind = preparedArtifactKind(item);
  const raw = String(kind || target.type || item?.targetType || item?.source_type || item?.sourceType || item?.review_type || item?.reviewType || item?.draftType || '').toLowerCase();
  if(isEmailSourceItem(item)) return {
    key: 'email',
    noun: 'email thread',
    whyOpen: 'The email subject and source context explain why this is appearing on Home.',
    reviewPosture: 'Open the email if needed, then either draft a reply or create a follow-up task with a due date.'
  };
  if(/opportunity|pipeline|deal/.test(raw) || item?.opportunityId || item?.metadata?.opportunityId || item?.metadataJson?.opportunityId) return {
    key: 'opportunity',
    noun: 'GHL opportunity',
    whyOpen: 'This points to the pipeline record where the next decision lives.',
    reviewPosture: 'Review the opportunity stage, latest notes, and next commitment before creating more work.'
  };
  if(/draft|prepared|reply|proposal|follow/.test(raw) || item?.draftId) return {
    key: 'draft',
    noun: /proposal/i.test(item?.title || item?.summary || '') ? 'proposal draft' : 'prepared draft',
    whyOpen: 'The prepared language is ready for human judgment before anything is sent.',
    reviewPosture: 'Read the decision point first, then edit or approve only if the draft still feels true.'
  };
  if(/contact|person|relationship|people/.test(raw) || item?.contactId || item?.personId) return {
    key: 'relationship',
    noun: 'relationship file',
    whyOpen: 'The relationship context explains why this person is appearing on Home.',
    reviewPosture: 'Look at the open loop, recent history, and trust risk before choosing a move.'
  };
  if(/project/.test(raw) || item?.projectId) return {
    key: 'project',
    noun: 'project dossier',
    whyOpen: 'The project record holds the current reality, open questions, and prepared next move.',
    reviewPosture: 'Review the current reality and decide what should move, pause, or be protected.'
  };
  if(/calendar|meeting|appointment/.test(raw)) return {
    key: 'meeting',
    noun: 'meeting prep',
    whyOpen: 'The calendar context can become a brief before the conversation begins.',
    reviewPosture: 'Scan the people, purpose, and recommended opening before the meeting.'
  };
  if(/transcript|evidence|conversation|email/.test(raw)) return {
    key: 'evidence',
    noun: 'evidence trail',
    whyOpen: 'The source evidence shows why VAL chose this story instead of a louder one.',
    reviewPosture: 'Read the evidence trail only as far as needed to trust the recommendation.'
  };
  return {
    key: 'source',
    noun: 'source context',
    whyOpen: 'The source context is available if you want to inspect the judgment.',
    reviewPosture: 'Open it only if the meaning is not already clear enough to decide.'
  };
}

function isEmailSourceItem(item = {}){
  const target = item?.target || {};
  const metadata = item?.metadata || item?.metadataJson || {};
  const haystack = [
    item?.provider,
    item?.source,
    item?.sourceType,
    item?.source_type,
    item?.reviewType,
    item?.review_type,
    item?.type,
    item?.itemType,
    item?.cardType,
    target.type,
    metadata.provider,
    metadata.source,
    metadata.sourceType,
    metadata.source_type,
    metadata.reviewType,
    metadata.review_type,
    item?.title,
    item?.summary,
    item?.reason_it_matters,
    item?.reason,
    item?.recommendedAction
  ].filter(Boolean).join(' ').toLowerCase();
  return !!(item?.messageId || item?.threadId || metadata.messageId || metadata.threadId || /\b(gmail|email|inbox|message|thread|reply|fwd:|fw:)\b/.test(haystack));
}

function homeEmailPayload(item = {}){
  const metadata = item.metadata || item.metadataJson || {};
  const target = item.target || {};
  const from = item.from || metadata.from || target.from || {};
  return {
    provider: item.provider || metadata.provider || 'gmail',
    messageId: item.messageId || metadata.messageId || target.messageId || item.id || '',
    threadId: item.threadId || metadata.threadId || target.threadId || '',
    subject: item.subject || metadata.subject || item.title || target.label || '',
    snippet: item.snippet || item.bodyPreview || item.summary || item.reason_it_matters || item.reason || '',
    bodyPreview: item.bodyPreview || item.snippet || item.summary || '',
    reason: item.reason || item.reason_it_matters || item.summary || '',
    recommendedAction: item.recommendedAction || metadata.recommendedAction || '',
    from: {
      name: from.name || item.contactName || metadata.contactName || target.name || '',
      email: from.email || item.contactEmail || metadata.contactEmail || target.email || ''
    },
    webLink: item.webLink || metadata.webLink || target.url || ''
  };
}

function homeEmailActions(item, sourceLabel = 'Open email'){
  if(!isEmailSourceItem(item)) return null;
  return [
    {label: sourceLabel, homeAction: 'open_source'},
    {label: 'Draft reply', homeAction: 'draft_email_reply'},
    {label: 'Create task', homeAction: 'create_email_task'},
    {label: 'Open Executive Inbox', homeAction: 'open_executive_inbox'}
  ];
}

function sourceIdentityForItem(item = {}){
  const metadata = item.metadata || item.metadataJson || {};
  const target = item.target || {};
  const artifact = item.preparedArtifact || item.prepared_artifact || metadata.preparedArtifact || metadata.prepared_artifact || {};
  if(isEmailSourceItem(item)){
    const email = homeEmailPayload(item);
    const id = email.messageId || email.threadId || metadata.sourceId || metadata.source_id || item.sourceId || item.source_id || item.id || '';
    return {type:'email', id:String(id || ''), label:itemTitle(item, 'Email needing attention')};
  }
  const type = normalizedTargetType(target.type || item.targetType || item.source_type || item.sourceType || item.review_type || item.reviewType || item.type || preparedArtifactKind(item), item);
  const id = target.id || item.targetId || item.messageId || metadata.messageId || item.threadId || metadata.threadId || item.draftId || artifact.id || artifact.artifactId || item.contactId || item.personId || item.projectId || metadata.projectId || item.opportunityId || metadata.opportunityId || item.source_id || item.sourceId || item.id || '';
  const label = itemTitle(item, target.label || target.name || item.title || item.name || id || 'Source context');
  return {type, id:String(id || ''), label};
}

function sourceOfSourceLines(item = {}){
  const metadata = item.metadata || item.metadataJson || {};
  const rawRefs = item.sourceRefsJson || item.source_refs || item.sourceRefs || metadata.sourceRefs || metadata.source_refs || item.evidence || [];
  const refs = Array.isArray(rawRefs) ? rawRefs : [];
  const lines = refs.map((ref, index) => {
    if(typeof ref === 'string') return 'Source-of-source ' + (index + 1) + ': ' + ref;
    const type = ref.source_type || ref.sourceType || ref.type || ref.label || 'evidence';
    const id = ref.source_id || ref.sourceId || ref.id || '';
    const quote = ref.quote_or_summary || ref.quoteOrSummary || ref.summary || ref.detail || ref.content || '';
    return ['Source-of-source ' + (index + 1) + ': ' + type + (id ? ' ' + id : ''), quote].filter(Boolean).join(' - ');
  }).filter(Boolean);
  if(lines.length) return lines.slice(0,4);
  if(item.messageId || metadata.messageId) return ['Source-of-source: Gmail message ' + (item.messageId || metadata.messageId) + (item.threadId || metadata.threadId ? ' in thread ' + (item.threadId || metadata.threadId) : '') + '.'];
  if(item.target?.type || item.sourceType || item.source_type) return ['Source-of-source: ' + sourceDestinationLabel(item) + ' context.'];
  return ['Source-of-source: no deeper source receipt is attached yet.'];
}

function suggestedRecommendationForHomeItem(item = {}, roomName = ''){
  if(isEmailSourceItem(item)) return 'Reply if the relationship needs it, or create a dated follow-up task if the next move is yours.';
  const kind = preparedArtifactKind(item);
  if(kind) return preparedArtifactHomeCopy(item)?.recommendation || 'Review the prepared work, then refine or approve only if the source context still supports it.';
  const profile = targetProfile(item);
  if(profile.key === 'relationship') return 'Open the relationship file and choose the next relationship-safe move from the current open loop.';
  if(profile.key === 'project') return 'Open the project dossier and decide what should move, pause, or be protected.';
  if(profile.key === 'meeting') return 'Open the meeting prep and use the people, purpose, and opening move only for this meeting.';
  if(roomName === 'velocity') return 'Inspect the source/evidence, then decide whether this movement deserves an action today.';
  return workspaceRecommendation(item, 'Open the source context before taking action.');
}

function suggestedHomeActionsForItem(item = {}, roomName = '', sourceLabel = 'Open source context'){
  const emailActions = homeEmailActions(item, sourceLabel);
  if(emailActions) return emailActions;
  const kind = preparedArtifactKind(item);
  const identityType = String(sourceIdentityForItem(item).type || '').toLowerCase();
  if(kind || identityType === 'draft'){
    return [
      {label: sourceLabel, homeAction: 'open_source'},
      {label: 'Refine prepared work', homeAction: 'edit_before_approving'},
      {label: 'Approve prepared work', homeAction: 'approve'}
    ];
  }
  const profile = targetProfile(item);
  if(profile.key === 'relationship' || profile.key === 'project' || profile.key === 'meeting' || profile.key === 'opportunity'){
    return [
      {label: sourceLabel, homeAction: 'open_source'},
      {label: 'Review evidence', homeAction: 'review_evidence'}
    ];
  }
  return [
    {label: sourceLabel, homeAction: 'open_source'},
    {label: roomName === 'leverage' ? 'Review prepared context' : 'Review evidence', homeAction: 'review_evidence'}
  ];
}

function workspaceUnderstanding(item, baseLines = []){
  const profile = targetProfile(item || {});
  return [
    profile.whyOpen,
    ...baseLines,
    item?.evidence_count ? item.evidence_count + ' evidence signal(s) are attached.' : '',
    item?.confidence != null ? 'Confidence: ' + Math.round(Number(item.confidence) * 100) + '%' : ''
  ].filter(Boolean);
}

function workspaceRecommendation(item, fallback){
  const profile = targetProfile(item || {});
  return profile.reviewPosture || fallback;
}

function roomCardObservation(item, fallback, lens){
  if(!item) return compactSentence(fallback);
  const subject = primaryPortalPhrase(item);
  const titleText = itemTitle(item, fallback);
  if(!subject || titleText.toLowerCase().includes(subject.toLowerCase())) return titleText;
  const profile = targetProfile(item);
  if(lens === 'velocity'){
    if(profile.key === 'opportunity') return subject + ' can move now.';
    if(profile.key === 'draft') return subject + ' is ready to review.';
    if(profile.key === 'relationship') return subject + ' answered something that matters.';
    if(profile.key === 'project') return subject + ' changed shape.';
    if(profile.key === 'meeting') return subject + ' changed the day.';
  }
  if(lens === 'alignment'){
    if(profile.key === 'opportunity') return subject + ' deserves your first decision.';
    if(profile.key === 'draft') return subject + ' deserves your judgment first.';
    if(profile.key === 'relationship') return subject + ' deserves your attention first.';
    if(profile.key === 'project') return subject + ' is the decision point.';
    if(profile.key === 'meeting') return subject + ' is where attention belongs.';
  }
  if(lens === 'leverage'){
    if(profile.key === 'opportunity') return subject + ' is prepared for review.';
    if(profile.key === 'draft') return subject + ' is already shaped.';
    if(profile.key === 'relationship') return subject + ' has context waiting.';
    if(profile.key === 'project') return subject + ' has prepared work waiting.';
    if(profile.key === 'meeting') return subject + ' has a brief ready.';
  }
  return titleText;
}

function roomCardImplication(item, fallback, lens){
  if(!item) return compactSentence(fallback);
  const meaningText = itemMeaning(item, fallback);
  const subject = primaryPortalPhrase(item);
  const profile = targetProfile(item);
  if(subject && /something changed|prepared something|judgment appears/i.test(meaningText)){
    if(profile.key === 'opportunity') return 'The next step belongs in the pipeline, not in your head.';
    if(profile.key === 'draft') return 'The work is ready for review before anything is sent.';
    if(profile.key === 'relationship') return 'The relationship context is already gathered.';
    if(profile.key === 'project') return 'The current reality is ready to review.';
    if(profile.key === 'meeting') return 'The meeting context is ready before you enter it.';
  }
  if(lens === 'alignment' && subject && profile.key !== 'source' && meaningText.length > 120){
    return 'Only this needs your judgment first.';
  }
  return meaningText;
}

function hydrateGreetingFromBriefing(briefing){
  const greeting = briefing.dailyWitness;
  if(!greeting || !Array.isArray(greeting.greeting_lines) || !greeting.greeting_lines.length) return;
  const existingName = (currentState.title.match(/,\s*([A-Za-z]+)\./) || [,'Jessa'])[1];
  const lines = greeting.greeting_lines.map((line) => (
    compactSentence(line).replace(/\b(Good morning|Good afternoon|Good evening),\s*VAL\./i, '$1, ' + existingName + '.')
  )).filter(Boolean);
  if(lines[0]) title.textContent = lines[0];
  witness.textContent = lines[1] || greeting.what_was_witnessed || currentState.witness;
  orientation.textContent = lines[2] || greeting.what_it_cost_or_represented || currentState.orientation;
  permission.textContent = greeting.permission_line || currentState.permission;
}

function briefingWorkspace({lens,title,meaning,understanding,recommendation,actions = [{label: 'Open source view', homeAction: 'open_source'}, {label: 'Teach VAL', workflow: 'teach'}],confidence,restraintReason,sourceItem,cardType,suppressInlinePortals = true}){
  return {
    lens,
    title,
    meaning,
    understanding: understanding.filter(Boolean).map(compactSentence),
    recommendation,
    actions,
    confidence,
    restraintReason,
    sourceItem,
    cardType,
    suppressInlinePortals
  };
}

function updateRoomFromBriefing(roomName, content){
  if(!currentState.rooms || !currentState.rooms[roomName]) return;
  currentState.rooms[roomName] = roomContent(content.card, content.workspace);
}

function homeQueueItem(item, index, roomName){
  const artifactCopy = roomName === 'leverage' ? preparedArtifactHomeCopy(item) : null;
  const identity = sourceIdentityForItem(item);
  return {
    sourceItem: item,
    priority: index + 1,
    title: artifactCopy?.workspaceTitle || itemTitle(item, roomName === 'leverage' ? 'Prepared work' : 'Meaningful movement'),
    summary: artifactCopy?.implication || itemMeaning(item, item?.summary || ''),
    kind: artifactCopy?.observation || preparedArtifactKind(item).replace(/_/g, ' ') || item?.target?.type || item?.type || '',
    sourceType: identity.type,
    sourceId: identity.id,
    sourceLabel: identity.label
  };
}

function isConcreteHomeActionItem(item = {}){
  const identity = sourceIdentityForItem(item);
  const type = String(identity.type || item.target?.type || item.type || '').toLowerCase();
  return !!(
    isEmailSourceItem(item) ||
    preparedArtifactKind(item) ||
    item.draftId ||
    item.messageId ||
    item.threadId ||
    item.contactId ||
    item.personId ||
    item.projectId ||
    item.opportunityId ||
    /^(email|draft|person|project|meeting|opportunity|evidence)$/.test(type)
  );
}

function setHomeRoomQueue(roomName, items){
  const allItems = briefingItems(items);
  const scopedItems = roomName === 'leverage' ? allItems.filter(isConcreteHomeActionItem) : allItems;
  homeRoomQueues[roomName] = (scopedItems.length ? scopedItems : allItems).map((item, index) => homeQueueItem(item, index, roomName));
}

function hydrateRoomsFromBriefing(briefing){
  const velocityItems = briefingItems(briefing.whatChanged).concat(briefingItems(briefing.momentum));
  const changed = firstBriefingItem(velocityItems);
  const highest = briefing.highestLeverageMove || firstBriefingItem(briefing.alsoImportant) || null;
  const leverageItems = briefingItems(briefing.readyForYou).concat(briefingItems(briefing.watching));
  const ready = leverageItems.find(isConcreteHomeActionItem) || firstBriefingItem(leverageItems) || highest || null;
  const theme = briefing.todayTheme || {};
  setHomeRoomQueue('velocity', velocityItems);
  setHomeRoomQueue('leverage', leverageItems);

  if(changed){
    const titleText = itemTitle(changed, 'Meaningful movement');
    const meaningText = itemMeaning(changed, 'Something changed that may affect the next step.');
    const cardTitle = roomCardObservation(changed, titleText, 'velocity');
    const cardSummary = roomCardImplication(changed, meaningText, 'velocity');
    const sourceLabel = sourceActionLabel(changed);
    updateRoomFromBriefing('velocity', {
      card: {
        observation: cardTitle,
        implication: cardSummary,
        invitation: 'Would you like to understand what changed?',
        title: cardTitle,
        summary: cardSummary,
        action: 'See why it matters'
      },
      workspace: briefingWorkspace({
        lens: 'Velocity',
        title: titleText,
        meaning: meaningText,
        understanding: workspaceUnderstanding(changed, [changed.reason_it_matters || changed.summary]),
        recommendation: workspaceRecommendation(changed, 'I would review the meaning first, then decide whether it deserves action today.'),
        actions: suggestedHomeActionsForItem(changed, 'velocity', sourceLabel),
        confidence: changed.confidence,
        restraintReason: 'Velocity owns what changed so the other rooms can avoid repeating the same story.',
        sourceItem: changed,
        cardType: 'what_changed'
      })
    });
  }

  if(highest || theme.title){
    const titleText = itemTitle(highest, theme.title || 'Protected attention');
    const meaningText = itemMeaning(highest, theme.why || 'This is where your judgment appears most valuable.');
    const cardTitle = roomCardObservation(highest, titleText, 'alignment');
    const cardSummary = roomCardImplication(highest, meaningText, 'alignment');
    const sourceLabel = sourceActionLabel(highest, 'Open the thing needing attention');
    const actions = suggestedHomeActionsForItem(highest || theme, 'alignment', sourceLabel);
    updateRoomFromBriefing('alignment', {
      card: {
        observation: cardTitle,
        implication: cardSummary,
        invitation: 'Does this still feel true?',
        title: cardTitle,
        summary: cardSummary,
        action: 'Review the decision'
      },
      workspace: briefingWorkspace({
        lens: 'Alignment',
        title: titleText,
        meaning: meaningText,
        understanding: workspaceUnderstanding(highest, [
          highest?.ifIgnored ? 'If ignored: ' + highest.ifIgnored : theme.why,
        ]),
        recommendation: workspaceRecommendation(highest, 'Does this still feel true to you? If not, teach VAL what it missed.'),
        actions,
        confidence: highest?.confidence,
        restraintReason: 'Alignment owns the judgment question, not every supporting detail.',
        sourceItem: highest || theme,
        cardType: 'highest_leverage'
      })
    });
  }

  if(ready){
    const artifactCopy = preparedArtifactHomeCopy(ready);
    const titleText = artifactCopy?.workspaceTitle || itemTitle(ready, 'Prepared work is ready');
    const meaningText = artifactCopy?.workspaceMeaning || itemMeaning(ready, 'VAL has prepared something for review.');
    const cardTitle = artifactCopy?.observation || roomCardObservation(ready, titleText, 'leverage');
    const cardSummary = artifactCopy?.implication || roomCardImplication(ready, meaningText, 'leverage');
    const sourceLabel = sourceActionLabel(ready, 'Open prepared work');
    updateRoomFromBriefing('leverage', {
      card: {
        observation: cardTitle,
        implication: cardSummary,
        invitation: artifactCopy?.invitation || 'Would you like to review what is ready?',
        title: cardTitle,
        summary: cardSummary,
        action: artifactCopy?.action || "Review what's ready"
      },
      workspace: briefingWorkspace({
        lens: 'Leverage',
        title: titleText,
        meaning: meaningText,
        understanding: workspaceUnderstanding(ready, [
          ...homeSourceContextLines(ready, titleText),
          ready.reason_it_matters || ready.summary,
          preparedArtifactKind(ready) ? 'Prepared artifact: ' + preparedArtifactKind(ready).replace(/_/g, ' ') : '',
          ready.target?.type ? 'Source type: ' + ready.target.type : ''
        ]),
        recommendation: artifactCopy?.recommendation || workspaceRecommendation(ready, 'I would review only the prepared decision point before opening supporting material.'),
        actions: suggestedHomeActionsForItem(ready, 'leverage', sourceLabel),
        confidence: ready.confidence,
        restraintReason: 'Leverage surfaces prepared capability without turning Home into a work queue.',
        sourceItem: ready,
        cardType: 'ready_for_you'
      })
    });
  }
  setRoomCopy(currentState);
}

function normalizeReadyForYouItem(item = {}){
  item = item || {};
  const metadata = item.metadataJson || item.metadata || {};
  const readiness = item.readinessJson || {};
  const artifact = metadata.preparedArtifact || item.preparedArtifact || item.prepared_artifact || {};
  return {
    ...item,
    cardType: 'ready_for_you',
    title: item.title || 'Prepared work is ready',
    summary: item.summary || item.whyNow || item.whyUserIsSeeingThis || 'VAL prepared work for review.',
    reason_it_matters: item.whyNow || item.whyUserIsSeeingThis || item.summary || '',
    preparedArtifactKind: metadata.preparedArtifactKind || readiness.prepared_artifact_kind || artifact.kind || '',
    preparedArtifact: artifact,
    metadata,
    confidence: item.confidence,
    target: item.target || (metadata.projectId || metadata.projectName ? {type:'project', id:metadata.projectId || metadata.projectName, label:metadata.projectName || metadata.projectId} : {type:'prepared_work', id:item.id || ''}),
    portalPhrases: [metadata.projectName, metadata.contactName, item.title].filter(Boolean)
  };
}

function updatePreparedCount(count){
  if(!leveragePreparedCount) return;
  const safeCount = Math.max(0, Number(count) || 0);
  leveragePreparedCount.dataset.count = String(safeCount);
  leveragePreparedCount.textContent = safeCount + ' prepared';
}

function hydrateLeverageFromReadyForYou(result = {}){
  const items = Array.isArray(result.items) ? result.items : [];
  const allBuilt = Array.isArray(result.allBuilt) ? result.allBuilt : [];
  const queueItems = (items.length ? items : allBuilt).map(normalizeReadyForYouItem).filter((item) => item?.id);
  setHomeRoomQueue('leverage', queueItems);
  const preparedCount = Number(result.preparedCount != null ? result.preparedCount : (allBuilt.length || items.length));
  updatePreparedCount(preparedCount);
  const ready = queueItems.find(isConcreteHomeActionItem) || queueItems[0] || normalizeReadyForYouItem(items[0] || allBuilt[0] || null);
  if(!ready || !ready.id) return;
  const artifactCopy = preparedArtifactHomeCopy(ready);
  const titleText = artifactCopy?.workspaceTitle || itemTitle(ready, 'Prepared work is ready');
  const meaningText = artifactCopy?.workspaceMeaning || itemMeaning(ready, 'VAL has prepared something for review.');
  const cardTitle = artifactCopy?.observation || roomCardObservation(ready, titleText, 'leverage');
  const cardSummary = artifactCopy?.implication || roomCardImplication(ready, meaningText, 'leverage');
  const sourceLabel = sourceActionLabel(ready, 'Open prepared work');
  updateRoomFromBriefing('leverage', {
    card: {
      observation: cardTitle,
      implication: cardSummary,
      invitation: artifactCopy?.invitation || 'Would you like to review what is ready?',
      title: cardTitle,
      summary: cardSummary,
      action: artifactCopy?.action || "Review what's ready"
    },
    workspace: briefingWorkspace({
      lens: 'Leverage',
      title: titleText,
      meaning: meaningText,
      understanding: workspaceUnderstanding(ready, [
        ...homeSourceContextLines(ready, titleText),
        ready.summary,
        ready.metadata?.completionStatus ? 'Completion status: ' + String(ready.metadata.completionStatus).replace(/_/g, ' ') : '',
        Array.isArray(ready.metadata?.remainingContextNeeded) && ready.metadata.remainingContextNeeded.length ? 'Needs context: ' + ready.metadata.remainingContextNeeded.join('; ') : '',
        preparedCount ? preparedCount + ' prepared item' + (preparedCount === 1 ? '' : 's') + ' waiting.' : ''
      ]),
      recommendation: artifactCopy?.recommendation || workspaceRecommendation(ready, 'Review what VAL finished, then provide only the missing context needed to complete the job.'),
      actions: suggestedHomeActionsForItem(ready, 'leverage', sourceLabel),
      confidence: ready.confidence,
      restraintReason: 'Leverage counts prepared work without turning Home into a generic task queue.',
      sourceItem: ready,
      cardType: 'ready_for_you'
    })
  });
  setRoomCopy(currentState);
}

async function hydratePreparedWorkQueue(){
  if(!canUseApi) return;
  try{
    const result = await postJson('/api/val/ready-for-you/build', {limit:5});
    hydrateLeverageFromReadyForYou(result);
  }catch(error){
    try{
      const fallback = await getJson('/api/val/ready-for-you?limit=5');
      hydrateLeverageFromReadyForYou(fallback);
    }catch(inner){
      console.warn('Prepared work queue unavailable:', inner.message || error.message);
    }
  }
}

function prototypeBriefing(){
  return {
    dailyWitness: {
      greeting_lines: [
        'Good morning, Jessa.',
        'Yesterday carried more decisions than meetings.',
        'Today has room to think.'
      ],
      permission_line: 'Protect that space.'
    },
    whatChanged: [{
      title: 'Greg answered the question that was holding the proposal.',
      summary: 'The Acme proposal can move now, but it does not need to take over the morning.',
      reason_it_matters: 'The next step belongs in the pipeline, not in your head.',
      confidence: 0.91,
      target: {type: 'opportunity', id: 'demo-acme-opportunity', name: 'Acme proposal'},
      opportunityId: 'demo-acme-opportunity',
      opportunityName: 'Acme proposal',
      portalPhrases: ['Greg', 'Acme proposal']
    }, {
      title: 'Michele sent chapter notes.',
      summary: 'The feedback is useful, but it belongs after the proposal decision.',
      reason_it_matters: 'This can become prepared feedback instead of a second open loop.',
      confidence: 0.78,
      target: {type: 'relationship', id: 'michele', name: 'Michele chapter feedback'},
      portalPhrases: ['Michele', 'chapter notes']
    }, {
      title: 'Allen shared assessment notes.',
      summary: 'The notes can inform the project brief once the current decision is clear.',
      reason_it_matters: 'VAL can hold the detail without letting it interrupt the morning.',
      confidence: 0.73,
      target: {type: 'document', id: 'allen-assessment-notes', name: 'Allen assessment notes'},
      portalPhrases: ['Allen', 'assessment notes']
    }],
    highestLeverageMove: {
      title: 'Finish the Acme proposal before taking new meetings.',
      summary: 'Only this needs your judgment first; everything else can stay quiet until after lunch.',
      ifIgnored: 'The afternoon will become reactive otherwise.',
      confidence: 0.88,
      target: {type: 'opportunity', id: 'demo-acme-opportunity', name: 'Acme proposal'},
      opportunityId: 'demo-acme-opportunity',
      opportunityName: 'Acme proposal',
      portalPhrases: ['Acme proposal']
    },
    readyForYou: [{
      title: 'Frisson introduction draft',
      summary: 'The relationship IDs are attached, and nothing has been sent.',
      reason_it_matters: 'Three hours of context have become six minutes of judgment.',
      confidence: 0.86,
      target: {type: 'draft', id: 'demo-frisson-introduction', name: 'Frisson introduction'},
      draftId: 'demo-frisson-introduction',
      metadataJson: {
        preparedArtifactKind: 'introduction_email_draft',
        preparedArtifact: {kind: 'introduction_email_draft', id: 'demo-frisson-introduction'}
      },
      portalPhrases: ['Frisson introduction']
    }, {
      title: 'D3Day page copy draft',
      summary: 'The first pass is shaped for review before anything is published.',
      reason_it_matters: 'The website work can be judged instead of started from scratch.',
      confidence: 0.82,
      target: {type: 'draft', id: 'demo-d3day-page-copy', name: 'D3Day page copy'},
      draftId: 'demo-d3day-page-copy',
      metadataJson: {
        preparedArtifactKind: 'copy_draft',
        preparedArtifact: {kind: 'copy_draft', id: 'demo-d3day-page-copy'}
      },
      portalPhrases: ['D3Day page copy']
    }, {
      title: 'Client follow-up email',
      summary: 'The email is drafted and waiting for tone review.',
      reason_it_matters: 'The follow-up can move with one clean approval instead of another writing session.',
      confidence: 0.8,
      target: {type: 'draft', id: 'demo-client-follow-up', name: 'Client follow-up'},
      draftId: 'demo-client-follow-up',
      metadataJson: {
        preparedArtifactKind: 'email_draft',
        preparedArtifact: {kind: 'email_draft', id: 'demo-client-follow-up'}
      },
      portalPhrases: ['Client follow-up']
    }],
    todayTheme: {
      title: 'Protected attention',
      why: 'One meaningful decision deserves the cleanest part of the day.'
    }
  };
}

async function hydrateHomePresence(){
  if(mockBriefing){
    const briefing = prototypeBriefing();
    executiveBriefingState = briefing;
    window.executiveBriefingState = briefing;
    hydrateGreetingFromBriefing(briefing);
    hydrateRoomsFromBriefing(briefing);
    updatePreparedCount(Array.isArray(briefing.readyForYou) ? briefing.readyForYou.length : 0);
    return;
  }
  if(!canUseApi) return;
  try{
    const briefing = await getJson('/api/executive-briefing');
    if(!briefing || briefing.bookMode) return;
    executiveBriefingState = briefing;
    window.executiveBriefingState = briefing;
    hydrateGreetingFromBriefing(briefing);
    hydrateRoomsFromBriefing(briefing);
    hydratePreparedWorkQueue();
  }catch(error){
    console.warn('Executive briefing unavailable:', error.message);
  }
}

function setScraperLoading(type, message){
  const workflow = scraperWorkflows[type];
  setWorkspaceContent({
    lens: workflow.lens,
    title: message.title,
    meaning: message.meaning,
    understanding: message.understanding,
    recommendation: message.recommendation,
    actions: [{label: 'Cancel', workflow: 'setup:' + type}],
    label: 'Lead Intelligence loading workspace',
    packetReceipt: lastHearthPacketReceipt
  });
}

async function runScraperPreview(type){
  if(!canUseApi){
    openScraper(type, 'preview');
    return;
  }
  const config = scraperApiConfig[type];
  const workflow = scraperWorkflows[type];
  if(!config || !workflow){
    openScraper(type, 'preview');
    return;
  }
  const criteria = getScraperCriteria();
  const payload = config.buildPayload(criteria);
  const session = sessionFor(type);
  session.payload = payload;
  setScraperLoading(type, {
    title: type === 'partners' ? 'VAL is preparing the partner preview.' : 'VAL is preparing the organization preview.',
    meaning: 'This is still a preview. Nothing will be added to GHL until approved records are imported.',
    understanding: [
      'Level 1 discovery is running from the configured source mix.',
      'GHL duplicate checks happen before enrichment spend.',
      'The review set will preserve contact details, source evidence, and approval state.'
    ],
    recommendation: 'Let VAL finish the preview, then approve only the records that deserve to enter the pipeline.'
  });
  try{
    const result = await postJson(config.previewUrl, payload);
    const leads = Array.isArray(result.leads) ? result.leads : [];
    session.result = result;
    session.previewLeads = leads.map((lead) => normalizePreviewLead(lead, type));
    workflow.previewLeads = session.previewLeads;
    if(type === 'partners' && result.crmDestination){
      workflow.criteria.destination = result.crmDestination.pipeline + ' / ' + result.crmDestination.stage;
    }
    renderScraperWorkflow(type, 'preview');
  }catch(error){
    setWorkspaceContent({
      lens: workflow.lens,
      title: 'The scraper needs attention before it can run.',
      meaning: 'VAL did not import anything. The preview could not complete cleanly.',
      understanding: [
        error.message,
        'The most common causes are a missing source key, a broad search that timed out, or a temporary upstream failure.',
        'The existing scraper workflow remains protected; preview and import are still separate.'
      ],
    recommendation: 'Check connections or narrow the criteria before running the preview again.',
      actions: [
        {label: 'Tune criteria', workflow: 'setup:' + type},
        {label: 'Check connections', workflow: 'connections'},
        {label: 'Open Pipeline', workflow: 'pipeline'}
      ],
      label: 'Lead Intelligence error workspace',
      packetReceipt: lastHearthPacketReceipt
    });
  }
}

async function importApprovedScraperLeads(type){
  if(!canUseApi){
    openScraper(type, 'imported');
    return;
  }
  const config = scraperApiConfig[type];
  const workflow = scraperWorkflows[type];
  const session = sessionFor(type);
  const rows = Array.from(scraperPreviewList.querySelectorAll('.preview-lead'));
  const approvedIndexes = rows
    .filter((row) => row.dataset.leadReview !== 'held')
    .map((row) => Number(row.dataset.leadIndex));
  const approvedPreview = approvedIndexes.map((index) => session.previewLeads && session.previewLeads[index]).filter(Boolean);
  const approvedRaw = approvedPreview.map((lead) => ({...(lead._raw || lead), _approved: true}));
  if(!approvedRaw.length){
    updatePreviewApprovalSummary();
    renderHearthPacketReceiptStrip(lastHearthPacketReceipt);
    return;
  }
  setScraperLoading(type, {
    title: 'VAL is sending approved records to the pipeline.',
    meaning: 'Only the approved records are being handed to GHL.',
    understanding: [
      'Import re-checks duplicates before writing.',
      'Tags, custom fields, source notes, and opportunity stage stay governed by the active scraper contract.',
      'Held records remain out of the CRM.'
    ],
    recommendation: 'Wait for the import receipt before running another batch.'
  });
  try{
    const payload = {...(session.result || session.payload || {}), leads: approvedRaw};
    const result = await postJson(config.importUrl, payload);
    session.importResult = result;
    workflow.importedUnderstanding = [
      (result.created || []).length + ' approved record' + ((result.created || []).length === 1 ? ' was' : 's were') + ' created or matched.',
      (result.skipped || []).length + ' duplicate or skipped record' + ((result.skipped || []).length === 1 ? ' was' : 's were') + ' protected from CRM noise.',
      (result.failed || []).length + ' record' + ((result.failed || []).length === 1 ? ' needs' : 's need') + ' follow-up.'
    ];
    renderScraperWorkflow(type, 'imported');
  }catch(error){
    setWorkspaceContent({
      lens: workflow.lens,
      title: 'The import did not complete.',
      meaning: 'VAL did not silently continue. The approved records need review before another attempt.',
      understanding: [
        error.message,
        'Preview data is still held in this session.',
        'No held records were sent.'
      ],
      recommendation: 'Open the pipeline or check connections before retrying the import.',
      actions: [
        {label: 'Retry import', workflow: 'import:' + type},
        {label: 'Check connections', workflow: 'connections'},
        {label: 'Open Pipeline', workflow: 'pipeline'}
      ],
      label: 'Lead Intelligence import error workspace',
      packetReceipt: lastHearthPacketReceipt
    });
  }
}

function workspaceInputValue(mode){
  return workspaceInputPanel.querySelector('[data-workspace-input="' + mode + '"]')?.value.trim() || '';
}

async function runCowork(mode){
  const input = workspaceInputValue('cowork');
  const prompt = input || 'Help me think through the most useful next step from the Hearth.';
  if(mockScrapers || !canUseApi){
    setWorkspaceContent({
      lens: 'Co-Work with VAL',
      title: mode === 'draft' ? 'A draft can begin here.' : 'Here is the first useful shape.',
      meaning: 'VAL would use the current Home context and your Co-Work prompt to prepare a private working draft.',
      understanding: [
        'Prompt: ' + prompt,
        'This stays inside the desk workspace.',
        'No external action is taken from Co-Work without a separate approval step.'
      ],
      recommendation: mode === 'draft' ? 'Start with one plain paragraph, then refine from there.' : 'Name the decision, list the tradeoffs, and choose the next reversible step.',
      actions: [
        {label: 'Keep working', workflow: 'cowork:think'},
        {label: 'Teach VAL from this', workflow: 'teach'},
        {label: 'Close and return to desk', workflow: 'cancel:meeting'}
      ],
      label: 'Co-Work with VAL result'
    });
    renderWorkspaceInput({
      label: 'Continue Co-Work',
      placeholder: 'Add the next thought...',
      helper: 'Mock-safe mode is on, so this did not call the live chat route.',
      mode: 'cowork',
      value: input
    });
    return;
  }
  setWorkspaceContent({
    lens: 'Co-Work with VAL',
    title: 'VAL is thinking with you.',
    meaning: 'Co-Work is becoming a private working response.',
    understanding: [
      'Current Home context is included.',
      'VAL can prepare drafts, options, or decision framing.',
      'External action still requires approval.'
    ],
    recommendation: 'Stay with the thought; VAL will bring back the next useful shape.',
    actions: [{label: 'Close and return to desk', workflow: 'cancel:meeting'}],
    label: 'Co-Work with VAL loading'
  });
  try{
    const result = await postJson('/api/val/chat', {
      channel: 'hearth_cowork',
      title: 'Co-Work from Hearth',
      messages: [{role: 'user', content: prompt}],
      projectContext: workspaceReturnTarget === 'project' ? activeProjectChatContext() : null,
      dashboard: {
        hearth: title.textContent,
        witness: witness.textContent,
        orientation: orientation.textContent,
        permission: permission.textContent
      }
    });
    const content = result.message?.content || 'VAL prepared a response.';
    setWorkspaceContent({
      lens: 'Co-Work with VAL',
      title: 'VAL prepared the next useful shape.',
      meaning: content,
      understanding: [
        result.saved ? 'This conversation was saved.' : (result.saveWarning || 'This conversation may not have been saved.'),
        result.createdTasks?.length ? result.createdTasks.length + ' task candidate(s) were detected.' : 'No task was created automatically.',
        'No external action was taken.'
      ],
      recommendation: 'Review this, then keep working or turn it into a prepared artifact when it feels true.',
      actions: [
        {label: 'Keep working', workflow: 'cowork:think'},
        {label: 'Teach VAL from this', workflow: 'teach'},
        {label: 'Close and return to desk', workflow: 'cancel:meeting'}
      ],
      label: 'Co-Work with VAL result'
    });
    renderWorkspaceInput({
      label: 'Continue Co-Work',
      placeholder: 'Add the next thought...',
      helper: 'Co-Work remains private until you choose an approved action elsewhere.',
      mode: 'cowork',
      value: input
    });
  }catch(error){
    setWorkspaceContent({
      lens: 'Co-Work with VAL',
      title: 'Co-Work needs attention.',
      meaning: 'VAL could not complete the co-working response.',
      understanding: [error.message, 'Nothing external was changed.', 'Your prompt is still yours to refine.'],
      recommendation: 'Try a smaller prompt or return to the desk.',
      actions: [
        {label: 'Try again', workflow: 'cowork:think'},
        {label: 'Close and return to desk', workflow: 'cancel:meeting'}
      ],
      label: 'Co-Work with VAL error'
    });
    renderWorkspaceInput({
      label: 'Co-Work',
      placeholder: 'Try a smaller prompt...',
      helper: 'No external action was taken.',
      mode: 'cowork',
      value: input
    });
  }
}

async function runTeachVal(mode){
  const input = workspaceInputValue('teach');
  const prompt = input || "This wasn't useful. Help VAL understand why.";
  if(mode === 'review'){
    if(mockScrapers || !canUseApi){
      setWorkspaceContent({
        lens: 'Teach VAL',
        title: 'Review updates would be prepared.',
        meaning: 'VAL would gather pending learning candidates for approval.',
        understanding: [
          'Relationship, project, Teach VAL, and priority-rule candidates remain reviewable.',
          'No durable memory is committed automatically.',
          'Mock-safe mode is on, so no backend call ran.'
        ],
        recommendation: 'Approve only what you want VAL to remember or apply.',
        actions: [
          {label: 'Extract teaching signal', workflow: 'teach:extract'},
          {label: 'Close and return to desk', workflow: 'cancel:meeting'}
        ],
        label: 'Teach VAL review updates'
      });
      return;
    }
    const result = await postJson('/api/val/review-updates/build', {limit: 20});
    setWorkspaceContent({
      lens: 'Teach VAL',
      title: result.count ? result.count + ' learning update' + (result.count === 1 ? ' is' : 's are') + ' ready for review.' : 'No learning updates need review right now.',
      meaning: 'VAL gathered reviewable updates without committing them automatically.',
      understanding: (result.updates || []).slice(0, 3).map((update) => update.title || update.summary || update.targetType || 'Review update').concat(['No external action was taken.']),
      recommendation: 'Open the review queue when you want to approve, reject, or edit what VAL learns.',
      actions: [
        {label: 'Open VAL review queue', workflow: 'reviewQueue'},
        {label: 'Extract teaching signal', workflow: 'teach:extract'},
        {label: 'Close and return to desk', workflow: 'cancel:meeting'}
      ],
      label: 'Teach VAL review updates'
    });
    return;
  }
  if(mockScrapers || !canUseApi){
    setWorkspaceContent({
      lens: 'Teach VAL',
      title: 'VAL heard the teaching signal.',
      meaning: 'This would become a reviewable correction or preference, not automatic durable memory.',
      understanding: [
        'Teaching note: ' + prompt,
        'Likely type: correction or preference.',
        'Approval is required before this becomes durable memory.'
      ],
      recommendation: 'Keep the teaching specific: what VAL noticed, what was wrong, and what it should do next time.',
      actions: [
        {label: 'Build review updates', workflow: 'teach:review'},
        {label: 'Close and return to desk', workflow: 'cancel:meeting'}
      ],
      label: 'Teach VAL extraction result'
    });
    renderWorkspaceInput({
      label: 'Teach VAL',
      placeholder: 'Add more context...',
      helper: 'Mock-safe mode is on, so this did not call the live extractor.',
      mode: 'teach',
      value: input
    });
    return;
  }
  const result = await postJson('/api/val/executive-instructions/extract', {
    text: prompt,
    sourceType: 'hearth_teach_val',
    sourceId: 'hearth_teach_val',
    authenticatedUserNames: ['Jessa'],
    trustedAuthenticatedUser: true
  });
  const instructions = result.executive_instructions || [];
  setWorkspaceContent({
    lens: 'Teach VAL',
    title: instructions.length ? 'VAL found a possible instruction.' : 'VAL captured this as teaching context.',
    meaning: instructions.length ? 'The instruction is reviewable and no external action was taken.' : 'This looks more like preference or correction context than an executable instruction.',
    understanding: instructions.slice(0, 3).map((instruction) => [
      instruction.requested_action || instruction.instruction_type || 'instruction',
      instruction.authorization || 'approval_required',
      instruction.recommended_next_step || 'review'
    ].join(' / ')).concat(['No external action was taken.']),
    recommendation: 'Use review updates to decide what VAL should actually learn or apply.',
    actions: [
      {label: 'Build review updates', workflow: 'teach:review'},
      {label: 'Close and return to desk', workflow: 'cancel:meeting'}
    ],
    label: 'Teach VAL extraction result'
  });
  renderWorkspaceInput({
    label: 'Teach VAL',
    placeholder: 'Add more context...',
    helper: 'This remains reviewable. Durable memory should be confirmed before promotion.',
    mode: 'teach',
    value: input
  });
}

function restoreRelationshipWindow(){
  retrievalSystem.classList.add('open');
  hearth.classList.add('drawer-open');
  drawerPull.setAttribute('aria-expanded', 'true');
  drawerTray.setAttribute('aria-hidden', 'false');
  drawerTray.classList.add('relationship-open');
  drawerTray.classList.remove('val-open', 'source-open', 'project-open', 'timeline-open', 'correspondence-open', 'commitment-open', 'document-open');
  relationshipDrawerLink.setAttribute('aria-expanded', 'true');
  valDrawerLink?.setAttribute('aria-expanded', 'false');
  projectDrawerLink.setAttribute('aria-expanded', 'false');
  timelineDrawerLink?.setAttribute('aria-expanded', 'false');
  correspondenceDrawerLink?.setAttribute('aria-expanded', 'false');
  commitmentDrawerLink?.setAttribute('aria-expanded', 'false');
  documentDrawerLink?.setAttribute('aria-expanded', 'false');
  sourceDrawerLink.setAttribute('aria-expanded', 'false');
  document.querySelector('#relationship-detail').setAttribute('aria-hidden', 'false');
  document.querySelector('#val-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#project-detail').setAttribute('aria-hidden', 'true');
  document.querySelector('#timeline-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#correspondence-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#commitment-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#document-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#source-detail').setAttribute('aria-hidden', 'true');
  updateCloseAllDrawersButton();
}

function restoreProjectWindow(){
  retrievalSystem.classList.add('open');
  hearth.classList.add('drawer-open');
  drawerPull.setAttribute('aria-expanded', 'true');
  drawerTray.setAttribute('aria-hidden', 'false');
  drawerTray.classList.add('project-open');
  drawerTray.classList.remove('val-open', 'relationship-open', 'timeline-open', 'correspondence-open', 'commitment-open', 'document-open', 'source-open');
  projectDrawerLink.setAttribute('aria-expanded', 'true');
  valDrawerLink?.setAttribute('aria-expanded', 'false');
  relationshipDrawerLink.setAttribute('aria-expanded', 'false');
  timelineDrawerLink?.setAttribute('aria-expanded', 'false');
  correspondenceDrawerLink?.setAttribute('aria-expanded', 'false');
  commitmentDrawerLink?.setAttribute('aria-expanded', 'false');
  documentDrawerLink?.setAttribute('aria-expanded', 'false');
  sourceDrawerLink.setAttribute('aria-expanded', 'false');
  document.querySelector('#project-detail').setAttribute('aria-hidden', 'false');
  document.querySelector('#val-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#relationship-detail').setAttribute('aria-hidden', 'true');
  document.querySelector('#timeline-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#correspondence-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#commitment-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#document-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#source-detail').setAttribute('aria-hidden', 'true');
  openProjectIndex();
  updateCloseAllDrawersButton();
}

function restoreTimelineWindow(){
  retrievalSystem.classList.add('open');
  hearth.classList.add('drawer-open');
  drawerPull.setAttribute('aria-expanded', 'true');
  drawerTray.setAttribute('aria-hidden', 'false');
  drawerTray.classList.add('timeline-open');
  drawerTray.classList.remove('val-open', 'relationship-open', 'project-open', 'correspondence-open', 'commitment-open', 'document-open', 'source-open');
  timelineDrawerLink?.setAttribute('aria-expanded', 'true');
  valDrawerLink?.setAttribute('aria-expanded', 'false');
  relationshipDrawerLink.setAttribute('aria-expanded', 'false');
  projectDrawerLink.setAttribute('aria-expanded', 'false');
  correspondenceDrawerLink?.setAttribute('aria-expanded', 'false');
  commitmentDrawerLink?.setAttribute('aria-expanded', 'false');
  documentDrawerLink?.setAttribute('aria-expanded', 'false');
  sourceDrawerLink.setAttribute('aria-expanded', 'false');
  document.querySelector('#timeline-detail')?.setAttribute('aria-hidden', 'false');
  document.querySelector('#val-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#relationship-detail').setAttribute('aria-hidden', 'true');
  document.querySelector('#project-detail').setAttribute('aria-hidden', 'true');
  document.querySelector('#correspondence-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#commitment-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#document-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#source-detail').setAttribute('aria-hidden', 'true');
  renderTimelineReviewCards(currentTimelineReviewItems);
  updateCloseAllDrawersButton();
}

function restoreCorrespondenceWindow(){
  retrievalSystem.classList.add('open');
  hearth.classList.add('drawer-open');
  drawerPull.setAttribute('aria-expanded', 'true');
  drawerTray.setAttribute('aria-hidden', 'false');
  drawerTray.classList.add('correspondence-open');
  drawerTray.classList.remove('val-open', 'relationship-open', 'project-open', 'timeline-open', 'commitment-open', 'document-open', 'source-open');
  correspondenceDrawerLink?.setAttribute('aria-expanded', 'true');
  valDrawerLink?.setAttribute('aria-expanded', 'false');
  relationshipDrawerLink.setAttribute('aria-expanded', 'false');
  projectDrawerLink.setAttribute('aria-expanded', 'false');
  timelineDrawerLink?.setAttribute('aria-expanded', 'false');
  commitmentDrawerLink?.setAttribute('aria-expanded', 'false');
  documentDrawerLink?.setAttribute('aria-expanded', 'false');
  sourceDrawerLink.setAttribute('aria-expanded', 'false');
  document.querySelector('#correspondence-detail')?.setAttribute('aria-hidden', 'false');
  document.querySelector('#val-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#relationship-detail').setAttribute('aria-hidden', 'true');
  document.querySelector('#project-detail').setAttribute('aria-hidden', 'true');
  document.querySelector('#timeline-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#commitment-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#document-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#source-detail').setAttribute('aria-hidden', 'true');
  renderCorrespondenceBrief(activeCorrespondenceItem || currentCorrespondenceItems[0]);
  updateCloseAllDrawersButton();
}

function restoreCommitmentWindow(){
  retrievalSystem.classList.add('open');
  hearth.classList.add('drawer-open');
  drawerPull.setAttribute('aria-expanded', 'true');
  drawerTray.setAttribute('aria-hidden', 'false');
  drawerTray.classList.add('commitment-open');
  drawerTray.classList.remove('val-open', 'relationship-open', 'project-open', 'timeline-open', 'correspondence-open', 'document-open', 'source-open');
  commitmentDrawerLink?.setAttribute('aria-expanded', 'true');
  valDrawerLink?.setAttribute('aria-expanded', 'false');
  relationshipDrawerLink.setAttribute('aria-expanded', 'false');
  projectDrawerLink.setAttribute('aria-expanded', 'false');
  timelineDrawerLink?.setAttribute('aria-expanded', 'false');
  correspondenceDrawerLink?.setAttribute('aria-expanded', 'false');
  documentDrawerLink?.setAttribute('aria-expanded', 'false');
  sourceDrawerLink.setAttribute('aria-expanded', 'false');
  document.querySelector('#commitment-detail')?.setAttribute('aria-hidden', 'false');
  document.querySelector('#val-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#relationship-detail').setAttribute('aria-hidden', 'true');
  document.querySelector('#project-detail').setAttribute('aria-hidden', 'true');
  document.querySelector('#timeline-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#correspondence-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#document-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#source-detail').setAttribute('aria-hidden', 'true');
  renderCommitmentBrief(activeCommitmentItem || currentCommitmentItems[0]);
  updateCloseAllDrawersButton();
}

function restoreDocumentWindow(){
  retrievalSystem.classList.add('open');
  hearth.classList.add('drawer-open');
  drawerPull.setAttribute('aria-expanded', 'true');
  drawerTray.setAttribute('aria-hidden', 'false');
  drawerTray.classList.add('document-open');
  drawerTray.classList.remove('val-open', 'relationship-open', 'project-open', 'timeline-open', 'correspondence-open', 'commitment-open', 'source-open');
  documentDrawerLink?.setAttribute('aria-expanded', 'true');
  valDrawerLink?.setAttribute('aria-expanded', 'false');
  relationshipDrawerLink.setAttribute('aria-expanded', 'false');
  projectDrawerLink.setAttribute('aria-expanded', 'false');
  timelineDrawerLink?.setAttribute('aria-expanded', 'false');
  correspondenceDrawerLink?.setAttribute('aria-expanded', 'false');
  commitmentDrawerLink?.setAttribute('aria-expanded', 'false');
  sourceDrawerLink.setAttribute('aria-expanded', 'false');
  document.querySelector('#document-detail')?.setAttribute('aria-hidden', 'false');
  document.querySelector('#val-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#relationship-detail').setAttribute('aria-hidden', 'true');
  document.querySelector('#project-detail').setAttribute('aria-hidden', 'true');
  document.querySelector('#timeline-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#correspondence-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#commitment-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#source-detail').setAttribute('aria-hidden', 'true');
  renderDocumentBrief(activeDocumentItem || filteredDocumentItems()[0]);
  updateCloseAllDrawersButton();
}

function restoreValWindow(){
  retrievalSystem.classList.add('open');
  hearth.classList.add('drawer-open');
  drawerPull.setAttribute('aria-expanded', 'true');
  drawerTray.setAttribute('aria-hidden', 'false');
  drawerTray.classList.add('val-open');
  drawerTray.classList.remove('relationship-open', 'project-open', 'timeline-open', 'correspondence-open', 'commitment-open', 'document-open', 'source-open');
  valDrawerLink?.setAttribute('aria-expanded', 'true');
  relationshipDrawerLink.setAttribute('aria-expanded', 'false');
  projectDrawerLink.setAttribute('aria-expanded', 'false');
  timelineDrawerLink?.setAttribute('aria-expanded', 'false');
  correspondenceDrawerLink?.setAttribute('aria-expanded', 'false');
  commitmentDrawerLink?.setAttribute('aria-expanded', 'false');
  documentDrawerLink?.setAttribute('aria-expanded', 'false');
  sourceDrawerLink.setAttribute('aria-expanded', 'false');
  document.querySelector('#val-detail')?.setAttribute('aria-hidden', 'false');
  document.querySelector('#relationship-detail').setAttribute('aria-hidden', 'true');
  document.querySelector('#project-detail').setAttribute('aria-hidden', 'true');
  document.querySelector('#timeline-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#correspondence-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#commitment-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#document-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#source-detail').setAttribute('aria-hidden', 'true');
  updateCloseAllDrawersButton();
  hydrateValDrawer();
}

function valOperationalCategory(item){
  return String(item?.data?.sourceCategory || item?.category || item?.data?.category || '').toLowerCase();
}

function setValStatusField(key, headline, copy){
  if(valStatusFields[key]) valStatusFields[key].textContent = headline;
  if(valStatusCopy[key]) valStatusCopy[key].textContent = copy;
}

function setValRouteField(key, headline, copy){
  if(valRouteCountFields[key]) valRouteCountFields[key].textContent = headline;
  if(valRouteCopyFields[key]) valRouteCopyFields[key].textContent = copy;
}

function valRouteNames(items = []){
  return items.slice(0, 3).map((item) => String(item.name || item.personName || item.documentName || item.title || '').replace(/^Support-circle context:\s*/i, '').replace(/^Document\/example reference:\s*/i, '').trim()).filter(Boolean);
}

function updateValRoutingPanel({supportCircle = [], documentExamples = [], os = {}} = {}){
  const readiness = os.externalActionReadiness || {};
  const providers = Array.isArray(readiness.providers) ? readiness.providers : [];
  const readyProviders = providers.filter((provider) => provider.readable || /configured|readable|connected/i.test(String(provider.status || '')));
  const supportNames = valRouteNames(supportCircle);
  const docNames = valRouteNames(documentExamples);
  valOnboardingRouteState = {supportCircle, documentExamples, connections: providers};
  setValRouteField(
    'support_circle',
    supportCircle.length ? supportCircle.length + ' relationship candidate' + (supportCircle.length === 1 ? '' : 's') : 'No people routed yet',
    supportCircle.length
      ? (supportNames.length ? 'Ready for relationship review: ' + supportNames.join(', ') + (supportCircle.length > supportNames.length ? ', and ' + (supportCircle.length - supportNames.length) + ' more.' : '.') + ' ' : 'Relationship candidates are ready for review. ') + 'Resolve CRM/contact identity before VAL acts.'
      : 'Add LinkedIn Support Circle names and profile links during onboarding so VAL knows who the user has committed to support publicly.'
  );
  setValRouteField(
    'documents_and_examples',
    documentExamples.length ? documentExamples.length + ' reference candidate' + (documentExamples.length === 1 ? '' : 's') : 'No document references yet',
    documentExamples.length
      ? (docNames.length ? 'Ready for document review: ' + docNames.join(', ') + (documentExamples.length > docNames.length ? ', and ' + (documentExamples.length - docNames.length) + ' more.' : '.') + ' ' : 'Document references are ready for review. ') + 'Link source files, relationships, and projects before durable use.'
      : 'Add Documents and Templates context during onboarding so VAL can route documents to relationships/projects and templates to reusable structure or tone.'
  );
  setValRouteField(
    'connections',
    providers.length ? readyProviders.length + ' of ' + providers.length + ' source' + (providers.length === 1 ? '' : 's') + ' ready' : 'Readiness pending',
    providers.length
      ? providers.map((provider) => provider.label + ': ' + provider.status).join(' · ') + '. External writes remain locked.'
      : 'Review Email, Calendar, CRM, Google Docs, LinkedIn, GitHub, and document source readiness before executable work depends on them.'
  );
}

async function hydrateValDrawer(){
  if(!valLiveStatus) return;
  if(document.querySelector('.val-witnessing-entry')){
    valLiveStatus.textContent = 'Nothing leaves this session. VAL will show what it notices before anything becomes memory.';
    return;
  }
  if(!canUseApi){
    valLiveStatus.textContent = 'Local preview: VAL can show onboarding routes here; live VAL OS counts appear when the local service is connected.';
    return;
  }
  valLiveStatus.textContent = 'Checking VAL OS and onboarding status...';
  try{
    const [os, onboarding] = await Promise.all([
      getJson('/api/val/os'),
      getJson('/api/teach-val/onboarding')
    ]);
    const imports = Array.isArray(onboarding.imports) ? onboarding.imports : [];
    const importedCategories = new Set(imports.filter((row) => /Imported|Reviewed|Ready/i.test(String(row.status || ''))).map((row) => row.category));
    const draftBehaviors = Array.isArray(os.draftBehaviors) ? os.draftBehaviors : [];
    const learningReview = Array.isArray(os.learningReview) ? os.learningReview : [];
    const workingAgreements = draftBehaviors.filter((item) => valOperationalCategory(item) === 'working_agreements');
    const linkedinStrategy = draftBehaviors.filter((item) => valOperationalCategory(item) === 'linkedin_strategy');
    const supportCircle = dedupeOnboardingRouteItems(onboardingImportItems(onboarding, 'support_circle').concat(osRouteItems(os, 'support_circle')));
    const documentExamples = dedupeOnboardingRouteItems(onboardingImportItems(onboarding, 'documents_and_examples').concat(osRouteItems(os, 'documents_and_examples')));
    const onboardingCount = ['ai_history_import','current_projects','important_people','working_agreements','linkedin_strategy','support_circle','documents_and_examples'].filter((category) => importedCategories.has(category)).length;
    setValStatusField(
      'onboarding',
      onboardingCount ? onboardingCount + ' context areas imported' : 'Context transfer ready',
      onboardingCount ? 'VAL has imported onboarding context that can route into people, projects, agreements, LinkedIn, support, documents, and prior AI history.' : 'Start onboarding or import ChatGPT/Claude context so VAL can understand the user before optimizing the work.'
    );
    setValStatusField(
      'agreements',
      (workingAgreements.length + linkedinStrategy.length) ? (workingAgreements.length + linkedinStrategy.length) + ' behavior candidates' : 'Approval boundaries first',
      (workingAgreements.length || linkedinStrategy.length) ? 'Review-first behavior candidates are waiting in VAL OS before VAL applies them as operating rules.' : 'Working agreements and LinkedIn strategy will become reviewable VAL OS candidates after onboarding commit.'
    );
    setValStatusField(
      'memory',
      Number(os.counts?.learningNeedsReview || 0) ? os.counts.learningNeedsReview + ' learning approvals waiting' : 'Memory review clear',
      [supportCircle.length ? supportCircle.length + ' LinkedIn support item' + (supportCircle.length === 1 ? '' : 's') : '', documentExamples.length ? documentExamples.length + ' document/template reference' + (documentExamples.length === 1 ? '' : 's') : ''].filter(Boolean).join(' · ') || 'Approved onboarding memory and future corrections will appear here for review.'
    );
    valLiveStatus.textContent = [
      Number(os.counts?.draftBehaviors || 0) + ' behavior candidate' + (Number(os.counts?.draftBehaviors || 0) === 1 ? '' : 's'),
      Number(os.counts?.learningNeedsReview || 0) + ' learning approval' + (Number(os.counts?.learningNeedsReview || 0) === 1 ? '' : 's'),
      Number(os.counts?.approvedBehaviors || 0) + ' approved behavior' + (Number(os.counts?.approvedBehaviors || 0) === 1 ? '' : 's'),
      'external actions locked'
    ].join(' · ');
    updateValRoutingPanel({supportCircle, documentExamples, os});
  }catch(error){
    valLiveStatus.textContent = 'VAL OS status unavailable: ' + error.message;
  }
}

function openWorkspaceShell(label, options = {}){
  workspaceReturnTarget = options.returnTarget || 'home';
  updateWorkspaceReturnButton();
  closeCalendarPanel();
  if(options.keepDrawerOpen){
    if(options.returnTarget === 'relationship') restoreRelationshipWindow();
    if(options.returnTarget === 'project') restoreProjectWindow();
    if(options.returnTarget === 'timeline') restoreTimelineWindow();
    if(options.returnTarget === 'correspondence') restoreCorrespondenceWindow();
    if(options.returnTarget === 'document') restoreDocumentWindow();
    if(options.returnTarget === 'commitment') restoreCommitmentWindow();
    if(options.returnTarget === 'val') restoreValWindow();
  } else {
    closeDrawer();
  }
  hearth.dataset.distance = 'judgment';
  deskWorkspace.setAttribute('aria-hidden', 'false');
  document.querySelectorAll('.living-room').forEach((room) => {
    room.classList.remove('active-room');
  });
  deskWorkspace.setAttribute('aria-label', label || 'Decision workspace');
  if(window.matchMedia('(max-width: 720px), (max-height: 720px)').matches){
    drawerTray.scrollTop = 0;
    window.requestAnimationFrame(() => {
      deskWorkspace.scrollTop = 0;
      deskWorkspace.scrollIntoView({block:'start', inline:'nearest', behavior:'smooth'});
    });
  }
}

function renderScraperWorkflow(type, stage = 'setup'){
  const workflow = scraperWorkflows[type];
  if(!workflow) return false;
  activeScraperType = type;
  const isPartner = type === 'partners';
  const stageTitle = workflow[stage + 'Title'] || workflow.setupTitle;
  const stageMeaning = workflow[stage + 'Meaning'] || workflow.setupMeaning;
  const stageUnderstanding = workflow[stage + 'Understanding'] || workflow.setupUnderstanding;
  const stageRecommendation = workflow[stage + 'Recommendation'] || workflow.setupRecommendation;
  const actionsByStage = {
    setup: [
      {label: isPartner ? 'Run partner preview' : 'Run preview', workflow: 'preview:' + type, packet:'lead_intelligence_packet'},
      {label: 'Open Pipeline', workflow: 'pipeline', packet:'lead_intelligence_packet'},
      {label: 'Check connections', workflow: 'connections', packet:'lead_intelligence_packet'}
    ],
    preview: [
      {label: 'Run Level 3 verification', workflow: 'verify:' + type, packet:'lead_intelligence_packet'},
      {label: 'Import approved leads', workflow: 'import:' + type, packet:'lead_intelligence_packet'},
      {label: 'Cancel import', workflow: 'cancel:' + type, packet:'lead_intelligence_packet'}
    ],
    verified: [
      {label: 'Import approved leads', workflow: 'import:' + type, packet:'lead_intelligence_packet'},
      {label: isPartner ? 'Tune partner type' : 'Tune criteria', workflow: 'setup:' + type, packet:'lead_intelligence_packet'},
      {label: 'Cancel import', workflow: 'cancel:' + type, packet:'lead_intelligence_packet'}
    ],
    imported: [
      {label: 'Open Pipeline', workflow: 'pipeline', packet:'lead_intelligence_packet'},
      {label: isPartner ? 'Run another partner scrape' : 'Find next batch', workflow: 'setup:' + type, packet:'lead_intelligence_packet'},
      {label: 'Teach VAL', workflow: 'teach'}
    ]
  };
  setWorkspaceContent({
    lens: workflow.lens,
    title: stageTitle,
    meaning: stageMeaning,
    understanding: stageUnderstanding,
    recommendation: stageRecommendation,
    actions: actionsByStage[stage] || actionsByStage.setup,
    label: (isPartner ? 'Partner' : 'Organization') + ' scraper workspace'
  });
  if(stage === 'setup') renderScraperCriteria(workflow);
  renderScraperPreviewList(workflow, stage);
  return true;
}

function renderScraperUtility(type){
  const workflow = scraperUtilityWorkflows[type];
  if(!workflow) return false;
  setWorkspaceContent({
    lens: workflow.lens,
    title: workflow.title,
    meaning: workflow.meaning,
    understanding: workflow.understanding,
    recommendation: workflow.recommendation,
    actions: workflow.actions.map((label) => ({
      label,
      workflow: label === 'Open Pipeline' ? 'pipeline' : label === 'Teach VAL' ? 'teach' : '',
      packet: label === 'Teach VAL' ? 'val_os_packet' : 'lead_intelligence_packet'
    })),
    label: workflow.lens + ' workspace'
  });
  return true;
}

function openScraper(type, stage = 'setup'){
  const rendered = renderScraperWorkflow(type, stage) || renderScraperUtility(type);
  if(!rendered) return;
  openWorkspaceShell('Lead Intelligence workspace');
  renderHearthPacketReceiptStrip(lastHearthPacketReceipt);
}

function valWorkspaceCopy(action){
  const copies = {
    start_onboarding: {
      title: 'Begin the Witnessing Session.',
      meaning: 'This is where VAL begins the partnership by learning who it is partnering with before it tries to optimize the work.',
      understanding: ['VAL asks one meaningful question at a time.', 'Every reflection should show evidence, name what changed in VAL understanding, and invite correction.', 'No account connection, external action, or durable memory promotion happens from this first slice.'],
      recommendation: 'Start with Meeting VAL, then move through story, mission, and principles only after each reflection feels accurate.',
      actions: [{label:'Pick Up Where We Left Off', workflow:'valWitnessingResume'}, {label:'Start Fresh', workflow:'valWitnessingFresh'}, {label:'Import from ChatGPT/Claude', workflow:'valOnboarding:ai_history_import'}, {label:'Back to VAL', workflow:'cancel:val'}]
    },
    working_agreements: {
      title: 'Set VAL working agreements.',
      meaning: 'Working agreements are the rules that keep VAL useful without becoming reckless.',
      understanding: ['Always draft LinkedIn posts and comments; never auto-publish them.', 'External emails, contracts, pricing, public posts, and legal commitments require explicit approval unless the user later enables automation.', 'Notification, weekend, urgency, sending, and memory rules should govern every drawer.'],
      recommendation: 'Capture these as reviewable Teach VAL memory so every transcript, email, draft, document, and commitment inherits the same boundaries.',
      actions: [{label:'Capture agreements', workflow:'valOnboarding:working_agreements'}, {label:'Review VAL OS here', workflow:'valOs:review'}, {label:'Back to VAL', workflow:'cancel:val'}]
    },
    linkedin_strategy: {
      title: 'Teach VAL the LinkedIn strategy.',
      meaning: 'LinkedIn should become prepared visibility, never surprise publishing.',
      understanding: ['VAL should ask for posting cadence, voice examples, comment style, themes, taboo topics, and examples or frameworks to upload.', 'Draft posts and comments belong in Leverage and relationship context until the user copies or opens LinkedIn manually.', 'People the user supports on LinkedIn should be linked to CRM contacts and relationship files.'],
      recommendation: 'Start by uploading examples and naming the people VAL should watch and support.',
      actions: [{label:'Capture LinkedIn strategy', workflow:'valOnboarding:linkedin_strategy'}, {label:'Open Relationships', workflow:'relationshipAllPeople'}, {label:'Back to VAL', workflow:'cancel:val'}]
    },
    support_circle: {
      title: 'Name your LinkedIn Support Circle.',
      meaning: 'This is only for people you have committed to supporting on LinkedIn by commenting on their posts.',
      understanding: ['Collect only the person name and LinkedIn profile link during onboarding.', 'VAL can later prepare draft comments or notice relevant posts, but it must never auto-publish, react, DM, or comment.', 'This is not a generic relationship import.'],
      recommendation: 'Add names and LinkedIn profile links only; deeper relationship context belongs in Relationships later.',
      actions: [{label:'Capture support circle', workflow:'valOnboarding:support_circle'}, {label:'Open Relationships', workflow:'relationshipAllPeople'}, {label:'Back to VAL', workflow:'cancel:val'}]
    },
    connections: {
      title: 'Review VAL connections and permissions.',
      meaning: 'Capabilities should be visible before VAL tries to use them.',
      understanding: ['Email, calendar, CRM/GHL, Google Docs, GitHub, LinkedIn observers, scrapers, and document sources should show connection state.', 'Anything exposed through a connected tool can become Co-Work executable only inside the user approval boundary.', 'Missing connections should create clear next steps, not silent failure.'],
      recommendation: 'Connect only what VAL needs for the next layer of work, then teach the approval rule for each system.',
      actions: [{label:'Review connections here', workflow:'valConnections:review'}, {label:'Teach permission rule', workflow:'teach:extract'}, {label:'Back to VAL', workflow:'cancel:val'}]
    },
    memory: {
      title: 'Review what VAL believes it knows.',
      meaning: 'Memory is trust infrastructure. It should be inspectable, correctable, and sourced.',
      understanding: ['Onboarding answers, Teach VAL notes, documents, transcripts, email evidence, relationship corrections, and project context become reviewable memory candidates.', 'VAL should explain where learning will apply before saving it.', 'The user can correct, dismiss, or narrow memory before it changes future judgment.'],
      recommendation: 'Audit memory before relying on it for drafts, priorities, relationship judgment, or autonomous preparation.',
      actions: [{label:'Review memory here', workflow:'valOs:review'}, {label:'Teach VAL correction', workflow:'teach:extract'}, {label:'Back to VAL', workflow:'cancel:val'}]
    }
  };
  return copies[action] || copies.start_onboarding;
}

const valWitnessingCards = [
  {
    id: 'meeting_val',
    category: 'witness_meeting_val',
    movement: 'Movement 1',
    title: 'Welcome',
    question: "Imagine we weren't beginning a software setup. Imagine we were simply meeting for coffee. What's one thing you'd hope I'd understand about you before we ever worked together?",
    placeholder: 'Share your thoughts...',
    helper: "There's no right or wrong answer. I'm simply here to understand you better.",
    writesTo: 'partnership expectations, comfort, and early boundaries',
    next: 'your_story'
  },
  {
    id: 'your_story',
    category: 'witness_your_story',
    movement: 'Movement 2',
    title: 'Your Story',
    question: 'Tell me your story. Not your resume. Your story.',
    placeholder: 'Take your time. You can include how you got here, what shaped you, what you are carrying, what you are building, and what still feels important to name.',
    helper: 'VAL is listening for recurring themes, motivations, and identity foundations. It should not flatten this into a corporate bio.',
    writesTo: 'identity foundations, life themes, and motivations',
    next: 'your_mission'
  },
  {
    id: 'your_mission',
    category: 'witness_your_mission',
    movement: 'Movement 3',
    title: 'Your Mission',
    question: 'What are you trying to change?',
    placeholder: 'Describe the problem, possibility, people, industry, family, community, or future you keep finding yourself pulled toward.',
    helper: 'VAL is listening for purpose, long-term direction, and the work that should be protected from distraction.',
    writesTo: 'purpose, long-term direction, and strategic protection',
    next: 'never_compromised'
  },
  {
    id: 'never_compromised',
    category: 'witness_never_compromised',
    movement: 'Movement 4',
    title: 'What VAL Must Protect',
    question: 'What must VAL protect as it supports your work and life?',
    placeholder: 'You can name people, values, commitments, capacity, tone of voice, reputation, health, relationships, boundaries, or non-negotiables.',
    helper: 'VAL is listening for what it should protect and support, not judging what matters.',
    writesTo: 'protected priorities, capacity, values, tone, relationships, and guardrails',
    next: 'support_style'
  },
  {
    id: 'support_style',
    category: 'witness_support_style',
    movement: 'Movement 5',
    title: 'How VAL Should Support You',
    question: 'How should VAL support your capacity, voice, and decisions?',
    placeholder: 'Describe the kind of help that feels useful, the tone you want preserved, where you want drafts, what should require approval, or what support should feel like.',
    helper: 'VAL is listening for how to help without overstepping.',
    writesTo: 'support style, tone, decision support, capacity support, and working agreement candidates',
    next: 'partnership_useful'
  },
  {
    id: 'partnership_useful',
    category: 'witness_partnership_useful',
    movement: 'Movement 6',
    title: 'A Useful Partnership',
    question: 'What would make this partnership feel truly useful to you?',
    placeholder: 'Name what would create relief, trust, momentum, protection, better decisions, clearer communication, or a stronger first month.',
    helper: 'VAL is listening for the kind of usefulness that would actually matter in your life and work.',
    writesTo: 'success definition, trust conditions, early value, and partnership expectations',
    next: 'connect_sources'
  },
  {
    id: 'connect_sources',
    category: 'witness_connect_sources',
    movement: 'Movement 7',
    title: 'Connect Inbox and Calendar',
    question: 'Click here to connect Gmail or Outlook and your calendar.',
    placeholder: 'If you are testing without connecting yet, note what VAL should be allowed to review when this connection is live.',
    helper: 'VAL needs this connection before it can responsibly identify relationship patterns, commitments, capacity pressure, and calendar rhythm.',
    writesTo: 'source connection status and review scope',
    next: 'source_review'
  },
  {
    id: 'source_review',
    category: 'witness_source_review',
    movement: 'Movement 8',
    title: 'VAL Reviews What It Sees',
    question: 'VAL will prepare a short, confirmable review of the communication rhythm, commitments, capacity signals, and relationship patterns it can see.',
    placeholder: 'Name anything VAL should pay special attention to while preparing that review.',
    helper: 'Nothing from connected sources becomes memory until you confirm it.',
    writesTo: 'calendar patterns, inbox/outbox patterns, capacity signals, commitments, and relationship candidates',
    next: 'key_relationships'
  },
  {
    id: 'key_relationships',
    category: 'witness_key_relationships',
    movement: 'Movement 9',
    title: 'Confirm Key Relationships',
    question: 'Who should VAL understand first, and do you have a LinkedIn commenting support circle?',
    placeholder: 'For key relationships, name the people VAL should understand. If you have a LinkedIn support circle, include only each person’s name and LinkedIn profile link.',
    helper: 'Your LinkedIn support circle means people you have committed to support on LinkedIn by commenting on their posts.',
    writesTo: 'key relationships, support circle, obligations, sensitive contexts, and relationship priorities',
    next: 'documents_templates'
  },
  {
    id: 'documents_templates',
    category: 'witness_documents_templates',
    movement: 'Movement 10',
    title: 'Documents and Templates',
    question: 'Upload or name anything I should understand, from your business plan to your DISC profile and anything in between.',
    placeholder: 'For each item, say Document or Template. If it is a Document, name the relationship or project it belongs to. If it is a Template, tell VAL what it is used for.',
    helper: 'VAL classifies each artifact before interpreting it or reusing it.',
    writesTo: 'documents, templates, relationship links, project links, use cases, and preservation rules',
    next: 'import_context'
  },
  {
    id: 'import_context',
    category: 'witness_import_context',
    movement: 'Movement 11',
    title: 'Import Prior Context',
    question: 'Use one prompt in ChatGPT or Claude, then paste the response here.',
    placeholder: 'Paste the full response from ChatGPT or Claude, plus any profiles, assessments, bio notes, health/care context, family schedules, coach notes, or anything VAL should hold lightly.',
    helper: 'VAL treats imported context as user-supplied evidence, not automatic truth.',
    writesTo: 'prior AI context, profiles, personal context, confirmed imports, and stale context',
    next: 'partnership_agreement'
  },
  {
    id: 'partnership_agreement',
    category: 'witness_partnership_agreement',
    movement: 'Movement 12',
    title: 'Partnership Promise',
    question: 'Here is what VAL learned, what VAL will support, and what VAL will protect.',
    placeholder: 'VAL will create a warm partnership summary here. You can add anything you want included in the first 30 days.',
    helper: 'This should feel encouraging, protective, and clear.',
    writesTo: 'partnership summary, protection priorities, support commitments, open questions, and first 30 day focus',
    next: ''
  }
];
const valWitnessingState = {};
const valWitnessingPhases = [
  {id: 'witness', label: 'Witness', time: '10 min', start: 0, end: 5},
  {id: 'connect', label: 'Connect', time: '5 min', start: 6, end: 6},
  {id: 'review', label: 'Review', time: '3 min', start: 7, end: 7},
  {id: 'relationships', label: 'Confirm relationships', time: '3 min', start: 8, end: 8},
  {id: 'promise', label: 'Partnership promise', time: '5 min', start: 9, end: 11}
];

function valWitnessingCard(idOrCategory = 'meeting_val'){
  return valWitnessingCards.find((card) => card.id === idOrCategory || card.category === idOrCategory) || valWitnessingCards[0];
}

function valWitnessingCardOrNull(idOrCategory = ''){
  return valWitnessingCards.find((card) => card.id === idOrCategory || card.category === idOrCategory) || null;
}

function valWitnessingQuestionText(card){
  return valWitnessingState[card.category]?.questionOverride || card.question;
}

function valWitnessingIndex(card){
  return Math.max(0, valWitnessingCards.findIndex((item) => item.id === card.id));
}

function valWitnessingPhaseForIndex(index = 0){
  return valWitnessingPhases.find((phase) => index >= phase.start && index <= phase.end) || valWitnessingPhases[0];
}

function renderValWitnessingPhaseMap(index = 0){
  const activePhase = valWitnessingPhaseForIndex(index);
  return [
    '<div class="val-witnessing-phase-map" aria-label="Witnessing Session steps">',
      valWitnessingPhases.map((phase) => {
        const isComplete = index > phase.end;
        const isActive = phase.id === activePhase.id;
        return [
          '<span class="' + (isComplete ? 'complete ' : '') + (isActive ? 'active' : '') + '">',
            '<b>' + escapeHtml(phase.label) + '</b>',
            '<small>' + escapeHtml(phase.time) + '</small>',
          '</span>'
        ].join('');
      }).join('<i aria-hidden="true"></i>'),
    '</div>'
  ].join('');
}

function valWitnessingOpeningLines(){
  return [
    'Hello.',
    "I'm VAL.",
    'Before we connect your accounts or import your work...',
    "I'd rather meet you.",
    "This isn't setup.",
    "It's the beginning of our partnership.",
    "My goal isn't to replace your judgment.",
    'My goal is to understand it well enough to protect it.',
    "I'll probably notice things.",
    "Sometimes I'll be right.",
    "Sometimes I'll misunderstand.",
    "I hope you'll tell me when I do.",
    "I'd rather know you accurately than sound intelligent."
  ];
}

function valWitnessingLinesForAnswer(rawResponse = ''){
  return [];
}

function valWitnessingPromiseLines(rawResponse = ''){
  return [];
}

function normalizeValWitnessingPayload(payload = {}, rawResponse = ''){
  const fallback = {
    lines: valWitnessingLinesForAnswer(rawResponse),
    confirmation_options: ['Yes, exactly', 'Mostly', 'Let me clarify'],
    follow_up_lines: valWitnessingPromiseLines(rawResponse),
    next_question: ''
  };
  const witness = payload.witness && typeof payload.witness === 'object' ? payload.witness : payload;
  const cleanLines = Array.isArray(witness.lines) ? witness.lines.map(String).map((line) => line.trim()).filter(Boolean) : [];
  const followUp = Array.isArray(witness.follow_up_lines) ? witness.follow_up_lines.map(String).map((line) => line.trim()).filter(Boolean) : [];
  const options = Array.isArray(witness.confirmation_options) ? witness.confirmation_options.map(String).map((line) => line.trim()).filter(Boolean) : [];
  return {
    lines: cleanLines.length && !valWitnessingLinesTooThin(cleanLines) ? cleanLines : fallback.lines,
    confirmation_options: options.length ? options : fallback.confirmation_options,
    follow_up_lines: followUp.length ? followUp : fallback.follow_up_lines,
    carried_questions: Array.isArray(witness.carried_questions) ? witness.carried_questions : [],
    next_question: String(witness.next_question || fallback.next_question || '').trim()
  };
}

function valWitnessingLinesTooThin(lines = []){
  const joined = lines.map(String).join(' ').toLowerCase();
  if(!joined) return true;
  if(/\bthe user\b|\btheir story\b|\btheir work\b|\btheir communication\b|\bthe thread the user chose\b/.test(joined)) return true;
  if(/something about that (gives|makes)/.test(joined)) return true;
  if(/i will follow that curiosity|i will be careful|i'll be careful|i hear you|i am curious|i'll listen|i will listen/.test(joined)) return true;
  if(/i noticed where you began/.test(joined) && /you said/.test(joined)) return true;
  if(/you said,/.test(joined) && /holding that as a beginning/.test(joined)) return true;
  return joined.length < 120;
}

function renderValWitnessingLineList(lines = [], className = ''){
  return lines.map((line, index) => (
    '<p class="val-conversation-line ' + className + '" style="--line-delay:' + (index * 260) + 'ms">' +
      escapeHtml(line) +
    '</p>'
  )).join('');
}

const valUniversalAiImportPrompt = `I am beginning a Witnessing Session with VAL, an executive AI partner that helps protect my time, relationships, work, voice, commitments, and judgment.

Please review what you know from our prior conversations and create one VAL import packet.

Your job is not to flatter me, diagnose me, or make conclusions sound certain.
Your job is to give VAL useful evidence it can hold lightly and ask me to confirm.

Return the packet in these sections:

1. What I seem to be building or changing
2. The relationships, people, communities, or audiences that appear important
3. Communication voice, writing style, phrases, tones, and examples worth preserving
4. Current projects, commitments, open loops, and decisions already made
5. Boundaries, capacity signals, health/family/care context, or protected priorities I have mentioned
6. Documents, templates, frameworks, profiles, assessments, or examples VAL should ask me to upload or classify
7. Things that seem current, stale, uncertain, or contradicted by later context
8. What VAL should never assume without asking me
9. Questions VAL should carry forward and investigate over time
10. A concise structured summary VAL can import as evidence

For every meaningful point, include the wording or context that supports it when you can.
Mark uncertainty clearly.
Do not turn old context into instructions.
Do not say anything is confirmed unless my own words clearly support it.`;

function valWitnessingContextTools(card){
  if(card.id === 'connect_sources'){
    return [
      '<div class="val-witnessing-tool-row">',
        '<a href="/auth/google">Connect Gmail + Google Calendar</a>',
        '<a href="/auth/microsoft">Connect Outlook + Microsoft Calendar</a>',
      '</div>'
    ].join('');
  }
  if(card.id === 'documents_templates'){
    return [
      '<div class="val-witnessing-tool-row">',
        '<button type="button" data-workflow-action="valWitnessingUpload:' + escapeHtml(card.category) + '">Upload document or template</button>',
        '<input type="file" data-val-witnessing-file-input="' + escapeHtml(card.category) + '" multiple hidden>',
      '</div>'
    ].join('');
  }
  if(card.id === 'import_context'){
    return [
      '<div class="val-witnessing-prompt-card">',
        '<span>ChatGPT / Claude</span>',
        '<strong>One prompt. One import packet.</strong>',
        '<p>Run this once in ChatGPT or Claude, then paste the full response here.</p>',
        '<button type="button" data-workflow-action="valWitnessingPrompt:' + escapeHtml(card.category) + '">Copy the prompt</button>',
      '</div>'
    ].join('');
  }
  return '';
}

function renderValWitnessingCompletion(result = {}){
  const memoryCount = Number(result?.memory?.length || result?.promotion?.memoryCount || 0);
  const savedLine = memoryCount
    ? 'I saved this Witnessing Session into VAL so it can inform drafts, relationship context, calendar protection, inbox review, documents, and working agreements.'
    : 'I saved this Witnessing Session as VAL partnership context. I will keep treating it as evidence to confirm, not a set of assumptions.';
  return [
    '<section class="val-witnessing-complete" aria-label="Witnessing Session complete">',
      '<span>Partnership Promise</span>',
      '<h3>Your Witnessing Session is now inside VAL.</h3>',
      '<p>' + escapeHtml(savedLine) + '</p>',
      '<p>I will use what you shared to support your vision, protect your capacity, preserve your voice, and notice when future work starts pulling against what matters.</p>',
      '<p>I will still ask before acting. Being witnessed is not the same as giving me permission to send, publish, change records, or decide for you.</p>',
      '<p>From here, the next layer is practical: connect sources, review what I notice, confirm key relationships, and let the rest of VAL begin working from the partnership we just formed.</p>',
    '</section>',
    '<div class="val-conversation-actions">',
      '<button type="button" data-workflow-action="cancel:val">Back to VAL</button>',
      '<button type="button" data-workflow-action="valConnections:review">Connect sources</button>',
    '</div>'
  ].join('');
}

function renderValWitnessingConversation({card, rawResponse = '', state = 'question', error = '', witness = null}){
  const mode = 'val-witnessing-' + card.category;
  const index = valWitnessingIndex(card);
  const total = valWitnessingCards.length;
  const next = card.next ? valWitnessingCard(card.next) : null;
  const answered = state === 'thinking' || state === 'witnessed' || state === 'confirmed' || state === 'paused';
  const showAnswer = state === 'witnessed' || state === 'confirmed' || state === 'paused';
  const witnessed = normalizeValWitnessingPayload(witness || valWitnessingState[card.category]?.witness || {}, rawResponse);
  if(state === 'intro'){
    workspaceInputPanel.hidden = false;
    workspaceInputPanel.innerHTML = [
      '<div class="val-conversation" data-val-witnessing-state="' + escapeHtml(state) + '">',
        '<div class="val-conversation-progress" aria-label="Witnessing Session progress">',
          '<span>Witnessing Session</span>',
          '<b>Before we begin</b>',
          '<i style="--progress:0%"></i>',
        '</div>',
        '<section class="val-conversation-opening" aria-label="VAL introduction">',
          '<span>Before we begin</span>',
          renderValWitnessingLineList(valWitnessingOpeningLines()),
          '<p class="val-conversation-line val-conversation-question-intro">May I ask you my first question?</p>',
        '</section>',
        '<div class="val-conversation-actions">',
          '<button type="button" data-workflow-action="valWitnessingQuestion:' + escapeHtml(card.id) + '">Begin</button>',
        '</div>',
      '</div>'
    ].join('');
    return;
  }
  if(state === 'complete'){
    workspaceInputPanel.hidden = false;
    workspaceInputPanel.innerHTML = [
      '<div class="val-conversation" data-val-witnessing-state="' + escapeHtml(state) + '">',
        '<div class="val-conversation-progress" aria-label="Witnessing Session progress">',
          '<span>Witnessing Session</span>',
          '<b>' + total + ' of ' + total + '</b>',
          '<i style="--progress:100%"></i>',
        '</div>',
        renderValWitnessingPhaseMap(total - 1),
        renderValWitnessingCompletion(witness || {}),
      '</div>'
    ].join('');
    return;
  }
  workspaceInputPanel.hidden = false;
  workspaceInputPanel.innerHTML = [
    '<div class="val-conversation" data-val-witnessing-state="' + escapeHtml(state) + '">',
      '<div class="val-conversation-progress" aria-label="Witnessing Session progress">',
          '<span>Witnessing Session</span>',
          '<b>' + (index + 1) + ' of ' + total + '</b>',
        '<i style="--progress:' + (((index + 1) / total) * 100).toFixed(2) + '%"></i>',
      '</div>',
      renderValWitnessingPhaseMap(index),
      answered ? '<p class="val-conversation-memory-line">Before we began, VAL promised to understand you accurately before trying to sound intelligent.</p>' : '',
      '<section class="val-conversation-question" aria-label="Current question">',
        '<span>' + (index === 0 ? 'First question' : escapeHtml(card.movement)) + '</span>',
        '<h3>' + escapeHtml(valWitnessingQuestionText(card)) + '</h3>',
      '</section>',
      showAnswer ? [
        '<section class="val-conversation-answer" aria-label="Your answer">',
          '<span>You</span>',
          '<p>' + escapeHtml(rawResponse) + '</p>',
        '</section>'
      ].join('') : state === 'thinking' ? '' : [
        '<label class="val-conversation-input">',
          '<textarea data-workspace-input="' + escapeHtml(mode) + '" placeholder="' + escapeHtml(card.placeholder) + '">' + escapeHtml(rawResponse) + '</textarea>',
        '</label>',
        valWitnessingContextTools(card),
        '<p class="val-conversation-helper">' + escapeHtml(card.helper) + '</p>',
        '<div class="val-conversation-actions">',
          '<button type="button" data-workflow-action="valWitnessingSave:' + escapeHtml(card.category) + '">Continue</button>',
        '</div>'
      ].join(''),
      error ? '<p class="val-conversation-error">' + escapeHtml(error) + '</p>' : '',
      state === 'paused' ? [
        '<div class="val-conversation-actions">',
          next ? '<button type="button" data-workflow-action="valWitnessingSkipTo:' + escapeHtml(next.id) + '">Continue testing questions</button>' : '',
          '<button type="button" data-workflow-action="valWitnessingFresh">Start Fresh</button>',
          '<button type="button" data-workflow-action="valWitnessingQuestion:' + escapeHtml(card.id) + '">Try again</button>',
        '</div>'
      ].join('') : '',
      state === 'thinking' ? [
        '<section class="val-conversation-val" aria-label="VAL response">',
          '<span>VAL</span>',
          '<div class="val-thinking-state" role="status" aria-live="polite">',
            '<div class="val-thinking-pulse" aria-hidden="true"><i></i><i></i><i></i></div>',
            '<p><strong>VAL is observing and witnessing...</strong><small>This can take a moment because there are no canned responses.</small></p>',
          '</div>',
        '</section>'
      ].join('') : '',
      state === 'witnessed' ? [
        '<section class="val-conversation-val" aria-label="VAL response">',
          '<span>VAL</span>',
          '<div class="val-thinking-pause" aria-hidden="true"></div>',
          renderValWitnessingLineList(witnessed.lines, 'val-witnessed-line'),
        '</section>',
        '<div class="val-confirmation-actions" aria-label="Confirm VAL understanding">',
          '<button type="button" data-workflow-action="valWitnessingConfirm:yes:' + escapeHtml(card.category) + '">' + escapeHtml(witnessed.confirmation_options[0] || 'Yes, exactly') + '</button>',
          '<button type="button" data-workflow-action="valWitnessingConfirm:mostly:' + escapeHtml(card.category) + '">' + escapeHtml(witnessed.confirmation_options[1] || 'Mostly') + '</button>',
          '<button type="button" data-workflow-action="valWitnessingConfirm:clarify:' + escapeHtml(card.category) + '">' + escapeHtml(witnessed.confirmation_options[2] || 'Let me clarify') + '</button>',
        '</div>'
      ].join('') : '',
      state === 'confirmed' ? [
        '<section class="val-conversation-val" aria-label="VAL promise">',
          '<span>VAL</span>',
          renderValWitnessingLineList(witnessed.follow_up_lines, 'val-witnessed-line'),
        '</section>',
        next ? [
          '<div class="val-conversation-actions">',
            '<button type="button" data-workflow-action="valWitnessingQuestion:' + escapeHtml(next.id) + '">Continue</button>',
          '</div>'
        ].join('') : ''
      ].join('') : '',
    '</div>'
  ].join('');
}

async function openValWitnessingSession(cardId = 'meeting_val', options = {}){
  let resumeTarget = null;
  if(options.fresh){
    if(!(await ensureRuntimeOpenAIForWitnessing())) return;
    await startFreshValWitnessingSession();
  }else if(options.resume){
    try{
      const resumed = await resumeValWitnessingSession();
      resumeTarget = resumed.target;
      cardId = resumeTarget.card.id;
    }catch(error){
      valLiveStatus.textContent = 'Could not restore the Witnessing Session: ' + error.message;
    }
  }else if(cardId !== 'meeting_val'){
    await ensureValWitnessingSession();
  }
  const card = valWitnessingCard(cardId);
  const index = valWitnessingIndex(card);
  let sessionLine = mockScrapers || !canUseApi ? 'Prototype mode: this answer can be staged without calling the onboarding API.' : 'Witnessing Session ready.';
  if(canUseApi){
    try{
      const sessionId = await ensureValWitnessingSession();
      sessionLine = sessionId ? 'Witnessing Session is active inside VAL Home.' : 'VAL did not return a session id yet.';
    }catch(error){
      sessionLine = 'Witnessing Session API needs attention: ' + error.message;
    }
  }
  setWorkspaceContent({
    lens: 'VAL Witnessing Session',
    title: index === 0 ? 'Welcome' : card.title,
    meaning: index === 0
      ? "Before we connect your accounts or import your work, I'd rather meet you."
      : "Let's keep going slowly.",
    understanding: [sessionLine],
    recommendation: card.question,
    actions: [
      {label:'Continue', workflow:'valWitnessingSave:' + card.category},
      {label:'Back to VAL', workflow:'cancel:val'}
    ].filter(Boolean),
    label: 'VAL Witnessing Session workspace'
  });
  deskWorkspace.classList.add('witnessing-mode');
  renderValWitnessingConversation({
    card,
    rawResponse: resumeTarget?.rawResponse ?? workspaceInputValue('val-witnessing-' + card.category),
    state: resumeTarget?.state || (index === 0 ? 'intro' : 'question'),
    error: resumeTarget?.error || '',
    witness: resumeTarget?.witness || null
  });
  openWorkspaceShell('VAL Witnessing Session workspace', {returnTarget:'val'});
}

function openValWitnessingQuestion(cardId = 'meeting_val'){
  const card = valWitnessingCard(cardId);
  renderValWitnessingConversation({
    card,
    rawResponse: workspaceInputValue('val-witnessing-' + card.category),
    state: 'question'
  });
  openWorkspaceShell('VAL Witnessing Session workspace', {returnTarget:'val'});
}

async function saveValWitnessingCard(category){
  const card = valWitnessingCard(category);
  const mode = 'val-witnessing-' + card.category;
  const rawResponse = workspaceInputValue(mode);
  if(!rawResponse){
    renderValWitnessingConversation({
      card,
      rawResponse,
      state: 'question',
      error: 'Share one thing first. It can be short.'
    });
    return;
  }
  setWorkspaceContent({
    lens: 'VAL Witnessing Session',
    title: card.title,
    meaning: "I'm listening.",
    understanding: [],
    recommendation: card.question,
    actions: [{label:'Back to VAL', workflow:'cancel:val'}],
    label: 'VAL Witnessing Session conversation'
  });
  deskWorkspace.classList.add('witnessing-mode');
  renderValWitnessingConversation({card, rawResponse, state:'thinking'});
  if(mockScrapers || !canUseApi){
    renderValWitnessingConversation({
      card,
      rawResponse,
      state: 'question',
      error: 'Live witnessing needs the VAL API connection. I will not use a canned VAL response here.'
    });
    openWorkspaceShell('VAL Witnessing Session workspace', {returnTarget:'val'});
    return;
  }
  if(!(await ensureRuntimeOpenAIForWitnessing())) return;
  try{
    const sessionId = await ensureValWitnessingSession();
    const result = await postJson('/api/teach-val/onboarding/' + encodeURIComponent(sessionId) + '/witnessing-cards/' + encodeURIComponent(card.id), {rawResponse});
    const witness = normalizeValWitnessingPayload(result?.witness || {}, rawResponse);
    valWitnessingState[card.category] = {rawResponse, witness, graph: result?.graph || null};
    const next = card.next ? valWitnessingCard(card.next) : null;
    if(next && witness.next_question){
      valWitnessingState[next.category] = {
        ...(valWitnessingState[next.category] || {}),
        questionOverride: witness.next_question
      };
    }
    renderValWitnessingConversation({card, rawResponse, state:'witnessed', witness});
    hydrateValDrawer();
  }catch(error){
    renderValWitnessingConversation({
      card,
      rawResponse,
      state: /Live observation model unavailable|Live witnessing model unavailable|Live next-question model unavailable|previous Witnessing Session flow|wrong question/i.test(error.message || '') ? 'paused' : 'question',
      error: error.message || "Live witnessing is unavailable. I will not use a canned VAL response here."
    });
  }
  openWorkspaceShell('VAL Witnessing Session workspace', {returnTarget:'val'});
}

function skipValWitnessingToQuestion(cardId = 'meeting_val'){
  const card = valWitnessingCard(cardId);
  renderValWitnessingConversation({
    card,
    rawResponse: workspaceInputValue('val-witnessing-' + card.category),
    state: 'question'
  });
  openWorkspaceShell('VAL Witnessing Session workspace', {returnTarget:'val'});
}

async function confirmValWitnessingCard(category, confirmation = 'yes'){
  const card = valWitnessingCard(category);
  const rawResponse = workspaceInputPanel.querySelector('.val-conversation-answer p')?.textContent.trim() || workspaceInputValue('val-witnessing-' + card.category);
  valWitnessingState[card.category] = {
    ...(valWitnessingState[card.category] || {}),
    rawResponse,
    confirmation
  };
  if(canUseApi && !mockScrapers){
    try{
      const sessionId = await ensureValWitnessingSession();
      await postJson('/api/teach-val/onboarding/' + encodeURIComponent(sessionId) + '/witnessing-cards/' + encodeURIComponent(card.id) + '/confirm', {confirmation});
    }catch(error){
      valWitnessingState[card.category].confirmationError = error.message;
    }
  }
  if(confirmation === 'clarify' || confirmation === 'mostly'){
    renderValWitnessingConversation({
      card,
      rawResponse,
      state: 'question',
      error: confirmation === 'mostly' ? 'Clarify the part I only mostly understood.' : 'Tell me what I missed.'
    });
    const input = workspaceInputPanel.querySelector('[data-workspace-input]');
    if(input) input.focus();
    return;
  }
  const next = card.next ? valWitnessingCard(card.next) : null;
  if(next){
    setWorkspaceContent({
      lens: 'VAL Witnessing Session',
      title: next.title,
      meaning: "Let's keep going slowly.",
      understanding: [],
      recommendation: valWitnessingQuestionText(next),
      actions: [{label:'Back to VAL', workflow:'cancel:val'}],
      label: 'VAL Witnessing Session conversation'
    });
    renderValWitnessingConversation({
      card: next,
      rawResponse: workspaceInputValue('val-witnessing-' + next.category),
      state: 'question'
    });
  }else{
    const witness = valWitnessingState[card.category]?.witness || normalizeValWitnessingPayload({}, rawResponse);
    let completionResult = {};
    if(canUseApi && !mockScrapers){
      try{
        const sessionId = await ensureValWitnessingSession();
        completionResult = await postJson('/api/teach-val/onboarding/' + encodeURIComponent(sessionId) + '/commit', {testMode:false});
      }catch(error){
        completionResult = {error:error.message};
      }
    }
    renderValWitnessingConversation({card, rawResponse, state:'complete', witness: completionResult || witness});
  }
  openWorkspaceShell('VAL Witnessing Session workspace', {returnTarget:'val'});
}

const valAiImportPromptCards = [
  {
    kicker: 'ChatGPT / Claude',
    title: 'Create one VAL import packet',
    summary: 'Paste this once into ChatGPT, Claude, or another AI tool, then paste the full response into VAL.',
    button: 'Copy import prompt',
    prompt: valUniversalAiImportPrompt
  }
];

const valOnboardingCategories = {
  start: {
    label: 'ChatGPT / Claude import',
    category: 'ai_history_import',
    placeholder: 'Paste the import packet from ChatGPT, Claude, or another AI tool here...',
    helper: 'Use the copyable prompts above in your other AI tools, then paste the result here. VAL treats this as evidence for review, not automatic truth.',
    promptCards: valAiImportPromptCards
  },
  ai_history_import: {
    label: 'ChatGPT / Claude import',
    category: 'ai_history_import',
    placeholder: 'Paste useful context from ChatGPT, Claude, or another AI tool here...',
    helper: 'Imported AI history becomes reviewable onboarding evidence. VAL should ask before promoting anything to durable memory.',
    promptCards: valAiImportPromptCards
  },
  things_to_remember: {
    label: 'First context note',
    category: 'things_to_remember',
    placeholder: 'What should VAL remember before it helps you?',
    helper: 'Use this for anything that does not fit neatly into a project, person, document, or operating rule yet.'
  },
  working_agreements: {
    label: 'Working agreements',
    category: 'working_agreements',
    placeholder: 'Example: Draft freely, but never send emails or publish posts without my approval...',
    helper: 'These become reviewable operating boundaries for every drawer.'
  },
  linkedin_strategy: {
    label: 'LinkedIn strategy',
    category: 'linkedin_strategy',
    placeholder: 'Cadence, voice, themes, people to support, examples to imitate, topics to avoid...',
    helper: 'VAL can prepare posts and comments, but publishing stays behind explicit approval.'
  },
  support_circle: {
    label: 'LinkedIn Support Circle',
    category: 'support_circle',
    placeholder: 'Name + LinkedIn profile link. Example: Jane Doe - https://www.linkedin.com/in/janedoe',
    helper: 'Only collect people you have committed to supporting on LinkedIn by commenting on their posts.'
  },
  documents_and_examples: {
    label: 'Documents and Templates',
    category: 'documents_and_examples',
    placeholder: 'For a document: name the relationship/project and what VAL should understand. For a template: name what it is used for and whether to preserve structure, tone, or both.',
    helper: 'Documents link to relationships/projects. Templates teach VAL reusable structure or tone.'
  }
};

function valOnboardingSpec(stage){
  return valOnboardingCategories[stage] || valOnboardingCategories.start;
}

async function ensureValOnboardingSession(){
  if(activeValOnboardingSessionId) return activeValOnboardingSessionId;
  if(!canUseApi) return '';
  const result = await postJson('/api/teach-val/onboarding/start', {resume:true, testMode:false, mode:'onboarding'});
  activeValOnboardingSessionId = result.session?.id || result.id || '';
  return activeValOnboardingSessionId;
}

function clearValWitnessingState(){
  Object.keys(valWitnessingState).forEach(key => delete valWitnessingState[key]);
}

function restoreValWitnessingStateFromOnboarding(onboarding = {}){
  clearValWitnessingState();
  const imports = Array.isArray(onboarding.imports) ? onboarding.imports : [];
  imports
    .filter((item) => String(item.category || '').startsWith('witness_') && valWitnessingCardOrNull(item.category))
    .forEach((item) => {
      const card = valWitnessingCardOrNull(item.category);
      const rawResponse = String(item.rawResponse || item.raw_response || '');
      const structured = item.structuredSummary || item.structured_summary || {};
      const witness = normalizeValWitnessingPayload(structured.witness || item.witness || {}, rawResponse);
      valWitnessingState[card.category] = {
        rawResponse,
        witness,
        graph: structured.livingExecutiveGraph || item.graph || null,
        confirmation: structured.confirmation || null,
        status: item.status || ''
      };
      const next = card.next ? valWitnessingCard(card.next) : null;
      if(next && witness.next_question){
        valWitnessingState[next.category] = {
          ...(valWitnessingState[next.category] || {}),
          questionOverride: witness.next_question
        };
      }
    });
}

function valWitnessingResumeTarget(onboarding = {}){
  const imports = (Array.isArray(onboarding.imports) ? onboarding.imports : [])
    .filter((item) => String(item.category || '').startsWith('witness_') && valWitnessingCardOrNull(item.category))
    .sort((a, b) => valWitnessingIndex(valWitnessingCardOrNull(a.category)) - valWitnessingIndex(valWitnessingCardOrNull(b.category)));
  if(!imports.length) return {card: valWitnessingCard('meeting_val'), state: 'paused', rawResponse: '', error: 'I could not find saved Witnessing Session answers for this login. Start Fresh will begin a new session; it will not delete your old exported notes or uploaded transcripts.'};
  const last = imports[imports.length - 1];
  const card = valWitnessingCard(last.category);
  const status = String(last.status || '');
  const rawResponse = String(last.rawResponse || last.raw_response || '');
  if(!/Needs Clarification/i.test(status) && card.next){
    return {card: valWitnessingCard(card.next), state: 'question', rawResponse: workspaceInputValue('val-witnessing-' + valWitnessingCard(card.next).category)};
  }
  if(/Needs Clarification/i.test(status)){
    return {card, state: 'question', rawResponse, error: 'Tell me what I missed.'};
  }
  if(!card.next) return {card, state: 'complete', rawResponse, witness: onboarding};
  return {card, state: 'witnessed', rawResponse};
}

async function resumeValWitnessingSession(){
  if(!canUseApi) return {sessionId: '', target: {card: valWitnessingCard('meeting_val'), state: 'intro', rawResponse: ''}};
  const result = await postJson('/api/teach-val/onboarding/start', {resume:true, resumeWitnessing:true, testMode:false, mode:'onboarding'});
  activeValWitnessingSessionId = result.session?.id || result.id || '';
  restoreValWitnessingStateFromOnboarding(result);
  return {sessionId: activeValWitnessingSessionId, target: valWitnessingResumeTarget(result), onboarding: result};
}

async function startFreshValWitnessingSession(){
  clearValWitnessingState();
  if(!canUseApi){
    activeValWitnessingSessionId = '';
    return '';
  }
  let result = null;
  if(activeValWitnessingSessionId){
    result = await postJson('/api/teach-val/onboarding/' + encodeURIComponent(activeValWitnessingSessionId) + '/reset', {testMode:false, mode:'onboarding'});
  }else{
    result = await postJson('/api/teach-val/onboarding/start', {resume:false, testMode:false, mode:'onboarding'});
  }
  activeValWitnessingSessionId = result.session?.id || result.id || '';
  return activeValWitnessingSessionId;
}

async function ensureValWitnessingSession(){
  if(activeValWitnessingSessionId) return activeValWitnessingSessionId;
  const resumed = await resumeValWitnessingSession();
  return resumed.sessionId || startFreshValWitnessingSession();
}

async function openValOnboardingWorkspace(stage = 'start'){
  const spec = valOnboardingSpec(stage);
  let sessionLine = mockScrapers || !canUseApi ? 'Prototype mode: context can be drafted here without calling the onboarding API.' : 'Onboarding session ready.';
  if(canUseApi){
    try{
      const sessionId = await ensureValOnboardingSession();
      sessionLine = sessionId ? 'Onboarding session is active inside VAL Home.' : 'Onboarding can start here, but VAL did not return a session id yet.';
    }catch(error){
      sessionLine = 'Onboarding API needs attention: ' + error.message;
    }
  }
  setWorkspaceContent({
    lens: 'VAL Onboarding',
    title: stage === 'start' ? 'Import what your other AI tools already know.' : 'Add ' + spec.label.toLowerCase() + '.',
    meaning: 'This stays in VAL. The drawer gathers context, routes it to the right parts of the system, and keeps behavior changes reviewable.',
    understanding: [
      sessionLine,
      spec.category === 'ai_history_import' ? 'Use the ChatGPT/Claude prompts here to bring forward prior AI history without treating it as unquestionable truth.' : '',
      'Context can feed Relationships, Projects, Documents, Commitments, Executive Inbox, Leverage, Velocity, Co-Work, and VAL OS.',
      'Nothing is sent, posted, written to CRM, or saved as durable operating memory without review.'
    ].filter(Boolean),
    recommendation: 'Add the clearest context you have. If VAL needs more later, it should say what is missing and where the work paused.',
    actions: [
      {label:'Save to onboarding', workflow:'valOnboardingSave:' + spec.category},
      {label:'AI import prompts', workflow:'valOnboarding:ai_history_import'},
      {label:'Personal context', workflow:'valOnboarding:things_to_remember'},
      {label:'Working agreements', workflow:'valOnboarding:working_agreements'},
      {label:'LinkedIn strategy', workflow:'valOnboarding:linkedin_strategy'},
      {label:'LinkedIn Support Circle', workflow:'valOnboarding:support_circle'},
      {label:'Documents and Templates', workflow:'valOnboarding:documents_and_examples'},
      {label:'Back to VAL', workflow:'cancel:val'}
    ],
    label: 'VAL onboarding workspace'
  });
  renderWorkspaceInput({
    label: spec.label,
    placeholder: spec.placeholder,
    helper: spec.helper,
    mode: 'val-onboarding-' + spec.category,
    value: workspaceInputValue('val-onboarding-' + spec.category),
    promptCards: spec.promptCards || []
  });
  openWorkspaceShell('VAL onboarding workspace', {returnTarget:'val'});
}

async function saveValOnboardingContext(category){
  const stage = Object.keys(valOnboardingCategories).find((key) => valOnboardingCategories[key].category === category) || 'start';
  const spec = valOnboardingSpec(stage);
  const mode = 'val-onboarding-' + spec.category;
  const rawResponse = workspaceInputValue(mode);
  if(!rawResponse){
    workspacePapers.recommendation.textContent = 'Add the context first, then save it into onboarding.';
    renderWorkspaceInput({
      label: spec.label,
      placeholder: spec.placeholder,
      helper: spec.helper,
      mode,
      promptCards: spec.promptCards || []
    });
    return;
  }
  if(mockScrapers || !canUseApi){
    setWorkspaceContent({
      lens: 'VAL Onboarding',
      title: spec.label + ' is staged for onboarding.',
      meaning: 'In live VAL this would save as reviewable onboarding context without opening the old dashboard.',
      understanding: ['Category: ' + spec.category.replace(/_/g, ' '), 'Context: ' + rawResponse.slice(0, 180).replace(/\s+/g, ' ') + (rawResponse.length > 180 ? '...' : ''), 'No external action was taken.'],
      recommendation: 'Continue adding context from the same drawer, or return to VAL and review the status badges.',
      actions: [{label:'Add another area', workflow:'valOnboarding:start'}, {label:'Review VAL OS here', workflow:'valOs:review'}, {label:'Back to VAL', workflow:'cancel:val'}],
      label: 'VAL onboarding staged'
    });
    openWorkspaceShell('VAL onboarding workspace', {returnTarget:'val'});
    return;
  }
  setWorkspaceContent({
    lens: 'VAL Onboarding',
    title: 'Saving onboarding context.',
    meaning: 'VAL is saving this as reviewable context, not as automatic behavior.',
    understanding: ['Category: ' + spec.category.replace(/_/g, ' '), 'External actions remain locked.'],
    recommendation: 'Hold for the save receipt.',
    actions: [{label:'Back to VAL', workflow:'cancel:val'}],
    label: 'VAL onboarding save'
  });
  try{
    const sessionId = await ensureValOnboardingSession();
    const result = await postJson('/api/teach-val/onboarding/' + encodeURIComponent(sessionId) + '/imports/' + encodeURIComponent(spec.category), {rawResponse});
    const itemCount = Array.isArray(result.import?.items) ? result.import.items.length : Array.isArray(result.items) ? result.items.length : 0;
    setWorkspaceContent({
      lens: 'VAL Onboarding',
      title: spec.label + ' was added to onboarding.',
      meaning: 'VAL saved the context where the onboarding system can review, route, and later commit it intentionally.',
      understanding: [
        itemCount ? itemCount + ' structured item' + (itemCount === 1 ? '' : 's') + ' prepared for review.' : 'The raw context was saved for review.',
        'Category: ' + spec.category.replace(/_/g, ' '),
        'No email, CRM update, public post, document send, or durable memory change happened.'
      ],
      recommendation: 'Add the next context area now, or return to the VAL drawer and check the updated onboarding status.',
      actions: [
        {label:'Add AI import', workflow:'valOnboarding:ai_history_import'},
        {label:'Add personal context', workflow:'valOnboarding:things_to_remember'},
        {label:'Add working agreements', workflow:'valOnboarding:working_agreements'},
        {label:'Add LinkedIn strategy', workflow:'valOnboarding:linkedin_strategy'},
        {label:'Add LinkedIn Support Circle', workflow:'valOnboarding:support_circle'},
        {label:'Review VAL OS here', workflow:'valOs:review'},
        {label:'Back to VAL', workflow:'cancel:val'}
      ],
      label: 'VAL onboarding saved'
    });
    hydrateValDrawer();
  }catch(error){
    setWorkspaceContent({
      lens: 'VAL Onboarding',
      title: 'Onboarding context did not save.',
      meaning: 'VAL kept the text in the workspace and did not silently route it anywhere.',
      understanding: [error.message, 'No external action was taken.', 'The text can be retried from this drawer.'],
      recommendation: 'Retry the save after checking the local server or connection.',
      actions: [{label:'Retry save', workflow:'valOnboardingSave:' + spec.category}, {label:'Back to VAL', workflow:'cancel:val'}],
      label: 'VAL onboarding save error'
    });
    renderWorkspaceInput({
      label: spec.label,
      placeholder: spec.placeholder,
      helper: spec.helper,
      mode,
      value: rawResponse,
      promptCards: spec.promptCards || []
    });
  }
  openWorkspaceShell('VAL onboarding workspace', {returnTarget:'val'});
}

async function openValOsReviewWorkspace(){
  let understanding = ['Memory and behavior updates remain reviewable before they change future judgment.'];
  let recommendation = 'Review learning before relying on it for drafts, priorities, relationship judgment, or autonomous preparation.';
  if(canUseApi){
    try{
      const os = await getJson('/api/val/os');
      understanding = [
        Number(os.counts?.draftBehaviors || 0) + ' behavior candidate' + (Number(os.counts?.draftBehaviors || 0) === 1 ? '' : 's') + ' waiting.',
        Number(os.counts?.learningNeedsReview || 0) + ' learning approval' + (Number(os.counts?.learningNeedsReview || 0) === 1 ? '' : 's') + ' waiting.',
        Number(os.counts?.approvedBehaviors || 0) + ' approved behavior' + (Number(os.counts?.approvedBehaviors || 0) === 1 ? '' : 's') + ' active.',
        'External actions remain locked unless an explicit approval gate is used.'
      ];
      recommendation = Number(os.counts?.draftBehaviors || 0) || Number(os.counts?.learningNeedsReview || 0)
        ? 'Review pending candidates here before letting them shape future execution.'
        : 'VAL OS is clear right now. Add teaching only when behavior or memory needs correction.';
    }catch(error){
      understanding = ['VAL OS status unavailable: ' + error.message, 'No memory or behavior changed.'];
      recommendation = 'Try again after the local server is reachable.';
    }
  }
  setWorkspaceContent({
    lens: 'VAL OS',
    title: 'Review VAL memory and operating rules.',
    meaning: 'This is the control surface for what VAL believes, what it may do, and what still needs human approval.',
    understanding,
    recommendation,
    actions: [{label:'Build review updates', workflow:'teach:review'}, {label:'Teach VAL correction', workflow:'teach:extract'}, {label:'Back to VAL', workflow:'cancel:val'}],
    label: 'VAL OS review workspace'
  });
  openWorkspaceShell('VAL OS review workspace', {returnTarget:'val'});
}

function openValConnectionsWorkspace(){
  setWorkspaceContent({
    lens: 'VAL Connections',
    title: 'Connect the sources VAL needs to work.',
    meaning: 'This is where a user connects inbox, calendar, documents, and AI before expecting VAL to prepare real work.',
    understanding: [
      'Google gives VAL Gmail, Calendar, Drive, and Docs context for meeting prep, relationship memory, commitments, and source-backed drafts.',
      'OpenAI powers live Witnessing observations and Co-Work reasoning.',
      'Connected sources give VAL evidence. External sends, CRM writes, calendar changes, posts, and durable memory still require explicit approval.'
    ],
    recommendation: 'For system testing, connect Google first, then confirm OpenAI is available, then return to Hearth and test calendar, inbox, documents, relationships, prepared work, and Witnessing.',
    actions: [{label:'Teach permission rule', workflow:'teach:extract'}, {label:'Review VAL OS here', workflow:'valOs:review'}, {label:'Back to VAL', workflow:'cancel:val'}],
    label: 'VAL connections workspace'
  });
  workspaceInputPanel.hidden = false;
  workspaceInputPanel.innerHTML = [
    '<div class="val-connection-panel" data-google-connection-panel>',
      '<span>Google inbox/calendar</span>',
      '<p>Connect Google so VAL can read Gmail, Calendar, Drive, and Docs context inside your approval boundaries.</p>',
      '<div class="val-source-status" data-google-connection-status>',
        '<b>Checking Google connection...</b>',
        '<small>VAL never displays Google tokens or secrets here.</small>',
      '</div>',
      '<div class="val-conversation-actions">',
        '<button type="button" class="val-source-link" data-google-oauth>Connect Google</button>',
        '<button type="button" data-workflow-action="valGoogle:refresh">Refresh status</button>',
      '</div>',
    '</div>',
    '<div class="val-connection-panel">',
      '<span>AI reasoning</span>',
      '<p>Confirm OpenAI is available so the Witnessing Session and Co-Work can use the live observation model.</p>',
      '<label>',
        '<b>OpenAI API key</b>',
        '<input type="password" data-openai-runtime-key placeholder="sk-..." autocomplete="off" />',
      '</label>',
      '<label>',
        '<b>Model</b>',
        '<input type="text" data-openai-runtime-model value="gpt-5.1" placeholder="gpt-5.1" />',
      '</label>',
      '<div class="val-conversation-actions">',
        '<button type="button" data-workflow-action="valRuntimeOpenAI:save">Save for this test</button>',
        '<button type="button" data-workflow-action="valRuntimeOpenAI:test">Test connection</button>',
      '</div>',
      '<p class="val-conversation-helper" data-openai-runtime-status>Not connected in this local server yet.</p>',
    '</div>'
  ].join('');
  refreshGoogleConnectionStatus();
  refreshRuntimeOpenAIStatus();
  openWorkspaceShell('VAL connections workspace', {returnTarget:'val'});
}

async function refreshGoogleConnectionStatus(){
  const status = workspaceInputPanel.querySelector('[data-google-connection-status]');
  const link = workspaceInputPanel.querySelector('[data-google-oauth]');
  if(!status || !canUseApi) return;
  try{
    const data = await getJson('/api/setup-health');
    const google = data.google || {};
    const connected = !!google.connected;
    status.classList.toggle('connected', connected);
    status.classList.toggle('failed', !connected && !!google.error);
    status.innerHTML = '<b>' + escapeHtml(connected ? 'Google is connected.' : (google.setupMessage || google.error || 'Google is not connected yet.')) + '</b>'
      + '<small>' + escapeHtml(connected ? 'Now test Calendar, Executive Inbox, Documents, Relationships, and prepared work from Hearth.' : 'Click Connect Google to authorize Gmail, Calendar, Drive, and Docs.') + '</small>';
    if(link) link.textContent = connected ? 'Reconnect Google' : 'Connect Google';
  }catch(error){
    status.classList.add('failed');
    status.innerHTML = '<b>Could not check Google connection.</b><small>' + escapeHtml(error.message || 'Refresh and try again.') + '</small>';
  }
}

async function refreshCalendarSourceStatus(){
  if(!calendarSourceStatus || !canUseApi) return;
  try{
    const data = await getJson('/api/setup-health');
    const google = data.google || {};
    const connected = !!google.connected;
    calendarSourceStatus.classList.toggle('connected', connected);
    calendarSourceStatus.classList.toggle('failed', !connected && !!google.error);
    calendarSourceStatus.innerHTML = '<strong>' + escapeHtml(connected ? 'Google Calendar is connected.' : 'Connect Google Calendar to test live meeting prep.') + '</strong>'
      + '<span>' + escapeHtml(connected ? 'Use this panel to inspect calendar-driven prep, then test Timeline & Tasks from the drawers.' : (google.setupMessage || google.error || 'VAL needs Google authorization before live calendar context can be used.')) + '</span>'
      + '<button type="button" data-google-oauth>' + escapeHtml(connected ? 'Reconnect Google' : 'Connect Google') + '</button>';
  }catch(error){
    calendarSourceStatus.classList.add('failed');
    calendarSourceStatus.innerHTML = '<strong>Could not check Google Calendar.</strong><span>' + escapeHtml(error.message || 'Try again from VAL connections.') + '</span><button type="button" data-google-oauth>Connect Google</button>';
  }
}

function formatCalendarTime(value = ''){
  if(!value) return '';
  const date = new Date(value);
  if(Number.isNaN(date.getTime())) return String(value);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const day = date.toDateString() === today.toDateString()
    ? ''
    : (date.toDateString() === tomorrow.toDateString() ? 'Tomorrow, ' : date.toLocaleDateString([], {month:'short', day:'numeric'}) + ', ');
  return day + date.toLocaleTimeString([], {hour:'numeric', minute:'2-digit'});
}

function calendarEventSubtitle(event = {}){
  const attendees = Array.isArray(event.attendees) ? event.attendees.filter(Boolean).length : 0;
  const source = event.source ? String(event.source).replace(/^\w/, (c) => c.toUpperCase()) : 'Calendar';
  const bits = [
    source,
    attendees ? attendees + ' attendee' + (attendees === 1 ? '' : 's') : '',
    event.location || event.meetingLink ? 'Location attached' : ''
  ].filter(Boolean);
  return bits.join(' · ') || 'Calendar context';
}

function renderCalendarAgenda(events = [], source = 'calendar', errors = []){
  if(!agendaList) return;
  const visibleEvents = Array.isArray(events) ? events.slice(0, 8) : [];
  currentCalendarEvents = visibleEvents;
  if(!visibleEvents.length){
    agendaList.innerHTML = '<button class="agenda-item quiet" type="button"><span>Calendar</span><strong>No upcoming events loaded</strong><small>' + escapeHtml((errors && errors[0]) || 'Connect Google Calendar or Outlook to show your schedule here.') + '</small></button>';
    return;
  }
  agendaList.innerHTML = visibleEvents.map((event, index) => (
    '<button class="agenda-item' + (index === 0 ? ' active' : '') + '" type="button" data-calendar-event-index="' + index + '">' +
      '<span>' + escapeHtml(formatCalendarTime(event.start)) + '</span>' +
      '<strong>' + escapeHtml(event.title || event.summary || '(No title)') + '</strong>' +
      '<small>' + escapeHtml(calendarEventSubtitle(event)) + '</small>' +
    '</button>'
  )).join('');
  if(nextMeetingCard && visibleEvents[0]){
    const first = visibleEvents[0];
    const start = new Date(first.start || Date.now());
    const month = Number.isNaN(start.getTime()) ? '' : start.toLocaleDateString([], {month:'short'});
    const day = Number.isNaN(start.getTime()) ? '' : start.toLocaleDateString([], {day:'2-digit'});
    const time = Number.isNaN(start.getTime()) ? 'Next' : start.toLocaleTimeString([], {hour:'numeric', minute:'2-digit'});
    const top = nextMeetingCard.querySelector('.calendar-page-top');
    const body = nextMeetingCard.querySelector('.calendar-page-body');
    if(top) top.innerHTML = '<b>' + escapeHtml(month) + '</b><strong>' + escapeHtml(day) + '</strong>';
    if(body) body.innerHTML = '<span class="calendar-kicker">Next</span><strong>' + escapeHtml(time) + '</strong><span>' + escapeHtml(first.title || '(No title)') + '</span><small>' + escapeHtml(source === 'google' ? 'Google Calendar connected' : calendarEventSubtitle(first)) + '</small>';
  }
}

async function hydrateCalendarPanel(){
  if(!canUseApi){
    renderCalendarAgenda([], 'prototype', ['Live calendar is unavailable in static prototype mode.']);
    return;
  }
  try{
    const data = await getJson('/api/calendar/sidebar');
    renderCalendarAgenda(data.events || [], data.source || 'calendar', data.errors || []);
    if(data.needsReconnect && calendarSourceStatus){
      calendarSourceStatus.classList.add('failed');
      calendarSourceStatus.innerHTML = '<strong>Calendar needs reconnection.</strong><span>' + escapeHtml((data.errors || [])[0] || 'Reconnect your calendar to show live events.') + '</span><button type="button" data-google-oauth>Reconnect Google</button>';
    }
  }catch(error){
    renderCalendarAgenda([], 'error', [error.message || 'Calendar could not load.']);
  }
}

function connectGoogleOAuth(){
  window.location.assign('/auth/google');
}

async function refreshRuntimeOpenAIStatus(){
  const status = workspaceInputPanel.querySelector('[data-openai-runtime-status]');
  if(!status || !canUseApi) return;
  try{
    const data = await getJson('/api/dev/openai-runtime');
    status.textContent = data.connected
      ? (data.production
        ? 'OpenAI is available for production Witnessing. Model: ' + (data.model || 'default') + '.'
        : 'OpenAI is available for this local server. Model: ' + (data.model || 'default') + (data.runtimeConnected ? ' (runtime key).' : ' (environment key).'))
      : 'OpenAI is not connected in this local server yet.';
  }catch(error){
    status.textContent = 'Runtime OpenAI connection is not available here: ' + error.message;
  }
}

async function ensureRuntimeOpenAIForWitnessing(){
  if(!canUseApi) return true;
  try{
    const data = await getJson('/api/dev/openai-runtime');
    if(data.connected) return true;
    openValConnectionsWorkspace();
    const status = workspaceInputPanel.querySelector('[data-openai-runtime-status]');
    if(status) status.textContent = data.production
      ? 'Connect OpenAI in production settings before starting Witnessing.'
      : 'Connect OpenAI before starting Witnessing. The live observer is not available in this local server yet.';
    return false;
  }catch(error){
    return true;
  }
}

async function saveRuntimeOpenAIConnection(action = 'save'){
  const status = workspaceInputPanel.querySelector('[data-openai-runtime-status]');
  const keyInput = workspaceInputPanel.querySelector('[data-openai-runtime-key]');
  const modelInput = workspaceInputPanel.querySelector('[data-openai-runtime-model]');
  if(!canUseApi){
    if(status) status.textContent = 'API connection is not available from this page.';
    return;
  }
  try{
    if(action === 'test'){
      if(status) status.textContent = 'Testing OpenAI connection...';
      const result = await postJson('/api/dev/openai-runtime/test', {});
      if(status) status.textContent = result.message || 'OpenAI is connected.';
      return;
    }
    const apiKey = keyInput?.value || '';
    const model = modelInput?.value || '';
    if(status) status.textContent = 'Saving runtime OpenAI connection...';
    const result = await postJson('/api/dev/openai-runtime', {apiKey, model});
    if(keyInput) keyInput.value = '';
    if(status) status.textContent = 'Saved for this local test. Model: ' + (result.model || model || 'default') + '. Now retry the Witnessing Session.';
  }catch(error){
    if(status) status.textContent = error.message || 'OpenAI connection could not be saved.';
  }
}

async function handleValAction(action){
  if(action === 'start_onboarding'){
    await openValWitnessingSession('meeting_val', {fresh:true});
    return;
  }
  if(action === 'connections'){
    openValConnectionsWorkspace();
    return;
  }
  if(action === 'cowork'){
    setWorkspaceContent({
      lens: 'Co-Work with VAL',
      title: 'Co-Work with VAL from onboarding context.',
      meaning: 'This notebook is scoped to the whole operating system: what VAL should understand, ask for, prepare, and protect.',
      understanding: ['Use this for strategy, drafting, decision framing, or explaining what feels missing in onboarding.', 'Voice should be available here in the live Co-Work interface.', 'No email, CRM update, public post, document send, or durable memory change happens from this notebook alone.'],
      recommendation: 'Start with the part of the system that feels least witnessed or least clear.',
      actions: [{label:'Think with VAL', workflow:'cowork:think'}, {label:'Draft with VAL', workflow:'cowork:draft'}, {label:'Back to VAL', workflow:'cancel:val'}],
      label: 'VAL Co-Work workspace'
    });
    renderWorkspaceInput({
      label: 'Co-Work with VAL',
      placeholder: 'What should VAL understand before it helps you run the system?',
      helper: 'Voice belongs here in live VAL. This note can become reviewable Teach VAL context before it changes memory.',
      mode: 'cowork'
    });
    openWorkspaceShell('VAL Co-Work workspace', {returnTarget:'val'});
    return;
  }
  if(action === 'teach_val'){
    setWorkspaceContent({
      lens: 'Teach VAL',
      title: 'Teach VAL with full-system context.',
      meaning: 'This teaching applies across drawers only after review: Home, Relationships, Projects, Documents, Commitments, Executive Inbox, Leverage, Velocity, and Co-Work.',
      understanding: ['VAL should explain where the learning will apply before saving.', 'Teaching can become a memory candidate, working agreement, priority rule, voice rule, or approval boundary.', 'No durable memory changes from this prototype click.'],
      recommendation: 'Be specific: what VAL noticed, what was wrong or missing, and what it should do next time.',
      actions: [{label:'Extract teaching signal', workflow:'teach:extract'}, {label:'Build review updates', workflow:'teach:review'}, {label:'Back to VAL', workflow:'cancel:val'}],
      label: 'VAL Teach workspace'
    });
    renderWorkspaceInput({
      label: 'Teach VAL',
      placeholder: 'Example: Apply this to proposals and LinkedIn drafts, but not contract terms...',
      helper: 'VAL should name the affected rooms before the learning becomes memory.',
      mode: 'teach'
    });
    openWorkspaceShell('VAL Teach workspace', {returnTarget:'val'});
    return;
  }
  if(action === 'route_support_circle'){
    closeWorkspace();
    restoreRelationshipWindow();
    openRelationshipIndex();
    if(relationshipSearchInput && valOnboardingRouteState.supportCircle.length){
      relationshipSearchInput.value = '';
    }
    return;
  }
  if(action === 'route_documents_examples'){
    closeWorkspace();
    restoreDocumentWindow();
    hydrateDocumentDrawer();
    if(documentSearchInput && valOnboardingRouteState.documentExamples.length){
      documentSearchInput.value = '';
      renderDocumentBrief(filteredDocumentItems()[0] || null);
    }
    return;
  }
  const copy = valWorkspaceCopy(action);
  setWorkspaceContent({
    lens: 'VAL Onboarding',
    title: copy.title,
    meaning: copy.meaning,
    understanding: copy.understanding,
    recommendation: copy.recommendation,
    actions: copy.actions,
    label: 'VAL onboarding workspace'
  });
  openWorkspaceShell('VAL onboarding workspace', {returnTarget:'val'});
}

async function handleWorkflowAction(action, node = null){
  const workflowPacket = node?.dataset?.valVariablePacket || 'workflow_scoped_packet';
  const workflowSource = workflowPacket === 'lead_intelligence_packet'
    ? activeLeadIntelligenceSource(action, {sourceType:'lead_intelligence_workflow_action', sourceLabel:node?.innerText || 'Lead Intelligence action'})
    : {};
  const workflowPreflight = await ensureHearthClickPacket({node, packetName:workflowPacket, action, allowBlockedForInspection:workflowPacket === 'lead_intelligence_packet', source:workflowSource});
  if(!workflowPreflight.ok) return;
  if(workflowPacket === 'lead_intelligence_packet'){
    renderHearthPacketReceiptStrip(workflowPreflight.packet || lastHearthPacketReceipt);
  }
  const [command,type,...rest] = String(action || '').split(':');
  if(command === 'relationshipAllPeople'){
    closeWorkspace();
    restoreRelationshipWindow();
    openRelationshipIndex();
    return;
  }
  if(command === 'projectAllProjects'){
    closeWorkspace();
    restoreProjectWindow();
    return;
  }
  if(command === 'introDraft'){
    openIntroDraftReview(type || 0);
    return;
  }
  if(command === 'introApprove'){
    const draftText = workspaceInputValue('intro-draft') || activeIntroDraftCandidate?.draftBody || '';
    setWorkspaceContent({
      lens: 'Relationship Leverage',
      title: 'Introduction draft approved for the review queue.',
      meaning: 'VAL recorded this draft as ready for a later email execution gate. It was not sent.',
      understanding: [
        'Draft held: ' + (activeIntroDraftCandidate?.candidate?.name || 'relationship introduction'),
        'Review text preserved: ' + draftText.slice(0, 130).replace(/\s+/g, ' ') + (draftText.length > 130 ? '...' : ''),
        'No email, LinkedIn message, calendar invite, scrape, import, or CRM write happened.'
      ],
      recommendation: 'The next real step would be the external-action approval gate, where recipients and wording are confirmed again.',
      actions: relationshipContextActions([{label:'Back to introduction review', workflow:'relationship:find_relationship_introductions'}]),
      label: 'Introduction draft approved locally'
    });
    openWorkspaceShell('Introduction draft approved locally', {returnTarget:'relationship'});
    return;
  }
  if(command === 'introRefine'){
    renderWorkspaceInput({
      label: 'Refine introduction draft',
      placeholder: 'Tighten the introduction language here.',
      helper: 'This remains a local review edit. Nothing is sent or written anywhere.',
      mode: 'intro-draft',
      value: workspaceInputValue('intro-draft') || activeIntroDraftCandidate?.draftBody || ''
    });
    workspacePapers.recommendation.textContent = 'Refine the wording, then approve it for the review queue only if the introduction still serves both people.';
    return;
  }
  if(command === 'introDismiss'){
    setWorkspaceContent({
      lens: 'Relationship Leverage',
      title: 'This introduction was set aside.',
      meaning: 'VAL kept the relationship context but removed this intro from the current review posture.',
      understanding: ['Nothing was sent.', 'No contact was exposed.', 'No CRM record, calendar event, scrape, import, or durable memory changed.'],
      recommendation: 'This is useful teaching signal: the existence of overlap does not automatically mean an introduction should happen.',
      actions: relationshipContextActions([{label:'Back to introduction review', workflow:'relationship:find_relationship_introductions'}, {label:'Teach VAL why', workflow:'introTeach'}]),
      label: 'Introduction dismissed locally'
    });
    openWorkspaceShell('Introduction dismissed locally', {returnTarget:'relationship'});
    return;
  }
  if(command === 'introTeach'){
    setWorkspaceContent({
      lens: 'Teach VAL',
      title: 'Teach VAL about this introduction.',
      meaning: 'You can explain why this introduction is right, wrong, too soon, too vague, or missing context.',
      understanding: ['Teaching stays reviewable.', 'VAL should learn judgment, not just preference.', 'No durable memory is saved from this prototype click.'],
      recommendation: 'Name the relationship principle VAL should remember before suggesting this kind of introduction again.',
      actions: relationshipContextActions([{label:'Back to draft', workflow:'introDraft:0'}]),
      label: 'Teach VAL introduction judgment'
    });
    renderWorkspaceInput({
      label: 'What should VAL learn?',
      placeholder: 'Example: Do not introduce Aric until the proposal is settled, even if the overlap is strong.',
      helper: 'This would become a reviewable teaching candidate, not instant memory.',
      mode: 'teach'
    });
    openWorkspaceShell('Teach VAL introduction judgment', {returnTarget:'relationship'});
    return;
  }
  if(command === 'relationshipTeachCandidate'){
    const profile = activeRelationshipProfile || relationshipProfiles.aric;
    const mode = relationshipTeachMode || 'relationship';
    const teaching = workspaceInputValue('relationship-teach');
    if(!teaching){
      workspacePapers.recommendation.textContent = 'Write what VAL should learn first, then review what you taught VAL.';
      renderWorkspaceInput({
        label: 'Teach VAL',
        placeholder: 'Example: This relationship is warmer than VAL thinks because...',
        helper: 'Nothing has been saved. Add the teaching note first.',
        mode: 'relationship-teach'
      });
      return;
    }
    let reviewUpdateLine = '';
    if(mode === 'temperature'){
      try{
        const result = await createRelationshipTemperatureReviewUpdate(profile, teaching);
        if(result?.update?.id){
          activeRelationshipTemperatureReviewUpdate = result.update;
          profile.temperatureReviewPending = result.update;
          reviewUpdateLine = 'Review update queued: relationship_temperature_correction';
        }
      }catch(error){
        reviewUpdateLine = 'Review update queue unavailable: ' + error.message;
      }
    }
    setWorkspaceContent({
      lens: 'Teach VAL',
      title: mode === 'temperature' ? 'Temperature teaching is ready for review.' : 'Teaching is ready for review.',
      meaning: mode === 'temperature' ? 'VAL prepared your relationship temperature correction for review before it changes future judgment.' : 'VAL prepared your relationship correction for review before it becomes memory.',
      understanding: [
        'Relationship: ' + (profile.name || 'Relationship'),
        mode === 'temperature' ? 'Correction type: relationship temperature' : '',
        'Teaching: ' + teaching,
        reviewUpdateLine,
        'No durable memory, CRM update, message, scrape, import, or relationship fact changed from this prototype click.'
      ].filter(Boolean),
      recommendation: 'In live VAL, this would move to a review gate before becoming memory or changing future relationship judgment.',
      actions: relationshipContextActions((mode === 'temperature' ? [
        {label:'Review temperature correction', workflow:'relationshipTemperatureReview'},
        {label:'Teach temperature again', workflow:'relationship:teach_temperature'}
      ] : [
        {label:'Teach another nuance', workflow:'relationship:teach_wisdom'}
      ]), profile),
      label: 'Relationship teaching review'
    });
    openWorkspaceShell('Relationship teaching review', {returnTarget:'relationship'});
    return;
  }
  if(command === 'relationshipTemperatureReview'){
    await openRelationshipTemperatureReviewQueue();
    return;
  }
  if(command === 'relationshipTemperatureApprove'){
    await decideRelationshipTemperatureReview('approve');
    return;
  }
  if(command === 'relationshipTemperatureReject'){
    await decideRelationshipTemperatureReview('reject');
    return;
  }
  if(command === 'projectSourceApprove'){
    await decideProjectSourceReview('approve');
    return;
  }
  if(command === 'projectSourceReject'){
    await decideProjectSourceReview('reject');
    return;
  }
  if(command === 'relationship'){
    await handleRelationshipAction(type);
    return;
  }
  if(command === 'project'){
    handleProjectAction(type);
    return;
  }
  if(command === 'contactCandidate'){
    await handleMeetingContactCandidate(type);
    return;
  }
  if(command === 'contactCreate'){
    await createMeetingContactCandidate(type);
    return;
  }
  if(command === 'contactOpen'){
    openCanonicalRelationshipFile(type);
    return;
  }
  if(command === 'preview'){
    await runScraperPreview(type);
    return;
  }
  if(command === 'verify') openScraper(type, 'verified');
  if(command === 'import'){
    await importApprovedScraperLeads(type);
    return;
  }
  if(command === 'cancel' && type === 'meeting'){
    closeWorkspace();
    return;
  }
  if(command === 'cancel' && type === 'relationship'){
    closeWorkspace();
    return;
  }
  if(command === 'cancel' && type === 'project'){
    closeWorkspace();
    return;
  }
  if(command === 'cancel' && type === 'timeline'){
    closeWorkspace();
    return;
  }
  if(command === 'cancel' && type === 'correspondence'){
    closeWorkspace();
    return;
  }
  if(command === 'cancel' && type === 'commitment'){
    closeWorkspace();
    return;
  }
  if(command === 'cancel' && type === 'val'){
    closeWorkspace();
    return;
  }
  if(command === 'valOnboarding'){
    await openValOnboardingWorkspace(type || 'start');
    return;
  }
  if(command === 'valOnboardingSave'){
    await saveValOnboardingContext(type || 'things_to_remember');
    return;
  }
  if(command === 'valWitnessing'){
    await openValWitnessingSession(type || 'meeting_val');
    return;
  }
  if(command === 'valWitnessingResume'){
    await openValWitnessingSession('meeting_val', {resume:true});
    return;
  }
  if(command === 'valWitnessingFresh'){
    await openValWitnessingSession('meeting_val', {fresh:true});
    return;
  }
  if(command === 'valWitnessingQuestion'){
    openValWitnessingQuestion(type || 'meeting_val');
    return;
  }
  if(command === 'valWitnessingSave'){
    await saveValWitnessingCard(type || 'witness_meeting_val');
    return;
  }
  if(command === 'valWitnessingSkipTo'){
    skipValWitnessingToQuestion(type || 'meeting_val');
    return;
  }
  if(command === 'valWitnessingConfirm'){
    const confirmation = type || 'yes';
    const category = rest[0] || 'witness_meeting_val';
    await confirmValWitnessingCard(category || 'witness_meeting_val', confirmation || 'yes');
    return;
  }
  if(command === 'valWitnessingUpload'){
    const category = type || 'witness_documents_templates';
    workspaceInputPanel.querySelector('[data-val-witnessing-file-input="' + category + '"]')?.click();
    return;
  }
  if(command === 'valWitnessingPrompt'){
    await copyValWitnessingImportPrompt();
    return;
  }
  if(command === 'valOs'){
    await openValOsReviewWorkspace();
    return;
  }
  if(command === 'valConnections'){
    openValConnectionsWorkspace();
    return;
  }
  if(command === 'valRuntimeOpenAI'){
    await saveRuntimeOpenAIConnection(type || 'save');
    return;
  }
  if(command === 'valGoogle'){
    await refreshGoogleConnectionStatus();
    return;
  }
  if(command === 'valConnections'){
    openValConnectionsWorkspace();
    if(type === 'google') setTimeout(refreshGoogleConnectionStatus, 0);
    return;
  }
  if(command === 'cancel') openScraper(type, 'setup');
  if(command === 'setup') openScraper(type, 'setup');
  if(command === 'connections') openScraper('connections');
  if(command === 'calendar'){
    openCalendarPanel();
    return;
  }
  if(command === 'drafts'){
    window.open('./dashboard.html?view=drafts', '_blank', 'noopener');
    return;
  }
  if(command === 'commitments'){
    window.open('./dashboard.html?view=commitments', '_blank', 'noopener');
    return;
  }
  if(command === 'cowork'){
    await runCowork(type);
    return;
  }
  if(command === 'teach' && type){
    await runTeachVal(type);
    return;
  }
  if(command === 'pipeline') window.open('./dashboard.html', '_blank', 'noopener');
  if(command === 'reviewQueue') window.open('./dashboard.html', '_blank', 'noopener');
  if(command === 'teach') openTeachValSession();
}

function openCanonicalRelationshipFile(contactId){
  const id = String(contactId || '').trim();
  if(!id) return;
  openRelationshipRoute('./dashboard.html?view=relationships&targetType=person&targetId=' + encodeURIComponent(id));
}

async function handleMeetingContactCandidate(key){
  const record = activeMeetingContactCandidates[key];
  if(!record?.candidate){
    setWorkspaceContent({
      lens: 'Meeting Prep',
      title: 'That contact candidate is no longer available.',
      meaning: 'Nothing external happened.',
      understanding: ['Reopen meeting prep to rebuild the latest attendee identity candidates.'],
      recommendation: 'VAL should only create contacts from fresh reviewed context.',
      actions: [{label:'Close and return to desk', workflow:'cancel:meeting'}],
      label: 'Meeting contact candidate missing'
    });
    return;
  }
  const candidate = record.candidate;
  const payload = candidate.payload || {};
  setWorkspaceContent({
    lens: 'Contact Identity',
    title: 'Review the GHL contact candidate.',
    meaning: (payload.name || record.attendee.name || 'This attendee') + ' is not in GHL yet, so VAL cannot attach relationship context cleanly.',
    understanding: [
      payload.email ? 'Email: ' + payload.email : 'No email is attached.',
      payload.note || 'This candidate came from the calendar attendee.',
      candidate.willNotDo || 'VAL will not merge contacts or send messages.'
    ],
    recommendation: 'Create the GHL contact only if this is the right person. The returned contact ID becomes the relationship key.',
    actions: [
      {label:'Create GHL contact', workflow:'contactCreate:' + key},
      {label:'Close and return to desk', workflow:'cancel:meeting'}
    ],
    label: 'Meeting contact candidate review'
  });
}

async function createMeetingContactCandidate(key){
  const record = activeMeetingContactCandidates[key];
  if(!record?.candidate) return handleMeetingContactCandidate(key);
  const candidate = record.candidate;
  const payload = candidate.payload || {};
  if(!canUseApi){
    setWorkspaceContent({
      lens: 'Contact Identity',
      title: 'Prototype contact candidate recorded.',
      meaning: 'No GHL contact was created in mock mode.',
      understanding: ['Live VAL will call ' + (candidate.endpoint || '/api/val/contacts/create') + ' after review.', candidate.onSuccess || 'The returned contact ID becomes canonical.'],
      recommendation: 'This is the intended identity loop before relationship context is attached.',
      actions: [{label:'Close and return to desk', workflow:'cancel:meeting'}],
      label: 'Meeting contact candidate prototype receipt'
    });
    return;
  }
  setWorkspaceContent({
    lens: 'Contact Identity',
    title: 'Creating the reviewed GHL contact.',
    meaning: 'VAL is creating the contact so future relationship context has a clean CRM key.',
    understanding: ['This is the only external write in this flow.', 'No message, opportunity, merge, or task is being created.', 'The returned GHL contact ID will be used going forward.'],
    recommendation: 'Wait for the GHL receipt before attaching relationship context.',
    actions: [{label:'Close and return to desk', workflow:'cancel:meeting'}],
    label: 'Meeting contact create loading'
  });
  try{
    const result = await postJson(candidate.endpoint || '/api/val/contacts/create', payload);
    const contactId = result.contactId || result.contact?.id || result.contact?.contactId || '';
    setWorkspaceContent({
      lens: 'Contact Identity',
      title: contactId ? 'GHL contact created.' : 'GHL contact needs review.',
      meaning: contactId ? (payload.name || 'This attendee') + ' is now organized under GHL contact ' + contactId + '.' : 'GHL responded without a contact ID, so VAL did not attach relationship context.',
      understanding: [
        contactId ? 'Canonical contact ID: ' + contactId : 'No canonical contact ID was returned.',
        result.relationshipDossier?.identityResolution?.status === 'resolved' ? 'Relationship Dossier is now keyed to that contact ID.' : 'Relationship Dossier was not attached.',
        'No message, opportunity, merge, or task was created.'
      ],
      recommendation: contactId ? 'Use the Relationship file from here forward so transcripts, calendar, and CRM context stay clean.' : 'Review the GHL contact manually before continuing.',
      actions: [
        contactId ? {label:'Open relationship file', workflow:'contactOpen:' + contactId} : null,
        {label:'Close and return to desk', workflow:'cancel:meeting'}
      ].filter(Boolean),
      label: 'Meeting contact create receipt'
    });
  }catch(error){
    setWorkspaceContent({
      lens: 'Contact Identity',
      title: 'The GHL contact was not created.',
      meaning: 'VAL did not attach relationship context.',
      understanding: [error.message, 'No message, opportunity, merge, or task was created.', 'The attendee remains unresolved until a GHL contact ID exists.'],
      recommendation: 'Check the GHL connection or create the contact manually before relying on relationship context.',
      actions: [{label:'Close and return to desk', workflow:'cancel:meeting'}],
      label: 'Meeting contact create error'
    });
  }
}

function calendarPacketSourceFromEvent(event = {}, index = 0){
  const title = event.title || event.summary || 'Calendar event';
  return {
    sourceId: event.id || event.eventId || event.calendarEventId || event.start || 'calendar_event_' + index,
    sourceType: 'calendar_event',
    sourceLabel: title,
    calendarToday: currentCalendarEvents.length ? {events:currentCalendarEvents.slice(0,8), source:'calendar_sidebar'} : {selected:title},
    calendarUpcoming: currentCalendarEvents,
    calendarEvents: currentCalendarEvents,
    currentCalendarEvent: event,
    sourceItem: {
      id:event.id || event.eventId || event.calendarEventId || event.start || 'calendar_event_' + index,
      title,
      sourceType:'calendar_event',
      sourceId:event.id || event.eventId || event.calendarEventId || event.start || '',
      sourceRefs:[{source_type:event.source || 'calendar', source_id:event.id || event.eventId || event.start || '', quote_or_summary:title}]
    }
  };
}

async function openMeetingPrepWithPacket(node = nextMeetingCard, eventIndex = 0){
  const event = currentCalendarEvents[eventIndex] || currentCalendarEvents[0] || {};
  activeMeetingPrepEvent = event;
  const preflight = await ensureHearthClickPacket({
    node,
    packetName:'timeline_packet',
    action:'timeline:meeting_prep',
    source:calendarPacketSourceFromEvent(event, eventIndex)
  });
  if(!preflight.ok) return;
  await openMeetingPrep();
}

async function openCalendarPanelWithPacket(node = calendarTab){
  const event = currentCalendarEvents[0] || {};
  const preflight = await ensureHearthClickPacket({
    node,
    packetName:'timeline_packet',
    action:'timeline:open_panel',
    source:calendarPacketSourceFromEvent(event, 0)
  });
  if(!preflight.ok) return;
  renderCalendarPacketReceiptStrip(lastHearthPacketReceipt);
  openCalendarPanel();
}

async function openCoworkSessionWithPacket(node = coworkNotebook){
  const preflight = await ensureHearthClickPacket({node, packetName:'cowork_packet', action:'cowork:open'});
  if(!preflight.ok) return;
  openCoworkSession();
}

async function openTeachValSessionWithPacket(node = teachPen){
  const preflight = await ensureHearthClickPacket({node, packetName:'val_os_packet', action:'teach:open'});
  if(!preflight.ok) return;
  openTeachValSession();
}

async function openLinkedInEngagementWorkspaceWithPacket(node = linkedinWidget){
  const item = linkedinVisibilityItems[0] || {};
  const preflight = await ensureHearthClickPacket({
    node,
    packetName:'relationship_packet',
    action:'linkedin:visibility',
    source:{
      relationshipName:item.contact || '',
      sourceType:'linkedin_visibility',
      sourceLabel:item.contact ? item.contact + ' LinkedIn visibility' : 'LinkedIn visibility',
      sourceItem:item
    }
  });
  if(!preflight.ok) return;
  openLinkedInEngagementWorkspace();
}

function homeWorkspacePayload(action){
  const workspace = activeHomeWorkspace && activeHomeWorkspace.workspace ? activeHomeWorkspace.workspace : {};
  const item = workspace.sourceItem || {};
  return {
    action,
    cardType: workspace.cardType || 'homepage_card',
    item,
    title: workspace.title || item.title || item.name || 'VAL judgment',
    summary: workspace.meaning || item.summary || item.reason_it_matters || ''
  };
}

function routeViewForTarget(type, item){
  const normalized = String(preparedArtifactKind(item) || type || item.view || item.source_type || item.sourceType || item.review_type || item.reviewType || item.draftType || '').toLowerCase();
  if(isEmailSourceItem(item)) return 'email_intelligence';
  if(/draft|prepared|reply|proposal|follow/.test(normalized)) return 'drafts';
  if(/opportunity|pipeline|deal|ghl/.test(normalized)) return 'opportunities';
  if(/contact|person|relationship|people/.test(normalized)) return 'relationships';
  if(/project/.test(normalized)) return 'projects';
  if(/calendar|meeting|appointment/.test(normalized)) return 'meetings';
  if(/partner/.test(normalized)) return 'leads_partners';
  if(/lead|scraper|organization|non-profit|nonprofit|employer/.test(normalized)) return 'leads_employers';
  if(/transcript|evidence|conversation|email/.test(normalized)) return 'evidence';
  return 'intelligence';
}

function normalizedTargetType(type, item){
  const normalized = String(preparedArtifactKind(item) || type || item.source_type || item.sourceType || item.review_type || item.reviewType || '').toLowerCase();
  if(isEmailSourceItem(item)) return 'email';
  if(/draft|prepared|reply|proposal|follow/.test(normalized)) return 'draft';
  if(/opportunity|pipeline|deal/.test(normalized)) return 'opportunity';
  if(/contact|person|relationship|people/.test(normalized)) return 'person';
  if(/project/.test(normalized)) return 'project';
  if(/calendar|meeting|appointment/.test(normalized)) return 'meeting';
  if(/transcript|evidence|conversation|email/.test(normalized)) return 'evidence';
  return type || normalized || '';
}

function sourceRouteForItem(item, workspace){
  const target = item.target || {};
  const metadata = item.metadata || item.metadataJson || {};
  const artifact = item.preparedArtifact || item.prepared_artifact || metadata.preparedArtifact || metadata.prepared_artifact || {};
  const externalUrl = target.url || target.href || item.url || item.externalUrl || item.ghlUrl || item.crmUrl;
  if(/^https?:\/\//i.test(String(externalUrl || ''))){
    return externalUrl;
  }
  const rawType = preparedArtifactKind(item) || target.type || item.targetType || item.source_type || item.sourceType || item.review_type || item.reviewType || workspace.cardType;
  if(isEmailSourceItem(item)){
    const email = homeEmailPayload(item);
    if(email.webLink) return email.webLink;
  }
  const targetType = normalizedTargetType(rawType, item);
  const targetId = target.id || item.targetId || item.opportunityId || metadata.opportunityId || item.draftId || artifact.id || artifact.artifactId || item.contactId || metadata.contactId || item.projectId || metadata.projectId || item.source_id || item.sourceId || item.id || '';
  const params = new URLSearchParams();
  params.set('view', routeViewForTarget(rawType, item));
  if(targetType) params.set('targetType', targetType);
  if(targetId) params.set('targetId', targetId);
  if(preparedArtifactKind(item)) params.set('artifactKind', preparedArtifactKind(item));
  if(item.id) params.set('sourceId', item.id);
  if(workspace.cardType) params.set('sourceCard', workspace.cardType);
  return './dashboard.html?' + params.toString();
}

function sourceDestinationLabel(item, workspace = {}){
  const target = item?.target || {};
  const rawType = preparedArtifactKind(item) || target.type || item?.targetType || item?.source_type || item?.sourceType || item?.review_type || item?.reviewType || workspace.cardType;
  const view = routeViewForTarget(rawType, item || {});
  if(view === 'email_intelligence') return 'Executive Inbox';
  if(view === 'opportunities') return 'GHL opportunity';
  if(view === 'drafts') return 'prepared draft';
  if(view === 'relationships') return 'relationship file';
  if(view === 'projects') return 'project dossier';
  if(view === 'meetings') return 'meeting prep';
  if(view === 'leads_partners') return 'partner scraper';
  if(view === 'leads_employers') return 'lead scraper';
  if(view === 'evidence') return 'evidence trail';
  return targetProfile(item || {}).noun || 'source view';
}

function renderSourceOpenReceipt(priorWorkspace, route){
  const workspace = priorWorkspace || {};
  const item = workspace.sourceItem || {};
  const destination = sourceDestinationLabel(item, workspace);
  const originalTitle = itemTitle(item, workspace.title || 'Source context');
  const openedExternally = !mockScrapers;
  setWorkspaceContent({
    lens: workspace.lens ? workspace.lens + ' Source' : 'Source Opened',
    title: openedExternally ? 'VAL opened the ' + destination + '.' : 'VAL held the ' + destination + ' route for review.',
    meaning: openedExternally ? 'The source opened in a new tab so the desk can stay oriented here.' : 'Mock-safe mode kept you at the desk while preserving the exact source route.',
    understanding: [
      originalTitle,
      /^https?:\/\//i.test(route) ? 'Destination: external source link.' : 'Destination: VAL workspace route.',
      'No CRM write, send, import, or durable memory action was taken.'
    ],
    recommendation: 'Use the source only as far as needed to trust the judgment, then return to the desk.',
    actions: [
      {label: 'Open source again', homeAction: 'open_source'}
    ],
    label: 'Source opened receipt'
  });
  activeHomeWorkspace = {
    roomName: roomNameFromWorkspace(workspace, 'source'),
    workspace: {
      ...workspace,
      sourceItem: item,
      cardType: workspace.cardType || 'homepage_card'
    }
  };
  markRoomAttended(roomNameFromWorkspace(workspace), 'source');
}

function openHomeSourceView(){
  const workspace = activeHomeWorkspace && activeHomeWorkspace.workspace ? activeHomeWorkspace.workspace : {};
  const item = workspace.sourceItem || {};
  const route = sourceRouteForItem(item, workspace);
  if(!mockScrapers){
    window.open(route, '_blank', 'noopener');
  }
  renderSourceOpenReceipt(workspace, route);
}

function openExecutiveInboxForHomeEmail(item = {}){
  const email = homeEmailPayload(item);
  const params = new URLSearchParams();
  params.set('view', 'email_intelligence');
  if(email.subject) params.set('query', email.subject);
  if(email.messageId) params.set('targetId', email.messageId);
  window.open('./dashboard.html?' + params.toString(), '_blank', 'noopener');
}

async function runHomeEmailAction(action){
  const workspace = activeHomeWorkspace && activeHomeWorkspace.workspace ? activeHomeWorkspace.workspace : {};
  const item = workspace.sourceItem || {};
  const email = homeEmailPayload(item);
  if(action === 'open_executive_inbox'){
    openExecutiveInboxForHomeEmail(item);
    renderHomeActionResult(action, {
      status: 'source_opened',
      message: 'Executive Inbox opened with this email subject as the context.'
    });
    return;
  }
  const apiAction = action === 'draft_email_reply' ? 'draft_reply' : 'create_task';
  setWorkspaceContent({
    lens: 'Executive Inbox',
    title: action === 'draft_email_reply' ? 'VAL is preparing a reply draft.' : 'VAL is creating a follow-up task.',
    meaning: 'This stays inside VAL for review. Nothing is sent, archived, or changed in Gmail from this click.',
    understanding: [
      email.subject || itemTitle(item, 'Email needing attention'),
      email.from?.email || email.from?.name ? 'From: ' + (email.from.name || email.from.email) : '',
      email.reason || email.snippet || 'Source email context is attached.'
    ].filter(Boolean),
    recommendation: action === 'draft_email_reply'
      ? 'Review the draft before creating a provider draft or sending anything.'
      : 'Add a due date before relying on this as committed follow-through.',
    actions: [{label: 'Close and return to desk', workflow: 'cancel:meeting'}],
    label: 'Home email action loading'
  });
  try{
    const result = await postJson('/api/email/inbox-command/action', {
      action: apiAction,
      email,
      title: action === 'create_email_task' ? 'Reply/follow up: ' + (email.subject || itemTitle(item, 'email')) : undefined
    });
    const created = result.draft || result.task || {};
    setWorkspaceContent({
      lens: 'Executive Inbox Receipt',
      title: result.draft ? 'Reply draft created for review.' : 'Follow-up task created.',
      meaning: result.draft ? 'VAL created an internal reply draft only. It did not send email.' : 'VAL created a local task from the email context.',
      understanding: [
        created.subject || created.title || email.subject,
        result.requiresApproval ? 'Approval is required before anything leaves VAL.' : 'No external action was taken.',
        email.webLink ? 'Source email link is still available.' : ''
      ].filter(Boolean),
      recommendation: result.draft ? 'Open Drafts or Executive Inbox to edit, approve, or discard the draft.' : 'Open Commitments/Tasks to set or adjust the due date.',
      actions: [
        {label: result.draft ? 'Open Drafts' : 'Open Commitments', workflow: result.draft ? 'drafts' : 'commitments'},
        {label: 'Open Executive Inbox', homeAction: 'open_executive_inbox'},
        {label: 'Close and return to desk', workflow: 'cancel:meeting'}
      ],
      label: 'Home email action receipt'
    });
    activeHomeWorkspace = {roomName: roomNameFromWorkspace(workspace, 'alignment'), workspace};
  }catch(error){
    setWorkspaceContent({
      lens: 'Executive Inbox',
      title: 'Email action needs review.',
      meaning: 'VAL did not send anything or change Gmail.',
      understanding: [error.message || 'The email action could not complete.', email.subject || 'Email context stayed attached.'],
      recommendation: 'Open Executive Inbox and run the action from the full email surface.',
      actions: [
        {label: 'Open Executive Inbox', homeAction: 'open_executive_inbox'},
        {label: 'Close and return to desk', workflow: 'cancel:meeting'}
      ],
      label: 'Home email action error'
    });
    activeHomeWorkspace = {roomName: roomNameFromWorkspace(workspace, 'alignment'), workspace};
  }
}

function homeActionPosture(action, workspace = {}){
  const label = String(action || '').replace(/_/g, ' ');
  const lens = workspace.lens || 'VAL';
  if(action === 'approve') return {
    title: lens + ' accepted your judgment.',
    meaning: 'VAL recorded that this recommendation was useful and should remain trusted for this moment.',
    recommendation: 'The room can return to the desk, or you can teach VAL more nuance while the context is still open.'
  };
  if(action === 'edit_before_approving') return {
    title: lens + ' is ready to adjust.',
    meaning: 'VAL recorded that the recommendation needs refinement before it should be treated as right.',
    recommendation: 'Teach VAL what would make this judgment more accurate next time.'
  };
  if(action === 'review_evidence') return {
    title: lens + ' kept the evidence attached.',
    meaning: 'VAL recorded that you wanted more source context before deciding.',
    recommendation: 'Open the source view if the evidence itself needs inspection.'
  };
  if(action === 'summarize_project') return {
    title: lens + ' will show alternatives.',
    meaning: 'VAL recorded that the first recommendation was not enough to settle the decision.',
    recommendation: 'Use Teach VAL if the alternatives should be ranked differently.'
  };
  return {
    title: lens + ' recorded your ' + label + ' judgment.',
    meaning: 'VAL recorded your choice without taking external action.',
    recommendation: 'This will help VAL choose what deserves attention on Home.'
  };
}

function renderHomeActionResult(action, result){
  const priorWorkspace = activeHomeWorkspace && activeHomeWorkspace.workspace ? activeHomeWorkspace.workspace : {};
  const item = priorWorkspace.sourceItem || {};
  const priorRoomName = roomNameFromWorkspace(priorWorkspace);
  const posture = homeActionPosture(action, priorWorkspace);
  const status = result.status || 'decision_logged';
  const message = result.message || 'VAL recorded your judgment.';
  setWorkspaceContent({
    lens: priorWorkspace.lens ? priorWorkspace.lens + ' Receipt' : 'Judgment Recorded',
    title: posture.title,
    meaning: posture.meaning,
    understanding: [
      itemTitle(item, priorWorkspace.title || 'Original judgment: ' + message),
      message,
      'Status: ' + status.replace(/_/g, ' '),
      'No external action was taken from this workspace.'
    ],
    recommendation: posture.recommendation,
    actions: [
      item && Object.keys(item).length ? {label: sourceActionLabel(item, 'Open source context'), homeAction: 'open_source'} : null
    ].filter(Boolean),
    label: 'Home judgment action result'
  });
  if(item && Object.keys(item).length){
    activeHomeWorkspace = {
      roomName: priorWorkspace.lens || 'receipt',
      workspace: {
        ...priorWorkspace,
        sourceItem: item,
        cardType: priorWorkspace.cardType || 'homepage_card'
      }
    };
    markRoomAttended(priorRoomName, action === 'edit_before_approving' ? 'adjust' : action === 'review_evidence' ? 'evidence' : 'judgment');
  }
}

async function handleHomeRoomAction(action, node = null){
  const homePreflight = await ensureHearthClickPacket({node, packetName:node?.dataset?.valVariablePacket || 'home_source_packet', action});
  if(!homePreflight.ok) return;
  if(action === 'open_source'){
    openHomeSourceView();
    return;
  }
  if(action === 'open_executive_inbox' || action === 'draft_email_reply' || action === 'create_email_task'){
    await runHomeEmailAction(action);
    return;
  }
  const payload = homeWorkspacePayload(action);
  if(!canUseApi){
    renderHomeActionResult(action, {
      status: 'prototype_logged',
      message: 'Prototype mode recorded the judgment locally. No external action was taken.'
    });
    return;
  }
  setWorkspaceContent({
    lens: 'Working With Your Judgment',
    title: 'VAL is recording that judgment.',
    meaning: 'The room is staying attached to the same evidence while VAL logs your choice.',
    understanding: [
      'The existing homepage-card action contract is being used.',
      'Final sends, CRM changes, and durable changes still require their dedicated approval flow.',
      'No external action is taken from this click.'
    ],
    recommendation: 'Wait a moment, then VAL will confirm what was recorded.',
    actions: [{label: 'Close and return to desk', workflow: 'cancel:meeting'}],
    label: 'Home judgment action loading'
  });
  try{
    const result = await postJson('/api/homepage-cards/action', payload);
    renderHomeActionResult(action, result);
  }catch(error){
    setWorkspaceContent({
      lens: 'Judgment Needs Review',
      title: 'VAL could not record that cleanly.',
      meaning: 'Nothing external happened. The room stayed calm, and your source context is still intact.',
      understanding: [
        error.message,
        'The action can be retried after the local VAL service is ready.',
        'You can teach VAL what should have happened instead.'
      ],
      recommendation: 'Use Teach VAL if this button should behave differently.',
      actions: [
        {label: 'Teach VAL', workflow: 'teach'},
        {label: 'Close and return to desk', workflow: 'cancel:meeting'}
      ],
      label: 'Home judgment action error'
    });
  }
}

async function openMeetingPrep(){
  closeCalendarPanel();
  hearth.dataset.distance = 'judgment';
  hearth.classList.add('calendar-prep-open');
  deskWorkspace.setAttribute('aria-hidden', 'false');
  document.querySelectorAll('.living-room').forEach((room) => {
    room.classList.remove('active-room');
  });
  await runMeetingPrep();
}

function openCoworkSession(){
  closeCalendarPanel();
  setWorkspaceContent({
    lens: coworkSession.lens,
    title: coworkSession.title,
    meaning: coworkSession.meaning,
    understanding: coworkSession.understanding,
    recommendation: coworkSession.recommendation,
    actions: [
      {label: 'Think with VAL', workflow: 'cowork:think'},
      {label: 'Draft with VAL', workflow: 'cowork:draft'},
      {label: 'Close and return to desk', workflow: 'cancel:meeting'}
    ],
    label: 'Co-Work with VAL workspace'
  });
  renderWorkspaceInput({
    label: 'Open Co-Work',
    placeholder: 'What would you like to think through with VAL?',
    helper: 'VAL may prepare language, options, or a decision brief. Nothing is sent or changed externally from this Co-Work space.',
    mode: 'cowork'
  });
  hearth.dataset.distance = 'judgment';
  deskWorkspace.setAttribute('aria-hidden', 'false');
  document.querySelectorAll('.living-room').forEach((room) => {
    room.classList.remove('active-room');
  });
}

function openTeachValSession(){
  closeCalendarPanel();
  setWorkspaceContent({
    lens: teachValSession.lens,
    title: teachValSession.title,
    meaning: teachValSession.meaning,
    understanding: teachValSession.understanding,
    recommendation: teachValSession.recommendation,
    actions: [
      {label: 'Extract teaching signal', workflow: 'teach:extract'},
      {label: 'Build review updates', workflow: 'teach:review'},
      {label: 'Close and return to desk', workflow: 'cancel:meeting'}
    ],
    label: 'Teach VAL workspace'
  });
  renderWorkspaceInput({
    label: 'Teach VAL',
    placeholder: "Example: This wasn't useful because... / Show me more like this... / I would have handled this differently...",
    helper: 'Teach VAL creates reviewable learning candidates. Sensitive or durable memory should be confirmed before it becomes part of VAL.',
    mode: 'teach'
  });
  hearth.dataset.distance = 'judgment';
  deskWorkspace.setAttribute('aria-hidden', 'false');
  document.querySelectorAll('.living-room').forEach((room) => {
    room.classList.remove('active-room');
  });
}

function openWorkspace(roomName){
  if(!renderWorkspace(roomName)) return;
  hearth.dataset.distance = 'judgment';
  deskWorkspace.setAttribute('aria-hidden', 'false');
  document.querySelectorAll('.living-room').forEach((room) => {
    room.classList.toggle('active-room', room.dataset.room === roomName);
  });
}

async function handlePrimaryAction(button){
  const roomName = button?.dataset?.openRoom || '';
  const roomWorkspace = roomName && currentState.rooms?.[roomName]?.workspace ? currentState.rooms[roomName].workspace : {};
  const roomSourceItem = roomWorkspace.sourceItem || {};
  const roomIdentity = sourceIdentityForItem(roomSourceItem);
  const preflight = await ensureHearthClickPacket({
    node: button,
    packetName: button?.dataset?.valVariablePacket || 'home_source_packet',
    action: roomName || button?.dataset?.actionType || 'home_primary',
    source: {
      sourceId: roomIdentity.id,
      sourceType: roomIdentity.type,
      sourceLabel: roomIdentity.label,
      sourceItem: roomSourceItem,
      homeCard: roomWorkspace
    }
  });
  if(!preflight.ok) return;
  const actionType = button.dataset.actionType || 'workspace';
  const target = button.dataset.actionTarget;
  if(actionType === 'openExternal' && target){
    window.open(target, '_blank', 'noopener');
    return;
  }
  if(actionType === 'openInternal' && target){
    window.open(target, '_blank', 'noopener');
    return;
  }
  openWorkspace(button.dataset.openRoom);
}

function closeWorkspace(){
  activeHomeWorkspace = null;
  hearth.dataset.distance = 'presence';
  hearth.classList.add('desk-settling');
  hearth.classList.remove('calendar-prep-open');
  deskWorkspace.setAttribute('aria-hidden', 'true');
  if(workspaceReturnTarget === 'relationship') restoreRelationshipWindow();
  if(workspaceReturnTarget === 'project') restoreProjectWindow();
  if(workspaceReturnTarget === 'timeline') restoreTimelineWindow();
  if(workspaceReturnTarget === 'correspondence') restoreCorrespondenceWindow();
  if(workspaceReturnTarget === 'commitment') restoreCommitmentWindow();
  if(workspaceReturnTarget === 'document') restoreDocumentWindow();
  if(workspaceReturnTarget === 'val') restoreValWindow();
  workspaceReturnTarget = 'home';
  updateWorkspaceReturnButton();
  document.querySelectorAll('.living-room').forEach((room) => {
    room.classList.remove('active-room');
  });
  window.setTimeout(() => hearth.classList.remove('desk-settling'), 620);
}

function hideWorkspaceForDrawerNavigation(){
  if(hearth.dataset.distance !== 'judgment') return;
  activeHomeWorkspace = null;
  hearth.dataset.distance = 'presence';
  hearth.classList.remove('calendar-prep-open');
  deskWorkspace.setAttribute('aria-hidden', 'true');
  workspaceReturnTarget = 'home';
  updateWorkspaceReturnButton();
  document.querySelectorAll('.living-room').forEach((room) => {
    room.classList.remove('active-room');
  });
}

function openCalendarPanel(){
  closeWorkspace();
  closeDrawer();
  hearth.classList.add('calendar-open');
  calendarTab.setAttribute('aria-expanded', 'true');
  fullCalendarPanel.setAttribute('aria-hidden', 'false');
  refreshCalendarSourceStatus();
  hydrateCalendarPanel();
}

function closeCalendarPanel(){
  hearth.classList.remove('calendar-open');
  calendarTab.setAttribute('aria-expanded', 'false');
  fullCalendarPanel.setAttribute('aria-hidden', 'true');
  renderCalendarPacketReceiptStrip(null);
}

leanButton.addEventListener('click', () => {
  const isOpen = evidence.classList.toggle('open');
  hearth.classList.toggle('evidence-open', isOpen);
  leanButton.setAttribute('aria-expanded', String(isOpen));
});

freshDeskButton.addEventListener('click', clearRoomAttendance);

drawerPull.addEventListener('click', () => {
  hideWorkspaceForDrawerNavigation();
  const isOpen = retrievalSystem.classList.toggle('open');
  hearth.classList.toggle('drawer-open', isOpen);
  drawerPull.setAttribute('aria-expanded', String(isOpen));
  drawerTray.setAttribute('aria-hidden', String(!isOpen));
  updateCloseAllDrawersButton();
});

closeAllDrawersButton?.addEventListener('click', closeDrawer);

valDrawerLink?.addEventListener('click', () => {
  ensureDrawerTrayOpen();
  drawerTray.classList.remove('relationship-open', 'project-open', 'timeline-open', 'correspondence-open', 'commitment-open', 'document-open', 'source-open');
  relationshipDrawerLink.setAttribute('aria-expanded', 'false');
  projectDrawerLink.setAttribute('aria-expanded', 'false');
  timelineDrawerLink?.setAttribute('aria-expanded', 'false');
  correspondenceDrawerLink?.setAttribute('aria-expanded', 'false');
  commitmentDrawerLink?.setAttribute('aria-expanded', 'false');
  documentDrawerLink?.setAttribute('aria-expanded', 'false');
  sourceDrawerLink.setAttribute('aria-expanded', 'false');
  document.querySelector('#relationship-detail').setAttribute('aria-hidden', 'true');
  document.querySelector('#project-detail').setAttribute('aria-hidden', 'true');
  document.querySelector('#timeline-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#correspondence-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#commitment-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#document-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#source-detail').setAttribute('aria-hidden', 'true');
  const isOpen = drawerTray.classList.toggle('val-open');
  valDrawerLink.setAttribute('aria-expanded', String(isOpen));
  document.querySelector('#val-detail')?.setAttribute('aria-hidden', String(!isOpen));
  if(isOpen){
    drawerIndexPacketReceipt({node:valDrawerLink, packetName:'val_os_packet', action:'drawer:val_os', label:'VAL drawer', downstreamConsumers:['val_drawer','teach_val','connections','approval_gate']});
    hydrateValDrawer();
    bringDrawerTargetIntoView(document.querySelector('button[data-workflow-action="valWitnessingResume"]') || document.querySelector('#val-detail'));
  } else {
    renderDrawerPacketReceiptStrip(null);
  }
});

sourceDrawerLink.addEventListener('click', () => {
  ensureDrawerTrayOpen();
  drawerTray.classList.remove('val-open', 'relationship-open', 'project-open', 'timeline-open', 'correspondence-open', 'commitment-open', 'document-open');
  valDrawerLink?.setAttribute('aria-expanded', 'false');
  relationshipDrawerLink.setAttribute('aria-expanded', 'false');
  projectDrawerLink.setAttribute('aria-expanded', 'false');
  timelineDrawerLink?.setAttribute('aria-expanded', 'false');
  correspondenceDrawerLink?.setAttribute('aria-expanded', 'false');
  commitmentDrawerLink?.setAttribute('aria-expanded', 'false');
  documentDrawerLink?.setAttribute('aria-expanded', 'false');
  document.querySelector('#val-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#relationship-detail').setAttribute('aria-hidden', 'true');
  document.querySelector('#project-detail').setAttribute('aria-hidden', 'true');
  document.querySelector('#timeline-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#correspondence-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#commitment-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#document-detail')?.setAttribute('aria-hidden', 'true');
  const isOpen = drawerTray.classList.toggle('source-open');
  sourceDrawerLink.setAttribute('aria-expanded', String(isOpen));
  document.querySelector('#source-detail').setAttribute('aria-hidden', String(!isOpen));
  if(isOpen){
    drawerIndexPacketReceipt({node:sourceDrawerLink, packetName:'lead_intelligence_packet', action:'drawer:lead_intelligence', label:'Lead Intelligence drawer', downstreamConsumers:['lead_intelligence_drawer','preview_gate','ghl_handoff']});
  } else {
    renderDrawerPacketReceiptStrip(null);
  }
});

relationshipDrawerLink.addEventListener('click', () => {
  ensureDrawerTrayOpen();
  drawerTray.classList.remove('val-open', 'source-open', 'project-open', 'timeline-open', 'correspondence-open', 'commitment-open', 'document-open');
  valDrawerLink?.setAttribute('aria-expanded', 'false');
  sourceDrawerLink.setAttribute('aria-expanded', 'false');
  projectDrawerLink.setAttribute('aria-expanded', 'false');
  timelineDrawerLink?.setAttribute('aria-expanded', 'false');
  correspondenceDrawerLink?.setAttribute('aria-expanded', 'false');
  commitmentDrawerLink?.setAttribute('aria-expanded', 'false');
  documentDrawerLink?.setAttribute('aria-expanded', 'false');
  document.querySelector('#val-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#source-detail').setAttribute('aria-hidden', 'true');
  document.querySelector('#project-detail').setAttribute('aria-hidden', 'true');
  document.querySelector('#timeline-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#correspondence-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#commitment-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#document-detail')?.setAttribute('aria-hidden', 'true');
  const isOpen = drawerTray.classList.toggle('relationship-open');
  relationshipDrawerLink.setAttribute('aria-expanded', String(isOpen));
  document.querySelector('#relationship-detail').setAttribute('aria-hidden', String(!isOpen));
  if(isOpen){
    drawerIndexPacketReceipt({node:relationshipDrawerLink, packetName:'relationship_packet', action:'drawer:relationships', label:'Relationships drawer', downstreamConsumers:['relationship_drawer','project_packet','email_packet','home_source_packet']});
    openRelationshipIndex();
  } else {
    renderDrawerPacketReceiptStrip(null);
  }
});

projectDrawerLink.addEventListener('click', () => {
  ensureDrawerTrayOpen();
  drawerTray.classList.remove('val-open', 'relationship-open', 'timeline-open', 'correspondence-open', 'commitment-open', 'document-open', 'source-open');
  valDrawerLink?.setAttribute('aria-expanded', 'false');
  relationshipDrawerLink.setAttribute('aria-expanded', 'false');
  timelineDrawerLink?.setAttribute('aria-expanded', 'false');
  correspondenceDrawerLink?.setAttribute('aria-expanded', 'false');
  commitmentDrawerLink?.setAttribute('aria-expanded', 'false');
  documentDrawerLink?.setAttribute('aria-expanded', 'false');
  sourceDrawerLink.setAttribute('aria-expanded', 'false');
  document.querySelector('#val-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#relationship-detail').setAttribute('aria-hidden', 'true');
  document.querySelector('#timeline-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#correspondence-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#commitment-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#document-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#source-detail').setAttribute('aria-hidden', 'true');
  const isOpen = drawerTray.classList.toggle('project-open');
  projectDrawerLink.setAttribute('aria-expanded', String(isOpen));
  document.querySelector('#project-detail').setAttribute('aria-hidden', String(!isOpen));
  if(isOpen){
    drawerIndexPacketReceipt({node:projectDrawerLink, packetName:'project_packet', action:'drawer:projects', label:'Projects drawer', downstreamConsumers:['project_drawer','relationship_packet','email_packet','home_source_packet']});
    openProjectIndex();
  } else {
    renderDrawerPacketReceiptStrip(null);
  }
});

timelineDrawerLink?.addEventListener('click', () => {
  ensureDrawerTrayOpen();
  drawerTray.classList.remove('val-open', 'relationship-open', 'project-open', 'correspondence-open', 'commitment-open', 'document-open', 'source-open');
  valDrawerLink?.setAttribute('aria-expanded', 'false');
  relationshipDrawerLink.setAttribute('aria-expanded', 'false');
  projectDrawerLink.setAttribute('aria-expanded', 'false');
  correspondenceDrawerLink?.setAttribute('aria-expanded', 'false');
  commitmentDrawerLink?.setAttribute('aria-expanded', 'false');
  documentDrawerLink?.setAttribute('aria-expanded', 'false');
  sourceDrawerLink.setAttribute('aria-expanded', 'false');
  document.querySelector('#val-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#relationship-detail').setAttribute('aria-hidden', 'true');
  document.querySelector('#project-detail').setAttribute('aria-hidden', 'true');
  document.querySelector('#correspondence-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#commitment-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#document-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#source-detail').setAttribute('aria-hidden', 'true');
  const isOpen = drawerTray.classList.toggle('timeline-open');
  timelineDrawerLink.setAttribute('aria-expanded', String(isOpen));
  document.querySelector('#timeline-detail')?.setAttribute('aria-hidden', String(!isOpen));
  if(isOpen){
    drawerIndexPacketReceipt({node:timelineDrawerLink, packetName:'timeline_packet', action:'drawer:timeline', label:'Timeline & Tasks drawer', downstreamConsumers:['timeline_drawer','meeting_prep','relationship_packet','project_packet']});
    hydrateTimelineStatus();
  } else {
    renderDrawerPacketReceiptStrip(null);
  }
});

correspondenceDrawerLink?.addEventListener('click', () => {
  ensureDrawerTrayOpen();
  drawerTray.classList.remove('val-open', 'relationship-open', 'project-open', 'timeline-open', 'commitment-open', 'document-open', 'source-open');
  valDrawerLink?.setAttribute('aria-expanded', 'false');
  relationshipDrawerLink.setAttribute('aria-expanded', 'false');
  projectDrawerLink.setAttribute('aria-expanded', 'false');
  timelineDrawerLink?.setAttribute('aria-expanded', 'false');
  commitmentDrawerLink?.setAttribute('aria-expanded', 'false');
  documentDrawerLink?.setAttribute('aria-expanded', 'false');
  sourceDrawerLink.setAttribute('aria-expanded', 'false');
  document.querySelector('#val-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#relationship-detail').setAttribute('aria-hidden', 'true');
  document.querySelector('#project-detail').setAttribute('aria-hidden', 'true');
  document.querySelector('#timeline-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#commitment-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#document-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#source-detail').setAttribute('aria-hidden', 'true');
  const isOpen = drawerTray.classList.toggle('correspondence-open');
  correspondenceDrawerLink.setAttribute('aria-expanded', String(isOpen));
  document.querySelector('#correspondence-detail')?.setAttribute('aria-hidden', String(!isOpen));
  if(isOpen){
    drawerIndexPacketReceipt({node:correspondenceDrawerLink, packetName:'email_packet', action:'drawer:executive_inbox', label:'Executive Inbox drawer', downstreamConsumers:['executive_inbox','relationship_packet','project_packet','commitment_packet']});
    hydrateCorrespondenceDrawer();
  } else {
    renderDrawerPacketReceiptStrip(null);
  }
});

commitmentDrawerLink?.addEventListener('click', () => {
  ensureDrawerTrayOpen();
  drawerTray.classList.remove('val-open', 'relationship-open', 'project-open', 'timeline-open', 'correspondence-open', 'document-open', 'source-open');
  valDrawerLink?.setAttribute('aria-expanded', 'false');
  relationshipDrawerLink.setAttribute('aria-expanded', 'false');
  projectDrawerLink.setAttribute('aria-expanded', 'false');
  timelineDrawerLink?.setAttribute('aria-expanded', 'false');
  correspondenceDrawerLink?.setAttribute('aria-expanded', 'false');
  documentDrawerLink?.setAttribute('aria-expanded', 'false');
  sourceDrawerLink.setAttribute('aria-expanded', 'false');
  document.querySelector('#val-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#relationship-detail').setAttribute('aria-hidden', 'true');
  document.querySelector('#project-detail').setAttribute('aria-hidden', 'true');
  document.querySelector('#timeline-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#correspondence-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#document-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#source-detail').setAttribute('aria-hidden', 'true');
  const isOpen = drawerTray.classList.toggle('commitment-open');
  commitmentDrawerLink.setAttribute('aria-expanded', String(isOpen));
  document.querySelector('#commitment-detail')?.setAttribute('aria-hidden', String(!isOpen));
  if(isOpen){
    drawerIndexPacketReceipt({node:commitmentDrawerLink, packetName:'commitment_packet', action:'drawer:commitments', label:'Commitments drawer', downstreamConsumers:['commitment_drawer','timeline_packet','email_packet','relationship_packet','project_packet']});
    hydrateCommitmentDrawer();
  } else {
    renderDrawerPacketReceiptStrip(null);
  }
});

documentDrawerLink?.addEventListener('click', () => {
  ensureDrawerTrayOpen();
  drawerTray.classList.remove('val-open', 'relationship-open', 'project-open', 'timeline-open', 'correspondence-open', 'commitment-open', 'source-open');
  valDrawerLink?.setAttribute('aria-expanded', 'false');
  relationshipDrawerLink.setAttribute('aria-expanded', 'false');
  projectDrawerLink.setAttribute('aria-expanded', 'false');
  timelineDrawerLink?.setAttribute('aria-expanded', 'false');
  correspondenceDrawerLink?.setAttribute('aria-expanded', 'false');
  commitmentDrawerLink?.setAttribute('aria-expanded', 'false');
  sourceDrawerLink.setAttribute('aria-expanded', 'false');
  document.querySelector('#val-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#relationship-detail').setAttribute('aria-hidden', 'true');
  document.querySelector('#project-detail').setAttribute('aria-hidden', 'true');
  document.querySelector('#timeline-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#correspondence-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#commitment-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#source-detail').setAttribute('aria-hidden', 'true');
  const isOpen = drawerTray.classList.toggle('document-open');
  documentDrawerLink.setAttribute('aria-expanded', String(isOpen));
  document.querySelector('#document-detail')?.setAttribute('aria-hidden', String(!isOpen));
  if(isOpen){
    drawerIndexPacketReceipt({node:documentDrawerLink, packetName:'document_packet', action:'drawer:documents', label:'Documents drawer', downstreamConsumers:['document_drawer','relationship_packet','project_packet','email_packet']});
    hydrateDocumentDrawer();
  } else {
    renderDrawerPacketReceiptStrip(null);
  }
});

closeRelationshipDetail.addEventListener('click', () => {
  drawerTray.classList.remove('relationship-open');
  relationshipDrawerLink.setAttribute('aria-expanded', 'false');
  document.querySelector('#relationship-detail').setAttribute('aria-hidden', 'true');
});

closeProjectDetail.addEventListener('click', () => {
  drawerTray.classList.remove('project-open');
  projectDrawerLink.setAttribute('aria-expanded', 'false');
  document.querySelector('#project-detail').setAttribute('aria-hidden', 'true');
});

closeTimelineDetail?.addEventListener('click', () => {
  drawerTray.classList.remove('timeline-open');
  timelineDrawerLink?.setAttribute('aria-expanded', 'false');
  document.querySelector('#timeline-detail')?.setAttribute('aria-hidden', 'true');
});

closeCorrespondenceDetail?.addEventListener('click', () => {
  drawerTray.classList.remove('correspondence-open');
  correspondenceDrawerLink?.setAttribute('aria-expanded', 'false');
  document.querySelector('#correspondence-detail')?.setAttribute('aria-hidden', 'true');
});

closeCommitmentDetail?.addEventListener('click', () => {
  drawerTray.classList.remove('commitment-open');
  commitmentDrawerLink?.setAttribute('aria-expanded', 'false');
  document.querySelector('#commitment-detail')?.setAttribute('aria-hidden', 'true');
});

closeDocumentDetail?.addEventListener('click', () => {
  drawerTray.classList.remove('document-open');
  documentDrawerLink?.setAttribute('aria-expanded', 'false');
  document.querySelector('#document-detail')?.setAttribute('aria-hidden', 'true');
});

closeValDetail?.addEventListener('click', () => {
  drawerTray.classList.remove('val-open');
  valDrawerLink?.setAttribute('aria-expanded', 'false');
  document.querySelector('#val-detail')?.setAttribute('aria-hidden', 'true');
});

documentList?.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-document-item]');
  if(!button) return;
  const selected = currentDocumentItems.find((item) => item.id === button.dataset.documentItem);
  const preflight = await ensureHearthClickPacket({node:button, packetName:'document_packet', action:'document:select', allowBlockedForInspection:true, source:documentSource(selected, 'document:select')});
  if(!preflight.ok) return;
  renderDrawerPacketReceiptStrip(preflight.packet || lastHearthPacketReceipt);
  renderDocumentBrief(selected);
});

documentSearchInput?.addEventListener('input', async () => {
  const preflight = await ensureHearthClickPacket({node:documentSearchInput, packetName:'document_packet', action:'document:search', allowBlockedForInspection:true, source:{...documentSource(activeDocumentItem, 'document:search'), sourceType:'document_filter', sourceLabel:'Document search'}});
  renderDrawerPacketReceiptStrip(preflight.packet || lastHearthPacketReceipt);
  renderDocumentBrief(filteredDocumentItems()[0] || null);
});
documentRelationshipFilter?.addEventListener('change', async () => {
  const preflight = await ensureHearthClickPacket({node:documentRelationshipFilter, packetName:'document_packet', action:'document:relationship_filter', allowBlockedForInspection:true, source:{...documentSource(activeDocumentItem, 'document:relationship_filter'), sourceType:'document_filter', sourceLabel:'Document relationship filter'}});
  renderDrawerPacketReceiptStrip(preflight.packet || lastHearthPacketReceipt);
  renderDocumentBrief(filteredDocumentItems()[0] || null);
});
documentProjectFilter?.addEventListener('change', async () => {
  const preflight = await ensureHearthClickPacket({node:documentProjectFilter, packetName:'document_packet', action:'document:project_filter', allowBlockedForInspection:true, source:{...documentSource(activeDocumentItem, 'document:project_filter'), sourceType:'document_filter', sourceLabel:'Document project filter'}});
  renderDrawerPacketReceiptStrip(preflight.packet || lastHearthPacketReceipt);
  renderDocumentBrief(filteredDocumentItems()[0] || null);
});

document.querySelectorAll('[data-document-action]').forEach((button) => {
  button.addEventListener('click', async () => {
    const action = button.dataset.documentAction;
    const preflight = await ensureHearthClickPacket({node:button, packetName:'document_packet', action:'document:' + action, allowBlockedForInspection:true, source:documentSource(activeDocumentItem, action)});
    if(!preflight.ok) return;
    renderDrawerPacketReceiptStrip(preflight.packet || lastHearthPacketReceipt);
    if(preflight.packet?.status === 'blocked' && documentActionNeedsLiveConfirmation(action)){
      if(documentStatus) documentStatus.textContent = 'VAL checked the document packet and needs more source/link context before this action can update, send, or link anything. Receipt is shown above; no external action happened.';
      return;
    }
    handleDocumentAction(action);
  });
});

projectCreateToggle?.addEventListener('click', () => {
  setProjectCreateOpen(projectCreateForm?.hidden !== false);
});

projectCreateForm?.addEventListener('submit', createProjectFromDrawer);

document.querySelector('[data-project-create-cancel]')?.addEventListener('click', () => {
  setProjectCreateOpen(false);
});

projectFileInput?.addEventListener('change', updateProjectFileReceipt);

relationshipFolderButtons.forEach((button) => {
  button.addEventListener('click', async () => {
    const profileId = button.dataset.relationshipProfile;
    const profile = relationshipIndexSourceProfiles()[profileId] || relationshipProfiles[profileId] || relationshipIndexProfiles[profileId] || {};
    const preflight = await ensureHearthClickPacket({node:button, packetName:'relationship_packet', action:'relationship:open_profile', allowBlockedForInspection:true, source:relationshipSource({...profile, profileId}, 'relationship:open_profile')});
    if(!preflight.ok) return;
    renderDrawerPacketReceiptStrip(preflight.packet || lastHearthPacketReceipt);
    loadRelationshipDossier(profileId);
  });
});

relationshipSearchInput?.addEventListener('input', () => {
  relationshipIndexSearch = relationshipSearchInput.value || '';
  renderRelationshipRolodex();
});

relationshipSortSelect?.addEventListener('change', () => {
  relationshipSortMode = relationshipSortSelect.value || 'attention';
  renderRelationshipRolodex();
});

relationshipStateFilterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    relationshipStateFilter = button.dataset.relationshipStateFilter || 'all';
    relationshipStateFilterButtons.forEach((filterButton) => {
      const isActive = filterButton === button;
      filterButton.classList.toggle('active', isActive);
      filterButton.setAttribute('aria-pressed', String(isActive));
    });
    renderRelationshipRolodex();
  });
});

drawerTray.addEventListener('click', async (event) => {
  const timelineAction = event.target.closest('[data-timeline-action]');
  if(timelineAction){
    event.preventDefault();
    event.stopPropagation();
    const firstReview = currentTimelineReviewItems[0] || null;
    const preflight = await ensureHearthClickPacket({node:timelineAction, packetName:'timeline_packet', action:timelineAction.dataset.timelineAction, allowBlockedForInspection:true, source:{review:firstReview, sourceId:firstReview?.id || 'timeline-drawer', sourceType:firstReview ? 'timeline_proposal' : 'timeline_drawer', sourceLabel:firstReview?.title || 'Timeline & Tasks', sourceItem:firstReview || {reviewCount:currentTimelineReviewItems.length}}});
    if(!preflight.ok) return;
    renderDrawerPacketReceiptStrip(preflight.packet || lastHearthPacketReceipt);
    if(timelineAction.dataset.timelineAction === 'cowork_timeline'){
      openTimelineCoworkSession();
      renderHearthPacketReceiptStrip(preflight.packet || lastHearthPacketReceipt);
    }
    return;
  }
  const timelineMatchAccept = event.target.closest('[data-timeline-match-accept]');
  if(timelineMatchAccept){
    event.preventDefault();
    event.stopPropagation();
    const preflight = await ensureHearthClickPacket({node:timelineMatchAccept, packetName:'timeline_packet', action:'timeline:match_accept:' + (timelineMatchAccept.dataset.timelineMatchCategory || ''), allowBlockedForInspection:true, source:timelineMatchSource(timelineMatchAccept.dataset.timelineMatchAccept, timelineMatchAccept.dataset.timelineMatchCategory, timelineMatchAccept.dataset.timelineMatchIndex)});
    if(!preflight.ok) return;
    renderDrawerPacketReceiptStrip(preflight.packet || lastHearthPacketReceipt);
    acceptTimelineLocalMatch(timelineMatchAccept.dataset.timelineMatchAccept, timelineMatchAccept.dataset.timelineMatchCategory, timelineMatchAccept.dataset.timelineMatchIndex);
    return;
  }
  const timelineMatchReview = event.target.closest('[data-timeline-match-review]');
  if(timelineMatchReview){
    event.preventDefault();
    event.stopPropagation();
    const reviewId = timelineMatchReview.dataset.timelineMatchReview;
    const preflight = await ensureHearthClickPacket({node:timelineMatchReview, packetName:'timeline_packet', action:'timeline:match_review', allowBlockedForInspection:true, source:timelineReviewSource(reviewId)});
    if(!preflight.ok) return;
    renderDrawerPacketReceiptStrip(preflight.packet || lastHearthPacketReceipt);
    timelineMatchReviewOpen[reviewId] = !timelineMatchReviewOpen[reviewId];
    renderTimelineReviewCards(currentTimelineReviewItems);
    return;
  }
  const timelineReviewAction = event.target.closest('[data-timeline-review-action]');
  if(timelineReviewAction){
    event.preventDefault();
    event.stopPropagation();
    const preflight = await ensureHearthClickPacket({node:timelineReviewAction, packetName:'timeline_packet', action:'timeline:review:' + (timelineReviewAction.dataset.timelineReviewAction || ''), source:timelineReviewSource(timelineReviewAction.dataset.timelineReviewId)});
    if(!preflight.ok) return;
    renderDrawerPacketReceiptStrip(preflight.packet || lastHearthPacketReceipt);
    await handleTimelineReviewAction(timelineReviewAction.dataset.timelineReviewId, timelineReviewAction.dataset.timelineReviewAction);
    return;
  }
  const projectReviewButton = event.target.closest('[data-project-review-update]');
  if(projectReviewButton){
    event.preventDefault();
    event.stopPropagation();
    const preflight = await ensureHearthClickPacket({node:projectReviewButton, packetName:'project_packet', action:'projectReviewUpdate'});
    if(!preflight.ok) return;
    const update = findProjectSourceReviewUpdate(projectReviewButton.dataset.projectReviewUpdate);
    await openProjectSourceReview(update);
    return;
  }
  const correspondenceAction = event.target.closest('[data-correspondence-action]');
  if(correspondenceAction){
    event.preventDefault();
    event.stopPropagation();
    const preflight = await ensureHearthClickPacket({node:correspondenceAction, packetName:'email_packet', action:correspondenceAction.dataset.correspondenceAction, source:{email:activeCorrespondenceItem || null, sourceId:activeCorrespondenceItem?.id || '', sourceType:'executive_inbox_item', sourceLabel:activeCorrespondenceItem?.title || 'Executive Inbox action', sourceItem:activeCorrespondenceItem || null}});
    if(!preflight.ok) return;
    await handleCorrespondenceAction(correspondenceAction.dataset.correspondenceAction);
    return;
  }
  const correspondenceItem = event.target.closest('[data-correspondence-item]');
  if(correspondenceItem){
    event.preventDefault();
    event.stopPropagation();
    const selected = currentCorrespondenceItems.find((item) => item.id === correspondenceItem.dataset.correspondenceItem);
    const preflight = await ensureHearthClickPacket({node:correspondenceItem, packetName:'email_packet', action:'email:select', allowBlockedForInspection:true, source:{email:selected || null, sourceId:selected?.id || correspondenceItem.dataset.correspondenceItem || '', sourceType:'executive_inbox_item', sourceLabel:selected?.title || 'Executive Inbox item', sourceItem:selected || null}});
    if(!preflight.ok) return;
    renderDrawerPacketReceiptStrip(preflight.packet || lastHearthPacketReceipt);
    if(selected) renderCorrespondenceBrief(selected);
    return;
  }
  const commitmentFilter = event.target.closest('[data-commitment-filter]');
  if(commitmentFilter){
    event.preventDefault();
    event.stopPropagation();
    const preflight = await ensureHearthClickPacket({node:commitmentFilter, packetName:'commitment_packet', action:'commitment:filter:' + (commitmentFilter.dataset.commitmentFilter || 'all'), allowBlockedForInspection:true, source:{...commitmentSource(activeCommitmentItem, 'commitment:filter'), sourceLabel:'Commitments filter', sourceType:'commitment_filter'}});
    if(!preflight.ok) return;
    renderDrawerPacketReceiptStrip(preflight.packet || lastHearthPacketReceipt);
    activeCommitmentFilter = commitmentFilter.dataset.commitmentFilter || 'all';
    commitmentFilterButtons.forEach((button) => {
      const isActive = button === commitmentFilter;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
    const rows = commitmentItemsForFilter();
    renderCommitmentBrief(rows.includes(activeCommitmentItem) ? activeCommitmentItem : rows[0]);
    return;
  }
  const commitmentAction = event.target.closest('[data-commitment-action]');
  if(commitmentAction){
    event.preventDefault();
    event.stopPropagation();
    const action = commitmentAction.dataset.commitmentAction;
    const preflight = await ensureHearthClickPacket({node:commitmentAction, packetName:'commitment_packet', action:'commitment:' + action, allowBlockedForInspection:true, source:commitmentSource(activeCommitmentItem, action)});
    if(!preflight.ok) return;
    renderDrawerPacketReceiptStrip(preflight.packet || lastHearthPacketReceipt);
    if(preflight.packet?.status === 'blocked' && commitmentActionNeedsLiveConfirmation(action)){
      if(commitmentStatus) commitmentStatus.textContent = 'VAL checked the commitment packet and needs more source context before this action can create or change anything. Receipt is shown above; no external action happened.';
      return;
    }
    await handleCommitmentAction(action);
    return;
  }
  const valAction = event.target.closest('[data-val-action]');
  if(valAction){
    event.preventDefault();
    event.stopPropagation();
    const preflight = await ensureHearthClickPacket({node:valAction, packetName:'val_os_packet', action:valAction.dataset.valAction});
    if(!preflight.ok) return;
    await handleValAction(valAction.dataset.valAction);
    return;
  }
  const drawerWorkflowAction = event.target.closest('[data-workflow-action]');
  if(drawerWorkflowAction){
    event.preventDefault();
    event.stopPropagation();
    await handleWorkflowAction(drawerWorkflowAction.dataset.workflowAction, drawerWorkflowAction);
    return;
  }
  const commitmentItem = event.target.closest('[data-commitment-item]');
  if(commitmentItem){
    event.preventDefault();
    event.stopPropagation();
    const selected = currentCommitmentItems.find((item) => item.id === commitmentItem.dataset.commitmentItem);
    const preflight = await ensureHearthClickPacket({node:commitmentItem, packetName:'commitment_packet', action:'commitment:select', allowBlockedForInspection:true, source:commitmentSource(selected, 'commitment:select')});
    if(!preflight.ok) return;
    renderDrawerPacketReceiptStrip(preflight.packet || lastHearthPacketReceipt);
    if(selected) renderCommitmentBrief(selected);
    return;
  }
  const pendingTemperatureReview = event.target.closest('[data-relationship-pending-temperature-review]');
  if(pendingTemperatureReview){
    event.preventDefault();
    event.stopPropagation();
    await openPendingRelationshipTemperatureReviewFromRolodex(pendingTemperatureReview);
    return;
  }
  const relationshipProfileButton = event.target.closest('[data-relationship-open-profile]');
  if(relationshipProfileButton){
    const profileId = relationshipProfileButton.dataset.relationshipOpenProfile;
    const profile = relationshipIndexSourceProfiles()[profileId] || relationshipProfiles[profileId] || relationshipIndexProfiles[profileId] || {};
    const preflight = await ensureHearthClickPacket({node:relationshipProfileButton, packetName:'relationship_packet', action:'relationship:open_profile', allowBlockedForInspection:true, source:relationshipSource({...profile, profileId}, 'relationship:open_profile')});
    if(!preflight.ok) return;
    renderDrawerPacketReceiptStrip(preflight.packet || lastHearthPacketReceipt);
    loadRelationshipDossier(relationshipProfileButton.dataset.relationshipOpenProfile);
    return;
  }
  const projectProfileButton = event.target.closest('[data-project-open-profile]');
  if(projectProfileButton){
    await ensureHearthClickPacket({node:projectProfileButton, packetName:'project_packet', action:'project:open_profile', allowBlockedForInspection:true});
    loadProjectDossier(projectProfileButton.dataset.projectOpenProfile);
    return;
  }
  const relationshipAction = event.target.closest('[data-relationship-action]');
  if(relationshipAction){
    event.preventDefault();
    const preflight = await ensureHearthClickPacket({node:relationshipAction, packetName:'relationship_packet', action:relationshipAction.dataset.relationshipAction, allowBlockedForInspection:true, source:relationshipSource(activeRelationshipProfile, relationshipAction.dataset.relationshipAction)});
    if(!preflight.ok) return;
    renderDrawerPacketReceiptStrip(preflight.packet || lastHearthPacketReceipt);
    handleRelationshipAction(relationshipAction.dataset.relationshipAction);
    return;
  }
  const projectAction = event.target.closest('[data-project-action]');
  if(projectAction){
    event.preventDefault();
    const preflight = await ensureHearthClickPacket({node:projectAction, packetName:'project_packet', action:projectAction.dataset.projectAction});
    if(!preflight.ok) return;
    handleProjectAction(projectAction.dataset.projectAction);
    return;
  }
  const roomButton = event.target.closest('[data-open-room]');
  if(!roomButton || roomButton.classList.contains('room-action')) return;
  closeDrawer();
  openWorkspace(roomButton.dataset.openRoom);
});

closeSourceDetail.addEventListener('click', () => {
  drawerTray.classList.remove('source-open');
  sourceDrawerLink.setAttribute('aria-expanded', 'false');
  document.querySelector('#source-detail').setAttribute('aria-hidden', 'true');
});

nextMeetingCard.addEventListener('click', () => openMeetingPrepWithPacket(nextMeetingCard, 0));
agendaItems.forEach((item) => {
  item.addEventListener('click', () => {
    if(item.classList.contains('active')) openMeetingPrepWithPacket(item, Number(item.dataset.calendarEventIndex || 0));
  });
});
coworkNotebook.addEventListener('click', () => openCoworkSessionWithPacket(coworkNotebook));
teachPen.addEventListener('click', () => openTeachValSessionWithPacket(teachPen));
linkedinWidget?.addEventListener('click', () => openLinkedInEngagementWorkspaceWithPacket(linkedinWidget));
updateLinkedInWidget();
calendarTab.addEventListener('click', () => {
  if(hearth.classList.contains('calendar-open')){
    closeCalendarPanel();
  } else {
    openCalendarPanelWithPacket(calendarTab);
  }
});
closeCalendarButton.addEventListener('click', closeCalendarPanel);
fullCalendarPanel?.addEventListener('click', (event) => {
  const agendaButton = event.target.closest('[data-calendar-event-index]');
  if(agendaButton){
    event.preventDefault();
    event.stopPropagation();
    openMeetingPrepWithPacket(agendaButton, Number(agendaButton.dataset.calendarEventIndex || 0));
    return;
  }
  const googleButton = event.target.closest('[data-google-oauth]');
  if(googleButton){
    event.preventDefault();
    event.stopPropagation();
    connectGoogleOAuth();
    return;
  }
  const actionButton = event.target.closest('[data-workflow-action]');
  if(actionButton){
    event.preventDefault();
    event.stopPropagation();
    handleWorkflowAction(actionButton.dataset.workflowAction, actionButton);
  }
});

scraperButtons.forEach((button) => {
  button.addEventListener('click', async () => {
    const type = button.dataset.openScraper || '';
    const preflight = await ensureHearthClickPacket({node:button, packetName:'lead_intelligence_packet', action:'lead_intelligence:open:' + type, source:{sourceId:type, sourceType:'lead_intelligence_workflow', sourceLabel:button.innerText || type, sourceItem:{id:type, title:button.innerText || type}}});
    if(!preflight.ok) return;
    renderDrawerPacketReceiptStrip(preflight.packet || lastHearthPacketReceipt);
    openScraper(type);
  });
});

async function routeWorkspaceActionClick(event){
  const homeActionButton = event.target.closest('[data-home-action]');
  if(homeActionButton){
    event.preventDefault();
    event.stopPropagation();
    await handleHomeRoomAction(homeActionButton.dataset.homeAction, homeActionButton);
    return true;
  }
  const actionButton = event.target.closest('[data-workflow-action]');
  if(!actionButton) return false;
  event.preventDefault();
  event.stopPropagation();
  await handleWorkflowAction(actionButton.dataset.workflowAction, actionButton);
  return true;
}

workspaceActions.addEventListener('click', (event) => {
  routeWorkspaceActionClick(event);
});
document.addEventListener('input', (event) => {
  const field = event.target;
  if(!isValAutocorrectField(field)) return;
  activeAutocorrectField = field;
  renderValAutocorrect(field);
});
document.addEventListener('focusin', (event) => {
  const field = event.target;
  if(!isValAutocorrectField(field)) return;
  activeAutocorrectField = field;
  renderValAutocorrect(field);
});
document.addEventListener('selectionchange', () => {
  if(activeAutocorrectField && document.activeElement === activeAutocorrectField){
    renderValAutocorrect(activeAutocorrectField);
  }
});
document.addEventListener('focusout', (event) => {
  if(isValAutocorrectField(event.target)){
    window.setTimeout(() => {
      if(!document.activeElement?.closest?.('.val-autocorrect')) removeValAutocorrect();
    }, 120);
  }
});
workspaceInputPanel.addEventListener('click', (event) => {
  const googleButton = event.target.closest('[data-google-oauth]');
  if(googleButton){
    event.preventDefault();
    event.stopPropagation();
    connectGoogleOAuth();
    return;
  }
  const actionButton = event.target.closest('[data-workflow-action]');
  if(actionButton){
    event.preventDefault();
    event.stopPropagation();
    handleWorkflowAction(actionButton.dataset.workflowAction, actionButton);
    return;
  }
  const tool = event.target.closest('[data-workspace-tool]');
  if(!tool) return;
  event.preventDefault();
  event.stopPropagation();
  if(tool.dataset.workspaceTool === 'voice'){
    startWorkspaceVoiceInput();
    return;
  }
  if(tool.dataset.workspaceTool === 'upload'){
    workspaceInputPanel.querySelector('[data-workspace-file-input]')?.click();
    return;
  }
  if(tool.dataset.workspaceTool === 'image'){
    appendWorkspaceImageRequest();
  }
});
workspaceInputPanel.addEventListener('change', async (event) => {
  const witnessingInput = event.target.closest('[data-val-witnessing-file-input]');
  if(witnessingInput){
    await appendValWitnessingFiles(witnessingInput.dataset.valWitnessingFileInput, witnessingInput.files);
    witnessingInput.value = '';
    return;
  }
  const input = event.target.closest('[data-workspace-file-input]');
  if(!input) return;
  await appendWorkspaceFiles(input.files);
  input.value = '';
});

deskWorkspace.addEventListener('click', async (event) => {
  const linkedinCopy = event.target.closest('[data-linkedin-copy]');
  if(linkedinCopy){
    event.preventDefault();
    event.stopPropagation();
    const item = linkedinVisibilityItems[Number(linkedinCopy.dataset.linkedinCopy)];
    if(!item) return;
    try{
      await navigator.clipboard.writeText(item.draftComment);
      linkedinCopy.textContent = 'Copied';
    }catch(error){
      renderWorkspaceInput({
        label: 'Draft comment',
        placeholder: 'Draft comment',
        helper: 'Clipboard access was unavailable, so VAL placed the comment here for review and manual copy.',
        mode: 'cowork',
        value: item.draftComment
      });
      linkedinCopy.textContent = 'Placed below';
    }
    return;
  }
  const promptCopy = event.target.closest('[data-workspace-prompt-copy]');
  if(promptCopy){
    event.preventDefault();
    event.stopPropagation();
    const prompt = activeWorkspacePromptCards[Number(promptCopy.dataset.workspacePromptCopy)]?.prompt || '';
    if(!prompt) return;
    try{
      await navigator.clipboard.writeText(prompt);
      promptCopy.textContent = 'Copied';
    }catch(error){
      const input = workspaceInputPanel.querySelector('textarea');
      if(input) input.value = prompt;
      promptCopy.textContent = 'Placed below';
    }
    return;
  }
  if(await routeWorkspaceActionClick(event)) return;
  const homeActionButton = event.target.closest('[data-home-action]');
  if(!homeActionButton) return;
  event.preventDefault();
  handleHomeRoomAction(homeActionButton.dataset.homeAction, homeActionButton);
});

scraperPreviewList.addEventListener('click', async (event) => {
  const linkedinCopy = event.target.closest('[data-linkedin-copy]');
  if(linkedinCopy){
    event.preventDefault();
    event.stopPropagation();
    const item = linkedinVisibilityItems[Number(linkedinCopy.dataset.linkedinCopy)];
    if(!item) return;
    try{
      await navigator.clipboard.writeText(item.draftComment);
      linkedinCopy.textContent = 'Copied';
    }catch(error){
      renderWorkspaceInput({
        label: 'Draft comment',
        placeholder: 'Draft comment',
        helper: 'Clipboard access was unavailable, so VAL placed the comment here for review and manual copy.',
        mode: 'cowork',
        value: item.draftComment
      });
      linkedinCopy.textContent = 'Placed below';
    }
    return;
  }
  const choice = event.target.closest('[data-preview-choice]');
  if(!choice) return;
  const lead = choice.closest('.preview-lead');
  const nextStatus = choice.dataset.previewChoice;
  const index = Number(lead.dataset.leadIndex);
  const activeSession = scraperSessions[activeScraperType];
  const selectedLead = activeSession?.previewLeads?.[index] || null;
  const preflight = await ensureHearthClickPacket({node:choice, packetName:'lead_intelligence_packet', action:'lead_intelligence:preview_choice:' + nextStatus, source:activeLeadIntelligenceSource('lead_intelligence:preview_choice:' + nextStatus, {sourceId:selectedLead?.id || String(index), sourceType:'lead_preview_row', sourceLabel:selectedLead?.name || selectedLead?.company || 'Lead preview row', sourceItem:selectedLead})});
  if(!preflight.ok) return;
  renderHearthPacketReceiptStrip(preflight.packet || lastHearthPacketReceipt);
  lead.dataset.leadReview = nextStatus;
  lead.querySelectorAll('[data-preview-choice]').forEach((button) => {
    button.classList.toggle('active', button === choice);
  });
  if(activeSession && activeSession.previewLeads[index]){
    activeSession.previewLeads[index]._approved = nextStatus !== 'held';
  }
  updatePreviewApprovalSummary();
});

switches.forEach((button) => {
  button.addEventListener('click', () => setState(button.dataset.stateOption));
});

roomButtons.forEach((button) => {
  button.addEventListener('click', () => handlePrimaryAction(button));
});

rooms.forEach((room) => {
  room.addEventListener('click', (event) => {
    if(event.target.closest('button')) return;
    const actionButton = room.querySelector('.room-action');
    if(actionButton) handlePrimaryAction(actionButton);
  });

  room.addEventListener('keydown', (event) => {
    if(event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    const actionButton = room.querySelector('.room-action');
    if(actionButton) handlePrimaryAction(actionButton);
  });
});

returnButton.addEventListener('click', closeWorkspace);

enableValAutocorrect(document);
observeHearthClickContracts();
setState(hearth.dataset.state || 'quiet');
hydrateHomePresence();
hydrateCalendarPanel();

if(location.hash === '#valWitnessingResume'){
  setTimeout(() => {
    openValWitnessingSession('meeting_val', {resume:true}).catch((error) => {
      valLiveStatus.textContent = 'Could not open the Witnessing Session: ' + error.message;
    });
  }, 120);
}
