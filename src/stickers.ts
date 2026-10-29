import { pickOne } from './learner';
import { STICKERS, type Sticker } from './data/stickers';

export { STICKERS, type Sticker };

/** Prefer stickers the child doesn't have yet. */
export function nextSticker(owned: string[]): Sticker {
  const fresh = STICKERS.filter(s => !owned.includes(s.id));
  return pickOne(fresh.length ? fresh : STICKERS);
}
