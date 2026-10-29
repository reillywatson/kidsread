// Bonus (Pokémon): Poké Pop-up. Pokémon pop out of holes in the tall grass; tap one to catch
// it in a Poké Ball before it ducks back down. Just for fun.
import Phaser from 'phaser';
import { BaseGame, type GameMeta } from './BaseGame';
import { LINES } from '../lines';
import { pickOne } from '../learner';
import * as audio from '../audio';
import { burst, sprite } from '../widgets';

export const meta: GameMeta = {
  id: 'whack',
  theme: 'pokemon',
  skill: 'fun',
  title: 'Poké Pop-up (bonus)',
  intro: LINES.intro.whack,
  icon: 'pokeball',
  eligible: () => true,
  bonus: true,
};

const HOLES = [[330, 360], [640, 360], [950, 360], [330, 580], [640, 580], [950, 580]];
const MONS = ['pikachu', 'bulbasaur', 'charmander', 'squirtle'];

export class Whack extends BaseGame {
  private up: (Phaser.GameObjects.Image | null)[] = [];

  constructor() { super(meta); }

  protected setup() {
    this.add.image(640, 360, 'bgField');
    this.up = HOLES.map(() => null);
  }

  /** The hole itself and the grass in front of it (drawn above the Pokémon so they rise out of it). */
  private holeArt(x: number, y: number, front: boolean) {
    const g = this.add.graphics();
    if (!front) {
      g.fillStyle(0x3e2a1a).fillEllipse(x, y + 46, 190, 54);
      g.fillStyle(0x2a1a10).fillEllipse(x, y + 50, 160, 40);
      return g;
    }
    for (let i = 0; i < 9; i++) {
      const bx = x - 100 + i * 25, h = 46 + (i % 3) * 14;
      g.fillStyle(i % 2 ? 0x2f8a35 : 0x3fa63a).fillTriangle(bx - 14, y + 92, bx, y + 92 - h, bx + 14, y + 92);
    }
    g.fillStyle(0x3fa63a).fillRect(x - 112, y + 72, 224, 30);
    return g.setDepth(10);
  }

  private pop(point: () => number) {
    const free = HOLES.map((_, i) => i).filter(i => !this.up[i]);
    if (!free.length) return;
    const i = pickOne(free);
    const [x, y] = HOLES[i];
    // Fade in while rising (and out while sinking), so nothing shows below the grass.
    const mon = sprite(this, x, y + 70, pickOne(MONS), 170).setDepth(5).setAlpha(0).setInteractive({ useHandCursor: true });
    this.up[i] = mon;
    this.tweens.add({ targets: mon, y, alpha: 1, duration: 260, ease: 'Back.Out' });
    const hide = this.time.delayedCall(1300 + Math.random() * 600, () => {
      if (mon.getData('caught')) return;
      this.tweens.add({ targets: mon, y: y + 70, alpha: 0, duration: 220, onComplete: () => { mon.destroy(); this.up[i] = null; } });
    });
    mon.on('pointerdown', () => {
      if (mon.getData('caught')) return;
      mon.setData('caught', true);
      hide.remove();
      point();
      audio.sfx.zap();
      if (Math.random() < 0.35) void audio.say(pickOne(LINES.pika), { style: 'pika' });
      const ball = sprite(this, x, y, 'pokeball', 10).setDepth(20);
      this.tweens.add({ targets: mon, scale: 0.05, alpha: 0, duration: 250, onComplete: () => mon.destroy() });
      this.tweens.add({
        targets: ball, scale: 90 / ball.height, duration: 220, ease: 'Back.Out',
        onComplete: () => {
          audio.sfx.wobble();
          this.tweens.add({ targets: ball, angle: { from: -20, to: 20 }, duration: 150, yoyo: true, repeat: 1,
            onComplete: () => { burst(this, x, y, ['⭐', '✨', '⚡'], 10); ball.destroy(); this.up[i] = null; } });
        },
      });
    });
  }

  protected async run() {
    HOLES.forEach(([x, y]) => this.holeArt(x, y, false));
    HOLES.forEach(([x, y]) => this.holeArt(x, y, true));
    const point = this.scoreCounter('pokeball');
    const popper = this.time.addEvent({ delay: 750, loop: true, callback: () => this.pop(point) });
    this.pop(point);
    if (import.meta.env.DEV) Object.assign(window, { __answer: () => this.up.find(m => m && !m.getData('caught'))?.emit('pointerdown') });
    await this.playFor(30);
    popper.remove();
    await this.say(LINES.timesUp);
  }
}
