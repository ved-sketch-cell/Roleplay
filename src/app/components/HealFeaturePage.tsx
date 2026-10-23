import {completeActivity} from '../mobile/state';
import {useFlowState} from '../mobile/FlowState';
import { useState, useEffect, useRef } from 'react';
import { FeatureHeading } from '../mobile/MobileUI';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Flame, Wind, Heart, Sparkles, Shield, Waves, Activity, ChevronRight, Send, Check, ThumbsUp, Volume2, VolumeX } from 'lucide-react';

// ─── Shared sub-components ───────────────────────────────────────────────────

interface HeaderProps {
  title: string;
  track: string;
  trackColor: string;
  xp: number;
  onBack: () => void;
}
function Header({ title, track, xp, onBack }: {
  title:string; track:string; trackColor:string; xp:number; onBack:()=>void;
}) { return <FeatureHeading title={title} track={track} xp={xp} onBack={onBack}/>; }

function StatPill({ icon, value, label, color }: { icon: React.ReactNode; value: string; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl px-3 py-2.5" style={{ background: `${color}0d`, border: `1px solid ${color}22` }}>
      <div style={{ color }}>{icon}</div>
      <span className="text-[13px] font-black text-white">{value}</span>
      <span className="text-[9px] text-white/40 font-medium uppercase tracking-wider text-center leading-tight">{label}</span>
    </div>
  );
}

function ActionBtn({ label, onClick, color, icon, secondary = false }: { label: string; onClick: () => void; color: string; icon?: React.ReactNode; secondary?: boolean }) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className="w-full rounded-2xl py-3.5 flex items-center justify-center gap-2 font-bold text-[14px]"
      style={secondary
        ? { background: `${color}12`, border: `1px solid ${color}30`, color }
        : { background: color, color: '#15141d' }
      }>
      {icon}
      {label}
    </motion.button>
  );
}

// ─── 1. Lantern Garden ──────────────────────────────────────────────────────

const COMMUNITY_LANTERNS = [
  { id: 1, text: "The fear that I'm not enough for the people I love.", flames: 24, mine: false },
  { id: 2, text: "Three years of carrying my family's silence.", flames: 31, mine: false },
  { id: 3, text: "The grief that never found a proper ceremony.", flames: 18, mine: false },
  { id: 4, text: "All the things I said when I was scared instead of sad.", flames: 42, mine: false },
  { id: 5, text: "The version of me that didn't make it through 2021.", flames: 67, mine: true },
];

function LanternGarden({ onBack }: { onBack: () => void }) {
  const COLOR = '#67e8f9';
  const [text, setText] = useFlowState('LanternGarden.text','');
  const [released, setReleased] = useFlowState('LanternGarden.released',false);
  const [flamedIds, setFlamedIds] = useFlowState<Set<number>>('LanternGarden.flamedIds',new Set());
  const [floatY, setFloatY] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setFloatY(y => y === 0 ? -6 : 0), 1800);
    return () => clearInterval(iv);
  }, []);

  const handleRelease = () => {
    if (text.trim().length < 5) return;
    setReleased(true);completeActivity('lantern-garden','Lantern reflection',20);
  };

  const toggleFlame = (id: number) => {
    setFlamedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #040d12 0%, #030809 100%)' }}>
      <Header title="Lantern Garden" track="Async Processing" trackColor={COLOR} xp={30} onBack={onBack} />

      <div className="flex-1 px-4 pb-8 flex flex-col gap-5 overflow-y-auto">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2.5 mt-1">
          <StatPill icon={<Flame className="w-3.5 h-3.5" />} value="5" label="Your Lanterns" color={COLOR} />
          <StatPill icon={<Heart className="w-3.5 h-3.5" />} value="182" label="Flames Given" color={COLOR} />
          <StatPill icon={<Sparkles className="w-3.5 h-3.5" />} value="67" label="Flames Received" color={COLOR} />
        </div>

        {/* Write a lantern */}
        {!released ? (
          <div className="rounded-2xl overflow-hidden" style={{ background: `${COLOR}08`, border: `1px solid ${COLOR}20` }}>
            <div className="p-4 pb-0 flex items-center gap-2">
              <span className="text-2xl">🏮</span>
              <div>
                <p className="text-[13px] font-bold text-white/90">Release a Burden</p>
                <p className="text-[10px] text-white/40">Device-only reflection · sample community below</p>
              </div>
            </div>
            <textarea
              value={text}
              onChange={e => setText(e.target.value.slice(0, 180))}
              placeholder="Write what you're carrying tonight…"
              rows={4}
              className="w-full bg-transparent px-4 pt-3 pb-2 text-[13px] text-white/80 placeholder:text-white/25 resize-none outline-none leading-relaxed"
            />
            <div className="px-4 pb-4 flex items-center justify-between">
              <span className="text-[10px] text-white/30 font-mono">{text.length}/180</span>
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={handleRelease}
                className="px-4 py-2 rounded-xl text-[12px] font-bold flex items-center gap-1.5"
                style={{
                  background: text.length >= 5 ? COLOR : 'rgba(255,255,255,0.06)',
                  color: text.length >= 5 ? '#040d12' : 'rgba(255,255,255,0.25)'
                }}>
                <Flame className="w-3.5 h-3.5" />
                Release
              </motion.button>
            </div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-4 flex items-center gap-3" style={{ background: `${COLOR}10`, border: `1px solid ${COLOR}30` }}>
            <motion.span animate={{ y: floatY }} transition={{ duration: 1.8, ease: 'easeInOut' }} className="text-3xl">🏮</motion.span>
            <div>
              <p className="text-[12px] font-bold" style={{ color: COLOR }}>Your lantern is floating</p>
              <p className="text-[10px] text-white/50 mt-0.5 leading-snug">Saved on your device. No message is sent to the community.</p>
            </div>
            <button onClick={() => { setReleased(false); setText(''); }} className="ml-auto text-[10px] text-white/30 underline">release another</button>
          </motion.div>
        )}

        {/* Community garden */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-3 px-1" style={{ color: 'rgba(255,255,255,0.3)' }}>The Garden — 247 lanterns floating</p>
          <div className="flex flex-col gap-3">
            {COMMUNITY_LANTERNS.map((lantern, i) => (
              <motion.div key={lantern.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="rounded-xl p-3.5 flex items-start gap-3"
                style={{ background: lantern.mine ? `${COLOR}10` : 'rgba(255,255,255,0.03)', border: `1px solid ${lantern.mine ? COLOR + '30' : 'rgba(255,255,255,0.06)'}` }}>
                <motion.span animate={{ y: floatY + (i % 2 === 0 ? 0 : 3) }} transition={{ duration: 2.1 + i * 0.2, ease: 'easeInOut' }} className="text-xl flex-shrink-0">🏮</motion.span>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-white/70 leading-relaxed italic">"{lantern.text}"</p>
                  {lantern.mine && <p className="text-[9px] font-bold mt-1" style={{ color: COLOR }}>Your lantern</p>}
                </div>
                <button onClick={() => toggleFlame(lantern.id)} className="flex flex-col items-center gap-0.5 flex-shrink-0">
                  <motion.span whileTap={{ scale: 1.4 }} className="text-base">{flamedIds.has(lantern.id) ? '🔥' : '🕯️'}</motion.span>
                  <span className="text-[9px] font-bold" style={{ color: flamedIds.has(lantern.id) ? '#fbbf24' : 'rgba(255,255,255,0.3)' }}>
                    {lantern.flames + (flamedIds.has(lantern.id) ? 1 : 0)}
                  </span>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 2. Reframing Loom ──────────────────────────────────────────────────────

const EXAMPLE_REFRAMES = [
  { id: 1, thought: "I always mess things up no matter how hard I try.", reframe: "I notice I'm being very hard on myself. Even when outcomes don't go as planned, effort still builds skill and resilience.", votes: 34, author: 'Butterfly_🌙' },
  { id: 2, thought: "Nobody would notice if I just disappeared.", reframe: "This feeling is telling me I'm craving connection. The impulse itself proves I want to be seen — that longing is worth honoring.", votes: 52, author: 'DeepRoots_🌿' },
  { id: 3, thought: "I'm running out of time to become who I was supposed to be.", reframe: "There's no fixed schedule for becoming. Every moment you're still here, you're still becoming. That's not being late — it's being alive.", votes: 89, author: 'NightTide_🌊' },
];

function ReframingLoom({ onBack }: { onBack: () => void }) {
  const COLOR = '#67e8f9';
  const [thought, setThought] = useFlowState('ReframingLoom.thought','');
  const [submitted, setSubmitted] = useFlowState('ReframingLoom.submitted',false);
  const [reframeText, setReframeText] = useFlowState('ReframingLoom.reframeText','');
  const [votedIds, setVotedIds] = useFlowState<Set<number>>('ReframingLoom.votedIds',new Set());
  const [myReframePosted, setMyReframePosted] = useFlowState('ReframingLoom.myReframePosted',false);
  const [activeTab, setActiveTab] = useFlowState<'submit' | 'reframe'>('ReframingLoom.activeTab','submit');

  const toggleVote = (id: number) => {
    setVotedIds(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #040d12 0%, #030809 100%)' }}>
      <Header title="Reframing Loom" track="Async Processing" trackColor={COLOR} xp={40} onBack={onBack} />

      <div className="flex-1 px-4 pb-8 flex flex-col gap-5 overflow-y-auto">
        <div className="grid grid-cols-3 gap-2.5 mt-1">
          <StatPill icon={<Activity className="w-3.5 h-3.5" />} value="4" label="Submitted" color={COLOR} />
          <StatPill icon={<ThumbsUp className="w-3.5 h-3.5" />} value="23" label="Votes Given" color={COLOR} />
          <StatPill icon={<Sparkles className="w-3.5 h-3.5" />} value="116" label="Vote Score" color={COLOR} />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.04)' }}>
          {(['submit', 'reframe'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 rounded-lg text-[12px] font-bold capitalize transition-all"
              style={{
                background: activeTab === tab ? `${COLOR}20` : 'transparent',
                color: activeTab === tab ? COLOR : 'rgba(255,255,255,0.4)',
                border: activeTab === tab ? `1px solid ${COLOR}30` : '1px solid transparent'
              }}>
              {tab === 'submit' ? '🧵 Submit Thought' : '🪡 Weave a Reframe'}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'submit' ? (
            <motion.div key="submit" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="flex flex-col gap-4">
              {/* Loom visual */}
              <div className="rounded-2xl p-4 flex flex-col items-center gap-3" style={{ background: `${COLOR}06`, border: `1px solid ${COLOR}15` }}>
                <div className="relative w-full h-14 flex items-center justify-center">
                  {[...Array(7)].map((_, i) => (
                    <div key={i} className="absolute top-0 bottom-0 w-px rounded-full" style={{ left: `${(i + 1) * 12.5}%`, background: `${COLOR}${submitted ? '40' : '18'}`, transition: 'background 0.6s ease' }} />
                  ))}
                  <motion.div animate={{ x: submitted ? 100 : 0 }} transition={{ duration: 1.5, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror' }}
                    className="relative z-10 text-xl">🧵</motion.div>
                </div>
                <p className="text-[10px] text-white/30 text-center">Your intrusive thought feeds the loom · the community weaves it into something bearable</p>
              </div>

              {!submitted ? (
                <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <textarea
                    value={thought}
                    onChange={e => setThought(e.target.value.slice(0, 200))}
                    placeholder="What's the intrusive thought you can't shake? (posted anonymously)"
                    rows={4}
                    className="w-full bg-transparent p-4 text-[13px] text-white/80 placeholder:text-white/25 resize-none outline-none leading-relaxed"
                  />
                  <div className="px-4 pb-4 flex items-center justify-between">
                    <span className="text-[10px] text-white/30 font-mono">{thought.length}/200</span>
                    <motion.button whileTap={{ scale: 0.94 }} disabled={thought.trim().length<10} onClick={() => {if(thought.trim().length>=10){setSubmitted(true);completeActivity('reframing-loom','Reframing practice',30);}}}
                      className="px-4 py-2 rounded-xl text-[12px] font-bold"
                      style={{ background: thought.length >= 10 ? COLOR : 'rgba(255,255,255,0.06)', color: thought.length >= 10 ? '#040d12' : 'rgba(255,255,255,0.2)' }}>
                      Feed the Loom
                    </motion.button>
                  </div>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl p-4" style={{ background: `${COLOR}10`, border: `1px solid ${COLOR}30` }}>
                  <p className="text-[12px] font-bold" style={{ color: COLOR }}>Your reflection is saved</p>
                  <p className="text-[11px] text-white/50 mt-1">Saved on this device. Explore sample reframes or write your own response.</p>
                  <button className="mobile-text-button" onClick={()=>setActiveTab('reframe')}>Explore sample reframes</button><button onClick={() => { setSubmitted(false); setThought(''); }} className="mt-2 text-[10px] text-white/30 underline">submit another</button>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div key="reframe" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex flex-col gap-4">
              <p className="text-[11px] font-bold uppercase tracking-widest text-white/30 px-1">Community Reframes — vote for the most healing</p>
              {EXAMPLE_REFRAMES.map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="px-3.5 pt-3 pb-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <p className="text-[10px] text-white/35 italic mb-1.5">Original: "{item.thought}"</p>
                  </div>
                  <div className="px-3.5 pt-2.5 pb-3 flex gap-3 items-start" style={{ background: `${COLOR}06` }}>
                    <div className="flex-1">
                      <p className="text-[12px] text-white/80 leading-relaxed">{item.reframe}</p>
                      <p className="text-[9px] text-white/30 mt-1.5 font-medium">by {item.author}</p>
                    </div>
                    <button onClick={() => toggleVote(item.id)} className="flex flex-col items-center gap-0.5 flex-shrink-0 mt-0.5">
                      <motion.div whileTap={{ scale: 1.3 }} className="text-base">{votedIds.has(item.id) ? '💙' : '🤍'}</motion.div>
                      <span className="text-[9px] font-bold" style={{ color: votedIds.has(item.id) ? COLOR : 'rgba(255,255,255,0.3)' }}>
                        {item.votes + (votedIds.has(item.id) ? 1 : 0)}
                      </span>
                    </button>
                  </div>
                </motion.div>
              ))}

              {!myReframePosted ? (
                <div className="rounded-2xl overflow-hidden mt-1" style={{ background: `${COLOR}06`, border: `1px solid ${COLOR}20` }}>
                  <p className="px-4 pt-3 text-[11px] font-bold" style={{ color: COLOR }}>Weave your own reframe</p>
                  <textarea
                    value={reframeText}
                    onChange={e => setReframeText(e.target.value.slice(0, 280))}
                    placeholder="How would you reframe the thought above…"
                    rows={3}
                    className="w-full bg-transparent px-4 pt-2 pb-1 text-[12px] text-white/80 placeholder:text-white/25 resize-none outline-none leading-relaxed"
                  />
                  <div className="px-4 pb-3 flex justify-end">
                    <motion.button whileTap={{ scale: 0.94 }} onClick={() => reframeText.length >= 20 && setMyReframePosted(true)}
                      className="px-4 py-2 rounded-xl text-[11px] font-bold"
                      style={{ background: reframeText.length >= 20 ? COLOR : 'rgba(255,255,255,0.06)', color: reframeText.length >= 20 ? '#040d12' : 'rgba(255,255,255,0.25)' }}>
                      Post Reframe
                    </motion.button>
                  </div>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl p-3 flex items-center gap-2" style={{ background: `${COLOR}12`, border: `1px solid ${COLOR}30` }}>
                  <Check className="w-4 h-4 flex-shrink-0" style={{ color: COLOR }} />
                  <p className="text-[12px]" style={{ color: COLOR }}>Your reframe is woven in. +40 XP</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── 3. Pulse Sync ──────────────────────────────────────────────────────────

type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'rest';

const BREATH_CYCLE: { phase: BreathPhase; label: string; duration: number }[] = [
  { phase: 'inhale', label: 'Breathe In', duration: 4000 },
  { phase: 'hold',   label: 'Hold',       duration: 4000 },
  { phase: 'exhale', label: 'Breathe Out', duration: 6000 },
  { phase: 'rest',   label: 'Rest',        duration: 2000 },
];

function PulseSync({ onBack }: { onBack: () => void }) {
  const COLOR = '#c4b5fd';
  const [phaseIdx, setPhaseIdx] = useFlowState('PulseSync.phaseIdx',0);
  const [sync, setSync] = useState(0);
  const [taps, setTaps] = useState(0);
  const [chatUnlocked, setChatUnlocked] = useFlowState('PulseSync.chatUnlocked',false);
  const [message, setMessage] = useFlowState('PulseSync.message','');
  const [messages, setMessages] = useFlowState<{ text: string; mine: boolean }[]>('PulseSync.messages',[
    { text: "Still here with you.", mine: false },
  ]);
  const phaseRef = useRef(phaseIdx);
  phaseRef.current = phaseIdx;

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const advance = () => {
      const next = (phaseRef.current + 1) % BREATH_CYCLE.length;
      setPhaseIdx(next);
      t = setTimeout(advance, BREATH_CYCLE[next].duration);
    };
    t = setTimeout(advance, BREATH_CYCLE[phaseIdx].duration);
    return () => clearTimeout(t);
  }, []);

  const current = BREATH_CYCLE[phaseIdx];
  const isExpanding = current.phase === 'inhale' || current.phase === 'hold';

  const handleTap = () => {
    setTaps(t => t + 1);
    setSync(s => Math.min(100, s + 7));
    if (sync >= 73) setChatUnlocked(true);
  };

  const sendMsg = () => {
    if (!message.trim()) return;
    setMessages(m => [...m, { text: message, mine: true }]);
    setMessage('');
    setTimeout(() => setMessages(m => [...m, { text: "I hear you.", mine: false }]), 1200);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #0a0612 0%, #050310 100%)' }}>
      <Header title="Pulse Sync" track="Synchronous Grounding" trackColor={COLOR} xp={50} onBack={onBack} />

      <div className="flex-1 px-4 pb-8 flex flex-col gap-5 overflow-y-auto">
        {/* Breathing orb */}
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="relative flex items-center justify-center">
            {/* Outer ring */}
            <motion.div
              animate={{ scale: isExpanding ? 1.35 : 0.9, opacity: isExpanding ? 0.25 : 0.1 }}
              transition={{ duration: current.duration / 1000, ease: 'easeInOut' }}
              className="absolute rounded-full"
              style={{ width: 180, height: 180, background: `radial-gradient(circle, ${COLOR}44, transparent)` }} />
            {/* Middle ring */}
            <motion.div
              animate={{ scale: isExpanding ? 1.2 : 0.95, opacity: isExpanding ? 0.35 : 0.15 }}
              transition={{ duration: current.duration / 1000, ease: 'easeInOut' }}
              className="absolute rounded-full"
              style={{ width: 140, height: 140, border: `1px solid ${COLOR}50` }} />
            {/* Core */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={handleTap}
              animate={{ scale: isExpanding ? 1.15 : 0.88, boxShadow: isExpanding ? `0 0 40px ${COLOR}50` : `0 0 12px ${COLOR}20` }}
              transition={{ duration: current.duration / 1000, ease: 'easeInOut' }}
              className="relative z-10 rounded-full flex items-center justify-center"
              style={{ width: 100, height: 100, background: `radial-gradient(circle, ${COLOR}60, ${COLOR}20)`, border: `2px solid ${COLOR}80` }}>
              <Heart className="w-8 h-8" style={{ color: '#fff' }} />
            </motion.button>
          </div>

          <div className="text-center">
            <p className="text-[20px] font-black text-white">{current.label}</p>
            <p className="text-[11px] text-white/40 mt-0.5">Tap the orb with your breath · {taps} taps</p>
          </div>
        </div>

        {/* Sync meter */}
        <div className="rounded-2xl p-4" style={{ background: `${COLOR}08`, border: `1px solid ${COLOR}20` }}>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[12px] font-bold text-white/80">Sync with your partner</p>
            <p className="text-[13px] font-black" style={{ color: sync >= 80 ? '#86efac' : COLOR }}>{sync}%</p>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <motion.div animate={{ width: `${sync}%` }} className="h-full rounded-full" style={{ background: sync >= 80 ? '#86efac' : COLOR }} />
          </div>
          <p className="text-[10px] text-white/30 mt-2 text-center">
            {sync < 40 ? 'Breathe together to sync…'
              : sync < 80 ? 'Getting closer — keep breathing'
              : 'Chat unlocked — you\'re in sync ✦'}
          </p>
        </div>

        {/* Partner indicator */}
        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <motion.div animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{ background: `${COLOR}20` }}>🌙</motion.div>
          <div className="flex-1">
            <p className="text-[12px] font-bold text-white/80">NightTide_7821</p>
            <p className="text-[10px] text-white/35">Breathing with you · Sync {Math.max(0, sync - 8)}%</p>
          </div>
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#86efac' }} />
        </div>

        {/* Chat — unlocks at 80% sync */}
        <AnimatePresence>
          {chatUnlocked && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${COLOR}30` }}>
              <div className="px-3 py-2 flex items-center gap-2" style={{ background: `${COLOR}12` }}>
                <Check className="w-3.5 h-3.5" style={{ color: COLOR }} />
                <p className="text-[11px] font-bold" style={{ color: COLOR }}>Chat unlocked by your sync</p>
              </div>
              <div className="p-3 flex flex-col gap-2 max-h-40 overflow-y-auto" style={{ background: 'rgba(0,0,0,0.3)' }}>
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.mine ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[75%] rounded-xl px-3 py-2 text-[12px]"
                      style={{ background: m.mine ? `${COLOR}30` : 'rgba(255,255,255,0.07)', color: m.mine ? COLOR : 'rgba(255,255,255,0.7)' }}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 p-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <input value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMsg()}
                  placeholder="Say something…"
                  className="flex-1 bg-transparent text-[12px] text-white/80 placeholder:text-white/25 outline-none" />
                <button onClick={sendMsg} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${COLOR}25` }}>
                  <Send className="w-3.5 h-3.5" style={{ color: COLOR }} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── 4. Kintsugi Canvas ─────────────────────────────────────────────────────

const KINTSUGI_PROMPTS = [
  "What's one small thing that made today survivable?",
  "Describe a moment of unexpected beauty you witnessed this week.",
  "What's something you forgave yourself for recently, even slightly?",
  "Name something you're quietly grateful for that nobody sees.",
  "What memory brings you peace when the world feels loud?",
  "What did you learn about yourself when things broke down?",
  "Describe a kindness that stayed with you longer than expected.",
];

const CRACKS = [
  { id: 0, d: 'M 80 120 L 120 160 L 100 200', filled: true },
  { id: 1, d: 'M 140 80 L 170 130 L 155 180', filled: true },
  { id: 2, d: 'M 60 150 L 100 170 L 80 210', filled: true },
  { id: 3, d: 'M 160 140 L 190 160 L 175 200', filled: false },
  { id: 4, d: 'M 90 90 L 110 120 L 95 150', filled: false },
  { id: 5, d: 'M 120 170 L 145 190 L 130 220', filled: false },
  { id: 6, d: 'M 70 180 L 90 200 L 75 230', filled: false },
];

function KintsugiCanvas({ onBack }: { onBack: () => void }) {
  const COLOR = '#c4b5fd';
  const GOLD = '#fbbf24';
  const [filledCracks, setFilledCracks] = useFlowState<Set<number>>('KintsugiCanvas.filledCracks',new Set([0, 1, 2]));
  const [promptIdx, setPromptIdx] = useFlowState('KintsugiCanvas.promptIdx',3);
  const [answer, setAnswer] = useFlowState('KintsugiCanvas.answer','');
  const [submitted, setSubmitted] = useFlowState('KintsugiCanvas.submitted',false);
  const [partnerShowing, setPartnerShowing] = useState(false);

  const handleSubmit = () => {
    if (answer.length < 10) return;
    setFilledCracks(prev => new Set([...prev, promptIdx]));
    setSubmitted(true);
    setPartnerShowing(true);
  };

  useEffect(()=>{if(submitted)setPartnerShowing(true);if(filledCracks.size===CRACKS.length)completeActivity('kintsugi','Kintsugi reflection',60);},[submitted,filledCracks.size]);
  const nextPrompt = () => {
    setPromptIdx(i => Math.min(i + 1, KINTSUGI_PROMPTS.length - 1));
    setAnswer('');
    setSubmitted(false);
    setPartnerShowing(false);
  };

  const progress = filledCracks.size;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #0a0612 0%, #050310 100%)' }}>
      <Header title="Kintsugi Canvas" track="Synchronous Grounding" trackColor={COLOR} xp={45} onBack={onBack} />

      <div className="flex-1 px-4 pb-8 flex flex-col gap-5 overflow-y-auto">
        {/* Progress */}
        <div className="flex items-center gap-3 mt-1">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <motion.div animate={{ width: `${(progress / CRACKS.length) * 100}%` }} className="h-full rounded-full" style={{ background: GOLD }} />
          </div>
          <span className="text-[11px] font-bold" style={{ color: GOLD }}>{progress}/{CRACKS.length} cracks healed</span>
        </div>

        {/* SVG pottery */}
        <div className="flex justify-center">
          <div className="relative" style={{ width: 260, height: 280 }}>
            <svg width="260" height="280" viewBox="0 0 260 280">
              {/* Vase body */}
              <ellipse cx="130" cy="250" rx="65" ry="20" fill="rgba(255,255,255,0.04)" />
              <path d="M 65 250 Q 40 180 50 100 Q 60 40 130 30 Q 200 40 210 100 Q 220 180 195 250 Z"
                fill="rgba(30,20,50,0.7)" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
              {/* Cracks */}
              {CRACKS.map(crack => (
                <path key={crack.id} d={crack.d} fill="none" strokeWidth="2.5" strokeLinecap="round"
                  stroke={filledCracks.has(crack.id) ? GOLD : 'rgba(255,255,255,0.2)'}
                  style={{ filter: filledCracks.has(crack.id) ? `drop-shadow(0 0 4px ${GOLD})` : 'none', transition: 'stroke 0.8s ease' }} />
              ))}
              {/* Rim */}
              <ellipse cx="130" cy="30" rx="42" ry="12" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
            </svg>
            {progress === CRACKS.length && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-full p-3 text-3xl" style={{ background: `${GOLD}20`, border: `1px solid ${GOLD}40` }}>✨</div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Prompt */}
        <div className="rounded-2xl p-4" style={{ background: `${COLOR}08`, border: `1px solid ${COLOR}20` }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: COLOR }}>Gratitude prompt {promptIdx + 1} / {KINTSUGI_PROMPTS.length}</p>
          <p className="text-[14px] text-white/85 leading-relaxed font-medium">{KINTSUGI_PROMPTS[promptIdx]}</p>
        </div>

        {/* Answer */}
        {!submitted ? (
          <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <textarea
              value={answer}
              onChange={e => setAnswer(e.target.value.slice(0, 300))}
              placeholder="Your answer fills a crack with gold…"
              rows={4}
              className="w-full bg-transparent p-4 text-[13px] text-white/80 placeholder:text-white/25 resize-none outline-none leading-relaxed"
            />
            <div className="px-4 pb-4 flex items-center justify-between">
              <span className="text-[10px] text-white/30 font-mono">{answer.length}/300</span>
              <motion.button whileTap={{ scale: 0.94 }} onClick={handleSubmit} disabled={answer.trim().length<10}
                className="px-4 py-2 rounded-xl text-[12px] font-bold"
                style={{ background: answer.length >= 10 ? GOLD : 'rgba(255,255,255,0.06)', color: answer.length >= 10 ? '#040d12' : 'rgba(255,255,255,0.25)' }}>
                Fill the Crack
              </motion.button>
            </div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3">
            <div className="rounded-xl p-3.5 flex items-center gap-3" style={{ background: `${GOLD}10`, border: `1px solid ${GOLD}30` }}>
              <span className="text-xl">✨</span>
              <div>
                <p className="text-[12px] font-bold" style={{ color: GOLD }}>Crack filled with gold</p>
                <p className="text-[10px] text-white/40 mt-0.5">{progress}/{CRACKS.length} cracks healed</p>
              </div>
            </div>

            <AnimatePresence>
              {partnerShowing && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl p-3.5" style={{ background: `${COLOR}08`, border: `1px solid ${COLOR}25` }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: COLOR }}>A sample perspective on the prompt</p>
                  <p className="text-[12px] text-white/65 italic leading-relaxed">"The coffee my neighbor left outside my door without knocking. I didn't know how much I needed that."</p>
                  <p className="text-[9px] text-white/30 mt-1.5">— Lantern_🌙</p>
                </motion.div>
              )}
            </AnimatePresence>

            {promptIdx===KINTSUGI_PROMPTS.length-1&&<div role="status"><p>Canvas complete. Your reflections are saved on this device.</p><button className="mobile-primary-button" onClick={onBack}>Finish canvas</button></div>}
            {promptIdx < KINTSUGI_PROMPTS.length - 1 && (
              <ActionBtn label="Next Prompt" onClick={nextPrompt} color={COLOR} icon={<ChevronRight className="w-4 h-4" />} />
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── 5. Pace-Maker ──────────────────────────────────────────────────────────

const SESSION_MSGS = [
  { text: "I don't know what to do anymore", time: '2:41 PM', gap: null },
  { text: "it keeps happening", time: '2:41 PM', gap: 0 },
  { text: "every single time without fail", time: '2:41 PM', gap: 1 },
];

function PaceMaker({ onBack }: { onBack: () => void }) {
  const COLOR = '#86efac';
  const [paused, setPaused] = useFlowState('PaceMaker.paused',false);
  const [countdown, setCountdown] = useState(60);
  const [threshold, setThreshold] = useFlowState('PaceMaker.threshold',3);
  const [pauseDuration, setPauseDuration] = useFlowState('PaceMaker.pauseDuration',60);
  const [demo, setDemo] = useFlowState('PaceMaker.demo',false);

  useEffect(() => {
    if (!paused) return;
    if (countdown <= 0) { setPaused(false); setCountdown(pauseDuration); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [paused, countdown, pauseDuration]);

  const triggerDemo = () => { setPaused(true); setCountdown(pauseDuration); setDemo(true); };
  const skipPause = () => { setPaused(false); setCountdown(pauseDuration); };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #030d08 0%, #020708 100%)' }}>
      <Header title="Pace-Maker" track="Pace controls" trackColor={COLOR} xp={15} onBack={onBack} />

      <div className="flex-1 px-4 pb-8 flex flex-col gap-5 overflow-y-auto">
        {/* Status card */}
        <div className="rounded-2xl p-4 flex items-center gap-4 mt-1" style={{ background: `${COLOR}08`, border: `1px solid ${COLOR}25` }}>
          <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2, repeat: Infinity }}
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: `${COLOR}18`, border: `1px solid ${COLOR}30` }}>
            {paused ? '🌬️' : '💚'}
          </motion.div>
          <div>
            <p className="text-[14px] font-black text-white">{paused ? 'Breathing pause active' : 'Pace-Maker is watching'}</p>
            <p className="text-[11px] text-white/45 mt-0.5">{paused ? `${countdown}s remaining — breathe with the timer` : `Triggers after ${threshold} rapid messages`}</p>
          </div>
        </div>

        {/* Countdown ring — shown during pause */}
        <AnimatePresence>
          {paused && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-4 py-4">
              <div className="relative w-28 h-28">
                <svg width="112" height="112" viewBox="0 0 112 112" className="rotate-[-90deg]">
                  <circle cx="56" cy="56" r="48" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                  <motion.circle cx="56" cy="56" r="48" fill="none" strokeWidth="6" strokeLinecap="round"
                    stroke={COLOR}
                    strokeDasharray={`${2 * Math.PI * 48}`}
                    animate={{ strokeDashoffset: `${2 * Math.PI * 48 * (1 - countdown / pauseDuration)}` }}
                    transition={{ duration: 1, ease: 'linear' }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[28px] font-black text-white">{countdown}</span>
                  <span className="text-[9px] text-white/40 uppercase tracking-wider">seconds</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-[13px] font-bold" style={{ color: COLOR }}>Breathe in for 4 · hold for 4 · out for 6</p>
                <p className="text-[10px] text-white/35 mt-0.5">Your keyboard will unlock when the timer ends</p>
              </div>
              <button onClick={skipPause} className="text-[10px] text-white/30 underline">Skip pause</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Session messages demo */}
        {!paused && (
          <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="px-3.5 pt-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-white/30">Session example — rapid message pattern</p>
            <div className="px-3.5 pb-3 flex flex-col gap-1.5">
              {SESSION_MSGS.map((m, i) => (
                <div key={i} className="flex items-end gap-2 justify-end">
                  <div className="rounded-xl px-3 py-2 max-w-[80%]" style={{ background: 'rgba(255,255,255,0.07)' }}>
                    <p className="text-[12px] text-white/75">{m.text}</p>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-[9px] text-white/25">{m.time}</span>
                    {m.gap !== null && <span className="text-[8px] font-bold" style={{ color: '#ef4444' }}>{m.gap}s gap</span>}
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-px" style={{ background: 'rgba(239,68,68,0.25)' }} />
                <span className="text-[9px] font-bold" style={{ color: '#ef4444' }}>⚠ Pace trigger activated</span>
                <div className="flex-1 h-px" style={{ background: 'rgba(239,68,68,0.25)' }} />
              </div>
            </div>
          </div>
        )}

        {/* Settings */}
        <div className="rounded-2xl p-4 flex flex-col gap-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-[12px] font-bold text-white/60 uppercase tracking-widest">Settings</p>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] text-white/70">Trigger threshold</span>
              <span className="text-[12px] font-bold" style={{ color: COLOR }}>{threshold} rapid messages</span>
            </div>
            <input type="range" min={2} max={6} value={threshold} onChange={e => setThreshold(+e.target.value)}
              className="w-full h-1.5 rounded-full outline-none cursor-pointer appearance-none"
              style={{ accentColor: COLOR, background: `linear-gradient(to right, ${COLOR} ${(threshold - 2) / 4 * 100}%, rgba(255,255,255,0.1) 0%)` }} />
            <div className="flex justify-between mt-1">
              <span className="text-[9px] text-white/25">2</span>
              <span className="text-[9px] text-white/25">6</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] text-white/70">Pause duration</span>
              <span className="text-[12px] font-bold" style={{ color: COLOR }}>{pauseDuration}s</span>
            </div>
            <input type="range" min={30} max={120} step={10} value={pauseDuration} onChange={e => setPauseDuration(+e.target.value)}
              className="w-full h-1.5 rounded-full outline-none cursor-pointer appearance-none"
              style={{ accentColor: COLOR, background: `linear-gradient(to right, ${COLOR} ${(pauseDuration - 30) / 90 * 100}%, rgba(255,255,255,0.1) 0%)` }} />
            <div className="flex justify-between mt-1">
              <span className="text-[9px] text-white/25">30s</span>
              <span className="text-[9px] text-white/25">120s</span>
            </div>
          </div>
        </div>

        {!paused && <ActionBtn label="Simulate a Trigger" onClick={triggerDemo} color={COLOR} icon={<Activity className="w-4 h-4" />} />}

        {/* History */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-2.5 px-1 text-white/30">Past 7 days — {demo ? 4 : 3} pauses triggered</p>
          {[
            { day: 'Today', count: demo ? 2 : 1, color: COLOR },
            { day: 'Yesterday', count: 1, color: COLOR },
            { day: '2 days ago', count: 1, color: COLOR },
          ].map((row, i) => (
            <div key={i} className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span className="text-[11px] text-white/40 w-24">{row.day}</span>
              <div className="flex gap-1.5">
                {[...Array(row.count)].map((_, j) => (
                  <div key={j} className="w-5 h-5 rounded-md flex items-center justify-center text-[11px]" style={{ background: `${row.color}15`, border: `1px solid ${row.color}30` }}>🌬️</div>
                ))}
              </div>
              <span className="text-[10px] text-white/30 ml-auto">{row.count} pause{row.count > 1 ? 's' : ''}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 6. Boundary Sentinels ──────────────────────────────────────────────────

const SENTINEL_CATEGORIES = [
  { id: 'self-harm', label: 'Self-harm language', icon: '🛡️', description: 'Phrases indicating risk of harm to self', active: true, intercepts: 7 },
  { id: 'crisis', label: 'Crisis escalation', icon: '🚨', description: 'Escalating distress patterns over time', active: true, intercepts: 3 },
  { id: 'shame', label: 'Shame spirals', icon: '🌀', description: 'Toxic self-blame language patterns', active: true, intercepts: 12 },
  { id: 'isolation', label: 'Isolation language', icon: '🫥', description: 'Expressions of disconnection from others', active: false, intercepts: 0 },
];

const CRISIS_LINES = [
  { label: 'iCall (India)', number: '9152987821', flag: '🇮🇳' },
  { label: 'Crisis Text Line', number: 'Text HOME to 741741', flag: '🌐' },
  { label: 'Vandrevala Foundation', number: '1860-2662-345', flag: '🇮🇳' },
];

function BoundarySentinels({ onBack }: { onBack: () => void }) {
  const COLOR = '#86efac';
  const [categories, setCategories] = useFlowState('BoundarySentinels.categories',SENTINEL_CATEGORIES);
  const [expanded, setExpanded] = useFlowState<string | null>('BoundarySentinels.expanded',null);

  const toggleCategory = (id: string) => {
    setCategories(cats => cats.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  const totalIntercepts = categories.reduce((n, c) => n + (c.active ? c.intercepts : 0), 0);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #030d08 0%, #020708 100%)' }}>
      <Header title="Boundary Sentinels" track="Pace controls" trackColor={COLOR} xp={0} onBack={onBack} />

      <div className="flex-1 px-4 pb-8 flex flex-col gap-5 overflow-y-auto">
        {/* Status */}
        <div className="rounded-2xl p-4 flex items-center gap-4 mt-1" style={{ background: `${COLOR}08`, border: `1px solid ${COLOR}25` }}>
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ background: `${COLOR}18` }}>🛡️</div>
            <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 animate-pulse" style={{ background: COLOR, borderColor: '#030d08' }} />
          </div>
          <div>
            <p className="text-[14px] font-black text-white">{categories.filter(c => c.active).length} Sentinels Active</p>
            <p className="text-[11px] text-white/45 mt-0.5">{totalIntercepts} conversations protected this month</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <StatPill icon={<Shield className="w-3.5 h-3.5" />} value={String(totalIntercepts)} label="Intercepts" color={COLOR} />
          <StatPill icon={<Heart className="w-3.5 h-3.5" />} value="100%" label="Opt-in" color={COLOR} />
          <StatPill icon={<Sparkles className="w-3.5 h-3.5" />} value="E2E" label="Privacy" color={COLOR} />
        </div>

        {/* Categories */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-3 px-1 text-white/30">Protection categories</p>
          <div className="flex flex-col gap-2.5">
            {categories.map((cat, i) => (
              <motion.div key={cat.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="rounded-xl overflow-hidden" style={{ border: `1px solid ${cat.active ? COLOR + '25' : 'rgba(255,255,255,0.07)'}` }}>
                <div className="flex items-center gap-3 p-3.5" style={{ background: cat.active ? `${COLOR}06` : 'rgba(255,255,255,0.02)' }}>
                  <span className="text-xl flex-shrink-0">{cat.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-white/85">{cat.label}</p>
                    <p className="text-[10px] text-white/40 mt-0.5">{cat.intercepts} past intercepts</p>
                  </div>
                  <button onClick={() => setExpanded(expanded === cat.id ? null : cat.id)} className="mr-1 text-white/30">
                    <motion.div animate={{ rotate: expanded === cat.id ? 90 : 0 }}>
                      <ChevronRight className="w-4 h-4" />
                    </motion.div>
                  </button>
                  <button
                    onClick={() => toggleCategory(cat.id)}
                    className="w-11 h-6 rounded-full relative flex-shrink-0"
                    style={{ background: cat.active ? `${COLOR}30` : 'rgba(255,255,255,0.08)', border: `1px solid ${cat.active ? COLOR + '50' : 'rgba(255,255,255,0.1)'}` }}>
                    <motion.div animate={{ x: cat.active ? 20 : 2 }} className="absolute top-0.5 w-5 h-5 rounded-full"
                      style={{ background: cat.active ? COLOR : 'rgba(255,255,255,0.3)' }} />
                  </button>
                </div>
                <AnimatePresence>
                  {expanded === cat.id && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                      <p className="px-4 py-3 text-[11px] text-white/55 leading-relaxed" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        {cat.description}. The AI monitors patterns in real-time and can surface a gentle check-in prompt or resource card — never automatically escalating without your consent.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Crisis resources */}
        <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-3 text-white/30">Resources — always available</p>
          <div className="flex flex-col gap-2.5">
            {CRISIS_LINES.map((line, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-base">{line.flag}</span>
                <div className="flex-1">
                  <p className="text-[12px] font-bold text-white/75">{line.label}</p>
                  <p className="text-[10px] font-mono" style={{ color: COLOR }}>{line.number}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 7. Ebb & Flow UI ──────────────────────────────────────────────────────

const EBB_STATES = [
  { id: 'serene',   label: 'Serene',     emoji: '🌊', tension: 0,   bg: 'linear-gradient(180deg, #020f14 0%, #011019 50%, #010d14 100%)', accent: '#67e8f9', wave: '#0891b2' },
  { id: 'calm',     label: 'Calm',       emoji: '🌙', tension: 20,  bg: 'linear-gradient(180deg, #030a10 0%, #040c14 100%)', accent: '#93c5fd', wave: '#1d4ed8' },
  { id: 'grounded', label: 'Grounded',   emoji: '🌿', tension: 40,  bg: 'linear-gradient(180deg, #030d08 0%, #020a06 100%)', accent: '#86efac', wave: '#16a34a' },
  { id: 'stirred',  label: 'Stirred',    emoji: '🌪️',  tension: 60,  bg: 'linear-gradient(180deg, #0e0a02 0%, #120e02 100%)', accent: '#fcd34d', wave: '#d97706' },
  { id: 'tense',    label: 'Tense',      emoji: '⚡',  tension: 80,  bg: 'linear-gradient(180deg, #130606 0%, #160404 100%)', accent: '#fb923c', wave: '#ea580c' },
  { id: 'critical', label: 'Critical',   emoji: '🔴',  tension: 100, bg: 'linear-gradient(180deg, #160202 0%, #1a0101 100%)', accent: '#f87171', wave: '#dc2626' },
];

function EbbAndFlow({ onBack }: { onBack: () => void }) {
  const COLOR = '#86efac';
  const [tension, setTension] = useFlowState('EbbAndFlow.tension',20);
  const [muted, setMuted] = useFlowState('EbbAndFlow.muted',false);
  const [waveOffset, setWaveOffset] = useState(0);

  const currentState = EBB_STATES.reduce((best, s) => Math.abs(s.tension - tension) < Math.abs(best.tension - tension) ? s : best, EBB_STATES[0]);

  useEffect(() => {
    const speed = 0.8 + tension * 0.025;
    const iv = setInterval(() => setWaveOffset(o => (o + speed) % 360), 50);
    return () => clearInterval(iv);
  }, [tension]);

  const waveAmplitude = 10 + tension * 0.4;
  const waveFrequency = 1 + tension * 0.02;

  return (
    <div className="min-h-screen flex flex-col transition-all duration-1000" style={{ background: currentState.bg }}>
      <Header title="Ebb & Flow UI" track="Pace controls" trackColor={COLOR} xp={0} onBack={onBack} />

      <div className="flex-1 px-4 pb-8 flex flex-col gap-5 overflow-y-auto">
        {/* Live preview */}
        <div className="rounded-2xl overflow-hidden relative" style={{ height: 180, border: `1px solid ${currentState.accent}25` }}>
          <motion.div className="absolute inset-0 transition-all duration-1000" style={{ background: currentState.bg }} />
          {/* Animated wave */}
          <svg width="100%" height="100%" viewBox="0 0 360 180" preserveAspectRatio="none" className="absolute inset-0">
            <defs>
              <linearGradient id="waveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={currentState.wave} stopOpacity="0.3" />
                <stop offset="100%" stopColor={currentState.wave} stopOpacity="0.05" />
              </linearGradient>
            </defs>
            {[0, 1, 2].map(layer => {
              const pts = [...Array(13)].map((_, i) => {
                const x = i * 30;
                const y = 90 + Math.sin((i * waveFrequency + waveOffset * 0.05 + layer * 1.5) * Math.PI / 6) * (waveAmplitude - layer * 4);
                return `${x},${y}`;
              }).join(' ');
              return (
                <polyline key={layer} points={pts} fill="none"
                  stroke={currentState.wave}
                  strokeWidth={1.5 - layer * 0.4}
                  strokeOpacity={0.4 - layer * 0.1} />
              );
            })}
            <path d={`M 0 ${90 + waveAmplitude} Q 90 ${90 - waveAmplitude * 0.5} 180 ${90 + waveAmplitude * 0.3} Q 270 ${90 + waveAmplitude} 360 ${90 - waveAmplitude * 0.5} L 360 180 L 0 180 Z`}
              fill="url(#waveGrad)" />
          </svg>

          {/* State label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <motion.span animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2 + tension * 0.02, repeat: Infinity }} className="text-4xl">{currentState.emoji}</motion.span>
            <p className="text-[16px] font-black text-white/90">{currentState.label}</p>
            <p className="text-[11px] text-white/40">tension: {tension}%</p>
          </div>

          <button onClick={() => setMuted(!muted)} className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.3)' }}>
            {muted ? <VolumeX className="w-3.5 h-3.5 text-white/50" /> : <Volume2 className="w-3.5 h-3.5 text-white/70" />}
          </button>
        </div>

        {/* Tension slider */}
        <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-bold text-white/70">Emotional Tension</span>
            <span className="text-[12px] font-black" style={{ color: currentState.accent }}>{tension}%</span>
          </div>
          <div className="relative mb-3">
            <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
              <div className="h-full rounded-full transition-all duration-300"
                style={{ width: `${tension}%`, background: `linear-gradient(90deg, #67e8f9, #86efac, #fcd34d, #fb923c, #f87171)` }} />
            </div>
            <input type="range" min={0} max={100} value={tension} onChange={e => setTension(+e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          </div>
          <div className="flex justify-between">
            <span className="text-[9px] text-white/25">🌊 Serene</span>
            <span className="text-[9px] text-white/25">🔴 Critical</span>
          </div>
        </div>

        {/* State palette */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-3 px-1 text-white/30">UI states</p>
          <div className="grid grid-cols-3 gap-2">
            {EBB_STATES.map(state => (
              <motion.button key={state.id} whileTap={{ scale: 0.94 }} onClick={() => setTension(state.tension)}
                className="rounded-xl p-2.5 flex flex-col items-center gap-1.5"
                style={{
                  background: currentState.id === state.id ? `${state.accent}18` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${currentState.id === state.id ? state.accent + '40' : 'rgba(255,255,255,0.07)'}`,
                }}>
                <span className="text-xl">{state.emoji}</span>
                <span className="text-[10px] font-bold" style={{ color: currentState.id === state.id ? state.accent : 'rgba(255,255,255,0.45)' }}>{state.label}</span>
                <div className="w-full h-1 rounded-full" style={{ background: state.accent + '50' }} />
              </motion.button>
            ))}
          </div>
        </div>

        {/* What changes */}
        <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-3 text-white/30">What adapts</p>
          {[
            { label: 'Background gradient', desc: 'Shifts from ocean depths to ember tones', icon: '🎨' },
            { label: 'Wave speed & amplitude', desc: 'Gentle ripples → crashing — mirrors internal state', icon: '🌊' },
            { label: 'Message bubble tint', desc: 'Warm blue → amber → red over tension', icon: '💬' },
            { label: 'Input border glow', desc: 'Soft pulse at low tension, sharp flicker at high', icon: '✏️' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 py-2" style={{ borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <span className="text-base flex-shrink-0 mt-0.5">{item.icon}</span>
              <div>
                <p className="text-[12px] font-bold text-white/75">{item.label}</p>
                <p className="text-[10px] text-white/40 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Feature map + router ────────────────────────────────────────────────────

const HEAL_FEATURE_MAP: Record<string, (props: { onBack: () => void }) => React.ReactElement> = {
  'lantern-garden':      ({ onBack }) => <LanternGarden onBack={onBack} />,
  'reframing-loom':      ({ onBack }) => <ReframingLoom onBack={onBack} />,
  'pulse-sync':          ({ onBack }) => <PulseSync onBack={onBack} />,
  'kintsugi-canvas':     ({ onBack }) => <KintsugiCanvas onBack={onBack} />,
  'pace-maker':          ({ onBack }) => <PaceMaker onBack={onBack} />,
  'boundary-sentinels':  ({ onBack }) => <BoundarySentinels onBack={onBack} />,
  'ebb-and-flow-ui':     ({ onBack }) => <EbbAndFlow onBack={onBack} />,
};

export interface HealFeaturePageProps {
  featureId: string;
  onBack: () => void;
}

export function HealFeaturePage({ featureId, onBack }: HealFeaturePageProps) {
  const Page = HEAL_FEATURE_MAP[featureId];
  if (!Page) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center" style={{ background: '#030d08' }}>
        <span className="text-5xl">🌿</span>
        <p className="text-[18px] font-black text-white">Space not found</p>
        <p className="text-[13px] text-white/40">Feature ID: <span className="font-mono">{featureId || '(none)'}</span></p>
        <button onClick={onBack} aria-label="Back" className="mt-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white/70" style={{ background: 'rgba(255,255,255,0.06)' }}>Go back</button>
      </div>
    );
  }
  return <Page onBack={onBack} />;
}
