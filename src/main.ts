import Phaser from 'phaser';
import '@fontsource/andika/400.css';
import '@fontsource/andika/700.css';
import './style.css';
import * as audio from './audio';
import { learner } from './state';
import { GAMES } from './games';
import { Boot } from './scenes/Boot';
import { Home } from './scenes/Home';
import { Reward } from './scenes/Reward';
import { Stickers } from './scenes/Stickers';
import { W, H } from './widgets';

// Browsers only allow sound after a user gesture.
document.addEventListener('pointerdown', () => audio.unlock(), { capture: true });

audio.configure({ voice: learner.s.settings.voice, rate: learner.s.settings.rate });

async function start() {
  // Phaser draws text to canvas, so the font must be ready first.
  await Promise.all([document.fonts.load('700 40px Andika'), document.fonts.load('400 40px Andika'), audio.loadClips()]).catch(() => {});
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: W,
    height: H,
    backgroundColor: '#7fd3ff',
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    input: { activePointers: 3 },
    scene: [Boot, Home, Reward, Stickers, ...GAMES.map(g => g.scene)],
  });
  if (import.meta.env.DEV) Object.assign(window, { game });
}

void start();
