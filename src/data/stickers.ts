// Sticker rewards: character textures and emoji. No imports (read by the voice script).
// Names are the original edition's; FAMILY_NAMES has the family edition's (see src/edition.ts).

export interface Sticker { id: string; texture?: string; emoji?: string; name: string }

export const STICKERS: Sticker[] = [
  { id: 'shooter', texture: 'shooter', name: 'Spritz' },
  { id: 'sunflower', texture: 'sunflower', name: 'Sunflower' },
  { id: 'roller', texture: 'roller', name: 'Pumpkin' },
  { id: 'pest', texture: 'pest', name: 'Muncher' },
  { id: 'pestBig', texture: 'pestBig', name: 'Big Muncher' },
  { id: 'hero', texture: 'hero', name: 'Zippy' },
  { id: 'leafy', texture: 'leafy', name: 'Bramble' },
  { id: 'ember', texture: 'ember', name: 'Ember' },
  { id: 'splash', texture: 'splash', name: 'Lolo' },
  { id: 'catcher', texture: 'catcher', name: 'Acorn' },
  { id: 'pup-lead', texture: 'pup-lead', name: 'Scout' },
  { id: 'pup-fire', texture: 'pup-fire', name: 'Biscuit' },
  { id: 'pup-fly', texture: 'pup-fly', name: 'Pip' },
  { id: 'pup-dig', texture: 'pup-dig', name: 'Moose' },
  { id: 'monster', texture: 'monsterHappy', name: 'Letter Monster' },
  { id: 'frog', texture: 'frog', name: 'Froggy' },
  ...[['🦄', 'unicorn'], ['🚀', 'rocket'], ['🦖', 'dinosaur'], ['🌈', 'rainbow'], ['🍦', 'ice cream'], ['🐙', 'octopus'],
    ['🦋', 'butterfly'], ['🐳', 'whale'], ['🎈', 'balloon'], ['🏆', 'trophy'], ['🦁', 'lion'], ['🐉', 'dragon'],
    ['🍩', 'donut'], ['🚒', 'fire truck'], ['🎸', 'guitar'], ['🐧', 'penguin'], ['🦈', 'shark'], ['🍕', 'pizza'],
    ['🚂', 'train'], ['🐢', 'turtle'], ['🌋', 'volcano'], ['🦒', 'giraffe'], ['🐼', 'panda'], ['🎂', 'cake'], ['👑', 'crown']]
    .map(([emoji, name]) => ({ id: emoji, emoji, name })),
];

/** The family edition's names for its characters, by sticker id. */
export const FAMILY_NAMES: Record<string, string> = {
  shooter: 'Peashooter', roller: 'Wall-nut', pest: 'Zombie', pestBig: 'Conehead Zombie',
  hero: 'Pikachu', leafy: 'Bulbasaur', ember: 'Charmander', splash: 'Squirtle', catcher: 'Poké Ball',
  'pup-lead': 'Chase', 'pup-fire': 'Marshall', 'pup-fly': 'Skye', 'pup-dig': 'Rubble',
};
