// Pokémon — word chains (UFLI word work): "This says cat. Now make it say hat!"
// Swap one letter; each new word evolves the Pokémon a little more.
import Phaser from 'phaser';
import { BaseGame, type GameMeta } from './BaseGame';
import { GRAPHEMES, segment } from '../data/curriculum';
import { graphemeDistractors, neighbors, bestChain, chainStarts, decodable } from '../choices';
import { pickOne, shuffle } from '../learner';
import { LINES } from '../lines';
import * as audio from '../audio';
import { burst, sprite, tappable, text } from '../widgets';

export const meta: GameMeta = {
  id: 'evolve',
  theme: 'pokemon',
  skill: 'spelling',
  title: 'Poké Evolve — change one letter to make a new word',
  intro: LINES.intro.evolve,
  icon: 'charmander',
  // Needs enough words for chains longer than one step (from lesson 6: map, tap, sap, pat…).
  eligible: lesson => chainStarts(lesson).length >= 5,
};

const MONS = ['charmander', 'squirtle', 'bulbasaur', 'pikachu'];
const BOX_Y = 260;

export class Evolve extends BaseGame {
  private mon!: Phaser.GameObjects.Image;
  private glow!: Phaser.GameObjects.Arc;

  constructor() { super(meta); }

  protected setup() {
    this.add.image(640, 360, 'bgField');
    this.glow = this.add.circle(170, 430, 130, 0xfff59d, 0);
    this.mon = sprite(this, 170, 450, pickOne(MONS), 200);
  }

  protected async run() {
    const pool = decodable(this.lesson);
    const [start] = this.learner.pick(['w'], 1, { filter: w => neighbors(w, pool).length > 0 });
    const chain = bestChain(start, 4 + this.tier, pool);
    this.rounds(chain.length - 1);
    const nOpts = [3, 3, 4][this.tier];

    // Word tiles
    const toks0 = segment(chain[0]);
    const bw = 130, gap = 16, x0 = 700 - ((toks0.length - 1) * (bw + gap)) / 2;
    const boxes = toks0.map((t, i) => {
      const x = x0 + i * (bw + gap);
      const c = this.add.container(x, BOX_Y);
      const g = this.add.graphics();
      const label = text(this, 0, 0, t.t, 88, t.g ? '#2b2b2b' : '#9a9a9a');
      c.add([g, label]);
      c.setData({ g, label });
      return c;
    });
    const drawBox = (i: number, hot: boolean) => {
      const g = boxes[i].getData('g') as Phaser.GameObjects.Graphics;
      g.clear().fillStyle(0xffffff, 0.95).fillRoundedRect(-bw / 2, -75, bw, 150, 18)
        .lineStyle(hot ? 9 : 6, hot ? 0xffb300 : 0x2b2b2b).strokeRoundedRect(-bw / 2, -75, bw, 150, 18);
    };
    boxes.forEach((_, i) => drawBox(i, false));

    for (let s = 1; s < chain.length && !this.timeUp(); s++) {
      const from = chain[s - 1], to = chain[s];
      const a = segment(from), b = segment(to);
      const i = a.findIndex((t, k) => t.t !== b[k].t);
      const need = b[i];
      if (this.tier < 2) drawBox(i, true);

      // Letter choices: the new grapheme, the old one (to notice the change), and others.
      const opts = shuffle([need, a[i], ...graphemeDistractors(need.g!, nOpts, this.tier, this.lesson)
        .map(id => ({ t: GRAPHEMES[id].label.replace('_e', ''), g: id }))
        .filter(d => d.t !== need.t && d.t !== a[i].t)].slice(0, nOpts));
      const tw = 110;
      const tiles = opts.map((o, k) => {
        const c = this.add.container(700 + (k - (opts.length - 1) / 2) * (tw + 26), 560);
        const g = this.add.graphics();
        g.fillStyle(0x000000, 0.18).fillRoundedRect(-tw / 2 + 3, -tw / 2 + 7, tw, tw, 20);
        g.fillStyle(0xffe082).fillRoundedRect(-tw / 2, -tw / 2, tw, tw, 20);
        g.lineStyle(5, 0xf4a100).strokeRoundedRect(-tw / 2, -tw / 2, tw, tw, 20);
        c.add([g, text(this, 0, 0, o.t, 64)]);
        this.tweens.add({ targets: c, y: { from: 780, to: 560 }, duration: 350, delay: k * 70, ease: 'Back.Out' });
        return tappable(c, tw, tw);
      });

      await this.prompt(async () => {
        await this.say(LINES.thisSays);
        await this.say(from);
        await this.say(LINES.nowMake);
        await this.say(to);
      });
      const res = await this.choose(tiles, opts.indexOf(need), {
        onWrong: (_o, k) => { void audio.sound(opts[k].g!); },
        onScaffold: () => { drawBox(i, true); void this.say(to).then(() => this.letterSound(need.g!)).catch(() => {}); },
      });
      this.record('w:' + to, res.firstTry ? 'correct' : 'wrong');
      this.score(res.firstTry);

      // Swap the letter in.
      const label = boxes[i].getData('label') as Phaser.GameObjects.Text;
      await this.tween({ targets: label, scaleY: 0, duration: 120 });
      label.setText(need.t);
      void audio.sound(need.g!);
      await this.tween({ targets: label, scaleY: 1, duration: 160, ease: 'Back.Out' });
      drawBox(i, false);
      tiles.forEach(t => t.destroy());

      // Evolve!
      this.sfx.sparkle();
      this.glow.setAlpha(0.9).setScale(0.6);
      this.tweens.add({ targets: this.glow, scale: 1.3, alpha: 0, duration: 700 });
      await this.tween({ targets: this.mon, scale: this.mon.scale * 1.1, duration: 250, yoyo: true });
      this.mon.setScale(this.mon.scale * 1.06);
      burst(this, this.mon.x, this.mon.y - 60);
      await this.say(to);
      await this.praise(res.firstTry);
      this.progress();
    }
    this.sfx.fanfare();
    await this.say(pickOne(LINES.evolved));
  }
}
