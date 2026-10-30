import Phaser from 'phaser';
import { TEXTURES, OVERRIDES } from '../art';
import { Session } from '../session';
import { GAMES } from '../games';
import { profiles, selectProfile, createProfile } from '../state';
import { canPlayNow, preload, sfx } from '../audio';
import { LINES } from '../lines';

/** Rasterizes the SVG art into textures. */
export class Boot extends Phaser.Scene {
  constructor() { super('Boot'); }

  preload() {
    // While the art loads (a few seconds on a slow tablet): a bouncing book and a progress bar.
    const book = this.add.text(640, 300, '📖', { fontSize: '120px', padding: { x: 10, y: 14 } }).setOrigin(0.5);
    this.tweens.add({ targets: book, y: 270, duration: 450, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.add.rectangle(640, 450, 420, 34, 0xffffff, 0.6).setStrokeStyle(4, 0xffffff);
    const bar = this.add.rectangle(434, 450, 412, 26, 0x43c35e).setOrigin(0, 0.5).setScale(0, 1);
    this.load.on('progress', (v: number) => bar.setScale(v, 1));
    for (const [key, [svg, width, height]] of Object.entries(TEXTURES)) {
      if (OVERRIDES[key]) this.load.image(key, OVERRIDES[key]);
      else this.load.svg(key, 'data:image/svg+xml;base64,' + btoa(svg), { width, height });
    }
  }

  create() {
    // Just what the first screens say; each game loads its own lines as it starts.
    preload([LINES.whoIsPlaying, LINES.pickPicture, LINES.hiNew, LINES.welcomeBack, ...Object.values(LINES.worldHello)]);
    // Dev: ?tap shows the tap-to-start screen even where sound could start on its own.
    const forceTap = import.meta.env.DEV && new URLSearchParams(location.search).has('tap');
    void canPlayNow().then(ok => (ok && !forceTap ? this.go() : this.tapToStart()));
  }

  /**
   * Sound is held back until the first tap, so ask for one: a big play button. (Otherwise the
   * greeting and music would wait for the tap on a profile and play over "welcome back".)
   */
  private tapToStart() {
    this.children.removeAll(true);
    this.add.image(640, 360, 'bgHome');
    const btn = this.add.container(640, 340);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.15).fillCircle(6, 12, 130);
    g.fillStyle(0x43c35e).fillCircle(0, 0, 130).lineStyle(10, 0xffffff).strokeCircle(0, 0, 130);
    g.fillStyle(0xffffff).fillTriangle(-38, -62, -38, 62, 66, 0);
    btn.add(g);
    this.tweens.add({ targets: btn, scale: 1.08, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    // The whole screen works, not just the button; main.ts unlocks sound on this same tap.
    this.input.once('pointerdown', () => { sfx.pop(); this.go(); });
  }

  private go() {
    // Dev shortcut: ?game=zombies plays just that minigame (as the first player).
    const only = new URLSearchParams(location.search).get('game');
    const meta = GAMES.find(g => g.meta.id === only)?.meta;
    // ?playtest opens the playtest panel directly (handy as a bookmark on the tablet).
    if (new URLSearchParams(location.search).has('playtest')) this.scene.start('Playtest');
    else if (meta) {
      selectProfile((profiles()[0] ?? createProfile('pikachu')).id);
      const s = new Session();
      s.games = [meta];
      s.start(this);
    } else this.scene.start('Profiles');
  }
}
