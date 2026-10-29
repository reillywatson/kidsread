// Every texture the game uses. Built-in art is SVG, rasterized at load.
//
// To use your own pictures instead, drop a PNG/WebP/JPG into src/assets/art/ named after
// the texture key (e.g. "pikachu.png", "pup-chase.png", "zombie.png"). It replaces the
// drawing everywhere. Transparent backgrounds work best.
import * as pk from './pokemon';
import * as pvz from './pvz';
import * as paw from './paw';
import * as fr from './friends';
import * as bg from './scenes';

export { PUP_NAMES, pupName, type PupId } from './paw';

const W = 1280, H = 720;

/** key -> [svg, raster width, raster height]. Rasterized ~2× drawn size so tablets stay crisp. */
export const TEXTURES: Record<string, [string, number, number]> = {
  pikachu: [pk.pikachu('happy'), 320, 400],
  pikachuSurprised: [pk.pikachu('surprised'), 320, 400],
  bulbasaur: [pk.bulbasaur(), 384, 336],
  charmander: [pk.charmander(), 336, 400],
  squirtle: [pk.squirtle(), 336, 400],
  pokeball: [pk.pokeball(), 220, 220],
  peashooter: [pvz.peashooter(), 330, 360],
  sunflower: [pvz.sunflower(true), 330, 405],
  sunflowerSad: [pvz.sunflower(false), 330, 405],
  wallnut: [pvz.wallnut(), 270, 315],
  zombie: [pvz.zombie(false), 260, 390],
  zombieCone: [pvz.zombie(true), 260, 390],
  pea: [pvz.pea(), 60, 60],
  sun: [pvz.sunToken(), 260, 260],
  pot: [pvz.flowerPot(), 320, 300],
  ...Object.fromEntries(paw.PUP_NAMES.map(p => [`pup-${p}`, [paw.pup(p), 360, 393]])),
  pawBadge: [paw.pawBadge(), 200, 220],
  truck: [paw.pupTruck('#2f6fe0', '#173e96'), 440, 260],
  fireTruck: [paw.pupTruck('#ef4b3f', '#a51b12'), 440, 260],
  bone: [paw.bone(), 240, 120],
  monster: [fr.monster('open'), 280, 340],
  monsterYuck: [fr.monster('yuck'), 280, 340],
  monsterHappy: [fr.monster('smile'), 280, 340],
  frog: [fr.frog(), 280, 240],
  lilypad: [fr.lilypad(), 320, 160],
  bubble: [fr.bubble(), 240, 240],
  star: [fr.star(true), 140, 140],
  starEmpty: [fr.star(false), 140, 140],
  gift: [fr.gift(), 260, 260],
  speaker: [fr.speaker(), 96, 96],
  plus: [fr.plus(), 200, 200],
  bgHome: [bg.bgHome(), W, H],
  bgLawn: [bg.bgLawn(), W, H],
  bgSky: [bg.bgSky(), W, H],
  bgField: [bg.bgField(), W, H],
  bgBay: [bg.bgBay(), W, H],
  bgPond: [bg.bgPond(), W, H],
  bgKitchen: [bg.bgKitchen(), W, H],
  bgBook: [bg.bgBook(), W, H],
  bgSea: [bg.bgSea(), W, H],
  bgGarden: [bg.bgGarden(), W, H],
};

/** Images placed in src/assets/art/, keyed by texture name. */
export const OVERRIDES: Record<string, string> = Object.fromEntries(
  Object.entries(import.meta.glob('../assets/art/*.{png,webp,jpg,jpeg}', { eager: true, query: '?url', import: 'default' }))
    .map(([path, url]) => [path.split('/').pop()!.replace(/\.\w+$/, ''), url as string]),
);

/** Profile avatars (texture keys). */
export const AVATARS = ['pikachu', 'bulbasaur', 'charmander', 'squirtle', 'pup-chase', 'pup-marshall', 'pup-skye', 'pup-rubble',
  'peashooter', 'sunflower', 'wallnut', 'zombie', 'monsterHappy', 'frog'];
