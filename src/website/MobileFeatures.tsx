import { useEffect } from 'react';
import { ArrowLeft, ArrowUpRight, Sparkles } from 'lucide-react';

type Feature={id:string;name:string;emoji:string;description:string;feature:string;group:string};
export const mobileFeatures:Feature[]=[
 {id:'scenarios',name:'Daily Deck',emoji:'🎴',description:'Five cards. New perspectives.',feature:'scenarios',group:'play'},
 {id:'chatgames',name:'Chat Games',emoji:'🎮',description:'Games that spark a conversation.',feature:'chatgames',group:'play'},
 {id:'affinity',name:'Affinity',emoji:'🧬',description:'Find your wavelength.',feature:'affinity',group:'connect'},
 {id:'xpeconomy',name:'XP Economy',emoji:'⭐',description:'Your streaks, rewards, and progress.',feature:'xpeconomy',group:'play'},
 {id:'shadow-simulator',name:'Shadow Simulator',emoji:'🪞',description:'Meet your reflection.',feature:'growfeature',group:'grow'},
 {id:'scenario-spinner',name:'Scenario Spinner',emoji:'🎲',description:'A fresh branching dilemma.',feature:'growfeature',group:'grow'},
 {id:'skill-tree-journal',name:'Skill-Tree Journal',emoji:'📖',description:'Write. Reflect. Level up.',feature:'growfeature',group:'grow'},
 {id:'vulnerability-staircase',name:'Vulnerability Staircase',emoji:'🪜',description:'Small steps toward connection.',feature:'growfeature',group:'grow'},
 {id:'text-escape-room',name:'Text Escape Room',emoji:'🔐',description:'Two minds. One way out.',feature:'growfeature',group:'grow'},
 {id:'blind-empathy-swap',name:'Blind Empathy Swap',emoji:'🔄',description:'Try another perspective.',feature:'growfeature',group:'grow'},
 {id:'mentorship-gauntlet',name:'Mentorship Gauntlet',emoji:'🎓',description:'Grow together over seven days.',feature:'growfeature',group:'grow'},
 {id:'crucible-debates',name:'Crucible Debates',emoji:'🔥',description:'Different roles. Shared respect.',feature:'growfeature',group:'grow'},
 {id:'lore-bounties',name:'Lore Bounties',emoji:'📜',description:'Shape your community’s story.',feature:'growfeature',group:'grow'},
 {id:'lantern-garden',name:'Lantern Garden',emoji:'🏮',description:'Let a little weight go.',feature:'healfeature',group:'heal'},
 {id:'reframing-loom',name:'Reframing Loom',emoji:'🧵',description:'Weave a kinder perspective.',feature:'healfeature',group:'heal'},
 {id:'pulse-sync',name:'Pulse Sync',emoji:'💗',description:'Find a shared rhythm.',feature:'healfeature',group:'heal'},
 {id:'kintsugi-canvas',name:'Kintsugi Canvas',emoji:'🏺',description:'Build something beautiful together.',feature:'healfeature',group:'heal'},
 {id:'pace-maker',name:'Pace-Maker',emoji:'⏱️',description:'Pause. Breathe. Come back.',feature:'healfeature',group:'heal'},
 {id:'boundary-sentinels',name:'Boundary Sentinels',emoji:'🛡️',description:'Explore the boundary tools.',feature:'healfeature',group:'heal'},
 {id:'ebb-and-flow-ui',name:'Ebb & Flow',emoji:'🌊',description:'A calmer space to unwind.',feature:'healfeature',group:'heal'},
 {id:'counselor',name:'Sanctuary',emoji:'🕯️',description:'A quiet space for support.',feature:'counselor',group:'heal'},
 {id:'guild',name:'Creative Lab',emoji:'🌶️',description:'Your guild’s lively gathering place.',feature:'guild',group:'connect'},
 {id:'trustprofile',name:'Trust Profile',emoji:'👻',description:'Explore community trust tools.',feature:'trustprofile',group:'connect'},
 {id:'arbitration',name:'Arbitration Chamber',emoji:'⚖️',description:'Explore the dispute resolution flow.',feature:'arbitration',group:'connect'},
 {id:'avatar',name:'Avatar Studio',emoji:'🎨',description:'Make your identity your own.',feature:'avatar',group:'identity'},
 {id:'accesscode',name:'Access Code',emoji:'🔑',description:'Share your anonymous connection code.',feature:'accesscode',group:'identity'},
];
const groupInfo:Record<string,{title:string;sub:string;emoji:string}>={grow:{title:'A little growth. Every day.',sub:'Solo reflection, co-op challenges, and community quests.',emoji:'🌱'},heal:{title:'Take a breath. Find your calm.',sub:'Gentle spaces for grounding and connection.',emoji:'💚'},play:{title:'Let curiosity lead the game.',sub:'Daily cards, chat games, and rewards.',emoji:'🎮'},connect:{title:'Find your kind of people.',sub:'Affinity, guilds, and your community presence.',emoji:'🧬'},identity:{title:'Your identity. Your way.',sub:'Create your avatar and share your code.',emoji:'👾'}};
export function FeatureCards({group,compact=false}:{group?:string;compact?:boolean}) {
 const features=mobileFeatures.filter(f=>group?f.group===group:['scenarios','chatgames','affinity','xpeconomy','lantern-garden','shadow-simulator'].includes(f.id));
 return <div className={`mobile-feature-grid ${compact?'compact':''}`}>{features.map(f=><a href={`#/app/feature/${f.id}`} className={`mobile-feature-card ${f.group}`} key={f.id}><div className="feature-card-art"><span>{f.emoji}</span><i>✦</i><b>✳</b></div><div className="feature-card-label"><h3>{f.name}</h3><ArrowUpRight size={20}/></div><p>{f.description}</p></a>)}</div>;
}
export function MobileFeaturePage({page,id}:{page:string;id?:string}) {
 const feature=mobileFeatures.find(f=>f.id===id);
 const back=feature?`/app/${feature.group}`:'/app/home';
 useEffect(()=>{const onMessage=(event:MessageEvent)=>{const frame=document.querySelector<HTMLIFrameElement>('.web-feature-frame');if(event.origin===window.location.origin&&event.source===frame?.contentWindow&&event.data?.type==='roleplay-feature-back')window.location.hash=back};window.addEventListener('message',onMessage);return()=>window.removeEventListener('message',onMessage)},[back]);
 if(page==='feature'||page==='live') {
  if(page==='feature'&&!feature)return <p>Feature not found. <a href="#/app/home">Return home</a></p>;
  const params=new URLSearchParams({demo:'1',embed:'1',...(page==='live'?{screen:'live'}:{feature:feature!.feature,id:feature!.id})});
  return <section className="web-feature-workspace"><div className="web-feature-toolbar"><a className="back-link" href={`#${back}`}><ArrowLeft size={17}/>Back</a><h1>{page==='live'?'Live spaces':feature!.name}</h1><span className="tag">Interactive demo</span></div><iframe key={params.toString()} title={page==='live'?'Live spaces':feature!.name} className="web-feature-frame" src={`/original.html?${params}`}/><p className="microcopy">Same interactive features as the mobile app. Live sessions, AI, and verification use simulated data.</p></section>;
 }
 const info=groupInfo[page];
 return <><div className={`feature-group-hero ${page}`}><div><span className="eyebrow">ROLEPLAY · {page.toUpperCase()}</span><h1>{info.title}</h1><p>{info.sub}</p></div><div className="feature-group-art"><span>{info.emoji}</span><b>✳</b><i>✦</i></div></div><FeatureCards group={page}/></>;
}
export function MobileFeatureHome(){return <section className="mobile-features-home"><div className="intent-switcher">{['play','grow','heal'].map(group=><a href={`#/app/${group}`} className={group} key={group}><span>{groupInfo[group].emoji}</span><div><b>{group[0].toUpperCase()+group.slice(1)}</b><small>{group==='play'?'Fun & entertainment':group==='grow'?'Learn & develop':'Rest & recover'}</small></div><ArrowUpRight size={24}/></a>)}</div><div className="section-heading"><h2><Sparkles size={21}/>Your daily possibilities</h2><a className="text-link" href="#/app/connect">Find your wavelength <ArrowUpRight size={16}/></a></div><FeatureCards compact/></section>}
