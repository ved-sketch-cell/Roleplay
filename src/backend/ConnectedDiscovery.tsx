import {useEffect, useState, type FormEvent} from 'react';
import {Compass, Download, Heart, LogOut, ShieldCheck, Sparkles, UserRound, Users, X} from 'lucide-react';
import {APIError, roleplayAPI, type BackendProfile, type CommunicationStyle, type ContactMode, type InteractionPreference, type UserMatch} from './client';
import './connected.css';

const tags = (value: string) => [...new Set(value.split(',').map(tag=>tag.trim()).filter(Boolean))];

export function ConnectedDiscovery() {
  const [profile, setProfile] = useState<BackendProfile|null>(null);
  const [savedProfile, setSavedProfile] = useState<BackendProfile|null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [register, setRegister] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [matches, setMatches] = useState<UserMatch[]>([]);
  const [matched, setMatched] = useState(false);
  const [interests, setInterests] = useState('');
  const [goals, setGoals] = useState('');
  const [languages, setLanguages] = useState('');
  const [prompt, setPrompt] = useState('');
  const [aiConsent, setAIConsent] = useState(false);
  const [aiEnabled, setAIEnabled] = useState(false);
  const [blocks, setBlocks] = useState<string[]>([]);

  const adoptProfile = (value: BackendProfile) => { setProfile(value); setSavedProfile(value); setInterests(value.interests.join(', ')); setGoals(value.goals.join(', ')); setLanguages(value.languages.join(', ')); };
  useEffect(()=>{
    let active=true;
    (async()=>{
      if (await roleplayAPI.ensureSession()) {
        try { const value=await roleplayAPI.getProfile(); if(active)adoptProfile(value); }
        catch { if(active)setProfile(null); }
      }
      if(active)setLoading(false);
    })();
    return ()=>{active=false;};
  },[]);
  useEffect(()=>{
    let active=true;
    roleplayAPI.capabilities().then(value=>{if(active)setAIEnabled(value.ai_configured);}).catch(()=>{});
    return ()=>{active=false;};
  },[]);

  async function action(work:()=>Promise<void>) {
    setBusy(true); setError(''); setNotice('');
    try { await work(); }
    catch (err) { setError(err instanceof Error?err.message:'Please try again.'); if(err instanceof APIError&&err.status===401){setProfile(null);setMatches([]);setBlocks([]);} }
    finally { setBusy(false); }
  }

  async function authenticate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form=new FormData(event.currentTarget);
    const email=String(form.get('email')), password=String(form.get('password'));
    await action(async()=>{
      if(register)await roleplayAPI.register(email,password,String(form.get('alias'))); else await roleplayAPI.signIn(email,password);
      adoptProfile(await roleplayAPI.getProfile());
    });
  }

  async function savePreferences(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if(!profile)return;
    await action(async()=>{
      const saved=await roleplayAPI.updateProfile({display_name:profile.display_name,bio:profile.bio,avatar:profile.avatar,discoverable:profile.discoverable,share_presence:profile.share_presence,interests:tags(interests),goals:tags(goals),languages:tags(languages),contact_modes:profile.contact_modes,communication_style:profile.communication_style,interaction_preference:profile.interaction_preference});
      adoptProfile(saved); setMatches([]); setMatched(false); setNotice('Your preferences are saved.');
    });
  }

  async function findPeople(ai=false) {
    await action(async()=>{
      const result=ai?await roleplayAPI.aiRecommendations(prompt,aiConsent):await roleplayAPI.recommendations();
      setMatches(result.matches); setMatched(true); setNotice(result.message||`${result.matches.length} people share your preferences.`);
    });
  }

  const removeMatch=(id:string)=>setMatches(current=>current.filter(match=>match.user_id!==id));
  const unsaved=!!profile&&!!savedProfile&&(JSON.stringify(profile)!==JSON.stringify(savedProfile)||interests!==savedProfile.interests.join(', ')||goals!==savedProfile.goals.join(', ')||languages!==savedProfile.languages.join(', '));
  if(loading)return <section className="rp-connected"><p role="status">Loading your account…</p></section>;
  return <section className="rp-connected" aria-labelledby="rp-people-title">
    <div className="rp-connected-heading"><div><span className="eyebrow"><Compass size={16}/>PREFERENCE MATCHING</span><h1 id="rp-people-title">Find your wavelength.</h1><p>Shared interests. Clear reasons. Your choice.</p></div>{profile&&<button className="btn secondary" disabled={busy} onClick={()=>action(async()=>{await roleplayAPI.logout();setProfile(null);setMatches([]);setBlocks([]);setMatched(false);})}><LogOut size={16}/>Sign out</button>}</div>
    {error&&<p className="rp-api-error" role="alert">{error}</p>}
    {notice&&<p className="rp-api-notice" role="status">{notice}</p>}
    {!profile?<div className="rp-connected-panel rp-auth-panel"><ShieldCheck className="rp-connected-symbol"/><h2>{register?'Create your private account.':'Welcome back.'}</h2><p>Your public identity is an alias. Your email stays private.</p>
      <form onSubmit={authenticate}>
        {register&&<label>Public alias<input name="alias" required minLength={2} maxLength={40} autoComplete="nickname" placeholder="Curious Explorer"/></label>}
        <label>Email<input name="email" type="email" required autoComplete="email" maxLength={254}/></label>
        <label>Password<input name="password" type="password" required minLength={register?12:1} maxLength={128} autoComplete={register?'new-password':'current-password'}/>{register&&<small>Use at least 12 characters.</small>}</label>
        <button className="btn primary" disabled={busy}>{busy?'Please wait…':register?'Create account':'Sign in'}</button>
      </form><a className="text-link" href="#/app/recover">Forgot password?</a><button className="text-link" disabled={busy} onClick={()=>{setRegister(!register);setError('');}}>{register?'Already have an account? Sign in':'New here? Create an account'}</button>
    </div>:<>
      <div className="rp-connected-layout">
        <div className="rp-connected-panel"><h2><UserRound size={21}/>Your preferences</h2><form onSubmit={savePreferences}>
          <label>Public alias<input value={profile.display_name} minLength={2} maxLength={40} required onChange={event=>setProfile({...profile,display_name:event.target.value})}/></label>
          <label>Avatar<select value={profile.avatar} onChange={event=>setProfile({...profile,avatar:event.target.value})}>{['👾','🦊','🪐','🕊️','🌱','🎨','⚡','🧩'].map(value=><option key={value} value={value}>{value}</option>)}{!['👾','🦊','🪐','🕊️','🌱','🎨','⚡','🧩'].includes(profile.avatar)&&<option value={profile.avatar}>{profile.avatar}</option>}</select></label>
          <label>Short introduction<textarea value={profile.bio} maxLength={280} rows={2} onChange={event=>setProfile({...profile,bio:event.target.value})}/></label>
          <label>Interests<input value={interests} onChange={event=>setInterests(event.target.value)} maxLength={1800} placeholder="Design, technology, creative coding"/><small>Separate labels with commas. Up to 30 interests.</small></label>
          <label>Conversation goals<input value={goals} onChange={event=>setGoals(event.target.value)} maxLength={600} placeholder="Learn together, exchange ideas"/></label>
          <label>Languages<input value={languages} required onChange={event=>setLanguages(event.target.value)} maxLength={600} placeholder="English, Hindi, Gujarati"/></label>
          <div className="rp-preference-row"><label>Communication<select value={profile.communication_style} onChange={event=>setProfile({...profile,communication_style:event.target.value as CommunicationStyle})}>{['flexible','direct','empathetic','analytical','casual'].map(value=><option key={value}>{value}</option>)}</select></label><label>Group preference<select value={profile.interaction_preference} onChange={event=>setProfile({...profile,interaction_preference:event.target.value as InteractionPreference})}>{['flexible','one-on-one','small-group','large-group'].map(value=><option key={value}>{value}</option>)}</select></label></div>
          <fieldset className="rp-contact-modes"><legend>Conversation preferences</legend>{(['text','audio','video'] as ContactMode[]).map(mode=><label className="rp-connected-check" key={mode}><input type="checkbox" checked={profile.contact_modes.includes(mode)} disabled={profile.contact_modes.length===1&&profile.contact_modes.includes(mode)} onChange={event=>setProfile({...profile,contact_modes:event.target.checked?[...profile.contact_modes,mode]:profile.contact_modes.filter(value=>value!==mode)})}/><span>{mode}</span></label>)}</fieldset>
          <label className="rp-connected-check"><input type="checkbox" checked={profile.discoverable} onChange={event=>setProfile({...profile,discoverable:event.target.checked})}/><span>Let people with shared preferences discover my alias and introduction.</span></label>
          <label className="rp-connected-check"><input type="checkbox" checked={profile.share_presence} onChange={event=>setProfile({...profile,share_presence:event.target.checked})}/><span>Show when I’m online to people who accepted a connection with me.</span></label>
          <small>Discovery starts off. You can switch it off at any time. Choose at least one conversation preference. Chat requires an accepted connection. Calls are not available yet.</small>
          <button className="btn primary" disabled={busy}>Save preferences</button>
        </form></div>
        <div className="rp-connected-panel rp-find-panel"><div className="rp-match-orbit"><Users size={48}/><Sparkles size={22}/></div><h2>A little common ground.</h2><p>Find people who opted into discovery and share your interests, language, and contact preferences.</p><button className="btn primary" disabled={busy||unsaved} onClick={()=>findPeople()}><Compass size={17}/>Find people</button>
          {unsaved&&<p className="rp-score-note">Save your changes before finding people.</p>}
          {aiEnabled?<div className="rp-ai-search"><h3><Sparkles size={18}/>Ask with AI</h3><label>Your request<textarea value={prompt} onChange={event=>setPrompt(event.target.value)} maxLength={500} rows={3} placeholder="Find five people who share my interest in design."/></label><label className="rp-connected-check"><input type="checkbox" checked={aiConsent} onChange={event=>setAIConsent(event.target.checked)}/><span>Allow my request and declared interests to be sent to the AI provider for this search.</span></label><button className="btn secondary" disabled={busy||unsaved||!prompt.trim()||!aiConsent} onClick={()=>findPeople(true)}>Find with AI</button><small>AI helps interpret your request. Every match follows the same discovery controls.</small></div>:<p className="rp-score-note">AI search is currently unavailable. Find people uses your saved preferences.</p>}
        </div>
      </div>
      <section className="rp-real-matches" aria-labelledby="rp-matches-title"><h2 id="rp-matches-title">{matched?'Your matches':'People you may connect with'}</h2><p className="rp-score-note">Scores describe declared preference similarity.</p>{matches.length?<div className="rp-real-match-grid">{matches.map(match=><article className="rp-real-match" key={match.user_id}><div className="rp-real-match-header"><span className="avatar lavender" aria-hidden="true">{match.avatar}</span><div><h3>{match.display_name}</h3><span className="rp-match-score">{match.similarity_score}% preference similarity</span></div></div>{match.bio&&<p>{match.bio}</p>}<ul>{match.reasons.map(reason=><li key={reason}>{reason}</li>)}</ul><div className="rp-real-match-actions"><button className="btn secondary small" disabled={busy} onClick={()=>action(async()=>{await roleplayAPI.feedback(match.user_id,'interested');setNotice('Interest saved. You can request a connection when you’re ready.');})}><Heart size={15}/>Interested</button><button className="btn primary small" disabled={busy||!match.compatible_contact_modes.includes('text')} onClick={()=>action(async()=>{const connection=await roleplayAPI.requestConnection(match.user_id);setNotice(connection.status==='accepted'?'You are connected. Open Messages to chat.':'Connection requested. They can accept or decline in Messages.');})}>Connect</button><button className="icon-btn" disabled={busy} aria-label={`Dismiss ${match.display_name}`} onClick={()=>action(async()=>{await roleplayAPI.feedback(match.user_id,'dismiss');removeMatch(match.user_id);})}><X size={18}/></button><button className="text-link" disabled={busy} onClick={()=>action(async()=>{await roleplayAPI.block(match.user_id);removeMatch(match.user_id);setBlocks(await roleplayAPI.getBlocks());})}>Block</button></div></article>)}</div>:<p className="rp-match-empty">{matched?'No eligible matches yet. More people need to join and opt into discovery.':'Save your preferences, then choose Find people.'}</p>}</section>
      <div className="rp-connected-panel rp-account-tools"><h2>Your data. Your controls.</h2><div className="rp-account-actions"><button className="btn secondary" disabled={busy} onClick={()=>action(async()=>{const data=await roleplayAPI.exportAccount();const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='roleplay-account.json';link.click();URL.revokeObjectURL(url);})}><Download size={16}/>Export account</button><button className="btn secondary" disabled={busy} onClick={()=>action(async()=>{setBlocks(await roleplayAPI.getBlocks());setNotice('Blocked connections loaded below.');})}>Manage blocks</button></div>{blocks.length>0&&<ul className="rp-block-list">{blocks.map(id=><li key={id}><code>{id.slice(0,8)}…</code><button className="text-link" disabled={busy} onClick={()=>action(async()=>{await roleplayAPI.unblock(id);setBlocks(current=>current.filter(value=>value!==id));})}>Unblock</button></li>)}</ul>}<details className="rp-delete-account"><summary>Delete my account</summary><p>This removes your account, connections and their message history, reports involving you, notifications, sessions, blocks, and recommendation feedback.</p><form onSubmit={event=>{event.preventDefault();const password=String(new FormData(event.currentTarget).get('confirm-password'));action(async()=>{await roleplayAPI.deleteAccount(password);setProfile(null);setMatches([]);setBlocks([]);setNotice('Your account has been deleted.');});}}><label>Confirm with your password<input name="confirm-password" type="password" required autoComplete="current-password" maxLength={128}/></label><button className="btn danger" disabled={busy}>Permanently delete account</button></form></details></div>
    </>}
  </section>;
}
