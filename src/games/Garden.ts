// Plants vs. Zombies — vowel focus: read a word on a seed packet and plant it in the pot
// with its vowel (cat → a, pig → i). A plant pops up when it's right.
import Phaser from 'phaser';
import { BaseGame, type GameMeta } from './BaseGame';
import { PIC } from '../data/curriculum';
import { shuffle, pickOne } from '../learner';
import { LINES } from '../lines';
import { shortVowel, vowelsAt } from '../choices';
import { WordView, burst, emoji, sprite, tappable, text } from '../widgets';

export const meta: GameMeta = {
  id: 'garden',
  theme: 'pvz',
  skill: 'word',
  title: 'Garden Sort — plant each word in the pot with its vowel',
  intro: LINES.intro.garden,
  icon: 'pot',
  eligible: lesson => vowelsAt(lesson).length >= 2,
};

const PLANTS = ['sunflower', 'peashooter', 'wallnut'];

export class Garden extends BaseGame {
  constructor() { super(meta); }

  protected setup() {
    this.add.image(640, 360, 'bgGarden');
    this.tickle(sprite(this, 120, 540, 'sunflower', 230));
  }

  protected async run() {
    const n = this.rounds(5);
    const vs = vowelsAt(this.lesson);
    const words = this.learner.pick(['w'], n, { filter: w => { const v = shortVowel(w); return !!v && vs.includes(v); } });
    const nPots = Math.min(vs.length, [2, 3, 3][this.tier]);

    for (let r = 0; r < words.length && !this.timeUp(); r++) {
      const w = words[r];
      const v = shortVowel(w)!;
      const potVowels = shuffle([v, ...shuffle(vs.filter(x => x !== v)).slice(0, nPots - 1)]);
      const pots = potVowels.map((pv, i) => {
        const c = this.add.container(640 + (i - (potVowels.length - 1) / 2) * 300, 575);
        c.add([sprite(this, 0, 0, 'pot', 190), text(this, 0, 20, pv, 90, '#ffffff').setStroke('#7a3414', 10)]);
        this.tweens.add({ targets: c, y: { from: 800, to: 575 }, duration: 380, delay: i * 80, ease: 'Back.Out' });
        return tappable(c, 210, 200);
      });

      // Seed packet with the word.
      const packet = this.add.container(640, 200);
      const g = this.add.graphics();
      g.fillStyle(0x000000, 0.15).fillRoundedRect(-205, -95, 420, 200, 22);
      g.fillStyle(0xfff8e1).fillRoundedRect(-210, -100, 420, 200, 22).lineStyle(6, 0x8d6e3f).strokeRoundedRect(-210, -100, 420, 200, 22);
      packet.add(g);
      const showPic = this.tier === 0 && PIC[w];
      packet.add(new WordView(this, showPic ? 50 : 0, 0, w, { size: 90 }));
      if (showPic) packet.add(emoji(this, -140, 0, PIC[w], 80));
      this.tweens.add({ targets: packet, angle: { from: -2, to: 2 }, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut' });

      await this.prompt(async () => {
        if (r === 0) await this.say(LINES.readAndPlant);
        else await this.say(LINES.whichPot);
        if (this.tier === 0) await this.say(w);
      });
      const res = await this.choose(pots, potVowels.indexOf(v), {
        scaffoldAfter: 1,
        onScaffold: () => { void this.say(w).then(() => this.letterSound(v)).catch(() => {}); },
      });
      this.record('w:' + w, res.firstTry ? 'correct' : 'wrong');
      this.score(res.firstTry);

      // Plant it!
      const pot = res.obj as Phaser.GameObjects.Container;
      this.tweens.killTweensOf(packet);
      await this.tween({ targets: packet, x: pot.x, y: pot.y - 60, scale: 0.15, angle: 20, duration: 450, ease: 'Cubic.In' });
      packet.destroy();
      this.sfx.grow();
      // Above the background, tucked behind the pot's rim.
      const plant = sprite(this, pot.x, pot.y - 150, pickOne(PLANTS), 170).setScale(0);
      pot.setDepth(1);
      await this.tween({ targets: plant, scale: 170 / plant.height, duration: 450, ease: 'Back.Out' });
      burst(this, pot.x, pot.y - 160, ['🌱', '✨', '🌻']);
      await this.say(w);
      await this.letterSound(v);
      await this.praise(res.firstTry);
      await this.wait(300);
      [...pots, plant].forEach(o => o.destroy());
      this.progress();
    }
  }
}
