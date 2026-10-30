// Short decodable sentences about picture nouns, each with the picture it describes and
// near-miss pictures that a careful reader can rule out:
//   "It is a cat."              "It is a cat and a dog."     "The cat is on the bed."
//   "The pup is in the box."    "The cat is (not) big."      "The cat has a hat."
// Every word is a taught decodable or heart word at the lesson where its kind unlocks.
// Pure data (no Phaser), so it can be tested; sentenceView.ts draws it.
import { NOUNS, WORD_LESSON, picConflict } from './data/curriculum';
import { pickOne, shuffle } from './learner';

/** Two things in one picture: the noun's thing on, in, or next to (and) another. */
export interface Pair { word: string; how: 'on' | 'in' | 'and' }

export type Kind = 'is' | 'and' | 'on' | 'in' | 'big' | 'notbig' | 'hat';

export interface Pic { noun: string; size?: 'big' | 'small'; hat?: boolean; pair?: Pair }
export interface Sentence { kind: Kind; words: string[]; answer: Pic; alts: Pic[]; noun: string }

/** Lesson each kind of sentence unlocks (when its last word is taught). */
const UNLOCK: Record<Kind, number> = { is: 9, in: 9, on: 12, and: 13, big: 17, notbig: 17, hat: 30 };
/** Things a picture can show something inside of. */
const CONTAINERS = new Set(['box', 'cup', 'bag', 'tub', 'pot', 'pan', 'can', 'nest', 'dish', 'van', 'bus', 'cab', 'truck', 'net',
  'hat', 'sock', 'ship', 'tent', 'hole', 'tin', 'jar', 'cart', 'car', 'pail', 'boat', 'bowl', 'jeep', 'train', 'boot']);

export const nounsAt = (lesson: number) => [...NOUNS].filter(n => WORD_LESSON[n] <= lesson);

/** Sentence kinds available at a lesson; easier tiers stick to the shorter ones. */
export function kindsAt(lesson: number, tier = 2): Kind[] {
  const byTier: Kind[][] = [['is', 'and', 'big', 'notbig', 'hat'], ['is', 'and', 'on', 'in', 'big', 'notbig', 'hat'], Object.keys(UNLOCK) as Kind[]];
  return byTier[tier].filter(k => UNLOCK[k] <= lesson);
}

const article = (n: string) => ('aeiou'.includes(n[0]) ? 'an' : 'a');

/** A sentence about `noun`. Falls back to "It is a …" when a kind can't be built. */
export function makeSentence(noun: string, lesson: number, kinds = kindsAt(lesson)): Sentence {
  const others = nounsAt(lesson).filter(o => !picConflict(o, noun));
  const other = (...not: string[]) => {
    const ok = others.filter(o => not.every(x => o !== x && !picConflict(o, x)));
    return ok.length ? pickOne(ok) : null;
  };
  const containers = others.filter(o => CONTAINERS.has(o));
  const usable = kinds.filter(k => k !== 'in' || containers.length > 0);
  const kind = usable.length ? pickOne(usable) : 'is';
  const X = noun;
  const make = (words: string[], answer: Pic, alts: (Pic | null)[]): Sentence =>
    ({ kind, words, answer, alts: alts.filter((a): a is Pic => !!a), noun });

  switch (kind) {
    case 'and': {
      const Y = other(X), Z = Y && other(X, Y);
      if (!Y || !Z) break;
      return make(['it', 'is', article(X), X, 'and', article(Y), Y], { noun: X, pair: { word: Y, how: 'and' } },
        [{ noun: X, pair: { word: Z, how: 'and' } }, { noun: Z, pair: { word: Y, how: 'and' } }]);
    }
    case 'on': {
      const Y = other(X);
      if (!Y) break;
      const Z = other(X, Y);
      return make(['the', X, 'is', 'on', 'the', Y], { noun: X, pair: { word: Y, how: 'on' } }, [
        { noun: Y, pair: { word: X, how: 'on' } }, // the swap: "the bed is on the cat"
        CONTAINERS.has(Y) ? { noun: X, pair: { word: Y, how: 'in' } } : Z ? { noun: X, pair: { word: Z, how: 'on' } } : null,
      ]);
    }
    case 'in': {
      const Y = pickOne(containers.filter(c => c !== X));
      if (!Y) break;
      const Z = containers.filter(c => c !== X && c !== Y && !picConflict(c, Y));
      return make(['the', X, 'is', 'in', 'the', Y], { noun: X, pair: { word: Y, how: 'in' } }, [
        { noun: X, pair: { word: Y, how: 'on' } },
        Z.length ? { noun: X, pair: { word: pickOne(Z), how: 'in' } } : null,
      ]);
    }
    case 'big': {
      const Y = other(X);
      return make(['the', X, 'is', 'big'], { noun: X, size: 'big' }, [{ noun: X, size: 'small' }, Y ? { noun: Y, size: 'big' } : null]);
    }
    case 'notbig': {
      const Y = other(X);
      return make(['the', X, 'is', 'not', 'big'], { noun: X, size: 'small' }, [{ noun: X, size: 'big' }, Y ? { noun: Y, size: 'small' } : null]);
    }
    case 'hat': {
      const Y = other(X);
      return make(['the', X, 'has', 'a', 'hat'], { noun: X, hat: true }, [{ noun: X }, Y ? { noun: Y, hat: true } : null]);
    }
    default:
  }
  const Y = other(X), Z = Y && other(X, Y);
  return { ...make(['it', 'is', article(X), X], { noun: X }, [Y ? { noun: Y } : null, Z ? { noun: Z } : null]), kind: 'is' };
}

/** The answer and n-1 near misses, shuffled. */
export const choicesFor = (s: Sentence, n: number) => shuffle([s.answer, ...s.alts.slice(0, n - 1)]);

export const samePic = (a: Pic, b: Pic) =>
  a.noun === b.noun && a.size === b.size && !!a.hat === !!b.hat && a.pair?.word === b.pair?.word && a.pair?.how === b.pair?.how;
