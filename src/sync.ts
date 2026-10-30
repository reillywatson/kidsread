// Backups to the server, so progress survives a cleared browser or a new tablet. Each device has
// a restore code (shown in the grown-up area); everything Kids Read keeps in this browser
// (players, progress, stickers, settings) is backed up under it now and then. Entering the code
// on another device brings it all back. Play records also go up, anonymously, for the pooled
// stats page (see worker/index.ts). Recorded letter sounds stay on the device.

const CODE_KEY = 'kidsread.code';
const LAST_KEY = 'kidsread.lastBackup';
/** No look-alikes (0/O, 1/I/L), matching the server's check. */
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
export const CODE = /^[2-9A-HJKMNP-Z]{4}-[2-9A-HJKMNP-Z]{4}-[2-9A-HJKMNP-Z]{4}$/;
const EVERY = 10 * 60e3;
/** Automatic backups are skipped if one happened this recently. */
const MIN_GAP = 2 * 60e3;

const get = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const set = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* storage blocked */ } };

/** Tidy up typed codes: upper case, dashes in the right places. */
export function normalizeCode(s: string) {
  const c = s.toUpperCase().replace(/[^0-9A-Z]/g, '');
  return c.length === 12 ? `${c.slice(0, 4)}-${c.slice(4, 8)}-${c.slice(8)}` : s.trim().toUpperCase();
}

/** This device's restore code (made the first time it's needed). */
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

let listeners: (() => void)[] = [];
/** Called after each successful backup (the grown-up area shows the time). */
export const onBackup = (f: () => void) => { listeners.push(f); return () => { listeners = listeners.filter(x => x !== f); }; };

let busy = false;
/** Back up now. `force` skips the "not too often" check. Resolves true on success. */
export async function backupNow(force = false): Promise<boolean> {
  if (busy || !navigator.onLine || (!force && Date.now() - lastBackup() < MIN_GAP)) return false;
  busy = true;
  try {
    const snap = snapshot();
    // Plays since the last backup (with a day's overlap; the server ignores repeats).
    const body = JSON.stringify({ data: snap, plays: playsSince(snap, lastBackup() - 864e5) });
    const res = await fetch(`/api/backup/${restoreCode()}`, {
      method: 'POST', body, headers: { 'content-type': 'application/json' }, keepalive: body.length < 60_000,
    });
    if (!res.ok) return false;
    set(LAST_KEY, String(Date.now()));
    listeners.forEach(f => f());
    return true;
  } catch {
    return false;
  } finally {
    busy = false;
  }
}

/** Fetch the backup saved under a code: { data, at }, or null if there isn't one. */
export async function fetchBackup(code: string): Promise<{ data: ReturnType<typeof snapshot>; at: number } | null> {
  const res = await fetch(`/api/backup/${normalizeCode(code)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`backup fetch failed: ${res.status}`);
  return res.json();
}

/** Replace this device's Kids Read data with a backup, and adopt its code. Reload afterwards. */
export function applyBackup(code: string, snap: ReturnType<typeof snapshot>) {
  try {
    for (const k of Object.keys(localStorage)) if (k.startsWith('kidsread.')) localStorage.removeItem(k);
    for (const [k, v] of Object.entries(snap.data)) if (k.startsWith('kidsread.')) localStorage.setItem(k, v);
  } catch { /* storage blocked */ }
  set(CODE_KEY, normalizeCode(code));
  set(LAST_KEY, String(Date.now()));
}

/** Production only: back up shortly after starting, every 10 minutes, and when the app is put away. */
export function startAutoBackup() {
  if (!import.meta.env.PROD) return;
  restoreCode();
  setTimeout(() => void backupNow(), 15_000);
  setInterval(() => void backupNow(), EVERY);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') void backupNow(); });
}
