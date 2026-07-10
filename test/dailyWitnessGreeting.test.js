const test=require('node:test');
const assert=require('node:assert/strict');
const {
  buildDailyWitnessGreeting,
  collectDailyWitnessEvidence,
  extractDailyWitnessMeaning,
  resolveDailyWitnessContradictions,
  selectGreetingIntent,
  isGenericDailyWitnessSignal
}=require('../services/dailyWitnessGreeting');

test('Daily Witness separates evidence from meaning before composing greeting',()=>{
  const now=new Date('2026-07-04T09:00:00-04:00');
  const evidence=collectDailyWitnessEvidence({
    now,
    clientName:'Jessa Grace',
    evidenceItems:[
      {id:'cal-1',sourceType:'calendar',title:'Five meetings yesterday',summary:'Meeting call demo meeting appointment until 7 PM',occurredAt:'2026-07-03T20:00:00-04:00'},
      {id:'tr-1',sourceType:'transcript',title:'Frisson breakthrough',summary:'Strategic breakthrough with some frustration and difficult decisions',occurredAt:'2026-07-03T16:00:00-04:00'}
    ],
    drafts:[{id:'draft-1',subject:'Acme proposal',body:'Proposal draft ready for review',createdAt:'2026-07-03T15:00:00-04:00'}]
  });
  const meaning=extractDailyWitnessMeaning({evidence,now});
  assert.ok(evidence.length>=3);
  assert.match(meaning.effort_read,/context switching|emotional effort/i);
  assert.ok(meaning.meaning_candidates.some(m=>/context switching|emotional/i.test(m.meaning)));
});

test('Daily Witness chooses restraint when evidence conflicts or confidence is low',()=>{
  const now=new Date('2026-07-04T09:00:00-04:00');
  const meaning=extractDailyWitnessMeaning({now,evidence:[{
    source_type:'calendar',
    source_id:'maybe-sensitive',
    title:'Court conflict',
    summary:'Court filing and calendar conflict, unclear details',
    occurred_at:'2026-07-03T12:00:00-04:00',
    confidence:0.42,
    sensitivity:'high'
  }]});
  const resolution=resolveDailyWitnessContradictions({meaning});
  const greeting=buildDailyWitnessGreeting({now,clientName:'Jessa Grace',evidenceItems:[{id:'maybe-sensitive',sourceType:'calendar',title:'Court conflict',summary:'Court filing and calendar conflict, unclear details',occurredAt:'2026-07-03T12:00:00-04:00'}]});
  assert.ok(['choose_restraint','defer_to_silence','synthesize'].includes(resolution.resolution));
  assert.ok(greeting.internalUnderstanding.things_intentionally_not_mentioned.length>=1);
  assert.doesNotMatch(greeting.display_greeting,/court|filing|conflict/i);
});

test('Daily Witness records greeting intent as an act of service',()=>{
  const intent=selectGreetingIntent({state:'recovery_morning',meaning:{metrics:{meetingCount:5,emotionalHits:2}}});
  assert.equal(intent.primary_intent,'encourage_rest');
  assert.equal(intent.secondary_intent,'protect');
});

test('Daily Witness can say less on quiet mornings',()=>{
  const greeting=buildDailyWitnessGreeting({
    now:new Date('2026-07-07T08:30:00-04:00'),
    clientName:'Jessa Grace',
    evidenceItems:[]
  });
  assert.equal(greeting.moment_type,'quiet_morning');
  assert.ok(greeting.greeting_lines.length<=3);
  assert.match(greeting.display_greeting,/Good morning|spacious|clear|quiet/i);
});

test('Daily Witness does not let repeated generic email risk text drive the greeting',()=>{
  const now=new Date('2026-07-10T11:30:00-04:00');
  const moves=Array.from({length:40},(_,index)=>({
    id:'generic-'+index,
    title:'Review risk: Email may contain a risk, blocker, or relationship concern.',
    why:'Email may contain a risk, blocker, or relationship concern.',
    whatChanged:'Email may contain a risk, blocker, or relationship concern.',
    confidence:0.75,
    createdAt:'2026-07-10T10:00:00-04:00'
  }));
  const greeting=buildDailyWitnessGreeting({now,clientName:'Jessa Grace',moves});
  assert.equal(isGenericDailyWitnessSignal('Email may contain a risk, blocker, or relationship concern.'),true);
  assert.notEqual(greeting.moment_type,'exceptional_event');
  assert.doesNotMatch(greeting.display_greeting,/Today deserves care, not extra noise/i);
  assert.doesNotMatch(greeting.what_it_cost_or_represented,/ordinary work context/i);
  assert.equal(greeting.evidence.length,0);
});

test('Daily Witness does not treat operational brand words as sensitive events',()=>{
  const greeting=buildDailyWitnessGreeting({
    now:new Date('2026-07-10T11:30:00-04:00'),
    clientName:'Jessa Grace',
    evidenceItems:[
      {id:'healthbridge',sourceType:'project',title:'HealthBridge expansion update',summary:'Review project follow-up and renewal notes.',occurredAt:'2026-07-10T10:00:00-04:00'},
      {id:'missed-call',sourceType:'task',title:'Build missed-call text-back workflow',summary:'Complete the missed-call text-back workflow.',occurredAt:'2026-07-10T10:15:00-04:00'}
    ]
  });
  assert.notEqual(greeting.moment_type,'exceptional_event');
  assert.doesNotMatch(greeting.display_greeting,/Today deserves care, not extra noise/i);
});

test('Daily Witness still responds to concrete sensitive evidence with restraint',()=>{
  const now=new Date('2026-07-10T11:30:00-04:00');
  const greeting=buildDailyWitnessGreeting({
    now,
    clientName:'Jessa Grace',
    evidenceItems:[{
      id:'specific-sensitive',
      sourceType:'calendar',
      title:'Court hearing with Morgan',
      summary:'Court hearing moved and needs privacy around the schedule.',
      occurredAt:'2026-07-10T09:00:00-04:00',
      confidence:0.82
    }]
  });
  assert.equal(greeting.moment_type,'exceptional_event');
  assert.match(greeting.display_greeting,/sensitive evidence|private on Home/i);
  assert.doesNotMatch(greeting.display_greeting,/Court hearing|Morgan/i);
  assert.doesNotMatch(greeting.what_it_cost_or_represented,/ordinary work context/i);
  assert.ok(greeting.internalUnderstanding.things_intentionally_not_mentioned.length>=1);
});

test('Daily Witness protects weekends and holidays unless work earns attention',()=>{
  const greeting=buildDailyWitnessGreeting({
    now:new Date('2026-07-04T08:30:00-04:00'),
    clientName:'Jessa Grace',
    evidenceItems:[]
  });
  assert.equal(greeting.moment_type,'weekend_holiday');
  assert.match(greeting.display_greeting,/lighter than a workday|weekend/i);
  assert.match(greeting.permission_line,/truly earns attention/i);
  assert.equal(greeting.voice_note,'protect_rest');
});

test('Daily Witness witnesses effort rather than reporting counts',()=>{
  const greeting=buildDailyWitnessGreeting({
    now:new Date('2026-07-04T09:00:00-04:00'),
    clientName:'Jessa Grace',
    evidenceItems:[
      {id:'cal-heavy',sourceType:'calendar',title:'Meeting day',summary:'meeting call meeting appointment demo meeting late calendar',occurredAt:'2026-07-03T18:30:00-04:00'}
    ]
  });
  assert.match(greeting.display_greeting,/asked|noise|gentle|space|context/i);
  assert.doesNotMatch(greeting.display_greeting,/\b\d+\s+(meetings|tasks|emails)\b/i);
  assert.ok(greeting.finalGate.passed);
});
