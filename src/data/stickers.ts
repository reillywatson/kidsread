// Sticker rewards: character textures and emoji. No imports (read by the voice script).

export interface Sticker { id: string; texture?: string; emoji?: string; name: string }

export const STICKERS: Sticker[] = [
  { id: 'peashooter', texture: 'peashooter', name: 'Peashooter' },
  { id: 'sunflower', texture: 'sunflower', name: 'Sunflower' },
  { id: 'wallnut', texture: 'wallnut', name: 'Wall-nut' },
  { id: 'zombie', texture: 'zombie', name: 'Zombie' },
  { id: 'conehead', texture: 'zombieCone', name: 'Conehead Zombie' },
  { id: 'pikachu', texture: 'pikachu', name: 'Pikachu' },
  { id: 'bulbasaur', texture: 'bulbasaur', name: 'Bulbasaur' },
  { id: 'charmander', texture: 'charmander', name: 'Charmander' },
  { id: 'squirtle', texture: 'squirtle', name: 'Squirtle' },
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
