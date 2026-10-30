// Storybooks: a bookshelf of decodable picture books, and the book reader. Books unlock as the
// child reaches their words' lessons. In a book, the picture is on the left page and the words
// on the right; tap a word to hear it sounded out (it turns green: read!), or 🔊 to have the page
// read aloud. After the last page, a quick "which one was in the book?" question, then the end.
import Phaser from 'phaser';
import { learner } from '../state';
import { HEART, segment } from '../data/curriculum';
import { STORIES, storyLesson, wordKey, type Backdrop, type Story } from '../data/stories';
import { pickOne, shuffle } from '../learner';
import * as audio from '../audio';
import { LINES } from '../lines';
import { playMusic } from '../music';
import { WordView, burst, confetti, emoji, glossyCircle, roundButton, tappable, text, onTap, wiggle } from '../widgets';

const COLORS = [0xef5350, 0x42a5f5, 0x66bb6a, 0xffa726, 0xab47bc, 0x26c6da, 0xec407a, 0x8d6e63, 0x5c6bc0];

export const unlocked = (s: Story) => storyLesson(s) <= learner.lesson;
export const timesRead = (s: Story) => learner.s.books?.[s.id] ?? 0;
/** Unlocked books not read yet (for the "new book" badge on the home screen). */
export const newBooks = () => STORIES.filter(s => unlocked(s) && !timesRead(s));

export class Bookshelf extends Phaser.Scene {
  constructor() { super('Bookshelf'); }

  create() {
    this.cameras.main.fadeIn(220, 255, 255, 255);
    this.add.image(640, 360, 'bgHome');
    playMusic('home');
    roundButton(this, 60, 56, 40, 0xff7043, '🏠', () => this.scene.start('Home'));
    const g = this.add.graphics();
    for (const y of [272, 452, 632]) {
      g.fillStyle(0x6d4c41).fillRect(90, y, 1100, 22);
      g.fillStyle(0x8d6e63).fillRect(90, y, 1100, 8);
    }
    let busy = false;
    // Six to a shelf, three shelves.
    const CW = 172, CH = 124;
    STORIES.forEach((s, i) => {
      const col = i % 6, row = Math.floor(i / 6);
      const c = this.add.container(640 + (col - 2.5) * 188, 205 + row * 180);
      const open = unlocked(s);
      const b = this.add.graphics();
      b.fillStyle(0x000000, 0.18).fillRoundedRect(-CW / 2 + 5, -CH / 2 + 8, CW, CH, 16);
      b.fillStyle(open ? COLORS[i % COLORS.length] : 0xb0bec5).fillRoundedRect(-CW / 2, -CH / 2, CW, CH, 16);
      b.fillStyle(0xffffff, 0.25).fillRect(-CW / 2, -CH / 2, 16, CH);
      b.fillStyle(0xffffff, 0.92).fillRoundedRect(-CW / 2 + 26, -CH / 2 + 12, CW - 38, 70, 12);
      c.add(b);
      c.add(emoji(this, 8, -16, s.cover, 50).setAlpha(open ? 1 : 0.35));
      const title = text(this, 4, 42, s.title, 18, '#ffffff').setStroke('#00000055', 4);
      if (title.width > CW - 16) title.setScale((CW - 16) / title.width);
      c.add(title);
      if (!open) c.add(emoji(this, 62, -36, '🔒', 32));
      else if (timesRead(s)) c.add(emoji(this, 70, -46, '⭐', 34));
      else {
        const sp = emoji(this, 70, -46, '✨', 32);
        this.tweens.add({ targets: sp, scale: 1.3, duration: 500, yoyo: true, repeat: -1 });
        c.add(sp);
      }
      tappable(c, CW, CH);
      onTap(c, () => {
        if (busy) return;
        if (!open) { audio.sfx.boing(); wiggle(this, c); return; }
        busy = true;
        audio.sfx.flip();
        this.tweens.add({ targets: c, scale: 1.15, duration: 200, yoyo: true, onComplete: () => this.scene.start('Book', { id: s.id }) });
      });
    });
    void audio.say(LINES.pickBook);
  }
}

/** The left page's picture area, and its backdrop scenes: [sky or wall, ground or floor]. */
const PIC = { x: 348, y: 380, w: 520, h: 380 };
const BACKDROPS: Record<Backdrop, [number, number]> = {
  park: [0xc8ecff, 0xa5d66b], home: [0xffe8c4, 0xd9a86c], pond: [0xc8ecff, 0x7fc8f0],
  farm: [0xd7f0ff, 0xd9b07a], town: [0xd0e8ff, 0xa8a8a8], night: [0x283593, 0x5c6bc0],
};
/** Picture bits that aren't things you'd remember from the story (for the end-of-book question). */
const EFFECTS = new Set(['💤', '💨', '💥', '✨', '💦', '💧', '❓', '💢', '🎉', '🎈', '⭐', '💖', '😊', '💭', '🌊', '🟤', '🕳️',
  '🥵', '☀️', '🌧️', '🔧', '😋', '😾', '🌲', '🍽️', '🎵', '💬', '🍀', '😮', '🤔', '🪑', '🛏️', '🪵', '🪨']);
const DECOYS = ['🦒', '🚀', '🍕', '🐘', '🎸', '🌈', '🦋', '🚂', '🍩', '🐢', '🦄', '⚽', '🐙', '🍉', '🚁', '🎃'];

/** Page index: -1 is the cover, then the pages, then the question (n), then "the end" (n + 1). */
export class Book extends Phaser.Scene {
  private story!: Story;
  private page = -1;
  private items: Phaser.GameObjects.GameObject[] = [];
  private views: WordView[] = [];
  private read = new Set<WordView>();
  private dots: Phaser.GameObjects.Arc[] = [];
  private nav: Phaser.GameObjects.Container[] = [];
  private startedAt = 0;
  private finished = false;
  private reading = 0;

  constructor() { super('Book'); }

  init(data: { id: string }) {
    this.story = STORIES.find(s => s.id === data.id) ?? STORIES[0];
  }

  private get n() { return this.story.pages.length; }

  create() {
    this.cameras.main.fadeIn(220, 255, 255, 255);
    this.add.image(640, 360, 'bgBook');
    this.backdrop();
    playMusic('friends');
    this.page = -1;
    this.items = [];
    this.startedAt = Date.now();
    this.finished = false;
    this.events.once('shutdown', () => {
      audio.stop();
      learner.logPlay({ game: 'books', at: this.startedAt, ms: Date.now() - this.startedAt, done: this.finished, right: 0, total: 0 });
    });
    roundButton(this, 60, 56, 40, 0xff7043, '📚', () => this.scene.start('Bookshelf'));
    this.nav = [
      roundButton(this, 110, 640, 40, 0x42a5f5, '◀️', () => this.turn(-1)).setDepth(10),
      roundButton(this, 1170, 640, 40, 0x43c35e, '▶️', () => this.turn(1)).setDepth(10),
      roundButton(this, 932, 640, 40, 0xffc94d, '🔊', () => { void this.readAloud(); }).setDepth(10),
    ];
    const n = this.n + 3;
    this.dots = Array.from({ length: n }, (_, i) => this.add.circle(640 + (i - (n - 1) / 2) * 30, 64, 9, 0xffffff, 0.6).setStrokeStyle(3, 0x6d4c41, 0.5));
    this.show();
  }

  /** The book's scene behind every picture: sky (or wall) above, ground (or floor) below. */
  private backdrop() {
    const [top, bottom] = BACKDROPS[this.story.bg];
    const { x, y, w, h } = PIC, x0 = x - w / 2, y0 = y - h / 2, ground = y0 + h * 0.66;
    const g = this.add.graphics();
    g.fillStyle(top).fillRoundedRect(x0, y0, w, h, 24);
    g.fillStyle(bottom).fillRoundedRect(x0, ground, w, y0 + h - ground, { tl: 0, tr: 0, bl: 24, br: 24 });
    if (this.story.bg === 'night') for (let i = 0; i < 18; i++) g.fillStyle(0xffffff, 0.8).fillCircle(x0 + 20 + Math.random() * (w - 40), y0 + 15 + Math.random() * (ground - y0 - 30), 2 + Math.random() * 2);
    if (this.story.bg === 'town') for (let rx = x0 + 20; rx < x0 + w - 30; rx += 70) g.fillStyle(0xffffff, 0.9).fillRect(rx, ground + 40, 36, 8);
    if (this.story.bg === 'park' || this.story.bg === 'farm') g.fillStyle(0xffe066).fillCircle(x0 + w - 60, y0 + 55, 30);
    g.lineStyle(6, 0xffffff, 0.9).strokeRoundedRect(x0, y0, w, h, 24);
  }

  private turn(d: number) {
    // Forward past the question only by answering it.
    this.goTo(Phaser.Math.Clamp(this.page + d, -1, this.page === this.n ? this.n : this.n + 1));
  }

  private goTo(next: number) {
    if (next === this.page) return;
    const d = next - this.page;
    audio.stop();
    this.reading++;
    audio.sfx.flip();
    this.flip(d);
    this.page = next;
    this.show();
  }

  /** A page sweeping over: from the right page onto the left (forward), or back. */
  private flip(d: number) {
    const fwd = d > 0;
    const flap = this.add.rectangle(640, 400, 576, 580, 0xfff8e6).setStrokeStyle(4, 0xefdcb8).setOrigin(fwd ? 1 : 0, 0.5).setDepth(5);
    flap.scaleX = 0;
    this.tweens.add({ targets: flap, scaleX: 1, duration: 170, ease: 'Quad.Out', onComplete: () =>
      this.tweens.add({ targets: flap, alpha: 0, duration: 160, onComplete: () => flap.destroy() }) });
  }

  private clear() {
    this.items.forEach(o => o.destroy());
    this.items = [];
    this.views = [];
    this.read.clear();
  }

  private show() {
    this.clear();
    this.dots.forEach((d, i) => d.setFillStyle(i === this.page + 1 ? 0xffd21f : 0xffffff, i === this.page + 1 ? 1 : 0.6));
    const [back, fwd, read] = this.nav;
    this.tweens.killTweensOf(fwd);
    fwd.setScale(1);
    // No going back from the cover, no skipping the question, nothing to read at the end.
    back.setVisible(this.page > -1);
    fwd.setVisible(this.page < this.n);
    read.setVisible(this.page < this.n);
    if (this.page === -1) {
      this.picture([[this.story.cover, 0, 0, 220]]);
      this.words(this.story.title, 72);
      void audio.say(LINES.yourTurnRead);
    } else if (this.page < this.n) {
      const p = this.story.pages[this.page];
      this.picture(p.art);
      this.words(p.text, 60);
    } else if (this.page === this.n) this.question();
    else this.end();
  }

  /** Emoji picture on the left page; the pieces pop in one by one, and wiggle when tapped. */
  private picture(art: [string, number, number, number][]) {
    art.forEach(([e, x, y, size], i) => {
      const o = emoji(this, PIC.x + x * 0.8, PIC.y + y * 0.8, e, size * 0.8).setScale(0);
      this.items.push(o);
      this.tweens.add({ targets: o, scale: 1, duration: 320, delay: 120 + i * 110, ease: 'Back.Out' });
      if (i === 0) this.tweens.add({ targets: o, y: o.y - 6, duration: 900, yoyo: true, repeat: -1, delay: 600, ease: 'Sine.InOut' });
      o.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
        audio.sfx.giggle();
        this.tweens.add({ targets: o, angle: { from: -12, to: 12 }, duration: 90, yoyo: true, repeat: 2, onComplete: () => { o.angle = 0; } });
      });
    });
  }

  /** The page's words on the right page, wrapped. Tap a word to hear it. */
  private words(t: string, size: number) {
    const maxW = 500, gap = size * 0.42, lineH = size * 1.7;
    type Tok = { v: WordView; punct: string; w: number };
    const toks: Tok[] = t.split(/\s+/).map(raw => {
      const m = raw.match(/^([A-Za-z']+)([^A-Za-z']*)$/)!;
      const k = wordKey(m[1]);
      const v = new WordView(this, 0, 0, k, { size, tapSounds: false, dots: !HEART[k], cap: m[1][0] !== m[1][0].toLowerCase() && k !== 'I' });
      return { v, punct: m[2], w: v.width + (m[2] ? size * 0.3 : 0) };
    });
    const lines: Tok[][] = [[]];
    let lw = 0;
    for (const tok of toks) {
      if (lines.at(-1)!.length && lw + gap + tok.w > maxW) { lines.push([]); lw = 0; }
      lw += (lines.at(-1)!.length ? gap : 0) + tok.w;
      lines.at(-1)!.push(tok);
    }
    const y0 = 380 - ((lines.length - 1) * lineH) / 2;
    lines.forEach((line, li) => {
      const total = line.reduce((a, tk) => a + tk.w, 0) + gap * (line.length - 1);
      let x = 932 - total / 2;
      for (const tk of line) {
        tk.v.setPosition(x + tk.v.width / 2, y0 + li * lineH);
        this.items.push(tk.v);
        this.views.push(tk.v);
        if (tk.punct) this.items.push(text(this, x + tk.v.width - 2, y0 + li * lineH, tk.punct, size).setOrigin(0, 0.5));
        tk.v.setInteractive({ useHandCursor: true }).on('pointerdown', () => { void this.sayWord(tk.v); });
        x += tk.w + gap;
      }
    });
    this.tweens.add({ targets: this.views, alpha: { from: 0, to: 1 }, duration: 300, delay: 150 });
  }

  /** Words the child has tapped stay green: read! */
  private settle(v: WordView) {
    v.resetColor();
    if (this.read.has(v)) v.parts.forEach(p => p.text.setColor(p.base === '#9a9a9a' ? '#9ccc9c' : '#2e7d32'));
  }

  /** Sound a word out (heart words are just said), then say it. Every word read → a sparkle. */
  private async sayWord(v: WordView) {
    const run = ++this.reading;
    if (!HEART[v.word]) {
      const toks = segment(v.word);
      for (let i = 0; i < toks.length; i++) {
        if (!toks[i].g || run !== this.reading) continue;
        v.flash(i, true);
        await audio.sound(toks[i].g!);
        v.resetColor(i);
      }
    }
    if (run !== this.reading || !v.active) return;
    v.setAllColor('#1e88e5');
    await audio.say(v.word);
    if (!v.active) return;
    const first = !this.read.has(v);
    this.read.add(v);
    this.settle(v);
    if (first && this.views.length && this.views.every(w => this.read.has(w))) {
      // The whole page is read: sparkle, and the ▶ button bounces.
      audio.sfx.sparkle();
      for (const w of this.views) burst(this, w.x, w.y, ['⭐', '✨'], 3);
      this.tweens.add({ targets: this.nav[1], scale: 1.18, duration: 380, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    }
  }

  private async readAloud() {
    const run = ++this.reading;
    for (const v of this.views) {
      if (run !== this.reading || !v.active) return;
      v.setAllColor('#1e88e5');
      await audio.say(v.word);
      if (v.active) this.settle(v);
    }
  }

  /** "Which one was in the book?" One thing from the story and two that weren't. */
  private question() {
    const inBook = [...new Set(this.story.pages.flatMap(p => p.art.map(a => a[0])))].filter(e => !EFFECTS.has(e));
    const answer = pickOne(inBook.length ? inBook : [this.story.cover]);
    const decoys = shuffle(DECOYS.filter(e => !inBook.includes(e))).slice(0, 2);
    const opts = shuffle([answer, ...decoys]);
    this.picture([[this.story.cover, 0, 0, 160], ['❓', 120, -100, 90]]);
    let done = false;
    opts.forEach((e, i) => {
      const c = this.add.container(932 + (i - 1) * 165, 380, [glossyCircle(this, 70, 0xffffff), emoji(this, 0, 2, e, 80)]).setScale(0);
      this.tweens.add({ targets: c, scale: 1, duration: 300, delay: 200 + i * 100, ease: 'Back.Out' });
      tappable(c, 140, 140);
      this.items.push(c);
      onTap(c, () => {
        if (done || c.alpha < 1) return;
        if (e !== answer) { audio.sfx.boing(); wiggle(this, c); c.setAlpha(0.4); return; }
        done = true;
        audio.sfx.ding();
        burst(this, c.x, c.y, ['⭐', '🎉', '✨'], 14);
        this.tweens.add({ targets: c, scale: 1.25, duration: 200, yoyo: true });
        void audio.say(pickOne(LINES.praise));
        this.time.delayedCall(1200, () => { if (this.page === this.n) this.goTo(this.n + 1); });
      });
    });
    void audio.say(LINES.whichInBook);
  }

  /** The end: celebrate, and a star for this book on the shelf. */
  private end() {
    const b = (learner.s.books ??= {});
    if (!this.finished) {
      b[this.story.id] = (b[this.story.id] ?? 0) + 1;
      for (const p of this.story.pages) for (const w of p.text.split(/\s+/)) {
        const k = wordKey(w.replace(/[^A-Za-z']/g, ''));
        learner.record((HEART[k] ? 'h:' : 'w:') + k, 'seen');
      }
      learner.save();
      this.finished = true;
    }
    this.picture([[this.story.cover, -60, 0, 170], ['⭐', 110, -90, 80], ['🎉', 120, 90, 80]]);
    const shelf = roundButton(this, 860, 380, 64, 0x42a5f5, '📚', () => this.scene.start('Bookshelf'));
    const again = roundButton(this, 1010, 380, 64, 0x43c35e, '🔁', () => { this.page = -1; this.show(); });
    this.items.push(shelf, again);
    audio.sfx.fanfare();
    confetti(this, 80);
    burst(this, PIC.x, PIC.y, ['⭐', '🎉', '✨'], 20);
    void audio.say(LINES.theEnd).then(() => audio.say(LINES.readBook));
  }
}
