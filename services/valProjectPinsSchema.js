const VAL_PROJECT_PINS_SQL = `
create table if not exists project_pins (
  id text primary key,
  tenant_id text not null default 'default',
  user_id text not null default 'default',
  project_id text not null,
  project_name text not null,
  title text not null,
  summary text,
  status text not null default 'pinned',
  pin_until timestamptz not null,
  source_type text,
  source_id text,
  source_title text,
  source_refs_json jsonb not null default '[]',
  metadata_json jsonb not null default '{}',
  reopened_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists project_pins_lookup_idx on project_pins(tenant_id,user_id,status,pin_until);
create index if not exists project_pins_project_idx on project_pins(tenant_id,user_id,project_id,status,pin_until);
`;

async function ensureValProjectPinsTables({dbQuery,logger=console}={}){
  if(typeof dbQuery!=='function')return;
  await dbQuery(VAL_PROJECT_PINS_SQL);
  logger.log?.('VAL Project Pins tables ready');
}

module.exports={VAL_PROJECT_PINS_SQL,ensureValProjectPinsTables};
