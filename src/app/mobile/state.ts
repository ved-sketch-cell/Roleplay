import { useCallback,useEffect,useRef,useState,type Dispatch,type SetStateAction } from 'react';
const prefix='roleplay-mobile:';
export const serializeDeviceValue=(value:unknown)=>JSON.stringify(value,(_key,item)=>item instanceof Set?{$roleplayType:'set',values:[...item]}:item);
export function readDeviceValue<T>(key:string,fallback:T):T {
  try{
    const raw=localStorage.getItem(prefix+key);if(raw===null)return fallback;
    const value=JSON.parse(raw,(_key,item)=>item?.$roleplayType==='set'&&Array.isArray(item.values)?new Set(item.values):item);
    if(value===null)return fallback===null?value:fallback;
    if(fallback instanceof Set&&!(value instanceof Set))return fallback;
    if(Array.isArray(fallback)&&!Array.isArray(value))return fallback;
    if(fallback!==null&&!Array.isArray(fallback)&&typeof value!==typeof fallback)return fallback;
    return value;
  }catch{return fallback;}
}
export function writeDeviceValue<T>(key:string,value:T){
  try{localStorage.setItem(prefix+key,serializeDeviceValue(value));window.dispatchEvent(new CustomEvent('roleplay-mobile-state',{detail:{key}}));window.dispatchEvent(new CustomEvent('roleplay-preferences'));}
  catch{window.dispatchEvent(new CustomEvent('roleplay-storage-error'));}
}
export function useDeviceState<T>(key:string,fallback:T|(()=>T)):[T,Dispatch<SetStateAction<T>>] {
  const fallbackRef=useRef(fallback);
  const initial=()=>typeof fallbackRef.current==='function'?(fallbackRef.current as ()=>T)():fallbackRef.current;
  const [stored,setStored]=useState(()=>({key,value:readDeviceValue(key,initial())}));
  const value=stored.key===key?stored.value:readDeviceValue(key,initial());
  const current=useRef({key,value});current.current={key,value};
  if(stored.key!==key)setStored({key,value});
  const setValue=useCallback<Dispatch<SetStateAction<T>>>(action=>{
    const previous=current.current.key===key?current.current.value:readDeviceValue(key,initial());
    const next=typeof action==='function'?(action as (value:T)=>T)(previous):action;
    if(current.current.key===key){current.current={key,value:next};setStored({key,value:next});}
    writeDeviceValue(key,next);
  },[key]);
  useEffect(()=>{
    const sync=(event:Event)=>{
      if(event instanceof CustomEvent&&event.detail?.key!==key)return;
      const next=readDeviceValue(key,initial());
      if(serializeDeviceValue(next)!==serializeDeviceValue(current.current.value)){current.current={key,value:next};setStored({key,value:next});}
    };
    window.addEventListener('storage',sync);window.addEventListener('roleplay-mobile-state',sync);
    return()=>{window.removeEventListener('storage',sync);window.removeEventListener('roleplay-mobile-state',sync);};
  },[key]);
  return [value,setValue];
}
export type LocalReport={id:string;target:string;reason:string;details:string;created:string};
export function saveLocalReport(target:string,reason:string,details:string){
  const reports=readDeviceValue<LocalReport[]>('reports',[]);
  const report={id:crypto.randomUUID(),target,reason,details,created:new Date().toISOString()};
  writeDeviceValue('reports',[...reports,report]);return report;
}
export function completeActivity(id:string,label:string,xp=0){
  const activities=readDeviceValue<{id:string;label:string;xp:number;created:string}[]>('activities',[]);
  if(activities.some(a=>a.id===id))return;
  writeDeviceValue('activities',[...activities,{id,label,xp,created:new Date().toISOString()}]);
  if(xp)writeDeviceValue('xp-balance',readDeviceValue('xp-balance',2840)+xp);
}
export interface MobileIdentity {avatar:string;color:string;username:string;style?:string;}
export const defaultIdentity:MobileIdentity={avatar:'🦊',color:'#8d79f5',username:'FoxExplorer',style:''};
