// Plants vs. Zombies — cloze reading: a zombie ate one word of the sentence. Read the rest
// (with the picture as a clue) and pick the word that fills the gap. Usually it's the noun;
// in "on"/"in" sentences it's sometimes the little word that changes the whole meaning.
// Every zombie beaten earns a new plant for the lawn, and every peashooter joins the volley.
import Phaser from 'phaser';
import { BaseGame, type GameMeta } from './BaseGame';
import { NOUNS, picConflict } from '../data/curriculum';
import { wordDistractors } from '../choices';
import { pickOne, shuffle } from '../learner';
import { LINES } from '../lines';
import * as audio from '../audio';
import { kindsAt, makeSentence, nounsAt } from '../sentences';
import { drawPic, layoutSentence } from '../sentenceView';
import { W, WordView, burst, sprite, tappable } from '../widgets';

export const meta: GameMeta = {
  id: 'missingword',
  theme: 'pvz',
  skill: 'sentence',
  title: 'Missing Word — pick the word that completes the sentence',
  intro: LINES.intro.missingword,
  icon: 'zombie',
  eligible: lesson => lesson >= 9 && nounsAt(lesson).length >= 4,
};

const ZOMBIE = { x: 1140, y: 470 };
const CARD_Y = 610;
/** Plants earned along the way, in the order they're planted (left of the sentence and cards). */
const LAWN: { key: string; x: number; y: number }[] = [
  { key: 'sunflower', x: 235, y: 618 },
  { key: 'peashooter', x: 225, y: 330 },
  { key: 'wallnut', x: 72, y: 628 },
  { key: 'peashooter', x: 70, y: 310 },
];

export class MissingWord extends BaseGame {
  private shooter!: Phaser.GameObjects.Image;
  private zombie!: Phaser.GameObjects.Image;
  private plants: Phaser.GameObjects.Image[] = [];

  constructor() { super(meta); }

  protected setup() {
    this.add.image(640, 360, 'bgGarden');
    this.shooter = this.tickle(sprite(this, 120, 470, 'peashooter', 170));
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.15).fillRoundedRect(172, 108, 940, 150, 26);
    g.fillStyle(0xfff8e1).fillRoundedRect(160, 96, 940, 150, 26);
    g.lineStyle(7, 0x8d6e3f).strokeRoundedRect(160, 96, 940, 150, 26);
  }

  /** A zombie shuffles in, ready to munch. */
  private async zombieIn() {
    this.zombie = sprite(this, W + 150, ZOMBIE.y, Math.random() < 0.35 ? 'zombieCone' : 'zombie', 260);
    this.tweens.add({ targets: this.zombie, angle: { from: -4, to: 4 }, duration: 500, yoyo: true, repeat: -1 });
    await this.tween({ targets: this.zombie, x: ZOMBIE.x, duration: 900, ease: 'Sine.Out' });
  }

  private wordCard(word: string) {
    const v = new WordView(this, 0, 0, word, { size: 60, tapSounds: false });
    const w = Math.max(150, v.width + 50), h = 110;
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.15).fillRoundedRect(-w / 2 + 3, -h / 2 + 7, w, h, 20);
    g.fillStyle(0xffffff).fillRoundedRect(-w / 2, -h / 2, w, h, 20);
    g.lineStyle(5, 0x7cc242).strokeRoundedRect(-w / 2, -h / 2, w, h, 20);
    const c = this.add.container(0, 0, [g, v]);
    c.setData('word', word);
    return tappable(c, w, h);
  }

  /** All the peashooters fire; the sunflowers bob along. */
  private async volley() {
    const shooters = [this.shooter, ...this.plants.filter(p => p.texture.key.startsWith('peashooter'))];
    const shots = shooters.map((sh, i) => {
      const pea = sprite(this, sh.x + sh.displayWidth * 0.4, sh.y - sh.displayHeight * 0.18, 'pea', 34);
      this.tweens.add({ targets: sh, x: sh.x - 10, duration: 80, yoyo: true, delay: i * 120 });
      return this.tween({ targets: pea, x: this.zombie.x - 30, y: this.zombie.y - 60 + i * 12, duration: 450, delay: i * 120, ease: 'Linear',
        onStart: () => this.sfx.pew() }).then(() => { pea.destroy(); this.sfx.splat(); });
    });
    this.plants.filter(p => p.texture.key.startsWith('sunflower'))
      .forEach(p => this.tweens.add({ targets: p, angle: { from: -10, to: 10 }, duration: 160, yoyo: true, repeat: 2 }));
    await Promise.all(shots);
  }

  /** A new plant pops up on the lawn. */
  private async plantOne() {
    const spot = LAWN[this.plants.length];
    if (!spot) return;
    const p = this.tickle(sprite(this, spot.x, spot.y, spot.key, 150));
    const full = p.scale;
    p.setScale(0);
    this.plants.push(p);
    this.sfx.grow();
    await this.tween({ targets: p, scale: full, duration: 450, ease: 'Back.Out' });
    burst(this, spot.x, spot.y - 40, ['🌱', '✨'], 8);
  }

  protected async run() {
    const n = this.rounds(5);
    const nouns = this.learner.pick(['w'], n, { filter: w => NOUNS.has(w) });
    const nChoices = [2, 3, 3][this.tier];

    for (let r = 0; r < nouns.length && !this.timeUp(); r++) {
      const s = makeSentence(nouns[r], this.lesson, kindsAt(this.lesson, this.tier));
      // Which word did the zombie eat?
      const prep = (s.kind === 'on' || s.kind === 'in') && Math.random() < 0.4;
      const blank = prep ? s.words.indexOf(s.kind) : s.words.indexOf(s.noun);
      const answer = s.words[blank];
      let options: string[];
      if (prep) options = ['on', 'in'];
      else {
        const ok = (w: string) => !s.words.includes(w) && !picConflict(w, answer);
        const near = wordDistractors(answer, nChoices + 2, this.tier, this.lesson, { pic: true }).filter(ok);
        const more = shuffle(nounsAt(this.lesson).filter(w => ok(w) && !near.includes(w)));
        options = [answer, ...[...near, ...more].slice(0, nChoices - 1)];
      }
      options = shuffle(options);

      await this.zombieIn();
      const { views, items, slot, scale } = layoutSentence(this, s.words, 630, 171, { size: 64, maxWidth: 880, blank });
      // Chomp: a crumb of the eaten word flies into the zombie.
      const crumb = this.add.rectangle(slot.x, slot.y, slot.w, 70, 0xffe082).setStrokeStyle(4, 0xf4a100);
      this.sfx.chomp();
      await this.tween({ targets: crumb, x: this.zombie.x - 20, y: this.zombie.y - 70, scale: 0.2, angle: 200, duration: 450, ease: 'Cubic.In' });
      crumb.destroy();
      this.sfx.burp();

      const pic = drawPic(this, 640, 375, s.answer, 90);
      const cards = options.map((w, i) => {
        const c = this.wordCard(w).setPosition(640 + (i - (options.length - 1) / 2) * 250, CARD_Y);
        this.tweens.add({ targets: c, y: { from: 800, to: CARD_Y }, duration: 350, delay: i * 70, ease: 'Back.Out' });
        return c;
      });

      await this.prompt(async () => {
        if (r === 0) await this.say(LINES.zombieAte);
        await this.say(LINES.whichWord);
      });
      const res = await this.choose(cards, options.indexOf(answer), {
        scaffoldAfter: 1,
        onWrong: obj => { void audio.say((obj as Phaser.GameObjects.Container).getData('word')); },
        onScaffold: () => { void this.readAloud(views, s.words).catch(() => {}); },
      });
      this.record((prep ? 'w:' + answer : 'w:' + s.noun), res.firstTry ? 'correct' : 'wrong');
      this.sawWords(s.words, prep ? answer : s.noun);
      this.score(res.firstTry);

      // The word goes back in the gap...
      cards.filter(c => c !== res.obj).forEach(c => this.tweens.add({ targets: c, alpha: 0, duration: 200 }));
      const card = res.obj as Phaser.GameObjects.Container;
      await this.tween({ targets: card, x: slot.x, y: slot.y, scale: scale * 0.9, duration: 400, ease: 'Cubic.Out' });
      card.destroy();
      const filled = new WordView(this, slot.x, slot.y, answer, { size: 64, cap: blank === 0 }).setScale(scale);
      filled.setAllColor('#2e7d32');
      views[blank] = filled;
      items.push(filled);
      this.sfx.pop();
      // ...and every peashooter on the lawn sends the zombie packing.
      await this.volley();
      burst(this, this.zombie.x, this.zombie.y - 60, ['💥', '✨', '🟢']);
      this.tweens.killTweensOf(this.zombie);
      const z = this.zombie;
      this.tweens.add({ targets: z, x: z.x + 260, y: z.y - 280, angle: 540, alpha: 0, duration: 700, ease: 'Quad.Out', onComplete: () => z.destroy() });
      await this.readAloud(views);
      filled.resetColor();
      await this.plantOne();
      await this.praise(res.firstTry);
      [...items, pic, ...cards].forEach(o => o.destroy());
      this.progress();
    }
    if (Math.random() < 0.5) await this.say(pickOne(LINES.praise));
  }
}
