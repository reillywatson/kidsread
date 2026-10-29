import Phaser from 'phaser';
import { learner } from '../state';
import { Session } from '../session';
import type { Theme } from '../games/BaseGame';
import * as audio from '../audio';
import { openParentArea } from '../parent';
import { H, W, emoji, roundButton, sprite, tappable, text, onTap } from '../widgets';

const WORLDS: { theme: Theme; texture: string; color: number; hello: string }[] = [
  { theme: 'pvz', texture: 'peashooter', color: 0x7cc242, hello: 'Plants and zombies!' },
  { theme: 'pokemon', texture: 'pikachu', color: 0xffd83b, hello: 'Pika pika!' },
  { theme: 'paw', texture: 'pup-chase', color: 0x42a5f5, hello: 'Paw Patrol, ready for action!' },
  { theme: 'friends', texture: 'monsterHappy', color: 0xb388ff, hello: 'Letter Monster and Froggy!' },
];

export class Home extends Phaser.Scene {
  private starting = false;

  constructor() { super('Home'); }

  create() {
    this.starting = false;
    this.add.image(640, 360, 'bgHome');

    // Stars collected.
    const sc = this.add.container(110, 60);
    sc.add([this.add.rectangle(30, 0, 170, 70, 0xffffff, 0.85).setStrokeStyle(4, 0xffc94d), sprite(this, -20, 0, 'star', 54), text(this, 50, 0, String(learner.s.stars), 40)]);

    // Big play button.
    const play = roundButton(this, W / 2, 300, 120, 0x43c35e, 'play', () => this.start());
    this.tweens.add({ targets: play, scale: 1.08, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.InOut' });

    // Worlds: tap a character to play only that world's games.
    WORLDS.forEach((w, i) => {
      const x = W / 2 + (i - 1.5) * 230;
      const c = this.add.container(x, 560);
      const g = this.add.graphics();
      g.fillStyle(0x000000, 0.15).fillCircle(0, 8, 92);
      g.fillStyle(w.color).fillCircle(0, 0, 92);
      g.lineStyle(7, 0xffffff).strokeCircle(0, 0, 88);
      c.add([g, sprite(this, 0, 0, w.texture, 140)]);
      tappable(c, 184, 184);
      onTap(c, () => {
        if (this.starting) return;
        this.starting = true;
        audio.sfx.pop();
        this.tweens.add({ targets: c, scale: { from: 0.85, to: 1 }, duration: 250, ease: 'Back.Out' });
        void audio.say(w.hello).then(() => new Session(w.theme).start(this));
      });
      this.tweens.add({ targets: c, y: 548, duration: 900 + i * 120, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    });

    roundButton(this, W - 80, 70, 50, 0xff8a65, '📒', () => this.scene.start('Stickers'));
    this.grownUpLock();
  }

  private start(theme?: Theme) {
    if (this.starting) return;
    this.starting = true;
    new Session(theme).start(this);
  }

  /** Press and hold for 2 seconds to open the grown-up area (keeps little hands out). */
  private grownUpLock() {
    const x = W - 50, y = H - 46;
    const ring = this.add.graphics();
    const lock = emoji(this, x, y, '🔒', 40).setAlpha(0.7).setInteractive({ useHandCursor: true });
    let timer: Phaser.Time.TimerEvent | null = null;
    const reset = () => { timer?.remove(); timer = null; ring.clear(); };
    lock.on('pointerdown', () => {
      reset();
      const t0 = this.time.now;
      timer = this.time.addEvent({
        delay: 30, loop: true, callback: () => {
          const p = Math.min(1, (this.time.now - t0) / 2000);
          ring.clear().lineStyle(6, 0x2b2b2b, 0.6).beginPath().arc(x, y, 34, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2).strokePath();
          if (p >= 1) {
            reset();
            this.scene.pause();
            openParentArea(() => { this.scene.resume(); this.scene.restart(); });
          }
        },
      });
    });
    lock.on('pointerup', reset);
    lock.on('pointerout', reset);
  }
}
