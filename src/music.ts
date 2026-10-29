// Background music: small looping songs played on synthesized acoustic-style instruments —
// plucked strings (Karplus–Strong), marimba, glockenspiel and soft pads, with a shaker, a gentle
// kick, swing, slight human timing and room reverb. No audio files.
//
// Melodies are written one token per eighth note: a note (C5, F#4, Bb4), "." to hold,
// "-" for a rest. One chord per bar drives the bass and the strummed/pad accompaniment.
import { ac, musicBus } from './audio';
import { settings } from './settings';

export type SongId = 'home' | 'pvz' | 'pokemon' | 'paw' | 'friends';

type Lead = 'marimba' | 'pluck' | 'bell';
type Comp = 'uke' | 'pad';
interface Song { bpm: number; chords: string[]; melody: string; lead: Lead; comp: Comp; swing: number }

const SONGS: Record<SongId, Song> = {
  home: {
    bpm: 104, lead: 'marimba', comp: 'uke', swing: 0.12,
    chords: ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'C'],
    melody: `E5 . G5 . A5 G5 E5 . | D5 . C5 . D5 E5 . . | E5 . G5 . A5 G5 E5 C5 | D5 . . . - - - - |
             C5 . E5 . G5 . A5 . | G5 . E5 . D5 . . . | E5 D5 C5 D5 E5 . G5 . | C5 . . . - - - -`,
  },
  pvz: {
    bpm: 98, lead: 'pluck', comp: 'uke', swing: 0.16,
    chords: ['Am', 'F', 'C', 'G', 'Am', 'F', 'G', 'Am'],
    melody: `A4 . C5 . E5 . C5 . | F5 . E5 . C5 . . . | G4 . B4 . D5 . B4 . | C5 . . . E5 . . . |
             A4 . C5 . E5 . A5 . | G5 . F5 . E5 . C5 . | D5 . B4 . G4 . B4 . | A4 . . . - - - -`,
  },
  pokemon: {
    bpm: 120, lead: 'bell', comp: 'pad', swing: 0.05,
    chords: ['G', 'D', 'Em', 'C', 'G', 'D', 'C', 'G'],
    melody: `G4 . B4 . D5 . . G5 | F#5 . D5 . A4 . . . | E5 . G5 . B5 . A5 G5 | E5 . . . - - - - |
             C5 . E5 . G5 . E5 . | D5 . B4 . G4 . . . | A4 B4 C5 D5 E5 . F#5 . | G5 . . . - - - -`,
  },
  paw: {
    bpm: 112, lead: 'pluck', comp: 'uke', swing: 0.1,
    chords: ['F', 'Bb', 'C', 'F', 'F', 'Bb', 'C', 'F'],
    melody: `F4 . A4 . C5 . A4 . | Bb4 . D5 . F5 . D5 . | C5 . E5 . G5 . E5 C5 | F5 . . . F5 . - - |
             A5 . G5 . F5 . C5 . | D5 . F5 . Bb5 . . . | G5 . E5 . C5 . E5 G5 | F5 . . . - - - -`,
  },
  friends: {
    bpm: 94, lead: 'marimba', comp: 'pad', swing: 0.14,
    chords: ['D', 'Bm', 'G', 'A', 'D', 'Bm', 'G', 'D'],
    melody: `F#5 . A5 . F#5 . D5 . | B4 . D5 . F#5 . . . | G5 . F#5 . E5 . D5 . | E5 . . . - - - - |
             D5 E5 F#5 . A5 . F#5 . | B5 . A5 . F#5 . . . | G5 . E5 . C#5 . E5 . | D5 . . . - - - -`,
  },
};

const NOTE: Record<string, number> = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
const freq = (midi: number) => 440 * 2 ** ((midi - 69) / 12);
function midiOf(n: string) {
  const m = n.match(/^([A-G][#b]?)(\d)$/)!;
  return NOTE[m[1]] + (Number(m[2]) + 1) * 12;
}
function chordNotes(c: string, octave: number) {
  const m = c.match(/^([A-G][#b]?)(m?)$/)!;
  const root = NOTE[m[1]] + (octave + 1) * 12;
  return [root, root + (m[2] ? 3 : 4), root + 7];
}

/** Tokens → notes with start step and length (in eighths). */
function parse(melody: string) {
  const toks = melody.replace(/\|/g, ' ').trim().split(/\s+/);
  const out: { midi: number; len: number; at: number }[] = [];
  toks.forEach((t, i) => {
    if (t === '.') { if (out.length) out[out.length - 1].len++; return; }
    out.push({ midi: t === '-' ? -1 : midiOf(t), len: 1, at: i });
  });
  return { notes: out.filter(n => n.midi >= 0), length: toks.length };
}

// ---------- Mix: dry + reverb into the music bus ----------
let dry: GainNode | null = null;
let send: GainNode | null = null;
function outputs() {
  if (dry && send) return { dry, send };
  const c = ac();
  dry = c.createGain();
  dry.connect(musicBus());
  // A small room: decaying stereo noise as the impulse response.
  const len = Math.floor(c.sampleRate * 1.6);
  const ir = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = ir.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
  }
  const verb = c.createConvolver();
  verb.buffer = ir;
  const wet = c.createGain();
  wet.gain.value = 0.32;
  send = c.createGain();
  send.connect(verb).connect(wet).connect(musicBus());
  return { dry, send };
}
/** Route a voice to the mix, with some of it sent to the reverb. */
function route(node: AudioNode, reverb = 0.5) {
  const { dry, send } = outputs();
  node.connect(dry);
  if (reverb > 0) {
    const g = ac().createGain();
    g.gain.value = reverb;
    node.connect(g).connect(send);
  }
}

// ---------- Instruments ----------
// Plucked string (Karplus–Strong): a burst of noise circulating through a tuned, damped delay.
// Rendered once per pitch and cached.
const plucks = new Map<string, AudioBuffer>();
function pluckBuffer(midi: number, bright: number) {
  const key = `${midi}:${bright}`;
  let buf = plucks.get(key);
  if (buf) return buf;
  const c = ac();
  const sr = c.sampleRate, dur = 1.6;
  buf = c.createBuffer(1, Math.floor(sr * dur), sr);
  const d = buf.getChannelData(0);
  const period = Math.max(2, Math.round(sr / freq(midi)));
  const decay = 0.996 - (midi < 48 ? 0 : 0.0015);
  let prev = 0;
  for (let i = 0; i < period; i++) {
    // Softer attack for darker tones: smooth the initial noise.
    const n = Math.random() * 2 - 1;
    prev = prev + (n - prev) * bright;
    d[i] = prev;
  }
  // Each sample is the damped average of two neighbors one period back (the string's low-pass loop).
  for (let i = period; i < d.length; i++) d[i] = decay * 0.5 * (d[i - period] + d[i - period + 1]);
  plucks.set(key, buf);
  return buf;
}
function pluck(midi: number, t: number, vol: number, { bright = 0.6, reverb = 0.45, len = 1.4 } = {}) {
  const c = ac();
  const src = c.createBufferSource();
  src.buffer = pluckBuffer(midi, bright);
  const g = c.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.setTargetAtTime(0, t + len, 0.08);
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 2200 + bright * 3000;
  src.connect(lp).connect(g);
  route(g, reverb);
  src.start(t);
  src.stop(t + len + 0.5);
}

/** Struck bar: a fundamental and inharmonic overtones, each decaying at its own rate. */
function bar(midi: number, t: number, vol: number, partials: [number, number, number][], reverb = 0.5) {
  const c = ac();
  const f = freq(midi);
  const out = c.createGain();
  out.gain.value = vol;
  for (const [ratio, amp, decay] of partials) {
    const o = c.createOscillator();
    o.type = 'sine';
    o.frequency.value = f * ratio;
    const g = c.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(amp, t + 0.004);
    g.gain.setTargetAtTime(0, t + 0.005, decay);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + decay * 7);
  }
  route(out, reverb);
}
const marimba = (m: number, t: number, v: number) => bar(m, t, v, [[1, 1, 0.28], [3.93, 0.25, 0.05], [9.2, 0.06, 0.02]], 0.45);
const bell = (m: number, t: number, v: number) => bar(m, t, v * 0.8, [[1, 1, 0.5], [2.76, 0.35, 0.22], [5.4, 0.15, 0.1]], 0.6);

/** Soft pad: two slightly detuned voices through a low-pass filter, slow in and out. */
function pad(midis: number[], t: number, dur: number, vol: number) {
  const c = ac();
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 900;
  const g = c.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.35);
  g.gain.setTargetAtTime(0, t + dur - 0.2, 0.25);
  lp.connect(g);
  route(g, 0.7);
  for (const m of midis) for (const detune of [-6, 6]) {
    const o = c.createOscillator();
    o.type = 'triangle';
    o.frequency.value = freq(m);
    o.detune.value = detune;
    o.connect(lp);
    o.start(t);
    o.stop(t + dur + 1.2);
  }
}

let noiseBuf: AudioBuffer | null = null;
function shaker(t: number, vol: number) {
  const c = ac();
  noiseBuf ??= (() => {
    const b = c.createBuffer(1, Math.floor(c.sampleRate * 0.12), c.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.sin((Math.PI * i) / d.length);
    return b;
  })();
  const s = c.createBufferSource();
  s.buffer = noiseBuf;
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 6500;
  bp.Q.value = 0.8;
  const g = c.createGain();
  g.gain.value = vol;
  s.connect(bp).connect(g);
  route(g, 0.2);
  s.start(t);
}
function kick(t: number, vol: number) {
  const c = ac();
  const o = c.createOscillator(), g = c.createGain();
  o.frequency.setValueAtTime(110, t);
  o.frequency.exponentialRampToValueAtTime(48, t + 0.14);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
  o.connect(g);
  route(g, 0);
  o.start(t);
  o.stop(t + 0.3);
}

// ---------- Sequencer ----------
let current: SongId | null = null;
let timer: ReturnType<typeof setInterval> | null = null;

/** Start a song (no-op if it's already playing). */
export function playMusic(id: SongId) {
  if (current === id && timer) return;
  stopMusic();
  current = id;
  let c: AudioContext;
  try { c = ac(); } catch { return; }
  const song = SONGS[id];
  const { notes, length } = parse(song.melody);
  const eighth = 60 / song.bpm / 2;
  const startAt = c.currentTime + 0.15;
  let nextStep = 0;
  const human = (amt: number) => (Math.random() * 2 - 1) * amt;
  timer = setInterval(() => {
    const ahead = c.currentTime + 0.3;
    while (startAt + nextStep * eighth < ahead) {
      const step = nextStep++;
      if (!settings.music || document.hidden) continue;
      // Swing: off-beat eighths land a little late.
      const t = startAt + step * eighth + (step % 2 ? song.swing * eighth : 0) + human(0.006);
      const s = step % length;
      const chord = song.chords[Math.floor(s / 8) % song.chords.length];

      for (const n of notes) if (n.at === s) {
        const v = 0.16 * (1 + human(0.12)) * (s % 8 === 0 ? 1.1 : 1);
        if (song.lead === 'marimba') marimba(n.midi, t, v);
        else if (song.lead === 'bell') bell(n.midi, t, v);
        else pluck(n.midi, t, v * 1.4, { bright: 0.75, len: Math.min(1.4, n.len * eighth + 0.3) });
      }

      // Bass: root on beats 1 and 3, a fifth as a pickup before beat 3.
      const [root] = chordNotes(chord, 2);
      if (s % 4 === 0) pluck(root, t, 0.32 * (1 + human(0.08)), { bright: 0.25, reverb: 0.15, len: eighth * 3.5 });
      else if (s % 8 === 3) pluck(root + 7, t, 0.18, { bright: 0.25, reverb: 0.15, len: eighth });

      // Accompaniment: a ukulele strum (low to high, a few ms apart) or a soft pad per bar.
      if (song.comp === 'uke' && (s % 4 === 0 || s % 8 === 6)) {
        const down = s % 4 === 0;
        const voicing = chordNotes(chord, 4);
        (down ? voicing : [...voicing].reverse()).forEach((m, k) =>
          pluck(m, t + k * 0.018, (down ? 0.07 : 0.045) * (1 + human(0.1)), { bright: 0.55, len: eighth * 3 }));
      } else if (song.comp === 'pad' && s % 8 === 0) {
        pad(chordNotes(chord, 3), t, eighth * 8, 0.035);
      }

      if (s % 2 === 1 || s % 8 === 4) shaker(t, (s % 2 ? 0.05 : 0.08) * (1 + human(0.2)));
      if (s % 8 === 0 || s % 8 === 4) kick(t, 0.22);
    }
  }, 50);
}

export function stopMusic() {
  if (timer) clearInterval(timer);
  timer = null;
  current = null;
}
