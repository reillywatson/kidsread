// Scene backgrounds, 1280×720. Game layouts depend on a few positions noted below.
import { svg, cel, ell, line, INK } from './util';

const W = 1280, HT = 720;
const bg = (body: string) => svg(`0 0 ${W} ${HT}`, body);
const sky = (top: string, bottom: string, h = HT) =>
  `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs>
   <rect width="${W}" height="${h}" fill="url(#sky)"/>`;

// ---------- Props ----------
const sun = (x: number, y: number, r = 46) => `<g transform="translate(${x} ${y})">
  <circle r="${r * 2}" fill="#fff6b0" opacity=".25"/>
  ${Array.from({ length: 12 }, (_, i) => `<path d="M0 ${-r * 1.7} L${r * 0.2} ${-r * 1.2} L${-r * 0.2} ${-r * 1.2}Z" fill="#ffd54f" transform="rotate(${i * 30})"/>`).join('')}
  ${cel(ell(0, 0, r, r), '#ffe74d', '#ffbf1f', { off: [-6, -6], stroke: 0, hl: [-r * 0.35, -r * 0.35, r * 0.3, r * 0.2] })}</g>`;

const cloud = (x: number, y: number, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
  ${cel('M-70 20 Q-90 20 -88 0 Q-86 -22 -60 -18 Q-56 -50 -22 -48 Q0 -70 30 -50 Q60 -60 68 -30 Q96 -30 94 -4 Q92 20 70 20Z', '#ffffff', '#dbeefa', { off: [-4, -8], stroke: 0 })}</g>`;

const tree = (x: number, y: number, s = 1, c = '#5cbf4a', cs = '#2f8a35') => `<g transform="translate(${x} ${y}) scale(${s})">
  ${cel('M-8 0 L-6 -50 L6 -50 L8 0Z', '#9a6a3a', '#6d4522', { off: [-3, 0], stroke: 3 })}
  ${cel('M0 -150 C40 -150 60 -120 56 -92 C76 -80 70 -44 44 -40 C30 -24 -30 -24 -44 -40 C-70 -44 -76 -80 -56 -92 C-60 -120 -40 -150 0 -150Z', c, cs, { off: [-10, -10], stroke: 3.5, hl: [-22, -118, 14, 8] })}</g>`;

const pine = (x: number, y: number, s = 1, c = '#3f9d58', cs = '#22683a') => `<g transform="translate(${x} ${y}) scale(${s})">
  <rect x="-6" y="-24" width="12" height="24" fill="#7a4f2a"/>
  ${cel('M0 -150 L44 -60 L24 -62 L54 -20 L-54 -20 L-24 -62 L-44 -60Z', c, cs, { off: [-8, 0], stroke: 3 })}</g>`;

const bush = (x: number, y: number, s = 1, c = '#5cbf4a', cs = '#2f8a35') => `<g transform="translate(${x} ${y}) scale(${s})">
  ${cel('M-60 0 Q-70 -30 -40 -36 Q-30 -60 0 -54 Q30 -64 42 -38 Q72 -32 60 0Z', c, cs, { off: [-6, -6], stroke: 3 })}</g>`;

const flower = (x: number, y: number, c: string, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
  <path d="M0 0 L0 24" stroke="#2e7d32" stroke-width="3"/>
  ${[0, 72, 144, 216, 288].map(a => `<circle cx="${(Math.cos(a * Math.PI / 180) * 7).toFixed(1)}" cy="${(Math.sin(a * Math.PI / 180) * 7).toFixed(1)}" r="6" fill="${c}" stroke="${INK}" stroke-width="1"/>`).join('')}
  <circle r="4" fill="#ffb300"/></g>`;
const FLOWER_COLORS = ['#ff6b8a', '#ffd21f', '#ffffff', '#b388ff', '#ff8a3d'];
const flowers = (y: number, n: number, seed = 1, spread = 50) => Array.from({ length: n }, (_, i) =>
  flower((i * 197 + seed * 61) % W, y + ((i * 37 + seed * 13) % spread), FLOWER_COLORS[(i + seed) % FLOWER_COLORS.length])).join('');

const tufts = (y: number, n: number, color = '#3f9a2e', seed = 0) => Array.from({ length: n }, (_, i) => {
  const x = (i * 137 + seed * 71) % W, yy = y + ((i * 53 + seed * 29) % 60);
  return `<path d="M${x} ${yy} l4 -14 l3 10 l4 -16 l3 12 l4 -10 l2 18Z" fill="${color}"/>`;
}).join('');

const hill = (d: string, c: string, cs: string) => cel(d, c, cs, { off: [0, -14], stroke: 0 });

const mountains = (y: number, c: string, cs: string, snow = true) => {
  const peaks = [[60, 160], [260, 220], [470, 170], [700, 240], [930, 180], [1150, 230], [1340, 170]];
  return peaks.map(([x, h]) => `${cel(`M${x - 190} ${y} L${x} ${y - h} L${x + 190} ${y}Z`, c, cs, { off: [-30, 0], stroke: 0 })}
    ${snow ? `<path d="M${x - 42} ${y - h + 50} L${x} ${y - h} L${x + 42} ${y - h + 50} L${x + 20} ${y - h + 40} L${x} ${y - h + 56} L${x - 18} ${y - h + 40}Z" fill="#fff"/>` : ''}`).join('');
};

// ---------- Scenes ----------

export const bgHome = () => bg(`
  ${sky('#6fcaff', '#cdf1ff')}
  ${sun(1010, 200)}${cloud(150, 120, 1.1)}${cloud(560, 90, 0.8)}${cloud(860, 150, 0.9)}
  ${mountains(560, '#a8d8f0', '#86bfe0', true)}
  <g opacity=".85">${['#ff5c5c', '#ffa53b', '#ffe14d', '#5cd65c', '#4fa8ff', '#9a6bff'].map((c, i) =>
    `<path d="M${140 + i * 22} 720 A${500 - i * 22} ${470 - i * 22} 0 0 1 ${1140 - i * 22} 720" stroke="${c}" stroke-width="22" fill="none"/>`).join('')}</g>
  ${hill('M0 600 Q320 510 640 580 T1280 560 L1280 720 L0 720Z', '#7bd86b', '#5cbf4a')}
  ${tree(80, 600, 0.9)}${tree(1200, 590, 1)}${pine(1110, 585, 0.7)}${bush(250, 620, 0.8)}${bush(1000, 610, 0.7, '#7bd86b', '#43a047')}
  ${hill('M0 650 Q400 600 800 660 T1280 640 L1280 720 L0 720Z', '#5cc24c', '#3fa63a')}
  ${tufts(650, 24, '#3a9b30')}${flowers(612, 16)}`);

// Three lanes, centers y = 260, 440, 620 (rows 170–710). House on the left (x < 80), street on the right.
export const bgLawn = () => {
  const tiles = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 11; c++) {
    const x = 80 + c * 100, y = 170 + r * 180, light = (r + c) % 2 === 0;
    tiles.push(`<rect x="${x}" y="${y}" width="100" height="180" fill="${light ? '#8fd14f' : '#79c23e'}"/>
      <path d="M${x + 20} ${y + 40} l3 -10 l3 10 M${x + 70} ${y + 120} l3 -10 l3 10 M${x + 45} ${y + 80} l3 -8 l3 8" stroke="${light ? '#6fb43a' : '#64a932'}" stroke-width="2" fill="none"/>`);
  }
  return bg(`
    ${sky('#79cdfb', '#c2ecff', 175)}
    ${cloud(380, 70, 0.7)}${cloud(900, 50, 0.6)}
    ${[260, 520, 980].map(x => `<g transform="translate(${x} 170)">${cel('M-70 0 L-70 -60 L0 -100 L70 -60 L70 0Z', '#f2d7b5', '#d8b48a', { off: [-6, 0], stroke: 3 })}
      ${cel('M-82 -56 L0 -112 L82 -56 L70 -50 L0 -98 L-70 -50Z', '#c0504d', '#8e2f2c', { off: [-4, -2], stroke: 3 })}
      <rect x="-40" y="-46" width="24" height="24" fill="#b3e5fc" ${line(2.5)}/><rect x="16" y="-46" width="24" height="24" fill="#b3e5fc" ${line(2.5)}/></g>`).join('')}
    ${pine(140, 170, 0.6)}${tree(740, 172, 0.7)}${tree(1150, 172, 0.65)}
    <rect y="150" width="${W}" height="22" fill="#e7d3a6"/>
    ${Array.from({ length: 26 }, (_, i) => `<rect x="${i * 50 + 4}" y="128" width="16" height="36" rx="3" fill="#fff8e7" stroke="#c9b48a" stroke-width="2"/>`).join('')}
    <rect y="140" width="${W}" height="8" fill="#fff8e7" stroke="#c9b48a" stroke-width="2"/>
    ${tiles.join('')}
    <rect x="1180" y="170" width="100" height="550" fill="#9e9e9e"/><rect x="1180" y="170" width="14" height="550" fill="#cfcfcf"/>
    ${Array.from({ length: 6 }, (_, i) => `<rect x="1232" y="${190 + i * 90}" width="8" height="46" fill="#fff59d"/>`).join('')}
    ${cel('M0 170 L80 170 L80 720 L0 720Z', '#f3e1c2', '#d6bd92', { off: [-12, 0], stroke: 0,
      inner: Array.from({ length: 22 }, (_, i) => `<path d="M0 ${180 + i * 25} L80 ${180 + i * 25}" stroke="#c9ad7c" stroke-width="2"/>`).join('') })}
    <rect x="12" y="300" width="56" height="120" rx="6" fill="#8d5a32" ${line(3)}/><circle cx="58" cy="362" r="4" fill="#ffd54f"/>
    <rect x="16" y="520" width="50" height="50" fill="#b3e5fc" ${line(3)}/><path d="M41 520 L41 570 M16 545 L66 545" stroke="${INK}" stroke-width="3"/>
    <rect x="76" y="170" width="8" height="550" fill="#8d6e3f"/>`);
};

export const bgSky = () => bg(`
  ${sky('#58bdfb', '#c6edff')}
  ${sun(1150, 110)}${cloud(220, 160, 1)}${cloud(700, 110, 0.8)}${cloud(1020, 260, 0.7)}
  ${hill('M0 560 Q300 500 640 540 T1280 520 L1280 720 L0 720Z', '#86d65e', '#62bd45')}
  ${tree(1180, 560, 0.8)}${bush(1050, 570, 0.7)}
  <rect y="600" width="${W}" height="120" fill="#7cc242"/>
  ${Array.from({ length: 13 }, (_, i) => `<rect x="${i * 100}" y="600" width="50" height="120" fill="#8fd14f"/>`).join('')}
  ${tufts(612, 30, '#5a9e34', 2)}${flowers(640, 10, 4)}`);

export const bgField = () => bg(`
  ${sky('#7fd0ff', '#e3f7ff')}
  ${cloud(200, 110, 0.9)}${cloud(760, 80, 0.7)}${cloud(1080, 150, 0.8)}
  ${mountains(420, '#9cc3e6', '#7aa6d1')}
  ${Array.from({ length: 20 }, (_, i) => pine(i * 70 + 20, 440 + (i % 3) * 6, 0.55 + (i % 2) * 0.1, '#3c8f55', '#1f5e36')).join('')}
  ${hill('M0 430 Q300 380 640 420 T1280 400 L1280 720 L0 720Z', '#86da6c', '#64c24e')}
  <path d="M520 720 Q560 600 700 540 Q820 490 1000 470 L1060 476 Q880 500 780 560 Q660 630 660 720Z" fill="#e6c98f" stroke="#c9a565" stroke-width="3"/>
  ${hill('M0 540 Q400 490 900 540 T1280 520 L1280 720 L0 720Z', '#64c24e', '#4aa83c')}
  ${[[90, 600], [330, 640], [1050, 620], [1180, 680]].map(([x, y]) => `<g transform="translate(${x} ${y})">${Array.from({ length: 7 }, (_, i) =>
    `<path d="M${i * 16 - 56} 20 l8 -${46 + (i % 3) * 10} l8 ${46 + (i % 3) * 10}Z" fill="${i % 2 ? '#2f8a35' : '#3fa63a'}" stroke="#1b5e20" stroke-width="2"/>`).join('')}</g>`).join('')}
  ${tufts(560, 30, '#3a9b30', 5)}${flowers(580, 12, 7, 100)}`);

export const bgBay = () => bg(`
  ${sky('#ffcf8a', '#9fdcff', 520)}
  ${sun(200, 140, 40)}${cloud(500, 90, 0.8)}${cloud(860, 130, 0.6)}
  <defs><linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4fb3e8"/><stop offset="1" stop-color="#1f7fc4"/></linearGradient></defs>
  <rect y="430" width="${W}" height="140" fill="url(#sea)"/>
  ${Array.from({ length: 10 }, (_, i) => `<path d="M${i * 140 + 10} ${452 + (i % 3) * 30} q15 -8 30 0 q15 8 30 0" fill="none" stroke="#fff" stroke-width="3" opacity=".6"/>`).join('')}
  <g transform="translate(560 440)">${cel('M-110 0 Q-60 -50 0 -46 Q70 -50 110 0Z', '#86d65e', '#4aa83c', { off: [-8, -4], stroke: 3 })}
    <path d="M10 -40 Q8 -80 18 -100" stroke="#8d5a32" stroke-width="7" fill="none"/>
    ${[-40, 10, 60, 120, 170].map(a => `<path d="M18 -100 q30 ${Math.sin(a) * 10} 50 20" stroke="#2e7d32" stroke-width="8" fill="none" transform="rotate(${a} 18 -100)" stroke-linecap="round"/>`).join('')}</g>
  ${hill('M820 560 Q900 420 1080 400 Q1240 400 1280 440 L1280 600 L820 600Z', '#7ccf5a', '#58b041')}
  <g transform="translate(1090 40)">
    ${cel('M-34 140 L-48 470 L48 470 L34 140Z', '#f2f4f5', '#c4cbd0', { off: [-12, 0] })}
    ${[210, 285, 360].map(y => `<rect x="-20" y="${y}" width="40" height="38" rx="7" fill="#81d4fa" ${line(3.5)}/>`).join('')}
    ${cel('M-130 118 Q0 160 130 118 L112 150 Q0 186 -112 150Z', '#fdd835', '#e0b000', { off: [-6, -4] })}
    ${cel('M-108 120 L-86 44 Q0 12 86 44 L108 120 Q0 148 -108 120Z', '#c4ecff', '#8fd0f2', { off: [-10, -6], hl: [-50, 70, 16, 30] })}
    ${cel('M-64 40 Q0 -26 64 40 Q0 22 -64 40Z', '#ef4b3f', '#b71c1c', { off: [-6, -4] })}
    ${cel(ell(0, 84, 24, 24), '#2f78e0', '#1a4fa8', { off: [-3, -3] })}
    <circle cx="0" cy="90" r="8" fill="#fff"/><circle cx="-10" cy="77" r="4" fill="#fff"/><circle cx="0" cy="72" r="4" fill="#fff"/><circle cx="10" cy="77" r="4" fill="#fff"/>
    <path d="M0 6 L0 -24" stroke="${INK}" stroke-width="5"/>${cel(ell(0, -30, 9, 9), '#ef4b3f', '#b71c1c', { off: [-2, -2], stroke: 3 })}
  </g>
  ${hill('M0 540 Q300 520 640 545 T1280 540 L1280 720 L0 720Z', '#8fd14f', '#74b93e')}
  ${tree(70, 560, 0.75)}${bush(300, 570, 0.6)}${flowers(560, 10, 2, 40)}
  <rect y="640" width="${W}" height="80" fill="#8f8f8f"/><rect y="640" width="${W}" height="8" fill="#bdbdbd"/>
  ${Array.from({ length: 14 }, (_, i) => `<rect x="${i * 100 + 20}" y="676" width="50" height="8" rx="3" fill="#fff"/>`).join('')}`);

export const bgPond = () => bg(`
  ${sky('#8fd8ff', '#e0f6ff', 220)}
  ${cloud(300, 70, 0.7)}${cloud(980, 60, 0.6)}
  ${Array.from({ length: 11 }, (_, i) => tree(i * 125 + 30, 210 + (i % 2) * 6, 0.6 + (i % 3) * 0.08, i % 2 ? '#4caf50' : '#66bb6a', '#2e7d32')).join('')}
  <rect y="190" width="${W}" height="40" fill="#7cc242"/>
  <defs><linearGradient id="w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3cb0dc"/><stop offset="1" stop-color="#1a78b0"/></linearGradient></defs>
  <path d="M0 220 Q640 180 1280 220 L1280 720 L0 720Z" fill="url(#w)"/>
  ${Array.from({ length: 16 }, (_, i) => `<path d="${ell((i * 233) % W, 260 + (i * 97) % 440, 60, 9)}" fill="none" stroke="#fff" stroke-width="3" opacity=".3"/>`).join('')}
  ${[[60, 720], [1220, 720], [180, 720]].map(([x, y], k) => `<g transform="translate(${x} ${y})">${Array.from({ length: 5 }, (_, i) =>
    `<path d="M${i * 10 - 20} 0 Q${i * 10 - 22} -100 ${i * 10 - 18 + (i % 2) * 8} -${150 + i * 12 + k * 10}" stroke="#4e8a2c" stroke-width="5" fill="none"/>`).join('')}
    <path d="${ell(-6, -150 - k * 10, 7, 26)}" fill="#7b4a26" ${line(2.5)}/><path d="${ell(14, -170 - k * 10, 7, 24)}" fill="#7b4a26" ${line(2.5)}/></g>`).join('')}
  ${cel('M1060 720 Q1080 660 1140 650 Q1200 650 1220 720Z', '#9e9e9e', '#6d6d6d', { off: [-8, -6] })}
  ${cel('M300 720 Q312 680 350 676 Q390 680 396 720Z', '#a9a9a9', '#757575', { off: [-6, -4] })}`);

export const bgKitchen = () => bg(`
  <rect width="${W}" height="${HT}" fill="#ffe9f3"/>
  ${Array.from({ length: 16 }, (_, i) => Array.from({ length: 7 }, (_, j) => (i + j) % 2 ? `<rect x="${i * 80}" y="${j * 80}" width="80" height="80" fill="#ffd6e8"/>` : '').join('')).join('')}
  <g transform="translate(150 70)">
    <rect width="300" height="220" rx="12" fill="#8fd8ff" ${line(5)}/>
    ${cloud(90, 90, 0.5)}${sun(240, 60, 22)}
    <path d="M150 0 L150 220 M0 110 L300 110" stroke="#fff" stroke-width="10"/>
    <rect width="300" height="220" rx="12" fill="none" ${line(5)}/>
    ${cel('M-30 -14 Q40 70 0 240 L-40 240 L-40 -14Z', '#ff8fb4', '#e0507a', { off: [-6, 0] })}
    ${cel('M330 -14 Q260 70 300 240 L340 240 L340 -14Z', '#ff8fb4', '#e0507a', { off: [-6, 0] })}
    <rect x="-50" y="-26" width="400" height="14" rx="7" fill="#a86d3a" ${line(3)}/>
  </g>
  <rect x="640" y="140" width="520" height="16" rx="4" fill="#a86d3a" ${line(3)}/>
  ${[['#ffcc80', '#e0a24a'], ['#a5d6a7', '#66bb6a'], ['#90caf9', '#5c9de0'], ['#f48fb1', '#e0507a']].map(([c, s], i) =>
    `${cel(`M${680 + i * 120} 140 L${680 + i * 120} 84 Q${680 + i * 120} 76 ${688 + i * 120} 76 L${752 + i * 120} 76 Q${760 + i * 120} 76 ${760 + i * 120} 84 L${760 + i * 120} 140Z`, c, s, { off: [-6, -4], stroke: 3.5 })}
     <rect x="${676 + i * 120}" y="66" width="88" height="14" rx="5" fill="#8d6e63" ${line(2.5)}/>`).join('')}
  ${cel('M0 480 L1280 480 L1280 720 L0 720Z', '#d09460', '#a86d3a', { off: [0, -20], stroke: 0,
    inner: Array.from({ length: 8 }, (_, i) => `<path d="M${i * 170} 520 L${i * 170} 720" stroke="#a86d3a" stroke-width="3"/>`).join('') })}
  <rect y="470" width="${W}" height="26" fill="#e8b07a" ${line(3)}/>`);

export const bgBook = () => bg(`
  <rect width="${W}" height="${HT}" fill="#c0603a"/>
  <rect x="24" y="24" width="1232" height="672" rx="36" fill="none" stroke="#f2c79a" stroke-width="4" stroke-dasharray="14 10"/>
  ${cel('M60 110 L636 110 L636 690 L60 690 Q60 690 60 680Z', '#fff8e6', '#efdcb8', { off: [-10, 0], stroke: 4 })}
  ${cel('M644 110 L1220 110 L1220 690 L644 690Z', '#fff8e6', '#efdcb8', { off: [10, 0], stroke: 4 })}
  ${Array.from({ length: 11 }, (_, i) => `<path d="M90 ${160 + i * 48} L610 ${160 + i * 48} M670 ${160 + i * 48} L1190 ${160 + i * 48}" stroke="#e8d6b0" stroke-width="2"/>`).join('')}
  <rect x="634" y="104" width="12" height="592" fill="#d9b98a"/>`);

export const bgSea = () => {
  const coral = (x: number, y: number, s: number, c: string, cs: string) => `<g transform="translate(${x} ${y}) scale(${s})">
    ${cel('M0 0 L-4 -50 Q-20 -60 -30 -90 Q-34 -106 -24 -108 Q-16 -108 -14 -92 Q-10 -74 -2 -66 L-2 -100 Q-4 -122 6 -124 Q16 -122 12 -100 L10 -66 Q20 -80 22 -100 Q24 -114 34 -112 Q42 -108 38 -92 Q34 -68 12 -48 L8 0Z', c, cs, { off: [-4, -4], stroke: 3.5 })}</g>`;
  const fan = (x: number, y: number, c: string) => `<g transform="translate(${x} ${y})">
    ${cel('M0 0 Q-60 -40 -50 -100 Q0 -130 50 -100 Q60 -40 0 0Z', c, '#c2185b', { off: [-6, -6], stroke: 3.5,
      inner: [-40, -20, 0, 20, 40].map(a => `<path d="M0 0 L${a} -110" stroke="#fff" stroke-width="2" opacity=".4"/>`).join('') })}</g>`;
  const starfish = (x: number, y: number) => `<g transform="translate(${x} ${y})">${cel(
    Array.from({ length: 10 }, (_, i) => { const a = (Math.PI / 5) * i - Math.PI / 2, r = i % 2 ? 9 : 22; return `${i ? 'L' : 'M'}${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}`; }).join(' ') + 'Z',
    '#ff8a65', '#e64a19', { off: [-3, -3], stroke: 3 })}</g>`;
  return bg(`
    ${sky('#5ccbf5', '#0f5a9c')}
    ${Array.from({ length: 6 }, (_, i) => `<path d="M${i * 240 - 40} 0 L${i * 240 + 60} 0 L${i * 240 + 200} 720 L${i * 240 + 120} 720Z" fill="#fff" opacity=".06"/>`).join('')}
    <path d="M0 520 Q160 420 340 500 Q500 440 640 510 Q860 430 1040 500 Q1180 450 1280 490 L1280 720 L0 720Z" fill="#0d4a80" opacity=".5"/>
    ${cel('M0 640 Q200 600 420 630 T860 620 T1280 630 L1280 720 L0 720Z', '#f7dc9b', '#d9b66c', { off: [0, -10], stroke: 0 })}
    ${[[70, 680], [1000, 690], [1190, 676]].map(([x, y]) => `<path d="M${x} ${y} C${x - 30} ${y - 80} ${x + 30} ${y - 120} ${x} ${y - 210} C${x + 40} ${y - 120} ${x - 10} ${y - 60} ${x + 20} ${y}Z" fill="#2e9d4a" stroke="#1b5e20" stroke-width="3"/>`).join('')}
    ${coral(200, 680, 1, '#ff7aa2', '#d0406e')}${coral(1110, 690, 0.9, '#ffb74d', '#e08a1a')}${coral(860, 690, 0.7, '#b388ff', '#7c4dff')}
    ${fan(330, 690, '#ff5c8a')}${fan(960, 695, '#ff8fb4')}
    ${starfish(520, 676)}${starfish(760, 690)}
    ${cel('M600 700 Q610 660 650 656 Q690 660 700 700Z', '#90a4ae', '#607d8b', { off: [-6, -4] })}
    ${[[150, 300], [1160, 220], [620, 140], [420, 420]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="10" fill="none" stroke="#fff" stroke-width="2" opacity=".5"/><circle cx="${x + 14}" cy="${y - 24}" r="6" fill="none" stroke="#fff" stroke-width="2" opacity=".5"/>`).join('')}`);
};

export const bgGarden = () => bg(`
  ${sky('#7fd3ff', '#d4f3ff', 380)}
  ${sun(1120, 100)}${cloud(250, 90, 0.9)}${cloud(720, 70, 0.7)}
  ${tree(120, 300, 0.8)}${tree(1180, 300, 0.9)}${pine(980, 300, 0.6)}
  <rect y="300" width="${W}" height="60" fill="#b07d4f"/>
  ${Array.from({ length: 22 }, (_, i) => cel(`M${i * 60 + 6} 360 L${i * 60 + 6} 250 L${i * 60 + 26} 230 L${i * 60 + 46} 250 L${i * 60 + 46} 360Z`, '#fffaf0', '#d9cfba', { off: [-6, 0], stroke: 3 })).join('')}
  ${Array.from({ length: 11 }, (_, i) => bush(i * 120 + 40, 372, 0.55, i % 2 ? '#66bb6a' : '#7bd86b', '#388e3c')).join('')}
  ${flowers(330, 18, 3, 30)}
  <rect y="370" width="${W}" height="350" fill="#7cc242"/>
  ${Array.from({ length: 13 }, (_, i) => `<rect x="${i * 100}" y="370" width="50" height="350" fill="#8fd14f"/>`).join('')}
  ${tufts(400, 30, '#5a9e34', 6)}`);
