// Paw Patrol — visual search: "I spy something that starts with /b/." A dozen pictures are
// scattered over the bay; find every one that starts with the sound (2–3 per round). Wrong
// taps just say the picture's name, which is its own hint.
import Phaser from 'phaser';
import { BaseGame, Aborted, type GameMeta } from './BaseGame';
import { BANK, GRAPHEMES } from '../data/curriculum';
import { canStartWord, picsNotStartingWith, picsStartingWith } from '../choices';
import { pickOne, shuffle } from '../learner';
import { LINES } from '../lines';
import * as audio from '../audio';
import { burst, emoji, sprite, tappable, text, wiggle } from '../widgets';

export const meta: GameMeta = {
  id: 'ispy',
  theme: 'paw',
  skill: 'grapheme',
  title: 'I Spy — find everything that starts with a sound',
  intro: LINES.intro.ispy,
  icon: 'pawBadge',
  eligible: () => true,
};

const AREA = { x0: 290, x1: 1220, y0: 130, y1: 640, cols: 5, rows: 3 };
const ITEMS = 12;

export class ISpy extends BaseGame {
  private chase!: Phaser.GameObjects.Image;
  private lens!: Phaser.GameObjects.Text;
  private badge!: Phaser.GameObjects.Text;

  constructor() { super(meta); }

  protected setup() {
    this.add.image(640, 360, 'bgBay');
    this.chase = this.tickle(sprite(this, 140, 540, 'pup-chase', 240), () => void audio.say(LINES.ruff, { style: 'pup' }));
    const b = this.add.container(140, 260);
    b.add([this.add.circle(0, 0, 62, 0xffffff).setStrokeStyle(8, 0x1e4fd8), emoji(this, 44, -44, '🔍', 40)]);
    this.badge = text(this, 0, 0, '', 76, '#1e4fd8');
    b.add(this.badge);
    this.lens = emoji(this, 140, 420, '🔍', 64).setDepth(60);
  }

  /** Scatter pictures over a jittered grid so nothing overlaps. */
  private scatter(words: string[]) {
    const cw = (AREA.x1 - AREA.x0) / AREA.cols, ch = (AREA.y1 - AREA.y0) / AREA.rows;
    const cells = shuffle(Array.from({ length: AREA.cols * AREA.rows }, (_, i) => i)).slice(0, words.length);
    return words.map((w, i) => {
      const col = cells[i] % AREA.cols, row = Math.floor(cells[i] / AREA.cols);
      const x = AREA.x0 + (col + 0.5) * cw + (Math.random() - 0.5) * 40, y = AREA.y0 + (row + 0.5) * ch + (Math.random() - 0.5) * 30;
      const c = this.add.container(x, y, [this.add.circle(0, 0, 54, 0xffffff, 0.6), emoji(this, 0, 0, BANK[w], 72)]);
      c.setAngle((Math.random() - 0.5) * 24).setData('word', w).setScale(0);
      this.tweens.add({ targets: c, scale: 1, duration: 300, delay: i * 40, ease: 'Back.Out' });
      return tappable(c, 110, 110);
    });
  }

  protected async run() {
    const n = this.rounds(3);
    const gs = this.learner.pick(['g'], n, { filter: g => canStartWord(g) && picsStartingWith(g).length >= 3 });
    const nTargets = [2, 3, 3][this.tier];

    for (let r = 0; r < gs.length && !this.timeUp(); r++) {
      const g = gs[r];
      this.badge.setText(GRAPHEMES[g].label);
      // Targets with distinct pictures, then others that don't share any of their pictures.
      const targets: string[] = [];
      for (const w of shuffle(picsStartingWith(g))) if (targets.length < nTargets && targets.every(t => BANK[t] !== BANK[w])) targets.push(w);
      const others = picsNotStartingWith(g, ITEMS * 2, this.tier).filter(w => targets.every(t => BANK[t] !== BANK[w])).slice(0, ITEMS - targets.length);
      const items = this.scatter(shuffle([...targets, ...others]));
      const slots = targets.map((_, i) => emoji(this, 140 + (i - (targets.length - 1) / 2) * 48, 355, '🐾', 38).setAlpha(0.25));

      let help = this.tier === 0;
      await this.prompt(async () => {
        await this.say(LINES.iSpy);
        await this.letterSound(g);
        if (help) await this.keyword(g);
      });

      let found = 0, misses = 0;
      const stopIdle = this.idleNudge([]);
      await this.guard(new Promise<void>(resolve => {
        items.forEach(c => c.on('pointerdown', () => {
          const w = c.getData('word') as string;
          if (c.getData('found')) return;
          this.tweens.add({ targets: this.lens, x: c.x + 30, y: c.y + 30, duration: 200 });
          if (!targets.includes(w)) {
            misses++;
            this.sfx.boing();
            wiggle(this, c);
            void audio.say(w);
            if (misses === 2) {
              help = true;
              items.filter(o => targets.includes(o.getData('word')) && !o.getData('found'))
                .forEach(o => this.tweens.add({ targets: o, scale: 1.15, duration: 300, yoyo: true, repeat: 3 }));
            }
            return;
          }
          c.setData('found', true);
          this.sfx.chime(found + 1);
          const ring = this.add.circle(0, 0, 58).setStrokeStyle(8, 0xffd21f);
          c.add(ring);
          this.tweens.add({ targets: c, scale: 1.2, duration: 150, yoyo: true });
          burst(this, c.x, c.y, ['⭐', '🐾', '✨'], 8);
          slots[found].setAlpha(1);
          this.tweens.add({ targets: slots[found], scale: { from: 1.8, to: 1 }, duration: 300, ease: 'Back.Out' });
          void audio.say(w);
          if (++found === targets.length) resolve();
        }));
        if (import.meta.env.DEV) Object.assign(window, { __answer: () => items.find(o => targets.includes(o.getData('word')) && !o.getData('found'))?.emit('pointerdown') });
        this.signal.addEventListener('abort', () => resolve(), { once: true });
      }));
      stopIdle();
      if (this.signal.aborted) throw new Aborted();

      this.record('g:' + g, misses === 0 ? 'correct' : 'wrong');
      this.score(misses === 0);
      await this.wait(600);
      this.sfx.bark();
      this.tweens.add({ targets: this.chase, y: this.chase.y - 50, duration: 200, yoyo: true, repeat: 1, ease: 'Quad.Out' });
      await this.say(pickOne([LINES.foundAll2, ...LINES.praise]));
      await this.letterSound(g);
      await this.praise(misses === 0);
      items.forEach((c, i) => this.tweens.add({ targets: c, scale: 0, duration: 200, delay: i * 20, onComplete: () => c.destroy() }));
      slots.forEach(s => s.destroy());
      await this.wait(300);
      this.progress();
    }
  }
}
