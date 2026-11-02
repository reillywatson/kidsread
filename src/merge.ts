// Merging two copies of a family's Kids Read data: this device's and the family copy on the
// server (see sync.ts). Devices linked by a family code each play on their own, often offline, so
// the same player can move on in two places before they meet again. Nothing either device did
// should be lost:
//   - each player's state merges field by field (mergePlayer);
//   - players are matched by id; one deleted on any device stays deleted (DELETED);
//   - everything else (device settings) stays as this device has it, or is taken from the
//     family copy if this device has none yet.
// Pure: data in, data out, so it's easy to test.
import type { LearnerState, Play, Move } from './learner';
import type { Profile } from './state';

/** Everything Kids Read keeps in this browser, as stored: key -> JSON text. */
export type Data = Record<string, string>;

export const INDEX = 'kidsread.profiles';
export const PLAYER = 'kidsread.p.';
/** Ids of deleted players, so a deletion on one device reaches the others. */
export const DELETED = 'kidsread.deleted';
const MAX_PLAYS = 500, MAX_MOVES = 200;

const parse = <T>(s: string | undefined): T | null => { try { return s ? JSON.parse(s) : null; } catch { return null; } };
const union = <T>(a: T[] = [], b: T[] = []) => [...new Set([...a, ...b])];
const playKey = (p: Play) => p.id ?? String(p.at);

/** A player's progress from two devices. */
export function mergePlayer(a: Partial<LearnerState>, b: Partial<LearnerState>): Partial<LearnerState> {
  // The more recently saved copy is the base: settings, levels, recent answers, sticker layout
  // and the like are just "the latest". The rest is combined.
  const [base, other] = (b.updated ?? 0) > (a.updated ?? 0) ? [b, a] : [a, b];
  const out: Partial<LearnerState> = { ...base };

  // Each word or sound: whichever device practiced it last.
  out.items = { ...other.items };
  for (const [id, it] of Object.entries(base.items ?? {})) {
    const o = other.items?.[id];
    if (!o || it.last >= o.last) out.items[id] = it;
  }

  // Games played on either device. Stars come from games, so the other device's games add theirs
  // (only ones newer than the base's oldest, in case the base has trimmed its own old ones).
  const seen = new Set((base.plays ?? []).map(playKey));
  const oldest = Math.min(...(base.plays ?? []).map(p => p.at));
  const extra = (other.plays ?? []).filter(p => !seen.has(playKey(p)));
  out.stars = (base.stars ?? 0) + extra.filter(p => p.done && p.at >= (Number.isFinite(oldest) ? oldest : 0))
    .reduce((n, p) => n + (p.stars ?? 0), 0);
  if (base.plays || other.plays) out.plays = [...(base.plays ?? []), ...extra].sort((x, y) => x.at - y.at).slice(-MAX_PLAYS);

  // Lesson changes on either device; the lesson is where the latest one left it.
  const moveIds = new Set((base.moves ?? []).map(m => m.id));
  const moves: Move[] = [...(base.moves ?? []), ...(other.moves ?? []).filter(m => !moveIds.has(m.id))].sort((x, y) => x.at - y.at);
  if (moves.length) {
    out.moves = moves.slice(-MAX_MOVES);
    const latestBase = Math.max(...(base.moves ?? []).map(m => m.at));
    const latest = moves[moves.length - 1];
    if (latest.at > latestBase) out.lesson = latest.to;
  }

  out.stickers = union(base.stickers, other.stickers);
  if (base.books || other.books) {
    out.books = { ...other.books };
    for (const [id, n] of Object.entries(base.books ?? {})) out.books[id] = Math.max(n, other.books?.[id] ?? 0);
  }
  if (base.map || other.map) {
    const m = base.map ?? other.map!, o = other.map;
    out.map = { ...m, cleared: union(m.cleared, o?.cleared), celebrated: union(m.celebrated, o?.celebrated), chests: union(m.chests, o?.chests) };
  }
  out.courseDone = base.courseDone || other.courseDone || undefined;
  return out;
}

/** This device's data merged with the family copy. */
export function mergeData(local: Data, family: Data): Data {
  const deleted = union(parse<string[]>(local[DELETED]) ?? [], parse<string[]>(family[DELETED]) ?? []);
  const out: Data = {};
  // Device settings and anything else: this device's, or the family's if this device has none.
  for (const [k, v] of Object.entries(family)) if (k !== INDEX && !k.startsWith(PLAYER)) out[k] = v;
  for (const [k, v] of Object.entries(local)) if (k !== INDEX && !k.startsWith(PLAYER)) out[k] = v;
  if (deleted.length) out[DELETED] = JSON.stringify(deleted);

  // Players: matched by id. The name and picture come from whichever copy changed last.
  const when = (p: Profile) => p.updated ?? p.lastPlayed ?? p.created ?? 0;
  const byId = new Map<string, Profile>();
  for (const p of [...(parse<Profile[]>(family[INDEX]) ?? []), ...(parse<Profile[]>(local[INDEX]) ?? [])]) {
    const q = byId.get(p.id);
    if (!q) byId.set(p.id, p);
    else byId.set(p.id, { ...(when(p) >= when(q) ? p : q), lastPlayed: Math.max(p.lastPlayed ?? 0, q.lastPlayed ?? 0) });
  }
  const players = [...byId.values()].filter(p => !deleted.includes(p.id)).sort((a, b) => (a.created ?? 0) - (b.created ?? 0));
  if (players.length || local[INDEX] || family[INDEX]) out[INDEX] = JSON.stringify(players);
  for (const p of players) {
    const k = PLAYER + p.id, l = parse<Partial<LearnerState>>(local[k]), f = parse<Partial<LearnerState>>(family[k]);
    if (l && f) out[k] = JSON.stringify(mergePlayer(l, f));
    else if (l || f) out[k] = (local[k] ?? family[k])!;
  }
  return out;
}
