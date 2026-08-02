const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {
  REQUIRED_CANONICAL_LINEAGE_SCHEMA,
  evaluateCanonicalLineageSchema,
  verifyCanonicalLineageSchema
}=require('../services/valCanonicalSchemaReadiness');

function completeRows(){
  return Object.entries(REQUIRED_CANONICAL_LINEAGE_SCHEMA).flatMap(([table,columns])=>
    columns.map(column=>({table_name:table,column_name:column}))
  );
}

test('canonical lineage readiness accepts the complete required schema',()=>{
  const result=evaluateCanonicalLineageSchema(completeRows());
  assert.equal(result.ok,true);
  assert.equal(result.status,'ready');
  assert.deepEqual(result.missingTables,[]);
  assert.deepEqual(result.missingColumns,{});
});

test('canonical lineage readiness names missing tables and columns',()=>{
  const rows=completeRows().filter(row=>
    row.table_name!=='val_work_item_events'
    && !(row.table_name==='source_processing_records'&&row.column_name==='source_version')
  );
  const result=evaluateCanonicalLineageSchema(rows);
  assert.equal(result.ok,false);
  assert.equal(result.status,'not_ready');
  assert.deepEqual(result.missingTables,['val_work_item_events']);
  assert.deepEqual(result.missingColumns,{source_processing_records:['source_version']});
});

test('database verifier queries information_schema and returns the evaluated contract',async()=>{
  let call=null;
  const result=await verifyCanonicalLineageSchema({
    dbQuery:async(sql,params)=>{
      call={sql,params};
      return {rows:completeRows()};
    }
  });
  assert.equal(result.ok,true);
  assert.match(call.sql,/information_schema\.columns/);
  assert.equal(call.params[0],'public');
  assert.deepEqual(call.params[1],Object.keys(REQUIRED_CANONICAL_LINEAGE_SCHEMA));
});

test('health routes return 503 until canonical database readiness is true',()=>{
  const server=fs.readFileSync(path.join(__dirname,'..','server.js'),'utf8');
  assert.match(server,/verifyCanonicalLineageSchema\(\{dbQuery\}\)/);
  assert.match(server,/status:valDatabaseReadiness\.ok\?'VAL Proxy OK':'VAL Proxy Not Ready'/);
  assert.match(server,/res\.status\(payload\.readiness\.ok\?200:503\)\.json\(payload\)/);
});

test('source processing migration adds lineage columns before indexing them',()=>{
  const schema=fs.readFileSync(path.join(__dirname,'..','services','valSourceProcessingSchema.js'),'utf8');
  const addFingerprint=schema.indexOf('add column if not exists source_fingerprint');
  const addVersion=schema.indexOf('add column if not exists source_version');
  const lineageIndex=schema.indexOf('source_processing_records_version_idx');
  assert.ok(addFingerprint>=0);
  assert.ok(addVersion>=0);
  assert.ok(lineageIndex>=0);
  assert.ok(addFingerprint<lineageIndex);
  assert.ok(addVersion<lineageIndex);
});
