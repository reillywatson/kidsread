import { test, expect } from 'vitest';
import { summarize, duration, ago } from '../src/usage';
import { Learner, type Play } from '../src/learner';

const NOW = new Date(2026, 9, 29, 18, 0).getTime();
const DAY = 864e5;
const play = (game: string, daysAgo: number, min: number, done = true, stars?: number, right = 4, total = 5): Play =>
  ({ game, at: NOW - daysAgo * DAY, ms: min * 60e3, done, right, total, stars: done ? (stars ?? 3) : undefined });

test('time per day and this week', () => {
  const s = summarize([play('zombies', 0, 2), play('suns', 0, 1), play('frog', 3, 4), play('frog', 10, 9)], NOW);
  expect(s.days).toHaveLength(7);
  expect(s.todayMs).toBe(3 * 60e3);
  expect(s.days[3].ms).toBe(4 * 60e3);
  expect(s.weekMs).toBe(7 * 60e3); // the 10-days-ago play is outside the week
  expect(s.weekGames).toBe(3);
});

test('per game stats, favorites and struggles', () => {
  const plays = [
    play('zombies', 0, 1), play('zombies', 1, 1), play('zombies', 2, 1, true, 2),
    play('evolve', 0, 0.5, false), play('evolve', 1, 0.5, false), play('evolve', 2, 1, true, 1),
    play('stickers', 0, 5, true, undefined, 0, 0),
  ];
  const s = summarize(plays, NOW);
  const z = s.perGame.find(g => g.game === 'zombies')!;
  expect(z.plays).toBe(3);
  expect(z.leftEarly).toBe(0);
  expect(z.avgStars).toBeCloseTo(8 / 3);
  expect(z.accuracy).toBeCloseTo(0.8);
  const e = s.perGame.find(g => g.game === 'evolve')!;
  expect(e.leftEarly).toBeCloseTo(2 / 3);
  expect(e.avgStars).toBe(1);
  expect(s.favorites).toContain('zombies');
  expect(s.favorites).not.toContain('evolve'); // usually left early: not a favorite
  expect(s.favorites).not.toContain('stickers');
  expect(s.struggles).toEqual(['evolve']);
  expect(s.weekGames).toBe(6); // sticker visits aren't games
});

test('the log is capped and long background stretches are trimmed', () => {
  let saved = null as unknown;
  const l = new Learner({ get: () => null, set: v => { saved = v; } });
  for (let i = 0; i < 520; i++) l.logPlay(play('frog', 0, 1));
  l.logPlay(play('frog', 0, 120));
  expect(l.s.plays).toHaveLength(500);
  expect(l.s.plays!.at(-1)!.ms).toBe(15 * 60e3);
  expect(saved).toBeTruthy();
});

test('friendly durations and dates', () => {
  expect(duration(45e3)).toBe('45 sec');
  expect(duration(3 * 60e3)).toBe('3 min');
  expect(duration(65 * 60e3)).toBe('1 hr 5 min');
  expect(ago(NOW - 60e3, NOW)).toBe('today');
  expect(ago(NOW - DAY, NOW)).toBe('yesterday');
  expect(ago(NOW - 3 * DAY, NOW)).toBe('3 days ago');
});
