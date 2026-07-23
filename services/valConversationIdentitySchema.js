const VAL_CONVERSATION_IDENTITY_SQL = `
create table if not exists email_messages (
  id text primary key,
  tenant_id text not null default 'default',
  user_id text not null default 'default',
  provider text not null,
  message_id text not null,
  thread_id text,
  unified_conversation_id text,
  direction text not null default 'unknown',
  sender_json jsonb not null default '{}',
  recipients_json jsonb not null default '[]',
  cc_json jsonb not null default '[]',
  bcc_json jsonb not null default '[]',
  subject text,
  body_preview text,
  body_text text,
  snippet text,
  labels_json jsonb not null default '[]',
  has_attachments boolean not null default false,
  web_link text,
  received_at timestamptz,
  sent_at timestamptz,
  raw_json jsonb not null default '{}',
  trigger_receipt_json jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id,user_id,provider,message_id)
);

create table if not exists email_threads (
  id text primary key,
  tenant_id text not null default 'default',
  user_id text not null default 'default',
  provider text not null,
  thread_id text not null,
  unified_conversation_id text,
  subject text,
  participants_json jsonb not null default '[]',
  message_count integer not null default 0,
  latest_message_at timestamptz,
  summary_json jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id,user_id,provider,thread_id)
);

create table if not exists unified_conversations (
  id text primary key,
  tenant_id text not null default 'default',
  user_id text not null default 'default',
  conversation_key text not null,
  primary_provider text,
  primary_thread_id text,
  subject text,
  participant_keys_json jsonb not null default '[]',
  participants_json jsonb not null default '[]',
  latest_message_at timestamptz,
  latest_inbound_at timestamptz,
  latest_outbound_at timestamptz,
  message_count integer not null default 0,
  state text not null default 'unknown',
  relationship_temperature text not null default 'unknown',
  unknowns_json jsonb not null default '[]',
  metadata_json jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id,user_id,conversation_key)
);

create table if not exists conversation_classifications (
  id text primary key,
  tenant_id text not null default 'default',
  user_id text not null default 'default',
  unified_conversation_id text references unified_conversations(id) on delete cascade,
  email_thread_id text,
  current_message_id text,
  conversation_state text not null default 'unknown',
  relationship_temperature text not null default 'unknown',
  executive_meaning text,
  priority_level text not null default 'unknown',
  why_now text,
  if_ignored text,
  if_delayed text,
  false_urgency_check_json jsonb not null default '{}',
  routing_json jsonb not null default '{}',
  approval_policy text not null default 'approval_required',
  waiting_on_user boolean not null default false,
  waiting_on_other boolean not null default false,
  open_questions_json jsonb not null default '[]',
  commitments_json jsonb not null default '[]',
  unknowns_json jsonb not null default '[]',
  context_json jsonb not null default '{}',
  source_refs_json jsonb not null default '[]',
  confidence numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists email_draft_evaluations (
  id text primary key,
  tenant_id text not null default 'default',
  user_id text not null default 'default',
  unified_conversation_id text,
  email_message_id text,
  evaluation_type text not null,
  status text not null default 'ready_for_review',
  draft_readiness_json jsonb not null default '{}',
  draft_brief_json jsonb not null default '{}',
  representation_risk text not null default 'medium',
  missing_context_json jsonb not null default '[]',
  plainness_check_json jsonb not null default '{}',
  qa_result_json jsonb not null default '{}',
  source_refs_json jsonb not null default '[]',
  confidence numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists email_messages_lookup_idx on email_messages(tenant_id,user_id,provider,received_at desc);
create index if not exists email_messages_thread_idx on email_messages(tenant_id,user_id,provider,thread_id,received_at desc);
create index if not exists email_messages_unified_idx on email_messages(tenant_id,user_id,unified_conversation_id,received_at desc);
create index if not exists email_threads_lookup_idx on email_threads(tenant_id,user_id,provider,latest_message_at desc);
create index if not exists unified_conversations_lookup_idx on unified_conversations(tenant_id,user_id,latest_message_at desc);
create index if not exists conversation_classifications_lookup_idx on conversation_classifications(tenant_id,user_id,unified_conversation_id,created_at desc);
create index if not exists conversation_classifications_priority_idx on conversation_classifications(tenant_id,user_id,priority_level,created_at desc);
create index if not exists email_draft_evaluations_lookup_idx on email_draft_evaluations(tenant_id,user_id,unified_conversation_id,evaluation_type,created_at desc);
`;

async function ensureValConversationIdentityTables({dbQuery,logger=console}={}){
  if(typeof dbQuery!=='function') return;
  await dbQuery(VAL_CONVERSATION_IDENTITY_SQL);
  await dbQuery("alter table conversation_classifications add column if not exists executive_meaning text");
  await dbQuery("alter table conversation_classifications add column if not exists priority_level text not null default 'unknown'");
  await dbQuery("alter table conversation_classifications add column if not exists why_now text");
  await dbQuery("alter table conversation_classifications add column if not exists if_ignored text");
  await dbQuery("alter table conversation_classifications add column if not exists if_delayed text");
  await dbQuery("alter table conversation_classifications add column if not exists false_urgency_check_json jsonb not null default '{}'");
  await dbQuery("alter table conversation_classifications add column if not exists routing_json jsonb not null default '{}'");
  await dbQuery("alter table conversation_classifications add column if not exists approval_policy text not null default 'approval_required'");
  await dbQuery("alter table email_messages add column if not exists trigger_receipt_json jsonb not null default '{}'");
  logger.log?.('VAL Conversation + Identity tables ready');
}

module.exports = {VAL_CONVERSATION_IDENTITY_SQL,ensureValConversationIdentityTables};
