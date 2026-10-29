// Base class for every minigame. Handles the HUD (home, replay, round dots), the
// ~45-second time box, abort-on-exit, scoring, scaffolded choices and recording results.
import Phaser from 'phaser';
import * as audio from '../audio';
import { learner } from '../state';
import type { Session } from '../session';
import { pickOne, type Result, type Skill, type Tier } from '../learner';
import { H, W, roundButton, tweenP, wiggle, type Tappable } from '../widgets';

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
}

export class Aborted extends Error { constructor() { super('aborted'); this.name = 'Aborted'; } }

const TIME_BOX = 50_000;
const PRAISE = ['Great job!', 'Awesome!', 'You did it!', 'Wow!', 'Super!', 'Yes!', 'Amazing!', 'Nice!'];

export abstract class BaseGame extends Phaser.Scene {
  session!: Session;
  tier: Tier = 0;
  lesson = 1;
  learner = learner;
  sfx = audio.sfx;
  private ctl = new AbortController();
  private right = 0;
  private total = 0;
  private done = 0;
  private t0 = 0;
  private dots: Phaser.GameObjects.Arc[] = [];
  private replayFn: (() => Promise<void>) | null = null;

  constructor(public meta: GameMeta) { super(meta.id); }

  init(data: { session: Session }) { this.session = data.session; }

  /** Draw the background and static scenery. */
  protected abstract setup(): void;
  /** Play the rounds. */
  protected abstract run(): Promise<void>;

  create() {
    this.ctl = new AbortController();
    this.right = this.total = this.done = 0;
    this.dots = [];
    this.replayFn = null;
    this.tier = learner.tier(this.meta.skill);
    this.lesson = learner.lesson;
    this.events.once('shutdown', () => { this.ctl.abort(); audio.stop(); });
    this.setup();
    roundButton(this, 60, 56, 40, 0xff7043, '🏠', () => this.session.quit(this)).setDepth(900);
    roundButton(this, W - 60, 56, 40, 0x42a5f5, '👂', () => { void this.replayFn?.().catch(() => {}); }).setDepth(900);
    // Not this.time.now: the scene clock is stale until its first update.
    this.t0 = performance.now();
    (async () => {
      await this.say(this.meta.intro);
      await this.run();
      this.finish();
    })().catch(e => { if (!(e instanceof Aborted)) throw e; });
  }

  get signal() { return this.ctl.signal; }

  /** Number of rounds for this game at the current tier; also draws the progress dots. */
  rounds(base: number) {
    const n = base + (this.tier === 2 ? 1 : 0);
    const gap = 34;
    this.dots = Array.from({ length: n }, (_, i) =>
      this.add.circle(W / 2 + (i - (n - 1) / 2) * gap, 40, 11, 0xffffff, 0.6).setStrokeStyle(3, 0x2b2b2b, 0.4).setDepth(900));
    return n;
  }

  timeUp() { return performance.now() - this.t0 > TIME_BOX; }

  progress() {
    const d = this.dots[this.done++];
    if (d) { d.setFillStyle(0xffd21f, 1); this.tweens.add({ targets: d, scale: { from: 1.8, to: 1 }, duration: 300 }); }
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
  say(t: string) { return this.guard(audio.say(t)); }
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
    return this.guard(new Promise(resolve => {
      let misses = 0, done = false;
      const nope = new Set<number>();
      const handlers = objs.map((obj, i) => {
        const h = () => {
          if (done || nope.has(i)) return;
          if (ok.has(i)) {
            done = true;
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

  record(id: string, result: Result) { learner.record(id, result, this.meta.skill); }

  score(firstTry: boolean) { this.total++; if (firstTry) this.right++; }

  async praise(firstTry: boolean) {
    this.sfx.ding();
    if (firstTry && Math.random() < 0.45) await this.say(pickOne(PRAISE));
  }

  private finish() {
    const acc = this.total ? this.right / this.total : 1;
    const stars = acc >= 0.9 ? 3 : acc >= 0.6 ? 2 : 1;
    learner.adjustTier(this.meta.skill);
    learner.checkLessonUp();
    this.session.gameDone(this, stars);
  }
}

export { W, H };
