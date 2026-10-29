import Phaser from 'phaser';
import { TEXTURES } from '../art';
import { Session } from '../session';
import { GAMES } from '../games';

/** Rasterizes the SVG art into textures. */
export class Boot extends Phaser.Scene {
  constructor() { super('Boot'); }

  preload() {
    for (const [key, [svg, width, height]] of Object.entries(TEXTURES)) {
      this.load.svg(key, 'data:image/svg+xml;base64,' + btoa(svg), { width, height });
    }
  }

  create() {
    // Dev shortcut: ?game=zombies plays just that minigame.
    const only = new URLSearchParams(location.search).get('game');
    const meta = GAMES.find(g => g.meta.id === only)?.meta;
    if (meta) {
      const s = new Session();
      s.games = [meta];
      s.start(this);
    } else this.scene.start('Home');
  }
}
