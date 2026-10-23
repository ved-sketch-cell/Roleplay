import { useState, useRef, type PointerEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, Star, Crown, MessageCircle, Users } from 'lucide-react';
import { useFlowState } from '../mobile/FlowState';
import { useDeviceState } from '../mobile/state';
import { ALL_CARDS, suggestedDeckChat, type ScenarioCard } from '../mobile/dailyDeck';
import { conversationProfile } from '../mobile/conversationProfiles';
import { JourneyDialog } from '../mobile/JourneyDialog';

interface ScenarioDeckProps {
  onBack: () => void;
  onStartChat: (cardId: string, chatId: string) => void;
  onManageBlocked: () => void;
  onExploreRooms?: (room?: string) => void;
}
type FilterLevel = 'all' | 'chill' | 'deep' | 'chaotic';
const FILTERS = [{key:'all',label:'All',emoji:'🎴'}, {key:'chill',label:'Chill',emoji:'🧊'}, {key:'deep',label:'Deep',emoji:'🌊'}, {key:'chaotic',label:'Chaotic',emoji:'🔥'}] as const;

export function ScenarioDeck({ onBack, onStartChat, onExploreRooms, onManageBlocked }: ScenarioDeckProps) {
  const [filter, setFilter] = useFlowState<FilterLevel>('ScenarioDeck.filter', 'all');
  const [savedKeys, setSavedKeys] = useDeviceState<string[]>('deck-saved', []);
  const [blocked] = useDeviceState<string[]>('blocked-users', []);
  const [dismissed, setDismissed] = useFlowState<Set<string>>('ScenarioDeck.dismissedIds', new Set());
  const [feedback, setFeedback] = useState('');
  const [pickerCard, setPickerCard] = useState<ScenarioCard | null>(null);
  const [dragX, setDragX] = useState(0);
  const start = useRef<{x: number; y: number; horizontal: boolean} | null>(null);
  const filtered = ALL_CARDS.filter(c => filter === 'all' || c.level === filter);
  const remaining = filtered.filter(c => !dismissed.has(c.id));
  const current = remaining[0];
  const saved = ALL_CARDS.filter(c => savedKeys.includes(c.id));
  const dismiss = (id: string) => {setDismissed(previous => new Set([...previous, id])); setDragX(0);};
  const save = (id: string) => {setSavedKeys(previous => Array.from(new Set([...previous, id]))); setFeedback('Saved on this device. Start a chat from your saved prompts anytime.'); dismiss(id);};
  const peers = Array.from({length: 10}, (_, index) => String(index + 1)).filter(id => !blocked.includes(id)).sort((a, b) => Number(b === suggestedDeckChat[pickerCard?.id || '']) - Number(a === suggestedDeckChat[pickerCard?.id || '']));
  const pointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || (event.target as HTMLElement).closest('button,a,summary,input')) return;
    start.current = {x:event.clientX, y:event.clientY, horizontal:false};
  };
  const pointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!start.current) return;
    const dx = event.clientX - start.current.x, dy = event.clientY - start.current.y;
    if (!start.current.horizontal) {
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) {start.current = null; return;}
      if (Math.abs(dx) < 12 || Math.abs(dx) <= Math.abs(dy)) return;
      start.current.horizontal = true; event.currentTarget.setPointerCapture(event.pointerId);
    }
    setDragX(Math.max(-110, Math.min(110, dx)));
  };
  const pointerUp = (event: PointerEvent<HTMLDivElement>) => {if (current && start.current?.horizontal) {const delta=event.clientX-start.current.x;if (delta < -80) dismiss(current.id); else if (delta > 80) save(current.id);} start.current = null; setDragX(0);};

  return <section className="mobile-daily-deck">
    <header className="daily-deck-header"><button className="mobile-icon-button" onClick={onBack} aria-label="Back"><ArrowLeft size={20}/></button><div><h1>Daily Deck</h1><p>{ALL_CARDS.length} sample prompts · {saved.length} saved</p></div><span aria-hidden="true">🎴</span></header>
    <div className="daily-deck-filters" aria-label="Prompt intensity">{FILTERS.map(f => <button key={f.key} aria-label={f.label} aria-pressed={filter === f.key} onClick={() => {setFilter(f.key); setDragX(0); setFeedback('');}}><span aria-hidden="true">{f.emoji}</span>{f.label}</button>)}</div>
    <div className="daily-deck-content">
      {current ? <>
        <div className="daily-deck-stack">
          {remaining.slice(1, 3).reverse().map((card, index) => <div key={card.id} className="daily-deck-stack-layer" aria-hidden="true" style={{background:`linear-gradient(140deg, ${card.secondColor}, #22212d)`,transform:`scale(${index === 0 ? .9 : .95}) translateY(${index === 0 ? 24 : 12}px)`}}/>)}
          <AnimatePresence mode="wait"><motion.div key={current.id} className="daily-deck-card" onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={() => {start.current = null; setDragX(0);}} initial={{opacity:0,y:10}} animate={{opacity:1,y:0,x:dragX,rotate:dragX*.02}} exit={{opacity:0}} transition={{duration:.18}} style={{background:`linear-gradient(155deg, ${current.secondColor}dd, #1c1825 70%)`,border:`1px solid ${current.color}65`}}>
            <div className="daily-deck-card-top"><span className="daily-deck-category">{current.emoji} {current.category}</span><span className="daily-deck-level">{current.level}</span></div>
            <div className="daily-deck-card-art" aria-hidden="true" style={{background:`radial-gradient(ellipse at 25% 20%, ${current.color}80, ${current.secondColor}55 60%, #292131)`}}><span>{current.emoji}</span></div>
            <p className="daily-deck-prompt">{current.prompt}</p>
            <p className="daily-deck-drive">{current.driveEmoji} {current.drive}</p>
            {current.xpBounty && <div className="daily-deck-bounty"><Crown size={15}/><span>{current.author} · sample bounty</span><strong>{current.xpBounty} XP</strong></div>}
            <button className="mobile-primary-button" onClick={() => setPickerCard(current)}><MessageCircle size={18}/>Start a chat<ArrowRight size={18}/></button>
            {onExploreRooms && <button className="mobile-text-button daily-deck-room-button" onClick={() => onExploreRooms(current.room)}><Users size={16}/>Or explore sample rooms</button>}
          </motion.div></AnimatePresence>
        </div>
        <div className="mobile-deck-actions"><button className="mobile-secondary-button" onClick={() => dismiss(current.id)}>Skip card</button><button className="mobile-primary-button" onClick={() => save(current.id)}><Star size={17}/>Save card</button></div>
        <p className="daily-deck-counter">{remaining.length} {remaining.length === 1 ? 'prompt' : 'prompts'} left · Swipe to skip or save</p>
      </> : <div className="daily-deck-empty"><span aria-hidden="true">🎴</span><h2>You’ve explored this deck.</h2><p>Try another intensity or revisit your saved prompts.</p><button className="mobile-primary-button" onClick={() => {setDismissed(new Set()); setFeedback('');}}>Replay Deck</button></div>}
    </div>
    <p className="mobile-deck-status" role="status">{feedback || 'Sample deck · Prompts and messages stay on this device.'}</p>
    {saved.length > 0 && <details className="mobile-saved-prompts"><summary>Saved prompts ({saved.length})</summary>{saved.map(card => <article key={card.id}><strong>{card.emoji} {card.category}</strong><p>{card.prompt}</p><div className="daily-saved-actions"><button className="mobile-secondary-button" aria-label={'Start a chat with saved ' + card.category + ' prompt'} onClick={() => setPickerCard(card)}><MessageCircle size={16}/>Start a chat</button><button className="mobile-text-button" aria-label={'Remove saved ' + card.category + ' card'} onClick={() => setSavedKeys(ids => ids.filter(id => id !== card.id))}>Remove</button></div></article>)}</details>}
    {pickerCard && <JourneyDialog title="Who would you like to play with?" onClose={() => setPickerCard(null)}><p className="deck-picker-prompt">{pickerCard.emoji} {pickerCard.prompt}</p><p>Choose a sample conversation. The prompt opens inside the chat.</p><div className="deck-conversation-list">{peers.map(id => {const peer = conversationProfile(id); return <button key={id} aria-label={'Start deck chat with ' + peer.alias} onClick={() => onStartChat(pickerCard.id, id)}><span className="deck-conversation-avatar" aria-hidden="true">{peer.avatar}</span><span><strong>{peer.alias}</strong><small>{peer.intent}{id === suggestedDeckChat[pickerCard.id] ? ' · Suggested' : ''}</small></span><ArrowRight size={17}/></button>;})}</div>{peers.length === 0 && <div className="mobile-empty"><p>All sample conversations are blocked. Manage your blocked list to choose someone.</p><button className="mobile-primary-button" onClick={onManageBlocked}>Manage blocked conversations</button></div>}</JourneyDialog>}
  </section>;
}
