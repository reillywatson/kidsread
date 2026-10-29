// Friends — phonological awareness (no reading): hop the frog to the picture that rhymes.
import Phaser from 'phaser';
import { BaseGame, type GameMeta } from './BaseGame';
import { rhymeRound } from '../choices';
import { pickOne } from '../learner';
import { LINES } from '../lines';
import { burst, emoji, picture, sprite } from '../widgets';

export const meta: GameMeta = {
  id: 'frog',
  theme: 'friends',
  skill: 'rhyme',
  title: 'Rhyme Frog — hop to the rhyming picture',
  intro: LINES.intro.frog,
  icon: 'frog',
  eligible: () => true,
};

const HOME = { x: 640, y: 620 };

export class Frog extends BaseGame {
  private frog!: Phaser.GameObjects.Image;

  constructor() { super(meta); }

  protected setup() {
    this.add.image(640, 360, 'bgPond');
    sprite(this, HOME.x, HOME.y + 40, 'lilypad', 110);
    this.frog = this.tickle(sprite(this, HOME.x, HOME.y, 'frog', 130), () => void this.say(pickOne(LINES.ribbit), 'frog').catch(() => {}));
  }

  /** A fly buzzes by and the frog's tongue snaps it up. */
  private async catchFly() {
    const f = this.frog;
    const fly = emoji(this, f.x + 260, f.y - 220, '🪰', 44);
    this.sfx.buzz();
    await this.tween({ targets: fly, x: f.x + 130, y: f.y - 120, duration: 700, ease: 'Sine.InOut' });
    const mouth = { x: f.x + 20, y: f.y - 10 };
    const tongue = this.add.graphics();
    tongue.lineStyle(12, 0xff6f91).lineBetween(mouth.x, mouth.y, fly.x, fly.y).fillStyle(0xff6f91).fillCircle(fly.x, fly.y, 10);
    this.sfx.slurp();
    await this.wait(140);
    fly.destroy();
    tongue.destroy();
    await this.tween({ targets: f, scaleY: f.scaleY * 1.12, duration: 120, yoyo: true });
  }

  protected async run() {
    const n = this.rounds(5);
    const nChoices = [2, 3, 3][this.tier];

    for (let r = 0; r < n && !this.timeUp(); r++) {
      const round = rhymeRound(nChoices, this.tier);
      const target = picture(this, 200, 560, round.target, { size: 90 });
      const xs = round.choices.map((_, i) => 640 + (i - (round.choices.length - 1) / 2) * 330);
      const pads = round.choices.map((_, i) => sprite(this, xs[i], 400, 'lilypad', 120));
      const cards = round.choices.map((w, i) => picture(this, xs[i], 290, w, { size: 90 }));
      cards.forEach((c, i) => this.tweens.add({ targets: [c, pads[i]], y: '+=8', duration: 900 + i * 100, yoyo: true, repeat: -1, ease: 'Sine.InOut' }));

      await this.prompt(async () => {
        await this.say(LINES.rhymesWith);
        await this.say(round.target);
        for (const c of cards) {
          c.setScale(1.1);
          await this.say(round.choices[cards.indexOf(c)]);
          c.setScale(1);
        }
      });
      const res = await this.choose(cards, round.choices.indexOf(round.answer), {
        onWrong: obj => {
          this.sfx.splash();
          const pad = pads[cards.indexOf(obj as Phaser.GameObjects.Container)];
          this.tweens.add({ targets: pad, alpha: 0.4, duration: 300 });
        },
        onScaffold: () => { void this.say(round.target).then(() => this.say(round.answer)).catch(() => {}); },
      });
      this.learner.pushRecent('rhyme', res.firstTry);
      this.score(res.firstTry);

      const i = cards.indexOf(res.obj as Phaser.GameObjects.Container);
      this.sfx.hop();
      await Promise.all([
        this.tween({ targets: this.frog, x: xs[i], duration: 600, ease: 'Linear' }),
        (async () => {
          await this.tween({ targets: this.frog, y: 180, duration: 300, ease: 'Quad.Out' });
          await this.tween({ targets: this.frog, y: 370, duration: 300, ease: 'Quad.In' });
        })(),
      ]);
      burst(this, xs[i], 380, ['💧', '✨', '🐸']);
      if (Math.random() < 0.5) await this.catchFly();
      await this.say(pickOne(LINES.ribbit), 'frog');
      await this.say(round.target);
      await this.say(round.answer);
      await this.praise(res.firstTry);
      [target, ...cards, ...pads].forEach(o => { this.tweens.killTweensOf(o); o.destroy(); });
      this.frog.setPosition(HOME.x, HOME.y);
      this.progress();
    }
  }
}
