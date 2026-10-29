// Reusable Phaser building blocks: tappable things, emoji pictures, readable words.
import Phaser from 'phaser';
import { segment, HEART, PIC, BANK } from './data/curriculum';
import * as audio from './audio';

export const W = 1280;
export const H = 720;
// Andika is designed for early readers (single-story a and g).
export const FONT = 'Andika, "Comic Sans MS", sans-serif';
export const EMOJI_FONT = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';

type Scene = Phaser.Scene;
type Container = Phaser.GameObjects.Container;
export type Tappable = Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.Transform & Phaser.GameObjects.Components.AlphaSingle;

export function tweenP(scene: Scene, cfg: Phaser.Types.Tweens.TweenBuilderConfig): Promise<void> {
  return new Promise(resolve => {
    scene.tweens.add({ ...cfg, onComplete: (...args) => { (cfg.onComplete as ((...a: unknown[]) => void) | undefined)?.(...args); resolve(); } });
  });
}

/** Make a container respond to taps over a w×h box centered on it. */
export function tappable<T extends Container>(c: T, w: number, h: number): T {
  c.setSize(w, h);
  c.setInteractive({ useHandCursor: true });
  return c;
}

export function onTap(obj: Phaser.GameObjects.GameObject, fn: () => void) {
  obj.on('pointerdown', (_p: Phaser.Input.Pointer, _x: number, _y: number, e: Phaser.Types.Input.EventData) => {
    e?.stopPropagation();
    fn();
  });
}

export function text(scene: Scene, x: number, y: number, s: string, size: number, color = '#2b2b2b', opts: Phaser.Types.GameObjects.Text.TextStyle = {}) {
  return scene.add.text(x, y, s, {
    fontFamily: FONT, fontSize: `${size}px`, color, fontStyle: 'bold', padding: { x: 4, y: 8 }, ...opts,
  }).setOrigin(0.5);
}

export function emoji(scene: Scene, x: number, y: number, e: string, size: number) {
  return scene.add.text(x, y, e, { fontFamily: EMOJI_FONT, fontSize: `${size}px`, padding: { x: 8, y: 12 } }).setOrigin(0.5);
}

/** A picture card for a word (curriculum PIC or phonemic BANK), optionally big/small or wearing a hat. */
export function picture(scene: Scene, x: number, y: number, word: string, { size = 110, card = true, scale = 1, hat = false } = {}) {
  const c = scene.add.container(x, y);
  const box = size * 1.45;
  if (card) {
    // Cel-shaded card: a darker base peeking out below a white face, and a gold rim.
    const g = scene.add.graphics();
    g.fillStyle(0x000000, 0.14).fillRoundedRect(-box / 2 + 4, -box / 2 + 12, box, box, 26);
    g.fillStyle(0xe6dccb, 1).fillRoundedRect(-box / 2, -box / 2, box, box, 26);
    g.fillStyle(0xffffff, 1).fillRoundedRect(-box / 2, -box / 2, box, box - 9, 26);
    g.fillStyle(0xffffff, 0.6).fillRoundedRect(-box / 2 + 12, -box / 2 + 8, box - 24, box * 0.18, 12);
    g.lineStyle(5, 0xffc94d, 1).strokeRoundedRect(-box / 2, -box / 2, box, box, 26);
    c.add(g);
  }
  const e = emoji(scene, 0, hat ? 10 : 0, PIC[word] || BANK[word] || '❓', size * scale);
  c.add(e);
  if (hat) c.add(emoji(scene, 0, -size * scale * 0.55, '🎩', size * 0.5));
  return tappable(c, box, box);
}

/** A shaded, glossy disc: darker rim on the lower right, highlight on the upper left. */
export function glossyCircle(scene: Scene, r: number, color: number) {
  const dark = Phaser.Display.Color.IntegerToColor(color).darken(22).color;
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.2).fillCircle(0, 8, r);
  g.fillStyle(dark, 1).fillCircle(0, 0, r);
  g.fillStyle(color, 1).fillCircle(-r * 0.06, -r * 0.08, r * 0.9);
  g.fillStyle(0xffffff, 0.35).fillEllipse(-r * 0.22, -r * 0.48, r * 0.95, r * 0.42);
  g.lineStyle(Math.max(4, r * 0.08), 0xffffff, 1).strokeCircle(0, 0, r - 3);
  return g;
}

/** A round button with an emoji or SVG texture icon. */
export function roundButton(scene: Scene, x: number, y: number, r: number, color: number, icon: string, onPress: () => void, { texture = false } = {}) {
  const c = scene.add.container(x, y);
  c.add(glossyCircle(scene, r, color));
  if (icon === 'play') {
    c.add(scene.add.triangle(r * 0.1, 0, 0, 0, 0, r, r * 0.85, r / 2, 0xffffff).setOrigin(0.5));
  } else if (texture) {
    const img = scene.add.image(0, 0, icon);
    img.setScale((r * 1.5) / Math.max(img.width, img.height));
    c.add(img);
  } else c.add(emoji(scene, 0, 2, icon, r * 0.95));
  tappable(c, r * 2, r * 2);
  onTap(c, () => {
    audio.sfx.tap();
    scene.tweens.add({ targets: c, scale: { from: 0.85, to: 1 }, duration: 200, ease: 'Back.Out' });
    onPress();
  });
  return c;
}

/**
 * A word drawn grapheme by grapheme. Decodable words get UFLI-style sound dots under
 * each grapheme; heart words get a ♥ over the irregular letters. Tapping a grapheme
 * plays its sound (sound-by-sound support, not the whole word).
 */
export class WordView extends Phaser.GameObjects.Container {
  parts: { text: Phaser.GameObjects.Text; g: string | null }[] = [];

  constructor(scene: Scene, x: number, y: number, public word: string, { size = 90, dots = true, tapSounds = true, color = '#2b2b2b', cap = false } = {}) {
    super(scene, x, y);
    scene.add.existing(this);
    const heart = HEART[word];
    const toks = heart ? [...word].map((ch, i) => ({ t: ch, g: null as string | null, heart: heart.hp.includes(i) }))
      : segment(word).map(t => ({ ...t, heart: false }));
    if (cap) toks[0] = { ...toks[0], t: toks[0].t[0].toUpperCase() + toks[0].t.slice(1) };
    let cx = 0;
    const gap = size * 0.06;
    for (const tok of toks) {
      const tx = scene.add.text(cx, 0, tok.t, {
        fontFamily: FONT, fontSize: `${size}px`, color: tok.g === null && !heart ? '#9a9a9a' : color, fontStyle: 'bold', padding: { x: 2, y: 10 },
      }).setOrigin(0, 0.5);
      this.add(tx);
      if (dots && tok.g) this.add(scene.add.circle(cx + tx.width / 2, size * 0.62, size * 0.07, 0xe53935));
      if (tok.heart) this.add(emoji(scene, cx + tx.width / 2, -size * 0.7, '❤️', size * 0.3));
      if (tapSounds && tok.g) {
        tx.setInteractive({ useHandCursor: true });
        const g = tok.g;
        onTap(tx, () => { this.flash(this.parts.findIndex(p => p.text === tx)); void audio.sound(g); });
      }
      this.parts.push({ text: tx, g: tok.g });
      cx += tx.width + gap;
    }
    // Center horizontally around x.
    for (const child of this.list as unknown as Phaser.GameObjects.Components.Transform[]) child.x -= cx / 2;
    this.setSize(cx, size * 1.4);
  }

  flash(i: number, on?: boolean) {
    const t = this.parts[i]?.text;
    if (!t) return;
    t.setColor('#e53935');
    this.scene.tweens.add({ targets: t, scale: { from: 1.25, to: 1 }, duration: 300 });
    if (!on) this.scene.time.delayedCall(450, () => t.setColor('#2b2b2b'));
  }

  setAllColor(c: string) { this.parts.forEach(p => p.text.setColor(c)); }
}

/** Celebration particles. */
export function burst(scene: Scene, x: number, y: number, chars = ['⭐', '✨', '🌟'], n = 12) {
  for (let i = 0; i < n; i++) {
    const p = emoji(scene, x, y, chars[i % chars.length], 34 + Math.random() * 20).setDepth(1000);
    const a = (Math.PI * 2 * i) / n + Math.random() * 0.3;
    const d = 90 + Math.random() * 90;
    scene.tweens.add({
      targets: p, x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, alpha: 0, scale: 1.4, angle: Math.random() * 180,
      duration: 700 + Math.random() * 300, ease: 'Cubic.Out', onComplete: () => p.destroy(),
    });
  }
}

export function wiggle(scene: Scene, obj: Tappable) {
  scene.tweens.add({ targets: obj, angle: { from: -10, to: 10 }, duration: 70, yoyo: true, repeat: 3, onComplete: () => { obj.angle = 0; } });
}

/**
 * Image scaled to a target height. Characters with an eyes-shut frame ("<key>-blink")
 * blink every few seconds — whatever texture the game has given them at the time.
 */
export function sprite(scene: Scene, x: number, y: number, key: string, height: number) {
  const img = scene.add.image(x, y, key);
  img.setScale(height / img.height);
  if (scene.textures.exists(key + '-blink')) {
    scene.time.addEvent({
      delay: 2400 + Math.random() * 2400, loop: true, callback: () => {
        const k = img.texture.key;
        if (!img.active || !scene.textures.exists(k + '-blink')) return;
        img.setTexture(k + '-blink');
        scene.time.delayedCall(140, () => { if (img.active && img.texture.key === k + '-blink') img.setTexture(k); });
      },
    });
  }
  return img;
}
