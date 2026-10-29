// Bonus (Friends): Balloon Party. Balloons float up; tap to pop them. Golden star balloons
// make an extra-big burst. Just for fun.
import Phaser from 'phaser';
import { BaseGame, type GameMeta } from './BaseGame';
import { LINES } from '../lines';
import { pickOne } from '../learner';
import * as audio from '../audio';
import { W, burst, emoji, sprite, tappable } from '../widgets';

export const meta: GameMeta = {
  id: 'balloons',
  theme: 'friends',
  skill: 'fun',
  title: 'Balloon Party (bonus)',
  intro: LINES.intro.balloons,
  icon: 'monsterHappy',
  eligible: () => true,
  bonus: true,
};

const COLORS = [0xff5c7a, 0x42a5f5, 0x66bb6a, 0xffa726, 0xab47bc, 0x26c6da];

export class Balloons extends BaseGame {
  private live: Phaser.GameObjects.Container[] = [];

  constructor() { super(meta); }

  protected setup() {
    this.add.image(640, 360, 'bgHome');
    sprite(this, 120, 560, 'monsterHappy', 190);
    sprite(this, W - 120, 590, 'frog', 120);
    this.live = [];
  }

  private balloon(point: () => number) {
    const gold = Math.random() < 0.12;
    const color = gold ? 0xffd21f : pickOne(COLORS);
    const dark = Phaser.Display.Color.IntegerToColor(color).darken(25).color;
    const x = 200 + Math.random() * (W - 400);
    const c = this.add.container(x, 820);
    const g = this.add.graphics();
    g.lineStyle(3, 0x7a7a7a).beginPath().moveTo(0, 62).lineTo(-6, 90).lineTo(4, 120).lineTo(-2, 150).strokePath();
    g.fillStyle(dark).fillEllipse(0, 0, 110, 128);
    g.fillStyle(color).fillEllipse(-5, -6, 98, 116);
    g.fillStyle(0xffffff, 0.45).fillEllipse(-22, -30, 26, 40);
    g.fillStyle(dark).fillTriangle(-9, 66, 9, 66, 0, 54);
    c.add(g);
    if (gold) c.add(emoji(this, 0, -4, '⭐', 50));
    tappable(c, 120, 140);
    this.live.push(c);
    this.tweens.add({ targets: c, y: -160, duration: 6500 + Math.random() * 2500, ease: 'Linear', onComplete: () => this.gone(c) });
    this.tweens.add({ targets: c, x: x + 40, duration: 1400 + Math.random() * 600, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    c.on('pointerdown', () => {
      if (c.getData('popped')) return;
      c.setData('popped', true);
      point();
      if (gold) { point(); point(); }
      audio.sfx.pop();
      if (gold) audio.sfx.fanfare();
      burst(this, c.x, c.y, gold ? ['⭐', '🌟', '🎉', '✨'] : ['🎊', '✨', '🎉'], gold ? 22 : 10);
      this.gone(c);
    });
  }

  private gone(c: Phaser.GameObjects.Container) {
    this.live = this.live.filter(o => o !== c);
    this.tweens.killTweensOf(c);
    c.destroy();
  }

  protected async run() {
    const point = this.scoreCounter('star');
    const spawner = this.time.addEvent({ delay: 600, loop: true, callback: () => this.balloon(point) });
    this.balloon(point);
    if (import.meta.env.DEV) Object.assign(window, { __answer: () => this.live.find(b => b.y < 700)?.emit('pointerdown') });
    await this.playFor(30);
    spawner.remove();
    await this.say(LINES.timesUp);
  }
}
