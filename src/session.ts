// A play session: a short playlist of minigames, then a sticker.
import type Phaser from 'phaser';
import { learner } from './state';
import { backupNow } from './sync';
import { GAMES } from './games';
import type { GameMeta, Theme } from './games/BaseGame';

/**
 * Pick n games. Favors skills the child is weakest at, avoids last session's games,
 * mixes worlds when no world was chosen, and never repeats a game back to back.
 */
export function chooseGames(n: number, theme?: Theme): GameMeta[] {
  const metas = GAMES.map(g => g.meta).filter(m => !m.bonus && m.eligible(learner.lesson) && (!theme || m.theme === theme));
  const out: GameMeta[] = [];
  while (out.length < n && metas.length) {
    const weights = metas.map(m => {
      if (out.length && out[out.length - 1] === m && metas.length > 1) return 0;
      let w = 1 + 0.8 * (1 - (learner.accuracy(m.skill) ?? 0.7));
      if (learner.s.lastGames.includes(m.id)) w -= 0.5;
      if (out.includes(m)) w -= 0.7;
      if (!theme && !out.some(o => o.theme === m.theme)) w += 0.6;
      return Math.max(0.05, w);
    });
    let r = Math.random() * weights.reduce((a, b) => a + b, 0);
    const i = weights.findIndex(w => (r -= w) <= 0);
    out.push(metas[i === -1 ? metas.length - 1 : i]);
  }
  return out;
}

/**
 * Maybe slip a bonus game into the playlist: about a third of sessions, and always if the last
 * two sessions had none. It goes after the first learning game (never first) and matches the
 * world when one was chosen.
 */
function withBonus(games: GameMeta[], theme?: Theme): GameMeta[] {
  const since = learner.s.sessions - (learner.s.lastBonusSession ?? -Infinity);
  if (games.length < 2 || (since < 3 && Math.random() > 0.35)) return games;
  const bonuses = GAMES.map(g => g.meta).filter(m => m.bonus && (!theme || m.theme === theme));
  const fresh = bonuses.filter(m => !learner.s.lastGames.includes(m.id));
  const pool = fresh.length ? fresh : bonuses;
  if (!pool.length) return games;
  const bonus = pool[Math.floor(Math.random() * pool.length)];
  const at = 1 + Math.floor(Math.random() * (games.length - 1));
  learner.s.lastBonusSession = learner.s.sessions;
  learner.save();
  return [...games.slice(0, at), bonus, ...games.slice(at)];
}

export interface SessionOptions {
  /** The scene to go back to afterwards ('Home', 'Map' from the adventure map, or 'Playtest'). */
  returnTo?: string;
  /** A map gate: play just this goal game, and win the gate of this land when it's finished. */
  gate?: { land: string; game: string };
  /** Play just this game (playtesting); "play again" plays it again. */
  only?: string;
}

export class Session {
  games: GameMeta[];
  i = 0;
  returnTo: string;

  constructor(public theme?: Theme, public opts: SessionOptions = {}) {
    this.returnTo = opts.returnTo ?? 'Home';
    const one = opts.gate?.game ?? opts.only;
    const gameMeta = one && GAMES.find(g => g.meta.id === one)?.meta;
    this.games = gameMeta ? [gameMeta] : withBonus(chooseGames(learner.s.settings.gamesPerSession, theme), theme);
    learner.startSession();
  }

  get current() { return this.games[this.i]; }
  get isLast() { return this.i >= this.games.length - 1; }

  start(scene: Phaser.Scene) { scene.scene.start(this.games[0].id, { session: this }); }

  gameDone(scene: Phaser.Scene, stars: number) {
    learner.addStars(stars);
    // A gate game finished: that land's gate is won (the map celebrates it next time it opens).
    const land = this.opts.gate?.land;
    if (land) {
      const map = (learner.s.map ??= { cleared: [], celebrated: [], chests: [] });
      if (!map.cleared.includes(land)) map.cleared.push(land);
      learner.save();
    }
    scene.scene.start('Reward', { session: this, stars });
  }

  next(scene: Phaser.Scene) {
    this.i++;
    if (this.i < this.games.length) scene.scene.start(this.games[this.i].id, { session: this });
    else this.quit(scene);
  }

  quit(scene: Phaser.Scene) {
    learner.noteGames(this.games.slice(0, this.i + 1).map(g => g.id));
    if (import.meta.env.PROD) void backupNow();
    scene.scene.start(this.returnTo);
  }

  /** Play another session in the same world (an ordinary one, even after a gate; the same game when playtesting). */
  again(scene: Phaser.Scene) {
    learner.noteGames(this.games.map(g => g.id));
    new Session(this.theme, { returnTo: this.returnTo, only: this.opts.only }).start(scene);
  }
}
