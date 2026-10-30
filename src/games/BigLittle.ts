// Friends — capital letters: a big mama animal holds a big letter; tap the baby holding the
// matching little letter ("big B, little b"), and it runs to its mama. At the hardest level the
// other babies hold look-alikes (b, d, p). Each family that finds each other joins a parade
// along the bottom beside its letter pair ("Bb"); at the end each family hops as its sound plays.
import Phaser from 'phaser';
import { BaseGame, type GameMeta } from './BaseGame';
import { GRAPHEMES, capitalOf } from '../data/curriculum';
import { graphemeDistractors } from '../choices';
import { pickOne, shuffle } from '../learner';
import { LINES } from '../lines';
import { burst, emoji, tappable, text } from '../widgets';

export const meta: GameMeta = {
  id: 'biglittle',
  theme: 'friends',
  skill: 'capitals',
  title: 'Big and Little — match capital letters to small ones',
  intro: LINES.intro.biglittle,
  icon: 'monsterHappy',
  eligible: () => true,
};

/** Grown-up and baby versions of an animal (the same picture, big and small, mostly). */
const FAMILIES: [string, string][] = [['🐔', '🐤'], ['🦆', '🦆'], ['🐑', '🐑'], ['🐘', '🐘'], ['🐄', '🐄'], ['🐈', '🐈'],
  ['🐕', '🐕'], ['🐢', '🐢'], ['🐖', '🐖'], ['🐓', '🐥']];
const MAMA = { x: 960, y: 450 };
const BABY_Y = 535;
const PARADE_Y = 672;

export class BigLittle extends BaseGame {
  private parade: { g: string; items: (Phaser.GameObjects.Text | Phaser.GameObjects.Container)[] }[] = [];

  constructor() { super(meta); }

  protected setup() {
    this.add.image(640, 360, 'bgSky');
  }

  /** A letter on a round white sign. */
  private sign(x: number, y: number, label: string, r: number, size: number) {
    const c = this.add.container(x, y);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.15).fillCircle(0, 6, r);
    g.fillStyle(0xffffff).fillCircle(0, 0, r);
    g.lineStyle(6, 0xb388ff).strokeCircle(0, 0, r - 3);
    c.add([g, text(this, 0, 0, label, size)]);
    return c;
  }

  protected async run() {
    const n = this.rounds(5);
    const gs = this.learner.pick(['g'], n, { filter: g => !!capitalOf(g) });
    const nBabies = [2, 3, 3][this.tier];
    this.parade = [];
    const families = shuffle(FAMILIES);

    for (let r = 0; r < gs.length && !this.timeUp(); r++) {
      const g = gs[r];
      const [mamaPic, babyPic] = families[r % families.length];
      const mama = emoji(this, MAMA.x, MAMA.y, mamaPic, 230);
      const big = this.sign(MAMA.x, 190, capitalOf(g)!, 74, 110);
      [mama, big].forEach((o, i) => this.tweens.add({ targets: o, scale: { from: 0, to: 1 }, duration: 350, delay: i * 80, ease: 'Back.Out' }));

      const opts = shuffle([g, ...graphemeDistractors(g, 8, this.tier, this.lesson).filter(d => capitalOf(d)).slice(0, nBabies - 1)]);
      const babies = opts.map((x, i) => {
        const c = this.add.container(360 + (i - (opts.length - 1) / 2) * 210, BABY_Y);
        c.add([emoji(this, 0, 20, babyPic, 100), this.sign(0, -78, GRAPHEMES[x].label, 46, 60)]);
        this.tweens.add({ targets: c, y: { from: 820, to: BABY_Y }, duration: 380, delay: 200 + i * 90, ease: 'Back.Out' });
        this.tweens.add({ targets: c, angle: { from: -4, to: 4 }, duration: 500 + i * 70, yoyo: true, repeat: -1, delay: 600, ease: 'Sine.InOut' });
        return tappable(c, 150, 220);
      });

      await this.prompt(async () => {
        await this.say(r === 0 ? LINES.whichBaby[0] : pickOne(LINES.whichBaby));
        await this.letterSound(g);
      });
      const res = await this.choose(babies, opts.indexOf(g), {
        onScaffold: () => { void this.letterSound(g).catch(() => {}); },
      });
      this.learner.pushRecent('capitals', res.firstTry);
      this.learner.record('g:' + g, 'seen');
      this.score(res.firstTry);

      // The baby runs to its mama.
      const baby = res.obj as Phaser.GameObjects.Container;
      this.tweens.killTweensOf(baby);
      baby.angle = 0;
      babies.filter(b => b !== baby).forEach(b => this.tweens.add({ targets: b, alpha: 0, y: b.y + 40, duration: 300 }));
      this.sfx.hop();
      await Promise.all([
        this.tween({ targets: baby, x: MAMA.x - 150, duration: 600, ease: 'Sine.InOut' }),
        (async () => {
          await this.tween({ targets: baby, y: BABY_Y - 120, duration: 300, ease: 'Quad.Out' });
          await this.tween({ targets: baby, y: MAMA.y + 70, duration: 300, ease: 'Quad.In' });
        })(),
      ]);
      this.sfx.giggle();
      burst(this, MAMA.x - 70, MAMA.y - 20, ['💖', '💜', '✨'], 14);
      this.tweens.add({ targets: mama, scale: 1.1, duration: 180, yoyo: true, repeat: 1 });
      if (r === 0) await this.say(LINES.foundMama);
      await this.letterSound(g);
      await this.praise(res.firstTry);
      await this.tween({ targets: [big, ...babies.filter(b => b !== baby)], alpha: 0, duration: 250 });
      [big, ...babies.filter(b => b !== baby)].forEach(o => o.destroy());
      await this.joinParade(g, mama, baby);
      this.progress();
    }
    await this.paradeHop();
  }

  /** Mama and baby walk down to the parade along the bottom, under their letters. */
  private async joinParade(g: string, mama: Phaser.GameObjects.Text, baby: Phaser.GameObjects.Container) {
    const x = 160 + this.parade.length * 200;
    const tag = text(this, x - 80, PARADE_Y - 4, capitalOf(g)! + GRAPHEMES[g].label, 34, '#5e35b1').setStroke('#ffffff', 7).setScale(0);
    this.sfx.hop();
    this.tweens.killTweensOf(mama);
    await Promise.all([
      this.tween({ targets: mama, x: x - 10, y: PARADE_Y - 6, scale: 70 / 230, duration: 600, ease: 'Sine.InOut' }),
      this.tween({ targets: baby, x: x + 48, y: PARADE_Y - 30, scale: 0.42, duration: 600, ease: 'Sine.InOut' }),
    ]);
    // The baby's sign has done its job: the tag above shows the pair.
    (baby.list[1] as Phaser.GameObjects.Container).setVisible(false);
    this.tweens.add({ targets: tag, scale: 1, duration: 250, ease: 'Back.Out' });
    this.parade.push({ g, items: [mama, baby, tag] });
  }

  /** Each family hops in turn as its letter's sound plays. */
  private async paradeHop() {
    for (const { g, items } of this.parade) {
      this.tweens.add({ targets: items, y: '-=30', duration: 180, yoyo: true, ease: 'Quad.Out' });
      burst(this, items[0].x + 30, PARADE_Y - 40, ['💜', '✨'], 5);
      await this.letterSound(g);
    }
  }
}
