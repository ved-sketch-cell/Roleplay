import {useFlowState} from '../mobile/FlowState';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Users, Flame, Dice6, Sparkles, Star,
  X, RefreshCw, Hash, ChevronRight, Shield, Zap,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────

interface GuildTavernProps {
  onBack: () => void;
}

interface GroupMessage {
  id: string;
  userId: string;
  avatar: string;
  avatarColor: string;
  affinity?: number;
  text?: string;
  timestamp: string;
  gameType?: 'dice' | 'scenario' | 'hottake';
  diceResult?: number;
  statement?: string;
  isSystem?: boolean;
}

// ─── Data ─────────────────────────────────────────────────────

const GUILD = {
  name: '🌶️ Creative Lab',
  subtitle: 'Bollywood · Hot Takes · No Filter',
  membersTotal: 247,
  online: 23,
};

const MEMBERS = [
  { id: '1', avatar: '🦊', name: 'NightFox_21',   color: '#6366f1', affinity: 892,  status: 'active'  },
  { id: '2', avatar: '🐉', name: 'DragonMask_K',  color: '#dc2626', affinity: 1204, status: 'active'  },
  { id: '3', avatar: '🌙', name: 'MoonRider',     color: '#8b5cf6', affinity: 543,  status: 'idle'    },
  { id: '4', avatar: '🎭', name: 'PhantomR',      color: '#ec4899', affinity: 738,  status: 'active'  },
  { id: '5', avatar: '🦋', name: 'AstroMaven',    color: '#06b6d4', affinity: 1056, status: 'active'  },
  { id: '6', avatar: '⚡', name: 'StarGazer_K',   color: '#f59e0b', affinity: 621,  status: 'idle'    },
  { id: '7', avatar: '🐺', name: 'WolfWhisper',   color: '#10b981', affinity: 445,  status: 'active'  },
  { id: '8', avatar: '🎪', name: 'CircusDream',   color: '#f97316', affinity: 289,  status: 'offline' },
];

const SCENARIO_PROMPTS = [
  '🎬 Which 2000s Bollywood film had the most unrealistic plot but the undeniable best music?',
  '🌟 Rank the 3 best SRK performances of all time. No repeats. No nostalgia bias.',
  '🔮 If Bollywood made a film about your current emotional state, what is the title?',
  '⚽ Who wins the IPL this year — and what is the margin?',
  '🎭 What Bollywood character are you most like at 2 AM?',
];

const FATE_LINES = [
  '"This debate is unresolvable by mortal means."',
  '"The Oracle has spoken. Neither side wins."',
  '"Fate says: you are both correct, somehow."',
  '"The dice have sided with chaos."',
  '"Destiny has no opinion on this matter."',
  '"The cosmos remain spectacularly unbothered."',
];

const TRIVIA = {
  q: 'Which SRK film won the Filmfare Award for Best Film in 1999?',
  opts: ['Kuch Kuch Hota Hai', 'Dil Se', 'Duplicate', 'Mohabbatein'],
  ans: 0,
};

const INITIAL_MESSAGES: GroupMessage[] = [
  {
    id: 'm1', userId: 'StarGazer_K', avatar: '⚡', avatarColor: '#f59e0b', affinity: 621,
    text: 'DDLJ is still the GOAT. No one can change my mind 🎬',
    timestamp: '11:42 PM',
  },
  {
    id: 'm2', userId: 'DragonMask_K', avatar: '🐉', avatarColor: '#dc2626', affinity: 1204,
    text: "Hard disagree. DDLJ is pure nostalgia bias. Devdas is the real article.",
    timestamp: '11:42 PM',
  },
  {
    id: 'm3', userId: 'NightFox_21', avatar: '🦊', avatarColor: '#6366f1', affinity: 892,
    timestamp: '11:43 PM',
    gameType: 'dice', diceResult: 5,
  },
  {
    id: 'm4', userId: 'AstroMaven', avatar: '🦋', avatarColor: '#06b6d4', affinity: 1056,
    text: 'Okay but can we PLEASE also talk about Kal Ho Naa Ho? Criminally underrated.',
    timestamp: '11:44 PM',
  },
  {
    id: 'm5', userId: 'PhantomR', avatar: '🎭', avatarColor: '#ec4899',
    text: 'Underrated?? It broke an entire generation 😭',
    timestamp: '11:44 PM',
  },
  {
    id: 'm6', userId: 'MoonRider', avatar: '🌙', avatarColor: '#8b5cf6',
    text: 'iykyk but KHNH is just a Bollywood-coded One Fine Day',
    timestamp: '11:45 PM',
  },
  {
    id: 'm7', userId: 'DragonMask_K', avatar: '🐉', avatarColor: '#dc2626', affinity: 1204,
    text: 'Sir this is a KHNH protection squad room 🙅',
    timestamp: '11:45 PM',
  },
  {
    id: 'm8', userId: 'System', avatar: '✨', avatarColor: '#a855f7',
    isSystem: false,
    timestamp: '11:46 PM',
    gameType: 'scenario',
    statement: '🎬 Scenario Drop: If SRK had taken the Salman role in Hum Saath Saath Hain — does the 90s look different? Go.',
  },
  {
    id: 'm9', userId: 'StarGazer_K', avatar: '⚡', avatarColor: '#f59e0b', affinity: 621,
    text: 'Completely different. The era was shaped by the rivalry as much as the films.',
    timestamp: '11:47 PM',
  },
  {
    id: 'm10', userId: 'AstroMaven', avatar: '🦋', avatarColor: '#06b6d4', affinity: 1056,
    text: 'Manifesting a KKHH group rewatch rn 🙏',
    timestamp: '11:47 PM',
  },
];

// ─── Sub-components ───────────────────────────────────────────

const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

function GroupBubble({ msg, isMe }: { msg: GroupMessage; isMe: boolean }) {
  if (msg.gameType === 'scenario') {
    return (
      <div className="flex justify-center my-1">
        <div
          className="rounded-2xl overflow-hidden max-w-[90%]"
          style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.18)' }}
        >
          <div
            className="px-4 pt-3 pb-2 flex items-center gap-2"
            style={{ borderBottom: '1px solid rgba(168,85,247,0.08)' }}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-purple-300/60">
              Scenario Spinner
            </span>
          </div>
          <p className="px-4 py-3 text-sm" style={{ color: 'rgba(255,255,255,0.82)' }}>{msg.statement}</p>
        </div>
      </div>
    );
  }

  if (msg.gameType === 'dice' && msg.diceResult !== undefined) {
    return (
      <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2`}>
        {!isMe && (
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 mb-4"
            style={{ background: `${msg.avatarColor}20` }}
          >
            {msg.avatar}
          </div>
        )}
        <div>
          {!isMe && (
            <p className="text-[10px] font-semibold px-1 mb-1" style={{ color: msg.avatarColor }}>
              {msg.userId}
            </p>
          )}
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{ background: 'rgba(245,158,11,0.09)', border: '1px solid rgba(245,158,11,0.18)' }}
          >
            <span className="text-2xl">{DICE_FACES[msg.diceResult - 1]}</span>
            <div>
              <p className="text-[10px] font-mono" style={{ color: 'rgba(245,158,11,0.65)' }}>
                {msg.userId} rolled {msg.diceResult}
              </p>
              <p className="text-xs italic mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {FATE_LINES[msg.diceResult - 1]}
              </p>
            </div>
          </div>
          <p className={`text-[9px] font-mono px-1 mt-0.5 ${isMe ? 'text-right' : ''}`} style={{ color: 'rgba(255,255,255,0.2)' }}>
            {msg.timestamp}
          </p>
        </div>
      </div>
    );
  }

  if (msg.isSystem) {
    return (
      <div className="flex justify-center">
        <p
          className="text-xs text-center px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.35)' }}
        >
          {msg.text}
        </p>
      </div>
    );
  }

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2`}>
      {!isMe && (
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 mb-5"
          style={{ background: `${msg.avatarColor}20` }}
        >
          {msg.avatar}
        </div>
      )}
      <div className="max-w-[75%] space-y-0.5">
        {!isMe && (
          <div className="flex items-center gap-1.5 px-1 mb-1">
            <span className="text-[10px] font-semibold" style={{ color: msg.avatarColor }}>{msg.userId}</span>
            {msg.affinity && (
              <>
                <Star className="w-2.5 h-2.5" style={{ color: '#f59e0b' }} />
                <span className="text-[9px] font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>{msg.affinity}</span>
              </>
            )}
          </div>
        )}
        <div
          className="px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed"
          style={
            isMe
              ? { background: 'linear-gradient(135deg, #8169ec, #6d28d9)', color: 'rgba(255,255,255,0.92)' }
              : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.78)' }
          }
        >
          {msg.text}
        </div>
        <p
          className={`text-[9px] font-mono px-1 ${isMe ? 'text-right' : ''}`}
          style={{ color: 'rgba(255,255,255,0.2)' }}
        >
          {msg.timestamp}
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────

export function GuildTavern({ onBack }: GuildTavernProps) {
  const [roomHeat, setRoomHeat] = useState(65);
  const [intermission, setIntermission] = useFlowState('GuildTavern.intermission',false);
  const [intermissionTimer, setIntermissionTimer] = useState(60);
  const [triviaAnswer, setTriviaAnswer] = useFlowState<number | null>('GuildTavern.triviaAnswer',null);
  const [messages, setMessages] = useFlowState<GroupMessage[]>('GuildTavern.messages',INITIAL_MESSAGES);
  const [inputText, setInputText] = useFlowState('GuildTavern.inputText','');
  const [showMembers, setShowMembers] = useFlowState('GuildTavern.showMembers',false);
  const [rolling, setRolling] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Room heat ticks up
  useEffect(() => {
    if (intermission) return;
    const t = setInterval(() => {
      setRoomHeat(v => {
        if (v >= 100) { setIntermission(true); return 100; }
        return Math.min(100, v + 0.7);
      });
    }, 2200);
    return () => clearInterval(t);
  }, [intermission]);

  // Intermission countdown
  useEffect(() => {
    if (!intermission) return;
    const t = setInterval(() => {
      setIntermissionTimer(prev => {
        if (prev <= 1) {
          cooldown();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [intermission]);

  const cooldown = () => {
    setIntermission(false);
    setRoomHeat(28);
    setIntermissionTimer(60);
    setTriviaAnswer(null);
    const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        userId: 'System', avatar: '✨', avatarColor: '#a855f7',
        isSystem: true,
        text: '🌡️ Vibe reset complete. Temperature restored. Let\'s keep it legendary.',
        timestamp: ts,
      },
    ]);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const ts = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleSend = () => {
    if (!inputText.trim() || intermission) return;
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      userId: 'You', avatar: '🎯', avatarColor: '#8169ec',
      text: inputText.trim(), timestamp: ts(),
    }]);
    setInputText('');
    setRoomHeat(v => Math.min(99, v + 4));
  };

  const handleDiceRoll = () => {
    if (rolling || intermission) return;
    setRolling(true);
    setTimeout(() => {
      const result = Math.floor(Math.random() * 6) + 1;
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        userId: 'You', avatar: '🎯', avatarColor: '#8169ec',
        timestamp: ts(), gameType: 'dice', diceResult: result,
      }]);
      setRolling(false);
      setRoomHeat(v => Math.min(99, v + 3));
    }, 750);
  };

  const handleScenario = () => {
    if (intermission) return;
    const prompt = SCENARIO_PROMPTS[Math.floor(Math.random() * SCENARIO_PROMPTS.length)];
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      userId: 'System', avatar: '✨', avatarColor: '#a855f7',
      timestamp: ts(), gameType: 'scenario', statement: prompt,
    }]);
    setRoomHeat(v => Math.min(99, v + 7));
  };

  const handleTrivia = (i: number) => {
    if (triviaAnswer !== null) return;
    setTriviaAnswer(i);
    setTimeout(cooldown, 1600);
  };

  const heatColor = roomHeat > 78 ? '#dc2626' : roomHeat > 50 ? '#f59e0b' : '#10b981';
  const heatLabel = roomHeat > 78 ? '🔥 HOT' : roomHeat > 50 ? '⚡ LIVE' : '✓ CHILL';

  return (
    <div
      className="h-screen flex flex-col relative overflow-hidden"
      style={{ background: '#0a0710', fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
    >
      {/* ── Header ── */}
      <div
        className="flex-shrink-0 px-4 py-3 flex items-center gap-3 z-10"
        style={{ background: 'rgba(11,9,20,0.97)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <button onClick={onBack} className="p-1.5 rounded-full hover:bg-white/[0.08] transition-colors">
          <ArrowLeft className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.5)' }} />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold" style={{ color: 'rgba(255,255,255,0.92)' }}>{GUILD.name}</span>
            <div className="w-2 h-2 rounded-full animate-pulse flex-shrink-0" style={{ background: '#34d399' }} />
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{GUILD.subtitle}</span>
            <span
              className="text-[10px] font-mono px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}
            >
              {GUILD.online} live
            </span>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={() => setShowMembers(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all"
          style={{
            background: showMembers ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <Users className="w-3.5 h-3.5" style={{ color: showMembers ? '#818cf8' : 'rgba(255,255,255,0.4)' }} />
          <span className="text-xs font-mono" style={{ color: showMembers ? '#818cf8' : 'rgba(255,255,255,0.4)' }}>
            {GUILD.online}
          </span>
        </motion.button>
      </div>

      {/* ── Room Heat Meter ── */}
      <div
        className="flex-shrink-0 px-5 py-2.5"
        style={{ background: 'rgba(10,8,18,0.98)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
      >
        <div className="flex items-center gap-3">
          <Flame className="w-3.5 h-3.5 flex-shrink-0" style={{ color: heatColor }} />
          <div className="flex-1 relative h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <motion.div
              className="absolute left-0 top-0 h-full rounded-full"
              animate={{ width: `${roomHeat}%`, backgroundColor: heatColor }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
            />
          </div>
          <span className="text-[11px] font-mono font-bold flex-shrink-0" style={{ color: heatColor }}>
            {heatLabel}
          </span>
        </div>
        <AnimatePresence>
          {roomHeat > 75 && !intermission && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-[10px] mt-1.5 text-center animate-pulse"
              style={{ color: 'rgba(245,158,11,0.55)' }}
            >
              Room is heating up. AI intermission may trigger soon.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* ── Chat Feed ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ scrollbarWidth: 'none' }}>
        {messages.map(msg => (
          <GroupBubble key={msg.id} msg={msg} isMe={msg.userId === 'You'} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Bar ── */}
      <div
        className="flex-shrink-0 px-4 py-3"
        style={{
          background: 'rgba(9,8,17,0.97)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div className="flex items-center gap-2.5">
          {/* Dice Roll */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleDiceRoll}
            disabled={rolling || intermission}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }}
          >
            {rolling ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}>
                <RefreshCw className="w-4 h-4 text-amber-400" />
              </motion.div>
            ) : (
              <Dice6 className="w-4 h-4 text-amber-400" />
            )}
          </motion.button>

          <input
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder={intermission ? 'Chat paused — intermission active…' : 'Drop your take…'}
            disabled={intermission}
            className="flex-1 rounded-full px-4 py-2.5 text-sm outline-none"
            style={{
              background: intermission ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.07)',
              color: 'rgba(255,255,255,0.82)',
            }}
          />

          {/* Scenario Spinner */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleScenario}
            disabled={intermission}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(168,85,247,0.14)', border: '1px solid rgba(168,85,247,0.2)' }}
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
          </motion.button>
        </div>
        <div className="flex items-center gap-4 mt-2 px-1">
          <span className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.18)' }}>🎲 Roll dice</span>
          <span className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.18)' }}>✨ Scenario Spinner</span>
        </div>
      </div>

      {/* ── Members Sidebar ── */}
      <AnimatePresence>
        {showMembers && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20"
              style={{ background: 'rgba(0,0,0,0.4)' }}
              onClick={() => setShowMembers(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="absolute right-0 top-0 bottom-0 z-30 flex flex-col overflow-hidden"
              style={{
                width: '210px',
                background: 'rgba(13,11,24,0.98)',
                backdropFilter: 'blur(24px)',
                borderLeft: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              {/* Members header */}
              <div
                className="sticky top-0 px-4 pt-4 pb-3 flex items-center justify-between flex-shrink-0"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
              >
                <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Online · {GUILD.online}
                </span>
                <button onClick={() => setShowMembers(false)}>
                  <X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
                </button>
              </div>

              {/* Member list */}
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1" style={{ scrollbarWidth: 'none' }}>
                {MEMBERS.map(m => (
                  <div
                    key={m.id}
                    className="flex items-center gap-2.5 px-2 py-2 rounded-xl transition-colors"
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: `${m.color}20`, fontSize: '1rem' }}
                      >
                        {m.avatar}
                      </div>
                      <div
                        className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                        style={{
                          background: m.status === 'active' ? '#34d399' : m.status === 'idle' ? '#f59e0b' : '#6b7280',
                          borderColor: '#0d0b18',
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: 'rgba(255,255,255,0.72)' }}>{m.name}</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 flex-shrink-0" style={{ color: '#f59e0b' }} />
                        <span className="text-[9px] font-mono" style={{ color: 'rgba(255,255,255,0.28)' }}>{m.affinity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Whisper gate hint */}
              <div
                className="flex-shrink-0 px-4 py-3 m-3 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-3 h-3 text-violet-400" />
                  <span className="text-[10px] font-semibold text-violet-400/70">Whisper System</span>
                </div>
                <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Tap a member to send a Vibe Check invite. Consent required before DMs open.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Intermission Overlay ── */}
      <AnimatePresence>
        {intermission && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center px-6"
            style={{ background: 'rgba(5,4,12,0.93)', backdropFilter: 'blur(20px)' }}
          >
            <motion.div
              initial={{ scale: 0.88, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', damping: 22, stiffness: 260 }}
              className="w-full max-w-sm rounded-3xl overflow-hidden"
              style={{ background: 'rgba(20,16,38,0.99)', border: '1px solid rgba(245,158,11,0.22)' }}
            >
              {/* Intermission header */}
              <div className="px-6 pt-6 pb-4 text-center" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-4xl mb-2">🌡️</div>
                <h2 className="text-lg font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>Room Intermission</h2>
                <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.38)' }}>
                  AI-triggered vibe reset · {intermissionTimer}s
                </p>
                <div className="mt-3 relative h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <motion.div
                    className="absolute left-0 top-0 h-full rounded-full"
                    style={{ background: '#f59e0b' }}
                    animate={{ width: `${(intermissionTimer / 60) * 100}%` }}
                    transition={{ duration: 1, ease: 'linear' }}
                  />
                </div>
              </div>

              {/* Trivia */}
              <div className="p-6">
                <p className="text-sm font-semibold mb-4" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  Quick Trivia — settle the vibe:
                </p>
                <p className="text-base font-bold mb-5" style={{ color: 'rgba(255,255,255,0.9)' }}>
                  {TRIVIA.q}
                </p>
                <div className="space-y-2">
                  {TRIVIA.opts.map((opt, i) => {
                    const answered = triviaAnswer !== null;
                    const isCorrect = i === TRIVIA.ans;
                    const isPicked = triviaAnswer === i;
                    return (
                      <motion.button
                        key={i}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleTrivia(i)}
                        disabled={answered}
                        className="w-full py-3 px-4 rounded-xl text-left text-sm font-medium transition-all"
                        style={{
                          background: answered
                            ? isCorrect ? 'rgba(16,185,129,0.14)' : isPicked ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.04)'
                            : 'rgba(255,255,255,0.06)',
                          border: answered
                            ? isCorrect ? '1px solid rgba(16,185,129,0.3)' : isPicked ? '1px solid rgba(239,68,68,0.25)' : '1px solid rgba(255,255,255,0.05)'
                            : '1px solid rgba(255,255,255,0.08)',
                          color: answered
                            ? isCorrect ? '#6ee7b7' : isPicked ? '#fca5a5' : 'rgba(255,255,255,0.28)'
                            : 'rgba(255,255,255,0.78)',
                        }}
                      >
                        {answered && isCorrect && '✓ '}
                        {answered && isPicked && !isCorrect && '✗ '}
                        {opt}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
