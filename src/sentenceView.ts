// Drawing sentences and their pictures (see sentences.ts for the sentences themselves).
import Phaser from 'phaser';
import { HEART } from './data/curriculum';
import * as audio from './audio';
import type { Pic } from './sentences';
import { WordView, picture, text } from './widgets';

export function drawPic(scene: Phaser.Scene, x: number, y: number, p: Pic, size = 100) {
  return picture(scene, x, y, p.noun, { size, scale: p.size === 'big' ? 1.25 : p.size === 'small' ? 0.5 : 1, hat: p.hat, pair: p.pair });
}

/**
 * Lay a sentence out on one line centered at (cx, y), shrinking it to fit maxWidth. The first
 * word is capitalized and a period follows. `blank` leaves a gap (an underline) for that word.
 */
export function layoutSentence(scene: Phaser.Scene, words: string[], cx: number, y: number,
  { size = 72, maxWidth = 840, blank = -1 } = {}) {
  const gap = size * 0.45;
  const views = words.map((w, i) => i === blank ? null
    : new WordView(scene, 0, y, w, { size, cap: i === 0, dots: !HEART[w], tapSounds: true }));
  const blankW = size * 2.6;
  const widths = views.map(v => (v ? v.width : blankW));
  const total = widths.reduce((a, b) => a + b, 0) + gap * (words.length - 1) + size * 0.4;
  const k = Math.min(1, maxWidth / total);
  let x = cx - (total * k) / 2;
  const items: Phaser.GameObjects.GameObject[] = [];
  let slot = { x: 0, y, w: blankW * k };
  views.forEach((v, i) => {
    const w = widths[i] * k;
    if (v) { v.setScale(k); v.x = x + w / 2; items.push(v); }
    else {
      slot = { x: x + w / 2, y, w };
      items.push(scene.add.rectangle(slot.x, y + size * 0.5 * k, w, 6, 0x2b2b2b, 0.7));
    }
    x += w + gap * k;
  });
  const period = text(scene, x - gap * k - size * 0.1 * k, y, '.', size * k).setOrigin(0, 0.5);
  items.push(period);
  // Heart words are learned by heart: tapping one says it (decodable words sound out letter by letter).
  views.forEach(v => {
    if (!v || !HEART[v.word]) return;
    v.setInteractive({ useHandCursor: true });
    v.on('pointerdown', () => { void audio.say(v.word); });
  });
  return { views, items, slot, scale: k };
}
