// Voice, letter sounds, sound effects. All speech is pre-recorded (npm run voice) and plays
// through WebAudio. There is deliberately no speech-synthesis fallback: a phrase without a
// recording stays silent (and fails the voice-coverage test), rather than switching to a
// robotic device voice. A grown-up's own recording of a letter sound always wins.
import manifest from './voice/manifest.json';
import { slug } from './lines';
import { settings, onSettingsChange } from './settings';

const CLIPS = manifest.clips as Record<string, unknown>;
// Letter sounds: { file } entries (older manifests stored just the file name).
const SOUNDS = manifest.sounds as unknown as Record<string, string | { file: string }>;
const soundFile = (g: string) => { const s = SOUNDS[g]; return typeof s === 'string' ? s : s?.file; };
const BASE = `${import.meta.env.BASE_URL}voice/`;

/** Short hash of what a clip was made from: re-recording a clip changes its URL, so it can be cached forever. */
function version(s: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193);
  return (h >>> 0).toString(36);
}
const VERSIONS = new Map<string, string>([
  ...Object.entries(CLIPS).map(([k, v]) => [k, version(String(v))] as [string, string]),
  ...Object.values(SOUNDS).map(s => (typeof s === 'string' ? [s, version(s)] : [s.file, version((s as { cache?: string }).cache ?? s.file)]) as [string, string]),
]);
const clipUrl = (key: string) => `${BASE}${key}.m4a?v=${VERSIONS.get(key) ?? '0'}`;

/** Every voice clip's URL, for downloading them all to use offline. */
export const allClipUrls = () => [...VERSIONS.keys()].map(clipUrl);

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
onSettingsChange(applySettings);

// Must run inside a user gesture on iOS.
export function unlock() {
  try { ac(); } catch { /* no WebAudio */ }
}

/**
 * Whether sound can play without a tap first. Browsers (always on iPad) hold audio back until
 * the first tap, then release everything at once; the boot screen asks for a tap instead.
 */
export async function canPlayNow(): Promise<boolean> {
  let c: AudioContext;
  try { c = ac(); } catch { return true; }
  if (c.state === 'running') return true;
  await Promise.race([c.resume().catch(() => {}), new Promise(r => setTimeout(r, 300))]);
  return (c.state as AudioContextState) === 'running';
}

// ---------- Clips ----------
const buffers = new Map<string, Promise<AudioBuffer | null>>();
function load(key: string): Promise<AudioBuffer | null> {
  let p = buffers.get(key);
  if (!p) {
    p = fetch(clipUrl(key))
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
  if (current) { try { current.stop(); } catch { /* already stopped */ } current = null; }
  if (currentEl) { currentEl.pause(); currentEl = null; }
}

/** True while the narrator (or a letter sound) is talking. */
export const isSpeaking = () => speaking > 0;

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
    // Safety net if onended never fires: the audio is suspended (sound not unlocked yet, or a
    // backgrounded tab). Cancel the clip too, or it would play late, over whatever comes next.
    setTimeout(() => { try { src.stop(); } catch { /* already stopped */ } resolve(); }, (buf.duration / rate) * 1000 + 500);
  });
  duck(false);
  if (current === src) current = null;
  return true;
}

// ---------- Speech ----------
/**
 * Character voices: the narrator's recording sped up or slowed down. The character lines are
 * already recorded in character (see the voice script's delivery tags), so this is a light touch.
 */
export type Style = 'narrator' | 'pika' | 'zombie' | 'monster' | 'frog' | 'pup';
const STYLE_RATE: Record<Style, number> = { narrator: 1, pika: 1.2, zombie: 0.85, monster: 0.9, frog: 1.1, pup: 1.05 };

function missing(what: string) {
  if (import.meta.env.DEV) console.warn(`No recording for ${what} — run \`npm run voice\``);
}

/** Speak a phrase; resolves when done. */
export async function say(text: string, { style = 'narrator' as Style } = {}): Promise<void> {
  if (!text) return;
  const k = slug(text);
  if (CLIPS[k] && await playBuffer(k, STYLE_RATE[style])) return;
  missing(`"${text}"`);
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

/** A letter sound: grown-up's recording, else the generated clip. */
export async function sound(g: string): Promise<void> {
  const rec = recordings.get('g:' + g);
  if (rec) return playUrl(rec);
  const file = soundFile(g);
  if (file && await playBuffer(file)) return;
  missing(`the letter sound "${g}"`);
}

// ---------- Haptics ----------
/** A light buzz on devices that support it (Android; iOS browsers ignore it). Off with sounds. */
export function buzz(pattern: number | number[]) {
  if (!settings.sfx) return;
  try { navigator.vibrate?.(pattern); } catch { /* not supported */ }
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
  /** A ding that climbs a major scale with each answer in a streak. */
  chime: (step: number) => {
    const f = 660 * 2 ** ([0, 2, 4, 5, 7, 9, 11, 12][Math.min(step, 7)] / 12);
    tone(f, 0.15, { type: 'triangle' });
    tone(f * 1.5, 0.3, { type: 'triangle', delay: 0.1 });
  },
  /** One step of the power meter filling up. */
  charge: (step: number) => tone(500 + step * 180, 0.18, { to: 900 + step * 260, type: 'triangle', vol: 0.12 }),
  /** The power meter is full: a big rising run and a crash. */
  power: () => {
    [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, i === 5 ? 0.7 : 0.12, { type: 'square', vol: 0.06, delay: i * 0.07 }));
    noise(0.6, { vol: 0.18, hp: 1200, delay: 0.42 });
  },
  burp: () => { tone(110, 0.45, { to: 70, type: 'sawtooth', vol: 0.18 }); noise(0.3, { vol: 0.12, hp: 150 }); },
  /** A tickled-character giggle: three quick wobbly hops up. */
  giggle: () => [0, 1, 2, 3].forEach(i => tone(700 + i * 90, 0.09, { to: 950 + i * 90, type: 'sine', vol: 0.14, delay: i * 0.09 })),
  tick: () => tone(1800, 0.04, { type: 'triangle', vol: 0.08 }),
  twinkle: () => tone(1400 + Math.random() * 1200, 0.12, { type: 'sine', vol: 0.06 }),
  buzz: () => { for (let i = 0; i < 6; i++) tone(180 + (i % 2) * 30, 0.08, { type: 'sawtooth', vol: 0.03, delay: i * 0.08 }); },
  slurp: () => tone(300, 0.25, { to: 1400, type: 'sine', vol: 0.18 }),
  drum: () => { tone(110, 0.3, { to: 50, type: 'sine', vol: 0.5 }); noise(0.08, { vol: 0.25, hp: 400 }); },
  coin: () => { tone(988, 0.08, { type: 'square', vol: 0.07 }); tone(1319, 0.3, { type: 'square', vol: 0.07, delay: 0.08 }); },
  stomp: () => { tone(90, 0.3, { to: 40, type: 'sine', vol: 0.4 }); noise(0.2, { vol: 0.2, hp: 100 }); },
  hammer: () => { tone(900, 0.05, { type: 'square', vol: 0.06 }); noise(0.06, { vol: 0.15, hp: 1500 }); },
  /** Rocket engines: a long rising roar. */
  launch: () => { noise(1.6, { vol: 0.25, hp: 200 }); tone(80, 1.6, { to: 400, type: 'sawtooth', vol: 0.06 }); },
};
