const VAL_EXTERNAL_ACTIONS_SQL = `
create table if not exists val_external_action_packets (
  id text primary key,
  tenant_id text not null default 'default',
  user_id text not null default 'default',
  status text not null default 'draft',
  action_type text not null,
  target_system text not null default 'none',
  target_id text,
  payload_preview_json jsonb not null default '{}',
  source_refs_json jsonb not null default '[]',
  why_this_action_exists text,
  what_will_happen text,
  what_will_not_happen text,
  risk_level text not null default 'medium',
  approval_policy text not null default 'approval_required',
  representation_risk text not null default 'medium',
  financial_or_legal_risk text not null default 'low',
  relationship_risk text not null default 'medium',
  authorization_source text,
  authorization_event_id text,
  authorization_quote text,
  authenticated_user_confirmed boolean not null default false,
  speaker_confidence numeric not null default 0,
  authorization_created_at timestamptz,
  attempted_at timestamptz,
  executed_at timestamptz,
  provider_response_id text,
  provider_response_summary text,
  failure_reason text,
  retry_count integer not null default 0,
  idempotency_key text,
  executed_by text,
  expires_at timestamptz,
  source_context_json jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table if not exists val_external_action_audit (
  id text primary key,
  tenant_id text not null default 'default',
  user_id text not null default 'default',
  packet_id text references val_external_action_packets(id) on delete set null,
  action text not null,
  before_json jsonb not null default '{}',
  after_json jsonb not null default '{}',
  note text,
  authorization_source text,
  authorization_event_id text,
  attempted_at timestamptz,
  executed_at timestamptz,
  provider_response_id text,
  provider_response_summary text,
  failure_reason text,
  retry_count integer not null default 0,
  idempotency_key text,
  executed_by text,
  external_action_taken boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists val_execution_receipts (
  id text primary key,
  tenant_id text not null default 'default',
  user_id text not null default 'default',
  packet_id text references val_external_action_packets(id) on delete set null,
  action_type text not null,
  target_system text not null,
  provider_response_id text,
  provider_object_url text,
  provider_response_summary text,
  executed_at timestamptz,
  executed_by text,
  status text not null default 'unknown',
  failure_reason text,
  retry_allowed boolean not null default false,
  source_refs_json jsonb not null default '[]',
  audit_refs_json jsonb not null default '[]',
  reconciliation_status text not null default 'pending',
  reconciliation_summary text,
  provider_payload_json jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists val_execution_reconciliation_events (
  id text primary key,
  tenant_id text not null default 'default',
  user_id text not null default 'default',
  receipt_id text references val_execution_receipts(id) on delete cascade,
  packet_id text,
  target_table text not null,
  target_id text,
  reconciliation_type text not null,
  status text not null default 'pending',
  summary text,
  before_json jsonb not null default '{}',
  after_json jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists val_external_action_packets_lookup_idx on val_external_action_packets(tenant_id,user_id,status,created_at desc);
create index if not exists val_external_action_packets_type_idx on val_external_action_packets(tenant_id,user_id,action_type,target_system,status);
create unique index if not exists val_external_action_packets_idempotency_idx on val_external_action_packets(tenant_id,user_id,idempotency_key) where idempotency_key is not null;
create index if not exists val_external_action_audit_lookup_idx on val_external_action_audit(tenant_id,user_id,packet_id,created_at desc);
create index if not exists val_execution_receipts_lookup_idx on val_execution_receipts(tenant_id,user_id,status,created_at desc);
create index if not exists val_execution_receipts_packet_idx on val_execution_receipts(tenant_id,user_id,packet_id,created_at desc);
create index if not exists val_execution_reconciliation_lookup_idx on val_execution_reconciliation_events(tenant_id,user_id,receipt_id,created_at desc);
`;

async function ensureValExternalActionTables({dbQuery,logger=console}={}){
  if(typeof dbQuery!=='function')return;
  await dbQuery(VAL_EXTERNAL_ACTIONS_SQL);
  await dbQuery(`
    alter table val_external_action_packets add column if not exists authorization_source text;
    alter table val_external_action_packets add column if not exists authorization_event_id text;
    alter table val_external_action_packets add column if not exists authorization_quote text;
    alter table val_external_action_packets add column if not exists authenticated_user_confirmed boolean not null default false;
    alter table val_external_action_packets add column if not exists speaker_confidence numeric not null default 0;
    alter table val_external_action_packets add column if not exists authorization_created_at timestamptz;
    alter table val_external_action_packets add column if not exists attempted_at timestamptz;
    alter table val_external_action_packets add column if not exists executed_at timestamptz;
    alter table val_external_action_packets add column if not exists provider_response_id text;
    alter table val_external_action_packets add column if not exists provider_response_summary text;
    alter table val_external_action_packets add column if not exists failure_reason text;
    alter table val_external_action_packets add column if not exists retry_count integer not null default 0;
    alter table val_external_action_packets add column if not exists idempotency_key text;
    alter table val_external_action_packets add column if not exists executed_by text;
    alter table val_external_action_audit add column if not exists authorization_source text;
    alter table val_external_action_audit add column if not exists authorization_event_id text;
    alter table val_external_action_audit add column if not exists attempted_at timestamptz;
    alter table val_external_action_audit add column if not exists executed_at timestamptz;
    alter table val_external_action_audit add column if not exists provider_response_id text;
    alter table val_external_action_audit add column if not exists provider_response_summary text;
    alter table val_external_action_audit add column if not exists failure_reason text;
    alter table val_external_action_audit add column if not exists retry_count integer not null default 0;
    alter table val_external_action_audit add column if not exists idempotency_key text;
    alter table val_external_action_audit add column if not exists executed_by text;
  `);
  logger.log?.('VAL External Action Planner tables ready');
}

module.exports={VAL_EXTERNAL_ACTIONS_SQL,ensureValExternalActionTables};
