const fs = require('fs');
const path = require('path');

const endpoint = process.env.VAL_TRANSCRIPTS_URL || 'https://jessaval-production.up.railway.app/api/val/transcripts';
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

async function postDoc(doc){
  const transcript = fs.readFileSync(doc.file,'utf8');
  const response = await fetch(endpoint,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      type:doc.type,
      title:doc.title,
      transcript,
      timestamp:new Date().toISOString(),
      source:'codex_memory_import',
      importance:5,
      metadata:{
        sourceFile:path.basename(doc.file),
        importedFrom:'local extracted document'
      }
    })
  });
  const body = await response.text();
  if(!response.ok) throw new Error(`${doc.title}: ${response.status} ${body}`);
  console.log(`${doc.title}: ${body}`);
}

(async()=>{
  for(const doc of docs) await postDoc(doc);
})();
