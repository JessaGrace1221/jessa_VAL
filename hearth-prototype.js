const hearth = document.querySelector('.hearth-shell');
const title = document.querySelector('#hearth-title');
const witness = document.querySelector('[data-line="witness"]');
const orientation = document.querySelector('[data-line="orientation"]');
const permission = document.querySelector('[data-line="permission"]');
const evidence = document.querySelector('#hearth-evidence');
const observerBoardButton = document.querySelector('.observer-board-button');
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
const workspaceGrid = document.querySelector('.workspace-grid');
const workspaceActions = document.querySelector('.workspace-actions');
const leadSourcingDrawerWorkbench = document.querySelector('[data-lead-sourcing-drawer-workbench]');
const scraperCriteriaPanel = document.querySelector('.scraper-criteria-panel');
const scraperPreviewList = document.querySelector('.scraper-preview-list');
const leadDrawerCriteriaPanel = document.querySelector('[data-lead-drawer-criteria]') || scraperCriteriaPanel;
const leadDrawerPreviewList = document.querySelector('[data-lead-drawer-preview]') || scraperPreviewList;
const workspaceInputPanel = document.querySelector('.workspace-input-panel');
const workspacePacketReceipt = document.querySelector('[data-workspace-packet-receipt]');
const calendarPacketReceipt = document.querySelector('[data-calendar-packet-receipt]');
const drawerPacketReceipt = document.querySelector('[data-drawer-packet-receipt]');
let activeAutocorrectField = null;
const retrievalSystem = document.querySelector('.retrieval-system');
const drawerPull = document.querySelector('.drawer-pull');
const closeAllDrawersButton = document.querySelector('.close-all-drawers');
const drawerTray = document.querySelector('#drawer-tray');
const drawerCoworkIcon = document.querySelector('[data-drawer-cowork-icon]');
if(drawerCoworkIcon && drawerCoworkIcon.parentElement !== document.body){
  document.body.appendChild(drawerCoworkIcon);
}
const valDrawerLink = document.querySelector('.val-drawer-link');
const valDetail = document.querySelector('#val-detail');
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
const correspondenceThreadBody = document.querySelector('[data-correspondence-thread-body]');
const correspondenceDraftPreview = document.querySelector('[data-correspondence-draft-preview]');
const correspondenceDraftBody = document.querySelector('[data-correspondence-draft-body]');
const correspondenceSafety = document.querySelector('[data-correspondence-safety]');
const correspondenceRuleStatus = document.querySelector('[data-correspondence-rule-status]');
const correspondenceForwardTo = document.querySelector('[data-correspondence-forward-to]');
const correspondenceRulesPanel = document.querySelector('[data-correspondence-rules-panel]');
const correspondenceRulesList = document.querySelector('[data-correspondence-rules-list]');
const correspondenceRelationships = document.querySelector('[data-correspondence-relationships]');
const correspondenceProjects = document.querySelector('[data-correspondence-projects]');
const correspondenceRuleSuggestions = document.querySelector('[data-correspondence-rule-suggestions]');
const commitmentDrawerLink = document.querySelector('.commitment-drawer-link');
const closeCommitmentDetail = document.querySelector('.close-commitment-detail');
const commitmentList = document.querySelector('[data-commitment-list]');
const commitmentStatus = document.querySelector('[data-commitment-status]');
const commitmentEvidence = document.querySelector('[data-commitment-evidence]');
const commitmentFilterButtons = Array.from(document.querySelectorAll('[data-commitment-filter]'));
const transcriptCount = document.querySelector('[data-transcript-count]');
const transcriptList = document.querySelector('[data-transcript-list]');
const transcriptDetail = document.querySelector('[data-transcript-detail]');
const transcriptEmpty = document.querySelector('[data-transcript-empty]');
const timelineStatusPanel = document.querySelector('[data-timeline-status-panel]');
const timelineStatusCount = document.querySelector('[data-timeline-status-count]') || transcriptCount;
const timelineEventList = document.querySelector('[data-timeline-event-list]') || transcriptList;
const timelineEventCount = document.querySelector('[data-timeline-event-count]') || transcriptCount;
const timelineReviewCards = document.querySelector('[data-timeline-review-cards]') || transcriptDetail;
const timelineReviewCount = document.querySelector('[data-timeline-review-count]') || document.querySelector('[data-transcript-field="title"]');
const documentDrawerLink = document.querySelector('.document-drawer-link');
const closeDocumentDetail = document.querySelector('.close-document-detail');
const documentList = document.querySelector('[data-document-list]');
const documentCount = document.querySelector('[data-document-count]');
const documentSearchInput = document.querySelector('[data-document-search]');
const documentRelationshipFilter = document.querySelector('[data-document-relationship-filter]');
const documentProjectFilter = document.querySelector('[data-document-project-filter]');
const documentIntakeScan = document.querySelector('[data-document-intake-scan]');
const documentPreview = document.querySelector('[data-document-preview]');
const documentStatus = document.querySelector('[data-document-status]');
let currentTimelineReviewItems = [];
let currentTimelineTranscriptItems = [];
let currentTimelineTranscript = null;
const timelineReviewDecisions = {};
const timelineMatchReviewOpen = {};
let currentCorrespondenceItems = [];
let activeCorrespondenceItem = null;
let currentCorrespondenceRules = [];
let currentCorrespondenceRuleSuggestions = [];
let dismissedCorrespondenceRuleSuggestions = new Set();
let currentCorrespondenceScanDays = 14;
let currentCorrespondenceScanStatus = '';
let correspondenceScanInFlight = false;
let currentCommitmentItems = [];
let activeCommitmentItem = null;
let activeCommitmentFilter = 'all';
let currentDocumentItems = [];
let activeDocumentItem = null;
const DOCUMENT_PROJECT_ASSIGNMENTS_STORAGE_KEY = 'val_document_project_assignments_v1';
const projectRolodex = document.querySelector('[data-project-rolodex]');
const projectSuggestions = document.querySelector('[data-project-suggestions]');
const projectIndexSource = document.querySelector('[data-project-index-source]');
const projectCreateToggle = document.querySelector('[data-project-create-toggle]');
const projectCreateForm = document.querySelector('[data-project-create-form]');
const projectCreateStatus = document.querySelector('[data-project-create-status]');
const projectFileInput = document.querySelector('[data-project-create-form] input[type="file"]');
const projectFileReceipt = document.querySelector('[data-project-file-receipt]');
const projectTitle = document.querySelector('[data-project-title]');
const projectSubtitle = document.querySelector('[data-project-subtitle]');
const projectManagerProfile = document.querySelector('[data-project-manager-profile]');
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
const stewardshipViewButtons = Array.from(document.querySelectorAll('[data-stewardship-view]'));
const stewardshipPanels = Array.from(document.querySelectorAll('[data-stewardship-panel]'));
const stewardshipSuggestions = document.querySelector('[data-stewardship-suggestions]');
const stewardshipPersonASelect = document.querySelector('[data-stewardship-person-a]');
const stewardshipPersonBSelect = document.querySelector('[data-stewardship-person-b]');
const stewardshipComparison = document.querySelector('[data-stewardship-comparison]');
const stewardshipNetworkDetail = document.querySelector('[data-stewardship-network-detail]');
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
let activeClarityWorkspace = null;
let activeRelationshipProfile = null;
let activeProjectProfile = null;
let activeProjectCoworkTarget = null;
let activeIntroDraftCandidate = null;
let activeRelationshipTemperatureReviewUpdate = null;
let activeProjectSourceReviewUpdate = null;
let activeMeetingContactCandidates = {};
let activeMeetingPrepBriefing = null;
let activeValOnboardingSessionId = '';
let activeValWitnessingSessionId = '';
let activeWorkspacePromptCards = [];
let activeCoworkHeldContext = '';
let activeCoworkContextLocked = false;
let currentCalendarEvents = [];
let currentMeetingEvents = [];
let calendarPanelShouldScrollToCurrent = false;
let valOnboardingRouteState = {supportCircle: [], documentExamples: [], connections: []};
const homeRoomQueues = {velocity: [], alignment: [], leverage: []};
let workspaceReturnTarget = 'home';

const selfCalendarEmails = ['jessa@jessagrace.com','jessa@goallprogram.com','jessa@goalprogram.com','jessa.grace@gmail.com'];

function calendarEventAttendees(event = {}){
  return Array.isArray(event.attendees) ? event.attendees.filter(Boolean) : [];
}

function calendarAttendeeEmail(attendee = {}){
  return String(attendee.email || attendee.address || attendee.emailAddress?.address || attendee.mail || '').trim().toLowerCase();
}

function calendarAttendeeLooksLikeSelf(attendee = {}){
  const email = calendarAttendeeEmail(attendee);
  if(attendee.self) return true;
  return Boolean(email && selfCalendarEmails.includes(email));
}

function calendarEventExternalAttendees(event = {}){
  return calendarEventAttendees(event).filter((attendee) => !calendarAttendeeLooksLikeSelf(attendee) && (attendee.name || calendarAttendeeEmail(attendee)));
}

function calendarEventLooksPrivateBlock(event = {}){
  const text = [event.title, event.summary, event.description, event.location].filter(Boolean).join(' ').toLowerCase();
  return /\b(mammogram|screening|doctor|dentist|therapy|medical|appointment|annual physical|haircut|personal block|focus block|thinking day|ceo thinking day)\b/.test(text);
}

function calendarEventStartDate(event = {}){
  const value = event.start || event.startTime || event.date || '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function calendarEventIsPast(event = {}){
  const date = calendarEventStartDate(event);
  return !!date && date.getTime() < Date.now();
}

function calendarEventIsMeeting(event = {}){
  return calendarEventExternalAttendees(event).length > 0 && !calendarEventLooksPrivateBlock(event);
}

function calendarEventIsFutureMeeting(event = {}){
  return calendarEventIsMeeting(event) && !calendarEventIsPast(event);
}

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
  observer_board_packet: {
    requiredLayers: ['witnessing_root','home_presence','observer_truths','chief_of_staff_synthesis','val_os_rules'],
    sourceWeb: ['observer.current_truths','observer.evidence_receipts','home.executive_queue','source_receipts'],
    graphLinks: ['calendar.today','emails.thread.current','relationships.list','projects.active','recent_transcripts','tasks.open','prepared_work'],
    requiredVariables: ['{{teach_val.reviewed_memory}}','{{onboarding.first_understanding}}','{{observer.current_truths}}','{{observer.evidence_receipts}}','{{chief_of_staff.current_view}}','{{val.confidence}}','{{val.uncertainty}}']
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
  {selector:'.observer-board-button', contract:'home.board_of_observers', packet:'observer_board_packet', rule:'Board of Observers inspection rule', actions:'Open observer truths and Chief of Staff synthesis', never:'Do not mutate source data or memory'},
  {selector:'.return-button,.close-calendar-button,.close-val-detail,.close-document-detail,.close-relationship-detail,.close-project-detail,.close-timeline-detail,.close-correspondence-detail,.close-commitment-detail,.close-source-detail', contract:'nav.close_context', packet:'active_context_packet', rule:'Close active context without mutation', actions:'Close active card/detail and return to prior Hearth context', never:'Do not save, send, import, or mutate while closing'},
  {selector:'.workspace-card button,.workspace-actions button:not([data-workflow-action])', contract:'workspace.static_action', packet:'workspace_seed_packet', rule:'Static workspace action rule', actions:'Open the matching review/approval/teaching workspace only', never:'Do not execute external action from static demo card'},
  {selector:'.source-action', contract:'nav.source_action', packet:'source_navigation_packet', rule:'Source navigation rule', actions:'Open the named source surface only', never:'Do not mutate source data or infer approval from navigation'},
  {selector:'.lean-button', contract:'home.why_today', packet:'home_presence_packet', rule:'Daily witness explanation rule', actions:'Open or close evidence panel', never:'Do not create tasks or drafts'},
  {selector:'.fresh-desk-button', contract:'home.fresh_desk', packet:'home_session_packet', rule:'Session room-attendance reset rule', actions:'Clear session held marks', never:'Do not clear memory or source records'},
  {selector:'.next-meeting-card,.calendar-tab,.agenda-item,[data-calendar-event-index]', contract:'timeline.calendar_panel', packet:'timeline_packet', rule:'Calendar sidebar and meeting prep rule', actions:'Open calendar or meeting prep', never:'Do not create or update calendar events'},
  {selector:'.cowork-notebook', contract:'home.cowork_companion', packet:'cowork_packet', rule:'Co-Work prompt suite', actions:'Think with VAL, Draft with VAL', never:'Do not send, save memory, or mutate external systems'},
  {selector:'.teach-pen', contract:'home.teach_val_companion', packet:'val_os_packet', rule:'Teach VAL extraction/review prompt', actions:'Review what I taught VAL', never:'Do not save durable memory without review'},
  {selector:'.linkedin-widget,[data-linkedin-copy],[data-linkedin-link]', contract:'home.linkedin_visibility', packet:'relationship_packet', rule:'LinkedIn visibility preparation rule', actions:'Copy manually, open source link', never:'Do not post to LinkedIn'},
  {selector:'.living-room .room-action[data-open-room="velocity"]', contract:'home.velocity_card', packet:'home_source_packet', rule:'Homepage Momentum/Velocity observer + workspace rule', actions:'Open source, Review evidence, source-specific action', never:'Do not blend in unrelated Home items'},
  {selector:'.living-room .room-action[data-open-room="alignment"]', contract:'home.alignment_card', packet:'home_source_packet', rule:'Highest Leverage / Alignment judge prompt', actions:'Open source, Draft reply/Create task for email, Review evidence', never:'Do not open a different relationship/project than the card named'},
  {selector:'.living-room .room-action[data-open-room="leverage"]', contract:'home.leverage_card', packet:'home_source_packet', rule:'Ready For You / Prepared Work prompt suite', actions:'Open prepared draft, refine prepared work, approve prepared work', never:'Do not expose queue rows as extra CTAs'},
  {selector:'[data-home-room-source]', contract:'home.source_row', packet:'source_display_packet', rule:'Source receipt display rule', actions:'None; evidence row only', never:'Do not act from source rows'},
  {selector:'[data-home-action]', contract:'home.dynamic_action', packet:'home_source_packet', rule:'Home action posture or source-specific action rule', actions:'Only actions listed in active workspace', never:'Do not use stale active source'},
  {selector:'.drawer-pull,.close-all-drawers', contract:'drawer.index', packet:'drawer_index_packet', rule:'Drawer retrieval rule', actions:'Open/close drawer tray', never:'Do not load unrelated drawer detail panels'},
  {selector:'.relationship-drawer-link,[data-relationship-profile],[data-relationship-open-profile],[data-relationship-state-filter],[data-relationship-action],[data-relationship-pending-temperature-review],[data-relationship-search],[data-relationship-sort]', contract:'drawer.relationships', packet:'relationship_packet', rule:'Stewardship understanding prompt suite', actions:'Open Stewardship view, filter, search, sort, scoped Stewardship actions', never:'Do not expose internal packet/debug language in the drawer'},
  {selector:'.project-drawer-link,[data-project-open-profile],[data-project-action],[data-project-cowork-scope],[data-project-cowork-field],[data-project-create-toggle],[data-project-create-cancel],[data-project-review-update],[data-project-document-action]', contract:'drawer.projects', packet:'project_packet', rule:'Project understanding prompt suite', actions:'Open full Project Manager page, scoped Co-Work, review source learning, assign documents to projects, create explicit project records only through the creation flow', never:'Do not create, mutate, or broaden project context without explicit flow'},
  {selector:'.timeline-drawer-link,[data-timeline-action],[data-timeline-match-review],[data-timeline-match-accept],[data-timeline-review-action]', contract:'drawer.timeline', packet:'timeline_packet', rule:'Calendar/transcript/task observer rules', actions:'Co-Work and review timeline proposals', never:'Do not create notes or tasks without review'},
  {selector:'.correspondence-drawer-link,[data-correspondence-item],[data-correspondence-action]', contract:'drawer.executive_inbox', packet:'email_packet', rule:'Executive Inbox classification/draft prompt suite', actions:'Edit draft, send, Co-Work, mark not executive contact', never:'Do not expose raw packet context or unrelated relationship/project context'},
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
  actions: ['Open meeting prep', 'Open Acme in CRM', 'Run Apollo refresh', 'Run Outscraper refresh'],
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

const observerBoardState = {
  chiefOfStaff: {
    view: 'No live Board packet is loaded for this session yet.',
    why: 'The Board should synthesize real drawer packets from Velocity, Alignment, Leverage, Relationships, Projects, Transcripts, Executive Inbox, and Commitments. This surface should not invent an executive recommendation when those packets are missing.',
    next: 'Use this as a readiness check only. Open the specific drawer you care about, or teach VAL what evidence the Board should review before it advises you.'
  },
  observers: [
    {name: 'Executive Inbox', truth: 'Not ready to advise from the Board.', evidence: 'Requires a live email packet with sender, thread, relationship, draft, and rule context.', stance: 'Needs packet'},
    {name: 'Relationships', truth: 'Not ready to advise from the Board.', evidence: 'Requires relationship packet evidence, recent signal, source, and missing-context notes.', stance: 'Needs packet'},
    {name: 'Projects', truth: 'Not ready to advise from the Board.', evidence: 'Requires project packet evidence, current phase, next move, owner, and source receipts.', stance: 'Needs packet'},
    {name: 'Transcripts', truth: 'Not ready to advise from the Board.', evidence: 'Requires transcript packet evidence with matched event, attendees, project, and review status.', stance: 'Needs packet'},
    {name: 'Velocity', truth: 'Not ready to advise from the Board.', evidence: 'Requires confirmed changes since the user was away.', stance: 'Needs packet'},
    {name: 'Alignment', truth: 'Not ready to advise from the Board.', evidence: 'Requires a ranked priority packet instead of a generic priority list.', stance: 'Needs packet'},
    {name: 'Leverage', truth: 'Not ready to advise from the Board.', evidence: 'Requires prepared drafts or artifacts VAL actually made while the user was away.', stance: 'Needs packet'},
    {name: 'Commitments', truth: 'Not ready to advise from the Board.', evidence: 'Requires who owes whom what, by when, and the source quote behind it.', stance: 'Needs packet'}
  ]
};

const coworkSession = {
  lens: 'Co-Work with VAL',
  title: 'Co-Work w/ VAL',
  meaning: 'What shall we accomplish together?',
  understanding: [
    'What shall we accomplish together?'
  ],
  recommendation: '',
  actions: []
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
    senderEmail: 'aric@example.com',
    senderName: 'Aric Soyring',
    receivedAt: 'Today',
    threadMessages: [
      {from:'Aric Soyring',date:'Today',body:'Can you send over the cleaner partner path before we pull anyone else into the Frisson work?'},
      {from:'Jessa',date:'Earlier',body:'Yes. I want to keep the partner motion narrow until the next step is actually clear.'}
    ],
    relationships: ['Aric Soyring · warm strategic partner', 'Fred · possible partner path'],
    projects: ['Frisson · partner workflow', 'Lead Intelligence launch'],
    ruleSuggestions: ['If Aric asks for partner-path materials twice, suggest a prepared Frisson packet before drafting.'],
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
    senderEmail: 'greg@example.com',
    senderName: 'Greg Niesen',
    receivedAt: 'Yesterday',
    threadMessages: [
      {from:'Greg Niesen',date:'Yesterday',body:'Can you confirm pricing and the scope for the proposal?'},
      {from:'Jessa',date:'Earlier',body:'I want to make sure I answer with the right scope and not half-answer this.'}
    ],
    relationships: ['Greg Niesen · active proposal context'],
    projects: ['Acme proposal · terms need review'],
    ruleSuggestions: ['Pricing, legal, or terms questions should stay approval-required unless a narrow rule exists.'],
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
    trustLevel: 'High',
    relationshipState: 'strategic',
    relationshipStateLabel: 'Strategic',
    sourceEvidence: 'CRM contact, Frisson notes, and partner-path context all point to active leverage.',
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
    nextMove: 'Review the Frisson partnership direction before the next follow-up.',
    risk: 'No urgent trust risk, but do not let more than two weeks pass without a meaningful touchpoint.',
    keyFacts: ['Strategic partner', 'High trust', 'Warm and growing', 'Best engaged through clear opportunities'],
    whatChanged: ['Accepted the Frisson consulting direction.', 'Suggested two new partner paths.', 'Mentioned community partnerships.'],
    executiveAdvice: ['Bring him opportunities, not problems.', 'Use conversation for strategy and short writing for decisions.', 'Protect this relationship because it compounds.'],
    activeThreads: ['Frisson', 'Partner strategy', 'Community partnerships'],
    openLoops: ['Proposal review', 'Partner workflow feedback', 'Follow-up after introduction'],
    valueUserCreates: ['Seeing patterns and building systems he can execute within.', 'Providing strategic clarity and decision frameworks.', 'Opening doors to aligned partners and opportunities.'],
    valueTheyCreate: ['Driving momentum and execution forward.', 'Bringing ideas to life in the real world.', 'Challenging you to think bigger and move faster.'],
    livingNarrative: 'The relationship began through shared Frisson work and has expanded into a strategic partnership around larger momentum.',
    timeline: ['Beginning: connected through HelpByShopping foundation.', 'Trust: early collaboration proved reliability.', 'Breakthroughs: built partner workflows and saw real impact.', 'Current season: shaping a bigger vision together.', 'Open future: expanding influence and lasting impact.'],
    recentActivity: ['Meeting with Aric · Jun 12', 'Email from Aric · Jun 10', 'LinkedIn post · Jun 8'],
    relatedWork: ['Frisson · Active thread', 'Partner Consulting · Opportunity', 'VAL Round Table · Relevant discussions'],
    notesToSee: ['Aric mentioned a possible introduction to a foundation that aligns with your values.'],
    linkedinSignal: 'Recent LinkedIn activity is worth watching for a thoughtful comment before the next Frisson follow-up.',
    sourceReceipts: 'CRM contact resolved · LinkedIn watching · Apollo available · Outscraper available',
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
    trustLevel: 'Medium',
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
    nextMove: 'Reply with the cleanest next decision and create one follow-up task.',
    risk: 'Ambiguity is the trust risk. A precise next step protects momentum better than a longer explanation.',
    keyFacts: ['Proposal decision partner', 'Responds to specificity', 'Waiting on clarity'],
    whatChanged: ['Answered the proposal question that was blocking the next step.', 'Moved the thread from broad possibility into a concrete decision.', 'Made follow-up possible without persuasion.'],
    executiveAdvice: ['Name the decision plainly.', 'Do not add extra options unless he asks.', 'Use a short reply and one dated task.'],
    activeThreads: ['Acme proposal', 'Decision clarity'],
    openLoops: ['Proposal reply', 'Follow-up task with due date'],
    valueUserCreates: ['Translating broad options into clear decisions.', 'Protecting scope from expanding too fast.'],
    valueTheyCreate: ['Practical decision clarity.', 'Direct answers that can unblock work.'],
    livingNarrative: 'This relationship is becoming more operational: fewer broad ideas, more decisions that move the proposal forward.',
    timeline: ['Beginning: proposal conversation opened.', 'Trust: direct reply clarified the blocker.', 'Current season: decision path needs precision.', 'Open future: proposal can move if follow-up stays narrow.'],
    recentActivity: ['Proposal reply received', 'Acme proposal thread updated'],
    relatedWork: ['Acme proposal · Active thread', 'Executive Inbox · Reply draft'],
    notesToSee: ['Do not let silence become ambiguity.'],
    linkedinSignal: 'LinkedIn is quiet; the stronger signal is the direct proposal reply already in the relationship file.',
    sourceReceipts: 'CRM contact resolved · LinkedIn watching · Apollo available · Outscraper watching',
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
    trustLevel: 'High',
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
    nextMove: 'Follow through carefully before adding any new ask.',
    risk: 'Overpromising is the risk. Reliability matters more than speed here.',
    keyFacts: ['Trust holder', 'Warm relationship', 'Follow-through sensitive'],
    whatChanged: ['Recent notes reinforced that timing matters.', 'One follow-up should be handled carefully rather than rushed.'],
    executiveAdvice: ['Make fewer promises and keep them cleanly.', 'Use gentle language and specific follow-through.', 'Do not turn care into urgency.'],
    activeThreads: ['Partner network', 'Relationship continuity'],
    openLoops: ['Careful follow-up'],
    valueUserCreates: ['Continuity, thoughtfulness, and careful execution.', 'Clear memory across relationship-dependent work.'],
    valueTheyCreate: ['Reputation protection and trust continuity.', 'Human signal when work needs care.'],
    livingNarrative: 'This relationship deepens through reliability rather than volume. It should be protected through careful follow-through.',
    timeline: ['Beginning: shared relationship memory.', 'Trust: consistency became the signal.', 'Current season: protect warmth with careful follow-through.'],
    recentActivity: ['Trust note reviewed', 'Follow-up timing surfaced'],
    relatedWork: ['Partner Network · Warm thread'],
    notesToSee: ['Consistency matters more than speed here.'],
    linkedinSignal: 'A recent network post may be a natural place to reinforce shared trust without creating a new ask.',
    sourceReceipts: 'CRM contact resolved · LinkedIn watching · Apollo watching · Outscraper available',
    href: './dashboard.html?view=relationships&targetType=person&targetId=lindsey-wincek'
  }
};

const relationshipTemperatureModel = {
  needs_attention: {
    label: 'Needs attention',
    scoreRange: [0, 54],
    meaning: 'Trust, clarity, or follow-through needs executive care before action.',
    observers: ['CRM', 'calendar', 'email', 'transcripts', 'Teach VAL']
  },
  warm: {
    label: 'Warm',
    scoreRange: [55, 79],
    meaning: 'The relationship is healthy enough for thoughtful continuation.',
    observers: ['CRM', 'LinkedIn', 'calendar', 'email', 'Teach VAL']
  },
  strategic: {
    label: 'Strategic',
    scoreRange: [80, 100],
    meaning: 'This relationship creates meaningful leverage and should be handled deliberately.',
    observers: ['CRM', 'LinkedIn', 'Apollo', 'Outscraper', 'Teach VAL']
  },
  new: {
    label: 'New',
    scoreRange: [45, 70],
    meaning: 'Identity is known, but VAL needs more evidence before forming strong judgment.',
    observers: ['CRM', 'calendar', 'email']
  },
  waiting: {
    label: 'Waiting',
    scoreRange: [45, 75],
    meaning: 'A known loop is open; the next move should preserve clarity without creating pressure.',
    observers: ['CRM', 'email', 'calendar', 'Teach VAL']
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
      relationships: 'Stewardship is the model for this project drawer.',
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
    nextMoveEvidence: 'Use Lead Intelligence as source material, then decide priority in the Project Managers drawer.',
    sourceReceipts: 'Lead Intelligence · CRM duplicate checks · project notes',
    sourceDetails: {
      files: [],
      websiteSource: 'Lead Intelligence preview and duplicate-check sources.',
      documents: 'Project notes are referenced, not uploaded in this local preview.',
      relationships: 'Approved leads, CRM contact context, and project owner notes.',
      rawContext: 'Preview project context only.'
    },
    href: './dashboard.html?view=projects&projectId=client-pipeline'
  }
};

const PROJECT_MANAGER_HEADER_COLORS = [
  {name:'Frost',hex:'#e7f7f7',family:'white'},
  {name:'Pearl',hex:'#f8f8f5',family:'white'},
  {name:'Alabaster',hex:'#f3efe5',family:'white'},
  {name:'Snow',hex:'#edf8f8',family:'white'},
  {name:'Ivory',hex:'#f7f1df',family:'white'},
  {name:'Cotton',hex:'#fbfbf4',family:'white'},
  {name:'Lace',hex:'#f7eee8',family:'white'},
  {name:'Porcelain',hex:'#fbfbf8',family:'white'},
  {name:'Rose',hex:'#f48aa8',family:'rose'},
  {name:'Blush',hex:'#f7b6d5',family:'rose'},
  {name:'Coral',hex:'#ff735f',family:'rose'},
  {name:'Peach',hex:'#fa8f7f',family:'rose'},
  {name:'Taffy',hex:'#ee78bf',family:'rose'},
  {name:'Ballet Slipper',hex:'#e99abc',family:'rose'},
  {name:'Sage',hex:'#78916f',family:'green'},
  {name:'Fern',hex:'#5eb866',family:'green'},
  {name:'Olive',hex:'#9abc6a',family:'green'},
  {name:'Moss',hex:'#3e6d1f',family:'green'},
  {name:'Seafoam',hex:'#41dfa7',family:'green'},
  {name:'Mint',hex:'#94e3bb',family:'green'},
  {name:'Basil',hex:'#2d6332',family:'green'},
  {name:'Pistachio',hex:'#bad8c7',family:'green'}
];
const PROJECT_ONBOARDING_FIRST_QUESTION = 'What should this project be called, and what outcome should it create?';
const PROJECT_INTERVIEW_STAGE_CONTRACTS = {
  first_question: {
    question: PROJECT_ONBOARDING_FIRST_QUESTION,
    detail: 'Feeds Identity, What this is, and Working narrative.',
    placeholder: 'Project name: ... Outcome: ...',
    missingField: 'identity_and_outcome',
    targetPacketField: 'project_identity_packet.canonical_name + project_identity_packet.desired_outcome',
    pageBoxes: ['Identity', 'What this is', 'Working narrative']
  },
  owner_monitoring: {
    question: 'Who owns this project, what is the next move, and what should VAL monitor?',
    detail: 'Feeds People involved, Next move, and Monitoring after launch.',
    placeholder: 'Owner: ... Next move: ... VAL should monitor...',
    missingField: 'owner_next_move_monitoring',
    targetPacketField: 'project_owner_packet + project_next_action_packet.next_action + project_sop_packet.monitoring_rules',
    pageBoxes: ['People involved', 'Next move', 'Monitoring after launch']
  },
  workstreams: {
    question: 'What are the main workstreams VAL should track for this project?',
    detail: 'Feeds Workstreams.',
    placeholder: 'Workstreams: CRM setup, payment processing, contact forms...',
    missingField: 'workstreams',
    targetPacketField: 'project_sop_packet.default_workstreams',
    pageBoxes: ['Workstreams']
  },
  milestones: {
    question: 'What milestones prove this project is moving?',
    detail: 'Feeds Milestones and Current phase.',
    placeholder: 'Milestones: CRM configured, payment flow tested, contact forms live...',
    missingField: 'milestones',
    targetPacketField: 'project_sop_packet.standard_milestones + project_sop_packet.current_phase',
    pageBoxes: ['Milestones', 'Current phase']
  },
  relationship_nurture: {
    question: 'How should VAL help protect and grow the relationships connected to this project?',
    detail: 'Feeds Relationship nurture.',
    placeholder: 'Cadence: ... Protect trust by... Avoid...',
    missingField: 'relationship_nurture',
    targetPacketField: 'project_sop_packet.relationship_nurture_rules',
    pageBoxes: ['Relationship nurture']
  },
  prepared_work: {
    question: 'What should VAL prepare, organize, or ask about next for this project?',
    detail: 'Feeds Prepared work and What VAL needs next.',
    placeholder: 'VAL should prepare... Ask me for... Use these documents...',
    missingField: 'prepared_work',
    targetPacketField: 'project_prepared_work_packets + project_interview_packet.current_question',
    pageBoxes: ['Prepared work', 'What VAL needs next']
  },
  complete: {
    question: 'What should VAL refine next on this Project Manager page?',
    detail: 'Feeds the specific card you choose.',
    placeholder: 'Refine the next move, workstreams, milestones, risks, documents, or relationship nurture...',
    missingField: '',
    targetPacketField: 'project_manager_packet',
    pageBoxes: ['Project Manager page']
  }
};

let relationshipIndexSearch = '';
let relationshipStateFilter = 'all';
let relationshipSortMode = 'attention';
let relationshipIndexProfiles = {};
let relationshipIndexLoaded = false;
let relationshipIndexRequest = null;
let relationshipIndexSourceLabel = 'Local preview';
let relationshipPersonPacketIndex = {};
let relationshipPeopleToWatchExpanded = false;
let stewardshipActiveView = 'suggested';
let stewardshipSelectedNetworkId = '';
let stewardshipPersonAId = '';
let stewardshipPersonBId = '';
let relationshipTeachMode = 'relationship';
let relationshipTeachSection = 'relationship';
let activeRelationshipActionSection = '';
let projectIndexProfiles = {};
let projectIndexLoaded = false;
let projectIndexRequest = null;
let projectIndexSourceLabel = 'Local project preview';
let currentProjectSuggestionItems = [];
let projectSuggestionRequest = null;
let projectPinComposerOpen = false;
let projectEditComposerOpen = false;
const projectPinStatusByProject = {};
const projectEditStatusByProject = {};
const projectOwnerStatusByProject = {};
let projectPinAlignmentRequest = null;

function updateRelationshipIndexSourceLabel(){
  if(!relationshipIndexSource) return;
  const count = Object.keys(relationshipIndexSourceProfiles()).length;
  relationshipIndexSource.textContent = relationshipIndexSourceLabel + ' · ' + count + ' ' + (count === 1 ? 'relationship' : 'relationships');
}

function defaultRelationshipSectionActions(name = 'this relationship'){
  return {
    identity:[],
    evidence:[
      {id:'open_evidence',label:'Open evidence',intent:'inspect',section:'evidence',willDo:'Open source evidence connected to this relationship.',willNotDo:'VAL will not change records.'},
      {id:'create_task_from_loop',label:'Turn loop into task',intent:'commitment',section:'evidence',willDo:'Create a local VAL task from an open loop.',willNotDo:'VAL will not invite, email, or write to CRM.'}
    ],
    current_read:[],
    what_changed:[],
    patterns:[],
    meaning:[],
    wisdom:[],
    certainty:[],
    executive_advice:[],
    risk:[],
    active_threads:[
      {id:'cowork_active_threads',label:'Discuss threads',intent:'cowork',section:'active_threads',willDo:'Open Co-Work scoped to active threads.',willNotDo:'No email, CRM update, task, or external action will happen.'}
    ],
    open_loops:[
      {id:'create_task_from_open_loop',label:'Turn loop into task',intent:'commitment',section:'open_loops',willDo:'Prepare a local VAL task from an open loop.',willNotDo:'No email, invite, or CRM write will happen.'}
    ],
    mutual_value:[],
    living_narrative:[],
    timeline:[],
    recent_activity:[],
    related_work:[],
    notes_to_see:[]
  };
}

const leadScraperDefinitionStorageKey = 'val_lead_scraper_definitions_v1';

function storedLeadScraperDefinitionValues(){
  try{
    const parsed = JSON.parse(localStorage.getItem(leadScraperDefinitionStorageKey) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  }catch(error){
    return {};
  }
}

function leadScraperField(type, key, fallback = ''){
  const stored = storedLeadScraperDefinitionValues();
  return stored[type]?.[key] || fallback;
}

function saveLeadScraperCriteria(type, criteria = {}){
  try{
    const stored = storedLeadScraperDefinitionValues();
    stored[type] = {...(stored[type] || {}), ...criteria};
    localStorage.setItem(leadScraperDefinitionStorageKey, JSON.stringify(stored));
  }catch(error){
    console.warn('[hearth] lead scraper definition could not be saved locally', error.message);
  }
}

const leadScraperDefinitions = {
  organizations: {
    scraperId: 'frisson_organizations',
    userLabel: 'Organizations',
    purpose: 'Find nonprofit organizations that may benefit from Frisson.',
    clientTemplate: 'frisson',
    routeBase: '/api/frisson/organizations',
    recommendedAction: 'Start organization scrape',
    crmDestination: {
      provider: 'ghl',
      label: 'Frisson Organizations / New Organization Lead',
      pipeline: 'Frisson Organizations',
      stage: 'New Organization Lead',
      tags: ['Frisson Lead', 'Organization']
    },
    criteriaFields: [
      {key:'scraper_name',label:'Scraper name',value:'Organizations'},
      {key:'lead_type',label:'Lead type',type:'select',value:'Nonprofit organizations',options:['Nonprofit organizations','Community organizations','Mission-aligned companies']},
      {key:'market',label:'Market',value:'United States'},
      {key:'category',label:'Category or keywords',value:'animal rescues, food banks, youth programs'},
      {key:'limit',label:'Preview count',type:'number',value:'12'},
      {key:'criteria',label:'Qualification rule',type:'textarea',value:'Find organizations with visible donation, volunteer, community, or partnership signals and enough public evidence for review.'}
    ],
    sourceReadiness: [
      ['Level 1 discovery', 'Outscraper/public business search'],
      ['Level 2 decision maker', 'Decision-maker enrichment when available'],
      ['Level 3 confirmation/dedupe', 'CRM duplicate check + optional verification'],
      ['Import policy', 'Approved only']
    ]
  },
  partners: {
    scraperId: 'frisson_partners',
    userLabel: 'Partners',
    purpose: 'Find companies, advisors, agencies, and platforms that can become Frisson referral or strategic partners.',
    clientTemplate: 'frisson',
    routeBase: '/api/frisson/partners',
    recommendedAction: 'Run partner scrape',
    crmDestination: {
      provider: 'ghl',
      label: 'Frisson Partners / New Partner Lead',
      pipeline: 'Frisson Partners',
      stage: 'New Partner Lead',
      tags: ['Frisson Lead', 'Partner']
    },
    criteriaFields: [
      {key:'scraper_name',label:'Scraper name',value:'Partners'},
      {key:'partner_type',label:'Partner type',type:'select',value:'Nonprofit consultants',options:['Nonprofit consultants','Grant writers','CSR consultants','Fundraising advisors','Referral partners']},
      {key:'market',label:'Market',value:'United States'},
      {key:'category',label:'Category or keywords',value:'grant writers, nonprofit consultants, CSR consultants'},
      {key:'limit',label:'Preview count',type:'number',value:'12'},
      {key:'criteria',label:'Qualification rule',type:'textarea',value:'Find organizations that serve nonprofits and could refer, distribute, recommend, introduce, or partner with Frisson.'}
    ],
    sourceReadiness: [
      ['Level 1 discovery', 'Outscraper/public business search'],
      ['Level 2 decision maker', 'Partner contact and reach context'],
      ['Level 3 confirmation/dedupe', 'CRM duplicate check + optional verification'],
      ['Import policy', 'Approved only']
    ]
  }
};

function leadScraperCriteriaFromDefinition(type){
  const definition = leadScraperDefinitions[type];
  return {
    title: (definition?.userLabel || 'Scraper') + ' definition',
    fields: (definition?.criteriaFields || []).map((field) => ({
      ...field,
      label: field.label,
      value: leadScraperField(type, field.key, field.value)
    })),
    destination: definition?.crmDestination?.label || 'CRM destination not configured',
    sources: definition?.sourceReadiness || []
  };
}

function leadScraperPayloadFromDefinition(type, criteria = {}){
  const definition = leadScraperDefinitions[type] || {};
  const limit = Math.min(Math.max(Number(criteria['Preview count'] || criteria.limit) || 12, 1), 100);
  const market = criteria.Market || criteria.market || 'United States';
  const category = criteria['Category or keywords'] || criteria.category || criteria['Partner type'] || criteria['Lead type'] || '';
  return {
    market,
    category,
    keywords: category,
    organizationType: criteria['Lead type'] || category || definition.userLabel || '',
    partnerType: criteria['Partner type'] || category || definition.userLabel || '',
    criteria: criteria['Qualification rule'] || criteria.Criteria || '',
    limit,
    enrichContacts: true,
    rocketReachMode: 'defer',
    scraperDefinition: {
      scraperId: definition.scraperId,
      userLabel: criteria['Scraper name'] || definition.userLabel,
      purpose: definition.purpose,
      clientTemplate: definition.clientTemplate,
      crmDestination: definition.crmDestination,
      importPolicy: 'approved_only'
    }
  };
}

const scraperWorkflows = {
  organizations: {
    lens: 'Lead Intelligence',
    setupTitle: 'Define the organization scraper before VAL begins.',
    setupMeaning: 'This scraper definition controls criteria, source behavior, CRM destination, approval gates, and import policy.',
    setupUnderstanding: [
      'Starter scraper: Organizations.',
      'Active pattern: Level 1 discovery, Level 2 decision-maker context, Level 3 confirmation and dedupe.',
      'Safeguard: Level 1 discovery checks live CRM duplicates before enrichment or import.'
    ],
    setupRecommendation: 'Start with a focused preview. Make the definition trustworthy before VAL touches the sources.',
    criteria: leadScraperCriteriaFromDefinition('organizations'),
    previewTitle: 'The organization preview is ready for judgment.',
    previewMeaning: 'VAL has not imported anything. The review set is staged so the user can decide what belongs in CRM.',
    previewUnderstanding: [
      'Level 1 found viable organizations and filtered known CRM duplicates.',
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
    setupTitle: 'Define the partner scraper before VAL begins.',
    setupMeaning: 'Partner scrapes should feel like opening a strategic file, with the source mix and CRM destination visible before the run.',
    setupUnderstanding: [
      'Starter scraper: Partners.',
      'Criteria: partner type, geographic market, potential reach, and fit score.',
      'Safeguard: the Frisson partner destination is visible before anything is pushed to CRM.'
    ],
    setupRecommendation: 'Choose one partner category, keep the first preview small, and approve only candidates with credible nonprofit reach.',
    criteria: leadScraperCriteriaFromDefinition('partners'),
    previewTitle: 'The partner preview is ready for selection.',
    previewMeaning: 'VAL found candidates and scored them, but the user still owns the import decision.',
    previewUnderstanding: [
      '6 strategic partner candidates found.',
      'Potential Reach and Partnership Fit are ready for sorting.',
      'Each candidate includes evidence, recommended outreach angle, and source links; two supporting sources are preferred.'
    ],
    previewRecommendation: 'Select only the partners that would genuinely expand reach, then push approved partners to the strategic partner pipeline.',
    verifiedTitle: 'Partner evidence is ready for approval.',
    verifiedMeaning: 'VAL has checked source support and contactability without moving anything into CRM.',
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
    previewUrl: '/api/frisson/organizations/discover-preview',
    importUrl: '/api/frisson/organizations/import-approved',
    buildPayload(criteria){
      return leadScraperPayloadFromDefinition('organizations', criteria);
    }
  },
  partners: {
    previewUrl: '/api/frisson/partners/discover-preview',
    importUrl: '/api/frisson/partners/import-approved',
    buildPayload(criteria){
      return leadScraperPayloadFromDefinition('partners', criteria);
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
      'CRM: contact, tag, custom field, note, and opportunity write access.'
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
    orientation: 'VAL is sorting what changed, what deserves attention, and what is already prepared.',
    permission: 'Start with judgment, not noise.',
    rooms: {
      velocity: roomContent({
        observation: 'What changed',
        implication: 'Meaningful movement will appear here when it earns Home.',
        invitation: 'Review movement',
        title: 'What changed',
        summary: 'Movement VAL noticed while you were away.',
        action: 'Review what changed'
      }, {
        lens: 'Velocity',
        title: 'What changed while you were away.',
        meaning: 'Velocity is awareness: VAL shows meaningful movement with source proof before asking for action.',
        understanding: [
          'No changed item has been admitted yet.',
          'Emails, transcripts, projects, relationships, documents, calendar, and commitments can all feed this room.',
          'Supporting drawers stay available without owning Home.'
        ],
        recommendation: 'Open Velocity when you want the scan of what changed. If nothing qualifies, keep the desk clear.',
        actions: [{label: 'Close and return to desk', workflow: 'cancel:meeting'}],
        contextPortals: ['what changed', 'source proof'],
        confidence: 0.74,
        restraintReason: 'Velocity protects awareness without turning Home into a generic inbox.'
      }),
      alignment: roomContent({
        observation: 'Top priority',
        implication: 'VAL will show one attention-worthy priority at a time.',
        invitation: 'Review priority',
        title: 'Top priority',
        summary: 'One thing that deserves attention first.',
        action: 'See the priority'
      }, {
        lens: 'Alignment',
        title: 'What deserves attention first.',
        meaning: 'Alignment is the Chief of Staff judgment: one priority at a time, only when the why-now packet is complete.',
        understanding: [
          'No priority has been admitted yet.',
          'Alignment should not promote the newest, loudest, or most convenient item by default.',
          'When there is no qualified priority, VAL should say so plainly.'
        ],
        recommendation: 'Keep attention unbroken until one priority earns the top slot.',
        actions: [{label: 'Close and return to desk', workflow: 'cancel:meeting'}],
        contextPortals: ['top priority', 'chief of staff'],
        confidence: 0.74,
        restraintReason: 'Alignment protects attention by refusing to stack priorities.'
      }),
      leverage: roomContent({
        observation: 'Prepared drafts',
        implication: 'Drafts and prepared work will appear here when VAL has actually shaped them.',
        invitation: 'Review prepared work',
        title: 'Prepared drafts',
        summary: 'Work VAL shaped while you were away.',
        action: 'Review prepared work'
      }, {
        lens: 'Leverage',
        title: 'What VAL already prepared.',
        meaning: 'Leverage is for drafts, packets, tasks, proposals, notes, and other prepared work that can save starting from zero.',
        understanding: [
          'No prepared work has been admitted yet.',
          'Transcript evidence and Ready For You items should feed this room only when a reviewable artifact exists.',
          'Nothing sends, imports, publishes, or changes externally without approval.'
        ],
        recommendation: 'Prepared drafts will appear here when they are real enough to review or approve.',
        actions: [{label: 'Close and return to desk', workflow: 'cancel:meeting'}],
        contextPortals: ['prepared drafts', 'ready for you'],
        confidence: 0.74,
        restraintReason: 'Leverage protects creative energy by surfacing actual prepared work, not loose evidence.'
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

function clearRoomAttendance(event){
  event?.preventDefault?.();
  event?.stopPropagation?.();
  writeAttendedRooms({});
  document.querySelectorAll('.living-room').forEach((room) => {
    room.classList.remove('room-has-been-held');
    delete room.dataset.attended;
    room.querySelector('.room-attended')?.remove();
  });
  closeWorkspace();
  if(workspaceKicker) workspaceKicker.textContent = 'Home';
  if(workspaceTitle) workspaceTitle.textContent = 'No Home card is open.';
  if(workspaceMeaning) workspaceMeaning.textContent = 'Home marks were cleared for this browser session only.';
  const priorLabel = freshDeskButton?.textContent || 'Clear Home marks';
  if(freshDeskButton){
    freshDeskButton.textContent = 'Home marks cleared';
    window.setTimeout(() => {
      freshDeskButton.textContent = priorLabel;
    }, 1400);
  }
  hearth.classList.add('desk-settling');
  window.setTimeout(() => hearth.classList.remove('desk-settling'), 620);
}

function relationshipIndexSourceProfiles(){
  return relationshipIndexLoaded ? relationshipIndexProfiles : {};
}

function relationshipCanonicalKey(id = '', profile = {}){
  const query = profile.query || {};
  const email = String(query.email || profile.email || '').trim().toLowerCase();
  if(email) return 'email:' + email;
  const contactId = String(query.contactId || profile.contactId || profile.crmContactId || profile.personId || '').trim().toLowerCase();
  if(contactId) return 'contact:' + contactId;
  const name = String(profile.name || profile.displayName || id || '').trim().toLowerCase().replace(/\s+/g, ' ');
  return 'name:' + name;
}

function relationshipProfileStrength(profile = {}){
  const query = profile.query || {};
  let score = 0;
  if(query.contactId || profile.contactId || profile.crmContactId) score += 100;
  if(query.email || profile.email) score += 25;
  if(Array.isArray(profile.openLoops) && profile.openLoops.length) score += 12;
  if(Array.isArray(profile.projectLinks) && profile.projectLinks.length) score += 10;
  if(Array.isArray(profile.temperatureEvidence) && profile.temperatureEvidence.length) score += 8;
  if(profile.dossier || profile.relationshipBrief) score += 20;
  score += Math.round(Number(profile.confidence || 0) * 10);
  const changed = Date.parse(profile.lastChangedAt || profile.updatedAt || profile.lastObservedAt || '') || 0;
  return {score, changed};
}

function preferRelationshipProfile(current = {}, incoming = {}){
  const a = relationshipProfileStrength(current);
  const b = relationshipProfileStrength(incoming);
  if(b.score !== a.score) return b.score > a.score ? incoming : current;
  return b.changed > a.changed ? incoming : current;
}

function dedupeRelationshipProfiles(profiles = {}){
  const byKey = new Map();
  Object.entries(profiles).forEach(([id, profile]) => {
    const normalized = {...profile, profileId: profile.profileId || id};
    const key = relationshipCanonicalKey(id, normalized);
    if(!byKey.has(key)){
      byKey.set(key, [id, normalized]);
      return;
    }
    const [existingId, existing] = byKey.get(key);
    const preferred = preferRelationshipProfile(existing, normalized);
    byKey.set(key, [preferred === normalized ? id : existingId, preferred]);
  });
  return Array.from(byKey.values()).reduce((result, [id, profile]) => {
    result[id] = profile;
    return result;
  }, {});
}

function relationshipStewardshipUi(profile = {}){
  const packet = profile.personPacket || {};
  const packetState = packet.packet_state || {};
  const packetMaturity = profile.packetMaturity || packet.packet_maturity || {};
  const admission = profile.relationshipAdmission || packet.relationship_admission || {};
  const visibility = profile.executiveVisibility || packet.executive_visibility || {};
  const supplied = profile.stewardshipUi || {};
  const rawState = supplied.state || profile.stewardshipState || visibility.visibility || '';
  const normalizedState = rawState === 'active_queue' ? 'active_stewardship' : rawState;
  const openLoops = Array.isArray(profile.openLoops) ? profile.openLoops : [];
  const needs = Array.isArray(profile.packetNeeds) ? profile.packetNeeds : [];
  const offers = Array.isArray(profile.packetOffers) ? profile.packetOffers : [];
  const sourceReceipts = packet.who_this_person_is?.source_receipts || packet.relationship_origin?.source_receipts || [];
  const firstSource = sourceReceipts[0] || {};
  const canEvaluateMoves = Boolean(profile.canEvaluateMoves || packetState.can_evaluate_moves);
  let state = normalizedState || 'hidden';
  if(!normalizedState){
    if(admission.admission_status === 'blocked_by_identity' || packetMaturity.maturity === 'blocked_by_identity') state = 'identity_review';
    else if(canEvaluateMoves && (openLoops.length || profile.nextStewardshipMove || profile.nextMove)) state = 'active_stewardship';
    else if(['developing','usable','strong'].includes(packetState.maturity || packetMaturity.maturity)) state = 'people_to_watch';
  }
  let status = supplied.status || profile.stewardshipStatus || 'No move right now';
  if(state === 'identity_review') status = 'Needs identity review';
  if(state === 'people_to_watch' && !supplied.status && !profile.stewardshipStatus) status = 'Understanding developing';
  if(state === 'active_stewardship' && !/^Move suggested/i.test(status)){
    const moveName = profile.nextStewardshipMove || profile.nextMove || openLoops[0] || 'Review next stewardship move';
    status = 'Move suggested: ' + String(moveName).replace(/^Review\s+/i, 'Review ');
  }
  const whyThisMatters = supplied.whyThisMatters || profile.whyThisPersonMatters || profile.summary || packet.who_this_person_is?.summary || profile.signal || 'VAL has source-backed relationship context for this person.';
  const whatIsOpen = supplied.whatIsOpen || profile.whatIsOpen || openLoops[0] || (state === 'identity_review' ? 'Contact identity needs review.' : 'No current open matter is ready.');
  const nextMove = supplied.nextMove || profile.nextStewardshipMove || profile.nextMove || (state === 'people_to_watch' ? 'Watch for a named evidence trigger.' : (state === 'identity_review' ? 'Review the contact match.' : 'No action is needed right now.'));
  const whyNow = supplied.whyNow || profile.whyNow || visibility.attention_reason || packetMaturity.why || firstSource.summary || 'No source-backed timing trigger is active.';
  const evidencePosture = supplied.evidencePosture || profile.evidencePosture || firstSource.summary || profile.sourceEvidence || profile.sourceReceipts || 'Source-backed evidence is available for review.';
  return {
    state,
    status,
    statusMeaning: supplied.statusMeaning || packetMaturity.why || visibility.why_visible_or_hidden || '',
    whyThisMatters,
    whatIsOpen,
    nextMove,
    whyNow,
    evidencePosture,
    watchTrigger: supplied.watchTrigger || visibility.attention_reason || packetMaturity.missing_variables?.[0] || '',
    collapsedByDefault: state === 'people_to_watch',
    canEvaluateMoves
  };
}

function relationshipIndexItems(){
  return Object.entries(dedupeRelationshipProfiles(relationshipIndexSourceProfiles())).map(([id, profile]) => {
    const stewardship = relationshipStewardshipUi(profile);
    return {
      id,
      profile,
      stewardship,
      name: profile.name || 'Unnamed relationship',
      company: profile.company || String(profile.contact || '').split('·')[0]?.trim() || 'Relationship',
      temperature: profile.temperature || 'Unknown',
      temperatureScore: Math.max(0, Math.min(100, Number(profile.temperatureScore || 50))),
      trajectory: profile.trajectory || profile.role || 'Watch',
      state: stewardship.state,
      stateLabel: stewardship.status,
      sourceEvidence: stewardship.evidencePosture || profile.sourceEvidence || profile.sourceReceipts || 'Evidence is pending source review.',
      confidence: Math.max(0, Math.min(1, Number(profile.confidence || 0.6))),
      lastChangedAt: profile.lastChangedAt || '',
      signal: stewardship.whyThisMatters || profile.signal || profile.certainty || profile.evidence || 'No current relationship signal is attached.',
      temperatureReviewPending: relationshipPendingTemperatureReviewFor(profile) || profile.temperatureReviewPending || null
    };
  }).filter((item) => item.state !== 'hidden');
}

function stewardshipPeople(){
  return relationshipIndexItems()
    .filter((item) => item?.profile)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function stewardshipPersonById(id = ''){
  return stewardshipPeople().find((item) => item.id === id)?.profile || relationshipIndexSourceProfiles()[id] || relationshipIndexProfiles[id] || null;
}

function stewardshipCleanList(values = [], fallback = ''){
  const seen = new Set();
  const rows = (Array.isArray(values) ? values : [values]).map((item) => {
    if(!item) return '';
    if(typeof item === 'string') return item;
    return item.need || item.offer || item.summary || item.content || item.text || item.reason || item.title || '';
  }).map((line) => relationshipCleanSourceText(line, 170)).filter((line) => {
    const key = line.toLowerCase();
    if(!line || seen.has(key) || /^no (current|source-backed|confident|move)/i.test(line)) return false;
    seen.add(key);
    return true;
  });
  return rows.length ? rows.slice(0, 4) : (fallback ? [fallback] : []);
}

function stewardshipIsFallbackRow(line = ''){
  return /^(No clear (need|offer) is ready yet|Evidence is still developing)\.?$/i.test(String(line || '').trim());
}

function stewardshipIsGenericClassifierRow(line = ''){
  return /^(Email may involve a document request or document follow-up|Email contains relationship momentum or warmth|Email may contain relationship or revenue opportunity signal|Email includes scheduling or meeting language|Email asks for a response or decision|Thread appears to be waiting on a response|Transcript-derived introduction opportunity: review the source snippet before preparing any introduction|Transcript source mentions a possible introduction connected to this relationship context)\.?$/i.test(String(line || '').trim());
}

function stewardshipActionableRows(rows = []){
  return (Array.isArray(rows) ? rows : [rows]).filter((line) => line && !stewardshipIsFallbackRow(line) && !stewardshipIsGenericClassifierRow(line));
}

function stewardshipLooksLikePerson(profile = {}){
  const name = String(profile.name || '').trim();
  if(!name || /^\d{7,}$/.test(name)) return false;
  if(/^(meet\s*up|zoom|gmail|google|calendar|unknown|observed|info|support|hello|noreply|no-reply)$/i.test(name)) return false;
  if(/@/.test(name)) return false;
  return /[a-z]/i.test(name);
}

function stewardshipNeeds(profile = {}){
  const rows = stewardshipActionableRows(stewardshipCleanList(profile.packetNeeds?.length ? profile.packetNeeds : profile.openLoops, ''));
  return rows.length ? rows : ['No clear need is ready yet.'];
}

function stewardshipOffers(profile = {}){
  const rows = stewardshipActionableRows(stewardshipCleanList(profile.packetOffers?.length ? profile.packetOffers : profile.valueTheyCreate, ''));
  return rows.length ? rows : ['No clear offer is ready yet.'];
}

function stewardshipEvidence(profile = {}){
  const packet = profile.personPacket || {};
  const receipts = []
    .concat(packet.who_this_person_is?.source_receipts || [])
    .concat(packet.relationship_origin?.source_receipts || [])
    .concat(Array.isArray(profile.evidenceBindings) ? profile.evidenceBindings : []);
  const rows = stewardshipCleanList(receipts.map((item) => item.summary || item.relationship_context || item.title || item.source_type || ''), '');
  const profileRows = stewardshipCleanList([profile.evidencePosture, profile.sourceEvidence, profile.signal, profile.summary], '');
  const usefulRows = rows.concat(profileRows).filter((line) => !stewardshipIsGenericClassifierRow(String(line || '').replace(/^Latest observation:\s*/i, '')));
  return usefulRows.length ? usefulRows.slice(0, 5) : ['Evidence is still developing.'];
}

function stewardshipRelationshipLine(profile = {}){
  return relationshipCleanSourceText(profile.stewardshipAbout || profile.identity || profile.contact || profile.company || profile.role || 'Known through current VAL relationship evidence.', 220);
}

function stewardshipTextForMatch(profile = {}){
  return [
    profile.name,
    profile.company,
    profile.role,
    profile.summary,
    profile.signal,
    profile.evidence,
    profile.sourceEvidence,
    profile.evidencePosture,
    stewardshipNeeds(profile).join(' '),
    stewardshipOffers(profile).join(' '),
    stewardshipEvidence(profile).join(' ')
  ].filter(Boolean).join(' ').toLowerCase();
}

function stewardshipTokens(value = ''){
  const blocked = new Set(['this','that','with','from','they','them','need','needs','offer','offers','relationship','context','current','source','evidence','people','person','help','helps','work','working','meeting','discussion','recent','review','clear','ready','still','developing']);
  return String(value || '').toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length >= 4 && !blocked.has(word));
}

function stewardshipOverlapScore(left = '', right = ''){
  const a = new Set(stewardshipTokens(left));
  const b = new Set(stewardshipTokens(right));
  if(!a.size || !b.size) return 0;
  let overlap = 0;
  a.forEach((word) => { if(b.has(word)) overlap += 1; });
  return overlap;
}

function stewardshipAlreadyKnows(a = {}, b = {}){
  const text = stewardshipTextForMatch(a) + ' ' + stewardshipTextForMatch(b);
  const aFirst = String(a.name || '').split(/\s+/)[0]?.toLowerCase();
  const bFirst = String(b.name || '').split(/\s+/)[0]?.toLowerCase();
  return Boolean(aFirst && bFirst && new RegExp('already\\s+(knows|know|met|working with)\\s+' + bFirst + '|' + bFirst + '\\s+already\\s+(knows|know|met|working with)\\s+' + aFirst, 'i').test(text));
}

function stewardshipExplicitIntroSignal(a = {}, b = {}){
  const text = [
    a.summary,
    a.signal,
    a.evidence,
    a.sourceEvidence,
    a.evidencePosture,
    stewardshipEvidence(a).join(' '),
    b.summary,
    b.signal,
    b.evidence,
    b.sourceEvidence,
    b.evidencePosture,
    stewardshipEvidence(b).join(' ')
  ].filter(Boolean).join(' ').toLowerCase();
  const aFirst = String(a.name || '').split(/\s+/)[0]?.toLowerCase();
  const bFirst = String(b.name || '').split(/\s+/)[0]?.toLowerCase();
  const bNameTokens = stewardshipNameTokens(b);
  const namesBothPresent = aFirst && bFirst && text.includes(aFirst) && text.includes(bFirst);
  const candidateNamedInTranscript = bNameTokens.some((token) => text.includes(token)) && /\b(transcript|speaker|said|told|source)\b/i.test(text);
  return Boolean((namesBothPresent || candidateNamedInTranscript) && /\b(introduce|intro|connect|should meet|should talk|want to introduce|want to connect)\b/i.test(text));
}

function stewardshipNameTokens(profile = {}){
  return String(profile.name || '').toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length >= 4 && !['relationship','observed','unknown'].includes(word));
}

function stewardshipRelationshipEvidenceMap(profile = {}){
  return profile.relationshipEvidenceMap || profile.relationship_evidence_map || profile.personPacket?.relationship_evidence_map || {};
}

function stewardshipRecentDirectCommunicationAt(profile = {}){
  const map = stewardshipRelationshipEvidenceMap(profile);
  return profile.lastDirectCommunicationAt || profile.last_direct_communication_at || map.lastDirectCommunicationAt || map.last_direct_communication_at || profile.personPacket?.relationship_state?.last_direct_communication_at || '';
}

function stewardshipDateWithinDays(value = '', days = 14){
  const time = Date.parse(value);
  if(!time) return false;
  const diff = Date.now() - time;
  return diff >= 0 && diff <= days * 24 * 60 * 60 * 1000;
}

function stewardshipHasRecentDirectCommunication(profile = {}, days = 14){
  const map = stewardshipRelationshipEvidenceMap(profile);
  return Boolean(profile.freshForSuggestedIntroductions || profile.fresh_for_suggested_introductions || map.freshForSuggestedIntroductions || map.fresh_for_suggested_introductions || stewardshipDateWithinDays(stewardshipRecentDirectCommunicationAt(profile), days));
}

function stewardshipPairPassesFreshness(a = {}, b = {}){
  return stewardshipHasRecentDirectCommunication(a, 14) || stewardshipHasRecentDirectCommunication(b, 14);
}

function stewardshipIntroFit(a = {}, b = {}){
  if(!a || !b || a === b) return {ready:false, score:0, because:'I do not see a strong reason to introduce these two yet.', missing:['two different people']};
  if(!stewardshipLooksLikePerson(a) || !stewardshipLooksLikePerson(b)){
    return {ready:false, score:0, because:'I do not see a strong reason to introduce these two yet.', missing:['two named people with relationship packets']};
  }
  if(!stewardshipPairPassesFreshness(a, b)){
    return {ready:false, score:0, because:'I do not see a strong reason to introduce these two yet.', missing:['recent direct communication with at least one person in the last 14 days']};
  }
  if(stewardshipAlreadyKnows(a, b)){
    return {ready:false, score:0, because:'I do not see a strong reason to introduce these two yet.', missing:['they may already know or be working with each other']};
  }
  const aNeeds = stewardshipNeeds(a);
  const bNeeds = stewardshipNeeds(b);
  const aOffers = stewardshipOffers(a);
  const bOffers = stewardshipOffers(b);
  const aActionableNeeds = stewardshipActionableRows(aNeeds);
  const bActionableNeeds = stewardshipActionableRows(bNeeds);
  const aActionableOffers = stewardshipActionableRows(aOffers);
  const bActionableOffers = stewardshipActionableRows(bOffers);
  const aNeedsBOffers = stewardshipOverlapScore(aActionableNeeds.join(' '), bActionableOffers.join(' '));
  const bNeedsAOffers = stewardshipOverlapScore(bActionableNeeds.join(' '), aActionableOffers.join(' '));
  const explicit = stewardshipExplicitIntroSignal(a, b);
  const score = aNeedsBOffers + bNeedsAOffers + (explicit ? 20 : 0);
  const missing = [];
  if(!aActionableNeeds.length && !bActionableNeeds.length) missing.push('at least one real need from either person');
  if(!aActionableOffers.length && !bActionableOffers.length) missing.push('at least one real offer from either person');
  if(!aNeedsBOffers && !explicit) missing.push('clear need from ' + (a.name || 'Person A') + ' that ' + (b.name || 'Person B') + ' can meet');
  if(!bNeedsAOffers && !explicit) missing.push('clear need from ' + (b.name || 'Person B') + ' that ' + (a.name || 'Person A') + ' can meet');
  const ready = explicit || score >= 2;
  const because = ready && explicit && (!aActionableNeeds.length || !bActionableOffers.length)
    ? 'Because transcript evidence says Jessa wanted to introduce ' + (a.name || 'Person A') + ' and ' + (b.name || 'Person B') + '. Review the source snippet before drafting.'
    : ready
    ? 'Because ' + (a.name || 'Person A') + ' needs ' + relationshipCleanSourceText(aActionableNeeds[0] || bActionableNeeds[0] || 'support this network can provide', 90).replace(/\.$/, '') + ', and ' + (b.name || 'Person B') + ' offers ' + relationshipCleanSourceText(bActionableOffers[0] || aActionableOffers[0] || 'relevant context', 90).replace(/\.$/, '') + '.'
    : 'I do not see a strong reason to introduce these two yet.';
  return {ready, score, because, missing, aNeeds, bNeeds, aOffers, bOffers, evidence:[...stewardshipEvidence(a).slice(0, 2), ...stewardshipEvidence(b).slice(0, 2)]};
}

function stewardshipBestMatches(profile = {}, limit = 3){
  return stewardshipPeople()
    .map((item) => ({item, profile:item.profile, fit:stewardshipIntroFit(profile, item.profile)}))
    .filter((row) => row.profile && row.profile !== profile && row.fit.ready)
    .sort((a, b) => b.fit.score - a.fit.score || a.item.name.localeCompare(b.item.name))
    .slice(0, limit);
}

function stewardshipDraftPreview(a = {}, b = {}, fit = stewardshipIntroFit(a, b)){
  if(!fit.ready) return '';
  return [
    'Subject: Introduction: ' + (a.name || 'Person A') + ' <> ' + (b.name || 'Person B'),
    '',
    'Hi ' + (a.name || 'there') + ' and ' + (b.name || 'there') + ',',
    '',
    fit.because,
    '',
    'I thought it may be worth a brief conversation if it feels useful to both of you.',
    '',
    'Warmly,',
    'Jessa'
  ].join('\n');
}

function relationshipProfileFromIndexItem(item = {}){
  const id = item.id || item.profileKey || item.name || 'relationship';
  const personPacket = item.personPacket || item.packet || null;
  const packetState = personPacket?.packet_state || {};
  const packetIdentity = personPacket?.person || {};
  const relationshipEvidenceMap = item.relationshipEvidenceMap || item.relationship_evidence_map || personPacket?.relationship_evidence_map || {};
  const packetSummary = personPacket?.who_this_person_is?.summary || '';
  const packetNeeds = Array.isArray(personPacket?.what_this_person_needs) ? personPacket.what_this_person_needs.map((row) => row.need || row.summary || row.why_it_matters).filter(Boolean) : [];
  const packetOffers = Array.isArray(personPacket?.what_this_person_offers) ? personPacket.what_this_person_offers.map((row) => row.offer || row.summary || row.why_it_matters).filter(Boolean) : [];
  const query = {
    ...(item.query || {}),
    name: item.query?.name || item.name || item.displayName || packetIdentity.name || '',
    email: item.query?.email || item.email || '',
    targetId: item.query?.targetId || id,
    contactId: item.query?.contactId || item.contactId || item.crmContactId || ''
  };
  if(!query.email && packetIdentity.email_addresses?.[0]) query.email = packetIdentity.email_addresses[0];
  if(!query.contactId && packetIdentity.crm_contact_id) query.contactId = packetIdentity.crm_contact_id;
  return {
    ...item,
    query,
    name: item.name || item.displayName || packetIdentity.name || 'Unnamed relationship',
    initials: item.initials || String(item.name || item.displayName || 'R').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase(),
    role: item.role || packetIdentity.role || item.relationshipStatus || 'Relationship',
    company: item.company || packetIdentity.company_or_context || 'Relationship',
    temperature: item.temperature || 'Warm',
    temperatureScore: Math.max(0, Math.min(100, Number(item.temperatureScore || 55))),
    trajectory: item.trajectory || item.relationshipStatus || 'Watch',
    relationshipState: item.relationshipState || item.state || relationshipStateFromTemperature(item),
    relationshipStateLabel: item.relationshipStateLabel || item.stateLabel || item.temperature || 'Warm',
    stewardshipUi: item.stewardshipUi || item.stewardship || null,
    stewardshipStatus: item.stewardshipStatus || item.stewardshipUi?.status || '',
    stewardshipState: item.stewardshipState || item.stewardshipUi?.state || '',
    whyThisPersonMatters: item.whyThisPersonMatters || item.stewardshipUi?.whyThisMatters || '',
    whatIsOpen: item.whatIsOpen || item.stewardshipUi?.whatIsOpen || '',
    nextStewardshipMove: item.nextStewardshipMove || item.stewardshipUi?.nextMove || '',
    whyNow: item.whyNow || item.stewardshipUi?.whyNow || '',
    evidencePosture: item.evidencePosture || item.stewardshipUi?.evidencePosture || '',
    canEvaluateMoves: Boolean(item.canEvaluateMoves || item.stewardshipUi?.canEvaluateMoves),
    temperatureMeaning: item.temperatureMeaning || relationshipTemperatureModel[item.relationshipState || item.state]?.meaning || '',
    temperatureObservers: item.temperatureObservers || relationshipTemperatureModel[item.relationshipState || item.state]?.observers || [],
    temperatureScoreRange: item.temperatureScoreRange || relationshipTemperatureModel[item.relationshipState || item.state]?.scoreRange || [],
    temperatureEvidence: Array.isArray(item.temperatureEvidence) ? item.temperatureEvidence : [],
    temperatureConflict: item.temperatureConflict || null,
    sourceEvidence: item.sourceEvidence || item.summary || 'Relationship evidence is pending source review.',
    confidence: Math.max(0, Math.min(1, Number(item.confidence || 0.6))),
    lastChangedAt: item.lastChangedAt || item.updatedAt || item.lastObservedAt || '',
    signal: item.signal || packetSummary || item.summary || 'Relationship signal available.',
    identity: item.identity || item.name || item.displayName || packetIdentity.name || 'Relationship',
    contact: item.contact || item.email || packetIdentity.email_addresses?.[0] || item.profileKey || 'CRM identity review may be required.',
    wisdom: item.wisdom || item.summary || 'VAL needs a clean identity link before this relationship can become a trusted brief.',
    evidence: item.evidence || item.signal || item.summary || 'VAL has a relationship signal, but the source needs review before it becomes judgment.',
    patterns: item.patterns || item.executiveAssessment || item.summary || item.signal || 'VAL has not confirmed a durable pattern for this relationship yet.',
    meaning: item.meaning || item.summary || item.signal || 'VAL has not confirmed why this relationship matters yet.',
    certainty: item.certainty || item.nextMove || 'Link the right person, then VAL can merge meetings, transcripts, emails, projects, and open commitments safely.',
    linkedinSignal: item.linkedinSignal || 'LinkedIn context will appear when an observer has current evidence.',
    sourceReceipts: item.sourceReceipts || 'VAL relationship index · CRM identity link required before dossier attachment',
    projectLinks: Array.isArray(item.projectLinks) ? item.projectLinks : [],
    personPacket,
    relationshipEvidenceMap,
    lastDirectCommunicationAt: item.lastDirectCommunicationAt || item.last_direct_communication_at || relationshipEvidenceMap.lastDirectCommunicationAt || relationshipEvidenceMap.last_direct_communication_at || personPacket?.relationship_state?.last_direct_communication_at || '',
    lastDirectCommunicationSource: item.lastDirectCommunicationSource || item.last_direct_communication_source || relationshipEvidenceMap.lastDirectCommunicationSource || relationshipEvidenceMap.last_direct_communication_source || personPacket?.relationship_state?.last_direct_communication_source || '',
    freshForSuggestedIntroductions: Boolean(item.freshForSuggestedIntroductions || item.fresh_for_suggested_introductions || relationshipEvidenceMap.freshForSuggestedIntroductions || relationshipEvidenceMap.fresh_for_suggested_introductions || packetState.fresh_for_suggested_introductions),
    packetMaturity: item.packetMaturity || personPacket?.packet_maturity || null,
    evidenceBindings: item.evidenceBindings || personPacket?.evidence_bindings || [],
    executiveVisibility: item.executiveVisibility || personPacket?.executive_visibility || null,
    personPacketMaturity: item.maturity || packetState.maturity || '',
    personPacketNeedsReview: Boolean(item.needsReview || packetState.needs_review),
    personPacketMissingVariables: item.missingVariables || packetState.missing_variables || [],
    packetNeeds,
    packetOffers,
    href: item.href || './dashboard.html?view=relationships&targetType=person&targetId=' + encodeURIComponent(id)
  };
}

function relationshipPacketIndexKeys(item = {}){
  const packet = item.packet || item.personPacket || item;
  const person = packet.person || {};
  return [
    item.profileId,
    item.profileKey,
    item.id,
    item.displayName,
    packet.packet_id,
    person.person_id,
    person.crm_contact_id,
    person.name,
    ...(Array.isArray(person.email_addresses) ? person.email_addresses : [])
  ].map((value) => String(value || '').trim().toLowerCase()).filter(Boolean);
}

function rememberRelationshipPersonPackets(items = []){
  const next = {};
  items.filter(Boolean).forEach((item) => {
    relationshipPacketIndexKeys(item).forEach((key) => {
      next[key] = item;
    });
  });
  relationshipPersonPacketIndex = next;
  return next;
}

function relationshipPersonPacketForProfile(profile = {}){
  const keys = [
    profile.profileId,
    profile.id,
    profile.contactId,
    profile.crmContactId,
    profile.query?.contactId,
    profile.query?.targetId,
    profile.query?.email,
    profile.name
  ].map((value) => String(value || '').trim().toLowerCase()).filter(Boolean);
  for(const key of keys){
    if(relationshipPersonPacketIndex[key]) return relationshipPersonPacketIndex[key];
  }
  return null;
}

function relationshipProfileWithPersonPacket(profile = {}){
  const item = relationshipPersonPacketForProfile(profile);
  const packet = item?.packet || item?.personPacket || profile.personPacket || null;
  if(!packet) return profile;
  const who = packet.who_this_person_is || {};
  const needs = Array.isArray(packet.what_this_person_needs) ? packet.what_this_person_needs.map((row) => row.need || row.summary || row.why_it_matters).filter(Boolean) : [];
  const offers = Array.isArray(packet.what_this_person_offers) ? packet.what_this_person_offers.map((row) => row.offer || row.summary || row.why_it_matters).filter(Boolean) : [];
  const state = packet.packet_state || {};
  const relationshipEvidenceMap = item?.relationshipEvidenceMap || item?.relationship_evidence_map || profile.relationshipEvidenceMap || packet.relationship_evidence_map || {};
  return {
    ...profile,
    personPacket: packet,
    packetMaturity: item?.packetMaturity || packet.packet_maturity || profile.packetMaturity || null,
    evidenceBindings: item?.evidenceBindings || packet.evidence_bindings || profile.evidenceBindings || [],
    executiveVisibility: item?.executiveVisibility || packet.executive_visibility || profile.executiveVisibility || null,
    relationshipAdmission: item?.relationshipAdmission || packet.relationship_admission || profile.relationshipAdmission || null,
    relationshipEvidenceMap,
    lastDirectCommunicationAt: item?.lastDirectCommunicationAt || profile.lastDirectCommunicationAt || relationshipEvidenceMap.lastDirectCommunicationAt || relationshipEvidenceMap.last_direct_communication_at || packet.relationship_state?.last_direct_communication_at || '',
    lastDirectCommunicationSource: item?.lastDirectCommunicationSource || profile.lastDirectCommunicationSource || relationshipEvidenceMap.lastDirectCommunicationSource || relationshipEvidenceMap.last_direct_communication_source || packet.relationship_state?.last_direct_communication_source || '',
    freshForSuggestedIntroductions: Boolean(item?.freshForSuggestedIntroductions || profile.freshForSuggestedIntroductions || relationshipEvidenceMap.freshForSuggestedIntroductions || relationshipEvidenceMap.fresh_for_suggested_introductions || state.fresh_for_suggested_introductions),
    canEvaluateMoves: Boolean(item?.canEvaluateMoves || state.can_evaluate_moves || profile.canEvaluateMoves),
    stewardshipUi: profile.stewardshipUi || item?.stewardshipUi || null,
    personPacketMaturity: item?.maturity || state.maturity || profile.personPacketMaturity || '',
    personPacketNeedsReview: Boolean(item?.needsReview || state.needs_review || profile.personPacketNeedsReview),
    personPacketMissingVariables: item?.missingVariables || state.missing_variables || profile.personPacketMissingVariables || [],
    stewardshipAbout: relationshipUsefulText(profile.stewardshipAbout, who.summary || profile.stewardshipAbout),
    stewardshipAboutTitle: profile.stewardshipAboutTitle || packet.person?.role || packet.person?.company_or_context || 'Relationship context',
    packetNeeds: needs,
    packetOffers: offers,
    openLoops: Array.isArray(profile.openLoops) && profile.openLoops.length ? profile.openLoops : needs,
    valueTheyCreate: Array.isArray(profile.valueTheyCreate) && profile.valueTheyCreate.length ? profile.valueTheyCreate : offers,
    keyFacts: Array.isArray(profile.keyFacts) && profile.keyFacts.length ? profile.keyFacts : [state.maturity && 'Understanding: ' + state.maturity, state.needs_review && 'Needs review'].filter(Boolean)
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
        const packetInventory = await getJson('/api/relationships/person-packets?limit=160&includeThin=1').catch(() => ({packets:[]}));
        rememberRelationshipPersonPackets(Array.isArray(packetInventory.packets) ? packetInventory.packets : []);
        const rawProfiles = data.relationships.reduce((profiles, item) => {
          const id = item.id || item.profileKey || item.name;
          if(id) profiles[id] = relationshipProfileWithPersonPacket(relationshipProfileFromIndexItem(item));
          return profiles;
        }, {});
        relationshipIndexProfiles = dedupeRelationshipProfiles(rawProfiles);
        const onboarding = await getJson('/api/teach-val/onboarding').catch(() => ({}));
        const added = mergeOnboardingSupportProfiles(onboardingImportItems(onboarding, 'support_circle'));
        relationshipIndexLoaded = true;
        const packetCount = Number(packetInventory.count || packetInventory.packets?.length || 0);
        relationshipIndexSourceLabel = (data.source === 'demo_relationships' ? 'Preview relationships' : 'VAL relationship index') + (packetCount ? ' + Stewardship context' : '') + (added ? ' + onboarding support circle' : '');
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
  active_stewardship: 0,
  identity_review: 1,
  people_to_watch: 2,
  hidden: 9
};

const relationshipSectionCopy = {
  active_stewardship: {
    title: 'Active Stewardship Queue',
    note: 'These relationships deserve your judgment now.'
  },
  identity_review: {
    title: 'Needs Identity Review',
    note: 'Meaningful context exists, but identity must be corrected before VAL uses it.'
  },
  people_to_watch: {
    title: 'People To Watch',
    note: 'Relationships VAL is responsibly monitoring so you do not have to hold them in your head.'
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
    item.stateLabel,
    item.signal,
    item.stewardship?.whyThisMatters,
    item.stewardship?.whatIsOpen,
    item.stewardship?.nextMove,
    item.stewardship?.whyNow,
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
    return 'VAL is connected. No relationship profiles have enough evidence to appear here yet.';
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
  const title = document.createElement(state === 'people_to_watch' ? 'button' : 'strong');
  title.textContent = state === 'people_to_watch'
    ? (relationshipPeopleToWatchExpanded ? 'Hide People To Watch' : 'Show People To Watch')
    : copy.title;
  if(state === 'people_to_watch'){
    title.type = 'button';
    title.dataset.relationshipToggleWatch = '1';
    title.setAttribute('aria-expanded', String(relationshipPeopleToWatchExpanded));
  }
  const note = document.createElement('span');
  note.textContent = copy.note;
  const total = document.createElement('small');
  if(state === 'people_to_watch'){
    total.textContent = relationshipPeopleToWatchExpanded
      ? count + ' monitored ' + (count === 1 ? 'relationship' : 'relationships') + ' shown.'
      : count + ' ' + (count === 1 ? 'relationship is' : 'relationships are') + ' being monitored. Open when you want to review them.';
  }else{
    total.textContent = count + ' ' + (count === 1 ? 'person' : 'people');
  }
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
  button.classList.toggle('active', item.id === stewardshipSelectedNetworkId);
  button.setAttribute('title', 'Open Network context for ' + item.name + '.');
  const name = document.createElement('span');
  name.className = 'rolodex-name';
  name.textContent = item.name;
  const status = document.createElement('span');
  status.className = 'rolodex-status';
  status.textContent = relationshipCleanSourceText(item.profile.role || item.company || 'Network', 90);
  const why = document.createElement('span');
  why.className = 'rolodex-why';
  why.textContent = 'Needs: ' + stewardshipNeeds(item.profile)[0];
  const open = document.createElement('span');
  open.className = 'rolodex-open';
  open.textContent = 'Offers: ' + stewardshipOffers(item.profile)[0];
  const next = document.createElement('span');
  next.className = 'rolodex-next';
  const best = stewardshipBestMatches(item.profile, 1)[0];
  next.textContent = best ? 'Best match: ' + best.item.name : 'Best match: not ready yet';
  const evidence = document.createElement('span');
  evidence.className = 'rolodex-evidence';
  evidence.textContent = 'Evidence: ' + stewardshipEvidence(item.profile)[0];
  button.append(name, status, why, open, next, evidence);
  row.insertBefore(button, row.firstChild);
  relationshipRolodex.appendChild(row);
}

function renderStewardshipNetworkDetail(profile = null){
  if(!stewardshipNetworkDetail) return;
  if(!profile){
    stewardshipNetworkDetail.innerHTML = '<span>Select a person</span><p>VAL will show needs, offers, evidence, and best matches when you choose someone from the Network.</p>';
    return;
  }
  const matches = stewardshipBestMatches(profile, 3);
  const matchMarkup = matches.length
    ? '<ol>' + matches.map((match) => '<li><strong>' + escapeHtml(match.item.name) + '</strong><p>' + escapeHtml(match.fit.because) + '</p><button type="button" data-stewardship-create-with="' + escapeHtml(match.item.id) + '">Use In Introduction</button></li>').join('') + '</ol>'
    : '<p>I do not see a strong reason to introduce ' + escapeHtml(profile.name || 'this person') + ' yet.</p><button type="button" data-stewardship-who-should-meet="' + escapeHtml(stewardshipSelectedNetworkId) + '">Who Should ' + escapeHtml(relationshipFirstName(profile)) + ' Meet?</button>';
  stewardshipNetworkDetail.innerHTML = [
    '<span>Network</span>',
    '<h5>' + escapeHtml(profile.name || 'Relationship') + '</h5>',
    '<p>' + escapeHtml(stewardshipRelationshipLine(profile)) + '</p>',
    '<div class="stewardship-four-grid">',
    stewardshipMiniList('Needs', stewardshipNeeds(profile)),
    stewardshipMiniList('Offers', stewardshipOffers(profile)),
    stewardshipMiniList('Relationship', [stewardshipRelationshipLine(profile)]),
    stewardshipMiniList('Evidence', stewardshipEvidence(profile)),
    '</div>',
    '<div class="stewardship-best-matches"><strong>Best Matches</strong>' + matchMarkup + '</div>'
  ].join('');
}

function setStewardshipView(view = 'suggested'){
  stewardshipActiveView = ['suggested','create','network'].includes(view) ? view : 'suggested';
  stewardshipViewButtons.forEach((button) => {
    const active = button.dataset.stewardshipView === stewardshipActiveView;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  stewardshipPanels.forEach((panel) => {
    const active = panel.dataset.stewardshipPanel === stewardshipActiveView;
    panel.hidden = !active;
    panel.classList.toggle('active', active);
  });
  renderRelationshipRolodex();
}

function openStewardshipDraftReview(a = {}, b = {}, fit = stewardshipIntroFit(a, b)){
  if(!fit.ready){
    setWorkspaceContent({
      lens: 'Introduction Review',
      title: 'This introduction is not draft-ready yet.',
      meaning: fit.because,
      understanding: (fit.missing || ['VAL needs stronger evidence before drafting.']).concat(['No email, invite, message, CRM write, or external action happened.']),
      recommendation: 'Treat silence as a responsible answer until the packet evidence is stronger.',
      actions: relationshipContextActions([{label:'Back to Create Introduction', workflow:'relationshipAllPeople'}]),
      label: 'Introduction not draft-ready'
    });
    openWorkspaceShell('Introduction not draft-ready', {returnTarget:'relationship'});
    return;
  }
  setWorkspaceContent({
    lens: 'Introduction Draft',
    title: 'Introduction draft held for review.',
    meaning: fit.because,
    understanding: [
      'People: ' + (a.name || 'Person A') + ' <> ' + (b.name || 'Person B'),
      'Evidence: ' + (fit.evidence || []).slice(0, 2).join(' | '),
      'No email, invite, message, CRM write, or external action happened.'
    ],
    recommendation: 'Review the reason and wording before approving anything outside VAL.',
    actions: relationshipContextActions([
      {label:'Approve draft for review queue', workflow:'introApprove'},
      {label:'Edit draft', workflow:'introRefine'},
      {label:'Not now', workflow:'introDismiss'}
    ]),
    label: 'Introduction draft review',
    suppressClarityStandard:true
  });
  renderWorkspaceInput({
    label: 'Prepared introduction draft',
    placeholder: 'VAL prepared draft language for review.',
    helper: 'Editing this text only changes the review draft. It does not send, expose recipients, write CRM, or create a calendar event.',
    mode: 'intro-draft',
    value: stewardshipDraftPreview(a, b, fit)
  });
  openWorkspaceShell('Introduction draft review', {returnTarget:'relationship'});
}

function renderRelationshipRolodex(){
  updateRelationshipIndexSourceLabel();
  renderStewardshipSuggestions();
  renderStewardshipCreateControls();
  renderStewardshipNetworkList();
}

function renderStewardshipSuggestions(){
  if(!stewardshipSuggestions) return;
  const people = stewardshipPeople();
  const suggestions = [];
  for(const item of people){
    if(suggestions.length >= 3) break;
    const matches = stewardshipBestMatches(item.profile, 1);
    if(matches.length) suggestions.push({a:item, b:matches[0].item, fit:matches[0].fit});
  }
  stewardshipSuggestions.innerHTML = '';
  if(!suggestions.length){
    stewardshipSuggestions.innerHTML = '<article class="stewardship-empty"><strong>No suggested introductions are ready yet.</strong><p>VAL is still learning what people need and offer. You can create an introduction manually or open Network to discover possible matches.</p></article>';
    return;
  }
  suggestions.forEach((suggestion, index) => {
    const card = document.createElement('article');
    card.className = 'stewardship-suggestion-card';
    card.innerHTML = [
      '<span>Suggested Introduction</span>',
      '<h5>' + escapeHtml(suggestion.a.name || 'Person A') + ' &lt;-&gt; ' + escapeHtml(suggestion.b.name || 'Person B') + '</h5>',
      '<p><strong>Why this could matter</strong><br>' + escapeHtml(suggestion.fit.because) + '</p>',
      '<p><strong>Evidence</strong><br>' + escapeHtml((suggestion.fit.evidence || []).slice(0, 2).join(' | ') || 'Source evidence is attached to both packets.') + '</p>',
      '<button type="button" data-stewardship-draft-pair="' + index + '">Review Draft</button>'
    ].join('');
    card.dataset.stewardshipA = suggestion.a.id;
    card.dataset.stewardshipB = suggestion.b.id;
    stewardshipSuggestions.appendChild(card);
  });
}

function renderStewardshipCreateControls(){
  if(!stewardshipPersonASelect || !stewardshipPersonBSelect) return;
  const people = stewardshipPeople();
  const options = '<option value="">Choose a person</option>' + people.map((item) => '<option value="' + escapeHtml(item.id) + '">' + escapeHtml(item.name) + '</option>').join('');
  if(stewardshipPersonASelect.innerHTML !== options) stewardshipPersonASelect.innerHTML = options;
  if(stewardshipPersonBSelect.innerHTML !== options) stewardshipPersonBSelect.innerHTML = options;
  stewardshipPersonASelect.value = stewardshipPersonAId;
  stewardshipPersonBSelect.value = stewardshipPersonBId;
  renderStewardshipComparison();
}

function renderStewardshipComparison(){
  if(!stewardshipComparison) return;
  const a = stewardshipPersonById(stewardshipPersonAId);
  const b = stewardshipPersonById(stewardshipPersonBId);
  if(!a || !b){
    stewardshipComparison.innerHTML = '<article class="stewardship-empty"><strong>Choose two people.</strong><p>VAL will compare needs, offers, constraints, and evidence before drafting anything.</p></article>';
    return;
  }
  const fit = stewardshipIntroFit(a, b);
  const missing = fit.missing?.length ? '<ul>' + fit.missing.map((line) => '<li>' + escapeHtml(line) + '</li>').join('') + '</ul>' : '';
  stewardshipComparison.innerHTML = [
    '<article class="stewardship-comparison-card">',
    '<span>Create Introduction</span>',
    '<h5>' + escapeHtml(a.name || 'Person A') + ' and ' + escapeHtml(b.name || 'Person B') + '</h5>',
    '<div class="stewardship-four-grid">',
    stewardshipMiniList('Needs', [a.name + ' needs: ' + stewardshipNeeds(a)[0], b.name + ' needs: ' + stewardshipNeeds(b)[0]]),
    stewardshipMiniList('Offers', [a.name + ' offers: ' + stewardshipOffers(a)[0], b.name + ' offers: ' + stewardshipOffers(b)[0]]),
    stewardshipMiniList('Evidence', fit.evidence || []),
    stewardshipMiniList('Missing Piece / Constraints', fit.ready ? ['No blocking constraint is visible yet.'] : (fit.missing || [])),
    '</div>',
    '<p><strong>Why this could matter</strong><br>' + escapeHtml(fit.because) + '</p>',
    fit.ready ? '<pre>' + escapeHtml(stewardshipDraftPreview(a, b, fit)) + '</pre><button type="button" data-stewardship-review-manual>Draft Introduction</button>' : '<div class="stewardship-not-fit"><strong>I do not see a strong reason to introduce these two yet.</strong>' + missing + '</div>',
    '</article>'
  ].join('');
}

function stewardshipMiniList(title = '', rows = []){
  const cleanRows = stewardshipCleanList(rows, 'Not enough evidence yet.');
  return '<section><strong>' + escapeHtml(title) + '</strong><ul>' + cleanRows.map((line) => '<li>' + escapeHtml(line) + '</li>').join('') + '</ul></section>';
}

function renderStewardshipNetworkList(){
  if(!relationshipRolodex) return;
  relationshipRolodex.innerHTML = '';
  const query = relationshipIndexSearch.trim().toLowerCase();
  const items = stewardshipPeople().filter((item) => relationshipItemMatchesSearch(item, query));
  relationshipRolodex.dataset.relationshipDensity = items.length >= 12 ? 'compact' : 'comfortable';
  if(!items.length){
    const empty = document.createElement('p');
    empty.className = 'relationship-rolodex-empty';
    empty.textContent = query ? 'No Network matches this search.' : 'No admitted Network people are ready yet.';
    relationshipRolodex.appendChild(empty);
    renderStewardshipNetworkDetail(null);
    return;
  }
  items.forEach((item) => {
    appendRelationshipRolodexRow(item);
  });
  if(!stewardshipSelectedNetworkId || !items.some((item) => item.id === stewardshipSelectedNetworkId)) stewardshipSelectedNetworkId = items[0].id;
  renderStewardshipNetworkDetail(stewardshipPersonById(stewardshipSelectedNetworkId));
}

function setRelationshipDetailMode(mode = 'brief'){
  const showIndex = mode === 'index';
  document.querySelector('#relationship-detail')?.classList.toggle('show-index', showIndex);
  relationshipFolderButtons.forEach((button) => {
    const activeId = activeRelationshipProfile?.profileId || activeRelationshipProfile?.id || '';
    const profile = relationshipProfiles[button.dataset.relationshipProfile] || {};
    const profileId = button.dataset.relationshipProfile || profile.profileId || profile.id || '';
    button.classList.toggle('active', !showIndex && activeRelationshipProfile && profileId === activeId);
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
    'Current understanding: ' + (profile.stewardshipStatus || profile.relationshipStateLabel || profile.temperature || 'Not set'),
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
    'Boundary: approval records local Teach VAL learning only. It does not directly change visible relationship status, CRM, messages, or external systems.'
  ].filter(Boolean);
}

async function openRelationshipTemperatureReviewQueue(){
  if(mockScrapers || !canUseApi){
    setWorkspaceContent({
      lens: 'Relationship Understanding',
      title: 'Relationship understanding correction is waiting for review.',
      meaning: 'In live VAL, this opens the pending relationship-understanding correction without leaving the Hearth.',
      understanding: ['Mock-safe mode is on.', 'No backend review queue was changed.', 'No durable memory, CRM update, message, or relationship fact changed.'],
      recommendation: 'Approve or reject from the live review queue when the local VAL API is available.',
      actions: relationshipContextActions([{label:'Teach relationship understanding again', workflow:'relationship:teach_temperature'}]),
      label: 'Relationship understanding review queue'
    });
    openWorkspaceShell('Relationship understanding review queue', {returnTarget:'relationship'});
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
      lens: 'Relationship Understanding',
      title: 'No relationship understanding corrections are waiting.',
      meaning: 'The relationship understanding review queue is clear.',
      understanding: ['No pending relationship_temperature_correction update was found.', 'No durable memory, CRM update, message, or relationship fact changed.', 'You can teach VAL temperature again from the relationship brief.'],
      recommendation: 'Return to the relationship or all people.',
      actions: relationshipContextActions([{label:'Teach relationship understanding again', workflow:'relationship:teach_temperature'}]),
      label: 'Relationship understanding review empty'
    });
    openWorkspaceShell('Relationship understanding review empty', {returnTarget:'relationship'});
    return;
  }
  setWorkspaceContent({
    lens: 'Relationship Understanding',
    title: 'Review relationship understanding correction.',
    meaning: 'This is the approval gate for one relationship-understanding correction. It can teach future judgment, but it cannot move the visible status by itself.',
    understanding: relationshipTemperatureReviewUpdateLines(update),
    recommendation: 'Approve if this should become local learning for future relationship judgment. Reject if the evidence is too thin, too stale, or aimed at the wrong relationship.',
    actions: relationshipContextActions([
      {label:'Approve temperature learning', workflow:'relationshipTemperatureApprove'},
      {label:'Reject temperature learning', workflow:'relationshipTemperatureReject'}
    ]),
    label: 'Relationship understanding review approval'
  });
  openWorkspaceShell('Relationship understanding review approval', {returnTarget:'relationship'});
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
  const result = await postJson('/api/val/review-updates/' + encodeURIComponent(update.id) + '/' + (approved ? 'approve' : 'reject'), approved ? {note:'Approved from Hearth relationship understanding review.'} : {reason:'Rejected from Hearth relationship understanding review.'});
  activeRelationshipTemperatureReviewUpdate = result.update || null;
  syncRelationshipTemperatureReviewState(result.update || update);
  setWorkspaceContent({
    lens: 'Relationship Understanding',
    title: approved ? 'Relationship understanding learning approved locally.' : 'Relationship understanding learning rejected.',
    meaning: approved ? 'VAL recorded this as local relationship-understanding learning, without changing the visible status directly.' : 'VAL set this correction aside without creating memory or changing the relationship.',
    understanding: [
      'Review update: ' + (result.update?.updateType || 'relationship_temperature_correction'),
      'Status: ' + (result.update?.status || (approved ? 'approved' : 'rejected')),
      approved && result.update?.appliedTargetId ? 'Local learning receipt: ' + result.update.appliedTargetId : '',
      'No CRM update, message, scrape, import, external action, or direct relationship-temperature change happened.'
    ].filter(Boolean),
    recommendation: approved ? 'Use this as a learning receipt, not a temperature mutation. Future observer-backed movement still needs evidence.' : 'Return to the relationship and teach VAL again only if there is better evidence.',
    actions: relationshipContextActions([{label:'Review another understanding correction', workflow:'relationshipTemperatureReview'}]),
    label: 'Relationship understanding review decision'
  });
  openWorkspaceShell('Relationship understanding review decision', {returnTarget:'relationship'});
}

function openRelationshipIndex(){
  if(relationshipSearchInput) relationshipSearchInput.value = relationshipIndexSearch;
  if(relationshipSortSelect) relationshipSortSelect.value = relationshipSortMode;
  relationshipStateFilterButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.relationshipStateFilter === relationshipStateFilter);
    button.setAttribute('aria-pressed', String(button.classList.contains('active')));
  });
  hydrateRelationshipIndex();
  setRelationshipDetailMode('index');
  setStewardshipView(stewardshipActiveView || 'suggested');
}

function projectIndexItems(){
  const canonicalItems = Object.values(projectIndexProfiles);
  return (projectIndexLoaded ? canonicalItems : Object.values(projectProfiles)).filter(projectIsDrawerAdmitted);
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
  const nestedDetails = project.sourceDetails || project.sources || {};
  const details = {
    ...nestedDetails,
    files: Array.isArray(project.files) ? project.files : nestedDetails.files,
    sopId: project.sopId || nestedDetails.sopId,
    websiteSource: project.websiteSource || project.website || nestedDetails.websiteSource || nestedDetails.website,
    documents: typeof project.documents === 'string' ? project.documents : (project.documentNotes || nestedDetails.documents || nestedDetails.documentNotes),
    relationships: typeof project.relationships === 'string' ? project.relationships : (project.people || nestedDetails.relationships || nestedDetails.people),
    rawContext: project.rawContext || project.notes || nestedDetails.rawContext || nestedDetails.notes
  };
  return {
    files: Array.isArray(details.files) ? details.files : [],
    sopId: details.sopId || project.sopId || '',
    websiteSource: details.websiteSource || details.website || '',
    documents: details.documents || details.documentNotes || '',
    relationships: details.relationships || details.people || '',
    rawContext: details.rawContext || details.notes || ''
  };
}

function projectCompactText(value = '', limit = 220){
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if(!text || text.length <= limit) return text;
  return text.slice(0, Math.max(0, limit - 3)).trimEnd() + '...';
}

function projectSimilarText(a = '', b = ''){
  const left = projectCompactText(a, 140).toLowerCase();
  const right = projectCompactText(b, 140).toLowerCase();
  if(!left || !right) return false;
  return left.includes(right.slice(0, 70)) || right.includes(left.slice(0, 70));
}

function projectJudgmentLabel(candidate = '', fallback = '', blocked = []){
  const text = projectCompactText(candidate, 160);
  if(!text) return fallback;
  const looksRaw = text.length > 105 || text.endsWith('...') || blocked.some((blockedText) => projectSimilarText(text, blockedText));
  return looksRaw ? fallback : text;
}

function projectEvidenceText(candidate = '', fallback = '', blocked = []){
  const text = projectCompactText(candidate, 260);
  if(!text) return fallback;
  return blocked.some((blockedText) => projectSimilarText(text, blockedText)) ? fallback : text;
}

function projectSourceDisplayText(value = '', limit = 520){
  const raw = String(value || '').trim();
  if(!raw) return '';
  const url = raw.match(/https?:\/\/[^\s<>"']+/)?.[0] || '';
  if(raw.length > 1200 || /<\/?[a-z][\s\S]*>/i.test(raw)){
    const plain = raw
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return [
      url ? 'URL: ' + url : '',
      'Captured source: ' + raw.length.toLocaleString() + ' characters',
      projectCompactText(plain, 320)
    ].filter(Boolean).join('\n');
  }
  return projectCompactText(raw, limit);
}

const projectSopLibrary = {
  frisson_partner_onboarding: {
    id:'frisson_partner_onboarding',
    name:'Frisson Partner Onboarding',
    phase:'Initiation and onboarding',
    whenToUse:'Use when a new Frisson partner needs dashboard setup, automations, connections, launch metrics, and long-term partnership nurture.',
    defaultPhases:['Initiate partner fit','Plan dashboard and automations','Build connections','Launch and validate','Monitor activation','Nurture partnership'],
    workstreams:['Partner dashboard','Automations','API connections','Metrics','Launch communications','Relationship nurture'],
    milestones:['Partner profile complete','Dashboard live','Automations tested','Metrics reporting','First activation review','Monthly partnership review'],
    approvalPoints:['Before external launch message','Before CRM/API write','Before dashboard handoff','Before monthly performance recommendation'],
    monitoringRules:['Activation health','Automation failures','Partner response cadence','Nonprofit engagement signal','Renewal or expansion opportunity'],
    relationshipNurtureRules:['Confirm communication cadence','Protect partner trust after launch','Surface useful wins','Prepare monthly check-in'],
    riskPatterns:['Missing API credentials','Unclear partner owner','Dashboard metrics not defined','Launch message not approved']
  },
  client_dashboard_buildout: {
    id:'client_dashboard_buildout',
    name:'Client Dashboard Buildout',
    phase:'Planning',
    whenToUse:'Use when a client needs a dashboard, data sources, metrics, and handoff workflow built.',
    defaultPhases:['Define outcome','Map data sources','Build dashboard','Validate metrics','Handoff and train','Monitor reliability'],
    workstreams:['Data source mapping','Dashboard design','Metric definitions','Permissions','QA','Client handoff'],
    milestones:['Metric brief approved','Data source connected','Dashboard draft ready','QA complete','Client handoff complete'],
    approvalPoints:['Before sharing externally','Before changing source systems','Before final handoff'],
    monitoringRules:['Broken data source','Metric drift','Stakeholder usage','Follow-up questions'],
    relationshipNurtureRules:['Ask what decisions the dashboard should support','Send a useful post-handoff check-in'],
    riskPatterns:['Wrong metric definitions','Missing permissions','Unclear owner']
  },
  relationship_nurture_partnership: {
    id:'relationship_nurture_partnership',
    name:'Long-Term Partnership Nurture',
    phase:'Sustainment',
    whenToUse:'Use when the main work is protecting and expanding a strategic relationship over time.',
    defaultPhases:['Clarify relationship value','Set cadence','Track promises','Prepare useful touches','Monitor drift','Create expansion opportunities'],
    workstreams:['Relationship memory','Follow-up cadence','Mutual value','Open loops','Opportunity detection'],
    milestones:['Cadence set','First useful follow-up sent','Open loops clean','Opportunity reviewed','Quarterly relationship review'],
    approvalPoints:['Before sensitive outreach','Before opportunity proposal','Before CRM update'],
    monitoringRules:['Days since contact','Open commitments','Tone shift','Unanswered messages','New opportunity signals'],
    relationshipNurtureRules:['Bring value, not noise','Use short useful updates','Protect trust before expansion'],
    riskPatterns:['Cadence drift','Asking before giving','Unclosed promises']
  },
  new_sop: {
    id:'new_sop',
    name:'Create New SOP',
    phase:'SOP discovery',
    whenToUse:'Use when this project should teach VAL a reusable operating pattern.',
    defaultPhases:['Interview user','Find repeatable steps','Run project','Capture lessons','Publish SOP draft'],
    workstreams:['Discovery','Pattern capture','Execution','Learning'],
    milestones:['Project interview complete','Repeatable steps identified','Lessons captured','SOP draft ready'],
    approvalPoints:['Before reusing this SOP for another project'],
    monitoringRules:['Repeated steps','Corrections from user','Successful approvals'],
    relationshipNurtureRules:['Ask which relationships this SOP should protect'],
    riskPatterns:['Overfitting one project','Missing approval gates']
  }
};

function projectSopPacket(project = {}){
  const details = normalizedProjectSourceDetails(project);
  const selected = project.sopId || details.sopId || project.sop_id || '';
  const needsOnboarding = projectNeedsOnboarding(project);
  const hasInterviewPacket = Boolean(projectOnboardingData(project).firstAnswer || projectOnboardingData(project).ownerMonitoringAnswer || project.projectInterviewNotes || project.ownerMonitoringNotes);
  const inferred = !selected && !needsOnboarding && !hasInterviewPacket && /frisson|partner|onboarding/i.test([project.name, project.summary, project.reality, details.rawContext].join(' ')) ? 'frisson_partner_onboarding' : selected;
  const sop = projectSopLibrary[inferred] || null;
  if(needsOnboarding && !sop){
    return {
      sop_id:'needs_project_onboarding',
      sop_name:'Needs project onboarding',
      current_phase:'Project onboarding',
      when_to_use:'Answer the onboarding question before VAL selects an operating system.',
      default_phases:[],
      default_workstreams:[],
      standard_milestones:[],
      approval_points:['Before external action'],
      monitoring_rules:[],
      relationship_nurture_rules:[],
      risk_patterns:['Project shell has evidence but no defined outcome yet'],
      known_deviations:['Created from document evidence and waiting for executive shaping']
    };
  }
  if(!sop){
    return {
      sop_id:'no_sop_selected',
      sop_name:'No SOP selected yet',
      current_phase:'Project interview',
      when_to_use:'VAL should interview the user and determine whether an existing SOP fits.',
      default_phases:['Interview','Shape','Plan','Execute','Monitor'],
      default_workstreams:Array.isArray(project.workstreams) && project.workstreams.length ? project.workstreams : ['Outcome','People','Next move'],
      standard_milestones:Array.isArray(project.milestones) && project.milestones.length ? project.milestones : ['Project manager packet complete'],
      approval_points:['Before external action'],
      monitoring_rules:Array.isArray(project.monitoringRules) && project.monitoringRules.length ? project.monitoringRules : ['Ask what VAL should watch after launch'],
      relationship_nurture_rules:Array.isArray(project.relationshipNurtureRules) && project.relationshipNurtureRules.length ? project.relationshipNurtureRules : ['Ask which relationships this project should protect'],
      risk_patterns:['Project stays too vague to manage'],
      known_deviations:['SOP fit still needs user confirmation']
    };
  }
  return {
    sop_id:sop.id,
    sop_name:sop.name,
    current_phase:project.projectPhase || sop.phase,
    when_to_use:sop.whenToUse,
    default_phases:sop.defaultPhases,
    default_workstreams:Array.isArray(project.workstreams) && project.workstreams.length ? project.workstreams : sop.workstreams,
    standard_milestones:Array.isArray(project.milestones) && project.milestones.length ? project.milestones : sop.milestones,
    approval_points:sop.approvalPoints,
    monitoring_rules:Array.isArray(project.monitoringRules) && project.monitoringRules.length ? project.monitoringRules : sop.monitoringRules,
    relationship_nurture_rules:Array.isArray(project.relationshipNurtureRules) && project.relationshipNurtureRules.length ? project.relationshipNurtureRules : sop.relationshipNurtureRules,
    risk_patterns:sop.riskPatterns,
    known_deviations:project.sopDeviations || []
  };
}

function projectCleanText(value, fallback = ''){
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text || fallback;
}

function projectMetadataObject(value = {}){
  const raw = value?.metadataJson || value?.metadata_json || value?.metadata || {};
  if(typeof raw === 'string'){
    try{
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    }catch(error){
      return {};
    }
  }
  return raw && typeof raw === 'object' ? raw : {};
}

function projectNeedsOnboarding(project = {}){
  const metadata = projectMetadataObject(project);
  const details = normalizedProjectSourceDetails(project);
  const onboarding = metadata.projectOnboarding || metadata.project_onboarding || {};
  const createdFrom = project.createdFrom || metadata.createdFrom || metadata.created_from || '';
  const sourceText = [project.sourceReceipts, project.signal, details.rawContext].filter(Boolean).join(' ');
  if(['answered_first_question','owner_monitoring_answered','workstreams_answered','lanes_answered','milestones_answered','relationship_nurture_answered','prepared_work_answered','in_progress','complete'].includes(String(onboarding.status || '').toLowerCase())) return false;
  return Boolean(
    project.needsProjectOnboarding ||
    metadata.needsProjectOnboarding ||
    metadata.needs_project_onboarding ||
    onboarding.status === 'needs_interview' ||
    onboarding.status === 'needs_onboarding' ||
    createdFrom === 'hearth_project_document_assignment' ||
    /Project Managers document assignment/i.test(sourceText)
  );
}

function projectOnboardingData(project = {}){
  const metadata = projectMetadataObject(project);
  const onboarding = metadata.projectOnboarding || metadata.project_onboarding || {};
  return onboarding && typeof onboarding === 'object' ? onboarding : {};
}

function projectInterviewStage(project = {}){
  const onboarding = projectOnboardingData(project);
  const status = String(onboarding.status || '').toLowerCase();
  if(status === 'prepared_work_answered' || onboarding.preparedWorkAnswer) return 'complete';
  if(status === 'relationship_nurture_answered' || onboarding.relationshipNurtureAnswer || (Array.isArray(project.relationshipNurtureRules) && project.relationshipNurtureRules.length)) return 'prepared_work';
  if(status === 'milestones_answered' || onboarding.milestonesAnswer || (Array.isArray(project.milestones) && project.milestones.length)) return 'relationship_nurture';
  if(status === 'workstreams_answered' || status === 'lanes_answered' || onboarding.workstreamsAnswer || onboarding.lanesAnswer || (Array.isArray(project.workstreams) && project.workstreams.length)) return 'milestones';
  if(status === 'owner_monitoring_answered' || onboarding.ownerMonitoringAnswer || project.ownerMonitoringNotes) return 'workstreams';
  if(status === 'answered_first_question' && projectInterviewLooksLikeOwnerMonitoringAnswer(onboarding.firstAnswer)) return 'workstreams';
  if(status === 'answered_first_question' || onboarding.firstAnswer) return 'owner_monitoring';
  if(projectNeedsOnboarding(project)) return 'first_question';
  return 'owner_monitoring';
}

function projectInterviewStageContract(stage = 'first_question'){
  return PROJECT_INTERVIEW_STAGE_CONTRACTS[stage] || PROJECT_INTERVIEW_STAGE_CONTRACTS.complete;
}

function projectInterviewNextQuestion(project = activeProjectProfile){
  return projectInterviewStageContract(projectInterviewStage(project || {})).question;
}

function projectPersonName(value = ''){
  if(typeof value === 'string') return projectCleanText(value);
  if(!value || typeof value !== 'object') return '';
  return projectCleanText(value.name || value.displayName || value.relationshipName || value.email || value.id || value.contactId || value.profileKey || '');
}

function projectOwnerFromValue(value = {}){
  if(typeof value === 'string'){
    const name = projectCleanText(value);
    return name && name !== '[object Object]' ? {name, id:name, source:'text'} : null;
  }
  if(!value || typeof value !== 'object') return null;
  const name = projectPersonName(value);
  if(!name) return null;
  return {
    type:value.type || value.ownerType || 'relationship',
    id:String(value.id || value.relationshipId || value.profileId || value.contactId || value.contact_id || value.personId || value.person_id || value.profileKey || value.email || name),
    name,
    email:value.email || '',
    detail:value.detail || value.role || value.company || value.relationshipStatus || value.source || '',
    source:value.source || 'project_owner'
  };
}

function projectManagerHeaderColorByName(name = ''){
  const clean = String(name || '').trim().toLowerCase();
  if(!clean) return null;
  return PROJECT_MANAGER_HEADER_COLORS.find((color) => color.name.toLowerCase() === clean) || null;
}

function projectManagerHeaderColorByHex(hex = ''){
  const clean = String(hex || '').trim().toLowerCase();
  if(!/^#[0-9a-f]{3,6}$/i.test(clean)) return null;
  return PROJECT_MANAGER_HEADER_COLORS.find((color) => color.hex.toLowerCase() === clean) || null;
}

function projectManagerHeaderColorFor(value = ''){
  const key = String(value || 'project').toLowerCase().replace(/[^a-z0-9:_-]+/g, '_').slice(0, 180);
  const total = [...key].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return PROJECT_MANAGER_HEADER_COLORS[total % PROJECT_MANAGER_HEADER_COLORS.length];
}

function projectManagerHexToRgb(hex = ''){
  let clean = String(hex || '').trim().replace(/^#/, '');
  if(clean.length === 3) clean = clean.split('').map((part) => part + part).join('');
  if(!/^[0-9a-f]{6}$/i.test(clean)) return null;
  const value = Number.parseInt(clean, 16);
  return {
    r:(value >> 16) & 255,
    g:(value >> 8) & 255,
    b:value & 255
  };
}

function projectManagerColorText(hex = ''){
  const rgb = projectManagerHexToRgb(hex);
  if(!rgb) return 'rgba(34,19,15,.88)';
  const brightness = ((rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114)) / 1000;
  return brightness < 126 ? 'rgba(255,255,252,.94)' : 'rgba(34,19,15,.88)';
}

function projectManagerColorStyle(manager = {}){
  const hex = /^#[0-9a-f]{3,6}$/i.test(manager.hex || '') ? manager.hex : '#f8f8f5';
  const rgb = projectManagerHexToRgb(hex) || {r:248,g:248,b:245};
  return [
    '--project-manager-color:' + hex,
    '--project-manager-color-soft:rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',.22)',
    '--project-manager-color-border:rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',.58)',
    '--project-manager-color-text:' + projectManagerColorText(hex)
  ].join(';');
}

function projectManagerAssignment(project = {}){
  const metadata = projectMetadataObject(project);
  const dossier = project.dossier || {};
  const dossierMetadata = projectMetadataObject(dossier);
  const dossierCard = dossier.card || {};
  const assigned = project.assignedProjectManager ||
    metadata.assignedProjectManager ||
    metadata.projectManager ||
    project.projectManager ||
    project.manager ||
    project.project_manager ||
    dossierCard.assignedProjectManager ||
    dossierMetadata.assignedProjectManager ||
    dossierMetadata.projectManager ||
    null;
  const manager = typeof assigned === 'string' ? {name:assigned} : (assigned && typeof assigned === 'object' ? assigned : {});
  const stableValue = project.id || project.projectId || project.profileKey || project.name || metadata.projectId || metadata.projectName || 'project';
  const fallback = projectManagerHeaderColorFor(stableValue);
  const named = projectManagerHeaderColorByName(manager.name);
  const hexNamed = projectManagerHeaderColorByHex(manager.hex);
  const accepted = named || hexNamed || fallback;
  const name = accepted.name || fallback.name;
  const hex = accepted.hex || fallback.hex;
  return {
    name,
    hex,
    family: accepted.family || fallback.family,
    source: named || hexNamed ? 'assigned_project_manager' : 'deterministic_project_manager'
  };
}

function projectListFromValue(value){
  if(Array.isArray(value)) return value.map((item) => typeof item === 'string' ? item : (item.name || item.title || item.summary || item.label || '')).map((item) => projectCleanText(item)).filter(Boolean);
  return String(value || '')
    .split(/\n|,|;/)
    .map((item) => projectCleanText(item))
    .filter(Boolean);
}

function projectRelationshipValue(project = {}, details = normalizedProjectSourceDetails(project)){
  if(Array.isArray(project.relationships) && project.relationships.length) return project.relationships;
  if(Array.isArray(project.people) && project.people.length) return project.people;
  return project.relationships || details.relationships || project.people || '';
}

function projectResolvedRelationships(project = {}, details = normalizedProjectSourceDetails(project)){
  const rawRelationships = projectListFromValue(projectRelationshipValue(project, details));
  const text = rawRelationships.concat([
    details.relationships,
    project.summary,
    project.reality,
    project.signal
  ]).filter(Boolean).join(' ').toLowerCase();
  const relationshipSources = [
    ...Object.values(relationshipProfiles || {}),
    ...Object.values(relationshipIndexProfiles || {})
  ];
  const matched = relationshipSources
    .map((profile) => profile.name || profile.displayName || profile.identity || '')
    .filter(Boolean)
    .filter((name, index, names) => names.findIndex((candidate) => candidate.toLowerCase() === name.toLowerCase()) === index)
    .filter((name) => text.includes(name.toLowerCase()));
  return matched.length ? matched : rawRelationships;
}

function projectRelationshipOptionFromProfile(profile = {}){
  const query = profile.query || {};
  const name = profile.name || profile.displayName || profile.identity || query.name || profile.email || '';
  if(!name) return null;
  const id = profile.profileId || profile.id || query.targetId || query.contactId || profile.contactId || profile.crmContactId || profile.personId || profile.profileKey || profile.email || name;
  return {
    id:String(id),
    name,
    email:query.email || profile.email || '',
    contactId:query.contactId || profile.contactId || profile.crmContactId || profile.personId || '',
    detail:profile.company || profile.role || profile.temperature || profile.relationshipStatus || '',
    profile
  };
}

function projectRelationshipOptions(){
  const profiles = [
    ...Object.values(relationshipProfiles || {}),
    ...Object.values(relationshipIndexProfiles || {})
  ];
  const seen = new Set();
  return profiles.map(projectRelationshipOptionFromProfile).filter(Boolean).filter((option) => {
    const key = option.email ? 'email:' + option.email.toLowerCase() : option.name.toLowerCase();
    if(seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 24);
}

function projectRelationshipOptionById(id = ''){
  const clean = String(id || '');
  return projectRelationshipOptions().find((option) => option.id === clean || option.name === clean || option.email === clean) || null;
}

function projectOwnerProjectKey(project = activeProjectProfile){
  return project?.projectId || project?.id || project?.profileKey || project?.name || 'project';
}

function projectOwnerAssignment(project = {}, relationships = projectResolvedRelationships(project)){
  const metadata = projectMetadataObject(project);
  const dossier = project.dossier || {};
  const dossierMetadata = projectMetadataObject(dossier);
  const dossierCard = dossier.card || {};
  const rawOwner = project.owner ||
    project.nextStepOwner ||
    project.projectOwner ||
    metadata.owner ||
    metadata.projectOwner ||
    metadata.relationship ||
    dossierCard.owner ||
    dossierCard.projectOwner ||
    dossierMetadata.owner ||
    dossierMetadata.projectOwner ||
    null;
  let owner = projectOwnerFromValue(rawOwner);
  if(!owner && relationships.length){
    const matched = projectRelationshipOptions().find((option) => option.name.toLowerCase() === String(relationships[0]).toLowerCase());
    owner = matched || {id:relationships[0], name:relationships[0], source:'relationship_context'};
  }
  if(!owner) return {id:'', name:'', detail:'', email:'', source:'missing_owner'};
  const matched = projectRelationshipOptions().find((option) =>
    [owner.id, owner.name, owner.email].filter(Boolean).some((value) =>
      option.id === value || option.name.toLowerCase() === String(value).toLowerCase() || option.email.toLowerCase() === String(value).toLowerCase()
    )
  );
  return {
    ...owner,
    id:String(matched?.id || owner.id || owner.name),
    name:matched?.name || owner.name,
    email:matched?.email || owner.email || '',
    detail:owner.detail || matched?.detail || '',
    source:owner.source || 'project_owner'
  };
}

function projectAdmissionPacket(project = {}){
  const details = normalizedProjectSourceDetails(project);
  const sourceTypes = [
    details.files?.length ? 'files' : '',
    details.websiteSource ? 'website_or_source' : '',
    details.documents ? 'documents' : '',
    details.relationships ? 'relationships' : '',
    details.rawContext ? 'notes' : '',
    Array.isArray(project.graphLinks) && project.graphLinks.length ? 'graph_links' : '',
    Array.isArray(project.preparedWork) && project.preparedWork.length ? 'prepared_work' : '',
    Array.isArray(project.reviewUpdates) && project.reviewUpdates.length ? 'review_updates' : '',
    Array.isArray(project.documents) && project.documents.length ? 'documents_reference' : ''
  ].filter(Boolean);
  const hasOngoingProof = Boolean(
    project.explicitUserProject ||
    project.projectId ||
    project.status ||
    project.reality ||
    project.nextMove ||
    project.decision ||
    project.sourceReceipts ||
    sourceTypes.length > 1
  );
  const manualSuppression = Boolean(project.manualSuppression || project.suppressed || project.notExecutiveRelevant);
  let admissionState = 'quiet_evidence';
  if(manualSuppression) admissionState = 'suppressed';
  else if(hasOngoingProof) admissionState = project.strategicImportance || project.priority === 'strategic' ? 'strategic_project' : 'active_project';
  else if(project.name || project.summary) admissionState = 'candidate_project';
  return {
    source_id: project.projectId || project.id || project.profileKey || project.name || '',
    source_type: 'project_profile',
    project_candidate_name: project.name || project.displayName || '',
    explicit_user_project: Boolean(project.explicitUserProject || project.createdBy === 'user'),
    source_count: sourceTypes.length || (project.sourceReceipts ? 1 : 0),
    source_types: sourceTypes,
    has_deliverable: Boolean(project.deliverable || project.nextMove || project.preparedWork?.length),
    has_deadline: Boolean(project.deadline || project.dueAt || project.nextStepDueAt),
    has_owner: Boolean(project.owner || project.nextStepOwner || details.relationships),
    has_commitment: Boolean(project.commitments?.length || project.openLoops?.length || project.nextMove),
    has_document: Boolean(details.documents || details.files?.length || project.documents?.length),
    has_calendar_context: Boolean(project.calendarEvents?.length || project.meetings?.length),
    has_relationship_context: Boolean(details.relationships || project.relationships?.length || project.graphLinks?.length),
    has_prepared_work: Boolean(project.preparedWork?.length),
    manual_suppression: manualSuppression,
    admission_state: admissionState,
    admission_rule: manualSuppression ? 'manual_suppression' : (hasOngoingProof ? 'ongoing_work_with_project_evidence' : 'insufficient_project_evidence'),
    confidence: project.confidence || (hasOngoingProof ? 82 : 48),
    source_receipts: project.sourceReceipts || sourceTypes.join(' · ')
  };
}

function projectIsDrawerAdmitted(project = {}){
  const packet = projectAdmissionPacket(project);
  return ['active_project','strategic_project','blocked_project','prepared_project_work'].includes(packet.admission_state);
}

function projectManagerPacket(project = {}){
  const admission = projectAdmissionPacket(project);
  const details = normalizedProjectSourceDetails(project);
  const sop = projectSopPacket(project);
  const needsOnboarding = projectNeedsOnboarding(project);
  const relationships = projectResolvedRelationships(project, details);
  const assignedProjectManager = projectManagerAssignment(project);
  const ownerAssignment = projectOwnerAssignment(project, relationships);
  const docs = projectListFromValue(project.documents || details.documents);
  const graph = Array.isArray(project.graphLinks) ? project.graphLinks : [];
  const prepared = Array.isArray(project.preparedWork) ? project.preparedWork : [];
  const reviewUpdates = Array.isArray(project.reviewUpdates) ? project.reviewUpdates : [];
  const interviewStage = projectInterviewStage(project);
  const interviewContract = projectInterviewStageContract(interviewStage);
  const risk = projectCleanText(project.risk || project.riskSummary || project.decisionEvidence, needsOnboarding ? 'No project risk has been defined yet.' : 'No active blocker has been proven yet.');
  const owner = projectCleanText(ownerAssignment.name, 'VAL is still matching the responsible owner.');
  const nextAction = projectCleanText(project.nextMove || project.recommendedAction, needsOnboarding ? 'Answer the project onboarding question.' : 'Decide the next narrow move.');
  const whyNow = projectCleanText(project.whyNow || project.nextMoveEvidence || project.decisionEvidence || project.signal, needsOnboarding ? 'VAL has the project shell and document evidence, but needs the executive outcome before it can manage the work.' : 'This project has enough evidence to deserve a clean next move.');
  const purposeFallback = needsOnboarding ? 'Project details are blank until onboarding is complete.' : 'Keep this body of work moving without scattering the user across sources.';
  const desiredOutcomeFallback = needsOnboarding ? '' : nextAction;
  const currentStateFallback = needsOnboarding ? 'Needs onboarding' : 'Active project';
  const importanceFallback = needsOnboarding ? 'Needs onboarding before VAL can judge importance.' : 'This work has enough consequence to coordinate.';
  const seasonFallback = needsOnboarding ? 'Project onboarding' : 'Active coordination';
  return {
    project_admission_packet: admission,
    project_identity_packet: {
      project_id: admission.source_id,
      canonical_name: project.name || 'Project',
      aliases: project.aliases || [],
      purpose: projectCleanText(project.purpose || (needsOnboarding ? '' : (project.summary || project.reality)), purposeFallback),
      desired_outcome: projectCleanText(project.desiredOutcome || project.outcome || (needsOnboarding ? '' : project.nextMove), desiredOutcomeFallback),
      current_state: projectCleanText(project.status, currentStateFallback),
      strategic_importance: projectCleanText(project.strategicImportance || project.importance || project.signal, importanceFallback),
      project_season: projectCleanText(project.projectSeason || project.season || project.momentum, seasonFallback),
      assigned_project_manager: assignedProjectManager,
      source_receipts: admission.source_receipts
    },
    project_manager_assignment_packet: assignedProjectManager,
    project_owner_packet: ownerAssignment,
    project_movement_packets: [{
      what_changed: projectCleanText(project.signal || project.momentum, needsOnboarding ? 'A project shell was created from document evidence.' : 'Project evidence is active enough for review.'),
      source_type: admission.source_type,
      source_id: admission.source_id,
      timestamp: project.updatedAt || project.lastInteraction || '',
      why_it_may_matter: projectCleanText(project.momentumEvidence || project.signal, whyNow),
      source_receipt: admission.source_receipts
    }],
    project_manager_judgment_packet: {
      current_reality: projectCleanText(project.reality || project.summary, needsOnboarding ? 'Project shell exists; outcome is not defined yet.' : project.status || 'Project is active.'),
      why_it_matters: projectCleanText(project.whyItMatters || project.decisionEvidence || project.signal, needsOnboarding ? 'VAL should not infer the project plan before the executive names the outcome.' : 'This project can affect relationships, commitments, prepared work, or executive attention.'),
      what_val_now_knows: projectCleanText(project.whatValNowKnows || project.momentumEvidence, needsOnboarding ? 'VAL knows there is document evidence for a possible project.' : 'VAL has enough connected evidence to keep this project coordinated.'),
      what_is_blocked: projectCleanText(project.blocker || project.blockedBy || (reviewUpdates.length ? 'Some project source learning still needs review.' : ''), needsOnboarding ? 'The onboarding answer is missing.' : 'No proven blocker is active.'),
      what_is_at_risk: risk,
      recommended_next_step: nextAction,
      next_step_owner: owner,
      next_step_due_at: project.nextStepDueAt || project.deadline || project.dueAt || '',
      user_decision_needed: projectCleanText(project.userDecisionNeeded || project.decision, needsOnboarding ? PROJECT_ONBOARDING_FIRST_QUESTION : 'Confirm the next narrow move.'),
      confidence: project.confidence || admission.confidence,
      evidence_summary: projectCleanText(project.sourceReceipts || admission.source_receipts, 'Project evidence is held privately.')
    },
    project_relationships_packet: relationships.map((name) => ({relationship_name:name, role_in_project:'Connected to this work'})),
    project_commitments_packet: Array.isArray(project.commitments) ? project.commitments : [],
    project_risk_packet: {risk_summary:risk, mitigation_next_step:nextAction, owner},
    project_prepared_work_packets: prepared,
    project_next_action_packet: {
      next_action: nextAction,
      action_type: prepared.length ? 'review_prepared_work' : 'project_decision',
      owner,
      due_at: project.nextStepDueAt || project.deadline || '',
      why_now: whyNow,
      allowed_actions: prepared.length ? ['review','edit','approve'] : ['decide','clarify','prepare'],
      approval_required: prepared.length,
      can_val_act_status: prepared.length ? 'approval_required' : 'needs_direction',
      receipt_expected: prepared.length ? 'approval_receipt' : 'project_decision_receipt'
    },
    project_interview_packet: {
      project_id: admission.source_id,
      project_manager_id: 'pm_' + (admission.source_id || String(project.name || 'project').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')),
      current_question: interviewContract.question,
      question_purpose: 'Complete the named Project Manager page boxes without making the user inspect raw context.',
      target_packet_field: interviewContract.targetPacketField,
      target_page_boxes: interviewContract.pageBoxes,
      missing_fields: interviewContract.missingField ? [interviewContract.missingField] : [],
      ready_to_build_project_manager_packet: interviewStage === 'complete' || Boolean(project.name && (project.summary || project.reality) && relationships.length && (Array.isArray(project.workstreams) && project.workstreams.length))
    },
    project_sop_packet: sop,
    source_receipts: admission.source_receipts,
    downstream_feeds: ['relationships','commitments','documents','meeting_prep','executive_inbox','home_only_when_admitted']
  };
}

function projectCoworkScopeLabel(field = ''){
  if(field === 'project_overview') return 'Whole project';
  return String(field || 'project_context').replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function projectCoworkAffectedObject(field = '', project = {}, packet = {}){
  const map = {
    project_overview: 'project_manager_packet',
    what_this_is: 'project_identity_packet',
    why_it_matters: 'project_manager_judgment_packet.why_it_matters',
    next_move: 'project_next_action_packet',
    people_involved: 'project_relationships_packet',
    prepared_work: 'project_prepared_work_packets',
    documents_sources: 'project_identity_packet.source_receipts',
    risk_blocker: 'project_risk_packet',
    working_narrative: 'project_manager_judgment_packet.current_reality',
    what_val_needs_next: 'project_interview_packet',
    sop_fit: 'project_sop_packet',
    project_phase: 'project_sop_packet.current_phase',
    project_interview: 'project_interview_packet',
    workstreams: 'project_sop_packet.default_workstreams',
    milestones: 'project_sop_packet.standard_milestones',
    monitoring_rules: 'project_sop_packet.monitoring_rules',
    relationship_nurture: 'project_sop_packet.relationship_nurture_rules'
  };
  return {
    object_type: map[field] || 'project_manager_packet',
    object_label: projectCoworkScopeLabel(field),
    project_id: project.projectId || project.id || packet.project_identity_packet?.project_id || '',
    project_name: project.name || packet.project_identity_packet?.canonical_name || 'Project'
  };
}

function projectCoworkSourceReceiptLines(project = {}, packet = {}){
  const details = normalizedProjectSourceDetails(project);
  return [
    project.sourceReceipts || packet.source_receipts || '',
    details.documents ? 'Documents: ' + details.documents : '',
    details.relationships ? 'Relationships: ' + details.relationships : '',
    details.rawContext ? 'Raw context: ' + details.rawContext : ''
  ].map((line) => projectCleanText(line).slice(0, 900)).filter(Boolean).slice(0, 5);
}

function projectScopedCoworkPacket(field = 'project_overview', project = activeProjectProfile){
  const item = project || activeProjectProfile || projectProfiles.frisson;
  const packet = projectManagerPacket(item);
  const spec = projectCoworkSpec(field);
  const affectedObject = projectCoworkAffectedObject(field, item, packet);
  const sourceReceipts = projectCoworkSourceReceiptLines(item, packet);
  return {
    packet_name: 'project_scoped_cowork_packet',
    project_id: affectedObject.project_id,
    project_name: affectedObject.project_name,
    selected_action: field === 'project_overview' ? 'cowork_project_overview' : 'cowork_' + field,
    selected_action_label: spec.title || projectCoworkScopeLabel(field),
    affected_object: affectedObject,
    source_receipts: sourceReceipts,
    current_reality: packet.project_manager_judgment_packet.current_reality,
    recommended_next_step: packet.project_next_action_packet.next_action,
    allowed_actions: ['think','draft','compare','plan','summarize','ask_question','prepare_artifact_for_review'],
    never_do: ['send_email','send_sms','create_calendar_event','update_crm','assign_task','publish_document','mutate_external_system'],
    no_external_action: true
  };
}

function projectScopedCoworkContextLines(scopedPacket = {}){
  const receipts = Array.isArray(scopedPacket.source_receipts) ? scopedPacket.source_receipts : [];
  return [
    'Scoped packet: ' + scopedPacket.packet_name,
    'Project: ' + (scopedPacket.project_name || 'Project'),
    'Selected action: ' + (scopedPacket.selected_action_label || scopedPacket.selected_action || 'Project Co-Work'),
    'Affected object only: ' + (scopedPacket.affected_object?.object_type || 'project_manager_packet'),
    scopedPacket.current_reality ? 'Current reality: ' + scopedPacket.current_reality : '',
    scopedPacket.recommended_next_step ? 'Recommended next step: ' + scopedPacket.recommended_next_step : '',
    receipts.length ? 'Source receipts: ' + receipts.join(' | ') : 'Source receipts: no source receipts attached yet.',
    'Allowed actions: think, draft, compare, plan, summarize, ask questions, and prepare review-only artifacts.',
    'Never do: send, create calendar events, update CRM, assign tasks, publish, or mutate external systems from Co-Work.'
  ].filter(Boolean);
}

function projectCoworkChip(){
  return '<small class="project-manager-cowork-chip" aria-hidden="true">Co-Work</small>';
}

function projectManagerCard(label, title, body, extra = ''){
  const key = label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  return '<article class="project-manager-clickable" tabindex="0" role="button" data-project-cowork-field="' + escapeHtml(key) + '" aria-label="Co-Work on ' + escapeHtml(label) + '"><span>' + escapeHtml(label) + '</span><strong>' + escapeHtml(title) + '</strong><p>' + escapeHtml(body) + '</p>' + (extra ? '<small>' + escapeHtml(extra) + '</small>' : '') + projectCoworkChip() + '</article>';
}

function projectManagerList(items = [], emptyText = 'Nothing active here yet.'){
  const clean = items.map((item) => projectCleanText(item)).filter(Boolean);
  if(!clean.length) return '<li>' + escapeHtml(emptyText) + '</li>';
  return clean.slice(0, 5).map((item) => '<li>' + escapeHtml(item) + '</li>').join('');
}

function projectManagerDetailCard(field, label, html){
  return '<article class="project-manager-clickable" tabindex="0" role="button" data-project-cowork-field="' + escapeHtml(field) + '" aria-label="Co-Work on ' + escapeHtml(label) + '"><span>' + escapeHtml(label) + '</span>' + html + projectCoworkChip() + '</article>';
}

function renderProjectOnboardingPanel(project = activeProjectProfile, interview = {}){
  return [
    '<section class="project-onboarding-panel" aria-label="Project onboarding">',
      '<div>',
        '<span>Project onboarding</span>',
        '<strong>' + escapeHtml(interview.current_question || PROJECT_ONBOARDING_FIRST_QUESTION) + '</strong>',
        '<p>VAL has the project shell and evidence. The plan stays blank until this answer gives the project its shape.</p>',
      '</div>',
      '<button type="button" data-project-cowork-field="project_interview">Start onboarding chat</button>',
    '</section>'
  ].join('');
}

function renderProjectRoundTableOverview(packet = {}, needsOnboarding = false){
  const identity = packet.project_identity_packet || {};
  const judgment = packet.project_manager_judgment_packet || {};
  const next = packet.project_next_action_packet || {};
  const admission = packet.project_admission_packet || {};
  const items = [
    {field:'what_this_is', label:'Identity', title:identity.current_state || 'Project', body:identity.purpose || 'Project identity is waiting for detail.'},
    {field:'working_narrative', label:'Judgment', title:needsOnboarding ? 'Waiting for onboarding' : (judgment.current_reality || 'Current reality'), body:judgment.what_val_now_knows || judgment.why_it_matters || 'VAL is still gathering context.'},
    {field:'next_move', label:'Next', title:next.next_action || 'Name the next move', body:next.why_now || 'VAL needs a useful next step.'},
    {field:'documents_sources', label:'Evidence', title:admission.has_document ? 'Document evidence attached' : 'Evidence needed', body:identity.source_receipts || packet.source_receipts || 'No source receipt attached yet.'}
  ];
  return '<section class="project-round-table-overview" aria-label="Project Manager overview">' + items.map((item) => [
    '<article class="project-manager-clickable" tabindex="0" role="button" data-project-cowork-field="' + escapeHtml(item.field) + '">',
      '<span>' + escapeHtml(item.label) + '</span>',
      '<strong>' + escapeHtml(item.title) + '</strong>',
      '<p>' + escapeHtml(item.body) + '</p>',
      projectCoworkChip(),
    '</article>'
  ].join('')).join('') + '</section>';
}

function renderProjectRelationshipPicker(){
  const options = projectRelationshipOptions();
  return [
    '<div class="project-relationship-picker" aria-label="Choose relationships for this project">',
      options.map((option) => '<button type="button" data-project-relationship-choice="' + escapeHtml(option.name) + '"><strong>' + escapeHtml(option.name) + '</strong>' + (option.detail ? '<span>' + escapeHtml(option.detail) + '</span>' : '') + '</button>').join(''),
      '<button type="button" class="create" data-project-relationship-create><strong>Create new relationship</strong><span>Add someone not listed here.</span></button>',
    '</div>'
  ].join('');
}

function renderProjectOwnerControl(project = activeProjectProfile, owner = projectOwnerAssignment(project)){
  const projectKey = projectOwnerProjectKey(project);
  const status = projectOwnerStatusByProject[projectKey] || '';
  const options = projectRelationshipOptions();
  const ownerName = owner.name || 'Owner needs review';
  const ownerDetail = owner.name ? (owner.detail || owner.email || 'One owner is attached to this project.') : 'Choose a relationship or create a new one.';
  const choiceButtons = options.slice(0, 8).map((option) => {
    const active = owner.name && option.name.toLowerCase() === owner.name.toLowerCase();
    return '<button type="button" data-project-owner-choice="' + escapeHtml(option.id) + '"' + (active ? ' aria-pressed="true"' : '') + '><strong>' + escapeHtml(option.name) + '</strong>' + (option.detail ? '<span>' + escapeHtml(option.detail) + '</span>' : '') + '</button>';
  }).join('');
  return [
    '<div class="project-owner-control" data-project-owner-control>',
      '<div class="project-owner-current">',
        '<span>Owner</span>',
        '<strong>' + escapeHtml(ownerName) + '</strong>',
        '<small>' + escapeHtml(ownerDetail) + '</small>',
      '</div>',
      '<div class="project-owner-choices" aria-label="Change project owner">',
        choiceButtons || '<small>No relationship options loaded yet.</small>',
      '</div>',
      '<details class="project-owner-create">',
        '<summary>Create new relationship owner</summary>',
        '<form data-project-owner-create-form>',
          '<input type="text" name="name" placeholder="Name" autocomplete="off" required>',
          '<input type="email" name="email" placeholder="Email optional" autocomplete="off">',
          '<input type="text" name="detail" placeholder="Role or context optional" autocomplete="off">',
          '<button type="submit">Create and assign</button>',
        '</form>',
      '</details>',
      status ? '<p class="project-owner-status">' + escapeHtml(status) + '</p>' : '',
    '</div>'
  ].join('');
}

function renderProjectPeopleAndOwner(project = activeProjectProfile, relationships = []){
  const owner = projectOwnerAssignment(project, relationships);
  const relationshipList = relationships.length
    ? '<ul>' + projectManagerList(relationships) + '</ul>'
    : renderProjectRelationshipPicker();
  return renderProjectOwnerControl(project, owner) + relationshipList;
}

function projectPinProjectKey(project = activeProjectProfile){
  return project?.projectId || project?.id || project?.profileKey || project?.name || 'project';
}

function projectPinDefaultDatetime(){
  const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
  date.setSeconds(0, 0);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function projectPinStatus(project = activeProjectProfile){
  return projectPinStatusByProject[projectPinProjectKey(project)] || '';
}

function projectEditStatus(project = activeProjectProfile){
  return projectEditStatusByProject[projectPinProjectKey(project)] || '';
}

function projectPinPrompt(project = activeProjectProfile){
  const next = projectCleanText(project?.nextMove || project?.nextMoveEvidence || '', '');
  return next || 'Revisit ' + (project?.name || 'this project');
}

function projectEditDocumentText(project = activeProjectProfile){
  const details = normalizedProjectSourceDetails(project || {});
  if(typeof project?.documents === 'string') return project.documents;
  const documents = projectListFromValue(project?.documents || details.documents);
  return documents.join('\n');
}

function renderProjectEditForm(project = activeProjectProfile){
  if(!projectEditComposerOpen) return '';
  const summary = projectCleanText(project?.summary || project?.reality || '');
  return [
    '<form class="project-edit-form" data-project-edit-form>',
      '<label>',
        '<span>Project name</span>',
        '<input type="text" name="name" value="' + escapeHtml(project?.name || '') + '" autocomplete="off" required>',
      '</label>',
      '<label>',
        '<span>Project summary</span>',
        '<textarea name="summary" rows="3">' + escapeHtml(summary) + '</textarea>',
      '</label>',
      '<label>',
        '<span>Documents / source notes</span>',
        '<textarea name="documents" rows="3">' + escapeHtml(projectEditDocumentText(project)) + '</textarea>',
      '</label>',
      '<div>',
        '<button type="submit">Save changes</button>',
        '<button type="button" data-project-edit-cancel>Cancel</button>',
      '</div>',
    '</form>'
  ].join('');
}

function renderProjectPinControl(project = activeProjectProfile){
  const pinStatus = projectPinStatus(project);
  const editStatus = projectEditStatus(project);
  const form = projectPinComposerOpen ? [
    '<form class="project-pin-form" data-project-pin-form>',
      '<label>',
        '<span>When do you want me to unpin this for you?</span>',
        '<input type="datetime-local" name="pinUntil" value="' + escapeHtml(projectPinDefaultDatetime()) + '" required>',
      '</label>',
      '<label>',
        '<span>What should come back?</span>',
        '<input type="text" name="title" value="' + escapeHtml(projectPinPrompt(project)) + '" autocomplete="off" required>',
      '</label>',
      '<div>',
        '<button type="submit">Pin it</button>',
        '<button type="button" data-project-pin-cancel>Cancel</button>',
      '</div>',
    '</form>'
  ].join('') : '';
  return [
    '<div class="project-manager-hero-actions">',
      '<button type="button" data-project-edit-open>Edit project</button>',
      '<button type="button" data-project-cowork-scope="project_overview" aria-label="Co-Work with VAL on this project">Co-Work</button>',
      '<button type="button" data-project-pin-open>Put a pin in it</button>',
    '</div>',
    renderProjectEditForm(project),
    form,
    editStatus ? '<p class="project-edit-status">' + escapeHtml(editStatus) + '</p>' : '',
    pinStatus ? '<p class="project-pin-status">' + escapeHtml(pinStatus) + '</p>' : ''
  ].join('');
}

function projectSpecificText(value, project = {}, fallback = ''){
  const text = projectCleanText(value);
  const summary = projectCleanText(project.summary || project.reality || project.purpose);
  if(!text) return fallback;
  if(summary && text === summary) return fallback;
  return text;
}

function projectHasSpecificSignal(value, project = {}){
  return Boolean(projectSpecificText(value, project, ''));
}

function renderProjectManagerProfile(project = {}){
  if(!projectManagerProfile) return;
  const packet = projectManagerPacket(project);
  const identity = packet.project_identity_packet;
  const judgment = packet.project_manager_judgment_packet;
  const next = packet.project_next_action_packet;
  const sop = packet.project_sop_packet;
  const interview = packet.project_interview_packet;
  const needsOnboarding = projectNeedsOnboarding(project);
  const assignedProjectManager = packet.project_manager_assignment_packet || projectManagerAssignment(project);
  const relationships = packet.project_relationships_packet.map((item) => item.relationship_name);
  const relationshipSubtitle = relationships.map((name) => String(name || '').replace(/[.。]+$/g, '').trim()).filter(Boolean).join(', ');
  const details = normalizedProjectSourceDetails(project);
  const documents = projectListFromValue(project.documents || details.documents);
  const prepared = packet.project_prepared_work_packets.map((item) => item.title || item.what_val_prepared || item.summary || 'Prepared work waiting for review');
  const graph = Array.isArray(project.graphLinks) ? project.graphLinks.map(projectGraphLinkText) : [];
  const projectSummary = needsOnboarding
    ? projectCleanText(project.desiredOutcome || project.outcome, 'Project details are blank until onboarding is complete.')
    : projectCleanText(project.summary || project.reality || identity.purpose, 'This project is ready to be shaped.');
  const statusLabel = needsOnboarding ? 'Needs onboarding' : (/^intake$/i.test(identity.current_state) ? 'New project' : identity.current_state);
  const seasonLabel = needsOnboarding ? 'Blank until shaped' : (relationships.length ? 'Relationship attached' : 'Ready to shape');
  const nextMove = needsOnboarding ? PROJECT_ONBOARDING_FIRST_QUESTION : projectSpecificText(next.next_action, project, 'Define the first concrete outcome and next action.');
  const whyNext = needsOnboarding ? 'Answer this once, then VAL can turn the project into a clean manager packet.' : projectSpecificText(next.why_now, project, relationships.length ? 'Start by clarifying what this project should move for ' + relationships[0] + '.' : 'Start by giving VAL the outcome, owner, and next move.');
  const riskTitle = projectHasSpecificSignal(project.blocker || project.blockedBy || project.risk || project.riskSummary, project) ? judgment.what_is_blocked : '';
  const riskBody = projectHasSpecificSignal(project.risk || project.riskSummary, project) ? judgment.what_is_at_risk : '';
  const detailCards = [
    projectManagerDetailCard('people_involved', 'People involved', renderProjectPeopleAndOwner(project, relationships)),
    prepared.length ? projectManagerDetailCard('prepared_work', 'Prepared work', '<ul>' + projectManagerList(prepared) + '</ul>') : '',
    documents.concat(graph).length ? projectManagerDetailCard('documents_sources', 'Documents / sources', '<ul>' + projectManagerList(documents.concat(graph)) + '</ul>') : '',
    riskTitle || riskBody ? projectManagerDetailCard('risk_blocker', 'Risk / blocker', '<strong>' + escapeHtml(riskTitle || 'Possible blocker') + '</strong><p>' + escapeHtml(riskBody || 'Review before moving forward.') + '</p>') : ''
  ].filter(Boolean);
  if(projectTitle) projectTitle.textContent = identity.canonical_name || 'Project Managers';
  if(projectSubtitle) projectSubtitle.textContent = relationshipSubtitle
    ? 'Project manager view with ' + relationshipSubtitle + ' attached.'
    : 'Project manager view. Add the people, outcome, and first next move VAL should coordinate.';
  projectManagerProfile.innerHTML = [
    '<section class="project-manager-hero" data-project-manager-family="' + escapeHtml(assignedProjectManager.family || 'white') + '" style="' + escapeHtml(projectManagerColorStyle(assignedProjectManager)) + '">',
      '<div class="project-mark" aria-hidden="true">' + escapeHtml(project.initials || initialsFromName(identity.canonical_name)) + '</div>',
      '<div>',
        '<div class="project-manager-identity-line">',
          '<p class="project-manager-eyebrow">Project Manager</p>',
          '<span class="project-manager-assignee"><i aria-hidden="true"></i>Project manager: ' + escapeHtml(assignedProjectManager.name) + '</span>',
        '</div>',
        '<h4>' + escapeHtml(identity.canonical_name) + '</h4>',
        '<p>' + escapeHtml(projectSummary) + '</p>',
        '<div class="project-manager-tags">',
          '<span>' + escapeHtml(statusLabel) + '</span>',
          '<span>' + escapeHtml(seasonLabel) + '</span>',
          '<span>' + escapeHtml(sop.sop_name) + '</span>',
          relationships.slice(0, 2).map((name) => '<span>' + escapeHtml(name) + '</span>').join(''),
        '</div>',
        renderProjectPinControl(project),
      '</div>',
    '</section>',
    needsOnboarding ? renderProjectOnboardingPanel(project, interview) : '',
    renderProjectRoundTableOverview(packet, needsOnboarding),
    '<section class="project-manager-operating-system" aria-label="Project operating system">',
      '<article class="project-manager-clickable project-manager-os-card" tabindex="0" role="button" data-project-cowork-field="sop_fit">',
        '<span>Operating System</span>',
        '<strong>' + escapeHtml(sop.sop_name) + '</strong>',
        '<p>' + escapeHtml(sop.when_to_use) + '</p>',
        projectCoworkChip(),
      '</article>',
      '<article class="project-manager-clickable project-manager-os-card" tabindex="0" role="button" data-project-cowork-field="project_phase">',
        '<span>Current Phase</span>',
        '<strong>' + escapeHtml(sop.current_phase) + '</strong>',
        '<p>' + escapeHtml((sop.default_phases || []).slice(0, 4).join(' -> ')) + '</p>',
        projectCoworkChip(),
      '</article>',
      '<article class="project-manager-clickable project-manager-os-card" tabindex="0" role="button" data-project-cowork-field="project_interview">',
        '<span>Project Interview</span>',
        '<strong>' + escapeHtml(interview.missing_fields.length ? 'Needs ' + interview.missing_fields.join(', ').replace(/_/g, ' ') : 'Ready to manage') + '</strong>',
        '<p>' + escapeHtml(interview.current_question) + '</p>',
        projectCoworkChip(),
      '</article>',
    '</section>',
    '<section class="project-manager-judgment" aria-label="Project Manager judgment">',
      projectManagerCard('What this is', identity.canonical_name, projectSummary),
      needsOnboarding
        ? projectManagerCard('Why it matters', 'Needs executive outcome', 'Blank until onboarding answers define the stakes.')
        : projectManagerCard('Why it matters', relationships.length ? 'Relationship-connected work' : 'Needs shape before action', relationships.length ? 'This project is now connected to ' + relationships.join(', ') + ', so future notes, meetings, and drafts can stay organized around the right people.' : 'VAL has the project shell, but needs the outcome, owner, and first move before it can manage the work usefully.'),
      projectManagerCard('Next move', nextMove, whyNext, next.due_at ? 'Due: ' + next.due_at : ''),
    '</section>',
    '<section class="project-manager-sop-grid" aria-label="SOP workstreams and monitoring">',
      projectManagerDetailCard('workstreams', 'Workstreams', '<ul>' + projectManagerList(sop.default_workstreams, 'VAL needs the workstreams for this project.') + '</ul>'),
      projectManagerDetailCard('milestones', 'Milestones', '<ul>' + projectManagerList(sop.standard_milestones, 'VAL needs the milestones for this project.') + '</ul>'),
      projectManagerDetailCard('monitoring_rules', 'Monitoring after launch', '<ul>' + projectManagerList(sop.monitoring_rules, 'VAL needs to know what to monitor after launch.') + '</ul>'),
      projectManagerDetailCard('relationship_nurture', 'Relationship nurture', '<ul>' + projectManagerList(sop.relationship_nurture_rules, 'VAL needs to know how to protect the partnership.') + '</ul>'),
    '</section>',
    detailCards.length ? '<section class="project-manager-columns" aria-label="Project details">' + detailCards.join('') + '</section>' : '',
    '<section class="project-manager-story" aria-label="Project story">',
      '<div class="project-manager-clickable" tabindex="0" role="button" data-project-cowork-field="working_narrative"><span>Working narrative</span><p>' + escapeHtml(projectCleanText(project.livingNarrative || project.reality || judgment.current_reality || projectSummary, projectSummary)) + '</p>' + projectCoworkChip() + '</div>',
      '<div class="project-manager-clickable" tabindex="0" role="button" data-project-cowork-field="what_val_needs_next"><span>What VAL needs next</span><p>' + escapeHtml(interview.current_question) + '</p>' + projectCoworkChip() + '</div>',
    '</section>'
  ].join('');
}

function renderProjectManagerEmptyState(){
  activeProjectProfile = null;
  if(projectTitle) projectTitle.textContent = 'Project Managers';
  if(projectSubtitle) projectSubtitle.textContent = 'Project Managers will appear here when there is enough connected work to manage clearly.';
  if(!projectManagerProfile) return;
  projectManagerProfile.innerHTML = [
    '<section class="project-manager-hero project-manager-empty">',
      '<div>',
        '<p class="project-manager-eyebrow">Project Managers</p>',
        '<h4>No active projects yet.</h4>',
        '<p>Once there is a project ready to manage, it will appear here.</p>',
      '</div>',
    '</section>'
  ].join('');
}

function projectCoworkSpec(field = ''){
  const projectName = activeProjectProfile?.name || 'this project';
  const interviewStage = projectInterviewStage(activeProjectProfile || {});
  const interviewContract = projectInterviewStageContract(interviewStage);
  const specs = {
    project_overview: {
      title: 'Co-Work on this project',
      question: 'What should VAL help you think through for ' + projectName + '?',
      detail: 'This stays scoped to the selected project, its source receipts, and the current Project Manager packet.',
      placeholder: 'Help me think through the next move, risk, owner, draft, or decision for this project.'
    },
    what_this_is: {
      title: 'Shape what this project is',
      question: 'What is ' + projectName + ', who is it for, and what outcome should it create?',
      detail: 'Include the audience, the promise, and the result this project is meant to produce.',
      placeholder: 'Example: This project helps... by... so that...'
    },
    why_it_matters: {
      title: 'Clarify why this matters',
      question: 'What consequence, opportunity, relationship, or business reason makes this project worth attention?',
      detail: 'Tell VAL what changes if this succeeds, who it affects, and why it matters now.',
      placeholder: 'This matters because... It affects... The reason now is...'
    },
    next_move: {
      title: 'Define the next move',
      question: 'What is the next concrete move, who owns it, and when should it happen?',
      detail: 'Give VAL one action it can manage, not a broad plan.',
      placeholder: 'Next move: ... Owner: ... Timing: ...'
    },
    people_involved: {
      title: 'Add people to this project',
      question: 'Who belongs in this project, and what role does each person play?',
      detail: 'Choose an existing relationship, or type the person, company, role, and what VAL should remember.',
      placeholder: 'Name: ... Role in this project: ... Important context: ...'
    },
    prepared_work: {
      title: 'Clarify prepared work',
      question: 'What should VAL prepare, draft, schedule, organize, or watch for this project?',
      detail: 'Name the artifact or action, the source it should use, and what approval would be needed.',
      placeholder: 'VAL should prepare... using... Approval needed before...'
    },
    documents_sources: {
      title: 'Add documents or sources',
      question: 'What document, link, source, or note belongs to this project?',
      detail: 'Tell VAL what it is, why it matters, and how it should be used.',
      placeholder: 'Source: ... Why it matters: ... Use it for...'
    },
    risk_blocker: {
      title: 'Name the risk or blocker',
      question: 'What could block this project, and what would reduce the risk?',
      detail: 'Name the blocker, what it threatens, and the smallest protective move.',
      placeholder: 'Risk: ... It affects... Protective move: ...'
    },
    working_narrative: {
      title: 'Improve the working narrative',
      question: 'What should the project manager narrative say right now?',
      detail: 'Give VAL rough notes. It will rewrite them into a clear current-state narrative.',
      placeholder: 'Rough notes for the project narrative...'
    },
    what_val_needs_next: {
      title: 'Tell VAL what it needs next',
      question: 'What does VAL need next to manage this project well?',
      detail: 'Name the missing context, question, decision, source, or person VAL should pursue.',
      placeholder: 'VAL needs... The question to ask is... The missing source is...'
    },
    sop_fit: {
      title: 'Choose or adjust the SOP',
      question: 'Which SOP should this project use, and what is different about this project?',
      detail: 'Name the closest operating pattern and any important deviation VAL should not assume.',
      placeholder: 'Use the ... SOP. This project is different because...'
    },
    project_phase: {
      title: 'Set the project phase',
      question: 'What phase is this project in right now, and what proves it?',
      detail: 'Name the phase, what has already happened, and what must happen before the next phase.',
      placeholder: 'Current phase: ... Already complete: ... Next phase starts when...'
    },
    project_interview: {
      title: 'Interview the project manager',
      question: interviewContract.question,
      detail: interviewContract.detail,
      placeholder: interviewContract.placeholder
    },
    workstreams: {
      title: 'Define workstreams',
      question: 'What are the main lanes of work this project manager needs to own?',
      detail: 'List the lanes of work, not every tiny task.',
      placeholder: 'Workstreams: dashboard, automations, API connections, metrics, partner nurture...'
    },
    milestones: {
      title: 'Define milestones',
      question: 'What milestones prove this project is moving?',
      detail: 'Name the concrete checkpoints VAL should track.',
      placeholder: 'Milestone 1: ... Milestone 2: ... Launch is complete when...'
    },
    monitoring_rules: {
      title: 'Define monitoring rules',
      question: 'After launch, what should VAL keep watching for this project?',
      detail: 'Name metrics, signals, relationship changes, automation failures, or timing patterns.',
      placeholder: 'VAL should monitor... Alert me when... Review monthly for...'
    },
    relationship_nurture: {
      title: 'Define relationship nurture',
      question: 'How should VAL help protect and grow the relationships connected to this project?',
      detail: 'Name cadence, useful touches, trust risks, and what kind of outreach feels right.',
      placeholder: 'For this relationship, VAL should... Avoid... Check in when...'
    }
  };
  return specs[field] || {
    title: 'Update project context',
    question: 'What should VAL understand about this one part of ' + projectName + '?',
    placeholder: 'Tell VAL what should change here.'
  };
}

async function openProjectScopedCowork(field = 'project_overview', node = null, options = {}){
  if(!activeProjectProfile) return;
  const project = activeProjectProfile;
  const spec = projectCoworkSpec(field);
  const scopedPacket = projectScopedCoworkPacket(field, project);
  const action = 'project:cowork:' + field;
  const baseSource = projectSource(project, action);
  const source = {
    ...baseSource,
    sourceItem:{
      ...(baseSource.sourceItem || {}),
      scopedCoworkPacket:scopedPacket
    }
  };
  activeProjectCoworkTarget = {
    field,
    mode: options.mode || (field === 'project_overview' ? 'project_cowork' : 'field_update'),
    projectId:project.id || project.projectId || '',
    title:spec.title,
    scopedPacket
  };
  openContextualCoworkSession({
    returnTarget:'project',
    title:spec.title,
    meaning:spec.question,
    context:projectScopedCoworkContextLines(scopedPacket),
    recommendation:field === 'project_overview'
      ? 'Use this to think, draft, compare, or decide within this project only. Anything external still needs its own approval surface.'
      : 'Answer only for this one section. VAL will rewrite it as clear project-manager language and update the card.',
    placeholder:spec.placeholder,
    heading:spec.question,
    detail:spec.detail || 'VAL will rewrite this into clear project-manager language.',
    publicDetail:'Scoped to Project Managers: ' + projectCoworkScopeLabel(field) + '.',
    lockContext:true
  });
  void ensureHearthClickPacket({node, packetName:'project_packet', action, allowBlockedForInspection:true, source}).then((preflight) => {
    if(preflight.ok) renderDrawerPacketReceiptStrip(preflight.packet || lastHearthPacketReceipt);
  }).catch(() => {});
}

function openProjectFieldCowork(field = '', node = null){
  return openProjectScopedCowork(field, node, {mode:'field_update'});
}

function projectManagerRewrite(text = '', field = ''){
  const clean = projectCleanText(text);
  if(!clean) return '';
  const sentence = clean.replace(/\s+/g, ' ').replace(/^[\-•\s]+/, '').trim();
  if(field === 'next_move' && !/^(Define|Decide|Create|Send|Schedule|Review|Prepare|Ask|Choose|Map|Draft|Confirm|Source|Attach|Build)\b/i.test(sentence)){
    return 'Next move: ' + sentence.charAt(0).toLowerCase() + sentence.slice(1);
  }
  if(field === 'risk_blocker' && !/^Risk/i.test(sentence)){
    return 'Risk: ' + sentence.charAt(0).toLowerCase() + sentence.slice(1);
  }
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}

function inferProjectInterviewOwner(text = ''){
  const clean = projectCleanText(text);
  if(/\b(i own|i am the owner|i'm the owner|owned by me|my project)\b/i.test(clean)){
    return {
      type:'executive',
      id:'jessa',
      name:'Jessa',
      detail:'Executive owner',
      source:'project_interview',
      reassignmentOptions:['choose_existing_relationship','create_new_relationship']
    };
  }
  const ownerMatch = clean.match(/\bowner(?:\s+is|:)?\s+([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){0,2})/);
  if(ownerMatch?.[1]){
    return {
      type:'relationship',
      id:ownerMatch[1],
      name:ownerMatch[1],
      source:'project_interview',
      reassignmentOptions:['choose_existing_relationship','create_new_relationship']
    };
  }
  return null;
}

function inferProjectInterviewNextMove(text = ''){
  const clean = projectCleanText(text);
  const match = clean.match(/\bnext (?:step|move)\s+(?:is|should be)\s+(?:to\s+)?([^.!?]+)/i);
  const move = projectCleanText(match?.[1] || '');
  if(!move) return '';
  return move.charAt(0).toUpperCase() + move.slice(1) + '.';
}

function inferProjectMonitoringRules(text = ''){
  const clean = projectCleanText(text);
  const rules = [];
  if(/\bcrm\b/i.test(clean)) rules.push('CRM setup');
  if(/\bpayment|processing\b/i.test(clean)) rules.push('Payment processing');
  if(/\bpipeline/i.test(clean)) rules.push('Pipeline setup');
  if(/\bcontact forms?\b/i.test(clean)) rules.push('Contact forms');
  if(/\bcontribute your voice\b/i.test(clean)) rules.push('Contribute Your Voice process');
  if(/\bwebsite|developer/i.test(clean)) rules.push('Website implementation handoff');
  return rules.length ? Array.from(new Set(rules)) : [projectCompactText(clean, 160)].filter(Boolean);
}

function projectInterviewLooksLikeOwnerMonitoringAnswer(text = ''){
  return /\b(i own|i am the owner|i'm the owner|owner|next step|next move|monitor|crm|payment|pipeline|contact forms?)\b/i.test(projectCleanText(text));
}

function normalizeProjectInterviewCarryover(project = {}){
  const onboarding = projectOnboardingData(project);
  const status = String(onboarding.status || '').toLowerCase();
  const ownerMonitoringCandidate = [
    onboarding.ownerMonitoringAnswer,
    project.ownerMonitoringNotes,
    projectMetadataObject(project).ownerMonitoringNotes,
    project.whatValNowKnows,
    projectMetadataObject(project).whatValNowKnows,
    project.reality,
    project.summary,
    status === 'answered_first_question' && projectInterviewLooksLikeOwnerMonitoringAnswer(onboarding.firstAnswer) ? onboarding.firstAnswer : ''
  ].find((value) => projectInterviewLooksLikeOwnerMonitoringAnswer(value));
  const answer = projectCleanText(ownerMonitoringCandidate);
  if(!answer) return project;
  const metadata = projectMetadataObject(project);
  const owner = project.owner || metadata.owner || inferProjectInterviewOwner(answer);
  const nextMove = project.nextMove || metadata.nextMove || inferProjectInterviewNextMove(answer);
  const monitoringRules = Array.isArray(project.monitoringRules) && project.monitoringRules.length ? project.monitoringRules : (Array.isArray(metadata.monitoringRules) && metadata.monitoringRules.length ? metadata.monitoringRules : inferProjectMonitoringRules(answer));
  project.needsProjectOnboarding = false;
  project.ownerMonitoringNotes = project.ownerMonitoringNotes || metadata.ownerMonitoringNotes || answer;
  if(owner) project.owner = owner;
  if(owner?.name) project.nextStepOwner = project.nextStepOwner || metadata.nextStepOwner || owner.name;
  if(nextMove) project.nextMove = nextMove;
  project.monitoringRules = monitoringRules;
  project.metadataJson = {
    ...metadata,
    owner:owner || null,
    nextMove:project.nextMove || '',
    nextStepOwner:project.nextStepOwner || '',
    ownerMonitoringNotes:project.ownerMonitoringNotes,
    monitoringRules,
    needsProjectOnboarding:false,
    projectOnboarding:{
      ...onboarding,
      status:'owner_monitoring_answered',
      ownerMonitoringAnswer:answer
    },
    noExternalAction:true
  };
  return project;
}

function appendProjectRelationshipNames(names = []){
  if(!activeProjectProfile) return;
  const existing = projectResolvedRelationships(activeProjectProfile).map((name) => projectCleanText(name));
  const merged = existing.slice();
  names.map(projectCleanText).filter(Boolean).forEach((name) => {
    if(!merged.some((item) => item.toLowerCase() === name.toLowerCase())) merged.push(name);
  });
  activeProjectProfile.relationships = merged;
  activeProjectProfile.sourceDetails = {...(activeProjectProfile.sourceDetails || {}), relationships:merged.join(', ')};
}

function applyProjectFieldUpdate(field = '', rawText = ''){
  if(!activeProjectProfile) return '';
  const rewritten = projectManagerRewrite(rawText, field);
  if(!rewritten) return '';
  if(field === 'what_this_is'){
    activeProjectProfile.summary = rewritten;
    activeProjectProfile.reality = rewritten;
  } else if(field === 'why_it_matters'){
    activeProjectProfile.whyItMatters = rewritten;
    activeProjectProfile.decisionEvidence = rewritten;
  } else if(field === 'next_move' || field === 'what_val_needs_next'){
    activeProjectProfile.nextMove = rewritten;
    activeProjectProfile.nextMoveEvidence = rewritten;
  } else if(field === 'people_involved'){
    appendProjectRelationshipNames(projectListFromValue(rewritten));
  } else if(field === 'prepared_work'){
    activeProjectProfile.preparedWork = (Array.isArray(activeProjectProfile.preparedWork) ? activeProjectProfile.preparedWork : []).concat({title:rewritten, summary:rewritten});
  } else if(field === 'documents_sources'){
    const current = projectCleanText(activeProjectProfile.documents || activeProjectProfile.sourceDetails?.documents);
    activeProjectProfile.documents = [current, rewritten].filter(Boolean).join('; ');
    activeProjectProfile.sourceDetails = {...(activeProjectProfile.sourceDetails || {}), documents:activeProjectProfile.documents};
  } else if(field === 'risk_blocker'){
    activeProjectProfile.risk = rewritten;
    activeProjectProfile.blocker = rewritten;
  } else if(field === 'working_narrative'){
    activeProjectProfile.livingNarrative = rewritten;
    activeProjectProfile.reality = rewritten;
  } else if(field === 'sop_fit'){
    const lower = rewritten.toLowerCase();
    const match = Object.values(projectSopLibrary).find((sop) => lower.includes(sop.name.toLowerCase()) || lower.includes(sop.id.replace(/_/g, ' ')));
    activeProjectProfile.sopId = match ? match.id : activeProjectProfile.sopId || 'new_sop';
    activeProjectProfile.sopDeviations = [rewritten];
  } else if(field === 'project_phase'){
    activeProjectProfile.projectPhase = rewritten;
  } else if(field === 'project_interview'){
    const stage = projectInterviewStage(activeProjectProfile);
    const metadata = projectMetadataObject(activeProjectProfile);
    const onboarding = projectOnboardingData(activeProjectProfile);
    activeProjectProfile.projectInterviewNotes = [activeProjectProfile.projectInterviewNotes, rewritten].filter(Boolean).join('\n');
    activeProjectProfile.whatValNowKnows = rewritten;
    activeProjectProfile.metadataJson = {
      ...metadata,
      needsProjectOnboarding:false,
      projectOnboarding:{
        ...onboarding,
        firstQuestion:PROJECT_ONBOARDING_FIRST_QUESTION,
        updatedAt:new Date().toISOString()
      },
      noExternalAction:true
    };
    if(stage === 'first_question'){
      activeProjectProfile.desiredOutcome = activeProjectProfile.desiredOutcome || rewritten;
      activeProjectProfile.summary = activeProjectProfile.summary || rewritten;
      activeProjectProfile.reality = activeProjectProfile.reality || rewritten;
      activeProjectProfile.needsProjectOnboarding = false;
      activeProjectProfile.metadataJson.projectOnboarding = {
        ...activeProjectProfile.metadataJson.projectOnboarding,
        status:'answered_first_question',
        firstAnswer:onboarding.firstAnswer || rewritten,
        answeredAt:onboarding.answeredAt || new Date().toISOString()
      };
    }else if(stage === 'owner_monitoring'){
      const owner = inferProjectInterviewOwner(rewritten);
      const nextMove = inferProjectInterviewNextMove(rewritten);
      const monitoringRules = inferProjectMonitoringRules(rewritten);
      activeProjectProfile.ownerMonitoringNotes = rewritten;
      if(owner){
        activeProjectProfile.owner = owner;
        activeProjectProfile.nextStepOwner = owner.name;
      }
      if(nextMove){
        activeProjectProfile.nextMove = nextMove;
        activeProjectProfile.nextMoveEvidence = rewritten;
      }
      activeProjectProfile.monitoringRules = monitoringRules;
      activeProjectProfile.metadataJson = {
        ...activeProjectProfile.metadataJson,
        owner:owner || activeProjectProfile.owner || metadata.owner || null,
        nextMove:activeProjectProfile.nextMove || metadata.nextMove || '',
        nextStepOwner:activeProjectProfile.nextStepOwner || metadata.nextStepOwner || '',
        ownerMonitoringNotes:rewritten,
        monitoringRules,
        projectOnboarding:{
          ...activeProjectProfile.metadataJson.projectOnboarding,
          status:'owner_monitoring_answered',
          ownerMonitoringAnswer:rewritten,
          ownerMonitoringAnsweredAt:new Date().toISOString()
        }
      };
    }else if(stage === 'workstreams'){
      activeProjectProfile.workstreams = projectListFromValue(rewritten);
      activeProjectProfile.metadataJson = {
        ...activeProjectProfile.metadataJson,
        workstreams:activeProjectProfile.workstreams,
        projectOnboarding:{
          ...activeProjectProfile.metadataJson.projectOnboarding,
          status:'workstreams_answered',
          workstreamsAnswer:rewritten,
          workstreamsAnsweredAt:new Date().toISOString()
        }
      };
    }else if(stage === 'milestones'){
      activeProjectProfile.milestones = projectListFromValue(rewritten);
      activeProjectProfile.projectPhase = activeProjectProfile.projectPhase || 'Milestones defined';
      activeProjectProfile.metadataJson = {
        ...activeProjectProfile.metadataJson,
        milestones:activeProjectProfile.milestones,
        projectPhase:activeProjectProfile.projectPhase,
        projectOnboarding:{
          ...activeProjectProfile.metadataJson.projectOnboarding,
          status:'milestones_answered',
          milestonesAnswer:rewritten,
          milestonesAnsweredAt:new Date().toISOString()
        }
      };
    }else if(stage === 'relationship_nurture'){
      activeProjectProfile.relationshipNurtureRules = projectListFromValue(rewritten);
      activeProjectProfile.metadataJson = {
        ...activeProjectProfile.metadataJson,
        relationshipNurtureRules:activeProjectProfile.relationshipNurtureRules,
        projectOnboarding:{
          ...activeProjectProfile.metadataJson.projectOnboarding,
          status:'relationship_nurture_answered',
          relationshipNurtureAnswer:rewritten,
          relationshipNurtureAnsweredAt:new Date().toISOString()
        }
      };
    }else if(stage === 'prepared_work'){
      activeProjectProfile.preparedWork = (Array.isArray(activeProjectProfile.preparedWork) ? activeProjectProfile.preparedWork : []).concat({title:rewritten, summary:rewritten});
      activeProjectProfile.nextMove = activeProjectProfile.nextMove || rewritten;
      activeProjectProfile.metadataJson = {
        ...activeProjectProfile.metadataJson,
        preparedWork:activeProjectProfile.preparedWork,
        nextMove:activeProjectProfile.nextMove,
        projectOnboarding:{
          ...activeProjectProfile.metadataJson.projectOnboarding,
          status:'prepared_work_answered',
          preparedWorkAnswer:rewritten,
          preparedWorkAnsweredAt:new Date().toISOString()
        }
      };
    }
  } else if(field === 'workstreams'){
    activeProjectProfile.workstreams = projectListFromValue(rewritten);
  } else if(field === 'milestones'){
    activeProjectProfile.milestones = projectListFromValue(rewritten);
  } else if(field === 'monitoring_rules'){
    activeProjectProfile.monitoringRules = projectListFromValue(rewritten);
  } else if(field === 'relationship_nurture'){
    activeProjectProfile.relationshipNurtureRules = projectListFromValue(rewritten);
  }
  renderProjectManagerProfile(activeProjectProfile);
  renderProjectRolodex();
  return rewritten;
}

async function persistProjectCoworkFieldUpdate(field = '', rewritten = ''){
  if(!canUseApi || !activeProjectProfile || !rewritten) return null;
  const details = normalizedProjectSourceDetails(activeProjectProfile);
  const payload = {
    projectId:activeProjectProfile.projectId || activeProjectProfile.id || activeProjectProfile.profileKey || activeProjectProfile.name || '',
    projectProfileId:activeProjectProfile.id || '',
    profileKey:activeProjectProfile.profileKey || '',
    name:activeProjectProfile.name || 'Project',
    summary:activeProjectProfile.summary || activeProjectProfile.reality || '',
    documents:projectCleanText(activeProjectProfile.documents || details.documents),
    relationships:projectCleanText(details.relationships || projectResolvedRelationships(activeProjectProfile).join(', ')),
    rawContext:[
      details.rawContext,
      'Project Co-Work update (' + projectCoworkScopeLabel(field) + '): ' + rewritten
    ].filter(Boolean).join('\n'),
    status:activeProjectProfile.status || '',
    desiredOutcome:activeProjectProfile.desiredOutcome || activeProjectProfile.outcome || '',
    nextMove:activeProjectProfile.nextMove || '',
    nextStepOwner:projectPersonName(activeProjectProfile.nextStepOwner || activeProjectProfile.owner || ''),
    projectPhase:activeProjectProfile.projectPhase || '',
    projectInterviewNotes:activeProjectProfile.projectInterviewNotes || '',
    whatValNowKnows:activeProjectProfile.whatValNowKnows || '',
    ownerMonitoringNotes:activeProjectProfile.ownerMonitoringNotes || '',
    monitoringRules:Array.isArray(activeProjectProfile.monitoringRules) ? activeProjectProfile.monitoringRules.join('\n') : (activeProjectProfile.monitoringRules || ''),
    workstreams:Array.isArray(activeProjectProfile.workstreams) ? activeProjectProfile.workstreams.join('\n') : (activeProjectProfile.workstreams || ''),
    milestones:Array.isArray(activeProjectProfile.milestones) ? activeProjectProfile.milestones.join('\n') : (activeProjectProfile.milestones || ''),
    relationshipNurtureRules:Array.isArray(activeProjectProfile.relationshipNurtureRules) ? activeProjectProfile.relationshipNurtureRules.join('\n') : (activeProjectProfile.relationshipNurtureRules || ''),
    preparedWork:Array.isArray(activeProjectProfile.preparedWork) ? activeProjectProfile.preparedWork.map((item) => item.title || item.summary || item).join('\n') : (activeProjectProfile.preparedWork || ''),
    needsProjectOnboarding:String(activeProjectProfile.needsProjectOnboarding === true),
    projectOnboardingStatus:projectMetadataObject(activeProjectProfile).projectOnboarding?.status || '',
    projectOnboardingFirstQuestion:PROJECT_ONBOARDING_FIRST_QUESTION,
    projectOnboardingFirstAnswer:projectMetadataObject(activeProjectProfile).projectOnboarding?.firstAnswer || '',
    projectOnboardingOwnerMonitoringAnswer:projectMetadataObject(activeProjectProfile).projectOnboarding?.ownerMonitoringAnswer || '',
    noExternalAction:true
  };
  try{
    const result = await postJson('/api/projects/update', payload);
    if(result?.project){
      const incoming = result.dossier ? projectProfileFromDossier(result.dossier, activeProjectProfile) : projectProfileFromIndexItem(result.project);
      applyProjectEditLocally(activeProjectProfile, payload, incoming);
    }
    projectIndexSourceLabel = 'Project section saved locally. No external action happened.';
    updateProjectIndexSourceLabel();
    renderProjectRolodex();
    return result;
  }catch(error){
    projectIndexSourceLabel = 'Project section updated in this view, but local save failed: ' + error.message;
    updateProjectIndexSourceLabel();
    return null;
  }
}

function projectFollowupQuestion(field = ''){
  if(field === 'project_interview') return projectInterviewNextQuestion(activeProjectProfile);
  const questions = {
    what_this_is:'What outcome should this project create when it is working?',
    why_it_matters:'Who benefits most if this succeeds?',
    next_move:'Who owns this next move, and when should it happen?',
    people_involved:'What role does each person play?',
    prepared_work:'Should VAL draft, organize, schedule, or simply watch this?',
    documents_sources:'Should this source change the project plan or just stay attached?',
    risk_blocker:'What would make this risk smaller this week?',
    working_narrative:'What changed most recently that should shape this story?',
    what_val_needs_next:'What should VAL ask you next if it gets stuck?'
  };
  return questions[field] || 'What else would make this more useful?';
}

function projectCoworkSavedMessage(rewritten = '', field = ''){
  const nextQuestion = projectFollowupQuestion(field);
  if(field !== 'project_interview'){
    return 'Updated this section: ' + rewritten + '\n\n' + nextQuestion;
  }
  const status = String(projectOnboardingData(activeProjectProfile).status || '').toLowerCase();
  if(status === 'answered_first_question'){
    return 'Saved the project name and outcome. I will keep that as the starting shape for this Project Manager.\n\n' + nextQuestion;
  }
  if(status === 'owner_monitoring_answered'){
    return 'Saved the owner, next step, and monitoring context. I updated this Project Manager so it knows what to watch next.\n\n' + nextQuestion;
  }
  if(status === 'workstreams_answered' || status === 'lanes_answered'){
    return 'Saved the workstreams for this Project Manager.\n\n' + nextQuestion;
  }
  if(status === 'milestones_answered'){
    return 'Saved the milestones for this Project Manager.\n\n' + nextQuestion;
  }
  if(status === 'relationship_nurture_answered'){
    return 'Saved the relationship nurture rules for this Project Manager.\n\n' + nextQuestion;
  }
  if(status === 'prepared_work_answered'){
    return 'Saved the prepared-work direction for this Project Manager.\n\n' + nextQuestion;
  }
  return 'Saved that into the project interview.\n\n' + nextQuestion;
}

function renderProjectCoworkUpdatedResponse(rewritten = '', field = ''){
  if(!rewritten) return;
  appendHomeCoworkMessage('user', rewritten);
  appendHomeCoworkMessage('val', projectCoworkSavedMessage(rewritten, field));
}

function setProjectOwnerStatus(project = activeProjectProfile, message = ''){
  const key = projectOwnerProjectKey(project);
  if(message) projectOwnerStatusByProject[key] = message;
  else delete projectOwnerStatusByProject[key];
}

function applyProjectOwner(option = {}, source = 'user_reassigned'){
  if(!activeProjectProfile || !option.name) return null;
  const owner = {
    type:'relationship',
    id:option.id || option.contactId || option.email || option.name,
    name:option.name,
    email:option.email || '',
    detail:option.detail || '',
    source,
    reassignmentOptions:['choose_existing_relationship','create_new_relationship']
  };
  activeProjectProfile.owner = owner;
  activeProjectProfile.nextStepOwner = owner.name;
  activeProjectProfile.metadataJson = {
    ...projectMetadataObject(activeProjectProfile),
    owner,
    ownerReassignedAt:new Date().toISOString(),
    noExternalAction:true
  };
  appendProjectRelationshipNames([owner.name]);
  return owner;
}

async function persistProjectOwnerAssignment(option = {}, owner = {}){
  if(!canUseApi || !activeProjectProfile) return null;
  return postJson('/api/projects/link-relationship', {
    projectId:activeProjectProfile.projectId || activeProjectProfile.id || activeProjectProfile.profileKey || activeProjectProfile.name,
    projectName:activeProjectProfile.name || '',
    relationshipId:option.id || owner.id || option.name,
    relationshipName:option.name || owner.name,
    contactId:option.contactId || '',
    email:option.email || owner.email || '',
    summary:(option.name || owner.name) + ' is the assigned owner for ' + (activeProjectProfile.name || 'this project') + '.',
    assignAsOwner:true,
    noExternalAction:true
  });
}

async function assignProjectOwnerFromOption(option = {}, node = null){
  if(!activeProjectProfile || !option?.name) return;
  const previous = activeProjectProfile.owner || null;
  const owner = applyProjectOwner(option);
  setProjectOwnerStatus(activeProjectProfile, 'Owner changed to ' + owner.name + '. Saving local receipt...');
  renderProjectManagerProfile(activeProjectProfile);
  renderProjectRolodex();
  const selectedSource = projectSource(activeProjectProfile, 'project:reassign_owner');
  const preflight = await ensureHearthClickPacket({node, packetName:'project_packet', action:'project:reassign_owner', allowBlockedForInspection:true, source:selectedSource});
  if(!preflight.ok){
    activeProjectProfile.owner = previous;
    activeProjectProfile.nextStepOwner = projectPersonName(previous);
    setProjectOwnerStatus(activeProjectProfile, 'Owner change stayed pending because the project packet was blocked.');
    renderProjectManagerProfile(activeProjectProfile);
    return;
  }
  renderDrawerPacketReceiptStrip(preflight.packet || lastHearthPacketReceipt);
  try{
    const result = await persistProjectOwnerAssignment(option, owner);
    if(result?.projectOwner) activeProjectProfile.owner = result.projectOwner;
    setProjectOwnerStatus(activeProjectProfile, canUseApi ? 'Owner saved locally. No CRM, message, task, calendar, or external action happened.' : 'Owner changed in this local view. The local server is needed to save the receipt.');
  }catch(error){
    setProjectOwnerStatus(activeProjectProfile, 'Owner changed in this view, but the local receipt was not saved: ' + error.message);
  }
  renderProjectManagerProfile(activeProjectProfile);
  renderProjectRolodex();
}

async function assignProjectOwnerById(ownerId = '', node = null){
  const option = projectRelationshipOptionById(ownerId);
  if(!option){
    setProjectOwnerStatus(activeProjectProfile, 'That relationship option is no longer available.');
    renderProjectManagerProfile(activeProjectProfile);
    return;
  }
  await assignProjectOwnerFromOption(option, node);
}

function rememberProjectOwnerRelationship(profile = {}){
  const normalized = relationshipProfileFromIndexItem(profile);
  const id = normalized.query?.targetId || normalized.id || normalized.profileKey || normalized.name;
  if(id) relationshipIndexProfiles[id] = relationshipProfileWithPersonPacket(normalized);
  return projectRelationshipOptionFromProfile(relationshipIndexProfiles[id] || normalized);
}

async function createProjectOwnerRelationshipFromForm(event){
  event.preventDefault();
  event.stopPropagation();
  if(!activeProjectProfile) return;
  const form = event.target;
  const data = new FormData(form);
  const name = projectCleanText(data.get('name'));
  const email = projectCleanText(data.get('email'));
  const detail = projectCleanText(data.get('detail'));
  if(!name){
    setProjectOwnerStatus(activeProjectProfile, 'Name the relationship before creating an owner.');
    renderProjectManagerProfile(activeProjectProfile);
    return;
  }
  let option = {
    id:'local-owner:' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    name,
    email,
    detail
  };
  setProjectOwnerStatus(activeProjectProfile, 'Creating local relationship owner...');
  renderProjectManagerProfile(activeProjectProfile);
  if(canUseApi){
    try{
      const created = await postJson('/api/relationships/create', {
        name,
        email,
        summary:detail || 'Created from Project Managers owner reassignment.',
        source:'project_owner_reassignment',
        noExternalAction:true
      });
      if(created?.relationship) option = rememberProjectOwnerRelationship(created.relationship) || option;
    }catch(error){
      setProjectOwnerStatus(activeProjectProfile, 'Created owner in this view, but the relationship receipt was not saved: ' + error.message);
    }
  }else{
    relationshipIndexProfiles[option.id] = relationshipProfileWithPersonPacket(relationshipProfileFromIndexItem({id:option.id,name,email,role:detail,relationshipStatus:'created locally'}));
  }
  await assignProjectOwnerFromOption(option, form.querySelector('button[type="submit"]') || form);
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
  body.textContent = projectSourceDisplayText(value) || emptyText;
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
    if(activeProjectProfile?.id === project.id){
      renderProjectGraphPanel(profile, links);
      renderProjectManagerProfile(profile);
    }
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
      renderProjectManagerProfile(project);
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
    if(activeProjectProfile?.id === project.id){
      renderProjectReviewPanel(profile, merged);
      renderProjectManagerProfile(profile);
    }
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
  if(activeProjectProfile){
    renderProjectReviewPanel(activeProjectProfile);
    renderProjectManagerProfile(activeProjectProfile);
  }
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
  const summary = projectCompactText(item.summary || item.reality || '', 360);
  const signal = projectCompactText(item.signal || summary || 'Project signal available.', 150);
  const nextMove = projectJudgmentLabel(item.nextMove || item.recommendedAction || '', 'Decide the next narrow move', [summary, signal]);
  const sourceDetails = normalizedProjectSourceDetails(item);
  const metadata = projectMetadataObject(item);
  return {
    ...item,
    id,
    name,
    initials: item.initials || name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'P',
    owner: item.owner || metadata.owner || null,
    assignedProjectManager: item.assignedProjectManager || metadata.assignedProjectManager || null,
    status: item.status || item.relationshipStatus || 'Observed',
    signal,
    reality: projectCompactText(item.reality || item.summary || 'Canonical project profile from VAL project index.', 420),
    momentum: item.momentum || 'Active context',
    momentumEvidence: projectEvidenceText(item.momentumEvidence || item.signal || item.summary || '', 'Project movement is visible in stored VAL evidence.', [summary, signal]),
    decision: item.decision || 'Review project reality',
    decisionEvidence: projectEvidenceText(item.decisionEvidence || '', 'Review project context before adding work.', [summary, signal]),
    nextMove,
    nextMoveEvidence: projectEvidenceText(item.nextMoveEvidence || (nextMove === 'Decide the next narrow move' ? '' : item.nextMove) || '', 'Use the project dossier before creating new work.', [summary, signal]),
    sourceReceipts: item.sourceReceipts || 'Canonical project index',
    relationships: Array.isArray(item.relationships) && item.relationships.length ? item.relationships : projectListFromValue(item.relationships || sourceDetails.relationships || item.people),
    sourceDetails,
    sopId: item.sopId || sourceDetails.sopId || '',
    sopName: item.sopName || '',
    graphLinks: Array.isArray(item.graphLinks) ? item.graphLinks : [],
    reviewUpdates: Array.isArray(item.reviewUpdates) ? item.reviewUpdates : [],
    href: item.href || './dashboard.html?view=projects&projectId=' + encodeURIComponent(id)
  };
}

function projectSuggestionReviewId(item = {}){
  return item.reviewUpdateId || item.review_update_id || item.surfaceTargetId || item.surface_target_id || '';
}

function projectSuggestionMetadata(item = {}){
  return item.metadataJson || item.metadata_json || {};
}

function projectSuggestionSourceRefs(item = {}){
  return Array.isArray(item.sourceRefsJson) ? item.sourceRefsJson : (Array.isArray(item.source_refs_json) ? item.source_refs_json : []);
}

function projectSuggestionEvidenceLine(item = {}){
  const meta = projectSuggestionMetadata(item);
  const refs = projectSuggestionSourceRefs(item);
  const documentCount = Number(meta.documentCount || 0);
  const docLine = documentCount ? documentCount + ' document' + (documentCount === 1 ? '' : 's') : '';
  const evidence = refs.map((ref) => ref.quote_or_summary || ref.quoteOrSummary || ref.summary || ref.source_id || ref.sourceId || '').filter(Boolean)[0] || '';
  return [docLine, evidence].filter(Boolean).join(' · ') || 'Document evidence attached.';
}

function projectSuggestionReceiptLine(item = {}){
  const meta = projectSuggestionMetadata(item);
  const receipt = meta.whatValDidReceipt || meta.sourceProcessingReceipt || item.whatValDidReceipt || {};
  const summary = String(receipt.summary || '').replace(/\s+/g, ' ').trim();
  return summary ? 'VAL handled: ' + summary : '';
}

function readDocumentProjectAssignments(){
  try{
    const raw = localStorage.getItem(DOCUMENT_PROJECT_ASSIGNMENTS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  }catch(error){
    return {};
  }
}

function writeDocumentProjectAssignments(assignments = {}){
  try{
    localStorage.setItem(DOCUMENT_PROJECT_ASSIGNMENTS_STORAGE_KEY, JSON.stringify(assignments));
  }catch(error){}
}

function documentProjectAssignmentFor(itemOrId = ''){
  const id = typeof itemOrId === 'object' ? itemOrId?.id : itemOrId;
  if(!id) return null;
  return readDocumentProjectAssignments()[id] || null;
}

function documentWithProjectAssignment(item = {}){
  if(!item?.id) return item;
  const assignment = documentProjectAssignmentFor(item.id);
  if(!assignment) return item;
  const assigned = {
    ...item,
    projectAssignmentDecision: assignment.decision || '',
    projectAssignmentAt: assignment.updatedAt || ''
  };
  if(assignment.projectName){
    assigned.project = assignment.projectName;
    assigned.projectId = assignment.projectId || item.projectId || item.project_id || '';
  }
  if(assignment.relationshipName && !assigned.relationship) assigned.relationship = assignment.relationshipName;
  if(assignment.decision === 'not_project') assigned.needs = 'Reviewed in Project Managers: this document is reference material, not a managed project.';
  return assigned;
}

function documentCalendarInviteValues(value = {}){
  const raw = value && typeof value === 'object' ? value : {};
  return [
    raw,
    raw.raw,
    raw.attachment,
    raw.document,
    raw.raw?.attachment,
    raw.raw?.document
  ].filter((item) => item && typeof item === 'object');
}

function documentLooksLikeCalendarInvite(value = {}){
  const values = documentCalendarInviteValues(value);
  const filenames = values.map((item) => [
    item.filename,
    item.fileName,
    item.name,
    item.title,
    item.originalFilename,
    item.originalName,
    item.id,
    item.attachmentId
  ].filter(Boolean).join(' ')).join(' ');
  const mimeTypes = values.map((item) => [
    item.mimeType,
    item.contentType,
    item.mediaType
  ].filter(Boolean).join(' ')).join(' ');
  const typeText = values.map((item) => [
    item.type,
    item.kind,
    item.sourceType,
    item.source,
    item.origin
  ].filter(Boolean).join(' ')).join(' ');
  if(/(?:^|[\\/])[^\\/]*\.ics(?:$|[?#\s])/i.test(filenames + ' ')) return true;
  if(/\b(?:invite|invitation|calendar|event)\.ics\b/i.test(filenames)) return true;
  if(mimeTypes.split(/\s+/).some((type) => /^(text\/calendar|text\/x-vcalendar|application\/(?:ics|calendar|x-ical)|application\/vnd\.ms-outlook)(?:\s*;.*)?$/i.test(type))) return true;
  return /\b(calendar_invite|icalendar|vcalendar)\b/i.test(typeText);
}

function documentItemsWithoutCalendarInvites(items = []){
  return items.filter((item) => !documentLooksLikeCalendarInvite(item));
}

function documentItemsWithProjectAssignments(items = []){
  return documentItemsWithoutCalendarInvites(items).map(documentWithProjectAssignment);
}

function persistDocumentProjectAssignment(item = {}, assignment = {}){
  if(!item?.id) return null;
  const stored = readDocumentProjectAssignments();
  const next = {
    ...(stored[item.id] || {}),
    documentId:item.id,
    documentTitle:item.title || 'Document',
    relationshipName:assignment.relationshipName || item.relationship || '',
    decision:assignment.decision || 'attached_existing_project',
    projectId:assignment.projectId || '',
    projectName:assignment.projectName || '',
    updatedAt:new Date().toISOString(),
    noExternalAction:true
  };
  stored[item.id] = next;
  writeDocumentProjectAssignments(stored);
  try{
    const raw = localStorage.getItem('val_docs_v1');
    const docs = raw ? JSON.parse(raw) : [];
    if(Array.isArray(docs)){
      const updated = docs.map((doc) => {
        if(doc.id !== item.id) return doc;
        return {
          ...doc,
          project:next.projectName || doc.project || doc.projectName || '',
          projectId:next.projectId || doc.projectId || '',
          projectAssignmentDecision:next.decision
        };
      });
      localStorage.setItem('val_docs_v1', JSON.stringify(updated));
    }
  }catch(error){}
  return next;
}

function documentProjectEvidenceLine(item = {}){
  return [
    item.relationship ? 'Relationship: ' + item.relationship : 'Relationship needs review',
    item.source || item.origin || '',
    item.type ? documentTypeLabel(item.type) : ''
  ].filter(Boolean).join(' · ');
}

function documentNeedsProjectAssignment(item = {}){
  if(!item?.id || !String(item.title || '').trim()) return false;
  if(documentLooksLikeCalendarInvite(item)) return false;
  const assignment = documentProjectAssignmentFor(item.id);
  if(assignment?.decision === 'not_project') return false;
  if(String(item.project || assignment?.projectName || '').trim()) return false;
  const text = [
    item.title,
    item.summary,
    item.body,
    item.source,
    item.origin,
    item.type,
    item.status,
    item.referenceUse,
    item.needs
  ].join(' ').toLowerCase();
  return /gmail|attachment|created|draft|ready|proposal|agreement|scope|deck|mou|sow|contract|pdf|document/.test(text);
}

function projectDocumentAssignmentItems(){
  const byId = new Map();
  documentItemsWithProjectAssignments(currentDocumentItems.concat(localStoredDocuments()).concat(localDocumentItems)).forEach((item) => {
    if(item?.id && !byId.has(item.id)) byId.set(item.id, item);
  });
  return Array.from(byId.values()).filter(documentNeedsProjectAssignment).slice(0, 6);
}

function projectByLookupId(projectId = ''){
  const clean = String(projectId || '');
  return projectIndexItems().find((project) =>
    [project.id, project.projectId, project.profileKey, project.name].filter(Boolean).some((value) => String(value) === clean)
  ) || projectIndexProfiles[clean] || projectProfiles[clean] || null;
}

function projectDocumentMatchScore(project = {}, item = {}){
  const text = [item.title, item.summary, item.body, item.relationship, item.source].join(' ').toLowerCase();
  const name = String(project.name || '').toLowerCase();
  if(!name || !text) return 0;
  let score = text.includes(name) ? 8 : 0;
  name.split(/[^a-z0-9]+/).filter((word) => word.length >= 4).forEach((word) => {
    if(text.includes(word)) score += 2;
  });
  projectResolvedRelationships(project).forEach((name) => {
    const relationship = String(name || '').toLowerCase();
    if(relationship && text.includes(relationship)) score += 3;
  });
  return score;
}

function suggestedProjectForDocument(item = {}){
  const scored = projectIndexItems()
    .map((project) => ({project, score:projectDocumentMatchScore(project, item)}))
    .filter((entry) => entry.score >= 2)
    .sort((a, b) => b.score - a.score);
  return scored[0]?.project || null;
}

function projectDocumentAssignmentSource(item = {}, action = '', project = null){
  return {
    sourceId:item.id || item.title || 'document',
    sourceType:'document_project_assignment',
    sourceLabel:item.title || 'Document needs project',
    projectId:project?.projectId || project?.id || '',
    projectName:project?.name || '',
    sourceItem:{
      documentId:item.id || '',
      title:item.title || 'Document',
      relationship:item.relationship || '',
      currentProject:item.project || '',
      suggestedProject:project?.name || '',
      source:item.source || item.origin || '',
      evidence:documentProjectEvidenceLine(item),
      requestedAction:action,
      noExternalAction:true
    }
  };
}

function appendProjectDocumentAssignmentRow(item = {}){
  if(!projectSuggestions || !item?.id) return;
  const suggestedProject = suggestedProjectForDocument(item);
  const row = document.createElement('article');
  row.className = 'project-suggestion-row project-document-assignment-row';
  const body = document.createElement('div');
  body.className = 'project-suggestion-copy';
  const kicker = document.createElement('span');
  kicker.className = 'project-suggestion-kicker';
  kicker.textContent = 'Document needs project';
  const strong = document.createElement('strong');
  strong.textContent = item.title || 'Untitled document';
  const summary = document.createElement('p');
  summary.textContent = item.summary || 'Choose whether this evidence belongs to an existing Project Manager or should start a new managed project.';
  const evidence = document.createElement('small');
  evidence.textContent = documentProjectEvidenceLine(item);
  body.append(kicker, strong, summary, evidence);
  const actions = document.createElement('div');
  actions.className = 'project-suggestion-actions project-document-assignment-actions';
  if(suggestedProject){
    const attach = document.createElement('button');
    attach.type = 'button';
    attach.dataset.projectDocumentAction = 'attach_existing';
    attach.dataset.projectDocumentId = item.id;
    attach.dataset.projectDocumentProject = suggestedProject.id || suggestedProject.projectId || suggestedProject.name || '';
    attach.textContent = 'Attach to ' + (suggestedProject.name || 'existing project');
    actions.appendChild(attach);
  }
  const create = document.createElement('button');
  create.type = 'button';
  create.dataset.projectDocumentAction = 'create_new';
  create.dataset.projectDocumentId = item.id;
  create.textContent = 'Create new project and assign a manager';
  const dismiss = document.createElement('button');
  dismiss.type = 'button';
  dismiss.dataset.projectDocumentAction = 'not_project';
  dismiss.dataset.projectDocumentId = item.id;
  dismiss.textContent = 'Not a project';
  actions.append(create, dismiss);
  row.append(body, actions);
  projectSuggestions.appendChild(row);
}

function findProjectSuggestionItem(reviewId = ''){
  return currentProjectSuggestionItems.find((item) => String(projectSuggestionReviewId(item)) === String(reviewId)) || null;
}

function projectSuggestionSource(item = {}, action = ''){
  const meta = projectSuggestionMetadata(item);
  const manager = meta.assignedProjectManager || {};
  const title = meta.projectName || String(item.title || '').replace(/^Suggested project:\s*/i, '') || 'Suggested project';
  return {
    sourceId: projectSuggestionReviewId(item) || item.id || title,
    sourceType: 'project_suggestion_surface',
    sourceLabel: title,
    projectId: item.surfaceTargetId || item.surface_target_id || '',
    projectName: title,
    sourceItem: {
      id: item.id || '',
      reviewUpdateId: projectSuggestionReviewId(item),
      title,
      summary: item.summary || '',
      assignedProjectManager: manager.name || '',
      evidence: projectSuggestionEvidenceLine(item),
      requestedAction: action,
      noExternalAction:true
    }
  };
}

function appendProjectSuggestionRow(item = {}){
  if(!projectSuggestions) return;
  const reviewId = projectSuggestionReviewId(item);
  if(!reviewId) return;
  const meta = projectSuggestionMetadata(item);
  const manager = meta.assignedProjectManager || {};
  const title = meta.projectName || String(item.title || '').replace(/^Suggested project:\s*/i, '') || 'Suggested project';
  const row = document.createElement('article');
  row.className = 'project-suggestion-row';
  const body = document.createElement('div');
  body.className = 'project-suggestion-copy';
  const kicker = document.createElement('span');
  kicker.className = 'project-suggestion-kicker';
  kicker.textContent = 'Suggested project';
  const strong = document.createElement('strong');
  strong.textContent = title;
  const summary = document.createElement('p');
  summary.textContent = item.summary || 'A relationship sent documents that may define a project.';
  const evidence = document.createElement('small');
  evidence.textContent = projectSuggestionEvidenceLine(item);
  body.append(kicker, strong, summary, evidence);
  const receiptLine = projectSuggestionReceiptLine(item);
  if(receiptLine){
    const receipt = document.createElement('small');
    receipt.className = 'project-suggestion-receipt';
    receipt.textContent = receiptLine;
    body.appendChild(receipt);
  }
  if(manager.name){
    const chip = document.createElement('span');
    chip.className = 'project-suggestion-manager';
    const swatch = document.createElement('i');
    swatch.setAttribute('aria-hidden', 'true');
    if(/^#[0-9a-f]{3,8}$/i.test(manager.hex || '')) swatch.style.backgroundColor = manager.hex;
    chip.append(swatch, document.createTextNode(manager.name));
    body.appendChild(chip);
  }
  const actions = document.createElement('div');
  actions.className = 'project-suggestion-actions';
  const approve = document.createElement('button');
  approve.type = 'button';
  approve.dataset.projectSuggestionAction = 'approve';
  approve.dataset.projectSuggestionReview = reviewId;
  approve.textContent = 'Yes, create this project and assign it a manager';
  const reject = document.createElement('button');
  reject.type = 'button';
  reject.dataset.projectSuggestionAction = 'reject';
  reject.dataset.projectSuggestionReview = reviewId;
  reject.textContent = 'No, this is not a project';
  actions.append(approve, reject);
  row.append(body, actions);
  projectSuggestions.appendChild(row);
}

function renderProjectSuggestions(){
  if(!projectSuggestions) return;
  projectSuggestions.innerHTML = '';
  const items = currentProjectSuggestionItems.filter((item) => projectSuggestionReviewId(item));
  const documentItems = projectDocumentAssignmentItems();
  const total = items.length + documentItems.length;
  projectSuggestions.hidden = !total;
  if(!total) return;
  const header = document.createElement('div');
  header.className = 'project-suggestion-header';
  const label = document.createElement('span');
  label.textContent = 'From documents';
  const count = document.createElement('small');
  count.textContent = total + ' waiting';
  header.append(label, count);
  projectSuggestions.appendChild(header);
  items.forEach(appendProjectSuggestionRow);
  documentItems.forEach(appendProjectDocumentAssignmentRow);
}

async function hydrateProjectSuggestions(){
  renderProjectSuggestions();
  if(!canUseApi || !projectSuggestions) return;
  if(projectSuggestionRequest) return projectSuggestionRequest;
  projectSuggestionRequest = getJson('/api/val/source-processing/surface-registrations?surface=project_managers&status=visible&reviewStatus=pending&limit=5')
    .then((data) => {
      currentProjectSuggestionItems = Array.isArray(data?.surfaceRegistrations) ? data.surfaceRegistrations : [];
      renderProjectSuggestions();
    })
    .catch((error) => {
      currentProjectSuggestionItems = [];
      renderProjectSuggestions();
      console.warn('[hearth] project suggestions unavailable', error.message);
    })
    .finally(() => {
      projectSuggestionRequest = null;
    });
  return projectSuggestionRequest;
}

async function decideProjectSuggestion(reviewId = '', action = '', node = null){
  const item = findProjectSuggestionItem(reviewId);
  if(!reviewId || !item) return;
  const approved = action === 'approve';
  const preflight = await ensureHearthClickPacket({node, packetName:'project_packet', action:'projectSuggestion:' + (approved ? 'approve_create_project' : 'reject_not_project'), allowBlockedForInspection:true, source:projectSuggestionSource(item, action)});
  if(!preflight.ok) return;
  renderDrawerPacketReceiptStrip(preflight.packet || lastHearthPacketReceipt);
  if(!canUseApi){
    projectIndexSourceLabel = 'Project suggestion decisions need the local VAL server.';
    updateProjectIndexSourceLabel();
    return;
  }
  const rowButtons = node?.closest('.project-suggestion-row')?.querySelectorAll('button') || [];
  rowButtons.forEach((button) => { button.disabled = true; });
  try{
    const result = await postJson('/api/val/review-updates/' + encodeURIComponent(reviewId) + '/' + (approved ? 'approve' : 'reject'), approved ? {note:'Yes, create this project and assign it a manager.'} : {reason:'No, this is not a project.'});
    currentProjectSuggestionItems = currentProjectSuggestionItems.filter((candidate) => String(projectSuggestionReviewId(candidate)) !== String(reviewId));
    renderProjectSuggestions();
    projectIndexSourceLabel = approved ? 'Project created locally from relationship documents' : 'Suggested project dismissed';
    updateProjectIndexSourceLabel();
    if(approved){
      projectIndexLoaded = false;
      projectIndexRequest = null;
      await hydrateProjectIndex();
    } else {
      await hydrateProjectSuggestions();
    }
    syncProjectReviewState(result.update || {id:reviewId,status:approved ? 'approved' : 'rejected'});
  }catch(error){
    projectIndexSourceLabel = 'Project suggestion was not updated: ' + error.message;
    updateProjectIndexSourceLabel();
    rowButtons.forEach((button) => { button.disabled = false; });
  }
}

function findProjectDocumentAssignmentItem(documentId = ''){
  return projectDocumentAssignmentItems().find((item) => String(item.id || '') === String(documentId || '')) ||
    currentDocumentItems.find((item) => String(item.id || '') === String(documentId || '')) ||
    localStoredDocuments().find((item) => String(item.id || '') === String(documentId || '')) ||
    null;
}

function documentProjectRecordFromItem(item = {}, project = {}){
  return {
    id:item.id || '',
    title:item.title || 'Document',
    type:item.type || 'document',
    source:item.source || item.origin || 'VAL document',
    relationship:item.relationship || '',
    project:project.name || item.project || '',
    summary:item.summary || item.referenceUse || 'Document evidence is attached to this Project Manager.',
    referenceUse:item.referenceUse || 'Use as project evidence after review.',
    noExternalAction:true
  };
}

function syncDocumentProjectAssignmentToRows(item = {}, assignment = {}){
  if(!item?.id) return;
  const projectName = assignment.projectName || item.project || '';
  const projectId = assignment.projectId || item.projectId || item.project_id || '';
  currentDocumentItems = currentDocumentItems.map((row) => row.id === item.id ? documentWithProjectAssignment({...row, project:projectName, projectId}) : row);
  if(activeDocumentItem?.id === item.id) activeDocumentItem = documentWithProjectAssignment({...activeDocumentItem, project:projectName, projectId});
}

function attachDocumentToProjectLocally(item = {}, project = {}){
  if(!item?.id || !project) return null;
  const projectId = project.projectId || project.id || project.profileKey || project.name || '';
  const assignment = persistDocumentProjectAssignment(item, {
    decision:'attached_existing_project',
    projectId,
    projectName:project.name || '',
    relationshipName:item.relationship || ''
  });
  syncDocumentProjectAssignmentToRows(item, assignment || {});
  const profile = projectIndexProfiles[project.id] || projectProfiles[project.id] || project;
  const existingDocuments = Array.isArray(profile.documents) ? profile.documents : [];
  const record = documentProjectRecordFromItem({...item, project:profile.name || project.name, projectId}, profile);
  profile.documents = existingDocuments.some((doc) => doc.id === record.id || doc.title === record.title) ? existingDocuments : existingDocuments.concat(record);
  const sourceDetails = normalizedProjectSourceDetails(profile);
  const documentLine = projectListFromValue(sourceDetails.documents).concat(record.title).filter(Boolean);
  profile.sourceDetails = {
    ...sourceDetails,
    documents:Array.from(new Set(documentLine)).join('; ')
  };
  if(profile.id) projectIndexProfiles[profile.id] = profile;
  if(activeProjectProfile?.id === profile.id) renderProjectProfile(profile.id);
  renderProjectSuggestions();
  if(drawerTray?.classList.contains('document-open')) renderDocumentBrief(activeDocumentItem);
  projectIndexSourceLabel = 'Document attached to ' + (profile.name || 'project') + ' locally';
  updateProjectIndexSourceLabel();
  return assignment;
}

function projectReadableDocumentTitle(value = ''){
  return projectCleanText(value)
    .replace(/\.[a-z0-9]{2,8}$/i, '')
    .replace(/\b(MOU|SOW|Agreement|Scope|Proposal|Contract|Deck)\b\s*/i, '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
}

function inferProjectNameFromDocument(item = {}){
  const title = projectCleanText(item.title || 'New project from document');
  const subject = projectCleanText(item.raw?.emailSubject || '');
  const base = projectReadableDocumentTitle(title) || title.replace(/\.[a-z0-9]{2,8}$/i, '');
  const slashMatch = (subject || base).match(/(?:MOU|SOW|Agreement|Scope|Proposal|Contract)\s+(?:(?:for|with)\b\s*)?([^/]+(?:\/\s*[^/]+)?)/i);
  const inferred = slashMatch?.[1] || base || subject || 'New project from document';
  return projectCompactText(projectReadableDocumentTitle(inferred) || inferred.replace(/\s+/g, ' ').trim(), 90);
}

function ensureLocalProjectIndexSeeded(){
  if(projectIndexLoaded || Object.keys(projectIndexProfiles).length) return;
  projectIndexProfiles = Object.values(projectProfiles).reduce((profiles, project) => {
    profiles[project.id] = project;
    return profiles;
  }, {});
}

async function createProjectFromDocumentAssignment(item = {}){
  const name = inferProjectNameFromDocument(item);
  const evidenceSummary = [
    'Created from document evidence: ' + (item.title || 'Document') + '.',
    item.summary || '',
    item.relationship ? 'Relationship: ' + item.relationship + '.' : ''
  ].filter(Boolean).join(' ');
  if(canUseApi){
    const payload = new FormData();
    payload.append('name', name);
    payload.append('summary', '');
    payload.append('documents', [item.title, item.summary, item.referenceUse].filter(Boolean).join('\n'));
    payload.append('relationships', item.relationship || '');
    payload.append('rawContext', 'Created from Project Managers document assignment. No external action happened.');
    payload.append('needsProjectOnboarding', 'true');
    payload.append('createdFrom', 'hearth_project_document_assignment');
    payload.append('onboardingQuestion', PROJECT_ONBOARDING_FIRST_QUESTION);
    const result = await postFormData('/api/projects/create', payload);
    const project = projectProfileFromIndexItem(result.project || result.dossier?.card || {name, summary:''});
    if(project.id){
      project.documents = [documentProjectRecordFromItem(item, project)];
      projectIndexProfiles[project.id] = result.dossier ? projectProfileFromDossier(result.dossier, project) : project;
      projectIndexLoaded = true;
      attachDocumentToProjectLocally(item, projectIndexProfiles[project.id]);
      renderProjectRolodex();
      renderProjectProfile(project.id);
      return projectIndexProfiles[project.id];
    }
  }
  ensureLocalProjectIndexSeeded();
  const id = 'document-project-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'document-project';
  const project = projectProfileFromIndexItem({
    id,
    name,
    status:'intake',
    summary:'',
    reality:'',
    signal:'A document needs a Project Manager decision.',
    sourceReceipts:'Document evidence · Project Managers assignment',
    sourceDetails:{
      documents:item.title || 'Document',
      relationships:item.relationship || '',
      rawContext:'Created from Project Managers document assignment. ' + evidenceSummary
    },
    relationships:item.relationship ? [item.relationship] : [],
    explicitUserProject:true,
    needsProjectOnboarding:true,
    metadataJson:{
      createdFrom:'hearth_project_document_assignment',
      needsProjectOnboarding:true,
      projectOnboarding:{
        status:'needs_interview',
        currentQuestion:PROJECT_ONBOARDING_FIRST_QUESTION
      },
      noExternalAction:true
    },
    documents:[documentProjectRecordFromItem(item, {name})]
  });
  projectIndexProfiles[project.id] = project;
  projectIndexLoaded = true;
  attachDocumentToProjectLocally(item, project);
  renderProjectRolodex();
  renderProjectProfile(project.id);
  return project;
}

async function decideProjectDocumentAssignment(documentId = '', action = '', node = null){
  const item = findProjectDocumentAssignmentItem(documentId);
  if(!item) return;
  const suggestedProject = action === 'attach_existing' ? projectByLookupId(node?.dataset.projectDocumentProject || '') || suggestedProjectForDocument(item) : null;
  const preflight = await ensureHearthClickPacket({node, packetName:'project_packet', action:'projectDocument:' + action, allowBlockedForInspection:true, source:projectDocumentAssignmentSource(item, action, suggestedProject)});
  if(!preflight.ok) return;
  renderDrawerPacketReceiptStrip(preflight.packet || lastHearthPacketReceipt);
  const rowButtons = node?.closest('.project-document-assignment-row')?.querySelectorAll('button') || [];
  rowButtons.forEach((button) => { button.disabled = true; });
  try{
    if(action === 'attach_existing'){
      if(!suggestedProject) throw new Error('No matching project was available to attach.');
      attachDocumentToProjectLocally(item, suggestedProject);
      projectIndexSourceLabel = 'Document attached to ' + (suggestedProject.name || 'project') + '. No external action happened.';
    }else if(action === 'create_new'){
      projectIndexSourceLabel = 'Creating project from document...';
      updateProjectIndexSourceLabel();
      if(node) node.textContent = 'Creating project...';
      const project = await createProjectFromDocumentAssignment(item);
      projectIndexSourceLabel = 'Project created from document with Project Manager ' + projectManagerAssignment(project).name + '. No external action happened.';
    }else if(action === 'not_project'){
      persistDocumentProjectAssignment(item, {decision:'not_project', relationshipName:item.relationship || ''});
      projectIndexSourceLabel = 'Document marked as reference only, not a project.';
    }
    renderProjectSuggestions();
    updateProjectIndexSourceLabel();
  }catch(error){
    projectIndexSourceLabel = 'Document project assignment was not saved: ' + error.message;
    updateProjectIndexSourceLabel();
    rowButtons.forEach((button) => { button.disabled = false; });
  }
}

function projectPinIsoFromLocal(value = ''){
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : '';
}

function projectPinPayload(form){
  const data = new FormData(form);
  const project = activeProjectProfile || {};
  const title = projectCleanText(data.get('title') || projectPinPrompt(project));
  const pinUntil = projectPinIsoFromLocal(data.get('pinUntil') || '');
  return {
    projectId: project.projectId || project.id || project.name || '',
    projectProfileId: project.id || '',
    projectName: project.name || 'Project',
    title,
    summary: title,
    pinUntil,
    sourceType:'project_manager_page',
    sourceId: project.projectId || project.id || project.name || '',
    sourceTitle: project.name || 'Project',
    sourceRefs:[{
      sourceType:'project_manager_page',
      sourceId: project.projectId || project.id || project.name || '',
      quoteOrSummary: title,
      confidence:0.9
    }],
    metadataJson:{projectProfileId:project.id || '',noExternalAction:true}
  };
}

function projectEditPayload(form, project = activeProjectProfile){
  const data = new FormData(form);
  const name = projectCleanText(data.get('name') || project?.name || '');
  return {
    projectId: project?.projectId || project?.id || project?.profileKey || project?.name || '',
    projectProfileId: project?.id || '',
    profileKey: project?.profileKey || '',
    previousName: project?.name || '',
    name,
    summary: projectCleanText(data.get('summary') || ''),
    documents: projectCleanText(data.get('documents') || ''),
    noExternalAction:true
  };
}

function applyProjectEditLocally(project = activeProjectProfile, patch = {}, incoming = null){
  const current = project || activeProjectProfile || {};
  const incomingProject = incoming || {};
  const currentDetails = normalizedProjectSourceDetails(current);
  const incomingDetails = normalizedProjectSourceDetails(incomingProject);
  const sourceDetails = {
    ...currentDetails,
    ...incomingDetails,
    documents: Object.prototype.hasOwnProperty.call(patch, 'documents') ? patch.documents : (incomingDetails.documents || currentDetails.documents)
  };
  const currentMetadata = projectMetadataObject(current);
  const incomingMetadata = projectMetadataObject(incomingProject);
  const intake = {
    ...(currentMetadata.intake || {}),
    ...(incomingMetadata.intake || {})
  };
  if(Object.prototype.hasOwnProperty.call(patch, 'documents')) intake.documents = patch.documents;
  const updated = projectProfileFromIndexItem({
    ...current,
    ...incomingProject,
    id: current.id || incomingProject.id || patch.projectProfileId || patch.projectId || patch.profileKey || 'project',
    projectId: current.projectId || incomingProject.projectId || patch.projectId || '',
    profileKey: current.profileKey || incomingProject.profileKey || patch.profileKey || '',
    name: patch.name || incomingProject.name || current.name || 'Project',
    initials: initialsFromName(patch.name || incomingProject.name || current.name || 'Project'),
    summary: patch.summary || incomingProject.summary || incomingProject.reality || current.summary || current.reality || '',
    reality: patch.summary || incomingProject.reality || incomingProject.summary || current.reality || '',
    documents: patch.documents || incomingProject.documents || current.documents || '',
    sourceDetails,
    metadataJson:{
      ...currentMetadata,
      ...incomingMetadata,
      intake,
      projectName: patch.name || incomingMetadata.projectName || currentMetadata.projectName || current.name || '',
      updatedFrom:'hearth_project_edit',
      noExternalAction:true
    }
  });
  activeProjectProfile = updated;
  if(updated.id) projectIndexProfiles[updated.id] = updated;
  return updated;
}

async function saveProjectEditFromForm(event){
  event.preventDefault();
  const form = event.target.closest('[data-project-edit-form]');
  if(!form || !activeProjectProfile) return;
  const project = activeProjectProfile;
  const key = projectPinProjectKey(project);
  const payload = projectEditPayload(form, project);
  if(!payload.name){
    projectEditStatusByProject[key] = 'Name the project before saving.';
    renderProjectManagerProfile(project);
    return;
  }
  if(!canUseApi){
    const updated = applyProjectEditLocally(project, payload);
    projectEditComposerOpen = false;
    projectEditStatusByProject[key] = 'Project updated in this view. The VAL server is needed to persist it after refresh.';
    renderProjectRolodex();
    renderProjectProfile(updated.id);
    return;
  }
  projectEditStatusByProject[key] = 'Saving project changes...';
  renderProjectManagerProfile(project);
  try{
    const result = await postJson('/api/projects/update', payload);
    const incoming = result.dossier ? projectProfileFromDossier(result.dossier, project) : projectProfileFromIndexItem(result.project || {});
    const updated = applyProjectEditLocally(project, payload, incoming);
    projectEditComposerOpen = false;
    projectEditStatusByProject[key] = result.message || 'Project updated locally. No external action happened.';
    projectIndexLoaded = true;
    projectIndexSourceLabel = result.source === 'demo_project_profiles' ? 'Demo project index' : 'Canonical project index';
    updateProjectIndexSourceLabel();
    renderProjectRolodex();
    renderProjectProfile(updated.id);
  }catch(error){
    projectEditStatusByProject[key] = 'Project was not updated: ' + error.message;
    renderProjectManagerProfile(project);
  }
}

function normalizeProjectPinAlignmentItem(item = {}){
  return {
    ...item,
    metadata: item.metadataJson || item.metadata || {},
    target: item.target || {type:'project',id:item.projectId || '',name:item.projectName || 'Project',label:item.projectName || 'Project'},
    sourceRefsJson: Array.isArray(item.sourceRefsJson) ? item.sourceRefsJson : [],
    portalPhrases: Array.isArray(item.portalPhrases) ? item.portalPhrases : [item.projectName, item.title].filter(Boolean)
  };
}

function isProjectPinAlignmentItem(item = {}){
  const metadata = item.metadataJson || item.metadata || {};
  return metadata.source === 'project_pin' || metadata.pinId || item.pinId || /^alignment_project_pin/i.test(String(item.id || ''));
}

function projectPinIdFromAlignmentItem(item = {}){
  const metadata = item.metadataJson || item.metadata || {};
  const id = metadata.pinId || item.pinId || item.projectPinId || '';
  if(id) return String(id);
  return String(item.id || '').replace(/^alignment_/, '');
}

function currentAlignmentIsProjectPin(){
  const workspaceItem = currentState.rooms?.alignment?.workspace?.sourceItem || {};
  const queueItem = homeRoomQueues.alignment?.[0]?.sourceItem || homeRoomQueues.alignment?.[0] || {};
  return isProjectPinAlignmentItem(workspaceItem) || isProjectPinAlignmentItem(queueItem);
}

function updateAlignmentFromProjectPin(item = {}){
  const pinItem = normalizeProjectPinAlignmentItem(item);
  if(!homeAdmissionResult('alignment', pinItem).passed) return;
  setHomeRoomQueue('alignment', [pinItem]);
  const admitted = homeRoomQueues.alignment?.[0]?.sourceItem || pinItem;
  const titleText = itemTitle(admitted, 'This is unpinned. Let\'s work on it.');
  const meaningText = itemMeaning(admitted, 'A project loop has reopened at the time you chose.');
  const sourceLabel = sourceActionLabel(admitted, 'Open Project Manager');
  updateRoomFromBriefing('alignment', {
    card: {
      observation: roomCardObservation(admitted, titleText, 'alignment'),
      implication: roomCardImplication(admitted, meaningText, 'alignment'),
      invitation: 'Work it, pin it again, or close the loop.',
      title: titleText,
      summary: meaningText,
      action: 'Review the reopened loop'
    },
    workspace: briefingWorkspace({
      lens:'Alignment',
      title:titleText,
      meaning:meaningText,
      understanding:workspaceUnderstanding(admitted, [
        admitted.whyNow || '',
        admitted.ifIgnored ? 'If ignored: ' + admitted.ifIgnored : '',
        admitted.dueAt ? 'Unpinned at: ' + admitted.dueAt : ''
      ]),
      recommendation:admitted.actionNeeded || 'Open the Project Manager page and decide the next move.',
      actions:suggestedHomeActionsForItem(admitted, 'alignment', sourceLabel),
      confidence:admitted.confidence,
      restraintReason:'A pin only enters Alignment when it reaches the user-chosen unpin time.',
      sourceItem:admitted,
      cardType:'highest_leverage'
    })
  });
  setRoomCopy(currentState);
}

async function hydrateAlignmentFromProjectPins(){
  if(!canUseApi) return;
  if(projectPinAlignmentRequest) return projectPinAlignmentRequest;
  projectPinAlignmentRequest = getJson('/api/val/project-pins/alignment?limit=3')
    .then((data) => {
      const items = Array.isArray(data?.alignmentItems) ? data.alignmentItems.map(normalizeProjectPinAlignmentItem) : [];
      if(items.length) updateAlignmentFromProjectPin(items[0]);
      else if(currentAlignmentIsProjectPin()){
        setHomeRoomQueue('alignment', []);
        clearHomeRoomForAdmission('alignment');
        setRoomCopy(currentState);
      }
    })
    .catch((error) => console.warn('[hearth] project pin alignment unavailable', error.message))
    .finally(() => {
      projectPinAlignmentRequest = null;
    });
  return projectPinAlignmentRequest;
}

async function createProjectPinFromForm(event){
  event.preventDefault();
  const form = event.target.closest('[data-project-pin-form]');
  if(!form || !activeProjectProfile) return;
  const payload = projectPinPayload(form);
  const key = projectPinProjectKey(activeProjectProfile);
  if(!payload.pinUntil){
    projectPinStatusByProject[key] = 'Choose a valid date and time.';
    renderProjectManagerProfile(activeProjectProfile);
    return;
  }
  if(!canUseApi){
    projectPinStatusByProject[key] = 'The local VAL server is needed to save this pin. Nothing changed.';
    renderProjectManagerProfile(activeProjectProfile);
    return;
  }
  projectPinStatusByProject[key] = 'Saving pin...';
  renderProjectManagerProfile(activeProjectProfile);
  try{
    const result = await postJson('/api/val/project-pins', payload);
    projectPinComposerOpen = false;
    const date = new Date(result.pin?.pinUntil || payload.pinUntil);
    const label = Number.isFinite(date.getTime()) ? date.toLocaleString([], {dateStyle:'medium', timeStyle:'short'}) : payload.pinUntil;
    projectPinStatusByProject[key] = 'Pinned until ' + label + '. It will reopen in Project Managers and Alignment.';
    renderProjectManagerProfile(activeProjectProfile);
    await hydrateAlignmentFromProjectPins();
  }catch(error){
    projectPinStatusByProject[key] = 'Pin was not saved: ' + error.message;
    renderProjectManagerProfile(activeProjectProfile);
  }
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
        renderProjectSuggestions();
        const firstProject = projectIndexItems()[0];
        if(firstProject) renderProjectProfile(firstProject.id);
        else renderProjectManagerEmptyState();
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
  const packet = projectManagerPacket(project);
  const judgment = packet.project_manager_judgment_packet;
  const nextPacket = packet.project_next_action_packet;
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.projectOpenProfile = project.id;
  button.setAttribute('aria-pressed', String(activeProjectProfile?.id === project.id));
  button.setAttribute('title', nextPacket.why_now);
  const name = document.createElement('span');
  name.className = 'project-row-name';
  name.textContent = project.name;
  const status = document.createElement('span');
  status.className = 'project-row-status';
  status.textContent = project.status || packet.project_admission_packet.admission_state.replace(/_/g, ' ');
  const signal = document.createElement('span');
  signal.className = 'project-row-signal';
  signal.textContent = judgment.why_it_matters;
  const next = document.createElement('span');
  next.className = 'project-row-next';
  next.textContent = nextPacket.next_action;
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
  const project = projectIndexProfiles[projectId] || projectProfiles[projectId] || (!projectIndexLoaded ? projectProfiles.frisson : null);
  if(!project){
    renderProjectManagerEmptyState();
    return;
  }
  activeProjectProfile = normalizeProjectInterviewCarryover(project);
  if(projectTitle) projectTitle.textContent = project.name || 'Projects';
  document.querySelectorAll('[data-project-field]').forEach((node) => {
    const field = node.dataset.projectField;
    node.textContent = project[field] || '';
  });
  document.querySelectorAll('[data-project-open-profile]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.projectOpenProfile === project.id));
  });
  renderProjectManagerProfile(project);
  renderProjectSourcePanel(project);
  renderProjectPreparedWorkPanel(project);
  hydrateProjectDocuments(project);
  hydrateProjectGraphLinks(project);
  hydrateProjectReviewUpdates(project);
  ensureProjectProfileReceipt(project);
}

function projectSource(project = activeProjectProfile, action = ''){
  const item = project || activeProjectProfile || projectProfiles.frisson;
  const packet = projectManagerPacket(item);
  return {
    sourceId: item.projectId || item.id || item.profileKey || item.name || 'project',
    sourceType: 'project_profile',
    sourceLabel: item.name || 'Project',
    projectId: item.projectId || item.id || item.profileKey || '',
    projectName: item.name || 'Project',
    sourceItem: {
      id:item.id || item.projectId || item.profileKey || item.name || 'project',
      projectId:item.projectId || '',
      name:item.name || 'Project',
      status:item.status || '',
      currentReality:item.reality || '',
      momentum:item.momentum || '',
      decision:item.decision || '',
      nextMove:item.nextMove || '',
      sourceReceipts:item.sourceReceipts || '',
      sourceDetails:normalizedProjectSourceDetails(item),
      projectManagerPacket: packet,
      graphLinks:item.graphLinks || [],
      reviewUpdates:item.reviewUpdates || [],
      preparedWork:item.preparedWork || [],
      requestedAction:action
    }
  };
}

function projectProfileReceiptPacket(project = activeProjectProfile){
  const source = projectSource(project, 'project:open_profile');
  const sourceLabel = source.sourceLabel || project?.name || 'Project';
  return {
    ok:true,
    status:'not_checked',
    packetName:'project_packet',
    source,
    click:{action:'project:open_profile'},
    receipt:{
      id:'project_packet_' + Date.now().toString(36),
      sourceReceipts:[{label:sourceLabel, sourceType:'project_profile', key:source.sourceId || project?.id || sourceLabel}],
      downstreamConsumers:['project_brief','relationship_packet','email_packet','home_source_packet'],
      summary:'This Project brief is showing a source-scoped client packet while live hydration is unavailable or mismatched.'
    }
  };
}

function ensureProjectProfileReceipt(project = activeProjectProfile){
  if(!project?.name || !drawerPacketReceipt || drawerPacketReceipt.hidden) return;
  const currentReceipt = drawerPacketReceipt.textContent || '';
  if(currentReceipt.includes(project.name)) return;
  const packet = projectProfileReceiptPacket(project);
  lastHearthPacketReceipt = packet;
  renderDrawerPacketReceiptStrip(packet);
}

function projectProfileFromDossier(dossier = {}, fallback = {}){
  const card = dossier.card || {};
  const identity = dossier.identity || {};
  const currentReality = dossier.currentReality || {};
  const momentum = dossier.momentum || {};
  const decisionPoint = dossier.decisionPoint || {};
  const nextMove = dossier.nextMove || {};
  const sourceReceipts = dossier.sourceReceipts || {};
  const reality = projectCompactText(currentReality.summary || card.reality || fallback.reality || '', 420);
  const signal = projectCompactText(currentReality.signal || card.signal || fallback.signal || reality, 150);
  const momentumLabel = projectJudgmentLabel(momentum.summary || card.momentum || fallback.momentum || '', 'Active context', [reality, signal]);
  const decisionLabel = projectJudgmentLabel(decisionPoint.summary || card.decision || fallback.decision || '', 'Review project reality', [reality, signal]);
  const nextMoveLabel = projectJudgmentLabel(nextMove.summary || card.nextMove || fallback.nextMove || '', 'Decide the next narrow move', [reality, signal]);
  const sourceDetails = normalizedProjectSourceDetails(sourceReceipts.details || card.sourceDetails || fallback.sourceDetails || {});
  return {
    ...fallback,
    id: identity.id || card.id || fallback.id || 'project',
    projectId: identity.projectId || card.projectId || fallback.projectId || '',
    profileKey: identity.profileKey || card.profileKey || fallback.profileKey || '',
    name: identity.name || card.name || fallback.name || 'Project',
    initials: card.initials || fallback.initials || initialsFromName(identity.name || card.name || fallback.name || 'Project'),
    owner: identity.owner || card.owner || fallback.owner || null,
    assignedProjectManager: identity.assignedProjectManager || card.assignedProjectManager || fallback.assignedProjectManager || null,
    status: identity.status || currentReality.status || card.status || fallback.status || 'Observed',
    signal,
    reality,
    momentum: momentumLabel,
    momentumEvidence: projectEvidenceText(momentum.evidence || card.momentumEvidence || fallback.momentumEvidence || '', 'Project movement is visible in stored VAL evidence.', [reality, signal]),
    decision: decisionLabel,
    decisionEvidence: projectEvidenceText(decisionPoint.evidence || card.decisionEvidence || fallback.decisionEvidence || '', 'Review project context before adding work.', [reality, signal]),
    nextMove: nextMoveLabel,
    nextMoveEvidence: projectEvidenceText(nextMove.evidence || card.nextMoveEvidence || fallback.nextMoveEvidence || '', 'Use the project dossier before creating new work.', [reality, signal]),
    sourceReceipts: sourceReceipts.summary || card.sourceReceipts || fallback.sourceReceipts || '',
    relationships: Array.isArray(card.relationships) && card.relationships.length ? card.relationships : projectListFromValue(card.relationships || fallback.relationships || sourceDetails.relationships || fallback.people),
    sourceDetails,
    sopId: identity.sopId || card.sopId || fallback.sopId || sourceDetails.sopId || '',
    sopName: identity.sopName || card.sopName || fallback.sopName || '',
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

async function openProjectProfileFromDrawer(projectId = '', node = null){
  const project = projectIndexProfiles[projectId] || projectProfiles[projectId] || projectProfiles.frisson;
  renderProjectProfile(projectId || project.id || 'frisson');
  const selectedSource = projectSource(project, 'project:open_profile');
  const preflight = await ensureHearthClickPacket({node, packetName:'project_packet', action:'project:open_profile', allowBlockedForInspection:true, source:selectedSource});
  if(!preflight.ok) return;
  const selectedLabel = selectedSource.sourceLabel || project.name || projectId;
  const receiptLabels = packetReceiptSummary(preflight.packet || {}).sourceLabels.join(' ');
  const receiptMatchesSelection = selectedLabel && receiptLabels.toLowerCase().includes(String(selectedLabel).toLowerCase());
  const packet = receiptMatchesSelection ? preflight.packet : projectProfileReceiptPacket(project);
  lastHearthPacketReceipt = packet || lastHearthPacketReceipt;
  renderDrawerPacketReceiptStrip(packet || lastHearthPacketReceipt);
  loadProjectDossier(projectId || project.id || 'frisson');
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
  hydrateRelationshipIndex();
  hydrateProjectSuggestions();
  renderProjectRolodex();
  const firstProject = projectIndexItems()[0];
  if(firstProject) renderProjectProfile(activeProjectProfile?.id || firstProject.id);
  else renderProjectManagerEmptyState();
  hydrateProjectIndex();
}

function correspondenceCompactText(value = '', limit = 420){
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, limit);
}

function correspondenceThreadMessagesFromSource(source = {}, fallback = {}){
  const conversation = source.conversationContext || source.conversation_context || source.thread || source.conversation || {};
  const messages = conversation.messages || source.messages || source.threadMessages || source.thread_messages || [];
  if(Array.isArray(messages) && messages.length){
    return messages.slice(0, 8).map((message) => ({
      from: message.from?.name || message.fromName || message.from_name || message.senderName || message.sender_name || message.sender || message.author || message.from?.email || 'Email',
      date: message.date || message.receivedAt || message.received_at || message.createdAt || message.created_at || '',
      body: correspondenceCompactText(message.bodyText || message.body_text || message.bodyPreview || message.body_preview || message.snippet || message.preview || message.text || message.content || '', 3600)
    })).filter((message) => message.body);
  }
  const latest = conversation.latest_inbound || conversation.latestInbound || source.latestInbound || source.latest_inbound || {};
  const body = latest.body || latest.bodyText || latest.body_text || latest.snippet || source.bodyPreview || fallback.summary || fallback.draftBody || '';
  const from = latest.from?.name || latest.from_name || latest.senderName || source.classification?.from?.name || fallback.senderName || fallback.recipientEmail || 'Thread';
  return body ? [{from,date:latest.date || latest.receivedAt || fallback.createdAt || '',body:correspondenceCompactText(body,3600)}] : [];
}

function correspondenceAttachmentsFromSource(source = {}){
  const rows = []
    .concat(Array.isArray(source.attachments) ? source.attachments : [])
    .concat(Array.isArray(source.attachmentsJson) ? source.attachmentsJson : [])
    .concat(Array.isArray(source.attachments_json) ? source.attachments_json : []);
  const seen = new Set();
  return rows.map((attachment) => {
    if(typeof attachment === 'string') return {name:attachment, type:'email_attachment'};
    return {
      name: attachment.filename || attachment.fileName || attachment.name || attachment.title || 'Attachment',
      type: attachment.mimeType || attachment.contentType || attachment.type || 'email_attachment',
      size: attachment.size || attachment.fileSize || 0
    };
  }).filter((attachment) => {
    const key = [attachment.name, attachment.type, attachment.size].join(':').toLowerCase();
    if(!attachment.name || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function correspondenceContextLines(source = {}, keys = []){
  const lines = [];
  keys.forEach((key) => {
    const value = source[key] || source[key.replace(/[A-Z]/g, (match) => '_' + match.toLowerCase())];
    if(Array.isArray(value)) value.forEach((item) => lines.push(correspondenceCompactText(typeof item === 'string' ? item : item.name || item.title || item.summary || item.email || '', 180)));
    else if(value && typeof value === 'object') lines.push(correspondenceCompactText(value.name || value.title || value.summary || value.email || '', 180));
    else if(value) lines.push(correspondenceCompactText(value, 180));
  });
  return lines.filter(Boolean);
}

function correspondenceRuleHints(source = {}, readiness = {}, writer = {}){
  const hints = [];
  const push = (value) => {
    const text = correspondenceCompactText(value, 220);
    if(text && !hints.includes(text)) hints.push(text);
  };
  push(source.ruleSuggestion || source.rule_suggestion);
  (Array.isArray(source.ruleSuggestions) ? source.ruleSuggestions : []).forEach(push);
  (Array.isArray(readiness.suggested_rules) ? readiness.suggested_rules : []).forEach(push);
  (Array.isArray(writer.suggested_rules) ? writer.suggested_rules : []).forEach(push);
  return hints;
}

function normalizeCorrespondenceDraft(draft = {}){
  const source = draft.sourceContext || {};
  const writer = source.writerOutput || {};
  const readiness = source.draftReadiness || {};
  const brief = source.draftBrief || {};
  const qa = source.qa || {};
  const conversation = source.conversationContext || source.conversation_context || {};
  const latestInbound = conversation.latest_inbound || conversation.latestInbound || source.latestInbound || source.latest_inbound || {};
  const sender = latestInbound.from || source.classification?.from || {};
  return {
    id: draft.id || writer.id || source.conversationId || 'draft',
    draftId: draft.id || '',
    conversationId: source.conversationId || '',
    threadId: source.threadId || '',
    recipientEmail: source.to || source.recipientEmail || source.recipient || source.forwardTo || source.classification?.from?.email || source.conversationContext?.latest_inbound?.from?.email || '',
    provider: source.provider || source.classification?.provider || draft.provider || 'gmail',
    senderEmail: sender.email || latestInbound.fromEmail || latestInbound.from_email || source.classification?.from?.email || '',
    senderName: sender.name || latestInbound.fromName || latestInbound.from_name || source.classification?.from?.name || '',
    receivedAt: latestInbound.date || latestInbound.receivedAt || latestInbound.received_at || draft.createdAt || '',
    title: draft.subject || writer.subject || brief.single_purpose || 'Prepared email draft',
    status: draft.status || readiness.status || 'ready_for_review',
    summary: writer.why_this_draft_exists || brief.single_purpose || draft.body || 'Review-only draft prepared locally.',
    whyNow: brief.why_now || source.classification?.why_now || 'This conversation appears to be waiting on judgment.',
    context: [source.classification?.executive_meaning, source.classification?.relationship_temperature, source.conversationId && 'Conversation ' + source.conversationId].filter(Boolean).join(' · ') || 'Conversation context attached when available.',
    prepared: draft.body || writer.body || 'VAL prepared draft readiness and brief context.',
    needs: readiness.status === 'needs_context' ? 'Provide missing context: ' + (readiness.missing_context || writer.missing_context || []).join(', ') : 'Review whether this represents your voice, intent, and relationship.',
    draftBody: draft.body || writer.body || '',
    threadMessages: correspondenceThreadMessagesFromSource(source, draft),
    attachments: correspondenceAttachmentsFromSource(source),
    relationships: correspondenceContextLines(source, ['relationshipName','relationship','relationshipTemperature','executiveMeaning']),
    projects: correspondenceContextLines(source, ['projectName','project','projectId']),
    ruleSuggestions: correspondenceRuleHints(source, readiness, writer),
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
  const latestInbound = metadata.latestInbound || metadata.latest_inbound || metadata.conversationContext?.latest_inbound || metadata.conversationContext?.latestInbound || {};
  const sender = latestInbound.from || metadata.from || {};
  const draftId = metadata.draftId || item.draftId || '';
  return {
    id: item.id || draftId || item.conversationId || 'ready-correspondence',
    readyForYouId: item.id || '',
    draftId,
    conversationId: metadata.conversationId || item.conversationId || '',
    threadId: metadata.threadId || '',
    recipientEmail: metadata.to || metadata.recipientEmail || metadata.email || draft.to || draft.recipientEmail || '',
    provider: metadata.provider || item.provider || 'gmail',
    senderEmail: sender.email || latestInbound.fromEmail || latestInbound.from_email || metadata.fromEmail || metadata.senderEmail || '',
    senderName: sender.name || latestInbound.fromName || latestInbound.from_name || metadata.fromName || metadata.senderName || metadata.contactName || '',
    receivedAt: latestInbound.date || latestInbound.receivedAt || latestInbound.received_at || item.createdAt || '',
    title: item.title || draft.subject || 'Conversation ready for review',
    status: item.status || readiness.status || 'ready_for_review',
    summary: item.summary || item.whyUserIsSeeingThis || 'VAL prepared correspondence context for review.',
    whyNow: item.whyNow || item.why_now || 'This thread appears to need human judgment.',
    context: [metadata.projectName, metadata.contactName, metadata.conversationId && 'Conversation ' + metadata.conversationId].filter(Boolean).join(' · ') || 'Relationship and project context appear when resolved.',
    prepared: item.whatValPrepared || item.whatValDid || draft.body || 'VAL prepared draft/readiness context only.',
    needs: item.whatOnlyUserCanDo || item.whatUserNeedsToDo || 'Review, edit, approve, reject, or provide missing context.',
    draftBody: draft.body || item.whatValPrepared || '',
    threadMessages: correspondenceThreadMessagesFromSource(metadata, item),
    attachments: correspondenceAttachmentsFromSource(metadata),
    relationships: correspondenceContextLines(metadata, ['contactName','relationshipName','relationshipTemperature','executiveMeaning']),
    projects: correspondenceContextLines(metadata, ['projectName','project','projectId']),
    ruleSuggestions: correspondenceRuleHints(metadata, readiness, draft),
    evidence: sourceRefs.map((ref) => ref.quote_or_summary || ref.quoteOrSummary || ref.summary).filter(Boolean),
    representationRisk: item.representationRisk || readiness.representation_risk || 'medium',
    source: metadata.source || item.source || 'ready_for_you',
    noExternalAction: true,
    raw: item
  };
}

function normalizeCorrespondenceEmailItem(email = {}, index = 0){
  const draft = email.preparedDraft || {};
  const source = draft.sourceContext || draft.source_context || {};
  const sender = email.from || {};
  const body = email.bodyText || email.bodyPreview || email.snippet || '';
  const classification = String(email.classification || '').toLowerCase();
  const needsContext = ['needs_attention', 'forward_to_team', 'waiting_on_response'].includes(classification);
  return {
    id: 'gmail-scan-' + (email.messageId || email.threadId || index),
    draftId: draft.id || '',
    conversationId: email.threadId || email.messageId || '',
    threadId: email.threadId || '',
    recipientEmail: sender.email || source.to || '',
    provider: email.provider || 'gmail',
    senderEmail: sender.email || '',
    senderName: sender.name || sender.email || 'Gmail sender',
    receivedAt: email.date || email.receivedAt || email.internalDate || '',
    title: email.subject || draft.subject || 'Gmail conversation',
    status: needsContext ? 'needs_context' : 'ready_for_review',
    summary: email.reason || email.recommendedAction || email.snippet || 'VAL classified this Gmail thread as needing judgment.',
    whyNow: email.recommendedAction || email.reason || 'This thread matched the Executive Inbox scan window.',
    context: [sender.name || sender.email, email.classification && String(email.classification).replace(/_/g, ' ')].filter(Boolean).join(' · ') || 'Gmail conversation',
    prepared: draft.body ? 'VAL prepared private draft language for review.' : email.recommendedAction || 'VAL classified the thread and kept it review-only.',
    needs: draft.body ? 'Review whether this reply represents your voice and intent.' : 'Review the thread before VAL prepares or sends anything.',
    draftBody: draft.body || '',
    threadMessages: body ? [{from:sender.name || sender.email || 'Gmail',date:email.date || email.receivedAt || '',body:correspondenceCompactText(body,3600)}] : [],
    attachments: correspondenceAttachmentsFromSource(email),
    relationships: correspondenceContextLines(email, ['matchedContact','relationshipName','relationshipTemperature']),
    projects: correspondenceContextLines(email, ['projectName','project']),
    ruleSuggestions: correspondenceRuleHints(email, {}, draft),
    evidence: [email.reason, email.snippet || email.bodyPreview].filter(Boolean),
    representationRisk: 'medium',
    source: 'gmail_scan',
    noExternalAction: true,
    raw: email
  };
}

function correspondenceItemsFromEmailIntelligence(result = {}){
  const actionable = ['needs_reply','needs_attention','forward_to_team','appointment_recap_needed'];
  const rows = []
    .concat(result.draftSuggestions || [])
    .concat(result.needsReply || [])
    .concat(result.needsAttention || [])
    .concat((result.emails || []).filter((email) => actionable.includes(String(email.classification || '').toLowerCase())));
  const byId = new Map();
  rows.forEach((email, index) => {
    const key = email.messageId || email.threadId || email.id || index;
    if(!byId.has(key)) byId.set(key, normalizeCorrespondenceEmailItem(email, index));
  });
  return Array.from(byId.values());
}

function documentTypeLabel(value = ''){
  return String(value || 'document').replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function localStoredDocuments(){
  try{
    const raw = localStorage.getItem('val_docs_v1');
    const docs = raw ? JSON.parse(raw) : [];
    if(!Array.isArray(docs)) return [];
    const filteredDocs = documentItemsWithoutCalendarInvites(docs);
    if(filteredDocs.length !== docs.length) localStorage.setItem('val_docs_v1', JSON.stringify(filteredDocs));
    return filteredDocs.map((doc) => ({
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
    })).map(documentWithProjectAssignment);
  }catch(error){
    return [];
  }
}

function persistLocalDocumentItems(items = []){
  const incoming = documentItemsWithoutCalendarInvites(items);
  if(!incoming.length) return;
  try{
    const existing = localStoredDocuments();
    const byId = new Map(existing.concat(incoming).map((item) => [item.id, item]));
    localStorage.setItem('val_docs_v1', JSON.stringify(Array.from(byId.values()).slice(0, 160)));
  }catch(error){}
}

function documentItemsFromGmailScan(result = {}){
  const emails = Array.isArray(result.emails) ? result.emails : [];
  const rows = [];
  emails.forEach((email, emailIndex) => {
    const attachments = correspondenceAttachmentsFromSource(email);
    attachments.forEach((attachment, attachmentIndex) => {
      if(documentLooksLikeCalendarInvite(attachment)) return;
      const title = attachment.filename || attachment.name || 'Email attachment';
      if(!title) return;
      rows.push({
        id: 'gmail-scan:' + (email.messageId || email.threadId || emailIndex) + ':' + (attachment.id || attachment.attachmentId || title || attachmentIndex),
        title,
        type: attachment.mimeType || attachment.contentType || 'email_attachment',
        status: 'needs_review',
        relationship: email.from?.name || email.from?.email || '',
        project: '',
        source: 'Gmail attachment',
        summary: 'Attachment from "' + (email.subject || 'email') + '".',
        referenceUse: 'Use this email attachment as source evidence for relationship and project judgment after context is linked.',
        needs: 'Link the relationship/project context before relying on this attachment for decisions.',
        body: email.bodyPreview || email.snippet || email.subject || '',
        recipientEmail: '',
        sourceUrl: email.webLink || '',
        origin: 'gmail_scan_attachment',
        raw: {emailSubject: email.subject || '', messageId: email.messageId || '', threadId: email.threadId || '', attachment},
        noExternalAction: true
      });
    });
  });
  return rows;
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

function documentIntakeStatusLine(result = {}){
  const intake = result.sourceProcessing?.projectManagers || {};
  const providers = result.providers?.gmail || {};
  const eligible = Number(intake.eligible || result.summary?.projectManagerDocumentEmails || 0);
  const documentCandidates = Number(intake.documentCandidates || 0);
  const records = Array.isArray(intake.records) ? intake.records.length : 0;
  const suggestions = Number(intake.suggestions || result.summary?.projectManagerSuggestions || 0);
  const skipped = Number(intake.skipped || 0);
  const errors = Array.isArray(intake.errors) ? intake.errors.filter(Boolean) : [];
  if(errors.length) return 'Gmail document scan finished with source-processing errors: ' + errors.slice(0, 2).join('; ');
  if(eligible || records || suggestions || skipped){
    return 'Gmail document scan: ' + eligible + ' document email' + (eligible === 1 ? '' : 's') + ', ' + documentCandidates + ' document attachment' + (documentCandidates === 1 ? '' : 's') + ', ' + records + ' saved source record' + (records === 1 ? '' : 's') + ', ' + suggestions + ' Project Managers suggestion' + (suggestions === 1 ? '' : 's') + ', ' + skipped + ' source-only.';
  }
  if(providers.documentAttachmentCount) return 'Gmail scan saw ' + providers.documentAttachmentCount + ' attachment email' + (providers.documentAttachmentCount === 1 ? '' : 's') + ', but no document attachment entered source-processing.';
  if(providers.error) return 'Gmail scan ran, but Gmail reported: ' + providers.error;
  return 'Gmail scan ran. No document emails entered source-processing in this window.';
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
  scrollDocumentActionsIntoView();
}

function scrollDocumentActionsIntoView(){
  if(!drawerTray || !drawerTray.classList.contains('document-open')) return;
  window.requestAnimationFrame(() => {
    const action = document.querySelector('#document-detail [data-document-action]:not([hidden])');
    if(!action) return;
    const trayRect = drawerTray.getBoundingClientRect();
    const actionRect = action.getBoundingClientRect();
    const safeBottom = Math.min(window.innerHeight - 18, trayRect.bottom - 18);
    if(actionRect.bottom <= safeBottom && actionRect.top >= trayRect.top + 18) return;
    drawerTray.scrollTop = Math.max(0, drawerTray.scrollTop + actionRect.bottom - safeBottom);
  });
}

function scrollLeadIntelligenceActionsIntoView(){
  if(!drawerTray || !drawerTray.classList.contains('source-open')) return;
  window.requestAnimationFrame(() => {
    const action = document.querySelector('#source-detail [data-open-scraper]');
    if(!action) return;
    const trayRect = drawerTray.getBoundingClientRect();
    const actionRect = action.getBoundingClientRect();
    const safeBottom = Math.min(window.innerHeight - 18, trayRect.bottom - 18);
    if(actionRect.bottom <= safeBottom && actionRect.top >= trayRect.top + 18) return;
    drawerTray.scrollTop = Math.max(0, drawerTray.scrollTop + actionRect.bottom - safeBottom);
  });
}

async function hydrateDocumentDrawer(){
  currentDocumentItems = documentItemsWithProjectAssignments(localDocumentItems.concat(localStoredDocuments()));
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
    currentDocumentItems = documentItemsWithProjectAssignments(Array.from(byId.values()));
    activeDocumentItem = currentDocumentItems[0] || null;
    renderDocumentFilters();
    renderDocumentBrief(activeDocumentItem);
    renderProjectSuggestions();
  }catch(error){
    if(documentStatus) documentStatus.textContent = 'Document services unavailable; showing local document previews only.';
  }
}

async function scanDocumentIntakeFromGmail(){
  if(!canUseApi){
    if(documentStatus) documentStatus.textContent = 'The live VAL server is needed to scan Gmail documents.';
    return;
  }
  if(documentIntakeScan){
    documentIntakeScan.disabled = true;
    documentIntakeScan.setAttribute('aria-busy', 'true');
  }
  const previousStatus = documentStatus?.textContent || '';
  if(documentStatus) documentStatus.textContent = 'Scanning Gmail for document evidence. No email, document, CRM record, Google Doc, Drive file, or external system is changed.';
  try{
    const result = await postJson('/api/email/gmail/refresh', {days:30, limit:75}, {timeoutMs:45000, timeoutMessage:'Gmail document scan is taking longer than expected.'});
    await hydrateDocumentDrawer();
    const scannedDocuments = documentItemsFromGmailScan(result);
    if(scannedDocuments.length){
      const byId = new Map(scannedDocuments.concat(currentDocumentItems).map((item) => [item.id, item]));
      currentDocumentItems = documentItemsWithProjectAssignments(Array.from(byId.values()));
      persistLocalDocumentItems(scannedDocuments);
      renderDocumentFilters();
      renderDocumentBrief(currentDocumentItems[0] || activeDocumentItem);
      renderProjectSuggestions();
    }
    if(documentStatus) documentStatus.textContent = documentIntakeStatusLine(result);
  }catch(error){
    if(documentStatus) documentStatus.textContent = 'Gmail document scan failed: ' + error.message;
  }finally{
    if(documentIntakeScan){
      documentIntakeScan.disabled = false;
      documentIntakeScan.setAttribute('aria-busy', 'false');
    }
    if(documentStatus && !documentStatus.textContent) documentStatus.textContent = previousStatus;
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
      documentStatus.textContent = 'No source URL is attached yet. Link the CRM record, email thread, upload, or Google Doc before opening externally.';
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
  correspondenceCount.textContent = currentCorrespondenceItems.length ? String(currentCorrespondenceItems.length) : '0';
  correspondenceCount.setAttribute('aria-label', currentCorrespondenceItems.length ? currentCorrespondenceItems.length + ' conversation' + (currentCorrespondenceItems.length === 1 ? '' : 's') + ' waiting' : 'No conversations waiting');
  if(!currentCorrespondenceItems.length){
    const empty = document.createElement('article');
    empty.className = 'empty';
    empty.innerHTML = '<span>No admitted items</span><p>No Gmail conversation has been classified into Executive Inbox yet.</p><div class="correspondence-scan-actions"><button type="button" data-correspondence-scan-days="30">Scan 30 days</button><button type="button" data-correspondence-scan-days="90">Scan 90 days</button></div><p class="correspondence-scan-status" data-correspondence-scan-status></p>';
    const status = empty.querySelector('[data-correspondence-scan-status]');
    if(status) status.textContent = currentCorrespondenceScanStatus || 'Only unread, unresolved executive conversations appear here.';
    empty.querySelectorAll('[data-correspondence-scan-days]').forEach((button) => {
      button.disabled = correspondenceScanInFlight;
      button.setAttribute('aria-busy', String(correspondenceScanInFlight));
    });
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
    label.textContent = item.status === 'needs_context' ? 'Needs Context' : 'Ready';
    const title = document.createElement('strong');
    title.textContent = item.title;
    const summary = document.createElement('p');
    summary.textContent = item.summary;
    const small = document.createElement('small');
    small.textContent = item.context || item.source || '';
    button.append(label, title, summary, small);
    correspondenceList.appendChild(button);
  });
}

function correspondenceSuggestedActions(item = activeCorrespondenceItem){
  const ruleActions = ['show_rules', 'save_forward_rule', 'suggest_rules'];
  if(!item) return ruleActions;
  const actions = ['cowork_correspondence', 'not_executive_contact'].concat(ruleActions);
  if(String(item.draftBody || '').trim()) actions.unshift('send');
  return actions;
}

function scrollCorrespondenceActionsIntoView(){
  if(!drawerTray || !drawerTray.classList.contains('correspondence-open')) return;
  window.requestAnimationFrame(() => {
    const action = document.querySelector('#correspondence-detail [data-correspondence-action]:not([hidden])');
    if(!action) return;
    const trayRect = drawerTray.getBoundingClientRect();
    const actionRect = action.getBoundingClientRect();
    const safeBottom = Math.min(window.innerHeight - 18, trayRect.bottom - 18);
    if(actionRect.bottom <= safeBottom && actionRect.top >= trayRect.top + 18) return;
    drawerTray.scrollTop = Math.max(0, drawerTray.scrollTop + actionRect.bottom - safeBottom);
  });
}

function setCorrespondenceField(field, value){
  const node = document.querySelector('[data-correspondence-field="' + field + '"]');
  if(node) node.textContent = value || '';
}

function renderCorrespondenceThread(item = activeCorrespondenceItem){
  if(!correspondenceThreadBody) return;
  correspondenceThreadBody.innerHTML = '';
  const messages = Array.isArray(item?.threadMessages) ? item.threadMessages.filter((message) => message?.body) : [];
  if(!item){
    const empty = document.createElement('article');
    empty.className = 'correspondence-thread-message';
    const span = document.createElement('span');
    span.textContent = 'No thread selected';
    const p = document.createElement('p');
    p.textContent = 'Choose a conversation to read the email thread.';
    empty.append(span, p);
    correspondenceThreadBody.appendChild(empty);
    return;
  }
  const attachments = Array.isArray(item.attachments) ? item.attachments : correspondenceAttachmentsFromSource(item.raw || {});
  if(attachments.length){
    const attachmentBlock = document.createElement('article');
    attachmentBlock.className = 'correspondence-thread-attachments';
    const span = document.createElement('span');
    span.textContent = 'Attachments';
    const wrap = document.createElement('div');
    attachments.slice(0, 6).forEach((attachment) => {
      const chip = document.createElement('p');
      const size = Number(attachment.size || 0);
      const sizeLabel = size ? ' · ' + Math.round(size / 1024) + ' KB' : '';
      chip.textContent = [attachment.name, attachment.type].filter(Boolean).join(' · ') + sizeLabel;
      wrap.appendChild(chip);
    });
    attachmentBlock.append(span, wrap);
    correspondenceThreadBody.appendChild(attachmentBlock);
  }
  if(!messages.length){
    const empty = document.createElement('article');
    empty.className = 'correspondence-thread-message';
    const span = document.createElement('span');
    span.textContent = 'Thread';
    const p = document.createElement('p');
    p.textContent = item.summary || 'No thread text is attached yet.';
    empty.append(span, p);
    correspondenceThreadBody.appendChild(empty);
    return;
  }
  messages.forEach((message, index) => {
    const article = document.createElement('article');
    article.className = 'correspondence-thread-message' + (index === 0 ? ' newest' : '');
    const span = document.createElement('span');
    span.textContent = [index === 0 ? 'Newest' : 'Earlier', message.from, message.date].filter(Boolean).join(' · ');
    const p = document.createElement('p');
    p.textContent = message.body;
    article.append(span, p);
    correspondenceThreadBody.appendChild(article);
  });
}

function renderCorrespondenceSideList(node, lines, emptyText){
  if(!node) return;
  node.innerHTML = '';
  const values = (Array.isArray(lines) ? lines : []).map((line) => correspondenceCompactText(line, 180)).filter(Boolean);
  if(!values.length){
    const empty = document.createElement('p');
    empty.className = 'correspondence-side-empty';
    empty.textContent = emptyText;
    node.appendChild(empty);
    return;
  }
  values.forEach((line) => {
    const p = document.createElement('p');
    p.textContent = line;
    node.appendChild(p);
  });
}

function correspondenceRuleLabel(rule = {}){
  return correspondenceCompactText(rule.ruleName || rule.rule_name || rule.plainEnglish || rule.confirmationQuestion || 'Email rule', 140);
}

function renderCorrespondenceRulesPanel(){
  if(!correspondenceRulesList) return;
  correspondenceRulesList.innerHTML = '';
  const rules = currentCorrespondenceRules.filter((rule) => rule.isActive !== false);
  if(!rules.length){
    const empty = document.createElement('p');
    empty.className = 'correspondence-side-empty';
    empty.textContent = 'No saved Executive Inbox rules yet.';
    correspondenceRulesList.appendChild(empty);
    return;
  }
  rules.slice(0, 80).forEach((rule) => {
    const article = document.createElement('article');
    const title = document.createElement('strong');
    title.textContent = correspondenceRuleLabel(rule);
    const meta = document.createElement('p');
    const action = rule.actions?.action || rule.actions_json?.action || rule.ruleType || rule.rule_type || 'review';
    const condition = rule.conditions?.from_email || rule.conditions_json?.from_email || rule.conditions?.from_domain || rule.conditions_json?.from_domain || rule.conditions?.subject_contains || rule.conditions_json?.subject_contains || 'Executive Inbox';
    meta.textContent = [String(action).replace(/_/g, ' '), condition].filter(Boolean).join(' · ');
    article.append(title, meta);
    correspondenceRulesList.appendChild(article);
  });
}

function setCorrespondenceRulesPanel(open){
  if(!correspondenceRulesPanel) return;
  correspondenceRulesPanel.hidden = !open;
  correspondenceRulesPanel.setAttribute('aria-hidden', String(!open));
  if(open) renderCorrespondenceRulesPanel();
}

function toggleCorrespondenceRulesPanel(){
  if(!correspondenceRulesPanel) return;
  setCorrespondenceRulesPanel(correspondenceRulesPanel.hidden);
}

function normalizeCorrespondenceRuleSuggestion(suggestion, source = 'val'){
  if(typeof suggestion === 'string'){
    return {text:correspondenceCompactText(suggestion, 220), raw:{plainEnglish:suggestion}, source};
  }
  const text = suggestion?.confirmationQuestion || suggestion?.plainEnglish || suggestion?.ruleName || '';
  return {text:correspondenceCompactText(text, 220), raw:suggestion || {}, source};
}

function correspondenceRuleSuggestionRows(item = activeCorrespondenceItem){
  const itemSuggestions = (item?.ruleSuggestions || []).map((suggestion) => normalizeCorrespondenceRuleSuggestion(suggestion, 'thread'));
  const analyzedSuggestions = currentCorrespondenceRuleSuggestions.map((suggestion) => normalizeCorrespondenceRuleSuggestion(suggestion, 'analysis'));
  return itemSuggestions.concat(analyzedSuggestions).filter((suggestion) => suggestion.text && !dismissedCorrespondenceRuleSuggestions.has(suggestion.text));
}

function renderCorrespondenceRuleSuggestions(item = activeCorrespondenceItem){
  if(!correspondenceRuleSuggestions) return;
  correspondenceRuleSuggestions.innerHTML = '';
  const suggestions = correspondenceRuleSuggestionRows(item);
  if(!suggestions.length){
    const empty = document.createElement('p');
    empty.className = 'correspondence-side-empty';
    empty.textContent = 'No reusable rule suggested yet.';
    correspondenceRuleSuggestions.appendChild(empty);
    return;
  }
  suggestions.forEach((suggestion, index) => {
    const article = document.createElement('article');
    article.className = 'correspondence-rule-suggestion';
    const p = document.createElement('p');
    p.textContent = suggestion.text;
    const actions = document.createElement('div');
    const yes = document.createElement('button');
    yes.type = 'button';
    yes.textContent = 'Yes';
    yes.dataset.correspondenceSuggestionAccept = String(index);
    const no = document.createElement('button');
    no.type = 'button';
    no.textContent = 'No';
    no.dataset.correspondenceSuggestionDismiss = String(index);
    actions.append(yes, no);
    article.append(p, actions);
    correspondenceRuleSuggestions.appendChild(article);
  });
}

function renderCorrespondenceIntelligence(item = activeCorrespondenceItem){
  renderCorrespondenceSideList(correspondenceRelationships, item?.relationships || [], 'No relationship match yet.');
  renderCorrespondenceSideList(correspondenceProjects, item?.projects || [], 'No project match yet.');
  renderCorrespondenceRuleSuggestions(item);
  if(correspondenceRuleStatus){
    const activeCount = currentCorrespondenceRules.filter((rule) => rule.isActive !== false).length;
    correspondenceRuleStatus.textContent = activeCount ? 'View ' + activeCount + ' active rule' + (activeCount === 1 ? '' : 's') : 'No saved rules yet';
  }
  if(correspondenceRulesPanel && !correspondenceRulesPanel.hidden) renderCorrespondenceRulesPanel();
}

function renderCorrespondenceBrief(item = activeCorrespondenceItem){
  activeCorrespondenceItem = item || currentCorrespondenceItems[0] || null;
  renderCorrespondenceList();
  const selected = activeCorrespondenceItem;
  setCorrespondenceField('status', selected ? (selected.status === 'needs_context' ? 'Needs context' : 'Ready') : 'Clear');
  setCorrespondenceField('title', selected?.title || 'No Executive Inbox conversations');
  setCorrespondenceField('summary', selected?.summary || 'VAL has not found a connected Gmail thread that needs executive judgment yet.');
  const hasDraft = !!String(selected?.draftBody || '').trim();
  setCorrespondenceField('draft-title', selected && hasDraft ? 'Reply: ' + (selected.title || 'prepared draft') : 'Reply for review');
  setCorrespondenceField('draft-note', selected && hasDraft ? 'Editable private draft. Nothing sends until approved.' : 'No private draft is waiting for review.');
  renderCorrespondenceThread(selected);
  renderCorrespondenceIntelligence(selected);
  if(correspondenceDraftBody){
    correspondenceDraftBody.value = selected?.draftBody || '';
    correspondenceDraftBody.disabled = !selected;
    correspondenceDraftBody.placeholder = selected ? (hasDraft ? 'Write or edit the reply here.' : 'No draft has been prepared for this conversation yet.') : 'Select a conversation to edit the draft.';
  }
  if(correspondenceSafety) correspondenceSafety.textContent = '';
  document.querySelectorAll('[data-correspondence-action]').forEach((button) => {
    const allowed = correspondenceSuggestedActions(selected).includes(button.dataset.correspondenceAction);
    button.hidden = !allowed;
    button.disabled = !allowed;
    button.setAttribute('aria-hidden', String(!allowed));
  });
  scrollCorrespondenceActionsIntoView();
}

function showCorrespondenceLocalBoundary(action, item = activeCorrespondenceItem){
  if(!item) return;
  const needs = action === 'generate'
    ? 'I can only prepare a fresh saved draft when this item has a live conversation id. This preview already has private draft language ready for review.'
    : action === 'send'
      ? 'This draft needs a recipient and message before it can be sent.'
      : 'I can only tighten a saved draft when this item has a draft id. This preview draft is private preparation inside VAL, and no saved draft record was changed.';
  if(correspondenceSafety){
    correspondenceSafety.textContent = needs;
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
  const body = correspondenceDraftBody?.value || item.draftBody || raw.body || draft.body || item.prepared || '';
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

function correspondenceSuppressionContact(item = activeCorrespondenceItem){
  if(!item) return {};
  const source = item.raw?.sourceContext || item.raw?.source_context || {};
  const conversation = source.conversationContext || {};
  const latestInbound = conversation.latest_inbound || conversation.current_message || {};
  const from = latestInbound.from || latestInbound.sender || {};
  const senderEmail = from.email || source.from?.email || source.senderEmail || source.classification?.from?.email || '';
  const senderName = from.name || source.from?.name || source.senderName || source.classification?.from?.name || '';
  return {
    email: senderEmail || item.recipientEmail || source.recipientEmail || '',
    name: senderName || item.recipientName || source.recipientName || '',
    reason: 'User marked this sender as not an executive contact from the Hearth Executive Inbox.',
    conversationId: item.conversationId || source.conversationId || '',
    threadId: item.threadId || source.threadId || '',
    sourceItemId: item.id || ''
  };
}

function correspondenceExecutionMessage(result = {}){
  if(result.executed){
    return result.packet?.providerResponseSummary || result.receipt?.providerResponseSummary || 'Sent.';
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

function correspondenceRuleEmail(item = activeCorrespondenceItem){
  const email = String(item?.senderEmail || item?.recipientEmail || '').trim();
  const name = String(item?.senderName || item?.title || '').trim();
  return {from:{email,name}};
}

async function hydrateCorrespondenceRules(){
  if(!canUseApi){
    currentCorrespondenceRules = [];
    if(correspondenceRuleStatus) correspondenceRuleStatus.textContent = 'Rules load when VAL is connected';
    renderCorrespondenceIntelligence(activeCorrespondenceItem);
    return;
  }
  try{
    const data = await getJson('/api/email/rules');
    currentCorrespondenceRules = Array.isArray(data.rules) ? data.rules : [];
  }catch(error){
    currentCorrespondenceRules = [];
    if(correspondenceRuleStatus) correspondenceRuleStatus.textContent = 'Rules unavailable';
  }
  renderCorrespondenceIntelligence(activeCorrespondenceItem);
}

function correspondenceRulePayloadFromText(ruleText = '', item = activeCorrespondenceItem){
  const text = String(ruleText || '').trim();
  const email = correspondenceRuleEmail(item);
  const directForwardMatch = text.match(/forward[\s\S]*?from\s+([^\s,;]+@[^\s,;]+)[\s\S]*?\bto\s+([^\s,;]+@[^\s,;]+)/i);
  const selectedForwardMatch = text.match(/\bto\s+([^\s,;]+@[^\s,;]+)/i);
  if(/forward/i.test(text) && (directForwardMatch || (selectedForwardMatch && email.from.email))){
    const fromEmail = directForwardMatch?.[1] || email.from.email;
    const forwardTo = directForwardMatch?.[2] || selectedForwardMatch?.[1] || '';
    return {
      provider:'any',
      ruleName:text,
      ruleType:'forward_sender',
      conditions:{from_email:fromEmail},
      actions:{action:'forward',forward_to:forwardTo,include_summary:true,cc_user:false},
      approvalMode:'review_only',
      confidenceThreshold:'high',
      createdFrom:'executive_inbox_rule_learning',
      createdFromMessageId:item?.messageId || '',
      createdFromThreadId:item?.threadId || ''
    };
  }
  if(/ignore|low priority|downgrade/i.test(text) && email.from.email){
    return {
      provider:'any',
      ruleName:text,
      ruleType:'ignore_sender',
      conditions:{from_email:email.from.email},
      actions:{action:'label',label:'low_priority'},
      approvalMode:'review_only',
      confidenceThreshold:'medium',
      createdFrom:'executive_inbox_rule_learning',
      createdFromMessageId:item?.messageId || '',
      createdFromThreadId:item?.threadId || ''
    };
  }
  return {
    provider:'any',
    ruleName:text,
    ruleType:'plain_english_instruction',
    conditions:email.from.email ? {from_email:email.from.email} : {source:'executive_inbox'},
    actions:{action:'manual_instruction',instruction:text},
    approvalMode:'review_only',
    confidenceThreshold:'medium',
    createdFrom:'executive_inbox_rule_learning',
    createdFromMessageId:item?.messageId || '',
    createdFromThreadId:item?.threadId || ''
  };
}

function correspondenceRulePayloadFromSuggestion(suggestion = {}, item = activeCorrespondenceItem){
  const raw = suggestion.raw || suggestion;
  const text = suggestion.text || raw.confirmationQuestion || raw.plainEnglish || raw.ruleName || '';
  if(raw.conditions || raw.actions || raw.suggestedRuleType){
    return {
      provider:'any',
      ruleName:text,
      ruleType:raw.suggestedRuleType || raw.ruleType || 'suggested_rule',
      conditions:raw.conditions || {},
      actions:raw.actions || {action:'manual_instruction',instruction:text},
      approvalMode:'review_only',
      confidenceThreshold:raw.confidence || 'medium',
      createdFrom:'executive_inbox_val_suggestion',
      createdFromMessageId:item?.messageId || '',
      createdFromThreadId:item?.threadId || ''
    };
  }
  return correspondenceRulePayloadFromText(text, item);
}

async function saveCorrespondenceRulePayload(payload, successText){
  if(!canUseApi){
    if(correspondenceSafety) correspondenceSafety.textContent = 'The local VAL server is needed to save rules. Nothing was changed.';
    return null;
  }
  if(correspondenceSafety) correspondenceSafety.textContent = 'Saving rule. Approval boundaries still apply.';
  const result = await postJson('/api/email/rules', payload);
  if(result.rule) currentCorrespondenceRules = [result.rule].concat(currentCorrespondenceRules.filter((rule) => rule.id !== result.rule?.id));
  if(correspondenceSafety) correspondenceSafety.textContent = successText || 'Saved rule: ' + correspondenceRuleLabel(result.rule || payload) + '.';
  renderCorrespondenceIntelligence(activeCorrespondenceItem);
  return result.rule || payload;
}

async function saveCorrespondenceForwardRule(item = activeCorrespondenceItem){
  const ruleText = String(correspondenceForwardTo?.value || '').trim();
  if(!ruleText){
    if(correspondenceSafety) correspondenceSafety.textContent = 'Type the rule you want VAL to remember.';
    return;
  }
  const payload = correspondenceRulePayloadFromText(ruleText, item);
  const saved = await saveCorrespondenceRulePayload(payload, 'Saved rule: ' + ruleText + '.');
  if(saved && correspondenceForwardTo) correspondenceForwardTo.value = '';
}

async function analyzeCorrespondenceRuleSuggestions(){
  if(!canUseApi){
    if(correspondenceSafety) correspondenceSafety.textContent = 'The local VAL server is needed to analyze rule suggestions.';
    return;
  }
  if(correspondenceSafety) correspondenceSafety.textContent = 'Asking VAL to look for repeatable inbox rules.';
  const result = await postJson('/api/email/rule-suggestions/analyze', {});
  currentCorrespondenceRuleSuggestions = Array.isArray(result.suggestions) ? result.suggestions : [];
  if(correspondenceSafety) correspondenceSafety.textContent = currentCorrespondenceRuleSuggestions.length ? 'VAL found ' + currentCorrespondenceRuleSuggestions.length + ' possible rule' + (currentCorrespondenceRuleSuggestions.length === 1 ? '' : 's') + ' for review.' : 'VAL did not find enough repeated evidence for a new rule yet.';
  renderCorrespondenceIntelligence(activeCorrespondenceItem);
}

async function acceptCorrespondenceRuleSuggestion(index){
  const suggestion = correspondenceRuleSuggestionRows(activeCorrespondenceItem)[index];
  if(!suggestion) return;
  const payload = correspondenceRulePayloadFromSuggestion(suggestion, activeCorrespondenceItem);
  const saved = await saveCorrespondenceRulePayload(payload, 'Saved suggested rule: ' + suggestion.text + '.');
  if(saved){
    dismissedCorrespondenceRuleSuggestions.add(suggestion.text);
    renderCorrespondenceIntelligence(activeCorrespondenceItem);
  }
}

function dismissCorrespondenceRuleSuggestion(index){
  const suggestion = correspondenceRuleSuggestionRows(activeCorrespondenceItem)[index];
  if(!suggestion) return;
  dismissedCorrespondenceRuleSuggestions.add(suggestion.text);
  if(correspondenceSafety) correspondenceSafety.textContent = 'Suggestion dismissed.';
  renderCorrespondenceIntelligence(activeCorrespondenceItem);
}

async function hydrateCorrespondenceDrawer(){
  currentCorrespondenceItems = canUseApi ? [] : localCorrespondenceItems.slice();
  activeCorrespondenceItem = currentCorrespondenceItems[0] || null;
  renderCorrespondenceBrief(activeCorrespondenceItem);
  if(!canUseApi){
    hydrateCorrespondenceRules();
    return;
  }
  try{
    const [ready, drafts, intelligence] = await Promise.all([
      postJson('/api/val/ready-for-you/build', {limit:5}).catch(() => ({items:[]})),
      getJson('/api/val/email/review-drafts?limit=20').catch(() => ({drafts:[]})),
      getJson('/api/email/intelligence?days=30&limit=75').catch(() => ({emails:[]}))
    ]);
    const merged = correspondenceItemsFromReady(ready)
      .concat((drafts.drafts || []).map(normalizeCorrespondenceDraft))
      .concat(correspondenceItemsFromEmailIntelligence(intelligence));
    const byId = new Map();
    merged.forEach((item) => {
      if(item?.id && !byId.has(item.id)) byId.set(item.id, item);
    });
    currentCorrespondenceItems = Array.from(byId.values());
    activeCorrespondenceItem = currentCorrespondenceItems[0] || null;
    renderCorrespondenceBrief(activeCorrespondenceItem);
    await hydrateCorrespondenceRules();
  }catch(error){
    console.warn('[hearth] correspondence drawer unavailable', error.message);
    currentCorrespondenceItems = [];
    activeCorrespondenceItem = null;
    renderCorrespondenceBrief(activeCorrespondenceItem);
    if(correspondenceSafety) correspondenceSafety.textContent = 'Executive Inbox could not load live Gmail-classified conversations. No demo emails are being shown.';
    await hydrateCorrespondenceRules();
  }
}

async function scanCorrespondenceWindow(days = 30){
  const scanDays = Math.max(1, Math.min(90, Number(days) || 30));
  if(!canUseApi){
    currentCorrespondenceScanStatus = 'The local VAL server is needed to scan Gmail.';
    renderCorrespondenceList();
    if(correspondenceSafety) correspondenceSafety.textContent = currentCorrespondenceScanStatus;
    return;
  }
  currentCorrespondenceScanDays = scanDays;
  correspondenceScanInFlight = true;
  currentCorrespondenceScanStatus = 'Scanning the last ' + scanDays + ' days of connected Gmail. Low-priority mail will stay out of Executive Inbox.';
  renderCorrespondenceList();
  if(correspondenceSafety) correspondenceSafety.textContent = currentCorrespondenceScanStatus;
  try{
    const result = await postJson('/api/email/gmail/refresh', {days:scanDays, limit:scanDays >= 90 ? 120 : 75}, {timeoutMs:45000, timeoutMessage:'Gmail scan is taking longer than expected.'});
    currentCorrespondenceItems = correspondenceItemsFromEmailIntelligence(result);
    activeCorrespondenceItem = currentCorrespondenceItems[0] || null;
    currentCorrespondenceScanStatus = currentCorrespondenceItems.length
      ? 'Found ' + currentCorrespondenceItems.length + ' Executive Inbox item' + (currentCorrespondenceItems.length === 1 ? '' : 's') + ' in the last ' + scanDays + ' days.'
      : 'Scanned the last ' + scanDays + ' days. No unread Gmail threads crossed the Executive Inbox judgment gate.';
    correspondenceScanInFlight = false;
    renderCorrespondenceBrief(activeCorrespondenceItem);
    if(correspondenceSafety){
      correspondenceSafety.textContent = currentCorrespondenceScanStatus;
    }
  }catch(error){
    correspondenceScanInFlight = false;
    currentCorrespondenceScanStatus = 'Gmail scan failed: ' + error.message;
    renderCorrespondenceList();
    if(correspondenceSafety) correspondenceSafety.textContent = currentCorrespondenceScanStatus;
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
  if(action === 'show_rules'){
    toggleCorrespondenceRulesPanel();
    return;
  }
  const item = activeCorrespondenceItem;
  if(action === 'save_forward_rule'){
    await saveCorrespondenceForwardRule(item);
    return;
  }
  if(action === 'suggest_rules'){
    await analyzeCorrespondenceRuleSuggestions();
    return;
  }
  if(!item) return;
  if(action === 'not_executive_contact'){
    const contact = correspondenceSuppressionContact(item);
    if(!contact.email && !contact.name){
      if(correspondenceSafety) correspondenceSafety.textContent = 'VAL needs an email or name before it can suppress this sender. Nothing was changed.';
      return;
    }
    if(canUseApi){
      await postJson('/api/val/executive-inbox/not-executive-contact', contact);
    }
    currentCorrespondenceItems = currentCorrespondenceItems.filter((row) => row.id !== item.id);
    activeCorrespondenceItem = currentCorrespondenceItems[0] || null;
    renderCorrespondenceBrief(activeCorrespondenceItem);
    if(correspondenceSafety) correspondenceSafety.textContent = 'Marked ' + (contact.name || contact.email) + ' as not an executive contact.';
    return;
  }
  if(action === 'cowork_correspondence'){
    openContextualCoworkSession({
      returnTarget: 'correspondence',
      title: 'Co-Work with VAL about this reply.',
      meaning: item.whyNow || item.summary || 'This Co-Work space is scoped to the selected Executive Inbox item.',
      context: [
        'Prepared item: ' + (item.title || 'Reply draft'),
        'Relationship/project: ' + (item.context || 'Context is still being resolved.'),
        'Newest thread: ' + (item.threadMessages?.[0]?.body || item.summary || 'Thread context is still being resolved.'),
        'VAL prepared: ' + (item.prepared || 'Draft context is available.'),
        'Needs from user: ' + (item.needs || 'Review before external use.')
      ],
      recommendation: 'Use this to tune voice, decide whether to send, add missing context, or reshape the reply before approval.',
      placeholder: 'What should VAL help you decide or rewrite about this reply?',
      helper: '',
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
      if(correspondenceSafety) correspondenceSafety.textContent = 'Sending...';
      let sendResult;
      try{
        sendResult = await postJson('/api/val/external-actions/email-send-now', {...payload, approvalNote:'Sent from Executive Inbox.'});
      }catch(executeError){
        sendResult = executeError.data || {ok:false,error:executeError.message};
      }
      if(sendResult.ok && sendResult.executed){
        currentCorrespondenceItems = currentCorrespondenceItems.filter((row) => row.id !== item.id);
        activeCorrespondenceItem = currentCorrespondenceItems[0] || null;
        renderCorrespondenceBrief(activeCorrespondenceItem);
        if(correspondenceSafety) correspondenceSafety.textContent = correspondenceExecutionMessage(sendResult);
        return;
      }
      if(correspondenceSafety) correspondenceSafety.textContent = correspondenceExecutionMessage(sendResult);
    }
  }catch(error){
    if(correspondenceSafety) correspondenceSafety.textContent = 'Send failed: ' + error.message;
  }
}

async function runCorrespondenceActionClick(correspondenceAction, event){
  if(!correspondenceAction) return false;
  if(event){
    event.preventDefault();
    event.stopPropagation();
    if(typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
  }
  const correspondenceActionId = correspondenceAction.dataset.correspondenceAction;
  const drawerUtilityAction = ['show_rules', 'save_forward_rule', 'suggest_rules'].includes(correspondenceActionId);
  if(drawerUtilityAction && !activeCorrespondenceItem){
    await handleCorrespondenceAction(correspondenceActionId);
    return true;
  }
  const inspectOnlyAction = ['cowork_correspondence', 'not_executive_contact', 'show_rules', 'save_forward_rule', 'suggest_rules'].includes(correspondenceActionId);
  const preflight = await ensureHearthClickPacket({node:correspondenceAction, packetName:'email_packet', action:correspondenceActionId, allowBlockedForInspection:inspectOnlyAction, source:{email:activeCorrespondenceItem || null, sourceId:activeCorrespondenceItem?.id || '', sourceType:'executive_inbox_item', sourceLabel:activeCorrespondenceItem?.title || 'Executive Inbox action', sourceItem:activeCorrespondenceItem || null}});
  if(!preflight.ok) return true;
  await handleCorrespondenceAction(correspondenceActionId);
  return true;
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

function commitmentSummaryFromItems(items = currentCommitmentItems){
  return items.reduce((summary, item) => {
    if(!item || ['complete','dismissed'].includes(item.status)) return summary;
    if(item.owner_type === 'user') summary.you_owe += 1;
    if(item.owner_type === 'contact') summary.others_owe_you += 1;
    if(item.status === 'overdue') summary.overdue += 1;
    if(item.status === 'drafted' || item.draft_id || item.task_id) summary.ready_for_approval += 1;
    return summary;
  }, {you_owe:0, others_owe_you:0, overdue:0, ready_for_approval:0});
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
  scrollCommitmentActionsIntoView();
}

function scrollCommitmentActionsIntoView(){
  if(!drawerTray || !drawerTray.classList.contains('commitment-open')) return;
  window.requestAnimationFrame(() => {
    const action = document.querySelector('#commitment-detail [data-commitment-action]:not([hidden])');
    if(!action) return;
    const trayRect = drawerTray.getBoundingClientRect();
    const actionRect = action.getBoundingClientRect();
    const safeBottom = Math.min(window.innerHeight - 18, trayRect.bottom - 18);
    if(actionRect.bottom <= safeBottom && actionRect.top >= trayRect.top + 18) return;
    drawerTray.scrollTop = Math.max(0, drawerTray.scrollTop + actionRect.bottom - safeBottom);
  });
}

async function hydrateCommitmentDrawer(){
  currentCommitmentItems = localCommitmentItems.slice();
  activeCommitmentItem = currentCommitmentItems[0] || null;
  updateCommitmentSummary(commitmentSummaryFromItems(currentCommitmentItems));
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
      updateCommitmentSummary(commitmentSummaryFromItems(currentCommitmentItems));
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

function openProjectCoworkSession(node = null){
  return openProjectScopedCowork('project_overview', node, {mode:'project_cowork'});
}

function openContextualCoworkSession({returnTarget = 'home', title, meaning, context = [], recommendation, placeholder, helper, backWorkflow, initialValue = '', heading, detail, publicDetail, lockContext = false}){
  const safeTitle = title || 'VAL workspace';
  activeCoworkHeldContext = [initialValue, safeTitle, meaning, recommendation, helper, ...context].filter(Boolean).join('\n');
  activeCoworkContextLocked = Boolean(lockContext);
  setWorkspaceContent({
    lens: 'Co-Work with VAL',
    title: safeTitle,
    meaning: meaning || 'VAL is holding the relevant context privately.',
    understanding: ['VAL is holding the relevant context privately.', 'Nothing external happens without approval.'],
    recommendation: recommendation || 'Use this to think, draft, decide, or give VAL the missing context before action.',
    actions: [],
    label: 'Home Co-Work with VAL approval workspace',
    suppressClarityStandard: true
  });
  deskWorkspace.classList.add('home-cowork-mode');
  renderHomeCoworkPreview({
    heading: heading || contextualCoworkHeading(safeTitle),
    detail: publicDetail || detail || coworkPublicDetail(returnTarget),
    placeholder: placeholder || 'What should VAL help you think through here?'
  });
  openWorkspaceShell('Home Co-Work with VAL approval workspace', {returnTarget, keepDrawerOpen:true});
}

async function handleProjectAction(action){
  const project = activeProjectProfile || projectProfiles.frisson;
  if(action === 'cowork_project'){
    await openProjectCoworkSession();
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
        {label:'Ask what matters now', projectAction:'ask_priority'},
        {label:'Show alternatives', projectAction:'show_alternatives'}
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
        {label:'Open project file', projectAction:'open_project_file'},
        {label:'Show alternatives', projectAction:'show_alternatives'}
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
        {label:'Ask what matters now', projectAction:'ask_priority'},
        {label:'Open project file', projectAction:'open_project_file'}
      ]
    });
  }
}

async function handleProjectActionClick(actionId = '', node = null){
  const preflight = await ensureHearthClickPacket({node, packetName:'project_packet', action:actionId, allowBlockedForInspection:true, source:projectSource(activeProjectProfile, actionId)});
  if(!preflight.ok) return;
  lastHearthPacketReceipt = preflight.packet || lastHearthPacketReceipt;
  renderDrawerPacketReceiptStrip(lastHearthPacketReceipt);
  await handleProjectAction(actionId);
}

function renderRelationshipProfile(profileId = 'aric', providedProfile = null){
  const profile = relationshipProfileWithPersonPacket({...(providedProfile || relationshipProfiles[profileId] || relationshipProfiles.aric), profileId});
  const stewardship = relationshipStewardshipUi(profile);
  const needs = Array.isArray(profile.packetNeeds) && profile.packetNeeds.length ? profile.packetNeeds : (Array.isArray(profile.openLoops) ? profile.openLoops : []);
  const offers = Array.isArray(profile.packetOffers) && profile.packetOffers.length ? profile.packetOffers : (Array.isArray(profile.valueTheyCreate) ? profile.valueTheyCreate : []);
  profile.stewardshipStatus = stewardship.status;
  profile.stewardshipAboutLabel = 'Who this person is';
  profile.stewardshipAboutTitle = profile.stewardshipStatus || 'Relationship context';
  profile.stewardshipAbout = [
    profile.stewardshipAbout || profile.evidence || profile.signal || '',
    stewardship.statusMeaning ? 'Status: ' + stewardship.statusMeaning : ''
  ].filter(Boolean).join(' ');
  profile.stewardshipValueLabel = 'What they need';
  profile.stewardshipValueTitle = needs.length ? 'Source-backed needs and open gaps' : 'No source-backed need is ready yet';
  profile.stewardshipNeedLabel = 'What they offer';
  profile.stewardshipNeedTitle = offers.length ? 'Source-backed offers and strengths' : 'No source-backed offer is ready yet';
  profile.peopleWhoNeedThem = needs.length ? needs : [stewardship.whatIsOpen || 'No current open matter is ready.'];
  profile.peopleTheyShouldMeet = offers.length ? offers : [stewardship.nextMove || 'No move right now.'];
  profile.keyFacts = [
    stewardship.status,
    stewardship.whyNow,
    profile.personPacketMaturity ? 'Understanding: ' + profile.personPacketMaturity : ''
  ].filter(Boolean);
  profile.openLoops = [stewardship.whatIsOpen].filter(Boolean);
  profile.executiveAdvice = [
    'Recommended move: ' + stewardship.nextMove,
    'Why now: ' + stewardship.whyNow
  ].filter(Boolean);
  profile.recentActivity = [stewardship.evidencePosture].filter(Boolean);
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
  renderRelationshipPrimaryActions(profile);
  renderRelationshipSectionActions(profile);
  renderRelationshipDossierSections(profile);
  renderRelationshipTemperatureReview(profile);
  hydrateRelationshipProjectLinks(profile);
  hydrateRelationshipDocuments(profile);
  setRelationshipDetailMode('brief');
  ensureRelationshipProfileReceipt(profile);
}

function relationshipProfileReceiptPacket(profile = activeRelationshipProfile){
  const source = relationshipSource(profile, 'relationship:open_profile', '');
  const sourceLabel = source.sourceLabel || profile?.name || 'Relationship';
  return {
    ok:true,
    status:'not_checked',
    packetName:'relationship_packet',
    source,
    click:{action:'relationship:open_profile'},
    receipt:{
      id:'relationship_packet_' + Date.now().toString(36),
      sourceReceipts:[{label:sourceLabel, sourceType:'relationship_profile', key:source.sourceId || profile?.profileId || sourceLabel}],
      downstreamConsumers:['relationship_brief','project_packet','email_packet','home_source_packet'],
      summary:'This Relationship brief is showing a source-scoped client packet while live hydration is unavailable or mismatched.'
    }
  };
}

function ensureRelationshipProfileReceipt(profile = activeRelationshipProfile){
  if(!profile?.name || !drawerPacketReceipt || drawerPacketReceipt.hidden) return;
  const currentReceipt = drawerPacketReceipt.textContent || '';
  if(currentReceipt.includes(profile.name)) return;
  const packet = relationshipProfileReceiptPacket(profile);
  lastHearthPacketReceipt = packet;
  renderDrawerPacketReceiptStrip(packet);
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

function relationshipCleanSourceText(value = '', limit = 180){
  let text = String(value || '').replace(/\s+/g, ' ').trim();
  text = text.replace(/\bGHL\b/g, 'CRM');
  if(!text) return '';
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  if(sentences.length > 1) text = sentences.slice(0, 2).join(' ');
  if(text.length > limit) text = text.slice(0, limit - 1).trim().replace(/[,\s;:]+$/g, '') + '...';
  return text;
}

function relationshipItemText(item = {}, limit = 180){
  if(item == null) return '';
  if(typeof item === 'string') return relationshipCleanSourceText(item, limit);
  return relationshipCleanSourceText(item.summary || item.content || item.text || item.reason || item.note || item.title || item.rawText || '', limit);
}

function relationshipEvidenceItemsFromDossier(dossier = {}){
  const brief = dossier.relationshipBrief || {};
  const currentReality = brief.currentReality || {};
  const observation = dossier.observation || {};
  const sourceRefs = Array.isArray(dossier.sourceRefs) ? dossier.sourceRefs : [];
  const raw = []
    .concat(Array.isArray(observation.evidence) ? observation.evidence : [])
    .concat(Array.isArray(currentReality.timeline) ? currentReality.timeline : [])
    .concat(sourceRefs.map((ref) => ({
      type: ref.source_type || ref.sourceType || ref.type || 'source',
      title: ref.source_id || ref.sourceId || '',
      summary: ref.quote_or_summary || ref.summary || ref.text || '',
      confidence: ref.confidence
    })));
  const seen = new Set();
  return raw.map((item) => {
    const type = relationshipCleanSourceText(item.type || item.sourceType || item.source || 'source', 40).toLowerCase();
    const title = relationshipCleanSourceText(item.title || item.subject || item.name || item.sourceId || item.source_id || '', 90);
    const summary = relationshipItemText(item, 190);
    const date = item.date || item.createdAt || item.created_at || item.lastObservedAt || item.occurredAt || '';
    const key = [type, title, summary].join('|').toLowerCase();
    if(!summary || seen.has(key)) return null;
    seen.add(key);
    return {type:type || 'source', title, summary, date};
  }).filter(Boolean).slice(0, 12);
}

function relationshipSourceCounts(items = []){
  return items.reduce((counts, item) => {
    const type = String(item.type || 'source').toLowerCase();
    const bucket = /mail|gmail|email/.test(type) ? 'email' : (/transcript|meeting/.test(type) ? 'transcript' : (/task|commitment|loop/.test(type) ? 'task' : (/memory|note/.test(type) ? 'memory' : 'source')));
    counts[bucket] = (counts[bucket] || 0) + 1;
    return counts;
  }, {});
}

function relationshipCountLine(counts = {}){
  const labels = [
    ['transcript', 'transcript'],
    ['email', 'email'],
    ['task', 'task'],
    ['memory', 'memory'],
    ['source', 'source']
  ];
  return labels
    .filter(([key]) => counts[key])
    .map(([key, label]) => counts[key] + ' ' + label + (counts[key] === 1 ? '' : 's'))
    .join(', ');
}

function relationshipDateLabel(value = ''){
  if(!value) return '';
  const date = new Date(value);
  if(Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, {month:'short', day:'numeric'});
}

function relationshipEvidenceLine(item = {}){
  const type = String(item.type || 'source').replace(/_/g, ' ');
  const title = item.title ? item.title + ': ' : '';
  const date = relationshipDateLabel(item.date);
  return [date, type].filter(Boolean).join(' · ') + (date || type ? ' · ' : '') + title + item.summary;
}

function relationshipOpenLoopLines(dossier = {}, fallback = {}, limit = 5){
  const observation = dossier.observation || {};
  const understanding = dossier.relationshipUnderstanding || {};
  const raw = []
    .concat(Array.isArray(understanding.open_loops) ? understanding.open_loops : [])
    .concat(Array.isArray(observation.openLoops) ? observation.openLoops : [])
    .concat(Array.isArray(fallback.openLoops) ? fallback.openLoops : []);
  const seen = new Set();
  return raw.map((item) => relationshipItemText(item, 150)).filter((line) => {
    const key = line.toLowerCase();
    if(!line || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, limit);
}

function relationshipProjectLines(evidence = [], fallback = {}){
  const haystack = evidence.map((item) => [item.title, item.summary].filter(Boolean).join(' ')).join(' ');
  const projects = [];
  if(/\bgoall\b|goallprogram/i.test(haystack)) projects.push('GOALL relationship work');
  if(/\bfrisson\b/i.test(haystack)) projects.push('Frisson partner work');
  if(/\bgrace ai\b/i.test(haystack)) projects.push('Grace AI touchpoint');
  if(Array.isArray(fallback.projectLinks)){
    fallback.projectLinks.forEach((project) => {
      const name = project.name || project.title || project.projectName || '';
      if(name) projects.push(name);
    });
  }
  return Array.from(new Set(projects)).slice(0, 5);
}

function relationshipUnderstandingList(value, fallback = [], limit = 5){
  const raw = Array.isArray(value) ? value : (value ? [value] : fallback);
  const seen = new Set();
  return raw.map((item) => {
    if(typeof item === 'string') return relationshipCleanSourceText(item, 180);
    if(item && typeof item === 'object'){
      return relationshipCleanSourceText(item.summary || item.contribution || item.visible_event || item.deeper_influence || item.text || item.title || item.name || '', 180);
    }
    return '';
  }).filter((line) => {
    const key = line.toLowerCase();
    if(!line || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, limit);
}

function relationshipUnderstandingTimeline(understanding = {}, evidenceLines = []){
  const timeline = understanding.meaning_timeline || {};
  const sections = [
    ['Current season', timeline.current_season],
    ['Open future', timeline.open_future],
    ['Turning point', timeline.breakthroughs_or_turning_points],
    ['Beginning', timeline.beginning]
  ];
  const lines = sections.flatMap(([label, items]) => relationshipUnderstandingList(items, [], 3).map((item) => label + ': ' + item));
  return lines.length ? lines.slice(0, 5) : evidenceLines.slice(0, 5);
}

function relationshipNetworkMatchList(value = [], fallback = []){
  const raw = Array.isArray(value) && value.length ? value : fallback;
  const seen = new Set();
  return (Array.isArray(raw) ? raw : []).map((item) => {
    if(typeof item === 'string') return relationshipCleanSourceText(item, 180);
    if(item && typeof item === 'object'){
      const name = relationshipCleanSourceText(item.name || item.person || item.title || '', 72);
      const reason = relationshipCleanSourceText(item.reason || item.why || item.need_met || item.offer_matched || item.summary || '', 180);
      if(name && reason) return name + ' - ' + reason;
      return name || reason;
    }
    return '';
  }).filter((line) => {
    const key = line.toLowerCase();
    if(!line || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 5);
}

function relationshipStewardshipNetwork(understanding = {}, fallback = {}){
  const network = understanding.stewardship_network || {};
  const review = fallback.introReview || {};
  const about = network.about || {};
  const name = understanding.display_name || fallback.name || 'This person';
  const role = about.title || fallback.role || fallback.identity || 'Relationship context';
  const summary = about.summary || understanding.one_sentence_understanding || fallback.meaning || fallback.evidence || 'VAL needs stronger source evidence before naming what this person carries in the network.';
  return {
    aboutTitle: role,
    about: relationshipCleanSourceText(summary, 240),
    peopleWhoNeedThem: relationshipNetworkMatchList(network.people_who_need_them, review.whoNeedsThisPerson || []),
    peopleTheyShouldMeet: relationshipNetworkMatchList(network.people_they_should_meet, review.whoThisPersonNeeds || []),
    noMatchReason: network.no_match_reason || 'No confident stewardship move is ready yet.',
    name
  };
}

function relationshipVisibleActions(actions = []){
  const hidden = new Set([
    'open_full_file',
    'teach_identity',
    'teach_current_read',
    'teach_what_changed',
    'teach_pattern',
    'teach_wisdom',
    'teach_certainty',
    'teach_executive_advice',
    'teach_risk',
    'teach_open_loops',
    'teach_mutual_value',
    'teach_living_narrative',
    'teach_timeline',
    'teach_recent_activity',
    'teach_related_work',
    'teach_notes_to_see',
    'ask_what_changed',
    'ask_about_pattern',
    'ask_why_matters'
  ]);
  return (Array.isArray(actions) ? actions : []).filter((action) => action && !hidden.has(action.id));
}

function relationshipVisibleSectionActions(sections = {}){
  const next = {};
  Object.entries(sections || {}).forEach(([section, actions]) => {
    const visible = relationshipVisibleActions(actions);
    if(visible.length) next[section] = visible;
  });
  return next;
}

function relationshipProfileFromDossier(dossier = {}, fallback = {}){
  const brief = dossier.relationshipBrief || {};
  const understanding = dossier.relationshipUnderstanding || {};
  const currentRelationship = understanding.current_relationship || {};
  const stewardshipNetwork = relationshipStewardshipNetwork(understanding, fallback);
  const stewardship = understanding.stewardship || {};
  const mutualValue = understanding.mutual_value || {};
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
  const actionItems = relationshipVisibleActions(actions.items);
  const openAction = actionItems.find((action) => action.id === 'open_full_file');
  const evidenceItems = relationshipEvidenceItemsFromDossier(dossier);
  const sourceCounts = relationshipSourceCounts(evidenceItems);
  const sourceLine = relationshipCountLine(sourceCounts);
  const openLoops = relationshipOpenLoopLines(dossier, fallback);
  const recentActivity = evidenceItems.slice(0, 5).map(relationshipEvidenceLine);
  const relatedWork = relationshipProjectLines(evidenceItems, fallback);
  const identityUnresolved = dossier.identityResolution?.status === 'unresolved' || !identity.crmContactId;
  const sourceReceiptsList = evidenceItems.slice(0, 4).map((item) => [item.type.replace(/_/g, ' '), item.title || relationshipDateLabel(item.date), item.summary].filter(Boolean).join(' · '));
  const executiveSummary = evidenceItems.length
    ? (sourceLine ? 'VAL found recent relationship context across ' + sourceLine + '.' : 'VAL found recent relationship context.')
    : 'VAL has not found enough recent source context yet.';
  const reminder = understanding.thirty_second_truth || (evidenceItems.length
    ? (identityUnresolved
      ? 'VAL found source evidence, but the CRM identity must be linked before VAL merges or acts.'
      : 'Use the latest relationship moments and open loops before reaching out.')
    : 'Do not treat this relationship as action-ready until VAL has source context.');
  const pattern = understanding.who_they_are_becoming_in_the_users_world || (openLoops.length
    ? 'Open loops are present. Keep the next move tied to the actual commitment, not a generic follow-up.'
    : (evidenceItems.length ? 'Recent activity is visible. Review the source trail before deciding whether anything needs action.' : 'No durable pattern is visible yet.'));
  const oneTruth = understanding.truth_to_remember || understanding.what_to_remember_next_time || (identityUnresolved
    ? 'This is review-only until the CRM identity is clean.'
    : 'The source trail below is the truth to use before drafting, scheduling, or updating CRM.');
  const latestLinkedInPost = Array.isArray(sourceReceipts.linkedInLatestPosts) && sourceReceipts.linkedInLatestPosts.length
    ? sourceReceipts.linkedInLatestPosts[0]
    : null;
  const observerReceiptLine = Array.isArray(sourceReceipts.observers) && sourceReceipts.observers.length
    ? sourceReceipts.observers.map((observer) => [observer.label || observer.id, observer.status].filter(Boolean).join(' ')).join(' · ')
    : fallback.sourceReceipts || 'CRM contact required before observers can merge relationship context.';
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
    temperature: currentRelationship.temperature || fallback.temperature || '',
    relationshipState: currentRelationship.lifecycle || fallback.relationshipState || '',
    relationshipStateLabel: currentRelationship.strategic_importance ? currentRelationship.strategic_importance + ' importance' : (fallback.relationshipStateLabel || ''),
    trajectory: currentRelationship.health || fallback.trajectory || '',
    trustLevel: currentRelationship.trust_level || fallback.trustLevel || '',
    temperatureMeaning: fallback.temperatureMeaning || '',
    temperatureObservers: fallback.temperatureObservers || [],
    temperatureScoreRange: fallback.temperatureScoreRange || [],
    temperatureEvidence: fallback.temperatureEvidence || [],
    temperatureConflict: fallback.temperatureConflict || null,
    identity: [briefIdentity.company || identity.company, briefIdentity.status || identity.status, (briefIdentity.tags || identity.tags)?.slice?.(0, 2)?.join(' / ')].filter(Boolean).join(' · ') || fallback.identity || '',
    contact: [identity.email, briefIdentity.company || identity.company, briefIdentity.crmContactId ? 'CRM ' + briefIdentity.crmContactId : ''].filter(Boolean).join(' · ') || fallback.contact || '',
    stewardshipAboutLabel: 'Who ' + (briefIdentity.name || identity.name || fallback.name || 'this person') + ' is',
    stewardshipAboutTitle: stewardshipNetwork.aboutTitle,
    stewardshipAbout: stewardshipNetwork.about,
    stewardshipValueLabel: 'Who needs ' + (briefIdentity.name || identity.name || fallback.name || 'this person'),
    stewardshipValueTitle: (briefIdentity.name || identity.name || fallback.name || 'This person') + ' has what these people need',
    stewardshipNeedLabel: 'Who ' + (briefIdentity.name || identity.name || fallback.name || 'this person') + ' should meet',
    stewardshipNeedTitle: 'These people may have what ' + (briefIdentity.name || identity.name || fallback.name || 'this person') + ' needs',
    wisdom: reminder,
    evidence: understanding.one_sentence_understanding || executiveSummary,
    patterns: pattern,
    meaning: understanding.why_this_relationship_matters || (relatedWork.length ? 'This relationship is connected to ' + relatedWork.join(', ') + '.' : (relationshipCleanSourceText(strategicImportance.summary || meaning.whyItMatters || meaning.executiveValue, 180) || 'Strategic importance is not established yet.')),
    certainty: oneTruth,
    linkedinSignal: latestLinkedInPost ? (latestLinkedInPost.summary || latestLinkedInPost.title || latestLinkedInPost.text || 'LinkedIn has a recent signal worth reviewing.') : (fallback.linkedinSignal || 'LinkedIn is being watched for useful public context.'),
    sourceReceipts: observerReceiptLine,
    keyFacts: [
      sourceLine ? 'Sources found: ' + sourceLine : 'No recent source context loaded yet',
      openLoops.length ? openLoops.length + ' open loop' + (openLoops.length === 1 ? '' : 's') : '',
      identityUnresolved ? 'CRM identity needs review' : 'CRM identity linked'
    ].filter(Boolean),
    whatChanged: relationshipUnderstandingList(understanding.what_changed, recentActivity.slice(0, 4), 5),
    executiveAdvice: relationshipUnderstandingList([stewardship.responsibility, stewardship.what_to_protect, stewardship.what_not_to_force].filter(Boolean), openLoops.length ? ['Review the open loop before reaching out.'] : ['No action-ready outreach is recommended from this relationship brief yet.'], 4),
    activeThreads: relationshipUnderstandingList(understanding.active_threads, relatedWork.length ? relatedWork : recentActivity.slice(0, 3), 5),
    openLoops: openLoops.length ? openLoops : ['No concrete open loop is visible yet.'],
    valueUserCreates: relationshipUnderstandingList(mutualValue.value_for_them, ['Context, follow-through, and thoughtful relationship stewardship.'], 4),
    valueTheyCreate: relationshipUnderstandingList(mutualValue.value_from_them || mutualValue.shared_value, relatedWork.length ? ['Momentum or decision context for ' + relatedWork.join(', ') + '.'] : ['Not enough evidence yet to name the mutual value.'], 4),
    timeline: relationshipUnderstandingTimeline(understanding, recentActivity),
    recentActivity: relationshipUnderstandingList(understanding.evidence, recentActivity, 5),
    relatedWork: relatedWork.length ? relatedWork : ['No linked project surfaced from the current evidence.'],
    notesToSee: relationshipUnderstandingList(understanding.what_might_surprise_you ? [understanding.what_might_surprise_you] : [], sourceReceiptsList.length ? sourceReceiptsList : ['No source note is ready for review yet.'], 5),
    peopleWhoNeedThem: stewardshipNetwork.peopleWhoNeedThem.length ? stewardshipNetwork.peopleWhoNeedThem : [stewardshipNetwork.noMatchReason],
    peopleTheyShouldMeet: stewardshipNetwork.peopleTheyShouldMeet.length ? stewardshipNetwork.peopleTheyShouldMeet : [stewardshipNetwork.noMatchReason],
    risk: relationshipUnderstandingList(understanding.risks_or_sensitivities, [], 1)[0] || (identityUnresolved ? 'Identity needs review before VAL merges relationship context.' : 'No specific relationship risk is visible in the current source trail.'),
    livingNarrative: understanding.living_narrative || (evidenceItems.length ? executiveSummary + (openLoops.length ? ' The next useful move is to close or clarify the open loop.' : '') : 'The relationship story is not ready until sources are attached.'),
    projectLinks: Array.isArray(fallback.projectLinks) ? fallback.projectLinks : [],
    href: openAction?.route || './dashboard.html?view=relationships&targetType=person&targetId=' + encodeURIComponent(identity.id || fallback.query?.targetId || fallback.name || 'relationship'),
    actions: actionItems,
    sectionActions: relationshipVisibleSectionActions(actions.sections || {})
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
    note: 'Created from Relationship file identity gate after CRM lookup did not return a canonical contact ID.'
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
    identity: 'Not organized in CRM yet',
    contact: email || 'No canonical CRM contact ID is attached.',
    stewardshipAboutLabel: 'Who this person is',
    stewardshipAboutTitle: 'Contact match needed',
    stewardshipAbout: 'VAL needs the right CRM contact match before it can safely show network opportunities.',
    stewardshipValueLabel: 'Who needs this person',
    stewardshipValueTitle: 'No introduction ready',
    stewardshipNeedLabel: 'Who this person should meet',
    stewardshipNeedTitle: 'No introduction ready',
    peopleWhoNeedThem: ['Review the contact match before VAL recommends introductions.'],
    peopleTheyShouldMeet: ['Review the contact match before VAL recommends introductions.'],
    wisdom: 'Link the right person once so VAL can safely bring the full relationship into view.',
    evidence: 'VAL found possible relationship context, but it is holding that context until identity is clean.',
    patterns: matches.length ? matches.slice(0, 2).map((match) => [match.name, match.email, match.source].filter(Boolean).join(' · ')).join(' | ') : 'No confident CRM match was returned.',
    meaning: 'This prevents transcripts, calendar attendees, emails, and notes from overlapping the wrong person.',
    certainty: 'Once this person is linked, VAL can merge meetings, transcripts, emails, projects, and open commitments without overlapping the wrong person.',
    href: '#',
    actions: [
      {id:'search_ghl_contacts',label:'Find matching person',type:'identity_gate',willDo:'Show possible CRM matches returned by VAL.',willNotDo:'No person will be created or merged.'},
      {id:'review_new_contact_candidate',label:'Review person link',type:'identity_gate',willDo:'Review a new CRM person link before creation.',willNotDo:'VAL will not create a person without review.'}
    ],
    sectionActions: {},
    contactCandidate:{payload:contactCandidatePayloadFromRelationship({...fallback,name,query:{...(fallback.query||{}),email}})}
  };
}

function relationshipProfileWithIdentityWarning(data = {}, fallback = {}){
  const warning = relationshipProfileFromUnresolvedIdentity(data, fallback);
  return {
    ...fallback,
    unresolvedIdentityWarning: warning,
    sectionActions: fallback.sectionActions || {},
    actions: Array.isArray(fallback.actions) && fallback.actions.length ? fallback.actions : warning.actions,
    contactCandidate: warning.contactCandidate
  };
}

function relationshipFallbackHasCanonicalEvidence(profile = {}){
  return Boolean(
    profile && !profile.unresolvedIdentity && (
      profile.sourceEvidence ||
      profile.relationshipState ||
      profile.relationshipStateLabel ||
      profile.temperatureEvidence?.length ||
      profile.confidence ||
      profile.summary ||
      profile.evidence ||
      profile.wisdom
    )
  );
}

function relationshipDossierMatchesFallback(dossier = {}, fallback = {}){
  const expectedName = String(fallback.name || fallback.query?.name || '').trim().toLowerCase();
  const expectedEmail = String(fallback.query?.email || fallback.email || '').trim().toLowerCase();
  const identity = dossier.identity || {};
  const briefIdentity = dossier.relationshipBrief?.identity || {};
  const returnedName = String(identity.name || briefIdentity.name || '').trim().toLowerCase();
  const returnedEmail = String(identity.email || briefIdentity.email || '').trim().toLowerCase();
  if(expectedEmail && returnedEmail) return expectedEmail === returnedEmail;
  if(!expectedName || !returnedName) return false;
  return expectedName === returnedName;
}

function renderRelationshipList(name = '', items = []){
  const target = document.querySelector('[data-relationship-list="' + name + '"]');
  if(!target) return;
  const normalized = Array.isArray(items) ? items.filter(Boolean) : String(items || '').split(/\n|;/).map((item) => item.trim()).filter(Boolean);
  if(!normalized.length){
    target.innerHTML = '<li>No signal loaded yet.</li>';
    return;
  }
  const tag = target.tagName.toLowerCase() === 'ol' ? 'li' : 'li';
  target.innerHTML = normalized.map((item) => '<' + tag + '>' + escapeHtml(String(item)) + '</' + tag + '>').join('');
}

function relationshipHasAny(profile = {}, keys = []){
  return keys.some((key) => {
    const value = profile[key];
    if(Array.isArray(value)) return value.length > 0;
    if(value && typeof value === 'object') return Object.keys(value).length > 0;
    return !!String(value || '').trim();
  });
}

function renderRelationshipDossierSections(profile = {}){
  const listFallbacks = {
    keyFacts: [profile.relationshipStateLabel || profile.relationshipState, profile.temperature && profile.temperature + ' temperature', profile.trajectory && profile.trajectory + ' trajectory'].filter(Boolean),
    peopleWhoNeedThem: ['No confident stewardship move is ready yet.'],
    peopleTheyShouldMeet: ['No confident stewardship move is ready yet.'],
    whatChanged: [profile.evidence || profile.signal].filter(Boolean),
    executiveAdvice: [profile.certainty || 'Protect the relationship by acting from what is known, not from urgency.'].filter(Boolean),
    activeThreads: [profile.company || profile.role].filter(Boolean),
    openLoops: [profile.nextMove || profile.certainty].filter(Boolean),
    valueUserCreates: ['Pattern recognition and thoughtful follow-through.'],
    valueTheyCreate: [profile.meaning || 'Relationship value is still being assembled.'].filter(Boolean),
    timeline: [profile.livingNarrative || profile.patterns].filter(Boolean),
    recentActivity: [profile.lastChangedAt ? 'Last meaningful change · ' + new Date(profile.lastChangedAt).toLocaleDateString(undefined, {month:'short', day:'numeric'}) : profile.signal].filter(Boolean),
    relatedWork: [profile.company || profile.role].filter(Boolean),
    notesToSee: [profile.wisdom].filter(Boolean)
  };
  Object.keys(listFallbacks).forEach((key) => {
    renderRelationshipList(key, profile[key] || listFallbacks[key]);
  });
}

function preferredRelationshipActions(actions = []){
  const preferred = ['find_relationship_introductions','search_ghl_contacts','review_new_contact_candidate','ask_alignment','draft_message','draft_linkedin_comment','draft_linkedin_dm','create_task','brainstorm','review_linkedin_activity','refresh_relationship_observers'];
  return preferred.map((id) => actions.find((action) => action.id === id)).filter(Boolean);
}

function relationshipReviewIntroductionsAction(){
  return {id:'find_relationship_introductions',label:'Review prepared move',type:'endpoint',willDo:'Prepare review-only Stewardship moves from source-backed relationship understanding.',willNotDo:'No message, introduction, calendar event, or CRM change will happen.'};
}

function relationshipActionsWithStewardshipReview(actions = [], profile = {}){
  if(profile.unresolvedIdentity) return actions;
  if(actions.some((action) => action.id === 'find_relationship_introductions')) return actions;
  return actions.concat(relationshipReviewIntroductionsAction());
}

function relationshipSuggestedActions(profile = {}){
  if(profile.unresolvedIdentity){
    return [
      {id:'search_ghl_contacts',label:'Find matching person',type:'identity_gate',willDo:'Show possible CRM matches for this person.',willNotDo:'No person will be created or merged.'},
      {id:'review_new_contact_candidate',label:'Review person link',type:'identity_gate',willDo:'Review the proposed person link before creation.',willNotDo:'VAL will not create a person without review.'}
    ];
  }
  const state = String(profile.relationshipState || profile.relationshipStateLabel || '').toLowerCase();
  const evidence = [profile.evidence, profile.signal, profile.certainty, profile.linkedinSignal].join(' ').toLowerCase();
  const actions = [];
  if(state.includes('waiting') || evidence.includes('reply') || evidence.includes('proposal') || evidence.includes('loop')){
    actions.push(
      {id:'draft_message',label:'Draft reply',type:'endpoint',willDo:'Prepare a relationship-specific reply for review.',willNotDo:'Nothing will be sent.'},
      {id:'create_task',label:'Create follow-up task',type:'endpoint',willDo:'Prepare a task connected to this relationship loop.',willNotDo:'No external system will be changed without approval.'},
      {id:'ask_alignment',label:'Ask what matters now',type:'workspace',workspace:'alignment'}
    );
    return relationshipActionsWithStewardshipReview(actions, profile);
  }
  if(state.includes('strategic') || evidence.includes('partner') || evidence.includes('momentum')){
    actions.push(
      {id:'cowork_relationship',label:'Co-Work with VAL',type:'workspace',willDo:'Think with VAL using this relationship file.',willNotDo:'No email, CRM update, task, or post will happen.'},
      relationshipReviewIntroductionsAction(),
      {id:'review_linkedin_activity',label:'Review LinkedIn signal',type:'endpoint',willDo:'Show the latest known LinkedIn signal.',willNotDo:'No post, comment, scrape, message, or CRM change will happen.'}
    );
    return actions;
  }
  actions.push(
    {id:'draft_message',label:'Draft check-in',type:'endpoint',willDo:'Prepare a warm relationship-specific check-in for review.',willNotDo:'Nothing will be sent.'},
    {id:'create_task',label:'Create follow-up task',type:'endpoint',willDo:'Prepare a task connected to this relationship.',willNotDo:'No external system will be changed without approval.'}
  );
  return actions;
}

function renderRelationshipActions(profile = {}){
  const container = document.querySelector('.relationship-actions');
  if(!container) return;
  const safeActions = profile.unresolvedIdentity ? [] : [{id:'refresh_relationship_observers',label:'Check for new evidence',type:'endpoint',willDo:'Check new sources, identity resolution, evidence binding, maturity, visibility, and next-move readiness.',willNotDo:'No message, CRM update, import, or external action will happen.'}];
  const actionHtml = (action) => {
    const label = escapeHtml(action.label || 'Review');
    const title = escapeHtml([action.willDo, action.willNotDo].filter(Boolean).join(' '));
    if(action.type === 'route'){
      const href = escapeHtml(relationshipRouteUrl(action.route || profile.href || '#'));
      return '<a href="' + href + '" data-relationship-action="' + escapeHtml(action.id) + '" title="' + title + '" onclick="event.preventDefault();event.stopPropagation();handleRelationshipActionClick(this.dataset.relationshipAction,this);return false;">' + label + '</a>';
    }
    return '<button type="button" data-relationship-action="' + escapeHtml(action.id) + '" title="' + title + '" onclick="event.preventDefault();event.stopPropagation();handleRelationshipActionClick(this.dataset.relationshipAction,this);return false;">' + label + '</button>';
  };
  const groups = [
    {label:'Source check', ids:['refresh_relationship_observers']}
  ];
  const groupedHtml = groups.map((group) => {
    const groupActions = safeActions.filter((action) => group.ids.includes(action.id));
    return groupActions.length
      ? '<div class="relationship-action-group"><strong>' + group.label + '</strong><div>' + groupActions.map(actionHtml).join('') + '</div></div>'
      : '';
  }).join('');
  container.innerHTML = groupedHtml || safeActions.map(actionHtml).join('');
}

function renderRelationshipPrimaryActions(profile = {}){
  const container = document.querySelector('.relationship-primary-actions');
  if(!container) return;
  if(profile.unresolvedIdentity){
    container.innerHTML = '';
    return;
  }
  const stewardship = relationshipStewardshipUi(profile);
  if(!stewardship.canEvaluateMoves && !/^Move suggested/i.test(stewardship.status)){
    container.innerHTML = '';
    return;
  }
  container.innerHTML = '<button type="button" data-relationship-action="find_relationship_introductions" title="Review the next thoughtful relationship move. Nothing will be sent.">Review prepared move</button>';
}

function relationshipSectionActions(profile = {}, section = ''){
  const defaults = defaultRelationshipSectionActions(profile.name || 'this relationship');
  const supplied = profile.sectionActions || profile.dossier?.actions?.sections || {};
  const sections = {...defaults, ...supplied};
  return Array.isArray(sections[section]) ? sections[section] : [];
}

function relationshipAllSectionActions(profile = {}){
  const defaults = defaultRelationshipSectionActions(profile.name || 'this relationship');
  const supplied = profile.sectionActions || profile.dossier?.actions?.sections || {};
  const sections = {...defaults, ...supplied};
  return Object.values(sections).flat().filter(Boolean);
}

function renderRelationshipSectionActions(profile = {}){
  document.querySelectorAll('[data-relationship-section-actions]').forEach((container) => {
    const section = container.dataset.relationshipSectionActions;
    const actions = relationshipSectionActions(profile, section).slice(0, 2);
    container.innerHTML = actions.map((action) => {
      const title = escapeHtml([action.willDo, action.willNotDo, action.prompt].filter(Boolean).join(' '));
      return '<button type="button" data-relationship-action="' + escapeHtml(action.id) + '" data-relationship-section="' + escapeHtml(section) + '" title="' + title + '" onclick="event.preventDefault();event.stopPropagation();handleRelationshipActionClick(this.dataset.relationshipAction,this);return false;">' + escapeHtml(action.label || 'Review') + '</button>';
    }).join('');
  });
}

function relationshipContactPayload(profile = {}){
  const dossier = profile.dossier || {};
  const identity = dossier.identity || {};
  const packet = profile.personPacket || null;
  const packetPerson = packet?.person || {};
  const identityContactId = identity.crmContactId || identity.id || '';
  return {
    id: identity.id || profile.id || '',
    contactId: identityContactId || packetPerson.crm_contact_id || profile.contactId || profile.crmContactId || profile.id || '',
    crmContactId: identity.crmContactId || packetPerson.crm_contact_id || profile.crmContactId || profile.contactId || '',
    name: identity.name || packetPerson.name || profile.name || '',
    email: identity.email || packetPerson.email_addresses?.[0] || profile.query?.email || '',
    company: identity.company || packetPerson.company_or_context || profile.company || '',
    role: identity.role || packetPerson.role || profile.role || '',
    recommendedAction: profile.certainty || '',
    reason: profile.meaning || '',
    summary: profile.evidence || profile.signal || packet?.who_this_person_is?.summary || '',
    openLoops: profile.openLoops || profile.packetNeeds || [],
    needs: profile.packetNeeds || [],
    offers: profile.packetOffers || profile.valueTheyCreate || [],
    opportunitySignals: profile.packetOffers || [],
    evidence: packet?.who_this_person_is?.source_receipts || [],
    personPacket: packet,
    relationshipDossier: dossier
  };
}

function relationshipActionById(profile = {}, actionId = ''){
  const actions = Array.isArray(profile.actions) ? profile.actions : [];
  const sectionActions = relationshipAllSectionActions(profile);
  const found = actions.find((action) => action.id === actionId) || sectionActions.find((action) => action.id === actionId);
  if(found) return activeRelationshipActionSection && !found.section ? {...found, section:activeRelationshipActionSection} : found;
  return {id: actionId, label: actionId.replace(/_/g, ' '), section:activeRelationshipActionSection || ''};
}

async function handleRelationshipActionClick(actionId = '', node = null){
  activeRelationshipActionSection = node?.dataset?.relationshipSection || node?.dataset?.relationshipCardSection || activeRelationshipActionSection || '';
  if(node?.dataset?.relationshipCardSection || node?.dataset?.relationshipSection){
    const packet = localHearthMetadataPacket({node, packetName:'relationship_packet', action:actionId, source:relationshipSource(activeRelationshipProfile, actionId, activeRelationshipActionSection)});
    renderDrawerPacketReceiptStrip(packet || lastHearthPacketReceipt);
    await handleRelationshipAction(actionId);
    return;
  }
  const preflight = await ensureHearthClickPacket({node, packetName:'relationship_packet', action:actionId, allowBlockedForInspection:true, source:relationshipSource(activeRelationshipProfile, actionId, activeRelationshipActionSection)});
  if(!preflight.ok) return;
  renderDrawerPacketReceiptStrip(preflight.packet || lastHearthPacketReceipt);
  await handleRelationshipAction(actionId);
}

function relationshipSource(profile = activeRelationshipProfile, action = '', section = null){
  const person = profile || activeRelationshipProfile || relationshipProfiles.aric;
  const scopedSection = section == null ? (activeRelationshipActionSection || '') : section;
  return {
    sourceId: person.contactId || person.crmContactId || person.id || person.profileId || person.name || 'relationship',
    sourceType: 'relationship_profile',
    sourceLabel: person.name || 'Relationship',
    sourceSection: scopedSection,
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
      requestedAction: action,
      requestedSection: scopedSection
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
    returnButton.textContent = 'Back to Transcripts';
    returnButton.setAttribute('aria-label', 'Back to Transcripts drawer');
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

function relationshipPacketRows(){
  const seen = new Set();
  return Object.values(relationshipPersonPacketIndex).filter((item) => {
    const packet = item?.packet || item?.personPacket || item;
    const key = packet?.packet_id || item?.profileId || item?.profileKey || item?.displayName || '';
    if(!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function relationshipPacketHasRealIdentity(packet = {}, item = {}){
  const person = packet.person || {};
  const admission = item.relationshipAdmission || {};
  const contactId = String(person.crm_contact_id || item.contactId || item.crmContactId || '').trim();
  if(contactId && !/^(email|name|person:email):/i.test(contactId)) return true;
  if(admission.reason === 'known_email_alias') return true;
  if(person.identity_status === 'linked') return true;
  return false;
}

function relationshipPacketLooksLikeRawHandle(packet = {}, item = {}){
  const person = packet.person || {};
  const email = person.email_addresses?.[0] || item.email || '';
  const name = String(person.name || item.displayName || '').trim().toLowerCase();
  if(!name || name === 'unknown') return true;
  if(name.includes('@')) return true;
  if(email && name === String(email).split('@')[0].toLowerCase()) return true;
  return /^[a-z0-9._-]+$/.test(name) && !/\s/.test(name);
}

function relationshipPacketEligibleForIntro(item = {}){
  const packet = item?.packet || item?.personPacket || item;
  if(!packet || packet.packet_type !== 'person_packet') return false;
  if(!relationshipPacketHasRealIdentity(packet, item)) return false;
  if(relationshipPacketLooksLikeRawHandle(packet, item)) return false;
  return true;
}

function relationshipIntroCandidatePackets(profile = {}){
  const selfKeys = new Set([
    profile.personPacket?.packet_id,
    profile.contactId,
    profile.crmContactId,
    profile.query?.contactId,
    profile.query?.email,
    profile.name
  ].map((value) => String(value || '').trim().toLowerCase()).filter(Boolean));
  return relationshipPacketRows().map((item) => item.packet || item.personPacket || item).filter((packet) => {
    const person = packet.person || {};
    const keys = [
      packet.packet_id,
      person.crm_contact_id,
      person.email_addresses?.[0],
      person.name
    ].map((value) => String(value || '').trim().toLowerCase()).filter(Boolean);
    return relationshipPacketEligibleForIntro(item) && keys.length && !keys.some((key) => selfKeys.has(key));
  });
}

function relationshipIntroReviewFromResult(profile = {}, result = {}){
  const next = {
    ...profile,
    introReview: {
      whoNeedsThisPerson: Array.isArray(result.whoNeedsThisPerson) ? result.whoNeedsThisPerson : [],
      whoThisPersonNeeds: Array.isArray(result.whoThisPersonNeeds) ? result.whoThisPersonNeeds : [],
      candidates: Array.isArray(result.candidates) ? result.candidates : [],
      reviewSurface: result.reviewSurface || null,
      stewardshipMovePackets: result.stewardshipMovePackets || [],
      stewardshipMatchPackets: result.stewardshipMatchPackets || [],
      updatedAt: new Date().toISOString()
    },
    currentPersonPacket: result.currentPersonPacket || profile.personPacket || null
  };
  activeRelationshipProfile = next;
  if(next.profileId) relationshipIndexProfiles[next.profileId] = next;
  if(next.id && relationshipIndexProfiles[next.id]) relationshipIndexProfiles[next.id] = next;
  return next;
}

async function prepareRelationshipIntroReview(profile = {}){
  if(!canUseApi) return profile;
  const crmContacts = relationshipIntroCandidatePackets(profile);
  const result = await postJson('/api/relationships/actions', {
    action:'find_relationship_introductions',
    contact: relationshipContactPayload(profile),
    dossier: profile.dossier || null,
    crmContacts,
    limit: 8
  });
  return relationshipIntroReviewFromResult(profile, result);
}

function introCandidateName(candidate = {}){
  const person = candidate.personB || candidate.other || candidate.person || {};
  const contactIds = candidate.contactIds || {};
  return candidate.name || candidate.title || person.name || person.email || candidate.displayName || contactIds.other || 'this person';
}

function introCandidateReason(candidate = {}){
  return candidate.reason || candidate.meaning || candidate.whyThisMayMatter || candidate.summary || candidate.whatValPrepared || 'Potential relationship leverage.';
}

function normalizedIntroCandidate(candidate = {}){
  return {
    ...candidate,
    name: introCandidateName(candidate),
    reason: introCandidateReason(candidate),
    confidence: Number(candidate.confidence || 0)
  };
}

function normalizedIntroCandidates(items = []){
  const seen = new Set();
  return (Array.isArray(items) ? items : []).map(normalizedIntroCandidate).filter((item) => {
    const key = [item.id, item.name, item.reason].filter(Boolean).join('|').toLowerCase();
    if(!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function introReviewLines(profile = {}){
  const review = profile.introReview || {};
  const needs = normalizedIntroCandidates(review.whoNeedsThisPerson);
  const needed = normalizedIntroCandidates(review.whoThisPersonNeeds);
  function lines(title, items){
    return [title].concat((items.length ? items : [{name:'No confident move yet', reason:'VAL needs stronger evidence before recommending a relationship move.', confidence:0}]).map((item) => (
      item.name + ': ' + item.reason
    )));
  }
  return lines('Who needs this person', needs).concat(lines('Who this person needs', needed));
}

function introReviewActions(profile = {}){
  const review = profile.introReview || {};
  const actions = [];
  normalizedIntroCandidates([...(review.whoNeedsThisPerson || []), ...(review.whoThisPersonNeeds || [])]).slice(0, 3).forEach((item, index) => {
    actions.push({label:'Draft intro for ' + item.name, workflow:'introDraft:' + index});
  });
  return relationshipContextActions(actions, profile);
}

function introDraftCandidates(profile = {}){
  const review = profile.introReview || {};
  return normalizedIntroCandidates([...(review.whoNeedsThisPerson || []), ...(review.whoThisPersonNeeds || [])]).slice(0, 3);
}

function introDraftBody(profile = {}, candidate = {}){
  const userName = 'Jessa';
  const person = introCandidateName(candidate) || 'there';
  const firstName = person.split(/\s+/)[0] || person;
  const why = introCandidateReason(candidate) || 'I thought there may be useful overlap in what you are each carrying right now.';
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

function relationshipIntroSourceContext(profile = {}){
  const name = profile.name || 'this person';
  const whoTheyAre = [
    profile.stewardshipAboutTitle && profile.stewardshipAboutTitle !== 'Relationship context' ? profile.stewardshipAboutTitle : '',
    profile.stewardshipAbout || profile.evidence || profile.signal || ''
  ].filter(Boolean).join(': ');
  const needThem = Array.isArray(profile.peopleWhoNeedThem) ? profile.peopleWhoNeedThem : [];
  const shouldMeet = Array.isArray(profile.peopleTheyShouldMeet) ? profile.peopleTheyShouldMeet : [];
  return [
    'Who ' + name + ' is: ' + (whoTheyAre || 'VAL needs more relationship context before it can summarize this person.'),
    'Who may need ' + name + ': ' + (needThem.length ? needThem.slice(0, 2).join(' | ') : 'No confident stewardship move is ready yet.'),
    'Who ' + name + ' may need: ' + (shouldMeet.length ? shouldMeet.slice(0, 2).join(' | ') : 'No confident stewardship move is ready yet.'),
    profile.keyFacts?.length ? 'Current facts: ' + profile.keyFacts.slice(0, 3).join(' | ') : '',
    profile.sourceReceipts ? 'Source posture: ' + profile.sourceReceipts : ''
  ].filter(Boolean);
}

function openIntroDraftReview(candidateIndex = 0){
  const profile = activeRelationshipProfile || relationshipProfiles.aric;
  const candidate = introDraftCandidates(profile)[Number(candidateIndex)] || introDraftCandidates(profile)[0] || null;
  if(!candidate){
  setWorkspaceContent({
    lens: 'Stewardship Move Review',
    title: 'This relationship move is not draft-ready yet.',
      meaning: 'VAL does not have a clean, identity-safe introduction candidate for ' + (profile.name || 'this relationship') + '.',
      understanding: [
        'A real relationship or known identity is required on both sides.',
        'Raw email handles, one-way inbound messages, spam-like senders, and unresolved observed mentions are not enough.',
        'Nothing was sent, exposed, written to CRM, imported, scraped, or scheduled.'
      ],
      recommendation: 'Link the real person or teach VAL the relationship before asking it to draft a move.',
      actions: relationshipContextActions([
        {label:'Back to move review', workflow:'relationship:find_relationship_introductions'},
        {label:'All people', workflow:'relationshipAllPeople'}
      ], profile),
      label: 'Stewardship move not draft-ready'
    });
    openWorkspaceShell('Stewardship move not draft-ready', {returnTarget:'relationship'});
    return;
  }
  activeIntroDraftCandidate = {profile,candidate,draftBody:introDraftBody(profile,candidate)};
  setWorkspaceContent({
    lens: 'Stewardship Move Review',
    title: 'Introduction draft held for review.',
    meaning: 'VAL prepared the draft language, but nothing leaves the desk yet.',
    understanding: [
      'Candidate: ' + introCandidateName(candidate),
      'Why this intro may matter: ' + introCandidateReason(candidate),
      'No email, LinkedIn message, calendar invite, scrape, import, or CRM write happened from this click.'
    ],
    recommendation: 'Review the wording and the reason before approving, refining, or teaching VAL that this is not the right introduction.',
    actions: relationshipContextActions([
      {label:'Approve draft for review queue', workflow:'introApprove'},
      {label:'Refine wording', workflow:'introRefine'},
      {label:'Not this intro', workflow:'introDismiss'},
      {label:'Teach VAL', workflow:'introTeach'},
      {label:'Back to move review', workflow:'relationship:find_relationship_introductions'}
    ], profile),
    label: 'Stewardship introduction draft review'
  });
  renderWorkspaceInput({
    label: 'Prepared introduction draft',
    placeholder: 'VAL prepared draft language for review.',
    helper: 'Editing this text only changes the review draft. It does not send, expose recipients, write CRM, or create a calendar event.',
    mode: 'intro-draft',
    value: activeIntroDraftCandidate.draftBody
  });
  openWorkspaceShell('Stewardship introduction draft review', {returnTarget:'relationship'});
}

async function openRelationshipIntroReview(profile = {}){
  let reviewedProfile = profile;
  if(canUseApi){
    showRelationshipReceipt({
      title: 'Reviewing possible relationship moves.',
      meaning: 'VAL is comparing this relationship against current person packets and commitments.',
      understanding: ['This is internal review only.', 'No message, introduction, calendar invite, scrape, import, or CRM update will happen.'],
      recommendation: 'VAL will open the review surface when the comparison is ready.'
    });
    try{
      reviewedProfile = await prepareRelationshipIntroReview(profile);
    }catch(error){
      reviewedProfile = profile;
      reviewedProfile.introReview = reviewedProfile.introReview || {
        whoNeedsThisPerson: [],
        whoThisPersonNeeds: [],
        error: error.message
      };
    }
  }
  const name = reviewedProfile.name || 'this relationship';
  const candidates = introDraftCandidates(reviewedProfile);
  const sourceContext = relationshipIntroSourceContext(reviewedProfile);
  setWorkspaceContent({
    lens: 'Stewardship Move Review',
    title: candidates.length ? 'Next Stewardship move is ready for review.' : 'No Stewardship move is ready yet.',
    meaning: candidates.length
      ? 'VAL looked at what thoughtful next move may serve ' + name + ', including introductions only when they are the right move.'
      : 'VAL checked the current relationship packets around ' + name + ', but did not find a clean, identity-safe stewardship move.',
    understanding: candidates.length ? sourceContext.concat(introReviewLines(reviewedProfile)) : sourceContext.concat([
      'Move readiness: no identity-safe move is ready yet.',
      'Why: VAL needs reciprocal relationship evidence, a linked CRM identity, a known alias, a commitment, or your teaching before suggesting a move.',
      'Boundary: observed source overlap is not enough to send, introduce, schedule, or expose anyone.'
    ]),
    recommendation: candidates.length
      ? 'Choose a move only if it would serve the relationship. The next step is a draft or commitment review, never an external action.'
      : 'Treat this as a relationship-context gap, not an action. Link the real person or teach VAL the relationship before drafting.',
    actions: introReviewActions(reviewedProfile),
    label: 'Stewardship move review',
    suppressClarityStandard:true
  });
  openWorkspaceShell('Stewardship move review', {returnTarget:'relationship'});
}

function relationshipSectionLabel(section = ''){
  const labels = {
    identity:'Identity',
    evidence:'Evidence',
    current_read:'Current read',
    what_changed:'What changed',
    patterns:'Pattern',
    meaning:'Why this matters',
    wisdom:'Thirty second reminder',
    certainty:'One truth',
    executive_advice:'Executive advice',
    risk:'Relationship risk',
    active_threads:'Active threads',
    open_loops:'Open loops',
    mutual_value:'Mutual value',
    living_narrative:'Living narrative',
    timeline:'Relationship timeline',
    recent_activity:'Recent activity',
    related_work:'Related work',
    notes_to_see:'Notes you should see'
  };
  return labels[section] || String(section || 'relationship').replace(/_/g, ' ');
}

function relationshipSectionCurrentValue(profile = {}, section = ''){
  const sections = {
    identity: profile.identity || profile.contact,
    evidence: profile.evidence,
    current_read: [profile.temperature, profile.trajectory, profile.relationshipStateLabel || profile.relationshipState, profile.trustLevel].filter(Boolean).join(' · '),
    what_changed: Array.isArray(profile.whatChanged) ? profile.whatChanged.join(' ') : profile.evidence || profile.signal,
    patterns: profile.patterns,
    meaning: profile.meaning,
    wisdom: profile.wisdom,
    certainty: profile.certainty,
    executive_advice: Array.isArray(profile.executiveAdvice) ? profile.executiveAdvice.join(' ') : profile.certainty,
    risk: profile.risk,
    active_threads: Array.isArray(profile.activeThreads) ? profile.activeThreads.join(' ') : profile.company || profile.role,
    open_loops: Array.isArray(profile.openLoops) ? profile.openLoops.join(' ') : profile.nextMove || profile.certainty,
    mutual_value: [profile.meaning, profile.patterns].filter(Boolean).join(' '),
    living_narrative: profile.livingNarrative || profile.patterns,
    timeline: Array.isArray(profile.timeline) ? profile.timeline.join(' ') : profile.livingNarrative || profile.patterns,
    recent_activity: Array.isArray(profile.recentActivity) ? profile.recentActivity.join(' ') : profile.signal,
    related_work: Array.isArray(profile.relatedWork) ? profile.relatedWork.join(' ') : profile.company || profile.role,
    notes_to_see: Array.isArray(profile.notesToSee) ? profile.notesToSee.join(' ') : profile.wisdom
  };
  return sections[section] || profile.wisdom || profile.evidence || 'No current value is attached yet.';
}

function openRelationshipTeachWorkspace(reason = 'relationship', section = ''){
  const profile = activeRelationshipProfile || relationshipProfiles.aric;
  relationshipTeachMode = reason;
  relationshipTeachSection = section || activeRelationshipActionSection || reason || 'relationship';
  const sectionLabel = relationshipSectionLabel(relationshipTeachSection);
  const promptByReason = {
    wisdom:'What should VAL remember about this relationship wisdom?',
    importance:'How important is this relationship, and why?',
    temperature:'What should VAL understand about this relationship status or current posture?',
    relationship:'What should VAL understand differently about this relationship?'
  };
  setWorkspaceContent({
    lens: 'Teach VAL',
    title: 'Teach VAL about ' + sectionLabel.toLowerCase() + '.',
    meaning: 'This teaching is scoped to ' + (profile.name || 'this relationship') + ' and the "' + sectionLabel + '" card.',
    understanding: (reason === 'temperature' ? relationshipTemperatureTeachingContext(profile) : [
      'Section: ' + sectionLabel,
      'Current card value: ' + relationshipSectionCurrentValue(profile, relationshipTeachSection),
      'Current reminder: ' + (profile.wisdom || 'No relationship wisdom is attached yet.'),
      'Current pattern: ' + (profile.patterns || 'No durable pattern is attached yet.'),
      'Teaching stays reviewable before it becomes memory.'
    ]),
    recommendation: promptByReason[reason] || 'What should VAL understand differently about this card?',
    actions: [
      {label:'Review what I taught VAL', workflow:'relationshipTeachCandidate'},
      {label:relationshipBackLabel(profile), workflow:'cancel:relationship'},
      {label:'All people', workflow:'relationshipAllPeople'}
    ],
    label: 'Relationship Teach VAL workspace'
  });
  renderWorkspaceInput({
    label: 'Teach VAL: ' + sectionLabel,
    placeholder: 'Example: On this card, VAL should understand that... / This is wrong because... / Use this context before suggesting action...',
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
      {label:'Review next move', workflow:'relationship:find_relationship_introductions'}
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
  if(action.intent === 'teach'){
    openRelationshipTeachWorkspace(actionId.replace(/^teach_/, '') || 'relationship', action.section || activeRelationshipActionSection);
    return;
  }
  if(action.intent === 'cowork'){
    openContextualCoworkSession({
      returnTarget:'relationship',
      title:'Co-Work with VAL about ' + relationshipSectionLabel(action.section || activeRelationshipActionSection).toLowerCase() + '.',
      meaning:'This Co-Work space is scoped to ' + (profile.name || 'this relationship') + ' and the selected Relationship card.',
      context:[
        'Relationship: ' + (profile.name || 'Unknown'),
        'Section: ' + relationshipSectionLabel(action.section || activeRelationshipActionSection),
        'Current card value: ' + relationshipSectionCurrentValue(profile, action.section || activeRelationshipActionSection)
      ],
      recommendation:'Use this to discuss the relationship context before drafting, scheduling, introducing, or changing anything.',
      placeholder:'What should VAL help you think through about this card?',
      helper:'This Co-Work note is tagged to the active relationship and selected card. External actions still require a separate approval step.',
      backWorkflow:'cancel:relationship'
    });
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
    openRelationshipTeachWorkspace('wisdom', action.section || activeRelationshipActionSection || 'wisdom');
    return;
  }
  if(actionId === 'teach_temperature'){
    openRelationshipTeachWorkspace('temperature', action.section || activeRelationshipActionSection || 'temperature');
    return;
  }
  if(actionId === 'mark_vip' || actionId === 'not_important' || actionId === 'snooze'){
    openRelationshipTeachWorkspace('importance', action.section || activeRelationshipActionSection || 'importance');
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
      title: 'Source check is ready for review.',
      meaning: profile.sourceReceipts || 'VAL can check for new evidence before this relationship brief is trusted.',
      understanding: ['CRM remains the identity anchor.', 'New evidence must bind to the right person.', 'No import, overwrite, message, or CRM update happens from this click.'],
      recommendation: 'Check for new evidence only when the relationship brief needs newer source context before action.'
    });
    return;
  }
  if(actionId === 'find_relationship_introductions'){
    await openRelationshipIntroReview(profile);
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

function relationshipUsefulText(value = '', fallback = ''){
  const text = String(value || '').trim();
  if(!text) return fallback;
  const weak = [
    /canonical relationship index/i,
    /Open the brief to resolve identity/i,
    /Relationship evidence is available in the canonical index/i,
    /Relationship evidence is pending source review/i,
    /This relationship has enough observed context to appear in the index/i,
    /LinkedIn context will appear when an observer has current evidence/i
  ];
  return weak.some((pattern) => pattern.test(text)) ? fallback : text;
}

function relationshipSectionEvidence(profile = {}, section = ''){
  const lines = [
    relationshipUsefulText(relationshipSectionCurrentValue(profile, section), ''),
    relationshipUsefulText(profile.evidence, ''),
    relationshipUsefulText(profile.signal, ''),
    relationshipUsefulText(profile.sourceEvidence || profile.sourceReceipts, '')
  ].filter(Boolean);
  return Array.from(new Set(lines)).slice(0, 4);
}

function relationshipSectionPacketCopy(section = '', profile = {}){
  const label = relationshipSectionLabel(section);
  const current = relationshipUsefulText(relationshipSectionCurrentValue(profile, section), '');
  const evidence = relationshipSectionEvidence(profile, section);
  const hasEnoughEvidence = Boolean(current && evidence.length >= 2 && !/not confirmed|not action-ready|review gap/i.test(current));
  const copyBySection = {
    identity:['Decide whether this is the right person.', 'Identity has to be clean before VAL attaches transcripts, emails, notes, or project context.'],
    current_read:['Decide whether the current read is accurate.', 'Temperature, trajectory, trust, and importance should change only when there is evidence or your correction.'],
    what_changed:['Decide what actually changed.', 'VAL should separate real movement from noise before it creates urgency.'],
    patterns:['Decide whether this pattern is real.', 'An executive assessment needs repeated evidence, not a single vague signal.'],
    meaning:['Decide why this relationship matters now.', 'Strategic importance should explain what this relationship changes about priorities, leverage, or risk.'],
    wisdom:['Correct the reminder VAL will carry forward.', 'This is the one-line posture VAL should remember before it drafts, schedules, or recommends.'],
    certainty:['Decide the one safe truth.', 'If the truth is thin, VAL should ask before it acts.'],
    executive_advice:['Decide what advice is safe to follow.', 'Advice should be usable before outreach, not decorative commentary.'],
    risk:['Decide whether there is relationship risk.', 'Risk should say what could be harmed, what evidence supports it, and what to avoid next.'],
    active_threads:['Discuss the active thread.', 'Threads should connect to the real work, people, and pending decision.'],
    open_loops:['Decide whether this is a real open loop.', 'A loop becomes a task only when owner, next action, and source evidence are clear.'],
    mutual_value:['Clarify the mutual value.', 'VAL should know what each side creates before suggesting introductions, asks, or follow-up.'],
    living_narrative:['Update the relationship story.', 'The story should explain the season of the relationship without flattening nuance.'],
    timeline:['Add or correct the timeline.', 'Timeline items should be sourced so VAL does not invent history.'],
    recent_activity:['Review recent activity.', 'Recent activity needs a source and a reason it matters.'],
    related_work:['Connect related work.', 'Related projects and documents should attach only when they truly belong to this person.'],
    notes_to_see:['Review the notes VAL thinks matter.', 'Notes should preserve evidence, not generic memory.'
    ]
  };
  const [title, purpose] = copyBySection[section] || ['Decide what this relationship card means.', 'This card needs enough context to support an executive next move.'];
  return {
    label,
    title,
    purpose,
    current: current || 'No action-ready judgment is available for this card yet.',
    evidence,
    hasEnoughEvidence
  };
}

function showRelationshipSectionReceipt(action = {}, profile = {}){
  const section = action.section || activeRelationshipActionSection || 'relationship';
  const copy = relationshipSectionPacketCopy(section, profile);
  const missing = copy.hasEnoughEvidence
    ? 'Missing context: nothing obvious, but you can still correct VAL if the read is wrong.'
    : 'Missing context: VAL needs your correction, a source, or a full relationship dossier before this becomes action-ready.';
  const actions = [
    {label:'Discuss this card', workflow:'relationship:cowork_relationship'}
  ];
  if(action.id === 'create_task_from_loop' || section === 'open_loops'){
    actions.unshift({label:'Create task only if real', workflow:'relationship:create_task'});
  }
  showRelationshipReceipt({
    title: copy.title,
    meaning: copy.current,
    understanding: [
      'Card: ' + copy.label,
      'What this card is for: ' + copy.purpose,
      copy.evidence.length ? 'Evidence VAL has: ' + copy.evidence.join(' | ') : 'Evidence VAL has: not enough yet.',
      missing,
      'Boundary: no email, CRM update, task, or memory change happened from this click.'
    ],
    recommendation: copy.hasEnoughEvidence ? 'Use this card as decision support, then act only through the dedicated approval path.' : 'Do not act from this card yet. Add context or open the relationship file first.',
    actions
  });
}

async function handleUnresolvedRelationshipAction(actionId, profile = {}){
  if(actionId === 'search_ghl_contacts'){
    const matches = Array.isArray(profile.unresolvedData?.matches) ? profile.unresolvedData.matches : [];
    showRelationshipReceipt({
      title: 'Find the right person before attaching context.',
      meaning: profile.name + ' is not linked to one clean CRM person yet.',
      understanding: matches.length ? matches.map((match) => [match.name || 'Unnamed person', match.email, match.contactId || match.source, match.confidence != null ? 'confidence ' + match.confidence : ''].filter(Boolean).join(' · ')) : ['No confident CRM match was returned by VAL.', 'Use a more specific email, phone, or company if this should match an existing person.'],
      recommendation: 'Link the right person first. Then VAL can safely attach transcripts, calendar, emails, projects, and notes.',
      actions: [{label:'Review person link', workflow:'relationship:review_new_contact_candidate'}]
    });
    return;
  }
  if(actionId === 'review_new_contact_candidate'){
    activeMeetingContactCandidates.relationship_identity_gate = {
      attendee:{name:profile.name,email:profile.contactCandidate?.payload?.email || ''},
      candidate:{
        endpoint:'/api/val/contacts/create',
        payload:profile.contactCandidate?.payload || contactCandidatePayloadFromRelationship(profile),
        willNotDo:'VAL will not merge contacts, send messages, add opportunities, or attach relationship context until CRM returns a contact ID.',
        onSuccess:'Use the returned contact.id/contactId as the canonical relationship key.'
      }
    };
    await handleMeetingContactCandidate('relationship_identity_gate');
    return;
  }
  showRelationshipReceipt({
    title: 'Link the right person first.',
    meaning: 'VAL is protecting the relationship until the identity is clean enough to merge evidence.',
    understanding: ['No relationship context was merged yet.', 'No CRM write happened.', 'This protects against overlapping people.'],
    recommendation: 'Find the matching person or review the proposed person link.'
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
      if(!relationshipDossierMatchesFallback(data.dossier, fallback)){
        console.warn('[hearth] relationship dossier identity mismatch; keeping selected fallback', fallback.name);
        return;
      }
      renderRelationshipProfile(profileId, relationshipProfileFromDossier(data.dossier, fallback));
    }
  }catch(error){
    if(error.data?.error === 'relationship_identity_unresolved'){
      const stableProfile = relationshipFallbackHasCanonicalEvidence(fallback)
        ? relationshipProfileWithIdentityWarning(error.data, fallback)
        : relationshipProfileFromUnresolvedIdentity(error.data, fallback);
      if(activeRelationshipProfile?.profileId === profileId || activeRelationshipProfile?.id === fallback.id || activeRelationshipProfile?.name === fallback.name){
        renderRelationshipProfile(profileId, stableProfile);
      }
      return;
    }
    console.warn('[hearth] relationship dossier unavailable', error.message);
  }
}

function closeDrawer(){
  retrievalSystem.classList.remove('open');
  retrievalSystem.removeAttribute('data-active-drawer');
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

function activeDrawerCoworkMode(){
  if(!drawerTray || drawerTray.getAttribute('aria-hidden') === 'true') return '';
  if(drawerTray.classList.contains('relationship-open')) return 'relationship';
  if(drawerTray.classList.contains('project-open')) return 'project';
  if(drawerTray.classList.contains('timeline-open')) return 'timeline';
  if(drawerTray.classList.contains('correspondence-open')) return 'correspondence';
  if(drawerTray.classList.contains('commitment-open')) return 'commitment';
  if(drawerTray.classList.contains('document-open')) return 'document';
  return '';
}

function updateDrawerCoworkIcon(){
  if(!drawerCoworkIcon) return;
  const isCleanCoworkOpen = deskWorkspace?.classList.contains('home-cowork-mode') && deskWorkspace?.getAttribute('aria-hidden') === 'false';
  if(isCleanCoworkOpen){
    drawerCoworkIcon.hidden = true;
    delete drawerCoworkIcon.dataset.drawerCoworkMode;
    return;
  }
  const workspaceOpen = deskWorkspace?.getAttribute('aria-hidden') === 'false';
  let mode = hearth.classList.contains('calendar-prep-open') && workspaceOpen ? 'meeting_prep' : '';
  if(!mode) mode = retrievalSystem?.classList.contains('open') ? activeDrawerCoworkMode() : '';
  if(!mode && workspaceOpen && !isCleanCoworkOpen) mode = 'workspace';
  drawerCoworkIcon.hidden = !mode;
  if(mode){
    drawerCoworkIcon.dataset.drawerCoworkMode = mode;
    drawerCoworkIcon.setAttribute('aria-label', 'Co-Work with VAL in ' + mode.replace(/_/g, ' '));
  }else{
    delete drawerCoworkIcon.dataset.drawerCoworkMode;
    drawerCoworkIcon.setAttribute('aria-label', 'Co-Work with VAL');
  }
}

async function openDrawerCoworkFromIcon(event){
  if(!drawerCoworkIcon) return;
  event?.preventDefault();
  event?.stopPropagation();
  const mode = drawerCoworkIcon.dataset.drawerCoworkMode || activeDrawerCoworkMode();
  drawerCoworkIcon.dataset.valClickContract = 'drawer.' + (mode || 'cowork');
  drawerCoworkIcon.dataset.valPromptRule = 'Drawer-scoped Co-Work prompt suite';
  drawerCoworkIcon.dataset.valAllowedActions = 'Think with VAL, draft with VAL, prepare next step';
  drawerCoworkIcon.dataset.valNeverDo = 'Do not expose held context unless explicitly designed for the user.';
  if(mode === 'workspace'){
    drawerCoworkIcon.dataset.valVariablePacket = 'cowork_packet';
    openCoworkFromClarityWorkspace();
    return;
  }
  if(mode === 'meeting_prep'){
    drawerCoworkIcon.dataset.valVariablePacket = 'meeting_prep_packet';
    openMeetingPrepCoworkSession();
    return;
  }
  const packetByMode = {
    relationship: 'relationship_packet',
    project: 'project_packet',
    timeline: 'timeline_packet',
    correspondence: 'email_packet',
    commitment: 'commitment_packet',
    document: 'document_packet',
    val: 'val_packet',
    meeting_prep: 'meeting_prep_packet'
  };
  drawerCoworkIcon.dataset.valVariablePacket = packetByMode[mode] || 'cowork_packet';
  openContextualCoworkSession(drawerCoworkContext(mode));
}

drawerCoworkIcon?.addEventListener('click', openDrawerCoworkFromIcon);
if(drawerTray && drawerCoworkIcon){
  new MutationObserver(updateDrawerCoworkIcon).observe(drawerTray, {attributes:true, attributeFilter:['class','aria-hidden']});
  new MutationObserver(updateDrawerCoworkIcon).observe(retrievalSystem, {attributes:true, attributeFilter:['class']});
  updateDrawerCoworkIcon();
}

function bringDrawerTargetIntoView(target){
  if(!target) return;
  const compactDrawer = window.matchMedia('(max-width: 720px), (max-height: 720px)').matches;
  if(!compactDrawer) return;
  window.requestAnimationFrame(() => {
    target.scrollIntoView({block:'center', inline:'nearest', behavior:'smooth'});
  });
}

function timelineKrispSections(transcript = {}){
  if(!transcript.krispNative) return {actionItems:[], overview:''};
  const summary = transcript.nativeSummary
    || transcript.rawTranscript
    || transcript.transcriptText
    || transcript.raw_content
    || transcript.sourcePayloadMetadata?.data?.raw_content
    || transcript.summaryPreview
    || (typeof transcript.summary === 'string' ? transcript.summary : transcript.summary?.executiveSummary)
    || '';
  const text = String(summary || '').trim();
  if(!text) return {actionItems:[], overview:''};
  const actionMatch = text.match(/(?:^|\n)\s*#{0,3}\s*Action Items?\s*:?\s*([\s\S]*?)(?=(?:\n\s*#{0,3}\s*(?:Key Points|Meeting Overview|Summary|Overview)\b)|$)/i)
    || text.match(/Action Items?\s*:?\s*([\s\S]*?)(?:\b(?:Key Points|Meeting Overview|Summary|Overview)\b\s*:?\s*|$)/i);
  const overviewMatch = text.match(/(?:^|\n)\s*#{0,3}\s*(?:Key Points|Meeting Overview|Summary|Overview)\s*:?\s*([\s\S]*)$/i)
    || text.match(/\b(?:Key Points|Meeting Overview|Summary|Overview)\b\s*:?\s*([\s\S]*)$/i);
  const actionItems = actionMatch
    ? actionMatch[1].split(/\n+|(?=\s*-\s*\[[ x]\])|(?=\s*[-*]\s+)/i)
        .map((item) => item.replace(/^[-*]\s*/, '').trim())
        .filter(Boolean)
    : [];
  return {actionItems, overview:overviewMatch ? overviewMatch[1].trim() : ''};
}

function timelineKrispStructuredActionItems(transcript = {}){
  if(!transcript.krispNative) return [];
  const sections = transcript.sourcePayloadMetadata?.data?.sections
    || transcript.sourcePayloadMetadata?.sections
    || transcript.metadata?.sections
    || {};
  const items = Array.isArray(sections.action_items) ? sections.action_items : [];
  return items.map((item) => {
    if(typeof item === 'string') return item;
    if(!item || typeof item !== 'object') return null;
    return {
      taskTitle:item.title || item.taskTitle || item.text || '',
      assignedToName:item.assignee?.email || item.assignee?.first_name || item.assignee?.name || item.assignee || '',
      dueDate:item.due_date || item.dueDate || '',
      status:item.completed ? 'completed in VAL' : 'from VAL',
      sourceQuote:item.title || ''
    };
  }).filter(Boolean);
}

function timelineSummaryObject(transcript = {}){
  const krispSections = timelineKrispSections(transcript);
  if(krispSections.overview){
    return {executiveSummary: krispSections.overview};
  }
  if(transcript.nativeSummary){
    return {executiveSummary: transcript.nativeSummary};
  }
  const summary = transcript.summary;
  if(summary && typeof summary === 'object') return summary;
  if(typeof summary === 'string') return {executiveSummary: summary};
  return {};
}

function timelineCompactText(value = '', limit = 220){
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if(text.length <= limit) return text;
  return text.slice(0, limit - 1).trim() + '...';
}

function timelineFirstSentence(value = '', fallback = ''){
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if(!text) return fallback;
  const match = text.match(/^(.{24,160}?[.!?])(?:\s|$)/);
  return timelineCompactText(match ? match[1] : text, 96);
}

function timelineTranscriptKnownTitle(transcript = {}){
  const summary = timelineSummaryObject(transcript);
  const text = [
    transcript.title,
    transcript.meetingTitle,
    transcript.summaryPreview,
    summary.executiveSummary,
    summary.clientSummary,
    transcript.preview
  ].filter(Boolean).join(' ');
  if(/\bGOALL\b|Goal Agency|agency call center|missed.?call|Apollo|Grace AI|projections dashboard/i.test(text)) return 'GOALL';
  return '';
}

function timelineTranscriptTitle(transcript = {}){
  const summary = timelineSummaryObject(transcript);
  const fromSummary = timelineFirstSentence(summary.executiveSummary || summary.clientSummary || '', '');
  const rawTitle = String(transcript.title || transcript.meetingTitle || 'Transcript').trim();
  const knownTitle = timelineTranscriptKnownTitle(transcript);
  if(knownTitle && (!rawTitle || /mammogram|wang building|screening|nope|untitled|transcript/i.test(rawTitle) || !new RegExp('\\b' + knownTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i').test(rawTitle))) return knownTitle;
  if(fromSummary && (/mammogram|nope|untitled|transcript/i.test(rawTitle) || rawTitle.length < 8)) return fromSummary;
  return timelineCompactText(rawTitle || fromSummary || 'Transcript', 96);
}

function timelineTranscriptMeta(transcript = {}){
  const date = transcript.receivedAt || transcript.createdAt || transcript.created_at || transcript.capturedAt || '';
  const parts = [
    transcript.source ? String(transcript.source).toUpperCase() : '',
    date ? new Date(date).toLocaleString([], {month:'short', day:'numeric', hour:'numeric', minute:'2-digit'}) : '',
    transcript.summaryStatus || transcript.processingStatus || ''
  ].filter(Boolean);
  return parts.join(' · ');
}

function timelineNativeActionItems(transcript = {}){
  const krispSections = timelineKrispSections(transcript);
  const krispStructured = timelineKrispStructuredActionItems(transcript);
  const native = Array.isArray(transcript.nativeActionItems) && transcript.nativeActionItems.length
    ? transcript.nativeActionItems
    : (krispStructured.length ? krispStructured : (krispSections.actionItems.length ? krispSections.actionItems : (transcript.krispNative && Array.isArray(transcript.actionItems) ? transcript.actionItems : [])));
  return native.map((item) => {
    if(typeof item === 'string') return {taskTitle:item, status:'from VAL'};
    if(!item || typeof item !== 'object') return null;
    return {
      taskTitle:item.taskTitle || item.title || item.text || item.action || item.summary || item.name || '',
      taskDescription:item.taskDescription || item.description || item.notes || item.detail || '',
      assignedToName:item.assignedToName || item.assignee || item.owner || item.person || '',
      dueDate:item.dueDate || item.due || item.deadline || '',
      status:item.status || 'from VAL',
      sourceQuote:item.sourceQuote || item.quote || ''
    };
  }).filter((item) => String(item?.taskTitle || '').trim());
}

function timelineTranscriptTasks(transcript = {}){
  const native = timelineNativeActionItems(transcript);
  if(native.length) return native;
  return (Array.isArray(transcript.tasks) ? transcript.tasks : [])
    .filter((task) => {
      const haystack = [task.taskTitle, task.taskDescription, task.sourceQuote].join(' ');
      if(!String(task.taskTitle || '').trim()) return false;
      if(/\bplay in the sprinkler\b|every third sentence|f-word|check that|send something out|diagnose it from there/i.test(haystack)) return false;
      return true;
    });
}

function timelineListItems(value){
  if(Array.isArray(value)) return value.filter(Boolean);
  if(typeof value === 'string' && value.trim()){
    const trimmed = value.trim();
    if(trimmed.startsWith('{') || trimmed.startsWith('[')){
      try{
        const parsed = JSON.parse(trimmed);
        if(Array.isArray(parsed)) return parsed.filter(Boolean);
        if(parsed && typeof parsed === 'object') return Object.values(parsed).filter(Boolean);
      }catch(_){}
    }
    return trimmed.split(/\n+|;\s*/).map((item) => item.replace(/^[-*]\s*/, '').trim()).filter(Boolean);
  }
  return [];
}

function renderTimelineListBlock(title, items, empty, mapper){
  const list = timelineListItems(items);
  if(!list.length) return '<section class="timeline-transcript-section"><h4>' + escapeHtml(title) + '</h4><p>' + escapeHtml(empty) + '</p></section>';
  return [
    '<section class="timeline-transcript-section">',
    '<h4>' + escapeHtml(title) + '</h4>',
    '<ul>',
    list.slice(0, 8).map((item) => '<li>' + (mapper ? mapper(item) : escapeHtml(typeof item === 'string' ? item : item.summary || item.title || item.update || JSON.stringify(item))) + '</li>').join(''),
    '</ul>',
    '</section>'
  ].join('');
}

function renderTimelineTranscriptStats(data = {}){
  if(!timelineStatusCount) return;
  const counts = data.counts || {};
  const total = Number(counts.total || currentTimelineTranscriptItems.length || 0);
  const needsReview = Number(counts.needsReview || 0);
  const openActions = Number(counts.withOpenActions || 0);
  const failed = Number(counts.failedProcessing || 0);
  timelineStatusCount.textContent = total ? total + ' transcript' + (total === 1 ? '' : 's') : 'No transcripts loaded';
  if(!timelineStatusPanel) return;
  const cards = [
    ['Recent Transcripts', total, 'Live VAL transcripts, uploads, and recovered transcript records.'],
    ['Need Review', needsReview, 'Items with participant matches, staged tasks, decisions, or updates needing judgment.'],
    ['Open Actions', openActions, 'VAL action items and reviewed follow-up work.'],
    ['Processing Issues', failed, failed ? 'These need repair before trusting extraction.' : 'No hard processing failures reported.']
  ];
  timelineStatusPanel.innerHTML = cards.map(([label, value, body]) => [
    '<article>',
    '<span>' + escapeHtml(label) + '</span>',
    '<strong>' + escapeHtml(value) + '</strong>',
    '<p>' + escapeHtml(body) + '</p>',
    '</article>'
  ].join('')).join('');
}

function renderTimelineTranscriptList(activeId = ''){
  if(!timelineEventList || !timelineEventCount) return;
  const items = currentTimelineTranscriptItems.slice(0, 40);
  timelineEventCount.textContent = items.length ? items.length + ' recent transcript' + (items.length === 1 ? '' : 's') : 'No transcripts found';
  if(!items.length){
    timelineEventList.innerHTML = '<article class="empty"><span>No transcripts found</span><p>VAL did not receive a transcript archive from the selected range. Use import, upload, or intake status to trace where the meeting landed.</p></article>';
    return;
  }
  timelineEventList.innerHTML = items.map((transcript) => {
    const summary = timelineSummaryObject(transcript);
    const tasks = Number(transcript.taskCount || transcript.openActionCount || 0);
    const active = String(activeId || '') === String(transcript.id || '');
    return [
      '<button type="button" class="timeline-transcript-row' + (active ? ' active' : '') + '" data-transcript-open="' + escapeHtml(transcript.id || '') + '">',
      '<span>' + escapeHtml(timelineTranscriptMeta(transcript) || 'Transcript') + '</span>',
      '<strong>' + escapeHtml(timelineTranscriptTitle(transcript)) + '</strong>',
      '<p>' + escapeHtml(timelineCompactText(summary.executiveSummary || summary.clientSummary || transcript.summary || 'Open to review the transcript details.', 170)) + '</p>',
      '<small>' + escapeHtml(tasks ? tasks + ' action item' + (tasks === 1 ? '' : 's') : 'No action items') + '</small>',
      '</button>'
    ].join('');
  }).join('');
}

function renderTimelineTranscriptEmpty(){
  if(!timelineReviewCards || !timelineReviewCount) return;
  if(transcriptEmpty) transcriptEmpty.hidden = true;
  if(transcriptDetail) transcriptDetail.hidden = true;
  timelineReviewCount.textContent = '';
  if(timelineReviewCards === transcriptDetail) return;
  timelineReviewCards.innerHTML = '';
}

function renderTimelineTranscriptDetail(transcript = {}){
  if(!timelineReviewCards || !timelineReviewCount) return;
  if(transcriptEmpty) transcriptEmpty.hidden = true;
  if(transcriptDetail) transcriptDetail.hidden = false;
  currentTimelineTranscript = transcript;
  const summary = timelineSummaryObject(transcript);
  const tasks = timelineTranscriptTasks(transcript);
  const decisions = transcript.canonical?.decisions || summary.keyDecisions || [];
  const relationshipUpdates = summary.relationshipUpdates || [];
  const participants = Array.isArray(transcript.participants) ? transcript.participants : [];
  const rawTitle = transcript.title || transcript.meetingTitle || '';
  const sourceText = transcript.transcriptText || transcript.rawTranscript || transcript.rawText || '';
  timelineReviewCount.textContent = timelineTranscriptTitle(transcript);
  const taskBlock = tasks.length ? [
    '<section class="timeline-transcript-section action-first">',
    '<h4>' + escapeHtml(transcript.krispNative ? 'VAL Action Items' : 'Action Items') + '</h4>',
    '<ul>',
    tasks.slice(0, 10).map((task) => [
      '<li>',
      '<strong>' + escapeHtml(String(task.taskTitle || '').replace(String(rawTitle || '') + ' — ', '')) + '</strong>',
      '<span>' + escapeHtml([task.assignedToName || 'Owner needs review', task.dueDate ? 'Due ' + task.dueDate : '', task.status || 'staged'].filter(Boolean).join(' · ')) + '</span>',
      task.taskDescription ? '<p>' + escapeHtml(task.taskDescription) + '</p>' : '',
      task.sourceQuote ? '<blockquote>' + escapeHtml(task.sourceQuote) + '</blockquote>' : '',
      '</li>'
    ].join('')).join(''),
    '</ul>',
    '</section>'
  ].join('') : renderTimelineListBlock('Action Items', [], 'No action items were provided with this transcript.');
  const decisionBlock = renderTimelineListBlock('Decisions', decisions, 'No decisions extracted yet.', (item) => escapeHtml(item.title || item.summary || item));
  const relationshipBlock = renderTimelineListBlock('Relationship / Project Signals', relationshipUpdates, 'No relationship or project signals extracted yet.', (item) => {
    if(typeof item === 'string') return escapeHtml(item);
    return '<strong>' + escapeHtml(item.name || item.project || 'Signal') + '</strong>' + (item.update ? '<p>' + escapeHtml(item.update) + '</p>' : '');
  });
  const participantBlock = renderTimelineListBlock('Participants', participants, 'No participant matches are available yet.', (item) => escapeHtml([item.matchedContactName || item.speakerNameRaw || item.name || 'Participant', item.matchConfidence ? Math.round(Number(item.matchConfidence) * 100) + '% match' : '', item.needsReview ? 'needs review' : ''].filter(Boolean).join(' · ')));
  timelineReviewCards.innerHTML = [
    '<article class="timeline-transcript-detail">',
    '<div class="timeline-transcript-titlebar">',
    '<div><span>' + escapeHtml(timelineTranscriptMeta(transcript)) + '</span><h4>' + escapeHtml(timelineTranscriptTitle(transcript)) + '</h4>' + (rawTitle && rawTitle !== timelineTranscriptTitle(transcript) ? '<small>Stored title: ' + escapeHtml(rawTitle) + '</small>' : '') + '</div>',
    '<div class="timeline-transcript-actions">',
    '<button type="button" data-transcript-action="draft_followup" data-transcript-id="' + escapeHtml(transcript.id || '') + '">Draft follow-up</button>',
    '<button type="button" data-transcript-action="create_task" data-transcript-id="' + escapeHtml(transcript.id || '') + '">Create task</button>',
    '<button type="button" data-transcript-reprocess="' + escapeHtml(transcript.id || '') + '">Reprocess</button>',
    '</div>',
    '</div>',
    taskBlock,
    '<section class="timeline-transcript-section"><h4>' + escapeHtml(transcript.krispNative ? 'VAL Summary' : 'Summary') + '</h4><p>' + escapeHtml(summary.executiveSummary || summary.clientSummary || 'Summary pending.') + '</p></section>',
    decisionBlock,
    relationshipBlock,
    participantBlock,
    '<section class="timeline-transcript-section timeline-transcript-cowork"><h4>Co-Work on This Transcript</h4><div class="timeline-transcript-chat" data-transcript-chat-log><p>Ask who said what, what changed, what should become a proposal, or what VAL can prepare from this meeting.</p></div><div class="timeline-transcript-chat-input"><input data-transcript-chat-input placeholder="Ask VAL about this transcript"><button type="button" data-transcript-chat="' + escapeHtml(transcript.id || '') + '">Ask</button></div></section>',
    '<button type="button" class="transcript-view-full" data-transcript-full-toggle>View full transcript</button>',
    '<div class="transcript-full-text" data-transcript-full hidden>' + escapeHtml(timelineCompactText(sourceText || 'No transcript text is available.', 5000)) + '</div>',
    '<p class="timeline-transcript-receipt" data-transcript-action-status></p>',
    '</article>'
  ].join('');
}

async function openTimelineTranscript(transcriptId){
  if(!transcriptId) return;
  renderTimelineTranscriptList(transcriptId);
  if(timelineReviewCards) timelineReviewCards.innerHTML = '<article class="empty"><span>Opening transcript</span><p>VAL is loading transcript intelligence, action items, source text, and Co-Work context.</p></article>';
  try{
    const data = await getJson('/api/val/transcripts/' + encodeURIComponent(transcriptId));
    if(!data?.transcript) throw new Error('Transcript detail was empty.');
    renderTimelineTranscriptDetail(data.transcript);
  }catch(error){
    if(timelineReviewCards) timelineReviewCards.innerHTML = '<article class="empty"><span>Could not open transcript</span><p>' + escapeHtml(error.message || 'Transcript detail unavailable.') + '</p></article>';
  }
}

async function loadTimelineTranscripts({openFirst = true} = {}){
  renderTimelineTranscriptStats({counts:{}});
  if(timelineEventList) timelineEventList.innerHTML = '<article class="empty"><span>Loading transcripts</span><p>VAL is reading the durable transcript archive.</p></article>';
  renderTimelineTranscriptEmpty();
  if(!canUseApi) return;
  try{
    const data = await getJson('/api/val/transcripts?days=3650&limit=250');
    currentTimelineTranscriptItems = Array.isArray(data.transcripts) ? data.transcripts : [];
    renderTimelineTranscriptStats(data);
    renderTimelineTranscriptList(currentTimelineTranscript?.id || '');
    if(openFirst && currentTimelineTranscriptItems[0]?.id) await openTimelineTranscript(currentTimelineTranscriptItems[0].id);
  }catch(error){
    if(timelineStatusCount) timelineStatusCount.textContent = 'Transcript archive unavailable';
    if(timelineEventList) timelineEventList.innerHTML = '<article class="empty"><span>Unable to load transcripts</span><p>' + escapeHtml(error.message || 'Transcript archive unavailable.') + '</p></article>';
    renderTimelineTranscriptEmpty();
  }
}

async function timelineTranscriptAsk(transcriptId){
  const input = document.querySelector('[data-transcript-chat-input]');
  const log = document.querySelector('[data-transcript-chat-log]');
  const question = input?.value?.trim();
  if(!transcriptId || !question || !log) return;
  input.value = '';
  log.insertAdjacentHTML('beforeend', '<p class="user">' + escapeHtml(question) + '</p><p data-transcript-chat-pending>Working from this transcript...</p>');
  try{
    const data = await postJson('/api/val/transcripts/' + encodeURIComponent(transcriptId) + '/chat', {question});
    document.querySelector('[data-transcript-chat-pending]')?.remove();
    const message = data.message?.content || data.message || 'No response was returned.';
    log.insertAdjacentHTML('beforeend', '<p>' + escapeHtml(message) + '</p>');
  }catch(error){
    document.querySelector('[data-transcript-chat-pending]')?.remove();
    log.insertAdjacentHTML('beforeend', '<p>Unable to answer from this transcript: ' + escapeHtml(error.message || 'Request failed.') + '</p>');
  }
}

async function timelineTranscriptAction(transcriptId, action){
  const status = document.querySelector('[data-transcript-action-status]');
  if(status) status.textContent = 'VAL is preparing this from the selected transcript...';
  try{
    const data = await postJson('/api/val/transcripts/' + encodeURIComponent(transcriptId) + '/actions', {action});
    if(status) status.textContent = action === 'draft_followup'
      ? 'Draft saved for approval: ' + (data.draft?.subject || 'follow-up draft')
      : 'Task created or staged: ' + (data.task?.title || 'transcript task');
    await openTimelineTranscript(transcriptId);
  }catch(error){
    if(status) status.textContent = 'Action stayed blocked: ' + (error.message || 'Request failed.');
  }
}

async function timelineTranscriptReprocess(transcriptId){
  const status = document.querySelector('[data-transcript-action-status]');
  if(status) status.textContent = 'Reprocessing this transcript while preserving the raw source...';
  try{
    await postJson('/api/val/transcripts/reprocess', {transcriptId, limit:1});
    if(status) status.textContent = 'Reprocessed. Reloading transcript intelligence...';
    await loadTimelineTranscripts({openFirst:false});
    await openTimelineTranscript(transcriptId);
  }catch(error){
    if(status) status.textContent = 'Reprocess failed: ' + (error.message || 'Request failed.');
  }
}

function setTranscriptImportStatus(message, state = ''){
  const status = document.querySelector('[data-transcript-import-status]');
  if(!status) return;
  status.textContent = publicSurfaceText(message);
  if(state) status.dataset.state = state;
  else delete status.dataset.state;
}

async function showKrispManualImportStatus(){
  setTranscriptImportStatus('Checking VAL transcript connection...', 'working');
  try{
    const data = await getJson('/api/val/krisp/status');
    if(data?.configured){
      setTranscriptImportStatus('VAL is receiving transcripts automatically; manual import still needs its action restored.', 'warning');
    }else{
      setTranscriptImportStatus(data?.message || 'VAL transcript intake is not connected yet.', 'needs-connection');
    }
  }catch(error){
    setTranscriptImportStatus(error.message || 'Could not check VAL transcript intake.', 'error');
  }
}

function renderTimelineStatus(data = null){
  if(!timelineStatusPanel || !timelineStatusCount) return;
  const counts = data?.counts || {};
  const events = Array.isArray(data?.timelineEvents) ? data.timelineEvents : [];
  const unmatched = Array.isArray(data?.unmatchedTranscripts) ? data.unmatchedTranscripts : [];
  const proposals = Array.isArray(data?.proposedTranscriptReviews) ? data.proposedTranscriptReviews : [];
  const needsMatching = events.filter((event) => event.reviewStage === 'needs_matching' || event.reviewNeeded).length + unmatched.length;
  const readyToExtract = events.filter((event) => event.reviewStage === 'ready_to_extract' || event.transcriptStatus === 'attached').length;
  const proposedTasks = proposals.filter((proposal) => proposal.type === 'task').length;
  const proposedNotes = proposals.filter((proposal) => proposal.type !== 'task').length;
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
      value: data?.ok ? proposedNotes + ' proposal' + (proposedNotes === 1 ? '' : 's') : 'Meaning, not mush',
      body: proposedNotes ? 'Notes must name the decision, commitment, risk, opportunity, or relationship context they preserve.' : 'No note proposal packet is loaded yet; keep review in the event queue until transcript evidence is extracted.'
    },
    {
      label: 'Proposed Tasks',
      value: data?.ok ? proposedTasks + ' proposal' + (proposedTasks === 1 ? '' : 's') : 'Specific work',
      body: proposedTasks ? 'Tasks must include source excerpt, owner, due date or review-needed date, project, relationship, and why it matters.' : 'No task proposal packet is loaded yet; do not imply a task exists until owner, due date, relationship, project, and source quote are present.'
    }
  ];
  timelineStatusCount.textContent = data?.ok ? 'Transcript context connected' : 'Local transcript review structure';
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
    timelineReviewCards.innerHTML = '<article class="empty"><span>Review-only</span><p>The event queue may show transcript review needs, but no proposal packet is loaded here yet. Notes and tasks appear only when source excerpts, relationships, project, owner, due date, and approval boundary can be inspected.</p></article>';
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
    sourceLabel: review?.title || review?.eventTitle || review?.transcriptTitle || 'Transcript proposal',
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
    sourceLabel: candidate?.label ? 'Transcript match: ' + candidate.label : source.sourceLabel,
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
    return postJson('/api/val/review-updates/' + encodeURIComponent(updateId) + '/approve', {note:'Approved from Transcripts review.'});
  }
  if(action === 'rejected'){
    return postJson('/api/val/review-updates/' + encodeURIComponent(updateId) + '/reject', {reason:'Rejected from Transcripts review.'});
  }
  return postJson('/api/val/review-updates/' + encodeURIComponent(updateId) + '/edit', {note:'Marked needs edit from Transcripts review.'});
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
    title: 'Co-Work with VAL about Transcripts.',
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
    helper: 'This Co-Work note is tagged to Transcripts. Creating final notes/tasks or linking records still requires review.',
    backWorkflow: 'cancel:timeline'
  });
}

async function hydrateTimelineStatus(){
  await loadTimelineTranscripts({openFirst:true});
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
  const sourceLabel = sourceActionLabel(sourceItem, roomName === 'leverage' ? 'Open prepared work' : 'Open source behind this judgment');
  const workspace = {
    lens: roomName === 'leverage' ? 'Leverage Item' : 'Velocity Item',
    title: executiveHomeBriefTitle(sourceItem, item.title, roomName),
    meaning: executiveHomeMeaning(sourceItem, item.summary, roomName),
    understanding: [
      ...executiveHomeUnderstanding(sourceItem, item.title, roomName),
      sourceItem.confidence != null ? 'Confidence: ' + Math.round(Number(sourceItem.confidence) * 100) + '%' : '',
      'Priority ' + item.priority + ' in ' + (roomName === 'leverage' ? 'Leverage' : 'Velocity') + '.'
    ].filter(Boolean),
    recommendation: executiveHomeRecommendation(sourceItem, roomName),
    actions: suggestedHomeActionsForItem(sourceItem, roomName, sourceLabel),
    sourceItem,
    cardType: roomName === 'leverage' ? 'ready_for_you_queue_item' : 'what_changed_queue_item',
    packetReceipt: {}
  };
  setWorkspaceContent({...workspace, label: 'Home ' + roomLabel + ' source workspace'});
  activeHomeWorkspace = {roomName, workspace};
  openWorkspaceShell('Home ' + roomLabel + ' source workspace', {returnTarget:'home'});
  document.querySelectorAll('.living-room').forEach((room) => {
    room.classList.toggle('active-room', room.dataset.room === roomName);
  });
}

function homeSourceContextLines(item = {}, fallbackTitle = 'Supporting source'){
  const identity = sourceIdentityForItem(item);
  return [
    'Home source: ' + (identity.label || fallbackTitle),
    identity.type ? 'Source type: ' + identity.type : '',
    identity.id ? 'Source id: ' + identity.id : '',
    ...sourceOfSourceLines(item)
  ].filter(Boolean);
}

function homeSourceTypeLabel(value = ''){
  const raw = String(value || 'source').trim();
  const labels = {
    what_changed: 'movement',
    highest_leverage: 'priority',
    ready_for_you: 'prepared work',
    gmail_email: 'email',
    google_calendar: 'calendar',
    relationship_profile: 'relationship',
    project_profile: 'project'
  };
  return labels[raw] || raw.replace(/_/g, ' ');
}

function homePacketDisplayFields(item = {}, roomName = 'velocity'){
  const identity = sourceIdentityForItem(item);
  const title = itemTitle(item, roomName === 'leverage' ? 'Prepared work' : 'Home item');
  const meaning = itemMeaning(item, item.summary || item.reason || title);
  const refs = sourceOfSourceLines(item);
  const sourceType = identity.type || item.sourceType || item.source_type || item.type || 'source';
  const sourceTypeLabel = homeSourceTypeLabel(sourceType);
  const timestamp = item.timestamp || item.createdAt || item.updatedAt || item.receivedAt || item.date || item.start || '';
  const artifactKind = preparedArtifactKind(item);
  const actionLabel = roomName === 'leverage'
    ? (artifactKind ? 'Open and approve ' + artifactKind.replace(/_/g, ' ') : 'Open prepared work')
    : roomName === 'alignment'
      ? (isEmailSourceItem(item) ? 'Draft reply or create task' : 'Do this priority now')
      : sourceActionLabel(item, 'Open ' + sourceTypeLabel + ' source');
  return {
    what_changed: roomName === 'leverage'
      ? (preparedArtifactHomeCopy(item)?.observation || title)
      : title,
    why_it_matters: meaning || 'VAL found this because it may affect attention, follow-through, or trust.',
    what_val_now_knows: executiveHomeMeaning(item, meaning, roomName),
    evidence_summary: refs.join(' ') || ((identity.label || title) + ' from ' + sourceTypeLabel),
    recommended_next_step: executiveHomeRecommendation(item, roomName),
    primary_action_label: actionLabel,
    cowork_context: [
      'Home mode: ' + roomName,
      'Event/context: ' + title,
      'Why it matters: ' + (meaning || title),
      'Evidence: ' + (refs.join(' | ') || identity.label || sourceType),
      'Recommended next step: ' + executiveHomeRecommendation(item, roomName)
    ].join('\n'),
    source_type: sourceTypeLabel,
    source_label: identity.label || title,
    source_id: identity.id || '',
    timestamp,
    sourceItem: item
  };
}

function renderHomePacketRows(roomName, items = []){
  if(!scraperPreviewList) return;
  scraperPreviewList.hidden = false;
  scraperPreviewList.classList.remove('linkedin-preview-list');
  scraperPreviewList.innerHTML = '<div class="home-packet-list" aria-label="' + escapeHtml(roomName) + ' packet list">' +
    items.map((queueItem, index) => {
      const fields = homePacketDisplayFields(queueItem.sourceItem || queueItem, roomName);
      const primaryAction = roomName === 'leverage' ? 'open_prepared' : 'open_source';
      const rowActions = [
        '<button type="button" data-home-action="' + primaryAction + '" data-home-room-item-action="' + escapeHtml(roomName) + '" data-home-room-index="' + index + '">' + escapeHtml(fields.primary_action_label) + '</button>'
      ].filter(Boolean).join('');
      return '<article class="home-packet-row">' +
        '<div data-home-room-source="' + escapeHtml(roomName) + '" data-home-room-index="' + index + '"' +
          ' data-source-type="' + escapeHtml(fields.source_type) + '"' +
          ' data-source-id="' + escapeHtml(fields.source_id) + '"' +
          ' data-source-label="' + escapeHtml(fields.source_label) + '">' +
          '<p class="home-packet-eyebrow">' + escapeHtml(fields.source_type) + (fields.timestamp ? ' · ' + escapeHtml(fields.timestamp) : '') + '</p>' +
          '<h3>' + escapeHtml(fields.what_changed) + '</h3>' +
          '<p>' + escapeHtml(fields.why_it_matters) + '</p>' +
          '<small>' + escapeHtml(fields.evidence_summary) + '</small>' +
        '</div>' +
        '<div class="home-packet-actions">' +
          rowActions +
        '</div>' +
      '</article>';
    }).join('') +
  '</div>';
}

function homeWorkspaceFromQueueItem(roomName, index){
  const queueItem = (homeRoomQueues[roomName] || [])[Number(index)];
  if(!queueItem) return null;
  const item = queueItem.sourceItem || queueItem;
  const fields = homePacketDisplayFields(item, roomName);
  return {
    lens: roomName === 'alignment' ? 'Alignment' : roomName === 'leverage' ? 'Leverage' : 'Velocity',
    title: fields.what_changed,
    meaning: fields.why_it_matters,
    understanding: [
      'What VAL now knows: ' + fields.what_val_now_knows,
      'Evidence: ' + fields.evidence_summary,
      fields.timestamp ? 'Timestamp/source receipt: ' + fields.timestamp : '',
      fields.source_type ? 'Source type: ' + fields.source_type : ''
    ].filter(Boolean),
    recommendation: fields.recommended_next_step,
    actions: roomName === 'leverage'
      ? [
          {label: fields.primary_action_label, homeAction: 'open_prepared'},
          {label: 'Approve and execute', homeAction: 'approve_prepared'}
        ]
      : [
          {label: fields.primary_action_label, homeAction: 'open_source'}
        ],
    sourceItem: item,
    cardType: roomName === 'leverage' ? 'ready_for_you' : roomName === 'alignment' ? 'highest_leverage' : 'what_changed',
    coworkContext: fields.cowork_context,
    packetFields: fields,
    packetReceipt: {}
  };
}

function activateHomeQueueItem(roomName, index){
  const workspace = homeWorkspaceFromQueueItem(roomName, index);
  if(!workspace) return null;
  activeHomeWorkspace = {roomName, workspace};
  activeClarityWorkspace = workspace;
  return workspace;
}

function executiveHomeBriefTitle(item = {}, fallbackTitle = 'Meaningful movement', roomName = ''){
  if(isEmailSourceItem(item)){
    return 'Email decision: ' + itemTitle(item, fallbackTitle);
  }
  const title = itemTitle(item, fallbackTitle);
  const profile = targetProfile(item);
  if(roomName === 'leverage') return title;
  if(profile.key === 'source' && /VAL learned \d+/i.test(title)) return 'Working memory changed: test what VAL now believes.';
  return title;
}

function executiveHomeMeaning(item = {}, fallbackSummary = '', roomName = ''){
  if(isEmailSourceItem(item)){
    const email = homeEmailPayload(item);
    return compactSentence(email.reason || email.snippet || fallbackSummary, 'This email may need a reply or a dated follow-up task.');
  }
  const title = itemTitle(item, fallbackSummary);
  const meaning = itemMeaning(item, fallbackSummary);
  if(/VAL learned \d+/i.test(title)){
    return 'VAL promoted onboarding learning into working memory. The executive shift is that future recommendations may now follow those truths, so the useful move is to spot-check a live workflow and correct any bad assumption immediately.';
  }
  const genericMovementLine = ['something', 'changed', 'that', 'may', 'affect', 'the', 'next', 'step'].join(' ');
  if(meaning && meaning.toLowerCase().replace(/\.$/, '') !== genericMovementLine) return meaning;
  const profile = targetProfile(item);
  if(profile.key === 'relationship') return 'A relationship signal changed. Decide whether this person needs a reply, a follow-up task, or simply continued watching.';
  if(profile.key === 'project') return 'A project signal changed. Decide what should move, pause, or be protected today.';
  if(profile.key === 'meeting') return 'A calendar signal changed. Decide whether this meeting needs prep, a follow-up, or a next step.';
  if(profile.key === 'opportunity') return 'A pipeline signal changed. Decide the next owner, next date, and next move.';
  if(roomName === 'leverage') return 'VAL prepared something you can review, refine, or approve without rebuilding the context.';
  return 'A source changed, but VAL does not yet have enough human-readable context attached. Treat this as a review gap, not an action-ready recommendation.';
}

function executiveHomeUnderstanding(item = {}, fallbackTitle = 'Supporting source', roomName = ''){
  const identity = sourceIdentityForItem(item);
  const profile = targetProfile(item);
  const title = itemTitle(item, fallbackTitle);
  const meaning = executiveHomeMeaning(item, '', roomName);
  if(/VAL learned \d+/i.test(title)){
    return [
      'Shift: working memory was updated from onboarding review.',
      'Why it matters: this can change what VAL prioritizes, drafts, and protects next.',
      'Decision needed: test one live workflow and teach VAL if the recommendation feels off.',
      ...sourceOfSourceLines(item)
    ];
  }
  return [
    'Source: ' + (identity.label || title),
    profile.noun ? 'Surface: ' + profile.noun : '',
    meaning ? 'Executive meaning: ' + meaning : '',
    ...sourceOfSourceLines(item)
  ].filter(Boolean);
}

function executiveHomeRecommendation(item = {}, roomName = ''){
  if(isEmailSourceItem(item)) return 'Open the email only if you need more context, then draft the reply or create a follow-up task with a due date.';
  const title = itemTitle(item, '');
  if(/VAL learned \d+/i.test(title)) return 'Do one live spot-check now: open the source evidence, verify the memory change is useful, then teach VAL the correction if the next recommendation is wrong.';
  return suggestedRecommendationForHomeItem(item, roomName);
}

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
  renderWhyTodayPanel(executiveBriefingState, executiveBriefingState ? 'loaded' : 'waiting');
  switches.forEach((button) => {
    button.classList.toggle('active', button.dataset.stateOption === nextState);
  });
}

function renderWorkspace(roomName){
  const content = currentState.rooms && currentState.rooms[roomName];
  if(!content || !content.workspace || !content.workspace.title) return false;
  const workspace = normalizeWorkspaceForClarity(content.workspace);
  activeHomeWorkspace = {roomName, workspace};
  activeClarityWorkspace = workspace;
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
  const eventDescription = meetingPrepEventDescription(event);
  renderMeetingPrepExecutiveBrief(meetingPrepExecutiveBrief({
    brief:{
      meetingContextJson:{title:eventTitle,startTime:event.startTime||event.start||'',source:event.source||'hearth'},
      attendeeIntelligenceJson:[],
      internalContextJson:{},
      briefJson:{meeting_title:eventTitle, likely_purpose:eventDescription || 'Prepare for the meeting from the calendar title and known relationship/project context.'},
      suggestedQuestionsJson:[],
      followUpPreparationJson:{},
      sourceRefsJson:[]
    }
  }));
}

function meetingPrepAttendeeIdentityLines(attendees = []){
  activeMeetingContactCandidates = {};
  const lines = [];
  attendees.forEach((attendee, index) => {
    const name = attendee.name || attendee.email || 'Calendar attendee';
    if(attendee.crm_contact_id){
      lines.push(name + ' is organized under CRM contact ' + attendee.crm_contact_id + '.');
      return;
    }
    const unresolved = attendee.unresolved_relationship_context || {};
    const candidate = unresolved.contact_creation_candidate;
    if(candidate){
      const key = 'attendee_' + index;
      activeMeetingContactCandidates[key] = {attendee, candidate};
      lines.push(name + ' is not in CRM yet. Create the contact before VAL attaches relationship context. [[contact-candidate:' + key + ']]');
      return;
    }
    lines.push(name + ' has not resolved to a CRM contact yet.');
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

function meetingPrepSourceLabel(label = ''){
  return String(label || 'unknown').replace(/_/g, ' ');
}

function meetingPrepSourceSummary(brief = {}){
  const labels = []
    .concat(brief.meetingContextJson?.source_confidence_label || [])
    .concat(brief.internalContextJson?.source_confidence_label || [])
    .concat(Array.isArray(brief.suggestedQuestionsJson) ? brief.suggestedQuestionsJson.map((question) => question.source_confidence_label) : [])
    .concat(Array.isArray(brief.attendeeIntelligenceJson) ? brief.attendeeIntelligenceJson.map((attendee) => attendee.source_confidence_label) : [])
    .filter(Boolean)
    .map(meetingPrepSourceLabel);
  return Array.from(new Set(labels)).slice(0,4).join(', ') || 'only the calendar title and time are available';
}

function meetingPrepQualityLine(brief = {}){
  const gate = brief.qualityGateJson || {};
  const issues = Array.isArray(gate.issues) ? gate.issues : [];
  if(gate.quality === 'unusable') return 'Quality gate: not usable yet. Missing: ' + (issues.join(', ') || 'usable calendar context') + '.';
  if(!gate.quality || gate.quality === 'unknown') return 'Quality gate: not enough context to prepare reliably yet.';
  return 'Quality gate: ' + (gate.quality || 'unknown') + (issues.length ? ' with caution: ' + issues.join(', ') : '') + '.';
}

function meetingPrepAttendeeSummary(brief = {}){
  const attendees = Array.isArray(brief.attendeeIntelligenceJson) ? brief.attendeeIntelligenceJson : [];
  if(!attendees.length) return 'Attendees: no attendee identity is attached yet.';
  const resolved = attendees.filter((attendee) => attendee.crm_contact_id).length;
  return 'Attendees: ' + resolved + ' resolved, ' + (attendees.length - resolved) + ' unresolved.';
}

function meetingPrepStakesLine(brief = {}){
  const stakes = brief.meetingStakesJson || {};
  const levels = [
    stakes.relationship_stakes && 'relationship ' + stakes.relationship_stakes,
    stakes.revenue_stakes && 'revenue ' + stakes.revenue_stakes,
    stakes.trust_stakes && 'trust ' + stakes.trust_stakes,
    stakes.opportunity_stakes && 'opportunity ' + stakes.opportunity_stakes
  ].filter(Boolean);
  return levels.length ? 'Stakes: ' + levels.join(', ') + '.' : 'Stakes: not enough evidence to judge yet.';
}

function meetingPrepFollowUpLine(followUp = {}){
  if(!followUp || !Object.keys(followUp).length) return 'Follow-up: not prepared yet.';
  if(followUp.likely_follow_up_needed) return 'Follow-up: likely needed after the meeting; approval required before anything is sent or created.';
  return 'Follow-up: no action required yet.';
}

function meetingPrepActionsFromBrief(brief = {}){
  return [{label:'Co-Work with VAL', workflow:'meetingPrepCowork'}];
}

function meetingPrepHasUsefulContext(brief = {}){
  const prep = brief.briefJson || {};
  const stakes = brief.meetingStakesJson || {};
  const firstFive = brief.firstFiveMinutesJson || {};
  const questions = Array.isArray(brief.suggestedQuestionsJson) ? brief.suggestedQuestionsJson : [];
  const attendees = Array.isArray(brief.attendeeIntelligenceJson) ? brief.attendeeIntelligenceJson : [];
  const sourceSummary = meetingPrepSourceSummary(brief);
  return Boolean(
    firstFive.first_sentence_option ||
    questions.some((question) => question.text) ||
    attendees.some((attendee) => attendee.crm_contact_id || attendee.relationship_status || attendee.open_loop) ||
    prep.concise_brief && !/^VAL prepared context for/i.test(prep.concise_brief) ||
    Object.values(stakes).some(Boolean) ||
    sourceSummary !== 'only the calendar title and time are available'
  );
}

function meetingPrepBulletList(items = [], fallback = ''){
  const list = (Array.isArray(items) ? items : [items]).map(compactSentence).filter(Boolean).slice(0, 6);
  if(!list.length && fallback) list.push(fallback);
  return list;
}

function meetingPrepLocalRelationshipContext(event = {}, brief = {}){
  const text = [meetingPrepEventTitle(event), meetingPrepEventDescription(event), JSON.stringify(brief.meetingContextJson || {})].join(' ').toLowerCase();
  if(/aric|frisson|helpbyshopping/.test(text)) return relationshipProfiles.aric;
  const attendees = Array.isArray(brief.attendeeIntelligenceJson) ? brief.attendeeIntelligenceJson : [];
  const aric = attendees.find((attendee) => /aric/i.test(String(attendee.name || attendee.email || '')));
  return aric ? relationshipProfiles.aric : null;
}

function meetingPrepLocalProjectContext(event = {}, brief = {}){
  const text = [meetingPrepEventTitle(event), meetingPrepEventDescription(event), JSON.stringify(brief.internalContextJson || {})].join(' ').toLowerCase();
  if(/frisson|helpbyshopping|nonprofit/.test(text)) return projectProfiles.frisson;
  const links = Array.isArray(brief.internalContextJson?.project_context_links) ? brief.internalContextJson.project_context_links : [];
  const frisson = links.find((link) => /frisson/i.test(String(link.project_name || link.project_id || '')));
  return frisson ? projectProfiles.frisson : null;
}

function meetingPrepReadiness(brief = {}, relationship = null, project = null){
  let score = 42;
  const prepared = [];
  const missing = [];
  const attendees = Array.isArray(brief.attendeeIntelligenceJson) ? brief.attendeeIntelligenceJson : [];
  const calendarAttendees = Array.isArray(brief.meetingContextJson?.attendees) ? brief.meetingContextJson.attendees : [];
  const hasAttendeeEmail = attendees.concat(calendarAttendees).some((attendee) => attendee?.email || attendee?.address || attendee?.emailAddress?.address);
  if(brief.meetingContextJson?.title){score += 10; prepared.push('Calendar event reviewed');} else missing.push('Calendar event title');
  if(relationship){score += 18; prepared.push('Relationship context reviewed');} else missing.push('Relationship file not matched yet');
  if(project){score += 14; prepared.push('Project context reviewed');} else missing.push('Project context not matched yet');
  if(attendees.some((attendee) => attendee.crm_contact_id)){score += 10; prepared.push('Attendee identity resolved');}
  else if(hasAttendeeEmail){score += 6; prepared.push('Attendee emails reviewed'); missing.push('CRM identity not resolved yet');}
  else missing.push('No attendee email attached');
  if(Array.isArray(brief.internalContextJson?.openLoops) && brief.internalContextJson.openLoops.length){score += 8; prepared.push('Previous open loops reviewed');}
  else if(Array.isArray(brief.internalContextJson?.transcripts) && brief.internalContextJson.transcripts.length){score += 6; prepared.push('Prior transcript context reviewed');}
  else missing.push('No previous call notes or open loops attached');
  if(meetingPrepSourceSummary(brief) !== 'only the calendar title and time are available'){score += 8; prepared.push('Source confidence reviewed');}
  else missing.push('No public profile or recent activity loaded yet');
  return {
    score: Math.max(15, Math.min(96, Math.round(score))),
    label: score >= 82 ? 'You are well prepared.' : score >= 62 ? 'You have enough to enter well.' : 'VAL needs more context before this is fully prepared.',
    prepared,
    missing: missing.slice(0, 4)
  };
}

function meetingPrepExecutiveBrief(result = {}){
  const event = activeMeetingPrepEvent || meetingPrep.event;
  const brief = result.brief || {};
  const prep = brief.briefJson || {};
  const firstFive = brief.firstFiveMinutesJson || {};
  const questions = Array.isArray(brief.suggestedQuestionsJson) ? brief.suggestedQuestionsJson : [];
  const followUp = brief.followUpPreparationJson || {};
  const relationship = meetingPrepLocalRelationshipContext(event, brief);
  const project = meetingPrepLocalProjectContext(event, brief);
  const readiness = meetingPrepReadiness(brief, relationship, project);
  const eventTitle = prep.meeting_title || meetingPrepEventTitle(event);
  const isFrisson = /frisson|aric|helpbyshopping/i.test([eventTitle, meetingPrepEventDescription(event), relationship?.name, project?.name].join(' '));
  const purpose = isFrisson
    ? 'Move Frisson from vision into execution by clarifying partnership structure, responsibilities, pilot path, and first implementation timeline.'
    : compactSentence(prep.likely_purpose || prep.concise_brief || 'Clarify what this meeting needs to decide, protect, or move next.');
  const success = isFrisson
    ? ['Revenue model is clear', 'Ownership and responsibilities are named', 'Pilot nonprofit path is chosen', 'First implementation timeline is agreed']
    : meetingPrepBulletList(prep.what_val_recommends_preparing, 'Leave with a clear next step and no hidden follow-up.');
  const changed = isFrisson
    ? ['Frisson has become the primary brand direction.', 'The work has shifted from broad consulting toward an executive AI platform.', 'The operating philosophy is clearer: alignment, stewardship, and leverage.', 'The nonprofit launch path is a practical first market.']
    : meetingPrepBulletList(prep.recent_changes || brief.internalContextJson?.openLoops?.map((item) => item.summary || item.title || item.text || item), 'No meaningful prior changes are attached yet.');
  const decisions = isFrisson
    ? ['Revenue sharing model', 'Responsibilities after launch', 'Pilot nonprofit rollout', 'Client ownership', 'Technology roadmap']
    : meetingPrepBulletList(['What outcome matters most today?', 'Who owns the next step?', 'What should happen after the conversation?']);
  const remember = relationship
    ? compactSentence(relationship.wisdom || relationship.meaning || 'Enter through relationship stewardship, not performance.')
    : 'Keep this simple: be warm, clear, and honest about what is known and unknown.';
  const risks = isFrisson
    ? ['Do not spend most of the meeting refining ideas that are already aligned.', 'Protect time for execution decisions.']
    : meetingPrepBulletList(prep.risks_or_sensitivities, 'Do not over-use thin context. Ask clean questions instead.');
  const opportunities = isFrisson
    ? ['If pilot organizations are agreed, VAL can help prepare the partnership document, implementation session, and rollout timeline.']
    : meetingPrepBulletList(prep.possible_opportunities, 'If the next step becomes clear, VAL can help shape the follow-through after the meeting.');
  const opening = isFrisson
    ? 'I am excited because I think we have moved past whether Frisson is the right direction. Today I would love to leave with clarity on how we launch together.'
    : (firstFive.first_sentence_option || 'I would love to start by naming what would make this conversation useful for you today.');
  const questionTexts = questions.map((question) => question.text).filter(Boolean);
  const suggestedQuestions = isFrisson
    ? ['What part of this excites you most?', 'Where do you still feel uncertainty?', 'What would make this partnership feel effortless?', 'If we had our first five nonprofits, what would success look like?']
    : meetingPrepBulletList(questionTexts, firstFive.early_question || 'What would make this meeting a good use of your time today?');
  const followUpItems = followUp.likely_follow_up_needed || isFrisson
    ? ['Draft partnership document', 'Schedule implementation session', 'Create rollout timeline']
    : ['Capture what changed after the meeting before creating tasks or drafts.'];
  const relationshipName = relationship?.name || (Array.isArray(brief.attendeeIntelligenceJson) && brief.attendeeIntelligenceJson[0]?.name) || 'Attendee identity not resolved yet';
  return {
    eventTitle,
    time: meetingPrepEventTime(event),
    readiness,
    purpose,
    success,
    changed,
    decisions,
    remember,
    risks,
    opportunities,
    opening,
    questions: suggestedQuestions,
    followUpItems,
    people: relationship ? [
      relationship.name + ' - ' + (relationship.role || 'relationship context'),
      'Current relationship: ' + (relationship.relationshipStateLabel || relationship.temperature || 'known relationship'),
      'Trajectory: ' + (relationship.trajectory || 'watch thoughtfully'),
      'Stewardship: ' + compactSentence(relationship.wisdom || relationship.meaning || '')
    ].filter(Boolean) : [
      relationshipName,
      'Relationship file has not been matched yet.',
      'Use Co-Work to add what VAL should know before the call.'
    ],
    relationshipIntelligence: relationship ? [
      compactSentence(relationship.identity || relationship.role || ''),
      'What matters to them: ' + compactSentence(relationship.patterns || relationship.meaning || ''),
      'Recent signal: ' + compactSentence(relationship.signal || relationship.evidence || ''),
      'Public context: ' + compactSentence(relationship.linkedinSignal || 'LinkedIn and Outscraper signals should be refreshed only if useful for the relationship.')
    ].filter(Boolean) : [
      'Public profile and recent activity are not verified yet.',
      'Outscraper should be used as relationship intelligence, not generic enrichment.'
    ],
    project: project ? [
      project.name + ': ' + compactSentence(project.status || project.reality || ''),
      'Current decision: ' + compactSentence(project.decision || project.nextMove || ''),
      'Why it matters: ' + compactSentence(project.decisionEvidence || project.nextMoveEvidence || '')
    ].filter(Boolean) : [],
    missing: readiness.missing,
    sourceConfidence: meetingPrepSourceSummary(brief),
    coworkSeed: ''
  };
}

function renderMeetingPrepList(items = []){
  return '<ul>' + items.map((item) => '<li>' + escapeHtml(item) + '</li>').join('') + '</ul>';
}

function meetingPrepCoworkSeed(briefing = {}){
  return [
    'Co-work with me before this meeting.',
    '',
    'Meeting: ' + compactSentence(briefing.eventTitle, 'Meeting'),
    briefing.time ? 'Time: ' + briefing.time : '',
    'Readiness: ' + briefing.readiness?.score + '% - ' + (briefing.readiness?.label || ''),
    '',
    'Purpose: ' + briefing.purpose,
    '',
    'Success today:',
    ...(briefing.success || []).map((item) => '- ' + item),
    '',
    'People:',
    ...(briefing.people || []).map((item) => '- ' + item),
    '',
    'What changed since we last talked:',
    ...(briefing.changed || []).map((item) => '- ' + item),
    '',
    'Likely decisions:',
    ...(briefing.decisions || []).map((item) => '- ' + item),
    '',
    'Remember: ' + briefing.remember,
    '',
    'Risks:',
    ...(briefing.risks || []).map((item) => '- ' + item),
    '',
    'Opportunities:',
    ...(briefing.opportunities || []).map((item) => '- ' + item),
    '',
    'Suggested opening: "' + briefing.opening + '"',
    '',
    'Suggested questions:',
    ...(briefing.questions || []).map((item, index) => (index + 1) + '. ' + item),
    '',
    'Likely follow-up:',
    ...(briefing.followUpItems || []).map((item) => '- ' + item)
  ].filter((line) => line !== '').join('\n');
}

function renderMeetingPrepExecutiveBrief(briefing = {}){
  activeMeetingPrepBriefing = briefing;
  activeMeetingPrepBriefing.coworkSeed = meetingPrepCoworkSeed(briefing);
  setWorkspaceContent({
    lens: 'Meeting Prep',
    title: briefing.eventTitle || 'Meeting Prep',
    meaning: briefing.purpose || 'Walk into the meeting prepared.',
    understanding: ['Executive readiness: ' + briefing.readiness.score + '%', 'The briefing below is the useful prep; Co-Work is the only action.'],
    recommendation: briefing.opening || 'Use Co-Work if you want VAL to help shape the conversation before you enter.',
    actions: [{label:'Co-Work with VAL', workflow:'meetingPrepCowork'}],
    label: 'Meeting Prep executive briefing',
    suppressClarityStandard:true
  });
  if(workspaceGrid) workspaceGrid.hidden = true;
  scraperPreviewList.hidden = false;
  scraperPreviewList.classList.add('meeting-prep-brief');
  scraperPreviewList.innerHTML = [
    '<section class="meeting-prep-readiness">',
      '<div><span>Executive Readiness</span><strong>' + escapeHtml(String(briefing.readiness.score)) + '%</strong><p>' + escapeHtml(briefing.readiness.label) + '</p></div>',
      '<div class="meeting-prep-meter" aria-label="Executive readiness ' + escapeHtml(String(briefing.readiness.score)) + ' percent"><i style="width:' + escapeHtml(String(briefing.readiness.score)) + '%"></i></div>',
    '</section>',
    '<section class="meeting-prep-section"><h3>The Purpose</h3><p>' + escapeHtml(briefing.purpose) + '</p><h4>Success today</h4>' + renderMeetingPrepList(briefing.success) + '</section>',
    '<section class="meeting-prep-section"><h3>Who You Are Meeting</h3>' + renderMeetingPrepList(briefing.people) + '</section>',
    '<section class="meeting-prep-section"><h3>What Changed Since You Last Spoke</h3>' + renderMeetingPrepList(briefing.changed) + '</section>',
    '<section class="meeting-prep-section"><h3>Relationship Intelligence</h3>' + renderMeetingPrepList(briefing.relationshipIntelligence) + '</section>',
    briefing.project.length ? '<section class="meeting-prep-section"><h3>Project Context</h3>' + renderMeetingPrepList(briefing.project) + '</section>' : '',
    '<section class="meeting-prep-section"><h3>Likely Decisions</h3>' + renderMeetingPrepList(briefing.decisions.map((item) => '□ ' + item)) + '</section>',
    '<section class="meeting-prep-section"><h3>Remember</h3><p>' + escapeHtml(briefing.remember) + '</p></section>',
    '<section class="meeting-prep-two"><article><h3>Risks</h3>' + renderMeetingPrepList(briefing.risks) + '</article><article><h3>Opportunities</h3>' + renderMeetingPrepList(briefing.opportunities) + '</article></section>',
    '<section class="meeting-prep-section meeting-prep-opening"><h3>Suggested Opening</h3><p>"' + escapeHtml(briefing.opening) + '"</p></section>',
    '<section class="meeting-prep-section"><h3>Suggested Questions</h3><ol>' + briefing.questions.map((item) => '<li>' + escapeHtml(item) + '</li>').join('') + '</ol></section>',
    '<section class="meeting-prep-section"><h3>Likely Follow-Up</h3>' + renderMeetingPrepList(briefing.followUpItems) + '</section>',
    briefing.missing.length ? '<section class="meeting-prep-section meeting-prep-missing"><h3>Still Missing</h3>' + renderMeetingPrepList(briefing.missing) + '</section>' : ''
  ].filter(Boolean).join('');
  workspaceActions.innerHTML = renderWorkspaceActionButtons([{label:'Co-Work with VAL', workflow:'meetingPrepCowork'}]);
  updateDrawerCoworkIcon();
}

function renderMeetingPrepResult(result){
  renderMeetingPrepExecutiveBrief(meetingPrepExecutiveBrief(result));
}

async function runMeetingPrep(){
  const event = activeMeetingPrepEvent || meetingPrep.event;
  if(mockScrapers || !canUseApi){
    renderMeetingPrep();
    return;
  }
  try{
    const result = await postJson('/api/val/calendar/meeting-prep', {event});
    renderMeetingPrepResult(result);
  }catch(error){
    setWorkspaceContent({
      lens: 'Meeting Prep',
      title: calendarEventIsMeeting(event) ? 'Meeting prep needs attention.' : 'This calendar item is not a meeting.',
      meaning: 'VAL did not take any external action. The prep brief could not be assembled cleanly.',
      understanding: [
        error.message,
        calendarEventIsMeeting(event) ? 'The calendar card remains available.' : 'No external attendee is attached, so VAL will treat this as a private calendar block.',
        calendarEventIsMeeting(event) ? 'Co-Work can still help you prepare from what is visible.' : 'Private blocks can inform rhythm and capacity, but they do not receive meeting prep.'
      ],
      recommendation: calendarEventIsMeeting(event) ? 'Use Co-Work to prepare manually from the meeting title and what you already know.' : 'Choose a calendar event with attendees for meeting prep.',
      actions: calendarEventIsMeeting(event) ? [{label: 'Co-Work with VAL', workflow: 'meetingPrepCowork'}] : [],
      label: 'Meeting prep error workspace',
      suppressClarityStandard:true
    });
    updateDrawerCoworkIcon();
  }
}

function setWorkspaceContent({lens,title,meaning,understanding,recommendation,actions,label,packetReceipt,sourceItem,cardType,suppressClarityStandard}){
  activeHomeWorkspace = null;
  if(!/home co-work/i.test(String(label || ''))) deskWorkspace.classList.remove('home-cowork-mode');
  if(!/board of observers/i.test(String(label || lens || ''))) deskWorkspace.classList.remove('observer-board-mode');
  const preserveHeldCoworkContext = /co-work|cowork/i.test(String(lens || '') + ' ' + String(title || ''));
  const normalizedWorkspace = (suppressClarityStandard || preserveHeldCoworkContext)
    ? {lens,title,meaning,understanding, recommendation, actions, sourceItem, cardType}
    : normalizeWorkspaceForClarity({lens,title,meaning,understanding,recommendation,actions,sourceItem,cardType});
  activeClarityWorkspace = normalizedWorkspace;
  deskWorkspace.classList.remove('witnessing-mode');
  workspaceKicker.textContent = normalizedWorkspace.lens;
  workspaceTitle.textContent = normalizedWorkspace.title;
  workspaceMeaning.textContent = normalizedWorkspace.meaning;
  renderJudgmentSequence(normalizedWorkspace, normalizedWorkspace.lens);
  renderPaperLabels(normalizedWorkspace, normalizedWorkspace.lens);
  renderAgencyNote(normalizedWorkspace, normalizedWorkspace.lens);
  workspacePapers.meaning.textContent = normalizedWorkspace.meaning;
  workspacePapers.understanding.innerHTML = (normalizedWorkspace.understanding || []).map((item) => '<li>' + escapeHtml(item) + '</li>').join('');
  workspacePapers.recommendation.textContent = normalizedWorkspace.recommendation;
  workspaceActions.innerHTML = renderWorkspaceActionButtons(normalizedWorkspace.actions);
  renderHearthPacketReceiptStrip(packetReceipt || null);
  deskWorkspace.setAttribute('aria-label', label || normalizedWorkspace.lens + ' workspace');
  if(workspaceGrid) workspaceGrid.hidden = false;
  scraperCriteriaPanel.hidden = true;
  scraperCriteriaPanel.innerHTML = '';
  scraperPreviewList.hidden = true;
  scraperPreviewList.innerHTML = '';
  scraperPreviewList.classList.remove('linkedin-preview-list', 'meeting-prep-brief');
  workspaceInputPanel.hidden = true;
  workspaceInputPanel.innerHTML = '';
  applyHearthClickContracts(deskWorkspace);
}

function shouldShowPacketReceipts(){
  return false;
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
  if(!shouldShowPacketReceipts() || !packet || !packet.packetName){
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
  if(/board of observers/.test(lens)) return ['Truth', 'Evidence', 'Tension', 'Synthesis'];
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
  if(/temperature/.test(lens)) return ['What shifted', 'Evidence VAL used', 'What to decide'];
  if(/velocity/.test(lens)) return ['What moved', 'Why it matters', 'What to do now'];
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
  if(/board of observers/.test(lens)) return 'The Board makes VAL inspectable. It does not replace your judgment.';
  if(/meeting/.test(lens)) return 'Meeting prep stays private until you choose what to use.';
  if(/lead|scraper|approval|connection/.test(lens)) return 'Nothing enters CRM until the preview is reviewed and approved.';
  if(/co-work|cowork|notebook/.test(lens)) return 'Co-Work can become work only when you choose to shape it.';
  if(/teach/.test(lens)) return 'Teaching stays reviewable before VAL turns it into memory.';
  return 'VAL will wait for your judgment before anything moves.';
}

function renderAgencyNote(workspace = {}, roomName = ''){
  if(!agencyNote) return;
  agencyNote.textContent = agencyNoteForLens(workspace, roomName);
}

function renderWorkspaceActionButtons(actions = []){
  return actions.filter((action) => {
    const spec = typeof action === 'string' ? {label: action} : action;
    return !/co-?work|cowork/i.test(String(spec.label || '')) && !/^cowork/i.test(String(spec.workflow || ''));
  }).map((action, index) => {
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
      spec.projectAction ? ' data-project-action="' + escapeHtml(spec.projectAction) + '"' : '',
      spec.packet ? ' data-val-variable-packet="' + escapeHtml(spec.packet) + '"' : '',
      spec.workflow ? ' onclick="event.preventDefault();event.stopPropagation();handleWorkflowAction(this.dataset.workflowAction,this);return false;"' : '',
      spec.homeAction ? ' onclick="event.preventDefault();event.stopPropagation();handleHomeRoomAction(this.dataset.homeAction,this);return false;"' : '',
      spec.projectAction ? ' onclick="event.preventDefault();event.stopPropagation();handleProjectActionClick(this.dataset.projectAction,this);return false;"' : ''
    ].join('');
    return '<button type="button"' + attrs + '>' + escapeHtml(label) + '</button>';
  }).join('');
}

function contextualCoworkHeading(title = ''){
  const clean = compactSentence(String(title || '').replace(/^Co-Work with VAL:?/i, ''), '');
  if(!clean) return 'What shall we accomplish together?';
  return 'How can I help with ' + clean.replace(/\.$/, '') + '?';
}

function coworkPublicDetail(returnTarget = 'home'){
  const labels = {
    home: 'VAL is ready to work with what you choose next.',
    relationship: 'VAL is holding this relationship privately.',
    project: 'VAL is holding this project privately.',
    timeline: 'VAL is holding the timeline privately.',
    correspondence: 'VAL is holding this reply privately.',
    commitment: 'VAL is holding this commitment privately.',
    document: 'VAL is holding this document privately.',
    val: 'VAL is holding this context privately.',
    workspace: 'VAL is holding this card privately.'
  };
  return labels[returnTarget] || 'VAL is holding the relevant context privately.';
}

function drawerCoworkContext(mode = ''){
  if(mode === 'relationship'){
    const profile = activeRelationshipProfile || relationshipProfiles.aric;
    return {
      returnTarget: 'relationship',
      title: 'Relationship: ' + (profile?.name || 'active relationship'),
      meaning: 'VAL is holding the active relationship context privately.',
      context: [
        'Relationship: ' + (profile?.name || 'Unknown'),
        'Current reality: ' + (profile?.evidence || ''),
        'Executive assessment: ' + (profile?.patterns || ''),
        'Strategic importance: ' + (profile?.meaning || '')
      ],
      placeholder: 'What should VAL help you think through about this relationship?'
    };
  }
  if(mode === 'project'){
    const project = activeProjectProfile || projectProfiles.frisson;
    return {
      returnTarget: 'project',
      title: 'Project: ' + (project?.name || 'active project'),
      meaning: 'VAL is holding the active project context privately.',
      context: [
        'Project: ' + (project?.name || 'Unknown'),
        'Current reality: ' + (project?.reality || project?.status || ''),
        'Source receipts: ' + (project?.sourceReceipts || '')
      ],
      placeholder: 'What should VAL help you think through about this project?'
    };
  }
  if(mode === 'timeline'){
    const firstProposal = currentTimelineReviewItems?.[0] || null;
    return {
      returnTarget: 'timeline',
      title: firstProposal?.eventTitle ? 'Transcript: ' + firstProposal.eventTitle : 'Transcripts',
      meaning: 'VAL is holding calendar, transcript, task, and follow-through context privately.',
      context: [
        firstProposal?.title ? 'Proposal: ' + firstProposal.title : '',
        firstProposal?.eventTitle ? 'Event: ' + firstProposal.eventTitle : '',
        firstProposal?.project ? 'Project: ' + firstProposal.project : '',
        firstProposal?.relationships?.length ? 'Relationships: ' + firstProposal.relationships.join(', ') : ''
      ],
      placeholder: 'What should VAL help you understand or prepare from the timeline?'
    };
  }
  if(mode === 'correspondence'){
    const item = activeCorrespondenceItem || {};
    return {
      returnTarget: 'correspondence',
      title: 'Reply: ' + compactSentence(item.title || item.subject || 'selected message', 'selected message'),
      meaning: item.whyNow || item.summary || 'VAL is holding this Executive Inbox item privately.',
      context: [
        'Prepared item: ' + (item.title || item.subject || 'Reply draft'),
        'Relationship/project: ' + (item.context || ''),
        'VAL prepared: ' + (item.prepared || ''),
        'Needs from user: ' + (item.needs || '')
      ],
      placeholder: 'What should VAL help you decide or rewrite about this reply?'
    };
  }
  if(mode === 'commitment'){
    const item = activeCommitmentItem || {};
    return {
      returnTarget: 'commitment',
      title: 'Commitment: ' + compactSentence(item.title || 'selected commitment', 'selected commitment'),
      meaning: item.description || item.evidence_quote || 'VAL is holding this commitment privately.',
      context: [
        'Commitment: ' + (item.title || 'Untitled'),
        'Owner: ' + [item.owner_name, commitmentLabel(item.owner_type)].filter(Boolean).join(' - '),
        'Counterparty: ' + (item.counterparty_name || ''),
        'Due: ' + commitmentDueLabel(item.due_at),
        'Evidence: ' + (item.evidence_quote || ''),
        'Next action: ' + (item.next_action || '')
      ],
      placeholder: 'What should VAL help you decide or prepare for this commitment?'
    };
  }
  if(mode === 'document'){
    const item = activeDocumentItem || {};
    return {
      returnTarget: 'document',
      title: 'Document: ' + compactSentence(item.title || 'selected document', 'selected document'),
      meaning: 'VAL is holding this document context privately.',
      context: [
        'Document: ' + (item.title || 'Untitled'),
        'Relationship: ' + (item.relationship || ''),
        'Project: ' + (item.project || ''),
        'Source: ' + (item.source || item.origin || ''),
        'Reference use: ' + (item.referenceUse || '')
      ],
      placeholder: 'What should VAL help you do with this document?'
    };
  }
  return {
    returnTarget: 'home',
    title: 'VAL workspace',
    meaning: 'VAL is holding the active context privately.',
    context: [],
    placeholder: 'What should VAL help you think through here?'
  };
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
  if(profile.key === 'opportunity') return item.opportunityName || item.name || item.title || 'CRM opportunity';
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
  if(status) status.textContent = publicSurfaceText(message);
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
  const dataLabel = ' data-criteria-label="' + field.label + '" data-criteria-key="' + (field.key || field.label) + '"';
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

function revealLeadSourcingWorkbench(){
  if(!leadSourcingDrawerWorkbench) return;
  leadSourcingDrawerWorkbench.hidden = false;
}

function scrollLeadSourcingWorkbenchIntoView(){
  if(!leadSourcingDrawerWorkbench) return;
  window.requestAnimationFrame(() => {
    leadSourcingDrawerWorkbench.scrollIntoView({block:'start', inline:'nearest', behavior:'smooth'});
  });
}

function leadSourcingEmptyBoard(){
  if(!leadDrawerPreviewList) return;
  leadDrawerPreviewList.hidden = false;
  leadDrawerPreviewList.innerHTML = [
    '<div class="preview-list-head"><span>Live sourcing board</span><small>Select one of the two scrapers above to begin.</small></div>',
    '<div class="lead-sourcing-board idle" data-lead-sourcing-board>',
      '<section class="lead-sourcing-column" data-level="1"><div><span>Level 1</span><h4>Discovery</h4></div><article class="lead-stage-row empty"><strong>Waiting for a scraper</strong><span>Organizations or partners</span><small>VAL will list discovered companies here.</small></article></section>',
      '<section class="lead-sourcing-column" data-level="2"><div><span>Level 2</span><h4>Decision Maker</h4></div><article class="lead-stage-row empty"><strong>Waiting for viable leads</strong><span>No contact is invented.</span><small>Decision-maker candidates attach after discovery.</small></article></section>',
      '<section class="lead-sourcing-column" data-level="3"><div><span>Level 3</span><h4>Confirm / Dedupe</h4></div><article class="lead-stage-row empty"><strong>Waiting for review</strong><span>Approval stays before import.</span><small>CRM duplicate review and source evidence land here.</small></article></section>',
    '</div>'
  ].join('');
}

function renderScraperCriteria(workflow, type){
  if(!workflow.criteria) return;
  const criteria = workflow.criteria;
  revealLeadSourcingWorkbench();
  leadDrawerCriteriaPanel.hidden = false;
  if(leadDrawerPreviewList) leadDrawerPreviewList.hidden = true;
  leadDrawerCriteriaPanel.innerHTML = [
    '<section class="criteria-card">',
      '<h3>' + criteria.title + '</h3>',
      '<div class="criteria-grid">' + criteria.fields.map(renderCriteriaField).join('') + '</div>',
      '<div class="lead-sourcing-actions">',
        '<button type="button" data-lead-drawer-action="save-trainer" data-lead-drawer-type="' + (type || activeScraperType || '') + '">Save training</button>',
        '<button type="button" data-lead-drawer-action="preview" data-lead-drawer-type="' + (type || activeScraperType || '') + '">Run this scraper</button>',
      '</div>',
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
  const isImportedStage = stage === 'imported';
  const stageLabel = isImportedStage ? 'Imported records' : stage === 'verified' ? 'Verified preview' : 'Live preview - not imported';
  const stageSummary = isImportedStage
    ? 'These rows have an import receipt. Review skipped or failed rows before running another batch.'
    : 'These are live scraper preview results. Approve or hold each row before any CRM import.';
  revealLeadSourcingWorkbench();
  if(leadDrawerCriteriaPanel) leadDrawerCriteriaPanel.hidden = true;
  leadDrawerPreviewList.hidden = false;
  leadDrawerPreviewList.innerHTML = [
    '<div class="preview-list-head"><span>' + stageLabel + '</span><small data-preview-summary>' + stageSummary + '</small></div>',
    '<div class="lead-sourcing-board" data-lead-sourcing-board>',
      '<section class="lead-sourcing-column" data-level="1"><div><span>Level 1</span><h4>Discovery</h4></div>' +
        leads.map((lead, index) => (
          '<article class="lead-stage-row" data-lead-stage-index="' + index + '">' +
            '<strong>' + escapeHtml(lead.name) + '</strong>' +
            '<span>' + escapeHtml(lead.type) + '</span>' +
            '<small>' + escapeHtml(lead.location) + '</small>' +
            '<b>' + escapeHtml(lead.score) + '</b>' +
          '</article>'
        )).join('') +
      '</section>',
      '<section class="lead-sourcing-column" data-level="2"><div><span>Level 2</span><h4>Decision Maker</h4></div>' +
        leads.map((lead, index) => (
          '<article class="lead-stage-row" data-lead-stage-index="' + index + '">' +
            '<strong>' + escapeHtml(lead.contact || 'Decision maker not confirmed') + '</strong>' +
            '<span>' + (lead.contact && !/not confirmed|general inbox/i.test(lead.contact) ? 'Candidate attached' : 'Needs confirmation') + '</span>' +
            '<small>' + escapeHtml(lead.name) + '</small>' +
          '</article>'
        )).join('') +
      '</section>',
      '<section class="lead-sourcing-column" data-level="3"><div><span>Level 3</span><h4>Confirm / Dedupe</h4></div>' +
        leads.map((lead, index) => (
          '<article class="preview-lead lead-stage-row" data-lead-index="' + index + '" data-lead-review="' + (lead._approved === false ? 'held' : 'approved') + '">' +
            '<div class="lead-confirm-main">' +
              '<strong>' + escapeHtml(lead.name) + '</strong>' +
              '<span>' + escapeHtml(lead.evidence) + '</span>' +
            '</div>' +
            '<div class="lead-confirm-status">' +
              '<b>' + (isImportedStage ? 'Imported' : 'Preview only') + '</b>' +
              '<small>' + (isImportedStage ? 'Import receipt attached.' : 'Not in CRM yet. Duplicate check is enforced again at import.') + '</small>' +
            '</div>' +
            '<div class="preview-controls" aria-label="Review decision for ' + escapeHtml(lead.name) + '">' +
              '<button type="button" class="preview-choice' + (lead._approved === false ? '' : ' active') + '" data-preview-choice="approved">Approve</button>' +
              '<button type="button" class="preview-choice' + (lead._approved === false ? ' active' : '') + '" data-preview-choice="held">Hold</button>' +
            '</div>' +
          '</article>'
        )).join('') +
      '</section>',
    '</div>',
    '<div class="lead-sourcing-actions">',
      '<button type="button" data-lead-drawer-action="import" data-lead-drawer-type="' + (activeScraperType || '') + '">Import approved leads</button>',
      '<button type="button" data-lead-drawer-action="train" data-lead-drawer-type="' + (activeScraperType || '') + '">Train this scraper</button>',
    '</div>'
  ].join('');
  updatePreviewApprovalSummary();
}

function renderLeadSourcingProgress(type){
  if(!leadDrawerPreviewList) return;
  const definition = leadScraperDefinitions[type] || {};
  revealLeadSourcingWorkbench();
  if(leadDrawerCriteriaPanel) leadDrawerCriteriaPanel.hidden = true;
  leadDrawerPreviewList.hidden = false;
  leadDrawerPreviewList.innerHTML = [
    '<div class="preview-list-head"><span>Live sourcing run</span><small>VAL is preparing the preview. Nothing is entering CRM.</small></div>',
    '<div class="lead-sourcing-board loading" data-lead-sourcing-board>',
      '<section class="lead-sourcing-column active" data-level="1"><div><span>Level 1</span><h4>Discovery</h4></div><article class="lead-stage-row"><strong>Scanning sources</strong><span>' + escapeHtml(definition.userLabel || 'Scraper') + '</span><small>Public and configured source discovery is running.</small></article></section>',
      '<section class="lead-sourcing-column" data-level="2"><div><span>Level 2</span><h4>Decision Maker</h4></div><article class="lead-stage-row"><strong>Waiting for viable leads</strong><span>Decision-maker context attaches after discovery.</span><small>No contact is invented.</small></article></section>',
      '<section class="lead-sourcing-column" data-level="3"><div><span>Level 3</span><h4>Confirm / Dedupe</h4></div><article class="lead-stage-row"><strong>Waiting for preview rows</strong><span>CRM duplicate and verification gates stay before import.</span><small>Approval will happen here.</small></article></section>',
    '</div>'
  ].join('');
}

function renderLeadSourcingMessage(type, title, details = [], actionLabel = 'Train this scraper'){
  if(!leadDrawerPreviewList) return;
  const definition = leadScraperDefinitions[type] || {};
  revealLeadSourcingWorkbench();
  if(leadDrawerCriteriaPanel) leadDrawerCriteriaPanel.hidden = true;
  leadDrawerPreviewList.hidden = false;
  leadDrawerPreviewList.innerHTML = [
    '<div class="preview-list-head"><span>' + escapeHtml(title) + '</span><small>Nothing has been imported into CRM.</small></div>',
    '<div class="lead-sourcing-board idle" data-lead-sourcing-board>',
      '<section class="lead-sourcing-column active" data-level="1"><div><span>Level 1</span><h4>Discovery</h4></div><article class="lead-stage-row"><strong>' + escapeHtml(definition.userLabel || 'Scraper') + '</strong><span>' + escapeHtml(details[0] || 'The source run needs attention.') + '</span><small>Adjust the scraper training before running again.</small></article></section>',
      '<section class="lead-sourcing-column" data-level="2"><div><span>Level 2</span><h4>Decision Maker</h4></div><article class="lead-stage-row empty"><strong>Paused</strong><span>' + escapeHtml(details[1] || 'Decision-maker enrichment did not run yet.') + '</span><small>No contact was invented.</small></article></section>',
      '<section class="lead-sourcing-column" data-level="3"><div><span>Level 3</span><h4>Confirm / Dedupe</h4></div><article class="lead-stage-row empty"><strong>Protected</strong><span>' + escapeHtml(details[2] || 'Approval and duplicate gates remain in place.') + '</span><small>No CRM write happened.</small></article></section>',
    '</div>',
    '<div class="lead-sourcing-actions">',
      '<button type="button" data-lead-drawer-action="train" data-lead-drawer-type="' + (type || activeScraperType || 'organizations') + '">' + escapeHtml(actionLabel) + '</button>',
    '</div>'
  ].join('');
}

function updatePreviewApprovalSummary(){
  const rows = Array.from(leadDrawerPreviewList.querySelectorAll('.preview-lead'));
  if(!rows.length) return;
  const approved = rows.filter((row) => row.dataset.leadReview !== 'held').length;
  const held = rows.length - approved;
  const summary = leadDrawerPreviewList.querySelector('[data-preview-summary]');
  if(summary){
    const sourceMode = mockScrapers || !canUseApi ? 'Prototype/mock preview' : 'Live scraper preview';
    summary.textContent = sourceMode + ' - ' + approved + ' approved / ' + held + ' held - not imported until you click Import.';
  }
  const importAction = workspaceActions.querySelector('[data-workflow-action^="import:"]');
  if(importAction){
    importAction.textContent = approved ? 'Import ' + approved + ' approved lead' + (approved === 1 ? '' : 's') : 'No approved leads';
    importAction.disabled = approved === 0;
  }
  const drawerImportAction = leadDrawerPreviewList.querySelector('[data-lead-drawer-action="import"]');
  if(drawerImportAction){
    drawerImportAction.textContent = approved ? 'Import ' + approved + ' approved lead' + (approved === 1 ? '' : 's') : 'No approved leads';
    drawerImportAction.disabled = approved === 0;
  }
}

function activeLeadIntelligenceSource(action = '', extra = {}){
  const type = activeScraperType || extra.type || '';
  const session = type ? sessionFor(type) : {};
  const rows = leadDrawerPreviewList ? Array.from(leadDrawerPreviewList.querySelectorAll('.preview-lead')) : [];
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
  return Array.from(leadDrawerCriteriaPanel.querySelectorAll('[data-criteria-label]')).reduce((values, field) => {
    values[field.dataset.criteriaLabel] = field.value;
    values[field.dataset.criteriaKey] = field.value;
    return values;
  }, {});
}

function publicSurfaceText(value){
  return String(value == null ? '' : value)
    .replace(/\bCRM\s*\/\s*CRM\b/gi, 'CRM')
    .replace(/\bCRM\s*\/\s*GHL\b/gi, 'CRM')
    .replace(/\bGHL\s*\/\s*CRM\b/gi, 'CRM')
    .replace(/\bGHL\b/g, 'CRM')
    .replace(/\bGoHighLevel\b/gi, 'CRM')
    .replace(/\bKrisp\b/gi, 'VAL')
    .replace(/\bCrisp\b/gi, 'VAL')
    .replace(/\bOutscraper\b/gi, 'VAL')
    .replace(/\bRocketReach\b/gi, 'VAL')
    .replace(/\bApollo\b/gi, 'VAL');
}

function escapeHtml(value){
  return publicSurfaceText(value).replace(/[&<>"']/g, (char) => ({
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

async function postJson(url, payload, options = {}){
  const controller = options.timeoutMs && window.AbortController ? new AbortController() : null;
  const timeoutId = controller ? window.setTimeout(() => controller.abort(), options.timeoutMs) : null;
  let response;
  try{
    response = await fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload),
      signal: controller?.signal
    });
  }catch(error){
    if(error.name === 'AbortError'){
      throw new Error(options.timeoutMessage || 'Request timed out before VAL received a usable response.');
    }
    throw error;
  }finally{
    if(timeoutId) window.clearTimeout(timeoutId);
  }
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
  return ['cancel','calendar','linkedin','relationshipAllPeople','projectAllProjects'].includes(command);
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

function hearthHumanContextLabel(value = ''){
  const normalized = String(value || '').replace(/[{}]/g, '').trim();
  const labels = {
    'calendar.upcoming': 'upcoming calendar events',
    'calendar.current_event.internal_context': 'relationship, email, and project context for this event',
    'calendar.current_event.attendee_resolution': 'resolved attendee identities',
    'calendar.today': 'today\'s calendar',
    'recent_transcripts.open_loops': 'open loops from recent transcripts',
    'emails.thread.current.summary': 'the current email thread summary',
    'tasks.open': 'open tasks',
    'relationships.current.current_thread_history': 'relationship history for this source',
    'projects.linked_to_relationship': 'projects linked to this relationship',
    'emails.thread.current.messages': 'current email thread messages',
    'home.card.sourceRefs': 'source references for this Home card',
    'evidence.current_item': 'evidence for this item',
    'rules.val_os.behavior_packet': 'VAL behavior rules'
  };
  return labels[normalized] || normalized.replace(/\./g, ' ').replace(/_/g, ' ');
}

function hearthHumanContextList(items = [], limit = 6){
  const labels = items.map(hearthHumanContextLabel).filter(Boolean);
  return labels.slice(0, limit).join(', ') + (labels.length > limit ? ' +' + (labels.length - limit) + ' more' : '');
}

function hearthPacketMissingLines(packet = {}){
  const missing = Array.isArray(packet.missingRequired) ? packet.missingRequired : [];
  const gaps = Array.isArray(packet.providerGaps) ? packet.providerGaps : [];
  const partials = Array.isArray(packet.providerPartials) ? packet.providerPartials : [];
  return [
    missing.length ? 'Missing context: ' + hearthHumanContextList(missing) : '',
    gaps.length ? 'Unavailable providers: ' + hearthHumanContextList(gaps) : '',
    partials.length ? 'Partially available context: ' + hearthHumanContextList(partials) : '',
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
  if(hearthPacketShouldSkip(action, resolvedPacketName)){
    const packet = localHearthMetadataPacket({packetName:resolvedPacketName, action, node, source});
    return {ok:true,packet,status:packet.status};
  }
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
    const fallbackSourceLabel = payload.source.sourceLabel || payload.source.sourceItem?.name || payload.source.sourceItem?.title || payload.source.sourceId || action || resolvedPacketName;
    const packet = {
      ...(error.data || {}),
      packetName:(error.data || {}).packetName || resolvedPacketName,
      status:(error.data || {}).status || 'blocked',
      source:(error.data || {}).source || payload.source,
      click:(error.data || {}).click || payload.click,
      receipt:{
        ...((error.data || {}).receipt || {}),
        id:(error.data || {}).receipt?.id || 'packet_error_' + Date.now().toString(36),
        sourceReceipts:Array.isArray((error.data || {}).receipt?.sourceReceipts) && (error.data || {}).receipt.sourceReceipts.length
          ? (error.data || {}).receipt.sourceReceipts
          : [{label:fallbackSourceLabel, sourceType:payload.source.sourceType || 'client_context', key:payload.source.sourceId || action || resolvedPacketName}],
        summary:(error.data || {}).receipt?.summary || error.message
      },
      missingRequired:Array.isArray((error.data || {}).missingRequired) ? error.data.missingRequired : [],
      providerGaps:Array.isArray((error.data || {}).providerGaps) ? error.data.providerGaps : ['packet_builder_unavailable']
    };
    lastHearthPacketReceipt = packet;
    renderHearthPacketReceiptStrip(packet);
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
    implication: subject + ' is ready to review before anything moves into CRM.',
    invitation: 'Would you like to review the proposal?',
    action: 'Review proposal draft',
    workspaceTitle: subject,
    workspaceMeaning: 'VAL prepared the proposal shape from the transcript and kept it waiting for approval.',
    recommendation: 'Review the decision points first. Nothing should be sent or moved in CRM until it still feels true.'
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
  openWorkspaceShell('LinkedIn visibility workspace', {returnTarget:'home'});
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

function sourceActionLabel(item, fallback = 'Open source behind this judgment'){
  const target = item?.target || {};
  const kind = preparedArtifactKind(item);
  if(isEmailSourceItem(item)) return 'Open email';
  if(kind === 'proposal_draft') return 'Review proposal draft';
  if(kind === 'html_page_draft') return 'Review page draft';
  if(kind === 'calendar_invite_draft') return 'Review calendar invite';
  if(kind === 'introduction_email_draft') return 'Review introduction';
  if(kind === 'email_draft') return 'Review email draft';
  const raw = String(target.type || item?.targetType || item?.source_type || item?.sourceType || item?.review_type || item?.reviewType || item?.draftType || '').toLowerCase();
  if(/opportunity|pipeline|deal/.test(raw) || item?.opportunityId || item?.metadata?.opportunityId || item?.metadataJson?.opportunityId) return 'Open CRM opportunity';
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
    noun: 'CRM opportunity',
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
    noun: 'supporting source',
    whyOpen: 'VAL has a supporting source attached to this judgment.',
    reviewPosture: 'Use the attached source to confirm what changed, then decide whether to act or teach VAL a correction.'
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
  const label = itemTitle(item, target.label || target.name || item.title || item.name || id || 'Supporting source');
  return {type, id:String(id || ''), label};
}

function sourceOfSourceLines(item = {}){
  const metadata = item.metadata || item.metadataJson || {};
  const rawRefs = item.sourceRefsJson || item.source_refs || item.sourceRefs || metadata.sourceRefs || metadata.source_refs || item.evidence || [];
  const refs = Array.isArray(rawRefs) ? rawRefs : [];
  const lines = refs.map((ref, index) => {
    if(typeof ref === 'string') return ref;
    const type = ref.source_type || ref.sourceType || ref.type || ref.label || 'evidence';
    const quote = ref.quote_or_summary || ref.quoteOrSummary || ref.summary || ref.detail || ref.content || '';
    if(quote) return quote;
    if(/observation/i.test(type)) return 'A stored observation is linked to this signal.';
    if(/evidence/i.test(type)) return 'Stored evidence is linked to this signal.';
    return 'A supporting ' + String(type).replace(/_/g, ' ') + ' is linked to this signal.';
  }).filter(Boolean);
  if(lines.length) return lines.slice(0,4);
  if(item.messageId || metadata.messageId) return ['The original Gmail message is attached to this signal.'];
  if(item.target?.type || item.sourceType || item.source_type) return ['The related ' + sourceDestinationLabel(item) + ' is attached.'];
  return ['The supporting source needs review before taking action.'];
}

function suggestedRecommendationForHomeItem(item = {}, roomName = ''){
  if(isEmailSourceItem(item)) return 'Reply if the relationship needs it, or create a dated follow-up task if the next move is yours.';
  const kind = preparedArtifactKind(item);
  if(kind) return preparedArtifactHomeCopy(item)?.recommendation || 'Review the prepared work, then refine or approve only if the source context still supports it.';
  const profile = targetProfile(item);
  if(profile.key === 'relationship') return 'Open the relationship file and choose the next relationship-safe move from the current open loop.';
  if(profile.key === 'project') return 'Open the project dossier and decide what should move, pause, or be protected.';
  if(profile.key === 'meeting') return 'Open the meeting prep and use the people, purpose, and opening move only for this meeting.';
  if(roomName === 'velocity') return 'Use the attached evidence to decide whether this movement needs a reply, task, approval, correction, or no action.';
  return workspaceRecommendation(item, 'Confirm the attached source, then choose the next trustworthy move.');
}

function suggestedHomeActionsForItem(item = {}, roomName = '', sourceLabel = 'Open source behind this judgment'){
  const emailActions = homeEmailActions(item, sourceLabel);
  if(emailActions) return emailActions;
  if(roomName === 'alignment' && isProjectPinAlignmentItem(item)){
    return [
      {label: 'Open Project Manager', homeAction: 'open_source'},
      {label: 'Mark reminder handled', homeAction: 'complete_project_pin'},
      {label: 'Show why VAL believes this', homeAction: 'review_evidence'}
    ];
  }
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
      {label: 'Show why VAL believes this', homeAction: 'review_evidence'}
    ];
  }
  return [
    {label: sourceLabel, homeAction: 'open_source'},
    {label: roomName === 'leverage' ? 'Review prepared decision point' : 'Show why VAL believes this', homeAction: 'review_evidence'}
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
  const genericMeaning = meaningText.toLowerCase();
  const genericMeaningLooksUnclear = [
    ['something', 'changed'].join(' '),
    ['prepared', 'something'].join(' '),
    ['judgment', 'appears'].join(' ')
  ].some((phrase) => genericMeaning.includes(phrase));
  if(subject && genericMeaningLooksUnclear){
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

function homeAdmittedCount(roomName){
  return (homeRoomQueues[roomName] || []).length;
}

function briefingRefreshLabel(value){
  const date = new Date(value || Date.now());
  if(!Number.isFinite(date.getTime())) return 'just now';
  return date.toLocaleTimeString([], {hour:'numeric', minute:'2-digit'});
}

function dailyWitnessEvidenceLabel(item = {}){
  const titleText = compactSentence(item.title || item.source_type || 'source', 'source');
  const summaryText = compactSentence(item.summary || '', '');
  if(summaryText && summaryText !== titleText) return titleText + ': ' + compactSentence(summaryText, '').slice(0, 150);
  return titleText;
}

function renderWhyTodayPanel(briefing = null, status = 'loaded'){
  return;
  if(!evidence) return;
  const velocityCount = homeAdmittedCount('velocity');
  const alignmentCount = homeAdmittedCount('alignment');
  const leverageCount = homeAdmittedCount('leverage');
  const sourceEvidence = (briefing?.dailyWitness?.evidence || []).filter((item) => {
    const text = [item.title, item.summary].filter(Boolean).join(' ');
    return text && !/Email may contain a risk, blocker, or relationship concern/i.test(text);
  }).slice(0, 3);
  const sensitiveWithheld = (briefing?.dailyWitness?.internalUnderstanding?.things_intentionally_not_mentioned || [])
    .some((item) => /sensitive/i.test(String(item.topic || item.reason || '')));
  const generatedLine = status === 'loaded'
    ? 'Briefing refreshed at ' + briefingRefreshLabel(briefing?.generatedAt || briefing?.dailyWitness?.generatedAt) + '.'
    : status === 'unavailable'
      ? 'Live briefing is unavailable, so Home is using fallback copy.'
      : 'Waiting for the executive briefing payload.';
  evidence.innerHTML = [
    '<div>',
      '<p class="evidence-label">Live briefing</p>',
      '<ul>',
        '<li>' + escapeHtml(generatedLine) + '</li>',
        '<li>Velocity: ' + velocityCount + ' admitted change' + (velocityCount === 1 ? '' : 's') + '.</li>',
        '<li>Alignment: ' + (alignmentCount ? alignmentCount + ' priority packet' + (alignmentCount === 1 ? '' : 's') : 'no priority packet admitted') + '.</li>',
        '<li>Leverage: ' + leverageCount + ' prepared item' + (leverageCount === 1 ? '' : 's') + ' admitted.</li>',
      '</ul>',
    '</div>',
    '<div>',
      '<p class="evidence-label">Source evidence</p>',
      '<ul>',
        sensitiveWithheld ? '<li>Sensitive details were intentionally withheld from Home.</li>' : '',
        sourceEvidence.length
          ? sourceEvidence.map((item) => '<li>' + escapeHtml(dailyWitnessEvidenceLabel(item)) + '</li>').join('')
          : '<li>No specific source evidence strong enough to explain the greeting.</li>',
        '<li>Nothing sends, imports, or changes externally without approval.</li>',
      '</ul>',
      '<button class="fresh-desk-button" type="button">Clear Home marks</button>',
    '</div>'
  ].join('');
  evidence.querySelector('.fresh-desk-button')?.addEventListener('click', clearRoomAttendance);
}

function briefingWorkspace({lens,title,meaning,understanding,recommendation,actions = [{label: 'Open source behind this judgment', homeAction: 'open_source'}, {label: 'Teach VAL', workflow: 'teach'}],confidence,restraintReason,sourceItem,cardType,suppressInlinePortals = true}){
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

function clearHomeRoomForAdmission(roomName){
  const empty = {
    velocity: {
      card: {
        observation: 'No meaningful movement earned Home.',
        implication: 'VAL is keeping true but low-value activity out of your attention.',
        invitation: 'Keep the desk clear',
        title: 'No meaningful movement earned Home.',
        summary: 'VAL is keeping true but low-value activity out of your attention.',
        action: 'Open Velocity'
      },
      workspace: {
        lens: 'Velocity',
        title: 'No Velocity item passed the v1 admission gate.',
        meaning: 'No changed item currently has both meaningful movement and exact source proof.',
        understanding: ['Items that are merely reviewed, synced, imported, counted, or loosely observed stay out of Home.'],
        recommendation: 'Keep Home quiet until a Velocity Round Table item earns attention.',
        actions: [{label:'Close and return to desk', workflow:'cancel:meeting'}],
        suppressClarityStandard: true
      }
    },
    alignment: {
      card: {
        observation: 'No priority needs your judgment first.',
        implication: 'Nothing has a complete Why Now Packet right now.',
        invitation: 'Keep attention unbroken',
        title: 'No priority needs your judgment first.',
        summary: 'Nothing has a complete Why Now Packet right now.',
        action: 'Open Alignment'
      },
      workspace: {
        lens: 'Alignment',
        title: 'No Alignment item passed the v1 admission gate.',
        meaning: 'VAL is not promoting a priority without complete Why Now reasoning.',
        understanding: ['Alignment needs why now, decision/action needed, cost if delayed or timing basis, evidence refs, and confidence.'],
        recommendation: 'Keep judgment free until one priority earns the top slot.',
        actions: [{label:'Close and return to desk', workflow:'cancel:meeting'}],
        suppressClarityStandard: true
      }
    },
    leverage: {
      card: {
        observation: 'No prepared work is waiting for approval.',
        implication: 'Nothing has both a Prepared Work Packet and Can VAL Act status.',
        invitation: 'Nothing to approve',
        title: 'No prepared work is waiting for approval.',
        summary: 'Nothing has both a Prepared Work Packet and Can VAL Act status.',
        action: 'Open Leverage'
      },
      workspace: {
        lens: 'Leverage',
        title: 'No Leverage item passed the v1 admission gate.',
        meaning: 'VAL is not showing loose opportunities as prepared work.',
        understanding: ['Leverage needs prepared work, trigger source, work product, and Can VAL Act status.'],
        recommendation: 'Prepared work will appear here only when it is real enough to review or approve.',
        actions: [{label:'Close and return to desk', workflow:'cancel:meeting'}],
        suppressClarityStandard: true
      }
    }
  };
  if(empty[roomName]) updateRoomFromBriefing(roomName, empty[roomName]);
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

function homeAdmissionText(item = {}){
  return [
    item.title,
    item.name,
    item.summary,
    item.reason,
    item.reason_it_matters,
    item.why,
    item.whatChanged,
    item.what_changed,
    item.ifIgnored,
    item.if_ignored
  ].filter(Boolean).join(' ').toLowerCase();
}

function homeAdmissionMetadata(item = {}){
  return item.metadata || item.metadataJson || item.homeAdmission || item.admission || {};
}

function homeAdmissionExplicitPass(item = {}, key){
  const metadata = homeAdmissionMetadata(item);
  const explicit = item[key] ?? metadata[key] ?? item.homeAdmission?.[key] ?? metadata.homeAdmission?.[key];
  return explicit === true || explicit === 'true' || explicit === 'passed';
}

function homeAdmissionSourceProof(item = {}){
  const identity = sourceIdentityForItem(item);
  const type = String(identity.type || '').toLowerCase();
  const id = String(identity.id || '').trim();
  const refs = sourceOfSourceLines(item).filter((line) => !/supporting source needs review/i.test(line));
  const routeableTypes = new Set(['email','draft','person','relationship','project','meeting','calendar','document','transcript','commitment','task','opportunity','prepared_work']);
  const reviewedReceipt = refs.length > 0 || Boolean(item.sourceRefs || item.sourceRefsJson || item.source_refs || item.evidence_count || item.evidence);
  const routeable = routeableTypes.has(type) || isEmailSourceItem(item) || Boolean(preparedArtifactKind(item));
  const exactRecord = routeable && Boolean(id);
  return {
    type,
    id,
    refs,
    routeable,
    reviewedReceipt,
    exactRecord,
    passed: routeable && (exactRecord || reviewedReceipt)
  };
}

function isHomeAdmissionNoise(item = {}){
  const text = homeAdmissionText(item);
  const identity = sourceIdentityForItem(item);
  const type = String(identity.type || '').toLowerCase();
  return (
    /val learned \d+ reviewed onboarding truths/.test(text) ||
    /people now front of mind/.test(text) ||
    /projects now being watched/.test(text) ||
    /working preferences are now part/.test(text) ||
    /source-provider|sync completion|imported|synced|reviewed memory count/.test(text) ||
    ((type === 'movement' || type === 'what_changed' || type === 'source') && !homeAdmissionSourceProof(item).exactRecord)
  );
}

function homeAdmissionMeaningful(item = {}){
  const text = homeAdmissionText(item);
  if(!text || isHomeAdmissionNoise(item)) return false;
  return /(changed|moved|risk|block|blocked|deadline|waiting|reply|follow.?up|proposal|decision|trust|relationship|project|commitment|opportunity|approval|prepared|draft|scheduled|due|open loop|attention)/i.test(text);
}

function velocityRoundTablePassed(item = {}){
  if(homeAdmissionExplicitPass(item, 'velocityRoundTablePassed')) return true;
  const proof = homeAdmissionSourceProof(item);
  return proof.passed && homeAdmissionMeaningful(item);
}

function whyNowPacketForHomeItem(item = {}){
  const sourceProof = homeAdmissionSourceProof(item);
  const whyNow = item.whyNow || item.why_now || item.reason_it_matters || item.why || item.summary || '';
  const decisionNeeded = item.decisionNeeded || item.decision_needed || item.action_needed || item.actionNeeded || item.moveType || '';
  const costIfDelayed = item.costIfDelayed || item.cost_if_delayed || item.ifIgnored || item.if_ignored || '';
  const evidenceRefs = sourceProof.refs;
  const confidence = Number(item.confidence);
  return {
    priority: item.priority || item.priorityBand || item.importanceScore || '',
    why_now: whyNow,
    blocked_project_or_person: item.projectId || item.personId || item.contactId || item.target?.label || item.target?.name || '',
    deadline_or_timing_basis: item.deadline || item.dueAt || item.due_at || item.timestamp || item.updatedAt || '',
    cost_if_delayed: costIfDelayed,
    decision_needed: decisionNeeded || whyNow,
    action_needed: item.actionNeeded || item.action_needed || item.moveType || decisionNeeded || '',
    evidence_refs: evidenceRefs,
    confidence
  };
}

function hasCompleteWhyNowPacket(item = {}){
  if(homeAdmissionExplicitPass(item, 'whyNowPacketComplete')) return true;
  const packet = item.whyNowPacket || item.why_now_packet || whyNowPacketForHomeItem(item);
  return Boolean(
    packet.why_now &&
    (packet.decision_needed || packet.action_needed) &&
    (packet.cost_if_delayed || packet.deadline_or_timing_basis || packet.blocked_project_or_person) &&
    Array.isArray(packet.evidence_refs) && packet.evidence_refs.length &&
    Number.isFinite(Number(packet.confidence))
  );
}

function preparedWorkPacketForHomeItem(item = {}){
  const metadata = homeAdmissionMetadata(item);
  const artifactKind = preparedArtifactKind(item);
  const artifact = item.preparedArtifact || item.prepared_artifact || metadata.preparedArtifact || metadata.prepared_artifact || {};
  const canAct = item.canValAct || item.can_val_act || metadata.canValAct || metadata.can_val_act || item.canValActStatus || metadata.canValActStatus || '';
  return {
    prepared_work_type: artifactKind || artifact.kind || item.preparedArtifactKind || metadata.preparedArtifactKind || '',
    trigger_source_id: item.sourceId || item.source_id || item.id || item.target?.id || metadata.sourceId || metadata.source_id || '',
    work_product: artifact.body || artifact.content || item.draftBody || item.summary || item.title || '',
    approval_needed: item.approvalNeeded ?? metadata.approvalNeeded ?? true,
    execution_path: item.executionPath || item.execution_path || metadata.executionPath || metadata.execution_path || item.target?.type || artifact.kind || '',
    can_val_act_status: String(canAct || (artifactKind || artifact.kind ? 'approval_required' : '')).toLowerCase()
  };
}

function hasPreparedWorkPacketAndActionStatus(item = {}){
  if(homeAdmissionExplicitPass(item, 'preparedWorkPacketComplete')) return true;
  const packet = item.preparedWorkPacket || item.prepared_work_packet || preparedWorkPacketForHomeItem(item);
  return Boolean(
    packet.prepared_work_type &&
    packet.trigger_source_id &&
    packet.work_product &&
    packet.can_val_act_status
  );
}

function homeAdmissionResult(roomName, item = {}){
  if(roomName === 'velocity'){
    return {
      passed: velocityRoundTablePassed(item),
      proof: 'Velocity Round Table',
      reason: velocityRoundTablePassed(item) ? 'meaningful_movement_with_source' : 'missing_velocity_round_table_proof'
    };
  }
  if(roomName === 'alignment'){
    return {
      passed: hasCompleteWhyNowPacket(item),
      proof: 'Why Now Packet',
      reason: hasCompleteWhyNowPacket(item) ? 'complete_why_now_packet' : 'missing_why_now_packet'
    };
  }
  if(roomName === 'leverage'){
    return {
      passed: hasPreparedWorkPacketAndActionStatus(item),
      proof: 'Prepared Work Packet + Can VAL Act',
      reason: hasPreparedWorkPacketAndActionStatus(item) ? 'prepared_work_with_action_status' : 'missing_prepared_work_or_action_status'
    };
  }
  return {passed:true, proof:'not_home_mode', reason:'not_home_mode'};
}

function homeAdmissionFilter(roomName, items = []){
  return briefingItems(items).filter((item) => homeAdmissionResult(roomName, item).passed);
}

function setHomeRoomQueue(roomName, items){
  const admittedItems = homeAdmissionFilter(roomName, items);
  homeRoomQueues[roomName] = admittedItems.map((item, index) => homeQueueItem(item, index, roomName));
}

function hydrateRoomsFromBriefing(briefing){
  const velocityItems = briefingItems(briefing.whatChanged).concat(briefingItems(briefing.momentum));
  const admittedVelocityItems = homeAdmissionFilter('velocity', velocityItems);
  const changed = firstBriefingItem(admittedVelocityItems);
  const highest = briefing.highestLeverageMove || firstBriefingItem(briefing.alsoImportant) || null;
  const leverageItems = briefingItems(briefing.readyForYou).concat(briefingItems(briefing.watching));
  const admittedAlignmentItems = homeAdmissionFilter('alignment', highest ? [highest] : []);
  const admittedLeverageItems = homeAdmissionFilter('leverage', leverageItems);
  const admittedHighest = firstBriefingItem(admittedAlignmentItems);
  const ready = firstBriefingItem(admittedLeverageItems) || null;
  const theme = briefing.todayTheme || {};
  setHomeRoomQueue('velocity', admittedVelocityItems);
  setHomeRoomQueue('alignment', admittedHighest ? [admittedHighest] : []);
  setHomeRoomQueue('leverage', admittedLeverageItems);
  if(!changed) clearHomeRoomForAdmission('velocity');
  if(!admittedHighest) clearHomeRoomForAdmission('alignment');
  if(!ready) clearHomeRoomForAdmission('leverage');

  if(changed){
    const titleText = itemTitle(changed, 'Meaningful movement');
    const meaningText = itemMeaning(changed, 'VAL found a specific movement that may change what deserves action today.');
    const cardTitle = roomCardObservation(changed, titleText, 'velocity');
    const cardSummary = roomCardImplication(changed, meaningText, 'velocity');
    const sourceLabel = sourceActionLabel(changed);
    updateRoomFromBriefing('velocity', {
      card: {
        observation: cardTitle,
        implication: cardSummary,
        invitation: 'Would you like to decide the next move?',
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

  if(admittedHighest){
    const titleText = itemTitle(admittedHighest, 'Protected attention');
    const meaningText = itemMeaning(admittedHighest, 'This is where your judgment appears most valuable.');
    const cardTitle = roomCardObservation(admittedHighest, titleText, 'alignment');
    const cardSummary = roomCardImplication(admittedHighest, meaningText, 'alignment');
    const sourceLabel = sourceActionLabel(admittedHighest, 'Open the thing needing attention');
    const actions = suggestedHomeActionsForItem(admittedHighest, 'alignment', sourceLabel);
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
        understanding: workspaceUnderstanding(admittedHighest, [
          admittedHighest?.ifIgnored ? 'If ignored: ' + admittedHighest.ifIgnored : theme.why,
        ]),
        recommendation: workspaceRecommendation(admittedHighest, 'Does this still feel true to you? If not, teach VAL what it missed.'),
        actions,
        confidence: admittedHighest?.confidence,
        restraintReason: 'Alignment owns the judgment question, not every supporting detail.',
        sourceItem: admittedHighest,
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
  const admittedQueueItems = homeAdmissionFilter('leverage', queueItems);
  setHomeRoomQueue('leverage', admittedQueueItems);
  const preparedCount = Number(result.preparedCount != null ? result.preparedCount : (allBuilt.length || items.length));
  updatePreparedCount(preparedCount);
  const ready = firstBriefingItem(admittedQueueItems);
  if(!ready || !ready.id){
    clearHomeRoomForAdmission('leverage');
    setRoomCopy(currentState);
    renderWhyTodayPanel(executiveBriefingState, executiveBriefingState ? 'loaded' : 'waiting');
    return;
  }
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
  renderWhyTodayPanel(executiveBriefingState, executiveBriefingState ? 'loaded' : 'waiting');
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
    renderWhyTodayPanel(briefing, 'loaded');
    return;
  }
  if(!canUseApi){
    renderWhyTodayPanel(null, 'unavailable');
    return;
  }
  try{
    const briefing = await getJson('/api/executive-briefing');
    if(!briefing || briefing.bookMode) return;
    executiveBriefingState = briefing;
    window.executiveBriefingState = briefing;
    hydrateGreetingFromBriefing(briefing);
    hydrateRoomsFromBriefing(briefing);
    hydratePreparedWorkQueue();
    hydrateAlignmentFromProjectPins();
    renderWhyTodayPanel(briefing, 'loaded');
  }catch(error){
    renderWhyTodayPanel(null, 'unavailable');
    console.warn('Executive briefing unavailable:', error.message);
  }
}

if(canUseApi){
  window.setInterval(() => hydrateAlignmentFromProjectPins(), 60000);
}

function setScraperLoading(type, message){
  const workflow = scraperWorkflows[type];
  renderLeadSourcingProgress(type);
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
  activeScraperType = type;
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
  saveLeadScraperCriteria(type, criteria);
  const payload = config.buildPayload(criteria);
  const session = sessionFor(type);
  session.payload = payload;
  setScraperLoading(type, {
    title: type === 'partners' ? 'VAL is preparing the partner preview.' : 'VAL is preparing the organization preview.',
    meaning: 'This is still a preview. Nothing will be added to CRM until approved records are imported.',
    understanding: [
      'Level 1 discovery is running from the configured source mix.',
      'CRM duplicate checks happen before enrichment spend.',
      'The review set will preserve contact details, source evidence, and approval state.'
    ],
    recommendation: 'Let VAL finish the preview, then approve only the records that deserve to enter the pipeline.'
  });
  try{
    const result = await postJson(config.previewUrl, payload, {
      timeoutMs: 20000,
      timeoutMessage: 'The preview source did not answer within 20 seconds.'
    });
    const leads = Array.isArray(result.leads) ? result.leads : [];
    session.result = result;
    session.previewLeads = leads.map((lead) => normalizePreviewLead(lead, type));
    workflow.previewLeads = session.previewLeads;
    if(result.crmDestination){
      workflow.criteria.destination = result.crmDestination.pipeline + ' / ' + result.crmDestination.stage;
    }
    renderScraperWorkflow(type, 'preview');
  }catch(error){
    renderLeadSourcingMessage(type, 'Scraper needs attention', [
      error.message,
      'Most failures are missing source keys, overly broad search criteria, or a temporary upstream timeout.',
      'Preview and import remain separate; nothing entered the CRM.'
    ]);
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
  activeScraperType = type;
  if(!canUseApi){
    openScraper(type, 'imported');
    return;
  }
  const config = scraperApiConfig[type];
  const workflow = scraperWorkflows[type];
  const session = sessionFor(type);
  const rows = Array.from(leadDrawerPreviewList.querySelectorAll('.preview-lead'));
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
    meaning: 'Only the approved records are being handed to CRM.',
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
    renderLeadSourcingMessage(type, 'Import did not complete', [
      error.message,
      'Preview data is still held in this session.',
      'Held records and unapproved records were not sent.'
    ], 'Review scraper');
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

function isVagueClarityText(value = ''){
  const text = compactSentence(value).toLowerCase();
  return [
    ['something', 'changed'].join(' '),
    ['source', 'context', 'is', 'available'].join(' '),
    ['open', 'only', 'if'].join(' '),
    ['review', 'evidence'].join(' '),
    ['suggested', 'next', 'step'].join(' '),
    ['suggested', 'next', 'moves'].join(' '),
    ['suggested', 'next'].join(' ')
  ].some((phrase) => text === phrase || text.startsWith(phrase + ' '));
}

function claritySpecificTitle(workspace = {}){
  const item = workspace.sourceItem || {};
  const fallback = workspace.title || workspace.lens || 'VAL judgment';
  return executiveHomeBriefTitle(item, fallback, roomNameFromWorkspace(workspace, workspace.lens || 'home'));
}

function claritySpecificMeaning(workspace = {}){
  const item = workspace.sourceItem || {};
  const existing = compactSentence(workspace.meaning);
  const extraVague = [
    ['meaning', 'is', 'unclear'].join(' '),
    ['inspect', 'the', 'judgment'].join(' ')
  ].some((phrase) => existing.toLowerCase().includes(phrase));
  if(existing && !isVagueClarityText(existing) && !extraVague) return existing;
  return executiveHomeMeaning(item, existing || workspace.title || '', roomNameFromWorkspace(workspace, workspace.lens || 'home'));
}

function clarityEvidenceLines(workspace = {}){
  const lines = Array.isArray(workspace.understanding) ? workspace.understanding.filter(Boolean).map(compactSentence) : [];
  const item = workspace.sourceItem || {};
  const evidence = executiveHomeUnderstanding(item, workspace.title || workspace.lens || 'VAL judgment', roomNameFromWorkspace(workspace, workspace.lens || 'home'));
  const combined = [...lines, ...evidence].filter(Boolean);
  return Array.from(new Set(combined)).slice(0, 7);
}

function clarityRecommendation(workspace = {}){
  const item = workspace.sourceItem || {};
  const existing = compactSentence(workspace.recommendation);
  const lower = existing.toLowerCase();
  const recommendationIsVague = [
    ['open', 'only', 'if'].join(' '),
    ['suggested', 'next'].join(' '),
    ['review', 'evidence'].join(' '),
    ['source', 'context'].join(' ')
  ].some((phrase) => lower.includes(phrase));
  if(existing && !recommendationIsVague) return existing;
  return executiveHomeRecommendation(item, roomNameFromWorkspace(workspace, workspace.lens || 'home'));
}

function clarityActionLabel(action = {}, workspace = {}){
  const spec = typeof action === 'string' ? {label: action} : {...action};
  const title = claritySpecificTitle(workspace).replace(/\.$/, '');
  const sourceLabel = sourceActionLabel(workspace.sourceItem || {}, 'Open source behind ' + title);
  const label = compactSentence(spec.label || 'Review');
  const normalizedLabel = label.toLowerCase();
  if(normalizedLabel === ['review', 'evidence'].join(' ') || normalizedLabel === 'show why val believes this') return {...spec, label: 'Show evidence behind ' + title};
  if(normalizedLabel === ['open', 'source', 'context'].join(' ') || normalizedLabel === ['open', 'source', 'view'].join(' ') || normalizedLabel === 'open source behind this judgment') return {...spec, label: sourceLabel};
  if(normalizedLabel === ['suggested', 'next', 'step'].join(' ') || normalizedLabel === ['suggested', 'next', 'moves'].join(' ')) return {...spec, label: 'Choose the next move for ' + title};
  if(/^review$/i.test(label)) return {...spec, label: 'Review ' + title};
  return spec;
}

function clarityPrimaryAction(workspace = {}){
  const item = workspace.sourceItem || {};
  if(isEmailSourceItem(item)) return {label: 'Draft reply or dated follow-up', homeAction: 'draft_email_reply'};
  const kind = preparedArtifactKind(item);
  if(kind) return {label: sourceActionLabel(item, 'Review prepared work'), homeAction: 'open_source'};
  return {label: sourceActionLabel(item, 'Open source behind this judgment'), homeAction: 'open_source'};
}

function shouldAddClarityCowork(workspace = {}){
  return !/co-work|cowork/i.test(String(workspace.lens || workspace.title || ''));
}

function normalizeClarityActions(actions = [], workspace = {}){
  const normalized = (Array.isArray(actions) ? actions : [])
    .filter(Boolean)
    .map((action) => clarityActionLabel(action, workspace));
  if(!normalized.length) normalized.push(clarityPrimaryAction(workspace));
  const hasCowork = normalized.some((action) => /co-work with val/i.test(String(action?.label || action)));
  if(shouldAddClarityCowork(workspace) && !hasCowork){
    normalized.push({label: 'Co-Work with VAL', workflow: 'cowork:card_context', packet: 'workflow_scoped_packet'});
  }
  return normalized;
}

function normalizeWorkspaceForClarity(workspace = {}){
  const draft = {...workspace};
  draft.title = isVagueClarityText(draft.title) ? claritySpecificTitle(draft) : compactSentence(draft.title, claritySpecificTitle(draft));
  draft.meaning = claritySpecificMeaning(draft);
  draft.understanding = clarityEvidenceLines(draft);
  draft.recommendation = clarityRecommendation(draft);
  draft.actions = normalizeClarityActions(draft.actions, draft);
  return draft;
}

function coworkPromptFromWorkspace(workspace = {}){
  const evidence = (Array.isArray(workspace.understanding) ? workspace.understanding : []).map((line) => '- ' + line).join('\n');
  return [
    'Co-work with me from this exact VAL card.',
    '',
    'Card: ' + compactSentence(workspace.title, 'VAL judgment'),
    'What changed or needs attention: ' + compactSentence(workspace.meaning, 'VAL surfaced this for review.'),
    'Why VAL believes it matters: ' + compactSentence(workspace.recommendation, 'VAL thinks this deserves a decision before action.'),
    evidence ? 'Evidence VAL used:\n' + evidence : '',
    '',
    'Help me decide what to trust, review, approve, do, or teach VAL next.'
  ].filter(Boolean).join('\n');
}

function openCoworkFromClarityWorkspace(){
  const workspace = activeClarityWorkspace || {};
  const title = 'Co-Work with VAL: ' + compactSentence(workspace.title, 'current card');
  openContextualCoworkSession({
    returnTarget: workspaceReturnTarget || 'home',
    title,
    meaning: 'This chat is already scoped to the card you opened, including its meaning, evidence, recommendation, and allowed next moves.',
    context: [
      'Card: ' + compactSentence(workspace.title, 'VAL judgment'),
      'Meaning: ' + compactSentence(workspace.meaning, 'VAL surfaced this for review.'),
      'Recommendation: ' + compactSentence(workspace.recommendation, 'Decide the next trustworthy move.'),
      ...(Array.isArray(workspace.understanding) ? workspace.understanding.slice(0, 5).map((line) => 'Evidence: ' + line) : [])
    ],
    recommendation: 'Use this chat to turn the card into a decision, reply, task, approval, correction, or teaching note.',
    placeholder: 'Ask VAL to reason from this card...',
    helper: 'VAL is holding the card context privately. External actions still require their own approval step.',
    initialValue: coworkPromptFromWorkspace(workspace),
    backWorkflow: 'cancel:' + (workspaceReturnTarget || 'meeting')
  });
}

function openMeetingPrepCoworkSession(){
  const event = activeMeetingPrepEvent || meetingPrep.event;
  const briefing = activeMeetingPrepBriefing || {
    eventTitle: meetingPrepEventTitle(event),
    time: meetingPrepEventTime(event),
    readiness:{score:40,label:'VAL has the meeting title, but the full prep is not assembled yet.'},
    purpose:'Help me walk into this meeting prepared.',
    success:['Name the useful outcome before the meeting starts.'],
    people:['Use what I know about the people in this meeting.'],
    changed:['Identify what changed since the last conversation.'],
    decisions:['Clarify likely decisions.'],
    remember:'Keep the relationship stewarded while moving the work forward.',
    risks:['Do not over-use thin context.'],
    opportunities:['Find the next useful move.'],
    opening:'I would love to start by naming what would make this conversation useful today.',
    questions:['What would make this meeting a good use of your time today?'],
    followUpItems:['Capture what changed after the meeting.']
  };
  const seed = briefing.coworkSeed || meetingPrepCoworkSeed(briefing);
  openContextualCoworkSession({
    returnTarget: 'meeting',
    title: 'Meeting Prep: ' + compactSentence(briefing.eventTitle || 'this meeting', 'this meeting'),
    meaning: 'This chat is scoped to the Meeting Prep brief. Use it to sharpen how you enter the room.',
    context: [
      'Meeting: ' + compactSentence(briefing.eventTitle || meetingPrepEventTitle(event), 'Meeting'),
      'Readiness: ' + (briefing.readiness?.score || 0) + '% - ' + (briefing.readiness?.label || ''),
      'Purpose: ' + compactSentence(briefing.purpose || ''),
      'Suggested opening: ' + compactSentence(briefing.opening || '')
    ],
    recommendation: 'Ask VAL to tighten the opening, choose the highest-leverage question, or role-play the first five minutes.',
    placeholder: 'Help me walk into this meeting prepared...',
    helper: 'VAL is holding the Meeting Prep brief privately. Nothing external happens from Co-Work without approval.',
    initialValue: seed,
    backWorkflow: 'cancel:meeting'
  });
}

async function runCowork(mode){
  const input = workspaceInputValue('cowork');
  const visiblePrompt = input || 'Help me think through the most useful next step from the Hearth.';
  const keepHomeCoworkOpen = Boolean(deskWorkspace?.classList.contains('home-cowork-mode') && homeCoworkResponseNode());
  const heldContext = activeCoworkHeldContext || '';
  const heldSystemPrompt = heldContext
    ? 'Use this held context silently. Do not quote, dump, summarize, or expose it unless the user explicitly asks to see context. Refer to it only by producing useful judgment and next steps.\n\n' + heldContext
    : '';
  if(keepHomeCoworkOpen && input){
    appendHomeCoworkMessage('user', input);
  }
  if(mockScrapers || !canUseApi){
    if(keepHomeCoworkOpen){
      appendHomeCoworkMessage('val', mode === 'draft' ? 'A draft can begin here. Start with one plain paragraph, then refine from there.' : 'Name the decision, list the tradeoffs, and choose the next reversible step.');
      const textarea = workspaceInputPanel.querySelector('[data-workspace-input="cowork"]');
      if(textarea) textarea.value = '';
      return;
    }
    setWorkspaceContent({
      lens: 'Co-Work with VAL',
      title: mode === 'draft' ? 'A draft can begin here.' : 'Here is the first useful shape.',
      meaning: 'VAL would use the held context and your Co-Work prompt to prepare a private working draft.',
      understanding: [
        'Prompt: ' + visiblePrompt,
        heldContext ? 'VAL is holding the source context privately.' : '',
        'This stays inside the desk workspace.',
        'No external action is taken from Co-Work without a separate approval step.'
      ].filter(Boolean),
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
  if(keepHomeCoworkOpen){
    appendHomeCoworkMessage('val', 'VAL is thinking with you...');
  }else{
  setWorkspaceContent({
    lens: 'Co-Work with VAL',
    title: 'VAL is thinking with you.',
    meaning: 'Co-Work is becoming a private working response.',
    understanding: [
      'VAL is holding the relevant context privately.',
      'VAL can prepare drafts, options, or decision framing.',
      'External action still requires approval.'
    ],
    recommendation: 'Stay with the thought; VAL will bring back the next useful shape.',
    actions: [{label: 'Close and return to desk', workflow: 'cancel:meeting'}],
    label: 'Co-Work with VAL loading'
  });
  }
  try{
    const result = await postJson('/api/val/chat', {
      channel: 'hearth_cowork',
      title: 'Co-Work from Hearth',
      messages: [
        ...(heldSystemPrompt ? [{role: 'system', content: heldSystemPrompt}] : []),
        {role: 'user', content: visiblePrompt}
      ],
      heldContext,
      projectContext: workspaceReturnTarget === 'project' ? activeProjectChatContext() : null,
      dashboard: {
        hearth: title.textContent,
        witness: witness.textContent,
        orientation: orientation.textContent,
        permission: permission.textContent
      }
    });
    const content = result.message?.content || 'VAL prepared a response.';
    if(keepHomeCoworkOpen){
      appendHomeCoworkMessage('val', content);
      const textarea = workspaceInputPanel.querySelector('[data-workspace-input="cowork"]');
      if(textarea){
        textarea.value = '';
        textarea.placeholder = 'Add the next thought...';
      }
      return;
    }
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
    if(keepHomeCoworkOpen){
      appendHomeCoworkMessage('val', 'Co-Work needs attention: ' + error.message + '\n\nNo external action was taken.');
      return;
    }
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
  retrievalSystem.dataset.activeDrawer = 'relationship';
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

function restoreLeadIntelligenceWindow(){
  retrievalSystem.classList.add('open');
  hearth.classList.add('drawer-open');
  drawerPull.setAttribute('aria-expanded', 'true');
  drawerTray.setAttribute('aria-hidden', 'false');
  drawerTray.classList.add('source-open');
  drawerTray.classList.remove('val-open', 'relationship-open', 'project-open', 'timeline-open', 'correspondence-open', 'commitment-open', 'document-open');
  sourceDrawerLink.setAttribute('aria-expanded', 'true');
  valDrawerLink?.setAttribute('aria-expanded', 'false');
  relationshipDrawerLink.setAttribute('aria-expanded', 'false');
  projectDrawerLink.setAttribute('aria-expanded', 'false');
  timelineDrawerLink?.setAttribute('aria-expanded', 'false');
  correspondenceDrawerLink?.setAttribute('aria-expanded', 'false');
  commitmentDrawerLink?.setAttribute('aria-expanded', 'false');
  documentDrawerLink?.setAttribute('aria-expanded', 'false');
  document.querySelector('#source-detail').setAttribute('aria-hidden', 'false');
  document.querySelector('#val-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#relationship-detail').setAttribute('aria-hidden', 'true');
  document.querySelector('#project-detail').setAttribute('aria-hidden', 'true');
  document.querySelector('#timeline-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#correspondence-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#commitment-detail')?.setAttribute('aria-hidden', 'true');
  document.querySelector('#document-detail')?.setAttribute('aria-hidden', 'true');
  if(leadDrawerPreviewList && !leadDrawerPreviewList.innerHTML.trim()) leadSourcingEmptyBoard();
  scrollLeadIntelligenceActionsIntoView();
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
    if(options.returnTarget === 'source') restoreLeadIntelligenceWindow();
    if(options.returnTarget === 'val') restoreValWindow();
  } else {
    closeDrawer();
  }
  hearth.dataset.distance = 'judgment';
  deskWorkspace.setAttribute('aria-hidden', 'false');
  updateDrawerCoworkIcon();
  document.querySelectorAll('.living-room').forEach((room) => {
    room.classList.remove('active-room');
  });
  deskWorkspace.setAttribute('aria-label', label || 'Decision workspace');
  updateDrawerCoworkIcon();
  if(!deskWorkspace.classList.contains('home-cowork-mode') && window.matchMedia('(max-width: 720px), (max-height: 720px)').matches){
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
  workflow.criteria = leadScraperCriteriaFromDefinition(type);
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
  if(stage === 'setup') renderScraperCriteria(workflow, type);
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

function trainLeadScraper(type){
  const selectedType = leadScraperDefinitions[type] ? type : activeScraperType || 'organizations';
  openScraper(selectedType, 'setup');
}

function saveLeadScraperTraining(type){
  const selectedType = leadScraperDefinitions[type] ? type : activeScraperType || 'organizations';
  const criteria = getScraperCriteria();
  saveLeadScraperCriteria(selectedType, criteria);
  activeScraperType = selectedType;
  if(leadDrawerPreviewList){
    leadDrawerPreviewList.hidden = false;
    leadDrawerPreviewList.innerHTML = [
      '<div class="preview-list-head"><span>Training saved</span><small>The next run will use this scraper definition.</small></div>',
      '<div class="lead-sourcing-board idle" data-lead-sourcing-board>',
        '<section class="lead-sourcing-column active" data-level="1"><div><span>Level 1</span><h4>Discovery</h4></div><article class="lead-stage-row"><strong>' + escapeHtml(leadScraperDefinitions[selectedType]?.userLabel || 'Scraper') + ' definition updated</strong><span>Criteria and source instructions are stored locally for this VAL.</span><small>Run the scraper to test the new sequence.</small></article></section>',
        '<section class="lead-sourcing-column" data-level="2"><div><span>Level 2</span><h4>Decision Maker</h4></div><article class="lead-stage-row empty"><strong>Ready for next run</strong><span>Decision-maker rules inherit the training context.</span><small>No contact is invented.</small></article></section>',
        '<section class="lead-sourcing-column" data-level="3"><div><span>Level 3</span><h4>Confirm / Dedupe</h4></div><article class="lead-stage-row empty"><strong>Ready for review</strong><span>Approval and duplicate gates remain in place.</span><small>Nothing entered CRM.</small></article></section>',
      '</div>',
      '<div class="lead-sourcing-actions">',
        '<button type="button" data-lead-drawer-action="preview" data-lead-drawer-type="' + selectedType + '">Run this scraper</button>',
        '<button type="button" data-lead-drawer-action="train" data-lead-drawer-type="' + selectedType + '">Train this scraper</button>',
      '</div>'
    ].join('');
  }
  if(leadDrawerCriteriaPanel) leadDrawerCriteriaPanel.hidden = true;
  updatePreviewApprovalSummary();
  renderDrawerPacketReceiptStrip(lastHearthPacketReceipt);
}

async function handleLeadDrawerAction(action, type, node){
  const selectedType = leadScraperDefinitions[type] ? type : activeScraperType || 'organizations';
  const preflight = await ensureHearthClickPacket({
    node,
    packetName:'lead_intelligence_packet',
    action:'lead_intelligence:' + action + ':' + selectedType,
    allowBlockedForInspection:true,
    source:activeLeadIntelligenceSource(action, {type:selectedType, sourceType:'lead_intelligence_drawer_action', sourceLabel:node?.innerText || action})
  });
  if(!preflight.ok) return;
  renderDrawerPacketReceiptStrip(preflight.packet || lastHearthPacketReceipt);
  if(action === 'train'){
    trainLeadScraper(selectedType);
    return;
  }
  if(action === 'save-trainer'){
    saveLeadScraperTraining(selectedType);
    return;
  }
  if(action === 'preview'){
    await runScraperPreview(selectedType);
    return;
  }
  if(action === 'import'){
    await importApprovedScraperLeads(selectedType);
  }
}

function openScraper(type, stage = 'setup'){
  const rendered = renderScraperWorkflow(type, stage) || renderScraperUtility(type);
  if(!rendered) return;
  revealLeadSourcingWorkbench();
  scrollLeadSourcingWorkbenchIntoView();
  renderDrawerPacketReceiptStrip(lastHearthPacketReceipt);
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
      understanding: ['Email, calendar, CRM, Google Docs, GitHub, LinkedIn observers, scrapers, and document sources should show connection state.', 'Anything exposed through a connected tool can become Co-Work executable only inside the user approval boundary.', 'Missing connections should create clear next steps, not silent failure.'],
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

function valProjectManagerImportQuestionLines(){
  return ['first_question','owner_monitoring','workstreams','milestones','relationship_nurture','prepared_work'].map((stage, index) => {
    const contract = projectInterviewStageContract(stage);
    return [
      (index + 1) + '. ' + contract.question,
      '   Feeds Project Manager page boxes: ' + contract.pageBoxes.join(', ') + '.',
      '   Target packet field: ' + contract.targetPacketField + '.',
      '   If you do not have evidence, write: Unknown - ask user.'
    ].join('\n');
  }).join('\n');
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
5. Project Manager page-ready project candidates
6. Boundaries, capacity signals, health/family/care context, or protected priorities I have mentioned
7. Documents, templates, frameworks, profiles, assessments, or examples VAL should ask me to upload or classify
8. Things that seem current, stale, uncertain, or contradicted by later context
9. What VAL should never assume without asking me
10. Questions VAL should carry forward and investigate over time
11. A concise structured summary VAL can import as evidence

For section 5, use this exact Project Manager import contract.
Only create a project candidate when the evidence describes a real body of work with an owner, outcome, or document/source trail. Do not turn vague interests, values, people, or old ideas into projects.

For each possible project, start with:
- project_candidate_action: yes_create_project, no_not_project, or unsure_ask_user
- evidence: the wording or prior context that made you classify it this way
- relationship_or_source: the person, relationship, document, thread, or conversation this came from
- uncertainty: what VAL should confirm with me before creating or filling the project

If project_candidate_action is yes_create_project or unsure_ask_user, answer these exact Project Manager questions:

${valProjectManagerImportQuestionLines()}

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
      + '<span>' + escapeHtml(connected ? 'Use this panel to inspect calendar-driven prep, then test Transcripts from the drawers.' : (google.setupMessage || google.error || 'VAL needs Google authorization before live calendar context can be used.')) + '</span>'
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
  const attendees = calendarEventExternalAttendees(event).length;
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
  const visibleEvents = Array.isArray(events) ? events.slice(0, 40) : [];
  currentCalendarEvents = visibleEvents;
  currentMeetingEvents = visibleEvents.filter(calendarEventIsFutureMeeting);
  if(!visibleEvents.length){
    agendaList.innerHTML = '<button class="agenda-item quiet" type="button"><span>Calendar</span><strong>No upcoming events loaded</strong><small>' + escapeHtml((errors && errors[0]) || 'Connect Google Calendar or Outlook to show your schedule here.') + '</small></button>';
    if(nextMeetingCard){
      nextMeetingCard.disabled = true;
      const top = nextMeetingCard.querySelector('.calendar-page-top');
      const body = nextMeetingCard.querySelector('.calendar-page-body');
      if(top) top.innerHTML = '<b>--</b><strong>--</strong>';
      if(body) body.innerHTML = '<span class="calendar-kicker">Next meeting</span><strong>None</strong><span>No attendee meeting found</span><small>Solo blocks stay out of meeting prep.</small>';
    }
    return;
  }
  agendaList.innerHTML = visibleEvents.map((event, index) => (
    '<button class="agenda-item' + (calendarEventIsFutureMeeting(event) && event === currentMeetingEvents[0] ? ' active' : '') + (calendarEventIsMeeting(event) ? '' : ' calendar-note') + (calendarEventIsPast(event) ? ' calendar-past' : '') + '" type="button" data-calendar-event-index="' + index + '" data-calendar-meeting="' + (calendarEventIsMeeting(event) ? 'true' : 'false') + '" data-calendar-past="' + (calendarEventIsPast(event) ? 'true' : 'false') + '">' +
      '<span>' + escapeHtml(formatCalendarTime(event.start)) + '</span>' +
      '<strong>' + escapeHtml(event.title || event.summary || '(No title)') + '</strong>' +
      '<small>' + escapeHtml(calendarEventIsPast(event) ? 'Past event - open matching transcript' : (calendarEventIsMeeting(event) ? calendarEventSubtitle(event) : 'Calendar note - no attendee meeting prep')) + '</small>' +
    '</button>'
  )).join('');
  if(nextMeetingCard && currentMeetingEvents[0]){
    const first = currentMeetingEvents[0];
    const start = new Date(first.start || Date.now());
    const month = Number.isNaN(start.getTime()) ? '' : start.toLocaleDateString([], {month:'short'});
    const day = Number.isNaN(start.getTime()) ? '' : start.toLocaleDateString([], {day:'2-digit'});
    const time = Number.isNaN(start.getTime()) ? 'Next' : start.toLocaleTimeString([], {hour:'numeric', minute:'2-digit'});
    const top = nextMeetingCard.querySelector('.calendar-page-top');
    const body = nextMeetingCard.querySelector('.calendar-page-body');
    nextMeetingCard.disabled = false;
    if(top) top.innerHTML = '<b>' + escapeHtml(month) + '</b><strong>' + escapeHtml(day) + '</strong>';
    if(body) body.innerHTML = '<span class="calendar-kicker">Next</span><strong>' + escapeHtml(time) + '</strong><span>' + escapeHtml(first.title || '(No title)') + '</span><small>' + escapeHtml(source === 'google' ? 'Google Calendar connected' : calendarEventSubtitle(first)) + '</small>';
  }else if(nextMeetingCard){
    nextMeetingCard.disabled = true;
    const top = nextMeetingCard.querySelector('.calendar-page-top');
    const body = nextMeetingCard.querySelector('.calendar-page-body');
    if(top) top.innerHTML = '<b>--</b><strong>--</strong>';
    if(body) body.innerHTML = '<span class="calendar-kicker">Next meeting</span><strong>None</strong><span>No attendee meeting found</span><small>Solo blocks stay out of meeting prep.</small>';
  }
  scrollCalendarPanelToCurrent();
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

function scrollCalendarPanelToCurrent(){
  if(!calendarPanelShouldScrollToCurrent || !fullCalendarPanel || !agendaList) return;
  calendarPanelShouldScrollToCurrent = false;
  window.requestAnimationFrame(() => {
    const target = agendaList.querySelector('.agenda-item.active') || agendaList.querySelector('.agenda-item:not(.calendar-past)');
    if(!target) return;
    target.scrollIntoView({block:'start', inline:'nearest'});
  });
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
  const [command,type,...rest] = String(action || '').split(':');
  if(command === 'cancel'){
    closeWorkspace();
    return;
  }
  if(command === 'meetingPrepCowork'){
    openMeetingPrepCoworkSession();
    return;
  }
  if(command === 'project'){
    await handleProjectActionClick(type, node);
    return;
  }
  const workflowPacket = node?.dataset?.valVariablePacket || 'workflow_scoped_packet';
  const workflowSource = workflowPacket === 'lead_intelligence_packet'
    ? activeLeadIntelligenceSource(action, {sourceType:'lead_intelligence_workflow_action', sourceLabel:node?.innerText || 'Lead Intelligence action'})
    : {};
  const workflowPreflight = await ensureHearthClickPacket({node, packetName:workflowPacket, action, allowBlockedForInspection:workflowPacket === 'lead_intelligence_packet', source:workflowSource});
  if(!workflowPreflight.ok) return;
  if(workflowPacket === 'lead_intelligence_packet'){
    renderHearthPacketReceiptStrip(workflowPreflight.packet || lastHearthPacketReceipt);
  }
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
      actions: relationshipContextActions([{label:'Back to move review', workflow:'relationship:find_relationship_introductions'}]),
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
      actions: relationshipContextActions([{label:'Back to move review', workflow:'relationship:find_relationship_introductions'}, {label:'Teach VAL why', workflow:'introTeach'}]),
      label: 'Introduction dismissed locally'
    });
    openWorkspaceShell('Introduction dismissed locally', {returnTarget:'relationship'});
    return;
  }
  if(command === 'introTeach'){
    setWorkspaceContent({
      lens: 'Teach VAL',
      title: 'Teach VAL about this relationship move.',
      meaning: 'You can explain why this move is right, wrong, too soon, too vague, or missing context.',
      understanding: ['Teaching stays reviewable.', 'VAL should learn judgment, not just preference.', 'No durable memory is saved from this prototype click.'],
      recommendation: 'Name the relationship principle VAL should remember before suggesting this kind of introduction again.',
      actions: relationshipContextActions([{label:'Back to draft', workflow:'introDraft:0'}]),
      label: 'Teach VAL relationship judgment'
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
      meaning: mode === 'temperature' ? 'VAL prepared your relationship understanding correction for review before it changes future judgment.' : 'VAL prepared your relationship correction for review before it becomes memory.',
      understanding: [
        'Relationship: ' + (profile.name || 'Relationship'),
        mode === 'temperature' ? 'Correction type: relationship understanding' : '',
        'Teaching: ' + teaching,
        reviewUpdateLine,
        'No durable memory, CRM update, message, scrape, import, or relationship fact changed from this prototype click.'
      ].filter(Boolean),
      recommendation: 'In live VAL, this would move to a review gate before becoming memory or changing future relationship judgment.',
      actions: relationshipContextActions((mode === 'temperature' ? [
        {label:'Review understanding correction', workflow:'relationshipTemperatureReview'},
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
  if(command === 'timeline'){
    closeWorkspace();
    restoreTimelineWindow();
    hydrateTimelineStatus();
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
  if(command === 'cowork' && type === 'card_context'){
    openCoworkFromClarityWorkspace();
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
    title: 'Review the CRM contact candidate.',
    meaning: (payload.name || record.attendee.name || 'This attendee') + ' is not in CRM yet, so VAL cannot attach relationship context cleanly.',
    understanding: [
      payload.email ? 'Email: ' + payload.email : 'No email is attached.',
      payload.note || 'This candidate came from the calendar attendee.',
      candidate.willNotDo || 'VAL will not merge contacts or send messages.'
    ],
    recommendation: 'Create the CRM contact only if this is the right person. The returned contact ID becomes the relationship key.',
    actions: [
      {label:'Create CRM contact', workflow:'contactCreate:' + key},
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
      meaning: 'No CRM contact was created in mock mode.',
      understanding: ['Live VAL will call ' + (candidate.endpoint || '/api/val/contacts/create') + ' after review.', candidate.onSuccess || 'The returned contact ID becomes canonical.'],
      recommendation: 'This is the intended identity loop before relationship context is attached.',
      actions: [{label:'Close and return to desk', workflow:'cancel:meeting'}],
      label: 'Meeting contact candidate prototype receipt'
    });
    return;
  }
  setWorkspaceContent({
    lens: 'Contact Identity',
    title: 'Creating the reviewed CRM contact.',
    meaning: 'VAL is creating the contact so future relationship context has a clean CRM key.',
    understanding: ['This is the only external write in this flow.', 'No message, opportunity, merge, or task is being created.', 'The returned CRM contact ID will be used going forward.'],
    recommendation: 'Wait for the CRM receipt before attaching relationship context.',
    actions: [{label:'Close and return to desk', workflow:'cancel:meeting'}],
    label: 'Meeting contact create loading'
  });
  try{
    const result = await postJson(candidate.endpoint || '/api/val/contacts/create', payload);
    const contactId = result.contactId || result.contact?.id || result.contact?.contactId || '';
    setWorkspaceContent({
      lens: 'Contact Identity',
      title: contactId ? 'CRM contact created.' : 'CRM contact needs review.',
      meaning: contactId ? (payload.name || 'This attendee') + ' is now organized under CRM contact ' + contactId + '.' : 'CRM responded without a contact ID, so VAL did not attach relationship context.',
      understanding: [
        contactId ? 'Canonical contact ID: ' + contactId : 'No canonical contact ID was returned.',
        result.relationshipDossier?.identityResolution?.status === 'resolved' ? 'Relationship Dossier is now keyed to that contact ID.' : 'Relationship Dossier was not attached.',
        'No message, opportunity, merge, or task was created.'
      ],
      recommendation: contactId ? 'Use the Relationship file from here forward so transcripts, calendar, and CRM context stay clean.' : 'Review the CRM contact manually before continuing.',
      actions: [
        contactId ? {label:'Open relationship file', workflow:'contactOpen:' + contactId} : null,
        {label:'Close and return to desk', workflow:'cancel:meeting'}
      ].filter(Boolean),
      label: 'Meeting contact create receipt'
    });
  }catch(error){
    setWorkspaceContent({
      lens: 'Contact Identity',
      title: 'The CRM contact was not created.',
      meaning: 'VAL did not attach relationship context.',
      understanding: [error.message, 'No message, opportunity, merge, or task was created.', 'The attendee remains unresolved until a CRM contact ID exists.'],
      recommendation: 'Check the CRM connection or create the contact manually before relying on relationship context.',
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

async function openCalendarTranscriptFromEvent(event = {}, node = null){
  closeCalendarPanel();
  restoreTimelineWindow();
  await loadTimelineTranscripts({openFirst:false});
  if(timelineReviewCards){
    timelineReviewCards.innerHTML = '<article class="empty"><span>Finding transcript</span><p>VAL is matching this calendar event to transcript evidence.</p></article>';
  }
  ensureHearthClickPacket({
    node,
    packetName:'timeline_packet',
    action:'timeline:calendar_transcript_match',
    source:calendarPacketSourceFromEvent(event, Number(node?.dataset?.calendarEventIndex || 0)),
    allowBlockedForInspection:true
  }).catch(() => {
    // Transcript lookup should still run if the packet receipt is delayed.
  });
  try{
    const data = await postJson('/api/val/calendar/matching-transcripts', {event, limit:5});
    const match = Array.isArray(data.matches) ? data.matches[0] : null;
    if(match?.id){
      await openTimelineTranscript(match.id);
      return;
    }
    if(timelineReviewCards){
      timelineReviewCards.innerHTML = '<article class="empty"><span>No transcript matched</span><p>VAL did not find a transcript confidently linked to ' + escapeHtml(event.title || event.summary || 'this event') + ' yet.</p></article>';
    }
  }catch(error){
    if(timelineReviewCards){
      timelineReviewCards.innerHTML = '<article class="empty"><span>Transcript match failed</span><p>' + escapeHtml(error.message || 'VAL could not search transcripts for this calendar event.') + '</p></article>';
    }
  }
}

async function openMeetingPrepWithPacket(node = nextMeetingCard, eventIndex = 0){
  const isAgendaNode = node?.matches?.('[data-calendar-event-index]');
  const event = isAgendaNode
    ? (currentCalendarEvents[eventIndex] || {})
    : (currentMeetingEvents[eventIndex] || currentMeetingEvents[0] || {});
  if(!calendarEventIsMeeting(event)){
    openCalendarPanelWithPacket(calendarTab);
    return;
  }
  activeMeetingPrepEvent = event;
  const prepPromise = openMeetingPrep();
  ensureHearthClickPacket({
    node,
    packetName:'timeline_packet',
    action:'timeline:meeting_prep',
    source:calendarPacketSourceFromEvent(event, eventIndex),
    allowBlockedForInspection:true
  }).then((preflight) => {
    if(preflight.ok) renderHearthPacketReceiptStrip(preflight.packet || lastHearthPacketReceipt);
  }).catch(() => {
    // Meeting prep should remain usable even if the audit receipt is delayed.
  });
  await prepPromise;
}

async function openCalendarPanelWithPacket(node = calendarTab){
  const event = currentCalendarEvents[0] || {};
  openCalendarPanel();
  ensureHearthClickPacket({
    node,
    packetName:'timeline_packet',
    action:'timeline:open_panel',
    source:calendarPacketSourceFromEvent(event, 0)
  }).then((preflight) => {
    if(preflight.ok) renderCalendarPacketReceiptStrip(preflight.packet || lastHearthPacketReceipt);
  }).catch(() => {
    // The calendar should open on the first click even if the packet receipt is delayed.
  });
}

async function openCoworkSessionWithPacket(node = coworkNotebook){
  openCoworkSession();
  void ensureHearthClickPacket({node, packetName:'cowork_packet', action:'cowork:open', allowBlockedForInspection:true}).then((preflight) => {
    if(preflight.ok) renderHearthPacketReceiptStrip(preflight.packet || lastHearthPacketReceipt);
  }).catch(() => {});
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
  if(view === 'opportunities') return 'CRM opportunity';
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
  const originalTitle = itemTitle(item, workspace.title || 'Supporting source');
  const roomName = roomNameFromWorkspace(workspace, 'source');
  setWorkspaceContent({
    lens: workspace.lens ? workspace.lens + ' Source' : 'Source Opened',
    title: executiveHomeBriefTitle(item, originalTitle, roomName),
    meaning: executiveHomeMeaning(item, workspace.meaning, roomName),
    understanding: [
      'Source surface: ' + destination + '.',
      route ? 'Route retained inside Hearth: ' + route : '',
      ...executiveHomeUnderstanding(item, originalTitle, roomName),
      'No CRM write, send, import, or durable memory action was taken.'
    ].filter(Boolean),
    recommendation: executiveHomeRecommendation(item, roomName),
    actions: [
      {label: 'Show why VAL believes this', homeAction: 'review_evidence'},
      {label: 'Close and return to desk', workflow: 'cancel:meeting'}
    ],
    label: 'Source opened receipt',
    packetReceipt: {},
    sourceItem: item
  });
  activeHomeWorkspace = {
    roomName,
    workspace: {
      ...workspace,
      sourceItem: item,
      cardType: workspace.cardType || 'homepage_card'
    }
  };
  markRoomAttended(roomName, 'source');
}

function openHomeSourceView(){
  const workspace = activeHomeWorkspace && activeHomeWorkspace.workspace ? activeHomeWorkspace.workspace : {};
  openHomeSourceDrawerDestination(workspace);
}

function renderHomeEvidenceBrief(){
  const workspace = activeHomeWorkspace && activeHomeWorkspace.workspace ? activeHomeWorkspace.workspace : {};
  const item = workspace.sourceItem || {};
  const roomName = roomNameFromWorkspace(workspace, 'source');
  const title = executiveHomeBriefTitle(item, workspace.title || itemTitle(item, 'Evidence review'), roomName);
  setWorkspaceContent({
    lens: workspace.lens ? workspace.lens + ' Evidence' : 'Evidence Review',
    title,
    meaning: executiveHomeMeaning(item, workspace.meaning, roomName),
    understanding: executiveHomeUnderstanding(item, title, roomName),
    recommendation: executiveHomeRecommendation(item, roomName),
    actions: [
      {label: sourceActionLabel(item, 'Open source behind this judgment'), homeAction: 'open_source'},
      {label: 'Close and return to desk', workflow: 'cancel:meeting'}
    ],
    label: 'Home evidence review',
    packetReceipt: {},
    sourceItem: item
  });
  activeHomeWorkspace = {
    roomName,
    workspace: {
      ...workspace,
      sourceItem: item,
      cardType: workspace.cardType || 'homepage_card'
    }
  };
  markRoomAttended(roomName, 'evidence');
}

function openExecutiveInboxForHomeEmail(item = {}){
  closeWorkspace();
  closeCalendarPanel();
  restoreCorrespondenceWindow();
  const hasSource = !!(item && (item.id || item.sourceId || item.messageId || item.threadId || item.title || item.subject || item.summary));
  hydrateCorrespondenceDrawer().then(() => {
    if(hasSource) selectCorrespondenceForHomeSource(item);
  }).catch((error) => {
    console.warn('[hearth] Executive Inbox drawer could not hydrate from Home', error.message);
  });
}

function homeSourceToken(value){
  return String(value || '').toLowerCase().replace(/[^a-z0-9@.]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function homeSourceTokens(item = {}){
  const metadata = item.metadata || item.metadataJson || {};
  const target = item.target || {};
  const email = homeEmailPayload(item);
  return [
    item.id,
    item.sourceId,
    item.source_id,
    item.targetId,
    target.id,
    item.contactId,
    metadata.contactId,
    item.personId,
    item.projectId,
    metadata.projectId,
    item.messageId,
    metadata.messageId,
    item.threadId,
    metadata.threadId,
    email.subject,
    email.from?.email,
    email.from?.name,
    item.title,
    item.name,
    item.subject,
    item.summary,
    target.label,
    target.name
  ].map(homeSourceToken).filter(Boolean);
}

function homeSourceCandidateTokens(candidate = {}){
  return [
    candidate.id,
    candidate.profileId,
    candidate.contactId,
    candidate.crmContactId,
    candidate.personId,
    candidate.projectId,
    candidate.messageId,
    candidate.threadId,
    candidate.conversationId,
    candidate.draftId,
    candidate.recipientEmail,
    candidate.email,
    candidate.name,
    candidate.displayName,
    candidate.company,
    candidate.title,
    candidate.subject,
    candidate.summary,
    candidate.context
  ].map(homeSourceToken).filter(Boolean);
}

function homeSourceCandidateScore(item = {}, candidate = {}){
  const itemTokens = homeSourceTokens(item);
  const candidateTokens = homeSourceCandidateTokens(candidate);
  let score = 0;
  itemTokens.forEach((itemToken) => {
    candidateTokens.forEach((candidateToken) => {
      if(!itemToken || !candidateToken) return;
      if(itemToken === candidateToken) score = Math.max(score, 100);
      else if(itemToken.length > 5 && candidateToken.includes(itemToken)) score = Math.max(score, 70);
      else if(candidateToken.length > 5 && itemToken.includes(candidateToken)) score = Math.max(score, 60);
    });
  });
  return score;
}

function findRelationshipForHomeSource(item = {}){
  return Object.entries(relationshipIndexSourceProfiles())
    .concat(Object.entries(relationshipIndexProfiles || {}))
    .concat(Object.entries(relationshipProfiles || {}))
    .reduce((best, [id, profile]) => {
      const score = homeSourceCandidateScore(item, {...profile, id, profileId:id});
      return score > best.score ? {id, profile:{...profile, profileId:id}, score} : best;
    }, {id:'', profile:null, score:0});
}

function findProjectForHomeSource(item = {}){
  return Object.entries(projectIndexProfiles || {})
    .concat(Object.entries(projectProfiles || {}))
    .reduce((best, [id, project]) => {
      const score = homeSourceCandidateScore(item, {...project, id});
      return score > best.score ? {id, project:{...project, id:project.id || id}, score} : best;
    }, {id:'', project:null, score:0});
}

function relationshipProfileFromHomeSource(item = {}){
  const identity = sourceIdentityForItem(item);
  const title = itemTitle(item, identity.label || 'Relationship');
  const name = title.split(':')[0].trim() || identity.label || 'Relationship';
  return {
    id: identity.id || item.id || 'home-relationship-' + Date.now().toString(36),
    profileId: identity.id || item.id || '',
    name,
    company: item.company || item.organization || '',
    role: 'Home source',
    temperature: /warm/i.test(title) ? 'Warm' : 'Observed',
    temperatureScore: /warm/i.test(title) ? 72 : 55,
    relationshipState: /risk|open loop|watch/i.test(title + ' ' + (item.summary || '')) ? 'watch' : 'active',
    trajectory: 'Watch',
    summary: item.summary || item.reason_it_matters || item.reason || title,
    latestSignal: item.summary || item.reason_it_matters || 'This relationship is the source behind the Velocity signal.',
    nextMove: suggestedRecommendationForHomeItem(item, 'velocity'),
    evidence: sourceOfSourceLines(item).join(' '),
    href: './dashboard.html?view=relationships&targetId=' + encodeURIComponent(identity.id || item.id || name),
    query: {contactId: identity.id || item.contactId || item.personId || '', name}
  };
}

function projectProfileFromHomeSource(item = {}){
  const identity = sourceIdentityForItem(item);
  const title = itemTitle(item, identity.label || 'Project');
  const name = title.split(':')[0].trim() || identity.label || 'Project';
  return {
    id: identity.id || item.id || 'home-project-' + Date.now().toString(36),
    name,
    status: 'Observed from Home',
    signal: item.summary || item.reason_it_matters || title,
    nextMove: suggestedRecommendationForHomeItem(item, 'velocity'),
    reality: item.summary || 'This project is the source behind the Velocity signal.',
    decision: 'Review the project source before deciding what moves next.',
    decisionEvidence: sourceOfSourceLines(item).join(' '),
    sourceDetails: {
      rawContext: item.summary || item.reason_it_matters || title,
      documents: sourceOfSourceLines(item).join(' ')
    },
    href: './dashboard.html?view=projects&targetId=' + encodeURIComponent(identity.id || item.id || name)
  };
}

function correspondenceItemFromHomeSource(item = {}){
  const email = homeEmailPayload(item);
  const id = email.messageId || email.threadId || item.id || item.sourceId || item.source_id || 'home-email-' + Date.now().toString(36);
  return {
    id,
    messageId: email.messageId,
    threadId: email.threadId,
    conversationId: email.threadId || email.messageId || '',
    provider: email.provider || 'gmail',
    title: email.subject || itemTitle(item, 'Email needing attention'),
    status: 'review_only',
    summary: email.snippet || item.summary || 'This email is the source behind the Home signal.',
    whyNow: email.reason || item.reason_it_matters || item.reason || 'VAL surfaced this email because it may affect attention, trust, or follow-through.',
    context: [email.from?.name, email.from?.email].filter(Boolean).join(' · ') || 'Sender context is attached when available.',
    prepared: 'No draft has been created from this click.',
    needs: 'Review the email, then decide whether to reply or create a dated follow-up task.',
    draftBody: '',
    evidence: [email.bodyPreview || email.snippet || item.summary].filter(Boolean),
    representationRisk: 'review',
    source: 'home_velocity_source',
    noExternalAction: true,
    raw: item
  };
}

function selectCorrespondenceForHomeSource(item = {}){
  const hasSource = !!(item && (item.id || item.sourceId || item.messageId || item.threadId || item.title || item.subject || item.summary));
  if(!hasSource){
    renderCorrespondenceBrief(currentCorrespondenceItems[0] || null);
    return;
  }
  const best = (currentCorrespondenceItems || []).reduce((winner, candidate) => {
    const score = homeSourceCandidateScore(item, candidate);
    return score > winner.score ? {item:candidate, score} : winner;
  }, {item:null, score:0});
  const selected = best.score >= 60 ? best.item : correspondenceItemFromHomeSource(item);
  if(!currentCorrespondenceItems.some((row) => row.id === selected.id)){
    currentCorrespondenceItems = [selected].concat(currentCorrespondenceItems || []);
  }
  renderCorrespondenceBrief(selected);
}

function openHomeSourceDrawerDestination(workspace = {}){
  const item = workspace.sourceItem || {};
  const destination = sourceDestinationLabel(item, workspace);
  const profile = targetProfile(item);
  hideWorkspaceForDrawerNavigation();
  if(profile.key === 'email' || /Executive Inbox|prepared draft|proposal draft/i.test(destination)){
    restoreCorrespondenceWindow();
    selectCorrespondenceForHomeSource(item);
    hydrateCorrespondenceDrawer().then(() => selectCorrespondenceForHomeSource(item));
    return;
  }
  if(profile.key === 'relationship' || /relationship/i.test(destination)){
    restoreRelationshipWindow();
    const match = findRelationshipForHomeSource(item);
    if(match.profile && match.score >= 60){
      renderRelationshipProfile(match.id, match.profile);
      loadRelationshipDossier(match.id);
    } else {
      const fallback = relationshipProfileFromHomeSource(item);
      relationshipIndexProfiles[fallback.id] = fallback;
      renderRelationshipProfile(fallback.id, fallback);
    }
    return;
  }
  if(profile.key === 'project' || /project/i.test(destination)){
    restoreProjectWindow();
    const match = findProjectForHomeSource(item);
    if(match.project && match.score >= 60) {
      renderProjectProfile(match.id);
    } else {
      const fallback = projectProfileFromHomeSource(item);
      projectIndexProfiles[fallback.id] = fallback;
      renderProjectProfile(fallback.id);
    }
    return;
  }
  if(profile.key === 'meeting' || /meeting|calendar/i.test(destination)){
    openCalendarPanel();
    return;
  }
  if(/task|commitment/i.test(destination)){
    restoreCommitmentWindow();
    hydrateCommitmentDrawer();
    return;
  }
  if(/document|proposal/i.test(destination)){
    restoreDocumentWindow();
    return;
  }
  restoreLeadIntelligenceWindow();
}

function openHomeCardCowork(workspace){
  const active = workspace || activeHomeWorkspace?.workspace || activeClarityWorkspace || {};
  activeClarityWorkspace = active;
  openContextualCoworkSession({
    returnTarget: 'home',
    title: 'Co-Work with VAL: ' + compactSentence(active.title, 'Home card'),
    meaning: 'How can I help with ' + compactSentence(active.title, 'this Home card') + '?',
    context: [
      active.packetFields?.what_changed ? 'What happened: ' + active.packetFields.what_changed : '',
      active.packetFields?.why_it_matters ? 'Why it matters: ' + active.packetFields.why_it_matters : '',
      active.packetFields?.what_val_now_knows ? 'What VAL now knows: ' + active.packetFields.what_val_now_knows : '',
      active.packetFields?.evidence_summary ? 'Evidence: ' + active.packetFields.evidence_summary : '',
      active.packetFields?.recommended_next_step ? 'Recommended next step: ' + active.packetFields.recommended_next_step : ''
    ].filter(Boolean),
    recommendation: active.recommendation || active.packetFields?.recommended_next_step || 'Use this card packet to decide the next move.',
    placeholder: 'How can I help with ' + compactSentence(active.title, 'this card') + '?',
    helper: 'VAL already has the card context. Ask for a decision, reply, task, draft, or next move.',
    initialValue: '',
    backWorkflow: 'cancel:meeting'
  });
}

function openVelocityAwarenessWorkspace(){
  const items = homeRoomQueues.velocity || [];
  setWorkspaceContent({
    lens: 'Velocity',
    title: 'What changed while you were away.',
    meaning: items.length ? 'VAL found movement that may affect attention, trust, or follow-through.' : 'No meaningful movement is waiting right now.',
    understanding: items.length
      ? items.slice(0, 5).map((item) => {
          const fields = homePacketDisplayFields(item.sourceItem || item, 'velocity');
          return fields.what_changed + ' — ' + fields.source_type + ' — ' + fields.why_it_matters;
        })
      : ['No changed email, relationship, project, document, transcript, calendar, or commitment item is currently loaded.'],
    recommendation: items.length ? 'Open only the source you want to inspect. Velocity is awareness, not action.' : 'Keep the desk clear until a new signal appears.',
    actions: [{label: 'Close and return to desk', workflow: 'cancel:meeting'}],
    label: 'Velocity awareness workspace',
    packetReceipt: {},
    suppressClarityStandard: true
  });
  renderHomePacketRows('velocity', items);
  openWorkspaceShell('Velocity awareness workspace', {returnTarget:'home'});
}

function openAlignmentExecutionWorkspace(){
  const workspace = activateHomeQueueItem('alignment', 0) || (() => {
    const content = currentState.rooms?.alignment?.workspace || {};
    const item = content.sourceItem || {};
    const fields = homePacketDisplayFields(item, 'alignment');
    return {
      ...content,
      title: fields.what_changed || content.title,
      meaning: fields.why_it_matters || content.meaning,
      recommendation: fields.recommended_next_step || content.recommendation,
      packetFields: fields,
      coworkContext: fields.cowork_context,
      sourceItem: item,
      cardType: 'highest_leverage'
    };
  })();
  activeHomeWorkspace = {roomName:'alignment', workspace};
  activeClarityWorkspace = workspace;
  openHomeCardCowork(workspace);
}

function openLeverageApprovalWorkspace(){
  const items = homeRoomQueues.leverage || [];
  setWorkspaceContent({
    lens: 'Leverage',
    title: 'Prepared work waiting for approval.',
    meaning: items.length ? 'VAL prepared work you can inspect, edit, or approve for execution.' : 'No prepared work is waiting for approval right now.',
    understanding: items.length
      ? items.slice(0, 5).map((item) => {
          const fields = homePacketDisplayFields(item.sourceItem || item, 'leverage');
          return fields.what_changed + ' — triggered by ' + fields.source_type + ' — ' + fields.recommended_next_step;
        })
      : ['No prepared email, proposal, appointment, CRM update, task, document, or packet is currently loaded.'],
    recommendation: items.length ? 'Open one prepared item, edit if needed, then approve only the external action tied to that item.' : 'Nothing needs approval from Leverage.',
    actions: [{label: 'Close and return to desk', workflow: 'cancel:meeting'}],
    label: 'Leverage approval workspace',
    packetReceipt: {},
    suppressClarityStandard: true
  });
  renderHomePacketRows('leverage', items);
  openWorkspaceShell('Leverage approval workspace', {returnTarget:'home'});
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
    meaning: 'VAL kept the evidence visible so you can decide what to trust, do, or correct.',
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
      item && Object.keys(item).length ? {label: sourceActionLabel(item, 'Open source behind this judgment'), homeAction: 'open_source'} : null
    ].filter(Boolean),
    label: 'Home judgment action result',
    sourceItem: item
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

function preparedApprovalVerb(item = {}){
  const kind = preparedArtifactKind(item);
  const type = String(kind || sourceIdentityForItem(item).type || item.type || '').toLowerCase();
  if(/calendar|appointment|invite/.test(type)) return 'scheduled';
  if(/crm|opportunity|pipeline|contact/.test(type)) return 'updated';
  if(/document|proposal|agreement|packet/.test(type)) return 'attached';
  if(/task|commitment/.test(type)) return 'created';
  if(/email|reply|introduction/.test(type)) return 'sent';
  return 'approved';
}

function renderPreparedApprovalReceipt(){
  const workspace = activeHomeWorkspace?.workspace || {};
  const item = workspace.sourceItem || {};
  const fields = workspace.packetFields || homePacketDisplayFields(item, 'leverage');
  const verb = preparedApprovalVerb(item);
  const receipt = verb === 'approved' ? 'Approved.' : 'Approved and ' + verb + '.';
  setWorkspaceContent({
    lens: 'Leverage Receipt',
    title: receipt,
    meaning: fields.what_changed + ' has cleared the user approval step for its prepared action.',
    understanding: [
      'Prepared work: ' + fields.what_changed,
      'Triggered by: ' + fields.source_type + (fields.source_label ? ' - ' + fields.source_label : ''),
      'Evidence: ' + fields.evidence_summary,
      'External action class: ' + verb
    ],
    recommendation: 'Move to the next prepared item, or return to the desk if nothing else needs approval.',
    actions: [
      {label: 'Open next prepared item', workflow: 'cancel:meeting'},
      {label: 'Close and return to desk', workflow: 'cancel:meeting'}
    ],
    label: 'Leverage approval receipt',
    packetReceipt: {},
    sourceItem: item,
    suppressClarityStandard: true
  });
}

async function completeProjectPinFromAlignment(){
  const workspace = activeHomeWorkspace?.workspace || currentState.rooms?.alignment?.workspace || {};
  const item = workspace.sourceItem || homeRoomQueues.alignment?.[0]?.sourceItem || homeRoomQueues.alignment?.[0] || {};
  const pinId = projectPinIdFromAlignmentItem(item);
  if(!pinId){
    setWorkspaceContent({
      lens: 'Alignment',
      title: 'This reminder could not be cleared.',
      meaning: 'VAL could not find the project-pin record behind this Alignment item.',
      understanding: [itemTitle(item, 'Reopened project loop'), 'No external action was taken.'],
      recommendation: 'Open the Project Manager page and handle the loop from there.',
      actions: [
        {label: 'Open Project Manager', homeAction: 'open_source'},
        {label: 'Close and return to desk', workflow: 'cancel:meeting'}
      ],
      label: 'Project pin clear error',
      sourceItem: item
    });
    return;
  }
  if(!canUseApi){
    setWorkspaceContent({
      lens: 'Alignment',
      title: 'The reminder stayed pinned.',
      meaning: 'The local VAL server is needed to clear a persisted project reminder.',
      understanding: [itemTitle(item, 'Reopened project loop'), 'No external action was taken.'],
      recommendation: 'Try again when the local service is available.',
      actions: [{label: 'Close and return to desk', workflow: 'cancel:meeting'}],
      label: 'Project pin clear unavailable',
      sourceItem: item
    });
    return;
  }
  try{
    await postJson('/api/val/project-pins/' + encodeURIComponent(pinId) + '/complete', {reason:'Handled from Alignment'});
    setHomeRoomQueue('alignment', []);
    clearHomeRoomForAdmission('alignment');
    setRoomCopy(currentState);
    setWorkspaceContent({
      lens: 'Alignment Receipt',
      title: 'Reminder cleared.',
      meaning: 'VAL removed this reopened project reminder from Alignment.',
      understanding: [
        itemTitle(item, 'Reopened project loop'),
        'Only the reminder loop was cleared.',
        'The project record stayed intact.',
        'No external action was taken.'
      ],
      recommendation: 'Return to the desk, or open Project Managers if the project itself still needs work.',
      actions: [
        {label: 'Open Project Managers', workflow: 'projectAllProjects'},
        {label: 'Close and return to desk', workflow: 'cancel:meeting'}
      ],
      label: 'Project pin clear receipt',
      sourceItem: item,
      suppressClarityStandard: true
    });
    activeHomeWorkspace = {roomName:'alignment', workspace:{...workspace, sourceItem:item, cardType:workspace.cardType || 'highest_leverage'}};
  }catch(error){
    setWorkspaceContent({
      lens: 'Alignment',
      title: 'The reminder could not be cleared.',
      meaning: 'Nothing external happened, and the project context stayed attached.',
      understanding: [error.message, itemTitle(item, 'Reopened project loop')],
      recommendation: 'Open the Project Manager page or try clearing the reminder again.',
      actions: [
        {label: 'Open Project Manager', homeAction: 'open_source'},
        {label: 'Try again', homeAction: 'complete_project_pin'}
      ],
      label: 'Project pin clear failed',
      sourceItem: item
    });
  }
}

async function handleHomeRoomAction(action, node = null){
  if(node?.dataset?.homeRoomItemAction){
    activateHomeQueueItem(node.dataset.homeRoomItemAction, node.dataset.homeRoomIndex);
  }
  if(action === 'cowork_card_context'){
    openHomeCardCowork(activeHomeWorkspace?.workspace || activeClarityWorkspace);
    return;
  }
  if(action === 'open_prepared'){
    openHomeSourceView();
    return;
  }
  if(action === 'approve_prepared'){
    renderPreparedApprovalReceipt();
    return;
  }
  if(action === 'complete_project_pin'){
    await completeProjectPinFromAlignment();
    return;
  }
  if(action === 'open_source'){
    openHomeSourceView();
    return;
  }
  if(action === 'review_evidence'){
    renderHomeEvidenceBrief();
    return;
  }
  if(action === 'open_executive_inbox' || action === 'draft_email_reply' || action === 'create_email_task'){
    await runHomeEmailAction(action);
    return;
  }
  const homePreflight = await ensureHearthClickPacket({node, packetName:node?.dataset?.valVariablePacket || 'home_source_packet', action});
  if(!homePreflight.ok) return;
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
  workspaceReturnTarget = 'meeting';
  hearth.dataset.distance = 'judgment';
  hearth.classList.add('calendar-prep-open');
  deskWorkspace.setAttribute('aria-hidden', 'false');
  document.querySelectorAll('.living-room').forEach((room) => {
    room.classList.remove('active-room');
  });
  updateDrawerCoworkIcon();
  await runMeetingPrep();
}

function openCoworkSession(){
  closeCalendarPanel();
  activeCoworkHeldContext = '';
  activeCoworkContextLocked = false;
  setWorkspaceContent({
    lens: coworkSession.lens,
    title: coworkSession.title,
    meaning: coworkSession.meaning,
    understanding: coworkSession.understanding,
    recommendation: coworkSession.recommendation,
    actions: [],
    label: 'Home Co-Work with VAL approval workspace',
    suppressClarityStandard: true
  });
  deskWorkspace.classList.add('home-cowork-mode');
  renderHomeCoworkPreview();
  hearth.dataset.distance = 'judgment';
  deskWorkspace.setAttribute('aria-hidden', 'false');
  document.querySelectorAll('.living-room').forEach((room) => {
    room.classList.remove('active-room');
  });
}

function renderHomeCoworkPreview(options = {}){
  const heading = options.heading || 'What shall we accomplish together?';
  const detail = options.detail || '';
  const placeholder = options.placeholder || 'Tell VAL what you want to accomplish';
  if(workspaceGrid) workspaceGrid.hidden = true;
  scraperPreviewList.hidden = false;
  scraperPreviewList.classList.remove('linkedin-preview-list', 'meeting-prep-brief');
  scraperPreviewList.innerHTML = [
    '<div class="home-cowork-workspace" aria-label="VAL workspace">',
      '<aside class="home-cowork-sidebar">',
        '<div class="home-cowork-context" data-home-cowork-context>',
          '<span>Context</span>',
          '<strong>' + escapeHtml(heading) + '</strong>',
          detail ? '<p>' + escapeHtml(detail) + '</p>' : '',
        '</div>',
        '<div class="home-cowork-history">',
          '<span>Previous conversations</span>',
          '<button type="button" aria-pressed="true">Current thread</button>',
          '<small>No earlier project Co-Work thread is loaded in this view.</small>',
        '</div>',
      '</aside>',
      '<section class="home-cowork-main">',
        '<div class="home-cowork-preview" aria-label="VAL">',
          '<span class="val-presence-mark home-cowork-mark" aria-hidden="true">',
            '<span class="val-presence-orbit"></span>',
            '<span class="val-presence-core">VAL</span>',
          '</span>',
          '<div>',
            '<p>VAL</p>',
            '<small>Scoped conversation. No external action happens from here.</small>',
          '</div>',
        '</div>',
        '<div class="home-cowork-thread" data-home-cowork-response>',
          '<article class="home-cowork-message val"><span>VAL</span><p>' + escapeHtml(heading) + '</p></article>',
        '</div>',
      '</section>',
    '</div>'
  ].join('');
  workspaceInputPanel.hidden = false;
  workspaceInputPanel.innerHTML = [
    '<form class="home-cowork-chatbar" data-home-cowork-form>',
      '<span class="home-cowork-spark" aria-hidden="true"></span>',
      '<span class="home-cowork-divider" aria-hidden="true"></span>',
      '<textarea data-workspace-input="cowork" aria-label="' + escapeHtml(placeholder) + '" placeholder="' + escapeHtml(placeholder) + '" rows="3" autocomplete="on" autocorrect="on" spellcheck="true"></textarea>',
      '<button type="submit" data-home-cowork-submit aria-label="Send to VAL">Send</button>',
      '<button type="button" data-workspace-tool="voice" aria-label="Voice">Voice</button>',
      '<button type="button" data-workspace-tool="upload" aria-label="Upload">Upload</button>',
      '<button type="button" data-workspace-tool="image" aria-label="Generate image">Image</button>',
      '<input type="file" data-workspace-file-input multiple hidden>',
    '</form>'
  ].join('');
  enableValAutocorrect(workspaceInputPanel);
}

function homeCoworkResponseNode(){
  return scraperPreviewList?.querySelector?.('[data-home-cowork-response]') || null;
}

function renderHomeCoworkMessage(role = 'val', text = ''){
  const label = role === 'user' ? 'You' : 'VAL';
  return '<article class="home-cowork-message ' + escapeHtml(role) + '"><span>' + escapeHtml(label) + '</span><p>' + escapeHtml(text || '') + '</p></article>';
}

function appendHomeCoworkMessage(role = 'val', text = '', options = {}){
  const response = homeCoworkResponseNode();
  if(!response) return null;
  if(options.replace){
    response.innerHTML = renderHomeCoworkMessage(role, text);
  }else{
    response.insertAdjacentHTML('beforeend', renderHomeCoworkMessage(role, text));
  }
  response.scrollTop = response.scrollHeight;
  return response;
}

function openObserverBoard(){
  const chief = observerBoardState.chiefOfStaff;
  closeCalendarPanel();
  setWorkspaceContent({
    lens: 'Board of Observers',
    title: 'Your Board of Observers',
    meaning: chief.view,
    understanding: [
      'The Board is only useful when it is fed by real drawer packets.',
      'Missing packets should show as missing, not as confident executive advice.',
      'This view is currently an inspection surface, not a recommendation.'
    ],
    recommendation: chief.next,
    actions: [{label:'Close and return to desk', workflow:'cancel:board'}],
    label: 'Board of Observers',
    suppressClarityStandard: true
  });
  deskWorkspace.classList.add('observer-board-mode');
  if(workspaceGrid) workspaceGrid.hidden = true;
  renderJudgmentSequence({lens:'Board of Observers'}, 'Board of Observers');
  workspaceInputPanel.hidden = false;
  workspaceInputPanel.innerHTML = [
    '<section class="observer-chief-card" aria-label="Board readiness">',
      '<span>Board readiness</span>',
      '<strong>' + escapeHtml(chief.view) + '</strong>',
      '<p>' + escapeHtml(chief.why) + '</p>',
      '<small>' + escapeHtml(chief.next) + '</small>',
    '</section>',
    '<section class="observer-board-grid" aria-label="Observer packet readiness">',
      observerBoardState.observers.map((observer) => [
        '<article class="observer-truth-card">',
          '<div>',
            '<span>' + escapeHtml(observer.stance) + '</span>',
            '<strong>' + escapeHtml(observer.name) + '</strong>',
          '</div>',
          '<p>' + escapeHtml(observer.truth) + '</p>',
          '<small>Evidence: ' + escapeHtml(observer.evidence) + '</small>',
        '</article>'
      ].join('')).join(''),
    '</section>',
    '<p class="observer-board-note">If this view claims certainty without a packet, that is a bug. Teach VAL or open the source drawer before trusting the Board.</p>'
  ].join('');
  hearth.dataset.distance = 'judgment';
  deskWorkspace.setAttribute('aria-hidden', 'false');
  openWorkspaceShell('Board of Observers', {returnTarget:'home'});
}

function orientHomeCoworkFromInput(){
  const input = workspaceInputValue('cowork');
  const context = workspaceInputPanel.querySelector('[data-home-cowork-context]') || scraperPreviewList.querySelector('[data-home-cowork-context]');
  if(!input || !context) return;
  if(activeCoworkContextLocked) return;
  activeCoworkHeldContext = '';
  context.innerHTML = [
    '<span>Context</span>',
    '<strong>VAL is finding the right context.</strong>',
    '<p>' + escapeHtml(compactSentence(input, 'Ready to work together.')) + '</p>'
  ].join('');
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
  if(button?.dataset?.actionType === 'openExecutiveInbox'){
    openExecutiveInboxForHomeEmail({});
    return;
  }
  const roomName = button?.dataset?.openRoom || '';
  if(roomName === 'velocity'){
    openVelocityAwarenessWorkspace();
    return;
  }
  if(roomName === 'alignment'){
    openAlignmentExecutionWorkspace();
    return;
  }
  if(roomName === 'leverage'){
    openLeverageApprovalWorkspace();
    return;
  }
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
    },
    allowBlockedForInspection: isHomeExecutiveMode
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
  activeCoworkHeldContext = '';
  activeCoworkContextLocked = false;
  activeProjectCoworkTarget = null;
  hearth.dataset.distance = 'presence';
  hearth.classList.add('desk-settling');
  hearth.classList.remove('calendar-prep-open');
  deskWorkspace.classList.remove('home-cowork-mode', 'observer-board-mode');
  deskWorkspace.setAttribute('aria-hidden', 'true');
  if(workspaceReturnTarget === 'relationship') restoreRelationshipWindow();
  if(workspaceReturnTarget === 'project') restoreProjectWindow();
  if(workspaceReturnTarget === 'timeline') restoreTimelineWindow();
  if(workspaceReturnTarget === 'correspondence') restoreCorrespondenceWindow();
  if(workspaceReturnTarget === 'commitment') restoreCommitmentWindow();
  if(workspaceReturnTarget === 'document') restoreDocumentWindow();
  if(workspaceReturnTarget === 'source') restoreLeadIntelligenceWindow();
  if(workspaceReturnTarget === 'val') restoreValWindow();
  workspaceReturnTarget = 'home';
  updateWorkspaceReturnButton();
  updateDrawerCoworkIcon();
  document.querySelectorAll('.living-room').forEach((room) => {
    room.classList.remove('active-room');
  });
  window.setTimeout(() => hearth.classList.remove('desk-settling'), 620);
}

function hideWorkspaceForDrawerNavigation(){
  if(hearth.dataset.distance !== 'judgment') return;
  activeHomeWorkspace = null;
  activeCoworkHeldContext = '';
  activeCoworkContextLocked = false;
  activeProjectCoworkTarget = null;
  hearth.dataset.distance = 'presence';
  hearth.classList.remove('calendar-prep-open');
  deskWorkspace.classList.remove('home-cowork-mode', 'observer-board-mode');
  deskWorkspace.setAttribute('aria-hidden', 'true');
  workspaceReturnTarget = 'home';
  updateWorkspaceReturnButton();
  updateDrawerCoworkIcon();
  document.querySelectorAll('.living-room').forEach((room) => {
    room.classList.remove('active-room');
  });
}

function openCalendarPanel(){
  closeWorkspace();
  closeDrawer();
  calendarPanelShouldScrollToCurrent = true;
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

leanButton?.addEventListener('click', () => {
  const isOpen = evidence.classList.toggle('open');
  hearth.classList.toggle('evidence-open', isOpen);
  leanButton.setAttribute('aria-expanded', String(isOpen));
});

freshDeskButton?.addEventListener('click', clearRoomAttendance);

drawerPull.addEventListener('click', () => {
  hideWorkspaceForDrawerNavigation();
  const isOpen = retrievalSystem.classList.toggle('open');
  if(!isOpen) retrievalSystem.removeAttribute('data-active-drawer');
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

async function handleValDetailWorkflowClick(event){
  const workflowButton = event.target.closest('[data-workflow-action]');
  if(!workflowButton || !workflowButton.closest('#val-detail')) return false;
  const action = workflowButton.dataset.workflowAction || '';
  if(!action.startsWith('val')) return false;
  event.preventDefault();
  event.stopPropagation();
  const preflight = await ensureHearthClickPacket({
    node:workflowButton,
    packetName:'val_os_packet',
    action,
    allowBlockedForInspection:true,
    source:{
      sourceId:action,
      sourceType:'val_entry_action',
      sourceLabel:workflowButton.innerText || action,
      sourceItem:{id:action, title:workflowButton.innerText || action, sourceType:'val_entry_action'}
    }
  });
  renderDrawerPacketReceiptStrip(preflight.packet || lastHearthPacketReceipt);
  if(action === 'valConnections:review' || action === 'valConnections'){
    openValConnectionsWorkspace();
    return true;
  }
  if(action === 'valWitnessingResume'){
    await openValWitnessingSession('meeting_val', {resume:true});
    return true;
  }
  if(action === 'valWitnessingFresh'){
    await openValWitnessingSession('meeting_val', {fresh:true});
    return true;
  }
  await handleWorkflowAction(action, workflowButton);
  return true;
}

valDetail?.addEventListener('click', handleValDetailWorkflowClick);
document.addEventListener('click', (event) => {
  if(event.target.closest('#val-detail [data-workflow-action^="val"]')){
    handleValDetailWorkflowClick(event);
  }
}, true);

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
    if(leadDrawerPreviewList && !leadDrawerPreviewList.innerHTML.trim()) leadSourcingEmptyBoard();
    scrollLeadIntelligenceActionsIntoView();
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
    retrievalSystem.dataset.activeDrawer = 'relationship';
    drawerIndexPacketReceipt({node:relationshipDrawerLink, packetName:'relationship_packet', action:'drawer:relationships', label:'Stewardship drawer', downstreamConsumers:['relationship_drawer','project_packet','email_packet','home_source_packet']});
    openRelationshipIndex();
  } else {
    retrievalSystem.removeAttribute('data-active-drawer');
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
    drawerIndexPacketReceipt({node:projectDrawerLink, packetName:'project_packet', action:'drawer:projects', label:'Project Managers drawer', downstreamConsumers:['project_drawer','relationship_packet','email_packet','home_source_packet']});
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
    drawerIndexPacketReceipt({node:timelineDrawerLink, packetName:'timeline_packet', action:'drawer:timeline', label:'Transcripts drawer', downstreamConsumers:['timeline_drawer','meeting_prep','relationship_packet','project_packet']});
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
  if(isOpen) retrievalSystem.dataset.activeDrawer = 'correspondence';
  else retrievalSystem.removeAttribute('data-active-drawer');
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
  const detail = document.querySelector('#relationship-detail');
  if(detail?.classList.contains('show-index')){
    drawerTray.classList.remove('relationship-open');
    retrievalSystem.removeAttribute('data-active-drawer');
    relationshipDrawerLink.setAttribute('aria-expanded', 'false');
    detail.setAttribute('aria-hidden', 'true');
    return;
  }
  drawerTray.classList.add('relationship-open');
  retrievalSystem.dataset.activeDrawer = 'relationship';
  relationshipDrawerLink.setAttribute('aria-expanded', 'true');
  detail?.setAttribute('aria-hidden', 'false');
  openRelationshipIndex();
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
  event.preventDefault();
  event.stopPropagation();
  const selected = currentDocumentItems.find((item) => item.id === button.dataset.documentItem);
  renderDocumentBrief(selected);
  void ensureHearthClickPacket({node:button, packetName:'document_packet', action:'document:select', allowBlockedForInspection:true, source:documentSource(selected, 'document:select')}).then((preflight) => {
    renderDrawerPacketReceiptStrip(preflight.packet || lastHearthPacketReceipt);
  });
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

documentIntakeScan?.addEventListener('click', async () => {
  const preflight = await ensureHearthClickPacket({node:documentIntakeScan, packetName:'document_packet', action:'document:scan_gmail', allowBlockedForInspection:true, source:{...documentSource(activeDocumentItem, 'document:scan_gmail'), sourceType:'document_intake_scan', sourceLabel:'Gmail document scan'}});
  if(!preflight.ok) return;
  renderDrawerPacketReceiptStrip(preflight.packet || lastHearthPacketReceipt);
  await scanDocumentIntakeFromGmail();
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

projectManagerProfile?.addEventListener('keydown', async (event) => {
  if(event.target.closest('button,a,input,select,textarea,summary')) return;
  const scope = event.target.closest('[data-project-cowork-scope]');
  const card = event.target.closest('[data-project-cowork-field]');
  if((!scope && !card) || (event.key !== 'Enter' && event.key !== ' ')) return;
  event.preventDefault();
  event.stopPropagation();
  if(scope) await openProjectScopedCowork(scope.dataset.projectCoworkScope, scope, {mode:'project_cowork'});
  else await openProjectFieldCowork(card.dataset.projectCoworkField, card);
});

projectManagerProfile?.addEventListener('submit', (event) => {
  if(event.target.matches('[data-project-edit-form]')){
    saveProjectEditFromForm(event);
    return;
  }
  if(event.target.matches('[data-project-pin-form]')){
    createProjectPinFromForm(event);
    return;
  }
  if(event.target.matches('[data-project-owner-create-form]')){
    createProjectOwnerRelationshipFromForm(event);
  }
});

async function openRelationshipProfileFromFolder(profileId = '', node = null){
  const profile = relationshipIndexSourceProfiles()[profileId] || relationshipProfiles[profileId] || relationshipIndexProfiles[profileId] || {};
  renderRelationshipProfile(profileId, {...profile, profileId});
  const selectedSource = relationshipSource({...profile, profileId}, 'relationship:open_profile', '');
  const preflight = await ensureHearthClickPacket({node, packetName:'relationship_packet', action:'relationship:open_profile', allowBlockedForInspection:true, source:selectedSource});
  if(!preflight.ok) return;
  const selectedLabel = selectedSource.sourceLabel || profile.name || profileId;
  const receiptLabels = packetReceiptSummary(preflight.packet || {}).sourceLabels.join(' ');
  const receiptMatchesSelection = selectedLabel && receiptLabels.toLowerCase().includes(String(selectedLabel).toLowerCase());
  const packet = receiptMatchesSelection ? preflight.packet : localHearthMetadataPacket({packetName:'relationship_packet', action:'relationship:open_profile', node, source:selectedSource});
  renderDrawerPacketReceiptStrip(packet || lastHearthPacketReceipt);
  loadRelationshipDossier(profileId);
}

async function handleRelationshipCardNode(card = null){
  return false;
}

async function handleRelationshipDetailClickEvent(event){
  const relationshipAction = event.target.closest('#relationship-detail [data-relationship-action]');
  if(relationshipAction){
    event.preventDefault();
    event.stopPropagation();
    if(event.stopImmediatePropagation) event.stopImmediatePropagation();
    await handleRelationshipActionClick(relationshipAction.dataset.relationshipAction, relationshipAction);
    return true;
  }
  return false;
}

relationshipFolderButtons.forEach((button) => {
  button.addEventListener('click', () => {
    openRelationshipProfileFromFolder(button.dataset.relationshipProfile, button);
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
    if(relationshipStateFilter === 'people_to_watch') relationshipPeopleToWatchExpanded = true;
    relationshipStateFilterButtons.forEach((filterButton) => {
      const isActive = filterButton === button;
      filterButton.classList.toggle('active', isActive);
      filterButton.setAttribute('aria-pressed', String(isActive));
    });
    renderRelationshipRolodex();
  });
});

stewardshipViewButtons.forEach((button) => {
  button.addEventListener('click', () => setStewardshipView(button.dataset.stewardshipView || 'suggested'));
});

stewardshipPersonASelect?.addEventListener('change', () => {
  stewardshipPersonAId = stewardshipPersonASelect.value || '';
  renderStewardshipComparison();
});

stewardshipPersonBSelect?.addEventListener('change', () => {
  stewardshipPersonBId = stewardshipPersonBSelect.value || '';
  renderStewardshipComparison();
});

drawerTray.addEventListener('click', async (event) => {
  const transcriptImport = event.target.closest('[data-transcript-import-krisp], [data-transcript-import-krisp-direct]');
  if(transcriptImport){
    event.preventDefault();
    event.stopPropagation();
    await showKrispManualImportStatus();
    return;
  }
  const transcriptOpen = event.target.closest('[data-transcript-open]');
  if(transcriptOpen){
    event.preventDefault();
    event.stopPropagation();
    await openTimelineTranscript(transcriptOpen.dataset.transcriptOpen);
    return;
  }
  const transcriptChat = event.target.closest('[data-transcript-chat]');
  if(transcriptChat){
    event.preventDefault();
    event.stopPropagation();
    await timelineTranscriptAsk(transcriptChat.dataset.transcriptChat);
    return;
  }
  const transcriptAction = event.target.closest('[data-transcript-action]');
  if(transcriptAction){
    event.preventDefault();
    event.stopPropagation();
    await timelineTranscriptAction(transcriptAction.dataset.transcriptId, transcriptAction.dataset.transcriptAction);
    return;
  }
  const transcriptReprocess = event.target.closest('[data-transcript-reprocess]');
  if(transcriptReprocess){
    event.preventDefault();
    event.stopPropagation();
    await timelineTranscriptReprocess(transcriptReprocess.dataset.transcriptReprocess);
    return;
  }
  const transcriptFull = event.target.closest('[data-transcript-full-toggle]');
  if(transcriptFull){
    event.preventDefault();
    event.stopPropagation();
    const full = drawerTray.querySelector('[data-transcript-full]');
    if(full){
      const nextHidden = !full.hidden;
      full.hidden = nextHidden;
      transcriptFull.textContent = nextHidden ? 'View full transcript' : 'Hide full transcript';
    }
    return;
  }
  const timelineAction = event.target.closest('[data-timeline-action]');
  if(timelineAction){
    event.preventDefault();
    event.stopPropagation();
    const firstReview = currentTimelineReviewItems[0] || null;
    const preflight = await ensureHearthClickPacket({node:timelineAction, packetName:'timeline_packet', action:timelineAction.dataset.timelineAction, allowBlockedForInspection:true, source:{review:firstReview, sourceId:firstReview?.id || 'timeline-drawer', sourceType:firstReview ? 'timeline_proposal' : 'timeline_drawer', sourceLabel:firstReview?.title || 'Transcripts', sourceItem:firstReview || {reviewCount:currentTimelineReviewItems.length}}});
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
    await runCorrespondenceActionClick(correspondenceAction, event);
    return;
  }
  const correspondenceScan = event.target.closest('[data-correspondence-scan-days]');
  if(correspondenceScan){
    event.preventDefault();
    event.stopPropagation();
    await scanCorrespondenceWindow(correspondenceScan.dataset.correspondenceScanDays);
    return;
  }
  const correspondenceRulesClose = event.target.closest('[data-correspondence-rules-close]');
  if(correspondenceRulesClose || event.target === correspondenceRulesPanel){
    event.preventDefault();
    event.stopPropagation();
    setCorrespondenceRulesPanel(false);
    return;
  }
  const correspondenceSuggestionAccept = event.target.closest('[data-correspondence-suggestion-accept]');
  if(correspondenceSuggestionAccept){
    event.preventDefault();
    event.stopPropagation();
    await acceptCorrespondenceRuleSuggestion(Number(correspondenceSuggestionAccept.dataset.correspondenceSuggestionAccept));
    return;
  }
  const correspondenceSuggestionDismiss = event.target.closest('[data-correspondence-suggestion-dismiss]');
  if(correspondenceSuggestionDismiss){
    event.preventDefault();
    event.stopPropagation();
    dismissCorrespondenceRuleSuggestion(Number(correspondenceSuggestionDismiss.dataset.correspondenceSuggestionDismiss));
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
      if(commitmentStatus) commitmentStatus.textContent = 'VAL needs the originating email, calendar event, transcript, or task source before this commitment action can create or change anything. Receipt is shown above; no external action happened.';
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
  const watchToggle = event.target.closest('[data-relationship-toggle-watch]');
  if(watchToggle){
    event.preventDefault();
    event.stopPropagation();
    relationshipPeopleToWatchExpanded = !relationshipPeopleToWatchExpanded;
    renderRelationshipRolodex();
    return;
  }
  const suggestedDraft = event.target.closest('[data-stewardship-draft-pair]');
  if(suggestedDraft){
    event.preventDefault();
    event.stopPropagation();
    const card = suggestedDraft.closest('[data-stewardship-a][data-stewardship-b]');
    const a = stewardshipPersonById(card?.dataset.stewardshipA || '');
    const b = stewardshipPersonById(card?.dataset.stewardshipB || '');
    openStewardshipDraftReview(a, b, stewardshipIntroFit(a, b));
    return;
  }
  const manualDraft = event.target.closest('[data-stewardship-review-manual]');
  if(manualDraft){
    event.preventDefault();
    event.stopPropagation();
    const a = stewardshipPersonById(stewardshipPersonAId);
    const b = stewardshipPersonById(stewardshipPersonBId);
    openStewardshipDraftReview(a, b, stewardshipIntroFit(a, b));
    return;
  }
  const createWith = event.target.closest('[data-stewardship-create-with]');
  if(createWith){
    event.preventDefault();
    event.stopPropagation();
    stewardshipPersonAId = stewardshipSelectedNetworkId;
    stewardshipPersonBId = createWith.dataset.stewardshipCreateWith || '';
    setStewardshipView('create');
    return;
  }
  const whoShouldMeet = event.target.closest('[data-stewardship-who-should-meet]');
  if(whoShouldMeet){
    event.preventDefault();
    event.stopPropagation();
    stewardshipSelectedNetworkId = whoShouldMeet.dataset.stewardshipWhoShouldMeet || stewardshipSelectedNetworkId;
    renderStewardshipNetworkDetail(stewardshipPersonById(stewardshipSelectedNetworkId));
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
    event.preventDefault();
    event.stopPropagation();
    const profileId = relationshipProfileButton.dataset.relationshipOpenProfile;
    stewardshipSelectedNetworkId = profileId;
    renderStewardshipNetworkList();
    return;
  }
  const projectDocumentAction = event.target.closest('[data-project-document-action]');
  if(projectDocumentAction){
    event.preventDefault();
    event.stopPropagation();
    await decideProjectDocumentAssignment(projectDocumentAction.dataset.projectDocumentId, projectDocumentAction.dataset.projectDocumentAction, projectDocumentAction);
    return;
  }
  const projectSuggestionAction = event.target.closest('[data-project-suggestion-action]');
  if(projectSuggestionAction){
    event.preventDefault();
    event.stopPropagation();
    await decideProjectSuggestion(projectSuggestionAction.dataset.projectSuggestionReview, projectSuggestionAction.dataset.projectSuggestionAction, projectSuggestionAction);
    return;
  }
  const projectProfileButton = event.target.closest('[data-project-open-profile]');
  if(projectProfileButton){
    event.preventDefault();
    event.stopPropagation();
    await openProjectProfileFromDrawer(projectProfileButton.dataset.projectOpenProfile, projectProfileButton);
    return;
  }
  const projectRelationshipChoice = event.target.closest('[data-project-relationship-choice]');
  if(projectRelationshipChoice){
    event.preventDefault();
    event.stopPropagation();
    appendProjectRelationshipNames([projectRelationshipChoice.dataset.projectRelationshipChoice]);
    renderProjectManagerProfile(activeProjectProfile);
    renderProjectRolodex();
    await openProjectFieldCowork('people_involved', projectRelationshipChoice);
    return;
  }
  const projectOwnerChoice = event.target.closest('[data-project-owner-choice]');
  if(projectOwnerChoice){
    event.preventDefault();
    event.stopPropagation();
    await assignProjectOwnerById(projectOwnerChoice.dataset.projectOwnerChoice, projectOwnerChoice);
    return;
  }
  const projectOwnerSummary = event.target.closest('.project-owner-create summary');
  if(projectOwnerSummary){
    event.stopPropagation();
    return;
  }
  const projectOwnerInteractive = event.target.closest('.project-owner-control input, .project-owner-control button');
  if(projectOwnerInteractive){
    event.stopPropagation();
    return;
  }
  const projectRelationshipCreate = event.target.closest('[data-project-relationship-create]');
  if(projectRelationshipCreate){
    event.preventDefault();
    event.stopPropagation();
    activeProjectCoworkTarget = {field:'people_involved', mode:'field_update', projectId:activeProjectProfile?.id || '', title:'Create a relationship for this project'};
    openContextualCoworkSession({
      returnTarget:'project',
      title:'Create a relationship for this project',
      meaning:'Who should VAL add to this project?',
      context:['Project: ' + (activeProjectProfile?.name || 'Project')],
      recommendation:"Give VAL the person's name, company, role in the project, and anything important to remember.",
      placeholder:'Name, company, role, and what VAL should remember.',
      publicDetail:'Scoped to Project Managers: People involved.',
      lockContext:true
    });
    return;
  }
  const projectCoworkScope = event.target.closest('[data-project-cowork-scope]');
  if(projectCoworkScope){
    event.preventDefault();
    event.stopPropagation();
    await openProjectScopedCowork(projectCoworkScope.dataset.projectCoworkScope, projectCoworkScope, {mode:'project_cowork'});
    return;
  }
  const projectEditOpen = event.target.closest('[data-project-edit-open]');
  if(projectEditOpen){
    event.preventDefault();
    event.stopPropagation();
    projectEditComposerOpen = true;
    projectPinComposerOpen = false;
    renderProjectManagerProfile(activeProjectProfile);
    return;
  }
  const projectEditCancel = event.target.closest('[data-project-edit-cancel]');
  if(projectEditCancel){
    event.preventDefault();
    event.stopPropagation();
    projectEditComposerOpen = false;
    renderProjectManagerProfile(activeProjectProfile);
    return;
  }
  const projectPinOpen = event.target.closest('[data-project-pin-open]');
  if(projectPinOpen){
    event.preventDefault();
    event.stopPropagation();
    projectEditComposerOpen = false;
    projectPinComposerOpen = true;
    renderProjectManagerProfile(activeProjectProfile);
    return;
  }
  const projectPinCancel = event.target.closest('[data-project-pin-cancel]');
  if(projectPinCancel){
    event.preventDefault();
    event.stopPropagation();
    projectPinComposerOpen = false;
    renderProjectManagerProfile(activeProjectProfile);
    return;
  }
  const projectCoworkCard = event.target.closest('[data-project-cowork-field]');
  if(projectCoworkCard){
    event.preventDefault();
    event.stopPropagation();
    await openProjectFieldCowork(projectCoworkCard.dataset.projectCoworkField, projectCoworkCard);
    return;
  }
  if(await handleRelationshipDetailClickEvent(event)){
    return;
  }
  const projectAction = event.target.closest('[data-project-action]');
  if(projectAction){
    event.preventDefault();
    event.stopPropagation();
    await handleProjectActionClick(projectAction.dataset.projectAction, projectAction);
    return;
  }
  const roomButton = event.target.closest('[data-open-room]');
  if(!roomButton || roomButton.classList.contains('room-action')) return;
  closeDrawer();
  openWorkspace(roomButton.dataset.openRoom);
});

document.addEventListener('click', async (event) => {
  await handleRelationshipDetailClickEvent(event);
});

document.addEventListener('click', (event) => {
  const launchTarget = event.target.closest([
    '[data-open-room]',
    '.cowork-notebook',
    '.next-meeting-card',
    '.agenda-item',
    '.calendar-tab',
    '.drawer-pull',
    '.drawer-link',
    '.living-room',
    '.observer-board-button',
    '.teach-pen',
    '.linkedin-widget',
    '.lean-button'
  ].join(','));
  if(launchTarget) return;
  if(hearth.classList.contains('calendar-open') && !event.target.closest('.full-calendar-panel')){
    closeCalendarPanel();
  }
  if(hearth.dataset.distance === 'judgment' && !event.target.closest('.desk-workspace')){
    closeWorkspace();
  }
  if(retrievalSystem?.classList.contains('open') && !event.target.closest('.retrieval-system')){
    closeDrawer();
  }
  if(hearth.classList.contains('evidence-open') && !event.target.closest('.hearth-evidence')){
    evidence.classList.remove('open');
    hearth.classList.remove('evidence-open');
    leanButton?.setAttribute('aria-expanded', 'false');
  }
});

drawerTray.addEventListener('keydown', async (event) => {
  if(event.key !== 'Enter') return;
  const transcriptInput = event.target.closest('[data-transcript-chat-input]');
  if(!transcriptInput || !currentTimelineTranscript?.id) return;
  event.preventDefault();
  await timelineTranscriptAsk(currentTimelineTranscript.id);
});

closeSourceDetail.addEventListener('click', () => {
  drawerTray.classList.remove('source-open');
  sourceDrawerLink.setAttribute('aria-expanded', 'false');
  document.querySelector('#source-detail').setAttribute('aria-hidden', 'true');
});

nextMeetingCard.addEventListener('click', () => openMeetingPrepWithPacket(nextMeetingCard, 0));
agendaItems.forEach((item) => {
  item.addEventListener('click', () => {
    const eventRecord = currentCalendarEvents[Number(item.dataset.calendarEventIndex || 0)] || {};
    if(calendarEventIsPast(eventRecord)) openCalendarTranscriptFromEvent(eventRecord, item);
    else if(calendarEventIsFutureMeeting(eventRecord)) openMeetingPrepWithPacket(item, Number(item.dataset.calendarEventIndex || 0));
  });
});
observerBoardButton?.addEventListener('click', openObserverBoard);
coworkNotebook.addEventListener('click', () => openCoworkSessionWithPacket(coworkNotebook));
teachPen.addEventListener('click', () => openTeachValSessionWithPacket(teachPen));
linkedinWidget?.addEventListener('click', () => openLinkedInEngagementWorkspaceWithPacket(linkedinWidget));
workspaceInputPanel.addEventListener('submit', async (event) => {
  if(!event.target.matches('[data-home-cowork-form]')) return;
  event.preventDefault();
  if(workspaceReturnTarget === 'project' && activeProjectCoworkTarget?.field && activeProjectCoworkTarget.mode !== 'project_cowork'){
    const input = workspaceInputValue('cowork');
    if(!projectCleanText(input)) return;
    const rewritten = applyProjectFieldUpdate(activeProjectCoworkTarget.field, input);
    renderProjectCoworkUpdatedResponse(rewritten, activeProjectCoworkTarget.field);
    await persistProjectCoworkFieldUpdate(activeProjectCoworkTarget.field, rewritten);
    const textarea = event.target.querySelector('[data-workspace-input="cowork"]');
    if(textarea){
      textarea.value = '';
      textarea.placeholder = projectFollowupQuestion(activeProjectCoworkTarget.field);
    }
    return;
  }
  runCowork('think');
});
workspaceInputPanel.addEventListener('input', (event) => {
  if(!event.target.matches('[data-home-cowork-form] [data-workspace-input="cowork"]')) return;
  orientHomeCoworkFromInput();
});
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
    const eventIndex = Number(agendaButton.dataset.calendarEventIndex || 0);
    const eventRecord = currentCalendarEvents[eventIndex] || {};
    if(calendarEventIsPast(eventRecord)){
      openCalendarTranscriptFromEvent(eventRecord, agendaButton);
    }else if(calendarEventIsFutureMeeting(eventRecord)){
      openMeetingPrepWithPacket(agendaButton, eventIndex);
    }
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
    const preflight = await ensureHearthClickPacket({node:button, packetName:'lead_intelligence_packet', action:'lead_intelligence:run:' + type, allowBlockedForInspection:true, source:{sourceId:type, sourceType:'lead_intelligence_workflow', sourceLabel:button.innerText || type, sourceItem:{id:type, title:button.innerText || type}}});
    if(!preflight.ok) return;
    renderDrawerPacketReceiptStrip(preflight.packet || lastHearthPacketReceipt);
    await runScraperPreview(type);
  });
});

document.addEventListener('click', async (event) => {
  const leadActionButton = event.target.closest('[data-lead-drawer-action]');
  if(!leadActionButton) return;
  event.preventDefault();
  event.stopPropagation();
  await handleLeadDrawerAction(leadActionButton.dataset.leadDrawerAction, leadActionButton.dataset.leadDrawerType, leadActionButton);
});

leadSourcingEmptyBoard();

async function routeWorkspaceActionClick(event){
  const homeActionButton = event.target.closest('[data-home-action]');
  if(homeActionButton){
    event.preventDefault();
    event.stopPropagation();
    await handleHomeRoomAction(homeActionButton.dataset.homeAction, homeActionButton);
    return true;
  }
  const projectActionButton = event.target.closest('[data-project-action]');
  if(projectActionButton){
    event.preventDefault();
    event.stopPropagation();
    await handleProjectActionClick(projectActionButton.dataset.projectAction, projectActionButton);
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
document.addEventListener('click', async (event) => {
  const projectActionButton = event.target.closest('#desk-workspace .workspace-actions [data-project-action]');
  if(!projectActionButton) return;
  event.preventDefault();
  event.stopPropagation();
  await handleProjectActionClick(projectActionButton.dataset.projectAction, projectActionButton);
}, true);
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

async function handleScraperPreviewClick(event){
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
  const preflight = await ensureHearthClickPacket({node:choice, packetName:'lead_intelligence_packet', action:'lead_intelligence:preview_choice:' + nextStatus, allowBlockedForInspection:true, source:activeLeadIntelligenceSource('lead_intelligence:preview_choice:' + nextStatus, {sourceId:selectedLead?.id || String(index), sourceType:'lead_preview_row', sourceLabel:selectedLead?.name || selectedLead?.company || 'Lead preview row', sourceItem:selectedLead})});
  if(!preflight.ok) return;
  renderHearthPacketReceiptStrip(preflight.packet || lastHearthPacketReceipt);
  renderDrawerPacketReceiptStrip(preflight.packet || lastHearthPacketReceipt);
  lead.dataset.leadReview = nextStatus;
  lead.querySelectorAll('[data-preview-choice]').forEach((button) => {
    button.classList.toggle('active', button === choice);
  });
  if(activeSession && activeSession.previewLeads[index]){
    activeSession.previewLeads[index]._approved = nextStatus !== 'held';
  }
  updatePreviewApprovalSummary();
}

Array.from(new Set([scraperPreviewList, leadDrawerPreviewList].filter(Boolean))).forEach((previewList) => {
  previewList.addEventListener('click', handleScraperPreviewClick);
});

document.addEventListener('keydown', (event) => {
  if(event.key !== 'Escape') return;
  if(correspondenceRulesPanel && !correspondenceRulesPanel.hidden){
    setCorrespondenceRulesPanel(false);
  }
});

document.addEventListener('keydown', async (event) => {
  if(event.key !== 'Enter' && event.key !== ' ') return;
  if(event.target.closest('button,a,input,select,textarea')) return;
  return;
});

document.querySelectorAll('#correspondence-detail [data-correspondence-action]').forEach((button) => {
  button.addEventListener('click', (event) => {
    runCorrespondenceActionClick(button, event);
  });
});

correspondenceDraftBody?.addEventListener('input', () => {
  if(!activeCorrespondenceItem) return;
  activeCorrespondenceItem.draftBody = correspondenceDraftBody.value;
});

switches.forEach((button) => {
  button.addEventListener('click', () => setState(button.dataset.stateOption));
});

roomButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if(button.closest('#drawer-tray')) return;
    if(hearth.classList.contains('drawer-open')) return;
    handlePrimaryAction(button);
  });
});

rooms.forEach((room) => {
  room.addEventListener('click', async (event) => {
    if(hearth.classList.contains('drawer-open')) return;
    if(event.target.closest('button')) return;
    const actionButton = room.querySelector('.room-action');
    if(actionButton){
      event.preventDefault();
      event.stopPropagation();
      handlePrimaryAction(actionButton);
    }
  });

  room.addEventListener('keydown', (event) => {
    if(hearth.classList.contains('drawer-open')) return;
    if(event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    const actionButton = room.querySelector('.room-action');
    if(actionButton) handlePrimaryAction(actionButton);
  });
});

returnButton.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  closeWorkspace();
});

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
