// Friends — syllables (phonological awareness, no reading): hear a word, tap the drum once for
// each part (ba-na-na = 3 beats). Wrong count? The monster drums it while the word is said in
// parts, and you try again, tapping along.
import Phaser from 'phaser';
import { BaseGame, Aborted, type GameMeta } from './BaseGame';
import { BANK } from '../data/curriculum';
import { pickOne, shuffle } from '../learner';
import { LINES } from '../lines';
import { burst, emoji, picture, sprite, tappable } from '../widgets';

export const meta: GameMeta = {
  id: 'drum',
  theme: 'friends',
  skill: 'syllable',
  title: 'Drum Beats — tap once for each syllable',
  intro: LINES.intro.drum,
  icon: 'monsterHappy',
  eligible: () => true,
};

const ONE = ['cat', 'dog', 'sun', 'fish', 'bee', 'frog', 'car', 'hat', 'cake', 'star', 'ball', 'duck', 'boat', 'moon', 'horse', 'shoe'];
const parts = (w: string) => (LINES.syllables[w] ? LINES.syllables[w].split('...').length : 1);
const DRUM = { x: 720, y: 470 };
const MAX_BEATS = 5;
/** Quiet time after the last tap before the beats are counted. */
const SETTLE = 1500;

export class Drum extends BaseGame {
  private monster!: Phaser.GameObjects.Image;
  private drum!: Phaser.GameObjects.Container;
  private beats: Phaser.GameObjects.Arc[] = [];

  constructor() { super(meta); }

  protected setup() {
    this.add.image(640, 360, 'bgHome');
    this.monster = this.tickle(sprite(this, 1030, 430, 'monsterHappy', 300));
    this.drum = this.add.container(DRUM.x, DRUM.y, [emoji(this, 0, 0, '🥁', 200)]);
    tappable(this.drum, 230, 200);
    // The drum always plays; only beats after the word is said are counted (see listen()).
    this.drum.on('pointerdown', () => this.beat());
    this.beats = [];
  }

  private beat() {
    this.sfx.drum();
    this.tweens.add({ targets: this.drum, scaleY: { from: 0.88, to: 1 }, scaleX: { from: 1.08, to: 1 }, duration: 160, ease: 'Back.Out' });
    this.tweens.add({ targets: this.monster, angle: { from: -6, to: 6 }, duration: 90, yoyo: true, onComplete: () => { this.monster.angle = 0; } });
  }

  private showBeats(n: number) {
    this.beats.forEach((b, i) => b.setFillStyle(i < n ? 0xffd21f : 0xffffff, i < n ? 1 : 0.6));
  }

  /** The monster drums the word while it's said in parts. */
  private async model(w: string) {
    this.showBeats(0);
    const k = parts(w);
    const speech = this.say(LINES.syllables[w] ?? w);
    for (let i = 0; i < k; i++) {
      this.beat();
      this.showBeats(i + 1);
      await this.wait(k === 1 ? 0 : 520);
    }
    await speech;
  }

  /** Taps until the child stops (or hits the most beats any word needs). */
  private listen(): Promise<number> {
    let taps = 0;
    this.showBeats(0);
    return this.guard(new Promise<number>(resolve => {
      let timer: Phaser.Time.TimerEvent | null = null;
      const done = () => { this.drum.off('pointerdown', tap); resolve(taps); };
      const tap = () => {
        taps++;
        this.showBeats(taps);
        timer?.remove();
        if (taps >= MAX_BEATS) done();
        else timer = this.time.delayedCall(SETTLE, done);
      };
      this.drum.on('pointerdown', tap);
      this.signal.addEventListener('abort', () => { timer?.remove(); this.drum.off('pointerdown', tap); }, { once: true });
    }));
  }

  protected async run() {
    const n = this.rounds(5);
    const maxParts = [2, 3, 4][this.tier];
    const many = Object.keys(LINES.syllables).filter(w => BANK[w] && parts(w) <= maxParts);
    // A mix of lengths: some one-beat words, the rest longer.
    const words = shuffle([...shuffle([...ONE]).slice(0, 1 + Math.floor(n / 4)), ...shuffle(many)]).slice(0, n);

    for (let r = 0; r < words.length && !this.timeUp(); r++) {
      const w = words[r];
      const k = parts(w);
      const card = picture(this, 400, 250, w, { size: 120 }).setScale(0);
      this.tweens.add({ targets: card, scale: 1, duration: 300, ease: 'Back.Out' });
      this.beats = Array.from({ length: MAX_BEATS }, (_, i) =>
        this.add.circle(400 + (i - (MAX_BEATS - 1) / 2) * 56, 480, 20, 0xffffff, 0.6).setStrokeStyle(4, 0xb388ff));

      await this.prompt(async () => {
        await this.say(w);
        if (r === 0) await this.say(LINES.tapDrum);
      });

      let tries = 0, got = 0;
      if (import.meta.env.DEV) Object.assign(window, { __answer: () => { for (let i = 0; i < k; i++) this.drum.emit('pointerdown'); } });
      for (;;) {
        got = await this.listen();
        if (got === k || tries >= 2) break;
        tries++;
        // Show how: the word in parts, a beat for each. Then try again.
        this.sfx.boing();
        await this.say(LINES.listenDrum);
        await this.model(w);
        await this.say(LINES.tryAgain);
      }
      if (this.signal.aborted) throw new Aborted();
      const ok = tries === 0;
      this.learner.pushRecent('syllable', ok);
      this.score(ok);
      if (got !== k) await this.model(w);

      // Monster dance.
      burst(this, DRUM.x, DRUM.y - 60, ['🎵', '🎶', '⭐'], 12);
      this.tweens.add({ targets: this.monster, y: this.monster.y - 50, duration: 200, yoyo: true, repeat: 2, ease: 'Quad.Out' });
      await this.say(LINES.syllables[w] ?? w);
      await this.praise(ok);
      [card, ...this.beats].forEach(o => o.destroy());
      this.progress();
    }
    if (Math.random() < 0.5) await this.say(pickOne(LINES.praise));
  }
}
