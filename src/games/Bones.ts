// Paw Patrol — phonemic segmentation (no reading): hear a word, give Rubble one bone
// for each sound. Then the bones fly over one at a time as each sound plays (s-u-n).
import Phaser from 'phaser';
import { BaseGame, type GameMeta } from './BaseGame';
import { PIC, WORD_LESSON, segment } from '../data/curriculum';
import { countable, soundCount } from '../choices';
import { pickOne, shuffle } from '../learner';
import { LINES } from '../lines';
import * as audio from '../audio';
import { burst, picture, sprite, tappable } from '../widgets';

export const meta: GameMeta = {
  id: 'bones',
  theme: 'paw',
  skill: 'phonemic',
  title: "Rubble's Bones — count the sounds in a word",
  intro: LINES.intro.bones,
  icon: 'bone',
  eligible: () => true,
};

export class Bones extends BaseGame {
  private rubble!: Phaser.GameObjects.Image;

  constructor() { super(meta); }

  protected setup() {
    this.add.image(640, 360, 'bgBay');
    this.rubble = this.tickle(sprite(this, 160, 470, 'pup-rubble', 310), () => void audio.say(LINES.ruff, { style: 'pup' }));
    this.add.ellipse(160, 640, 200, 50, 0xb0bec5).setStrokeStyle(5, 0x546e7a);
  }

  protected async run() {
    const n = this.rounds(5);
    const range = [[2, 3], [3, 4], [3, 5]][this.tier];
    // Listening only, so any picture word works — slightly ahead of the lesson is fine.
    const words = shuffle(Object.keys(PIC).filter(w =>
      countable(w) && WORD_LESSON[w] <= this.lesson + 20 && soundCount(w) >= range[0] && soundCount(w) <= range[1])).slice(0, n);
    const nChoices = [2, 3, 3][this.tier];

    for (let r = 0; r < words.length && !this.timeUp(); r++) {
      const w = words[r];
      const count = soundCount(w);
      const counts = shuffle([count, ...shuffle([2, 3, 4, 5].filter(c => c !== count))
        .sort((a, b) => Math.abs(a - count) - Math.abs(b - count)).slice(0, nChoices - 1)]);
      const card = picture(this, 700, 190, w, { size: 100 });
      const piles = counts.map((c, i) => {
        const p = this.add.container(700 + (i - (counts.length - 1) / 2) * 280, 520);
        const g = this.add.graphics();
        g.fillStyle(0xffffff, 0.85).fillRoundedRect(-120, -95, 240, 190, 26).lineStyle(5, 0xffc94d).strokeRoundedRect(-120, -95, 240, 190, 26);
        p.add(g);
        for (let k = 0; k < c; k++) p.add(sprite(this, 0, c === 1 ? 0 : -66 + (k * 132) / (c - 1), 'bone', 46).setAngle(k % 2 ? 6 : -6));
        this.tweens.add({ targets: p, y: { from: 780, to: 520 }, duration: 380, delay: i * 80, ease: 'Back.Out' });
        return tappable(p, 240, 190);
      });

      const model = async () => {
        for (const t of segment(w)) if (t.g) { await this.letterSound(t.g); await this.wait(150); }
        await this.say(w);
      };
      await this.prompt(async () => {
        await this.say(LINES.howManySounds);
        await this.say(w);
      });
      const res = await this.choose(piles, counts.indexOf(count), {
        scaffoldAfter: 1,
        onScaffold: () => { void model().catch(() => {}); },
      });
      this.learner.pushRecent('phonemic', res.firstTry);
      this.score(res.firstTry);

      // Bones go to Rubble one sound at a time.
      piles.filter(p => p !== res.obj).forEach(p => this.tweens.add({ targets: p, alpha: 0, duration: 250 }));
      const pile = res.obj as Phaser.GameObjects.Container;
      const bones = pile.list.slice(1) as Phaser.GameObjects.Image[];
      const toks = segment(w).filter(t => t.g);
      for (let k = 0; k < bones.length; k++) {
        const b = bones[k];
        const m = b.getWorldTransformMatrix();
        pile.remove(b);
        this.add.existing(b);
        b.setPosition(m.tx, m.ty);
        this.sfx.pop();
        this.tweens.add({ targets: b, x: 160 + (k - (bones.length - 1) / 2) * 30, y: 630, angle: 0, duration: 350, ease: 'Quad.Out' });
        await this.letterSound(toks[k].g!);
      }
      await this.say(w);
      // Rubble crunches the bones and does a happy dance.
      this.sfx.chomp();
      this.children.list.filter(o => o instanceof Phaser.GameObjects.Image && o.texture.key === 'bone')
        .forEach(o => this.tweens.add({ targets: o, x: this.rubble.x, y: this.rubble.y - 40, scale: 0, duration: 300, ease: 'Cubic.In' }));
      this.sfx.bark();
      this.tweens.add({ targets: this.rubble, y: this.rubble.y - 40, duration: 200, yoyo: true, repeat: 1 });
      this.tweens.add({ targets: this.rubble, angle: { from: -8, to: 8 }, duration: 120, yoyo: true, repeat: 3, onComplete: () => { this.rubble.angle = 0; } });
      burst(this, 160, 560, ['🦴', '⭐', '🐾']);
      if (Math.random() < 0.4) await this.say(LINES.ruff, 'pup');
      await this.praise(res.firstTry);
      this.children.list.filter(o => o instanceof Phaser.GameObjects.Image && o.texture.key === 'bone').forEach(o => o.destroy());
      [card, ...piles].forEach(o => o.destroy());
      this.progress();
    }
    if (words.length) await this.say(pickOne(LINES.praise));
  }
}
