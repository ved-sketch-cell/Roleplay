import { cardArtwork } from './cardArtwork';
import { visualFor } from './visuals';

export function CardIllustration({title}:{title:string}) {
  const normalized=title.replace('Skill-Tree','Skill Tree').replace('Pace-Maker','Pace Maker').replace('Ebb & Flow UI','Ebb & Flow');
  const artwork=cardArtwork[normalized];
  const {icon:Icon}=visualFor(title);
  return <span className={`mobile-card-art${artwork?'':' mobile-card-art-fallback'}`} aria-hidden="true">
    {artwork?<img src={`/cards/${artwork}.webp`} alt="" width={512} height={512} loading="lazy" decoding="async" draggable={false}/>:<Icon strokeWidth={1.35}/>}
  </span>;
}
