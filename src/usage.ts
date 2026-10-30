// Summaries of the play log for the grown-up area: time per day, and how each game is going
// (played a lot? often left early?). Pure functions, so they can be tested.
import type { Play } from './learner';

const DAY = 864e5;

/** Local midnight of the day containing t. */
const dayStart = (t: number) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };

export interface GameStats {
  game: string;
  plays: number;
  avgMs: number;
  /** Fraction of plays left before the end. */
  leftEarly: number;
  /** Average stars over finished plays (undefined if none were finished). */
  avgStars?: number;
  /** First-try accuracy over all answers (undefined if no answers). */
  accuracy?: number;
  last: number;
}

export function summarize(plays: Play[], now = Date.now()) {
  const today = dayStart(now);
  // Last 7 days, oldest first, including today.
  const days = Array.from({ length: 7 }, (_, i) => {
    const start = today - (6 - i) * DAY;
    const ms = plays.filter(p => p.at >= start && p.at < start + DAY).reduce((a, p) => a + p.ms, 0);
    return { start, ms };
  });
  const week = plays.filter(p => p.at >= today - 6 * DAY);
  const games = week.filter(p => p.game !== 'stickers');

  const byGame = new Map<string, Play[]>();
  for (const p of plays) byGame.set(p.game, [...(byGame.get(p.game) ?? []), p]);
  const perGame: GameStats[] = [...byGame].map(([game, ps]) => {
    const finished = ps.filter(p => p.done && p.stars != null);
    const answers = ps.reduce((a, p) => a + p.total, 0);
    return {
      game,
      plays: ps.length,
      avgMs: ps.reduce((a, p) => a + p.ms, 0) / ps.length,
      leftEarly: ps.filter(p => !p.done).length / ps.length,
      avgStars: finished.length ? finished.reduce((a, p) => a + p.stars!, 0) / finished.length : undefined,
      accuracy: answers ? ps.reduce((a, p) => a + p.right, 0) / answers : undefined,
      last: Math.max(...ps.map(p => p.at)),
    };
  }).sort((a, b) => b.plays - a.plays || b.last - a.last);

  /** Played a few times and left early a lot — maybe too hard, or not fun. */
  const struggles = perGame.filter(g => g.plays >= 3 && g.leftEarly >= 0.4).map(g => g.game);
  return {
    days,
    todayMs: days[6].ms,
    weekMs: week.reduce((a, p) => a + p.ms, 0),
    weekGames: games.length,
    weekLeftEarly: games.filter(p => !p.done).length,
    perGame,
    /** Among the most played (at least twice), not counting ones usually left early. */
    favorites: perGame.filter(g => g.game !== 'stickers' && g.plays >= 2 && !struggles.includes(g.game)).slice(0, 3).map(g => g.game),
    struggles,
  };
}

/** "3 min", "45 sec", "1 hr 5 min". */
export function duration(ms: number) {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s} sec`;
  const m = Math.round(s / 60);
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)} hr ${m % 60} min`;
}

/** "today", "yesterday", "3 days ago". */
export function ago(t: number, now = Date.now()) {
  const d = Math.round((dayStart(now) - dayStart(t)) / DAY);
  return d <= 0 ? 'today' : d === 1 ? 'yesterday' : `${d} days ago`;
}
