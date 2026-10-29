// Friends — letter-sound to initial sound: the Letter Monster only eats things that
// start with the sound on its tummy.
import Phaser from 'phaser';
import { BaseGame, type GameMeta } from './BaseGame';
import { GRAPHEMES } from '../data/curriculum';
import { canStartWord, picsStartingWith, picsNotStartingWith } from '../choices';
import { shuffle, pickOne } from '../learner';
import * as audio from '../audio';
import { burst, emoji, picture, sprite, text } from '../widgets';

export const meta: GameMeta = {
  id: 'monster',
  theme: 'friends',
  skill: 'grapheme',
  title: 'Letter Monster — feed it pictures starting with its sound',
  intro: "I'm the Letter Monster, and I'm hungry! Feed me things that start with my sound.",
  icon: 'monsterHappy',
  eligible: () => true,
};

const MOUTH = { x: 1000, y: 380 };

export class Monster extends BaseGame {
  private monster!: Phaser.GameObjects.Image;
  private belly!: Phaser.GameObjects.Text;

  constructor() { super(meta); }

  protected setup() {
    this.add.image(640, 360, 'bgKitchen');
    this.add.ellipse(380, 600, 700, 90, 0xffffff, 0.8).setStrokeStyle(5, 0xd9a066);
    this.monster = sprite(this, 1000, 420, 'monster', 400);
    this.belly = text(this, 1000, 545, '', 80, '#ffffff').setStroke('#5a1a2a', 10);
    this.tweens.add({ targets: [this.monster, this.belly], y: '-=12', duration: 700, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
  }

  protected async run() {
    const n = this.rounds(6);
    const gs = this.learner.pick(['g'], n, { filter: g => canStartWord(g) && picsStartingWith(g).length > 0 });
    const nChoices = [2, 3, 3][this.tier];

    for (let r = 0; r < gs.length && !this.timeUp(); r++) {
      const g = gs[r];
      this.belly.setText(GRAPHEMES[g].label);
      this.monster.setTexture('monster');
      const answer = pickOne(picsStartingWith(g));
      const opts = shuffle([answer, ...picsNotStartingWith(g, nChoices - 1, this.tier)]);
      const cards = opts.map((w, i) => {
        const c = picture(this, 380 + (i - (opts.length - 1) / 2) * 220, 520, w, { size: 90 });
        // Small speaker: hear the picture's name.
        const spk = emoji(this, 62, -62, '🔊', 30).setInteractive({ useHandCursor: true });
        spk.on('pointerdown', (_p: unknown, _x: unknown, _y: unknown, e: Phaser.Types.Input.EventData) => { e.stopPropagation(); void audio.say(w); });
        c.add(spk);
        this.tweens.add({ targets: c, y: { from: 780, to: 520 }, duration: 400, delay: i * 90, ease: 'Back.Out' });
        return c;
      });

      let help = this.tier === 0;
      await this.prompt(async () => {
        await this.say(r === 0 ? 'Feed me things that start with' : pickOne(['I want something that starts with', 'Yum! Find', 'Feed me']));
        await this.letterSound(g);
        if (help) {
          await this.say(`like ${GRAPHEMES[g].key}`);
          for (const o of opts) await this.say(o);
        }
      });
      const res = await this.choose(cards, opts.indexOf(answer), {
        onWrong: () => {
          this.monster.setTexture('monsterYuck');
          void audio.say(pickOne(['Yuck!', 'Blech!', 'No thank you!']), { pitch: 0.8 });
          this.time.delayedCall(900, () => this.monster.setTexture('monster'));
        },
        onScaffold: () => { help = true; void this.letterSound(g).catch(() => {}); },
      });
      this.record('g:' + g, res.firstTry ? 'correct' : 'wrong');
      this.score(res.firstTry);

      const card = res.obj as Phaser.GameObjects.Container;
      cards.filter(c => c !== card).forEach(c => this.tweens.add({ targets: c, alpha: 0, duration: 250 }));
      await this.tween({ targets: card, x: MOUTH.x, y: MOUTH.y, scale: 0.2, duration: 500, ease: 'Cubic.In' });
      card.setVisible(false);
      this.sfx.chomp();
      this.monster.setTexture('monsterHappy');
      burst(this, MOUTH.x, MOUTH.y, ['😋', '✨', '💜']);
      await this.tween({ targets: this.monster, scale: this.monster.scale * 1.06, duration: 150, yoyo: true });
      await this.letterSound(g);
      await this.say(answer);
      await this.praise(res.firstTry);
      cards.forEach(c => c.destroy());
      this.progress();
    }
  }
}
