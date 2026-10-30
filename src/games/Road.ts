// Paw Patrol — letter formation: the letter is a road. Drive Chase's truck along it from the
// green light, stroke by stroke; the road lights up behind the truck. Then the siren plays and
// the letter says its sound.
import Phaser from 'phaser';
import { BaseGame, type GameMeta } from './BaseGame';
import { GRAPHEMES } from '../data/curriculum';
import { LINES } from '../lines';
import * as audio from '../audio';
import { Tracer, traceable } from '../trace';
import { burst, picture, sprite } from '../widgets';

export const meta: GameMeta = {
  id: 'road',
  theme: 'paw',
  skill: 'writing',
  title: 'Letter Road — drive the truck along each letter',
  intro: LINES.intro.road,
  icon: 'truck',
  eligible: () => true,
};

export class Road extends BaseGame {
  private chase!: Phaser.GameObjects.Image;

  constructor() { super(meta); }

  protected setup() {
    this.add.image(640, 360, 'bgBay');
    this.chase = this.tickle(sprite(this, 1130, 540, 'pup-chase', 230), () => void audio.say(LINES.ruff, { style: 'pup' }));
  }

  protected async run() {
    const n = this.rounds(3);
    const letters = this.learner.pick(['g'], n, { filter: traceable });
    const tol = [56, 46, 38][this.tier];

    for (let r = 0; r < letters.length && !this.timeUp(); r++) {
      const g = letters[r];
      const truck = sprite(this, 0, 0, 'truck', 52);
      const t = new Tracer(this, g, {
        mode: 'trace',
        ink: () => 0x42a5f5,
        track: 0x607d8b,
        dashes: 0xffffff,
        rider: truck,
        riderTurns: true,
        onStep: () => this.sfx.siren(),
      }, tol);
      t.draw();

      await this.prompt(async () => {
        await this.letterSound(g);
        if (r === 0 || this.tier === 0) { await this.say(LINES.watchMe); await t.demo(); }
        await this.say(LINES.yourTurn);
      });
      await t.play();
      this.learner.pushRecent('writing', t.on / Math.max(1, t.on + t.off) >= 0.7);
      this.learner.record('g:' + g, 'seen');
      this.score(true);

      // Paw prints along the finished letter, and Chase cheers.
      for (const [x, y] of t.points().filter((_, i) => i % 14 === 0)) burst(this, x, y, ['🐾', '⭐'], 2);
      this.sfx.bark();
      this.tweens.add({ targets: this.chase, y: this.chase.y - 50, duration: 200, yoyo: true, repeat: 1, ease: 'Quad.Out' });
      const card = picture(this, 1130, 230, GRAPHEMES[g].key, { size: 80 });
      await this.letterSound(g);
      await this.keyword(g);
      await this.praise(true);
      t.destroy();
      [truck, card].forEach(o => o.destroy());
      this.progress();
    }
  }
}
