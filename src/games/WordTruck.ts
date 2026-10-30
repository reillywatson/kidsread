// Paw Patrol — sentence building (UFLI sentence dictation): hear a sentence, then tap its
// words in order. Each word becomes a trailer hitched behind Marshall's fire truck; the
// capital letter and the period are clues to the first and last word. Then the truck drives off.
import Phaser from 'phaser';
import { BaseGame, type GameMeta } from './BaseGame';
import { NOUNS } from '../data/curriculum';
import { shuffle, pickOne } from '../learner';
import { LINES } from '../lines';
import * as audio from '../audio';
import { kindsAt, makeSentence, nounsAt } from '../sentences';
import { drawPic } from '../sentenceView';
import { W, burst, sprite, tappable, text } from '../widgets';

export const meta: GameMeta = {
  id: 'wordtruck',
  theme: 'paw',
  skill: 'sentence',
  title: 'Word Truck — hear a sentence, build it word by word',
  intro: LINES.intro.wordtruck,
  icon: 'fireTruck',
  eligible: lesson => lesson >= 9 && nounsAt(lesson).length >= 3,
};

const ROAD_Y = 440;
const TILE_Y = 615;
const TRUCK_X = 1140;
const COLORS = [0xef5350, 0x42a5f5, 0x66bb6a, 0xffa726, 0xab47bc, 0x26c6da, 0xec407a];

type Car = Phaser.GameObjects.Container;

export class WordTruck extends BaseGame {
  private truck!: Phaser.GameObjects.Image;

  constructor() { super(meta); }

  protected setup() {
    this.add.image(640, 360, 'bgBay');
    const road = this.add.graphics();
    road.fillStyle(0x546e7a).fillRect(0, ROAD_Y + 30, W, 56);
    road.fillStyle(0xffffff, 0.8);
    for (let x = 20; x < W; x += 90) road.fillRect(x, ROAD_Y + 55, 46, 6);
    this.truck = sprite(this, TRUCK_X, ROAD_Y - 6, 'fireTruck', 130);
    this.tickle(sprite(this, 95, 610, 'pup-marshall', 190), () => void audio.say(LINES.ruff, { style: 'pup' }));
  }

  /** A word tile that turns into a trailer (body + wheels) once it's hitched. */
  private car(word: string, spoken: string, size: number, color: number): Car {
    const label = text(this, 0, 0, word, size);
    const w = label.width + size * 0.7, h = size * 1.6;
    const tile = this.add.graphics();
    tile.fillStyle(0x000000, 0.18).fillRoundedRect(-w / 2 + 3, -h / 2 + 7, w, h, 18);
    tile.fillStyle(0xffe082).fillRoundedRect(-w / 2, -h / 2, w, h, 18);
    tile.lineStyle(5, 0xf4a100).strokeRoundedRect(-w / 2, -h / 2, w, h, 18);
    const trailer = this.add.graphics().setVisible(false);
    trailer.fillStyle(0x37474f).fillCircle(-w / 2 + 22, h / 2 + 4, 13).fillCircle(w / 2 - 22, h / 2 + 4, 13);
    trailer.fillStyle(color).fillRoundedRect(-w / 2, -h / 2, w, h, 12);
    trailer.fillStyle(0xffffff, 0.85).fillRoundedRect(-w / 2 + 8, -h / 2 + 8, w - 16, h - 16, 10);
    trailer.fillStyle(0x37474f).fillRect(w / 2, 4, 14, 6); // hitch
    const c = this.add.container(0, 0, [tile, trailer, label]);
    c.setData({ word, spoken, w, tile, trailer, label });
    return tappable(c, w, h);
  }

  protected async run() {
    const n = this.rounds(3);
    const nouns = this.learner.pick(['w'], n, { filter: w => NOUNS.has(w) });
    // The easiest tier keeps to short sentences.
    const kinds = kindsAt(this.lesson, this.tier).filter(k => this.tier > 0 || k !== 'and');

    for (let r = 0; r < nouns.length && !this.timeUp(); r++) {
      const s = makeSentence(nouns[r], this.lesson, kinds);
      // Capital letter on the first word, period on the last: real sentence clues.
      const shown = s.words.map((w, i) => (i === 0 ? w[0].toUpperCase() + w.slice(1) : w) + (i === s.words.length - 1 ? '.' : ''));
      const pic = drawPic(this, 640, 205, s.answer, 102);

      // Size the words so the whole train fits between the left edge and the truck.
      let size = 50;
      const measure = (sz: number) => shown.reduce((a, w) => a + w.length * sz * 0.56 + sz * 0.7 + 14, 0);
      while (size > 30 && measure(size) > TRUCK_X - 110 - 40) size -= 2;
      const cars = shown.map((w, i) => this.car(w, s.words[i], size, COLORS[i % COLORS.length]));

      // Empty slots on the road, right to left from the truck.
      const slotX: number[] = [];
      let x = TRUCK_X - 110;
      for (let i = cars.length - 1; i >= 0; i--) {
        const w = cars[i].getData('w') as number;
        slotX[i] = x - w / 2;
        x -= w + 14;
      }
      const slots = this.add.graphics();
      cars.forEach((c, i) => {
        const w = c.getData('w') as number, h = size * 1.6;
        slots.lineStyle(4, 0xffffff, 0.8).strokeRoundedRect(slotX[i] - w / 2, ROAD_Y - h / 2, w, h, 12);
      });

      // The same cars, shuffled, as tiles along the bottom.
      const order = shuffle(cars.map((_, i) => i));
      const tw = order.reduce((a, i) => a + (cars[i].getData('w') as number), 0) + 20 * (cars.length - 1);
      let tx = W / 2 - tw / 2;
      order.forEach((i, k) => {
        const w = cars[i].getData('w') as number;
        cars[i].setPosition(tx + w / 2, TILE_Y);
        this.tweens.add({ targets: cars[i], y: { from: 800, to: TILE_Y }, duration: 350, delay: k * 60, ease: 'Back.Out' });
        tx += w + 20;
      });

      await this.prompt(async () => {
        if (r === 0) await this.say(LINES.buildSentence);
        for (const w of s.words) await this.say(w);
      });

      let misses = 0;
      for (let i = 0; i < cars.length; i++) {
        const free = cars.filter(c => !c.getData('used'));
        const right = free.flatMap((c, j) => (c.getData('word') === shown[i] ? [j] : []));
        const res = await this.choose(free, right, {
          onWrong: obj => {
            misses++;
            void audio.say((obj as Car).getData('spoken'));
            obj.setAlpha(1); // it may be needed later in the sentence
          },
          onScaffold: () => { void this.say(s.words[i]).catch(() => {}); },
        });
        free.forEach(c => c.setAlpha(1));
        const car = res.obj as Car;
        car.setData('used', true).disableInteractive();
        void audio.say(s.words[i]);
        this.sfx.pop();
        await this.tween({ targets: car, x: slotX[i], y: ROAD_Y, duration: 320, ease: 'Back.Out' });
        (car.getData('tile') as Phaser.GameObjects.Graphics).setVisible(false);
        (car.getData('trailer') as Phaser.GameObjects.Graphics).setVisible(true);
        // Keep the car in sentence order from here on (so reading aloud goes left to right).
        cars.splice(cars.indexOf(car), 1);
        cars.splice(i, 0, car);
      }
      slots.destroy();

      const ok = misses === 0;
      this.record('w:' + s.noun, ok ? 'correct' : misses === 1 ? 'help' : 'wrong');
      this.sawWords(s.words, s.noun);
      this.score(ok);

      // Read the whole train, then drive off.
      for (let i = 0; i < cars.length; i++) {
        const label = cars[i].getData('label') as Phaser.GameObjects.Text;
        label.setColor('#1e88e5');
        this.tweens.add({ targets: cars[i], y: ROAD_Y - 12, duration: 120, yoyo: true });
        await this.say(s.words[i]);
        label.setColor('#2b2b2b');
      }
      this.sfx.siren();
      burst(this, 640, ROAD_Y, ['🚒', '⭐', '✨']);
      await this.tween({ targets: [this.truck, ...cars], x: `+=${W + 300}`, duration: 1700, ease: 'Quad.In' });
      if (Math.random() < 0.3) await this.say(LINES.pawRoll);
      await this.praise(ok);
      [...cars, pic].forEach(o => o.destroy());
      this.truck.x = W + 200;
      await this.tween({ targets: this.truck, x: TRUCK_X, duration: 600, ease: 'Quad.Out' });
      this.progress();
    }
    if (Math.random() < 0.5) await this.say(pickOne(LINES.praise));
  }
}
