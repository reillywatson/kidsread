import { test, expect, beforeEach } from 'vitest';
import { CODE, normalizeCode, restoreCode, snapshot, playsSince, applyBackup } from '../src/sync';
import { CODE as SERVER_CODE, cleanPlays } from '../worker/index';

// A minimal localStorage for Node.
class MemStorage {
  private m = new Map<string, string>();
  get length() { return this.m.size; }
  key(i: number) { return [...this.m.keys()][i] ?? null; }
  getItem(k: string) { return this.m.get(k) ?? null; }
  setItem(k: string, v: string) { this.m.set(k, String(v)); }
  removeItem(k: string) { this.m.delete(k); }
  clear() { this.m.clear(); }
}
beforeEach(() => {
  const s = new MemStorage();
  Object.defineProperty(globalThis, 'localStorage', { value: new Proxy(s, { ownKeys: () => [...Array(s.length)].map((_, i) => s.key(i)!), getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }) }), configurable: true });
});

test('restore codes are stable, unambiguous, and accepted by the server', () => {
  const c = restoreCode();
  expect(c).toMatch(CODE);
  expect(c).toMatch(SERVER_CODE);
  expect(restoreCode()).toBe(c);
  expect(c).not.toMatch(/[01ILO]/);
  expect(normalizeCode(' k7qm 3xrp-9whd ')).toBe('K7QM-3XRP-9WHD');
});

test('a snapshot round-trips through restore, and replaces what was there', () => {
  localStorage.setItem('kidsread.profiles', '[{"id":"p1","name":"Ada"}]');
  localStorage.setItem('kidsread.p.p1', JSON.stringify({ lesson: 22, plays: [] }));
  localStorage.setItem('other.app', 'untouched');
  const code = restoreCode();
  const snap = snapshot();
  expect(Object.keys(snap.data).sort()).toEqual(['kidsread.p.p1', 'kidsread.profiles']); // not the code itself
  localStorage.setItem('kidsread.p.p2', '{}');
  applyBackup('ABCD-EFGH-JKMN', snap);
  expect(localStorage.getItem('kidsread.p.p1')).toContain('"lesson":22');
  expect(localStorage.getItem('kidsread.p.p2')).toBeNull();
  expect(localStorage.getItem('other.app')).toBe('untouched');
  expect(restoreCode()).toBe('ABCD-EFGH-JKMN');
  expect(code).not.toBe('ABCD-EFGH-JKMN');
});

test('play records sent for stats carry no names or codes', () => {
  localStorage.setItem('kidsread.profiles', '[{"id":"p1","name":"Ada"}]');
  localStorage.setItem('kidsread.p.p1', JSON.stringify({ plays: [
    { id: 'a', game: 'zombies', at: 1000, ms: 30000, done: true, right: 4, total: 5, stars: 3, lesson: 12 },
    { game: 'frog', at: 5000, ms: 20000, done: false, right: 1, total: 2 },
  ] }));
  const plays = playsSince(snapshot(), 2000);
  expect(plays).toHaveLength(1);
  expect(plays[0].game).toBe('frog');
  expect(JSON.stringify(plays)).not.toContain('Ada');
  expect(Object.keys(plays[0]).sort()).toEqual(['at', 'done', 'game', 'id', 'lesson', 'ms', 'right', 'stars', 'total']);
});

test('the server keeps only well-formed plays, clamped', () => {
  const out = cleanPlays([
    { id: 'x', game: 'zombies', at: 5, ms: 9e12, done: 1, right: -3, total: 5 },
    { id: 'y', game: 'DROP TABLE', at: 5, ms: 1, done: true, right: 1, total: 1 },
    { game: 'frog' },
    'nope',
  ]);
  expect(out).toEqual([{ id: 'x', game: 'zombies', at: 5, ms: 3_600_000, done: true, right: 0, total: 5, stars: undefined, lesson: undefined }]);
  expect(cleanPlays('nope')).toEqual([]);
});
