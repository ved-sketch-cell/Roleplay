import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { Flame, X } from 'lucide-react';
import { heatLevels, heatValue, heatZone } from './conversationProfiles';
import './heat-meter.css';

export function ConversationHeat({value,onInfo,compact=false,expanded=false}:{value:number;onInfo:()=>void;compact?:boolean;expanded?:boolean}) {
  const heat=heatValue(value),zone=heatZone(heat),hintId=useId();
  const previous=useRef(heat);
  const [change,setChange]=useState<{value:number;delta:number}|null>(null);
  useEffect(()=>{
    const delta=heat-previous.current;previous.current=heat;setChange(null);
    if(delta<=0||expanded)return;
    setChange({value:heat,delta});
    const timer=window.setTimeout(()=>setChange(null),2200);
    return()=>window.clearTimeout(timer);
  },[heat,expanded]);
  const style={'--heat-color':zone.color,'--heat-level':`${heat}%`} as CSSProperties;
  return <aside className={`conversation-heat-rail ${compact?'is-compact':''}`} aria-label="Conversation heat" style={style}>
    <button className={`heat-meter-button${change?' is-updated':''}`} onClick={onInfo} aria-label={`About conversation heat: ${heat} out of 100, ${zone.label}`} aria-describedby={hintId} aria-haspopup="dialog" aria-expanded={expanded} aria-controls={expanded?'conversation-heat-details':undefined}>
      <span className="heat-meter-heading" aria-hidden="true"><Flame size={17} strokeWidth={1.75}/><span>Heat</span></span>
      <span className="heat-track" role="meter" aria-label="Conversation heat level" aria-valuemin={0} aria-valuemax={100} aria-valuenow={heat} aria-valuetext={`${zone.label}, ${heat} out of 100`}>
        <span className="heat-track-fill" style={{height:`${heat}%`,backgroundSize:`100% ${heat?10000/heat:100}%`}}><span className="heat-track-cap"/></span>
      </span>
      <span className="heat-meter-reading" aria-hidden="true"><strong>{heat}</strong><small>{zone.label}</small></span>
      <span className="heat-meter-tooltip" aria-hidden="true"><small>Conversation heat</small><strong>{heat}<span>/100 · {zone.label}</span>{change&&<b>+{change.delta}</b>}</strong></span>
    </button>
    <span id={hintId} className="heat-sr-only">Tap or press Enter for heat details.</span>
    <span className="heat-sr-only" role="status" aria-live="polite" aria-atomic="true">{change?`Conversation heat increased by ${change.delta} to ${change.value} out of 100. ${zone.label}.`:''}</span>
  </aside>;
}

export function HeatDetails({value,onChange,onClose}:{value:number;onChange:(value:number)=>void;onClose:()=>void}) {
  const heat=heatValue(value),zone=heatZone(heat),previewId=useId();
  const [previewOpen,setPreviewOpen]=useState(false);
  const closeRef=useRef<HTMLButtonElement>(null),container=useRef<HTMLDivElement>(null);
  useEffect(()=>{const previous=document.activeElement as HTMLElement|null;closeRef.current?.focus();return()=>{if(previous?.isConnected)previous.focus();};},[]);
  function trap(event:KeyboardEvent) {
    if(event.key==='Escape'){event.preventDefault();event.stopPropagation();onClose();return;}
    if(event.key!=='Tab')return;
    const items=container.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled)');
    if(!items?.length)return;
    const first=items[0],last=items[items.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  }
  return <div className="conversation-dialog-backdrop heat-details-backdrop" onClick={onClose}><div id="conversation-heat-details" ref={container} className="conversation-dialog heat-details-panel" role="dialog" aria-modal="true" aria-labelledby="heat-details-title" aria-describedby="heat-details-description" onKeyDown={trap} onClick={event=>event.stopPropagation()} style={{'--heat-color':zone.color} as CSSProperties}>
    <div className="heat-panel-top"><div><p className="heat-panel-eyebrow">YOUR CONVERSATION</p><h2 id="heat-details-title">Conversation heat</h2></div><button ref={closeRef} className="mobile-icon-button" onClick={onClose} aria-label="Close heat details"><X size={20}/></button></div>
    <div className="heat-reading"><div><span className="heat-level-name">{zone.label}</span><p className="heat-reading-value">{heat}<span>/100</span></p><p className="heat-reading-caption">{zone.caption}</p></div><div className="heat-reading-strip" aria-hidden="true"><span style={{height:`${heat}%`,backgroundSize:`100% ${heat?10000/heat:100}%`}}/></div></div>
    <p id="heat-details-description" className="heat-panel-description">A playful signal of sample chat activity. It doesn’t read anyone’s mood or measure compatibility.</p>
    <div className="heat-levels" role="list" aria-label="Conversation heat levels">{heatLevels.map(level=><div role="listitem" className={`heat-level${zone.label===level.label?' is-current':''}`} key={level.label} style={{'--level-color':level.color} as CSSProperties}><span className="heat-level-swatch" aria-hidden="true"/><span><strong>{level.label}</strong><small>{level.min}–{level.max}</small></span>{zone.label===level.label&&<span className="heat-current-label">Current</span>}</div>)}</div>
    <section className="heat-how"><h3>What adds warmth?</h3><dl><div><dt>Send a message</dt><dd>+2</dd></div><div><dt>Start a chat game</dt><dd>+8</dd></div><div><dt>Selected game actions</dt><dd>+4–7</dd></div></dl><p>There’s no target to reach. Keep your own pace.</p></section>
    <button className="heat-preview-toggle" aria-expanded={previewOpen} aria-controls={previewOpen?previewId:undefined} onClick={()=>setPreviewOpen(open=>!open)}>Preview heat levels <span>{previewOpen?'Hide':'Show'}</span></button>
    {previewOpen&&<div id={previewId} className="heat-preview-controls"><label className="heat-demo-control">Set sample heat <output>{heat}/100</output><input aria-label="Set sample heat" type="range" min="0" max="100" value={heat} onChange={event=>onChange(heatValue(Number(event.target.value)))}/></label><button className="mobile-secondary-button" onClick={()=>onChange(48)}>Reset sample heat</button></div>}
  </div></div>;
}
