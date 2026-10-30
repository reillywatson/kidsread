import Phaser from 'phaser';
import '@fontsource/andika/400.css';
import '@fontsource/andika/700.css';
import './style.css';
import * as audio from './audio';
import { startAutoBackup } from './sync';
import { GAMES } from './games';
import { Boot } from './scenes/Boot';
import { Home } from './scenes/Home';
import { Reward } from './scenes/Reward';
import { Stickers } from './scenes/Stickers';
import { Profiles, AvatarPicker } from './scenes/Profiles';
import { Playtest } from './scenes/Playtest';
import { Settings } from './scenes/Settings';
import { Bookshelf, Book } from './scenes/Books';
import { MapScene } from './scenes/Map';
import { W, H } from './widgets';

// Browsers only allow sound after a user gesture.
document.addEventListener('pointerdown', () => audio.unlock(), { capture: true });

async function start() {
  // Phaser draws text to canvas, so the font must be ready first.
  await Promise.all([document.fonts.load('700 40px Andika'), document.fonts.load('400 40px Andika'), audio.loadRecordings()]).catch(() => {});
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: W,
    height: H,
    backgroundColor: '#7fd3ff',
    // Centered by style.css: Phaser's own centering measures the canvas on screen, which the turn skews.
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.NO_CENTER },
    input: { activePointers: 3 },
    scene: [Boot, Profiles, AvatarPicker, Home, Settings, Reward, Stickers, Bookshelf, Book, MapScene, Playtest, ...GAMES.map(g => g.scene)],
  });
  turnWithStage(game);
  if (import.meta.env.DEV) Object.assign(window, { game });
  else { keepOffline(); startAutoBackup(); }
}

/**
 * Production only: register the service worker (see src/sw/sw.js), ask the browser to keep our
 * storage, and once things are quiet, download every voice clip so the whole game works offline.
 */
function keepOffline() {
  if (!('serviceWorker' in navigator)) return;
  void navigator.serviceWorker.register('/sw.js').then(async () => {
    const sw = await navigator.serviceWorker.ready;
    void navigator.storage?.persist?.().catch(() => {});
    setTimeout(() => sw.active?.postMessage({ type: 'warm', urls: audio.allClipUrls() }), 5000);
  }).catch(() => { /* no offline support; the game still works online */ });
}

// Matches the media query in style.css that turns the stage sideways. In development, `?turn`
// forces the turned layout so it can be tried on a desktop browser.
const ROTATED = window.matchMedia('(orientation: portrait) and (pointer: coarse)');
const FORCE_TURN = import.meta.env.DEV && new URLSearchParams(location.search).has('turn');
if (FORCE_TURN) document.documentElement.classList.add('turn');
const turned = () => FORCE_TURN || ROTATED.matches;

/**
 * Phaser normally measures its parent with getBoundingClientRect and maps taps by page position,
 * and both are skewed when style.css turns the stage a quarter turn. Size the game from the
 * parent's own (unturned) layout box instead, and map taps back through the turn.
 */
function turnWithStage(game: Phaser.Game) {
  const sm = game.scale as unknown as { parent: HTMLElement; parentSize: Phaser.Structs.Size; getParentBounds(): boolean };
  sm.getParentBounds = function () {
    const w = this.parent.clientWidth, h = this.parent.clientHeight;
    if (this.parentSize.width === w && this.parentSize.height === h) return false;
    this.parentSize.setSize(w, h);
    return true;
  };

  type TransformPointer = (pointer: Phaser.Input.Pointer, pageX: number, pageY: number, wasMove: boolean) => void;
  const im = game.input as unknown as { transformPointer: TransformPointer };
  const plain = im.transformPointer.bind(im);
  const stage = document.getElementById('stage')!;
  im.transformPointer = (pointer, pageX, pageY, wasMove) => {
    if (!turned()) { plain(pointer, pageX, pageY, wasMove); return; }
    // Undo rotate(90deg) translateY(-100%): screen (x, y) is stage (y, stageHeight - x).
    const lx = pageY, ly = stage.clientHeight - pageX;
    const c = game.canvas;
    pointer.prevPosition.copy(pointer.position);
    pointer.position.set(
      ((lx - c.offsetLeft) * game.scale.width) / c.offsetWidth,
      ((ly - c.offsetTop) * game.scale.height) / c.offsetHeight,
    );
  };
  // Turning the device swaps the stage's layout box; make Phaser re-measure.
  ROTATED.addEventListener('change', () => setTimeout(() => game.scale.refresh(), 50));
  game.scale.refresh();
}

void start();
