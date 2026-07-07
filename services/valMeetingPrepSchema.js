const VAL_MEETING_PREP_SQL = `
create table if not exists meeting_prep_briefs (
  id text primary key,
  tenant_id text not null default 'default',
  user_id text not null default 'default',
  calendar_event_id text not null,
  event_source text not null default 'unknown',
  status text not null default 'ready_for_review',
  quality_gate_json jsonb not null default '{}',
  meeting_context_json jsonb not null default '{}',
  attendee_intelligence_json jsonb not null default '[]',
  internal_context_json jsonb not null default '{}',
  meeting_stakes_json jsonb not null default '{}',
  user_role text not null default 'unknown',
  first_five_minutes_json jsonb not null default '{}',
  brief_json jsonb not null default '{}',
  suggested_questions_json jsonb not null default '[]',
  follow_up_preparation_json jsonb not null default '{}',
  ready_for_you_handoff_json jsonb not null default '{}',
  post_meeting_capture_prompt text,
  post_meeting_capture_json jsonb not null default '{}',
  source_refs_json jsonb not null default '[]',
  unknowns_json jsonb not null default '[]',
  confidence numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists attendee_intelligence (
  id text primary key,
  tenant_id text not null default 'default',
  user_id text not null default 'default',
  meeting_prep_brief_id text references meeting_prep_briefs(id) on delete cascade,
  calendar_event_id text not null,
  attendee_key text not null,
  name text,
  email text,
  crm_contact_id text,
  match_status text not null default 'unknown',
  source_confidence_label text not null default 'unknown',
  intelligence_json jsonb not null default '{}',
  source_refs_json jsonb not null default '[]',
  unknowns_json jsonb not null default '[]',
  confidence numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists external_research_results (
  id text primary key,
  tenant_id text not null default 'default',
  user_id text not null default 'default',
  subject_type text not null default 'attendee',
  subject_key text not null,
  provider text not null default 'planned',
  status text not null default 'planned',
  plan_json jsonb not null default '{}',
  result_json jsonb not null default '{}',
  source_confidence_label text not null default 'unknown',
  source_refs_json jsonb not null default '[]',
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists meeting_prep_briefs_lookup_idx on meeting_prep_briefs(tenant_id,user_id,calendar_event_id,created_at desc);
create index if not exists attendee_intelligence_lookup_idx on attendee_intelligence(tenant_id,user_id,calendar_event_id,created_at desc);
create index if not exists external_research_results_lookup_idx on external_research_results(tenant_id,user_id,subject_type,subject_key,created_at desc);
`;

async function ensureValMeetingPrepTables({dbQuery,logger=console}={}){
  if(typeof dbQuery!=='function')return;
  await dbQuery(VAL_MEETING_PREP_SQL);
  logger.log?.('VAL Meeting Prep tables ready');
}

module.exports={VAL_MEETING_PREP_SQL,ensureValMeetingPrepTables};
