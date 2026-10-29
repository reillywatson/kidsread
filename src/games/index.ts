// Registry of minigames. To add one: write a BaseGame subclass with a `meta`, then list it here.
import * as zombies from './Zombies';
import * as suns from './Suns';
import * as pikablend from './PikaBlend';
import * as pikaspell from './PikaSpell';
import * as pupmessage from './PupMessage';
import * as pupmemory from './PupMemory';
import * as monster from './Monster';
import * as frog from './Frog';
import * as bubbles from './Bubbles';
import * as evolve from './Evolve';
import * as bones from './Bones';
import * as garden from './Garden';

export const GAMES = [
  { meta: zombies.meta, scene: zombies.Zombies },
  { meta: suns.meta, scene: suns.Suns },
  { meta: garden.meta, scene: garden.Garden },
  { meta: pikablend.meta, scene: pikablend.PikaBlend },
  { meta: pikaspell.meta, scene: pikaspell.PikaSpell },
  { meta: evolve.meta, scene: evolve.Evolve },
  { meta: pupmessage.meta, scene: pupmessage.PupMessage },
  { meta: pupmemory.meta, scene: pupmemory.PupMemory },
  { meta: bones.meta, scene: bones.Bones },
  { meta: monster.meta, scene: monster.Monster },
  { meta: frog.meta, scene: frog.Frog },
  { meta: bubbles.meta, scene: bubbles.Bubbles },
];
