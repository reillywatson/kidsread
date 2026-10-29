import { svg, line, cel, ell, eyeWhite, shadow, vgrad, INK } from './util';

export type PupId = 'chase' | 'marshall' | 'skye' | 'rubble';
export const PUP_NAMES: PupId[] = ['chase', 'marshall', 'skye', 'rubble'];
export const pupName = (id: PupId) => ({ chase: 'Chase', marshall: 'Marshall', skye: 'Skye', rubble: 'Rubble' })[id];

interface Look {
  fur: string; furS: string; muzzle: string; muzzleS: string; iris: string;
  vest: string; vestS: string; collar: string; tag: string; tagS: string;
}
const LOOK: Record<PupId, Look> = {
  chase: { fur: '#e3b175', furS: '#b07a3f', muzzle: '#f7e6c6', muzzleS: '#dcc39b', iris: '#6b3f1f', vest: '#2f62d9', vestS: '#1d3f96', collar: '#2456c9', tag: '#dfe4ec', tagS: '#aab3c2' },
  marshall: { fur: '#ffffff', furS: '#d7dbe0', muzzle: '#ffffff', muzzleS: '#dfe2e6', iris: '#3c8fd6', vest: '#e53935', vestS: '#a8231f', collar: '#e53935', tag: '#ffd21f', tagS: '#e0a800' },
  skye: { fur: '#f6dcb2', furS: '#d6ad78', muzzle: '#fff4e0', muzzleS: '#ead6b4', iris: '#c2185b', vest: '#f06292', vestS: '#c2185b', collar: '#ec407a', tag: '#f8bbd0', tagS: '#e48aa9' },
  rubble: { fur: '#eebf80', furS: '#c48640', muzzle: '#fff4e0', muzzleS: '#e8cfa4', iris: '#5b3a1e', vest: '#ffc107', vestS: '#d18f00', collar: '#ffb300', tag: '#b0bec5', tagS: '#78909c' },
};

const STAR = (cx: number, cy: number, r: number, fill: string) => {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    return `${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`;
  }).join(' ');
  return `<polygon points="${pts}" fill="${fill}" stroke="${INK}" stroke-width="1.5"/>`;
};

const TAG_SYMBOL: Record<PupId, (x: number, y: number) => string> = {
  chase: (x, y) => STAR(x, y, 11, '#ffd21f'),
  marshall: (x, y) => `<path d="M${x} ${y - 12} Q${x + 12} ${y} ${x + 4} ${y + 12} Q${x + 2} ${y + 4} ${x - 4} ${y + 6} Q${x - 10} ${y - 2} ${x} ${y - 12}Z" fill="#ff7043" stroke="#bf360c" stroke-width="2"/>`,
  skye: (x, y) => `<path d="M${x - 16} ${y} Q${x - 8} ${y - 8} ${x} ${y} Q${x + 8} ${y - 8} ${x + 16} ${y} Q${x + 8} ${y + 8} ${x} ${y + 2} Q${x - 8} ${y + 8} ${x - 16} ${y}Z" fill="#fff" stroke="#ad1457" stroke-width="2"/>`,
  rubble: (x, y) => `<path d="M${x - 8} ${y + 10} L${x + 6} ${y - 6} M${x + 2} ${y - 10} a6 6 0 1 0 8 8" fill="none" stroke="#37474f" stroke-width="5" stroke-linecap="round"/>`,
};

const HEAD = 'M120 44 C176 44 204 86 200 130 C196 176 164 206 120 206 C76 206 44 176 40 130 C36 86 64 44 120 44Z';

const nose = (y: number) => `${cel(`M104 ${y} Q120 ${y - 6} 136 ${y} Q136 ${y + 14} 120 ${y + 18} Q104 ${y + 14} 104 ${y}Z`, '#2a2420', '#111', { off: [-2, -3], stroke: 2.5 })}
  <ellipse cx="114" cy="${y + 3}" rx="5" ry="3" fill="#fff" opacity=".7"/>`;
const mouth = (y: number) => `
  <path d="M120 ${y} L120 ${y + 10} M98 ${y + 12} Q110 ${y + 22} 120 ${y + 12} Q130 ${y + 22} 142 ${y + 12}" fill="none" ${line(3.5)}/>
  <path d="M112 ${y + 18} Q120 ${y + 36} 128 ${y + 18}Z" fill="#ff6f8c" ${line(2.5)}/>`;
const brows = `<path d="M72 98 Q88 90 104 98 M136 98 Q152 90 168 98" fill="none" ${line(4)}/>`;

/** Ears, face and headgear for each pup, in a 240-wide head box. */
function head(id: PupId) {
  const L = LOOK[id];
  const face = (muzzleY = 162) => `${cel(ell(120, muzzleY, 47, 35), L.muzzle, L.muzzleS, { off: [-3, -6], stroke: 3 })}`;
  switch (id) {
    case 'chase': return `
      ${cel('M60 106 L36 14 L106 64Z', '#6b4423', '#4a2d15', { off: [-3, -3], inner: '<path d="M62 92 L48 34 L92 66Z" fill="#d9a46a"/>' })}
      ${cel('M180 106 L204 14 L134 64Z', '#6b4423', '#4a2d15', { off: [-3, -3], inner: '<path d="M178 92 L192 34 L148 66Z" fill="#d9a46a"/>' })}
      ${cel(HEAD, L.fur, L.furS, { off: [-8, -8], inner: '<path d="M30 122 C40 70 80 52 120 52 C160 52 200 70 210 122 C180 104 150 98 120 108 C90 98 60 104 30 122Z" fill="#8b5a2b"/>' })}
      ${face()}${eyeWhite(90, 120, 16, L.iris, 1)}${eyeWhite(150, 120, 16, L.iris, -1)}${brows}${nose(142)}${mouth(158)}
      ${cel('M54 78 C56 24 184 24 186 78Z', '#3a6fe0', '#1d469f', { off: [-6, -6], hl: [92, 44, 20, 8] })}
      ${cel('M50 68 L190 68 L190 84 L50 84Z', '#14347a', '#0c2050', { off: [-2, -2], stroke: 3 })}
      ${cel('M56 84 Q120 108 184 84 L184 78 Q120 100 56 78Z', '#0d2350', '#081633', { off: [0, -2], stroke: 3 })}
      ${cel('M120 28 L135 37 L133 56 L120 65 L107 56 L105 37Z', '#ffd21f', '#e0a800', { off: [-2, -2], stroke: 2.5 })}
      ${STAR(120, 47, 9, '#ffb300')}`;
    case 'marshall': {
      const spots = '<circle cx="62" cy="108" r="5" fill="#222"/><circle cx="66" cy="136" r="7" fill="#222"/><circle cx="176" cy="150" r="6" fill="#222"/><circle cx="166" cy="104" r="5" fill="#222"/><circle cx="74" cy="170" r="4" fill="#222"/>';
      return `
      ${cel('M56 92 C20 100 18 168 44 190 C62 178 70 134 72 102Z', '#fff', '#d7dbe0', { off: [-3, -4], inner: '<circle cx="40" cy="140" r="7" fill="#222"/><circle cx="50" cy="166" r="5" fill="#222"/>' })}
      ${cel('M184 92 C220 100 222 168 196 190 C178 178 170 134 168 102Z', '#fff', '#d7dbe0', { off: [-3, -4], inner: '<circle cx="200" cy="136" r="6" fill="#222"/><circle cx="192" cy="164" r="7" fill="#222"/>' })}
      ${cel(HEAD, L.fur, L.furS, { off: [-8, -8], inner: spots })}
      ${face()}<circle cx="96" cy="176" r="3" fill="#222"/><circle cx="146" cy="172" r="3" fill="#222"/>
      ${eyeWhite(90, 120, 16, L.iris, 1)}${eyeWhite(150, 120, 16, L.iris, -1)}${brows}${nose(142)}${mouth(158)}
      ${cel('M26 88 Q120 68 214 88 Q216 102 200 102 Q120 88 40 102 Q24 102 26 88Z', '#d32f2f', '#9a1b1b', { off: [-3, -3] })}
      ${cel('M58 90 C56 28 184 28 182 90Z', '#ef4b3f', '#b71c1c', { off: [-7, -6], hl: [88, 50, 18, 8], inner: '<path d="M120 30 L120 90" stroke="#8e1515" stroke-width="6"/>' })}
      ${cel('M120 42 L141 55 L137 78 L120 87 L103 78 L99 55Z', '#ffd21f', '#e0a800', { off: [-2, -2], stroke: 3 })}
      <path d="M120 54 Q129 65 120 76 Q111 65 120 54Z" fill="#e53935"/>`;
    }
    case 'skye': {
      const ear = (x: number, o: number) => `M${x} 96 C${x + o * 40} 100 ${x + o * 46} 150 ${x + o * 36} 182 C${x + o * 28} 196 ${x + o * 14} 196 ${x + o * 8} 186
        C${x + o * 2} 196 ${x - o * 10} 192 ${x - o * 10} 180 C${x - o * 20} 176 ${x - o * 18} 160 ${x - o * 10} 150 C${x - o * 20} 140 ${x - o * 14} 120 ${x}  96Z`;
      return `
      ${cel(ear(56, -1), '#d1a06a', '#a7743f', { off: [-3, -4] })}${cel(ear(184, 1), '#d1a06a', '#a7743f', { off: [-3, -4] })}
      ${cel(HEAD, L.fur, L.furS, { off: [-8, -8] })}
      ${face(164)}${eyeWhite(90, 122, 17, L.iris, 1)}${eyeWhite(150, 122, 17, L.iris, -1)}
      <path d="M72 108 l-6 -6 M78 104 l-3 -8 M162 104 l3 -8 M168 108 l6 -6" ${line(3)}/>
      ${nose(144)}${mouth(160)}
      ${cel('M54 92 C52 28 188 28 186 92 Q120 76 54 92Z', '#ff9cbd', '#e0507a', { off: [-7, -6], hl: [92, 50, 18, 8] })}
      ${cel('M54 92 Q46 120 60 134 Q70 110 72 92Z', '#ff9cbd', '#e0507a', { off: [-2, -3], stroke: 3.5 })}
      ${cel('M186 92 Q194 120 180 134 Q170 110 168 92Z', '#ff9cbd', '#e0507a', { off: [-2, -3], stroke: 3.5 })}
      <rect x="98" y="60" width="44" height="10" rx="4" fill="#ad1457"/>
      <circle cx="94" cy="66" r="18" fill="#b3e5fc" stroke="#ad1457" stroke-width="7"/><circle cx="146" cy="66" r="18" fill="#b3e5fc" stroke="#ad1457" stroke-width="7"/>
      <path d="M84 58 Q92 54 98 60 M136 58 Q144 54 150 60" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    }
    case 'rubble': return `
      ${cel('M52 100 Q28 90 32 126 Q46 124 62 114Z', '#a8692f', '#7d4a1d', { off: [-2, -3] })}
      ${cel('M188 100 Q212 90 208 126 Q194 124 178 114Z', '#a8692f', '#7d4a1d', { off: [-2, -3] })}
      ${cel('M120 48 C184 48 212 92 208 138 C204 186 168 210 120 210 C72 210 36 186 32 138 C28 92 56 48 120 48Z', L.fur, L.furS, { off: [-9, -8] })}
      ${cel('M68 160 Q120 144 172 160 Q178 198 120 204 Q62 198 68 160Z', L.muzzle, L.muzzleS, { off: [-3, -6], stroke: 3 })}
      ${eyeWhite(88, 122, 15, L.iris, 1)}${eyeWhite(152, 122, 15, L.iris, -1)}
      <path d="M70 104 Q86 98 102 108 M138 108 Q154 98 170 104" fill="none" ${line(5.5)}/>
      ${nose(142)}
      <path d="M92 172 Q120 198 148 172 Q120 181 92 172Z" fill="#7a2f2f" ${line(3)}/>
      <path d="M100 176 l5 -9 l5 9Z M130 176 l5 -9 l5 9Z" fill="#fff" stroke="${INK}" stroke-width="1.5"/>
      ${cel('M28 86 Q120 66 212 86 Q214 100 198 100 Q120 86 42 100 Q26 100 28 86Z', '#f2a600', '#c98400', { off: [-3, -3] })}
      ${cel('M58 88 C58 24 182 24 182 88Z', '#ffd54f', '#f2a600', { off: [-7, -6], hl: [86, 50, 18, 8] })}
      ${cel('M110 28 L130 28 L130 86 L110 86Z', '#f2a600', '#c98400', { off: [-2, 0], stroke: 3 })}`;
  }
}

function collar(id: PupId, y: number) {
  const L = LOOK[id];
  return `
    ${cel(`M66 ${y} Q120 ${y + 26} 174 ${y} L178 ${y + 18} Q120 ${y + 46} 62 ${y + 18}Z`, L.collar, L.vestS, { off: [-2, -4] })}
    ${cel(ell(120, y + 38, 21, 21), L.tag, L.tagS, { off: [-3, -4], hl: [113, y + 31, 6, 4] })}
    <circle cx="120" cy="${y + 38}" r="15" fill="none" stroke="#fff" stroke-width="2.5" opacity=".7"/>
    ${TAG_SYMBOL[id](120, y + 38)}`;
}

/** Full-body sitting pup in uniform. */
export function pup(id: PupId) {
  const L = LOOK[id];
  const paw = (x: number) => `${cel(ell(x, 318, 20, 11), L.fur, L.furS, { off: [-2, -3] })}
    <path d="M${x - 7} 312 l0 8 M${x} 311 l0 9 M${x + 7} 312 l0 8" stroke="${INK}" stroke-width="2" opacity=".5"/>`;
  return svg('0 0 240 340', `
    ${shadow(120, 330, 92, 10)}
    <path d="M176 296 C214 296 226 262 214 236" fill="none" stroke="${INK}" stroke-width="20" stroke-linecap="round"/>
    <path d="M176 296 C214 296 226 262 214 236" fill="none" stroke="${L.fur}" stroke-width="12" stroke-linecap="round"/>
    ${cel(ell(62, 296, 36, 28), L.fur, L.furS, { off: [-5, -6] })}
    ${cel(ell(178, 296, 36, 28), L.fur, L.furS, { off: [-5, -6] })}
    ${cel('M74 196 C64 236 66 296 82 318 L158 318 C174 296 176 236 166 196Z', L.fur, L.furS, { off: [-8, -6] })}
    ${cel('M70 210 C68 246 72 272 80 288 L160 288 C168 272 172 246 170 210 Q120 232 70 210Z', L.vest, L.vestS, {
      off: [-8, -6], hl: [96, 240, 10, 22],
      inner: `<path d="M80 278 L160 278" stroke="#fff" stroke-width="5" opacity=".5"/><rect x="134" y="244" width="22" height="18" rx="4" fill="${L.vestS}" stroke="${INK}" stroke-width="2"/>` })}
    ${cel('M96 252 L96 312 Q96 320 104 320 L114 320 Q122 320 122 312 L122 252Z', L.fur, L.furS, { off: [-3, -3] })}
    ${cel('M118 252 L118 312 Q118 320 126 320 L136 320 Q144 320 144 312 L144 252Z', L.fur, L.furS, { off: [-3, -3] })}
    ${paw(108)}${paw(132)}
    ${collar(id, 192)}
    <g transform="translate(0 -6)">${head(id)}</g>`);
}

/** Just the head (for avatars and small buttons). */
export function pupHead(id: PupId) {
  return svg('0 0 240 262', `${shadow(120, 256, 70, 8)}${collar(id, 196)}${head(id)}`);
}

export function pawBadge(color = '#1e88e5') {
  return svg('0 0 100 110', `
    ${cel('M50 4 L92 20 L86 68 Q70 94 50 104 Q30 94 14 68 L8 20Z', color, '#0d47a1', { off: [-5, -5], stroke: 3, hl: [32, 24, 12, 5] })}
    <path d="M50 10 L86 24 L81 66 Q67 88 50 97 Q33 88 19 66 L14 24Z" fill="none" stroke="#fff" stroke-width="4"/>
    <ellipse cx="50" cy="64" rx="16" ry="14" fill="#fff"/>
    <ellipse cx="29" cy="44" rx="7" ry="9" fill="#fff"/><ellipse cx="42" cy="32" rx="7" ry="9" fill="#fff"/>
    <ellipse cx="58" cy="32" rx="7" ry="9" fill="#fff"/><ellipse cx="71" cy="44" rx="7" ry="9" fill="#fff"/>`);
}

export function pupTruck(color: string, dark: string) {
  return svg('0 0 220 130', `
    <defs>${vgrad('g', '#e3f6ff', '#9fd4f0')}</defs>
    ${shadow(110, 118, 98, 8)}
    ${cel('M14 64 Q14 44 34 44 L120 44 L140 16 L184 16 Q196 16 200 30 L208 64 L208 92 L14 92Z', color, dark, { off: [-6, -8], hl: [70, 52, 40, 4] })}
    <path d="M146 24 L180 24 Q188 24 190 32 L196 58 L136 58Z" fill="url(#g)" ${line(3)}/>
    <path d="M152 28 L160 28 L150 54 L144 54Z" fill="#fff" opacity=".6"/>
    ${cel('M40 30 L74 30 L74 44 L40 44Z', '#e53935', '#a51b12', { off: [-1, -2], stroke: 2.5 })}
    ${cel('M74 30 L98 30 L98 44 L74 44Z', '#1e88e5', '#0d47a1', { off: [-1, -2], stroke: 2.5 })}
    <rect x="196" y="70" width="14" height="10" rx="3" fill="#ffe082" ${line(2)}/>
    ${[56, 166].map(x => `${cel(ell(x, 94, 21, 21), '#3a3a3a', '#1c1c1c', { off: [-3, -3] })}<circle cx="${x}" cy="94" r="9" fill="#cfd8dc"/>`).join('')}`);
}

export function bone() {
  return svg('0 0 120 60', cel('M30 18 Q30 4 18 6 Q4 8 8 22 Q2 30 8 38 Q4 52 18 54 Q30 56 30 42 L90 42 Q90 56 102 54 Q116 52 112 38 Q118 30 112 22 Q116 8 102 6 Q90 4 90 18Z',
    '#fffaf0', '#e2d2b4', { off: [-3, -4], stroke: 3.5, hl: [60, 24, 24, 3] }));
}
