// Bonus (Paw Patrol): Treat Catch. Treats fall from the sky; drag (or tap) to move the pup
// underneath them. Just for fun.
import Phaser from 'phaser';
import { BaseGame, type GameMeta } from './BaseGame';
import { LINES } from '../lines';
import { pickOne } from '../learner';
import { PUP_NAMES } from '../art';
import * as audio from '../audio';
import { W, burst, emoji, sprite } from '../widgets';

export const meta: GameMeta = {
  id: 'treats',
  theme: 'paw',
  skill: 'fun',
  title: 'Treat Catch (bonus)',
  intro: LINES.intro.treats,
  icon: 'bone',
  eligible: () => true,
  bonus: true,
};

const GROUND = 600;
const TREATS = ['🦴', '🍖', '🍪', '🧀', '🥕'];

export class Treats extends BaseGame {
  private pup!: Phaser.GameObjects.Image;
  private targetX = W / 2;
  private falling: Phaser.GameObjects.GameObject[] = [];

  constructor() { super(meta); }

  protected setup() {
    this.add.image(640, 360, 'bgBay');
    this.pup = sprite(this, W / 2, 500, `pup-${pickOne(PUP_NAMES)}`, 230).setDepth(5);
    this.targetX = W / 2;
    this.falling = [];
    // Move the pup toward wherever the child touches or drags.
    const follow = (p: Phaser.Input.Pointer) => { if (p.isDown || p.wasTouch) this.targetX = Phaser.Math.Clamp(p.x, 120, W - 120); };
    this.input.on('pointerdown', follow);
    this.input.on('pointermove', follow);
  }

  update() {
    if (!this.pup) return;
    const dx = this.targetX - this.pup.x;
    this.pup.x += dx * 0.18;
    this.pup.setFlipX(dx < -2 ? true : dx > 2 ? false : this.pup.flipX);
  }

  private drop(point: () => number) {
    const x = 120 + Math.random() * (W - 240);
    const t = emoji(this, x, -60, pickOne(TREATS), 70).setDepth(4);
    this.falling.push(t);
    this.tweens.add({ targets: t, angle: { from: -20, to: 20 }, duration: 400, yoyo: true, repeat: -1 });
    this.tweens.add({
      targets: t, y: GROUND, duration: 2600 + Math.random() * 1200, ease: 'Quad.In',
      onUpdate: () => {
        if (t.getData('done') || t.y < 400) return;
        if (Math.abs(t.x - this.pup.x) < 100) {
          t.setData('done', true);
          point();
          audio.sfx.chomp();
          if (Math.random() < 0.3) audio.sfx.bark();
          burst(this, t.x, t.y, ['⭐', '✨', '🐾'], 8);
          this.tweens.add({ targets: this.pup, y: 480, duration: 120, yoyo: true });
          this.tweens.killTweensOf(t);
          t.destroy();
        }
      },
      onComplete: () => { if (!t.getData('done')) this.tweens.add({ targets: t, alpha: 0, duration: 300, onComplete: () => t.destroy() }); },
    });
  }

  protected async run() {
    const point = this.scoreCounter('bone');
    const dropper = this.time.addEvent({ delay: 800, loop: true, callback: () => this.drop(point) });
    this.drop(point);
    if (import.meta.env.DEV) Object.assign(window, { __answer: () => {
      const t = this.falling.find(o => o.active && !o.getData('done')) as Phaser.GameObjects.Text | undefined;
      if (t) this.targetX = t.x;
    } });
    await this.playFor(30);
    dropper.remove();
    await this.say(LINES.timesUp);
  }
}
