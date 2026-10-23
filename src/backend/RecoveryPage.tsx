import {useEffect,useState,type FormEvent} from 'react';
import {KeyRound,ShieldCheck} from 'lucide-react';
import {roleplayAPI} from './client';
import './connected.css';

export function RecoveryPage({token:initialToken}:{token?:string}){
  const [token]=useState(initialToken||'');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const [finished,setFinished]=useState(false);
  useEffect(()=>{if(token)window.history.replaceState(null,'','#/app/recover');},[token]);
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();const data=new FormData(event.currentTarget);setBusy(true);setError('');
    try{
      const result=token?await roleplayAPI.resetPassword(token,String(data.get('password')),String(data.get('confirm-password'))):await roleplayAPI.forgotPassword(String(data.get('email')));
      setNotice(result.message);if(token)setFinished(true);
    }catch(err){setError(err instanceof Error?err.message:'Please try again.');}finally{setBusy(false);}
  }
  return <section className="rp-connected"><div className="rp-connected-panel rp-auth-panel"><ShieldCheck className="rp-connected-symbol"/><span className="eyebrow">ACCOUNT RECOVERY</span><h1>{token?'A fresh start.':'Find your way back.'}</h1><p>{token?'Choose a new password. Existing sessions will be signed out.':'Enter your account email to request a recovery link.'}</p>{error&&<p className="rp-api-error" role="alert">{error}</p>}{notice&&<p className="rp-api-notice" role="status">{notice}</p>}{!finished&&<form onSubmit={submit}>{token?<><label>New password<input name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required/></label><label>Confirm password<input name="confirm-password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required/></label></>:<label>Email<input name="email" type="email" autoComplete="email" maxLength={254} required/></label>}<button className="btn primary" disabled={busy}><KeyRound size={17}/>{busy?'Please wait…':token?'Change password':'Send recovery link'}</button></form>}<a href="#/app/people" className="text-link">Back to sign in</a></div></section>;
}
