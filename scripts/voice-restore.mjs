#!/usr/bin/env node
// Refills voice-cache/ from your ElevenLabs history: downloads the narrator's past recordings
// (matched by voice, model and exact text) instead of paying to record them again.
// Needs an ELEVENLABS_KEY with "Speech history: read" access.
//
//   node scripts/voice-restore.mjs
//   npm run voice -- --force      # then rebuild public/voice from the cache
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { EL_VOICE, EL_MODEL, cachePath } from './voice-cache.mjs';
import { allSends } from './voice-plan.mjs';

const KEY = process.env.ELEVENLABS_KEY;
if (!KEY) { console.error('Set ELEVENLABS_KEY'); process.exit(1); }
const API = 'https://api.elevenlabs.io/v1';

async function get(url) {
  for (let attempt = 0; ; attempt++) {
    const r = await fetch(url, { headers: { 'xi-api-key': KEY } });
    if (r.ok) return r;
    const body = (await r.text()).slice(0, 300);
    if (r.status === 429 && attempt < 6) { await new Promise(res => setTimeout(res, 2000 * (attempt + 1))); continue; }
    console.error(`ElevenLabs ${r.status}: ${body}`);
    if (r.status === 401 || r.status === 403) console.error('Check that the key has "Speech history: read" access.');
    process.exit(1);
  }
}

const needed = new Set(allSends());
const missing = () => [...needed].filter(t => !existsSync(cachePath(t)));
console.log(`${needed.size} recordings in the plan; ${missing().length} not in the local cache.`);

// --inspect: show what history entries look like (fields, models, voices, sample texts), then stop.
if (process.argv.includes('--inspect')) {
  const page = await (await get(`${API}/history?page_size=1000`)).json();
  const items = page.history ?? [];
  const count = key => Object.entries(items.reduce((m, i) => ({ ...m, [i[key]]: (m[i[key]] ?? 0) + 1 }), {}));
  console.log(`${items.length} items on the first page (has_more: ${page.has_more})`);
  console.log('fields:', Object.keys(items[0] ?? {}).join(', '));
  console.log('by model_id:', count('model_id'));
  console.log('by voice_id:', count('voice_id'));
  for (const i of items.slice(0, 6)) console.log('  ', JSON.stringify({ voice_id: i.voice_id, model_id: i.model_id, text: i.text, date: i.date_unix }));
  const ours = [...needed];
  const near = items.filter(i => ours.some(t => t.replace(/\[[^\]]*\]\s*/g, '') === String(i.text).replace(/\[[^\]]*\]\s*/g, '').trim()));
  console.log(`${near.length} items match a needed text once [tags] are ignored`);
  process.exit(0);
}

// v4 recordings come from ElevenLabs' Text to Dialogue system: their history entries have no
// top-level text or voice_id; those live in `dialogue` (one line per speaker).
function textAndVoice(item) {
  if (item.text != null) return { text: item.text, voice: item.voice_id };
  const lines = Array.isArray(item.dialogue) ? item.dialogue : [];
  if (lines.length !== 1) return { text: null, voice: null };
  const l = lines[0];
  return { text: l.text ?? l.input ?? null, voice: l.voice_id ?? l.voiceId ?? null };
}

// Walk the history (newest first) and keep the most recent recording of each text we need.
const wanted = new Set(missing());
const found = new Map(); // text -> history item id
let after = null, pages = 0, scanned = 0, firstOfModel = null;
for (;;) {
  // No voice filter: v4 entries have no top-level voice_id, so filtering would hide them.
  const q = new URLSearchParams({ page_size: '1000' });
  if (after) q.set('start_after_history_item_id', after);
  const page = await (await get(`${API}/history?${q}`)).json();
  pages++;
  for (const item of page.history ?? []) {
    scanned++;
    if (item.model_id !== EL_MODEL) continue;
    firstOfModel ??= item;
    const { text, voice } = textAndVoice(item);
    if (voice !== EL_VOICE) continue;
    if (wanted.has(text) && !found.has(text)) found.set(text, item.history_item_id);
  }
  if (!page.has_more || !page.last_history_item_id) break;
  after = page.last_history_item_id;
}
console.log(`Scanned ${scanned} history items (${pages} page${pages === 1 ? '' : 's'}); ${found.size} match recordings we need.`);
if (!found.size && firstOfModel) {
  console.log(`No matches. Here is one ${EL_MODEL} entry's dialogue field, to fix the matching:`);
  console.log(JSON.stringify(firstOfModel.dialogue, null, 2)?.slice(0, 1500));
  process.exit(1);
}

// Download them, two at a time.
const items = [...found];
let done = 0;
await Promise.all([0, 1].map(async () => {
  while (items.length) {
    const [text, id] = items.shift();
    const audio = Buffer.from(await (await get(`${API}/history/${id}/audio`)).arrayBuffer());
    const file = cachePath(text);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, audio);
    if (++done % 50 === 0) console.log(`  ${done}/${found.size}`);
  }
}));

const still = missing();
const chars = still.reduce((n, t) => n + t.length, 0);
console.log(`Restored ${done} recordings into voice-cache/.`);
if (still.length) {
  console.log(`${still.length} still need recording (~${chars} characters), e.g.: ${still.slice(0, 8).map(t => JSON.stringify(t)).join(', ')}`);
}
console.log('Next: npm run voice -- --force   (rebuilds public/voice from the cache; only records what is still missing)');
