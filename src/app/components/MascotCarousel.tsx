import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Sparkles, Sprout, Wind, Gamepad2, MessageCircle, Heart } from 'lucide-react';

/** Original ROLEPLAY fox; vector art remains crisp at every screen size. */
export function RoleplayMascot({ mood = 'happy' }: { mood?: 'happy' | 'curious' | 'calm' }) {
  return <svg viewBox="0 0 180 190" role="img" aria-label={`Pip the fox, feeling ${mood}`}>
    <ellipse cx="93" cy="175" rx="54" ry="8" fill="#d8c6f6" opacity=".5" />
    <path d="M127 160 Q173 161 164 115 Q148 121 138 134 L124 149" fill="#b18af3" />
    <path d="M164 115 Q148 121 148 136 L161 140 Q166 130 164 115" fill="#fff" />
    <ellipse cx="90" cy="140" rx="41" ry="34" fill="#8453dc" />
    <ellipse cx="89" cy="140" rx="23" ry="25" fill="#eee3ff" />
    <path d="M49 58 L43 14 Q66 18 75 48 M106 48 Q127 16 144 15 L136 65" fill="#9360e3" stroke="#7842cc" strokeWidth="4" strokeLinejoin="round" />
    <path d="M50 24 L57 52 L68 48 M132 26 L113 51 L135 52" fill="#e2c9fc" />
    <path d="M44 69 Q45 40 90 40 Q140 41 141 74 Q153 113 91 130 Q31 113 44 69" fill="#a97bec" />
    <path d="M44 87 Q60 83 87 108 Q112 83 141 87 Q132 117 91 129 Q52 118 44 87" fill="#fff" />
    {mood === 'calm' ? <g fill="none" stroke="#372451" strokeWidth="5" strokeLinecap="round"><path d="M60 76q8 9 16 0"/><path d="M105 76q8 9 16 0"/></g> : <g fill="#372451"><ellipse cx="68" cy="76" rx="6" ry={mood==='curious'?10:8}/><ellipse cx="113" cy="76" rx="6" ry="8"/><circle cx="70" cy="73" r="2" fill="#fff"/><circle cx="115" cy="73" r="2" fill="#fff"/></g>}
    <ellipse cx="54" cy="89" rx="9" ry="5" fill="#eeadce"/><ellipse cx="128" cy="89" rx="9" ry="5" fill="#eeadce"/>
    <path d="M84 96 Q90 92 97 96 L91 103 Z" fill="#372451" />
    <path d="M91 103 Q83 115 77 105 M91 103 Q97 115 104 105" stroke="#372451" strokeWidth="3" fill="none" strokeLinecap="round" />
    <ellipse cx="63" cy="171" rx="16" ry="8" fill="#7540ce"/><ellipse cx="114" cy="171" rx="16" ry="8" fill="#7540ce"/>
    <path d="M53 131Q33 133 38 146" stroke="#8453dc" strokeWidth="13" fill="none" strokeLinecap="round" />
    <path d="M126 129Q148 112 142 104" stroke="#8453dc" strokeWidth="13" fill="none" strokeLinecap="round" />
  </svg>;
}

interface Props { onPlay?: () => void; onGrow?: () => void; onHeal?: () => void; }
export function MascotCarousel({ onPlay, onGrow, onHeal }: Props) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(active);activeRef.current=active;
  useEffect(()=>{const element=track.current;if(!element)return;const observer=new ResizeObserver(()=>element.scrollTo({left:activeRef.current*element.clientWidth,behavior:'auto'}));observer.observe(element);return()=>observer.disconnect();},[]);
  const slides = [
    { tag:'MEET PIP', title:'A little hello goes a long way.', body:'Break the ice with today’s conversation cards.', action:'Let’s play', mood:'happy' as const, bg:'#f0e7ff', icon:Gamepad2, onClick:onPlay },
    { tag:'ONE SMALL STEP', title:'Curiosity looks good on you.', body:'Explore a new idea and grow with your community.', action:'Explore Grow', mood:'curious' as const, bg:'#e8f8f0', icon:Sprout, onClick:onGrow },
    { tag:'TAKE A BREATHER', title:'You can go at your own pace.', body:'Pause, reset, and find a calmer space.', action:'Find your calm', mood:'calm' as const, bg:'#eaf3ff', icon:Wind, onClick:onHeal },
  ];
  function go(index:number) {const next=Math.min(slides.length-1,Math.max(0,index));setActive(next);track.current?.scrollTo({ left:next * track.current.clientWidth, behavior:document.documentElement.classList.contains('mobile-reduced-motion')||window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth' }); }
  return <section className="mascot-carousel" aria-label="Pip’s daily inspiration" aria-roledescription="carousel" onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();go(active+(e.key==='ArrowRight'?1:-1));}}}>
    <div ref={track} className="mascot-track" onScroll={e => {const width=e.currentTarget.clientWidth;if(width>0)setActive(Math.min(slides.length-1,Math.max(0,Math.round(e.currentTarget.scrollLeft/width))));}}>
      {slides.map((slide,i)=><article key={slide.tag} className="mascot-slide" style={{background:slide.bg}} aria-hidden={i!==active} aria-label={`${i+1} of ${slides.length}`}>
        <div className="mascot-copy"><p className="mascot-tag"><slide.icon size={14}/>{slide.tag}</p><h2>{slide.title}</h2><p className="mascot-body">{slide.body}</p><button className="mascot-action" tabIndex={i===active?0:-1} onClick={slide.onClick}>{slide.action}<ArrowRight size={15}/></button></div>
        <div className="mascot-art"><span className="mascot-float mascot-float-one" aria-hidden="true"><slide.icon size={16}/></span><span className="mascot-float mascot-float-two" aria-hidden="true"><MessageCircle size={14}/></span><span className="mascot-float mascot-float-three" aria-hidden="true"><Heart size={12}/></span><RoleplayMascot mood={slide.mood}/></div>
      </article>)}
    </div>
    <div className="mascot-controls"><button aria-label="Previous slide" disabled={active===0} onClick={()=>go(active-1)}><ArrowLeft size={15}/></button><div className="mascot-dots">{slides.map((_,i)=><button key={i} aria-label={`Show slide ${i+1}`} aria-pressed={i===active} onClick={()=>go(i)} className={i===active?'is-active':''}/>)}</div><button aria-label="Next slide" disabled={active===slides.length-1} onClick={()=>go(active+1)}><ArrowRight size={15}/></button></div>
  </section>;
}
