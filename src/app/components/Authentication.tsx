import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield, Phone, Cpu, Fingerprint, Eye,
  CheckCircle2, ArrowRight, Lock, Zap, RefreshCw,
  Sparkles, Heart, User,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────

type Step =
  | 'intro'
  | 'phone'
  | 'otp'
  | 'identity'
  | 'persona'
  | 'mood'
  | 'device'
  | 'biometric'
  | 'liveness'
  | 'success';

interface AuthenticationProps {
  onComplete: () => void;
}

// ─── Progress bar ────────────────────────────────────────────

const FLOW_STEPS: Step[] = [
  'phone','otp','identity','persona','mood','device','biometric','liveness','success',
];

const STEP_LABELS: Record<Step, string> = {
  intro: '', phone: 'Phone', otp: 'OTP', identity: 'Identity',
  persona: 'Persona', mood: 'Mood', device: 'Device',
  biometric: 'Biometric', liveness: 'Liveness', success: '',
};

function ProgressBar({ step }: { step: Step }) {
  const idx = FLOW_STEPS.indexOf(step);
  if (idx < 0) return null;
  const segments = FLOW_STEPS.length - 1;
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: segments }, (_, i) => (
        <div key={i} className="h-1 rounded-full flex-1 transition-all duration-500"
          style={{ background: i < idx ? '#818cf8' : i === idx ? 'rgba(129,140,248,0.45)' : 'rgba(255,255,255,0.08)' }} />
      ))}
    </div>
  );
}

// ─── Shared slide wrapper ─────────────────────────────────────

function StepShell({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <motion.div key={id}
      initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -28 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col flex-1 overflow-hidden">
      {children}
    </motion.div>
  );
}

// ─── CTA Button ──────────────────────────────────────────────

function CTAButton({ label, onClick, disabled, icon }: {
  label: string; onClick: () => void; disabled?: boolean; icon?: React.ReactNode;
}) {
  return (
    <motion.button whileTap={{ scale: 0.97 }} onClick={onClick} disabled={disabled}
      className="w-full py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-2 transition-all"
      style={{
        background: disabled ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #8169ec, #8169ec)',
        color: disabled ? 'rgba(255,255,255,0.22)' : 'white',
        boxShadow: disabled ? 'none' : '0 8px 32px rgba(79,70,229,0.35)',
      }}>
      {icon}
      {label}
      {!disabled && <ArrowRight className="w-4 h-4" />}
    </motion.button>
  );
}

// ═══════════════════════════════════════════════════════════════
// STEP 0 — Intro
// ═══════════════════════════════════════════════════════════════

function IntroStep({ onNext }: { onNext: () => void }) {
  return (
    <StepShell id="intro">
      <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-6" style={{ scrollbarWidth: 'none' }}>
        <div className="flex flex-col items-center gap-3 pt-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.3), rgba(124,58,237,0.2))', border: '1.5px solid rgba(99,102,241,0.4)', boxShadow: '0 0 40px rgba(79,70,229,0.25)' }}>
              <Shield className="w-9 h-9" style={{ color: '#a5b4fc' }} />
            </div>
            <motion.div className="absolute inset-0 rounded-3xl border"
              style={{ borderColor: 'rgba(129,140,248,0.3)' }}
              animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }} />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-black tracking-tight" style={{ color: 'rgba(255,255,255,0.9)' }}>Are You a Human?</h1>
            <p className="text-sm mt-1.5" style={{ color: 'rgba(255,255,255,0.38)' }}>One-time verification · No KYC · No stored data</p>
          </div>
        </div>

        <div className="rounded-2xl p-4" style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)' }}>
          <p className="text-xs font-bold mb-2" style={{ color: '#fca5a5' }}>THE BOT PROBLEM</p>
          <p className="text-[12px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Research shows <span className="font-bold text-red-300">30–40% of profiles</span> on anonymous platforms are bots, duplicates, or bad-faith actors. Without human verification, ambient suspicion poisons every interaction.
          </p>
          <div className="flex gap-3 mt-3">
            {[['30–40%','Fake profiles'],['1','Account/device'],['0','PII stored']].map(([v,l]) => (
              <div key={l} className="flex-1 text-center rounded-xl py-2.5" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <p className="text-base font-black" style={{ color: '#f87171' }}>{v}</p>
                <p className="text-[8px] mt-0.5 font-mono" style={{ color: 'rgba(255,255,255,0.25)' }}>{l}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>What happens next</p>
          {[
            { step:'1', color:'#818cf8', title:'Phone OTP',           sub:'One number · one account · no KYC' },
            { step:'2', color:'#a78bfa', title:'Build Your Identity',  sub:'Anonymous avatar · persona · mood' },
            { step:'3', color:'#34d399', title:'Device + Biometrics',  sub:'Passive · invisible · no data stored' },
            { step:'4', color:'#f472b6', title:'Liveness Check',       sub:'3-second scan · image never stored' },
          ].map(({ step: s, color, title, sub }) => (
            <div key={s} className="flex items-center gap-4 mb-3.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-black"
                style={{ background: `${color}18`, border: `1px solid ${color}28`, color }}>
                {s}
              </div>
              <div>
                <p className="text-sm font-bold leading-tight" style={{ color: 'rgba(255,255,255,0.82)' }}>{title}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)' }}>
          <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#818cf8' }} />
          <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(167,139,250,0.65)' }}>
            No government ID, no real name, no email. Only a mathematical proof that you are a unique human being.
          </p>
        </div>
      </div>

      <div className="flex-shrink-0 px-6 pb-8 pt-4">
        <CTAButton label="Begin Verification" onClick={onNext} />
        <p className="text-center text-[10px] mt-3" style={{ color: 'rgba(255,255,255,0.2)' }}>Takes ~90 seconds · One-time only</p>
      </div>
    </StepShell>
  );
}

// ═══════════════════════════════════════════════════════════════
// STEP 1 — Phone
// ═══════════════════════════════════════════════════════════════

function PhoneStep({ onNext }: { onNext: () => void }) {
  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = () => {
    if (phone.length < 10) return;
    setSending(true);
    setTimeout(() => { setSending(false); onNext(); }, 1400);
  };

  return (
    <StepShell id="phone">
      <div className="flex-1 px-6 py-8 flex flex-col gap-6">
        <div className="flex flex-col items-center gap-4 pt-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(129,140,248,0.15)', border: '1px solid rgba(129,140,248,0.3)' }}>
            <Phone className="w-8 h-8" style={{ color: '#818cf8' }} />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-black" style={{ color: 'rgba(255,255,255,0.9)' }}>Phone Verification</h2>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Step 1 — Human gating</p>
          </div>
        </div>

        <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-[10px] font-bold mb-3 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>Mobile Number</p>
          <div className="flex items-center gap-3 rounded-xl px-4 py-3.5"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center gap-2 flex-shrink-0 pr-3" style={{ borderRight: '1px solid rgba(255,255,255,0.1)' }}>
              <span className="text-lg">🇮🇳</span>
              <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>+91</span>
            </div>
            <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g,'').slice(0,10))}
              placeholder="98765 43210" inputMode="tel"
              className="flex-1 bg-transparent outline-none text-base font-semibold"
              style={{ color: 'rgba(255,255,255,0.85)', caretColor: '#818cf8', letterSpacing: '0.05em' }} />
            {phone.length === 10 && <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-green-400" />}
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {[['🔒','Not stored — only a hash is retained'],['1️⃣','One number can register one account only'],['🚫','No SMS spam — only this one-time OTP']].map(([icon,text]) => (
            <div key={text} className="flex items-center gap-3">
              <span className="text-base flex-shrink-0">{icon}</span>
              <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.38)' }}>{text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-shrink-0 px-6 pb-8 pt-2">
        <CTAButton label="Send OTP" onClick={handleSend} disabled={phone.length < 10 || sending}
          icon={sending ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}>
              <RefreshCw className="w-5 h-5" />
            </motion.div>
          ) : undefined}
        />
      </div>
    </StepShell>
  );
}

// ═══════════════════════════════════════════════════════════════
// STEP 2 — OTP
// ═══════════════════════════════════════════════════════════════

function OTPStep({ onNext }: { onNext: () => void }) {
  const [digits, setDigits] = useState(['','','','','','']);
  const [timer, setTimer] = useState(30);
  const [verified, setVerified] = useState(false);
  const refs = [useRef<HTMLInputElement>(null),useRef<HTMLInputElement>(null),useRef<HTMLInputElement>(null),useRef<HTMLInputElement>(null),useRef<HTMLInputElement>(null),useRef<HTMLInputElement>(null)];

  useEffect(() => {
    const t = setInterval(() => setTimer(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setDigits(['4','2','7','8','1','9']);
      setTimeout(() => { setVerified(true); setTimeout(onNext, 900); }, 600);
    }, 2000);
    return () => clearTimeout(t);
  }, [onNext]);

  const handleDigit = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...digits]; next[i] = v;
    setDigits(next);
    if (v && i < 5) refs[i+1].current?.focus();
    if (next.every(d => d !== '')) { setVerified(true); setTimeout(onNext, 700); }
  };

  return (
    <StepShell id="otp">
      <div className="flex-1 px-6 py-8 flex flex-col gap-6">
        <div className="flex flex-col items-center gap-4 pt-4">
          <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(129,140,248,0.15)', border: '1px solid rgba(129,140,248,0.3)' }}>
            <span className="text-3xl">💬</span>
            {verified && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#34d399' }}>
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              </motion.div>
            )}
          </div>
          <div className="text-center">
            <h2 className="text-xl font-black" style={{ color: 'rgba(255,255,255,0.9)' }}>Enter OTP</h2>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Sent to +91 98••• •••10</p>
          </div>
        </div>

        <div className="flex justify-center gap-3">
          {digits.map((d, i) => (
            <motion.input key={i} ref={refs[i]} value={d}
              onChange={(e:React.ChangeEvent<HTMLInputElement>) => handleDigit(i, e.target.value)}
              onKeyDown={(e:React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Backspace' && !d && i > 0) refs[i-1].current?.focus(); }}
              maxLength={1} inputMode="numeric"
              animate={verified ? { borderColor: '#34d399' } : {}}
              className="w-12 h-14 rounded-xl text-center text-xl font-bold outline-none transition-all"
              style={{
                background: d ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.05)',
                border: `1.5px solid ${d ? 'rgba(129,140,248,0.5)' : 'rgba(255,255,255,0.1)'}`,
                color: 'rgba(255,255,255,0.9)',
              }} />
          ))}
        </div>

        <div className="flex items-center justify-between px-1">
          <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {timer > 0 ? `Resend in ${timer}s` : "Didn't receive it?"}
          </p>
          {timer === 0 && <button onClick={() => setTimer(30)} className="text-[12px] font-semibold" style={{ color: '#818cf8' }}>Resend OTP</button>}
        </div>

        <AnimatePresence>
          {verified && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-4 flex items-center gap-3"
              style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)' }}>
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-green-400">Phone verified</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Number hash stored · raw number discarded</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </StepShell>
  );
}

// ═══════════════════════════════════════════════════════════════
// STEP 3 — Anonymous Identity Builder
// ═══════════════════════════════════════════════════════════════

const AVATARS = ['🦊','🌙','⚡','🌊','🔮','🌺','🌑','🧊','🌿','🔥','🎭','🦋','🐺','🌈','⚓','🎪'];
const ID_COLORS = ['#818cf8','#34d399','#f59e0b','#f472b6','#60a5fa','#fb923c','#a78bfa','#86efac'];

function IdentityStep({ onNext }: { onNext: (avatar: string, color: string) => void }) {
  const [avatar, setAvatar] = useState('🦊');
  const [color, setColor] = useState('#818cf8');
  const [code] = useState(() => String(Math.floor(1000 + Math.random() * 9000)));
  const [revealed, setRevealed] = useState(false);

  useEffect(() => { setTimeout(() => setRevealed(true), 300); }, []);

  return (
    <StepShell id="identity">
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5" style={{ scrollbarWidth: 'none' }}>
        <div className="text-center pt-2">
          <h2 className="text-xl font-black" style={{ color: 'rgba(255,255,255,0.9)' }}>Build Your Identity</h2>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>This is all anyone will ever see</p>
        </div>

        {/* Live preview card */}
        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: revealed ? 1 : 0, scale: revealed ? 1 : 0.92 }}
          transition={{ type: 'spring', damping: 16, stiffness: 200 }}
          className="mx-auto rounded-3xl p-5 flex items-center gap-4 w-full"
          style={{ background: `linear-gradient(135deg, ${color}14, ${color}08)`, border: `1.5px solid ${color}30`, boxShadow: `0 0 40px ${color}18` }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 text-3xl"
            style={{ background: `${color}20`, border: `1.5px solid ${color}40` }}>
            {avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ background: color }} />
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color }}>Anonymous #{code}</span>
            </div>
            <p className="text-base font-black" style={{ color: 'rgba(255,255,255,0.85)' }}>Unknown Human</p>
            <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Real identity hidden · Verified ✓</p>
          </div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)' }}>
            <Shield className="w-4 h-4" style={{ color: '#34d399' }} />
          </div>
        </motion.div>

        {/* Avatar picker */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>Choose your avatar</p>
          <div className="grid grid-cols-8 gap-2">
            {AVATARS.map(a => (
              <motion.button key={a} whileTap={{ scale: 0.88 }} onClick={() => setAvatar(a)}
                className="w-full aspect-square rounded-xl flex items-center justify-center text-xl transition-all"
                style={{
                  background: avatar === a ? `${color}22` : 'rgba(255,255,255,0.04)',
                  border: `1.5px solid ${avatar === a ? color : 'rgba(255,255,255,0.08)'}`,
                  boxShadow: avatar === a ? `0 0 12px ${color}30` : 'none',
                }}>
                {a}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Color picker */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>Choose your colour</p>
          <div className="flex gap-3">
            {ID_COLORS.map(c => (
              <motion.button key={c} whileTap={{ scale: 0.85 }} onClick={() => setColor(c)}
                className="flex-1 aspect-square rounded-xl transition-all"
                style={{
                  background: c,
                  border: `2px solid ${color === c ? 'white' : 'transparent'}`,
                  boxShadow: color === c ? `0 0 14px ${c}70` : 'none',
                  opacity: color === c ? 1 : 0.55,
                }} />
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-3.5 flex items-start gap-3" style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)' }}>
          <Lock className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#818cf8' }} />
          <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(167,139,250,0.6)' }}>
            Your avatar and colour are your only public identity markers. Your anon code <span className="font-bold">#{code}</span> is unique and permanent.
          </p>
        </div>
      </div>

      <div className="flex-shrink-0 px-6 pb-8 pt-3">
        <CTAButton label="This is me" onClick={() => onNext(avatar, color)} icon={<Sparkles className="w-4 h-4" />} />
      </div>
    </StepShell>
  );
}

// ═══════════════════════════════════════════════════════════════
// STEP 4 — Persona
// ═══════════════════════════════════════════════════════════════

const PERSONAS = [
  { id:'deep',     emoji:'🧠', label:'Deep Diver',          sub:'Introspective · unfiltered · real',  color:'#818cf8' },
  { id:'story',    emoji:'🎭', label:'Story Weaver',         sub:'Collaborative fiction · narrative',  color:'#a78bfa' },
  { id:'hot',      emoji:'🔥', label:'Hot Take Generator',   sub:'Debate · challenge · no filter',     color:'#f87171' },
  { id:'heal',     emoji:'💚', label:'Healing Space',        sub:'Processing · support · gentleness',  color:'#34d399' },
  { id:'chaos',    emoji:'🎨', label:'Creative Chaos',       sub:'Art · ideas · weird experiments',    color:'#f59e0b' },
  { id:'social',   emoji:'🦋', label:'Social Butterfly',     sub:'Meeting minds · vibing · exploring', color:'#60a5fa' },
];

function PersonaStep({ onNext }: { onNext: (persona: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <StepShell id="persona">
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5" style={{ scrollbarWidth: 'none' }}>
        <div className="text-center pt-2">
          <h2 className="text-xl font-black" style={{ color: 'rgba(255,255,255,0.9)' }}>What brings you here?</h2>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Sets your default scenario matching</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {PERSONAS.map(p => {
            const active = selected === p.id;
            return (
              <motion.button key={p.id} whileTap={{ scale: 0.96 }} onClick={() => setSelected(p.id)}
                className="rounded-2xl p-4 flex flex-col items-start gap-2 text-left transition-all"
                style={{
                  background: active ? `${p.color}18` : 'rgba(255,255,255,0.03)',
                  border: `1.5px solid ${active ? p.color : 'rgba(255,255,255,0.07)'}`,
                  boxShadow: active ? `0 0 20px ${p.color}20` : 'none',
                }}>
                <div className="flex items-center justify-between w-full">
                  <span className="text-2xl">{p.emoji}</span>
                  {active && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: p.color }}>
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </motion.div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: active ? p.color : 'rgba(255,255,255,0.7)' }}>{p.label}</p>
                  <p className="text-[9px] mt-0.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>{p.sub}</p>
                </div>
              </motion.button>
            );
          })}
        </div>

        <p className="text-center text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
          You can change this anytime from your profile
        </p>
      </div>

      <div className="flex-shrink-0 px-6 pb-8 pt-3">
        <CTAButton label="Set my persona" onClick={() => selected && onNext(selected)} disabled={!selected}
          icon={<User className="w-4 h-4" />} />
      </div>
    </StepShell>
  );
}

// ═══════════════════════════════════════════════════════════════
// STEP 5 — Mood
// ═══════════════════════════════════════════════════════════════

const MOODS = [
  { id:'Happy',      emoji:'😊', label:'Happy',      sub:"Your light is contagious",   color:'#fbbf24', bg:'rgba(251,191,36,0.12)'  },
  { id:'Calm',       emoji:'😌', label:'Calm',        sub:'Still and centred',          color:'#06b6d4', bg:'rgba(6,182,212,0.12)'   },
  { id:'Sad',        emoji:'😢', label:'Sad',         sub:'It\'s okay to not be okay',  color:'#8b5cf6', bg:'rgba(139,92,246,0.12)'  },
  { id:'Anxious',    emoji:'😰', label:'Anxious',     sub:'Breathe — you\'re safe here',color:'#ef4444', bg:'rgba(239,68,68,0.12)'   },
  { id:'Tired',      emoji:'😴', label:'Tired',       sub:'Rest is valid too',          color:'#94a3b8', bg:'rgba(148,163,184,0.12)' },
  { id:'Frustrated', emoji:'😤', label:'Frustrated',  sub:'Let it out, safely',         color:'#f97316', bg:'rgba(249,115,22,0.12)'  },
];

function MoodStep({ onNext }: { onNext: (mood: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const activeMood = MOODS.find(m => m.id === selected);

  return (
    <StepShell id="mood">
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5" style={{ scrollbarWidth: 'none' }}>
        <div className="text-center pt-2">
          <h2 className="text-xl font-black" style={{ color: 'rgba(255,255,255,0.9)' }}>How are you feeling?</h2>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Sets your ambient mood for this session</p>
        </div>

        {/* Mood preview */}
        <AnimatePresence mode="wait">
          {activeMood ? (
            <motion.div key={activeMood.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              className="rounded-2xl px-5 py-4 flex items-center gap-4"
              style={{ background: activeMood.bg, border: `1.5px solid ${activeMood.color}30` }}>
              <span className="text-4xl">{activeMood.emoji}</span>
              <div>
                <p className="text-base font-black" style={{ color: activeMood.color }}>{activeMood.label}</p>
                <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{activeMood.sub}</p>
              </div>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="rounded-2xl px-5 py-4 flex items-center gap-4"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.06)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <Heart className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.2)' }} />
              </div>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>Select a mood below…</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mood grid */}
        <div className="grid grid-cols-3 gap-2.5">
          {MOODS.map(m => {
            const active = selected === m.id;
            return (
              <motion.button key={m.id} whileTap={{ scale: 0.93 }} onClick={() => setSelected(m.id)}
                className="rounded-2xl py-4 flex flex-col items-center gap-2 transition-all"
                style={{
                  background: active ? m.bg : 'rgba(255,255,255,0.03)',
                  border: `1.5px solid ${active ? m.color : 'rgba(255,255,255,0.07)'}`,
                  boxShadow: active ? `0 0 20px ${m.color}25` : 'none',
                }}>
                <motion.span animate={{ scale: active ? 1.15 : 1 }} transition={{ type: 'spring', damping: 12 }}
                  style={{ fontSize: 28, lineHeight: 1 }}>
                  {m.emoji}
                </motion.span>
                <span className="text-[11px] font-bold" style={{ color: active ? m.color : 'rgba(255,255,255,0.45)' }}>{m.label}</span>
              </motion.button>
            );
          })}
        </div>

        <div className="rounded-2xl p-3.5 flex items-start gap-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Your mood is only visible to people you are actively chatting with. It updates your ambient background and helps match you with the right conversations.
          </p>
        </div>
      </div>

      <div className="flex-shrink-0 px-6 pb-8 pt-3">
        <CTAButton label="Continue" onClick={() => selected && onNext(selected)} disabled={!selected}
          icon={<Heart className="w-4 h-4" />} />
      </div>
    </StepShell>
  );
}

// ═══════════════════════════════════════════════════════════════
// STEP 6 — Device Fingerprint
// ═══════════════════════════════════════════════════════════════

const FP_CHECKS = [
  { label:'CPU Cores',       value:'8 cores',          delay:0.0  },
  { label:'GPU Renderer',    value:'WebGL2 / Adreno',  delay:0.35 },
  { label:'Canvas Hash',     value:'a3f9…c12e',         delay:0.65 },
  { label:'Touch API',       value:'Detected',          delay:0.9  },
  { label:'Timezone',        value:'Asia/Kolkata',      delay:1.15 },
  { label:'Screen',          value:'390×844 · 3x DPR', delay:1.4  },
  { label:'Network Entropy', value:'Analyzed',          delay:1.65 },
  { label:'Battery API',     value:'84% · discharging', delay:1.9  },
];

function DeviceStep({ onNext }: { onNext: () => void }) {
  const [visible, setVisible] = useState<number[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    FP_CHECKS.forEach((c, i) => {
      setTimeout(() => setVisible(v => [...v, i]), c.delay * 1000 + 400);
    });
    setTimeout(() => { setDone(true); setTimeout(onNext, 900); }, 2900);
  }, [onNext]);

  return (
    <StepShell id="device">
      <div className="flex-1 px-6 py-8 flex flex-col gap-5">
        <div className="flex flex-col items-center gap-4 pt-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
              style={{ background:'rgba(52,211,153,0.12)', border:'1px solid rgba(52,211,153,0.28)' }}>
              <Cpu className="w-9 h-9" style={{ color:'#34d399' }} />
            </div>
            {!done && (
              <motion.div className="absolute inset-0 rounded-3xl border-2"
                style={{ borderColor:'#34d399', borderTopColor:'transparent' }}
                animate={{ rotate:360 }} transition={{ duration:1.2, repeat:Infinity, ease:'linear' }} />
            )}
            {done && (
              <motion.div initial={{ scale:0 }} animate={{ scale:1 }}
                className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background:'#34d399', boxShadow:'0 0 12px rgba(52,211,153,0.5)' }}>
                <CheckCircle2 className="w-4 h-4 text-white" />
              </motion.div>
            )}
          </div>
          <div className="text-center">
            <h2 className="text-xl font-black" style={{ color:'rgba(255,255,255,0.9)' }}>Device Fingerprint</h2>
            <p className="text-sm mt-1" style={{ color:'rgba(255,255,255,0.35)' }}>Invisible · Passive · No personal data</p>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(52,211,153,0.15)' }}>
          <div className="px-4 py-2.5 flex items-center gap-2" style={{ borderBottom:'1px solid rgba(255,255,255,0.05)', background:'rgba(52,211,153,0.06)' }}>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background:'#34d399' }} />
            <span className="text-[10px] font-mono font-bold" style={{ color:'#34d399' }}>SCANNING DEVICE ENTROPY</span>
          </div>
          <div className="px-4 py-2 font-mono">
            {FP_CHECKS.map((c, i) => (
              <AnimatePresence key={c.label}>
                {visible.includes(i) && (
                  <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} transition={{ duration:0.2 }}
                    className="flex items-center justify-between py-2" style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                    <span className="text-[10px]" style={{ color:'rgba(255,255,255,0.35)' }}>{c.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold" style={{ color:'#34d399' }}>{c.value}</span>
                      <CheckCircle2 className="w-3 h-3 text-green-400" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            ))}
          </div>
        </div>

        {done && (
          <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
            className="rounded-2xl p-4" style={{ background:'rgba(52,211,153,0.07)', border:'1px solid rgba(52,211,153,0.2)' }}>
            <div className="flex items-center gap-2 mb-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <p className="text-sm font-bold text-green-400">Device linked</p>
            </div>
            <p className="text-[10px] leading-relaxed" style={{ color:'rgba(255,255,255,0.3)' }}>
              A unique device hash is stored. Raw device data was analyzed locally and immediately discarded.
            </p>
          </motion.div>
        )}
      </div>
    </StepShell>
  );
}

// ═══════════════════════════════════════════════════════════════
// STEP 7 — Behavioral Biometrics
// ═══════════════════════════════════════════════════════════════

const SAMPLE_TEXT = "the measure of who we are is what we do with what we have";

function BiometricStep({ onNext }: { onNext: () => void }) {
  const [typed, setTyped] = useState('');
  const [intervals, setIntervals] = useState<number[]>([]);
  const lastTime = useRef<number>(0);
  const [done, setDone] = useState(false);

  const handleKey = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const now = Date.now();
    if (lastTime.current > 0) {
      const gap = Math.min(800, now - lastTime.current);
      setIntervals(prev => [...prev.slice(-19), gap]);
    }
    lastTime.current = now;
  }, []);

  const handleChange = (v: string) => {
    if (done) return;
    const match = SAMPLE_TEXT.slice(0, v.length);
    if (v !== match) return;
    setTyped(v);
    if (v === SAMPLE_TEXT) { setDone(true); setTimeout(onNext, 1200); }
  };

  const progress = (typed.length / SAMPLE_TEXT.length) * 100;
  const maxInterval = Math.max(...intervals, 1);

  return (
    <StepShell id="biometric">
      <div className="flex-1 px-6 py-8 flex flex-col gap-5">
        <div className="flex flex-col items-center gap-4 pt-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background:'rgba(245,158,11,0.15)', border:'1px solid rgba(245,158,11,0.3)' }}>
            <Fingerprint className="w-8 h-8" style={{ color:'#f59e0b' }} />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-black" style={{ color:'rgba(255,255,255,0.9)' }}>Behavioral Signature</h2>
            <p className="text-sm mt-1" style={{ color:'rgba(255,255,255,0.35)' }}>Type the phrase — your rhythm is unique</p>
          </div>
        </div>

        <div className="rounded-2xl p-4" style={{ background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.15)' }}>
          <p className="text-[10px] font-bold mb-2 uppercase tracking-widest" style={{ color:'rgba(245,158,11,0.6)' }}>Type this phrase exactly</p>
          <p className="text-sm leading-relaxed font-mono" style={{ color:'rgba(255,255,255,0.55)' }}>
            {SAMPLE_TEXT.split('').map((char, i) => (
              <span key={i} style={{ color: typed[i] === char ? '#f59e0b' : i < typed.length ? '#f87171' : 'rgba(255,255,255,0.35)' }}>{char}</span>
            ))}
          </p>
          <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.08)' }}>
            <motion.div className="h-full rounded-full" style={{ background:'linear-gradient(90deg, #f59e0b, #fbbf24)' }}
              animate={{ width:`${progress}%` }} transition={{ duration:0.1 }} />
          </div>
        </div>

        <textarea value={typed} onChange={e => handleChange(e.target.value)} onKeyDown={handleKey}
          placeholder="Start typing…" rows={2}
          className="rounded-xl px-4 py-3 text-sm resize-none outline-none font-mono"
          style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.8)', caretColor:'#f59e0b', lineHeight:'1.6' }} />

        {intervals.length > 2 && (
          <div>
            <p className="text-[9px] font-mono mb-2" style={{ color:'rgba(255,255,255,0.2)' }}>KEYSTROKE INTERVALS (ms)</p>
            <div className="flex items-end gap-0.5 h-10">
              {intervals.map((v, i) => (
                <motion.div key={i} initial={{ height:0 }} animate={{ height:`${(v/maxInterval)*100}%` }}
                  className="flex-1 rounded-sm"
                  style={{ background:`rgba(245,158,11,${0.3 + (i/intervals.length)*0.5})`, minHeight:3 }} />
              ))}
            </div>
          </div>
        )}

        {done && (
          <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.25)' }}>
            <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-400">Behavioral signature captured</p>
              <p className="text-[10px] mt-0.5" style={{ color:'rgba(255,255,255,0.35)' }}>Typing cadence encoded as non-reversible hash</p>
            </div>
          </motion.div>
        )}
      </div>
    </StepShell>
  );
}

// ═══════════════════════════════════════════════════════════════
// STEP 8 — Liveness Detection
// ═══════════════════════════════════════════════════════════════

const LIVENESS_STAGES = [
  { label:'Position face within the frame',  duration:1200 },
  { label:'Hold still — detecting…',          duration:1000 },
  { label:'Liveness confirmed',               duration:800  },
  { label:'Generating cryptographic hash…',   duration:900  },
  { label:'Hash saved · Raw image discarded', duration:700  },
];

function LivenessStep({ onNext }: { onNext: () => void }) {
  const [stage, setStage] = useState(0);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    let elapsed = 0;
    LIVENESS_STAGES.forEach((s, i) => {
      setTimeout(() => setStage(i), elapsed);
      elapsed += s.duration;
    });
    setTimeout(onNext, elapsed + 600);
    const cd = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(cd);
  }, [onNext]);

  const complete = stage >= 4;

  return (
    <StepShell id="liveness">
      <div className="flex-1 px-6 py-8 flex flex-col gap-6 items-center">
        <div className="text-center pt-4">
          <h2 className="text-xl font-black" style={{ color:'rgba(255,255,255,0.9)' }}>Liveness Check</h2>
          <p className="text-sm mt-1" style={{ color:'rgba(255,255,255,0.35)' }}>Proves human presence — image never stored</p>
        </div>

        <div className="relative flex items-center justify-center" style={{ width:220, height:220 }}>
          {[[0,0,'tl'],[0,1,'tr'],[1,0,'bl'],[1,1,'br']].map(([top,right,k]) => (
            <div key={k as string} className="absolute w-8 h-8" style={{
              top:top?'auto':12, bottom:top?12:'auto',
              left:right?'auto':12, right:right?12:'auto',
              borderTop:!top?'2.5px solid #f472b6':'none',
              borderBottom:top?'2.5px solid #f472b6':'none',
              borderLeft:!right?'2.5px solid #f472b6':'none',
              borderRight:right?'2.5px solid #f472b6':'none',
            }} />
          ))}

          <div className="rounded-full flex items-center justify-center overflow-hidden"
            style={{ width:160, height:185, background:complete?'rgba(52,211,153,0.08)':'rgba(244,114,182,0.05)', border:`2px solid ${complete?'rgba(52,211,153,0.5)':'rgba(244,114,182,0.3)'}`, transition:'all 0.5s ease' }}>
            <span style={{ fontSize:72, filter:stage < 2?'blur(6px)':'none', transition:'filter 0.5s ease' }}>👤</span>
          </div>

          {!complete && (
            <motion.div className="absolute rounded-full border-2"
              style={{ width:176, height:200, borderColor:'#f472b6', borderTopColor:'transparent', borderRightColor:'transparent' }}
              animate={{ rotate:360 }} transition={{ duration:1.5, repeat:Infinity, ease:'linear' }} />
          )}

          {countdown > 0 && stage < 2 && (
            <div className="absolute top-2 right-4 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background:'rgba(244,114,182,0.2)', border:'1px solid rgba(244,114,182,0.4)' }}>
              <span className="text-sm font-black" style={{ color:'#f472b6' }}>{countdown}</span>
            </div>
          )}

          {complete && (
            <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring', damping:10 }}
              className="absolute -top-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background:'#34d399', boxShadow:'0 0 20px rgba(52,211,153,0.5)' }}>
              <CheckCircle2 className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </div>

        <div className="w-full flex flex-col gap-2">
          {LIVENESS_STAGES.map((s, i) => (
            <motion.div key={i} animate={{ opacity: i <= stage ? 1 : 0.15 }} transition={{ duration:0.25 }}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
              style={{ background:i<=stage?'rgba(244,114,182,0.06)':'rgba(255,255,255,0.02)', border:`1px solid ${i<=stage?'rgba(244,114,182,0.2)':'rgba(255,255,255,0.05)'}` }}>
              {i < stage
                ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                : i === stage
                  ? <motion.div animate={{ opacity:[1,0.3,1] }} transition={{ duration:1.2, repeat:Infinity }} className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ background:'#f472b6' }} />
                  : <div className="w-3.5 h-3.5 rounded-full border flex-shrink-0" style={{ borderColor:'rgba(255,255,255,0.1)' }} />}
              <span className="text-[11px]" style={{ color:i<stage?'#34d399':i===stage?'#f9a8d4':'rgba(255,255,255,0.25)' }}>{s.label}</span>
            </motion.div>
          ))}
        </div>

        <div className="rounded-2xl p-3.5 flex items-start gap-3 w-full"
          style={{ background:'rgba(244,114,182,0.05)', border:'1px solid rgba(244,114,182,0.12)' }}>
          <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color:'#f472b6' }} />
          <p className="text-[10px] leading-relaxed" style={{ color:'rgba(255,255,255,0.3)' }}>
            Raw image is <span className="font-bold" style={{ color:'#f9a8d4' }}>never stored or transmitted</span>. Only a non-reversible cryptographic hash is retained.
          </p>
        </div>
      </div>
    </StepShell>
  );
}

// ═══════════════════════════════════════════════════════════════
// STEP 9 — Success
// ═══════════════════════════════════════════════════════════════

function SuccessStep({
  onComplete, avatar, color, persona, mood,
}: {
  onComplete: () => void;
  avatar: string; color: string; persona: string; mood: string;
}) {
  const checks = [
    { icon:Phone,       label:'Phone OTP',            score:98,  color:'#818cf8' },
    { icon:Cpu,         label:'Device Fingerprint',   score:100, color:'#34d399' },
    { icon:Fingerprint, label:'Behavioral Biometrics',score:94,  color:'#f59e0b' },
    { icon:Eye,         label:'Liveness Detection',   score:100, color:'#f472b6' },
  ];
  const overall = Math.round(checks.reduce((a,c) => a + c.score, 0) / checks.length);
  const personaObj = PERSONAS.find(p => p.id === persona);
  const moodObj    = MOODS.find(m => m.id === mood);

  return (
    <StepShell id="success">
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5" style={{ scrollbarWidth:'none' }}>
        <div className="flex flex-col items-center gap-4 pt-4">
          <motion.div initial={{ scale:0.5, opacity:0 }} animate={{ scale:1, opacity:1 }}
            transition={{ type:'spring', damping:10, stiffness:200 }}
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{ background:`linear-gradient(135deg, ${color}40, rgba(52,211,153,0.2))`, border:`2px solid ${color}50`, boxShadow:`0 0 40px ${color}30` }}>
            <span style={{ fontSize:44 }}>{avatar}</span>
          </motion.div>
          <div className="text-center">
            <motion.h2 initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
              className="text-2xl font-black" style={{ color:'rgba(255,255,255,0.9)' }}>
              Welcome to RolePlay ✓
            </motion.h2>
            <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}
              className="text-sm mt-1" style={{ color:'rgba(255,255,255,0.38)' }}>
              Verified human · Identity secured · All layers passed
            </motion.p>
          </div>
        </div>

        {/* Identity summary */}
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }}
          className="rounded-2xl p-4 flex items-center gap-4"
          style={{ background:`${color}12`, border:`1.5px solid ${color}28` }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background:`${color}20`, border:`1.5px solid ${color}35` }}>
            {avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black" style={{ color:'rgba(255,255,255,0.85)' }}>Your Anonymous Identity</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {personaObj && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                  style={{ background:`${personaObj.color}18`, color:personaObj.color, border:`1px solid ${personaObj.color}30` }}>
                  {personaObj.emoji} {personaObj.label}
                </span>
              )}
              {moodObj && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                  style={{ background:`${moodObj.color}18`, color:moodObj.color, border:`1px solid ${moodObj.color}30` }}>
                  {moodObj.emoji} {moodObj.label}
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Trust Score */}
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}
          className="rounded-2xl p-5 text-center"
          style={{ background:'linear-gradient(135deg, rgba(79,70,229,0.15), rgba(52,211,153,0.08))', border:'1px solid rgba(99,102,241,0.25)' }}>
          <p className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color:'rgba(255,255,255,0.3)' }}>Human Trust Score</p>
          <div className="flex items-end justify-center gap-1 mb-2">
            <motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.6 }}
              className="text-6xl font-black"
              style={{ background:'linear-gradient(135deg, #818cf8, #34d399)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', lineHeight:1 }}>
              {overall}
            </motion.span>
            <span className="text-2xl font-bold pb-1" style={{ color:'rgba(255,255,255,0.3)' }}>/100</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.08)' }}>
            <motion.div className="h-full rounded-full" initial={{ width:0 }} animate={{ width:`${overall}%` }}
              transition={{ delay:0.7, duration:1, ease:[0.16,1,0.3,1] }}
              style={{ background:'linear-gradient(90deg, #818cf8, #34d399)' }} />
          </div>
        </motion.div>

        {/* Layer scores */}
        <div className="flex flex-col gap-2">
          {checks.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div key={c.label} initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.5 + i * 0.09 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background:`${c.color}18`, border:`1px solid ${c.color}28` }}>
                  <Icon className="w-4 h-4" style={{ color:c.color, width:16, height:16 }} />
                </div>
                <p className="flex-1 text-sm font-semibold" style={{ color:'rgba(255,255,255,0.7)' }}>{c.label}</p>
                <div className="flex items-center gap-2">
                  <div className="w-14 h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.07)' }}>
                    <div className="h-full rounded-full" style={{ width:`${c.score}%`, background:c.color }} />
                  </div>
                  <span className="text-[11px] font-mono font-bold w-7 text-right" style={{ color:c.color }}>{c.score}</span>
                </div>
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-green-400" />
              </motion.div>
            );
          })}
        </div>

        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1 }}
          className="rounded-2xl p-4 flex items-start gap-3"
          style={{ background:'rgba(99,102,241,0.07)', border:'1px solid rgba(99,102,241,0.15)' }}>
          <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color:'#818cf8' }} />
          <p className="text-[11px] leading-relaxed" style={{ color:'rgba(167,139,250,0.6)' }}>
            No government ID, real name, or email was collected. Your verification is a mathematical proof only. You remain completely anonymous.
          </p>
        </motion.div>
      </div>

      <div className="flex-shrink-0 px-6 pb-8 pt-4">
        <motion.button whileTap={{ scale:0.97 }} onClick={onComplete}
          initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.9 }}
          className="w-full py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-2"
          style={{ background:`linear-gradient(135deg, ${color}, #8169ec)`, boxShadow:`0 8px 32px ${color}50`, color:'white' }}>
          <Zap className="w-5 h-5" />
          Enter RolePlay
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </StepShell>
  );
}

// ═══════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════

export function Authentication({ onComplete }: AuthenticationProps) {
  const [step, setStep]     = useState<Step>('intro');
  const [avatar, setAvatar] = useState('🦊');
  const [color, setColor]   = useState('#818cf8');
  const [persona, setPersona] = useState('');
  const [mood, setMood]     = useState('');

  const stepIndex = FLOW_STEPS.indexOf(step);

  return (
    <div className="h-screen flex flex-col overflow-hidden"
      style={{ background:'#15141d', fontFamily:'"Plus Jakarta Sans", system-ui, sans-serif' }}>

      {/* Header */}
      <div className="flex-shrink-0 px-5 pt-12 pb-4"
        style={{ background:'rgba(9,9,20,0.97)', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background:'linear-gradient(135deg, #8169ec, #8169ec)' }}>
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold" style={{ color:'rgba(255,255,255,0.7)' }}>RolePlay</span>
          </div>
          <div className="flex items-center gap-2">
            {step !== 'intro' && step !== 'success' && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                style={{ background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.3)' }}>
                {STEP_LABELS[step]}
              </span>
            )}
            {step !== 'intro' && step !== 'success' && (
              <span className="text-[10px] font-mono" style={{ color:'rgba(255,255,255,0.2)' }}>
                {stepIndex} / {FLOW_STEPS.length - 1}
              </span>
            )}
          </div>
        </div>
        {step !== 'intro' && <ProgressBar step={step} />}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {step === 'intro'     && <IntroStep    key="intro"      onNext={() => setStep('phone')} />}
          {step === 'phone'     && <PhoneStep    key="phone"      onNext={() => setStep('otp')} />}
          {step === 'otp'       && <OTPStep      key="otp"        onNext={() => setStep('identity')} />}
          {step === 'identity'  && <IdentityStep key="identity"   onNext={(a,c) => { setAvatar(a); setColor(c); setStep('persona'); }} />}
          {step === 'persona'   && <PersonaStep  key="persona"    onNext={p => { setPersona(p); setStep('mood'); }} />}
          {step === 'mood'      && <MoodStep     key="mood"       onNext={m => { setMood(m); setStep('device'); }} />}
          {step === 'device'    && <DeviceStep   key="device"     onNext={() => setStep('biometric')} />}
          {step === 'biometric' && <BiometricStep key="biometric" onNext={() => setStep('liveness')} />}
          {step === 'liveness'  && <LivenessStep  key="liveness"  onNext={() => setStep('success')} />}
          {step === 'success'   && <SuccessStep   key="success"   onComplete={onComplete} avatar={avatar} color={color} persona={persona} mood={mood} />}
        </AnimatePresence>
      </div>
    </div>
  );
}
