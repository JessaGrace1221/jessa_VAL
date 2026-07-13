const VAL_COWORK_SQL = `
create table if not exists val_cowork_sessions (
  id text primary key,
  tenant_id text not null default 'default',
  user_id text not null default 'default',
  entrypoint_id text not null,
  scope_type text not null,
  scope_id text not null,
  scope_section_id text,
  status text not null default 'preparing',
  working_brief_json jsonb not null default '{}',
  question_plan_json jsonb not null default '[]',
  state_json jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists val_cowork_work_items (
  id text primary key,
  tenant_id text not null default 'default',
  user_id text not null default 'default',
  session_id text not null references val_cowork_sessions(id) on delete cascade,
  work_type text not null,
  title text not null,
  status text not null default 'needs_input',
  payload_json jsonb not null default '{}',
  source_refs_json jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists val_cowork_action_receipts (
  id text primary key,
  tenant_id text not null default 'default',
  user_id text not null default 'default',
  session_id text not null references val_cowork_sessions(id) on delete cascade,
  work_item_id text references val_cowork_work_items(id) on delete set null,
  action text not null,
  status text not null,
  summary text not null,
  payload_json jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists val_cowork_sessions_scope_idx
  on val_cowork_sessions(tenant_id,user_id,entrypoint_id,scope_type,scope_id,updated_at desc);
create index if not exists val_cowork_work_items_session_idx
  on val_cowork_work_items(tenant_id,user_id,session_id,status,updated_at desc);
create index if not exists val_cowork_action_receipts_session_idx
  on val_cowork_action_receipts(tenant_id,user_id,session_id,created_at desc);
`;

async function ensureValCoworkTables({dbQuery,logger=console}={}){
  if(typeof dbQuery !== 'function') return;
  await dbQuery(VAL_COWORK_SQL);
  logger.log?.('VAL Co-Work tables ready');
}

module.exports = {VAL_COWORK_SQL,ensureValCoworkTables};
