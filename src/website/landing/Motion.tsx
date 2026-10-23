import {createContext, useContext, useEffect, useRef, type ReactNode} from 'react';
import {motion, useScroll, useTransform, type MotionValue} from 'framer-motion';

export const MotionAllowed = createContext(true);
export const useMotionAllowed = () => useContext(MotionAllowed);
const elements = {
  div: motion.create('div'), section: motion.create('section'),
  article: motion.create('article'), h2: motion.create('h2'),
};

export function FadeIn({as='div', children, className, id, delay=0, duration=0.7, x=0, y=30}: {
  as?:keyof typeof elements; children:ReactNode; className?:string; id?:string;
  delay?:number; duration?:number; x?:number; y?:number;
}) {
  const allowed = useMotionAllowed();
  const Element = elements[as];
  return <Element className={className} id={id} initial={allowed?{opacity:0,x,y}:false}
    whileInView={{opacity:1,x:0,y:0}} viewport={{once:true,margin:'50px',amount:0}}
    transition={{delay:allowed?delay:0,duration:allowed?duration:0,ease:[0.25,0.1,0.25,1]}}>{children}</Element>;
}

export function Magnet({children, className='', padding=45, strength=5}: {
  children:ReactNode; className?:string; padding?:number; strength?:number;
}) {
  const anchor = useRef<HTMLSpanElement>(null);
  const moving = useRef<HTMLSpanElement>(null);
  const allowed = useMotionAllowed();
  useEffect(() => {
    const element = moving.current;
    if (!element) return;
    const reset = () => {element.style.transition='transform 0.6s ease-in-out';element.style.transform='translate3d(0,0,0)';};
    reset();
    if (!allowed || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    let frame = 0;
    const follow = (event:PointerEvent) => {
      if (event.pointerType==='touch') return;
      cancelAnimationFrame(frame);
      frame=requestAnimationFrame(() => {
        const rect=anchor.current?.getBoundingClientRect();
        if (!rect) return;
        const near=event.clientX>=rect.left-padding && event.clientX<=rect.right+padding && event.clientY>=rect.top-padding && event.clientY<=rect.bottom+padding;
        if (!near) {reset();return;}
        const dx=(event.clientX-rect.left-rect.width/2)/Math.max(strength,1);
        const dy=(event.clientY-rect.top-rect.height/2)/Math.max(strength,1);
        element.style.transition='transform 0.3s ease-out';
        element.style.transform=`translate3d(${dx}px,${dy}px,0)`;
      });
    };
    window.addEventListener('pointermove',follow,{passive:true});
    window.addEventListener('blur',reset);
    return () => {cancelAnimationFrame(frame);window.removeEventListener('pointermove',follow);window.removeEventListener('blur',reset);reset();};
  },[allowed,padding,strength]);
  return <span className={`magnet ${className}`} ref={anchor}><span className="magnet-moving" ref={moving} style={{willChange:'transform'}}>{children}</span></span>;
}

function Character({character, progress, start, end}:{character:string;progress:MotionValue<number>;start:number;end:number}) {
  const opacity=useTransform(progress,[start,end],[0.2,1]);
  const allowed=useMotionAllowed();
  return <span className="scroll-character"><span className="character-placeholder">{character}</span><motion.span className="character-ink" style={{opacity:allowed?opacity:1}}>{character}</motion.span></span>;
}

export function AnimatedText({text,className=''}:{text:string;className?:string}) {
  const paragraph=useRef<HTMLParagraphElement>(null);
  const {scrollYProgress}=useScroll({target:paragraph,offset:['start 0.8','end 0.2']});
  let index=0;
  return <p ref={paragraph} className={`scroll-copy ${className}`}><span className="sr-only">{text}</span><span aria-hidden="true">{text.split(/(\s+)/).map((word,wordIndex) => {
    if (/^\s+$/.test(word)) {index+=word.length;return <span key={wordIndex}>{word}</span>;}
    return <span className="scroll-word" key={wordIndex}>{Array.from(word).map(character => {
      const characterIndex=index++;
      return <Character key={characterIndex} character={character} progress={scrollYProgress} start={characterIndex/text.length} end={(characterIndex+1)/text.length}/>;
    })}</span>;
  })}</span></p>;
}
