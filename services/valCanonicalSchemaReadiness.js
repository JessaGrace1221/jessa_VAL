const REQUIRED_CANONICAL_LINEAGE_SCHEMA = Object.freeze({
  source_processing_records:[
    'id','tenant_id','user_id','source_type','source_id','source_fingerprint',
    'source_version','source_receipt_json','metadata_json'
  ],
  val_board_packets:[
    'id','tenant_id','user_id','source_type','source_id','packet_type',
    'source_refs_json','payload_json'
  ],
  event_intelligence_runs:[
    'id','tenant_id','user_id','event_source_type','event_source_id','status',
    'result_json'
  ],
  observer_runs:[
    'id','tenant_id','user_id','event_run_id','observer_name','status',
    'output_json','evidence_refs_json'
  ],
  round_table_runs:[
    'id','tenant_id','user_id','event_run_id','observer_run_ids','output_json',
    'source_refs_json'
  ],
  chief_of_staff_recommendations:[
    'id','tenant_id','user_id','event_run_id','round_table_run_id','status',
    'source_refs_json'
  ],
  val_work_items:[
    'id','tenant_id','user_id','source_processing_record_id','source_type',
    'source_id','source_fingerprint','work_fingerprint','admission_status',
    'lifecycle_status','source_refs_json','observer_receipts_json',
    'round_table_run_id','chief_recommendation_id','chief_rank'
  ],
  val_work_item_events:[
    'id','tenant_id','user_id','work_item_id','event_type','previous_status',
    'new_status','source_refs_json','payload_json'
  ]
});

function evaluateCanonicalLineageSchema(rows=[]){
  const available=new Map();
  for(const row of rows){
    const table=String(row.table_name||row.tableName||'').trim();
    const column=String(row.column_name||row.columnName||'').trim();
    if(!table||!column)continue;
    if(!available.has(table))available.set(table,new Set());
    available.get(table).add(column);
  }
  const missingTables=[];
  const missingColumns={};
  for(const [table,columns] of Object.entries(REQUIRED_CANONICAL_LINEAGE_SCHEMA)){
    if(!available.has(table)){
      missingTables.push(table);
      continue;
    }
    const missing=columns.filter(column=>!available.get(table).has(column));
    if(missing.length)missingColumns[table]=missing;
  }
  return {
    ok:missingTables.length===0&&Object.keys(missingColumns).length===0,
    status:missingTables.length||Object.keys(missingColumns).length?'not_ready':'ready',
    requiredTables:Object.keys(REQUIRED_CANONICAL_LINEAGE_SCHEMA),
    missingTables,
    missingColumns
  };
}

async function verifyCanonicalLineageSchema({dbQuery}={}){
  if(typeof dbQuery!=='function'){
    return {
      ok:false,
      status:'not_ready',
      requiredTables:Object.keys(REQUIRED_CANONICAL_LINEAGE_SCHEMA),
      missingTables:Object.keys(REQUIRED_CANONICAL_LINEAGE_SCHEMA),
      missingColumns:{},
      error:'Database query function is unavailable.'
    };
  }
  const tables=Object.keys(REQUIRED_CANONICAL_LINEAGE_SCHEMA);
  const result=await dbQuery(
    `select table_name,column_name
       from information_schema.columns
      where table_schema=$1
        and table_name = any($2::text[])
      order by table_name,ordinal_position`,
    ['public',tables]
  );
  return evaluateCanonicalLineageSchema(result.rows||[]);
}

module.exports={
  REQUIRED_CANONICAL_LINEAGE_SCHEMA,
  evaluateCanonicalLineageSchema,
  verifyCanonicalLineageSchema
};
