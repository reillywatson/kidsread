// Plants vs. Zombies — word recognition: hear a word, catch the sun that says it.
// Includes heart words; distractors get closer to the target as the tier rises.
// A sun counter ticks up 25 a sun, as in the real game, and every sun caught plants a sunflower
// in the row along the bottom. At the end, every sunflower makes a bonus sun for the counter.
import Phaser from 'phaser';
import { BaseGame, type GameMeta } from './BaseGame';
import { readableWords, wordDistractors, wordItem } from '../choices';
import { shuffle } from '../learner';
import { LINES } from '../lines';
import { WordView, burst, sprite, tappable, text } from '../widgets';

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
  private bank = 0;
  private bankLabel!: Phaser.GameObjects.Text;
  private bankBox!: Phaser.GameObjects.Container;
  private row: Phaser.GameObjects.Image[] = [];

  constructor() { super(meta); }

  protected setup() {
    this.add.image(640, 360, 'bgSky');
    this.flower = this.tickle(sprite(this, 150, 520, 'sunflower', 300));
    this.count = this.bank = 0;
    this.row = [];
    // The sun counter, top left by the home button.
    this.bankLabel = text(this, 36, 0, '0', 40);
    this.bankBox = this.add.container(214, 56, [
      this.add.rectangle(14, 0, 150, 60, 0xffffff, 0.85).setStrokeStyle(4, 0xffc94d),
      sprite(this, -36, 0, 'sun', 56), this.bankLabel]).setDepth(900);
  }

  /** Count the bank up by 25, a little at a time. */
  private addSun() {
    const from = this.bank;
    this.bank += 25;
    this.tweens.addCounter({ from, to: this.bank, duration: 400, onUpdate: t => this.bankLabel.setText(String(Math.round(t.getValue() ?? 0))) });
    this.tweens.add({ targets: this.bankBox, scale: { from: 1.2, to: 1 }, duration: 250, ease: 'Back.Out' });
    this.sfx.twinkle();
  }

  /** A sun flies from (x, y) into the counter. */
  private async bankSun(x: number, y: number, size = 70) {
    const s = sprite(this, x, y, 'sun', size).setDepth(950);
    await this.tween({ targets: s, x: this.bankBox.x - 36, y: this.bankBox.y, scale: 56 / s.height, duration: 550, ease: 'Cubic.In' });
    s.destroy();
    this.addSun();
  }

  /** A new sunflower sprouts in the row along the bottom. */
  private plant() {
    const i = this.row.length;
    const x = 330 + i * 125;
    const f = sprite(this, x, 640, 'sunflower', 120);
    const full = f.scale;
    f.setScale(0);
    this.tweens.add({ targets: f, scale: full, duration: 450, ease: 'Back.Out' });
    this.tweens.add({ targets: f, angle: { from: -4, to: 4 }, duration: 800 + i * 90, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.row.push(f);
  }

  /** Every sunflower in the row makes a bonus sun. */
  private async sunShower() {
    for (const f of this.row) {
      this.tweens.add({ targets: f, y: f.y - 24, duration: 160, yoyo: true, ease: 'Quad.Out' });
      void this.bankSun(f.x, f.y - 50, 60);
      await this.wait(260);
    }
    await this.wait(700);
    if (this.row.length) burst(this, this.bankBox.x, this.bankBox.y + 40, ['☀️', '✨'], 12);
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
      await this.tween({ targets: sun, x: this.bankBox.x - 36, y: this.bankBox.y, scale: 0.28, duration: 600, ease: 'Cubic.In' });
      sun.setVisible(false);
      this.addSun();
      burst(this, this.flower.x, this.flower.y - 100, ['☀️', '✨', '🌻']);
      this.plant();
      // Every sun makes the sunflower grow a little taller.
      this.count++;
      const grown = (300 / this.flower.height) * (1 + 0.07 * this.count);
      this.sfx.grow();
      this.tweens.add({ targets: this.flower, scale: grown * 1.12, duration: 200, ease: 'Quad.Out',
        onComplete: () => this.tweens.add({ targets: this.flower, scale: grown, duration: 250, ease: 'Back.Out' }) });
      await this.say(w);
      await this.praise(res.firstTry);
      suns.forEach(s => s.destroy());
      this.progress();
    }
    await this.sunShower();
  }
}
