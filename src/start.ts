// Where a new player starts: one question for the grown-up, right after the player is made. The
// answers start at the first lesson of a land on the map; skipping ahead (Learner.checkSkipAhead)
// sorts out a rough guess, so "Not sure" just starts at the beginning. The biggest, first button
// is the beginning too, so a child tapping on their own starts there.
import * as state from './state';

export const STARTS = [
  { lesson: 1, icon: '🌱', title: 'Just starting', what: 'Learning letters and the sounds they make' },
  { lesson: 12, icon: '🔤', title: 'Knows most letter sounds', what: 'Can tell you m says “mmm” and s says “sss”' },
  { lesson: 18, icon: '🐱', title: 'Sounds out short words', what: 'Reads words like cat, sit and mop by sounding them out' },
  { lesson: 42, icon: '📖', title: 'Reads simple sentences', what: 'Reads words like flag and stop, and short sentences' },
];

/** The answers as buttons (data-start = lesson): the one matching `lesson` marked, or the first one stands out. */
export const startButtons = (lesson?: number) => STARTS.map((s, i) => `
  <button class="start ${lesson === undefined && i === 0 ? 'first' : ''} ${s.lesson === lesson ? 'on' : ''}" data-start="${s.lesson}">
    <span class="icon">${s.icon}</span><b>${s.title}</b><span class="muted">${s.what}</span>
  </button>`).join('');

/** Ask where the new player should start, and put them there. */
export function askStart(): Promise<void> {
  return new Promise(resolve => {
    const root = document.createElement('div');
    root.id = 'parent';
    root.innerHTML = `
      <div class="panel">
        <h1>Grown-ups: where should this player start?</h1>
        <p class="muted">A rough guess is fine. The game moves on by itself as they learn, and skips ahead
          when things are too easy. You can change this later in the grown-up area (hold the 🔒).</p>
        <div class="starts">${startButtons()}</div>
        <p><button data-start="1">Not sure? Start at the beginning</button></p>
      </div>`;
    root.addEventListener('click', e => {
      const b = (e.target as HTMLElement).closest<HTMLElement>('[data-start]');
      if (!b) return;
      const lesson = Number(b.dataset.start);
      if (lesson > state.learner.lesson) state.learner.place(lesson, { quiet: true });
      root.remove();
      resolve();
    });
    document.body.append(root);
  });
}
