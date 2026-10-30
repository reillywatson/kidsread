import { test, expect } from 'vitest';
import { LETTERS, CAPITALS, resample, bounds } from '../src/data/letters';

const near = (a: number[], b: number[], d = 1.5) => Math.hypot(a[0] - b[0], a[1] - b[1]) <= d;

test('every lowercase letter has strokes inside the writing grid', () => {
  expect(Object.keys(LETTERS).sort().join('')).toBe('abcdefghijklmnopqrstuvwxyz');
  for (const [ch, strokes] of Object.entries(LETTERS)) {
    expect(strokes.length, ch).toBeGreaterThan(0);
    const b = bounds(strokes);
    expect(b.x0, ch).toBeGreaterThanOrEqual(0);
    expect(b.x1, ch).toBeLessThanOrEqual(76);
    expect(b.y0, ch).toBeGreaterThanOrEqual(0);
    expect(b.y1, ch).toBeLessThanOrEqual(140);
  }
});

test('joined strokes are continuous (no jumps inside a stroke)', () => {
  for (const [ch, strokes] of Object.entries(LETTERS)) {
    for (const s of strokes) {
      if (s.length === 1) continue;
      const pts = resample(s, 2);
      for (let i = 1; i < pts.length; i++) expect(near(pts[i - 1], pts[i], 2.2), `${ch} at ${i}`).toBe(true);
    }
  }
});

test('letters sit on the right lines', () => {
  const b = (ch: string) => bounds(LETTERS[ch]);
  for (const tall of 'bdhklf') expect(b(tall).y0, tall).toBeLessThanOrEqual(20); // ascenders
  for (const low of 'gjpqy') expect(b(low).y1, low).toBeGreaterThan(115); // descenders
  for (const small of 'acemnorsuvwxz') {
    expect(b(small).y0, small).toBeGreaterThanOrEqual(49);
    expect(b(small).y1, small).toBeLessThanOrEqual(101);
  }
});

test('circles close and "a" starts near 1 o\'clock going counterclockwise', () => {
  const o = LETTERS.o[0];
  expect(near(o[0], o[o.length - 1])).toBe(true);
  const a = LETTERS.a[0];
  expect(a[0][0]).toBeGreaterThan(40); // starts on the right
  expect(a[3][1]).toBeLessThan(a[0][1]); // heads up toward the top first
});

test('capitals: every letter, standing on the baseline, continuous strokes', () => {
  expect(Object.keys(CAPITALS).sort().join('')).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  for (const [ch, strokes] of Object.entries(CAPITALS)) {
    const b = bounds(strokes);
    expect(b.y0, ch).toBeGreaterThanOrEqual(-1);
    expect(b.y0, ch).toBeLessThanOrEqual(2); // reaches the top line
    expect(b.y1, ch).toBeGreaterThanOrEqual(98); // reaches the baseline
    expect(b.y1, ch).toBeLessThanOrEqual(106);
    expect(b.x0, ch).toBeGreaterThanOrEqual(0);
    expect(b.x1, ch).toBeLessThanOrEqual(76);
    for (const s of strokes) {
      const pts = resample(s, 2);
      for (let i = 1; i < pts.length; i++) expect(near(pts[i - 1], pts[i], 2.2), `${ch} at ${i}`).toBe(true);
    }
  }
});
