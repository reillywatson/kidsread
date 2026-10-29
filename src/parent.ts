// Grown-up area: progress, lesson override, voice settings, and recording letter sounds.
// Plain HTML over the canvas — this part is for readers.
import { learner } from './state';
import { GRAPHEMES, LESSONS, lessonInfo, nextLesson, prevLesson } from './data/curriculum';
import * as audio from './audio';

const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export function openParentArea(onClose: () => void) {
  const root = document.createElement('div');
  root.id = 'parent';
  document.body.append(root);
  const close = () => { root.remove(); onClose(); };
  let recorder: MediaRecorder | null = null;

  const render = () => {
    const s = learner.s;
    const l = lessonInfo(s.lesson)!;
    const sum = learner.summary();
    const pct = (skill: Parameters<typeof learner.accuracy>[0]) => {
      const a = learner.accuracy(skill);
      return a == null ? '—' : `${Math.round(a * 100)}%`;
    };
    const skills = (['grapheme', 'word', 'spelling', 'sentence', 'rhyme'] as const)
      .map(k => `<tr><td>${k}</td><td>${['easy', 'medium', 'hard'][learner.tier(k)]}</td><td>${pct(k)}</td></tr>`).join('');
    const tricky = sum.tricky.map(t => `<li><b>${esc(t.id.slice(2))}</b> — ${t.right} right, ${t.wrong + t.help} missed</li>`).join('') || '<li>Nothing yet</li>';
    const voices = audio.voices().map(v => `<option value="${esc(v.name)}" ${v.name === s.settings.voice ? 'selected' : ''}>${esc(v.name)} (${v.lang})</option>`).join('');
    const gs = Object.values(GRAPHEMES).filter(g => g.lesson <= nextLesson(nextLesson(s.lesson)));
    const clips = gs.map(g => `
      <div class="clip">
        <b>${esc(g.label)}</b> <span class="muted">${esc(g.key)}</span>
        <button data-rec="${g.id}">${recorder && root.dataset.recording === g.id ? '■ Stop' : '● Record'}</button>
        <button data-play="${g.id}">▶</button>
        ${audio.hasClip('g:' + g.id) ? `<button data-del="${g.id}">✕</button>` : '<span class="muted">(voice)</span>'}
      </div>`).join('');

    root.innerHTML = `
      <div class="panel">
        <button class="close" data-close>✕ Back to game</button>
        <h1>Grown-ups</h1>

        <section>
          <h2>Current lesson</h2>
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
          <label>Games per session
            <select data-games>${[2, 3, 4, 5, 6].map(n => `<option ${n === s.settings.gamesPerSession ? 'selected' : ''}>${n}</option>`).join('')}</select>
          </label>
          <label>Voice <select data-voice><option value="">Automatic</option>${voices}</select></label>
          <label>Speed <input type="range" min="0.6" max="1.2" step="0.05" value="${s.settings.rate}" data-rate></label>
          <button data-test>Test voice</button>
        </section>

        <section>
          <h2>Record letter sounds</h2>
          <p class="muted">Computer voices say letter sounds poorly (“tuh” for /t/). Recording your own
          voice makes a big difference — say just the sound, short and clipped: /m/ not “muh”.
          Recording needs HTTPS or localhost.</p>
          <div class="clips">${clips}</div>
        </section>

        <section>
          <button class="danger" data-reset>Reset all progress</button>
        </section>
      </div>`;
  };

  root.addEventListener('click', async e => {
    const b = (e.target as HTMLElement).closest('button');
    if (!b) return;
    const d = b.dataset;
    if ('close' in d) return close();
    if (d.lesson) {
      learner.setLesson(d.lesson === '1' ? nextLesson(learner.lesson) : prevLesson(learner.lesson));
    } else if ('test' in d) {
      void audio.say('Hi! Let’s read together. Cat. Sun. Ship.');
    } else if (d.play) {
      void audio.sound(d.play);
    } else if (d.del) {
      await audio.deleteClip('g:' + d.del);
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
          await audio.saveClip('g:' + id, new Blob(chunks, { type: chunks[0]?.type || 'audio/webm' }));
          render();
          void audio.sound(id);
        };
        recorder.start();
        setTimeout(() => recorder?.state === 'recording' && recorder.stop(), 2500);
      } catch {
        alert('Microphone not available. Recording needs HTTPS (or localhost) and microphone permission.');
      }
    } else if ('reset' in d) {
      if (confirm('Erase all progress, stars and stickers?')) learner.reset();
    }
    render();
  });

  root.addEventListener('change', e => {
    const t = e.target as HTMLInputElement;
    const st = learner.s.settings;
    if ('games' in t.dataset) st.gamesPerSession = Number(t.value);
    if ('voice' in t.dataset) st.voice = t.value;
    if ('rate' in t.dataset) st.rate = Number(t.value);
    learner.save();
    audio.configure({ voice: st.voice, rate: st.rate });
  });

  render();
}
