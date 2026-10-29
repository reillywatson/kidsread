// Background music: tiny looping chiptune songs, synthesized live (no audio files).
// Melodies are written one token per eighth note: a note (C5, F#4, Bb4), "." to hold,
// "-" for a rest. One chord per bar drives the bass and pad.
import { ac, musicBus } from './audio';
import { settings } from './settings';

export type SongId = 'home' | 'pvz' | 'pokemon' | 'paw' | 'friends';

interface Song { bpm: number; chords: string[]; melody: string; lead: OscillatorType }

const SONGS: Record<SongId, Song> = {
  home: {
    bpm: 112, lead: 'square',
    chords: ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'C'],
    melody: `E5 . G5 . A5 G5 E5 . | D5 . C5 . D5 E5 . . | E5 . G5 . A5 G5 E5 C5 | D5 . . . - - - - |
             C5 . E5 . G5 . A5 . | G5 . E5 . D5 . . . | E5 D5 C5 D5 E5 . G5 . | C5 . . . - - - -`,
  },
  pvz: {
    bpm: 104, lead: 'triangle',
    chords: ['Am', 'F', 'C', 'G', 'Am', 'F', 'G', 'Am'],
    melody: `A4 . C5 . E5 . C5 . | F5 . E5 . C5 . . . | G4 . B4 . D5 . B4 . | C5 . . . E5 . . . |
             A4 . C5 . E5 . A5 . | G5 . F5 . E5 . C5 . | D5 . B4 . G4 . B4 . | A4 . . . - - - -`,
  },
  pokemon: {
    bpm: 132, lead: 'square',
    chords: ['G', 'D', 'Em', 'C', 'G', 'D', 'C', 'G'],
    melody: `G4 . B4 . D5 . . G5 | F#5 . D5 . A4 . . . | E5 . G5 . B5 . A5 G5 | E5 . . . - - - - |
             C5 . E5 . G5 . E5 . | D5 . B4 . G4 . . . | A4 B4 C5 D5 E5 . F#5 . | G5 . . . - - - -`,
  },
  paw: {
    bpm: 120, lead: 'square',
    chords: ['F', 'Bb', 'C', 'F', 'F', 'Bb', 'C', 'F'],
    melody: `F4 . A4 . C5 . A4 . | Bb4 . D5 . F5 . D5 . | C5 . E5 . G5 . E5 C5 | F5 . . . F5 . - - |
             A5 . G5 . F5 . C5 . | D5 . F5 . Bb5 . . . | G5 . E5 . C5 . E5 G5 | F5 . . . - - - -`,
  },
  friends: {
    bpm: 100, lead: 'triangle',
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
function chordNotes(c: string, octave = 3) {
  const m = c.match(/^([A-G][#b]?)(m?)$/)!;
  const root = NOTE[m[1]] + (octave + 1) * 12;
  return [root, root + (m[2] ? 3 : 4), root + 7];
}

/** Tokens → [{midi, eighths}] including rests (midi = -1). */
function parse(melody: string) {
  const toks = melody.replace(/\|/g, ' ').trim().split(/\s+/);
  const out: { midi: number; len: number; at: number }[] = [];
  toks.forEach((t, i) => {
    if (t === '.') { if (out.length) out[out.length - 1].len++; return; }
    out.push({ midi: t === '-' ? -1 : midiOf(t), len: 1, at: i });
  });
  return { notes: out.filter(n => n.midi >= 0), length: toks.length };
}

function voice(type: OscillatorType, f: number, t: number, dur: number, vol: number, out: AudioNode) {
  const c = ac();
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = f;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.01);
  g.gain.setTargetAtTime(vol * 0.6, t + 0.02, 0.08);
  g.gain.setTargetAtTime(0, t + dur * 0.9, 0.04);
  o.connect(g).connect(out);
  o.start(t);
  o.stop(t + dur + 0.2);
}
function drum(kind: 'kick' | 'hat', t: number, out: AudioNode) {
  const c = ac();
  if (kind === 'kick') {
    const o = c.createOscillator(), g = c.createGain();
    o.frequency.setValueAtTime(140, t);
    o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    g.gain.setValueAtTime(0.35, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    o.connect(g).connect(out);
    o.start(t); o.stop(t + 0.2);
  } else {
    const buf = c.createBuffer(1, c.sampleRate * 0.04, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = buf; f.type = 'highpass'; f.frequency.value = 7000; g.gain.value = 0.06;
    s.connect(f).connect(g).connect(out);
    s.start(t);
  }
}

let current: SongId | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let startAt = 0;
let nextStep = 0;

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
  const out = musicBus();
  startAt = c.currentTime + 0.1;
  nextStep = 0;
  timer = setInterval(() => {
    const ahead = c.currentTime + 0.25;
    while (startAt + nextStep * eighth < ahead) {
      const step = nextStep++;
      const t = startAt + step * eighth;
      if (!settings.music || document.hidden) continue;
      const s = step % length;
      for (const n of notes) if (n.at === s) voice(song.lead, freq(n.midi), t, n.len * eighth, 0.07, out);
      const chord = song.chords[Math.floor(s / 8) % song.chords.length];
      const [root] = chordNotes(chord, 2);
      if (s % 4 === 0) voice('triangle', freq(root), t, eighth * 1.8, 0.16, out);
      if (s % 8 === 0) for (const m of chordNotes(chord, 4)) voice('sine', freq(m), t, eighth * 7, 0.025, out);
      if (s % 4 === 0) drum('kick', t, out);
      if (s % 2 === 1) drum('hat', t, out);
    }
  }, 50);
}

export function stopMusic() {
  if (timer) clearInterval(timer);
  timer = null;
  current = null;
}
