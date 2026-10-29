// Pokémon — word recognition on the run: Pikachu races along three lanes; signs with words
// come toward him. Hear a word, tap a lane to steer Pikachu through the right sign. Miss it
// and the signs loop around for another go (with the right one glowing).
import Phaser from 'phaser';
import { BaseGame, Aborted, type GameMeta } from './BaseGame';
import { readableWords, wordDistractors, wordItem } from '../choices';
import { pickOne, shuffle } from '../learner';
import { LINES } from '../lines';
import * as audio from '../audio';
import { W, WordView, burst, emoji, sprite } from '../widgets';

export const meta: GameMeta = {
  id: 'dash',
  theme: 'pokemon',
  skill: 'word',
  title: 'Pikachu Dash — steer through the sign with the word you hear',
  intro: LINES.intro.dash,
  icon: 'pikachu',
  eligible: lesson => readableWords(lesson).length >= 4,
};

const LANES = [410, 530, 650];
const PIKA_X = 210;
const SCENERY = ['🌳', '🌲', '🌼', '🍄', '🌷', '🪨'];

type Gate = Phaser.GameObjects.Container;

export class Dash extends BaseGame {
  private pika!: Phaser.GameObjects.Image;
  private lane = 1;

  constructor() { super(meta); }

  protected setup() {
    this.add.image(640, 360, 'bgField');
    const g = this.add.graphics();
    LANES.forEach(y => { g.fillStyle(0xc8a06a, 0.5).fillRoundedRect(0, y + 18, W, 34, 17); });
    this.lane = 1;
    this.pika = sprite(this, PIKA_X, LANES[1], 'pikachu', 115).setDepth(20);
    this.tweens.add({ targets: this.pika, angle: { from: -6, to: 6 }, duration: 180, yoyo: true, repeat: -1 });
    // Tap anywhere in a lane to move there.
    LANES.forEach((y, i) => {
      this.add.rectangle(W / 2, y, W, 120, 0xffffff, 0.001).setInteractive().on('pointerdown', () => this.steer(i));
    });
    // Scenery whizzing past, so it feels like running.
    this.time.addEvent({
      delay: 650, loop: true, callback: () => {
        const e = emoji(this, W + 60, LANES[0] - 100 + Math.random() * 30, pickOne(SCENERY), 48).setDepth(5);
        this.tweens.add({ targets: e, x: -60, duration: 2600, onComplete: () => e.destroy() });
      },
    });
  }

  private steer(i: number) {
    if (i === this.lane) return;
    this.lane = i;
    this.sfx.hop();
    this.tweens.add({ targets: this.pika, y: LANES[i], duration: 200, ease: 'Quad.Out' });
  }

  private gate(word: string, y: number): Gate {
    const v = new WordView(this, 0, -8, word, { size: 46, tapSounds: false });
    const w = Math.max(150, v.width + 50);
    const g = this.add.graphics();
    g.fillStyle(0x8d6e3f).fillRect(-w / 2 - 6, -50, 12, 110).fillRect(w / 2 - 6, -50, 12, 110);
    g.fillStyle(0x000000, 0.15).fillRoundedRect(-w / 2 + 4, -58, w, 92, 16);
    g.fillStyle(0xfff8e1).fillRoundedRect(-w / 2, -62, w, 92, 16).lineStyle(5, 0xffc94d).strokeRoundedRect(-w / 2, -62, w, 92, 16);
    return this.add.container(W + 120, y, [g, v]).setDepth(10);
  }

  protected async run() {
    const n = this.rounds(5);
    const words = this.learner.pick(['w', 'h'], n);
    const nGates = [2, 3, 3][this.tier];
    const secs = [7, 6, 4.5][this.tier];

    for (let r = 0; r < words.length && !this.timeUp(); r++) {
      const w = words[r];
      const opts = shuffle([w, ...wordDistractors(w, nGates - 1, this.tier, this.lesson)]);
      const lanes = shuffle([0, 1, 2]).slice(0, opts.length);
      const gates = opts.map((o, i) => this.gate(o, LANES[lanes[i]]));
      const right = lanes[opts.indexOf(w)];
      if (import.meta.env.DEV) Object.assign(window, { __answer: () => this.steer(right) });

      await this.prompt(async () => {
        await this.say(r === 0 ? LINES.runTo : pickOne([LINES.runTo, LINES.find]));
        await this.say(w);
      });

      // Gates come at Pikachu; when they arrive, is he in the right lane?
      let misses = 0;
      for (;;) {
        const dur = secs * 1000 * (misses ? 1.4 : 1);
        await this.tween({ targets: gates, x: PIKA_X + 70, duration: dur, ease: 'Linear' });
        if (this.lane === right) break;
        misses++;
        this.sfx.boing();
        this.cameras.main.shake(150, 0.004);
        this.tweens.add({ targets: this.pika, x: PIKA_X - 30, duration: 120, yoyo: true });
        void audio.say(w);
        // Back around they go, and the right sign glows.
        await this.tween({ targets: gates, x: W - 150, duration: 500, ease: 'Quad.Out' });
        const g = gates[opts.indexOf(w)];
        this.tweens.add({ targets: g, scale: 1.12, duration: 300, yoyo: true, repeat: 2 });
        if (this.signal.aborted) throw new Aborted();
      }
      this.record(wordItem(w), misses === 0 ? 'correct' : 'wrong');
      this.score(misses === 0);

      // Smash through the sign: coins!
      const g = gates[opts.indexOf(w)];
      this.sfx.coin();
      burst(this, g.x, g.y, ['🪙', '⭐', '⚡'], 12);
      gates.filter(o => o !== g).forEach(o => this.tweens.add({ targets: o, x: -200, alpha: 0, duration: 500 }));
      this.tweens.add({ targets: g, scale: 1.6, alpha: 0, angle: 20, duration: 300, onComplete: () => g.destroy() });
      this.tweens.add({ targets: this.pika, y: LANES[this.lane] - 70, duration: 200, yoyo: true, ease: 'Quad.Out' });
      await this.say(w);
      await this.praise(misses === 0);
      gates.forEach(o => o.destroy());
      this.progress();
    }
  }
}
