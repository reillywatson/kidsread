// Grown-up area: players, progress, lesson override, settings, and recording letter sounds.
// Plain HTML over the canvas — this part is for readers.
import * as state from './state';
import { GRAPHEMES, LESSONS, lessonInfo, nextLesson, prevLesson } from './data/curriculum';
import { TEXTURES, AVATARS } from './art';
import { settings, updateSettings } from './settings';
import { LINES } from './lines';
import * as audio from './audio';
import { GAMES } from './games';
import { summarize, duration, ago } from './usage';
import { applyBackup, backupNow, fetchBackup, lastBackup, normalizeCode, onBackup, restoreCode, CODE } from './sync';
import type { Theme } from './games/BaseGame';
import { startButtons } from './start';

const WORLD: Record<Theme, string> = { pvz: '🌻', pokemon: '⚡', paw: '🐾', friends: '💜' };
const gameName = (id: string) => {
  if (id === 'stickers') return '📒 Sticker playground';
  if (id === 'books') return '📚 Storybooks';
  const m = GAMES.find(g => g.meta.id === id)?.meta;
  return m ? `${WORLD[m.theme]} ${m.title.split(' — ')[0].replace(' (bonus)', '')}${m.bonus ? ' <span class="muted">(bonus)</span>' : ''}` : esc(id);
};

/** "What got played": time per day this week, and how each game is going. */
function usage(learner: typeof state.learner) {
  const plays = learner.s.plays ?? [];
  if (!plays.length) return '<p class="muted">Nothing played yet. Games show up here as they’re played.</p>';
  const u = summarize(plays);
  const max = Math.max(...u.days.map(d => d.ms), 60e3);
  const days = u.days.map((d, i) => `
    <div class="day" title="${duration(d.ms)}">
      <div class="bar" style="height:${Math.round((d.ms / max) * 100)}%"></div>
      <span>${i === 6 ? 'Today' : new Date(d.start).toLocaleDateString(undefined, { weekday: 'short' })}</span>
    </div>`).join('');
  const pct = (x?: number) => (x == null ? '—' : `${Math.round(x * 100)}%`);
  const rows = u.perGame.map(g => `
    <tr class="${u.struggles.includes(g.game) ? 'warn' : ''}">
      <td>${u.favorites.includes(g.game) ? '⭐ ' : ''}${gameName(g.game)}</td>
      <td>${g.plays}</td><td>${duration(g.avgMs)}</td>
      <td>${g.game === 'stickers' ? '—' : pct(g.leftEarly)}</td>
      <td>${g.avgStars == null ? '—' : g.avgStars.toFixed(1)}</td>
      <td>${pct(g.accuracy)}</td><td>${ago(g.last)}</td>
    </tr>`).join('');
  const struggles = u.struggles.length
    ? `<p class="note">Often left early: ${u.struggles.map(gameName).join(', ')}. It might be too hard right now,
       or just not a favorite. You can lower the lesson above, or sit with them for a round.</p>` : '';
  return `
    <p>This week: <b>${duration(u.weekMs)}</b> over ${u.weekGames} games${u.weekLeftEarly ? ` (${u.weekLeftEarly} left early)` : ''} · Today: <b>${duration(u.todayMs)}</b></p>
    <div class="days">${days}</div>
    ${struggles}
    <table class="usage">
      <tr><th>Game</th><th>Played</th><th>Avg time</th><th>Left early</th><th>Avg stars</th><th>First try</th><th>Last played</th></tr>
      ${rows}
    </table>
    <p class="muted">⭐ = most played. “First try” is answers right without a hint. Kept on this device only.</p>`;
}

const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const avatarImg = (key: string, size = 44) =>
  `<img src="data:image/svg+xml;base64,${btoa(TEXTURES[key][0])}" width="${size}" height="${size}" alt="">`;

const lastBackupText = () => (lastBackup()
  ? `${ago(lastBackup())}, ${new Date(lastBackup()).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : 'not yet');

export function openParentArea(onClose: () => void, onPlaytest?: () => void) {
  const root = document.createElement('div');
  root.id = 'parent';
  document.body.append(root);
  // Keep "Last backup" current while the panel is open.
  const stopWatching = onBackup(() => { const el = root.querySelector('[data-last]'); if (el) el.textContent = lastBackupText(); });
  const close = () => { stopWatching(); root.remove(); onClose(); };
  let recorder: MediaRecorder | null = null;

  const render = () => {
    const learner = state.learner;
    const s = learner.s;
    const l = lessonInfo(s.lesson)!;
    const sum = learner.summary();
    const pct = (skill: Parameters<typeof learner.accuracy>[0]) => {
      const a = learner.accuracy(skill);
      return a == null ? '—' : `${Math.round(a * 100)}%`;
    };
    const skills = (['grapheme', 'word', 'spelling', 'sentence', 'heart', 'phonemic', 'rhyme', 'syllable', 'writing', 'capitals'] as const)
      .map(k => `<tr><td>${k}</td><td>${['easy', 'medium', 'hard'][learner.tier(k)]}</td><td>${pct(k)}</td></tr>`).join('');
    const tricky = sum.tricky.map(t => `<li><b>${esc(t.id.slice(2))}</b> — ${t.right} right, ${t.wrong + t.help} missed</li>`).join('') || '<li>Nothing yet</li>';
    const players = state.profiles().map(p => `
      <div class="player ${p.id === state.profile?.id ? 'cur' : ''}">
        ${avatarImg(p.avatar)}
        <input data-name="${p.id}" value="${esc(p.name)}" placeholder="Name (optional)" maxlength="20">
        <select data-avatar="${p.id}">${AVATARS.map(a => `<option ${a === p.avatar ? 'selected' : ''}>${a}</option>`).join('')}</select>
        ${p.id === state.profile?.id ? '<span class="muted">playing now</span>' : `<button class="danger" data-delete="${p.id}">Delete</button>`}
      </div>`).join('');
    const gs = Object.values(GRAPHEMES).filter(g => g.lesson <= nextLesson(nextLesson(s.lesson)));
    const clips = gs.map(g => `
      <div class="clip">
        <b>${esc(g.label)}</b> <span class="muted">${esc(g.key)}</span>
        <button data-play="${g.id}" title="Play">▶</button>
        <button data-rec="${g.id}">${recorder && root.dataset.recording === g.id ? '■ Stop' : '● Rec'}</button>
        ${audio.hasRecording('g:' + g.id) ? `<button data-del="${g.id}" title="Use the built-in sound again">✕</button>` : ''}
      </div>`).join('');

    root.innerHTML = `
      <div class="panel">
        <button class="close" data-close>✕ Back to game</button>
        <h1>Grown-ups</h1>

        <section>
          <h2>Players</h2>
          <div class="players">${players}</div>
          <p class="muted">Kids pick their picture at startup. Names are optional and only shown under the picture.</p>
        </section>

        <section>
          <h2>Current lesson ${state.profile?.name ? `for ${esc(state.profile.name)}` : ''}</h2>
          <p class="lesson">
            <button data-lesson="-1">◀</button>
            <span><b>Lesson ${l.n}</b>: ${esc(l.title)}</span>
            <button data-lesson="1">▶</button>
          </p>
          <p class="muted">Lessons follow the UFLI Foundations order. The game moves up on its own once the
          lesson's new sounds and most of its words are answered correctly on separate tries, and skips
          ahead to the next land when the sounds and words before it all come back right.</p>
          <h3>Or jump to a starting point</h3>
          <div class="starts">${startButtons(s.lesson)}</div>
          <p class="muted">Jumping ahead counts everything before it as seen once (it comes up for review
          soon, so any gaps show) and opens the map's lands on the way.</p>
          <details><summary>All lessons</summary><ol class="lessons">${LESSONS.map(x =>
            `<li class="${x.n === l.n ? 'cur' : ''}">${x.n}. ${esc(x.title)} — ${x.w.slice(0, 6).join(', ')}</li>`).join('')}</ol></details>
        </section>

        <section>
          <h2>Progress</h2>
          <p>${s.sessions} sessions · ${s.stars} stars · ${s.stickers.length} stickers</p>
          <p>${sum.practiced} sounds/words practiced · ${sum.mastered} solid · ${sum.due} due for review</p>
          <table><tr><th>Skill</th><th>Level</th><th>Recent</th></tr>${skills}</table>
          <h3>Trickiest</h3><ul>${tricky}</ul>
        </section>

        <section>
          <h2>What got played ${state.profile?.name ? `by ${esc(state.profile.name)}` : ''}</h2>
          ${usage(learner)}
        </section>

        <section>
          <h2>Backup</h2>
          <p>Every player's progress on this device is backed up automatically.
            Last backup: <b data-last>${lastBackupText()}</b>
            ${import.meta.env.DEV ? '<span class="muted">(backups run on the live site, not in development)</span>' : ''}</p>
          <p>Restore code: <code class="restore">${restoreCode()}</code> <button data-copy>Copy</button> <button data-backup>Back up now</button></p>
          <p class="muted">Keep this code somewhere safe. On a new device, or after clearing the browser, enter it
            below to bring everything back: players, progress, stars, stickers and books. Letter sounds you
            recorded yourself aren't included.</p>
          <p><input data-restore-code placeholder="XXXX-XXXX-XXXX" maxlength="16" autocapitalize="characters" spellcheck="false">
            <button data-restore>Restore</button> <span class="muted" data-note></span></p>
        </section>

        <section>
          <h2>Settings</h2>
          <label><input type="checkbox" data-music ${settings.music ? 'checked' : ''}> Background music</label>
          <label><input type="checkbox" data-sfx ${settings.sfx ? 'checked' : ''}> Sound effects</label>
          <label>Games per session
            <select data-games>${[2, 3, 4, 5, 6].map(n => `<option ${n === s.settings.gamesPerSession ? 'selected' : ''}>${n}</option>`).join('')}</select>
          </label>
          <button data-test>Test voice</button>
        </section>

        <section>
          <h2>Letter sounds</h2>
          <p class="muted">▶ plays the sound the game uses. If one sounds off, record your own: say just the
          sound, short and clipped (/m/ not “muh”). Your recording replaces the built-in one for every player.
          Recording needs HTTPS or localhost.</p>
          <div class="clips">${clips}</div>
        </section>

        ${onPlaytest ? `<section>
          <h2>Playtest</h2>
          <p class="muted">Try any game at any lesson and level, as a throwaway player that doesn't change anyone's progress.</p>
          <button data-playtest>Playtest games</button>
        </section>` : ''}

        <section>
          <button class="danger" data-reset>Reset ${state.profile?.name ? esc(state.profile.name) + '’s' : 'this player’s'} progress</button>
        </section>
      </div>`;
  };

  root.addEventListener('click', async e => {
    const b = (e.target as HTMLElement).closest('button');
    if (!b) return;
    const d = b.dataset;
    const learner = state.learner;
    if ('close' in d) return close();
    if ('playtest' in d && onPlaytest) { stopWatching(); root.remove(); return onPlaytest(); }
    const note = (t: string) => { const n = root.querySelector<HTMLElement>('[data-note]'); if (n) n.textContent = t; };
    if ('copy' in d) {
      try { await navigator.clipboard.writeText(restoreCode()); b.textContent = 'Copied!'; } catch { b.textContent = 'Select and copy it'; }
      return;
    }
    if ('backup' in d) {
      b.textContent = 'Backing up…';
      b.textContent = (await backupNow(true)) ? 'Backed up!' : 'Couldn’t back up (offline?)';
      return;
    }
    if ('restore' in d) {
      const input = root.querySelector<HTMLInputElement>('[data-restore-code]')!;
      const code = normalizeCode(input.value);
      if (!CODE.test(code)) { note('That doesn’t look like a restore code (it’s 12 letters and numbers).'); return; }
      if (code === restoreCode()) { note('That’s this device’s own code.'); return; }
      note('Looking…');
      let found;
      try { found = await fetchBackup(code); } catch { note('Couldn’t reach the server. Are you online?'); return; }
      if (!found) { note('No backup found for that code.'); return; }
      const players = Object.keys(found.data.data).filter(k => k.startsWith('kidsread.p.')).length;
      if (!confirm(`Restore the backup from ${new Date(found.at).toLocaleString()} (${players} player${players === 1 ? '' : 's'})?\n\nThis replaces the players and progress on this device. (This device's current progress is backed up first, under its own code.)`)) { note(''); return; }
      await backupNow(true);
      applyBackup(code, found.data);
      location.reload();
      return;
    }
    if (d.start) {
      const n = Number(d.start);
      if (n > learner.lesson) learner.place(n, { quiet: true }); else learner.setLesson(n);
    } else if (d.lesson) {
      learner.setLesson(d.lesson === '1' ? nextLesson(learner.lesson) : prevLesson(learner.lesson));
    } else if ('test' in d) {
      void audio.say(LINES.testVoice);
    } else if (d.play) {
      void audio.sound(d.play);
    } else if (d.del) {
      await audio.deleteRecording('g:' + d.del);
    } else if (d.delete) {
      if (confirm('Delete this player and all their progress?')) state.deleteProfile(d.delete);
    } else if (d.rec) {
      if (recorder) { recorder.stop(); return; }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const chunks: Blob[] = [];
        recorder = new MediaRecorder(stream);
        root.dataset.recording = d.rec;
        const id = d.rec;
        recorder.ondataavailable = ev => chunks.push(ev.data);
        recorder.onstop = async () => {
          stream.getTracks().forEach(t => t.stop());
          recorder = null;
          delete root.dataset.recording;
          await audio.saveRecording('g:' + id, new Blob(chunks, { type: chunks[0]?.type || 'audio/webm' }));
          render();
          void audio.sound(id);
        };
        recorder.start();
        setTimeout(() => recorder?.state === 'recording' && recorder.stop(), 2500);
      } catch {
        alert('Microphone not available. Recording needs HTTPS (or localhost) and microphone permission.');
      }
    } else if ('reset' in d) {
      if (confirm('Erase this player’s progress, stars and stickers?')) learner.reset();
    }
    render();
  });

  root.addEventListener('change', e => {
    const t = e.target as HTMLInputElement;
    const d = t.dataset;
    if (d.name) state.updateProfile(d.name, { name: t.value.trim() });
    else if (d.avatar) { state.updateProfile(d.avatar, { avatar: t.value }); render(); }
    else if ('games' in d) { state.learner.s.settings.gamesPerSession = Number(t.value); state.learner.save(); }
    else if ('music' in d) updateSettings({ music: t.checked });
    else if ('sfx' in d) updateSettings({ sfx: t.checked });
  });

  render();
}
