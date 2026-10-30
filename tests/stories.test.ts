import { test, expect } from 'vitest';
import { STORIES, storyLesson, wordsOf, wordKey } from '../src/data/stories';
import { WORD_LESSON, HEART, LAST_LESSON } from '../src/data/curriculum';

test('every word in every story is a taught word', () => {
  for (const s of STORIES) {
    for (const text of [s.title, ...s.pages.map(p => p.text)]) {
      for (const w of wordsOf(text)) {
        const k = wordKey(w);
        expect(!!(WORD_LESSON[k] || HEART[k]), `"${w}" in ${s.id}: "${text}"`).toBe(true);
      }
    }
  }
});

test('stories unlock along the way, easiest first', () => {
  const lessons = STORIES.map(storyLesson);
  for (const l of lessons) expect(l).toBeLessThanOrEqual(LAST_LESSON);
  expect([...lessons].sort((a, b) => a - b)).toEqual(lessons);
  expect(lessons[0]).toBeLessThanOrEqual(15);
});

test('every page has a picture, and ids are unique', () => {
  expect(new Set(STORIES.map(s => s.id)).size).toBe(STORIES.length);
  for (const s of STORIES) {
    expect(s.pages.length).toBeGreaterThanOrEqual(4);
    for (const p of s.pages) {
      expect(p.art.length).toBeGreaterThan(0);
      for (const [, x, y, size] of p.art) {
        expect(Math.abs(x)).toBeLessThanOrEqual(320);
        expect(Math.abs(y)).toBeLessThanOrEqual(150);
        expect(size).toBeGreaterThan(20);
      }
    }
  }
});

test('word lookup keeps heart words like "I" and lowercases the rest', () => {
  expect(wordsOf('Plop! The frog is in the pond.')).toEqual(['Plop', 'The', 'frog', 'is', 'in', 'the', 'pond']);
  expect(wordKey('The')).toBe('the');
  expect(wordKey('Dad')).toBe('dad');
});
