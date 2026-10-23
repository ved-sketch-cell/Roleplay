import {useDeviceState} from '../mobile/state';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Zap, TrendingUp, TrendingDown, Star,
  Users, Shield, Crown, Lock, Flame, Clock,
  ChevronRight, CheckCircle, XCircle, AlertTriangle,
  MessageSquare, Gift, BarChart2, Sparkles,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────

interface XPEconomyProps {
  onBack: () => void;
  onEditIdentity?:()=>void;
  onExploreRooms?:()=>void;
}

type TabKey = 'earn' | 'spend' | 'bounty';

type StakeStep = 'write' | 'filtering' | 'vote_queue' | 'live' | 'rejected';

// ─── Constants ────────────────────────────────────────────────

const MSG_BUCKET_1 = 50;
const MSG_BUCKET_2 = 100;
const STAKE_COST = 5000;
const REJECTION_PENALTY = 0.2;

// ─── Static Data ──────────────────────────────────────────────

interface FaucetRow {
  id: string;
  label: string;
  emoji: string;
  desc: string;
  driver: string;
  recentXP: number | null;
  progress: number; // 0–1 for progress ring/bar
  detail: string;
  color: string;
}

const FAUCETS: FaucetRow[] = [
  {
    id: 'tip',
    label: 'Affinity Tipping',
    emoji: '💜',
    desc: 'Community awards XP to your messages for being helpful, funny, or emotionally resonant.',
    driver: 'Social Approval',
    recentXP: 340,
    progress: 0.72,
    detail: '11 tips received today',
    color: '#8169ec',
  },
  {
    id: 'deescalate',
    label: 'De-escalation Bonus',
    emoji: '🌊',
    desc: 'Guide chaotic roleplay into Sanctuary space without hitting the Heat cap.',
    driver: 'Epic Meaning',
    recentXP: 800,
    progress: 0.4,
    detail: '2 successful sessions this week',
    color: '#0891b2',
  },
  {
    id: 'mentor',
    label: 'Mentor Dividend',
    emoji: '🔮',
    desc: 'Retain a matched new user in a Whisper chat for over 3 days.',
    driver: 'Social Relatedness',
    recentXP: 220,
    progress: 0.6,
    detail: 'Mentoring Cipher_9 · Day 2 of 3',
    color: '#8169ec',
  },
  {
    id: 'streak',
    label: 'Daily Login Streak',
    emoji: '🔥',
    desc: 'Log in consecutively. Multiplier caps at 7 days.',
    driver: 'Avoidance',
    recentXP: 75,
    progress: 5 / 7,
    detail: '5-day streak · 2x multiplier active',
    color: '#ea580c',
  },
];

interface SinkRow {
  id: string;
  label: string;
  emoji: string;
  cost: 'low' | 'medium' | 'high';
  xp: number;
  benefit: string;
  color: string;
  locked: boolean;
}

const SINKS: SinkRow[] = [
  {
    id: 'aesthetics',
    label: 'Profile Aesthetics',
    emoji: '🎨',
    cost: 'low',
    xp: 500,
    benefit: "Open identity customization in this device-only preview.",
    color: '#10b981',
    locked: false,
  },
  {
    id: 'shadow',
    label: 'Shadow Key',
    emoji: '🗝️',
    cost: 'medium',
    xp: 1800,
    benefit: "Unlock a room exploration preview on this device.",
    color: '#8169ec',
    locked: false,
  },
  {
    id: 'prompt',
    label: 'Author a Global Prompt',
    emoji: '👑',
    cost: 'high',
    xp: STAKE_COST,
    benefit: "Stake XP to bypass the algorithm and place your scenario at the top of tomorrow's deck.",
    color: '#f59e0b',
    locked: false,
  },
];

interface AuthoredPrompt {
  id: string;
  text: string;
  status: 'live' | 'voting' | 'rejected';
  engagements: number;
  dividendEarned: number;
  staked: number;
  netXP: number;
}

const AUTHORED: AuthoredPrompt[] = [
  {
    id: 'p1',
    text: "Foldable phones are an overpriced design crime. Argue the opposite with more passion than the salesperson who sold you yours.",
    status: 'live',
    engagements: 412,
    dividendEarned: 6180,
    staked: 5000,
    netXP: 1180,
  },
  {
    id: 'p2',
    text: "Your character just discovered their closest ally has been secretly working for the opposition. Write the confrontation.",
    status: 'voting',
    engagements: 0,
    dividendEarned: 0,
    staked: 5000,
    netXP: -5000,
  },
];

// ─── Sub-components ───────────────────────────────────────────

function CostBadge({ cost, xp }: { cost: SinkRow['cost']; xp: number }) {
  const map = {
    low:    { label: 'Low',    bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.25)',  color: '#34d399' },
    medium: { label: 'Medium', bg: 'rgba(124,58,237,0.12)', border: 'rgba(124,58,237,0.25)', color: '#a78bfa' },
    high:   { label: 'High',   bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', color: '#fbbf24' },
  };
  const s = map[cost];
  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
      style={{ background: s.bg, border: `1px solid ${s.border}` }}
    >
      <Zap className="w-2.5 h-2.5" style={{ color: s.color }} />
      <span className="text-[11px] font-bold font-mono" style={{ color: s.color }}>{xp.toLocaleString()}</span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────

export function XPEconomy({ onBack,onEditIdentity,onExploreRooms }: XPEconomyProps) {
  const [tab, setTab] = useDeviceState<TabKey>('xp-tab','earn');
  const [xpBalance, setXpBalance] = useDeviceState('xp-balance',2840);
  const [dailyMessages, setDailyMessages] = useState(34);
  const [streakDays] = useState(5);

  // Staking flow state
  const [unlocked,setUnlocked]=useDeviceState<string[]>('xp-unlocks',[]);
  const [authored,setAuthored]=useDeviceState<AuthoredPrompt[]>('xp-authored',[]);
  const [stakeOpen, setStakeOpen] = useDeviceState('xp-stake-open',false);
  const [stakeStep, setStakeStep] = useDeviceState<StakeStep>('xp-stake-step','write');
  const [promptText, setPromptText] = useDeviceState('xp-prompt-draft','');
  const [filterProgress, setFilterProgress] = useState(0);

  const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'earn',   label: 'Faucets', icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { key: 'spend',  label: 'Sinks',   icon: <TrendingDown className="w-3.5 h-3.5" /> },
    { key: 'bounty', label: 'Bounty',  icon: <Crown className="w-3.5 h-3.5" /> },
  ];

  const tabIdx = TABS.findIndex(t => t.key === tab);

  // Anti-grind meter calculations
  const msgPct1 = Math.min(1, dailyMessages / MSG_BUCKET_1);
  const msgPct2 = Math.max(0, Math.min(1, (dailyMessages - MSG_BUCKET_1) / MSG_BUCKET_1));
  const currentRate = dailyMessages <= MSG_BUCKET_1 ? 100 : dailyMessages <= MSG_BUCKET_2 ? 50 : 0;
  const rateColor = currentRate === 100 ? '#34d399' : currentRate === 50 ? '#fbbf24' : '#f87171';

  // Simulate filter progress animation when in 'filtering' step
  useEffect(() => {
    if (stakeStep !== 'filtering') return;
    setFilterProgress(0);
    const t = setInterval(() => {
      setFilterProgress(p => {
        if (p >= 100) {
          clearInterval(t);
          setTimeout(() => setStakeStep('vote_queue'), 400);
          return 100;
        }
        return p + 3;
      });
    }, 60);
    return () => clearInterval(t);
  }, [stakeStep]);

  const handleStartStake = () => {
    setStakeOpen(true);
    setStakeStep('write');
    if(stakeStep==='live'||stakeStep==='rejected')setPromptText('');
    setFilterProgress(0);
  };

  const handleSubmitToFilter = () => {
    if (promptText.trim().length < 20) return;
    setStakeStep('filtering');
  };

  const handleConfirmStake = () => {
    if(xpBalance<STAKE_COST||stakeStep!=='vote_queue')return;
    setAuthored([...authored,{id:crypto.randomUUID(),text:promptText,status:'live',engagements:0,dividendEarned:0,staked:STAKE_COST,netXP:-STAKE_COST}]);
    setXpBalance(b => b - STAKE_COST);
    setStakeStep('live');
  };

  const handleSimReject = () => {
    setStakeStep('rejected');
  };

  const handleCloseStake = () => {
    setStakeOpen(false);
    setTimeout(() => { setStakeStep('write'); setPromptText(''); }, 300);
  };

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: '#15141d', fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
    >
      {/* ── Header ── */}
      <div
        className="flex-shrink-0 px-4 py-3 flex items-center gap-3"
        style={{ background: 'rgba(9,9,20,0.97)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <button onClick={onBack} className="p-1.5 rounded-full hover:bg-white/[0.08] transition-colors">
          <ArrowLeft className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.5)' }} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>XP Economy</p>
          <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.28)' }}>
            Device XP · Sample economy · No real purchases
          </p>
        </div>
        {/* Balance chip */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.22)' }}
        >
          <Star className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-sm font-bold font-mono text-amber-300">{xpBalance.toLocaleString()}</span>
        </div>
      </div>

      {/* ── Anti-Grind Bar ── */}
      <div
        className="flex-shrink-0 px-4 py-3"
        style={{ background: 'rgba(9,9,20,0.97)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.4)' }} />
            <span className="text-[11px] font-semibold" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Daily Message Budget
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: rateColor }} />
            <span className="text-[11px] font-bold font-mono" style={{ color: rateColor }}>{currentRate}% rate</span>
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>· {dailyMessages} msgs today</span>
          </div>
        </div>
        {/* Three-zone bar */}
        <div className="relative h-2 rounded-full overflow-hidden flex" style={{ background: 'rgba(255,255,255,0.06)' }}>
          {/* Zone 1: 0-50 = 100% */}
          <div className="w-1/2 h-full relative overflow-hidden">
            <motion.div
              className="h-full rounded-l-full"
              animate={{ width: `${msgPct1 * 100}%` }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{ background: 'linear-gradient(90deg, #34d399, #10b981)', boxShadow: '0 0 8px rgba(52,211,153,0.4)' }}
            />
          </div>
          {/* Zone 2: 50-100 = 50% */}
          <div className="w-1/4 h-full relative overflow-hidden">
            <motion.div
              className="h-full"
              animate={{ width: `${msgPct2 * 100}%` }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{ background: 'linear-gradient(90deg, #fbbf24, #f59e0b)', boxShadow: '0 0 8px rgba(251,191,36,0.4)' }}
            />
          </div>
          {/* Zone 3: 100+ = 0% (always empty unless capped) */}
          <div className="w-1/4 h-full" />
          {/* Dividers */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px" style={{ background: 'rgba(255,255,255,0.15)' }} />
          <div className="absolute left-3/4 top-0 bottom-0 w-px" style={{ background: 'rgba(255,255,255,0.15)' }} />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[9px] font-mono text-green-400">0–50 · 100%</span>
          <span className="text-[9px] font-mono text-amber-400">50–100 · 50%</span>
          <span className="text-[9px] font-mono text-red-400">100+ · 0%</span>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div
        className="flex-shrink-0 px-4 pt-3 pb-0"
        style={{ background: 'rgba(9,9,20,0.97)' }}
      >
        <div className="relative flex border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          {TABS.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="flex-1 flex flex-col items-center gap-1 pb-3 transition-colors"
            >
              <div className="flex items-center gap-1.5" style={{ color: tab === key ? '#fbbf24' : 'rgba(255,255,255,0.3)' }}>
                {icon}
                <span className="text-xs font-semibold">{label}</span>
              </div>
            </button>
          ))}
          <motion.div
            className="absolute bottom-0 h-0.5 rounded-full"
            animate={{ left: `${tabIdx * 33.333}%`, width: '33.333%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 360 }}
            style={{ background: 'linear-gradient(90deg, #d97706, #fbbf24)' }}
          />
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="flex-1 overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>
        <AnimatePresence mode="wait">

          {/* ─ EARN ─ */}
          {tab === 'earn' && (
            <motion.div
              key="earn"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="px-4 py-4 flex flex-col gap-3"
            >
              {/* Streak strip */}
              <div
                className="rounded-2xl px-4 py-3 flex items-center gap-3"
                style={{ background: 'rgba(234,88,12,0.10)', border: '1px solid rgba(234,88,12,0.22)' }}
              >
                <div className="flex gap-1">
                  {Array.from({ length: 7 }, (_, i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
                      style={{
                        background: i < streakDays ? 'rgba(234,88,12,0.25)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${i < streakDays ? 'rgba(234,88,12,0.4)' : 'rgba(255,255,255,0.07)'}`,
                      }}
                    >
                      {i < streakDays ? '🔥' : <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>}
                    </div>
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-orange-300">{streakDays}-day streak</p>
                  <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Caps at 7× · 2× active</p>
                </div>
              </div>

              {/* Anti-grind explanation */}
              <div
                className="rounded-xl px-4 py-3"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>Anti-Grind Rule:</span> XP is only awarded for the first 50 messages/day at full rate, 50% for the next 50, then nothing. Focus on quality — not volume.
                </p>
              </div>

              {/* Faucet cards */}
              {FAUCETS.map((f, i) => (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="rounded-2xl p-4"
                  style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${f.color}22` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: `${f.color}15`, border: `1px solid ${f.color}28` }}
                      >
                        {f.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.85)' }}>{f.label}</span>
                          <span
                            className="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded"
                            style={{ background: `${f.color}18`, color: f.color, border: `1px solid ${f.color}28` }}
                          >
                            {f.driver}
                          </span>
                        </div>
                        <p className="text-[11px] leading-relaxed mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>{f.desc}</p>
                      </div>
                    </div>
                    {f.recentXP !== null && (
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <div
                          className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }}
                        >
                          <span className="text-[11px] font-bold font-mono text-amber-300">+{f.recentXP}</span>
                        </div>
                        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>today</span>
                      </div>
                    )}
                  </div>
                  {/* Progress bar */}
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${f.progress * 100}%` }}
                        transition={{ delay: i * 0.07 + 0.25, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                        style={{ background: f.color, boxShadow: `0 0 6px ${f.color}55` }}
                      />
                    </div>
                    <span className="text-[10px] flex-shrink-0" style={{ color: `${f.color}cc` }}>{f.detail}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* ─ SPEND ─ */}
          {tab === 'spend' && (
            <motion.div
              key="spend"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="px-4 py-4 flex flex-col gap-3"
            >
              <div
                className="rounded-xl px-4 py-3"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  XP unlocks tangible <span style={{ color: 'rgba(255,255,255,0.6)' }}>social leverage</span>. To remain valuable, it must be spent on real influence — not cosmetic confetti.
                </p>
              </div>

              {SINKS.map((s, i) => {
                const owned=unlocked.includes(s.id);
                const canAfford = owned||xpBalance >= s.xp;
                return (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="rounded-2xl p-4"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: `1px solid ${canAfford ? s.color + '28' : 'rgba(255,255,255,0.06)'}`,
                      opacity: canAfford ? 1 : 0.7,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                        style={{ background: `${s.color}15`, border: `1px solid ${s.color}28` }}
                      >
                        {s.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.85)' }}>{s.label}</span>
                          <CostBadge cost={s.cost} xp={s.xp} />
                        </div>
                        <p className="text-[11px] leading-relaxed mt-1" style={{ color: 'rgba(255,255,255,0.38)' }}>{s.benefit}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      {!canAfford && (
                        <div className="flex items-center gap-1.5 flex-1">
                          <Lock className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.25)' }} />
                          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                            Need {(s.xp - xpBalance).toLocaleString()} more XP
                          </span>
                        </div>
                      )}
                      <button
                        onClick={()=>{if(!canAfford)return;if(s.id==='prompt'){setTab('bounty');handleStartStake();return;}if(!owned){setXpBalance(balance=>balance-s.xp);setUnlocked([...unlocked,s.id]);}if(s.id==='aesthetics')onEditIdentity?.();else onExploreRooms?.();}}
                        disabled={!canAfford}
                        className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                        style={{
                          background: canAfford ? `${s.color}20` : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${canAfford ? s.color + '35' : 'rgba(255,255,255,0.08)'}`,
                          color: canAfford ? s.color : 'rgba(255,255,255,0.25)',
                          cursor: canAfford ? 'pointer' : 'not-allowed',
                        }}
                      >
                        {s.id === 'prompt' ? 'Stake & Author' : owned?'Open':'Unlock'}
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* ─ BOUNTY ─ */}
          {tab === 'bounty' && (
            <motion.div
              key="bounty"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="px-4 py-4 flex flex-col gap-4"
            >
              {/* Economy diagram */}
              <div
                className="rounded-2xl p-4"
                style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <p className="text-xs font-bold text-amber-300">The Bounty Loop</p>
                </div>
                {[
                  { n: '1', title: 'Stake', desc: `Spend ${STAKE_COST.toLocaleString()} XP to enter your prompt in the queue.`, color: '#f59e0b' },
                  { n: '2', title: 'Filter & Vote', desc: 'AI screens for safety. Then blind community vote among high-rep users.', color: '#818cf8' },
                  { n: '3', title: 'Go Live or Lose', desc: 'Approved: earns dividends per engagement. Rejected: lose 20% of stake.', color: '#10b981' },
                ].map((step) => (
                  <div key={step.n} className="flex gap-3 mb-3 last:mb-0">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                      style={{ background: `${step.color}20`, border: `1px solid ${step.color}35`, color: step.color }}
                    >
                      {step.n}
                    </div>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.75)' }}>{step.title}</p>
                      <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Author CTA */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleStartStake}
                disabled={xpBalance < STAKE_COST}
                className="w-full py-4 rounded-2xl flex items-center justify-center gap-2.5 font-bold text-sm"
                style={{
                  background: xpBalance >= STAKE_COST
                    ? 'linear-gradient(135deg, rgba(180,120,0,0.30), rgba(245,158,11,0.15))'
                    : 'rgba(255,255,255,0.04)',
                  border: xpBalance >= STAKE_COST ? '1px solid rgba(245,158,11,0.35)' : '1px solid rgba(255,255,255,0.07)',
                  color: xpBalance >= STAKE_COST ? '#fbbf24' : 'rgba(255,255,255,0.2)',
                  cursor: xpBalance >= STAKE_COST ? 'pointer' : 'not-allowed',
                }}
              >
                {xpBalance >= STAKE_COST ? (
                  <>
                    <Crown className="w-4 h-4" />
                    Stake {STAKE_COST.toLocaleString()} XP · Author a Prompt
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Need {(STAKE_COST - xpBalance).toLocaleString()} more XP to stake
                  </>
                )}
              </motion.button>

              {/* Past authored prompts */}
              {AUTHORED.length > 0 && (
                <div>
                  <p className="text-xs font-bold mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>Your Authored Prompts</p>
                  <div className="flex flex-col gap-3">
                    {[...authored,...AUTHORED].map((p, i) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="rounded-2xl p-4"
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: p.status === 'live'
                            ? '1px solid rgba(16,185,129,0.25)'
                            : p.status === 'voting'
                            ? '1px solid rgba(129,140,248,0.2)'
                            : '1px solid rgba(248,113,113,0.2)',
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {p.status === 'live' ? (
                            <><CheckCircle className="w-3.5 h-3.5 text-green-400" /><span className="text-[11px] font-bold text-green-400">Live</span></>
                          ) : p.status === 'voting' ? (
                            <><Sparkles className="w-3.5 h-3.5 text-indigo-400" /><span className="text-[11px] font-bold text-indigo-400">Community Vote</span></>
                          ) : (
                            <><XCircle className="w-3.5 h-3.5 text-red-400" /><span className="text-[11px] font-bold text-red-400">Rejected</span></>
                          )}
                        </div>
                        <p className="text-xs leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,0.55)' }}>{p.text}</p>
                        {p.status === 'live' && (
                          <div className="flex gap-3">
                            <div
                              className="flex-1 rounded-xl px-3 py-2 text-center"
                              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}
                            >
                              <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Engagements</p>
                              <p className="text-sm font-bold font-mono text-green-400">{p.engagements.toLocaleString()}</p>
                            </div>
                            <div
                              className="flex-1 rounded-xl px-3 py-2 text-center"
                              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}
                            >
                              <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Net XP</p>
                              <p className="text-sm font-bold font-mono text-amber-400">+{p.netXP.toLocaleString()}</p>
                            </div>
                          </div>
                        )}
                        {p.status === 'voting' && (
                          <div
                            className="rounded-xl px-3 py-2 flex items-center gap-2"
                            style={{ background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.15)' }}
                          >
                            <Clock className="w-3 h-3 text-indigo-400" />
                            <span className="text-[11px] text-indigo-300">In blind voting queue · ~4h remaining</span>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── Staking Modal ── */}
      <AnimatePresence>
        {stakeOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col justify-end"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
              className="rounded-t-3xl overflow-hidden"
              style={{ background: '#0f0d1c', border: '1px solid rgba(255,255,255,0.08)', borderBottom: 'none' }}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <p className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>Author a Global Prompt</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    Stake {STAKE_COST.toLocaleString()} XP · risk {(STAKE_COST * REJECTION_PENALTY).toLocaleString()} on rejection
                  </p>
                </div>
                <button onClick={handleCloseStake} className="p-1.5 rounded-full hover:bg-white/[0.08]">
                  <XCircle className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.4)' }} />
                </button>
              </div>

              <div className="px-5 py-4">
                {/* Step: Write */}
                {stakeStep === 'write' && (
                  <motion.div key="write" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      Write a scenario prompt that will challenge, amuse, or move the community.
                      Specific beats generic. Conflict beats neutral.
                    </p>
                    <textarea
                      value={promptText}
                      onChange={e => setPromptText(e.target.value)}
                      placeholder="Your character just discovered…"
                      rows={4}
                      className="w-full resize-none rounded-2xl px-4 py-3 text-sm outline-none"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.85)',
                        fontFamily: '"Plus Jakarta Sans", sans-serif',
                      }}
                    />
                    <div className="flex items-center justify-between">
                      <span
                        className="text-[11px] font-mono"
                        style={{ color: promptText.length < 20 ? 'rgba(248,113,113,0.7)' : 'rgba(52,211,153,0.7)' }}
                      >
                        {promptText.length} chars {promptText.length < 20 ? `· ${20 - promptText.length} more needed` : '· ready'}
                      </span>
                      <button
                        onClick={handleSubmitToFilter}
                        disabled={promptText.trim().length < 20}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all"
                        style={{
                          background: promptText.length >= 20 ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${promptText.length >= 20 ? 'rgba(245,158,11,0.35)' : 'rgba(255,255,255,0.08)'}`,
                          color: promptText.length >= 20 ? '#fbbf24' : 'rgba(255,255,255,0.2)',
                          cursor: promptText.length >= 20 ? 'pointer' : 'not-allowed',
                        }}
                      >
                        Submit to Filter
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step: Filtering */}
                {stakeStep === 'filtering' && (
                  <motion.div key="filtering" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4 py-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(79,70,229,0.15)', border: '1px solid rgba(79,70,229,0.25)' }}
                      >
                        <Shield className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.8)' }}>AI Safety Filter</p>
                        <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Scanning for toxicity, policy violations…</p>
                      </div>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          width: `${filterProgress}%`,
                          background: 'linear-gradient(90deg, #8169ec, #818cf8)',
                          boxShadow: '0 0 10px rgba(129,140,248,0.5)',
                        }}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {['Toxicity · Clean', 'Hate Speech · Clear', 'Policy Compliance · Checking…'].map((check, i) => (
                        <div key={i} className="flex items-center gap-2">
                          {filterProgress > (i + 1) * 30 ? (
                            <CheckCircle className="w-3 h-3 text-green-400" />
                          ) : (
                            <div className="w-3 h-3 rounded-full border" style={{ borderColor: 'rgba(255,255,255,0.15)' }} />
                          )}
                          <span className="text-[11px]" style={{ color: filterProgress > (i + 1) * 30 ? 'rgba(52,211,153,0.8)' : 'rgba(255,255,255,0.3)' }}>
                            {check}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step: Vote queue — stake confirmation */}
                {stakeStep === 'vote_queue' && (
                  <motion.div key="vote_queue" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col gap-4">
                    <div
                      className="rounded-2xl px-4 py-3 flex items-center gap-3"
                      style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
                    >
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-green-400">AI Filter Passed</p>
                        <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Your prompt is ready for community blind vote.</p>
                      </div>
                    </div>
                    <div
                      className="rounded-2xl p-4"
                      style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.18)' }}
                    >
                      <p className="text-xs font-semibold text-amber-300 mb-2">Stake Summary</p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Stake amount</span>
                          <span className="text-[11px] font-bold font-mono text-amber-300">−{STAKE_COST.toLocaleString()} XP</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>If approved → goes live</span>
                          <span className="text-[11px] font-bold font-mono text-green-400">Earn dividends</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>If rejected for quality</span>
                          <span className="text-[11px] font-bold font-mono text-red-400">−{(STAKE_COST * REJECTION_PENALTY).toLocaleString()} XP lost</span>
                        </div>
                        <div className="h-px my-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
                        <div className="flex justify-between">
                          <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Balance after</span>
                          <span className="text-[11px] font-bold font-mono" style={{ color: 'rgba(255,255,255,0.65)' }}>
                            {(xpBalance - STAKE_COST).toLocaleString()} XP
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSimReject}
                        className="flex-1 py-3 rounded-xl text-xs font-semibold"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleConfirmStake}
                        className="flex-[2] py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                        style={{ background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.35)', color: '#fbbf24' }}
                      >
                        <Crown className="w-4 h-4" />
                        Confirm Stake
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step: Live */}
                {stakeStep === 'live' && (
                  <motion.div key="live" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col gap-4 py-2">
                    <div className="flex flex-col items-center gap-3 py-4 text-center">
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', damping: 14 }}
                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                        style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', boxShadow: '0 0 32px rgba(245,158,11,0.2)' }}
                      >
                        👑
                      </motion.div>
                      <div>
                        <p className="text-base font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>Prompt Submitted!</p>
                        <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          Entering blind community vote. If approved, it goes live tomorrow at the top of the deck.
                          Every engagement earns you a dividend.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleCloseStake}
                      className="w-full py-3 rounded-xl font-semibold text-sm"
                      style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.28)', color: '#fbbf24' }}
                    >
                      Back to Dashboard
                    </button>
                  </motion.div>
                )}

                {/* Step: Rejected */}
                {stakeStep === 'rejected' && (
                  <motion.div key="rejected" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col gap-4 py-2">
                    <div className="flex flex-col items-center gap-3 py-4 text-center">
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', damping: 14 }}
                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}
                      >
                        ❌
                      </motion.div>
                      <div>
                        <p className="text-base font-bold text-red-400">Prompt Rejected</p>
                        <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          Community voted it down for quality. You lost {(STAKE_COST * REJECTION_PENALTY).toLocaleString()} XP. Study successful prompts and try again.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleCloseStake}
                      className="w-full py-3 rounded-xl font-semibold text-sm"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
                    >
                      Close
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
