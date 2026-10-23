import {readDeviceValue} from './state';
import {newGameSession, type GameSession} from './gameCatalog';

// Preserve notes and completion from the earlier game implementations.
export function existingGameSession(id:string, scope:string):GameSession {
  const get=(key:string):unknown=>readDeviceValue('flow:'+scope+':'+key,null);
  const names:Record<string,string>={'storm-shelter':'StormShelter','base-camp':'BaseCamp','phoenix-workshop':'PhoenixWorkshop','bridge-builders':'BridgeBuilders','anchor-points':'AnchorPoints','the-long-road':'TheLongRoad','thought-courtroom':'ThoughtCourtroom','reframe-radio':'ReframeRadio','worry-parking-lot':'WorryParkingLot','two-lenses':'TwoLenses','whatif-mapmaker':'WhatIfMapmaker','two-truths-mask':'TwoTruthsMask','campfire-stories':'CampfireStories','starship-crew':'StarshipCrew','village-builders':'VillageBuilders','time-capsule-swap':'TimeCapsuleSwap'};
  const name=names[id], entries:{label:string;text:string}[]=[];
  const add=(label:string,text:unknown)=>{if(typeof text==='string'&&text.trim())entries.push({label,text});};
  for(const key of ['turns','planks','answers','challenges','lines','responses','additions','worries','entries']) {
    const values=get(name+'.'+key);
    if(!Array.isArray(values))continue;
    values.forEach((value,index)=>{
      if(typeof value==='string')add('Saved answer '+(index+1),value);
      else if(value&&typeof value==='object'){
        if(value.mine===false)return;
        add(value.camp||'Saved answer '+(index+1),value.text||value.setback);
        if(value.step)add('Next step',value.step);
        if(value.time)add('Revisit time',value.time);
      }
    });
  }
  const fields:Record<string,string[]>={'phoenix-workshop':['objectDesc','lifeDesc'],'thought-courtroom':['thought','prosecution','defense','verdict'],'reframe-radio':['thought','broadcast'],'two-lenses':['situation','gloomy','fair'],'whatif-mapmaker':['fear','worst','realistic','cope'],'two-truths-mask':['s1','s2','s3'],'time-capsule-swap':['note']};
  for(const field of fields[id]||[])add(field.replace(/([A-Z])/g,' $1'),get(name+'.'+field));
  if(!entries.length)return newGameSession();
  const complete=get(name+'.done')===true||get(name+'.step')==='done'||get(name+'.phase')==='reviewing';
  return {...newGameSession(),status:complete?'complete':'intro',legacy:{complete,entries}};
}
