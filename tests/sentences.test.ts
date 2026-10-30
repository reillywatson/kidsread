import { test, expect } from 'vitest';
import { LESSON_NUMS, WORD_LESSON, HEART } from '../src/data/curriculum';
import { kindsAt, makeSentence, nounsAt, samePic, type Kind } from '../src/sentences';

const taughtBy = (w: string, lesson: number) => (WORD_LESSON[w] ?? HEART[w]?.lesson ?? Infinity) <= lesson;

test('sentences only use words taught by the lesson, with distinct near-miss pictures', () => {
  for (const lesson of LESSON_NUMS.filter(l => nounsAt(l).length >= 3)) {
    for (const kind of kindsAt(lesson)) {
      for (const noun of nounsAt(lesson)) {
        const s = makeSentence(noun, lesson, [kind]);
        for (const w of s.words) expect(taughtBy(w, lesson), `${s.words.join(' ')} @${lesson}`).toBe(true);
        expect(s.words).toContain(noun);
        expect(s.alts.length, `${s.words.join(' ')}`).toBeGreaterThanOrEqual(1);
        for (const a of s.alts) expect(samePic(a, s.answer), `${s.words.join(' ')}`).toBe(false);
        if (s.alts.length > 1) expect(samePic(s.alts[0], s.alts[1])).toBe(false);
      }
    }
  }
}, 60_000); // every lesson × kind × noun: thorough, so it takes a few seconds

test('sentence kinds unlock as their words are taught', () => {
  expect(kindsAt(9)).toEqual(expect.arrayContaining<Kind>(['is', 'in']));
  expect(kindsAt(9)).not.toContain('on');
  expect(kindsAt(12)).toContain('on');
  expect(kindsAt(30)).toContain('hat');
  expect(kindsAt(30, 0)).not.toContain('on');
});

test('on and in sentences describe the right picture', () => {
  const s = makeSentence('cat', 30, ['on']);
  expect(s.words.slice(0, 4)).toEqual(['the', 'cat', 'is', 'on']);
  expect(s.answer.pair?.how).toBe('on');
  expect(s.answer.pair?.word).toBe(s.words[5]);
  // The swapped picture is always one of the near misses.
  expect(s.alts[0]).toEqual({ noun: s.words[5], pair: { word: 'cat', how: 'on' } });
});
