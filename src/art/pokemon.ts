import { svg, line, cel, ell, eye, eyeWhite, shadow, isBlinking, shut, INK } from './util';

// Pikachu palette
const Y = '#ffd83a', YS = '#eaa415', BR = '#8a4f1c';

export function pikachu(mood: 'happy' | 'surprised' = 'happy') {
  const earL = 'M58 78 Q30 44 20 2 Q60 22 86 60Z';
  const earR = 'M142 78 Q170 44 180 2 Q140 22 114 60Z';
  const body = 'M100 126 C62 126 52 168 56 200 C60 230 80 240 100 240 C120 240 140 230 144 200 C148 168 138 126 100 126Z';
  const head = 'M100 44 C148 44 166 78 164 108 C162 140 134 154 100 154 C66 154 38 140 36 108 C34 78 52 44 100 44Z';
  const tail = 'M118 196 L150 172 L138 162 L176 132 L162 122 L198 84 L148 110 L160 120 L118 150 L130 160 L106 180Z';
  const tip = (x: number) => `<path d="M${x - 40} -10 L${x + 40} -10 L${x + 30} 30 L${x - 30} 30Z" fill="#2a211b"/>`;
  const face = mood === 'surprised'
    ? `${eye(76, 98, 13)}${eye(124, 98, 13)}<path d="${ell(100, 128, 7, 9)}" fill="#9b2335" ${line(3)}/>`
    : `${eye(76, 98, 11)}${eye(124, 98, 11)}
       <path d="M90 123 Q100 144 110 123Z" fill="#a8283a" ${line(3)}/><path d="M94 132 Q100 140 106 132Z" fill="#ff8a95"/>
       <path d="M85 120 Q92 127 100 120 Q108 127 115 120" fill="none" ${line(3.5)}/>`;
  return svg('0 0 210 256', `
    ${shadow(100, 244, 64, 10)}
    <g transform="translate(14 -14)">${cel(tail, Y, YS, { off: [-5, -6], inner: `<path d="M100 170 L124 150 L136 162 L114 190Z" fill="${BR}"/>` })}</g>
    ${cel(body, Y, YS, { hl: [80, 150, 14, 22], inner: `<path d="M136 168 Q150 172 152 186 Q144 182 136 184Z M134 194 Q148 198 150 210 Q142 206 134 208Z" fill="${BR}"/>` })}
    ${cel(ell(78, 238, 19, 8), Y, YS, { off: [-3, -3] })}${cel(ell(122, 238, 19, 8), Y, YS, { off: [-3, -3] })}
    ${cel(ell(70, 178, 9, 17, 35), Y, YS, { off: [-3, -4] })}${cel(ell(130, 178, 9, 17, -35), Y, YS, { off: [-3, -4] })}
    ${cel(earL, Y, YS, { off: [-4, -5], inner: tip(24) })}
    ${cel(earR, Y, YS, { off: [-4, -5], inner: tip(176) })}
    ${cel(head, Y, YS, { hl: [72, 70, 22, 11] })}
    <path d="${ell(100, 112, 3.5, 2.5)}" fill="${INK}"/>
    ${face}
    ${cel(ell(56, 124, 13, 12), '#f2483c', '#c72d22', { off: [-3, -3], stroke: 3, hl: [52, 119, 4, 3] })}
    ${cel(ell(144, 124, 13, 12), '#f2483c', '#c72d22', { off: [-3, -3], stroke: 3, hl: [140, 119, 4, 3] })}`);
}

export function pokeball() {
  return svg('0 0 100 100', `
    ${cel(ell(50, 50, 45, 45), '#ffffff', '#c9ced6', { off: [-6, -7], stroke: 5 })}
    ${cel('M5 50 A45 45 0 0 1 95 50Z', '#ef3b3b', '#b71c1c', { off: [-5, -5], stroke: 5, hl: [32, 24, 13, 6] })}
    <rect x="5" y="45" width="90" height="10" fill="#222"/>
    ${cel(ell(50, 50, 15, 15), '#ffffff', '#d5d9df', { off: [-3, -3], stroke: 5 })}
    <circle cx="50" cy="50" r="7" fill="#f4f4f4" stroke="#999" stroke-width="2"/>`);
}

export function bulbasaur() {
  const T = '#8ed9bf', TS = '#58aa93', SPOT = '#3d8c76', G = '#79c94f', GS = '#479436';
  const bulb = 'M150 14 C194 18 210 62 200 94 C190 122 158 128 136 120 C110 112 100 84 108 58 C116 34 128 14 150 14Z';
  const body = 'M56 110 C68 84 120 78 168 92 C210 104 218 142 198 162 C178 184 100 186 68 170 C48 158 46 130 56 110Z';
  const head = 'M20 94 C16 56 50 34 86 38 C126 42 144 70 138 102 C132 132 100 144 64 140 C32 136 22 120 20 94Z';
  const leg = (x: number, y: number, h: number) => cel(`M${x} ${y} h30 v${h - 12} q0 12 -12 12 h-6 q-12 0 -12 -12Z`, T, TS, { off: [-4, -4] })
    + [x + 5, x + 13, x + 21].map(cx => `<path d="M${cx} ${y + h} l3 -7 l3 7Z" fill="#fff" stroke="${INK}" stroke-width="1.5"/>`).join('');
  const eyeB = (x: number) => isBlinking() ? shut(x + 14, 92, 15)
    : `<path d="M${x} 90 Q${x + 16} 74 ${x + 32} 88 Q${x + 28} 108 ${x + 14} 108 Q${x} 106 ${x} 90Z" fill="#fff" ${line(3)}/>
       <circle cx="${x + 18}" cy="94" r="9" fill="#c8322d"/><circle cx="${x + 20}" cy="95" r="4" fill="#111"/><circle cx="${x + 15}" cy="90" r="3" fill="#fff"/>`;
  return svg('0 0 240 210', `
    ${shadow(120, 198, 104, 10)}
    ${cel(bulb, G, GS, { off: [-8, -8], hl: [140, 40, 14, 8], inner: `<path d="M150 16 C138 46 138 84 146 122 M150 16 C170 44 184 76 178 114" fill="none" stroke="#2c6a2a" stroke-width="4" opacity=".55"/>` })}
    ${leg(164, 148, 42)}${leg(96, 154, 40)}
    ${cel(body, T, TS, { inner: `<path d="${ell(150, 122, 12, 8)}" fill="${SPOT}"/><path d="${ell(180, 142, 9, 6)}" fill="${SPOT}"/><path d="${ell(124, 104, 8, 5)}" fill="${SPOT}"/>` })}
    ${leg(60, 156, 42)}${leg(132, 160, 38)}
    ${cel('M40 54 L32 26 L62 42Z', T, TS, { off: [-2, -3] })}${cel('M104 44 L118 20 L126 52Z', T, TS, { off: [-2, -3] })}
    ${cel(head, T, TS, { hl: [54, 54, 18, 8], inner: `<path d="${ell(88, 54, 10, 6)}" fill="${SPOT}"/><path d="${ell(40, 70, 7, 5)}" fill="${SPOT}"/><path d="${ell(118, 68, 6, 4)}" fill="${SPOT}"/>` })}
    ${eyeB(38)}${eyeB(90)}
    <circle cx="76" cy="106" r="1.8" fill="${INK}"/><circle cx="84" cy="106" r="1.8" fill="${INK}"/>
    <path d="M44 116 Q80 144 122 116 Q82 128 44 116Z" fill="#c73a4a" ${line(3)}/>
    <path d="M56 119 l4 7 l4 -6 M98 119 l4 7 l4 -7" fill="#fff"/>`);
}

export function charmander() {
  const O = '#f9a043', OS = '#de6e1d', C = '#fde39a', CS = '#eebf5d';
  const body = 'M100 124 C70 124 60 162 64 196 C68 226 84 238 100 238 C116 238 132 226 136 196 C140 162 130 124 100 124Z';
  const head = 'M100 30 C144 30 158 62 156 90 C154 118 132 134 100 134 C68 134 46 118 44 90 C42 62 56 30 100 30Z';
  return svg('0 0 210 250', `
    <defs><radialGradient id="glow"><stop offset="0" stop-color="#ffcf5a" stop-opacity=".7"/><stop offset="1" stop-color="#ffcf5a" stop-opacity="0"/></radialGradient>
      <linearGradient id="fl" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff5a1a"/><stop offset=".5" stop-color="#ffa21a"/><stop offset="1" stop-color="#ffe44d"/></linearGradient></defs>
    ${shadow(100, 242, 70, 10)}
    <path d="M118 208 C172 214 196 178 182 136" fill="none" stroke="${INK}" stroke-width="31" stroke-linecap="round"/>
    <path d="M118 208 C172 214 196 178 182 136" fill="none" stroke="${OS}" stroke-width="22" stroke-linecap="round"/>
    <path d="M114 202 C166 208 188 176 176 138" fill="none" stroke="${O}" stroke-width="13" stroke-linecap="round"/>
    <circle cx="182" cy="108" r="38" fill="url(#glow)"/>
    <path d="M182 134 C158 126 158 100 170 84 C172 98 178 100 180 92 C182 74 192 68 194 58 C204 80 208 100 200 118 C196 128 190 132 182 134Z" fill="url(#fl)" stroke="#d9480f" stroke-width="3"/>
    <path d="M182 128 C172 122 172 108 178 98 C182 108 188 106 190 98 C196 110 192 124 182 128Z" fill="#fffbd0"/>
    ${cel(body, O, OS, { inner: `<path d="${ell(100, 198, 25, 33)}" fill="${C}"/><path d="${ell(108, 206, 20, 28)}" fill="${CS}" opacity=".5"/>` })}
    ${cel(ell(80, 236, 19, 9), O, OS, { off: [-3, -3] })}${cel(ell(120, 236, 19, 9), O, OS, { off: [-3, -3] })}
    ${cel(ell(66, 168, 9, 18, 35), O, OS, { off: [-3, -4] })}${cel(ell(134, 168, 9, 18, -35), O, OS, { off: [-3, -4] })}
    ${cel(head, O, OS, { hl: [74, 52, 20, 10] })}
    ${eyeWhite(76, 84, 15, '#2a6fb8', 2)}${eyeWhite(124, 84, 15, '#2a6fb8', -2)}
    <path d="M61 64 Q76 57 89 64 M111 64 Q124 57 139 64" fill="none" ${line(3.5)}/>
    <circle cx="94" cy="100" r="1.8" fill="${INK}"/><circle cx="106" cy="100" r="1.8" fill="${INK}"/>
    <path d="M70 108 Q100 136 130 108 Q100 118 70 108Z" fill="#b8323a" ${line(3)}/>
    <path d="M78 111 l4 7 l3 -6Z" fill="#fff"/>`);
}

export function squirtle() {
  const B = '#93d6f3', BS = '#55a9d2', SH = '#bd7a3c', SHS = '#8a5124', P = '#f7e6a3', PS = '#e2c374';
  const head = 'M100 34 C146 34 160 66 158 92 C156 120 134 140 100 140 C66 140 44 120 42 92 C40 66 54 34 100 34Z';
  const tail = 'M140 210 C180 216 198 186 180 166 C166 152 144 166 154 180 C160 188 172 184 168 176';
  return svg('0 0 210 250', `
    ${shadow(100, 242, 70, 10)}
    <path d="${tail}" fill="none" stroke="${INK}" stroke-width="24" stroke-linecap="round"/>
    <path d="${tail}" fill="none" stroke="${B}" stroke-width="16" stroke-linecap="round"/>
    <path d="${tail}" fill="none" stroke="${BS}" stroke-width="4" stroke-linecap="round" opacity=".6"/>
    ${cel(ell(100, 186, 57, 55), SH, SHS, { off: [-6, -6] })}
    <path d="${ell(100, 186, 48, 47)}" fill="none" stroke="#f4e3a8" stroke-width="9"/>
    ${cel(ell(80, 236, 18, 9), B, BS, { off: [-3, -3] })}${cel(ell(120, 236, 18, 9), B, BS, { off: [-3, -3] })}
    ${cel('M100 140 C76 140 66 164 66 190 C66 218 82 232 100 232 C118 232 134 218 134 190 C134 164 124 140 100 140Z', P, PS, {
      off: [-5, -6], inner: `<path d="M70 172 L130 172 M68 194 L132 194 M74 216 L126 216 M100 142 L100 230" stroke="#c9ad62" stroke-width="3"/>` })}
    ${cel(ell(55, 168, 10, 19, 35), B, BS, { off: [-3, -4] })}${cel(ell(145, 168, 10, 19, -35), B, BS, { off: [-3, -4] })}
    ${cel(head, B, BS, { hl: [74, 56, 20, 10] })}
    ${eyeWhite(76, 88, 16, '#8b2e2e', 2)}${eyeWhite(124, 88, 16, '#8b2e2e', -2)}
    <circle cx="94" cy="106" r="1.8" fill="${INK}"/><circle cx="106" cy="106" r="1.8" fill="${INK}"/>
    <path d="M76 114 Q100 138 124 114" fill="none" ${line(3.5)}/>
    <path d="M86 120 Q100 133 114 120 Q100 127 86 120Z" fill="#c74a5a"/>`);
}
