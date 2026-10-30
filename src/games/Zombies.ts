// Plants vs. Zombies — auditory drill: hear a sound, zap the zombie holding that letter.
import Phaser from 'phaser';
import { BaseGame, type GameMeta } from './BaseGame';
import { GRAPHEMES } from '../data/curriculum';
import { graphemeDistractors } from '../choices';
import { shuffle, pickOne } from '../learner';
import { LINES } from '../lines';
import * as audio from '../audio';
import { burst, emoji, sprite, text, tappable } from '../widgets';

export const meta: GameMeta = {
  id: 'zombies',
  theme: 'pvz',
  skill: 'grapheme',
  title: 'Zombie Letters — hear a sound, tap the letter',
  intro: LINES.intro.zombies,
  icon: 'zombie',
  eligible: () => true,
};

const LANES = [295, 465, 635];
const HOUSE_X = 230;
const START_X = 1380;

export class Zombies extends BaseGame {
  private shooters: Phaser.GameObjects.Image[] = [];
  private bubble!: Phaser.GameObjects.Container;

  constructor() { super(meta); }

  protected setup() {
    this.add.image(640, 360, 'bgLawn');
    this.shooters = LANES.map(y => sprite(this, 130, y - 20, 'peashooter', 130));
    this.shooters.forEach((s, i) => {
      this.tweens.add({ targets: s, scaleY: s.scaleY * 1.05, duration: 600 + i * 90, yoyo: true, repeat: -1 });
      this.tickle(s);
    });
    this.bubble = this.add.container(640, 120).setVisible(false).setDepth(50);
    this.bubble.add([this.add.circle(0, 0, 52, 0xffffff).setStrokeStyle(5, 0xffc94d), emoji(this, 0, 2, '', 60)]);
  }

  private walk(z: Phaser.GameObjects.Container, secs: number) {
    const speed = (START_X - HOUSE_X) / (secs * 1000);
    this.tweens.add({
      targets: z, x: HOUSE_X, duration: (z.x - HOUSE_X) / speed, ease: 'Linear',
      onComplete: () => { z.x = START_X; this.walk(z, secs); },
    });
  }

  protected async run() {
    const n = this.rounds(6);
    const targets = this.learner.pick(['g'], n);
    const nChoices = [2, 3, 3][this.tier];
    const secs = [18, 13, 10][this.tier];

    for (let r = 0; r < targets.length && !this.timeUp(); r++) {
      const g = targets[r];
      const opts = shuffle([g, ...graphemeDistractors(g, nChoices - 1, this.tier, this.lesson)]);
      const lanes = shuffle([0, 1, 2]);
      const zs = opts.map((x, i) => {
        const z = this.add.container(980 + i * 110 + Math.random() * 60, LANES[lanes[i]] + 30);
        const sign = this.add.graphics();
        sign.fillStyle(0x8d6e3f).fillRect(-5, -150, 10, 60);
        sign.fillStyle(0xfff8e1).fillRoundedRect(-62, -225, 124, 90, 14);
        sign.lineStyle(5, 0x8d6e3f).strokeRoundedRect(-62, -225, 124, 90, 14);
        z.add([sign, text(this, 0, -180, this.shown(x), 64), sprite(this, 0, -60, Math.random() < 0.35 ? 'zombieCone' : 'zombie', 165)]);
        tappable(z, 150, 260);
        z.setData('g', x);
        this.walk(z, secs);
        this.tweens.add({ targets: z, angle: { from: -4, to: 4 }, duration: 500, yoyo: true, repeat: -1 });
        return z;
      });

      let help = this.tier === 0;
      await this.prompt(async () => {
        await this.say(r === 0 ? LINES.zapZombie : pickOne([LINES.find, LINES.zap, LINES.whereIs]));
        await this.letterSound(g);
        if (help) {
          (this.bubble.list[1] as Phaser.GameObjects.Text).setText(GRAPHEMES[g].pic);
          this.bubble.setVisible(true);
          await this.keyword(g);
        }
      });

      const res = await this.choose(zs, opts.indexOf(g), {
        onWrong: obj => {
          const groan = pickOne(LINES.groans);
          void audio.say(groan, { style: 'zombie' });
          const t = text(this, obj.x, obj.y - 260, groan, 34, '#4e342e').setDepth(60);
          this.tweens.add({ targets: t, y: t.y - 40, alpha: 0, duration: 1200, onComplete: () => t.destroy() });
        },
        onScaffold: () => { help = true; void this.letterSound(g).catch(() => {}); },
      });
      this.record('g:' + g, res.firstTry ? 'correct' : 'wrong');
      this.score(res.firstTry);

      // Fire a pea down the lane.
      const z = res.obj as Phaser.GameObjects.Container;
      this.tweens.killTweensOf(z);
      const lane = lanes[opts.indexOf(g)];
      const shooter = this.shooters[lane];
      const pea = sprite(this, shooter.x + 60, shooter.y - 18, 'pea', 30);
      this.sfx.pew();
      this.tweens.add({ targets: shooter, x: shooter.x - 12, duration: 80, yoyo: true });
      await this.tween({ targets: pea, x: z.x - 40, duration: Math.max(150, (z.x - pea.x) * 0.5), ease: 'Linear' });
      pea.destroy();
      this.sfx.splat();
      burst(this, z.x, z.y - 80, ['💥', '✨', '🟢']);
      zs.filter(o => o !== z).forEach(o => { this.tweens.killTweensOf(o); this.tweens.add({ targets: o, x: 1500, duration: 900 }); });
      this.bubble.setVisible(false);
      // Bonk! The zombie goes spinning off the lawn.
      this.sfx.boing();
      await this.tween({ targets: z, x: z.x + 240, y: z.y - 260, angle: 540, alpha: 0, scale: 0.6, duration: 650, ease: 'Quad.Out' });
      await this.letterSound(g);
      await this.praise(res.firstTry);
      zs.forEach(o => o.destroy());
      this.progress();
    }
  }
}
