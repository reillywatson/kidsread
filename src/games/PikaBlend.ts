// Pokémon — decoding. Word mode: read a word (tap letters for their sounds), catch the
// matching picture in a Poké Ball. Letter mode (before enough picture words exist):
// see a letter, catch the picture that starts with its sound.
import Phaser from 'phaser';
import { BaseGame, type GameMeta } from './BaseGame';
import { GRAPHEMES, PIC, segment } from '../data/curriculum';
import { readableWords, wordDistractors, picsStartingWith, picsNotStartingWith, canStartWord } from '../choices';
import { shuffle, pickOne } from '../learner';
import { LINES } from '../lines';
import * as audio from '../audio';
import { WordView, burst, picture, roundButton, sprite, text } from '../widgets';

export const meta: GameMeta = {
  id: 'pikablend',
  theme: 'pokemon',
  skill: 'word',
  title: 'Poké Catch — read a word, pick its picture',
  intro: LINES.intro.pikablend,
  icon: 'pikachu',
  eligible: () => true,
};

const wordMode = (lesson: number) => readableWords(lesson, { pic: true }).length >= 3;

export class PikaBlend extends BaseGame {
  private pika!: Phaser.GameObjects.Image;

  constructor() { super(meta); }

  protected setup() {
    this.add.image(640, 360, 'bgField');
    this.pika = this.tickle(sprite(this, 150, 450, 'pikachu', 280), () => void audio.say(pickOne(LINES.pika), { style: 'pika' }));
    const g = this.add.graphics();
    g.fillStyle(0x8d6e3f).fillRect(630, 290, 20, 60);
    g.fillStyle(0x000000, 0.15).fillRoundedRect(372, 128, 560, 180, 30);
    g.fillStyle(0xffffff).fillRoundedRect(360, 116, 560, 180, 30);
    g.lineStyle(8, 0xffc94d).strokeRoundedRect(360, 116, 560, 180, 30);
  }

  private async celebrate(card: Phaser.GameObjects.Container) {
    // Shrink the picture into a Poké Ball and wobble it shut.
    const ball = sprite(this, card.x, card.y, 'pokeball', 10);
    this.sfx.zap();
    await this.tween({ targets: card, scale: 0.1, alpha: 0, duration: 300 });
    await this.tween({ targets: ball, scale: 110 / ball.height, duration: 250, ease: 'Back.Out' });
    this.sfx.wobble();
    await this.tween({ targets: ball, angle: { from: -20, to: 20 }, duration: 220, yoyo: true, repeat: 2 });
    ball.angle = 0;
    burst(this, ball.x, ball.y);
    this.pika.setTexture('pikachu');
    this.tweens.add({ targets: this.pika, y: this.pika.y - 60, duration: 220, yoyo: true, ease: 'Quad.Out' });
    void audio.say(pickOne(LINES.pika), { style: 'pika' });
    this.time.delayedCall(900, () => ball.destroy());
  }

  protected async run() {
    if (wordMode(this.lesson)) await this.runWords();
    else await this.runLetters();
  }

  private async runWords() {
    const n = this.rounds(5);
    const words = this.learner.pick(['w'], n, { filter: w => !!PIC[w] });
    const nChoices = [2, 3, 3][this.tier];

    for (let r = 0; r < words.length && !this.timeUp(); r++) {
      const w = words[r];
      const view = new WordView(this, 640, 196, w, { size: 100 });
      let helped = false;
      const blendBtn = roundButton(this, 640, 330, 34, 0xffc94d, '➡️', () => {
        helped = true;
        void this.blend(view, w).catch(() => {});
      });
      const opts = shuffle([w, ...wordDistractors(w, nChoices - 1, this.tier, this.lesson, { pic: true })]);
      const cards = opts.map((x, i) => picture(this, 640 + (i - (opts.length - 1) / 2) * 260, 540, x, { size: 100 }));
      cards.forEach((c, i) => this.tweens.add({ targets: c, y: { from: 760, to: 540 }, duration: 400, delay: i * 80, ease: 'Back.Out' }));

      await this.prompt(async () => {
        if (r === 0) await this.say(LINES.readWordTapLetters);
        else await this.say(pickOne(LINES.readIt));
      });
      const res = await this.choose(cards, opts.indexOf(w), {
        onWrong: () => { this.pika.setTexture('pikachuSurprised'); },
        onScaffold: () => { helped = true; void this.blend(view, w).catch(() => {}); },
        scaffoldAfter: 1,
      });
      this.record('w:' + w, res.firstTry && !helped ? 'correct' : res.firstTry ? 'help' : 'wrong');
      this.score(res.firstTry && !helped);
      cards.filter(c => c !== res.obj).forEach(c => this.tweens.add({ targets: c, alpha: 0, duration: 250 }));
      await this.celebrate(res.obj as Phaser.GameObjects.Container);
      view.setAllColor('#e53935');
      await this.say(w);
      await this.praise(res.firstTry);
      [view, blendBtn, ...cards].forEach(o => o.destroy());
      this.progress();
    }
  }

  /** Sound-by-sound model, then the whole word. */
  private async blend(view: WordView, w: string) {
    const toks = segment(w);
    for (let i = 0; i < toks.length; i++) {
      if (!toks[i].g) continue;
      view.flash(i, true);
      await this.letterSound(toks[i].g!);
      view.parts[i].text.setColor('#2b2b2b');
    }
    view.setAllColor('#1e88e5');
    await this.say(w);
    view.setAllColor('#2b2b2b');
  }

  private async runLetters() {
    const n = this.rounds(5);
    const gs = this.learner.pick(['g'], n, { filter: g => canStartWord(g) && picsStartingWith(g).length > 0 });
    const nChoices = [2, 3, 3][this.tier];

    for (let r = 0; r < gs.length && !this.timeUp(); r++) {
      const g = gs[r];
      const answer = pickOne(picsStartingWith(g));
      const opts = shuffle([answer, ...picsNotStartingWith(g, nChoices - 1, this.tier)]);
      const letter = text(this, 640, 200, GRAPHEMES[g].label, 130);
      let helped = this.learner.isNew('g:' + g);
      letter.setInteractive({ useHandCursor: true });
      letter.on('pointerdown', () => { helped = true; void audio.sound(g); });
      const cards = opts.map((x, i) => picture(this, 640 + (i - (opts.length - 1) / 2) * 260, 540, x, { size: 100 }));

      await this.prompt(async () => {
        await this.say(r === 0 ? LINES.startsWithSound : pickOne([LINES.startsWithSound, LINES.whichOne]));
        // Brand-new letters are modeled so the child can learn them.
        if (helped) await this.letterSound(g);
        if (this.tier === 0) for (const o of opts) await this.say(o);
      });
      const res = await this.choose(cards, opts.indexOf(answer), {
        onScaffold: () => { helped = true; void this.letterSound(g).catch(() => {}); },
      });
      this.record('g:' + g, res.firstTry && !helped ? 'correct' : res.firstTry ? 'help' : 'wrong');
      this.score(res.firstTry);
      cards.filter(c => c !== res.obj).forEach(c => this.tweens.add({ targets: c, alpha: 0, duration: 250 }));
      await this.celebrate(res.obj as Phaser.GameObjects.Container);
      await this.letterSound(g);
      await this.say(answer);
      await this.praise(res.firstTry);
      [letter, ...cards].forEach(o => o.destroy());
      this.progress();
    }
  }
}
