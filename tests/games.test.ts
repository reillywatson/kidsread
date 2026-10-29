import { test, expect } from 'vitest';
import { neighbors, buildChain, bestChain, chainStarts, decodable, shortVowel, soundCount, countable } from '../src/choices';
import { segment, LESSONS, HEART, PIC, BANK, GRAPHEMES } from '../src/data/curriculum';
import { STICKERS } from '../src/data/stickers';
import { allLines, slug } from '../src/lines';
import manifest from '../src/voice/manifest.json';

test('word chains change exactly one sound per step', () => {
  const pool = decodable(30);
  expect(neighbors('cat', pool)).toEqual(expect.arrayContaining(['hat', 'cap', 'cut']));
  for (let i = 0; i < 30; i++) {
    const chain = buildChain('cat', 5, pool);
    expect(new Set(chain).size).toBe(chain.length);
    for (let k = 1; k < chain.length; k++) {
      const a = segment(chain[k - 1]), b = segment(chain[k]);
      expect(b.length).toBe(a.length);
      expect(a.filter((t, j) => t.t !== b[j].t)).toHaveLength(1);
    }
  }
});

test('best chains reach the requested length even from dead-end starts', () => {
  for (const lesson of [6, 22, 54, 58]) {
    const pool = decodable(lesson);
    for (const start of ['theme', 'quiz', 'cat', undefined]) expect(bestChain(start, 4, pool).length, `${lesson} ${start}`).toBe(5);
  }
});

test('word chains are available from the first lessons with words', () => {
  expect(chainStarts(4)).toEqual(expect.arrayContaining(['sat', 'mat']));
  expect(chainStarts(2)).toEqual([]);
});

test('short vowel detection', () => {
  expect(shortVowel('cat')).toBe('a');
  expect(shortVowel('ship')).toBe('i');
  expect(shortVowel('cake')).toBeNull();
  expect(shortVowel('the')).toBe('e'); // not a decodable word, but the helper is only asked about decodables
});

test('sound counting uses graphemes, not letters', () => {
  expect(soundCount('ship')).toBe(3);
  expect(soundCount('duck')).toBe(3);
  expect(soundCount('cake')).toBe(3);
  expect(soundCount('frog')).toBe(4);
  expect(countable('fox')).toBe(false);
});

test('every phrase, word and letter sound has a recording', () => {
  const clips = manifest.clips as Record<string, number>;
  const missing = [
    ...allLines(),
    ...LESSONS.flatMap(l => l.w), ...Object.keys(HEART), ...Object.keys(PIC), ...Object.keys(BANK),
    ...Object.values(GRAPHEMES).map(g => g.key), ...STICKERS.map(s => s.name),
  ].filter(t => !clips[slug(t)]);
  expect(missing, 'run `npm run voice`').toEqual([]);
  expect(Object.keys(manifest.sounds).sort()).toEqual(Object.keys(GRAPHEMES).sort());
});
