const fs = require('fs');
const path = require('path');

const endpoint = process.env.VAL_MEMORY_URL || 'https://jessaval-production.up.railway.app/api/val/memory';
const chunkSize = Number(process.env.MEMORY_CHUNK_SIZE) || 1800;
const chunkOverlap = Number(process.env.MEMORY_CHUNK_OVERLAP) || 250;
const docs = [
  {
    title: 'Jessa DISC Profile',
    type: 'core_user_profile',
    file: '/Users/jessagrace/Documents/Codex/2026-05-22/github-plugin-github-openai-curated-are/val-memory-imports/jessa_disc_profile.txt'
  },
  {
    title: 'Jessa HALOS Personal Operating System',
    type: 'core_user_profile',
    file: '/Users/jessagrace/Documents/Codex/2026-05-22/github-plugin-github-openai-curated-are/val-memory-imports/jessa_halos_operating_system.txt'
  },
  {
    title: 'VAL Strategic Reasoning Engine',
    type: 'val_operating_prompt',
    file: '/Users/jessagrace/Documents/Codex/2026-05-22/github-plugin-github-openai-curated-are/val-memory-imports/val_strategic_reasoning_engine.txt'
  }
];

function memoryChunks(text){
  const clean = String(text||'').replace(/\r\n/g,'\n').trim();
  if(!clean) return [];
  if(clean.length <= chunkSize) return [clean];
  const chunks = [];
  let start = 0;
  while(start < clean.length){
    let end = Math.min(start + chunkSize, clean.length);
    if(end < clean.length){
      const breakAt = Math.max(clean.lastIndexOf('\n\n',end), clean.lastIndexOf('. ',end), clean.lastIndexOf('\n',end));
      if(breakAt > start + chunkSize * 0.55) end = breakAt + 1;
    }
    chunks.push(clean.slice(start,end).trim());
    if(end >= clean.length) break;
    start = Math.max(0,end - chunkOverlap);
  }
  return chunks.filter(Boolean);
}

async function postMemory(payload){
  const response = await fetch(endpoint,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(payload)
  });
  const body = await response.text();
  if(!response.ok) throw new Error(`${payload.summary}: ${response.status} ${body}`);
  return body;
}

async function postDoc(doc){
  const transcript = fs.readFileSync(doc.file,'utf8');
  const chunks = memoryChunks(transcript);
  console.log(`${doc.title}: uploading ${chunks.length} chunks`);
  for(let i=0;i<chunks.length;i++){
    await postMemory({
      kind:doc.type,
      summary:`${doc.title} (${i+1}/${chunks.length})`,
      rawText:chunks[i],
      importance:5,
      metadata:{
        title:doc.title,
        source:'codex_memory_import',
        sourceFile:path.basename(doc.file),
        importedFrom:'local extracted document',
        chunkIndex:i+1,
        chunkCount:chunks.length
      }
    });
    if((i+1)%10===0 || i===chunks.length-1) console.log(`${doc.title}: ${i+1}/${chunks.length}`);
  }
}

(async()=>{
  for(const doc of docs) await postDoc(doc);
})();
