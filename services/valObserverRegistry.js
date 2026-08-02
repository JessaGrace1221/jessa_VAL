const VAL_OBSERVER_REGISTRY = [
  {
    observerId:'executive_inbox',
    observerName:'Executive Inbox',
    version:'v1',
    promptKey:'executive_inbox',
    truthProtected:'No important human is accidentally neglected.',
    lens:'attention and reply judgment',
    sees:'whether this creates a reply, draft, or inbox decision',
    concern:'communication loops could remain unowned',
    question:'Does this need human judgment?'
  },
  {
    observerId:'relationship',
    observerName:'Relationship',
    version:'v1',
    promptKey:'relationship_project_understanding',
    truthProtected:'Trust compounds over time.',
    lens:'trust and relational warmth',
    sees:'whether this changes trust, warmth, distance, or repair',
    concern:'relationship context could be flattened into a task',
    question:'What changed between people?'
  },
  {
    observerId:'project',
    observerName:'Project',
    version:'v1',
    promptKey:'relationship_project_understanding',
    truthProtected:'Work that creates long-term value continues moving.',
    lens:'project movement and dependencies',
    sees:'whether this changes progress, blockers, ownership, or scope',
    concern:'work could move without a clear project anchor',
    question:'What project does this move?'
  },
  {
    observerId:'capacity',
    observerName:'Capacity',
    version:'v1',
    promptKey:'chief_of_staff',
    truthProtected:'The human remains capable of making good decisions.',
    lens:'tradeoffs and decision quality',
    sees:'whether this adds load, pressure, recovery need, or timing strain',
    concern:'the system could protect output while degrading judgment',
    question:'What does this cost?'
  },
  {
    observerId:'courage',
    observerName:'Courage',
    version:'v1',
    promptKey:'chief_of_staff',
    truthProtected:'The important avoided thing is not hidden behind safe productivity.',
    lens:'truth without comfort',
    sees:'whether this reveals avoidance, directness, or a needed challenge',
    concern:'the hard truth could be softened into politeness',
    question:'What is being avoided?'
  },
  {
    observerId:'delight',
    observerName:'Delight',
    version:'v1',
    promptKey:'chief_of_staff',
    truthProtected:'Joy, curiosity, and connection remain part of effectiveness.',
    lens:'aliveness and restoration',
    sees:'whether this protects curiosity, energy, joy, or human connection',
    concern:'life could disappear from an otherwise effective day',
    question:'Where is life here?'
  },
  {
    observerId:'opportunity',
    observerName:'Opportunity',
    version:'v1',
    promptKey:'crm',
    truthProtected:'Openings with mutual value are noticed before their timing passes.',
    lens:'openings and mutual value',
    sees:'whether this creates timing, demand, introduction, or revenue signal',
    concern:'an opening could be missed because it arrived quietly',
    question:'What opening is present?'
  },
  {
    observerId:'momentum',
    observerName:'Momentum',
    version:'v1',
    promptKey:'momentum',
    truthProtected:'Movement toward meaningful outcomes remains visible.',
    lens:'movement over perfection',
    sees:'whether this creates real movement, friction, or next-step clarity',
    concern:'activity could be mistaken for progress',
    question:'What is moving now?'
  },
  {
    observerId:'meaning',
    observerName:'Meaning',
    version:'v1',
    promptKey:'momentum',
    truthProtected:'Current decisions remain connected to purpose, values, and the larger story.',
    lens:'purpose and wider pattern',
    sees:'whether this connects to values, story, purpose, or recurring themes',
    concern:'execution could drift from what actually matters',
    question:'Why does this matter?'
  },
  {
    observerId:'synchronicity',
    observerName:'Synchronicity',
    version:'v1',
    promptKey:'chief_of_staff',
    truthProtected:'Independent signals arriving together are inspected without being overclaimed.',
    lens:'cross-context convergence',
    sees:'whether this echoes another signal, timing cluster, or repeated arrival',
    concern:'a meaningful pattern could be dismissed as coincidence',
    question:'What is repeating?'
  },
  {
    observerId:'commitment',
    observerName:'Commitment',
    version:'v1',
    promptKey:'transcript_intake',
    truthProtected:'Promises are honored without allowing busyness to define priority.',
    lens:'promises and follow-through',
    sees:'whether this creates, fulfills, or threatens a promise',
    concern:'trust could leak through small unclosed loops',
    question:'What was promised?'
  },
  {
    observerId:'calendar',
    observerName:'Calendar',
    version:'v1',
    promptKey:'calendar_meeting_prep',
    truthProtected:'Time is treated as a strategic asset.',
    lens:'time reality',
    sees:'whether this affects schedule, prep, availability, or timing',
    concern:'time could be treated as flexible when it is not',
    question:'When does this matter?'
  },
  {
    observerId:'environment',
    observerName:'Environment',
    version:'v1',
    promptKey:'event_intelligence_pass',
    truthProtected:'Physical and external conditions remain part of executive context.',
    lens:'conditions around the work',
    sees:'whether this depends on location, travel, body, interruption, or external condition',
    concern:'context outside the screen could be ignored',
    question:'What condition changes this?'
  },
  {
    observerId:'witnessing',
    observerName:'Witnessing',
    version:'v1',
    promptKey:'chief_of_staff',
    truthProtected:'Direct user-revealed truth is not forgotten.',
    lens:'direct user-revealed truth',
    sees:'whether this aligns with or updates what the user has revealed about herself',
    concern:'VAL could advise from data while forgetting the person',
    question:'What did she already tell us?'
  }
].map(definition=>Object.freeze({
  ...definition,
  reads:Object.freeze(['board_packet','source_refs','approved_memory']),
  doesNot:Object.freeze(['recommend','rank','draft','send','mutate_source_truth']),
  outputContract:'observer_receipt_v1'
}));

const DEFAULT_OBSERVERS = Object.freeze(VAL_OBSERVER_REGISTRY.map(({observerName,promptKey})=>Object.freeze({
  observerName,
  promptKey
})));

const OBSERVER_PACKET_LENSES = Object.freeze(Object.fromEntries(
  VAL_OBSERVER_REGISTRY.map(({observerName,lens,sees,concern,question})=>[
    observerName,
    Object.freeze({lens,sees,concern,question})
  ])
));

function observerDefinition(observerName=''){
  return VAL_OBSERVER_REGISTRY.find(definition=>definition.observerName===String(observerName||''))||null;
}

function publicObserverDefinitions(){
  return VAL_OBSERVER_REGISTRY.map(definition=>({
    observerId:definition.observerId,
    observerName:definition.observerName,
    version:definition.version,
    truthProtected:definition.truthProtected,
    question:definition.question,
    outputContract:definition.outputContract
  }));
}

function publicObserverBlockDefinitions(){
  return VAL_OBSERVER_REGISTRY.map(definition=>({
    blockType:'observer',
    definitionRef:`${definition.observerId}@${definition.version}`,
    observerId:definition.observerId,
    observerName:definition.observerName,
    version:definition.version,
    truthProtected:definition.truthProtected,
    question:definition.question,
    accepts:[...definition.reads],
    triggers:['scheduled_briefing','explicit_refresh','witnessing_complete','approved_correction','authorized_source_run'],
    emits:[definition.outputContract],
    handoffs:['observer','round_table','chief_of_staff'],
    externalActionPolicy:'never',
    terminalStates:['observed','no_meaningful_signal','needs_context','retryable_failure','permanent_failure']
  }));
}

module.exports={
  VAL_OBSERVER_REGISTRY,
  DEFAULT_OBSERVERS,
  OBSERVER_PACKET_LENSES,
  observerDefinition,
  publicObserverDefinitions,
  publicObserverBlockDefinitions
};
