const VAL_REVIEW_UPDATES_SQL = `
create table if not exists val_review_updates (
  id text primary key,
  tenant_id text not null default 'default',
  user_id text not null default 'default',
  status text not null default 'pending',
  target_type text not null,
  target_key text not null,
  update_type text not null,
  title text not null,
  summary text,
  proposed_value_json jsonb not null default '{}',
  existing_value_json jsonb not null default '{}',
  source_refs_json jsonb not null default '[]',
  evidence_refs_json jsonb not null default '[]',
  approval_policy text not null default 'approval_required',
  sensitivity text not null default 'normal',
  confidence numeric not null default 0,
  requires_approval boolean not null default true,
  applied_target_id text,
  metadata_json jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table if not exists val_review_update_audit (
  id text primary key,
  tenant_id text not null default 'default',
  user_id text not null default 'default',
  review_update_id text references val_review_updates(id) on delete set null,
  action text not null,
  before_json jsonb not null default '{}',
  after_json jsonb not null default '{}',
  note text,
  external_action_taken boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists val_review_updates_lookup_idx on val_review_updates(tenant_id,user_id,status,created_at desc);
create index if not exists val_review_updates_target_idx on val_review_updates(tenant_id,user_id,target_type,target_key,status);
create index if not exists val_review_update_audit_lookup_idx on val_review_update_audit(tenant_id,user_id,review_update_id,created_at desc);
`;

async function ensureValReviewUpdatesTables({dbQuery,logger=console}={}){
  if(typeof dbQuery!=='function')return;
  await dbQuery(VAL_REVIEW_UPDATES_SQL);
  logger.log?.('VAL Review Updates tables ready');
}

module.exports={VAL_REVIEW_UPDATES_SQL,ensureValReviewUpdatesTables};
