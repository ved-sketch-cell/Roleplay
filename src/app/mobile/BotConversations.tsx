import type {CSSProperties} from 'react';
import {ArrowRight,Bot,Sparkles} from 'lucide-react';
import {useDeviceState} from './state';
import {aiBots,configuredBotEndpoint,normalizeBotMessages,type AIBot,type BotMessage} from './aiBots';
import {BotAvatar} from './BotAvatar';
import './bots.css';
function BotRow({bot,onOpen}:{bot:AIBot;onOpen:()=>void}){
  const [stored]=useDeviceState<BotMessage[]>(`bot-messages:${bot.id}`,[]),messages=normalizeBotMessages(stored),latest=messages.at(-1);
  return <button className="bot-conversation-card" onClick={onOpen} aria-label={`Open ${bot.name} AI bot`} style={{'--bot-accent':bot.tone,'--bot-secondary':bot.secondary} as CSSProperties}><div className="bot-card-top"><BotAvatar bot={bot}/><span className="bot-label"><Bot size={12}/>AI BOT</span><ArrowRight size={16}/></div><strong>{bot.name}</strong><span className="bot-card-role">{bot.role}</span><p>{latest?(latest.role==='user'?'You: ':latest.source==='sample'?'Sample: ':'')+latest.text:bot.intro}</p><small><Sparkles size={12}/>{configuredBotEndpoint?'AI replies configured':'Preview · sample replies'}</small></button>;
}
export function BotConversations({onOpen,compact=false}:{onOpen:(id:string)=>void;compact?:boolean}){
  return <div className={`bot-conversations${compact?' bot-conversations-compact':''}`}><div className="bot-conversations-caption"><span><Bot size={16}/>AI companions</span><small>{configuredBotEndpoint?'AI replies configured':'Previews · written sample replies'}</small></div><div className="bot-conversations-grid">{aiBots.map(bot=><BotRow key={bot.id} bot={bot} onOpen={()=>onOpen(bot.id)}/>)}</div></div>;
}
