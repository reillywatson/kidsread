// Paw Patrol — connected text: read a short decodable sentence on the pup pad and pick the
// matching picture. Sentences grow with the lesson (see sentences.ts): "It is a cat." →
// "The cat is on the bed." → "The cat has a hat." The wrong pictures are near misses.
// Every message read calls another pup to the team (Marshall in his fire truck, then Skye, then
// Rubble); at the end the whole team is ready for action.
import Phaser from 'phaser';
import { BaseGame, type GameMeta } from './BaseGame';
import { NOUNS } from '../data/curriculum';
import { pickOne } from '../learner';
import { LINES } from '../lines';
import * as audio from '../audio';
import { choicesFor, kindsAt, makeSentence, nounsAt } from '../sentences';
import { drawPic, layoutSentence } from '../sentenceView';
import { burst, sprite } from '../widgets';

export const meta: GameMeta = {
  id: 'pupmessage',
  theme: 'paw',
  skill: 'sentence',
  title: 'Pup Pad — read a sentence, pick the picture',
  intro: LINES.intro.pupmessage,
  icon: 'pup-chase',
  eligible: lesson => lesson >= 9 && nounsAt(lesson).length >= 3,
};

/** Who answers each call, and where they wait on the right of the screen. */
const TEAM: { key: string; x: number; y: number; h: number }[] = [
  { key: 'fireTruck', x: 1150, y: 655, h: 110 },
  { key: 'pup-skye', x: 1125, y: 450, h: 140 },
  { key: 'pup-rubble', x: 1222, y: 450, h: 140 },
];

export class PupMessage extends BaseGame {
  private pup!: Phaser.GameObjects.Image;
  private team: Phaser.GameObjects.Image[] = [];

  constructor() { super(meta); }

  protected setup() {
    this.add.image(640, 360, 'bgBay');
    this.pup = this.tickle(sprite(this, 140, 470, 'pup-chase', 300), () => void audio.say(LINES.ruff, { style: 'pup' }));
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.2).fillRoundedRect(196, 110, 900, 200, 34);
    g.fillStyle(0x1e4fd8).fillRoundedRect(186, 100, 900, 200, 34);
    g.fillStyle(0xffffff).fillRoundedRect(206, 120, 860, 160, 24);
    this.add.circle(1076, 200, 10, 0xffd21f);
  }

  protected async run() {
    const n = this.rounds(4);
    const nouns = this.learner.pick(['w'], n, { filter: w => NOUNS.has(w) });
    const nChoices = [2, 3, 3][this.tier];

    for (let r = 0; r < nouns.length && !this.timeUp(); r++) {
      const s = makeSentence(nouns[r], this.lesson, kindsAt(this.lesson, this.tier));
      const { views, items } = layoutSentence(this, s.words, 636, 200, { size: s.words.length > 4 ? 64 : 72, maxWidth: 820 });
      const choices = choicesFor(s, nChoices);
      const cards = choices.map((p, i) => drawPic(this, 640 + (i - (choices.length - 1) / 2) * 280, 520, p, 100));

      let helped = false;
      await this.prompt(async () => {
        await this.say(r === 0 ? LINES.readMessage : pickOne(LINES.readMessageShort));
      });
      const res = await this.choose(cards, choices.indexOf(s.answer), {
        scaffoldAfter: 1,
        onScaffold: () => { helped = true; void this.readAloud(views).catch(() => {}); },
      });
      this.record('w:' + s.noun, res.firstTry ? 'correct' : helped && res.misses === 1 ? 'help' : 'wrong');
      this.sawWords(s.words, s.noun);
      this.score(res.firstTry);

      cards.filter(c => c !== res.obj).forEach(c => this.tweens.add({ targets: c, alpha: 0, duration: 250 }));
      burst(this, res.obj.x, res.obj.y, ['🐾', '⭐', '✨']);
      await this.readAloud(views);
      this.tweens.add({ targets: this.pup, y: this.pup.y - 40, duration: 200, yoyo: true, repeat: 1 });
      await this.callPup();
      if (Math.random() < 0.3) await this.say(LINES.pawRoll);
      await this.praise(res.firstTry);
      [...items, ...cards].forEach(o => o.destroy());
      this.progress();
    }
    await this.readyForAction();
  }

  /** The next pup answers the call and joins the team; once everyone's here, Chase races off on a rescue. */
  private async callPup() {
    const t = TEAM[this.team.length];
    if (!t) {
      const truck = sprite(this, -200, 650, 'truck', 120);
      this.sfx.siren();
      await this.tween({ targets: truck, x: 1500, duration: 1400, ease: 'Sine.InOut' });
      truck.destroy();
      return;
    }
    const m = sprite(this, t.x, t.y, t.key, t.h);
    this.tickle(m, () => this.sfx.bark());
    this.team.push(m);
    if (t.key === 'fireTruck') {
      // Marshall drives in and parks.
      this.sfx.siren();
      m.x = 1500;
      await this.tween({ targets: m, x: t.x, duration: 900, ease: 'Back.Out' });
    } else {
      // Skye and Rubble leap in from above.
      this.sfx.whoosh();
      m.y = -150;
      await this.tween({ targets: m, y: t.y, duration: 600, ease: 'Bounce.Out' });
    }
    this.sfx.bark();
    burst(this, t.x, t.y - 20, ['🐾', '⭐'], 8);
  }

  /** Everyone jumps together: the team is ready for action! */
  private async readyForAction() {
    if (!this.team.length) return;
    this.sfx.siren();
    const all = [this.pup, ...this.team];
    all.forEach((m, i) => this.tweens.add({ targets: m, y: m.y - 60, duration: 220, delay: i * 90, yoyo: true, repeat: 1, ease: 'Quad.Out' }));
    all.forEach(m => burst(this, m.x, m.y - 40, ['🐾', '⭐', '✨'], 6));
    this.sfx.bark();
    await this.wait(900);
  }
}
