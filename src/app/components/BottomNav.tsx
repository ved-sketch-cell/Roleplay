import { House,Compass,Trophy,UserRound,AudioLines } from 'lucide-react';
type Screen='home'|'discover'|'challenges'|'live'|'profile';
export function BottomNav({currentScreen,onNavigate}:{currentScreen:string;onNavigate:(screen:Screen)=>void}) {
  const items=[{id:'home',label:'Home',icon:House},{id:'discover',label:'Discover',icon:Compass},{id:'live',label:'Live',icon:AudioLines},{id:'challenges',label:'Challenges',icon:Trophy},{id:'profile',label:'Profile',icon:UserRound}] as const;
  return <nav className="roleplay-bottom-nav" aria-label="Main app navigation">{items.map(item=><button data-tab={item.id} key={item.id} aria-current={currentScreen===item.id?'page':undefined} onClick={()=>onNavigate(item.id)}><span className="mobile-nav-icon"><item.icon size={22} strokeWidth={currentScreen===item.id?2.5:1.8}/></span><span>{item.label}</span></button>)}</nav>;
}
