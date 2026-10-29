import { svg, line, shade, vgrad, eyeWhite, shadow, shine, INK } from './util';

export type PupId = 'chase' | 'marshall' | 'skye' | 'rubble';
export const PUP_NAMES: PupId[] = ['chase', 'marshall', 'skye', 'rubble'];
export const pupName = (id: PupId) => ({ chase: 'Chase', marshall: 'Marshall', skye: 'Skye', rubble: 'Rubble' })[id];

const HEAD = 'M120 44 C176 44 204 86 200 130 C196 176 164 206 120 206 C76 206 44 176 40 130 C36 86 64 44 120 44Z';

const nose = (y: number) => `
  <path d="M104 ${y} Q120 ${y - 6} 136 ${y} Q136 ${y + 14} 120 ${y + 18} Q104 ${y + 14} 104 ${y}Z" fill="#1f1a17" ${line(2.5)}/>
  <ellipse cx="114" cy="${y + 3}" rx="5" ry="3" fill="#fff" opacity=".6"/>`;

const mouth = (y: number) => `
  <path d="M120 ${y} L120 ${y + 10} M98 ${y + 12} Q110 ${y + 22} 120 ${y + 12} Q130 ${y + 22} 142 ${y + 12}" fill="none" ${line(3.5)}/>
  <path d="M112 ${y + 18} Q120 ${y + 36} 128 ${y + 18}Z" fill="#ff6f8c" ${line(2.5)}/>`;

function collar(color: string, tag: string, tagColor: string) {
  return `
    <path d="M66 196 Q120 222 174 196 L178 214 Q120 242 62 214Z" fill="${color}" ${line(4)}/>
    <circle cx="120" cy="234" r="20" fill="${tagColor}" ${line(4)}/>
    <circle cx="120" cy="234" r="14" fill="none" stroke="#fff" stroke-width="2.5" opacity=".7"/>
    ${tag}`;
}

const STAR = (cx: number, cy: number, r: number, fill: string) => {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    return `${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`;
  }).join(' ');
  return `<polygon points="${pts}" fill="${fill}" stroke="${INK}" stroke-width="1.5"/>`;
};

function chase() {
  return `
    <defs>${shade('f', '#e8bd80', '#b07a3f')}${vgrad('cap', '#3a6fe0', '#173e96')}</defs>
    <path d="M60 104 L38 16 L104 64Z" fill="#6b4423" ${line(4)}/><path d="M62 90 L48 34 L92 66Z" fill="#d9a46a"/>
    <path d="M180 104 L202 16 L136 64Z" fill="#6b4423" ${line(4)}/><path d="M178 90 L192 34 L148 66Z" fill="#d9a46a"/>
    <path d="${HEAD}" fill="url(#f)" ${line(4)}/>
    <path d="M44 120 C46 76 80 56 120 56 C160 56 194 76 196 120 C176 104 150 98 120 108 C90 98 64 104 44 120Z" fill="#8b5a2b"/>
    <ellipse cx="120" cy="162" rx="48" ry="36" fill="#f5e2c0" ${line(3)}/>
    ${shine(80, 120, 14, 7)}
    ${eyeWhite(90, 120, 16, '#6b3f1f', 1)}${eyeWhite(150, 120, 16, '#6b3f1f', -1)}
    <path d="M72 98 Q88 90 104 98 M136 98 Q152 90 168 98" fill="none" ${line(4)}/>
    ${nose(142)}${mouth(158)}
    <path d="M54 76 C56 26 184 26 186 76Z" fill="url(#cap)" ${line(4)}/>
    <rect x="50" y="68" width="140" height="16" rx="6" fill="#12306f" ${line(3)}/>
    <path d="M56 84 Q120 106 184 84 L184 78 Q120 98 56 78Z" fill="#0d2350" ${line(3)}/>
    <path d="M120 30 L134 38 L132 56 L120 64 L108 56 L106 38Z" fill="#ffd21f" ${line(2.5)}/>
    ${STAR(120, 47, 9, '#ffb300')}
    ${collar('#2456c9', STAR(120, 234, 11, '#ffd21f'), '#d6dbe4')}`;
}

function marshall() {
  return `
    <defs>${shade('f', '#ffffff', '#d9dde2')}${shade('hat', '#ff6b5e', '#b71c1c', 0.4, 0.3)}</defs>
    <path d="M56 92 C20 100 18 168 44 190 C62 178 70 134 72 102Z" fill="#fff" ${line(4)}/>
    <circle cx="40" cy="140" r="7" fill="#222"/><circle cx="50" cy="166" r="5" fill="#222"/>
    <path d="M184 92 C220 100 222 168 196 190 C178 178 170 134 168 102Z" fill="#fff" ${line(4)}/>
    <circle cx="200" cy="136" r="6" fill="#222"/><circle cx="192" cy="164" r="7" fill="#222"/>
    <path d="${HEAD}" fill="url(#f)" ${line(4)}/>
    <circle cx="64" cy="134" r="7" fill="#222"/><circle cx="176" cy="150" r="6" fill="#222"/><circle cx="166" cy="102" r="5" fill="#222"/>
    <circle cx="74" cy="168" r="4" fill="#222"/><circle cx="62" cy="108" r="4" fill="#222"/>
    <ellipse cx="120" cy="162" rx="46" ry="34" fill="#fff" ${line(3)}/>
    <circle cx="96" cy="176" r="3" fill="#222"/><circle cx="146" cy="172" r="3" fill="#222"/>
    ${eyeWhite(90, 120, 16, '#3c8fd6', 1)}${eyeWhite(150, 120, 16, '#3c8fd6', -1)}
    <path d="M72 98 Q88 90 104 98 M136 98 Q152 90 168 98" fill="none" ${line(4)}/>
    ${nose(142)}${mouth(158)}
    <path d="M28 88 Q120 70 212 88 Q214 100 200 100 Q120 86 40 100 Q26 100 28 88Z" fill="#c62828" ${line(4)}/>
    <path d="M58 88 C56 30 184 30 182 88Z" fill="url(#hat)" ${line(4)}/>
    <path d="M120 34 L120 86" stroke="#8e1515" stroke-width="5"/>
    ${shine(88, 52, 16, 7)}
    <path d="M120 44 L140 56 L136 78 L120 86 L104 78 L100 56Z" fill="#ffd21f" ${line(3)}/>
    <path d="M120 56 Q128 66 120 76 Q112 66 120 56Z" fill="#e53935"/>
    ${collar('#e53935', '<path d="M120 222 Q132 234 124 246 Q122 238 116 240 Q110 232 120 222Z" fill="#ff7043" stroke="#bf360c" stroke-width="2"/>', '#ffd21f')}`;
}

function skye() {
  const scallop = (dir: number) => {
    const x = dir < 0 ? 56 : 184;
    const o = dir * -1;
    return `<path d="M${x} 96 C${x + o * 40} 100 ${x + o * 46} 150 ${x + o * 36} 182 C${x + o * 28} 196 ${x + o * 14} 196 ${x + o * 8} 186
      C${x + o * 2} 196 ${x - o * 10} 192 ${x - o * 10} 180 C${x - o * 20} 176 ${x - o * 18} 160 ${x - o * 10} 150 C${x - o * 20} 140 ${x - o * 14} 120 ${x} 96Z"
      fill="#c99257" ${line(4)}/>`;
  };
  return `
    <defs>${shade('f', '#fbe3bd', '#ddb27a')}${shade('hat', '#ffa6c4', '#e0507a', 0.4, 0.3)}</defs>
    ${scallop(-1)}${scallop(1)}
    <path d="${HEAD}" fill="url(#f)" ${line(4)}/>
    <ellipse cx="120" cy="162" rx="46" ry="34" fill="#fff4e0" ${line(3)}/>
    ${eyeWhite(90, 122, 17, '#c2185b', 1)}${eyeWhite(150, 122, 17, '#c2185b', -1)}
    <path d="M72 108 l-6 -6 M78 104 l-3 -8 M162 104 l3 -8 M168 108 l6 -6" ${line(3)}/>
    ${nose(144)}${mouth(160)}
    <path d="M54 92 C52 30 188 30 186 92 Q120 76 54 92Z" fill="url(#hat)" ${line(4)}/>
    <path d="M54 92 Q46 120 60 132 Q70 110 72 92Z M186 92 Q194 120 180 132 Q170 110 168 92Z" fill="url(#hat)" ${line(3.5)}/>
    ${shine(92, 50, 16, 7)}
    <rect x="98" y="60" width="44" height="10" rx="4" fill="#ad1457"/>
    <circle cx="94" cy="66" r="18" fill="#b3e5fc" stroke="#ad1457" stroke-width="7"/><circle cx="146" cy="66" r="18" fill="#b3e5fc" stroke="#ad1457" stroke-width="7"/>
    <path d="M84 58 Q92 54 98 60 M136 58 Q144 54 150 60" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>
    ${collar('#ec407a', '<path d="M104 234 Q112 226 120 234 Q128 226 136 234 Q128 242 120 236 Q112 242 104 234Z" fill="#fff" stroke="#ad1457" stroke-width="2"/>', '#f8bbd0')}`;
}

function rubble() {
  return `
    <defs>${shade('f', '#f0c78a', '#c98a45')}${shade('hat', '#ffe066', '#f2a600', 0.4, 0.3)}</defs>
    <path d="M52 100 Q30 92 34 124 Q46 122 62 114Z M188 100 Q210 92 206 124 Q194 122 178 114Z" fill="#a8692f" ${line(4)}/>
    <path d="M120 48 C182 48 210 92 206 138 C202 184 168 208 120 208 C72 208 38 184 34 138 C30 92 58 48 120 48Z" fill="url(#f)" ${line(4)}/>
    <path d="M70 160 Q120 146 170 160 Q176 196 120 202 Q64 196 70 160Z" fill="#fff4e0" ${line(3)}/>
    ${eyeWhite(88, 122, 15, '#5b3a1e', 1)}${eyeWhite(152, 122, 15, '#5b3a1e', -1)}
    <path d="M70 104 Q86 98 102 108 M138 108 Q154 98 170 104" fill="none" ${line(5)}/>
    ${nose(142)}
    <path d="M92 172 Q120 196 148 172 Q120 180 92 172Z" fill="#7a2f2f" ${line(3)}/>
    <path d="M100 176 l5 -9 l5 9Z M130 176 l5 -9 l5 9Z" fill="#fff" stroke="${INK}" stroke-width="1.5"/>
    <path d="M30 86 Q120 66 210 86 Q212 98 198 98 Q120 84 42 98 Q28 98 30 86Z" fill="#f2a600" ${line(4)}/>
    <path d="M58 88 C58 26 182 26 182 88Z" fill="url(#hat)" ${line(4)}/>
    <rect x="110" y="30" width="20" height="58" rx="6" fill="#f2a600" ${line(3)}/>
    ${shine(86, 52, 16, 7)}
    ${collar('#ffb300', '<path d="M112 244 L126 228 M122 224 a6 6 0 1 0 8 8" fill="none" stroke="#455a64" stroke-width="5" stroke-linecap="round"/>', '#90a4ae')}`;
}

export function pup(id: PupId) {
  const body = { chase, marshall, skye, rubble }[id]();
  return svg('0 0 240 262', `${shadow(120, 256, 70, 8)}${body}`);
}

export function pawBadge(color = '#1e88e5') {
  return svg('0 0 100 110', `
    <defs>${shade('b', color, '#0d3c8a', 0.4, 0.25)}</defs>
    <path d="M50 4 L92 20 L86 68 Q70 94 50 104 Q30 94 14 68 L8 20Z" fill="url(#b)" stroke="#fff" stroke-width="6"/>
    <path d="M50 4 L92 20 L86 68 Q70 94 50 104 Q30 94 14 68 L8 20Z" fill="none" ${line(2.5)}/>
    <ellipse cx="50" cy="64" rx="16" ry="14" fill="#fff"/>
    <ellipse cx="29" cy="44" rx="7" ry="9" fill="#fff"/><ellipse cx="42" cy="32" rx="7" ry="9" fill="#fff"/>
    <ellipse cx="58" cy="32" rx="7" ry="9" fill="#fff"/><ellipse cx="71" cy="44" rx="7" ry="9" fill="#fff"/>
    ${shine(32, 22, 12, 5)}`);
}

export function pupTruck(color: string, dark: string) {
  return svg('0 0 220 130', `
    <defs>${vgrad('c', color, dark)}</defs>
    ${shadow(110, 116, 96, 8)}
    <path d="M14 64 Q14 44 34 44 L120 44 L140 16 L184 16 Q196 16 200 30 L208 64 L208 92 L14 92Z" fill="url(#c)" ${line(4)}/>
    <path d="M146 24 L180 24 Q188 24 190 32 L196 58 L136 58Z" fill="#b3e5fc" ${line(3)}/>
    <rect x="40" y="30" width="34" height="14" rx="5" fill="#e53935" ${line(2.5)}/><rect x="74" y="30" width="24" height="14" rx="5" fill="#1e88e5" ${line(2.5)}/>
    <rect x="22" y="56" width="60" height="10" rx="5" fill="#fff" opacity=".35"/>
    <rect x="196" y="70" width="14" height="10" rx="3" fill="#ffe082" ${line(2)}/>
    <circle cx="56" cy="94" r="20" fill="#333" ${line(4)}/><circle cx="56" cy="94" r="8" fill="#cfd8dc"/>
    <circle cx="166" cy="94" r="20" fill="#333" ${line(4)}/><circle cx="166" cy="94" r="8" fill="#cfd8dc"/>`);
}

export function bone() {
  return svg('0 0 120 60', `
    <defs>${vgrad('b', '#ffffff', '#e8dcc4')}</defs>
    <path d="M30 18 Q30 4 18 6 Q4 8 8 22 Q2 30 8 38 Q4 52 18 54 Q30 56 30 42 L90 42 Q90 56 102 54 Q116 52 112 38 Q118 30 112 22 Q116 8 102 6 Q90 4 90 18Z" fill="url(#b)" ${line(3.5)}/>`);
}
