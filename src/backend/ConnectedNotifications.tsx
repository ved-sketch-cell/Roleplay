import {useCallback,useEffect,useState} from 'react';
import {Bell,Check,RefreshCw,ShieldCheck} from 'lucide-react';
import {roleplayAPI,type NotificationItem,type NotificationSettings,type SafetyReport} from './client';
import {AccountGate,useAccount} from './useAccount';
import './connected.css';

export function ConnectedNotifications(){
  const {profile,loading,error,setError}=useAccount();
  const [items,setItems]=useState<NotificationItem[]>([]);
  const [settings,setSettings]=useState<NotificationSettings>({in_app:true,messages:true,email:false});
  const [reports,setReports]=useState<SafetyReport[]>([]);
  const [busy,setBusy]=useState(false);
  const [notice,setNotice]=useState('');
  const [hasMore,setHasMore]=useState(false);
  const refresh=useCallback(async()=>{const rows=await roleplayAPI.notifications();setItems(rows);setHasMore(rows.length===50);},[]);
  useEffect(()=>{
    if(!profile)return;let active=true;
    Promise.all([roleplayAPI.notificationSettings(),roleplayAPI.myReports(),roleplayAPI.notifications()]).then(([preferences,cases,rows])=>{if(active){setSettings(preferences);setReports(cases);setItems(rows);setHasMore(rows.length===50);}}).catch(err=>{if(active)setError(err.message);});
    const connection=roleplayAPI.live(event=>{if(active&&['notifications.updated','ready'].includes(event.type))void refresh().catch(()=>{});},()=>{});
    const timer=setInterval(()=>{if(!document.hidden)void refresh().catch(()=>{});},20000);
    return()=>{active=false;clearInterval(timer);connection.close();};
  },[profile,refresh,setError]);
  async function action(work:()=>Promise<void>){setBusy(true);setError('');try{await work();}catch(err){setError(err instanceof Error?err.message:'Please try again.');}finally{setBusy(false);}}
  if(loading||!profile)return <AccountGate loading={loading} error={error}/>;
  return <section className="rp-connected"><div className="rp-connected-heading"><div><span className="eyebrow"><Bell size={16}/>YOUR UPDATES</span><h1>A little heads-up.</h1><p>Connection requests, messages, and report updates.</p></div><a className="btn secondary" href="#/app/messages">Open Messages</a></div>{error&&<p className="rp-api-error" role="alert">{error}</p>}{notice&&<p className="rp-api-notice" role="status">{notice}</p>}<div className="rp-connected-layout"><div className="rp-connected-panel"><div className="rp-section-title"><h2><Bell size={20}/>Notifications</h2><button className="icon-btn" aria-label="Refresh notifications" disabled={busy} onClick={()=>action(refresh)}><RefreshCw size={18}/></button></div>{items.length?<ul className="rp-notification-list">{items.map(item=><li className={item.read_at?'read':'unread'} key={item.id}><div><h3>{item.title}</h3><small>{new Date(item.created_at).toLocaleString()}</small><a href={item.kind==='moderation'?'#/app/notifications':'#/app/messages'} className="text-link" onClick={()=>void action(async()=>{await roleplayAPI.readNotification(item.id);await refresh();})}>Review</a></div>{!item.read_at&&<button className="icon-btn" aria-label={`Mark ${item.title} as read`} disabled={busy} onClick={()=>action(async()=>{await roleplayAPI.readNotification(item.id);await refresh();})}><Check size={18}/></button>}</li>)}</ul>:<p>Nothing new just yet.</p>}{hasMore&&<button className="text-link" disabled={busy} onClick={()=>action(async()=>{const rows=await roleplayAPI.notifications(items.at(-1)!.id);setItems(current=>[...current,...rows]);setHasMore(rows.length===50);})}>Load older updates</button>}</div><div className="rp-connected-panel"><h2>Your notification choices</h2><form onSubmit={event=>{event.preventDefault();void action(async()=>{setSettings(await roleplayAPI.saveNotificationSettings(settings));setNotice('Notification preferences saved.');});}}>{(['in_app','messages','email'] as const).map(key=><label className="rp-connected-check" key={key}><input type="checkbox" checked={settings[key]} onChange={event=>setSettings({...settings,[key]:event.target.checked})}/><span>{{in_app:'Show in-app notifications',messages:'Notify me about new messages',email:'Send generic notification emails'}[key]}</span></label>)}<small>Email notifications contain a link to ROLEPLAY, without private message text. Recovery and security emails are sent separately.</small><button className="btn primary" disabled={busy}>Save preferences</button></form></div></div><div className="rp-connected-panel rp-report-history"><div className="rp-section-title"><h2><ShieldCheck size={20}/>Your reports</h2><button className="text-link" disabled={busy} onClick={()=>action(async()=>setReports(await roleplayAPI.myReports()))}>Refresh</button></div>{reports.length?<ul>{reports.map(report=><li key={report.id}><b>{report.reason}</b><span className="tag">{report.status}</span><p>{report.details}</p>{report.resolution&&<small>{report.resolution.replaceAll('_',' ')}</small>}</li>)}</ul>:<p>Reports you submit appear here. Review time depends on the instance moderators.</p>}</div></section>;
}
