import {createContext,useContext,type ReactNode} from 'react';
import {useDeviceState} from './state';
const ActivityScope=createContext('app');
export function FlowStateProvider({scope,children}:{scope:string;children:ReactNode}){return <ActivityScope.Provider value={scope}>{children}</ActivityScope.Provider>;}
export function useFlowState<T>(key:string,fallback:T|(()=>T)){const scope=useContext(ActivityScope);return useDeviceState<T>('flow:'+scope+':'+key,fallback);}
export function useActivityScope(){return useContext(ActivityScope);}

export function resetFlowState(scope:string){try{const prefix='roleplay-mobile:flow:'+scope+':';for(const key of Object.keys(localStorage))if(key.startsWith(prefix))localStorage.removeItem(key);window.dispatchEvent(new Event('storage'));}catch{window.dispatchEvent(new CustomEvent('roleplay-storage-error'));}}
