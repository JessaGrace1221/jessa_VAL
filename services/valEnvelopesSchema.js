const VAL_ENVELOPES_SQL = `
create table if not exists val_envelopes (
  id text primary key,
  tenant_id text not null default 'default',
  user_id text not null default 'default',
  envelope_type text not null,
  envelope_key text not null,
  display_name text not null,
  project_id text,
  project_name text,
  relationship_id text,
  relationship_name text,
  manager_color_name text,
  manager_color_hex text,
  summary text,
  packet_count integer not null default 0,
  source_refs_json jsonb not null default '[]',
  metadata_json jsonb not null default '{}',
  last_packet_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id,user_id,envelope_type,envelope_key)
);

create table if not exists val_envelope_packets (
  tenant_id text not null default 'default',
  user_id text not null default 'default',
  envelope_id text not null references val_envelopes(id) on delete cascade,
  packet_id text not null,
  source_type text,
  source_id text,
  packet_type text,
  title text,
  summary text,
  source_refs_json jsonb not null default '[]',
  created_at timestamptz not null default now(),
  primary key (tenant_id,user_id,envelope_id,packet_id)
);

create index if not exists val_envelopes_lookup_idx
  on val_envelopes(tenant_id,user_id,envelope_type,updated_at desc);

create index if not exists val_envelope_packets_packet_idx
  on val_envelope_packets(tenant_id,user_id,packet_id);
`;

async function ensureValEnvelopeTables({dbQuery,logger=console}={}){
  if(typeof dbQuery!=='function') return;
  await dbQuery(VAL_ENVELOPES_SQL);
  logger.log?.('VAL Envelope tables ready');
}

module.exports={VAL_ENVELOPES_SQL,ensureValEnvelopeTables};
