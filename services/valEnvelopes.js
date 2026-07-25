function safeArray(value){return Array.isArray(value)?value:[];}
function jsonValue(value,fallback){
  if(value==null)return fallback;
  if(typeof value==='string'){try{return JSON.parse(value);}catch(_){return fallback;}}
  return value;
}
function compactText(value='',limit=900){return String(value||'').replace(/\s+/g,' ').trim().slice(0,limit);}
function stableKey(value=''){return String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'').slice(0,180)||'general';}
function nowIso(){return new Date().toISOString();}
function toCamelRow(row={}){
  const out={};
  for(const [key,value] of Object.entries(row||{})){
    out[key.replace(/_([a-z])/g,(_,c)=>c.toUpperCase())]=value instanceof Date?value.toISOString():value;
  }
  for(const key of ['sourceRefsJson','metadataJson'])if(Object.hasOwn(out,key))out[key]=jsonValue(out[key],/Refs/.test(key)?[]:{});
  return out;
}
function firstValue(...values){
  for(const value of values){
    if(typeof value==='string'&&value.trim())return value.trim();
    if(value!=null&&typeof value!=='object'&&String(value).trim())return String(value).trim();
  }
  return '';
}
function walkValues(value,visitor,depth=0){
  if(depth>4||value==null)return;
  if(Array.isArray(value)){for(const item of value)walkValues(item,visitor,depth+1);return;}
  if(typeof value==='object'){
    visitor(value);
    for(const item of Object.values(value))walkValues(item,visitor,depth+1);
  }
}
const PROJECT_COLOR_RULES = [
  {pattern:/\bgoall\b/i,name:'Taffy',hex:'#ee78bf'}
];

function projectColorFor(name='',payload={}){
  const explicit=firstValue(payload.managerColorName,payload.manager_color_name,payload.projectManagerColorName,payload.project_manager_color_name);
  const explicitHex=firstValue(payload.managerColorHex,payload.manager_color_hex,payload.projectManagerColorHex,payload.project_manager_color_hex);
  if(explicit||explicitHex)return {name:explicit,hex:explicitHex};
  const rule=PROJECT_COLOR_RULES.find(item=>item.pattern.test(name));
  return rule?{name:rule.name,hex:rule.hex}:{name:'',hex:''};
}

function inferProjectFromText(text=''){
  if(/\bGOALL\b/i.test(text))return 'GOALL';
  return '';
}

function envelopeTargetFromPacket(packet={}){
  const payload=jsonValue(packet.payloadJson||packet.payload||packet.payload_json,{});
  const refs=safeArray(packet.sourceRefsJson||packet.source_refs_json||packet.sourceRefs);
  const candidates=[];
  walkValues(payload,(obj)=>candidates.push(obj));
  const text=compactText([
    packet.title,packet.summary,
    ...refs.map(ref=>ref.quote_or_summary||ref.quoteOrSummary||ref.summary||ref.title),
    JSON.stringify(payload)
  ].filter(Boolean).join(' '),4000);
  let projectName='';
  let projectId='';
  let relationshipName='';
  let relationshipId='';
  for(const obj of candidates){
    projectName ||= firstValue(obj.projectName,obj.project_name,obj.project,obj.projectTitle,obj.project_title,obj.canonicalProjectName,obj.canonical_project_name);
    projectId ||= firstValue(obj.projectId,obj.project_id,obj.projectKey,obj.project_key);
    relationshipName ||= firstValue(obj.relationshipName,obj.relationship_name,obj.contactName,obj.contact_name,obj.personName,obj.person_name,obj.counterpartyName,obj.counterparty_name,obj.name);
    relationshipId ||= firstValue(obj.relationshipId,obj.relationship_id,obj.contactId,obj.contact_id,obj.personId,obj.person_id);
  }
  projectName ||= inferProjectFromText(text);
  if(projectName){
    const color=projectColorFor(projectName,payload);
    return {
      envelopeType:'project',
      envelopeKey:stableKey(projectId||projectName),
      displayName:projectName,
      projectId,
      projectName,
      relationshipId:'',
      relationshipName:'',
      managerColorName:color.name,
      managerColorHex:color.hex
    };
  }
  if(relationshipName){
    return {
      envelopeType:'relationship',
      envelopeKey:stableKey(relationshipId||relationshipName),
      displayName:relationshipName,
      projectId:'',
      projectName:'',
      relationshipId,
      relationshipName,
      managerColorName:'',
      managerColorHex:''
    };
  }
  return {
    envelopeType:'general',
    envelopeKey:'general_val_context',
    displayName:'General VAL context',
    projectId:'',
    projectName:'',
    relationshipId:'',
    relationshipName:'',
    managerColorName:'',
    managerColorHex:''
  };
}

function createValEnvelopesService({
  dbQuery=null,
  hasPg=()=>false,
  getStore=()=>({}),
  saveStore=()=>{},
  uuid=(prefix)=>`${prefix}_${Date.now().toString(36)}`,
  tenantId=()=>'default',
  userId=()=>'default'
}={}){
  function store(){
    const s=getStore()||{};
    if(!Array.isArray(s.valEnvelopes))s.valEnvelopes=[];
    if(!Array.isArray(s.valEnvelopePackets))s.valEnvelopePackets=[];
    return s;
  }
  function envelopeIdFor(target){
    return stableKey(`env_${tenantId()}_${userId()}_${target.envelopeType}_${target.envelopeKey}`)||uuid('env');
  }
  async function upsertForPacket(packet={}){
    const target=envelopeTargetFromPacket(packet);
    const id=envelopeIdFor(target);
    const refs=safeArray(packet.sourceRefsJson||packet.source_refs_json||packet.sourceRefs);
    const now=nowIso();
    if(hasPg()&&dbQuery){
      const inserted=await dbQuery(`
        insert into val_envelopes (
          id,tenant_id,user_id,envelope_type,envelope_key,display_name,project_id,project_name,
          relationship_id,relationship_name,manager_color_name,manager_color_hex,summary,
          source_refs_json,metadata_json,last_packet_at,updated_at
        ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
        on conflict (tenant_id,user_id,envelope_type,envelope_key) do update set
          display_name=excluded.display_name,
          project_id=coalesce(excluded.project_id,val_envelopes.project_id),
          project_name=coalesce(excluded.project_name,val_envelopes.project_name),
          relationship_id=coalesce(excluded.relationship_id,val_envelopes.relationship_id),
          relationship_name=coalesce(excluded.relationship_name,val_envelopes.relationship_name),
          manager_color_name=coalesce(excluded.manager_color_name,val_envelopes.manager_color_name),
          manager_color_hex=coalesce(excluded.manager_color_hex,val_envelopes.manager_color_hex),
          summary=coalesce(excluded.summary,val_envelopes.summary),
          source_refs_json=case when jsonb_array_length(excluded.source_refs_json)>0 then excluded.source_refs_json else val_envelopes.source_refs_json end,
          metadata_json=val_envelopes.metadata_json || excluded.metadata_json,
          last_packet_at=excluded.last_packet_at,
          updated_at=excluded.updated_at
        returning *
      `,[id,tenantId(),userId(),target.envelopeType,target.envelopeKey,target.displayName,target.projectId||null,target.projectName||null,target.relationshipId||null,target.relationshipName||null,target.managerColorName||null,target.managerColorHex||null,compactText(packet.summary,900)||null,JSON.stringify(refs),JSON.stringify({source:'packet_ingest'}),packet.createdAt||packet.created_at||now,now]);
      const envelope=toCamelRow(inserted.rows?.[0]||{id,...target,tenant_id:tenantId(),user_id:userId()});
      await dbQuery(`
        insert into val_envelope_packets (
          tenant_id,user_id,envelope_id,packet_id,source_type,source_id,packet_type,title,summary,source_refs_json,created_at
        ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        on conflict (tenant_id,user_id,envelope_id,packet_id) do nothing
      `,[tenantId(),userId(),envelope.id,packet.id,packet.sourceType||packet.source_type,packet.sourceId||packet.source_id,packet.packetType||packet.packet_type,packet.title,packet.summary,JSON.stringify(refs),packet.createdAt||packet.created_at||now]);
      const count=await dbQuery(`select count(*)::int as count from val_envelope_packets where tenant_id=$1 and user_id=$2 and envelope_id=$3`,[tenantId(),userId(),envelope.id]).catch(()=>({rows:[{count:envelope.packetCount||0}]}));
      const packetCount=Number(count.rows?.[0]?.count||0);
      await dbQuery(`update val_envelopes set packet_count=$1 where tenant_id=$2 and user_id=$3 and id=$4`,[packetCount,tenantId(),userId(),envelope.id]).catch(()=>{});
      return {...envelope,packetCount};
    }
    const s=store();
    const existingIndex=s.valEnvelopes.findIndex(row=>row.tenantId===tenantId()&&row.userId===userId()&&row.envelopeType===target.envelopeType&&row.envelopeKey===target.envelopeKey);
    const packetLink={tenantId:tenantId(),userId:userId(),envelopeId:id,packetId:packet.id,sourceType:packet.sourceType,sourceId:packet.sourceId,packetType:packet.packetType,title:packet.title,summary:packet.summary,sourceRefsJson:refs,createdAt:packet.createdAt||now};
    if(!s.valEnvelopePackets.some(row=>row.tenantId===packetLink.tenantId&&row.userId===packetLink.userId&&row.envelopeId===id&&row.packetId===packet.id))s.valEnvelopePackets.push(packetLink);
    const packetCount=s.valEnvelopePackets.filter(row=>row.tenantId===tenantId()&&row.userId===userId()&&row.envelopeId===id).length;
    const next={id,tenantId:tenantId(),userId:userId(),...target,summary:compactText(packet.summary,900),sourceRefsJson:refs,metadataJson:{source:'packet_ingest'},packetCount,lastPacketAt:packet.createdAt||now,updatedAt:now,createdAt:now};
    if(existingIndex>=0)s.valEnvelopes[existingIndex]={...s.valEnvelopes[existingIndex],...next,createdAt:s.valEnvelopes[existingIndex].createdAt};
    else s.valEnvelopes.unshift(next);
    saveStore(s);
    return existingIndex>=0?s.valEnvelopes[existingIndex]:next;
  }
  async function list({limit=80,envelopeType=''}={}){
    const lim=Math.max(1,Math.min(Number(limit)||80,300));
    if(hasPg()&&dbQuery){
      const params=[tenantId(),userId()];
      let where='tenant_id=$1 and user_id=$2';
      if(envelopeType){params.push(envelopeType);where+=` and envelope_type=$${params.length}`;}
      const r=await dbQuery(`select * from val_envelopes where ${where} order by updated_at desc limit ${lim}`,params);
      return (r.rows||[]).map(toCamelRow);
    }
    return store().valEnvelopes
      .filter(row=>row.tenantId===tenantId()&&row.userId===userId())
      .filter(row=>!envelopeType||row.envelopeType===envelopeType)
      .sort((a,b)=>String(b.updatedAt||'').localeCompare(String(a.updatedAt||'')))
      .slice(0,lim);
  }
  return {envelopeTargetFromPacket,upsertForPacket,list};
}

module.exports={createValEnvelopesService,envelopeTargetFromPacket};
