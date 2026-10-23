import {useEffect,useState} from 'react';
import {Flag,ShieldCheck} from 'lucide-react';
import {roleplayAPI,type ModerationAction,type ModeratorReport} from './client';
import {AccountGate,useAccount} from './useAccount';
import './connected.css';

export function ModerationPage(){
  const {profile,loading,error,setError}=useAccount();
  const [allowed,setAllowed]=useState<boolean|null>(null);
  const [rows,setRows]=useState<ModeratorReport[]>([]);
  const [filter,setFilter]=useState('open');
  const [busy,setBusy]=useState(false);
  const [notice,setNotice]=useState('');
  useEffect(()=>{if(profile)roleplayAPI.accountCapabilities().then(value=>setAllowed(value.is_moderator)).catch(err=>setError(err.message));},[profile,setError]);
  useEffect(()=>{if(allowed)roleplayAPI.moderationQueue(filter).then(setRows).catch(err=>setError(err.message));},[allowed,filter,setError]);
  if(loading||!profile)return <AccountGate loading={loading} error={error}/>;
  if(allowed===null)return <section className="rp-connected"><p role="status">Checking moderator access…</p>{error&&<p role="alert">{error}</p>}</section>;
  if(!allowed)return <section className="rp-connected"><div className="rp-connected-panel"><h1>Moderator access required.</h1><p>Only a moderator assigned by the instance operator can review reports.</p><a className="btn secondary" href="#/app/messages">Back to Messages</a></div></section>;
  return <section className="rp-connected"><div className="rp-connected-heading"><div><span className="eyebrow"><ShieldCheck size={16}/>MODERATION</span><h1>Listen. Review. Act.</h1><p>Review the evidence and record a reason for every decision.</p></div><label className="rp-filter-label">Report status<select value={filter} onChange={event=>setFilter(event.target.value)}>{['open','resolved','dismissed','all'].map(status=><option key={status}>{status}</option>)}</select></label></div>{error&&<p className="rp-api-error" role="alert">{error}</p>}{notice&&<p className="rp-api-notice" role="status">{notice}</p>}<div className="rp-moderation-grid">{rows.length?rows.map(row=><article className="rp-connected-panel" key={row.id}><h2><Flag size={20}/>{row.reason}</h2><span className="tag">{row.status}</span><p>{row.details||'No additional description.'}</p>{row.evidence&&<blockquote className="rp-evidence">{row.evidence}</blockquote>}<small>Case {row.id.slice(0,8)} · {new Date(row.created_at).toLocaleString()}</small>{[row.reported_id,row.reporter_id].includes(profile.user_id)?<p>Another moderator must review a case involving you.</p>:<form onSubmit={async event=>{event.preventDefault();const data=new FormData(event.currentTarget);setBusy(true);setError('');try{await roleplayAPI.moderationAction(row.id,String(data.get('action')) as ModerationAction,String(data.get('note')));setRows(await roleplayAPI.moderationQueue(filter));setNotice('Decision recorded.');}catch(err){setError(err instanceof Error?err.message:'Please try again.');}finally{setBusy(false);}}}><label>Action<select name="action"><option value="dismiss_report">Dismiss report</option>{row.message_id&&<option value="remove_message">Remove message</option>}<option value="suspend_user">Suspend account</option><option value="restore_user">Restore account</option></select></label><label>Decision note<textarea name="note" required minLength={3} maxLength={500} rows={2}/></label><small>Suspension ends sessions and removes discovery visibility. Restoration requires a fresh login and fresh discovery consent.</small><button className="btn secondary" disabled={busy}>Record decision</button></form>}</article>):<div className="rp-connected-panel"><h2>No reports in this queue.</h2><p>Change the status filter to review previous cases.</p></div>}</div></section>;
}
