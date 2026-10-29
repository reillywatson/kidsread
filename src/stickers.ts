// Sticker rewards: character textures and emoji. One per finished session.
import { pickOne } from './learner';

export interface Sticker { id: string; texture?: string; emoji?: string; name: string }

export const STICKERS: Sticker[] = [
  { id: 'peashooter', texture: 'peashooter', name: 'Peashooter' },
  { id: 'sunflower', texture: 'sunflower', name: 'Sunflower' },
  { id: 'zombie', texture: 'zombie', name: 'Zombie' },
  { id: 'pikachu', texture: 'pikachu', name: 'Pikachu' },
  { id: 'pokeball', texture: 'pokeball', name: 'Poké Ball' },
  { id: 'chase', texture: 'pup-chase', name: 'Chase' },
  { id: 'marshall', texture: 'pup-marshall', name: 'Marshall' },
  { id: 'skye', texture: 'pup-skye', name: 'Skye' },
  { id: 'rubble', texture: 'pup-rubble', name: 'Rubble' },
  { id: 'monster', texture: 'monsterHappy', name: 'Letter Monster' },
  { id: 'frog', texture: 'frog', name: 'Froggy' },
  ...[['🦄', 'unicorn'], ['🚀', 'rocket'], ['🦖', 'dinosaur'], ['🌈', 'rainbow'], ['🍦', 'ice cream'], ['🐙', 'octopus'],
    ['🦋', 'butterfly'], ['🐳', 'whale'], ['🎈', 'balloon'], ['🏆', 'trophy'], ['🦁', 'lion'], ['🐉', 'dragon'],
    ['🍩', 'donut'], ['🚒', 'fire truck'], ['🎸', 'guitar'], ['🐧', 'penguin'], ['🦈', 'shark'], ['🍕', 'pizza'],
    ['🚂', 'train'], ['🐢', 'turtle'], ['🌋', 'volcano'], ['🦒', 'giraffe'], ['🐼', 'panda'], ['🎂', 'cake'], ['👑', 'crown']]
    .map(([emoji, name]) => ({ id: emoji, emoji, name })),
];

/** Prefer stickers the child doesn't have yet. */
export function nextSticker(owned: string[]): Sticker {
  const fresh = STICKERS.filter(s => !owned.includes(s.id));
  return pickOne(fresh.length ? fresh : STICKERS);
}
