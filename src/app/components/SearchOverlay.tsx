import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, ArrowLeft, ArrowRight, ChevronRight, Clock, Hash } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────

type ActionKind =
  | { kind: 'chat';   id: string }
  | { kind: 'detail'; screen: string }
  | { kind: 'tab';    tab: string }
  | { kind: 'none' };

interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  categoryColor: string;
  icon: string;
  color: string;
  tags: string[];
  action: ActionKind;
}

export interface SearchOverlayProps {
  onClose: () => void;
  onNavigateToChat: (id: string) => void;
  onNavigateToDetail: (screen: string) => void;
  onNavigateToTab: (tab: string) => void;
}

// ─── Search Data ──────────────────────────────────────────────

const ALL_ITEMS: SearchItem[] = [
  {id:'bot-muse',title:'Muse · AI bot',subtitle:'Creative spark · bot preview',category:'Features',categoryColor:'#ff9bc8',icon:'🎨',color:'#ff9bc8',tags:['ai','bot','muse','creative','story'],action:{kind:'detail',screen:'bot/muse'}},
  {id:'bot-orbit',title:'Orbit · AI bot',subtitle:'Big questions · bot preview',category:'Features',categoryColor:'#9dc9ff',icon:'🪐',color:'#9dc9ff',tags:['ai','bot','orbit','ideas','questions'],action:{kind:'detail',screen:'bot/orbit'}},
  {id:'bot-pixel',title:'Pixel · AI bot',subtitle:'Design thinking · bot preview',category:'Features',categoryColor:'#80e5df',icon:'🤖',color:'#80e5df',tags:['ai','bot','pixel','design','product'],action:{kind:'detail',screen:'bot/pixel'}},
  {id:'bot-quest',title:'Quest · AI bot',subtitle:'Playful starters · bot preview',category:'Features',categoryColor:'#ffd383',icon:'🎲',color:'#ffd383',tags:['ai','bot','quest','games','riddle'],action:{kind:'detail',screen:'bot/quest'}},
  { id:'anonymous-counselling', title:'Anonymous counselling', subtitle:'Choose support preferences · save a preview request', category:'Features', categoryColor:'#80e5df', icon:'💬', color:'#80e5df', tags:['counselling','counseling','support','sessions','stress'], action:{kind:'detail',screen:'counselling'} },
  // ── Chats ──
  { id:'c1',  title:'FoxWhisperer',   subtitle:'The project insights you shared were invaluable…',  category:'Chats', categoryColor:'#f472b6', icon:'🦊', color:'#FF6B6B', tags:['chat','mental','78°','hot'],          action:{ kind:'chat', id:'1'  } },
  { id:'c2',  title:'MoonlightSage',  subtitle:'Have you tried the meditation technique I mentioned?', category:'Chats', categoryColor:'#f472b6', icon:'🌙', color:'#4ECDC4', tags:['chat','spiritual','calm'],           action:{ kind:'chat', id:'2'  } },
  { id:'c3',  title:'ThunderMind',    subtitle:'The workout plan is showing great results!',          category:'Chats', categoryColor:'#f472b6', icon:'⚡', color:'#FFE66D', tags:['chat','physical','fitness'],          action:{ kind:'chat', id:'3'  } },
  { id:'c4',  title:'OceanicPulse',   subtitle:'Does meaning survive without an audience?',          category:'Chats', categoryColor:'#f472b6', icon:'🌊', color:'#60a5fa', tags:['chat','existential','deep','91°'],     action:{ kind:'chat', id:'4'  } },
  { id:'c5',  title:'VoidArchitect',  subtitle:'I shipped it. Six months of invisible work.',        category:'Chats', categoryColor:'#f472b6', icon:'🔮', color:'#a78bfa', tags:['chat','career','work'],               action:{ kind:'chat', id:'5'  } },
  { id:'c6',  title:'CrimsonThread',  subtitle:'The canvas said more than I could in words.',        category:'Chats', categoryColor:'#f472b6', icon:'🌺', color:'#f9a8d4', tags:['chat','creative','art'],              action:{ kind:'chat', id:'6'  } },
  { id:'c7',  title:'NightOwl_7',     subtitle:'Still here. 3am thoughts hitting different tonight.',category:'Chats', categoryColor:'#f472b6', icon:'🌑', color:'#818cf8', tags:['chat','mental health','night','95°'],  action:{ kind:'chat', id:'7'  } },
  { id:'c8',  title:'CipherDream',    subtitle:'What if we were fundamentally the same person?',    category:'Chats', categoryColor:'#f472b6', icon:'🧊', color:'#67e8f9', tags:['chat','social','philosophy'],          action:{ kind:'chat', id:'8'  } },
  { id:'c9',  title:'ShadowGarden',   subtitle:'Letting someone in is terrifying. Worth it though.',category:'Chats', categoryColor:'#f472b6', icon:'🌿', color:'#86efac', tags:['chat','relationship','vulnerability'],  action:{ kind:'chat', id:'9'  } },
  { id:'c10', title:'EmberNomad',     subtitle:'Running from every version of myself that settled.', category:'Chats', categoryColor:'#f472b6', icon:'🔥', color:'#fb923c', tags:['chat','identity','84°'],              action:{ kind:'chat', id:'10' } },

  // ── Features ──
  { id:'f1',  title:'Live Streaming',      subtitle:'Watch anonymous knowledge sharing · 4 live now',    category:'Features', categoryColor:'#ef4444', icon:'📡', color:'#ef4444', tags:['live','stream','watch','radio'],       action:{ kind:'tab',    tab:'live'       } },
  { id:'f2',  title:'Daily Deck',          subtitle:'5 scenario cards · Chaotic, Deep, Chill levels',    category:'Features', categoryColor:'#818cf8', icon:'🎴', color:'#818cf8', tags:['scenario','deck','cards','daily'],     action:{ kind:'detail', screen:'scenarios'  } },
  { id:'f3',  title:'Affinity Dashboard',  subtitle:'94% Cosmos match · Compatibility mapping',         category:'Features', categoryColor:'#c084fc', icon:'🧬', color:'#c084fc', tags:['affinity','match','compatibility'],    action:{ kind:'detail', screen:'affinity'   } },
  { id:'f4',  title:'XP Economy',         subtitle:'2,840 XP · 5-day streak · Earn & spend',           category:'Features', categoryColor:'#fbbf24', icon:'⭐', color:'#fbbf24', tags:['xp','economy','points','level'],       action:{ kind:'detail', screen:'xpeconomy'  } },
  { id:'f5',  title:'Sanctuary',           subtitle:'Counselor dashboard · High-heat listener',          category:'Features', categoryColor:'#93c5fd', icon:'🛡️', color:'#93c5fd', tags:['counselor','sanctuary','heal','safe'], action:{ kind:'detail', screen:'counselor'  } },
  { id:'f6',  title:'Creative Lab Guild',     subtitle:'23 members · Live community debates',               category:'Features', categoryColor:'#fdba74', icon:'🌶️', color:'#fdba74', tags:['guild','tavern','community','spice'],  action:{ kind:'detail', screen:'guild'      } },
  { id:'f7',  title:'Trust Profile',       subtitle:'Reputation · Roots · Vouch history · Aura',        category:'Features', categoryColor:'#a5b4fc', icon:'👻', color:'#a5b4fc', tags:['trust','profile','reputation','roots'],action:{ kind:'detail', screen:'trustprofile'} },
  { id:'f8',  title:'Arbitration Chamber', subtitle:'Blind jury · AI-parsed dispute resolution',        category:'Features', categoryColor:'#d1d5db', icon:'⚖️', color:'#d1d5db', tags:['arbitration','dispute','legal','judge'],action:{ kind:'detail', screen:'arbitration' } },
  { id:'f9',  title:'Discover',            subtitle:'Explore events, quizzes, fact checks',              category:'Features', categoryColor:'#34d399', icon:'🔭', color:'#34d399', tags:['discover','explore','events','quiz'],  action:{ kind:'tab',    tab:'discover'   } },
  { id:'f10', title:'Challenges',          subtitle:'Quizzes and fact-check battles',                    category:'Features', categoryColor:'#f87171', icon:'⚔️', color:'#f87171', tags:['challenges','quiz','battle','fact'],   action:{ kind:'tab',    tab:'challenges' } },

  // ── Chat Games ──
  { id:'g1',  title:'Fate Roll',           subtitle:'/roll · Let the oracle decide your fate',          category:'Games', categoryColor:'#a78bfa', icon:'🎲', color:'#a78bfa',  tags:['game','roll','fate','dice'],            action:{ kind:'chat', id:'1' } },
  { id:'g2',  title:'Hot Take Radar',      subtitle:'/hottake · Drop a spicy opinion · vote',          category:'Games', categoryColor:'#f97316', icon:'🔥', color:'#f97316',  tags:['game','hottake','opinion','vote'],      action:{ kind:'chat', id:'1' } },
  { id:'g3',  title:'XP Bounty',           subtitle:'/bounty · Stake XP on a question',               category:'Games', categoryColor:'#10b981', icon:'⚡', color:'#10b981',  tags:['game','bounty','xp','question'],        action:{ kind:'chat', id:'1' } },
  { id:'g4',  title:'Two Truths & a Mask', subtitle:'/truth · Hide the lie · Guess the mask',         category:'Games', categoryColor:'#ec4899', icon:'🎭', color:'#ec4899',  tags:['game','truth','lie','mask','guess'],    action:{ kind:'chat', id:'1' } },
  { id:'g5',  title:'Compatibility Quiz',  subtitle:'/quiz · Map alignment · See your match',         category:'Games', categoryColor:'#06b6d4', icon:'🧠', color:'#06b6d4',  tags:['game','quiz','compatibility','match'],  action:{ kind:'chat', id:'1' } },
  { id:'g6',  title:'Mood Board',          subtitle:'/mood · Paint the vibe together',                category:'Games', categoryColor:'#8b5cf6', icon:'✨', color:'#8b5cf6',  tags:['game','mood','vibe','paint','feel'],    action:{ kind:'chat', id:'1' } },
  { id:'g7',  title:'Void Dare',           subtitle:'/dare · Anonymous dare + XP reward',             category:'Games', categoryColor:'#ef4444', icon:'🎯', color:'#ef4444',  tags:['game','dare','challenge','xp'],         action:{ kind:'chat', id:'1' } },
  { id:'g8',  title:'Story Chain',         subtitle:'/chain · Build a story sentence by sentence',    category:'Games', categoryColor:'#14b8a6', icon:'🔗', color:'#14b8a6',  tags:['game','story','chain','narrative'],     action:{ kind:'chat', id:'1' } },
  { id:'g9',  title:'Confession Jar',      subtitle:'/confess · Drop an anonymous confession',        category:'Games', categoryColor:'#fb7185', icon:'💗', color:'#fb7185',  tags:['game','confession','anonymous','jar'],  action:{ kind:'chat', id:'1' } },
  { id:'g10', title:'Mirror Match',        subtitle:'/mirror · See your reflection in others',        category:'Games', categoryColor:'#38bdf8', icon:'🪞', color:'#38bdf8',  tags:['game','mirror','reflection','match'],  action:{ kind:'chat', id:'1' } },
  { id:'g11', title:'Prediction Market',   subtitle:'/predict · Bet XP on a future event',           category:'Games', categoryColor:'#84cc16', icon:'📈', color:'#84cc16',  tags:['game','predict','bet','market','xp'],  action:{ kind:'chat', id:'1' } },
  { id:'g12', title:'Trivia Duel',         subtitle:'/trivia · Anonymous knowledge battle',           category:'Games', categoryColor:'#eab308', icon:'🏆', color:'#eab308',  tags:['game','trivia','duel','knowledge'],     action:{ kind:'chat', id:'1' } },

  // ── Grow modules ──
  { id:'gr1', title:'Shadow Simulator',    subtitle:'Chat with an AI mirror of your persona',          category:'Grow', categoryColor:'#6ee7b7', icon:'🪞', color:'#6ee7b7',  tags:['grow','ai','reflection','shadow'],      action:{ kind:'detail', screen:'growfeature/shadow-simulator' } },
  { id:'gr2', title:'Scenario Spinner',    subtitle:'Daily moral dilemma · Vibe Check report',         category:'Grow', categoryColor:'#6ee7b7', icon:'🎲', color:'#6ee7b7',  tags:['grow','scenario','daily','moral'],      action:{ kind:'detail', screen:'growfeature/scenario-spinner' } },
  { id:'gr3', title:'Vulnerability Staircase', subtitle:'Turn-based prompts that escalate with consent',category:'Grow', categoryColor:'#93c5fd', icon:'🪜', color:'#93c5fd',  tags:['grow','vulnerability','consent','deep'],action:{ kind:'detail', screen:'growfeature/vulnerability-staircase' } },
  { id:'gr4', title:'Text Escape Room',    subtitle:'15-min co-op puzzle · split clues',               category:'Grow', categoryColor:'#93c5fd', icon:'🔐', color:'#93c5fd',  tags:['grow','escape','co-op','puzzle','room'],action:{ kind:'detail', screen:'growfeature/text-escape-room' } },
  { id:'gr5', title:'Blind Empathy Swap',  subtitle:'Argue the other perspective · Resonance XP',     category:'Grow', categoryColor:'#93c5fd', icon:'🔄', color:'#93c5fd',  tags:['grow','empathy','perspective','xp'],    action:{ kind:'detail', screen:'growfeature/blind-empathy-swap' } },
  { id:'gr6', title:'Mentorship Gauntlet', subtitle:'7-day campaign · earn permanent Roots badge',     category:'Grow', categoryColor:'#fcd34d', icon:'🎓', color:'#fcd34d',  tags:['grow','mentor','badge','roots','7day'], action:{ kind:'detail', screen:'growfeature/mentorship-gauntlet' } },
  { id:'gr7', title:'Crucible Debates',    subtitle:'Role-assigned guild debates · manage heat',       category:'Grow', categoryColor:'#fcd34d', icon:'🔥', color:'#fcd34d',  tags:['grow','debate','guild','heat'],         action:{ kind:'detail', screen:'growfeature/crucible-debates'     } },
  { id:'gr8', title:'Lore Bounties',       subtitle:'Write platform history · community vote',         category:'Grow', categoryColor:'#fcd34d', icon:'📜', color:'#fcd34d',  tags:['grow','lore','write','vote','history'], action:{ kind:'detail', screen:'growfeature/lore-bounties'     } },

  // ── Heal modules ──
  { id:'h1',  title:'Lantern Garden',      subtitle:'Write a burden onto a lantern · swipe to release',category:'Heal', categoryColor:'#67e8f9', icon:'🏮', color:'#67e8f9',  tags:['heal','lantern','burden','release'],    action:{ kind:'detail', screen:'healfeature/lantern-garden' } },
  { id:'h2',  title:'Reframing Loom',      subtitle:'Community weaves a CBT reframe for your thought',category:'Heal', categoryColor:'#67e8f9', icon:'🧵', color:'#67e8f9',  tags:['heal','reframe','cbt','thought'],       action:{ kind:'detail', screen:'healfeature/reframing-loom' } },
  { id:'h3',  title:'Pulse Sync',          subtitle:'No keyboard — tap the breathing geometry',        category:'Heal', categoryColor:'#c4b5fd', icon:'💗', color:'#c4b5fd',  tags:['heal','pulse','breathe','sync','calm'], action:{ kind:'detail', screen:'healfeature/pulse-sync' } },
  { id:'h4',  title:'Kintsugi Canvas',     subtitle:'Restore shattered pottery with gratitude prompts',category:'Heal', categoryColor:'#c4b5fd', icon:'🏺', color:'#c4b5fd',  tags:['heal','kintsugi','gratitude','art'],    action:{ kind:'detail', screen:'healfeature/kintsugi-canvas' } },
  { id:'h5',  title:'Boundary Sentinels',  subtitle:'AI intercepts crisis language before it reaches you',category:'Heal', categoryColor:'#86efac', icon:'🛡️', color:'#86efac', tags:['heal','ai','boundary','safety','crisis'],action:{ kind:'detail', screen:'healfeature/boundary-sentinels' } },

  // ── Scenarios ──
  { id:'s1',  title:'Cricket Pavilion',    subtitle:'Captain locker room speech after batting collapse',category:'Scenarios', categoryColor:'#16a34a', icon:'🏏', color:'#16a34a', tags:['scenario','cricket','roleplay','sport'],action:{ kind:'detail', screen:'scenarios' } },
  { id:'s2',  title:'Cosmos Lounge',       subtitle:'Saturn 7th house · relationship astrology RP',   category:'Scenarios', categoryColor:'#8169ec', icon:'♄',  color:'#8169ec', tags:['scenario','astrology','cosmos','saturn'],action:{ kind:'detail', screen:'scenarios' } },
  { id:'s3',  title:'Creative Lab Debate',    subtitle:'Bollywood cyberpunk recast · creative roleplay',  category:'Scenarios', categoryColor:'#ea580c', icon:'🎬', color:'#ea580c', tags:['scenario','bollywood','creative','film'],action:{ kind:'detail', screen:'scenarios' } },
  { id:'s4',  title:'Deep Chat Sanctuary', subtitle:'Safe coping mechanism · introspective scenario',  category:'Scenarios', categoryColor:'#0891b2', icon:'🧠', color:'#0891b2', tags:['scenario','deep','introspect','coping'],action:{ kind:'detail', screen:'scenarios' } },
  { id:'s5',  title:'Circuit Guild Debate',subtitle:'Foldable phones · tech hot take battle',          category:'Scenarios', categoryColor:'#8169ec', icon:'⚡', color:'#8169ec', tags:['scenario','tech','debate','chaotic'],   action:{ kind:'detail', screen:'scenarios' } },
];

const CATEGORIES = [
  { label: 'All',       color: '#818cf8' },
  { label: 'Chats',     color: '#f472b6' },
  { label: 'Features',  color: '#34d399' },
  { label: 'Games',     color: '#f97316' },
  { label: 'Grow',      color: '#6ee7b7' },
  { label: 'Heal',      color: '#67e8f9' },
  { label: 'Scenarios', color: '#8169ec' },
];

const QUICK_SEARCHES = ['Hot Take', 'Fate Roll', 'Live Stream', 'NightOwl', 'Mood Board', 'Lantern Garden', 'Trust Profile', 'XP Economy'];

// ─── Search Logic ─────────────────────────────────────────────

function scoreItem(item: SearchItem, query: string): number {
  const q = query.toLowerCase();
  const titleLower = item.title.toLowerCase();
  const subLower = item.subtitle.toLowerCase();
  if (titleLower === q) return 100;
  if (titleLower.startsWith(q)) return 80;
  if (titleLower.includes(q)) return 60;
  if (subLower.includes(q)) return 40;
  if (item.tags.some(t => t.includes(q))) return 25;
  if (item.category.toLowerCase().includes(q)) return 15;
  return 0;
}

function search(query: string, catFilter: string): SearchItem[] {
  const q = query.trim();
  let pool = catFilter === 'All' ? ALL_ITEMS : ALL_ITEMS.filter(i => i.category === catFilter);
  if (!q) return pool.slice(0, 20);
  return pool
    .map(item => ({ item, score: scoreItem(item, q) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(x => x.item);
}

// ─── Result Row ───────────────────────────────────────────────

function ResultRow({ item, onSelect, index }: { item: SearchItem; onSelect: (item: SearchItem) => void; index: number }) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.25), duration: 0.18 }}
      onClick={() => onSelect(item)}
      className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
      onMouseEnter={(e:React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
      onMouseLeave={(e:React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.background = 'transparent')}
    >
      {/* Icon */}
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
        style={{ background: `${item.color}18`, border: `1px solid ${item.color}28` }}>
        {item.icon}
      </div>
      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold leading-tight" style={{ color: 'rgba(255,255,255,0.85)' }}>{item.title}</p>
        <p className="text-[10px] truncate mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{item.subtitle}</p>
      </div>
      {/* Category chip */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: `${item.categoryColor}18`, color: item.categoryColor, border: `1px solid ${item.categoryColor}28` }}>
          {item.category}
        </span>
        <ChevronRight className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.2)' }} />
      </div>
    </motion.button>
  );
}

// ─── Main Component ───────────────────────────────────────────

export function SearchOverlay({ onClose, onNavigateToChat, onNavigateToDetail, onNavigateToTab }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [recents, setRecents] = useState<string[]>(['Hot Take', 'NightOwl_7', 'Lantern Garden']);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus input after mount animation
    const t = setTimeout(() => inputRef.current?.focus(), 120);
    return () => clearTimeout(t);
  }, []);

  const results = search(query, catFilter);

  // Group results by category when no filter
  const grouped: Record<string, SearchItem[]> = {};
  if (catFilter === 'All' && query) {
    results.forEach(item => {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push(item);
    });
  }

  const handleSelect = (item: SearchItem) => {
    // Add to recents
    if (query.trim()) {
      setRecents(prev => [query.trim(), ...prev.filter(r => r !== query.trim())].slice(0, 8));
    }
    if (item.action.kind === 'chat') onNavigateToChat(item.action.id);
    else if (item.action.kind === 'detail') onNavigateToDetail(item.action.screen);
    else if (item.action.kind === 'tab') onNavigateToTab(item.action.tab);
  };

  const handleQuick = (q: string) => {
    setQuery(q);
    setCatFilter('All');
    inputRef.current?.focus();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-[100] flex flex-col"
      style={{ background: 'rgba(5,5,12,0.98)', backdropFilter: 'blur(12px)' }}
    >
      {/* ── Search bar ── */}
      <motion.div
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="flex-shrink-0 flex items-center gap-3 px-4 pt-14 pb-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <button onClick={onClose} className="p-1.5 rounded-full flex-shrink-0 transition-colors"
          onMouseEnter={(e:React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
          onMouseLeave={(e:React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.background = 'transparent')}>
          <ArrowLeft className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.5)' }} />
        </button>
        <div className="flex-1 flex items-center gap-3 rounded-2xl px-4 py-3"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.35)' }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search chats, games, features, scenarios…"
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'rgba(255,255,255,0.85)', caretColor: '#818cf8', fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
          />
          {query && (
            <button onClick={() => setQuery('')} className="flex-shrink-0">
              <X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
            </button>
          )}
        </div>
      </motion.div>

      {/* ── Category filter pills ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.2 }}
        className="flex-shrink-0 px-4 py-3 flex gap-2 overflow-x-auto"
        style={{ scrollbarWidth: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
      >
        {CATEGORIES.map(cat => {
          const active = catFilter === cat.label;
          return (
            <button key={cat.label} onClick={() => setCatFilter(cat.label)}
              className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-semibold transition-all"
              style={{
                background: active ? `${cat.color}22` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${active ? cat.color + '44' : 'rgba(255,255,255,0.07)'}`,
                color: active ? cat.color : 'rgba(255,255,255,0.38)',
              }}>
              {cat.label}
            </button>
          );
        })}
      </motion.div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <AnimatePresence mode="wait">
          {!query.trim() ? (
            /* ── Empty state: recents + quick searches ── */
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              {recents.length > 0 && (
                <div className="px-4 pt-5 pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.25)' }}>Recent</p>
                    <button onClick={() => setRecents([])} className="text-[10px]" style={{ color: 'rgba(99,102,241,0.7)' }}>Clear all</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recents.map(r => (
                      <button key={r} onClick={() => handleQuick(r)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <Clock className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.25)' }} />
                        <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.55)' }}>{r}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="px-4 pb-4">
                <p className="text-[11px] font-bold tracking-widest uppercase mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>Quick Search</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_SEARCHES.map(q => (
                    <button key={q} onClick={() => handleQuick(q)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all"
                      style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.18)' }}>
                      <Hash className="w-3 h-3" style={{ color: 'rgba(129,140,248,0.5)' }} />
                      <span className="text-[11px]" style={{ color: 'rgba(167,139,250,0.7)' }}>{q}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Browse categories */}
              <div className="px-4 pb-6">
                <p className="text-[11px] font-bold tracking-widest uppercase mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>Browse</p>
                <div className="flex flex-col gap-2">
                  {CATEGORIES.filter(c => c.label !== 'All').map((cat, i) => {
                    const count = ALL_ITEMS.filter(item => item.category === cat.label).length;
                    return (
                      <motion.button
                        key={cat.label}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.18 }}
                        onClick={() => { setCatFilter(cat.label); inputRef.current?.focus(); }}
                        className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-left transition-all"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                        onMouseEnter={(e:React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                        onMouseLeave={(e:React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                          style={{ background: `${cat.color}18`, border: `1px solid ${cat.color}28` }}>
                          <div className="w-3 h-3 rounded-full" style={{ background: cat.color }} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.78)' }}>{cat.label}</p>
                          <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.28)' }}>{count} items</p>
                        </div>
                        <ChevronRight className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.2)' }} />
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ) : results.length === 0 ? (
            /* ── No results ── */
            <motion.div key="noresult" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 pt-16 text-center px-8">
              <span className="text-4xl">🔍</span>
              <p className="text-base font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>No results for "{query}"</p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.22)' }}>Try a different keyword or browse a category</p>
            </motion.div>
          ) : catFilter !== 'All' || !query ? (
            /* ── Flat results (filtered by category) ── */
            <motion.div key="flat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="px-4 py-3 text-[11px] font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>
                {results.length} result{results.length !== 1 ? 's' : ''}{catFilter !== 'All' ? ` in ${catFilter}` : ''}
              </p>
              {results.map((item, i) => <ResultRow key={item.id} item={item} onSelect={handleSelect} index={i} />)}
              <div className="h-10" />
            </motion.div>
          ) : (
            /* ── Grouped results ── */
            <motion.div key="grouped" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {Object.entries(grouped).map(([cat, items]) => (
                <div key={cat}>
                  <div className="px-4 pt-4 pb-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: CATEGORIES.find(c => c.label === cat)?.color ?? '#818cf8' }} />
                    <p className="text-[10px] font-bold tracking-widest uppercase"
                      style={{ color: CATEGORIES.find(c => c.label === cat)?.color ?? '#818cf8', opacity: 0.7 }}>
                      {cat}
                    </p>
                    <span className="text-[9px] font-mono ml-auto" style={{ color: 'rgba(255,255,255,0.2)' }}>{items.length}</span>
                  </div>
                  {items.slice(0, 4).map((item, i) => <ResultRow key={item.id} item={item} onSelect={handleSelect} index={i} />)}
                  {items.length > 4 && (
                    <button onClick={() => setCatFilter(cat)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-[11px] font-semibold transition-colors"
                      style={{ color: 'rgba(129,140,248,0.55)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span>+{items.length - 4} more in {cat}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
              <div className="h-10" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
