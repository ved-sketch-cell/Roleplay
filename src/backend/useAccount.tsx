import {useEffect,useState} from 'react';
import {roleplayAPI,type BackendProfile} from './client';

export function useAccount(){
  const [profile,setProfile]=useState<BackendProfile|null>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  useEffect(()=>{
    let active=true;
    (async()=>{
      try{if(await roleplayAPI.ensureSession()){const value=await roleplayAPI.getProfile();if(active)setProfile(value);}}
      catch(err){if(active)setError(err instanceof Error?err.message:'Unable to load your account.');}
      finally{if(active)setLoading(false);}
    })();
    return()=>{active=false;};
  },[]);
  return {profile,loading,error,setError};
}
export function AccountGate({loading,error}:{loading:boolean;error:string}){
  return <section className="rp-connected"><div className="rp-connected-panel rp-auth-panel"><h1>{loading?'Loading your account…':'Your conversations start here.'}</h1>{error&&<p role="alert">{error}</p>}{!loading&&<><p>Use your private account to connect and chat with people who share your interests.</p><a className="btn primary" href="#/app/people">Sign in or create an account</a><a className="text-link" href="#/app/recover">Recover your account</a></>}</div></section>;
}
