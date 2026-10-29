// Voice, letter sounds, sound effects. Phrases play from pre-recorded clips (npm run voice)
// through WebAudio; anything without a clip falls back to the device's speech synthesis.
// A grown-up's own recording of a letter sound always wins.
import manifest from './voice/manifest.json';
import { GRAPHEMES } from './data/curriculum';
import { slug } from './lines';
import { settings, onSettingsChange } from './settings';

const CLIPS = manifest.clips as Record<string, number>;
const SOUNDS = manifest.sounds as Record<string, string>;
const BASE = `${import.meta.env.BASE_URL}voice/`;

// ---------- WebAudio graph ----------
let actx: AudioContext | undefined;
let busVoice: GainNode, busSfx: GainNode, busMusic: GainNode;

export function ac(): AudioContext {
  if (!actx) {
    actx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    busVoice = actx.createGain();
    busSfx = actx.createGain();
    busMusic = actx.createGain();
    for (const b of [busVoice, busSfx, busMusic]) b.connect(actx.destination);
    applySettings();
  }
  if (actx.state === 'suspended') void actx.resume();
  return actx;
}
export const musicBus = () => (ac(), busMusic);

const MUSIC_LEVEL = 0.5;
let speaking = 0;
function applySettings() {
  if (!actx) return;
  const t = actx.currentTime;
  busSfx.gain.setTargetAtTime(settings.sfx ? 1 : 0, t, 0.02);
  busMusic.gain.setTargetAtTime(settings.music ? MUSIC_LEVEL * (speaking ? 0.35 : 1) : 0, t, 0.15);
}
onSettingsChange(() => { voice = null; applySettings(); });

// Must run inside a user gesture on iOS.
let unlocked = false;
export function unlock() {
  try { ac(); } catch { /* no WebAudio */ }
  if ('speechSynthesis' in window && !unlocked) {
    speechSynthesis.speak(new SpeechSynthesisUtterance(' '));
    unlocked = true;
  }
}

// ---------- Clips ----------
const buffers = new Map<string, Promise<AudioBuffer | null>>();
function load(key: string): Promise<AudioBuffer | null> {
  let p = buffers.get(key);
  if (!p) {
    p = fetch(BASE + key + '.m4a')
      .then(r => (r.ok ? r.arrayBuffer() : Promise.reject(r.status)))
      .then(b => ac().decodeAudioData(b))
      .catch(() => null);
    buffers.set(key, p);
  }
  return p;
}

/** Warm the cache so the first prompt plays without delay. */
export function preload(texts: string[]) {
  for (const t of texts) { const k = slug(t); if (CLIPS[k]) void load(k); }
}

let current: AudioBufferSourceNode | null = null;
let currentEl: HTMLAudioElement | null = null;

export function stop() {
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  if (current) { try { current.stop(); } catch { /* already stopped */ } current = null; }
  if (currentEl) { currentEl.pause(); currentEl = null; }
}

function duck(on: boolean) {
  speaking = Math.max(0, speaking + (on ? 1 : -1));
  applySettings();
}

async function playBuffer(key: string, rate = 1): Promise<boolean> {
  const buf = await load(key);
  if (!buf) return false;
  stop();
  const c = ac();
  const src = c.createBufferSource();
  src.buffer = buf;
  src.playbackRate.value = rate;
  src.connect(busVoice);
  current = src;
  duck(true);
  await new Promise<void>(resolve => {
    src.onended = () => resolve();
    src.start();
    // Safety net if onended never fires (backgrounded tab).
    setTimeout(resolve, (buf.duration / rate) * 1000 + 500);
  });
  duck(false);
  if (current === src) current = null;
  return true;
}

// ---------- Speech ----------
/** Character voices: the narrator's recording sped up or slowed down. */
export type Style = 'narrator' | 'pika' | 'zombie' | 'monster' | 'frog' | 'pup';
const STYLE_RATE: Record<Style, number> = { narrator: 1, pika: 1.45, zombie: 0.72, monster: 0.82, frog: 1.25, pup: 1.15 };

let voice: SpeechSynthesisVoice | null = null;
const PREFERRED = ['Samantha', 'Google US English', 'Microsoft Aria', 'Microsoft Jenny', 'Karen', 'Moira', 'Tessa', 'Allison', 'Ava'];
function pickVoice() {
  if (voice) return voice;
  const vs = voices();
  voice = vs.find(v => v.name === settings.voice)
    || PREFERRED.map(n => vs.find(v => v.name.includes(n))).find(Boolean)
    || vs.find(v => /en-US/i.test(v.lang)) || vs[0] || null;
  return voice;
}
export const voices = () => (window.speechSynthesis?.getVoices() || []).filter(v => /^en/i.test(v.lang));
if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = () => { voice = null; };

function synthesize(text: string, rate: number, pitch: number): Promise<void> {
  if (!('speechSynthesis' in window) || !text) return Promise.resolve();
  stop();
  duck(true);
  return new Promise<void>(resolve => {
    const u = new SpeechSynthesisUtterance(text);
    const v = pickVoice();
    if (v) u.voice = v;
    u.lang = v?.lang || 'en-US';
    u.rate = settings.rate * rate;
    u.pitch = pitch;
    let done = false;
    const finish = () => { if (!done) { done = true; clearTimeout(timer); duck(false); resolve(); } };
    const timer = setTimeout(finish, 1500 + text.length * 110 / u.rate);
    u.onend = finish;
    u.onerror = finish;
    speechSynthesis.speak(u);
  });
}

/** Speak a phrase; resolves when done. */
export async function say(text: string, { style = 'narrator' as Style } = {}): Promise<void> {
  if (!text) return;
  const r = STYLE_RATE[style];
  const k = slug(text);
  if (CLIPS[k] && await playBuffer(k, r)) return;
  await synthesize(text, 1, style === 'narrator' ? 1.1 : Math.min(2, Math.max(0.1, r * 1.1)));
}

// ---------- Letter sounds ----------
const recordings = new Map<string, string>(); // id -> object URL

function db(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open('kidsread', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('clips');
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}
async function tx(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => void) {
  const d = await db();
  return new Promise<void>((resolve, reject) => {
    const t = d.transaction('clips', mode);
    fn(t.objectStore('clips'));
    t.oncomplete = () => resolve();
    t.onerror = () => reject(t.error);
  });
}

export async function loadRecordings() {
  try {
    const d = await db();
    await new Promise<void>(resolve => {
      const req = d.transaction('clips').objectStore('clips').openCursor();
      req.onsuccess = () => {
        const c = req.result;
        if (!c) return resolve();
        recordings.set(String(c.key), URL.createObjectURL(c.value as Blob));
        c.continue();
      };
      req.onerror = () => resolve();
    });
  } catch { /* IndexedDB unavailable */ }
}
export const hasRecording = (id: string) => recordings.has(id);
export async function saveRecording(id: string, blob: Blob) {
  await tx('readwrite', s => s.put(blob, id));
  if (recordings.has(id)) URL.revokeObjectURL(recordings.get(id)!);
  recordings.set(id, URL.createObjectURL(blob));
}
export async function deleteRecording(id: string) {
  await tx('readwrite', s => s.delete(id));
  if (recordings.has(id)) URL.revokeObjectURL(recordings.get(id)!);
  recordings.delete(id);
}

function playUrl(url: string): Promise<void> {
  stop();
  duck(true);
  return new Promise<void>(resolve => {
    const a = new Audio(url);
    currentEl = a;
    const done = () => { if (currentEl === a) currentEl = null; duck(false); resolve(); };
    a.onended = a.onerror = done;
    a.play().catch(done);
  });
}

/** A letter sound: grown-up's recording, else the generated clip, else speech. */
export async function sound(g: string): Promise<void> {
  const rec = recordings.get('g:' + g);
  if (rec) return playUrl(rec);
  if (SOUNDS[g] && await playBuffer(SOUNDS[g])) return;
  await synthesize(GRAPHEMES[g]?.tts || g, 0.8, 1.1);
}

// ---------- Sound effects ----------
function tone(freq: number, dur: number, { type = 'sine' as OscillatorType, vol = 0.25, to = 0, delay = 0 } = {}) {
  if (!settings.sfx) return;
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
    o.connect(g).connect(busSfx);
    o.start(t);
    o.stop(t + dur + 0.02);
  } catch { /* audio unavailable */ }
}
function noise(dur: number, { vol = 0.2, delay = 0, hp = 800 } = {}) {
  if (!settings.sfx) return;
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
    src.connect(f).connect(g).connect(busSfx);
    src.start(c.currentTime + delay);
  } catch { /* audio unavailable */ }
}

export const sfx = {
  tap: () => tone(660, 0.08, { type: 'triangle', vol: 0.15 }),
  pop: () => { tone(500, 0.1, { to: 1200, type: 'triangle' }); noise(0.05, { vol: 0.1, hp: 2000 }); },
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
  sparkle: () => [1568, 2093, 2637, 3136].forEach((f, i) => tone(f, 0.12, { type: 'sine', vol: 0.08, delay: i * 0.06 })),
  grow: () => tone(200, 0.5, { to: 900, type: 'triangle', vol: 0.12 }),
  bark: () => { noise(0.07, { vol: 0.25, hp: 500 }); tone(420, 0.09, { to: 260, type: 'sawtooth', vol: 0.1 }); },
};
