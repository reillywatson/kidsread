#!/usr/bin/env node
// Pre-records every spoken line, word, picture name and letter sound with ElevenLabs
// (narrator "Laura" on eleven_v4), trims silence, and encodes AAC (.m4a) into public/voice/.
// Writes src/voice/manifest.json.
//
//   npm run voice                  # record what's new or changed
//   npm run voice -- --dry         # show what would be recorded and roughly how many characters
//   npm run voice -- --offline     # rebuild from the local audio cache only; never calls the API
//   npm run voice -- --force       # re-process everything (still uses the local cache)
//   npm run voice -- --audition    # also render every letter-sound option into voice-audition/,
//                                  # to compare and pick on /voices.html (picks: scripts/sound-picks.json)
//   ELEVEN_VOICE=<id> ELEVEN_MODEL=eleven_v4 npm run voice
//
// Every raw recording from ElevenLabs is kept in voice-cache/ (git-ignored), keyed by voice, model
// and exact text, so re-processing never pays twice. scripts/voice-restore.mjs refills that cache
// from your ElevenLabs history.
//
// Every clip is the narrator's voice: nothing ever falls back to another voice. A letter sound that
// can't be made is left out and reported (the voice test then fails), and its rejected attempts are
// saved in voice-rejects/ to listen to.
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdirSync, readFileSync, writeFileSync, existsSync, rmSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { GRAPHEMES } from '../src/data/curriculum.ts';
import { slug } from '../src/lines.ts';
import { LABEL, EL_VOICE, EL_MODEL, cachePath } from './voice-cache.mjs';
import { uniqueTexts, spoken, SAID_AS_SOUND, SOUND_OPTIONS, pickedSounds, soundSources, describe } from './voice-plan.mjs';

const run = promisify(execFile);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public/voice');
const REJECTS = join(ROOT, 'voice-rejects');
const MANIFEST = join(ROOT, 'src/voice/manifest.json');
const TMP = join(tmpdir(), 'kidsread-voice');
const FORCE = process.argv.includes('--force');
const DRY = process.argv.includes('--dry');
const OFFLINE = process.argv.includes('--offline');
const AUDITION = process.argv.includes('--audition');
const AUDITION_DIR = join(ROOT, 'voice-audition');
const PICKS_FILE = join(ROOT, 'scripts/sound-picks.json');
const PICKS = existsSync(PICKS_FILE) ? JSON.parse(readFileSync(PICKS_FILE, 'utf8')) : {};
const SOUNDS = pickedSounds(PICKS);
const SR = 32000;

const KEY = process.env.ELEVENLABS_KEY;
if (!KEY && !DRY && !OFFLINE) { console.error('Set ELEVENLABS_KEY (the narrator is recorded with ElevenLabs), or use --offline.'); process.exit(1); }
console.log(`Voice: ${LABEL}${DRY ? '  (dry run)' : OFFLINE ? '  (offline: local cache only)' : ''}`);

// ---------- Audio helpers ----------
let tmpN = 0;
const tmp = () => join(TMP, String(tmpN++));

async function toSamples(file) {
  const wav = tmp() + '.wav';
  await run('afconvert', ['-f', 'WAVE', '-d', `LEI16@${SR}`, '-c', '1', file, wav]);
  const buf = readFileSync(wav);
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
  throw new Error('no audio data in ' + file);
}

class Fatal extends Error {}
const sleep = ms => new Promise(r => setTimeout(r, ms));
let charsSent = 0, cacheHits = 0;

/** The narrator saying `text`, as samples: from the local cache if we have it, else from ElevenLabs. */
async function synth(text) {
  const cached = cachePath(text);
  if (existsSync(cached)) { cacheHits++; return toSamples(cached); }
  if (OFFLINE) throw new Fatal(`not in the local cache: "${text}"`);
  for (let attempt = 0; ; attempt++) {
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${EL_VOICE}?output_format=mp3_44100_128`, {
      method: 'POST',
      headers: { 'xi-api-key': KEY, 'content-type': 'application/json', accept: 'audio/mpeg' },
      body: JSON.stringify({ text, model_id: EL_MODEL }),
    });
    if (r.ok) {
      charsSent += text.length;
      mkdirSync(dirname(cached), { recursive: true });
      writeFileSync(cached, Buffer.from(await r.arrayBuffer()));
      return toSamples(cached);
    }
    const body = (await r.text()).slice(0, 300);
    if (r.status === 429 && attempt < 6) { await sleep(2000 * (attempt + 1)); continue; }
    if (r.status === 401 || r.status === 402 || r.status === 403) throw new Fatal(`ElevenLabs ${r.status}: ${body}`);
    throw new Error(`ElevenLabs ${r.status}: ${body}`);
  }
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
  const wav = tmp() + '.wav';
  const data = Buffer.alloc(x.length * 2);
  x.forEach((v, i) => data.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(v * 32767))), i * 2));
  const hdr = Buffer.alloc(44);
  hdr.write('RIFF', 0); hdr.writeUInt32LE(36 + data.length, 4); hdr.write('WAVE', 8); hdr.write('fmt ', 12);
  hdr.writeUInt32LE(16, 16); hdr.writeUInt16LE(1, 20); hdr.writeUInt16LE(1, 22); hdr.writeUInt32LE(SR, 24);
  hdr.writeUInt32LE(SR * 2, 28); hdr.writeUInt16LE(2, 32); hdr.writeUInt16LE(16, 34); hdr.write('data', 36); hdr.writeUInt32LE(data.length, 40);
  writeFileSync(wav, Buffer.concat([hdr, data]));
  await run('afconvert', ['-f', 'm4af', '-d', 'aac', '-b', '48000', wav, file]);
}

// ---------- Letter sounds ----------
/** Returns { audio, note }, or null if the sound didn't pass its check. */
async function makeSound(id, spec) {
  if (spec.tries) {
    for (const t of spec.tries) {
      const made = await makeSound(id, t);
      if (made) return made;
    }
    return null;
  }
  if (spec.vowel) {
    const x = await synth(spec.vowel), e = envelope(x), segs = segments(e, 0.25);
    const [a] = segs[0];
    const peak = e.indexOf(Math.max(...e.slice(a, segs[0][1] + 1)), a);
    let b = peak;
    while (b < e.length && e[b] > e[peak] * 0.3) b++;
    return { audio: fade(slice(x, Math.max(0, a - 2), b), 10, 60), note: `vowel of "${spec.vowel}"` };
  }
  if (spec.onset) {
    const x = await synth(spec.onset), e = envelope(x), quiet = segments(e, 0.02), loud = segments(e, spec.loud ?? 0.35);
    const c = slice(x, Math.max(0, quiet[0][0] - 2), loud[0][0]);
    return { audio: fade(spec.stretch ? stretch(c, spec.stretch) : c, 10, 60), note: `onset of "${spec.onset}"` };
  }
  if (spec.coda) {
    // Start once the vowel has closed off (energy well below its peak), so none of it remains.
    const x = await synth(spec.coda), e = envelope(x), quiet = segments(e, 0.02);
    const peak = e.indexOf(Math.max(...e));
    let start = peak;
    while (start < e.length - 1 && e[start] > e[peak] * 0.1) start++;
    return { audio: fade(slice(x, start, quiet[quiet.length - 1][1] + 3), 10, 40), note: describe(spec) };
  }
  if (spec.rime) {
    const x = trim(await synth(spec.rime)), e = envelope(x), max = Math.max(...e);
    const v = e.findIndex((v, i) => i > 1 && v > max * 0.4);
    return { audio: fade(slice(x, Math.max(0, v - 2), e.length), 15, 60), note: describe(spec) };
  }
  if (spec.stop) {
    // The consonant burst plus `keep` ms of the vowel, measured from where the vowel starts.
    const x = trim(await synth(spec.stop)), e = envelope(x), max = Math.max(...e);
    const v = e.findIndex((v, i) => i > 1 && v > max * 0.45);
    return { audio: fade(slice(x, 0, Math.max(v, 3) + Math.round(spec.keep / 10)), 3, 50), note: describe(spec) };
  }
  if (spec.hold) {
    for (const cand of spec.hold) {
      const x = await synth(cand), segs = segments(envelope(x), 0.12);
      const dur = segs.length ? (segs[segs.length - 1][1] - segs[0][0]) * 10 : 0;
      if (segs.length === 1 && dur >= 250) return { audio: fade(trim(x).slice(0, Math.round(SR * (spec.max ?? 750) / 1000)), 10, 90), note: `${describe(spec)} (made from "${cand}")` };
      // Keep the rejected attempt so it can be listened to.
      mkdirSync(REJECTS, { recursive: true });
      await encode(normalize(trim(x), 0.85), join(REJECTS, `${id}-${slug(cand)}.m4a`));
      console.log(`  ${id.padEnd(4)} rejected "${cand}": ${segs.length} separate sounds over ${dur}ms (saved in voice-rejects/)`);
    }
    return null;
  }
  if (spec.clip) {
    const x = trim(await synth(spec.clip));
    const ms = spec.ms || 190;
    return { audio: fade(x.slice(0, Math.round(SR * ms / 1000)), 3, 70), note: `clip of "${spec.clip}" ${ms}ms` };
  }
  const x = trim(await synth(spec.say));
  return { audio: spec.max ? fade(x.slice(0, Math.round(SR * spec.max / 1000)), 5, 80) : x, note: describe(spec) };
}

// ---------- Plan ----------
const old = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : null;
// Each clip is tagged "<voice>|<text sent>", so any change to voice, model or wording re-makes it.
const cacheKey = text => `${LABEL}|${text}`;
const fresh = (prev, key, file) => !FORCE && prev === key && existsSync(file);

// A word said as a letter sound is made by that sound's recipe (following any `same`), and is
// re-made whenever the recipe changes.
const soundSpec = id => (SOUNDS[id]?.same ? SOUNDS[SOUNDS[id].same] : SOUNDS[id]);
const jobs = uniqueTexts().map(t => ({ t, key: slug(t), file: join(OUT, slug(t) + '.m4a') })).map(j => {
  const spec = SAID_AS_SOUND[j.t] && soundSpec(SAID_AS_SOUND[j.t]);
  return spec ? { ...j, spec, cache: cacheKey(JSON.stringify(spec)) } : { ...j, send: spoken(j.t), cache: cacheKey(spoken(j.t)) };
});
const todo = jobs.filter(j => !fresh(old?.clips?.[j.key], j.cache, j.file));
const soundIds = Object.keys(GRAPHEMES).filter(id => SOUNDS[id] && !SOUNDS[id].same);
const soundTodo = soundIds.filter(id => !fresh(old?.sounds?.[id]?.cache, cacheKey(JSON.stringify(SOUNDS[id])), join(OUT, `snd-${id}.m4a`)));

const optionLists = Object.entries(SOUND_OPTIONS).filter(([, o]) => Array.isArray(o) && o.length > 1);
const auditionSources = AUDITION ? optionLists.flatMap(([, o]) => o.flatMap(soundSources)) : [];
const uncached = [...todo.flatMap(j => (j.spec ? soundSources(j.spec) : [j.send])), ...soundTodo.flatMap(id => soundSources(SOUNDS[id])), ...auditionSources]
  .filter(t => !existsSync(cachePath(t)));
const estimate = [...new Set(uncached)].reduce((n, t) => n + t.length, 0);
console.log(`${todo.length} of ${jobs.length} phrases and ${soundTodo.length} of ${soundIds.length} letter sounds need (re)making; ` +
  `${new Set(uncached).size} recordings aren't cached yet (up to ~${estimate} characters)`);

if (DRY) {
  for (const t of [...new Set(uncached)].slice(0, 25)) console.log(`  ${t}`);
  if (new Set(uncached).size > 25) console.log(`  … and ${new Set(uncached).size - 25} more`);
  process.exit(0);
}

// ---------- Run ----------
mkdirSync(OUT, { recursive: true });
mkdirSync(dirname(MANIFEST), { recursive: true });
rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });

// Start from the old manifest so an interrupted run still leaves every clip playable — but only
// clips in this voice: anything else is dropped rather than mixed in.
const manifest = { engine: LABEL, clips: {}, sounds: {} };
const ours = cache => typeof cache === 'string' && cache.startsWith(`${LABEL}|`);
for (const j of jobs) if (ours(old?.clips?.[j.key]) && existsSync(j.file)) manifest.clips[j.key] = old.clips[j.key];
for (const id of soundIds) {
  const prev = old?.sounds?.[id];
  if (ours(prev?.cache) && existsSync(join(OUT, `snd-${id}.m4a`))) manifest.sounds[id] = prev;
}
const save = () => writeFileSync(MANIFEST, JSON.stringify(manifest) + '\n');

async function pool(items, n, fn) {
  let i = 0, done = 0, fatal = null;
  await Promise.all(Array.from({ length: n }, async () => {
    while (i < items.length && !fatal) {
      const item = items[i++];
      try { await fn(item); } catch (e) { if (e instanceof Fatal) fatal = e; else console.log(`  ! ${item.t ?? item}: ${e.message}`); }
      if (++done % 50 === 0) { console.log(`  ${done}/${items.length}`); save(); }
    }
  }));
  if (fatal) { save(); console.error(`\nStopped: ${fatal.message}\nProgress so far is saved; re-run to continue.`); process.exit(1); }
}

// ElevenLabs' free tier allows 2 requests at once.
console.log(`Making ${todo.length} phrases…`);
await pool(todo, 2, async j => {
  const made = j.spec && await makeSound(j.t, j.spec);
  if (j.spec && !made) throw new Error('its letter-sound recipe failed');
  const x = normalize(made ? made.audio : trim(await synth(j.send)), 0.85);
  await encode(x, j.file);
  manifest.clips[j.key] = j.cache;
});

console.log('Letter sounds:');
const failed = [];
await pool(soundTodo, 1, async id => {
  const spec = SOUNDS[id];
  const made = await makeSound(id, spec);
  if (!made) {
    failed.push(id);
    delete manifest.sounds[id];
    console.log(`  ${id.padEnd(4)} FAILED — no recording made`);
    return;
  }
  await encode(normalize(made.audio, 0.85), join(OUT, `snd-${id}.m4a`));
  manifest.sounds[id] = { file: `snd-${id}`, cache: cacheKey(JSON.stringify(spec)) };
  console.log(`  ${id.padEnd(4)} ${(made.audio.length / SR * 1000).toFixed(0).padStart(4)}ms  ${made.note}`);
});
for (const id of Object.keys(GRAPHEMES)) {
  const spec = SOUNDS[id];
  if (spec?.same) {
    if (manifest.sounds[spec.same]) manifest.sounds[id] = { file: `snd-${spec.same}`, cache: 'same' };
    else delete manifest.sounds[id];
  }
}

// Drop files no longer referenced (including any recordings in another voice).
const keep = new Set([...Object.keys(manifest.clips), ...Object.values(manifest.sounds).map(s => s.file)].map(k => k + '.m4a'));
for (const f of readdirSync(OUT)) if (f.endsWith('.m4a') && !keep.has(f)) rmSync(join(OUT, f));

save();

// ---------- Audition: every option for sounds that have several, to compare on /voices.html ----------
if (AUDITION) {
  console.log('Audition options:');
  mkdirSync(AUDITION_DIR, { recursive: true });
  const index = [];
  for (const [id, opts] of optionLists) {
    const options = [];
    for (let n = 0; n < opts.length; n++) {
      const file = `snd-${id}-${n}`;
      try {
        const made = await makeSound(id, opts[n]);
        if (made) await encode(normalize(made.audio, 0.85), join(AUDITION_DIR, file + '.m4a'));
        options.push({ n, desc: describe(opts[n]), file: made ? file : null });
      } catch (e) {
        if (e instanceof Fatal) { console.error(`Stopped: ${e.message}`); process.exit(1); }
        options.push({ n, desc: describe(opts[n]), file: null });
      }
    }
    index.push({ id, picked: PICKS[id] ?? 0, options });
    console.log(`  ${id.padEnd(4)} ${options.map(o => (o.file ? '✓' : '✗')).join(' ')}`);
  }
  writeFileSync(join(AUDITION_DIR, 'index.json'), JSON.stringify(index, null, 1) + '\n');
  console.log('Compare and pick on /voices.html (npm run dev), then run `npm run voice -- --offline` to apply.');
}
rmSync(TMP, { recursive: true, force: true });
console.log(`Done: ${Object.keys(manifest.clips).length} phrases, ${Object.keys(manifest.sounds).length} letter sounds → public/voice/` +
  `  (${cacheHits} from the local cache, ${charsSent} characters sent)`);
if (failed.length) {
  console.error(`\nCouldn't make these letter sounds in the narrator's voice: ${failed.join(', ')}.` +
    '\nThey are left out (the game stays silent for them) — listen to voice-rejects/, then adjust their recipe in' +
    '\nSOUNDS in scripts/voice.mjs, or record them yourself in the grown-up area.');
  process.exit(1);
}
