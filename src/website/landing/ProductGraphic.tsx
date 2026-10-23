import {useId} from 'react';
import {Compass, Gamepad2, KeyRound} from 'lucide-react';

export type ProductGraphicKind = 'controller' | 'cards' | 'orbit' | 'garden';
export type ProductGraphicTone = 'pink' | 'cyan' | 'amber';

const materials: Record<ProductGraphicTone, [string, string, string, string]> = {
  pink: ['#ffe5f3', '#da8ab9', '#75415d', '#251722'],
  cyan: ['#d8ffff', '#77cfd6', '#326879', '#122129'],
  amber: ['#fff0ce', '#dcb373', '#7b552b', '#282015'],
};

// Adapted from the original ROLEPLAY gradient card illustrations (80be380).
// Keep this renderer local to the landing page so the app artwork stays separate.
export function ProductGraphic({kind, tone}: {kind: ProductGraphicKind; tone: ProductGraphicTone}) {
  const id = `rp-product-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const [light, mid, shade, dark] = materials[tone];
  const paint = (name: string) => `url(#${id}-${name})`;

  return <svg className="rp-tool-graphic" viewBox="0 0 240 140" fill="none" aria-hidden="true" focusable="false" data-graphic={kind} data-material={tone}>
    <defs>
      <linearGradient id={`${id}-body`} x1="68" y1="22" x2="171" y2="119" gradientUnits="userSpaceOnUse">
        <stop stopColor={light}/><stop offset=".22" stopColor={mid}/><stop offset=".52" stopColor={shade}/><stop offset=".82" stopColor={dark}/><stop offset="1" stopColor={mid}/>
      </linearGradient>
      <radialGradient id={`${id}-sphere`} cx="98" cy="42" r="91" gradientUnits="userSpaceOnUse">
        <stop stopColor={light}/><stop offset=".24" stopColor={mid}/><stop offset=".54" stopColor={shade}/><stop offset=".86" stopColor={dark}/><stop offset="1" stopColor="#090a11"/>
      </radialGradient>
      <linearGradient id={`${id}-cool`} x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#c5e9ff"/><stop offset=".3" stopColor="#6c9cbd"/><stop offset=".68" stopColor="#263d59"/><stop offset="1" stopColor="#111a2a"/>
      </linearGradient>
      <linearGradient id={`${id}-warm`} x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#f0d6aa"/><stop offset=".28" stopColor="#b38c63"/><stop offset=".65" stopColor="#5e423d"/><stop offset="1" stopColor="#1d1623"/>
      </linearGradient>
      <linearGradient id={`${id}-rim`} x1="80" y1="25" x2="169" y2="116" gradientUnits="userSpaceOnUse">
        <stop stopColor={light} stopOpacity=".85"/><stop offset=".45" stopColor={mid} stopOpacity=".35"/><stop offset=".75" stopColor={dark} stopOpacity=".2"/><stop offset="1" stopColor={mid} stopOpacity=".65"/>
      </linearGradient>
      <radialGradient id={`${id}-floor`}><stop stopColor={mid} stopOpacity=".24"/><stop offset="1" stopColor={mid} stopOpacity="0"/></radialGradient>
      <filter id={`${id}-shadow`} x="-35%" y="-40%" width="170%" height="190%" colorInterpolationFilters="sRGB">
        <feDropShadow dx="3" dy="7" stdDeviation="5" floodColor="#000" floodOpacity=".65"/>
      </filter>
    </defs>
    <ellipse cx="123" cy="123" rx="75" ry="12" fill={paint('floor')}/>
    <g filter={paint('shadow')}>
      {kind === 'controller' && <>
        <circle cx="119" cy="72" r="47" stroke={mid} strokeWidth="1.5" opacity=".35" strokeDasharray="4 7"/>
        <path d="M80 40h74q13 0 17 16l9 39q3 19-12 20-9 0-23-16H95q-15 16-24 16-15-1-12-20l9-39q4-16 12-16" fill={paint('body')} stroke={paint('rim')} strokeWidth="1.3"/>
        <circle cx="155" cy="61" r="4" fill={light} opacity=".7"/><circle cx="164" cy="72" r="4" fill={mid} opacity=".75"/>
        <path d="M80 59v19m-9-10h18" stroke={light} strokeWidth="4" strokeLinecap="round" opacity=".55"/>
        <circle cx="58" cy="25" r="10" fill={paint('warm')} stroke={paint('rim')}/>
        <Gamepad2 x={105} y={72} width={25} height={25} color={light} opacity=".85" strokeWidth={1.8}/>
      </>}
      {kind === 'cards' && <>
        <rect x="67" y="29" width="77" height="88" rx="14" transform="rotate(-17 67 29)" fill={paint('cool')} stroke={paint('rim')}/>
        <rect x="95" y="18" width="77" height="91" rx="14" transform="rotate(14 95 18)" fill={paint('warm')} stroke={paint('rim')}/>
        <rect x="80" y="26" width="79" height="92" rx="14" fill={paint('body')} stroke={paint('rim')} strokeWidth="1.3"/>
        <path d="M96 102h31m6 0h10" stroke={mid} strokeWidth="2" strokeLinecap="round" opacity=".4"/>
        <KeyRound x={102} y={54} width={35} height={35} color={light} opacity=".85" strokeWidth={1.8}/>
      </>}
      {kind === 'orbit' && <>
        <circle cx="122" cy="72" r="43" fill={paint('sphere')} stroke={paint('rim')}/>
        <ellipse cx="122" cy="72" rx="76" ry="25" transform="rotate(-24 122 72)" stroke={paint('rim')} strokeWidth="2"/>
        <circle cx="179" cy="34" r="11" fill={paint('warm')} stroke={paint('rim')}/><circle cx="53" cy="94" r="8" fill={paint('cool')} stroke={paint('rim')}/>
        <path d="M98 108q19 15 47-2" stroke="#302540" strokeWidth="2" opacity=".25"/>
        <Compass x={103} y={53} width={38} height={38} color={light} opacity=".85" strokeWidth={1.8}/>
      </>}
      {kind === 'garden' && <>
        <path d="M63 82q30-10 57 5 25-15 58-5v38q-31-7-58 6-26-13-57-6V82" fill={paint('body')} stroke={paint('rim')}/>
        <path d="M120 87v38" stroke="#26362d" strokeWidth="2" opacity=".4"/>
        <path d="M120 86V39" stroke={mid} strokeWidth="4" strokeLinecap="round"/>
        <path d="M119 66Q76 60 84 32q33-3 35 34" fill={paint('cool')} stroke={paint('rim')}/>
        <path d="M122 51q2-34 34-32 5 28-34 32" fill={paint('body')} stroke={paint('rim')}/>
        <path d="M80 98h21m-21 9h17m42-8h22m-22 9h16" stroke="#26362d" strokeWidth="3" opacity=".3" strokeLinecap="round"/>
      </>}
    </g>
  </svg>;
}
