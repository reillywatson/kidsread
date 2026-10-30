// Learner model: Leitner-style spaced repetition per item, rolling accuracy per skill
// (drives difficulty tiers), and UFLI lesson advancement based on mastery.
import { FIRST_LESSON, LAST_LESSON, lessonInfo, nextLesson, itemsUpTo, parseId, WORD_LESSON, type ItemKind } from './data/curriculum';

const MIN = 60e3, DAY = 864e5;
// Box n is due INTERVALS[n] after it was last promoted. The short early steps give
// spaced practice inside a single play session; later steps span days.
export const INTERVALS = [0, 2 * MIN, 20 * MIN, DAY, 3 * DAY, 7 * DAY, 21 * DAY, 60 * DAY];
export const MASTERED_BOX = 2;
const RECENT = 12;

export type Skill = 'grapheme' | 'word' | 'sentence' | 'heart' | 'phonemic' | 'rhyme' | 'syllable' | 'spelling' | 'writing' | 'capitals' | 'fun';
export type Tier = 0 | 1 | 2;
/** correct = first try; help = needed a model or hint; seen = exposure only. */
export type Result = 'correct' | 'wrong' | 'help' | 'seen';

export interface ItemState { box: number; due: number; right: number; wrong: number; help: number; seen: number; last: number }

export interface Settings { gamesPerSession: number }

export interface LearnerState {
  lesson: number;
  items: Record<string, ItemState>;
  recent: Partial<Record<Skill, boolean[]>>;
  tiers: Partial<Record<Skill, Tier>>;
  stars: number;
  stickers: string[];
  lastGames: string[];
  sessions: number;
  /** Session number in which the last bonus game was played. */
  lastBonusSession?: number;
  pendingLevelUp: number | null;
  settings: Settings;
  /** Stickers placed in the sticker playground: page -> stickers. */
  board?: Record<string, PlacedSticker[]>;
  /** Play log for the grown-up area (most recent last). */
  plays?: Play[];
  /** Storybooks read to the end: book id -> times. */
  books?: Record<string, number>;
}

/** One game (or sticker playground visit), for the grown-ups' "What got played". */
export interface Play {
  /** Random, so the server can ignore a play it has already seen. */
  id?: string;
  game: string;
  /** Start time (ms since epoch). */
  at: number;
  ms: number;
  /** Finished, or left early (home button, closed the app). */
  done: boolean;
  /** Answers right on the first try, out of all answers. */
  right: number;
  total: number;
  stars?: number;
  /** The child's lesson at the time. */
  lesson?: number;
}

const MAX_PLAYS = 500;
/** Longer than this, the app was probably left open in the background. */
const MAX_PLAY_MS = 15 * 60e3;

export interface PlacedSticker { id: string; x: number; y: number }

export interface Storage { get(): Partial<LearnerState> | null; set(v: LearnerState): void }

const defaults = (): LearnerState => ({
  lesson: FIRST_LESSON,
  items: {},
  recent: {},
  tiers: {},
  stars: 0,
  stickers: [],
  lastGames: [],
  sessions: 0,
  pendingLevelUp: null,
  settings: { gamesPerSession: 4 },
});

export class Learner {
  s: LearnerState;
  /** id -> times used this session, to spread items out. */
  private sessionUse = new Map<string, number>();

  constructor(private storage: Storage, private now: () => number = () => Date.now()) {
    const saved = storage.get();
    this.s = { ...defaults(), ...saved, settings: { ...defaults().settings, ...saved?.settings } };
  }

  save() { this.storage.set(this.s); }
  reset() { this.s = defaults(); this.sessionUse.clear(); this.save(); }
  startSession() { this.sessionUse.clear(); }

  get lesson() { return this.s.lesson; }
  setLesson(n: number) { if (lessonInfo(n)) { this.s.lesson = n; this.save(); } }

  isNew(id: string) {
    const it = this.s.items[id];
    return !it || it.right + it.wrong + it.help === 0;
  }

  record(id: string, result: Result, skill?: Skill) {
    const t = this.now();
    const it = this.s.items[id] ||= { box: 0, due: t, right: 0, wrong: 0, help: 0, seen: 0, last: 0 };
    it.seen++;
    it.last = t;
    this.sessionUse.set(id, (this.sessionUse.get(id) || 0) + 1);
    if (result === 'correct') {
      it.right++;
      // Only promote once the item is due — repeated correct answers within one
      // spacing window don't count as extra evidence.
      if (t >= it.due) {
        it.box = Math.min(it.box + 1, INTERVALS.length - 1);
        it.due = t + INTERVALS[it.box];
      }
    } else if (result === 'wrong') {
      it.wrong++;
      it.box = Math.max(0, it.box - 2);
      it.due = t;
    } else if (result === 'help') {
      it.help++;
      it.box = Math.max(0, it.box - 1);
      it.due = t + INTERVALS[it.box];
    }
    if (skill && result !== 'seen') this.pushRecent(skill, result === 'correct');
    this.save();
  }

  pushRecent(skill: Skill, ok: boolean) {
    const r = this.s.recent[skill] ||= [];
    r.push(ok);
    if (r.length > RECENT) r.shift();
  }

  accuracy(skill: Skill): number | null {
    const r = this.s.recent[skill];
    if (!r || r.length === 0) return null;
    return r.filter(Boolean).length / r.length;
  }

  tier(skill: Skill): Tier { return this.s.tiers[skill] ?? 0; }

  /** Called after each game. Moves the skill's difficulty tier up or down. */
  adjustTier(skill: Skill): number {
    const r = this.s.recent[skill];
    if (!r || r.length < 6) return 0;
    const acc = this.accuracy(skill)!;
    const t = this.tier(skill);
    let change = 0;
    if (acc >= 0.85 && t < 2) change = 1;
    else if (acc < 0.6 && t > 0) change = -1;
    if (change) {
      this.s.tiers[skill] = (t + change) as Tier;
      this.s.recent[skill] = r.slice(-3); // fresh evidence at the new tier
      this.save();
    }
    return change;
  }

  /** Overall comfort, 0..2: decides how many new items to introduce. */
  overallTier(): Tier {
    return Math.round((this.tier('grapheme') + this.tier('word')) / 2) as Tier;
  }

  /**
   * Advance to the next lesson once the current lesson's material is solid: every new
   * grapheme mastered, enough of the new words mastered, heart words answered correctly.
   * A child cruising at the top tier only needs one correct answer per item.
   */
  checkLessonUp(): number | null {
    const l = lessonInfo(this.s.lesson);
    const next = nextLesson(this.s.lesson);
    if (!l || next === this.s.lesson) return null;
    const fast = this.tier('grapheme') === 2 && (l.w.length === 0 || this.tier('word') === 2);
    const need = fast ? 1 : MASTERED_BOX;
    const box = (id: string) => this.s.items[id]?.box ?? 0;
    const gOk = l.g.every(g => box('g:' + g) >= need);
    const words = l.w.filter(w => WORD_LESSON[w] === l.n);
    const wNeed = Math.min(5, Math.ceil(words.length * 0.5));
    const wOk = words.filter(w => box('w:' + w) >= need).length >= wNeed;
    const hOk = (l.h || []).every(h => box('h:' + h.w) >= 1);
    if (gOk && wOk && hOk) {
      this.s.lesson = next;
      this.s.pendingLevelUp = next;
      this.save();
      return next;
    }
    return null;
  }

  takeLevelUp() {
    const n = this.s.pendingLevelUp;
    this.s.pendingLevelUp = null;
    this.save();
    return n;
  }

  /**
   * Choose n item values (e.g. 'm', 'cat') of the given kinds using spaced repetition.
   * Mix: a limited number of new items (current lesson first), then due reviews,
   * then known items favoring weaker ones. Repeats only when the pool is small.
   */
  pick(kinds: ItemKind[], n: number, { filter = () => true, newRatio }: { filter?: (x: string) => boolean; newRatio?: number } = {}): string[] {
    const t = this.now();
    const wanted = (id: string) => { const { kind, x } = parseId(id); return kinds.includes(kind) && filter(x); };
    const pool = itemsUpTo(this.s.lesson).filter(it => wanted(it.id));
    // Early on a child may know just one or two letters ("a" four rounds in a row is dull).
    // Preview the next letters in the sequence — ranked after the current lesson's — for variety.
    // Letters only: an upcoming word could contain sounds that haven't been taught.
    const variety = Math.min(n, 3);
    if (kinds.length === 1 && kinds[0] === 'g' && pool.length < variety) {
      for (const it of itemsUpTo(LAST_LESSON)) {
        if (pool.length >= variety) break;
        if (it.lesson > this.s.lesson && wanted(it.id)) pool.push({ ...it, lesson: this.s.lesson - 1 });
      }
    }
    if (pool.length === 0) return [];
    newRatio ??= [0.25, 0.35, 0.45][this.overallTier()];
    const maxNew = Math.max(1, Math.round(n * newRatio));

    type Cand = { id: string; lesson: number; score: number };
    const fresh: Cand[] = [], due: Cand[] = [], known: Cand[] = [];
    for (const it of pool) {
      const st = this.s.items[it.id];
      const used = this.sessionUse.get(it.id) || 0;
      if (this.isNew(it.id)) fresh.push({ ...it, score: it.lesson + Math.random() });
      else if (st.due <= t) due.push({ ...it, score: (t - st.due) / MIN + (8 - st.box) * 10 - used * 15 + Math.random() * 5 });
      else known.push({ ...it, score: (8 - st.box) * 5 - used * 15 + Math.random() * 20 });
    }
    // Newest lesson first, so the child meets what this lesson is teaching.
    for (const list of [fresh, due, known]) list.sort((a, b) => b.score - a.score);

    const out: string[] = [];
    const take = (list: Cand[], k: number) => { while (k-- > 0 && list.length) out.push(list.shift()!.id); };
    take(fresh, maxNew);
    take(due, n - out.length);
    take(known, n - out.length);
    take(fresh, n - out.length);
    shuffle(out);
    // Small pool: cycle through it again without back-to-back repeats.
    const base = [...out];
    while (out.length < n) {
      const c = base[Math.floor(Math.random() * base.length)];
      if (base.length === 1 || out[out.length - 1] !== c) out.push(c);
    }
    return out.map(id => parseId(id).x);
  }

  addStars(k: number) { this.s.stars += k; this.save(); }
  addSticker(id: string) { if (!this.s.stickers.includes(id)) this.s.stickers.push(id); this.save(); }
  logPlay(p: Play) {
    const plays = (this.s.plays ??= []);
    plays.push({ id: Math.random().toString(36).slice(2, 12), lesson: this.s.lesson, ...p, ms: Math.min(p.ms, MAX_PLAY_MS) });
    if (plays.length > MAX_PLAYS) plays.splice(0, plays.length - MAX_PLAYS);
    this.save();
  }

  noteGames(ids: string[]) { this.s.lastGames = ids.slice(-6); this.s.sessions++; this.save(); }

  /** For the grown-up screen. */
  summary() {
    const items = Object.entries(this.s.items);
    const mastered = items.filter(([, v]) => v.box >= MASTERED_BOX).length;
    const tricky = items
      .filter(([, v]) => v.wrong + v.help > 0)
      .sort((a, b) => (b[1].wrong + b[1].help) / b[1].seen - (a[1].wrong + a[1].help) / a[1].seen)
      .slice(0, 10)
      .map(([id, v]) => ({ id, ...v }));
    const t = this.now();
    const due = items.filter(([, v]) => v.due <= t && v.box > 0).length;
    return { practiced: items.length, mastered, due, tricky };
  }
}

export function shuffle<T>(a: T[]): T[] {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const pickOne = <T>(list: T[]): T => list[Math.floor(Math.random() * list.length)];
