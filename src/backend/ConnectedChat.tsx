import {useCallback,useEffect,useRef,useState,type FormEvent} from 'react';
import {CheckCheck,Flag,MessageCircle,RefreshCw,Send,Shield,Users,X} from 'lucide-react';
import {APIError,roleplayAPI,type ChatMessage,type Connection,type Conversation,type LiveConnection,type LiveStatus,type ReportReason} from './client';
import {AccountGate,useAccount} from './useAccount';
import './connected.css';

const merge=(first:ChatMessage[],second:ChatMessage[])=>{
  const bySequence=new Map(first.map(message=>[message.sequence,message]));
  for(const message of second){if(!bySequence.get(message.sequence)?.removed)bySequence.set(message.sequence,message);}
  return [...bySequence.values()].sort((a,b)=>a.sequence-b.sequence);
};
const when=(value:string)=>new Date(value).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
const presenceLabel={online:'Online',offline:'Offline',hidden:'Presence private',unknown:'Presence unavailable'};

export function ConnectedChat(){
  const {profile,loading,error,setError}=useAccount();
  const [connections,setConnections]=useState<Connection[]>([]);
  const [conversations,setConversations]=useState<Conversation[]>([]);
  const [selected,setSelected]=useState<string|null>(null);
  const [messages,setMessages]=useState<ChatMessage[]>([]);
  const [hasOlder,setHasOlder]=useState(false);
  const [draft,setDraft]=useState('');
  const [busy,setBusy]=useState(false);
  const [notice,setNotice]=useState('');
  const [status,setStatus]=useState<LiveStatus>('connecting');
  const [report,setReport]=useState<{target_user_id?:string;message_id?:string;label:string}|null>(null);
  const [isModerator,setIsModerator]=useState(false);
  const live=useRef<LiveConnection|null>(null);
  const current=useRef<string|null>(selected);current.current=selected;
  const history=useRef<ChatMessage[]>(messages);history.current=messages;
  const bottom=useRef<HTMLDivElement>(null);
  const lastSequence=useRef(0);

  const refresh=useCallback(async()=>{
    if(!profile)return;
    const [requests,threads]=await Promise.all([roleplayAPI.connections(),roleplayAPI.conversations()]);
    setConnections(requests);setConversations(threads);
    if(current.current&&!threads.some(thread=>thread.id===current.current)){setSelected(null);setMessages([]);setNotice('This conversation is no longer available.');}
  },[profile]);

  const load=useCallback(async(id:string,after?:number)=>{
    const page=await roleplayAPI.messages(id,after===undefined?{}:{after,limit:100});
    if(current.current!==id)return;
    setMessages(value=>after===undefined?page.messages:merge(value,page.messages));
    if(after===undefined)setHasOlder(page.has_more);
    if(page.has_more&&after!==undefined&&page.messages.length){await load(id,page.messages.at(-1)!.sequence);}
    if(!document.hidden&&page.messages.length)await roleplayAPI.readConversation(id,page.messages.at(-1)!.sequence);
  },[]);

  useEffect(()=>{
    if(!profile)return;
    let active=true;
    refresh().catch(err=>{if(active)setError(err.message);});
    roleplayAPI.accountCapabilities().then(value=>{if(active)setIsModerator(value.is_moderator);}).catch(()=>{});
    const connection=roleplayAPI.live(event=>{
      if(!active)return;
      if(['ready','pong','connections.updated','chat.updated'].includes(event.type))void refresh().catch(()=>{});
      if(event.type==='ready'&&current.current)void load(current.current).catch(()=>{});
      if(event.type==='chat.updated'&&event.conversation_id===current.current&&typeof event.sequence==='number')void load(event.conversation_id,Math.max(0,event.sequence-1)).catch(()=>{});
    },value=>{if(active)setStatus(value);});
    live.current=connection;
    // Durable HTTP catch-up handles missed Redis broadcasts and reconnect gaps.
    const timer=setInterval(()=>{
      if(document.hidden)return;
      void refresh().catch(()=>{});
      if(current.current)void load(current.current,Math.max(0,(history.current[0]?.sequence||1)-1)).catch(()=>{});
    },20000);
    return()=>{active=false;clearInterval(timer);connection.close();live.current=null;};
  },[profile,refresh,load,setError]);

  useEffect(()=>{
    setMessages([]);setHasOlder(false);setDraft('');setReport(null);lastSequence.current=0;
    if(selected)void load(selected).catch(err=>setError(err.message));
  },[selected,load,setError]);

  useEffect(()=>{
    const sequence=messages.at(-1)?.sequence||0;
    if(sequence>lastSequence.current)bottom.current?.scrollIntoView({block:'nearest',behavior:'auto'});
    lastSequence.current=sequence;
  },[messages]);

  async function action(work:()=>Promise<void>){setBusy(true);setError('');setNotice('');try{await work();}catch(err){setError(err instanceof Error?err.message:'Please try again.');}finally{setBusy(false);}}
  async function send(event:FormEvent){
    event.preventDefault();const id=selected,body=draft.trim();if(!id||!body||busy)return;
    const value={conversation_id:id,body,client_message_id:crypto.randomUUID()};
    await action(async()=>{
      let saved:ChatMessage;
      try{if(!live.current)throw new APIError(0,'Live updates unavailable');saved=await live.current.send(value);}
      catch(err){if(err instanceof APIError&&err.status!==0)throw err;saved=await roleplayAPI.sendMessage(value);}
      if(current.current===id){setMessages(previous=>merge(previous,[saved]));setDraft('');}
      await refresh();
    });
  }
  async function older(){if(!selected||!messages.length)return;await action(async()=>{const page=await roleplayAPI.messages(selected,{before:messages[0].sequence});if(current.current===selected){setMessages(value=>merge(page.messages,value));setHasOlder(page.has_more);}});}
  async function decide(id:string,decision:'accept'|'decline'|'cancel'){await action(async()=>{const result=await roleplayAPI.decideConnection(id,decision);await refresh();if(result.conversation_id)setSelected(result.conversation_id);setNotice(decision==='accept'?'Connection accepted. You can now chat.':decision==='decline'?'Request declined.':'Request cancelled.');});}

  if(loading||!profile)return <AccountGate loading={loading} error={error}/>;
  const active=conversations.find(item=>item.id===selected);
  const pending=connections.filter(item=>item.status==='pending');
  return <section className="rp-connected rp-chat-page">
    <div className="rp-connected-heading"><div><span className="eyebrow"><MessageCircle size={16}/>YOUR CONVERSATIONS</span><h1>Good company. Real conversation.</h1><p>Connect by choice. Share at your pace.</p></div><div className="rp-chat-links"><a href="#/app/people" className="btn secondary"><Users size={16}/>Find people</a><a href="#/app/notifications" className="text-link">Notifications</a>{isModerator&&<a href="#/app/moderation" className="text-link">Moderation</a>}</div></div>
    {error&&<p role="alert" className="rp-api-error">{error}</p>}{notice&&<p role="status" className="rp-api-notice">{notice}</p>}
    {status==='signed_out'&&<p className="rp-api-error">Your session ended. <a href="#/app/people">Sign in again</a>.</p>}
    {pending.length>0&&<div className="rp-connected-panel rp-requests"><h2><Shield size={20}/>Connection requests</h2>{pending.map(item=><article key={item.id}><div><span className="avatar lavender">{item.peer.avatar}</span><div><h3>{item.peer.display_name}</h3><small>{item.requested_by===profile.user_id?'Waiting for their reply':'Would like to connect with you'}</small></div></div><div>{item.requested_by===profile.user_id?<button className="text-link" disabled={busy} onClick={()=>decide(item.id,'cancel')}>Cancel request</button>:<><button className="btn primary small" disabled={busy} onClick={()=>decide(item.id,'accept')}>Accept</button><button className="btn secondary small" disabled={busy} onClick={()=>decide(item.id,'decline')}>Decline</button></>}</div></article>)}</div>}
    <div className="rp-chat-layout">
      <aside className="rp-connected-panel rp-thread-list"><div className="rp-section-title"><h2>Messages</h2><button className="icon-btn" aria-label="Refresh conversations" disabled={busy} onClick={()=>action(refresh)}><RefreshCw size={18}/></button></div><small className={`rp-live-state ${status}`}>{status==='live'?'Live updates connected':status==='connecting'?'Connecting live updates…':'Messages sync when you refresh.'}</small>{conversations.length?conversations.map(item=><button key={item.id} className={`rp-thread ${selected===item.id?'active':''}`} onClick={()=>setSelected(item.id)}><span className="avatar lavender">{item.peer.avatar}</span><span><b>{item.peer.display_name}</b><small>{presenceLabel[item.presence]}</small></span>{item.last_sequence>item.last_read_sequence&&<span className="rp-unread-dot" aria-label="Unread messages"/>}</button>):<p>Find someone who shares your interests, then send a connection request.</p>}</aside>
      <div className="rp-connected-panel rp-chat-window">{active?<>
        <div className="rp-chat-window-heading"><div><span className="avatar lavender">{active.peer.avatar}</span><div><h2>{active.peer.display_name}</h2><small>{presenceLabel[active.presence]}</small></div></div><div className="rp-chat-tools"><button className="icon-btn" aria-label={`Report ${active.peer.display_name}`} onClick={()=>setReport({target_user_id:active.peer.user_id,label:active.peer.display_name})}><Flag size={18}/></button><button className="text-link" disabled={busy} onClick={()=>action(async()=>{await roleplayAPI.block(active.peer.user_id);setSelected(null);setMessages([]);await refresh();setNotice('Blocked. This person can no longer message you.');})}>Block</button><button className="icon-btn rp-mobile-back" aria-label="Back to conversation list" onClick={()=>setSelected(null)}><X size={18}/></button></div></div>
        <p className="rp-score-note">Messages are stored on this ROLEPLAY instance. Reported messages can be reviewed by its moderators. This chat is not end-to-end encrypted.</p>
        <div className="rp-chat-history" role="log" aria-label={`Conversation with ${active.peer.display_name}`}>
          {hasOlder&&<button className="text-link rp-older" disabled={busy} onClick={older}>Load older messages</button>}
          {messages.length?messages.map(message=><article key={message.id} className={`rp-message ${message.sender_id===profile.user_id?'mine':'theirs'}`}><p>{message.removed?<em>Message removed</em>:message.body}</p><div className="rp-message-meta"><time dateTime={message.created_at}>{when(message.created_at)}</time>{message.sender_id===profile.user_id&&message.sequence<=active.peer_read_sequence&&<span aria-label="Read"><CheckCheck size={14}/></span>}{!message.removed&&(message.sender_id===profile.user_id?<button className="text-link" disabled={busy} onClick={()=>action(async()=>{await roleplayAPI.retractMessage(message.id);await load(active.id,message.sequence-1);})}>Remove</button>:<button className="icon-btn" aria-label="Report this message" onClick={()=>setReport({message_id:message.id,label:'this message'})}><Flag size={13}/></button>)}</div></article>):<p className="rp-chat-empty">Say hello. Leave room for a new perspective.</p>}<div ref={bottom}/>
        </div>
        <form className="rp-message-composer" onSubmit={send}><label className="sr-only" htmlFor="rp-message">Message</label><textarea id="rp-message" value={draft} onChange={event=>setDraft(event.target.value)} maxLength={3000} rows={2} placeholder="Share a thought…" required disabled={busy}/><button className="btn primary" disabled={busy||!draft.trim()} aria-label="Send message"><Send size={18}/></button></form>
        {report&&<div className="rp-report-form"><div className="rp-section-title"><h3>Report {report.label}</h3><button className="icon-btn" aria-label="Close report form" onClick={()=>setReport(null)}><X size={18}/></button></div><form onSubmit={event=>{event.preventDefault();const data=new FormData(event.currentTarget);void action(async()=>{const {label:_,...target}=report;await roleplayAPI.report({...target,reason:String(data.get('reason')) as ReportReason,details:String(data.get('details'))});setReport(null);setNotice('Report saved for the instance moderators to review.');});}}><label>Reason<select name="reason">{['harassment','hate','spam','impersonation','safety','other'].map(reason=><option key={reason}>{reason}</option>)}</select></label><label>What happened?<textarea name="details" maxLength={500} rows={2}/></label><small>For a message report, its text is shared with the moderators as evidence.</small><button className="btn secondary" disabled={busy}>Submit report</button></form></div>}
      </>:<div className="rp-chat-placeholder"><MessageCircle size={54}/><h2>A space for a new hello.</h2><p>Choose a conversation or accept a request to get started.</p><a href="#/app/people" className="btn primary">Find your people</a></div>}</div>
    </div>
  </section>;
}
