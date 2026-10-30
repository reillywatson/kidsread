import Phaser from 'phaser';
import { TEXTURES, OVERRIDES } from '../art';
import { Session } from '../session';
import { GAMES } from '../games';
import { profiles, selectProfile, createProfile } from '../state';
import { preload } from '../audio';
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
    // Dev shortcut: ?game=zombies plays just that minigame (as the first player).
    const only = new URLSearchParams(location.search).get('game');
    const meta = GAMES.find(g => g.meta.id === only)?.meta;
    if (meta) {
      selectProfile((profiles()[0] ?? createProfile('pikachu')).id);
      const s = new Session();
      s.games = [meta];
      s.start(this);
    } else this.scene.start('Profiles');
  }
}
