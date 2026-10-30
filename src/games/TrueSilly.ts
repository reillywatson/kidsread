// Pokémon — sentence comprehension: read a sentence and say whether the picture matches.
// The silly pictures are near misses ("The cat is on the bed" with the bed on the cat), so
// every word has to be read. A silly picture then turns into the right one.
import Phaser from 'phaser';
import { BaseGame, type GameMeta } from './BaseGame';
import { NOUNS } from '../data/curriculum';
import { pickOne } from '../learner';
import { LINES } from '../lines';
import * as audio from '../audio';
import { kindsAt, makeSentence, nounsAt } from '../sentences';
import { drawPic, layoutSentence } from '../sentenceView';
import { burst, roundButton, sprite } from '../widgets';

export const meta: GameMeta = {
  id: 'truesilly',
  theme: 'pokemon',
  skill: 'sentence',
  title: 'True or Silly — does the picture match the sentence?',
  intro: LINES.intro.truesilly,
  icon: 'pikachuSurprised',
  eligible: lesson => lesson >= 9 && nounsAt(lesson).length >= 3,
};

export class TrueSilly extends BaseGame {
  private pika!: Phaser.GameObjects.Image;

  constructor() { super(meta); }

  protected setup() {
    this.add.image(640, 360, 'bgField');
    this.pika = this.tickle(sprite(this, 150, 470, 'pikachu', 280), () => void audio.say(pickOne(LINES.pika), { style: 'pika' }));
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.15).fillRoundedRect(202, 108, 900, 150, 30);
    g.fillStyle(0xffffff).fillRoundedRect(190, 96, 900, 150, 30);
    g.lineStyle(8, 0xffc94d).strokeRoundedRect(190, 96, 900, 150, 30);
  }

  protected async run() {
    const n = this.rounds(5);
    const nouns = this.learner.pick(['w'], n, { filter: w => NOUNS.has(w) });
    // Runs of the same answer: negative = true in a row, positive = silly in a row.
    let silly = 0;

    for (let r = 0; r < nouns.length && !this.timeUp(); r++) {
      const s = makeSentence(nouns[r], this.lesson, kindsAt(this.lesson, this.tier));
      // Never three of one kind in a row.
      const truth = !s.alts.length || (silly >= 2 ? true : silly <= -2 ? false : Math.random() < 0.5);
      silly = truth ? Math.min(0, silly) - 1 : Math.max(0, silly) + 1;
      const shown = truth ? s.answer : (Math.random() < 0.65 ? s.alts[0] : pickOne(s.alts));
      const { views, items } = layoutSentence(this, s.words, 640, 171, { size: 64, maxWidth: 840 });
      let card = drawPic(this, 640, 390, shown, 120);
      card.setScale(0);
      this.tweens.add({ targets: card, scale: 1, duration: 350, ease: 'Back.Out' });
      const yes = roundButton(this, 500, 615, 64, 0x43c35e, '👍', () => {});
      const no = roundButton(this, 780, 615, 64, 0xef5350, '👎', () => {});

      let helped = false;
      await this.prompt(async () => { await this.say(r === 0 ? LINES.doesItMatch[0] : pickOne(LINES.doesItMatch)); });
      const res = await this.choose([yes, no], truth ? 0 : 1, {
        scaffoldAfter: 1,
        onScaffold: () => { helped = true; void this.readAloud(views).catch(() => {}); },
      });
      this.record('w:' + s.noun, res.firstTry && !helped ? 'correct' : 'wrong');
      this.sawWords(s.words, s.noun);
      this.score(res.firstTry);
      [yes, no].forEach(b => b.disableInteractive());

      if (truth) {
        burst(this, card.x, card.y, ['⭐', '✨', '⚡']);
        this.tweens.add({ targets: this.pika, y: this.pika.y - 60, duration: 220, yoyo: true, ease: 'Quad.Out' });
        await this.say(LINES.itMatches);
      } else {
        // Silly! Then show what the sentence really says.
        this.pika.setTexture('pikachuSurprised');
        await this.tween({ targets: card, angle: { from: -8, to: 8 }, duration: 110, yoyo: true, repeat: 2 });
        card.angle = 0;
        await this.say(pickOne(LINES.silly));
        await this.tween({ targets: card, scale: 0, duration: 200 });
        card.destroy();
        card = drawPic(this, 640, 390, s.answer, 120).setScale(0);
        this.sfx.sparkle();
        await this.tween({ targets: card, scale: 1, duration: 350, ease: 'Back.Out' });
        this.pika.setTexture('pikachu');
      }
      await this.readAloud(views);
      await this.praise(res.firstTry);
      [...items, card, yes, no].forEach(o => o.destroy());
      this.progress();
    }
  }
}
