// How to write each lowercase letter: its strokes, in order, each a path in the direction the
// pen moves (standard manuscript formation: "a" is around, then up-and-down). Coordinates are
// in a writing grid where the ascender line is y=0, the midline y=50, the baseline y=100 and
// the descender line y=140. A one-point stroke is a dot (i, j).
// No imports (pure data, tested in tests/letters.test.ts).

export type Pt = [number, number];
export type Stroke = Pt[];

const line = (x1: number, y1: number, x2: number, y2: number): Pt[] => [[x1, y1], [x2, y2]];
/** Elliptical arc from angle a0 to a1 (degrees; 0 = right, 90 = down; increasing is clockwise). */
function arc(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number): Pt[] {
  const n = Math.max(2, Math.ceil(Math.abs(a1 - a0) / 6));
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)] as Pt;
  });
}
/** Join parts that meet end to start into one stroke. */
const path = (...parts: Pt[][]): Stroke => parts.flat();
const dot = (x: number, y: number): Stroke => [[x, y]];

// The round bowl most letters share ("around"), starting near 1 o'clock and going counterclockwise.
const bowl = () => arc(30, 75, 22, 25, -40, -400);

export const LETTERS: Record<string, Stroke[]> = {
  a: [bowl(), line(52, 50, 52, 100)],
  b: [line(10, 0, 10, 100), arc(32, 75, 22, 25, 180, 540)],
  c: [arc(32, 75, 22, 25, -40, -320)],
  d: [bowl(), line(52, 0, 52, 100)],
  e: [path(line(10, 75, 54, 75), arc(32, 75, 22, 25, 0, -320))],
  f: [path(arc(42, 18, 12, 12, -20, -180), line(30, 18, 30, 100)), line(16, 50, 46, 50)],
  g: [bowl(), path(line(52, 50, 52, 122), arc(38, 122, 14, 16, 0, 160))],
  h: [line(10, 0, 10, 100), path(arc(31, 72, 21, 22, 180, 360), line(52, 72, 52, 100))],
  i: [line(30, 50, 30, 100), dot(30, 28)],
  j: [path(line(38, 50, 38, 122), arc(24, 122, 14, 16, 0, 160)), dot(38, 28)],
  k: [line(10, 0, 10, 100), [[48, 50], [12, 78], [50, 100]]],
  l: [line(30, 0, 30, 100)],
  m: [line(8, 50, 8, 100), path(arc(22, 70, 14, 20, 180, 360), line(36, 70, 36, 100)), path(arc(50, 70, 14, 20, 180, 360), line(64, 70, 64, 100))],
  n: [line(10, 50, 10, 100), path(arc(31, 72, 21, 22, 180, 360), line(52, 72, 52, 100))],
  o: [arc(32, 75, 22, 25, -90, -450)],
  p: [line(10, 50, 10, 140), arc(32, 75, 22, 25, 180, 540)],
  q: [bowl(), line(52, 50, 52, 140)],
  r: [line(10, 50, 10, 100), arc(30, 72, 20, 22, 180, 300)],
  s: [path(arc(30, 62.5, 20, 12.5, -30, -270), arc(30, 87.5, 20, 12.5, -90, 150))],
  t: [line(30, 12, 30, 100), line(14, 50, 46, 50)],
  u: [path(line(10, 50, 10, 78), arc(31, 78, 21, 22, 180, 0), line(52, 78, 52, 50)), line(52, 50, 52, 100)],
  v: [[[8, 50], [30, 100], [52, 50]]],
  w: [[[6, 50], [20, 100], [36, 62], [52, 100], [66, 50]]],
  x: [line(10, 50, 52, 100), line(52, 50, 10, 100)],
  y: [line(10, 50, 31, 100), line(52, 50, 20, 140)],
  z: [[[10, 50], [52, 50], [10, 100], [52, 100]]],
};

/** Points every `step` grid units along a stroke (so tracing progress can be measured evenly). */
export function resample(stroke: Stroke, step = 2): Pt[] {
  if (stroke.length === 1) return [stroke[0]];
  const out: Pt[] = [stroke[0]];
  let carry = 0;
  for (let i = 1; i < stroke.length; i++) {
    const [x0, y0] = stroke[i - 1], [x1, y1] = stroke[i];
    const len = Math.hypot(x1 - x0, y1 - y0);
    let d = step - carry;
    while (d <= len) {
      out.push([x0 + ((x1 - x0) * d) / len, y0 + ((y1 - y0) * d) / len]);
      d += step;
    }
    carry = len - (d - step);
  }
  const last = stroke[stroke.length - 1];
  if (Math.hypot(last[0] - out[out.length - 1][0], last[1] - out[out.length - 1][1]) > step / 4) out.push(last);
  return out;
}

/** Bounding box of a letter's strokes, in grid units. */
export function bounds(strokes: Stroke[]) {
  const pts = strokes.flat();
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
}
