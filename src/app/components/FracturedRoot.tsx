import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, ChevronRight } from 'lucide-react';

interface FracturedRootProps {
  onAcknowledge: () => void;
}

const PENALTY_TIER = 'full';  // 'full' | 'moderate' | 'minimal'
const VOUCHED_DAYS_AGO = 14;

const PENALTY_DESC: Record<string, { label: string; color: string; desc: string }> = {
  full:     { label: '−1 Trust Tier',    color: '#ef4444', desc: 'Vouched within 30 days of violation. Active enablement.' },
  moderate: { label: 'Staked XP Lost',   color: '#f59e0b', desc: 'Relationship showed initial stability, then degraded.' },
  minimal:  { label: 'Vouch Severed',    color: '#94a3b8', desc: 'Long-term vouch — unpredictable shift. No rep penalty.' },
};

const TRACK_WIDTH = 240;
const THUMB_WIDTH = 60;
const MAX_DRAG = TRACK_WIDTH - THUMB_WIDTH;

export function FracturedRoot({ onAcknowledge }: FracturedRootProps) {
  const [dragX, setDragX] = useState(0);
  const pointerStart=useRef<number|null>(null);
  const [severed, setSevered] = useState(false);
  const penalty = PENALTY_DESC[PENALTY_TIER];

  const progress = dragX / MAX_DRAG;

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x >= MAX_DRAG * 0.88) {
      setDragX(MAX_DRAG);
      setSevered(true);
      setTimeout(onAcknowledge, 1600);
    } else {
      setDragX(0);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center"
      role="dialog" aria-modal="true" aria-label="Sample trust scenario"
      onKeyDown={e=>{if(e.key==='Escape')onAcknowledge();if(e.key==='Tab'){const controls=e.currentTarget.querySelectorAll<HTMLElement>('button,[tabindex="0"]');const first=controls[0],last=controls[controls.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}}}
      style={{
        background: 'radial-gradient(ellipse at center, #130a0a 0%, #070407 100%)',
        fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
      }}
    >
      <button autoFocus className="absolute top-4 right-4 px-4 py-3 rounded-xl text-white/70 text-sm" onClick={onAcknowledge}>Close preview</button>
      <p className="absolute top-6 left-4 text-xs text-white/50">Prototype trust scenario</p>
      <AnimatePresence>
        {!severed ? (
          <motion.div
            key="intercept"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-sm px-6 flex flex-col gap-6"
          >
            {/* Icon */}
            <div className="flex flex-col items-center gap-3">
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                {/* Fractured root SVG */}
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <circle cx="18" cy="18" r="14" stroke="rgba(239,68,68,0.4)" strokeWidth="1" />
                  <line x1="18" y1="4" x2="18" y2="32" stroke="rgba(239,68,68,0.35)" strokeWidth="0.8" />
                  <line x1="4" y1="18" x2="32" y2="18" stroke="rgba(239,68,68,0.35)" strokeWidth="0.8" />
                  {/* Fractured crack */}
                  <polyline points="12,8 16,14 13,18 18,24 22,20" stroke="#ef4444" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
                  {/* Nodes */}
                  <circle cx="12" cy="8" r="2.5" fill="rgba(239,68,68,0.6)" />
                  <circle cx="18" cy="18" r="3.5" fill="rgba(239,68,68,0.5)" stroke="rgba(239,68,68,0.7)" strokeWidth="1" />
                  <circle cx="22" cy="20" r="2" fill="rgba(239,68,68,0.4)" />
                </svg>
              </motion.div>
              <p className="text-xs font-bold tracking-widest uppercase" style={{ color: 'rgba(239,68,68,0.6)' }}>
                Root Fracture
              </p>
            </div>

            {/* Brief */}
            <div
              className="rounded-2xl p-5 flex flex-col gap-3"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(239,68,68,0.15)' }}
            >
              <p className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.8)' }}>
                A connection in your Roots network has been permanently restricted.
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                A user you staked your reputation on <span style={{ color: 'rgba(255,255,255,0.65)' }}>{VOUCHED_DAYS_AGO} days ago</span> has been issued a <span style={{ color: '#ef4444' }}>Severe Trust Violation</span> — permanently removed from the platform.
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Because you vouched for this user recently, your Trust Profile has absorbed a <span style={{ color: penalty.color, fontWeight: 700 }}>collateral hit</span>.
              </p>

              {/* Penalty tile */}
              <div
                className="rounded-xl px-3 py-2.5 flex items-center gap-3"
                style={{ background: `${penalty.color}0f`, border: `1px solid ${penalty.color}22` }}
              >
                <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: penalty.color }} />
                <div>
                  <p className="text-xs font-bold" style={{ color: penalty.color }}>{penalty.label}</p>
                  <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{penalty.desc}</p>
                </div>
              </div>
            </div>

            {/* Time decay explanation */}
            <div className="flex flex-col gap-1.5">
              {[
                { range: '0–30 days',  label: 'Maximum Penalty', active: true,  color: '#ef4444' },
                { range: '1–6 months', label: 'Moderate Penalty', active: false, color: '#f59e0b' },
                { range: '6+ months',  label: 'No Penalty',       active: false, color: '#94a3b8' },
              ].map(row => (
                <div
                  key={row.range}
                  className="flex items-center justify-between px-3 py-2 rounded-xl"
                  style={{
                    background: row.active ? `${row.color}0d` : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${row.active ? row.color + '25' : 'rgba(255,255,255,0.05)'}`,
                  }}
                >
                  <span className="text-[10px] font-mono" style={{ color: row.active ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)' }}>{row.range}</span>
                  <span className="text-[10px] font-bold" style={{ color: row.active ? row.color : 'rgba(255,255,255,0.2)' }}>{row.label}</span>
                  {row.active && <div className="w-1.5 h-1.5 rounded-full" style={{ background: row.color }} />}
                </div>
              ))}
            </div>

            {/* Swipe-to-sever slider */}
            <div className="flex flex-col items-center gap-3">
              <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                Slide to acknowledge and sever connection
              </p>
              <div
                className="relative rounded-full overflow-hidden"
                style={{
                  width: TRACK_WIDTH,
                  height: 56,
                  background: 'rgba(239,68,68,0.06)',
                  border: '1px solid rgba(239,68,68,0.18)',
                }}
              >
                {/* Fill track */}
                <div
                  className="absolute left-0 top-0 bottom-0 rounded-full transition-all"
                  style={{
                    width: `${(dragX / TRACK_WIDTH) * 100}%`,
                    background: `rgba(239,68,68,${0.05 + progress * 0.15})`,
                  }}
                />
                {/* Label */}
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{ paddingLeft: dragX }}
                >
                  <span
                    className="text-xs font-semibold select-none transition-opacity"
                    style={{ color: `rgba(239,68,68,${0.35 + progress * 0.3})` }}
                  >
                    {progress > 0.6 ? 'Release to sever' : 'Sever Connection & Accept Penalty'}
                  </span>
                </div>
                {/* Draggable thumb */}
                <motion.div
                  role="slider" tabIndex={0} aria-label="Trust scenario decision" aria-valuemin={0} aria-valuemax={MAX_DRAG} aria-valuenow={Math.round(dragX)}
                  onPointerDown={(e:React.PointerEvent<HTMLDivElement>)=>{pointerStart.current=e.clientX-dragX;e.currentTarget.setPointerCapture(e.pointerId);}}
                  onPointerMove={(e:React.PointerEvent<HTMLDivElement>)=>{if(pointerStart.current!==null)setDragX(Math.max(0,Math.min(MAX_DRAG,e.clientX-pointerStart.current)));}}
                  onPointerUp={(e:React.PointerEvent<HTMLDivElement>)=>{if(pointerStart.current===null)return;const x=e.clientX-pointerStart.current;pointerStart.current=null;handleDragEnd(null,{offset:{x}});}}
                  onPointerCancel={()=>{pointerStart.current=null;setDragX(0);}}
                  onKeyDown={(e:React.KeyboardEvent<HTMLDivElement>)=>{if(e.key==='ArrowRight'){e.preventDefault();setDragX(Math.min(MAX_DRAG,dragX+30));}if(e.key==='ArrowLeft'){e.preventDefault();setDragX(Math.max(0,dragX-30));}if(e.key==='Enter')handleDragEnd(null,{offset:{x:dragX}});}}
                  animate={{ x: dragX }}
                  className="absolute top-1 left-1 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing"
                  style={{
                    touchAction:'none',
                    transform:`translateX(${dragX}px)`,
                    width: THUMB_WIDTH - 8,
                    height: 48,
                    background: 'rgba(239,68,68,0.25)',
                    border: '1px solid rgba(239,68,68,0.45)',
                  }}
                >
                  <ChevronRight className="w-4 h-4 text-red-400" />
                  <ChevronRight className="w-4 h-4 text-red-400 -ml-2.5 opacity-50" />
                </motion.div>
              </div>
            </div>

          </motion.div>
        ) : (
          <motion.div
            key="severed"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4 px-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 14 }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.22)' }}
            >
              🔗
            </motion.div>
            <div>
              <p className="text-base font-bold" style={{ color: 'rgba(255,255,255,0.8)' }}>Connection Severed</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Sample outcome. No trust profile has been changed.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
