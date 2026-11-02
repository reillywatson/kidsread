// Two editions of the game, picked when it's built. The original edition (the default, and the
// only one for the app stores) has its own characters. The family edition (EDITION=family, which
// `npm run deploy` uses for the site the kids play at home) swaps in characters from shows and
// games they love: Plants vs. Zombies, Pokémon and Paw Patrol. Those belong to other companies,
// so the family edition is for private use only and is never published.
//
// The code names each character by its part ('hero', 'pest', 'pup-lead'…); the art, the names
// and the spoken lines are what change between editions. Building one edition leaves the other's
// art, lines and recordings out entirely (see the edition plugin in vite.config.ts).
declare const __FAMILY__: boolean;

export const FAMILY: boolean = __FAMILY__;

/**
 * Ids from before the editions, when they were named after the family edition's characters:
 * texture keys (profile pictures) and sticker ids. Saved progress and backups from then still
 * have them. Only the family edition was played then, so only it needs them.
 */
const RENAMED: Record<string, string> = FAMILY ? {
  pikachu: 'hero', pikachuSurprised: 'heroSurprised', bulbasaur: 'leafy', charmander: 'ember', squirtle: 'splash', pokeball: 'catcher',
  peashooter: 'shooter', wallnut: 'roller', zombie: 'pest', zombieCone: 'pestBig', conehead: 'pestBig', pawBadge: 'badge',
  chase: 'pup-lead', marshall: 'pup-fire', skye: 'pup-fly', rubble: 'pup-dig',
  'pup-chase': 'pup-lead', 'pup-marshall': 'pup-fire', 'pup-skye': 'pup-fly', 'pup-rubble': 'pup-dig',
  'pupHead-chase': 'pupHead-lead', 'pupHead-marshall': 'pupHead-fire', 'pupHead-skye': 'pupHead-fly', 'pupHead-rubble': 'pupHead-dig',
} : {};

/** The current id for a saved texture key or sticker id. */
export const renamed = (id: string) => RENAMED[id] ?? id;
