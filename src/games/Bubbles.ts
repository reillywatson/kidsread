// Friends — auditory drill, fast and fizzy: bubbles float up carrying letters; pop every
// bubble with the sound you hear (three per round) and leave the others.
import Phaser from 'phaser';
import { BaseGame, Aborted, type GameMeta } from './BaseGame';
import { graphemeDistractors } from '../choices';
import { pickOne, shuffle } from '../learner';
import { LINES } from '../lines';
import { burst, emoji, sprite, tappable, text, wiggle } from '../widgets';

export const meta: GameMeta = {
  id: 'bubbles',
  theme: 'friends',
  skill: 'grapheme',
  title: 'Bubble Pop — pop every bubble with the sound you hear',
  intro: LINES.intro.bubbles,
  icon: 'bubble',
  eligible: () => true,
};

const TARGETS = 3;

export class Bubbles extends BaseGame {
  constructor() { super(meta); }

  protected setup() {
    this.add.image(640, 360, 'bgSea');
    // Fish swimming by in the background.
    ['🐠', '🐟', '🐡', '🐙'].forEach((f, i) => {
      const fish = emoji(this, -100, 160 + i * 130, f, 56).setAlpha(0.8);
      if (i % 2) fish.setScale(-1, 1);
      this.tweens.add({ targets: fish, x: 1400, duration: 14000 + i * 3000, delay: i * 2500, repeat: -1 });
    });
  }

  protected async run() {
    const n = this.rounds(4);
    const targets = this.learner.pick(['g'], n);
    const others = [3, 4, 5][this.tier];
    const speed = [11000, 9000, 7000][this.tier];

    for (let r = 0; r < targets.length && !this.timeUp(); r++) {
      const g = targets[r];
      const ds = graphemeDistractors(g, Math.min(3, others), this.tier, this.lesson);
      const labels = shuffle([...Array(TARGETS).fill(g), ...Array.from({ length: others }, (_, i) => ds[i % ds.length])]);
      const bubbles = labels.map((lab, i) => {
        const x = 140 + ((i + 0.5) * 1000) / labels.length + Math.random() * 40;
        // Start spread over the screen so there's something to pop right away.
        const c = this.add.container(x, 240 + ((i * 197) % 520) + Math.random() * 40);
        c.add([sprite(this, 0, 0, 'bubble', 150), text(this, 0, 0, this.shown(lab), 64, '#0d47a1')]);
        tappable(c, 150, 150);
        c.setData('g', lab);
        const rise = () => this.tweens.add({
          targets: c, y: -120, duration: speed * ((c.y + 120) / 940), ease: 'Linear',
          onComplete: () => { c.y = 820; rise(); },
        });
        rise();
        this.tweens.add({ targets: c, x: x + 30, duration: 1200 + Math.random() * 600, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
        return c;
      });

      let help = this.tier === 0;
      await this.prompt(async () => {
        await this.say(LINES.popBubbles);
        await this.letterSound(g);
        if (help) await this.keyword(g);
      });

      let popped = 0, misses = 0;
      const stopIdle = this.idleNudge([]);
      await this.guard(new Promise<void>(resolve => {
        const pop = (c: Phaser.GameObjects.Container) => {
          if (c.getData('popped')) return;
          if (c.getData('g') !== g) {
            misses++;
            this.sfx.boing();
            wiggle(this, c);
            if (misses === 2) {
              help = true;
              void this.letterSound(g).catch(() => {});
              bubbles.filter(b => b.getData('g') === g && !b.getData('popped'))
                .forEach(b => this.tweens.add({ targets: b, scale: 1.15, duration: 300, yoyo: true, repeat: 3 }));
            }
            return;
          }
          c.setData('popped', true);
          this.tweens.killTweensOf(c);
          this.sfx.pop();
          this.sfx.charge(popped + 1);
          burst(this, c.x, c.y, ['💧', '✨', '🫧'], 8);
          this.tweens.add({ targets: c, scale: 1.4, alpha: 0, duration: 150, onComplete: () => c.setVisible(false) });
          if (++popped === TARGETS) resolve();
        };
        bubbles.forEach(c => c.on('pointerdown', () => pop(c)));
        if (import.meta.env.DEV) Object.assign(window, { __answer: () => { const t = bubbles.find(b => b.getData('g') === g && !b.getData('popped')); if (t) pop(t); } });
        this.signal.addEventListener('abort', () => resolve(), { once: true });
      }));
      stopIdle();
      if (this.signal.aborted) throw new Aborted();

      this.record('g:' + g, misses === 0 ? 'correct' : 'wrong');
      this.score(misses === 0);
      bubbles.forEach(b => this.tweens.add({ targets: b, alpha: 0, duration: 300 }));
      await this.letterSound(g);
      await this.praise(misses === 0);
      bubbles.forEach(b => { this.tweens.killTweensOf(b); b.destroy(); });
      this.progress();
    }
    if (Math.random() < 0.5) await this.say(pickOne(LINES.praise));
  }
}
