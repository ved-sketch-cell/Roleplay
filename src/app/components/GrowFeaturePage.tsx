import {completeActivity} from '../mobile/state';
import {useFlowState} from '../mobile/FlowState';
import { useState, useEffect, useRef } from 'react';
import { FeatureHeading } from '../mobile/MobileUI';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, CheckCircle2, Lock, Star, Zap, ChevronRight,
  Clock, Users, Trophy, Flame, Shield, MessageCircle,
  BookOpen, Layers, RotateCcw, Heart, Send, Lightbulb,
  Target, Award,
} from 'lucide-react';

export interface GrowFeaturePageProps {
  featureId: string;
  onBack: () => void;
}

// ─── Shared helpers ───────────────────────────────────────────

function Header({ title, track, xp, onBack }: {
  title:string; track:string; trackColor:string; xp:number; onBack:()=>void;
}) { return <FeatureHeading title={title} track={track} xp={xp} onBack={onBack}/>; }

function StatPill({ icon: Icon, value, label, color }: {
  icon: React.ElementType; value: string; label: string; color: string;
}) {
  return (
    <div className="flex-1 rounded-xl py-3 flex flex-col items-center gap-1"
      style={{ background: `${color}0f`, border: `1px solid ${color}22` }}>
      <Icon className="w-4 h-4" style={{ color, width: 16, height: 16 }} />
      <p className="text-[13px] font-black" style={{ color }}>{value}</p>
      <p className="text-[8px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</p>
    </div>
  );
}

function TagChip({ label, color }: { label: string; color: string }) {
  return (
    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
      style={{ background: `${color}18`, color: `${color}cc`, border: `1px solid ${color}28` }}>
      {label}
    </span>
  );
}

function ActionBtn({ label, onClick, color, icon, secondary, disabled }: {
  label: string; onClick: () => void; color: string;
  icon?: React.ReactNode; secondary?: boolean; disabled?: boolean;
}) {
  return (
    <motion.button disabled={disabled} whileTap={{ scale: 0.97 }} onClick={onClick}
      className="w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 text-sm"
      style={{
        background: secondary ? `${color}12` : `linear-gradient(135deg, ${color}, ${color}cc)`,
        color: secondary ? color : 'white',
        border: secondary ? `1px solid ${color}30` : 'none',
        boxShadow: secondary ? 'none' : `0 6px 24px ${color}40`,
      }}>
      {icon}{label}
    </motion.button>
  );
}

// ═══════════════════════════════════════════════════════════════
// 1. SHADOW SIMULATOR
// ═══════════════════════════════════════════════════════════════

function ShadowSimulator({ onBack }: { onBack: () => void }) {
  const [messages, setMessages] = useFlowState('ShadowSimulator.messages',[
    { from: 'ai', text: "I'm your Ghost Writer mirror. Ask me anything — I'll reflect your patterns back at you." },
  ]);
  const [input, setInput] = useFlowState('ShadowSimulator.input','');
  const [typing, setTyping] = useState(false);
  const [insights, setInsights] = useFlowState<string[]>('ShadowSimulator.insights',[]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const aiReplies = [
    "Interesting. When you ask that, I notice you tend to deflect with humour. Is that a shield?",
    "You've said 'I think' three times without committing to it. Your Ghost Writer persona is more decisive than this.",
    "That question reveals a need for external validation. Your Roots score suggests you're building internal trust — lean on it.",
    "Your tone just shifted. Something in that topic carries weight for you. Want to explore it, or move on?",
    "I see a pattern: you ask strong questions but soften your own answers. That gap is where you grow.",
  ];

  const insightPool = [
    "Uses humour as deflection shield",
    "Seeks external validation on decisions",
    "Stronger in questions than in claims",
    "High curiosity, moderate conviction",
  ];

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { from: 'me', text: userMsg }]);
    setTyping(true);
    setTimeout(() => {
      const reply = aiReplies[messages.length % aiReplies.length];
      setMessages(prev => [...prev, { from: 'ai', text: reply }]);
      setTyping(false);
      if (insights.length < insightPool.length) {
        setInsights(prev => [...prev, insightPool[prev.length]]);
      }
    }, 1400);
  };

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typing]);

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#15141d' }}>
      <Header title="Shadow Simulator" track="Solo Progression" trackColor="#6ee7b7" xp={120} onBack={onBack} />

      {/* Insights strip */}
      {insights.length > 0 && (
        <div className="flex-shrink-0 px-4 py-2 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none', borderBottom: '1px solid rgba(110,231,183,0.1)' }}>
          {insights.map((insight, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-[9px] font-bold"
              style={{ background: 'rgba(110,231,183,0.1)', border: '1px solid rgba(110,231,183,0.22)', color: '#6ee7b7' }}>
              🔍 {insight}
            </motion.div>
          ))}
        </div>
      )}

      {/* Chat */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3" style={{ scrollbarWidth: 'none' }}>
        {/* Mirror avatar */}
        <div className="flex justify-center mb-2">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl relative"
            style={{ background: 'rgba(110,231,183,0.12)', border: '1.5px solid rgba(110,231,183,0.3)', boxShadow: '0 0 24px rgba(110,231,183,0.15)' }}>
            🪞
            <motion.div className="absolute inset-0 rounded-full"
              animate={{ boxShadow: ['0 0 0 0px rgba(110,231,183,0.3)', '0 0 0 8px rgba(110,231,183,0)', '0 0 0 0px rgba(110,231,183,0)'] }}
              transition={{ duration: 2.5, repeat: Infinity }} />
          </div>
        </div>

        {messages.map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[82%] px-4 py-2.5 rounded-2xl"
              style={{
                background: msg.from === 'me' ? 'rgba(99,102,241,0.4)' : 'rgba(110,231,183,0.08)',
                border: msg.from === 'me' ? 'none' : '1px solid rgba(110,231,183,0.18)',
                borderRadius: msg.from === 'me' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              }}>
              <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>{msg.text}</p>
            </div>
          </motion.div>
        ))}

        {typing && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1.5 items-center"
              style={{ background: 'rgba(110,231,183,0.08)', border: '1px solid rgba(110,231,183,0.18)' }}>
              {[0, 1, 2].map(i => (
                <motion.div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: '#6ee7b7' }}
                  animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex-shrink-0 px-4 py-3 flex gap-2"
        style={{ background: 'rgba(7,7,14,0.95)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Ask your mirror anything…"
          className="flex-1 px-4 py-2.5 rounded-xl outline-none text-sm"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)', caretColor: '#6ee7b7' }} />
        <motion.button whileTap={{ scale: 0.9 }} onClick={sendMessage}
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: input ? 'rgba(110,231,183,0.25)' : 'rgba(255,255,255,0.05)', border: `1px solid ${input ? 'rgba(110,231,183,0.4)' : 'rgba(255,255,255,0.08)'}` }}>
          <Send className="w-4 h-4" style={{ color: input ? '#6ee7b7' : 'rgba(255,255,255,0.3)' }} />
        </motion.button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 2. SCENARIO SPINNER
// ═══════════════════════════════════════════════════════════════

const SCENARIOS = [
  {
    prompt: "Your closest friend confesses they've been ghosting a mutual acquaintance who is clearly struggling. They ask you to cover for them. What do you do?",
    choices: [
      { label: "Cover for them — loyalty first", vibe: "Protective", score: 62, consequence: "You protected the bond but may have enabled avoidance." },
      { label: "Refuse and tell the truth gently", vibe: "Honest", score: 89, consequence: "Uncomfortable short-term, healthier long-term for everyone." },
      { label: "Talk to your friend first before deciding", vibe: "Thoughtful", score: 94, consequence: "High-empathy move. Earns Resonance XP bonus." },
    ],
  },
  {
    prompt: "You discover you got a promotion over a colleague who needed it more financially. HR asks for your discretion. A friend is pressuring you to celebrate publicly. What do you do?",
    choices: [
      { label: "Celebrate quietly, respect discretion", vibe: "Graceful", score: 85, consequence: "Emotionally intelligent. Your colleague's dignity is preserved." },
      { label: "Share publicly — you earned it", vibe: "Assertive", score: 55, consequence: "Fair, but reads as tone-deaf in context." },
      { label: "Check in with your colleague privately first", vibe: "Empathetic", score: 97, consequence: "Exceptional. Earns max Resonance XP this week." },
    ],
  },
];

function ScenarioSpinner({ onBack }: { onBack: () => void }) {
  const [scenIdx, setScenIdx] = useFlowState('ScenarioSpinner.scenIdx',0);
  const [chosen, setChosen] = useFlowState<number | null>('ScenarioSpinner.chosen',null);
  const [streak, setStreak] = useFlowState('ScenarioSpinner.streak',4);
  const scenario = SCENARIOS[scenIdx % SCENARIOS.length];
  const chosen_data = chosen !== null ? scenario.choices[chosen] : null;

  const next = () => {
    setScenIdx(i => i + 1);
    setChosen(null);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#15141d' }}>
      <Header title="Scenario Spinner" track="Solo Progression" trackColor="#6ee7b7" xp={80} onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5" style={{ scrollbarWidth: 'none' }}>
        {/* Streak */}
        <div className="flex gap-3">
          <StatPill icon={Flame} value={`${streak}`} label="Day Streak" color="#f97316" />
          <StatPill icon={Target} value="Daily" label="Reset 14h" color="#6ee7b7" />
          <StatPill icon={Zap} value="2,840" label="Total XP" color="#fbbf24" />
        </div>

        {/* Scenario card */}
        <AnimatePresence mode="wait">
          <motion.div key={scenIdx} initial={{ opacity: 0, rotateY: -12 }} animate={{ opacity: 1, rotateY: 0 }} exit={{ opacity: 0, rotateY: 12 }}
            transition={{ duration: 0.3 }}
            className="rounded-3xl p-5 flex flex-col gap-4"
            style={{ background: 'linear-gradient(135deg, rgba(110,231,183,0.08), rgba(16,185,129,0.05))', border: '1.5px solid rgba(110,231,183,0.2)' }}>
            <div className="flex items-center gap-2">
              <span className="text-xl">🎲</span>
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(110,231,183,0.6)' }}>Today's Dilemma</span>
            </div>
            <p className="text-sm leading-relaxed font-semibold" style={{ color: 'rgba(255,255,255,0.82)' }}>
              {scenario.prompt}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Choices */}
        {chosen === null ? (
          <div className="flex flex-col gap-2.5">
            {scenario.choices.map((c, i) => (
              <motion.button key={i} whileTap={{ scale: 0.98 }} onClick={() => setChosen(i)}
                className="w-full p-4 rounded-2xl text-left font-semibold text-sm leading-snug"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)' }}>
                {c.label}
              </motion.button>
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
            {/* Vibe check result */}
            <div className="rounded-2xl p-4" style={{ background: 'rgba(110,231,183,0.08)', border: '1.5px solid rgba(110,231,183,0.25)' }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>Vibe Check</p>
                  <p className="text-xl font-black mt-0.5" style={{ color: '#6ee7b7' }}>{chosen_data!.vibe}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black" style={{ color: chosen_data!.score >= 85 ? '#34d399' : chosen_data!.score >= 65 ? '#fbbf24' : '#f87171' }}>
                    {chosen_data!.score}
                  </p>
                  <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>/ 100</p>
                </div>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <motion.div className="h-full rounded-full" initial={{ width: 0 }}
                  animate={{ width: `${chosen_data!.score}%` }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  style={{ background: chosen_data!.score >= 85 ? '#34d399' : chosen_data!.score >= 65 ? '#fbbf24' : '#f87171' }} />
              </div>
              <p className="text-[11px] mt-3 leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{chosen_data!.consequence}</p>
            </div>
            <ActionBtn label="Next Scenario" onClick={next} color="#6ee7b7" icon={<RotateCcw className="w-4 h-4" />} />
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 3. SKILL-TREE JOURNAL
// ═══════════════════════════════════════════════════════════════

const SKILL_NODES = [
  { id: 'observe',  label: 'Observe',         unlocked: true,  emoji: '👁', x: 50, y: 85, desc: 'Notice patterns without judgment' },
  { id: 'reflect',  label: 'Reflect',          unlocked: true,  emoji: '🪞', x: 25, y: 60, desc: 'Connect observation to feeling' },
  { id: 'articulate', label: 'Articulate',     unlocked: true,  emoji: '🗣', x: 75, y: 60, desc: 'Express the internal clearly' },
  { id: 'reframe',  label: 'Reframe',          unlocked: false, emoji: '🔄', x: 15, y: 35, desc: 'See it from another angle' },
  { id: 'integrate',label: 'Integrate',        unlocked: false, emoji: '🧩', x: 50, y: 32, desc: 'Hold multiple truths at once' },
  { id: 'embody',   label: 'Embody',           unlocked: false, emoji: '✨', x: 85, y: 35, desc: 'Live the growth, not just know it' },
  { id: 'master',   label: 'Ghost Writer',     unlocked: false, emoji: '🌟', x: 50, y: 8,  desc: 'Fully integrated persona' },
];

const JOURNAL_PROMPTS = [
  "Describe a recent moment where you caught yourself performing for an audience rather than being authentic. What triggered it?",
  "When did you last change your mind because of someone else's perspective? How did that feel in your body?",
  "What is one thing you believe about yourself that you've never questioned?",
];

function SkillTreeJournal({ onBack }: { onBack: () => void }) {
  const [entry, setEntry] = useFlowState('SkillTreeJournal.entry','');
  const [submitted, setSubmitted] = useFlowState('SkillTreeJournal.submitted',false);
  const [selectedNode, setSelectedNode] = useFlowState<string | null>('SkillTreeJournal.selectedNode',null);
  const promptIdx = 1;
  const nodes=SKILL_NODES.map(node=>({...node,unlocked:node.unlocked||(submitted&&node.id==='integrate')}));
  const node = nodes.find(n => n.id === selectedNode);

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#15141d' }}>
      <Header title="Skill-Tree Journal" track="Solo Progression" trackColor="#6ee7b7" xp={150} onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5" style={{ scrollbarWidth: 'none' }}>
        {/* Skill Tree SVG */}
        <div className="rounded-3xl overflow-hidden relative" style={{ background: 'rgba(110,231,183,0.04)', border: '1px solid rgba(110,231,183,0.15)', height: 200 }}>
          <svg width="100%" height="200" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Connections */}
            {[['observe','reflect'],['observe','articulate'],['reflect','reframe'],['reflect','integrate'],['articulate','integrate'],['articulate','embody'],['reframe','master'],['integrate','master'],['embody','master']].map(([a,b]) => {
              const na = nodes.find(n => n.id === a)!;
              const nb = nodes.find(n => n.id === b)!;
              return <line key={`${a}-${b}`} x1={`${na.x}%`} y1={`${na.y}%`} x2={`${nb.x}%`} y2={`${nb.y}%`}
                stroke={na.unlocked && nb.unlocked ? 'rgba(110,231,183,0.4)' : 'rgba(255,255,255,0.08)'} strokeWidth="0.8" />;
            })}
          </svg>
          {nodes.map(n => (
            <button key={n.id} onClick={() => setSelectedNode(n.id === selectedNode ? null : n.id)}
              className="absolute flex flex-col items-center gap-0.5 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${n.x}%`, top: `${n.y}%` }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all"
                style={{
                  background: n.unlocked ? 'rgba(110,231,183,0.2)' : 'rgba(255,255,255,0.04)',
                  border: `1.5px solid ${selectedNode === n.id ? '#6ee7b7' : n.unlocked ? 'rgba(110,231,183,0.45)' : 'rgba(255,255,255,0.1)'}`,
                  boxShadow: n.unlocked ? '0 0 10px rgba(110,231,183,0.2)' : 'none',
                  opacity: n.unlocked ? 1 : 0.45,
                }}>
                {n.unlocked ? n.emoji : '🔒'}
              </div>
              <span className="text-[7px] font-bold leading-tight text-center" style={{ color: n.unlocked ? '#6ee7b7' : 'rgba(255,255,255,0.25)', maxWidth: 32, lineHeight: 1.1 }}>{n.label}</span>
            </button>
          ))}
        </div>

        {/* Node detail */}
        <AnimatePresence>
          {node && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
              className="rounded-2xl px-4 py-3 flex items-center gap-3"
              style={{ background: 'rgba(110,231,183,0.08)', border: '1px solid rgba(110,231,183,0.2)' }}>
              <span className="text-2xl">{node.emoji}</span>
              <div>
                <p className="text-sm font-bold" style={{ color: '#6ee7b7' }}>{node.label}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{node.desc}</p>
              </div>
              {!node.unlocked && <div className="ml-auto"><Lock className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} /></div>}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Journal prompt */}
        {!submitted ? (
          <div className="flex flex-col gap-3">
            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.28)' }}>Today's Unlock Prompt</p>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>{JOURNAL_PROMPTS[promptIdx]}</p>
            </div>
            <textarea value={entry} onChange={e => setEntry(e.target.value)}
              placeholder="Write freely — this is only for you…" rows={5}
              className="rounded-2xl px-4 py-3.5 text-sm resize-none outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.82)', caretColor: '#6ee7b7', lineHeight: 1.65 }} />
            <ActionBtn label="Submit & unlock next node" onClick={() => {setSubmitted(true);completeActivity('journal','Skill-tree reflection',150);}} color="#6ee7b7" disabled={entry.length < 30}
              icon={<Zap className="w-4 h-4" />} />
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5 flex flex-col items-center gap-3 text-center"
            style={{ background: 'rgba(110,231,183,0.08)', border: '1.5px solid rgba(110,231,183,0.3)' }}>
            <span className="text-4xl">✨</span>
            <p className="text-base font-black" style={{ color: '#6ee7b7' }}>Integrate node unlocked!</p>
            <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>Your Ghost Writer has evolved. Your reflection is saved on this device.</p>
            <div className="flex gap-2 mt-1">
              <TagChip label="+150 XP" color="#fbbf24" />
              <TagChip label="Integrate ✓" color="#6ee7b7" />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 4. VULNERABILITY STAIRCASE
// ═══════════════════════════════════════════════════════════════

const STAIRCASE_PROMPTS = [
  { level: 1, label: "Surface",       prompt: "What's something you enjoy that most people wouldn't guess about you?", xp: 20 },
  { level: 2, label: "Soft",          prompt: "Describe a time you felt proud but stayed silent about it. Why?", xp: 40 },
  { level: 3, label: "Honest",        prompt: "What's a belief you hold that you'd struggle to defend out loud?", xp: 60 },
  { level: 4, label: "Raw",           prompt: "Tell me about a version of yourself you've tried to leave behind.", xp: 90 },
  { level: 5, label: "Foundational",  prompt: "What would you most want someone to understand about you without you having to explain it?", xp: 150 },
];

function VulnerabilityStaircase({ onBack }: { onBack: () => void }) {
  const [currentLevel, setCurrentLevel] = useFlowState('VulnerabilityStaircase.currentLevel',1);
  const [myAnswer, setMyAnswer] = useFlowState('VulnerabilityStaircase.myAnswer','');
  const [submitted, setSubmitted] = useFlowState('VulnerabilityStaircase.submitted',false);
  const partnerLevel = 2;

  const step = STAIRCASE_PROMPTS[currentLevel - 1];
  const partnerAnswer = "Honestly? I think about failure more than I let on. Like, I curate a version of myself that looks confident, but there's always this quiet voice asking what happens if it all falls apart.";

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#15141d' }}>
      <Header title="Vulnerability Staircase" track="Relational Growth" trackColor="#93c5fd" xp={step.xp} onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5" style={{ scrollbarWidth: 'none' }}>
        {/* Staircase visual */}
        <div className="flex items-end justify-center gap-1.5" style={{ height: 80 }}>
          {STAIRCASE_PROMPTS.map((s, i) => {
            const active = s.level === currentLevel;
            const done = s.level < currentLevel;
            return (
              <div key={s.level} className="flex flex-col items-center gap-1">
                <div className="rounded-sm transition-all"
                  style={{
                    width: 36, height: 14 + i * 12,
                    background: done ? '#93c5fd' : active ? 'rgba(147,197,253,0.5)' : 'rgba(255,255,255,0.07)',
                    border: active ? '1.5px solid #93c5fd' : 'none',
                    boxShadow: active ? '0 0 12px rgba(147,197,253,0.3)' : 'none',
                  }} />
                <span className="text-[8px] font-bold" style={{ color: done || active ? '#93c5fd' : 'rgba(255,255,255,0.2)' }}>{s.label}</span>
              </div>
            );
          })}
        </div>

        {/* Consent status */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: 'rgba(147,197,253,0.07)', border: '1px solid rgba(147,197,253,0.18)' }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-base">🌊</div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold" style={{ color: 'rgba(255,255,255,0.7)' }}>Partner is on Level {partnerLevel}</p>
            <p className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Both must answer before the staircase advances</p>
          </div>
          {partnerLevel >= currentLevel && <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />}
        </div>

        {/* Prompt card */}
        <div className="rounded-2xl p-4" style={{ background: 'rgba(147,197,253,0.07)', border: '1.5px solid rgba(147,197,253,0.2)' }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#93c5fd' }}>Level {step.level} — {step.label}</span>
          </div>
          <p className="text-sm leading-relaxed font-semibold" style={{ color: 'rgba(255,255,255,0.8)' }}>{step.prompt}</p>
        </div>

        {/* Partner's answer */}
        <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>🌊 Partner answered</p>
          <p className="text-[12px] leading-relaxed italic" style={{ color: 'rgba(255,255,255,0.6)' }}>"{partnerAnswer}"</p>
        </div>

        {/* Your answer */}
        {!submitted ? (
          <div className="flex flex-col gap-3">
            <textarea value={myAnswer} onChange={e => setMyAnswer(e.target.value)}
              placeholder="Your honest answer…" rows={4}
              className="rounded-2xl px-4 py-3 text-sm resize-none outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(147,197,253,0.2)', color: 'rgba(255,255,255,0.82)', caretColor: '#93c5fd', lineHeight: 1.65 }} />
            <ActionBtn label="Share & climb the staircase" onClick={() => {setSubmitted(true);completeActivity('staircase:'+currentLevel,'Staircase level '+currentLevel,step.xp);}}
              color="#93c5fd" disabled={myAnswer.length < 20} icon={<Heart className="w-4 h-4" />} />
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: 'rgba(147,197,253,0.08)', border: '1px solid rgba(147,197,253,0.25)' }}>
            <CheckCircle2 className="w-5 h-5 text-blue-300 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold" style={{ color: '#93c5fd' }}>Reflection saved on this device</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>+{step.xp} XP · Level {currentLevel} completed</p><button className="mobile-text-button" onClick={()=>{if(currentLevel<5){setCurrentLevel(currentLevel+1);setSubmitted(false);setMyAnswer('');}else onBack();}}>{currentLevel<5?'Continue to next level':'Finish staircase'}</button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 5. TEXT ESCAPE ROOM
// ═══════════════════════════════════════════════════════════════

const ROOM_CLUES = {
  me:      ["The painting's eyes follow you.", "A clock stopped at 3:33.", "The bookshelf has a gap."],
  partner: ["A worn rug hides the floor.", "One candle burns shorter.", "The window latch is sticky."],
};
const PUZZLES = [
  { prompt: "You find a 4-digit code panel. Your partner has two of the numbers; you have two. Pool them.", hint: "1-3-3-7" },
  { prompt: "There's a combination lock on the chest. Each of you has half the sequence.", hint: "Left-Right-Left-Left" },
];

function TextEscapeRoom({ onBack }: { onBack: () => void }) {
  const [timeLeft, setTimeLeft] = useState(14 * 60 + 30);
  const [solved, setSolved] = useFlowState('TextEscapeRoom.solved',[false, false]);
  const [chatMsg, setChatMsg] = useFlowState('TextEscapeRoom.chatMsg','');
  const [chat, setChat] = useFlowState('TextEscapeRoom.chat',[
    { from: 'partner', text: "Okay I see the rug thing — there's something carved underneath" },
    { from: 'me', text: "The clock stopped at 3:33. First digit must be 3?" },
  ]);
  const [inv, setInv] = useFlowState('TextEscapeRoom.inv',['📜 Torn page', '🔑 Small key', '🕯 Wax seal']);

  useEffect(() => {
    const t = setInterval(() => setTimeLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const escaped = solved.every(Boolean);

  const sendChat = () => {
    if (!chatMsg.trim()) return;
    setChat(prev => [...prev, { from: 'me', text: chatMsg }]);
    setChatMsg('');
    setTimeout(() => setChat(prev => [...prev, { from: 'partner', text: "Wait, that could work! Try it now." }]), 1200);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#15141d' }}>
      <Header title="Text Escape Room" track="Relational Growth" trackColor="#93c5fd" xp={200} onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4" style={{ scrollbarWidth: 'none' }}>
        {/* Timer + progress */}
        <div className="flex gap-3">
          <div className="flex-1 rounded-xl py-2.5 flex items-center justify-center gap-2"
            style={{ background: timeLeft < 300 ? 'rgba(239,68,68,0.12)' : 'rgba(147,197,253,0.08)', border: `1px solid ${timeLeft < 300 ? 'rgba(239,68,68,0.3)' : 'rgba(147,197,253,0.2)'}` }}>
            <Clock className="w-4 h-4" style={{ color: timeLeft < 300 ? '#f87171' : '#93c5fd', width: 16, height: 16 }} />
            <span className="font-black text-base tabular-nums" style={{ color: timeLeft < 300 ? '#f87171' : '#93c5fd' }}>{mins}:{String(secs).padStart(2, '0')}</span>
          </div>
          <div className="flex-1 rounded-xl py-2.5 flex items-center justify-center gap-2"
            style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
            <Trophy className="w-4 h-4 text-green-400" style={{ width: 16, height: 16 }} />
            <span className="font-black text-base" style={{ color: '#34d399' }}>{solved.filter(Boolean).length} / {solved.length}</span>
          </div>
        </div>

        {/* My clues */}
        <div className="rounded-2xl p-4" style={{ background: 'rgba(147,197,253,0.06)', border: '1px solid rgba(147,197,253,0.15)' }}>
          <p className="text-[9px] font-bold uppercase tracking-widest mb-2.5" style={{ color: 'rgba(147,197,253,0.5)' }}>Your clues (only you can see these)</p>
          {ROOM_CLUES.me.map((c, i) => (
            <div key={i} className="flex items-center gap-2 mb-1.5">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#93c5fd' }} />
              <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.65)' }}>{c}</p>
            </div>
          ))}
        </div>

        {/* Inventory */}
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>Inventory</p>
          <div className="flex flex-wrap gap-2">
            {inv.map(item => (
              <div key={item} className="px-3 py-1.5 rounded-xl text-[11px] font-semibold"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Puzzles */}
        {PUZZLES.map((p, i) => (
          <div key={i} className="rounded-2xl p-4 flex flex-col gap-3"
            style={{ background: solved[i] ? 'rgba(52,211,153,0.07)' : 'rgba(255,255,255,0.03)', border: `1px solid ${solved[i] ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.08)'}` }}>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: solved[i] ? '#34d399' : 'rgba(255,255,255,0.3)' }}>Puzzle {i + 1}</p>
              {solved[i] && <CheckCircle2 className="w-4 h-4 text-green-400" />}
            </div>
            <p className="text-[12px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>{p.prompt}</p>
            {!solved[i] && (
              <div className="flex gap-2">
                <div className="flex-1 rounded-xl px-3 py-2 text-[11px] font-mono"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}>
                  Hint: {p.hint}
                </div>
                <button onClick={() => setSolved(s => { const n = [...s]; n[i] = true; return n; })}
                  className="px-4 py-2 rounded-xl text-[11px] font-bold"
                  style={{ background: 'rgba(147,197,253,0.15)', border: '1px solid rgba(147,197,253,0.3)', color: '#93c5fd' }}>
                  Solved!
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Chat strip */}
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>Co-op channel</p>
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="p-3 flex flex-col gap-2 max-h-28 overflow-y-auto" style={{ background: 'rgba(255,255,255,0.02)', scrollbarWidth: 'none' }}>
              {chat.map((m, i) => (
                <p key={i} className="text-[11px]" style={{ color: m.from === 'me' ? '#93c5fd' : 'rgba(255,255,255,0.5)' }}>
                  <span className="font-bold">{m.from === 'me' ? 'You' : '🌊'}:</span> {m.text}
                </p>
              ))}
            </div>
            <div className="flex gap-2 p-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <input value={chatMsg} onChange={e => setChatMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()}
                placeholder="Share a clue…" className="flex-1 px-3 py-1.5 rounded-lg text-[11px] outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)', caretColor: '#93c5fd' }} />
              <button onClick={sendChat} className="px-3 py-1.5 rounded-lg text-[10px] font-bold"
                style={{ background: 'rgba(147,197,253,0.15)', color: '#93c5fd' }}>Send</button>
            </div>
          </div>
        </div>

        {escaped && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl p-5 text-center"
            style={{ background: 'rgba(52,211,153,0.1)', border: '1.5px solid rgba(52,211,153,0.35)' }}>
            <p className="text-2xl mb-1">🎉</p>
            <p className="text-base font-black text-green-400">Escaped!</p>
            <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>+200 XP · Escape Artist badge earned</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 6. BLIND EMPATHY SWAP
// ═══════════════════════════════════════════════════════════════

const SWAP_TOPICS = [
  { topic: "\"Vulnerability in public is attention-seeking, not strength.\"", assigned: "FOR", color: '#93c5fd' },
  { topic: "\"Cutting off a parent is always a selfish act.\"", assigned: "AGAINST", color: '#f472b6' },
];

function BlindEmpathySwap({ onBack }: { onBack: () => void }) {
  const [argument, setArgument] = useFlowState('BlindEmpathySwap.argument','');
  const [submitted, setSubmitted] = useFlowState('BlindEmpathySwap.submitted',false);
  const [score, setScore] = useFlowState<number | null>('BlindEmpathySwap.score',null);
  const topicIdx = 0;
  const topic = SWAP_TOPICS[topicIdx];

  useEffect(()=>{if(!submitted||score!==null)return;const timer=setTimeout(()=>{setScore(84);completeActivity('empathy-swap','Empathy practice',100);},800);return()=>clearTimeout(timer);},[submitted,score]);
  const handleSubmit = () => {setSubmitted(true);};

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#15141d' }}>
      <Header title="Blind Empathy Swap" track="Relational Growth" trackColor="#93c5fd" xp={100} onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5" style={{ scrollbarWidth: 'none' }}>
        <div className="flex gap-3">
          <StatPill icon={RotateCcw} value="10 min" label="Round" color="#93c5fd" />
          <StatPill icon={Zap} value="+100" label="XP Bonus" color="#fbbf24" />
          <StatPill icon={Users} value="2" label="Players" color="#34d399" />
        </div>

        {/* Assignment card */}
        <div className="rounded-2xl p-4" style={{ background: `${topic.color}0f`, border: `1.5px solid ${topic.color}28` }}>
          <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Statement</p>
          <p className="text-sm font-semibold leading-snug mb-3" style={{ color: 'rgba(255,255,255,0.8)' }}>{topic.topic}</p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: `${topic.color}18`, border: `1px solid ${topic.color}35` }}>
            <span className="text-[10px] font-black" style={{ color: topic.color }}>YOUR POSITION: {topic.assigned}</span>
          </div>
        </div>

        {/* Rules */}
        <div className="rounded-xl p-3.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
            You must argue <span style={{ color: topic.color }}>the assigned position</span> — even if you personally disagree. The goal is to understand it from the inside. Your partner has the opposite assignment.
          </p>
        </div>

        {/* Argument input */}
        {!submitted ? (
          <div className="flex flex-col gap-3">
            <textarea value={argument} onChange={e => setArgument(e.target.value)}
              placeholder="Build your argument here…" rows={6}
              className="rounded-2xl px-4 py-3 text-sm resize-none outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${topic.color}30`, color: 'rgba(255,255,255,0.82)', caretColor: topic.color, lineHeight: 1.65 }} />
            <ActionBtn label="Submit argument" onClick={handleSubmit} color="#93c5fd"
              disabled={argument.length < 60} icon={<Send className="w-4 h-4" />} />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {score === null ? (
              <div className="rounded-2xl p-5 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }} className="mx-auto w-8 h-8 mb-3">
                  <RotateCcw className="w-8 h-8" style={{ color: '#93c5fd' }} />
                </motion.div>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Analysing persuasiveness…</p>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-5 text-center"
                style={{ background: 'rgba(147,197,253,0.08)', border: '1.5px solid rgba(147,197,253,0.25)' }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Persuasion Score</p>
                <p className="text-5xl font-black mb-1" style={{ color: score >= 80 ? '#34d399' : score >= 60 ? '#fbbf24' : '#f87171' }}>{score}</p>
                <p className="text-[11px] mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {score >= 80 ? 'Exceptional empathy unlock. You genuinely inhabited the position.' : score >= 60 ? 'Good effort. Some surface-level reasoning — push deeper next time.' : 'Try to steelman more fully. One strong argument beats five weak ones.'}
                </p>
                <div className="flex justify-center gap-2">
                  <TagChip label="+100 Resonance XP" color="#93c5fd" />
                  {score >= 85 && <TagChip label="Deep Diver ✓" color="#fbbf24" />}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 7. MENTORSHIP GAUNTLET
// ═══════════════════════════════════════════════════════════════

const GAUNTLET_DAYS = [
  { day: 1, task: "Send a genuine welcome — no script. Make them feel seen, not processed.",             done: true  },
  { day: 2, task: "Ask them one open question about what brought them here. Listen.",                   done: true  },
  { day: 3, task: "Share one thing that confused you in your first week here.",                         done: true  },
  { day: 4, task: "Challenge them gently — push back on one thing they said. Be kind.",                 done: false },
  { day: 5, task: "Celebrate a small win they had. Make it specific, not generic.",                    done: false },
  { day: 6, task: "Give them a scenario. Guide without solving.",                                       done: false },
  { day: 7, task: "Write them a closing note. What growth did you witness this week?",                  done: false },
];

function MentorshipGauntlet({ onBack }: { onBack: () => void }) {
  const [days, setDays] = useFlowState('MentorshipGauntlet.days',GAUNTLET_DAYS);
  const [note, setNote] = useFlowState('MentorshipGauntlet.note','');
  const doneCount = days.filter(d => d.done).length;
  const today = days.findIndex(d => !d.done);

  useEffect(()=>{if(doneCount===7)completeActivity('mentorship','Mentorship practice',500);},[doneCount]);
  const markDone = (i: number) => setDays(prev => prev.map((d, idx) => idx === i ? { ...d, done: true } : d));

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#15141d' }}>
      <Header title="Mentorship Gauntlet" track="Community Leadership" trackColor="#fcd34d" xp={500} onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5" style={{ scrollbarWidth: 'none' }}>
        {/* Mentee card */}
        <div className="rounded-2xl p-4 flex items-center gap-4"
          style={{ background: 'rgba(252,211,77,0.07)', border: '1px solid rgba(252,211,77,0.2)' }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
            style={{ background: 'rgba(252,211,77,0.15)', border: '1px solid rgba(252,211,77,0.3)' }}>🌱</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.8)' }}>Anonymous #2891</p>
            <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>New member · Day 4 together</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-black" style={{ color: '#fcd34d' }}>{doneCount}/7</p>
            <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>days done</p>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>7-Day Campaign</p>
            <p className="text-[10px] font-bold" style={{ color: '#fcd34d' }}>{Math.round((doneCount / 7) * 100)}%</p>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <motion.div className="h-full rounded-full" animate={{ width: `${(doneCount / 7) * 100}%` }}
              transition={{ duration: 0.6 }} style={{ background: 'linear-gradient(90deg, #fcd34d, #f59e0b)' }} />
          </div>
        </div>

        {/* Day tasks */}
        <div className="flex flex-col gap-2">
          {days.map((d, i) => (
            <div key={i} className="rounded-2xl p-3.5 flex items-start gap-3"
              style={{ background: d.done ? 'rgba(52,211,153,0.07)' : i === today ? 'rgba(252,211,77,0.08)' : 'rgba(255,255,255,0.02)', border: `1px solid ${d.done ? 'rgba(52,211,153,0.2)' : i === today ? 'rgba(252,211,77,0.25)' : 'rgba(255,255,255,0.06)'}` }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-black"
                style={{ background: d.done ? '#34d399' : i === today ? '#fcd34d' : 'rgba(255,255,255,0.06)', color: d.done || i === today ? '#15141d' : 'rgba(255,255,255,0.3)' }}>
                {d.done ? '✓' : d.day}
              </div>
              <p className="flex-1 text-[12px] leading-relaxed" style={{ color: d.done ? 'rgba(255,255,255,0.45)' : i === today ? 'rgba(255,255,255,0.82)' : 'rgba(255,255,255,0.3)' }}>{d.task}</p>
              {i === today && !d.done && (
                <button onClick={() => markDone(i)} className="flex-shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-bold"
                  style={{ background: 'rgba(252,211,77,0.15)', border: '1px solid rgba(252,211,77,0.3)', color: '#fcd34d' }}>
                  Done ✓
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Roots badge preview */}
        {doneCount >= 5 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-4 flex items-center gap-4"
            style={{ background: 'rgba(252,211,77,0.08)', border: '1.5px solid rgba(252,211,77,0.3)' }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: 'rgba(252,211,77,0.2)' }}>🎓</div>
            <div>
              <p className="text-sm font-black" style={{ color: '#fcd34d' }}>{doneCount===7?'Practice complete · Roots badge earned':'Roots badge progress'}</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Complete all 7 days to earn the permanent Roots badge</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 8. CRUCIBLE DEBATES
// ═══════════════════════════════════════════════════════════════

const DEBATE_MOTION = "This House Believes emotional intelligence is more important than technical skill in any career.";
const DEBATE_MSGS = [
  { team: 'blue', user: 'Phantom_X', text: "EQ is the differentiator at the top — everyone in the room is technically competent. The one who reads the room wins." },
  { team: 'red', user: 'Neon_Star', text: "Survivorship bias. You only see the EQ people who also had the skills. Without the technical baseline, EQ is just charm." },
  { team: 'blue', user: 'Luna_W', text: "Managers consistently rate soft skills as their biggest hiring gap. That's not anecdote — that's systematic data." },
  { team: 'red', user: 'GhostWriter_7', text: "That gap exists because skills are easier to test for. Ask those same managers if they'd take a charming incompetent — they wouldn't." },
];

function CrucibleDebates({ onBack }: { onBack: () => void }) {
  const [myArg, setMyArg] = useFlowState('CrucibleDebates.myArg','');
  const [posted, setPosted] = useFlowState('CrucibleDebates.posted',false);
  const [heat, setHeat] = useFlowState('CrucibleDebates.heat',62);
  const [messages] = useFlowState('CrucibleDebates.messages',DEBATE_MSGS);

  const post = () => {
    if (!myArg.trim()) return;
    setPosted(true);
    setHeat(h => Math.min(100, h + 8));
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#15141d' }}>
      <Header title="Crucible Debates" track="Community Leadership" trackColor="#fcd34d" xp={120} onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5" style={{ scrollbarWidth: 'none' }}>
        {/* Motion card */}
        <div className="rounded-2xl p-4" style={{ background: 'rgba(252,211,77,0.07)', border: '1.5px solid rgba(252,211,77,0.22)' }}>
          <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(252,211,77,0.5)' }}>This Week's Motion</p>
          <p className="text-sm font-semibold leading-snug" style={{ color: 'rgba(255,255,255,0.85)' }}>{DEBATE_MOTION}</p>
          <div className="flex items-center gap-2 mt-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
              <div className="w-2 h-2 rounded-full" style={{ background: '#818cf8' }} />
              <span className="text-[9px] font-bold" style={{ color: '#818cf8' }}>You — FOR</span>
            </div>
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>vs</span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <div className="w-2 h-2 rounded-full" style={{ background: '#f87171' }} />
              <span className="text-[9px] font-bold" style={{ color: '#f87171' }}>4 — AGAINST</span>
            </div>
          </div>
        </div>

        {/* Heat meter */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" style={{ color: heat > 75 ? '#ef4444' : '#f97316', width: 14, height: 14 }} />
              <span className="text-[10px] font-bold" style={{ color: heat > 75 ? '#ef4444' : '#f97316' }}>Guild Heat: {heat}</span>
            </div>
            {heat > 80 && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>⚠ Cooling prompt soon</span>}
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <motion.div className="h-full rounded-full" animate={{ width: `${heat}%` }}
              style={{ background: heat > 80 ? '#ef4444' : heat > 60 ? '#f97316' : '#fbbf24' }} />
          </div>
        </div>

        {/* Debate thread */}
        <div className="flex flex-col gap-2.5">
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: msg.team === 'blue' ? -10 : 10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl p-3.5"
              style={{ background: msg.team === 'blue' ? 'rgba(99,102,241,0.1)' : 'rgba(239,68,68,0.08)', border: `1px solid ${msg.team === 'blue' ? 'rgba(99,102,241,0.22)' : 'rgba(239,68,68,0.18)'}` }}>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: msg.team === 'blue' ? '#818cf8' : '#f87171' }} />
                <span className="text-[10px] font-bold" style={{ color: msg.team === 'blue' ? '#818cf8' : '#f87171' }}>{msg.user}</span>
                <span className="text-[8px] font-bold uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>{msg.team === 'blue' ? 'FOR' : 'AGAINST'}</span>
              </div>
              <p className="text-[12px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>{msg.text}</p>
            </motion.div>
          ))}
        </div>

        {/* Your contribution */}
        {!posted ? (
          <div className="flex flex-col gap-2.5">
            <textarea value={myArg} onChange={e => setMyArg(e.target.value)}
              placeholder="Add your argument for the FOR side…" rows={3}
              className="rounded-2xl px-4 py-3 text-sm resize-none outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(99,102,241,0.25)', color: 'rgba(255,255,255,0.82)', caretColor: '#818cf8', lineHeight: 1.65 }} />
            <ActionBtn label="Post to chamber" onClick={post} color="#fcd34d" disabled={myArg.length < 20} icon={<MessageCircle className="w-4 h-4" />} />
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)' }}>
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: '#818cf8' }} />
            <div>
              <p className="text-sm font-bold" style={{ color: '#a5b4fc' }}>Argument posted to chamber</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Guild will vote on most persuasive case · +120 XP earned</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 9. LORE BOUNTIES
// ═══════════════════════════════════════════════════════════════

const ACTIVE_BOUNTY = {
  title: "The First Fracture",
  brief: "Write the canonical account of the first time a user triggered the Fractured Root protocol. What happened? Who was involved? What did the community learn from it? This will be permanently enshrined in the Platform Lore if it wins the vote.",
  deadline: "3 days left",
  prize: "500 XP · World-Builder badge · Permanent enshrinement",
  submissions: 7,
};

const ENSHRINED = [
  { title: "The Founding of the Crucible", author: "Anon #1192", votes: 284, excerpt: "In the third month, the heat was unmanageable. A guild of five decided to bottle it — and from their argument, the first Crucible was born…" },
  { title: "Ghost Writers & The Mirror Protocol", author: "Anon #3341", votes: 198, excerpt: "The day the Shadow Simulator went live, one user sat for six hours talking to their mirror. They emerged changed. We have their words." },
];

function LoreBounties({ onBack }: { onBack: () => void }) {
  const [submission, setSubmission] = useFlowState('LoreBounties.submission','');
  const [submitted, setSubmitted] = useFlowState('LoreBounties.submitted',false);
  const [tab, setTab] = useFlowState<'bounty' | 'lore'>('LoreBounties.tab','bounty');

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#15141d' }}>
      <Header title="Lore Bounties" track="Community Leadership" trackColor="#fcd34d" xp={500} onBack={onBack} />

      {/* Tab bar */}
      <div className="flex-shrink-0 flex px-5 pt-4 gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        {(['bounty', 'lore'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="pb-3 px-1 text-sm font-bold capitalize transition-all"
            style={{ color: tab === t ? '#fcd34d' : 'rgba(255,255,255,0.3)', borderBottom: `2px solid ${tab === t ? '#fcd34d' : 'transparent'}` }}>
            {t === 'bounty' ? 'Active Bounty' : 'Enshrined Lore'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5" style={{ scrollbarWidth: 'none' }}>
        <AnimatePresence mode="wait">
          {tab === 'bounty' ? (
            <motion.div key="bounty" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
              {/* Bounty card */}
              <div className="rounded-2xl p-4" style={{ background: 'rgba(252,211,77,0.07)', border: '1.5px solid rgba(252,211,77,0.25)' }}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-base font-black" style={{ color: '#fcd34d' }}>{ACTIVE_BOUNTY.title}</p>
                  <span className="text-[9px] font-bold px-2 py-1 rounded-full flex-shrink-0"
                    style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                    {ACTIVE_BOUNTY.deadline}
                  </span>
                </div>
                <p className="text-[12px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{ACTIVE_BOUNTY.brief}</p>
                <div className="mt-3 pt-3 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="flex gap-2">
                    <TagChip label="500 XP" color="#fbbf24" />
                    <TagChip label="World-Builder" color="#fcd34d" />
                    <TagChip label="Enshrined" color="#a78bfa" />
                  </div>
                  <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{ACTIVE_BOUNTY.submissions} submissions</span>
                </div>
              </div>

              {/* Writing area */}
              {!submitted ? (
                <div className="flex flex-col gap-3">
                  <textarea value={submission} onChange={e => setSubmission(e.target.value)}
                    placeholder="Write your lore here — make it worthy of enshrinement…" rows={8}
                    className="rounded-2xl px-4 py-3.5 text-sm resize-none outline-none"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(252,211,77,0.15)', color: 'rgba(255,255,255,0.82)', caretColor: '#fcd34d', lineHeight: 1.7 }} />
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{submission.length} / 2000 chars</span>
                    <span className="text-[10px]" style={{ color: submission.length >= 200 ? '#34d399' : 'rgba(255,255,255,0.2)' }}>
                      {submission.length >= 200 ? '✓ Min length reached' : `${200 - submission.length} more to submit`}
                    </span>
                  </div>
                  <ActionBtn label="Save writing in preview" onClick={() => {setSubmitted(true);completeActivity('lore-bounty','Lore writing practice',100);}}
                    color="#fcd34d" disabled={submission.length < 200} icon={<BookOpen className="w-4 h-4" />} />
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl p-5 text-center"
                  style={{ background: 'rgba(252,211,77,0.08)', border: '1.5px solid rgba(252,211,77,0.3)' }}>
                  <span className="text-4xl">📜</span>
                  <p className="text-base font-black mt-2" style={{ color: '#fcd34d' }}>Writing saved on this device</p>
                  <p className="text-[11px] mt-1.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Your practice submission is complete. No community vote is sent in this preview.
                  </p>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div key="lore" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
              {ENSHRINED.map((entry, i) => (
                <div key={i} className="rounded-2xl p-4" style={{ background: 'rgba(167,139,250,0.07)', border: '1px solid rgba(167,139,250,0.2)' }}>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="text-sm font-black" style={{ color: '#c4b5fd' }}>{entry.title}</p>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Star className="w-3 h-3" style={{ color: '#fbbf24', width: 12, height: 12 }} />
                      <span className="text-[10px] font-bold" style={{ color: '#fbbf24' }}>{entry.votes}</span>
                    </div>
                  </div>
                  <p className="text-[10px] mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>by {entry.author}</p>
                  <p className="text-[12px] italic leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>"{entry.excerpt}"</p>
                  <div className="mt-2 flex gap-2">
                    <TagChip label="Enshrined ✓" color="#a78bfa" />
                    <TagChip label="World-Builder" color="#fcd34d" />
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ROOT ROUTER
// ═══════════════════════════════════════════════════════════════

const FEATURE_MAP: Record<string, (props: { onBack: () => void }) => React.ReactElement> = {
  'shadow-simulator':       ({ onBack }) => <ShadowSimulator onBack={onBack} />,
  'scenario-spinner':       ({ onBack }) => <ScenarioSpinner onBack={onBack} />,
  'skill-tree-journal':     ({ onBack }) => <SkillTreeJournal onBack={onBack} />,
  'vulnerability-staircase':({ onBack }) => <VulnerabilityStaircase onBack={onBack} />,
  'text-escape-room':       ({ onBack }) => <TextEscapeRoom onBack={onBack} />,
  'blind-empathy-swap':     ({ onBack }) => <BlindEmpathySwap onBack={onBack} />,
  'mentorship-gauntlet':    ({ onBack }) => <MentorshipGauntlet onBack={onBack} />,
  'crucible-debates':       ({ onBack }) => <CrucibleDebates onBack={onBack} />,
  'lore-bounties':          ({ onBack }) => <LoreBounties onBack={onBack} />,
};

export function GrowFeaturePage({ featureId, onBack }: GrowFeaturePageProps) {
  const Page = FEATURE_MAP[featureId];
  if (!Page) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#15141d' }}>
        <p className="text-2xl">🌱</p>
        <p className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>Feature not found: {featureId}</p>
        <button onClick={onBack} aria-label="Back" className="text-sm" style={{ color: '#6ee7b7' }}>← Back</button>
      </div>
    );
  }
  return <Page onBack={onBack} />;
}
