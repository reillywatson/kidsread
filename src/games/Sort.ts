// Plants vs. Zombies — drag and drop: two pots, each with a letter. Drag each picture into the
// pot with the letter it starts with (tapping a pot works too). Flowers bloom over each pot as
// it fills up, and each sorted picture stays beside its pot. At the end each pot says its sound
// and reads back its pictures.
import Phaser from 'phaser';
import { BaseGame, type GameMeta } from './BaseGame';
import { BANK, GRAPHEMES, PIC } from '../data/curriculum';
import { canStartWord, graphemeDistractors, picsStartingWithLetter } from '../choices';
import { pickOne, shuffle } from '../learner';
import { LINES } from '../lines';
import * as audio from '../audio';
import { burst, emoji, picture, sprite, tappable, text } from '../widgets';

export const meta: GameMeta = {
  id: 'sort',
  theme: 'pvz',
  skill: 'grapheme',
  title: 'Seed Sort — drag each picture to the pot with its first letter',
  intro: LINES.intro.sort,
  icon: 'pot',
  eligible: () => true,
};

const POT_Y = 560;
const START = { x: 640, y: 250 };
const FLOWERS = ['🌷', '🌻', '🌼', '🌸', '🌺'];
/** Where sorted pictures sit around a pot (offsets from its center), on the outer side first. */
const BESIDE = [[-150, -10], [-150, 70], [150, -10], [150, 70], [-135, -90], [135, -90]];
const sortable = (g: string) => canStartWord(g) && picsStartingWithLetter(g).length >= 3;

export class Sort extends BaseGame {
  constructor() { super(meta); }

  protected setup() {
    this.add.image(640, 360, 'bgGarden');
    this.tickle(sprite(this, 640, 520, 'sunflower', 200));
  }

  protected async run() {
    const n = this.rounds(6);
    // Two letters: the learner's pick, and a partner that sorts cleanly against it.
    const [a] = this.learner.pick(['g'], 1, { filter: sortable });
    const b = graphemeDistractors(a, 6, this.tier, this.lesson).find(sortable) ?? 's';
    const letters = shuffle([a, b]);
    const pots = letters.map((g, i) => {
      const c = this.add.container(i === 0 ? 300 : 980, POT_Y, [sprite(this, 0, 0, 'pot', 190), text(this, 0, 20, GRAPHEMES[g].label, 90, '#ffffff').setStroke('#7a3414', 10)]);
      this.tweens.add({ targets: c, y: { from: 800, to: POT_Y }, duration: 400, delay: i * 100, ease: 'Back.Out' });
      return tappable(c, 220, 210).setData({ g, bloom: 0 });
    });
    // Pictures: half for each letter, distinct pictures, shuffled.
    const pics = letters.flatMap(g => shuffle(picsStartingWithLetter(g).filter((w, i, all) => all.findIndex(o => BANK[o] === BANK[w]) === i))
      .slice(0, Math.ceil(n / 2)).map(w => ({ w, g })));
    const order = shuffle(pics).slice(0, n);
    const sorted = new Map<Phaser.GameObjects.Container, { w: string; pic: Phaser.GameObjects.Text }[]>(pots.map(p => [p, []]));

    for (let r = 0; r < order.length && !this.timeUp(); r++) {
      const { w, g } = order[r];
      const card = picture(this, START.x, START.y, w, { size: 100 }).setDepth(30);
      card.setScale(0);
      this.tweens.add({ targets: card, scale: 1, duration: 300, ease: 'Back.Out' });
      this.input.setDraggable(card);
      card.on('drag', (_p: Phaser.Input.Pointer, x: number, y: number) => card.setPosition(x, y));
      card.on('dragend', () => {
        // Dropped on a pot counts as tapping it; anywhere else, it floats back.
        const pot = pots.find(p => Phaser.Math.Distance.Between(card.x, card.y, p.x, p.y - 40) < 190);
        if (pot) pot.emit('pointerdown');
        else this.tweens.add({ targets: card, x: START.x, y: START.y, duration: 300, ease: 'Back.Out' });
      });

      await this.prompt(async () => {
        if (r === 0) await this.say(LINES.whichPotPic);
        await this.say(w);
      });
      const res = await this.choose(pots, letters.indexOf(g), {
        onWrong: () => {
          void audio.say(w);
          this.tweens.add({ targets: card, x: START.x, y: START.y, duration: 350, ease: 'Back.Out' });
        },
        onScaffold: () => { void this.say(w).then(() => this.letterSound(g)).catch(() => {}); },
      });
      pots.forEach(p => p.setAlpha(1));
      this.record('g:' + g, res.firstTry ? 'correct' : 'wrong');
      this.score(res.firstTry);

      // Into the pot it goes, and a flower blooms above it.
      const pot = res.obj as Phaser.GameObjects.Container;
      this.input.setDraggable(card, false);
      await this.tween({ targets: card, x: pot.x, y: pot.y - 20, scale: 0.2, alpha: 0, duration: 350, ease: 'Cubic.In' });
      card.destroy();
      // The picture stays beside its pot.
      const here = sorted.get(pot)!;
      const [dx, dy] = BESIDE[here.length % BESIDE.length];
      const side = pot.x < 640 ? 1 : -1; // outer side first, away from the middle
      const pic = emoji(this, pot.x + dx * side, pot.y + dy, PIC[w] || BANK[w] || '❓', 50).setScale(0);
      this.tweens.add({ targets: pic, scale: 1, duration: 300, delay: 150, ease: 'Back.Out' });
      here.push({ w, pic });
      this.sfx.grow();
      const k = pot.getData('bloom') as number;
      pot.setData('bloom', k + 1);
      const f = emoji(this, pot.x + [0, -60, 60, -30, 30][k % 5], pot.y - 150 - Math.floor(k / 5) * 40, pickOne(FLOWERS), 60).setScale(0);
      this.tweens.add({ targets: f, scale: 1, duration: 400, ease: 'Back.Out' });
      burst(this, pot.x, pot.y - 120, ['✨', '🌱'], 6);
      await this.letterSound(g);
      await this.say(w);
      await this.praise(res.firstTry);
      this.progress();
    }
    await this.readBack(sorted);
  }

  /** Each pot says its sound, then every picture beside it hops as it's named. */
  private async readBack(sorted: Map<Phaser.GameObjects.Container, { w: string; pic: Phaser.GameObjects.Text }[]>) {
    for (const [pot, here] of sorted) {
      if (!here.length) continue;
      this.tweens.add({ targets: pot, scale: 1.12, duration: 180, yoyo: true, ease: 'Quad.Out' });
      await this.letterSound(pot.getData('g'));
      for (const { w, pic } of here) {
        this.tweens.add({ targets: pic, y: pic.y - 26, duration: 160, yoyo: true, ease: 'Quad.Out' });
        await this.say(w);
      }
      burst(this, pot.x, pot.y - 150, ['🌼', '✨'], 8);
    }
  }
}
