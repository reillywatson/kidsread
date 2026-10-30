// Reading Island: the adventure map. The lessons, in order, are stepping stones through eight
// lands; each land ends at a gate that's won by playing one of the goal games, and a new friend
// joins the adventure. Treasure chests (one per land) open with stars.
// No Phaser here (pure data, tested in tests/map.test.ts).
import { LESSON_NUMS } from './curriculum';

export type GateGame = 'rocket' | 'boss' | 'ladder' | 'river';

export interface Region {
  id: string;
  name: string;
  theme: 'pvz' | 'pokemon' | 'paw' | 'friends';
  /** First and last lesson numbers in this land. */
  first: number;
  last: number;
  /** Ground colors (light, dark) and scenery. */
  colors: [number, number];
  decor: string[];
  /** The goal game played at the gate, and what it's for. */
  gate: GateGame;
  /** Who joins the adventure when the gate is won: a texture, and the sticker id it adds. */
  friend: string;
  sticker: string;
}

export const REGIONS: Region[] = [
  { id: 'meadow', name: 'Sunny Meadow', theme: 'friends', first: 1, last: 9, colors: [0xb9e88a, 0x8fcf5c],
    decor: ['🌼', '🌷', '🦋', '🌳', '🐞', '🌻'], gate: 'rocket', friend: 'monsterHappy', sticker: 'monster' },
  { id: 'backyard', name: 'Zombie Backyard', theme: 'pvz', first: 12, last: 17, colors: [0xa7d96b, 0x7cc242],
    decor: ['🌻', '🪦', '🏡', '🌱', '🍄', '🪴'], gate: 'boss', friend: 'peashooter', sticker: 'peashooter' },
  { id: 'bay', name: 'Adventure Bay', theme: 'paw', first: 18, last: 26, colors: [0xffe2a8, 0xf5c86b],
    decor: ['🏖️', '⛵', '🐚', '🌴', '🦀', '🗼'], gate: 'ladder', friend: 'pup-chase', sticker: 'chase' },
  { id: 'forest', name: 'Pokémon Forest', theme: 'pokemon', first: 27, last: 39, colors: [0x9ed48a, 0x5fa64a],
    decor: ['🌲', '🌳', '🍄', '🦔', '🍃', '⚡'], gate: 'river', friend: 'pikachu', sticker: 'pikachu' },
  { id: 'peaks', name: 'Lookout Peaks', theme: 'paw', first: 42, last: 52, colors: [0xd8e4ea, 0xa9bcc8],
    decor: ['⛰️', '🏔️', '🐐', '🌲', '🦅', '❄️'], gate: 'ladder', friend: 'pup-skye', sticker: 'skye' },
  { id: 'volcano', name: 'Magic-E Volcano', theme: 'pvz', first: 54, last: 58, colors: [0xf2b48a, 0xd97a4a],
    decor: ['🌋', '🔥', '🪨', '🌵', '💎', '🦎'], gate: 'boss', friend: 'wallnut', sticker: 'wallnut' },
  { id: 'castle', name: 'Star Castle', theme: 'pokemon', first: 60, last: 70, colors: [0xd9c8f2, 0xb39ae0],
    decor: ['🏰', '⭐', '🐉', '👑', '🦄', '🌈'], gate: 'river', friend: 'charmander', sticker: 'charmander' },
  { id: 'moon', name: 'Moon Islands', theme: 'friends', first: 72, last: 82, colors: [0x5c6bc0, 0x3949ab],
    decor: ['🌙', '⭐', '🪐', '🌟', '☁️', '🛸'], gate: 'rocket', friend: 'squirtle', sticker: 'squirtle' },
];

export const regionOf = (lesson: number) => REGIONS.find(r => lesson >= r.first && lesson <= r.last) ?? REGIONS[0];
export const lessonsOf = (r: Region) => LESSON_NUMS.filter(n => n >= r.first && n <= r.last);

/** Stars needed to open each land's treasure chest. */
export const CHEST_STARS = [8, 20, 35, 55, 80, 110, 145, 185];

/** What the map remembers per player. */
export interface MapState {
  /** Where the explorer was last shown (a spot key: "L12", or "Gmeadow" for a gate), for hopping forward. */
  at?: string;
  /** The lesson at that time. */
  seen?: number;
  /** Gates won, and gates whose opening has been celebrated on the map. */
  cleared: string[];
  celebrated: string[];
  /** Chests opened (by land index). */
  chests: number[];
}

/**
 * Where the explorer stands: at the first gate that's been reached but not won (the land's last
 * lesson is behind them, or for the last land, the whole course is done), else on the current lesson.
 */
export function explorerAt(lesson: number, cleared: string[], courseDone = false): { gate: Region } | { lesson: number } {
  const gate = REGIONS.find(r => (lesson > r.last || (courseDone && r === REGIONS[REGIONS.length - 1])) && !cleared.includes(r.id));
  return gate ? { gate } : { lesson };
}
