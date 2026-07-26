function safeArray(value){return Array.isArray(value)?value:[];}
function compactText(value='',limit=1200){return String(value||'').replace(/\s+/g,' ').trim().slice(0,limit);}
function parseJson(value){
  if(value&&typeof value==='object')return value;
  const raw=String(value||'').trim().replace(/^```json\s*/i,'').replace(/```\s*$/,'').trim();
  try{return JSON.parse(raw);}catch{return {};}
}
function packetText(workItem={}){
  const brief=workItem.workingBrief||workItem.working_brief||{};
  const packets=safeArray(workItem.source_packets||brief.sourcePackets||brief.source_packets);
  const joined=packets.map((packet,index)=>[
    `[Source ${index+1}: ${packet.source_title||packet.sourceTitle||packet.source_type||packet.sourceType||'evidence'}]`,
    packet.context_excerpt||packet.contextExcerpt||''
  ].filter(Boolean).join('\n')).join('\n\n');
  return String(joined||safeArray(brief.contextLines||brief.context_lines).join('\n')||workItem.source_packet?.context_excerpt||'').trim().slice(0,28000);
}
function exactEvidencePool(workItem={}){
  const brief=workItem.workingBrief||workItem.working_brief||{};
  return [
    workItem.evidence_quote,
    workItem.exactSourceQuote,
    ...safeArray(workItem.source_refs||workItem.sourceRefs||brief.sourceRefs).map(ref=>ref.quote_or_summary||ref.quoteOrSummary||ref.quote||ref.summary)
  ].map(value=>String(value||'').trim()).filter(Boolean);
}
function validateGeneratedArtifact(result={},workItem={}){
  const missing=safeArray(result.missing_information||result.missingInformation).map(value=>compactText(value,260)).filter(Boolean);
  if(String(result.status||'').toLowerCase()==='needs_information'||missing.length){
    return {ok:false,missingInformation:missing.length?missing:['VAL could not produce a grounded artifact from the current source packet.']};
  }
  const body=String(result.html||result.body||result.content||'').trim();
  if(body.length<80)return {ok:false,missingInformation:['The generated artifact was incomplete.']};
  const source=packetText(workItem);
  const evidencePool=exactEvidencePool(workItem);
  const used=safeArray(result.used_evidence||result.usedEvidence).map(value=>String(value||'').trim()).filter(Boolean);
  const grounded=used.length&&used.every(quote=>source.includes(quote)||evidencePool.some(candidate=>candidate.includes(quote)||quote.includes(candidate)));
  if(!grounded)return {ok:false,missingInformation:['The generated artifact did not preserve an exact, inspectable source citation.']};
  return {ok:true,body,usedEvidence:used};
}
function createPreparedArtifactGenerator({callModel,logger=console}={}){
  return async function generate({artifact={},workItem={}}={}){
    if(typeof callModel!=='function')return {ok:false,missingInformation:['Prepared-work generation is unavailable.']};
    const sourcePacket=packetText(workItem);
    if(!sourcePacket)return {ok:false,missingInformation:['The immutable source packet is missing.']};
    const kind=String(artifact.kind||'document_draft');
    try{
      const raw=await callModel({
        system:[
          'You prepare reviewable work for an executive from a canonical evidence packet.',
          'Use the entire supplied packet. Do not ask the executive to repeat context already present.',
          'Create the actual artifact, not an outline of what could be created and not a list of source excerpts.',
          'Do not invent names, pricing, timing, promises, terms, recipient details, or factual claims.',
          'If an essential fact is absent, return needs_information and name only the missing facts.',
          'For HTML, return complete iframe-ready HTML in the html field. For all other work, return the complete editable draft in body.',
          'Copy at least one exact supporting sentence into used_evidence.',
          'Nothing is sent, published, scheduled, or changed externally.',
          'Return strict JSON only.'
        ].join('\n'),
        user:JSON.stringify({
          required:{
            status:'ready_for_review or needs_information',
            title:'artifact title',
            subject:'email subject when applicable',
            body:'complete editable artifact when not HTML',
            html:'complete HTML only for html_page_draft',
            missing_information:['only truly missing facts'],
            used_evidence:['one or more exact quotes copied from source packet']
          },
          artifactKind:kind,
          intendedTitle:artifact.title||workItem.title||'',
          recipient:artifact.recipientName||artifact.target||'',
          project:workItem.project_name||workItem.projectName||workItem.workingBrief?.projectName||'',
          relationship:workItem.relationship_name||workItem.relationshipName||workItem.workingBrief?.relationshipName||'',
          exactEvidence:exactEvidencePool(workItem),
          canonicalSourcePacket:sourcePacket
        }),
        maxTokens:kind==='html_page_draft'?6000:2600,
        temperature:0.18,
        json:true
      });
      const result=parseJson(raw);
      const validation=validateGeneratedArtifact(result,workItem);
      if(!validation.ok)return validation;
      return {
        ok:true,
        artifact:{
          ...artifact,
          title:compactText(result.title||artifact.title||workItem.title,220),
          subject:compactText(result.subject||artifact.subject||'',240),
          ...(kind==='html_page_draft'?{html:String(result.html||result.body||'').trim()}:{body:String(result.body||result.content||'').trim()}),
          generatedFromCanonicalPacket:true,
          usedEvidence:validation.usedEvidence,
          generatedAt:new Date().toISOString(),
          no_external_action:true
        }
      };
    }catch(error){
      logger.warn?.('[val-prepared-work] generation failed:',error.message);
      return {ok:false,missingInformation:['VAL could not finish preparing this artifact. The full source packet remains attached for retry.']};
    }
  };
}

module.exports={createPreparedArtifactGenerator,validateGeneratedArtifact,packetText};
