import { test, expect } from 'vitest';
import { REGIONS, CHEST_STARS, lessonsOf, regionOf, explorerAt } from '../src/data/map';
import { LESSON_NUMS } from '../src/data/curriculum';
import { STICKERS } from '../src/data/stickers';
import { LINES } from '../src/lines';

test('the lands cover every lesson exactly once, in order', () => {
  const covered = REGIONS.flatMap(lessonsOf);
  expect(covered).toEqual(LESSON_NUMS);
  for (const r of REGIONS) expect(lessonsOf(r).length, r.id).toBeGreaterThanOrEqual(3);
  expect(regionOf(1).id).toBe('meadow');
  expect(regionOf(82).id).toBe('moon');
});

test('every land has a chest, a friend sticker and spoken lines', () => {
  expect(CHEST_STARS).toHaveLength(REGIONS.length);
  for (let i = 1; i < CHEST_STARS.length; i++) expect(CHEST_STARS[i]).toBeGreaterThan(CHEST_STARS[i - 1]);
  for (const r of REGIONS) {
    expect(STICKERS.some(s => s.id === r.sticker), r.sticker).toBe(true);
    expect(LINES.lands[r.id as keyof typeof LINES.lands], r.id).toBeTruthy();
    expect(LINES.gates[r.gate], r.gate).toBeTruthy();
  }
});

test('the explorer waits at a gate that has been reached but not won', () => {
  expect(explorerAt(4, [])).toEqual({ lesson: 4 });
  expect(explorerAt(12, [])).toEqual({ gate: REGIONS[0] }); // past the meadow, rocket not built yet
  expect(explorerAt(12, ['meadow'])).toEqual({ lesson: 12 });
  expect(explorerAt(30, ['meadow'])).toEqual({ gate: REGIONS[1] }); // gates are won in order
  // The last land's gate opens once the whole course is done (there's no lesson after the last).
  const allButLast = REGIONS.slice(0, -1).map(r => r.id);
  expect(explorerAt(82, allButLast)).toEqual({ lesson: 82 });
  expect(explorerAt(82, allButLast, true)).toEqual({ gate: REGIONS[REGIONS.length - 1] });
  expect(explorerAt(82, REGIONS.map(r => r.id), true)).toEqual({ lesson: 82 });
});
