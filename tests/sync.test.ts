import { test, expect, beforeEach } from 'vitest';
import { CODE, normalizeCode, restoreCode, snapshot, playsSince, movesSince, backupNow, joinFamily } from '../src/sync';
import { mergePlayer, mergeData } from '../src/merge';
import type { LearnerState, Play } from '../src/learner';
import { CODE as SERVER_CODE, cleanPlays, cleanMoves } from '../worker/index';

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

test('a snapshot has all of Kids Read but not the family code', () => {
  localStorage.setItem('kidsread.profiles', '[{"id":"p1","name":"Ada"}]');
  localStorage.setItem('kidsread.p.p1', JSON.stringify({ lesson: 22, plays: [] }));
  localStorage.setItem('other.app', 'untouched');
  restoreCode();
  expect(Object.keys(snapshot().data).sort()).toEqual(['kidsread.p.p1', 'kidsread.profiles']);
});

// ---------- Merging ----------
const play = (id: string, at: number, stars = 2): Play => ({ id, game: 'zombies', at, ms: 30000, done: true, right: 4, total: 5, stars });
const item = (last: number, box: number) => ({ box, due: last, right: box, wrong: 0, help: 0, seen: box, last });

test('a player merged from two devices keeps what each did', () => {
  // Both start from the same copy (one game, 10 stars), then play apart.
  const common = { lesson: 12, stars: 10, plays: [play('a', 1)], stickers: ['monster'], items: { 'g:m': item(1, 1) } };
  const a: Partial<LearnerState> = { ...common, updated: 100, stars: 13, plays: [play('a', 1), play('b', 50, 3)], stickers: ['monster', 'frog'],
    items: { 'g:m': item(50, 2), 'g:s': item(50, 1) }, books: { cat: 1 }, map: { cleared: ['meadow'], celebrated: [], chests: [0] } };
  const b: Partial<LearnerState> = { ...common, updated: 90, stars: 12, plays: [play('a', 1), play('c', 60, 2)], stickers: ['monster', 'hero'],
    items: { 'g:m': item(60, 3) }, books: { cat: 2, dog: 1 }, map: { cleared: ['meadow', 'backyard'], celebrated: ['meadow'], chests: [] },
    moves: [{ id: 'm1', at: 60, from: 12, to: 13, why: 'up' }], lesson: 13 };
  for (const m of [mergePlayer(a, b), mergePlayer(b, a)]) {
    expect(m.stars).toBe(15); // 10 + 3 from game b + 2 from game c
    expect(m.plays!.map(p => p.id)).toEqual(['a', 'b', 'c']);
    expect(m.stickers!.sort()).toEqual(['frog', 'hero', 'monster']);
    expect(m.items!['g:m'].box).toBe(3); // practiced last on b
    expect(m.items!['g:s'].box).toBe(1);
    expect(m.lesson).toBe(13); // b moved up after a last saved
    expect(m.books).toEqual({ cat: 2, dog: 1 });
    expect(m.map!.cleared.sort()).toEqual(['backyard', 'meadow']);
    expect(m.map!.chests).toEqual([0]);
  }
});

test('merging a copy with itself changes nothing', () => {
  const a: Partial<LearnerState> = { updated: 5, lesson: 20, stars: 40, plays: [play('a', 1), play('b', 2)], stickers: ['frog'], items: { 'g:a': item(2, 2) } };
  expect(mergePlayer(a, structuredClone(a))).toEqual({ ...a, courseDone: undefined });
});

test('stars from games the newer copy trimmed from its history are not counted twice', () => {
  const a: Partial<LearnerState> = { updated: 9, stars: 30, plays: [play('new', 100)] }; // trimmed 'old'
  const b: Partial<LearnerState> = { updated: 1, stars: 28, plays: [play('old', 5), play('new', 100)] };
  expect(mergePlayer(a, b).stars).toBe(30);
});

test('players: deletions stick, the latest name wins, and device settings stay put', () => {
  const p = (id: string, name: string, updated = 0) => ({ id, name, avatar: 'hero', created: 1, lastPlayed: 1, updated });
  const local = {
    'kidsread.profiles': JSON.stringify([p('p1', 'Ada', 5), p('p3', 'Cy')]),
    'kidsread.p.p1': JSON.stringify({ stars: 1 }), 'kidsread.p.p3': '{}',
    'kidsread.deleted': JSON.stringify(['p2']), 'kidsread.settings': '{"music":false}',
  };
  const family = {
    'kidsread.profiles': JSON.stringify([p('p1', 'Ada Lovelace', 9), p('p2', 'Bo')]),
    'kidsread.p.p1': JSON.stringify({ stars: 1 }), 'kidsread.p.p2': '{}', 'kidsread.settings': '{"music":true}',
  };
  const m = mergeData(local, family);
  expect(JSON.parse(m['kidsread.profiles']).map((x: { name: string }) => x.name)).toEqual(['Ada Lovelace', 'Cy']);
  expect(m['kidsread.p.p2']).toBeUndefined();
  expect(m['kidsread.settings']).toBe('{"music":false}');
  expect(JSON.parse(m['kidsread.deleted'])).toEqual(['p2']);
});

// ---------- Syncing, with two devices and a pretend server ----------
function server() {
  const rows = new Map<string, { data: unknown; at: number }>();
  let clock = 1000, meddle: (() => void) | null = null;
  const seen = { conflicts: 0 };
  const fetch = async (url: string, init?: { method?: string; body?: string }) => {
    const code = url.split('/').pop()!;
    const res = (status: number, body: unknown) => ({ status, ok: status < 300, json: async () => body });
    if (!init || init.method !== 'POST') { const r = rows.get(code); return r ? res(200, r) : res(404, {}); }
    if (meddle) { const m = meddle; meddle = null; m(); } // another device saves first
    const { data, base } = JSON.parse(init.body!);
    const cur = rows.get(code);
    if ((cur?.at ?? null) !== base) { seen.conflicts++; return res(409, {}); }
    rows.set(code, { data, at: ++clock });
    return res(200, { ok: true });
  };
  return { fetch, rows, seen, meddleOnce: (f: () => void) => { meddle = f; } };
}

/** A device: its own storage, swapped in while it acts. */
function device() {
  const s = new MemStorage();
  const ls = new Proxy(s, { ownKeys: () => [...Array(s.length)].map((_, i) => s.key(i)!), getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }) });
  return async <T>(f: () => T | Promise<T>) => { Object.defineProperty(globalThis, 'localStorage', { value: ls, configurable: true }); return f(); };
}
const setPlayer = (id: string, st: Partial<LearnerState>) => {
  const list = JSON.parse(localStorage.getItem('kidsread.profiles') ?? '[]');
  if (!list.some((p: { id: string }) => p.id === id)) list.push({ id, name: '', avatar: 'hero', created: 1, lastPlayed: 1 });
  localStorage.setItem('kidsread.profiles', JSON.stringify(list));
  localStorage.setItem('kidsread.p.' + id, JSON.stringify(st));
};
const player = (id: string) => JSON.parse(localStorage.getItem('kidsread.p.' + id)!) as LearnerState;

test('two linked devices end up with both devices\' progress, even when they save at once', async () => {
  const srv = server();
  Object.defineProperty(globalThis, 'fetch', { value: srv.fetch, configurable: true });
  Object.defineProperty(globalThis.navigator, 'onLine', { value: true, configurable: true });
  const A = device(), B = device();

  // A has a player and syncs; B joins the family.
  const code = await A(() => { setPlayer('kid', { updated: 1, stars: 10, plays: [play('a', 1)], stickers: ['monster'] }); return restoreCode(); });
  expect(await A(() => backupNow(true))).toBe(true);
  expect(await B(() => joinFamily(code))).toBe(true);
  expect(await B(() => restoreCode())).toBe(code);
  expect(await B(() => player('kid').stars)).toBe(10);

  // Each plays a game apart. A syncs; B's save collides with another of A's, so B merges again.
  await A(() => setPlayer('kid', { ...player('kid'), updated: 5, stars: 13, plays: [play('a', 1), play('b', 5, 3)] }));
  await B(() => setPlayer('kid', { ...player('kid'), updated: 6, stars: 12, plays: [play('a', 1), play('c', 6, 2)], stickers: ['monster', 'frog'] }));
  expect(await A(() => backupNow(true))).toBe(true);
  srv.meddleOnce(() => void A(async () => {
    setPlayer('kid', { ...player('kid'), updated: 7, stickers: [...player('kid').stickers, 'hero'] });
    const snap = snapshot();
    srv.rows.set(code, { data: snap, at: srv.rows.get(code)!.at + 1 });
    void B(() => {}); // back to B, which was in the middle of syncing
  }));
  expect(await B(() => backupNow(true))).toBe(true);
  expect(srv.seen.conflicts).toBe(1); // B's first save was refused, and it merged again
  expect(await A(() => backupNow(true))).toBe(true);

  for (const d of [A, B]) {
    const k = await d(() => player('kid'));
    expect(k.stars).toBe(15);
    expect(k.plays!.map(p => p.id)).toEqual(['a', 'b', 'c']);
    expect([...k.stickers].sort()).toEqual(['frog', 'hero', 'monster']);
  }
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

test('lesson changes sent for stats carry no names', () => {
  localStorage.setItem('kidsread.profiles', '[{"id":"p1","name":"Ada"}]');
  localStorage.setItem('kidsread.p.p1', JSON.stringify({ moves: [
    { id: 'a', at: 1000, from: 1, to: 12, why: 'start' },
    { id: 'b', at: 5000, from: 12, to: 18, why: 'skip' },
  ] }));
  const moves = movesSince(snapshot(), 2000);
  expect(moves).toEqual([{ id: 'b', at: 5000, from: 12, to: 18, why: 'skip' }]);
  expect(JSON.stringify(moves)).not.toContain('Ada');
});

test('the server keeps only well-formed lesson changes', () => {
  expect(cleanMoves([
    { id: 'x', at: 5, from: 12, to: 18, why: 'skip' },
    { id: 'y', at: 5, from: 1, to: 2, why: 'hacked' },
    { at: 5, from: 1, to: 2, why: 'up' },
  ])).toEqual([{ id: 'x', at: 5, from: 12, to: 18, why: 'skip' }]);
  expect(cleanMoves(null)).toEqual([]);
});
