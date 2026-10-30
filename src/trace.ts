// Letter tracing, shared by the tracing games. Draws a letter on handwriting lines as a wide
// light "track", shows where the next stroke starts (a green dot and an arrow), can demo the
// strokes, and follows the child's finger along them:
//  - 'trace' mode: drag along the stroke; ink paints in as you go. Only forward progress near
//    the track counts, and wandering off is never punished (it just doesn't paint).
//  - 'dots' mode: stars along the letter; touch (or drag through) them in order.
import Phaser from 'phaser';
import { LETTERS, bounds, resample, type Pt } from './data/letters';
import type { BaseGame } from './games/BaseGame';

export interface TraceSkin {
  mode: 'trace' | 'dots';
  /** Ink color for sample i of n (all samples of the letter). */
  ink: (i: number, n: number) => number;
  /** The track under the ink. */
  track: number;
  /** Dashed center line on the track (makes it a road). */
  dashes?: number;
  /** The writing paper behind the letter: color and opacity. */
  paper?: [number, number];
  /** Optional: something that rides along at the tip of the ink (a brush, a truck). */
  rider?: Phaser.GameObjects.Image | Phaser.GameObjects.Text;
  /** Turn the rider to face along the path (for vehicles). */
  riderTurns?: boolean;
  /** Called as each dot is reached / each stroke finishes. */
  onStep?: (i: number) => void;
}

const UNIT = 3.4;
const TOP = 128;
const LOOKAHEAD = 70; // px of path the finger may skip ahead

export class Tracer {
  private strokes: { pts: Pt[]; dist: number[] }[] = [];
  private g!: Phaser.GameObjects.Graphics;
  private inkG!: Phaser.GameObjects.Graphics;
  private marks: Phaser.GameObjects.GameObject[] = [];
  private stars: Phaser.GameObjects.Text[][] = [];
  private total = 0;
  private offset: number[] = [];
  /** How many pointer moves were near the path vs. not (a rough neatness measure). */
  on = 0;
  off = 0;

  constructor(private scene: BaseGame, public letter: string, private skin: TraceSkin, private tol = 46) {
    const raw = LETTERS[letter];
    const b = bounds(raw);
    const x0 = 640 - ((b.x0 + b.x1) / 2) * UNIT;
    const toPx = ([x, y]: Pt): Pt => [x0 + x * UNIT, TOP + y * UNIT];
    for (const s of raw) {
      const pts = resample(s, 2).map(toPx);
      const dist = [0];
      for (let i = 1; i < pts.length; i++) dist.push(dist[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
      this.offset.push(this.total);
      this.total += pts.length;
      this.strokes.push({ pts, dist });
    }
  }

  /** Handwriting lines, the track, and (in dots mode) the stars. */
  draw() {
    const s = this.scene, g = (this.g = s.add.graphics());
    const y = (u: number) => TOP + u * UNIT;
    const [paper, alpha] = this.skin.paper ?? [0xffffff, 0.7];
    g.fillStyle(paper, alpha).fillRoundedRect(290, y(-10), 700, 150 * UNIT, 30);
    g.lineStyle(4, 0x42a5f5, 0.7).lineBetween(310, y(0), 970, y(0));
    for (let x = 310; x < 970; x += 28) g.lineStyle(4, 0x42a5f5, 0.5).lineBetween(x, y(50), x + 14, y(50));
    g.lineStyle(5, 0xe53935, 0.7).lineBetween(310, y(100), 970, y(100));
    g.lineStyle(3, 0x42a5f5, 0.3).lineBetween(310, y(140), 970, y(140));
    for (const st of this.strokes) {
      for (const [px, py] of st.pts) g.fillStyle(this.skin.track, 1).fillCircle(px, py, st.pts.length === 1 ? 24 : 28);
    }
    if (this.skin.dashes !== undefined) {
      for (const st of this.strokes) st.pts.forEach(([px, py], i) => { if (i % 6 < 3) g.fillStyle(this.skin.dashes!, 0.9).fillCircle(px, py, 3.5); });
    }
    this.inkG = s.add.graphics();
    if (this.skin.mode === 'dots') {
      this.stars = this.strokes.map(st => {
        // A star about every 26 grid units (samples are 2 units apart), always one at each end.
        const n = st.pts.length, gap = 12;
        const idx = n === 1 ? [0] : [...Array(n).keys()].filter(i => i % gap === 0 && n - 1 - i >= gap / 2);
        if (n > 1) idx.push(n - 1);
        // Hidden until it's this stroke's turn (strokes can cross, like the stem of "a").
        return idx.map(i => s.add.text(st.pts[i][0], st.pts[i][1], '⭐', { fontSize: '40px', padding: { x: 6, y: 8 } })
          .setOrigin(0.5).setAlpha(0).setData('i', i));
      });
    }
    this.skin.rider?.setDepth(50).setVisible(false);
  }

  /** Green dot and arrow at the start of stroke k. */
  private startMark(k: number) {
    this.marks.forEach(m => m.destroy());
    const { pts } = this.strokes[k];
    const [x, y] = pts[0];
    const dot = this.scene.add.circle(x, y, 22, 0x43c35e).setStrokeStyle(5, 0xffffff).setDepth(40);
    this.scene.tweens.add({ targets: dot, scale: 1.3, duration: 450, yoyo: true, repeat: -1 });
    this.marks = [dot];
    if (pts.length > 8) {
      const [ax, ay] = pts[Math.min(pts.length - 1, 12)];
      const ang = Math.atan2(ay - y, ax - x);
      const a = this.scene.add.triangle(x + Math.cos(ang) * 46, y + Math.sin(ang) * 46, 0, -12, 0, 12, 22, 0, 0xffffff)
        .setRotation(ang).setDepth(40).setStrokeStyle(3, 0x43c35e);
      this.marks.push(a);
    }
  }

  private paint(k: number, from: number, to: number) {
    const { pts } = this.strokes[k];
    for (let i = Math.max(0, from); i <= to; i++) {
      this.inkG.fillStyle(this.skin.ink(this.offset[k] + i, this.total), 1).fillCircle(pts[i][0], pts[i][1], pts.length === 1 ? 22 : 20);
    }
    this.ride(k, to);
  }

  private ride(k: number, i: number) {
    const r = this.skin.rider;
    if (!r) return;
    const { pts } = this.strokes[k];
    r.setVisible(true).setPosition(pts[i][0], pts[i][1]);
    if (this.skin.riderTurns && pts.length > 1) {
      const j = Math.min(pts.length - 1, i + 3), h = Math.max(0, i - 3);
      r.setRotation(Math.atan2(pts[j][1] - pts[h][1], pts[j][0] - pts[h][0]));
    }
  }

  /** Show how: the rider (or a finger) traces every stroke, then the ink is wiped. */
  async demo() {
    const s = this.scene;
    const hand = this.skin.rider ?? s.add.text(0, 0, '👆', { fontSize: '56px' }).setOrigin(0.2, 0);
    for (let k = 0; k < this.strokes.length; k++) {
      const { pts, dist } = this.strokes[k];
      this.startMark(k);
      const len = dist[dist.length - 1];
      const t = { d: 0 };
      await s.tween({
        targets: t, d: len, duration: pts.length === 1 ? 300 : Math.max(500, len * 2.4), ease: 'Sine.InOut',
        onUpdate: () => {
          const i = Math.min(pts.length - 1, dist.findIndex(d => d >= t.d) === -1 ? pts.length - 1 : dist.findIndex(d => d >= t.d));
          this.inkG.fillStyle(0xffffff, 0.9).fillCircle(pts[i][0], pts[i][1], 9);
          if (hand === this.skin.rider) this.ride(k, i); else hand.setPosition(pts[i][0], pts[i][1]);
        },
      });
      await s.wait(150);
    }
    this.inkG.clear();
    if (hand !== this.skin.rider) hand.destroy(); else hand.setVisible(false);
    this.marks.forEach(m => m.destroy());
  }

  /** Let the child trace every stroke. Resolves when the letter is done. */
  play(): Promise<void> {
    const s = this.scene;
    return s.guard(new Promise<void>(resolve => {
      let k = 0, at = -1, star = 0;
      // In dots mode, show this stroke's stars and make the next one pulse.
      const glow = () => {
        const row = this.stars[k];
        if (!row) return;
        row.forEach((st, i) => { if (i >= star) { s.tweens.killTweensOf(st); st.setScale(1).setAlpha(0.45); } });
        if (row[star]) s.tweens.add({ targets: row[star], scale: 1.4, alpha: 1, duration: 420, yoyo: true, repeat: -1 });
      };
      const begin = () => { at = -1; star = 0; this.startMark(k); glow(); };
      const finishStroke = () => {
        this.marks.forEach(m => m.destroy());
        this.skin.onStep?.(k);
        k++;
        if (k >= this.strokes.length) { off(); resolve(); } else begin();
      };
      const move = (p: Phaser.Input.Pointer) => {
        if (!p.isDown || k >= this.strokes.length) return;
        const { pts, dist } = this.strokes[k];
        if (this.skin.mode === 'dots') {
          const row = this.stars[k];
          const next = row[star];
          if (!next || Math.hypot(p.x - next.x, p.y - next.y) > this.tol) { this.off++; return; }
          this.on++;
          const i = next.getData('i') as number;
          this.paint(k, at < 0 ? 0 : at, i);
          at = i;
          s.tweens.killTweensOf(next);
          next.setAlpha(1).setScale(1.3);
          s.tweens.add({ targets: next, scale: 1, duration: 250, ease: 'Back.Out' });
          s.sfx.chime(star % 7);
          this.skin.onStep?.(star);
          if (++star >= row.length) finishStroke(); else glow();
          return;
        }
        // Find the farthest point a little ahead of the ink that the finger is near.
        const start = Math.max(0, at);
        let best = -1;
        for (let i = start; i < pts.length && dist[i] - dist[start] <= LOOKAHEAD; i++) {
          if (Math.hypot(p.x - pts[i][0], p.y - pts[i][1]) <= this.tol) best = i;
        }
        // A stroke has to start at its beginning (the green dot), not partway along.
        if (at < 0 && Math.hypot(p.x - pts[0][0], p.y - pts[0][1]) > this.tol) best = -1;
        if (best < 0) { this.off++; return; }
        this.on++;
        if (best > at) { this.paint(k, at, best); at = best; }
        if (at >= pts.length - 2) { s.sfx.chime(Math.min(7, k + 2)); finishStroke(); }
      };
      const off = () => { s.input.off('pointerdown', move); s.input.off('pointermove', move); };
      s.input.on('pointerdown', move);
      s.input.on('pointermove', move);
      s.signal.addEventListener('abort', off, { once: true });
      begin();
      // Dev hook for automated play-throughs: finish the current stroke.
      if (import.meta.env.DEV) Object.assign(window, { __answer: () => {
        if (k >= this.strokes.length) return;
        if (this.skin.mode === 'dots') { this.stars[k].forEach(st => st.setAlpha(1)); this.paint(k, 0, this.strokes[k].pts.length - 1); }
        else this.paint(k, 0, this.strokes[k].pts.length - 1);
        finishStroke();
      } });
    }));
  }

  /** Every point of the letter, in order (for finishing flourishes). */
  points(): Pt[] { return this.strokes.flatMap(s => s.pts); }

  destroy() {
    [this.g, this.inkG, ...this.marks, ...this.stars.flat()].forEach(o => o?.destroy());
    this.skin.rider?.setVisible(false);
  }
}

/** Single letters that can be traced (digraphs aren't). */
export const traceable = (g: string) => g.length === 1 && !!LETTERS[g];
