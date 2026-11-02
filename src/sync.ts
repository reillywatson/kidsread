// Family sync. Each family has a code (shown in the grown-up area); every device linked with it
// keeps the same players and progress. Now and then (after games, when the app opens or is put
// away) a device fetches the family copy from the server, merges in what it has (merge.ts), keeps
// the result, and sends it back. If another device sent one in between, the server says so and
// it tries again, so neither overwrites the other. Linking a device is just entering the code
// once (or opening a link with it); the kids never see it. The family copy doubles as a backup.
// Play records also go up, anonymously, for the pooled stats page (see worker/index.ts).
// Recorded letter sounds stay on the device.
import { mergeData, type Data } from './merge';
import { reloadLearner, learner } from './state';

const CODE_KEY = 'kidsread.code';
const LAST_KEY = 'kidsread.lastBackup';
/** No look-alikes (0/O, 1/I/L), matching the server's check. */
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
export const CODE = /^[2-9A-HJKMNP-Z]{4}-[2-9A-HJKMNP-Z]{4}-[2-9A-HJKMNP-Z]{4}$/;
const EVERY = 5 * 60e3;
/** Automatic syncs are skipped if one happened this recently. */
const MIN_GAP = 30e3;

const get = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const set = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* storage blocked */ } };

/** Tidy up typed codes: upper case, dashes in the right places. */
export function normalizeCode(s: string) {
  const c = s.toUpperCase().replace(/[^0-9A-Z]/g, '');
  return c.length === 12 ? `${c.slice(0, 4)}-${c.slice(4, 8)}-${c.slice(8)}` : s.trim().toUpperCase();
}

/** This device's family code (made the first time it's needed, until it joins another family). */
export function restoreCode() {
  let c = get(CODE_KEY);
  if (!c || !CODE.test(c)) {
    const b = crypto.getRandomValues(new Uint8Array(12));
    const s = [...b].map(x => ALPHABET[x % ALPHABET.length]).join('');
    c = `${s.slice(0, 4)}-${s.slice(4, 8)}-${s.slice(8)}`;
    set(CODE_KEY, c);
  }
  return c;
}

export const lastBackup = () => Number(get(LAST_KEY) || 0);

/** Everything Kids Read keeps in this browser, except the code and backup bookkeeping. */
export function snapshot() {
  const data: Record<string, string> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)!;
      if (k.startsWith('kidsread.') && k !== CODE_KEY && k !== LAST_KEY) data[k] = localStorage.getItem(k)!;
    }
  } catch { /* storage blocked */ }
  return { v: 1, at: Date.now(), data };
}

interface StoredPlay { id?: string; game: string; at: number; ms: number; done: boolean; right: number; total: number; stars?: number; lesson?: number }

/** Play records since `since`, from every player, with nothing that names anyone. */
export function playsSince(snap: ReturnType<typeof snapshot>, since: number) {
  return Object.entries(snap.data).filter(([k]) => k.startsWith('kidsread.p.')).flatMap(([k, v]) => {
    let plays: StoredPlay[] = [];
    try { plays = JSON.parse(v).plays ?? []; } catch { /* skip */ }
    const pid = k.slice('kidsread.p.'.length);
    return plays.filter(p => p.at >= since).map(p => ({
      id: p.id ?? `${pid}-${p.at}`, game: p.game, at: p.at, ms: p.ms, done: p.done, right: p.right, total: p.total, stars: p.stars, lesson: p.lesson,
    }));
  });
}

interface StoredMove { id: string; at: number; from: number; to: number; why: string }

/** Lesson changes since `since`, from every player (for the stats; nothing that names anyone). */
export function movesSince(snap: ReturnType<typeof snapshot>, since: number) {
  return Object.entries(snap.data).filter(([k]) => k.startsWith('kidsread.p.')).flatMap(([, v]) => {
    let moves: StoredMove[] = [];
    try { moves = JSON.parse(v).moves ?? []; } catch { /* skip */ }
    return moves.filter(m => m.at >= since).map(({ id, at, from, to, why }) => ({ id, at, from, to, why }));
  });
}

let listeners: (() => void)[] = [];
/** Called after each successful sync (the grown-up area shows the time). */
export const onBackup = (f: () => void) => { listeners.push(f); return () => { listeners = listeners.filter(x => x !== f); }; };

/** Replace this device's Kids Read data (not its code or sync bookkeeping). */
function keep(data: Data) {
  try {
    for (const k of Object.keys(localStorage)) if (k.startsWith('kidsread.') && k !== CODE_KEY && k !== LAST_KEY && !(k in data)) localStorage.removeItem(k);
    for (const [k, v] of Object.entries(data)) if (k.startsWith('kidsread.') && k !== CODE_KEY && k !== LAST_KEY) localStorage.setItem(k, v);
  } catch { /* storage blocked */ }
}

type Family = { data: ReturnType<typeof snapshot>; at: number };

/** Fetch the family copy saved under a code, or null if there isn't one. */
export async function fetchBackup(code: string): Promise<Family | null> {
  const res = await fetch(`/api/backup/${normalizeCode(code)}`, { cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`backup fetch failed: ${res.status}`);
  return res.json();
}

/**
 * Merge this device's data with the family copy under `code` and send the result back. `base` is
 * the copy it merged with (its time, or null for none): the server refuses if the family copy has
 * changed since, and then it starts over.
 */
async function syncWith(code: string): Promise<boolean> {
  for (let attempt = 0; attempt < 4; attempt++) {
    const family = await fetchBackup(code);
    // From here to the send is synchronous, so nothing played meanwhile is missed.
    if (learner) learner.save();
    const merged = family ? mergeData(snapshot().data, family.data.data ?? {}) : snapshot().data;
    keep(merged);
    reloadLearner();
    const snap = snapshot();
    // Plays and lesson changes since the last sync (with a day's overlap; the server ignores repeats).
    const since = lastBackup() - 864e5;
    const body = JSON.stringify({ data: snap, base: family?.at ?? null, plays: playsSince(snap, since), moves: movesSince(snap, since) });
    const res = await fetch(`/api/backup/${code}`, {
      method: 'POST', body, headers: { 'content-type': 'application/json' }, keepalive: body.length < 60_000,
    });
    if (res.status === 409) continue;
    if (!res.ok) return false;
    set(LAST_KEY, String(Date.now()));
    listeners.forEach(f => f());
    return true;
  }
  return false;
}

let busy = false;
/** Sync now. `force` skips the "not too often" check. Resolves true on success. */
export async function backupNow(force = false): Promise<boolean> {
  if (busy || !navigator.onLine || (!force && Date.now() - lastBackup() < MIN_GAP)) return false;
  busy = true;
  try {
    return await syncWith(restoreCode());
  } catch {
    return false;
  } finally {
    busy = false;
  }
}

/**
 * Link this device to the family with `code`: its players join the family's (same ids merge;
 * different players are all kept), and from then on it syncs under that code.
 */
export async function joinFamily(code: string): Promise<boolean> {
  code = normalizeCode(code);
  if (busy) return false;
  busy = true;
  try {
    if (!(await syncWith(code))) return false;
    set(CODE_KEY, code);
    return true;
  } catch {
    return false;
  } finally {
    busy = false;
  }
}

/** A link that links another device to this family (see takeJoinLink). */
export const joinLink = () => `${location.origin}/#family=${restoreCode()}`;

/** The family code in a link this page was opened with, if any (and tidy it out of the address). */
export function takeJoinLink(): string | null {
  const m = location.hash.match(/family=([0-9A-Za-z-]+)/);
  if (!m) return null;
  history.replaceState(null, '', location.pathname + location.search);
  const code = normalizeCode(m[1]);
  return CODE.test(code) && code !== restoreCode() ? code : null;
}

/** Production only: sync shortly after starting, every few minutes, and when the app is put away or comes back. */
export function startAutoBackup() {
  if (!import.meta.env.PROD) return;
  restoreCode();
  setTimeout(() => void backupNow(true), 2_000);
  setInterval(() => void backupNow(), EVERY);
  document.addEventListener('visibilitychange', () => void backupNow(document.visibilityState === 'hidden'));
}
