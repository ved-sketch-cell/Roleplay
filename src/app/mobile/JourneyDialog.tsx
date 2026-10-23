import {useEffect,useRef,useState,type ReactNode} from 'react';
import {CheckCircle2,X,Flag} from 'lucide-react';
import {saveLocalReport} from './state';
export function JourneyDialog({title,children,onClose}:{title:string;children:ReactNode;onClose:()=>void}){
  const ref=useRef<HTMLElement>(null);
  useEffect(()=>{
    const previous=document.activeElement as HTMLElement|null;
    ref.current?.querySelector<HTMLElement>('input,select,textarea,button')?.focus();
    const key=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){event.stopPropagation();onClose();}
      if(event.key==='Tab'){
        const items=[...(ref.current?.querySelectorAll<HTMLElement>('button,a,input,textarea,select,[tabindex="0"]')||[])].filter(item=>!(item as HTMLButtonElement).disabled);
        const first=items[0],last=items.at(-1);
        if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
        else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
      }
    };
    document.addEventListener('keydown',key);return()=>{document.removeEventListener('keydown',key);previous?.focus();};
  },[onClose]);
  return <div className="journey-dialog" onClick={event=>{if(event.target===event.currentTarget)onClose();}}><section ref={ref} role="dialog" aria-modal="true" aria-label={title}><div className="mobile-section-heading"><h2>{title}</h2><button className="mobile-icon-button" onClick={onClose} aria-label="Close dialog"><X size={20}/></button></div>{children}</section></div>;
}
export function ReportDialog({target,onClose}:{target:string;onClose:()=>void}){
  const [reason,setReason]=useState('Harassment');const [details,setDetails]=useState('');const [reference,setReference]=useState('');
  return <JourneyDialog title={reference?'Report saved':'Report a concern'} onClose={onClose}>{reference?<div className="journey-complete" role="status"><CheckCircle2/><h2>Saved on this device.</h2><p>Reference {reference}. This preview does not send reports to moderators.</p><button className="mobile-primary-button" onClick={onClose}>Done</button></div>:<form className="journey-form" onSubmit={event=>{event.preventDefault();if(details.trim().length<10)return;setReference(saveLocalReport(target,reason,details.trim()).id.slice(0,8));}}><p>Tell us what happened. Reports in this preview stay on this device.</p><label>Reason<select value={reason} onChange={event=>setReason(event.target.value)}>{['Harassment','Misleading information','Privacy concern','Spam','Other'].map(value=><option key={value}>{value}</option>)}</select></label><label>Details<textarea value={details} onChange={event=>setDetails(event.target.value)} minLength={10} maxLength={1000} required placeholder="Describe the concern (at least 10 characters)"/></label><button className="mobile-primary-button" type="submit" disabled={details.trim().length<10}><Flag size={17}/>Save report</button></form>}</JourneyDialog>;
}
