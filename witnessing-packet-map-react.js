import React,{useEffect,useMemo,useState} from 'https://esm.sh/react@18.3.1';
import {createRoot} from 'https://esm.sh/react-dom@18.3.1/client';

const h=React.createElement;

function titleCase(value=''){
  return String(value).replace(/_/g,' ').replace(/\b\w/g,letter=>letter.toUpperCase());
}

function DetailPanel({selected,data}){
  if(!selected){
    return h('aside',{className:'detail-panel'},
      h('p',{className:'detail-kicker'},'Select a path'),
      h('h3',null,'Choose an observer or packet.'),
      h('p',null,'The map shows only architecture. It does not reveal your Witnessing answers, source content, or relationship data.'),
      h('div',{className:'detail-note'},data?.evidenceBoundary||'')
    );
  }
  const retrieval=Array.isArray(selected.retrieval)?selected.retrieval:selected.retrieval?.path||[];
  const variables=Array.isArray(selected.variables)?selected.variables:[];
  return h('aside',{className:'detail-panel','aria-live':'polite'},
    h('p',{className:'detail-kicker'},selected.type==='observer'?'Observer':selected.type==='inherited_packet'?'Inherited packet':'Direct retrieval path'),
    h('h3',null,selected.label),
    h('p',null,selected.description||selected.output||selected.stores||'This is a bounded part of VAL’s evidence flow.'),
    h('h4',null,'Witnessing retrieval'),
    h('ol',{className:'detail-list'},retrieval.map((item,index)=>h('li',{key:index},h('code',null,item)))),
    variables.length?h('section',null,
      h('h4',null,'Packet variables'),
      h('ul',{className:'detail-list'},variables.map((item,index)=>h('li',{key:index},
        h('code',null,item.variable),h('br'),h('span',null,item.provider+' - '+item.source)
      )))
    ):null,
    selected.downstream?.length?h('div',{className:'detail-note'},
      h('strong',null,'Feeds next: '),selected.downstream.map(titleCase).join(', ')
    ):null,
    selected.purpose?.length?h('div',{className:'detail-note'},
      h('strong',null,'Used for: '),selected.purpose.join(', ')
    ):null
  );
}

function App(){
  const [data,setData]=useState(null);
  const [error,setError]=useState('');
  const [filter,setFilter]=useState('all');
  const [selected,setSelected]=useState(null);

  async function load(){
    setError('');
    try{
      const response=await fetch('/api/val/architecture/witnessing-packet-map',{cache:'no-store'});
      const next=await response.json();
      if(!response.ok||!next.ok)throw new Error(next.error||'The architecture map is unavailable.');
      setData(next);
      setSelected({
        ...next.sourceRoot,
        type:'source_root',
        description:next.sourceRoot.stores,
        purpose:[next.sourceRoot.firstLookRule]
      });
    }catch(loadError){
      setError(loadError.message||'The architecture map is unavailable.');
    }
  }

  useEffect(()=>{load();},[]);
  const packets=useMemo(()=>{
    if(!data)return [];
    return data.packets.filter(packet=>filter==='all'||(filter==='direct'?packet.type==='hydrated_packet':packet.type==='inherited_packet'));
  },[data,filter]);
  if(error){
    return h('main',{className:'error'},h('h1',null,'The map could not load.'),h('p',null,error),h('button',{type:'button',onClick:load},'Try again'));
  }
  if(!data){
    return h('main',{className:'map-shell'},h('p',{className:'eyebrow'},'VAL architecture'),h('h1',null,'Loading the map...'));
  }
  const flow=[
    {label:'Witnessing Session',caption:'Direct answers with source provenance',kind:'source',item:{...data.sourceRoot,type:'source_root',description:data.sourceRoot.stores,purpose:[data.sourceRoot.firstLookRule]}},
    {label:'First Look',caption:'Reads all approved sources once',kind:'context',item:{...data.firstLook,type:'first_look',description:data.firstLook.output}},
    {label:'Shared Context',caption:'Bounded root for observer work',kind:'context',item:{...data.sharedContext,type:'context',description:data.sharedContext.output,retrieval:data.sharedContext.retrieval.path}},
    {label:'Round Table',caption:'Synthesizes observer judgment',kind:'roundtable',item:{...data.roundTable,type:'round_table',description:data.roundTable.output}},
    {label:'Chief of Staff',caption:'Prepares next move for approval',kind:'output',item:{...data.chiefOfStaff,type:'chief',description:data.chiefOfStaff.output}}
  ];
  return h('main',{className:'map-shell'},
    h('header',null,
      h('div',{className:'map-topline'},
        h('p',{className:'eyebrow'},'VAL architecture map'),
        h('span',{className:'generated'},'Live contract generated '+new Date(data.generatedAt).toLocaleString())
      ),
      h('h1',null,data.title),
      h('p',{className:'intro'},'A transparent path from what a person tells VAL to the judgment and prepared work that can eventually appear in a drawer. No answer becomes an action just because it was read.'),
      h('div',{className:'principle'},h('strong',null,'Operating rule'),h('span',null,data.governingRule))
    ),
    h('section',{className:'flow','aria-label':'Witnessing to work flow'},flow.map(step=>h('button',{
      type:'button',className:'flow-step '+step.kind,key:step.label,onClick:()=>setSelected(step.item)
    },h('b',null,step.label),h('span',null,step.caption)))),
    h('section',null,
      h('div',{className:'section-title'},h('h2',null,'Observer Suite'),h('p',null,'Each receives the shared context root, then takes only evidence relevant to its responsibility.')),
      h('div',{className:'observer-grid'},data.observers.map(observer=>h('button',{
        type:'button',className:'observer-card',key:observer.id,'aria-pressed':selected?.id===observer.id,onClick:()=>setSelected({...observer,type:'observer',description:'Receives the shared context packet before forming its own evidence-bounded observation.'})
      },h('span',{className:'card-label'},observer.label),h('span',{className:'card-caption'},observer.promptKey))))
    ),
    h('section',{className:'architecture-grid'},
      h('div',{className:'packets-panel'},
        h('div',{className:'packets-toolbar'},
          h('h3',null,'Every active packet'),
          h('div',{className:'filter-group'},[
            ['all','All'],['direct','Direct root'],['inherited','Inherited']
          ].map(([id,label])=>h('button',{key:id,type:'button',className:'filter-button','aria-pressed':filter===id,onClick:()=>setFilter(id)},label)))
        ),
        h('div',{className:'packet-grid'},packets.map(packet=>h('button',{
          type:'button',key:packet.id,className:'packet-card '+(packet.type==='hydrated_packet'?'direct':'inherited'),
          'aria-pressed':selected?.id===packet.id,onClick:()=>setSelected({...packet,description:packet.type==='hydrated_packet'?'Reads the shared Witnessing root directly through the listed packet variables.':'Receives Witnessing context only through the selected upstream packet receipt.'})
        },h('span',{className:'packet-kind'},packet.type==='hydrated_packet'?'Direct shared root':'Inherited upstream context'),h('span',{className:'card-label'},packet.label),h('span',{className:'card-caption'},packet.type==='hydrated_packet'?'Has an explicit hydration contract.':'No independent hydration contract is registered yet.'))),
        !packets.length?h('p',{className:'empty'},'No packets match this filter.'):null)
      ),
      h(DetailPanel,{selected,data})
    )
  );
}

createRoot(document.getElementById('root')).render(h(App));
