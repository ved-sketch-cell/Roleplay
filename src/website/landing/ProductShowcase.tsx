import {motion} from 'framer-motion';
import {ArrowUpRight, Compass, Flame, Gamepad2, KeyRound, Sparkles} from 'lucide-react';
import {FadeIn, useMotionAllowed} from './Motion';
import {ProductGraphic, type ProductGraphicKind, type ProductGraphicTone} from './ProductGraphic';
import './ProductShowcase.css';

const products=[
  {id:'chatgames',name:'Chat Games',category:'PLAY',icon:Gamepad2,graphic:'controller',material:'pink',tone:'rose',description:'Games that spark a conversation.',action:'Let’s play',note:'A little play. A better hello.'},
  {id:'text-escape-room',name:'Text Escape Room',category:'GROW',icon:KeyRound,graphic:'cards',material:'cyan',tone:'amber',description:'Two minds. One way out.',action:'Explore the room',note:'Follow your curiosity.'},
  {id:'affinity',name:'Affinity',category:'CONNECT',icon:Compass,graphic:'orbit',material:'cyan',tone:'cyan',description:'Find your wavelength.',action:'Explore Affinity',note:'Discover common ground.'},
  {id:'lantern-garden',name:'Lantern Garden',category:'HEAL',icon:Flame,graphic:'garden',material:'amber',tone:'sage',description:'Let a little weight go.',action:'Step into the garden',note:'Make room for a pause.'},
] satisfies Array<{id:string; name:string; category:string; icon:typeof Gamepad2; graphic:ProductGraphicKind; material:ProductGraphicTone; tone:string; description:string; action:string; note:string}>;

export function ProductShowcase() {
  const allowed=useMotionAllowed();
  return <section className="rp-wrap rp-section rp-toolkit" id="experiences" aria-labelledby="rp-toolkit-title">
    <FadeIn className="rp-section-heading"><div><span className="rp-eyebrow"><Sparkles size={15} aria-hidden="true"/>THE ROLEPLAY TOOLKIT</span><h2 id="rp-toolkit-title">Small moments.<br/><span className="rp-heading-green">More possibilities.</span></h2></div></FadeIn>
    <div className="rp-tool-grid">{products.map((product,i)=><FadeIn as="article" key={product.id} delay={i*0.07} className={`rp-tool-card rp-tool-card-${product.tone} rp-tool-material-${product.material} ${i===0?'rp-tool-featured':''}`}>
      <motion.a href={`#/app/feature/${product.id}`} aria-labelledby={`rp-tool-title-${product.id}`} aria-describedby={`rp-tool-description-${product.id}`} whileHover={allowed?{y:-5}:{}} transition={{duration:0.25}}>
        <div className="rp-tool-copy">
          <span className="rp-tool-category"><product.icon size={16} aria-hidden="true"/>{product.category}</span>
          <h3 id={`rp-tool-title-${product.id}`}>{product.name}</h3>
          <p id={`rp-tool-description-${product.id}`}>{product.description}</p>
          <span className="rp-tool-action">{product.action}<ArrowUpRight size={18} aria-hidden="true"/></span>
        </div>
        <div className="rp-tool-art" aria-hidden="true">
          <div className="rp-tool-halo"/>
          <ProductGraphic kind={product.graphic} tone={product.material}/>
          <span className="rp-tool-note"><product.icon size={14}/>{product.note}</span>
          {i===0&&<><Sparkles className="rp-tool-spark rp-tool-spark-one" size={27}/><Sparkles className="rp-tool-spark rp-tool-spark-two" size={18}/></>}
        </div>
      </motion.a>
    </FadeIn>)}</div>
  </section>;
}
