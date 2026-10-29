import { svg, line, cel, ell, eye, shadow, isBlinking, shut, INK } from './util';

const G = '#8bd44a', GS = '#55a02c', GD = '#3b7d22', LEAF = '#79c843', LEAFS = '#4b9330';

const stem = (x: number, top: number, bottom: number) => `
  <path d="M${x} ${top} C${x - 6} ${top + 40} ${x + 8} ${bottom - 30} ${x} ${bottom}" fill="none" stroke="${INK}" stroke-width="16" stroke-linecap="round"/>
  <path d="M${x} ${top} C${x - 6} ${top + 40} ${x + 8} ${bottom - 30} ${x} ${bottom}" fill="none" stroke="${GS}" stroke-width="10" stroke-linecap="round"/>
  <path d="M${x - 2} ${top} C${x - 8} ${top + 40} ${x + 4} ${bottom - 30} ${x - 2} ${bottom}" fill="none" stroke="${G}" stroke-width="4" stroke-linecap="round"/>`;

const baseLeaves = (cx: number, y: number) =>
  cel(`M${cx} ${y} C${cx - 30} ${y - 34} ${cx - 76} ${y - 24} ${cx - 92} ${y - 4} C${cx - 64} ${y + 12} ${cx - 22} ${y + 12} ${cx} ${y}Z`, LEAF, LEAFS,
    { off: [-4, -6], inner: `<path d="M${cx - 4} ${y - 2} Q${cx - 44} ${y - 14} ${cx - 82} ${y - 6}" fill="none" stroke="${GD}" stroke-width="3" opacity=".6"/>` })
  + cel(`M${cx} ${y} C${cx + 32} ${y - 36} ${cx + 80} ${y - 28} ${cx + 96} ${y - 10} C${cx + 70} ${y + 8} ${cx + 28} ${y + 12} ${cx} ${y}Z`, LEAF, LEAFS,
    { off: [-4, -6], inner: `<path d="M${cx + 4} ${y - 2} Q${cx + 48} ${y - 16} ${cx + 86} ${y - 12}" fill="none" stroke="${GD}" stroke-width="3" opacity=".6"/>` });

export function peashooter() {
  return svg('0 0 230 250', `
    ${shadow(96, 242, 76, 10)}
    ${stem(92, 132, 236)}
    ${baseLeaves(92, 236)}
    ${cel('M44 78 C8 52 0 96 16 120 C22 102 34 96 48 100Z', LEAF, LEAFS, { off: [-3, -4] })}
    ${cel('M40 102 C12 106 10 140 28 152 C28 134 38 122 52 120Z', LEAF, LEAFS, { off: [-3, -4] })}
    ${cel('M116 54 L178 44 C196 44 200 100 186 104 L116 112Z', G, GS, { off: [-4, -8], hl: [150, 54, 24, 4] })}
    ${cel(ell(84, 82, 54, 54), G, GS, { off: [-9, -11], hl: [62, 50, 22, 12] })}
    ${cel(ell(188, 74, 14, 30), GS, GD, { off: [2, 0], stroke: 4.5 })}
    <path d="${ell(190, 74, 7, 19)}" fill="#173d10"/>
    ${eye(96, 62, 11.5)}${eye(124, 58, 10)}`);
}

export function sunflower(happy = true) {
  const petal = (i: number) => {
    const a = i * 22.5;
    return `<g transform="rotate(${a} 110 100)">${cel('M110 26 C124 30 128 54 110 72 C92 54 96 30 110 26Z', '#ffd92e', '#f2a600', { off: [-3, -4], stroke: 3 })}</g>`;
  };
  const eyes = isBlinking() ? shut(92, 94, 8) + shut(128, 94, 8) : eye(92, 94, 8) + eye(128, 94, 8);
  return svg('0 0 220 280', `
    ${shadow(110, 272, 74, 10)}
    ${stem(110, 148, 266)}
    ${baseLeaves(110, 264)}
    ${Array.from({ length: 16 }, (_, i) => petal(i)).join('')}
    ${cel(ell(110, 100, 50, 50), '#f9a935', '#d9741a', { off: [-7, -8], hl: [92, 76, 18, 9] })}
    <circle cx="110" cy="100" r="40" fill="none" stroke="#c96a12" stroke-width="2" stroke-dasharray="3 6" opacity=".6"/>
    ${eyes}
    <circle cx="80" cy="114" r="8" fill="#ff7b5c" opacity=".55"/><circle cx="140" cy="114" r="8" fill="#ff7b5c" opacity=".55"/>
    ${happy
      ? `<path d="M88 112 Q110 144 132 112 Q110 123 88 112Z" fill="#5a2a10" ${line(3.5)}/><path d="M100 127 Q110 135 120 127Z" fill="#ff8a7a"/>`
      : `<path d="M92 126 Q110 112 128 126" fill="none" ${line(4.5)}/>`}`);
}

export function wallnut() {
  const N = '#d9a05a', NS = '#a76c2c';
  const eyes = isBlinking() ? shut(68, 98, 15) + shut(114, 98, 15)
    : `<path d="${ell(68, 98, 15, 19)}" fill="#fff" ${line(3)}/><circle cx="74" cy="102" r="7" fill="#111"/><circle cx="71" cy="98" r="2.5" fill="#fff"/>
       <path d="${ell(114, 98, 15, 19)}" fill="#fff" ${line(3)}/><circle cx="120" cy="102" r="7" fill="#111"/><circle cx="117" cy="98" r="2.5" fill="#fff"/>`;
  return svg('0 0 180 210', `
    ${shadow(90, 202, 70, 9)}
    ${cel('M90 10 C142 10 170 52 168 108 C166 164 134 196 90 196 C46 196 14 164 12 108 C10 52 38 10 90 10Z', N, NS, {
      off: [-10, -10], hl: [58, 44, 22, 11],
      inner: `<path d="M40 46 Q52 60 44 78 M140 60 Q126 76 136 96 M60 152 Q74 162 70 178 M128 140 Q120 156 132 168 M86 24 Q92 36 84 44 M30 120 Q40 128 34 140" fill="none" stroke="#6b3d12" stroke-width="3.5" opacity=".55"/>` })}
    ${eyes}
    <path d="M50 74 Q66 64 82 72 M98 72 Q114 64 130 74" fill="none" ${line(5)}/>
    <path d="M74 142 Q92 132 110 142" fill="none" ${line(4.5)}/>`);
}

export function zombie(cone = false) {
  const SK = '#a9c49a', SKS = '#7e9a70', CT = '#7d5b40', CTS = '#573c27', PT = '#655546', PTS = '#45382c';
  const eyes = isBlinking() ? shut(94, 74, 15) + shut(130, 76, 10)
    : `<circle cx="94" cy="74" r="16" fill="#fff" ${line(3)}/><circle cx="88" cy="76" r="5" fill="#111"/>
       <circle cx="130" cy="76" r="10" fill="#fff" ${line(3)}/><circle cx="126" cy="78" r="3.5" fill="#111"/>
       <path d="M119 70 Q130 63 141 72" fill="${SK}" ${line(3)}/>`;
  return svg('0 0 200 300', `
    ${shadow(112, 292, 62, 9)}
    ${cel('M92 222 L86 284 L104 284 L108 230Z', PT, PTS, { off: [-3, -3] })}
    ${cel('M118 226 L126 280 L144 278 L136 222Z', PT, PTS, { off: [-3, -3] })}
    ${cel('M70 286 Q86 274 106 284 L106 293 L70 293Z', '#3a3a3a', '#1f1f1f', { off: [-2, -2], stroke: 3 })}
    ${cel('M122 282 Q140 270 158 280 L158 289 L122 289Z', '#3a3a3a', '#1f1f1f', { off: [-2, -2], stroke: 3 })}
    ${cel('M78 128 Q110 116 142 128 L150 232 L136 228 L130 238 L118 230 L104 240 L92 230 L76 234Z', CT, CTS, { off: [-8, -6] })}
    ${cel('M100 128 L112 170 L124 128Z', '#f4f4f4', '#cfcfcf', { off: [-2, -2], stroke: 3 })}
    ${cel('M110 138 L104 178 L112 190 L120 178 L114 138Z', '#d32f2f', '#9a1b1b', { off: [-2, -2], stroke: 2.5 })}
    ${cel('M100 128 L94 180 L110 170Z M124 128 L132 180 L114 170Z', '#6e4f36', '#4d3523', { off: [-2, -2], stroke: 3 })}
    <rect x="132" y="190" width="12" height="10" fill="#c7a26b" ${line(2)} transform="rotate(8 138 195)"/>
    ${cel('M84 142 L22 136 L18 152 L84 160Z', CT, CTS, { off: [-3, -4] })}
    ${cel('M86 168 L28 166 L26 182 L86 186Z', CT, CTS, { off: [-3, -4] })}
    <path d="M22 136 L16 140 L20 146 L16 152 L22 152Z M28 166 L22 170 L26 175 L22 182 L28 182Z" fill="#eee" ${line(2)}/>
    ${cel(ell(10, 144, 12, 9), SK, SKS, { off: [-2, -2], stroke: 3.5 })}
    ${cel(ell(16, 174, 12, 9), SK, SKS, { off: [-2, -2], stroke: 3.5 })}
    ${cel('M110 22 C148 22 160 52 158 82 C156 112 138 130 110 130 C82 130 64 112 62 82 C60 52 72 22 110 22Z', SK, SKS, { off: [-8, -8], hl: [88, 48, 14, 7] })}
    ${cone
      ? `<g transform="rotate(-8 112 30)">
          ${cel('M72 44 L108 -2 L118 -2 L152 40 Q112 58 72 44Z', '#ff9a3c', '#e06100', { off: [-5, -4] })}
          <path d="M88 26 Q112 34 136 24 M98 12 Q112 17 126 11" fill="none" stroke="#fff" stroke-width="6"/>
          ${cel('M60 44 Q112 62 162 40 L164 51 Q112 74 58 55Z', '#ef6c00', '#bf4f00', { off: [-3, -3], stroke: 3.5 })}</g>`
      : `<path d="M86 30 Q92 8 104 26 Q108 4 118 24 Q128 6 132 30" fill="none" ${line(4.5)}/>`}
    ${eyes}
    <path d="M84 108 L92 102 L98 110 L106 102 L114 110 L122 102 L130 108 Q108 124 84 108Z" fill="#4a2a2a" ${line(3)}/>
    <rect x="99" y="104" width="7" height="7" fill="#f6f0d0" stroke="${INK}" stroke-width="1.5"/>
    <circle cx="80" cy="96" r="1.6" fill="#5b6b50"/><circle cx="140" cy="98" r="1.6" fill="#5b6b50"/><circle cx="136" cy="104" r="1.6" fill="#5b6b50"/>`);
}

export function pea() {
  return svg('0 0 40 40', cel(ell(20, 20, 16, 16), G, GS, { off: [-3, -4], stroke: 2.5, hl: [14, 13, 5, 3] }));
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
