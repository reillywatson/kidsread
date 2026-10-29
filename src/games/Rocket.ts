// Friends — goal game: build a rocket for the Letter Monster. See a picture, hear its name,
// and tap the letter it starts with (sound to letter). Each right answer adds a rocket part;
// when it's built, the monster climbs in, the countdown runs, and it blasts off to the moon.
import Phaser from 'phaser';
import { BaseGame, type GameMeta } from './BaseGame';
import { GRAPHEMES } from '../data/curriculum';
import { canStartWord, graphemeDistractors, picsStartingWithLetter } from '../choices';
import { pickOne, shuffle } from '../learner';
import * as audio from '../audio';
import { LINES } from '../lines';
import { burst, emoji, picture, sprite, tappable, text } from '../widgets';

export const meta: GameMeta = {
  id: 'rocket',
  theme: 'friends',
  skill: 'spelling',
  title: 'Rocket Builder — tap the first letter of each picture',
  intro: LINES.intro.rocket,
  icon: 'monsterHappy',
  eligible: () => true,
  goal: true,
};

const RX = 960;
const PAD_Y = 640;
const PW = 150;

/** Rocket parts, bottom to top: [height, draw(g, top)] in rocket-local coordinates. */
const PARTS: [number, (g: Phaser.GameObjects.Graphics, y: number) => void][] = [
  [70, (g, y) => { // fins and nozzle
    g.fillStyle(0xe53935).fillTriangle(-PW / 2, y, -PW / 2 - 50, y + 70, -PW / 2, y + 70).fillTriangle(PW / 2, y, PW / 2 + 50, y + 70, PW / 2, y + 70);
    g.fillStyle(0x90a4ae).fillRoundedRect(-PW / 2, y, PW, 70, 10);
    g.fillStyle(0x607d8b).fillRect(-35, y + 58, 70, 12);
  }],
  [70, (g, y) => { g.fillStyle(0xf5f5f5).fillRect(-PW / 2, y, PW, 70); g.fillStyle(0xe53935).fillRect(-PW / 2, y + 26, PW, 18); }],
  [80, (g, y) => { // window
    g.fillStyle(0xf5f5f5).fillRect(-PW / 2, y, PW, 80);
    g.fillStyle(0x90a4ae).fillCircle(0, y + 40, 32);
    g.fillStyle(0x81d4fa).fillCircle(0, y + 40, 25);
    g.fillStyle(0xffffff, 0.6).fillCircle(-9, y + 31, 8);
  }],
  [60, (g, y) => { g.fillStyle(0xf5f5f5).fillRect(-PW / 2, y, PW, 60); g.fillStyle(0x42a5f5).fillRect(-PW / 2, y + 20, PW, 16); }],
  [90, (g, y) => { g.fillStyle(0xe53935).fillTriangle(-PW / 2, y + 90, PW / 2, y + 90, 0, y); g.fillStyle(0xffffff, 0.35).fillTriangle(-20, y + 80, -6, y + 80, -8, y + 30); }],
  [50, (g, y) => { g.lineStyle(5, 0x607d8b).lineBetween(0, y + 50, 0, y + 6); g.fillStyle(0xffd21f).fillCircle(0, y + 6, 10); }],
];

export class Rocket extends BaseGame {
  private rocket!: Phaser.GameObjects.Container;
  private monster!: Phaser.GameObjects.Image;

  constructor() { super(meta); }

  protected setup() {
    this.add.image(640, 360, 'bgSky');
    emoji(this, 720, 90, '🌙', 90);
    const pad = this.add.graphics();
    pad.fillStyle(0x546e7a).fillRect(RX - 140, PAD_Y, 280, 24);
    pad.fillStyle(0x78909c).fillRect(RX - 120, PAD_Y + 24, 20, 56).fillRect(RX + 100, PAD_Y + 24, 20, 56);
    this.rocket = this.add.container(RX, 0);
    this.monster = this.tickle(sprite(this, 1150, 560, 'monsterHappy', 170));
  }

  private tile(g: string) {
    const c = this.add.container(0, 0);
    const gr = this.add.graphics();
    gr.fillStyle(0x000000, 0.18).fillRoundedRect(-60 + 3, -60 + 7, 120, 120, 20);
    gr.fillStyle(0xffe082).fillRoundedRect(-60, -60, 120, 120, 20);
    gr.lineStyle(5, 0xf4a100).strokeRoundedRect(-60, -60, 120, 120, 20);
    c.add([gr, text(this, 0, 0, GRAPHEMES[g].label, 72)]);
    return tappable(c, 120, 120);
  }

  protected async run() {
    const n = this.rounds(5);
    const gs = this.learner.pick(['g'], n, { filter: g => canStartWord(g) && picsStartingWithLetter(g).length > 0 });
    const nChoices = [2, 3, 3][this.tier];
    let top = PAD_Y;

    for (let r = 0; r < gs.length && !this.timeUp(); r++) {
      const g = gs[r];
      const word = pickOne(picsStartingWithLetter(g));
      const card = picture(this, 420, 220, word, { size: 110 }).setScale(0);
      this.tweens.add({ targets: card, scale: 1, duration: 300, ease: 'Back.Out' });
      const opts = shuffle([g, ...graphemeDistractors(g, nChoices - 1, this.tier, this.lesson)]);
      const tiles = opts.map((x, i) => {
        const t = this.tile(x).setPosition(420 + (i - (opts.length - 1) / 2) * 170, 520);
        this.tweens.add({ targets: t, y: { from: 800, to: 520 }, duration: 350, delay: i * 70, ease: 'Back.Out' });
        return t;
      });

      let helped = false;
      await this.prompt(async () => {
        if (r === 0) await this.say(LINES.firstLetter);
        await this.say(word);
      });
      const res = await this.choose(tiles, opts.indexOf(g), {
        onWrong: (_o, i) => { void audio.sound(opts[i]); },
        onScaffold: () => { helped = true; void this.letterSound(g).catch(() => {}); },
      });
      this.record('g:' + g, res.firstTry && !helped ? 'correct' : res.firstTry ? 'help' : 'wrong');
      this.score(res.firstTry);

      // The letter becomes the next rocket part, which drops into place.
      tiles.filter(t => t !== res.obj).forEach(t => this.tweens.add({ targets: t, alpha: 0, duration: 200 }));
      await this.tween({ targets: res.obj, x: RX, y: top - 40, scale: 0.3, alpha: 0, duration: 400, ease: 'Cubic.In' });
      const [h, draw] = PARTS[Math.min(r, PARTS.length - 1)];
      top -= h;
      const part = this.add.graphics();
      draw(part, top);
      part.y = -260;
      this.rocket.add(part);
      this.sfx.hammer();
      await this.tween({ targets: part, y: 0, duration: 450, ease: 'Bounce.Out' });
      burst(this, RX, top + h / 2, ['✨', '⭐', '🔧'], 8);
      await this.letterSound(g);
      await this.say(word);
      await this.praise(res.firstTry);
      [card, ...tiles].forEach(o => o.destroy());
    }

    // Finish any missing parts (if time ran out), put the monster in, and blast off.
    for (let r = gs.length; r < 5; r++) {
      const [h, draw] = PARTS[r];
      top -= h;
      const part = this.add.graphics();
      draw(part, top);
      this.rocket.add(part);
    }
    const windowY = PAD_Y - PARTS[0][0] - PARTS[1][0] - 40;
    await this.tween({ targets: this.monster, x: RX, y: windowY, scale: (60 / this.monster.height), duration: 700, ease: 'Quad.InOut' });
    this.monster.setDepth(1);
    this.rocket.add(this.monster.setPosition(0, windowY));
    this.monster.disableInteractive();
    await this.say(LINES.blastOff);
    this.sfx.launch();
    const flame = emoji(this, 0, PAD_Y + 30, '🔥', 90).setAngle(180);
    this.rocket.add(flame);
    this.tweens.add({ targets: flame, scale: { from: 0.8, to: 1.3 }, duration: 90, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: this.rocket, x: { from: RX - 4, to: RX + 4 }, duration: 50, yoyo: true, repeat: 10 });
    const smoke = this.time.addEvent({
      delay: 80, repeat: 18, callback: () => {
        const p = emoji(this, RX + (Math.random() - 0.5) * 120, this.rocket.y + PAD_Y + 60, '💨', 60);
        this.tweens.add({ targets: p, alpha: 0, scale: 2, y: p.y + 40, duration: 900, onComplete: () => p.destroy() });
      },
    });
    await this.wait(500);
    await this.tween({ targets: this.rocket, y: -900, duration: 1600, ease: 'Quad.In' });
    smoke.remove();
    this.sfx.fanfare();
    burst(this, 720, 90, ['⭐', '🌟', '✨'], 20);
    await this.wait(600);
  }
}
