import {useId} from 'react';
import type {ChallengeId} from './challengeCatalog';

const colours:Record<ChallengeId,[string,string,string]>={
  'kind-no':['#e3ffa9','#7bd7ba','#a491ef'],
  'ask-first':['#ffe1a2','#f4a06e','#b3a0ef'],
  'small-stretch':['#d1b9ff','#9573e8','#8de5e5'],
  'listen-first':['#acf7ef','#63b9d1','#bca0fa'],
  'one-idea':['#ffc3e1','#d38ae7','#ffe3a0'],
  'take-pause':['#bcdfff','#809ee9','#b3f0c9'],
};

// Code-native artwork stays sharp at every viewport and shares the app's colour tokens.
export function ChallengeIllustration({id}:{id:ChallengeId}){
  const uid=useId().replace(/[^a-zA-Z0-9_-]/g,'');
  const [light,dark,extra]=colours[id];
  const main=`url(#${uid}-main)`,accent=`url(#${uid}-accent)`,glow=`url(#${uid}-glow)`;
  return <svg data-challenge-art={id} viewBox="0 0 320 180" fill="none" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id={`${uid}-main`} x1="90" y1="30" x2="235" y2="160" gradientUnits="userSpaceOnUse"><stop stopColor={light}/><stop offset="1" stopColor={dark}/></linearGradient>
      <linearGradient id={`${uid}-accent`} x1="88" y1="50" x2="242" y2="155" gradientUnits="userSpaceOnUse"><stop stopColor={extra}/><stop offset="1" stopColor={dark}/></linearGradient>
      <radialGradient id={`${uid}-glow`} cx="0" cy="0" r="1" gradientTransform="translate(160 97) rotate(90) scale(108 150)" gradientUnits="userSpaceOnUse"><stop stopColor={dark} stopOpacity=".24"/><stop offset="1" stopColor={dark} stopOpacity="0"/></radialGradient>
    </defs>
    <rect width="320" height="180" fill={glow}/>
    <ellipse cx="164" cy="157" rx="75" ry="10" fill="#09091a" opacity=".3"/>
    {id==='kind-no'&&<>
      <path d="M72 65c-18 30-10 65 13 84M246 39c21 27 27 62 10 91" stroke={extra} strokeOpacity=".32" strokeWidth="1.5" strokeDasharray="4 7"/>
      <path d="m163 29 60 23v44c0 32-33 56-60 64-27-9-58-33-58-65V53l58-24Z" fill={dark} opacity=".35" transform="translate(6 7)"/>
      <path d="m160 24 60 23v44c0 32-33 56-60 64-27-9-58-33-58-65V48l58-24Z" fill={main}/>
      <path d="m160 34 50 20v39c0 25-28 46-50 53-23-8-48-29-48-54V55l48-21Z" stroke="white" strokeOpacity=".5" strokeWidth="1.5"/>
      <path d="M143 112V72c0-6 9-6 9 0v19-34c0-7 10-7 10 0v34-27c0-7 10-7 10 0v28-18c0-7 10-7 10 0v30c0 15-11 22-23 22-10 0-19-4-24-14l-10-17c-3-6 5-11 9-6l9 10" fill="#20362f" fillOpacity=".82"/>
      <rect x="220" y="111" width="38" height="30" rx="12" fill={accent} transform="rotate(-12 220 111)"/><path d="m232 121 8 7 13-16" stroke="#f4eaff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="81" cy="54" r="9" fill={extra} fillOpacity=".6"/>
    </>}
    {id==='ask-first'&&<>
      <rect x="65" y="28" width="119" height="88" rx="27" fill={accent} transform="rotate(-9 65 28)"/>
      <path d="m104 104-6 23 28-18" fill={accent}/><path d="M94 61h62M94 77h35" stroke="#efe9ff" strokeOpacity=".8" strokeWidth="7" strokeLinecap="round"/>
      <path d="M155 74h78c16 0 29 13 29 29v26c0 16-13 29-29 29h-22l-20 16 1-16h-37c-16 0-29-13-29-29v-26c0-16 13-29 29-29Z" fill={main}/>
      <path d="M184 99c1-11 24-12 24 1 0 9-11 10-11 18" stroke="#5c3938" strokeWidth="6" strokeLinecap="round"/><circle cx="197" cy="132" r="3.5" fill="#5c3938"/>
      <path d="m250 32 3 8 9 3-9 3-3 8-3-8-9-3 9-3 3-8Z" fill={light}/><circle cx="72" cy="137" r="7" stroke={extra} strokeWidth="3"/>
    </>}
    {id==='small-stretch'&&<>
      <path d="M57 137c39 0 35-71 77-66 35 3 24 60 59 58 20-1 25-39 56-40" stroke={extra} strokeOpacity=".5" strokeWidth="2" strokeDasharray="5 7"/>
      <path d="m109 121 54-19 46 17-52 22-48-20Z" fill={main}/><path d="m109 121 48 20v18l-48-19v-19Z" fill="#8463c5"/><path d="m157 141 52-22v18l-52 22v-18Z" fill="#604b9c"/>
      <path d="m133 91 52-19 46 17-52 22-46-20Z" fill={main}/><path d="m133 91 46 20v29l-46-18V91Z" fill="#9170d3"/><path d="m179 111 52-22v29l-52 22v-29Z" fill="#7054b4"/>
      <path d="m157 61 52-19 45 17-52 22-45-20Z" fill={main}/><path d="m157 61 45 20v29l-45-18V61Z" fill="#a282e6"/><path d="m202 81 52-22v29l-52 22V81Z" fill="#8560c6"/>
      <path d="m210 17 4 10 11 3-11 4-4 11-4-11-11-4 11-3 4-10Z" fill={extra}/><circle cx="82" cy="85" r="16" stroke={extra} strokeOpacity=".55" strokeWidth="2"/><circle cx="82" cy="85" r="6" fill={accent}/>
    </>}
    {id==='listen-first'&&<>
      <circle cx="160" cy="94" r="66" stroke={light} strokeOpacity=".14"/><circle cx="160" cy="94" r="51" stroke={light} strokeOpacity=".17"/>
      <path d="M105 111V82c0-36 24-57 55-57s55 21 55 57v29" stroke="#263746" strokeWidth="19" strokeLinecap="round"/>
      <path d="M106 99V80c0-33 23-54 54-54s54 21 54 54v19" stroke={main} strokeWidth="13" strokeLinecap="round"/>
      <rect x="90" y="88" width="30" height="57" rx="13" fill={main}/><rect x="201" y="88" width="30" height="57" rx="13" fill={main}/><rect x="112" y="97" width="10" height="38" rx="5" fill={dark}/><rect x="198" y="97" width="10" height="38" rx="5" fill={dark}/>
      <path d="M145 99v23M156 84v53M167 92v39M178 102v20" stroke={extra} strokeWidth="5" strokeLinecap="round"/>
      <path d="M245 68q17 18 0 36M256 58q27 28 0 55" stroke={light} strokeOpacity=".55" strokeWidth="3" strokeLinecap="round"/><circle cx="67" cy="64" r="9" fill={extra} fillOpacity=".7"/>
    </>}
    {id==='one-idea'&&<>
      <rect x="72" y="81" width="51" height="64" rx="10" fill={accent} transform="rotate(-13 72 81)"/><path d="m84 99 25-6m-21 19 19-4" stroke="#f4eaff" strokeOpacity=".8" strokeWidth="3" strokeLinecap="round"/>
      <path d="M162 25c-32 0-51 22-51 48 0 16 8 28 18 39 7 8 10 12 10 22h47c0-10 4-15 12-23 10-11 16-24 16-39 0-27-21-47-52-47Z" fill={main}/>
      <path d="M146 114V85l-9-12m40 41V85l10-12m-40 13h28" stroke="#623c6c" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M139 135h47M143 145h39" stroke={extra} strokeWidth="8" strokeLinecap="round"/><path d="M151 155h21" stroke={extra} strokeWidth="6" strokeLinecap="round"/>
      <path d="m96 33-9-9m76-12V3m64 38 10-10m-6 45 14-2M90 69l-14-3" stroke={extra} strokeWidth="3" strokeLinecap="round"/>
      <path d="m246 120 3 9 9 3-9 3-3 9-3-9-9-3 9-3 3-9Z" fill={light}/>
    </>}
    {id==='take-pause'&&<>
      <path d="M196 26c-15 0-32 12-40 27-12 27-2 61 26 73 14 6 27 7 41 2-13 18-40 29-61 24-34-7-56-40-50-73 8-39 44-58 84-53Z" fill={main}/>
      <path d="M61 132c35-23 60 17 95 0s68-16 99 1" stroke={extra} strokeWidth="6" strokeLinecap="round"/><path d="M78 152c28-14 53 12 80 0s56-12 80 0" stroke={dark} strokeWidth="4" strokeLinecap="round" opacity=".75"/>
      <path d="m215 44 4 12 13 4-13 4-4 12-4-12-13-4 13-4 4-12Z" fill={extra}/><path d="m250 88 2 7 8 3-8 2-2 8-3-8-7-2 7-3 3-7Z" fill={light}/><circle cx="86" cy="71" r="4" fill={extra}/>
    </>}
  </svg>;
}

export function ChallengeJourneyIllustration(){
  const uid=useId().replace(/[^a-zA-Z0-9_-]/g,'');
  return <svg viewBox="0 0 220 190" fill="none" aria-hidden="true" focusable="false"><defs><linearGradient id={uid} x1="30" y1="30" x2="200" y2="170" gradientUnits="userSpaceOnUse"><stop stopColor="#ceb9ff"/><stop offset="1" stopColor="#8564d4"/></linearGradient></defs><circle cx="111" cy="98" r="78" stroke="#b9a1ff" strokeOpacity=".18"/><circle cx="111" cy="98" r="58" stroke="#b9a1ff" strokeOpacity=".13"/><path d="M32 144c56-9 21-83 72-80 42 2 24 71 77 64" stroke="#d6fc8a" strokeOpacity=".65" strokeWidth="3" strokeDasharray="5 9"/><rect x="42" y="112" width="54" height="54" rx="18" fill={`url(#${uid})`} transform="rotate(-12 42 112)"/><path d="m58 134 9 9 17-20" stroke="#eee5ff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/><rect x="119" y="31" width="65" height="65" rx="21" fill={`url(#${uid})`} transform="rotate(13 119 31)"/><circle cx="147" cy="70" r="15" stroke="#f4eaff" strokeOpacity=".75" strokeWidth="2"/><path d="m143 59 15 4-7 16-15-5 7-15Z" fill="#d6fc8a"/><circle cx="172" cy="136" r="16" fill="#d6fc8a"/><path d="m171 124 3 8 8 3-8 3-3 8-3-8-8-3 8-3 3-8Z" fill="#425e36"/><path d="m54 35 3 9 9 3-9 3-3 9-3-9-9-3 9-3 3-9Z" fill="#ffbdde"/></svg>;
}
