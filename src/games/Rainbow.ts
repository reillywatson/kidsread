// Friends — letter formation: watch the letter being written, then trace it with your finger,
// painting a rainbow. When it's done, the letter says its sound and its keyword picture pops
// out and joins the parade along the bottom. At the end a rainbow arcs over the parade and each
// friend hops as its letter's sound plays.
import Phaser from 'phaser';
import { BaseGame, type GameMeta } from './BaseGame';
import { GRAPHEMES } from '../data/curriculum';
import { LINES } from '../lines';
import { Tracer, traceable } from '../trace';
import { W, burst, emoji, sprite, text } from '../widgets';

export const meta: GameMeta = {
  id: 'rainbow',
  theme: 'friends',
  skill: 'writing',
  title: 'Rainbow Letters — trace each letter',
  intro: LINES.intro.rainbow,
  icon: 'star',
  eligible: () => true,
};

const PARADE_Y = 660;
const BAND = [0xff5c5c, 0xffa53b, 0xffe14d, 0x5cd65c, 0x4fa8ff, 0x9a6bff];

export class Rainbow extends BaseGame {
  private monster!: Phaser.GameObjects.Image;
  private parade: { g: string; pic: Phaser.GameObjects.Text; tag: Phaser.GameObjects.Text }[] = [];

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
      // The keyword picture pops out of the letter...
      const pic = emoji(this, 640, 350, GRAPHEMES[g].pic, 150).setScale(0).setDepth(5);
      this.sfx.pop();
      await this.tween({ targets: pic, scale: 1, duration: 400, ease: 'Back.Out' });
      await this.letterSound(g);
      await this.keyword(g);
      await this.praise(true);
      t.destroy();
      brush.destroy();
      await this.joinParade(g, pic);
      this.progress();
    }
    await this.rainbowParade();
  }

  /** ...and hops down to join the parade along the bottom, wearing its letter. */
  private async joinParade(g: string, pic: Phaser.GameObjects.Text) {
    const i = this.parade.length;
    const x = 360 + i * 140;
    this.sfx.hop();
    this.tweens.add({ targets: pic, x, duration: 600, ease: 'Sine.InOut' });
    await this.tween({ targets: pic, y: { from: pic.y, to: PARADE_Y }, scale: 86 / 150, duration: 600, ease: 'Bounce.Out' });
    const color = '#' + BAND[i % BAND.length].toString(16).padStart(6, '0');
    const tag = text(this, x + 48, PARADE_Y - 40, this.shown(g), 46, color).setStroke('#3a2a1a', 7);
    this.tweens.add({ targets: tag, scale: { from: 0, to: 1 }, duration: 250, ease: 'Back.Out' });
    this.tweens.add({ targets: pic, angle: { from: -6, to: 6 }, duration: 500 + i * 60, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.parade.push({ g, pic, tag });
  }

  /** A rainbow arcs over the parade, and each friend hops as its letter says its sound. */
  private async rainbowParade() {
    if (!this.parade.length) return;
    const arc = this.add.graphics().setPosition(W / 2, 760).setAlpha(0).setScale(0.6);
    BAND.forEach((c, i) => arc.lineStyle(26, c, 0.9).beginPath().arc(0, 0, 470 - i * 26, Math.PI, 0).strokePath());
    this.sfx.sparkle();
    await this.tween({ targets: arc, alpha: 1, scale: 1, duration: 700, ease: 'Back.Out' });
    for (const { g, pic, tag } of this.parade) {
      this.tweens.add({ targets: [pic, tag], y: '-=50', duration: 200, yoyo: true, ease: 'Quad.Out' });
      burst(this, pic.x, pic.y - 20, ['✨', '⭐'], 6);
      await this.letterSound(g);
    }
    this.tweens.add({ targets: this.monster, y: this.monster.y - 50, duration: 200, yoyo: true, repeat: 1, ease: 'Quad.Out' });
    await this.wait(400);
  }
}
