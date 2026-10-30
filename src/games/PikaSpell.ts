// Pokémon — encoding (UFLI word work): hear a word, build it sound by sound in
// Elkonin boxes from letter tiles. Filling the word catches a Pokémon: the ball wobbles, pops
// open, and the Pokémon joins the team along the top. At the end the whole team cheers.
import Phaser from 'phaser';
import { BaseGame, type GameMeta } from './BaseGame';
import { PIC, segment, GRAPHEMES } from '../data/curriculum';
import { graphemeDistractors, readableWords } from '../choices';
import { shuffle, pickOne } from '../learner';
import { LINES } from '../lines';
import * as audio from '../audio';
import { burst, picture, sprite, tappable, text, wiggle, roundButton } from '../widgets';

export const meta: GameMeta = {
  id: 'pikaspell',
  theme: 'pokemon',
  skill: 'spelling',
  title: 'Poké Spell — hear a word, build it with letters',
  intro: LINES.intro.pikaspell,
  icon: 'pokeball',
  eligible: lesson => readableWords(lesson, { heart: false }).length >= 2,
};

const BOX_Y = 330;
const TILE_Y = 580;
/** Who each spelled word catches, in order. */
const CATCHES = ['bulbasaur', 'charmander', 'squirtle'];

export class PikaSpell extends BaseGame {
  private pika!: Phaser.GameObjects.Image;
  private team: Phaser.GameObjects.Image[] = [];

  constructor() { super(meta); }

  protected setup() {
    this.add.image(640, 360, 'bgField');
    this.pika = this.tickle(sprite(this, 1150, 470, 'pikachu', 220), () => void audio.say(pickOne(LINES.pika), { style: 'pika' }));
    this.team = [];
  }

  /** The ball pops open and a Pokémon hops up to join the team (top left, clear of the word's picture). */
  private async release(ball: Phaser.GameObjects.Image) {
    const key = CATCHES[this.team.length % CATCHES.length];
    const slot = { x: 90 + this.team.length * 100, y: 170 };
    this.sfx.zap();
    this.cameras.main.flash(150, 255, 255, 255);
    const mon = sprite(this, ball.x, ball.y, key, 120);
    const full = mon.scale;
    mon.setScale(0);
    this.tickle(mon);
    this.team.push(mon);
    ball.setVisible(false);
    await this.tween({ targets: mon, scale: full, duration: 300, ease: 'Back.Out' });
    await this.wait(250);
    this.sfx.hop();
    await Promise.all([
      this.tween({ targets: mon, x: slot.x, scale: full * 0.75, duration: 600, ease: 'Sine.InOut' }),
      (async () => {
        await this.tween({ targets: mon, y: Math.min(ball.y, slot.y) - 90, duration: 300, ease: 'Quad.Out' });
        await this.tween({ targets: mon, y: slot.y, duration: 300, ease: 'Quad.In' });
      })(),
    ]);
  }

  /** The whole team jumps for joy with Pikachu. */
  private async teamCheer() {
    if (!this.team.length) return;
    [...this.team, this.pika].forEach((m, i) =>
      this.tweens.add({ targets: m, y: m.y - 50, duration: 220, delay: i * 90, yoyo: true, repeat: 1, ease: 'Quad.Out' }));
    this.team.forEach(m => burst(this, m.x, m.y - 30, ['⭐', '✨'], 5));
    void audio.say(pickOne(LINES.pika), { style: 'pika' });
    await this.wait(1000);
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
        if (r === 0) await this.say(LINES.spell);
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
      await this.release(ball);
      await this.praise(ok);
      objs.forEach(o => o.destroy());
      this.progress();
    }
    await this.teamCheer();
  }
}
