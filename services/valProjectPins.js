function safeArray(value){return Array.isArray(value)?value:[];}
function compactText(value='',limit=700){return String(value||'').replace(/\s+/g,' ').trim().slice(0,limit);}
function stableKey(value=''){
  return String(value||'').toLowerCase().replace(/[^a-z0-9:_-]+/g,'_').replace(/^_+|_+$/g,'').slice(0,180)||'pin';
}
function jsonValue(value,fallback){
  if(value==null)return fallback;
  if(typeof value==='string'){try{return JSON.parse(value);}catch(_){return fallback;}}
  return value;
}
function toSnake(key){return key.replace(/[A-Z]/g,m=>'_'+m.toLowerCase());}
function rowToCamel(row={}){
  const out={};
  for(const [k,v] of Object.entries(row||{})){
    const camel=k.replace(/_([a-z])/g,(_,c)=>c.toUpperCase());
    out[camel]=v instanceof Date?v.toISOString():v;
  }
  for(const key of ['sourceRefsJson','metadataJson']){
    if(Object.hasOwn(out,key))out[key]=jsonValue(out[key],/refs/i.test(key)?[]:{});
  }
  return out;
}
function normalizeSourceRef(ref={}){
  return {
    source_type:String(ref.source_type||ref.sourceType||ref.type||'project_pin'),
    source_id:String(ref.source_id||ref.sourceId||ref.id||''),
    quote_or_summary:compactText(ref.quote_or_summary||ref.quoteOrSummary||ref.summary||ref.quote||'',900),
    confidence:Math.max(0,Math.min(1,Number(ref.confidence)||0.85)),
    created_at:ref.created_at||ref.createdAt||new Date().toISOString()
  };
}
function parsePinUntil(value){
  const date=new Date(value||'');
  if(!Number.isFinite(date.getTime()))throw new Error('Put a pin in it requires a valid unpin date/time.');
  return date.toISOString();
}
function projectPinId(uuid,scope,projectId,title,pinUntil){
  return stableKey(`project_pin_${scope.tenantId}_${scope.userId}_${projectId}_${title}_${pinUntil}`)||uuid('projectpin');
}
function projectPinAlignmentItem(pin={}){
  const refs=safeArray(pin.sourceRefsJson||pin.source_refs_json).map(normalizeSourceRef);
  const dueLabel=pin.pinUntil||pin.pin_until||'';
  const projectName=pin.projectName||pin.project_name||'Project';
  const title=pin.title||'Pinned project loop';
  const summary=compactText(pin.summary||`${projectName} was pinned until ${dueLabel} and is now a reopened loop.`,700);
  const evidence=refs.length?refs:[normalizeSourceRef({
    sourceType:'project_pin',
    sourceId:pin.id,
    quoteOrSummary:`Pinned until ${dueLabel}: ${title}`,
    confidence:0.9
  })];
  return {
    id:`alignment_${pin.id}`,
    title:`This is unpinned: ${title}`,
    summary,
    reason_it_matters:`${projectName} has a project loop that was intentionally held until now.`,
    whyNow:`The pin time has arrived, so this is newly reopened for executive attention.`,
    ifIgnored:`The project loop stays unresolved after the time the user chose to revisit it.`,
    decisionNeeded:'Decide whether to work on it now, pin it again, or close the loop.',
    actionNeeded:'Open the Project Manager page and choose the next move.',
    deadline:dueLabel,
    dueAt:dueLabel,
    confidence:0.92,
    target:{type:'project',id:pin.projectId||pin.project_id||'',name:projectName,label:projectName},
    projectId:pin.projectId||pin.project_id||'',
    projectName,
    sourceRefsJson:evidence,
    evidence_count:evidence.length,
    metadataJson:{...(pin.metadataJson||{}),source:'project_pin',pinId:pin.id,reopenedLoop:true,homeAdmission:{whyNowPacketComplete:true},noExternalAction:true},
    portalPhrases:[projectName,title].filter(Boolean)
  };
}

function createValProjectPinsService({
  dbQuery,
  hasPg=()=>false,
  getStore=()=>({}),
  saveStore=()=>{},
  uuid=(prefix)=>`${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`,
  tenantId=()=>'default',
  userId=()=>'default'
}={}){
  function scope(){return {tenantId:tenantId(),userId:userId()};}
  function store(){
    const s=getStore()||{};
    if(!Array.isArray(s.projectPins))s.projectPins=[];
    return s;
  }
  async function pgUpsert(row){
    const columns=['id','tenantId','userId','projectId','projectName','title','summary','status','pinUntil','sourceType','sourceId','sourceTitle','sourceRefsJson','metadataJson','reopenedAt','completedAt','createdAt','updatedAt'];
    const values=columns.map(c=>row[c]);
    const names=columns.map(toSnake);
    const params=columns.map((_,i)=>`$${i+1}`).join(',');
    const updates=names.filter(n=>!['id','created_at'].includes(n)).map(n=>`${n}=excluded.${n}`).join(',');
    const r=await dbQuery(`insert into project_pins (${names.join(',')}) values (${params}) on conflict (id) do update set ${updates} returning *`,values);
    return rowToCamel(r.rows?.[0]||row);
  }
  async function savePin(row){
    if(hasPg())return pgUpsert(row);
    const s=store();
    const idx=s.projectPins.findIndex(pin=>pin.id===row.id&&pin.tenantId===row.tenantId&&pin.userId===row.userId);
    if(idx>=0)s.projectPins[idx]={...s.projectPins[idx],...row,createdAt:s.projectPins[idx].createdAt||row.createdAt,updatedAt:new Date().toISOString()};
    else s.projectPins.unshift(row);
    saveStore(s);
    return idx>=0?s.projectPins[idx]:row;
  }
  async function createPin(input={}){
    const sc=scope();
    const projectName=compactText(input.projectName||input.project_name||input.name||'',180);
    const projectId=compactText(input.projectId||input.project_id||input.projectProfileId||projectName,220);
    const title=compactText(input.title||input.summary||input.note||'Project loop',180);
    if(!projectId||!projectName)throw new Error('Put a pin in it requires a project.');
    const pinUntil=parsePinUntil(input.pinUntil||input.pin_until||input.until||input.dueAt);
    const sourceRefs=safeArray(input.sourceRefsJson||input.sourceRefs||input.source_refs_json).map(normalizeSourceRef);
    const row={
      id:input.id||projectPinId(uuid,sc,projectId,title,pinUntil),
      tenantId:sc.tenantId,
      userId:sc.userId,
      projectId,
      projectName,
      title,
      summary:compactText(input.summary||input.note||title,900),
      status:'pinned',
      pinUntil,
      sourceType:compactText(input.sourceType||input.source_type||'project_manager',120),
      sourceId:compactText(input.sourceId||input.source_id||projectId,220),
      sourceTitle:compactText(input.sourceTitle||input.source_title||projectName,220),
      sourceRefsJson:sourceRefs.length?sourceRefs:[normalizeSourceRef({sourceType:'project_manager',sourceId:projectId,quoteOrSummary:title,confidence:0.9})],
      metadataJson:{...(input.metadataJson||input.metadata||{}),source:'project_manager_pin',noExternalAction:true},
      reopenedAt:null,
      completedAt:null,
      createdAt:new Date().toISOString(),
      updatedAt:new Date().toISOString()
    };
    const pin=await savePin(row);
    return {ok:true,pin,no_external_action:true};
  }
  async function listPins({projectId='',status='',dueOnly=false,limit=50}={}){
    const lim=Math.max(1,Math.min(Number(limit)||50,200));
    const tenant=tenantId();
    const user=userId();
    if(hasPg()){
      const params=[tenant,user];
      const where=['tenant_id=$1','user_id=$2'];
      if(projectId){params.push(projectId);where.push(`project_id=$${params.length}`);}
      if(status){params.push(status);where.push(`status=$${params.length}`);}
      if(dueOnly)where.push(`pin_until <= now()`);
      params.push(lim);
      const r=await dbQuery(`select * from project_pins where ${where.join(' and ')} order by pin_until asc, created_at desc limit $${params.length}`,params);
      return {ok:true,pins:(r.rows||[]).map(rowToCamel)};
    }
    const now=Date.now();
    const rows=store().projectPins
      .filter(pin=>pin.tenantId===tenant&&pin.userId===user)
      .filter(pin=>!projectId||pin.projectId===projectId)
      .filter(pin=>!status||pin.status===status)
      .filter(pin=>!dueOnly||Date.parse(pin.pinUntil)<=now)
      .sort((a,b)=>(Date.parse(a.pinUntil||0)-Date.parse(b.pinUntil||0))||String(b.createdAt||'').localeCompare(String(a.createdAt||'')))
      .slice(0,lim);
    return {ok:true,pins:rows};
  }
  async function markPinsReopened(pins=[]){
    const ids=pins.filter(pin=>pin&&pin.id&&!(pin.reopenedAt||pin.reopened_at)).map(pin=>pin.id);
    if(!ids.length)return pins;
    const reopenedAt=new Date().toISOString();
    const tenant=tenantId();
    const user=userId();
    if(hasPg()){
      await dbQuery(`update project_pins set reopened_at=coalesce(reopened_at,$1::timestamptz), updated_at=now() where tenant_id=$2 and user_id=$3 and id=any($4::text[])`,[reopenedAt,tenant,user,ids]);
    }else{
      const s=store();
      s.projectPins.forEach((pin)=>{
        if(pin.tenantId===tenant&&pin.userId===user&&ids.includes(pin.id)&&!pin.reopenedAt){
          pin.reopenedAt=reopenedAt;
          pin.updatedAt=reopenedAt;
        }
      });
      saveStore(s);
    }
    return pins.map((pin)=>ids.includes(pin.id)?{...pin,reopenedAt:pin.reopenedAt||reopenedAt,updatedAt:pin.updatedAt||reopenedAt}:pin);
  }
  async function listAlignmentPins({limit=3}={}){
    const result=await listPins({status:'pinned',dueOnly:true,limit});
    const reopenedPins=await markPinsReopened(result.pins);
    return {ok:true,pins:reopenedPins,alignmentItems:reopenedPins.map(projectPinAlignmentItem),no_external_action:true};
  }
  async function completePin(id,{reason=''}={}){
    const tenant=tenantId();
    const user=userId();
    const completedAt=new Date().toISOString();
    if(hasPg()){
      const r=await dbQuery(`update project_pins set status='completed', completed_at=$1, metadata_json=metadata_json || $2::jsonb, updated_at=now() where tenant_id=$3 and user_id=$4 and id=$5 returning *`,[completedAt,JSON.stringify({completedReason:reason,noExternalAction:true}),tenant,user,id]);
      return r.rows?.[0]?rowToCamel(r.rows[0]):null;
    }
    const s=store();
    const row=s.projectPins.find(pin=>pin.id===id&&pin.tenantId===tenant&&pin.userId===user);
    if(!row)return null;
    Object.assign(row,{status:'completed',completedAt,updatedAt:completedAt,metadataJson:{...(row.metadataJson||{}),completedReason:reason,noExternalAction:true}});
    saveStore(s);
    return row;
  }
  return {createPin,listPins,listAlignmentPins,completePin};
}

module.exports={createValProjectPinsService,projectPinAlignmentItem,parsePinUntil};
