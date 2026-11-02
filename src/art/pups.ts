// The original edition's rescue pups: Scout the beagle (who leads, and drives the jeep), Biscuit
// the golden retriever (fire truck), Pip the corgi (propeller cap) and Moose the shaggy sheepdog.
// Each wears a bandana in their color. Also the team badge and a bone.
import { svg, line, cel, ell, eye, shadow, vgrad, isBlinking, shut, INK } from './util';

export type PupId = 'lead' | 'fire' | 'fly' | 'dig';
export const PUPS: PupId[] = ['lead', 'fire', 'fly', 'dig'];

interface Look { fur: string; furS: string; muzzle: string; muzzleS: string; ear: string; earS: string; band: string; bandS: string }
const LOOK: Record<PupId, Look> = {
  lead: { fur: '#fbf6ee', furS: '#ddd2c2', muzzle: '#ffffff', muzzleS: '#e6e1da', ear: '#a0612b', earS: '#74401a', band: '#43a047', bandS: '#2e7d32' },
  fire: { fur: '#f3c46e', furS: '#c9913a', muzzle: '#fbe3b4', muzzleS: '#e3bf7c', ear: '#dc9f48', earS: '#a86f26', band: '#e53935', bandS: '#a51b12' },
  fly: { fur: '#f2a04c', furS: '#c46f20', muzzle: '#fff7ec', muzzleS: '#ead6bd', ear: '#f2a04c', earS: '#c46f20', band: '#29b6f6', bandS: '#0277bd' },
  dig: { fur: '#d9dde2', furS: '#a9b0b8', muzzle: '#f6f7f8', muzzleS: '#d8dce0', ear: '#b9c0c8', earS: '#8b939c', band: '#ff9800', bandS: '#c66900' },
};

const HEAD = 'M120 52 C178 52 204 94 202 138 C200 184 166 210 120 210 C74 210 40 184 38 138 C36 94 62 52 120 52Z';

const nose = (y: number) => `${cel(ell(120, y, 15, 11), '#2a2420', '#111', { off: [-2, -3], stroke: 2.5 })}
  <ellipse cx="115" cy="${y - 4}" rx="5" ry="3" fill="#fff" opacity=".7"/>`;
const smile = (y: number) => `
  <path d="M120 ${y} L120 ${y + 8} M104 ${y + 8} Q112 ${y + 16} 120 ${y + 8} Q128 ${y + 16} 136 ${y + 8}" fill="none" ${line(3.5)}/>
  <path d="M114 ${y + 13} Q120 ${y + 30} 128 ${y + 13}Z" fill="#ff6f8c" ${line(2.5)}/>`;

/** Floppy ears, hanging beside the head (drawn before it). */
const floppy = (L: Look, long: boolean) => {
  const e = (o: number) => `M${120 - o * 58} 90 C${120 - o * 94} 96 ${120 - o * 100} ${long ? 168 : 146} ${120 - o * 84} ${long ? 196 : 170}
    C${120 - o * 72} ${long ? 206 : 178} ${120 - o * 58} ${long ? 196 : 168} ${120 - o * 56} ${long ? 172 : 150} C${120 - o * 54} 130 ${120 - o * 52} 106 ${120 - o * 50} 94Z`;
  return cel(e(1), L.ear, L.earS, { off: [-3, -4] }) + cel(e(-1), L.ear, L.earS, { off: [-3, -4] });
};

/** Ears, face and headgear, in a 240-wide head box. */
function head(id: PupId) {
  const L = LOOK[id];
  const muzzle = cel(ell(120, 170, 40, 30), L.muzzle, L.muzzleS, { off: [-3, -5], stroke: 3 });
  const eyes = (y = 130) => eye(96, y, 12) + eye(144, y, 12);
  const cheeks = '<circle cx="74" cy="164" r="9" fill="#ff8a8a" opacity=".4"/><circle cx="166" cy="164" r="9" fill="#ff8a8a" opacity=".4"/>';
  switch (id) {
    case 'lead': return `
      ${floppy(L, true)}
      ${cel(HEAD, L.fur, L.furS, { off: [-8, -8], inner: `
        <path d="M38 132 C40 82 76 54 120 54 C164 54 200 82 202 132 C186 116 160 108 144 112 C136 96 126 92 120 92 C114 92 104 96 96 112 C80 108 54 116 38 132Z" fill="#c98642"/>
        <path d="M112 56 L128 56 L126 110 L114 110Z" fill="${L.fur}"/>` })}
      ${muzzle}${eyes()}${cheeks}${nose(152)}${smile(162)}`;
    case 'fire': return `
      ${floppy(L, false)}
      ${cel(HEAD, L.fur, L.furS, { off: [-8, -8], inner: `<path d="M84 60 Q96 48 108 60 Q118 46 130 60 Q142 48 154 62" fill="none" stroke="${L.furS}" stroke-width="4"/>` })}
      ${muzzle}${eyes()}${cheeks}${nose(152)}${smile(162)}
      ${cel('M98 54 Q104 34 120 40 Q134 30 142 52 Q120 46 98 54Z', L.fur, L.furS, { off: [-2, -3], stroke: 3.5 })}`;
    case 'fly': return `
      ${cel('M56 112 L50 24 L108 70Z', L.ear, L.earS, { off: [-3, -4], inner: '<path d="M64 98 L60 42 L96 72Z" fill="#ffc7b8"/>' })}
      ${cel('M184 112 L190 24 L132 70Z', L.ear, L.earS, { off: [-3, -4], inner: '<path d="M176 98 L180 42 L144 72Z" fill="#ffc7b8"/>' })}
      ${cel(HEAD, L.fur, L.furS, { off: [-8, -8], inner: `<path d="M120 70 C108 90 100 120 98 150 L142 150 C140 120 132 90 120 70Z" fill="${L.muzzle}"/>` })}
      ${muzzle}${eyes()}${cheeks}${nose(152)}${smile(162)}
      ${cel('M78 84 C80 48 160 48 162 84 Q120 74 78 84Z', '#ffd54f', '#e0a800', { off: [-5, -5], hl: [100, 62, 14, 6],
        inner: '<path d="M120 50 L120 82 M96 58 L104 82 M144 58 L136 82" stroke="#e53935" stroke-width="7"/>' })}
      <path d="M120 52 L120 36" ${line(4)}/>
      ${cel('M120 36 Q100 24 84 32 Q100 40 120 36 Q140 48 156 40 Q140 28 120 36Z', '#e53935', '#a51b12', { off: [-1, -2], stroke: 3 })}
      <circle cx="120" cy="36" r="5" fill="#ffd54f" ${line(2.5)}/>`;
    case 'dig': {
      const fringe = 'M40 120 C34 70 76 46 120 46 C164 46 206 70 200 120 L188 112 L180 128 L166 114 L156 132 L144 116 L132 134 L120 118 L108 134 L96 116 L84 132 L74 114 L60 128 L52 112Z';
      const peek = isBlinking() ? shut(96, 138, 10) + shut(144, 138, 10) : eye(96, 140, 10) + eye(144, 140, 10);
      return `
      ${floppy(L, false)}
      ${cel(HEAD, L.fur, L.furS, { off: [-8, -8] })}
      ${muzzle}${peek}${cheeks}
      ${cel(fringe, '#eef0f2', L.furS, { off: [-4, -5], inner: '<path d="M80 70 Q90 96 84 116 M120 60 Q126 90 120 112 M160 70 Q150 96 156 116" fill="none" stroke="#b9c0c8" stroke-width="3"/>' })}
      ${nose(156)}${smile(166)}`;
    }
  }
}

function bandana(id: PupId, y: number) {
  const L = LOOK[id];
  return `
    ${cel(`M64 ${y} Q120 ${y + 18} 176 ${y} L172 ${y + 16} Q120 ${y + 32} 68 ${y + 16}Z`, L.band, L.bandS, { off: [-2, -3], stroke: 3.5 })}
    ${cel(`M84 ${y + 18} Q120 ${y + 30} 156 ${y + 18} L122 ${y + 60} Q118 ${y + 62} 116 ${y + 58}Z`, L.band, L.bandS, { off: [-3, -4], stroke: 3.5,
      inner: [0, 1, 2].map(i => `<circle cx="${106 + i * 14}" cy="${y + 30 + (i % 2) * 8}" r="3.5" fill="#fff" opacity=".85"/>`).join('') })}`;
}

/** Full-body sitting pup. */
export function pup(id: PupId) {
  const L = LOOK[id];
  const paw = (x: number) => `${cel(ell(x, 318, 19, 11), L.fur, L.furS, { off: [-2, -3] })}
    <path d="M${x - 7} 312 l0 8 M${x} 311 l0 9 M${x + 7} 312 l0 8" stroke="${INK}" stroke-width="2" opacity=".5"/>`;
  const back = id === 'lead' ? '#c98642' : id === 'fly' ? L.furS : L.fur;
  return svg('0 0 240 340', `
    ${shadow(120, 330, 92, 10)}
    <path d="M172 300 C206 300 222 270 214 238" fill="none" stroke="${INK}" stroke-width="20" stroke-linecap="round"/>
    <path d="M172 300 C206 300 222 270 214 238" fill="none" stroke="${back}" stroke-width="12" stroke-linecap="round"/>
    ${id === 'lead' ? '<circle cx="214" cy="238" r="6" fill="#fff" stroke="#2a1d14" stroke-width="3"/>' : ''}
    ${cel(ell(64, 296, 36, 28), back, L.furS, { off: [-5, -6] })}
    ${cel(ell(176, 296, 36, 28), back, L.furS, { off: [-5, -6] })}
    ${cel('M76 196 C64 236 66 296 82 318 L158 318 C174 296 176 236 164 196Z', L.fur, L.furS, { off: [-8, -6],
      inner: `<path d="${ell(120, 262, 30, 44)}" fill="${L.muzzle}" opacity=".9"/>` })}
    ${cel('M94 262 Q92 290 96 314 Q106 322 116 314 Q120 290 118 262Z', L.fur, L.furS, { off: [-4, -3] })}
    ${cel('M122 262 Q120 290 124 314 Q134 322 144 314 Q148 290 146 262Z', L.fur, L.furS, { off: [-4, -3] })}
    ${paw(106)}${paw(134)}
    ${bandana(id, 196)}
    <g transform="translate(0 -6)">${head(id)}</g>`);
}

/** Just the head (for avatars and small buttons). */
export function pupHead(id: PupId) {
  return svg('0 0 240 262', `${shadow(120, 256, 70, 8)}${bandana(id, 200)}${head(id)}`);
}

/** The rescue team badge: a gold star with a heart. */
export function badge() {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2, r = i % 2 ? 24 : 48;
    return `${(50 + Math.cos(a) * r).toFixed(1)} ${(58 + Math.sin(a) * r).toFixed(1)}`;
  });
  return svg('0 0 100 110', `
    ${cel(`M${pts.join(' L')}Z`, '#ffd54f', '#e0a000', { off: [-4, -5], stroke: 3.5, hl: [40, 40, 8, 4] })}
    ${cel('M50 76 C30 62 32 46 42 46 C46 46 50 50 50 54 C50 50 54 46 58 46 C68 46 70 62 50 76Z', '#ef5350', '#b71c1c', { off: [-2, -2], stroke: 3 })}`);
}

/** A pup at the wheel: Scout's green jeep has a rescue light, Biscuit's fire truck carries a ladder. */
export function pupTruck(id: PupId) {
  const fire = id === 'fire';
  const [color, dark] = fire ? ['#ef4b3f', '#a51b12'] : ['#4caf50', '#2e7d32'];
  const gear = fire
    ? `<g transform="rotate(-8 20 78)">
        <path d="M18 68 L104 68 M18 82 L104 82" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>
        <path d="M18 68 L104 68 M18 82 L104 82" stroke="#e0e4e8" stroke-width="4" stroke-linecap="round"/>
        ${[30, 46, 62, 78, 94].map(x => `<path d="M${x} 68 L${x} 82" stroke="${INK}" stroke-width="5"/><path d="M${x} 69 L${x} 81" stroke="#e0e4e8" stroke-width="2"/>`).join('')}</g>`
    : `<path d="M40 80 L40 58 L96 58 L96 80" fill="none" ${line(6)}/><path d="M40 80 L40 58 L96 58 L96 80" fill="none" stroke="#9e9e9e" stroke-width="2.5"/>
       ${cel('M58 58 Q58 44 68 44 Q78 44 78 58Z', '#ffb300', '#e08000', { off: [-1, -2], stroke: 3, hl: [64, 50, 3, 2] })}`;
  const wheel = (x: number) => `${cel(ell(x, 124, 21, 21), '#3a3a3a', '#1c1c1c', { off: [-3, -3] })}
    ${cel(ell(x, 124, 10, 10), '#e3e8eb', '#aab4ba', { off: [-1, -2], stroke: 2.5 })}<circle cx="${x}" cy="124" r="3" fill="#78909c"/>`;
  return svg('0 0 240 150', `
    <defs>${vgrad('g', '#e3f6ff', '#9fd4f0')}</defs>
    ${shadow(122, 142, 106, 7)}
    ${gear}
    <g transform="translate(74 6) scale(.46)">${head(id)}</g>
    ${cel('M12 94 Q12 80 26 80 L98 80 L106 96 L188 96 Q222 98 228 116 L230 132 L12 132Z', color, dark, {
      off: [-6, -8], hl: [60, 88, 34, 3],
      inner: `<path d="M12 108 L230 108" stroke="#fff" stroke-width="5" opacity=".45"/>
        <path d="M106 96 L106 132" stroke="${dark}" stroke-width="3"/><path d="M164 100 L164 132" stroke="${dark}" stroke-width="3"/>` })}
    <path d="M154 96 L166 62 L174 62 L164 96Z" fill="url(#g)" opacity=".85" ${line(3)}/>
    <g transform="translate(117 98) scale(.36)">${badge().replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g>
    <path d="${ell(225, 106, 6, 8)}" fill="#ffe082" ${line(2.5)}/>
    <rect x="222" y="124" width="16" height="10" rx="4" fill="#cfd8dc" ${line(2.5)}/>
    <rect x="4" y="122" width="14" height="10" rx="4" fill="#cfd8dc" ${line(2.5)}/>
    ${wheel(56)}${wheel(188)}`);
}

export function bone() {
  return svg('0 0 120 60', cel('M30 18 Q30 4 18 6 Q4 8 8 22 Q2 30 8 38 Q4 52 18 54 Q30 56 30 42 L90 42 Q90 56 102 54 Q116 52 112 38 Q118 30 112 22 Q116 8 102 6 Q90 4 90 18Z',
    '#fffaf0', '#e2d2b4', { off: [-3, -4], stroke: 3.5, hl: [60, 24, 24, 3] }));
}
