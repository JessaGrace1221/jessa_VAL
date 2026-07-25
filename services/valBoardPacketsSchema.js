const VAL_BOARD_PACKETS_SQL = `
create table if not exists val_board_packets (
  id text primary key,
  tenant_id text not null default 'default',
  user_id text not null default 'default',
  source_type text not null,
  source_id text not null,
  packet_type text not null,
  title text not null,
  summary text,
  status text not null default 'active',
  route_observers_json jsonb not null default '[]',
  primary_observers_json jsonb not null default '[]',
  source_refs_json jsonb not null default '[]',
  payload_json jsonb not null default '{}',
  prototype boolean not null default false,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists val_board_packets_lookup_idx on val_board_packets(tenant_id,user_id,status,created_at desc);
create index if not exists val_board_packets_source_idx on val_board_packets(tenant_id,user_id,source_type,source_id);
create index if not exists val_board_packets_type_idx on val_board_packets(tenant_id,user_id,packet_type,created_at desc);
`;

async function ensureValBoardPacketTables({dbQuery,logger=console}={}){
  if(typeof dbQuery!=='function') return;
  await dbQuery(VAL_BOARD_PACKETS_SQL);
  logger.log?.('VAL Board packet tables ready');
}

module.exports={VAL_BOARD_PACKETS_SQL,ensureValBoardPacketTables};
