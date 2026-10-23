import {useFlowState} from '../mobile/FlowState';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MobileHeader, SectionHeading } from '../mobile/MobileUI';
import { accentStyle, visualFor } from '../mobile/visuals';
function RoomCategoryIcon({category}:{category:string}) {const Icon=visualFor(category).icon;return <Icon size={18} aria-hidden="true"/>;}
import {
  ArrowLeft, Radio, Eye, Heart, Gift, Share2, Send, Mic, MicOff,
  ChevronRight, Flame, Zap, Users, Trophy, TrendingUp, Star, Shield, Music, Sparkles
} from 'lucide-react';

// ─── Data ─────────────────────────────────────────────────────────────────────

interface Room {
  id: string;
  name: string;
  emoji: string;
  category: string;
  tagline: string;
  viewers: number;
  hot: boolean;
  color: string;
  bg: string;
  host: { avatar: string; code: string; verified: boolean };
  tags: string[];
  pinned?: boolean;
}

const ROOMS: Room[] = [
  {
    id: 'cricket-pavilion',
    name: 'Cricket Pavilion',
    emoji: '🏏',
    category: 'Sports',
    tagline: 'IPL 2025 Mega Auction — live takes & predictions',
    viewers: 34,
    hot: false,
    color: '#34d399',
    bg: 'linear-gradient(135deg, #052e1c 0%, #041a10 100%)',
    host: { avatar: '🦁', code: '2291', verified: true },
    tags: ['IPL', 'Live Analysis', 'Predictions'],
    pinned: true,
  },
  {
    id: 'midnight-confessions',
    name: 'Midnight Confessions',
    emoji: '🌑',
    category: 'Raw',
    tagline: '3am thoughts — no filter, witnessed in silence',
    viewers: 187,
    hot: true,
    color: '#818cf8',
    bg: 'linear-gradient(135deg, #0d0b1a 0%, #080611 100%)',
    host: { avatar: '🌑', code: '9003', verified: true },
    tags: ['3AM', 'Unfiltered', 'Mental Health'],
  },
  {
    id: 'frequency-room',
    name: 'Frequency Room',
    emoji: '🎵',
    category: 'Vibe',
    tagline: 'Lo-fi + ambient conversation · just exist here',
    viewers: 445,
    hot: true,
    color: '#f472b6',
    bg: 'linear-gradient(135deg, #1a0510 0%, #12030b 100%)',
    host: { avatar: '🎧', code: '5541', verified: false },
    tags: ['Lo-fi', 'Ambient', 'Chill'],
  },
  {
    id: 'deep-dive',
    name: 'Deep Dive',
    emoji: '🌊',
    category: 'Philosophy',
    tagline: 'Existential questions that keep you up at night',
    viewers: 241,
    hot: true,
    color: '#60a5fa',
    bg: 'linear-gradient(135deg, #020c1a 0%, #010810 100%)',
    host: { avatar: '🌊', code: '4412', verified: true },
    tags: ['Existential', 'Q&A', 'Live'],
  },
  {
    id: 'iron-hour',
    name: 'Iron Hour',
    emoji: '💪',
    category: 'Physical',
    tagline: 'Live workout — body-weight, follow along anywhere',
    viewers: 312,
    hot: true,
    color: '#fb923c',
    bg: 'linear-gradient(135deg, #1a0800 0%, #120500 100%)',
    host: { avatar: '🔥', code: '7712', verified: true },
    tags: ['Workout', 'Live', 'No Equipment'],
  },
  {
    id: 'stillwater',
    name: 'Stillwater',
    emoji: '🧘',
    category: 'Spiritual',
    tagline: 'Guided breath + shared silence — 18 min session',
    viewers: 92,
    hot: false,
    color: '#67e8f9',
    bg: 'linear-gradient(135deg, #020d10 0%, #010a0e 100%)',
    host: { avatar: '🌸', code: '3381', verified: true },
    tags: ['Meditation', 'Breathwork', 'Silence'],
  },
  {
    id: 'hustle-lab',
    name: 'The Hustle Lab',
    emoji: '⚡',
    category: 'Career',
    tagline: 'Building in public · share blockers, get unstuck',
    viewers: 156,
    hot: false,
    color: '#fcd34d',
    bg: 'linear-gradient(135deg, #120e00 0%, #0d0900 100%)',
    host: { avatar: '🚀', code: '1190', verified: false },
    tags: ['Startup', 'Public Building', 'Career'],
  },
  {
    id: 'roleplay-theatre',
    name: 'Roleplay Theatre',
    emoji: '🎭',
    category: 'Creative',
    tagline: 'Anonymous improv — pick a character, stay in scene',
    viewers: 78,
    hot: false,
    color: '#c4b5fd',
    bg: 'linear-gradient(135deg, #0e0514 0%, #09030e 100%)',
    host: { avatar: '🎭', code: '6623', verified: true },
    tags: ['Improv', 'Anonymous', 'Creative'],
  },
  {
    id: 'shadow-talk',
    name: 'Shadow Talk',
    emoji: '🌘',
    category: 'Mental',
    tagline: 'Speaking what usually lives in the dark — safe space',
    viewers: 63,
    hot: false,
    color: '#86efac',
    bg: 'linear-gradient(135deg, #030d05 0%, #020908 100%)',
    host: { avatar: '🌿', code: '8834', verified: true },
    tags: ['Safe Space', 'Mental Health', 'Witnessed'],
  },
];

const CATEGORIES = ['All', 'Sports', 'Raw', 'Vibe', 'Philosophy', 'Physical', 'Spiritual', 'Career', 'Creative', 'Mental'];

// ─── Cricket Pavilion internals ──────────────────────────────────────────────

const MATCH = {
  team1: { name: 'MI', full: 'Mumbai Indians', color: '#1d4ed8', score: '187/4', overs: '18.2' },
  team2: { name: 'CSK', full: 'Chennai Super Kings', color: '#d97706', score: '142/3', overs: '16.0' },
  status: '2nd Innings · Need 46 off 22 balls',
};

const COMMENTARY = [
  { over: '18.2', ball: '🔴', text: 'Bumrah to Dhoni — OUT! Caught at mid-off. CSK need 46 off 22 now.', hot: true },
  { over: '18.1', ball: '⚫', text: 'Dot ball. Dhoni plays it cautiously to cover.', hot: false },
  { over: '17.6', ball: '🔵', text: 'SIX! Jadeja clears the long-on boundary. What a hit!', hot: true },
  { over: '17.5', ball: '⚫', text: 'Wide outside off stump. Jadeja leaves it.', hot: false },
  { over: '17.4', ball: '🟢', text: 'Four! Pushed through covers by Jadeja. Timing was perfect.', hot: false },
  { over: '17.3', ball: '⚫', text: 'Dot. Good length ball, Jadeja defends.', hot: false },
];

const POLLS = [
  { id: 1, question: 'Can CSK pull this off?', options: [{ label: 'Yes, Dhoni magic 🪄', votes: 212 }, { label: 'MI is too solid 🛡️', votes: 318 }], totalVotes: 530 },
  { id: 2, question: 'Player of the match so far?', options: [{ label: 'Bumrah 🔥', votes: 445 }, { label: 'Jadeja ⚡', votes: 287 }], totalVotes: 732 },
];

const ANALYST_FEED = [
  { avatar: '🦁', code: '2291', text: 'Bumrah in the death is literally unplayable. CSK need a miracle.', verified: true, likes: 34 },
  { avatar: '🌑', code: '9003', text: 'Dhoni bats at 8 for a reason. He is the reason.', verified: true, likes: 28 },
  { avatar: '⚡', code: '7712', text: "If Jadeja stays till 20th, it's still possible. 11 a ball is achievable.", verified: false, likes: 19 },
];

// ─── Generic chat seeds ───────────────────────────────────────────────────────

const CHAT_SEEDS: Record<string, { avatar: string; msg: string; color: string }[]> = {
  'midnight-confessions': [
    { avatar: '🌑', msg: "can't sleep. 3am thoughts are hitting different rn", color: '#818cf8' },
    { avatar: '🦊', msg: "same. something about this hour makes everything feel truer", color: '#f472b6' },
    { avatar: '🌙', msg: "still processing something that happened 4 years ago lol", color: '#60a5fa' },
  ],
  'frequency-room': [
    { avatar: '🎧', msg: "this track is doing something to my soul rn", color: '#f472b6' },
    { avatar: '🌿', msg: "anyone else feel weirdly okay right now", color: '#86efac' },
    { avatar: '⭐', msg: "found this room 20 mins ago. not leaving", color: '#fcd34d' },
  ],
  'deep-dive': [
    { avatar: '🌊', msg: "if free will is an illusion, does regret even make sense?", color: '#60a5fa' },
    { avatar: '🔮', msg: "the question assumes a 'you' that could have chosen differently", color: '#c4b5fd' },
    { avatar: '🦉', msg: "consciousness might just be the universe looking at itself", color: '#67e8f9' },
  ],
  'iron-hour': [
    { avatar: '🔥', msg: "rep 12 done. thighs are dead", color: '#fb923c' },
    { avatar: '💪', msg: "push through! 3 more sets", color: '#34d399' },
    { avatar: '⚡', msg: "this is the third time this week I've done this live", color: '#fcd34d' },
  ],
  'stillwater': [
    { avatar: '🌸', msg: "inhale… hold… release 🌬️", color: '#67e8f9' },
    { avatar: '🧘', msg: "chest opened up on that last exhale. wow", color: '#c4b5fd' },
    { avatar: '🌿', msg: "first time in weeks my mind went quiet for a full minute", color: '#86efac' },
  ],
  'hustle-lab': [
    { avatar: '🚀', msg: "stuck on a pricing model — anyone been here?", color: '#fcd34d' },
    { avatar: '⚡', msg: "go flat rate first. iterate after 10 customers", color: '#fb923c' },
    { avatar: '🎯', msg: "building a SaaS alone is a different kind of lonely", color: '#60a5fa' },
  ],
  'roleplay-theatre': [
    { avatar: '🎭', msg: "[Detective Blake enters, rain-soaked and silent]", color: '#c4b5fd' },
    { avatar: '🌑', msg: "[pours a drink, doesn't look up] We don't get visitors this late.", color: '#818cf8' },
    { avatar: '🎨', msg: "[steps into the light] I'm not here for a drink.", color: '#f472b6' },
  ],
  'shadow-talk': [
    { avatar: '🌿', msg: "holding space for everyone here tonight 💚", color: '#86efac' },
    { avatar: '🌊', msg: "said something out loud for the first time. thank you for this room", color: '#60a5fa' },
    { avatar: '🌸', msg: "you're not alone in this. not here.", color: '#c4b5fd' },
  ],
};

// ─── Go Live flow ─────────────────────────────────────────────────────────────

function GoLiveFlow({ onCancel,createStep,onCreateStep }: { onCancel: () => void;createStep?:'setup'|'preview'|'live';onCreateStep?:(step:'setup'|'preview'|'live')=>void }) {
  const [localStep, setLocalStep] = useState<'setup' | 'preview' | 'live'>('setup');
  const step=createStep||localStep;
  const setStep=(value:'setup'|'preview'|'live')=>onCreateStep?onCreateStep(value):setLocalStep(value);
  const [title, setTitle] = useFlowState('GoLiveFlow.title','');
  const [category, setCategory] = useFlowState('GoLiveFlow.category','');
  const [micOn, setMicOn] = useFlowState('GoLiveFlow.micOn',true);
  const [viewers, setViewers] = useState(0);

  useEffect(()=>{if(step!=='setup'&&(!title.trim()||!category))setStep('setup');},[step,title,category]);
  useEffect(() => {
    if (step !== 'live') return;
    const iv = setInterval(() => setViewers(v => v + Math.floor(Math.random() * 3)), 2000);
    return () => clearInterval(iv);
  }, [step]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#15141d' }}>
      <div className="flex items-center gap-3 px-4 pt-12 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <button onClick={onCancel} aria-label="Back to rooms" className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <ArrowLeft className="w-4 h-4 text-white/70" />
        </button>
        <h1 className="text-[18px] font-black text-white flex-1">{step === 'live' ? 'Your sample room' : 'Preview a room'}</h1>
        {step === 'live' && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.35)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            <span className="text-[11px] font-bold text-red-400">SAMPLE</span>
          </div>
        )}
      </div>

      <div className="flex-1 px-4 py-6 flex flex-col gap-5 overflow-y-auto">
        <AnimatePresence mode="wait">
          {step === 'setup' && (
            <motion.div key="setup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-5">
              <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="px-4 pt-3.5 text-[11px] font-bold uppercase tracking-widest text-white/40">Room title</p>
                <input aria-label="Room title" value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="What's the vibe tonight?"
                  className="w-full bg-transparent px-4 pt-2 pb-3.5 text-[15px] text-white placeholder:text-white/25 outline-none" />
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest mb-3 text-white/40">Category</p>
                <div className="flex flex-wrap gap-2">
                  {['Raw', 'Spiritual', 'Mental', 'Physical', 'Career', 'Creative', 'Philosophy', 'Sports', 'Vibe'].map(cat => (
                    <button key={cat} onClick={() => setCategory(cat)}
                      className="px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all"
                      style={{
                        background: category === cat ? '#818cf8' : 'rgba(255,255,255,0.06)',
                        color: category === cat ? '#fff' : 'rgba(255,255,255,0.5)',
                        border: `1px solid ${category === cat ? '#818cf8' : 'rgba(255,255,255,0.1)'}`,
                      }}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button onClick={() => setMicOn(!micOn)}
                  className="flex-1 rounded-2xl py-3 flex items-center justify-center gap-2 font-bold text-[13px]"
                  style={{ background: micOn ? 'rgba(134,239,172,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${micOn ? '#86efac44' : '#ef444444'}`, color: micOn ? '#86efac' : '#ef4444' }}>
                  {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  {micOn ? 'Mic On' : 'Mic Off'}
                </button>
                <div className="flex-1 rounded-2xl py-3 flex items-center justify-center gap-2 font-bold text-[13px]" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                  <Shield className="w-4 h-4" />
                  Anon
                </div>
              </div>

              <motion.button whileTap={{ scale: 0.96 }} onClick={() => setStep('preview')}
                disabled={!title.trim() || !category}
                className="w-full rounded-2xl py-4 font-black text-[15px]"
                style={{ background: title && category ? 'linear-gradient(135deg, #ef4444, #ec4899)' : 'rgba(255,255,255,0.07)', color: title && category ? '#fff' : 'rgba(255,255,255,0.25)' }}>
                Preview Room →
              </motion.button>
            </motion.div>
          )}

          {step === 'preview' && (
            <motion.div key="preview" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-5">
              <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <div className="p-4">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-2">Room preview</p>
                  <p className="text-[18px] font-black text-white">{title}</p>
                  <p className="text-[12px] text-white/40 mt-0.5">{category} · Hosted by You_Anonymous</p>
                </div>
                <div className="px-4 pb-4 flex flex-wrap gap-2">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>🎙 Anonymous Voice</span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(129,140,248,0.15)', color: '#a5b4fc' }}>🔒 Prototype controls</span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(134,239,172,0.15)', color: '#86efac' }}>🛡 Moderation preview</span>
                </div>
              </div>

              <p className="text-[12px] text-white/40 text-center leading-relaxed">Audio, voice protection, and moderation are simulated. No broadcast is connected.</p>

              <motion.button whileTap={{ scale: 0.96 }} onClick={() => setStep('live')}
                className="w-full rounded-2xl py-4 font-black text-[15px] flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #ef4444, #ec4899)' }}>
                <Radio className="w-5 h-5" />
                Start sample room
              </motion.button>
              <button onClick={() => setStep('setup')} className="text-center text-[12px] text-white/30 underline">← Edit details</button>
            </motion.div>
          )}

          {step === 'live' && (
            <motion.div key="live" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-5">
              <div className="flex items-center justify-center py-4">
                <div className="relative">
                  <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.1, 0.4] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 rounded-full" style={{ background: '#ef4444', margin: -16 }} />
                  <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl relative z-10" style={{ background: 'rgba(239,68,68,0.15)', border: '2px solid rgba(239,68,68,0.4)' }}>🎙</div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-[20px] font-black text-white">{title}</p>
                <p className="text-[12px] text-white/40 mt-0.5">{category}</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: <Eye className="w-4 h-4" />, value: String(viewers), label: 'Viewers', color: '#60a5fa' },
                  { icon: <Heart className="w-4 h-4" />, value: String(viewers * 2 + 3), label: 'Reactions', color: '#f472b6' },
                  { icon: <Gift className="w-4 h-4" />, value: String(Math.floor(viewers * 0.3)), label: 'Gifts', color: '#fbbf24' },
                ].map(s => (
                  <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: `${s.color}10`, border: `1px solid ${s.color}25` }}>
                    <div style={{ color: s.color }}>{s.icon}</div>
                    <p className="text-[16px] font-black text-white mt-1">{s.value}</p>
                    <p className="text-[9px] text-white/40 uppercase tracking-wider">{s.label}</p>
                  </div>
                ))}
              </div>

              <motion.button whileTap={{ scale: 0.96 }} onClick={onCancel} aria-label="Back to rooms"
                className="w-full rounded-2xl py-3.5 font-bold text-[14px]"
                style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
                End Room
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Cricket Pavilion viewer ──────────────────────────────────────────────────

function CricketPavilionViewer({ room, onBack }: { room: Room; onBack: () => void }) {
  const [messages, setMessages] = useFlowState<{ avatar: string; code: string; text: string; verified: boolean }[]>('CricketPavilionViewer.messages',[
    { avatar: '🦁', code: '2291', text: 'Bumrah in the death is literally a cheat code', verified: true },
    { avatar: '🌑', code: '9003', text: 'Dhoni will chase this down. I believe.', verified: true },
    { avatar: '⚡', code: '7712', text: 'Need 46 off 22 — it\'s done. MI wins.', verified: false },
    { avatar: '🔮', code: '4412', text: 'The pitch is getting slower. Spinners will reign now.', verified: true },
  ]);
  const [input, setInput] = useFlowState('CricketPavilionViewer.input','');
  const [votedPolls, setVotedPolls] = useFlowState<Record<number, number>>('CricketPavilionViewer.votedPolls',{});
  const [likeCount, setLikeCount] = useFlowState('CricketPavilionViewer.likeCount',room.viewers * 3);
  const [liked, setLiked] = useFlowState('CricketPavilionViewer.liked',false);
  const [viewers, setViewers] = useState(room.viewers);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const iv = setInterval(() => {
      setViewers(v => v + Math.floor(Math.random() * 2));
      const pool = [
        { avatar: '🌙', code: '8821', text: 'this is mad tense', verified: false },
        { avatar: '🎯', code: '5510', text: "MI's fielding today has been class", verified: false },
        { avatar: '🦊', code: '3312', text: 'Jadeja can still pull this off wtf', verified: true },
      ];
      setMessages(m => [...m.slice(-8), pool[Math.floor(Math.random() * pool.length)]]);
    }, 3500);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const sendMsg = () => {
    if (!input.trim()) return;
    setMessages(m => [...m.slice(-8), { avatar: '🫵', code: '0000', text: input, verified: false }]);
    setInput('');
  };

  const voteOnPoll = (pollId: number, optIdx: number) => {
    if (votedPolls[pollId] !== undefined) return;
    setVotedPolls(prev => ({ ...prev, [pollId]: optIdx }));
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #030e08 0%, #020908 100%)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-3.5" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }}>
        <button onClick={onBack} aria-label="Back" className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <ArrowLeft className="w-4 h-4 text-white/70" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base">🏏</span>
            <p className="text-[16px] font-black text-white truncate">Cricket Pavilion</p>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              <span className="text-[10px] font-bold text-red-400">SAMPLE</span>
            </div>
          </div>
          <p className="text-[10px] text-white/40 mt-0.5">Sample T20 match · {viewers} simulated viewers</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button aria-label={liked ? 'Unlike sample room' : 'Like sample room'} aria-pressed={liked} onClick={() => { setLiked(!liked); setLikeCount(n => liked ? n - 1 : n + 1); }}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: liked ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.07)' }}>
            <Heart className="w-4 h-4" style={{ color: liked ? '#ef4444' : 'rgba(255,255,255,0.5)', fill: liked ? '#ef4444' : 'none' }} />
          </button>
          <Share2 className="w-4 h-4 text-white/40" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-32">
        {/* Scoreboard */}
        <div className="mx-4 my-3 rounded-2xl overflow-hidden" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(52,211,153,0.2)' }}>
          <div className="px-3 py-2 flex items-center justify-between" style={{ background: 'rgba(52,211,153,0.07)' }}>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#34d399' }}>Live Score · T20</span>
            <span className="text-[10px] text-white/40">{MATCH.status}</span>
          </div>
          <div className="p-4 flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black" style={{ background: MATCH.team1.color }}>
                  {MATCH.team1.name}
                </div>
                <p className="text-[18px] font-black text-white">{MATCH.team1.score}</p>
                <p className="text-[11px] text-white/40">({MATCH.team1.overs} ov)</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black" style={{ background: MATCH.team2.color }}>
                  {MATCH.team2.name}
                </div>
                <p className="text-[18px] font-black text-white">{MATCH.team2.score}</p>
                <p className="text-[11px] text-white/40">({MATCH.team2.overs} ov)</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-white/40 leading-snug">Target</p>
              <p className="text-[22px] font-black" style={{ color: '#34d399' }}>188</p>
              <p className="text-[10px] text-white/30">RRR 12.54</p>
            </div>
          </div>
        </div>

        {/* Commentary */}
        <div className="mx-4 mb-3">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5 text-white/30 px-1">Live Commentary</p>
          <div className="flex flex-col gap-2">
            {COMMENTARY.map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="flex items-start gap-2.5 rounded-xl px-3 py-2.5"
                style={{ background: c.hot ? 'rgba(239,68,68,0.07)' : 'rgba(255,255,255,0.03)', border: `1px solid ${c.hot ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)'}` }}>
                <span className="text-base flex-shrink-0">{c.ball}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-white/40 mr-2">{c.over}</span>
                  <span className="text-[12px] text-white/75 leading-snug">{c.text}</span>
                </div>
                {c.hot && <Flame className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#ef4444' }} />}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Polls */}
        <div className="mx-4 mb-3">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5 text-white/30 px-1">Live Polls</p>
          <div className="flex flex-col gap-3">
            {POLLS.map(poll => (
              <div key={poll.id} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-[13px] font-bold text-white mb-3">{poll.question}</p>
                <div className="flex flex-col gap-2">
                  {poll.options.map((opt, oi) => {
                    const pct = Math.round((opt.votes / poll.totalVotes) * 100);
                    const isVoted = votedPolls[poll.id] === oi;
                    const hasVoted = votedPolls[poll.id] !== undefined;
                    return (
                      <button key={oi} onClick={() => voteOnPoll(poll.id, oi)}
                        className="relative rounded-xl overflow-hidden px-3 py-2.5 text-left"
                        style={{ background: isVoted ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${isVoted ? '#34d39940' : 'rgba(255,255,255,0.08)'}` }}>
                        {hasVoted && (
                          <div className="absolute inset-0 rounded-xl" style={{ width: `${pct}%`, background: isVoted ? 'rgba(52,211,153,0.1)' : 'rgba(255,255,255,0.03)', transition: 'width 0.5s ease' }} />
                        )}
                        <div className="relative flex items-center justify-between">
                          <span className="text-[12px] font-medium text-white/80">{opt.label}</span>
                          {hasVoted && <span className="text-[11px] font-bold" style={{ color: isVoted ? '#34d399' : 'rgba(255,255,255,0.4)' }}>{pct}%</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-white/30 mt-2">{poll.totalVotes.toLocaleString()} votes</p>
              </div>
            ))}
          </div>
        </div>

        {/* Analyst feed */}
        <div className="mx-4 mb-3">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5 text-white/30 px-1">Top Analyst Takes</p>
          {ANALYST_FEED.map((a, i) => (
            <div key={i} className="flex items-start gap-2.5 rounded-xl px-3 py-2.5 mb-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="text-lg flex-shrink-0">{a.avatar}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="text-[10px] font-bold text-white/50">#{a.code}</span>
                  {a.verified && <span className="text-[8px] px-1 rounded" style={{ background: 'rgba(79,70,229,0.2)', color: '#818cf8' }}>✓</span>}
                </div>
                <p className="text-[12px] text-white/75 leading-snug">{a.text}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Heart className="w-3 h-3 text-white/30" />
                <span className="text-[10px] text-white/30">{a.likes}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky chat input */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3" style={{ background: 'linear-gradient(0deg, rgba(3,14,8,1) 60%, transparent 100%)' }}>
        {/* Last few messages */}
        <div ref={chatRef} className="flex flex-col gap-1.5 mb-2.5 max-h-28 overflow-y-auto">
          {messages.slice(-3).map((m, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-sm flex-shrink-0">{m.avatar}</span>
              <div className="rounded-xl px-2.5 py-1.5 min-w-0" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
                <span className="text-[10px] font-bold text-white/40">#{m.code}: </span>
                <span className="text-[11px] text-white/70">{m.text}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMsg()}
            placeholder="Your take… (anonymous)"
            className="flex-1 rounded-full px-4 py-2.5 text-[13px] text-white/80 placeholder:text-white/25 outline-none"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }} />
          <button onClick={sendMsg} className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#34d399' }}>
            <Send className="w-4 h-4 text-black" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Generic Room Viewer ──────────────────────────────────────────────────────

function GenericRoomViewer({ room, onBack }: { room: Room; onBack: () => void }) {
  const seedMsgs = CHAT_SEEDS[room.id] ?? [{ avatar: '🌑', msg: 'Welcome to the room', color: room.color }];
  const [messages, setMessages] = useFlowState('GenericRoomViewer.messages',seedMsgs.map(s => ({ avatar: s.avatar, text: s.msg })));
  const [input, setInput] = useFlowState('GenericRoomViewer.input','');
  const [liked, setLiked] = useFlowState('GenericRoomViewer.liked',false);
  const [likeCount, setLikeCount] = useFlowState('GenericRoomViewer.likeCount',room.viewers * 3);
  const [viewers, setViewers] = useState(room.viewers);
  const [gifted, setGifted] = useFlowState('GenericRoomViewer.gifted',false);
  const [reactions, setReactions] = useState<{ emoji: string; id: number }[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef(0);

  useEffect(() => {
    const iv = setInterval(() => {
      setViewers(v => v + Math.floor(Math.random() * 3));
      const seed = seedMsgs[Math.floor(Math.random() * seedMsgs.length)];
      setMessages(m => [...m.slice(-10), { avatar: seed.avatar, text: seed.msg }]);
    }, 4000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const sendMsg = () => {
    if (!input.trim()) return;
    setMessages(m => [...m.slice(-10), { avatar: '🫵', text: input }]);
    setInput('');
  };

  const addReaction = (emoji: string) => {
    const id = counterRef.current++;
    setReactions(r => [...r, { emoji, id }]);
    setTimeout(() => setReactions(r => r.filter(x => x.id !== id)), 2000);
  };

  // Room-specific content
  const RoomContent = () => {
    if (room.id === 'iron-hour') return (
      <div className="mx-4 mb-4 rounded-2xl p-4" style={{ background: `${room.color}08`, border: `1px solid ${room.color}20` }}>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: room.color }}>Current Exercise</p>
        <p className="text-[22px] font-black text-white mb-1">Push-Ups · Set 3/5</p>
        <p className="text-[13px] text-white/60">Rep at your own pace · rest 60s between sets</p>
        <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <div className="h-full rounded-full" style={{ width: '60%', background: room.color }} />
        </div>
        <p className="text-[10px] text-white/35 mt-1.5">60% through the session</p>
      </div>
    );
    if (room.id === 'stillwater') return (
      <div className="mx-4 mb-4 flex flex-col items-center gap-3 py-4">
        <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="w-28 h-28 rounded-full flex items-center justify-center"
          style={{ background: `radial-gradient(circle, ${room.color}30, ${room.color}08)`, border: `1px solid ${room.color}30` }}>
          <span className="text-4xl">🌸</span>
        </motion.div>
        <p className="text-[15px] font-bold text-white/80">Inhale · 4 counts</p>
        <p className="text-[11px] text-white/35">Guided breathwork in progress</p>
      </div>
    );
    if (room.id === 'deep-dive') return (
      <div className="mx-4 mb-4 rounded-2xl p-4" style={{ background: `${room.color}08`, border: `1px solid ${room.color}20` }}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: room.color }}>Tonight's Question</p>
        <p className="text-[16px] font-black text-white leading-snug">"If you erased one memory, who would you become?"</p>
        <p className="text-[11px] text-white/40 mt-2">243 responses so far</p>
      </div>
    );
    if (room.id === 'roleplay-theatre') return (
      <div className="mx-4 mb-4 rounded-2xl p-4" style={{ background: `${room.color}08`, border: `1px solid ${room.color}20` }}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: room.color }}>Active Scene</p>
        <p className="text-[14px] font-black text-white">"The Last Train"</p>
        <p className="text-[12px] text-white/50 mt-1">Two strangers. 4am. One suitcase between them.</p>
        <div className="mt-3 flex gap-2 flex-wrap">
          {['Detective Blake', 'The Stranger', 'The Conductor'].map(r => (
            <span key={r} className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: `${room.color}15`, color: room.color, border: `1px solid ${room.color}25` }}>{r}</span>
          ))}
        </div>
      </div>
    );
    if (room.id === 'hustle-lab') return (
      <div className="mx-4 mb-4 rounded-2xl p-4" style={{ background: `${room.color}08`, border: `1px solid ${room.color}20` }}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: room.color }}>Blocker Board</p>
        {['Pricing model unclear', 'Need first 10 users', 'Auth is a mess rn'].map((b, i) => (
          <div key={i} className="flex items-center gap-2 py-1.5" style={{ borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
            <span className="text-[11px] text-white/60">{b}</span>
            <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24' }}>Unresolved</span>
          </div>
        ))}
      </div>
    );
    // Default: ambient visual for midnight-confessions, frequency-room, shadow-talk
    return (
      <div className="mx-4 mb-4 flex flex-col items-center gap-2 py-4">
        <motion.div animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 3, repeat: Infinity }}
          className="text-[72px]">{room.emoji}</motion.div>
        <p className="text-[13px] font-bold text-white/60 text-center px-6 leading-snug">{room.tagline}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: room.bg }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-3.5" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)' }}>
        <button onClick={onBack} aria-label="Back" className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <ArrowLeft className="w-4 h-4 text-white/70" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base">{room.emoji}</span>
            <p className="text-[16px] font-black text-white truncate">{room.name}</p>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              <span className="text-[10px] font-bold text-red-400">SAMPLE</span>
            </div>
          </div>
          <p className="text-[10px] text-white/40 mt-0.5">{room.category} · {viewers} simulated viewers</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button aria-label={liked ? 'Unlike sample room' : 'Like sample room'} aria-pressed={liked} onClick={() => { setLiked(!liked); setLikeCount(n => liked ? n - 1 : n + 1); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
            style={{ background: liked ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.07)' }}>
            <Heart className="w-3.5 h-3.5" style={{ color: liked ? '#ef4444' : 'rgba(255,255,255,0.5)', fill: liked ? '#ef4444' : 'none' }} />
            <span className="text-[11px] font-bold" style={{ color: liked ? '#ef4444' : 'rgba(255,255,255,0.4)' }}>{likeCount}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-36">
        {/* Room-specific content */}
        <RoomContent />

        {/* Reactions floating */}
        <div className="relative mx-4 mb-3 h-8 overflow-hidden">
          <AnimatePresence>
            {reactions.map(r => (
              <motion.span key={r.id} initial={{ opacity: 1, y: 0, x: Math.random() * 280 }} animate={{ opacity: 0, y: -40 }} exit={{ opacity: 0 }} transition={{ duration: 2 }}
                className="absolute text-xl">{r.emoji}</motion.span>
            ))}
          </AnimatePresence>
        </div>

        {/* Chat */}
        <div ref={chatRef} className="mx-4 flex flex-col gap-2 max-h-60 overflow-y-auto">
          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5">
              <span className="text-sm flex-shrink-0">{m.avatar}</span>
              <div className="rounded-xl px-3 py-2 min-w-0" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
                <p className="text-[12px] text-white/75 leading-snug">{m.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3" style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.95) 60%, transparent 100%)' }}>
        {/* Reaction strip */}
        <div className="flex items-center gap-3 mb-3 justify-center">
          {['❤️', '🔥', '🤯', '💯', '👏', '🥺'].map(e => (
            <motion.button key={e} whileTap={{ scale: 1.3 }} onClick={() => addReaction(e)} className="text-xl">{e}</motion.button>
          ))}
          <motion.button whileTap={{ scale: 0.94 }} onClick={() => setGifted(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full ml-2"
            style={{ background: gifted ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.08)', border: `1px solid ${gifted ? 'rgba(251,191,36,0.4)' : 'rgba(255,255,255,0.1)'}` }}>
            <Gift className="w-3.5 h-3.5" style={{ color: gifted ? '#fbbf24' : 'rgba(255,255,255,0.5)' }} />
            <span className="text-[11px] font-bold" style={{ color: gifted ? '#fbbf24' : 'rgba(255,255,255,0.4)' }}>Gift</span>
          </motion.button>
        </div>
        {/* Input */}
        <div className="flex items-center gap-2">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMsg()}
            placeholder="Say something… (anonymous)"
            className="flex-1 rounded-full px-4 py-2.5 text-[13px] text-white/80 placeholder:text-white/25 outline-none"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }} />
          <button onClick={sendMsg} className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: room.color }}>
            <Send className="w-4 h-4" style={{ color: '#15141d' }} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Shared mobile landing; existing room interactions remain available.
interface LiveStreamingProps { onBack: () => void;roomId?:string;createStep?:'setup'|'preview'|'live';onSelectRoom?:(id:string)=>void;onCreateStep?:(step:'setup'|'preview'|'live')=>void;onCloseCreation?:()=>void; }
export function LiveStreaming({ onBack,roomId,createStep,onSelectRoom,onCreateStep,onCloseCreation }: LiveStreamingProps) {
  const [category,setCategory]=useFlowState('LiveStreaming.category','All');
  const [localRoom,setLocalRoom]=useState<Room|null>(null);
  const selectedRoom=onSelectRoom?ROOMS.find(room=>room.id===roomId)||null:localRoom;
  const setSelectedRoom=(room:Room|null)=>{if(onSelectRoom){if(room)onSelectRoom(room.id);else onBack();}else setLocalRoom(room);};
  const [localGoingLive,setLocalGoingLive]=useState(false);
  const goingLive=!!createStep||localGoingLive;
  const setGoingLive=(value:boolean)=>{if(onCreateStep){if(value)onCreateStep('setup');else (onCloseCreation||onBack)();}else setLocalGoingLive(value);};
  if (goingLive) return <GoLiveFlow createStep={createStep} onCreateStep={onCreateStep} onCancel={()=>setGoingLive(false)}/>;
  if (selectedRoom?.id==='cricket-pavilion') return <CricketPavilionViewer room={selectedRoom} onBack={()=>setSelectedRoom(null)}/>;
  if (selectedRoom) return <GenericRoomViewer room={selectedRoom} onBack={()=>setSelectedRoom(null)}/>;
  const featured=ROOMS[0];const showFeatured=category==='All'||category==='Sports';
  const filtered=ROOMS.filter(r=>r.id!==featured.id&&(category==='All'||r.category===category));
  const viewers=ROOMS.reduce((sum,r)=>sum+r.viewers,0);const trending=ROOMS.filter(r=>r.hot).length;
  return <div className="mobile-page mobile-live live-discovery">
    <header className="live-discovery-header"><button className="mobile-icon-button" onClick={onBack} aria-label="Back to app home"><ArrowLeft size={21}/></button><div><div className="live-title-row"><h1 tabIndex={-1}>Live Rooms</h1><span className="live-header-count">{ROOMS.length} ROOMS</span></div><p>Sample rooms · Audio & video simulated</p></div><button className="live-create-button" onClick={()=>setGoingLive(true)}><Radio size={18}/>Go Live</button></header>
    <div className="live-stat-grid" aria-label="Sample room statistics">{[{icon:Radio,value:ROOMS.length,label:'Rooms',tone:'coral'},{icon:Eye,value:viewers.toLocaleString(),label:'Watching',tone:'blue'},{icon:Flame,value:trending,label:'Trending',tone:'amber'},{icon:Trophy,value:featured.viewers,label:'Cricket',tone:'lime'}].map(({icon:Icon,value,label,tone})=><div key={label} style={accentStyle(tone)}><Icon size={20}/><strong>{value}</strong><span>{label}</span></div>)}</div>
    {showFeatured&&<section className="live-featured-section"><div className="live-section-caption"><Sparkles size={15}/><h2>Featured room</h2><span>SAMPLE</span></div><button className="live-featured-room" onClick={()=>setSelectedRoom(featured)} aria-label="Open Cricket Pavilion sample room"><span className="live-featured-title"><span className="live-room-avatar">{featured.emoji}</span><span><strong>Cricket Pavilion</strong><small>A match, a few takes, a shared moment.</small></span><span className="live-room-badge"><Radio size={12}/>SAMPLE</span></span><span className="live-scoreboard"><span className="live-scoreboard-teams"><span><b>{MATCH.team1.name}</b><strong>{MATCH.team1.score}</strong></span><small>vs</small><span><strong>{MATCH.team2.score}</strong><b>{MATCH.team2.name}</b></span></span><span className="live-match-caption">{MATCH.status}</span></span><span className="live-featured-footer"><span><Eye size={16}/>{featured.viewers} sample viewers</span><span className="live-room-tags"><span>Cricket</span><span>Match chat</span></span></span></button></section>}
    <section className="live-rooms-section"><div className="mobile-chips live-category-filters" aria-label="Room categories">{CATEGORIES.map(c=><button key={c} style={accentStyle(visualFor(c).tone)} aria-pressed={c===category} onClick={()=>setCategory(c)}>{c}</button>)}</div><div className="live-section-caption"><Radio size={15}/><h2>{category==='All'?'All rooms':`${category} rooms`}</h2><span>{filtered.length+(showFeatured?1:0)} AVAILABLE</span></div><div className="live-room-list">{filtered.map(r=><button className="live-list-room" style={accentStyle(visualFor(r.category).tone)} key={r.id} onClick={()=>setSelectedRoom(r)}><span className="live-list-room-main"><span className="live-room-avatar">{r.emoji}</span><span className="live-room-copy"><span className="live-room-name"><h3>{r.name}</h3>{r.hot&&<span className="live-hot-badge"><Flame size={12}/>Hot</span>}</span><p>{r.tagline}</p></span><span className="live-room-count"><small>SAMPLE</small><span><Eye size={15}/>{r.viewers}</span></span></span><span className="live-room-tags">{r.tags.map(tag=><span key={tag}>{tag}</span>)}</span></button>)}</div>{filtered.length===0&&!showFeatured&&<div className="mobile-empty"><strong>No sample rooms in this category.</strong><button className="mobile-secondary-button" onClick={()=>setCategory('All')}>View all rooms</button></div>}{category==='Sports'&&<p className="live-empty-note">Cricket Pavilion is featured above.</p>}</section>
    <p className="live-demo-note">All rooms, counts, and match scores are sample content. Go Live previews a room without broadcasting.</p>
  </div>;
}
