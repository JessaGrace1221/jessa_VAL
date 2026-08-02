const VAL_EXECUTIVE_INBOX_QUEUE_SQL = `
create table if not exists val_executive_inbox_queue (
  id text primary key,
  tenant_id text not null,
  user_id text not null,
  conversation_id text not null,
  thread_id text not null default '',
  message_id text not null default '',
  queue_kind text not null,
  active boolean not null default true,
  payload_json jsonb not null default '{}'::jsonb,
  verified_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tenant_id,user_id,conversation_id)
);

create index if not exists val_executive_inbox_queue_active_idx
  on val_executive_inbox_queue(tenant_id,user_id,active,verified_at desc);
`;

async function ensureValExecutiveInboxQueueTables({dbQuery,logger=console}={}){
  if(typeof dbQuery!=='function')return {ok:false,skipped:true};
  try{
    await dbQuery(VAL_EXECUTIVE_INBOX_QUEUE_SQL);
    return {ok:true};
  }catch(error){
    logger.error('[val-executive-inbox-queue-schema]',error.message);
    return {ok:false,error:error.message};
  }
}

module.exports={VAL_EXECUTIVE_INBOX_QUEUE_SQL,ensureValExecutiveInboxQueueTables};
