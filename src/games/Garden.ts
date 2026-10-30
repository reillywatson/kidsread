// Plants vs. Zombies — vowel focus: read a word on a seed packet and plant it in the pot
// with its vowel (cat → a, pig → i). A plant pops up when it's right, then moves to the garden
// bed by the fence with its word on a stake. At the end it's harvest time: each plant bounces as
// its word is read back, and the sunflowers send up suns.
import Phaser from 'phaser';
import { BaseGame, type GameMeta } from './BaseGame';
import { PIC } from '../data/curriculum';
import { shuffle } from '../learner';
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
/** Garden bed spots along the fence, kept clear of the seed packet in the middle. */
const BED = [[250, 345], [1030, 345], [355, 345], [925, 345], [145, 345], [1135, 345]];

export class Garden extends BaseGame {
  private bed: { plant: Phaser.GameObjects.Image; stake: Phaser.GameObjects.Container; word: string }[] = [];

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
      const plant = sprite(this, pot.x, pot.y - 150, PLANTS[r % PLANTS.length], 170).setScale(0);
      pot.setDepth(1);
      await this.tween({ targets: plant, scale: 170 / plant.height, duration: 450, ease: 'Back.Out' });
      burst(this, pot.x, pot.y - 160, ['🌱', '✨', '🌻']);
      await this.say(w);
      await this.letterSound(v);
      await this.praise(res.firstTry);
      await this.wait(300);
      pots.forEach(o => o.destroy());
      await this.toBed(plant, w);
      this.progress();
    }
    await this.harvest();
  }

  /** The plant hops over to its spot in the garden bed, and a stake with its word goes in. */
  private async toBed(plant: Phaser.GameObjects.Image, word: string) {
    const [x, y] = BED[this.bed.length % BED.length];
    this.sfx.hop();
    await this.tween({ targets: plant, x, y, scale: 120 / plant.height, duration: 500, ease: 'Sine.InOut' });
    const label = text(this, 0, 0, word, 28, '#5d3a1a');
    const w = label.width + 20;
    const g = this.add.graphics();
    g.fillStyle(0x8d6e3f).fillRect(-3, 0, 6, 18);
    g.fillStyle(0xfff8e1).fillRoundedRect(-w / 2, -22, w, 34, 8).lineStyle(3, 0x8d6e3f).strokeRoundedRect(-w / 2, -22, w, 34, 8);
    const stake = this.add.container(x, y + 72, [g, label.setY(-5)]);
    this.tweens.add({ targets: stake, scale: { from: 0, to: 1 }, duration: 250, ease: 'Back.Out' });
    this.tickle(plant, () => void this.say(word).catch(() => {}));
    this.bed.push({ plant, stake, word });
  }

  /** Harvest time: every plant bounces as its word is read back; sunflowers send up suns. */
  private async harvest() {
    for (const { plant, stake, word } of this.bed) {
      this.sfx.pop();
      this.tweens.add({ targets: [plant, stake], y: '-=30', duration: 180, yoyo: true, ease: 'Quad.Out' });
      if (plant.texture.key.startsWith('sunflower')) {
        const sun = sprite(this, plant.x, plant.y - 40, 'sun', 70);
        this.sfx.twinkle();
        this.tweens.add({ targets: sun, y: sun.y - 260, alpha: 0, duration: 1100, ease: 'Sine.Out', onComplete: () => sun.destroy() });
      }
      await this.say(word);
    }
    if (this.bed.length) burst(this, 640, 330, ['🌻', '🌱', '✨'], 18);
  }
}
