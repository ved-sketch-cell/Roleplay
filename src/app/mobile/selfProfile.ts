import {useDeviceState} from './state';

export const selfProfileSections=['vibe','mindset','boundaries'] as const;
export type SelfProfileSection=typeof selfProfileSections[number];
export const sectionTitle={vibe:'Vibe',mindset:'Mindset',boundaries:'Boundaries'} as const;
export const moodOptions=[{value:'Curious',emoji:'🔍'},{value:'Calm',emoji:'🌿'},{value:'Energized',emoji:'⚡'},{value:'Creative',emoji:'🎨'},{value:'Reflective',emoji:'🌙'},{value:'Quiet',emoji:'☁️'},{value:'Open to connect',emoji:'✨'}];
export const vibeChoices={
  battery:['Low-key','Balanced','High'],
  intent:['A little company','Ideas & connection','Play a game','Build & learn','Slow conversations'],
  pace:['No rush','Short exchanges','Room to think','Easy back-and-forth'],
  style:['Thoughtful & playful','Reflective & gentle','Direct & upbeat','Expressive & imaginative','Go with the flow'],
  feedback:['Listen first','Ask before advice','Gentle suggestions','Clear, kind feedback'],
};
export const valueOptions=['Curiosity','Kindness','Honesty','Creativity','Respect','Independence','Humour','Patience'];
export const boundaryTopics=['Conversation games','Playful banter','Respectful debate','Giving advice','Personal questions','Heavy topics','Voice calls','Private contact details','Sharing screenshots'] as const;
export type BoundaryChoice=''|'okay'|'ask'|'off';
export const boundaryChoices=[{value:'okay',label:'Comfortable'},{value:'ask',label:'Ask first'},{value:'off',label:'Off limits'}] as const;
export interface SelfProfile {
  vibe:{mood:string;battery:string;intent:string;pace:string;style:string;feedback:string;languages:string};
  mindset:{preferences:(number|null)[];values:string[];learning:string};
  boundaries:{topics:Record<string,BoundaryChoice>;note:string};
}
export const defaultSelfProfile:SelfProfile={vibe:{mood:'',battery:'',intent:'',pace:'',style:'',feedback:'',languages:''},mindset:{preferences:[null,null,null,null,null],values:[],learning:''},boundaries:{topics:{},note:''}};
const limitedText=(value:unknown,max:number)=>typeof value==='string'?value.slice(0,max):'';
// Device data may come from an older export or malformed storage. Keep every form safe to open.
export function normalizeSelfProfile(raw:unknown):SelfProfile {
  const p=raw&&typeof raw==='object'?raw as Partial<SelfProfile>:{};
  const vibe={...defaultSelfProfile.vibe};
  vibe.mood=moodOptions.some(x=>x.value===p.vibe?.mood)?p.vibe!.mood:'';
  for(const key of Object.keys(vibeChoices) as (keyof typeof vibeChoices)[])vibe[key]=vibeChoices[key].includes(p.vibe?.[key]||'')?p.vibe![key]:'';
  vibe.languages=limitedText(p.vibe?.languages,60);
  const preferences=Array.from({length:5},(_,i)=>{const v=p.mindset?.preferences?.[i];return typeof v==='number'&&Number.isInteger(v)&&v>=1&&v<=5?v:null;});
  const values=Array.isArray(p.mindset?.values)?[...new Set(p.mindset.values.filter(v=>typeof v==='string'&&valueOptions.includes(v)))].slice(0,4):[];
  const topics:Record<string,BoundaryChoice>={};
  for(const topic of boundaryTopics){const v=p.boundaries?.topics?.[topic];if(boundaryChoices.some(c=>c.value===v))topics[topic]=v!;}
  return {vibe,mindset:{preferences,values,learning:limitedText(p.mindset?.learning,120)},boundaries:{topics,note:limitedText(p.boundaries?.note,240)}};
}
export function useSelfProfile(){
  const [raw,setProfile]=useDeviceState<SelfProfile>('self-conversation-profile',defaultSelfProfile);
  return [normalizeSelfProfile(raw),setProfile] as const;
}
