#!/usr/bin/env node
// Pre-records every spoken line, word, picture name and letter sound with macOS `say`,
// trims silence, and encodes AAC (.m4a) into public/voice/. Writes src/voice/manifest.json.
//
//   npm run voice                 # best installed voice (Premium/Enhanced preferred)
//   VOICE="Ava (Premium)" npm run voice
//   npm run voice -- --force      # regenerate everything
//
// Install better voices in System Settings → Accessibility → Spoken Content →
// System Voice → Manage Voices (e.g. "Ava (Premium)" or "Zoe (Premium)"), then re-run.
import { execFile, execFileSync } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdirSync, readFileSync, writeFileSync, existsSync, rmSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { LESSONS, GRAPHEMES, PIC, BANK, HEART } from '../src/data/curriculum.ts';
import { STICKERS } from '../src/data/stickers.ts';
import { allLines, slug } from '../src/lines.ts';

const run = promisify(execFile);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public/voice');
const MANIFEST = join(ROOT, 'src/voice/manifest.json');
const TMP = join(tmpdir(), 'kidsread-voice');
const FORCE = process.argv.includes('--force');
const RATE = Number(process.env.RATE || 165);
const SR = 22050;

// ---------- Pick a voice ----------
const installed = execFileSync('say', ['-v', '?']).toString().split('\n')
  .map(l => l.match(/^(.+?)\s{2,}(en_\w+)/)).filter(Boolean).map(m => ({ name: m[1].trim(), lang: m[2] }));
const VOICE = process.env.VOICE
  || installed.find(v => /Premium/.test(v.name) && v.lang === 'en_US')?.name
  || installed.find(v => /Enhanced/.test(v.name) && v.lang === 'en_US')?.name
  || installed.find(v => v.name === 'Samantha')?.name
  || installed.find(v => v.lang === 'en_US')?.name;
if (!VOICE) { console.error('No English voice found.'); process.exit(1); }
console.log(`Voice: ${VOICE}${/Premium|Enhanced/.test(VOICE) ? '' : '  (tip: install a Premium voice for better quality)'}`);

// ---------- What to say ----------
// Spoken form when the written form would be read oddly in isolation.
const PRONOUNCE = { a: 'uh', the: 'thuh', us: 'uss', am: 'am.', I: 'eye', 'yo-yo': 'yo yo', ox: 'ox.' };

const texts = new Set(allLines());
for (const l of LESSONS) for (const w of l.w) texts.add(w);
for (const w of Object.keys(HEART)) texts.add(w);
for (const w of Object.keys(PIC)) texts.add(w);
for (const w of Object.keys(BANK)) texts.add(w);
for (const g of Object.values(GRAPHEMES)) texts.add(g.key);
for (const s of STICKERS) texts.add(s.name);

// Letter sounds. Computer voices can't say isolated phonemes, so each sound is
// made one of these ways and checked automatically:
//   vowel  — say a short word (at, it, up…) and keep only the vowel before the stop
//   onset  — say a word slowly and keep only the consonant before the vowel (f in "fun")
//   coda   — say a word and keep only the consonants after the vowel (ks in "ox")
//   hold   — a held sound ("mmm"); candidates are tried until one is a single continuous sound
//   clip   — a stop: say "tuh" and keep just the burst plus a sliver of vowel
//   name   — long vowels are just the letter name (a_e → "A")
const SOUNDS = {
  a: { vowel: 'at' }, e: { vowel: 'Ed' }, i: { vowel: 'it' }, o: { vowel: 'odd' }, u: { vowel: 'up' },
  m: { hold: ['mmmm', 'mmm'] }, n: { hold: ['nnnn', 'nnn'] }, s: { hold: ['sssss', 'sss', 'ss'] },
  v: { hold: ['vvvv', 'vvv'] }, z: { hold: ['zzzz', 'zzz'] }, l: { hold: ['llll', 'lll'] },
  r: { hold: ['rrrr', 'errr', 'rrr'] }, sh: { onset: 'shop', loud: 0.7, stretch: 500 }, f: { onset: 'fun', stretch: 450 },
  ff: { same: 'f' }, ll: { same: 'l' }, ss: { same: 's' }, zz: { same: 'z' }, ph: { same: 'f' },
  th: { onset: 'thin', stretch: 400 }, th_v: { onset: 'this', loud: 0.7, stretch: 350 },
  t: { clip: 'tuh' }, p: { clip: 'puh' }, k: { clip: 'kuh' }, c: { same: 'k' }, ck: { same: 'k' },
  b: { clip: 'buh' }, d: { clip: 'duh' }, g: { clip: 'guh' }, j: { clip: 'juh' }, ch: { clip: 'chuh' },
  h: { clip: 'huh' }, w: { clip: 'wuh' }, wh: { same: 'w' }, y: { clip: 'yuh' },
  x: { coda: 'ox' }, qu: { clip: 'kwuh', ms: 300 }, ng: { say: 'ing' }, nk: { say: 'ink' },
  all: { say: 'all' }, oll: { say: 'ole' }, ull: { say: 'ull' },
  a_e: { say: 'A', rate: 160 }, i_e: { say: 'I', rate: 160 }, o_e: { say: 'O', rate: 160 }, u_e: { say: 'U', rate: 160 }, e_e: { say: 'E', rate: 160 },
};

// ---------- Audio helpers ----------
mkdirSync(OUT, { recursive: true });
mkdirSync(dirname(MANIFEST), { recursive: true });
rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });
let tmpN = 0;

async function synth(text, rate = RATE) {
  const base = join(TMP, String(tmpN++));
  await run('say', ['-v', VOICE, '-r', String(rate), '-o', base + '.aiff', text]);
  await run('afconvert', ['-f', 'WAVE', '-d', `LEI16@${SR}`, '-c', '1', base + '.aiff', base + '.wav']);
  const buf = readFileSync(base + '.wav');
  let off = 12;
  while (off < buf.length) {
    const id = buf.toString('ascii', off, off + 4), size = buf.readUInt32LE(off + 4);
    if (id === 'data') {
      const n = size / 2, out = new Float32Array(n);
      for (let i = 0; i < n; i++) out[i] = buf.readInt16LE(off + 8 + i * 2) / 32768;
      return out;
    }
    off += 8 + size;
  }
  throw new Error('no data chunk for ' + text);
}

const FRAME = Math.round(SR * 0.01);
function envelope(x) {
  const e = [];
  for (let i = 0; i < x.length; i += FRAME) {
    let s = 0;
    for (let j = i; j < Math.min(x.length, i + FRAME); j++) s += x[j] * x[j];
    e.push(Math.sqrt(s / FRAME));
  }
  return e;
}
/** Continuous loud regions (frames), merging gaps shorter than 60 ms. */
function segments(e, rel = 0.12) {
  const max = Math.max(...e), th = max * rel, segs = [];
  for (let i = 0; i < e.length; i++) {
    if (e[i] < th) continue;
    const last = segs[segs.length - 1];
    if (last && i - last[1] <= 6) last[1] = i; else segs.push([i, i]);
  }
  return segs;
}
function slice(x, a, b) { return x.slice(Math.max(0, a * FRAME), Math.min(x.length, b * FRAME)); }
function fade(x, inMs = 8, outMs = 30) {
  const y = Float32Array.from(x), fi = Math.round(SR * inMs / 1000), fo = Math.round(SR * outMs / 1000);
  for (let i = 0; i < fi && i < y.length; i++) y[i] *= i / fi;
  for (let i = 0; i < fo && i < y.length; i++) y[y.length - 1 - i] *= i / fo;
  return y;
}
function normalize(x, peak = 0.9) {
  let m = 0;
  for (const v of x) m = Math.max(m, Math.abs(v));
  return m ? x.map(v => v * peak / m) : x;
}
/** Lengthen a noise-like sound (f, sh, th) by crossfading copies of its middle. */
function stretch(x, ms) {
  const target = Math.round(SR * ms / 1000);
  if (x.length >= target) return x;
  const q = Math.floor(x.length / 4), mid = x.slice(q, x.length - q), xf = Math.min(Math.round(SR * 0.02), Math.floor(mid.length / 3));
  let out = Array.from(x.slice(0, x.length - q));
  while (out.length + q < target) {
    for (let i = 0; i < xf; i++) out[out.length - xf + i] = out[out.length - xf + i] * (1 - i / xf) + mid[i] * (i / xf);
    out = out.concat(Array.from(mid.slice(xf)));
  }
  return Float32Array.from(out.concat(Array.from(x.slice(x.length - q))));
}

/** Trim leading/trailing silence, keeping a little padding. */
function trim(x) {
  const e = envelope(x), segs = segments(e, 0.02);
  if (!segs.length) return x;
  return fade(slice(x, Math.max(0, segs[0][0] - 3), segs[segs.length - 1][1] + 5), 5, 20);
}

async function encode(x, file) {
  const base = join(TMP, String(tmpN++));
  const data = Buffer.alloc(x.length * 2);
  x.forEach((v, i) => data.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(v * 32767))), i * 2));
  const hdr = Buffer.alloc(44);
  hdr.write('RIFF', 0); hdr.writeUInt32LE(36 + data.length, 4); hdr.write('WAVE', 8); hdr.write('fmt ', 12);
  hdr.writeUInt32LE(16, 16); hdr.writeUInt16LE(1, 20); hdr.writeUInt16LE(1, 22); hdr.writeUInt32LE(SR, 24);
  hdr.writeUInt32LE(SR * 2, 28); hdr.writeUInt16LE(2, 32); hdr.writeUInt16LE(16, 34); hdr.write('data', 36); hdr.writeUInt32LE(data.length, 40);
  writeFileSync(base + '.wav', Buffer.concat([hdr, data]));
  await run('afconvert', ['-f', 'm4af', '-d', 'aac', '-b', '40000', base + '.wav', file]);
}

// ---------- Letter sounds ----------
async function makeSound(id, spec) {
  if (spec.vowel) {
    const x = await synth(spec.vowel, 120), e = envelope(x), segs = segments(e, 0.25);
    const [a] = segs[0];
    const peak = e.indexOf(Math.max(...e.slice(a, segs[0][1] + 1)), a);
    let b = peak;
    while (b < e.length && e[b] > e[peak] * 0.3) b++;
    return { audio: fade(slice(x, Math.max(0, a - 2), b), 10, 60), note: `vowel of "${spec.vowel}"` };
  }
  if (spec.onset) {
    const x = await synth(spec.onset, 70), e = envelope(x), quiet = segments(e, 0.02), loud = segments(e, spec.loud ?? 0.35);
    const c = slice(x, Math.max(0, quiet[0][0] - 2), loud[0][0]);
    return { audio: fade(spec.stretch ? stretch(c, spec.stretch) : c, 10, 60), note: `onset of "${spec.onset}"` };
  }
  if (spec.coda) {
    const x = await synth(spec.coda, 90), e = envelope(x), quiet = segments(e, 0.02), loud = segments(e, 0.35);
    const vowelEnd = loud[0][1];
    return { audio: fade(slice(x, vowelEnd + 1, quiet[quiet.length - 1][1] + 3), 15, 40), note: `coda of "${spec.coda}"` };
  }
  if (spec.hold) {
    for (const cand of spec.hold) {
      const x = await synth(cand, 100), segs = segments(envelope(x), 0.12);
      const dur = segs.length ? (segs[segs.length - 1][1] - segs[0][0]) * 10 : 0;
      if (segs.length === 1 && dur >= 250) return { audio: fade(trim(x).slice(0, Math.round(SR * 0.75)), 10, 120), note: `held "${cand}" ${dur}ms` };
    }
    return { audio: trim(await synth(spec.hold[0], 100)), note: `held "${spec.hold[0]}" (FAILED continuity check)` };
  }
  if (spec.clip) {
    const x = trim(await synth(spec.clip, 130));
    const ms = spec.ms || 190;
    return { audio: fade(x.slice(0, Math.round(SR * ms / 1000)), 3, 70), note: `clip of "${spec.clip}" ${ms}ms` };
  }
  return { audio: trim(await synth(spec.say, spec.rate ?? 110)), note: `"${spec.say}"` };
}

// ---------- Run ----------
const old = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : null;
const reuse = !FORCE && old?.voice === VOICE && old?.rate === RATE;
const manifest = { voice: VOICE, rate: RATE, clips: {}, sounds: {} };

async function pool(items, n, fn) {
  let i = 0, done = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (i < items.length) {
      const item = items[i++];
      await fn(item);
      if (++done % 100 === 0) console.log(`  ${done}/${items.length}`);
    }
  }));
}

const jobs = [...texts].map(t => ({ t, key: slug(t) }));
console.log(`Recording ${jobs.length} phrases…`);
await pool(jobs, 6, async ({ t, key }) => {
  const file = join(OUT, key + '.m4a');
  manifest.clips[key] = 1;
  if (reuse && old.clips?.[key] && existsSync(file)) return;
  const x = normalize(trim(await synth(PRONOUNCE[t] ?? t)), 0.85);
  await encode(x, file);
});

console.log('Letter sounds:');
const ids = Object.keys(GRAPHEMES);
const made = {};
for (const id of ids) {
  const spec = SOUNDS[id];
  if (!spec) { console.log(`  ${id}: no spec, using speech`); continue; }
  if (spec.same) continue;
  const { audio, note } = await makeSound(id, spec);
  await encode(normalize(audio, 0.85), join(OUT, `snd-${id}.m4a`));
  made[id] = note;
  manifest.sounds[id] = `snd-${id}`;
  console.log(`  ${id.padEnd(4)} ${(audio.length / SR * 1000).toFixed(0).padStart(4)}ms  ${note}`);
}
for (const id of ids) if (SOUNDS[id]?.same) manifest.sounds[id] = `snd-${SOUNDS[id].same}`;

// Drop files no longer referenced.
const keep = new Set([...Object.keys(manifest.clips), ...Object.values(manifest.sounds)].map(k => k + '.m4a'));
for (const f of readdirSync(OUT)) if (f.endsWith('.m4a') && !keep.has(f)) rmSync(join(OUT, f));

writeFileSync(MANIFEST, JSON.stringify(manifest) + '\n');
rmSync(TMP, { recursive: true, force: true });
console.log(`Done: ${Object.keys(manifest.clips).length} phrases, ${Object.keys(manifest.sounds).length} letter sounds → public/voice/`);
