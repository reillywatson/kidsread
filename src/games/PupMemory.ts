// Paw Patrol — memory match. Early on: letter ↔ keyword picture (m ↔ 🐵).
// Later: word ↔ picture and heart word ↔ heart word.
import Phaser from 'phaser';
import { BaseGame, type GameMeta } from './BaseGame';
import { GRAPHEMES, PIC, HEART, LESSONS } from '../data/curriculum';
import { readableWords } from '../choices';
import { shuffle, pickOne } from '../learner';
import { LINES } from '../lines';
import { PUP_NAMES } from '../art';
import { WordView, burst, emoji, sprite, tappable, text } from '../widgets';

export const meta: GameMeta = {
  id: 'pupmemory',
  theme: 'paw',
  skill: 'heart',
  title: 'Pup Match — memory with letters, words and heart words',
  intro: LINES.intro.pupmemory,
  icon: 'pawBadge',
  eligible: () => true,
};

interface Face { kind: 'letter' | 'pic' | 'word'; value: string; item: string; say: () => Promise<void> }

const CW = 170, CH = 200;

export class PupMemory extends BaseGame {
  constructor() { super(meta); }

  protected setup() {
    this.add.image(640, 360, 'bgBay');
    this.add.rectangle(640, 400, 1280, 640, 0xffffff, 0.35);
    const pupId = pickOne(PUP_NAMES);
    sprite(this, 110, 580, `pup-${pupId}`, 250);
  }

  private pairs(n: number): [Face, Face][] {
    const wordsOk = readableWords(this.lesson, { pic: true }).length >= n;
    const out: [Face, Face][] = [];
    if (wordsOk) {
      const hearts = this.learner.pick(['h'], Math.floor(n / 2));
      const uniqueHearts = [...new Set(hearts)];
      for (const h of uniqueHearts) {
        const f: Face = { kind: 'word', value: h, item: 'h:' + h, say: () => this.say(h) };
        out.push([f, { ...f }]);
      }
      const words = [...new Set(this.learner.pick(['w'], n * 2, { filter: w => !!PIC[w] }))];
      for (const w of words) {
        if (out.length >= n) break;
        if (out.some(([a]) => PIC[a.value] === PIC[w])) continue;
        out.push([
          { kind: 'word', value: w, item: 'w:' + w, say: () => this.say(w) },
          { kind: 'pic', value: w, item: 'w:' + w, say: () => this.say(w) },
        ]);
      }
    }
    if (out.length < n) {
      // Early on few letters are known; preview the next ones so there are enough pairs.
      const upcoming = LESSONS.filter(l => l.n > this.lesson).flatMap(l => l.g);
      const gs = [...new Set([...this.learner.pick(['g'], n * 2), ...upcoming])];
      for (const g of gs) {
        if (out.length >= n) break;
        const say = async () => { await this.letterSound(g); await this.say(GRAPHEMES[g].key); };
        out.push([{ kind: 'letter', value: g, item: 'g:' + g, say }, { kind: 'pic', value: GRAPHEMES[g].pic, item: 'g:' + g, say }]);
      }
    }
    return out.slice(0, n);
  }

  private drawFace(face: Face) {
    const c = this.add.container(0, 0);
    const g = this.add.graphics();
    g.fillStyle(0xffffff).fillRoundedRect(-CW / 2, -CH / 2, CW, CH, 22);
    g.lineStyle(6, 0x1e88e5).strokeRoundedRect(-CW / 2, -CH / 2, CW, CH, 22);
    c.add(g);
    if (face.kind === 'letter') c.add(text(this, 0, 0, GRAPHEMES[face.value].label, 96));
    else if (face.kind === 'word') c.add(new WordView(this, 0, 0, face.value, { size: face.value.length > 4 ? 44 : 56, dots: !HEART[face.value], tapSounds: false }));
    else c.add(emoji(this, 0, 0, PIC[face.value] || face.value, 96));
    return c;
  }

  protected async run() {
    const nPairs = [2, 3, 4][this.tier];
    const pairs = this.pairs(nPairs);
    this.rounds(pairs.length);
    const deck = shuffle(pairs.flatMap((p, i) => p.map(f => ({ f, pair: i }))));
    const cols = Math.min(4, Math.ceil(deck.length / 2));
    const rows = Math.ceil(deck.length / cols);
    const cards = deck.map((d, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const c = this.add.container(660 + (col - (cols - 1) / 2) * (CW + 30), 390 + (row - (rows - 1) / 2) * (CH + 30));
      const back = this.add.container(0, 0);
      const bg = this.add.graphics();
      bg.fillStyle(0x000000, 0.2).fillRoundedRect(-CW / 2 + 4, -CH / 2 + 8, CW, CH, 22);
      bg.fillStyle(0x1e88e5).fillRoundedRect(-CW / 2, -CH / 2, CW, CH, 22);
      bg.lineStyle(6, 0xffffff).strokeRoundedRect(-CW / 2, -CH / 2, CW, CH, 22);
      back.add([bg, sprite(this, 0, 0, 'pawBadge', 110)]);
      const front = this.drawFace(d.f).setVisible(false);
      c.add([back, front]);
      tappable(c, CW, CH);
      c.setData({ pair: d.pair, back, front, open: false, done: false, face: d.f });
      this.tweens.add({ targets: c, scale: { from: 0, to: 1 }, duration: 300, delay: i * 60, ease: 'Back.Out' });
      return c;
    });

    const flip = async (c: Phaser.GameObjects.Container, open: boolean) => {
      this.sfx.flip();
      await this.tween({ targets: c, scaleX: 0, duration: 120 });
      (c.getData('back') as Phaser.GameObjects.Container).setVisible(!open);
      (c.getData('front') as Phaser.GameObjects.Container).setVisible(open);
      c.setData('open', open);
      await this.tween({ targets: c, scaleX: 1, duration: 120 });
    };

    await this.prompt(async () => { await this.say(LINES.findPairs); });

    let matched = 0, misses = 0;
    while (matched < pairs.length && !this.timeUp()) {
      const picked: Phaser.GameObjects.Container[] = [];
      while (picked.length < 2) {
        const c = await new Promise<Phaser.GameObjects.Container>(resolve => {
          const handlers = cards.map(card => {
            const h = () => {
              if (card.getData('open') || card.getData('done')) return;
              cards.forEach((o, j) => o.off('pointerdown', handlers[j]));
              resolve(card);
            };
            card.on('pointerdown', h);
            return h;
          });
          this.signal.addEventListener('abort', () => cards.forEach((o, j) => o.off('pointerdown', handlers[j])), { once: true });
        });
        picked.push(c);
        await flip(c, true);
      }
      const [a, b] = picked;
      if (a.getData('pair') === b.getData('pair')) {
        matched++;
        a.setData('done', true); b.setData('done', true);
        this.score(misses === 0);
        this.learner.pushRecent(this.meta.skill, misses === 0);
        misses = 0;
        const face = a.getData('face') as Face;
        this.learner.record(face.item, 'seen');
        this.sfx.ding();
        this.sfx.bark();
        burst(this, (a.x + b.x) / 2, (a.y + b.y) / 2, ['🐾', '⭐', '🦴']);
        await Promise.all([a, b].map(c => this.tween({ targets: c, scale: 1.15, duration: 150, yoyo: true })));
        await face.say();
        this.progress();
        await Promise.all([a, b].map(c => this.tween({ targets: c, alpha: 0.35, duration: 250 })));
      } else {
        misses++;
        this.sfx.boing();
        await this.wait(900);
        await Promise.all([flip(a, false), flip(b, false)]);
      }
    }
    if (matched === pairs.length) await this.say(pickOne(LINES.foundAll), 'pup');
  }
}
