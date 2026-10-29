// Scene backgrounds, 1280×720.
import { svg } from './util';

const W = 1280, HT = 720;
const bg = (body: string) => svg(`0 0 ${W} ${HT}`, body);
const sun = (x: number, y: number) => `<g transform="translate(${x} ${y})">
  ${Array.from({ length: 12 }, (_, i) => `<path d="M0 -78 L9 -54 L-9 -54Z" fill="#ffd54f" transform="rotate(${i * 30})"/>`).join('')}
  <circle r="46" fill="#ffe14d" stroke="#ffc107" stroke-width="5"/></g>`;
const flowers = (y: number, n: number, seed = 1) => Array.from({ length: n }, (_, i) => {
  const x = (i * 197 + seed * 61) % 1280, c = ['#ff6b8a', '#ffd21f', '#ffffff', '#b388ff'][(i + seed) % 4];
  return `<g transform="translate(${x} ${y + ((i * 37) % 50)})"><path d="M0 0 L0 22" stroke="#2e7d32" stroke-width="3"/>
    ${[0, 72, 144, 216, 288].map(a => `<circle cx="${Math.cos(a * Math.PI / 180) * 7}" cy="${Math.sin(a * Math.PI / 180) * 7}" r="6" fill="${c}"/>`).join('')}<circle r="4" fill="#ffb300"/></g>`;
}).join('');
const clouds = (y: number) => [120, 520, 940].map((x, i) =>
  `<g fill="#fff" opacity=".9" transform="translate(${x} ${y + (i % 2) * 40})"><ellipse cx="0" cy="0" rx="70" ry="28"/><ellipse cx="45" cy="-18" rx="45" ry="30"/><ellipse cx="90" cy="0" rx="60" ry="24"/></g>`).join('');

export const bgHome = () => bg(`
  <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fd3ff"/><stop offset="1" stop-color="#c9f0ff"/></linearGradient></defs>
  <rect width="${W}" height="${HT}" fill="url(#s)"/>
  ${['#ff5c5c', '#ffa53b', '#ffe14d', '#5cd65c', '#4fa8ff', '#9a6bff'].map((c, i) =>
    `<path d="M${140 + i * 22} 720 A${500 - i * 22} ${470 - i * 22} 0 0 1 ${1140 - i * 22} 720" stroke="${c}" stroke-width="22" fill="none" opacity=".55"/>`).join('')}
  ${sun(1010, 200)}${clouds(110)}
  <path d="M0 600 Q320 520 640 590 T1280 570 L1280 720 L0 720Z" fill="#6fd16f"/>
  <path d="M0 650 Q400 600 800 660 T1280 640 L1280 720 L0 720Z" fill="#4cbf4c"/>${flowers(610, 14)}`);

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
  <rect width="${W}" height="${HT}" fill="url(#s)"/>${sun(1160, 100)}${clouds(150)}
  <rect y="600" width="${W}" height="120" fill="#7cc242"/>
  ${Array.from({ length: 12 }, (_, i) => `<rect x="${i * 110}" y="600" width="55" height="120" fill="#93d250"/>`).join('')}`);

export const bgField = () => bg(`
  <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8ad7ff"/><stop offset="1" stop-color="#e3f7ff"/></linearGradient></defs>
  <rect width="${W}" height="${HT}" fill="url(#s)"/>${clouds(90)}
  <path d="M0 430 Q300 360 640 420 T1280 400 L1280 720 L0 720Z" fill="#7bd86b"/>
  <path d="M0 520 Q400 470 900 520 T1280 500 L1280 720 L0 720Z" fill="#5bc25b"/>${flowers(540, 10, 3)}
  ${Array.from({ length: 26 }, (_, i) => `<path d="M${i * 50} 720 l14 -60 l10 40 l12 -70 l10 60 l12 -40 l4 70Z" fill="#3fa63f"/>`).join('')}`);

export const bgBay = () => bg(`
  <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffcf8a"/><stop offset="1" stop-color="#9fdcff"/></linearGradient></defs>
  <rect width="${W}" height="${HT}" fill="url(#s)"/>${clouds(80)}
  <rect y="470" width="${W}" height="80" fill="#3da5e0"/>
  <g transform="translate(1090 40)">
    <path d="M-36 120 L-46 520 L46 520 L36 120Z" fill="#eceff1" stroke="#37474f" stroke-width="5"/>
    ${[200, 280, 360, 440].map(y => `<rect x="-20" y="${y}" width="40" height="34" rx="6" fill="#81d4fa" stroke="#37474f" stroke-width="4"/>`).join('')}
    <path d="M-120 110 Q0 150 120 110 L104 140 Q0 172 -104 140Z" fill="#fbc02d" stroke="#37474f" stroke-width="5"/>
    <path d="M-100 112 L-80 40 Q0 10 80 40 L100 112 Q0 140 -100 112Z" fill="#b3e5fc" stroke="#37474f" stroke-width="5"/>
    <path d="M-60 34 Q0 -20 60 34 Q0 18 -60 34Z" fill="#e53935" stroke="#37474f" stroke-width="5"/>
    <circle cx="0" cy="78" r="22" fill="#1e88e5" stroke="#fff" stroke-width="5"/>
    <circle cx="0" cy="84" r="7" fill="#fff"/><circle cx="-9" cy="72" r="3.5" fill="#fff"/><circle cx="0" cy="68" r="3.5" fill="#fff"/><circle cx="9" cy="72" r="3.5" fill="#fff"/>
    <path d="M0 4 L0 -24" stroke="#37474f" stroke-width="5"/><circle cx="0" cy="-28" r="7" fill="#e53935" stroke="#37474f" stroke-width="3"/>
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


export const bgSea = () => bg(`
  <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4fc3f7"/><stop offset=".6" stop-color="#0277bd"/><stop offset="1" stop-color="#01579b"/></linearGradient></defs>
  <rect width="${W}" height="${HT}" fill="url(#s)"/>
  ${Array.from({ length: 6 }, (_, i) => `<path d="M${i * 240 - 40} 0 L${i * 240 + 60} 0 L${i * 240 + 200} 720 L${i * 240 + 120} 720Z" fill="#fff" opacity=".05"/>`).join('')}
  <path d="M0 650 Q200 610 420 640 T860 630 T1280 640 L1280 720 L0 720Z" fill="#f2d48f"/>
  ${[80, 260, 1010, 1180].map((x, i) => `<path d="M${x} 720 C${x - 30} 640 ${x + 30} 600 ${x} ${520 - i * 20} C${x + 40} 600 ${x - 10} 660 ${x + 20} 720Z" fill="#2e7d32" opacity=".9"/>`).join('')}
  <circle cx="1120" cy="660" r="16" fill="#ff8a65"/><circle cx="1140" cy="672" r="10" fill="#ffab91"/>`);

export const bgGarden = () => bg(`
  <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fd3ff"/><stop offset="1" stop-color="#d4f3ff"/></linearGradient></defs>
  <rect width="${W}" height="${HT}" fill="url(#s)"/>${clouds(80)}
  <rect y="300" width="${W}" height="60" fill="#b07d4f"/>
  ${Array.from({ length: 22 }, (_, i) => `<path d="M${i * 60 + 6} 360 L${i * 60 + 6} 250 L${i * 60 + 26} 230 L${i * 60 + 46} 250 L${i * 60 + 46} 360Z" fill="#f5f0e1" stroke="#c9b99a" stroke-width="3"/>`).join('')}
  <rect y="360" width="${W}" height="360" fill="#7cc242"/>
  ${Array.from({ length: 12 }, (_, i) => `<rect x="${i * 110}" y="360" width="55" height="360" fill="#8fd14f"/>`).join('')}`);
