const VAL_INTELLIGENCE_SPINE_SQL = `
create table if not exists event_intelligence_runs (
  id text primary key,
  tenant_id text not null default 'default',
  user_id text not null default 'default',
  event_type text not null default 'manual',
  event_source_type text,
  event_source_id text,
  status text not null default 'running',
  context_packet_json jsonb not null default '{}',
  unknowns_json jsonb not null default '[]',
  source_refs_json jsonb not null default '[]',
  result_json jsonb not null default '{}',
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists val_board_briefing_runs (
  id text primary key,
  tenant_id text not null default 'default',
  user_id text not null default 'default',
  local_date date not null,
  briefing_slot text not null,
  timezone text not null,
  status text not null default 'running',
  packet_ids_json jsonb not null default '[]',
  event_run_id text,
  error_message text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (tenant_id,user_id,local_date,briefing_slot)
);

create table if not exists observer_runs (
  id text primary key,
  tenant_id text not null default 'default',
  user_id text not null default 'default',
  event_run_id text references event_intelligence_runs(id) on delete set null,
  observer_name text not null,
  prompt_key text not null,
  prompt_source text,
  status text not null default 'completed',
  context_packet_json jsonb not null default '{}',
  output_json jsonb not null default '{}',
  confidence numeric not null default 0,
  conviction numeric not null default 0,
  unknowns_json jsonb not null default '[]',
  evidence_refs_json jsonb not null default '[]',
  closing_statement text,
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists round_table_runs (
  id text primary key,
  tenant_id text not null default 'default',
  user_id text not null default 'default',
  event_run_id text references event_intelligence_runs(id) on delete set null,
  observer_run_ids jsonb not null default '[]',
  agreements_json jsonb not null default '[]',
  conflicts_json jsonb not null default '[]',
  candidate_tensions_json jsonb not null default '[]',
  opposing_views_json jsonb not null default '[]',
  uncertainty_json jsonb not null default '[]',
  output_json jsonb not null default '{}',
  source_refs_json jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table if not exists chief_of_staff_recommendations (
  id text primary key,
  tenant_id text not null default 'default',
  user_id text not null default 'default',
  event_run_id text references event_intelligence_runs(id) on delete set null,
  round_table_run_id text references round_table_runs(id) on delete set null,
  status text not null default 'active',
  title text not null,
  recommendation text not null,
  why text,
  confidence numeric not null default 0,
  opposing_view text,
  anxiety_vs_momentum_json jsonb not null default '{}',
  next_candidates_json jsonb not null default '[]',
  observer_run_ids jsonb not null default '[]',
  source_refs_json jsonb not null default '[]',
  user_feedback_json jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists momentum_snapshots (
  id text primary key,
  tenant_id text not null default 'default',
  user_id text not null default 'default',
  event_run_id text references event_intelligence_runs(id) on delete set null,
  summary text,
  direction text not null default 'unknown',
  velocity_json jsonb not null default '{}',
  dimensions_json jsonb not null default '{}',
  invisible_momentum_json jsonb not null default '{}',
  meaning_json jsonb not null default '{}',
  source_refs_json jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table if not exists ready_for_you_items (
  id text primary key,
  tenant_id text not null default 'default',
  user_id text not null default 'default',
  event_run_id text references event_intelligence_runs(id) on delete set null,
  category text not null default 'prepared_work',
  status text not null default 'ready',
  title text not null,
  item_type text not null default 'prepared_work',
  summary text,
  why_user_is_seeing_this text,
  why_now text,
  readiness_json jsonb not null default '{}',
  what_val_prepared text,
  what_user_needs_to_do text,
  what_val_did text,
  what_only_user_can_do text,
  estimated_review_minutes integer not null default 2,
  source_refs_json jsonb not null default '[]',
  confidence numeric not null default 0,
  requires_approval boolean not null default true,
  approval_policy text not null default 'approval_required',
  representation_risk text not null default 'medium',
  actions_json jsonb not null default '[]',
  metadata_json jsonb not null default '{}',
  decision_json jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  reviewed_at timestamptz,
  snoozed_until timestamptz
);

alter table ready_for_you_items add column if not exists category text not null default 'prepared_work';
alter table ready_for_you_items add column if not exists summary text;
alter table ready_for_you_items add column if not exists why_user_is_seeing_this text;
alter table ready_for_you_items add column if not exists why_now text;
alter table ready_for_you_items add column if not exists what_val_did text;
alter table ready_for_you_items add column if not exists what_only_user_can_do text;
alter table ready_for_you_items add column if not exists estimated_review_minutes integer not null default 2;
alter table ready_for_you_items add column if not exists confidence numeric not null default 0;
alter table ready_for_you_items add column if not exists requires_approval boolean not null default true;
alter table ready_for_you_items add column if not exists approval_policy text not null default 'approval_required';
alter table ready_for_you_items add column if not exists representation_risk text not null default 'medium';
alter table ready_for_you_items add column if not exists actions_json jsonb not null default '[]';
alter table ready_for_you_items add column if not exists decision_json jsonb not null default '{}';
alter table ready_for_you_items add column if not exists reviewed_at timestamptz;
alter table ready_for_you_items add column if not exists snoozed_until timestamptz;

create index if not exists event_intelligence_runs_lookup_idx on event_intelligence_runs(tenant_id,user_id,created_at desc);
create index if not exists observer_runs_lookup_idx on observer_runs(tenant_id,user_id,observer_name,created_at desc);
create index if not exists observer_runs_event_idx on observer_runs(tenant_id,user_id,event_run_id,created_at desc);
create index if not exists val_board_briefing_runs_lookup_idx on val_board_briefing_runs(tenant_id,user_id,local_date desc,briefing_slot);
create index if not exists round_table_runs_lookup_idx on round_table_runs(tenant_id,user_id,created_at desc);
create index if not exists chief_recommendations_lookup_idx on chief_of_staff_recommendations(tenant_id,user_id,status,created_at desc);
create index if not exists momentum_snapshots_lookup_idx on momentum_snapshots(tenant_id,user_id,created_at desc);
create index if not exists ready_for_you_items_lookup_idx on ready_for_you_items(tenant_id,user_id,status,created_at desc);
`;

async function ensureValIntelligenceSpineTables({dbQuery,logger=console}={}){
  if(typeof dbQuery!=='function') return;
  await dbQuery(VAL_INTELLIGENCE_SPINE_SQL);
  logger.log?.('VAL Intelligence Spine tables ready');
}

module.exports = {VAL_INTELLIGENCE_SPINE_SQL,ensureValIntelligenceSpineTables};
