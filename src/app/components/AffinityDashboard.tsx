import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Zap, Users, Brain, Activity,
  TrendingUp, Star, MessageSquare, ChevronRight,
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer, Tooltip,
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────

interface AffinityDashboardProps {
  onBack: () => void;
  onFindPeople?:()=>void;
  onOpenGuild?:()=>void;
  onConnect?:(id:string)=>void;
}

type TabKey = 'fingerprint' | 'matches' | 'pulse';

// ─── Data ─────────────────────────────────────────────────────

const RADAR_DATA = [
  { axis: 'Thematic Depth',  score: 78, fullMark: 100 },
  { axis: 'Chaos Tolerance', score: 45, fullMark: 100 },
  { axis: 'Narrative Pull',  score: 88, fullMark: 100 },
  { axis: 'Empathy Signal',  score: 62, fullMark: 100 },
  { axis: 'Debate Drive',    score: 35, fullMark: 100 },
  { axis: 'Creative Energy', score: 91, fullMark: 100 },
];

interface GuildMatch {
  id: string;
  name: string;
  emoji: string;
  color: string;
  sim: number;       // cosine similarity %
  centroid: string;  // dominant axis
  members: number;
  desc: string;
  online: number;
}

const GUILD_MATCHES: GuildMatch[] = [
  {
    id: 'g1', name: 'Cosmos Lounge', emoji: '🌙',
    color: '#8169ec', sim: 94,
    centroid: 'Narrative Pull', members: 142, online: 18,
    desc: 'Astrology, fate, and soft apocalypse roleplay.',
  },
  {
    id: 'g2', name: 'Creative Lab', emoji: '🌶️',
    color: '#ea580c', sim: 87,
    centroid: 'Chaos Tolerance', members: 234, online: 23,
    desc: 'Bollywood debates, unfiltered hot takes.',
  },
  {
    id: 'g3', name: 'Sanctuary', emoji: '🫧',
    color: '#0891b2', sim: 82,
    centroid: 'Empathy Signal', members: 61, online: 7,
    desc: 'Slow conversation, vulnerability first.',
  },
  {
    id: 'g4', name: 'Circuit Guild', emoji: '⚡',
    color: '#8169ec', sim: 76,
    centroid: 'Debate Drive', members: 198, online: 41,
    desc: 'Tech discourse, contrarian welcome.',
  },
  {
    id: 'g5', name: 'Cricket Pavilion', emoji: '🏏',
    color: '#16a34a', sim: 68,
    centroid: 'Thematic Depth', members: 87, online: 34,
    desc: 'Sport, leadership, post-match rhetoric.',
  },
];

interface WhisperSuggestion {
  id: string;
  handle: string;
  avatar: string;
  type: 'mentor' | 'rival';
  tagline: string;
  topAxis: string;
  complement: number;  // match %
  lastSeen: string;
  color: string;
}

const WHISPERS: WhisperSuggestion[] = [
  {
    id: '2', handle: 'MoonlightSage', avatar: '🔮', type: 'mentor',
    tagline: 'Their Narrative Pull and Empathy pair with your gaps.',
    topAxis: 'Empathy Signal → 96', complement: 91,
    lastSeen: '2m ago', color: '#8169ec',
  },
  {
    id: '5', handle: 'VoidArchitect', avatar: '🐉', type: 'rival',
    tagline: 'Orthogonal vector. Expect friction. Expect growth.',
    topAxis: 'Debate Drive → 88', complement: 63,
    lastSeen: '11m ago', color: '#ef4444',
  },
];

interface PulseAction {
  label: string;
  emoji: string;
  weight: number;   // recency-weighted contribution 0–100
  raw: number;      // raw count in 48h
  delta: number;    // +/- shift
  color: string;
}

const PULSE_ACTIONS: PulseAction[] = [
  { label: 'Narrative Responses', emoji: '📖', weight: 92, raw: 17, delta: +14, color: '#818cf8' },
  { label: 'Hot Takes Voted',      emoji: '🔥', weight: 67, raw: 11, delta: -4,  color: '#f87171' },
  { label: 'Empathy Reactions',    emoji: '💙', weight: 78, raw: 9,  delta: +6,  color: '#38bdf8' },
  { label: 'Debate Entries',       emoji: '⚔️', weight: 28, raw: 3,  delta: -2,  color: '#fb923c' },
  { label: 'Lore Pins',           emoji: '🪬', weight: 55, raw: 4,  delta: +3,  color: '#f59e0b' },
  { label: 'Mood Check-ins',       emoji: '🌙', weight: 41, raw: 6,  delta: +1,  color: '#a78bfa' },
];

const VECTOR_SHIFT = '+0.07 toward Narrative';

// ─── Custom Radar Tooltip ──────────────────────────────────────

function RadarTip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div
      className="px-3 py-2 rounded-xl text-xs font-semibold"
      style={{ background: 'rgba(20,18,38,0.96)', border: '1px solid rgba(129,140,248,0.3)', color: '#c7d2fe' }}
    >
      {d?.axis}: <span className="text-indigo-300">{d?.score}</span>
    </div>
  );
}

// ─── Tab bar ──────────────────────────────────────────────────

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'fingerprint', label: 'Fingerprint', icon: <Brain className="w-3.5 h-3.5" /> },
  { key: 'matches',     label: 'Matches',     icon: <Users  className="w-3.5 h-3.5" /> },
  { key: 'pulse',       label: 'Pulse',       icon: <Activity className="w-3.5 h-3.5" /> },
];

// ─── Component ────────────────────────────────────────────────

export function AffinityDashboard({ onBack,onFindPeople,onOpenGuild,onConnect }: AffinityDashboardProps) {
  const [tab, setTab] = useState<TabKey>('fingerprint');

  const tabIdx = TABS.findIndex(t => t.key === tab);

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
          <p className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>Affinity Engine</p>
          <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.28)' }}>
            ANN · Cosine Similarity · Centroid Match
          </p>
        </div>
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(79,70,229,0.15)', border: '1px solid rgba(79,70,229,0.25)' }}
        >
          <Zap className="w-3 h-3 text-indigo-400" />
          <span className="text-xs font-mono text-indigo-300">2,840 XP</span>
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
              <div className="flex items-center gap-1.5" style={{ color: tab === key ? '#818cf8' : 'rgba(255,255,255,0.3)' }}>
                {icon}
                <span className="text-xs font-semibold">{label}</span>
              </div>
            </button>
          ))}
          {/* sliding underline */}
          <motion.div
            className="absolute bottom-0 h-0.5 rounded-full"
            animate={{ left: `${tabIdx * 33.333}%`, width: '33.333%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 360 }}
            style={{ background: 'linear-gradient(90deg, #8169ec, #818cf8)' }}
          />
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="flex-1 overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>
        <AnimatePresence mode="wait">
          {tab === 'fingerprint' && (
            <motion.div
              key="fingerprint"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="px-4 py-4 flex flex-col gap-5"
            >
              {/* Radar */}
              <div
                className="rounded-2xl p-4"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Brain className="w-4 h-4 text-indigo-400" />
                  <p className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.75)' }}>Affinity Fingerprint</p>
                </div>
                <p className="text-[11px] mb-4" style={{ color: 'rgba(255,255,255,0.28)' }}>
                  High-dimensional vector across 6 axes · updated on every interaction
                </p>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={RADAR_DATA} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                    <PolarGrid stroke="rgba(255,255,255,0.07)" />
                    <PolarAngleAxis
                      dataKey="axis"
                      tick={{ fill: 'rgba(255,255,255,0.42)', fontSize: 10, fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 600 }}
                    />
                    <PolarRadiusAxis
                      domain={[0, 100]} tick={false} axisLine={false}
                    />
                    <Radar
                      name="You"
                      dataKey="score"
                      stroke="#818cf8"
                      fill="#8169ec"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Tooltip content={<RadarTip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Axis breakdown cards */}
              <div className="grid grid-cols-2 gap-2.5">
                {RADAR_DATA.map(({ axis, score }) => {
                  const bar = score / 100;
                  const col = score > 75 ? '#818cf8' : score > 50 ? '#38bdf8' : 'rgba(255,255,255,0.25)';
                  return (
                    <div
                      key={axis}
                      className="rounded-xl px-3 py-2.5"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[10px] font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>{axis}</p>
                        <p className="text-[11px] font-bold font-mono" style={{ color: col }}>{score}</p>
                      </div>
                      <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${bar * 100}%`, background: col, boxShadow: `0 0 8px ${col}44` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Vector metadata */}
              <div
                className="rounded-xl px-4 py-3 flex items-center gap-3"
                style={{ background: 'rgba(79,70,229,0.08)', border: '1px solid rgba(79,70,229,0.18)' }}
              >
                <TrendingUp className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-indigo-300">Recency shift</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Vector moved <span className="text-indigo-300 font-bold">{VECTOR_SHIFT}</span> in the last 48h
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {tab === 'matches' && (
            <motion.div
              key="matches"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="px-4 py-4 flex flex-col gap-6"
            >
              {/* Guild centroid matches */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.6)' }}>Guild Centroid Matches</p>
                  <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>ANN cosine distance</p>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                  {GUILD_MATCHES.map((g, i) => (
                    <motion.div
                      key={g.id}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="flex-shrink-0 rounded-2xl p-4 flex flex-col gap-3"
                      style={{
                        width: '180px',
                        background: `${g.color}0f`,
                        border: `1px solid ${g.color}28`,
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-2xl">{g.emoji}</span>
                        <div
                          className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                          style={{ background: `${g.color}1a`, border: `1px solid ${g.color}30` }}
                        >
                          <span className="text-[11px] font-bold font-mono" style={{ color: g.color }}>{g.sim}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.85)' }}>{g.name}</p>
                        <p className="text-[11px] leading-relaxed mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>{g.desc}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Brain className="w-2.5 h-2.5 flex-shrink-0" style={{ color: `${g.color}aa` }} />
                          <p className="text-[10px]" style={{ color: `${g.color}bb` }}>Centroid: {g.centroid}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-2.5 h-2.5 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.28)' }} />
                          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.28)' }}>{g.online} online · {g.members} total</p>
                        </div>
                      </div>
                      <button className="mobile-text-button" onClick={onOpenGuild}>Open guild <ChevronRight size={15}/></button>
                      {/* similarity bar */}
                      <div className="h-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${g.sim}%`, background: g.color, boxShadow: `0 0 6px ${g.color}55` }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  Whispers
                </p>
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
              </div>

              <button className="mobile-primary-button" onClick={onFindPeople}>Find people by interests</button>
              {/* Whisper suggestions */}
              <div className="flex flex-col gap-3">
                <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.28)' }}>
                  Complementary affinity — users whose vectors fill your gaps, not mirror them.
                </p>
                {WHISPERS.map((w, i) => (
                  <motion.div
                    key={w.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 + 0.1 }}
                    className="rounded-2xl p-4 flex items-center gap-4"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: `1px solid ${w.color}25`,
                    }}
                  >
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: `${w.color}18`, border: `1px solid ${w.color}30` }}
                    >
                      {w.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.85)' }}>{w.handle}</span>
                        <span
                          className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                          style={{
                            background: `${w.color}18`,
                            border: `1px solid ${w.color}30`,
                            color: w.color,
                          }}
                        >
                          {w.type}
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{w.tagline}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[10px] font-mono" style={{ color: `${w.color}cc` }}>{w.topAxis}</span>
                        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
                        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{w.lastSeen}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-sm font-bold font-mono" style={{ color: w.color }}>{w.complement}%</span>
                      <button className="mobile-text-button" aria-label={`Chat with ${w.handle}`} onClick={()=>onConnect?.(w.id)}><MessageSquare size={18}/></button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {tab === 'pulse' && (
            <motion.div
              key="pulse"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="px-4 py-4 flex flex-col gap-5"
            >
              {/* Vector shift callout */}
              <div
                className="rounded-xl px-4 py-3 flex items-center gap-3"
                style={{ background: 'rgba(79,70,229,0.1)', border: '1px solid rgba(79,70,229,0.22)' }}
              >
                <TrendingUp className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-indigo-300">Vector shift · last 48h</p>
                  <p className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.75)' }}>{VECTOR_SHIFT}</p>
                </div>
              </div>

              {/* Recency-weighted bars */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.6)' }}>Recency Weights</p>
                  <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>exponential decay λ=0.8</p>
                </div>
                <div className="flex flex-col gap-3">
                  {PULSE_ACTIONS.map((a, i) => (
                    <motion.div
                      key={a.label}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="rounded-xl px-3 py-3"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{a.emoji}</span>
                          <p className="text-[11px] font-semibold" style={{ color: 'rgba(255,255,255,0.65)' }}>{a.label}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[10px] font-bold"
                            style={{ color: a.delta > 0 ? '#34d399' : '#f87171' }}
                          >
                            {a.delta > 0 ? '+' : ''}{a.delta}
                          </span>
                          <span className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>
                            ×{a.raw}
                          </span>
                          <span className="text-xs font-bold font-mono" style={{ color: a.color }}>{a.weight}</span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <motion.div
                          className="h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${a.weight}%` }}
                          transition={{ delay: i * 0.06 + 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                          style={{ background: a.color, boxShadow: `0 0 8px ${a.color}44` }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Timeline note */}
              <div
                className="rounded-xl px-4 py-3"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Weights halve every 24 hours. Your vector naturally drifts toward your most active recent behaviours.
                  Long-term identity anchors persist at 20% base weight.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
