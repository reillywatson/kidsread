// Plants vs. Zombies — goal game: beat the Zombie Boss. Hear a sound, tap the seed packet
// with that letter, and the peashooter fires a volley that knocks a chunk off the boss's
// health bar. A wrong packet lets the boss stomp a little closer (it never reaches the house).
import Phaser from 'phaser';
import { BaseGame, type GameMeta } from './BaseGame';
import { graphemeDistractors } from '../choices';
import { pickOne, shuffle } from '../learner';
import { LINES } from '../lines';
import * as audio from '../audio';
import { W, burst, confetti, emoji, sprite, tappable, text } from '../widgets';

export const meta: GameMeta = {
  id: 'boss',
  theme: 'pvz',
  skill: 'grapheme',
  title: 'Zombie Boss — hear a sound, tap its letter to beat the boss',
  intro: LINES.intro.boss,
  icon: 'zombieCone',
  eligible: () => true,
  goal: true,
};

const LANE_Y = 400;
const HOME_X = 1050;
const CLOSEST_X = 760;
const BAR = { x: HOME_X, y: 150, w: 300, h: 30 };

export class Boss extends BaseGame {
  private shooter!: Phaser.GameObjects.Image;
  private boss!: Phaser.GameObjects.Container;
  private bar!: Phaser.GameObjects.Graphics;

  constructor() { super(meta); }

  protected setup() {
    this.add.image(640, 360, 'bgLawn');
    this.shooter = this.tickle(sprite(this, 150, LANE_Y + 10, 'peashooter', 170));
    // A giant zombie with a crown.
    this.boss = this.add.container(HOME_X, LANE_Y - 30, [sprite(this, 0, 0, 'zombieCone', 368), emoji(this, 14, -196, '👑', 72)]);
    this.tweens.add({ targets: this.boss, angle: { from: -3, to: 3 }, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.bar = this.add.graphics().setDepth(50);
  }

  private drawBar(hp: number, max: number) {
    const { x, w, h } = BAR, y = BAR.y, x0 = x - w / 2;
    this.bar.clear();
    this.bar.fillStyle(0x000000, 0.25).fillRoundedRect(x0 - 6, y - h / 2 - 6 + 4, w + 12, h + 12, 12);
    this.bar.fillStyle(0xffffff).fillRoundedRect(x0 - 6, y - h / 2 - 6, w + 12, h + 12, 12);
    const seg = w / max;
    for (let i = 0; i < max; i++) {
      this.bar.fillStyle(i < hp ? (hp <= 1 ? 0xff7043 : 0xe53935) : 0xe0e0e0).fillRoundedRect(x0 + i * seg + 2, y - h / 2, seg - 4, h, 6);
    }
  }

  private packet(g: string) {
    const c = this.add.container(0, 0);
    const gr = this.add.graphics();
    gr.fillStyle(0x000000, 0.18).fillRoundedRect(-75 + 4, -95 + 8, 150, 190, 18);
    gr.fillStyle(0xfff8e1).fillRoundedRect(-75, -95, 150, 190, 18);
    gr.fillStyle(0x7cc242).fillRoundedRect(-75, -95, 150, 44, { tl: 18, tr: 18, bl: 0, br: 0 });
    gr.lineStyle(5, 0x8d6e3f).strokeRoundedRect(-75, -95, 150, 190, 18);
    c.add([gr, emoji(this, 0, -73, '🌱', 30), text(this, 0, 20, this.shown(g), 80)]);
    return tappable(c, 150, 190);
  }

  /** Peashooter volley at the boss. */
  private async volley(peas: number) {
    for (let k = 0; k < peas; k++) {
      const pea = sprite(this, this.shooter.x + 70, this.shooter.y - 30 + (k % 2) * 10, 'pea', 36);
      this.sfx.pew();
      this.tweens.add({ targets: this.shooter, scaleX: this.shooter.scaleX * 0.9, duration: 60, yoyo: true });
      this.tweens.add({
        targets: pea, x: this.boss.x - 60, duration: 380, ease: 'Linear',
        onComplete: () => { pea.destroy(); this.sfx.splat(); burst(this, this.boss.x - 60, this.boss.y - 40, ['💥', '🟢'], 5); },
      });
      await this.wait(130);
    }
    await this.wait(300);
    // Knocked back and flashing.
    const img = this.boss.list[0] as Phaser.GameObjects.Image;
    img.setTint(0xffffff).setTintMode(Phaser.TintModes.FILL);
    this.time.delayedCall(120, () => img.clearTint());
    this.cameras.main.shake(180, 0.006);
    await this.tween({ targets: this.boss, x: Math.min(HOME_X, this.boss.x + 120), duration: 300, ease: 'Quad.Out' });
  }

  protected async run() {
    const n = this.rounds(5);
    const gs = this.learner.pick(['g'], n);
    const nChoices = [2, 3, 3][this.tier];
    let hp = gs.length;
    this.drawBar(hp, gs.length);

    for (let r = 0; r < gs.length && !this.timeUp(); r++) {
      const g = gs[r];
      const opts = shuffle([g, ...graphemeDistractors(g, nChoices - 1, this.tier, this.lesson)]);
      const packets = opts.map((x, i) => {
        const p = this.packet(x).setPosition(560 + (i - (opts.length - 1) / 2) * 200, 610);
        this.tweens.add({ targets: p, y: { from: 820, to: 610 }, duration: 350, delay: i * 70, ease: 'Back.Out' });
        return p;
      });

      let help = this.tier === 0;
      await this.prompt(async () => {
        await this.say(r === 0 ? LINES.zapZombie : pickOne([LINES.find, LINES.zap]));
        await this.letterSound(g);
        if (help) await this.keyword(g);
      });
      const res = await this.choose(packets, opts.indexOf(g), {
        onWrong: () => {
          // The boss stomps closer and groans.
          this.sfx.stomp();
          void audio.say(pickOne(LINES.groans), { style: 'zombie' });
          this.tweens.add({ targets: this.boss, x: Math.max(CLOSEST_X, this.boss.x - 60), duration: 350, ease: 'Quad.Out' });
        },
        onScaffold: () => { help = true; void this.letterSound(g).catch(() => {}); },
      });
      this.record('g:' + g, res.firstTry ? 'correct' : 'wrong');
      this.score(res.firstTry);

      // The seed powers up the peashooter...
      packets.filter(p => p !== res.obj).forEach(p => this.tweens.add({ targets: p, alpha: 0, duration: 200 }));
      await this.tween({ targets: res.obj, x: this.shooter.x, y: this.shooter.y, scale: 0.2, alpha: 0, duration: 400, ease: 'Cubic.In' });
      this.sfx.grow();
      burst(this, this.shooter.x, this.shooter.y - 40, ['✨', '🌱', '⭐'], 8);
      // ...which fires.
      await this.volley(3);
      hp--;
      this.drawBar(hp, gs.length);
      this.tweens.add({ targets: this.bar, scale: { from: 1.06, to: 1 }, duration: 200 });
      await this.letterSound(g);
      await this.praise(res.firstTry);
      packets.forEach(p => p.destroy());
    }

    // Out of time? One mega volley finishes the job: the boss always goes down.
    if (hp > 0) { await this.volley(6); hp = 0; this.drawBar(0, gs.length); }
    this.tweens.killTweensOf(this.boss);
    const crown = this.boss.list[1] as Phaser.GameObjects.Text;
    this.boss.remove(crown);
    this.add.existing(crown);
    crown.setPosition(this.boss.x + 12, this.boss.y - 178);
    this.tweens.add({ targets: crown, x: crown.x + 80, y: 680, angle: 360, duration: 900, ease: 'Bounce.Out' });
    this.sfx.splat();
    await this.tween({ targets: this.boss, x: W + 300, y: this.boss.y - 300, angle: 720, duration: 1000, ease: 'Quad.In' });
    this.sfx.fanfare();
    confetti(this, 80);
    this.tweens.add({ targets: this.shooter, y: this.shooter.y - 50, duration: 200, yoyo: true, repeat: 2, ease: 'Quad.Out' });
    await this.say(LINES.bossDown);
  }
}
