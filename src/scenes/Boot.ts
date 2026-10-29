import Phaser from 'phaser';
import { TEXTURES, OVERRIDES } from '../art';
import { Session } from '../session';
import { GAMES } from '../games';
import { profiles, selectProfile, createProfile } from '../state';
import { preload } from '../audio';
import { allLines } from '../lines';

/** Rasterizes the SVG art into textures. */
export class Boot extends Phaser.Scene {
  constructor() { super('Boot'); }

  preload() {
    for (const [key, [svg, width, height]] of Object.entries(TEXTURES)) {
      if (OVERRIDES[key]) this.load.image(key, OVERRIDES[key]);
      else this.load.svg(key, 'data:image/svg+xml;base64,' + btoa(svg), { width, height });
    }
  }

  create() {
    preload(allLines());
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
