// Kids Read server: the static game (Workers static assets), plus a small API in front of a D1
// database (schema in migrations/):
//   GET/POST /api/backup/:code  a device's backup (players and progress), by its restore code
//   GET /api/stats?key=…        pooled, anonymous play stats (game, time, score, lesson)
//   GET /stats                  a page that shows them (needs the STATS_KEY secret)

// Just the parts of the Workers types this uses.
interface Stmt { bind(...v: unknown[]): Stmt; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; run(): Promise<unknown> }
interface Env {
  ASSETS: { fetch(r: Request): Promise<Response> };
  DB: { prepare(sql: string): Stmt; batch(s: Stmt[]): Promise<unknown> };
  STATS_KEY?: string;
}

/** Restore codes: three groups of four, from an alphabet without look-alikes (no 0/O, 1/I/L). */
export const CODE = /^[2-9A-HJKMNP-Z]{4}-[2-9A-HJKMNP-Z]{4}-[2-9A-HJKMNP-Z]{4}$/;
const MAX_BODY = 2_000_000;
const MAX_PLAYS = 1000;
const DAY = 864e5;

const json = (v: unknown, status = 200) =>
  new Response(JSON.stringify(v), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

async function hash(s: string) {
  const d = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode('kidsread:' + s)));
  return [...d.slice(0, 8)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export interface PlayIn { id: string; game: string; at: number; ms: number; done: boolean; right: number; total: number; stars?: number; lesson?: number }

/** Keep only well-formed play records, with numbers clamped to sane ranges. */
export function cleanPlays(v: unknown): PlayIn[] {
  if (!Array.isArray(v)) return [];
  const num = (x: unknown, max: number) => (typeof x === 'number' && Number.isFinite(x) ? Math.max(0, Math.min(max, Math.round(x))) : 0);
  return v.slice(0, MAX_PLAYS).filter(p => p && typeof p.id === 'string' && p.id.length <= 64 && typeof p.game === 'string' && /^[a-z0-9_-]{1,30}$/.test(p.game))
    .map(p => ({
      id: p.id, game: p.game, at: num(p.at, 9e15), ms: num(p.ms, 3_600_000), done: !!p.done,
      right: num(p.right, 1000), total: num(p.total, 1000), stars: p.stars == null ? undefined : num(p.stars, 3), lesson: p.lesson == null ? undefined : num(p.lesson, 999),
    }));
}

async function backup(req: Request, env: Env, code: string) {
  if (!CODE.test(code)) return json({ error: 'bad code' }, 400);
  if (req.method === 'GET') {
    const row = await env.DB.prepare('SELECT data, updated_at FROM backups WHERE code = ?').bind(code).first<{ data: string; updated_at: number }>();
    return row ? json({ data: JSON.parse(row.data), at: row.updated_at }) : json({ error: 'not found' }, 404);
  }
  if (req.method !== 'POST') return json({ error: 'method' }, 405);
  const body = await req.text();
  if (body.length > MAX_BODY) return json({ error: 'too big' }, 413);
  let parsed: { data?: unknown; plays?: unknown };
  try { parsed = JSON.parse(body); } catch { return json({ error: 'bad json' }, 400); }
  if (!parsed.data || typeof parsed.data !== 'object') return json({ error: 'no data' }, 400);
  const now = Date.now();
  const fam = await hash(code);
  const plays = cleanPlays(parsed.plays);
  await env.DB.batch([
    env.DB.prepare('INSERT INTO backups (code, data, updated_at) VALUES (?, ?, ?) ON CONFLICT(code) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at')
      .bind(code, JSON.stringify(parsed.data), now),
    ...plays.map(p => env.DB.prepare('INSERT OR IGNORE INTO plays (id, fam, game, at, ms, done, first_try, answers, stars, lesson) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(`${fam}:${p.id}`, fam, p.game, p.at, p.ms, p.done ? 1 : 0, p.right, p.total, p.stars ?? null, p.lesson ?? null)),
  ]);
  return json({ ok: true, at: now, plays: plays.length });
}

async function stats(req: Request, env: Env) {
  const url = new URL(req.url);
  if (!env.STATS_KEY || url.searchParams.get('key') !== env.STATS_KEY) return json({ error: 'forbidden' }, 403);
  const days = Math.max(1, Math.min(365, Number(url.searchParams.get('days')) || 30));
  const since = Date.now() - days * DAY;
  const q = <T>(sql: string) => env.DB.prepare(sql).bind(since).all<T>().then(r => r.results);
  const [totals] = await q<Record<string, number>>('SELECT COUNT(*) AS plays, COUNT(DISTINCT fam) AS families, SUM(ms) AS ms FROM plays WHERE at > ?');
  const games = await q(`SELECT game, COUNT(*) AS plays, COUNT(DISTINCT fam) AS families, AVG(ms) AS avg_ms,
    AVG(1 - done) AS left_early, AVG(stars) AS avg_stars, SUM(first_try) * 1.0 / NULLIF(SUM(answers), 0) AS accuracy
    FROM plays WHERE at > ? GROUP BY game ORDER BY plays DESC`);
  const byDay = await q(`SELECT CAST(at / ${DAY} AS INTEGER) AS day, COUNT(*) AS plays, COUNT(DISTINCT fam) AS families, SUM(ms) AS ms
    FROM plays WHERE at > ? GROUP BY day ORDER BY day`);
  const byLesson = await q(`SELECT (lesson / 10) * 10 AS band, COUNT(*) AS plays, COUNT(DISTINCT fam) AS families,
    AVG(1 - done) AS left_early, SUM(first_try) * 1.0 / NULLIF(SUM(answers), 0) AS accuracy
    FROM plays WHERE at > ? AND lesson IS NOT NULL GROUP BY band ORDER BY band`);
  return json({ days, totals, games, byDay, byLesson });
}

const STATS_PAGE = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Kids Read stats</title><style>
body{font:15px/1.45 system-ui,sans-serif;margin:0;background:#f4f6fb;color:#1f2430}main{max-width:980px;margin:24px auto;padding:0 16px}
h1{font-size:24px}section{background:#fff;border-radius:14px;padding:16px 20px;margin:14px 0;box-shadow:0 2px 10px #0001}
table{border-collapse:collapse;width:100%}td,th{padding:5px 10px 5px 0;text-align:left;border-bottom:1px solid #eef0f5}td.n,th.n{text-align:right}
.bars{display:flex;gap:4px;align-items:flex-end;height:120px}.bars div{flex:1;background:#42a5f5;border-radius:4px 4px 2px 2px;min-height:2px}
.warn{background:#fff4e5}.muted{color:#6b7280;font-size:13px}input,select,button{font:inherit;padding:5px 9px}
</style></head><body><main><h1>Kids Read: everyone, anonymized</h1>
<p><input id="key" type="password" placeholder="Stats key"> <select id="days"><option>7</option><option selected>30</option><option>90</option><option>365</option></select> days <button id="go">Load</button></p>
<div id="out" class="muted">Enter the stats key (the STATS_KEY secret).</div></main><script>
const $=id=>document.getElementById(id);$('key').value=localStorage.getItem('statsKey')||'';
const pct=x=>x==null?'—':Math.round(x*100)+'%',min=ms=>ms==null?'—':ms<60000?Math.round(ms/1000)+' s':Math.round(ms/60000)+' min';
async function load(){localStorage.setItem('statsKey',$('key').value);const r=await fetch('/api/stats?days='+$('days').value+'&key='+encodeURIComponent($('key').value));
if(!r.ok){$('out').textContent=r.status===403?'Wrong key.':'Error '+r.status;return}const s=await r.json(),t=s.totals||{};
const max=Math.max(1,...s.byDay.map(d=>d.ms||0));
$('out').innerHTML='<section><b>'+(t.families||0)+'</b> families · <b>'+(t.plays||0)+'</b> plays · <b>'+min(t.ms)+'</b> played, last '+s.days+' days'
+'<div class="bars">'+s.byDay.map(d=>'<div title="'+new Date(d.day*864e5).toDateString()+': '+d.plays+' plays, '+d.families+' families" style="height:'+Math.round((d.ms||0)/max*100)+'%"></div>').join('')+'</div><p class="muted">Minutes played per day.</p></section>'
+'<section><h2>Games</h2><table><tr><th>Game</th><th class=n>Plays</th><th class=n>Families</th><th class=n>Avg time</th><th class=n>Left early</th><th class=n>Avg stars</th><th class=n>First try</th></tr>'
+s.games.map(g=>'<tr class="'+(g.plays>=5&&g.left_early>=.4?'warn':'')+'"><td>'+g.game+'</td><td class=n>'+g.plays+'</td><td class=n>'+g.families+'</td><td class=n>'+min(g.avg_ms)+'</td><td class=n>'+pct(g.left_early)+'</td><td class=n>'+(g.avg_stars==null?'—':g.avg_stars.toFixed(1))+'</td><td class=n>'+pct(g.accuracy)+'</td></tr>').join('')
+'</table><p class="muted">Highlighted: left early 40%+ of the time (5+ plays).</p></section>'
+'<section><h2>By lesson</h2><table><tr><th>Lessons</th><th class=n>Plays</th><th class=n>Families</th><th class=n>Left early</th><th class=n>First try</th></tr>'
+s.byLesson.map(b=>'<tr><td>'+b.band+'–'+(b.band+9)+'</td><td class=n>'+b.plays+'</td><td class=n>'+b.families+'</td><td class=n>'+pct(b.left_early)+'</td><td class=n>'+pct(b.accuracy)+'</td></tr>').join('')+'</table></section>'}
$('go').onclick=load;if($('key').value)load();
</script></body></html>`;

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    try {
      const m = url.pathname.match(/^\/api\/backup\/([^/]+)$/);
      if (m) return await backup(req, env, decodeURIComponent(m[1]).toUpperCase());
      if (url.pathname === '/api/stats') return await stats(req, env);
      if (url.pathname === '/stats') return new Response(STATS_PAGE, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
      if (url.pathname.startsWith('/api/')) return json({ error: 'not found' }, 404);
    } catch {
      return json({ error: 'server error' }, 500);
    }
    return env.ASSETS.fetch(req);
  },
};
