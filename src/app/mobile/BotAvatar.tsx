import {useId} from 'react';
import type {AIBot} from './aiBots';
export function BotAvatar({bot}:{bot:AIBot}){
  const id=useId().replace(/[^a-zA-Z0-9_-]/g,'');
  return <span className="bot-avatar" aria-hidden="true"><svg viewBox="0 0 80 80" focusable="false"><defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop stopColor={bot.tone}/><stop offset="1" stopColor={bot.secondary}/></linearGradient></defs><rect x="3" y="3" width="74" height="74" rx="24" fill={`url(#${id})`} opacity=".17"/>
    {bot.id==='muse'?<><path d="M39 15c-17 0-29 11-29 25 0 16 12 27 27 27 8 0 10-5 6-10-4-5-2-10 5-10h5c13 0 19-8 14-18-4-9-16-14-28-14Z" fill={`url(#${id})`}/><circle cx="25" cy="35" r="4" fill="#38263c"/><circle cx="39" cy="25" r="4" fill="#ffd383"/><circle cx="54" cy="32" r="4" fill="#80e5df"/><path d="M55 61l13-21" stroke="#f5e6f3" strokeWidth="4" strokeLinecap="round"/></>:
    bot.id==='orbit'?<><circle cx="40" cy="39" r="19" fill={`url(#${id})`}/><ellipse cx="40" cy="40" rx="31" ry="11" transform="rotate(-30 40 40)" fill="none" stroke="#d5d5ff" strokeWidth="4"/><path d="M57 17v9m-4-5h8" stroke="#ffd383" strokeWidth="3" strokeLinecap="round"/><circle cx="19" cy="65" r="3" fill="#80e5df"/></>:
    bot.id==='pixel'?<><rect x="17" y="24" width="48" height="39" rx="12" fill={`url(#${id})`}/><path d="M41 23v-8" stroke="#a5f1df" strokeWidth="4"/><circle cx="41" cy="12" r="4" fill="#ffd383"/><rect x="26" y="36" width="7" height="7" rx="2" fill="#243947"/><rect x="49" y="36" width="7" height="7" rx="2" fill="#243947"/><path d="M31 51h20" stroke="#243947" strokeWidth="4" strokeLinecap="round"/><path d="M12 37v14m58-14v14" stroke="#8ebddd" strokeWidth="4" strokeLinecap="round"/></>:
    <><rect x="17" y="17" width="46" height="46" rx="12" transform="rotate(-13 40 40)" fill={`url(#${id})`}/>{[[27,29],[48,24],[39,40],[30,54],[52,49]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="4" fill="#5a3441"/>)}<path d="M67 57v9m-4-5h8" stroke="#bfa8ff" strokeWidth="3" strokeLinecap="round"/></>}
  </svg></span>;
}
