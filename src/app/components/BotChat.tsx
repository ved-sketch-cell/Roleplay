import {useCallback,useEffect,useRef,useState,type CSSProperties} from 'react';
import {ArrowLeft,Bot,Info,MoreHorizontal,RotateCcw,Send,Square,Trash2,X} from 'lucide-react';
import {BotAvatar} from '../mobile/BotAvatar';
import {JourneyDialog} from '../mobile/JourneyDialog';
import {useDeviceState} from '../mobile/state';
import {configuredBotEndpoint,normalizeBotMessages,requestBotReply,sampleBotReply,type AIBot,type BotMessage} from '../mobile/aiBots';
import '../mobile/bots.css';
export function BotChat({bot,onBack,endpoint=configuredBotEndpoint}:{bot:AIBot;onBack:()=>void;endpoint?:string|null}){
  const [stored,setMessages]=useDeviceState<BotMessage[]>(`bot-messages:${bot.id}`,[]),messages=normalizeBotMessages(stored);
  const [draft,setDraft]=useDeviceState(`bot-draft:${bot.id}`,'');
  const [dialog,setDialog]=useState<'about'|'clear'|null>(null),[busy,setBusy]=useState<string|null>(null),[error,setError]=useState('');
  const closeDialog=useCallback(()=>setDialog(null),[]);
  const controller=useRef<AbortController|null>(null),attempt=useRef(0),mounted=useRef(true),scroll=useRef<HTMLDivElement>(null),input=useRef<HTMLTextAreaElement>(null);
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;attempt.current++;controller.current?.abort();};},[]);
  useEffect(()=>{scroll.current?.scrollTo({top:scroll.current.scrollHeight,behavior:'auto'});},[messages.length,busy]);
  const unanswered=messages.filter(message=>message.role==='user'&&['pending','failed'].includes(message.status||'')&&!messages.some(reply=>reply.replyTo===message.id));
  const reply=async(user:BotMessage,history:BotMessage[])=>{
    if(!endpoint)return;
    const token=++attempt.current,current=new AbortController();controller.current?.abort();controller.current=current;setBusy(user.id);setError('');
    setMessages(previous=>normalizeBotMessages(previous).map(message=>message.id===user.id?{...message,status:'pending'}:message));
    const timeout=setTimeout(()=>current.abort(),30000);
    try{
      const text=await requestBotReply(bot.id,history,user.id,current.signal,endpoint);
      if(!mounted.current||token!==attempt.current||current.signal.aborted)return;
      const response:BotMessage={id:crypto.randomUUID(),role:'assistant',text,created:new Date().toISOString(),source:'ai',replyTo:user.id};
      setMessages(previous=>normalizeBotMessages(previous).flatMap(message=>message.id===user.id?[{...message,status:'sent'},response]:[message]));
    }catch(error){
      if(!mounted.current||token!==attempt.current)return;
      setMessages(previous=>normalizeBotMessages(previous).map(message=>message.id===user.id?{...message,status:'failed'}:message));
      setError(current.signal.aborted?'Reply paused. Your message is saved; retry when you’re ready.':error instanceof Error?error.message:'The AI service could not reply. Your message is saved.');
    }finally{clearTimeout(timeout);if(mounted.current&&token===attempt.current){setBusy(null);controller.current=null;}}
  };
  const send=()=>{
    const text=draft.trim();if(!text||busy||text.length>1000)return;
    const user:BotMessage={id:crypto.randomUUID(),role:'user',text,source:'user',created:new Date().toISOString(),status:endpoint?'pending':'sent'};
    if(endpoint){setMessages([...messages,user]);setDraft('');void reply(user,[...messages,user]);}
    else {const response:BotMessage={id:crypto.randomUUID(),role:'assistant',text:sampleBotReply(bot,text),source:'sample',created:new Date().toISOString(),replyTo:user.id};setMessages([...messages,user,response]);setDraft('');}
  };
  const retry=(message:BotMessage)=>{if(busy)return;const index=messages.findIndex(item=>item.id===message.id);void reply(message,messages.slice(0,index+1));};
  const clear=()=>{attempt.current++;controller.current?.abort();controller.current=null;setBusy(null);setMessages([]);setDraft('');setError('');setDialog(null);input.current?.focus();};
  return <section className="bot-chat" style={{'--bot-accent':bot.tone,'--bot-secondary':bot.secondary} as CSSProperties}>
    <header className="bot-chat-header"><button className="mobile-icon-button" onClick={onBack} aria-label="Back to conversations"><ArrowLeft size={20}/></button><BotAvatar bot={bot}/><div><h1 tabIndex={-1}>{bot.name}<span><Bot size={11}/>AI BOT</span></h1><p>{bot.role}</p></div><button className="mobile-icon-button" aria-label="Bot details" onClick={()=>setDialog('about')}><MoreHorizontal size={21}/></button></header>
    <div className="bot-mode-note"><Info size={16}/><span>{endpoint?'Live AI mode · messages are sent to the configured AI service.':'Preview mode · replies are written samples. AI isn’t connected.'}</span></div>
    <div className="bot-chat-body" ref={scroll}>
      {!messages.length&&<div className="bot-chat-welcome"><BotAvatar bot={bot}/><span className="bot-welcome-label">{endpoint?'YOUR AI CONVERSATION':'MEET YOUR BOT PREVIEW'}</span><h2>A little {bot.id==='muse'?'inspiration':bot.id==='orbit'?'perspective':bot.id==='pixel'?'product thinking':'play'}?</h2><p>{bot.intro}</p><small>Choose a starter or write your own message.</small></div>}
      <div className="bot-chat-log" role="log" aria-label={`Conversation with ${bot.name}`}>{messages.map(message=><article key={message.id} className={`bot-message ${message.role==='user'?'is-user':'is-bot'}`}><div className="bot-message-meta"><strong>{message.role==='user'?'You':bot.name}</strong><span>{message.role==='assistant'?(message.source==='sample'?'Written sample':'AI reply'):''}</span></div><p>{message.text}</p><time dateTime={message.created}>{new Date(message.created).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</time>{message.role==='user'&&unanswered.some(item=>item.id===message.id)&&busy!==message.id&&<div className="bot-retry"><small>Reply unfinished · your message is saved</small>{endpoint&&<button className="mobile-text-button" onClick={()=>retry(message)} disabled={!!busy}><RotateCcw size={14}/>Retry reply</button>}</div>}</article>)}</div>
      {busy&&<div className="bot-reply-pending" role="status"><Bot size={17}/><span>Waiting for the AI service…</span><button className="mobile-text-button" onClick={()=>controller.current?.abort()}><Square size={13}/>Stop reply</button></div>}
      {error&&<div className="bot-reply-error" role="alert"><p>{error}</p><button className="mobile-icon-button" aria-label="Dismiss bot reply error" onClick={()=>setError('')}><X size={16}/></button></div>}
      <div className="bot-starters" aria-label="Bot conversation starters"><span>{messages.length?'Try another direction':'A place to start'}</span>{bot.starters.map(starter=><button key={starter} disabled={!!busy} onClick={()=>{setDraft(starter);input.current?.focus();}}>{starter}</button>)}</div>
    </div>
    <footer className="bot-chat-footer"><form onSubmit={event=>{event.preventDefault();send();}}><label className="bot-composer-label" htmlFor={`bot-draft-${bot.id}`}>Message {bot.name}</label><div className="bot-composer"><textarea ref={input} id={`bot-draft-${bot.id}`} aria-label={`Message ${bot.name}`} value={draft} maxLength={1000} rows={2} onChange={event=>setDraft(event.target.value)} onKeyDown={event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.nativeEvent.isComposing){event.preventDefault();send();}}} placeholder={`Message ${bot.name}…`}/><button className="bot-send" type="submit" aria-label={endpoint?'Send to AI bot':'Send preview message'} disabled={!draft.trim()||!!busy}><Send size={19}/></button></div></form><div className="bot-footer-meta"><small>{endpoint?'AI replies can be mistaken.':'Sample replies · no message leaves this browser.'} {draft.length}/1000</small><button className="mobile-text-button" aria-label="Clear bot conversation" onClick={()=>setDialog('clear')}><Trash2 size={13}/>Clear</button></div></footer>
    {dialog&&<JourneyDialog title={dialog==='about'?`${bot.name} · AI bot`:'Clear this bot conversation?'} onClose={closeDialog}><div className="bot-dialog">{dialog==='about'?<><div className="bot-dialog-persona"><BotAvatar bot={bot}/><div><strong>{bot.role}</strong><p>{bot.intro}</p></div></div><p>{endpoint?'This chat uses the configured AI service. Only messages from this bot conversation are sent when you request a reply.':'This is an AI bot preview. Responses are written examples selected locally, not AI-generated replies. No AI provider is connected.'}</p><p>Your conversation and draft save in this browser. The bot doesn’t receive your people chats, profile, mood, or boundaries.</p><button className="mobile-primary-button" onClick={closeDialog}>Back to chat</button></>:<><p>Delete this bot’s saved conversation and draft from this browser. This cannot be undone.{endpoint?' This does not delete any records held by the AI service.':''}</p><button className="mobile-secondary-button" onClick={closeDialog}>Keep conversation</button><button className="mobile-primary-button" onClick={clear}>Clear conversation and draft</button></>}</div></JourneyDialog>}
  </section>;
}
