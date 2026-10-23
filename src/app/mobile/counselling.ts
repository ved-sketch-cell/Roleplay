export const supportTopics=['Stress & overwhelm','Relationships','Confidence & identity','Work & study','Boundaries','Not sure yet'] as const;
export const sessionFormats=['Text','Voice'] as const;
export const sessionLanguages=['English','Hindi','Gujarati'] as const;
export type SessionPreferences={topic:string;format:typeof sessionFormats[number];duration:20|40;language:typeof sessionLanguages[number];timing:'flexible'|'preferred';date:string;time:string;goal:string};
export type SessionDraft=SessionPreferences&{active:boolean;step:1|2|3;editingId:string|null};
export type SessionRequest=SessionPreferences&{id:string;alias:string;created:string;updated:string;status:'saved'|'cancelled'};
export const emptySessionDraft:SessionDraft={active:false,step:1,editingId:null,topic:'',format:'Text',duration:20,language:'English',timing:'flexible',date:'',time:'',goal:''};
const object=(value:unknown):Record<string,unknown>=>value&&typeof value==='object'&&!Array.isArray(value)?value as Record<string,unknown>:{};
function preferences(value:unknown):SessionPreferences{
  const p=object(value);
  return {topic:(supportTopics as readonly unknown[]).includes(p.topic)?p.topic as string:'',format:p.format==='Voice'?'Voice':'Text',duration:p.duration===40?40:20,language:(sessionLanguages as readonly unknown[]).includes(p.language)?p.language as SessionPreferences['language']:'English',timing:p.timing==='preferred'?'preferred':'flexible',date:typeof p.date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(p.date)?p.date:'',time:typeof p.time==='string'&&/^\d{2}:\d{2}$/.test(p.time)?p.time:'',goal:typeof p.goal==='string'?p.goal.slice(0,200):''};
}
export function normalizeSessionDraft(value:unknown):SessionDraft{
  const p=object(value);return {...preferences(p),active:p.active===true,step:p.step===2?2:p.step===3?3:1,editingId:typeof p.editingId==='string'?p.editingId:null};
}
export function normalizeSessionRequests(value:unknown):SessionRequest[]{
  if(!Array.isArray(value))return [];
  const ids=new Set<string>();
  return value.flatMap(value=>{const p=object(value);if(typeof p.id!=='string'||!p.id||ids.has(p.id)||typeof p.created!=='string'||Number.isNaN(Date.parse(p.created)))return [];ids.add(p.id);return [{...preferences(p),id:p.id,alias:typeof p.alias==='string'?p.alias.slice(0,40):'ROLEPLAY guest',created:p.created,updated:typeof p.updated==='string'&&!Number.isNaN(Date.parse(p.updated))?p.updated:p.created,status:p.status==='cancelled'?'cancelled' as const:'saved' as const}];});
}
export function localSessionDate(now=new Date()){return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;}
export function sessionTimeError(p:SessionPreferences,now=new Date()):string{
  if(p.timing==='flexible')return '';
  if(!p.date||!p.time)return 'Choose a preferred date and time, or select “I’m flexible”.';
  const preferred=new Date(`${p.date}T${p.time}:00`);
  if(Number.isNaN(preferred.getTime())||localSessionDate(preferred)!==p.date)return 'Choose a valid date and time.';
  if(preferred.getTime()<=now.getTime())return 'Choose a future date and time. This is a preference, not an available appointment.';
  return '';
}
export function sessionWhen(p:SessionPreferences){
  if(p.timing==='flexible')return 'Flexible timing';
  const date=new Date(`${p.date}T${p.time}:00`);
  if(Number.isNaN(date.getTime()))return 'Preferred timing not set';
  return date.toLocaleString(undefined,{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'})+' · device time';
}
