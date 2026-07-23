const VAL_ACTION_ORCHESTRATOR_SQL=`
    create table if not exists val_action_sources (
      id text primary key,
      tenant_id text not null,
      user_id text not null,
      source_channel text not null,
      source_type text not null,
      source_id text not null,
      source_event_id text,
      title text,
      text_excerpt text,
      context_json jsonb not null default '{}'::jsonb,
      source_refs_json jsonb not null default '[]'::jsonb,
      idempotency_key text not null,
      received_at timestamptz not null default now(),
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
    create unique index if not exists val_action_sources_idempotency_idx
      on val_action_sources(tenant_id,user_id,idempotency_key);
    create index if not exists val_action_sources_lookup_idx
      on val_action_sources(tenant_id,user_id,source_channel,received_at desc);

    create table if not exists val_action_candidates (
      id text primary key,
      tenant_id text not null,
      user_id text not null,
      source_record_id text not null,
      source_channel text not null,
      source_type text not null,
      source_id text not null,
      status text not null,
      action_type text not null,
      title text,
      instruction text,
      target_json jsonb not null default '{}'::jsonb,
      context_json jsonb not null default '{}'::jsonb,
      source_refs_json jsonb not null default '[]'::jsonb,
      ambiguity_json jsonb not null default '[]'::jsonb,
      prepared_artifact_json jsonb not null default '{}'::jsonb,
      capability_json jsonb not null default '{}'::jsonb,
      approval_policy text not null default 'approval_required',
      external_action_packet_id text,
      execution_receipt_id text,
      provider_response_id text,
      failure_reason text,
      idempotency_key text not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      reviewed_at timestamptz,
      executed_at timestamptz,
      reconciled_at timestamptz
    );
    create unique index if not exists val_action_candidates_idempotency_idx
      on val_action_candidates(tenant_id,user_id,idempotency_key);
    create index if not exists val_action_candidates_lookup_idx
      on val_action_candidates(tenant_id,user_id,status,updated_at desc);
    create index if not exists val_action_candidates_source_idx
      on val_action_candidates(tenant_id,user_id,source_record_id);

    create table if not exists val_action_candidate_events (
      id text primary key,
      tenant_id text not null,
      user_id text not null,
      candidate_id text not null,
      event_type text not null,
      prior_status text,
      status text not null,
      payload_json jsonb not null default '{}'::jsonb,
      source_refs_json jsonb not null default '[]'::jsonb,
      created_at timestamptz not null default now()
    );
    create index if not exists val_action_candidate_events_lookup_idx
      on val_action_candidate_events(tenant_id,user_id,candidate_id,created_at);
  `;

async function ensureValActionOrchestratorTables({dbQuery,logger=console}={}){
  if(typeof dbQuery!=='function')return;
  await dbQuery(VAL_ACTION_ORCHESTRATOR_SQL);
  logger.log?.('VAL Action Orchestrator tables ready.');
}

module.exports={VAL_ACTION_ORCHESTRATOR_SQL,ensureValActionOrchestratorTables};
