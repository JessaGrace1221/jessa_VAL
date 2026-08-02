const VAL_ENVIRONMENTS_SQL = `
create table if not exists val_environments (
  id text primary key,
  tenant_id text not null default 'default',
  user_id text not null default 'default',
  name text not null,
  status text not null default 'draft',
  active_version_id text,
  draft_version_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists val_environment_versions (
  id text primary key,
  environment_id text not null,
  tenant_id text not null default 'default',
  user_id text not null default 'default',
  version_number integer not null default 1,
  state text not null default 'draft',
  spec_json jsonb not null default '{}',
  human_contract_json jsonb not null default '{}',
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);

create table if not exists val_environment_runs (
  id text primary key,
  environment_id text not null,
  tenant_id text not null default 'default',
  user_id text not null default 'default',
  version_number integer not null,
  version_snapshot_json jsonb not null default '{}',
  trigger_type text not null,
  source_type text,
  source_id text,
  source_hash text,
  status text not null default 'queued',
  test_mode boolean not null default false,
  input_json jsonb not null default '{}',
  receipts_json jsonb not null default '[]',
  outputs_json jsonb not null default '{}',
  error_message text,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists val_environment_packets (
  id text primary key,
  tenant_id text not null default 'default',
  user_id text not null default 'default',
  source_environment_id text not null,
  source_run_id text not null,
  source_type text,
  source_id text,
  packet_type text not null default 'environment_result_packet_v1',
  title text not null,
  summary text not null,
  topics_json jsonb not null default '[]',
  evidence_refs_json jsonb not null default '[]',
  observer_receipts_json jsonb not null default '[]',
  chief_advisory_json jsonb not null default '{}',
  output_summary_json jsonb not null default '{}',
  lineage_json jsonb not null default '{}',
  status text not null default 'published',
  created_at timestamptz not null default now()
);

create table if not exists val_environment_packet_deliveries (
  id text primary key,
  tenant_id text not null default 'default',
  user_id text not null default 'default',
  packet_id text not null,
  target_environment_id text not null,
  status text not null default 'received',
  reason text,
  attached_run_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists val_environment_versions_number_idx
  on val_environment_versions(tenant_id,user_id,environment_id,version_number);
create index if not exists val_environments_scope_idx
  on val_environments(tenant_id,user_id,status,updated_at desc);
create index if not exists val_environment_runs_scope_idx
  on val_environment_runs(tenant_id,user_id,environment_id,started_at desc);
create unique index if not exists val_environment_run_idempotency_idx
  on val_environment_runs(tenant_id,user_id,environment_id,source_hash)
  where source_hash is not null and test_mode=false;
create unique index if not exists val_environment_packet_source_run_idx
  on val_environment_packets(tenant_id,user_id,source_run_id);
create index if not exists val_environment_packets_scope_idx
  on val_environment_packets(tenant_id,user_id,created_at desc);
create unique index if not exists val_environment_packet_delivery_idx
  on val_environment_packet_deliveries(tenant_id,user_id,packet_id,target_environment_id);
create index if not exists val_environment_packet_target_idx
  on val_environment_packet_deliveries(tenant_id,user_id,target_environment_id,updated_at desc);
`;

async function ensureValEnvironmentTables({dbQuery,logger=console}={}){
  if(typeof dbQuery!=='function')return;
  await dbQuery(VAL_ENVIRONMENTS_SQL);
  logger.log?.('VAL Environments tables ready');
}

module.exports={VAL_ENVIRONMENTS_SQL,ensureValEnvironmentTables};
