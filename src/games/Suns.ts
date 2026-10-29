// Plants vs. Zombies — word recognition: hear a word, catch the sun that says it.
// Includes heart words; distractors get closer to the target as the tier rises.
import Phaser from 'phaser';
import { BaseGame, type GameMeta } from './BaseGame';
import { readableWords, wordDistractors, wordItem } from '../choices';
import { shuffle } from '../learner';
import { LINES } from '../lines';
import { WordView, burst, sprite, tappable } from '../widgets';

export const meta: GameMeta = {
  id: 'suns',
  theme: 'pvz',
  skill: 'word',
  title: 'Sunflower Suns — hear a word, tap the matching word',
  intro: LINES.intro.suns,
  icon: 'sunflower',
  eligible: lesson => readableWords(lesson).length >= 4,
};

export class Suns extends BaseGame {
  private flower!: Phaser.GameObjects.Image;
  private count = 0;

  constructor() { super(meta); }

  protected setup() {
    this.add.image(640, 360, 'bgSky');
    this.flower = sprite(this, 150, 520, 'sunflower', 300);
    this.count = 0;
  }

  protected async run() {
    const n = this.rounds(6);
    const words = this.learner.pick(['w', 'h'], n);
    const nChoices = [2, 3, 4][this.tier];
    const fall = [16, 13, 10][this.tier];

    for (let r = 0; r < words.length && !this.timeUp(); r++) {
      const w = words[r];
      const opts = shuffle([w, ...wordDistractors(w, nChoices - 1, this.tier, this.lesson)]);
      const xs = shuffle(opts.map((_, i) => 440 + i * (700 / Math.max(1, opts.length - 1))));
      const suns = opts.map((word, i) => {
        const c = this.add.container(xs[i], 170 - i * 130);
        c.add([sprite(this, 0, 0, 'sun', 200), new WordView(this, 0, 0, word, { size: 50, dots: false, tapSounds: false })]);
        tappable(c, 200, 200);
        const drop = () => this.tweens.add({ targets: c, y: 640, duration: fall * 1000 * ((640 - c.y) / 760), ease: 'Linear', onComplete: () => { c.y = -120; drop(); } });
        drop();
        this.tweens.add({ targets: c, angle: { from: -6, to: 6 }, duration: 900, yoyo: true, repeat: -1 });
        return c;
      });

      await this.prompt(async () => {
        await this.say(r === 0 ? LINES.catchSun : LINES.find);
        await this.say(w);
      });
      const res = await this.choose(suns, opts.indexOf(w), { onScaffold: () => { void this.say(w).catch(() => {}); } });
      this.record(wordItem(w), res.firstTry ? 'correct' : 'wrong');
      this.score(res.firstTry);

      const sun = res.obj as Phaser.GameObjects.Container;
      this.tweens.killTweensOf(sun);
      suns.filter(s => s !== sun).forEach(s => { this.tweens.killTweensOf(s); this.tweens.add({ targets: s, alpha: 0, duration: 300 }); });
      this.sfx.star();
      await this.tween({ targets: sun, x: this.flower.x, y: this.flower.y - 100, scale: 0.3, duration: 600, ease: 'Cubic.In' });
      burst(this, this.flower.x, this.flower.y - 100, ['☀️', '✨', '🌻']);
      this.count++;
      this.tweens.add({ targets: this.flower, scaleX: this.flower.scaleX * 1.12, scaleY: this.flower.scaleY * 1.12, duration: 200, yoyo: true });
      await this.say(w);
      await this.praise(res.firstTry);
      suns.forEach(s => s.destroy());
      this.progress();
    }
  }
}
