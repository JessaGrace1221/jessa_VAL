const VAL_CANONICAL_WORK_SQL = `
create table if not exists val_work_items (
  id text primary key,
  tenant_id text not null default 'default',
  user_id text not null default 'default',
  source_processing_record_id text references source_processing_records(id) on delete set null,
  source_type text not null,
  source_id text not null,
  source_fingerprint text not null,
  work_fingerprint text not null,
  work_type text not null default 'commitment',
  ownership text not null default 'unknown',
  owner_id text,
  owner_name text,
  action_text text not null,
  object_text text not null,
  outcome_text text,
  title text not null,
  summary text,
  exact_source_quote text,
  source_refs_json jsonb not null default '[]',
  envelope_json jsonb not null default '{}',
  project_id text,
  project_name text,
  relationship_id text,
  relationship_name text,
  admission_status text not null,
  lifecycle_status text not null default 'open',
  due_at timestamptz,
  due_basis_json jsonb not null default '{}',
  confidence numeric,
  board_packet_id text,
  observer_receipts_json jsonb not null default '[]',
  round_table_run_id text,
  chief_recommendation_id text,
  chief_rank integer,
  prepared_artifact_ids_json jsonb not null default '[]',
  metadata_json jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists val_work_item_events (
  id text primary key,
  tenant_id text not null default 'default',
  user_id text not null default 'default',
  work_item_id text not null references val_work_items(id) on delete cascade,
  event_type text not null,
  previous_status text,
  new_status text,
  source_refs_json jsonb not null default '[]',
  payload_json jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create unique index if not exists val_work_items_fingerprint_idx
  on val_work_items(tenant_id,user_id,work_fingerprint);
create index if not exists val_work_items_status_idx
  on val_work_items(tenant_id,user_id,admission_status,lifecycle_status,updated_at desc);
create index if not exists val_work_items_source_idx
  on val_work_items(tenant_id,user_id,source_type,source_id);
create index if not exists val_work_item_events_item_idx
  on val_work_item_events(tenant_id,user_id,work_item_id,created_at asc);
`;

async function ensureValCanonicalWorkTables({dbQuery,logger=console}={}){
  if(typeof dbQuery!=='function')return;
  await dbQuery(VAL_CANONICAL_WORK_SQL);
  logger.log?.('VAL canonical work tables ready');
}

module.exports={VAL_CANONICAL_WORK_SQL,ensureValCanonicalWorkTables};
