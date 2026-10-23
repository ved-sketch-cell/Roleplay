import {useCallback,useRef,useState,type ReactNode} from 'react';
import {ArrowLeft,Check,CheckCircle2,Compass,Heart,LockKeyhole,MessageCircle,Pencil,ShieldCheck,Smile,Sparkles,Volume2,X} from 'lucide-react';
import {JourneyDialog} from '../mobile/JourneyDialog';
import {preferenceLabels} from '../mobile/conversationProfiles';
import {accentStyle} from '../mobile/visuals';
import {type MobileIdentity} from '../mobile/state';
import {boundaryChoices,boundaryTopics,moodOptions,sectionTitle,selfProfileSections,useSelfProfile,valueOptions,vibeChoices,type SelfProfile,type SelfProfileSection} from '../mobile/selfProfile';
import '../mobile/self-profile.css';

const sectionIcon={vibe:Smile,mindset:Compass,boundaries:ShieldCheck};
const sectionTone={vibe:'cyan',mindset:'purple',boundaries:'lime'};
function Card({title,icon,tone,children}:{title:string;icon:ReactNode;tone:string;children:ReactNode}){
  return <section className="snapshot-card" style={accentStyle(tone)}><div className="snapshot-card-heading"><span className="snapshot-symbol">{icon}</span><h2>{title}</h2></div>{children}</section>;
}
function SelectField({label,value,choices,onChange}:{label:string;value:string;choices:string[];onChange:(value:string)=>void}){
  return <label>{label}<select value={value} onChange={e=>onChange(e.target.value)}><option value="">Not set</option>{choices.map(v=><option key={v}>{v}</option>)}</select></label>;
}
function ProfileEditor({section,profile,onSave,onClose}:{section:SelfProfileSection;profile:SelfProfile;onSave:(draft:SelfProfile)=>void;onClose:()=>void}){
  const [draft,setDraft]=useState<SelfProfile>(()=>structuredClone(profile));
  const updateVibe=(key:keyof SelfProfile['vibe'],value:string)=>setDraft(p=>({...p,vibe:{...p.vibe,[key]:value}}));
  const Icon=sectionIcon[section];
  return <JourneyDialog title={`Edit your ${sectionTitle[section].toLowerCase()}`} onClose={onClose}>
    <form className="self-profile-editor journey-form" onSubmit={e=>{e.preventDefault();onSave({...profile,[section]:draft[section]});}}>
      <div className="self-profile-editor-body">
        <p className="self-profile-editor-note"><Icon size={20}/>Choose what feels like you. Every field is optional.</p>
        {section==='vibe'&&<div className="self-profile-fields">
          <label>Your mood<select value={draft.vibe.mood} onChange={e=>updateVibe('mood',e.target.value)}><option value="">Not set</option>{moodOptions.map(m=><option key={m.value} value={m.value}>{m.emoji} {m.value}</option>)}</select></label>
          <SelectField label="Social battery" value={draft.vibe.battery} choices={vibeChoices.battery} onChange={v=>updateVibe('battery',v)}/>
          <SelectField label="Here for" value={draft.vibe.intent} choices={vibeChoices.intent} onChange={v=>updateVibe('intent',v)}/>
          <SelectField label="Reply pace" value={draft.vibe.pace} choices={vibeChoices.pace} onChange={v=>updateVibe('pace',v)}/>
          <SelectField label="Conversation style" value={draft.vibe.style} choices={vibeChoices.style} onChange={v=>updateVibe('style',v)}/>
          <SelectField label="Support preference" value={draft.vibe.feedback} choices={vibeChoices.feedback} onChange={v=>updateVibe('feedback',v)}/>
          <label>Languages<input value={draft.vibe.languages} onChange={e=>updateVibe('languages',e.target.value)} maxLength={60} placeholder="e.g. English, Hindi"/></label>
        </div>}
        {section==='mindset'&&<>
          <p>Pick a point on each scale, or leave it unset. These are your choices, never a personality diagnosis.</p>
          <div className="self-profile-scales">{preferenceLabels.map((l,i)=><fieldset key={l.label}><legend>{l.label}</legend><div className="self-profile-scale-ends"><span>1 · {l.low}</span><span>5 · {l.high}</span></div><div className="self-profile-scale" role="group" aria-label={l.label}>{[1,2,3,4,5].map(v=><button key={v} type="button" aria-label={`${l.label}: ${v} of 5`} aria-pressed={draft.mindset.preferences[i]===v} onClick={()=>setDraft(p=>({...p,mindset:{...p.mindset,preferences:p.mindset.preferences.map((old,index)=>index===i?v:old)}}))}>{v}</button>)}<button type="button" className="self-profile-unset" aria-label={`Clear ${l.label}`} aria-pressed={draft.mindset.preferences[i]===null} onClick={()=>setDraft(p=>({...p,mindset:{...p.mindset,preferences:p.mindset.preferences.map((old,index)=>index===i?null:old)}}))}>Unset</button></div></fieldset>)}</div>
          <fieldset className="self-profile-values"><legend>What matters to you <small>Choose up to 4 · {draft.mindset.values.length}/4</small></legend><div>{valueOptions.map(v=>{const chosen=draft.mindset.values.includes(v);return <button key={v} type="button" aria-pressed={chosen} disabled={!chosen&&draft.mindset.values.length>=4} onClick={()=>setDraft(p=>({...p,mindset:{...p.mindset,values:chosen?p.mindset.values.filter(x=>x!==v):[...p.mindset.values,v]}}))}>{chosen?<Check size={15}/>:<Sparkles size={15}/>} {v}</button>;})}</div></fieldset>
          <label>How you like to learn<textarea value={draft.mindset.learning} onChange={e=>setDraft(p=>({...p,mindset:{...p.mindset,learning:e.target.value}}))} maxLength={120} placeholder="e.g. Show me an example, then let me try."/><small>{draft.mindset.learning.length}/120</small></label>
        </>}
        {section==='boundaries'&&<>
          <p>Give each topic one preference. You can change it any time.</p>
          <div className="self-profile-boundary-fields">{boundaryTopics.map(topic=><label key={topic}>{topic}<select value={draft.boundaries.topics[topic]||''} onChange={e=>setDraft(p=>({...p,boundaries:{...p.boundaries,topics:{...p.boundaries.topics,[topic]:e.target.value as SelfProfile['boundaries']['topics'][string]}}}))}><option value="">Not set</option>{boundaryChoices.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}</select></label>)}</div>
          <label>Anything else? <textarea value={draft.boundaries.note} onChange={e=>setDraft(p=>({...p,boundaries:{...p.boundaries,note:e.target.value}}))} maxLength={240} placeholder="e.g. Please give me space if I take a while to reply."/><small>{draft.boundaries.note.length}/240</small></label>
        </>}
        <p className="self-profile-private"><LockKeyhole size={15}/>Saved on this device. Saving doesn’t send anything to a chat.</p>
      </div>
      <footer className="self-profile-editor-footer"><button type="button" className="mobile-secondary-button" onClick={onClose}>Cancel</button><button type="submit" className="mobile-primary-button"><Check size={18}/>Save {sectionTitle[section].toLowerCase()}</button></footer>
    </form>
  </JourneyDialog>;
}

export function SelfConversationProfile({section,identity,onSection,onBack}:{section:SelfProfileSection;identity:MobileIdentity;onSection:(section:SelfProfileSection)=>void;onBack:()=>void}){
  const [profile,setProfile]=useSelfProfile();
  const [editing,setEditing]=useState(false),[notice,setNotice]=useState('');
  const closeEditor=useCallback(()=>setEditing(false),[]);
  const tabRefs=useRef<(HTMLButtonElement|null)[]>([]);
  const Icon=sectionIcon[section],mood=moodOptions.find(m=>m.value===profile.vibe.mood);
  const facts=[['Social battery',profile.vibe.battery],['Here for',profile.vibe.intent],['Reply pace',profile.vibe.pace],['Conversation style',profile.vibe.style],['Support preference',profile.vibe.feedback],['Languages',profile.vibe.languages]];
  return <div className="conversation-profile own-conversation-profile" style={accentStyle(sectionTone[section])}>
    <div className="self-profile-screen" inert={editing}>
      <header className="snapshot-header"><button className="mobile-icon-button" onClick={onBack} aria-label="Back from your chat profile"><ArrowLeft size={21}/></button><div><span className="snapshot-kicker">YOUR CONVERSATION PROFILE</span><h1 tabIndex={-1}>{identity.username}</h1></div><span className="self-profile-avatar" style={{background:identity.color+'25'}} aria-hidden="true">{identity.avatar}</span></header>
      <div className="snapshot-source"><LockKeyhole size={14}/><span>Your choices · saved on this device</span></div>
      <nav className="snapshot-tabs" aria-label="Your conversation profile sections">{selfProfileSections.map((s,i)=>{const TabIcon=sectionIcon[s];return <button key={s} ref={el=>{tabRefs.current[i]=el;}} aria-current={s===section?'page':undefined} onClick={()=>onSection(s)} onKeyDown={e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const index=e.key==='Home'?0:e.key==='End'?2:(i+(e.key==='ArrowRight'?1:2))%3;onSection(selfProfileSections[index]);tabRefs.current[index]?.focus();}}><TabIcon size={17}/>{sectionTitle[s]}</button>;})}</nav>
      <div className="snapshot-content self-profile-content">
        <div className="self-profile-intro" style={accentStyle(sectionTone[section])}><span className="self-profile-orbit" aria-hidden="true"><Icon size={32}/><Sparkles size={15}/><span/></span><div><p className="snapshot-kicker">MAKE IT YOURS</p><h2>Your {sectionTitle[section].toLowerCase()}.</h2><p>{section==='vibe'?'Your energy. Your way to connect.':section==='mindset'?'The ideas and values that feel like you.':'Your comfort comes first.'}</p></div></div>
        {notice&&<p className="self-profile-status" role="status"><CheckCircle2 size={18}/>{notice}</p>}
        <button className="self-profile-edit" onClick={()=>{setNotice('');setEditing(true);}}><Pencil size={18}/>Edit {sectionTitle[section].toLowerCase()}</button>
        {section==='vibe'&&<>
          <section className="snapshot-mood" style={accentStyle('cyan')}><p className="snapshot-kicker">YOUR MOOD</p><div className="snapshot-mood-main"><span className="snapshot-mood-emoji">{mood?.emoji||'✦'}</span><div><h2>{mood?.value||'Your choice, your pace.'}</h2><p>{profile.vibe.intent||'Add a vibe when you feel like it.'}</p></div></div></section>
          <Card title="How you like to chat" icon={<MessageCircle size={20}/>} tone="cyan"><dl className="self-profile-facts">{facts.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value||'Not set'}</dd></div>)}</dl></Card>
        </>}
        {section==='mindset'&&<>
          <Card title="Your preference map" icon={<Compass size={20}/>} tone="purple"><div className="snapshot-traits">{preferenceLabels.map((l,i)=><div key={l.label}><div className="snapshot-trait-label"><strong>{l.label}</strong><span>{profile.mindset.preferences[i]===null?'Not set':`${profile.mindset.preferences[i]}/5`}</span></div><div className="snapshot-trait-track" aria-hidden="true">{[1,2,3,4,5].map(v=><span key={v} className={v<=(profile.mindset.preferences[i]||0)?'is-filled':''}/>)}</div><div className="snapshot-trait-ends"><span>{l.low}</span><span>{l.high}</span></div></div>)}</div></Card>
          <Card title="What matters to you" icon={<Heart size={20}/>} tone="pink">{profile.mindset.values.length?<div className="snapshot-chips">{profile.mindset.values.map(v=><span key={v}>{v}</span>)}</div>:<p className="snapshot-secondary">Choose the values you connect with.</p>}</Card>
          <Card title="How you learn" icon={<Sparkles size={20}/>} tone="amber"><p className="self-profile-text">{profile.mindset.learning||'Add your own learning preference.'}</p></Card>
        </>}
        {section==='boundaries'&&<>
          {boundaryChoices.map(c=><Card key={c.value} title={c.label==='Comfortable'?'Comfortable with':c.label} icon={c.value==='okay'?<CheckCircle2 size={20}/>:c.value==='ask'?<MessageCircle size={20}/>:<ShieldCheck size={20}/>} tone={c.value==='okay'?'lime':c.value==='ask'?'amber':'coral'}>{boundaryTopics.some(t=>profile.boundaries.topics[t]===c.value)?<div className="snapshot-boundary-list">{boundaryTopics.filter(t=>profile.boundaries.topics[t]===c.value).map(t=><span key={t}>{c.value==='okay'?<Check size={17}/>:c.value==='off'?<X size={17}/>:<MessageCircle size={17}/>} {t}</span>)}</div>:<p className="snapshot-secondary">No topics added yet.</p>}</Card>)}
          <Card title="In your words" icon={<Volume2 size={20}/>} tone="purple"><p className="self-profile-text">{profile.boundaries.note||'Add a note about what feels comfortable.'}</p></Card>
          <p className="snapshot-secondary">These are conversation preferences. Ask, listen, and check in; they don’t automatically block messages or calls.</p>
        </>}
        <p className="snapshot-data-note"><LockKeyhole size={15}/>Only your profile changes. You choose what to share in each conversation.</p>
      </div>
      <footer className="snapshot-footer"><button className="mobile-primary-button" onClick={onBack}><Check size={18}/>Done</button></footer>
    </div>
    {editing&&<ProfileEditor section={section} profile={profile} onClose={closeEditor} onSave={draft=>{setProfile(draft);setEditing(false);setNotice(`${sectionTitle[section]} saved on this device.`);}}/>}
  </div>;
}
