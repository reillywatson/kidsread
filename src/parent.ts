// Grown-up area: players, progress, lesson override, settings, and recording letter sounds.
// Plain HTML over the canvas — this part is for readers.
import * as state from './state';
import { GRAPHEMES, LESSONS, lessonInfo, nextLesson, prevLesson } from './data/curriculum';
import { TEXTURES, AVATARS } from './art';
import { settings, updateSettings } from './settings';
import { LINES } from './lines';
import * as audio from './audio';

const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const avatarImg = (key: string, size = 44) =>
  `<img src="data:image/svg+xml;base64,${btoa(TEXTURES[key][0])}" width="${size}" height="${size}" alt="">`;

export function openParentArea(onClose: () => void) {
  const root = document.createElement('div');
  root.id = 'parent';
  document.body.append(root);
  const close = () => { root.remove(); onClose(); };
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
    const skills = (['grapheme', 'word', 'spelling', 'sentence', 'heart', 'phonemic', 'rhyme'] as const)
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
          lesson's new sounds and most of its words are answered correctly on separate tries. Skip ahead
          if your child already knows the early sounds.</p>
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
    if (d.lesson) {
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
