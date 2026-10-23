import {useFlowState} from '../mobile/FlowState';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Shield, Clock, CheckCircle, XCircle,
  AlertTriangle, ChevronRight, Users,
} from 'lucide-react';

interface ArbitrationChamberProps {
  onBack: () => void;
}

type Phase = 'parsing' | 'dilemma' | 'jury_pending' | 'jury_voting' | 'verdict';

// ─── Static data ──────────────────────────────────────────────

const AI_TIMELINE = [
  {
    t: '21:34', actor: 'User A', event: 'Initiated high-heat roleplay scenario (workplace confrontation).',
    type: 'neutral',
  },
  {
    t: '21:41', actor: 'User B', event: 'Escalated intensity within agreed Scenario bounds. Heat: 68.',
    type: 'neutral',
  },
  {
    t: '21:47', actor: 'User A', event: 'Shifted from narrative frame to direct address. First boundary signal detected.',
    type: 'warn',
  },
  {
    t: '21:49', actor: 'User B', event: 'Attempted de-escalation: "I think we should walk this back."',
    type: 'good',
  },
  {
    t: '21:51', actor: 'User A', event: 'Bypassed stated boundary. Personal-attack language detected. Catalyst event.',
    type: 'bad',
  },
  {
    t: '21:52', actor: 'User B', event: 'Retaliated with equivalent intensity. Mutual escalation lock reached.',
    type: 'bad',
  },
];

const JURORS = [
  { id: 'j1', handle: 'Anon_Juror_1', avatar: '🦅', vote: 'A', delay: 1200 },
  { id: 'j2', handle: 'Anon_Juror_2', avatar: '🦉', vote: 'A', delay: 2800 },
  { id: 'j3', handle: 'Anon_Juror_3', avatar: '🐬', vote: 'A', delay: 4200 },
  { id: 'j4', handle: 'Anon_Juror_4', avatar: '🦊', vote: 'B', delay: 5600 },
  { id: 'j5', handle: 'Anon_Juror_5', avatar: '🐺', vote: 'A', delay: 7400 },
];

// ─── Component ────────────────────────────────────────────────

export function ArbitrationChamber({ onBack }: ArbitrationChamberProps) {
  const [phase, setPhase] = useFlowState<Phase>('ArbitrationChamber.phase','parsing');
  const [parseProgress, setParseProgress] = useState(0);
  const [visibleSteps, setVisibleSteps] = useFlowState('ArbitrationChamber.visibleSteps',0);
  const [dilemmaTimer, setDilemmaTimer] = useFlowState('ArbitrationChamber.dilemmaTimer',60);
  const [jurorVotes, setJurorVotes] = useFlowState<Record<string, string>>('ArbitrationChamber.jurorVotes',{});
  const [verdictReached, setVerdictReached] = useFlowState('ArbitrationChamber.verdictReached',false);

  // Parsing phase auto-advance
  useEffect(() => {
    if (phase !== 'parsing') return;
    const t = setInterval(() => {
      setParseProgress(p => {
        if (p >= 100) {
          clearInterval(t);
          setTimeout(() => {
            setPhase('dilemma');
            setVisibleSteps(AI_TIMELINE.length);
          }, 500);
          return 100;
        }
        return p + 1.4;
      });
    }, 50);
    return () => clearInterval(t);
  }, [phase]);

  // Dilemma countdown
  useEffect(() => {
    if (phase !== 'dilemma') return;
    const t = setInterval(() => {
      setDilemmaTimer(s => {
        if (s <= 1) {
          clearInterval(t);
          // Auto-concede on timer expiry
          setPhase('jury_pending');
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  // Jury voting simulation
  useEffect(() => {
    if (phase !== 'jury_voting') return;
    const timers=JURORS.map(j => {
      return setTimeout(() => {
        setJurorVotes(prev => ({ ...prev, [j.id]: j.vote }));
      }, j.delay);
    });
    timers.push(setTimeout(() => {
      setVerdictReached(true);
      setPhase('verdict');
    }, JURORS[JURORS.length - 1].delay + 800));
    return()=>timers.forEach(clearTimeout);
  }, [phase]);

  // Greyscale palette
  const BG = '#0b0b0b';
  const SURF = '#161616';
  const SURF2 = '#1e1e1e';
  const BORDER = 'rgba(255,255,255,0.07)';
  const TEXT_HI = 'rgba(255,255,255,0.78)';
  const TEXT_MID = 'rgba(255,255,255,0.42)';
  const TEXT_LO = 'rgba(255,255,255,0.22)';

  function typeColor(type: string) {
    if (type === 'bad')  return 'rgba(239,68,68,0.55)';
    if (type === 'good') return 'rgba(52,211,153,0.55)';
    if (type === 'warn') return 'rgba(251,191,36,0.55)';
    return TEXT_MID;
  }
  function typeBorder(type: string) {
    if (type === 'bad')  return 'rgba(239,68,68,0.18)';
    if (type === 'good') return 'rgba(52,211,153,0.18)';
    if (type === 'warn') return 'rgba(251,191,36,0.18)';
    return BORDER;
  }

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: BG, fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
    >
      {/* ── Header — stripped of all color ── */}
      <div
        className="flex-shrink-0 px-4 py-3 flex items-center gap-3"
        style={{ background: '#0f0f0f', borderBottom: `1px solid ${BORDER}` }}
      >
        {phase === 'parsing' ? (
          <div className="p-1.5">
            <Shield className="w-5 h-5" style={{ color: TEXT_LO }} />
          </div>
        ) : (
          <button onClick={onBack} className="p-1.5 rounded-full hover:bg-white/[0.06] transition-colors">
            <ArrowLeft className="w-5 h-5" style={{ color: TEXT_MID }} />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold" style={{ color: TEXT_HI }}>Arbitration Chamber</p>
          <p className="text-[10px] mt-0.5" style={{ color: TEXT_LO }}>
            {phase === 'parsing' ? 'AI forensic analysis in progress…' :
             phase === 'dilemma' ? 'GAME PAUSED — Awaiting mutual response' :
             phase === 'jury_pending' ? 'Escalation confirmed · Entering Blind Jury' :
             phase === 'jury_voting' ? 'Peer Jury deliberating…' :
             'Verdict reached'}
          </p>
        </div>
        {/* Live indicator */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}` }}
        >
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-white/40"
          />
          <span className="text-[10px]" style={{ color: TEXT_LO }}>Chat locked</span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>
        <AnimatePresence mode="wait">

          {/* ─ PARSING ─ */}
          {phase === 'parsing' && (
            <motion.div
              key="parsing"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="px-4 py-6 flex flex-col gap-5"
            >
              <div
                className="rounded-2xl p-5 flex flex-col gap-4"
                style={{ background: SURF, border: `1px solid ${BORDER}` }}
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5" style={{ color: TEXT_MID }} />
                  <p className="text-sm font-bold" style={{ color: TEXT_HI }}>AI Interaction Analysis</p>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: TEXT_MID }}>
                  Scanning interaction log for catalyst events, escalation vectors, and boundary violations. This is sample data; no real transcript is processed.
                </p>
                {/* Progress */}
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[10px]" style={{ color: TEXT_LO }}>Parsing interaction flow…</span>
                    <span className="text-[10px] font-mono" style={{ color: TEXT_MID }}>{Math.round(parseProgress)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ width: `${parseProgress}%`, background: 'rgba(255,255,255,0.3)' }}
                    />
                  </div>
                </div>
                {/* Scan items */}
                <div className="flex flex-col gap-2">
                  {[
                    { label: 'Catalyst detection', done: parseProgress > 28 },
                    { label: 'De-escalation attempts', done: parseProgress > 52 },
                    { label: 'Boundary violation cross-ref', done: parseProgress > 74 },
                    { label: 'Toxicity vector mapping', done: parseProgress > 91 },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                      {item.done
                        ? <CheckCircle className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.4)' }} />
                        : <div className="w-3 h-3 rounded-full border" style={{ borderColor: TEXT_LO }} />}
                      <span className="text-[11px]" style={{ color: item.done ? TEXT_MID : TEXT_LO }}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Redaction notice */}
              <div
                className="rounded-xl px-4 py-3 flex items-center gap-2"
                style={{ background: 'rgba(255,255,255,0.025)', border: `1px solid ${BORDER}` }}
              >
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: TEXT_LO }} />
                <p className="text-[11px]" style={{ color: TEXT_LO }}>
                  All identifying information will be redacted before any human or peer review.
                </p>
              </div>
            </motion.div>
          )}

          {/* ─ DILEMMA ─ */}
          {phase === 'dilemma' && (
            <motion.div
              key="dilemma"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="px-4 py-4 flex flex-col gap-4"
            >
              {/* AI Timeline */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{ background: SURF, border: `1px solid ${BORDER}` }}
              >
                <div className="px-4 pt-4 pb-2">
                  <p className="text-xs font-bold" style={{ color: TEXT_MID }}>AI-Parsed Interaction Timeline</p>
                  <p className="text-[10px] mt-0.5" style={{ color: TEXT_LO }}>Identifiers redacted · No verbatim toxic content</p>
                </div>
                <div className="flex flex-col">
                  {AI_TIMELINE.map((step, i) => (
                    <div
                      key={i}
                      className="flex gap-3 px-4 py-2.5 border-t"
                      style={{ borderColor: BORDER }}
                    >
                      <div className="flex flex-col items-center gap-1 flex-shrink-0" style={{ width: 36 }}>
                        <span className="text-[9px] font-mono" style={{ color: TEXT_LO }}>{step.t}</span>
                        <div className="w-1 flex-1 rounded-full" style={{ background: typeBorder(step.type), minHeight: 8 }} />
                      </div>
                      <div className="flex-1 min-w-0 py-0.5">
                        <span
                          className="text-[10px] font-bold"
                          style={{ color: typeColor(step.type) }}
                        >
                          {step.actor}
                        </span>
                        <p className="text-[11px] leading-relaxed mt-0.5" style={{ color: TEXT_MID }}>{step.event}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timer */}
              <div
                className="rounded-xl px-4 py-2 flex items-center justify-between"
                style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER}` }}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" style={{ color: dilemmaTimer < 15 ? 'rgba(239,68,68,0.6)' : TEXT_LO }} />
                  <span className="text-[11px]" style={{ color: TEXT_LO }}>Response window</span>
                </div>
                <span
                  className="text-sm font-bold font-mono"
                  style={{ color: dilemmaTimer < 15 ? 'rgba(239,68,68,0.8)' : TEXT_MID }}
                >
                  {dilemmaTimer}s
                </span>
              </div>

              {/* Dilemma header */}
              <div className="text-center">
                <p className="text-sm font-bold" style={{ color: TEXT_HI }}>De-escalation Dilemma</p>
                <p className="text-xs mt-1" style={{ color: TEXT_LO }}>
                  Both parties must choose simultaneously. Your choice is hidden from the other party.
                </p>
              </div>

              {/* Options */}
              <div className="flex flex-col gap-3">
                {/* Option A — Concede */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPhase('jury_pending')}
                  className="w-full rounded-2xl p-4 text-left flex flex-col gap-2"
                  style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.18)' }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="px-2 py-0.5 rounded text-[10px] font-bold"
                      style={{ background: 'rgba(52,211,153,0.12)', color: 'rgba(52,211,153,0.8)' }}
                    >
                      Option A
                    </div>
                    <span className="text-sm font-bold" style={{ color: 'rgba(52,211,153,0.85)' }}>Concede & Sever</span>
                  </div>
                  <p className="text-[11px] leading-relaxed" style={{ color: TEXT_MID }}>
                    If both parties concede, the interaction is permanently severed. You both take a <span style={{ color: 'rgba(52,211,153,0.7)' }}>minor, temporary XP penalty</span>. Trust Tiers remain intact.
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <CheckCircle className="w-3 h-3" style={{ color: 'rgba(52,211,153,0.6)' }} />
                    <span className="text-[10px]" style={{ color: 'rgba(52,211,153,0.55)' }}>Lowest risk · Tier preserved</span>
                  </div>
                </motion.button>

                {/* Option B — Escalate */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPhase('jury_pending')}
                  className="w-full rounded-2xl p-4 text-left flex flex-col gap-2"
                  style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.18)' }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="px-2 py-0.5 rounded text-[10px] font-bold"
                      style={{ background: 'rgba(239,68,68,0.1)', color: 'rgba(239,68,68,0.7)' }}
                    >
                      Option B
                    </div>
                    <span className="text-sm font-bold" style={{ color: 'rgba(239,68,68,0.75)' }}>Demand Escalation</span>
                  </div>
                  <p className="text-[11px] leading-relaxed" style={{ color: TEXT_MID }}>
                    Dispute enters <span style={{ color: 'rgba(239,68,68,0.7)' }}>Blind Peer Jury</span>. If you are found at fault, your Trust Score takes a <span style={{ color: 'rgba(239,68,68,0.8)' }}>catastrophic hit</span> — potential full tier demotion.
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <AlertTriangle className="w-3 h-3" style={{ color: 'rgba(239,68,68,0.5)' }} />
                    <span className="text-[10px]" style={{ color: 'rgba(239,68,68,0.5)' }}>High risk · Possible tier collapse</span>
                  </div>
                </motion.button>
              </div>

              <p className="text-center text-[10px]" style={{ color: TEXT_LO }}>
                Timer expiry = automatic Concede. Designed to protect both parties from rash decisions.
              </p>
            </motion.div>
          )}

          {/* ─ JURY PENDING ─ */}
          {phase === 'jury_pending' && (
            <motion.div
              key="jury_pending"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="px-4 py-8 flex flex-col items-center gap-6 text-center"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: SURF2, border: `1px solid ${BORDER}` }}
              >
                <Users className="w-7 h-7" style={{ color: TEXT_MID }} />
              </div>
              <div>
                <p className="text-base font-bold" style={{ color: TEXT_HI }}>Escalation Confirmed</p>
                <p className="text-xs mt-2 leading-relaxed max-w-xs" style={{ color: TEXT_MID }}>
                  Your dispute has been forwarded to the Blind Peer Jury. All identities and roleplay context have been redacted. Five randomly selected Highly Trusted users — with no Roots overlap — are reviewing the AI-parsed timeline.
                </p>
              </div>
              <div
                className="w-full rounded-xl px-4 py-3 flex flex-col gap-2"
                style={{ background: SURF, border: `1px solid ${BORDER}` }}
              >
                <p className="text-xs font-bold" style={{ color: TEXT_MID }}>Jury selection criteria</p>
                {[
                  'Highly Trusted tier',
                  'No shared Roots network',
                  'Selected by cryptographic RNG',
                  'Anonymised throughout',
                ].map(c => (
                  <div key={c} className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full" style={{ background: TEXT_LO }} />
                    <span className="text-[11px]" style={{ color: TEXT_LO }}>{c}</span>
                  </div>
                ))}
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setPhase('jury_voting')}
                className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm"
                style={{ background: SURF2, border: `1px solid ${BORDER}`, color: TEXT_MID }}
              >
                Enter Jury Session
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}

          {/* ─ JURY VOTING ─ */}
          {phase === 'jury_voting' && (
            <motion.div
              key="jury_voting"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="px-4 py-4 flex flex-col gap-4"
            >
              <div
                className="rounded-2xl p-4"
                style={{ background: SURF, border: `1px solid ${BORDER}` }}
              >
                <p className="text-xs font-bold mb-1" style={{ color: TEXT_MID }}>Redacted Brief · Jury View</p>
                <p className="text-[11px] leading-relaxed" style={{ color: TEXT_LO }}>
                  <span style={{ color: TEXT_MID }}>User A</span> initiated a roleplay scenario. At T+17min, the interaction crossed from narrative roleplay into direct personal address, violating boundary parameters stated in <span style={{ color: TEXT_MID }}>User B</span>"s Vulnerability Sheet. <span style={{ color: TEXT_MID }}>User B</span> attempted de-escalation once; User A did not respond to it. Mutual toxicity lock occurred at T+18min.
                </p>
              </div>

              <div>
                <p className="text-xs font-bold mb-2.5" style={{ color: TEXT_MID }}>Jury Deliberation</p>
                <div className="flex flex-col gap-2.5">
                  {JURORS.map(j => {
                    const voted = jurorVotes[j.id];
                    return (
                      <motion.div
                        key={j.id}
                        className="rounded-xl px-3 py-2.5 flex items-center gap-3"
                        style={{ background: SURF, border: `1px solid ${voted ? (voted === 'A' ? 'rgba(52,211,153,0.2)' : 'rgba(239,68,68,0.2)') : BORDER}` }}
                        animate={{ borderColor: voted ? (voted === 'A' ? 'rgba(52,211,153,0.2)' : 'rgba(239,68,68,0.2)') : BORDER }}
                      >
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                          style={{ background: SURF2 }}
                        >
                          {j.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold" style={{ color: TEXT_MID }}>{j.handle}</p>
                          {voted ? (
                            <p className="text-[10px] mt-0.5" style={{ color: voted === 'A' ? 'rgba(52,211,153,0.65)' : 'rgba(239,68,68,0.65)' }}>
                              Fault with User {voted}
                            </p>
                          ) : (
                            <motion.p
                              animate={{ opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 1.2, repeat: Infinity }}
                              className="text-[10px] mt-0.5"
                              style={{ color: TEXT_LO }}
                            >
                              Deliberating…
                            </motion.p>
                          )}
                        </div>
                        {voted ? (
                          voted === 'A'
                            ? <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(52,211,153,0.6)' }} />
                            : <XCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(239,68,68,0.6)' }} />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-dashed flex-shrink-0" style={{ borderColor: TEXT_LO }} />
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Tally */}
              {Object.keys(jurorVotes).length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-xl px-4 py-2.5 flex items-center justify-between"
                  style={{ background: SURF2, border: `1px solid ${BORDER}` }}
                >
                  <span className="text-xs" style={{ color: TEXT_LO }}>Running tally</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold" style={{ color: 'rgba(52,211,153,0.7)' }}>
                      A: {Object.values(jurorVotes).filter(v => v === 'A').length}
                    </span>
                    <span style={{ color: TEXT_LO }}>·</span>
                    <span className="text-xs font-mono font-bold" style={{ color: 'rgba(239,68,68,0.7)' }}>
                      B: {Object.values(jurorVotes).filter(v => v === 'B').length}
                    </span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ─ VERDICT ─ */}
          {phase === 'verdict' && (
            <motion.div
              key="verdict"
              initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="px-4 py-6 flex flex-col gap-5"
            >
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <motion.div
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', damping: 14 }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                  style={{ background: SURF2, border: `1px solid ${BORDER}` }}
                >
                  ⚖️
                </motion.div>
                <div>
                  <p className="text-base font-bold" style={{ color: TEXT_HI }}>Verdict: User A at Fault</p>
                  <p className="text-xs mt-2 leading-relaxed max-w-xs" style={{ color: TEXT_MID }}>
                    4–1 jury vote. The boundary catalyst originated with User A. User B"s retaliation was noted but weighted as responsive rather than initiating.
                  </p>
                </div>
              </div>

              {/* Outcomes */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{ background: SURF, border: `1px solid ${BORDER}` }}
              >
                <div className="px-4 py-3 border-b" style={{ borderColor: BORDER }}>
                  <p className="text-xs font-bold" style={{ color: TEXT_MID }}>Systemic Consequences</p>
                </div>
                {[
                  { party: 'User A (at fault)', outcome: 'Trust Tier demotion · 30-day vouching suspension', color: 'rgba(239,68,68,0.55)' },
                  { party: 'User B (respondent)', outcome: 'Minor temporary XP penalty · Tier intact', color: 'rgba(52,211,153,0.55)' },
                  { party: 'Jury members (×5)', outcome: '+150 XP each for civic participation', color: 'rgba(129,140,248,0.6)' },
                ].map(row => (
                  <div key={row.party} className="px-4 py-3 border-t flex items-start gap-3" style={{ borderColor: BORDER }}>
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: row.color }} />
                    <div>
                      <p className="text-xs font-semibold" style={{ color: TEXT_MID }}>{row.party}</p>
                      <p className="text-[11px] mt-0.5" style={{ color: TEXT_LO }}>{row.outcome}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={onBack}
                className="w-full py-3.5 rounded-2xl text-sm font-semibold"
                style={{ background: SURF2, border: `1px solid ${BORDER}`, color: TEXT_MID }}
              >
                Return to Platform
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
