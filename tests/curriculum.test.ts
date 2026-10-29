import { test, expect } from 'vitest';
import { LESSONS, GRAPHEMES, WORD_LESSON, PIC, BANK, RHYMES, NOUNS, segment, initialSound } from '../src/data/curriculum';
import { picsStartingWith, wordDistractors, graphemeDistractors, rhymeRound } from '../src/choices';

test('every word is decodable with graphemes taught by its lesson', () => {
  for (const l of LESSONS) {
    for (const w of l.w) {
      const toks = segment(w, l.n);
      expect(toks.map(t => t.t).join(''), `${w} segments back to itself`).toBe(w);
      for (const t of toks) {
        if (t.g === null) continue;
        expect(GRAPHEMES[t.g], `${w}: unknown grapheme ${t.g}`).toBeTruthy();
        expect(GRAPHEMES[t.g].lesson, `${w} (lesson ${l.n}) uses ${t.g}`).toBeLessThanOrEqual(l.n);
      }
    }
  }
});

test('each grapheme is introduced by the lesson it claims', () => {
  for (const g of Object.values(GRAPHEMES)) {
    expect(LESSONS.find(x => x.g.includes(g.id))?.n, g.id).toBe(g.lesson);
  }
});

test('segmentation', () => {
  const s = (w: string) => segment(w).map(t => t.g ?? '_').join(' ');
  expect(s('cake')).toBe('c a_e k _');
  expect(s('ship')).toBe('sh i p');
  expect(s('doll')).toBe('d o ll');
  expect(s('roll')).toBe('r oll');
  expect(s('this')).toBe('th_v i s');
  expect(s('thin')).toBe('th i n');
  expect(s('quit')).toBe('qu i t');
  expect(s('these')).toBe('th_v e_e s _');
  expect(s('ring')).toBe('r i ng');
});

test('pictures, nouns and rhymes line up with the word lists', () => {
  for (const w of Object.keys(PIC)) expect(WORD_LESSON[w], `PIC ${w}`).toBeTruthy();
  for (const w of NOUNS) expect(PIC[w], `noun ${w}`).toBeTruthy();
  for (const f of RHYMES) {
    expect(f.length).toBeGreaterThanOrEqual(2);
    for (const w of f) expect(BANK[w], `rhyme ${w}`).toBeTruthy();
  }
});

test('every single-letter sound has pictures starting with it', () => {
  for (const g of Object.keys(GRAPHEMES)) {
    if (g.length === 1 && g !== 'x') expect(picsStartingWith(g).length, g).toBeGreaterThanOrEqual(2);
  }
  expect(initialSound('ship')).toBe('sh');
  expect(picsStartingWith('c')).toContain('kite'); // same sound, different letter
});

test('distractors never include the answer or a same-sound grapheme', () => {
  for (let i = 0; i < 50; i++) {
    expect(graphemeDistractors('c', 3, 2, 50)).not.toContain('k');
    expect(graphemeDistractors('c', 3, 2, 50)).not.toContain('c');
    expect(wordDistractors('cat', 3, 2, 20)).not.toContain('cat');
  }
  // Even at lesson 1 there are enough letters to choose from.
  expect(graphemeDistractors('a', 2, 0, 1)).toHaveLength(2);
});

test('top-tier word distractors are minimal pairs', () => {
  const ds = wordDistractors('cat', 3, 2, 20);
  expect(ds.some(d => ['bat', 'hat', 'rat', 'mat', 'sat', 'pat', 'fat', 'cap', 'can', 'cot', 'cut'].includes(d))).toBe(true);
});

test('rhyme rounds contain the answer and no other rhyme', () => {
  for (let i = 0; i < 50; i++) {
    const r = rhymeRound(3, 1);
    const fam = RHYMES.find(f => f.includes(r.target))!;
    expect(r.choices).toContain(r.answer);
    expect(r.choices.filter(c => fam.includes(c))).toEqual([r.answer]);
  }
});
