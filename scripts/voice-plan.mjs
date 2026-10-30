// What the narrator says: every phrase and word (with its delivery), and the recipes for letter
// sounds. Shared by voice.mjs (which records and processes) and voice-restore.mjs.
import { LESSONS, GRAPHEMES, PIC, BANK, HEART } from '../src/data/curriculum.ts';
import { STICKERS } from '../src/data/stickers.ts';
import { LINES, allLines, slug } from '../src/lines.ts';

// Spoken form when the written form would be read oddly in isolation.
const PRONOUNCE = { a: 'uh' };

// Delivery for each kind of line (v4 audio tags). Single words get none: clarity first.
const TAGS = new Map();
const tag = (t, ...groups) => groups.flat(2).forEach(x => TAGS.set(x, t));
tag('[excited]', LINES.praise, LINES.streak, LINES.stars.slice(1), Object.values(LINES.worldHello), LINES.evolved, LINES.foundAll, LINES.hiNew,
  LINES.welcomeBack, LINES.gotSticker, LINES.newSound, LINES.levelUp, LINES.tapPresent, LINES.pawRoll, LINES.musicOn, LINES.soundsOn,
  LINES.bonus, LINES.timesUp, LINES.silly, LINES.itMatches, LINES.bossDown, LINES.madeIt, LINES.savedKitten, LINES.blastOff);
tag('[cheerfully]', Object.values(LINES.intro));
tag('[squeaky, high-pitched cartoon voice]', LINES.pika);
tag('[slow, groaning zombie voice]', LINES.groans);
tag('[grossed out, silly]', LINES.yuck);
tag('[croaky, playful]', LINES.ribbit);
tag('[playful puppy bark]', LINES.ruff);
tag('[tiny kitten voice]', LINES.meow);
tag('[slowly, clapping out each part]', Object.values(LINES.syllables));
tag('[excited]', LINES.foundAll2, LINES.readBook);
const phraseSet = new Set(allLines());
// Connecting words read plainly, like single words ("like" + "apple").
const PLAIN = new Set([LINES.like]);

export function spoken(t) {
  const base = PRONOUNCE[t] ?? t;
  if (!phraseSet.has(t) || PLAIN.has(t)) return base;
  return `${TAGS.get(t) ?? '[warmly]'} ${base}`;
}

export const texts = new Set(allLines());
for (const l of LESSONS) for (const w of l.w) texts.add(w);
for (const w of Object.keys(HEART)) texts.add(w);
for (const w of Object.keys(PIC)) texts.add(w);
for (const w of Object.keys(BANK)) texts.add(w);
for (const g of Object.values(GRAPHEMES)) texts.add(g.key);
for (const s of STICKERS) texts.add(s.name);

// Letter sounds. Speech engines can't say isolated phonemes, so each sound is cut out of real
// speech. Recipes:
//   vowel  — say a short word (at, it, up…) and keep only the vowel before the stop
//   onset  — say a word and keep only the consonant before the vowel (sh in "shop")
//   coda   — say a word and keep only what follows the vowel's closure (ks in "box")
//   rime   — say a word and drop its first consonant ("oll" from "toll")
//   hold   — a held sound ("mmm"), at most `max` ms; accepted only if it's one continuous sound
//   stop   — say "buh" and keep the burst plus `keep` ms of the vowel (measured from where it starts)
//   clip   — say "tuh" and keep the first `ms` ms (older recipe, kept for sounds that were fine)
//   say    — just say it (long vowels: "ay", "eye"…), at most `max` ms
//   tries  — several of the above, in order, until one works
//
// Each sound has one or more options; the first is the default. `npm run voice -- --audition`
// renders every option so a grown-up can listen on /voices.html and pick one; picks are saved in
// scripts/sound-picks.json.
export const SOUND_OPTIONS = {
  a: [{ vowel: 'at' }], e: [{ vowel: 'Ed' }], i: [{ vowel: 'it' }], o: [{ vowel: 'odd' }], u: [{ vowel: 'up' }],
  m: [{ hold: ['mmm', 'mmmm'], max: 450 }, { hold: ['mmm', 'mmmm'], max: 300 }, { onset: 'moon', loud: 0.6 },
    { stop: 'muh', keep: 150 }, { say: 'muh', max: 400 }],
  n: [{ hold: ['nnn', 'nnnn'], max: 450 }, { hold: ['nnn', 'nnnn'], max: 300 }, { onset: 'nose', loud: 0.6 },
    { stop: 'nuh', keep: 150 }, { say: 'nuh', max: 400 }],
  s: [{ hold: ['sssss', 'sss', 'ss'] }],
  z: [{ hold: ['zzz', 'zzzz'], max: 450 }, { hold: ['zzz', 'zzzz'], max: 300 }, { onset: 'zoo', loud: 0.6 }],
  v: [{ onset: 'van', loud: 0.6 }, { onset: 'vet', loud: 0.6 }, { stop: 'vuh', keep: 90 }, { stop: 'vuh', keep: 150 }, { say: 'vuh', max: 400 }],
  l: [{ hold: ['lllll', 'llll'], max: 400 }, { hold: ['lllll', 'llll'], max: 280 }, { stop: 'luh', keep: 90 }],
  r: [{ say: 'er', max: 450 }, { say: 'err', max: 450 }, { stop: 'ruh', keep: 90 }],
  f: [{ hold: ['fff', 'ffff'], max: 450 }, { onset: 'fun' }, { onset: 'fish' }, { stop: 'fuh', keep: 150 }, { say: 'fuh', max: 400 }],
  sh: [{ hold: ['shhh', 'sh'], max: 500 }, { onset: 'shop', loud: 0.7 }, { onset: 'ship', loud: 0.7 }],
  th: [{ onset: 'thin' }, { onset: 'thumb' }, { hold: ['thhh'], max: 400 }],
  th_v: [{ onset: 'this', loud: 0.7 }, { stop: 'thuh', keep: 80 }, { onset: 'that', loud: 0.7 }],
  ff: { same: 'f' }, ll: { same: 'l' }, ss: { same: 's' }, zz: { same: 'z' }, ph: { same: 'f' },
  t: [{ clip: 'tuh' }], k: [{ clip: 'kuh' }], c: { same: 'k' }, ck: { same: 'k' }, h: [{ clip: 'huh' }], ch: [{ clip: 'chuh' }],
  p: [{ stop: 'puh', keep: 80 }, { stop: 'pah', keep: 80 }, { onset: 'pig', loud: 0.5 }],
  b: [{ stop: 'buh', keep: 100 }, { stop: 'buh', keep: 150 }, { stop: 'bah', keep: 100 }],
  d: [{ stop: 'duh', keep: 100 }, { stop: 'duh', keep: 150 }, { stop: 'dah', keep: 100 }, { say: 'duh', max: 400 }],
  g: [{ stop: 'guh', keep: 100 }, { stop: 'guh', keep: 150 }, { stop: 'gah', keep: 100 }],
  j: [{ stop: 'juh', keep: 100 }, { stop: 'juh', keep: 150 }, { stop: 'jah', keep: 100 }],
  w: [{ stop: 'wuh', keep: 110 }, { stop: 'wuh', keep: 170 }, { stop: 'wah', keep: 110 }],
  wh: { same: 'w' },
  y: [{ stop: 'yuh', keep: 110 }, { stop: 'yuh', keep: 170 }, { stop: 'yah', keep: 110 }],
  qu: [{ stop: 'kwuh', keep: 110 }, { stop: 'kwuh', keep: 170 }, { stop: 'kwah', keep: 110 }],
  x: [{ coda: 'box' }, { coda: 'fox' }, { coda: 'six' }],
  ng: [{ say: 'ing' }], nk: [{ say: 'ink' }],
  all: [{ say: 'all' }, { rime: 'tall' }], ull: [{ say: 'ull' }, { rime: 'pull' }],
  oll: [{ rime: 'toll' }, { rime: 'roll' }, { say: 'ohl' }, { rime: 'pole' }, { rime: 'goal' }, { say: 'oal' }],
  a_e: [{ say: 'A' }, { say: 'ay' }], i_e: [{ say: 'eye' }, { say: 'eye', max: 400 }], o_e: [{ say: 'O' }, { say: 'oh' }],
  u_e: [{ say: 'U' }, { say: 'you' }], e_e: [{ say: 'E' }, { say: 'ee' }],
};

/** The recipe each letter sound uses, given saved picks ({ id: option index }). */
export function pickedSounds(picks = {}) {
  return Object.fromEntries(Object.entries(SOUND_OPTIONS).map(([id, opts]) =>
    [id, Array.isArray(opts) ? opts[Math.min(picks[id] ?? 0, opts.length - 1)] : opts]));
}

/** Every text a letter-sound recipe may ask the narrator to say. */
export const soundSources = spec => spec.tries ? spec.tries.flatMap(soundSources)
  : spec.hold ?? [spec.vowel ?? spec.onset ?? spec.coda ?? spec.rime ?? spec.stop ?? spec.clip ?? spec.say].filter(Boolean);

/** A short human description of a recipe, for the voices page. */
export function describe(spec) {
  if (spec.same) return `same as ${spec.same}`;
  if (spec.tries) return spec.tries.map(describe).join(', else ');
  if (spec.hold) return `held “${spec.hold[0]}”${spec.max ? `, ${spec.max}ms` : ''}`;
  if (spec.stop) return `“${spec.stop}”, burst + ${spec.keep}ms of vowel`;
  if (spec.clip) return `“${spec.clip}”, first ${spec.ms ?? 190}ms`;
  if (spec.vowel) return `vowel of “${spec.vowel}”`;
  if (spec.onset) return `start of “${spec.onset}”`;
  if (spec.coda) return `end of “${spec.coda}”`;
  if (spec.rime) return `“${spec.rime}” minus its first sound`;
  return `“${spec.say}”${spec.max ? `, ${spec.max}ms` : ''}`;
}

/** One text per file name (a few phrases differ only in punctuation or case, e.g. "Yes!" and "yes"). */
export function uniqueTexts() {
  const seen = new Set();
  return [...texts].filter(t => !seen.has(slug(t)) && seen.add(slug(t)));
}

/** Every exact text the narrator may be asked to say (phrases, words, letter-sound sources). */
export const allSends = () => [...new Set([...uniqueTexts().map(spoken),
  ...Object.values(SOUND_OPTIONS).flatMap(o => (Array.isArray(o) ? o : [o])).flatMap(soundSources)])];

