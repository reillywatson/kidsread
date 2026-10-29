// Distractor selection. Difficulty tier controls how similar the wrong answers are:
// tier 0 = clearly different, tier 2 = minimal pairs / confusable letters.
import {
  GRAPHEMES, PIC, BANK, RHYMES, WORD_LESSON, HEART, soundClass, confusable, picConflict, editDistance, initialSound,
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

export function graphemeDistractors(g: string, n: number, tier: Tier, lesson: number): string[] {
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
const NOT_INITIAL = new Set(['x', 'ck', 'ff', 'll', 'ss', 'zz', 'all', 'oll', 'ull', 'ng', 'nk', 'th_v', 'ph', 'a_e', 'i_e', 'o_e', 'u_e', 'e_e']);
export const canStartWord = (g: string) => !NOT_INITIAL.has(g);

/** Bank pictures starting with grapheme g's sound. */
export function picsStartingWith(g: string): string[] {
  if (NOT_INITIAL.has(g)) return [];
  const cls = soundClass(g);
  return Object.keys(BANK).filter(w => soundClass(initialSound(w)) === cls);
}

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
  const ds = tier === 2 ? prefer(sameStart, others, nChoices - 1) : pickN(others, nChoices - 1);
  return { target, answer, choices: shuffle([answer, ...ds]) };
}
