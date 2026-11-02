// The original edition's forest critters: Zippy the red panda kit (the hero), Bramble the leafy
// hedgehog, Ember the baby dragon and Lolo the axolotl, and the acorn they hide in.
import { svg, line, cel, ell, eye, eyeWhite, shadow, isBlinking, shut, INK } from './util';

export function hero(mood: 'happy' | 'surprised' = 'happy') {
  const R = '#ec7a3c', RS = '#b9501f', D = '#5a3022', DS = '#3a1d14', WH = '#fff6ea', WHS = '#ead8c0';
  const head = 'M100 40 C152 40 172 74 170 104 C168 138 138 152 100 152 C62 152 32 138 30 104 C28 74 48 40 100 40Z';
  const body = 'M100 128 C66 128 56 168 60 200 C64 230 82 240 100 240 C118 240 136 230 140 200 C144 168 134 128 100 128Z';
  const tail = 'M124 214 C176 222 204 184 196 140 C192 116 176 104 162 110 C152 116 158 128 166 134 C176 160 162 186 124 188Z';
  const rings = `<path d="M168 196 Q182 186 186 170 M178 160 Q192 156 198 146 M160 206 Q174 204 180 196" fill="none" stroke="${RS}" stroke-width="11"/>
    <path d="M160 114 Q170 120 176 132" fill="none" stroke="${RS}" stroke-width="9"/>`;
  const face = mood === 'surprised'
    ? `${eye(76, 100, 12)}${eye(124, 100, 12)}<path d="${ell(100, 132, 7, 9)}" fill="#9b2335" ${line(3)}/>`
    : `${eye(76, 100, 10.5)}${eye(124, 100, 10.5)}
       <path d="M86 124 Q93 131 100 124 Q107 131 114 124" fill="none" ${line(3.5)}/>
       <path d="M93 129 Q100 142 107 129Z" fill="#ff8a95" ${line(2.5)}/>`;
  return svg('0 0 210 256', `
    ${shadow(100, 244, 70, 10)}
    ${cel(tail, R, RS, { off: [-5, -6], inner: rings })}
    ${cel(body, D, DS, { hl: [82, 152, 12, 18] })}
    ${cel(ell(80, 238, 19, 8), D, DS, { off: [-3, -3] })}${cel(ell(120, 238, 19, 8), D, DS, { off: [-3, -3] })}
    ${cel(ell(68, 176, 10, 18, 30), D, DS, { off: [-3, -4] })}${cel(ell(132, 176, 10, 18, -30), D, DS, { off: [-3, -4] })}
    ${cel('M40 76 C30 44 46 26 70 36 C80 42 82 54 78 62Z', R, RS, { off: [-3, -4], inner: `<path d="M46 66 C42 48 50 40 64 44 C70 48 70 54 68 58Z" fill="${WH}"/>` })}
    ${cel('M160 76 C170 44 154 26 130 36 C120 42 118 54 122 62Z', R, RS, { off: [-3, -4], inner: `<path d="M154 66 C158 48 150 40 136 44 C130 48 130 54 132 58Z" fill="${WH}"/>` })}
    ${cel(head, R, RS, { hl: [70, 66, 20, 10], inner: `
      <path d="M58 112 C56 96 66 86 80 90 C92 94 96 108 100 108 C104 108 108 94 120 90 C134 86 144 96 142 112 C150 130 128 148 100 148 C72 148 50 130 58 112Z" fill="${WH}"/>
      <path d="${ell(70, 76, 10, 6, -12)}" fill="${WH}"/><path d="${ell(130, 76, 10, 6, 12)}" fill="${WH}"/>
      <path d="M64 112 Q60 126 70 138 M136 112 Q140 126 130 138" fill="none" stroke="${RS}" stroke-width="5" stroke-linecap="round" opacity=".8"/>` })}
    <path d="M92 112 Q100 106 108 112 Q104 120 100 121 Q96 120 92 112Z" fill="${INK}"/>
    ${face}
    <circle cx="58" cy="122" r="7" fill="#ff7b6b" opacity=".45"/><circle cx="142" cy="122" r="7" fill="#ff7b6b" opacity=".45"/>
    ${cel(ell(100, 202, 18, 22), WH, WHS, { off: [-2, -3], stroke: 0 })}`);
}

/** A hedgehog whose spines are leaves. */
export function leafy() {
  const B = '#c08d5e', BS = '#8c5e36', T = '#f6e2c0', TS = '#dcc096', G = '#7cc84a', GS = '#4a9430';
  const leaf = (x: number, y: number, a: number, s = 1) => `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})">
    ${cel('M0 0 C-16 -20 -12 -50 0 -66 C12 -50 16 -20 0 0Z', G, GS, { off: [-3, -4], stroke: 3.5,
      inner: '<path d="M0 -4 L0 -58" stroke="#3d7d26" stroke-width="2.5" opacity=".6"/>' })}</g>`;
  const spines = [[-80, 1], [-58, 1.05], [-36, 1.1], [-14, 1.1], [8, 1.1], [30, 1.05], [52, 1], [74, 0.9], [96, 0.8]]
    .map(([a, s]) => leaf(132 + Math.sin((a * Math.PI) / 180) * 70, 128 - Math.cos((a * Math.PI) / 180) * 56, a, s)).join('');
  const eyes = isBlinking() ? shut(66, 124, 10) + shut(100, 122, 9) : eye(66, 124, 10) + eye(100, 122, 9);
  return svg('0 0 240 210', `
    ${shadow(122, 198, 100, 10)}
    ${spines}
    ${cel('M44 150 C38 102 80 74 132 74 C190 74 216 112 210 150 C204 184 164 194 128 194 C84 194 50 182 44 150Z', B, BS, { off: [-8, -8] })}
    ${cel(ell(84, 146, 50, 42), T, TS, { off: [-6, -6], hl: [70, 124, 16, 8] })}
    ${cel('M42 136 C28 138 18 146 20 154 C22 162 34 164 48 160Z', T, TS, { off: [-2, -3], stroke: 3.5 })}
    ${cel(ell(20, 150, 8, 7), '#3a2a22', '#1e1410', { off: [-1, -2], stroke: 2.5, hl: [18, 147, 2.5, 2] })}
    ${eyes}
    <circle cx="56" cy="148" r="8" fill="#ff8a7a" opacity=".5"/><circle cx="112" cy="146" r="7" fill="#ff8a7a" opacity=".5"/>
    <path d="M64 160 Q80 174 96 160" fill="none" ${line(3.5)}/>
    ${cel(ell(74, 192, 16, 7), BS, '#6a4524', { off: [-2, -2], stroke: 3 })}${cel(ell(170, 190, 16, 7), BS, '#6a4524', { off: [-2, -2], stroke: 3 })}
    ${leaf(120, 80, 20, 0.55)}`);
}

/** A round baby dragon: little wings, horns, a spade on the tail. */
export function ember() {
  const O = '#f26b5b', OS = '#c4413a', C = '#ffe2a6', CS = '#efc06a', WG = '#ffb36b', WGS = '#e0823a';
  const body = 'M100 124 C68 124 58 164 62 196 C66 228 84 238 100 238 C116 238 134 228 138 196 C142 164 132 124 100 124Z';
  const head = 'M100 34 C146 34 162 64 160 92 C158 122 134 138 100 138 C66 138 42 122 40 92 C38 64 54 34 100 34Z';
  const wing = (o: number) => `M${100 + o * 30} 150 C${100 + o * 64} 110 ${100 + o * 92} 118 ${100 + o * 96} 132
    C${100 + o * 84} 136 ${100 + o * 86} 148 ${100 + o * 78} 156 C${100 + o * 70} 154 ${100 + o * 66} 166 ${100 + o * 56} 170Z`;
  const tail = 'M124 214 C164 220 186 200 184 172';
  return svg('0 0 210 250', `
    ${shadow(100, 242, 72, 10)}
    ${cel(wing(-1), WG, WGS, { off: [-3, -4], stroke: 3.5 })}${cel(wing(1), WG, WGS, { off: [-3, -4], stroke: 3.5 })}
    <path d="${tail}" fill="none" stroke="${INK}" stroke-width="26" stroke-linecap="round"/>
    <path d="${tail}" fill="none" stroke="${O}" stroke-width="18" stroke-linecap="round"/>
    ${cel('M184 150 C200 160 202 178 184 188 C166 178 168 160 184 150Z', OS, '#8e2a24', { off: [-2, -3], stroke: 3.5 })}
    ${cel(body, O, OS, { inner: `<path d="${ell(100, 198, 25, 32)}" fill="${C}"/>
      <path d="M80 178 Q100 184 120 178 M78 196 Q100 202 122 196 M82 214 Q100 220 118 214" fill="none" stroke="${CS}" stroke-width="3"/>` })}
    ${cel(ell(80, 236, 19, 9), O, OS, { off: [-3, -3] })}${cel(ell(120, 236, 19, 9), O, OS, { off: [-3, -3] })}
    ${cel(ell(66, 170, 9, 17, 30), O, OS, { off: [-3, -4] })}${cel(ell(134, 170, 9, 17, -30), O, OS, { off: [-3, -4] })}
    ${cel('M66 52 L56 14 L86 40Z', C, CS, { off: [-2, -3], stroke: 3.5 })}${cel('M134 52 L144 14 L114 40Z', C, CS, { off: [-2, -3], stroke: 3.5 })}
    ${cel(head, O, OS, { hl: [74, 56, 20, 10] })}
    ${cel('M88 36 L94 22 L100 34 L106 22 L112 36Z', OS, '#8e2a24', { off: [-1, -2], stroke: 3 })}
    ${eyeWhite(76, 88, 15, '#3aa65a', 2)}${eyeWhite(124, 88, 15, '#3aa65a', -2)}
    <circle cx="93" cy="104" r="2" fill="${INK}"/><circle cx="107" cy="104" r="2" fill="${INK}"/>
    <path d="M76 114 Q100 132 124 114" fill="none" ${line(3.5)}/>
    <path d="M112 119 l4 7 l3 -8Z" fill="#fff" stroke="${INK}" stroke-width="1.5"/>
    <circle cx="58" cy="108" r="8" fill="#ffb0a0" opacity=".6"/><circle cx="142" cy="108" r="8" fill="#ffb0a0" opacity=".6"/>`);
}

/** An axolotl: wide smile, frilly gills, a finned tail. */
export function splash() {
  const P = '#ffadc9', PS = '#e0729c', GL = '#ff5c9a', GLS = '#c92c6c', BL = '#ffe1ec';
  const head = 'M100 40 C158 40 178 70 174 100 C170 130 142 146 100 146 C58 146 30 130 26 100 C22 70 42 40 100 40Z';
  const gill = (x: number, y: number, a: number) => `<g transform="translate(${x} ${y}) rotate(${a})">
    ${cel('M0 6 C-10 -2 -30 -4 -40 0 C-34 4 -34 8 -40 12 C-30 16 -10 14 0 6Z', GL, GLS, { off: [-2, -2], stroke: 3 })}</g>`;
  const gills = [[66, 30], [86, 0], [106, -30]].map(([y, a]) =>
    gill(32, y, a) + `<g transform="translate(200 0) scale(-1 1)">${gill(32, y, a)}</g>`).join('');
  const eyes = isBlinking() ? shut(60, 92, 9) + shut(140, 92, 9) : eye(60, 92, 9) + eye(140, 92, 9);
  return svg('0 0 210 250', `
    ${shadow(100, 242, 72, 10)}
    ${cel('M126 206 C170 214 196 196 198 168 C186 176 178 170 172 178 C162 192 146 192 126 186Z', P, PS, { off: [-3, -4],
      inner: `<path d="M140 196 C164 200 184 190 194 176" fill="none" stroke="${GL}" stroke-width="5" opacity=".6"/>` })}
    ${cel('M100 126 C66 126 58 166 62 198 C66 228 84 238 100 238 C116 238 134 228 138 198 C142 166 134 126 100 126Z', P, PS, {
      inner: `<path d="${ell(100, 198, 24, 30)}" fill="${BL}"/>` })}
    ${cel(ell(80, 236, 18, 9), P, PS, { off: [-3, -3] })}${cel(ell(120, 236, 18, 9), P, PS, { off: [-3, -3] })}
    ${cel(ell(64, 172, 9, 17, 35), P, PS, { off: [-3, -4] })}${cel(ell(136, 172, 9, 17, -35), P, PS, { off: [-3, -4] })}
    ${gills}
    ${cel(head, P, PS, { hl: [74, 60, 22, 10] })}
    ${eyes}
    <path d="M70 112 Q100 134 130 112" fill="none" ${line(4)}/>
    <circle cx="52" cy="114" r="8" fill="#ff6f9a" opacity=".4"/><circle cx="148" cy="114" r="8" fill="#ff6f9a" opacity=".4"/>`);
}

/** The acorn critters hide in (and pop out of). */
export function acorn() {
  const N = '#e0a865', NS = '#b0773a', CAP = '#8a5a32', CAPS = '#5e3a1c';
  return svg('0 0 100 100', `
    ${cel('M22 46 Q22 86 50 96 Q78 86 78 46Z', N, NS, { off: [-6, -5], stroke: 4.5, hl: [36, 62, 6, 14] })}
    ${cel('M10 48 Q8 22 50 18 Q92 22 90 48 Q50 58 10 48Z', CAP, CAPS, { off: [-4, -4], stroke: 4.5,
      inner: '<path d="M22 30 L34 50 M38 22 L50 52 M56 20 L66 52 M74 26 L80 48 M16 42 L84 32" stroke="#4a2c14" stroke-width="2.5" opacity=".5"/>' })}
    ${cel('M46 20 Q44 6 56 2 Q58 10 54 20Z', '#6b4423', '#4a2d15', { off: [-1, -2], stroke: 3 })}`);
}
