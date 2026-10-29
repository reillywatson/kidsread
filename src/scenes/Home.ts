import Phaser from 'phaser';
import { learner, profile } from '../state';
import { Session } from '../session';
import type { Theme } from '../games/BaseGame';
import { LINES } from '../lines';
import * as audio from '../audio';
import { playMusic } from '../music';
import { openParentArea } from '../parent';
import { H, W, emoji, roundButton, sprite, tappable, text, onTap } from '../widgets';

const WORLDS: { theme: Theme; texture: string; color: number }[] = [
  { theme: 'pvz', texture: 'peashooter', color: 0x7cc242 },
  { theme: 'pokemon', texture: 'pikachu', color: 0xffd83b },
  { theme: 'paw', texture: 'pup-chase', color: 0x42a5f5 },
  { theme: 'friends', texture: 'monsterHappy', color: 0xb388ff },
];

export class Home extends Phaser.Scene {
  private starting = false;

  constructor() { super('Home'); }

  create() {
    if (!profile) { this.scene.start('Profiles'); return; }
    this.starting = false;
    this.add.image(640, 360, 'bgHome');
    playMusic('home');

    // Who's playing (tap to switch) and their stars.
    const me = this.add.container(70, 66);
    const g = this.add.graphics();
    g.fillStyle(0xffffff).fillCircle(0, 0, 50);
    g.lineStyle(6, 0xffc94d).strokeCircle(0, 0, 48);
    me.add([g, sprite(this, 0, 4, profile.avatar, 80)]);
    tappable(me, 100, 100);
    onTap(me, () => { audio.sfx.pop(); this.scene.start('Profiles'); });
    const sc = this.add.container(210, 66);
    sc.add([this.add.rectangle(0, 0, 150, 64, 0xffffff, 0.85).setStrokeStyle(4, 0xffc94d), sprite(this, -42, 0, 'star', 50), text(this, 22, 0, String(learner.s.stars), 38)]);

    const play = roundButton(this, W / 2, 300, 120, 0x43c35e, 'play', () => this.start());
    this.tweens.add({ targets: play, scale: 1.08, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.InOut' });

    // Worlds: tap a character to play only that world's games.
    WORLDS.forEach((w, i) => {
      const x = W / 2 + (i - 1.5) * 230;
      const c = this.add.container(x, 560);
      const bg = this.add.graphics();
      bg.fillStyle(0x000000, 0.15).fillCircle(0, 8, 92);
      bg.fillStyle(w.color).fillCircle(0, 0, 92);
      bg.lineStyle(7, 0xffffff).strokeCircle(0, 0, 88);
      c.add([bg, sprite(this, 0, 0, w.texture, 150)]);
      tappable(c, 184, 184);
      onTap(c, () => {
        if (this.starting) return;
        this.starting = true;
        audio.sfx.pop();
        this.tweens.add({ targets: c, scale: { from: 0.85, to: 1 }, duration: 250, ease: 'Back.Out' });
        void audio.say(LINES.worldHello[w.theme]).then(() => new Session(w.theme).start(this));
      });
      this.tweens.add({ targets: c, y: 548, duration: 900 + i * 120, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    });

    roundButton(this, W - 190, 66, 46, 0x90a4ae, '⚙️', () => this.scene.start('Settings'));
    roundButton(this, W - 76, 66, 46, 0xff8a65, '📒', () => this.scene.start('Stickers'));
    this.grownUpLock();
  }

  start(theme?: Theme) {
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
