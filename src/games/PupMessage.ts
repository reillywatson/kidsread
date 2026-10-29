// Paw Patrol — connected text: read a short decodable sentence on the pup pad and
// pick the matching picture. Sentences grow with the lesson:
//   "It is a cat."  →  "The cat is (not) big."  →  "The cat has a hat."
import Phaser from 'phaser';
import { BaseGame, type GameMeta } from './BaseGame';
import { NOUNS, HEART, WORD_LESSON, picConflict } from '../data/curriculum';
import { shuffle, pickOne } from '../learner';
import { LINES } from '../lines';
import * as audio from '../audio';
import { WordView, burst, picture, sprite } from '../widgets';

export const meta: GameMeta = {
  id: 'pupmessage',
  theme: 'paw',
  skill: 'sentence',
  title: 'Pup Pad — read a sentence, pick the picture',
  intro: LINES.intro.pupmessage,
  icon: 'pup-chase',
  eligible: lesson => lesson >= 9 && nounsAt(lesson).length >= 3,
};

const nounsAt = (lesson: number) => [...NOUNS].filter(n => WORD_LESSON[n] <= lesson);

interface Pic { noun: string; size: 'big' | 'small' | 'normal'; hat: boolean }
interface Sentence { words: string[]; answer: Pic; choices: Pic[] }

function makeSentence(noun: string, lesson: number, n: number, others: string[]): Sentence {
  const other = pickOne(others.filter(o => !picConflict(o, noun)));
  const article = 'aeiou'.includes(noun[0]) ? 'an' : 'a';
  const kinds = ['is'];
  if (lesson >= 17) kinds.push('big', 'notbig');
  if (lesson >= 30) kinds.push('hat');
  const kind = pickOne(kinds);
  const P = (noun: string, size: Pic['size'] = 'normal', hat = false): Pic => ({ noun, size, hat });
  let words: string[], answer: Pic, alts: Pic[];
  switch (kind) {
    case 'big':
      words = ['the', noun, 'is', 'big'];
      answer = P(noun, 'big'); alts = [P(other, 'big'), P(noun, 'small')];
      break;
    case 'notbig':
      words = ['the', noun, 'is', 'not', 'big'];
      answer = P(noun, 'small'); alts = [P(other, 'small'), P(noun, 'big')];
      break;
    case 'hat':
      words = ['the', noun, 'has', 'a', 'hat'];
      answer = P(noun, 'normal', true); alts = [P(other, 'normal', true), P(noun)];
      break;
    default: {
      words = ['it', 'is', article, noun];
      const third = others.filter(o => o !== other && !picConflict(o, noun) && !picConflict(o, other));
      answer = P(noun); alts = [P(other), P(third.length ? pickOne(third) : other)];
    }
  }
  return { words, answer, choices: shuffle([answer, ...alts.slice(0, n - 1)]) };
}

export class PupMessage extends BaseGame {
  private pup!: Phaser.GameObjects.Image;

  constructor() { super(meta); }

  protected setup() {
    this.add.image(640, 360, 'bgBay');
    this.pup = sprite(this, 140, 470, 'pup-chase', 300);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.2).fillRoundedRect(196, 110, 900, 200, 34);
    g.fillStyle(0x1e4fd8).fillRoundedRect(186, 100, 900, 200, 34);
    g.fillStyle(0xffffff).fillRoundedRect(206, 120, 860, 160, 24);
    this.add.circle(1076, 200, 10, 0xffd21f);
  }

  protected async run() {
    const n = this.rounds(4);
    const nouns = this.learner.pick(['w'], n, { filter: w => NOUNS.has(w) });
    const all = nounsAt(this.lesson);
    const nChoices = [2, 3, 3][this.tier];

    for (let r = 0; r < nouns.length && !this.timeUp(); r++) {
      const s = makeSentence(nouns[r], this.lesson, nChoices, all.filter(x => x !== nouns[r]));
      // Lay out the sentence word by word.
      const size = s.words.length > 4 ? 64 : 72;
      const views = s.words.map((w, i) => new WordView(this, 0, 200, w, { size, cap: i === 0, dots: !HEART[w] }));
      const widths = views.map(v => v.width);
      const total = widths.reduce((a, b) => a + b, 0) + (views.length - 1) * 34;
      let x = 636 - total / 2;
      views.forEach((v, i) => { v.x = x + widths[i] / 2; x += widths[i] + 34; });
      const period = this.add.text(x - 30, 200, '.', { fontFamily: 'Andika', fontSize: `${size}px`, color: '#2b2b2b', fontStyle: 'bold' }).setOrigin(0, 0.5);
      // Heart words are learned by heart: tapping one says it.
      views.forEach(v => {
        if (!HEART[v.word]) return;
        v.setInteractive({ useHandCursor: true });
        v.on('pointerdown', () => { void audio.say(v.word); });
      });

      const cards = s.choices.map((p, i) => picture(this, 640 + (i - (s.choices.length - 1) / 2) * 280, 520, p.noun, {
        size: 100, scale: p.size === 'big' ? 1.25 : p.size === 'small' ? 0.5 : 1, hat: p.hat,
      }));

      const readAloud = async () => {
        for (const v of views) { v.setAllColor('#1e88e5'); await this.say(v.word); v.setAllColor('#2b2b2b'); }
      };
      let helped = false;
      await this.prompt(async () => {
        await this.say(r === 0 ? LINES.readMessage : pickOne(LINES.readMessageShort));
      });
      const res = await this.choose(cards, s.choices.indexOf(s.answer), {
        scaffoldAfter: 1,
        onScaffold: () => { helped = true; void readAloud().catch(() => {}); },
      });
      const result = res.firstTry ? 'correct' : helped && res.misses === 1 ? 'help' : 'wrong';
      this.record('w:' + nouns[r], result);
      s.words.filter(w => w !== nouns[r]).forEach(w => this.learner.record((HEART[w] ? 'h:' : 'w:') + w, 'seen'));
      this.score(res.firstTry);

      cards.filter(c => c !== res.obj).forEach(c => this.tweens.add({ targets: c, alpha: 0, duration: 250 }));
      burst(this, res.obj.x, res.obj.y, ['🐾', '⭐', '✨']);
      await readAloud();
      // Pup to the rescue!
      const truck = sprite(this, -200, 650, 'truck', 110);
      this.sfx.siren();
      this.tweens.add({ targets: this.pup, y: this.pup.y - 40, duration: 200, yoyo: true, repeat: 1 });
      await this.tween({ targets: truck, x: 1500, duration: 1400, ease: 'Sine.InOut' });
      truck.destroy();
      if (Math.random() < 0.3) await this.say(LINES.pawRoll);
      await this.praise(res.firstTry);
      [...views, period, ...cards].forEach(o => o.destroy());
      this.progress();
    }
  }
}
