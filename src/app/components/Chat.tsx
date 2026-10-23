import { dailyDeckCard } from '../mobile/dailyDeck';
import {ReportDialog,JourneyDialog} from '../mobile/JourneyDialog';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useDeviceState } from '../mobile/state';
import { conversationProfile, conversationHeatKey, heatValue } from '../mobile/conversationProfiles';
import { ConversationHeat, HeatDetails } from '../mobile/ConversationHeat';
import {
  ChevronLeft, MoreVertical, Send, Shield, Plus, X,
  Dice6, Flame, Brain, Zap, Flag, Star, Sparkles,
  Check, Layers, Video, Mic, Hash, Gamepad2,
  Heart, Link, TrendingUp, Trophy, ArrowLeftRight, Activity, Smile,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────

interface ChatProps { onOpenGames?: () => void; deckId?: string; onReturnToDeck?: () => void; chatId: string; onBack: () => void; onViewProfile?: () => void; }

interface HotTakeGame   { type: 'hottake';  statement: string; status: 'active'|'resolved'; myVote?: 'agree'|'disagree'; agrees: number; disagrees: number; }
interface FateRollGame  { type: 'fateroll'; rolled: boolean; face?: number; result?: string; }
interface TwoTruthGame  { type: 'twotruth'; statements: string[]; lieIndex: number; status: 'active'|'resolved'; guess?: number; }
interface BountyGame    { type: 'bounty';   question: string; xp: number; status: 'active'|'resolved'; answer?: string; }
interface DareGame      { type: 'dare';     dare: string; xp: number; status: 'active'|'accepted'|'passed'; }
interface ChainGame     { type: 'chain';    sentences: string[]; sealed: boolean; turns?: number; }
interface ConfessGame   { type: 'confess';  confession: string; reactions: { witnessed: number; same: number; held: number }; myReaction?: string; }
interface MirrorGame    { type: 'mirror';   question: string; myAnswer?: string; similarity?: number; status: 'answering'|'revealed'; }
interface PredictGame   { type: 'predict';  prediction: string; yesPool: number; noPool: number; myBet?: 'yes'|'no'; status: 'active'|'resolved'; outcome?: boolean; }
interface TriviaGame    { type: 'trivia';   question: string; options: string[]; correctIndex: number; myChoice?: number; status: 'active'|'resolved'; }

interface QuestionGame {type:'question';question:string;options:string[];choice?:string;status:'active'|'resolved';}

type GameData = HotTakeGame | FateRollGame | TwoTruthGame | BountyGame |
  DareGame | ChainGame | ConfessGame | MirrorGame | PredictGame | TriviaGame | QuestionGame;

interface Message {
  id: string; role: 'me'|'other'; text?: string; timestamp: string;
  deckId?: string; scenarioId?: string; aiModified?: boolean; game?: GameData; sealed?: boolean; canonGlow?: boolean;
}

// ─── Constants ───────────────────────────────────────────────

const FATE_OUTCOMES = [
  'Your character finds an unopened letter beneath a quiet café table.',
  'A tiny robot asks your character to teach it a new word.',
  'A hidden doorway appears each time your character laughs.',
  'A traveller offers your character a map of places that do not exist yet.',
  'The village library lends your character a book with one blank page.',
  'Your character hears a familiar song from an empty room.',
];
const DARE_PROMPTS = [
  {dare:'Invent a nickname for a friendly robot.',xp:0},
  {dare:'Describe your day in three words.',xp:0},
  {dare:'Name one song you enjoy.',xp:0},
  {dare:'Find one colour you like around you.',xp:0},
  {dare:'Share a tiny goal for today.',xp:0},
];

const CHAIN_OPENERS = [
  ["The door opened and nobody was on the other side.", "But the shadow on the floor said otherwise."],
  ["She deleted the message before sending it.", "It didn't matter — the algorithm had already read it."],
  ["He built a life that looked perfect from the outside.", "On the inside, the walls were made of deferred decisions."],
];

const CONFESSIONS = [
  "I pretend to understand things I don't because I'm afraid of being seen as slow.",
  "I miss people I've never met — versions of them I invented.",
  "I've been practicing being okay with loneliness. Sometimes it works.",
  "I keep having the same argument with someone who's been dead for two years.",
];

const TRIVIA = [
  { question: "Which part of the brain is most associated with emotional memory?", options: ["Prefrontal cortex", "Amygdala", "Cerebellum", "Hippocampus"], correctIndex: 1 },
  { question: "What psychological term describes the discomfort of holding two conflicting beliefs?", options: ["Cognitive dissonance", "Dunning-Kruger effect", "Projection", "Anchoring bias"], correctIndex: 0 },
  { question: "The 'spotlight effect' is the tendency to believe:", options: ["You are always right", "Others notice you more than they do", "Social media is reality", "Others are less self-aware"], correctIndex: 1 },
];

const PREDICTIONS = [
  {prediction:'Will our fictional starship discover a new planet?',yesPool:1240,noPool:860},
  {prediction:'Will the moon café be busy on its opening night?',yesPool:720,noPool:1580},
  {prediction:'Will the village cat become its unofficial mayor?',yesPool:990,noPool:450},
];
const MIRROR_Q = [
  'What small thing made you curious recently?',
  'What would you like to make more time for?',
  'What is one thing you enjoy learning about?',
];

const MOOD_TAGS = [
  { label: 'Overwhelmed', color: '#8169ec' }, { label: 'Energized', color: '#f59e0b' },
  { label: 'Low-key', color: '#64748b' },     { label: 'Gentle', color: '#10b981' },
  { label: 'Focused', color: '#ec4899' },      { label: 'Restless', color: '#3b82f6' },
  { label: 'Excited', color: '#ef4444' },    { label: 'Calm', color: '#8b5cf6' },
  { label: 'Playful', color: '#f97316' },      { label: 'Curious', color: '#06b6d4' },
  { label: 'Thoughtful', color: '#6366f1' },    { label: 'Honest', color: '#e11d48' },
];

const SLASH_COMMANDS = [
  { cmd: '/roll',    Icon: Dice6,          label: 'Fate Roll',           desc: 'Roll a die for a playful story prompt',                color: 'text-amber-400',   bg: 'bg-amber-500/15'   },
  { cmd: '/hottake', Icon: Flame,          label: 'Hot Take',      desc: 'Read a statement. Pick your side.',         color: 'text-orange-400',  bg: 'bg-orange-500/15'  },
  { cmd: '/bounty',  Icon: Zap,            label: 'Question Swap',           desc: 'Answer a sample question in your own words',         color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  { cmd: '/truth',   Icon: Layers,         label: 'Two Truths & a Mask', desc: 'Guess the made-up sample fact',                   color: 'text-pink-400',    bg: 'bg-pink-500/15'    },
  { cmd: '/quiz',    Icon: Brain,          label: 'Conversation Question',  desc: 'Pick how you’d like to chat',             color: 'text-cyan-400',    bg: 'bg-cyan-500/15'    },
  { cmd: '/mood',    Icon: Sparkles,       label: 'Share Your Mood',          desc: 'Choose mood words to share in this chat',        color: 'text-violet-400',  bg: 'bg-violet-500/15'  },
  { cmd: '/dare',    Icon: Activity,       label: 'Small Challenge',           desc: 'Try a small challenge, or pass',            color: 'text-red-400',     bg: 'bg-red-500/15'     },
  { cmd: '/chain',   Icon: Link,           label: 'Story Chain',         desc: 'Add three lines to finish a tiny story',         color: 'text-teal-400',    bg: 'bg-teal-500/15'    },
  { cmd: '/confess', Icon: Heart,          label: 'Kind Response',      desc: 'Respond kindly to a written sample',   color: 'text-rose-400',    bg: 'bg-rose-500/15'    },
  { cmd: '/mirror',  Icon: ArrowLeftRight, label: 'One Honest Answer',        desc: 'Write one answer, without a score',  color: 'text-sky-400',     bg: 'bg-sky-500/15'     },
  { cmd: '/predict', Icon: TrendingUp,     label: 'What If?',   desc: 'Make a playful prediction. No stakes.',       color: 'text-lime-400',    bg: 'bg-lime-500/15'    },
  { cmd: '/trivia',  Icon: Trophy,         label: 'Quick Trivia',         desc: 'One question. Tap to reveal the answer',     color: 'text-yellow-400',  bg: 'bg-yellow-500/15'  },
];

const INITIAL_MESSAGES: Message[] = [
  {id:'welcome',role:'other',timestamp:'Sample',text:'Hey! What would you like to talk about today?'},
];
const QUICK_GAME_HINTS: Record<GameData['type'], string> = {
  hottake:'Read the statement. Choose agree or disagree.', fateroll:'Roll once to reveal a playful story prompt.',
  twotruth:'Two sample facts are true. Tap the made-up one.', bounty:'Write a short answer. It saves in this chat.',
  dare:'Try a small challenge, or pass. Either choice is welcome.', chain:'Add three lines, one at a time, to finish a tiny story.',
  confess:'Read the sample and choose a supportive reaction.', mirror:'Answer one question. No compatibility score is calculated.',
  question:'Choose how you would like to chat. Share it as a starting point.',
  predict:'Choose a prediction. No XP is wagered or future result checked.', trivia:'Pick an answer to reveal the correct one.',
};

// ─── Game Card Components ─────────────────────────────────────

function HotTakeCard({ game, messageId, onVote, isActive }: { game: HotTakeGame; messageId: string; onVote: (id: string, vote: 'agree'|'disagree') => void; isActive: boolean }) {
  const total = game.agrees + game.disagrees;
  const agreePercent = total > 0 ? Math.round((game.agrees / total) * 100) : 50;
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(234,88,12,0.09), rgba(239,68,68,0.06))', border: '1px solid rgba(249,115,22,0.18)' }}>
      <div className="px-4 pt-3 pb-2.5 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(249,115,22,0.1)' }}>
        <Flame className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
        <span className="text-orange-300/65 text-[10px] font-semibold tracking-widest uppercase">Hot Take Radar</span>
        {game.status === 'resolved' && <span className="ml-auto text-[10px] text-white/25 font-mono">{total} cast</span>}
      </div>
      <div className="px-4 py-3.5"><p className="text-white/85 text-sm leading-relaxed font-medium">{game.statement}</p></div>
      {game.status === 'resolved' ? (
        <div className="px-4 pb-4 space-y-2.5">
          <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="absolute left-0 top-0 h-full rounded-full transition-all duration-700" style={{ width: `${agreePercent}%`, background: 'linear-gradient(90deg, #10b981, #34d399)' }} />
          </div>
          <div className="flex justify-between">
            <span className="text-emerald-400/70 text-xs">{agreePercent}% agree</span>
            <span className="text-red-400/60 text-xs">{100 - agreePercent}% disagree</span>
          </div>
          {game.myVote && <p className="text-center text-[11px] text-white/25">You voted <span className={game.myVote === 'agree' ? 'text-emerald-400/60' : 'text-red-400/60'}>{game.myVote}</span></p>}
        </div>
      ) : isActive ? (
        <div className="px-4 pb-3"><p className="text-center text-[11px] text-orange-300/40 animate-pulse">Use the input bar to vote ↓</p></div>
      ) : null}
    </div>
  );
}

function FateRollCard({ game, messageId, onRoll }: { game: FateRollGame; messageId: string; onRoll: (id: string) => void }) {
  const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(109,40,217,0.1), rgba(79,70,229,0.07))', border: '1px solid rgba(139,92,246,0.18)' }}>
      <div className="px-4 pt-3 pb-2.5 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(139,92,246,0.1)' }}>
        <Dice6 className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
        <span className="text-violet-300/65 text-[10px] font-semibold tracking-widest uppercase">Fate Roll</span>
      </div>
      <div className="px-4 py-5 flex flex-col items-center gap-3">
        {!game.rolled ? (
          <button aria-label="Roll die" onClick={() => onRoll(messageId)} className="flex flex-col items-center gap-3 group">
            <motion.span animate={{ rotate: [0,-12,12,-8,8,0] }} transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }} className="text-5xl select-none">🎲</motion.span>
            <span className="text-violet-300/50 text-sm group-hover:text-violet-300/75 transition-colors">Tap to cast your fate</span>
          </button>
        ) : (
          <>
            <motion.span initial={{ scale: 0.5, rotate: -20, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ type: 'spring', damping: 12, stiffness: 200 }} className="text-5xl select-none">{game.face ? faces[game.face - 1] : '⚅'}</motion.span>
            <p className="text-white/70 text-sm text-center leading-relaxed italic px-2">"{game.result}"</p>
          </>
        )}
      </div>
    </div>
  );
}

function TwoTruthsCard({ game, messageId, onGuess }: { game: TwoTruthGame; messageId: string; onGuess: (id: string, index: number) => void }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.08), rgba(168,85,247,0.07))', border: '1px solid rgba(236,72,153,0.15)' }}>
      <div className="px-4 pt-3 pb-2.5 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(236,72,153,0.08)' }}>
        <Layers className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />
        <span className="text-pink-300/65 text-[10px] font-semibold tracking-widest uppercase">Two Truths & a Mask</span>
      </div>
      <div className="px-4 pt-3 pb-4 space-y-2">
        <p className="text-white/35 text-xs mb-3">One of these is a lie. Tap to guess.</p>
        {game.statements.map((s, i) => {
          const isLie = i === game.lieIndex; const isGuessed = game.guess === i; const resolved = game.status === 'resolved';
          return (
            <button key={i} onClick={() => game.status === 'active' && onGuess(messageId, i)} disabled={resolved} className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm transition-all"
              style={{ background: resolved ? isLie ? 'rgba(239,68,68,0.12)' : isGuessed ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.04)', border: resolved ? isLie ? '1px solid rgba(239,68,68,0.28)' : isGuessed ? '1px solid rgba(16,185,129,0.28)' : '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(255,255,255,0.07)', color: resolved ? isLie ? '#fca5a5' : isGuessed ? '#6ee7b7' : 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.75)' }}>
              {resolved && isLie && <span className="text-red-400 mr-2 text-xs">✗</span>}
              {resolved && isGuessed && !isLie && <span className="text-emerald-400 mr-2 text-xs">✓</span>}
              {s}
            </button>
          );
        })}
        {game.status === 'resolved' && game.guess !== undefined && (
          <p className="text-center text-[11px] text-white/30 pt-1">{game.guess === game.lieIndex ? '🎯 You spotted the mask' : 'The mask is highlighted above'}</p>
        )}
      </div>
    </div>
  );
}

function BountyCard({ game, messageId, onActivate, isActive }: { game: BountyGame; messageId: string; onActivate: (id: string) => void; isActive: boolean }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(5,150,105,0.05))', border: '1px solid rgba(16,185,129,0.15)' }}>
      <div className="px-4 pt-3 pb-2.5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(16,185,129,0.08)' }}>
        <div className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /><span className="text-emerald-300/65 text-[10px] font-semibold tracking-widest uppercase">Question Swap</span></div>
        <div className="flex items-center gap-1 rounded-full px-2 py-0.5" style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }}><Star className="w-3 h-3 text-amber-400" /><span className="text-amber-300/80 text-[11px] font-mono">1 question</span></div>
      </div>
      <div className="px-4 py-3.5 space-y-3">
        <p className="text-white/80 text-sm leading-relaxed">{game.question}</p>
        {game.status === 'active' && !isActive && <button onClick={() => onActivate(messageId)} className="w-full py-2 rounded-xl text-emerald-400 text-sm font-medium transition-all hover:opacity-90" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>Write an answer →</button>}
        {game.status === 'active' && isActive && <p className="text-center text-[11px] text-emerald-300/35 animate-pulse">Type your answer below ↓</p>}
        {game.status === 'resolved' && game.answer && (
          <div className="px-3 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(16,185,129,0.1)' }}>
            <p className="text-white/35 text-[10px] mb-1 font-mono uppercase tracking-wider">Your answer</p>
            <p className="text-white/75 text-sm">{game.answer}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function DareCard({ game, messageId, onRespond }: { game: DareGame; messageId: string; onRespond: (id: string, r: 'accepted'|'passed') => void }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.09), rgba(220,38,38,0.05))', border: '1px solid rgba(239,68,68,0.18)' }}>
      <div className="px-4 pt-3 pb-2.5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(239,68,68,0.1)' }}>
        <div className="flex items-center gap-2"><Activity className="w-3.5 h-3.5 text-red-400 flex-shrink-0" /><span className="text-red-300/65 text-[10px] font-semibold tracking-widest uppercase">Small Challenge</span></div>
        <div className="flex items-center gap-1 rounded-full px-2 py-0.5" style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }}><Star className="w-3 h-3 text-amber-400" /><span className="text-amber-300/80 text-[11px] font-mono">Optional</span></div>
      </div>
      <div className="px-4 py-4 space-y-4">
        <p className="text-white/85 text-sm leading-relaxed font-medium">{game.dare}</p>
        {game.status === 'active' && (
          <div className="flex gap-2">
            <button onClick={() => onRespond(messageId, 'accepted')} className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all" style={{ background: 'rgba(239,68,68,0.13)', border: '1px solid rgba(239,68,68,0.28)', color: '#fca5a5' }}>Try this</button>
            <button onClick={() => onRespond(messageId, 'passed')} className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' }}>Pass</button>
          </div>
        )}
        {game.status === 'accepted' && <p className="text-center text-sm font-semibold" style={{ color: '#fca5a5' }}>🔥 Dare accepted — speak your truth</p>}
        {game.status === 'passed' && <p className="text-center text-[11px]" style={{ color: 'rgba(255,255,255,0.22)' }}>Passed · You can choose another game</p>}
      </div>
    </div>
  );
}

function ChainCard({ game, messageId, onAppend }: { game: ChainGame; messageId: string; onAppend: (id:string, line:string) => void }) {
  const [draft,setDraft]=useDeviceState('story-line:'+messageId,'');
  const send=()=>{if(!draft.trim())return;onAppend(messageId,draft.trim());setDraft('');};
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.09), rgba(6,182,212,0.05))', border: '1px solid rgba(20,184,166,0.18)' }}>
      <div className="px-4 pt-3 pb-2.5 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(20,184,166,0.1)' }}>
        <Link className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
        <span className="text-teal-300/65 text-[10px] font-semibold tracking-widest uppercase">Story Chain</span>
        <span className="ml-auto text-[10px] text-white/20 font-mono">{game.sentences.length} lines</span>
      </div>
      <div className="px-4 py-4 space-y-2.5">
        {game.sentences.map((s, i) => (
          <div key={i} className="flex gap-2.5 items-start">
            <span className="text-[9px] font-mono mt-1 flex-shrink-0" style={{ color: `rgba(${i % 2 === 0 ? '94,234,212' : '103,232,249'},0.45)` }}>{String(i + 1).padStart(2, '0')}</span>
            <p className="text-sm leading-relaxed" style={{ color: i === game.sentences.length - 1 ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.45)', fontStyle: i === game.sentences.length - 1 ? 'normal' : 'italic' }}>{s}</p>
          </div>
        ))}
        {!game.sealed && <div className="flex items-center gap-2 pt-1" style={{ borderTop: '1px dashed rgba(20,184,166,0.15)' }}><div className="w-1 h-1 rounded-full animate-pulse" style={{ background: '#2dd4bf' }} /><p className="text-[11px]" style={{ color: 'rgba(45,212,191,0.4)' }}>Your turn · {(game.turns||0)+1} of 3</p></div>}
        {!game.sealed && <div className="quick-story-input"><label htmlFor={'story-line-'+messageId}>Your next line</label><textarea id={'story-line-'+messageId} aria-label="Story line" value={draft} maxLength={400} onChange={event=>setDraft(event.target.value)} placeholder="One sentence is enough…" rows={2}/><button className="mobile-secondary-button" disabled={!draft.trim()} onClick={send}>Add line</button></div>}
        {game.sealed && <p className="text-center text-[11px]" style={{ color: 'rgba(255,255,255,0.2)' }}>✓ Story complete · 3 turns saved</p>}
      </div>
    </div>
  );
}

function ConfessCard({ game, messageId, onReact }: { game: ConfessGame; messageId: string; onReact: (id: string, r: string) => void }) {
  const total = game.reactions.witnessed + game.reactions.same + game.reactions.held;
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(244,63,94,0.08), rgba(236,72,153,0.05))', border: '1px solid rgba(244,63,94,0.15)' }}>
      <div className="px-4 pt-3 pb-2.5 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(244,63,94,0.09)' }}>
        <Heart className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
        <span className="text-rose-300/65 text-[10px] font-semibold tracking-widest uppercase">Kind Response</span>
        {total > 0 && <span className="ml-auto text-[10px] text-white/20 font-mono">{total} held</span>}
      </div>
      <div className="px-4 py-4 space-y-4">
        <p className="text-white/75 text-sm leading-relaxed italic">"{game.confession}"</p>
        <div className="flex gap-2">
          {[
            { key: 'witnessed', emoji: '👁️', label: 'I hear you', count: game.reactions.witnessed },
            { key: 'same',      emoji: '🕯️', label: 'Me too',      count: game.reactions.same },
            { key: 'held',      emoji: '💜', label: 'Sending care',       count: game.reactions.held },
          ].map(({ key, emoji, label, count }) => (
            <button key={key} onClick={() => !game.myReaction && onReact(messageId, key)} disabled={!!game.myReaction}
              className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs transition-all"
              style={{ background: game.myReaction === key ? 'rgba(244,63,94,0.14)' : 'rgba(255,255,255,0.04)', border: `1px solid ${game.myReaction === key ? 'rgba(244,63,94,0.3)' : 'rgba(255,255,255,0.07)'}`, color: game.myReaction === key ? '#fda4af' : 'rgba(255,255,255,0.45)' }}>
              <span className="text-base">{emoji}</span>
              <span>{count > 0 ? count : label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MirrorCard({ game, messageId, onAnswer }: { game: MirrorGame; messageId: string; onAnswer: (id: string, a: string) => void }) {
  const [draft, setDraft] = useState('');
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.09), rgba(59,130,246,0.06))', border: '1px solid rgba(14,165,233,0.18)' }}>
      <div className="px-4 pt-3 pb-2.5 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(14,165,233,0.1)' }}>
        <ArrowLeftRight className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
        <span className="text-sky-300/65 text-[10px] font-semibold tracking-widest uppercase">One Honest Answer</span>
      </div>
      <div className="px-4 py-4 space-y-3">
        <p className="text-white/80 text-sm leading-relaxed font-medium">{game.question}</p>
        {game.status === 'answering' && !game.myAnswer && (
          <div className="flex gap-2">
            <input aria-label="Honest answer" value={draft} onChange={e => setDraft(e.target.value)} placeholder="A short answer…" className="flex-1 rounded-xl px-3 py-2 text-sm outline-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(14,165,233,0.2)', color: 'rgba(255,255,255,0.8)' }} />
            <button disabled={!draft.trim()} onClick={() => draft.trim() && onAnswer(messageId, draft.trim())} className="px-3 py-2 rounded-xl text-sky-400 text-xs font-semibold" style={{ background: 'rgba(14,165,233,0.12)', border: '1px solid rgba(14,165,233,0.22)' }}>Send</button>
          </div>
        )}
        {game.myAnswer && <div className="px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(14,165,233,0.1)' }}><p className="text-white/55 text-xs">{game.myAnswer}</p></div>}
        {game.myAnswer && <p className="quick-game-saved">✓ Answer saved on this device.</p>}
      </div>
    </div>
  );
}

function PredictCard({ game, messageId, onBet }: { game: PredictGame; messageId: string; onBet: (id: string, bet: 'yes'|'no') => void }) {
  const total = game.yesPool + game.noPool;
  const yesPct = Math.round((game.yesPool / total) * 100);
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(132,204,22,0.08), rgba(101,163,13,0.05))', border: '1px solid rgba(132,204,22,0.16)' }}>
      <div className="px-4 pt-3 pb-2.5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(132,204,22,0.09)' }}>
        <div className="flex items-center gap-2"><TrendingUp className="w-3.5 h-3.5 text-lime-400 flex-shrink-0" /><span className="text-lime-300/65 text-[10px] font-semibold tracking-widest uppercase">What If?</span></div>
        <span className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.2)' }}>Sample votes</span>
      </div>
      <div className="px-4 py-4 space-y-4">
        <p className="text-white/80 text-sm leading-relaxed">{game.prediction}</p>
        <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="absolute left-0 top-0 h-full rounded-full" style={{ width: `${yesPct}%`, background: 'linear-gradient(90deg, #84cc16, #a3e635)' }} />
        </div>
        <div className="flex justify-between text-[10px] font-mono">
          <span style={{ color: '#a3e635' }}>YES {yesPct}%</span>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>NO {100 - yesPct}%</span>
        </div>
        {!game.myBet && game.status === 'active' && (
          <div className="flex gap-2">
            <button onClick={() => onBet(messageId, 'yes')} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: 'rgba(132,204,22,0.12)', border: '1px solid rgba(132,204,22,0.25)', color: '#bef264' }}>Yes, it will</button>
            <button onClick={() => onBet(messageId, 'no')} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>No, it won't</button>
          </div>
        )}
        {game.myBet && <p className="quick-game-saved">Your pick: {game.myBet.toUpperCase()} · Saved. No XP wagered.</p>}
      </div>
    </div>
  );
}

function QuestionCard({game,messageId,onChoice}:{game:QuestionGame;messageId:string;onChoice:(id:string,choice:string)=>void}) {
  return <div className="quick-question-card"><strong>Conversation Question</strong><p>{game.question}</p><div>{game.options.map(option=><button key={option} className="mobile-secondary-button" disabled={game.status==='resolved'} aria-pressed={game.choice===option} onClick={()=>onChoice(messageId,option)}>{option}{game.choice===option&&<Check size={16}/>}</button>)}</div>{game.choice&&<p className="quick-game-saved">✓ Choice saved: {game.choice}. Ask your partner what they would like.</p>}</div>;
}

function TriviaCard({ game, messageId, onChoice }: { game: TriviaGame; messageId: string; onChoice: (id: string, i: number) => void }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(234,179,8,0.08), rgba(202,138,4,0.05))', border: '1px solid rgba(234,179,8,0.16)' }}>
      <div className="px-4 pt-3 pb-2.5 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(234,179,8,0.09)' }}>
        <Trophy className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
        <span className="text-yellow-300/65 text-[10px] font-semibold tracking-widest uppercase">Quick Trivia</span>
      </div>
      <div className="px-4 py-4 space-y-3">
        <p className="text-white/85 text-sm leading-relaxed font-medium">{game.question}</p>
        <div className="space-y-2">
          {game.options.map((opt, i) => {
            const resolved = game.status === 'resolved'; const isCorrect = i === game.correctIndex; const isMine = game.myChoice === i;
            return (
              <button key={i} onClick={() => game.status === 'active' && onChoice(messageId, i)} disabled={resolved} className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm transition-all"
                style={{ background: resolved ? isCorrect ? 'rgba(34,197,94,0.12)' : isMine ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)', border: resolved ? isCorrect ? '1px solid rgba(34,197,94,0.3)' : isMine ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(255,255,255,0.07)', color: resolved ? isCorrect ? '#86efac' : isMine ? '#fca5a5' : 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.75)' }}>
                {resolved && isCorrect && <span className="text-emerald-400 mr-2 text-xs">✓</span>}
                {resolved && isMine && !isCorrect && <span className="text-red-400 mr-2 text-xs">✗</span>}
                {opt}
              </button>
            );
          })}
        </div>
        {game.status === 'resolved' && <p className="text-center text-[11px] text-white/25">{game.myChoice === game.correctIndex ? '✓ Correct answer' : '🎓 Study up — correct answer highlighted'}</p>}
      </div>
    </div>
  );
}

// ─── Mood Board Overlay ───────────────────────────────────────

function MoodBoardOverlay({ selectedMoods, onToggle, onSubmit, onClose }: { selectedMoods: string[]; onToggle: (m: string) => void; onSubmit: () => void; onClose: () => void }) {
  return (
    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 280 }} className="absolute inset-0 z-50 flex flex-col" style={{ background: 'rgba(6,6,13,0.95)', backdropFilter: 'blur(28px)' }}>
      <button onClick={onClose} aria-label="Close mood board" className="flex flex-col items-center pt-4 pb-2 gap-1.5 flex-shrink-0">
        <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
        <span className="text-white/60 text-[12px]">Close mood board</span>
      </button>
      <div className="flex-1 flex flex-col px-6 pt-2 pb-6 gap-5 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <div className="flex items-center justify-between flex-shrink-0">
          <div><h2 className="text-white/90 text-xl font-semibold tracking-tight">Mood Board</h2><p className="text-white/35 text-sm mt-0.5">Paint your current vibe into the chat</p></div>
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.2)' }}><Sparkles className="w-5 h-5 text-violet-400" /></div>
        </div>
        <div>
          <p className="text-white/25 text-[10px] font-mono uppercase tracking-widest mb-3">Select your moods</p>
          <div className="flex flex-wrap gap-2">
            {MOOD_TAGS.map(({ label, color }) => {
              const selected = selectedMoods.includes(label);
              return (
                <motion.button key={label} whileTap={{ scale: 0.94 }} onClick={() => onToggle(label)} aria-pressed={selected} className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                  style={{ background: selected ? `${color}22` : 'rgba(255,255,255,0.04)', border: `1px solid ${selected ? color + '55' : 'rgba(255,255,255,0.08)'}`, color: selected ? color : 'rgba(255,255,255,0.45)', boxShadow: selected ? `0 0 14px ${color}28` : 'none' }}>
                  {label}
                </motion.button>
              );
            })}
          </div>
        </div>
        {selectedMoods.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-4 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-white/30 text-[10px] font-mono uppercase tracking-widest mb-1.5">Your selection</p>
            <p className="text-white/65 text-sm leading-relaxed">{selectedMoods.join(' · ')}</p>
          </motion.div>
        )}
        <button onClick={onSubmit} disabled={selectedMoods.length === 0} className="w-full py-4 rounded-2xl text-white font-semibold text-sm transition-all disabled:opacity-20 flex-shrink-0"
          style={{ background: selectedMoods.length > 0 ? 'linear-gradient(135deg, #8169ec, #8169ec)' : 'rgba(255,255,255,0.05)', boxShadow: selectedMoods.length > 0 ? '0 8px 32px rgba(109,40,217,0.35)' : 'none' }}>
          Drop Mood into Chat
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────

export function Chat({ chatId, onOpenGames, deckId, onReturnToDeck, onBack, onViewProfile }: ChatProps) {
  const [messages, setMessages] = useDeviceState<Message[]>(`chat:${chatId}`, INITIAL_MESSAGES);
  const [actionFeedback,setActionFeedback]=useState('');
  const peer=conversationProfile(chatId);
  const deckCard = dailyDeckCard(deckId);
  const [showHeatDetails,setShowHeatDetails]=useState(false);
  const [moodShared,setMoodShared]=useDeviceState<string[]>(`shared-chat-mood:${chatId}`,[]);
  const [inputText, setInputText] = useDeviceState(`chat-input:${chatId}`,'');
  const [reportTarget,setReportTarget]=useState('');
  const [blocked,setBlocked]=useDeviceState<string[]>('blocked-users',[]);
  const [showBlock,setShowBlock]=useState(false);
  const [messageReactions,setMessageReactions]=useDeviceState<string[]>(`message-reactions:${chatId}`,[]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [slashFilter, setSlashFilter] = useState('');
  const [toolQuery, setToolQuery] = useState('');
  const [activeHotTakeId, setActiveHotTakeId] = useDeviceState<string|null>(`chat-active-hottake:${chatId}`,null);
  const [activeBountyId, setActiveBountyId] = useDeviceState<string|null>(`chat-active-bounty:${chatId}`,null);
  const [bountyText, setBountyText] = useDeviceState(`chat-bounty-input:${chatId}`,'');
  const [moodBoardOpen, setMoodBoardOpen] = useState(false);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [contextMenuId, setContextMenuId] = useState<string | null>(null);
  const [canonAnimation, setCanonAnimation] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [heatLevel, setHeatLevel] = useDeviceState<number>(conversationHeatKey(chatId),48);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: document.documentElement.classList.contains('mobile-reduced-motion')?'auto':'smooth' }); }, [messages]);
  useEffect(()=>{const draft=localStorage.getItem(`roleplay-chat-draft:${chatId}`);if(draft){setInputText(draft);localStorage.removeItem(`roleplay-chat-draft:${chatId}`);}},[chatId]);

  useEffect(() => {
    if (!deckId || !dailyDeckCard(deckId)) return;
    setMessages(previous => previous.some(message => message.deckId === deckId) ? previous : [...previous, {id:'daily-deck:'+deckId, role:'me', deckId, timestamp:new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}]);
    setActiveHotTakeId(null); setActiveBountyId(null);
  }, [chatId, deckId, setMessages, setActiveHotTakeId, setActiveBountyId]);

  const inputMode = activeHotTakeId ? 'binary' : activeBountyId ? 'answer' : 'text';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputText(val);
    if (val.startsWith('/')) { setSlashMenuOpen(true); setSlashFilter(val.slice(1).toLowerCase()); }
    else { setSlashMenuOpen(false); }
  };

  const handleSend = () => {
    if(blocked.includes(chatId)){setActionFeedback('This sample conversation is blocked. Unblock it from conversation options to continue.');return;}
    if (!inputText.trim()) return;
    const id = crypto.randomUUID();
    const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { id, role: 'me', text: inputText.trim(), timestamp: ts, ...(deckCard?{scenarioId:deckCard.id}:{}), aiModified: true }]);
    setInputText(''); setSlashMenuOpen(false); setDrawerOpen(false);
    setHeatLevel(h => Math.min(100, heatValue(h) + 2));
  };

  const spawnGame = (key: string) => {
    if(blocked.includes(chatId)){setActionFeedback('Unblock this conversation before adding a game.');return;}
    if(inputText.startsWith('/'))setInputText(''); setSlashMenuOpen(false); setDrawerOpen(false);
    setActiveHotTakeId(null);setActiveBountyId(null);
    const id = crypto.randomUUID();
    const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const k = key.replace('/', '');
    setHeatLevel(h => Math.min(100, heatValue(h) + 8));

    if (k === 'roll') {
      setMessages(prev => [...prev, { id, role: 'me', timestamp: ts, game: { type: 'fateroll', rolled: false } }]);
    } else if (k === 'hottake') {
      setMessages(prev => [...prev, { id, role: 'me', timestamp: ts, game: { type: 'hottake', statement: 'A good playlist makes any journey better.', status: 'active', agrees: 0, disagrees: 0 } }]);
      setActiveHotTakeId(id);
    } else if (k === 'bounty') {
      setMessages(prev => [...prev, { id, role: 'me', timestamp: ts, game: { type: 'bounty', question: 'What would you do differently if no one was watching?', xp: 100, status: 'active' } }]);
      setActiveBountyId(id);
    } else if (k === 'truth') {
      setMessages(prev => [...prev, { id, role: 'me', timestamp: ts, game: { type: 'twotruth', statements: ["I've never lied in a job interview", "I cried watching a movie trailer once", "I've visited six countries in the same year"], lieIndex: 0, status: 'active' } }]);
    } else if (k === 'quiz') {
      setMessages(previous=>[...previous,{id,role:'me',timestamp:ts,game:{type:'question',question:'How would you like this conversation to feel?',options:['Keep it light','Explore a big idea','Make something together'],status:'active'}}]);
    } else if (k === 'mood') {
      setMoodBoardOpen(true);
    } else if (k === 'dare') {
      const p = DARE_PROMPTS[Math.floor(Math.random() * DARE_PROMPTS.length)];
      setMessages(prev => [...prev, { id, role: 'me', timestamp: ts, game: { type: 'dare', dare: p.dare, xp: p.xp, status: 'active' } }]);
    } else if (k === 'chain') {
      const opener = CHAIN_OPENERS[Math.floor(Math.random() * CHAIN_OPENERS.length)];
      setMessages(prev => [...prev, { id, role: 'me', timestamp: ts, game: { type: 'chain', sentences: opener, sealed: false } }]);
    } else if (k === 'confess') {
      const confession = CONFESSIONS[Math.floor(Math.random() * CONFESSIONS.length)];
      setMessages(prev => [...prev, { id, role: 'me', timestamp: ts, game: { type: 'confess', confession, reactions: { witnessed: 0, same: 0, held: 0 } } }]);
    } else if (k === 'mirror') {
      const q = MIRROR_Q[Math.floor(Math.random() * MIRROR_Q.length)];
      setMessages(prev => [...prev, { id, role: 'me', timestamp: ts, game: { type: 'mirror', question: q, status: 'answering' } }]);
    } else if (k === 'predict') {
      const p = PREDICTIONS[Math.floor(Math.random() * PREDICTIONS.length)];
      setMessages(prev => [...prev, { id, role: 'me', timestamp: ts, game: { type: 'predict', prediction: p.prediction, yesPool: p.yesPool, noPool: p.noPool, status: 'active' } }]);
    } else if (k === 'trivia') {
      const q = TRIVIA[Math.floor(Math.random() * TRIVIA.length)];
      setMessages(prev => [...prev, { id, role: 'me', timestamp: ts, game: { type: 'trivia', ...q, status: 'active' } }]);
    }
  };

  const handleHotTakeVote = (id: string, vote: 'agree'|'disagree') => {
    if(blocked.includes(chatId)){setActionFeedback('Unblock this conversation to play.');return;}
    setMessages(prev => prev.map(m => {
      if (m.id !== id || m.game?.type !== 'hottake') return m;
      const g = m.game as HotTakeGame;
      return { ...m, game: { ...g, status: 'resolved' as const, myVote: vote, agrees: vote === 'agree' ? g.agrees + 1 : g.agrees, disagrees: vote === 'disagree' ? g.disagrees + 1 : g.disagrees } };
    }));
    if (activeHotTakeId === id) setActiveHotTakeId(null);
    setHeatLevel(h => Math.min(100, heatValue(h) + 5));
  };

  const handleFateRoll = (id: string) => {
    if(blocked.includes(chatId)){setActionFeedback('Unblock this conversation to play.');return;}
    const face = Math.floor(Math.random() * 6) + 1;
    const result = FATE_OUTCOMES[Math.floor(Math.random() * FATE_OUTCOMES.length)];
    setMessages(prev => prev.map(m => m.id === id ? { ...m, game: { type: 'fateroll' as const, rolled: true, face, result } } : m));
  };

  const handleTwoTruthGuess = (id: string, index: number) => {
    if(blocked.includes(chatId)){setActionFeedback('Unblock this conversation to play.');return;}
    setMessages(prev => prev.map(m => {
      if (m.id !== id || m.game?.type !== 'twotruth') return m;
      return { ...m, game: { ...(m.game as TwoTruthGame), status: 'resolved' as const, guess: index } };
    }));
  };

  const handleBountyActivate = (id: string) => {if(!blocked.includes(chatId))setActiveBountyId(id);};
  const handleBountySubmit = () => {
    if(blocked.includes(chatId)){setActionFeedback('Unblock this conversation to play.');return;}
    if (!bountyText.trim() || !activeBountyId) return;
    const answer = bountyText.trim();
    setMessages(prev => prev.map(m => {
      if (m.id !== activeBountyId || m.game?.type !== 'bounty') return m;
      return { ...m, game: { ...(m.game as BountyGame), status: 'resolved' as const, answer } };
    }));
    setActiveBountyId(null); setBountyText('');
  };

  const handleDareResponse = (id: string, r: 'accepted'|'passed') => {
    if(blocked.includes(chatId)){setActionFeedback('Unblock this conversation to play.');return;}
    setMessages(prev => prev.map(m => m.id !== id || m.game?.type !== 'dare' ? m : { ...m, game: { ...(m.game as DareGame), status: r } }));
    if (r === 'accepted') setHeatLevel(h => Math.min(100, heatValue(h) + 7));
  };

  const handleStoryAppend = (id:string, line:string) => {
    if(blocked.includes(chatId))return;
    setMessages(previous=>previous.map(message=>{
      if(message.id!==id||message.game?.type!=='chain'||message.game.sealed)return message;
      const turns=(message.game.turns||0)+1;
      return {...message,game:{...message.game,sentences:[...message.game.sentences,line],turns,sealed:turns>=3}};
    }));
  };

  const handleConfessReact = (id: string, reaction: string) => {
    if(blocked.includes(chatId)){setActionFeedback('Unblock this conversation to play.');return;}
    setMessages(prev => prev.map(m => {
      if (m.id !== id || m.game?.type !== 'confess') return m;
      const g = m.game as ConfessGame;
      if (g.myReaction) return m;
      return { ...m, game: { ...g, myReaction: reaction, reactions: { ...g.reactions, [reaction as keyof typeof g.reactions]: g.reactions[reaction as keyof typeof g.reactions] + 1 } } };
    }));
  };

  const handleMirrorAnswer = (id: string, answer: string) => {
    if(blocked.includes(chatId))return;
    setMessages(previous=>previous.map(message=>message.id!==id||message.game?.type!=='mirror'?message:{...message,game:{...message.game,myAnswer:answer,status:'revealed'}}));
  };

  const handlePredictBet = (id: string, bet: 'yes'|'no') => {
    if(blocked.includes(chatId)){setActionFeedback('Unblock this conversation to play.');return;}
    setMessages(prev => prev.map(m => {
      if (m.id !== id || m.game?.type !== 'predict') return m;
      const g = m.game as PredictGame;
      if (g.myBet) return m;
      return { ...m, game: { ...g, myBet: bet, status: 'resolved' as const } };
    }));
    setHeatLevel(h => Math.min(100, heatValue(h) + 4));
  };

  const handleQuestionChoice = (id:string,choice:string) => {
    if(blocked.includes(chatId))return;
    setMessages(previous=>previous.map(message=>message.id!==id||message.game?.type!=='question'||message.game.status==='resolved'||!message.game.options.includes(choice)?message:{...message,game:{...message.game,choice,status:'resolved'}}));
  };

  const handleTriviaChoice = (id: string, index: number) => {
    if(blocked.includes(chatId)){setActionFeedback('Unblock this conversation to play.');return;}
    setMessages(prev => prev.map(m => {
      if (m.id !== id || m.game?.type !== 'trivia') return m;
      const g = m.game as TriviaGame;
      if (g.myChoice !== undefined) return m;
      return { ...m, game: { ...g, myChoice: index, status: 'resolved' as const } };
    }));
    setHeatLevel(h => Math.min(100, heatValue(h) + 4));
  };

  const handleLongPressStart = (id: string) => { longPressTimer.current = setTimeout(() => setContextMenuId(id), 580); };
  const handleLongPressEnd = () => { if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; } };

  const handleProposeCanon = (id: string) => { setContextMenuId(null); setMessages(prev => prev.map(m => m.id === id ? { ...m, canonGlow: true } : m)); };
  const handleAcceptCanon = (id: string) => {
    setCanonAnimation(true);
    setTimeout(() => { setMessages(prev => prev.map(m => m.id === id ? { ...m, canonGlow: false, sealed: true } : m)); setCanonAnimation(false); }, 1400);
  };
  const handleDismissCanon = (id: string) => { setMessages(prev => prev.map(m => m.id === id ? { ...m, canonGlow: false } : m)); };
  const handleMoodSubmit = () => {
    setMoodShared(selectedMoods);
    if (!selectedMoods.length) return;
    const id = crypto.randomUUID();
    const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { id, role: 'me', text: `Mood drop: ${selectedMoods.join(' · ')}`, timestamp: ts }]);
    setMoodBoardOpen(false); setSelectedMoods([]);
  };

  const filteredCmds = SLASH_COMMANDS.filter(c => c.cmd.slice(1).startsWith(slashFilter) || c.label.toLowerCase().includes(slashFilter));

  return (
    <div className="mobile-chat-view h-screen flex flex-col relative overflow-hidden" style={{ background: '#15141d', fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>

      {/* ── Header ── */}
      <div className="mobile-chat-header relative z-10 flex flex-wrap items-center gap-2 px-3 py-3 flex-shrink-0" style={{ background: 'rgba(9,9,20,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={onBack} aria-label="Back to conversations" className="p-1.5 rounded-full transition-colors" style={{ background: 'rgba(255,255,255,0)' }} onMouseEnter={(e:React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')} onMouseLeave={(e:React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.background = 'rgba(255,255,255,0)')}>
          <ChevronLeft className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.55)' }} />
        </button>
        <button
          onClick={onViewProfile}
          aria-label={`View ${peer.alias} profile`}
          className="flex items-center gap-3 flex-1 min-w-0 text-left rounded-xl transition-all active:scale-[0.98]"
          style={{ background: 'transparent' }}
          onMouseEnter={(e:React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
          onMouseLeave={(e:React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.background = 'transparent')}>
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg" style={{ background: 'linear-gradient(135deg, #8169ec, #8169ec)' }}>{peer.avatar}</div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2" style={{ background: '#34d399', borderColor: '#15141d' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="chat-peer-alias text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>{peer.alias}</span>
              <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#8169ec' }}><Check className="w-2 h-2 text-white" /></div>

            </div>
          </div>
        </button>
        <button aria-label="Conversation options" aria-expanded={showActionsMenu} onClick={() => setShowActionsMenu(v => !v)} className="p-1.5 rounded-full transition-colors" style={{ background: showActionsMenu ? 'rgba(255,255,255,0.08)' : 'transparent' }}>
          <MoreVertical className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.35)' }} />
        </button>
        <div className="chat-context-strip">
          <div className="chat-context-copy">
            <span className="mobile-peer-subtitle">Sample conversation</span>
            <button className="chat-peer-mood" onClick={onViewProfile} aria-label="View their shared mood and mindset"><span aria-hidden="true">{peer.moodEmoji}</span><strong>{peer.mood}</strong></button>
          </div>
          <button className="chat-share-mood" onClick={()=>{setDrawerOpen(false);setMoodBoardOpen(true);}} aria-label="Share your mood"><Smile size={17}/><span>{moodShared.length?'Your mood':'Share yours'}</span></button>
        </div>
      </div>

      {/* Actions dropdown */}
      <AnimatePresence>
        {showActionsMenu && (
          <motion.div initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.96 }} transition={{ duration: 0.15 }} className="absolute top-14 right-4 z-50 rounded-2xl overflow-hidden min-w-[160px]" style={{ background: 'rgba(18,18,32,0.98)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }} onClick={() => setShowActionsMenu(false)}>
            {[{ Icon: Video, label: 'Video Call', color: '#60a5fa' }, { Icon: Mic, label: 'Voice Call', color: '#34d399' }, { Icon: Flag, label: 'Report', color: '#f87171' },{Icon:Shield,label:blocked.includes(chatId)?'Unblock':'Block',color:'#fbbf24'}].map(({ Icon, label, color }) => (
              <button key={label} onClick={()=>{if(label==='Report')setReportTarget(`Conversation ${chatId}`);else if(label==='Block'||label==='Unblock')setShowBlock(true);else setActionFeedback(`${label} is simulated. No microphone or camera is connected.`);}} className="w-full flex items-center gap-3 px-4 py-3 transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }} onMouseEnter={(e:React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')} onMouseLeave={(e:React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.background = 'transparent')}>
                <Icon className="w-4 h-4 flex-shrink-0" style={{ color }} /><span className="text-sm" style={{ color }}>{label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {deckCard && <div className="chat-deck-context"><span>{deckCard.emoji} Daily Deck · {deckCard.category}</span><button className="mobile-text-button" onClick={onReturnToDeck}><ChevronLeft size={15}/>Back to Daily Deck</button></div>}
      {actionFeedback&&<div className="mobile-chat-status" role="status">{actionFeedback}<button className="mobile-text-button" onClick={()=>setActionFeedback('')}>Dismiss</button></div>}

      <div className="chat-conversation-body flex-1 relative overflow-hidden" onClick={() => { setShowActionsMenu(false); if (!contextMenuId) return; setContextMenuId(null); }}>
        <div className="chat-message-scroll h-full overflow-y-auto px-4 py-4 space-y-4" style={{ scrollbarWidth: 'none' }}>
          {messages.map(msg => (
            <div key={msg.id} data-quick-game={msg.game?.type} className={`flex ${msg.role === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[84%] space-y-1">
                <div onMouseDown={(event)=>{if(!(event.target as HTMLElement).closest('button,input,textarea,label,summary'))handleLongPressStart(msg.id);}} onMouseUp={handleLongPressEnd} onMouseLeave={handleLongPressEnd} onTouchStart={(event)=>{if(!(event.target as HTMLElement).closest('button,input,textarea,label,summary'))handleLongPressStart(msg.id);}} onTouchEnd={handleLongPressEnd} className="rounded-2xl transition-all duration-500 cursor-pointer select-none"
                  style={msg.canonGlow ? { boxShadow: '0 0 0 1.5px rgba(245,158,11,0.55), 0 0 24px rgba(245,158,11,0.2)' } : undefined}>
                  {msg.deckId && dailyDeckCard(msg.deckId) && <div className="chat-deck-prompt" data-deck-id={msg.deckId}><strong>{dailyDeckCard(msg.deckId)!.emoji} DAILY DECK · {dailyDeckCard(msg.deckId)!.category}</strong><p>{dailyDeckCard(msg.deckId)!.prompt}</p></div>}
                  {msg.text && (
                    <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed" style={msg.role === 'me' ? { background: 'linear-gradient(135deg, #8169ec, #6d28d9)', color: 'rgba(255,255,255,0.92)' } : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.78)' }}>{msg.text}</div>
                  )}
                  {msg.game && <p className="quick-game-instruction">{QUICK_GAME_HINTS[msg.game.type]}</p>}
                  {msg.game?.type === 'hottake'  && <HotTakeCard   game={msg.game as HotTakeGame}  messageId={msg.id} onVote={handleHotTakeVote}    isActive={activeHotTakeId === msg.id} />}
                  {msg.game?.type === 'fateroll' && <FateRollCard   game={msg.game as FateRollGame} messageId={msg.id} onRoll={handleFateRoll} />}
                  {msg.game?.type === 'twotruth' && <TwoTruthsCard  game={msg.game as TwoTruthGame} messageId={msg.id} onGuess={handleTwoTruthGuess} />}
                  {msg.game?.type === 'bounty'   && <BountyCard     game={msg.game as BountyGame}   messageId={msg.id} onActivate={handleBountyActivate} isActive={activeBountyId === msg.id} />}
                  {msg.game?.type === 'dare'     && <DareCard       game={msg.game as DareGame}     messageId={msg.id} onRespond={handleDareResponse} />}
                  {msg.game?.type === 'chain'    && <ChainCard      game={msg.game as ChainGame} messageId={msg.id} onAppend={handleStoryAppend} />}
                  {msg.game?.type === 'confess'  && <ConfessCard    game={msg.game as ConfessGame}  messageId={msg.id} onReact={handleConfessReact} />}
                  {msg.game?.type === 'mirror'   && <MirrorCard     game={msg.game as MirrorGame}   messageId={msg.id} onAnswer={handleMirrorAnswer} />}
                  {msg.game?.type === 'predict'  && <PredictCard    game={msg.game as PredictGame}  messageId={msg.id} onBet={handlePredictBet} />}
                  {msg.game?.type === 'question' && <QuestionCard game={msg.game} messageId={msg.id} onChoice={handleQuestionChoice}/>}
                  {msg.game?.type === 'trivia'   && <TriviaCard     game={msg.game as TriviaGame}   messageId={msg.id} onChoice={handleTriviaChoice} />}
                </div>
                <div className={`flex items-center gap-1.5 px-1 ${msg.role === 'me' ? 'justify-end' : 'justify-start'}`}>

                  {messageReactions.includes(msg.id)&&<span aria-label="Your reaction">⭐</span>}
                  {msg.sealed && <span className="text-[12px]" title="Pinned to Ghost Writer">🪬</span>}
                  <span className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.2)' }}>{msg.timestamp}</span>
                </div>
                {msg.canonGlow && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 px-3 py-2 rounded-xl mt-0.5" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.18)' }}>
                    <span className="text-[11px] flex-1" style={{ color: 'rgba(252,211,77,0.65)' }}>You believe this is canon. Add to Ghost Writer?</span>
                    <button onClick={() => handleAcceptCanon(msg.id)} className="text-[11px] font-semibold transition-colors" style={{ color: '#fbbf24' }} onMouseEnter={(e:React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.color = '#fde68a')} onMouseLeave={(e:React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.color = '#fbbf24')}>Accept</button>
                    <button onClick={() => handleDismissCanon(msg.id)} className="ml-1"><X className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.2)' }} /></button>
                  </motion.div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <ConversationHeat value={heatLevel} expanded={showHeatDetails} onInfo={()=>setShowHeatDetails(true)}/>

      </div>

      {/* ── Context menu ── */}
      <AnimatePresence>
        {contextMenuId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-40" onClick={() => setContextMenuId(null)}>
            <motion.div initial={{ scale: 0.92, opacity: 0, y: 8 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0, y: 8 }} transition={{ duration: 0.18 }} className="absolute bottom-24 left-1/2 -translate-x-1/2 rounded-2xl overflow-hidden min-w-[210px]" style={{ background: 'rgba(16,16,28,0.98)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)' }} onClick={(e:React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
              <button onClick={() => handleProposeCanon(contextMenuId)} className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }} onMouseEnter={(e:React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')} onMouseLeave={(e:React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.background = 'transparent')}>
                <span className="text-base flex-shrink-0">🪬</span>
                <div className="text-left"><p className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>Nominate for Lore</p><p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Propose this as canon</p></div>
              </button>
              <button onClick={()=>{setMessageReactions(messageReactions.includes(contextMenuId)?messageReactions.filter(id=>id!==contextMenuId):[...messageReactions,contextMenuId]);setContextMenuId(null);}} className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }} onMouseEnter={(e:React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')} onMouseLeave={(e:React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.background = 'transparent')}>
                <Star className="w-4 h-4 flex-shrink-0" style={{ color: '#fbbf24' }} /><span className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>React</span>
              </button>
              <button onClick={()=>{setReportTarget(`Message ${contextMenuId} in conversation ${chatId}`);setContextMenuId(null);}} className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors" onMouseEnter={(e:React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.background = 'rgba(239,68,68,0.07)')} onMouseLeave={(e:React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.background = 'transparent')}>
                <Flag className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(248,113,113,0.75)' }} /><span className="text-sm" style={{ color: 'rgba(248,113,113,0.75)' }}>Report</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Slash command menu ── */}
      <AnimatePresence>
        {slashMenuOpen && filteredCmds.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.14 }} className="absolute bottom-[68px] left-4 right-4 z-30 rounded-2xl overflow-hidden max-h-64 overflow-y-auto" style={{ background: 'rgba(13,13,24,0.98)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(24px)', scrollbarWidth: 'none' }}>
            <div className="px-4 py-2.5 flex items-center gap-2 sticky top-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(13,13,24,0.98)' }}>
              <Hash className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.25)' }} />
              <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>Game Commands · {filteredCmds.length} of 12</span>
            </div>
            {filteredCmds.map(({ cmd, Icon, label, desc, color, bg }) => (
              <button key={cmd} onClick={() => spawnGame(cmd)} className="w-full flex items-center gap-3 px-4 py-3 transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }} onMouseEnter={(e:React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')} onMouseLeave={(e:React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.background = 'transparent')}>
                <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}><Icon className={`w-4 h-4 ${color}`} /></div>
                <div className="text-left flex-1 min-w-0">
                  <div className="flex items-center gap-2"><span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>{label}</span><span className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.22)' }}>{cmd}</span></div>
                  <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>{desc}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {drawerOpen && <JourneyDialog title="Quick chat games" onClose={()=>setDrawerOpen(false)}><p>One small round at a time. All responses save on this device.</p><label className="mobile-search"><Gamepad2 size={18}/><input type="search" aria-label="Find a quick game" value={toolQuery} onChange={event=>setToolQuery(event.target.value)} placeholder="Find a game"/></label><div className="quick-game-list">{SLASH_COMMANDS.filter(tool=>(tool.label+' '+tool.desc).toLowerCase().includes(toolQuery.toLowerCase())).map(({cmd,Icon,label,desc,color,bg})=><button key={cmd} onClick={()=>spawnGame(cmd)} aria-label={'Play '+label}><span className={bg}><Icon className={color} size={22}/></span><span><strong>{label}</strong><small>{desc}</small></span></button>)}</div>{!SLASH_COMMANDS.some(tool=>(tool.label+' '+tool.desc).toLowerCase().includes(toolQuery.toLowerCase()))&&<p role="status">No quick games found. Try another word.</p>}{onOpenGames&&<button className="mobile-secondary-button quick-game-library" onClick={onOpenGames}>Explore all 16 games <Gamepad2 size={17}/></button>}</JourneyDialog>}

      {/* ── Input bar ── */}
      <div className="mobile-chat-composer flex-shrink-0 px-3 py-3" style={{ background: 'rgba(9,9,20,0.97)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <AnimatePresence mode="wait">
          {inputMode === 'binary' && activeHotTakeId ? (
            <motion.div key="binary" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.18 }} className="space-y-2">
              <div className="flex items-center gap-2 px-1"><Flame className="w-3 h-3 text-orange-400" /><span className="text-xs" style={{ color: 'rgba(253,186,116,0.55)' }}>Cast your vote on the Hot Take</span></div>
              <div className="flex gap-3">
                <motion.button whileTap={{ scale: 0.96 }} onClick={() => handleHotTakeVote(activeHotTakeId, 'agree')} className="flex-1 py-3.5 rounded-2xl text-sm font-semibold transition-all" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.28)', color: '#6ee7b7' }}>✓ Agree</motion.button>
                <motion.button whileTap={{ scale: 0.96 }} onClick={() => handleHotTakeVote(activeHotTakeId, 'disagree')} className="flex-1 py-3.5 rounded-2xl text-sm font-semibold transition-all" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.22)', color: '#fca5a5' }}>✗ Disagree</motion.button>
              </div>
            </motion.div>
          ) : inputMode === 'answer' && activeBountyId ? (
            <motion.div key="answer" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.18 }} className="space-y-2">
              <div className="flex items-center gap-2 px-1"><Zap className="w-3 h-3 text-emerald-400" /><span className="text-xs" style={{ color: 'rgba(110,231,183,0.5)' }}>Your answer</span><button aria-label="Return to message" onClick={() => setActiveBountyId(null)} className="ml-auto"><X className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.2)' }} /></button></div>
              <div className="flex gap-2">
                <input aria-label="Question answer" value={bountyText} onChange={e => setBountyText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleBountySubmit()} placeholder="Your answer…" autoFocus className="flex-1 rounded-full px-4 py-2.5 text-sm outline-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(16,185,129,0.22)', color: 'rgba(255,255,255,0.8)' }} />
                <motion.button whileTap={{ scale: 0.92 }} onClick={handleBountySubmit} aria-label="Save question answer" disabled={!bountyText.trim()||blocked.includes(chatId)} className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}><Send className="w-4 h-4 text-white" /></motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="text" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.18 }} className="flex items-center gap-2.5">
              <motion.button aria-label="Chat games" aria-expanded={drawerOpen} whileTap={{ scale: 0.9 }} onClick={() => { setDrawerOpen(v => !v); setSlashMenuOpen(false); }} className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all" style={{ background: drawerOpen ? 'linear-gradient(135deg, #8169ec, #8169ec)' : 'rgba(255,255,255,0.07)' }}>
                <Gamepad2 className="w-5 h-5 transition-transform" style={{ color: drawerOpen ? 'white' : 'rgba(255,255,255,0.45)', transform: drawerOpen ? 'rotate(45deg)' : 'none' }} />
              </motion.button>
              <input value={inputText} onChange={handleInputChange} onKeyDown={e => e.key === 'Enter' && !slashMenuOpen && handleSend()} aria-label="Message" placeholder="Write a message…" className="flex-1 rounded-full px-4 py-2.5 text-sm outline-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.82)' }} />
              <motion.button whileTap={{ scale: 0.9 }} onClick={handleSend} disabled={!inputText.trim()||blocked.includes(chatId)} aria-label="Send message" className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #8169ec, #8169ec)', boxShadow: '0 4px 16px rgba(109,40,217,0.35)' }}><Send className="w-4 h-4 text-white" /></motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showHeatDetails&&<HeatDetails value={heatLevel} onChange={setHeatLevel} onClose={()=>setShowHeatDetails(false)}/>}

      {/* ── Mood Board Overlay ── */}
      <AnimatePresence>
        {moodBoardOpen && (
          <MoodBoardOverlay selectedMoods={selectedMoods} onToggle={m => setSelectedMoods(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])} onSubmit={handleMoodSubmit} onClose={() => { setMoodBoardOpen(false); setSelectedMoods([]); }} />
        )}
      </AnimatePresence>

      {/* ── Canon fly animation ── */}
      <AnimatePresence>
        {canonAnimation && (
          <motion.div initial={{ scale: 1, opacity: 1, x: '-50%', y: '-50%' }} animate={{ scale: 0.15, opacity: 0, x: '-230px', y: '-410px' }} exit={{ opacity: 0 }} transition={{ duration: 1.35, ease: [0.16, 1, 0.3, 1] }} className="absolute left-1/2 top-1/2 z-50 w-14 h-14 rounded-2xl flex items-center justify-center pointer-events-none" style={{ background: 'linear-gradient(135deg, #b45309, #f59e0b)', boxShadow: '0 0 32px rgba(245,158,11,0.6)' }}>
            <span className="text-2xl">🪬</span>
          </motion.div>
        )}
      </AnimatePresence>
      {reportTarget&&<ReportDialog target={reportTarget} onClose={()=>setReportTarget('')}/>}
      {showBlock&&<JourneyDialog title={blocked.includes(chatId)?'Unblock conversation?':'Block conversation?'} onClose={()=>setShowBlock(false)}><p>This control applies to the sample conversation on this device.</p><button className="mobile-primary-button" onClick={()=>{setBlocked(blocked.includes(chatId)?blocked.filter(id=>id!==chatId):[...blocked,chatId]);setShowBlock(false);setActionFeedback(blocked.includes(chatId)?'Conversation unblocked.':'Conversation blocked on this device.');}}>{blocked.includes(chatId)?'Unblock conversation':'Confirm block'}</button></JourneyDialog>}
    </div>
  );
}
