// Friends — letter formation: watch the letter being written, then trace it with your finger,
// painting a rainbow. When it's done, the letter says its sound and shows its keyword.
import Phaser from 'phaser';
import { BaseGame, type GameMeta } from './BaseGame';
import { GRAPHEMES } from '../data/curriculum';
import { LINES } from '../lines';
import { Tracer, traceable } from '../trace';
import { burst, emoji, picture, sprite } from '../widgets';

export const meta: GameMeta = {
  id: 'rainbow',
  theme: 'friends',
  skill: 'writing',
  title: 'Rainbow Letters — trace each letter',
  intro: LINES.intro.rainbow,
  icon: 'star',
  eligible: () => true,
};

export class Rainbow extends BaseGame {
  private monster!: Phaser.GameObjects.Image;

  constructor() { super(meta); }

  protected setup() {
    this.add.image(640, 360, 'bgHome');
    this.monster = this.tickle(sprite(this, 1120, 520, 'monsterHappy', 240));
  }

  protected async run() {
    const n = this.rounds(3);
    const letters = this.learner.pick(['g'], n, { filter: traceable });
    const tol = [56, 46, 38][this.tier];

    for (let r = 0; r < letters.length && !this.timeUp(); r++) {
      const g = letters[r];
      const brush = emoji(this, 0, 0, '🖌️', 54).setOrigin(0.15, 0.85);
      const t = new Tracer(this, this.traceForm(g), {
        mode: 'trace',
        ink: (i, total) => Phaser.Display.Color.HSVToRGB(i / total, 0.75, 1).color,
        track: 0xe0e0e0,
        rider: brush,
      }, tol);
      t.draw();

      await this.prompt(async () => {
        await this.letterSound(g);
        if (r === 0 || this.tier === 0) { await this.say(LINES.watchMe); await t.demo(); }
        await this.say(LINES.yourTurn);
      });
      await t.play();
      const neat = t.on / Math.max(1, t.on + t.off) >= 0.7;
      this.learner.pushRecent('writing', neat);
      this.learner.record('g:' + g, 'seen');
      this.score(true);

      // The finished letter sparkles and says its sound.
      for (const [x, y] of t.points().filter((_, i) => i % 18 === 0)) burst(this, x, y, ['✨', '⭐'], 2);
      this.tweens.add({ targets: this.monster, y: this.monster.y - 50, duration: 200, yoyo: true, repeat: 1, ease: 'Quad.Out' });
      const card = picture(this, 1120, 230, GRAPHEMES[g].key, { size: 80 });
      await this.letterSound(g);
      await this.keyword(g);
      await this.praise(true);
      t.destroy();
      [brush, card].forEach(o => o.destroy());
      this.progress();
    }
  }
}
