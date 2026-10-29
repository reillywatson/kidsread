// Sticker playground: drag collected stickers from the tray onto picture scenes. Stickers can
// be placed as many times as you like, stay where they're put (per player, per page), say
// their name when tapped, and go away when dragged back to the tray. Stickers still to be
// won show as "?" in the tray.
import Phaser from 'phaser';
import { learner } from '../state';
import { STICKERS, type Sticker } from '../stickers';
import type { PlacedSticker } from '../learner';
import * as audio from '../audio';
import { LINES } from '../lines';
import { W, H, burst, emoji, roundButton, sprite } from '../widgets';

const PAGES = ['bgField', 'bgBay', 'bgLawn', 'bgSea', 'bgPond'];
const TRAY_TOP = H - 150;
const PER_TRAY = 8;
const MAX_PER_PAGE = 40;
/** Movement (px) under which a press counts as a tap, not a drag. */
const TAP = 12;

type Obj = Phaser.GameObjects.Image | Phaser.GameObjects.Text;

export class Stickers extends Phaser.Scene {
  private page = 0;
  private trayPage = 0;
  private placed: { obj: Obj; data: PlacedSticker }[] = [];
  private bg!: Phaser.GameObjects.Image;
  private tray!: Phaser.GameObjects.Container;
  private dots!: Phaser.GameObjects.Container;

  constructor() { super('Stickers'); }

  create() {
    this.cameras.main.fadeIn(220, 255, 255, 255);
    this.placed = [];
    this.bg = this.add.image(640, 360, PAGES[this.page]);
    roundButton(this, 60, 56, 40, 0xff7043, '🏠', () => this.scene.start('Home')).setDepth(900);
    roundButton(this, W - 170, 56, 40, 0x42a5f5, '◀️', () => this.turn(-1)).setDepth(900);
    roundButton(this, W - 60, 56, 40, 0x42a5f5, '▶️', () => this.turn(1)).setDepth(900);
    this.dots = this.add.container(W / 2, 46).setDepth(900);

    const g = this.add.graphics().setDepth(800);
    g.fillStyle(0xffffff, 0.88).fillRoundedRect(20, TRAY_TOP, W - 40, 140, 26).lineStyle(6, 0xffc94d).strokeRoundedRect(20, TRAY_TOP, W - 40, 140, 26);
    this.tray = this.add.container(0, 0).setDepth(801);
    roundButton(this, 62, TRAY_TOP + 70, 32, 0xffc94d, '⬅️', () => this.scrollTray(-1)).setDepth(802);
    roundButton(this, W - 62, TRAY_TOP + 70, 32, 0xffc94d, '➡️', () => this.scrollTray(1)).setDepth(802);

    this.showPage();
    this.showTray();
    if (!learner.s.stickers.length || !Object.values(learner.s.board ?? {}).some(b => b.length)) void audio.say(LINES.stickerHint);
  }

  private board(): PlacedSticker[] {
    const b = (learner.s.board ??= {});
    return (b[PAGES[this.page]] ??= []);
  }

  private save() {
    const b = (learner.s.board ??= {});
    b[PAGES[this.page]] = this.placed.map(p => p.data);
    learner.save();
  }

  private turn(d: number) {
    this.page = (this.page + d + PAGES.length) % PAGES.length;
    this.cameras.main.flash(180, 255, 255, 255);
    this.bg.setTexture(PAGES[this.page]);
    this.showPage();
  }

  private showPage() {
    this.placed.forEach(p => p.obj.destroy());
    this.placed = [];
    for (const data of this.board()) {
      const st = STICKERS.find(s => s.id === data.id);
      if (st) this.place(st, data.x, data.y, data);
    }
    this.dots.removeAll(true);
    PAGES.forEach((_, i) => this.dots.add(this.add.circle((i - (PAGES.length - 1) / 2) * 30, 0, 9, i === this.page ? 0xffd21f : 0xffffff, 0.9)
      .setStrokeStyle(3, 0x2b2b2b, 0.4)));
  }

  private art(st: Sticker, x: number, y: number, size: number): Obj {
    return st.texture ? sprite(this, x, y, st.texture, size) : emoji(this, x, y, st.emoji!, size * 0.8);
  }

  /** A sticker on the scene: drag to move (or back to the tray to remove), tap to hear it. */
  private place(st: Sticker, x: number, y: number, data: PlacedSticker = { id: st.id, x, y }) {
    const obj = this.art(st, x, y, 110).setInteractive({ useHandCursor: true }).setDepth(700);
    const entry = { obj, data };
    this.placed.push(entry);
    obj.on('pointerdown', (p: Phaser.Input.Pointer) => this.drag(entry, st, p, false));
    return entry;
  }

  private showTray() {
    this.tray.removeAll(true);
    const owned = STICKERS.filter(s => learner.s.stickers.includes(s.id));
    const locked = STICKERS.length - owned.length;
    const slots: (Sticker | null)[] = [...owned, ...Array<null>(locked).fill(null)];
    const pages = Math.max(1, Math.ceil(slots.length / PER_TRAY));
    this.trayPage = Math.min(this.trayPage, pages - 1);
    const shown = slots.slice(this.trayPage * PER_TRAY, (this.trayPage + 1) * PER_TRAY);
    const step = (W - 260) / PER_TRAY;
    shown.forEach((st, i) => {
      const x = 130 + step / 2 + i * step, y = TRAY_TOP + 70;
      if (!st) {
        this.tray.add([this.add.circle(x, y, 44, 0x000000, 0.07), emoji(this, x, y, '❔', 40).setAlpha(0.35)]);
        return;
      }
      const icon = this.art(st, x, y, 96).setInteractive({ useHandCursor: true });
      this.tray.add(icon);
      // Pressing a tray sticker peels off a copy to drag onto the scene.
      icon.on('pointerdown', (p: Phaser.Input.Pointer) => {
        if (this.placed.length >= MAX_PER_PAGE) { audio.sfx.boing(); return; }
        audio.sfx.pop();
        const entry = this.place(st, p.x, p.y);
        entry.obj.setScale(entry.obj.scale * 1.2);
        this.drag(entry, st, p, true);
      });
    });
  }

  private scrollTray(d: number) {
    const pages = Math.ceil(STICKERS.length / PER_TRAY);
    this.trayPage = (this.trayPage + d + pages) % pages;
    this.showTray();
    this.tweens.add({ targets: this.tray, x: { from: d * 60, to: 0 }, alpha: { from: 0, to: 1 }, duration: 200 });
  }

  private drag(entry: { obj: Obj; data: PlacedSticker }, st: Sticker, p0: Phaser.Input.Pointer, fromTray: boolean) {
    const { obj } = entry;
    const start = { x: p0.x, y: p0.y };
    const base = fromTray ? obj.scale / 1.2 : obj.scale;
    obj.setDepth(950); // above the tray while dragging
    if (!fromTray) this.tweens.add({ targets: obj, scale: base * 1.15, duration: 120 });
    const move = (p: Phaser.Input.Pointer) => obj.setPosition(p.x, p.y);
    const up = (p: Phaser.Input.Pointer) => {
      this.input.off('pointermove', move);
      this.input.off('pointerup', up);
      const tap = Math.hypot(p.x - start.x, p.y - start.y) < TAP;
      obj.setDepth(700);
      if (tap && fromTray) {
        // A tap on the tray: the sticker hops onto a free-ish spot.
        const x = Math.round(160 + Math.random() * (W - 320)), y = Math.round(170 + Math.random() * (TRAY_TOP - 260));
        this.tweens.add({ targets: obj, x, y, scale: base, duration: 450, ease: 'Back.Out' });
        entry.data = { id: st.id, x, y };
        void audio.say(st.name);
      } else if (tap) {
        this.tweens.add({ targets: obj, scale: base, angle: { from: -15, to: 15 }, duration: 100, yoyo: true, repeat: 2, onComplete: () => { obj.angle = 0; obj.setScale(base); } });
        void audio.say(st.name);
      } else if (p.y > TRAY_TOP) {
        // Back in the tray: poof.
        audio.sfx.whoosh();
        burst(this, obj.x, obj.y, ['💨', '✨'], 6);
        this.placed = this.placed.filter(e => e !== entry);
        this.tweens.add({ targets: obj, scale: 0, duration: 200, onComplete: () => obj.destroy() });
      } else {
        audio.sfx.pop();
        this.tweens.add({ targets: obj, scale: base, duration: 180, ease: 'Back.Out' });
        entry.data = { id: st.id, x: Math.round(obj.x), y: Math.round(obj.y) };
      }
      this.save();
    };
    this.input.on('pointermove', move);
    this.input.on('pointerup', up);
  }
}
