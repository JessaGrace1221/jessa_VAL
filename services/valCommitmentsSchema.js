const VAL_COMMITMENTS_SQL = `
create table if not exists val_commitment_overrides (
  id text not null,
  tenant_id text not null default 'default',
  user_id text not null default 'default',
  status text,
  owner_type text,
  owner_name text,
  owner_contact_id text,
  task_id text,
  draft_id text,
  dismissal_reason text,
  last_touched_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (tenant_id,user_id,id)
);

create index if not exists val_commitment_overrides_lookup_idx
  on val_commitment_overrides(tenant_id,user_id,status,updated_at desc);
`;

async function ensureValCommitmentTables({dbQuery,logger=console}={}){
  if(typeof dbQuery!=='function') return;
  await dbQuery(VAL_COMMITMENTS_SQL);
  logger.log?.('VAL commitment tables ready');
}

module.exports={VAL_COMMITMENTS_SQL,ensureValCommitmentTables};
