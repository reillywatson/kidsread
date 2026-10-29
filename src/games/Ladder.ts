// Paw Patrol — goal game: rescue the kitten stuck up the tree. Chase says a word sound by
// sound ("c-a-t"); tap the picture it makes (oral blending, no reading). Every right answer
// adds a rung to the ladder and Chase climbs, until he can reach the kitten.
import Phaser from 'phaser';
import { BaseGame, type GameMeta } from './BaseGame';
import { PIC, WORD_LESSON, initialSound, picConflict, segment } from '../data/curriculum';
import { countable, soundCount } from '../choices';
import { pickOne, shuffle } from '../learner';
import { LINES } from '../lines';
import * as audio from '../audio';
import { burst, emoji, picture, sprite } from '../widgets';

export const meta: GameMeta = {
  id: 'ladder',
  theme: 'paw',
  skill: 'phonemic',
  title: 'Kitten Rescue — blend the sounds to build a ladder',
  intro: LINES.intro.ladder,
  icon: 'pup-chase',
  eligible: () => true,
  goal: true,
};

const TREE_X = 1050;
const LADDER_X = 840;
const GROUND = 660;
const TOP = 190;
const RAIL = 48;

export class Ladder extends BaseGame {
  private chase!: Phaser.GameObjects.Image;
  private kitten!: Phaser.GameObjects.Text;
  private ladder!: Phaser.GameObjects.Graphics;

  constructor() { super(meta); }

  protected setup() {
    this.add.image(640, 360, 'bgBay');
    const t = this.add.graphics();
    t.fillStyle(0x6d4c41).fillRect(TREE_X - 40, 200, 80, GROUND - 190);
    t.fillStyle(0x5d4037).fillRect(TREE_X - 40, 200, 22, GROUND - 190);
    t.fillStyle(0x6d4c41).fillRect(TREE_X - 120, 215, 100, 22); // the branch the kitten is on
    for (const [dx, dy, r] of [[0, 120, 150], [-120, 170, 100], [120, 170, 110], [-60, 60, 100], [70, 70, 100]]) {
      t.fillStyle(0x2e7d32).fillCircle(TREE_X + dx, dy + 8, r);
      t.fillStyle(0x43a047).fillCircle(TREE_X + dx - 6, dy, r * 0.92);
    }
    this.kitten = emoji(this, TREE_X - 95, 190, '🐱', 64);
    this.tweens.add({ targets: this.kitten, angle: { from: -8, to: 8 }, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.ladder = this.add.graphics();
    this.chase = this.tickle(sprite(this, LADDER_X, GROUND - 85, 'pup-chase', 170), () => void audio.say(LINES.ruff, { style: 'pup' }));
  }

  private drawLadder(top: number, rungs: number, step: number) {
    const g = this.ladder.clear();
    if (rungs === 0) return;
    g.lineStyle(12, 0xb0742f);
    g.lineBetween(LADDER_X - RAIL, GROUND, LADDER_X - RAIL, top).lineBetween(LADDER_X + RAIL, GROUND, LADDER_X + RAIL, top);
    g.lineStyle(10, 0xd99a4e);
    for (let i = 1; i <= rungs; i++) g.lineBetween(LADDER_X - RAIL, GROUND - i * step + step / 2, LADDER_X + RAIL, GROUND - i * step + step / 2);
  }

  protected async run() {
    const n = this.rounds(5);
    const [lo, hi] = [[2, 3], [3, 4], [3, 5]][this.tier];
    // Listening only, so any picture word works — a little ahead of the lesson is fine.
    const pool = Object.keys(PIC).filter(w =>
      countable(w) && WORD_LESSON[w] <= this.lesson + 20 && soundCount(w) >= lo && soundCount(w) <= hi);
    const words = shuffle([...pool]).slice(0, n);
    const nChoices = [2, 3, 3][this.tier];
    const step = (GROUND - TOP) / Math.max(1, words.length);
    const meow = () => { if (!audio.isSpeaking()) void audio.say(LINES.meow, { style: 'pika' }); };
    this.kitten.setInteractive({ useHandCursor: true }).on('pointerdown', meow);

    for (let r = 0; r < words.length && !this.timeUp(); r++) {
      const w = words[r];
      // At the top tier the other pictures start with the same sound, so the whole word matters.
      const others = pool.filter(o => o !== w && !picConflict(o, w));
      const same = others.filter(o => initialSound(o) === initialSound(w));
      const ds = shuffle(this.tier === 2 && same.length ? [...same, ...others] : others);
      const opts: string[] = [w];
      for (const d of ds) if (opts.length < nChoices && opts.every(o => !picConflict(o, d))) opts.push(d);
      shuffle(opts);
      const cards = opts.map((o, i) => {
        const c = picture(this, 380 + (i - (opts.length - 1) / 2) * 230, 560, o, { size: 90 });
        this.tweens.add({ targets: c, y: { from: 800, to: 560 }, duration: 350, delay: i * 70, ease: 'Back.Out' });
        return c;
      });

      const sounds = async () => {
        for (const t of segment(w)) if (t.g) { await this.letterSound(t.g); await this.wait(250); }
      };
      await this.prompt(async () => {
        if (r === 0) await this.say(LINES.listenSounds);
        await sounds();
        await this.say(LINES.whatIsIt);
      });
      const res = await this.choose(cards, opts.indexOf(w), {
        scaffoldAfter: 1,
        onScaffold: () => { void sounds().then(() => this.say(w)).catch(() => {}); },
      });
      this.learner.pushRecent('phonemic', res.firstTry);
      this.score(res.firstTry);

      // A new rung, and Chase climbs up to it.
      cards.filter(c => c !== res.obj).forEach(c => this.tweens.add({ targets: c, alpha: 0, duration: 200 }));
      burst(this, res.obj.x, res.obj.y, ['🪜', '⭐', '✨'], 8);
      this.sfx.hammer();
      this.time.delayedCall(150, () => this.sfx.hammer());
      this.drawLadder(GROUND - (r + 1) * step, r + 1, step);
      this.sfx.hop();
      await this.tween({ targets: this.chase, y: GROUND - (r + 1) * step - 60, duration: 450, ease: 'Sine.InOut' });
      await this.say(w);
      await this.praise(res.firstTry);
      cards.forEach(c => c.destroy());
      if (r === words.length - 2) meow();
    }

    // Finish the ladder (in case time ran out), climb to the top, and save the kitten.
    this.drawLadder(TOP, words.length, step);
    await this.tween({ targets: this.chase, y: TOP + 40, duration: 500, ease: 'Sine.InOut' });
    this.tweens.killTweensOf(this.kitten);
    this.kitten.angle = 0;
    await this.tween({ targets: this.kitten, x: this.chase.x + 10, y: this.chase.y - 40, duration: 500, ease: 'Quad.Out' });
    meow();
    this.sfx.fanfare();
    burst(this, this.chase.x, this.chase.y - 40, ['💖', '💛', '⭐'], 18);
    // Down they come together.
    await Promise.all([
      this.tween({ targets: this.chase, y: GROUND - 85, duration: 900, ease: 'Sine.InOut' }),
      this.tween({ targets: this.kitten, y: GROUND - 125, duration: 900, ease: 'Sine.InOut' }),
    ]);
    this.tweens.add({ targets: [this.chase, this.kitten], y: '-=40', duration: 200, yoyo: true, repeat: 1, ease: 'Quad.Out' });
    await this.say(LINES.savedKitten);
    if (Math.random() < 0.5) await this.say(pickOne(LINES.praise));
  }
}
