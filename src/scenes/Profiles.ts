// "Who is playing?" — pick a player, or + to make a new one. No reading needed:
// players are their avatar pictures (a grown-up can add names in the grown-up area).
import Phaser from 'phaser';
import { profiles, selectProfile, createProfile, profile } from '../state';
import { AVATARS } from '../art';
import { LINES } from '../lines';
import * as audio from '../audio';
import { playMusic } from '../music';
import { W, H, burst, onTap, roundButton, sprite, tappable, text } from '../widgets';

function avatarButton(scene: Phaser.Scene, x: number, y: number, r: number, texture: string, color = 0xffffff) {
  const c = scene.add.container(x, y);
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.15).fillCircle(0, 8, r);
  g.fillStyle(color).fillCircle(0, 0, r);
  g.lineStyle(7, 0xffc94d).strokeCircle(0, 0, r - 3);
  c.add([g, sprite(scene, 0, 4, texture, r * 1.55)]);
  return tappable(c, r * 2, r * 2);
}

const pop = (scene: Phaser.Scene, c: Phaser.GameObjects.Container) =>
  scene.tweens.add({ targets: c, scale: { from: 0.85, to: 1 }, duration: 250, ease: 'Back.Out' });

export class Profiles extends Phaser.Scene {
  constructor() { super('Profiles'); }

  create() {
    this.add.image(640, 360, 'bgHome');
    playMusic('home');
    const list = profiles();
    if (!list.length) { this.scene.start('AvatarPicker'); return; }
    let busy = false;
    const n = list.length + 1;
    const perRow = Math.min(n, 5);
    const r = n > 5 ? 82 : 100;
    [...list, null].forEach((p, i) => {
      const row = Math.floor(i / perRow), col = i % perRow;
      const inRow = Math.min(perRow, n - row * perRow);
      const x = W / 2 + (col - (inRow - 1) / 2) * (r * 2 + 50);
      const y = (n > perRow ? 250 : 360) + row * (r * 2 + 70);
      if (!p) {
        const add = this.add.container(x, y);
        add.add(sprite(this, 0, 0, 'plus', r * 1.7));
        tappable(add, r * 2, r * 2);
        onTap(add, () => { if (!busy) { audio.sfx.pop(); this.scene.start('AvatarPicker'); } });
        return;
      }
      const c = avatarButton(this, x, y, r, p.avatar, p.id === profile?.id ? 0xfff3c4 : 0xffffff);
      if (p.name) text(this, x, y + r + 30, p.name, 34, '#2b2b2b');
      this.tweens.add({ targets: c, y: y - 8, duration: 900 + i * 130, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
      onTap(c, async () => {
        if (busy) return;
        busy = true;
        audio.sfx.pop();
        pop(this, c);
        burst(this, x, y);
        selectProfile(p.id);
        await audio.say(LINES.welcomeBack);
        this.scene.start('Home');
      });
    });
    void audio.say(LINES.whoIsPlaying);
  }
}

export class AvatarPicker extends Phaser.Scene {
  constructor() { super('AvatarPicker'); }

  create() {
    this.add.image(640, 360, 'bgHome');
    this.add.rectangle(W / 2, H / 2 + 20, 1180, 600, 0xffffff, 0.55).setStrokeStyle(6, 0xffffff);
    playMusic('home');
    if (profiles().length) roundButton(this, 60, 56, 40, 0xff7043, '⬅️', () => this.scene.start('Profiles'));
    let busy = false;
    const cols = 7, r = 70;
    AVATARS.forEach((a, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const x = W / 2 + (col - (cols - 1) / 2) * 160, y = 250 + row * 190;
      const c = avatarButton(this, x, y, r, a);
      c.setScale(0);
      this.tweens.add({ targets: c, scale: 1, duration: 300, delay: i * 40, ease: 'Back.Out' });
      onTap(c, async () => {
        if (busy) return;
        busy = true;
        audio.sfx.fanfare();
        pop(this, c);
        burst(this, x, y, ['⭐', '🎉', '✨'], 18);
        const p = createProfile(a);
        selectProfile(p.id);
        await audio.say(LINES.hiNew);
        this.scene.start('Home');
      });
    });
    void audio.say(LINES.pickPicture);
  }
}
