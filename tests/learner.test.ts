import { test, expect } from 'vitest';
import { Learner, INTERVALS, type LearnerState } from '../src/learner';
import { LAST_LESSON, itemsUpTo, lessonInfo } from '../src/data/curriculum';

function make(start = 0) {
  let saved: LearnerState | null = null;
  let now = start;
  const l = new Learner({ get: () => saved, set: v => { saved = JSON.parse(JSON.stringify(v)); } }, () => now);
  return { l, tick: (ms: number) => { now += ms; }, now: () => now, saved: () => saved };
}

test('correct answers promote only once the item is due', () => {
  const { l, tick } = make();
  l.record('g:a', 'correct');
  expect(l.s.items['g:a'].box).toBe(1);
  l.record('g:a', 'correct'); // too soon: no extra credit
  expect(l.s.items['g:a'].box).toBe(1);
  tick(INTERVALS[1]);
  l.record('g:a', 'correct');
  expect(l.s.items['g:a'].box).toBe(2);
});

test('a miss drops the item back and makes it due now', () => {
  const { l, tick, now } = make();
  l.record('g:m', 'correct'); tick(INTERVALS[1]);
  l.record('g:m', 'correct'); tick(INTERVALS[2]);
  l.record('g:m', 'correct');
  expect(l.s.items['g:m'].box).toBe(3);
  l.record('g:m', 'wrong');
  expect(l.s.items['g:m'].box).toBe(1);
  expect(l.s.items['g:m'].due).toBe(now());
});

test('tiers rise with accuracy and fall with struggle', () => {
  const { l } = make();
  for (let i = 0; i < 8; i++) l.pushRecent('word', true);
  expect(l.adjustTier('word')).toBe(1);
  expect(l.tier('word')).toBe(1);
  for (let i = 0; i < 12; i++) l.pushRecent('word', false);
  expect(l.adjustTier('word')).toBe(-1);
  expect(l.tier('word')).toBe(0);
});

test('lesson advances once its new grapheme is mastered', () => {
  const { l, tick } = make();
  expect(l.lesson).toBe(1);
  expect(l.checkLessonUp()).toBeNull();
  l.record('g:a', 'correct'); tick(INTERVALS[1]);
  l.record('g:a', 'correct');
  expect(l.checkLessonUp()).toBe(2);
  expect(l.takeLevelUp()).toBe(2);
  expect(l.takeLevelUp()).toBeNull();
});

test('lessons with words need some of the words too', () => {
  const { l, tick } = make();
  l.setLesson(4); // t: at, sat, mat + heart words the, a
  const master = (id: string) => { l.record(id, 'correct'); tick(INTERVALS[1]); l.record(id, 'correct'); };
  master('g:t');
  expect(l.checkLessonUp()).toBeNull();
  master('w:at'); master('w:sat');
  l.record('h:the', 'correct'); l.record('h:a', 'correct');
  expect(l.checkLessonUp()).toBe(6);
});

test('pick favors new items from the current lesson, then due reviews', () => {
  const { l, tick } = make();
  l.setLesson(9);
  // Everything up to lesson 8 is known and due.
  for (const g of ['a', 'm', 's', 't', 'p', 'f', 'i']) l.record('g:' + g, 'correct');
  tick(INTERVALS[1]);
  const picks = l.pick(['g'], 4, { newRatio: 0.25 });
  expect(picks).toHaveLength(4);
  expect(picks).toContain('n'); // the new letter
  expect(new Set(picks).size).toBe(4);
});

test('a beginner gets the current letter plus previews of the next ones, not one letter over and over', () => {
  const { l } = make();
  expect(l.lesson).toBe(1);
  const picks = l.pick(['g'], 4);
  expect(picks).toContain('a');
  expect(new Set(picks).size).toBeGreaterThanOrEqual(3);
});

test('pick repeats items when the pool is tiny, without back-to-back repeats', () => {
  const { l } = make();
  l.setLesson(2);
  const picks = l.pick(['g'], 6);
  expect(picks).toHaveLength(6);
  for (let i = 1; i < picks.length; i++) expect(picks[i]).not.toBe(picks[i - 1]);
});

test('progress persists through storage', () => {
  const { l, saved } = make();
  l.record('w:cat', 'correct');
  l.addStars(3);
  const l2 = new Learner({ get: () => saved(), set: () => {} });
  expect(l2.s.items['w:cat'].right).toBe(1);
  expect(l2.s.stars).toBe(3);
});

test('mastering the last lesson finishes the course (it has no next lesson)', () => {
  const { l } = make();
  l.setLesson(LAST_LESSON);
  const info = lessonInfo(LAST_LESSON)!;
  for (const g of info.g) l.s.items['g:' + g] = { box: 3, due: 0, right: 3, wrong: 0, help: 0, seen: 3, last: 0 };
  for (const w of info.w) l.s.items['w:' + w] = { box: 3, due: 0, right: 3, wrong: 0, help: 0, seen: 3, last: 0 };
  for (const h of info.h ?? []) l.s.items['h:' + h.w] = { box: 3, due: 0, right: 3, wrong: 0, help: 0, seen: 3, last: 0 };
  expect(l.checkLessonUp()).toBeNull();
  expect(l.s.courseDone).toBe(true);
  expect(l.lesson).toBe(LAST_LESSON);
});

const cruise = (l: Learner) => { l.s.tiers.grapheme = 2; l.s.tiers.word = 2; };
const lessonOf = (id: string) => itemsUpTo(LAST_LESSON).find(it => it.id === id)!.lesson;

test('starting further on credits what came before as seen once and opens the lands passed', () => {
  const { l, now } = make();
  l.place(18, { quiet: true });
  expect(l.lesson).toBe(18);
  expect(l.isNew('g:m')).toBe(false);
  expect(l.s.items['g:m']).toMatchObject({ box: 1, skipped: true, right: 0 });
  expect(l.s.items['g:m'].due).toBeLessThanOrEqual(now() + 2 * 864e5);
  expect(l.isNew('g:e')).toBe(true); // lesson 18's own sound is still new
  expect(l.s.map!.cleared).toEqual(['meadow', 'backyard']);
  expect(l.s.map!.celebrated).toEqual(['meadow', 'backyard']);
  expect(l.s.stickers).toEqual(['monster', 'peashooter']);
});

test('skipping ahead leaves the gates for the map to celebrate', () => {
  const { l } = make();
  l.place(12);
  expect(l.s.map!.cleared).toEqual(['meadow']);
  expect(l.s.map!.celebrated).toEqual([]);
});

test('a cruising child is tested on items before the next land, and skips there when they come back right', () => {
  const { l } = make();
  l.place(12);
  expect(l.pick(['g'], 6).every(g => lessonOf('g:' + g) <= 12)).toBe(true); // only games that ask for it
  expect(l.pick(['g'], 6, { probe: true }).every(g => lessonOf('g:' + g) <= 12)).toBe(true); // not cruising yet
  cruise(l);
  const ahead = l.pick(['g'], 6, { probe: true }).filter(g => lessonOf('g:' + g) > 12);
  expect(ahead.length).toBe(2);
  expect(ahead.every(g => lessonOf('g:' + g) < 18)).toBe(true);
  for (const g of ['d', 'c', 'u', 'g']) l.record('g:' + g, 'correct', 'grapheme');
  expect(l.checkSkipAhead()).toBe(null); // the words between need checking too
  l.record('w:hot', 'correct', 'word'); // lesson 21: past the next land, so it doesn't count
  l.record('w:dad', 'correct', 'word');
  expect(l.checkSkipAhead()).toBe(null);
  l.record('w:cat', 'correct', 'word');
  expect(l.checkSkipAhead()).toBe(18);
  expect(l.lesson).toBe(18);
  expect(l.takeLevelUp()).toBe(18);
  expect(l.s.map!.cleared).toEqual(['meadow', 'backyard']);
  expect(l.s.items['w:dad'].skipped).toBeUndefined(); // answered, so not just credited
});

test('two misses stop the testing ahead for a few sessions', () => {
  const { l } = make();
  l.place(12);
  cruise(l);
  l.record('g:d', 'wrong', 'grapheme');
  l.record('g:c', 'help', 'grapheme');
  expect(l.s.probe).toBeUndefined();
  cruise(l);
  expect(l.pick(['g'], 6, { probe: true }).every(g => lessonOf('g:' + g) <= 12)).toBe(true);
  for (let i = 0; i < 3; i++) l.noteGames([]);
  expect(l.pick(['g'], 6, { probe: true }).some(g => lessonOf('g:' + g) > 12)).toBe(true);
});

test('no testing ahead when skipping is off (playtesting)', () => {
  const { l } = make();
  l.place(12);
  cruise(l);
  l.skipAhead = false;
  expect(l.pick(['g'], 6, { probe: true }).every(g => lessonOf('g:' + g) <= 12)).toBe(true);
});
