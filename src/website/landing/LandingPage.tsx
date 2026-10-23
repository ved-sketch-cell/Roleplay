import {useEffect, useRef, useState, type PointerEvent} from 'react';
import {AnimatePresence, MotionConfig, motion, useInView, useReducedMotion, useScroll, useSpring, useTransform} from 'framer-motion';
import {Sparkles, Heart, MessageCircle, Compass, ShieldCheck, Fingerprint, Eye, Plus, ArrowUpRight, ArrowRight} from 'lucide-react';
import {guilds} from '../data';
import {AnimatedText, FadeIn, Magnet, MotionAllowed, useMotionAllowed} from './Motion';
import './landing.css';
import './Sections.css';
import {ProductShowcase} from './ProductShowcase';

const spaces=[
  {name:'Play',art:'daily-deck',label:'Start with a little play.',description:'Conversation cards and shared games.',tone:'play',route:'#/app/play'},
  {name:'Grow',art:'skill-tree-journal',label:'Find a fresh perspective.',description:'Reflect, learn, and build your skill journal.',tone:'grow',route:'#/app/grow'},
  {name:'Heal',art:'pace-maker',label:'Make room for a pause.',description:'Gentle prompts to reset at your own pace.',tone:'heal',route:'#/app/heal'},
];
const communityPreviews:Record<string,{description:string}>={
  design:{description:'Design, creativity, and a more human internet.'},
  tech:{description:'AI, tools, and what comes next.'},
  startup:{description:'Ideas, builders, and brave beginnings.'},
  mind:{description:'Behavior, mindset, and a kinder you.'},
  science:{description:'Big questions for a brighter tomorrow.'},
  career:{description:'Meaningful work. Different routes.'},
};
const questions=[
  ['What is ROLEPLAY?','A knowledge-sharing community where you choose an alias and connect through thoughtful questions and shared curiosity.'],
  ['Do I need to use my real name?','No. Choose a display name and avatar. Avoid sharing personal information in public conversations.'],
  ['How is it different from a group chat?','Topic communities, discoverable discussions, saved resources, and learning challenges keep useful ideas within reach.'],
  ['Can I try it right now?','Yes. The interactive app uses sample conversations and rooms. Your demo activity stays in this browser; live messaging is not connected.'],
];

function HeroScene() {
  const scene=useRef<HTMLDivElement>(null);
  const visible=useInView(scene,{margin:'100px'});
  const allowed=useMotionAllowed();
  const active=allowed&&visible;
  const rotateX=useSpring(0,{stiffness:90,damping:24});
  const rotateY=useSpring(0,{stiffness:90,damping:24});
  const tilt=(event:PointerEvent<HTMLDivElement>) => {
    if (!allowed || event.pointerType!=='mouse') return;
    const rect=event.currentTarget.getBoundingClientRect();
    rotateX.set((0.5-(event.clientY-rect.top)/rect.height)*10);
    rotateY.set(((event.clientX-rect.left)/rect.width-0.5)*14);
  };
  const reset=() => {rotateX.set(0);rotateY.set(0);};
  useEffect(() => {if (!allowed) {rotateX.set(0);rotateY.set(0);}},[allowed,rotateX,rotateY]);
  return <div className="rp-scene" ref={scene} onPointerMove={tilt} onPointerLeave={reset} aria-hidden="true">
    <div className="scene-halo"/><div className="scene-ring ring-one"/><div className="scene-ring ring-two"/>
    <motion.div className="scene-camera" style={{rotateX,rotateY,transformStyle:'preserve-3d'}}>
      <div className="scene-mascots"><motion.img src="/curious-minds.png" alt="" width={1312} height={1199} fetchPriority="high"
        animate={{y:active?[-6,8,-6]:0}} transition={{duration:7,repeat:active?Infinity:0,ease:'easeInOut'}}/></div>
      <div className="scene-layer scene-question"><motion.div className="scene-glass" animate={{y:active?[0,-10,0]:0}} transition={{duration:6,repeat:active?Infinity:0,ease:'easeInOut'}}>
        <span className="preview-avatar"><MessageCircle size={21}/></span><div><small>SAMPLE CONVERSATION</small><strong>What if we tried this?</strong><span>Curious Fox · a fresh perspective</span></div><Sparkles size={18}/>
      </motion.div></div>
      <div className="scene-layer scene-deck"><motion.div className="scene-product" animate={{y:active?[0,12,0]:0}} transition={{duration:8,repeat:active?Infinity:0,ease:'easeInOut'}}>
        <img src="/cards/daily-deck.webp" alt="" width={512} height={512}/><span><Sparkles size={15}/>Daily Deck</span><small>One card. A new conversation.</small>
      </motion.div></div>
      <div className="scene-layer scene-pause"><motion.div className="scene-product" animate={{y:active?[4,-8,4]:0}} transition={{duration:6.5,repeat:active?Infinity:0,ease:'easeInOut'}}>
        <img src="/cards/pace-maker.webp" alt="" width={512} height={512}/><span><Heart size={15}/>Room to reset</span>
      </motion.div></div>
    </motion.div>
  </div>;
}

export function LandingPage({motionEnabled}:{motionEnabled:boolean}) {
  const reduced=useReducedMotion();
  const allowed=motionEnabled&&!reduced&&typeof window!=='undefined';
  const [faq,setFaq]=useState<number|null>(null);
  const root=useRef<HTMLDivElement>(null);
  const {scrollYProgress}=useScroll({target:root,offset:['start start','end end']});
  const progress=useSpring(scrollYProgress,{stiffness:100,damping:30,restDelta:0.001});
  const hero=useRef<HTMLElement>(null);
  const {scrollYProgress:heroProgress}=useScroll({target:hero,offset:['start start','end start']});
  const heroY=useTransform(heroProgress,[0,1],[0,85]);
  useEffect(() => {
    const id=window.location.hash.split('#')[2];
    if (id) document.getElementById(id)?.scrollIntoView({behavior:allowed?'smooth':'auto'});
  },[]);
  return <MotionAllowed.Provider value={allowed}><MotionConfig reducedMotion={allowed?'user':'always'}>
    <div className="rp-landing" ref={root} data-animation={allowed?'on':'off'}>
      <motion.div className="rp-scroll-progress" style={{scaleX:progress}} aria-hidden="true"/>
      <section className="rp-hero" ref={hero}>
        <div className="rp-hero-grid" aria-hidden="true"/>
        <div className="rp-wrap grid lg:grid-cols-[.95fr_1.05fr] items-center gap-6 lg:gap-10 rp-hero-layout">
          <FadeIn className="rp-hero-copy" y={20}>
            <span className="rp-eyebrow"><Sparkles size={15}/>A SPACE FOR CURIOUS MINDS</span>
            <h1>Fewer labels.<br/>More <span>ideas.</span></h1>
            <p>Ask. Play. Grow.<br/>An anonymous community for sharing knowledge and ideas.</p>
            <div className="rp-actions flex flex-wrap items-center gap-3">
              <Magnet><a href="/original.html?demo=1" className="rp-button rp-primary"><Compass size={18}/>Explore the app</a></Magnet>
              <Magnet strength={7}><a href="#/#how-it-works" className="rp-button rp-secondary">Find your space</a></Magnet>
            </div>
          </FadeIn>
          <FadeIn className="rp-hero-art" delay={0.18} y={35}><motion.div style={{y:allowed?heroY:0}}><HeroScene/></motion.div></FadeIn>
        </div>
      </section>

      <div className="rp-topic-strip" aria-label="Community topics"><div className="rp-topic-track">{[0,1].map(copy=><div key={copy} aria-hidden={copy===1}>{['Design','Technology','Big ideas','Human behavior','Science','Career'].map(topic=><span key={topic}><Sparkles size={14}/>{topic}</span>)}</div>)}</div></div>

      <section className="rp-wrap rp-section rp-manifesto"><FadeIn><span className="rp-eyebrow">CONNECTION STARTS WITH CURIOSITY</span></FadeIn><AnimatedText text="A little play. A new perspective. A space to pause. Come as you are. Leave with a little more."/></section>

      <section className="rp-spaces-band" id="how-it-works" aria-labelledby="rp-spaces-title"><div className="rp-wrap rp-section">
        <FadeIn className="rp-section-heading"><div><span className="rp-eyebrow">THREE WAYS TO FIND YOUR PEOPLE</span><h2 id="rp-spaces-title">Follow your <span className="rp-heading-green">curiosity.</span></h2></div></FadeIn>
        <div className="rp-experience-grid">{spaces.map((space,i)=><FadeIn as="article" key={space.name} delay={i*0.1} className={`rp-experience-card ${space.tone}`}>
          <a href={space.route} aria-labelledby={`rp-explore-${space.tone}`}>
            <div className="rp-experience-copy"><h3 id={`rp-space-${space.tone}`}>{space.name}</h3><p className="rp-experience-label">{space.label}</p><p className="rp-experience-description">{space.description}</p></div>
            <img className="rp-experience-art" src={`/cards/${space.art}.webp`} alt="" width={512} height={512} loading="lazy"/>
            <span className="rp-experience-link" id={`rp-explore-${space.tone}`}>Explore {space.name}<ArrowUpRight size={16} aria-hidden="true"/></span>
          </a>
        </FadeIn>)}</div>
      </div>
      </section>

      <section className="rp-wrap rp-section rp-community-section" id="communities" aria-labelledby="rp-communities-title"><FadeIn className="rp-section-heading"><div><span className="rp-eyebrow"><span className="rp-curiosity-dot" aria-hidden="true"/>SHARED INTERESTS. DIFFERENT PERSPECTIVES.</span><h2 id="rp-communities-title">Find your kind of curious.</h2></div><a className="rp-all-communities" href="#/app/guilds">All communities<ArrowUpRight size={17} aria-hidden="true"/></a></FadeIn>
        <div className="rp-community-tiles">{guilds.map((guild,i)=><FadeIn as="article" key={guild.id} delay={i*0.06} className={`rp-community-tile ${guild.color}`}>
          <motion.a href={`#/app/guild/${guild.id}`} aria-labelledby={`rp-community-${guild.id}`} whileHover={allowed?{y:-4}:{}} transition={{duration:0.25}}>
            <span className={`rp-community-icon rp-community-icon-${guild.id}`} aria-hidden="true"/>
            <div className="rp-community-copy"><span className="rp-community-category">{guild.topic}</span><h3 id={`rp-community-${guild.id}`}>{guild.name}</h3><p>{communityPreviews[guild.id].description}</p></div>
            <ArrowRight className="rp-community-arrow" size={18} aria-hidden="true"/>
          </motion.a>
        </FadeIn>)}</div>
        <p className="rp-community-note">Explore sample communities in the interactive web app.</p>
      </section>

      <ProductShowcase/>

      <section className="rp-wrap rp-section rp-trust grid md:grid-cols-2 items-center gap-8 md:gap-16"><FadeIn className="rp-trust-art"><div className="rp-trust-ring"/><ShieldCheck size={125} strokeWidth={1}/><div className="rp-trust-pill trust-alias"><Fingerprint size={19}/>Choose your alias</div><div className="rp-trust-pill trust-boundaries"><Heart size={19}/>Set your boundaries</div><div className="rp-trust-pill trust-privacy"><Eye size={19}/>Share at your pace</div></FadeIn><FadeIn delay={0.12}><span className="rp-eyebrow">OPEN MINDS. CLEAR BOUNDARIES.</span><h2>Space to be<br/><span className="rp-heading-green">yourself.</span></h2><p>Respect is the starting point.<br/>You decide what to share.</p><a href="#/safety" className="rp-button rp-secondary"><ShieldCheck size={18}/>How we build trust</a></FadeIn></section>

      <section className="rp-wrap rp-section rp-faq grid md:grid-cols-[.8fr_1.2fr] gap-8 md:gap-16"><FadeIn><span className="rp-eyebrow">BEFORE YOU JUMP IN</span><h2>A few good<br/><span className="rp-heading-green">questions.</span></h2><MessageCircle className="rp-faq-symbol" size={72} strokeWidth={1}/></FadeIn><div>{questions.map(([question,answer],i)=><FadeIn key={question} delay={i*0.06} className="rp-faq-item"><button aria-expanded={faq===i} aria-controls={`landing-answer-${i}`} onClick={()=>setFaq(faq===i?null:i)}>{question}<motion.span animate={{rotate:faq===i?45:0}} transition={{duration:allowed?0.25:0}}><Plus size={21}/></motion.span></button><AnimatePresence initial={false}>{faq===i&&<motion.div id={`landing-answer-${i}`} initial={allowed?{height:0,opacity:0}:false} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} transition={{duration:allowed?0.28:0}}><p>{answer}</p></motion.div>}</AnimatePresence></FadeIn>)}</div></section>

      <FadeIn as="section" className="rp-final"><div className="rp-final-glow"/><div className="rp-wrap"><span className="rp-eyebrow">YOUR NEXT “WHAT IF” STARTS HERE</span><h2>Stay curious.<br/>Find your <span>people.</span></h2><Magnet><a href="/original.html?demo=1" className="rp-button rp-primary"><Sparkles size={19}/>Let's get curious</a></Magnet><a href="#/join" className="rp-final-identity">Or choose your identity</a></div><img src="/cards/affinity.webp" alt="" width={512} height={512} loading="lazy" className="rp-final-art"/></FadeIn>
    </div></MotionConfig></MotionAllowed.Provider>;
}
