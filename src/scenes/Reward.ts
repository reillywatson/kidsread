// Between games: stars, any level-up, then on to the next game. After the last game: a sticker.
import Phaser from 'phaser';
import { learner } from '../state';
import type { Session } from '../session';
import { GRAPHEMES, lessonInfo } from '../data/curriculum';
import { nextSticker } from '../stickers';
import * as audio from '../audio';
import { W, burst, emoji, roundButton, sprite, text, tweenP, tappable, onTap } from '../widgets';

export class Reward extends Phaser.Scene {
  private session!: Session;
  private stars = 1;
  private alive = true;

  constructor() { super('Reward'); }

  init(data: { session: Session; stars: number }) {
    this.session = data.session;
    this.stars = data.stars;
  }

  create() {
    this.alive = true;
    this.events.once('shutdown', () => { this.alive = false; audio.stop(); });
    this.add.image(640, 360, 'bgHome');
    roundButton(this, 60, 56, 40, 0xff7043, '🏠', () => this.session.quit(this));
    void this.sequence();
  }

  private async sequence() {
    const say = (t: string) => (this.alive ? audio.say(t) : Promise.resolve());
    // Stars
    const stars = [0, 1, 2].map(i => sprite(this, W / 2 + (i - 1) * 170, 230, i < this.stars ? 'star' : 'starEmpty', 150).setScale(0));
    for (let i = 0; i < 3; i++) {
      const s = stars[i];
      if (i < this.stars) audio.sfx.star();
      await tweenP(this, { targets: s, scale: 150 / s.height, angle: { from: -90, to: 0 }, duration: 350, ease: 'Back.Out' });
      if (i < this.stars) burst(this, s.x, s.y);
    }
    await say(['Good try!', 'Great job!', 'Super star!'][this.stars - 1]);

    // New lesson unlocked?
    const lvl = learner.takeLevelUp();
    if (lvl && this.alive) await this.levelUp(lvl);
    if (!this.alive) return;

    if (!this.session.isLast) {
      let moved = false;
      const go = () => { if (!moved) { moved = true; this.session.next(this); } };
      const next = roundButton(this, W / 2, 500, 90, 0x43c35e, 'play', go);
      this.tweens.add({ targets: next, scale: 1.1, duration: 600, yoyo: true, repeat: -1 });
      this.time.delayedCall(5000, go);
    } else {
      await this.giftBox();
    }
  }

  private async levelUp(lesson: number) {
    const l = lessonInfo(lesson)!;
    audio.sfx.fanfare();
    const banner = this.add.container(W / 2, 440);
    banner.add(this.add.rectangle(0, 0, 640, 200, 0xffffff, 0.95).setStrokeStyle(8, 0xffc94d));
    burst(this, W / 2, 440, ['🎉', '⭐', '🎊'], 20);
    if (l.g.length) {
      const g = GRAPHEMES[l.g[0]];
      banner.add([text(this, -120, 0, l.g.map(x => GRAPHEMES[x].label).join(' '), 120), emoji(this, 140, 0, g.pic, 110)]);
      await audio.say('You unlocked a new sound!');
      for (const x of l.g) { await audio.sound(x); await audio.say(`like ${GRAPHEMES[x].key}`); }
    } else {
      banner.add(emoji(this, 0, 0, '🚀', 120));
      await audio.say('Level up! New words to read!');
    }
    await new Promise(r => this.time.delayedCall(800, r));
    banner.destroy();
  }

  private async giftBox() {
    const gift = this.add.container(W / 2, 480);
    gift.add(sprite(this, 0, 0, 'gift', 220));
    tappable(gift, 220, 220);
    this.tweens.add({ targets: gift, angle: { from: -6, to: 6 }, duration: 300, yoyo: true, repeat: -1 });
    await audio.say('You finished! Tap the present!');
    onTap(gift, async () => {
      gift.disableInteractive();
      this.tweens.killTweensOf(gift);
      audio.sfx.fanfare();
      await tweenP(this, { targets: gift, scale: 1.4, alpha: 0, duration: 300 });
      const st = nextSticker(learner.s.stickers);
      learner.addSticker(st.id);
      const prize = st.texture ? sprite(this, W / 2, 470, st.texture, 230) : emoji(this, W / 2, 470, st.emoji!, 180);
      const finalScale = prize.scale;
      prize.setScale(0);
      burst(this, W / 2, 470, ['🎉', '⭐', '✨'], 24);
      await tweenP(this, { targets: prize, scale: finalScale, duration: 500, ease: 'Back.Out' });
      if (!this.alive) return;
      await audio.say(`You got a sticker! ${st.name}!`);
      if (!this.alive) return;
      roundButton(this, W / 2 - 130, 640, 56, 0xff7043, '🏠', () => this.session.quit(this));
      roundButton(this, W / 2 + 130, 640, 56, 0x43c35e, '🔁', () => this.session.again(this));
    });
  }
}
