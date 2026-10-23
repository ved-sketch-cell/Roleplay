import { useRef, useState, useEffect, type ReactNode } from 'react';
import { ArrowLeft, Bookmark, Check, CheckCircle2, ChevronRight, Compass, Eye, Fingerprint, Flame, Heart, Lightbulb, LockKeyhole, MessageCircle, ShieldCheck, Smile, Sparkles, Timer, UserRound, Volume2, X } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { accentStyle } from '../mobile/visuals';
import { useDeviceState } from '../mobile/state';
import { conversationProfile, conversationHeatKey, preferenceLabels, heatZone, heatValue } from '../mobile/conversationProfiles';
import { ConversationHeat, HeatDetails } from '../mobile/ConversationHeat';
import {type SelfProfileSection} from '../mobile/selfProfile';

export interface AnonUser {
  id:string;avatar:string;color:string;anonCode:string;mood:string;moodEmoji:string;moodColor:string;heat:number;verified:boolean;status:string;level:number;xp:number;
  badges:{icon:string;label:string;color:string}[];scenarioAxes:{axis:string;value:number}[];footprint:{label:string;value:string}[];revealedName:string;revealedPhone:string;
}
interface AnonUserProfileProps {user:AnonUser;onBack:()=>void;onStarter?:(text:string)=>void;onEditYours?:(section:SelfProfileSection)=>void;}
type ProfileTab='Vibe'|'Mindset'|'Boundaries';
const tabs:ProfileTab[]=['Vibe','Mindset','Boundaries'];
function SnapshotSection({title,icon,tone='purple',children}:{title:string;icon:ReactNode;tone?:string;children:ReactNode}) {
  return <section className="snapshot-card" style={accentStyle(tone)}><div className="snapshot-card-heading"><span className="snapshot-symbol">{icon}</span><h2>{title}</h2></div>{children}</section>;
}

function RevealPreview({onClose,onReveal}:{onClose:()=>void;onReveal:()=>void}) {
  const [mine,setMine]=useState(false),[theirs,setTheirs]=useState(false);const container=useRef<HTMLDivElement>(null);const close=useRef<HTMLButtonElement>(null);
  useEffect(()=>{const previous=document.activeElement as HTMLElement|null;close.current?.focus();return()=>previous?.focus();},[]);
  function keyDown(e:React.KeyboardEvent){if(e.key==='Escape'){onClose();return;}if(e.key!=='Tab')return;const els=container.current?.querySelectorAll<HTMLElement>('button,input');if(!els?.length)return;const first=els[0],last=els[els.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
  return <div className="conversation-dialog-backdrop" onClick={onClose}><div ref={container} className="conversation-dialog" role="dialog" aria-modal="true" aria-labelledby="reveal-preview-title" onClick={e=>e.stopPropagation()} onKeyDown={keyDown}>
    <div className="conversation-dialog-top"><span className="snapshot-symbol"><Fingerprint size={25}/></span><button ref={close} className="mobile-icon-button" onClick={onClose} aria-label="Close identity reveal preview"><X size={20}/></button></div>
    <p className="snapshot-kicker">MUTUAL CONSENT · DEMO</p><h2 id="reveal-preview-title">Two people. Two choices.</h2><p>Try the consent flow with a fictional identity. No request is sent to another person.</p>
    <label className="reveal-consent-row"><input type="checkbox" checked={mine} onChange={e=>setMine(e.target.checked)}/><span><strong>Your consent</strong><small>I agree to this sample reveal.</small></span></label>
    <label className="reveal-consent-row"><input type="checkbox" checked={theirs} onChange={e=>setTheirs(e.target.checked)}/><span><strong>Simulate their consent</strong><small>Preview the other side choosing to agree.</small></span></label>
    <button className="mobile-primary-button" disabled={!mine||!theirs} onClick={onReveal}><LockKeyhole size={18}/>Reveal sample identity</button>
  </div></div>;
}

export function AnonUserProfile({user,onBack,onStarter,onEditYours}:AnonUserProfileProps) {
  const p=conversationProfile(user.id);const [tab,setTab]=useState<ProfileTab>('Vibe');const [storedHeat,setHeat]=useDeviceState<number>(conversationHeatKey(user.id),48);const heat=heatValue(storedHeat);
  const [saved,setSaved]=useDeviceState<string[]>('saved-conversation-profiles',[]);const [myInterests]=useDeviceState<string[]>('interests',[]);
  const [showHeat,setShowHeat]=useState(false),[showReveal,setShowReveal]=useState(false),[revealed,setRevealed]=useState(false);
  const body=useRef<HTMLDivElement>(null);const tabRefs=useRef<(HTMLButtonElement|null)[]>([]);
  const common=p.interests.filter(i=>myInterests.some(m=>m.toLowerCase()===i.toLowerCase()));const pinned=saved.includes(user.id);const zone=heatZone(heat);
  function chooseTab(next:ProfileTab){setTab(next);body.current?.scrollTo({top:0});}
  function start(text:string){onStarter?.(text);}
  return <div className="conversation-profile h-screen" style={accentStyle(p.tone)}>
    <header className="snapshot-header"><button className="mobile-icon-button" onClick={onBack} aria-label="Back to chat"><ArrowLeft size={21}/></button><div><span className="snapshot-kicker">CONVERSATION PROFILE</span><h1 tabIndex={-1}>{p.alias}</h1></div><button className={`snapshot-save ${pinned?'is-saved':''}`} aria-label={pinned?'Unsave profile':'Save profile'} aria-pressed={pinned} onClick={()=>setSaved(ids=>pinned?ids.filter(id=>id!==user.id):[...ids,user.id])}><Bookmark size={21}/></button></header>
    <div className="snapshot-source"><ShieldCheck size={14}/><span>Self-shared example · Only what they choose to share</span></div>
    <div className="snapshot-tabs" role="tablist" aria-label="Conversation profile sections">{tabs.map((t,i)=><button key={t} ref={el=>{tabRefs.current[i]=el;}} id={`profile-tab-${t}`} role="tab" aria-selected={tab===t} aria-controls="conversation-profile-panel" tabIndex={tab===t?0:-1} onClick={()=>chooseTab(t)} onKeyDown={e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?2:(i+(e.key==='ArrowRight'?1:2))%3;chooseTab(tabs[next]);tabRefs.current[next]?.focus();}}>{i===0?<Smile size={17}/>:i===1?<Compass size={17}/>:<ShieldCheck size={17}/>} {t}</button>)}</div>
    <div className="snapshot-body"><div className="snapshot-rail"><ConversationHeat value={heat} expanded={showHeat} onInfo={()=>setShowHeat(true)} compact/><button className="snapshot-lock" onClick={()=>setShowReveal(true)} aria-label="Preview mutual identity reveal"><LockKeyhole size={21}/></button><span className="snapshot-rail-note">Alias only</span></div>
      <div ref={body} className="snapshot-content" id="conversation-profile-panel" role="tabpanel" aria-labelledby={`profile-tab-${tab}`}>
        {tab==='Vibe'&&<>
          <section className="snapshot-persona"><span className="snapshot-avatar">{p.avatar}<span><UserRound size={13}/></span></span><div><p className="snapshot-kicker">{revealed?'FICTIONAL IDENTITY · DEMO':'ANONYMOUS ALIAS'}</p><h2>{revealed?user.revealedName:p.alias}</h2><p>Member #{user.anonCode}</p></div><span className="snapshot-alias-badge"><LockKeyhole size={13}/>{revealed?'Sample reveal':'Alias only'}</span></section>
          <section className="snapshot-mood" style={accentStyle(p.tone)}><div className="snapshot-mood-top"><span className="snapshot-kicker">THEIR CURRENT MOOD</span><span className="snapshot-source-badge">Self-shared · demo</span></div><div className="snapshot-mood-main"><span className="snapshot-mood-emoji">{p.moodEmoji}</span><div><h2>{p.mood}</h2><p>{p.intent}</p></div></div><div className="snapshot-mood-meta"><span><Volume2 size={15}/>Social battery <strong>{p.socialBattery}</strong></span><span><Timer size={15}/>Reply pace <strong>{p.pace}</strong></span></div></section>
          <SnapshotSection title="How they like to chat" icon={<MessageCircle size={20}/>} tone="cyan"><div className="snapshot-facts"><div><Sparkles size={18}/><span>Conversation style<strong>{p.style}</strong></span></div><div><Heart size={18}/><span>Support preference<strong>{p.feedback}</strong></span></div><div><MessageCircle size={18}/><span>Languages<strong>{p.languages.join(' · ')}</strong></span></div></div></SnapshotSection>
          <SnapshotSection title="Community badges" icon={<Sparkles size={20}/>} tone="amber"><p className="snapshot-secondary">Sample community badges.</p><div className="snapshot-chips snapshot-badges">{user.badges.filter(b=>b.label!=='Verified').map(b=><span key={b.label}>{b.icon} {b.label}</span>)}</div></SnapshotSection>
          <SnapshotSection title="Their interests" icon={<Compass size={20}/>} tone="pink"><div className="snapshot-chips">{p.interests.map(i=><span key={i}>{i}</span>)}</div><div className="snapshot-common"><CheckCircle2 size={16}/><p>{common.length?`Shared with you: ${common.join(' · ')}`:myInterests.length?'No exact shared interests yet. A new perspective can be a good start.':'Choose your interests in Discover to see your common ground.'}</p></div></SnapshotSection>
          <SnapshotSection title="A good first question" icon={<Lightbulb size={20}/>} tone="amber"><p className="snapshot-secondary">Pick a starter. Edit it in chat before sending.</p><div className="snapshot-starters">{p.starters.map(s=><button key={s} onClick={()=>start(s)}>{s}<ChevronRight size={18}/></button>)}</div></SnapshotSection>
        </>}
        {tab==='Mindset'&&<>
          <section className="snapshot-mindset-intro"><span className="snapshot-symbol"><Compass size={26}/></span><div><p className="snapshot-kicker">PSYCHOGRAPHICS</p><h2>A little more about their mindset.</h2><p>Self-described preferences in a fictional sample profile.</p></div></section>
          <SnapshotSection title="Preference map" icon={<Sparkles size={20}/>} tone="purple"><div className="snapshot-radar" role="img" aria-label={`Sample self-described preference map: ${preferenceLabels.map((l,i)=>`${l.label} ${p.preferences[i]} of 5`).join(', ')}`}><ResponsiveContainer width="100%" height="100%"><RadarChart data={preferenceLabels.map((l,i)=>({axis:['Curiosity','Play','Depth','Structure','Voice'][i],value:p.preferences[i]}))} outerRadius={65} margin={{top:15,right:25,bottom:15,left:25}}><PolarGrid stroke="#b9a1ff30"/><PolarAngleAxis dataKey="axis" tick={{fill:'#cec2e0',fontSize:12}} tickLine={false}/><PolarRadiusAxis domain={[0,5]} tick={false} axisLine={false}/><Radar dataKey="value" stroke="#bb99ff" fill="#ad88fa" fillOpacity={.22} strokeWidth={2} dot={{fill:'#d6fc8a',r:3}}/></RadarChart></ResponsiveContainer></div><p className="snapshot-secondary">Example choices on a 1–5 scale. These aren’t inferred from messages.</p><div className="snapshot-traits">{preferenceLabels.map((l,i)=><div key={l.label}><div className="snapshot-trait-label"><strong>{l.label}</strong><span>{p.preferences[i]}/5</span></div><div className="snapshot-trait-track" aria-hidden="true">{[1,2,3,4,5].map(v=><span key={v} className={v<=p.preferences[i]?'is-filled':''}/>)}</div><div className="snapshot-trait-ends"><span>{l.low}</span><span>{l.high}</span></div></div>)}</div></SnapshotSection>
          <SnapshotSection title="What matters to them" icon={<Heart size={20}/>} tone="pink"><div className="snapshot-value-grid">{p.values.map((v,i)=><span key={v}>{i===0?<Lightbulb size={19}/>:i===1?<Heart size={19}/>:<Sparkles size={19}/>}<strong>{v}</strong></span>)}</div></SnapshotSection>
          <SnapshotSection title="How they learn" icon={<Lightbulb size={20}/>} tone="amber"><p className="snapshot-highlight">{p.learning}</p><p className="snapshot-secondary">Try asking about something they’re exploring.</p><button className="snapshot-inline-action" onClick={()=>start('What is something you are learning or experimenting with right now?')}><MessageCircle size={17}/>Ask about their next idea</button></SnapshotSection>
        </>}
        {tab==='Boundaries'&&<>
          <section className="snapshot-boundary-intro"><ShieldCheck size={29}/><h2>Comfort is a conversation.</h2><p>Preferences can change. Ask, listen, and check in.</p></section>
          <SnapshotSection title="Comfortable with" icon={<CheckCircle2 size={20}/>} tone="lime"><div className="snapshot-boundary-list">{p.okay.map(x=><span key={x}><Check size={17}/>{x}</span>)}</div></SnapshotSection>
          <SnapshotSection title="Ask first" icon={<MessageCircle size={20}/>} tone="amber"><div className="snapshot-boundary-list">{p.askFirst.map(x=><span key={x}><MessageCircle size={16}/>{x}</span>)}</div><button className="snapshot-inline-action" onClick={()=>start('Would you prefer a light chat, a game, or a little space right now?')}>Check what feels comfortable</button></SnapshotSection>
          <SnapshotSection title="Off limits" icon={<ShieldCheck size={20}/>} tone="coral"><div className="snapshot-boundary-list">{['Pressure to reply','Requests for private contact details','Sharing screenshots without permission'].map(x=><span key={x}><X size={17}/>{x}</span>)}</div></SnapshotSection>
          <SnapshotSection title="Identity & sharing" icon={<Fingerprint size={20}/>} tone="purple"><p className="snapshot-highlight">An alias is enough to connect.</p><p className="snapshot-secondary">Mood and preferences are optional. Real identity stays separate. This prototype only demonstrates a mutual reveal with fictional details.</p><button className="snapshot-inline-action" onClick={()=>setShowReveal(true)}><LockKeyhole size={17}/>Preview mutual reveal</button></SnapshotSection>
        </>}
        {onEditYours&&<button className="snapshot-edit-yours" onClick={()=>onEditYours(tab.toLowerCase() as SelfProfileSection)}><UserRound size={17}/>Edit your {tab.toLowerCase()}</button>}
        <p className="snapshot-data-note"><Eye size={15}/>Fictional sample details. Mood and mindset are shared choices, not hidden analysis.</p>
      </div>
    </div>
    <footer className="snapshot-footer"><button className="mobile-primary-button" onClick={onBack}><MessageCircle size={18}/>Back to conversation</button><span><Flame size={15}/>{zone.label} · {heat}/100</span></footer>
    {showHeat&&<HeatDetails value={heat} onChange={setHeat} onClose={()=>setShowHeat(false)}/>}
    {showReveal&&<RevealPreview onClose={()=>setShowReveal(false)} onReveal={()=>{setRevealed(true);setShowReveal(false);}}/>}
  </div>;
}
