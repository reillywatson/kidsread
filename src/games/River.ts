// Pokémon — goal game: get Pikachu across the river to Squirtle. Each step, stepping stones
// float up with words on them; tap the one that names the picture and Pikachu hops onto it.
// The stones stay, building a path across.
import Phaser from 'phaser';
import { BaseGame, type GameMeta } from './BaseGame';
import { PIC } from '../data/curriculum';
import { readableWords, wordDistractors, wordItem } from '../choices';
import { pickOne, shuffle } from '../learner';
import { LINES } from '../lines';
import * as audio from '../audio';
import { WordView, burst, picture, sprite, tappable } from '../widgets';

export const meta: GameMeta = {
  id: 'river',
  theme: 'pokemon',
  skill: 'word',
  title: 'River Crossing — read the stones to get Pikachu across',
  intro: LINES.intro.river,
  icon: 'squirtle',
  eligible: lesson => readableWords(lesson, { pic: true }).length >= 4,
  goal: true,
};

const BANK_Y = 470;
const FIRST_X = 250, LAST_X = 1030;
const LANES: Record<number, number[]> = { 2: [380, 580], 3: [330, 470, 610] };

export class River extends BaseGame {
  private pika!: Phaser.GameObjects.Image;
  private friend!: Phaser.GameObjects.Image;

  constructor() { super(meta); }

  protected setup() {
    this.add.image(640, 360, 'bgPond');
    const banks = this.add.graphics();
    for (const x of [-20, 1300]) {
      banks.fillStyle(0x5d9c3a).fillEllipse(x, BANK_Y + 60, 320, 260);
      banks.fillStyle(0x7cc242).fillEllipse(x, BANK_Y + 40, 300, 240);
    }
    this.pika = this.tickle(sprite(this, 70, BANK_Y - 20, 'pikachu', 150), () => void audio.say(pickOne(LINES.pika), { style: 'pika' }));
    this.friend = this.tickle(sprite(this, 1205, BANK_Y - 20, 'squirtle', 150));
    this.tweens.add({ targets: this.friend, angle: { from: -5, to: 5 }, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
  }

  private stone(word: string) {
    const v = new WordView(this, 0, -4, word, { size: 44, tapSounds: false });
    const w = Math.max(170, v.width + 60);
    const g = this.add.graphics();
    g.fillStyle(0x5f6b73).fillEllipse(0, 12, w, 96);
    g.fillStyle(0xb0bec5).fillEllipse(0, 0, w, 90);
    g.fillStyle(0xffffff, 0.35).fillEllipse(-w * 0.15, -22, w * 0.5, 22);
    return tappable(this.add.container(0, 0, [g, v]), w, 96);
  }

  private async jumpTo(x: number, y: number) {
    this.sfx.hop();
    const top = Math.min(this.pika.y, y) - 110;
    await Promise.all([
      this.tween({ targets: this.pika, x, duration: 520, ease: 'Linear' }),
      (async () => {
        await this.tween({ targets: this.pika, y: top, duration: 260, ease: 'Quad.Out' });
        await this.tween({ targets: this.pika, y, duration: 260, ease: 'Quad.In' });
      })(),
    ]);
    this.sfx.splash();
    burst(this, x, y + 50, ['💧', '💦'], 6);
  }

  protected async run() {
    const n = this.rounds(5);
    const words = this.learner.pick(['w'], n, { filter: w => !!PIC[w] });
    const nChoices = [2, 3, 3][this.tier];
    const step = (LAST_X - FIRST_X) / Math.max(1, words.length - 1);

    for (let r = 0; r < words.length && !this.timeUp(); r++) {
      const w = words[r];
      const x = FIRST_X + r * step;
      const opts = shuffle([w, ...wordDistractors(w, nChoices - 1, this.tier, this.lesson, { pic: true })]);
      const ys = shuffle([...LANES[opts.length] ?? LANES[3]]);
      const stones = opts.map((o, i) => {
        const s = this.stone(o).setPosition(x, ys[i]);
        this.tweens.add({ targets: s, y: { from: ys[i] + 60, to: ys[i] }, alpha: { from: 0, to: 1 }, duration: 400, delay: i * 80, ease: 'Back.Out' });
        this.tweens.add({ targets: s, y: ys[i] + 6, duration: 900 + i * 120, yoyo: true, repeat: -1, delay: 500, ease: 'Sine.InOut' });
        return s;
      });
      const card = picture(this, 640, 130, w, { size: 70 }).setScale(0);
      this.tweens.add({ targets: card, scale: 1, duration: 300, ease: 'Back.Out' });

      await this.prompt(async () => {
        await this.say(pickOne(LINES.readIt));
        if (this.tier === 0) await this.say(w);
      });
      const res = await this.choose(stones, opts.indexOf(w), {
        scaffoldAfter: 1,
        onWrong: obj => { this.sfx.splash(); this.tweens.add({ targets: obj, y: obj.y + 30, duration: 300 }); },
        onScaffold: () => { void this.say(w).catch(() => {}); },
      });
      this.record(wordItem(w), res.firstTry ? 'correct' : 'wrong');
      this.score(res.firstTry);

      // The other stones sink; Pikachu hops onto the right one, which stays as part of the path.
      const stone = res.obj as Phaser.GameObjects.Container;
      stones.filter(s => s !== stone).forEach(s => {
        this.tweens.killTweensOf(s);
        this.tweens.add({ targets: s, y: s.y + 60, alpha: 0, duration: 400, onComplete: () => s.destroy() });
      });
      this.tweens.killTweensOf(stone);
      await this.jumpTo(stone.x, stone.y - 70);
      await this.say(w);
      await this.praise(res.firstTry);
      card.destroy();
    }

    // Last hop onto the far bank, and a happy reunion.
    await this.jumpTo(1110, BANK_Y - 20);
    this.tweens.killTweensOf(this.friend);
    this.friend.angle = 0;
    this.sfx.fanfare();
    burst(this, 1160, BANK_Y - 60, ['💛', '💙', '⭐', '✨'], 18);
    for (const c of [this.pika, this.friend]) this.tweens.add({ targets: c, y: c.y - 60, duration: 220, yoyo: true, repeat: 2, ease: 'Quad.Out' });
    void audio.say(pickOne(LINES.pika), { style: 'pika' });
    await this.wait(700);
    await this.say(LINES.madeIt);
  }
}
