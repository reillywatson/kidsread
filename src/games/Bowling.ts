// Bonus (Plants vs. Zombies): Wall-nut Bowling. Tap a lane to roll a Wall-nut down it and
// bowl over every zombie in the way. Just for fun.
import Phaser from 'phaser';
import { BaseGame, type GameMeta } from './BaseGame';
import { LINES } from '../lines';
import { pickOne } from '../learner';
import * as audio from '../audio';
import { W, burst, sprite } from '../widgets';

export const meta: GameMeta = {
  id: 'bowling',
  theme: 'pvz',
  skill: 'fun',
  title: 'Wall-nut Bowling (bonus)',
  intro: LINES.intro.bowling,
  icon: 'wallnut',
  eligible: () => true,
  bonus: true,
};

const LANES = [260, 440, 620];
const START_X = 1380, HOUSE_X = 200;

export class Bowling extends BaseGame {
  private zombies: Phaser.GameObjects.Image[] = [];
  private rolling = [false, false, false];

  constructor() { super(meta); }

  protected setup() {
    this.add.image(640, 360, 'bgLawn');
    this.zombies = [];
    this.rolling = [false, false, false];
    // Big invisible tap zones, one per lane.
    LANES.forEach((y, lane) => {
      const zone = this.add.rectangle(W / 2 + 40, y, W - 80, 176, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
      zone.on('pointerdown', () => this.roll(lane));
      sprite(this, 120, y - 10, 'wallnut', 90);
    });
  }

  private spawn() {
    const lane = Math.floor(Math.random() * 3);
    const z = sprite(this, START_X, LANES[lane] - 30, Math.random() < 0.35 ? 'zombieCone' : 'zombie', 165);
    z.setData('lane', lane);
    this.zombies.push(z);
    this.tweens.add({
      targets: z, x: HOUSE_X, duration: 9000 + Math.random() * 4000, ease: 'Linear',
      onComplete: () => this.tweens.add({ targets: z, x: START_X + 60, alpha: 0, duration: 800, onComplete: () => this.remove(z) }),
    });
    this.tweens.add({ targets: z, angle: { from: -4, to: 4 }, duration: 500, yoyo: true, repeat: -1 });
  }

  private remove(z: Phaser.GameObjects.Image) {
    this.zombies = this.zombies.filter(o => o !== z);
    this.tweens.killTweensOf(z);
    z.destroy();
  }

  private point = () => 0;

  private roll(lane: number) {
    if (this.rolling[lane]) return;
    this.rolling[lane] = true;
    const nut = sprite(this, 150, LANES[lane] + 20, 'wallnut', 100);
    audio.sfx.whoosh();
    this.tweens.add({ targets: nut, angle: 720, duration: 1300, ease: 'Linear' });
    this.tweens.add({
      targets: nut, x: W + 120, duration: 1300, ease: 'Linear',
      onUpdate: () => {
        for (const z of this.zombies) {
          if (z.getData('lane') !== lane || z.getData('down') || Math.abs(z.x - nut.x) > 60) continue;
          z.setData('down', true);
          this.tweens.killTweensOf(z);
          audio.sfx.splat();
          burst(this, z.x, z.y, ['💥', '⭐', '🟢'], 8);
          this.point();
          if (Math.random() < 0.3) void audio.say(pickOne(LINES.groans), { style: 'zombie' });
          this.tweens.add({ targets: z, x: z.x + 220, y: z.y - 180, angle: 540, alpha: 0, duration: 700, ease: 'Quad.Out', onComplete: () => this.remove(z) });
        }
      },
      onComplete: () => { nut.destroy(); this.rolling[lane] = false; },
    });
  }

  protected async run() {
    this.point = this.scoreCounter('zombie');
    const spawner = this.time.addEvent({ delay: 1100, loop: true, callback: () => this.spawn() });
    this.spawn();
    if (import.meta.env.DEV) Object.assign(window, { __answer: () => { const z = this.zombies.find(o => !o.getData('down')); if (z) this.roll(z.getData('lane')); } });
    await this.playFor(30);
    spawner.remove();
    await this.say(LINES.timesUp);
  }
}
