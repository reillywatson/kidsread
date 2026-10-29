// Pokémon — encoding (UFLI word work): hear a word, build it sound by sound in
// Elkonin boxes from letter tiles. Filling the word catches a Poké Ball.
import Phaser from 'phaser';
import { BaseGame, type GameMeta } from './BaseGame';
import { PIC, segment, GRAPHEMES } from '../data/curriculum';
import { graphemeDistractors, readableWords } from '../choices';
import { shuffle } from '../learner';
import * as audio from '../audio';
import { burst, picture, sprite, tappable, text, wiggle, roundButton } from '../widgets';

export const meta: GameMeta = {
  id: 'pikaspell',
  theme: 'pokemon',
  skill: 'spelling',
  title: 'Poké Spell — hear a word, build it with letters',
  intro: "Let's spell! Listen to the word, then tap the letters in order to fill the boxes.",
  icon: 'pokeball',
  eligible: lesson => readableWords(lesson, { heart: false }).length >= 2,
};

const BOX_Y = 330;
const TILE_Y = 580;

export class PikaSpell extends BaseGame {
  constructor() { super(meta); }

  protected setup() {
    this.add.image(640, 360, 'bgField');
    sprite(this, 1150, 470, 'pikachu', 220);
  }

  protected async run() {
    const n = this.rounds(4);
    const maxSounds = [3, 4, 6][this.tier];
    const words = this.learner.pick(['w'], n, { filter: w => segment(w).filter(t => t.g).length <= maxSounds });
    const extra = [1, 2, 3][this.tier];

    for (let r = 0; r < words.length && !this.timeUp(); r++) {
      const w = words[r];
      const toks = segment(w);
      const objs: Phaser.GameObjects.GameObject[] = [];
      if (PIC[w]) objs.push(picture(this, 640, 150, w, { size: 80 }));
      const sayBtn = roundButton(this, PIC[w] ? 820 : 640, 150, 40, 0x42a5f5, '🔊', () => { void audio.say(w); });
      objs.push(sayBtn);

      // Elkonin boxes, one per grapheme; silent e is pre-filled.
      const bw = 130, gap = 16;
      const x0 = 640 - ((toks.length - 1) * (bw + gap)) / 2;
      const boxes = toks.map((t, i) => {
        const x = x0 + i * (bw + gap);
        const g = this.add.graphics();
        g.fillStyle(0xffffff, 0.9).fillRoundedRect(x - bw / 2, BOX_Y - 75, bw, 150, 18);
        g.lineStyle(6, t.g ? 0x2b2b2b : 0xbbbbbb).strokeRoundedRect(x - bw / 2, BOX_Y - 75, bw, 150, 18);
        objs.push(g);
        if (!t.g) objs.push(text(this, x, BOX_Y, t.t, 90, '#9a9a9a'));
        else objs.push(this.add.circle(x, BOX_Y + 95, 9, 0xe53935));
        return { x, t };
      });

      // Letter tiles: the word's graphemes plus distractors.
      const needed = toks.filter(t => t.g);
      const distract = graphemeDistractors(needed[0].g!, extra, this.tier, this.lesson)
        .map(id => ({ t: GRAPHEMES[id].label.replace('_e', ''), g: id }))
        .filter(d => !needed.some(nd => nd.t === d.t));
      const tileData = shuffle([...needed, ...distract]);
      const tw = 120, tgap = 22;
      const tx0 = 640 - ((tileData.length - 1) * (tw + tgap)) / 2;
      const tiles = tileData.map((t, i) => {
        const c = this.add.container(tx0 + i * (tw + tgap), TILE_Y);
        const g = this.add.graphics();
        g.fillStyle(0x000000, 0.18).fillRoundedRect(-tw / 2 + 3, -tw / 2 + 7, tw, tw, 20);
        g.fillStyle(0xffe082).fillRoundedRect(-tw / 2, -tw / 2, tw, tw, 20);
        g.lineStyle(5, 0xf4a100).strokeRoundedRect(-tw / 2, -tw / 2, tw, tw, 20);
        c.add([g, text(this, 0, 0, t.t, 72)]);
        tappable(c, tw, tw);
        c.setData('tok', t);
        objs.push(c);
        return c;
      });

      await this.prompt(async () => {
        if (r === 0) await this.say('Spell');
        await this.say(w);
      });

      let misses = 0;
      for (let i = 0; i < toks.length; i++) {
        const tok = toks[i];
        if (!tok.g) continue;
        const free = tiles.filter(c => !c.getData('used'));
        const correctIdx = free.flatMap((c, j) => (c.getData('tok').t === tok.t ? [j] : []));
        const res = await this.choose(free, correctIdx, {
          onWrong: obj => {
            misses++;
            void audio.sound((obj as Phaser.GameObjects.Container).getData('tok').g);
            obj.setAlpha(1); // tiles stay usable for later boxes
          },
          onScaffold: () => { void this.letterSound(tok.g!).catch(() => {}); },
        });
        free.forEach(c => c.setAlpha(1));
        const tile = res.obj as Phaser.GameObjects.Container;
        tile.setData('used', true);
        tile.disableInteractive();
        void audio.sound(tok.g);
        await this.tween({ targets: tile, x: boxes[i].x, y: BOX_Y, duration: 300, ease: 'Back.Out' });
        this.sfx.pop();
      }

      const ok = misses === 0;
      this.record('w:' + w, ok ? 'correct' : misses === 1 ? 'help' : 'wrong');
      this.score(ok);
      await this.say(w);
      const ball = sprite(this, 640, 470, 'pokeball', 10);
      objs.push(ball);
      this.sfx.zap();
      await this.tween({ targets: ball, scale: 120 / ball.height, duration: 300, ease: 'Back.Out' });
      this.sfx.wobble();
      await this.tween({ targets: ball, angle: { from: -18, to: 18 }, duration: 200, yoyo: true, repeat: 2 });
      ball.angle = 0;
      burst(this, 640, 470);
      tiles.filter(c => !c.getData('used')).forEach(c => wiggle(this, c));
      await this.praise(ok);
      objs.forEach(o => o.destroy());
      this.progress();
    }
  }
}
