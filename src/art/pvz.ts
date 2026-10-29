import { svg, line, shade, vgrad, eye, shadow, shine, INK } from './util';

const leaves = (cx: number, y: number) => `
  <path d="M${cx} ${y} C${cx - 32} ${y - 30} ${cx - 72} ${y - 20} ${cx - 86} ${y - 4} C${cx - 62} ${y + 10} ${cx - 22} ${y + 12} ${cx} ${y}Z" fill="url(#lf)" ${line(3.5)}/>
  <path d="M${cx} ${y} C${cx + 32} ${y - 32} ${cx + 76} ${y - 24} ${cx + 90} ${y - 10} C${cx + 68} ${y + 8} ${cx + 28} ${y + 12} ${cx} ${y}Z" fill="url(#lf)" ${line(3.5)}/>
  <path d="M${cx - 6} ${y - 2} Q${cx - 44} ${y - 12} ${cx - 76} ${y - 6} M${cx + 6} ${y - 2} Q${cx + 46} ${y - 14} ${cx + 80} ${y - 10}" fill="none" stroke="#2e6b22" stroke-width="2.5" opacity=".6"/>`;

export function peashooter() {
  return svg('0 0 220 240', `
    <defs>${shade('h', '#c4f27e', '#4b9c2c')}${vgrad('sn', '#b4ea72', '#4f9e30')}${vgrad('lf', '#8fd456', '#3a8a28')}</defs>
    ${shadow(96, 234, 70)}
    <path d="M90 136 C84 176 98 206 92 230" fill="none" stroke="${INK}" stroke-width="15" stroke-linecap="round"/>
    <path d="M90 136 C84 176 98 206 92 230" fill="none" stroke="#4d9a30" stroke-width="9" stroke-linecap="round"/>
    ${leaves(92, 228)}
    <path d="M42 80 C8 58 2 98 18 118 C24 102 34 96 46 100Z" fill="url(#lf)" ${line(3.5)}/>
    <path d="M40 100 C14 104 12 136 30 146 C30 130 38 120 50 118Z" fill="url(#lf)" ${line(3.5)}/>
    <path d="M118 54 L176 46 C190 46 194 96 182 100 L118 108Z" fill="url(#sn)" ${line(4)}/>
    <circle cx="84" cy="82" r="52" fill="url(#h)" ${line(4)}/>
    <path d="M118 56 L176 48 L178 60 L120 68Z" fill="#fff" opacity=".25"/>
    <ellipse cx="184" cy="73" rx="13" ry="27" fill="#3c7f26" ${line(4)}/>
    <ellipse cx="186" cy="73" rx="7" ry="17" fill="#1b3f12"/>
    ${shine(64, 50, 20, 10)}
    ${eye(94, 62, 11)}${eye(122, 58, 9.5)}`);
}

export function sunflower(happy = true) {
  const petals = Array.from({ length: 16 }, (_, i) =>
    `<ellipse cx="110" cy="40" rx="15" ry="32" fill="url(#p)" stroke="#c98500" stroke-width="2.5" transform="rotate(${i * 22.5} 110 100)"/>`).join('');
  return svg('0 0 220 270', `
    <defs>${vgrad('p', '#fff07a', '#f5b400')}${shade('f', '#ffc24a', '#d96a0e')}${vgrad('lf', '#8fd456', '#3a8a28')}</defs>
    ${shadow(110, 264, 70)}
    <path d="M110 150 C104 200 116 230 110 262" fill="none" stroke="${INK}" stroke-width="15" stroke-linecap="round"/>
    <path d="M110 150 C104 200 116 230 110 262" fill="none" stroke="#4d9a30" stroke-width="9" stroke-linecap="round"/>
    ${leaves(110, 258)}
    ${petals}
    <circle cx="110" cy="100" r="48" fill="url(#f)" ${line(4)}/>
    ${shine(92, 76, 16, 8)}
    ${eye(92, 92, 8)}${eye(128, 92, 8)}
    <circle cx="80" cy="112" r="8" fill="#ff7b5c" opacity=".55"/><circle cx="140" cy="112" r="8" fill="#ff7b5c" opacity=".55"/>
    ${happy
      ? `<path d="M88 110 Q110 140 132 110 Q110 120 88 110Z" fill="#5a2a10" ${line(3)}/><path d="M100 124 Q110 132 120 124Z" fill="#ff8a7a"/>`
      : '<path d="M92 124 Q110 112 128 124" fill="none" stroke="#5a2a10" stroke-width="4" stroke-linecap="round"/>'}`);
}

export function wallnut() {
  return svg('0 0 180 210', `
    <defs>${shade('n', '#e8b874', '#8f571f')}</defs>
    ${shadow(90, 202, 66)}
    <path d="M90 10 C142 10 170 52 168 108 C166 164 134 196 90 196 C46 196 14 164 12 108 C10 52 38 10 90 10Z" fill="url(#n)" ${line(4)}/>
    <path d="M40 46 Q52 60 44 78 M140 60 Q126 76 136 96 M60 150 Q74 160 70 176 M128 140 Q120 156 132 168 M86 24 Q92 36 84 44" fill="none" stroke="#6b3d12" stroke-width="3" opacity=".6"/>
    ${shine(60, 44, 20, 10)}
    <ellipse cx="68" cy="96" rx="15" ry="19" fill="#fff" ${line(3)}/><circle cx="74" cy="100" r="7" fill="#111"/><circle cx="72" cy="96" r="2.5" fill="#fff"/>
    <ellipse cx="114" cy="96" rx="15" ry="19" fill="#fff" ${line(3)}/><circle cx="120" cy="100" r="7" fill="#111"/><circle cx="118" cy="96" r="2.5" fill="#fff"/>
    <path d="M52 74 Q66 66 80 72 M100 72 Q114 66 128 74" fill="none" ${line(4)}/>
    <path d="M76 140 Q92 132 108 140" fill="none" ${line(4)}/>`);
}

export function zombie(cone = false) {
  return svg('0 0 200 300', `
    <defs>${shade('sk', '#c3d9b2', '#7f9d70')}${vgrad('ct', '#8a6446', '#5a3d27')}${vgrad('pt', '#6f5b4b', '#4a3a2e')}${vgrad('cn', '#ffa94d', '#f06d06')}</defs>
    ${shadow(112, 292, 58)}
    <path d="M92 222 L86 284 L104 284 L108 230Z" fill="url(#pt)" ${line(4)}/>
    <path d="M118 226 L126 280 L144 278 L136 222Z" fill="url(#pt)" ${line(4)}/>
    <path d="M70 286 Q86 274 106 284 L106 292 L70 292Z" fill="#2a2a2a" ${line(3)}/>
    <path d="M122 282 Q140 270 158 280 L158 288 L122 288Z" fill="#2a2a2a" ${line(3)}/>
    <path d="M78 128 Q110 116 142 128 L150 232 Q112 244 76 232Z" fill="url(#ct)" ${line(4)}/>
    <path d="M100 128 L112 168 L124 128Z" fill="#f2f2f2" ${line(3)}/>
    <path d="M110 136 L104 176 L112 188 L120 176 L114 136Z" fill="#c62828" ${line(2.5)}/>
    <path d="M100 128 L94 178 L110 168Z M124 128 L132 178 L114 168Z" fill="#6e4f36" ${line(3)}/>
    <path d="M84 142 L22 136 L18 152 L84 160Z" fill="url(#ct)" ${line(4)}/>
    <path d="M86 168 L28 166 L26 182 L86 186Z" fill="url(#ct)" ${line(4)}/>
    <path d="M22 136 L16 140 L20 146 L16 152 L22 152Z M28 166 L22 170 L26 175 L22 182 L28 182Z" fill="#eee" ${line(2)}/>
    <ellipse cx="10" cy="144" rx="12" ry="9" fill="url(#sk)" ${line(3.5)}/>
    <ellipse cx="16" cy="174" rx="12" ry="9" fill="url(#sk)" ${line(3.5)}/>
    <path d="M110 22 C148 22 160 52 158 82 C156 112 138 130 110 130 C82 130 64 112 62 82 C60 52 72 22 110 22Z" fill="url(#sk)" ${line(4)}/>
    ${cone
      ? `<g transform="rotate(-8 112 30)">
           <path d="M72 44 L108 0 L116 0 L152 40 Q112 58 72 44Z" fill="url(#cn)" ${line(4)}/>
           <path d="M88 26 Q112 34 136 24 M98 13 Q112 18 126 12" fill="none" stroke="#fff" stroke-width="6"/>
           <path d="M62 44 Q112 62 160 40 L162 50 Q112 72 60 54Z" fill="#e8590c" ${line(3)}/></g>`
      : `<path d="M86 30 Q92 10 104 26 Q108 6 118 24 Q128 8 132 30" fill="none" ${line(4)}/>`}
    ${shine(90, 50, 14, 7)}
    <circle cx="94" cy="72" r="16" fill="#fff" ${line(3)}/><circle cx="88" cy="74" r="5" fill="#111"/>
    <circle cx="130" cy="74" r="10" fill="#fff" ${line(3)}/><circle cx="126" cy="76" r="3.5" fill="#111"/>
    <path d="M119 68 Q130 62 141 70" fill="#9bb88a" ${line(3)}/>
    <path d="M84 108 L92 102 L98 110 L106 102 L114 110 L122 102 L130 108 Q108 122 84 108Z" fill="#4a2a2a" ${line(3)}/>
    <rect x="99" y="104" width="7" height="7" fill="#f6f0d0" stroke="${INK}" stroke-width="1.5"/>
    <circle cx="80" cy="96" r="1.5" fill="#5b6b50"/><circle cx="140" cy="98" r="1.5" fill="#5b6b50"/><circle cx="136" cy="104" r="1.5" fill="#5b6b50"/>`);
}

export function pea() {
  return svg('0 0 40 40', `<defs>${shade('p', '#c4f27e', '#4b9c2c')}</defs>
    <circle cx="20" cy="20" r="17" fill="url(#p)" ${line(2)}/>${shine(14, 13, 6, 3)}`);
}

export function sunToken() {
  return svg('0 0 120 120', `
    <defs><radialGradient id="g"><stop offset="0" stop-color="#fff9c4"/><stop offset=".55" stop-color="#ffe14d"/><stop offset="1" stop-color="#ffe14d" stop-opacity="0"/></radialGradient>
      ${shade('c', '#fffbe0', '#ffc61a', 0.4, 0.35)}</defs>
    <circle cx="60" cy="60" r="58" fill="url(#g)"/>
    ${Array.from({ length: 12 }, (_, i) => `<path d="M60 6 L66 26 L54 26Z" fill="#ffd43b" transform="rotate(${i * 30} 60 60)"/>`).join('')}
    <circle cx="60" cy="60" r="34" fill="url(#c)" stroke="#f4b400" stroke-width="3"/>`);
}

export function flowerPot() {
  return svg('0 0 160 150', `
    <defs>${vgrad('t', '#e98a5a', '#b4532a')}</defs>
    ${shadow(80, 144, 60)}
    <path d="M24 44 L136 44 L120 142 L40 142Z" fill="url(#t)" ${line(4)}/>
    <rect x="12" y="24" width="136" height="28" rx="8" fill="#d9703f" ${line(4)}/>
    <ellipse cx="80" cy="30" rx="60" ry="6" fill="#5a3a22"/>
    <path d="M34 60 L48 136" stroke="#fff" stroke-width="5" opacity=".25"/>`);
}
