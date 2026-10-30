// Base class for every minigame. Handles the HUD (home, replay, progress track, power meter),
// the ~45-second time box, abort-on-exit, scoring, scaffolded choices and recording results,
// and the fun layer every game shares: streak power-ups, idle nudges, tap sparkles,
// tickleable characters and a trophy finale.
import Phaser from 'phaser';
import * as audio from '../audio';
import { playMusic } from '../music';
import { LINES } from '../lines';
import { GRAPHEMES, HEART } from '../data/curriculum';
import * as state from '../state';
import type { Session } from '../session';
import { pickOne, type Result, type Skill, type Tier } from '../learner';
import { H, W, burst, confetti, emoji, roundButton, sprite, text, tweenP, wiggle, type Tappable, type WordView } from '../widgets';

export type Theme = 'pvz' | 'pokemon' | 'paw' | 'friends';

export interface GameMeta {
  id: string;
  theme: Theme;
  skill: Skill;
  /** For the grown-up screen. */
  title: string;
  /** Spoken when the game starts. Kids never need to read. */
  intro: string;
  /** Texture key for the game's icon. */
  icon: string;
  eligible: (lesson: number) => boolean;
  /**
   * Bonus games are just for fun: they pop up now and then during a session (see session.ts),
   * can't be chosen directly, always give 3 stars, and don't touch learning progress.
   */
  bonus?: boolean;
  /**
   * Goal games show their own progress (a boss's health, a path across a river, a ladder,
   * a rocket), so they skip the progress track and trophy.
   */
  goal?: boolean;
}

export class Aborted extends Error { constructor() { super('aborted'); this.name = 'Aborted'; } }

const TIME_BOX = 50_000;
/** Right answers in a row that fill the power meter. */
const POWER = 3;
const POWER_ICON: Record<Theme, string> = { pvz: '☀️', pokemon: '⚡', paw: '🐾', friends: '⭐' };
const TRACK_Y = 46;
/** Seconds without a tap before the prompt is repeated. */
const IDLE = 8;

export abstract class BaseGame extends Phaser.Scene {
  session!: Session;
  tier: Tier = 0;
  lesson = 1;
  get learner() { return state.learner; }
  sfx = audio.sfx;
  private ctl = new AbortController();
  private right = 0;
  private total = 0;
  private done = 0;
  private t0 = 0;
  private dots: Phaser.GameObjects.Arc[] = [];
  private replayFn: (() => Promise<void>) | null = null;
  private streak = 0;
  private meter: Phaser.GameObjects.Text[] = [];
  private runner: Phaser.GameObjects.Image | null = null;
  private trophy: Phaser.GameObjects.Text | null = null;

  constructor(public meta: GameMeta) { super(meta.id); }

  init(data: { session: Session }) { this.session = data.session; }

  /** Draw the background and static scenery. */
  protected abstract setup(): void;
  /** Play the rounds. */
  protected abstract run(): Promise<void>;

  create() {
    this.cameras.main.fadeIn(220, 255, 255, 255);
    this.ctl = new AbortController();
    this.right = this.total = this.done = 0;
    this.dots = [];
    this.replayFn = null;
    this.streak = 0;
    this.meter = [];
    this.runner = this.trophy = null;
    this.tier = this.learner.tier(this.meta.skill);
    this.lesson = this.learner.lesson;
    playMusic(this.meta.theme);
    audio.preload([this.meta.intro, ...LINES.praise]);
    this.events.once('shutdown', () => { this.ctl.abort(); audio.stop(); });
    this.setup();
    roundButton(this, 60, 56, 40, 0xff7043, '🏠', () => this.session.quit(this)).setDepth(900);
    roundButton(this, W - 60, 56, 40, 0x42a5f5, '👂', () => { void this.replayFn?.().catch(() => {}); }).setDepth(900);
    if (!this.meta.bonus) this.powerMeter();
    this.tapSparkles();
    // Not this.time.now: the scene clock is stale until its first update.
    this.t0 = performance.now();
    (async () => {
      if (this.meta.bonus) await this.bonusBanner();
      await this.say(this.meta.intro);
      await this.run();
      if (!this.meta.bonus) await this.finale();
      this.finish();
    })().catch(e => { if (!(e instanceof Aborted)) throw e; });
  }

  get signal() { return this.ctl.signal; }

  private async bonusBanner() {
    const c = this.add.container(W / 2, H / 2).setDepth(950);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.2).fillRoundedRect(-300, -82, 600, 180, 40);
    g.fillStyle(0xffd21f).fillRoundedRect(-300, -90, 600, 180, 40);
    g.lineStyle(10, 0xffffff).strokeRoundedRect(-300, -90, 600, 180, 40);
    c.add([g, sprite(this, -210, 0, 'star', 110), sprite(this, 210, 0, 'star', 110), text(this, 0, 0, 'BONUS!', 96, '#e53935').setStroke('#ffffff', 12)]);
    c.setScale(0);
    this.sfx.fanfare();
    await this.tween({ targets: c, scale: 1, angle: { from: -12, to: 0 }, duration: 450, ease: 'Back.Out' });
    burst(this, W / 2, H / 2, ['⭐', '🎉', '✨'], 24);
    await this.say(LINES.bonus);
    await this.tween({ targets: c, scale: 0, alpha: 0, duration: 300, ease: 'Back.In' });
    c.destroy();
  }

  /** For bonus games: a shrinking timer bar across the top; resolves when time runs out. */
  playFor(seconds: number) {
    const bw = 520, x0 = W / 2 - bw / 2;
    this.add.rectangle(W / 2, 40, bw + 8, 26, 0xffffff, 0.85).setStrokeStyle(4, 0x2b2b2b, 0.4).setDepth(900);
    const bar = this.add.rectangle(x0, 40, bw, 18, 0x43c35e).setOrigin(0, 0.5).setDepth(901);
    return this.tween({ targets: bar, scaleX: 0, duration: seconds * 1000, ease: 'Linear',
      onUpdate: () => bar.setFillStyle(bar.scaleX < 0.25 ? 0xffb300 : 0x43c35e) });
  }

  /** A score counter (icon + number) in the top bar; returns a function that adds a point. */
  scoreCounter(texture: string) {
    const c = this.add.container(W / 2 + 330, 40).setDepth(900);
    const label = text(this, 30, 0, '0', 40);
    c.add([this.add.rectangle(15, 0, 120, 56, 0xffffff, 0.85).setStrokeStyle(4, 0xffc94d), sprite(this, -22, 0, texture, 40), label]);
    let n = 0;
    return () => {
      label.setText(String(++n));
      this.tweens.add({ targets: c, scale: { from: 1.25, to: 1 }, duration: 250, ease: 'Back.Out' });
      return n;
    };
  }

  /**
   * Number of rounds for this game at the current tier. Also draws the progress track: stepping
   * stones with the game's character hopping along them toward a trophy.
   */
  rounds(base: number) {
    const n = base + (this.tier === 2 ? 1 : 0);
    if (this.meta.goal) return n;
    const gap = 40;
    const x0 = W / 2 - ((n - 1) * gap) / 2;
    this.dots = Array.from({ length: n }, (_, i) =>
      this.add.circle(x0 + i * gap, TRACK_Y, 11, 0xffffff, 0.6).setStrokeStyle(3, 0x2b2b2b, 0.4).setDepth(900));
    this.trophy = emoji(this, x0 + n * gap + 8, TRACK_Y, '🏆', 38).setDepth(900);
    this.runner = sprite(this, x0 - gap, TRACK_Y - 8, this.meta.icon, 46).setDepth(901);
    return n;
  }

  timeUp() { return performance.now() - this.t0 > TIME_BOX; }

  progress() {
    const d = this.dots[this.done++];
    if (!d) return;
    d.setFillStyle(0xffd21f, 1);
    this.tweens.add({ targets: d, scale: { from: 1.8, to: 1 }, duration: 300 });
    if (this.runner) this.hop(this.runner, d.x);
  }

  private hop(obj: Phaser.GameObjects.Image, x: number) {
    this.sfx.hop();
    this.tweens.add({ targets: obj, x, duration: 360, ease: 'Sine.InOut' });
    return this.tween({ targets: obj, y: TRACK_Y - 30, duration: 180, yoyo: true, ease: 'Quad.Out' });
  }

  /** The runner reaches the trophy, which grows to fill the screen. */
  private async finale() {
    if (!this.runner || !this.trophy) return;
    await this.hop(this.runner, this.trophy.x - 30);
    const big = emoji(this, this.trophy.x, this.trophy.y, '🏆', 220).setDepth(960).setScale(38 / 220);
    this.trophy.setVisible(false);
    this.sfx.fanfare();
    await this.tween({ targets: big, x: W / 2, y: H / 2, scale: 1, angle: { from: -20, to: 0 }, duration: 600, ease: 'Back.Out' });
    burst(this, W / 2, H / 2, ['⭐', '🎉', '✨'], 24);
    confetti(this, 80);
    await this.tween({ targets: big, angle: { from: -8, to: 8 }, duration: 160, yoyo: true, repeat: 3 });
    await this.wait(500);
  }

  // ---- the fun layer ----

  /** Three slots that light up with each right answer in a row; when full, a power-up. */
  private powerMeter() {
    const x = W - 196;
    const g = this.add.graphics().setDepth(899);
    g.fillStyle(0xffffff, 0.8).fillRoundedRect(x - 78, 56 - 30, 156, 60, 30).lineStyle(4, 0xffc94d).strokeRoundedRect(x - 78, 56 - 30, 156, 60, 30);
    this.meter = [-1, 0, 1].map(i => emoji(this, x + i * 46, 56, POWER_ICON[this.meta.theme], 32).setAlpha(0.22).setDepth(900));
  }

  private showMeter(lit: number) {
    this.meter.forEach((m, i) => {
      const on = i < lit;
      if (on && m.alpha < 1) this.tweens.add({ targets: m, scale: { from: 1.8, to: 1 }, duration: 300, ease: 'Back.Out' });
      m.setAlpha(on ? 1 : 0.22);
    });
  }

  /** Big theme-flavored celebration when the power meter fills. */
  private async powerUp() {
    this.sfx.power();
    audio.buzz([40, 60, 40, 60, 80]);
    this.cameras.main.shake(350, 0.008);
    this.cameras.main.flash(250, 255, 255, 210);
    confetti(this, 70);
    const theme = this.meta.theme;
    if (theme === 'pvz') {
      // A volley of peas across every lane.
      for (let k = 0; k < 9; k++) {
        const pea = sprite(this, -40, 170 + (k % 3) * 190 + Math.random() * 40, 'pea', 54).setDepth(990);
        this.tweens.add({ targets: pea, x: W + 60, duration: 650, delay: k * 90, onStart: () => this.sfx.pew(), onComplete: () => pea.destroy() });
      }
    } else if (theme === 'pokemon') {
      // Pikachu zips across under a shower of lightning.
      const p = sprite(this, -160, H / 2, 'pikachu', 260).setDepth(990);
      this.sfx.zap();
      this.tweens.add({ targets: p, x: W + 160, duration: 1300, ease: 'Sine.InOut', onComplete: () => p.destroy() });
      this.tweens.add({ targets: p, y: H / 2 - 90, duration: 325, yoyo: true, repeat: 1, ease: 'Sine.Out' });
      for (let k = 0; k < 12; k++) {
        const b = emoji(this, Math.random() * W, -60, '⚡', 70).setDepth(991);
        this.tweens.add({ targets: b, y: H + 60, duration: 700 + Math.random() * 500, delay: k * 60, onComplete: () => b.destroy() });
      }
    } else if (theme === 'paw') {
      // The pup truck races by, leaving paw prints.
      const truck = sprite(this, -260, H - 110, 'truck', 150).setDepth(990);
      this.sfx.siren();
      let last = -999;
      this.tweens.add({
        targets: truck, x: W + 260, duration: 1400, ease: 'Sine.InOut', onComplete: () => truck.destroy(),
        onUpdate: () => {
          if (truck.x - last < 90) return;
          last = truck.x;
          const pr = emoji(this, truck.x - 110, H - 60, '🐾', 40).setDepth(989);
          this.tweens.add({ targets: pr, alpha: 0, duration: 900, delay: 300, onComplete: () => pr.destroy() });
        },
      });
    } else {
      // A rainbow, and the Letter Monster bouncing up to cheer.
      const rb = emoji(this, W / 2, H / 2, '🌈', 260).setDepth(990).setScale(0);
      this.tweens.add({ targets: rb, scale: 1.4, duration: 500, ease: 'Back.Out', yoyo: true, hold: 500, onComplete: () => rb.destroy() });
      const m = sprite(this, W / 2, H + 200, 'monsterHappy', 300).setDepth(991);
      this.tweens.add({ targets: m, y: H - 130, duration: 400, ease: 'Back.Out', yoyo: true, hold: 600, onComplete: () => m.destroy() });
      burst(this, W / 2, H / 2, ['💜', '💖', '⭐'], 20);
    }
    await Promise.all([this.say(pickOne(LINES.streak)), this.wait(1300)]);
    this.showMeter(0);
  }

  /** Taps on empty space make a little twinkle, so every tap does something. */
  private tapSparkles() {
    let last = 0;
    this.input.on('pointerdown', (p: Phaser.Input.Pointer, over: unknown[]) => {
      if (over.length || performance.now() - last < 120) return;
      last = performance.now();
      this.sfx.twinkle();
      for (let i = 0; i < 5; i++) {
        const s = emoji(this, p.x, p.y, i % 2 ? '✨' : '⭐', 18 + Math.random() * 10).setDepth(1000);
        const a = (Math.PI * 2 * i) / 5 + Math.random() * 0.5;
        this.tweens.add({ targets: s, x: p.x + Math.cos(a) * 50, y: p.y + Math.sin(a) * 50, alpha: 0, duration: 450, ease: 'Cubic.Out', onComplete: () => s.destroy() });
      }
    });
  }

  /**
   * Make a character tickleable: tapping it gets a giggle, a wiggle and hearts, and sometimes
   * its catchphrase (only when nobody is talking, so it never talks over a prompt).
   */
  tickle(obj: Phaser.GameObjects.Image, line?: () => void) {
    obj.setInteractive({ useHandCursor: true });
    let busy = false;
    obj.on('pointerdown', () => {
      if (busy) return;
      busy = true;
      this.sfx.giggle();
      burst(this, obj.x, obj.y - obj.displayHeight * 0.3, ['💖', '✨', '⭐'], 6);
      this.tweens.add({ targets: obj, angle: { from: -10, to: 10 }, duration: 90, yoyo: true, repeat: 3, onComplete: () => { obj.angle = 0; busy = false; } });
      if (line && !audio.isSpeaking() && Math.random() < 0.5) line();
    });
    return obj;
  }

  /**
   * While waiting for an answer: after a while with no taps, repeat the prompt and give the
   * choices a little bounce (all of them, so it's a nudge, not a hint). Returns a stop function.
   */
  idleNudge(objs: Tappable[]) {
    let lastTap = performance.now(), nudges = 0;
    const tapped = () => { lastTap = performance.now(); };
    const dragged = (p: Phaser.Input.Pointer) => { if (p.isDown) tapped(); };
    this.input.on('pointerdown', tapped);
    this.input.on('pointermove', dragged);
    const timer = this.time.addEvent({
      delay: 1000, loop: true, callback: () => {
        if (nudges >= 3 || audio.isSpeaking() || performance.now() - lastTap < IDLE * 1000) return;
        lastTap = performance.now();
        nudges++;
        void this.replayFn?.().catch(() => {});
        objs.filter(o => o.active && o.alpha === 1).forEach((o, i) =>
          this.tweens.add({ targets: o, scale: { from: 1, to: 1.12 }, duration: 160, yoyo: true, delay: i * 140 }));
      },
    });
    const stop = () => { timer.remove(); this.input.off('pointerdown', tapped); this.input.off('pointermove', dragged); };
    this.signal.addEventListener('abort', stop, { once: true });
    return stop;
  }

  // ---- abort-aware async helpers ----
  guard<T>(p: Promise<T>): Promise<T> {
    const signal = this.signal;
    if (signal.aborted) return Promise.reject(new Aborted());
    return new Promise((resolve, reject) => {
      const ab = () => reject(new Aborted());
      signal.addEventListener('abort', ab, { once: true });
      p.then(v => { signal.removeEventListener('abort', ab); resolve(v); }, reject);
    });
  }
  say(t: string, style?: audio.Style) { return this.guard(audio.say(t, { style })); }
  /** "like apple" — the keyword for a letter sound. */
  async keyword(g: string) { await this.say(LINES.like); await this.say(GRAPHEMES[g].key); }
  letterSound(g: string) { return this.guard(audio.sound(g)); }
  wait(ms: number) { return this.guard(new Promise<void>(r => this.time.delayedCall(ms, r))); }
  tween(cfg: Phaser.Types.Tweens.TweenBuilderConfig) { return this.guard(tweenP(this, cfg)); }

  /** What the 👂 button replays. Runs it once now. */
  async prompt(fn: () => Promise<void>) {
    this.replayFn = fn;
    await fn();
  }

  /**
   * Wait for a tap on the correct object. Wrong taps wiggle and fade the choice. After
   * `scaffoldAfter` misses (or when only the answer is left) the answer pulses and
   * `onScaffold` runs — the child always finishes the round successfully.
   */
  choose(objs: Tappable[], correct: number | number[], { onWrong, onScaffold, scaffoldAfter = 2 }: {
    onWrong?: (obj: Tappable, i: number) => void; onScaffold?: () => void; scaffoldAfter?: number;
  } = {}): Promise<{ firstTry: boolean; misses: number; obj: Tappable }> {
    const ok = new Set(typeof correct === 'number' ? [correct] : correct);
    const first = [...ok][0];
    const stopIdle = this.idleNudge(objs);
    return this.guard(new Promise(resolve => {
      let misses = 0, done = false;
      const nope = new Set<number>();
      const handlers = objs.map((obj, i) => {
        const h = () => {
          if (done || nope.has(i)) return;
          if (ok.has(i)) {
            done = true;
            stopIdle();
            objs.forEach((o, j) => o.off('pointerdown', handlers[j]));
            ok.forEach(j => { this.tweens.killTweensOf(objs[j]); objs[j].setScale(1); });
            resolve({ firstTry: misses === 0, misses, obj });
            return;
          }
          misses++;
          nope.add(i);
          this.sfx.boing();
          wiggle(this, obj);
          obj.setAlpha(0.45);
          onWrong?.(obj, i);
          if (misses === scaffoldAfter || nope.size === objs.length - ok.size) {
            this.tweens.add({ targets: objs[first], scale: 1.12, duration: 400, yoyo: true, repeat: -1 });
            onScaffold?.();
          }
        };
        obj.on('pointerdown', h);
        return h;
      });
      // Dev hook for automated play-throughs: window.__answer() taps the right choice.
      if (import.meta.env.DEV) Object.assign(window, { __answer: () => objs[first].emit('pointerdown') });
    }));
  }

  record(id: string, result: Result) { this.learner.record(id, result, this.meta.skill); }

  /** Exposure for the other words of a sentence (everything but the word being tested). */
  sawWords(words: string[], except?: string) {
    for (const w of new Set(words)) if (w !== except) this.learner.record((HEART[w] ? 'h:' : 'w:') + w, 'seen');
  }

  /**
   * Read a sentence aloud, lighting up each word as it's said. A null view is a gap; `words`
   * supplies what to say there.
   */
  async readAloud(views: (WordView | null)[], words?: string[]) {
    for (let i = 0; i < views.length; i++) {
      const v = views[i];
      v?.setAllColor('#1e88e5');
      await this.say(v?.word ?? words?.[i] ?? '');
      v?.setAllColor('#2b2b2b');
    }
  }

  /** Count an answer. Right-first-time answers also build the streak that fills the power meter. */
  score(firstTry: boolean) {
    this.total++;
    if (firstTry) this.right++;
    this.streak = firstTry ? this.streak + 1 : 0;
    this.showMeter(this.streak === 0 ? 0 : ((this.streak - 1) % POWER) + 1);
  }

  /** After each round: a chime that climbs with the streak, and a power-up when the meter is full. */
  async praise(firstTry: boolean) {
    if (firstTry && this.streak > 0 && this.streak % POWER === 0) { await this.powerUp(); return; }
    this.sfx.chime(firstTry ? this.streak : 0);
    if (firstTry) audio.buzz(15);
    if (firstTry && this.streak > 0) this.sfx.charge(((this.streak - 1) % POWER) + 1);
    if (firstTry && Math.random() < 0.45) await this.say(pickOne(LINES.praise));
  }

  private finish() {
    if (this.meta.bonus) { this.session.gameDone(this, 3); return; }
    const acc = this.total ? this.right / this.total : 1;
    const stars = acc >= 0.9 ? 3 : acc >= 0.6 ? 2 : 1;
    this.learner.adjustTier(this.meta.skill);
    this.learner.checkLessonUp();
    this.session.gameDone(this, stars);
  }
}

export { W, H };
