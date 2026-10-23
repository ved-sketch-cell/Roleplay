import {JourneyDialog,ReportDialog} from '../mobile/JourneyDialog';
import {useFlowState} from '../mobile/FlowState';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Shield, Clock, AlertTriangle, Wind,
  Anchor, Activity, BookOpen, MessageSquare,
  ChevronRight, Thermometer, Flag, Star, CheckCircle,
  ChevronDown,
} from 'lucide-react';

// ─── Types & Data ─────────────────────────────────────────────

interface CounselorDashboardProps {
  onBack: () => void;
}

interface SanctuaryMessage {
  id: string;
  role: 'system' | 'counselor' | 'user';
  text: string;
  timestamp: string;
}

const HANDOFF = {
  userId: 'NightOwl_7',
  avatar: '🦉',
  avatarColor: '#6366f1',
  sessionDuration: 43,
  peakHeat: 94,
  trigger: 'Manual — 3 consecutive high-heat exchanges',
  trajectory:
    'User showed escalating anxiety patterns over 43 minutes. Roleplay scenario (workplace confrontation) triggered progressively shorter response intervals, indicating high emotional activation. Language shifted from third-person narrative to first-person ("I can\'t do this") at the 38-minute mark.',
  markers: [
    'Persona repeatedly positioned in powerless roles',
    "First-person language emerged at 38-min mark ('I can't do this')",
    'Response time dropped from 45s → 8s (strong activation)',
    'User broke RP frame to request transition manually',
  ],
  themes: ['Workplace authority dynamics', 'Feeling unheard / invalidated', 'Conflict avoidance'],
  affinityScore: 847,
  sessionsTotal: 12,
  highHeatSessions: 3,
  commStyle: 'Direct but gentle',
  pace: 'User-led — let them guide pace',
  boundaries: ['Avoid questions about family', 'No imposed time pressure', 'No unsolicited advice'],
};

const ANCHORS = [
  {
    id: '1',
    Icon: Wind,
    title: 'Box Breathing',
    desc: 'Guide a 4-4-4-4 inhale/hold/exhale/hold cycle. Calibrated to workplace-stress pattern.',
    tag: 'Grounding',
    color: '#4f7eba',
  },
  {
    id: '2',
    Icon: Anchor,
    title: '5-4-3-2-1 Sensory',
    desc: '"Name 5 things you can see right now…" — reorients attention to present moment.',
    tag: 'Sensory',
    color: '#059669',
  },
  {
    id: '3',
    Icon: MessageSquare,
    title: 'Open Frame',
    desc: "\"What does 'handled' look like to you?\" — user defines their own success.",
    tag: 'Narrative',
    color: '#8169ec',
  },
];

const ESCALATION = [
  { level: 1, label: 'Flag Senior Counselor', desc: 'Invite a senior to observe or co-facilitate', color: '#d97706', bg: '#fffbeb' },
  { level: 2, label: 'Suggest Professional Referral', desc: 'Offer platform-vetted external resources', color: '#ea580c', bg: '#fff7ed' },
  { level: 3, label: 'Emergency Protocol', desc: 'Immediate crisis intervention pathway', color: '#dc2626', bg: '#fef2f2' },
];

const INITIAL_MESSAGES: SanctuaryMessage[] = [
  { id: 's1', role: 'system', text: 'Session initiated. Heat dissipation protocol active.', timestamp: '11:47 PM' },
];

// ─── Component ────────────────────────────────────────────────

export function CounselorDashboard({ onBack }: CounselorDashboardProps) {
  const [heatLevel, setHeatLevel] = useState(87);
  const [bufferSeconds, setBufferSeconds] = useState(42);
  const [bufferActive, setBufferActive] = useState(true);
  const [messages, setMessages] = useFlowState<SanctuaryMessage[]>('CounselorDashboard.messages',INITIAL_MESSAGES);
  const [escalation,setEscalation]=useState('');
  const [report,setReport]=useState(false);
  const [inputText, setInputText] = useFlowState('CounselorDashboard.inputText','');
  const [activeTab, setActiveTab] = useFlowState<'brief' | 'sanctuary' | 'toolkit'>('CounselorDashboard.activeTab','brief');
  const [counselorLoad] = useState(62);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [themesExpanded, setThemesExpanded] = useFlowState('CounselorDashboard.themesExpanded',false);
  const [markersExpanded, setMarkersExpanded] = useFlowState('CounselorDashboard.markersExpanded',true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Heat cools slowly
  useEffect(() => {
    const t = setInterval(() => setHeatLevel(v => Math.max(18, v - 0.4)), 2800);
    return () => clearInterval(t);
  }, []);

  // Async intro buffer countdown
  useEffect(() => {
    if (!bufferActive) return;
    const t = setInterval(() => {
      setBufferSeconds(prev => {
        if (prev <= 1) {
          setBufferActive(false);
          const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setMessages(m => [
            ...m,
            { id: 's2', role: 'system', text: 'User has finished reviewing. Conversation is open.', timestamp: ts },
            { id: 's3', role: 'user', text: 'hey', timestamp: ts },
          ]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [bufferActive]);

  // Session timer
  useEffect(() => {
    const t = setInterval(() => setSessionSeconds(v => v + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim() || bufferActive) return;
    const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'counselor', text: inputText.trim(), timestamp: ts }]);
    setInputText('');
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const heatPct = heatLevel;
  const heatColor = heatPct > 65 ? '#dc2626' : heatPct > 38 ? '#d97706' : '#059669';
  const heatLabel = heatPct > 65 ? 'High' : heatPct > 38 ? 'Cooling' : 'Stable';
  const filledLoad = Math.round((counselorLoad / 100) * 5);

  // ── Left Rail ────────────────────────────────────────────
  const BriefRail = () => (
    <div className="p-4 space-y-4">
      {/* AI Handoff Brief */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)' }}>
        <div className="px-4 pt-4 pb-3" style={{ background: '#f5f3ff', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: '#4f7eba' }}>
              <Activity className="w-2.5 h-2.5 text-white" />
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#4f7eba' }}>AI Handoff Brief</span>
          </div>
          <p className="text-[10px] leading-relaxed" style={{ color: '#6b6560' }}>
            Translation layer active — no raw roleplay logs exposed
          </p>
        </div>

        <div className="p-4 space-y-4">
          {/* Metrics */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Duration', val: '43m' },
              { label: 'Peak Heat', val: '94' },
              { label: 'Trigger', val: 'Manual' },
            ].map(({ label, val }) => (
              <div key={label} className="rounded-xl p-2.5 text-center" style={{ background: '#f7f5f2' }}>
                <p className="text-[9px] font-mono uppercase tracking-wider mb-1" style={{ color: '#a09890' }}>{label}</p>
                <p className="text-sm font-bold" style={{ color: '#2d2b26' }}>{val}</p>
              </div>
            ))}
          </div>

          {/* Trajectory summary */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#a09890' }}>Trajectory</p>
            <p className="text-[13px] leading-relaxed" style={{ color: '#4a4540' }}>{HANDOFF.trajectory}</p>
          </div>

          {/* Behavioral markers (collapsible) */}
          <div>
            <button
              onClick={() => setMarkersExpanded(v => !v)}
              className="flex items-center gap-2 w-full mb-2"
            >
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#a09890' }}>Behavioral Markers</p>
              <ChevronDown
                className="w-3 h-3 ml-auto transition-transform"
                style={{ color: '#a09890', transform: markersExpanded ? 'rotate(180deg)' : 'none' }}
              />
            </button>
            <AnimatePresence initial={false}>
              {markersExpanded && (
                <motion.ul
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  {HANDOFF.markers.map((m, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs leading-relaxed" style={{ color: '#5a5550' }}>
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#4f7eba' }} />
                      {m}
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          {/* Flagged themes */}
          <div>
            <button onClick={() => setThemesExpanded(v => !v)} className="flex items-center gap-2 w-full mb-2">
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#a09890' }}>Flagged Themes</p>
              <ChevronDown
                className="w-3 h-3 ml-auto transition-transform"
                style={{ color: '#a09890', transform: themesExpanded ? 'rotate(180deg)' : 'none' }}
              />
            </button>
            <AnimatePresence initial={false}>
              {themesExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-wrap gap-1.5 overflow-hidden"
                >
                  {HANDOFF.themes.map(t => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-full text-[11px] font-medium"
                      style={{ background: '#fef3c7', color: '#92400e', border: '1px solid rgba(217,119,6,0.2)' }}
                    >
                      {t}
                    </span>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Vulnerability Sheet */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)' }}>
        <div className="px-4 pt-4 pb-3" style={{ background: '#f0fdf4', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: '#059669' }}>
              <BookOpen className="w-2.5 h-2.5 text-white" />
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#059669' }}>Vulnerability Sheet</span>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* User identity */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: `${HANDOFF.avatarColor}18` }}
            >
              {HANDOFF.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold" style={{ color: '#2d2b26' }}>{HANDOFF.userId}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Star className="w-3 h-3" style={{ color: '#d97706' }} />
                <span className="text-xs font-mono" style={{ color: '#d97706' }}>{HANDOFF.affinityScore}</span>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid rgba(22,163,74,0.2)' }}
                >
                  Trusted
                </span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[11px] font-mono" style={{ color: '#a09890' }}>{HANDOFF.sessionsTotal} sessions</p>
              <p className="text-[10px] font-medium" style={{ color: '#dc2626' }}>{HANDOFF.highHeatSessions} high-heat</p>
            </div>
          </div>

          {/* Comm prefs */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl p-2.5" style={{ background: '#f7f5f2' }}>
              <p className="text-[9px] font-mono uppercase tracking-wider mb-1" style={{ color: '#a09890' }}>Style</p>
              <p className="text-xs font-semibold" style={{ color: '#2d2b26' }}>{HANDOFF.commStyle}</p>
            </div>
            <div className="rounded-xl p-2.5" style={{ background: '#f7f5f2' }}>
              <p className="text-[9px] font-mono uppercase tracking-wider mb-1" style={{ color: '#a09890' }}>Pace</p>
              <p className="text-xs font-semibold" style={{ color: '#2d2b26' }}>{HANDOFF.pace}</p>
            </div>
          </div>

          {/* Boundaries */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#a09890' }}>Boundaries</p>
            {HANDOFF.boundaries.map(b => (
              <div
                key={b}
                className="flex items-center gap-2 py-2 text-xs"
                style={{ borderTop: '1px solid rgba(0,0,0,0.05)', color: '#5a5550' }}
              >
                <Shield className="w-3 h-3 flex-shrink-0" style={{ color: '#4f7eba' }} />
                {b}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ── Right Rail ────────────────────────────────────────────
  const ToolkitRail = () => (
    <div className="p-4 space-y-4">
      {/* De-escalation Anchors */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)' }}>
        <div className="px-4 pt-4 pb-3" style={{ background: '#faf5ff', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: '#8169ec' }}>
              <Anchor className="w-2.5 h-2.5 text-white" />
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#8169ec' }}>De-escalation Anchors</span>
          </div>
          <p className="text-[10px]" style={{ color: '#6b6560' }}>Sample prompts · select to draft</p>
        </div>

        <div className="p-3 space-y-2">
          {ANCHORS.map(({ id, Icon, title, desc, tag, color }) => (
            <button
              key={id}
              onClick={()=>{setInputText(desc);setActiveTab('sanctuary');}}
              className="w-full rounded-xl p-3 text-left transition-opacity hover:opacity-80"
              style={{ background: `${color}09`, border: `1px solid ${color}20` }}
            >
              <div className="flex items-start gap-2.5">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: `${color}18` }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-xs font-bold" style={{ color: '#2d2b26' }}>{title}</p>
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded-full font-mono"
                      style={{ background: `${color}18`, color }}
                    >
                      {tag}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed" style={{ color: '#6b6560' }}>{desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Escalation Path */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)' }}>
        <div className="px-4 pt-4 pb-3" style={{ background: '#fff5f5', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: '#dc2626' }}>
              <AlertTriangle className="w-2.5 h-2.5 text-white" />
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#dc2626' }}>Escalation Path</span>
          </div>
        </div>

        <div className="p-3 space-y-2">
          {ESCALATION.map(({ level, label, desc, color, bg }) => (
            <button
              key={level}
              onClick={()=>setEscalation(label)}
              className="w-full rounded-xl p-3 text-left transition-opacity hover:opacity-80 flex items-center gap-3"
              style={{ background: bg, border: `1px solid ${color}25` }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: color }}
              >
                <span className="text-white text-[10px] font-bold">{level}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold" style={{ color }}>{label}</p>
                <p className="text-[10px] mt-0.5 leading-relaxed" style={{ color: '#6b6560' }}>{desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: `${color}70` }} />
            </button>
          ))}
        </div>
      </div>

      {/* Counselor note */}
      <div
        className="rounded-2xl p-4 text-center"
        style={{ background: '#fef9ef', border: '1px solid rgba(245,158,11,0.15)' }}
      >
        <p className="text-[11px] leading-relaxed" style={{ color: '#92400e' }}>
          Remember: your own wellbeing matters. Reverse session load is at{' '}
          <span className="font-bold">{counselorLoad}%</span>. Take a break after this session.
        </p>
      </div>
    </div>
  );

  // ── Center Sanctuary ─────────────────────────────────────
  const SanctuaryPanel = () => (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Heat Dissipation Visual */}
      <div
        className="flex-shrink-0 px-5 py-3"
        style={{ background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)' }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Thermometer className="w-3.5 h-3.5" style={{ color: heatColor }} />
            <span className="text-xs font-semibold" style={{ color: heatColor }}>Heat Dissipation</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono" style={{ color: heatColor }}>{Math.round(heatLevel)}</span>
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
              style={{ background: `${heatColor}15`, color: heatColor }}
            >
              {heatLabel}
            </span>
          </div>
        </div>
        <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.07)' }}>
          <motion.div
            className="absolute left-0 top-0 h-full rounded-full"
            animate={{ width: `${heatPct}%`, backgroundColor: heatColor }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </div>
        <p className="text-[10px] mt-1.5" style={{ color: '#a09890' }}>
          Real-time emotional baseline gauge. Decreases as conversation stabilizes.
        </p>
      </div>

      {/* Async buffer banner */}
      <AnimatePresence>
        {bufferActive && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex-shrink-0 px-5 py-2.5 flex items-center gap-3"
            style={{ background: '#eff6ff', borderBottom: '1px solid rgba(79,126,186,0.15)' }}
          >
            <div className="w-2 h-2 rounded-full animate-pulse flex-shrink-0" style={{ background: '#4f7eba' }} />
            <p className="text-xs flex-1" style={{ color: '#3b6fa8' }}>
              <span className="font-semibold">{HANDOFF.userId}</span> is reviewing their Vulnerability Sheet…
            </p>
            <span className="text-xs font-mono font-bold" style={{ color: '#4f7eba' }}>{bufferSeconds}s</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-5 py-5 space-y-3"
        style={{ scrollbarWidth: 'none' }}
      >
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'counselor' ? 'justify-end' : msg.role === 'system' ? 'justify-center' : 'justify-start'}`}
          >
            {msg.role === 'system' ? (
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(0,0,0,0.05)' }}
              >
                <Activity className="w-3 h-3" style={{ color: '#a09890' }} />
                <p className="text-[11px]" style={{ color: '#a09890' }}>{msg.text}</p>
                <span className="text-[10px] font-mono" style={{ color: '#c4bdb8' }}>{msg.timestamp}</span>
              </div>
            ) : (
              <div className="max-w-[74%] space-y-0.5">
                <div
                  className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                  style={
                    msg.role === 'counselor'
                      ? { background: '#dbeafe', color: '#1e3a5f' }
                      : { background: '#fef9c3', color: '#78350f', border: '1px solid rgba(234,179,8,0.18)' }
                  }
                >
                  {msg.text}
                </div>
                <p
                  className={`text-[10px] font-mono px-1 ${msg.role === 'counselor' ? 'text-right' : ''}`}
                  style={{ color: '#c4bdb8' }}
                >
                  {msg.timestamp}
                </p>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        className="flex-shrink-0 px-5 py-3"
        style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(0,0,0,0.06)' }}
      >
        {bufferActive ? (
          <div
            className="flex items-center gap-3 py-3 px-4 rounded-2xl"
            style={{ background: '#f0ede8', border: '1px solid rgba(0,0,0,0.07)' }}
          >
            <Clock className="w-4 h-4 flex-shrink-0" style={{ color: '#a09890' }} />
            <p className="text-sm" style={{ color: '#a09890' }}>
              Waiting for user to finish reviewing… ({bufferSeconds}s)
            </p>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Respond gently…"
              autoFocus={!bufferActive}
              className="flex-1 rounded-2xl px-4 py-2.5 text-sm outline-none"
              style={{ background: '#f7f5f2', border: '1px solid rgba(0,0,0,0.09)', color: '#2d2b26' }}
            />
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={handleSend}
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: '#4f7eba' }}
            >
              <MessageSquare className="w-4 h-4 text-white" />
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: '#f7f5f2', fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
    >
      {/* ── Header ── */}
      <div
        className="flex-shrink-0 px-4 py-3 flex items-center gap-3"
        style={{
          background: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(0,0,0,0.07)',
        }}
      >
        <button
          onClick={onBack}
          className="p-1.5 rounded-full transition-colors"
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.06)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <ArrowLeft className="w-4 h-4" style={{ color: '#6b6560' }} />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full animate-pulse flex-shrink-0" style={{ background: '#059669' }} />
            <span className="text-sm font-bold" style={{ color: '#2d2b26' }}>Sanctuary Session</span>
            <span
              className="text-xs font-mono px-2 py-0.5 rounded-full"
              style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid rgba(22,163,74,0.15)' }}
            >
              {fmt(sessionSeconds)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Shield className="w-2.5 h-2.5" style={{ color: '#4f7eba' }} />
            <span className="text-[10px]" style={{ color: '#a09890' }}>
              Identity protected · AI translation layer active
            </span>
          </div>
        </div>

        {/* Reverse Heat Meter */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span
            className="text-[9px] font-mono uppercase tracking-wider"
            style={{ color: counselorLoad > 70 ? '#d97706' : '#a09890' }}
          >
            {counselorLoad > 70 ? '⚠ Session Load' : 'Session Load'}
          </span>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="w-4 h-1.5 rounded-sm transition-colors"
                style={{
                  background: i < filledLoad
                    ? counselorLoad > 80 ? '#dc2626' : counselorLoad > 60 ? '#d97706' : '#059669'
                    : 'rgba(0,0,0,0.1)',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Mobile Tab Bar ── */}
      <div
        className="md:hidden flex-shrink-0 flex"
        style={{ background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.07)' }}
      >
        {(['brief', 'sanctuary', 'toolkit'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-3 text-xs font-semibold capitalize transition-colors"
            style={{
              color: activeTab === tab ? '#4f7eba' : '#a09890',
              borderBottom: activeTab === tab ? '2px solid #4f7eba' : '2px solid transparent',
            }}
          >
            {tab === 'brief' ? 'Brief' : tab === 'sanctuary' ? 'Sanctuary' : 'Toolkit'}
          </button>
        ))}
      </div>

      {/* ── 3-Column Layout ── */}
      <div className="flex-1 overflow-hidden flex">
        {/* Left Rail */}
        <div
          className={`${activeTab === 'brief' ? 'flex' : 'hidden'} md:flex flex-col overflow-y-auto md:w-72 w-full flex-shrink-0`}
          style={{ background: '#f0ede8', borderRight: '1px solid rgba(0,0,0,0.07)', scrollbarWidth: 'none' }}
        >
          <BriefRail />
        </div>

        {/* Center Sanctuary */}
        <div
          className={`${activeTab === 'sanctuary' ? 'flex' : 'hidden'} md:flex flex-1 flex-col overflow-hidden`}
          style={{ background: '#fafaf8' }}
        >
          <SanctuaryPanel />
        </div>

        {/* Right Rail */}
        <div
          className={`${activeTab === 'toolkit' ? 'flex' : 'hidden'} md:flex flex-col overflow-y-auto md:w-64 w-full flex-shrink-0`}
          style={{ background: '#eef0f5', borderLeft: '1px solid rgba(0,0,0,0.07)', scrollbarWidth: 'none' }}
        >
          <ToolkitRail />
        </div>
      </div>
      {escalation&&<JourneyDialog title={escalation} onClose={()=>setEscalation('')}><p>This is a sample support workspace. No counselor or emergency service is connected.</p><button className="mobile-primary-button" onClick={()=>{setEscalation('');setReport(true);}}>Save a concern</button><button className="mobile-text-button" onClick={onBack}>Pause and leave workspace</button></JourneyDialog>}
      {report&&<ReportDialog target="Sample support session" onClose={()=>setReport(false)}/>}
    </div>
  );
}
