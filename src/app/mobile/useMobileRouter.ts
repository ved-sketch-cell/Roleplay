import {useCallback,useEffect,useRef,useState} from 'react';
import {initialRoute,parseRoute,routePath,fallbackRoute,validRoute,type MobileRoute} from './navigation';
type JourneyEntry={roleplayJourney:2;stack:MobileRoute[]};
export function useMobileRouter(){
  const [entry,setEntry]=useState<JourneyEntry>(()=>{
    const route=initialRoute(window.location);
    const existing=window.history.state as JourneyEntry|null;
    return existing?.roleplayJourney===2&&Array.isArray(existing.stack)&&existing.stack.length&&existing.stack.every(validRoute)&&routePath(existing.stack.at(-1)!)===routePath(route)
      ?existing:{roleplayJourney:2,stack:[route]};
  });
  const entryRef=useRef(entry);entryRef.current=entry;
  const route=entry.stack.at(-1)!;
  const scrollRef=useRef<HTMLDivElement>(null);
  const positions=useRef(new Map<string,number>());
  const savePosition=()=>{const main=scrollRef.current;if(main)positions.current.set(routePath(entryRef.current.stack.at(-1)!),main.scrollTop);};
  useEffect(()=>{
    window.history.replaceState(entryRef.current,'','#'+routePath(entryRef.current.stack.at(-1)!));
    const restore=()=>{
      const target=parseRoute(window.location.hash);
      const saved=window.history.state as JourneyEntry|null;
      const next=saved?.roleplayJourney===2&&Array.isArray(saved.stack)&&saved.stack.length&&saved.stack.every(validRoute)&&routePath(saved.stack.at(-1)!)===routePath(target)
        ?saved:{roleplayJourney:2 as const,stack:[...entryRef.current.stack.slice(-63),target]};
      savePosition();entryRef.current=next;setEntry(next);
      window.history.replaceState(next,'','#'+routePath(target));
    };
    window.addEventListener('popstate',restore);window.addEventListener('hashchange',restore);
    return()=>{window.removeEventListener('popstate',restore);window.removeEventListener('hashchange',restore);};
  },[]);
  useEffect(()=>{
    const main=scrollRef.current;main?.scrollTo?.({top:positions.current.get(routePath(route))||0});
    const heading=main?.querySelector<HTMLElement>('h1');
    if(heading){heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});}
  },[routePath(route)]);
  const navigate=useCallback((target:MobileRoute,replace=false)=>{
    const next=validRoute(target)?target:{page:'not-found' as const};
    if(routePath(next)===routePath(entryRef.current.stack.at(-1)!))return;
    savePosition();
    const stack=replace?[...entryRef.current.stack.slice(0,-1),next]:[...entryRef.current.stack.slice(-63),next];
    const state:JourneyEntry={roleplayJourney:2,stack};
    window.history[replace?'replaceState':'pushState'](state,'','#'+routePath(next));
    entryRef.current=state;setEntry(state);
  },[]);
  const back=useCallback(()=>{
    const state=entryRef.current;
    if(state.stack.length>1){window.history.back();return;}
    if(new URLSearchParams(window.location.search).get('embed')==='1'&&window.parent!==window){
      window.parent.postMessage({type:'roleplay-feature-back'},window.location.origin);return;
    }
    navigate(fallbackRoute(state.stack.at(-1)!),true);
  },[navigate]);
  const finish=useCallback((target:MobileRoute)=>{
    const stack=entryRef.current.stack;
    const index=stack.map(routePath).lastIndexOf(routePath(target));
    if(index>=0&&index<stack.length-1)window.history.go(index-stack.length+1);
    else navigate(target,true);
  },[navigate]);
  return {route,navigate,back,finish,scrollRef,canBack:entry.stack.length>1||route.page!=='home'};
}
