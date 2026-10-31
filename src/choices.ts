// Distractor selection. Difficulty tier controls how similar the wrong answers are:
// tier 0 = clearly different, tier 2 = minimal pairs / confusable letters.
import {
  GRAPHEMES, PIC, BANK, RHYMES, WORD_LESSON, HEART, soundClass, confusable, picConflict, editDistance, initialSound, segment,
  type Token,
} from './data/curriculum';
import { shuffle, type Tier } from './learner';

const pickN = <T>(list: T[], n: number) => shuffle([...list]).slice(0, Math.max(0, n));

/** Prefer candidates from `preferred` but fall back to `rest` to fill n. */
function prefer<T>(preferred: T[], rest: T[], n: number): T[] {
  const a = pickN(preferred, n);
  return a.length >= n ? a : [...a, ...pickN(rest.filter(x => !a.includes(x)), n - a.length)];
}

/** Item id for a readable word: heart words and decodable words are tracked separately. */
export const wordItem = (w: string) => (HEART[w] ? 'h:' : 'w:') + w;

// A target from a later lesson (a preview, or a skip-ahead test) draws its distractors from up to
// its own lesson, so it can't be found just by being the one that isn't familiar.
export function graphemeDistractors(g: string, n: number, tier: Tier, lesson: number): string[] {
  lesson = Math.max(lesson, GRAPHEMES[g].lesson);
  // Taught graphemes first; a few upcoming ones fill in when very few are known yet.
  const all = Object.values(GRAPHEMES).filter(x =>
    x.id !== g && x.label !== GRAPHEMES[g].label && soundClass(x.id) !== soundClass(g) && x.lesson <= lesson + 12);
  const taught = all.filter(x => x.lesson <= lesson).map(x => x.id);
  const upcoming = all.filter(x => x.lesson > lesson).sort((a, b) => a.lesson - b.lesson).map(x => x.id);
  const pool = taught.length >= n ? taught : [...taught, ...upcoming.slice(0, n - taught.length + 2)];
  const conf = pool.filter(x => confusable(x, g));
  const plain = pool.filter(x => !confusable(x, g));
  return tier === 2 ? prefer(conf, plain, n) : prefer(plain, conf, n);
}

/** Readable words (decodable + heart) available at a lesson. */
export function readableWords(lesson: number, { pic = false, heart = true } = {}): string[] {
  const ws = Object.keys(WORD_LESSON).filter(w => WORD_LESSON[w] <= lesson && (!pic || PIC[w]));
  const hs = heart && !pic ? Object.values(HEART).filter(h => h.lesson <= lesson).map(h => h.w) : [];
  return [...ws, ...hs];
}

export function wordDistractors(word: string, n: number, tier: Tier, lesson: number, { pic = false } = {}): string[] {
  lesson = Math.max(lesson, WORD_LESSON[word] ?? 0);
  const pool = readableWords(lesson, { pic }).filter(w =>
    w.toLowerCase() !== word.toLowerCase() && (!pic || !picConflict(w, word)));
  const d = (w: string) => editDistance(w.toLowerCase(), word.toLowerCase());
  let near: string[], far: string[];
  if (tier === 2) { near = pool.filter(w => d(w) === 1); far = pool.filter(w => d(w) > 1); }
  else if (tier === 1) { near = pool.filter(w => d(w) <= 2); far = pool; }
  else { near = pool.filter(w => d(w) >= 2 && w[0] !== word[0]); far = pool; }
  const out = prefer(near, far, n * 2);
  // Pictures must not conflict with each other either.
  const ok: string[] = [];
  for (const w of out) if (!pic || ok.every(o => !picConflict(o, w))) ok.push(w);
  return ok.slice(0, n);
}

// Graphemes that never start a word (or whose sound at the start would be misleading).
const NOT_INITIAL = new Set(['x', 'ck', 'ff', 'll', 'ss', 'zz', 'all', 'oll', 'ull', 'ng', 'nk', 'th_v', 'ph', 'a_e', 'i_e', 'o_e', 'u_e', 'e_e',
  // Vowel teams and r-controlled vowels: the picture bank is sorted by first letter, not these.
  'ar', 'or', 'er', 'ir', 'ur', 'ai', 'ay', 'ee', 'ea', 'oa', 'ow_o', 'ie', 'igh', 'oo', 'oo_u', 'ou', 'ow', 'oi', 'oy', 'aw', 'ew', 'ue']);
export const canStartWord = (g: string) => !NOT_INITIAL.has(g);

/** Bank pictures starting with grapheme g's sound. */
export function picsStartingWith(g: string): string[] {
  if (NOT_INITIAL.has(g)) return [];
  const cls = soundClass(g);
  return Object.keys(BANK).filter(w => soundClass(initialSound(w)) === cls);
}

/** Bank pictures whose first letter is grapheme g as written (cat for c, but not kite). */
export const picsStartingWithLetter = (g: string) => picsStartingWith(g).filter(w => w.startsWith(GRAPHEMES[g].label));

export function picsNotStartingWith(g: string, n: number, tier: Tier): string[] {
  const cls = soundClass(g);
  const other = Object.keys(BANK).filter(w => soundClass(initialSound(w)) !== cls);
  // At the top tier, include pictures whose first sound is easily confused with g's.
  const conf = other.filter(w => confusable(initialSound(w), g));
  const out = tier === 2 ? prefer(conf, other, n * 2) : pickN(other, n * 2);
  const ok: string[] = [];
  for (const w of out) if (ok.every(o => BANK[o] !== BANK[w])) ok.push(w);
  return ok.slice(0, n);
}

export function rhymeRound(nChoices: number, tier: Tier) {
  const fam = RHYMES[Math.floor(Math.random() * RHYMES.length)];
  const [target, answer] = pickN(fam, 2);
  const others = RHYMES.filter(f => f !== fam).flat();
  // Harder: distractors that share the target's first sound (cat → car), so only the ending helps.
  const sameStart = others.filter(w => w[0] === target[0]);
  const pool = tier === 2 ? prefer(sameStart, others, others.length) : pickN(others, others.length);
  // No two cards with the same picture (sock / socks).
  const shown = [BANK[target], BANK[answer]];
  const ds: string[] = [];
  for (const w of pool) {
    if (ds.length >= nChoices - 1) break;
    if (!shown.includes(BANK[w])) { ds.push(w); shown.push(BANK[w]); }
  }
  return { target, answer, choices: shuffle([answer, ...ds]) };
}

// ---- Word chains (Poké Evolve) ----
const same = (a: Token[], b: Token[]) => a.length === b.length && a.every((t, i) => t.t === b[i].t);

/** Words one sound-change away (same number of sounds, one grapheme different). */
export function neighbors(w: string, pool: string[]): string[] {
  const a = segment(w);
  return pool.filter(x => {
    if (x === w) return false;
    const b = segment(x);
    if (b.length !== a.length || !same(a.filter(t => !t.g), b.filter(t => !t.g))) return false;
    return a.filter((t, i) => t.t !== b[i].t).length === 1;
  });
}

export const decodable = (lesson: number) => readableWords(lesson, { heart: false });
export function chainStarts(lessonOrPool: number | string[]) {
  const pool = typeof lessonOrPool === 'number' ? decodable(lessonOrPool) : lessonOrPool;
  return pool.filter(w => neighbors(w, pool).length > 0);
}

/** A random walk through one-change neighbors, never revisiting a word. */
export function buildChain(start: string, steps: number, pool: string[]): string[] {
  const chain = [start];
  while (chain.length <= steps) {
    const next = shuffle(neighbors(chain[chain.length - 1], pool).filter(x => !chain.includes(x)));
    if (!next.length) break;
    chain.push(next[0]);
  }
  return chain;
}


/** The longest of several random walks, preferring `start` but trying other words if it dead-ends. */
export function bestChain(start: string | undefined, steps: number, pool: string[]): string[] {
  const starts = chainStarts(pool);
  let best: string[] = [];
  for (let k = 0; k < 30 && best.length <= steps; k++) {
    const s = k < 10 && start ? start : starts[Math.floor(Math.random() * starts.length)];
    const c = buildChain(s, steps, pool);
    if (c.length > best.length) best = c;
  }
  return best;
}

// ---- Vowels (Garden Sort) ----
export const VOWELS = ['a', 'e', 'i', 'o', 'u'];
export const vowelsAt = (lesson: number) => VOWELS.filter(v => GRAPHEMES[v].lesson <= lesson);
/** The word's only vowel sound, if it has exactly one short vowel. */
export function shortVowel(w: string): string | null {
  const vs = segment(w).filter(t => t.g && (VOWELS.includes(t.g) || t.g.endsWith('_e')));
  return vs.length === 1 && VOWELS.includes(vs[0].g!) ? vs[0].g : null;
}


// ---- Counting sounds (Kitten Rescue picks words by length) ----
// Graphemes whose sound is really two sounds (x = /ks/) — skipped to keep counting clear.
const TWO_SOUNDS = new Set(['x', 'qu', 'nk', 'all', 'oll', 'ull']);
export const soundCount = (w: string) => segment(w).filter(t => t.g).length;
export const countable = (w: string) => segment(w).every(t => !t.g || !TWO_SOUNDS.has(t.g));

