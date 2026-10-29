// Hand-drawn SVG characters. Each function returns an SVG string.
const svg = (vb: string, body: string, cls = '') => `<svg class="art ${cls}" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
const OUT = 'stroke="#2b2b2b" stroke-width="3" stroke-linejoin="round"';

// ---- Plants vs. Zombies ----
export const peashooter = () => svg('0 0 110 120', `
  <path d="M45 72 Q40 95 46 118" stroke="#2e7d32" stroke-width="7" fill="none"/>
  <path d="M46 116 Q20 100 8 112 Q25 122 46 116Z" fill="#43a047" ${OUT}/>
  <path d="M46 116 Q72 100 86 110 Q68 122 46 116Z" fill="#43a047" ${OUT}/>
  <path d="M22 32 Q2 18 8 44 Q14 38 24 42Z" fill="#43a047" ${OUT}/>
  <rect x="60" y="30" width="34" height="26" rx="8" fill="#8bd34a" ${OUT}/>
  <ellipse cx="96" cy="43" rx="8" ry="15" fill="#2e7d32" ${OUT}/>
  <ellipse cx="96" cy="43" rx="4" ry="9" fill="#1b4d1e"/>
  <circle cx="45" cy="45" r="28" fill="#8bd34a" ${OUT}/>
  <circle cx="52" cy="36" r="7" fill="#1a1a1a"/><circle cx="54" cy="34" r="2.5" fill="#fff"/>`, 'peashooter');

export const sunflower = (happy = true) => svg('0 0 120 150', `
  <path d="M60 80 Q56 115 60 148" stroke="#2e7d32" stroke-width="7" fill="none"/>
  <path d="M60 130 Q30 112 18 126 Q36 140 60 130Z" fill="#43a047" ${OUT}/>
  <path d="M60 122 Q90 104 102 118 Q84 132 60 122Z" fill="#43a047" ${OUT}/>
  ${Array.from({ length: 14 }, (_, i) => `<ellipse cx="60" cy="18" rx="10" ry="20" fill="#ffd21f" stroke="#e0a000" stroke-width="2" transform="rotate(${i * 360 / 14} 60 52)"/>`).join('')}
  <circle cx="60" cy="52" r="26" fill="#f5a524" ${OUT}/>
  <circle cx="51" cy="46" r="4" fill="#3b2412"/><circle cx="69" cy="46" r="4" fill="#3b2412"/>
  <circle cx="45" cy="57" r="4" fill="#ff7b5c" opacity=".6"/><circle cx="75" cy="57" r="4" fill="#ff7b5c" opacity=".6"/>
  <path d="${happy ? 'M48 58 Q60 70 72 58' : 'M50 64 Q60 58 70 64'}" stroke="#3b2412" stroke-width="3" fill="none" stroke-linecap="round"/>`, 'sunflower');

export const sunToken = () => svg('0 0 100 100', `
  ${Array.from({ length: 12 }, (_, i) => `<path d="M50 2 L56 20 L44 20Z" fill="#ffe14d" transform="rotate(${i * 30} 50 50)"/>`).join('')}
  <circle cx="50" cy="50" r="33" fill="#ffe14d" stroke="#f4b400" stroke-width="4"/>
  <circle cx="50" cy="50" r="25" fill="#fff3a6"/>`, 'sun');

export const zombie = () => svg('0 0 100 150', `
  <rect x="40" y="112" width="11" height="34" fill="#4e342e" ${OUT}/>
  <rect x="56" y="112" width="11" height="30" fill="#4e342e" ${OUT}/>
  <ellipse cx="44" cy="146" rx="10" ry="4" fill="#2b2b2b"/><ellipse cx="62" cy="143" rx="10" ry="4" fill="#2b2b2b"/>
  <rect x="34" y="64" width="40" height="54" rx="6" fill="#6d4c41" ${OUT}/>
  <path d="M46 64 L54 80 L62 64Z" fill="#eee"/><path d="M53 70 L50 96 L54 100 L58 96 L55 70Z" fill="#c62828"/>
  <rect x="2" y="70" width="44" height="12" rx="6" fill="#6d4c41" ${OUT}/>
  <rect x="6" y="88" width="40" height="12" rx="6" fill="#6d4c41" ${OUT}/>
  <circle cx="4" cy="76" r="7" fill="#a5c88a" ${OUT}/><circle cx="8" cy="94" r="7" fill="#a5c88a" ${OUT}/>
  <circle cx="56" cy="38" r="27" fill="#a5c88a" ${OUT}/>
  <path d="M40 16 Q50 4 52 14 Q58 2 64 14" stroke="#2b2b2b" stroke-width="3" fill="none"/>
  <circle cx="44" cy="34" r="10" fill="#fff" ${OUT}/><circle cx="41" cy="35" r="4" fill="#1a1a1a"/>
  <circle cx="64" cy="33" r="6" fill="#fff" ${OUT}/><circle cx="62" cy="34" r="2.5" fill="#1a1a1a"/>
  <path d="M38 52 L44 48 L48 54 L54 48 L60 54 L66 48 L70 52" stroke="#2b2b2b" stroke-width="3" fill="none"/>
  <rect x="47" y="49" width="5" height="5" fill="#fff"/>`, 'zombie');

export const pea = () => svg('0 0 20 20', '<circle cx="10" cy="10" r="8" fill="#7cc242" stroke="#2e7d32" stroke-width="2"/>', 'pea');

// ---- Pokémon ----
export const pikachu = (mood = 'happy') => svg('0 0 130 150', `
  <path d="M92 108 L122 82 L108 78 L126 46 L98 62 L110 34 L82 82 Z" fill="#ffd83b" ${OUT}/>
  <path d="M82 82 L92 108 L98 96Z" fill="#8a5a2b"/>
  <ellipse cx="58" cy="112" rx="32" ry="30" fill="#ffd83b" ${OUT}/>
  <ellipse cx="40" cy="140" rx="12" ry="6" fill="#ffd83b" ${OUT}/><ellipse cx="76" cy="140" rx="12" ry="6" fill="#ffd83b" ${OUT}/>
  <path d="M34 46 L12 2 L50 34Z" fill="#ffd83b" ${OUT}/><path d="M12 2 L20 18 L27 13Z" fill="#2b2b2b"/>
  <path d="M82 46 L108 6 L68 32Z" fill="#ffd83b" ${OUT}/><path d="M108 6 L98 21 L91 16Z" fill="#2b2b2b"/>
  <ellipse cx="58" cy="64" rx="38" ry="32" fill="#ffd83b" ${OUT}/>
  ${mood === 'surprised'
    ? '<circle cx="44" cy="58" r="7" fill="#1a1a1a"/><circle cx="72" cy="58" r="7" fill="#1a1a1a"/><ellipse cx="58" cy="78" rx="5" ry="7" fill="#8b1a1a"/>'
    : '<circle cx="44" cy="58" r="7" fill="#1a1a1a"/><circle cx="46" cy="55" r="2.5" fill="#fff"/><circle cx="72" cy="58" r="7" fill="#1a1a1a"/><circle cx="74" cy="55" r="2.5" fill="#fff"/><path d="M50 74 Q54 80 58 74 Q62 80 66 74" stroke="#2b2b2b" stroke-width="2.5" fill="none"/><path d="M52 77 Q58 90 64 77Z" fill="#e2566a"/>'}
  <ellipse cx="58" cy="68" rx="2.5" ry="2" fill="#1a1a1a"/>
  <circle cx="30" cy="74" r="8" fill="#e53935"/><circle cx="86" cy="74" r="8" fill="#e53935"/>
  <ellipse cx="36" cy="106" rx="7" ry="10" fill="#ffd83b" ${OUT} transform="rotate(-20 36 106)"/>
  <ellipse cx="80" cy="106" rx="7" ry="10" fill="#ffd83b" ${OUT} transform="rotate(20 80 106)"/>`, 'pikachu');

export const pokeball = () => svg('0 0 100 100', `
  <circle cx="50" cy="50" r="45" fill="#fff" stroke="#222" stroke-width="5"/>
  <path d="M5 50 A45 45 0 0 1 95 50Z" fill="#e53935" stroke="#222" stroke-width="5"/>
  <path d="M8 40 A42 42 0 0 1 30 14" stroke="#ff8a80" stroke-width="5" fill="none" stroke-linecap="round"/>
  <circle cx="50" cy="50" r="14" fill="#fff" stroke="#222" stroke-width="5"/>
  <circle cx="50" cy="50" r="6" fill="#fff" stroke="#bbb" stroke-width="2"/>`, 'pokeball');

export const bolt = () => svg('0 0 60 100', '<path d="M34 0 L6 56 L28 56 L20 100 L56 38 L32 38 L44 0Z" fill="#ffe14d" stroke="#f4b400" stroke-width="3"/>', 'bolt');

// ---- Paw Patrol pups ----
const PUPS = {
  chase: { name: 'Chase', fur: '#b07a4a', ear: '#6b4423', muzzle: '#f1d9b5', hat: '#1e4fd8', badge: '#ffd21f' },
  marshall: { name: 'Marshall', fur: '#fafafa', ear: '#3a3a3a', muzzle: '#ffffff', hat: '#e53935', badge: '#ffd21f', spots: true },
  skye: { name: 'Skye', fur: '#e8c9a0', ear: '#c99a6a', muzzle: '#fff4e0', hat: '#f48fb1', badge: '#ff4081', goggles: true },
  rubble: { name: 'Rubble', fur: '#d9a066', ear: '#a86d3a', muzzle: '#fbe3c4', hat: '#ffc107', badge: '#555' },
};
export const PUP_NAMES = Object.keys(PUPS) as (keyof typeof PUPS)[];
export type PupId = keyof typeof PUPS;
export const pupName = (id: PupId) => PUPS[id].name;

export function pup(id: PupId = 'chase') {
  const p: { name: string; fur: string; ear: string; muzzle: string; hat: string; badge: string; spots?: boolean } = PUPS[id];
  const hat = id === 'chase'
    ? `<path d="M22 46 Q60 2 98 46Z" fill="${p.hat}" ${OUT}/><rect x="18" y="42" width="84" height="10" rx="5" fill="#173a9e" ${OUT}/><path d="M60 18 L64 28 L74 28 L66 34 L69 44 L60 38 L51 44 L54 34 L46 28 L56 28Z" fill="${p.badge}"/>`
    : id === 'marshall'
      ? `<path d="M20 48 Q60 0 100 48Z" fill="${p.hat}" ${OUT}/><path d="M10 48 L110 48 L104 56 L16 56Z" fill="${p.hat}" ${OUT}/><circle cx="60" cy="30" r="9" fill="${p.badge}" ${OUT}/>`
      : id === 'skye'
        ? `<path d="M22 50 Q60 6 98 50Z" fill="${p.hat}" ${OUT}/><circle cx="42" cy="40" r="10" fill="#b3e5fc" ${OUT}/><circle cx="78" cy="40" r="10" fill="#b3e5fc" ${OUT}/><rect x="52" y="37" width="16" height="5" fill="${p.hat}"/>`
        : `<path d="M22 48 Q60 4 98 48Z" fill="${p.hat}" ${OUT}/><rect x="16" y="44" width="88" height="9" rx="4" fill="${p.hat}" ${OUT}/><rect x="52" y="20" width="16" height="22" rx="3" fill="#fff59d"/>`;
  return svg('0 0 120 135', `
    <ellipse cx="18" cy="74" rx="14" ry="26" fill="${p.ear}" ${OUT} transform="rotate(20 18 74)"/>
    <ellipse cx="102" cy="74" rx="14" ry="26" fill="${p.ear}" ${OUT} transform="rotate(-20 102 74)"/>
    <ellipse cx="60" cy="76" rx="42" ry="38" fill="${p.fur}" ${OUT}/>
    ${p.spots ? '<circle cx="34" cy="66" r="5" fill="#333"/><circle cx="88" cy="88" r="4" fill="#333"/><circle cx="80" cy="60" r="3" fill="#333"/>' : ''}
    <ellipse cx="60" cy="94" rx="24" ry="17" fill="${p.muzzle}" ${OUT}/>
    <circle cx="44" cy="70" r="9" fill="#3b2412"/><circle cx="47" cy="66" r="3.5" fill="#fff"/>
    <circle cx="76" cy="70" r="9" fill="#3b2412"/><circle cx="79" cy="66" r="3.5" fill="#fff"/>
    <ellipse cx="60" cy="85" rx="9" ry="6" fill="#1a1a1a"/>
    <path d="M52 98 Q60 104 68 98" stroke="#1a1a1a" stroke-width="2.5" fill="none"/>
    <path d="M56 100 Q60 112 64 100Z" fill="#ff7b9c"/>
    ${hat}
    <circle cx="60" cy="124" r="10" fill="${p.badge}" ${OUT}/>`, 'pup');
}

export const pawBadge = (color = '#1e88e5') => svg('0 0 100 100', `
  <path d="M50 4 L92 20 L86 66 Q70 90 50 96 Q30 90 14 66 L8 20Z" fill="${color}" stroke="#fff" stroke-width="5"/>
  <circle cx="50" cy="60" r="15" fill="#fff"/>
  <circle cx="30" cy="40" r="7" fill="#fff"/><circle cx="43" cy="30" r="7" fill="#fff"/>
  <circle cx="57" cy="30" r="7" fill="#fff"/><circle cx="70" cy="40" r="7" fill="#fff"/>`, 'badge');

export const pupTruck = (color = '#1e4fd8') => svg('0 0 160 90', `
  <rect x="10" y="30" width="110" height="36" rx="10" fill="${color}" ${OUT}/>
  <path d="M90 30 L110 8 L140 8 L150 40 L150 66 L120 66 L120 30Z" fill="${color}" ${OUT}/>
  <path d="M114 14 L136 14 L142 36 L118 36Z" fill="#b3e5fc"/>
  <rect x="30" y="20" width="30" height="10" rx="4" fill="#e53935"/><rect x="60" y="20" width="10" height="10" rx="4" fill="#1e88e5"/>
  <circle cx="40" cy="70" r="15" fill="#333" ${OUT}/><circle cx="40" cy="70" r="6" fill="#ccc"/>
  <circle cx="125" cy="70" r="15" fill="#333" ${OUT}/><circle cx="125" cy="70" r="6" fill="#ccc"/>`, 'truck');

// ---- Unbranded friends ----
export const monster = (color = '#8e5cf7', mouth = 'open') => svg('0 0 140 150', `
  <path d="M30 30 L22 4 L44 22Z" fill="#ffca28" ${OUT}/><path d="M110 30 L118 4 L96 22Z" fill="#ffca28" ${OUT}/>
  <path d="M70 12 C 20 12 8 50 10 90 C 12 130 34 146 70 146 C 106 146 128 130 130 90 C 132 50 120 12 70 12Z" fill="${color}" ${OUT}/>
  <circle cx="48" cy="44" r="14" fill="#fff" ${OUT}/><circle cx="51" cy="46" r="6" fill="#1a1a1a"/>
  <circle cx="92" cy="44" r="14" fill="#fff" ${OUT}/><circle cx="89" cy="46" r="6" fill="#1a1a1a"/>
  ${mouth === 'open'
    ? '<ellipse cx="70" cy="80" rx="30" ry="20" fill="#5a1a2a" stroke="#2b2b2b" stroke-width="3"/><path d="M48 68 l6 9 l6-10 l6 10 l6-10 l6 10 l6-9" fill="#fff"/><ellipse cx="70" cy="92" rx="13" ry="6" fill="#ff6b8a"/>'
    : mouth === 'yuck'
      ? '<path d="M44 84 Q52 74 60 84 Q68 94 76 84 Q84 74 96 84" stroke="#2b2b2b" stroke-width="4" fill="none"/><ellipse cx="86" cy="94" rx="6" ry="8" fill="#ff6b8a" stroke="#2b2b2b" stroke-width="2"/>'
      : '<path d="M46 76 Q70 102 94 76Z" fill="#5a1a2a" stroke="#2b2b2b" stroke-width="3"/>'}
  <ellipse cx="70" cy="122" rx="26" ry="16" fill="#fff" opacity=".35"/>`, 'monster');

export const frog = () => svg('0 0 120 100', `
  <ellipse cx="60" cy="66" rx="46" ry="30" fill="#5cc25c" ${OUT}/>
  <circle cx="36" cy="30" r="17" fill="#5cc25c" ${OUT}/><circle cx="84" cy="30" r="17" fill="#5cc25c" ${OUT}/>
  <circle cx="36" cy="28" r="10" fill="#fff"/><circle cx="38" cy="29" r="5" fill="#1a1a1a"/>
  <circle cx="84" cy="28" r="10" fill="#fff"/><circle cx="82" cy="29" r="5" fill="#1a1a1a"/>
  <path d="M34 60 Q60 80 86 60" stroke="#2b2b2b" stroke-width="3" fill="none" stroke-linecap="round"/>
  <circle cx="28" cy="62" r="5" fill="#ff8aa0" opacity=".6"/><circle cx="92" cy="62" r="5" fill="#ff8aa0" opacity=".6"/>
  <ellipse cx="22" cy="92" rx="16" ry="6" fill="#4caf50" ${OUT}/><ellipse cx="98" cy="92" rx="16" ry="6" fill="#4caf50" ${OUT}/>`, 'frog');

export const lilypad = () => svg('0 0 140 70', `
  <path d="M70 35 L130 20 A64 30 0 1 1 112 12Z" fill="#43a047" stroke="#2e7d32" stroke-width="3"/>
  <path d="M70 35 L20 30 M70 35 L40 58 M70 35 L100 60" stroke="#2e7d32" stroke-width="2" opacity=".6"/>`, 'lilypad');

export const star = (filled = true) => svg('0 0 100 100',
  `<path d="M50 5 L62 37 L96 38 L69 59 L79 92 L50 72 L21 92 L31 59 L4 38 L38 37Z" fill="${filled ? '#ffd21f' : '#ddd'}" stroke="${filled ? '#f4a100' : '#bbb'}" stroke-width="5" stroke-linejoin="round"/>`, 'star');

export const gift = () => svg('0 0 100 100', `
  <rect x="10" y="40" width="80" height="54" rx="6" fill="#ff5c8a" ${OUT}/>
  <rect x="4" y="28" width="92" height="18" rx="5" fill="#ff7aa2" ${OUT}/>
  <rect x="44" y="28" width="12" height="66" fill="#ffd21f"/>
  <path d="M50 28 Q30 0 22 16 Q20 28 50 28 Q80 28 78 16 Q70 0 50 28Z" fill="#ffd21f" ${OUT}/>`, 'gift');

// ---- Backgrounds (1280×720) ----
const W = 1280, HT = 720;
const bg = (body: string) => svg(`0 0 ${W} ${HT}`, body, 'bg');
const clouds = (y: number) => [120, 520, 940].map((x, i) =>
  `<g fill="#fff" opacity=".9" transform="translate(${x} ${y + (i % 2) * 40})"><ellipse cx="0" cy="0" rx="70" ry="28"/><ellipse cx="45" cy="-18" rx="45" ry="30"/><ellipse cx="90" cy="0" rx="60" ry="24"/></g>`).join('');

export const bgHome = () => bg(`
  <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fd3ff"/><stop offset="1" stop-color="#c9f0ff"/></linearGradient></defs>
  <rect width="${W}" height="${HT}" fill="url(#s)"/>
  ${['#ff5c5c', '#ffa53b', '#ffe14d', '#5cd65c', '#4fa8ff', '#9a6bff'].map((c, i) =>
    `<path d="M${140 + i * 22} 720 A${500 - i * 22} ${470 - i * 22} 0 0 1 ${1140 - i * 22} 720" stroke="${c}" stroke-width="22" fill="none" opacity=".55"/>`).join('')}
  ${clouds(110)}
  <path d="M0 600 Q320 520 640 590 T1280 570 L1280 720 L0 720Z" fill="#6fd16f"/>
  <path d="M0 650 Q400 600 800 660 T1280 640 L1280 720 L0 720Z" fill="#4cbf4c"/>`);

// Three lanes; lane centers at y = 260, 440, 620.
export const bgLawn = () => bg(`
  <rect width="${W}" height="${HT}" fill="#8fd14f"/>
  <rect width="${W}" height="170" fill="#9ad8ff"/>
  ${clouds(60)}
  ${[0, 1, 2].map(i => `<rect x="0" y="${170 + i * 180}" width="${W}" height="180" fill="${i % 2 ? '#7cc242' : '#93d250'}"/>`).join('')}
  ${Array.from({ length: 10 }, (_, i) => `<rect x="${130 + i * 115}" y="170" width="57" height="550" fill="#000" opacity=".04"/>`).join('')}
  <rect x="0" y="170" width="70" height="550" fill="#c7a26b"/><rect x="60" y="170" width="12" height="550" fill="#8d6e3f"/>`);

export const bgSky = () => bg(`
  <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5ec2ff"/><stop offset="1" stop-color="#bdeaff"/></linearGradient></defs>
  <rect width="${W}" height="${HT}" fill="url(#s)"/>${clouds(150)}
  <rect y="600" width="${W}" height="120" fill="#7cc242"/>
  ${Array.from({ length: 12 }, (_, i) => `<rect x="${i * 110}" y="600" width="55" height="120" fill="#93d250"/>`).join('')}`);

export const bgField = () => bg(`
  <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8ad7ff"/><stop offset="1" stop-color="#e3f7ff"/></linearGradient></defs>
  <rect width="${W}" height="${HT}" fill="url(#s)"/>${clouds(90)}
  <path d="M0 430 Q300 360 640 420 T1280 400 L1280 720 L0 720Z" fill="#7bd86b"/>
  <path d="M0 520 Q400 470 900 520 T1280 500 L1280 720 L0 720Z" fill="#5bc25b"/>
  ${Array.from({ length: 26 }, (_, i) => `<path d="M${i * 50} 720 l14 -60 l10 40 l12 -70 l10 60 l12 -40 l4 70Z" fill="#3fa63f"/>`).join('')}`);

export const bgBay = () => bg(`
  <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffcf8a"/><stop offset="1" stop-color="#9fdcff"/></linearGradient></defs>
  <rect width="${W}" height="${HT}" fill="url(#s)"/>${clouds(80)}
  <rect y="470" width="${W}" height="80" fill="#3da5e0"/>
  <g transform="translate(1080 150)">
    <rect x="-20" y="80" width="40" height="320" fill="#e8e8e8" stroke="#555" stroke-width="4"/>
    <ellipse cx="0" cy="70" rx="90" ry="34" fill="#ffd21f" stroke="#555" stroke-width="4"/>
    <rect x="-70" y="30" width="140" height="40" rx="10" fill="#b3e5fc" stroke="#555" stroke-width="4"/>
    <path d="M-60 30 Q0 -40 60 30Z" fill="#e53935" stroke="#555" stroke-width="4"/>
  </g>
  <rect y="540" width="${W}" height="180" fill="#8fd14f"/><rect y="640" width="${W}" height="80" fill="#9b9b9b"/>
  ${Array.from({ length: 14 }, (_, i) => `<rect x="${i * 100 + 20}" y="676" width="50" height="8" fill="#fff"/>`).join('')}`);

export const bgPond = () => bg(`
  <rect width="${W}" height="${HT}" fill="#9ae0ff"/>${clouds(40)}
  <path d="M0 180 Q640 130 1280 180 L1280 720 L0 720Z" fill="#2fa3d6"/>
  ${Array.from({ length: 14 }, (_, i) => `<ellipse cx="${(i * 233) % 1280}" cy="${240 + (i * 97) % 460}" rx="60" ry="10" fill="none" stroke="#fff" stroke-width="3" opacity=".35"/>`).join('')}
  ${[80, 1180].map(x => `<g transform="translate(${x} 180)"><rect x="-4" y="-120" width="8" height="120" fill="#5d8a2c"/><ellipse cx="0" cy="-130" rx="10" ry="30" fill="#7b4a26"/></g>`).join('')}`);

export const bgKitchen = () => bg(`
  <rect width="${W}" height="${HT}" fill="#ffe9f3"/>
  ${Array.from({ length: 16 }, (_, i) => Array.from({ length: 6 }, (_, j) => (i + j) % 2 ? `<rect x="${i * 80}" y="${j * 80}" width="80" height="80" fill="#ffd6e8"/>` : '').join('')).join('')}
  <rect y="480" width="${W}" height="240" fill="#c98a5a"/><rect y="480" width="${W}" height="24" fill="#a86d3a"/>`);

export const bgBook = () => bg(`
  <rect width="${W}" height="${HT}" fill="#ffd27a"/>
  <rect x="60" y="110" width="1160" height="580" rx="30" fill="#fff8e6" stroke="#c98a2a" stroke-width="8"/>
  <rect x="636" y="110" width="8" height="580" fill="#e8c48a"/>`);

// Texture key -> [svg, raster width, raster height]. Rasterized larger than drawn so
// sprites stay crisp when the canvas is scaled up on tablets.
export const TEXTURES: Record<string, [string, number, number]> = {
  peashooter: [peashooter(), 220, 240],
  sunflower: [sunflower(true), 240, 300],
  sunflowerSad: [sunflower(false), 240, 300],
  sun: [sunToken(), 220, 220],
  zombie: [zombie(), 200, 300],
  pea: [pea(), 40, 40],
  pikachu: [pikachu('happy'), 260, 300],
  pikachuSurprised: [pikachu('surprised'), 260, 300],
  pokeball: [pokeball(), 200, 200],
  bolt: [bolt(), 120, 200],
  pawBadge: [pawBadge('#1e88e5'), 200, 200],
  truck: [pupTruck('#1e4fd8'), 320, 180],
  fireTruck: [pupTruck('#e53935'), 320, 180],
  monster: [monster('#8e5cf7', 'open'), 280, 300],
  monsterYuck: [monster('#8e5cf7', 'yuck'), 280, 300],
  monsterHappy: [monster('#8e5cf7', 'smile'), 280, 300],
  frog: [frog(), 240, 200],
  lilypad: [lilypad(), 300, 150],
  star: [star(true), 120, 120],
  starEmpty: [star(false), 120, 120],
  gift: [gift(), 240, 240],
  ...Object.fromEntries(PUP_NAMES.map(p => [`pup-${p}`, [pup(p), 240, 270]])),
  bgHome: [bgHome(), W, HT],
  bgLawn: [bgLawn(), W, HT],
  bgSky: [bgSky(), W, HT],
  bgField: [bgField(), W, HT],
  bgBay: [bgBay(), W, HT],
  bgPond: [bgPond(), W, HT],
  bgKitchen: [bgKitchen(), W, HT],
  bgBook: [bgBook(), W, HT],
};
