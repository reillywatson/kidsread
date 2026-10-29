import { test, expect } from 'vitest';
import { Learner, INTERVALS, type LearnerState } from '../src/learner';

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
