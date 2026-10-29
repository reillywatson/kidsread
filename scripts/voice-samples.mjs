#!/usr/bin/env node
// Generates a side-by-side comparison of ElevenLabs voices for the narrator, so we can pick
// by ear. Writes voice-samples/ (git-ignored): mp3s plus index.html — open it in a browser.
//
//   ELEVENLABS_KEY=... node scripts/voice-samples.mjs
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { slug } from '../src/lines.ts';

const KEY = process.env.ELEVENLABS_KEY;
if (!KEY) { console.error('Set ELEVENLABS_KEY'); process.exit(1); }

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'voice-samples');
mkdirSync(OUT, { recursive: true });

const VOICES = [
  ['cgSgspJ2msm6clMCkdW9', 'Jessica', 'playful, bright, warm'],
  ['FGY2WhTYpPnrIDTdsKH5', 'Laura', 'enthusiastic, quirky'],
  ['XrExE9yKIg1WjnnlVkGX', 'Matilda', 'upbeat educator'],
  ['hpp4J3VqNfWAUOO0d1Us', 'Bella', 'bright, warm educator'],
  ['TX3LPaxmHKxFdv7VOQHJ', 'Liam', 'energetic'],
  ['IKne3meq5aSn9XLyUdCD', 'Charlie', 'energetic, Australian'],
];
const MODELS = [
  ['eleven_v4', 'v4 (newest, expressive)'],
  ['eleven_v3', 'v3 (expressive)'],
  ['eleven_multilingual_v2', 'Multilingual v2 (steady)'],
];
// [tagged text for v3, plain text, what it's testing]. Plain text must match a line the
// game already has, so the current macOS recording can be shown alongside.
const LINES = [
  ['[excited] Zombies are coming! Listen for the sound, and tap the zombie with that letter!',
    'Zombies are coming! Listen for the sound, and tap the zombie with that letter!', 'Game intro'],
  ['[excited] Great job!', 'Great job!', 'Praise'],
  ['[warmly] Read the word. Tap the letters to hear their sounds.', 'Read the word. Tap the letters to hear their sounds.', 'Instruction'],
  ['cat', 'cat', 'Word'],
  // Short vowels (the sounds that matter most for reading), a digraph, a blend, silent e,
  // and "the" (often read as "thee" on its own).
  ...['sit', 'bed', 'pot', 'cup', 'ship', 'frog', 'cake', 'the'].map(w => [w, w, 'Word']),
];
const PHRASES = LINES.map((l, i) => i).filter(i => LINES[i][2] !== 'Word');
const WORDS = LINES.map((l, i) => i).filter(i => LINES[i][2] === 'Word');

async function tts(voice, model, text, file) {
  if (existsSync(file)) return 'cached';
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': KEY, 'content-type': 'application/json', accept: 'audio/mpeg' },
    body: JSON.stringify({ text, model_id: model }),
  });
  if (!r.ok) throw new Error(`${r.status} ${(await r.text()).slice(0, 300)}`);
  writeFileSync(file, Buffer.from(await r.arrayBuffer()));
  return 'ok';
}

let chars = 0;
const jobs = [];
for (const [vid, vname] of VOICES) for (const [mid] of MODELS) LINES.forEach(([tagged, plain], i) => {
  // v3 and v4 understand delivery tags like [excited]; Multilingual v2 would read them aloud.
  const text = mid === 'eleven_multilingual_v2' ? plain : tagged;
  jobs.push({ vid, vname, mid, text, file: join(OUT, `${vname}-${mid}-${i}.mp3`) });
});
const failures = [];
// One request at a time: the free tier allows only 2 concurrent requests, and an account
// error (e.g. access disabled) should stop the run instead of being repeated for every clip.
for (const j of jobs) {
  try {
    const s = await tts(j.vid, j.mid, j.text, j.file);
    if (s === 'ok') chars += j.text.length;
  } catch (e) {
    failures.push(`${j.vname} / ${j.mid}: ${e.message}`);
    if (/^40[13] /.test(e.message)) { console.log('\nStopping: account/permission error.'); break; }
    // An unsupported model fails the same way for every clip: don't keep asking.
    if (/^4\d\d /.test(e.message) && failures.filter(f => f.includes(`/ ${j.mid}:`)).length >= 2) {
      console.log(`\nStopping: ${j.mid} keeps failing.`); break;
    }
  }
  process.stdout.write('.');
}
console.log(`\n~${chars} characters used this run`);
if (failures.length) console.log('Failures:\n  ' + [...new Set(failures)].join('\n  '));

// ---------- Page ----------
const cell = f => (existsSync(join(OUT, f)) ? `<audio controls preload="none" src="${f}"></audio>` : '<span class="x">failed</span>');
const head = (idx) => `<tr><th></th>${idx.map(i => `<th>${LINES[i][2] === 'Word' ? `“${LINES[i][1]}”` : `${LINES[i][2]}<small>“${LINES[i][1]}”</small>`}</th>`).join('')}</tr>`;
const baseline = (idx) => `<tr><th>Current<small>macOS Samantha</small></th>${idx.map(i =>
  `<td><audio controls preload="none" src="../public/voice/${slug(LINES[i][1])}.m4a"></audio></td>`).join('')}</tr>`;
const rows = (mid, idx) => VOICES.map(([, vname, desc]) => `
  <tr><th>${vname}<small>${desc}</small></th>${idx.map(i => `<td>${cell(`${vname}-${mid}-${i}.mp3`)}</td>`).join('')}</tr>`).join('');
const table = (mid, idx) => `<table>${head(idx)}${baseline(idx)}${rows(mid, idx)}</table>`;

writeFileSync(join(OUT, 'index.html'), `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Voice Comparison</title>
<style>
  body { font: 15px/1.4 system-ui, sans-serif; margin: 24px; color: #1f2430; background: #f6f7fb; }
  h1 { font-size: 22px; } h2 { font-size: 17px; margin-top: 28px; }
  table { border-collapse: collapse; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,.06); }
  th, td { padding: 8px 10px; border-bottom: 1px solid #eceef3; text-align: left; vertical-align: middle; }
  th small { display: block; font-weight: 400; color: #6b7280; font-size: 12px; max-width: 220px; }
  audio { width: 210px; height: 34px; }
  .words audio { width: 120px; }
  .scroll { overflow-x: auto; }
  .x { color: #b3261e; }
  .note { color: #6b7280; max-width: 900px; }
</style></head><body>
<h1>Narrator voice comparison</h1>
<p class="note">Same lines in each voice. v3 gets delivery tags like [excited]; Multilingual v2 reads the plain text.
For a children's-TV host, listen for warmth and energy in the intro and praise, and clarity in the single word.</p>
${MODELS.map(([mid, mname]) => `<h2>${mname}: phrases</h2><div class="scroll">${table(mid, PHRASES)}</div>
<h2>${mname}: single words</h2><div class="scroll words">${table(mid, WORDS)}</div>`).join('')}
</body></html>
`);
console.log(`Open ${join(OUT, 'index.html')}`);
