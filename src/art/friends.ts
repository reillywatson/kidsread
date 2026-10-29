import { svg, line, cel, ell, eye, shadow, INK } from './util';

export function monster(mouth: 'open' | 'yuck' | 'smile' = 'open') {
  const P = '#a979ff', PS = '#6a3ad1';
  // Fluffy outline: bumps all the way round.
  const bumps = 22;
  const pts = Array.from({ length: bumps }, (_, i) => {
    const a = (Math.PI * 2 * i) / bumps - Math.PI / 2;
    const r1 = 66, r2 = 74;
    const a2 = a + Math.PI / bumps;
    const p = (r: number, ang: number) => `${(70 + Math.cos(ang) * r).toFixed(1)} ${(86 + Math.sin(ang) * r * 1.02).toFixed(1)}`;
    return `${i ? 'L' : 'M'}${p(r1, a)} Q${p(r2 + 6, a2)} ${p(r1, a + (Math.PI * 2) / bumps)}`;
  }).join(' ') + 'Z';
  const m = mouth === 'open'
    ? `<path d="M36 94 Q70 78 104 94 Q102 138 70 140 Q38 138 36 94Z" fill="#5a1a2a" ${line(4)}/>
       <path d="M42 92 l7 12 l7 -13 l7 13 l7 -13 l7 13 l7 -13 l7 12" fill="#fff" stroke="${INK}" stroke-width="1.5"/>
       <path d="${ell(70, 126, 18, 9)}" fill="#ff6b8a"/>`
    : mouth === 'yuck'
      ? `<path d="M40 106 Q50 92 60 106 Q70 120 80 106 Q90 92 102 106" fill="none" ${line(5)}/>
         <path d="M84 110 Q92 134 100 112Z" fill="#ff6b8a" ${line(2.5)}/>`
      : `<path d="M38 96 Q70 138 102 96 Q70 110 38 96Z" fill="#5a1a2a" ${line(4)}/><path d="${ell(70, 113, 13, 5)}" fill="#ff6b8a"/>`;
  return svg('0 0 140 175', `
    ${shadow(70, 168, 58, 8)}
    ${cel('M30 36 L16 2 L50 24Z', '#ffd54f', '#f2a600', { off: [-2, -3], stroke: 3.5 })}
    ${cel('M110 36 L124 2 L90 24Z', '#ffd54f', '#f2a600', { off: [-2, -3], stroke: 3.5 })}
    ${cel(ell(32, 162, 17, 9), PS, '#4a2399', { off: [-2, -2], stroke: 3.5 })}${cel(ell(108, 162, 17, 9), PS, '#4a2399', { off: [-2, -2], stroke: 3.5 })}
    ${cel(pts, P, PS, { off: [-10, -10], hl: [44, 40, 18, 9], inner: `<path d="${ell(70, 134, 32, 16)}" fill="#fff" opacity=".22"/>` })}
    <circle cx="46" cy="60" r="18" fill="#fff" ${line(3)}/>${eye(50, 62, 8.5)}
    <circle cx="94" cy="60" r="18" fill="#fff" ${line(3)}/>${eye(90, 62, 8.5)}
    ${m}`);
}

export function frog() {
  const F = '#7ed957', FS = '#3f9a3a';
  return svg('0 0 140 125', `
    ${shadow(70, 116, 58, 7)}
    ${cel(ell(24, 106, 21, 9), '#4caf50', '#2e7d32', { off: [-2, -3], stroke: 3.5 })}${cel(ell(116, 106, 21, 9), '#4caf50', '#2e7d32', { off: [-2, -3], stroke: 3.5 })}
    ${cel(ell(70, 76, 56, 38), F, FS, { off: [-8, -10], hl: [50, 56, 16, 7], inner: `<path d="${ell(70, 90, 34, 18)}" fill="#dcf7b8" opacity=".85"/>` })}
    ${cel(ell(40, 38, 21, 21), F, FS, { off: [-4, -5] })}${cel(ell(100, 38, 21, 21), F, FS, { off: [-4, -5] })}
    <circle cx="40" cy="36" r="13" fill="#fff"/>${eye(42, 37, 7)}
    <circle cx="100" cy="36" r="13" fill="#fff"/>${eye(98, 37, 7)}
    <path d="M36 72 Q70 96 104 72" fill="none" ${line(4)}/>
    <circle cx="28" cy="72" r="7" fill="#ff8aa0" opacity=".6"/><circle cx="112" cy="72" r="7" fill="#ff8aa0" opacity=".6"/>`);
}

export function lilypad() {
  return svg('0 0 160 80', `
    ${cel('M80 40 L148 24 A70 34 0 1 1 128 14Z', '#6fcf5a', '#2e7d32', { off: [-6, -6], stroke: 3 })}
    <path d="M80 40 L22 34 M80 40 L44 66 M80 40 L112 68 M80 40 L148 52" stroke="#1b5e20" stroke-width="2" opacity=".45"/>
    <circle cx="40" cy="30" r="5" fill="#ff8fb4"/><circle cx="46" cy="27" r="4" fill="#ffc1d6"/>`);
}

export function bubble() {
  return svg('0 0 120 120', `
    <defs><radialGradient id="b" cx=".5" cy=".5" r=".5"><stop offset=".65" stop-color="#e3f6ff" stop-opacity=".12"/><stop offset=".93" stop-color="#9fdcff" stop-opacity=".65"/><stop offset="1" stop-color="#5bb8e8" stop-opacity=".95"/></radialGradient>
      <linearGradient id="r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff9ad5" stop-opacity=".35"/><stop offset=".5" stop-color="#9affea" stop-opacity=".25"/><stop offset="1" stop-color="#ffe59a" stop-opacity=".35"/></linearGradient></defs>
    <circle cx="60" cy="60" r="56" fill="url(#b)" stroke="#7fcdf5" stroke-width="2"/>
    <circle cx="60" cy="60" r="52" fill="url(#r)"/>
    <ellipse cx="38" cy="34" rx="17" ry="9" fill="#fff" opacity=".85" transform="rotate(-35 38 34)"/>
    <circle cx="86" cy="88" r="5" fill="#fff" opacity=".6"/>`);
}

export function star(filled = true) {
  const d = 'M50 5 L62 37 L96 38 L69 59 L79 92 L50 72 L21 92 L31 59 L4 38 L38 37Z';
  return svg('0 0 100 100', filled
    ? cel(d, '#ffe14a', '#f5a300', { off: [-5, -6], stroke: 4.5, hl: [42, 34, 10, 6] })
    : cel(d, '#eeeeee', '#c9c9c9', { off: [-5, -6], stroke: 4.5 }));
}

export function gift() {
  return svg('0 0 120 120', `
    ${shadow(60, 114, 48, 6)}
    ${cel('M14 48 L106 48 L106 104 Q106 110 100 110 L20 110 Q14 110 14 104Z', '#ff6f9c', '#d02c62', { off: [-8, -6], hl: [32, 70, 8, 16] })}
    ${cel('M8 34 L112 34 Q114 34 114 38 L114 52 Q114 56 110 56 L10 56 Q6 56 6 52 L6 38 Q6 34 8 34Z', '#ff8fb4', '#e0507a', { off: [-6, -4] })}
    ${cel('M52 34 L68 34 L68 110 L52 110Z', '#ffe066', '#e0a000', { off: [-3, 0], stroke: 3 })}
    ${cel('M60 34 Q36 0 24 18 Q20 34 60 34 Q100 34 96 18 Q84 0 60 34Z', '#ffe066', '#e0a000', { off: [-3, -4] })}`);
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
