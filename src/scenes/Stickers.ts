// Sticker book: collected stickers, with "?" silhouettes for the rest. Tap one to hear its name.
import Phaser from 'phaser';
import { learner } from '../state';
import { STICKERS } from '../stickers';
import * as audio from '../audio';
import { emoji, roundButton, sprite, tappable, onTap } from '../widgets';

export class Stickers extends Phaser.Scene {
  constructor() { super('Stickers'); }

  create() {
    this.add.image(640, 360, 'bgBook');
    roundButton(this, 60, 56, 40, 0xff7043, '🏠', () => this.scene.start('Home'));
    const owned = new Set(learner.s.stickers);
    const cols = 9, cell = 120;
    STICKERS.forEach((st, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const x = 640 + (col - (cols - 1) / 2) * cell + (col >= cols / 2 ? 12 : -12);
      const y = 180 + row * 125;
      if (!owned.has(st.id)) {
        this.add.circle(x, y, 46, 0x000000, 0.08);
        emoji(this, x, y, '❔', 40).setAlpha(0.35);
        return;
      }
      const c = this.add.container(x, y);
      c.add(st.texture ? sprite(this, 0, 0, st.texture, 100) : emoji(this, 0, 0, st.emoji!, 76));
      tappable(c, 110, 110);
      onTap(c, () => {
        audio.sfx.pop();
        this.tweens.add({ targets: c, angle: { from: -15, to: 15 }, duration: 100, yoyo: true, repeat: 2, onComplete: () => { c.angle = 0; } });
        void audio.say(st.name);
      });
    });
  }
}
