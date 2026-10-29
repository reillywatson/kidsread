import { svg, line, shade, vgrad, eye, shadow, shine, INK } from './util';

export function monster(mouth: 'open' | 'yuck' | 'smile' = 'open') {
  const tufts = Array.from({ length: 14 }, (_, i) => {
    const a = (Math.PI * 2 * i) / 14;
    const x = 70 + Math.cos(a) * 60, y = 82 + Math.sin(a) * 64;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="12" fill="url(#m)"/>`;
  }).join('');
  const m = mouth === 'open'
    ? `<path d="M38 92 Q70 78 102 92 Q100 132 70 134 Q40 132 38 92Z" fill="#5a1a2a" ${line(3.5)}/>
       <path d="M44 90 l7 11 l7 -12 l7 12 l7 -12 l7 12 l7 -12 l7 11" fill="#fff" stroke="${INK}" stroke-width="1.5"/>
       <ellipse cx="70" cy="122" rx="16" ry="8" fill="#ff6b8a"/>`
    : mouth === 'yuck'
      ? `<path d="M42 104 Q52 92 62 104 Q72 116 82 104 Q92 92 100 104" fill="none" ${line(4.5)}/>
         <path d="M84 108 Q92 130 98 110Z" fill="#ff6b8a" ${line(2.5)}/>`
      : `<path d="M40 94 Q70 132 100 94 Q70 106 40 94Z" fill="#5a1a2a" ${line(3.5)}/><ellipse cx="70" cy="110" rx="12" ry="5" fill="#ff6b8a"/>`;
  return svg('0 0 140 170', `
    <defs>${shade('m', '#c9a2ff', '#6b38d6')}</defs>
    ${shadow(70, 164, 56)}
    <path d="M30 34 L18 2 L48 22Z M110 34 L122 2 L92 22Z" fill="#ffca28" ${line(3.5)}/>
    ${tufts}
    <path d="M70 18 C20 18 8 56 10 96 C12 136 34 152 70 152 C106 152 128 136 130 96 C132 56 120 18 70 18Z" fill="url(#m)" ${line(4)}/>
    <ellipse cx="30" cy="160" rx="16" ry="8" fill="#6b38d6" ${line(3.5)}/><ellipse cx="110" cy="160" rx="16" ry="8" fill="#6b38d6" ${line(3.5)}/>
    ${shine(44, 40, 16, 8)}
    <ellipse cx="70" cy="132" rx="30" ry="14" fill="#fff" opacity=".25"/>
    <circle cx="46" cy="58" r="17" fill="#fff" ${line(3)}/>${eye(50, 60, 8)}
    <circle cx="94" cy="58" r="17" fill="#fff" ${line(3)}/>${eye(90, 60, 8)}
    ${m}`);
}

export function frog() {
  return svg('0 0 140 120', `
    <defs>${shade('g', '#9be67a', '#3a9a3a')}</defs>
    ${shadow(70, 112, 56)}
    <ellipse cx="24" cy="104" rx="20" ry="8" fill="#43a047" ${line(3.5)}/><ellipse cx="116" cy="104" rx="20" ry="8" fill="#43a047" ${line(3.5)}/>
    <ellipse cx="70" cy="74" rx="54" ry="36" fill="url(#g)" ${line(4)}/>
    <ellipse cx="70" cy="86" rx="32" ry="18" fill="#d8f5b0" opacity=".8"/>
    <circle cx="40" cy="36" r="20" fill="url(#g)" ${line(4)}/><circle cx="100" cy="36" r="20" fill="url(#g)" ${line(4)}/>
    <circle cx="40" cy="34" r="12" fill="#fff"/>${eye(42, 35, 6.5)}
    <circle cx="100" cy="34" r="12" fill="#fff"/>${eye(98, 35, 6.5)}
    <path d="M38 70 Q70 92 102 70" fill="none" ${line(4)}/>
    <circle cx="30" cy="70" r="6" fill="#ff8aa0" opacity=".6"/><circle cx="110" cy="70" r="6" fill="#ff8aa0" opacity=".6"/>
    ${shine(54, 56, 14, 6)}`);
}

export function lilypad() {
  return svg('0 0 160 80', `
    <defs>${shade('l', '#7ed36a', '#2e7d32', 0.4, 0.3)}</defs>
    <path d="M80 40 L148 24 A70 34 0 1 1 128 14Z" fill="url(#l)" stroke="#1b5e20" stroke-width="3"/>
    <path d="M80 40 L22 34 M80 40 L44 66 M80 40 L112 68 M80 40 L148 52" stroke="#1b5e20" stroke-width="2" opacity=".5"/>`);
}

export function bubble() {
  return svg('0 0 120 120', `
    <defs><radialGradient id="b" cx=".5" cy=".5" r=".5"><stop offset=".7" stop-color="#e3f6ff" stop-opacity=".15"/><stop offset=".95" stop-color="#9fdcff" stop-opacity=".7"/><stop offset="1" stop-color="#5bb8e8" stop-opacity=".9"/></radialGradient></defs>
    <circle cx="60" cy="60" r="56" fill="url(#b)" stroke="#7fcdf5" stroke-width="2"/>
    <ellipse cx="38" cy="34" rx="16" ry="9" fill="#fff" opacity=".8" transform="rotate(-35 38 34)"/>
    <circle cx="84" cy="88" r="5" fill="#fff" opacity=".6"/>`);
}

export function star(filled = true) {
  return svg('0 0 100 100', `
    <defs>${shade('s', filled ? '#fff27a' : '#eeeeee', filled ? '#ffb300' : '#c9c9c9')}</defs>
    <path d="M50 5 L62 37 L96 38 L69 59 L79 92 L50 72 L21 92 L31 59 L4 38 L38 37Z" fill="url(#s)" stroke="${filled ? '#e08e00' : '#aaa'}" stroke-width="5" stroke-linejoin="round"/>
    ${filled ? shine(40, 34, 10, 5) : ''}`);
}

export function gift() {
  return svg('0 0 120 120', `
    <defs>${vgrad('g', '#ff7aa2', '#e0306a')}${vgrad('r', '#ffe066', '#f2a600')}</defs>
    ${shadow(60, 114, 46, 6)}
    <rect x="14" y="48" width="92" height="62" rx="8" fill="url(#g)" ${line(4)}/>
    <rect x="6" y="34" width="108" height="22" rx="6" fill="#ff8fb4" ${line(4)}/>
    <rect x="52" y="34" width="16" height="76" fill="url(#r)" ${line(3)}/>
    <path d="M60 34 Q36 0 24 18 Q20 34 60 34 Q100 34 96 18 Q84 0 60 34Z" fill="url(#r)" ${line(4)}/>
    ${shine(32, 70, 10, 18, 0)}`);
}

export function speaker() {
  return svg('0 0 64 64', `
    <circle cx="32" cy="32" r="30" fill="#42a5f5" stroke="#fff" stroke-width="4"/>
    <path d="M16 26 L24 26 L34 16 L34 48 L24 38 L16 38Z" fill="#fff"/>
    <path d="M40 24 Q46 32 40 40 M44 18 Q54 32 44 46" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`);
}

/** A friendly profile "+" button. */
export function plus() {
  return svg('0 0 100 100', `<circle cx="50" cy="50" r="46" fill="#fff" stroke="#43c35e" stroke-width="6" stroke-dasharray="10 8"/>
    <path d="M50 26 L50 74 M26 50 L74 50" stroke="#43c35e" stroke-width="12" stroke-linecap="round"/>`);
}
