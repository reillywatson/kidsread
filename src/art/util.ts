// Helpers for writing SVG art as strings. Each texture is its own SVG document,
// so gradient ids only need to be unique within one drawing.

export const svg = (vb: string, body: string) =>
  `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;

/** Soft, slightly warm outline used across all characters. */
export const INK = '#2a1d14';
export const line = (w = 4, color = INK) => `stroke="${color}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

/** Radial shading: light from the upper left. */
export const shade = (id: string, light: string, dark: string, cx = 0.35, cy = 0.3) =>
  `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="0.8"><stop offset="0" stop-color="${light}"/><stop offset="1" stop-color="${dark}"/></radialGradient>`;

export const vgrad = (id: string, top: string, bottom: string) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient>`;

/** Glossy cartoon eye: dark iris, big highlight. */
export const eye = (x: number, y: number, r: number, iris = '#1a1a1a', rx = r, ry = r * 1.15) => `
  <ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${iris}"/>
  <ellipse cx="${x - r * 0.3}" cy="${y - r * 0.4}" rx="${r * 0.42}" ry="${r * 0.48}" fill="#fff"/>
  <circle cx="${x + r * 0.35}" cy="${y + r * 0.45}" r="${r * 0.18}" fill="#fff" opacity=".8"/>`;

/** Eye with white sclera and colored iris (pups, zombies). */
export const eyeWhite = (x: number, y: number, r: number, iris: string, look = 0) => `
  <ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 1.12}" fill="#fff" ${line(2.5)}/>
  <circle cx="${x + look}" cy="${y + r * 0.1}" r="${r * 0.68}" fill="${iris}"/>
  <circle cx="${x + look}" cy="${y + r * 0.12}" r="${r * 0.38}" fill="#111"/>
  <circle cx="${x + look - r * 0.25}" cy="${y - r * 0.2}" r="${r * 0.22}" fill="#fff"/>`;

export const shadow = (cx: number, cy: number, rx: number, ry = rx * 0.18) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#000" opacity=".18"/>`;

export const shine = (cx: number, cy: number, rx: number, ry: number, rot = -30) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff" opacity=".35" transform="rotate(${rot} ${cx} ${cy})"/>`;
