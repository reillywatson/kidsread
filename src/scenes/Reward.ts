// Between games: stars, any level-up, then on to the next game. A path across the screen shows
// the session's games with the player's avatar hopping along toward the present at the end;
// the next button shows what's coming up. After the last game: a sticker.
import Phaser from 'phaser';
import { learner, profile } from '../state';
import type { Session } from '../session';
import { GRAPHEMES, lessonInfo } from '../data/curriculum';
import { nextSticker } from '../stickers';
import * as audio from '../audio';
import { LINES } from '../lines';
import { W, burst, emoji, glossyCircle, roundButton, sprite, text, tweenP, tappable, onTap } from '../widgets';

const PATH_Y = 372;

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
    this.cameras.main.fadeIn(220, 255, 255, 255);
    this.add.image(640, 360, 'bgHome');
    roundButton(this, 60, 56, 40, 0xff7043, '🏠', () => this.session.quit(this));
    void this.sequence();
  }

  /** The session's games as stepping stones, a present at the end, and the player's avatar. */
  private path() {
    const { games, i: done } = this.session;
    const n = games.length + 1;
    const gap = Math.min(130, 900 / (n - 1));
    const xs = Array.from({ length: n }, (_, k) => W / 2 + (k - (n - 1) / 2) * gap);
    const c = this.add.container(0, 0);
    const line = this.add.graphics();
    line.fillStyle(0xffffff, 0.8);
    for (let x = xs[0]; x <= xs[n - 1]; x += 18) line.fillCircle(x, PATH_Y, 4);
    c.add(line);
    games.forEach((m, k) => {
      const played = k <= done;
      const g = this.add.graphics();
      g.fillStyle(0x000000, 0.15).fillCircle(xs[k], PATH_Y + 5, 38);
      g.fillStyle(played ? 0xffd21f : 0xffffff, played ? 1 : 0.85).fillCircle(xs[k], PATH_Y, 38);
      g.lineStyle(5, 0xffffff).strokeCircle(xs[k], PATH_Y, 36);
      c.add(g);
      // A bonus game is a surprise until you get there.
      if (m.bonus && !played) c.add(emoji(this, xs[k], PATH_Y, '❓', 40));
      else c.add(sprite(this, xs[k], PATH_Y, m.icon, 52).setAlpha(played ? 1 : 0.6));
      if (played) c.add(emoji(this, xs[k] + 28, PATH_Y + 26, '✅', 24));
    });
    const gift = emoji(this, xs[n - 1], PATH_Y, '🎁', 56);
    c.add(gift);
    this.tweens.add({ targets: gift, angle: { from: -8, to: 8 }, duration: 400, yoyo: true, repeat: -1 });
    const me = sprite(this, xs[done], PATH_Y - 58, profile?.avatar ?? 'star', 60);
    c.add(me);
    c.setAlpha(0);
    this.tweens.add({ targets: c, alpha: 1, duration: 300 });
    return { c, xs, me };
  }

  private async hop(obj: Phaser.GameObjects.Image, x: number) {
    audio.sfx.hop();
    this.tweens.add({ targets: obj, x, duration: 420, ease: 'Sine.InOut' });
    await tweenP(this, { targets: obj, y: obj.y - 50, duration: 210, yoyo: true, ease: 'Quad.Out' });
  }

  /** Big go button showing what's next: the game's picture (or ❓ for a bonus) and a ▶ badge. */
  private nextButton(go: () => void) {
    const meta = this.session.games[this.session.i + 1];
    const c = this.add.container(W / 2, 545);
    c.add(glossyCircle(this, 90, 0x43c35e));
    c.add(meta.bonus ? emoji(this, 0, 4, '❓', 90) : sprite(this, 0, 2, meta.icon, 125));
    const badge = this.add.graphics();
    badge.fillStyle(0xffffff).fillCircle(64, 62, 30);
    badge.fillStyle(0x43c35e).fillTriangle(54, 46, 54, 78, 82, 62);
    c.add(badge);
    tappable(c, 180, 180);
    onTap(c, () => { audio.sfx.tap(); go(); });
    c.setScale(0);
    this.tweens.add({ targets: c, scale: 1, duration: 350, ease: 'Back.Out', onComplete: () =>
      this.tweens.add({ targets: c, scale: 1.08, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.InOut' }) });
    return c;
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
    // Earned stars fly into the star jar, which counts up.
    const jar = this.add.container(210, 66);
    const count = text(this, 22, 0, String(learner.s.stars - this.stars), 38);
    jar.add([this.add.rectangle(0, 0, 150, 64, 0xffffff, 0.85).setStrokeStyle(4, 0xffc94d), sprite(this, -42, 0, 'star', 50), count]);
    const speech = say(LINES.stars[this.stars - 1]);
    for (let i = 0; i < this.stars && this.alive; i++) {
      const s = stars[i];
      const fly = sprite(this, s.x, s.y, 'star', 70);
      await tweenP(this, { targets: fly, x: jar.x - 42, y: jar.y, scale: 50 / fly.height, duration: 450, ease: 'Cubic.In' });
      fly.destroy();
      audio.sfx.tick();
      count.setText(String(learner.s.stars - this.stars + i + 1));
      this.tweens.add({ targets: jar, scale: { from: 1.25, to: 1 }, duration: 220, ease: 'Back.Out' });
    }
    await speech;

    // Hop along the path toward what's next.
    const path = this.path();
    await new Promise(r => this.time.delayedCall(350, r));
    if (this.alive) await this.hop(path.me, path.xs[this.session.i + 1]);

    // New lesson unlocked?
    const lvl = learner.takeLevelUp();
    if (lvl && this.alive) await this.levelUp(lvl);
    if (!this.alive) return;

    if (!this.session.isLast) {
      let moved = false;
      const go = () => { if (!moved) { moved = true; this.session.next(this); } };
      this.nextButton(go);
      this.time.delayedCall(5000, go);
    } else {
      // Made it to the present!
      burst(this, path.xs[path.xs.length - 1], PATH_Y, ['🎉', '⭐', '✨'], 16);
      await tweenP(this, { targets: path.c, alpha: 0, duration: 400, delay: 300 });
      await this.giftBox();
    }
  }

  private async levelUp(lesson: number) {
    const l = lessonInfo(lesson)!;
    audio.sfx.fanfare();
    const banner = this.add.container(W / 2, 440).setDepth(10);
    banner.add(this.add.rectangle(0, 0, 640, 200, 0xffffff, 0.95).setStrokeStyle(8, 0xffc94d));
    burst(this, W / 2, 440, ['🎉', '⭐', '🎊'], 20);
    if (l.g.length) {
      const g = GRAPHEMES[l.g[0]];
      banner.add([text(this, -120, 0, l.g.map(x => GRAPHEMES[x].label).join(' '), 120), emoji(this, 140, 0, g.pic, 110)]);
      await audio.say(LINES.newSound);
      for (const x of l.g) { await audio.sound(x); await audio.say(LINES.like); await audio.say(GRAPHEMES[x].key); }
    } else {
      banner.add(emoji(this, 0, 0, '🚀', 120));
      await audio.say(LINES.levelUp);
    }
    await new Promise(r => this.time.delayedCall(800, r));
    banner.destroy();
  }

  private async giftBox() {
    const gift = this.add.container(W / 2, 480);
    gift.add(sprite(this, 0, 0, 'gift', 220));
    tappable(gift, 220, 220);
    this.tweens.add({ targets: gift, angle: { from: -6, to: 6 }, duration: 300, yoyo: true, repeat: -1 });
    await audio.say(LINES.tapPresent);
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
      await audio.say(LINES.gotSticker);
      if (!this.alive) return;
      await audio.say(st.name);
      if (!this.alive) return;
      roundButton(this, W / 2 - 130, 640, 56, 0xff7043, '🏠', () => this.session.quit(this));
      roundButton(this, W / 2 + 130, 640, 56, 0x43c35e, '🔁', () => this.session.again(this));
    });
  }
}
