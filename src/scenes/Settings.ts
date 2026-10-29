// Kid-friendly settings: big picture toggles for music and sound effects.
import Phaser from 'phaser';
import { settings, updateSettings } from '../settings';
import { LINES } from '../lines';
import * as audio from '../audio';
import { W, emoji, onTap, roundButton, tappable } from '../widgets';

export class Settings extends Phaser.Scene {
  constructor() { super('Settings'); }

  create() {
    this.add.image(640, 360, 'bgHome');
    roundButton(this, 60, 56, 40, 0xff7043, '🏠', () => this.scene.start('Home'));
    this.toggle(W / 2 - 200, 'music', '🎵', LINES.musicOn, LINES.musicOff);
    this.toggle(W / 2 + 200, 'sfx', '🔔', LINES.soundsOn, LINES.soundsOff);
  }

  private toggle(x: number, key: 'music' | 'sfx', icon: string, onLine: string, offLine: string) {
    const y = 360, r = 130;
    const c = this.add.container(x, y);
    const g = this.add.graphics();
    const glyph = emoji(this, 0, -6, icon, 130);
    const slash = this.add.graphics();
    const draw = () => {
      const on = settings[key];
      g.clear();
      g.fillStyle(0x000000, 0.15).fillCircle(0, 10, r);
      g.fillStyle(on ? 0x43c35e : 0xb0bec5).fillCircle(0, 0, r);
      g.lineStyle(10, 0xffffff).strokeCircle(0, 0, r - 5);
      glyph.setAlpha(on ? 1 : 0.5);
      slash.clear();
      if (!on) slash.lineStyle(18, 0xe53935).lineBetween(-r * 0.62, -r * 0.62, r * 0.62, r * 0.62);
    };
    c.add([g, glyph, slash]);
    tappable(c, r * 2, r * 2);
    draw();
    onTap(c, () => {
      updateSettings({ [key]: !settings[key] });
      draw();
      audio.sfx.pop();
      this.tweens.add({ targets: c, scale: { from: 0.85, to: 1 }, duration: 250, ease: 'Back.Out' });
      void audio.say(settings[key] ? onLine : offLine);
    });
  }
}
