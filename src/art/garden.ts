// The original edition's garden: Spritz the water flower and its drops, a sunflower, a rolling
// pumpkin and the Munchers (hungry garden pests). The sun, the pot, stems and leaves are shared
// with the family edition's garden.
import { svg, line, cel, ell, eye, shadow, isBlinking, shut, INK } from './util';

const G = '#8bd44a', GS = '#55a02c', GD = '#3b7d22', LEAF = '#79c843', LEAFS = '#4b9330';

export const stem = (x: number, top: number, bottom: number) => `
  <path d="M${x} ${top} C${x - 6} ${top + 40} ${x + 8} ${bottom - 30} ${x} ${bottom}" fill="none" stroke="${INK}" stroke-width="16" stroke-linecap="round"/>
  <path d="M${x} ${top} C${x - 6} ${top + 40} ${x + 8} ${bottom - 30} ${x} ${bottom}" fill="none" stroke="${GS}" stroke-width="10" stroke-linecap="round"/>
  <path d="M${x - 2} ${top} C${x - 8} ${top + 40} ${x + 4} ${bottom - 30} ${x - 2} ${bottom}" fill="none" stroke="${G}" stroke-width="4" stroke-linecap="round"/>`;

export const baseLeaves = (cx: number, y: number) =>
  cel(`M${cx} ${y} C${cx - 30} ${y - 34} ${cx - 76} ${y - 24} ${cx - 92} ${y - 4} C${cx - 64} ${y + 12} ${cx - 22} ${y + 12} ${cx} ${y}Z`, LEAF, LEAFS,
    { off: [-4, -6], inner: `<path d="M${cx - 4} ${y - 2} Q${cx - 44} ${y - 14} ${cx - 82} ${y - 6}" fill="none" stroke="${GD}" stroke-width="3" opacity=".6"/>` })
  + cel(`M${cx} ${y} C${cx + 32} ${y - 36} ${cx + 80} ${y - 28} ${cx + 96} ${y - 10} C${cx + 70} ${y + 8} ${cx + 28} ${y + 12} ${cx} ${y}Z`, LEAF, LEAFS,
    { off: [-4, -6], inner: `<path d="M${cx + 4} ${y - 2} Q${cx + 48} ${y - 16} ${cx + 86} ${y - 12}" fill="none" stroke="${GD}" stroke-width="3" opacity=".6"/>` });

/** Spritz: a blue flower that squirts water drops from its little round mouth. */
export function spritz() {
  const B = '#7fcbff', BS = '#3d8fd6', F = '#fff4c2', FS = '#f1d27a';
  const petal = (i: number) => `<g transform="rotate(${i * 45 + 22} 92 84)">
    ${cel('M92 20 C116 22 120 52 92 60 C64 52 68 22 92 20Z', B, BS, { off: [-3, -5], stroke: 3.5 })}</g>`;
  const eyes = isBlinking() ? shut(80, 74, 8) + shut(104, 74, 8) : eye(80, 74, 8) + eye(104, 74, 8);
  return svg('0 0 230 250', `
    ${shadow(96, 242, 76, 10)}
    ${stem(92, 130, 236)}
    ${baseLeaves(92, 236)}
    ${cel('M88 176 C56 150 30 160 22 176 C42 186 66 186 88 176Z', LEAF, LEAFS, { off: [-3, -4] })}
    ${Array.from({ length: 8 }, (_, i) => petal(i)).join('')}
    ${cel(ell(92, 84, 40, 40), F, FS, { off: [-6, -7], hl: [78, 66, 12, 7] })}
    ${eyes}
    <circle cx="70" cy="94" r="6" fill="#ff8a7a" opacity=".5"/>
    ${cel(ell(118, 96, 12, 11), '#ffd0a0', '#e09a5a', { off: [-2, -2], stroke: 3.5 })}
    <path d="${ell(120, 96, 6, 6)}" fill="#5a2a10"/>
    <path d="M140 84 q8 -6 14 0 M142 106 q8 6 14 0" fill="none" stroke="${BS}" stroke-width="4" stroke-linecap="round"/>`);
}

/** A water drop, flying right (the round end leads). */
export function drop() {
  return svg('0 0 40 40', cel('M3 20 C14 13 20 6 26 6 A14 14 0 0 1 26 34 C20 34 14 27 3 20Z', '#8fd6ff', '#3d8fd6',
    { off: [-3, -4], stroke: 2.5, hl: [26, 14, 5, 3] }));
}

export function sunflower(happy = true) {
  const petal = (i: number, r: number, c: string, cs: string) =>
    `<g transform="rotate(${i * 30 + r} 110 100)">${cel('M110 22 C126 30 126 54 110 66 C94 54 94 30 110 22Z', c, cs, { off: [-3, -4], stroke: 3 })}</g>`;
  const eyes = isBlinking() ? shut(96, 96, 7) + shut(124, 96, 7) : eye(96, 96, 7) + eye(124, 96, 7);
  const seeds = Array.from({ length: 14 }, (_, i) => {
    const a = i * 2.4, r = 10 + i * 2.2;
    return `<circle cx="${(110 + Math.cos(a) * r).toFixed(1)}" cy="${(100 + Math.sin(a) * r).toFixed(1)}" r="2.2" fill="#3e2410" opacity=".45"/>`;
  }).join('');
  return svg('0 0 220 280', `
    ${shadow(110, 272, 74, 10)}
    ${stem(110, 148, 266)}
    ${baseLeaves(110, 264)}
    ${Array.from({ length: 12 }, (_, i) => petal(i, 15, '#f5b81c', '#d98a00')).join('')}
    ${Array.from({ length: 12 }, (_, i) => petal(i, 0, '#ffe04a', '#f2b400')).join('')}
    ${cel(ell(110, 100, 44, 44), '#8a5426', '#5e3414', { off: [-6, -7], hl: [94, 80, 14, 8], inner: seeds })}
    ${eyes}
    <circle cx="86" cy="110" r="7" fill="#ff8a6a" opacity=".55"/><circle cx="134" cy="110" r="7" fill="#ff8a6a" opacity=".55"/>
    ${happy
      ? `<path d="M96 110 Q110 128 124 110" fill="none" ${line(4)}/>`
      : `<path d="M96 120 Q110 108 124 120" fill="none" ${line(4)}/>`}`);
}

/** A round pumpkin with a friendly face (it rolls in Garden Bowling). */
export function pumpkin() {
  const O = '#ff9a2e', OS = '#d2650c';
  const eyes = isBlinking() ? shut(66, 104, 12) + shut(114, 104, 12)
    : `<path d="${ell(66, 104, 12, 15)}" fill="#fff" ${line(3)}/><circle cx="70" cy="107" r="6" fill="#111"/><circle cx="67" cy="103" r="2.2" fill="#fff"/>
       <path d="${ell(114, 104, 12, 15)}" fill="#fff" ${line(3)}/><circle cx="118" cy="107" r="6" fill="#111"/><circle cx="115" cy="103" r="2.2" fill="#fff"/>`;
  return svg('0 0 180 210', `
    ${shadow(90, 202, 74, 9)}
    ${cel(ell(52, 118, 42, 76), OS, '#a84c06', { off: [-6, -6] })}
    ${cel(ell(128, 118, 42, 76), OS, '#a84c06', { off: [-6, -6] })}
    ${cel(ell(90, 116, 56, 82), O, OS, { off: [-8, -8], hl: [70, 66, 14, 22] })}
    ${cel('M84 38 Q80 18 92 8 Q100 12 96 20 Q92 28 96 38Z', '#6b8e23', '#46601a', { off: [-2, -2], stroke: 3.5 })}
    ${cel('M98 26 Q120 6 140 22 Q124 22 112 34Z', LEAF, LEAFS, { off: [-2, -3], stroke: 3 })}
    ${eyes}
    <circle cx="48" cy="136" r="9" fill="#ff5e3a" opacity=".45"/><circle cx="132" cy="136" r="9" fill="#ff5e3a" opacity=".45"/>
    <path d="M66 140 Q90 162 114 140" fill="none" ${line(4.5)}/>`);
}

/** Bumpy outline around (cx, cy): a fuzzy body. */
function fuzz(cx: number, cy: number, rx: number, ry: number, bumps: number) {
  return Array.from({ length: bumps }, (_, i) => {
    const a = (Math.PI * 2 * i) / bumps - Math.PI / 2, b = a + Math.PI / bumps, c = a + (Math.PI * 2) / bumps;
    const p = (ang: number, k: number) => `${(cx + Math.cos(ang) * rx * k).toFixed(1)} ${(cy + Math.sin(ang) * ry * k).toFixed(1)}`;
    return `${i ? 'L' : 'M'}${p(a, 1)} Q${p(b, 1.09)} ${p(c, 1)}`;
  }).join(' ') + 'Z';
}

/** A Muncher: a fuzzy, hungry garden pest with big teeth. The big one wears a bobble hat. */
export function muncher(big = false) {
  const T = '#4fb3a9', TS = '#2f8079', BL = '#c4efe7', BLS = '#94d4c8';
  const eyes = isBlinking() ? shut(84, 96, 16) + shut(124, 100, 11)
    : `<circle cx="84" cy="96" r="18" fill="#fff" ${line(3)}/><circle cx="78" cy="99" r="7" fill="#111"/><circle cx="75" cy="95" r="2.5" fill="#fff"/>
       <circle cx="124" cy="100" r="12" fill="#fff" ${line(3)}/><circle cx="119" cy="102" r="5" fill="#111"/>`;
  const hat = big
    ? `${cel('M54 70 Q56 18 104 14 Q152 18 154 70 Q104 58 54 70Z', '#ff8a3d', '#d4590c', { off: [-5, -4],
        inner: '<path d="M56 50 Q104 38 152 50 M60 34 Q104 22 148 34" stroke="#fff" stroke-width="8" fill="none"/>' })}
       ${cel('M48 66 Q104 52 160 66 L160 80 Q104 68 48 80Z', '#ffd54f', '#e0a800', { off: [-2, -3], stroke: 3.5 })}
       ${cel(ell(104, 10, 16, 16), '#fff', '#d8dde3', { off: [-3, -3], stroke: 3.5 })}`
    : `<path d="M86 52 Q80 22 64 14 M122 52 Q130 22 146 16" fill="none" ${line(5)}/>
       <path d="M86 52 Q80 22 64 14 M122 52 Q130 22 146 16" fill="none" stroke="${TS}" stroke-width="2.5"/>
       ${cel(ell(62, 12, 9, 9), '#ffd54f', '#e0a800', { off: [-2, -2], stroke: 3 })}${cel(ell(148, 14, 9, 9), '#ffd54f', '#e0a800', { off: [-2, -2], stroke: 3 })}`;
  return svg('-10 -40 210 340', `
    ${shadow(104, 292, 64, 9)}
    ${cel('M80 250 L76 282 L98 282 L100 250Z', TS, '#1f5a54', { off: [-3, -3] })}
    ${cel('M112 250 L116 282 L138 282 L132 250Z', TS, '#1f5a54', { off: [-3, -3] })}
    ${cel(ell(82, 286, 20, 8), '#2f8079', '#1f5a54', { off: [-2, -2], stroke: 3 })}${cel(ell(122, 286, 20, 8), '#2f8079', '#1f5a54', { off: [-2, -2], stroke: 3 })}
    ${cel(fuzz(104, 150, 74, 112, 26), T, TS, { off: [-10, -10], hl: [76, 84, 18, 10],
      inner: `<path d="${ell(110, 196, 46, 52)}" fill="${BL}"/><path d="${ell(118, 204, 40, 46)}" fill="${BLS}" opacity=".5"/>` })}
    ${cel('M44 156 C20 150 4 156 -2 164 C8 172 26 172 46 170Z', T, TS, { off: [-2, -3], stroke: 3.5 })}
    ${cel('M46 186 C22 184 8 192 4 200 C14 206 32 204 48 198Z', T, TS, { off: [-2, -3], stroke: 3.5 })}
    ${hat}
    ${eyes}
    ${cel('M68 128 Q104 118 140 128 Q136 164 104 168 Q72 164 68 128Z', '#5a1a2a', '#3a0f1a', { off: [0, 0], stroke: 4 })}
    <path d="${ell(104, 156, 18, 8)}" fill="#ff6b8a"/>
    <path d="M92 124 L92 140 Q92 144 96 144 L102 144 L102 122Z M106 122 L106 144 L112 144 Q116 144 116 140 L116 124Z" fill="#fff" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>`);
}

export function sunToken() {
  return svg('0 0 120 120', `
    <defs><radialGradient id="g"><stop offset="0" stop-color="#fff9c4"/><stop offset=".55" stop-color="#ffe14d"/><stop offset="1" stop-color="#ffe14d" stop-opacity="0"/></radialGradient></defs>
    <circle cx="60" cy="60" r="58" fill="url(#g)"/>
    ${Array.from({ length: 12 }, (_, i) => `<path d="M60 6 L66 26 L54 26Z" fill="#ffd43b" transform="rotate(${i * 30} 60 60)"/>`).join('')}
    ${cel(ell(60, 60, 34, 34), '#fff3a6', '#ffc61a', { off: [-6, -7], stroke: 3, hl: [50, 48, 10, 6] })}`);
}

export function flowerPot() {
  return svg('0 0 160 150', `
    ${shadow(80, 144, 62, 8)}
    ${cel('M24 44 L136 44 L120 142 L40 142Z', '#e58553', '#b4532a', { off: [-10, 0], hl: [46, 90, 6, 36] })}
    ${cel('M12 24 L148 24 Q152 24 152 30 L152 48 Q152 54 146 54 L14 54 Q8 54 8 48 L8 30 Q8 24 12 24Z', '#ec8f5c', '#c0602f', { off: [-6, -5] })}
    <path d="${ell(80, 30, 62, 6)}" fill="#5a3a22"/>`);
}
