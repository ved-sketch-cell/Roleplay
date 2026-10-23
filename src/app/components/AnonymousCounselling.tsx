import {useCallback,useEffect,useRef,useState,type ReactNode} from 'react';
import {ArrowLeft,ArrowRight,CalendarDays,Check,CheckCircle2,Clock3,HeartHandshake,Info,Languages,MessageCircle,Mic,NotebookPen,Pencil,ShieldCheck,Trash2,UserRound,X} from 'lucide-react';
import {JourneyDialog} from '../mobile/JourneyDialog';
import {SectionHeading} from '../mobile/MobileUI';
import {CounsellingIllustration} from '../mobile/CounsellingCard';
import {useDeviceState,type MobileIdentity} from '../mobile/state';
import {emptySessionDraft,localSessionDate,normalizeSessionDraft,normalizeSessionRequests,sessionFormats,sessionLanguages,sessionTimeError,sessionWhen,supportTopics,type SessionDraft,type SessionPreferences,type SessionRequest} from '../mobile/counselling';
import '../mobile/counselling.css';

type Dialog={kind:'details'|'cancel'|'delete'|'discard'|'replace';id?:string}|null;
function Choices({legend,options,value,onChange}:{legend:string;options:{value:string;label:string;description?:string;icon?:ReactNode}[];value:string;onChange:(value:string)=>void}){
  const name=legend.replace(/\s/g,'-');
  return <fieldset className="counselling-choices"><legend>{legend}</legend><div>{options.map(option=><label key={option.value} className={value===option.value?'is-selected':''}><input type="radio" name={name} value={option.value} checked={value===option.value} onChange={()=>onChange(option.value)}/>{option.icon&&<span className="counselling-option-icon" aria-hidden="true">{option.icon}</span>}<span><strong>{option.label}</strong>{option.description&&<small>{option.description}</small>}</span><span className="counselling-radio" aria-hidden="true">{value===option.value&&<Check size={12}/>}</span></label>)}</div></fieldset>;
}
function PreferenceSummary({preferences,alias}:{preferences:SessionPreferences;alias:string}){
  return <dl className="counselling-summary"><div><dt><UserRound size={15}/>Session alias</dt><dd>{alias}</dd></div><div><dt><HeartHandshake size={15}/>Support topic</dt><dd>{preferences.topic||'Not chosen'}</dd></div><div><dt><MessageCircle size={15}/>Format & length</dt><dd>{preferences.format} · {preferences.duration} minutes</dd></div><div><dt><Languages size={15}/>Language preference</dt><dd>{preferences.language}</dd></div><div><dt><CalendarDays size={15}/>Timing preference</dt><dd>{sessionWhen(preferences)}</dd></div>{preferences.goal&&<div className="counselling-summary-note"><dt><NotebookPen size={15}/>Your optional note</dt><dd>{preferences.goal}</dd></div>}</dl>;
}
export function AnonymousCounselling({onBack,identity}:{onBack:()=>void;identity:MobileIdentity}){
  const [storedDraft,setDraft]=useDeviceState<SessionDraft>('counselling-draft',emptySessionDraft);
  const [storedRequests,setRequests]=useDeviceState<SessionRequest[]>('counselling-requests',[]);
  const draft=normalizeSessionDraft(storedDraft),requests=normalizeSessionRequests(storedRequests);
  const [view,setView]=useState<'overview'|'request'>('overview');
  const [dialog,setDialog]=useState<Dialog>(null);
  const [notice,setNotice]=useState('');
  const heading=useRef<HTMLHeadingElement>(null),body=useRef<HTMLDivElement>(null);
  const closeDialog=useCallback(()=>setDialog(null),[]);
  const selected=requests.find(r=>r.id===dialog?.id);
  const edited=requests.find(r=>r.id===draft.editingId&&r.status==='saved');
  const alias=edited?.alias||(typeof identity.username==='string'&&identity.username.trim()?identity.username.trim().slice(0,40):'ROLEPLAY guest');
  const timeError=sessionTimeError(draft);
  useEffect(()=>{heading.current?.focus({preventScroll:true});body.current?.scrollTo({top:0});},[view,draft.step]);
  const patch=(value:Partial<SessionDraft>)=>setDraft(previous=>({...normalizeSessionDraft(previous),...value,active:true}));
  const start=()=>{if(!draft.active)setDraft({...emptySessionDraft,active:true});setNotice('');setView('request');};
  const edit=(request:SessionRequest)=>{setDraft({...normalizeSessionDraft(request),active:true,editingId:request.id,step:1});setNotice('');setDialog(null);setView('request');};
  const askEdit=(request:SessionRequest)=>{if(draft.active&&draft.editingId!==request.id)setDialog({kind:'replace',id:request.id});else edit(request);};
  const save=()=>{
    if(!draft.topic){patch({step:1});return;}
    if(sessionTimeError(draft)){patch({step:2});return;}
    if(draft.editingId&&!edited){setNotice('That request is no longer active. Your draft has been cleared.');setDraft(emptySessionDraft);setView('overview');return;}
    const now=new Date().toISOString();
    const preferences:SessionPreferences={topic:draft.topic,format:draft.format,duration:draft.duration,language:draft.language,timing:draft.timing,date:draft.timing==='preferred'?draft.date:'',time:draft.timing==='preferred'?draft.time:'',goal:draft.goal.trim()};
    const request:SessionRequest={...preferences,id:edited?.id||crypto.randomUUID(),alias,created:edited?.created||now,updated:now,status:'saved'};
    setRequests(previous=>[request,...normalizeSessionRequests(previous).filter(r=>r.id!==request.id)]);
    setDraft(emptySessionDraft);setView('overview');setNotice(edited?'Request updated on this device. No counsellor has been contacted.':'Request saved on this device. No counsellor has been contacted.');
  };
  const cancel=(request:SessionRequest)=>{
    setRequests(previous=>normalizeSessionRequests(previous).map(r=>r.id===request.id?{...r,status:'cancelled',updated:new Date().toISOString()}:r));
    if(draft.editingId===request.id)setDraft(emptySessionDraft);
    setDialog(null);setNotice('Preview request cancelled. Delete it to remove its saved notes.');
  };
  const remove=(request:SessionRequest)=>{
    setRequests(previous=>normalizeSessionRequests(previous).filter(r=>r.id!==request.id));
    if(draft.editingId===request.id)setDraft(emptySessionDraft);
    setDialog(null);setNotice('Request and its notes deleted from this browser.');
  };
  const discard=()=>{setDraft(emptySessionDraft);setDialog(null);setView('overview');setNotice('Draft deleted. Saved requests are unchanged.');};

  return <div className="counselling-page">
    <header className="counselling-header"><button className="mobile-icon-button" onClick={view==='request'?()=>draft.step>1?patch({step:(draft.step-1) as 1|2}):setView('overview'):onBack} aria-label={view==='request'?draft.step>1?'Previous request step':'Back to counselling':'Back to Challenges'}><ArrowLeft size={20}/></button><div><span className="mobile-eyebrow">SUPPORT, AT YOUR PACE</span><h1>Anonymous counselling</h1></div>{view==='request'&&<button className="mobile-icon-button" onClick={()=>setView('overview')} aria-label="Close session request"><X size={20}/></button>}</header>
    {view==='request'&&<ol className="counselling-stepper" aria-label="Session request steps">{['Support','Preferences','Review'].map((label,index)=><li key={label} aria-current={draft.step===index+1?'step':undefined}><span>{index+1}</span>{label}</li>)}</ol>}
    <div className="counselling-body" ref={body}>
      {view==='overview'?<>
        <section className="counselling-intro"><div className="counselling-intro-art"><CounsellingIllustration/></div><span className="counselling-label"><HeartHandshake size={15}/>A SPACE TO TALK</span><h2 ref={heading} tabIndex={-1}>You don’t have to<br/><span>figure it out alone.</span></h2><p>Choose a topic, a format, and what you’d like from a session. Use your ROLEPLAY alias.</p></section>
        <div className="counselling-preview-note"><Info size={18}/><p><strong>Session planning preview</strong>No provider is connected. Requests, drafts, and optional notes stay in this browser. No appointment is booked.</p></div>
        {notice&&<p className="counselling-notice" role="status"><CheckCircle2 size={18}/>{notice}</p>}
        <section className="counselling-start"><div className="counselling-chips"><span><UserRound size={14}/>Alias, no real-name field</span><span><Clock3 size={14}/>20 or 40 min</span></div><button className="mobile-primary-button" onClick={start}>{draft.active?'Resume session request':'Plan a session'}<ArrowRight size={17}/></button>{draft.active&&<div className="counselling-draft-line"><small>Draft saved · step {draft.step} of 3{draft.editingId?' · editing a request':''}</small><button className="mobile-text-button" onClick={()=>setDialog({kind:'discard'})}><Trash2 size={14}/>Delete draft</button></div>}</section>
        <section className="counselling-how"><h3>How it works</h3><ol><li><span>01</span><div><strong>Choose your support</strong><p>Pick what’s on your mind, or “Not sure yet”.</p></div></li><li><span>02</span><div><strong>Set your preferences</strong><p>Text or voice, language, and a preferred time.</p></div></li><li><span>03</span><div><strong>Review your request</strong><p>Save locally. Edit or delete it any time.</p></div></li></ol></section>
        <section className="counselling-requests"><SectionHeading title="Your session requests"><span className="counselling-count">{requests.length}</span></SectionHeading>{requests.length?<div className="counselling-request-list">{requests.map(request=><article className="counselling-request-card" key={request.id}><span className={`counselling-request-status ${request.status==='cancelled'?'is-cancelled':''}`}>{request.status==='cancelled'?'Cancelled preview':'Saved on this device'}</span><h3>{request.topic||'Support session'}</h3><p>{request.format} · {request.duration} min · {request.language}</p><small>{sessionWhen(request)}</small><button className="mobile-secondary-button" onClick={()=>setDialog({kind:'details',id:request.id})} aria-label={`View ${request.topic||'support'} request`}>View request<ArrowRight size={16}/></button></article>)}</div>:<div className="counselling-empty"><NotebookPen size={26}/><strong>No requests yet.</strong><p>Your saved session preferences will appear here.</p></div>}</section>
        <p className="counselling-data-note"><ShieldCheck size={16}/>No XP, scores, or challenge progress are attached to counselling requests. Your chat mood and boundaries aren’t imported.</p>
      </>:<>
        <div className="counselling-preview-note is-compact"><Info size={17}/><p>Preview only. Drafts save in this browser; nothing is sent to a counsellor.</p></div>
        <h2 ref={heading} tabIndex={-1}>{draft.step===1?'What would you like support with?':draft.step===2?'Make the session yours.':'Your request, your choice.'}</h2>
        <p className="counselling-description">{draft.step===1?'You can keep it broad. No explanation is needed.':draft.step===2?'These are preferences, not confirmed services or available times.':'Check the details before saving them on this device.'}</p>
        {draft.step===1?<>
          <Choices legend="Support topic" options={supportTopics.map((topic,index)=>({value:topic,label:topic,icon:[<HeartHandshake size={20}/>,<MessageCircle size={20}/>,<UserRound size={20}/>,<NotebookPen size={20}/>,<ShieldCheck size={20}/>,<HeartHandshake size={20}/>][index]}))} value={draft.topic} onChange={topic=>patch({topic})}/>
          <Choices legend="How would you prefer to talk?" options={sessionFormats.map(format=>({value:format,label:format,description:format==='Text'?'Write at your own pace':'A conversation without video',icon:format==='Text'?<MessageCircle size={21}/>:<Mic size={21}/>}))} value={draft.format} onChange={format=>patch({format:format as SessionPreferences['format']})}/>
          <Choices legend="Preferred session length" options={[{value:'20',label:'20 minutes',description:'A shorter conversation',icon:<Clock3 size={20}/>},{value:'40',label:'40 minutes',description:'More room to talk',icon:<Clock3 size={20}/>}]} value={String(draft.duration)} onChange={duration=>patch({duration:duration==='40'?40:20})}/>
        </>:draft.step===2?<>
          <label className="counselling-field">Language preference<select value={draft.language} onChange={event=>patch({language:event.target.value as SessionPreferences['language']})}>{sessionLanguages.map(language=><option key={language}>{language}</option>)}</select></label>
          <Choices legend="Timing preference" options={[{value:'flexible',label:'I’m flexible',description:'No date or time needed'},{value:'preferred',label:'Choose a preferred time',description:'A preference only; availability is not connected'}]} value={draft.timing} onChange={timing=>patch({timing:timing as SessionPreferences['timing'],...(timing==='flexible'?{date:'',time:''}:{})})}/>
          {draft.timing==='preferred'&&<div className="counselling-date-fields"><label className="counselling-field">Preferred date<input type="date" aria-label="Preferred date" value={draft.date} min={localSessionDate()} onChange={event=>patch({date:event.target.value})}/></label><label className="counselling-field">Preferred time<input type="time" aria-label="Preferred time" value={draft.time} onChange={event=>patch({time:event.target.value})}/></label><small>Uses your device’s local time. This does not reserve an appointment.</small></div>}
          {timeError&&<p className="counselling-error" role="status">{timeError}</p>}
          <label className="counselling-field counselling-goal">Anything you’d like from the session?<span>Optional · skip if you prefer</span><textarea aria-label="Optional session note" value={draft.goal} maxLength={200} onChange={event=>patch({goal:event.target.value})} placeholder="For example: I’d like space to sort through my thoughts."/><small>{draft.goal.length}/200 · Avoid names, contact details, or identifying information.</small></label>
          {draft.goal&&<button className="mobile-text-button" onClick={()=>patch({goal:''})}><Trash2 size={15}/>Remove optional note</button>}
        </>:<>
          <PreferenceSummary preferences={draft} alias={alias}/><div className="counselling-review-actions"><button className="mobile-secondary-button" onClick={()=>patch({step:1})}><Pencil size={15}/>Edit support</button><button className="mobile-secondary-button" onClick={()=>patch({step:2})}><CalendarDays size={15}/>Edit preferences</button></div>
          <p className="counselling-data-note"><Info size={17}/>Saving creates a preview request in this browser. It does not book, pay for, or start a counselling session.</p>
          {timeError&&<p className="counselling-error" role="status">{timeError} Edit preferences to continue.</p>}
        </>}
      </>}
    </div>
    {view==='request'&&<footer className="counselling-footer"><button className="mobile-secondary-button" onClick={()=>draft.step===1?setView('overview'):patch({step:(draft.step-1) as 1|2})}>{draft.step===1?'Close for now':'Previous'}</button><button className="mobile-primary-button" disabled={draft.step===1?!draft.topic:!!timeError} onClick={()=>draft.step===3?save():patch({step:(draft.step+1) as 2|3})}>{draft.step===3?draft.editingId?'Save changes':'Save preview request':draft.step===2?'Review request':'Next'}<ArrowRight size={16}/></button></footer>}
    {dialog&&<JourneyDialog title={dialog.kind==='details'?'Your preview request':dialog.kind==='cancel'?'Cancel this request?':dialog.kind==='delete'?'Delete request and notes?':dialog.kind==='replace'?'Replace your current draft?':'Delete your draft?'} onClose={closeDialog}><div className="counselling-dialog-content">
      {dialog.kind==='details'&&selected?<><span className="counselling-request-status">{selected.status==='saved'?'Saved locally · not an appointment':'Cancelled preview'}</span><PreferenceSummary preferences={selected} alias={selected.alias}/><p>Nothing has been sent to a counselling provider.</p><div className="counselling-dialog-actions">{selected.status==='saved'&&<><button className="mobile-primary-button" onClick={()=>askEdit(selected)}><Pencil size={16}/>Edit request</button><button className="mobile-secondary-button" onClick={()=>setDialog({kind:'cancel',id:selected.id})}>Cancel preview request</button></>}<button className="mobile-text-button counselling-delete" onClick={()=>setDialog({kind:'delete',id:selected.id})}><Trash2 size={16}/>Delete request & notes</button></div></>:dialog.kind==='cancel'&&selected?<><p>This cancels the local preview request. Its notes remain until you delete it.</p><button className="mobile-secondary-button" onClick={()=>setDialog({kind:'details',id:selected.id})}>Keep request</button><button className="mobile-primary-button" onClick={()=>cancel(selected)}>Confirm cancellation</button></>:dialog.kind==='delete'&&selected?<><p>Remove this request and its optional note from this browser. This cannot be undone.</p><button className="mobile-secondary-button" onClick={()=>setDialog({kind:'details',id:selected.id})}>Keep request</button><button className="mobile-primary-button" onClick={()=>remove(selected)}>Delete request and notes</button></>:dialog.kind==='replace'&&selected?<><p>Your current draft and its optional note will be replaced. Saved requests stay as they are.</p><button className="mobile-secondary-button" onClick={closeDialog}>Keep current draft</button><button className="mobile-primary-button" onClick={()=>edit(selected)}>Replace draft and edit</button></>:dialog.kind==='discard'?<><p>Remove the unfinished draft and its optional note from this browser. Saved requests stay as they are.</p><button className="mobile-secondary-button" onClick={closeDialog}>Keep draft</button><button className="mobile-primary-button" onClick={discard}>Delete draft</button></>:<><p>This request is no longer available.</p><button className="mobile-primary-button" onClick={closeDialog}>Done</button></>}
    </div></JourneyDialog>}
  </div>;
}
