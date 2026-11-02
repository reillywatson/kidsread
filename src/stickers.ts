import { pickOne } from './learner';
import { STICKERS as ALL, FAMILY_NAMES, type Sticker } from './data/stickers';
import { FAMILY } from './edition';

export type { Sticker };

/** Every sticker, named for this edition. */
export const STICKERS: Sticker[] = FAMILY ? ALL.map(s => ({ ...s, name: FAMILY_NAMES[s.id] ?? s.name })) : ALL;

/** Prefer stickers the child doesn't have yet. */
export function nextSticker(owned: string[]): Sticker {
  const fresh = STICKERS.filter(s => !owned.includes(s.id));
  return pickOne(fresh.length ? fresh : STICKERS);
}
