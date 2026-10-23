import { dailyDeckCard } from './dailyDeck';
import {selfProfileSections} from './selfProfile';
import {challengeIds} from './challengeCatalog';
import {aiBot} from './aiBots';
export const tabs = ['home','discover','live','challenges','profile'] as const;
export type MobileTab = typeof tabs[number];
export const details = ['avatar','event','quiz','factcheck','accesscode','counselor','counselling','guild','scenarios','affinity','xpeconomy','trustprofile','arbitration','growfeature','healfeature','chatgames','fractured'] as const;
export const growIds = ['shadow-simulator','scenario-spinner','skill-tree-journal','vulnerability-staircase','text-escape-room','blind-empathy-swap','mentorship-gauntlet','crucible-debates','lore-bounties'];
export const healIds = ['lantern-garden','reframing-loom','pulse-sync','kintsugi-canvas','pace-maker','boundary-sentinels','ebb-and-flow-ui'];
export const gameIds = ['storm-shelter','base-camp','phoenix-workshop','bridge-builders','anchor-points','the-long-road','thought-courtroom','reframe-radio','worry-parking-lot','two-lenses','whatif-mapmaker','two-truths-mask','campfire-stories','starship-crew','village-builders','time-capsule-swap'];
export type MobilePage = MobileTab | typeof details[number] | 'categories' | 'interests' | 'preferences' | 'matches' | 'chat' | 'bot' | 'person' | 'selfprofile' | 'challenge' | 'search' | 'not-found';
export type MobileRoute = {page:MobilePage;id?:string;step?:string;mode?:'edit';deck?:string};
export const roomIds=['cricket-pavilion','midnight-confessions','frequency-room','deep-dive','iron-hour','stillwater','hustle-lab','roleplay-theatre','shadow-talk'];
const allPages:string[] = [...tabs,...details,'categories','interests','preferences','matches','chat','bot','person','selfprofile','challenge','search'];
const chatId = (id?:string) => !!id && /^(?:[1-9]|10)$/.test(id);
const safeId = (id?:string) => !!id && /^[a-z0-9-]{1,80}$/.test(id);
export function validRoute(route:MobileRoute):boolean {
  if(!route||typeof route!=='object'||typeof route.page!=='string')return false;
  if(route.deck && (!['chat','person'].includes(route.page) || !dailyDeckCard(route.deck)))return false;
  if(route.mode&&!['categories','interests'].includes(route.page))return false;
  if(route.step&&route.page!=='live')return false;
  if (!allPages.includes(route.page)) return route.page === 'not-found';
  if (route.page === 'chat' || route.page === 'person') return chatId(route.id);
  if (route.page === 'bot') return !!aiBot(route.id);
  if (route.page === 'selfprofile') return (selfProfileSections as readonly string[]).includes(route.id||'');
  if (route.page === 'challenge') return (challengeIds as readonly string[]).includes(route.id||'');
  if (route.page === 'growfeature') return growIds.includes(route.id||'');
  if (route.page === 'healfeature') return healIds.includes(route.id||'');
  if (route.page === 'chatgames' && route.id) return gameIds.includes(route.id);
  if (route.page === 'interests') return safeId(route.id) && (!route.mode || route.mode==='edit');
  if (route.page === 'categories') return !route.id && !route.step && (!route.mode || route.mode==='edit');
  if (route.page === 'live') return (!route.id || roomIds.includes(route.id)) && !(route.id&&route.step) && (!route.step || ['setup','preview','live'].includes(route.step));
  return !route.id && !route.step && !route.mode;
}
export function routePath(route:MobileRoute):string {
  if (!validRoute(route)) return '/not-found';
  const id=route.id?'/'+encodeURIComponent(route.id):'';
  if(route.page==='live'&&route.step)return `/live/create/${route.step}`;
  if(route.page==='live'&&route.id)return '/live/room'+id;
  return '/'+route.page+id+(route.mode?'?mode=edit':route.deck?'?deck='+encodeURIComponent(route.deck):'');
}
export function parseRoute(hash:string):MobileRoute {
  try {
    const url=new URL(hash.replace(/^#/, '')||'/', 'https://roleplay.invalid');
    const parts=url.pathname.replace(/\/+$/, '').split('/').filter(Boolean).map(decodeURIComponent);
    if (!parts.length) return {page:'home'};
    let candidate:MobileRoute;
    if(parts[0]==='live'&&parts[1]==='room'&&parts.length===3)candidate={page:'live',id:parts[2]};
    else if(parts[0]==='live'&&parts[1]==='create'&&parts.length===3)candidate={page:'live',step:parts[2]};
    else if(parts.length<=2)candidate={page:parts[0] as MobilePage,...(parts[1]?{id:parts[1]}:{}),...(url.searchParams.get('mode')==='edit'?{mode:'edit' as const}:{})};
    else return {page:'not-found'};
    if(url.searchParams.has('deck')) {candidate.deck=url.searchParams.get('deck') || '';if(!candidate.deck)return {page:'not-found'};}
    return validRoute(candidate)?candidate:{page:'not-found'};
  } catch {return {page:'not-found'};}
}
export function initialRoute(location:{hash:string;search:string}):MobileRoute {
  if(location.hash&&location.hash!=='#')return parseRoute(location.hash);
  const params=new URLSearchParams(location.search);
  const page=params.get('feature')||params.get('screen')||'home';
  const candidate:MobileRoute={page:page as MobilePage,...(['growfeature','healfeature'].includes(page)?{id:params.get('id')||''}:{})};
  return validRoute(candidate)?candidate:{page:'not-found'};
}
export function fallbackRoute(route:MobileRoute):MobileRoute {
  if(route.page==='person')return {page:'chat',id:route.id,...(route.deck?{deck:route.deck}:{})};
  if(route.page==='chat'&&route.deck)return {page:'scenarios'};
  if(route.page==='chatgames'&&route.id)return {page:'chatgames'};
  if(route.page==='live'&&(route.id||route.step))return {page:'live'};
  if(route.page==='interests')return {page:'categories',...(route.mode?{mode:route.mode}:{})};
  if(route.page==='preferences')return {page:'categories'};
  if(route.page==='matches')return {page:'discover'};
  if(['avatar','accesscode','trustprofile','selfprofile'].includes(route.page))return {page:'profile'};
  if(['quiz','factcheck','challenge','counselling'].includes(route.page))return {page:'challenges'};
  if(route.page==='categories'&&route.mode==='edit')return {page:'profile'};
  if(['categories','event'].includes(route.page))return {page:'discover'};
  return {page:'home'};
}
export function routeTab(route:MobileRoute):MobileTab {
  if((tabs as readonly string[]).includes(route.page))return route.page as MobileTab;
  if(['categories','interests','preferences','matches','event','affinity'].includes(route.page))return 'discover';
  if(['avatar','accesscode','trustprofile','selfprofile'].includes(route.page))return 'profile';
  if(['quiz','factcheck','xpeconomy','challenge','counselling'].includes(route.page))return 'challenges';
  return 'home';
}
