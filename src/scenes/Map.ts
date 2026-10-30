// Reading Island: the adventure map (lands and gates in data/map.ts). Lessons are stepping stones
// up a winding path through eight lands; the player's explorer stands on the current one, with
// the friends they've made. Coming back after moving up a lesson, the explorer hops forward.
// Each land ends at a gate won by playing a goal game; winning it opens the gate, a new friend
// joins, and the next land is welcomed. Treasure chests open with stars.
import Phaser from 'phaser';
import { learner, profile } from '../state';
import { GRAPHEMES, lessonInfo } from '../data/curriculum';
import { REGIONS, CHEST_STARS, lessonsOf, explorerAt, type Region, type MapState } from '../data/map';
import { nextSticker } from '../stickers';
import { Session } from '../session';
import { LINES } from '../lines';
import { pickOne } from '../learner';
import * as audio from '../audio';
import { playMusic } from '../music';
import { W, H, WordView, burst, confetti, emoji, glossyCircle, roundButton, sprite, tappable, text, wiggle } from '../widgets';

const STEP = 125;
const BANNER = 170;
const GATE = 190;
const BOTTOM = 300, TOP = 320;
/** A press that moves less than this is a tap, not a scroll. */
const TAP = 14;
const GATE_ICON = { rocket: '🚀', boss: '🧟', ladder: '🐱', river: '🌊' };
const LAND_ICON = { friends: 'monsterHappy', pvz: 'peashooter', paw: 'pupHead-chase', pokemon: 'pikachu' };

/** A place on the path: a lesson's stone, or a land's gate. */
interface Spot { key: string; x: number; y: number; land: Region; lesson?: number; gate?: boolean; obj?: Phaser.GameObjects.Container }

export class MapScene extends Phaser.Scene {
  private spots: Spot[] = [];
  private worldH = 0;
  private explorer!: Phaser.GameObjects.Image;
  private party: Phaser.GameObjects.Image[] = [];
  private glow?: Phaser.GameObjects.Container;
  private moved = 0;
  private busy = false;
  private alive = true;
  private starText!: Phaser.GameObjects.Text;

  constructor() { super('Map'); }

  private get state(): MapState { return (learner.s.map ??= { cleared: [], celebrated: [], chests: [] }); }

  create() {
    if (!profile) { this.scene.start('Profiles'); return; }
    this.cameras.main.fadeIn(250, 255, 255, 255);
    playMusic('home');
    this.alive = true;
    this.busy = false;
    this.events.once('shutdown', () => { this.alive = false; audio.stop(); });
    audio.preload([...LINES.mapHello, LINES.tapGlow, LINES.notYet, ...Object.values(LINES.gates)]);

    this.layout();
    this.drawLands();
    this.drawPath();
    this.drawSpots();
    this.drawChests();
    this.hud();
    this.scrolling();

    // Where they were last time (the intro then hops them forward to where they are now).
    const at = (this.state.at && this.spot(this.state.at)) || this.target();
    this.explorer = sprite(this, at.x, at.y - 62, profile.avatar, 96).setDepth(50);
    this.tweens.add({ targets: this.explorer, y: '-=8', duration: 700, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.cameras.main.centerOn(W / 2, at.y);
    this.drawParty(at);
    void this.intro();
  }

  // ---------- layout ----------

  /** Where everything goes, bottom (first lesson) to top (last). */
  private layout() {
    const spots: (Omit<Spot, 'y'> & { d: number })[] = [];
    let d = BOTTOM, i = 0;
    this.bands = [];
    for (const land of REGIONS) {
      const from = d;
      d += BANNER;
      for (const n of lessonsOf(land)) {
        d += STEP;
        spots.push({ key: 'L' + n, lesson: n, land, x: W / 2 + 320 * Math.sin(i++ * 0.72), d });
      }
      d += GATE;
      spots.push({ key: 'G' + land.id, gate: true, land, x: W / 2, d });
      this.bands.push({ land, from, to: d + 70 });
      // A strip of sea before the next land (each land is its own island; the path crosses over).
      d += 230;
    }
    this.worldH = d + TOP;
    this.spots = spots.map(s => ({ ...s, y: this.worldH - s.d }));
  }
  private bands: { land: Region; from: number; to: number }[] = [];
  private y(d: number) { return this.worldH - d; }

  private spot(key: string) { return this.spots.find(s => s.key === key); }

  /**
   * Where the explorer should be: the gate they're waiting at, or the current lesson's stone; once
   * every gate is won, the last gate, at the end of the journey (playing on from there is review).
   */
  private target(): Spot {
    if (REGIONS.every(r => this.state.cleared.includes(r.id))) return this.spot('G' + REGIONS[REGIONS.length - 1].id)!;
    const at = explorerAt(learner.lesson, this.state.cleared, learner.s.courseDone);
    return ('gate' in at ? this.spot('G' + at.gate.id) : this.spot('L' + at.lesson)) ?? this.spots[0];
  }

  // ---------- drawing ----------

  private drawLands() {
    const g = this.add.graphics();
    const rnd = new Phaser.Math.RandomDataGenerator(['reading-island']);
    // The sea all around.
    g.fillStyle(0x7fd3ff).fillRect(0, 0, W, this.worldH);
    for (const { land, from, to } of this.bands) {
      const [light, dark] = land.colors;
      const top = this.y(to), bottom = this.y(from);
      g.fillStyle(light).fillRect(40, top, W - 80, bottom - top);
      // Soft, bumpy edges and hills.
      for (let x = 40; x <= W - 40; x += 60) { g.fillCircle(x, top, 34); g.fillCircle(x, bottom, 34); }
      for (let yy = top; yy <= bottom; yy += 60) { g.fillCircle(40, yy, 34); g.fillCircle(W - 40, yy, 34); }
      for (let k = 0; k < 7; k++) g.fillStyle(dark, 0.45).fillEllipse(rnd.between(80, W - 80), rnd.between(top + 40, bottom - 40), rnd.between(160, 320), rnd.between(60, 110));
      // Scenery, kept clear of the path.
      for (let k = 0; k < 16; k++) {
        const yy = rnd.between(top + 50, bottom - 50);
        const near = this.spots.reduce((a, s) => (Math.abs(s.y - yy) < Math.abs(a.y - yy) ? s : a));
        let x = rnd.between(90, W - 90);
        if (Math.abs(x - near.x) < 190) x = near.x > W / 2 ? rnd.between(90, near.x - 200) : rnd.between(near.x + 200, W - 90);
        emoji(this, x, yy, rnd.pick(land.decor), rnd.between(46, 78)).setAngle(rnd.between(-12, 12)).setAlpha(0.95);
      }
      // The land's sign, near where you arrive.
      // To the side, away from the land's first stone, so the path doesn't run through it.
      const first = this.spots.find(sp => sp.land === land)!;
      const sign = this.add.container(first.x > W / 2 ? 360 : W - 360, this.y(from + BANNER / 2 + 20)).setDepth(5);
      const s = this.add.graphics();
      s.fillStyle(0x6d4c41).fillRect(-8, 0, 16, 60);
      s.fillStyle(0x000000, 0.18).fillRoundedRect(-215 + 6, -46 + 8, 430, 84, 20);
      s.fillStyle(0xfff3d6).fillRoundedRect(-215, -46, 430, 84, 20).lineStyle(6, 0x8d6e3f).strokeRoundedRect(-215, -46, 430, 84, 20);
      const name = text(this, 26, -4, land.name, 34, '#5d4037');
      if (name.width > 330) name.setScale(330 / name.width);
      sign.add([s, sprite(this, -170, -4, LAND_ICON[land.theme], 64), name]);
    }
    // Whitecaps on the sea.
    for (let k = 0; k < 40; k++) emoji(this, rnd.pick([18, W - 18]), rnd.between(0, this.worldH), '〰️', 24).setAlpha(0.5);
  }

  private drawPath() {
    const curve = new Phaser.Curves.Spline(this.spots.map(s => new Phaser.Math.Vector2(s.x, s.y)));
    const g = this.add.graphics();
    const pts = curve.getSpacedPoints(Math.round(curve.getLength() / 26));
    for (const p of pts) g.fillStyle(0x6d4c41, 0.35).fillCircle(p.x, p.y + 3, 8).fillStyle(0xfff8e1, 0.95).fillCircle(p.x, p.y, 7);
  }

  private stoneState(lesson: number) {
    return lesson < learner.lesson ? 'done' : lesson === learner.lesson ? 'current' : 'locked';
  }

  private drawSpots() {
    const tgt = this.target();
    for (const s of this.spots) {
      const c = this.add.container(s.x, s.y).setDepth(10);
      if (s.gate) {
        const cleared = this.state.cleared.includes(s.land.id);
        const ready = tgt === s;
        const g = this.add.graphics();
        // A stone arch.
        g.fillStyle(0x000000, 0.18).fillRoundedRect(-92 + 6, -70 + 8, 184, 140, 40);
        g.fillStyle(ready ? 0xb0bec5 : 0x90a4ae).fillRoundedRect(-92, -70, 184, 140, 40);
        g.fillStyle(0xcfd8dc).fillRoundedRect(-92, -70, 184, 26, { tl: 40, tr: 40, bl: 0, br: 0 });
        g.fillStyle(cleared ? 0xb9f6ca : ready ? 0xfff59d : 0x607d8b).fillRoundedRect(-52, -36, 104, 106, { tl: 52, tr: 52, bl: 0, br: 0 });
        c.add(g);
        c.add(emoji(this, 0, 16, cleared ? '🚩' : GATE_ICON[s.land.gate], 60).setAlpha(cleared || ready ? 1 : 0.5));
        if (!cleared && !ready) c.add(emoji(this, 66, -58, '🔒', 34));
        tappable(c, 184, 140);
      } else {
        const st = this.stoneState(s.lesson!);
        c.add(glossyCircle(this, 42, st === 'done' ? 0xffd21f : st === 'current' ? 0xffffff : 0xb0bec5));
        const l = lessonInfo(s.lesson!)!;
        const label = text(this, 0, 2, l.g.length ? l.g.map(g => GRAPHEMES[g].label).join(' ') : '📖', 36, st === 'locked' ? '#78909c' : '#2b2b2b');
        if (label.width > 70) label.setScale(70 / label.width);
        c.add(label);
        if (st === 'done') c.add(emoji(this, 30, -34, '⭐', 26));
        tappable(c, 90, 90);
      }
      this.tapOn(c, () => this.tapSpot(s));
      s.obj = c;
    }
  }

  private drawChests() {
    REGIONS.forEach((land, i) => {
      const stones = this.spots.filter(s => s.land === land && !s.gate);
      const mid = stones[Math.floor(stones.length / 2)];
      const x = mid.x > W / 2 ? mid.x - 250 : mid.x + 250;
      const c = this.add.container(x, mid.y).setDepth(10);
      const open = this.state.chests.includes(i);
      c.add(this.chestArt(open));
      if (!open) {
        const need = this.add.container(0, 56, [this.add.rectangle(0, 0, 96, 36, 0xffffff, 0.92).setStrokeStyle(3, 0xffc94d),
          emoji(this, -24, 0, '⭐', 22), text(this, 14, 0, String(CHEST_STARS[i]), 22)]);
        c.add(need);
        if (learner.s.stars >= CHEST_STARS[i]) this.tweens.add({ targets: c, scale: 1.12, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
      }
      tappable(c, 110, 110);
      this.tapOn(c, () => void this.openChest(i, c));
    });
  }

  /** A little treasure chest, shut or open. */
  private chestArt(open: boolean) {
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.2).fillRoundedRect(-44, -10 + 8, 88, 50, 8);
    g.fillStyle(0x8d5524).fillRoundedRect(-44, -10, 88, 50, 8);
    g.fillStyle(0xffc94d).fillRect(-44, 4, 88, 8).fillRect(-6, -10, 12, 50);
    if (open) {
      g.fillStyle(0xffe066).fillEllipse(0, -12, 70, 20);
      g.fillStyle(0xa0652e).fillRoundedRect(-44, -52, 88, 30, { tl: 16, tr: 16, bl: 0, br: 0 });
    } else {
      g.fillStyle(0xa0652e).fillRoundedRect(-44, -38, 88, 30, { tl: 16, tr: 16, bl: 0, br: 0 });
      g.fillStyle(0xffc94d).fillRect(-6, -38, 12, 30).fillCircle(0, -10, 7);
    }
    return g;
  }

  /** The friends made so far, gathered around the explorer. */
  private drawParty(at: Spot) {
    this.party.forEach(p => p.destroy());
    const friends = REGIONS.filter(r => this.state.celebrated.includes(r.id));
    const slots = [[-82, 10], [82, 10], [-140, 30], [140, 30], [-196, 44], [196, 44], [-110, 70], [110, 70]];
    this.party = friends.map((r, i) => {
      const [dx, dy] = slots[i % slots.length];
      const f = sprite(this, at.x + dx, at.y - 30 + dy, r.friend, 70).setDepth(45);
      this.tweens.add({ targets: f, y: f.y - 6, duration: 600 + i * 90, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
      return f;
    });
  }

  /** A pulsing "play here" marker over the spot to play next. */
  private markTarget() {
    this.glow?.destroy();
    const t = this.target();
    const ring = this.add.circle(0, 0, t.gate ? 100 : 56).setStrokeStyle(8, 0x43c35e, 0.9);
    // Beside the spot (the explorer stands on top of it).
    const play = this.add.container(t.gate ? 128 : 84, t.gate ? -40 : -30, [glossyCircle(this, 30, 0x43c35e), this.add.triangle(4, 0, 0, 0, 0, 26, 22, 13, 0xffffff).setOrigin(0.5)]);
    this.glow = this.add.container(t.x, t.y, [ring, play]).setDepth(40);
    this.tweens.add({ targets: ring, scale: 1.18, alpha: 0.4, duration: 650, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: play, y: play.y - 12, duration: 450, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    tappable(play, 70, 70);
    this.tapOn(play, () => this.tapSpot(t));
  }

  private hud() {
    roundButton(this, 60, 56, 40, 0xff7043, '🏠', () => this.scene.start('Home')).setScrollFactor(0).setDepth(900);
    const sc = this.add.container(200, 58).setScrollFactor(0).setDepth(900);
    this.starText = text(this, 22, 0, String(learner.s.stars), 34);
    sc.add([this.add.rectangle(0, 0, 150, 60, 0xffffff, 0.9).setStrokeStyle(4, 0xffc94d), sprite(this, -42, 0, 'star', 46), this.starText]);
    // Back to where the explorer is.
    roundButton(this, W - 60, 56, 40, 0x42a5f5, '🧭', () => this.panTo(this.explorer.y + 62)).setScrollFactor(0).setDepth(900);
  }

  // ---------- scrolling and tapping ----------

  private scrolling() {
    const cam = this.cameras.main;
    cam.setBounds(0, 0, W, this.worldH);
    let startY = 0, startScroll = 0, lastY = 0, lastT = 0, vel = 0;
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      startY = lastY = p.y; startScroll = cam.scrollY; lastT = performance.now(); vel = 0; this.moved = 0;
      this.tweens.killTweensOf(cam);
    });
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (!p.isDown) return;
      this.moved = Math.max(this.moved, Math.abs(p.y - startY));
      cam.scrollY = startScroll - (p.y - startY);
      const now = performance.now();
      vel = (p.y - lastY) / Math.max(1, now - lastT);
      lastY = p.y; lastT = now;
    });
    this.input.on('pointerup', () => {
      if (this.moved > TAP && Math.abs(vel) > 0.2) this.tweens.add({ targets: cam, scrollY: cam.scrollY - vel * 320, duration: 600, ease: 'Cubic.Out' });
    });
    this.input.on('wheel', (_p: unknown, _o: unknown, _dx: number, dy: number) => { cam.scrollY += dy; });
  }

  /** Tap (not scroll) handler: fires on release, only if the finger didn't travel. */
  private tapOn(obj: Phaser.GameObjects.GameObject, fn: () => void) {
    obj.on('pointerup', () => { if (this.moved <= TAP && !this.busy) fn(); });
  }

  private panTo(y: number, duration = 700) {
    const cam = this.cameras.main;
    return new Promise<void>(r => this.tweens.add({ targets: cam, scrollY: Phaser.Math.Clamp(y - H / 2, 0, this.worldH - H), duration, ease: 'Sine.InOut', onComplete: () => r() }));
  }

  private say(t: string) { return this.alive ? audio.say(t) : Promise.resolve(); }

  // ---------- what happens ----------

  private async intro() {
    this.busy = true;
    const ms = this.state;
    // Gates won since last time: open them, welcome the new friend and the next land.
    for (const land of REGIONS.filter(r => ms.cleared.includes(r.id) && !ms.celebrated.includes(r.id))) {
      if (!this.alive) return;
      await this.celebrateGate(land);
    }
    // Moved up a lesson (or through a gate)? Hop forward along the path.
    const from = ms.at ? this.spots.findIndex(s => s.key === ms.at) : -1;
    const to = this.spots.indexOf(this.target());
    if (from >= 0 && to > from) {
      for (let i = from + 1; i <= to && this.alive; i++) await this.hop(this.spots[i], i === to);
      if (this.alive) await this.say(pickOne(LINES.praise));
    }
    ms.at = this.target().key;
    ms.seen = learner.lesson;
    learner.save();
    if (!this.alive) return;
    this.drawParty(this.target());
    this.markTarget();
    this.busy = false;
    const t = this.target();
    if (from < 0 || to <= from) await this.say(pickOne(LINES.mapHello));
    await this.say(t.gate ? LINES.gates[t.land.gate] : LINES.tapGlow);
  }

  private async hop(s: Spot, last: boolean) {
    void this.panTo(s.y, 450);
    this.tweens.killTweensOf(this.explorer);
    // Friends move along with the explorer.
    const dx = s.x - this.explorer.x, dy = s.y - 62 - this.explorer.y;
    this.party.forEach(p => { this.tweens.killTweensOf(p); this.tweens.add({ targets: p, x: p.x + dx, y: p.y + dy, duration: 520, ease: 'Sine.InOut' }); });
    audio.sfx.hop();
    await new Promise<void>(r => {
      this.tweens.add({ targets: this.explorer, x: s.x, duration: 480, ease: 'Sine.InOut' });
      this.tweens.add({ targets: this.explorer, y: { from: this.explorer.y, to: s.y - 62 }, duration: 480, ease: 'Sine.InOut', onComplete: () => r() });
      this.tweens.add({ targets: this.explorer, scale: this.explorer.scale * 1.15, duration: 240, yoyo: true });
    });
    if (s.obj && !s.gate) {
      audio.sfx.chime(Math.min(7, (s.lesson ?? 0) % 8));
      burst(this, s.x, s.y, ['⭐', '✨'], 8);
      this.tweens.add({ targets: s.obj, scale: { from: 1.3, to: 1 }, duration: 300, ease: 'Back.Out' });
    }
    if (last) this.tweens.add({ targets: this.explorer, y: '-=8', duration: 700, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    await new Promise(r => this.time.delayedCall(120, r));
  }

  /** A gate was won: it opens, the land's friend joins, and the next land says hello. */
  private async celebrateGate(land: Region) {
    const g = this.spot('G' + land.id)!;
    await this.panTo(g.y);
    audio.sfx.fanfare();
    this.cameras.main.flash(250, 255, 255, 220);
    confetti(this, 60);
    g.obj!.removeAll(true);
    const arch = this.add.graphics();
    arch.fillStyle(0x90a4ae).fillRoundedRect(-92, -70, 184, 140, 40);
    arch.fillStyle(0xb9f6ca).fillRoundedRect(-52, -36, 104, 106, { tl: 52, tr: 52, bl: 0, br: 0 });
    g.obj!.add([arch, emoji(this, 0, 16, '🚩', 60)]);
    burst(this, g.x, g.y, ['🎉', '⭐', '✨'], 20);
    // The new friend pops out of the gate.
    const f = sprite(this, g.x, g.y - 20, land.friend, 150).setDepth(60);
    const scale = f.scale;
    f.setScale(0);
    await new Promise(r => this.tweens.add({ targets: f, scale, y: g.y - 110, duration: 500, ease: 'Back.Out', onComplete: r }));
    await this.say(LINES.newFriend);
    learner.addSticker(land.sticker);
    this.state.celebrated.push(land.id);
    learner.save();
    await new Promise(r => this.tweens.add({ targets: f, alpha: 0, scale: scale * 0.4, x: this.explorer.x, y: this.explorer.y, duration: 600, ease: 'Cubic.In', onComplete: r }));
    f.destroy();
    this.drawParty(this.spot(this.state.at ?? '') ?? g);
    const next = REGIONS[REGIONS.indexOf(land) + 1];
    if (!next) {
      confetti(this, 120);
      await this.say(LINES.mapDone);
      return;
    }
    await this.panTo(this.y(this.bands[REGIONS.indexOf(next)].from + BANNER / 2));
    await this.say(LINES.newLand);
    await this.say(LINES.lands[next.id as keyof typeof LINES.lands]);
  }

  private tapSpot(s: Spot) {
    const t = this.target();
    if (s === t) {
      audio.sfx.tap();
      this.busy = true;
      this.tweens.add({ targets: s.obj, scale: 1.2, duration: 160, yoyo: true });
      const session = s.gate && !this.state.cleared.includes(s.land.id)
        ? new Session(s.land.theme, { returnTo: 'Map', gate: { land: s.land.id, game: s.land.gate } })
        : new Session(undefined, { returnTo: 'Map' });
      this.time.delayedCall(260, () => session.start(this));
      return;
    }
    if (!s.gate && this.stoneState(s.lesson!) === 'done') { this.lessonCard(s.lesson!); return; }
    if (s.gate && this.state.cleared.includes(s.land.id)) { audio.sfx.giggle(); burst(this, s.x, s.y - 40, ['🚩', '✨'], 6); return; }
    audio.sfx.boing();
    wiggle(this, s.obj!);
    void this.say(LINES.notYet);
  }

  private async openChest(i: number, c: Phaser.GameObjects.Container) {
    if (this.state.chests.includes(i)) { audio.sfx.giggle(); return; }
    if (learner.s.stars < CHEST_STARS[i]) { audio.sfx.boing(); wiggle(this, c); void this.say(LINES.needStars); return; }
    this.busy = true;
    this.state.chests.push(i);
    learner.save();
    this.tweens.killTweensOf(c);
    c.setScale(1).removeAll(true);
    c.add(this.chestArt(true));
    audio.sfx.fanfare();
    burst(this, c.x, c.y - 30, ['✨', '⭐', '💰'], 18);
    const st = nextSticker(learner.s.stickers);
    learner.addSticker(st.id);
    // The prize rises out of the chest and shows itself off.
    const prize = (st.texture ? sprite(this, W / 2, H / 2, st.texture, 220) : emoji(this, W / 2, H / 2, st.emoji!, 170)).setScrollFactor(0).setDepth(950);
    const full = prize.scale;
    prize.setScale(0);
    await new Promise(r => this.tweens.add({ targets: prize, scale: full, angle: { from: -30, to: 0 }, duration: 500, ease: 'Back.Out', onComplete: r }));
    confetti(this, 50);
    await this.say(LINES.treasure);
    await this.say(st.name);
    await new Promise(r => this.tweens.add({ targets: prize, scale: 0, alpha: 0, duration: 300, delay: 500, onComplete: r }));
    prize.destroy();
    this.busy = false;
  }

  /** A finished lesson's sounds and words, to hear again. */
  private lessonCard(lesson: number) {
    const l = lessonInfo(lesson)!;
    const layer = this.add.container(0, 0).setScrollFactor(0).setDepth(980);
    const dim = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.4).setInteractive();
    const card = this.add.graphics();
    card.fillStyle(0xffffff).fillRoundedRect(W / 2 - 400, H / 2 - 230, 800, 460, 36).lineStyle(8, 0xffc94d).strokeRoundedRect(W / 2 - 400, H / 2 - 230, 800, 460, 36);
    layer.add([dim, card]);
    const close = () => { audio.stop(); layer.destroy(); };
    dim.on('pointerup', close);
    const x0 = (n: number, gap: number) => W / 2 - ((n - 1) * gap) / 2;
    const play = async (g: string) => { await audio.sound(g); await audio.say(LINES.like); await audio.say(GRAPHEMES[g].key); };
    l.g.forEach((g, i) => {
      const c = this.add.container(x0(l.g.length, 200) + i * 200, H / 2 - 90, [text(this, -40, 0, GRAPHEMES[g].label, 84), emoji(this, 50, 0, GRAPHEMES[g].pic, 70)]);
      tappable(c, 180, 130).on('pointerup', () => void play(g));
      layer.add(c);
    });
    const words = l.w.slice(0, 6);
    words.forEach((w, i) => {
      const v = new WordView(this, x0(words.length, 150) + i * 150, l.g.length ? H / 2 + 80 : H / 2, w, { size: 52, tapSounds: false }).setScrollFactor(0);
      v.setInteractive({ useHandCursor: true }).on('pointerup', () => void audio.say(w));
      layer.add(v);
    });
    const x = roundButton(this, W / 2 + 370, H / 2 - 200, 32, 0xff7043, '✖️', close);
    layer.add(x);
    layer.setAlpha(0);
    this.tweens.add({ targets: layer, alpha: 1, duration: 200 });
    if (l.g.length) void play(l.g[0]); else if (words[0]) void audio.say(words[0]);
  }
}
