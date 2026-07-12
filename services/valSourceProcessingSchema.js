const VAL_SOURCE_PROCESSING_SQL = `
create table if not exists source_processing_records (
  id text primary key,
  tenant_id text not null default 'default',
  user_id text not null default 'default',
  source_type text not null,
  source_id text not null,
  source_title text,
  status text not null default 'processed',
  source_receipt_json jsonb not null default '{}',
  witness_observations_json jsonb not null default '[]',
  executive_relevance_json jsonb not null default '{}',
  domain_routes_json jsonb not null default '[]',
  packet_updates_json jsonb not null default '[]',
  review_updates_json jsonb not null default '[]',
  prepared_work_candidates_json jsonb not null default '[]',
  no_action_receipt_json jsonb not null default '{}',
  unknowns_json jsonb not null default '[]',
  metadata_json jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists prepared_artifact_records (
  id text primary key,
  tenant_id text not null default 'default',
  user_id text not null default 'default',
  source_processing_record_id text references source_processing_records(id) on delete set null,
  artifact_type text not null,
  status text not null default 'generated',
  title text not null,
  summary text,
  payload_json jsonb not null default '{}',
  source_refs_json jsonb not null default '[]',
  review_update_id text,
  metadata_json jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists surface_registrations (
  id text primary key,
  tenant_id text not null default 'default',
  user_id text not null default 'default',
  source_processing_record_id text references source_processing_records(id) on delete set null,
  prepared_artifact_record_id text references prepared_artifact_records(id) on delete set null,
  review_update_id text,
  ready_for_you_item_id text,
  surface text not null,
  surface_target_type text not null,
  surface_target_id text not null,
  title text not null,
  summary text,
  status text not null default 'visible',
  action_json jsonb not null default '{}',
  source_refs_json jsonb not null default '[]',
  metadata_json jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists source_processing_records_lookup_idx on source_processing_records(tenant_id,user_id,source_type,source_id,created_at desc);
create index if not exists prepared_artifact_records_lookup_idx on prepared_artifact_records(tenant_id,user_id,artifact_type,status,created_at desc);
create index if not exists surface_registrations_lookup_idx on surface_registrations(tenant_id,user_id,surface,status,created_at desc);
create index if not exists surface_registrations_target_idx on surface_registrations(tenant_id,user_id,surface_target_type,surface_target_id,status);
`;

async function ensureValSourceProcessingTables({dbQuery,logger=console}={}){
  if(typeof dbQuery!=='function')return;
  await dbQuery(VAL_SOURCE_PROCESSING_SQL);
  logger.log?.('VAL Source Processing tables ready');
}

module.exports={VAL_SOURCE_PROCESSING_SQL,ensureValSourceProcessingTables};
