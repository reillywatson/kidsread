// Grown-ups: playtest any game at any lesson and level. A panel lists every game by world; tapping
// one plays just that game as a throwaway player (see state.sandbox), then comes back here.
import Phaser from 'phaser';
import * as state from '../state';
import { GAMES } from '../games';
import type { Theme } from '../games/BaseGame';
import { LESSONS } from '../data/curriculum';
import type { Tier } from '../learner';
import { Session } from '../session';

const WORLDS: [Theme, string][] = [['pvz', '🌻 Plants vs. Zombies'], ['pokemon', '⚡ Pokémon'], ['paw', '🐾 Paw Patrol'], ['friends', '💜 Friends']];
const LEVELS = ['Easy', 'Medium', 'Hard'];
const KEY = 'kidsread.playtest';

const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/** The last lesson and level picked, so a run of playtests keeps its settings. */
function loadPick(): { lesson: number; tier: Tier } {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (v && LESSONS.some(l => l.n === v.lesson) && [0, 1, 2].includes(v.tier)) return v;
  } catch { /* blocked */ }
  return { lesson: 1, tier: 0 };
}
function savePick(v: { lesson: number; tier: Tier }) {
  try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* blocked */ }
}

/** First lesson a game can be played at. */
const opensAt = (eligible: (lesson: number) => boolean) => LESSONS.find(l => eligible(l.n))?.n;

export class Playtest extends Phaser.Scene {
  constructor() { super('Playtest'); }

  create() {
    this.add.image(640, 360, 'bgHome');
    const pick = loadPick();
    const root = document.createElement('div');
    root.id = 'parent';
    document.body.append(root);
    const close = () => root.remove();
    this.events.once('shutdown', close);

    const render = () => {
      const lessons = LESSONS.map(l =>
        `<option value="${l.n}" ${l.n === pick.lesson ? 'selected' : ''}>${l.n}. ${esc(l.title)}</option>`).join('');
      const levels = LEVELS.map((name, t) =>
        `<button data-tier="${t}" class="${t === pick.tier ? 'on' : ''}">${name}</button>`).join('');
      const worlds = WORLDS.map(([theme, name]) => {
        const games = GAMES.map(g => g.meta).filter(m => m.theme === theme).map(m => {
          const [title, what] = m.title.replace(' (bonus)', '').split(' — ');
          const ok = m.eligible(pick.lesson);
          const from = ok ? '' : opensAt(m.eligible);
          const tag = m.bonus ? 'bonus' : m.goal ? 'goal' : m.skill;
          return `<button class="game" data-game="${m.id}" ${ok ? '' : 'disabled'}>
            <b>${esc(title)}</b> <span class="tag">${tag}</span>
            <span class="muted">${ok ? esc(what ?? 'Just for fun') : from ? `Opens at lesson ${from}` : 'Not available yet'}</span>
          </button>`;
        }).join('');
        return `<section><h2>${name}</h2><div class="games">${games}</div></section>`;
      }).join('');

      root.innerHTML = `
        <div class="panel">
          <button class="close" data-exit>✕ Done</button>
          <h1>Playtest</h1>
          <p class="muted">Play any game at any lesson and level. Games are played by a throwaway player:
            no one's progress, play history or stats change.</p>
          <section>
            <label>Lesson <select data-lesson>${lessons}</select></label>
            <div class="seg">Level ${levels}</div>
            <p class="muted">The lesson sets which sounds and words come up (everything taught so far).
              The level sets the number of choices, how close the wrong answers are, and how much help is given.</p>
          </section>
          ${worlds}
        </div>`;
    };

    root.addEventListener('change', e => {
      const el = e.target as HTMLSelectElement;
      if (el.dataset.lesson === undefined) return;
      pick.lesson = Number(el.value);
      savePick(pick);
      render();
    });
    root.addEventListener('click', e => {
      const b = (e.target as HTMLElement).closest('button');
      if (!b) return;
      const d = b.dataset;
      if ('exit' in d) { close(); this.scene.start('Profiles'); }
      else if (d.tier) { pick.tier = Number(d.tier) as Tier; savePick(pick); render(); }
      else if (d.game) {
        close();
        state.sandbox(pick.lesson, pick.tier);
        new Session(undefined, { returnTo: 'Playtest', only: d.game }).start(this);
      }
    });
    render();
  }
}
