const DEFAULT_BOARD_BRIEFING_SLOTS = Object.freeze([
  {id:'morning',hour:6,minute:0,label:'Morning briefing'},
  {id:'midday',hour:12,minute:0,label:'Midday briefing'},
  {id:'evening',hour:17,minute:0,label:'End-of-day briefing'}
]);

function localDateTimeParts(now=new Date(),timeZone='America/New_York'){
  const formatter=new Intl.DateTimeFormat('en-CA',{
    timeZone,
    year:'numeric',
    month:'2-digit',
    day:'2-digit',
    hour:'2-digit',
    minute:'2-digit',
    hourCycle:'h23'
  });
  const parts=Object.fromEntries(formatter.formatToParts(now).map(part=>[part.type,part.value]));
  return {
    localDate:`${parts.year}-${parts.month}-${parts.day}`,
    hour:Number(parts.hour)||0,
    minute:Number(parts.minute)||0
  };
}

function currentBoardBriefingSlot({
  now=new Date(),
  timeZone='America/New_York',
  slots=DEFAULT_BOARD_BRIEFING_SLOTS
}={}){
  const local=localDateTimeParts(now,timeZone);
  const currentMinute=local.hour*60+local.minute;
  const eligible=slots
    .filter(slot=>(slot.hour*60+slot.minute)<=currentMinute)
    .sort((a,b)=>(b.hour*60+b.minute)-(a.hour*60+a.minute))[0]||null;
  if(!eligible)return null;
  return {
    ...eligible,
    localDate:local.localDate,
    key:`${local.localDate}:${eligible.id}`,
    sourceId:`board_briefing:${local.localDate}:${eligible.id}`,
    timeZone
  };
}

function nextBoardBriefingSlot({
  now=new Date(),
  timeZone='America/New_York',
  slots=DEFAULT_BOARD_BRIEFING_SLOTS
}={}){
  const local=localDateTimeParts(now,timeZone);
  const currentMinute=local.hour*60+local.minute;
  const next=slots
    .slice()
    .sort((a,b)=>(a.hour*60+a.minute)-(b.hour*60+b.minute))
    .find(slot=>(slot.hour*60+slot.minute)>currentMinute);
  return next||slots[0];
}

module.exports={
  DEFAULT_BOARD_BRIEFING_SLOTS,
  localDateTimeParts,
  currentBoardBriefingSlot,
  nextBoardBriefingSlot
};
