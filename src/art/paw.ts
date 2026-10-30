import { svg, line, cel, ell, shadow, vgrad, isBlinking, shut, INK } from './util';

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

// A little wider than tall, like the show's pups.
const HEAD = 'M120 46 C182 46 210 92 206 136 C202 182 166 208 120 208 C74 208 38 182 34 136 C30 92 58 46 120 46Z';

const nose = (y: number) => `${cel(`M102 ${y} Q120 ${y - 7} 138 ${y} Q138 ${y + 15} 120 ${y + 20} Q102 ${y + 15} 102 ${y}Z`, '#2a2420', '#111', { off: [-2, -3], stroke: 2.5 })}
  <ellipse cx="113" cy="${y + 3}" rx="6" ry="3.5" fill="#fff" opacity=".75"/>`;
const mouth = (y: number) => `
  <path d="M120 ${y} L120 ${y + 9} M100 ${y + 11} Q110 ${y + 21} 120 ${y + 11} Q130 ${y + 21} 140 ${y + 11}" fill="none" ${line(3.5)}/>
  <path d="M112 ${y + 17} Q120 ${y + 35} 128 ${y + 17}Z" fill="#ff6f8c" ${line(2.5)}/>`;

/** Big, glossy cartoon eye: tall oval, mostly iris, two highlights. */
const pupEye = (x: number, y: number, iris: string) => isBlinking() ? shut(x, y + 4, 17) : `
  <ellipse cx="${x}" cy="${y}" rx="19" ry="22" fill="#fff" ${line(3)}/>
  <ellipse cx="${x}" cy="${y + 2}" rx="15" ry="18" fill="${iris}"/>
  <ellipse cx="${x}" cy="${y + 3}" rx="9" ry="11" fill="#141010"/>
  <circle cx="${x - 5}" cy="${y - 6}" r="6" fill="#fff"/>
  <circle cx="${x + 6}" cy="${y + 9}" r="2.5" fill="#fff" opacity=".9"/>`;
const eyes = (L: Look, y = 128) => pupEye(92, y, L.iris) + pupEye(148, y, L.iris);

/** Fluffy cheek tufts poking out past the head outline (drawn before the head). */
const cheeks = (fur: string, furS: string) =>
  cel('M50 140 L26 150 L42 158 L28 170 L48 172 L40 182 L60 178Z', fur, furS, { off: [-2, -2], stroke: 3.5 })
  + cel('M190 140 L214 150 L198 158 L212 170 L192 172 L200 182 L180 178Z', fur, furS, { off: [-2, -2], stroke: 3.5 });

/** Ears, face and headgear for each pup, in a 240-wide head box. */
function head(id: PupId) {
  const L = LOOK[id];
  const muzzle = (y = 168) => cel(ell(120, y, 44, 33), L.muzzle, L.muzzleS, { off: [-3, -6], stroke: 3 });
  switch (id) {
    case 'chase': return `
      ${cel('M60 108 L34 12 L108 64Z', '#6b4423', '#4a2d15', { off: [-3, -3], inner: '<path d="M62 94 L46 32 L94 66Z" fill="#d9a46a"/>' })}
      ${cel('M180 108 L206 12 L132 64Z', '#6b4423', '#4a2d15', { off: [-3, -3], inner: '<path d="M178 94 L194 32 L146 66Z" fill="#d9a46a"/>' })}
      ${cheeks(L.fur, L.furS)}
      ${cel(HEAD, L.fur, L.furS, { off: [-8, -8], inner: `
        <path d="M30 128 C38 72 80 54 120 54 C160 54 202 72 210 128 C186 110 160 104 120 112 C80 104 54 110 30 128Z" fill="#8b5a2b"/>
        <path d="${ell(92, 104, 10, 6, -10)}" fill="#ecc896"/><path d="${ell(148, 104, 10, 6, 10)}" fill="#ecc896"/>` })}
      ${muzzle()}${eyes(L)}${nose(150)}${mouth(166)}
      ${cel('M54 78 C56 24 184 24 186 78Z', '#3a6fe0', '#1d469f', { off: [-6, -6], hl: [92, 44, 20, 8] })}
      ${cel('M50 68 L190 68 L190 84 L50 84Z', '#14347a', '#0c2050', { off: [-2, -2], stroke: 3 })}
      ${cel('M58 84 Q120 102 182 84 L182 78 Q120 96 58 78Z', '#0d2350', '#081633', { off: [0, -2], stroke: 3 })}
      ${cel('M120 28 L135 37 L133 56 L120 65 L107 56 L105 37Z', '#ffd21f', '#e0a800', { off: [-2, -2], stroke: 2.5 })}
      ${STAR(120, 47, 9, '#ffb300')}`;
    case 'marshall': {
      const spots = '<circle cx="60" cy="112" r="5" fill="#222"/><circle cx="62" cy="142" r="7" fill="#222"/><circle cx="180" cy="152" r="6" fill="#222"/><circle cx="172" cy="108" r="5" fill="#222"/><circle cx="72" cy="176" r="4" fill="#222"/>';
      return `
      ${cel('M56 94 C20 102 18 170 44 192 C62 180 70 136 72 104Z', '#fff', '#d7dbe0', { off: [-3, -4], inner: '<circle cx="40" cy="142" r="7" fill="#222"/><circle cx="50" cy="168" r="5" fill="#222"/>' })}
      ${cel('M184 94 C220 102 222 170 196 192 C178 180 170 136 168 104Z', '#fff', '#d7dbe0', { off: [-3, -4], inner: '<circle cx="200" cy="138" r="6" fill="#222"/><circle cx="192" cy="166" r="7" fill="#222"/>' })}
      ${cel(HEAD, L.fur, L.furS, { off: [-8, -8], inner: spots })}
      ${muzzle()}<circle cx="98" cy="182" r="3" fill="#222"/><circle cx="144" cy="178" r="3" fill="#222"/>
      ${eyes(L)}${nose(150)}${mouth(166)}
      ${cel('M26 88 Q120 68 214 88 Q216 102 200 102 Q120 88 40 102 Q24 102 26 88Z', '#d32f2f', '#9a1b1b', { off: [-3, -3] })}
      ${cel('M58 90 C56 28 184 28 182 90Z', '#ef4b3f', '#b71c1c', { off: [-7, -6], hl: [88, 50, 18, 8], inner: '<path d="M120 30 L120 90" stroke="#8e1515" stroke-width="6"/>' })}
      ${cel('M120 42 L141 55 L137 78 L120 87 L103 78 L99 55Z', '#ffd21f', '#e0a800', { off: [-2, -2], stroke: 3 })}
      <path d="M120 54 Q129 65 120 76 Q111 65 120 54Z" fill="#e53935"/>`;
    }
    case 'skye': {
      const ear = (x: number, o: number) => `M${x} 96 C${x + o * 40} 100 ${x + o * 46} 150 ${x + o * 36} 182 C${x + o * 28} 196 ${x + o * 14} 196 ${x + o * 8} 186
        C${x + o * 2} 196 ${x - o * 10} 192 ${x - o * 10} 180 C${x - o * 20} 176 ${x - o * 18} 160 ${x - o * 10} 150 C${x - o * 20} 140 ${x - o * 14} 120 ${x}  96Z`;
      // Lashes sit on the outer top corner of each eye (not floating above it, where they read as brows).
      const lashes = isBlinking() ? '' : `<path d="M77 113 L68 106 M81 108 L75 99 M163 113 L172 106 M159 108 L165 99" ${line(3)}/>`;
      return `
      ${cel(ear(56, -1), '#d1a06a', '#a7743f', { off: [-3, -4] })}${cel(ear(184, 1), '#d1a06a', '#a7743f', { off: [-3, -4] })}
      ${cheeks(L.fur, L.furS)}
      ${cel(HEAD, L.fur, L.furS, { off: [-8, -8] })}
      ${muzzle(170)}${eyes(L, 130)}${lashes}${nose(152)}${mouth(168)}
      ${cel('M54 92 C52 28 188 28 186 92 Q120 76 54 92Z', '#ff9cbd', '#e0507a', { off: [-7, -6], hl: [92, 50, 18, 8] })}
      ${cel('M54 92 Q46 120 60 134 Q70 110 72 92Z', '#ff9cbd', '#e0507a', { off: [-2, -3], stroke: 3.5 })}
      ${cel('M186 92 Q194 120 180 134 Q170 110 168 92Z', '#ff9cbd', '#e0507a', { off: [-2, -3], stroke: 3.5 })}
      <rect x="98" y="60" width="44" height="10" rx="4" fill="#ad1457"/>
      <circle cx="94" cy="66" r="18" fill="#b3e5fc" stroke="#ad1457" stroke-width="7"/><circle cx="146" cy="66" r="18" fill="#b3e5fc" stroke="#ad1457" stroke-width="7"/>
      <path d="M84 58 Q92 54 98 60 M136 58 Q144 54 150 60" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    }
    case 'rubble': return `
      ${cel('M50 100 Q26 90 30 128 Q46 126 62 116Z', '#a8692f', '#7d4a1d', { off: [-2, -3] })}
      ${cel('M190 100 Q214 90 210 128 Q194 126 178 116Z', '#a8692f', '#7d4a1d', { off: [-2, -3] })}
      ${cel('M120 48 C186 48 214 94 210 140 C206 188 168 212 120 212 C72 212 34 188 30 140 C26 94 54 48 120 48Z', L.fur, L.furS, { off: [-9, -8] })}
      ${eyes(L, 130)}
      ${cel('M66 112 Q84 96 108 108 Q98 116 86 114 Q74 114 66 112Z', '#a8692f', '#7d4a1d', { off: [-1, -2], stroke: 2.5 })}
      ${cel('M174 112 Q156 96 132 108 Q142 116 154 114 Q166 114 174 112Z', '#a8692f', '#7d4a1d', { off: [-1, -2], stroke: 2.5 })}
      ${cel('M82 172 Q82 152 104 152 Q120 152 120 166 Q120 152 136 152 Q158 152 158 172 Q158 190 136 190 Q120 190 120 182 Q120 190 104 190 Q82 190 82 172Z', L.muzzle, L.muzzleS, { off: [-3, -5], stroke: 3 })}
      <path d="M98 186 Q120 210 142 186 Q120 194 98 186Z" fill="#7a2f2f" ${line(3)}/>
      <path d="M105 190 l5 -12 l5 12Z M125 190 l5 -12 l5 12Z" fill="#fff" stroke="${INK}" stroke-width="1.5"/>
      <circle cx="102" cy="172" r="2" fill="#7d4a1d"/><circle cx="96" cy="178" r="2" fill="#7d4a1d"/><circle cx="138" cy="172" r="2" fill="#7d4a1d"/><circle cx="144" cy="178" r="2" fill="#7d4a1d"/>
      ${nose(150)}
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
  const paw = (x: number) => `${cel(ell(x, 318, 19, 11), L.fur, L.furS, { off: [-2, -3] })}
    <path d="M${x - 7} 312 l0 8 M${x} 311 l0 9 M${x + 7} 312 l0 8" stroke="${INK}" stroke-width="2" opacity=".5"/>`;
  return svg('0 0 240 340', `
    ${shadow(120, 330, 92, 10)}
    <path d="M176 296 C214 296 226 262 214 236" fill="none" stroke="${INK}" stroke-width="20" stroke-linecap="round"/>
    <path d="M176 296 C214 296 226 262 214 236" fill="none" stroke="${L.fur}" stroke-width="12" stroke-linecap="round"/>
    ${cel(ell(62, 296, 36, 28), L.fur, L.furS, { off: [-5, -6] })}
    ${cel(ell(178, 296, 36, 28), L.fur, L.furS, { off: [-5, -6] })}
    ${cel('M74 196 C64 236 66 296 82 318 L158 318 C174 296 176 236 166 196Z', L.fur, L.furS, { off: [-8, -6] })}
    ${cel('M94 262 Q92 290 96 314 Q106 322 116 314 Q120 290 118 262Z', L.fur, L.furS, { off: [-4, -3] })}
    ${cel('M122 262 Q120 290 124 314 Q134 322 144 314 Q148 290 146 262Z', L.fur, L.furS, { off: [-4, -3] })}
    ${cel('M70 210 C68 246 72 272 80 288 Q120 300 160 288 C168 272 172 246 170 210 Q120 232 70 210Z', L.vest, L.vestS, {
      off: [-8, -6], hl: [96, 240, 10, 22],
      inner: `<path d="M80 278 Q120 290 160 278" stroke="#fff" stroke-width="5" fill="none" opacity=".5"/><rect x="134" y="244" width="22" height="18" rx="4" fill="${L.vestS}" stroke="${INK}" stroke-width="2"/>` })}
    ${paw(106)}${paw(134)}
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

/** A pup's open-top rescue vehicle with the pup at the wheel: Chase's police truck has a light
 *  bar, Marshall's fire truck carries a ladder. */
export function pupTruck(id: PupId) {
  const L = LOOK[id];
  const [color, dark] = id === 'marshall' ? ['#ef4b3f', '#a51b12'] : ['#2f6fe0', '#173e96'];
  const gear = id === 'marshall'
    ? `<g transform="rotate(-8 20 78)">
        <path d="M18 68 L104 68 M18 82 L104 82" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>
        <path d="M18 68 L104 68 M18 82 L104 82" stroke="#e0e4e8" stroke-width="4" stroke-linecap="round"/>
        ${[30, 46, 62, 78, 94].map(x => `<path d="M${x} 68 L${x} 82" stroke="${INK}" stroke-width="5"/><path d="M${x} 69 L${x} 81" stroke="#e0e4e8" stroke-width="2"/>`).join('')}</g>`
    : `${cel('M32 66 Q32 60 38 60 L62 60 L62 80 L32 80Z', '#e53935', '#a51b12', { off: [-1, -2], stroke: 2.5, hl: [42, 65, 5, 2] })}
       ${cel('M62 60 L86 60 Q92 60 92 66 L92 80 L62 80Z', '#1e88e5', '#0d47a1', { off: [-1, -2], stroke: 2.5, hl: [70, 65, 5, 2] })}`;
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
    ${cel(ell(135, 116, 14, 14), L.tag, L.tagS, { off: [-2, -2], stroke: 2.5 })}
    <g transform="translate(135 116) scale(.75) translate(-135 -116)">${TAG_SYMBOL[id](135, 116)}</g>
    <path d="${ell(225, 106, 6, 8)}" fill="#ffe082" ${line(2.5)}/>
    <rect x="222" y="124" width="16" height="10" rx="4" fill="#cfd8dc" ${line(2.5)}/>
    <rect x="4" y="122" width="14" height="10" rx="4" fill="#cfd8dc" ${line(2.5)}/>
    ${wheel(56)}${wheel(188)}`);
}

export function bone() {
  return svg('0 0 120 60', cel('M30 18 Q30 4 18 6 Q4 8 8 22 Q2 30 8 38 Q4 52 18 54 Q30 56 30 42 L90 42 Q90 56 102 54 Q116 52 112 38 Q118 30 112 22 Q116 8 102 6 Q90 4 90 18Z',
    '#fffaf0', '#e2d2b4', { off: [-3, -4], stroke: 3.5, hl: [60, 24, 24, 3] }));
}
