// Pokémon — letter formation, dot to dot: the letter is a constellation. Touch the stars in
// order (or slide through them) and lines join them up; then Pikachu lights the letter up
// with a thunderbolt. Gentler than free tracing: only the stars have to be reached.
import Phaser from 'phaser';
import { BaseGame, type GameMeta } from './BaseGame';
import { GRAPHEMES } from '../data/curriculum';
import { pickOne } from '../learner';
import { LINES } from '../lines';
import * as audio from '../audio';
import { Tracer, traceable } from '../trace';
import { W, H, burst, emoji, picture, sprite } from '../widgets';

export const meta: GameMeta = {
  id: 'starletters',
  theme: 'pokemon',
  skill: 'writing',
  title: 'Star Letters — connect the stars to write each letter',
  intro: LINES.intro.stars,
  icon: 'pikachu',
  eligible: () => true,
};

export class StarLetters extends BaseGame {
  private pika!: Phaser.GameObjects.Image;

  constructor() { super(meta); }

  protected setup() {
    this.add.image(640, 360, 'bgField');
    this.add.rectangle(W / 2, H / 2, W, H, 0x0d1b4c, 0.72);
    for (let i = 0; i < 40; i++) {
      const s = emoji(this, Math.random() * W, Math.random() * H * 0.9, '✨', 10 + Math.random() * 14).setAlpha(0.6);
      this.tweens.add({ targets: s, alpha: 0.15, duration: 800 + Math.random() * 1500, yoyo: true, repeat: -1 });
    }
    this.pika = this.tickle(sprite(this, 1130, 530, 'pikachu', 220), () => void audio.say(pickOne(LINES.pika), { style: 'pika' }));
  }

  protected async run() {
    const n = this.rounds(3);
    const letters = this.learner.pick(['g'], n, { filter: traceable });
    const tol = [60, 50, 42][this.tier];

    for (let r = 0; r < letters.length && !this.timeUp(); r++) {
      const g = letters[r];
      const t = new Tracer(this, g, {
        mode: 'dots',
        ink: () => 0xffd21f,
        track: 0x283593,
        paper: [0x0d1b4c, 0.5],
      }, tol);
      t.draw();

      await this.prompt(async () => {
        await this.letterSound(g);
        if (r === 0 || this.tier === 0) { await this.say(LINES.watchMe); await t.demo(); }
        await this.say(LINES.touchStars);
      });
      await t.play();
      this.learner.pushRecent('writing', t.on / Math.max(1, t.on + t.off) >= 0.5);
      this.learner.record('g:' + g, 'seen');
      this.score(true);

      // Thunderbolt! The whole letter flashes.
      this.sfx.zap();
      this.cameras.main.flash(250, 255, 240, 120);
      for (const [x, y] of t.points().filter((_, i) => i % 12 === 0)) burst(this, x, y, ['⚡', '⭐'], 2);
      this.tweens.add({ targets: this.pika, y: this.pika.y - 60, duration: 220, yoyo: true, ease: 'Quad.Out' });
      void audio.say(pickOne(LINES.pika), { style: 'pika' });
      const card = picture(this, 1130, 230, GRAPHEMES[g].key, { size: 80 });
      await this.wait(700);
      await this.letterSound(g);
      await this.keyword(g);
      await this.praise(true);
      t.destroy();
      card.destroy();
      this.progress();
    }
  }
}
