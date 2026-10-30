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
import * as wordtruck from './WordTruck';
import * as truesilly from './TrueSilly';
import * as missingword from './MissingWord';
import * as boss from './Boss';
import * as river from './River';
import * as ladder from './Ladder';
import * as rocket from './Rocket';
import * as ispy from './ISpy';
import * as drum from './Drum';
import * as dash from './Dash';
import * as sort from './Sort';
import * as rainbow from './Rainbow';
import * as road from './Road';
import * as starletters from './StarLetters';
import * as evolve from './Evolve';
import * as bones from './Bones';
import * as garden from './Garden';
import * as bowling from './Bowling';
import * as whack from './Whack';
import * as treats from './Treats';
import * as balloons from './Balloons';

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
  { meta: wordtruck.meta, scene: wordtruck.WordTruck },
  { meta: truesilly.meta, scene: truesilly.TrueSilly },
  { meta: missingword.meta, scene: missingword.MissingWord },
  // Goal games: every answer moves a character toward a goal.
  { meta: boss.meta, scene: boss.Boss },
  { meta: river.meta, scene: river.River },
  { meta: ladder.meta, scene: ladder.Ladder },
  { meta: rocket.meta, scene: rocket.Rocket },
  { meta: ispy.meta, scene: ispy.ISpy },
  { meta: drum.meta, scene: drum.Drum },
  { meta: dash.meta, scene: dash.Dash },
  { meta: sort.meta, scene: sort.Sort },
  // Letter tracing (letter formation).
  { meta: rainbow.meta, scene: rainbow.Rainbow },
  { meta: road.meta, scene: road.Road },
  { meta: starletters.meta, scene: starletters.StarLetters },
  // Bonus games: just for fun, never chosen directly (see session.ts).
  { meta: bowling.meta, scene: bowling.Bowling },
  { meta: whack.meta, scene: whack.Whack },
  { meta: treats.meta, scene: treats.Treats },
  { meta: balloons.meta, scene: balloons.Balloons },
];
