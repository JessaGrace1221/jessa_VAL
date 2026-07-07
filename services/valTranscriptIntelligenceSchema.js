const VAL_TRANSCRIPT_INTELLIGENCE_SQL = `
create table if not exists transcript_intelligence_runs (
  id text primary key,
  tenant_id text not null default 'default',
  user_id text not null default 'default',
  transcript_id text not null,
  status text not null default 'completed',
  quality_gate_json jsonb not null default '{}',
  linkage_json jsonb not null default '{}',
  evidence_refs_json jsonb not null default '[]',
  commitments_json jsonb not null default '[]',
  contextual_tasks_json jsonb not null default '[]',
  relationship_signals_json jsonb not null default '[]',
  project_signals_json jsonb not null default '[]',
  capacity_and_tone_context_json jsonb not null default '{}',
  courage_signals_json jsonb not null default '[]',
  teach_val_candidates_json jsonb not null default '[]',
  ready_for_you_candidates_json jsonb not null default '[]',
  executive_instructions_json jsonb not null default '[]',
  chief_of_staff_signals_json jsonb not null default '[]',
  momentum_signals_json jsonb not null default '[]',
  approval_policies_json jsonb not null default '[]',
  unknowns_json jsonb not null default '[]',
  no_action_needed_json jsonb not null default '{}',
  final_json jsonb not null default '{}',
  confidence numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists transcript_intelligence_items (
  id text primary key,
  tenant_id text not null default 'default',
  user_id text not null default 'default',
  run_id text references transcript_intelligence_runs(id) on delete cascade,
  transcript_id text not null,
  category text not null,
  item_type text not null,
  title text not null,
  summary text,
  source_quote text,
  source_refs_json jsonb not null default '[]',
  link_targets_json jsonb not null default '[]',
  approval_policy text not null default 'approval_required',
  requires_approval boolean not null default true,
  confidence numeric not null default 0,
  status text not null default 'candidate',
  metadata_json jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists transcript_intelligence_runs_lookup_idx on transcript_intelligence_runs(tenant_id,user_id,transcript_id,created_at desc);
create index if not exists transcript_intelligence_items_lookup_idx on transcript_intelligence_items(tenant_id,user_id,transcript_id,category,created_at desc);
`;

async function ensureValTranscriptIntelligenceTables({dbQuery,logger=console}={}){
  if(typeof dbQuery!=='function')return;
  await dbQuery(VAL_TRANSCRIPT_INTELLIGENCE_SQL);
  await dbQuery("alter table transcript_intelligence_runs add column if not exists executive_instructions_json jsonb not null default '[]'");
  logger.log?.('VAL Transcript Intelligence tables ready');
}

module.exports={VAL_TRANSCRIPT_INTELLIGENCE_SQL,ensureValTranscriptIntelligenceTables};
