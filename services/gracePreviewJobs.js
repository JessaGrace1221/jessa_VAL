'use strict';
const {randomUUID,createHash}=require('node:crypto');
function createGracePreviewJobs({now=Date.now,ttlMs=2*60*60*1000,maxJobs=20}={}){
  const jobs=new Map();
  function visible(job){return {jobId:job.id,status:job.status,pending:job.status==='running',createdAt:job.createdAt,completedAt:job.completedAt||null,result:job.result||null,error:job.error||''};}
  function sweep(){for(const [id,job] of jobs)if(job.status!=='running'&&now()-job.finishedAt>ttlMs)jobs.delete(id);}
  function start(owner,payload,run){
    if(!owner)throw Error('An authenticated owner is required');
    sweep();
    const signature=createHash('sha256').update(JSON.stringify(payload)).digest('hex');
    const prior=[...jobs.values()].find(job=>job.owner===owner&&job.status==='running');
    if(prior){if(prior.signature===signature)return visible(prior);throw Error('A Grace preview is already running for this user');}
    if(jobs.size>=maxJobs)throw Error('Grace preview capacity is full; retry after an existing run expires');
    const job={id:randomUUID(),owner,signature,status:'running',createdAt:new Date(now()).toISOString()};jobs.set(job.id,job);
    Promise.resolve().then(()=>run({...payload,doNotImport:true,doNotSend:true})).then(result=>{job.result=result;job.status=result.ok?'complete':'failed';job.error=result.error||'';}).catch(error=>{job.status='failed';job.error=error.message;}).finally(()=>{job.finishedAt=now();job.completedAt=new Date(job.finishedAt).toISOString();});
    return visible(job);
  }
  function get(owner,id){sweep();const job=jobs.get(id);return job&&job.owner===owner?visible(job):null;}
  return {start,get};
}
module.exports={createGracePreviewJobs};
