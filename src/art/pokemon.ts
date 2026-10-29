import { svg, line, shade, eye, eyeWhite, shadow, shine, INK } from './util';

export function pikachu(mood: 'happy' | 'surprised' = 'happy') {
  const face = mood === 'surprised'
    ? `${eye(76, 96, 13)}${eye(124, 96, 13)}<ellipse cx="100" cy="126" rx="7" ry="9" fill="#9b2335" ${line(2.5)}/>`
    : `${eye(76, 96, 11)}${eye(124, 96, 11)}
       <path d="M92 121 Q100 138 108 121Z" fill="#b8323a" ${line(2.5)}/><path d="M95 128 Q100 134 105 128Z" fill="#ff8a95"/>
       <path d="M86 118 Q93 125 100 118 Q107 125 114 118" fill="none" ${line(3)}/>`;
  return svg('0 0 200 250', `
    <defs>${shade('b', '#fff07a', '#f2bd06')}${shade('c', '#ff7b6b', '#d92d24')}
      <clipPath id="el"><path d="M52 74 Q28 40 22 4 Q58 24 82 58Z"/></clipPath>
      <clipPath id="er"><path d="M148 74 Q172 40 178 4 Q142 24 118 58Z"/></clipPath></defs>
    ${shadow(100, 240, 62)}
    <path d="M124 196 L148 176 L136 166 L174 138 L160 128 L194 92 L148 116 L160 126 L120 154 L132 164 L108 182Z" fill="url(#b)" ${line(4)}/>
    <path d="M108 182 L120 154 L132 164 L116 188Z" fill="#9a5b23"/>
    <path d="M100 128 C64 128 54 168 58 198 C62 228 80 238 100 238 C120 238 138 228 142 198 C146 168 136 128 100 128Z" fill="url(#b)" ${line(4)}/>
    <ellipse cx="78" cy="236" rx="18" ry="8" fill="url(#b)" ${line(4)}/><ellipse cx="122" cy="236" rx="18" ry="8" fill="url(#b)" ${line(4)}/>
    <ellipse cx="72" cy="176" rx="9" ry="16" fill="url(#b)" ${line(4)} transform="rotate(32 72 176)"/>
    <ellipse cx="128" cy="176" rx="9" ry="16" fill="url(#b)" ${line(4)} transform="rotate(-32 128 176)"/>
    <path d="M52 74 Q28 40 22 4 Q58 24 82 58Z" fill="url(#b)" ${line(4)}/>
    <path d="M0 0 L60 0 L46 30 L0 36Z" fill="#26201a" clip-path="url(#el)"/>
    <path d="M148 74 Q172 40 178 4 Q142 24 118 58Z" fill="url(#b)" ${line(4)}/>
    <path d="M200 0 L140 0 L154 30 L200 36Z" fill="#26201a" clip-path="url(#er)"/>
    <path d="M52 74 Q28 40 22 4 Q58 24 82 58Z M148 74 Q172 40 178 4 Q142 24 118 58Z" fill="none" ${line(4)}/>
    <path d="M100 46 C146 46 164 78 162 106 C160 136 134 150 100 150 C66 150 40 136 38 106 C36 78 54 46 100 46Z" fill="url(#b)" ${line(4)}/>
    ${shine(72, 66, 18, 8)}
    <ellipse cx="100" cy="110" rx="3.5" ry="2.5" fill="${INK}"/>
    ${face}
    <circle cx="56" cy="122" r="13" fill="url(#c)"/><circle cx="144" cy="122" r="13" fill="url(#c)"/>`);
}

export function pokeball() {
  return svg('0 0 100 100', `
    <defs>${shade('r', '#ff6b6b', '#c41c1c')}${shade('w', '#ffffff', '#cfd3d8')}</defs>
    <circle cx="50" cy="50" r="45" fill="url(#w)" ${line(5, '#222')}/>
    <path d="M5 50 A45 45 0 0 1 95 50Z" fill="url(#r)" ${line(5, '#222')}/>
    <rect x="5" y="46" width="90" height="8" fill="#222"/>
    ${shine(32, 24, 14, 6, -35)}
    <circle cx="50" cy="50" r="15" fill="#fff" ${line(5, '#222')}/>
    <circle cx="50" cy="50" r="7" fill="#f2f2f2" stroke="#999" stroke-width="2"/>`);
}

export function bulbasaur() {
  return svg('0 0 240 210', `
    <defs>${shade('s', '#a8ecd3', '#4f9f88')}${shade('g', '#9be26f', '#2f7d32', 0.4, 0.25)}</defs>
    ${shadow(120, 198, 100)}
    <path d="M150 16 C192 20 208 62 198 94 C188 120 158 126 136 118 C112 110 102 84 110 58 C118 34 130 16 150 16Z" fill="url(#g)" ${line(4)}/>
    <path d="M150 18 C138 46 138 84 146 118 M150 18 C170 44 182 74 176 110" fill="none" stroke="#2c6a2a" stroke-width="3" opacity=".7"/>
    ${shine(140, 44, 14, 7, -50)}
    <rect x="164" y="148" width="30" height="40" rx="12" fill="url(#s)" ${line(4)}/>
    <rect x="96" y="156" width="30" height="38" rx="12" fill="url(#s)" ${line(4)}/>
    <path d="M58 110 C70 86 120 80 168 92 C208 104 216 140 198 160 C178 182 100 184 70 168 C50 156 48 130 58 110Z" fill="url(#s)" ${line(4)}/>
    <ellipse cx="150" cy="122" rx="12" ry="8" fill="#3d8a75" opacity=".7"/><ellipse cx="178" cy="140" rx="9" ry="6" fill="#3d8a75" opacity=".7"/>
    <rect x="62" y="156" width="32" height="40" rx="12" fill="url(#s)" ${line(4)}/>
    <rect x="132" y="160" width="30" height="36" rx="12" fill="url(#s)" ${line(4)}/>
    ${[68, 78, 88, 138, 148, 158].map(x => `<path d="M${x} 196 l4 -8 l4 8Z" fill="#fff" stroke="${INK}" stroke-width="1.5"/>`).join('')}
    <path d="M40 52 L34 26 L60 42Z" fill="url(#s)" ${line(4)}/><path d="M104 42 L118 20 L124 50Z" fill="url(#s)" ${line(4)}/>
    <path d="M22 94 C18 58 50 36 86 40 C124 44 142 70 136 100 C130 130 100 142 66 138 C34 134 24 118 22 94Z" fill="url(#s)" ${line(4)}/>
    <ellipse cx="88" cy="56" rx="10" ry="6" fill="#3d8a75" opacity=".7"/><ellipse cx="42" cy="70" rx="7" ry="5" fill="#3d8a75" opacity=".7"/>
    ${shine(56, 54, 16, 7, -20)}
    <path d="M38 88 Q54 74 70 86 Q66 104 52 106 Q38 104 38 88Z" fill="#fff" ${line(3)}/>
    <circle cx="58" cy="92" r="9" fill="#c8322d"/><circle cx="60" cy="93" r="4" fill="#111"/><circle cx="55" cy="88" r="3" fill="#fff"/>
    <path d="M90 86 Q106 74 122 88 Q118 106 104 106 Q90 104 90 86Z" fill="#fff" ${line(3)}/>
    <circle cx="108" cy="92" r="9" fill="#c8322d"/><circle cx="110" cy="93" r="4" fill="#111"/><circle cx="105" cy="88" r="3" fill="#fff"/>
    <circle cx="76" cy="104" r="1.8" fill="${INK}"/><circle cx="84" cy="104" r="1.8" fill="${INK}"/>
    <path d="M46 114 Q80 140 120 114 Q82 124 46 114Z" fill="#c73a4a" ${line(3)}/>
    <path d="M58 117 l4 6 l4 -5 M98 117 l4 6 l4 -6" fill="#fff" stroke="none"/>`);
}

export function charmander() {
  return svg('0 0 210 250', `
    <defs>${shade('o', '#ffc06a', '#e2701c')}${shade('f', '#fff59a', '#ff7a1a', 0.5, 0.75)}
      <radialGradient id="glow"><stop offset="0" stop-color="#ffcf5a" stop-opacity=".6"/><stop offset="1" stop-color="#ffcf5a" stop-opacity="0"/></radialGradient></defs>
    ${shadow(100, 242, 66)}
    <path d="M120 206 C170 210 194 176 182 138" fill="none" stroke="${INK}" stroke-width="30" stroke-linecap="round"/>
    <path d="M120 206 C170 210 194 176 182 138" fill="none" stroke="url(#o)" stroke-width="22" stroke-linecap="round"/>
    <circle cx="182" cy="112" r="34" fill="url(#glow)"/>
    <path d="M182 136 C160 128 160 104 172 90 C174 102 180 104 182 96 C184 80 192 74 194 66 C202 84 206 102 198 120 C194 130 190 134 182 136Z" fill="url(#f)" stroke="#d9480f" stroke-width="3"/>
    <path d="M182 130 C174 124 174 112 180 104 C184 112 188 110 190 104 C194 114 192 126 182 130Z" fill="#fffbd0"/>
    <path d="M100 124 C70 124 60 162 64 196 C68 226 84 238 100 238 C116 238 132 226 136 196 C140 162 130 124 100 124Z" fill="url(#o)" ${line(4)}/>
    <ellipse cx="100" cy="198" rx="24" ry="32" fill="#ffe7a3"/>
    <ellipse cx="80" cy="236" rx="18" ry="9" fill="url(#o)" ${line(4)}/><ellipse cx="120" cy="236" rx="18" ry="9" fill="url(#o)" ${line(4)}/>
    <ellipse cx="68" cy="166" rx="9" ry="17" fill="url(#o)" ${line(4)} transform="rotate(35 68 166)"/>
    <ellipse cx="132" cy="166" rx="9" ry="17" fill="url(#o)" ${line(4)} transform="rotate(-35 132 166)"/>
    <path d="M100 30 C144 30 158 62 156 90 C154 118 132 134 100 134 C68 134 46 118 44 90 C42 62 56 30 100 30Z" fill="url(#o)" ${line(4)}/>
    ${shine(76, 50, 18, 8)}
    ${eyeWhite(76, 82, 15, '#2a6fb8', 2)}${eyeWhite(124, 82, 15, '#2a6fb8', -2)}
    <path d="M62 64 Q76 58 88 64 M112 64 Q124 58 138 64" fill="none" ${line(3)}/>
    <circle cx="94" cy="98" r="1.8" fill="${INK}"/><circle cx="106" cy="98" r="1.8" fill="${INK}"/>
    <path d="M70 106 Q100 132 130 106 Q100 116 70 106Z" fill="#b8323a" ${line(3)}/>
    <path d="M78 109 l4 6 l3 -5Z" fill="#fff"/>`);
}

export function squirtle() {
  return svg('0 0 210 250', `
    <defs>${shade('b', '#b4e8fb', '#4fa6cf')}${shade('sh', '#d18a45', '#8a5222')}</defs>
    ${shadow(100, 242, 66)}
    <path d="M140 210 C180 216 196 186 178 168 C164 156 146 168 156 180 C162 188 172 182 168 176" fill="none" stroke="${INK}" stroke-width="22" stroke-linecap="round"/>
    <path d="M140 210 C180 216 196 186 178 168 C164 156 146 168 156 180 C162 188 172 182 168 176" fill="none" stroke="url(#b)" stroke-width="15" stroke-linecap="round"/>
    <ellipse cx="100" cy="186" rx="56" ry="54" fill="url(#sh)" ${line(4)}/>
    <ellipse cx="100" cy="186" rx="48" ry="47" fill="none" stroke="#f4e3a8" stroke-width="8"/>
    <ellipse cx="80" cy="236" rx="17" ry="9" fill="url(#b)" ${line(4)}/><ellipse cx="120" cy="236" rx="17" ry="9" fill="url(#b)" ${line(4)}/>
    <path d="M100 140 C76 140 66 164 66 190 C66 218 82 232 100 232 C118 232 134 218 134 190 C134 164 124 140 100 140Z" fill="#f6e6a3" ${line(4)}/>
    <path d="M70 172 L130 172 M68 194 L132 194 M74 216 L126 216 M100 142 L100 230" stroke="#c9b26a" stroke-width="3"/>
    <ellipse cx="56" cy="168" rx="10" ry="18" fill="url(#b)" ${line(4)} transform="rotate(35 56 168)"/>
    <ellipse cx="144" cy="168" rx="10" ry="18" fill="url(#b)" ${line(4)} transform="rotate(-35 144 168)"/>
    <path d="M100 34 C146 34 160 66 158 92 C156 120 134 140 100 140 C66 140 44 120 42 92 C40 66 54 34 100 34Z" fill="url(#b)" ${line(4)}/>
    ${shine(76, 54, 18, 8)}
    ${eyeWhite(76, 86, 15, '#8b2e2e', 2)}${eyeWhite(124, 86, 15, '#8b2e2e', -2)}
    <circle cx="94" cy="104" r="1.8" fill="${INK}"/><circle cx="106" cy="104" r="1.8" fill="${INK}"/>
    <path d="M76 112 Q100 134 124 112" fill="none" ${line(3.5)}/>
    <path d="M86 118 Q100 130 114 118 Q100 124 86 118Z" fill="#c74a5a"/>`);
}
