import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Lock, Unlock, Shield, Users, Fingerprint,
  Key, Smartphone, Globe, Clock, CheckCircle2, AlertCircle,
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface TrustProfileProps {
  onBack: () => void;
}

// ─── Generative Aura ──────────────────────────────────────────

function AuraRing({ level }: { level: 1 | 2 | 3 | 4 }) {
  const cx = 80, cy = 80;
  function ringDots(r: number, n: number, dotR: number, color: string) {
    return Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      return <circle key={i} cx={cx + Math.cos(a) * r} cy={cy + Math.sin(a) * r} r={dotR} fill={color} />;
    });
  }
  function polygon(r: number, sides: number): string {
    return Array.from({ length: sides }, (_, i) => {
      const a = (i / sides) * Math.PI * 2 - Math.PI / 2;
      return `${i === 0 ? 'M' : 'L'} ${(cx + Math.cos(a) * r).toFixed(2)} ${(cy + Math.sin(a) * r).toFixed(2)}`;
    }).join(' ') + ' Z';
  }

  return (
    <div className="relative" style={{ width: 160, height: 160, flexShrink: 0 }}>
      <style>{`
        @keyframes aura-cw  { from { transform: rotate(0deg);    } to { transform: rotate(360deg);  } }
        @keyframes aura-ccw { from { transform: rotate(0deg);    } to { transform: rotate(-360deg); } }
        .aura-r1 { animation: aura-cw  24s linear infinite; transform-origin: 80px 80px; }
        .aura-r2 { animation: aura-ccw 38s linear infinite; transform-origin: 80px 80px; }
        .aura-r3 { animation: aura-cw  16s linear infinite; transform-origin: 80px 80px; }
        .aura-r4 { animation: aura-ccw 56s linear infinite; transform-origin: 80px 80px; }
      `}</style>
      <svg width="160" height="160" viewBox="0 0 160 160" overflow="visible">
        <defs>
          <radialGradient id="avatarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8169ec" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#8169ec" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="centerGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="100%" stopColor="#0f0e1a" />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={44} fill="url(#avatarGlow)" />
        {level >= 4 && (
          <g className="aura-r1">
            <circle cx={cx} cy={cy} r={72} stroke="rgba(129,140,248,0.18)" strokeWidth="0.75" fill="none" />
            <path d={polygon(72, 12)} stroke="rgba(129,140,248,0.12)" strokeWidth="0.5" fill="none" />
            {ringDots(72, 12, 2, 'rgba(129,140,248,0.5)')}
          </g>
        )}
        {level >= 3 && (
          <g className="aura-r2">
            <path d={polygon(58, 8)} stroke="rgba(99,102,241,0.35)" strokeWidth="1" fill="none" />
            {ringDots(58, 8, 2.5, 'rgba(99,102,241,0.55)')}
          </g>
        )}
        {level >= 2 && (
          <g className="aura-r3">
            <circle cx={cx} cy={cy} r={46} stroke="rgba(129,140,248,0.40)" strokeWidth="1.5" strokeDasharray="4 6" fill="none" />
            {ringDots(46, 6, 2, 'rgba(167,139,250,0.6)')}
          </g>
        )}
        <g className={level >= 2 ? 'aura-r4' : ''}>
          <path d={polygon(34, 4)} stroke="rgba(99,102,241,0.5)" strokeWidth="1.25" fill="none" />
          {ringDots(34, 4, 2, 'rgba(99,102,241,0.7)')}
        </g>
        <circle cx={cx} cy={cy} r={28} stroke="rgba(129,140,248,0.6)" strokeWidth={level === 4 ? 1.5 : 1} fill="none" />
        <circle cx={cx} cy={cy} r={26} fill="url(#centerGrad)" stroke="rgba(129,140,248,0.35)" strokeWidth="1" />
        <text x={cx} y={cy + 8} textAnchor="middle" fontSize="22" dominantBaseline="auto">👻</text>
      </svg>
    </div>
  );
}

// ─── Roots Network Graph ──────────────────────────────────────

interface VoucherNode {
  id: string; x: number; y: number;
  handle: string; months: number; tier: 'Highly Trusted' | 'Trusted' | 'Rising';
}
interface SecondaryNode { x: number; y: number; from: string; months: number; }

const CX = 150, CY = 100;

const VOUCHERS: VoucherNode[] = [
  { id: 'v1', x: 60,  y: 40,  handle: 'AstroMaven',   months: 14, tier: 'Highly Trusted' },
  { id: 'v2', x: 248, y: 48,  handle: 'Cipher_9',     months: 18, tier: 'Highly Trusted' },
  { id: 'v3', x: 272, y: 118, handle: 'NightOwl_7',   months: 8,  tier: 'Trusted'        },
  { id: 'v4', x: 202, y: 174, handle: 'ZephyrVoice',  months: 11, tier: 'Trusted'        },
  { id: 'v5', x: 74,  y: 170, handle: 'MysticScribe', months: 6,  tier: 'Rising'         },
  { id: 'v6', x: 28,  y: 116, handle: 'DragonMask_K', months: 3,  tier: 'Rising'         },
];

const SECONDARY: SecondaryNode[] = [
  { x: 24,  y: 14,  from: 'v1', months: 22 },
  { x: 290, y: 18,  from: 'v2', months: 26 },
  { x: 298, y: 148, from: 'v3', months: 10 },
  { x: 234, y: 194, from: 'v4', months: 14 },
];

function lineW(months: number) {
  if (months >= 12) return 4.5;
  if (months >= 6)  return 3;
  if (months >= 3)  return 2;
  return 1.5;
}
function tierColor(t: VoucherNode['tier']) {
  return t === 'Highly Trusted' ? '#818cf8' : t === 'Trusted' ? '#4ade80' : '#94a3b8';
}

function RootsGraph() {
  const [hovered, setHovered] = useState<string | null>(null);
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.65)' }}>Roots</span>
        </div>
        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>Line thickness = relationship age</span>
      </div>
      <svg viewBox="0 0 310 220" width="100%" style={{ display: 'block' }}>
        {SECONDARY.map((s, i) => {
          const from = VOUCHERS.find(v => v.id === s.from)!;
          return <line key={i} x1={from.x} y1={from.y} x2={s.x} y2={s.y} stroke="rgba(255,255,255,0.10)" strokeWidth={lineW(s.months)} strokeLinecap="round" />;
        })}
        {SECONDARY.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={5} fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.18)" strokeWidth="0.75" />
        ))}
        {VOUCHERS.map(v => (
          <line key={v.id} x1={CX} y1={CY} x2={v.x} y2={v.y}
            stroke={hovered === v.id ? tierColor(v.tier) : 'rgba(129,140,248,0.28)'}
            strokeWidth={lineW(v.months)} strokeLinecap="round" style={{ transition: 'stroke 0.2s' }} />
        ))}
        <circle cx={CX} cy={CY} r={18} fill="rgba(79,70,229,0.25)" stroke="rgba(129,140,248,0.5)" strokeWidth="1.5" />
        <text x={CX} y={CY + 5} textAnchor="middle" fontSize="13" dominantBaseline="auto">👻</text>
        {VOUCHERS.map(v => (
          <g key={v.id} onMouseEnter={() => setHovered(v.id)} onMouseLeave={() => setHovered(null)} style={{ cursor: 'pointer' }}>
            <circle cx={v.x} cy={v.y} r={13}
              fill={hovered === v.id ? `${tierColor(v.tier)}25` : 'rgba(255,255,255,0.05)'}
              stroke={tierColor(v.tier)} strokeWidth={hovered === v.id ? 1.5 : 1}
              style={{ transition: 'all 0.2s' }} />
            <text x={v.x} y={v.y + 4} textAnchor="middle" fontSize="10" dominantBaseline="auto"
              style={{ fill: 'rgba(255,255,255,0.7)', fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 600, fontSize: '8px' }}>
              {v.handle.slice(0, 7)}
            </text>
            {hovered === v.id && (
              <text x={v.x} y={v.y - 18} textAnchor="middle" fontSize="8" style={{ fill: tierColor(v.tier), fontFamily: 'monospace' }}>
                {v.months}mo
              </text>
            )}
          </g>
        ))}
      </svg>
      <div className="px-4 pb-4 flex gap-4">
        {(['Highly Trusted', 'Trusted', 'Rising'] as const).map(t => (
          <div key={t} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: tierColor(t) }} />
            <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Heat Sparkline ───────────────────────────────────────────

const HEAT_HISTORY = [22,18,35,44,55,62,48,30,25,38,52,67,71,58,45,35,28,20,15,24,38,55,62,48,35,28,22,18,25,32];

function HeatSparkline() {
  const W = 280, H = 60;
  const pts = HEAT_HISTORY.map((v, i) => [
    (i / (HEAT_HISTORY.length - 1)) * W,
    H - (v / 100) * H * 0.85 - 4,
  ]);
  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const areaPath = linePath + ` L ${W} ${H} L 0 ${H} Z`;
  const avg = Math.round(HEAT_HISTORY.reduce((a, b) => a + b, 0) / HEAT_HISTORY.length);
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>30-day volatility</span>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: avg > 55 ? '#ef4444' : avg > 35 ? '#f59e0b' : '#10b981' }} />
          <span className="text-[11px] font-mono font-bold" style={{ color: avg > 55 ? '#ef4444' : avg > 35 ? '#f59e0b' : '#10b981' }}>
            avg {avg} — {avg > 55 ? 'Chaotic' : avg > 35 ? 'Moderate' : 'Chill'}
          </span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="60" style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#sparkGrad)" />
        <path d={linePath} stroke="#f59e0b" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
        <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={3} fill="#f59e0b" />
      </svg>
      <div className="flex justify-between mt-1">
        <span className="text-[9px] font-mono" style={{ color: 'rgba(255,255,255,0.2)' }}>30d ago</span>
        <span className="text-[9px] font-mono" style={{ color: 'rgba(255,255,255,0.2)' }}>today</span>
      </div>
    </div>
  );
}

// ─── Archetypes ───────────────────────────────────────────────

const ARCHETYPES = [
  { id: 'anchor',   label: 'The Anchor',   emoji: '⚓', desc: 'High volume of successful counseling handoffs from Heat Meter. Signals emotional stability.', color: '#0891b2' },
  { id: 'catalyst', label: 'The Catalyst', emoji: '⚡', desc: 'Authored multiple high-engagement Global Prompts. Signals creative leadership.',             color: '#f59e0b' },
  { id: 'keystone', label: 'The Keystone', emoji: '🏛️', desc: 'Vouched for by 5+ users in the Highly Trusted tier. Signals structural reliability.',         color: '#8169ec' },
];

// ─── Scenario Mapping Graph ───────────────────────────────────

const SCENARIO_AXES = [
  { axis: 'Roleplay',      full: 'Roleplay',      value: 82, fill: 82 },
  { axis: 'Introspect',    full: 'Introspection', value: 65, fill: 65 },
  { axis: 'Hot Takes',     full: 'Hot Takes',     value: 78, fill: 78 },
  { axis: 'Creativity',    full: 'Creativity',    value: 90, fill: 90 },
  { axis: 'Social',        full: 'Social',        value: 55, fill: 55 },
  { axis: 'Narrative',     full: 'Narrative',     value: 73, fill: 73 },
];

const WEEKLY_ACTIVITY = [
  { week: 'W1', Chill: 2, Deep: 3, Chaotic: 4 },
  { week: 'W2', Chill: 1, Deep: 5, Chaotic: 2 },
  { week: 'W3', Chill: 4, Deep: 2, Chaotic: 6 },
  { week: 'W4', Chill: 3, Deep: 4, Chaotic: 3 },
];

const SCENARIO_STATS = [
  { label: 'Total Played', value: '47', icon: '🎴' },
  { label: 'Avg XP / card', value: '218', icon: '⭐' },
  { label: 'Top Category', value: 'Cricket', icon: '🏏' },
];

type ScenarioTab = 'radar' | 'activity';

function ScenarioMapSection() {
  const [tab, setTab] = useState<ScenarioTab>('radar');
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.75)' }}>Scenario Mapping</p>
          <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.28)' }}>How you engage with scenarios</p>
        </div>
        {/* Tab toggle */}
        <div className="flex rounded-xl p-0.5" style={{ background: 'rgba(255,255,255,0.05)' }}>
          {(['radar', 'activity'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all"
              style={{
                background: tab === t ? 'rgba(99,102,241,0.25)' : 'transparent',
                color: tab === t ? '#a5b4fc' : 'rgba(255,255,255,0.3)',
                border: tab === t ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
              }}>
              {t === 'radar' ? 'Skills' : 'Activity'}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {tab === 'radar' ? (
          <motion.div key="radar" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.18 }}>
            {/* Radar chart */}
            <div style={{ width: '100%', height: 210 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={SCENARIO_AXES} cx="50%" cy="50%" outerRadius={72} margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" radialLines={true} />
                  <PolarAngleAxis
                    dataKey="axis"
                    tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 9, fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 600 }}
                    tickLine={false}
                  />
                  <Radar
                    dataKey="value"
                    stroke="#818cf8"
                    fill="#6366f1"
                    fillOpacity={0.18}
                    strokeWidth={1.8}
                    dot={{ fill: '#a5b4fc', r: 3.5, strokeWidth: 0 }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            {/* Axis legend */}
            <div className="px-4 pb-4 grid grid-cols-3 gap-x-2 gap-y-2">
              {SCENARIO_AXES.map(a => (
                <div key={a.axis} className="flex items-center gap-1.5">
                  <div className="h-1 w-4 rounded-full flex-shrink-0"
                    style={{ background: `rgba(99,102,241,${0.3 + (a.value / 100) * 0.7})` }} />
                  <span className="text-[9px] truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{a.full}</span>
                  <span className="text-[9px] font-mono ml-auto flex-shrink-0" style={{ color: '#818cf8' }}>{a.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="activity" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.18 }}>
            {/* Stacked bar chart */}
            <div style={{ width: '100%', height: 140 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={WEEKLY_ACTIVITY} margin={{ top: 8, right: 16, bottom: 0, left: -20 }} barSize={20}>
                  <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="week" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 11, color: 'rgba(255,255,255,0.7)' }}
                    cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  />
                  <Bar dataKey="Chill"   stackId="a" fill="#34d399" />
                  <Bar dataKey="Deep"    stackId="a" fill="#818cf8" />
                  <Bar dataKey="Chaotic" stackId="a" fill="#f87171" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="px-4 pb-4 pt-3 flex gap-4">
              {[['Chill', '#34d399'], ['Deep', '#818cf8'], ['Chaotic', '#f87171']].map(([label, color]) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: color }} />
                  <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats row */}
      <div className="mx-4 mb-4 grid grid-cols-3 gap-2 pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {SCENARIO_STATS.map(s => (
          <div key={s.label} className="rounded-xl p-2.5 text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <p className="text-base mb-1">{s.icon}</p>
            <p className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.82)' }}>{s.value}</p>
            <p className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.28)' }}>{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Digital Footprint & Authentication ───────────────────────

const AUTH_METHODS = [
  { icon: Key,         label: 'Passkey',           detail: 'Touch ID bound', status: 'active',  color: '#10b981' },
  { icon: Fingerprint, label: 'Biometric',          detail: 'Face + Touch',   status: 'active',  color: '#10b981' },
  { icon: Shield,      label: 'Zero-Knowledge',     detail: 'ZKP identity',   status: 'enabled', color: '#818cf8' },
  { icon: Smartphone,  label: 'Device Pin',         detail: 'Backup method',  status: 'backup',  color: '#f59e0b' },
];

const RECENT_SESSIONS = [
  { time: '2h ago',  region: 'IN-MH', device: '📱 Mobile',  risk: 'low'  },
  { time: '1d ago',  region: 'IN-MH', device: '📱 Mobile',  risk: 'low'  },
  { time: '3d ago',  region: 'IN-DL', device: '🌐 Web',     risk: 'low'  },
  { time: '5d ago',  region: 'IN-MH', device: '📱 Mobile',  risk: 'low'  },
  { time: '1w ago',  region: 'IN-KA', device: '💻 Tablet',  risk: 'low'  },
];

const FOOTPRINT_METRICS = [
  { label: 'PII stored',         value: 'None',   good: true  },
  { label: 'Chat logs',          value: 'E2E',    good: true  },
  { label: 'Metadata export',    value: 'On',     good: true  },
  { label: 'Ad profile',         value: 'Off',    good: true  },
  { label: 'Third-party share',  value: 'Never',  good: true  },
  { label: 'Account deletable',  value: 'Yes',    good: true  },
];

function DigitalFootprintSection() {
  const [showSessions, setShowSessions] = useState(false);
  return (
    <div className="flex flex-col gap-3">
      {/* Identity badge */}
      <div className="rounded-2xl p-4 flex items-center gap-3"
        style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.12), rgba(124,58,237,0.06))', border: '1px solid rgba(99,102,241,0.2)' }}>
        <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(79,70,229,0.22)', border: '1px solid rgba(99,102,241,0.35)', boxShadow: '0 0 16px rgba(79,70,229,0.3)' }}>
          <Shield className="w-5 h-5" style={{ color: '#a5b4fc' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold" style={{ color: '#a5b4fc' }}>Anonymous · Cryptographically Verified</p>
          <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>ZKP proof anchored · No PII linked</p>
        </div>
        <div className="flex-shrink-0 flex flex-col items-end gap-1">
          <CheckCircle2 className="w-4 h-4" style={{ color: '#34d399' }} />
          <span className="text-[9px] font-mono" style={{ color: '#34d399' }}>VERIFIED</span>
        </div>
      </div>

      {/* Auth methods */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="px-4 pt-3.5 pb-2 text-[11px] font-bold" style={{ color: 'rgba(255,255,255,0.45)' }}>Authentication Methods</p>
        <div className="px-3 pb-3 grid grid-cols-2 gap-2">
          {AUTH_METHODS.map(m => {
            const Icon = m.icon;
            const statusColor = m.status === 'active' ? '#34d399' : m.status === 'enabled' ? '#818cf8' : '#f59e0b';
            return (
              <div key={m.label} className="rounded-xl p-3 flex items-center gap-2.5"
                style={{ background: `${m.color}0a`, border: `1px solid ${m.color}20` }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: `${m.color}18` }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: m.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold truncate" style={{ color: 'rgba(255,255,255,0.75)' }}>{m.label}</p>
                  <p className="text-[9px] truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>{m.detail}</p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor, boxShadow: `0 0 4px ${statusColor}` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent sessions */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <button className="w-full px-4 pt-3.5 pb-3 flex items-center justify-between" onClick={() => setShowSessions(s => !s)}>
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.35)' }} />
            <span className="text-[11px] font-bold" style={{ color: 'rgba(255,255,255,0.45)' }}>Recent Sessions</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-mono" style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399' }}>5 clean</span>
          </div>
          <motion.div animate={{ rotate: showSessions ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 4L6 8L10 4" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </motion.div>
        </button>
        <AnimatePresence>
          {showSessions && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
              <div className="px-3 pb-3 flex flex-col gap-2">
                {RECENT_SESSIONS.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(52,211,153,0.1)' }}>
                      <Clock className="w-3 h-3" style={{ color: '#34d399' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold" style={{ color: 'rgba(255,255,255,0.65)' }}>{s.device}</p>
                      <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.28)' }}>Region: {s.region} · {s.time}</p>
                    </div>
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#34d399' }} />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footprint metrics grid */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="px-4 pt-3.5 pb-2 text-[11px] font-bold" style={{ color: 'rgba(255,255,255,0.45)' }}>Data Minimization Status</p>
        <div className="px-3 pb-3 grid grid-cols-2 gap-1.5">
          {FOOTPRINT_METRICS.map(m => (
            <div key={m.label} className="flex items-center justify-between px-3 py-2 rounded-lg"
              style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.1)' }}>
              <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{m.label}</span>
              <span className="text-[10px] font-bold font-mono" style={{ color: '#34d399' }}>{m.value}</span>
            </div>
          ))}
        </div>
        <div className="px-4 pb-4 flex items-center gap-2">
          <AlertCircle className="w-3 h-3 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.18)' }} />
          <p className="text-[9px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.2)' }}>
            IPFS-anchored identity · All data deletable from Settings · No third-party data brokers
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────

export function TrustProfile({ onBack }: TrustProfileProps) {
  const [heatUnlocked, setHeatUnlocked] = useState(false);

  return (
    <div className="h-screen flex flex-col overflow-hidden"
      style={{ background: '#15141d', fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>

      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 flex items-center gap-3"
        style={{ background: 'rgba(9,9,20,0.97)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={onBack} className="p-1.5 rounded-full hover:bg-white/[0.08] transition-colors">
          <ArrowLeft className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.5)' }} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>Trust Profile</p>
          <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.28)' }}>Reputation · Roots · Vouch History</p>
        </div>
        <div className="px-2.5 py-1 rounded-full text-[10px] font-bold"
          style={{ background: 'rgba(79,70,229,0.18)', border: '1px solid rgba(79,70,229,0.3)', color: '#a5b4fc' }}>
          Highly Trusted
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-5" style={{ overscrollBehavior: 'contain' }}>

        {/* Aura + Identity */}
        <div className="flex flex-col items-center gap-2">
          <AuraRing level={4} />
          <p className="text-lg font-bold mt-1" style={{ color: 'rgba(255,255,255,0.9)' }}>GhostWriter_Z</p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Member since Jan 2023 · 847 days</p>
          <div className="mt-1 flex items-center gap-3 px-4 py-2 rounded-full"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {[1, 2, 3, 4].map(l => (
              <div key={l} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full border"
                  style={{ background: l <= 4 ? 'rgba(79,70,229,0.4)' : 'transparent', borderColor: l <= 4 ? 'rgba(129,140,248,0.6)' : 'rgba(255,255,255,0.15)', boxShadow: l === 4 ? '0 0 6px rgba(79,70,229,0.6)' : 'none' }} />
                <span className="text-[9px] font-mono" style={{ color: l === 4 ? 'rgba(165,180,252,0.8)' : 'rgba(255,255,255,0.2)' }}>L{l}</span>
              </div>
            ))}
            <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.2)' }}>· Aura complexity</span>
          </div>
        </div>

        {/* Archetypes */}
        <div>
          <p className="text-xs font-bold mb-2.5" style={{ color: 'rgba(255,255,255,0.45)' }}>Behavioral Archetypes</p>
          <div className="flex flex-col gap-2.5">
            {ARCHETYPES.map((a, i) => (
              <motion.div key={a.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                className="rounded-2xl px-4 py-3 flex items-center gap-3"
                style={{ background: `${a.color}0f`, border: `1px solid ${a.color}25` }}>
                <span className="text-2xl flex-shrink-0">{a.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold" style={{ color: a.color }}>{a.label}</p>
                  <p className="text-[11px] leading-relaxed mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{a.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Scenario Mapping Graph (NEW) ── */}
        <div>
          <p className="text-xs font-bold mb-2.5" style={{ color: 'rgba(255,255,255,0.45)' }}>Scenario Mapping</p>
          <ScenarioMapSection />
        </div>

        {/* Roots network */}
        <div>
          <p className="text-xs font-bold mb-2.5" style={{ color: 'rgba(255,255,255,0.45)' }}>Roots Network</p>
          <RootsGraph />
        </div>

        {/* Shadow Key locked heat section */}
        <div>
          <p className="text-xs font-bold mb-2.5" style={{ color: 'rgba(255,255,255,0.45)' }}>Recent Volatility</p>
          <AnimatePresence mode="wait">
            {!heatUnlocked ? (
              <motion.button key="locked" initial={{ opacity: 1 }} exit={{ opacity: 0, y: -6 }}
                onClick={() => setHeatUnlocked(true)}
                className="w-full rounded-2xl flex flex-col items-center gap-2 py-6 transition-all"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                <Lock className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.3)' }} />
                <p className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>Unlock with Shadow Key</p>
                <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.2)' }}>Reveals 30-day heat history · cost 1 Shadow Key</p>
                <div className="mt-1 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)' }}>
                  <span className="text-base">🗝️</span>
                  <span className="text-xs font-semibold" style={{ color: '#a78bfa' }}>Use Shadow Key to view</span>
                </div>
              </motion.button>
            ) : (
              <motion.div key="unlocked" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl px-4 py-4"
                style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Unlock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-400">Shadow Key used · Heat history visible</span>
                </div>
                <HeatSparkline />
                <p className="text-[11px] leading-relaxed mt-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  This user tends toward moderate-intensity campaigns with occasional spikes. Stylistic preference — not a moral flag.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Digital Footprint & Authentication (NEW) ── */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <p className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.45)' }}>Digital Footprint & Authentication</p>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#34d399' }} />
              <span className="text-[9px] font-mono" style={{ color: '#34d399' }}>SECURE</span>
            </div>
          </div>
          <DigitalFootprintSection />
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}
