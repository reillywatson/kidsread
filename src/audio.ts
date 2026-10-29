// Voice (Web Speech API), grown-up recorded letter sounds (IndexedDB), and
// synthesized sound effects (WebAudio) — no audio files needed.
import { GRAPHEMES } from './data/curriculum';

let actx: AudioContext | undefined;
function ac(): AudioContext {
  actx ||= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  if (actx.state === 'suspended') actx.resume();
  return actx;
}

// Must run inside a user gesture on iOS.
let unlocked = false;
export function unlock() {
  try { ac(); } catch { /* no WebAudio */ }
  if ('speechSynthesis' in window && !unlocked) {
    speechSynthesis.speak(new SpeechSynthesisUtterance(' '));
    unlocked = true;
  }
}

// ---------- Speech ----------
const settings = { rate: 0.9, voice: '' };
export function configure(s: Partial<typeof settings>) { Object.assign(settings, s); voice = null; }

let voice: SpeechSynthesisVoice | null = null;
const PREFERRED = ['Samantha', 'Google US English', 'Microsoft Aria', 'Microsoft Jenny', 'Karen', 'Moira', 'Tessa', 'Allison', 'Ava'];
function pickVoice() {
  if (voice) return voice;
  const vs = (window.speechSynthesis?.getVoices() || []).filter(v => /^en/i.test(v.lang));
  voice = vs.find(v => v.name === settings.voice)
    || PREFERRED.map(n => vs.find(v => v.name.includes(n))).find(Boolean)
    || vs.find(v => /en-US/i.test(v.lang)) || vs[0] || null;
  return voice;
}
export const voices = () => (window.speechSynthesis?.getVoices() || []).filter(v => /^en/i.test(v.lang));
if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = () => { voice = null; };

let current: HTMLAudioElement | null = null; // currently playing clip
export function stop() {
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  if (current) { current.pause(); current = null; }
}

// Speak text; resolves when done. A timeout guards against browsers that never fire onend.
export function say(text: string, { rate = 1, pitch = 1.1 } = {}): Promise<void> {
  if (!('speechSynthesis' in window) || !text) return Promise.resolve();
  stop();
  return new Promise<void>(resolve => {
    const u = new SpeechSynthesisUtterance(text);
    const v = pickVoice();
    if (v) u.voice = v;
    u.lang = v?.lang || 'en-US';
    u.rate = settings.rate * rate;
    u.pitch = pitch;
    let done = false;
    const finish = () => { if (!done) { done = true; clearTimeout(timer); resolve(); } };
    const timer = setTimeout(finish, 1500 + text.length * 110 / u.rate);
    u.onend = finish;
    u.onerror = finish;
    speechSynthesis.speak(u);
  });
}

// ---------- Recorded letter sounds ----------
const clipUrls = new Map<string, string>(); // id -> object URL

function db(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open('kidsread', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('clips');
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}
async function tx(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest | void) {
  const d = await db();
  return new Promise<void>((resolve, reject) => {
    const t = d.transaction('clips', mode);
    const req = fn(t.objectStore('clips'));
    void req;
    t.oncomplete = () => resolve();
    t.onerror = () => reject(t.error);
  });
}

export async function loadClips() {
  try {
    const d = await db();
    await new Promise<void>(resolve => {
      const store = d.transaction('clips').objectStore('clips');
      const req = store.openCursor();
      req.onsuccess = () => {
        const c = req.result;
        if (!c) return resolve();
        clipUrls.set(String(c.key), URL.createObjectURL(c.value as Blob));
        c.continue();
      };
      req.onerror = () => resolve();
    });
  } catch { /* IndexedDB unavailable: fall back to speech */ }
}
export const hasClip = (id: string) => clipUrls.has(id);
export async function saveClip(id: string, blob: Blob) {
  await tx('readwrite', s => s.put(blob, id));
  if (clipUrls.has(id)) URL.revokeObjectURL(clipUrls.get(id)!);
  clipUrls.set(id, URL.createObjectURL(blob));
}
export async function deleteClip(id: string) {
  await tx('readwrite', s => s.delete(id));
  if (clipUrls.has(id)) URL.revokeObjectURL(clipUrls.get(id)!);
  clipUrls.delete(id);
}

function playUrl(url: string): Promise<void> {
  stop();
  return new Promise<void>(resolve => {
    const a = new Audio(url);
    current = a;
    a.onended = a.onerror = () => { if (current === a) current = null; resolve(); };
    a.play().catch(() => resolve());
  });
}

// Play a letter sound: the grown-up's recording if there is one, otherwise speech.
export function sound(g: string): Promise<void> {
  const clip = clipUrls.get('g:' + g);
  if (clip) return playUrl(clip);
  return say(GRAPHEMES[g]?.tts || g, { rate: 0.8 });
}

// ---------- Sound effects ----------
function tone(freq: number, dur: number, { type = 'sine' as OscillatorType, vol = 0.25, to = 0, delay = 0 } = {}) {
  try {
    const c = ac();
    const t = c.currentTime + delay;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  } catch { /* audio unavailable */ }
}
function noise(dur: number, { vol = 0.2, delay = 0, hp = 800 } = {}) {
  try {
    const c = ac();
    const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const src = c.createBufferSource();
    src.buffer = buf;
    const f = c.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = hp;
    const g = c.createGain();
    g.gain.value = vol;
    src.connect(f).connect(g).connect(c.destination);
    src.start(c.currentTime + delay);
  } catch { /* audio unavailable */ }
}

export const sfx = {
  tap: () => tone(660, 0.08, { type: 'triangle', vol: 0.15 }),
  pop: () => tone(400, 0.12, { to: 900, type: 'triangle' }),
  ding: () => { tone(880, 0.15, { type: 'triangle' }); tone(1320, 0.3, { type: 'triangle', delay: 0.1 }); },
  boing: () => tone(220, 0.35, { to: 110, type: 'sine', vol: 0.3 }),
  pew: () => tone(1200, 0.15, { to: 300, type: 'square', vol: 0.08 }),
  splat: () => noise(0.25, { vol: 0.3, hp: 300 }),
  chomp: () => { noise(0.08, { vol: 0.3, hp: 200 }); noise(0.08, { vol: 0.3, hp: 200, delay: 0.15 }); },
  whoosh: () => noise(0.4, { vol: 0.15, hp: 1500 }),
  hop: () => tone(300, 0.2, { to: 700, type: 'sine' }),
  splash: () => noise(0.5, { vol: 0.25, hp: 600 }),
  flip: () => tone(500, 0.06, { type: 'triangle', vol: 0.12 }),
  zap: () => { tone(1500, 0.3, { to: 80, type: 'sawtooth', vol: 0.08 }); noise(0.3, { vol: 0.1, hp: 3000 }); },
  siren: () => { for (let i = 0; i < 4; i++) tone(i % 2 ? 660 : 880, 0.25, { type: 'square', vol: 0.06, delay: i * 0.25 }); },
  wobble: () => { for (let i = 0; i < 3; i++) tone(300, 0.1, { type: 'triangle', vol: 0.15, delay: i * 0.45 }); },
  fanfare: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i === 3 ? 0.6 : 0.18, { type: 'triangle', vol: 0.2, delay: i * 0.14 })),
  star: () => tone(1046, 0.25, { to: 2093, type: 'triangle', vol: 0.12 }),
};
